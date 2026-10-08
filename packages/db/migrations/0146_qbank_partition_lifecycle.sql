-- 0146_qbank_partition_lifecycle.sql — DBHY-1 qbank retired 代存储释放例程（0029 分区生命周期的闭环节）。
--
-- 背景（0029 亲核）：qbank_generation_chunk 按 LIST(generation_id) 分区，每代一个物理表 + 独立 HNSW partial index；
-- qbank_activate_generation 只把旧 active 翻 'retired'，全库无任何 DETACH/清理 → 每次语料重灌永久落盘一套向量分区（含 failed
-- 代半成品），无界膨胀。行级 DELETE 被 trg_qbank_generation_chunk_only_building 焊死（非 building 代 DELETE 抛
-- check_violation）→ 清理必须 DETACH PARTITION + DROP TABLE（不逐行触发 row trigger·HNSW 随表落）。
--
-- 本迁移只新增（非破坏）：storage_released_at 列 + qbank_release_retired_generation_storage() 例程。零 UPDATE/零行 DELETE/
-- 零既有函数改动（TRIGFAM 域不碰）。例程为手动运维例程（无自动调度·Ban 自动清理调度）；与 G-R4-5 闭面关系：不碰检索四函数/
-- active 代/serving scope/cache epoch——gR45Closed=true·coveredCount=8 不重开不加成；RAG03-C 观察面（proof-local corpus·
-- exact-K NOT claimed）无闭面可失效。

ALTER TABLE qbank_vector_generation ADD COLUMN IF NOT EXISTS storage_released_at timestamptz;

CREATE OR REPLACE FUNCTION qbank_release_retired_generation_storage(p_generation text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE suffix text; tab text; st text; snap_epoch bigint; now_epoch bigint; active_gen text; released timestamptz;
BEGIN
  -- 守卫 1：仅 __system_qbank__（与 prepare/validate/activate 同权限面）
  IF current_setting('app.principal_user', true) <> '__system_qbank__' THEN
    RAISE EXCEPTION 'only __system_qbank__ may release qbank generation storage' USING ERRCODE='insufficient_privilege';
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
  -- 语料未前进时旧代仍是同 epoch 下的回滚资产，不许释放）
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
REVOKE ALL ON FUNCTION qbank_release_retired_generation_storage(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_release_retired_generation_storage(text) TO app_role;
