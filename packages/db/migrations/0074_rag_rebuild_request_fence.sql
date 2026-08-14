-- 0074_rag_rebuild_request_fence.sql
--
-- A rebuild lease is a control-plane capability only when the run was
-- created by a successfully settled `rebuild_create` request.  0032 rows
-- and manually injected rows can have a NULL or unrelated request id; they
-- must never become runnable merely because a control login can name them.

CREATE OR REPLACE FUNCTION rag_control.rag_claim_rebuild_run(p_run_id text,p_worker text,p_lease_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE claimed boolean;
BEGIN
  IF p_lease_seconds NOT BETWEEN 5 AND 3600 THEN
    RAISE EXCEPTION 'rag_rebuild_lease_invalid' USING ERRCODE='check_violation';
  END IF;
  UPDATE public.rag_rebuild_run AS run
     SET status='running',lease_owner=p_worker,lease_expires_at=clock_timestamp()+make_interval(secs=>p_lease_seconds),
         heartbeat_at=clock_timestamp(),row_version=row_version+1
   WHERE run.id=p_run_id
     AND run.status IN ('pending','running','orphaned')
     AND (run.lease_owner IS NULL OR run.lease_owner=p_worker OR run.lease_expires_at<clock_timestamp())
     AND EXISTS (
       SELECT 1 FROM public.rag_control_request AS request
        WHERE request.request_id=run.control_request_id
          AND request.operation='rebuild_create'
          AND request.outcome='succeeded'
     )
   RETURNING true INTO claimed;
  RETURN coalesce(claimed,false);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_heartbeat_rebuild_run(p_run_id text,p_worker text,p_lease_seconds integer,p_cursor jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE ok boolean;
BEGIN
  IF p_lease_seconds NOT BETWEEN 5 AND 3600 THEN
    RAISE EXCEPTION 'rag_rebuild_lease_invalid' USING ERRCODE='check_violation';
  END IF;
  UPDATE public.rag_rebuild_run AS run
     SET lease_expires_at=clock_timestamp()+make_interval(secs=>p_lease_seconds),heartbeat_at=clock_timestamp(),
         cursor=coalesce(p_cursor,'{}'::jsonb),row_version=row_version+1
   WHERE run.id=p_run_id
     AND run.status='running'
     AND run.lease_owner=p_worker
     AND run.lease_expires_at>=clock_timestamp()
     AND EXISTS (
       SELECT 1 FROM public.rag_control_request AS request
        WHERE request.request_id=run.control_request_id
          AND request.operation='rebuild_create'
          AND request.outcome='succeeded'
     )
   RETURNING true INTO ok;
  RETURN coalesce(ok,false);
END;
$$;

ALTER FUNCTION rag_control.rag_claim_rebuild_run(text,text,integer) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_heartbeat_rebuild_run(text,text,integer,jsonb) OWNER TO rag_control_definer;
REVOKE ALL ON FUNCTION rag_control.rag_claim_rebuild_run(text,text,integer),
  rag_control.rag_heartbeat_rebuild_run(text,text,integer,jsonb) FROM PUBLIC, app_role, rag_control_login, rag_runtime_definer;
GRANT EXECUTE ON FUNCTION rag_control.rag_claim_rebuild_run(text,text,integer),
  rag_control.rag_heartbeat_rebuild_run(text,text,integer,jsonb) TO rag_control_executor;
