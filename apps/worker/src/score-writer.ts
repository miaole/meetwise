/**
 * EXTREV-1 SCORE-WRITER S2 · worker 写卡步（rev2 D3+D4 写入形制不变·D6 桥已废）。
 *
 * 接线位（D4 裁定=后置异 txn）：**投影事务提交后**、同一 answer-job drain 内、以独立
 * asScoringWorkerPrincipal（scoring_worker_executor）事务 claim + 写卡；job 未 done 前完成
 * → requeue at-least-once + 0100 CAS（score_request claimed/dispatched→scored 单 winner）
 * = exactly-once 效果。
 *
 * 恢复钉（D4）：crash 重放**复用 claim 返回的既有 lease_token**（禁新造——pending→claimed
 * 单次 CAS，新 token 重放永远 claim 不到，请求会永久卡 claimed）。
 *
 * disposition 供源（#52 v6 起，S1 过渡桥已废除·rg 门零残留）：mock-interview.evaluate v6
 * 模型直出 per-criterion disposition（below/meets/exceeds + 逐字引文引文 span），evaluate 侧经
 * scoreDispositionFromCodeUnitSpan 派生 0103 契约证据（utf8_byte span+digest）随图 transcript
 * （checkpoint 审计投影，无答案原文）到达本步；模型不出总分，总分在 0103 DB 函数按确定性公式
 * 算。answer_evaluated.score 仍为 hint（进度提示/完成判定），其值 = computeDeterministicTotal
 * 的确定性派生（非模型自由输出）。
 *
 * 证据 span：v6 逐 criterion 引文 span（模型 quote→code-unit span→本域派生 byte span/digest）；
 * quote 只在 evaluate 期存活于内存，绝不入图 state/checkpoint。冲突/多来源裁决
 * （adjudicateScoreCard·SCOR-03）在 seed 单分项下结构性不触发（每卡恰一条证据），冲突面接线
 * 随 EXTREV-4 QBANK-CORPUS 扩项落地。
 */
import { randomUUID } from 'node:crypto';
import {
  asPrincipal, asScoringWorkerPrincipal, claimScoreRequest, fenceScoreRequest, writeFinalScoreCard,
  isInterviewPrivacyActive, findActiveScoreRequest,
  type DbPool,
} from '@meetwise/db';
import { reverifyScoreEvidenceSpan, type ScoredCriterionDisposition } from '@meetwise/domain';

/** 删除/撤权先赢（D3 fence 序）：这类 code 下不抛错、改走 fenceScoreRequest + 跳过。 */
function isPrivacyFenceCode(code: string | undefined): boolean {
  return code === 'interview_privacy_fenced' || code === 'interview_answer_fact_fenced';
}

export interface ScoreWriterDeps {
  pool: DbPool;
  owner: string;
  /** claim 的 lease_owner（job 级 worker 身份，与 interview job lease 同源）。 */
  leaseOwner: string;
}

export interface ScoreWriteQuery {
  interviewId: string;
  questionId: string;
  stateVersion: number;
  /** 答案明文（drain 内存态，绝不落图 state/checkpoint）；供 span/digest 复算。 */
  answerText: string;
  /** v6 模型档位证据（evaluate 侧派生·0103 契约形状；非 v5 hint 分——过渡桥已废除）。 */
  dispositions: readonly ScoredCriterionDisposition[];
}

export type ScoreWriteResult =
  | { kind: 'written'; requestId: string; cardId: string; deterministicTotal: number }
  | { kind: 'already_scored'; requestId: string }
  | { kind: 'skipped'; reason: 'no_request' | 'privacy_fenced' | 'unclaimable' };

/**
 * D4 写卡步本体。调用点：submitAdaptiveAnswer 投影事务提交之后（同一 answer-job drain、
 * markJobDone 之前）。幂等：重复调用复用既有 lease_token，已 scored 的请求直接 already_scored。
 */
