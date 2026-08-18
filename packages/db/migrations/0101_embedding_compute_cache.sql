-- 0101_embedding_compute_cache.sql
--
-- RAG-FUNNEL-02B / EMBED-CACHE-01: the embedding *compute* cache.  This is a
-- different cache from the retrieval-hit cache (0044) and never shares its key
-- or value space.  It sits AFTER metadata review and BEFORE projection write,
-- and only reuses an identical-computation unowned float32 vector.  It never
-- decides leaf/visibility/activation and never restores/authorizes a vector
-- row: a cache hit still has to go through the caller's own projection write
-- plus metadata/source/epoch/RLS/revocation/generation validation.
--
-- PostgreSQL is the authoritative truth for the durable fill intent + cost
-- reservation + dispatch slot; Redis is only a thin value store + merge lock.
-- A cached value that fails HMAC/dimension/finite validation is *pollution*,
-- not a miss: it must not be written to projection, must not activate a
-- generation, and must not trigger a second provider send.
--
-- cache_key = HMAC(scope + exactRecipeDigest + SHA-256(actualCanonicalProviderInputBytes))
-- is the only identity.  generationId / route / owner / tenant / raw content /
-- a truncated hash never enter it.  First phase only allows scope
-- 'global-approved-qbank' (private/org corpus read+write = 0).  The fill's
-- cost reservation amount is supplied by the caller (model-op pricing is a
-- separate surface); this table only makes the reserved→dispatched→settled/unknown
-- state machine atomic with the fill lifecycle.
--
-- No SECURITY DEFINER function is introduced here: all transition logic lives
-- in packages/db/src/qbank-embedding-compute-cache.ts under the qbank control
-- executor.  This keeps principal.ts's sealed manifest and the handoff-closure
-- proof (31 functions / 15 tables / 2 views, unexpected_definer_function=0)
-- untouched.
--
-- The only exit from a terminal `succeeded`/`succeeded_uncached` row whose Redis
-- value was evicted (or never written) is the explicit, versioned
-- reconciliation primitive (reconcileEmbeddingCompute).  It re-opens the row to
-- `claimed` with refill_version+1 and an already-expired lease, so the next
-- normal resolve reclaims and performs exactly one new provider send.  It is an
-- operator/controlled path, never automatic, and never adds an unknown→claimed
-- / succeeded→claimed automatic edge inside resolveEmbeddingCompute.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

