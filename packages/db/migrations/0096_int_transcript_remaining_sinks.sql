-- 0096_int_transcript_remaining_sinks.sql
--
-- INT-TRANSCRIPT-01：闭合「删后 read=0」的剩余删除 sink（event/report/ai_graph_run/
-- answer_hash），并在 vector/trace 两处诚实登记「无 interview 作用域 resolver、保留至
-- account/保留策略」的已知缺口（不伪删、不假称已闭合）。
--
-- 范围（对齐 .tmp/int-transcript-pregen-gate.md §7 缺口表）：
--   1. `event`(interview_event)：enum 已声明但无 resolver/target，仅 RLS fence 读=0。
--      → 本迁移补 resolver + target + 物理删除 + 逐 sink receipt。
--   2. `report`(ai_report/assessment_report/learning_plan/learning_progress/career_path/
--      question_feedback)：无 target。→ 补 resolver + target + 物理删除 + receipt。
--   3. `ai_graph_run`：0059 已 fence 写 guard（thread_id=interview id）但无删除
--      target/resolver。→ 本迁移补 ai_graph_run sink + resolver + target + 物理删除 +
--      receipt（delete→read=0）。
--   4. `interview_question.answer_hash`：低熵 SHA-256 oracle 残留。→ 在**活删除流**
--      interview_projection_begin_erasure 里随 fence 前清除为 NULL（SECURITY DEFINER 角色
--      内部 UPDATE，不依赖 0075 已暂停的 privacy_begin_checkpoint_erasure——那条旧路径是
--      app_role 死代码）。
--   5. `vector`(vector_chunk)：无 epoch/fence/target，且 **无 interview 作用域键**（只有
--      owner_user_id + kind∈{qbank,memory} + ref_id→题目 id/记忆 id）。kind='qbank' 是
--      共享题库（系统数据，系统 owner 写入，非访谈主体，删拒绝合法）；kind='memory' 是
--      owner 级用户内容，归 MEM/account_data_erasure 轨道，**但 MEM-00（0093）目前只删
--      memory_fact/memory_index_generation/memory_context_snapshot，未覆盖 vector_chunk**
--      ——这是已知缺口，如实登记（不伪称已归 MEM-00）。interview erasure 不为其建 target、
--      绝不伪装成已删除（proof 断言 vector 行不被误删）。
--   6. `trace`(DB ai_invocation_trace) + provider/oss：oss/redis/langfuse 已由 0058 落
--      retention_pending，其「executor async confirm」出口 = 0091 冻结的
--      privacy_resolve_deletion_receipt（external_pending→external_confirmed，且经
--      no-forge-completed guard 重估，绝不把 pending_external/failed_cleanup 伪造为
--      completed）。DB ai_invocation_trace 只有 owner_user_id + idempotency_key +
--      request_id（每请求瞬态 UUID，无持久 interview 列），**无 interview 作用域 resolver**；
--      其 output 是模型输出 jsonb（用户内容）。本迁移**不建 target、不伪删**，如实登记为
--      「无 interview 作用域 resolver、保留至 account/保留策略（观测轨道）」（proof 断言不被
--      误删）。
--
-- 铁律（与 CLAUDE.md 对齐）：
--   - **复用冻结的 PrivacyAuthorizationIssuer（0091），绝不重实现**：签发/验签/consume/
--     claim 全走 0091。0091 的 privacy_authorization_claim_target 对 interview_data 是
--     sink 无关的（只重验 owner/scope/subject/epoch/活 digest），故 event/report/ai_graph_run
--     三个新 target 直接复用该冻结 claim，本迁移只补 sink resolver + begin-erasure +
--     list-claimable + purge（与 0092/0093 同构）。
--   - 每个 sink 显式状态（禁布尔汤）：target pending→leased→erased；receipt
--     local_erased/retention_pending/external_pending/external_confirmed/failed_cleanup；
--     request requested→fenced→purging→pending_external→completed/partial_failed。
--     pending_external/failed_cleanup 绝不伪造 completed（0091 guard 是 DB 约束）。
--   - 四原语：CAS（purge 的 version 条件更新 + 租约 token）、幂等键（request UNIQUE(owner,
--     idempotency_key_hash)）、RLS principal 绑定（FORCE RLS + owner=GUC）、持久有序
--     （request/target/receipt 账本由 0047/0091 提供）。
--   - 删后 read=0 = 真物理删除 + receipt，不是只靠 RLS fence 假绿。
--   - **fence 对齐 0058/0059**：interview_projection_begin_erasure 必须像 0058 一样 revoke
--     enrollment + 建 privacy_checkpoint_target（否则 interview_privacy_active 恒 true、
--     0059 写 guard 永不触发，late write 会在 purge 提交后复活 event/report/ai_graph_run）。

