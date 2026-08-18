-- 0104_job_route_decision.sql
--
-- RAG-FUNNEL-03 / ROUTE-01: automatic job intent routing.  Replaces the worker's
-- hardcoded `技术岗` with a persisted, state-machine-guarded route decision:
--
--   JobSemanticRevision (immutable content revision) -> route_pending
--     -> rule_decided -> route_decided                       (rule path, 0 model sends)
--     -> model_prepared -> result_validated -> route_decided (model path, exactly 1 send)
--     -> route_unresolved (known_not_sent | dispatched_unknown | validation_rejected)
--   route_decided -> application_bound -> interview_snapshotted (consumption, irreversible)
--
-- Design rules encoded here:
--  * The revision stores ONLY a canonical digest (SHA-256 of title/description/
--    competencies) + a keyed input HMAC.  trackId/weight/confidence/override are
--    structurally incapable of being user-submitted: there is no column for them.
--  * A decided decision's allocations sum to exactly 10000 basis points; the
--    count (max 4 leaves)/min-weight (>=500 bps)/confidence (>=7000 bps)/
--    margin (>=1000 bps) limits are the frozen calibration policy enforced in
--    packages/domain/src/job-route-classifier.ts AND re-checked numerically by the
--    single cross-column CHECK below (jsonb_array_elements sum/min + scalar
--    thresholds), so a partial UPDATE or a direct INSERT that bypasses the domain
--    validator can never leave a half-legal row.
--  * The route decision is recruiter-owned with a public-read policy limited to
--    route_outcome='route_decided' (single-table predicate) so a candidate can read
--    the decided allocation to bind it, mirroring job_posting's p_read status='open'.
--    The binding/snapshot are candidate-owned immutable copies, so a later job edit
--    (a new revision) can never rewrite an old application/interview route.
--  * route transitions are audited in job_route_event keyed (job_id, revision,
--    event_seq); candidate-side consumption (binding + snapshot) in
--    route_consumption_event keyed (candidate_user_id, event_seq).  Each stream has
--    a single owner, so the monotonic MAX+1 append never reads across owners.
--
-- No SECURITY DEFINER function is introduced here: all transition logic lives in
-- packages/db/src/job-route-decision.ts under asPrincipal.  This keeps principal.ts's
-- sealed manifest and the handoff-closure proof untouched.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

