-- ═══════════════════════════════════════════════════════════════════════════════
-- 0125：vector_chunk kind=memory 进入账户删除回执（盘点+围栏，不宣称完整删除）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 闭合 0096 / PRD-TEST-015 已登记的缺口：MEM-00（0093）只删 memory_fact /
-- memory_index_generation / memory_context_snapshot，未覆盖 vector_chunk。
-- INT 的 sink='vector' 无 interview 作用域键，面试删除诚实不建 target。
--
-- 本迁移只做账户轨道上一件可证明的事：
--   ① 扩 privacy_deletion_target.sink CHECK，加入 memory_vector_chunk；
--   ② 写围栏：存在本 sink 的账户账本后，拒 kind='memory' 的迟到 INSERT/UPDATE；
--   ③ begin/claim/purge：只物理 DELETE owner=principal AND kind='memory'，残留=0；
--   ④ 永不 DELETE kind='qbank'。
--
-- 铁律：复用冻结 PrivacyAuthorizationIssuer（0091），不重写 0093 三 sink 形状。
-- 不闭合 user_memory / ai_invocation_trace / OSS / Redis / Langfuse / 备份。
-- 公开 DELETE 入口保持 503。

-- ═══════════════════════════════════════════════════════════════════════════════
-- A. 扩展 sink 枚举
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname FROM pg_constraint
   WHERE conrelid = 'privacy_deletion_target'::regclass
     AND contype = 'c'
     AND (conname = 'privacy_deletion_target_sink_check'
          OR pg_get_constraintdef(oid) LIKE '%sink%')
   LIMIT 1;
  IF cname IS NULL THEN
    RAISE EXCEPTION 'privacy_deletion_target_sink_check_missing';
  END IF;
  EXECUTE format('ALTER TABLE privacy_deletion_target DROP CONSTRAINT %I', cname);
END $$;

GRANT CREATE ON SCHEMA public TO privacy_api_owner;
ALTER TABLE privacy_deletion_target ADD CONSTRAINT privacy_deletion_target_sink_check
  CHECK (sink IN (
    'checkpoint_rows','interview_job_payload','event','report','vector','redis','oss','langfuse',
    'interview_answer_artifact',
    'memory_event','memory_summary','memory_fact','memory_embedding','memory_cache','memory_context_snapshot','memory_trace',
    'ai_graph_run',
    'conversation_event','conversation_event_artifact',
    'context_compression_snapshot','context_compression_dispatch',
    -- 0125：owner 级记忆向量块（非 INT vector，非 qbank）
    'memory_vector_chunk'
  ));

-- ═══════════════════════════════════════════════════════════════════════════════
-- B. 表级 ACL + RLS：privacy_worker_owner 只能在 purge 事务内删 memory 行
-- ═══════════════════════════════════════════════════════════════════════════════
GRANT SELECT, DELETE ON vector_chunk TO privacy_worker_owner;

DO $$
BEGIN
  DROP POLICY IF EXISTS vector_chunk_privacy_worker_select ON vector_chunk;
  CREATE POLICY vector_chunk_privacy_worker_select ON vector_chunk
    FOR SELECT TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));

  DROP POLICY IF EXISTS vector_chunk_privacy_worker_delete ON vector_chunk;
  CREATE POLICY vector_chunk_privacy_worker_delete ON vector_chunk
    FOR DELETE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND kind = 'memory'
       AND current_setting('app.privacy_target_id', true) IS NOT NULL);
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- C. 写围栏：本 sink 账本存在则拒迟到 memory 写入（qbank 不受影响）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION memory_vector_chunk_erasure_active(p_owner text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF p_owner IS NULL OR length(p_owner)=0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1
      FROM privacy_erasure_request r
      JOIN privacy_deletion_target t ON t.request_id = r.id
     WHERE r.owner_user_id = p_owner
       AND r.scope = 'account_data'
       AND t.sink = 'memory_vector_chunk'
       AND r.status IN ('fenced','purging','pending_external','completed','partial_failed')
  );