-- ═══════════════════════════════════════════════════════════════════════════
-- A. 扩展 sink 枚举：新增 ai_graph_run（0059 已 fence 但无删除 target/resolver）
-- ═══════════════════════════════════════════════════════════════════════════
-- 0093 把 sink CHECK 定格为 INT 9 + MEM 7。ai_graph_run 是访谈作用域投影（thread_id=
-- interview id），0059 已为它挂写 guard，但没有任何删除 target/resolver——这是 M1 缺口。
-- 这里「找到并删掉旧约束 → 重加完整枚举 + ai_graph_run」（与 0092/0093 同源，不新建迁移）。
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
    -- 0096 新增：访谈作用域 graph run（thread_id=interview id，0059 已 fence 写 guard）
    'ai_graph_run'
  ));

-- ═══════════════════════════════════════════════════════════════════════════
-- A'. answer_hash 低熵 oracle：主清除在活删除流（Section C），此处仅防御纵深
-- ═══════════════════════════════════════════════════════════════════════════
-- answer_hash 是「原始答案的裸 SHA-256」，低熵可猜，是删除事实根之外残留的关联预言机。
-- 主清除已移到**活删除流** interview_projection_begin_erasure（Section C，SECURITY DEFINER
-- 内部 UPDATE，在建 checkpoint target 之前执行，故不被 interview_question 写 guard 拒）。
-- 这里仍保留 privacy_begin_checkpoint_erasure 里的一条 answer_hash 清除作为防御纵深：该
-- 旧路径已被 0075 REVOKE EXECUTE FROM app_role 暂停，是死代码，但若未来经新 issuer 重新
-- 授权，它仍应随 fence 一并清 answer_hash。签名/返回列/owner 与 0058 完全一致，不改变
-- 既有 target 集（checkpoint_rows / interview_job_payload / oss/redis/langfuse 逐 sink
-- 数量与既有 proof PPRIV009/PPRIV010 不漂移）。
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

  -- INT-TRANSCRIPT-01（防御纵深）：清除低熵 SHA-256 answer_hash oracle（覆盖
  -- issued/queued/answered 全部状态）。它是原始答案的裸哈希、可被猜测确认，是 0092 bodyHmac
  -- 取代之前的残留关联预言机，绝不能在 fence 后留存。必须在建 privacy_checkpoint_target
  -- 之前执行——此刻 interview_question 写 guard 仍观察为 active，否则这内部 UPDATE 会被拒
  -- （与 0058「先清队列、后建 target」的时序同源）。
  -- 注意：本函数的 app_role EXECUTE 已被 0075 暂停，这是死代码路径；**主清除在活删除流
  -- interview_projection_begin_erasure（Section C）**，此处只是保留旧路径的防御纵深。
  UPDATE interview_question
     SET answer_hash=NULL
   WHERE owner_user_id=principal AND interview_id=target_thread
     AND answer_hash IS NOT NULL;

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
-- 0075 已 REVOKE EXECUTE ... FROM app_role（防 forged-GUC 冒名删除）。本 CREATE OR REPLACE
-- 只改函数体（新增 answer_hash 清除），绝不把该入口重新授权给 app_role——否则会撤销 0075 的
-- fail-closed 暂停。显式重申撤销，防止任何 ACL 漂移重新点亮这条旧路径。
REVOKE EXECUTE ON FUNCTION privacy_begin_checkpoint_erasure(text,text) FROM app_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- B. event + report 的删除目标 resolver（sink='event' / sink='report' 的 locator）
-- ═══════════════════════════════════════════════════════════════════════════
-- 与 0092 的 interview_answer_artifact_target 同构：本表只解析 interview_data 域内
-- event/report 两个 sink 的 interview locator。两个 sink 共享同一 interview_id 键，故共用
-- 一张 resolver 表；purge 时按 privacy_deletion_target.sink 分支到对应数据面。
CREATE TABLE IF NOT EXISTS interview_projection_target (
  target_id uuid PRIMARY KEY REFERENCES privacy_deletion_target(id) ON DELETE RESTRICT,
  request_id uuid NOT NULL REFERENCES privacy_erasure_request(id) ON DELETE RESTRICT,
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE interview_projection_target ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_projection_target FORCE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS interview_projection_target_owner_interview_idx
  ON interview_projection_target (owner_user_id, interview_id);

-- ── grants（原始表访问权不落到 app_role/PUBLIC 之外的读面）──────────────────────────
REVOKE ALL ON interview_projection_target FROM PUBLIC, app_role;
GRANT SELECT, INSERT ON interview_projection_target TO privacy_api_owner;
-- purge 用 SELECT ... FOR UPDATE 联表锁定 locator（镜像 0092），FOR UPDATE 额外要求被锁表的
-- UPDATE 权限，故 SELECT, UPDATE（仅 SELECT 会被 aclchk 拒）。
GRANT SELECT, UPDATE ON interview_projection_target TO privacy_worker_owner;

-- 物理删除数据面：worker definer 只 SELECT/DELETE（绝不 UPDATE 业务投影内容）。
REVOKE DELETE ON interview_event, ai_graph_run FROM app_role;
GRANT SELECT, DELETE ON interview_event TO privacy_worker_owner;
GRANT SELECT, DELETE ON ai_graph_run TO privacy_worker_owner;
GRANT SELECT, DELETE ON ai_report, assessment_report, learning_plan, learning_progress,
      career_path, question_feedback TO privacy_worker_owner;

-- ── RLS policies ──────────────────────────────────────────────────────────────
-- resolver：api_owner 只摸自己的；worker 走 dispatch（USING true，仅供 list-claimable
-- definer 跨 owner 枚举，爆炸半径由「executor 无表级 GRANT + 仅 SECURITY DEFINER 函数可达」
-- 收窄）；再补 owner-scoped FOR ALL 使 purge 的 FOR UPDATE 有可用锁策略（镜像 0092）。
DROP POLICY IF EXISTS interview_projection_target_api_owner ON interview_projection_target;
CREATE POLICY interview_projection_target_api_owner ON interview_projection_target
  FOR ALL TO privacy_api_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_projection_target_worker_dispatch ON interview_projection_target;
CREATE POLICY interview_projection_target_worker_dispatch ON interview_projection_target
  FOR SELECT TO privacy_worker_owner
  USING (true);
DROP POLICY IF EXISTS interview_projection_target_worker_owner ON interview_projection_target;
CREATE POLICY interview_projection_target_worker_owner ON interview_projection_target
  FOR ALL TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- 数据面 worker 策略：SELECT owner-scoped + DELETE 需 app.privacy_target_id 就位
-- （镜像 0092 的 worker_delete 谓词，杜绝 worker 在 purge 事务之外裸删业务行）。
DROP POLICY IF EXISTS interview_event_privacy_worker_select ON interview_event;
CREATE POLICY interview_event_privacy_worker_select ON interview_event
  FOR SELECT TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_event_privacy_worker_delete ON interview_event;
CREATE POLICY interview_event_privacy_worker_delete ON interview_event
  FOR DELETE TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true)
     AND current_setting('app.privacy_target_id', true) IS NOT NULL);
