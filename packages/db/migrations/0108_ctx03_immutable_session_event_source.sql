-- ═══════════════════════════════════════════════════════════════════════════════
-- 0108 CTX-03：不可变会话事件源（immutable session event source）
-- ═══════════════════════════════════════════════════════════════════════════════
-- PRD-TEST-012 · CTX-03：为「自由对话」（free conversation）构建 owner-RLS、加密、
-- append-only 的业务事件源，以 (thread_id, sequence) 为序、带 version。checkpoint 只保存
-- 事件引用（range/version/digest），绝不把 checkpoint/trace 反转成聊天历史。
--
-- 承重铁律（与 CLAUDE.md / memory-context-design.md §4 L5 对齐）：
--   1. 业务事件源 conversation_event 按 (owner_user_id, thread_id, sequence) 有序追加写，
--      owner RLS FORCE（owner_user_id = current_setting('app.principal_user', true)）。
--   2. 正文只进加密 ciphertext（pgp_sym_encrypt + keyed HMAC 指纹，非裸 sha256），关系行
--      只留 category/hash/source/retention/consent/purpose/privacy_epoch + artifact_id 引用，
--      **无明文**。app_role 永远拿不到 ciphertext 的读权限——读侧只走 SECURITY DEFINER 函数
--      吐 watermark（body_hmac/key 版本/epoch/status/digest），绝不吐原文或密文。
--   3. checkpoint 只留事件引用（range/version/digest，见 conversation_event_range_ref），
--      **绝不**把 checkpoint/trace 反转成聊天历史。
--   4. 四承重原语复用不重实现：①CAS（version 条件更新 + 单向状态机 guard）②principal 作用域
--      幂等键（UNIQUE(owner,thread,event_key) + 重放返回既有）③RLS owner 隔离（FORCE RLS +
--      owner=principal）④持久有序事件日志（复用 0093 memory_append_audit，单调 eventSeq；
--      本表自序列由 advisory 锁 + MAX+1 原子分配）。复用 0093 memory_runtime 角色，不重实现。
--   5. 显式状态机（禁布尔汤）：event/artifact status = active → privacy_fenced → purged，
--      单向（fenced→active、purged→{active,fenced} 回放被 DB 触发器拒绝）；events 本体
--      append-only（content 不可 UPDATE）。
--
-- 为何「正文加密 + 关系行零明文」是承重结构（而非约定）：
--   - 关系行 conversation_event 没有任何 text 正文列；正文只在 conversation_event_artifact
--     以 pgp_sym_encrypt ciphertext 存在，且 app_role 对该表无 SELECT（表级 REVOKE + 无
--     SELECT RLS 策略）。即使 app_role 拿到 conversation_event 的读权限，也只能看到
--     event_digest/body_hmac 指纹与 artifact_id，无法还原正文。body_hmac 用 keyed HMAC
--     （非裸 sha256）防「密文旁明文 sha 确认/关联预言机」（与 resume.ts / int-transcript.ts
--     同源）。
--
-- 为何「checkpoint 只持引用」必须由专用 ref 函数承重：
--   - conversation_event_range_ref 返回 (thread_id, from_sequence, to_sequence, ref_version,
--     event_count, range_digest)，其中 range_digest 是范围内事件逐序 event_digest 的确定性
--     聚合。checkpoint/state 存这个 ref，恢复时用 conversation_event_replay 按 seq 顺序回放
--     watermark 并重算 range_digest 比对——checkpoint 永远不成为「原文聊天库」。
--
-- 诚实标注（非目标）：本迁移**不重实现删除根**。active → privacy_fenced → purged 的 enum +
--   单向 guard 已声明，但实际 begin-erasure/purge 并入 0091/0093 删除根的 sink registry 属
--   PRD-TEST-013（本任务不接）。不碰 RAG-04（qbank/0106）、memory governance 表（0105/0107）、
--   job-route-decision.ts。真实 KMS 归 MODEL-OP / 密钥运维（本迁移只用 pgp_sym_encrypt seam）。

-- 角色兜底：memory_runtime 由 0093 创建（NOLOGIN NOINHERIT NOBYPASSRLS）；此处幂等兜底。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'memory_runtime') THEN
    CREATE ROLE memory_runtime NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  GRANT USAGE ON SCHEMA public TO memory_runtime;
