-- ═══════════════════════════════════════════════════════════════════════════════
-- 0210 CTX-03：会话事件加密密钥移出存储函数签名（密钥改经事务级自定义 GUC 注入）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 背景：0108 的 conversation_event_append 以 p_enc_key 作第 9 参接收正文加密密钥——密钥随
-- SQL 函数签名进入数据语句参数表，服务端语句日志（log_statement / 慢日志参数回显）开启态
-- 下密钥可达（#143 挂账：`pgp_sym_encrypt(p_body,p_enc_key)` 密钥可入日志·启用前处理）。
-- 修法：密钥改由调用方在同一事务内 `SELECT set_config('app.conversation_event_enc_key', $1,
-- true)` 注入（绑定参数·is_local=true 事务尾自清零残留），函数体内以
-- current_setting('app.conversation_event_enc_key', true) 取用；缺失/空即 22023 拒绝
-- （与 0108 对 p_enc_key 的 NULL/空校验同码同语义 fail-closed，静默降级不可能）。
-- 密钥从此不居函数签名、不与正文同流进数据语句参数表。
--
-- 为何先 DROP 再 CREATE：PostgreSQL CREATE OR REPLACE 对不同签名是新建重载而非替换，
-- 必须先 DROP 旧 13 参版再 CREATE 12 参版，杜绝双版本并存漂移（0184 先例同形；历史迁移
-- 0108 零字节铁律不变——修法全走本新迁移，fresh 回放序=0108 建 13 参→本迁移 DROP+CREATE）。
--
-- 函数体对 0108 逐字节承袭，恰三处文字变：
--   ① DECLARE 段增 `v_enc_key text;` 声明行；
--   ② 校验段增 `v_enc_key := current_setting('app.conversation_event_enc_key', true);` 赋值，
--      原 `p_enc_key IS NULL OR length(p_enc_key)=0` 同位改 `v_enc_key`（同一 RAISE
--      ERRCODE='22023' 承接）；
--   ③ 加密行改 `pgp_sym_encrypt(p_body, v_enc_key)`。
-- 其余（advisory 锁/幂等重放/digest 重算/MAX+1/审计双 INSERT）与 0108 逐字节一致。
--
-- 授予面同形重申（授予随签名走：旧 13 参版 DROP 即其 ACL 消亡）：OWNER TO memory_runtime +
-- REVOKE ALL … FROM PUBLIC + GRANT EXECUTE … TO app_role（0108:273-276 同形·12 参签名）。
-- 0151 零触：memory_runtime 对 pgp_sym_encrypt(text,text) 的补授仍承重（新函数体仍执行该
-- 本体）；0121 对 app_role 的 pgp 补授零触。
--
-- GUC 名取两段形 `app.conversation_event_enc_key`（沿 app.principal_user 仓内现役两段先例）；
-- 值永不入任何表列/审计 payload/日志。配套应用侧两语句化见
-- packages/db/src/context/ctx03-event-source.ts appendConversationEvent。

DROP FUNCTION IF EXISTS conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,text,bigint,bigint);

CREATE OR REPLACE FUNCTION conversation_event_append(
  p_thread_id text,
  p_category text,
  p_source text,
  p_event_key text,
  p_body text,
  p_body_hmac text,
  p_hmac_key_version integer,
  p_enc_key_version integer,
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
  v_enc_key text;
BEGIN
  -- 0210：正文加密密钥改经事务级 GUC 注入（调用方同事务 set_config('app.conversation_event_enc_key',
  -- $1, true)·is_local=true 事务尾自清）；缺失/空即下方校验同码同语义 fail-closed（22023）。
  v_enc_key := current_setting('app.conversation_event_enc_key', true);
  IF principal IS NULL OR length(principal)=0
     OR p_thread_id IS NULL OR length(p_thread_id)=0
     OR p_category NOT IN ('turn_start','user_message','assistant_message','tool_call','tool_result','system_note')
     OR p_source NOT IN ('user','model','tool','system')
     OR p_body IS NULL OR length(p_body)=0
     OR p_body_hmac IS NULL OR p_body_hmac !~ '^[a-f0-9]{64}$'
     OR p_hmac_key_version IS NULL OR p_hmac_key_version < 1
     OR p_enc_key_version IS NULL OR p_enc_key_version < 1
     OR v_enc_key IS NULL OR length(v_enc_key)=0
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
  VALUES (v_artifact_id, principal, v_event_id, pgp_sym_encrypt(p_body, v_enc_key), p_body_hmac,
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
ALTER FUNCTION conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,bigint,bigint)
  OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,bigint,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,bigint,bigint) TO app_role;