DROP POLICY IF EXISTS ai_graph_run_privacy_worker_select ON ai_graph_run;
CREATE POLICY ai_graph_run_privacy_worker_select ON ai_graph_run
  FOR SELECT TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS ai_graph_run_privacy_worker_delete ON ai_graph_run;
CREATE POLICY ai_graph_run_privacy_worker_delete ON ai_graph_run
  FOR DELETE TO privacy_worker_owner
  USING (owner_user_id = current_setting('app.principal_user', true)
     AND current_setting('app.privacy_target_id', true) IS NOT NULL);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ai_report','assessment_report','learning_plan','learning_progress','career_path','question_feedback'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_privacy_worker_select ON %I', t, t);
    EXECUTE format('CREATE POLICY %I_privacy_worker_select ON %I FOR SELECT TO privacy_worker_owner USING (owner_user_id = current_setting(''app.principal_user'', true))', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_privacy_worker_delete ON %I', t, t);
    EXECUTE format('CREATE POLICY %I_privacy_worker_delete ON %I FOR DELETE TO privacy_worker_owner USING (owner_user_id = current_setting(''app.principal_user'', true) AND current_setting(''app.privacy_target_id'', true) IS NOT NULL)', t, t);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- C. 非破坏 fence（API 阶段）：创建 event + ai_graph_run + report 三 target + checkpoint
--    fence 锚 + 活 digest + epoch；并在此活流清 answer_hash（H1）与 revoke enrollment（H2）
-- ═══════════════════════════════════════════════════════════════════════════
-- event/report/ai_graph_run 无隐私 status 列可翻转：其读写 fence 由 checkpoint resolver
-- （0059 写 guard + RLS）承担。本 begin-erasure 做四件事：(1) 在建 checkpoint target 之前
-- 清 interview_question.answer_hash（H1，此刻写 guard 仍观察 active）；(2) revoke enrollment
-- 后建 fence 锚（H2，使 interview_privacy_active() 转 false、0059 写 guard 触发）；(3) 为
-- event/ai_graph_run/report 各建 pending target + locator；(4) 钉活 digest + epoch。返回每
-- sink 一行（sink/resource_hmac/target_id），供编排层据此构建签名快照的目标集（与 0093
-- memory_begin_account_erasure 的返回形状同构）。
CREATE OR REPLACE FUNCTION interview_projection_begin_erasure(
  target_interview text,
  request_key_hash text,
  p_privacy_epoch bigint
) RETURNS TABLE (
  request_id uuid, request_status text, privacy_epoch bigint, target_set_digest text,
  sink text, resource_hmac text, target_id uuid, replayed boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  existing privacy_erasure_request%ROWTYPE;
  created_request uuid;
  v_digest text;
  v_status text;
  sink_name text;
  v_target uuid;
  v_fence uuid;
  new_epoch bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0
     OR request_key_hash !~ '^[a-f0-9]{64}$' OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1 THEN
    RAISE EXCEPTION 'interview_projection_erasure_invalid' USING ERRCODE='22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:' || target_interview));
  PERFORM 1 FROM interview i WHERE i.id=target_interview AND i.owner_user_id=principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'interview_projection_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing FROM privacy_erasure_request r
   WHERE r.owner_user_id=principal AND r.idempotency_key_hash=request_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> 'interview_data' OR existing.subject_id <> target_interview THEN
      RAISE EXCEPTION 'interview_projection_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    RETURN QUERY
      SELECT d.request_id, r2.status, r2.privacy_epoch, r2.target_set_digest,
             d.sink, d.resource_hmac, d.id, true
        FROM privacy_deletion_target d
        JOIN privacy_erasure_request r2 ON r2.id=d.request_id
       WHERE r2.id=existing.id
       ORDER BY d.sink;
    RETURN;
  END IF;

  INSERT INTO privacy_erasure_request(owner_user_id,scope,subject_id,idempotency_key_hash,status,privacy_epoch)
    VALUES (principal,'interview_data',target_interview,request_key_hash,'requested',p_privacy_epoch)
    RETURNING id INTO created_request;

  -- INT-TRANSCRIPT-01（H1 主清除点）：清除低熵 SHA-256 answer_hash oracle（覆盖
  -- issued/queued/answered 全部状态）。它是原始答案的裸哈希、可被猜测确认。必须在建
  -- privacy_checkpoint_target 之前执行——此刻 interview_question 写 guard
  -- （enforce_interview_question_privacy_active）仍观察为 active，否则这内部 UPDATE 会
  -- 被拒（与 0058「先清队列、后建 target」的时序同源）。这是活删除流的主清除，不依赖 0075
  -- 已暂停的 privacy_begin_checkpoint_erasure。
  UPDATE interview_question
     SET answer_hash=NULL
   WHERE owner_user_id=principal AND interview_id=target_interview
     AND answer_hash IS NOT NULL;

  -- 0058 同源 fence：revoke enrollment（fence_epoch+1）后再建 checkpoint target，使
  -- interview_privacy_active() 转 false、0059 写 guard 真正触发，杜绝 late write 在 purge
  -- 提交后复活 event/report/ai_graph_run 行。无 active enrollment 时 new_epoch 为 NULL，
  -- fence 锚仍会建（privacy_checkpoint_target.fence_epoch 允许 NULL）。
  UPDATE checkpoint_thread_enrollment
     SET access_state='revoked',fence_epoch=checkpoint_thread_enrollment.fence_epoch+1,revoked_at=now()
   WHERE thread_id=target_interview AND owner_user_id=principal AND access_state='active'
   RETURNING checkpoint_thread_enrollment.fence_epoch INTO new_epoch;

  -- event/ai_graph_run/report 无隐私 status 列可翻转：其读写 fence 由 checkpoint resolver
  -- 承担（本函数刚建）。这里为每个 sink 建 pending target + locator 行。
  FOREACH sink_name IN ARRAY ARRAY['event','ai_graph_run','report'] LOOP
    INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac,status)
      VALUES (
        created_request,
        sink_name,
        encode(hmac(target_interview || ':' || sink_name || ':' || created_request::text, request_key_hash, 'sha256'),'hex'),
        'pending'
      ) RETURNING id INTO v_target;
    INSERT INTO interview_projection_target(target_id,request_id,owner_user_id,interview_id)
      VALUES (v_target, created_request, principal, target_interview);
  END LOOP;

  -- fence 锚（H2 主修复）：建一个 sink='checkpoint_rows'、status='erased'、deleted_count=0 的
  -- 目标行，只作 privacy_checkpoint_target 的 target_id 锚点，使 interview_privacy_active()
  -- 转 false、0059 写 guard 真正触发（否则 late write 会在 purge 提交后复活 event/report/
  -- ai_graph_run 行）。本流不真删 checkpoint 行（那是 checkpoint 流的独立 request），故立即
  -- erased 使其对两个 list-claimable（0048 checkpoint / 本迁移 projection，均只认 pending/
  -- leased 过期/failed）不可认领，避免跨流误领；0048 claim 对 erased 也只回显、不删。它仍
  -- 计入 v_digest（0091 claim 逐字节重算活 digest 覆盖全部 target），否则签名快照与 DB
  -- target_set_digest 漂移、claim 重验必失败。
  INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac,status,deleted_count,receipt_hash)
    VALUES (
      created_request,
      'checkpoint_rows',
      encode(hmac(target_interview || ':checkpoint_rows:' || created_request::text, request_key_hash, 'sha256'),'hex'),
      'erased',
      0,
      encode(digest(created_request::text || ':checkpoint_rows:0', 'sha256'),'hex')
    ) RETURNING id INTO v_fence;
  INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch)
    VALUES (v_fence, created_request, principal, target_interview, new_epoch);

  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO v_digest FROM privacy_deletion_target d WHERE d.request_id = created_request;

  UPDATE privacy_erasure_request
     SET status='fenced', target_set_digest=v_digest, updated_at=now(), version=version+1
   WHERE id=created_request AND status='requested'
   RETURNING status INTO v_status;

  RETURN QUERY
    SELECT d.request_id, v_status, p_privacy_epoch, v_digest,
           d.sink, d.resource_hmac, d.id, false
      FROM privacy_deletion_target d
     WHERE d.request_id=created_request
     ORDER BY d.sink;
