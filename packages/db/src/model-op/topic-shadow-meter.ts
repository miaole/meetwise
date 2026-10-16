/**
 * topic_shadow_meter（0179）的应用侧写入口（billing 战役 P2·BILL2-SHADOW-METER 修法②·§8 裁决项②
 * 按推荐行使=worker 收尾事务外围 fail-soft 钩子的 db 面）。
 * 影子计量=「只算不扣」（billing-redesign rev1 §7 上线序③原文）——本函数只写独立影子面（0179），
 * **零扣费零积分零结算铁律**（REQUEST §1-修法③）：零 topic_charge 创建（0172 未落亦不预写）、
 * 零 commerce 收口函数（reserve/confirm/release/sweep/reconcile）调用、零 entitlement 桶与
 * entitlement_consumption 读写、零 0046 触发器放松、零 billing_mode 触面。
 *
 * 形制沿 recordUsage（question-usage-ledger.ts 同文件族）：类型化入参 + SQL 单语句 + 类型化返回；
 * fail-soft 由调用方决定（同 0171 纪律）——调用点必须自行 catch，影子写失败绝不阻断面试收尾主链。
 *
 * 数据源=REQUEST §8 裁决项③按推荐行使：**interview_question 主源**（0170 三列·ix_iq_topic partial
 * 取数面）+ question_usage_ledger LEFT JOIN（tokens 成本对·一次聚合双列同出）+ interview 终态
 * （收尾事务**提交后**的照实读面——钩子在事务外围，读到的即三分支/generation 终态的已提交值）。
 * 有效作答判定与收尾 evidence 同源：answer_evaluated 事件（COALESCE(outcome,'answered')<>'unresolved'，
 * adaptive-lifecycle 收尾 eligible 谓词同形）——'跳过'/unresolved 作答不计有效。
 *
 * 逐话题 status（REQUEST §1.3 按现行收尾语义照实）：
 *   - interview.status='failed' 且 generationReason 在场（出题失败终态·generation_* 前缀）：
 *     有效作答话题照收='counted'（裁决③「系统原因提前结束=已完成话题照收」）·
 *     无有效作答话题='waived'+reason=generation 终态（该话题 0 分照实）；
 *   - interview.status='failed' 且无 generationReason（混合 unscored fail+release 臂）：
 *     全话题='failed_release' 照实（0046 钉死面·不做 P3 语义改写——影子数据即 P3 改写前实测基线）；
 *   - interview.status='completed'：有效作答>0 → 前 cap_value 个='counted'（话题首题 turn 升序）、
 *     其余='counted_capped'（0 分模拟）；无有效作答='skipped'（跳过 0 分）。
 * 场级行（row_kind='session'·idem_key='session'）：五分类计数（守恒由迁移 CHECK 承重）+
 * sum_uncapped=counted+capped、cap_hit（sum_uncapped>cap_value）、tokens 合计（ledger 直和）。
 * PK(owner,interview,idem_key) ON CONFLICT DO NOTHING=崩溃重放零重复（0171 同形）；
 * 返回是否新写（重放=false·recordUsage 返回形）。零话题行（旧行无 topic_id/首题前出题失败）零写。
 */
import type { Client } from '../principal.ts';

/** 影子计量版本（0171 question_usage_ledger.meter_version 预留列「P2 起填」的唯一兑现值·增量路径·存量 NULL 零回填）。 */
export const SHADOW_METER_VERSION = 'shadow-v1';

/** 蓝本 §11-3/§3.3 封顶初值 6（影子期复核终值=唯一残面开放点·本刀恒按 6 模拟·裁决④同值）。 */
export const SHADOW_METER_CAP = 6;

export interface WriteTopicShadowMeterInput {
  /** 出题失败终态 reason（generation_* 前缀·generationFailureOf 保证）。缺省=非 generation 终态。 */
  generationReason?: string;
}

/**
 * 聚合写一场的影子计量行（topic 行×N + session 行×1·单语句原子）。
 * 返回是否新写入（崩溃重放=false）。零话题行时零写（诚实无数据面）。
 */
