-- G7S — candidate-profile-derived interview track route（通用 begin 供给面收口）。
--
-- 背景（REQUEST 77989c49 · pre-exec dual BOTH PASS d43787e0 + 83b90a3d · C-HA-1/C-MO-S1/S2 落字）：
-- 通用 begin 面创建的 interview 结构性无 application/job 祖先（interview.service create() 裸壳 +
-- begin() 零 snapshot 写），worker start job 的 fail-closed 角色门（adaptive-role-resolve，默认 ON）
-- 因 snapshot 缺行必抛 adaptive_role_route_missing。本迁移 additive-only 新增**候选人面独立结构**：
-- begin 事务内以候选人本人简历（candidate-profile-derived 能力语义）同步落 route decision +
-- snapshot，供给先于扣额/入队；无决策/歧义 → begin 409 candidate_route_undecided（拒因前移，
-- 门语义零弱化——worker 门零改动，缺行/缺叶仍拒）。
--
-- Additive-only 铁律（C-MO-S2）：0104 job 维度既有表（job_route_decision/job_semantic_revision/
-- application_route_binding/interview_route_snapshot/route_consumption_event）零触碰零放宽；
-- 本迁移 Ban 伪造 binding/decision 行 = masking；Ban 共享表原位放宽。决策引用必须指向真实新
-- decision 行（FK 限新结构域内）。等价完整性姿态：REVOKE PUBLIC + 最小 GRANT + RLS ENABLE+FORCE
-- + owner policy（镜像 0104）+ sha256 digest CHECK + 叶语法 CHECK + bps 恰 10000 + 单值 status。
-- releaseEvidence=false · Not HA · ≠ R4 closed · ≠ R1。

-- ────────────────────────────────────────────────────────────────────────────
-- 1) CandidateProfileRouteDecision：候选人简历能力语义决策（begin 事务内 rule 派生，0 次模型外发）。
--    route_outcome/attempt_outcome 单值 CHECK：本面只有 rule_decided 一条合法路径（唯一叶才命中）；
--    allocations 恰 1 叶 @10000bps（rule 语义：0 或 ≥2 叶 → 未决，绝不落行）。
--    interview_id UNIQUE：同 interview 幂等（ON CONFLICT DO NOTHING，重放取既有行）。
--    简历原文绝不落库：只存 resume_content_sha + input_digest（均 sha256）。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_profile_route_decision (
  id text PRIMARY KEY,
  interview_id text NOT NULL CHECK (char_length(interview_id) BETWEEN 1 AND 512),
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  resume_id text NOT NULL CHECK (char_length(resume_id) BETWEEN 1 AND 512),
  resume_content_sha text NOT NULL CHECK (resume_content_sha ~ '^[0-9a-f]{64}$'),
  input_digest text NOT NULL CHECK (input_digest ~ '^[0-9a-f]{64}$'),
  taxonomy_version text NOT NULL CHECK (taxonomy_version ~ '^v[1-9][0-9]{0,15}$'),
  policy_version text NOT NULL CHECK (char_length(policy_version) BETWEEN 1 AND 64),
  route_outcome text NOT NULL CHECK (route_outcome = 'route_decided'),
  attempt_outcome text NOT NULL CHECK (attempt_outcome = 'rule_decided'),
  leaf_track_id text NOT NULL CHECK (leaf_track_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'),
  allocation_bps integer NOT NULL CHECK (allocation_bps = 10000),
  decision_hash text NOT NULL CHECK (decision_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (interview_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2) CandidateProfileRouteSnapshot：begin 启动事务的不可变副本（worker 角色门 fallback 读侧）。
--    decision_id FK 限新结构域内（必须指向真实 decision 行）；status 单值（镜像 0104
--    interview_route_snapshot 的 interview_snapshotted 单终态姿态）。无 UPDATE/DELETE 语义
--    （GRANT 只 SELECT/INSERT；ON CONFLICT DO NOTHING 幂等）。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_profile_route_snapshot (
  interview_id text PRIMARY KEY,
  candidate_user_id text NOT NULL CHECK (char_length(candidate_user_id) BETWEEN 1 AND 512),
  decision_id text NOT NULL,
  resume_content_sha text NOT NULL CHECK (resume_content_sha ~ '^[0-9a-f]{64}$'),
  input_digest text NOT NULL CHECK (input_digest ~ '^[0-9a-f]{64}$'),
  taxonomy_version text NOT NULL CHECK (taxonomy_version ~ '^v[1-9][0-9]{0,15}$'),
  leaf_track_id text NOT NULL CHECK (leaf_track_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'),
  allocation_bps integer NOT NULL CHECK (allocation_bps = 10000),
  status text NOT NULL CHECK (status = 'interview_snapshotted'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (decision_id) REFERENCES candidate_profile_route_decision(id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Grants + RLS（镜像 0104：所有状态归 principal；app_role 只拿 owner-scoped 访问，
-- 绝不给 role-elevating 写路径）。
-- ────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON candidate_profile_route_decision FROM PUBLIC;
REVOKE ALL ON candidate_profile_route_snapshot FROM PUBLIC;

GRANT SELECT, INSERT ON candidate_profile_route_decision TO app_role;
GRANT SELECT, INSERT ON candidate_profile_route_snapshot TO app_role;

ALTER TABLE candidate_profile_route_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profile_route_decision FORCE ROW LEVEL SECURITY;
ALTER TABLE candidate_profile_route_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profile_route_snapshot FORCE ROW LEVEL SECURITY;

-- decision/snapshot：owner（候选人本人）only。单表谓词（镜像 0104 惯例，避免跨表 RLS 递归坑）。
DROP POLICY IF EXISTS p_candidate_profile_route_decision_owner ON candidate_profile_route_decision;
CREATE POLICY p_candidate_profile_route_decision_owner ON candidate_profile_route_decision
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

DROP POLICY IF EXISTS p_candidate_profile_route_snapshot_owner ON candidate_profile_route_snapshot;
CREATE POLICY p_candidate_profile_route_snapshot_owner ON candidate_profile_route_snapshot
  FOR ALL TO app_role
  USING (candidate_user_id = current_setting('app.principal_user', true))
  WITH CHECK (candidate_user_id = current_setting('app.principal_user', true));
