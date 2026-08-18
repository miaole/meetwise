-- 0114_free_text_route_scope.sql
--
-- RAG-FUNNEL-07 / 自由文本自动漏斗与成本/unknown。
--
-- 把 RAG-03 的岗位意图自动路由（0104）**结构同构但 scope 隔离**地复用到自由文本
-- （专项训练目标 / 未来受限多语料请求），**不扩大权限**：
--
--   FreeTextScopeRevision (不可变语义修订，只存 digest+HMAC) -> route_pending
--     -> rule_decided -> route_decided                       (rule path, 0 model sends)
--     -> model_prepared -> result_validated -> route_decided (model path, exactly 1 send)
--     -> route_unresolved (known_not_sent | dispatched_unknown | validation_rejected)
--
-- 与 0104 的逐值同构（isomorphism）：自由文本 scope_id 对应岗位 job_id；taxonomy /
-- policy 版本、allocations 数值 backstop、attempt_outcome/reason_codes 枚举、revision
-- 状态机、event outbox 全部与 0104 一致（复用 domain 的冻结校准 + 双重校验）。
--
-- 与 0104 的**刻意差异**（这就是「不扩大权限」的落点）：
--  * 自由文本无 job_posting 父表：scope_id 是自由文本「训练目标」的不透明身份
--    （由调用方生成），revision 是该 scope 下的单调版本（max+1）。目标原文**不落库**，
--    revision 只存 canonical digest（free-text-semantic:v1）+ keyed input HMAC。
--  * **无公开读策略**：0104 的 job_route_decision 有 p_read_decided 供候选人绑定；
--    自由文本**刻意没有**——分类结果只是「建议 allowlisted track」，绝不授予读取路径。
--  * **无 binding / snapshot / plan / 检索消费链**：没有任何表 FK 引用
--    free_text_route_decision.id，结构上不可能进入 RAG-04/05 检索。route_unresolved
--    （低置信/unknown/validation_rejected）是 sticky 终态，绝不自动重发。
--  * **无 SECURITY DEFINER 函数**：状态转移全部在 packages/db/src/free-text-route-decision.ts
--    的 asPrincipal 事务内以 CAS UPDATE 表达（对齐 0104/0106/0110/0113）。
--
-- 迁移号决议：协调器锁定 0114（CTX-04=0115、MEM-03=0116 并行）。0104 以 job_id 为主键
-- 且冻结不可就地改，故自由文本必须新表。（详见 .tmp/rag07-free-text-route-pregen-gate.md）

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

-- ────────────────────────────────────────────────────────────────────────────
-- 1) FreeTextScopeRevision：自由文本训练目标的不可变语义修订。内容永不就地变更；
--    重新提交写新 revision（revision = max+1）。只 status 转移。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS free_text_scope_revision (
  scope_id text NOT NULL CHECK (char_length(scope_id) BETWEEN 1 AND 512),
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  revision bigint NOT NULL CHECK (revision >= 1),
  semantic_digest text NOT NULL CHECK (semantic_digest ~ '^[0-9a-f]{64}$'),
  input_hmac text NOT NULL CHECK (input_hmac ~ '^[0-9a-f]{64}$'),
  status text NOT NULL CHECK (status IN ('route_pending', 'rule_decided', 'model_prepared', 'result_validated', 'route_decided', 'route_unresolved')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (scope_id, revision)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2) FreeTextRouteDecision：终态事实。每 (scope_id, revision) 一行。cross-column CHECK
--    镜像 0104 的数值 backstop（复检冻结校准策略：1..4 leaf、sum=10000、each>=500、
--    confidence>=7000、margin>=1000；unresolved 则空 allocations + 至少一个 reason code）。
--    绕过 domain 校验直插非法 decision 会被 DB 拒，绝不留半合法行。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS free_text_route_decision (
  id text PRIMARY KEY,
  scope_id text NOT NULL,
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
  UNIQUE (scope_id, revision),
  FOREIGN KEY (scope_id, revision) REFERENCES free_text_scope_revision(scope_id, revision),
  CHECK (
    (route_outcome = 'route_decided'
      AND attempt_outcome IN ('rule_decided', 'result_validated')
      AND jsonb_array_length(allocations) BETWEEN 1 AND 4
      AND confidence_bps IS NOT NULL AND margin_bps IS NOT NULL
      AND cardinality(reason_codes) = 0
      -- 数值 backstop：复检冻结校准策略（与 0104 / domain JOB_ROUTE_* 常量逐值一致）。
      -- PostgreSQL CHECK 禁止子查询，故把 allocations（jsonb 数组，max-leaf=4 固定上限）
      -- 按下标 0..3 显式展开求和/求最小；缺失下标 COALESCE 到 0（求和）或 500（最小）。
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

-- ────────────────────────────────────────────────────────────────────────────
-- 3) FreeTextRouteEvent：单 owner 单调 append-only outbox。
--    (scope_id, revision, event_seq) 单调；event_seq 在持 revision 行锁的同一事务内分配。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS free_text_route_event (
  scope_id text NOT NULL,
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  revision bigint NOT NULL,
  event_seq bigint NOT NULL CHECK (event_seq > 0),
  decision_id text,
  from_status text,
  to_status text NOT NULL CHECK (to_status IN ('route_pending', 'rule_decided', 'model_prepared', 'result_validated', 'route_decided', 'route_unresolved')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (scope_id, revision, event_seq)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Grants + RLS。三张表全部 owner 拥有（FORCE owner=principal）。**无公开读策略**：
-- 与 0104 的 job_route_decision p_read_decided 刻意不同——自由文本决策只是「建议
-- allowlisted track」，任何非 owner 都读不到（绝不授予读路径）。无 role 提升写路径。
-- ────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON free_text_scope_revision FROM PUBLIC;
REVOKE ALL ON free_text_route_decision FROM PUBLIC;
REVOKE ALL ON free_text_route_event FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE ON free_text_scope_revision TO app_role;
GRANT SELECT, INSERT ON free_text_route_decision TO app_role;
GRANT SELECT, INSERT ON free_text_route_event TO app_role;

ALTER TABLE free_text_scope_revision ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_text_scope_revision FORCE ROW LEVEL SECURITY;
ALTER TABLE free_text_route_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_text_route_decision FORCE ROW LEVEL SECURITY;
ALTER TABLE free_text_route_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_text_route_event FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_free_text_scope_revision_owner ON free_text_scope_revision;
CREATE POLICY p_free_text_scope_revision_owner ON free_text_scope_revision
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

DROP POLICY IF EXISTS p_free_text_route_decision_owner ON free_text_route_decision;
CREATE POLICY p_free_text_route_decision_owner ON free_text_route_decision
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

DROP POLICY IF EXISTS p_free_text_route_event_owner ON free_text_route_event;
CREATE POLICY p_free_text_route_event_owner ON free_text_route_event
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