-- ────────────────────────────────────────────────────────────────────────────
-- 1) Immutable semantic revision of a job.  Content never changes in place; an
--    edit writes a new revision (revision = max+1).  Only the status transitions.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_semantic_revision (
  job_id text NOT NULL,
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  revision bigint NOT NULL CHECK (revision >= 1),
  semantic_digest text NOT NULL CHECK (semantic_digest ~ '^[0-9a-f]{64}$'),
  input_hmac text NOT NULL CHECK (input_hmac ~ '^[0-9a-f]{64}$'),
  status text NOT NULL CHECK (status IN ('route_pending', 'rule_decided', 'model_prepared', 'result_validated', 'route_decided', 'route_unresolved')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (job_id, revision)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2) The route decision (terminal fact).  One per (job_id, revision).  The
--    cross-column CHECK mirrors the frozen calibration policy: a decided row
--    carries 1..4 allocations summing to 10000 bps (each >= 500 bps) plus
--    confidence >= 7000 and margin >= 1000, and no reason codes; an unresolved
--    row carries empty allocations, no confidence/margin, and at least one
--    reason code.  The numeric thresholds are re-checked here — not just the
--    jsonb array shape — as a DB backstop behind the domain validator.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_route_decision (
  id text PRIMARY KEY,
  job_id text NOT NULL,
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  revision bigint NOT NULL,
  route_outcome text NOT NULL CHECK (route_outcome IN ('route_decided', 'route_unresolved')),
  attempt_outcome text NOT NULL CHECK (attempt_outcome IN ('rule_decided', 'result_validated', 'known_not_sent', 'dispatched_unknown', 'validation_rejected')),
  taxonomy_version text NOT NULL CHECK (taxonomy_version ~ '^v[1-9][0-9]{0,15}$'),
  policy_version text NOT NULL CHECK (char_length(policy_version) BETWEEN 1 AND 64),
  allocations jsonb NOT NULL CHECK (jsonb_typeof(allocations) = 'array'),
  confidence_bps integer CHECK (confidence_bps BETWEEN 0 AND 10000),
  margin_bps integer CHECK (margin_bps BETWEEN 0 AND 10000),
  reason_codes text[] NOT NULL DEFAULT '{}',
  decision_hash text NOT NULL CHECK (decision_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (job_id, revision),
  FOREIGN KEY (job_id, revision) REFERENCES job_semantic_revision(job_id, revision),
  CHECK (
    (route_outcome = 'route_decided'
      AND attempt_outcome IN ('rule_decided', 'result_validated')
      AND jsonb_array_length(allocations) BETWEEN 1 AND 4
      AND confidence_bps IS NOT NULL AND margin_bps IS NOT NULL
      AND cardinality(reason_codes) = 0
      -- 数值 backstop：复检冻结校准策略（与 domain JOB_ROUTE_* 常量一致）。任一不符整行被拒，
      -- 绝不半合法落库。唯一写路径两分支都先过 domain 校验，此处是纵深防御，不是 domain 的替代。
      -- PostgreSQL CHECK 禁止子查询，故把 allocations（jsonb 数组，max-leaf=4 固定上限）按下标
      -- 0..3 显式展开求和/求最小：缺失下标 COALESCE 到 0（求和）或 500（最小）；非整数
      -- allocationBps 的 ::integer 转换会抛错 → 整行被拒，天然 fail-closed。
      AND confidence_bps >= 7000
      AND margin_bps >= 1000
      AND (
        COALESCE((allocations->0->>'allocationBps')::integer, 0)
        + COALESCE((allocations->1->>'allocationBps')::integer, 0)
        + COALESCE((allocations->2->>'allocationBps')::integer, 0)
        + COALESCE((allocations->3->>'allocationBps')::integer, 0)
      ) = 10000
      AND COALESCE((allocations->0->>'allocationBps')::integer, 500) >= 500
      AND COALESCE((allocations->1->>'allocationBps')::integer, 500) >= 500
      AND COALESCE((allocations->2->>'allocationBps')::integer, 500) >= 500
      AND COALESCE((allocations->3->>'allocationBps')::integer, 500) >= 500)
    OR
    (route_outcome = 'route_unresolved'
      AND attempt_outcome IN ('known_not_sent', 'dispatched_unknown', 'validation_rejected')
      AND jsonb_array_length(allocations) = 0
      AND confidence_bps IS NULL AND margin_bps IS NULL
      AND cardinality(reason_codes) >= 1)
  )
);

-- Binding reads "the latest decided revision" for a job: keep that hot path cheap.
CREATE INDEX IF NOT EXISTS ix_job_route_decision_decided
  ON job_route_decision(job_id, revision DESC) WHERE route_outcome = 'route_decided';

-- ────────────────────────────────────────────────────────────────────────────
-- 3) Route transition outbox (recruiter-owned, append-only).  (job_id, revision,
--    event_seq) is monotonic per revision; event_seq is allocated under the same
--    transaction that holds the revision row lock.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_route_event (
  job_id text NOT NULL,
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  revision bigint NOT NULL,
  event_seq bigint NOT NULL CHECK (event_seq > 0),
  decision_id text,
  from_status text,
  to_status text NOT NULL CHECK (to_status IN ('route_pending', 'rule_decided', 'model_prepared', 'result_validated', 'route_decided', 'route_unresolved')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (job_id, revision, event_seq)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 4) ApplicationRouteBinding: an application/invite binds ONLY the latest
--    route_decided version.  Immutable (no UPDATE grant).  allocations is a copy
--    of the decision's allocations so a later revision can never leak back in.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_route_binding (
  application_id text PRIMARY KEY,
  candidate_user_id text NOT NULL CHECK (char_length(candidate_user_id) BETWEEN 1 AND 512),
  recruiter_user_id text NOT NULL CHECK (char_length(recruiter_user_id) BETWEEN 1 AND 512),
  job_id text NOT NULL,
  revision bigint NOT NULL,
  decision_id text NOT NULL,
  route_digest text NOT NULL CHECK (route_digest ~ '^[0-9a-f]{64}$'),
  allocations jsonb NOT NULL CHECK (jsonb_typeof(allocations) = 'array' AND jsonb_array_length(allocations) BETWEEN 1 AND 4),
  status text NOT NULL CHECK (status = 'application_bound'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (job_id, revision) REFERENCES job_semantic_revision(job_id, revision),
  FOREIGN KEY (decision_id) REFERENCES job_route_decision(id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 5) InterviewRouteSnapshot: the interview-start transaction copies the binding
--    into this immutable snapshot.  The in-graph planner may only choose leaves
--    from this snapshot.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_route_snapshot (
  interview_id text PRIMARY KEY,
  candidate_user_id text NOT NULL CHECK (char_length(candidate_user_id) BETWEEN 1 AND 512),
  application_id text NOT NULL,
  job_id text NOT NULL,
  revision bigint NOT NULL,
  decision_id text NOT NULL,
  route_digest text NOT NULL CHECK (route_digest ~ '^[0-9a-f]{64}$'),
  allocations jsonb NOT NULL CHECK (jsonb_typeof(allocations) = 'array' AND jsonb_array_length(allocations) BETWEEN 1 AND 4),
  status text NOT NULL CHECK (status = 'interview_snapshotted'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (application_id) REFERENCES application_route_binding(application_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 6) Candidate-side consumption outbox (binding + snapshot transitions).  Single
--    owner (the candidate) per stream, so the monotonic event_seq is safe.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_consumption_event (
  candidate_user_id text NOT NULL CHECK (char_length(candidate_user_id) BETWEEN 1 AND 512),
  event_seq bigint NOT NULL CHECK (event_seq > 0),
  kind text NOT NULL CHECK (kind IN ('binding', 'snapshot')),
  job_id text NOT NULL,
  revision bigint NOT NULL,
  application_id text,
  interview_id text,
  from_status text NOT NULL,
  to_status text NOT NULL CHECK (to_status IN ('application_bound', 'interview_snapshotted')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (candidate_user_id, event_seq)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Grants + RLS.  All state is owned by a principal (recruiter for route facts,
-- candidate for consumption facts); app_role gets principal-scoped access and
-- never a role-elevating write path.
-- ────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON job_semantic_revision FROM PUBLIC;
REVOKE ALL ON job_route_decision FROM PUBLIC;
REVOKE ALL ON job_route_event FROM PUBLIC;
REVOKE ALL ON application_route_binding FROM PUBLIC;
REVOKE ALL ON interview_route_snapshot FROM PUBLIC;
REVOKE ALL ON route_consumption_event FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE ON job_semantic_revision TO app_role;
GRANT SELECT, INSERT ON job_route_decision TO app_role;
GRANT SELECT, INSERT ON job_route_event TO app_role;
GRANT SELECT, INSERT ON application_route_binding TO app_role;
GRANT SELECT, INSERT ON interview_route_snapshot TO app_role;
GRANT SELECT, INSERT ON route_consumption_event TO app_role;

ALTER TABLE job_semantic_revision ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_semantic_revision FORCE ROW LEVEL SECURITY;
ALTER TABLE job_route_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_route_decision FORCE ROW LEVEL SECURITY;
ALTER TABLE job_route_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_route_event FORCE ROW LEVEL SECURITY;
ALTER TABLE application_route_binding ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_route_binding FORCE ROW LEVEL SECURITY;
ALTER TABLE interview_route_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_route_snapshot FORCE ROW LEVEL SECURITY;
ALTER TABLE route_consumption_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_consumption_event FORCE ROW LEVEL SECURITY;

-- revision: recruiter owner only (a candidate never needs to read the raw revision).
DROP POLICY IF EXISTS p_job_semantic_revision_owner ON job_semantic_revision;
CREATE POLICY p_job_semantic_revision_owner ON job_semantic_revision
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- decision: recruiter owner full access + public (app_role) read of decided routes only.
-- Deliberately a single-table predicate: a cross-table RLS subquery on job_posting would
-- risk PostgreSQL's parent-child RLS infinite-recursion footgun.
DROP POLICY IF EXISTS p_job_route_decision_owner ON job_route_decision;
CREATE POLICY p_job_route_decision_owner ON job_route_decision
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS p_job_route_decision_read_decided ON job_route_decision;
CREATE POLICY p_job_route_decision_read_decided ON job_route_decision
  FOR SELECT TO app_role USING (route_outcome = 'route_decided');

-- route event: recruiter owner only (append-only audit).
DROP POLICY IF EXISTS p_job_route_event_owner ON job_route_event;
CREATE POLICY p_job_route_event_owner ON job_route_event
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- binding: candidate/recruiter party read; candidate self insert; recruiter insert only for
-- their own job's application (mirrors job_application's multi-party RLS).  No UPDATE/DELETE.
DROP POLICY IF EXISTS p_application_route_binding_read ON application_route_binding;
CREATE POLICY p_application_route_binding_read ON application_route_binding
  FOR SELECT TO app_role
  USING (candidate_user_id = current_setting('app.principal_user', true)
      OR recruiter_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS p_application_route_binding_candidate_insert ON application_route_binding;
CREATE POLICY p_application_route_binding_candidate_insert ON application_route_binding
  FOR INSERT TO app_role WITH CHECK (candidate_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS p_application_route_binding_recruiter_insert ON application_route_binding;
CREATE POLICY p_application_route_binding_recruiter_insert ON application_route_binding
  FOR INSERT TO app_role WITH CHECK (
    recruiter_user_id = current_setting('app.principal_user', true)
    AND EXISTS (SELECT 1 FROM job_posting j WHERE j.id = job_id AND j.owner_user_id = current_setting('app.principal_user', true))
  );

-- snapshot: candidate owner only (immutable copy at interview start).
DROP POLICY IF EXISTS p_interview_route_snapshot_owner ON interview_route_snapshot;
CREATE POLICY p_interview_route_snapshot_owner ON interview_route_snapshot
  FOR ALL TO app_role
  USING (candidate_user_id = current_setting('app.principal_user', true))
  WITH CHECK (candidate_user_id = current_setting('app.principal_user', true));

-- consumption event: candidate owner only (candidate-side binding + snapshot audit).
DROP POLICY IF EXISTS p_route_consumption_event_owner ON route_consumption_event;
CREATE POLICY p_route_consumption_event_owner ON route_consumption_event
  FOR ALL TO app_role
  USING (candidate_user_id = current_setting('app.principal_user', true))
  WITH CHECK (candidate_user_id = current_setting('app.principal_user', true));
