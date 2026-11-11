-- 0232_interview_job_erasure_projection_purge.sql — 隐私擦除域两处存量缺口（interview_job 明文 + 投影物理 purge 授权 feed）
--
-- executionMode = transactional（函数替换 ×1 / 新函数 ×2 / 表权 + RLS policy ×2 / REVOKE·GRANT，单事务原子）
--
-- 红事实（承接 PR #249 mw-privacy-int 审 §2(b) 与 N-11 深审 §4，均在 origin/main c94c4a3d6 实测）：
--   A. 活删除流 interview_projection_begin_erasure（0096:323）不碰 interview_job。fence 锚落地后
--      0059:92-94 p_owner 使该面试 job 行对 app_role 不可见、0058:95-98 写 guard 拒 UPDATE，
--      于是 queued/running 回答 payload 与历史 done/failed 行里的明文永久滞留，任何
--      app_role 侧 purge（含 #249 purgeStaleInterviewJobPayloads）都清不到。
--   B. 生产 worker 只跑 checkpoint 擦除（apps/worker/src/main.ts:768），0096 投影物理 purge
--      （event/ai_graph_run/report）没有循环；且投影 target 的 claim 走 0091 冻结授权
--      （privacy_authorization_claim_target），worker 侧没有「已消费授权 jti」解析 feed。
--
-- 本迁移（已应用迁移零字节改动；0058/0059/0091/0096/0141 原文不动）：
--   A1. CREATE OR REPLACE interview_projection_begin_erasure：0096 原体逐字保留，仅在
--       revoke enrollment / 建 fence 锚之前插入 interview_job 明文清除（0058 同序同形）。
--       RETURNS/target 集/digest 不变（不新增 target 行，签名快照目标集零漂移）。
--   A2. privacy_purge_fenced_interview_job_residue(max_items)：privacy_worker_owner definer，
--       仅 privacy_worker_executor 可执行。物理删除「已围栏面试」上仍带非空 payload 的
--       interview_job 行（历史残留 / 他请求先围栏时 A1 跳过的行），租约未过期的 running
--       行不动。DELETE 不经 0058 写 guard（guard 只挂 INSERT/UPDATE，0059 头注：DELETE 刻意
--       不 gate，留给隐私 purger）。
--       RLS：新增 privacy_worker_owner 专用 SELECT/DELETE policy，谓词 = 事务局域 GUC
--       app.privacy_job_residue_sweep='on'（函数即唯一 setter）AND 行所属面试存在活
--       fence（privacy_checkpoint_target × privacy_erasure_request 状态集 = 0058
--       interview_privacy_active 同集）。app_role 的 p_owner / privacy_api_owner policy 零改，
--       app_role 仍无 DELETE；未围栏面试的行即使 GUC 在场也不可见、不可删。
--   B1. interview_projection_target_consumed_jti(target)：0141 同形只读 jti feed，限定
--       interview_projection_target + scope=interview_data + purpose=interview_data_erasure +
--       subject/epoch/digest 与请求一致 + 未过期。claim 仍由 0091 冻结函数十项复核裁定；
--       无已消费授权 → worker 跳过（无授权不删）。
--
-- 诚实边界：本地隔离 PG 行级证据 ≠ 生产云端删除；WAL/备份/副本不在行级证据面；生产目前
-- 没有签发 0091 授权快照的调用方，故投影 purge 循环上线后对无授权 target 只计
-- skippedUnauthorized、不删；公开 interview DELETE 仍 503；releaseEvidence=false · NOT_HA。

-- ═══════════════════════════════════════════════════════════════════════════
-- A1. 活删除流补 interview_job 明文清除
-- ═══════════════════════════════════════════════════════════════════════════
GRANT CREATE ON SCHEMA public TO privacy_api_owner;
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
  v_job_active boolean;
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

  -- 0232（擦除域存量缺口 A）：清 interview_job.payload 明文。0096 原体不碰 interview_job，
  -- 而 fence 锚一落，0059 p_owner RLS 使该面试的 job 行对 app_role 不可见、0058 写 guard 拒
  -- 一切 UPDATE——队列里排队/在跑的回答与历史 done/failed 行残留的明文从此谁都清不到。
  -- 与 0058「先清队列、后建 target」同序：必须在建 privacy_checkpoint_target 之前执行
  -- （此刻写 guard 仍观察 active）。queued/running → done + '{}'（0058 同形，worker 后续
  -- 写回会被 0058 guard 拒）；done/failed 只把非空 payload 置 '{}'，状态/attempts/last_error
  -- 原样保留（不伪造失败原因）。若该面试此前已被另一请求围栏（interview_privacy_active
  -- =false），写 guard 必拒，故此处跳过、不让整笔删除回滚——残留交由 0232 B 段
  -- privacy_purge_fenced_interview_job_residue（privacy worker 物理删除）补完。
  v_job_active := interview_privacy_active(target_interview);
  IF v_job_active THEN
    UPDATE interview_job
       SET status='done', payload='{}'::jsonb, lease_owner=NULL, lease_expires_at=NULL,
           last_error='privacy_fenced', version=version+1
     WHERE owner_user_id=principal AND interview_id=target_interview
       AND status IN ('queued','running');
    UPDATE interview_job
       SET payload='{}'::jsonb, version=version+1
     WHERE owner_user_id=principal AND interview_id=target_interview
       AND status IN ('done','failed') AND payload <> '{}'::jsonb;
  END IF;

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

