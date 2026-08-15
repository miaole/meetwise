-- 0026_qbank_cache_trigger_reconcile.sql
-- 确保已有环境中的 vector_chunk 也接入 epoch bump。qbank_source/pool trigger 已在 0022 建立；此迁移只补
-- 常被旧 demo reset 重建的 vector_chunk 上的触发器，不改任何向量或缓存行。

DROP TRIGGER IF EXISTS trg_qbank_cache_epoch_vector ON vector_chunk;
CREATE TRIGGER trg_qbank_cache_epoch_vector
  AFTER INSERT OR UPDATE OR DELETE ON vector_chunk
  FOR EACH ROW EXECUTE FUNCTION qbank_bump_retrieval_cache_epoch();
