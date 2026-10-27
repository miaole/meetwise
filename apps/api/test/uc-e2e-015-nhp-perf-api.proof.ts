/**
 * UC-E2E-015 · PERF_api 分面执行收据 · NHP-015-PERF-api-01
 * (REQUEST ai-docs/delivery/harness/perf2-REQUEST.md §1.4 Case 2 · 矩阵 §1.0.2 :151 + case-matrix §1.3 015 区
 *  blind 格 additive 收据补账 · 格值 blind 保持 · EXIT0=case≠covered · 「413 单点≠负载」读法原句保留)
 *
 * 世界钉(REQUEST §0.3 rev r1 协调方裁决): boot 世界维持(#157 三先例形·runner pre-migrate 名单零注册
 * ·:4164-4168 承登注记同族) —— 本 proof 取 boot() 形沿 uc-e2e-001-nhp-perf-api.proof.ts 977e0d01
 * 先例同构(沿形不触其文件)。
 *
 * Method freeze (uc018 34ac7f90 + uc001 先例形): nearest-rank · client hrtime · timeout 10s=error
 * (硬顶 rev r2: proof-local fetch 直入 AbortSignal(`signal: ac.signal`)+wrapper 级 wall-cap race
 * 兜底 —— _neg-harness post/send/req 无 signal 形参不可达 (a)·uc001 :160-167 `aborted` 检于 `await`
 * 后的悬挂缝不复发·P2-2) · warmup 10 excluded(预热样本不计入分位·uc001 :7/:202-205 先例嘴逐字) ·
 * 3 repeat runs all-must-pass · caps Docker 双容器 2cpu/4GiB(NanoCpus=2e9/Memory=4GiB·HostConfig
 * inspect 亲证入收据) · Ban post-hoc retune。
 *
 * Load shape (REQUEST §1.4 Case 2 登记冻结): 主链 keyless HTTP 嘴序列
 *   POST /resume(文本唯一后缀防 dedup 混叠·text≥20 契约) → POST /quiz(200 quizId) →
 *   POST /quiz/:id/begin(resume-id header·202 accepted) → GET /quiz/:id(200 created 态可读) —
 *   N=100 · concurrency=10 · 逐虚拟用户。
 * consent 前置=产品路径 POST /privacy/consent(purpose='resume_processing'·逐虚拟用户·测量窗外执行
 * 不计入分位)非裸 INSERT 非豁免面(uc001 :14-15/:146-148 先例形同构)。门语义如实注记(rev r1):
 * consent 门=resume.service.ts :213 `SELECT 1 FROM consent_record WHERE purpose='resume_processing'
 * LIMIT 1` —— purpose 全局存在性谓词·无 principal/owner 限定 → 收据措辞 Ban 申明「consent per-user
 * 隔离/逐用户门」——门为全局谓词·隔离义零申明·如实照机制记。
 * 虚拟用户桶种子=夹具豁免具名(uc001 :149-154 豁免①先例形·entitlement_bucket kind='paid' 3.0·
 * quiz begin 预留 1.0 所需·逐项申明入收据·Ban 裸 INSERT 绕产品路径=仅限窗外 prep 面)。
 * 0121 真迁移链重放(harness 面·uc001 :134-137 同形): 逐虚拟用户 POST /resume 产品路径全链(blob
 * 加密)行使所需·零产品码触零新迁移。
 *
 * 期望(结构面 · PERF 五值同口径): p50≤250ms · p95≤750ms · p99≤1500ms · max(观测值披露) ·
 * error_rate≤0.5% + 收据四件套(CMD+EXIT+负载参数冻结+.tmp/tracked 路径)。
 * EXIT=0 仅当全部 3 runs 五值达 threshold + caps enforced。
 *
 * 零 drain 断言(rev r1 措辞对齐机制): quiz_job `status='queued'` 限定 count 恰数承载零 drain
 * (bare count 先例形 uc001 :244-246 如实对照不承载滞队义 —— begin 仅入队零 worker 消费→零 drain
 * 恒等式=queued 限定 count 恰数·非全表行数) + 残留 worker `docker ps` 披露臂(隔离壳内零 worker
 * 容器在跑·inspect 输出入收据·披露臂非断言臂) + ai_model_invocation=0 零模型硬检。
 *
 * 读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零 drain · actualSpendCny=null ·
 * Ban 借本收据宣 PERF SLO/生产容量/HA/线上 SLO/NHP-PERF-API-SUITE 闭合(实例≠伞) ·
 * Ban 借本收据冒充 NHP-015-LOAD-w-01 收据(红停归排期·PERF_api≠LOAD_worker 两形状互不替代) ·
 * Ban 借本收据冒充 NHP-015-BOUND 413 单点面收据(读法原句保留) · Ban 与 NHP-015-ADV/F1–F5 收据互洗。
 *
 * wrapper 落位钉(REQUEST §1.4 Case 2): 子进程 wrapper 不落 tracked scripts/ — 经 runner
 * isolatedCommand 运行时内联源生成·收据源与 caps evidence 落 .tmp/uc015-perf-api-receipts/
 * (沿 uc018/uc001 收据 .tmp 先例)。
 *
 * Live-key isolation (uc001 :120-123 R6 同形): this proof deletes MODEL_API_KEY and
 * MODEL_BASE_URL in-process FIRST, then asserts unset. Zero provider egress · est live=0.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · PERF_api blind→case-only(收据入账·
 * 措辞 case-only 保留) · EXIT0=case≠covered · ⛔push
 *
 *   pnpm uc015:nhp-perf-api:prove
 *   pnpm -C apps/api prove:uc015-nhp-perf-api   (raw; needs isolated env + caps child)
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { boot } from './_neg-harness';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const RAW_DIR = join(ROOT, '.tmp/uc015-perf-api-receipts');
const CAPS_PATH = join(RAW_DIR, '_caps-evidence.json');
const REQUEST_TIMEOUT_MS = 10_000;
const WARMUP = 10;
const REPEAT_RUNS = 3;
// 零 lint 增量形(rev r2): 线格式键名(N/x-user-id/content-type/resume-id 等)经 computed-key/常量承载·
// JSON/HTTP 字节恒等。
const PERF = { n: 100, c: 10, p50: 250, p95: 750, p99: 1500, errMax: 0.005 };
const CONTENT_TYPE_HEADER = 'content-type';
const RESUME_ID_HEADER = 'resume-id';
const N_KEY = 'N';
const C_KEY = 'c';

mkdirSync(RAW_DIR, { recursive: true });

const CMD = 'pnpm uc015:nhp-perf-api:prove';
const CASE_ID = 'NHP-015-PERF-api-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();

type Cls = 'PERF' | 'N' | 'ISO';
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

type Json = Record<string, unknown>;
type HttpResult = { status: number; body: Json };

const bodyStr = (b: Json, k: string): string => String(b?.[k] ?? '');

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

/** 残留 worker `docker ps` 披露臂(非断言臂): 隔离壳内零 worker 容器在跑的观察证据·输出入收据。 */
function dockerPsWorkerDisclosure(): { ok: boolean; detail: string } {
  try {
    const raw = execSync('docker ps --format json', { encoding: 'utf8', timeout: 15_000 });
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    let workerLike: string[] = [];
    try { workerLike = lines.filter((l) => /worker/i.test(l)); } catch { /* keep empty */ }
    return { ok: true, detail: JSON.stringify({ containers: lines, workerLike }) };
  } catch (e) {
    const err = e as { message?: string };
    return { ok: true, detail: JSON.stringify({ error: String(err?.message ?? e) }) };
  }
}

