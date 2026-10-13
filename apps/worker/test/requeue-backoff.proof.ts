/**
 * AG-04 刀C（AG-C-REQUEUE·失败语义轨）证明（对真 Postgres）：consumer 瞬时错误分类 requeue + #4
 * next_attempt_at 退避 + attempts 上限终态 + EG-A2 queued 滞留行终态化。消除「任何异常=整场终态退款」
 * 与「瞬时故障 5s 拍无界热循环」两根（issues-final AG-04 + EXPERT-REVIEWS §二-2 :17）。
 * 五臂（REQUEST §2-①）：
 *   ① 瞬时臂：白名单 code（ECONNRESET/57014）注入 → job 翻 queued + next_attempt_at=2^attempts 封顶 300 落值
 *      + claim 时闸未到不领 + 到点重领 attempts 递增（修法①②·requeueInterviewJob/claimNextInterviewJob 现形）；
 *   ② 确定性臂：非白名单 code → markJobFailed 终态 + interview_unavailable(reason=job_failed) + 退款
 *      （**现状语义零变负臂**——白名单外一律确定性终态，Ban 放宽）；
 *   ③ 退避单调性臂：attempts 递增 → 退避间隔 2/4/8/16s 单调不减 + 封顶 300s（attempts=20 → 300·report.ts:53
 *      范本逐字形）；
 *   ④ 超限臂：瞬时连续打到 attempts=MAX → 终态 failed + last_error retry_exhausted:* + retry_exhausted
 *      事件 + 退款（修法③ requeue 调用点上限闸=热循环断根，绝不无限 requeue）；
 *   ⑤ EG-A2 滞留行臂（裁决④②形·reaper queued 扫终态化）：queued 且 attempts≥MAX 滞留行由收割拍终态化
 *      （failed + retry_exhausted 事件 + 退款 + attempts 不自增=收割先于 drain 不入领）+ 终态后 claim 零领取
 *      + 二次 reap 幂等（rev2 E2：claim 谓词单选形无终态路径，reaper queued 扫才是终态化面）。
 * 注入面=ConsumerDeps.pool 包装（route snapshot 读是 drain try 块内首个 DB 读·asPrincipal `throw e` 直透不包装），
 * errCode 沿 Object.assign code 惯例（adaptive-lifecycle :121 同形——PG SQLSTATE/标签原生过面）。
 * 同 owner 多 job 的 claim 择早（seq,created_at）由 fixture 预置 next_attempt_at 未来值隔离——各臂独占可领集。
 * 假时钟可证：next_attempt_at 直接回拨/前拨（reaper prove 先例），无需等待真实退避。
 * 此测试只能由 scripts/run-e2e-isolated.mjs 在完整版本化迁移（含 0175）后运行，禁影子 schema 伪造通过。
 *   pnpm requeue-backoff:prove
 */
