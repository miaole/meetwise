-- 面试事件插入改为按语句通知。
-- 同一条插入语句里，过渡表中每个不同的 stream_key 调用一次 pg_notify。
-- 通道与载荷仍是裸 stream_key。过渡表没有行时不调用。
-- 不新授权。原逐行迁移文件的字节不改。

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

CREATE OR REPLACE FUNCTION sse_event_notify_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM pg_notify('interview_event_ch', stream_key)
  FROM (SELECT DISTINCT stream_key FROM inserted) AS changed;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS interview_event_sse_notify ON interview_event;
CREATE TRIGGER interview_event_sse_notify
  AFTER INSERT ON interview_event
  REFERENCING NEW TABLE AS inserted
  FOR EACH STATEMENT
  EXECUTE FUNCTION sse_event_notify_after_insert();
