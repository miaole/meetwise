-- 0048_checkpoint_physical_erasure.sql
--
-- 0047 stops future checkpoint writes.  This migration adds the *separate*
-- destructive capability needed to remove a revoked thread without handing
-- app_role a generic DELETE privilege.  API callers can only create/fence a
-- request; a distinct worker role must claim and purge its PostgreSQL target.
-- External sinks deliberately remain retention_pending until their own
-- receipt-backed executors exist.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='privacy_api_owner') THEN
    CREATE ROLE privacy_api_owner NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='privacy_worker_owner') THEN
    CREATE ROLE privacy_worker_owner NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='privacy_worker_executor') THEN
    CREATE ROLE privacy_worker_executor NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;

-- SECURITY DEFINER functions must never resolve attacker-created objects in
-- public.  Runtime roles receive USAGE only; no runtime role receives CREATE.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO privacy_api_owner, privacy_worker_owner, privacy_worker_executor;

ALTER TABLE privacy_deletion_target
  ADD COLUMN IF NOT EXISTS lease_owner text,
  ADD COLUMN IF NOT EXISTS lease_token uuid,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS version bigint NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='privacy_deletion_target_version_chk') THEN
    ALTER TABLE privacy_deletion_target
      ADD CONSTRAINT privacy_deletion_target_version_chk CHECK (version >= 1);
  END IF;
END $$;

-- The target ledger intentionally exposes only an opaque resource_hmac to the
-- application.  The thread locator is held in a no-app-grant table that is
-- accessible only while a reviewed definer function is executing.
CREATE TABLE IF NOT EXISTS privacy_checkpoint_target (
  target_id uuid PRIMARY KEY REFERENCES privacy_deletion_target(id) ON DELETE RESTRICT,
  request_id uuid NOT NULL REFERENCES privacy_erasure_request(id) ON DELETE RESTRICT,
  owner_user_id text NOT NULL,
  thread_id text NOT NULL,
  fence_epoch bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, thread_id),
  CHECK (fence_epoch IS NULL OR fence_epoch >= 2)
);
ALTER TABLE privacy_checkpoint_target ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_checkpoint_target FORCE ROW LEVEL SECURITY;

-- Request/target tables were introduced before an executor existed.  Direct
-- app-role writes would let callers manufacture a fake lifecycle, so only the
-- reviewed functions below may now mutate them.
REVOKE ALL ON privacy_erasure_request, privacy_deletion_target FROM app_role;
REVOKE ALL ON privacy_checkpoint_target FROM PUBLIC, app_role;

-- Definer roles remain tenant-scoped: a forged app.principal_user is not an
-- authorization bypass for an arbitrary DB login because PUBLIC never gets
-- EXECUTE and the runtime login has no direct access to either definer role.
GRANT SELECT, INSERT, UPDATE ON privacy_erasure_request, privacy_deletion_target TO privacy_api_owner;
GRANT SELECT, INSERT ON privacy_checkpoint_target TO privacy_api_owner;
GRANT SELECT, UPDATE ON checkpoint_thread_enrollment TO privacy_api_owner;
GRANT SELECT ON interview TO privacy_api_owner;

GRANT SELECT, UPDATE ON privacy_erasure_request, privacy_deletion_target TO privacy_worker_owner;
GRANT SELECT, UPDATE ON privacy_checkpoint_target, checkpoint_thread_enrollment TO privacy_worker_owner;
GRANT SELECT, DELETE ON checkpoints, checkpoint_blobs, checkpoint_writes TO privacy_worker_owner;

DROP POLICY IF EXISTS privacy_erasure_request_api_owner ON privacy_erasure_request;
CREATE POLICY privacy_erasure_request_api_owner ON privacy_erasure_request
  FOR ALL TO privacy_api_owner
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
DROP POLICY IF EXISTS privacy_erasure_request_worker_owner ON privacy_erasure_request;
CREATE POLICY privacy_erasure_request_worker_owner ON privacy_erasure_request
  FOR ALL TO privacy_worker_owner
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

