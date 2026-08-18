-- 0093_memory_governance.sql
--
-- MEM-00（记忆治理 / memory governance）的数据库真相：长期事实的记忆准入、双阶段召回、
-- 可撤回同意、generation/snapshot 状态机、以及**复用 PrivacyAuthorizationIssuer** 的
-- 账户级记忆删除授权。
--
-- 设计铁律（与 .tmp/memory-governance-pregen-gate.md 对齐）：
--  1. 契约先行：本迁移只承载“存储 + 状态机 + 承重 SQL 函数”；schema 校验在
--     packages/contracts（MemoryFactWrite 等），纯域规范在 packages/domain/memory-governance.ts。
--  2. 显式 status enum + 审计转移：memory_fact / memory_consent / memory_index_generation /
--     memory_context_snapshot 全部用显式 enum，绝不用布尔汤；所有转移经本迁移的
--     SECURITY DEFINER 函数（服务端重新校验），不授 app_role 原始表写权。
--  3. 四原语：CAS（cas/confirm/activate/consume 的 version/status 条件更新）、幂等键
--     （memory_fact UNIQUE(owner,idempotency_key)、request UNIQUE(owner,idempotency_key_hash)）、
--     RLS principal 绑定（全部 FORCE RLS + owner=current_setting('app.principal_user')）、
--     持久有序事件日志（memory_audit_event + advisory 锁 + MAX+1）。
--  4. **复用冻结的 PrivacyAuthorizationIssuer，绝不重实现**：签发/验签/目标集 digest 全部
--     走 packages/domain/privacy-authorization.ts（ECDSA P-256/ES256）。本迁移只做两件事：
--       (a) 把 `privacy_issue_authorization_snapshot` 的目的分支扩到 account_data_erasure
--           （这是 0091 冻结代码**显式预留**给 MEM-00 的挂点：其 ELSE 分支注释写着
--           “Subject validation for other purposes is owned by their governance modules
--           (MEM-00/account)”，故这里是补挂点、不是重实现 issuer）；
--       (b) 新增 MEM 自己的 claim/purge 解析器（scope=account_data + sink∈MEM 集 + 活 digest
--           重验），与 INT-TRANSCRIPT 的 claim 刻意不可互认。
--  5. MEM 自己的 sink registry（memory_event/summary/fact/embedding/cache/context_snapshot/
--     trace）与 INT-TRANSCRIPT 的 sink（checkpoint_rows/…/langfuse）是两套不相交值集；
--     跨域 claim 一律 fail-closed（sink 归属由各域自己的 claim 校验）。
--  6. 记忆内容 = 不可信输入：进 data fence（content_digest 强制 = digest(content)，SQL 侧
--     二次重验）；双校验（schema → business PII 护栏）在调用侧完成。
--  7. 两阶段召回：第一阶段 DB 硬过滤（status/consent/epoch/expiry），第二阶段 hydrate 重验
--     digest/status/expiry/RLS。**绝无**“先全局 Top-K 再应用层过滤”的写法。
--  8. 不落 PII / 全文答案 / 完整 prompt；content 一律是派生摘要。
--
-- 与 INT-TRANSCRIPT-00 的边界：INT 的 scope='interview_data' + 目的 interview_data_erasure，
-- MEM 的 scope='account_data' + 目的 account_data_erasure。两域 target resolver/sink registry
-- 各自独立，本迁移不修改任何 INT 的 claim/purge 函数（只新增 MEM 的一套）。

-- ── 角色：memory_runtime（记忆数据面 SECURITY DEFINER 函数 owner）──────────────────
-- 与 privacy_api_owner / privacy_worker_owner / privacy_guard_owner 刻意分开：记忆的
-- “读/写/召回/同意/生成”不是隐私账本操作，不应共享 privacy_* 角色的爆炸半径。memory_runtime
-- 是 NOLOGIN NOBYPASSRLS 的固定 owner，其函数受 FORCE RLS 约束，不能借 owner 权绕过 RLS。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='memory_runtime') THEN
    CREATE ROLE memory_runtime NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO memory_runtime;

-- ── memory_fact：长期事实（治理元标签 + 显式状态机 + 单值唯一 active）────────────────
-- 注：kind/purpose/allowed_data_class/source_type/status 的枚举值与 packages/contracts 的
-- MemoryFactWrite/MemoryFactStatus/… 逐一对齐（契约先行，DB 只做下界约束，不另造枚举）。
DROP TABLE IF EXISTS memory_fact CASCADE;
CREATE TABLE memory_fact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  fact_key text NOT NULL,                              -- 确定性主题键（单值 active 的唯一依据）
  content text NOT NULL,                               -- 派生摘要（不可信输入 → data fence，非 PII 原文）
  content_digest text NOT NULL CHECK (content_digest ~ '^[a-f0-9]{64}$'),  -- sha256(utf8 content)
  kind text NOT NULL CHECK (kind IN ('fact','preference','skill','weakness','topic','episode')),
  purpose text NOT NULL CHECK (purpose IN ('interview_prep','career','preference','self_improvement')),
  allowed_data_class text NOT NULL CHECK (allowed_data_class IN ('derived_fact','dimension_label','topic','preference')),
  source_type text NOT NULL CHECK (source_type IN ('conversation_event','business_fact','user_confirmation','model_summary')),
  source_entity_id text,                               -- 来源工件 id（面试/评估等，可追溯）
  immutable_source_version text,                       -- 来源工件不可变版本（stale 源不再水合）
  source_span jsonb,                                   -- {offsetKind,start,end}，坐标系二选一（无 UTF-16）
  source_artifact_digest text CHECK (source_artifact_digest IS NULL OR source_artifact_digest ~ '^[a-f0-9]{64}$'),
  normalization_recipe_version text,                   -- 题面/内容归一化配方版本
  producer_class text,                                 -- 生产方（summarizer/fact-extractor/…）
  extraction_recipe_version text,
  verification_recipe_version text,
  policy_version text NOT NULL,                        -- 采集时的隐私政策版本（可审计）
  consent_revision bigint NOT NULL CHECK (consent_revision >= 1),  -- 采集时所属同意 revision
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),        -- 采集时所属 fence epoch
  status text NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate','awaiting_confirmation','active','rejected','superseded','disputed','expired','fenced')),
  multi_value boolean NOT NULL DEFAULT false,          -- false = 单值 key（同 key 至多一条 active）
  salience real NOT NULL DEFAULT 1.0,
  expires_at timestamptz,                              -- 绝对过期（召回按绝对时间硬过滤）
  idempotency_key text,                                -- 幂等重放键（调用方生成，防重复准入）
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  purged_at timestamptz,
  -- 幂等：同一 owner 下同幂等键只落一条（重放返回已存在行）。
  CONSTRAINT memory_fact_owner_idem_uq UNIQUE (owner_user_id, idempotency_key)
);
-- 单值 key 唯一 active：status='active' 且 multi_value=false 时 (owner,purpose,fact_key) 唯一，
-- 这是“100 并发 CAS 单 active”的数据库级承重约束（非仅调用约定）。用部分唯一索引直接声明
-- （多值 fact 不受限），无需先建 UNIQUE 约束再删（旧写法先建后 DROP，是死约束）。
CREATE UNIQUE INDEX memory_fact_single_active_ux
  ON memory_fact (owner_user_id, purpose, fact_key)
  WHERE status = 'active' AND multi_value = false;