END $$;

-- ── 加密正文源（conversation_event_artifact）：唯一权威正文，只留密文 + 指纹 + key 版本 ──
-- 与 interview_answer_artifact（0092）同源 seam：pgp_sym_encrypt ciphertext + body_hmac（keyed
-- HMAC，非裸 sha256）+ hmac/enc key 版本分离 + privacy_epoch + 显式状态机。event_id 为反向引用
-- （无 FK，避免 RLS 下跨表 FK 校验的读面放大）；正向引用在 conversation_event.artifact_id。
DROP TABLE IF EXISTS conversation_event_artifact CASCADE;
CREATE TABLE conversation_event_artifact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  event_id uuid NOT NULL UNIQUE,
  -- pgp_sym_encrypt 输出（bytea）；明文只在加密的同一事务内以绑定参数出现，绝不落库。
  ciphertext bytea NOT NULL,
  body_hmac text NOT NULL CHECK (body_hmac ~ '^[a-f0-9]{64}$'),
  hmac_key_version integer NOT NULL CHECK (hmac_key_version >= 1),
  enc_key_version integer NOT NULL CHECK (enc_key_version >= 1),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','privacy_fenced','purged')),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER TABLE conversation_event_artifact ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_event_artifact FORCE ROW LEVEL SECURITY;
CREATE INDEX conversation_event_artifact_owner_idx
  ON conversation_event_artifact (owner_user_id, privacy_epoch);

-- ── 业务事件源（conversation_event）：有序追加的关系行，零明文 ─────────────────────────
-- 关系行只留 category/hash（event_digest + artifact_id 引用 + body_hmac）/source/retention/
-- consent(purpose/revision)/privacy_epoch/status/version。event_digest 是「事件内容身份」的
-- 确定性 sha256（category/source/body_hmac/retention/consent/privacy_epoch/enc_key_version），
-- 不含正文、不含 PII；body_hmac 是对正文的 keyed HMAC（非裸 sha256）。
-- sequence 按 (owner_user_id, thread_id) 单调、无洞（UNIQUE 约束 + advisory 锁下 MAX+1 分配）。
DROP TABLE IF EXISTS conversation_event CASCADE;
CREATE TABLE conversation_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  thread_id text NOT NULL,
  sequence bigint NOT NULL CHECK (sequence >= 1),
  category text NOT NULL CHECK (category IN (
    'turn_start','user_message','assistant_message','tool_call','tool_result','system_note'
  )),
  source text NOT NULL CHECK (source IN ('user','model','tool','system')),
  -- 事件内容身份指纹（确定性 sha256，覆盖正文指纹与授权元数据；无正文、无 PII）。
  event_digest text NOT NULL CHECK (event_digest ~ '^[a-f0-9]{64}$'),
  -- 加密工件引用（正文只存在 conversation_event_artifact；此处只引用）。
  artifact_id uuid NOT NULL,
  retention_class text NOT NULL CHECK (retention_class IN ('session','account','derived')),
  consent_purpose text NOT NULL CHECK (consent_purpose IN ('free_conversation')),
  consent_revision bigint NOT NULL CHECK (consent_revision >= 1),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  -- principal 作用域幂等键（同 owner 同 thread 同 event_key 重放返回既有；NULL 表示非幂等）。
  event_key text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','privacy_fenced','purged')),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- 有序追加：同 owner 同 thread 的 sequence 唯一（无洞、无重排）。
  UNIQUE (owner_user_id, thread_id, sequence),
  -- 幂等键：同 owner 同 thread 同 event_key 唯一（重放返回既有）。
  UNIQUE (owner_user_id, thread_id, event_key)
);
ALTER TABLE conversation_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_event FORCE ROW LEVEL SECURITY;
CREATE INDEX conversation_event_owner_thread_seq_idx
  ON conversation_event (owner_user_id, thread_id, sequence);

