-- 0095_memory_admission_metadata_gate.sql
--
-- MEM-12（准入/来源/范围元标签门）的数据库真相：跨会话写入**之前**的准入门。在 0093（MEM-00
-- 的存储/召回/删除数据面）**之上叠加**，不重建、不回退 0093 的 5 张表与函数，也不给
-- user_memory / memory_fact 加列——这是「新建受控数据面」，落在两张新表 + 两个 SECURITY
-- DEFINER 函数上。
--
-- 四个交付物逐条落地：
--  1. 三身份拆分落库：access_principal_user_id（请求者）/ controller_scope（谁控制保留与撤回）
--     / data_subject_type+data_subject_id（内容关于谁）/ thread_boundary（线程/项目边界）。
--     全部由**服务端授权快照**派生，绝不接受客户端 owner/purpose/project/factKey/scope 作为
--     事实；首期 controller_scope 固定 C-personal；dataSubject 不能由「当前登录者」推断（必须
--     显式声明 + 交叉校验真实账户）；无稳定 Project 域对象前**没有 projectId 字段**。
--  2. 完整元标签模型 + 服务端 fail-closed 校验：§1.1 的元标签集（controllerScope/dataSubject/
--     scopeKind/thread 边界/purpose/allowedDataClass/consentRevision/privacyEpoch/expiresAt/
--     sourceType/sourceEntityId/immutableSourceVersion/eventSeq·sourceRange/sourceArtifactDigest/
--     spanLocator/normalizationRecipeVersion/producerClass/extractionRecipeVersion/
--     verificationRecipeVersion/status/policyVersion/contentDigest/embeddingRecipe·generation/
--     language）全部落列；缺字段/伪造/越界一律 RAISE（零写入）。
--  3. spanLocator 单一坐标系：固定 UTF-8 字节偏移（offsetKind='utf8_byte'）。理由：digest 与
--     字节长度都对 UTF-8 字节计算，且 PostgreSQL `octet_length()` 原生返回 UTF-8 字节数，跨层
--     byte-for-byte 一致；UTF-16（JS string 下标）与 Unicode code-point（NFC/NFD 计数漂移）都被
--     拒绝。
--  4. 六分量分离：source_trust（服务端按 source_type 派生）/ extraction_confidence（客户端自报
--     0..1）/ verification_state（**准入期恒 'unverified'**；business_verified/user_confirmed 只由
--     MEM-13 服务端证据路径授予，客户端 producerClass 不可自动升 trusted）/ expires_at（freshness）
--     / salience（0..1）/ retrieval_score（**准入期恒 NULL**，召回时排序候选用）。retrievalScore
--     不可覆盖 sourceTrust；status 准入期恒 'candidate'（模型输出不可升 active；激活属 MEM-13）。
--
-- 四原语对齐：RLS principal 绑定（两表 FORCE RLS + access_principal_user_id=principal）、幂等键
-- （memory_admission_record UNIQUE(principal,idempotency_key) + 重放返回既有行）、持久有序事件日志
-- （准入走 0093 的 memory_append_audit）、CAS（准入本身是纯 INSERT，无状态转移；candidate→active 的
-- CAS 属 MEM-13，本迁移不越界）。
--
-- 铁律：不落 PII / 全文答案 / 完整 prompt；source_text 仅瞬时重算 digest+字节长度，**绝不落库**。

-- ── 角色：memory_admission_issuer（服务端签发器，NOLOGIN NOBYPASSRLS）─────────────────
-- 与 privacy_issuer 同纪律：准入授权快照只能由这个「服务端 seam」签发，runtime(app_role) 无
-- 任何写权。issuer 是 NOLOGIN 固定 owner，其函数受 FORCE RLS 约束，不能借 owner 权绕过 RLS。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='memory_admission_issuer') THEN
    CREATE ROLE memory_admission_issuer NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO memory_admission_issuer;