CREATE INDEX memory_fact_owner_status_idx ON memory_fact (owner_user_id, status);
CREATE INDEX memory_fact_owner_purpose_idx ON memory_fact (owner_user_id, purpose);

GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER TABLE memory_fact ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_fact FORCE ROW LEVEL SECURITY;

-- ── memory_consent：可撤回同意（revision + fence epoch）──────────────────────────────
-- 区别于 baseline 的 consent_record（只有 INSERT、不可撤回）；memory_consent 是“可撤回”的
-- 记忆同意根：revoke 使 status→revoked 且 privacy_epoch+1（fence），同 purpose 下 active fact
-- 全部 fence；重新 grant 走 consent_revision+1（旧 fact 不会自动复活，需重新确认）。
DROP TABLE IF EXISTS memory_consent CASCADE;
CREATE TABLE memory_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('interview_prep','career','preference','self_improvement')),
  policy_version text NOT NULL,
  status text NOT NULL DEFAULT 'granted' CHECK (status IN ('granted','revoked')),
  consent_revision bigint NOT NULL DEFAULT 1 CHECK (consent_revision >= 1),
  privacy_epoch bigint NOT NULL DEFAULT 1 CHECK (privacy_epoch >= 1),
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, purpose)
);
ALTER TABLE memory_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_consent FORCE ROW LEVEL SECURITY;

-- ── memory_context_snapshot：冻结上下文快照（issued→consumed/expired/voided）────────────
-- 快照是一次性冻结的上下文（供报告/反思图回看），content 是不可信输入；snapshot_digest
-- **仅作审计比对标识、不承重**：SQL 侧不校验 digest(content)=snapshot_digest，水合/消费侧也
-- 不重验 content 摘要。与 memory_fact 的 data fence（text 内容 digest 强制一致）刻意不同：
-- fact 有“按 ID 水合重吐内容”的读路径，故必须 digest fence；snapshot 无重吐内容读路径，且
-- jsonb 无跨层唯一规范序列化（TS↔SQL 的 JSON 字节形式不保证逐一对齐，强绑定会制造跨层误拒），
-- 故 snapshot_digest 只供审计/幂等比对，不承担内容完整性承诺。
DROP TABLE IF EXISTS memory_context_snapshot CASCADE;
CREATE TABLE memory_context_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('interview_prep','career','preference','self_improvement')),
  snapshot_digest text NOT NULL CHECK (snapshot_digest ~ '^[a-f0-9]{64}$'),
  content jsonb NOT NULL,
  source_id text,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','consumed','expired','voided')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz,
  expires_at timestamptz,
  voided_at timestamptz,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE memory_context_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_context_snapshot FORCE ROW LEVEL SECURITY;

-- ── memory_index_generation：索引/向量 generation 状态机 ──────────────────────────────
-- building→validated→shadow→active→deprecated→retired。built_fact_digest 钉住该代索引
-- 构建时的 fact 集 digest；“旧 generation 不可复活已撤回”的承重点在召回（召回永远重查
-- fact.status），generation 只负责“哪一代在服务”，不负责“内容可见性”。
DROP TABLE IF EXISTS memory_index_generation CASCADE;
CREATE TABLE memory_index_generation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  generation_key text NOT NULL,
  status text NOT NULL DEFAULT 'building'
    CHECK (status IN ('building','validated','shadow','active','deprecated','retired')),
  built_fact_digest text CHECK (built_fact_digest IS NULL OR built_fact_digest ~ '^[a-f0-9]{64}$'),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  retired_at timestamptz,
  UNIQUE (owner_user_id, generation_key)
);
-- 单 owner 至多一个 active generation（部分唯一索引）。
CREATE UNIQUE INDEX memory_index_generation_single_active_ux
  ON memory_index_generation (owner_user_id)
  WHERE status = 'active';
ALTER TABLE memory_index_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_index_generation FORCE ROW LEVEL SECURITY;

-- ── memory_audit_event：append-only 有序事件日志 ─────────────────────────────────────
-- 镜像 interview_event：advisory 事务锁 + INSERT…SELECT MAX+1 原子分配 seq；只授 INSERT/SELECT
-- 给 memory_runtime（无 UPDATE/DELETE → 权限层即 append-only）。
DROP TABLE IF EXISTS memory_audit_event CASCADE;
CREATE TABLE memory_audit_event (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_user_id text NOT NULL,
  stream_key text NOT NULL,
  seq bigint NOT NULL,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  event_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- seq/event_key 的唯一性**含 owner**：stream_key 是调用方可见的流名（如 'memconsent:interview_prep'），
  -- 跨 owner 会重复；若唯一约束不含 owner，两个不同 owner 对同名 stream 各自 MAX+1 会撞 UNIQUE(stream_key,seq)。
  UNIQUE (owner_user_id, stream_key, seq),
  UNIQUE (owner_user_id, stream_key, event_key)
);
CREATE INDEX memory_audit_event_owner_idx ON memory_audit_event (owner_user_id, stream_key);
ALTER TABLE memory_audit_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_audit_event FORCE ROW LEVEL SECURITY;

-- ── 表级 ACL：runtime（app_role）无任何原始读/写（“普通 runtime 无表直读”的负路径承重）──
REVOKE ALL ON memory_fact, memory_consent, memory_context_snapshot, memory_index_generation, memory_audit_event FROM PUBLIC, app_role;
-- memory_runtime（数据面函数 owner）持有数据面读写权；audit 只 INSERT/SELECT（append-only）。
GRANT SELECT, INSERT, UPDATE ON memory_fact, memory_consent, memory_context_snapshot, memory_index_generation TO memory_runtime;
GRANT SELECT, INSERT ON memory_audit_event TO memory_runtime;
-- privacy_api_owner（发起账户删除的 definer）只 fence：SELECT/UPDATE 事实 + 同意。
GRANT SELECT, UPDATE ON memory_fact, memory_consent TO privacy_api_owner;
-- privacy_worker_owner（执行删除的 definer）只 SELECT/DELETE：物理清除三个可解析数据面。
GRANT SELECT, DELETE ON memory_fact, memory_context_snapshot, memory_index_generation TO privacy_worker_owner;

