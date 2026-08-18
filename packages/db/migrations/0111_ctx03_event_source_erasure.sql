-- ═══════════════════════════════════════════════════════════════════════════════
-- 0111 CTX-03：不可变会话事件源的删除 sink 闭合 + version CAS 接线
-- ═══════════════════════════════════════════════════════════════════════════════
-- 闭合 0108 的两处审计发现（不就地改 0108，本迁移增量）：
--
--   HIGH-1（孤儿删除）：conversation_event / conversation_event_artifact 没有任何删除 resolver。
--     privacy_deletion_target.sink 枚举（0047 建、0093/0096 扩）不含这两个 sink；
--     memory_begin_account_erasure（0093，冻结）只扫 3 个 MEM sink；0108 声明了
--     active → privacy_fenced → purged 的 enum + 单向 guard，但没有任何生产函数真正把行
--     跃迁进 privacy_fenced / purged——这两个状态是「死状态」。修复循 INT-TRANSCRIPT-01 的
--     ai_graph_run 先例（sink CHECK + target + RLS + purge，delete→read=0）：
--       ① 扩 sink 枚举（conversation_event + conversation_event_artifact）；
--       ② 建等价 sweep `conversation_event_begin_erasure`（账户删除路径），使 active 真达
--          privacy_fenced（正向跃迁），并枚举 2 个可解析 target；
--       ③ 建 `privacy_authorization_claim_conversation_event_target` +
--          `privacy_purge_conversation_event_target`，purge 先 privacy_fenced→purged（正向
--          跃迁，使 purged 真可达）再物理 DELETE，删后 read=0；
--       ④ 补偿控制 `conversation_event_dispatch_replay`：派发/回放前复核 consent/epoch，
--          围栏先赢 → voided（防复活；镜像 0105 memory_dispatch_recall_snapshot）。
--
--   MEDIUM-2（version 摆设）：`version bigint DEFAULT 1`（0108:69/105）从未 `version+1` 或
--     `WHERE version=` CAS。选 ①：fence/purge 全部 `version=version+1`，并新增
--     `conversation_event_transition_status` 的单事件乐观 CAS 原语（`WHERE version=expected`
--     + `version+1`），并发单赢家。
--
-- 铁律（与 CLAUDE.md 对齐）：
--   - **复用冻结 PrivacyAuthorizationIssuer（0091），绝不重实现**：issue/consume 全走 0091
--     冻结函数；claim 只包一层 CTX sink 的活重验（镜像 0093 的 MEM claim），因为 0091 的
--     privacy_authorization_claim_target 是 interview_data 域、sink 无关但 scope 锁死
--     interview_data，账户域必须独立 claim。
--   - 四原语复用不重实现：①CAS（version+1 + WHERE version=expected + 单向 guard）②principal
--     幂等键（privacy_erasure_request UNIQUE(owner,idempotency_key_hash)）③RLS owner 绑定
--     （FORCE RLS + owner=principal + worker 的 privacy_target_id 谓词）④持久有序日志
--     （erasure 账本由 0047/0091 提供；事件审计复用 0093 memory_append_audit 不动）。
--   - 删后 read=0 = 真物理删除 + 残留=0 校验，不是只靠 RLS fence 假绿。
--   - 事件行 privacy_epoch 保持**不可变**：event_digest 覆盖 privacy_epoch，fence 只翻 status、
--     绝不改 epoch（否则破坏 append-only 内容身份指纹）。fence epoch（erasure request 的
--     privacy_epoch）单独算 = MAX(event.privacy_epoch)+1，供签名快照对齐，不回写事件行。
--
-- 诚实标注（非目标）：不重写 0093 memory_begin_account_erasure / 0105 / 0107 冻结对象；不碰
-- SCOR(0109)/RAG/qbank(0106/0104)/job-route-decision；真实 KMS 归 MODEL-OP。账户删除编排层
-- 需分别调 memory_begin_account_erasure（MEM sweep）与本迁移的 conversation_event_begin_erasure
-- （CTX sweep），各自用不同 idempotency_key_hash 命名空间（UNIQUE(owner,idempotency_key_hash)
-- 决定两者必须分账本，否则第二扫命中第一扫的 request 而被幂等吞掉 CTX target）。