DROP POLICY IF EXISTS privacy_deletion_target_api_owner ON privacy_deletion_target;
CREATE POLICY privacy_deletion_target_api_owner ON privacy_deletion_target
  FOR ALL TO privacy_api_owner
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
DROP POLICY IF EXISTS privacy_deletion_target_worker_owner ON privacy_deletion_target;
CREATE POLICY privacy_deletion_target_worker_owner ON privacy_deletion_target
  FOR ALL TO privacy_worker_owner
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

DROP POLICY IF EXISTS privacy_checkpoint_target_api_owner ON privacy_checkpoint_target;
CREATE POLICY privacy_checkpoint_target_api_owner ON privacy_checkpoint_target
  FOR ALL TO privacy_api_owner
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
DROP POLICY IF EXISTS privacy_checkpoint_target_worker_owner ON privacy_checkpoint_target;
CREATE POLICY privacy_checkpoint_target_worker_owner ON privacy_checkpoint_target
  FOR ALL TO privacy_worker_owner
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

DROP POLICY IF EXISTS checkpoint_thread_enrollment_privacy_api_owner ON checkpoint_thread_enrollment;
CREATE POLICY checkpoint_thread_enrollment_privacy_api_owner ON checkpoint_thread_enrollment
  FOR ALL TO privacy_api_owner
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
DROP POLICY IF EXISTS checkpoint_thread_enrollment_privacy_worker_owner ON checkpoint_thread_enrollment;
CREATE POLICY checkpoint_thread_enrollment_privacy_worker_owner ON checkpoint_thread_enrollment
  FOR ALL TO privacy_worker_owner
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_privacy_api_owner ON interview;
CREATE POLICY interview_privacy_api_owner ON interview
  FOR SELECT TO privacy_api_owner
  USING (owner_user_id=current_setting('app.principal_user', true));

-- No request can be created for a thread and later allow that same thread to
-- re-enroll.  This closes the no-checkpoint-yet race as well as the ordinary
-- revoked-row case handled by enrollCheckpointThread().
CREATE OR REPLACE FUNCTION assert_checkpoint_enrollment_not_privacy_fenced() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  PERFORM 1
    FROM privacy_checkpoint_target pt
    JOIN privacy_erasure_request r ON r.id=pt.request_id
   WHERE pt.thread_id=NEW.thread_id
     AND pt.owner_user_id=NEW.owner_user_id
     AND r.status IN ('fenced','purging','pending_external','completed');
  IF FOUND THEN
    RAISE EXCEPTION 'checkpoint_privacy_fenced' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION assert_checkpoint_enrollment_not_privacy_fenced() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_checkpoint_enrollment_not_privacy_fenced() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS checkpoint_enrollment_privacy_tombstone ON checkpoint_thread_enrollment;
CREATE TRIGGER checkpoint_enrollment_privacy_tombstone
  BEFORE INSERT ON checkpoint_thread_enrollment
  FOR EACH ROW EXECUTE FUNCTION assert_checkpoint_enrollment_not_privacy_fenced();