export async function writeScoreCardAfterProjection(d: ScoreWriterDeps, q: ScoreWriteQuery): Promise<ScoreWriteResult> {
  // 定位（app_role 只读，owner 作用域 RLS）。无请求 = 该面试的答案不走 0092 账本家族
  // （0126 双写围栏：明文 /turn 家族结构性无 score_request）→ 静默跳过，不阻断 drain。
  const active = await asPrincipal(d.pool, d.owner, (c) => findActiveScoreRequest(c, q.interviewId, q.questionId, q.stateVersion));
  if (!active) return { kind: 'skipped', reason: 'no_request' };

  // fence 序（D3）：删除/撤权先赢。写卡前显式复核；已 fence → worker 侧补 fenceScoreRequest
  // （请求出途）+ 跳过（迟到结果不得写回）。writeFinal 内部还有同事务重验（纵深）。
  const privacyActive = await asPrincipal(d.pool, d.owner, (c) => isInterviewPrivacyActive(c, q.interviewId));
  if (!privacyActive) {
    await asScoringWorkerPrincipal(d.pool, d.owner, (c) => fenceScoreRequest(c, active.requestId));
    return { kind: 'skipped', reason: 'privacy_fenced' };
  }

  // 独立 asScoringWorkerPrincipal 事务：claim（单次 CAS）→（复用既有 token）→ writeFinal。
  return asScoringWorkerPrincipal(d.pool, d.owner, async (c) => {
    const freshToken = randomUUID();
    const claimed = await claimScoreRequest(c, active.requestId, d.leaseOwner, freshToken);
    if (!claimed.claimed && claimed.status === 'scored') return { kind: 'already_scored', requestId: active.requestId };
    // D4 恢复钉：非首次 drain（crash 重放/at-least-once 重投）复用既有 lease_token，禁新造。
    const leaseToken = claimed.claimed ? (claimed.leaseToken ?? freshToken) : (claimed.leaseToken ?? active.leaseToken);
    if (!leaseToken) return { kind: 'skipped', reason: 'unclaimable' };

    // v6：逐 criterion 直供档位证据。明文只在 drain 内存态存活——写卡前做一次文本级复验
    // （span 在当前答案版本内 + sha256(span 字节)==digest，domain 单源），不匹配 fail-closed
    // （绝不把对不上答案的证据写进卡）；空集/重复 criterionId 由 0103 writeFinal 确定性门兜底。
    const evidence = q.dispositions.map((d) => {
      if (!reverifyScoreEvidenceSpan(q.answerText, d.span, d.spanDigest)) {
        throw Object.assign(new Error('score_evidence_span_reverify_failed'), { code: 'score_evidence_span_reverify_failed' });
      }
      return {
        criterionId: d.criterionId,
        sourceAnswerId: active.artifactId,
        answerVersion: active.answerVersion,
        span: d.span,
        spanDigest: d.spanDigest,
        disposition: d.disposition,
      };
    });
    const written = await writeFinalScoreCard(c, {
      requestId: active.requestId,
      leaseToken,
      evidence,
      targetStatus: 'practice_eligible',
    });
    if (!written.recorded || !written.cardId) {
      // CAS 落败 = 已有 winner（迟到重放）；status='scored' 即幂等成功，其余状态如实返回。
      if (written.status === 'scored') return { kind: 'already_scored', requestId: active.requestId };
      return { kind: 'skipped', reason: 'unclaimable' };
    }
    return { kind: 'written', requestId: active.requestId, cardId: written.cardId, deterministicTotal: written.deterministicTotal ?? -1 };
  });
}

/** drain 接线处的 fence 类容错：删除/撤权竞态下跳过写卡（fence 先赢），其余异常如实上抛。 */
export async function writeScoreCardAfterProjectionFenceTolerant(d: ScoreWriterDeps, q: ScoreWriteQuery): Promise<ScoreWriteResult> {
  try {
    return await writeScoreCardAfterProjection(d, q);
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (isPrivacyFenceCode(code)) return { kind: 'skipped', reason: 'privacy_fenced' };
    throw error;
  }
}
