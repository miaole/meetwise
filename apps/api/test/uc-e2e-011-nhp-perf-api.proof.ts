/**
 * UC-E2E-011 · PERF_api 分面执行收据 · NHP-011-PERF-api-01（延迟分位形补账）
 * (SSOT e2e-requirement-coverage-matrix.md :148 UC-E2E-011/017/019（钱/对账）行 PERF_api 格 blind 保持·
 *  本收据=沿 NHP-001-PERF-api-01 先例形补延迟分位 PERF 收据·协调方授权派单 2026-10-26 序第 8 项·
 *  case-matrix NHP-011-PERF-api-01 既有 case-only 行锚 additive 注记·行旗不动非本席权)
 *
 * 先例形（uc-e2e-001-nhp-perf-api.proof.ts · 收据四件套 NHP-001-PERF-api-01）:
 * nearest-rank · client hrtime · timeout 10s=error · warmup 10 excluded · 3 repeat runs all-must-pass ·
 * caps Docker --cpus=2 --memory=4g(NanoCpus=2e9/Memory=4GiB 具名入收据) · Ban post-hoc retune。
 *
 * Load shape（本刀冻结·UC-011 begin 主链=钱生命周期 HTTP 嘴）:
 *   [窗外 prep] POST /interview(产品嘴 create·reused=false) → resume 夹具 INSERT(ingested·具名豁免)
 *   → route decision/snapshot 预供给(0142 面·幂等回读臂) → 桶种子(豁免①具名 3.0)
 *   [测量窗] POST /interview/:id/begin(202 扣额预留·typed 绑定+route 回读+reserve+入队同事务)
 *   → POST /interview/:id/abandon(200 saga release 退还嘴·E1 语义 HTTP 面) → GET /commerce/entitlement
 *   (200 额度可见·wallet 钉口·净零=种子回补) — N=100 · concurrency=10 · 逐虚拟用户。
 * consent 前置=本链零触点（链上无 /resume 上传·resume 系夹具 INSERT 具名豁免·沿 uc-e2e-017-orphan-
 * http-sse.proof.ts seedBeginFixture 先例形·非豁免面滥用）·如实申明入收据。
 *
 * 期望(PERF 五值 · 沿 NHP-018-PERF-01/NHP-001-PERF-api-01 同口径): p50≤250ms · p95≤750ms ·
 * p99≤1500ms · max(观测值披露) · error_rate≤0.5% + 收据四件套。EXIT=0 仅当全部 3 runs 五值达标+caps enforced。
 *
 * 读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零 drain(begin 仅入队零 worker·job 滞队) ·
 * actualSpendCny=null · EXIT0=case≠covered · Ban 借本收据宣 NHP-PERF-API-SUITE 闭合(实例≠伞) ·
 * Ban 与既有 refund-callback 负路径 LOAD 收据互洗（两收据形状不同·互不替代·case-matrix 两行各自独立）。
 *
 * wrapper 落位钉: 子进程 wrapper 不落 tracked scripts/ — 经 runner isolatedCommand 运行时内联源生成·
 * 收据源与 caps evidence 落 .tmp/uc011-perf-api-receipts/(沿 uc001/uc018 .tmp 先例)。
 *
 * Live-key isolation(uc025 bound-isolated R6 同形): in-process 先 delete MODEL_API_KEY/MODEL_BASE_URL
 * 再断言 unset。零 provider egress · est live=0。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 ·
 * PG-retained · PERF_api blind 保持(收据入账·措辞 case-only 保留) · EXIT0=case≠covered · ⛔push
 *
 *   pnpm uc011:nhp-perf-api:prove
 *   pnpm -C apps/api prove:uc011-nhp-perf-api   (raw; needs isolated env + caps child)
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { boot } from './_neg-harness';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const RAW_DIR = join(ROOT, '.tmp/uc011-perf-api-receipts');
const CAPS_PATH = join(RAW_DIR, '_caps-evidence.json');
const REQUEST_TIMEOUT_MS = 10_000;
const WARMUP = 10;
const REPEAT_RUNS = 3;
const PERF = { N: 100, c: 10, p50: 250, p95: 750, p99: 1500, errMax: 0.005 };
const SEED_UNITS = 3;
const OWNER_PREFIX = 'nhp011p_';

mkdirSync(RAW_DIR, { recursive: true });

const CMD = 'pnpm uc011:nhp-perf-api:prove';
const CASE_ID = 'NHP-011-PERF-api-01';
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
  console.log(`UC-E2E-011 ${CASE_ID} PERF_api 分面执行收据 (uc001 先例形 · nearest-rank · caps Docker 2cpu/4GiB)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零 drain · EXIT0=case≠covered · actualSpendCny=null');
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

  // ── begin 链夹具前置（additive-only · 沿 uc-e2e-017-orphan-http-sse.proof.ts applyBeginChainPreamble 形制·
  //    真相=迁移链 0064/0049/0142 · ≠ 迁移 covered）。boot() :111-126/:212-225 已内置 0058 镜像=隐私触点承载（可免装注记）。
  await pool.query('ALTER TABLE interview ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint');
  await pool.query(`
ALTER TABLE interview_job ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;
ALTER TABLE interview_job ALTER COLUMN reference_schema_version SET DEFAULT 64;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_check;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_chk;
ALTER TABLE interview_job ADD CONSTRAINT interview_job_reference_schema_version_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version IN (49, 50, 64));
`);
  await pool.query('ALTER TABLE interview ADD COLUMN IF NOT EXISTS application_attempt int');
  await pool.query(`
ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_binding_complete;
ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
  CHECK (
    (application_id IS NULL AND job_id IS NULL)
    OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL)
  );
`);
  // 0049 绑定语义重放（真相=迁移链最终形 0049 宽松体·bind-once）：boot 世界最终触发器=0046 严形
  // （boot 在 sql/22 后加载 0046·resume_id 一律拒）→ begin 绑定 UPDATE 被拒（attempt 红留痕）。
  // 0049 于迁移链中后于 0049 覆写为「恰一次 NULL→ingested 绑定放行」·此处按迁移链终态重放。
  await pool.query(`
CREATE OR REPLACE FUNCTION enforce_interview_application_binding_immutable()
RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN
  IF NEW.application_id IS DISTINCT FROM OLD.application_id
     OR NEW.job_id IS DISTINCT FROM OLD.job_id
     OR NEW.application_attempt IS DISTINCT FROM OLD.application_attempt THEN
    RAISE EXCEPTION 'interview_application_binding_immutable';
  END IF;
  IF NEW.resume_id IS DISTINCT FROM OLD.resume_id THEN
    IF OLD.application_id IS NULL
       AND NEW.application_id IS NULL
       AND OLD.resume_id IS NULL
       AND NEW.resume_id IS NOT NULL
       AND OLD.status='created' THEN
      PERFORM 1 FROM resume r
       WHERE r.id=NEW.resume_id
         AND r.owner_user_id=NEW.owner_user_id
         AND r.status='ingested';
      IF NOT FOUND THEN
        RAISE EXCEPTION 'interview_resume_reference_requires_owned_ingested_resume';
      END IF;
    ELSE
      RAISE EXCEPTION 'interview_application_binding_immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$fn$;
DROP TRIGGER IF EXISTS trg_interview_application_binding_immutable ON interview;
CREATE TRIGGER trg_interview_application_binding_immutable
BEFORE UPDATE OF application_id,application_attempt,job_id,resume_id ON interview
FOR EACH ROW EXECUTE FUNCTION enforce_interview_application_binding_immutable();
`);
  await pool.query(readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0142_candidate_profile_route.sql', import.meta.url)), 'utf8'));
  // 0206 读分层 ACL 重放（夹具面·真相=迁移链 0206·uc001 :137 0121 重放同款教训）：harness sql/01 重建
  // app_role 会抹迁移链函数 EXECUTE ACL（旧 OID 失效）→ create() 复用查询 interview_privacy_active_read
  // 42501。REVOKE PUBLIC+GRANT app_role 按 0206 原样重放；active/assert 两镜沿 trial-grant ① GRANT 块形。
  await pool.query(`
REVOKE ALL ON FUNCTION interview_privacy_active_read(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_privacy_active_read(text) TO app_role;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
  console.log('PIN   NHP-011-PERF-API-BEGIN-FIXTURE-PREAMBLE: 0064/0049/0142 additive 夹具补齐（真相=迁移链·≠ 迁移 covered）');
  console.log('PIN   NHP-011-PERF-API-0206-ACL-REPLAY: harness 面函数 ACL 重放(app_role·真相=迁移链 0206·sql/01 角色重建抹 ACL 教训承登)');

  const S = Date.now().toString(36).toUpperCase();
  const sha = gitSha();

  const virtualUsers = (run: number): string[] =>
    Array.from({ length: PERF.N + WARMUP }, (_, i) => `${OWNER_PREFIX}${S}_r${run}u${i}`);

  /** route decision/snapshot 预供给（RLS 会话内·沿 uc017 seedBeginFixture 形制·幂等回读臂供给）。 */
  const routeFixture = async (owner: string, interviewId: string, resumeId: string, contentSha: string) => {
    const cli = await pool.connect();
    try {
      await cli.query('BEGIN');
      await cli.query(`SET app.principal_user='${owner}'`);
      await cli.query(
        `INSERT INTO candidate_profile_route_decision(id,interview_id,owner_user_id,resume_id,resume_content_sha,input_digest,taxonomy_version,policy_version,route_outcome,attempt_outcome,leaf_track_id,allocation_bps,decision_hash)
         VALUES ($1,$2,$3,$4,$5,$5,'v1','policy-nhp011-perf','route_decided','rule_decided','backend',10000,$5) ON CONFLICT (interview_id) DO NOTHING`,
        [`nhp011cprd-${interviewId}`, interviewId, owner, resumeId, contentSha],
      );
      await cli.query(
        `INSERT INTO candidate_profile_route_snapshot(interview_id,candidate_user_id,decision_id,resume_content_sha,input_digest,taxonomy_version,leaf_track_id,allocation_bps,status)
         VALUES ($1,$2,$3,$4,$4,'v1','backend',10000,'interview_snapshotted') ON CONFLICT (interview_id) DO NOTHING`,
        [interviewId, owner, `nhp011cprd-${interviewId}`, contentSha],
      );
      await cli.query('COMMIT');
    } finally {
      cli.release();
    }
  };

  /** 测量窗外 prep（不计入分位）: POST /interview 产品嘴 create → resume 夹具 INSERT(具名豁免) →
   *  route decision/snapshot 预供给 → 桶种子(豁免①具名·begin 预算 1.0/场·abandon 回补)。 */
  const prepUser = async (principal: string) => {
    const c = await h.post('/interview', h.U(principal), {});
    if (c.status !== 200 || typeof c.body?.interviewId !== 'string' || c.body?.reused === true) {
      throw new Error(`interview_create_failed:${principal}:${c.status}`);
    }
    const interviewId = String(c.body.interviewId);
    const resumeId = randomUUID();
    const contentSha = Buffer.from(`nhp011-perf-${principal}`).toString('hex').padEnd(64, '0').slice(0, 64);
    await pool.query(
      "INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind,privacy_epoch) VALUES ($1,$2,'ingested',$3,'text',1) ON CONFLICT DO NOTHING",
      [resumeId, principal, contentSha],
    );
    await routeFixture(principal, interviewId, resumeId, contentSha);
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1, 'paid', $2, now() + interval '300 days')`,
      [principal, SEED_UNITS],
    );
    return { interviewId, resumeId };
  };

  type Sample = { ok: boolean; timedOut: boolean; latencyMs: number; error?: string };
  const chain = async (principal: string, interviewId: string, resumeId: string): Promise<Sample> => {
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
      // ① begin 主链嘴: 202 扣额预留（typed 绑定+route 回读+reserve+入队 同事务·keyless）
      await step('begin', h.post(`/interview/${interviewId}/begin`, { ...h.U(principal), 'resume-id': resumeId }, {}),
        202, (b) => b?.accepted === true && typeof b?.jobId === 'string' && b?.alreadyBegun !== true);
      // ② saga release 退还嘴(E1 语义 HTTP 面): 200 released
      await step('abandon', h.post(`/interview/${interviewId}/abandon`, h.U(principal), {}),
        200, (b) => b?.abandoned === true && b?.released === 'released');
      // ③ 额度可见嘴(wallet 钉口): 200 净零(回补=种子)
      await step('entitlement', h.req('GET', '/commerce/entitlement', h.U(principal)),
        200, (b) => typeof b?.availableUnits === 'number' && Math.abs(b.availableUnits - SEED_UNITS) < 1e-9);
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
    // 测量窗外: create(产品嘴)+resume/route 夹具+桶种子 — 不计入分位。interviewId/resumeId 由 prep 直回传
    // （resume 绑定发生于 begin 事务内·prep 阶段不可 DB 回读）。
    const preps = new Map<string, { interviewId: string; resumeId: string }>();
    await mapPool(users, PERF.c, async (u) => {
      preps.set(u, await prepUser(u));
    });
    // 独立 warmup 用户(warmup 10 excluded): 其样本不计入分位(uc018/uc001 warmup 形同构)。
    const warmupUsers = users.slice(0, WARMUP);
    const measuredUsers = users.slice(WARMUP);
    for (const u of warmupUsers) {
      const p = preps.get(u)!;
      await chain(u, p.interviewId, p.resumeId);
    }

    const samples = await mapPool(measuredUsers, PERF.c, (u) => {
      const p = preps.get(u);
      if (!p) return Promise.resolve({ ok: false, timedOut: false, latencyMs: 0, error: `prep_missing:${u}` });
      return chain(u, p.interviewId, p.resumeId);
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

  // ── N: 零模型零 drain + 钱净账(release 回补·零悬账)静检 ──
  {
    const expectJobs = REPEAT_RUNS * (PERF.N + WARMUP);
    const qj = Number((await pool.query(
      `SELECT count(*)::int AS n FROM interview_job WHERE kind='start' AND owner_user_id LIKE $1`, [`${OWNER_PREFIX.replace('_', '\\_')}%`])).rows[0]?.n ?? 0);
    A('N', `job 滞队零 drain(interview_job start=${qj} 恰 ${expectJobs} · 零 worker 消费)`, qj === expectJobs);
    const rel = Number((await pool.query(
      `SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id LIKE $1 AND status='released'`, [`${OWNER_PREFIX.replace('_', '\\_')}%`])).rows[0]?.n ?? 0);
    const nonRel = Number((await pool.query(
      `SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id LIKE $1 AND status<>'released'`, [`${OWNER_PREFIX.replace('_', '\\_')}%`])).rows[0]?.n ?? 0);
    A('N', `钱净账(released=${rel} 恰 ${expectJobs}·非终态 0 · begin→abandon 预留全回补零悬账)`, rel === expectJobs && nonRel === 0);
    const inv = Number((await pool.query('SELECT count(*)::int AS n FROM ai_model_invocation')).rows[0]?.n ?? 0);
    A('N', '零模型调用(ai_model_invocation 行 0 · keyless 主链零外呼)', inv === 0);
  }

  // ── SEED 豁免具名 ──
  {
    const seeds = Number((await pool.query(
      `SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id LIKE $1 AND kind='paid'`, [`${OWNER_PREFIX.replace('_', '\\_')}%`])).rows[0]?.n ?? 0);
    A('SEED', `桶种子=豁免①具名(${seeds} 桶·恰 (N+warmup)×runs=${REPEAT_RUNS * (PERF.N + WARMUP)}·预算面非产品路径绕行·逐项申明入收据)`,
      seeds === REPEAT_RUNS * (PERF.N + WARMUP));
  }

  // ── 收据四件套 ──
  const receipt = {
    caseId: CASE_ID,
    derivedUc: 'UC-E2E-011',
    chainShape: 'begin 主链(钱生命周期): POST /interview/:id/begin(202 预留) → POST /interview/:id/abandon(200 退还) → GET /commerce/entitlement(200 净零可见); 窗外 prep=POST /interview create+resume 夹具+route 预供给+桶种子',
    consentTouchpoint: 'none(链上无 /resume 上传·resume=夹具 INSERT 具名豁免·沿 uc017 seedBeginFixture 先例形·如实申明)',
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
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + capped child(2cpu/4GiB) + real PG · begin 主链嘴(预留→退还→可见) · consent 零触点(夹具具名申明) · 豁免=桶种子具名 · 零模型零 drain');
  }
  console.log('ROW_STILL_CASE_ONLY  UC-E2E-011 PERF_api blind 保持(收据入账·case-only 措辞保留·行旗权归协调方). coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban 借本收据宣 NHP-PERF-API-SUITE 闭合(实例≠伞) · Ban 与 refund-callback 负路径 LOAD 收据互洗 · post dual still required · actualSpendCny=null');
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
