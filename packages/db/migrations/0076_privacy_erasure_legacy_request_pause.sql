-- 0076_privacy_erasure_legacy_request_pause.sql
--
-- 0075 removes the forged-GUC public admission path.  A database upgraded
-- from an earlier release can nevertheless already contain a pending, leased,
-- failed, or retention-pending target created through that path.  The privacy
-- worker has a separate executor capability and would otherwise continue that
-- pre-pause work after upgrade.  That is not a valid authorization decision.
--
-- This is deliberately a pause, not a completed erasure or a retryable
-- failure.  A future reviewed authorization-snapshot issuer must inventory
-- and explicitly re-authorize such requests before any target can run again.


GRANT CREATE ON SCHEMA public TO privacy_api_owner;
ALTER TABLE privacy_erasure_request
  DROP CONSTRAINT IF EXISTS privacy_erasure_request_status_check;
ALTER TABLE privacy_erasure_request
  ADD CONSTRAINT privacy_erasure_request_status_check
  CHECK (status IN (
    'requested','fenced','purging','pending_external','completed','partial_failed',
    'authorization_paused'
  ));

ALTER TABLE privacy_deletion_target
  DROP CONSTRAINT IF EXISTS privacy_deletion_target_status_check;
ALTER TABLE privacy_deletion_target
  ADD CONSTRAINT privacy_deletion_target_status_check
  CHECK (status IN (
    'pending','leased','erased','retention_pending','failed','authorization_paused'
  ));

-- This migration runs transactionally.  Once it obtains the target-table lock,
-- a worker that fetched a target before the upgrade can no longer claim it:
-- the claim function accepts only pending/leased/failed, all of which are
-- converted below before the migration commits.  Expired or live lease tokens
-- are removed so an operator cannot mistake them for an approved continuation.
UPDATE privacy_deletion_target
   SET status='authorization_paused',
       lease_owner=NULL,
       lease_token=NULL,
       lease_expires_at=NULL,
       -- A pause is visible in status.  Do not overwrite a previous failure
       -- classification that a future reviewed re-authorization workflow may
       -- need to audit before deciding whether continuation is allowed.
       last_error_code=COALESCE(last_error_code,'privacy_erasure_authorization_paused'),
       version=version+1,
       updated_at=now()
 WHERE status IN ('pending','leased','retention_pending','failed');

-- Preserve a previously-established interview/checkpoint fence, but make the
-- authorization state visible and terminal for background dispatch.  Also
-- pause a malformed/crash-left `requested` row with no child target: it is an
-- uncompleted deletion authorization and must not be replayed later under the
-- old GUC shape.  Already completed requests are immutable historical
-- receipts; they have no claimable target and are not relabelled as a new
-- deletion result.
UPDATE privacy_erasure_request AS r
   SET status='authorization_paused',
       version=r.version+1,
       updated_at=now()
 WHERE r.status <> 'completed';

-- A paused historic request must remain a privacy fence.  Otherwise deleting
-- its enrollment row would accidentally reopen a checkpoint thread even
-- though no re-authorized deletion flow exists yet.
CREATE OR REPLACE FUNCTION assert_checkpoint_enrollment_not_privacy_fenced() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  PERFORM 1
    FROM privacy_checkpoint_target pt
    JOIN privacy_erasure_request r ON r.id=pt.request_id
   WHERE pt.thread_id=NEW.thread_id
     AND pt.owner_user_id=NEW.owner_user_id
     AND r.status IN ('fenced','purging','pending_external','completed','authorization_paused');
  IF FOUND THEN
    RAISE EXCEPTION 'checkpoint_privacy_fenced' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;

ALTER FUNCTION assert_checkpoint_enrollment_not_privacy_fenced() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_checkpoint_enrollment_not_privacy_fenced() FROM PUBLIC, app_role;

-- Queue/read admission also remains closed for paused legacy requests.  This
-- has no public delete API: it only prevents a prior fence from becoming an
-- unintended re-enrollment or a new payload write.
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
     AND r.status IN ('requested','fenced','purging','pending_external','completed','partial_failed','authorization_paused')
   LIMIT 1;
  RETURN NOT FOUND;
END $$;
ALTER FUNCTION interview_privacy_active(text) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION interview_privacy_active(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
