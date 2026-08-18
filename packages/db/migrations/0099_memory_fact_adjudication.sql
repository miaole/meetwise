-- 0099_memory_fact_adjudication.sql
--
-- MEM-13（长期事实的冲突/时效判定）的数据库真相：把 MEM-12（0095）的准入 candidate
-- （memory_admission_record，verification_state 恒 'unverified'）升级为「长期事实判定子系统」。
-- 本迁移在 0093/0095 **之上叠加**，不重建、不回退它们的表与函数；MEM-13 是**消费** candidate，
-- 不是重写准入——memory_admission_record 只读，绝不 UPDATE（issuer 仅 SELECT、admit 期 FOR SHARE
-- 复验、verificationState 钉 unverified 全部原样不动）。
--
-- 交付物逐条落地（对齐 .tmp/mem-13-pregen-gate.md）：
--  1. 稳定 fact_key：owner + scope + purpose + namespace + 归一化 fact 主题（NFKC→trim→lower→
--     拒 control/注入），全部服务端派生；客户端无 fact_key/owner/purpose/scope 字段可传。
--     （与 MEM-12 的 fact_key「scope+subject+purpose+source 身份」刻意不同：MEM-12 是「来源身份
--     键」，同 subject 不同来源会得到不同 key；MEM-13 是「主题键」，同 subject 不同来源归一后
--     收敛到同一 key，冲突/替代才能成立。两者共存，各自服务各自的状态机。）
--  2. 事实分类 + 单/多值：namespace（分类命名空间，对齐 0093 kind 枚举）+ cardinality
--     （single_value/multi_value 显式枚举，不用布尔）。单值事实全局至多一个 active。
--  3. 显式 status enum + audited transition：candidate→active（仅用户确认或受信业务事实，模型
--     候选不可直接 active）；active→superseded/expired/contradicted/revoked；过期（valid_until）
--     自动非 active（confirm 前校验 + expire sweep + 读侧硬过滤）。绝无布尔汤。
--  4. contradicts/supersedes 是**可追溯的边**（memory_fact_relationship），不是布尔列；旧事实
--     不删，保留审计链。
--  5. 六分量分离（互不推导的独立列，绝不合并成单一总分）：source_trust / extraction_confidence
--     / user_confirmation / valid_until(freshness) / salience / retrieval_score（恒 NULL）。
--  6. 并发不变量：partial unique index（单值至多一个 active 的 DB 级防线）+ advisory 锁（按
--     (owner,fact_key) 串行化 supersede+activate 复合转移）+ CAS from→to（correct/revoke/confirm
--     全部条件更新，陈旧落败返回空）。
--
-- 四原语对齐：CAS（confirm/correct/revoke 全部 from→to 条件更新 + version 自增）、幂等键
-- （memory_fact_adjudication UNIQUE(owner,idempotency_key) + 重放返回既有行）、RLS principal
-- 绑定（两表 FORCE RLS + owner_user_id=principal）、持久有序事件日志（复用 0093 memory_append_audit）。
--
-- 铁律：不落 PII / 全文答案 / 完整 prompt；content 一律是派生摘要，进 data fence（content_digest
-- 强制 = digest(content)，且与准入 content_digest 逐字节一致）。

-- ── 角色：复用 0093 的 memory_runtime（NOLOGIN NOINHERIT NOBYPASSRLS）─────────────────
-- MEM-13 的裁决函数是同一数据面的状态机扩展，不新开角色（爆炸半径不扩）。memory_runtime 在 0093
-- 已创建并授 USAGE ON SCHEMA public；此处做防御性幂等（若 0093 未跑则补齐）。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='memory_runtime') THEN
    CREATE ROLE memory_runtime NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO memory_runtime;

