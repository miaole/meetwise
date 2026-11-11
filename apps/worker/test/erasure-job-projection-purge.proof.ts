/**
 * 擦除域两处存量缺口回归证明（0232 · interview_job 明文 + 投影物理 purge 生产接线）。
 *
 * 修前事实（origin/main c94c4a3d6）：
 *   A. interview_projection_begin_erasure（0096，账户注销实际走的活删除流）不碰 interview_job；
 *      fence 落地后 0059 p_owner 使这些行对 app_role 不可见、0058 写 guard 拒 UPDATE，排队/在跑
 *      回答与历史 done/failed 行的明文永久滞留，app_role 侧任何 purge 都清不到。
 *   B. 生产 privacy worker 只跑 checkpoint 擦除；0096 投影 purge（event/ai_graph_run/report）
 *      无循环、无已消费授权 jti feed。
 *
 * 修后合同（每条带反证）：
 *   A1 活删除流同事务清 interview_job 明文（queued/running→done+'{}'，done/failed 置 '{}'）；
 *      行不删、target 集/digest 不变（恰 4 target，无新增 sink 行）。
 *   A2 已被他请求先围栏的面试再次 begin 不回滚（写 guard 不被触发），残留交 worker。
 *   A3 RLS 不弱化：owner 自己读不到已围栏 job 行；app_role 仍无 DELETE；app_role 不能执行
 *      worker 清扫函数；privacy_worker_owner 即使 GUC 在场也删不到未围栏面试的行，缺 GUC
 *      则连已围栏行也删不到。
 *   B1 worker 残留清扫只删已围栏面试上 payload 非空的行（租约未过期的 running 行保留），幂等。
 *   B2 投影 purge：无已消费 0091 授权 → 跳过不删；有授权 → event/ai_graph_run/report 物理删除
 *      + local_erased 收据 + target erased。
 *   B3 生产接线：main.ts 的 privacy 循环跑的就是 privacyErasureSweepTick（三步合一拍），
 *      直接调用该 tick 能同时完成投影 purge 与残留清扫。
 *
 * 证据层：隔离真 PG（run-e2e-isolated 全迁移链）· 真 least-privilege 登录（runtime /
 * privacy worker）· 零模型 · 零外呼。EXIT0 ≠ 生产云端删除 · releaseEvidence=false · NOT_HA ·
 * 公开 interview DELETE 仍 503（本证明不碰 API）。
 *
 *   pnpm erasure-job-projection:prove        （root · isolated）
 *   pnpm -C apps/worker prove:erasure-job-projection （raw；需 runner 注入的隔离 DATABASE_URL）
 */
