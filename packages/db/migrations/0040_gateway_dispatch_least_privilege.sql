-- 0040_gateway_dispatch_least_privilege.sql
-- Cross-owner scheduling cannot require a runtime login with SUPERUSER or
-- BYPASSRLS. app_gateway_role has no table privileges; it can execute only the
-- fixed function below and receives owner ids, never queue payloads/business rows.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_gateway_role') THEN
    CREATE ROLE app_gateway_role NOLOGIN;
  END IF;
END $$;

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
        SELECT DISTINCT j.owner_user_id::text
        FROM public.interview_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp());
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
    ELSE
      RAISE EXCEPTION 'gateway_dispatch_unknown_work' USING ERRCODE = '22023';
  END CASE;
END;
$$;

REVOKE ALL ON FUNCTION gateway_dispatch_owners(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_dispatch_owners(text) TO app_gateway_role;
