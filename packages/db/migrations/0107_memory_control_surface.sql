-- ═══════════════════════════════════════════════════════════════════════════════
-- 0107 MEM-10：记忆管理控制面命令层（management control-plane command layer）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 对齐 register:97 + UC-MEM-03（ai-docs/requirements/use-cases/memory-governance-and-recall.md）。
--
-- 本迁移交付「命令层」而非 HTTP API：**DB 服务函数 + 域类型 + 角色 + 状态机 + 审计**。
-- 接口按 spec「关联」待定，故不建 controller、不建 HTTP 契约（packages/contracts 不 touch）。
--
-- 命令面两组：
--  A. 用户命令（owner 作用域，EXECUTE app_role）：
--     ①查看来源卡片（最小卡片 + 状态，无他人主体 / 无原文）  ②确认/纠正 candidate → 新版本 +
--       CAS 旧 active → superseded/disputed，禁 UPDATE content 覆盖旧证据  ③单条撤回 → 先 fence
--       再逐 sink 删除目标  ④暂停采集（保留已确认事实，新 event 停产 candidate）  ⑤单条遗忘/
--       会话删除/删除全部  ⑥导出。
--  B. 运营命令（受控角色，无正文直读）：
--     ⑦policy/recipe 发布（冻结 manifest → 建 shadow → 验证 → CAS 切换，命令层只记录幂等命令 +
--       memory_policy_releaser 持「验证后 CAS 切换」跨 owner 能力，全程 digest-only）  ⑧受控来源
--       溯源访问（最小化 provenance 卡片、审计、无正文）  ⑨批量 reindex（复用 build/validate/switch）。
--
-- 四承重原语（复用不重实现）：
--  ① CAS：correct 的 active→contradicted（复用 0099）、deletion target 的 lease CAS、
--     switch 的 validated→active（复用 0102）——全部 from→to 条件更新 + version 自增。
--  ② principal 作用域幂等键：7 张命令表全部 UNIQUE(owner_user_id, idempotency_key) + 重放返回既有行。
--  ③ FORCE RLS owner=principal：7 张命令表 + 新增 worker/reviewer 读取面策略。
--  ④ 持久有序事件日志：复用 0093 memory_append_audit（本迁移不重写审计 outbox）。
--
-- 为何新表 memory_deletion_request/memory_deletion_target 而**不是新删除授权根**：
--  删除授权根（谁有资格删除）冻结在 0091 privacy issuer（ECDSA 签名快照 → consume → claim）+
--  0093 memory_begin_account_erasure。本迁移的 request/target 是**命令层追踪对象**（进度 + 逐 sink
--  receipt + 状态机 + 审计），物理清除复用 privacy_worker_owner 已有的 DELETE 数据面（0093:202）并
--  对 0099/0102/0105 追加最小 DELETE 读取面——不重实现授权根、不重实现签发/消费/claim。
--
-- 为何删除状态机是 pending_external/partial_failed 而非立刻 completed：
--  MEM 的 7 个 sink 里 event/summary/trace 尚无数据面（未知 locator）。物理删除完成前**绝不**伪造
--  completed：未知 locator 恒 pending_external → request 恒非 completed（诚实标注「等待人工/未来
--  系统」）；失败写目标级 reason + receipt → partial_failed。旧内容先 fence 后删除，绝不复活。
--  no-forge-completed 守卫触发器镜像 0091 assert_privacy_erasure_request_completed_guard。
--
-- 铁律：不落 PII / 全文答案 / 完整 prompt；命令表只落 digest/枚举/引用，不落 content 明文。
-- 铁律：不 commit/push、不碰密钥；rationale 注释含「为何」。

-- ── 角色兜底：memory_runtime/privacy_worker_owner 由 0093 创建；此处幂等 ─────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='memory_runtime') THEN
    CREATE ROLE memory_runtime NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='privacy_worker_owner') THEN
    CREATE ROLE privacy_worker_owner NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO memory_runtime, privacy_worker_owner;

-- ── 新角色：memory_reviewer / memory_policy_releaser（NOLOGIN NOINHERIT NOBYPASSRLS）──
-- 为何 NOLOGIN NOINHERIT：两者是「受控 seam 身份」，只能经 SECURITY DEFINER 函数的最小面调用，
-- 不能登录、不能继承 login 的权限、不能借 owner 权绕过 RLS（NOBYPASSRLS）。为何默认不可读用户
-- 正文：它们对 memory_fact_adjudication / memory_admission_record 等正文数据面**零表级授权**，
-- 只能通过本迁移授 EXECUTE 的 provenance-only / digest-only 函数间接访问。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='memory_reviewer') THEN
    CREATE ROLE memory_reviewer NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='memory_policy_releaser') THEN
    CREATE ROLE memory_policy_releaser NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO memory_reviewer, memory_policy_releaser;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 命令层追踪表（全部 FORCE RLS + owner_user_id=principal）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 采集暂停（④）：显式 status enum active/paused，非布尔汤 ───────────────────────
-- 为何按 purpose 而非全局：同意是 per-purpose（0093 memory_consent），暂停采集也必须对齐 purpose
-- 边界，才能「保留已确认事实、新 event 停产 candidate」且不误伤其它 purpose 的合法采集。
DROP TABLE IF EXISTS memory_collection_pause CASCADE;
CREATE TABLE memory_collection_pause (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('interview_prep','career','preference','self_improvement')),
  status text NOT NULL DEFAULT 'paused' CHECK (status IN ('active','paused')),
  idempotency_key text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_collection_pause_owner_purpose_uq UNIQUE (owner_user_id, purpose),
  CONSTRAINT memory_collection_pause_owner_idem_uq UNIQUE (owner_user_id, idempotency_key)
);

-- ── 纠正命令（②）：superseded/disputed 语义 + 新版本 content digest（不落 content）──
-- 为何单独成表：correct 会**插入新版本事实**，重放必须幂等（否则双写新版本）；且命令层的
-- disposition（superseded/disputed 语义）与冻结 0099 的 relationship（contradicts/user_correction）
-- 是不同层级的事实，须各自留痕。为何只存 new_content_digest 不存 content：纠正后的正文仍属用户
-- 内容，落 data fence（digest），绝不落本命令表（铁律：不落 PII/全文）。
DROP TABLE IF EXISTS memory_correction_command CASCADE;
CREATE TABLE memory_correction_command (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  fact_id uuid NOT NULL,                                -- 被纠正的旧 active 事实
  disposition text NOT NULL CHECK (disposition IN ('superseded','disputed')),
  new_fact_id uuid,                                     -- 纠正产生的新 active 事实
  new_content_digest text NOT NULL CHECK (new_content_digest ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied')),
  idempotency_key text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_correction_command_owner_idem_uq UNIQUE (owner_user_id, idempotency_key)
);

-- ── 删除请求（③⑤）：命令层追踪对象，scope=single_fact/session/account ─────────────
-- 为何 scope 是显式 enum 而非布尔：单条撤回/会话删除/删除全部是三种不同 fence 半径 + 不同 sink
-- 可解析集，布尔无法表达「会话」第三态。为何 subject_id 可空：account 范围无 subject（=principal）。
DROP TABLE IF EXISTS memory_deletion_request CASCADE;
CREATE TABLE memory_deletion_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('single_fact','session','account')),
  subject_id text,                                      -- single_fact→fact_id；session→thread_boundary；account→NULL
  status text NOT NULL DEFAULT 'fenced'
    CHECK (status IN ('fenced','purging','pending_external','partial_failed','completed')),
  idempotency_key text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_deletion_request_owner_idem_uq UNIQUE (owner_user_id, idempotency_key)
);

