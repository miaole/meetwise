/**
 * UC-E2E-019 · PERF_api 分面执行收据 · NHP-019-PERF-api-01（新登记 case-only·收据入账）
 * (SSOT e2e-requirement-coverage-matrix.md :148 UC-E2E-011/017/019（钱/对账）行 PERF_api 格 blind 保持·
 *  本收据=沿 NHP-001-PERF-api-01 先例形补延迟分位 PERF 收据·协调方授权派单 2026-10-26 序第 8 项·
 *  case-matrix §1.2 019 区 additive 新行登记（case-only·executed·EXIT0≠covered）·行旗升格权归协调方)
 *
 * 先例形（uc-e2e-001-nhp-perf-api.proof.ts · 收据四件套 NHP-001-PERF-api-01）:
 * nearest-rank · client hrtime · timeout 10s=error · warmup 10 excluded · 3 repeat runs all-must-pass ·
 * caps Docker --cpus=2 --memory=4g(NanoCpus=2e9/Memory=4GiB 具名入收据) · Ban post-hoc retune。
 *
 * Load shape（本刀冻结·UC-019 重试链=报告失败可读→HTTP retry→重排可读·产品嘴全 keyless）:
 *   [窗外 prep·沿 uc-e2e-019-report-regenerate-http.proof.ts setupFailedReport 形制·具名注入缝]
 *   interview 夹具 INSERT(created) → reserveEntitlement(夹具·桶种子豁免①承载) →
 *   completeInterviewAndConfirm(confirm·D1 面试完成额度落账) → enqueueReport → claimReport →
 *   markReportFailed(报告失败注入·attempts=1 非 quarantined) → 桶种子(豁免①具名 3.0)
 *   [测量窗] GET /interview/:id/report(200 status=failed·attempts≥1 可读) →
 *   POST /interview/:id/report/retry(200 requeued:true·#229 D2 RL=3 次/小时/报告·每报告恰 1 次≤桶·零 429) →
 *   GET /interview/:id/report(200 status=queued 重排可读) — N=100 · concurrency=10 · 逐虚拟用户。
 * consent 前置=本链零触点（链上无 /resume 上传·零 consent 依赖·如实申明入收据）。
 *
 * 期望(PERF 五值 · 沿 NHP-018-PERF-01/NHP-001-PERF-api-01 同口径): p50≤250ms · p95≤750ms ·
 * p99≤1500ms · max(观测值披露) · error_rate≤0.5% + 收据四件套。EXIT=0 仅当全部 3 runs 五值达标+caps enforced。
 *
 * 读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零 drain(retry 仅重排零 worker·报告滞队) ·
 * regenerate 免费=零新增扣费(D1·consumption 恒 confirmed 不加账) · actualSpendCny=null ·
 * EXIT0=case≠covered · Ban 借本收据宣 NHP-PERF-API-SUITE 闭合(实例≠伞) ·
 * Ban 与 NHP-019-ADV-01（对抗拒面收据）互洗（两收据形状不同·互不替代·case-matrix 两行各自独立）。
 *
 * wrapper 落位钉: 子进程 wrapper 不落 tracked scripts/ — 经 runner isolatedCommand 运行时内联源生成·
 * 收据源与 caps evidence 落 .tmp/uc019-perf-api-receipts/(沿 uc001/uc018 .tmp 先例)。
 *
 * Live-key isolation(uc025 bound-isolated R6 同形): in-process 先 delete MODEL_API_KEY/MODEL_BASE_URL
 * 再断言 unset。零 provider egress · est live=0。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 ·
 * PG-retained · PERF_api blind 保持(收据入账·措辞 case-only 保留) · EXIT0=case≠covered · ⛔push
 *
 *   pnpm uc019:nhp-perf-api:prove
 *   pnpm -C apps/api prove:uc019-nhp-perf-api   (raw; needs isolated env + caps child)
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { asPrincipal, availableUnits, reserveEntitlement, completeInterviewAndConfirm, enqueueReport, claimReport, markReportFailed } from '@meetwise/db';
import { boot } from './_neg-harness';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const RAW_DIR = join(ROOT, '.tmp/uc019-perf-api-receipts');
const CAPS_PATH = join(RAW_DIR, '_caps-evidence.json');
const REQUEST_TIMEOUT_MS = 10_000;
const WARMUP = 10;
const REPEAT_RUNS = 3;
const PERF = { N: 100, c: 10, p50: 250, p95: 750, p99: 1500, errMax: 0.005 };
const SEED_UNITS = 3;
const OWNER_PREFIX = 'nhp019p_';

mkdirSync(RAW_DIR, { recursive: true });

const CMD = 'pnpm uc019:nhp-perf-api:prove';
const CASE_ID = 'NHP-019-PERF-api-01';
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
  console.log(`UC-E2E-019 ${CASE_ID} PERF_api 分面执行收据 (uc001 先例形 · nearest-rank · caps Docker 2cpu/4GiB)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零 drain · regenerate 免费零加账 · EXIT0=case≠covered · actualSpendCny=null');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green · 负载参数冻结 N=${PERF.N} c=${PERF.c} warmup=${WARMUP} runs=${REPEAT_RUNS}\n`);

  // R6 live-key isolation: in-process self-delete pre-boot.
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  A('ISO', 'model-key-unset-in-process(self-deleted pre-boot)', process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

  const caps = loadCapsEvidence();
  const capsEnforced = caps.enforced === true;
  if (!capsEnforced) console.log(`FAIL  caps not enforced: ${JSON.stringify(caps)}`);
  A('ISO', 'caps enforced(Docker NanoCpus=2e9/Memory=4GiB · wrapper HostConfig 亲证)', capsEnforced);

  const h = await boot();
  const pool = h.pool;
  A('ISO', 'model-key-still-unset-after-boot(no re-import regression)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);
  console.log('PIN   NHP-019-PERF-API-PRIVACY-MIRROR: boot() 内置 0058 镜像承载隐私触点（proof 级 stub 可免装·rev2 P2-1·沿 uc017 先例）');
  // 0206/0058 函数 ACL 重放（夹具面·真相=迁移链 0206·uc001 :137 0121 重放同款教训）：harness sql/01 重建
  // app_role 会抹迁移链函数 EXECUTE ACL（旧 OID 失效）。retry 链 guard 面（active/assert）+读分层（read）
  // 按 0206/trial-grant ① GRANT 块原样重放。
  await pool.query(`
REVOKE ALL ON FUNCTION interview_privacy_active_read(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_privacy_active_read(text) TO app_role;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
  console.log('PIN   NHP-019-PERF-API-0206-ACL-REPLAY: harness 面函数 ACL 重放(app_role·真相=迁移链 0206·sql/01 角色重建抹 ACL 教训承登)');
  console.log('PIN   NHP-019-PERF-API-REPORT-FAIL-INJECT: 夹具注入缝=setupFailedReport 形制（enqueue→claim→markReportFailed·具名·窗外·沿 uc019-report-regenerate-http 先例）');

  const S = Date.now().toString(36).toUpperCase();
  const sha = gitSha();

  const virtualUsers = (run: number): string[] =>
    Array.from({ length: PERF.N + WARMUP }, (_, i) => `${OWNER_PREFIX}${S}_r${run}u${i}`);
  const interviewIdOf = (principal: string): string => `IV_${principal.toUpperCase()}`;

  /** 测量窗外 prep（不计入分位·沿 uc019 setupFailedReport 形制·具名注入缝）:
   *  interview 夹具 → reserve → confirm → enqueue → claim → markReportFailed(attempts=1) → 桶种子(豁免①)。 */
  const prepUser = async (principal: string) => {
    const interviewId = interviewIdOf(principal);
    // 桶种子先行（豁免①具名）：prep 内 reserveEntitlement 行使所需（种子在扣减前置位）。
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1, 'paid', $2, now() + interval '300 days')`,
      [principal, SEED_UNITS],
    );
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')",
      [interviewId, principal],
    );
    await asPrincipal(pool, principal, (c) => reserveEntitlement(c, principal, interviewId, 'mock_interview', 1.0));
    await asPrincipal(pool, principal, (c) => completeInterviewAndConfirm(c, principal, interviewId));
    const enq = await asPrincipal(pool, principal, (c) => enqueueReport(c, principal, interviewId));
    const lease = `${principal}-claim`;
    const claimed = await asPrincipal(pool, principal, (c) => claimReport(c, principal, lease));
    if (!claimed || claimed.interviewId !== interviewId) throw new Error(`claimReport_missed_target:${principal}`);
    const ok = await asPrincipal(pool, principal, (c) =>
      markReportFailed(c, principal, claimed.reportId, lease, 'nhp019_perf_injected_fail'));
    if (!ok) throw new Error(`markReportFailed_missed:${principal}`);
    if (!enq?.reportId) throw new Error(`enqueueReport_missed:${principal}`);
    return { interviewId };
  };

  type Sample = { ok: boolean; timedOut: boolean; latencyMs: number; error?: string };
  const chain = async (principal: string, interviewId: string): Promise<Sample> => {
    const t0 = process.hrtime.bigint();
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);
    const step = async (label: string, p: Promise<{ status: number; body: any }>, want: number, extra?: (b: any) => boolean) => {
      const r = await p;
      if (ac.signal.aborted) throw Object.assign(new Error('timeout'), { timedOut: true });
      if (r.status !== want || (extra ? !extra(r.body) : false)) {
        throw new Error(`${label}_http_${r.status}:${JSON.stringify(r.body).slice(0, 120)}`);
      }
      return r;
    };
    try {
      // ① 报告失败可读: 200 failed(attempts≥1·舱壁标 failed 可读)
      await step('report-failed-read', h.req('GET', `/interview/${interviewId}/report`, h.U(principal)),
        200, (b) => b?.status === 'failed' && b?.content === null && Number(b?.attempts) >= 1);
      // ② HTTP retry 嘴: 200 requeued:true(#229 D2 RL 3/小时/报告·每报告恰 1 次≤桶)
      await step('retry', h.post(`/interview/${interviewId}/report/retry`, h.U(principal), {}),
        200, (b) => b?.requeued === true);
      // ③ 重排可读: 200 queued(attempts 重置)
      await step('report-queued-read', h.req('GET', `/interview/${interviewId}/report`, h.U(principal)),
        200, (b) => b?.status === 'queued' && b?.content === null);
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
    p50: number | null; p95: number | null; p99: number | null;
    maxMs: number | null; errorCount: number; timeoutCount: number; errorRate: number;
    passed: boolean; missReasons: string[]; start: string; end: string;
  };

  const runStats: RunStats[] = [];
  for (let run = 1; run <= REPEAT_RUNS; run++) {
    const start = new Date().toISOString();
    const users = virtualUsers(run);
    // 测量窗外: 失败报告夹具(具名注入缝)+桶种子 — 不计入分位。
    const preps = new Map<string, { interviewId: string }>();
    await mapPool(users, PERF.c, async (u) => {
      preps.set(u, await prepUser(u));
    });
    // 独立 warmup 用户(warmup 10 excluded): 其样本不计入分位(uc018/uc001 warmup 形同构)。
    const warmupUsers = users.slice(0, WARMUP);
    const measuredUsers = users.slice(WARMUP);
    for (const u of warmupUsers) {
      const p = preps.get(u)!;
      await chain(u, p.interviewId);
    }

    const samples = await mapPool(measuredUsers, PERF.c, (u) => {
      const p = preps.get(u);
      if (!p) return Promise.resolve({ ok: false, timedOut: false, latencyMs: 0, error: `prep_missing:${u}` });
      return chain(u, p.interviewId);
    });
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
      run, N: PERF.N, c: PERF.c, warmup: WARMUP,
      p50, p95, p99, maxMs, errorCount, timeoutCount, errorRate,
      passed: missReasons.length === 0, missReasons, start, end: new Date().toISOString(),
    };
    runStats.push(stat);
    console.log(`PERF_RUN  run=${run} N=${PERF.N} c=${PERF.c} p50=${p50?.toFixed(1)}ms p95=${p95?.toFixed(1)}ms p99=${p99?.toFixed(1)}ms max=${maxMs?.toFixed(1)}ms error_rate=${errorRate} timeout=${timeoutCount} passed=${stat.passed}${missReasons.length ? ` miss=${missReasons.join(';')}` : ''}`);
    if (errorCount > 0) {
      for (const s of samples) if (!s.ok) console.log(`PERF_ERROR_DETAIL  run=${run} ${s.error}`);
    }
  }

  // ── PERF 五值断言(3 runs all-must-pass) ──
  A('PERF', '全部 3 runs p50 ≤ 250ms', runStats.every((r) => r.p50 != null && r.p50 <= PERF.p50));
  A('PERF', '全部 3 runs p95 ≤ 750ms', runStats.every((r) => r.p95 != null && r.p95 <= PERF.p95));
  A('PERF', '全部 3 runs p99 ≤ 1500ms', runStats.every((r) => r.p99 != null && r.p99 <= PERF.p99));
  A('PERF', '全部 3 runs error_rate ≤ 0.5%', runStats.every((r) => r.errorRate <= PERF.errMax));
  A('PERF', 'PERF 五值收据齐(p50/p95/p99/max/error_rate 逐 run 在卷·零空值)',
    runStats.every((r) => r.p50 != null && r.p95 != null && r.p99 != null && r.maxMs != null && r.errorRate != null));

  // ── N: 零模型零 drain + regenerate 免费净账静检 ──
  {
    const expectReports = REPEAT_RUNS * (PERF.N + WARMUP);
    const ownerLike = `${OWNER_PREFIX.replace('_', '\\_')}%`;
    const queued = Number((await pool.query(
      `SELECT count(*)::int AS n FROM ai_report WHERE owner_user_id LIKE $1 AND status='queued'`, [ownerLike])).rows[0]?.n ?? 0);
    const nonQueued = Number((await pool.query(
      `SELECT count(*)::int AS n FROM ai_report WHERE owner_user_id LIKE $1 AND status<>'queued'`, [ownerLike])).rows[0]?.n ?? 0);
    A('N', `报告滞队零 drain(ai_report queued=${queued} 恰 ${expectReports}·非 queued 0 · retry 重排后零 worker 消费)`, queued === expectReports && nonQueued === 0);
    const confirmed = Number((await pool.query(
      `SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id LIKE $1 AND status='confirmed'`, [ownerLike])).rows[0]?.n ?? 0);
    const other = Number((await pool.query(
      `SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id LIKE $1 AND status<>'confirmed'`, [ownerLike])).rows[0]?.n ?? 0);
    A('N', `regenerate 免费净账(confirmed=${confirmed} 恰 ${expectReports}·其余态 0 · 报告重试零新增扣费·D1)`, confirmed === expectReports && other === 0);
    const inv = Number((await pool.query('SELECT count(*)::int AS n FROM ai_model_invocation')).rows[0]?.n ?? 0);
    A('N', '零模型调用(ai_model_invocation 行 0 · keyless 主链零外呼)', inv === 0);
    const sampleUnits = await asPrincipal(pool, `${OWNER_PREFIX}${S}_r1u${WARMUP}`, (c) => availableUnits(c, `${OWNER_PREFIX}${S}_r1u${WARMUP}`));
    A('N', `额度口径静检(样本用户 availableUnits=${sampleUnits} = 种子 3.0-1.0 confirm 消耗 = 2.0·重试不加账)`,
      typeof sampleUnits === 'number' && Math.abs(sampleUnits - (SEED_UNITS - 1)) < 1e-9);
  }

  // ── SEED 豁免具名 ──
  {
    const seeds = Number((await pool.query(
      `SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id LIKE $1 AND kind='paid'`,
      [`${OWNER_PREFIX.replace('_', '\\_')}%`])).rows[0]?.n ?? 0);
    A('SEED', `桶种子=豁免①具名(${seeds} 桶·恰 (N+warmup)×runs=${REPEAT_RUNS * (PERF.N + WARMUP)}·预算面非产品路径绕行·逐项申明入收据)`,
      seeds === REPEAT_RUNS * (PERF.N + WARMUP));
  }

  // ── 收据四件套 ──
  const receipt = {
    caseId: CASE_ID,
    derivedUc: 'UC-E2E-019',
    chainShape: '重试链: GET /interview/:id/report(200 failed) → POST /interview/:id/report/retry(200 requeued·RL 3/h/report 恰 1 次) → GET /interview/:id/report(200 queued); 窗外 prep=interview 夹具+reserve/confirm+enqueue/claim/markReportFailed 注入缝(具名)+桶种子',
    consentTouchpoint: 'none(链上无 /resume 上传·零 consent 依赖·如实申明)',
    cmd: CMD,
    attemptStart: ATTEMPT_STARTED_AT,
    attemptEnd: new Date().toISOString(),
    gitSha: sha,
    loadParamsFrozen: { N: PERF.N, c: PERF.c, warmup: WARMUP, repeatRuns: REPEAT_RUNS, timeoutMs: REQUEST_TIMEOUT_MS, method: 'nearest-rank client-hrtime', percentiles: ['p50', 'p95', 'p99', 'max', 'error_rate'] },
    capsEvidencePath: CAPS_PATH,
    capsEnforced,
    caps,
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
  console.log(`RECEIPT  raw=${join(RAW_DIR, 'perf-receipt.json')} · caps=${CAPS_PATH} · tracked=ai-docs/delivery/receipts/nhp-011-017-019-perf-api/(gate stdout log·四件套内嵌)`);

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${CASE_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log(`PASS  ${CASE_ID}  PERF_api 分面执行收据·延迟分位形 (N=${PERF.N} c=${PERF.c} runs=${REPEAT_RUNS} · caps enforced)`);
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + capped child(2cpu/4GiB) + real PG · 重试链(failed 可读→retry→queued 可读) · consent 零触点(如实申明) · 豁免=桶种子具名 · 零模型零 drain');
  }
  console.log('ROW_STILL_CASE_ONLY  UC-E2E-019 PERF_api blind 保持(收据入账·case-only 措辞保留·行旗权归协调方). coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban 借本收据宣 NHP-PERF-API-SUITE 闭合(实例≠伞) · Ban 与 NHP-019-ADV-01 对抗拒面收据互洗 · post dual still required · actualSpendCny=null');
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
