-- 0078_privacy_worker_parent_request_guard.sql
--
-- 0076 pauses every historical unfinished request and clears its target
-- leases.  The worker procedures must nevertheless treat the parent request
-- as the authorization boundary too: a later operator mistake, fixture, or
-- future code path must not make a pending child under authorization_paused
-- claimable again.

-- The reviewed dispatcher evaluates the parent status but still returns only
-- a target id and owner.  FORCE RLS otherwise hides every parent row from its
-- dedicated definer because tenant-scoped worker policies require a principal
-- GUC, which dispatch deliberately does not accept.
DROP POLICY IF EXISTS privacy_erasure_request_worker_dispatch ON privacy_erasure_request;
CREATE POLICY privacy_erasure_request_worker_dispatch ON privacy_erasure_request
  FOR SELECT TO privacy_worker_owner
  USING (true);

CREATE OR REPLACE FUNCTION privacy_list_claimable_checkpoint_targets(
  max_items integer DEFAULT 32
) RETURNS TABLE (target_id uuid, owner_user_id text)
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT pt.target_id,pt.owner_user_id
    FROM privacy_checkpoint_target pt
    JOIN privacy_deletion_target t ON t.id=pt.target_id
    JOIN privacy_erasure_request r ON r.id=t.request_id
   WHERE max_items BETWEEN 1 AND 128
     AND r.status IN ('fenced','purging','pending_external')
     AND (t.status='pending' OR (t.status='leased' AND t.lease_expires_at < now()) OR t.status='failed')
   ORDER BY t.created_at,pt.target_id
   LIMIT max_items
$$;


GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION privacy_list_claimable_checkpoint_targets(integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_list_claimable_checkpoint_targets(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_list_claimable_checkpoint_targets(integer) TO privacy_worker_executor;

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
  SELECT t.*,pt.owner_user_id,r.status AS request_status INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_checkpoint_target pt ON pt.target_id=t.id
    JOIN privacy_erasure_request r ON r.id=t.request_id
   WHERE t.id=target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'privacy_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RETURN;
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
         pt.thread_id,pt.owner_user_id,pt.fence_epoch,r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_checkpoint_target pt ON pt.target_id=t.id
    JOIN privacy_erasure_request r ON r.id=t.request_id
   WHERE t.id=target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'privacy_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RAISE EXCEPTION 'privacy_target_request_not_active' USING ERRCODE='42501';
  END IF;
  IF target_row.status='erased' THEN
    RETURN QUERY SELECT target_row.id,'erased'::text,0::bigint,target_row.request_status;
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
  -- F1：最终 CASE 必须纳入 receipts 判定。若只按 target.status 判定，当一个 sink 的
  -- target 已 erased 但 privacy_deletion_receipt 仍留 external_pending/failed_cleanup，
  -- 会落入 ELSE→'completed'，命中 0091 的 no-forge-completed guard RAISE，从而回滚本已
  -- 完成的物理 DELETE 与 target.status='erased'，且因无 resolve 生命周期而永久卡死。
  -- 这里把 receipts 一并纳入，落在 pending_external/partial_failed 而非 completed，
  -- 既不触发 guard 也不回滚本地删除；待外部确认（privacy_resolve_deletion_receipt）后
  -- 再由该函数重估推进到 completed。
  -- 与 0048 的 privacy_purge_checkpoint_target 完全对齐（0048 的最终 CASE 已就地修成
  -- 同一判定）；两处互指，禁止单独重排/rebaseline 其中任一迁移——否则 0048 的历史死锁版
  -- 残留会重新成为唯一真相。
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
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;


REVOKE ALL ON FUNCTION privacy_purge_checkpoint_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_checkpoint_target(uuid,uuid) TO privacy_worker_executor;
