/**
 * 原语③ `appendEvent`：durable ordered event log。
 *
 * 同 stream advisory 事务锁串行 + INSERT…SELECT MAX+1 RETURNING seq（原子分配），
 * event_key 幂等（重复事件返回既有 seq，不产生新事件）。
 *
 * WHY 独立成文件（而非 inline 在 index.ts）：`index.ts` 会 re-export 本模块的调用方
 * （如 qbank-miss.ts），若 appendEvent 仍 inline 在 index.ts，则形成
 * `index.ts → qbank-miss.ts → index.ts` 的循环依赖，被 `pnpm arch` 的 no-circular 门禁拒绝。
 * 四原语是 DAG 最底层，绝不能参与任何依赖环——单独成文件是结构上的防环保证。
 */
import type { Client } from './principal.ts';
import { eventPayloadHasRawAnswer, remapInterviewAnswerDualWriteError } from './interview-answer-dual-write.ts';

/** 原语③：durable ordered event log——同 stream advisory 事务锁串行 + INSERT…SELECT MAX+1，返回分配到的 seq。 */
export async function appendEvent(c: Client, owner: string, stream: string, kind: string, payload: unknown, eventKey?: string): Promise<number> {
  // 0126 事件原文围栏：顶层 `answer` 键一律拒绝。answerId/answerHash 仍合法。
  // 触发器是安全边界；仓储先拒，避免把 TurnDto 展开进账本。
  if (eventPayloadHasRawAnswer(payload)) {
    throw Object.assign(new Error('interview_event_raw_answer_fenced'), { code: 'interview_event_raw_answer_fenced' });
  }
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [stream]);
  if (eventKey) {
    const prior = await c.query('SELECT seq FROM interview_event WHERE stream_key=$1 AND event_key=$2', [stream, eventKey]);
    if (prior.rowCount === 1) return Number(prior.rows[0].seq);
  }
  let r;
  try {
    r = await c.query(
      `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload,event_key)
       SELECT $1,$2,COALESCE(MAX(seq),0)+1,$3,$4,$5 FROM interview_event WHERE stream_key=$2
       ON CONFLICT (stream_key,event_key) WHERE event_key IS NOT NULL DO NOTHING
       RETURNING seq`, [owner, stream, kind, JSON.stringify(payload), eventKey ?? null]);
  } catch (error) {
    remapInterviewAnswerDualWriteError(error);
  }
  if (r.rowCount === 0 && eventKey) {
    const prior = await c.query('SELECT seq FROM interview_event WHERE stream_key=$1 AND event_key=$2', [stream, eventKey]);
    if (prior.rowCount === 1) return Number(prior.rows[0].seq);
  }
  if (r.rowCount !== 1) throw Object.assign(new Error('append_event_failed'), { code: 'append_event_failed' });
  return Number(r.rows[0].seq);
}
