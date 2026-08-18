/**
 * INT-TRANSCRIPT-01 剩余 sink（event/ai_graph_run/report/checkpoint fence 锚/answer_hash/
 * vector/trace）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - event(interview_event) + ai_graph_run（M1：0059 已 fence 但无删除 target/resolver）+
 *     report(ai_report/assessment_report/learning_plan/learning_progress/career_path/
 *     question_feedback) 的删除 resolver/ledger/target/物理删除 + 逐 sink receipt：
 *     **删后 read=0 是真物理删除**，不是只靠 RLS fence 假绿。
 *   - H2 fence 对齐 0058/0059：begin-erasure 清 answer_hash、revoke enrollment、建
 *     checkpoint fence 锚（sink='checkpoint_rows'/erased）使 interview_privacy_active()
 *     转 false，0059 写 guard 拒 late append（fence 持久到 purge 提交后，不复活）。
 *   - 复用冻结 PrivacyAuthorizationIssuer（0091）：sign→issue→consume→claim→purge 全链路，
 *     目标集活 digest 与签名快照逐字节相等（TS↔SQL H1，含 4 target），跨 owner/digest 不符/
 *     二次消费全 fail-closed。
 *   - pending_external / failed_cleanup 绝不伪造 completed（0091 no-forge-completed
 *     guard 是 DB 约束）。
 *   - interview_question.answer_hash 低熵 oracle 随**活删除流** begin-erasure 清除为 NULL
 *     （H1，不依赖 0075 已暂停的 privacy_begin_checkpoint_erasure）；且 0075 暂停被保留。
 *   - vector_chunk / ai_invocation_trace 无 interview 作用域键 → 诚实 fail-closed 拒删：
 *     不为它们建 target、也绝不误删其行。
 *   - begin-erasure 幂等竞态（20 并发单 INSERT winner）+ claim CAS 单 winner +
 *     list-claimable dispatch feed + fence 锚跨流隔离（不泄漏进 checkpoint/projection 两个
 *     dispatch feed）。
 */
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget,
  issueAuthorizationSnapshot, consumeAuthorizationSnapshot, claimAuthorizationTarget,
  recordDeletionReceipt,
  beginInterviewProjectionErasure, listClaimableInterviewProjectionTargets, purgeInterviewProjectionTarget,
  type Client,
} from '@meetwise/db';
import {
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';

const admin = createPool();
const owner = `int-transcript-sinks-owner-${process.pid}`;
const otherOwner = `int-transcript-sinks-other-${process.pid}`;
const worker = `int-transcript-sinks-worker-${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);
const KEY = generatePrivacyAuthzKeyPair('privacy-del-2026-01');

// vector_chunk.embedding 是 vector(512)：用 512 维零向量字面量（只验证「不误删」，不验证语义）。
const VEC512 = '[' + new Array(512).fill(0).join(',') + ']';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

// 签发器专用 principal（SET LOCAL ROLE privacy_issuer + 绑定 owner GUC），模拟未来 issuer 服务。
async function asIssuer<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE privacy_issuer');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

let hashCounter = 0;
const nextHash = () => (++hashCounter).toString(16).padStart(64, '0');

async function insertInterview(ownerId: string, interviewId: string): Promise<void> {
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, ownerId],
  );
}

// 面试事件流（stream_key = interview id；interview/quiz/diagnosis 共用该表，本 sink 只删本面试自己的流）。
async function insertEvent(ownerId: string, interviewId: string, seq: number, kind: string): Promise<void> {
  await asPrincipal(admin, ownerId, (c) => c.query(
    `INSERT INTO interview_event(owner_user_id, stream_key, seq, kind, payload)
     VALUES (current_setting('app.principal_user', true), $1, $2, $3, '{}'::jsonb)`,
    [interviewId, seq, kind],
  ));
}

// ai_graph_run（M1 缺口）：thread_id=interview id，0059 已 fence 写 guard（BEFORE INSERT 触发器
// + RLS）但 0096 前无删除 target/resolver。status='completed' 避开 uq_active_run 部分唯一索引。
async function insertGraphRun(ownerId: string, interviewId: string): Promise<void> {
  await asPrincipal(admin, ownerId, (c) => c.query(
    `INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
     VALUES ('mock-interview', $1, current_setting('app.principal_user', true), 'completed')`,
    [interviewId],
  ));
}

// 6 张 report 投影表各插一行（走 app_role + 写 guard 触发，验证 fence 前可写）。
async function insertReportFixtures(ownerId: string, interviewId: string): Promise<void> {
  await asPrincipal(admin, ownerId, async (c) => {
    await c.query(
      `INSERT INTO ai_report(owner_user_id, interview_id)
       VALUES (current_setting('app.principal_user', true), $1)`, [interviewId]);
    await c.query(
      `INSERT INTO assessment_report(id, owner_user_id, interview_id)
       VALUES ($1, current_setting('app.principal_user', true), $2)`, [`ar-${interviewId}`, interviewId]);
    await c.query(
      `INSERT INTO learning_plan(id, owner_user_id, interview_id)
       VALUES ($1, current_setting('app.principal_user', true), $2)`, [`lp-${interviewId}`, interviewId]);
    await c.query(
      `INSERT INTO learning_progress(owner_user_id, interview_id, topic)
       VALUES (current_setting('app.principal_user', true), $1, 'topic-1')`, [interviewId]);
    await c.query(
      `INSERT INTO career_path(id, owner_user_id, interview_id, readiness, level)
       VALUES ($1, current_setting('app.principal_user', true), $2, 'mid', 'senior')`, [`cp-${interviewId}`, interviewId]);
    await c.query(
      `INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating)
       VALUES (current_setting('app.principal_user', true), $1, 0, 'up')`, [interviewId]);
  });
}

// report sink 的 6 表总残留行数（物理 read=0 断言用）。
async function reportResidualCount(interviewId: string): Promise<number> {
  const r = await admin.query<{ n: string | number }>(
    `SELECT
       (SELECT count(*) FROM ai_report WHERE interview_id=$1)
     + (SELECT count(*) FROM assessment_report WHERE interview_id=$1)
     + (SELECT count(*) FROM learning_plan WHERE interview_id=$1)
     + (SELECT count(*) FROM learning_progress WHERE interview_id=$1)
     + (SELECT count(*) FROM career_path WHERE interview_id=$1)
     + (SELECT count(*) FROM question_feedback WHERE interview_id=$1) AS n`,
    [interviewId],
  );
  return Number(r.rows[0]?.n ?? -1);
}

async function eventResidualCount(interviewId: string): Promise<number> {
  const r = await admin.query<{ n: string | number }>(
    'SELECT count(*) AS n FROM interview_event WHERE stream_key=$1', [interviewId]);
  return Number(r.rows[0]?.n ?? -1);
}

async function graphRunResidualCount(interviewId: string): Promise<number> {
  const r = await admin.query<{ n: string | number }>(
    'SELECT count(*) AS n FROM ai_graph_run WHERE thread_id=$1', [interviewId]);
  return Number(r.rows[0]?.n ?? -1);
}

// 面试问题 + answer_hash 低熵 oracle fixture（走 app_role，fence 前可写）。
async function insertQuestion(ownerId: string, interviewId: string, questionId: string, stateVersion: number, answerHash: string): Promise<void> {
  await asPrincipal(admin, ownerId, (c) => c.query(
    `INSERT INTO interview_question(owner_user_id, interview_id, question_id, state_version, turn, question, status, answer_hash)
     VALUES (current_setting('app.principal_user', true), $1, $2, $3, 0, 'Q?', 'issued', $4)`,
    [interviewId, questionId, stateVersion, answerHash],
  ));
}

const beginErasure = (ownerId: string, interviewId: string, keyHash: string, epoch: number) =>
  asPrincipal(admin, ownerId, (c) => beginInterviewProjectionErasure(c, interviewId, keyHash, epoch));
const listClaimable = () => asPrivacyWorkerExecutor(admin, (c) => listClaimableInterviewProjectionTargets(c));
const purge = (ownerId: string, targetId: string, token: string) =>
  asPrivacyWorkerPrincipal(admin, ownerId, (c) => purgeInterviewProjectionTarget(c, targetId, token));

function signSnapshot(ownerId: string, interviewId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  return signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: ownerId, owner: ownerId, interview: interviewId,
    purpose: 'interview_data_erasure', privacyEpoch: epoch, targets, nowSec: NOW_SEC, ttlSec: 600,
  });
}
async function issueSigned(ownerId: string, interviewId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  const signed = signSnapshot(ownerId, interviewId, epoch, targets);
  await asIssuer(ownerId, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: ownerId, interviewId,
    purpose: 'interview_data_erasure', privacyEpoch: epoch, targetSetDigest: signed.targetSetDigest,
    expiresAt: new Date(signed.expiresAtMs),
  }));
  return signed;
}
const consume = (jti: string) => asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, jti, worker));
const claim = (ownerId: string, jti: string, targetId: string) =>
  asPrivacyWorkerPrincipal(admin, ownerId, (c) => claimAuthorizationTarget(c, jti, targetId, worker, 60));

async function main() {
  await assertIsolatedTestTarget(admin);

  /* ── A. begin-erasure 钉下 event+ai_graph_run+report+checkpoint_rows 四 target + 活 digest ── */
  const ivP = '00000000-0000-4000-8000-0000000000c1';
  await insertInterview(owner, ivP);
  await insertEvent(owner, ivP, 1, 'question_ready');
  await insertEvent(owner, ivP, 2, 'answer_evaluated');
  await insertGraphRun(owner, ivP);
  await insertReportFixtures(owner, ivP);
  A('fixture 落库（event=2 + ai_graph_run=1 + 6 report 表各 1 = 9 行）',
    (await eventResidualCount(ivP)) === 2 && (await graphRunResidualCount(ivP)) === 1 && (await reportResidualCount(ivP)) === 6);

  const erasureP = await beginErasure(owner, ivP, nextHash(), 5);
  const eventT = erasureP.targets.find((t) => t.sink === 'event')!;
  const graphT = erasureP.targets.find((t) => t.sink === 'ai_graph_run')!;
  const reportT = erasureP.targets.find((t) => t.sink === 'report')!;
  const fenceT = erasureP.targets.find((t) => t.sink === 'checkpoint_rows')!;
  A('begin-erasure 落 fenced + 恰好 4 个 sink target（event+ai_graph_run+report+checkpoint_rows, replayed=false）',
    erasureP.status === 'fenced' && erasureP.replayed === false
    && erasureP.targets.length === 4 && !!eventT && !!graphT && !!reportT && !!fenceT);
  const signTargetsP: PrivacyAuthzTarget[] = erasureP.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
  A('钉下 epoch + 目标集活 digest（TS canonicalTargetSetDigest 逐字节相等, H1）+ resource 64-hex',
    erasureP.privacyEpoch === 5
    && erasureP.targetSetDigest === canonicalTargetSetDigest(signTargetsP)
    && signTargetsP.every((t) => /^[a-f0-9]{64}$/.test(t.resource)));

  // H2：fence 锚已建，interview_privacy_active() 转 false —— 0059 写 guard 必须拒掉 late append。
  A('H2 fence 生效：begin-erasure 后 late append event 被 0059 写 guard 拒',
    await rejects(() => insertEvent(owner, ivP, 3, 'late_after_fence')));

  /* ── B. 复用冻结 issuer：sign→issue→consume→claim→purge（event 再 ai_graph_run 再 report）── */
  const signedP = await issueSigned(owner, ivP, 5, signTargetsP);
  await consume(signedP.jti);
  A('复用冻结 consume：jti 单次 CAS（二次消费被拒）',
    await rejects(() => consume(signedP.jti)));
  // digest 不符测试：另签一个 resource 错误的快照，claim 必须 fail-closed。
  const badTargets: PrivacyAuthzTarget[] = [
    { kind: 'event', resource: 'b'.repeat(64) },
    { kind: 'report', resource: reportT!.resourceHmac },
  ];
  const signedBad = await issueSigned(owner, ivP, 5, badTargets);
  await consume(signedBad.jti);
  A('digest 不符（另签错误 resource 快照）→ claim 被拒',
    await rejects(() => claim(owner, signedBad.jti, eventT!.targetId)));

  const claimedEvent = await claim(owner, signedP.jti, eventT!.targetId);
  A('复用冻结 claim：event target 认领成功 + 租约',
    claimedEvent !== null && claimedEvent.leaseToken.length > 0 && claimedEvent.targetId === eventT!.targetId);
  A('跨 owner claim（伪造 principal）被拒',
    await rejects(() => claim(otherOwner, signedP.jti, eventT!.targetId)));

  const purgedEvent = await purge(owner, eventT!.targetId, claimedEvent!.leaseToken);
  A('purge event：物理删 2 行 + 请求仍 purging（ai_graph_run/report 未删）',
    purgedEvent.deletedCount === 2 && purgedEvent.requestStatus === 'purging'
    && (await eventResidualCount(ivP)) === 0);

  const claimedGraph = await claim(owner, signedP.jti, graphT!.targetId);
  const purgedGraph = await purge(owner, graphT!.targetId, claimedGraph!.leaseToken);
  A('purge ai_graph_run：物理删 1 行 + delete→read=0（M1）',
    purgedGraph.deletedCount === 1 && (await graphRunResidualCount(ivP)) === 0);

  const claimedReport = await claim(owner, signedP.jti, reportT!.targetId);
  const purgedReport = await purge(owner, reportT!.targetId, claimedReport!.leaseToken);
  A('purge report：物理删 6 行 + 请求 completed',
    purgedReport.deletedCount === 6 && purgedReport.requestStatus === 'completed'
    && (await reportResidualCount(ivP)) === 0);

  A('删后物理 read=0（event + ai_graph_run + 6 report 表 count 归零）',
    (await eventResidualCount(ivP)) === 0 && (await graphRunResidualCount(ivP)) === 0 && (await reportResidualCount(ivP)) === 0);
  A('H2 fence 持久：purge 完成后 late append event 仍被 0059 写 guard 拒（不复活）',
    await rejects(() => insertEvent(owner, ivP, 4, 'late_after_purge')));
  A('删后跨 owner 读 = 0',
    (await asPrincipal(admin, otherOwner, (c) => c.query(
      'SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1', [ivP]))).rows[0]?.n === 0
    && (await asPrincipal(admin, otherOwner, (c) => c.query(
      'SELECT count(*)::int AS n FROM ai_report WHERE interview_id=$1', [ivP]))).rows[0]?.n === 0);

  /* ── C. 逐 sink receipt（local_erased，owner-scoped，绝不伪造 completed）── */
  A('逐 sink receipt：event target 写 local_erased 成功',
    (await asPrivacyWorkerPrincipal(admin, owner, (c) =>
      recordDeletionReceipt(c, eventT!.targetId, 'local_erased', 'a'.repeat(64), worker))).length > 0);
  A('逐 sink receipt：report target 写 local_erased 成功',
    (await asPrivacyWorkerPrincipal(admin, owner, (c) =>
      recordDeletionReceipt(c, reportT!.targetId, 'local_erased', 'a'.repeat(64), worker))).length > 0);
  A('逐 sink receipt：ai_graph_run target 写 local_erased 成功（M1 逐 sink receipt）',
    (await asPrivacyWorkerPrincipal(admin, owner, (c) =>
      recordDeletionReceipt(c, graphT!.targetId, 'local_erased', 'a'.repeat(64), worker))).length > 0);
  A('逐 sink receipt：跨 owner 写被拒',
    await rejects(() => asPrivacyWorkerPrincipal(admin, otherOwner, (c) =>
      recordDeletionReceipt(c, eventT!.targetId, 'local_erased', 'a'.repeat(64), worker))));

  /* ── D. pending_external / failed_cleanup 绝不伪造 completed（guard 承重）── */
  const ivF = '00000000-0000-4000-8000-0000000000c2';
  await insertInterview(owner, ivF);
  await insertEvent(owner, ivF, 1, 'question_ready');
  await insertGraphRun(owner, ivF);
  await insertReportFixtures(owner, ivF);
  const erasureF = await beginErasure(owner, ivF, nextHash(), 9);
  const eventF = erasureF.targets.find((t) => t.sink === 'event')!;
  const graphF = erasureF.targets.find((t) => t.sink === 'ai_graph_run')!;
  const reportF = erasureF.targets.find((t) => t.sink === 'report')!;
  const reqF = await admin.query<{ id: string }>(
    'SELECT r.id FROM privacy_erasure_request r JOIN privacy_deletion_target t ON t.request_id=r.id WHERE t.id=$1',
    [eventF.targetId]);
  const reqFId = reqF.rows[0]!.id;

  await asPrivacyWorkerPrincipal(admin, owner, (c) =>
    recordDeletionReceipt(c, eventF.targetId, 'failed_cleanup', 'b'.repeat(64), worker));
  A('no-forge：target 未全 erased 时 raw UPDATE→completed 被 guard 拒',
    await rejects(() => admin.query(
      "UPDATE privacy_erasure_request SET status='completed', version=version+1 WHERE id=$1", [reqFId])));

  const signedF = await issueSigned(owner, ivF, 9, erasureF.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })));
  await consume(signedF.jti);
  const claimedFEvent = await claim(owner, signedF.jti, eventF.targetId);
  await purge(owner, eventF.targetId, claimedFEvent!.leaseToken);
  const claimedFGraph = await claim(owner, signedF.jti, graphF.targetId);
  await purge(owner, graphF.targetId, claimedFGraph!.leaseToken);
  const claimedFReport = await claim(owner, signedF.jti, reportF.targetId);
  const purgedFReport = await purge(owner, reportF.targetId, claimedFReport!.leaseToken);
  A('failed_cleanup 未 resolve → purge 后请求 partial_failed（绝不 completed）',
    purgedFReport.requestStatus === 'partial_failed');
  A('no-forge：全 erased 但 failed_cleanup 收据在 → raw UPDATE→completed 仍被 guard 拒',
    await rejects(() => admin.query(
      "UPDATE privacy_erasure_request SET status='completed', version=version+1 WHERE id=$1", [reqFId])));

  // external_pending 同理：全 erased 但 external_pending 收据在 → 请求 pending_external。
  const ivX = '00000000-0000-4000-8000-0000000000c3';
  await insertInterview(owner, ivX);
  await insertEvent(owner, ivX, 1, 'question_ready');
  await insertGraphRun(owner, ivX);
  await insertReportFixtures(owner, ivX);
  const erasureX = await beginErasure(owner, ivX, nextHash(), 9);
  const eventX = erasureX.targets.find((t) => t.sink === 'event')!;
  const graphX = erasureX.targets.find((t) => t.sink === 'ai_graph_run')!;
  const reportX = erasureX.targets.find((t) => t.sink === 'report')!;
  await asPrivacyWorkerPrincipal(admin, owner, (c) =>
    recordDeletionReceipt(c, eventX.targetId, 'external_pending', 'c'.repeat(64), worker));
  const signedX = await issueSigned(owner, ivX, 9, erasureX.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })));
  await consume(signedX.jti);
  await purge(owner, eventX.targetId, (await claim(owner, signedX.jti, eventX.targetId))!.leaseToken);
  await purge(owner, graphX.targetId, (await claim(owner, signedX.jti, graphX.targetId))!.leaseToken);
  const purgedXReport = await purge(owner, reportX.targetId, (await claim(owner, signedX.jti, reportX.targetId))!.leaseToken);
  A('external_pending 未 resolve → purge 后请求 pending_external（绝不 completed）',
    purgedXReport.requestStatus === 'pending_external');

  /* ── E. begin-erasure 幂等竞态（20 并发单 INSERT winner）────────────────── */
  const ivRace = '00000000-0000-4000-8000-0000000000c4';
  await insertInterview(owner, ivRace);
  const raceKeyHash = nextHash();
  const race = await Promise.all(
    Array.from({ length: 20 }, () =>
      beginErasure(owner, ivRace, raceKeyHash, 7).then((r) => (r.replayed ? 'replayed' : 'created'), () => 'rejected')),
  );
  A('20 并发 begin-erasure 单 INSERT winner（1 created + 19 replayed）',
    race.filter((x) => x === 'created').length === 1 && race.filter((x) => x === 'replayed').length === 19);
  const erasureRace = await beginErasure(owner, ivRace, raceKeyHash, 7);
  A('replay 回显同一请求 4 个 target（不重复建 target）',
    erasureRace.replayed === true && erasureRace.targets.length === 4);

  /* ── F. claim CAS 单 winner（20 并发租同一 target）──────────────────────── */
  const signedRace = await issueSigned(owner, ivRace, 7, erasureRace.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })));
  await consume(signedRace.jti);
  const eventRace = erasureRace.targets.find((t) => t.sink === 'event')!;
  const claims = await Promise.all(
    Array.from({ length: 20 }, () =>
      claim(owner, signedRace.jti, eventRace.targetId).then((r) => (r?.leaseToken ? 'won' : 'lost'), () => 'lost')),
  );
  A('20 并发 claim 单 winner（CAS 租约，19 lost）',
    claims.filter((x) => x === 'won').length === 1 && claims.filter((x) => x === 'lost').length === 19);

  /* ── G. 后台 dispatch feed（list-claimable 只吐可推进目标）──────────────── */
  const claimable = await listClaimable();
  A('list-claimable 只吐 pending/可重租目标（不含已 erased 的 ivP/ivF/ivX target）',
    Array.isArray(claimable)
    && claimable.every((t) => typeof t.targetId === 'string' && typeof t.ownerUserId === 'string')
    && !claimable.some((t) => [eventT!.targetId, graphT!.targetId, reportT!.targetId, eventF.targetId, graphF.targetId, reportF.targetId, eventX.targetId, graphX.targetId, reportX.targetId].includes(t.targetId)));
  // fence 锚（sink='checkpoint_rows'/erased）在 privacy_checkpoint_target 里，绝不能泄漏进
  // 两个 dispatch feed（跨流隔离：projection 与 checkpoint 都不该认领它）。
  const checkpointClaimable = await asPrivacyWorkerExecutor(admin, (c) =>
    c.query<{ target_id: string }>('SELECT target_id FROM privacy_list_claimable_checkpoint_targets(128)'));
  A('fence 锚跨流隔离：checkpoint_rows 锚不被 projection 或 checkpoint dispatch 认领',
    !claimable.some((t) => t.targetId === fenceT!.targetId)
    && !checkpointClaimable.rows.some((r) => r.target_id === fenceT!.targetId));

  /* ── H. vector / trace 无 interview 作用域 → 诚实 fail-closed 拒删 ──────── */
  const ivV = '00000000-0000-4000-8000-0000000000c5';
  await insertInterview(owner, ivV);
  await admin.query(
    `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
     VALUES ($1, $2, 'qbank', 'q-v1', $3, $4::vector)`,
    ['vchunk-v1', owner, 'd'.repeat(64), VEC512]);
  await admin.query(
    "INSERT INTO ai_invocation_trace(owner_user_id, idempotency_key, output) VALUES ($1, $2, '{}'::jsonb)",
    [owner, 'trace-v1']);
  const erasureV = await beginErasure(owner, ivV, nextHash(), 11);
  A('vector/trace 无 interview 作用域 → begin-erasure 只建 event+ai_graph_run+report+checkpoint_rows 四 target（不建 vector/trace）',
    erasureV.targets.length === 4
    && erasureV.targets.every((t) => ['event','ai_graph_run','report','checkpoint_rows'].includes(t.sink)));

  const signedV = await issueSigned(owner, ivV, 11, erasureV.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })));
  await consume(signedV.jti);
  const eventV = erasureV.targets.find((t) => t.sink === 'event')!;
  const reportV = erasureV.targets.find((t) => t.sink === 'report')!;
  await purge(owner, eventV.targetId, (await claim(owner, signedV.jti, eventV.targetId))!.leaseToken);
  await purge(owner, reportV.targetId, (await claim(owner, signedV.jti, reportV.targetId))!.leaseToken);

  const vectorCount = await admin.query<{ n: string | number }>(
    'SELECT count(*) AS n FROM vector_chunk WHERE owner_user_id=$1', [owner]);
  const traceCount = await admin.query<{ n: string | number }>(
    'SELECT count(*) AS n FROM ai_invocation_trace WHERE owner_user_id=$1', [owner]);
  A('诚实拒删：interview 删除不误删 vector_chunk / ai_invocation_trace',
    Number(vectorCount.rows[0]?.n) === 1 && Number(traceCount.rows[0]?.n) === 1);

  /* ── I. answer_hash 低熵 oracle 随活删除流 begin-erasure 清除（H1）+ 0075 暂停保留 ── */
  const ivHash = '00000000-0000-4000-8000-0000000000c6';
  await insertInterview(owner, ivHash);
  await insertQuestion(owner, ivHash, 'q-hash', 1, 'e'.repeat(64));
  await beginErasure(owner, ivHash, nextHash(), 13);
  const hashRow = await admin.query<{ answer_hash: string | null }>(
    'SELECT answer_hash FROM interview_question WHERE interview_id=$1 AND question_id=$2', [ivHash, 'q-hash']);
  A('answer_hash 随活删除流 begin-erasure 清除为 NULL（H1，低熵 oracle 不残留，不依赖暂停的 checkpoint 路径）',
    hashRow.rows[0]?.answer_hash === null);
  A('0075 暂停保留：app_role 仍不能执行 privacy_begin_checkpoint_erasure（0096 未重新授权）',
    await rejects(() => asPrincipal(admin, owner, (c) =>
      c.query('SELECT privacy_begin_checkpoint_erasure($1,$2)', [ivHash, nextHash()]))));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ INT-TRANSCRIPT-01 剩余 sink（event/ai_graph_run/report/checkpoint fence 锚/answer_hash/vector/trace）DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });
