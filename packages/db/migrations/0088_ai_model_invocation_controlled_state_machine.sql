-- 0088_ai_model_invocation_controlled_state_machine.sql
--
-- 0085 protected only one UPDATE shape.  A runtime role could still insert a
-- row as dispatching, terminalize an invocation directly, or mutate durable
-- identity after dispatch.  The invocation row is now write-only through the
-- fixed principal-scoped procedures below.  A private, transaction-local
-- permit is consumed by a BEFORE INSERT/UPDATE trigger as a second line of
-- defence if a future ACL drift accidentally restores an INSERT/UPDATE grant.
-- DELETE has no request-path procedure at all and was never granted to
-- app_role (0037 grants SELECT/INSERT/UPDATE only); it stays revoked below and
-- is deliberately not covered by the permit trigger.  A future privacy-erasure
-- feature must add its own controlled, audited delete procedure rather than
-- restore a table-level DELETE grant.

CREATE TABLE IF NOT EXISTS ai_model_invocation_transition_permit (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 1 AND 256),
  expected_old_status text CHECK (expected_old_status IS NULL OR expected_old_status IN ('claimed','dispatching','succeeded','failed','unknown')),
  expected_new_status text NOT NULL CHECK (expected_new_status IN ('claimed','dispatching','succeeded','failed','unknown')),
  issued_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id,idempotency_key)
);

-- This is an internal capability ledger.  It carries no prompt/output and is
-- not an application read surface.  The SECURITY DEFINER procedures and
-- trigger owner retain access; no runtime role does.
REVOKE ALL ON ai_model_invocation_transition_permit FROM PUBLIC, app_role;

