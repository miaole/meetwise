/**
 * AG-D-ADMISSION（AG 修复轨刀 D·AG-01 准入拒绝去终态化）worker 衔接证明（真 PG 隔离容器）。
 *
 * 目标：证明准入拒绝在 worker 链路=「requeue+退避到点真重试」而非「图投影判死终场退款」——
 * 裁决项③落点=adaptive-interview-service 出题 seam（invoke 拒收点抛带 code 异常·checkpoint 停
 * last-good superstep）→ consumer 刀 C 白名单（本刀准入族六码只增）requeueOrTerminalizeExhausted；
 * invoke 侧已按案A 释放 claim（0179），到点重领走 0130 expired-claimed 重领=模型真重试。
 * 耗尽臂：拒绝族打满 attempts（MAX=5）→ retry_exhausted 兜底终态（拒绝风暴有界·EXPERT §二-3 回流约束）。
 * 注入形=interview.proof.ts ConsumerDeps 注入（scriptedModelClient + MemorySaver + route 供给同链），
 * 熔断注入=admitSharedModelOperation×5+record failure（model-op02 trip 形·真共享准入权威）。
 * 出题分区（question-generation）与 planner 分区正交=plan 臂零连带（plan 走既有成功/缓存路径）。
 * 此测试只能由 scripts/run-e2e-isolated.mjs 在完整版本化迁移（含 0175/0179）后运行，禁影子 schema。
 *   pnpm ag-d-admission:prove
 */
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  assertIsolatedTestTarget, asPrincipal, availableUnits, completeIngestion, createPool,
  createResumeWithBlob, enqueueInterviewJob, MAX_INTERVIEW_JOB_ATTEMPTS, reserveEntitlement,
  supplyCandidateProfileRoute, transitionResume,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { scriptedModelClient, resolveModelAdmissionPartition, admitSharedModelOperation, recordSharedModelOperation, type ModelClient } from '@meetwise/ai-runtime';
import { drainInterviewJobOnce, isTransientInterviewJobError, TRANSIENT_INTERVIEW_JOB_ERROR_CODES, type ConsumerDeps } from '../src/interview-consumer.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);

const OWNER = `ag-d-adm-worker-${process.pid}`;
const TID = `ag-d-tid-${Date.now()}`;        // ②requeue+③真重试 臂
const TID2 = `ag-d-tid2-${Date.now()}`;      // ④耗尽臂（独立面试·零 checkpoint 干扰）
const RESUME = [
  '工作经历',
  '负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。',
  '技能',
  'Redis、限流、分布式锁',
].join('\n');

/** 出题分区（0120 种子 allowed·与 planner 分区正交=plan 臂零连带）。 */
const askPartition = resolveModelAdmissionPartition({ operation: { id: 'interview.question-generation.v1', businessRevision: 'ag-d' } })!;

let askSeq = 0;
const model: ModelClient = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['高并发'] } }),
  // refs=选定事实子串（grounded 闸 refsGroundedInFacts：consent 供给 facts 含 'Redis' 子串→闸过，
  // 零 gr{k} 回退——首问真走 ask invoke 单键 `:0`，熔断注入可达）。
  'interviewer.ask': () => ({ ok: true, raw: { q: `请说明高并发限流的取舍，并给出第 ${++askSeq} 轮验证方法。`, refs: ['Redis'] } }),
});

const tripBreaker = async () => {
  for (let i = 0; i < 5; i++) {
    const a = await admitSharedModelOperation(pool, OWNER, { partition: askPartition, idempotencyKey: `ag-d:trip:${Date.now()}:${i}:${randomUUID().slice(0, 8)}` });
    if (a.ok) await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, a.lease, 'failure'));
  }
};
// 准入面四表（policy/breaker/concurrency）REVOKE ALL 自 app_role（0120:132·SECURITY DEFINER 单通道）——
// fixture 直改走 migration-owner raw pool.query（model-op02 :113-117 专用分区 INSERT 同形先例）。
const resetBreaker = () => pool.query(
  `UPDATE ai_model_breaker_state SET phase='closed', consecutive_failures=0, opened_at=NULL,
          half_open_probe_token=NULL, half_open_probe_expires_at=NULL WHERE operation_id=$1`, [askPartition.operationId]);

const jobRow = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query<{ status: string; attempts: number; next_attempt_at: string | null; last_error: string | null }>(
    'SELECT status,attempts,next_attempt_at::text,last_error FROM interview_job WHERE interview_id=$1', [iid])).then((r) => r.rows[0]!);
const backoffSeconds = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query<{ d: number | null }>(
    'SELECT EXTRACT(EPOCH FROM (next_attempt_at - now()))::float AS d FROM interview_job WHERE interview_id=$1', [iid])).then((r) => r.rows[0]?.d ?? null);
