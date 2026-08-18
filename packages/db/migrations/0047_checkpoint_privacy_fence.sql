-- 0047_checkpoint_privacy_fence.sql
-- Checkpoint rows are a privacy data plane.  Owner-only RLS is insufficient:
-- an in-flight worker may otherwise write an old snapshot after a thread has
-- been revoked.  Every vendor-table mutation must carry the current per-thread
-- epoch, checked while locking the enrollment row.

ALTER TABLE checkpoint_thread_enrollment
  ADD COLUMN IF NOT EXISTS access_state text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS fence_epoch bigint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS purged_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='checkpoint_thread_enrollment_access_state_chk') THEN
    ALTER TABLE checkpoint_thread_enrollment
      ADD CONSTRAINT checkpoint_thread_enrollment_access_state_chk
      CHECK (access_state IN ('active','revoked','purged'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='checkpoint_thread_enrollment_fence_epoch_chk') THEN
    ALTER TABLE checkpoint_thread_enrollment
      ADD CONSTRAINT checkpoint_thread_enrollment_fence_epoch_chk CHECK (fence_epoch >= 1);
  END IF;
END $$;

-- The actual erasure workflow is intentionally asynchronous.  This request
-- ledger prevents an API response from claiming physical deletion before all
-- sinks have receipts.  No broad DELETE privilege is granted to app_role.
CREATE TABLE IF NOT EXISTS privacy_erasure_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('resume_data','interview_data','account_data')),
  subject_id text NOT NULL,
  idempotency_key_hash text NOT NULL,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','fenced','purging','pending_external','completed','partial_failed')),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, idempotency_key_hash)
);
ALTER TABLE privacy_erasure_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_erasure_request FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS privacy_erasure_request_owner ON privacy_erasure_request;
CREATE POLICY privacy_erasure_request_owner ON privacy_erasure_request
  FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
GRANT SELECT, INSERT ON privacy_erasure_request TO app_role;

CREATE TABLE IF NOT EXISTS privacy_deletion_target (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES privacy_erasure_request(id) ON DELETE RESTRICT,
  sink text NOT NULL CHECK (sink IN ('checkpoint_rows','interview_job_payload','event','report','vector','redis','oss','langfuse')),
  resource_hmac text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','leased','erased','retention_pending','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  receipt_hash text,
  deleted_count bigint NOT NULL DEFAULT 0 CHECK (deleted_count >= 0),
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, sink, resource_hmac)
);
-- M8：resource_hmac 强制 64-hex（无 ':' 无 '\n'），与 domain 侧 sign 校验对齐，保证
-- canonical target-set digest 的 "kind:resource" 分隔符无歧义。所有现有写入（0048/0058
-- 的 encode(hmac(...),'hex') 与 proof fixture）均为 64-hex，此约束向后兼容。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='privacy_deletion_target_resource_hmac_chk') THEN
    ALTER TABLE privacy_deletion_target
      ADD CONSTRAINT privacy_deletion_target_resource_hmac_chk CHECK (resource_hmac ~ '^[a-f0-9]{64}$');
  END IF;
END $$;
ALTER TABLE privacy_deletion_target ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_deletion_target FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS privacy_deletion_target_owner ON privacy_deletion_target;
CREATE POLICY privacy_deletion_target_owner ON privacy_deletion_target
  FOR ALL TO app_role
  USING (EXISTS (
    SELECT 1 FROM privacy_erasure_request r
     WHERE r.id=privacy_deletion_target.request_id
       AND r.owner_user_id=current_setting('app.principal_user', true)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM privacy_erasure_request r
     WHERE r.id=privacy_deletion_target.request_id
       AND r.owner_user_id=current_setting('app.principal_user', true)
  ));
GRANT SELECT, INSERT ON privacy_deletion_target TO app_role;

-- Narrow capability for the synchronous *fencing* phase.  It can only revoke
-- the caller's currently active thread and advance the epoch; no application
-- role receives a generic enrollment UPDATE or purge capability.
CREATE OR REPLACE FUNCTION revoke_checkpoint_thread(target_thread text) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE next_epoch bigint;
BEGIN
  UPDATE checkpoint_thread_enrollment
     SET access_state='revoked', fence_epoch=fence_epoch+1, revoked_at=now()
   WHERE thread_id=target_thread
     AND owner_user_id=current_setting('app.principal_user', true)
     AND access_state='active'
   RETURNING fence_epoch INTO next_epoch;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'checkpoint_privacy_fenced' USING ERRCODE='42501';
  END IF;
  RETURN next_epoch;
END $$;
GRANT EXECUTE ON FUNCTION revoke_checkpoint_thread(text) TO app_role;

