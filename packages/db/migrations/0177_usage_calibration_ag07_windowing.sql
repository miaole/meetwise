-- 0177_usage_calibration_ag07_windowing.sql
--
-- AG 成本轨②（AG-COST2 · AG-07 迁移四件套 + 因子合并语义 + 90 天保留期）持久化面：
-- ① 观测表 (owner,invocation_key) 去重保留最早 batch → PK 换键（去重与换键同一迁移同一事务，
--    先去重后换键：先换键不去重会因现存重复行直接失败，先去重不换键则膨胀机制未除）。
--    batch 列保留为溯源列（NOT NULL 维持·语义降级为「首次观测桶」）。
-- ② 配对函数加窗 v2 镜像：ai_usage_calibration_pairs_scoped_v2(text, timestamptz)
--    逐字镜像现时点 v1 体（0119 :438-472 + 0174 ③ usage_source 剔除谓词）仅增两处：
--    入参 p_since + WHERE 追加 AND i.completed_at > p_since。v1 函数零字节保留（回滚/对照面）。
-- ③ 水位线表 ai_usage_calibration_watermark(owner_user_id PK, last_completed_at)——RLS 同 0119
--    形制（ENABLE/FORCE + owner policy + GRANT SELECT,INSERT,UPDATE 给 app_role；UPSERT 需 UPDATE
--    通道·水位线系内部记账非账本·不违因子 insert-only）。单调推进由 UPSERT 的 GREATEST 承载
--    （绝不回拨·对账重放/乱序完成只前移）。
-- ④ gateway_usage_calibration_owners 枚举加窗 v2（0134 体镜像 + 与 v2 配对同谓词的 completed_at
--    下界·只返回窗口内有新配对的 owner）。v1 函数零字节保留。
-- ⑤ 水位线整批下界读（EXEC 细化·REQUEST §1-件③「传各 owner 水位线或整批最近水位·EXEC 细化」）：
--    SECURITY DEFINER 只读 MIN(last_completed_at)，worker tick 用它做枚举 v2 的 p_since
--    （无水位线行 → NULL → tick 以 -infinity 全量枚举一次=首跑与 v1 行为等价·此后单调收窄）。
-- ⑥ 90 天保留期（裁决项①(a) 本刀含）：SECURITY DEFINER 清除函数——app_role 对观测表保持无
--    DELETE（0119 :431 SELECT,INSERT GRANT 纪律零破坏），清除只经本函数且只触
--    ai_usage_calibration_observation 90 天前 created_at（绝不触因子表/账本/其他任何表）。
--
-- 迁移号登记：协调方裁定 0177=本刀（COST2）·刀 D（AG-D）改 0178（REQUEST §0.3-1 实测占用图：
-- 0174=刀 B 已并主线·0175=刀 C 计划·0176=qsec declare·本树实测顶=0174）。
-- Honesty: 本迁移为重启用做准备·旋钮缺省仍关停（USAGE_CALIBRATION_ENABLED 缺省 false 零翻转）。

-- ============================================================================
-- 件①：观测表 (owner,invocation_key) 去重（每组保留最早 batch 行）→ PK 换键。
-- 旧 PK(owner,batch,invocation_key) 下同组内 batch 必互异 → `a.batch > b.batch`
-- 恰好删净每组非最早行、保留字典序最早 batch 一行（batch=cal-YYYYMMDDHH 字典序=时间序）。
-- 唯一调用零丢失：只删组内多余膨胀行，绝不丢任何 (owner,key) 组。
-- ============================================================================
DELETE FROM ai_usage_calibration_observation AS a
  USING ai_usage_calibration_observation AS b
 WHERE a.owner_user_id = b.owner_user_id
   AND a.invocation_idempotency_key = b.invocation_idempotency_key
   AND a.batch > b.batch;

ALTER TABLE ai_usage_calibration_observation
  DROP CONSTRAINT ai_usage_calibration_observation_pkey;
ALTER TABLE ai_usage_calibration_observation
  ADD PRIMARY KEY (owner_user_id, invocation_idempotency_key);