-- ── memory_admission_authorization：服务端授权快照（三身份 + 服务端声明元数据）──────────
-- 这是「服务端授权快照」的落库形态：issuer 固定 actor/data subject/controller scope/用途/来源
-- 范围/consent revision/privacy epoch/有效期，并**重算** source artifact digest 与 UTF-8 字节
-- 长度。runtime 无原始写权，只能引用 snapshot_key。
DROP TABLE IF EXISTS memory_admission_authorization CASCADE;
CREATE TABLE memory_admission_authorization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_key text NOT NULL,                           -- 服务端签发的不透明引用（防重放，非幂等：重复 key 即拒 23505）
  access_principal_user_id text NOT NULL,               -- accessPrincipalContext：本次请求者（= app.principal_user）
  controller_scope text NOT NULL CHECK (controller_scope = 'c_personal'),  -- 首期仅 C 端个人范围（B 端非法）
  data_subject_type text NOT NULL CHECK (data_subject_type = 'c_personal_user'),
  data_subject_id text NOT NULL,                        -- 内容关于谁（显式声明，非「当前登录者」推断）
  thread_boundary text NOT NULL,                        -- 线程/会话边界（无 Project 域对象前，无 projectId）
  scope_kind text NOT NULL DEFAULT 'personal' CHECK (scope_kind = 'personal'),
  purpose text NOT NULL CHECK (purpose IN ('interview_prep','career','preference','self_improvement')),
  allowed_data_class text NOT NULL CHECK (allowed_data_class IN ('derived_fact','dimension_label','topic','preference')),
  consent_revision bigint NOT NULL CHECK (consent_revision >= 1),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  source_type text NOT NULL CHECK (source_type IN ('conversation_event','business_fact','user_confirmation','model_summary')),
  source_entity_id text NOT NULL,                       -- 来源工件 id（服务端声明，非客户端 sourceId）
  immutable_source_version text NOT NULL,               -- 来源工件不可变版本
  event_seq_start bigint CHECK (event_seq_start IS NULL OR event_seq_start >= 1),
  event_seq_end bigint CHECK (event_seq_end IS NULL OR (event_seq_start IS NOT NULL AND event_seq_end >= event_seq_start)),
  source_artifact_digest text NOT NULL CHECK (source_artifact_digest ~ '^[a-f0-9]{64}$'),  -- sha256(UTF-8 source_text)
  source_utf8_byte_length bigint NOT NULL CHECK (source_utf8_byte_length >= 0),            -- octet_length(source_text)
  normalization_recipe_version text NOT NULL,
  policy_version text NOT NULL,
  source_trust text NOT NULL CHECK (source_trust IN ('trusted','untrusted')),              -- 服务端按 source_type 派生
  expires_at timestamptz,                               -- 快照有效期（过期不可准入）
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- 命名唯一约束：供 issuer 函数 `ON CONFLICT ON CONSTRAINT` 引用（避免 RETURN TABLE 输出
  -- 变量 snapshot_key 与表列 snapshot_key 的 PL/pgSQL 歧义）。
  CONSTRAINT memory_admission_authorization_snapshot_key_uq UNIQUE (snapshot_key)
);

GRANT CREATE ON SCHEMA public TO memory_admission_issuer;
ALTER TABLE memory_admission_authorization ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_admission_authorization FORCE ROW LEVEL SECURITY;

