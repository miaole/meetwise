/**
 * question_usage_ledger（0171）的应用侧写入口（billing 战役 P1·BILL1-TOPIC-FIELDS 修法⑦）。
 * 归集表只做成本侧和审计，不参与默认方案定价（billing-redesign rev1 §6.2 原文）——
 * 因此本函数按审计面纪律 **fail-soft 由调用方决定**：调用点必须自行 catch，绝不让归集
 * 写失败阻断面试主链（与计费结算函数的错误升级语义相反，见下方调用点注记）。
 *
 * 形制沿 settleAiTextCost（ai-cost-governance.ts :61-65 同文件族）：类型化入参 + SQL 单语句 +
 * 类型化返回。usage（input/output/estimate/usage_source）不重复记账——本函数按 invocation_key
 * 从 ai_model_invocation（唯一真相）LEFT JOIN 归集复制：
 *   - 'missing'  ↔ 上游 usage_source='usage_missing'（0174 打标·AG-14 刀 B 折叠产物·REQUEST §1.4 映射）
 *   - 'provider' ↔ 上游 usage_source IS NULL 且 input_tokens 在场（供应商真实 usage）
 *   - 'estimate' ↔ 上游仅有 estimate_input_tokens（0119 保守估算面）
 *   - 'not_applicable' ↔ 上游行缺席（零外呼臂：admission 预派发拒绝等）或无 usage 无估算
 * PK (owner_user_id, invocation_key) 沿 0037 :26 同形，ON CONFLICT DO NOTHING = 崩溃重放天然去重。
 */
import type { Client } from '../principal.ts';

/** 蓝本 §6.2 cause 九值（CHECK 同枚举）。 */
export type QuestionUsageCause =
  | 'system_ask' | 'system_score' | 'system_plan' | 'retrieval' | 'report'
  | 'generation_failed' | 'unknown' | 'admission_rejected' | 'user_answer';

/** 蓝本 §6.2 usage_source 四值（CHECK 同枚举·'missing' ↔ 0174 'usage_missing'）。 */
export type QuestionUsageSource = 'provider' | 'estimate' | 'missing' | 'not_applicable';

export interface QuestionUsageLedgerEntry {
  /** 幂等键=ai_model_invocation.idempotency_key 同值（归集对账 join 面）。 */
  invocationKey: string;
  interviewId: string;
  /** 出题 seam 先于 question identity 发射 → 问/话维度可空；评分 seam 恒携带。 */
  questionId?: string;
  /** 话题主问题 id（0170 语义：probe/clarify=主问题 id；plan/ask 行可空）。 */
  topicId?: string;
  operationId: string;
  cause: QuestionUsageCause;
  /** 作答 utf8 字节长（评分行审计面；其余行可空）。 */
  answerLen?: number;
  /** 计量版本（预留列：P1 恒 NULL，影子计量刀（P2）起填）。 */
  meterVersion?: string;
}

/**
 * 写一条归集行。usage 列从 ai_model_invocation 按键归集复制（单语句·绝不二次记账），
 * 上游行缺席时落 not_applicable 裸行（失败臂审计仍入账）。PK 冲突忽略（蓝本 §6.5 原文）。
 * 返回是否新插入（重放=false）。
 */
export async function recordUsage(c: Client, owner: string, entry: QuestionUsageLedgerEntry): Promise<boolean> {
  const r = await c.query(
    `INSERT INTO question_usage_ledger(
        owner_user_id, invocation_key, interview_id, question_id, topic_id,
        operation_id, cause, answer_len, meter_version,
        input_tokens, output_tokens, estimate_input_tokens, usage_source)
     SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9,
            i.input_tokens, i.output_tokens, i.estimate_input_tokens,
            CASE
              WHEN i.usage_source = 'usage_missing' THEN 'missing'
              WHEN i.input_tokens IS NOT NULL THEN 'provider'
              WHEN i.estimate_input_tokens IS NOT NULL THEN 'estimate'
              ELSE 'not_applicable'
            END
       FROM (SELECT 1) AS seed
       LEFT JOIN ai_model_invocation AS i
         ON i.owner_user_id = $1 AND i.idempotency_key = $2
     ON CONFLICT (owner_user_id, invocation_key) DO NOTHING`,
    [
      owner,
      entry.invocationKey,
      entry.interviewId,
      entry.questionId ?? null,
      entry.topicId ?? null,
      entry.operationId,
      entry.cause,
      entry.answerLen ?? null,
      entry.meterVersion ?? null,
    ],
  );
  return (r.rowCount ?? 0) === 1;
}