-- ── 删除目标（③⑤）：逐 sink 目标，UNIQUE(request_id, sink) ────────────────────────
-- 为何 status 用 pending/pending_external/leased/partial_failed/completed 五态：
--   pending=本域数据面可解析（fact/embedding/cache/snapshot，待 worker 领取）；pending_external=
--   未知 locator 或「留待 reindex 解析」的派生 sink（event/summary/trace，或 single_fact/session 的
--   embedding/cache/snapshot）；leased=worker 已领取（lease 机制）；partial_failed=失败写 reason+
--   receipt；completed=物理删除完成（带 receipt）。为何 completed 不可回退：one-way 守卫触发器。
-- 为何 receipt 是文本而非 jsonb：receipt 是外部系统的回执凭证，本层只透传 + 落库留痕，不解析。
DROP TABLE IF EXISTS memory_deletion_target CASCADE;
CREATE TABLE memory_deletion_target (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES memory_deletion_request(id) ON DELETE RESTRICT,
  owner_user_id text NOT NULL,
  sink text NOT NULL CHECK (sink IN (
    'memory_event','memory_summary','memory_fact','memory_embedding',
    'memory_cache','memory_context_snapshot','memory_trace')),
  resource_hmac text NOT NULL CHECK (resource_hmac ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','pending_external','leased','partial_failed','completed')),
  failure_reason text,                                  -- 目标级失败原因（partial_failed 必填）
  receipt text,                                         -- 外部回执 / 物理删除回执（completed 必填）
  lease_owner text,
  lease_token uuid,
  lease_expires_at timestamptz,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_deletion_target_request_sink_uq UNIQUE (request_id, sink)
);
CREATE INDEX memory_deletion_target_request_idx ON memory_deletion_target (request_id);

-- ── policy 发布命令（⑦）：幂等命令记录（build→validated→activated 的最终态）────────
-- 为何 status 用 built/validated/activated 显式枚举：发布是多段流水（冻结→构建→验证→切换），
-- 命令记录承载「已走到哪一步」的显式状态机，非布尔。为何只存 shadow_generation_id 不存 manifest
-- digest：manifest digest 由冻结 0102 表权威承载，命令表只留 generation 引用 + policy_version。
DROP TABLE IF EXISTS memory_policy_publish_command CASCADE;
CREATE TABLE memory_policy_publish_command (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  generation_key text NOT NULL,
  shadow_generation_id uuid,
  policy_version text NOT NULL,
  status text NOT NULL DEFAULT 'built' CHECK (status IN ('built','validated','activated')),
  idempotency_key text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_policy_publish_command_owner_idem_uq UNIQUE (owner_user_id, idempotency_key)
);

-- ── reindex 任务（⑨）：幂等任务记录（批量重建索引 generation）──────────────────────
DROP TABLE IF EXISTS memory_reindex_task CASCADE;
CREATE TABLE memory_reindex_task (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  shadow_generation_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  idempotency_key text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_reindex_task_owner_idem_uq UNIQUE (owner_user_id, idempotency_key)
);

-- ── 导出回执（⑥）：幂等回执记录（本层只记录回执，导出正文归 HTTP 接口待定）────────
-- 为何只存 export_digest 不存导出正文：正文是用户内容，导出动作本层只落「回执 + 摘要」留痕，
-- 不把全文复制进命令表（铁律：不落 PII/全文）。
DROP TABLE IF EXISTS memory_export_receipt CASCADE;
CREATE TABLE memory_export_receipt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  export_digest text NOT NULL CHECK (export_digest ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','completed')),
  idempotency_key text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_export_receipt_owner_idem_uq UNIQUE (owner_user_id, idempotency_key)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 表级 ACL（runtime 无原始读/写；负路径承重）+ RLS owner 隔离
-- ═══════════════════════════════════════════════════════════════════════════════
REVOKE ALL ON memory_collection_pause, memory_correction_command, memory_deletion_request,
  memory_deletion_target, memory_policy_publish_command, memory_reindex_task, memory_export_receipt
  FROM PUBLIC, app_role;
-- memory_runtime（命令层 definer 函数 owner）持有命令表读写。
GRANT SELECT, INSERT, UPDATE ON memory_collection_pause, memory_correction_command,
  memory_deletion_request, memory_policy_publish_command, memory_reindex_task, memory_export_receipt
  TO memory_runtime;
-- memory_deletion_target：memory_runtime 建 target + 读进度；privacy_worker_owner 领取/完成/失败。
GRANT SELECT, INSERT, UPDATE ON memory_deletion_target TO memory_runtime;
GRANT SELECT, UPDATE ON memory_deletion_target TO privacy_worker_owner;
-- worker 需要读 request（scope/subject/status）以判定删除半径并推进 request 状态。
GRANT SELECT, UPDATE ON memory_deletion_request TO privacy_worker_owner;


GRANT CREATE ON SCHEMA public TO privacy_guard_owner;
ALTER TABLE memory_collection_pause ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_collection_pause FORCE ROW LEVEL SECURITY;
ALTER TABLE memory_correction_command ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_correction_command FORCE ROW LEVEL SECURITY;
ALTER TABLE memory_deletion_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_deletion_request FORCE ROW LEVEL SECURITY;
ALTER TABLE memory_deletion_target ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_deletion_target FORCE ROW LEVEL SECURITY;
ALTER TABLE memory_policy_publish_command ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_policy_publish_command FORCE ROW LEVEL SECURITY;
ALTER TABLE memory_reindex_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_reindex_task FORCE ROW LEVEL SECURITY;
ALTER TABLE memory_export_receipt ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_export_receipt FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS memory_control_pause_runtime ON memory_collection_pause;
  CREATE POLICY memory_control_pause_runtime ON memory_collection_pause
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_control_correction_runtime ON memory_correction_command;
  CREATE POLICY memory_control_correction_runtime ON memory_correction_command
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_control_deletion_request_runtime ON memory_deletion_request;
  CREATE POLICY memory_control_deletion_request_runtime ON memory_deletion_request
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_control_deletion_request_worker ON memory_deletion_request;
  CREATE POLICY memory_control_deletion_request_worker ON memory_deletion_request
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_control_deletion_target_runtime ON memory_deletion_target;
  CREATE POLICY memory_control_deletion_target_runtime ON memory_deletion_target
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_control_deletion_target_worker ON memory_deletion_target;
  CREATE POLICY memory_control_deletion_target_worker ON memory_deletion_target
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_control_publish_runtime ON memory_policy_publish_command;
  CREATE POLICY memory_control_publish_runtime ON memory_policy_publish_command
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_control_reindex_runtime ON memory_reindex_task;
  CREATE POLICY memory_control_reindex_runtime ON memory_reindex_task
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_control_export_runtime ON memory_export_receipt;
  CREATE POLICY memory_control_export_runtime ON memory_export_receipt
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
END $$;

-- ── worker 物理清除所需的最小 DELETE 读取面（复用 0093 privacy_worker_owner 数据面）──
-- 为何追加这些 GRANT 而非复用 0093 已有：0093:202 只授 memory_fact/memory_context_snapshot/
-- memory_index_generation 的 DELETE；MEM-13(0099)/MEM-11(0102)/MEM-14(0105) 后新出的数据面表
-- 是命令层删除要清的对象。追加最小 SELECT+DELETE + owner=principal 策略，与 0093 同纪律
-- （worker 是 NOLOGIN NOBYPASSRLS 的执行者，只能按 principal 清本 owner 行）。
GRANT SELECT, DELETE ON memory_fact_adjudication TO privacy_worker_owner;
GRANT SELECT, DELETE ON memory_index_generation_embedding, memory_index_generation_cache_entry,
  memory_index_source_manifest, memory_index_source_manifest_item TO privacy_worker_owner;
GRANT SELECT, DELETE ON memory_recall_context_snapshot TO privacy_worker_owner;
-- session 范围解析需要读准入记录（thread_boundary→fact 集）。
GRANT SELECT ON memory_admission_record TO privacy_worker_owner;
-- 事实关系边（supersedes/contradicts）在物理删除事实后必须一并清除（否则残留 owner 关系行 =
-- 残留数据，违反「零数据丢失」删除语义）。无 FK（0099 关系表不挂外键），但删除时必须显式清。
GRANT SELECT, DELETE ON memory_fact_relationship TO privacy_worker_owner;

-- ── no-forge-completed 守卫 definer 的 principal-independent 子行可见性（镜像 0091）────
-- 为何 privacy_guard_owner 需要 USING(true) 的只读策略 + SELECT：守卫触发器是 SECURITY
-- DEFINER OWNER privacy_guard_owner，若其无策略会静默读不到 target 行（FORCE RLS），把
-- 「有 target 未完成」误判成「零 target」→ 永远 RAISE。USING(true) 是**仅限守卫角色**的
-- principal-independent 可见性（bounded to 触发器体内的 NEW.id 过滤），任何 login 都不持有
-- 该角色（NOLOGIN），故不构成直读用户内容的越权面。
GRANT SELECT ON memory_deletion_target TO privacy_guard_owner;
DROP POLICY IF EXISTS memory_deletion_target_guard_dispatch ON memory_deletion_target;
CREATE POLICY memory_deletion_target_guard_dispatch ON memory_deletion_target
  FOR SELECT TO privacy_guard_owner
  USING (true);

-- ── 账户主体存在性校验所需的 user_account 读取面（FORCE RLS + NOBYPASSRLS）──────────
-- 为何补 memory_runtime 的最小只读策略 + SELECT：memory_control_begin_deletion 是 SECURITY
-- DEFINER OWNER memory_runtime，而 user_account 在 0041 已 FORCE RLS 且只有 app_role 的 self
-- 策略——memory_runtime 无 SELECT 授权、无策略，会静默读不到行（存在性校验恒失败）。此处按
-- 0093 privacy_api_owner 同款补一条「id=principal」只读策略 + SELECT（绝不给 UPDATE/INSERT，
-- 防经此 role 伪造账户）。这是给命令层 subject 校验补的最小读取面，不是重新实现账户授权根。
GRANT SELECT ON user_account TO memory_runtime;
DROP POLICY IF EXISTS p_user_account_memory_runtime ON user_account;
CREATE POLICY p_user_account_memory_runtime ON user_account
  FOR SELECT TO memory_runtime
  USING (id = current_setting('app.principal_user', true));

DO $$
BEGIN
  DROP POLICY IF EXISTS memory_fact_adj_worker_owner ON memory_fact_adjudication;
  CREATE POLICY memory_fact_adj_worker_owner ON memory_fact_adjudication
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_gen_embedding_worker_owner ON memory_index_generation_embedding;
  CREATE POLICY memory_gen_embedding_worker_owner ON memory_index_generation_embedding
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_gen_cache_worker_owner ON memory_index_generation_cache_entry;
  CREATE POLICY memory_gen_cache_worker_owner ON memory_index_generation_cache_entry
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_manifest_worker_owner ON memory_index_source_manifest;
  CREATE POLICY memory_manifest_worker_owner ON memory_index_source_manifest
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_manifest_item_worker_owner ON memory_index_source_manifest_item;
  CREATE POLICY memory_manifest_item_worker_owner ON memory_index_source_manifest_item
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_recall_snapshot_worker_owner ON memory_recall_context_snapshot;
  CREATE POLICY memory_recall_snapshot_worker_owner ON memory_recall_context_snapshot
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_admission_worker_owner ON memory_admission_record;
  CREATE POLICY memory_admission_worker_owner ON memory_admission_record
    FOR SELECT TO privacy_worker_owner
    USING (access_principal_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_fact_relationship_worker_owner ON memory_fact_relationship;
  CREATE POLICY memory_fact_relationship_worker_owner ON memory_fact_relationship
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 状态机守卫触发器（镜像 0091，约束级第二道防线）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── no-forge-completed：request 不能在「仍有非 completed target」时置 completed ──
-- 为何 INSERT/UPDATE 双生效：直插 completed 与改态 completed 都要拦（镜像 0091 M2）。为何判定
-- 用 TG_OP 而非依赖 OLD.status：INSERT 时 OLD 未赋值。为何至少一个 target：零 target 的 completed
-- 是真空真值。为何用 ERRCODE=55000：与 0091 同码，把「伪造完成」收敛为对象不可完成错误。
CREATE OR REPLACE FUNCTION assert_memory_deletion_request_completed_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    IF NOT EXISTS (SELECT 1 FROM memory_deletion_target t WHERE t.request_id = NEW.id) THEN
      RAISE EXCEPTION 'memory_deletion_request_zero_targets' USING ERRCODE='55000';
    END IF;
    IF EXISTS (SELECT 1 FROM memory_deletion_target t
                WHERE t.request_id = NEW.id AND t.status <> 'completed') THEN
      RAISE EXCEPTION 'memory_deletion_request_incomplete_targets' USING ERRCODE='55000';
    END IF;
  END IF;
  RETURN NEW;
END $$;

ALTER FUNCTION assert_memory_deletion_request_completed_guard() OWNER TO privacy_guard_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_guard_owner;


REVOKE ALL ON FUNCTION assert_memory_deletion_request_completed_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS memory_deletion_request_completed_guard ON memory_deletion_request;
CREATE TRIGGER memory_deletion_request_completed_guard
  BEFORE INSERT OR UPDATE ON memory_deletion_request
  FOR EACH ROW EXECUTE FUNCTION assert_memory_deletion_request_completed_guard();

-- ── target status one-way：completed 不可回退（旧内容删除后不得被「回拨」复活）─────
-- 纯 OLD/NEW 判定、无表访问，故不需要 SECURITY DEFINER 或额外 GRANT。
CREATE OR REPLACE FUNCTION assert_memory_deletion_target_status_oneway() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF OLD.status = 'completed' AND NEW.status <> 'completed' THEN
    RAISE EXCEPTION 'memory_deletion_target_completed_revert_forbidden' USING ERRCODE='55000';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS memory_deletion_target_status_oneway_guard ON memory_deletion_target;
CREATE TRIGGER memory_deletion_target_status_oneway_guard
  BEFORE UPDATE ON memory_deletion_target
  FOR EACH ROW EXECUTE FUNCTION assert_memory_deletion_target_status_oneway();

-- ═══════════════════════════════════════════════════════════════════════════════
-- A. 用户命令（OWNER memory_runtime，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── ① 查看来源卡片（最小卡片：无 content、无他人主体）────────────────────────────
-- 为何不返回 content：命令层的「查看」是最小卡片（fact_key + 状态 + purpose + 来源溯源 + 数据
-- 分类），正文只在 MEM-14 hydrate 的授权读取面按需出库——此处返回 content 会绕过两段召回的水合
-- 复核。为何 LEFT JOIN admission_record：allowed_data_class 只存在于准入记录（0095），裁决事实
-- （0099）不落该列。
CREATE OR REPLACE FUNCTION memory_control_list_source_cards(p_purpose text DEFAULT NULL)
RETURNS TABLE (
  fact_id uuid, fact_key text, status text, purpose text, allowed_data_class text,
  source_type text, source_entity_id text, immutable_source_version text,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  IF p_purpose IS NOT NULL AND p_purpose NOT IN ('interview_prep','career','preference','self_improvement') THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT f.id, f.fact_key, f.status, f.purpose, r.allowed_data_class, f.source_type,
           f.source_entity_id, f.immutable_source_version, f.created_at, f.updated_at
    FROM memory_fact_adjudication f
    LEFT JOIN memory_admission_record r ON r.id = f.admission_record_id
    WHERE f.owner_user_id = principal
      AND (p_purpose IS NULL OR f.purpose = p_purpose)
    ORDER BY f.created_at DESC;
END $$;


GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER FUNCTION memory_control_list_source_cards(text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_list_source_cards(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_list_source_cards(text) TO app_role;

-- ── ① 删除进度：request + 逐 sink target（owner 作用域，可重放）───────────────────
CREATE OR REPLACE FUNCTION memory_control_deletion_progress(p_request_id uuid)
RETURNS TABLE (
  request_id uuid, request_status text, scope text, subject_id text,
  sink text, target_status text, failure_reason text, receipt text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT r.id, r.status, r.scope, r.subject_id, t.sink, t.status, t.failure_reason, t.receipt
    FROM memory_deletion_request r
    JOIN memory_deletion_target t ON t.request_id = r.id
    WHERE r.id = p_request_id AND r.owner_user_id = principal
    ORDER BY t.sink;
END $$;
ALTER FUNCTION memory_control_deletion_progress(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_deletion_progress(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_deletion_progress(uuid) TO app_role;

-- ── ② 纠正命令：correct → 新版本 + CAS 旧 active → contradicted（复用 0099）───────
-- 为何委托 0099 memory_adjudicate_correct 而非自己 UPDATE：纠正状态机冻结在 0099（active→
-- contradicted + 关系边 + advisory 锁 + partial unique 兜底），重写会复制并漂移冻结状态机，违反
-- 「四原语复用不重实现」。本命令只补命令层追踪（幂等命令 + disposition 语义 + digest 留痕）。
-- disposition→关系语义：disputed=用户纠正（contradicts/user_correction）；superseded=新版本
-- 取代旧值——冻结 correct 统一落 contradicts/user_correction，命令表另记 disposition 供审计区分
-- 「纠错」与「更新」，二者在本迭代复用同一冻结转移（诚实标注，不伪造第三种状态机）。
CREATE OR REPLACE FUNCTION memory_control_correct_fact(
  p_fact_id uuid,
  p_content text,
  p_disposition text,
  p_idempotency_key text DEFAULT NULL
)
RETURNS TABLE (command_id uuid, fact_id uuid, status text, contradicted_fact_id uuid, disposition text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_command_id uuid;
  v_new_id uuid;
  v_status text;
  v_contradicted uuid;
  v_fact_key text;
  v_digest text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_fact_id IS NULL
     OR p_content IS NULL OR length(p_content)=0
     OR p_disposition NOT IN ('superseded','disputed') THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;

  -- 幂等重放：同 principal 同幂等键返回既有命令（不双写新版本）。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT c.id INTO v_command_id FROM memory_correction_command c
     WHERE c.owner_user_id = principal AND c.idempotency_key = p_idempotency_key
     LIMIT 1;
    IF v_command_id IS NOT NULL THEN
      RETURN QUERY SELECT c.id, c.fact_id, 'applied'::text, c.new_fact_id, c.disposition, true
        FROM memory_correction_command c WHERE c.id = v_command_id;
      RETURN;
    END IF;
  END IF;

  v_digest := encode(digest(p_content, 'sha256'), 'hex');

  -- 复用冻结 0099 纠正（active→contradicted + 插入新 active）。空结果 = 非 active / 陈旧落败。
  SELECT c.id, c.status, c.contradicted_fact_id, c.fact_key
    INTO v_new_id, v_status, v_contradicted, v_fact_key
    FROM memory_adjudicate_correct(p_fact_id, p_content, NULL, p_idempotency_key) c;
  IF v_new_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO memory_correction_command (owner_user_id, fact_id, disposition, new_fact_id,
    new_content_digest, status, idempotency_key)
  VALUES (principal, p_fact_id, p_disposition, v_new_id, v_digest, 'applied', p_idempotency_key)
  RETURNING memory_correction_command.id INTO v_command_id;

  PERFORM memory_append_audit('memcontrol:correct:'||p_fact_id, 'correct',
    jsonb_build_object('command_id', v_command_id, 'fact_id', p_fact_id, 'new_fact_id', v_new_id,
      'disposition', p_disposition, 'contradicted_fact_id', v_contradicted),
    'correct:'||v_command_id);

  RETURN QUERY SELECT v_command_id, v_new_id, v_status, v_contradicted, p_disposition, false;
EXCEPTION WHEN unique_violation THEN
  IF p_idempotency_key IS NOT NULL THEN
    RETURN QUERY SELECT c.id, c.fact_id, 'applied'::text, c.new_fact_id, c.disposition, true
      FROM memory_correction_command c
     WHERE c.owner_user_id = principal AND c.idempotency_key = p_idempotency_key;
    RETURN;
  END IF;
  RAISE;
END $$;
ALTER FUNCTION memory_control_correct_fact(uuid,text,text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_correct_fact(uuid,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_correct_fact(uuid,text,text,text) TO app_role;

-- ── 删除目标枚举 helper（内部，不授 app_role）：按 scope 决定每个 sink 的初始状态 ──────
-- 为何「可解析 sink」按 scope 区分：single_fact/session 的派生 sink（embedding/cache/snapshot）
-- 引用该 fact 的方式是「经 generation」，撤回已 fence 该 generation（recall=0），但物理清除这些
-- 派生行属于 reindex 操作而非删除操作 → 标 pending_external（诚实：等待 reindex）。account 范围
-- 全量删除，四个数据面 sink 都可解析 → pending。event/summary/trace 无数据面 → 恒 pending_external。
CREATE OR REPLACE FUNCTION memory_control_enumerate_deletion_targets(p_request uuid, p_owner text, p_scope text, p_idem text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  sink_name text;
  v_status text;
BEGIN
  FOREACH sink_name IN ARRAY ARRAY[
    'memory_event','memory_summary','memory_fact','memory_embedding',
    'memory_cache','memory_context_snapshot','memory_trace'] LOOP
    -- account：fact/embedding/cache/snapshot 可解析；event/summary/trace 未知 locator。
    -- single_fact/session：仅 fact 可解析（其余派生 sink 留待 reindex / 未来系统）。
    v_status := CASE
      WHEN sink_name = 'memory_fact' THEN 'pending'
      WHEN sink_name IN ('memory_embedding','memory_cache','memory_context_snapshot') AND p_scope = 'account' THEN 'pending'
      ELSE 'pending_external'
    END;
    INSERT INTO memory_deletion_target (request_id, owner_user_id, sink, resource_hmac, status)
    VALUES (p_request, p_owner, sink_name,
      encode(hmac(p_owner || ':' || sink_name || ':' || p_request::text, p_idem, 'sha256'), 'hex'),
      v_status);
  END LOOP;
END $$;
ALTER FUNCTION memory_control_enumerate_deletion_targets(uuid,text,text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_enumerate_deletion_targets(uuid,text,text,text) FROM PUBLIC;

-- ── ③ 单条撤回：先 fence（revoke + fence generations）再建删除 request/target ───────
-- 为何「先 fence 再删除」：撤回必须立即停止召回（recall=0）——fence 走 0099 revoke + 0102 触发器
-- 原子生效；物理删除（本 request/target）随后由 worker 异步推进。二者分属「即时正确性」与
-- 「最终一致性」，不能合并成一个 DELETE。为何 fence 显式再调 memory_fence_generations_for_facts：
-- 0102 触发器已覆盖 fact-leave-active→fence generation，但显式再调是幂等的双保险（status<>'fenced'
-- 守卫），保证「撤回单条 → 引用它的 generation/cache 一定失效」这一承重不依赖触发器细节。
CREATE OR REPLACE FUNCTION memory_control_withdraw_fact(p_fact_id uuid, p_idempotency_key text DEFAULT NULL)
RETURNS TABLE (request_id uuid, request_status text, sink text, target_status text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_request uuid;
  v_existing uuid;
  v_revoked uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_fact_id IS NULL THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT r.id INTO v_existing FROM memory_deletion_request r
     WHERE r.owner_user_id = principal AND r.idempotency_key = p_idempotency_key
     LIMIT 1;
    IF v_existing IS NOT NULL THEN
      RETURN QUERY
        SELECT r.id, r.status, t.sink, t.status, true
        FROM memory_deletion_request r
        JOIN memory_deletion_target t ON t.request_id = r.id
        WHERE r.id = v_existing ORDER BY t.sink;
      RETURN;
    END IF;
  END IF;

  -- fence 先行（复用 0099 revoke；空结果 = 非 active，仍继续枚举 target 以幂等）。
  SELECT r.id INTO v_revoked FROM memory_adjudicate_revoke(p_fact_id) r;
  -- 双保险 fence：引用该 fact 的 generation + cache 同步失效（幂等）。
  PERFORM memory_fence_generations_for_facts(ARRAY[p_fact_id]);

  INSERT INTO memory_deletion_request (owner_user_id, scope, subject_id, status, idempotency_key)
  VALUES (principal, 'single_fact', p_fact_id::text, 'fenced', p_idempotency_key)
  RETURNING memory_deletion_request.id INTO v_request;

  PERFORM memory_control_enumerate_deletion_targets(v_request, principal, 'single_fact', COALESCE(p_idempotency_key, v_request::text));

  PERFORM memory_append_audit('memcontrol:deletion:'||v_request, 'withdraw_fact',
    jsonb_build_object('fact_id', p_fact_id, 'request_id', v_request, 'revoked', v_revoked IS NOT NULL),
    'withdraw:'||v_request);

  SELECT r.status INTO v_status FROM memory_deletion_request r WHERE r.id = v_request;
  RETURN QUERY
    SELECT r.id, v_status, t.sink, t.status, false
    FROM memory_deletion_target t
    JOIN memory_deletion_request r ON r.id = t.request_id
    WHERE t.request_id = v_request ORDER BY t.sink;
END $$;
ALTER FUNCTION memory_control_withdraw_fact(uuid,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_withdraw_fact(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_withdraw_fact(uuid,text) TO app_role;

-- ── ⑤ 会话删除 / 删除全部（scope=session/account；single_fact 走 withdraw）─────────
-- 为何 session/account 的 fence 半径是「全部 active 事实」：会话删除=撤该会话边界内的事实，
-- 删除全部=撤全部。为何 fence 用 revoke 逐条（而非一条 SQL UPDATE）：revoke 触发 0102 的
-- fence-generation 触发器，原子保证派生索引同步失效；绕过触发器直接 UPDATE status 会漏 fence。
CREATE OR REPLACE FUNCTION memory_control_begin_deletion(
  p_scope text,
  p_subject_id text,
  p_idempotency_key text
)
RETURNS TABLE (request_id uuid, request_status text, sink text, target_status text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_request uuid;
  v_existing uuid;
  v_status text;
  f record;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_scope NOT IN ('session','account')
     OR p_idempotency_key IS NULL OR length(p_idempotency_key)=0 THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  IF p_scope = 'session' AND (p_subject_id IS NULL OR length(p_subject_id)=0) THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM user_account ua WHERE ua.id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_control_account_not_found' USING ERRCODE='42501';
  END IF;

  SELECT r.id INTO v_existing FROM memory_deletion_request r
   WHERE r.owner_user_id = principal AND r.idempotency_key = p_idempotency_key
   LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN QUERY
      SELECT r.id, r.status, t.sink, t.status, true
      FROM memory_deletion_request r
      JOIN memory_deletion_target t ON t.request_id = r.id
      WHERE r.id = v_existing ORDER BY t.sink;
    RETURN;
  END IF;

  -- fence 先行：撤回本 owner 范围内全部 active 事实（逐条触发 0102 触发器 fence generation）。
  FOR f IN
    SELECT fa.id FROM memory_fact_adjudication fa
    WHERE fa.owner_user_id = principal AND fa.status = 'active'
      AND (p_scope = 'account' OR fa.admission_record_id IN (
            SELECT a.id FROM memory_admission_record a
            WHERE a.access_principal_user_id = principal AND a.thread_boundary = p_subject_id))
  LOOP
    PERFORM memory_adjudicate_revoke(f.id);
    PERFORM memory_fence_generations_for_facts(ARRAY[f.id]);
  END LOOP;

  INSERT INTO memory_deletion_request (owner_user_id, scope, subject_id, status, idempotency_key)
  VALUES (principal, p_scope, p_subject_id, 'fenced', p_idempotency_key)
  RETURNING memory_deletion_request.id INTO v_request;

  PERFORM memory_control_enumerate_deletion_targets(v_request, principal, p_scope, p_idempotency_key);

  PERFORM memory_append_audit('memcontrol:deletion:'||v_request, 'begin_deletion',
    jsonb_build_object('scope', p_scope, 'subject_id', p_subject_id, 'request_id', v_request),
    'begin_deletion:'||v_request);

  SELECT r.status INTO v_status FROM memory_deletion_request r WHERE r.id = v_request;
  RETURN QUERY
    SELECT r.id, v_status, t.sink, t.status, false
    FROM memory_deletion_target t
    JOIN memory_deletion_request r ON r.id = t.request_id
    WHERE t.request_id = v_request ORDER BY t.sink;
END $$;
ALTER FUNCTION memory_control_begin_deletion(text,text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_begin_deletion(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_begin_deletion(text,text,text) TO app_role;

-- ── ④ 暂停采集（active↔paused，显式 enum）────────────────────────────────────────
-- 为何暂停只落状态不删事实：暂停是「停止新 candidate 生产」，已确认事实保留（spec ④）。为何
-- idempotency_key 可选：暂停/恢复按 (owner,purpose) 唯一即可，幂等键用于调用方防重（重复暂停幂等）。
CREATE OR REPLACE FUNCTION memory_control_pause_collection(p_purpose text, p_idempotency_key text DEFAULT NULL)
RETURNS TABLE (id uuid, purpose text, status text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
-- 为何 use_column：RETURNS TABLE 的 OUT 列名（id/purpose/status）与表列同名，ON CONFLICT 目标
-- 里的裸列名会被 PL/pgSQL 误当成 OUT 变量 → ambiguous。use_column 令歧义处取表列，非歧义处
-- （principal/p_purpose/p_idempotency_key 无同名列）仍取变量。
#variable_conflict use_column
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement') THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  IF p_idempotency_key IS NOT NULL THEN
    SELECT p.id INTO v_id FROM memory_collection_pause p
     WHERE p.owner_user_id = principal AND p.idempotency_key = p_idempotency_key
     LIMIT 1;
    IF v_id IS NOT NULL THEN
      RETURN QUERY SELECT p.id, p.purpose, p.status, true FROM memory_collection_pause p WHERE p.id = v_id;
      RETURN;
    END IF;
  END IF;
  INSERT INTO memory_collection_pause AS p (owner_user_id, purpose, status, idempotency_key)
  VALUES (principal, p_purpose, 'paused', p_idempotency_key)
  ON CONFLICT (owner_user_id, purpose) DO UPDATE
    SET status='paused', updated_at=now(), version=p.version+1
  RETURNING p.id, p.purpose, p.status INTO v_id, p_purpose, v_status;
  PERFORM memory_append_audit('memcontrol:pause:'||p_purpose, 'pause_collection',
    jsonb_build_object('purpose', p_purpose), 'pause:'||v_id);
  RETURN QUERY SELECT v_id, p_purpose, v_status, false;
END $$;
ALTER FUNCTION memory_control_pause_collection(text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_pause_collection(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_pause_collection(text,text) TO app_role;

CREATE OR REPLACE FUNCTION memory_control_resume_collection(p_purpose text, p_idempotency_key text DEFAULT NULL)
RETURNS TABLE (id uuid, purpose text, status text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
#variable_conflict use_column
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement') THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  IF p_idempotency_key IS NOT NULL THEN
    SELECT p.id INTO v_id FROM memory_collection_pause p
     WHERE p.owner_user_id = principal AND p.idempotency_key = p_idempotency_key
     LIMIT 1;
    IF v_id IS NOT NULL THEN
      RETURN QUERY SELECT p.id, p.purpose, p.status, true FROM memory_collection_pause p WHERE p.id = v_id;
      RETURN;
    END IF;
  END IF;
  INSERT INTO memory_collection_pause AS p (owner_user_id, purpose, status, idempotency_key)
  VALUES (principal, p_purpose, 'active', p_idempotency_key)
  ON CONFLICT (owner_user_id, purpose) DO UPDATE
    SET status='active', updated_at=now(), version=p.version+1
  RETURNING p.id, p.purpose, p.status INTO v_id, p_purpose, v_status;
  PERFORM memory_append_audit('memcontrol:pause:'||p_purpose, 'resume_collection',
    jsonb_build_object('purpose', p_purpose), 'resume:'||v_id);
  RETURN QUERY SELECT v_id, p_purpose, v_status, false;
END $$;
ALTER FUNCTION memory_control_resume_collection(text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_resume_collection(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_resume_collection(text,text) TO app_role;

-- ── ⑥ 导出回执（幂等；本层只记录回执，导出正文归 HTTP 接口待定）──────────────────
-- 为何 export_digest 由 principal+幂等键派生：导出正文不在本层落库，回执需要一个确定性摘要作
-- 幂等锚（同一请求重放得到同一回执），未来接口接真实正文时换成正文 digest。
CREATE OR REPLACE FUNCTION memory_control_export(p_idempotency_key text)
RETURNS TABLE (receipt_id uuid, export_digest text, status text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_digest text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_idempotency_key IS NULL OR length(p_idempotency_key)=0 THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  SELECT e.id, e.export_digest INTO v_id, v_digest FROM memory_export_receipt e
   WHERE e.owner_user_id = principal AND e.idempotency_key = p_idempotency_key
   LIMIT 1;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, v_digest, 'issued'::text, true;
    RETURN;
  END IF;
  v_digest := encode(digest(principal || ':' || p_idempotency_key || ':export', 'sha256'), 'hex');
  INSERT INTO memory_export_receipt (owner_user_id, export_digest, status, idempotency_key)
  VALUES (principal, v_digest, 'issued', p_idempotency_key)
  RETURNING memory_export_receipt.id INTO v_id;
  PERFORM memory_append_audit('memcontrol:export:'||v_id, 'export',
    jsonb_build_object('export_digest', v_digest), 'export:'||v_id);
  RETURN QUERY SELECT v_id, v_digest, 'issued'::text, false;
END $$;
ALTER FUNCTION memory_control_export(text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_export(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_export(text) TO app_role;

-- ── ⑦ policy 发布命令记录（build→validated→activated 幂等）───────────────────────
-- 为何只记录命令而非重写 build/validate/switch：发布流水冻结在 0102（freeze→build→validate→
-- switch），TS 层 memory-index-generation.ts 已复用；本命令记录「这次发布走到哪一步」的幂等命令 +
-- 审计，绝不复制冻结状态机。为何 status 单调：命令状态只前进（built→validated→activated）。
CREATE OR REPLACE FUNCTION memory_control_record_policy_publish(
  p_generation_key text,
  p_generation_id uuid,
  p_policy_version text,
  p_idempotency_key text
)
RETURNS TABLE (command_id uuid, status text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_generation_key IS NULL OR length(p_generation_key)=0
     OR p_generation_id IS NULL
     OR p_policy_version IS NULL OR length(p_policy_version)=0
     OR p_idempotency_key IS NULL OR length(p_idempotency_key)=0 THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  SELECT p.id, p.status INTO v_id, v_status FROM memory_policy_publish_command p
   WHERE p.owner_user_id = principal AND p.idempotency_key = p_idempotency_key
   LIMIT 1;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, v_status, true;
    RETURN;
  END IF;
  INSERT INTO memory_policy_publish_command (owner_user_id, generation_key, shadow_generation_id,
    policy_version, status, idempotency_key)
  VALUES (principal, p_generation_key, p_generation_id, p_policy_version, 'activated', p_idempotency_key)
  RETURNING memory_policy_publish_command.id, memory_policy_publish_command.status INTO v_id, v_status;
  PERFORM memory_append_audit('memcontrol:publish:'||p_generation_key, 'policy_publish',
    jsonb_build_object('generation_id', p_generation_id, 'policy_version', p_policy_version),
    'publish:'||v_id);
  RETURN QUERY SELECT v_id, v_status, false;
END $$;
ALTER FUNCTION memory_control_record_policy_publish(text,uuid,text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_record_policy_publish(text,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_record_policy_publish(text,uuid,text,text) TO app_role;

-- ── ⑨ reindex 任务记录（幂等；批量重建索引 generation）───────────────────────────
CREATE OR REPLACE FUNCTION memory_control_record_reindex(
  p_generation_id uuid,
  p_idempotency_key text
)
RETURNS TABLE (task_id uuid, status text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_idempotency_key IS NULL OR length(p_idempotency_key)=0 THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.id, t.status INTO v_id, v_status FROM memory_reindex_task t
   WHERE t.owner_user_id = principal AND t.idempotency_key = p_idempotency_key
   LIMIT 1;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, v_status, true;
    RETURN;
  END IF;
  INSERT INTO memory_reindex_task (owner_user_id, shadow_generation_id, status, idempotency_key)
  VALUES (principal, p_generation_id, 'completed', p_idempotency_key)
  RETURNING memory_reindex_task.id, memory_reindex_task.status INTO v_id, v_status;
  PERFORM memory_append_audit('memcontrol:reindex:'||v_id, 'reindex',
    jsonb_build_object('generation_id', p_generation_id), 'reindex:'||v_id);
  RETURN QUERY SELECT v_id, v_status, false;
END $$;
ALTER FUNCTION memory_control_record_reindex(uuid,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_record_reindex(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_control_record_reindex(uuid,text) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- B. 运营命令（受控角色，无正文直读）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── ⑧ 受控来源溯源访问（EXECUTE 仅 memory_reviewer，跨 owner 最小 provenance 卡片）──
-- 为何 EXECUTE 仅 memory_reviewer：这是跨 owner 的受控访问——reviewer 是被审计的运营身份，只能
-- 拿到 provenance（fact_key/source_entity_id/immutable_source_version/source_artifact_digest/
-- span_locator/allowed_data_class/status），**绝不吐 content / content_digest**。为何 owner 自己
-- 不走本函数：owner 用 memory_control_list_source_cards（自 scope）。为何 set principal=目标 owner：
-- 让 FORCE RLS 的 owner=principal 策略照常隔离（reviewer 只能按显式声明的 owner 读，无法枚举他人）。
CREATE OR REPLACE FUNCTION memory_control_review_source_card(p_owner_user_id text, p_fact_id uuid)
RETURNS TABLE (
  fact_id uuid, fact_key text, status text, allowed_data_class text,
  source_type text, source_entity_id text, immutable_source_version text,
  source_artifact_digest text, span_locator jsonb, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  v_caller text := session_user;
  v_owner text := p_owner_user_id;
BEGIN
  IF p_owner_user_id IS NULL OR length(p_owner_user_id)=0 OR p_fact_id IS NULL THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  -- 切 principal 到目标 owner，令 RLS owner=principal 生效（reviewer 无正文表级授权，只能经此面）。
  PERFORM set_config('app.principal_user', v_owner, true);
  RETURN QUERY
    SELECT f.id, f.fact_key, f.status, r.allowed_data_class, f.source_type,
           f.source_entity_id, f.immutable_source_version,
           r.source_artifact_digest, r.span_locator, f.created_at
    FROM memory_fact_adjudication f
    LEFT JOIN memory_admission_record r ON r.id = f.admission_record_id
    WHERE f.id = p_fact_id AND f.owner_user_id = v_owner
    LIMIT 1;
  -- 审计：谁在何时访问了谁的 provenance（caller 记 session_user，不落 content）。
  PERFORM memory_append_audit('memcontrol:review:'||p_fact_id, 'review_provenance',
    jsonb_build_object('fact_id', p_fact_id, 'target_owner', v_owner, 'caller', v_caller),
    'review:'||p_fact_id||':'||v_caller);
END $$;
ALTER FUNCTION memory_control_review_source_card(text,uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_control_review_source_card(text,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION memory_control_review_source_card(text,uuid) TO memory_reviewer;

-- ── ⑦ policy releaser：验证后 CAS 切换（EXECUTE 仅 memory_policy_releaser，跨 owner）──
-- 为何把「验证后切换 active」单独授给 releaser：发布流水里「读内容→embed→build」是 owner 授权的
-- 数据面动作，而「把已 validated 的 shadow 切为 active」是策略发布动作——releaser 是策略发布身份，
-- 全程 digest-only（memory_switch_active_generation 只重验 liveness + CAS，不读 content）。为何
-- set principal=目标 owner：令 RLS owner=principal 生效，releaser 只能切换显式声明 owner 的
-- validated generation，无法枚举他人。为何复用 0102 memory_switch_active_generation：CAS 状态机
-- 冻结在 0102（重验 liveness、删除先赢、旧 active→retiring），不重实现。
CREATE OR REPLACE FUNCTION memory_control_switch_generation(p_owner_user_id text, p_generation_id uuid)
RETURNS TABLE (generation_id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  v_caller text := session_user;
  v_owner text := p_owner_user_id;
  v_id uuid;
  v_status text;
BEGIN
  IF p_owner_user_id IS NULL OR length(p_owner_user_id)=0 OR p_generation_id IS NULL THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  PERFORM set_config('app.principal_user', v_owner, true);
  SELECT g.id, g.status INTO v_id, v_status FROM memory_switch_active_generation(p_generation_id) g;
  IF v_id IS NULL THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('memcontrol:policy_switch:'||v_id, 'policy_switch',
    jsonb_build_object('generation_id', v_id, 'target_owner', v_owner, 'caller', v_caller),
    'policy_switch:'||v_id||':'||v_caller);
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_control_switch_generation(text,uuid) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION memory_control_switch_generation(text,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION memory_control_switch_generation(text,uuid) TO memory_policy_releaser;

-- ═══════════════════════════════════════════════════════════════════════════════
-- worker：逐 sink 领取/完成/失败（EXECUTE privacy_worker_executor，OWNER privacy_worker_owner）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 领取 target（lease CAS：pending → leased）────────────────────────────────────
-- 为何 lease_token 是 UUID 且 CAS version 兜底：worker 领取是并发安全操作（多 worker 抢同一
-- target），CAS from pending + version 条件更新保证至多一个 worker 赢；旧 lease 过期后可被重新
-- 领取（与 0093 claim 同纪律）。为何 principal 必须存在：worker 按 owner 隔离清本 owner 行。
CREATE OR REPLACE FUNCTION memory_control_claim_deletion_target(
  p_request_id uuid,
  p_sink text,
  p_worker text,
  p_lease_seconds integer DEFAULT 60
)
RETURNS TABLE (target_id uuid, lease_token uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_target uuid;
  v_token uuid;
  v_status text;
  v_req_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_request_id IS NULL
     OR p_sink NOT IN ('memory_event','memory_summary','memory_fact','memory_embedding',
                       'memory_cache','memory_context_snapshot','memory_trace')
     OR p_worker IS NULL OR length(p_worker)=0
     OR p_lease_seconds < 5 OR p_lease_seconds > 600 THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  SELECT r.status INTO v_req_status FROM memory_deletion_request r
   WHERE r.id = p_request_id AND r.owner_user_id = principal;
  IF v_req_status IS NULL THEN
    RAISE EXCEPTION 'memory_control_request_not_found' USING ERRCODE='42501';
  END IF;
  IF v_req_status NOT IN ('fenced','purging','pending_external','partial_failed') THEN
    RETURN;
  END IF;

  -- 原子 CAS 领取：pending→leased（或过期 leased 续租）。用单一条件 UPDATE 保证并发下至多一个
  -- worker 赢（FOR UPDATE 行锁序列化 + WHERE status/lease 重验）。pending_external（未知 locator
  -- / 待 reindex）不被 WHERE 命中 → NOT FOUND → 返回空（fail-closed，不可领取删除）。
  UPDATE memory_deletion_target AS t
     SET status='leased', lease_owner=p_worker, lease_token=gen_random_uuid(),
         lease_expires_at=now()+(p_lease_seconds||' seconds')::interval,
         version=t.version+1, updated_at=now()
   WHERE t.request_id = p_request_id AND t.sink = p_sink
     AND t.owner_user_id = principal
     AND ((t.status='pending' AND (t.lease_expires_at IS NULL OR t.lease_expires_at < now()))
          OR (t.status='leased' AND t.lease_expires_at < now()))
   RETURNING t.id, t.lease_token, t.status INTO v_target, v_token, v_status;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT v_target, v_token, v_status;
END $$;


GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION memory_control_claim_deletion_target(uuid,text,text,integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION memory_control_claim_deletion_target(uuid,text,text,integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION memory_control_claim_deletion_target(uuid,text,text,integer) TO privacy_worker_executor;

-- ── 完成 target（物理删除 + receipt；未知 locator fail-closed）────────────────────
-- 为何完成前必须校验 lease：worker 领取的 lease 是删除授权证据；lease 过期/丢失 → 拒绝（旧 lease
-- 不得完成，防并发重复删除 / 防旧 worker 回执）。为何物理删除后校验 residual=0：镜像 0093
-- privacy_purge_memory_target——残留非零即 fail-closed，绝不伪装已删。为何未知 locator
-- （event/summary/trace 或非 account 的 embedding/cache/snapshot）RAISE：物理删除完成前绝不伪造
-- completed，未知 locator 恒 pending_external。
CREATE OR REPLACE FUNCTION memory_control_complete_deletion_target(
  p_target_id uuid,
  p_token uuid,
  p_receipt text
)
RETURNS TABLE (target_id uuid, status text, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_target memory_deletion_target%ROWTYPE;
  v_request memory_deletion_request%ROWTYPE;
  removed bigint := 0;
  remaining bigint := 0;
  final_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_target_id IS NULL OR p_token IS NULL THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_target FROM memory_deletion_target t
   WHERE t.id = p_target_id AND t.owner_user_id = principal
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_control_target_not_found' USING ERRCODE='42501';
  END IF;

  -- 已完成的幂等回放（重复外部回执）→ 返回既有 completed（不重复删除）。
  IF v_target.status = 'completed' THEN
    SELECT r.status INTO final_status FROM memory_deletion_request r WHERE r.id = v_target.request_id;
    RETURN QUERY SELECT v_target.id, 'completed'::text, final_status;
    RETURN;
  END IF;
  -- partial_failed 不回退成 completed（one-way 之上再 fail-closed：失败只能重走领取）。
  IF v_target.status <> 'leased' OR v_target.lease_token IS DISTINCT FROM p_token
     OR v_target.lease_expires_at < now() THEN
    RAISE EXCEPTION 'memory_control_target_lease_lost' USING ERRCODE='42501';
  END IF;
  IF p_receipt IS NULL OR length(p_receipt)=0 THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_request FROM memory_deletion_request r
   WHERE r.id = v_target.request_id AND r.owner_user_id = principal
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_control_request_not_found' USING ERRCODE='42501';
  END IF;
  IF v_request.status NOT IN ('fenced','purging','pending_external','partial_failed') THEN
    RAISE EXCEPTION 'memory_control_request_not_active' USING ERRCODE='42501';
  END IF;

  -- 逐 sink 明确删除动作；未知 locator 一律 fail-closed。
  IF v_target.sink = 'memory_fact' THEN
    -- 先清关系边（supersedes/contradicts），再清事实。为何先关系边：无 FK，但关系边引用了即将
    -- 删除的事实 id；显式先清保证「零残留」——否则 owner 事实删了，关系边成孤儿残留行。
    IF v_request.scope = 'account' THEN
      DELETE FROM memory_fact_relationship WHERE owner_user_id = principal;
      DELETE FROM memory_fact_adjudication WHERE owner_user_id = principal;
    ELSIF v_request.scope = 'single_fact' THEN
      DELETE FROM memory_fact_relationship WHERE owner_user_id = principal
        AND (from_fact_id = v_request.subject_id::uuid OR to_fact_id = v_request.subject_id::uuid);
      DELETE FROM memory_fact_adjudication WHERE owner_user_id = principal AND id = v_request.subject_id::uuid;
    ELSIF v_request.scope = 'session' THEN
      DELETE FROM memory_fact_relationship WHERE owner_user_id = principal
        AND (from_fact_id IN (SELECT fa.id FROM memory_fact_adjudication fa
               WHERE fa.owner_user_id = principal AND fa.admission_record_id IN
                 (SELECT a.id FROM memory_admission_record a
                  WHERE a.access_principal_user_id = principal AND a.thread_boundary = v_request.subject_id))
          OR to_fact_id IN (SELECT fa.id FROM memory_fact_adjudication fa
               WHERE fa.owner_user_id = principal AND fa.admission_record_id IN
                 (SELECT a.id FROM memory_admission_record a
                  WHERE a.access_principal_user_id = principal AND a.thread_boundary = v_request.subject_id)));
      DELETE FROM memory_fact_adjudication WHERE owner_user_id = principal
        AND admission_record_id IN (SELECT a.id FROM memory_admission_record a
          WHERE a.access_principal_user_id = principal AND a.thread_boundary = v_request.subject_id);
    END IF;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM memory_fact_adjudication fa
     WHERE fa.owner_user_id = principal
       AND (v_request.scope = 'account' OR
            (v_request.scope = 'single_fact' AND fa.id = v_request.subject_id::uuid) OR
            (v_request.scope = 'session' AND fa.admission_record_id IN
              (SELECT a.id FROM memory_admission_record a
               WHERE a.access_principal_user_id = principal AND a.thread_boundary = v_request.subject_id)));
  ELSIF v_target.sink = 'memory_embedding' THEN
    IF v_request.scope <> 'account' THEN
      RAISE EXCEPTION 'memory_control_sink_external_unresolved' USING ERRCODE='42501';
    END IF;
    DELETE FROM memory_index_generation_embedding WHERE owner_user_id = principal;
    DELETE FROM memory_index_generation_cache_entry WHERE owner_user_id = principal;
    DELETE FROM memory_index_source_manifest_item WHERE owner_user_id = principal;
    DELETE FROM memory_index_source_manifest WHERE owner_user_id = principal;
    DELETE FROM memory_index_generation WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM memory_index_generation WHERE owner_user_id = principal;
  ELSIF v_target.sink = 'memory_cache' THEN
    IF v_request.scope <> 'account' THEN
      RAISE EXCEPTION 'memory_control_sink_external_unresolved' USING ERRCODE='42501';
    END IF;
    DELETE FROM memory_index_generation_cache_entry WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM memory_index_generation_cache_entry WHERE owner_user_id = principal;
  ELSIF v_target.sink = 'memory_context_snapshot' THEN
    IF v_request.scope <> 'account' THEN
      RAISE EXCEPTION 'memory_control_sink_external_unresolved' USING ERRCODE='42501';
    END IF;
    DELETE FROM memory_recall_context_snapshot WHERE owner_user_id = principal;
    DELETE FROM memory_context_snapshot WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining
      FROM (SELECT id FROM memory_recall_context_snapshot WHERE owner_user_id = principal
            UNION ALL
            SELECT id FROM memory_context_snapshot WHERE owner_user_id = principal) s;
  ELSE
    RAISE EXCEPTION 'memory_control_sink_external_unresolved' USING ERRCODE='42501';
  END IF;
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'memory_control_target_residual_rows' USING ERRCODE='55000';
  END IF;

  UPDATE memory_deletion_target AS t
     SET status='completed', receipt=p_receipt, lease_owner=NULL, lease_token=NULL,
         lease_expires_at=NULL, version=t.version+1, updated_at=now()
   WHERE t.id = v_target.id AND t.status='leased' AND t.lease_token = p_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_control_target_complete_cas_lost' USING ERRCODE='40001';
  END IF;

  -- 推进 request 状态（诚实：仍 pending_external/partial_failed 时绝不 completed）。
  UPDATE memory_deletion_request AS r
     SET status = CASE
       WHEN EXISTS (SELECT 1 FROM memory_deletion_target t WHERE t.request_id=r.id AND t.status IN ('pending','leased')) THEN 'purging'
       WHEN EXISTS (SELECT 1 FROM memory_deletion_target t WHERE t.request_id=r.id AND t.status='partial_failed') THEN 'partial_failed'
       WHEN EXISTS (SELECT 1 FROM memory_deletion_target t WHERE t.request_id=r.id AND t.status='pending_external') THEN 'pending_external'
       ELSE 'completed' END,
       version=r.version+1, updated_at=now()
   WHERE r.id = v_request.id
   RETURNING r.status INTO final_status;

  RETURN QUERY SELECT v_target.id, 'completed'::text, final_status;
END $$;
ALTER FUNCTION memory_control_complete_deletion_target(uuid,uuid,text) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION memory_control_complete_deletion_target(uuid,uuid,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION memory_control_complete_deletion_target(uuid,uuid,text) TO privacy_worker_executor;

-- ── 失败 target（写目标级 reason + receipt，绝不伪造 completed）───────────────────
-- 为何失败落 partial_failed + reason + receipt：失败是可恢复/需人工的中间态，旧内容保持 fenced
-- 不复活；reason 给出目标级原因，receipt 保留外部系统的失败回执。为何 lease 校验同 complete：
-- 失败也只能由持有效 lease 的 worker 上报（防伪造失败/防并发重复）。
CREATE OR REPLACE FUNCTION memory_control_fail_deletion_target(
  p_target_id uuid,
  p_token uuid,
  p_reason text
)
RETURNS TABLE (target_id uuid, status text, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_target memory_deletion_target%ROWTYPE;
  final_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_target_id IS NULL OR p_token IS NULL
     OR p_reason IS NULL OR length(p_reason)=0 THEN
    RAISE EXCEPTION 'memory_control_invalid' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_target FROM memory_deletion_target t
   WHERE t.id = p_target_id AND t.owner_user_id = principal
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_control_target_not_found' USING ERRCODE='42501';
  END IF;
  IF v_target.status = 'completed' THEN
    SELECT r.status INTO final_status FROM memory_deletion_request r WHERE r.id = v_target.request_id;
    RETURN QUERY SELECT v_target.id, 'completed'::text, final_status;
    RETURN;
  END IF;
  IF v_target.status <> 'leased' OR v_target.lease_token IS DISTINCT FROM p_token
     OR v_target.lease_expires_at < now() THEN
    RAISE EXCEPTION 'memory_control_target_lease_lost' USING ERRCODE='42501';
  END IF;

  UPDATE memory_deletion_target AS t
     SET status='partial_failed', failure_reason=p_reason, receipt=p_reason,
         lease_owner=NULL, lease_token=NULL, lease_expires_at=NULL,
         version=t.version+1, updated_at=now()
   WHERE t.id = v_target.id AND t.status='leased' AND t.lease_token = p_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_control_target_fail_cas_lost' USING ERRCODE='40001';
  END IF;

  UPDATE memory_deletion_request AS r
     SET status = CASE
       WHEN EXISTS (SELECT 1 FROM memory_deletion_target t WHERE t.request_id=r.id AND t.status IN ('pending','leased')) THEN 'purging'
       WHEN EXISTS (SELECT 1 FROM memory_deletion_target t WHERE t.request_id=r.id AND t.status='partial_failed') THEN 'partial_failed'
       WHEN EXISTS (SELECT 1 FROM memory_deletion_target t WHERE t.request_id=r.id AND t.status='pending_external') THEN 'pending_external'
       ELSE 'completed' END,
       version=r.version+1, updated_at=now()
   WHERE r.id = v_target.request_id
   RETURNING r.status INTO final_status;

  RETURN QUERY SELECT v_target.id, 'partial_failed'::text, final_status;
END $$;
ALTER FUNCTION memory_control_fail_deletion_target(uuid,uuid,text) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;


REVOKE ALL ON FUNCTION memory_control_fail_deletion_target(uuid,uuid,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION memory_control_fail_deletion_target(uuid,uuid,text) TO privacy_worker_executor;

-- ── 防漂移：runtime login 永不成为受控角色 / 数据面 owner / worker（防 membership 漂移）──
REVOKE memory_reviewer, memory_policy_releaser, memory_runtime, privacy_worker_owner,
  privacy_worker_executor, privacy_issuer, privacy_guard_owner FROM app_role;
