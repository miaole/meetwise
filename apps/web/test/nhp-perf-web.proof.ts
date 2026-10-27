/**
 * UC-E2E-001 · PERF_web 分面执行收据 · NHP-001-PERF-web-01
 * (REQUEST ai-docs/delivery/harness/perfweb-REQUEST.md §1 终形 · 矩阵 §1.0.2 :146 + case-matrix :41
 *  已注册 case-only/blind → 本 case=执行收据补账 · 措辞 case-only 保留 · 收据入账 · 零产品码触)
 *
 * Method freeze (apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts 977e0d01 先例形 · 沿形不触其文件):
 * nearest-rank · host wall-clock Date.now(stream-window.spec.ts:29 同源计时臂) · timeout 10s/sample=error ·
 * warmup 10 excluded · 3 repeat runs all-must-pass · caps 三容器 Docker --cpus=2 --memory=4g
 * (PG runner 面 + api/web capped child 面 · NanoCpus=2e9/Memory=4GiB HostConfig inspect 亲证入收据) ·
 * Ban post-hoc retune。
 *
 * Load shape (REQUEST §1 登记冻结): 专用 proof 自启栈(隔离真 PG + api keyless boot + web production
 * next build/start(E2E_UI_STRESS='1' 构建期内联) + Playwright headless chromium) · 主链嘴=真 signup
 * (/login 注册 → user_account 落隔离 PG → dashboard)→ /interview/__e2e_stream_stress__?duplicateFrames=1
 * 同源 SSE(events 路由 STRESS 分支 :103 构建期内联门 · 持正常 httpOnly 会话 · hermetic 合成源零上游
 * fetch 零模型) · N=100 · c=1 串行(playwright.config.ts:14-17 在树明钉「浏览器并发冒充压测」之禁——
 * 串行非降格 · API 侧并发已由 PERF_api 收据另证) · runs=3 · warmup 10 excluded。
 *
 * 端到端延迟口径(登记冻结): page.goto(stress URL) 起 → 终态视图(练习完成)可见止 · 注册/dashboard 导航
 * =测量窗外 prep 不计分位。per-sample 功能断言(唯一 80 轮窗+题面全唯一+终态可见)all-pass。
 *
 * 期望(web 实情定标 · 值源在树亲证·Ban 硬造): p50 ≤ 15_000ms · p95 ≤ 15_000ms · p99 ≤ 15_000ms
 * (值源=stream-window.spec.ts:29 在树唯一 web 面延迟预算 · 同值第二锚=:20 显式 timeout: 15_000 ·
 * 逐字承其「deliberately broad ceiling…not a device or production SLO」读法) · max=观测值披露(不设阈) ·
 * error_rate ≤ 0.5%。读法钉: timeout 10s/sample=error + error_rate ≤ 0.5% 零容忍 → 有效样本上限=10s ·
 * 计分样本域内 p99 恒 ≤10s · 15s 阈非约束面仅回归守卫名义上限(分位读法不宣 10-15s 区间分辨力)。
 * 本收据=回归守卫预算(O(n²) 退化捕获) ≠ 线上 SLO ≠ 真机容量 ≠ HA。
 *
 * D-BUILD 披露(钉): 量测构建携 __E2E_UI_STRESS__='1' build 期内联(e2e-guard-only STRESS 源内联·
 * next.config.mjs compiler.define) ≠ 洁净生产 bundle(生产构建该分支死码剔除 events/route.ts:19-23) ·
 * next build 耗时在测量窗外(prep 段) · Ban 宣称「洁净生产包量测」。
 * Chromium 披露(钉): Chromium 宿主驱动进程不封顶(单机 headless 单实例 · c=1 串行) · 单机 ≠ 真机容量
 * (case-matrix :147 NHP-PERF-WEB-SUITE 伞行禁令保留 · 伞行零翻 · per-UC 实例≠伞)。
 * Pixel 5 P-OBS 披露臂(登记限幅 N=20): 功能断言+五值观测值入收据 · Ban 当预算判据。
 *
 * Live-key isolation (uc001 PERF_api R6 同形): this proof deletes MODEL_API_KEY and MODEL_BASE_URL
 * in-process FIRST, then asserts unset. Zero provider egress · est live=0 · actualSpendCny=null。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · PERF_web blind/case-only 保留(收据入账) ·
 * EXIT0=case≠covered · ⛔push
 *
 *   pnpm uc001:nhp-perf-web:prove
 *   pnpm -C apps/web prove:nhp-perf-web   (raw; needs isolated env + 三容器 caps child)
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { chromium, devices } from '@playwright/test';
import type { Browser, BrowserContext, Page } from '@playwright/test';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const RAW_DIR = join(ROOT, '.tmp/uc001-perf-web-receipts');
const CAPS_PATH = join(RAW_DIR, '_caps-evidence.json');
const SAMPLE_TIMEOUT_MS = 10_000;
const WARMUP = 10;
const REPEAT_RUNS = 3;
const PIXEL_OBS_N = 20;
const PERF = { N: 100, c: 1, p50: 15_000, p95: 15_000, p99: 15_000, errMax: 0.005 };
const STRESS_PATH = '/interview/__e2e_stream_stress__?duplicateFrames=1';
const WEB_BASE = String(process.env.PERF_WEB_WEB_BASE ?? '').replace(/\/$/, '');
const WINDOW_TEXT = '显示第 9921–10000 轮 / 共 10000 轮';
const TERMINAL_RE = /练习完成 · 本次练习反馈/;

mkdirSync(RAW_DIR, { recursive: true });

const CMD = 'pnpm uc001:nhp-perf-web:prove';
const CASE_ID = 'NHP-001-PERF-web-01';
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
    return { enforced: false, blocker: 'caps_evidence_file_missing', detail: `expected ${CAPS_PATH} from 三容器 caps child wrapper` };
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

/** signup 主链嘴 prep(测量窗外·逐虚拟用户唯一邮箱·user_account 落隔离 PG)。
 *  准入节律(披露): api 全局 signup 桶 (60,1/s) 系在树硬编码防滥用面(auth.service.ts:46·非 env 缝)——
 *  负载发生器按 1.05s/signup 节律行使(≤1/s 持续 refill·测量窗外 prep 段·c=1 串行不变·负载冻结五参不动)·
 *  撞桶(still-on-login)≤2 次有界重试(同 email·per-email 桶 (3,0.02) 容许)·仍败=sample error 不迁就。 */