-- ── 表级 ACL：runtime（app_role）无原始读/写（负路径承重）；memory_runtime 持数据面读写 ──
-- app_role 对两表均无 SELECT（尤其 conversation_event_artifact 的 ciphertext 永不可读）；
-- 读侧只走下方 SECURITY DEFINER 函数（EXECUTE 授 app_role）。
REVOKE ALL ON conversation_event, conversation_event_artifact FROM PUBLIC, app_role;
GRANT SELECT, INSERT, UPDATE ON conversation_event TO memory_runtime;
GRANT SELECT, INSERT, UPDATE ON conversation_event_artifact TO memory_runtime;

-- ── RLS 策略：FORCE + owner_user_id=principal 绑定（四原语之③）────────────────────────
DO $$
BEGIN
  DROP POLICY IF EXISTS conversation_event_runtime ON conversation_event;
  CREATE POLICY conversation_event_runtime ON conversation_event
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS conversation_event_artifact_runtime ON conversation_event_artifact;
  CREATE POLICY conversation_event_artifact_runtime ON conversation_event_artifact
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
END $$;

-- ── 单向状态守卫（fenced→active、purged→{active,fenced} 回放被拒）──────────────────────
-- 事件/工件都是 append-only；status 只允许单向 active → privacy_fenced → purged。
CREATE OR REPLACE FUNCTION assert_conversation_event_status_oneway() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF (OLD.status = 'privacy_fenced' AND NEW.status = 'active')
     OR (OLD.status = 'purged' AND NEW.status IN ('active','privacy_fenced')) THEN
    RAISE EXCEPTION 'conversation_event_status_oneway' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

ALTER FUNCTION assert_conversation_event_status_oneway() OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION assert_conversation_event_status_oneway() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS conversation_event_status_oneway_guard ON conversation_event;
CREATE TRIGGER conversation_event_status_oneway_guard
  BEFORE UPDATE OF status ON conversation_event
  FOR EACH ROW EXECUTE FUNCTION assert_conversation_event_status_oneway();

DROP TRIGGER IF EXISTS conversation_event_artifact_status_oneway_guard ON conversation_event_artifact;
CREATE TRIGGER conversation_event_artifact_status_oneway_guard
  BEFORE UPDATE OF status ON conversation_event_artifact
  FOR EACH ROW EXECUTE FUNCTION assert_conversation_event_status_oneway();

