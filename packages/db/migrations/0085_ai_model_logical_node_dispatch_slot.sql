-- 0085_ai_model_logical_node_dispatch_slot.sql
--
-- A single invocation idempotency key is not a logical-node budget: an old
-- caller could create a second key for critique/repair and dispatch again.
-- Persist the canonical key at claim time and let exactly one database-owned
-- slot cross the provider boundary.  The slot is intentionally never released
-- after dispatch: provider timeout/5xx/lost response remains unknown.

ALTER TABLE ai_model_invocation
  ADD COLUMN IF NOT EXISTS logical_node_key_digest text;

ALTER TABLE ai_model_invocation
  DROP CONSTRAINT IF EXISTS ai_model_invocation_logical_node_key_digest_check;
ALTER TABLE ai_model_invocation
  ADD CONSTRAINT ai_model_invocation_logical_node_key_digest_check
  CHECK (logical_node_key_digest IS NULL OR logical_node_key_digest ~ '^[0-9a-f]{64}$');

-- A pre-0085 claimed row never recorded the canonical logical node.  It may
-- not cross the external-send boundary after this migration: an in-flight old
-- worker will fail the trigger below, and a new business revision must create
-- a new invocation instead of guessing whether the old lease was sent.
UPDATE ai_model_invocation
   SET status='failed', error_code='legacy_logical_node_header_unbound',
       lease_token=NULL, lease_expires_at=NULL,
       completed_at=clock_timestamp(), updated_at=clock_timestamp()
 WHERE status='claimed' AND logical_node_key_digest IS NULL;

