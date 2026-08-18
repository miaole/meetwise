/**
 * @meetwise/db · INT-TRANSCRIPT-01 剩余 sink（event/ai_graph_run/report + checkpoint fence 锚）
 * 存储侧删除。
 *
 * 这是「删后 read=0」的第二块拼图：interview_event（event sink）、ai_graph_run（M1 缺口，
 * 0059 已 fence 但无删除 target/resolver）与 ai_report/assessment_report/learning_plan/
 * learning_progress/career_path/question_feedback（report sink）此前只有 RLS fence 读=0，
 * 无物理删除 target/receipt。本文件补它们的 begin-erasure / list-claimable / purge。
 *
 * **绝不重实现 PrivacyAuthorizationIssuer**——签发/验签/consume/claim 全部复用 0091 冻结
 * 代码（claim 对 interview_data 是 sink 无关的）；本文件只包 0096 自己的 resolver 三个函数。
 *
 * 隐私铁律（对齐 CLAUDE.md）：
 *   - event/report/ai_graph_run 的读写 fence 由 checkpoint resolver（0059 写 guard + RLS）承担；
 *     begin-erasure 里建 checkpoint fence 锚（sink='checkpoint_rows'、status='erased'）使
 *     interview_privacy_active() 转 false、0059 写 guard 真正触发；本域把这三个 sink 从
 *     「RLS 隐藏」推进到「真物理删除 + 逐 sink receipt」。
 *   - 删后 read=0 是真物理删除，不是只靠 RLS 假绿。vector/DB trace 无 interview 作用域键，
 *     本域**不建 target、不伪删除**（诚实 fail-closed 拒删，见 0096 头部注释）。
 *   - 授权防伪造：调用方不能自报 owner/scope；owner 恒取自 app.principal_user，claim 由
 *     冻结代码重验 owner/scope/subject/epoch/活 digest。
 */
import type { Client } from './principal.ts';

export interface InterviewProjectionErasureTarget {
  // checkpoint_rows 是 fence 锚（0096 Section C：sink='checkpoint_rows'、status='erased'、
  // deleted_count=0，只作 privacy_checkpoint_target 的 target_id 锚点，使
  // interview_privacy_active() 转 false）。它计入签名快照目标集（digest 逐字节相等），
  // 但绝不被 list-claimable 认领（两个 dispatch feed 均只认 pending/leased 过期/failed）。
  sink: 'event' | 'ai_graph_run' | 'report' | 'checkpoint_rows';
  resourceHmac: string;
  targetId: string;
}

export interface InterviewProjectionErasureRequest {
  requestId: string;
  status: 'fenced' | 'purging' | 'pending_external' | 'completed' | 'partial_failed' | 'authorization_paused';
  privacyEpoch: number;
  targetSetDigest: string;
  targets: InterviewProjectionErasureTarget[];
  replayed: boolean;
}

/**
 * 非破坏 fence（API 阶段）：清 interview_question.answer_hash（H1）、revoke enrollment + 建
 * checkpoint fence 锚（H2）、为 event + ai_graph_run + report 各建一个 pending target +
 * locator，钉下活 digest + epoch（复用冻结 claim 重验）。返回每 sink 一行（含 checkpoint_rows
 * fence 锚），编排层据此构建签名快照目标集。幂等键必须与 checkpoint/answer-artifact 两条流
 * 的 key 不同（否则命中对方 request 但查不到本域 target，上层 fail-closed 抛 unavailable）。
 */
export async function beginInterviewProjectionErasure(
  c: Client, interviewId: string, idempotencyKeyHash: string, privacyEpoch: number,
): Promise<InterviewProjectionErasureRequest> {
  const r = await c.query<{
    request_id: string; request_status: InterviewProjectionErasureRequest['status'];
    privacy_epoch: string | number; target_set_digest: string;
    sink: 'event' | 'ai_graph_run' | 'report' | 'checkpoint_rows'; resource_hmac: string; target_id: string; replayed: boolean;
  }>('SELECT * FROM interview_projection_begin_erasure($1,$2,$3)', [interviewId, idempotencyKeyHash, privacyEpoch]);
  const rows = r.rows;
  if (!rows.length || !rows[0]?.request_id || !rows[0]?.target_set_digest) {
    throw Object.assign(new Error('interview_projection_erasure_unavailable'), { code: 'interview_projection_erasure_unavailable' });
  }
  const epoch = Number(rows[0].privacy_epoch);
  if (!Number.isSafeInteger(epoch) || epoch < 1) {
    throw Object.assign(new Error('interview_projection_epoch_invalid'), { code: 'interview_projection_epoch_invalid' });
  }
  // 4 个 sink：event / ai_graph_run / report（真物理删除）+ checkpoint_rows（fence 锚）。
  // 缺任意一个说明活 digest 的目标集不全，签名快照会与 DB target_set_digest 漂移，故 fail-closed。
  const targets: InterviewProjectionErasureTarget[] = rows
    .filter((row) => (row.sink === 'event' || row.sink === 'ai_graph_run' || row.sink === 'report' || row.sink === 'checkpoint_rows') && typeof row.resource_hmac === 'string' && typeof row.target_id === 'string')
    .map((row) => ({ sink: row.sink, resourceHmac: row.resource_hmac, targetId: row.target_id }));
  if (targets.length !== 4) {
    throw Object.assign(new Error('interview_projection_targets_incomplete'), { code: 'interview_projection_targets_incomplete' });
  }
  return {
    requestId: rows[0].request_id, status: rows[0].request_status, privacyEpoch: epoch,
    targetSetDigest: rows[0].target_set_digest, targets, replayed: rows[0].replayed === true,
  };
}

/** 后台可认领目标（event/ai_graph_run/report 专用 dispatch feed；checkpoint_rows fence 锚不可认领）。 */
export async function listClaimableInterviewProjectionTargets(
  c: Client, maxItems = 32,
): Promise<Array<{ targetId: string; ownerUserId: string }>> {
  const r = await c.query<{ target_id: string; owner_user_id: string }>(
    'SELECT * FROM interview_projection_list_claimable_targets($1)', [maxItems],
  );
  return r.rows
    .filter((row) => typeof row.target_id === 'string' && typeof row.owner_user_id === 'string')
    .map((row) => ({ targetId: row.target_id, ownerUserId: row.owner_user_id }));
}

/** 后台物理删除（event/ai_graph_run/report 专用 purge；checkpoint_rows fence 锚不进此路径）。 */
export async function purgeInterviewProjectionTarget(
  c: Client, targetId: string, leaseToken: string,
): Promise<{ targetId: string; deletedCount: number; requestStatus: InterviewProjectionErasureRequest['status'] }> {
  const r = await c.query<{
    target_id: string; status: string; deleted_count: string | number; request_status: InterviewProjectionErasureRequest['status'];
  }>('SELECT * FROM privacy_purge_interview_projection_target($1,$2)', [targetId, leaseToken]);
  const row = r.rows[0];
  const deletedCount = Number(row?.deleted_count);
  if (!row?.target_id || row.status !== 'erased' || !Number.isSafeInteger(deletedCount) || deletedCount < 0)
    throw Object.assign(new Error('interview_projection_purge_invalid'), { code: 'interview_projection_purge_invalid' });
  return { targetId: row.target_id, deletedCount, requestStatus: row.request_status };
}