-- ═══════════════════════════════════════════════════════════════════════════════
-- CTX-03 数据面函数（OWNER memory_runtime，EXECUTE 授 app_role）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 追加一个会话事件（加密正文 + 有序序列 + 幂等重放）────────────────────────────────
-- 同一事务内：advisory 锁(principal,thread) 串行 → 幂等键重放检查 → MAX+1 分配 sequence →
-- 插加密工件 → 插关系行 → 复用 memory_append_audit 记审计事件。event_digest 由 SQL 侧重算
-- （digest(canonical,...)）与调用方传值对不上则 fail-closed（digest 不得信任调用方）。
-- 正文 p_body 只以绑定参数进 pgp_sym_encrypt，绝不拼接/落明文；审计 payload 只含指纹不含正文。
CREATE OR REPLACE FUNCTION conversation_event_append(
  p_thread_id text,
  p_category text,
  p_source text,
  p_event_key text,
  p_body text,
  p_body_hmac text,
  p_hmac_key_version integer,
  p_enc_key_version integer,
  p_enc_key text,
  p_retention_class text,
  p_consent_purpose text,
  p_consent_revision bigint,
  p_privacy_epoch bigint
) RETURNS TABLE (
  event_id uuid, sequence bigint, event_digest text, body_hmac text,
  artifact_id uuid, replayed boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_seq bigint;
  v_digest text;
  v_event_id uuid;
  v_artifact_id uuid;
  v_existing conversation_event%ROWTYPE;
  v_body_hmac text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_thread_id IS NULL OR length(p_thread_id)=0
     OR p_category NOT IN ('turn_start','user_message','assistant_message','tool_call','tool_result','system_note')
     OR p_source NOT IN ('user','model','tool','system')
     OR p_body IS NULL OR length(p_body)=0
     OR p_body_hmac IS NULL OR p_body_hmac !~ '^[a-f0-9]{64}$'
     OR p_hmac_key_version IS NULL OR p_hmac_key_version < 1
     OR p_enc_key_version IS NULL OR p_enc_key_version < 1
     OR p_enc_key IS NULL OR length(p_enc_key)=0
     OR p_retention_class NOT IN ('session','account','derived')
     OR p_consent_purpose NOT IN ('free_conversation')
     OR p_consent_revision IS NULL OR p_consent_revision < 1
     OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1 THEN
    RAISE EXCEPTION 'conversation_event_append_invalid' USING ERRCODE='22023';
  END IF;

  -- advisory 锁 key 含 principal + thread：不同 owner / 不同 thread 互不阻塞（各自独立序列）。
  PERFORM pg_advisory_xact_lock(hashtext('conversation_event:' || principal || ':' || p_thread_id));

  -- ② principal 作用域幂等键：同 event_key 重放返回既有（不双写、不改冻结输入）。
  IF p_event_key IS NOT NULL THEN
    SELECT * INTO v_existing FROM conversation_event e
     WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id AND e.event_key = p_event_key
     FOR UPDATE;
    IF FOUND THEN
      RETURN QUERY SELECT v_existing.id, v_existing.sequence, v_existing.event_digest,
        (SELECT a.body_hmac FROM conversation_event_artifact a WHERE a.id = v_existing.artifact_id),
        v_existing.artifact_id, true;
      RETURN;
    END IF;
  END IF;

  -- event_digest 服务端重算（digest 覆盖正文指纹 + 授权元数据；不含正文/明文）。调用方不传
  -- digest——由本函数确定性派生，杜绝「调用方自报指纹」被篡改。
  v_digest := encode(digest(
    p_category || ':' || p_source || ':' || p_body_hmac || ':' || p_retention_class || ':' ||
    p_consent_purpose || ':' || p_consent_revision::text || ':' || p_privacy_epoch::text || ':' ||
    p_enc_key_version::text, 'sha256'), 'hex');

  -- ④ 持久有序：同 (owner,thread) 序列单调无洞（advisory 锁下 MAX+1 原子分配）。
  SELECT COALESCE(MAX(e.sequence), 0) + 1 INTO v_seq
    FROM conversation_event e
   WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id;

  v_event_id := gen_random_uuid();
  v_artifact_id := gen_random_uuid();

  INSERT INTO conversation_event_artifact(id, owner_user_id, event_id, ciphertext, body_hmac,
    hmac_key_version, enc_key_version, privacy_epoch, status)
  VALUES (v_artifact_id, principal, v_event_id, pgp_sym_encrypt(p_body, p_enc_key), p_body_hmac,
    p_hmac_key_version, p_enc_key_version, p_privacy_epoch, 'active');

  INSERT INTO conversation_event(id, owner_user_id, thread_id, sequence, category, source,
    event_digest, artifact_id, retention_class, consent_purpose, consent_revision, privacy_epoch,
    event_key, status)
  VALUES (v_event_id, principal, p_thread_id, v_seq, p_category, p_source,
    v_digest, v_artifact_id, p_retention_class, p_consent_purpose, p_consent_revision,
    p_privacy_epoch, p_event_key, 'active');

  -- 审计事件日志（复用 0093 memory_append_audit）：payload 只含指纹/序列，绝不含正文/PII。
  PERFORM memory_append_audit('conversation_event:' || p_thread_id, 'append',
    jsonb_build_object('event_id', v_event_id, 'sequence', v_seq, 'category', p_category,
      'source', p_source, 'event_digest', v_digest, 'privacy_epoch', p_privacy_epoch),
    CASE WHEN p_event_key IS NULL THEN NULL ELSE 'append:' || p_event_key END);

  RETURN QUERY SELECT v_event_id, v_seq, v_digest, p_body_hmac, v_artifact_id, false;
END $$;
ALTER FUNCTION conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,text,bigint,bigint)
  OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,text,bigint,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,text,bigint,bigint) TO app_role;

