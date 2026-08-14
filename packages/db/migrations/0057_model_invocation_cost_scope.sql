-- 0057_model_invocation_cost_scope.sql
--
-- `request_owner + idempotency_key` is not a billing identity: one owner can
-- legitimately use identical key text in more than one budget scope.  Bind
-- every new durable invocation to the route-selected scope so a later
-- post-dispatch reconciler cannot freeze an unrelated RAG or business budget.

ALTER TABLE ai_model_invocation
  ADD COLUMN IF NOT EXISTS cost_scope_id text;

ALTER TABLE ai_model_invocation
  DROP CONSTRAINT IF EXISTS ai_model_invocation_cost_scope_id_check;
ALTER TABLE ai_model_invocation
  ADD CONSTRAINT ai_model_invocation_cost_scope_id_check
  CHECK (cost_scope_id IS NULL OR cost_scope_id ~ '^[A-Za-z0-9._:-]{1,160}$');

-- Pre-0057 claimed rows have never crossed the external-send boundary.  They
-- cannot safely acquire an unrecorded scope after this release, so delete the
-- short-lived lease: an in-flight old worker will fail its mark-dispatched CAS
-- before sending, while a new worker can recreate the exact key safely.
DELETE FROM ai_model_invocation WHERE status='claimed' AND cost_scope_id IS NULL;

-- Legacy dispatching rows have no reliable scope correlation.  Freeze every
-- same-owner/key legacy reservation once in this migration rather than leave a
-- potentially billable send replayable.  This conservative one-time action is
-- intentionally confined to historical ambiguous rows; runtime reconciliation
-- below always uses exact `(scope, owner, key)` matching.
UPDATE ai_cost_reservation AS c
   SET status='unknown', reason_code='legacy_model_scope_unbound', updated_at=clock_timestamp()
 WHERE c.status='dispatching'
   AND EXISTS (
     SELECT 1
       FROM ai_model_invocation AS i
      WHERE i.owner_user_id=c.request_owner_user_id
        AND i.idempotency_key=c.idempotency_key
        AND i.status='dispatching'
        AND i.cost_scope_id IS NULL
   );
UPDATE ai_model_invocation
   SET status='unknown', error_code='legacy_model_scope_unbound', updated_at=clock_timestamp()
 WHERE status='dispatching' AND cost_scope_id IS NULL;

CREATE OR REPLACE FUNCTION ai_cost_mark_unknown_for_model_reconcile_scoped(
  p_scope_id text,
  p_request_owner text,
  p_idempotency_key text,
  p_reason text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE changed integer;
BEGIN
  PERFORM ai_cost_require_request_owner(p_request_owner);
  IF p_scope_id IS NULL OR p_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$'
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_reason IS NULL OR p_reason !~ '^[A-Za-z0-9._:-]{1,120}$' THEN
    RAISE EXCEPTION 'ai_cost_model_reconcile_invalid_input' USING ERRCODE='check_violation';
  END IF;
  UPDATE ai_cost_reservation
     SET status='unknown', reason_code=p_reason, updated_at=clock_timestamp()
   WHERE scope_id=p_scope_id
     AND request_owner_user_id=p_request_owner
     AND idempotency_key=p_idempotency_key
     AND status='dispatching';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'ai_cost_model_reconcile_state' USING ERRCODE='integrity_constraint_violation';
  END IF;
  RETURN changed;
END;
$$;

REVOKE ALL ON FUNCTION ai_cost_mark_unknown_for_model_reconcile_scoped(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_cost_mark_unknown_for_model_reconcile_scoped(text,text,text,text) TO app_role;

REVOKE ALL ON FUNCTION ai_cost_mark_unknown_for_model_reconcile_scoped(text,text,text) FROM PUBLIC, app_role;
DROP FUNCTION IF EXISTS ai_cost_mark_unknown_for_model_reconcile_scoped(text,text,text);
