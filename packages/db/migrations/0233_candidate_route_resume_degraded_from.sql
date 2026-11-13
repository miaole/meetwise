-- 0233_candidate_route_resume_degraded_from.sql — G6-N17 #252 P3：决策行落库简历降级来源与是否采纳 targetRole
--
-- executionMode = transactional（决策表 additive 两列，既有约束/RLS/GRANT 零改）
--
-- 背景：arbitrateCandidateRouteWithTargetRole 已计算 resumeDegradedFrom
-- （ambiguous_language_evidence / no_signal_hit）与 targetRoleApplied，但
-- supplyCandidateProfileRoute 未写入 candidate_profile_route_decision，审计无法从决策行
-- 区分「简历歧义后用 targetRole 消歧」与「简历零命中后由 targetRole 供给叶」。
-- targetRole 原文仍只存在于 interview_job.payload（及诊断表 target_role）；本迁移不把原文写入路由表。
--
-- Additive-only：新列可空（resume_degraded_from）或 DEFAULT false（target_role_applied），
-- 旧行保持可扫描。CHECK 限枚举。无 UPDATE/DELETE 语义变化。

ALTER TABLE candidate_profile_route_decision
  ADD COLUMN IF NOT EXISTS resume_degraded_from text;

ALTER TABLE candidate_profile_route_decision
  DROP CONSTRAINT IF EXISTS ck_cprd_resume_degraded_from;

ALTER TABLE candidate_profile_route_decision
  ADD CONSTRAINT ck_cprd_resume_degraded_from
    CHECK (resume_degraded_from IS NULL OR resume_degraded_from IN ('ambiguous_language_evidence', 'no_signal_hit'));

ALTER TABLE candidate_profile_route_decision
  ADD COLUMN IF NOT EXISTS target_role_applied boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN candidate_profile_route_decision.resume_degraded_from IS
  '简历 rule 降级来源（歧义/零命中）；非降级（含 general-only）为 NULL。不存 targetRole 原文。';
COMMENT ON COLUMN candidate_profile_route_decision.target_role_applied IS
  '本决策是否采纳了用户 targetRole 叶；原文仍不落本表。';
