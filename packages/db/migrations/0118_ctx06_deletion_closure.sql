-- ═══════════════════════════════════════════════════════════════════════════════
-- 0118 CTX-06：撤回、过期和删除——压缩轨道的删除 sink 闭合
-- ═══════════════════════════════════════════════════════════════════════════════
-- 闭合 CTX-04（0115 压缩快照）与 CTX-05（0117 压缩派发）两处删除孤儿（register L78 +
-- memory-context-design L126/L158-172「完整删除链路闭合前不写跨会话摘要/语义记忆」）：
--
--   MEDIUM（0115 快照）：owner 级、含明文 `summary_claims.text` 派生摘要 claim 文本（可含
--     PII）；`privacy_deletion_target.sink` 无本表 → 账户删除暂成孤儿。修复循 0111 先例：
--       ① 扩 sink 枚举（context_compression_snapshot + context_compression_dispatch）；
--       ② 建等价 sweep `context_compression_begin_erasure`，使 snapshot draft/active/
--         superseded → fenced 真达（正向跃迁，0115 guard 放行），并枚举 2 个可解析 target；
--       ③ 建 `privacy_authorization_claim_compression_target` +
--         `privacy_purge_compression_target`：snapshot 先 fenced→purged（正向跃迁，使 purged
--         真可达）再物理 DELETE；dispatch 纯物理 DELETE（无 PII、无 fenced/purged 状态，见下）。
--
--   low（0117 派发）：无 PII，只存 range/digest/version/lease/snapshot_id/版本串；**无
--     fenced/purged 状态** → 删除不 fence、purge=纯物理 DELETE。如实披露（不伪删）：fence 阶段
--     dispatch 行仍对 replay 可见（内容无 PII，仅 range/digest 引用），read=0 由 purge 的物理
--     删除承重。
--
-- 铁律（与 CLAUDE.md / 0111 对齐）：
--   - **复用冻结 PrivacyAuthorizationIssuer（0091），绝不重实现**：issue/consume 全走 0091
--     冻结函数；claim 只包一层压缩 sink 的活重验（镜像 0111 的 CTX claim），因为 0091 的
--     privacy_authorization_claim_target 是 interview_data 域，账户域必须独立 claim。
--   - 四原语复用不重实现：①CAS（snapshot cas_version+1；dispatch 无删除态故 version 不翻）
--     ②principal 幂等键（privacy_erasure_request UNIQUE(owner,idempotency_key_hash)）③RLS
--     owner 绑定（FORCE RLS + owner=principal + worker 的 privacy_target_id 谓词）④持久有序
--     日志（erasure 账本由 0047/0091 提供，本迁移不另建审计表）。
--   - 删后 read=0 = 真物理删除 + 残留=0 校验，不是只靠 RLS fence 假绿。
--   - fence epoch（erasure request 的 privacy_epoch）单独算 = MAX(conversation_event.
--     privacy_epoch)+1，供签名快照对齐；snapshot/dispatch 行自身无 privacy_epoch 列、不回写。
--
-- 诚实标注（非目标）：不改冻结迁移 0108/0111/0115/0117；不实现真实模型压缩（MODEL-OP）；
-- 不把跨会话摘要/语义记忆接上生产写路径（CTX-07 前不开启写入，本迁移只闭合删除）。账户删除
-- 编排层需分别调 memory_begin_account_erasure（MEM sweep）、conversation_event_begin_erasure
-- （CTX 事件 sweep）与本迁移 context_compression_begin_erasure（压缩 sweep），各自用不同
-- idempotency_key_hash 命名空间（UNIQUE(owner,idempotency_key_hash) 决定三者必须分账本）。

-- ═══════════════════════════════════════════════════════════════════════════════
-- A. 扩展 sink 枚举：新增 context_compression_snapshot + context_compression_dispatch
-- ═══════════════════════════════════════════════════════════════════════════════
-- 与 0093/0096/0111 同源：找到并删掉旧 CHECK → 重加完整枚举（绝不就地改历史迁移）。
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
    -- 0118 新增：压缩轨道（owner 作用域，账户删除轨道）
    'context_compression_snapshot','context_compression_dispatch'
  ));