-- ── memory_fact_adjudication：长期事实 + 裁决状态机 ───────────────────────────────────
-- 注：namespace/purpose/source_type 的枚举与 packages/contracts（MemoryFactNamespace 等）逐一对齐
-- （契约先行，DB 只做下界约束，不另造枚举）。
DROP TABLE IF EXISTS memory_fact_adjudication CASCADE;
CREATE TABLE memory_fact_adjudication (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,                          -- data subject（= principal，RLS 绑定）
  fact_key text NOT NULL,                               -- 服务端派生稳定主题键（sha256 hex）
  namespace text NOT NULL CHECK (namespace IN ('fact','preference','skill','weakness','topic','episode')),
  cardinality text NOT NULL CHECK (cardinality IN ('single_value','multi_value')),
  content text NOT NULL,                                -- 派生摘要（不可信输入 → data fence，非 PII 原文）
  content_digest text NOT NULL CHECK (content_digest ~ '^[a-f0-9]{64}$'),  -- sha256(utf8 content)
  purpose text NOT NULL CHECK (purpose IN ('interview_prep','career','preference','self_improvement')),
  controller_scope text NOT NULL DEFAULT 'c_personal' CHECK (controller_scope = 'c_personal'),
  -- 六分量分离（互不推导的独立轴，绝不合并成单一总分）——
  source_trust text NOT NULL CHECK (source_trust IN ('trusted','untrusted')),
  extraction_confidence real CHECK (extraction_confidence IS NULL OR (extraction_confidence >= 0 AND extraction_confidence <= 1)),
  user_confirmation text NOT NULL DEFAULT 'unconfirmed' CHECK (user_confirmation IN ('unconfirmed','user_confirmed','business_verified')),
  valid_until timestamptz,                              -- freshness：绝对过期（到期自动非 active）
  salience real NOT NULL DEFAULT 1.0 CHECK (salience >= 0 AND salience <= 1),
  retrieval_score real CHECK (retrieval_score IS NULL), -- 召回时瞬态排序值；裁决期恒 NULL（CHECK 结构封死，绝不回填）
  -- 显式状态机（禁布尔汤）
  status text NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate','active','superseded','expired','contradicted','revoked')),
  -- 来源追溯（从准入 candidate 复制；correct 的新事实 source_type='user_confirmation'）
  source_type text NOT NULL CHECK (source_type IN ('conversation_event','business_fact','user_confirmation','model_summary')),
  source_entity_id text,
  immutable_source_version text,
  admission_record_id uuid NOT NULL,                    -- 消费的 MEM-12 candidate（只读引用，非 FK——不入 delete 链）
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  activated_at timestamptz,
  superseded_at timestamptz,
  contradicted_at timestamptz,
  expired_at timestamptz,
  revoked_at timestamptz,
  idempotency_key text,                                 -- 幂等重放键（调用方生成，防重复物化/纠正）
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_fact_adjudication_owner_idem_uq UNIQUE (owner_user_id, idempotency_key)
);
-- 单值 key 唯一 active：status='active' 且 cardinality='single_value' 时 (owner,fact_key) 唯一。
-- 这是「100 并发 confirm/correct 单值至多一个 active」的数据库级承重约束（非仅调用约定）。
-- 多值事实（cardinality=multi_value）不受限，可多个 active。
CREATE UNIQUE INDEX memory_fact_adjudication_single_active_ux
  ON memory_fact_adjudication (owner_user_id, fact_key)
  WHERE status = 'active' AND cardinality = 'single_value';
-- 一 candidate 至多一条候选事实（防重复物化；correct 产生的 active/contradicted 不受限）。
CREATE UNIQUE INDEX memory_fact_adjudication_candidate_admission_ux
  ON memory_fact_adjudication (admission_record_id)
  WHERE status = 'candidate';
CREATE INDEX memory_fact_adjudication_owner_status_idx ON memory_fact_adjudication (owner_user_id, status);

GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER TABLE memory_fact_adjudication ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_fact_adjudication FORCE ROW LEVEL SECURITY;

