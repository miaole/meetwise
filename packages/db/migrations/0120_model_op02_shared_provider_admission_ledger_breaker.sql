-- 0120_model_op02_shared_provider_admission_ledger_breaker.sql
--
-- MODEL-OP-02：共享 provider 准入 / 费用账本 / 并发 + 断路器（durable、跨副本）。
--
-- 目标：把「各适配器各自限流」收口成 invoke() 关口的**单一权威**，覆盖
--   providerAccount | region | modelOrRecipe | tenant/project | operation 五维。
-- 构建在 MODEL-OP-01 已落地的 `modelOperationAdmissionKey`（join 四字段）之上；
-- 本迁移把该分区从「纯函数字符串」升级为「持久化的准入/账本/断路器/并发租约」。
--
-- 四张表（app_role 全部 REVOKE ALL，只经 SECURITY DEFINER 过程读写，与 ai_cost_reservation 同范式）：
--   1. ai_model_admission_policy         —— operation 级准入 + 并发/断路器配置（种子自 registry）。
--   2. ai_model_fee_ledger               —— 每次调用的**钱**记录（真实 settled 金额 + 版本化价格策略）。
--   3. ai_model_breaker_state            —— 断路器状态机（closed→open→half_open→closed，显式 enum 非布尔汤）。
--   4. ai_model_concurrency_lease        —— 跨副本并发槽（slot 认领/释放/过期自愈）。
--
-- 与 MODEL-OP-00 的边界（不重实现）：
--   - 预算/结算权威仍是 ai_cost_reserve_text_scoped / ai_cost_settle_text_scoped（0033/0036）；
--     本迁移的 fee ledger 只记录「共享 operation 分区的钱事实」，金额来自既有结算结果。
--   - tokenizer 估算/对账权威仍是 ai_usage_calibration（0119）；fee ledger 是钱，不是估算。
--
-- 四原语落地：幂等（fee ledger PK(owner,idempotency) ON CONFLICT DO NOTHING）、
--   CAS（并发槽 UPDATE 原子认领；断路器 FOR UPDATE 单写者）、RLS（本迁移 4 表对 app_role
--   REVOKE ALL，只经 SECURITY DEFINER）、持久有序日志（fee ledger 逐调用落库可追溯）。

-- ============================================================================
-- 1. 准入策略表（operation 级 allow/block + 并发/断路器配置）
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_model_admission_policy (
  provider_account text NOT NULL CHECK (provider_account ~ '^[A-Za-z0-9._-]{1,80}$'),
  region text NOT NULL CHECK (region ~ '^[A-Za-z0-9._-]{1,80}$'),
  model_or_recipe text NOT NULL CHECK (model_or_recipe ~ '^[A-Za-z0-9._:-]{1,160}$'),
  operation_id text NOT NULL CHECK (operation_id ~ '^[A-Za-z0-9][A-Za-z0-9.-]{2,127}\.v[0-9]{1,3}$'),
  -- 显式 enum：allowed 才可派发；blocked 是 fail-closed（未知/未接线的 operation 也在此显式 blocked）。
  admission_status text NOT NULL CHECK (admission_status IN ('allowed','blocked')),
  -- 计量维度（与 registry 的 ModelOperationMeter 对齐；fee ledger 不冗余存，registry 是权威）。
  meter text NOT NULL CHECK (meter IN ('text-tokens','image-pages','embedding-vectors','rerank-candidates','audio-seconds','tts-characters','download-bytes')),
  -- 该 operation 分区的跨副本并发上限（取代 env MODEL_MAX_CONCURRENT）。
  max_concurrency integer NOT NULL CHECK (max_concurrency BETWEEN 1 AND 1000),
  -- 断路器：连续 failure 达阈值 → open；cooldown 到期 → half_open 单探针。
  breaker_threshold integer NOT NULL CHECK (breaker_threshold BETWEEN 1 AND 1000),
  breaker_cooldown_ms integer NOT NULL CHECK (breaker_cooldown_ms BETWEEN 0 AND 86400000),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (provider_account, region, model_or_recipe, operation_id)
);

