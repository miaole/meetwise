-- 0179_ag_d_release_refused_claim.sql
-- AG-D-ADMISSION（AG 修复轨刀 D · AG-01 准入拒绝去终态化·修法案A refusal 释放 claim）。
-- REQUEST：ai-docs/delivery/harness/ag-d-admission-REQUEST.md rev3（pre-exec 双审 BOTH PASS + 协调方常设 loop 授权）。
-- 编号=0179（rev3 B2 席2 勘正起认领；实占复核 @主线 d6ee387c：0170/0171=计费 P1、0174=刀 B、
--   0175=刀 C、0177=成本②、0178=刀 E 已并线·0176=qbank qsec 在飞未并线·0179 空闲亲证）。
-- 语义权威=EXPERT-REVIEWS §四 :30 refused 行（「准入/预留/prepare 拒绝→零外呼零钱·breaker
--   no_signal·claim 释放可重试」）+ §七 :63 刀 D 行（0130:203-215 expired-claimed 重领现成落点）。
-- 红事实：三拒绝点（invoke.ts 共享准入 :674/本地 admission :742/预算尽 :784）现状
--   ai_model_fail_claim_scoped 写 failed 终态→0130:179-181 同键重试只重放失败=known-not-sent
--   被账本放大为永久键毒化（plan/ask 固定键族·30s 熔断窗过后仍死）。
-- 本函数=可写最小形释放（rev3 blocking B1 席2 处方，三层 shipped 守卫逐条亲证）：
--   ①0037:27-28 CHECK status='claimed' ⇒ lease_token IS NOT NULL AND lease_expires_at IS NOT NULL
--     → lease_token 原值承袭零改（NOT NULL）·status 留 'claimed'；
--   ②0088:92-104 claimed→claimed 守卫可变面恰唯 lease_token/lease_expires_at 双列且须双非空
--     （error_code/output/replayable/tokens/latency_ms/dispatched_at/completed_at 任一 DISTINCT 即
--     RAISE claim_renewal_invalid→error_code 禁写=拒绝码不经账本行承载，可观测面维持 invoke 返回值；
--     updated_at 不在守卫列清单——0130:213 shipped 即改先例）→ 仅 SET lease_expires_at=clock_timestamp()
--     （+updated_at）；
--   ③0088:55 consume_transition_permit → 先插 permit ('claimed','claimed')（逐字沿 0130:207-209
--     shipped 形），UPDATE 失配（claim 已被重领/已流转）则撤 permit 返 false（沿 0088:611-619
--     fail_claim 同形——调用方按 false 抛 model_invocation_admission_state 现状语义零变）。
--   释放后 lease_expires_at < clock_timestamp() 即刻为真 → 0130:215 重领谓词释放即匹配 →
--   同键 claim 'execute'（:211-212 重领覆写 token/expires）=「过期 claimed+承袭 token=可重领标记」
--   即 retryable_refused 的账本语义等价物（新 status 值被 0088:18-19 CHECK 五值封闭宇宙排除·Ban）。
-- 拒绝码白名单=瞬时准入族六码前置校验（沿 0088:596 regex 形收窄·rev3 裁决④E2「白名单前置通过即
--   放行」）：model_circuit_open / model_circuit_half_open / model_concurrency_exhausted
--   （ADMISSION_ERROR_CODES 三准入码 :34-36）+ cost_budget_exhausted（0033:127/0036:82 第三触发）
--   + model_admission_timeout / model_admission_failed（invoke.ts:738-740 本地 admission 族）。
--   确定性配置拒绝（operation_unknown/blocked/project_missing/disabled、failover cost policy
--   mismatch）不在族内→调用方分支仍走 ai_model_fail_claim_scoped failed 终态原样（retry 必败不放大）。
-- 历史迁移 0001-0169 冻结代 + 0170-0178 已并线新代零字节改（Ban）——本文件为唯一新迁移。

CREATE OR REPLACE FUNCTION ai_model_release_refused_claim_scoped(
  p_owner_user_id text,
  p_idempotency_key text,
  p_lease_token uuid,
  p_refused_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_lease_token IS NULL
    OR p_refused_code IS NULL
    OR p_refused_code NOT IN (
      'model_circuit_open',
      'model_circuit_half_open',
      'model_concurrency_exhausted',
      'cost_budget_exhausted',
      'model_admission_timeout',
      'model_admission_failed'
    )
    OR p_refused_code !~ '^[A-Za-z0-9._:-]{1,120}$' THEN
    RAISE EXCEPTION 'ai_model_release_refused_claim_invalid_input' USING ERRCODE='check_violation';
  END IF;
  PERFORM 1
    FROM ai_model_invocation
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
   FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO ai_model_invocation_transition_permit(
    owner_user_id,idempotency_key,expected_old_status,expected_new_status
  ) VALUES (p_owner_user_id,p_idempotency_key,'claimed','claimed')
  ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;
  -- 可写最小形：token 原值承袭（CAS 谓词=不得释放他人重领所得）·expires 置即刻过期。
  UPDATE ai_model_invocation
     SET lease_expires_at=clock_timestamp(), updated_at=clock_timestamp()
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND status='claimed' AND lease_token=p_lease_token;
  IF FOUND THEN RETURN true; END IF;
  DELETE FROM ai_model_invocation_transition_permit
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND expected_old_status='claimed' AND expected_new_status='claimed';
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION ai_model_release_refused_claim_scoped(text,text,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_model_release_refused_claim_scoped(text,text,uuid,text) TO app_role;