-- ── RLS 策略：全部 FORCE + owner=principal 绑定（四原语之③）────────────────────────
DO $$
BEGIN
  DROP POLICY IF EXISTS memory_fact_runtime ON memory_fact;
  CREATE POLICY memory_fact_runtime ON memory_fact
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_fact_api_owner ON memory_fact;
  CREATE POLICY memory_fact_api_owner ON memory_fact
    FOR ALL TO privacy_api_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_fact_worker_owner ON memory_fact;
  CREATE POLICY memory_fact_worker_owner ON memory_fact
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  DROP POLICY IF EXISTS memory_consent_runtime ON memory_consent;
  CREATE POLICY memory_consent_runtime ON memory_consent
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_consent_api_owner ON memory_consent;
  CREATE POLICY memory_consent_api_owner ON memory_consent
    FOR ALL TO privacy_api_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  DROP POLICY IF EXISTS memory_snapshot_runtime ON memory_context_snapshot;
  CREATE POLICY memory_snapshot_runtime ON memory_context_snapshot
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_snapshot_worker_owner ON memory_context_snapshot;
  CREATE POLICY memory_snapshot_worker_owner ON memory_context_snapshot
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  DROP POLICY IF EXISTS memory_generation_runtime ON memory_index_generation;
  CREATE POLICY memory_generation_runtime ON memory_index_generation
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_generation_worker_owner ON memory_index_generation;
  CREATE POLICY memory_generation_worker_owner ON memory_index_generation
    FOR ALL TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  DROP POLICY IF EXISTS memory_audit_runtime ON memory_audit_event;
  CREATE POLICY memory_audit_runtime ON memory_audit_event
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
END $$;

-- ── 账户主体存在性校验所需的 user_account 读取面（FORCE RLS + NOBYPASSRLS）────────
-- account_data_erasure 的 subject 校验（memory_begin_account_erasure + privacy_issue_
-- authorization_snapshot 的 account 分支）都 SECURITY DEFINER OWNER privacy_api_owner，
-- 但 user_account 在 0041 已 FORCE RLS 且只有 app_role 的 self 策略——privacy_api_owner
-- 无 SELECT 授权、无策略，会静默读不到任何行。此处按 0048 的 interview_privacy_api_owner
-- 模式补一条“id=principal”的只读策略 + SELECT 授权（绝不给 UPDATE/INSERT，防经此 role 伪造
-- 账户）。这是给冻结 issuer 的 account 挂点补的最小读取面，不是重新实现 issuer。
GRANT SELECT ON user_account TO privacy_api_owner;
DROP POLICY IF EXISTS p_user_account_privacy_api_owner ON user_account;
CREATE POLICY p_user_account_privacy_api_owner ON user_account
  FOR SELECT TO privacy_api_owner
  USING (id = current_setting('app.principal_user', true));

-- ── 扩展隐私删除目标 sink 枚举：新增 7 个 MEM sink ───────────────────────────────────
-- privacy_deletion_target.sink 的 CHECK 是 0047 内联写的（自动命名 privacy_deletion_target_
-- sink_check）。这里必须“找到并删掉旧约束 → 重加完整枚举”，否则 MEM 的 sink 无法落账。
DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname FROM pg_constraint
   WHERE conrelid = 'privacy_deletion_target'::regclass
     AND contype = 'c'
     AND (conname = 'privacy_deletion_target_sink_check'
          OR pg_get_constraintdef(oid) LIKE '%sink%')
   LIMIT 1;
  IF cname IS NULL THEN
    RAISE EXCEPTION 'privacy_deletion_target_sink_check_missing';
  END IF;
  EXECUTE format('ALTER TABLE privacy_deletion_target DROP CONSTRAINT %I', cname);
END $$;
ALTER TABLE privacy_deletion_target ADD CONSTRAINT privacy_deletion_target_sink_check
  CHECK (sink IN (
    -- INT-TRANSCRIPT sinks（0047 原有 8 个 + 0092 新增 interview_answer_artifact；0093 在 0092
    -- 之后跑，必须把 0092 的增量一并带进最终枚举，否则会静默丢掉答案事实根 sink）
    'checkpoint_rows','interview_job_payload','event','report','vector','redis','oss','langfuse',
    'interview_answer_artifact',
    -- MEM sinks（0093 新增，与 INT 两套不相交；claim/purge 各域自己校验归属）
    'memory_event','memory_summary','memory_fact','memory_embedding','memory_cache','memory_context_snapshot','memory_trace'
  ));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 记忆数据面函数（OWNER memory_runtime，EXECUTE 视用途授 app_role）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── append-only 有序审计事件（四原语之④ 持久有序事件日志）──────────────────────────
-- 内部 helper：只由 memory_runtime 自己的函数调用，不授 app_role EXECUTE。owner 恒取自
-- app.principal_user（调用方无法自报）；event_key 提供幂等（重放返回既有 seq）。
CREATE OR REPLACE FUNCTION memory_append_audit(
  p_stream text,
  p_kind text,
  p_payload jsonb,
  p_event_key text DEFAULT NULL
) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_seq bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_stream IS NULL OR length(p_stream)=0
     OR p_kind IS NULL OR length(p_kind)=0 OR p_payload IS NULL THEN
    RAISE EXCEPTION 'memory_audit_invalid' USING ERRCODE='22023';
  END IF;
  -- advisory 锁 key 含 principal：不同 owner 的同名 stream 互不阻塞（各自独立序列）。
  PERFORM pg_advisory_xact_lock(hashtext('memory_audit:' || principal || ':' || p_stream));
  IF p_event_key IS NOT NULL THEN
    SELECT e.seq INTO v_seq FROM memory_audit_event e
     WHERE e.owner_user_id = principal AND e.stream_key = p_stream AND e.event_key = p_event_key;
    IF FOUND THEN RETURN v_seq; END IF;
  END IF;
  INSERT INTO memory_audit_event(owner_user_id, stream_key, seq, kind, payload, event_key)
  SELECT principal, p_stream, COALESCE(MAX(e.seq), 0) + 1, p_kind, p_payload, p_event_key
    FROM memory_audit_event e WHERE e.owner_user_id = principal AND e.stream_key = p_stream
  ON CONFLICT (owner_user_id, stream_key, event_key) DO NOTHING
  RETURNING seq INTO v_seq;
  IF v_seq IS NULL AND p_event_key IS NOT NULL THEN
    SELECT e.seq INTO v_seq FROM memory_audit_event e
     WHERE e.owner_user_id = principal AND e.stream_key = p_stream AND e.event_key = p_event_key;
  END IF;
  IF v_seq IS NULL THEN
    RAISE EXCEPTION 'memory_audit_append_failed' USING ERRCODE='55000';
  END IF;
  RETURN v_seq;
END $$;