-- 种子：7 个 wired operation='allowed'；8 个 unwired operation='blocked'（fail-closed 显式化）。
-- 与 packages/ai-runtime/src/model-operation-registry.ts 逐条对齐；未知 operation 无行 → operation_unknown。
INSERT INTO ai_model_admission_policy
  (provider_account, region, model_or_recipe, operation_id, admission_status, meter, max_concurrency, breaker_threshold, breaker_cooldown_ms)
VALUES
  -- 文本 6 op（dashscope-main 共享账户；并发 4 对齐旧 MODEL_MAX_CONCURRENT 默认；阈值 5 / 冷却 30s 对齐旧 breaker 默认）。
  ('dashscope-main','cn-beijing','planner',     'interview.competency-planning.v1','allowed','text-tokens',4,5,30000),
  ('dashscope-main','cn-beijing','questioner',  'interview.question-generation.v1','allowed','text-tokens',4,5,30000),
  ('dashscope-main','cn-beijing','scorer',      'interview.answer-scoring.v1','allowed','text-tokens',4,5,30000),
  ('dashscope-main','cn-beijing','quiz',        'interview.quiz-generation.v1','allowed','text-tokens',4,5,30000),
  ('dashscope-main','cn-beijing','diagnosis',   'resume.diagnosis.v1','allowed','text-tokens',4,5,30000),
  ('dashscope-main','cn-beijing','report',      'report.narrative.v1','allowed','text-tokens',4,5,30000),
  -- OCR 1 op（dashscope-native 账户；并发 2 保守；image-pages 计量）。
  ('dashscope-native','cn-beijing','vision-ocr','resume.ocr.v1','allowed','image-pages',2,5,30000),
  -- 8 个 unwired native operation：显式 blocked（MODEL-OP-04 之前 fail-closed）。
  ('dashscope-native','cn-beijing','embedding-build', 'qbank.embedding-build.v1','blocked','embedding-vectors',1,1,30000),
  ('dashscope-native','cn-beijing','embedding-query', 'qbank.embedding-query.v1','blocked','embedding-vectors',1,1,30000),
  ('dashscope-native','cn-beijing','rerank',          'qbank.rerank.v1','blocked','rerank-candidates',1,1,30000),
  ('dashscope-native','cn-beijing','asr',             'voice.asr.v1','blocked','audio-seconds',1,1,30000),
  ('dashscope-native','cn-beijing','asr-stream',      'voice.asr-stream.v1','blocked','audio-seconds',1,1,30000),
  ('dashscope-native','cn-beijing','tts',             'voice.tts.v1','blocked','tts-characters',1,1,30000),
  ('dashscope-native','cn-beijing','tts-stream',      'voice.tts-stream.v1','blocked','tts-characters',1,1,30000),
  ('dashscope-native','cn-beijing','tts-audio',       'voice.signed-download.v1','blocked','download-bytes',1,1,30000)
ON CONFLICT (provider_account, region, model_or_recipe, operation_id) DO NOTHING;

-- ============================================================================
-- 2. 费用账本（钱记录；PK(owner,idempotency) 幂等）
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_model_fee_ledger (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 1 AND 256),
  scope_id text CHECK (scope_id IS NULL OR scope_id ~ '^[A-Za-z0-9._:-]{1,160}$'),
  provider_account text NOT NULL CHECK (provider_account ~ '^[A-Za-z0-9._-]{1,80}$'),
  region text NOT NULL CHECK (region ~ '^[A-Za-z0-9._-]{1,80}$'),
  model_or_recipe text NOT NULL CHECK (model_or_recipe ~ '^[A-Za-z0-9._:-]{1,160}$'),
  operation_id text NOT NULL CHECK (operation_id ~ '^[A-Za-z0-9][A-Za-z0-9.-]{2,127}\.v[0-9]{1,3}$'),
  -- 版本化价格策略：与 ai_cost_reservation.price_revision 同根（immutable row identity，绝不 resolve latest）。
  price_revision text CHECK (price_revision IS NULL OR price_revision ~ '^[A-Za-z0-9._:-]{1,80}$'),
  input_tokens integer CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens integer CHECK (output_tokens IS NULL OR output_tokens >= 0),
  settled_micro_cny bigint CHECK (settled_micro_cny IS NULL OR settled_micro_cny >= 0),
  -- 显式 enum：settled（实际扣费）/ rejected（已知未执行，0 扣费）/ unknown（派发后不确定，待对账）。
  fee_status text NOT NULL CHECK (fee_status IN ('settled','rejected','unknown')),
  reason_code text CHECK (reason_code IS NULL OR char_length(reason_code) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  settled_at timestamptz,
  PRIMARY KEY (owner_user_id, idempotency_key)
);
-- 跨租户按 provider-account 聚合成本的索引（ops/对账用；app_role 无表访问权）。
CREATE INDEX IF NOT EXISTS ix_ai_model_fee_ledger_partition
  ON ai_model_fee_ledger(provider_account, region, model_or_recipe, operation_id, created_at);