-- ============================================================================
-- 件②：配对函数加窗 v2（逐字镜像现时点 v1 体·仅增 p_since 参数与 completed_at 下界谓词两处）。
-- p_since 传 NULL 时 `completed_at > NULL` 恒 NULL → 返回零行（fail-silent 空窗·无数据暴露面；
-- TS wrapper 侧以非空水位线/epoch 兜底，绝不传 NULL）。
-- ============================================================================
CREATE OR REPLACE FUNCTION ai_usage_calibration_pairs_scoped_v2(
  p_owner_user_id text,
  p_since timestamptz
)
RETURNS TABLE(
  idempotency_key text,
  service text,
  model text,
  estimate_input_tokens integer,
  provider_input_tokens integer,
  provider_output_tokens integer,
  observed_at_ms bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_owner_user_id IS NULL OR char_length(p_owner_user_id) NOT BETWEEN 1 AND 512 THEN
    RAISE EXCEPTION 'ai_usage_calibration_pairs_invalid_input' USING ERRCODE='check_violation';
  END IF;
  RETURN QUERY
    SELECT i.idempotency_key, i.service, h.model, i.estimate_input_tokens, i.input_tokens, i.output_tokens,
           (extract(epoch FROM i.completed_at) * 1000)::bigint AS observed_at_ms
      FROM ai_model_invocation AS i
      JOIN ai_model_logical_node_header AS h
        ON h.owner_user_id = i.owner_user_id
       AND h.logical_node_key_digest = i.logical_node_key_digest
     WHERE i.owner_user_id = p_owner_user_id
       AND i.estimate_input_tokens IS NOT NULL
       AND i.input_tokens IS NOT NULL
       AND i.usage_source IS DISTINCT FROM 'usage_missing'
       AND h.model IS NOT NULL
       AND i.completed_at > p_since
     ORDER BY i.completed_at, i.idempotency_key;
END;
$$;

REVOKE ALL ON FUNCTION ai_usage_calibration_pairs_scoped_v2(text, timestamptz) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_usage_calibration_pairs_scoped_v2(text, timestamptz) TO app_role;

-- ============================================================================
-- 件③：水位线表（owner PK 单列水位·裁决项③(a) owner 级粒度）+ RLS 同 0119 形制。
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_usage_calibration_watermark (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  last_completed_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id)
);

ALTER TABLE ai_usage_calibration_watermark ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_calibration_watermark FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_ai_usage_calibration_watermark_owner ON ai_usage_calibration_watermark;
CREATE POLICY p_ai_usage_calibration_watermark_owner ON ai_usage_calibration_watermark
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

GRANT SELECT, INSERT, UPDATE ON ai_usage_calibration_watermark TO app_role;

-- ============================================================================
-- 件④：gateway_usage_calibration_owners 枚举加窗 v2（0134 体镜像 + completed_at 下界谓词）。
-- ============================================================================
CREATE OR REPLACE FUNCTION gateway_usage_calibration_owners_v2(p_since timestamptz)
RETURNS TABLE(owner_user_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN QUERY
    SELECT DISTINCT i.owner_user_id::text
      FROM public.ai_model_invocation AS i
     WHERE i.estimate_input_tokens IS NOT NULL
       AND i.input_tokens IS NOT NULL
       AND i.completed_at IS NOT NULL
       AND i.completed_at > p_since;
END;
$$;

REVOKE ALL ON FUNCTION gateway_usage_calibration_owners_v2(timestamptz) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_usage_calibration_owners_v2(timestamptz) TO app_gateway_role;

-- ============================================================================
-- 件⑤（EXEC 细化）：水位线整批下界读——tick 枚举 p_since = MIN(last_completed_at)。
-- SECURITY DEFINER 只读；无行 → NULL（tick 侧以 -infinity 全量枚举=首跑 v1 等价）。
-- ============================================================================
CREATE OR REPLACE FUNCTION gateway_usage_calibration_watermark_floor()
RETURNS timestamptz
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT MIN(last_completed_at) FROM public.ai_usage_calibration_watermark
$$;

REVOKE ALL ON FUNCTION gateway_usage_calibration_watermark_floor() FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_usage_calibration_watermark_floor() TO app_gateway_role;

-- ============================================================================
-- 件⑥：90 天保留期清除函数（裁决项①(a)·SECURITY DEFINER·app_role 保持无 DELETE）。
-- 只触 ai_usage_calibration_observation；天数入参校验 fail-closed（1..3650·非法即 RAISE）。
-- ============================================================================
CREATE OR REPLACE FUNCTION ai_usage_calibration_observation_retention_purge(p_keep_days integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE purged integer;
BEGIN
  IF p_keep_days IS NULL OR p_keep_days < 1 OR p_keep_days > 3650 THEN
    RAISE EXCEPTION 'ai_usage_calibration_retention_invalid_input' USING ERRCODE='check_violation';
  END IF;
  DELETE FROM ai_usage_calibration_observation
   WHERE created_at < clock_timestamp() - make_interval(days => p_keep_days);
  GET DIAGNOSTICS purged = ROW_COUNT;
  RETURN purged;
END;
$$;

REVOKE ALL ON FUNCTION ai_usage_calibration_observation_retention_purge(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_usage_calibration_observation_retention_purge(integer) TO app_role;
