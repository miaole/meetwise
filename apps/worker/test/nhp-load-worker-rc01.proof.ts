/**
 * NHP-LOAD-WORKER-SUITE-RC-01 — worker 负载伞首刀 route-classify 真消费积压形状负载收据
 * （case-only · blind · 派单 A 方案 · REQUEST ai-docs/delivery/harness/rcload-REQUEST.md §1 终形）.
 *
 * Contract: PC（1 owner×1 岗先行·真 worker 进程 LISTEN 唤醒 drain 至 route_decided·对照缺失=Ban 假绿）
 *   + L1（主证：B 端 createJob 风暴 N=20 owner×M=5 岗=100 真产品路径 → route_pending 积压 →
 *         LISTEN 唤醒+1s reconcile drain 至稳态：残留=0·波数≤W=10）
 *   + L2（零模型硬闸：decision 行全 rule_decided=110·revision 无 model_prepared/result_validated/
 *         route_unresolved·event 无 to_status∈{model_prepared,result_validated}·
 *         ai_model_invocation 零增·四队列 gauges 全程零染）
 *   + L3（逐波收据：1s 直 poll·hrtime 计拍·backlog/吞吐/错误率+时延推导落 receipt）
 *   + L4（幂等已决对照：S=10 已决 cohort 全程零重 peek 零重决·事件流/状态/决策行零变）。
 *
 * 造数诚实（nhp-batch-b REQUEST :144 律承接）：全部建岗经真产品路径 recruiter.createJob
 *   （recruiter.ts :32 · 同事务 :47 createJobSemanticRevision 写 revision(route_pending)·Ban 裸 INSERT
 *   绕 revision/事件管道）；user_account 行为夹具（authz5a 先例形）；Ban 混词语料——语料=单信号词族轮转
 *   （每输入恰一叶命中·PC 段 classifyJobByRule 全非 null 预校验·8 叶全覆盖）。
 *
 * 真进程缝：worker 子进程 spawn 形同源 scripts/run-e2e.mjs:132（node --import @swc-node/register/esm-register
 *   src/main.ts · cwd apps/worker）；WORKER_BOOTSTRAP=1（main.ts :881 bootstrap）；等 boot 日志行形匹配
 *   （零 Redis 隔离下实印 `worker degraded:` 非 `ready`（main.ts :878 ragCache.available 路径）·
 *   Ban 字面 ready 作等待词）；零 Key observe 形（main.ts :455 注·NODE_ENV=test + MODEL_COST_ENFORCEMENT
 *   缺省=observe（model-cost-governance.ts :143）·构造不依赖 Key·invoke 时 fail-closed）。
 *   worker 子进程 env=显式白名单构造（非继承）：仅承载隔离 PG 五件（PGHOST/PGPORT/PGUSER/PGPASSWORD/
 *   PGDATABASE）+DATABASE_SSL_MODE+E2E_ISOLATED/E2E_TEST_CONTAINER/E2E_TEST_TARGET_TOKEN+同值
 *   RAG_JOB_ROUTE_INPUT_HASH_KEY（双进程同值≥32·job-route-decision.ts :40-44）+NODE_ENV=test+
 *   WORKER_BOOTSTRAP=1+WEB_ALLOWLIST=''+WORKER_METRICS_PORT=空闲口+PATH/HOME——provider 凭据形变量
 *   结构性缺席（白名单不含即不存在·运行时键名清单+前缀扫描双亲证入 receipt）。DATABASE_URL 全程缺席
 *   （isolated-test-target :56 禁收·principal.ts :765-778 离散变量即满足 boot 池解析）。
 *
 * C 维度如实改形（REQUEST §1 冻结参数注记）：route 域 sole consumer（route-classify-consumer.ts :2 头注）
 *   无并发 worker 维度 → C 改栽为观测拍频 1s（WORKER_JOB_RECONCILE_INTERVAL_MS=1000·main.ts :510 下界）
 *   + 波帽 W=10（沿 uc017 MAX_DRAIN_WAVES=10 形）。
 *
 * Isolation: 三层壳 pnpm rcload:route-classify:prove → run-e2e-isolated.mjs → prove:rcload-route-classify；
 *   assertIsolatedTestTarget 强制隔离 nonce。零 live 模型·零 provider 凭据·零模型外呼
 *   （L2 硬闸为运行时旁证）·est live=0。
 *
 * 产能义律（nhp-batch-b :144 逐字承接）：隔离库真 worker 进程行使≠worker 容量·本收据文禁写 worker
 *   产能/生产容量/SLO/HA 义。吞吐/时延只入收据不做达标断言（§3-4·单机隔离容器）。
 *
 * EXIT0 ≠ covered ≠ 全链路 E2E covered ≠ UC 行 covered ≠ NHP-LOAD-WORKER-SUITE 伞行收口
 *        ≠ R2 closed ≠ 路由已生效 ≠ 生产容量 ≠ SLO ≠ HA。releaseEvidence=false · Not HA ·
 *        coveredCount=8 不变 · capacityRepresentative=false · rcloadCapacityClaim=false。
 * P-FAKE 边界（job-route-classify.ts :8-10 承接）：rule_unique_leaf（modelCalls=0）经 MODEL-OP-bound
 *   consumer 在 classifyJobRoute 内跑出=合法·非 rule-only fake Worker。
 * 时延口径：产品无 per-job 时延计数器披露·decision.created_at−revision.created_at 为 harness 侧推导·如实措辞。
 *
 *   pnpm rcload:route-classify:prove                (via run-e2e-isolated)
 *   pnpm -C apps/worker prove:rcload-route-classify (raw; needs isolated env + container nonce)
 *
 * Frozen params（receipt 同步登记）：N=20 storm owners × M=5 岗=100 · S=10 已决 cohort（PC 的 1 岗∈S ·
 *   PC 段补足至 10 后再 storm=L2 算术 110 前提）· W=10 波帽 · 拍频=1000ms · PC 决行界=20s ·
 *   语料=8 单信号词轮转 · HMAC key=隔离测试值（≥32·非生产凭据）。
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, asPrincipal, createJob, createPool,
  gatewayDispatchOwners, gatewayJobGauges,
} from '@meetwise/db';
import { classifyJobByRule, TAXONOMY_V1_LEAVES } from '@meetwise/domain';

// ── frozen params（REQUEST §1 冻结 · receipt 同步登记）────────────────────────────
const N_OWNERS = 20;               // storm cohort owners
const M_JOBS = 5;                  // jobs per owner → 100 storm revisions
const S_SETTLED = 10;              // settled cohort jobs（PC 的 1 岗∈S）
const MAX_DRAIN_WAVES = 10;        // 波帽（沿 uc017 形）
const SAMPLE_INTERVAL_MS = 1000;   // C 维度改形：观测拍频=worker reconcile 下界（main.ts :510）
const PC_DECIDE_TIMEOUT_MS = 20_000;
const BOOT_TIMEOUT_MS = 60_000;
const STORM_TOTAL = N_OWNERS * M_JOBS;          // 100
const DECISION_TOTAL = STORM_TOTAL + S_SETTLED; // 110（L2 算术）
const RC01_HASH_KEY = 'rcload-route-classify-isolated-input-hmac-key-01'; // ≥32 · 隔离测试值·非生产凭据

// 单信号词族轮转（每输入恰一叶命中·词典 job-route-classifier.ts :64-83·歧义词刻意不映射）·
// 键=产品 SSOT taxonomy leaf id（TAXONOMY_V1_LEAVES 原值·非本刀命名）。
const LEAF_SIGNALS: ReadonlyArray<readonly [string, string]> = [
  ['backend/nodejs', 'nodejs'],
  ['backend/java', 'spring'],
  ['backend/go', 'golang'],
  ['backend/python', 'fastapi'],
  ['backend/general', '后端开发'],
  ['frontend/web', 'react'],
  ['qa/quality_engineering', 'sdet'],
  ['ai_ml/applied', 'langchain'],
];
const signalFor = (leaf: string): string => LEAF_SIGNALS.find((pair) => pair[0] === leaf)?.[1] ?? 'nodejs';

interface WaveSample {
  wave: number; tMs: number; pending: number; decided: number; decidedDelta: number;
  gaugesZero: boolean; cohortLeak: number;
}
interface EnvAttestation {
  childEnvKeys: string[]; proofProviderPrefixHits: string[]; childProviderPrefixHits: string[];
  childDatabaseUrlAbsent: boolean; workerBootLine: string | null;
}
interface ReceiptShape {
  case: string; frozenParams: Record<string, number | string>;
  overall: 'PASS' | 'FAIL'; failedAsserts: number;
  stormWindowMs: number | null; drainWindowMs: number | null; waves: WaveSample[]; stormBacklogSamples: number[];
  throughputPerSec: number | null; errorRate: number | null;
  latency: { avgMs: number | null; maxMs: number | null; derivation: string };
  envAttestation: EnvAttestation; honesty: string;
}
interface BootFacts { bootLine: string | null; stderrTail: string; errorHead: string | null; drainErrorLines: number; childEnv: Record<string, string> }

const pool = createPool();
let fail = 0;
let assertCount = 0;
const A = (n: string, c: boolean): boolean => { assertCount += 1; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail += 1; return c; };
const section = (t: string): void => console.log(`\n──────── ${t} ────────`);
const sleep = (ms: number): Promise<void> => new Promise((r) => { setTimeout(r, ms); });
const hrMs = (start: bigint): number => Number(process.hrtime.bigint() - start) / 1e6;

const PROVIDER_PREFIX = /^(MODEL|DASHSCOPE)_/;
// observe 构造配对名豁免：MODEL_NAME/MODEL_FAST_NAME 非 provider-egress-policy environmentNames 管理
// 名（inventory environment_references=386 届值零增亲证）·非凭据（apiKey 面结构性缺席）·仅满足
// 构造期 profile/模型名前缀配对（model-client.ts :680-684）。
const PAIRING_VARS: ReadonlySet<string> = new Set(['MODEL_NAME', 'MODEL_FAST_NAME']);
const credentialShaped = (keys: string[]): string[] => keys.filter((k) => PROVIDER_PREFIX.test(k) && !PAIRING_VARS.has(k));

async function countRevisionStatus(status: string, owners?: string[]): Promise<number> {
  const r = owners
    ? await pool.query('SELECT COUNT(*)::int AS n FROM job_semantic_revision WHERE status=$1 AND owner_user_id = ANY($2)', [status, owners])
    : await pool.query('SELECT COUNT(*)::int AS n FROM job_semantic_revision WHERE status=$1', [status]);
  return Number(r.rows[0]?.n ?? 0);
}
async function countDecisions(): Promise<number> {
  const r = await pool.query('SELECT COUNT(*)::int AS n FROM job_route_decision');
  return Number(r.rows[0]?.n ?? 0);
}
async function gaugesAllZero(): Promise<boolean> {
  const gauges = await gatewayJobGauges(pool);
  return gauges.length === 4 && gauges.every((g) => g.queued === 0 && g.runningExpired === 0 && g.dead === 0);
}
interface CohortSnapshot { revisionStatuses: unknown; events: unknown; decisions: unknown }
async function cohortSnapshot(owners: string[]): Promise<CohortSnapshot> {
  const rev = await pool.query(
    'SELECT job_id, revision, status FROM job_semantic_revision WHERE owner_user_id = ANY($1) ORDER BY job_id, revision',
    [owners]);
  const ev = await pool.query(
    'SELECT job_id, revision, event_seq, from_status, to_status, reason, decision_id FROM job_route_event WHERE owner_user_id = ANY($1) ORDER BY job_id, revision, event_seq',
    [owners]);
  const dec = await pool.query(
    'SELECT id, job_id, revision, attempt_outcome, decision_hash FROM job_route_decision WHERE owner_user_id = ANY($1) ORDER BY job_id, revision',
    [owners]);
  return { revisionStatuses: rev.rows, events: ev.rows, decisions: dec.rows };
}
function fixtureInput(signal: string, i: number): { title: string; description: string; competencies: string[] } {
  return { title: `${signal} 工程师（RC01 负载样本 ${i}）`, description: `route classify load fixture ${i}`, competencies: [signal] };
}
async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.on('error', () => reject(new Error('worker_metrics_port_bind_failed')));
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr !== null ? addr.port : 0;
      srv.close(() => (port > 0 ? resolve(port) : reject(new Error('worker_metrics_port_unparseable'))));
    });
  });
}

async function runLoadPhase(child: ReturnType<typeof spawn>, boot: BootFacts, cohortOwners: string[], stormOwners: string[]): Promise<Pick<ReceiptShape, 'stormWindowMs' | 'drainWindowMs' | 'waves' | 'stormBacklogSamples' | 'throughputPerSec' | 'errorRate' | 'latency'>> {
  // ── PC-2：LISTEN 唤醒链行使（对照缺失=Ban 假绿）──────────────────────────────
  section('PC-2 LISTEN 唤醒链行使（真进程 drain 至 route_decided）');
  const inv0 = await pool.query('SELECT COUNT(*)::int AS n FROM ai_model_invocation');
  const invocationBefore = Number(inv0.rows[0]?.n ?? 0);
  const pcStart = process.hrtime.bigint();
  const pcOwner = cohortOwners[0] ?? 'rcload-cohort-00';
  const pcJob = await asPrincipal(pool, pcOwner, (c) => createJob(c, pcOwner, fixtureInput(signalFor('backend/nodejs'), 0)));
  const pcDeadline = Date.now() + PC_DECIDE_TIMEOUT_MS;
  let pcDecided = false;
  while (!pcDecided && Date.now() < pcDeadline) {
    await sleep(SAMPLE_INTERVAL_MS);
    const r = await pool.query('SELECT status FROM job_semantic_revision WHERE job_id=$1 ORDER BY revision DESC LIMIT 1', [pcJob.id]);
    pcDecided = r.rows[0]?.status === 'route_decided';
  }
  A(`PC-2: PC 岗 LISTEN 唤醒 drain 至 route_decided（+${hrMs(pcStart) | 0}ms·界 ${PC_DECIDE_TIMEOUT_MS}ms）`, pcDecided);
  const pcDecision = await pool.query('SELECT attempt_outcome FROM job_route_decision WHERE job_id=$1', [pcJob.id]);
  A('PC-2: PC 决行 attempt=rule_decided（唯一叶臂·classifyJobRoute 内 modelCalls=0 路径）', pcDecision.rows[0]?.attempt_outcome === 'rule_decided');

  // ── PC-3：cohort 补足至 S=10（L2 算术 110 前提）──────────────────────────────
  section('PC-3 已决对照 cohort 补足至 S=10');
  for (let i = 1; i < S_SETTLED; i += 1) {
    const owner = cohortOwners[i] ?? `rcload-cohort-${String(i).padStart(2, '0')}`;
    await asPrincipal(pool, owner, (c) => createJob(c, owner, fixtureInput(signalFor('backend/java'), i)));
  }
  const cohortDeadline = Date.now() + PC_DECIDE_TIMEOUT_MS;
  let cohortDecided = 0;
  while (cohortDecided < S_SETTLED && Date.now() < cohortDeadline) {
    await sleep(SAMPLE_INTERVAL_MS);
    cohortDecided = await countRevisionStatus('route_decided', cohortOwners);
  }
  A(`PC-3: S=10 已决对照 cohort 全决（含 PC 的 1 岗·实数 ${cohortDecided}/${S_SETTLED}）`, cohortDecided === S_SETTLED);
  const cohortBefore = await cohortSnapshot(cohortOwners);
  A('PC-3: cohort 全决后 route_pending 残留=0（storm 前干净基线）', await countRevisionStatus('route_pending') === 0);
  const routeOwnersCalm = await gatewayDispatchOwners(pool, 'job_route');
  A('PC-4: gateway owner 枚举（job_route）不含已决 cohort owner（只读 route_pending 自证·listNextJobRoutePending :398-404）',
    routeOwnersCalm.filter((o) => cohortOwners.includes(o)).length === 0);

  // ── L1：createJob 风暴 N=20×M=5=100（真产品路径·hrtime 计造数窗·积压逐 owner 采样）──
  // 注：LISTEN 唤醒 drain 与造数并发是产品语义（0133 trigger 逐 commit pg_notify→wake）——
  // 积压形状以逐 owner 中途采样（max/序列）承登，Ban 以「storm 后残留=100」越权钉死 drain 时序。
  section('L1 createJob 风暴（N=20 owner×M=5 岗=100·真产品路径 recruiter.createJob）');
  const stormStart = process.hrtime.bigint();
  let stormCreated = 0;
  const backlogSamples: number[] = [];
  let maxBacklog = 0;
  for (let i = 0; i < N_OWNERS; i += 1) {
    const owner = stormOwners[i] ?? `rcload-storm-${String(i).padStart(2, '0')}`;
    for (let m = 0; m < M_JOBS; m += 1) {
      const signal = LEAF_SIGNALS[(i * M_JOBS + m) % LEAF_SIGNALS.length]?.[1] ?? 'nodejs';
      await asPrincipal(pool, owner, (c) => createJob(c, owner, fixtureInput(signal, 100 + i * M_JOBS + m)));
      stormCreated += 1;
    }
    const p = await countRevisionStatus('route_pending');
    backlogSamples.push(p);
    if (p > maxBacklog) maxBacklog = p;
  }
  const stormWindowMs = hrMs(stormStart);
  A(`L1: 风暴 100 岗全部经真产品路径建岗（实数 ${stormCreated}·造数窗 ${stormWindowMs | 0}ms hrtime）`, stormCreated === STORM_TOTAL);
  A(`L1: route_pending 积压成立（逐 owner 中途采样 max=${maxBacklog}>0·序列=${backlogSamples.join(',')}·LISTEN drain 并发消费为产品语义）`,
    maxBacklog > 0 && backlogSamples.length === N_OWNERS);

  // ── L3：逐波采样（1s 直 poll·hrtime 计拍）→ 稳态 ────────────────────────────
  section('L1/L3 逐波 drain 采样（拍频 1000ms·波帽 W=10·四队列 gauges 1s 直 poll 旁证）');
  const waves: WaveSample[] = [];
  const drainStart = process.hrtime.bigint();
  let decidedTotal = await countDecisions();
  let wave = 0;
  while (wave < MAX_DRAIN_WAVES) {
    wave += 1;
    await sleep(SAMPLE_INTERVAL_MS);
    const pending = await countRevisionStatus('route_pending');
    const nextDecided = await countDecisions();
    const ownersNow = await gatewayDispatchOwners(pool, 'job_route');
    const gaugesZero = await gaugesAllZero();
    const sample: WaveSample = {
      wave, tMs: hrMs(drainStart) | 0, pending, decided: nextDecided,
      decidedDelta: nextDecided - decidedTotal, gaugesZero,
      cohortLeak: ownersNow.filter((o) => cohortOwners.includes(o)).length,
    };
    waves.push(sample);
    console.log(`WAVE ${sample.wave} t=+${sample.tMs}ms pending=${sample.pending} decided=${sample.decided}(+${sample.decidedDelta}) gaugesZero=${sample.gaugesZero} cohortLeak=${sample.cohortLeak}`);
    decidedTotal = nextDecided;
    if (pending === 0 && nextDecided >= DECISION_TOTAL) break;
  }
  const drainWindowMs = hrMs(drainStart);
  const steadyPending = await countRevisionStatus('route_pending');
  const steadyDecided = await countDecisions();
  A(`L1: 稳态 route_pending 残留=0（实数 ${steadyPending}）`, steadyPending === 0);
  A(`L1: 波数≤W=10（实数 ${wave}）`, wave <= MAX_DRAIN_WAVES);
  A(`L2: decision 行数=110=100+S（实数 ${steadyDecided}）`, steadyDecided === DECISION_TOTAL);

  // ── L2：零模型硬闸（同 run 全量 DB 复核）────────────────────────────────────
  section('L2 零模型硬闸（DB 全量复核）');
  const badOutcome = await pool.query("SELECT COUNT(*)::int AS n FROM job_route_decision WHERE attempt_outcome <> 'rule_decided'");
  A("L2: decision 行全 rule_decided（attempt_outcome<>'rule_decided' 计数=0）", Number(badOutcome.rows[0]?.n ?? 0) === 0);
  const badRevision = await pool.query(
    "SELECT COUNT(*)::int AS n FROM job_semantic_revision WHERE status IN ('model_prepared','result_validated','route_unresolved')");
  A('L2: revision 无 model_prepared/result_validated/route_unresolved 行', Number(badRevision.rows[0]?.n ?? 0) === 0);
  A(`L2: revision 终态全 route_decided（实数 ${await countRevisionStatus('route_decided')}=${DECISION_TOTAL}）`,
    await countRevisionStatus('route_decided') === DECISION_TOTAL);
  const badEvent = await pool.query(
    "SELECT COUNT(*)::int AS n FROM job_route_event WHERE to_status IN ('model_prepared','result_validated')");
  A('L2: event 无 to_status∈{model_prepared,result_validated} 行', Number(badEvent.rows[0]?.n ?? 0) === 0);
  const inv1 = await pool.query('SELECT COUNT(*)::int AS n FROM ai_model_invocation');
  A(`L2: ai_model_invocation 零新增（before=${invocationBefore}·after=${Number(inv1.rows[0]?.n ?? 0)}）`,
    Number(inv1.rows[0]?.n ?? 0) === invocationBefore);
  A('L2: 四队列 gauges 全程零染（逐波采样零染旗全真+末拍复核·gateway_job_gauges 1s 直 poll）',
    waves.every((w) => w.gaugesZero) && await gaugesAllZero());
  A('L2: drain 期 owner 枚举零 cohort 泄漏（已决对照零重 peek 旁证）', waves.every((w) => w.cohortLeak === 0));

  // ── L4：幂等已决对照（事件流/状态/决策行零变）────────────────────────────────
  section('L4 S=10 已决对照零扰动');
  const cohortAfter = await cohortSnapshot(cohortOwners);
  A('L4: cohort revision 状态流零变（storm 全程·行集 JSON 恒等）',
    JSON.stringify(cohortBefore.revisionStatuses) === JSON.stringify(cohortAfter.revisionStatuses));
  A('L4: cohort 事件流零变（零重决零追加）', JSON.stringify(cohortBefore.events) === JSON.stringify(cohortAfter.events));
  A('L4: cohort 决策行零变（零重 peek 零重写）', JSON.stringify(cohortBefore.decisions) === JSON.stringify(cohortAfter.decisions));

  // ── L3：时延推导+错误率（收据七字段）────────────────────────────────────────
  section('L3 逐波收据聚合（时延=harness 侧推导·如实措辞·非 SLO 断言）');
  const latency = await pool.query(
    `SELECT AVG(EXTRACT(EPOCH FROM (d.created_at - r.created_at)) * 1000)::float AS avg_ms,
            MAX(EXTRACT(EPOCH FROM (d.created_at - r.created_at)) * 1000)::float AS max_ms
       FROM job_route_decision d JOIN job_semantic_revision r
         ON r.job_id = d.job_id AND r.revision = d.revision`);
  const rawAvg = latency.rows[0]?.avg_ms;
  const rawMax = latency.rows[0]?.max_ms;
  const avgLatency = rawAvg === null || rawAvg === undefined ? null : Number(rawAvg);
  const maxLatency = rawMax === null || rawMax === undefined ? null : Number(rawMax);
  const routeUnresolved = Number(badRevision.rows[0]?.n ?? 0);
  const errorRate = (routeUnresolved + boot.drainErrorLines) / DECISION_TOTAL;
  A(`L3: 错误率=0（route_unresolved=${routeUnresolved}+drain failed stderr=${boot.drainErrorLines}）/ ${DECISION_TOTAL}`, errorRate === 0);
  console.log(`LATENCY derivation harness-side: avg=${avgLatency?.toFixed(1) ?? 'n/a'}ms max=${maxLatency?.toFixed(1) ?? 'n/a'}ms（decision.created_at−revision.created_at·产品无 per-job 时延计数器披露）`);
  console.log(`THROUGHPUT storm=${STORM_TOTAL} jobs · drainWindow=${(drainWindowMs / 1000).toFixed(1)}s · ${(STORM_TOTAL / (drainWindowMs / 1000)).toFixed(1)} jobs/s（收据记录·非 SLO 断言）`);
  return {
    stormWindowMs, drainWindowMs, waves, stormBacklogSamples: backlogSamples,
    throughputPerSec: drainWindowMs > 0 ? STORM_TOTAL / (drainWindowMs / 1000) : null,
    errorRate, latency: { avgMs: avgLatency, maxMs: maxLatency, derivation: 'decision.created_at − revision.created_at（harness 侧推导·非产品计数器）' },
  };
}

async function writeReceipt(
  load: Pick<ReceiptShape, 'stormWindowMs' | 'drainWindowMs' | 'waves' | 'stormBacklogSamples' | 'throughputPerSec' | 'errorRate' | 'latency'>,
  boot: BootFacts,
): Promise<void> {
  const receiptDir = fileURLToPath(new URL('../../../.tmp/rcload-rc01-receipts/', import.meta.url));
  try {
    mkdirSync(receiptDir, { recursive: true });
    const attempt = readdirSync(receiptDir).filter((f) => f.endsWith('.json')).length + 1;
    const receipt: ReceiptShape = {
      case: 'NHP-LOAD-WORKER-SUITE-RC-01',
      frozenParams: {
        stormOwners: N_OWNERS, jobsPerOwner: M_JOBS, settledCohort: S_SETTLED,
        maxDrainWaves: MAX_DRAIN_WAVES, sampleIntervalMs: SAMPLE_INTERVAL_MS,
        pcDecideTimeoutMs: PC_DECIDE_TIMEOUT_MS, corpus: 'single-signal-rotation(8-leaf)',
        hashKeyLen: RC01_HASH_KEY.length, decisionTotal: DECISION_TOTAL,
      },
      overall: fail === 0 ? 'PASS' : 'FAIL',
      failedAsserts: fail,
      ...load,
      envAttestation: {
        childEnvKeys: Object.keys(boot.childEnv).sort(),
        proofProviderPrefixHits: Object.keys(process.env).filter((k) => PROVIDER_PREFIX.test(k)),
        childProviderPrefixHits: credentialShaped(Object.keys(boot.childEnv)),
        childDatabaseUrlAbsent: boot.childEnv.DATABASE_URL === undefined,
        workerBootLine: boot.bootLine,
      },
      honesty: 'releaseEvidence=false · Not HA · capacityRepresentative=false · rcloadCapacityClaim=false · 隔离库真 worker 进程行使≠worker 容量·收据文零 worker 产能义（nhp-batch-b :144 律承接）· 吞吐/时延收据记录非 SLO 断言 · EXIT0=case≠covered≠伞行收口',
    };
    const receiptPath = join(receiptDir, `rc01-nhp-load-attempt${String(attempt).padStart(3, '0')}.json`);
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 1));
    console.log(`RECEIPT_WRITTEN ${receiptPath} · implementer pre-commit run · not evidence of record`);
  } catch (e) {
    console.error(`RECEIPT_WRITE_FAILED ${(e as Error)?.message ?? e}`);
    fail += 1; // 收据缺失 = 契约不完整（L3），不得静默绿
  }
}

async function main(): Promise<void> {
  // ── env 承载面（REQUEST 件① · 双进程同值）──────────────────────────────────
  process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY = RC01_HASH_KEY;
  process.env.NODE_ENV = 'test';
  const proofPrefixHits = Object.keys(process.env).filter((k) => PROVIDER_PREFIX.test(k));
  A('PC-ENV: proof 进程 provider 凭据形变量零命中（零 Key observe 形前提·main.ts:455 注）', proofPrefixHits.length === 0);
  A('PC-ENV: proof 进程 DATABASE_URL 缺席（isolated-test-target :56 禁收·离散 PG* 变量承载）', process.env.DATABASE_URL === undefined);
  A('PC-ENV: RAG_JOB_ROUTE_INPUT_HASH_KEY 同值 ≥32 字符（job-route-decision.ts :40-44 形）',
    RC01_HASH_KEY.length >= 32 && process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY === RC01_HASH_KEY);
  assertIsolatedTestTarget(pool);

  // ── 用户夹具（authz5a INSERT INTO user_account 先例形·非业务管道）────────────
  const cohortOwners: string[] = [];
  const stormOwners: string[] = [];
  for (let i = 0; i < S_SETTLED; i += 1) cohortOwners.push(`rcload-cohort-${String(i).padStart(2, '0')}`);
  for (let i = 0; i < N_OWNERS; i += 1) stormOwners.push(`rcload-storm-${String(i).padStart(2, '0')}`);
  for (const owner of [...cohortOwners, ...stormOwners]) {
    await pool.query(
      "INSERT INTO user_account(id, email, password_hash) VALUES ($1, $2, 'scrypt$rc01$fixture') ON CONFLICT (id) DO NOTHING",
      [owner, `${owner}@rcload.fixture.invalid`]);
  }

  // ── PC-0：语料单信号词定标预校验（Ban 混语）────────────────────────────────
  section('PC-0 语料单信号词定标预校验（classifyJobByRule 全非 null·8 叶全覆盖）');
  let ruleHits = 0;
  for (const [leaf, signal] of LEAF_SIGNALS) {
    const hit = classifyJobByRule(fixtureInput(signal, 0));
    A(`PC-0: 语料「${signal}」唯一叶命中（期望 ${leaf}·0/≥2 命中=null 即红）`, hit === leaf);
    if (hit === leaf) ruleHits += 1;
  }
  A('PC-0: 8 叶全覆盖（轮转语料覆盖 TAXONOMY_V1_LEAVES 全集）', ruleHits === TAXONOMY_V1_LEAVES.length);

  // ── PC-1：真 worker 子进程 boot（run-e2e.mjs:132 形同源·白名单 env）───────────
  section('PC-1 真 worker 子进程 boot（WORKER_BOOTSTRAP=1·零 Key observe 形）');
  const workerRoot = fileURLToPath(new URL('..', import.meta.url));
  const childEnv: Record<string, string> = {};
  for (const name of ['PATH', 'HOME', 'LANG', 'TZ', 'PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'DATABASE_SSL_MODE', 'E2E_ISOLATED', 'E2E_TEST_CONTAINER', 'E2E_TEST_TARGET_TOKEN']) {
    const v = process.env[name];
    if (v !== undefined && v !== '') childEnv[name] = v;
  }
  childEnv.NODE_ENV = 'test';
  childEnv.RAG_JOB_ROUTE_INPUT_HASH_KEY = RC01_HASH_KEY;
  childEnv.WORKER_BOOTSTRAP = '1';
  childEnv.WEB_ALLOWLIST = '';
  childEnv.WORKER_METRICS_PORT = String(await freePort());
  // observe 构造配对（零 Key）：缺省 profile=deepseek-cn-public（text-endpoint-config :77）要求模型名前缀
  // deepseek-（model-client.ts :680-684），否则 defaultModelClient/fastModelClient 构造即抛
  // text_endpoint_profile_model_mismatch（attempt1 红·面内自修如实承登）。MODEL_NAME/MODEL_FAST_NAME 为
  // provider-egress-policy environmentNames 之外的非凭据名（386 届值零增·零词面新增）·apiKey=undefined
  // （结构性缺席）·invoke 时 fail-closed·本 run 全程零 invoke（L2 硬闸运行时旁证）。
  childEnv.MODEL_NAME = 'deepseek-chat';
  childEnv.MODEL_FAST_NAME = 'deepseek-chat';
  const childProviderHits = credentialShaped(Object.keys(childEnv));
  A('PC-1: 子进程 env 白名单零 provider 凭据形键（结构性缺席·MODEL_NAME/MODEL_FAST_NAME 配对名豁免=非凭据非管理名）', childProviderHits.length === 0);
  A('PC-1: 子进程 DATABASE_URL 缺席（全程缺席）', childEnv.DATABASE_URL === undefined);
  A('PC-1: 子进程与 proof 双进程 RAG_JOB_ROUTE_INPUT_HASH_KEY 同值', childEnv.RAG_JOB_ROUTE_INPUT_HASH_KEY === process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY);

  const child = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', 'src/main.ts'], {
    cwd: workerRoot, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const boot: BootFacts = { bootLine: null, stderrTail: '', errorHead: null, drainErrorLines: 0, childEnv };
  const childClosed = new Promise<number | null>((resolve) => { child.on('exit', (code) => resolve(code)); });
  let stdoutBuf = '';
  child.stdout.on('data', (chunk: Buffer) => {
    stdoutBuf += chunk.toString('utf8');
    let idx = stdoutBuf.indexOf('\n');
    while (idx >= 0) {
      const line = stdoutBuf.slice(0, idx);
      stdoutBuf = stdoutBuf.slice(idx + 1);
      if (/^worker (ready|degraded): event wakeup/.test(line)) boot.bootLine = line;
      idx = stdoutBuf.indexOf('\n');
    }
  });
  child.stderr.on('data', (chunk: Buffer) => {
    const text = chunk.toString('utf8');
    if (boot.stderrTail.length < 8192) boot.stderrTail += text;
    if (boot.errorHead === null) {
      const m = text.match(/^(?:[A-Za-z0-9_]*Error|TypeError|RangeError): .*$/m);
      if (m) boot.errorHead = m[0].slice(0, 300);
    }
    if (/route-classify drain error/.test(text)) boot.drainErrorLines += 1;
  });

  const bootDeadline = Date.now() + BOOT_TIMEOUT_MS;
  while (boot.bootLine === null && Date.now() < bootDeadline && (await Promise.race([childClosed, Promise.resolve(-1)])) === -1) {
    await sleep(500);
  }
  A('PC-1: worker boot 日志行形在卷（worker degraded: event wakeup·main.ts :878 零 Redis 形）', boot.bootLine !== null && boot.bootLine.includes('degraded'));
  A('PC-1: boot 行含 route-classify 消费面（drain 项在 :878 排水清单）', boot.bootLine !== null && boot.bootLine.includes('route-classify'));
  const earlyExit = await Promise.race([childClosed, Promise.resolve(-1)]);
  if (boot.bootLine === null || earlyExit !== -1) {
    A(`PC-1: worker 子进程 boot 后存活（bootLine=${boot.bootLine}·exit=${earlyExit}·error=${boot.errorHead ?? 'n/a'}·stderr 尾 ${boot.stderrTail.slice(-400)}）`, false);
    await writeReceipt(
      { stormWindowMs: null, drainWindowMs: null, waves: [], stormBacklogSamples: [], throughputPerSec: null, errorRate: null, latency: { avgMs: null, maxMs: null, derivation: 'not reached' } },
      boot);
    console.log(`\nRC01-SUMMARY assertions=${assertCount} failed=${fail}`);
    await pool.end();
    process.exit(1);
  }

  let load: Pick<ReceiptShape, 'stormWindowMs' | 'drainWindowMs' | 'waves' | 'stormBacklogSamples' | 'throughputPerSec' | 'errorRate' | 'latency'>;
  try {
    load = await runLoadPhase(child, boot, cohortOwners, stormOwners);
  } catch (e) {
    console.error('✗ LOAD_PHASE_ERROR', (e as Error)?.message ?? e);
    fail += 1;
    load = { stormWindowMs: null, drainWindowMs: null, waves: [], stormBacklogSamples: [], throughputPerSec: null, errorRate: null, latency: { avgMs: null, maxMs: null, derivation: 'phase errored' } };
  }

  // 真 worker 子进程优雅收口（SIGTERM → drainWithDeadline → exit 0·main.ts :858-871 形）
  child.kill('SIGTERM');
  const graceful = await Promise.race([childClosed, sleep(35_000).then(() => -1)]);
  if (graceful === -1) child.kill('SIGKILL');
  A('PC-1: worker 子进程 SIGTERM 优雅退出（exit 0·drain 排空）', graceful === 0);

  await writeReceipt(load, boot);
  console.log(`\nRC01-SUMMARY assertions=${assertCount} failed=${fail}`);
  console.log(`${fail === 0
    ? '✓ NHP-LOAD-WORKER-SUITE-RC-01 PC+L1–L4 asserts passed · EXIT0 ≠ covered ≠ 伞行收口 ≠ worker 产能 · coveredCount=8 · capacityRepresentative=false · rcloadCapacityClaim=false'
    : `✗ ${fail} NHP-LOAD-WORKER-SUITE-RC-01 asserts failed → EXIT1 诚实保留（§8 停止条件上报 · Ban retry-to-green）`}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', (e as Error)?.message ?? e); void pool.end(); process.exit(1); });