-- ═══════════════════════════════════════════════════════════════════════════
-- A2. 已围栏面试 interview_job 残留明文物理删除（privacy worker）
-- ═══════════════════════════════════════════════════════════════════════════
GRANT SELECT, DELETE ON interview_job TO privacy_worker_owner;

DROP POLICY IF EXISTS interview_job_privacy_worker_residue_select ON interview_job;
CREATE POLICY interview_job_privacy_worker_residue_select ON interview_job
  FOR SELECT TO privacy_worker_owner
  USING (
    current_setting('app.privacy_job_residue_sweep', true) = 'on'
    AND EXISTS (
      SELECT 1
        FROM privacy_checkpoint_target pt
        JOIN privacy_erasure_request r ON r.id = pt.request_id
       WHERE pt.thread_id = interview_job.interview_id
         AND pt.owner_user_id = interview_job.owner_user_id
         AND r.status IN ('requested','fenced','purging','pending_external','completed','partial_failed')
    )
  );
DROP POLICY IF EXISTS interview_job_privacy_worker_residue_delete ON interview_job;
CREATE POLICY interview_job_privacy_worker_residue_delete ON interview_job
  FOR DELETE TO privacy_worker_owner
  USING (
    current_setting('app.privacy_job_residue_sweep', true) = 'on'
    AND EXISTS (
      SELECT 1
        FROM privacy_checkpoint_target pt
        JOIN privacy_erasure_request r ON r.id = pt.request_id
       WHERE pt.thread_id = interview_job.interview_id
         AND pt.owner_user_id = interview_job.owner_user_id
         AND r.status IN ('requested','fenced','purging','pending_external','completed','partial_failed')
    )
  );

CREATE OR REPLACE FUNCTION privacy_purge_fenced_interview_job_residue(
  max_items integer DEFAULT 64
) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  removed bigint := 0;
BEGIN
  IF max_items IS NULL OR max_items < 1 OR max_items > 512 THEN
    RAISE EXCEPTION 'interview_job_residue_purge_invalid' USING ERRCODE='22023';
  END IF;
  -- 事务局域（is_local=true）：只在本函数所在事务内生效，函数即唯一 setter。
  PERFORM set_config('app.privacy_job_residue_sweep', 'on', true);
  WITH victim AS (
    SELECT j.id
      FROM interview_job j
     WHERE j.payload <> '{}'::jsonb
       AND NOT (j.status = 'running' AND j.lease_expires_at IS NOT NULL AND j.lease_expires_at >= now())
     ORDER BY j.created_at, j.id
     LIMIT max_items
  )
  DELETE FROM interview_job d USING victim WHERE d.id = victim.id;
  GET DIAGNOSTICS removed = ROW_COUNT;
  PERFORM set_config('app.privacy_job_residue_sweep', '', true);
  RETURN removed;
END $$;

GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION privacy_purge_fenced_interview_job_residue(integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_purge_fenced_interview_job_residue(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_fenced_interview_job_residue(integer) TO privacy_worker_executor;

-- ═══════════════════════════════════════════════════════════════════════════
-- B1. 投影 target 已消费授权 jti 只读 feed（0141 同形）
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION interview_projection_target_consumed_jti(
  p_target uuid
) RETURNS text
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT s.jti
    FROM interview_projection_target pt
    JOIN privacy_erasure_request r ON r.id = pt.request_id
    JOIN privacy_authorization_snapshot s
      ON s.owner_user_id = r.owner_user_id
     AND s.interview_id = r.subject_id
     AND s.privacy_epoch = r.privacy_epoch
     AND s.target_set_digest = r.target_set_digest
   WHERE pt.target_id = p_target
     AND r.scope = 'interview_data'
     AND s.purpose = 'interview_data_erasure'
     AND s.status = 'consumed'
     AND s.issuer_id = 'meetwise-privacy-authz-v1'
     AND s.expires_at > now()
   ORDER BY s.consumed_at DESC NULLS LAST, s.jti
   LIMIT 1
$$;
ALTER FUNCTION interview_projection_target_consumed_jti(uuid) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;
REVOKE ALL ON FUNCTION interview_projection_target_consumed_jti(uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION interview_projection_target_consumed_jti(uuid) TO privacy_worker_executor;
