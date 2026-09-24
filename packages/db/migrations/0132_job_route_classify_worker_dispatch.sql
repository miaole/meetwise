-- 0132_job_route_classify_worker_dispatch.sql
--
-- R2 P-WORKER: sole classify Worker drain of job_semantic_revision.route_pending.
-- Extends gateway_dispatch_owners with work='job_route' (owner-id only) and adds
-- a partial index for pending revisions. Does NOT close R2 (P-API still open).
-- Not HA · releaseEvidence=false · ≠ 路由已生效 · ≠ flip default · ≠ open DELETE.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

CREATE INDEX IF NOT EXISTS ix_job_semantic_revision_route_pending
  ON job_semantic_revision(owner_user_id, created_at ASC, revision ASC)
  WHERE status = 'route_pending';

CREATE OR REPLACE FUNCTION gateway_dispatch_owners(p_work text)
RETURNS TABLE(owner_user_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  CASE p_work
    WHEN 'interview' THEN
      RETURN QUERY
        SELECT j.owner_user_id::text
        FROM public.interview_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp())
        GROUP BY j.owner_user_id
        ORDER BY min(j.created_at) ASC, j.owner_user_id ASC;
    WHEN 'quiz' THEN
      RETURN QUERY
        SELECT DISTINCT j.owner_user_id::text
        FROM public.quiz_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp());
    WHEN 'diagnosis' THEN
      RETURN QUERY
        SELECT DISTINCT j.owner_user_id::text
        FROM public.diagnosis_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp());
    WHEN 'report' THEN
      RETURN QUERY
        SELECT DISTINCT r.owner_user_id::text
        FROM public.ai_report AS r
        WHERE r.status IN ('queued','failed') OR (r.status='running' AND r.lease_expires_at < clock_timestamp());
    WHEN 'commerce' THEN
      RETURN QUERY
        SELECT c.owner_user_id::text
        FROM public.entitlement_consumption AS c
        WHERE c.status='reserved' AND c.lease_expires_at < clock_timestamp()
      UNION
        SELECT o.owner_user_id::text
        FROM public.commerce_outbox AS o
        WHERE o.status='pending';
    WHEN 'job_route' THEN
      RETURN QUERY
        SELECT r.owner_user_id::text
        FROM public.job_semantic_revision AS r
        WHERE r.status = 'route_pending'
        GROUP BY r.owner_user_id
        ORDER BY r.owner_user_id ASC;
    ELSE
      RAISE EXCEPTION 'gateway_dispatch_unknown_work' USING ERRCODE = '22023';
  END CASE;
END;
$$;

REVOKE ALL ON FUNCTION gateway_dispatch_owners(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_dispatch_owners(text) TO app_gateway_role;