-- ── memory_admission_record：准入记录（完整 §1.1 元标签集 + 六分量）───────────────────
-- 准入门产出「candidate」的元数据记录；内容正文不落本表（content_digest 是候选信号），事实正文
-- 与激活状态机走 0093 的 memory_fact + MEM-13 的 confirm。
DROP TABLE IF EXISTS memory_admission_record CASCADE;
CREATE TABLE memory_admission_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 三身份（服务端派生，非客户端字段）
  access_principal_user_id text NOT NULL,
  controller_scope text NOT NULL CHECK (controller_scope = 'c_personal'),
  data_subject_type text NOT NULL CHECK (data_subject_type = 'c_personal_user'),
  data_subject_id text NOT NULL,
  thread_boundary text NOT NULL,
  scope_kind text NOT NULL DEFAULT 'personal' CHECK (scope_kind = 'personal'),
  fact_key text NOT NULL,                               -- 服务端派生（scope+subject+purpose+source 身份），客户端无字段可传
  -- 元标签集（§1.1）
  purpose text NOT NULL CHECK (purpose IN ('interview_prep','career','preference','self_improvement')),
  allowed_data_class text NOT NULL CHECK (allowed_data_class IN ('derived_fact','dimension_label','topic','preference')),
  consent_revision bigint NOT NULL CHECK (consent_revision >= 1),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  expires_at timestamptz,                               -- freshness·expiresAt
  source_type text NOT NULL CHECK (source_type IN ('conversation_event','business_fact','user_confirmation','model_summary')),
  source_entity_id text NOT NULL,
  immutable_source_version text NOT NULL,
  event_seq_start bigint CHECK (event_seq_start IS NULL OR event_seq_start >= 1),
  event_seq_end bigint CHECK (event_seq_end IS NULL OR (event_seq_start IS NOT NULL AND event_seq_end >= event_seq_start)),
  source_artifact_digest text NOT NULL CHECK (source_artifact_digest ~ '^[a-f0-9]{64}$'),
  span_locator jsonb NOT NULL,                          -- {offsetKind:'utf8_byte', start, end}
  normalization_recipe_version text NOT NULL,
  producer_class text NOT NULL CHECK (producer_class IN ('summarizer','fact_extractor','classifier','business_validator','user')),
  extraction_recipe_version text,
  verification_recipe_version text,
  policy_version text NOT NULL,
  content_digest text NOT NULL CHECK (content_digest ~ '^[a-f0-9]{64}$'),
  embedding_recipe text,                                -- MEM-05/11 未建，准入期恒 NULL（列存在，后续索引生成回填）
  embedding_generation text,
  language text NOT NULL CHECK (language ~ '^[a-z]{2}(-[A-Za-z0-9]+)?$'),
  -- 六分量分离（互不推导的独立轴）
  source_trust text NOT NULL CHECK (source_trust IN ('trusted','untrusted')),
  extraction_confidence real NOT NULL CHECK (extraction_confidence >= 0 AND extraction_confidence <= 1),
  verification_state text NOT NULL CHECK (verification_state IN ('unverified','user_confirmed','business_verified')),
  salience real NOT NULL DEFAULT 1.0 CHECK (salience >= 0 AND salience <= 1),
  retrieval_score real CHECK (retrieval_score IS NULL), -- 准入期恒 NULL（召回时瞬态排序值，绝不回填落列）；CHECK 结构封死
  status text NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate','awaiting_confirmation','active','rejected')),
  idempotency_key text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_admission_record_owner_idem_uq UNIQUE (access_principal_user_id, idempotency_key)
);
CREATE INDEX memory_admission_record_owner_status_idx ON memory_admission_record (access_principal_user_id, status);
ALTER TABLE memory_admission_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_admission_record FORCE ROW LEVEL SECURITY;

-- ── 表级 ACL：runtime（app_role）无任何原始读/写（负路径承重）────────────────────────
REVOKE ALL ON memory_admission_authorization, memory_admission_record FROM PUBLIC, app_role;
-- issuer（签发器）写快照；memory_runtime（准入数据面函数 owner）读快照 + 写记录。
GRANT SELECT, INSERT ON memory_admission_authorization TO memory_admission_issuer;
GRANT SELECT ON memory_admission_authorization TO memory_runtime;
GRANT SELECT, INSERT, UPDATE ON memory_admission_record TO memory_runtime;

-- ── 账户主体存在性校验所需的 user_account 读取面（镜像 0093 的 privacy_api_owner 模式）──
-- dataSubject 交叉校验需要读 user_account（FORCE RLS）；只授 SELECT + self 策略，绝不给
-- UPDATE/INSERT（防经此 role 伪造账户）。
GRANT SELECT ON user_account TO memory_admission_issuer;
DROP POLICY IF EXISTS p_user_account_memory_admission_issuer ON user_account;
CREATE POLICY p_user_account_memory_admission_issuer ON user_account
  FOR SELECT TO memory_admission_issuer
  USING (id = current_setting('app.principal_user', true));

-- ── 同意 cross-check 所需的 memory_consent 读取面（HIGH-1：无同意不采集的铁律）────────
-- memory_issue_admission_snapshot 必须在签发前对照 memory_consent 验证存在 granted 且
-- revision/epoch 匹配的同意（防 consent_revision/privacy_epoch fail-open）。memory_consent 在
-- 0093 已 FORCE RLS 且只授 memory_runtime/privacy_api_owner；memory_admission_issuer 需要最小
-- SELECT 读取面 + self 策略，才能 SECURITY DEFINER 下读到本 owner 的 consent。绝不给
-- UPDATE/INSERT（防经此 role 伪造/撤回同意）。注意：本签发器**只能普通 SELECT、不能 FOR SHARE**——
-- FOR SHARE/FOR KEY SHARE 实际要求 UPDATE 权（PostgreSQL 锁模式固有约束，与 NOBYPASSRLS 无关），
-- 本 role 对 memory_consent 只持最小 SELECT，故不可 FOR SHARE（否则 42501）。这与 0093
-- memory_record_fact 不冲突：其 owner memory_runtime 在 0093 同时持 memory_consent 的
-- SELECT+INSERT+UPDATE（满足 UPDATE 权），本 role 只有最小 SELECT。详见下方函数注释。
GRANT SELECT ON memory_consent TO memory_admission_issuer;
DROP POLICY IF EXISTS p_memory_consent_memory_admission_issuer ON memory_consent;
CREATE POLICY p_memory_consent_memory_admission_issuer ON memory_consent
  FOR SELECT TO memory_admission_issuer
  USING (owner_user_id = current_setting('app.principal_user', true));

