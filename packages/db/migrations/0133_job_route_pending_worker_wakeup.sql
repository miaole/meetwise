-- 0133_job_route_pending_worker_wakeup.sql
--
-- R2 P-API: wake idle workers when job_semantic_revision lands at route_pending
-- (createJob / updateJob → createJobSemanticRevision). Same lossy wake-only
-- channel as 0084 queued-job triggers. Does NOT classify inline.
-- Closing P-API ≠ R2 fully closed (bind/snapshot closed-loop still needed).
-- releaseEvidence=false · Not HA · ≠ 路由已生效 · ≠ flip default · ≠ open DELETE.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

CREATE OR REPLACE FUNCTION worker_job_wakeup_after_route_pending()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'route_pending' THEN
    PERFORM pg_notify('meetwise_worker_wakeup_v1', 'wake');
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION worker_job_wakeup_after_route_pending() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS job_semantic_revision_worker_wakeup_after_route_pending ON job_semantic_revision;
CREATE TRIGGER job_semantic_revision_worker_wakeup_after_route_pending
  AFTER INSERT OR UPDATE OF status ON job_semantic_revision
  FOR EACH ROW
  WHEN (NEW.status = 'route_pending')
  EXECUTE FUNCTION worker_job_wakeup_after_route_pending();
