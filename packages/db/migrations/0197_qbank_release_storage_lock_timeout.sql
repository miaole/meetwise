-- 0197_qbank_release_storage_lock_timeout.sql — #137：qbank 释放例程体内补 lock_timeout（锁窗收窄）
--
-- executionMode = transactional（默认·恰 1 语句 CREATE OR REPLACE FUNCTION）
--
-- #137 修法（DETACH 形裁决=函数内非并发 DETACH+SET LOCAL lock_timeout）：0176
-- 重写版函数体逐字承形，仅体内增 SET LOCAL lock_timeout 一行（值=runner
-- MIGRATION_LOCK_TIMEOUT_MS 默认族同值 '15s'）——SET LOCAL 先行、DETACH、DROP
-- 逐段收窄锁窗（DETACH CONCURRENTLY 无事务内载体：函数体内 EXECUTE 恒在事务中，
-- runner 三模式均不可承载——裁决七原文）。0176 版体外零改（REVOKE/GRANT 面零触）。
-- CREATE OR REPLACE 不改 ACL/owner/SECURITY DEFINER 属性（密封清单契约面零触）。
-- 运维手册面：ai-docs/architecture/backend/qbank-partition-lifecycle-ops.md 增补
-- （登记面·随本刀交付）。

CREATE OR REPLACE FUNCTION qbank_release_retired_generation_storage(p_generation text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE suffix text; tab text; st text; snap_epoch bigint; now_epoch bigint; active_gen text; released timestamptz;
BEGIN
  -- 锁窗收窄（#137）：先设语句级 lock_timeout 再做 DETACH/DROP，等待热表强锁
  -- 超时即放弃，不拖住发布链路。仅作用本事务（调用者事务），事务结束自动复原。
  SET LOCAL lock_timeout = '15s';
  -- 守卫 1：definer 白名单断言（0070:20-38/0144:674-701 白名单族形·裁决项⑥）——替换 0146:22-25 的
  -- app.principal_user GUC 断言。SD 体内 current_user=本函数属主；白名单=15 控制面函数属主集合
  -- （tf_is_generation_control_definer 调用时动态解析 pg_proc）。伪造 GUC 不再构成授权根；
  -- 执行授权边界=下方 REVOKE/GRANT（executor-only）。
  IF NOT public.tf_is_generation_control_definer() THEN
    RAISE EXCEPTION 'qbank_release_storage_definer_required' USING ERRCODE='insufficient_privilege';
  END IF;
  -- 守卫 2：目标代必须已终结（retired/failed）；building/validated/active 一律拒绝
  SELECT state, source_epoch, storage_released_at INTO st, snap_epoch, released
    FROM qbank_vector_generation WHERE id=p_generation FOR UPDATE;
  IF st IS NULL THEN
    RAISE EXCEPTION 'unknown qbank generation' USING ERRCODE='check_violation';
  END IF;
  IF st NOT IN ('retired','failed') THEN
    RAISE EXCEPTION 'qbank generation storage can only be released for retired/failed generations (state=%)', st USING ERRCODE='check_violation';
  END IF;
  -- 守卫 3：目标代 ≠ 当前 active 指针（state 守卫已含 active·此处双保险）
  SELECT generation_id INTO active_gen FROM qbank_active_generation WHERE singleton;
  IF active_gen = p_generation THEN
    RAISE EXCEPTION 'cannot release the active qbank generation' USING ERRCODE='check_violation';
  END IF;
  -- 守卫 4：回滚窗口已死——corpus epoch 已前进过该代的 source_epoch（activate 本会抛 serialization_failure·0029:354；
  -- 语料未前进时旧代仍是同 epoch 下的回滚资产，不许释放）。裁决项⑤=豁免形：维持 retired-only（0146:43 原形），
  -- failed 代无 epoch 守卫（无重激活路径·非回滚资产·调度半须可释放 failed 半成品——登记见文件头）。
  SELECT epoch INTO now_epoch FROM qbank_corpus_epoch WHERE singleton FOR SHARE;
  IF st = 'retired' AND snap_epoch >= now_epoch THEN
    RAISE EXCEPTION 'corpus epoch has not advanced past generation source_epoch; rollback window still open' USING ERRCODE='check_violation';
  END IF;
  -- 守卫 5：幂等门——已释放过即拒绝（防二次 DETACH 撞不存在的分区名）
  IF released IS NOT NULL THEN
    RAISE EXCEPTION 'qbank generation storage already released at %', released USING ERRCODE='check_violation';
  END IF;

  -- 分区名派生复用 prepare 的确定性规则（0029:201·不信任请求参数作 identifier）
  suffix := replace(substr(p_generation, 6), '-', '');
  tab := 'qbank_generation_chunk_' || suffix;
  -- DETACH+DROP 不逐行触发 row trigger；HNSW partial index 随表自动落
  EXECUTE format('ALTER TABLE qbank_generation_chunk DETACH PARTITION %I', tab);
  EXECUTE format('DROP TABLE %I', tab);
  -- 元数据行永不抹（发布审计面）；仅落释放时间戳
  UPDATE qbank_vector_generation SET storage_released_at=clock_timestamp() WHERE id=p_generation;
END;
$$;