async function main(): Promise<void> {
  console.log(`UC-E2E-015 ${CASE_ID} PERF_api 分面执行收据 (boot 世界·uc001 先例形·nearest-rank · caps Docker 2cpu/4GiB)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零 drain · EXIT0=case≠covered · actualSpendCny=null');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green · 负载参数冻结 N=${PERF.n} c=${PERF.c} warmup=${WARMUP}(excluded) runs=${REPEAT_RUNS}\n`);

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
  // 零产品码触·零新迁移。(uc001 :134-139 同形)
  const mig0121 = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0121_resume_pgcrypto_runtime_acl.sql', import.meta.url)), 'utf8');
  await pool.query(mig0121);
  console.log('PIN   NHP-015-PERF-API-ISO-0121-REPLAY: harness 面迁移链重放(pgp ACL·真相=迁移链 migrate 全链)');
  const S = Date.now().toString(36).toUpperCase();
  const sha = gitSha();

  // ── 前置(测量窗外·不计入分位): 逐虚拟用户 consent(产品路径)+桶种子(夹具豁免①具名) ──
  const virtualUsers = (run: number): string[] =>
    Array.from({ length: PERF.n + WARMUP }, (_, i) => `nhp015p_${S}_r${run}u${i}`);
  const prepUser = async (principal: string) => {
    const c = await h.post('/privacy/consent', h.U(principal), { purpose: 'resume_processing' });
    if (c.status !== 200) throw new Error(`consent_failed:${principal}:${c.status}`);
    // 豁免①(§5 枚举具名·uc001 :149-154 先例形): 虚拟用户桶种子 — quiz begin 预留 1.0 所需。
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1, 'paid', 3.0, now() + interval '300 days')`,
      [principal],
    );
  };

  type Sample = { ok: boolean; timedOut: boolean; latencyMs: number; error?: string };
  // timeout 10s 硬顶(rev r2): proof-local fetch 直入 AbortSignal(`signal` 直入 fetch init)+
  // wall-cap race 兜底 —— _neg-harness post/send/req 无 signal 形参不可达 (a)·uc001 :160-167
  // `aborted` 检于 `await` 后的悬挂缝不复发。
  const chain = async (principal: string): Promise<Sample> => {
    const t0 = process.hrtime.bigint();
    const ac = new AbortController();
    const deadline = Date.now() + REQUEST_TIMEOUT_MS;
    const wallTimer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);
    const call = async (method: string, path: string, headers: Record<string, string>, body?: Json): Promise<HttpResult> => {
      const p = fetch(`${h.base}${path}`, {
        method,
        headers: body !== undefined ? { ...headers, [CONTENT_TYPE_HEADER]: 'application/json' } : headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: ac.signal,
      });
      const wall = new Promise<never>((_, rej) =>
        setTimeout(() => rej(Object.assign(new Error('timeout_wall_cap'), { timedOut: true })), Math.max(deadline - Date.now(), 0)));
      const res = await Promise.race([p, wall]);
      return { status: res.status, body: (await res.json().catch(() => ({}))) as Json };
    };
    try {
      const up = await call('POST', '/resume', h.U(principal), {
        text: `NHP015 PERF golden-path resume ${principal} — senior backend engineer, Go/Kubernetes/Postgres, distributed systems ${Math.random().toString(36).slice(2)}`,
      });
      if (up.status !== 200) throw new Error(`resume_http_${up.status}:${JSON.stringify(up.body).slice(0, 120)}`);
      const resumeId = bodyStr(up.body, 'resumeId');
      const qz = await call('POST', '/quiz', h.U(principal), {});
      if (qz.status !== 200) throw new Error(`quiz_create_http_${qz.status}:${JSON.stringify(qz.body).slice(0, 120)}`);
      const quizId = bodyStr(qz.body, 'quizId');
      const bg = await call('POST', `/quiz/${quizId}/begin`, { ...h.U(principal), [RESUME_ID_HEADER]: resumeId }, {});
      if (bg.status !== 202) throw new Error(`quiz_begin_http_${bg.status}:${JSON.stringify(bg.body).slice(0, 120)}`);
      const gt = await call('GET', `/quiz/${quizId}`, h.U(principal));
      if (gt.status !== 200) throw new Error(`quiz_get_http_${gt.status}:${JSON.stringify(gt.body).slice(0, 120)}`);
      clearTimeout(wallTimer);
      return { ok: true, timedOut: false, latencyMs: Number(process.hrtime.bigint() - t0) / 1e6 };
    } catch (e) {
      clearTimeout(wallTimer);
      const err = e as { timedOut?: boolean; message?: string };
      const timedOut = err?.timedOut === true || ac.signal.aborted;
      return { ok: false, timedOut, latencyMs: Number(process.hrtime.bigint() - t0) / 1e6, error: timedOut ? 'timeout' : String(err?.message ?? e) };
    }
  };

  type RunStats = {
    run: number; n: number; c: number; warmup: number;
    p50: number | null; p95: number | null; p99: number | null;
    maxMs: number | null; errorCount: number; timeoutCount: number; errorRate: number;
    passed: boolean; missReasons: string[]; start: string; end: string;
  };

  const runStats: RunStats[] = [];
  for (let run = 1; run <= REPEAT_RUNS; run++) {
    const start = new Date().toISOString();
    const users = virtualUsers(run);
    // 测量窗外: consent(产品路径逐虚拟用户)+桶种子(豁免①具名) — 不计入分位。
    await mapPool(users, PERF.c, prepUser);
    // 独立 warmup 用户(warmup 10 excluded): users 头 10 个先行行使·其样本不计入分位(uc001 :202-205 同构)。
    const warmupUsers = users.slice(0, WARMUP);
    const measuredUsers = users.slice(WARMUP);
    for (const u of warmupUsers) await chain(u);

    const samples = await mapPool(measuredUsers, PERF.c, (u) => chain(u));
    const latencies = samples.filter((s) => s.ok && s.latencyMs != null).map((s) => s.latencyMs).sort((a, b) => a - b);
    const errorCount = samples.filter((s) => !s.ok).length;
    const timeoutCount = samples.filter((s) => s.timedOut).length;
    const errorRate = errorCount / PERF.n;
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
      run, n: PERF.n, c: PERF.c, warmup: WARMUP,
      p50, p95, p99, maxMs, errorCount, timeoutCount, errorRate,
      passed: missReasons.length === 0, missReasons, start, end: new Date().toISOString(),
    };
    runStats.push(stat);
    console.log(`PERF_RUN  run=${run} N=${PERF.n} c=${PERF.c} p50=${p50?.toFixed(1)}ms p95=${p95?.toFixed(1)}ms p99=${p99?.toFixed(1)}ms max=${maxMs?.toFixed(1)}ms error_rate=${errorRate} timeout=${timeoutCount} passed=${stat.passed}${missReasons.length ? ` miss=${missReasons.join(';')}` : ''}`);
    if (errorCount > 0) {
      for (const s of samples) if (!s.ok) console.log(`PERF_ERROR_DETAIL  run=${run} ${s.error}`);
    }
  }

  // ── PERF 五值断言(3 runs all-must-pass·uc018/uc001 同口径) ──
  A('PERF', '全部 3 runs p50 ≤ 250ms', runStats.every((r) => r.p50 != null && r.p50 <= PERF.p50));
  A('PERF', '全部 3 runs p95 ≤ 750ms', runStats.every((r) => r.p95 != null && r.p95 <= PERF.p95));
  A('PERF', '全部 3 runs p99 ≤ 1500ms', runStats.every((r) => r.p99 != null && r.p99 <= PERF.p99));
  A('PERF', '全部 3 runs error_rate ≤ 0.5%', runStats.every((r) => r.errorRate <= PERF.errMax));
  A('PERF', 'PERF 五值收据齐(p50/p95/p99/max/error_rate 逐 run 在卷·零空值)',
    runStats.every((r) => r.p50 != null && r.p95 != null && r.p99 != null && r.maxMs != null && r.errorRate != null));

  // ── N: 零 drain(rev r1·quiz_job status='queued' 限定 count 恰数)+ 零消耗面静检 ──
  {
    const expectJobs = REPEAT_RUNS * (PERF.n + WARMUP);
    const qjQueued = Number((await pool.query(`SELECT count(*)::int AS n FROM quiz_job WHERE status='queued'`)).rows[0]?.n ?? 0);
    const qjAll = Number((await pool.query('SELECT count(*)::int AS n FROM quiz_job')).rows[0]?.n ?? 0);
    A('N', `quiz_job 滞队零 drain(status='queued' 限定 count=${qjQueued} 恰 ${expectJobs}·全表 ${qjAll}·begin 仅入队零 worker 消费)`, qjQueued === expectJobs && qjAll === qjQueued);
    const inv = Number((await pool.query('SELECT count(*)::int AS n FROM ai_model_invocation')).rows[0]?.n ?? 0);
    A('N', '零模型调用(ai_model_invocation 行 0 · keyless 主链零外呼)', inv === 0);
  }

  // ── 残留 worker `docker ps` 披露臂(非断言臂·隔离壳内零 worker 容器在跑观察证据入收据) ──
  const workerDisclosure = dockerPsWorkerDisclosure();
  console.log(`WORKER_DISCLOSURE  ${workerDisclosure.detail}`);

  // ── 收据四件套(CMD+EXIT+负载参数冻结+.tmp 路径 · tracked=gate stdout log) ──
  const receipt = {
    caseId: CASE_ID,
    cmd: CMD,
    attemptStart: ATTEMPT_STARTED_AT,
    attemptEnd: new Date().toISOString(),
    gitSha: sha,
    world: 'boot(#157 三先例形·runner pre-migrate 名单零注册·:4164-4168 承登注记同族)',
    consentSemantics: 'resume.service.ts :213 purpose 全局存在性谓词·无 principal/owner 限定·收据零申明 per-user 隔离(rev r1 OBS)',
    loadParamsFrozen: { [N_KEY]: PERF.n, [C_KEY]: PERF.c, warmup: WARMUP, warmupExcluded: true, repeatRuns: REPEAT_RUNS, timeoutMs: REQUEST_TIMEOUT_MS, method: 'nearest-rank client-hrtime', percentiles: ['p50', 'p95', 'p99', 'max', 'error_rate'], timeoutHardCap: 'AbortSignal-into-fetch + wall-cap race(rev r2·harness 无 signal 形参·uc001 :160-167 缝不复发)' },
    capsEvidencePath: CAPS_PATH,
    capsEnforced: capsEnforced,
    caps: caps,
    workerDisclosure: workerDisclosure.detail,
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
  console.log(`RECEIPT  raw=${join(RAW_DIR, 'perf-receipt.json')} · caps=${CAPS_PATH} · tracked=ai-docs/delivery/receipts/nhp-004-015-perf-api/(gate stdout log·四件套内嵌)`);

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${CASE_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log(`PASS  ${CASE_ID}  PERF_api 分面执行收据 (N=${PERF.n} c=${PERF.c} runs=${REPEAT_RUNS} · caps enforced)`);
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + capped child(2cpu/4GiB) + real PG · consent 产品路径逐虚拟用户(测量窗外) · 豁免=桶种子具名 · 0121 重放 · 零模型零 drain(queued 限定)');
  }
  console.log('ROW_STILL_GAP  UC-E2E-015 PERF_api blind→case-only 措辞(收据入账·case-only 保留·格值 blind 零翻·「413 单点≠负载」读法原句保留). LOAD_w 红停归排期·两形状互不替代. coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban 借本收据宣 PERF SLO/生产容量/HA/NHP-PERF-API-SUITE 闭合(实例≠伞)/NHP-015-LOAD-w-01 收据/NHP-015-BOUND 413 单点面 · Ban 与 NHP-015-ADV/F1–F5 收据互洗 · post dual still required · actualSpendCny=null');
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
