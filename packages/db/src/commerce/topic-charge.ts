/**
 * topic_charge（0172）的应用侧结算面（billing 战役 P3·BILL3-SETTLEMENT 修法③）。
 * closeTopic=话题计费唯一写入口：汇总话题（0170 topic_id 维度·有效作答判据与 0180 影子聚合同族）→
 * 写 topic_charge 一行（counted=恒 1 分 / counted_capped=封顶后 0 分 / waived=跳过 0 分·裁决项②）。
 *
 * 并发/幂等（蓝本 §6.5 行 1 原文）：先对同场 entitlement_consumption 行 FOR UPDATE 串行化——
 * 防两个话题并发关闭同时读到「未封顶」双双计分越 cap；PK(owner,interview,topic) ON CONFLICT
 * DO NOTHING=崩溃重放天然去重（重放=written:false）。
 *
 * 模式闸（列即开关载体·Ban 新 env 闸）：billing_mode≠'per_topic_capped'（含缺省 per_session）→
 * 不读不写即时返回——per_session 全链零行为变更（REQUEST §5 增补行①）。无预留行（free/legacy 场）
 * 同样零写（零计费落点诚实面）。
 *
 * 形制沿 recordUsage（question-usage-ledger.ts 同文件族）：类型化入参 + 类型化返回。
 * 本文件零 fail-soft：结算面错误升级语义（与影子计量 fail-soft 相反·0171 头注原文）。
 */
import type { PoolClient as Client } from 'pg';   // 直接取 pg 类型,不从 ./index 桶引（否则 index↔commerce 成环）

/** 话题计费规则行值来源：interview.billing_rule_version（ck_interview_cap 保证 per_topic_capped 时非空）。 */
export interface InterviewBilling {
  billingMode: 'per_session' | 'per_topic_capped';
  billingCapUnits: number | null;
  billingRuleVersion: string | null;
}

/** 读 interview 计费行值（模式闸的单一事实源）。非 per_topic_capped 或行值不完整 → null（零结算面）。 */
export async function interviewBillingOf(c: Client, owner: string, interviewId: string): Promise<InterviewBilling | null> {
  const r = await c.query<{ billing_mode: string; billing_cap_units: string | null; billing_rule_version: string | null }>(
    'SELECT billing_mode, billing_cap_units, billing_rule_version FROM interview WHERE id=$1 AND owner_user_id=$2',
    [interviewId, owner]);
  const row = r.rows[0];
  if (!row) return null;
  const billing: InterviewBilling = {
    billingMode: row.billing_mode === 'per_topic_capped' ? 'per_topic_capped' : 'per_session',
    billingCapUnits: row.billing_cap_units == null ? null : Number(row.billing_cap_units),
    billingRuleVersion: row.billing_rule_version,
  };
  if (billing.billingMode !== 'per_topic_capped') return null;
  if (billing.billingCapUnits == null || !(billing.billingCapUnits > 0) || billing.billingRuleVersion == null) return null;
  return billing;
}

/** 同场已关闭话题的 counted units 合计（方案②公式的 Σ 面·触发器 0173 同式 SUM…FILTER）。 */
export async function topicCountedUnits(c: Client, owner: string, interviewId: string): Promise<number> {
  const r = await c.query<{ sum: string }>(
    `SELECT COALESCE(SUM(units) FILTER (WHERE status='counted'),0) AS sum
       FROM topic_charge WHERE owner_user_id=$1 AND interview_id=$2`, [owner, interviewId]);
  return Number(r.rows[0]?.sum ?? 0);
}

export type CloseTopicStatus = 'counted' | 'counted_capped' | 'waived';

export interface CloseTopicResult {
  /** 是否新写（PK 冲突重放=false·recordUsage 返回形）。模式闸未过/无预留行/零话题聚合数据=不写。 */
  written: boolean;
  /** 新写行的计费状态（未写=null）。 */
  status: CloseTopicStatus | null;
  /** 判定所据的累计 counted units（写后值·方案②对账面）。 */
  countedUnits: number;
}

/**
 * 关闭一个话题并落计费行（换话题 pivot 关闭上一话题 + 收尾 done 块关闭尾话题的 db 面·修法⑧）。
 * 判定（恒 1 分/话题·Ban 浮动定价）：有效作答=0 → waived 0 分（reason='skipped'·裁决项②按推荐行使）；
 * 累计 counted ≥ cap → counted_capped 0 分；否则 counted 1 分。
 */