export async function writeTopicShadowMeter(c: Client, owner: string, interviewId: string, input: WriteTopicShadowMeterInput = {}): Promise<boolean> {
  const generationReason = typeof input.generationReason === 'string' && input.generationReason.length > 0 ? input.generationReason : null;
  const r = await c.query(
    `WITH q AS (
       SELECT topic_id,
              count(*)::int AS question_count,
              count(*) FILTER (WHERE status = 'answered')::int AS applied_answers,
              min(turn)::int AS first_turn,
              array_to_string(array_agg(DISTINCT ask_mode) FILTER (WHERE ask_mode IS NOT NULL), '+') AS ask_mode,
              array_to_string(array_agg(DISTINCT clarify_cause) FILTER (WHERE clarify_cause IS NOT NULL), '+') AS clarify_cause,
              count(*) FILTER (WHERE status = 'answered' AND EXISTS (
                SELECT 1 FROM interview_event e
                 WHERE e.stream_key = interview_question.interview_id
                   AND e.kind = 'answer_evaluated'
                   AND e.payload->>'questionId' = interview_question.question_id
                   AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved'))::int AS valid_answers
         FROM interview_question
        WHERE owner_user_id = $1 AND interview_id = $2 AND topic_id IS NOT NULL
        GROUP BY topic_id
     ), terminal AS (
       SELECT (status = 'completed') AS completed FROM interview WHERE id = $2 AND owner_user_id = $1
     ), ranked AS (
       SELECT q.*,
              CASE WHEN q.valid_answers > 0 THEN row_number() OVER (
                     PARTITION BY q.valid_answers > 0 ORDER BY q.first_turn, q.topic_id) END AS rn
         FROM q
     ), judged AS (
       SELECT ranked.*,
              CASE
                WHEN NOT t.completed AND $3::text IS NOT NULL AND ranked.valid_answers = 0 THEN 'waived'
                WHEN NOT t.completed AND $3::text IS NOT NULL THEN 'counted'
                WHEN NOT t.completed THEN 'failed_release'
                WHEN ranked.valid_answers > 0 AND ranked.rn <= $4::int THEN 'counted'
                WHEN ranked.valid_answers > 0 THEN 'counted_capped'
                ELSE 'skipped'
              END AS metered_status
         FROM ranked CROSS JOIN terminal t
     ), agg AS (
       SELECT count(*)::int AS topics_total,
              count(*) FILTER (WHERE metered_status = 'counted')::int AS topics_counted,
              count(*) FILTER (WHERE metered_status = 'counted_capped')::int AS topics_capped,
              count(*) FILTER (WHERE metered_status = 'waived')::int AS topics_waived,
              count(*) FILTER (WHERE metered_status = 'skipped')::int AS topics_skipped,
              count(*) FILTER (WHERE metered_status = 'failed_release')::int AS topics_failed_release,
              count(*) FILTER (WHERE metered_status IN ('counted','counted_capped'))::int AS sum_uncapped
         FROM judged
     ), tok AS (
       SELECT COALESCE(sum(input_tokens), 0)::bigint AS input_tokens_sum,
              COALESCE(sum(output_tokens), 0)::bigint AS output_tokens_sum
         FROM question_usage_ledger WHERE owner_user_id = $1 AND interview_id = $2
     )
     INSERT INTO topic_shadow_meter(
       owner_user_id, interview_id, row_kind, topic_id, idem_key,
       answers, question_count, ask_mode, clarify_cause, status, reason,
       topics_total, topics_counted, topics_capped, topics_waived, topics_skipped, topics_failed_release,
       sum_uncapped, cap_value, cap_hit, input_tokens_sum, output_tokens_sum, meter_version)
     SELECT $1, $2, 'topic', j.topic_id, j.topic_id,
            j.applied_answers, j.question_count, j.ask_mode, j.clarify_cause, j.metered_status,
            CASE WHEN j.metered_status = 'waived' THEN $3::text END,
            a.topics_total, a.topics_counted, a.topics_capped, a.topics_waived, a.topics_skipped, a.topics_failed_release,
            a.sum_uncapped, $4::int, (a.sum_uncapped > $4::int), tk.input_tokens_sum, tk.output_tokens_sum, $5::text
       FROM judged j CROSS JOIN agg a CROSS JOIN tok tk
       UNION ALL
       SELECT $1, $2, 'session', NULL, 'session',
            NULL, NULL, NULL, NULL, NULL, NULL,
            a.topics_total, a.topics_counted, a.topics_capped, a.topics_waived, a.topics_skipped, a.topics_failed_release,
            a.sum_uncapped, $4::int, (a.sum_uncapped > $4::int), tk.input_tokens_sum, tk.output_tokens_sum, $5::text
       FROM agg a CROSS JOIN tok tk
       WHERE a.topics_total > 0
     ON CONFLICT (owner_user_id, interview_id, idem_key) DO NOTHING`,
    [owner, interviewId, generationReason, SHADOW_METER_CAP, SHADOW_METER_VERSION],
  );
  return (r.rowCount ?? 0) > 0;
}
