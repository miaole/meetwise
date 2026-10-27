/**
 * UC-E2E-004 · PERF_api 分面执行收据 · NHP-004-PERF-api-01
 * (REQUEST ai-docs/delivery/harness/perf2-REQUEST.md §1.4 Case 1 · 矩阵 §1.0.2 :149 + case-matrix §1.3 004 区
 *  blind 格 additive 收据补账 · 格值 blind 保持 · EXIT0=case≠covered)
 *
 * 世界钉(REQUEST §0.3 rev r1 协调方裁决·席2 修复路径 (a)): 预迁移世界(pre-migrate)沿 uc004-fault
 * 先例形(runner pre-migrate 名单在列·同世界 EXIT=0 史旁证) —— 本 proof 取 fault 形: 零 boot()·
 * 零 ACL 重放块(纯 pre-migrate 世界授权面迁移链自足·P2-1)·真迁移链由 runner migrateWithRecovery
 * 先立·本 prove 自有 superuser 池 + 真实 NestJS API 子进程(uc004-fault startApiChild 同形·零 seam)。
 *
 * Method freeze (uc-e2e-001-nhp-perf-api.proof.ts 977e0d01 #157 先例形 · 沿形不触其文件):
 * nearest-rank · client hrtime · timeout 10s=error(硬顶 rev r2: proof-local fetch 直入
 * AbortSignal(`signal: ac.signal`)+wrapper 级 wall-cap race 兜底 —— uc001 :160-167 `aborted` 检于
 * `await` 后的悬挂缝不复发) · warmup 10 excluded(预热样本不计入分位) · 3 repeat runs all-must-pass ·
 * caps Docker 双容器 2cpu/4GiB(NanoCpus=2e9/Memory=4GiB·HostConfig inspect 亲证入收据) ·
 * Ban post-hoc retune。
 *
 * Load shape (REQUEST §1.4 Case 1 登记冻结): 主链 keyless HTTP 嘴序列(单数 interview·controller :16
 * `@Controller('interview')` + :237 `@Post(':id/career-path')` 对码)
 *   POST /interview/:id/career-path(同步 200) → GET /interview/:id/career-path(200 终态可读) —
 *   N=100 · concurrency=10 · 逐虚拟用户。
 * 窗外 prep(逐虚拟用户·测量窗外不计入分位·Ban 裸 INSERT 绕产品路径=仅限窗外 prep 面):
 * 九件种子沿 uc-e2e-004-career-path-fault.proof.ts :206-247 同世界同形(user_account /
 * interview(completed) / assessment_report(overall=60·dimensions 含 gap) / question_rubric /
 * interview_answer_submission / interview_answer_artifact / issued_question_contract /
 * score_request / score_card(practice_eligible·deterministic_total=60)·0059 GUC
 * `app.principal_user` 逐会话设) —— GET 重闸资格链(interview-assessment.ts :94-102)由
 * score_card 种子承载。career-path 链零额度触点(generateCareerPath 全文零 reserveEntitlement)
 * → 零桶种子如实申明(≠uc001/015 桶豁免形·零桶即零豁免)。
 *
 * 期望(结构面 · PERF 五值同口径): p50≤250ms · p95≤750ms · p99≤1500ms · max(观测值披露) ·
 * error_rate≤0.5% + 收据四件套(CMD+EXIT+负载参数冻结+.tmp/tracked 路径)。
 * EXIT=0 仅当全部 3 runs 五值达 threshold + caps enforced。
 *
 * 读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型(career-path derive 纯本地单节点图
 * ·ai_graph_run succeeded 恰数+ai_model_invocation=0 双检) · actualSpendCny=null ·
 * Ban 借本收据宣 PERF SLO/生产容量/HA/线上 SLO/NHP-PERF-API-SUITE 闭合(实例≠伞) ·
 * Ban 借本收据宣 GAP-UC004-E2E-MAIN/GRAPH/GROWTH/FAIL-A3/UNCERTAINTY 收口(本收据=PERF 分面
 * 延迟观测·非主路径 e2e 闭环·uc-e2e-004-career-path.md §1b 清单原样保留) ·
 * Ban 与 NHP-004-BOUND/ADV/FAULT 收据互洗。
 *
 * wrapper 落位钉(REQUEST §1.4 Case 1): 子进程 wrapper 不落 tracked scripts/ — 经 runner
 * isolatedCommand 运行时内联源生成·收据源与 caps evidence 落 .tmp/uc004-perf-api-receipts/
 * (沿 uc018/uc001 收据 .tmp 先例)。
 *
 * Live-key isolation (uc001 :120-123 R6 同形): this proof deletes MODEL_API_KEY and
 * MODEL_BASE_URL in-process FIRST (pre-seed pre-child-spawn), then asserts unset. Zero provider
 * egress · est live=0.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · PERF_api blind→case-only(收据入账·
 * 措辞 case-only 保留) · EXIT0=case≠covered · ⛔push
 *
 *   pnpm uc004:nhp-perf-api:prove
 *   pnpm -C apps/api prove:uc004-nhp-perf-api   (raw; needs isolated env + caps child)
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { createHash } from 'node:crypto';
import { createPool, assertIsolatedTestTarget } from '@meetwise/db';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW_DIR = join(ROOT, '.tmp/uc004-perf-api-receipts');
const CAPS_PATH = join(RAW_DIR, '_caps-evidence.json');
const REQUEST_TIMEOUT_MS = 10_000;
const WARMUP = 10;
const REPEAT_RUNS = 3;
// 零 lint 增量形(rev r2): 线格式键名(N/x-user-id 等)经 computed-key/常量承载·JSON/HTTP 字节恒等。
const PERF = { n: 100, c: 10, p50: 250, p95: 750, p99: 1500, errMax: 0.005 };
const USER_ID_HEADER = 'x-user-id';
const PORT_KEY = 'PORT';
const HOST_KEY = 'HOST';
const N_KEY = 'N';
const C_KEY = 'c';

mkdirSync(RAW_DIR, { recursive: true });

const CMD = 'pnpm uc004:nhp-perf-api:prove';
const CASE_ID = 'NHP-004-PERF-api-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();
let apiChild: ChildProcess | null = null;

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

type SqlClient = { query: (sql: string, values?: unknown[]) => Promise<unknown> };
type Json = Record<string, unknown>;
type HttpResult = { status: number; body: Json };

function gitSha(): string {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function loadCapsEvidence(): Json {
  if (!existsSync(CAPS_PATH)) {
    return { enforced: false, blocker: 'caps_evidence_file_missing', detail: `expected ${CAPS_PATH} from capped child wrapper` };
  }
  try {
    return JSON.parse(readFileSync(CAPS_PATH, 'utf8')) as Json;
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

/** 确定性 uuid(sha256 → v4 形 nibble·同 principal 重种恒等·幂等审计面)。 */
function detUuid(ns: string): string {
  const h = createHash('sha256').update(ns).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const HASH4 = '0000000000000000000000000000000000000000000000000000000000000004';

// ── 窗外 prep: 九件种子(uc004-fault :206-247 同世界同形·0059 GUC 逐会话) ──
async function seedUser(client: SqlClient, principal: string): Promise<void> {
  const interviewId = `perfiv_${principal}`;
  const rubricId = detUuid(`rubric:${principal}`);
  const submissionId = detUuid(`submission:${principal}`);
  const artifactId = detUuid(`artifact:${principal}`);
  const contractId = detUuid(`contract:${principal}`);
  const scoreReqId = detUuid(`scoreq:${principal}`);
  const scoreCardId = detUuid(`scorec:${principal}`);
  const dims = JSON.stringify([
    { dimension: '分布式锁', score: 40, gap: true, evidence: [] },
    { dimension: '消息队列', score: 35, gap: true, evidence: [] },
  ]);
  await client.query(`SELECT set_config('app.principal_user',$1,false)`, [principal]);
  await client.query(`INSERT INTO user_account(id,email,password_hash) VALUES ($1,$2,'scrypt$x$y') ON CONFLICT DO NOTHING`,
    [principal, `${principal}@perf.local`]);
  await client.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'completed') ON CONFLICT DO NOTHING`,
    [interviewId, principal]);
  await client.query(
    `INSERT INTO assessment_report(id,owner_user_id,interview_id,status,dimensions,overall)
     VALUES ($1,$2,$3,'ready',$4::jsonb,60) ON CONFLICT DO NOTHING`,
    [detUuid(`ar:${principal}`), principal, interviewId, dims]);
  await client.query(
    `INSERT INTO question_rubric(id,question_id,question_version,rubric_version,competency,difficulty,language_scope,question_content_hash,status)
     VALUES ($1,$2,1,1,'分布式锁',3,'["zh","en"]',$3,'published')
     ON CONFLICT (id) DO NOTHING`,
    [rubricId, `q_${principal}`, HASH4]);
  await client.query(
    `INSERT INTO interview_answer_submission(id,owner_user_id,interview_id,question_id,state_version,client_submission_key,canonical_body_hmac,privacy_epoch)
     VALUES ($1,$2,$3,$4,1,$5,$6,1)
     ON CONFLICT (id) DO NOTHING`,
    [submissionId, principal, interviewId, `q_${principal}`, `${principal}-sub-1`, HASH4]);
  await client.query(
    `INSERT INTO interview_answer_artifact(id,owner_user_id,interview_id,question_id,state_version,submission_id,ciphertext,body_hmac,hmac_key_version,enc_key_version,privacy_epoch)
     VALUES ($1,$2,$3,$4,1,$5,decode('00','hex'),$6,1,1,1)
     ON CONFLICT (id) DO NOTHING`,
    [artifactId, principal, interviewId, `q_${principal}`, submissionId, HASH4]);
  await client.query(
    `INSERT INTO issued_question_contract(id,owner_user_id,interview_id,question_id,state_version,turn,question_content_hash,rubric_id,difficulty,form,language,route,prompt_policy_version,measurement_version,privacy_epoch,status)
     VALUES ($1,$2,$3,$4,1,0,$5,$6,3,'mock','zh','adaptive','prompt-v1','measure-v1',1,'issued')
     ON CONFLICT (id) DO NOTHING`,
    [contractId, principal, interviewId, `q_${principal}`, HASH4, rubricId]);
  await client.query(
    `INSERT INTO score_request(id,owner_user_id,interview_id,issued_contract_id,submission_id,artifact_id,answer_version,answer_body_hmac,privacy_epoch,operation_policy_version,idempotency_key,status)
     VALUES ($1,$2,$3,$4,$5,$6,1,$7,1,'op-v1',$8,'scored')
     ON CONFLICT (id) DO NOTHING`,
    [scoreReqId, principal, interviewId, contractId, submissionId, artifactId, HASH4, `${principal}-req-1`]);
  await client.query(
    `INSERT INTO score_card(id,owner_user_id,interview_id,question_id,answer_id,submission_id,score_request_id,issued_contract_id,rubric_id,rubric_version,measurement_version,deterministic_total,coverage,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1,'measure-v1',60,1,'practice_eligible')
     ON CONFLICT (id) DO NOTHING`,
    [scoreCardId, principal, interviewId, `q_${principal}`, artifactId, submissionId, scoreReqId, contractId, rubricId]);
}

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = createServer();
    s.once('error', rej);
    s.listen(0, '127.0.0.1', () => {
      const addr = s.address();
      const p = typeof addr === 'object' && addr ? addr.port : 0;
      s.close(() => res(p));
    });
  });
}

async function startApiChild(): Promise<{ base: string }> {
  const port = await freePort();
  const env: Record<string, string | undefined> = { ...process.env, [PORT_KEY]: String(port), [HOST_KEY]: '127.0.0.1' };
  // 与 _neg-harness/uc004-fault 同款测试配置；career-path 为纯域派生零模型调用 → Ban 付费模型依赖。
  env.AUTH_DEV_HEADER = '1'; env.AUTH_SECRET = 'test-secret-key';
  env.RESUME_ENC_KEY = 'test-resume-enc-key'; env.RESUME_HASH_SECRET = 'test-resume-hash-secret';
  env.PAY_PROVIDER_SECRET = 'test-pay-secret'; env.OCR_ENABLED = '0';
  if (env.NODE_ENV === 'production') env.NODE_ENV = 'test';   // 本地隔离靶必须走非生产 CORS/DB 守卫
  delete env.MODEL_API_KEY; delete env.MODEL_BASE_URL;
  const child = spawn(process.execPath,
    ['--import', '@swc-node/register/esm-register', 'src/main.ts'],
    { cwd: apiRoot, env: env as NodeJS.ProcessEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  apiChild = child;
  const out: string[] = []; const err: string[] = [];
  const push = (arr: string[]) => (c: Buffer) => { arr.push(String(c)); if (arr.length > 64) arr.shift(); };
  child.stdout?.on('data', push(out)); child.stderr?.on('data', push(err));
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`${base}/openapi.json`);
      if (r.status === 200) return { base };
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`api_child_not_ready stdout_tail=${out.join('').slice(-600)}`);
}

async function main(): Promise<void> {
  console.log(`UC-E2E-004 ${CASE_ID} PERF_api 分面执行收据 (pre-migrate 世界·uc004-fault 形·nearest-rank · caps Docker 2cpu/4GiB)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零外呼 · EXIT0=case≠covered · actualSpendCny=null');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green · 负载参数冻结 N=${PERF.n} c=${PERF.c} warmup=${WARMUP}(excluded) runs=${REPEAT_RUNS}\n`);

  // R6 live-key isolation: shell strip list lacks MODEL_API_KEY → in-process self-delete pre-seed.
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  A('ISO', 'model-key-unset-in-process(self-deleted pre-seed · shell strip list lacks MODEL_API_KEY)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

  const caps = loadCapsEvidence();
  const capsEnforced = caps.enforced === true;
  if (!capsEnforced) console.log(`FAIL  caps not enforced: ${JSON.stringify(caps)}`);
  A('ISO', 'caps enforced(Docker NanoCpus=2e9/Memory=4GiB · wrapper HostConfig 亲证)', capsEnforced);

  const pool = createPool();
  await assertIsolatedTestTarget(pool);
  const api = await startApiChild();
  A('ISO', 'model-key-still-unset-after-api-child-spawn(no re-import regression)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);
  console.log(`API_CHILD_READY base=${api.base}`);

  const S = Date.now().toString(36).toUpperCase();
  const sha = gitSha();

  const virtualUsers = (run: number): string[] =>
    Array.from({ length: PERF.n + WARMUP }, (_, i) => `nhp004p_${S}_r${run}u${i}`);
  const interviewIdOf = (principal: string): string => `perfiv_${principal}`;

  type Sample = { ok: boolean; timedOut: boolean; latencyMs: number; error?: string };
  // timeout 10s 硬顶(rev r2): proof-local fetch 直入 AbortSignal(`signal` 直入 fetch init)+
  // wall-cap race 兜底(悬挂不吞计时)·先例缝 uc001 :160-167 不复发。
  const chain = async (principal: string): Promise<Sample> => {
    const t0 = process.hrtime.bigint();
    const ac = new AbortController();
    const deadline = Date.now() + REQUEST_TIMEOUT_MS;
    const wallTimer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);
    const call = async (method: string, path: string): Promise<HttpResult> => {
      const p = fetch(`${api.base}${path}`, { method, headers: { [USER_ID_HEADER]: principal }, signal: ac.signal });
      const wall = new Promise<never>((_, rej) =>
        setTimeout(() => rej(Object.assign(new Error('timeout_wall_cap'), { timedOut: true })), Math.max(deadline - Date.now(), 0)));
      const res = await Promise.race([p, wall]);
      return { status: res.status, body: (await res.json().catch(() => ({}))) as Json };
    };
    try {
      const post = await call('POST', `/interview/${interviewIdOf(principal)}/career-path`);
      if (post.status !== 200) throw new Error(`career_path_post_http_${post.status}:${JSON.stringify(post.body).slice(0, 120)}`);
      const get = await call('GET', `/interview/${interviewIdOf(principal)}/career-path`);
      if (get.status !== 200) throw new Error(`career_path_get_http_${get.status}:${JSON.stringify(get.body).slice(0, 120)}`);
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
  const seedClient = await pool.connect();
  try {
    for (let run = 1; run <= REPEAT_RUNS; run++) {
      const start = new Date().toISOString();
      const users = virtualUsers(run);
      // 测量窗外: 九件种子逐虚拟用户(0059 GUC 逐会话) — 不计入分位·零桶种子(career-path 链零额度触点)。
      for (const u of users) await seedUser(seedClient, u);
      // 独立 warmup 用户(warmup 10 excluded): users 头 10 个先行行使·其样本不计入分位。
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
    await seedClient.query(`SELECT set_config('app.principal_user','',false)`);
  } finally { seedClient.release(); }

  // ── PERF 五值断言(3 runs all-must-pass·uc018/uc001 同口径) ──
  A('PERF', '全部 3 runs p50 ≤ 250ms', runStats.every((r) => r.p50 != null && r.p50 <= PERF.p50));
  A('PERF', '全部 3 runs p95 ≤ 750ms', runStats.every((r) => r.p95 != null && r.p95 <= PERF.p95));
  A('PERF', '全部 3 runs p99 ≤ 1500ms', runStats.every((r) => r.p99 != null && r.p99 <= PERF.p99));
  A('PERF', '全部 3 runs error_rate ≤ 0.5%', runStats.every((r) => r.errorRate <= PERF.errMax));
  A('PERF', 'PERF 五值收据齐(p50/p95/p99/max/error_rate 逐 run 在卷·零空值)',
    runStats.every((r) => r.p50 != null && r.p95 != null && r.p99 != null && r.maxMs != null && r.errorRate != null));

  // ── N: 零模型双检(ai_graph_run succeeded 恰数 + ai_model_invocation=0) ──
  {
    const expectRuns = REPEAT_RUNS * (PERF.n + WARMUP);
    const gr = Number((await pool.query(`SELECT count(*)::int AS n FROM ai_graph_run WHERE graph_name='career-path' AND status='succeeded'`)).rows[0]?.n ?? 0);
    A('N', `career-path 图零模型本地执行(ai_graph_run succeeded 恰 ${gr}/${expectRuns}·单节点图进程内 derive)`, gr === expectRuns);
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
    world: 'pre-migrate(uc004-fault 先例形·runner premigrate 名单在列·零 boot() 零 ACL 重放块·P2-1)',
    loadParamsFrozen: { [N_KEY]: PERF.n, [C_KEY]: PERF.c, warmup: WARMUP, warmupExcluded: true, repeatRuns: REPEAT_RUNS, timeoutMs: REQUEST_TIMEOUT_MS, method: 'nearest-rank client-hrtime', percentiles: ['p50', 'p95', 'p99', 'max', 'error_rate'], timeoutHardCap: 'AbortSignal-into-fetch + wall-cap race(rev r2·uc001 :160-167 缝不复发)' },
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
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + capped child(2cpu/4GiB) + real PG migrate chain · 九件种子窗外(0059 GUC 逐会话) · 零桶种子如实申明 · 零模型双检');
  }
  console.log('ROW_STILL_GAP  UC-E2E-004 PERF_api blind→case-only 措辞(收据入账·case-only 保留·格值 blind 零翻). LOAD_w 留后刀. coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban 借本收据宣 PERF SLO/生产容量/HA/NHP-PERF-API-SUITE 闭合(实例≠伞)/GAP-UC004-E2E-MAIN/GRAPH/GROWTH/FAIL-A3/UNCERTAINTY 收口 · Ban 与 NHP-004-BOUND/ADV/FAULT 收据互洗 · post dual still required · actualSpendCny=null');
  console.log(`\nCMD=${CMD} EXIT=${exit}`);
  apiChild?.kill('SIGKILL');
  process.exit(exit);
}

main().catch((e: unknown) => {
  console.error(e);
  console.log(`\nGAP  ${CASE_ID}  harness/runtime failure: ${e instanceof Error ? e.message : String(e)}`);
  console.log(`ATTEMPT_END  iso=${new Date().toISOString()} EXIT=1 (crash)`);
  console.log(`\nCMD=${CMD} EXIT=1`);
  apiChild?.kill('SIGKILL');
  process.exit(1);
});