-- ============================================================================
-- 3. 断路器状态机（durable；显式 enum phase，非布尔汤）
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_model_breaker_state (
  provider_account text NOT NULL CHECK (provider_account ~ '^[A-Za-z0-9._-]{1,80}$'),
  region text NOT NULL CHECK (region ~ '^[A-Za-z0-9._-]{1,80}$'),
  model_or_recipe text NOT NULL CHECK (model_or_recipe ~ '^[A-Za-z0-9._:-]{1,160}$'),
  operation_id text NOT NULL CHECK (operation_id ~ '^[A-Za-z0-9][A-Za-z0-9.-]{2,127}\.v[0-9]{1,3}$'),
  -- 显式 enum：closed→(failure 达阈值)→open→(cooldown 到期)→half_open→(探针)→closed/open。
  phase text NOT NULL CHECK (phase IN ('closed','open','half_open')),
  consecutive_failures integer NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
  opened_at timestamptz,
  -- half_open 单探针租约：非 NULL 表示探针被某一执行持有；到期自愈。
  half_open_probe_token uuid,
  half_open_probe_expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (provider_account, region, model_or_recipe, operation_id)
);

-- ============================================================================
-- 4. 并发租约槽（跨副本；slot_index 0..max_concurrency-1）
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_model_concurrency_lease (
  provider_account text NOT NULL CHECK (provider_account ~ '^[A-Za-z0-9._-]{1,80}$'),
  region text NOT NULL CHECK (region ~ '^[A-Za-z0-9._-]{1,80}$'),
  model_or_recipe text NOT NULL CHECK (model_or_recipe ~ '^[A-Za-z0-9._:-]{1,160}$'),
  operation_id text NOT NULL CHECK (operation_id ~ '^[A-Za-z0-9][A-Za-z0-9.-]{2,127}\.v[0-9]{1,3}$'),
  slot_index integer NOT NULL CHECK (slot_index >= 0),
  owner_user_id text,
  idempotency_key text,
  lease_expires_at timestamptz,
  PRIMARY KEY (provider_account, region, model_or_recipe, operation_id, slot_index)
);

REVOKE ALL ON ai_model_admission_policy, ai_model_fee_ledger, ai_model_breaker_state, ai_model_concurrency_lease FROM app_role;