-- ═══════════════════════════════════════════════════════════════════════════════
-- B. 表级 ACL + RLS：privacy_api_owner（fence 定义者）与 privacy_worker_owner（删除定义者）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 0115/0117 已 REVOKE ALL FROM PUBLIC,app_role 并授 memory_runtime 数据面读写。这里按 0111
-- 先例补隐私定义者角色。snapshot：api_owner 只 fence（SELECT/UPDATE）；worker_owner 只清除
-- （SELECT 残留计数 + UPDATE 跃迁 purged + DELETE 物理删）。dispatch：worker_owner 只清除
-- （SELECT 残留计数 + DELETE 物理删；无 UPDATE——dispatch 无 fenced/purged 状态）；api_owner
-- 对 dispatch 不授任何 ACL（begin 不 fence dispatch）。app_role 仍无任何原始表读/写。
GRANT SELECT, UPDATE ON context_compression_snapshot TO privacy_api_owner;
GRANT SELECT, UPDATE, DELETE ON context_compression_snapshot TO privacy_worker_owner;
GRANT SELECT, DELETE ON context_compression_dispatch TO privacy_worker_owner;

-- RLS：全部 FORCE + owner=principal 绑定。api_owner 的 fence 在 target 落账**之前**执行，
-- 故其谓词只要求 owner=principal（不能要求 privacy_target_id）；worker 的 UPDATE/DELETE 必须
-- 在 purge 事务内 app.privacy_target_id 就位后才可动（镜像 0111 的 worker_delete 谓词，杜绝
-- worker 在 purge 事务之外裸删业务行）。
DO $$
BEGIN
  -- privacy_api_owner：snapshot fence 定义者（owner 作用域，全动作）。
  DROP POLICY IF EXISTS context_compression_snapshot_api_owner ON context_compression_snapshot;
  CREATE POLICY context_compression_snapshot_api_owner ON context_compression_snapshot
    FOR ALL TO privacy_api_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：snapshot SELECT owner 作用域（残留计数/联表锁）。
  DROP POLICY IF EXISTS context_compression_snapshot_privacy_worker_select ON context_compression_snapshot;
  CREATE POLICY context_compression_snapshot_privacy_worker_select ON context_compression_snapshot
    FOR SELECT TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：snapshot UPDATE（fenced→purged 正向跃迁）需 privacy_target_id 就位。
  DROP POLICY IF EXISTS context_compression_snapshot_privacy_worker_update ON context_compression_snapshot;
  CREATE POLICY context_compression_snapshot_privacy_worker_update ON context_compression_snapshot
    FOR UPDATE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND current_setting('app.privacy_target_id', true) IS NOT NULL)
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：snapshot DELETE（物理删除）需 privacy_target_id 就位。
  DROP POLICY IF EXISTS context_compression_snapshot_privacy_worker_delete ON context_compression_snapshot;
  CREATE POLICY context_compression_snapshot_privacy_worker_delete ON context_compression_snapshot
    FOR DELETE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND current_setting('app.privacy_target_id', true) IS NOT NULL);

  -- privacy_worker_owner：dispatch SELECT owner 作用域（残留计数）。
  DROP POLICY IF EXISTS context_compression_dispatch_privacy_worker_select ON context_compression_dispatch;
  CREATE POLICY context_compression_dispatch_privacy_worker_select ON context_compression_dispatch
    FOR SELECT TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：dispatch DELETE（物理删除，无 fenced/purged 态故无 UPDATE 策略）需
  -- privacy_target_id 就位。
  DROP POLICY IF EXISTS context_compression_dispatch_privacy_worker_delete ON context_compression_dispatch;
  CREATE POLICY context_compression_dispatch_privacy_worker_delete ON context_compression_dispatch
    FOR DELETE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND current_setting('app.privacy_target_id', true) IS NOT NULL);
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- C. 账户删除等价 sweep（API 阶段，OWNER privacy_api_owner，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 镜像 0111 conversation_event_begin_erasure 的账户轨道，但删的是压缩对象：同步 fence snapshot
-- draft/active/superseded→fenced（cas_version+1）→ 建 account_data request → 枚举 2 个压缩 sink
-- target → 就地算 target_set_digest（与 claim 活重验同公式）→ request→fenced。**不 fence dispatch**
-- （无 fenced 状态，如实披露）。幂等：同 owner 同 idempotency_key_hash 重放返回既有 2 行。fence
-- epoch = MAX(conversation_event.privacy_epoch)+1（snapshot/dispatch 行自身无 epoch 列，不回写）。
CREATE OR REPLACE FUNCTION context_compression_begin_erasure(
  p_idempotency_key_hash text
) RETURNS TABLE (
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
  sink_name text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_idempotency_key_hash IS NULL OR p_idempotency_key_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'compression_erasure_invalid' USING ERRCODE='22023';
  END IF;
  -- subject 必须是调用者自己的账户（复用 0093 补的 privacy_api_owner user_account 只读面）。
  PERFORM 1 FROM user_account ua WHERE ua.id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'compression_erasure_account_not_found' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing FROM privacy_erasure_request r
   WHERE r.owner_user_id = principal AND r.idempotency_key_hash = p_idempotency_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> 'account_data' OR existing.subject_id <> principal THEN
      RAISE EXCEPTION 'compression_erasure_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    RETURN QUERY
      SELECT d.request_id, r2.status, r2.privacy_epoch, r2.target_set_digest, d.sink, d.resource_hmac, true
        FROM privacy_deletion_target d
        JOIN privacy_erasure_request r2 ON r2.id = d.request_id
       WHERE d.request_id = existing.id
       ORDER BY d.sink;
    RETURN;
  END IF;

  -- 单调 fence epoch（在既有事件 epoch 之上 +1，恒 >=1）。snapshot/dispatch 行自身不回写。
  SELECT COALESCE(MAX(e.privacy_epoch), 0) + 1 INTO new_epoch
    FROM conversation_event e WHERE e.owner_user_id = principal;

  -- fence：snapshot draft/active/superseded→fenced（单向正向跃迁，0115 guard 放行），
  -- cas_version+1（四原语①的乐观版本语义）。dispatch 无 fenced 状态 → 不 fence（如实披露）。
  UPDATE context_compression_snapshot
     SET status='fenced', cas_version=cas_version+1, updated_at=now()
   WHERE owner_user_id = principal AND status IN ('draft','active','superseded');

  INSERT INTO privacy_erasure_request(owner_user_id, scope, subject_id, idempotency_key_hash, status, privacy_epoch)
    VALUES (principal, 'account_data', principal, p_idempotency_key_hash, 'requested', new_epoch)
    RETURNING id INTO v_request;

  FOREACH sink_name IN ARRAY ARRAY['context_compression_snapshot','context_compression_dispatch'] LOOP
    INSERT INTO privacy_deletion_target(request_id, sink, resource_hmac, status)
      VALUES (v_request, sink_name,
        encode(hmac(principal || ':' || sink_name || ':' || v_request::text, p_idempotency_key_hash, 'sha256'), 'hex'),
        'pending');
  END LOOP;

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

ALTER FUNCTION context_compression_begin_erasure(text) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION context_compression_begin_erasure(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_begin_erasure(text) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- D. 删除侧受约束 claim（OWNER privacy_worker_owner，EXECUTE privacy_worker_executor）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 镜像 0111 privacy_authorization_claim_conversation_event_target 的活重验，但 sink 白名单换成
-- 压缩两 sink：purpose=account_data_erasure + scope=account_data + sink∈{context_compression_
-- snapshot,context_compression_dispatch}。其余（consume/issuer/expiry/owner/epoch/digest/活漂移）
-- 与冻结 claim 完全一致，逐字段 fail-closed。
CREATE OR REPLACE FUNCTION privacy_authorization_claim_compression_target(
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
  -- 压缩域：目的/scope/sink 三重锁定（与 MEM/INT/CTX-event 三套互不认）。
  IF NOT (snap.purpose = 'account_data_erasure' AND target_row.scope = 'account_data') THEN
    RAISE EXCEPTION 'privacy_authorization_scope_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.sink NOT IN ('context_compression_snapshot','context_compression_dispatch') THEN
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
ALTER FUNCTION privacy_authorization_claim_compression_target(text,uuid,text,integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_authorization_claim_compression_target(text,uuid,text,integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_authorization_claim_compression_target(text,uuid,text,integer) TO privacy_worker_executor;

-- ═══════════════════════════════════════════════════════════════════════════════
-- E. 删除侧物理清除（OWNER privacy_worker_owner，EXECUTE privacy_worker_executor）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 每个 sink 一个明确动作：snapshot 先正向跃迁 fenced→purged（使 purged 真可达，cas_version+1），
-- 再物理 DELETE（删后 read=0）；dispatch 无 fenced/purged 状态 → 纯物理 DELETE。删除后校验
-- 残留=0（未知 locator/残留≠0 一律 fail-closed）。复用冻结 claim（D）认领租约；purge 只做
-- 跃迁 + 物理删除 + 收据 + 最终 request CASE。
CREATE OR REPLACE FUNCTION privacy_purge_compression_target(
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
    RAISE EXCEPTION 'compression_purge_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.id, t.request_id, t.status, t.lease_token, t.lease_expires_at, t.version, t.sink,
         r.owner_user_id, r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'compression_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RAISE EXCEPTION 'compression_target_request_not_active' USING ERRCODE='42501';
  END IF;
  IF target_row.status = 'erased' THEN
    RETURN QUERY SELECT target_row.id, 'erased'::text, 0::bigint, target_row.request_status;
    RETURN;
  END IF;
  IF target_row.status <> 'leased' OR target_row.lease_token IS DISTINCT FROM p_token
     OR target_row.lease_expires_at < now() THEN
    RAISE EXCEPTION 'compression_target_lease_lost' USING ERRCODE='42501';
  END IF;

  -- 物理删除需 worker 的 UPDATE/DELETE RLS 谓词（owner + privacy_target_id）就位。
  PERFORM set_config('app.privacy_target_id', target_row.id::text, true);
  PERFORM set_config('app.privacy_lease_token', p_token::text, true);

  -- 逐 sink：snapshot 先正向跃迁 fenced→purged（0115 单向 guard 放行）再物理 DELETE；
  -- dispatch 无 fenced/purged 状态 → 纯物理 DELETE（如实披露）。
  IF target_row.sink = 'context_compression_snapshot' THEN
    UPDATE context_compression_snapshot AS s
       SET status='purged', cas_version=s.cas_version+1, updated_at=now()
     WHERE s.owner_user_id = principal AND s.status = 'fenced';
    DELETE FROM context_compression_snapshot WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM context_compression_snapshot WHERE owner_user_id = principal;
  ELSIF target_row.sink = 'context_compression_dispatch' THEN
    DELETE FROM context_compression_dispatch WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM context_compression_dispatch WHERE owner_user_id = principal;
  ELSE
    RAISE EXCEPTION 'compression_target_locator_unknown' USING ERRCODE='42501';
  END IF;
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'compression_target_residual_rows' USING ERRCODE='55000';
  END IF;

  UPDATE privacy_deletion_target AS d
     SET status='erased', deleted_count=removed,
         receipt_hash=encode(digest(d.id::text || ':' || p_token::text || ':' || removed::text, 'sha256'),'hex'),
         lease_owner=NULL, lease_token=NULL, lease_expires_at=NULL, version=d.version+1, updated_at=now()
   WHERE d.id = target_row.id AND d.status='leased' AND d.lease_token=p_token AND d.version=target_row.version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'compression_target_complete_cas_lost' USING ERRCODE='40001';
  END IF;

  -- 最终 CASE 与 0078/0093/0111 对齐：把 receipts 纳入判定，避免触发 0091 no-forge-completed
  -- guard 回滚已完成的物理删除。
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
ALTER FUNCTION privacy_purge_compression_target(uuid,uuid) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;


REVOKE ALL ON FUNCTION privacy_purge_compression_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_compression_target(uuid,uuid) TO privacy_worker_executor;

-- runtime login 永不通过 membership 漂移成为 privacy worker（防漂移，镜像 0093/0096/0111）。
REVOKE privacy_issuer, privacy_worker_executor FROM app_role;