-- ═══════════════════════════════════════════════════════════════════════════════
-- A. 扩展 sink 枚举：新增 conversation_event + conversation_event_artifact
-- ═══════════════════════════════════════════════════════════════════════════════
-- 与 0093/0096 同源：找到并删掉旧 CHECK → 重加完整枚举（绝不就地改历史迁移）。
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
    -- 0111 新增：不可变会话事件源（owner 作用域，账户删除轨道）
    'conversation_event','conversation_event_artifact'
  ));

-- ═══════════════════════════════════════════════════════════════════════════════
-- B. 表级 ACL + RLS：privacy_api_owner（fence 定义者）与 privacy_worker_owner（删除定义者）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 0108 已 REVOKE ALL FROM PUBLIC,app_role 并授 memory_runtime 数据面读写。这里按 0093/0096
-- 先例补隐私定义者角色：api_owner 只 fence（SELECT/UPDATE）；worker_owner 只清除
-- （SELECT 残留计数 + UPDATE 跃迁 purged + DELETE 物理删）。app_role 仍无任何原始表读/写。
GRANT SELECT, UPDATE ON conversation_event, conversation_event_artifact TO privacy_api_owner;
GRANT SELECT, UPDATE, DELETE ON conversation_event, conversation_event_artifact TO privacy_worker_owner;

