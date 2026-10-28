/**
 * UC-E2E-033 · PERF_api 分面执行收据 · NHP-033-PERF-api-01（合法用户 begin 链延迟分位·X10≠SLO 残格刀）
 * (REQUEST ai-docs/delivery/harness/uc33p-REQUEST.md §1.4 · 矩阵 §1.0.2 :152 UC-E2E-033 PERF_api 格
 *  gap（X10≠SLO）认领 cell · case-matrix §1.4 NHP-033-FAULT-01 行后 additive 新行 · 格值 gap 保持零翻面 ·
 *  措辞 case-only 保留 · 收据入账 · 翻面权归协调方)
 *
 * 先例形（PERF_api 家族 · 沿形零触先例文件）:
 *   uc-e2e-001-nhp-perf-api.proof.ts（R6 live-key self-delete + consent 产品路径 + 桶种子豁免① 3.0 形 +
 *   zero-drain 静检）· uc-e2e-011-nhp-perf-api.proof.ts（boot 世界 begin 主链 preamble：0064/0049 绑定
 *   触发器终态形 + 0142 重放 + 0206/0058 twin ACL GRANT）· uc-e2e-015-nhp-perf-api.proof.ts rev r2
 *   （timeout 10s 硬顶：proof-local fetch signal 直入 fetch init + wrapper 级 wall-cap race 兜底 —
 *   uc001 :160-167 aborted 检于 await 后的悬挂缝不复发）。
 * 世界钉（dual r1 P2-1）: X33-ADV（uc-e2e-033-nhp-adv.proof.ts）=pre-migrate 世界·本刀=boot 世界·
 *   两刀世界不同·夹具形跨世界借用 boot 世界先例（uc011 preamble + uc015 resume 产品路径 + 0121 为
 *   机制锚）·X33-ADV 仅取形不取世界。本 proof **不入 runner pre-migrate 名单**（boot 世界·零迁移链
 *   先行·沿 #157 三先例 world 选择承登注记同族）。
 *
 * 主链嘴（测量窗冻结·合法用户 begin 链同步面·**链计分位：一次 hrtime 样本覆盖全链**）:
 *   [窗外 prep 四件·不计入分位] ①POST /privacy/consent（产品路径·purpose='resume_processing'·逐虚拟
 *   用户）→ ②POST /resume（产品路径·text 唯一后缀防 dedup 混叠·真实 blob 加密行使·consent 门被真实
 *   行使）→ ③POST /interview（产品嘴 create·reused=false 断言）→ ④桶种子（豁免①具名 INSERT paid 3.0）
 *   [测量窗] ①POST /interview/:id/begin（202 accepted===true && jobId string && alreadyBegun!==true —
 *   绑定+route 供给（supplyCandidateProfileRoute 真实 classify 面·产品 resume 解密原文零模型）+reserve
 *   1.0+入队 同事务）→ ②GET /commerce/entitlement（200·|availableUnits−2.0|<1e-9 预留可见读回 = 种子
 *   3.0−预留 1.0）——残队形（零 abandon·job 滞队）·N=100 · c=10 · 逐虚拟用户。
 *
 * 背压闸披露: MAX_INTERVIEW_PER_OWNER_QUEUED=3（interview-jobs.ts:25）——每虚拟用户恰 1 begin →
 *   per-owner queued depth=1≤3 · 429 interview_queue_saturated 不触发（如实注记·防误判授权红）。
 *
 * 参数冻结（nearest-rank · client hrtime · **timeout 10s=error 硬顶** · warmup 10 excluded ·
 *   3 repeat runs all-must-pass）: p50≤250ms · p95≤750ms · p99≤1500ms · max(观测值披露) ·
 *   error_rate≤0.5% + 收据四件套。逐 run 全新用户命名家族形 ${OWNER_PREFIX}${S}_r${run}u${i}。
 * EXIT=0 仅当全部 3 runs 五值达标 + caps enforced。Ban post-hoc retune · Ban retry-to-green。
 *
 * 读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零 drain（begin 仅入队零 worker·job 滞队
 *   status='queued' 恰数）· actualSpendCny=null · EXIT0=case≠covered ·
 *   Ban 借本收据宣 NHP-PERF-API-SUITE 闭合（实例≠伞）· Ban 与 NHP-033-BOUND-01 X10 burst 收据互洗
 *   （X10=16 并行越权 GET 拒绝面·本收据=合法用户 begin 链延迟分位·两形状互不替代·反向同禁：
 *   Ban 借 X10 burst 收据宣本 PERF 已证）· Ban 与 NHP-033-ADV-01 写竞态收据互洗（并臂竞态格≠延迟
 *   分位）· Ban 与 NHP-011-PERF-api-01 收据互洗（净零循环≠残队形）。
 *
 * wrapper 落位钉: 子进程 wrapper 不落 tracked scripts/ — 经 runner isolatedCommand 运行时内联源生成
 *   （PERF_API_CAPS_CHILD_SRC('uc033', …) 参数化复用·零触既有五 const）· 收据源与 caps evidence 落
 *   .tmp/uc033-perf-api-receipts/（沿 uc001/uc011/uc015 .tmp 先例）· tracked gate stdout log=
 *   ai-docs/delivery/receipts/nhp-033-perf-api/。
 *
 * Live-key isolation（uc001 R6 同形）: in-process 先 delete MODEL_API_KEY/MODEL_BASE_URL 再断言 unset。
 *   零 provider egress · est live=0 · ai_model_invocation=0 硬断言随 proof。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 ·
 *   PG-retained · PERF_api gap 保持（收据入账·case-only 措辞保留·格值零翻面）· EXIT0=case≠covered · ⛔push
 *
 *   pnpm uc033:nhp-perf-api:prove
 *   pnpm -C apps/api prove:uc033-nhp-perf-api   (raw; needs isolated env + caps child)
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { boot } from './_neg-harness';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const RAW_DIR = join(ROOT, '.tmp/uc033-perf-api-receipts');
const CAPS_PATH = join(RAW_DIR, '_caps-evidence.json');
const REQUEST_TIMEOUT_MS = 10_000;
const WARMUP = 10;
const REPEAT_RUNS = 3;
// 零 lint 增量形(uc015 rev r2 同形): 线格式键名经常量/computed-key 承载·JSON/HTTP 字节恒等。
const PERF = { n: 100, c: 10, p50: 250, p95: 750, p99: 1500, errMax: 0.005 };
const CONTENT_TYPE_HEADER = 'content-type';
const RESUME_ID_HEADER = 'resume-id';
const N_KEY = 'N';
const C_KEY = 'c';
const SEED_UNITS = 3.0;
const EXPECTED_AVAILABLE_UNITS = 2.0; // 种子 3.0 − begin 预留 1.0 = 预留可见读回 2.0
const OWNER_PREFIX = 'nhp033p_';

mkdirSync(RAW_DIR, { recursive: true });

const CMD = 'pnpm uc033:nhp-perf-api:prove';
const CASE_ID = 'NHP-033-PERF-api-01';
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
  console.log(`UC-E2E-033 ${CASE_ID} PERF_api 分面执行收据 (boot 世界·uc011 begin 主链先例形+uc015 timeout 硬顶修正形·nearest-rank · caps Docker 2cpu/4GiB)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('读法钉: 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA · 零模型零 drain · EXIT0=case≠covered · actualSpendCny=null');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green · 负载参数冻结 ${N_KEY}=${PERF.n} ${C_KEY}=${PERF.c} warmup=${WARMUP}(excluded) runs=${REPEAT_RUNS}\n`);

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

  // 0121 真迁移链重放（夹具面·REVOKE+GRANT 幂等·真相=迁移链·uc001 :134-139 同形）: harness sql/01
  // 重建 app_role 会抹 pgp_sym_encrypt EXECUTE ACL — 逐虚拟用户 POST /resume 产品路径全链（blob 加密）
  // 行使所需。零产品码触·零新迁移。
  const mig0121 = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0121_resume_pgcrypto_runtime_acl.sql', import.meta.url)), 'utf8');
  await pool.query(mig0121);
  console.log('PIN   NHP-033-PERF-API-ISO-0121-REPLAY: harness 面迁移链重放(pgp ACL·真相=迁移链 migrate 全链)');

  // ── begin 链夹具前置（boot 世界·uc011 preamble 同形·additive-only·真相=迁移链 0064/0049/0142·
  //    ≠ 迁移 covered）。boot() 已内置 0058 镜像=隐私触点承载（函数体由 boot 新立=零 definer 断供面）。
  await pool.query(`
ALTER TABLE interview
  ADD COLUMN IF NOT EXISTS resume_id uuid,
  ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
  ADD COLUMN IF NOT EXISTS application_id text,
  ADD COLUMN IF NOT EXISTS application_attempt int,
  ADD COLUMN IF NOT EXISTS job_id text
`);
  await pool.query(`
ALTER TABLE interview_job ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;
ALTER TABLE interview_job ALTER COLUMN reference_schema_version SET DEFAULT 64;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_check;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_chk;
ALTER TABLE interview_job ADD CONSTRAINT interview_job_reference_schema_version_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version IN (49, 50, 64));
`);
  await pool.query(`
ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_binding_complete;
ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
  CHECK (
    (application_id IS NULL AND job_id IS NULL)
    OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL)
  );
`);
  // 0049 绑定语义重放（真相=迁移链最终形 0049 宽松体·bind-once）：boot 世界最终触发器=0046 严形
  // （boot 在 sql/22 后加载 0046·resume_id 一律拒）→ begin 绑定 UPDATE 被拒（attempt 红留痕教训）。
  // 0049 于迁移链中后于 0046 覆写为「恰一次 NULL→ingested 绑定放行」·此处按迁移链终态重放。
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
  // 0142 candidate-profile route 两表（真实迁移文件重放·begin 供给面 supplyCandidateProfileRoute 直查
  // ·真实 classify 面所需·uc011 :193 同形）。
  await pool.query(readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0142_candidate_profile_route.sql', import.meta.url)), 'utf8'));
  // 0206/0058 twin ACL 重放（夹具面·真相=迁移链·uc011 :197-202 同形）：boot 镜像函数体已由 boot()
  // 新立（零 definer 断供面）·本块仅承载 app_role EXECUTE 执行面（harness 镜像无 GRANT 行）。
  await pool.query(`
REVOKE ALL ON FUNCTION interview_privacy_active_read(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_privacy_active_read(text) TO app_role;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
  console.log('PIN   NHP-033-PERF-API-BEGIN-FIXTURE-PREAMBLE: 0064/0049/0142 additive 夹具补齐（真相=迁移链·≠ 迁移 covered）');
  console.log('PIN   NHP-033-PERF-API-0206-0058-ACL-REPLAY: harness 面函数 ACL 重放(app_role 执行面·真相=迁移链 0206/0058·boot 世界函数体由 boot 新立)');

  const S = Date.now().toString(36).toUpperCase();
  const sha = gitSha();

  // ── 窗外 prep（逐虚拟用户·不计入分位）: ①consent（产品路径）②resume（产品路径·真实 blob 加密
  //    +consent 门真实行使）③interview 壳（产品嘴 create·reused=false）④桶种子（豁免①具名 paid 3.0）。 ──
  const virtualUsers = (run: number): string[] =>
    Array.from({ length: PERF.n + WARMUP }, (_, i) => `${OWNER_PREFIX}${S}_r${run}u${i}`);
  const prepUser = async (principal: string): Promise<{ interviewId: string; resumeId: string }> => {
    const cc = await h.post('/privacy/consent', h.U(principal), { purpose: 'resume_processing' });
    if (cc.status !== 200) throw new Error(`consent_failed:${principal}:${cc.status}`);
    const up = await h.post('/resume', h.U(principal), {
      text: `NHP033 PERF golden-path resume ${principal} — senior backend engineer, Go/Kubernetes/Postgres, distributed systems ${Math.random().toString(36).slice(2)}`,
    });
    if (up.status !== 200 || up.body?.status !== 'ingested' || typeof up.body?.resumeId !== 'string') {
      throw new Error(`resume_upload_failed:${principal}:${up.status}:${JSON.stringify(up.body).slice(0, 120)}`);
    }
    const resumeId = String(up.body.resumeId);
    const ci = await h.post('/interview', h.U(principal), {});
    if (ci.status !== 200 || typeof ci.body?.interviewId !== 'string' || ci.body?.reused === true) {
      throw new Error(`interview_create_failed:${principal}:${ci.status}`);
    }
    // 豁免①(§5 枚举具名·uc001 :149-154 先例形): 虚拟用户桶种子 — begin 预留 1.0 预算。
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1, 'paid', $2, now() + interval '300 days')`,
      [principal, SEED_UNITS],
    );
    return { interviewId: String(ci.body.interviewId), resumeId };
  };

  type Sample = { ok: boolean; timedOut: boolean; latencyMs: number; error?: string };
  // timeout 10s 硬顶(rev r2 承登形): proof-local fetch 直入 AbortSignal(`signal` 直入 fetch init)+
  // wall-cap race 兜底 —— _neg-harness post/send/req 无 signal 形参不可达·uc001 :160-167
  // `aborted` 检于 `await` 后的悬挂缝不复发。**链计分位: t0 一次 hrtime 样本覆盖 begin→entitlement 全链。**
  const chain = async (principal: string, interviewId: string, resumeId: string): Promise<Sample> => {
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
      // ① begin 主链嘴: 202 受理（绑定+route 供给真实 classify+reserve 1.0+入队 同事务·keyless 零外呼）
      const bg = await call('POST', `/interview/${interviewId}/begin`, { ...h.U(principal), [RESUME_ID_HEADER]: resumeId }, {});
      if (ac.signal.aborted) throw Object.assign(new Error('timeout'), { timedOut: true });
      if (bg.status !== 202 || bg.body?.accepted !== true || typeof bg.body?.jobId !== 'string' || bg.body?.alreadyBegun === true) {
        throw new Error(`begin_http_${bg.status}:${JSON.stringify(bg.body).slice(0, 120)}`);
      }
      // ② 预留可见读回嘴(wallet 钉口): 200 availableUnits=种子 3.0−预留 1.0=2.0（|x−2.0|<1e-9）
      const ent = await call('GET', '/commerce/entitlement', h.U(principal));
      if (ac.signal.aborted) throw Object.assign(new Error('timeout'), { timedOut: true });
      if (ent.status !== 200 || typeof ent.body?.availableUnits !== 'number'
        || Math.abs((ent.body.availableUnits as number) - EXPECTED_AVAILABLE_UNITS) >= 1e-9) {
        throw new Error(`entitlement_http_${ent.status}:${JSON.stringify(ent.body).slice(0, 120)}`);
      }
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
    // 测量窗外: consent/resume/interview create（产品路径全链）+桶种子（豁免①具名）— 不计入分位。
    const preps = new Map<string, { interviewId: string; resumeId: string }>();
    await mapPool(users, PERF.c, async (u) => {
      preps.set(u, await prepUser(u));
    });
    // 独立 warmup 用户(warmup 10 excluded): users 头 10 个先行行使·其样本不计入分位(uc001/uc011/uc015 同构)。
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
    console.log(`PERF_RUN  run=${run} ${N_KEY}=${PERF.n} ${C_KEY}=${PERF.c} p50=${p50?.toFixed(1)}ms p95=${p95?.toFixed(1)}ms p99=${p99?.toFixed(1)}ms max=${maxMs?.toFixed(1)}ms error_rate=${errorRate} timeout=${timeoutCount} passed=${stat.passed}${missReasons.length ? ` miss=${missReasons.join(';')}` : ''}`);
    if (errorCount > 0) {
      for (const s of samples) if (!s.ok) console.log(`PERF_ERROR_DETAIL  run=${run} ${s.error}`);
    }
  }

  // ── PERF 五值断言(3 runs all-must-pass·家族同口径) ──
  A('PERF', '全部 3 runs p50 ≤ 250ms', runStats.every((r) => r.p50 != null && r.p50 <= PERF.p50));
  A('PERF', '全部 3 runs p95 ≤ 750ms', runStats.every((r) => r.p95 != null && r.p95 <= PERF.p95));
  A('PERF', '全部 3 runs p99 ≤ 1500ms', runStats.every((r) => r.p99 != null && r.p99 <= PERF.p99));
  A('PERF', '全部 3 runs error_rate ≤ 0.5%', runStats.every((r) => r.errorRate <= PERF.errMax));
  A('PERF', 'PERF 五值收据齐(p50/p95/p99/max/error_rate 逐 run 在卷·零空值)',
    runStats.every((r) => r.p50 != null && r.p95 != null && r.p99 != null && r.maxMs != null && r.errorRate != null));

  // ── N: 零模型零 drain 静检（status='queued' 限定恰数承载滞队义·PERF2 rev r1 修正形·bare count 不承载）──
  {
    const expectJobs = REPEAT_RUNS * (PERF.n + WARMUP);
    const qj = Number((await pool.query(
      `SELECT count(*)::int AS n FROM interview_job WHERE kind='start' AND status='queued' AND owner_user_id LIKE $1`,
      [`${OWNER_PREFIX.replace('_', '\\_')}%`],
    )).rows[0]?.n ?? 0);
    A('N', `job 滞队零 drain(interview_job kind='start' status='queued'=${qj} 恰 ${expectJobs} · 零 worker 消费·残队形)`, qj === expectJobs);
    const inv = Number((await pool.query('SELECT count(*)::int AS n FROM ai_model_invocation')).rows[0]?.n ?? 0);
    A('N', '零模型调用(ai_model_invocation 行 0 · keyless 主链零外呼)', inv === 0);
  }

  // ── 收据四件套(CMD+EXIT+负载参数冻结+.tmp 路径 · tracked=gate stdout log) ──
  const receipt = {
    caseId: CASE_ID,
    derivedUc: 'UC-E2E-033',
    facetClaim: 'coverage-matrix §1.0.2 :152 UC-E2E-033 PERF_api 格 gap（X10≠SLO）· 格值 gap 保持零翻面 · EXIT0=case≠covered',
    chainShape: '合法用户 begin 链(残队形): POST /interview/:id/begin(202 accepted+jobId+alreadyBegun!==true·绑定+route 供给真实 classify+reserve 1.0+入队 同事务) → GET /commerce/entitlement(200 |availableUnits−2.0|<1e-9 预留可见); 窗外 prep 四件=consent/resume/interview create 产品路径+桶种子豁免① paid 3.0',
    worldPin: 'boot 世界(X33-ADV=pre-migrate 世界·两刀世界不同·夹具形跨世界借用 boot 世界先例 uc011 preamble/uc015 resume+0121 机制锚·X33-ADV 仅取形不取世界)·pre-migrate 名单零注册',
    backpressureGate: 'MAX_INTERVIEW_PER_OWNER_QUEUED=3·每虚拟用户恰 1 begin=per-owner queued depth 1≤3·429 interview_queue_saturated 不触发(如实注记)',
    consentTouchpoint: 'product-path POST /privacy/consent 逐虚拟用户(测量窗外·门=resume.service purpose 全局存在性谓词·Ban 申明 per-user 隔离·PERF2 §1.2 rev r1 OBS 同族承登)',
    cmd: CMD,
    attemptStart: ATTEMPT_STARTED_AT,
    attemptEnd: new Date().toISOString(),
    gitSha: sha,
    loadParamsFrozen: { n: PERF.n, c: PERF.c, warmup: WARMUP, repeatRuns: REPEAT_RUNS, timeoutMs: REQUEST_TIMEOUT_MS, method: 'nearest-rank client-hrtime chain-level(one hrtime sample per full chain)', percentiles: ['p50', 'p95', 'p99', 'max', 'error_rate'] },
    namingFamily: `${OWNER_PREFIX}\${S}_r\${run}u\${i}(逐 run 全新用户)`,
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
    pins: 'haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · PG-retained · actualSpendCny=null · EXIT0=case≠covered · PERF_api 格值 gap 保持',
  };
  const redact = (s: string) => s
    .replace(/postgres(ql)?:\/\/[^"'\s]+/gi, '[redacted-dsn]')
    .replace(/meetwise_dev_password/gi, '[redacted]');
  writeFileSync(join(RAW_DIR, 'perf-receipt.json'), `${redact(JSON.stringify(receipt, null, 2))}\n`);
  console.log(`RECEIPT  raw=${join(RAW_DIR, 'perf-receipt.json')} · caps=${CAPS_PATH} · tracked=ai-docs/delivery/receipts/nhp-033-perf-api/(gate stdout log·四件套内嵌)`);

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${CASE_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log(`PASS  ${CASE_ID}  PERF_api 分面执行收据·合法用户 begin 链延迟分位形 (${N_KEY}=${PERF.n} ${C_KEY}=${PERF.c} runs=${REPEAT_RUNS} · caps enforced)`);
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + capped child(2cpu/4GiB) + real PG · begin 链嘴(202 预留→entitlement 预留可见) · consent/resume/interview 产品路径全链 · route 供给=begin 事务内真实 classify(零模型) · 豁免=桶种子具名 · 零模型零 drain(status=queued 恰数) · 背压闸 depth 1≤3 无 429');
  }
  console.log('ROW_STILL_CASE_ONLY  UC-E2E-033 PERF_api gap 保持(收据入账·case-only 措辞保留·格值零翻面·翻面权归协调方). coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban 借本收据宣 NHP-PERF-API-SUITE 闭合(实例≠伞) · Ban 与 X10 burst/NHP-033-ADV-01/NHP-011-PERF-api-01 收据互洗 · post dual still required · actualSpendCny=null');
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
