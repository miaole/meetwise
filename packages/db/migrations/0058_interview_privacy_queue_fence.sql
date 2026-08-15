-- 0058_interview_privacy_queue_fence.sql
--
-- A checkpoint fence alone cannot stop an answer that is still in the durable
-- interview queue.  This migration makes the interview row the serialization
-- point for *both* deletion and queue admission: a completed fence atomically
-- removes queued/running payloads, while all later admission/claim/load paths
-- must prove the interview is still privacy-active.

-- privacy_api_owner is the reviewed SECURITY DEFINER owner introduced by 0048.
-- It needs only owner-scoped UPDATE to cancel an open question and redact the
-- queue row; application logins continue to have no direct DELETE capability.
GRANT SELECT, UPDATE ON interview_job, interview_question TO privacy_api_owner;

DROP POLICY IF EXISTS interview_job_privacy_api_owner ON interview_job;
CREATE POLICY interview_job_privacy_api_owner ON interview_job
  FOR ALL TO privacy_api_owner
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

DROP POLICY IF EXISTS interview_question_privacy_api_owner ON interview_question;
CREATE POLICY interview_question_privacy_api_owner ON interview_question
  FOR ALL TO privacy_api_owner
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

-- Both admission and privacy_begin_checkpoint_erasure take this transaction
-- advisory lock before checking state.  Thus admission either commits first
-- and is redacted by the deletion transaction, or deletion commits first and
-- this routine fails before a caller can insert/claim/read a payload.  An
-- advisory lock avoids giving the definer UPDATE on the business interview.
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN RETURN false; END IF;

  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:' || target_interview));

  PERFORM 1
    FROM interview i
   WHERE i.id=target_interview AND i.owner_user_id=principal;
  IF NOT FOUND THEN RETURN false; END IF;

  PERFORM 1
    FROM privacy_checkpoint_target pt
    JOIN privacy_erasure_request r ON r.id=pt.request_id
   WHERE pt.thread_id=target_interview
     AND pt.owner_user_id=principal
     AND r.status IN ('requested','fenced','purging','pending_external','completed','partial_failed')
   LIMIT 1;
  RETURN NOT FOUND;