CREATE TABLE IF NOT EXISTS ai_model_logical_node_header (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  logical_node_key_digest text NOT NULL CHECK (logical_node_key_digest ~ '^[0-9a-f]{64}$'),
  canonical_idempotency_key text NOT NULL CHECK (char_length(canonical_idempotency_key) BETWEEN 1 AND 256),
  request_digest text NOT NULL CHECK (request_digest ~ '^[0-9a-f]{64}$'),
  service text,
  cost_scope_id text CHECK (cost_scope_id IS NULL OR cost_scope_id ~ '^[A-Za-z0-9._:-]{1,160}$'),
  -- Frozen dispatch binding (MODEL-OP-00-BINDING-001): a billed header must
  -- carry the exact provider/model/region/price-revision and budget bounds the
  -- reservation is allowed to match; an unbilled header carries none of them.
  provider text CHECK (provider IS NULL OR provider ~ '^[A-Za-z0-9._-]{1,80}$'),
  model text CHECK (model IS NULL OR model ~ '^[A-Za-z0-9._:-]{1,160}$'),
  region text CHECK (region IS NULL OR region ~ '^[A-Za-z0-9._-]{1,80}$'),
  price_revision text CHECK (price_revision IS NULL OR price_revision ~ '^[A-Za-z0-9._:-]{1,80}$'),
  max_input_tokens integer CHECK (max_input_tokens IS NULL OR max_input_tokens BETWEEN 1 AND 1000000),
  max_output_tokens integer CHECK (max_output_tokens IS NULL OR max_output_tokens BETWEEN 1 AND 1000000),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id,logical_node_key_digest),
  UNIQUE (owner_user_id,canonical_idempotency_key),
  CONSTRAINT ai_model_logical_node_header_binding_shape CHECK (
    (cost_scope_id IS NULL AND provider IS NULL AND model IS NULL AND region IS NULL
       AND price_revision IS NULL AND max_input_tokens IS NULL AND max_output_tokens IS NULL)
    OR (cost_scope_id IS NOT NULL AND provider IS NOT NULL AND model IS NOT NULL
       AND region IS NOT NULL AND price_revision IS NOT NULL
       AND max_input_tokens IS NOT NULL AND max_output_tokens IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS ai_model_dispatch_slot (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  logical_node_key_digest text NOT NULL CHECK (logical_node_key_digest ~ '^[0-9a-f]{64}$'),
  canonical_idempotency_key text NOT NULL CHECK (char_length(canonical_idempotency_key) BETWEEN 1 AND 256),
  cost_scope_id text CHECK (cost_scope_id IS NULL OR cost_scope_id ~ '^[A-Za-z0-9._:-]{1,160}$'),
  dispatched_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id,logical_node_key_digest),
  FOREIGN KEY (owner_user_id,logical_node_key_digest)
    REFERENCES ai_model_logical_node_header(owner_user_id,logical_node_key_digest)
);

ALTER TABLE ai_model_logical_node_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_logical_node_header FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_ai_model_logical_node_header_owner ON ai_model_logical_node_header;
CREATE POLICY p_ai_model_logical_node_header_owner ON ai_model_logical_node_header
  USING (owner_user_id=current_setting('app.principal_user',true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user',true));

ALTER TABLE ai_model_dispatch_slot ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_dispatch_slot FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_ai_model_dispatch_slot_owner ON ai_model_dispatch_slot;
CREATE POLICY p_ai_model_dispatch_slot_owner ON ai_model_dispatch_slot
  USING (owner_user_id=current_setting('app.principal_user',true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user',true));

-- No request-path role receives direct access to either ledger.  The fixed
-- procedures below bind the caller's RLS principal and never accept prompts or
-- raw logical-node text, only its server-computed SHA-256 digest.
REVOKE ALL ON ai_model_logical_node_header, ai_model_dispatch_slot FROM PUBLIC, app_role;

CREATE OR REPLACE FUNCTION ai_model_register_logical_node_header_scoped(
  p_owner_user_id text,
  p_logical_node_key_digest text,
  p_idempotency_key text,
  p_request_digest text,
  p_service text,
  p_cost_scope_id text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  invocation ai_model_invocation%ROWTYPE;
  header ai_model_logical_node_header%ROWTYPE;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_logical_node_key_digest IS NULL OR p_logical_node_key_digest !~ '^[0-9a-f]{64}$'
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_request_digest IS NULL OR p_request_digest !~ '^[0-9a-f]{64}$'
    OR (p_cost_scope_id IS NOT NULL AND p_cost_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$') THEN
    RAISE EXCEPTION 'ai_model_logical_node_header_invalid_input' USING ERRCODE='check_violation';
  END IF;

  SELECT * INTO invocation
    FROM ai_model_invocation
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
   FOR UPDATE;
  IF NOT FOUND OR invocation.status <> 'claimed'
    OR invocation.logical_node_key_digest IS DISTINCT FROM p_logical_node_key_digest
    OR invocation.request_digest <> p_request_digest
    OR invocation.service IS DISTINCT FROM p_service
    OR invocation.cost_scope_id IS DISTINCT FROM p_cost_scope_id THEN
    RAISE EXCEPTION 'ai_model_logical_node_header_invocation_mismatch' USING ERRCODE='integrity_constraint_violation';
  END IF;

  SELECT * INTO header
    FROM ai_model_logical_node_header
   WHERE owner_user_id=p_owner_user_id AND logical_node_key_digest=p_logical_node_key_digest
   FOR UPDATE;
  IF FOUND THEN
    IF header.canonical_idempotency_key <> p_idempotency_key THEN
      RETURN 'canonical_invocation_mismatch';
    END IF;
    IF header.request_digest <> p_request_digest
      OR header.service IS DISTINCT FROM p_service
      OR header.cost_scope_id IS DISTINCT FROM p_cost_scope_id THEN
      RETURN 'logical_node_binding_mismatch';
    END IF;
    RETURN 'held';
  END IF;

  INSERT INTO ai_model_logical_node_header(
    owner_user_id,logical_node_key_digest,canonical_idempotency_key,request_digest,service,cost_scope_id
  ) VALUES (
    p_owner_user_id,p_logical_node_key_digest,p_idempotency_key,p_request_digest,p_service,p_cost_scope_id
  );
  RETURN 'registered';
END;
$$;

CREATE OR REPLACE FUNCTION ai_model_dispatch_slot_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.status='claimed' AND NEW.status='dispatching' THEN
    IF NEW.logical_node_key_digest IS NULL
      OR NOT EXISTS (
        SELECT 1
          FROM ai_model_logical_node_header AS h
          JOIN ai_model_dispatch_slot AS s
            ON s.owner_user_id=h.owner_user_id
           AND s.logical_node_key_digest=h.logical_node_key_digest
         WHERE h.owner_user_id=NEW.owner_user_id
           AND h.logical_node_key_digest=NEW.logical_node_key_digest
           AND h.canonical_idempotency_key=NEW.idempotency_key
           AND h.request_digest=NEW.request_digest
           AND h.service IS NOT DISTINCT FROM NEW.service
           AND h.cost_scope_id IS NOT DISTINCT FROM NEW.cost_scope_id
           AND s.canonical_idempotency_key=NEW.idempotency_key
           AND s.cost_scope_id IS NOT DISTINCT FROM NEW.cost_scope_id
      ) THEN
      RAISE EXCEPTION 'ai_model_dispatch_slot_required' USING ERRCODE='integrity_constraint_violation';
    END IF;

    IF NEW.cost_scope_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
          FROM ai_cost_reservation
         WHERE scope_id=NEW.cost_scope_id
           AND request_owner_user_id=NEW.owner_user_id
           AND idempotency_key=NEW.idempotency_key
           AND status='reserved'
      ) THEN
      RAISE EXCEPTION 'ai_model_dispatch_cost_reservation_required' USING ERRCODE='integrity_constraint_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_ai_model_dispatch_slot_guard ON ai_model_invocation;
CREATE TRIGGER tr_ai_model_dispatch_slot_guard
  BEFORE UPDATE OF status ON ai_model_invocation
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION ai_model_dispatch_slot_guard();

CREATE OR REPLACE FUNCTION ai_model_transition_dispatched_scoped(
  p_owner_user_id text,
  p_idempotency_key text,
  p_lease_token uuid,
  p_cost_scope_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  invocation ai_model_invocation%ROWTYPE;
  header ai_model_logical_node_header%ROWTYPE;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_lease_token IS NULL
    OR (p_cost_scope_id IS NOT NULL AND p_cost_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$') THEN
    RAISE EXCEPTION 'ai_model_dispatch_slot_invalid_input' USING ERRCODE='check_violation';
  END IF;

  SELECT * INTO invocation
    FROM ai_model_invocation
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
   FOR UPDATE;
  IF NOT FOUND OR invocation.status <> 'claimed' OR invocation.lease_token IS DISTINCT FROM p_lease_token
    OR invocation.cost_scope_id IS DISTINCT FROM p_cost_scope_id
    OR invocation.logical_node_key_digest IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO header
    FROM ai_model_logical_node_header
   WHERE owner_user_id=p_owner_user_id AND logical_node_key_digest=invocation.logical_node_key_digest
   FOR UPDATE;
  IF NOT FOUND OR header.canonical_idempotency_key <> p_idempotency_key
    OR header.request_digest <> invocation.request_digest
    OR header.service IS DISTINCT FROM invocation.service
    OR header.cost_scope_id IS DISTINCT FROM invocation.cost_scope_id THEN
    RAISE EXCEPTION 'ai_model_dispatch_slot_header_mismatch' USING ERRCODE='integrity_constraint_violation';
  END IF;

  IF p_cost_scope_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM ai_cost_reservation
       WHERE scope_id=p_cost_scope_id
         AND request_owner_user_id=p_owner_user_id
         AND idempotency_key=p_idempotency_key
         AND status='reserved'
    ) THEN
    RAISE EXCEPTION 'ai_model_dispatch_cost_reservation_required' USING ERRCODE='integrity_constraint_violation';
  END IF;

  INSERT INTO ai_model_dispatch_slot(
    owner_user_id,logical_node_key_digest,canonical_idempotency_key,cost_scope_id
  ) VALUES (
    p_owner_user_id,invocation.logical_node_key_digest,p_idempotency_key,p_cost_scope_id
  ) ON CONFLICT (owner_user_id,logical_node_key_digest) DO NOTHING;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE ai_model_invocation
     SET status='dispatching', lease_token=NULL, lease_expires_at=NULL,
         dispatched_at=clock_timestamp(), updated_at=clock_timestamp()
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND status='claimed' AND lease_token=p_lease_token
     AND cost_scope_id IS NOT DISTINCT FROM p_cost_scope_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION ai_model_register_logical_node_header_scoped(text,text,text,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_model_transition_dispatched_scoped(text,text,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_model_register_logical_node_header_scoped(text,text,text,text,text,text) TO app_role;
GRANT EXECUTE ON FUNCTION ai_model_transition_dispatched_scoped(text,text,uuid,text) TO app_role;