CREATE OR REPLACE FUNCTION assert_checkpoint_privacy_fence() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  target_thread text;
BEGIN
  IF TG_OP='DELETE' THEN target_thread := OLD.thread_id; ELSE target_thread := NEW.thread_id; END IF;
  -- Key-share serializes a revoke against a late Saver mutation.  If the write
  -- wins first, the subsequent purge sees and deletes it; if revoke wins, the
  -- old epoch fails here and cannot resurrect the thread.
  PERFORM 1 FROM checkpoint_thread_enrollment e
   WHERE e.thread_id=target_thread
     AND e.owner_user_id=current_setting('app.principal_user', true)
     AND e.access_state='active'
     AND current_setting('app.checkpoint_thread_id', true)=target_thread
     AND current_setting('app.checkpoint_epoch', true)=e.fence_epoch::text
   FOR KEY SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'checkpoint_privacy_fenced'
      USING ERRCODE='42501', DETAIL='thread is revoked, missing, or the checkpoint epoch is stale';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS checkpoints_privacy_fence ON checkpoints;
CREATE TRIGGER checkpoints_privacy_fence
  BEFORE INSERT OR UPDATE OR DELETE ON checkpoints
  FOR EACH ROW EXECUTE FUNCTION assert_checkpoint_privacy_fence();
DROP TRIGGER IF EXISTS checkpoint_blobs_privacy_fence ON checkpoint_blobs;
CREATE TRIGGER checkpoint_blobs_privacy_fence
  BEFORE INSERT OR UPDATE OR DELETE ON checkpoint_blobs
  FOR EACH ROW EXECUTE FUNCTION assert_checkpoint_privacy_fence();
DROP TRIGGER IF EXISTS checkpoint_writes_privacy_fence ON checkpoint_writes;
CREATE TRIGGER checkpoint_writes_privacy_fence
  BEFORE INSERT OR UPDATE OR DELETE ON checkpoint_writes
  FOR EACH ROW EXECUTE FUNCTION assert_checkpoint_privacy_fence();

-- RLS performs the inexpensive visibility check; the trigger above is the
-- MVCC-safe write barrier.  Both intentionally require an explicit thread
-- context, never only a user identity.
DROP POLICY IF EXISTS checkpoints_owner ON checkpoints;
CREATE POLICY checkpoints_owner ON checkpoints FOR ALL TO app_role
  USING (EXISTS (SELECT 1 FROM checkpoint_thread_enrollment e
    WHERE e.thread_id=checkpoints.thread_id
      AND e.owner_user_id=current_setting('app.principal_user', true)
      AND e.access_state='active'
      AND current_setting('app.checkpoint_thread_id', true)=checkpoints.thread_id
      AND current_setting('app.checkpoint_epoch', true)=e.fence_epoch::text))
  WITH CHECK (EXISTS (SELECT 1 FROM checkpoint_thread_enrollment e
    WHERE e.thread_id=checkpoints.thread_id
      AND e.owner_user_id=current_setting('app.principal_user', true)
      AND e.access_state='active'
      AND current_setting('app.checkpoint_thread_id', true)=checkpoints.thread_id
      AND current_setting('app.checkpoint_epoch', true)=e.fence_epoch::text));

DROP POLICY IF EXISTS checkpoint_blobs_owner ON checkpoint_blobs;
CREATE POLICY checkpoint_blobs_owner ON checkpoint_blobs FOR ALL TO app_role
  USING (EXISTS (SELECT 1 FROM checkpoint_thread_enrollment e
    WHERE e.thread_id=checkpoint_blobs.thread_id
      AND e.owner_user_id=current_setting('app.principal_user', true)
      AND e.access_state='active'
      AND current_setting('app.checkpoint_thread_id', true)=checkpoint_blobs.thread_id
      AND current_setting('app.checkpoint_epoch', true)=e.fence_epoch::text))
  WITH CHECK (EXISTS (SELECT 1 FROM checkpoint_thread_enrollment e
    WHERE e.thread_id=checkpoint_blobs.thread_id
      AND e.owner_user_id=current_setting('app.principal_user', true)
      AND e.access_state='active'
      AND current_setting('app.checkpoint_thread_id', true)=checkpoint_blobs.thread_id
      AND current_setting('app.checkpoint_epoch', true)=e.fence_epoch::text));

DROP POLICY IF EXISTS checkpoint_writes_owner ON checkpoint_writes;
CREATE POLICY checkpoint_writes_owner ON checkpoint_writes FOR ALL TO app_role
  USING (EXISTS (SELECT 1 FROM checkpoint_thread_enrollment e
    WHERE e.thread_id=checkpoint_writes.thread_id
      AND e.owner_user_id=current_setting('app.principal_user', true)
      AND e.access_state='active'
      AND current_setting('app.checkpoint_thread_id', true)=checkpoint_writes.thread_id
      AND current_setting('app.checkpoint_epoch', true)=e.fence_epoch::text))
  WITH CHECK (EXISTS (SELECT 1 FROM checkpoint_thread_enrollment e
    WHERE e.thread_id=checkpoint_writes.thread_id
      AND e.owner_user_id=current_setting('app.principal_user', true)
      AND e.access_state='active'
      AND current_setting('app.checkpoint_thread_id', true)=checkpoint_writes.thread_id
      AND current_setting('app.checkpoint_epoch', true)=e.fence_epoch::text));
