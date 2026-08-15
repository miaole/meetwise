-- 0084_worker_job_wakeup_notifications.sql
-- A committed queued transition wakes idle workers without exposing job data.
-- NOTIFY is deliberately not a durable queue: listener reconnect/reconciliation
-- remains mandatory, while this trigger covers direct SQL and rolling writers.

CREATE OR REPLACE FUNCTION worker_job_wakeup_after_queued()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'queued' THEN
    PERFORM pg_notify('meetwise_worker_wakeup_v1', 'wake');
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION worker_job_wakeup_after_queued() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS interview_job_worker_wakeup_after_queued ON interview_job;
CREATE TRIGGER interview_job_worker_wakeup_after_queued
  AFTER INSERT OR UPDATE OF status ON interview_job
  FOR EACH ROW
  WHEN (NEW.status = 'queued')
  EXECUTE FUNCTION worker_job_wakeup_after_queued();

DROP TRIGGER IF EXISTS quiz_job_worker_wakeup_after_queued ON quiz_job;
CREATE TRIGGER quiz_job_worker_wakeup_after_queued
  AFTER INSERT OR UPDATE OF status ON quiz_job
  FOR EACH ROW
  WHEN (NEW.status = 'queued')
  EXECUTE FUNCTION worker_job_wakeup_after_queued();

DROP TRIGGER IF EXISTS diagnosis_job_worker_wakeup_after_queued ON diagnosis_job;
CREATE TRIGGER diagnosis_job_worker_wakeup_after_queued
  AFTER INSERT OR UPDATE OF status ON diagnosis_job
  FOR EACH ROW
  WHEN (NEW.status = 'queued')
  EXECUTE FUNCTION worker_job_wakeup_after_queued();

DROP TRIGGER IF EXISTS ai_report_worker_wakeup_after_queued ON ai_report;
CREATE TRIGGER ai_report_worker_wakeup_after_queued
  AFTER INSERT OR UPDATE OF status ON ai_report
  FOR EACH ROW
  WHEN (NEW.status = 'queued')
  EXECUTE FUNCTION worker_job_wakeup_after_queued();
