/**
 * UC-E2E-001 · PERF_api 分面执行收据 · NHP-001-PERF-api-01
 * (REQUEST ai-docs/delivery/harness/nhp-batch-c-REQUEST.md §1 Case 3 · 矩阵 §1.0.2 :146 + case-matrix :40
 *  已注册 case-only·零收据 → 本 case=执行收据补账 · 措辞 case-only 保留 · 收据入账)
 *
 * Method freeze (uc-e2e-018-perf-load.proof.ts 34ac7f90 + scripts/uc018-perf-load-capped-child.mjs c63259c0
 * 先例形 · 沿形不触其文件): nearest-rank · client hrtime · timeout 10s=error · warmup 10 excluded ·
 * 3 repeat runs all-must-pass · caps Docker --cpus=2 --memory=4g(NanoCpus=2e9/Memory=4GiB 具名入收据) ·
 * Ban post-hoc retune。
 *
 * Load shape (REQUEST §1 case 3 登记冻结): 主链 keyless HTTP 嘴序列
 *   POST /resume(文本唯一后缀防 dedup 混叠) → POST /quiz → POST /quiz/:id/begin → GET /quiz/:id →
 *   POST /diagnosis → POST /diagnosis/:id/begin — N=100 · concurrency=10 · 逐虚拟用户。
 * consent 前置=产品路径 POST /privacy/consent(purpose='resume_processing'·逐虚拟用户·FORCE RLS
 * per-principal·测量窗外执行不计入分位)非裸 INSERT 非豁免面。
 * 虚拟用户桶种子=夹具豁免具名(cf1e570b:323 先例形 · §5 枚举内本 case=桶种子 · 逐项申明入收据 ·
 * Ban 裸 INSERT 绕产品路径)。
 *
 * 期望(结构面 · 沿 NHP-018-PERF-01 同口径 PERF 五值): p50≤250ms · p95≤750ms · p99≤1500ms ·
 * max(观测值披露) · error_rate≤0.5% + 收据四件套(CMD+EXIT+负载参数冻结+.tmp/tracked 路径)。
 * EXIT=0 仅当全部 3 runs 五值达 threshold + caps enforced。
 *
 * 读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA(D3) · 零模型零 drain(begin 仅入队零 worker·job 滞队) ·
 * actualSpendCny=null · Ban 借本收据宣 verify:e2e-performance 族(:153)复绿或 NHP-PERF-API-SUITE
 * (case-matrix :133)闭合 — per-UC 实例喂伞不替代伞。
 *
 * wrapper 落位钉(REQUEST §1 case 3): 子进程 wrapper 不落 tracked scripts/ — 经 runner isolatedCommand
 * 运行时内联源生成·收据源与 caps evidence 落 .tmp/uc001-perf-api-receipts/(沿 uc018 收据 .tmp 先例)。
 *
 * Live-key isolation (uc025 bound-isolated R6 同形): this proof deletes MODEL_API_KEY and MODEL_BASE_URL
 * in-process FIRST, then asserts unset. Zero provider egress · est live=0.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · PERF_api blind→case-only(收据入账·措辞
 * case-only 保留) · EXIT0=case≠covered · ⛔push
 *
 *   pnpm uc001:nhp-perf-api:prove
 *   pnpm -C apps/api prove:uc001-nhp-perf-api   (raw; needs isolated env + caps child)
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { boot } from './_neg-harness';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const RAW_DIR = join(ROOT, '.tmp/uc001-perf-api-receipts');
const CAPS_PATH = join(RAW_DIR, '_caps-evidence.json');
const REQUEST_TIMEOUT_MS = 10_000;
const WARMUP = 10;
const REPEAT_RUNS = 3;
const PERF = { N: 100, c: 10, p50: 250, p95: 750, p99: 1500, errMax: 0.005 };

mkdirSync(RAW_DIR, { recursive: true });

const CMD = 'pnpm uc001:nhp-perf-api:prove';
const CASE_ID = 'NHP-001-PERF-api-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();

type Cls = 'PERF' | 'N' | 'ISO' | 'SEED';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) {
    failures.push({ cls, name });
    console.log(`FAIL  [${cls}] ${name}`);
  } else {
    console.log(`PASS  [${cls}] ${name}`);
  }
};

function gitSha(): string {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function loadCapsEvidence(): Record<string, unknown> {
  if (!existsSync(CAPS_PATH)) {
    return { enforced: false, blocker: 'caps_evidence_file_missing', detail: `expected ${CAPS_PATH} from capped child wrapper` };
  }
  try {
    return JSON.parse(readFileSync(CAPS_PATH, 'utf8')) as Record<string, unknown>;
  } catch (e) {
    return { enforced: false, blocker: 'caps_evidence_parse_failed', detail: String(e) };
  }
}

/** nearest-rank: p = sortedAsc[ceil(q·n) - 1] (1-indexed rank). */
function percentileNearestRank(sortedAsc: number[], q: number): number | null {
  if (sortedAsc.length === 0) return null;
  const rank = Math.ceil(q * sortedAsc.length);
  return sortedAsc[Math.min(Math.max(rank, 1), sortedAsc.length) - 1]!;
}