const backdateDue = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query("UPDATE interview_job SET next_attempt_at=now()-interval '1 second' WHERE interview_id=$1", [iid]));
const eventRows = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query<{ kind: string; reason: string | null }>(
    "SELECT kind,payload->>'reason' AS reason FROM interview_event WHERE stream_key=$1 ORDER BY seq", [iid])).then((r) => r.rows);
const askLedgerRow = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query<{ status: string; error_code: string | null; lease_token: string | null; lease_expires_at: string | null; completed_at: string | null }>(
    `SELECT status,error_code,lease_token::text,lease_expires_at::text,completed_at::text
       FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`,
    [OWNER, `${iid}:ask:t0:0`])).then((r) => r.rows[0]);
const askLedgerRowsAll = (iid: string) =>
  asPrincipal(pool, OWNER, (c) => c.query<{ idempotency_key: string; status: string; error_code: string | null }>(
    `SELECT idempotency_key,status,error_code FROM ai_model_invocation
       WHERE owner_user_id=$1 AND idempotency_key LIKE $2 ORDER BY created_at`,
    [OWNER, `${iid}:ask:%`])).then((r) => r.rows);
const avail = () => asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));

async function main() {
  await assertIsolatedTestTarget(pool);

  // 熔断注入稳定性：本 proof 全程把出题分区冷却窗拔高（3600s）——臂 ④ 耗尽循环不因 30s 冷却到点
  // 进 half_open 探针被误放行（真 trip 形不依赖冷却参数·0120 种子零改=Ban 合规）。
  await pool.query(
    `UPDATE ai_model_admission_policy SET breaker_cooldown_ms=3600000
      WHERE provider_account=$1 AND region=$2 AND model_or_recipe=$3 AND operation_id=$4`,
    [askPartition.providerAccount, askPartition.region, askPartition.modelOrRecipe, askPartition.operationId]);
  await pool.query(`DELETE FROM ai_model_breaker_state WHERE operation_id=$1`, [askPartition.operationId]);
  await pool.query(`DELETE FROM ai_model_concurrency_lease WHERE operation_id=$1`, [askPartition.operationId]);

  // ── fixture：简历 v64 + 两面试（②③ 臂 / ④ 臂）+ 预留。 ──
  const resumeId = await asPrincipal(pool, OWNER, async (c) => {
    const upload = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, upload.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, upload.resumeId, ingestResume(RESUME));
    return upload.resumeId;
  });
  const resumeEpoch = await asPrincipal(pool, OWNER, async (c) => Number((await c.query<{ privacy_epoch: number }>(
    'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resumeId, OWNER],
  )).rows[0]!.privacy_epoch));
  await asPrincipal(pool, OWNER, async (c) => {
    for (const iid of [TID, TID2]) {
      await c.query(
        "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)",
        [iid, OWNER, resumeId, resumeEpoch],
      );
    }
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '30 days')", [OWNER],
    );
    // G1(RESUME-GROUNDING) consent 门供给：无 consent → grounding.pool=[] → 首问 grounded 走
    // approvedTemplateGeneration 模板回退（零模型调用·ask invoke 不发生·熔断注入不可达）。
    // 有 consent → 选定事实进模型 seam → 首问真走 ask invoke（出题分区共享准入=本刀注入面）。
    await c.query(
      "INSERT INTO consent_record(id,owner_user_id,purpose,policy_version) VALUES ($1,$2,'interview_personalization','proof-v1')",
      [randomUUID(), OWNER],
    );
  });
  for (const iid of [TID, TID2]) {
    const routeSupply = await asPrincipal(pool, OWNER, (c) => supplyCandidateProfileRoute(c, OWNER, iid, resumeId));
    A(`fixture ${iid} 经生产同链供给 route snapshot（0142）`, routeSupply.status === 'supplied');
    await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, iid, 'mock_interview', 1.0));
    await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, iid, 'start', { requestId: `ag-d-proof-${iid}` }, 0));
  }
  const reservedBalance = await avail();

  const deps: ConsumerDeps = {
    pool,
    cp: new MemorySaver() as never,
    model,
    leaseOwner: `ag-d-worker-${process.pid}`,
    adaptive: {
      role: '后端工程师',
      maxTurns: 2,
      absoluteMaxTurns: 2,
      localRetrieve: async () => [],
      webExplore: async () => [],
    },
  };

  section('① 分类纯函数臂：准入族六码入白名单（只增）·确定性拒绝不入（零放宽）');
  A('白名单只增：刀 C 四族原八码全在', ['graph_fence_lost', '57014', '57P01', '57P02', '57P03', 'ECONNRESET', 'EPIPE', 'ETIMEDOUT']
    .every((c) => TRANSIENT_INTERVIEW_JOB_ERROR_CODES.has(c)));
  A('准入族六码 → 瞬时（requeue 面）',
    ['model_circuit_open', 'model_circuit_half_open', 'model_concurrency_exhausted', 'cost_budget_exhausted', 'model_admission_timeout', 'model_admission_failed']
      .every((c) => isTransientInterviewJobError(c)));
  A('族外确定性拒绝 → 非瞬时（failed 终态零放宽）',
    !isTransientInterviewJobError('model_failover_cost_policy_mismatch')
    && !isTransientInterviewJobError('model_admission_operation_blocked')
    && !isTransientInterviewJobError('privacy_fenced_pre_dispatch'));

  section('② requeue 臂：熔断 trip → drain 准入拒绝 → job requeued（非判死终态·零退款·账本=案A 释放形）');
  await tripBreaker();
  const openPhase = await pool.query<{ phase: string }>(
    'SELECT phase FROM ai_model_breaker_state WHERE operation_id=$1', [askPartition.operationId]);
  A('出题分区断路器已 trip=open（注入就位）', openPhase.rows[0]?.phase === 'open');
  const r1 = await drainInterviewJobOnce(deps, OWNER);
  A('drain 返回 retry（拒绝族分流 requeue·非 failed）', r1 === 'retry');
  const after1 = await jobRow(TID);
  const delta1 = await backoffSeconds(TID);
  A('job 翻 queued 且 next_attempt_at 退避落值（刀 C 0175 面·attempts=1 → ≈2s）',
    after1.status === 'queued' && after1.attempts === 1 && delta1 !== null && delta1 > 1 && delta1 <= 2.5);
  A('额度未动（零退款·interview 不终场）', (await avail()) === reservedBalance);
  A('零 unavailable 终态事件（图投影判死链未触发）',
    !(await eventRows(TID)).some((e) => e.kind === 'assessment_unavailable' || e.kind === 'interview_unavailable'));
  const ledger1 = await askLedgerRow(TID);
  A('ask 键账本=案A 释放形（claimed+token 承袭非空+lease 即刻过期+error_code/completed_at 零写·非 failed）',
    !!ledger1 && ledger1.status === 'claimed' && ledger1.error_code === null && ledger1.lease_token !== null
      && ledger1.completed_at === null && ledger1.lease_expires_at !== null
      && new Date(ledger1.lease_expires_at).getTime() <= Date.now());

  section('③ 真重试臂：断路器复位+退避到点 → 同键重领=模型真重试（出题成功·job done）');
  await resetBreaker();
  await backdateDue(TID);
  const r2 = await drainInterviewJobOnce(deps, OWNER);
  A('drain 返回 start（重领执行完成）', r2 === 'start');
  const after2 = await jobRow(TID);
  A('job 终态 done（attempts=2·键未毒化的 job 面证据）', after2.status === 'done' && after2.attempts === 2);
  const issued = await asPrincipal(pool, OWNER, (c) => c.query<{ question_id: string }>(
    "SELECT question_id FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [TID]));
  A('首题已投影 issued（出题真重试成功·非 generation_unavailable）', issued.rows.length === 1);
  const ledger2 = await askLedgerRow(TID);
  A(`ask 键账本=同键 succeeded（0130:211-212 重领覆写后真重试完成·终态清 token 为既有语义）[rows=${JSON.stringify((await askLedgerRowsAll(TID)).map((r) => `${r.idempotency_key.slice(-10)}:${r.status}:${r.error_code}`))}]`,
    ledger2?.status === 'succeeded' && ledger2?.error_code === null
      && (await askLedgerRowsAll(TID)).every((r) => r.idempotency_key.endsWith(':ask:t0:0')));

  section('④ 耗尽臂：拒绝族连续打到 attempts=MAX → retry_exhausted 兜底终态（拒绝风暴有界）');
  await tripBreaker();
  let lastResult = '';
  for (let expected = 1; expected <= MAX_INTERVIEW_JOB_ATTEMPTS; expected++) {
    if (expected > 1) await backdateDue(TID2);
    lastResult = await drainInterviewJobOnce(deps, OWNER);
    const row = await jobRow(TID2);
    if (expected < MAX_INTERVIEW_JOB_ATTEMPTS) {
      A(`拒绝 attempts=${expected}（<MAX）→ 仍 requeue`, lastResult === 'retry' && row.status === 'queued' && row.attempts === expected);
    } else {
      A(`拒绝 attempts=${expected}（=MAX）→ 上限闸 retry_exhausted 终态`, lastResult === 'failed' && row.status === 'failed');
    }
  }
  const afterMax = await jobRow(TID2);
  A('last_error 标注 retry_exhausted:model_circuit_open（拒绝风暴断根）',
    (afterMax.last_error ?? '').startsWith('retry_exhausted:model_circuit_open'));
  A('终态事件 reason=retry_exhausted', (await eventRows(TID2)).some((e) => e.kind === 'interview_unavailable' && e.reason === 'retry_exhausted'));
  A('超限退款：预留额度退还（+1.0·有界终态非悬挂）', (await avail()) === reservedBalance + 1.0);

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ AG-D worker 衔接（准入拒绝→requeue→真重试→有界耗尽）全部通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
