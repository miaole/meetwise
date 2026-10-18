-- 0207_ai_trace_backfill_scoped.sql — UC-028 A2 对账回补：ai_model_invocation succeeded 缺 trace 面 recon 承接
--
-- @migration-mode multi-statement
--
-- trace 写入是 fail-open 旁路（persistTraceBestEffort：INSERT 失败不回滚业务事务），
-- 丢失的 trace 行此前无任何回补路径。真相面 ai_model_invocation 的 succeeded 行
-- （error_code IS NULL·output NOT NULL 由 0037 CHECK 保证）就是零成本持久队列：
-- 本迁移提供「真相差集 → trace 缺行回补」的最小写面，回补=原 INSERT 语义逐字重放
-- （九列逐列直携真相面·零新数据面·output 含 redacted 标记位原样）。
--
-- 形制三先例：0056/0179 scoped SECURITY DEFINER 函数（require_request_owner 卫·输入校验）；
-- 0134/0203 gateway owner-only 枚举（只出 owner id·不暴露 invocation 内容/prompt/usage 明细，
-- gateway-dispatch.ts「The gateway returns only owner identifiers」纪律）；回补幂等 arbiter
-- =0001 ai_invocation_trace PK(owner_user_id,idempotency_key) 既有，ON CONFLICT DO NOTHING
-- ——零新约束零新表零新 role，ACL 皆新函数面。
--
-- 并发语义：原写与回补竞态=后到者 DO NOTHING，零重复零冲突错。

-- ①单 owner 单键回补：app_role 行级写面（每 owner 的反连接与回补都在 asPrincipal 内行使）。
CREATE OR REPLACE FUNCTION ai_trace_backfill_scoped(
  p_owner_user_id text,
  p_idempotency_key text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_owner_user_id IS NULL OR char_length(p_owner_user_id) NOT BETWEEN 1 AND 512
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256 THEN
    RAISE EXCEPTION 'ai_trace_backfill_invalid_input' USING ERRCODE='check_violation';
  END IF;
  INSERT INTO ai_invocation_trace
    (owner_user_id, idempotency_key, output, service, input_tokens, output_tokens,
     estimate_input_tokens, latency_ms, request_id)
  SELECT i.owner_user_id, i.idempotency_key, i.output, i.service, i.input_tokens, i.output_tokens,
         i.estimate_input_tokens, i.latency_ms, i.request_id
    FROM ai_model_invocation AS i
   WHERE i.owner_user_id = p_owner_user_id
     AND i.idempotency_key = p_idempotency_key
     AND i.status = 'succeeded'
     AND i.error_code IS NULL
  ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION ai_trace_backfill_scoped(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_trace_backfill_scoped(text,text) TO app_role;

-- ②跨 owner 差集枚举缝：只出「有 succeeded 缺 trace 行」的 owner id；幂等键不过 gateway 缝
-- （每 owner 的反连接在 asPrincipal 内行使）。聚合/枚举面与行级写面分离（0203 纪律）。
CREATE OR REPLACE FUNCTION gateway_trace_recon_missing_owners(p_limit integer)
RETURNS TABLE(owner_user_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 10000 THEN
    RAISE EXCEPTION 'gateway_trace_recon_limit_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT DISTINCT i.owner_user_id::text
      FROM public.ai_model_invocation AS i
     WHERE i.status = 'succeeded'
       AND i.error_code IS NULL
       AND NOT EXISTS (
            SELECT 1
              FROM public.ai_invocation_trace AS t
             WHERE t.owner_user_id = i.owner_user_id
               AND t.idempotency_key = i.idempotency_key)
     LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION gateway_trace_recon_missing_owners(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_trace_recon_missing_owners(integer) TO app_gateway_role;

-- ③差集非唯一 partial index：回补集=succeeded 且无错（谓词恒然），枚举与逐 owner 反连接同服。
CREATE INDEX IF NOT EXISTS ix_ai_model_invocation_trace_recon
  ON ai_model_invocation (owner_user_id, idempotency_key)
  WHERE status = 'succeeded' AND error_code IS NULL;