END $$;

ALTER FUNCTION memory_vector_chunk_erasure_active(text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION memory_vector_chunk_erasure_active(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_vector_chunk_erasure_active(text) TO app_role;

CREATE OR REPLACE FUNCTION enforce_memory_vector_chunk_erasure_fence()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NEW.kind IS DISTINCT FROM 'memory' THEN
    RETURN NEW;
  END IF;
  IF memory_vector_chunk_erasure_active(NEW.owner_user_id) THEN
    RAISE EXCEPTION 'memory_vector_chunk_erasure_fenced' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;

ALTER FUNCTION enforce_memory_vector_chunk_erasure_fence() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION enforce_memory_vector_chunk_erasure_fence() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS trg_memory_vector_chunk_erasure_fence ON vector_chunk;
CREATE TRIGGER trg_memory_vector_chunk_erasure_fence
  BEFORE INSERT OR UPDATE ON vector_chunk
  FOR EACH ROW EXECUTE FUNCTION enforce_memory_vector_chunk_erasure_fence();

-- ═══════════════════════════════════════════════════════════════════════════════
-- D. begin（API，OWNER privacy_api_owner，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION memory_vector_chunk_begin_erasure(p_idempotency_key_hash text)
RETURNS TABLE (
  request_id uuid, request_status text, privacy_epoch bigint, target_set_digest text,
  sink text, resource_hmac text, replayed boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  existing privacy_erasure_request%ROWTYPE;
  new_epoch bigint;
  v_request uuid;
  v_digest text;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_idempotency_key_hash IS NULL OR p_idempotency_key_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'memory_vector_chunk_erasure_invalid' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM user_account ua WHERE ua.id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_vector_chunk_erasure_account_not_found' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing FROM privacy_erasure_request r
   WHERE r.owner_user_id = principal AND r.idempotency_key_hash = p_idempotency_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> 'account_data' OR existing.subject_id <> principal THEN
      RAISE EXCEPTION 'memory_vector_chunk_erasure_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    RETURN QUERY
      SELECT d.request_id, r2.status, r2.privacy_epoch, r2.target_set_digest, d.sink, d.resource_hmac, true
        FROM privacy_deletion_target d
        JOIN privacy_erasure_request r2 ON r2.id = d.request_id
       WHERE d.request_id = existing.id
       ORDER BY d.sink;
    RETURN;
  END IF;

  SELECT COALESCE(MAX(c.privacy_epoch), 0) + 1 INTO new_epoch
    FROM memory_consent c WHERE c.owner_user_id = principal;

  INSERT INTO privacy_erasure_request(owner_user_id, scope, subject_id, idempotency_key_hash, status, privacy_epoch)
    VALUES (principal, 'account_data', principal, p_idempotency_key_hash, 'requested', new_epoch)
    RETURNING id INTO v_request;

  INSERT INTO privacy_deletion_target(request_id, sink, resource_hmac, status)
    VALUES (v_request, 'memory_vector_chunk',
      encode(hmac(principal || ':' || 'memory_vector_chunk' || ':' || v_request::text, p_idempotency_key_hash, 'sha256'), 'hex'),
      'pending');

  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO v_digest FROM privacy_deletion_target d WHERE d.request_id = v_request;

  UPDATE privacy_erasure_request r
     SET status='fenced', target_set_digest=v_digest, updated_at=now(), version=r.version+1
   WHERE r.id=v_request AND r.status='requested'
   RETURNING r.status INTO v_status;

  RETURN QUERY
    SELECT d.request_id, v_status, new_epoch, v_digest, d.sink, d.resource_hmac, false
      FROM privacy_deletion_target d WHERE d.request_id = v_request ORDER BY d.sink;
END $$;

ALTER FUNCTION memory_vector_chunk_begin_erasure(text) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;
REVOKE ALL ON FUNCTION memory_vector_chunk_begin_erasure(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_vector_chunk_begin_erasure(text) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- E. claim（OWNER privacy_worker_owner，EXECUTE privacy_worker_executor）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION privacy_authorization_claim_memory_vector_chunk_target(
  p_jti text,
  p_target uuid,
  p_worker text,
  p_lease_seconds integer DEFAULT 60
) RETURNS TABLE (target_id uuid, lease_token uuid, status text, attempt integer)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  snap privacy_authorization_snapshot%ROWTYPE;
  target_row record;
  live_digest text;
  token uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_jti IS NULL OR length(p_jti)=0 OR p_target IS NULL OR p_worker IS NULL OR length(p_worker)=0
     OR p_lease_seconds < 5 OR p_lease_seconds > 600 THEN
    RAISE EXCEPTION 'privacy_authorization_claim_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO snap FROM privacy_authorization_snapshot
   WHERE privacy_authorization_snapshot.jti = p_jti FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_not_found' USING ERRCODE='42501';
  END IF;
  IF snap.issuer_id <> 'meetwise-privacy-authz-v1' THEN
    RAISE EXCEPTION 'privacy_authorization_issuer_mismatch' USING ERRCODE='42501';
  END IF;
  IF snap.status <> 'consumed' THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_not_consumed' USING ERRCODE='42501';
  END IF;
  IF snap.expires_at <= now() THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_expired' USING ERRCODE='40901';
  END IF;
  IF snap.owner_user_id IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'privacy_authorization_owner_mismatch' USING ERRCODE='42501';
  END IF;

  SELECT t.*, r.owner_user_id AS request_owner, r.scope, r.subject_id,
         r.privacy_epoch AS request_epoch, r.target_set_digest AS request_digest,
         r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;

  IF target_row.request_owner IS DISTINCT FROM snap.owner_user_id
     OR target_row.request_owner IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'privacy_authorization_owner_mismatch' USING ERRCODE='42501';
  END IF;
  IF NOT (snap.purpose = 'account_data_erasure' AND target_row.scope = 'account_data') THEN
    RAISE EXCEPTION 'privacy_authorization_scope_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.sink <> 'memory_vector_chunk' THEN
    RAISE EXCEPTION 'privacy_authorization_sink_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.subject_id IS DISTINCT FROM snap.interview_id THEN
    RAISE EXCEPTION 'privacy_authorization_subject_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.request_epoch IS NULL OR target_row.request_epoch <> snap.privacy_epoch THEN
    RAISE EXCEPTION 'privacy_authorization_epoch_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.request_digest IS NULL OR target_row.request_digest <> snap.target_set_digest THEN
    RAISE EXCEPTION 'privacy_authorization_digest_mismatch' USING ERRCODE='42501';
  END IF;

  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO live_digest
    FROM privacy_deletion_target d
   WHERE d.request_id = target_row.request_id;
  IF live_digest IS DISTINCT FROM target_row.request_digest THEN
    RAISE EXCEPTION 'privacy_authorization_target_drift' USING ERRCODE='42501';
  END IF;

  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RETURN;
  END IF;
  IF target_row.status = 'erased' THEN
    RETURN QUERY SELECT target_row.id, target_row.lease_token, target_row.status, target_row.attempts;
    RETURN;
  END IF;
  IF target_row.status = 'leased' AND target_row.lease_expires_at >= now() THEN
    RETURN;
  END IF;
  IF target_row.status NOT IN ('pending','leased','failed') THEN
    RETURN;
  END IF;

  token := gen_random_uuid();
  UPDATE privacy_deletion_target AS d
     SET status='leased', lease_owner=p_worker, lease_token=token,
         lease_expires_at=now()+(p_lease_seconds||' seconds')::interval,
         attempts=d.attempts+1, version=d.version+1, updated_at=now(), last_error_code=NULL
   WHERE d.id = target_row.id AND d.version = target_row.version
   RETURNING d.id, d.lease_token, d.status, d.attempts INTO target_id, lease_token, status, attempt;
  IF NOT FOUND THEN RETURN; END IF;
  RETURN NEXT;
END $$;

GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION privacy_authorization_claim_memory_vector_chunk_target(text,uuid,text,integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_authorization_claim_memory_vector_chunk_target(text,uuid,text,integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_authorization_claim_memory_vector_chunk_target(text,uuid,text,integer) TO privacy_worker_executor;

-- ═══════════════════════════════════════════════════════════════════════════════
-- F. purge：只删 kind=memory，残留=0 fail-closed
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION privacy_purge_memory_vector_chunk_target(
  p_target uuid,
  p_token uuid
) RETURNS TABLE (target_id uuid, status text, deleted_count bigint, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  target_row record;
  removed bigint := 0;
  remaining bigint := 0;
  final_request_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_token IS NULL THEN
    RAISE EXCEPTION 'memory_vector_chunk_purge_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.id, t.request_id, t.status, t.lease_token, t.lease_expires_at, t.version, t.sink,
         r.owner_user_id, r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'memory_vector_chunk_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RAISE EXCEPTION 'memory_vector_chunk_target_request_not_active' USING ERRCODE='42501';
  END IF;
  IF target_row.status = 'erased' THEN
    RETURN QUERY SELECT target_row.id, 'erased'::text, 0::bigint, target_row.request_status;
    RETURN;
  END IF;
  IF target_row.status <> 'leased' OR target_row.lease_token IS DISTINCT FROM p_token
     OR target_row.lease_expires_at < now() THEN
    RAISE EXCEPTION 'memory_vector_chunk_target_lease_lost' USING ERRCODE='42501';
  END IF;

  PERFORM set_config('app.privacy_target_id', target_row.id::text, true);
  PERFORM set_config('app.privacy_lease_token', p_token::text, true);

  IF target_row.sink = 'memory_vector_chunk' THEN
    DELETE FROM vector_chunk
     WHERE owner_user_id = principal AND kind = 'memory';
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining
      FROM vector_chunk
     WHERE owner_user_id = principal AND kind = 'memory';
  ELSE
    RAISE EXCEPTION 'memory_vector_chunk_target_locator_unknown' USING ERRCODE='42501';
  END IF;
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'memory_vector_chunk_target_residual_rows' USING ERRCODE='55000';
  END IF;

  UPDATE privacy_deletion_target AS d
     SET status='erased', deleted_count=removed,
         receipt_hash=encode(digest(d.id::text || ':' || p_token::text || ':' || removed::text, 'sha256'),'hex'),
         lease_owner=NULL, lease_token=NULL, lease_expires_at=NULL, version=d.version+1, updated_at=now()
   WHERE d.id = target_row.id AND d.status='leased' AND d.lease_token=p_token AND d.version=target_row.version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_vector_chunk_target_complete_cas_lost' USING ERRCODE='40001';
  END IF;

  UPDATE privacy_erasure_request AS r
     SET status=CASE
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status IN ('pending','leased')) THEN 'purging'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='external_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='retention_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='failed_cleanup') THEN 'partial_failed'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='failed') THEN 'partial_failed'
       ELSE 'completed' END,
       version=r.version+1, updated_at=now()
   WHERE r.id=target_row.request_id
   RETURNING r.status INTO final_request_status;
  RETURN QUERY SELECT target_row.id, 'erased'::text, removed, final_request_status;
END $$;
ALTER FUNCTION privacy_purge_memory_vector_chunk_target(uuid,uuid) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_purge_memory_vector_chunk_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_memory_vector_chunk_target(uuid,uuid) TO privacy_worker_executor;

REVOKE memory_runtime, privacy_issuer, privacy_worker_executor FROM app_role;
