-- 0024_qbank_cache_epoch_lock.sql
-- app_role 只需读 epoch，不应被授予 FOR SHARE 所要求的 UPDATE ACL。把短时行锁封在固定 SECURITY DEFINER
-- 函数中：返回值仅为非敏感全局 epoch，锁在调用方当前事务结束前保持，和 qbank 变更 trigger 的 UPDATE 冲突。

-- FORCE RLS 也作用于函数属主；epoch 无主体敏感性，读策略对 public 开放，但 SELECT ACL 仍只授 app_role。
DROP POLICY IF EXISTS p_qbank_cache_epoch_read ON qbank_cache_epoch;
CREATE POLICY p_qbank_cache_epoch_read ON qbank_cache_epoch FOR SELECT TO PUBLIC USING (singleton);

CREATE OR REPLACE FUNCTION qbank_lock_retrieval_cache_epoch()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE result bigint;
BEGIN
  SELECT epoch INTO result FROM qbank_cache_epoch WHERE singleton=true FOR SHARE;
  IF result IS NULL THEN
    RAISE EXCEPTION 'qbank_retrieval_cache_epoch_missing';
  END IF;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION qbank_lock_retrieval_cache_epoch() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_lock_retrieval_cache_epoch() TO app_role;