import { MemorySaver } from '@langchain/langgraph';
import {
  assertIsolatedTestTarget, asPrincipal, availableUnits, claimNextInterviewJob, createPool,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueInterviewJob,
  MAX_INTERVIEW_JOB_ATTEMPTS, requeueInterviewJob, reserveEntitlement,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { scriptedModelClient } from '@meetwise/ai-runtime';
import { drainInterviewJobOnce, interviewDispatchTick, reapStuckInterviewJobs, type ConsumerDeps } from '../src/interview-consumer.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);

const OWNER = `agc-requeue-${process.pid}`;
const TID = `agc-tid-${Date.now()}`;    // ①③④：瞬时→退避单调→超限
const DID = `agc-did-${Date.now()}`;    // ②：确定性
const CAPID = `agc-cap-${Date.now()}`;  // ③：退避封顶（attempts=20 落 queued 后=超限滞留行·⑤ 被正当收割）
const STRID = `agc-str-${Date.now()}`;  // ⑤：EG-A2 滞留行
const GID = `agc-gid-${Date.now()}`;    // ⑤：未超限退避行（时闸在生产拍成立·收割扫不触）

/* ── 故障注入：pool.connect 返回的 client.query 拦截 route snapshot 读（drain try 块内首个 DB 读）── */
const fault = { armed: false, code: '', thrown: 0 };
function injectFault(client: { query: (...a: unknown[]) => unknown }): unknown {
  const origQuery = client.query.bind(client);
  client.query = (...args: unknown[]) => {
    const sql = args[0];
    const text = typeof sql === 'string' ? sql : (sql as { text?: string } | undefined)?.text ?? '';
    if (fault.armed && fault.code && typeof text === 'string' && text.includes('candidate_profile_route_snapshot')) {
      fault.armed = false;
      fault.thrown += 1;
      throw Object.assign(new Error(`simulated_transient_fault:${fault.code}`), { code: fault.code });
    }
    return origQuery(...args);
  };
  return client;
}
/** ConsumerDeps.pool 包装：仅 fault.armed 时对 route snapshot 读抛 errCode 错误（其余逐字节透传）。 */
function faultPool(base: ReturnType<typeof createPool>): ReturnType<typeof createPool> {
  return new Proxy(base, {
    get(target, prop, receiver) {
      if (prop === 'connect') {
        return async () => injectFault(await (target as unknown as { connect: () => Promise<never> }).connect());
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

const arm = (code: string) => { fault.code = code; fault.armed = true; };

const jobRow = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query<{ status: string; attempts: number; lease_owner: string | null; next_attempt_at: string | null; last_error: string | null }>(
    'SELECT status, attempts, lease_owner, next_attempt_at::text, last_error FROM interview_job WHERE interview_id=$1', [iid])).then((r) => r.rows[0]!);
const eventRows = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query<{ kind: string; reason: string | null }>(
    "SELECT kind, payload->>'reason' AS reason FROM interview_event WHERE stream_key=$1 ORDER BY seq", [iid])).then((r) => r.rows);
const avail = () => asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
const backoffSeconds = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query<{ d: number | null }>(
    'SELECT EXTRACT(EPOCH FROM (next_attempt_at - now()))::float AS d FROM interview_job WHERE interview_id=$1', [iid])).then((r) => r.rows[0]?.d ?? null);
/** 假时钟：回拨到点（可领）。 */
const backdateDue = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query("UPDATE interview_job SET next_attempt_at=now()-interval '1 second' WHERE interview_id=$1", [iid]));
/** 假时钟：前拨parking（不可领——同 owner claim 择早隔离面）。 */
const parkDue = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query("UPDATE interview_job SET next_attempt_at=now()+interval '1 hour' WHERE interview_id=$1", [iid]));
const jobIdOf = async (iid: string) =>
  (await asPrincipal(pool, OWNER, (c) => c.query<{ id: string }>('SELECT id FROM interview_job WHERE interview_id=$1', [iid]))).rows[0]!.id;

async function main() {
  await assertIsolatedTestTarget(pool);
  const resumeId = await asPrincipal(pool, OWNER, async (c) => {
    const upload = await createResumeWithBlob(c, OWNER, '经历：负责分布式限流、Redis 计数器与订单系统可靠性');
    await transitionResume(c, OWNER, upload.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, upload.resumeId, ingestResume('经历：负责分布式限流、Redis 计数器与订单系统可靠性'));
    return upload.resumeId;
  });
  const resumeEpoch = await asPrincipal(pool, OWNER, async (c) => Number((await c.query<{ privacy_epoch: number }>(
    'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resumeId, OWNER],
  )).rows[0]!.privacy_epoch));
  await asPrincipal(pool, OWNER, async (c) => {
    for (const iid of [TID, DID, CAPID, STRID, GID]) {
      await c.query(
        "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'active',$3,$4)",
        [iid, OWNER, resumeId, resumeEpoch],
      );
    }
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',10.0, now()+interval '300 days')", [OWNER],
    );
  });
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, TID, 'mock_interview', 1.0));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, DID, 'mock_interview', 1.0));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, STRID, 'mock_interview', 1.0));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, TID, 'start', {}, 0));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, DID, 'start', {}, 0));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, CAPID, 'start', {}, 0));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, STRID, 'start', {}, 0));
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, GID, 'start', {}, 0));
  // 同 owner claim 择早隔离：CAP/STR/GID 三行预置远期退避（各臂独占可领集；③b/⑤ 面直行使 UPDATE 覆写）。
  await parkDue(CAPID);
  await parkDue(STRID);
  await parkDue(GID);
  const reservedBalance = await avail();   // 已扣 3×1.0

  const deps: ConsumerDeps = {
    pool: faultPool(pool) as unknown as ConsumerDeps['pool'],
    cp: new MemorySaver() as never,
    model: scriptedModelClient({}),
    leaseOwner: `agc-requeue-worker-${process.pid}`,
    adaptive: { localRetrieve: async () => [], webExplore: async () => [] },
  };

  section('① 瞬时臂（requeue 面）：白名单 code → 翻 queued + next_attempt_at 退避落值');
  arm('ECONNRESET');
  const r1 = await drainInterviewJobOnce(deps, OWNER);
  A('drain 返回 retry（非 failed——白名单命中分流）', r1 === 'retry');
  const after1 = await jobRow(TID);
  A('job 翻 queued 且 lease 释放（NULL·非终态）', after1.status === 'queued' && after1.lease_owner === null);
  A('attempts=1（claim 自增现值·requeue 不双增）', after1.attempts === 1);
  const delta1 = await backoffSeconds(TID);
  A('next_attempt_at 落值=2^attempts 秒（attempts=1 → 2s·report.ts:53 范本形）', delta1 !== null && delta1 > 1 && delta1 <= 2.5);
  A('注入恰好触发一次（ECONNRESET 原生过 errCode 面）', fault.thrown === 1);
  A('额度未动（仅 requeue，不退款）', (await avail()) === reservedBalance);
  await parkDue(TID);   // parking：① 落值已断言完毕，后续臂独占可领集

  section('② 确定性臂：非白名单 code → 确定性终态 + job_failed 事件 + 退款（现状语义零变负臂）');
  arm('resume_boom_deterministic');   // 非白名单·非 08 类前缀
  const r2 = await drainInterviewJobOnce(deps, OWNER);
  A('drain 返回 failed（白名单外维持确定性终态分流）', r2 === 'failed');
  const afterD = await jobRow(DID);
  A('job 终态 failed 且 lease 释放', afterD.status === 'failed' && afterD.lease_owner === null);
  const didEvents = await eventRows(DID);
  A('发 interview_unavailable 且 reason=job_failed（终态事件分诊现状形）',
    didEvents.some((e) => e.kind === 'interview_unavailable' && e.reason === 'job_failed'));
  A('**失败退款**：预留额度退还（+1.0）', (await avail()) === reservedBalance + 1.0);
  A('零 requeue（确定性错误绝不翻 queued）', afterD.status !== 'queued');

  section('①b 瞬时臂（时闸面）：queued 且退避未到 → claim 拒领；到点（回拨）→ 重领 attempts 递增');
  A('时闸未到不领：queued 且 next_attempt_at 未来 → claim 返回 null',
    (await asPrincipal(pool, OWNER, (c) => claimNextInterviewJob(c, OWNER, 'probe-1'))) === null);
  await backdateDue(TID);
  const probe = await asPrincipal(pool, OWNER, (c) => claimNextInterviewJob(c, OWNER, 'probe-1'));
  A('时闸到点重领：backdate 后 claim 返回行且 attempts 递增 1→2', probe !== null && probe.attempts === 2);
  // 探针领走后原样归还（db requeueInterviewJob 面直行使·写 2^2=4s 退避）：
  await asPrincipal(pool, OWNER, (c) => requeueInterviewJob(c, OWNER, probe!.id, 'probe-1'));
  const delta2 = await backoffSeconds(TID);
  A('probe 归还同拍写退避（attempts=2 → 4s）', delta2 !== null && delta2 > 3 && delta2 <= 4.5);

  section('③+④ 超限臂+退避单调：瞬时连续至 attempts=MAX → retry_exhausted 终态；间隔 2/4/8/16 单调不减');
  const deltas: number[] = [delta1!, delta2!];
  let lastResult: string = '';
  for (let expectedAttempts = 3; expectedAttempts <= MAX_INTERVIEW_JOB_ATTEMPTS; expectedAttempts++) {
    await backdateDue(TID);
    arm('57014');
    lastResult = await drainInterviewJobOnce(deps, OWNER);
    const row = await jobRow(TID);
    if (expectedAttempts < MAX_INTERVIEW_JOB_ATTEMPTS) {
      A(`瞬时 attempts=${expectedAttempts}（<MAX）→ 仍 requeue 且退避再写`, lastResult === 'retry' && row.status === 'queued' && row.attempts === expectedAttempts);
      deltas.push((await backoffSeconds(TID))!);
    } else {
      A(`瞬时 attempts=${expectedAttempts}（=MAX）→ 上限闸终态（不再 requeue·热循环断根）`, lastResult === 'failed' && row.status === 'failed');
    }
  }
  A('退避间隔序列=[2,4,8,16] 逐值吻合 2^attempts', JSON.stringify(deltas.map((d) => Math.round(d))) === JSON.stringify([2, 4, 8, 16]));
  A('退避间隔单调不减（2≤4≤8≤16）', deltas.every((d, i) => i === 0 || d >= deltas[i - 1]!));
  const afterT = await jobRow(TID);
  A('超限终态 failed + last_error 标注 retry_exhausted:57014（调用点上限闸）',
    afterT.status === 'failed' && (afterT.last_error ?? '').startsWith('retry_exhausted:57014'));
  A('终态事件 reason=retry_exhausted（reason 联合新值·事件分诊沿既有形）',
    (await eventRows(TID)).some((e) => e.kind === 'interview_unavailable' && e.reason === 'retry_exhausted'));
  A('超限退款：预留额度退还（+1.0）', (await avail()) === reservedBalance + 2.0);

  section('③b 退避封顶臂：attempts=20 → 退避封顶 300s（2^n 封顶·零溢出面）');
  const capJobId = await jobIdOf(CAPID);
  await asPrincipal(pool, OWNER, (c) => c.query(
    "UPDATE interview_job SET status='running', lease_owner='cap-worker', attempts=20, next_attempt_at=NULL WHERE id=$1", [capJobId]));
  const capRequeued = await asPrincipal(pool, OWNER, (c) => requeueInterviewJob(c, OWNER, capJobId, 'cap-worker'));
  const capDelta = await backoffSeconds(CAPID);
  A('cap requeue 成功且退避封顶 300s（least(2^20,300)=300）', capRequeued === true && capDelta !== null && capDelta > 298 && capDelta <= 300);

  section('⑤ EG-A2 滞留行臂（裁决④②形）：queued 且 attempts≥MAX 由收割拍终态化——收割先于 drain 不入领');
  const strJobId = await jobIdOf(STRID);
  await asPrincipal(pool, OWNER, (c) => c.query(
    'UPDATE interview_job SET status=\'queued\', attempts=$2, lease_owner=NULL, next_attempt_at=NULL WHERE id=$1',
    [strJobId, MAX_INTERVIEW_JOB_ATTEMPTS]));
  const strandedBefore = await jobRow(STRID);
  A('滞留行 fixture 就位（queued+attempts=MAX+无退避=legacy 形态）',
    strandedBefore.status === 'queued' && strandedBefore.attempts === MAX_INTERVIEW_JOB_ATTEMPTS);
  const tick = await interviewDispatchTick(deps);
  A('一拍调度收割 owner 队列（tick 面·收割先于 drain 的生产拍序）', tick.owners >= 1);
  const strandedAfter = await jobRow(STRID);
  A('滞留行被 reaper queued 扫终态化（failed + reaped:retry_exhausted）',
    strandedAfter.status === 'failed' && strandedAfter.last_error === 'reaped:retry_exhausted');
  A('收割终态化不经过 claim（attempts 恒=MAX 未自增——滞留行不入领）',
    strandedAfter.attempts === MAX_INTERVIEW_JOB_ATTEMPTS);
  A('发 retry_exhausted 终态事件（EG-A2 无静默死胡同）',
    (await eventRows(STRID)).some((e) => e.kind === 'interview_unavailable' && e.reason === 'retry_exhausted'));
  A('滞留行退款：预留额度退还（+1.0）', (await avail()) === reservedBalance + 3.0);
  A('终态后 claim 零领取（僵尸守卫+热循环断根）',
    (await asPrincipal(pool, OWNER, (c) => claimNextInterviewJob(c, OWNER, 'probe-2'))) === null);
  const reap2 = await reapStuckInterviewJobs(deps, OWNER);
  A('二次 reap 幂等（零收割·无重复事件·无重复退款）',
    reap2.failed === 0 && reap2.requeued === 0
    && (await eventRows(STRID)).filter((e) => e.reason === 'retry_exhausted').length === 1
    && (await avail()) === reservedBalance + 3.0);
  // 首跑 erratum：cap 行（attempts=20≥MAX 落 queued）被同拍超限扫正当终态化（sweep 记 retry_exhausted:2）——
  // 时闸只闸 claim 领取面（①b/③b 已证），不豁免超限行的终态化（收割扫是终态化面非领取面）。断言随此如实改：
  const capAfterTick = await jobRow(CAPID);
  A('超限行退避未到仍被收割终态（attempts≥MAX 扫不受时闸约束——终态化面≠领取面）',
    capAfterTick.status === 'failed' && capAfterTick.last_error === 'reaped:retry_exhausted' && capAfterTick.attempts === 20);
  A('未超限退避行同拍不被领不被收（时闸在生产 tick 面成立·收割扫只触 attempts≥MAX）',
    (await jobRow(GID)).status === 'queued' && (await jobRow(GID)).attempts === 0);

  console.log(`\n${failures === 0 ? '✓ AG-04 刀C（瞬时分类 requeue + 退避时闸 + 上限终态 + EG-A2 滞留行终态化）全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