-- Revoke is deliberately an API-only capability.  In particular, PUBLIC must
-- not be able to set a custom GUC and invoke this SECURITY DEFINER function.
ALTER FUNCTION revoke_checkpoint_thread(text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION revoke_checkpoint_thread(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION revoke_checkpoint_thread(text) TO app_role;

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
  new_epoch bigint;
  sink_name text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_thread IS NULL OR length(target_thread)=0
     OR request_key_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'privacy_erasure_request_invalid' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM interview i WHERE i.id=target_thread AND i.owner_user_id=principal;
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

-- A DELETE is accepted only when a target/lease installed by the reviewed
-- purge function is current.  app_role cannot read the target ledger or call
-- claim, so it cannot manufacture the 128-bit lease capability.  Keeping this
-- function SECURITY DEFINER also preserves the short row lock that makes a
-- normal Saver write race safely with revoke.
CREATE OR REPLACE FUNCTION assert_checkpoint_privacy_fence() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  target_thread text;
BEGIN
  IF TG_OP='DELETE' THEN target_thread := OLD.thread_id; ELSE target_thread := NEW.thread_id; END IF;
  IF TG_OP='DELETE' AND current_setting('app.privacy_target_id', true) IS NOT NULL
     AND current_setting('app.privacy_lease_token', true) IS NOT NULL THEN
    PERFORM 1
      FROM privacy_checkpoint_target pt
      JOIN privacy_deletion_target t ON t.id=pt.target_id
      JOIN privacy_erasure_request r ON r.id=pt.request_id
      LEFT JOIN checkpoint_thread_enrollment e ON e.thread_id=pt.thread_id AND e.owner_user_id=pt.owner_user_id
     WHERE pt.target_id::text=current_setting('app.privacy_target_id', true)
       AND pt.thread_id=target_thread
       AND pt.owner_user_id=current_setting('app.principal_user', true)
       AND t.status='leased'
       AND t.lease_token::text=current_setting('app.privacy_lease_token', true)
       AND r.owner_user_id=pt.owner_user_id
       AND (pt.fence_epoch IS NULL OR (e.access_state='revoked' AND e.fence_epoch=pt.fence_epoch));
    IF NOT FOUND THEN
      RAISE EXCEPTION 'checkpoint_privacy_purge_not_authorized' USING ERRCODE='42501';
    END IF;
    RETURN OLD;
  END IF;
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
ALTER FUNCTION assert_checkpoint_privacy_fence() OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION assert_checkpoint_privacy_fence() FROM PUBLIC, app_role;

DROP POLICY IF EXISTS checkpoints_privacy_worker_delete ON checkpoints;
CREATE POLICY checkpoints_privacy_worker_delete ON checkpoints
  FOR DELETE TO privacy_worker_owner
  USING (current_setting('app.privacy_target_id', true) IS NOT NULL);
DROP POLICY IF EXISTS checkpoints_privacy_worker_read ON checkpoints;
CREATE POLICY checkpoints_privacy_worker_read ON checkpoints
  FOR SELECT TO privacy_worker_owner
  USING (current_setting('app.privacy_target_id', true) IS NOT NULL);
DROP POLICY IF EXISTS checkpoint_blobs_privacy_worker_delete ON checkpoint_blobs;
CREATE POLICY checkpoint_blobs_privacy_worker_delete ON checkpoint_blobs
  FOR DELETE TO privacy_worker_owner
  USING (current_setting('app.privacy_target_id', true) IS NOT NULL);
DROP POLICY IF EXISTS checkpoint_blobs_privacy_worker_read ON checkpoint_blobs;
CREATE POLICY checkpoint_blobs_privacy_worker_read ON checkpoint_blobs
  FOR SELECT TO privacy_worker_owner
  USING (current_setting('app.privacy_target_id', true) IS NOT NULL);
DROP POLICY IF EXISTS checkpoint_writes_privacy_worker_delete ON checkpoint_writes;
CREATE POLICY checkpoint_writes_privacy_worker_delete ON checkpoint_writes
  FOR DELETE TO privacy_worker_owner
  USING (current_setting('app.privacy_target_id', true) IS NOT NULL);
DROP POLICY IF EXISTS checkpoint_writes_privacy_worker_read ON checkpoint_writes;
CREATE POLICY checkpoint_writes_privacy_worker_read ON checkpoint_writes
  FOR SELECT TO privacy_worker_owner
  USING (current_setting('app.privacy_target_id', true) IS NOT NULL);

CREATE OR REPLACE FUNCTION privacy_claim_checkpoint_target(
  target uuid,
  worker text,
  lease_seconds integer DEFAULT 60
) RETURNS TABLE (target_id uuid, lease_token uuid, status text, attempt integer)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  target_row record;
  token uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR worker IS NULL OR length(worker)=0
     OR lease_seconds < 5 OR lease_seconds > 600 THEN
    RAISE EXCEPTION 'privacy_target_claim_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.*,pt.owner_user_id INTO target_row
    FROM privacy_deletion_target t JOIN privacy_checkpoint_target pt ON pt.target_id=t.id
   WHERE t.id=target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'privacy_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.status='erased' THEN
    RETURN QUERY SELECT target_row.id,target_row.lease_token,target_row.status,target_row.attempts;
    RETURN;
  END IF;
  IF target_row.status='leased' AND target_row.lease_expires_at >= now() THEN
    RETURN;
  END IF;
  IF target_row.status NOT IN ('pending','leased','failed') THEN
    RETURN;
  END IF;
  token := gen_random_uuid();
  UPDATE privacy_deletion_target AS d
     SET status='leased',lease_owner=worker,lease_token=token,
         lease_expires_at=now()+(lease_seconds||' seconds')::interval,
         attempts=d.attempts+1,version=d.version+1,updated_at=now(),last_error_code=NULL
   WHERE d.id=target_row.id AND d.version=target_row.version
   RETURNING d.id,d.lease_token,d.status,d.attempts INTO target_id,lease_token,status,attempt;
  IF NOT FOUND THEN RETURN; END IF;
  RETURN NEXT;
END $$;
ALTER FUNCTION privacy_claim_checkpoint_target(uuid,text,integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_claim_checkpoint_target(uuid,text,integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_claim_checkpoint_target(uuid,text,integer) TO privacy_worker_executor;

-- The executor gets a minimal dispatch feed (target id + owner only).  It
-- never receives resource locators, request hashes, answers, or checkpoint
-- contents; the subsequent owner-scoped claim is still the CAS authority.
CREATE OR REPLACE FUNCTION privacy_list_claimable_checkpoint_targets(
  max_items integer DEFAULT 32
) RETURNS TABLE (target_id uuid, owner_user_id text)
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT pt.target_id,pt.owner_user_id
    FROM privacy_checkpoint_target pt
    JOIN privacy_deletion_target t ON t.id=pt.target_id
   WHERE max_items BETWEEN 1 AND 128
     AND (t.status='pending' OR (t.status='leased' AND t.lease_expires_at < now()) OR t.status='failed')
   ORDER BY t.created_at,pt.target_id
   LIMIT max_items
$$;
ALTER FUNCTION privacy_list_claimable_checkpoint_targets(integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_list_claimable_checkpoint_targets(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_list_claimable_checkpoint_targets(integer) TO privacy_worker_executor;

CREATE OR REPLACE FUNCTION privacy_purge_checkpoint_target(
  target uuid,
  token uuid
) RETURNS TABLE (target_id uuid, status text, deleted_count bigint, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  target_row record;
  removed_writes bigint := 0;
  removed_blobs bigint := 0;
  removed_checkpoints bigint := 0;
  remaining bigint := 0;
  final_request_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR token IS NULL THEN
    RAISE EXCEPTION 'privacy_target_purge_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.id,t.request_id,t.status,t.lease_token,t.lease_expires_at,t.version,
         pt.thread_id,pt.owner_user_id,pt.fence_epoch
    INTO target_row
    FROM privacy_deletion_target t JOIN privacy_checkpoint_target pt ON pt.target_id=t.id
   WHERE t.id=target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'privacy_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.status='erased' THEN
    SELECT r.status INTO final_request_status FROM privacy_erasure_request r WHERE r.id=target_row.request_id;
    RETURN QUERY SELECT target_row.id,'erased'::text,0::bigint,final_request_status;
    RETURN;
  END IF;
  IF target_row.status <> 'leased' OR target_row.lease_token IS DISTINCT FROM token
     OR target_row.lease_expires_at < now() THEN
    RAISE EXCEPTION 'privacy_target_lease_lost' USING ERRCODE='42501';
  END IF;

  PERFORM set_config('app.privacy_target_id', target_row.id::text, true);
  PERFORM set_config('app.privacy_lease_token', token::text, true);
  DELETE FROM checkpoint_writes WHERE thread_id=target_row.thread_id;
  GET DIAGNOSTICS removed_writes = ROW_COUNT;
  DELETE FROM checkpoint_blobs WHERE thread_id=target_row.thread_id;
  GET DIAGNOSTICS removed_blobs = ROW_COUNT;
  DELETE FROM checkpoints WHERE thread_id=target_row.thread_id;
  GET DIAGNOSTICS removed_checkpoints = ROW_COUNT;
  SELECT
    (SELECT count(*) FROM checkpoint_writes WHERE thread_id=target_row.thread_id)
    + (SELECT count(*) FROM checkpoint_blobs WHERE thread_id=target_row.thread_id)
    + (SELECT count(*) FROM checkpoints WHERE thread_id=target_row.thread_id)
    INTO remaining;
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'privacy_checkpoint_residual_rows' USING ERRCODE='55000';
  END IF;
  IF target_row.fence_epoch IS NOT NULL THEN
    UPDATE checkpoint_thread_enrollment
       SET access_state='purged',purged_at=now()
     WHERE thread_id=target_row.thread_id AND owner_user_id=principal
       AND access_state='revoked' AND fence_epoch=target_row.fence_epoch;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'privacy_checkpoint_fence_lost' USING ERRCODE='42501';
    END IF;
  END IF;
  UPDATE privacy_deletion_target AS d
     SET status='erased',deleted_count=removed_writes+removed_blobs+removed_checkpoints,
         receipt_hash=encode(digest(target_row.id::text || ':' || token::text || ':' ||
           (removed_writes+removed_blobs+removed_checkpoints)::text, 'sha256'),'hex'),
         lease_owner=NULL,lease_token=NULL,lease_expires_at=NULL,version=d.version+1,updated_at=now()
   WHERE d.id=target_row.id AND d.status='leased' AND d.lease_token=token AND d.version=target_row.version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_target_complete_cas_lost' USING ERRCODE='40001';
  END IF;
  -- F1：最终 CASE 必须纳入 receipts 判定（与 0078 的 privacy_purge_checkpoint_target
  -- 完全对齐，禁止单独重排/rebaseline 本迁移——0078 用 CREATE OR REPLACE 覆盖本函数，
  -- 但 0048 本体仍保留一份死锁-prone 版本的历史残留，故就地修掉以消除该残留）。若只按
  -- target.status 判定，当一个 sink 的 target 已 erased 但 privacy_deletion_receipt 仍留
  -- external_pending/failed_cleanup，会落入 ELSE→'completed'，命中 0091 的 no-forge-completed
  -- guard RAISE，从而回滚已完成的物理 DELETE 与 target.status='erased'，且因无 resolve 生命
  -- 周期而永久卡死。此处把 receipts 一并纳入，落在 pending_external/partial_failed 而非
  -- completed，既不触发 guard 也不回滚本地删除。privacy_deletion_receipt 由后置迁移 0091
  -- 创建；本函数体的该表引用在 plpgsql 首次执行时解析（CREATE 时不校验关系存在），故
  -- 0048 仍可独立应用。
  UPDATE privacy_erasure_request AS r
     SET status=CASE
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status IN ('pending','leased')) THEN 'purging'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='external_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='retention_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='failed_cleanup') THEN 'partial_failed'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='failed') THEN 'partial_failed'
       ELSE 'completed' END,
       version=r.version+1,updated_at=now()
   WHERE r.id=target_row.request_id
   RETURNING r.status INTO final_request_status;
  RETURN QUERY SELECT target_row.id,'erased'::text,removed_writes+removed_blobs+removed_checkpoints,final_request_status;
END $$;
ALTER FUNCTION privacy_purge_checkpoint_target(uuid,uuid) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_purge_checkpoint_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_checkpoint_target(uuid,uuid) TO privacy_worker_executor;

-- A runtime login may become the worker executor only through explicit
-- provisioning.  The API runtime is intentionally not a member.
REVOKE privacy_worker_executor FROM app_role;