CREATE OR REPLACE FUNCTION ai_model_consume_transition_permit(
  p_owner_user_id text,
  p_idempotency_key text,
  p_expected_old_status text,
  p_expected_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE removed integer;
BEGIN
  DELETE FROM ai_model_invocation_transition_permit
   WHERE owner_user_id=p_owner_user_id
     AND idempotency_key=p_idempotency_key
     AND expected_old_status IS NOT DISTINCT FROM p_expected_old_status
     AND expected_new_status=p_expected_new_status;
  GET DIAGNOSTICS removed = ROW_COUNT;
  IF removed <> 1 THEN
    RAISE EXCEPTION 'ai_model_invocation_transition_permit_required'
      USING ERRCODE='integrity_constraint_violation';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION ai_model_invocation_state_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  old_status text;
BEGIN
  old_status := CASE WHEN TG_OP='INSERT' THEN NULL ELSE OLD.status END;
  PERFORM ai_model_consume_transition_permit(
    NEW.owner_user_id, NEW.idempotency_key, old_status, NEW.status
  );

  IF TG_OP='INSERT' THEN
    IF NEW.status <> 'claimed'
      OR NEW.logical_node_key_digest IS NULL
      OR NEW.lease_token IS NULL OR NEW.lease_expires_at IS NULL
      OR NEW.error_code IS NOT NULL OR NEW.output IS NOT NULL
      OR NEW.dispatched_at IS NOT NULL OR NEW.completed_at IS NOT NULL
      OR NEW.input_tokens IS NOT NULL OR NEW.output_tokens IS NOT NULL OR NEW.latency_ms IS NOT NULL THEN
      RAISE EXCEPTION 'ai_model_invocation_claim_shape_invalid' USING ERRCODE='check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.owner_user_id IS DISTINCT FROM NEW.owner_user_id
    OR OLD.idempotency_key IS DISTINCT FROM NEW.idempotency_key
    OR OLD.logical_node_key_digest IS DISTINCT FROM NEW.logical_node_key_digest
    OR OLD.request_digest IS DISTINCT FROM NEW.request_digest
    OR OLD.service IS DISTINCT FROM NEW.service
    OR OLD.request_id IS DISTINCT FROM NEW.request_id
    OR OLD.cost_scope_id IS DISTINCT FROM NEW.cost_scope_id
    OR OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'ai_model_invocation_identity_immutable' USING ERRCODE='integrity_constraint_violation';
  END IF;

  IF OLD.status='claimed' AND NEW.status='claimed' THEN
    IF NEW.lease_token IS NULL OR NEW.lease_expires_at IS NULL
      OR NEW.error_code IS DISTINCT FROM OLD.error_code
      OR NEW.output IS DISTINCT FROM OLD.output
      OR NEW.replayable IS DISTINCT FROM OLD.replayable
      OR NEW.input_tokens IS DISTINCT FROM OLD.input_tokens
      OR NEW.output_tokens IS DISTINCT FROM OLD.output_tokens
      OR NEW.latency_ms IS DISTINCT FROM OLD.latency_ms
      OR NEW.dispatched_at IS DISTINCT FROM OLD.dispatched_at
      OR NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
      RAISE EXCEPTION 'ai_model_invocation_claim_renewal_invalid' USING ERRCODE='integrity_constraint_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status='claimed' AND NEW.status='failed' THEN
    -- A pre-dispatch failure must never have crossed the external-send
    -- boundary: neither side of the transition may carry a dispatch time.
    -- (Comparing NEW against OLD with IS NOT DISTINCT would reject every
    -- legitimate failure because both sides are NULL here.)
    IF NEW.lease_token IS NOT NULL OR NEW.lease_expires_at IS NOT NULL
      OR NEW.error_code IS NULL OR NEW.error_code !~ '^[A-Za-z0-9._:-]{1,120}$'
      OR NEW.output IS NOT NULL OR NEW.completed_at IS NULL
      OR OLD.dispatched_at IS NOT NULL OR NEW.dispatched_at IS NOT NULL
      OR NEW.input_tokens IS DISTINCT FROM OLD.input_tokens
      OR NEW.output_tokens IS DISTINCT FROM OLD.output_tokens
      OR NEW.latency_ms IS DISTINCT FROM OLD.latency_ms THEN
      RAISE EXCEPTION 'ai_model_invocation_pre_dispatch_failure_invalid' USING ERRCODE='check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status='claimed' AND NEW.status='dispatching' THEN
    IF NEW.logical_node_key_digest IS NULL
      OR NEW.lease_token IS NOT NULL OR NEW.lease_expires_at IS NOT NULL
      OR NEW.dispatched_at IS NULL
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
    -- Second line of defence: even a permit-minted writer cannot cross the
    -- dispatch boundary when the billed reservation is missing or does not
    -- exactly match the header's frozen provider/model/region/revision and
    -- token bounds (BINDING-001).
    IF NEW.cost_scope_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
          FROM ai_cost_reservation AS r
          JOIN ai_model_logical_node_header AS h
            ON h.owner_user_id=NEW.owner_user_id
           AND h.logical_node_key_digest=NEW.logical_node_key_digest
         WHERE r.scope_id=NEW.cost_scope_id
           AND r.request_owner_user_id=NEW.owner_user_id
           AND r.idempotency_key=NEW.idempotency_key
           AND r.status='reserved'
           AND r.provider=h.provider AND r.model=h.model
           AND r.region=h.region AND r.price_revision=h.price_revision
           AND r.input_tokens_reserved=h.max_input_tokens
           AND r.output_tokens_reserved=h.max_output_tokens
      ) THEN
      RAISE EXCEPTION 'ai_model_dispatch_cost_reservation_required' USING ERRCODE='integrity_constraint_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status='dispatching' AND NEW.status IN ('succeeded','failed','unknown') THEN
    IF NEW.lease_token IS NOT NULL OR NEW.lease_expires_at IS NOT NULL
      OR (NEW.status='succeeded' AND NEW.error_code IS NOT NULL)
      OR (NEW.status IN ('failed','unknown') AND (NEW.error_code IS NULL OR NEW.error_code !~ '^[A-Za-z0-9._:-]{1,120}$')) THEN
      RAISE EXCEPTION 'ai_model_invocation_terminal_shape_invalid' USING ERRCODE='integrity_constraint_violation';
    END IF;
    IF NEW.status='succeeded' AND (NEW.output IS NULL OR NEW.completed_at IS NULL) THEN
      RAISE EXCEPTION 'ai_model_invocation_success_shape_invalid' USING ERRCODE='integrity_constraint_violation';
    END IF;
    IF NEW.status IN ('failed','unknown') AND NEW.output IS NOT NULL THEN
      RAISE EXCEPTION 'ai_model_invocation_terminal_output_invalid' USING ERRCODE='integrity_constraint_violation';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'ai_model_invocation_state_transition_invalid' USING ERRCODE='integrity_constraint_violation';
