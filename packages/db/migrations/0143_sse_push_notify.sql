-- 0143_sse_push_notify.sql
--
-- SSE-PUSH (user-adjudicated knife · coordinator Opt1): precise push wakeup for
-- held SSE tails.  AFTER INSERT on interview_event notifies interview_event_ch
-- with the bare stream_key — interview / quiz / diagnosis share this table and
-- stream_key IS the SSE stream id (案A 统一 channel, zero entity classification).
-- Lossy hint only: waiters re-fetch seq>lastSeq; the event table remains the
-- sole source of truth.  Payload carries an id only — never owner or event data.
-- Worker wakeup channel (0084 / 0133 · meetwise_worker_wakeup_v1) is untouched.
-- B6 (ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md §B): LISTEN/NOTIFY push,
-- polling is fallback-only (≥30s when the channel is healthy; API degrades to
-- the legacy 2s poll when LISTEN is down or this trigger is absent).
-- Additive: event-table schema body (0001/0059/0126) untouched — trigger only.
-- releaseEvidence=false · Not HA · ≠ HA · ≠ cutover evidence.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

CREATE OR REPLACE FUNCTION sse_event_notify_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM pg_notify('interview_event_ch', NEW.stream_key);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION sse_event_notify_after_insert() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS interview_event_sse_notify ON interview_event;
CREATE TRIGGER interview_event_sse_notify
  AFTER INSERT ON interview_event
  FOR EACH ROW
  EXECUTE FUNCTION sse_event_notify_after_insert();