ALTER FUNCTION memory_append_audit(text,text,jsonb,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_append_audit(text,text,jsonb,text) FROM PUBLIC, app_role;

-- ── 同意授予 / 撤回 ───────────────────────────────────────────────────────────────
-- grant：无行→插（rev 1/epoch 1）；已 revoked→重新授予（rev+1，epoch 不重置，保持单调 fence）；
-- 已 granted→幂等返回既有。
CREATE OR REPLACE FUNCTION memory_grant_consent(p_purpose text, p_policy_version text)
RETURNS TABLE (id uuid, purpose text, status text, consent_revision bigint, privacy_epoch bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_row memory_consent%ROWTYPE;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement')
     OR p_policy_version IS NULL OR length(p_policy_version)=0 THEN
    RAISE EXCEPTION 'memory_consent_invalid' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_row FROM memory_consent c
   WHERE c.owner_user_id = principal AND c.purpose = p_purpose FOR UPDATE;
  IF FOUND THEN
    IF v_row.status = 'granted' THEN
      RETURN QUERY SELECT v_row.id, v_row.purpose, v_row.status, v_row.consent_revision, v_row.privacy_epoch;
      RETURN;
    END IF;
    UPDATE memory_consent c
       SET status='granted', consent_revision=c.consent_revision+1, policy_version=p_policy_version,
           revoked_at=NULL, updated_at=now()
     WHERE c.id=v_row.id
     RETURNING c.id,c.purpose,c.status,c.consent_revision,c.privacy_epoch
       INTO v_row.id,v_row.purpose,v_row.status,v_row.consent_revision,v_row.privacy_epoch;
    RETURN QUERY SELECT v_row.id, v_row.purpose, v_row.status, v_row.consent_revision, v_row.privacy_epoch;
    RETURN;
  END IF;
  INSERT INTO memory_consent(owner_user_id, purpose, policy_version)
    VALUES (principal, p_purpose, p_policy_version)
  RETURNING * INTO v_row;
  RETURN QUERY SELECT v_row.id, v_row.purpose, v_row.status, v_row.consent_revision, v_row.privacy_epoch;
END $$;
ALTER FUNCTION memory_grant_consent(text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_grant_consent(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_grant_consent(text,text) TO app_role;

-- revoke：status→revoked 且 privacy_epoch+1（fence），并把同 purpose 下 active fact 全部 fence。
-- 返回新 epoch。撤回后 recall=0（fact 已非 active 且 epoch 落后）。
CREATE OR REPLACE FUNCTION memory_revoke_consent(p_purpose text)
RETURNS TABLE (privacy_epoch bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_epoch bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement') THEN
    RAISE EXCEPTION 'memory_consent_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_consent c
     SET status='revoked', privacy_epoch=c.privacy_epoch+1, revoked_at=now(), updated_at=now()
   WHERE c.owner_user_id=principal AND c.purpose=p_purpose AND c.status='granted'
   RETURNING c.privacy_epoch INTO v_epoch;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_consent_not_granted' USING ERRCODE='42501';
  END IF;
  UPDATE memory_fact f
     SET status='fenced', privacy_epoch=v_epoch, revoked_at=now(), version=f.version+1, updated_at=now()
   WHERE f.owner_user_id=principal AND f.purpose=p_purpose AND f.status='active';
  PERFORM memory_append_audit('memconsent:'||p_purpose, 'revoke',
    jsonb_build_object('purpose', p_purpose, 'privacy_epoch', v_epoch), 'revoke:'||v_epoch);
  RETURN QUERY SELECT v_epoch;
END $$;
ALTER FUNCTION memory_revoke_consent(text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_revoke_consent(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_revoke_consent(text) TO app_role;

-- ── 事实准入（candidate）─────────────────────────────────────────────────────────
-- 无同意不采集：purpose 必须有 granted consent（fail-closed）；content_digest 必须等于
-- digest(content)（SQL 侧二次重验 data fence）；幂等键重放返回既有行。
CREATE OR REPLACE FUNCTION memory_record_fact(
  p_fact_key text,
  p_content text,
  p_content_digest text,
  p_kind text,
  p_purpose text,
  p_allowed_data_class text,
  p_source_type text,
  p_source_entity_id text,
  p_immutable_source_version text,
  p_source_span jsonb,
  p_source_artifact_digest text,
  p_normalization_recipe_version text,
  p_producer_class text,
  p_extraction_recipe_version text,
  p_verification_recipe_version text,
  p_policy_version text,
  p_expires_at timestamptz,
  p_multi_value boolean,
  p_idempotency_key text
) RETURNS TABLE (id uuid, status text, created boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  consent_row memory_consent%ROWTYPE;
  v_id uuid;
  v_status text;
  v_created boolean := true;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_fact_key IS NULL OR length(p_fact_key)=0
     OR p_content IS NULL OR length(p_content)=0
     OR p_content_digest IS NULL OR p_content_digest !~ '^[a-f0-9]{64}$'
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement')
     OR p_policy_version IS NULL OR length(p_policy_version)=0 THEN
    RAISE EXCEPTION 'memory_fact_invalid' USING ERRCODE='22023';
  END IF;

  -- 无同意不采集（fail-closed）：准入必须挂在当前 granted consent 的 revision+epoch 上。
  SELECT * INTO consent_row FROM memory_consent c
   WHERE c.owner_user_id=principal AND c.purpose=p_purpose AND c.status='granted'
   FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_consent_missing' USING ERRCODE='42501';
  END IF;

  -- data fence：digest(content) 与调用方传入的 content_digest 必须逐字节一致。若被改内容
  -- 而不改 digest，此处 fail-closed。
  IF encode(digest(p_content,'sha256'),'hex') IS DISTINCT FROM p_content_digest THEN
    RAISE EXCEPTION 'memory_content_digest_mismatch' USING ERRCODE='22023';
  END IF;

  -- 幂等重放：同 owner 同幂等键返回既有行（不双写、不新建）。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT f.id, f.status INTO v_id, v_status FROM memory_fact f
     WHERE f.owner_user_id=principal AND f.idempotency_key=p_idempotency_key;
    IF FOUND THEN
      RETURN QUERY SELECT v_id, v_status, false;
      RETURN;
    END IF;
  END IF;

  INSERT INTO memory_fact AS mf(
    owner_user_id, fact_key, content, content_digest, kind, purpose, allowed_data_class,
    source_type, source_entity_id, immutable_source_version, source_span, source_artifact_digest,
    normalization_recipe_version, producer_class, extraction_recipe_version, verification_recipe_version,
    policy_version, consent_revision, privacy_epoch, status, multi_value, expires_at, idempotency_key
  ) VALUES (
    principal, p_fact_key, p_content, p_content_digest, p_kind, p_purpose, p_allowed_data_class,
    p_source_type, p_source_entity_id, p_immutable_source_version, p_source_span, p_source_artifact_digest,
    p_normalization_recipe_version, p_producer_class, p_extraction_recipe_version, p_verification_recipe_version,
    p_policy_version, consent_row.consent_revision, consent_row.privacy_epoch, 'candidate', p_multi_value,
    p_expires_at, p_idempotency_key
  ) RETURNING mf.id, mf.status INTO v_id, v_status;

  PERFORM memory_append_audit('memfact:'||v_id, 'record',
    jsonb_build_object('fact_id', v_id, 'fact_key', p_fact_key, 'purpose', p_purpose), 'record');
  RETURN QUERY SELECT v_id, v_status, v_created;
EXCEPTION WHEN unique_violation THEN
  -- 幂等键并发撞车：回查既有行返回（幂等，不抛）。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT f.id, f.status INTO v_id, v_status FROM memory_fact f
     WHERE f.owner_user_id=principal AND f.idempotency_key=p_idempotency_key;
    IF FOUND THEN
      RETURN QUERY SELECT v_id, v_status, false;
      RETURN;
    END IF;
  END IF;
  RAISE;
END $$;
ALTER FUNCTION memory_record_fact(text,text,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,text,timestamptz,boolean,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_record_fact(text,text,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,text,timestamptz,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_record_fact(text,text,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,text,timestamptz,boolean,text) TO app_role;

-- ── 确认（candidate/awaiting_confirmation → active，单值 active CAS）─────────────────
-- 单值 key 唯一 active 由部分唯一索引 memory_fact_single_active_ux 承重；并发下先到者赢，
-- 败者在 EXCEPTION 里回查终态并返回空（“100 并发单 active”）。
CREATE OR REPLACE FUNCTION memory_confirm_fact(p_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_id IS NULL THEN
    RAISE EXCEPTION 'memory_confirm_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_fact mf
     SET status='active', version=mf.version+1, updated_at=now()
   WHERE mf.id=p_id
     AND mf.owner_user_id=principal
     AND mf.status IN ('candidate','awaiting_confirmation')
     AND (mf.expires_at IS NULL OR mf.expires_at > now())
     -- 单值 active 唯一只约束 multi_value=false 的 fact；multi_value=true 的同 key 多值不受限。
     AND (mf.multi_value = true OR NOT EXISTS (
       SELECT 1 FROM memory_fact e
        WHERE e.owner_user_id=mf.owner_user_id
          AND e.purpose=mf.purpose
          AND e.fact_key=mf.fact_key
          AND e.status='active'
          AND e.multi_value=false
          AND e.id<>mf.id
     ))
   RETURNING mf.id, mf.status INTO v_id, v_status;
  IF v_id IS NULL THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('memfact:'||v_id, 'confirm',
    jsonb_build_object('fact_id', v_id), 'confirm');
  RETURN QUERY SELECT v_id, v_status;
EXCEPTION WHEN unique_violation THEN
  -- 并发下另一个 confirm 已拿下单值 active；败者回查终态，返回空（不是错误）。
  RETURN;
END $$;
ALTER FUNCTION memory_confirm_fact(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_confirm_fact(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_confirm_fact(uuid) TO app_role;

-- ── 撤回（active/superseded/disputed → fenced，单条事实级别）───────────────────────
-- 只 fence 这一条，不 bump 全局 epoch（全局 fence 走 revoke_consent / account erasure）。
CREATE OR REPLACE FUNCTION memory_revoke_fact(p_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_id IS NULL THEN
    RAISE EXCEPTION 'memory_revoke_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_fact f
     SET status='fenced', revoked_at=now(), version=f.version+1, updated_at=now()
   WHERE f.id=p_id AND f.owner_user_id=principal AND f.status IN ('active','superseded','disputed')
   RETURNING f.id, f.status INTO v_id, v_status;
  IF v_id IS NULL THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('memfact:'||v_id, 'revoke',
    jsonb_build_object('fact_id', v_id), 'revoke');
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_revoke_fact(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_revoke_fact(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_revoke_fact(uuid) TO app_role;

-- ── 两阶段召回第一阶段：DB 硬过滤（只返回 ID 集，绝无内容）────────────────────────
-- 硬过滤：active + 未过期（绝对时间）+ consent granted + revision 匹配 + epoch 匹配。
-- 这是“先 DB 硬过滤再水合”的承重实现；绝无“全局 Top-K 再应用层过滤”。
CREATE OR REPLACE FUNCTION memory_recall_candidates(p_purpose text DEFAULT NULL)
RETURNS SETOF uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 THEN
    RAISE EXCEPTION 'memory_recall_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT mf.id
      FROM memory_fact mf
      JOIN memory_consent mc
        ON mc.owner_user_id = mf.owner_user_id AND mc.purpose = mf.purpose
     WHERE mf.owner_user_id = principal
       AND mf.status = 'active'
       AND mc.status = 'granted'
       AND mc.consent_revision = mf.consent_revision
       AND mc.privacy_epoch = mf.privacy_epoch
       AND (mf.expires_at IS NULL OR mf.expires_at > now())
       AND (p_purpose IS NULL OR mf.purpose = p_purpose)
     ORDER BY mf.id;
END $$;
ALTER FUNCTION memory_recall_candidates(text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_recall_candidates(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_recall_candidates(text) TO app_role;

-- ── 两阶段召回第二阶段：水合重验（digest/status/expiry/consent 全重验后才吐内容）────
CREATE OR REPLACE FUNCTION memory_hydrate_facts(p_ids uuid[])
RETURNS TABLE (
  id uuid, fact_key text, content text, kind text, purpose text, allowed_data_class text,
  source_span jsonb, source_artifact_digest text, policy_version text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_ids IS NULL OR cardinality(p_ids)=0 THEN
    RAISE EXCEPTION 'memory_hydrate_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT mf.id, mf.fact_key, mf.content, mf.kind, mf.purpose, mf.allowed_data_class,
           mf.source_span, mf.source_artifact_digest, mf.policy_version
      FROM memory_fact mf
      JOIN memory_consent mc
        ON mc.owner_user_id = mf.owner_user_id AND mc.purpose = mf.purpose
     WHERE mf.id = ANY(p_ids)
       AND mf.owner_user_id = principal
       AND mf.status = 'active'
       AND mc.status = 'granted'
       AND mc.consent_revision = mf.consent_revision
       AND mc.privacy_epoch = mf.privacy_epoch
       AND (mf.expires_at IS NULL OR mf.expires_at > now())
       -- 水合重验：digest 不一致（内容被篡改）即过滤，不吐内容。
       AND encode(digest(mf.content,'sha256'),'hex') = mf.content_digest
     ORDER BY mf.id;
END $$;
ALTER FUNCTION memory_hydrate_facts(uuid[]) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_hydrate_facts(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_hydrate_facts(uuid[]) TO app_role;

-- ── generation 状态机 ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION memory_start_generation(p_generation_key text, p_built_fact_digest text)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_generation_key IS NULL OR length(p_generation_key)=0 THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;
  INSERT INTO memory_index_generation AS g(owner_user_id, generation_key, status, built_fact_digest)
    VALUES (principal, p_generation_key, 'building', p_built_fact_digest)
  ON CONFLICT (owner_user_id, generation_key) DO UPDATE
    SET built_fact_digest = COALESCE(EXCLUDED.built_fact_digest, g.built_fact_digest)
  RETURNING g.id, g.status INTO v_id, v_status;
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_start_generation(text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_start_generation(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_start_generation(text,text) TO app_role;

-- activate：building/validated/shadow → active；先退役本 owner 现有 active（单 active CAS）。
CREATE OR REPLACE FUNCTION memory_activate_generation(p_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_id IS NULL THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;
  -- 先退役本 owner 当前 active（单 active 的部分唯一索引兜底，防并发双 active）。
  UPDATE memory_index_generation g
     SET status='deprecated', retired_at=now(), version=g.version+1
   WHERE g.owner_user_id=principal AND g.status='active' AND g.id<>p_id;
  UPDATE memory_index_generation g
     SET status='active', activated_at=now(), version=g.version+1
   WHERE g.id=p_id AND g.owner_user_id=principal AND g.status IN ('building','validated','shadow')
   RETURNING g.id, g.status INTO v_id, v_status;
  IF v_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT v_id, v_status;
EXCEPTION WHEN unique_violation THEN
  -- 并发双 active 被部分唯一索引拒绝；败者返回空。
  RETURN;
END $$;
ALTER FUNCTION memory_activate_generation(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_activate_generation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_activate_generation(uuid) TO app_role;

CREATE OR REPLACE FUNCTION memory_retire_generation(p_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_id IS NULL THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_index_generation g
     SET status='retired', retired_at=now(), version=g.version+1
   WHERE g.id=p_id AND g.owner_user_id=principal AND g.status IN ('active','deprecated')
   RETURNING g.id, g.status INTO v_id, v_status;
  IF v_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_retire_generation(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_retire_generation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_retire_generation(uuid) TO app_role;

-- ── 上下文快照状态机 ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION memory_issue_context_snapshot(
  p_purpose text,
  p_snapshot_digest text,
  p_content jsonb,
  p_source_id text,
  p_expires_at timestamptz
) RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement')
     OR p_snapshot_digest IS NULL OR p_snapshot_digest !~ '^[a-f0-9]{64}$'
     OR p_content IS NULL THEN
    RAISE EXCEPTION 'memory_snapshot_invalid' USING ERRCODE='22023';
  END IF;
  INSERT INTO memory_context_snapshot AS s(owner_user_id, purpose, snapshot_digest, content, source_id, expires_at)
    VALUES (principal, p_purpose, p_snapshot_digest, p_content, p_source_id, p_expires_at)
  RETURNING s.id, s.status INTO v_id, v_status;
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_issue_context_snapshot(text,text,jsonb,text,timestamptz) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_issue_context_snapshot(text,text,jsonb,text,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_issue_context_snapshot(text,text,jsonb,text,timestamptz) TO app_role;

-- consume：issued→consumed（单次 CAS）。
CREATE OR REPLACE FUNCTION memory_consume_context_snapshot(p_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_id IS NULL THEN
    RAISE EXCEPTION 'memory_snapshot_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_context_snapshot s
     SET status='consumed', consumed_at=now(), version=s.version+1
   WHERE s.id=p_id AND s.owner_user_id=principal AND s.status='issued'
     AND (s.expires_at IS NULL OR s.expires_at > now())
   RETURNING s.id, s.status INTO v_id, v_status;
  IF v_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_consume_context_snapshot(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_consume_context_snapshot(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_consume_context_snapshot(uuid) TO app_role;

CREATE OR REPLACE FUNCTION memory_void_context_snapshot(p_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_id IS NULL THEN
    RAISE EXCEPTION 'memory_snapshot_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_context_snapshot s
     SET status='voided', voided_at=now(), version=s.version+1
   WHERE s.id=p_id AND s.owner_user_id=principal AND s.status IN ('issued','consumed')
   RETURNING s.id, s.status INTO v_id, v_status;
  IF v_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_void_context_snapshot(uuid) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION memory_void_context_snapshot(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_void_context_snapshot(uuid) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 记忆删除授权（复用冻结 PrivacyAuthorizationIssuer + 新增 MEM 解析器）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 冻结 issuer 的目的分支扩展：account_data_erasure ───────────────────────────
-- 这是 0091 冻结代码显式预留的 MEM-00 挂点（其 ELSE 注释“Subject validation for other
-- purposes is owned by their governance modules (MEM-00/account)”）。只补 account 分支，
-- resume_data_erasure 仍 fail-closed，interview 分支原样保留。
CREATE OR REPLACE FUNCTION privacy_issue_authorization_snapshot(
  p_jti text,
  p_key_id text,
  p_actor text,
  p_interview_id text,
  p_purpose text,
  p_privacy_epoch bigint,
  p_target_set_digest text,
  p_expires_at timestamptz
) RETURNS TABLE (snapshot_id uuid, owner_user_id text, issued_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_owner text;
  v_issued timestamptz;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_jti IS NULL OR length(p_jti)=0
     OR p_key_id IS NULL OR length(p_key_id)=0
     OR p_actor IS NULL OR length(p_actor)=0
     OR p_interview_id IS NULL OR length(p_interview_id)=0
     OR p_purpose NOT IN ('interview_data_erasure','resume_data_erasure','account_data_erasure')
     OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1
     OR p_target_set_digest IS NULL OR p_target_set_digest !~ '^[a-f0-9]{64}$'
     OR p_expires_at IS NULL OR p_expires_at <= now()
     OR p_expires_at > now() + interval '1 hour' THEN
    RAISE EXCEPTION 'privacy_authorization_issue_invalid' USING ERRCODE='22023';
  END IF;

  IF p_purpose = 'interview_data_erasure' THEN
    PERFORM 1 FROM interview i WHERE i.id = p_interview_id AND i.owner_user_id = principal;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'privacy_authorization_not_found_or_forbidden' USING ERRCODE='42501';
    END IF;
  ELSIF p_purpose = 'account_data_erasure' THEN
    -- MEM-00：subject 必须是**已认证 principal 自己的账户**，且账户必须存在。owner 不可能
    -- 为他人账户签发删除（fail-closed），这是 account 目的的唯一 subject 校验。
    IF p_interview_id IS DISTINCT FROM principal THEN
      RAISE EXCEPTION 'privacy_authorization_not_found_or_forbidden' USING ERRCODE='42501';
    END IF;
    PERFORM 1 FROM user_account ua WHERE ua.id = principal;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'privacy_authorization_not_found_or_forbidden' USING ERRCODE='42501';
    END IF;
  ELSE
    RAISE EXCEPTION 'privacy_authorization_purpose_unsupported' USING ERRCODE='22023';
  END IF;

  INSERT INTO privacy_authorization_snapshot
    (jti, issuer_id, key_id, actor, owner_user_id, interview_id, purpose, privacy_epoch, target_set_digest, status, issued_at, expires_at)
  VALUES
    (p_jti, 'meetwise-privacy-authz-v1', p_key_id, p_actor, principal, p_interview_id, p_purpose, p_privacy_epoch, p_target_set_digest, 'issued', now(), p_expires_at)
  ON CONFLICT (jti) DO NOTHING
  RETURNING privacy_authorization_snapshot.id, privacy_authorization_snapshot.owner_user_id, privacy_authorization_snapshot.issued_at
    INTO v_id, v_owner, v_issued;
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'privacy_authorization_jti_conflict' USING ERRCODE='23505';
  END IF;
  RETURN QUERY SELECT v_id, v_owner, v_issued;
END $$;


GRANT CREATE ON SCHEMA public TO privacy_api_owner;
ALTER FUNCTION privacy_issue_authorization_snapshot(text,text,text,text,text,bigint,text,timestamptz) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION privacy_issue_authorization_snapshot(text,text,text,text,text,bigint,text,timestamptz) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_issue_authorization_snapshot(text,text,text,text,text,bigint,text,timestamptz) TO privacy_issuer;

-- ── 账户级删除发起（API 侧，app_role EXECUTE，OWNER privacy_api_owner）─────────────
-- 同步 fence（撤回全部 granted consent + fence 全部 active fact）→ 建 request → 枚举 3 个
-- 可解析 MEM sink 的 target → 从活 target 集就地算 target_set_digest（与 claim 的活重验同
-- 公式）→ request→fenced。幂等：同 owner 同 idempotency_key_hash 重放返回既有 3 行。
-- 4 个保留 sink（memory_event/summary/cache/trace）MEM-00 尚无数据面，**不建 target**——
-- 未知 locator 一律 fail-closed（见 privacy_purge_memory_target），绝不伪装成“已删除”。
CREATE OR REPLACE FUNCTION memory_begin_account_erasure(p_idempotency_key_hash text)
RETURNS TABLE (request_id uuid, request_status text, privacy_epoch bigint, target_set_digest text, sink text, resource_hmac text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  existing privacy_erasure_request%ROWTYPE;
  new_epoch bigint;
  v_request uuid;
  v_digest text;
  v_status text;
  sink_name text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_idempotency_key_hash IS NULL OR p_idempotency_key_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'memory_erasure_invalid' USING ERRCODE='22023';
  END IF;
  -- subject 必须是调用者自己的账户。
  PERFORM 1 FROM user_account ua WHERE ua.id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_erasure_account_not_found' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing FROM privacy_erasure_request r
   WHERE r.owner_user_id = principal AND r.idempotency_key_hash = p_idempotency_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> 'account_data' OR existing.subject_id <> principal THEN
      RAISE EXCEPTION 'memory_erasure_idempotency_payload_conflict' USING ERRCODE='23505';
    END IF;
    RETURN QUERY
      SELECT d.request_id, r2.status, r2.privacy_epoch, r2.target_set_digest, d.sink, d.resource_hmac, true
        FROM privacy_deletion_target d
        JOIN privacy_erasure_request r2 ON r2.id = d.request_id
       WHERE d.request_id = existing.id
       ORDER BY d.sink;
    RETURN;
  END IF;

  -- 单调 fence epoch（在既有 consent epoch 之上 +1，恒 >=1）。
  SELECT COALESCE(MAX(c.privacy_epoch), 0) + 1 INTO new_epoch
    FROM memory_consent c WHERE c.owner_user_id = principal;

  -- fence：撤回全部 granted consent + fence 全部 active fact（异步窗口内立即停止召回）。
  UPDATE memory_consent c
     SET status='revoked', privacy_epoch=new_epoch, revoked_at=now(), updated_at=now()
   WHERE c.owner_user_id = principal AND c.status = 'granted';
  UPDATE memory_fact f
     SET status='fenced', privacy_epoch=new_epoch, revoked_at=now(), version=f.version+1, updated_at=now()
   WHERE f.owner_user_id = principal AND f.status = 'active';

  INSERT INTO privacy_erasure_request(owner_user_id, scope, subject_id, idempotency_key_hash, status, privacy_epoch)
    VALUES (principal, 'account_data', principal, p_idempotency_key_hash, 'requested', new_epoch)
    RETURNING id INTO v_request;

  FOREACH sink_name IN ARRAY ARRAY['memory_fact','memory_embedding','memory_context_snapshot'] LOOP
    INSERT INTO privacy_deletion_target(request_id, sink, resource_hmac, status)
      VALUES (v_request, sink_name,
        encode(hmac(principal || ':' || sink_name || ':' || v_request::text, p_idempotency_key_hash, 'sha256'), 'hex'),
        'pending');
  END LOOP;

  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO v_digest FROM privacy_deletion_target d WHERE d.request_id = v_request;

  UPDATE privacy_erasure_request r
     SET status='fenced', target_set_digest=v_digest, updated_at=now(), version=r.version+1
   WHERE r.id=v_request AND r.status='requested'
   RETURNING r.status INTO v_status;

  RETURN QUERY
    SELECT d.request_id, v_status, new_epoch, v_digest, d.sink, d.resource_hmac, false
      FROM privacy_deletion_target d WHERE d.request_id = v_request ORDER BY d.sink;
END $$;
ALTER FUNCTION memory_begin_account_erasure(text) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION memory_begin_account_erasure(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_begin_account_erasure(text) TO app_role;

-- ── 删除侧受约束 claim（OWNER privacy_worker_owner，EXECUTE privacy_worker_executor）──
-- 镜像冻结 privacy_authorization_claim_target 的活重验，但 scope/目的/sink 换成 MEM 域：
--   purpose=account_data_erasure + scope=account_data + sink∈{3 个可解析 MEM sink}。
-- 其余（consume/issuer/expiry/owner/epoch/digest/活漂移）与冻结 claim 完全一致。
CREATE OR REPLACE FUNCTION privacy_authorization_claim_memory_target(
  p_jti text,
  p_target uuid,
  p_worker text,
  p_lease_seconds integer DEFAULT 60
) RETURNS TABLE (target_id uuid, lease_token uuid, status text, attempt integer)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  snap privacy_authorization_snapshot%ROWTYPE;
  target_row record;
  live_digest text;
  token uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_jti IS NULL OR length(p_jti)=0 OR p_target IS NULL OR p_worker IS NULL OR length(p_worker)=0
     OR p_lease_seconds < 5 OR p_lease_seconds > 600 THEN
    RAISE EXCEPTION 'privacy_authorization_claim_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO snap FROM privacy_authorization_snapshot
   WHERE privacy_authorization_snapshot.jti = p_jti FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_not_found' USING ERRCODE='42501';
  END IF;
  IF snap.issuer_id <> 'meetwise-privacy-authz-v1' THEN
    RAISE EXCEPTION 'privacy_authorization_issuer_mismatch' USING ERRCODE='42501';
  END IF;
  IF snap.status <> 'consumed' THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_not_consumed' USING ERRCODE='42501';
  END IF;
  IF snap.expires_at <= now() THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_expired' USING ERRCODE='40901';
  END IF;
  IF snap.owner_user_id IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'privacy_authorization_owner_mismatch' USING ERRCODE='42501';
  END IF;

  SELECT t.*, r.owner_user_id AS request_owner, r.scope, r.subject_id,
         r.privacy_epoch AS request_epoch, r.target_set_digest AS request_digest,
         r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;

  IF target_row.request_owner IS DISTINCT FROM snap.owner_user_id
     OR target_row.request_owner IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'privacy_authorization_owner_mismatch' USING ERRCODE='42501';
  END IF;
  -- MEM 域：目的/scope/sink 三重锁定，与 INT 的 interview_data 互不认。
  IF NOT (snap.purpose = 'account_data_erasure' AND target_row.scope = 'account_data') THEN
    RAISE EXCEPTION 'privacy_authorization_scope_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.sink NOT IN ('memory_fact','memory_embedding','memory_context_snapshot') THEN
    RAISE EXCEPTION 'privacy_authorization_sink_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.subject_id IS DISTINCT FROM snap.interview_id THEN
    RAISE EXCEPTION 'privacy_authorization_subject_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.request_epoch IS NULL OR target_row.request_epoch <> snap.privacy_epoch THEN
    RAISE EXCEPTION 'privacy_authorization_epoch_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.request_digest IS NULL OR target_row.request_digest <> snap.target_set_digest THEN
    RAISE EXCEPTION 'privacy_authorization_digest_mismatch' USING ERRCODE='42501';
  END IF;

  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO live_digest
    FROM privacy_deletion_target d
   WHERE d.request_id = target_row.request_id;
  IF live_digest IS DISTINCT FROM target_row.request_digest THEN
    RAISE EXCEPTION 'privacy_authorization_target_drift' USING ERRCODE='42501';
  END IF;

  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RETURN;
  END IF;
  IF target_row.status = 'erased' THEN
    RETURN QUERY SELECT target_row.id, target_row.lease_token, target_row.status, target_row.attempts;
    RETURN;
  END IF;
  IF target_row.status = 'leased' AND target_row.lease_expires_at >= now() THEN
    RETURN;
  END IF;
  IF target_row.status NOT IN ('pending','leased','failed') THEN
    RETURN;
  END IF;

  token := gen_random_uuid();
  UPDATE privacy_deletion_target AS d
     SET status='leased', lease_owner=p_worker, lease_token=token,
         lease_expires_at=now()+(p_lease_seconds||' seconds')::interval,
         attempts=d.attempts+1, version=d.version+1, updated_at=now(), last_error_code=NULL
   WHERE d.id = target_row.id AND d.version = target_row.version
   RETURNING d.id, d.lease_token, d.status, d.attempts INTO target_id, lease_token, status, attempt;
  IF NOT FOUND THEN RETURN; END IF;
  RETURN NEXT;
END $$;


GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION privacy_authorization_claim_memory_target(text,uuid,text,integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_authorization_claim_memory_target(text,uuid,text,integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_authorization_claim_memory_target(text,uuid,text,integer) TO privacy_worker_executor;

-- ── 删除侧物理清除（OWNER privacy_worker_owner，EXECUTE privacy_worker_executor）───
-- 每个 sink 一个明确的删除动作，删除后校验残留=0（未知 locator/残留≠0 一律 fail-closed）。
CREATE OR REPLACE FUNCTION privacy_purge_memory_target(
  p_target uuid,
  p_token uuid
) RETURNS TABLE (target_id uuid, status text, deleted_count bigint, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  target_row record;
  removed bigint := 0;
  remaining bigint := 0;
  final_request_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_token IS NULL THEN
    RAISE EXCEPTION 'privacy_target_purge_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.id, t.request_id, t.status, t.lease_token, t.lease_expires_at, t.version, t.sink,
         r.owner_user_id, r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'privacy_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RAISE EXCEPTION 'privacy_target_request_not_active' USING ERRCODE='42501';
  END IF;
  IF target_row.status = 'erased' THEN
    RETURN QUERY SELECT target_row.id, 'erased'::text, 0::bigint, target_row.request_status;
    RETURN;
  END IF;
  IF target_row.status <> 'leased' OR target_row.lease_token IS DISTINCT FROM p_token
     OR target_row.lease_expires_at < now() THEN
    RAISE EXCEPTION 'privacy_target_lease_lost' USING ERRCODE='42501';
  END IF;

  -- 逐 sink 明确删除动作；未知 locator（保留 sink 或未来 sink）一律 fail-closed。
  IF target_row.sink = 'memory_fact' THEN
    DELETE FROM memory_fact WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM memory_fact WHERE owner_user_id = principal;
  ELSIF target_row.sink = 'memory_embedding' THEN
    DELETE FROM memory_index_generation WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM memory_index_generation WHERE owner_user_id = principal;
  ELSIF target_row.sink = 'memory_context_snapshot' THEN
    DELETE FROM memory_context_snapshot WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM memory_context_snapshot WHERE owner_user_id = principal;
  ELSE
    RAISE EXCEPTION 'memory_target_locator_unknown' USING ERRCODE='42501';
  END IF;
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'memory_target_residual_rows' USING ERRCODE='55000';
  END IF;

  UPDATE privacy_deletion_target AS d
     SET status='erased', deleted_count=removed,
         receipt_hash=encode(digest(d.id::text || ':' || p_token::text || ':' || removed::text, 'sha256'),'hex'),
         lease_owner=NULL, lease_token=NULL, lease_expires_at=NULL, version=d.version+1, updated_at=now()
   WHERE d.id = target_row.id AND d.status='leased' AND d.lease_token=p_token AND d.version=target_row.version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_target_complete_cas_lost' USING ERRCODE='40001';
  END IF;

  -- 与 0078 的最终 CASE 对齐：把 receipts 纳入判定，避免触发 no-forge-completed guard 回滚
  -- 已完成的物理删除（external_pending/failed_cleanup → pending_external/partial_failed）。
  UPDATE privacy_erasure_request AS r
     SET status=CASE
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status IN ('pending','leased')) THEN 'purging'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='external_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='retention_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='failed_cleanup') THEN 'partial_failed'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='failed') THEN 'partial_failed'
       ELSE 'completed' END,
       version=r.version+1, updated_at=now()
   WHERE r.id=target_row.request_id
   RETURNING r.status INTO final_request_status;
  RETURN QUERY SELECT target_row.id, 'erased'::text, removed, final_request_status;
END $$;
ALTER FUNCTION privacy_purge_memory_target(uuid,uuid) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;


REVOKE ALL ON FUNCTION privacy_purge_memory_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_memory_target(uuid,uuid) TO privacy_worker_executor;

-- runtime login 永不通过 membership 漂移成为 memory_runtime 或 privacy worker（防漂移）。
REVOKE memory_runtime, privacy_issuer, privacy_worker_executor FROM app_role;