-- RLS：全部 FORCE + owner=principal 绑定。api_owner 的 fence 在 target 落账**之前**执行，
-- 故其谓词只要求 owner=principal（不能要求 privacy_target_id）；worker 的 UPDATE/DELETE 必须
-- 在 purge 事务内 app.privacy_target_id 就位后才可动（镜像 0096 的 worker_delete 谓词，杜绝
-- worker 在 purge 事务之外裸删业务行）。
DO $$
BEGIN
  -- privacy_api_owner：fence 定义者（owner 作用域，全动作）。
  DROP POLICY IF EXISTS conversation_event_api_owner ON conversation_event;
  CREATE POLICY conversation_event_api_owner ON conversation_event
    FOR ALL TO privacy_api_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS conversation_event_artifact_api_owner ON conversation_event_artifact;
  CREATE POLICY conversation_event_artifact_api_owner ON conversation_event_artifact
    FOR ALL TO privacy_api_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：SELECT owner 作用域（残留计数/联表锁）。
  DROP POLICY IF EXISTS conversation_event_privacy_worker_select ON conversation_event;
  CREATE POLICY conversation_event_privacy_worker_select ON conversation_event
    FOR SELECT TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS conversation_event_artifact_privacy_worker_select ON conversation_event_artifact;
  CREATE POLICY conversation_event_artifact_privacy_worker_select ON conversation_event_artifact
    FOR SELECT TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：UPDATE（privacy_fenced→purged 正向跃迁）需 privacy_target_id 就位。
  DROP POLICY IF EXISTS conversation_event_privacy_worker_update ON conversation_event;
  CREATE POLICY conversation_event_privacy_worker_update ON conversation_event
    FOR UPDATE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND current_setting('app.privacy_target_id', true) IS NOT NULL)
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS conversation_event_artifact_privacy_worker_update ON conversation_event_artifact;
  CREATE POLICY conversation_event_artifact_privacy_worker_update ON conversation_event_artifact
    FOR UPDATE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND current_setting('app.privacy_target_id', true) IS NOT NULL)
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：DELETE（物理删除）需 privacy_target_id 就位。
  DROP POLICY IF EXISTS conversation_event_privacy_worker_delete ON conversation_event;
  CREATE POLICY conversation_event_privacy_worker_delete ON conversation_event
    FOR DELETE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND current_setting('app.privacy_target_id', true) IS NOT NULL);
  DROP POLICY IF EXISTS conversation_event_artifact_privacy_worker_delete ON conversation_event_artifact;
  CREATE POLICY conversation_event_artifact_privacy_worker_delete ON conversation_event_artifact
    FOR DELETE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND current_setting('app.privacy_target_id', true) IS NOT NULL);
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- C. 账户删除等价 sweep（API 阶段，OWNER privacy_api_owner，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 镜像 0093 memory_begin_account_erasure 的账户轨道，但删的是 CTX 事件源：同步 fence 双表
-- active→privacy_fenced（version+1）→ 建 account_data request → 枚举 2 个 CTX sink target →
-- 就地算 target_set_digest（与 claim 活重验同公式）→ request→fenced。幂等：同 owner 同
-- idempotency_key_hash 重放返回既有 2 行。fence epoch = MAX(event.privacy_epoch)+1（事件行自身
-- epoch 不可变，见头注）。
CREATE OR REPLACE FUNCTION conversation_event_begin_erasure(
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
    RAISE EXCEPTION 'conversation_event_erasure_invalid' USING ERRCODE='22023';
  END IF;
  -- subject 必须是调用者自己的账户（复用 0093 补的 privacy_api_owner user_account 只读面）。
  PERFORM 1 FROM user_account ua WHERE ua.id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'conversation_event_erasure_account_not_found' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing FROM privacy_erasure_request r
   WHERE r.owner_user_id = principal AND r.idempotency_key_hash = p_idempotency_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> 'account_data' OR existing.subject_id <> principal THEN
      RAISE EXCEPTION 'conversation_event_erasure_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    RETURN QUERY
      SELECT d.request_id, r2.status, r2.privacy_epoch, r2.target_set_digest, d.sink, d.resource_hmac, true
        FROM privacy_deletion_target d
        JOIN privacy_erasure_request r2 ON r2.id = d.request_id
       WHERE d.request_id = existing.id
       ORDER BY d.sink;
    RETURN;
  END IF;

  -- 单调 fence epoch（在既有事件 epoch 之上 +1，恒 >=1）。事件行自身 privacy_epoch 不回写。
  SELECT COALESCE(MAX(e.privacy_epoch), 0) + 1 INTO new_epoch
    FROM conversation_event e WHERE e.owner_user_id = principal;

  -- fence：event + artifact 双表 active→privacy_fenced（单向正向跃迁，0108 guard 放行），
  -- version+1（四原语①的乐观版本语义）。
  UPDATE conversation_event
     SET status='privacy_fenced', version=version+1, updated_at=now()
   WHERE owner_user_id = principal AND status = 'active';
  UPDATE conversation_event_artifact
     SET status='privacy_fenced', version=version+1, updated_at=now()
   WHERE owner_user_id = principal AND status = 'active';

  INSERT INTO privacy_erasure_request(owner_user_id, scope, subject_id, idempotency_key_hash, status, privacy_epoch)
    VALUES (principal, 'account_data', principal, p_idempotency_key_hash, 'requested', new_epoch)
    RETURNING id INTO v_request;

  FOREACH sink_name IN ARRAY ARRAY['conversation_event','conversation_event_artifact'] LOOP
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

ALTER FUNCTION conversation_event_begin_erasure(text) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION conversation_event_begin_erasure(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION conversation_event_begin_erasure(text) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- D. 删除侧受约束 claim（OWNER privacy_worker_owner，EXECUTE privacy_worker_executor）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 镜像 0093 privacy_authorization_claim_memory_target 的活重验，但 sink 白名单换成 CTX 两 sink：
--   purpose=account_data_erasure + scope=account_data + sink∈{conversation_event,
--   conversation_event_artifact}。其余（consume/issuer/expiry/owner/epoch/digest/活漂移）与
--   冻结 claim 完全一致，逐字段 fail-closed。
CREATE OR REPLACE FUNCTION privacy_authorization_claim_conversation_event_target(
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
  -- CTX 域：目的/scope/sink 三重锁定（与 MEM/INT 两套互不认）。
  IF NOT (snap.purpose = 'account_data_erasure' AND target_row.scope = 'account_data') THEN
    RAISE EXCEPTION 'privacy_authorization_scope_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.sink NOT IN ('conversation_event','conversation_event_artifact') THEN
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
ALTER FUNCTION privacy_authorization_claim_conversation_event_target(text,uuid,text,integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_authorization_claim_conversation_event_target(text,uuid,text,integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_authorization_claim_conversation_event_target(text,uuid,text,integer) TO privacy_worker_executor;

-- ═══════════════════════════════════════════════════════════════════════════════
-- E. 删除侧物理清除（OWNER privacy_worker_owner，EXECUTE privacy_worker_executor）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 每个 sink 一个明确动作：先正向跃迁 privacy_fenced→purged（使 purged 真可达，version+1），
-- 再物理 DELETE（删后 read=0）。删除后校验残留=0（未知 locator/残留≠0 一律 fail-closed）。
-- 复用冻结 claim（D）认领租约；purge 只做跃迁 + 物理删除 + 收据 + 最终 request CASE。
CREATE OR REPLACE FUNCTION privacy_purge_conversation_event_target(
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
    RAISE EXCEPTION 'conversation_event_purge_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.id, t.request_id, t.status, t.lease_token, t.lease_expires_at, t.version, t.sink,
         r.owner_user_id, r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'conversation_event_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RAISE EXCEPTION 'conversation_event_target_request_not_active' USING ERRCODE='42501';
  END IF;
  IF target_row.status = 'erased' THEN
    RETURN QUERY SELECT target_row.id, 'erased'::text, 0::bigint, target_row.request_status;
    RETURN;
  END IF;
  IF target_row.status <> 'leased' OR target_row.lease_token IS DISTINCT FROM p_token
     OR target_row.lease_expires_at < now() THEN
    RAISE EXCEPTION 'conversation_event_target_lease_lost' USING ERRCODE='42501';
  END IF;

  -- 物理删除需 worker 的 UPDATE/DELETE RLS 谓词（owner + privacy_target_id）就位。
  PERFORM set_config('app.privacy_target_id', target_row.id::text, true);
  PERFORM set_config('app.privacy_lease_token', p_token::text, true);

  -- 逐 sink：先正向跃迁 privacy_fenced→purged（0108 单向 guard 放行），再物理 DELETE。
  IF target_row.sink = 'conversation_event' THEN
    UPDATE conversation_event AS e
       SET status='purged', version=e.version+1, updated_at=now()
     WHERE e.owner_user_id = principal AND e.status = 'privacy_fenced';
    DELETE FROM conversation_event WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM conversation_event WHERE owner_user_id = principal;
  ELSIF target_row.sink = 'conversation_event_artifact' THEN
    UPDATE conversation_event_artifact AS a
       SET status='purged', version=a.version+1, updated_at=now()
     WHERE a.owner_user_id = principal AND a.status = 'privacy_fenced';
    DELETE FROM conversation_event_artifact WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM conversation_event_artifact WHERE owner_user_id = principal;
  ELSE
    RAISE EXCEPTION 'conversation_event_target_locator_unknown' USING ERRCODE='42501';
  END IF;
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'conversation_event_target_residual_rows' USING ERRCODE='55000';
  END IF;

  UPDATE privacy_deletion_target AS d
     SET status='erased', deleted_count=removed,
         receipt_hash=encode(digest(d.id::text || ':' || p_token::text || ':' || removed::text, 'sha256'),'hex'),
         lease_owner=NULL, lease_token=NULL, lease_expires_at=NULL, version=d.version+1, updated_at=now()
   WHERE d.id = target_row.id AND d.status='leased' AND d.lease_token=p_token AND d.version=target_row.version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'conversation_event_target_complete_cas_lost' USING ERRCODE='40001';
  END IF;

  -- 最终 CASE 与 0078/0093 对齐：把 receipts 纳入判定，避免触发 0091 no-forge-completed guard
  -- 回滚已完成的物理删除。
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
ALTER FUNCTION privacy_purge_conversation_event_target(uuid,uuid) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;


REVOKE ALL ON FUNCTION privacy_purge_conversation_event_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_conversation_event_target(uuid,uuid) TO privacy_worker_executor;

-- ═══════════════════════════════════════════════════════════════════════════════
-- F. 补偿控制：派发/回放前复核 consent/epoch，围栏先赢 → voided（OWNER memory_runtime）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 镜像 0105 memory_dispatch_recall_snapshot 的 fence-first-wins：派发方先读到事件 watermark
-- （p_observed_privacy_epoch + p_observed_consent_revision），真正派发/回放进模型数据块前再
-- 重读 live 行——若事件已被 fence（privacy_fenced/purged）或 watermark 漂移，返回 voided
-- （dispatch_decision=0），杜绝「已删内容被复活进上下文」。事件行 privacy_epoch 不可变（见头注），
-- 故 watermark 复核 = 派发方必须持与 live 一致的身份；fence 检测靠 status 单向跃迁承重。
CREATE OR REPLACE FUNCTION conversation_event_dispatch_replay(
  p_event_id uuid,
  p_observed_privacy_epoch bigint,
  p_observed_consent_revision bigint
) RETURNS TABLE (event_id uuid, status text, dispatch_decision integer, void_reason text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  ev conversation_event%ROWTYPE;
  v_void text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_event_id IS NULL
     OR p_observed_privacy_epoch IS NULL OR p_observed_privacy_epoch < 1
     OR p_observed_consent_revision IS NULL OR p_observed_consent_revision < 1 THEN
    RAISE EXCEPTION 'conversation_event_dispatch_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO ev FROM conversation_event e
   WHERE e.id = p_event_id AND e.owner_user_id = principal
   FOR SHARE;
  IF NOT FOUND THEN
    -- 已被物理清除：绝不能回放。
    RETURN QUERY SELECT p_event_id, 'purged'::text, 0, 'purged';
    RETURN;
  END IF;

  v_void := NULL;
  IF ev.status = 'privacy_fenced' THEN
    v_void := 'fence_first';
  ELSIF ev.status = 'purged' THEN
    v_void := 'purged';
  ELSIF ev.privacy_epoch IS DISTINCT FROM p_observed_privacy_epoch
     OR ev.consent_revision IS DISTINCT FROM p_observed_consent_revision THEN
    v_void := 'watermark_mismatch';
  END IF;

  IF v_void IS NOT NULL THEN
    RETURN QUERY SELECT ev.id, ev.status, 0, v_void;
    RETURN;
  END IF;
  RETURN QUERY SELECT ev.id, ev.status, 1, NULL;
END $$;


GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER FUNCTION conversation_event_dispatch_replay(uuid,bigint,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION conversation_event_dispatch_replay(uuid,bigint,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION conversation_event_dispatch_replay(uuid,bigint,bigint) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- G. 单事件乐观 CAS 状态跃迁原语（MEDIUM-2 接线：WHERE version=expected + version+1）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 这是 version 列「摆设」修复的可复用原语：单事件状态跃迁用乐观并发（`WHERE version=expected`
-- + `version+1`），并发对同一事件用同一 expected_version 跃迁时只有一个赢家（另一个 0 行）。
-- 0108 单向 guard 仍拦 fenced→active / purged→{active,fenced}（回退必拒）。owner RLS 仍 scope
-- 到调用者自己的事件。retention_class='session'（会话级删除）未来可经此原语做单事件 fence。
CREATE OR REPLACE FUNCTION conversation_event_transition_status(
  p_event_id uuid,
  p_from_status text,
  p_to_status text,
  p_expected_version bigint
) RETURNS TABLE (event_id uuid, status text, version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_event_id IS NULL
     OR p_from_status NOT IN ('active','privacy_fenced','purged')
     OR p_to_status NOT IN ('active','privacy_fenced','purged')
     OR p_expected_version IS NULL OR p_expected_version < 1 THEN
    RAISE EXCEPTION 'conversation_event_transition_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    UPDATE conversation_event AS e
       SET status = p_to_status, version = e.version + 1, updated_at = now()
     WHERE e.id = p_event_id
       AND e.owner_user_id = principal
       AND e.status = p_from_status
       AND e.version = p_expected_version
     RETURNING e.id, e.status, e.version;
END $$;
ALTER FUNCTION conversation_event_transition_status(uuid,text,text,bigint) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION conversation_event_transition_status(uuid,text,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION conversation_event_transition_status(uuid,text,text,bigint) TO app_role;

-- runtime login 永不通过 membership 漂移成为 privacy worker（防漂移，镜像 0093/0096）。
REVOKE privacy_issuer, privacy_worker_executor FROM app_role;