END;
$$;

DROP TRIGGER IF EXISTS tr_ai_model_dispatch_slot_guard ON ai_model_invocation;
DROP TRIGGER IF EXISTS tr_ai_model_invocation_state_guard ON ai_model_invocation;
CREATE TRIGGER tr_ai_model_invocation_state_guard
  BEFORE INSERT OR UPDATE ON ai_model_invocation
  FOR EACH ROW
  EXECUTE FUNCTION ai_model_invocation_state_guard();

-- Different invocation keys may race for one logical node.  ON CONFLICT
-- makes the loser inspect the canonical header rather than surface a unique
-- violation to the caller.  The header also freezes the billed dispatch
-- binding: provider/model/region/price-revision and token bounds must be
-- present exactly when a cost scope is present (BINDING-001).
DROP FUNCTION IF EXISTS ai_model_register_logical_node_header_scoped(text,text,text,text,text,text);
CREATE OR REPLACE FUNCTION ai_model_register_logical_node_header_scoped(
  p_owner_user_id text,
  p_logical_node_key_digest text,
  p_idempotency_key text,
  p_request_digest text,
  p_service text,
  p_cost_scope_id text,
  p_provider text,
  p_model text,
  p_region text,
  p_price_revision text,
  p_max_input_tokens integer,
  p_max_output_tokens integer
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  invocation ai_model_invocation%ROWTYPE;
  header ai_model_logical_node_header%ROWTYPE;
  billed boolean := p_cost_scope_id IS NOT NULL;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_logical_node_key_digest IS NULL OR p_logical_node_key_digest !~ '^[0-9a-f]{64}$'
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_request_digest IS NULL OR p_request_digest !~ '^[0-9a-f]{64}$'
    OR (p_cost_scope_id IS NOT NULL AND p_cost_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$')
    OR (billed AND (p_provider IS NULL OR p_provider !~ '^[A-Za-z0-9._-]{1,80}$'
                    OR p_model IS NULL OR p_model !~ '^[A-Za-z0-9._:-]{1,160}$'
                    OR p_region IS NULL OR p_region !~ '^[A-Za-z0-9._-]{1,80}$'
                    OR p_price_revision IS NULL OR p_price_revision !~ '^[A-Za-z0-9._:-]{1,80}$'
                    OR p_max_input_tokens IS NULL OR p_max_input_tokens NOT BETWEEN 1 AND 1000000
                    OR p_max_output_tokens IS NULL OR p_max_output_tokens NOT BETWEEN 1 AND 1000000))
    OR (NOT billed AND (p_provider IS NOT NULL OR p_model IS NOT NULL OR p_region IS NOT NULL
                        OR p_price_revision IS NOT NULL OR p_max_input_tokens IS NOT NULL
                        OR p_max_output_tokens IS NOT NULL)) THEN
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

  INSERT INTO ai_model_logical_node_header(
    owner_user_id,logical_node_key_digest,canonical_idempotency_key,request_digest,service,cost_scope_id,
    provider,model,region,price_revision,max_input_tokens,max_output_tokens
  ) VALUES (
    p_owner_user_id,p_logical_node_key_digest,p_idempotency_key,p_request_digest,p_service,p_cost_scope_id,
    p_provider,p_model,p_region,p_price_revision,p_max_input_tokens,p_max_output_tokens
  ) ON CONFLICT (owner_user_id,logical_node_key_digest) DO NOTHING;
  IF FOUND THEN RETURN 'registered'; END IF;

  SELECT * INTO header
    FROM ai_model_logical_node_header
   WHERE owner_user_id=p_owner_user_id AND logical_node_key_digest=p_logical_node_key_digest
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ai_model_logical_node_header_missing_after_conflict' USING ERRCODE='integrity_constraint_violation';
  END IF;
  IF header.canonical_idempotency_key <> p_idempotency_key THEN
    RETURN 'canonical_invocation_mismatch';
  END IF;
  IF header.request_digest <> p_request_digest
    OR header.service IS DISTINCT FROM p_service
    OR header.cost_scope_id IS DISTINCT FROM p_cost_scope_id THEN
    RETURN 'binding_mismatch';
  END IF;
  IF billed AND (header.provider <> p_provider OR header.model <> p_model
       OR header.region <> p_region OR header.price_revision <> p_price_revision
       OR header.max_input_tokens <> p_max_input_tokens
       OR header.max_output_tokens <> p_max_output_tokens) THEN
    RETURN 'binding_mismatch';
  END IF;
  RETURN 'held';
END;
$$;

DROP FUNCTION IF EXISTS ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer);
CREATE OR REPLACE FUNCTION ai_model_claim_invocation_scoped(
  p_owner_user_id text,
  p_idempotency_key text,
  p_logical_node_key_digest text,
  p_request_digest text,
  p_service text,
  p_request_id text,
  p_cost_scope_id text,
  p_lease_token uuid,
  p_lease_seconds integer,
  p_provider text,
  p_model text,
  p_region text,
  p_price_revision text,
  p_max_input_tokens integer,
  p_max_output_tokens integer
)
RETURNS TABLE(action text, lease_token uuid, output jsonb, error_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  invocation ai_model_invocation%ROWTYPE;
  header_decision text;
  created boolean := false;
  billed boolean := p_cost_scope_id IS NOT NULL;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_owner_user_id IS NULL OR char_length(p_owner_user_id) NOT BETWEEN 1 AND 512
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_logical_node_key_digest IS NULL OR p_logical_node_key_digest !~ '^[0-9a-f]{64}$'
    OR p_request_digest IS NULL OR p_request_digest !~ '^[0-9a-f]{64}$'
    OR p_lease_token IS NULL OR p_lease_seconds IS NULL OR p_lease_seconds NOT BETWEEN 1 AND 3600
    OR (p_service IS NOT NULL AND (char_length(p_service) NOT BETWEEN 1 AND 256 OR p_service ~ E'[\r\n]'))
    OR (p_request_id IS NOT NULL AND (char_length(p_request_id) NOT BETWEEN 1 AND 256 OR p_request_id ~ E'[\r\n]'))
    OR (p_cost_scope_id IS NOT NULL AND p_cost_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$')
    OR (billed AND (p_provider IS NULL OR p_provider !~ '^[A-Za-z0-9._-]{1,80}$'
                    OR p_model IS NULL OR p_model !~ '^[A-Za-z0-9._:-]{1,160}$'
                    OR p_region IS NULL OR p_region !~ '^[A-Za-z0-9._-]{1,80}$'
                    OR p_price_revision IS NULL OR p_price_revision !~ '^[A-Za-z0-9._:-]{1,80}$'
                    OR p_max_input_tokens IS NULL OR p_max_input_tokens NOT BETWEEN 1 AND 1000000
                    OR p_max_output_tokens IS NULL OR p_max_output_tokens NOT BETWEEN 1 AND 1000000))
    OR (NOT billed AND (p_provider IS NOT NULL OR p_model IS NOT NULL OR p_region IS NOT NULL
                        OR p_price_revision IS NOT NULL OR p_max_input_tokens IS NOT NULL
                        OR p_max_output_tokens IS NOT NULL)) THEN
    RAISE EXCEPTION 'ai_model_invocation_claim_invalid_input' USING ERRCODE='check_violation';
  END IF;

  -- Existing rows always take the invocation row lock before minting a
  -- one-use permit.  Dispatch and reconciliation have the same order, so
  -- concurrent claim/terminal paths cannot deadlock permit <-> invocation.
  SELECT * INTO invocation
    FROM ai_model_invocation
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
   FOR UPDATE;
  IF FOUND THEN
    created := false;
  ELSE
    -- A first creator has no invocation row to lock.  The primary-key permit
    -- serializes that narrow creation race; a loser waits, then locks the
    -- winner's invocation row before taking any existing-row path.
    INSERT INTO ai_model_invocation_transition_permit(
      owner_user_id,idempotency_key,expected_old_status,expected_new_status
    ) VALUES (p_owner_user_id,p_idempotency_key,NULL,'claimed')
    ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING;
    IF NOT FOUND THEN
      SELECT * INTO invocation
        FROM ai_model_invocation
       WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
       FOR UPDATE;
    ELSE
    INSERT INTO ai_model_invocation(
      owner_user_id,idempotency_key,logical_node_key_digest,request_digest,
      lease_token,lease_expires_at,status,service,request_id,cost_scope_id
    ) VALUES (
      p_owner_user_id,p_idempotency_key,p_logical_node_key_digest,p_request_digest,
      p_lease_token,clock_timestamp()+make_interval(secs => p_lease_seconds),'claimed',p_service,p_request_id,p_cost_scope_id
    ) ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING
      RETURNING * INTO invocation;
    created := FOUND;
    IF NOT created THEN
      DELETE FROM ai_model_invocation_transition_permit
       WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
         AND expected_old_status IS NULL AND expected_new_status='claimed';
      SELECT * INTO invocation
        FROM ai_model_invocation
       WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
       FOR UPDATE;
    END IF;
    END IF;
  END IF;

  IF created THEN
    SELECT ai_model_register_logical_node_header_scoped(
      p_owner_user_id,p_logical_node_key_digest,p_idempotency_key,p_request_digest,p_service,p_cost_scope_id,
      p_provider,p_model,p_region,p_price_revision,p_max_input_tokens,p_max_output_tokens
    ) INTO header_decision;
    IF header_decision IN ('registered','held') THEN
      RETURN QUERY SELECT 'execute'::text,p_lease_token,NULL::jsonb,NULL::text;
      RETURN;
    END IF;
    INSERT INTO ai_model_invocation_transition_permit(
      owner_user_id,idempotency_key,expected_old_status,expected_new_status
    ) VALUES (p_owner_user_id,p_idempotency_key,'claimed','failed');
    -- The state guard requires a pre-dispatch failure to release its lease;
    -- a freshly created claim still holds the creation lease here, so the
    -- same UPDATE shape as ai_model_fail_claim_scoped must clear it.
    UPDATE ai_model_invocation
       SET status='failed',error_code='logical_node_' || header_decision,
           lease_token=NULL,lease_expires_at=NULL,completed_at=clock_timestamp(),updated_at=clock_timestamp()
      WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
        AND status='claimed' AND ai_model_invocation.lease_token=p_lease_token;
    IF FOUND THEN
      RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,('logical_node_' || header_decision)::text;
      RETURN;
    END IF;
    DELETE FROM ai_model_invocation_transition_permit
     WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
       AND expected_old_status='claimed' AND expected_new_status='failed';
    RAISE EXCEPTION 'ai_model_invocation_claim_fail_state' USING ERRCODE='integrity_constraint_violation';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ai_model_invocation_missing_after_conflict' USING ERRCODE='integrity_constraint_violation';
  END IF;
  IF invocation.request_digest <> p_request_digest THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,'idempotency_key_payload_mismatch'::text;
    RETURN;
  END IF;
  IF invocation.cost_scope_id IS DISTINCT FROM p_cost_scope_id THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,'idempotency_key_cost_scope_mismatch'::text;
    RETURN;
  END IF;
  IF invocation.status='succeeded' THEN
    IF invocation.replayable THEN
      RETURN QUERY SELECT 'cached'::text,NULL::uuid,invocation.output,NULL::text;
    ELSE
      RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,'sensitive_result_replay_requires_artifact'::text;
    END IF;
    RETURN;
  END IF;
  IF invocation.status='failed' THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,COALESCE(invocation.error_code,'model_invocation_failed')::text;
    RETURN;
  END IF;
  IF invocation.status='unknown' THEN
    RETURN QUERY SELECT 'unknown'::text,NULL::uuid,NULL::jsonb,COALESCE(invocation.error_code,'external_outcome_unknown')::text;
    RETURN;
  END IF;
  IF invocation.status='dispatching' THEN
    RETURN QUERY SELECT 'wait'::text,NULL::uuid,NULL::jsonb,NULL::text;
    RETURN;
  END IF;
  IF invocation.logical_node_key_digest IS DISTINCT FROM p_logical_node_key_digest THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,'idempotency_key_logical_node_mismatch'::text;
    RETURN;
  END IF;
  SELECT ai_model_register_logical_node_header_scoped(
    p_owner_user_id,p_logical_node_key_digest,p_idempotency_key,p_request_digest,p_service,p_cost_scope_id,
    p_provider,p_model,p_region,p_price_revision,p_max_input_tokens,p_max_output_tokens
  ) INTO header_decision;
  IF header_decision NOT IN ('registered','held') THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,('logical_node_' || header_decision)::text;
    RETURN;
  END IF;
  IF invocation.lease_expires_at >= clock_timestamp() THEN
    RETURN QUERY SELECT 'wait'::text,NULL::uuid,NULL::jsonb,NULL::text;
    RETURN;
  END IF;
  INSERT INTO ai_model_invocation_transition_permit(
    owner_user_id,idempotency_key,expected_old_status,expected_new_status
  ) VALUES (p_owner_user_id,p_idempotency_key,'claimed','claimed');
  UPDATE ai_model_invocation
     SET lease_token=p_lease_token,
         lease_expires_at=clock_timestamp()+make_interval(secs => p_lease_seconds),
         updated_at=clock_timestamp()
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND status='claimed' AND lease_expires_at < clock_timestamp();
  IF FOUND THEN
    RETURN QUERY SELECT 'execute'::text,p_lease_token,NULL::jsonb,NULL::text;
  ELSE
    DELETE FROM ai_model_invocation_transition_permit
     WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
       AND expected_old_status='claimed' AND expected_new_status='claimed';
    RETURN QUERY SELECT 'wait'::text,NULL::uuid,NULL::jsonb,NULL::text;
  END IF;
END;
$$;

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
    OR invocation.lease_expires_at IS NULL OR invocation.lease_expires_at < clock_timestamp()
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

  -- BINDING-001: a billed dispatch may only pair with a reservation whose
  -- provider/model/region/price-revision and token bounds exactly match the
  -- header's frozen binding.  A same-scope/same-key row with drifted pricing
  -- identity is rejected before any slot or permit is minted.
  IF p_cost_scope_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM ai_cost_reservation
       WHERE scope_id=p_cost_scope_id
         AND request_owner_user_id=p_owner_user_id
         AND idempotency_key=p_idempotency_key
         AND status='reserved'
    ) THEN
      RAISE EXCEPTION 'ai_model_dispatch_cost_reservation_required' USING ERRCODE='integrity_constraint_violation';
    END IF;
    IF NOT EXISTS (
      SELECT 1
        FROM ai_cost_reservation AS r
        JOIN ai_model_logical_node_header AS h
          ON h.owner_user_id=p_owner_user_id
         AND h.logical_node_key_digest=invocation.logical_node_key_digest
       WHERE r.scope_id=p_cost_scope_id
         AND r.request_owner_user_id=p_owner_user_id
         AND r.idempotency_key=p_idempotency_key
         AND r.status='reserved'
         AND r.provider=h.provider AND r.model=h.model
         AND r.region=h.region AND r.price_revision=h.price_revision
         AND r.input_tokens_reserved=h.max_input_tokens
         AND r.output_tokens_reserved=h.max_output_tokens
    ) THEN
      RAISE EXCEPTION 'ai_model_dispatch_cost_reservation_binding_mismatch' USING ERRCODE='integrity_constraint_violation';
    END IF;
  END IF;

  INSERT INTO ai_model_dispatch_slot(
    owner_user_id,logical_node_key_digest,canonical_idempotency_key,cost_scope_id
  ) VALUES (
    p_owner_user_id,invocation.logical_node_key_digest,p_idempotency_key,p_cost_scope_id
  ) ON CONFLICT (owner_user_id,logical_node_key_digest) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO ai_model_invocation_transition_permit(
    owner_user_id,idempotency_key,expected_old_status,expected_new_status
  ) VALUES (p_owner_user_id,p_idempotency_key,'claimed','dispatching');
  UPDATE ai_model_invocation
     SET status='dispatching',lease_token=NULL,lease_expires_at=NULL,
         dispatched_at=clock_timestamp(),updated_at=clock_timestamp()
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND status='claimed' AND lease_token=p_lease_token
     AND cost_scope_id IS NOT DISTINCT FROM p_cost_scope_id;
  IF FOUND THEN RETURN true; END IF;
  DELETE FROM ai_model_invocation_transition_permit
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND expected_old_status='claimed' AND expected_new_status='dispatching';
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION ai_model_fail_claim_scoped(
  p_owner_user_id text,
  p_idempotency_key text,
  p_lease_token uuid,
  p_error_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_lease_token IS NULL
    OR p_error_code IS NULL OR p_error_code !~ '^[A-Za-z0-9._:-]{1,120}$' THEN
    RAISE EXCEPTION 'ai_model_fail_claim_invalid_input' USING ERRCODE='check_violation';
  END IF;
  PERFORM 1
    FROM ai_model_invocation
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
   FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO ai_model_invocation_transition_permit(
    owner_user_id,idempotency_key,expected_old_status,expected_new_status
  ) VALUES (p_owner_user_id,p_idempotency_key,'claimed','failed')
  ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE ai_model_invocation
     SET status='failed',error_code=p_error_code,lease_token=NULL,lease_expires_at=NULL,
         completed_at=clock_timestamp(),updated_at=clock_timestamp()
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND status='claimed' AND lease_token=p_lease_token;
  IF FOUND THEN RETURN true; END IF;
  DELETE FROM ai_model_invocation_transition_permit
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND expected_old_status='claimed' AND expected_new_status='failed';
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION ai_model_terminalize_scoped(
  p_owner_user_id text,
  p_idempotency_key text,
  p_status text,
  p_error_code text,
  p_output jsonb,
  p_replayable boolean,
  p_input_tokens integer,
  p_output_tokens integer,
  p_latency_ms integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE completed integer;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_status IS NULL OR p_status NOT IN ('succeeded','failed','unknown')
    OR (p_error_code IS NOT NULL AND p_error_code !~ '^[A-Za-z0-9._:-]{1,120}$')
    OR (p_input_tokens IS NOT NULL AND p_input_tokens < 0)
    OR (p_output_tokens IS NOT NULL AND p_output_tokens < 0)
    OR (p_latency_ms IS NOT NULL AND p_latency_ms < 0) THEN
    RAISE EXCEPTION 'ai_model_terminalize_invalid_input' USING ERRCODE='check_violation';
  END IF;
  IF p_status='succeeded' AND (p_error_code IS NOT NULL OR p_output IS NULL) THEN
    RAISE EXCEPTION 'ai_model_terminalize_success_invalid' USING ERRCODE='check_violation';
  END IF;
  IF p_status IN ('failed','unknown') AND (p_error_code IS NULL OR p_output IS NOT NULL) THEN
    RAISE EXCEPTION 'ai_model_terminalize_failure_invalid' USING ERRCODE='check_violation';
  END IF;
  -- Follow the same existing-row lock order as claim/dispatch/reconcile.
  PERFORM 1
    FROM ai_model_invocation
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
   FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO ai_model_invocation_transition_permit(
    owner_user_id,idempotency_key,expected_old_status,expected_new_status
  ) VALUES (p_owner_user_id,p_idempotency_key,'dispatching',p_status)
  ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE ai_model_invocation
     SET status=p_status,error_code=p_error_code,output=p_output,replayable=COALESCE(p_replayable,true),
         input_tokens=p_input_tokens,output_tokens=p_output_tokens,latency_ms=p_latency_ms,
         lease_token=NULL,lease_expires_at=NULL,
         completed_at=CASE WHEN p_status IN ('succeeded','failed') THEN clock_timestamp() ELSE NULL END,
         updated_at=clock_timestamp()
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND status='dispatching';
  GET DIAGNOSTICS completed = ROW_COUNT;
  IF completed=1 THEN RETURN true; END IF;
  DELETE FROM ai_model_invocation_transition_permit
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND expected_old_status='dispatching' AND expected_new_status=p_status;
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION ai_model_reconcile_stale_scoped(
  p_owner_user_id text,
  p_older_than_ms integer,
  p_limit integer
)
RETURNS TABLE(idempotency_key text, cost_scope_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE candidate record;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_older_than_ms IS NULL OR p_older_than_ms NOT BETWEEN 35000 AND 3600000
    OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 1000 THEN
    RAISE EXCEPTION 'ai_model_invocation_reconcile_invalid_input' USING ERRCODE='check_violation';
  END IF;
  FOR candidate IN
    SELECT i.idempotency_key,i.cost_scope_id
      FROM ai_model_invocation AS i
     WHERE i.owner_user_id=p_owner_user_id AND i.status='dispatching'
       AND i.dispatched_at < clock_timestamp() - make_interval(secs => p_older_than_ms::double precision / 1000.0)
     ORDER BY i.dispatched_at,i.idempotency_key
     FOR UPDATE SKIP LOCKED
     LIMIT p_limit
  LOOP
    INSERT INTO ai_model_invocation_transition_permit(
      owner_user_id,idempotency_key,expected_old_status,expected_new_status
    ) VALUES (p_owner_user_id,candidate.idempotency_key,'dispatching','unknown');
    UPDATE ai_model_invocation
       SET status='unknown',error_code='model_terminalization_reconcile',lease_token=NULL,lease_expires_at=NULL,
           output=NULL,completed_at=NULL,updated_at=clock_timestamp()
     WHERE owner_user_id=p_owner_user_id AND ai_model_invocation.idempotency_key=candidate.idempotency_key
       AND status='dispatching';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'ai_model_invocation_reconcile_state' USING ERRCODE='integrity_constraint_violation';
    END IF;
    idempotency_key := candidate.idempotency_key;
    cost_scope_id := candidate.cost_scope_id;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- The application still reads its own rows under FORCE RLS, but all writes
-- above this point require a reviewed, principal-scoped procedure.
REVOKE INSERT, UPDATE, DELETE ON ai_model_invocation FROM app_role;
REVOKE ALL ON FUNCTION ai_model_register_logical_node_header_scoped(text,text,text,text,text,text,text,text,text,text,integer,integer) FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION ai_model_consume_transition_permit(text,text,text,text) FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION ai_model_invocation_state_guard() FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_model_transition_dispatched_scoped(text,text,uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_model_fail_claim_scoped(text,text,uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_model_terminalize_scoped(text,text,text,text,jsonb,boolean,integer,integer,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_model_reconcile_stale_scoped(text,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer) TO app_role;
GRANT EXECUTE ON FUNCTION ai_model_transition_dispatched_scoped(text,text,uuid,text) TO app_role;
GRANT EXECUTE ON FUNCTION ai_model_fail_claim_scoped(text,text,uuid,text) TO app_role;
GRANT EXECUTE ON FUNCTION ai_model_terminalize_scoped(text,text,text,text,jsonb,boolean,integer,integer,integer) TO app_role;
GRANT EXECUTE ON FUNCTION ai_model_reconcile_stale_scoped(text,integer,integer) TO app_role;