END $$;
ALTER FUNCTION interview_privacy_active(text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION interview_privacy_active(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;

CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    -- Deliberately collapse missing, cross-owner and deleted into one error;
    -- direct repository callers must not gain an existence oracle.
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
ALTER FUNCTION assert_interview_privacy_active(text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_interview_privacy_active(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;

-- Repositories are not a security boundary.  Direct app_role SQL must not
-- recreate a queue payload or a question after the API has returned 202.
-- Do not branch on `current_user` here: inside a SECURITY DEFINER trigger it
-- is always the function owner, which would accidentally exempt every
-- invoker.  The deletion transaction does not need a bypass: it clears jobs
-- and cancels questions before it creates privacy_checkpoint_target, so the
-- active predicate remains true for precisely those internal updates.
CREATE OR REPLACE FUNCTION enforce_interview_job_privacy_active()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  PERFORM assert_interview_privacy_active(NEW.interview_id);
  RETURN NEW;
END $$;
ALTER FUNCTION enforce_interview_job_privacy_active() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION enforce_interview_job_privacy_active() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS interview_job_privacy_active_write_guard ON interview_job;
CREATE TRIGGER interview_job_privacy_active_write_guard
  BEFORE INSERT OR UPDATE OF payload,status,lease_owner,lease_expires_at ON interview_job
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_job_privacy_active();

CREATE OR REPLACE FUNCTION enforce_interview_question_privacy_active()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  PERFORM assert_interview_privacy_active(NEW.interview_id);
  RETURN NEW;
END $$;
ALTER FUNCTION enforce_interview_question_privacy_active() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION enforce_interview_question_privacy_active() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS interview_question_privacy_active_write_guard ON interview_question;
CREATE TRIGGER interview_question_privacy_active_write_guard
  BEFORE INSERT OR UPDATE ON interview_question
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_question_privacy_active();

-- Replace the 0048 function so its existing idempotency/CAS contract remains
-- intact while the deletion transaction also takes the inverse row lock and
-- clears every queue payload before it returns `fenced`.
CREATE OR REPLACE FUNCTION privacy_begin_checkpoint_erasure(
  target_thread text,
  request_key_hash text
) RETURNS TABLE (
  request_id uuid,
  request_status text,
  checkpoint_target_id uuid,
  fence_epoch bigint,
  replayed boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  existing privacy_erasure_request%ROWTYPE;
  created_request uuid;
  created_target uuid;
  queue_target uuid;
  new_epoch bigint;
  sink_name text;
  redacted_jobs bigint := 0;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_thread IS NULL OR length(target_thread)=0
     OR request_key_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'privacy_erasure_request_invalid' USING ERRCODE='22023';
  END IF;

  -- The same transaction advisory lock is held by
  -- assert_interview_privacy_active().  This closes the
  -- admission-vs-delete time-of-check/time-of-use race without expanding the
  -- privacy definer's business-table privilege.
  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:' || target_thread));
  PERFORM 1 FROM interview i
   WHERE i.id=target_thread AND i.owner_user_id=principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_erasure_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing FROM privacy_erasure_request r
   WHERE r.owner_user_id=principal AND r.idempotency_key_hash=request_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> 'interview_data' OR existing.subject_id <> target_thread THEN
      RAISE EXCEPTION 'privacy_idempotency_payload_conflict' USING ERRCODE='23505';
    END IF;
    SELECT pt.target_id,pt.fence_epoch INTO created_target,new_epoch
      FROM privacy_checkpoint_target pt WHERE pt.request_id=existing.id AND pt.thread_id=target_thread;
    RETURN QUERY SELECT existing.id,existing.status,created_target,new_epoch,true;
    RETURN;
  END IF;

  INSERT INTO privacy_erasure_request(owner_user_id,scope,subject_id,idempotency_key_hash,status)
    VALUES (principal,'interview_data',target_thread,request_key_hash,'requested')
    RETURNING id INTO created_request;

  UPDATE checkpoint_thread_enrollment
     SET access_state='revoked',fence_epoch=checkpoint_thread_enrollment.fence_epoch+1,revoked_at=now()
   WHERE thread_id=target_thread AND owner_user_id=principal AND access_state='active'
   RETURNING checkpoint_thread_enrollment.fence_epoch INTO new_epoch;

  -- Question identity is a business projection, not an answer store.  It
  -- must nevertheless be closed so a stale browser cannot reserve a new job.
  UPDATE interview_question
     SET status='cancelled'
   WHERE owner_user_id=principal AND interview_id=target_thread
     AND status IN ('issued','queued');

  -- Do not leave either modern answer text or a pre-v50 resumeRaw transport
  -- field behind.  `done` prevents a worker that already selected metadata
  -- from materializing it; load queries also carry the active predicate.
  UPDATE interview_job
     SET status='done',payload='{}'::jsonb,lease_owner=NULL,lease_expires_at=NULL,
         last_error='privacy_fenced',version=version+1
   WHERE owner_user_id=principal AND interview_id=target_thread
     AND status IN ('queued','running');
  GET DIAGNOSTICS redacted_jobs = ROW_COUNT;

  INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac,status,deleted_count,receipt_hash)
    VALUES (
      created_request,
      'interview_job_payload',
      encode(hmac(target_thread || ':interview_job_payload:' || created_request::text, request_key_hash, 'sha256'),'hex'),
      'erased',
      redacted_jobs,
      encode(digest(created_request::text || ':interview_job_payload:' || redacted_jobs::text, 'sha256'),'hex')
    ) RETURNING id INTO queue_target;

  INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac,status)
    VALUES (
      created_request,
      'checkpoint_rows',
      encode(hmac(target_thread || ':checkpoint_rows:' || created_request::text, request_key_hash, 'sha256'),'hex'),
      'pending'
    ) RETURNING id INTO created_target;
  INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch)
    VALUES (created_target,created_request,principal,target_thread,new_epoch);

  -- Each external data plane is explicit.  No missing executor is interpreted
  -- as a successful deletion: these rows retain the request in non-complete.
  FOREACH sink_name IN ARRAY ARRAY['oss','redis','langfuse'] LOOP
    INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac,status)
      VALUES (
        created_request,
        sink_name,
        encode(hmac(target_thread || ':' || sink_name || ':' || created_request::text, request_key_hash, 'sha256'),'hex'),
        'retention_pending'
      );
  END LOOP;
  UPDATE privacy_erasure_request
     SET status='fenced',updated_at=now(),version=version+1
   WHERE id=created_request AND status='requested';
  RETURN QUERY SELECT created_request,'fenced'::text,created_target,new_epoch,false;
END $$;
ALTER FUNCTION privacy_begin_checkpoint_erasure(text,text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION privacy_begin_checkpoint_erasure(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION privacy_begin_checkpoint_erasure(text,text) TO app_role;
