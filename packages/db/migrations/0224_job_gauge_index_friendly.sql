-- 0224_job_gauge_index_friendly.sql — gateway_job_gauges() 逐 status 可索引子查询改形（队列 status/lease 前导索引配套·事务迁移）
--
-- 每表一条 count(*) FILTER 三列聚合是单遍全表扫描，(status, lease_expires_at)
-- 前导索引对它无吸引力（PG 不为多 FILTER 单遍聚合拆索引）。改形为每表三个标量
-- 子查询后，各计数按 status 走对应索引键段。签名/列名/列型/ACL 与 0042 逐字
-- 不变，四行行序与 dead 谓词逐表不变（report=quarantined，其余=failed）。
--
-- 合规理由①：0144 §8 演进规则冻结只覆盖 tf_ 家族 13 名与 Tier-2 长尾 40 名；
-- gateway_job_gauges 不属任一集合（迁移目录内仅 0042 一份定义，不在
-- db-trigfam-unify 的 TF_MEMBERS 精确清单，不在 Tier-2 名单），故本刀属首次
-- 函数体变更、非规则所禁的「同名全量重贴」；不采用 tf_gateway_job_gauges/_v2
-- 包装——新增 tf_ 名会破 TF_MEMBERS 13 名精确集合门，代价高于收益。
-- 合规理由②：本体是单条 RETURN QUERY SELECT … UNION ALL … ⇒ PG 单语句单快照，
-- 与旧 FILTER 单遍扫描同快照；v_cutoff 在 DECLARE 段（函数入口）取一次，仍是
-- 单语句、单一求值点。禁拆多条 RETURN QUERY（plpgsql 多语句=多快照，破坏与旧
-- FILTER 的数值等价前提）。v_cutoff 为 Param，会进 running-expired 臂的
-- Index Cond（lease 列收益本体）。
--
-- 已知滞后镜像登记：packages/db/sql/24_runtime_observability_gateway.sql 是旧
-- FILTER 体镜像；无门覆盖，同步归 sql/ 镜像同步刀，本迁移零触。
CREATE OR REPLACE FUNCTION gateway_job_gauges()
RETURNS TABLE(queue text, queued bigint, running_expired bigint, dead bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_cutoff timestamptz := clock_timestamp();
BEGIN
  RETURN QUERY
    SELECT 'interview_job'::text,
      (SELECT count(*)::bigint FROM public.interview_job WHERE status = 'queued'),
      (SELECT count(*)::bigint FROM public.interview_job WHERE status = 'running' AND lease_expires_at < v_cutoff),
      (SELECT count(*)::bigint FROM public.interview_job WHERE status = 'failed')
    UNION ALL
    SELECT 'report'::text,
      (SELECT count(*)::bigint FROM public.ai_report WHERE status = 'queued'),
      (SELECT count(*)::bigint FROM public.ai_report WHERE status = 'running' AND lease_expires_at < v_cutoff),
      (SELECT count(*)::bigint FROM public.ai_report WHERE status = 'quarantined')
    UNION ALL
    SELECT 'quiz_job'::text,
      (SELECT count(*)::bigint FROM public.quiz_job WHERE status = 'queued'),
      (SELECT count(*)::bigint FROM public.quiz_job WHERE status = 'running' AND lease_expires_at < v_cutoff),
      (SELECT count(*)::bigint FROM public.quiz_job WHERE status = 'failed')
    UNION ALL
    SELECT 'diagnosis_job'::text,
      (SELECT count(*)::bigint FROM public.diagnosis_job WHERE status = 'queued'),
      (SELECT count(*)::bigint FROM public.diagnosis_job WHERE status = 'running' AND lease_expires_at < v_cutoff),
      (SELECT count(*)::bigint FROM public.diagnosis_job WHERE status = 'failed');
END;
$$;

REVOKE ALL ON FUNCTION gateway_job_gauges() FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_job_gauges() TO app_gateway_role;