-- ============================================================================
-- acquire：准入决策 + 断路器入场 + 并发槽认领（单一 SECURITY DEFINER，原子）。
-- 决策显式 enum：admitted / operation_unknown / operation_blocked / project_missing /
--   project_disabled / breaker_open / breaker_half_open_busy / concurrency_exhausted。
-- 顺序保证无泄漏：断路器行锁先持有（serialize 同分区 acquire）→ 并发槽认领 → 探针获取。
-- ============================================================================
CREATE OR REPLACE FUNCTION ai_model_admission_acquire_scoped(
  p_owner_user_id text,
  p_provider_account text,
  p_region text,
  p_model_or_recipe text,
  p_operation_id text,
  p_scope_id text,
  p_idempotency_key text,
  p_lease_seconds integer,
  p_probe_token uuid
)
RETURNS TABLE(decision text, slot_index integer, probe_acquired boolean, breaker_threshold integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  policy_row ai_model_admission_policy%ROWTYPE;
  breaker ai_model_breaker_state%ROWTYPE;
  project ai_cost_budget_policy%ROWTYPE;
  acquired_slot integer := -1;
  cooled boolean;
BEGIN
  -- `probe_acquired` 是 RETURNS TABLE 的 OUT 参数（同名变量），不得在 DECLARE 再声明；显式置 false 兜底非 half_open 路径。
  probe_acquired := false;
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_owner_user_id IS NULL OR char_length(p_owner_user_id) NOT BETWEEN 1 AND 512
    OR p_provider_account IS NULL OR p_provider_account !~ '^[A-Za-z0-9._-]{1,80}$'
    OR p_region IS NULL OR p_region !~ '^[A-Za-z0-9._-]{1,80}$'
    OR p_model_or_recipe IS NULL OR p_model_or_recipe !~ '^[A-Za-z0-9._:-]{1,160}$'
    OR p_operation_id IS NULL OR p_operation_id !~ '^[A-Za-z0-9][A-Za-z0-9.-]{2,127}\.v[0-9]{1,3}$'
    OR (p_scope_id IS NOT NULL AND p_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$')
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_lease_seconds IS NULL OR p_lease_seconds NOT BETWEEN 1 AND 3600
    OR p_probe_token IS NULL THEN
    RAISE EXCEPTION 'ai_model_admission_acquire_invalid_input' USING ERRCODE='check_violation';
  END IF;

  -- (1) operation 准入策略：未知/blocked fail-closed。
  SELECT * INTO policy_row FROM ai_model_admission_policy
   WHERE provider_account=p_provider_account AND region=p_region
     AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'operation_unknown'::text, -1, false, 0;
    RETURN;
  END IF;
  IF policy_row.admission_status <> 'allowed' THEN
    RETURN QUERY SELECT 'operation_blocked'::text, -1, false, policy_row.breaker_threshold;
    RETURN;
  END IF;

  -- (2) project（tenant 预算 scope）准入：仅计费调用（有 scope）校验；unbilled 跳过。
  IF p_scope_id IS NOT NULL THEN
    SELECT * INTO project FROM ai_cost_budget_policy WHERE scope_id=p_scope_id;
    IF NOT FOUND THEN
      RETURN QUERY SELECT 'project_missing'::text, -1, false, policy_row.breaker_threshold;
      RETURN;
    END IF;
    IF NOT project.enabled THEN
      RETURN QUERY SELECT 'project_disabled'::text, -1, false, policy_row.breaker_threshold;
      RETURN;
    END IF;
  END IF;

  -- (3) 断路器入场：先锁行（serialize 同分区），open 未冷却→拒绝；冷却到期→half_open；
  --     half_open 探针被占→拒绝。此锁持有到函数结束，保证探针/槽不被并发抢。
  INSERT INTO ai_model_breaker_state(provider_account,region,model_or_recipe,operation_id,phase)
  VALUES (p_provider_account,p_region,p_model_or_recipe,p_operation_id,'closed')
  ON CONFLICT (provider_account,region,model_or_recipe,operation_id) DO NOTHING;
  SELECT * INTO breaker FROM ai_model_breaker_state
   WHERE provider_account=p_provider_account AND region=p_region
     AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id
   FOR UPDATE;
  IF breaker.phase = 'open' THEN
    cooled := breaker.opened_at IS NULL
      OR (EXTRACT(EPOCH FROM (clock_timestamp() - breaker.opened_at)) * 1000)::bigint >= policy_row.breaker_cooldown_ms;
    IF NOT cooled THEN
      RETURN QUERY SELECT 'breaker_open'::text, -1, false, policy_row.breaker_threshold;
      RETURN;
    END IF;
    UPDATE ai_model_breaker_state
       SET phase='half_open', half_open_probe_token=NULL, half_open_probe_expires_at=NULL, updated_at=clock_timestamp()
     WHERE provider_account=p_provider_account AND region=p_region
       AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id;
    breaker.phase := 'half_open';
  END IF;
  IF breaker.phase = 'half_open' THEN
    IF breaker.half_open_probe_token IS NOT NULL
      AND breaker.half_open_probe_expires_at IS NOT NULL
      AND breaker.half_open_probe_expires_at > clock_timestamp() THEN
      RETURN QUERY SELECT 'breaker_half_open_busy'::text, -1, false, policy_row.breaker_threshold;
      RETURN;
    END IF;
  END IF;

  -- (4) 并发槽认领：确保槽存在后，原子认领空闲/过期槽。
  INSERT INTO ai_model_concurrency_lease(provider_account,region,model_or_recipe,operation_id,slot_index)
  SELECT p_provider_account,p_region,p_model_or_recipe,p_operation_id,g
    FROM generate_series(0, policy_row.max_concurrency - 1) AS g
  -- 无目标 ON CONFLICT：唯一约束只有本表主键，等价 DO NOTHING；且避免在冲突目标里写 `slot_index`
  -- （该列名与 RETURNS TABLE 的 OUT 参数同名，PL/pgSQL 会报 ambiguous column reference）。
  ON CONFLICT DO NOTHING;
  FOR i IN 0 .. policy_row.max_concurrency - 1 LOOP
    UPDATE ai_model_concurrency_lease
       SET owner_user_id=p_owner_user_id, idempotency_key=p_idempotency_key,
           lease_expires_at=clock_timestamp()+make_interval(secs => p_lease_seconds)
     WHERE provider_account=p_provider_account AND region=p_region
       AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id
       -- 显式限定表列：`slot_index` 与 OUT 参数同名，不限定会 ambiguous。
       AND ai_model_concurrency_lease.slot_index=i
       AND (owner_user_id IS NULL OR lease_expires_at < clock_timestamp());
    IF FOUND THEN
      acquired_slot := i;
      EXIT;
    END IF;
  END LOOP;
  IF acquired_slot < 0 THEN
    RETURN QUERY SELECT 'concurrency_exhausted'::text, -1, false, policy_row.breaker_threshold;
    RETURN;
  END IF;

  -- (5) half_open 探针获取（锁持有中，必无竞争）。
  IF breaker.phase = 'half_open' THEN
    UPDATE ai_model_breaker_state
       SET half_open_probe_token=p_probe_token,
           half_open_probe_expires_at=clock_timestamp()+make_interval(secs => p_lease_seconds),
           updated_at=clock_timestamp()
     WHERE provider_account=p_provider_account AND region=p_region
       AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id;
    probe_acquired := true;
  END IF;

  RETURN QUERY SELECT 'admitted'::text, acquired_slot, probe_acquired, policy_row.breaker_threshold;
END;
$$;

REVOKE ALL ON FUNCTION ai_model_admission_acquire_scoped(text,text,text,text,text,text,text,integer,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_model_admission_acquire_scoped(text,text,text,text,text,text,text,integer,uuid) TO app_role;

-- ============================================================================
-- record：断路器相位转移 + 费用账本落库 + 并发槽/探针释放（原子，执行后单事务）。
-- p_outcome ∈ 'success' | 'failure' | 'no_signal'：
--   success  → closed（复位 failure）
--   failure  → failure+1；half_open 或达阈值 → open
--   no_signal → 相位不变、只还探针/槽（确定性拒绝/派发前失败，无 provider 信号）
-- p_fee_status ∈ 'settled' | 'rejected' | 'unknown' 或 NULL（unbilled 不写账本）。
-- ============================================================================
CREATE OR REPLACE FUNCTION ai_model_admission_record_scoped(
  p_owner_user_id text,
  p_provider_account text,
  p_region text,
  p_model_or_recipe text,
  p_operation_id text,
  p_idempotency_key text,
  p_slot_index integer,
  p_probe_token uuid,
  p_outcome text,
  p_breaker_threshold integer,
  p_scope_id text,
  p_price_revision text,
  p_input_tokens integer,
  p_output_tokens integer,
  p_settled_micro_cny bigint,
  p_fee_status text,
  p_reason_code text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  breaker ai_model_breaker_state%ROWTYPE;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_outcome NOT IN ('success','failure','no_signal') THEN
    RAISE EXCEPTION 'ai_model_admission_record_invalid_outcome' USING ERRCODE='check_violation';
  END IF;
  IF p_fee_status IS NOT NULL AND p_fee_status NOT IN ('settled','rejected','unknown') THEN
    RAISE EXCEPTION 'ai_model_admission_record_invalid_fee_status' USING ERRCODE='check_violation';
  END IF;

  -- 释放并发槽：match(owner,idempotency) 保证过期被他人复用后，stale 释放绝不误清他人槽。
  UPDATE ai_model_concurrency_lease
     SET owner_user_id=NULL, idempotency_key=NULL, lease_expires_at=NULL
   WHERE provider_account=p_provider_account AND region=p_region
     AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id
     AND slot_index=p_slot_index
     AND owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key;

  SELECT * INTO breaker FROM ai_model_breaker_state
   WHERE provider_account=p_provider_account AND region=p_region
     AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id
   FOR UPDATE;
  IF NOT FOUND THEN
    -- acquire 成功则必有行；缺行=corruption，fail-closed 而非静默跳过。
    RAISE EXCEPTION 'ai_model_admission_breaker_missing' USING ERRCODE='integrity_constraint_violation';
  END IF;

  IF p_outcome = 'success' THEN
    UPDATE ai_model_breaker_state
       SET phase='closed', consecutive_failures=0, opened_at=NULL,
           half_open_probe_token=NULL, half_open_probe_expires_at=NULL, updated_at=clock_timestamp()
     WHERE provider_account=p_provider_account AND region=p_region
       AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id;
  ELSIF p_outcome = 'failure' THEN
    IF breaker.phase = 'half_open' OR breaker.consecutive_failures + 1 >= p_breaker_threshold THEN
      UPDATE ai_model_breaker_state
         SET phase='open', consecutive_failures=consecutive_failures+1, opened_at=clock_timestamp(),
             half_open_probe_token=NULL, half_open_probe_expires_at=NULL, updated_at=clock_timestamp()
       WHERE provider_account=p_provider_account AND region=p_region
         AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id;
    ELSE
      UPDATE ai_model_breaker_state
         SET consecutive_failures=consecutive_failures+1,
             half_open_probe_token=NULL, half_open_probe_expires_at=NULL, updated_at=clock_timestamp()
       WHERE provider_account=p_provider_account AND region=p_region
         AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id;
    END IF;
  ELSE
    -- no_signal：相位不变，只还探针（match token 防误清新探针）。
    UPDATE ai_model_breaker_state
       SET half_open_probe_token=NULL, half_open_probe_expires_at=NULL, updated_at=clock_timestamp()
     WHERE provider_account=p_provider_account AND region=p_region
       AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id
       AND half_open_probe_token = p_probe_token;
  END IF;

  -- 费用账本（钱记录）：仅 billed（p_fee_status 非 NULL）落库；幂等 ON CONFLICT DO NOTHING。
  IF p_fee_status IS NOT NULL THEN
    INSERT INTO ai_model_fee_ledger(
      owner_user_id,idempotency_key,scope_id,provider_account,region,model_or_recipe,operation_id,
      price_revision,input_tokens,output_tokens,settled_micro_cny,fee_status,reason_code,settled_at
    ) VALUES (
      p_owner_user_id,p_idempotency_key,p_scope_id,p_provider_account,p_region,p_model_or_recipe,p_operation_id,
      p_price_revision,p_input_tokens,p_output_tokens,p_settled_micro_cny,p_fee_status,
      -- reason_code 可空；left(NULL,120) 返回 NULL。绝不用 COALESCE 兜成空串——空串违反列上
      -- CHECK(reason_code IS NULL OR char_length BETWEEN 1 AND 120)，会把 settled(无 reason) 的整次 record 打失败。
      left(p_reason_code,120),
      CASE WHEN p_fee_status='settled' THEN clock_timestamp() ELSE NULL END
    ) ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION ai_model_admission_record_scoped(text,text,text,text,text,text,integer,uuid,text,integer,text,text,integer,integer,bigint,text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_model_admission_record_scoped(text,text,text,text,text,text,integer,uuid,text,integer,text,text,integer,integer,bigint,text,text) TO app_role;
