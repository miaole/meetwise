-- 0044_qbank_redis_cache_fill_intent.sql
--
-- Redis owns the qbank *result* cache and its short-lived singleflight lock.
-- This table is deliberately not a cache: it is the durable, principal-scoped
-- external-call intent needed to prevent a Redis failover/eviction/lock-expiry
-- from assigning a second billable embedding id to the same cache fill.
--
-- A successful fill is deleted only after Redis has atomically accepted its
-- fenced value. `unknown` is intentionally sticky and requires reconciliation;
-- replaying a possibly dispatched provider call would be a duplicate charge.

CREATE TABLE IF NOT EXISTS qbank_retrieval_fill_intent (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  cache_key text NOT NULL CHECK (cache_key ~ '^[0-9a-f]{64}$'),
  corpus_epoch bigint NOT NULL CHECK (corpus_epoch > 0),
  fill_id uuid NOT NULL,
  lease_token uuid,
  lease_expires_at timestamptz,
  status text NOT NULL CHECK (status IN ('claimed', 'dispatching', 'settled', 'unknown')),
  error_code text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id, cache_key, corpus_epoch),
  UNIQUE (owner_user_id, fill_id),
  CHECK ((status = 'claimed' AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL AND error_code IS NULL)
      OR status <> 'claimed')
);

CREATE INDEX IF NOT EXISTS ix_qbank_retrieval_fill_intent_incomplete
  ON qbank_retrieval_fill_intent(created_at) WHERE status IN ('dispatching', 'unknown', 'settled');

GRANT SELECT, INSERT, UPDATE, DELETE ON qbank_retrieval_fill_intent TO app_role;
ALTER TABLE qbank_retrieval_fill_intent ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_retrieval_fill_intent FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_retrieval_fill_intent_owner ON qbank_retrieval_fill_intent;
CREATE POLICY p_qbank_retrieval_fill_intent_owner ON qbank_retrieval_fill_intent
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