CREATE TABLE IF NOT EXISTS embedding_fill_intent (
  cache_key text NOT NULL CHECK (cache_key ~ '^[0-9a-f]{64}$'),
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  scope text NOT NULL CHECK (scope = 'global-approved-qbank'),
  fill_id uuid NOT NULL,
  lease_token uuid,
  lease_expires_at timestamptz,
  status text NOT NULL CHECK (status IN ('claimed', 'dispatching', 'succeeded', 'succeeded_uncached', 'unknown')),
  cost_state text NOT NULL CHECK (cost_state IN ('reserved', 'dispatched', 'settled', 'unknown')),
  reserved_micro_cny bigint NOT NULL CHECK (reserved_micro_cny >= 0),
  provider text NOT NULL CHECK (char_length(provider) BETWEEN 1 AND 256),
  model text NOT NULL CHECK (char_length(model) BETWEEN 1 AND 256),
  region text NOT NULL CHECK (char_length(region) BETWEEN 1 AND 256),
  recipe_digest text NOT NULL CHECK (recipe_digest ~ '^[0-9a-f]{64}$'),
  input_digest text NOT NULL CHECK (input_digest ~ '^[0-9a-f]{64}$'),
  dimension integer NOT NULL CHECK (dimension > 0),
  error_code text CHECK (error_code IS NULL OR error_code ~ '^[A-Za-z0-9._:-]{1,120}$'),
  refill_version integer NOT NULL DEFAULT 0 CHECK (refill_version >= 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (cache_key),
  UNIQUE (fill_id),
  -- The status machine is a single cross-column CHECK so a partial UPDATE can
  -- never leave a half-legal row (e.g. a claimed row with no lease, or a
  -- dispatching row still holding a reserved cost).  cost_state is driven by
  -- status so the ledger can never drift from the fill lifecycle.  A
  -- `dispatching` row must hold a live dispatch lease (the worker-alive signal
  -- the operational sweep keys on); terminal success keeps error_code NULL
  -- while loss/unknown terminal states require a non-NULL reason.
  CHECK (
    (status = 'claimed' AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL AND cost_state = 'reserved' AND error_code IS NULL)
    OR (status = 'dispatching' AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL AND cost_state = 'dispatched' AND error_code IS NULL)
    OR (status = 'succeeded' AND lease_token IS NULL AND lease_expires_at IS NULL AND cost_state = 'settled' AND error_code IS NULL)
    OR (status = 'succeeded_uncached' AND lease_token IS NULL AND lease_expires_at IS NULL AND cost_state = 'settled' AND error_code IS NOT NULL)
    OR (status = 'unknown' AND lease_token IS NULL AND lease_expires_at IS NULL AND cost_state = 'unknown' AND error_code IS NOT NULL)
  )
);

-- Sweep target: dispatching fills whose dispatch lease expired (worker died
-- after dispatch, before settle — never an in-flight call whose lease is still
-- alive).  A partial index on the lease keeps the operational sweep cheap.
CREATE INDEX IF NOT EXISTS ix_embedding_fill_intent_dispatching
  ON embedding_fill_intent(lease_expires_at) WHERE status = 'dispatching';

-- Transactional outbox / monotonic eventSeq: every fill state transition is an
-- append-only audit event.  (cache_key, event_seq) is monotonic per fill;
-- event_seq is allocated under the same transaction that holds the fill row
-- lock (or that just won the INSERT claim), so concurrent fillers never collide.
CREATE TABLE IF NOT EXISTS embedding_fill_event (
  cache_key text NOT NULL,
  event_seq bigint NOT NULL CHECK (event_seq > 0),
  fill_id uuid NOT NULL,
  from_status text,
  to_status text NOT NULL CHECK (to_status IN ('claimed', 'dispatching', 'succeeded', 'succeeded_uncached', 'unknown')),
  cost_state text NOT NULL CHECK (cost_state IN ('reserved', 'dispatched', 'settled', 'unknown')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (cache_key, event_seq)
);

REVOKE ALL ON embedding_fill_intent FROM PUBLIC;
REVOKE ALL ON embedding_fill_event FROM PUBLIC;
-- The compute cache is filled by the generation builder under the qbank control
-- executor.  app_role gets read-only principal-scoped SELECT (RLS isolation),
-- never a write path, so a request-side principal can never manufacture a fill
-- or a cost reservation.  Events are executor append-only audit, never app_role.
GRANT SELECT, INSERT, UPDATE, DELETE ON embedding_fill_intent TO qbank_control_executor;
GRANT SELECT ON embedding_fill_intent TO app_role;
GRANT SELECT, INSERT ON embedding_fill_event TO qbank_control_executor;

ALTER TABLE embedding_fill_intent ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_fill_intent FORCE ROW LEVEL SECURITY;
ALTER TABLE embedding_fill_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_fill_event FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_embedding_fill_intent_executor ON embedding_fill_intent;
CREATE POLICY p_embedding_fill_intent_executor ON embedding_fill_intent
  FOR ALL TO qbank_control_executor USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS p_embedding_fill_intent_read ON embedding_fill_intent;
CREATE POLICY p_embedding_fill_intent_read ON embedding_fill_intent
  FOR SELECT TO app_role USING (owner_user_id = current_setting('app.principal_user', true));

DROP POLICY IF EXISTS p_embedding_fill_event_executor ON embedding_fill_event;
CREATE POLICY p_embedding_fill_event_executor ON embedding_fill_event
  FOR ALL TO qbank_control_executor USING (true) WITH CHECK (true);
