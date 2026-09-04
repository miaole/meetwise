-- 0128_interview_dispatch_fairness.sql
-- Interview owner enumeration stays an owner-id-only gateway function.
-- Order owners by the oldest claimable/expired-running row so a later owner
-- with older waiting work is not hidden behind insertion order. This is a
-- stable scan order, not a lock, quota, or payload channel.
-- 0124 on main is RAG retrieval ACL (0124_rag_retrieval_acl_fail_closed.sql).
-- 0125 on main is memory_vector_chunk erasure (0125_memory_vector_chunk_erasure.sql).
-- 0126 on main is interview-answer dual-write fence (0126_interview_answer_dual_write_fence.sql).
-- 0127 remains reserved by an in-flight sibling. This rewrite is 0128.

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
    ELSE
      RAISE EXCEPTION 'gateway_dispatch_unknown_work' USING ERRCODE = '22023';
  END CASE;
END;
$$;

REVOKE ALL ON FUNCTION gateway_dispatch_owners(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_dispatch_owners(text) TO app_gateway_role;