-- ── RLS 策略：全部 FORCE + access_principal_user_id=principal 绑定（四原语之③）──────
DO $$
BEGIN
  DROP POLICY IF EXISTS memory_admission_authorization_issuer ON memory_admission_authorization;
  CREATE POLICY memory_admission_authorization_issuer ON memory_admission_authorization
    FOR ALL TO memory_admission_issuer
    USING (access_principal_user_id = current_setting('app.principal_user', true))
    WITH CHECK (access_principal_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_admission_authorization_runtime ON memory_admission_authorization;
  CREATE POLICY memory_admission_authorization_runtime ON memory_admission_authorization
    FOR SELECT TO memory_runtime
    USING (access_principal_user_id = current_setting('app.principal_user', true));

  DROP POLICY IF EXISTS memory_admission_record_runtime ON memory_admission_record;
  CREATE POLICY memory_admission_record_runtime ON memory_admission_record
    FOR ALL TO memory_runtime
    USING (access_principal_user_id = current_setting('app.principal_user', true))
    WITH CHECK (access_principal_user_id = current_setting('app.principal_user', true));
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 准入数据面函数
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 服务端签发授权快照（OWNER memory_admission_issuer，EXECUTE 仅 issuer）─────────────
-- 三身份从 app.principal_user（accessPrincipalContext）派生；controller_scope 固定 c_personal；
-- dataSubject 必须显式声明且（首期 C-personal）必须等于已认证 principal 并存在真实账户——
-- 不可由「当前登录者」静默推断，也不可伪造为他人/B 端候选。source 摘要与 UTF-8 字节长度由
-- 服务端**重算**（digest + octet_length），绝不采信客户端。
CREATE OR REPLACE FUNCTION memory_issue_admission_snapshot(
  p_snapshot_key text,
  p_data_subject_id text,
  p_thread_boundary text,
  p_purpose text,
  p_allowed_data_class text,
  p_consent_revision bigint,
  p_privacy_epoch bigint,
  p_source_type text,
  p_source_entity_id text,
  p_immutable_source_version text,
  p_event_seq_start bigint,
  p_event_seq_end bigint,
  p_normalization_recipe_version text,
  p_source_text text,
  p_policy_version text,
  p_expires_at timestamptz
) RETURNS TABLE (
  snapshot_id uuid, snapshot_key text, controller_scope text, data_subject_id text,
  access_principal_user_id text, thread_boundary text, purpose text,
  source_artifact_digest text, source_utf8_byte_length bigint, source_trust text, expires_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_digest text;
  v_byte_len bigint;
  v_source_trust text;
  v_id uuid;
BEGIN
  -- 铁律：缺字段/非法枚举/越界一律 fail-closed（零写入）。
  IF principal IS NULL OR length(principal)=0
     OR p_snapshot_key IS NULL OR length(p_snapshot_key)=0
     OR p_data_subject_id IS NULL OR length(p_data_subject_id)=0
     OR p_thread_boundary IS NULL OR length(p_thread_boundary)=0
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement')
     OR p_allowed_data_class NOT IN ('derived_fact','dimension_label','topic','preference')
     OR p_consent_revision IS NULL OR p_consent_revision < 1
     OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1
     OR p_source_type NOT IN ('conversation_event','business_fact','user_confirmation','model_summary')
     OR p_source_entity_id IS NULL OR length(p_source_entity_id)=0
     OR p_immutable_source_version IS NULL OR length(p_immutable_source_version)=0
     OR (p_event_seq_start IS NOT NULL AND p_event_seq_start < 1)
     OR (p_event_seq_end IS NOT NULL AND (p_event_seq_start IS NULL OR p_event_seq_end < p_event_seq_start))
     OR p_normalization_recipe_version IS NULL OR length(p_normalization_recipe_version)=0
     OR p_source_text IS NULL
     OR p_policy_version IS NULL OR length(p_policy_version)=0 THEN
    RAISE EXCEPTION 'memory_admission_issue_invalid' USING ERRCODE='22023';
  END IF;

  -- 三身份派生（服务端）：
  --  - accessPrincipalContext = app.principal_user（本函数不接收 actor 参数，杜绝自报）。
  --  - controllerScope 固定 'c_personal'（首期唯一合法范围，B 端范围不可伪造——没有参数可传）。
  --  - dataSubject 显式声明 + 交叉校验：首期 C-personal 下 subject 必须等于已认证 principal，且
  --    必须是真实存在的账户。这不是「从登录者推断 subject」——subject 被强制显式传入并受两重
  --    校验（==principal + 账户存在），任何伪造/越权 subject 都在此 fail-closed。
  IF p_data_subject_id IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'memory_admission_subject_forbidden' USING ERRCODE='42501';
  END IF;
  PERFORM 1 FROM user_account ua WHERE ua.id = p_data_subject_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_admission_subject_not_found' USING ERRCODE='42501';
  END IF;

  -- 无同意不采集（fail-closed，HIGH-1）：签发快照前必须存在 granted 且 revision/epoch 匹配的
  -- consent，否则零写入。客户端传 consent_revision=9999 / privacy_epoch 不符，或 consent 已撤回，
  -- 一律在此 RAISE。data_subject_id 已在上方强制 == principal，故按 (data_subject, purpose)
  -- 校验即按 (owner, purpose) 校验。
  --
  -- 为何此处**刻意省略 FOR SHARE**：本函数 OWNER 是 memory_admission_issuer，该 role 对
  -- memory_consent 只持最小 SELECT（绝不给 UPDATE/INSERT，防经此 role 伪造/撤回同意）。而
  -- FOR SHARE/FOR KEY SHARE 实际要求 UPDATE 权（PostgreSQL 锁模式固有约束，与 NOBYPASSRLS
  -- 无关），故 issuer 侧**不可**用 FOR SHARE（否则 42501）；0093 memory_record_fact 能用
  -- FOR SHARE 是因为其 owner memory_runtime 同时持 SELECT+INSERT+UPDATE，与本 role 的最小
  -- SELECT 面不同。
  --
  -- 省略 FOR SHARE **不削弱**「无同意不采集」：快照是「签发时刻已核验」的不可变授权证据，不落
  -- 用户内容；真正的采集发生在 memory_admit_record，它在 INSERT 前会对 live consent 做一次
  -- FOR SHARE 复验（owner memory_runtime 持 UPDATE 权，可安全 FOR SHARE）——「签发后撤回仍
  -- admit」在 admit 边界被二次把关，无需在 issuer 侧用锁 ACL 换掉最小权限。
  PERFORM 1 FROM memory_consent mc
   WHERE mc.owner_user_id = p_data_subject_id
     AND mc.purpose = p_purpose
     AND mc.status = 'granted'
     AND mc.consent_revision = p_consent_revision
     AND mc.privacy_epoch = p_privacy_epoch;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_admission_consent_missing' USING ERRCODE='42501';
  END IF;

  -- 来源摘要与 UTF-8 字节长度由服务端重算（绝不采信客户端）；octet_length 即 UTF-8 字节数，
  -- 与 packages/domain 的 utf8ByteLength(TextEncoder) 逐字节一致。
  v_digest := encode(digest(p_source_text, 'sha256'), 'hex');
  v_byte_len := octet_length(p_source_text);
  -- source_trust 只由 source_type 派生：业务事实/用户确认 → trusted；模型/会话派生 → untrusted。
  v_source_trust := CASE WHEN p_source_type IN ('business_fact','user_confirmation') THEN 'trusted' ELSE 'untrusted' END;

  INSERT INTO memory_admission_authorization (
    snapshot_key, access_principal_user_id, controller_scope, data_subject_type, data_subject_id,
    thread_boundary, scope_kind, purpose, allowed_data_class, consent_revision, privacy_epoch,
    source_type, source_entity_id, immutable_source_version, event_seq_start, event_seq_end,
    source_artifact_digest, source_utf8_byte_length, normalization_recipe_version, policy_version,
    source_trust, expires_at
  ) VALUES (
    p_snapshot_key, principal, 'c_personal', 'c_personal_user', p_data_subject_id,
    p_thread_boundary, 'personal', p_purpose, p_allowed_data_class, p_consent_revision, p_privacy_epoch,
    p_source_type, p_source_entity_id, p_immutable_source_version, p_event_seq_start, p_event_seq_end,
    v_digest, v_byte_len, p_normalization_recipe_version, p_policy_version,
    v_source_trust, p_expires_at
  ) ON CONFLICT ON CONSTRAINT memory_admission_authorization_snapshot_key_uq DO NOTHING
  RETURNING memory_admission_authorization.id INTO v_id;
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'memory_admission_snapshot_key_conflict' USING ERRCODE='23505';
  END IF;

  RETURN QUERY SELECT v_id, p_snapshot_key, 'c_personal', p_data_subject_id, principal,
    p_thread_boundary, p_purpose, v_digest, v_byte_len, v_source_trust, p_expires_at;
END $$;

ALTER FUNCTION memory_issue_admission_snapshot(text,text,text,text,text,bigint,bigint,text,text,text,bigint,bigint,text,text,text,timestamptz) OWNER TO memory_admission_issuer;
REVOKE CREATE ON SCHEMA public FROM memory_admission_issuer;


REVOKE ALL ON FUNCTION memory_issue_admission_snapshot(text,text,text,text,text,bigint,bigint,text,text,text,bigint,bigint,text,text,text,timestamptz) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION memory_issue_admission_snapshot(text,text,text,text,text,bigint,bigint,text,text,text,bigint,bigint,text,text,text,timestamptz) TO memory_admission_issuer;

-- ── 准入记录（OWNER memory_runtime，EXECUTE app_role）───────────────────────────────
-- 客户端只提交「待验证材料」（snapshotKey + sourceText + sourceSpan + producerClass +
-- extractionConfidence + salience + language + contentDigest + idempotencyKey）；三身份与
-- 全部范围/用途/同意/epoch/来源元数据一律从快照派生。owner/purpose/project/factKey/scope/
-- sourceId 没有参数可传，无法伪造。
CREATE OR REPLACE FUNCTION memory_admit_record(
  p_snapshot_key text,
  p_source_text text,
  p_source_span jsonb,
  p_producer_class text,
  p_extraction_confidence real,
  p_salience real,
  p_language text,
  p_content_digest text,
  p_idempotency_key text
) RETURNS TABLE (
  id uuid, status text, fact_key text, controller_scope text, data_subject_id text,
  access_principal_user_id text, thread_boundary text, source_trust text, verification_state text,
  retrieval_score real, created boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  snap memory_admission_authorization%ROWTYPE;
  v_span_offset_kind text;
  v_span_start bigint;
  v_span_end bigint;
  v_recomputed_digest text;
  v_recomputed_byte_len bigint;
  v_fact_key text;
  v_id uuid;
  v_created boolean := true;
BEGIN
  -- 铁律：无 principal / 缺字段 / 越界 / 非法枚举一律 fail-closed（零写入）。
  IF principal IS NULL OR length(principal)=0
     OR p_snapshot_key IS NULL OR length(p_snapshot_key)=0
     OR p_source_text IS NULL
     OR p_source_span IS NULL OR jsonb_typeof(p_source_span) <> 'object'
     OR p_producer_class NOT IN ('summarizer','fact_extractor','classifier','business_validator','user')
     OR p_extraction_confidence IS NULL OR p_extraction_confidence < 0 OR p_extraction_confidence > 1
     OR p_salience IS NULL OR p_salience < 0 OR p_salience > 1
     OR p_language IS NULL OR p_language !~ '^[a-z]{2}(-[A-Za-z0-9]+)?$'
     OR p_content_digest IS NULL OR p_content_digest !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'memory_admission_invalid' USING ERRCODE='22023';
  END IF;

  -- 三身份从服务端授权快照派生；快照必须属于当前已认证 principal（RLS 之上再硬校验）。
  -- 快照表是「签发器只 INSERT、永不 UPDATE/DELETE」的不可变对象，无需 FOR SHARE 行锁；且本
  -- 函数 OWNER memory_runtime 对 memory_admission_authorization 只持 SELECT（0095:143），而
  -- FOR SHARE/FOR KEY SHARE 实际要求 UPDATE 权（PostgreSQL 锁模式固有约束，与 NOBYPASSRLS
  -- 无关），故不可也不需要对快照表加 FOR SHARE。
  SELECT * INTO snap FROM memory_admission_authorization a
   WHERE a.snapshot_key = p_snapshot_key;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_admission_snapshot_not_found' USING ERRCODE='42501';
  END IF;
  IF snap.access_principal_user_id IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'memory_admission_owner_mismatch' USING ERRCODE='42501';
  END IF;
  IF snap.controller_scope <> 'c_personal' THEN
    RAISE EXCEPTION 'memory_admission_scope_forbidden' USING ERRCODE='42501';
  END IF;
  IF snap.expires_at IS NOT NULL AND snap.expires_at <= now() THEN
    RAISE EXCEPTION 'memory_admission_snapshot_expired' USING ERRCODE='40901';
  END IF;

  -- spanLocator 坐标系固定 utf8_byte：拒绝 code-point/UTF-16；start/end 非负整数且半开区间合法。
  v_span_offset_kind := p_source_span->>'offsetKind';
  IF v_span_offset_kind IS DISTINCT FROM 'utf8_byte' THEN
    RAISE EXCEPTION 'memory_admission_span_offset_kind_invalid' USING ERRCODE='22023';
  END IF;
  -- start/end 必须是整数字面量：非数值文本(22P02)与超 bigint(22003)统一收敛为 22023，保证
  -- span 伪造/越界统一 fail-closed，而不是把底层 cast 错误码漏给调用方。
  BEGIN
    v_span_start := (p_source_span->>'start')::bigint;
    v_span_end := (p_source_span->>'end')::bigint;
  EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN
    RAISE EXCEPTION 'memory_admission_span_range_invalid' USING ERRCODE='22023';
  END;
  IF v_span_start IS NULL OR v_span_end IS NULL OR v_span_start < 0 OR v_span_end < v_span_start THEN
    RAISE EXCEPTION 'memory_admission_span_range_invalid' USING ERRCODE='22023';
  END IF;

  -- 来源工件摘要与字节长度**重算**，必须与快照逐字节一致（改内容不改摘要 / NFC↔NFD 漂移 /
  -- 伪造 sourceId 对应的内容 = 零写入）。
  v_recomputed_digest := encode(digest(p_source_text, 'sha256'), 'hex');
  v_recomputed_byte_len := octet_length(p_source_text);
  IF v_recomputed_digest IS DISTINCT FROM snap.source_artifact_digest
     OR v_recomputed_byte_len IS DISTINCT FROM snap.source_utf8_byte_length THEN
    RAISE EXCEPTION 'memory_admission_source_artifact_mismatch' USING ERRCODE='22023';
  END IF;
  -- span 必须落在 UTF-8 字节范围内（越界 = 零写入；中文/emoji 多字节下 UTF-16 下标必然错位）。
  IF v_span_end > snap.source_utf8_byte_length THEN
    RAISE EXCEPTION 'memory_admission_span_out_of_bounds' USING ERRCODE='22023';
  END IF;

  -- 六分量分离：source_trust 取快照（服务端派生，客户端无字段可传）；verification_state 准入期
  -- 钉死 'unverified'——business_verified/user_confirmed 只由 MEM-13 服务端证据路径授予，客户端
  -- producerClass（business_validator/user）不可自动升 trusted，仅落列作未采信元数据；retrieval_score
  -- 准入期恒 NULL（召回时排序候选用，禁止在此提升可信度）；status 恒 'candidate'（模型输出不可
  -- 升 active，active 属 MEM-13 确认状态机）。
  -- fact_key 服务端派生（客户端无字段可传）：scope + subject + purpose + source 身份。
  v_fact_key := concat_ws(':', snap.controller_scope, snap.data_subject_id, snap.purpose, snap.source_type, snap.source_entity_id);

  -- 幂等重放：同 principal 同幂等键返回既有行（不双写、不新建）。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT r.id INTO v_id FROM memory_admission_record r
     WHERE r.access_principal_user_id = principal AND r.idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN QUERY SELECT r.id, r.status, r.fact_key, r.controller_scope, r.data_subject_id,
        r.access_principal_user_id, r.thread_boundary, r.source_trust, r.verification_state,
        r.retrieval_score, false
        FROM memory_admission_record r WHERE r.id = v_id;
      RETURN;
    END IF;
  END IF;

  -- HIGH-1 无同意不采集（admit 期二次复验，准入边界 fail-closed）：快照是「签发时刻」的不可变
  -- 授权证据，可能已陈旧——同意「签发→撤回」后，快照里的 consent_revision/privacy_epoch 仍是
  -- 签发时的旧值，若不回查 live consent，「撤回后仍 admit」不会被拦截。故在 INSERT 前对
  -- memory_consent 做一次 FOR SHARE 复验：谓词要求 live 当前状态与快照逐字段一致（owner/purpose/
  -- status='granted'/revision/epoch），任一不匹配即 RAISE（与 issue 期 fail-closed 语义一致）。
  --
  -- 为何此处**可以**安全用 FOR SHARE：本函数 OWNER 是 memory_runtime（0095:477），且
  -- memory_runtime 在 0093 对 memory_consent 持 SELECT+INSERT+UPDATE（0093:197），满足
  -- FOR SHARE/FOR KEY SHARE 对 UPDATE 权的要求（锁模式固有约束，与 NOBYPASSRLS 无关）；签发器
  -- memory_admission_issuer 对 memory_consent 只持最小 SELECT（0095:164），故在 issuer 侧不可
  -- FOR SHARE。FOR SHARE 锁住 consent 行、与 revoke 的 UPDATE 互斥，保证「复验通过 → INSERT」
  -- 之间 consent 不会被并发撤回。
  PERFORM 1 FROM memory_consent mc
   WHERE mc.owner_user_id = snap.data_subject_id
     AND mc.purpose = snap.purpose
     AND mc.status = 'granted'
     AND mc.consent_revision = snap.consent_revision
     AND mc.privacy_epoch = snap.privacy_epoch
   FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_admission_consent_revoked' USING ERRCODE='42501';
  END IF;

  INSERT INTO memory_admission_record (
    access_principal_user_id, controller_scope, data_subject_type, data_subject_id, thread_boundary,
    scope_kind, fact_key, purpose, allowed_data_class, consent_revision, privacy_epoch, expires_at,
    source_type, source_entity_id, immutable_source_version, event_seq_start, event_seq_end,
    source_artifact_digest, span_locator, normalization_recipe_version, producer_class,
    extraction_recipe_version, verification_recipe_version, policy_version, content_digest,
    embedding_recipe, embedding_generation, language,
    source_trust, extraction_confidence, verification_state, salience, retrieval_score, status, idempotency_key
  ) VALUES (
    principal, snap.controller_scope, snap.data_subject_type, snap.data_subject_id, snap.thread_boundary,
    snap.scope_kind, v_fact_key, snap.purpose, snap.allowed_data_class, snap.consent_revision, snap.privacy_epoch, snap.expires_at,
    snap.source_type, snap.source_entity_id, snap.immutable_source_version, snap.event_seq_start, snap.event_seq_end,
    snap.source_artifact_digest, p_source_span, snap.normalization_recipe_version, p_producer_class,
    NULL, NULL, snap.policy_version, p_content_digest,
    NULL, NULL, p_language,
    snap.source_trust, p_extraction_confidence, 'unverified', p_salience, NULL, 'candidate', p_idempotency_key
  ) RETURNING memory_admission_record.id INTO v_id;

  -- 持久有序事件日志（复用 0093 的 memory_append_audit）。
  PERFORM memory_append_audit('memadmit:'||v_id, 'admit',
    jsonb_build_object('record_id', v_id, 'fact_key', v_fact_key, 'purpose', snap.purpose), 'admit');

  RETURN QUERY SELECT r.id, r.status, r.fact_key, r.controller_scope, r.data_subject_id,
    r.access_principal_user_id, r.thread_boundary, r.source_trust, r.verification_state,
    r.retrieval_score, v_created
    FROM memory_admission_record r WHERE r.id = v_id;
EXCEPTION WHEN unique_violation THEN
  -- 幂等键并发撞车：回查既有行返回（幂等，不抛）。
  IF p_idempotency_key IS NOT NULL THEN
    RETURN QUERY SELECT r.id, r.status, r.fact_key, r.controller_scope, r.data_subject_id,
      r.access_principal_user_id, r.thread_boundary, r.source_trust, r.verification_state,
      r.retrieval_score, false
      FROM memory_admission_record r
     WHERE r.access_principal_user_id = principal AND r.idempotency_key = p_idempotency_key;
    RETURN;
  END IF;
  RAISE;
END $$;


GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER FUNCTION memory_admit_record(text,text,jsonb,text,real,real,text,text,text) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION memory_admit_record(text,text,jsonb,text,real,real,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_admit_record(text,text,jsonb,text,real,real,text,text,text) TO app_role;

-- runtime login 永不通过 membership 漂移成为准入签发器（防漂移）。
REVOKE memory_admission_issuer FROM app_role;