async function signup(page: Page, email: string, t: Record<string, number>): Promise<void> {
  let m = Date.now();
  await page.goto(`${WEB_BASE}/login`);
  t.gotoLogin = Date.now() - m;
  for (let attempt = 0; ; attempt++) {
    m = Date.now();
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'strongpw123');
    t.fill = (t.fill ?? 0) + Date.now() - m;
    m = Date.now();
    await page.getByRole('button', { name: /注册|Sign up/i }).click();
    t.clickSignup = (t.clickSignup ?? 0) + Date.now() - m;
    m = Date.now();
    try {
      await page.waitForURL('**/dashboard', { timeout: attempt === 0 ? SAMPLE_TIMEOUT_MS - 6_000 : 3_000 });
      t.waitDashboard = (t.waitDashboard ?? 0) + Date.now() - m;
      return;
    } catch (e: unknown) {
      t.waitDashboard = (t.waitDashboard ?? 0) + Date.now() - m;
      if (attempt >= 2 || !page.url().includes('/login')) throw e;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

type Sample = { ok: boolean; timedOut: boolean; latencyMs: number; error?: string; phases?: Record<string, number>; urlAtError?: string };

/** per-sample 主体: goto(stress URL) → 终态可见 elapsed(登记口径) + 功能断言 all-pass。
 *  内部所有 wait 上限 ≤ SAMPLE_TIMEOUT_MS-1_000（race 反证：sample promise 恒先于 10s race 沉淀·
 *  context.close() 恒在下一 sample 开始前完成——零 zombie context 串扰）。 */
async function measureSample(context: BrowserContext, email: string): Promise<Sample> {
  const page = await context.newPage();
  page.setDefaultTimeout(SAMPLE_TIMEOUT_MS - 1_000);
  const t: Record<string, number> = {};
  try {
    let m = Date.now();
    await signup(page, email, t); // 测量窗外 prep
    t.signup = Date.now() - m;
    m = Date.now();
    const t0 = Date.now();
    await page.goto(`${WEB_BASE}${STRESS_PATH}`);
    t.gotoStress = Date.now() - m;
    m = Date.now();
    await page.getByText(TERMINAL_RE).waitFor({ state: 'visible' });
    t.waitTerminal = Date.now() - m;
    const latencyMs = Date.now() - t0;
    // 功能断言(样本域内·唯一 80 轮窗+题面全唯一+终态可见·stream-window.spec :19-26 同面):
    m = Date.now();
    const win = page.getByTestId('history-window');
    await win.getByText(WINDOW_TEXT).waitFor({ state: 'visible' });
    const turns = page.getByTestId('interview-turn');
    const count = await turns.count();
    if (count !== 80) throw new Error(`window_turn_count_${count}_ne_80`);
    const questions = await turns.evaluateAll((nodes) => nodes.map((node) => node.textContent?.match(/压力回放题 \d+/)?.[0] ?? ''));
    if (questions.length !== 80) throw new Error(`question_count_${questions.length}_ne_80`);
    if (new Set(questions).size !== 80) throw new Error('questions_not_unique');
    const expected = Array.from({ length: 80 }, (_, i) => `压力回放题 ${9921 + i}`);
    if (JSON.stringify(questions) !== JSON.stringify(expected)) throw new Error('questions_not_exact_9921_10000');
    t.window = Date.now() - m;
    return { ok: true, timedOut: false, latencyMs, phases: t };
  } catch (e: unknown) {
    const message = String(e instanceof Error ? e.message : e);
    const timedOut = /sample_timeout|Timeout.*exceeded/i.test(message);
    return { ok: false, timedOut, latencyMs: Number.NaN, error: message.slice(0, 200), phases: t, urlAtError: page.url() };
  } finally {
    await context.close().catch(() => {});
  }
}

/** 单 sample 10s 墙钟 race(timeout=error · REQUEST 读法钉有效样本上限 10s)。 */
function withSampleTimeout(p: Promise<Sample>): Promise<Sample> {
  return Promise.race([
    p,
    new Promise<Sample>((resolve) => {
      const t = setTimeout(() => resolve({ ok: false, timedOut: true, latencyMs: Number.NaN, error: 'sample_timeout_10s' }), SAMPLE_TIMEOUT_MS);
      t.unref?.();
    }),
  ]);
}

type RunStats = {
  surface: string; run: number; N: number; c: number; warmup: number;
  latenciesMs: number[]; p50: number | null; p95: number | null; p99: number | null;
  maxMs: number | null; errorCount: number; timeoutCount: number; errorRate: number;
  passed: boolean; missReasons: string[]; start: string; end: string;
};

async function runSurface(
  label: string,
  browser: Browser,
  deviceDescriptor: Record<string, unknown> | null,
  run: number,
  applyBudget: boolean,
  n = PERF.N,
  warmup = WARMUP,
): Promise<RunStats> {
  const start = new Date().toISOString();
  const S = Date.now().toString(36).toUpperCase();
  const users = Array.from({ length: n + warmup }, (_, i) => `nhp001pw_${S}_r${run}u${i}@perf-web.test`);
  const samples: Sample[] = [];
  const SIGNUP_PACING_MS = 1_050; // api signup:global 桶 (60,1/s) 持续 refill 界·测量窗外 prep 节律(披露入收据)
  const signupSlot0 = Date.now();
  for (let i = 0; i < users.length; i++) {
    const slotDue = signupSlot0 + i * SIGNUP_PACING_MS;
    if (Date.now() < slotDue) await new Promise((r) => setTimeout(r, slotDue - Date.now()));
    // c=1 串行(登记冻结·config :14-17 在树钉) · 逐 sample 独立 context(cookie 隔离)。
    // 串行钉: race 超时臂强杀 context(sample promise 未沉淀时)→ 恒在下一 sample 开始前完成清理——
    // 零 zombie context 串扰(前 sample 挂起页/EventSource 不泄漏进后 sample 计量域)。
    const context = await browser.newContext(deviceDescriptor ? { ...deviceDescriptor } : {});
    let settled = false;
    const p = measureSample(context, users[i]!).then((s) => { settled = true; return s; });
    const sample = await withSampleTimeout(p);
    if (!settled) await context.close().catch(() => {});
    samples.push(sample);
    if (!sample.ok) console.log(`PERF_ERROR_DETAIL  ${label} run=${run} i=${i} url=${sample.urlAtError ?? 'n/a'} phases=${JSON.stringify(sample.phases ?? {})} ${sample.error}`);
  }
  const measured = samples.slice(warmup);
  const latencies = measured.filter((s) => s.ok && Number.isFinite(s.latencyMs)).map((s) => s.latencyMs).sort((a, b) => a - b);
  const errorCount = measured.filter((s) => !s.ok).length;
  const timeoutCount = measured.filter((s) => s.timedOut).length;
  const errorRate = errorCount / n;
  const p50 = percentileNearestRank(latencies, 0.5);
  const p95 = percentileNearestRank(latencies, 0.95);
  const p99 = percentileNearestRank(latencies, 0.99);
  const maxMs = latencies.length ? latencies[latencies.length - 1]! : null;
  const missReasons: string[] = [];
  if (applyBudget) {
    if (p50 == null || p50 > PERF.p50) missReasons.push(`p50 ${p50} > ${PERF.p50}`);
    if (p95 == null || p95 > PERF.p95) missReasons.push(`p95 ${p95} > ${PERF.p95}`);
    if (p99 == null || p99 > PERF.p99) missReasons.push(`p99 ${p99} > ${PERF.p99}`);
    if (errorRate > PERF.errMax) missReasons.push(`error_rate ${errorRate} > ${PERF.errMax}`);
  }
  return {
    surface: label, run, N: n, c: PERF.c, warmup, latenciesMs: latencies,
    p50, p95, p99, maxMs, errorCount, timeoutCount, errorRate,
    passed: missReasons.length === 0, missReasons, start, end: new Date().toISOString(),
  };
}

async function main(): Promise<void> {
  console.log(`UC-E2E-001 ${CASE_ID} PERF_web 分面执行收据 (uc001 PERF_api 先例形 · nearest-rank · caps 三容器 2cpu/4GiB)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('读法钉: 回归守卫预算 ≠ 线上 SLO ≠ 真机容量 ≠ HA · 零模型零上游 fetch(STRESS 源 hermetic) · EXIT0=case≠covered · actualSpendCny=null');
  console.log(`D_BUILD_DISCLOSURE 量测构建携 __E2E_UI_STRESS__='1' build 期内联(e2e-guard-only 源) ≠ 洁净生产 bundle · next build 耗时在测量窗外(prep 段)`);
  console.log(`CHROMIUM_HOST_DISCLOSURE Chromium 宿主驱动进程不封顶(单机 headless 单实例) · 单机 ≠ 真机容量`);
  console.log(`PREP_DISCLOSURE signup prep 准入节律 1.05s/signup(api signup:global 桶 (60,1/s) 在树防滥用面·≤1/s refill) + 撞桶 ≤2 次有界重试(同 email)·测量窗外·c=1 串行不变 · api 容器 RL_SIGNUP_IP=1000,100(perf/E2E 启动档在树覆写口 auth.service.ts:11「仅 perf/E2E 启动档放宽并显式落档」·ip 桶非量测面)`);
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green · 负载参数冻结 N=${PERF.N} c=${PERF.c} warmup=${WARMUP} runs=${REPEAT_RUNS} pixel5-P-OBS N=${PIXEL_OBS_N}\n`);

  // R6 live-key isolation: in-process self-delete pre-proof (uc001 PERF_api 同形)。
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  A('ISO', 'model-key-unset-in-process(self-deleted pre-proof · keyless 栈零外呼)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

  if (!WEB_BASE) {
    A('ISO', 'PERF_WEB_WEB_BASE present(三容器 caps child 传入 web 发布口)', false);
    console.log(`\nCMD=${CMD} EXIT=1`);
    process.exit(1);
  }
  A('ISO', 'PERF_WEB_WEB_BASE present(三容器 caps child 传入 web 发布口)', true);

  const caps = loadCapsEvidence();
  const capsEnforced = caps.enforced === true;
  if (!capsEnforced) console.log(`FAIL  caps not enforced: ${JSON.stringify(caps)}`);
  A('ISO', 'caps enforced(三容器 PG+api+web Docker NanoCpus=2e9/Memory=4GiB · wrapper HostConfig inspect 亲证·非自报)', capsEnforced);

  const sha = gitSha();
  const browser = await chromium.launch({ headless: true });

  // ── 预算承载面(chromium project): runs=3 all-must-pass · N=100 c=1 · warmup 10 excluded ──
  const runStats: RunStats[] = [];
  let pixelStat: RunStats | null = null;
  try {
    for (let run = 1; run <= REPEAT_RUNS; run++) {
      const stat = await runSurface('chromium', browser, null, run, true);
      runStats.push(stat);
      console.log(`PERF_RUN  surface=chromium run=${run} N=${PERF.N} c=${PERF.c} p50=${stat.p50?.toFixed(1)}ms p95=${stat.p95?.toFixed(1)}ms p99=${stat.p99?.toFixed(1)}ms max=${stat.maxMs?.toFixed(1)}ms error_rate=${stat.errorRate} timeout=${stat.timeoutCount} passed=${stat.passed}${stat.missReasons.length ? ` miss=${stat.missReasons.join(';')}` : ''}`);
    }

    // ── Pixel 5 P-OBS 披露臂(登记限幅 N=20 · 功能断言+五值观测值入收据 · Ban 当预算判据 · warmup 0) ──
    const pixel = devices['Pixel 5'];
    pixelStat = await runSurface('pixel5-P-OBS', browser, { ...pixel } as Record<string, unknown>, 1, false, PIXEL_OBS_N, 0);
    console.log(`PERF_OBS  surface=pixel5-P-OBS N=${PIXEL_OBS_N} c=${PERF.c} p50=${pixelStat.p50?.toFixed(1)}ms p95=${pixelStat.p95?.toFixed(1)}ms p99=${pixelStat.p99?.toFixed(1)}ms max=${pixelStat.maxMs?.toFixed(1)}ms error_rate=${pixelStat.errorRate} timeout=${pixelStat.timeoutCount} · 披露臂非预算判据(DISCLOSED)`);
    const pixelFunctional = pixelStat.errorCount === 0 && pixelStat.timeoutCount === 0;
    A('PERF', 'Pixel 5 P-OBS 披露臂功能断言全过(N=20 · 零 error 零 timeout·五值仅观测披露)', pixelFunctional);

    // ── PERF 五值断言(3 runs all-must-pass · 同值双锚 stream-window.spec :29/:20 · 读法钉随收据) ──
    A('PERF', `全部 3 runs p50 ≤ ${PERF.p50}ms`, runStats.every((r) => r.p50 != null && r.p50 <= PERF.p50));
    A('PERF', `全部 3 runs p95 ≤ ${PERF.p95}ms`, runStats.every((r) => r.p95 != null && r.p95 <= PERF.p95));
    A('PERF', `全部 3 runs p99 ≤ ${PERF.p99}ms`, runStats.every((r) => r.p99 != null && r.p99 <= PERF.p99));
    A('PERF', '全部 3 runs error_rate ≤ 0.5%', runStats.every((r) => r.errorRate <= PERF.errMax));
    A('PERF', 'PERF 五值收据齐(p50/p95/p99/max/error_rate 逐 run 在卷·零空值)',
      runStats.every((r) => r.p50 != null && r.p95 != null && r.p99 != null && r.maxMs != null && r.errorRate != null));
    A('PERF', '全部 3 runs per-sample 功能断言 all-pass(唯一 80 轮窗+题面全唯一+终态可见 · 零 error 零 timeout)',
      runStats.every((r) => r.errorCount === 0 && r.timeoutCount === 0));
  } finally {
    await browser.close().catch(() => {});
  }

  // ── 收据四件套(CMD+EXIT+负载参数冻结+.tmp 路径 · tracked=gate stdout log .log 非扫描面) ──
  const receipt = {
    caseId: CASE_ID,
    cmd: CMD,
    attemptStart: ATTEMPT_STARTED_AT,
    attemptEnd: new Date().toISOString(),
    gitSha: sha,
    loadParamsFrozen: {
      N: PERF.N, c: PERF.c, warmup: WARMUP, repeatRuns: REPEAT_RUNS,
      sampleTimeoutMs: SAMPLE_TIMEOUT_MS, pixel5ObsN: PIXEL_OBS_N,
      method: 'nearest-rank host wall-clock Date.now (stream-window.spec.ts:29 同源计时臂 · 第二锚 :20 显式 timeout 15_000)',
      latencyWindow: 'page.goto(stress URL) 起 → 终态视图可见止 · signup/dashboard 导航=测量窗外 prep',
      stressPath: STRESS_PATH,
      surfaces: [{ name: 'chromium', role: 'budget-bearing · runs=3' }, { name: 'pixel5-P-OBS', role: 'disclosure-only N=20 · 非预算判据' }],
      prepPacing: 'signup prep 准入节律 1.05s/signup + 撞桶 ≤2 次有界重试(同 email·per-email 桶 (3,0.02) 容许)·测量窗外·c=1 串行不变·五参冻结不动',
      apiRlSignupIp: 'RL_SIGNUP_IP=1000,100(perf/E2E 启动档在树覆写口 auth.service.ts:11 自述「仅 perf/E2E 启动档放宽并显式落档」·ip 桶非量测面·api 容器 env 注入)',
    },
    capsEvidencePath: CAPS_PATH,
    capsEnforced,
    caps,
    runs: runStats.map((r) => ({
      surface: r.surface, run: r.run, p50: r.p50, p95: r.p95, p99: r.p99, max: r.maxMs,
      errorRate: r.errorRate, errorCount: r.errorCount, timeoutCount: r.timeoutCount,
      passed: r.passed, missReasons: r.missReasons, start: r.start, end: r.end,
    })),
    pixel5Obs: {
      role: 'P-OBS disclosure arm · Ban 当预算判据 · 登记限幅 N=20',
      p50: pixelStat?.p50 ?? null,
      p95: pixelStat?.p95 ?? null,
      p99: pixelStat?.p99 ?? null,
      max: pixelStat?.maxMs ?? null,
      errorRate: pixelStat?.errorRate ?? null,
      errorCount: pixelStat?.errorCount ?? null,
      timeoutCount: pixelStat?.timeoutCount ?? null,
      disclosure: 'pixel surface five values observed-only (DISCLOSED) · 不当预算判据',
    },
    thresholds: { p50: PERF.p50, p95: PERF.p95, p99: PERF.p99, errMax: PERF.errMax, valueSource: 'stream-window.spec.ts:29 在树唯一 web 面延迟预算 · deliberate broad ceiling not a device or production SLO · 第二锚 :20' },
    dBuildDisclosure: "量测构建携 __E2E_UI_STRESS__='1' build 期内联(e2e-guard-only 源) ≠ 洁净生产 bundle · 生产构建分支死码剔除 · next build 在测量窗外",
    chromiumDisclosure: 'Chromium 宿主驱动进程不封顶(单机 headless 单实例 · c=1 串行) · 单机 ≠ 真机容量',
    rawReceiptPath: join(RAW_DIR, 'perf-receipt.json'),
    pins: 'haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · PG-retained · actualSpendCny=null · EXIT0=case≠covered',
  };
  const redact = (s: string) => s.replace(/postgres(ql)?:\/\/[^"'\s]+/gi, '[redacted-dsn]').replace(/meetwise_dev_password/gi, '[redacted]');
  writeFileSync(join(RAW_DIR, 'perf-receipt.json'), `${redact(JSON.stringify(receipt, null, 2))}\n`);
  console.log(`RECEIPT  raw=${join(RAW_DIR, 'perf-receipt.json')} · caps=${CAPS_PATH} · tracked=ai-docs/delivery/receipts/nhp-001-perf-web-01/(gate stdout log·.log 非扫描面)`);

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${CASE_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log(`PASS  ${CASE_ID}  PERF_web 分面执行收据 (N=${PERF.N} c=${PERF.c} runs=${REPEAT_RUNS} · caps 三容器 enforced · Pixel 5 P-OBS N=${PIXEL_OBS_N})`);
    console.log('EVIDENCE_SHAPE  专用 proof 自启栈(隔离真 PG + api keyless + web production next build/start·E2E_UI_STRESS 期内联) + Playwright chromium 宿主(不封顶披露) · STRESS 源 hermetic 零上游 fetch 零模型 · c=1 串行(非降格·config :14-17 在树钉)');
  }
  console.log('ROW_STILL_GAP  UC-E2E-001 PERF_web blind/case-only 措辞保留(收据入账). NHP-PERF-WEB-SUITE 伞行零翻(实例≠伞). coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban 借本收据宣 SLO/真机容量/生产 bundle 量测/伞闭合 · post dual still required · actualSpendCny=null');
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
