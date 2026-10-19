-- 去掉已被部分索引取代的旧索引，并提供已投递行的分批保留期删除。
-- 默认事务迁移。四条语句。函数体内的 BEGIN 在 dollar quote 内，不是事务控制。

DROP INDEX IF EXISTS ix_outbox_pending;

CREATE OR REPLACE FUNCTION commerce_outbox_relayed_retention_purge(p_keep_days integer, p_batch_cap integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  purged integer;
BEGIN
  IF p_keep_days IS NULL OR p_keep_days < 7 OR p_keep_days > 365
     OR p_batch_cap IS NULL OR p_batch_cap < 1 OR p_batch_cap > 10000 THEN
    RAISE EXCEPTION 'commerce_outbox_retention_invalid_input' USING ERRCODE = 'check_violation';
  END IF;
  DELETE FROM commerce_outbox
   WHERE status = 'relayed'
     AND created_at < clock_timestamp() - make_interval(days => p_keep_days)
     AND id IN (
       SELECT id
         FROM commerce_outbox
        WHERE status = 'relayed'
          AND created_at < clock_timestamp() - make_interval(days => p_keep_days)
        LIMIT p_batch_cap
     );
  GET DIAGNOSTICS purged = ROW_COUNT;
  RETURN purged;
END;
$$;

REVOKE ALL ON FUNCTION commerce_outbox_relayed_retention_purge(integer, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION commerce_outbox_relayed_retention_purge(integer, integer) TO app_role;