-- ── memory_fact_relationship：contradicts/supersedes 可追溯的边（非布尔列）────────────
-- from_fact_id = 新事实（替代者/冲突者）；to_fact_id = 旧事实（被替代/被冲突）。旧事实不删，
-- 保留审计链；关系是显式记录，可审计「谁替代了谁、为何」。
DROP TABLE IF EXISTS memory_fact_relationship CASCADE;
CREATE TABLE memory_fact_relationship (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  from_fact_id uuid NOT NULL,
  to_fact_id uuid NOT NULL,
  relationship text NOT NULL CHECK (relationship IN ('supersedes','contradicts')),
  reason text NOT NULL CHECK (reason IN ('newer_confirmed','user_correction')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_fact_relationship_pair_uq UNIQUE (from_fact_id, to_fact_id, relationship)
);
CREATE INDEX memory_fact_relationship_to_idx ON memory_fact_relationship (to_fact_id);
ALTER TABLE memory_fact_relationship ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_fact_relationship FORCE ROW LEVEL SECURITY;

-- ── 表级 ACL：runtime（app_role）无任何原始读/写（负路径承重）────────────────────────
REVOKE ALL ON memory_fact_adjudication, memory_fact_relationship FROM PUBLIC, app_role;
-- memory_runtime（裁决数据面函数 owner）持有数据面读写权。
GRANT SELECT, INSERT, UPDATE ON memory_fact_adjudication, memory_fact_relationship TO memory_runtime;

-- ── RLS 策略：全部 FORCE + owner_user_id=principal 绑定（四原语之③）──────────────────
DO $$
BEGIN
  DROP POLICY IF EXISTS memory_fact_adjudication_runtime ON memory_fact_adjudication;
  CREATE POLICY memory_fact_adjudication_runtime ON memory_fact_adjudication
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_fact_relationship_runtime ON memory_fact_relationship;
  CREATE POLICY memory_fact_relationship_runtime ON memory_fact_relationship
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 裁决数据面函数（OWNER memory_runtime，EXECUTE 授 app_role）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 物化：消费准入 candidate → 恒产 candidate 事实 ─────────────────────────────────
-- 模型只能写 candidate：本函数无论何种来源**绝不**直接产 active。source_trust/extraction_confidence
-- /salience 从准入 candidate 复制；user_confirmation 恒 'unconfirmed'；retrieval_score 恒 NULL。
-- content 与准入 content_digest 逐字节重验（data fence）；fact_key 由服务端从
-- owner+scope+purpose+namespace+归一化 subject 派生（客户端无 factKey 字段）。
CREATE OR REPLACE FUNCTION memory_adjudicate_materialize(
  p_admission_record_id uuid,
  p_content text,
  p_namespace text,
  p_cardinality text,
  p_subject text,
  p_valid_until timestamptz,
  p_idempotency_key text DEFAULT NULL
) RETURNS TABLE (
  id uuid, status text, fact_key text, cardinality text, source_trust text,
  user_confirmation text, retrieval_score real, created boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  adm memory_admission_record%ROWTYPE;
  v_subject_norm text;
  v_fact_key text;
  v_digest text;
  v_id uuid;
BEGIN
  -- 铁律：无 principal / 缺字段 / 非法枚举 / subject 越界一律 fail-closed（零写入）。
  IF principal IS NULL OR length(principal)=0
     OR p_admission_record_id IS NULL
     OR p_content IS NULL OR length(p_content)=0
     OR p_namespace NOT IN ('fact','preference','skill','weakness','topic','episode')
     OR p_cardinality NOT IN ('single_value','multi_value')
     OR p_subject IS NULL OR length(p_subject)=0 OR char_length(p_subject) > 200 THEN
    RAISE EXCEPTION 'memory_adjudication_invalid' USING ERRCODE='22023';
  END IF;
  -- subject 归一化：拒 control/换行（注入/序列化逃逸/日志注水），再 NFKC→trim→lower。
  -- 与 packages/domain 的 normalizeFactSubject（s.normalize('NFKC').trim().toLowerCase()）逐字节一致。
  IF p_subject ~ '[[:cntrl:]]' THEN
    RAISE EXCEPTION 'memory_adjudication_subject_invalid' USING ERRCODE='22023';
  END IF;
  -- normalize 是 PostgreSQL 保留关键字（SQL 标准 NORMALIZE 表达式），裸 `normalize(...)` 会被解析器
  -- 当关键字吃掉导致 'NFKC' 报 syntax error——必须 schema-qualify 成 pg_catalog.normalize 才能当函数调。
  -- NFKC→trim→lower 与 packages/domain 的 normalizeFactSubject（s.normalize('NFKC').trim().toLowerCase()）逐字节一致。
  v_subject_norm := lower(trim(pg_catalog.normalize(p_subject, 'NFKC')));
  IF v_subject_norm = '' THEN
    RAISE EXCEPTION 'memory_adjudication_subject_invalid' USING ERRCODE='22023';
  END IF;

  -- 读取准入 candidate（只读，绝不 UPDATE——MEM-13 消费、不重写 MEM-12 的准入边界）。
  SELECT * INTO adm FROM memory_admission_record r
   WHERE r.id = p_admission_record_id
     AND r.access_principal_user_id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_adjudication_admission_not_found' USING ERRCODE='42501';
  END IF;
  IF adm.data_subject_id IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'memory_adjudication_owner_mismatch' USING ERRCODE='42501';
  END IF;
  IF adm.status <> 'candidate' OR adm.verification_state <> 'unverified' THEN
    RAISE EXCEPTION 'memory_adjudication_admission_not_candidate' USING ERRCODE='42501';
  END IF;

  -- data fence：派生摘要 digest 与准入 content_digest 逐字节一致，否则零写入。
  v_digest := encode(digest(p_content, 'sha256'), 'hex');
  IF v_digest IS DISTINCT FROM adm.content_digest THEN
    RAISE EXCEPTION 'memory_adjudication_content_mismatch' USING ERRCODE='22023';
  END IF;

  -- fact_key 服务端派生：owner + scope + purpose + namespace + 归一化 subject（sha256）。
  v_fact_key := encode(digest(
    principal || ':' || 'c_personal' || ':' || adm.purpose || ':' || p_namespace || ':' || v_subject_norm,
    'sha256'), 'hex');

  -- 幂等重放：同 principal 同幂等键返回既有行（不双写）。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT f.id INTO v_id FROM memory_fact_adjudication f
     WHERE f.owner_user_id = principal AND f.idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN QUERY SELECT f.id, f.status, f.fact_key, f.cardinality, f.source_trust, f.user_confirmation, f.retrieval_score, false
        FROM memory_fact_adjudication f WHERE f.id = v_id;
      RETURN;
    END IF;
  END IF;
  -- 一 candidate 至多一条候选事实（防重复物化）：已存在则幂等返回。
  SELECT f.id INTO v_id FROM memory_fact_adjudication f
   WHERE f.owner_user_id = principal AND f.admission_record_id = adm.id AND f.status = 'candidate';
  IF FOUND THEN
    RETURN QUERY SELECT f.id, f.status, f.fact_key, f.cardinality, f.source_trust, f.user_confirmation, f.retrieval_score, false
      FROM memory_fact_adjudication f WHERE f.id = v_id;
    RETURN;
  END IF;

  INSERT INTO memory_fact_adjudication (
    owner_user_id, fact_key, namespace, cardinality, content, content_digest,
    purpose, controller_scope, source_trust, extraction_confidence, user_confirmation,
    valid_until, salience, retrieval_score, status,
    source_type, source_entity_id, immutable_source_version, admission_record_id, idempotency_key
  ) VALUES (
    principal, v_fact_key, p_namespace, p_cardinality, p_content, v_digest,
    adm.purpose, 'c_personal', adm.source_trust, adm.extraction_confidence, 'unconfirmed',
    p_valid_until, adm.salience, NULL, 'candidate',
    adm.source_type, adm.source_entity_id, adm.immutable_source_version, adm.id, p_idempotency_key
  ) RETURNING memory_fact_adjudication.id INTO v_id;

  PERFORM memory_append_audit('memfactadj:'||v_id, 'materialize',
    jsonb_build_object('fact_key', v_fact_key, 'namespace', p_namespace, 'cardinality', p_cardinality,
      'admission_record_id', adm.id, 'source_trust', adm.source_trust), 'materialize:'||v_id);

  RETURN QUERY SELECT f.id, f.status, f.fact_key, f.cardinality, f.source_trust, f.user_confirmation, f.retrieval_score, true
    FROM memory_fact_adjudication f WHERE f.id = v_id;
EXCEPTION WHEN unique_violation THEN
  -- 幂等键 / 候选唯一并发撞车：回查既有行返回（幂等，不抛）。
  IF p_idempotency_key IS NOT NULL THEN
    RETURN QUERY SELECT f.id, f.status, f.fact_key, f.cardinality, f.source_trust, f.user_confirmation, f.retrieval_score, false
      FROM memory_fact_adjudication f
     WHERE f.owner_user_id = principal AND f.idempotency_key = p_idempotency_key;
    RETURN;
  END IF;
  RETURN QUERY SELECT f.id, f.status, f.fact_key, f.cardinality, f.source_trust, f.user_confirmation, f.retrieval_score, false
    FROM memory_fact_adjudication f
   WHERE f.owner_user_id = principal AND f.admission_record_id = adm.id AND f.status = 'candidate';
  RETURN;
END $$;

ALTER FUNCTION memory_adjudicate_materialize(uuid,text,text,text,text,timestamptz,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_adjudicate_materialize(uuid,text,text,text,text,timestamptz,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_adjudicate_materialize(uuid,text,text,text,text,timestamptz,text) TO app_role;

-- ── 确认：candidate → active（仅用户确认或受信业务事实）────────────────────────────
-- 激活规则（六分量之 user_confirmation）：evidence='business_fact' 要求 source_trust='trusted' 且
-- source_type∈(business_fact,user_confirmation)，否则 RAISE（模型候选不可走 business_fact 路径直接
-- 激活）；evidence='user_confirmation' 允许（用户显式确认）。过期候选不可激活。单值事实若同 key 已
-- 有 active，旧事实 → superseded + 关系边（新 supersedes 旧），新事实 → active；并发下 advisory 锁
-- 按 (owner,fact_key) 串行化，partial unique index 是第二道防线（若锁被绕过则唯一冲突 fail-closed）。
CREATE OR REPLACE FUNCTION memory_adjudicate_confirm(p_fact_id uuid, p_confirmation text)
RETURNS TABLE (id uuid, status text, user_confirmation text, superseded_fact_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  f memory_fact_adjudication%ROWTYPE;
  v_user_confirmation text;
  v_superseded uuid;
  v_id uuid; v_status text; v_uc text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_fact_id IS NULL
     OR p_confirmation NOT IN ('user_confirmation','business_fact') THEN
    RAISE EXCEPTION 'memory_adjudication_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO f FROM memory_fact_adjudication m
   WHERE m.id = p_fact_id AND m.owner_user_id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_adjudication_fact_not_found' USING ERRCODE='42501';
  END IF;

  -- 激活规则：模型候选不可直接 active。
  IF p_confirmation = 'business_fact' THEN
    IF f.source_trust <> 'trusted' OR f.source_type NOT IN ('business_fact','user_confirmation') THEN
      RAISE EXCEPTION 'memory_adjudication_model_candidate_cannot_activate' USING ERRCODE='42501';
    END IF;
    v_user_confirmation := 'business_verified';
  ELSE
    v_user_confirmation := 'user_confirmed';
  END IF;

  -- 过期候选不可激活（freshness 轴：过期即非 active）。
  IF f.valid_until IS NOT NULL AND f.valid_until <= now() THEN
    RAISE EXCEPTION 'memory_adjudication_candidate_expired' USING ERRCODE='40901';
  END IF;

  -- advisory 锁：按 (owner,fact_key) 串行化「supersede 旧 active + 激活新 active」复合转移，
  -- 使结果确定（最后一次确认赢）；partial unique index 兜底。
  PERFORM pg_advisory_xact_lock(hashtext('memfactadj:' || principal || ':' || f.fact_key));

  SELECT * INTO f FROM memory_fact_adjudication m
   WHERE m.id = p_fact_id AND m.owner_user_id = principal FOR UPDATE;
  IF f.status <> 'candidate' THEN
    RETURN;  -- 非法跃迁（非 candidate）→ 空结果（已激活 / 陈旧落败）
  END IF;

  -- 单值：同 fact_key 已有 active → 旧事实 superseded + 关系边（新 supersedes 旧，不删旧事实）。
  IF f.cardinality = 'single_value' THEN
    UPDATE memory_fact_adjudication old
       SET status='superseded', superseded_at=now(), version=old.version+1, updated_at=now()
     WHERE old.owner_user_id = principal AND old.fact_key = f.fact_key
       AND old.status='active' AND old.id <> f.id
     RETURNING old.id INTO v_superseded;
    IF v_superseded IS NOT NULL THEN
      INSERT INTO memory_fact_relationship (owner_user_id, from_fact_id, to_fact_id, relationship, reason)
      VALUES (principal, f.id, v_superseded, 'supersedes', 'newer_confirmed')
      ON CONFLICT (from_fact_id, to_fact_id, relationship) DO NOTHING;
    END IF;
  END IF;

  -- CAS：candidate → active（0 行 = 陈旧落败）。
  UPDATE memory_fact_adjudication m
     SET status='active', user_confirmation=v_user_confirmation, activated_at=now(), version=version+1, updated_at=now()
   WHERE m.id = p_fact_id AND m.owner_user_id = principal AND m.status='candidate'
   RETURNING m.id, m.status, m.user_confirmation INTO v_id, v_status, v_uc;
  IF v_id IS NULL THEN
    RETURN;
  END IF;

  PERFORM memory_append_audit('memfactadj:'||v_id, 'confirm',
    jsonb_build_object('confirmation', p_confirmation, 'user_confirmation', v_uc, 'superseded_fact_id', v_superseded),
    'confirm:'||v_id);

  RETURN QUERY SELECT v_id, v_status, v_uc, v_superseded;
END $$;
ALTER FUNCTION memory_adjudicate_confirm(uuid,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_adjudicate_confirm(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_adjudicate_confirm(uuid,text) TO app_role;

-- ── 纠正：active → contradicted + 插入新 active（用户纠正错误事实）────────────────────
-- CAS：旧事实 active→contradicted（0 行=陈旧落败/非 active）；随后插入纠正后的新 active 事实
-- （同 fact_key，新 content，source='user_confirmation'/trusted）。关系边 new--contradicts-->old。
-- 旧事实不删，保留审计链。并发下 advisory 锁 + CAS 保证至多一个纠正者赢。
CREATE OR REPLACE FUNCTION memory_adjudicate_correct(
  p_fact_id uuid,
  p_content text,
  p_valid_until timestamptz,
  p_idempotency_key text DEFAULT NULL
) RETURNS TABLE (id uuid, status text, contradicted_fact_id uuid, fact_key text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  f memory_fact_adjudication%ROWTYPE;
  v_digest text;
  v_new_id uuid;
  v_old_id uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_fact_id IS NULL
     OR p_content IS NULL OR length(p_content)=0 THEN
    RAISE EXCEPTION 'memory_adjudication_invalid' USING ERRCODE='22023';
  END IF;
  -- 纠正产生的是 active 事实：拒绝已过期的 valid_until（不允许产出一个立即过期的 active）。
  IF p_valid_until IS NOT NULL AND p_valid_until <= now() THEN
    RAISE EXCEPTION 'memory_adjudication_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO f FROM memory_fact_adjudication m
   WHERE m.id = p_fact_id AND m.owner_user_id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_adjudication_fact_not_found' USING ERRCODE='42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('memfactadj:' || principal || ':' || f.fact_key));

  SELECT * INTO f FROM memory_fact_adjudication m
   WHERE m.id = p_fact_id AND m.owner_user_id = principal FOR UPDATE;
  IF f.status <> 'active' THEN
    RETURN;  -- 仅 active 可纠正（CAS from active）
  END IF;

  v_digest := encode(digest(p_content, 'sha256'), 'hex');

  -- CAS：active → contradicted（0 行 = 陈旧落败，并发纠正只有一个赢家）。
  UPDATE memory_fact_adjudication m
     SET status='contradicted', contradicted_at=now(), version=version+1, updated_at=now()
   WHERE m.id = p_fact_id AND m.owner_user_id = principal AND m.status='active'
   RETURNING m.id INTO v_old_id;
  IF v_old_id IS NULL THEN
    RETURN;
  END IF;

  -- 新 active 事实：同 fact_key/namespace/cardinality，纠正后的值；来源=用户纠正（trusted，无模型抽取）。
  INSERT INTO memory_fact_adjudication (
    owner_user_id, fact_key, namespace, cardinality, content, content_digest,
    purpose, controller_scope, source_trust, extraction_confidence, user_confirmation,
    valid_until, salience, retrieval_score, status,
    source_type, source_entity_id, immutable_source_version, admission_record_id, idempotency_key, activated_at
  ) VALUES (
    principal, f.fact_key, f.namespace, f.cardinality, p_content, v_digest,
    f.purpose, f.controller_scope, 'trusted', NULL, 'user_confirmed',
    p_valid_until, f.salience, NULL, 'active',
    'user_confirmation', f.id, NULL, f.admission_record_id, p_idempotency_key, now()
  ) RETURNING memory_fact_adjudication.id INTO v_new_id;

  INSERT INTO memory_fact_relationship (owner_user_id, from_fact_id, to_fact_id, relationship, reason)
  VALUES (principal, v_new_id, v_old_id, 'contradicts', 'user_correction')
  ON CONFLICT (from_fact_id, to_fact_id, relationship) DO NOTHING;

  PERFORM memory_append_audit('memfactadj:'||v_old_id, 'correct',
    jsonb_build_object('contradicted_fact_id', v_old_id, 'new_fact_id', v_new_id), 'correct:'||v_old_id);

  RETURN QUERY SELECT v_new_id, 'active', v_old_id, f.fact_key;
EXCEPTION WHEN unique_violation THEN
  -- 幂等键并发撞车：回查既有纠正事实。
  IF p_idempotency_key IS NOT NULL THEN
    RETURN QUERY SELECT nf.id, nf.status, NULL::uuid, nf.fact_key
      FROM memory_fact_adjudication nf
     WHERE nf.owner_user_id = principal AND nf.idempotency_key = p_idempotency_key;
    RETURN;
  END IF;
  RAISE;
END $$;
ALTER FUNCTION memory_adjudicate_correct(uuid,text,timestamptz,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_adjudicate_correct(uuid,text,timestamptz,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_adjudicate_correct(uuid,text,timestamptz,text) TO app_role;

-- ── 撤回：active → revoked（用户单条遗忘）────────────────────────────────────────────
-- CAS from active（0 行 = 陈旧落败 / 非 active）。撤回不删除，保留审计链。
CREATE OR REPLACE FUNCTION memory_adjudicate_revoke(p_fact_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid; v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_fact_id IS NULL THEN
    RAISE EXCEPTION 'memory_adjudication_invalid' USING ERRCODE='22023';
  END IF;

  UPDATE memory_fact_adjudication m
     SET status='revoked', revoked_at=now(), version=version+1, updated_at=now()
   WHERE m.id = p_fact_id AND m.owner_user_id = principal AND m.status='active'
   RETURNING m.id, m.status INTO v_id, v_status;
  IF v_id IS NULL THEN
    RETURN;  -- 非法跃迁 / 陈旧落败
  END IF;

  PERFORM memory_append_audit('memfactadj:'||v_id, 'revoke', jsonb_build_object(), 'revoke:'||v_id);

  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_adjudicate_revoke(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_adjudicate_revoke(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_adjudicate_revoke(uuid) TO app_role;

-- ── 过期 sweep：active → expired（valid_until 已过，freshness 自动非 active）─────────
-- 维护型 sweep：到期 active 事实批量转 expired，逐条审计。并发下 WHERE status='active' CAS
-- 保证不重复转移（多实例/重试安全）。
CREATE OR REPLACE FUNCTION memory_adjudicate_expire(p_purpose text DEFAULT NULL)
RETURNS TABLE (expired_count bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_count bigint := 0;
  r record;
BEGIN
  IF principal IS NULL OR length(principal)=0 THEN
    RAISE EXCEPTION 'memory_adjudication_invalid' USING ERRCODE='22023';
  END IF;
  IF p_purpose IS NOT NULL AND p_purpose NOT IN ('interview_prep','career','preference','self_improvement') THEN
    RAISE EXCEPTION 'memory_adjudication_invalid' USING ERRCODE='22023';
  END IF;

  FOR r IN SELECT id FROM memory_fact_adjudication
    WHERE owner_user_id = principal
      AND status='active'
      AND valid_until IS NOT NULL AND valid_until <= now()
      AND (p_purpose IS NULL OR purpose = p_purpose)
  LOOP
    UPDATE memory_fact_adjudication
       SET status='expired', expired_at=now(), version=version+1, updated_at=now()
     WHERE id = r.id AND status='active';
    IF FOUND THEN
      v_count := v_count + 1;
      PERFORM memory_append_audit('memfactadj:'||r.id, 'expire', jsonb_build_object(), 'expire:'||r.id);
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_count;
END $$;
ALTER FUNCTION memory_adjudicate_expire(text) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION memory_adjudicate_expire(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_adjudicate_expire(text) TO app_role;