async function mapPool<T, R>(items: T[], concurrency: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!, i);
    }
  });
  await Promise.all(workers);
  return out;
}

async function main(): Promise<void> {
  console.log(`UC-E2E-001 ${CASE_ID} PERF_api 分面执行收据 (uc018 先例形 · nearest-rank · caps Docker 2cpu/4GiB)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零 drain · EXIT0=case≠covered · actualSpendCny=null');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green · 负载参数冻结 N=${PERF.N} c=${PERF.c} warmup=${WARMUP} runs=${REPEAT_RUNS}\n`);

  // R6 live-key isolation: shell strip list lacks MODEL_API_KEY → in-process self-delete pre-boot.
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  A('ISO', 'model-key-unset-in-process(self-deleted pre-boot · shell strip list lacks MODEL_API_KEY)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

  const caps = loadCapsEvidence();
  const capsEnforced = caps.enforced === true;
  if (!capsEnforced) console.log(`FAIL  caps not enforced: ${JSON.stringify(caps)}`);
  A('ISO', 'caps enforced(Docker NanoCpus=2e9/Memory=4GiB · wrapper HostConfig 亲证)', capsEnforced);

  const h = await boot();
  const pool = h.pool;
  A('ISO', 'model-key-still-unset-after-boot(no re-import regression)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);
  // 0121 真迁移链重放(夹具面·REVOKE+GRANT 幂等·真相=迁移链): harness sql/01 重建 app_role 会抹
  // pgp_sym_encrypt EXECUTE ACL — 逐虚拟用户 POST /resume 产品路径全链(blob 加密)行使所需。
  // 零产品码触·零新迁移。
  const mig0121 = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0121_resume_pgcrypto_runtime_acl.sql', import.meta.url)), 'utf8');
  await pool.query(mig0121);
  console.log('PIN   NHP-001-PERF-API-ISO-0121-REPLAY: harness 面迁移链重放(pgp ACL·真相=迁移链 migrate 全链)');
  const S = Date.now().toString(36).toUpperCase();
  const sha = gitSha();

  // ── 前置(测量窗外·不计入分位): 逐虚拟用户 consent(产品路径)+桶种子(夹具豁免①具名) ──
  const virtualUsers = (run: number): string[] =>
    Array.from({ length: PERF.N + WARMUP }, (_, i) => `nhp001p_${S}_r${run}u${i}`);
  const prepUser = async (principal: string) => {
    const c = await h.post('/privacy/consent', h.U(principal), { purpose: 'resume_processing' });
    if (c.status !== 200) throw new Error(`consent_failed:${principal}:${c.status}`);
    // 豁免①(§5 枚举具名·cf1e570b:323 先例形): 虚拟用户桶种子 — quiz 1.0 + diagnosis 1.0 预算。
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1, 'paid', 3.0, now() + interval '300 days')`,
      [principal],
    );
  };

  type Sample = { ok: boolean; timedOut: boolean; latencyMs: number; error?: string };
  const chain = async (principal: string): Promise<Sample> => {
    const t0 = process.hrtime.bigint();
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);
    const step = async (label: string, p: Promise<{ status: number; body: any }>, want: number) => {
      const r = await p;
      if (ac.signal.aborted) throw Object.assign(new Error('timeout'), { timedOut: true });
      if (r.status !== want) throw new Error(`${label}_http_${r.status}:${JSON.stringify(r.body).slice(0, 120)}`);
      return r;
    };
    try {
      const up = await step('resume', h.post('/resume', h.U(principal), {
        text: `NHP001 PERF golden-path resume ${principal} — senior backend engineer, Go/Kubernetes/Postgres, distributed systems ${Math.random().toString(36).slice(2)}`,
      }), 200);
      const resumeId = String(up.body?.resumeId ?? '');
      const qz = await step('quiz-create', h.post('/quiz', h.U(principal), {}), 200);
      const quizId = String(qz.body?.quizId ?? '');
      await step('quiz-begin', h.post(`/quiz/${quizId}/begin`, { ...h.U(principal), 'resume-id': resumeId }, {}), 202);
      await step('quiz-get', h.req('GET', `/quiz/${quizId}`, h.U(principal)), 200);
      const dg = await step('diagnosis-create', h.post('/diagnosis', h.U(principal), {}), 200);
      const diagnosisId = String(dg.body?.diagnosisId ?? '');
      await step('diagnosis-begin', h.post(`/diagnosis/${diagnosisId}/begin`, { ...h.U(principal), 'resume-id': resumeId }, {}), 202);
      clearTimeout(timer);
      return { ok: true, timedOut: false, latencyMs: Number(process.hrtime.bigint() - t0) / 1e6 };
    } catch (e: any) {
      clearTimeout(timer);
      const timedOut = e?.timedOut === true || ac.signal.aborted;
      return { ok: false, timedOut, latencyMs: Number(process.hrtime.bigint() - t0) / 1e6, error: timedOut ? 'timeout' : String(e?.message ?? e) };
    }
  };

  type RunStats = {
    run: number; N: number; c: number; warmup: number;
    latenciesMs: number[]; p50: number | null; p95: number | null; p99: number | null;
    maxMs: number | null; errorCount: number; timeoutCount: number; errorRate: number;
    passed: boolean; missReasons: string[]; start: string; end: string;
  };

  const runStats: RunStats[] = [];
  for (let run = 1; run <= REPEAT_RUNS; run++) {
    const start = new Date().toISOString();
    const users = virtualUsers(run);
    // 测量窗外: consent(产品路径逐虚拟用户)+桶种子(豁免①具名) — 不计入分位。
    await mapPool(users, PERF.c, prepUser);
    // 独立 warmup 用户(warmup 10 excluded): users 头 10 个先行行使·其样本不计入分位(uc018 warmup 形同构)。
    const warmupUsers = users.slice(0, WARMUP);
    const measuredUsers = users.slice(WARMUP);
    for (const u of warmupUsers) await chain(u);

    const samples = await mapPool(measuredUsers, PERF.c, (u) => chain(u));
    const latencies = samples.filter((s) => s.ok && s.latencyMs != null).map((s) => s.latencyMs).sort((a, b) => a - b);
    const errorCount = samples.filter((s) => !s.ok).length;
    const timeoutCount = samples.filter((s) => s.timedOut).length;
    const errorRate = errorCount / PERF.N;
    const p50 = percentileNearestRank(latencies, 0.5);
    const p95 = percentileNearestRank(latencies, 0.95);
    const p99 = percentileNearestRank(latencies, 0.99);
    const maxMs = latencies.length ? latencies[latencies.length - 1]! : null;
    const missReasons: string[] = [];
    if (p50 == null || p50 > PERF.p50) missReasons.push(`p50 ${p50} > ${PERF.p50}`);
    if (p95 == null || p95 > PERF.p95) missReasons.push(`p95 ${p95} > ${PERF.p95}`);
    if (p99 == null || p99 > PERF.p99) missReasons.push(`p99 ${p99} > ${PERF.p99}`);
    if (errorRate > PERF.errMax) missReasons.push(`error_rate ${errorRate} > ${PERF.errMax}`);
    const stat: RunStats = {
      run, N: PERF.N, c: PERF.c, warmup: WARMUP, latenciesMs: latencies,
      p50, p95, p99, maxMs, errorCount, timeoutCount, errorRate,
      passed: missReasons.length === 0, missReasons, start, end: new Date().toISOString(),
    };
    runStats.push(stat);
    console.log(`PERF_RUN  run=${run} N=${PERF.N} c=${PERF.c} p50=${p50?.toFixed(1)}ms p95=${p95?.toFixed(1)}ms p99=${p99?.toFixed(1)}ms max=${maxMs?.toFixed(1)}ms error_rate=${errorRate} timeout=${timeoutCount} passed=${stat.passed}${missReasons.length ? ` miss=${missReasons.join(';')}` : ''}`);
    if (errorCount > 0) {
      for (const s of samples) if (!s.ok) console.log(`PERF_ERROR_DETAIL  run=${run} ${s.error}`);
    }
  }

  // ── PERF 五值断言(3 runs all-must-pass·uc018 同口径) ──
  A('PERF', '全部 3 runs p50 ≤ 250ms', runStats.every((r) => r.p50 != null && r.p50 <= PERF.p50));
  A('PERF', '全部 3 runs p95 ≤ 750ms', runStats.every((r) => r.p95 != null && r.p95 <= PERF.p95));
  A('PERF', '全部 3 runs p99 ≤ 1500ms', runStats.every((r) => r.p99 != null && r.p99 <= PERF.p99));
  A('PERF', '全部 3 runs error_rate ≤ 0.5%', runStats.every((r) => r.errorRate <= PERF.errMax));
  A('PERF', 'PERF 五值收据齐(p50/p95/p99/max/error_rate 逐 run 在卷·零空值)',
    runStats.every((r) => r.p50 != null && r.p95 != null && r.p99 != null && r.maxMs != null && r.errorRate != null));

  // ── N: 零模型零 drain(零 worker·job 滞队) + 零消耗面静检 ──
  {
    const expectJobs = REPEAT_RUNS * (PERF.N + WARMUP);
    const qj = Number((await pool.query('SELECT count(*)::int AS n FROM quiz_job')).rows[0]?.n ?? 0);
    const dj = Number((await pool.query('SELECT count(*)::int AS n FROM diagnosis_job')).rows[0]?.n ?? 0);
    A('N', `job 滞队零 drain(quiz_job=${qj}+diagnosis_job=${dj} 恰 ${expectJobs}×2 · 零 worker 消费)`, qj === expectJobs && dj === expectJobs);
    const inv = Number((await pool.query('SELECT count(*)::int AS n FROM ai_model_invocation')).rows[0]?.n ?? 0);
    A('N', '零模型调用(ai_model_invocation 行 0 · keyless 主链零外呼)', inv === 0);
  }

  // ── 收据四件套(CMD+EXIT+负载参数冻结+.tmp 路径 · tracked=gate stdout log) ──
  const receipt = {
    caseId: CASE_ID,
    cmd: CMD,
    attemptStart: ATTEMPT_STARTED_AT,
    attemptEnd: new Date().toISOString(),
    gitSha: sha,
    loadParamsFrozen: { N: PERF.N, c: PERF.c, warmup: WARMUP, repeatRuns: REPEAT_RUNS, timeoutMs: REQUEST_TIMEOUT_MS, method: 'nearest-rank client-hrtime', percentiles: ['p50', 'p95', 'p99', 'max', 'error_rate'] },
    capsEvidencePath: CAPS_PATH,
    capsEnforced: capsEnforced,
    caps: caps,
    runs: runStats.map((r) => ({
      run: r.run, p50: r.p50, p95: r.p95, p99: r.p99, max: r.maxMs,
      errorRate: r.errorRate, errorCount: r.errorCount, timeoutCount: r.timeoutCount,
      passed: r.passed, missReasons: r.missReasons, start: r.start, end: r.end,
    })),
    thresholds: { p50: PERF.p50, p95: PERF.p95, p99: PERF.p99, errMax: PERF.errMax },
    rawReceiptPath: join(RAW_DIR, 'perf-receipt.json'),
    pins: 'haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · PG-retained · actualSpendCny=null · EXIT0=case≠covered',
  };
  const redact = (s: string) => s
    .replace(/postgres(ql)?:\/\/[^"'\s]+/gi, '[redacted-dsn]')
    .replace(/meetwise_dev_password/gi, '[redacted]');
  writeFileSync(join(RAW_DIR, 'perf-receipt.json'), `${redact(JSON.stringify(receipt, null, 2))}\n`);
  console.log(`RECEIPT  raw=${join(RAW_DIR, 'perf-receipt.json')} · caps=${CAPS_PATH} · tracked=ai-docs/delivery/receipts/nhp-001-perf-api-01/(gate stdout log·四件套内嵌)`);

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${CASE_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log(`PASS  ${CASE_ID}  PERF_api 分面执行收据 (N=${PERF.N} c=${PERF.c} runs=${REPEAT_RUNS} · caps enforced)`);
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + capped child(2cpu/4GiB) + real PG · consent 产品路径逐虚拟用户(测量窗外) · 豁免=桶种子具名 · 零模型零 drain');
  }
  console.log('ROW_STILL_GAP  UC-E2E-001 PERF_api blind→case-only 措辞(收据入账·case-only 保留). PERF_web/LOAD_w 留后刀. coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban 借本收据宣 verify:e2e-performance 族复绿/NHP-PERF-API-SUITE 闭合(实例≠伞) · post dual still required · actualSpendCny=null');
  console.log(`\nCMD=${CMD} EXIT=${exit}`);
  process.exit(exit);
}

main().catch((e: unknown) => {
  console.error(e);
  console.log(`\nGAP  ${CASE_ID}  harness/runtime failure: ${e instanceof Error ? e.message : String(e)}`);
  console.log(`ATTEMPT_END  iso=${new Date().toISOString()} EXIT=1 (crash)`);
  console.log(`\nCMD=${CMD} EXIT=1`);
  process.exit(1);
});