import { randomUUID, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as db from '@meetwise/db';
import {
  asPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget, beginInterviewProjectionErasure,
  consumeAuthorizationSnapshotBound, createPool, enqueueInterviewJob, issueAuthorizationSnapshot,
  provisionPrivacyWorkerLogin, provisionRuntimeLogin, type Client, type DbPool,
} from '@meetwise/db';
import {
  generatePrivacyAuthzKeyPair, PrivacyAuthzKeyRegistry, signPrivacyAuthorizationSnapshot,
  verifyPrivacyAuthorizationSnapshot,
} from '@meetwise/domain';
import * as eraser from '../src/privacy-erasure-worker.ts';

const MEETWISE_TEST_FIXTURE_RUNTIMEPASSWORD_ERJ1 = 'erasure-job-runtime-proof-password-2026';
const MEETWISE_TEST_FIXTURE_WORKERPASSWORD_ERJ2 = 'erasure-job-worker-proof-password-2026';

let failures = 0;
let total = 0;
// 只打印固定用例 id：证明在库里放了明文哨兵，任何描述行都不得回显它。
const A = (id: string, ok: boolean, detail = '') => {
  total++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}${detail ? ` · ${detail}` : ''}`);
  if (!ok) failures++;
};
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };
// 新原语按名探测（修前不存在 → 对应用例 FAIL 而非链接期崩溃，修前/修后同一份证明可对照）。
const fnOf = <T>(mod: object, name: string): T | null => {
  const f = (mod as Record<string, unknown>)[name];
  return typeof f === 'function' ? f as T : null;
};
type PurgeResidueFn = (c: Client, maxItems: number) => Promise<number>;
type ProjectionTickFn = (pool: DbPool, workerId: string, maxItems?: number) => Promise<{ claimed: number; erased: number; receipted: number; skippedUnauthorized: number }>;
type SweepTickFn = (pool: DbPool, workerId: string) => Promise<unknown>;

const S = `${process.pid}-${Date.now().toString(36)}`;
const admin = createPool();
const runtimeRole = `erj_rt_${process.pid}`;
const workerRole = `erj_wk_${process.pid}`;
const KEY = generatePrivacyAuthzKeyPair('erj-2026-11');
const marker = `erj-marker-${randomUUID()}`;
let hashN = 0;
const nextHash = (tag: string) => createHash('sha256').update(`erj:${tag}:${S}:${++hashN}`).digest('hex');

async function seedInterview(owner: string, id: string): Promise<void> {
  const resumeId = randomUUID();
  await admin.query(
    "INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)",
    [resumeId, owner, `erj-resume-${id}`],
  );
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,1)",
    [id, owner, resumeId],
  );
}

/** 产品入队路径造 job；状态/租约用 runtime 自身 UPDATE 推进（此刻面试仍 active，guard 放行）。 */
async function seedJobs(runtime: DbPool, owner: string, id: string): Promise<void> {
  // 每条入队后立刻推进状态：入队背压闸 per-owner queued 上限 3。
  await asPrincipal(runtime, owner, async (c) => {
    await enqueueInterviewJob(c, owner, id, 'start', { requestId: `erj-start-${id}` }, 0);
    await enqueueInterviewJob(c, owner, id, 'answer', { answer: marker, turn: 0 }, 1);   // queued
    await enqueueInterviewJob(c, owner, id, 'answer', { answer: marker, turn: 1 }, 2);   // → done（明文残留）
    await c.query("UPDATE interview_job SET status='done' WHERE interview_id=$1 AND seq=2", [id]);
    await enqueueInterviewJob(c, owner, id, 'answer', { answer: marker, turn: 2 }, 3);   // → failed（明文残留）
    await c.query("UPDATE interview_job SET status='failed', last_error='fixture_failed' WHERE interview_id=$1 AND seq=3", [id]);
    await enqueueInterviewJob(c, owner, id, 'answer', { answer: marker, turn: 3 }, 4);   // → running 活租约
    await c.query("UPDATE interview_job SET status='running', lease_owner='erj-live', lease_expires_at=now()+interval '10 minutes' WHERE interview_id=$1 AND seq=4", [id]);
    await enqueueInterviewJob(c, owner, id, 'answer', { answer: marker, turn: 4 }, 5);   // → running 过期租约
    await c.query("UPDATE interview_job SET status='running', lease_owner='erj-dead', lease_expires_at=now()-interval '10 minutes' WHERE interview_id=$1 AND seq=5", [id]);
  });
}

type JobRow = { seq: number; status: string; lastError: string | null; hasPlain: boolean; empty: boolean };
async function jobs(id: string): Promise<JobRow[]> {
  const r = await admin.query<JobRow>(
    `SELECT seq, status, last_error AS "lastError", (payload::text LIKE '%' || $2 || '%') AS "hasPlain", payload = '{}'::jsonb AS empty
       FROM interview_job WHERE interview_id=$1 ORDER BY seq`, [id, marker]);
  return r.rows;
}

/** 模拟修前 begin 留下的残留：超级用户以 replica 会话（跳过触发器，仅夹具用）把明文写回已围栏行。 */
async function restoreLegacyResidue(id: string): Promise<void> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL session_replication_role = replica');
    await c.query(
      `UPDATE interview_job SET payload=jsonb_build_object('answer',$2::text,'turn',seq)
        WHERE interview_id=$1 AND kind='answer'`, [id, marker]);
    await c.query("UPDATE interview_job SET status='queued', last_error=NULL WHERE interview_id=$1 AND seq=1", [id]);
    await c.query("UPDATE interview_job SET status='running', lease_owner='erj-live', lease_expires_at=now()+interval '10 minutes' WHERE interview_id=$1 AND seq=4", [id]);
    await c.query("UPDATE interview_job SET status='running', lease_owner='erj-dead', lease_expires_at=now()-interval '10 minutes' WHERE interview_id=$1 AND seq=5", [id]);
    await c.query('COMMIT');
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

async function seedProjection(runtime: DbPool, owner: string, id: string): Promise<void> {
  await asPrincipal(runtime, owner, async (c) => {
    await c.query(
      `INSERT INTO interview_event(owner_user_id, stream_key, seq, kind, payload)
       VALUES (current_setting('app.principal_user', true), $1, 1, 'question_ready', '{}'::jsonb),
              (current_setting('app.principal_user', true), $1, 2, 'answer_evaluated', '{}'::jsonb)`, [id]);
    await c.query(
      `INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
       VALUES ('mock-interview', $1, current_setting('app.principal_user', true), 'completed')`, [id]);
    await c.query(
      `INSERT INTO ai_report(owner_user_id, interview_id) VALUES (current_setting('app.principal_user', true), $1)`, [id]);
    await c.query(
      `INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating)
       VALUES (current_setting('app.principal_user', true), $1, 0, 'up')`, [id]);
  });
}
async function projectionRows(id: string): Promise<number> {
  const r = await admin.query<{ n: string }>(
    `SELECT ((SELECT count(*) FROM interview_event WHERE stream_key=$1)
           + (SELECT count(*) FROM ai_graph_run WHERE thread_id=$1)
           + (SELECT count(*) FROM ai_report WHERE interview_id=$1)
           + (SELECT count(*) FROM question_feedback WHERE interview_id=$1))::text AS n`, [id]);
  return Number(r.rows[0]?.n ?? -1);
}

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

/** 按 0091 冻结链签发 + 验签 + 消费一张快照（worker 侧只消费，不签发）。 */
async function authorize(worker: DbPool, owner: string, id: string, requestId: string): Promise<void> {
  const rows = (await admin.query<{ sink: string; resourceHmac: string }>(
    'SELECT sink, resource_hmac AS "resourceHmac" FROM privacy_deletion_target WHERE request_id=$1::uuid ORDER BY sink', [requestId])).rows;
  const nowSec = Math.floor(Date.now() / 1000);
  const signed = signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: owner, owner, interview: id,
    purpose: 'interview_data_erasure', privacyEpoch: 1,
    targets: rows.map((r) => ({ kind: r.sink, resource: r.resourceHmac })), nowSec, ttlSec: 600,
  });
  await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: owner, interviewId: id, purpose: 'interview_data_erasure',
    privacyEpoch: 1, targetSetDigest: signed.targetSetDigest, expiresAt: new Date(signed.expiresAtMs),
  }));
  const registry = new PrivacyAuthzKeyRegistry();
  registry.activate(KEY.kid, KEY.publicJwk);
  const verified = verifyPrivacyAuthorizationSnapshot({ jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec });
  if (!verified) throw new Error('erj_fixture_verify_failed');
  await asPrivacyWorkerExecutor(worker, (c) => consumeAuthorizationSnapshotBound(c, verified, `erj-consumer-${S}`));
}

async function main() {
  await assertIsolatedTestTarget(admin);
  console.log('ERASURE_JOB_PROJECTION_PROVE · 0232 · Pins: NOT_HA · releaseEvidence=false · public DELETE=503');
  await provisionRuntimeLogin(admin, { roleName: runtimeRole, password: MEETWISE_TEST_FIXTURE_RUNTIMEPASSWORD_ERJ1 });
  await provisionPrivacyWorkerLogin(admin, { roleName: workerRole, password: MEETWISE_TEST_FIXTURE_WORKERPASSWORD_ERJ2 });
  const runtime = createPool({ user: runtimeRole, password: MEETWISE_TEST_FIXTURE_RUNTIMEPASSWORD_ERJ1, max: 8 });
  const worker = createPool({ user: workerRole, password: MEETWISE_TEST_FIXTURE_WORKERPASSWORD_ERJ2, max: 6 });
  const purgeResidue = fnOf<PurgeResidueFn>(db, 'purgeFencedInterviewJobResidue');
  const projectionTick = fnOf<ProjectionTickFn>(eraser, 'interviewProjectionPrivacyErasureTick');
  const sweepTick = fnOf<SweepTickFn>(eraser, 'privacyErasureSweepTick');
  try {
    // ── A1 活删除流清 interview_job 明文 ─────────────────────────────────────
    const ownerA = `erj-a-${S}`; const ivA = `erj-iv-a-${S}`;
    await seedInterview(ownerA, ivA);
    await seedJobs(runtime, ownerA, ivA);
    const beforeA = await jobs(ivA);
    A('A0 夹具：begin 前 5 条 answer 行带明文', beforeA.filter((j) => j.hasPlain).length === 5);
    const begunA = await asPrincipal(runtime, ownerA, (c) => beginInterviewProjectionErasure(c, ivA, nextHash('a'), 1));
    const afterA = await jobs(ivA);
    A('A1-a begin 后该面试 job 行零明文', afterA.length === 6 && afterA.every((j) => !j.hasPlain),
      `plain=${afterA.filter((j) => j.hasPlain).length}`);
    A('A1-b 行不删（6 行仍在），payload 全为 {}', afterA.length === 6 && afterA.every((j) => j.empty));
    const bySeq = new Map(afterA.map((j) => [j.seq, j]));
    A('A1-c queued/running → done + privacy_fenced（0058 同形）',
      [0, 1, 4, 5].every((s) => bySeq.get(s)?.status === 'done' && bySeq.get(s)?.lastError === 'privacy_fenced'));
    A('A1-d done/failed 状态与 last_error 原样保留（不伪造失败原因）',
      bySeq.get(2)?.status === 'done' && bySeq.get(2)?.lastError === null
      && bySeq.get(3)?.status === 'failed' && bySeq.get(3)?.lastError === 'fixture_failed');
    const sinksA = (await admin.query<{ sink: string }>(
      'SELECT sink FROM privacy_deletion_target WHERE request_id=$1::uuid ORDER BY sink', [begunA.requestId])).rows.map((r) => r.sink);
    A('A1-e target 集不变：恰 4 个（checkpoint_rows/ai_graph_run/event/report），无新增 sink 行',
      begunA.targets.length === 4 && sinksA.join(',') === 'ai_graph_run,checkpoint_rows,event,report', sinksA.join(','));

    // ── A3 RLS 不弱化 ───────────────────────────────────────────────────────
    const visibleA = await asPrincipal(runtime, ownerA, (c) => c.query('SELECT 1 FROM interview_job WHERE interview_id=$1', [ivA]));
    A('A3-a owner 本人读已围栏 job 行=0（0059 p_owner 原样）', visibleA.rowCount === 0);
    const ownerC = `erj-c-${S}`; const ivC = `erj-iv-c-${S}`;
    await seedInterview(ownerC, ivC);
    await seedJobs(runtime, ownerC, ivC);
    A('A3-b app_role 仍无 interview_job DELETE 权限', await rejects(() => asPrincipal(runtime, ownerC, (c) =>
      c.query('DELETE FROM interview_job WHERE interview_id=$1', [ivC]))));
    A('A3-c app_role 不能执行 worker 残留清扫函数', await rejects(() => asPrincipal(runtime, ownerC, (c) =>
      c.query('SELECT privacy_purge_fenced_interview_job_residue(64)'))));
    A('A3-d app_role 不能执行投影 jti feed', await rejects(() => asPrincipal(runtime, ownerC, (c) =>
      c.query('SELECT interview_projection_target_consumed_jti($1::uuid)', [randomUUID()]))));

    // ── A2 + B1 历史残留（修前 begin 留下的明文）→ worker 清扫 ──────────────
    const ownerB = `erj-b-${S}`; const ivB = `erj-iv-b-${S}`;
    await seedInterview(ownerB, ivB);
    await seedJobs(runtime, ownerB, ivB);
    await asPrincipal(runtime, ownerB, (c) => beginInterviewProjectionErasure(c, ivB, nextHash('b1'), 1));
    await restoreLegacyResidue(ivB);
    A('B0 夹具：已围栏面试残留 5 条明文', (await jobs(ivB)).filter((j) => j.hasPlain).length === 5);
    const secondBegin = await rejects(() => asPrincipal(runtime, ownerB, (c) =>
      beginInterviewProjectionErasure(c, ivB, nextHash('b2'), 1)));
    A('A2 已被他请求先围栏的面试再次 begin 不回滚（账户注销逐场循环不被历史残留卡死）', !secondBegin);
    A('B1-pre 清扫前残留仍在（app_role 侧不可达）', (await jobs(ivB)).filter((j) => j.hasPlain).length === 5);

    // 反证：privacy_worker_owner 绕过函数直删——缺 GUC 删不到；GUC 在场也删不到未围栏面试。
    const directProbe = await (async () => {
      const c = await admin.connect();
      try {
        await c.query('BEGIN');
        await c.query('SET LOCAL ROLE privacy_worker_owner');
        const noGuc = await c.query('DELETE FROM interview_job WHERE interview_id=$1', [ivB]);
        await c.query("SELECT set_config('app.privacy_job_residue_sweep','on',true)");
        const activeTarget = await c.query('DELETE FROM interview_job WHERE interview_id=$1', [ivC]);
        await c.query('ROLLBACK');
        return { noGuc: noGuc.rowCount, activeTarget: activeTarget.rowCount };
      } catch (e) { await c.query('ROLLBACK').catch(() => undefined); return { error: String((e as { code?: string }).code ?? 'err') }; } finally { c.release(); }
    })();
    A('A3-e privacy_worker_owner 缺 GUC 删已围栏行=0；GUC 在场删未围栏面试行=0',
      'noGuc' in directProbe && directProbe.noGuc === 0 && directProbe.activeTarget === 0, JSON.stringify(directProbe));

    A('B1-fn worker 残留清扫原语存在', purgeResidue !== null);
    const deleted1 = purgeResidue ? await asPrivacyWorkerExecutor(worker, (c) => purgeResidue(c, 256)) : -1;
    const afterB = await jobs(ivB);
    A('B1-a 清扫删除 4 行残留（queued/done/failed/过期 running）', deleted1 === 4 && afterB.length === 2, `deleted=${deleted1} left=${afterB.length}`);
    A('B1-b 租约未过期的 running 行保留（不抢在跑的 worker）',
      afterB.some((j) => j.seq === 4 && j.status === 'running'));
    A('B1-c 已为 {} 的行（start 与 A 场全部行）不动', afterB.some((j) => j.seq === 0) && (await jobs(ivA)).length === 6);
    const cRows = await jobs(ivC);
    A('B1-d 未围栏面试的行一条不碰（含明文 done 行：属 #249 域）', cRows.length === 6 && cRows.filter((j) => j.hasPlain).length === 5);
    const deleted2 = purgeResidue ? await asPrivacyWorkerExecutor(worker, (c) => purgeResidue(c, 256)) : -1;
    A('B1-e 幂等：第二次清扫=0', deleted2 === 0, `deleted=${deleted2}`);
    A('B1-f 越界参数 fail-closed', purgeResidue !== null && await rejects(() => asPrivacyWorkerExecutor(worker, (c) => purgeResidue(c, 0))));

    // ── B2 投影 purge：无授权跳过 / 有授权物理删除 ─────────────────────────────
    const ownerE = `erj-e-${S}`; const ivE = `erj-iv-e-${S}`;
    await seedInterview(ownerE, ivE);
    await seedProjection(runtime, ownerE, ivE);
    const begunE = await asPrincipal(runtime, ownerE, (c) => beginInterviewProjectionErasure(c, ivE, nextHash('e'), 1));
    const ownerD = `erj-d-${S}`; const ivD = `erj-iv-d-${S}`;
    await seedInterview(ownerD, ivD);
    await seedProjection(runtime, ownerD, ivD);
    const begunD = await asPrincipal(runtime, ownerD, (c) => beginInterviewProjectionErasure(c, ivD, nextHash('d'), 1));
    await authorize(worker, ownerD, ivD, begunD.requestId);
    A('B2-fn 投影 purge tick 存在', projectionTick !== null);
    const tick1 = projectionTick ? await projectionTick(worker, `erj-worker-${S}`, 128) : null;
    A('B2-a 无已消费授权的 3 个 target 跳过（无授权不删）', (tick1?.skippedUnauthorized ?? 0) >= 3, JSON.stringify(tick1));
    A('B2-b 无授权面试投影行原样保留', await projectionRows(ivE) === 5);
    A('B2-c 有授权面试 event/ai_graph_run/report 物理删除 → 0', await projectionRows(ivD) === 0);
    const dTargets = (await admin.query<{ sink: string; status: string }>(
      `SELECT sink, status FROM privacy_deletion_target WHERE request_id=$1::uuid AND sink IN ('event','ai_graph_run','report')`, [begunD.requestId])).rows;
    A('B2-d 3 个投影 target 全部 erased', dTargets.length === 3 && dTargets.every((t) => t.status === 'erased'));
    const dReceipts = (await admin.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM privacy_deletion_receipt WHERE request_id=$1::uuid AND receipt_kind='local_erased'`, [begunD.requestId])).rows[0]?.n;
    A('B2-e 每个投影 target 落 local_erased 收据（恰 3）', Number(dReceipts) === 3, `receipts=${dReceipts}`);
    const eTargets = (await admin.query<{ status: string }>(
      `SELECT status FROM privacy_deletion_target WHERE request_id=$1::uuid AND sink IN ('event','ai_graph_run','report')`, [begunE.requestId])).rows;
    A('B2-f 无授权 target 仍 pending（未被租用、未伪造 erased）', eTargets.length === 3 && eTargets.every((t) => t.status === 'pending'));

    // ── B3 生产接线 ─────────────────────────────────────────────────────────
    const mainSrc = readFileSync(fileURLToPath(new URL('../src/main.ts', import.meta.url)), 'utf8');
    const workerSrc = readFileSync(fileURLToPath(new URL('../src/privacy-erasure-worker.ts', import.meta.url)), 'utf8');
    const runBody = workerSrc.slice(workerSrc.indexOf('export function runCheckpointPrivacyEraser'));
    A('B3-a main.ts privacy 循环挂在专用 privacyPool 上',
      /const privacyErasureLoop = privacyPool \? runCheckpointPrivacyEraser\(privacyPool,/.test(mainSrc));
    A('B3-b 该循环每拍跑 privacyErasureSweepTick（checkpoint + 投影 purge + job 残留）',
      /runDrainLoop\(\(\) => privacyErasureSweepTick\(pool, workerId\)/.test(runBody)
      && /checkpointPrivacyErasureTick\(pool, workerId\)/.test(workerSrc)
      && /interviewProjectionPrivacyErasureTick\(pool, workerId\)/.test(workerSrc)
      && /fencedInterviewJobResidueTick\(pool\)/.test(workerSrc));
    // 行为：新造一场「有授权投影 + 历史残留」，只调生产 tick 一次，两类数据都应清完。
    const ownerF = `erj-f-${S}`; const ivF = `erj-iv-f-${S}`;
    await seedInterview(ownerF, ivF);
    await seedJobs(runtime, ownerF, ivF);
    await seedProjection(runtime, ownerF, ivF);
    const begunF = await asPrincipal(runtime, ownerF, (c) => beginInterviewProjectionErasure(c, ivF, nextHash('f'), 1));
    await restoreLegacyResidue(ivF);
    await authorize(worker, ownerF, ivF, begunF.requestId);
    const sweep = sweepTick ? await sweepTick(worker, `erj-sweep-${S}`).catch((e: unknown) => ({ error: String((e as { code?: string }).code ?? 'err') })) : null;
    const fJobs = await jobs(ivF);
    A('B3-c 生产 tick 一拍：投影行 → 0', await projectionRows(ivF) === 0, JSON.stringify(sweep));
    A('B3-d 生产 tick 一拍：job 残留明文只剩活租约 running 行', fJobs.filter((j) => j.hasPlain).map((j) => j.seq).join(',') === '4',
      fJobs.map((j) => `${j.seq}:${j.status}:${j.hasPlain ? 'P' : '-'}`).join(' '));
  } finally {
    await runtime.end().catch(() => undefined);
    await worker.end().catch(() => undefined);
  }
}

main()
  .then(async () => {
    await admin.end().catch(() => undefined);
    console.log(`\nERASURE_JOB_PROJECTION_PROVE ${failures === 0 ? 'PASS' : 'FAIL'} ${total - failures}/${total}`);
    process.exit(failures === 0 ? 0 : 1);
  })
  .catch(async (e: unknown) => {
    await admin.end().catch(() => undefined);
    console.error(`ERASURE_JOB_PROJECTION_PROVE CRASH ${String((e as { code?: string }).code ?? (e as Error)?.message ?? e)}`);
    process.exit(1);
  });