export async function closeTopic(c: Client, owner: string, interviewId: string, topicId: string): Promise<CloseTopicResult> {
  // ① 模式闸：per_session（缺省）零行为变更=零读零写。
  const billing = await interviewBillingOf(c, owner, interviewId);
  if (!billing || billing.billingCapUnits == null || billing.billingRuleVersion == null) {
    return { written: false, status: null, countedUnits: 0 };
  }
  // ② 串行化：同场预留行 FOR UPDATE（蓝本 §6.5 行 1 原文——两话题并发关闭防同时读到「未封顶」）。
  //    无预留行（free/legacy 场）=零计费落点（诚实零写）。
  const consumption = await c.query<{ id: string }>(
    'SELECT id FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2 FOR UPDATE',
    [owner, interviewId]);
  if (consumption.rowCount === 0) return { written: false, status: null, countedUnits: 0 };
  // ③ 话题聚合（有效作答判据与 0180 影子聚合同族：answer_evaluated+COALESCE(outcome,'answered')<>'unresolved'
  //    且 payload.questionId 命中本话题题面——clarify/unresolved 不计有效）。
  const agg = await c.query<{ answers: number }>(
    `SELECT count(*)::int AS answers
       FROM interview_question q
      WHERE q.owner_user_id=$1 AND q.interview_id=$2 AND q.topic_id=$3
        AND EXISTS (
          SELECT 1 FROM interview_event e
           WHERE e.stream_key = q.interview_id
             AND e.kind = 'answer_evaluated'
             AND e.payload->>'questionId' = q.question_id
             AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved')`,
    [owner, interviewId, topicId]);
  const answers = Number(agg.rows[0]?.answers ?? 0);
  // ④ 累计封顶判定（FOR UPDATE 串行化下读 Σ 无竞态）。
  const countedSoFar = await topicCountedUnits(c, owner, interviewId);
  const cap = billing.billingCapUnits as number;
  const status: CloseTopicStatus = answers === 0 ? 'waived' : (countedSoFar >= cap ? 'counted_capped' : 'counted');
  const units = status === 'counted' ? 1 : 0;
  const reason = status === 'waived' ? 'skipped' : null;   // 裁决项②：跳过话题落 waived 行 reason='skipped'（明细可见）
  // ⑤ 落行（PK 冲突忽略=崩溃重放零重复）。
  const ins = await c.query<{ topic_id: string }>(
    `INSERT INTO topic_charge(owner_user_id, interview_id, topic_id, answers, units, status, reason, rule_version)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (owner_user_id, interview_id, topic_id) DO NOTHING
     RETURNING topic_id`,
    [owner, interviewId, topicId, answers, units, status, reason, billing.billingRuleVersion]);
  const written = (ins.rowCount ?? 0) === 1;
  return { written, status: written ? status : null, countedUnits: countedSoFar + (written && status === 'counted' ? 1 : 0) };
}

export interface TopicSettlementMismatch {
  interviewId: string;
  status: string;
  settled: string;
  expected: string;
  countedUnits: string;
}

/** 对账巡检（蓝本 §7 对账行·只告警不修复）：per_topic_capped 已结算场中 settled≠公式值的行。
 *  公式与 0173 触发器同式 round(requested×LEAST(Σ,cap)/cap, 2)——触发器已把同场新终态钉死，
 *  本巡检兜「触发器上线前已结算存量」与「行值 cap 被复核改值」两类时序缺口（只告警）。 */
export async function listTopicSettlementMismatches(c: Client, owner: string): Promise<TopicSettlementMismatch[]> {
  const r = await c.query<{
    interview_id: string; status: string; settled: string; expected: string; counted_units: string;
  }>(
    `SELECT ec.idempotency_key AS interview_id, ec.status, ec.units_settled::text AS settled,
            round(ec.units_requested * LEAST(COALESCE(tc.sum_units,0), i.billing_cap_units) / i.billing_cap_units, 2)::text AS expected,
            COALESCE(tc.sum_units,0)::text AS counted_units
       FROM entitlement_consumption ec
       JOIN interview i
         ON i.owner_user_id = ec.owner_user_id AND i.id = ec.idempotency_key
       LEFT JOIN (
         SELECT interview_id, SUM(units) FILTER (WHERE status='counted') AS sum_units
           FROM topic_charge WHERE owner_user_id=$1 GROUP BY interview_id
       ) tc ON tc.interview_id = ec.idempotency_key
      WHERE ec.owner_user_id=$1
        AND i.billing_mode='per_topic_capped'
        AND ec.status IN ('confirmed','partial_confirmed')
        AND ec.units_settled <> round(ec.units_requested * LEAST(COALESCE(tc.sum_units,0), i.billing_cap_units) / i.billing_cap_units, 2)`,
    [owner]);
  return r.rows.map((row) => ({
    interviewId: row.interview_id, status: row.status, settled: row.settled,
    expected: row.expected, countedUnits: row.counted_units,
  }));
}
