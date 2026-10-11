/**
 * 同 interview 已 served 题排除的持久面(H2 QBANK-CORPUS #79·最小形=refId 集合过滤)。
 *
 * 卷据:§3-⑤「排除已问题:同 interview 已 served 题排除…零已问机制现状故为新建面」。
 * 写入:dispatchTrackLocalRetrieval 的 served 转换同事务(原子,见 0162 头注);读取:同文件
 * Phase 3.5 与 difficulty 谓词同位过滤。表:qbank_served_question_ref(0162,RLS owner policy)。
 * 边界:排除范围=**同 interview**(interview 维度),跨 interview 判重仍是既有 wasAsked/episode
 * 精确判重面(零改);本表零删除语义(生命周期归 interview 擦除面后刀,非本刀范围)。
 */
import type { PoolClient as Client } from 'pg';
import { asPrincipal, type DbPool } from '../principal.ts';

const SAFE_QUESTION_REF = /^[A-Za-z0-9:_-]{1,160}$/;
const MAX_REFS_PER_SERVE = 64;

/** served 转换事务内登记(ON CONFLICT DO NOTHING:plan 重放/重复 serve 幂等不添行)。 */
export async function recordServedQbankQuestionRefs(
  c: Client, owner: string, interviewId: string, questionRefs: readonly string[],
): Promise<number> {
  if (!interviewId || interviewId.length > 512) throw new Error('qbank_served_ref_invalid_interview');
  const uniq = [...new Set(questionRefs)];
  if (uniq.length > MAX_REFS_PER_SERVE) throw new Error('qbank_served_ref_batch_too_large');
  for (const ref of uniq) {
    if (!SAFE_QUESTION_REF.test(ref)) throw new Error(`qbank_served_ref_invalid_ref:${ref.slice(0, 64)}`);
  }
  if (uniq.length === 0) return 0;
  let written = 0;
  for (const ref of uniq) {
    const r = await c.query(
      `INSERT INTO qbank_served_question_ref(owner_user_id, interview_id, question_ref)
       VALUES ($1,$2,$3)
       ON CONFLICT (owner_user_id, interview_id, question_ref) DO NOTHING`,
      [owner, interviewId, ref],
    );
    written += r.rowCount ?? 0;
  }
  return written;
}

/** 同 interview 已 served 题集合(过滤输入;缺表/空集=[] 由调用方 fail-closed 判定)。 */
export async function listServedQbankQuestionRefs(
  pool: DbPool, owner: string, interviewId: string,
): Promise<string[]> {
  if (!interviewId || interviewId.length > 512) throw new Error('qbank_served_ref_invalid_interview');
  return asPrincipal(pool, owner, async (c) => {
    const r = await c.query(
      'SELECT question_ref FROM qbank_served_question_ref WHERE owner_user_id=$1 AND interview_id=$2',
      [owner, interviewId],
    );
    return r.rows.map((row) => String((row as { question_ref: string }).question_ref));
  });
}
