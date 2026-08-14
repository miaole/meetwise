-- A concurrent recovery can take its initial "no attempt" snapshot just
-- before another executor commits the one dispatch attempt.  Re-read the
-- durable attempt after losing the prepared -> dispatching compare-and-set:
-- matching callers are followers (false), never a second provider sender.

CREATE OR REPLACE FUNCTION rag_control.rag_mark_request_dispatching(
  p_request_id text, p_provider_policy_revision text, p_provider_key_digest text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE prior public.rag_control_dispatch_attempt%ROWTYPE;
BEGIN
  IF p_provider_key_digest !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'rag_control_dispatch_digest_invalid' USING ERRCODE='check_violation';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.rag_control_dispatch_subject WHERE request_id=p_request_id
  ) THEN
    RAISE EXCEPTION 'rag_control_dispatch_subject_missing' USING ERRCODE='check_violation';
  END IF;

  SELECT * INTO prior
    FROM public.rag_control_dispatch_attempt
   WHERE request_id=p_request_id
   FOR UPDATE;
  IF FOUND THEN
    IF prior.provider_policy_revision=p_provider_policy_revision
       AND prior.provider_idempotency_key_digest=p_provider_key_digest
       AND prior.state='dispatching' THEN
      RETURN false;
    END IF;
    RAISE EXCEPTION 'rag_control_dispatch_conflict' USING ERRCODE='unique_violation';
  END IF;

  UPDATE public.rag_control_request
     SET outcome='dispatching'
   WHERE request_id=p_request_id
     AND outcome='prepared';
  IF FOUND THEN
    INSERT INTO public.rag_control_dispatch_attempt(
      request_id, provider_policy_revision, provider_idempotency_key_digest, state, dispatched_at
    ) VALUES (
      p_request_id, p_provider_policy_revision, p_provider_key_digest, 'dispatching', clock_timestamp()
    );
    RETURN true;
  END IF;

  -- In READ COMMITTED a concurrent winner may have committed after our first
  -- SELECT but before the compare-and-set.  Its exact durable attempt is the
  -- sole admissible follower result; every other state/key is fail-closed.
  SELECT * INTO prior
    FROM public.rag_control_dispatch_attempt
   WHERE request_id=p_request_id
   FOR UPDATE;
  IF FOUND
     AND prior.provider_policy_revision=p_provider_policy_revision
     AND prior.provider_idempotency_key_digest=p_provider_key_digest
     AND prior.state='dispatching' THEN
    RETURN false;
  END IF;
  IF FOUND THEN
    RAISE EXCEPTION 'rag_control_dispatch_conflict' USING ERRCODE='unique_violation';
  END IF;
  RAISE EXCEPTION 'rag_control_request_not_prepared' USING ERRCODE='check_violation';
END;
$$;