END $$;
ALTER FUNCTION interview_projection_begin_erasure(text,text,bigint) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION interview_projection_begin_erasure(text,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_projection_begin_erasure(text,text,bigint) TO app_role;

-- ── 后台可认领目标（event/report 专用 dispatch feed，镜像 0078/0092）────────────────
CREATE OR REPLACE FUNCTION interview_projection_list_claimable_targets(
  max_items integer DEFAULT 32
) RETURNS TABLE (target_id uuid, owner_user_id text)
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT pt.target_id, pt.owner_user_id
    FROM interview_projection_target pt
    JOIN privacy_deletion_target t ON t.id=pt.target_id
    JOIN privacy_erasure_request r ON r.id=pt.request_id
   WHERE max_items BETWEEN 1 AND 128
     AND r.status IN ('fenced','purging','pending_external')
     AND (t.status='pending' OR (t.status='leased' AND t.lease_expires_at < now()) OR t.status='failed')
   ORDER BY t.created_at, pt.target_id
   LIMIT max_items
$$;


GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION interview_projection_list_claimable_targets(integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION interview_projection_list_claimable_targets(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION interview_projection_list_claimable_targets(integer) TO privacy_worker_executor;

-- ── 后台物理删除（event/ai_graph_run/report 专用 purge，镜像 0092/0093）────────────
-- 每个 sink 一个明确 DELETE 动作，删除后校验残留=0（未知 locator/残留≠0 一律 fail-closed）。
-- 复用冻结 claim（privacy_authorization_claim_target）认领租约；purge 只做物理删除 + 收据。
-- H2：purge 持有 interview_privacy 咨询锁（与 0059 写 guard 同锁），串行化 fence 检查与物理
-- 删除的 TOCTOU，配合 begin-erasure 已建的 fence 锚使 late write 在 purge 提交后必被 0059 拒。
CREATE OR REPLACE FUNCTION privacy_purge_interview_projection_target(
  target uuid,
  token uuid
) RETURNS TABLE (target_id uuid, status text, deleted_count bigint, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  target_row record;
  step bigint := 0;
  removed bigint := 0;
  remaining bigint := 0;
  final_request_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR token IS NULL THEN
    RAISE EXCEPTION 'interview_projection_purge_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.id,t.request_id,t.status,t.lease_token,t.lease_expires_at,t.version,t.sink,
         pt.interview_id,pt.owner_user_id,r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN interview_projection_target pt ON pt.target_id=t.id
    JOIN privacy_erasure_request r ON r.id=t.request_id
   WHERE t.id=target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'interview_projection_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RAISE EXCEPTION 'interview_projection_target_request_not_active' USING ERRCODE='42501';
  END IF;
  IF target_row.status='erased' THEN
    RETURN QUERY SELECT target_row.id,'erased'::text,0::bigint,target_row.request_status;
    RETURN;
  END IF;
  IF target_row.status <> 'leased' OR target_row.lease_token IS DISTINCT FROM token
     OR target_row.lease_expires_at < now() THEN
    RAISE EXCEPTION 'interview_projection_target_lease_lost' USING ERRCODE='42501';
  END IF;

  -- H2：与 interview_privacy_active()/0059 写 guard 共用同一把会话级咨询锁。purge 持锁期间，
  -- 任何并发「写 guard 读 fence → 再 append event/report/ai_graph_run」的 TOCTOU 都被串行化：
  -- 本事务提交后 fence 锚已生效、interview_privacy_active 转 false，late write 被 0059 拒。
  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:' || target_row.interview_id));

  PERFORM set_config('app.privacy_target_id', target_row.id::text, true);
  PERFORM set_config('app.privacy_lease_token', token::text, true);

  -- 逐 sink 明确删除动作；未知 locator 一律 fail-closed。
  IF target_row.sink = 'event' THEN
    DELETE FROM interview_event WHERE owner_user_id=principal AND stream_key=target_row.interview_id;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM interview_event WHERE owner_user_id=principal AND stream_key=target_row.interview_id;
  ELSIF target_row.sink = 'ai_graph_run' THEN
    DELETE FROM ai_graph_run WHERE owner_user_id=principal AND thread_id=target_row.interview_id;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM ai_graph_run WHERE owner_user_id=principal AND thread_id=target_row.interview_id;
  ELSIF target_row.sink = 'report' THEN
    removed := 0;
    DELETE FROM question_feedback WHERE owner_user_id=principal AND interview_id=target_row.interview_id;
    GET DIAGNOSTICS step = ROW_COUNT; removed := removed + step;
    DELETE FROM learning_progress WHERE owner_user_id=principal AND interview_id=target_row.interview_id;
    GET DIAGNOSTICS step = ROW_COUNT; removed := removed + step;
    DELETE FROM learning_plan WHERE owner_user_id=principal AND interview_id=target_row.interview_id;
    GET DIAGNOSTICS step = ROW_COUNT; removed := removed + step;
    DELETE FROM career_path WHERE owner_user_id=principal AND interview_id=target_row.interview_id;
    GET DIAGNOSTICS step = ROW_COUNT; removed := removed + step;
    DELETE FROM assessment_report WHERE owner_user_id=principal AND interview_id=target_row.interview_id;
    GET DIAGNOSTICS step = ROW_COUNT; removed := removed + step;
    DELETE FROM ai_report WHERE owner_user_id=principal AND interview_id=target_row.interview_id;
    GET DIAGNOSTICS step = ROW_COUNT; removed := removed + step;
    SELECT
      (SELECT count(*) FROM question_feedback WHERE owner_user_id=principal AND interview_id=target_row.interview_id)
    + (SELECT count(*) FROM learning_progress WHERE owner_user_id=principal AND interview_id=target_row.interview_id)
    + (SELECT count(*) FROM learning_plan WHERE owner_user_id=principal AND interview_id=target_row.interview_id)
    + (SELECT count(*) FROM career_path WHERE owner_user_id=principal AND interview_id=target_row.interview_id)
    + (SELECT count(*) FROM assessment_report WHERE owner_user_id=principal AND interview_id=target_row.interview_id)
    + (SELECT count(*) FROM ai_report WHERE owner_user_id=principal AND interview_id=target_row.interview_id)
      INTO remaining;
  ELSE
    RAISE EXCEPTION 'interview_projection_target_locator_unknown' USING ERRCODE='42501';
  END IF;
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'interview_projection_target_residual_rows' USING ERRCODE='55000';
  END IF;

  UPDATE privacy_deletion_target AS d
     SET status='erased', deleted_count=removed,
         receipt_hash=encode(digest(d.id::text || ':' || token::text || ':' || removed::text, 'sha256'),'hex'),
         lease_owner=NULL, lease_token=NULL, lease_expires_at=NULL, version=d.version+1, updated_at=now()
   WHERE d.id=target_row.id AND d.status='leased' AND d.lease_token=token AND d.version=target_row.version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'interview_projection_target_complete_cas_lost' USING ERRCODE='40001';
  END IF;

  -- F1 同源最终 CASE：纳入 receipts 判定，绝不因 external_pending/failed_cleanup 未 resolve
  -- 而伪造 completed（否则命中 0091 no-forge-completed guard 回滚已完成的物理删除）。
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
  RETURN QUERY SELECT target_row.id,'erased'::text,removed,final_request_status;
END $$;
ALTER FUNCTION privacy_purge_interview_projection_target(uuid,uuid) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;


REVOKE ALL ON FUNCTION privacy_purge_interview_projection_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_interview_projection_target(uuid,uuid) TO privacy_worker_executor;

-- runtime login 永不通过 membership 漂移成为 privacy worker/issuer（防漂移，镜像 0092/0093）。
REVOKE privacy_issuer, privacy_worker_executor FROM app_role;