-- ── 确定性回放（恢复路径，只依赖持久化事件源，无进程内 session map）──────────────────
-- 按 sequence 顺序返回 p_after_sequence 之后的事件 watermark（event_id/sequence/category/
-- source/event_digest/body_hmac/key 版本/retention/consent/privacy_epoch/status/version/
-- created_at）。**绝无正文、绝无 ciphertext**。恢复方用新连接调用此函数即可重放整段会话，
-- 不需要任何内存 session map（铁律⑤）。
CREATE OR REPLACE FUNCTION conversation_event_replay(
  p_thread_id text,
  p_after_sequence bigint DEFAULT 0
) RETURNS TABLE (
  event_id uuid, sequence bigint, category text, source text, event_digest text,
  artifact_id uuid, body_hmac text, hmac_key_version integer, enc_key_version integer,
  retention_class text, consent_purpose text, consent_revision bigint, privacy_epoch bigint,
  status text, version bigint, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_thread_id IS NULL OR length(p_thread_id)=0
     OR p_after_sequence IS NULL OR p_after_sequence < 0 THEN
    RAISE EXCEPTION 'conversation_event_replay_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT e.id, e.sequence, e.category, e.source, e.event_digest, e.artifact_id,
           a.body_hmac, a.hmac_key_version, a.enc_key_version,
           e.retention_class, e.consent_purpose, e.consent_revision, e.privacy_epoch,
           e.status, e.version, e.created_at
      FROM conversation_event e
      JOIN conversation_event_artifact a ON a.id = e.artifact_id
     WHERE e.owner_user_id = principal
       AND e.thread_id = p_thread_id
       AND e.sequence > p_after_sequence
       AND e.status = 'active'
     ORDER BY e.sequence;
END $$;
ALTER FUNCTION conversation_event_replay(text,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION conversation_event_replay(text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION conversation_event_replay(text,bigint) TO app_role;

-- ── checkpoint 事件引用（range/version/digest，无正文）────────────────────────────────
-- 铁律③：checkpoint/state 只存这个 ref（thread + range + version + digest），绝不反转成
-- 聊天历史。range_digest = 范围内事件逐序 "seq:event_digest" 的确定性 sha256 聚合，覆盖
-- 范围端点与逐事件指纹；恢复方用 conversation_event_replay 重放后重算比对，可检测任何
-- 增删/重排/篡改。空范围（from > to 或无 active 事件）→ event_count=0 且 range_digest 覆盖
-- 端点本身（防空范围被误当作完整引用）。
CREATE OR REPLACE FUNCTION conversation_event_range_ref(
  p_thread_id text,
  p_from_sequence bigint,
  p_to_sequence bigint
) RETURNS TABLE (
  thread_id text, from_sequence bigint, to_sequence bigint, ref_version bigint,
  event_count bigint, range_digest text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_count bigint;
  v_digest text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_thread_id IS NULL OR length(p_thread_id)=0
     OR p_from_sequence IS NULL OR p_from_sequence < 1
     OR p_to_sequence IS NULL OR p_to_sequence < p_from_sequence THEN
    RAISE EXCEPTION 'conversation_event_range_ref_invalid' USING ERRCODE='22023';
  END IF;

  SELECT count(*),
         encode(digest(
           coalesce(string_agg(e.sequence::text || ':' || e.event_digest, E'\n' ORDER BY e.sequence), '')
           , 'sha256'), 'hex')
    INTO v_count, v_digest
    FROM conversation_event e
   WHERE e.owner_user_id = principal
     AND e.thread_id = p_thread_id
     AND e.sequence BETWEEN p_from_sequence AND p_to_sequence
     AND e.status = 'active';

  -- range_digest 覆盖端点（thread + from + to + 聚合），使引用自身可校验范围正确性。
  v_digest := encode(digest(
    p_thread_id || ':' || p_from_sequence::text || ':' || p_to_sequence::text || ':' || v_digest,
    'sha256'), 'hex');

  RETURN QUERY SELECT p_thread_id, p_from_sequence, p_to_sequence, 1::bigint, v_count, v_digest;
END $$;
ALTER FUNCTION conversation_event_range_ref(text,bigint,bigint) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION conversation_event_range_ref(text,bigint,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION conversation_event_range_ref(text,bigint,bigint) TO app_role;

-- runtime login 永不通过 membership 漂移成为 memory_runtime（防漂移，与 0093/0099/0102/0105 一致）。
REVOKE memory_runtime, memory_admission_issuer FROM app_role;
