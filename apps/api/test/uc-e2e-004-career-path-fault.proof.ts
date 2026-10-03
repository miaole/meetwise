/**
 * UC-E2E-004 — career-path FAULT real evidence（GAP-UC004-FAIL-A3 / NHP-004-FAULT-01）
 *
 * 可复现故障注入 prove（运行时，非静态 mark-red）：
 *   FI-1 连接断   — 锁占位 career_path + pg_terminate_backend 杀掉正在执行 INSERT 的后端
 *   FI-2 依赖超时 — 锁占位 career_path，让 INSERT 被**产品自身池配置** statement_timeout=15000ms
 *                   （packages/db/src/principal.ts createPool）中止（SQLSTATE 57014，与
 *                   lock/statement timeout 同类同码），非外部 cancel 伪造
 *   FI-3 图失败   — 尝试构造 AiGraphRun(career-path) active→failed 注入点；本树无接线 →
 *                   诚实不可达（file:line 证据），Ban 伪造 failed 事件
 *
 * EXIT 契约（harness/gap-uc004-fault-real-evidence.md §EXIT 契约）：
 *   EXIT 0 当且仅当 FI-1 ∧ FI-2 每次 F1(响应可解释)+F2(SQL 直查+HTTP GET 无失败产物)+
 *   F3(额度/计费账本 before/after 实测净变 0) 全成立 且 FI-3 可达并观察到
 *   AiGraphRun=failed+降级+重试+额度不变。
 *   否则 EXIT 1 = 诚实保留 gap（Ban invent fix · Ban 把 EXIT1 记成 flake）。
 *   EXIT 0/1 均不翻任何 SSOT 行；A3 关闭须 post-prove dual + 协调方授权。
 *
 * 录音拓扑：API 以**子进程**启动（真实 NestJS serve；故障可能杀死它，prove 进程必须独立存活
 * 才能记录证据）。prove 进程自有 superuser 直连池做 SQL 侧证据与注入。
 * attempts 全记录（C-2）：每次注入 one-shot，禁 retry-to-green；中断/失败 attempt 原样入账。
 * F3 实测（C-3）：entitlement_bucket / entitlement_consumption / payment_order 全行
 * before/after 快照对比，净变 0 是**观察结果**，不是 D1 口径假设。
 *
 * releaseEvidence=false · Not HA · 本绿/本 EXIT ≠ UC-E2E-004 covered ≠ A3 closed
 * 与静态 mark-red prove（pnpm uc004:career-path:prove EXIT0）互不替代。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool, assertIsolatedTestTarget } from '@meetwise/db';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(__dirname, '..');
const repoRoot = resolve(apiRoot, '../..');

const U_A = { 'x-user-id': 'userA' };
const STAMP = Date.now().toString(36).toUpperCase();
const IV_CTL = `IV_C2CTL_${STAMP}`;
const IV_FI1 = `IV_C2F1A_${STAMP}`;
const IV_FI2 = `IV_C2F2B_${STAMP}`;

const pool = createPool();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let fail = 0;
function A(name: string, cond: boolean): boolean {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) fail += 1;
  return cond;
}

async function ledgerSnapshot(): Promise<string> {
  const q = async (sql: string) => (await pool.query(sql)).rows;
  const [bucket, consumption, orders] = await Promise.all([
    q(`SELECT id::text, owner_user_id, kind, units_total::text, units_reserved::text,
              units_consumed::text, source_order_id, expires_at::text
         FROM entitlement_bucket ORDER BY id`),
    q('SELECT * FROM entitlement_consumption ORDER BY 1'),
    q(`SELECT id, owner_user_id, product_id, amount_cents::text, units::text, status
         FROM payment_order ORDER BY id`),
  ]);
  return JSON.stringify({ bucket, consumption, orders });
}

async function careerRowCount(interviewId: string): Promise<number> {
  const r = await pool.query('SELECT count(*)::int AS n FROM career_path WHERE interview_id=$1', [interviewId]);
  return r.rows[0].n;
}

async function careerGraphRunCount(): Promise<number> {
  const r = await pool.query("SELECT count(*)::int AS n FROM ai_graph_run WHERE graph_name='career-path'");
  return r.rows[0].n;
}

async function findBlockedInsertPid(): Promise<number | null> {
  const r = await pool.query(
    `SELECT pid FROM pg_stat_activity
      WHERE datname = current_database() AND state = 'active'
        AND wait_event_type = 'Lock'
        AND query ~* 'INSERT\\s+INTO\\s+career_path'
        AND pid <> pg_backend_pid()
      LIMIT 1`,
  );
  return r.rows[0]?.pid ?? null;
}

type HttpOutcome = { kind: 'http'; status: number; body: any } | { kind: 'transport_closed'; code: string };

async function postCareerPath(base: string, interviewId: string): Promise<HttpOutcome> {
  try {
    const res = await fetch(`${base}/interview/${interviewId}/career-path`, {
      method: 'POST', headers: { ...U_A, 'content-type': 'application/json' }, body: '{}',
    });
    return { kind: 'http', status: res.status, body: await res.json().catch(() => ({})) };
  } catch (error: any) {
    return { kind: 'transport_closed', code: String(error?.cause?.code ?? error?.code ?? 'UNKNOWN') };
  }
}

type GetOutcome = { status: number; body: any } | { status: 'unreachable'; body: { reason: string } };

async function getCareerPath(base: string, interviewId: string): Promise<GetOutcome> {
  try {
    const res = await fetch(`${base}/interview/${interviewId}/career-path`, { headers: U_A });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  } catch (error: any) {
    return { status: 'unreachable' as const, body: { reason: String(error?.cause?.code ?? error?.code ?? 'UNKNOWN') } };
  }
}

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = createServer();
    s.once('error', rej);
    s.listen(0, '127.0.0.1', () => {
      const p = (s.address() as any).port as number;
      s.close(() => res(p));
    });
  });
}

interface ApiChild {
  base: string; proc: any; done: Promise<{ code: number | null; signal: string | null }>;
  stderrTail: () => string;
}

async function startApiChild(): Promise<ApiChild> {
  const port = await freePort();
  const env: Record<string, string | undefined> = { ...process.env, PORT: String(port), HOST: '127.0.0.1' };
  // 与 _neg-harness 同款测试配置；Ban 付费模型依赖（career-path 为纯域派生，无模型调用）。
  env.AUTH_DEV_HEADER = '1'; env.AUTH_SECRET = 'test-secret-key';
  env.RESUME_ENC_KEY = 'test-resume-enc-key'; env.RESUME_HASH_SECRET = 'test-resume-hash-secret';
  env.PAY_PROVIDER_SECRET = 'test-pay-secret'; env.OCR_ENABLED = '0';
  if (env.NODE_ENV === 'production') env.NODE_ENV = 'test';   // 本地隔离靶必须走非生产 CORS/DB 守卫
  delete env.MODEL_API_KEY; delete env.MODEL_BASE_URL;
  const child = spawn(process.execPath,
    ['--import', '@swc-node/register/esm-register', 'src/main.ts'],
    { cwd: apiRoot, env: env as NodeJS.ProcessEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  const out: string[] = []; const err: string[] = [];
  const push = (arr: string[]) => (c: any) => { arr.push(String(c)); if (arr.length > 64) arr.shift(); };
  child.stdout.on('data', push(out)); child.stderr.on('data', push(err));
  const done = new Promise<{ code: number | null; signal: string | null }>((res) => {
    child.once('exit', (code, signal) => res({ code, signal }));
  });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`${base}/openapi.json`);
      if (r.status === 200) return { base, proc: child, done, stderrTail: () => err.join('') };
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error(`api_child_not_ready stdout_tail=${out.join('').slice(-600)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('UC-E2E-004 career-path FAULT real evidence prove · releaseEvidence=false · Not HA');
console.log('NOTE: EXIT0 ≠ A3 closed（还须 post-prove dual + 协调方授权）· EXIT1 = 诚实保留 gap · Ban invent fix');
console.log('NOTE: 与静态 mark-red prove（uc004:career-path:prove EXIT0）互不替代 · attempts one-shot · Ban retry-to-green');

// 0) 隔离靶标 attestation（Ban 打非隔离库：本 prove 含 LOCK/terminate 破坏性操作）
await assertIsolatedTestTarget(pool);
console.log('ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified');

// 1) 种子（superuser 直插，BYPASS RLS；与 _neg-harness 同口径）。
// 0059 projection fence 触发器（assessment_report/career_path 等 BEFORE INSERT）按
// app.principal_user 语义校验 —— 种子会话必须先设 GUC（产品 API 路径由 asPrincipal 设置）。
{
  const c = await pool.connect();
  try {
    await c.query(`SELECT set_config('app.principal_user','userA',false)`);
    const dims2 = JSON.stringify([
      { dimension: '分布式锁', score: 40, gap: true, evidence: [] },
      { dimension: '消息队列', score: 35, gap: true, evidence: [] },
    ]);
    await c.query(`INSERT INTO user_account(id,email,password_hash) VALUES ('userA','c2fault-a@x.com','scrypt$x$y') ON CONFLICT DO NOTHING`);
    for (const iv of [IV_CTL, IV_FI1, IV_FI2]) {
      await c.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','completed') ON CONFLICT DO NOTHING`, [iv]);
      await c.query(
        `INSERT INTO assessment_report(id,owner_user_id,interview_id,status,dimensions,overall)
         VALUES ($1,'userA',$2,'ready',$3::jsonb,60) ON CONFLICT DO NOTHING`, [`AR_${iv}`, iv, dims2]);
    }
    await c.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
      SELECT 'userA','paid',5.0, now()+interval '300 days' WHERE NOT EXISTS
      (SELECT 1 FROM entitlement_bucket WHERE owner_user_id='userA' AND kind='paid')`);
    await c.query(`SELECT set_config('app.principal_user','',false)`);
  } finally { c.release(); }
}

// 2) API 子进程（真实 NestJS serve）
const api = await startApiChild();
console.log(`API_CHILD_READY base=${api.base}`);

interface Attempt {
  n: number; id: string; fault: string; exit: 0 | 1; ts: string; detail: string;
  evidence?: Record<string, unknown>;
}
const attempts: Attempt[] = [];
function recordAttempt(a: Omit<Attempt, 'n' | 'ts'>): Attempt {
  const full: Attempt = { ...a, n: attempts.length + 1, ts: new Date().toISOString() };
  attempts.push(full);
  console.log(`ATTEMPT ${full.n} id=${full.id} fault=${full.fault} exit=${full.exit} ts=${full.ts} ${full.detail}`);
  // C-3：F1/F2/F3 全量证据（含账本 before/after 逐行快照）落 stdout → receipt 可原文收录。
  console.log(`EVIDENCE ${full.id} ${JSON.stringify(full.evidence ?? {})}`);
  return full;
}

// ── ATTEMPT 0：无故障对照（证明注入点可达；观察到的故障才可归因于注入本身）──
{
  const before = await ledgerSnapshot();
  const r = await postCareerPath(api.base, IV_CTL);
  const rowCnt = await careerRowCount(IV_CTL);
  const g = await getCareerPath(api.base, IV_CTL);
  const after = await ledgerSnapshot();
  const okPost = r.kind === 'http' && r.status === 200;
  const exit: 0 | 1 =
    (A('CONTROL-0-POST-200', okPost) && A('CONTROL-0-SQL-ROW-1', rowCnt === 1)
      && A('CONTROL-0-GET-200', g.status === 200) && A('CONTROL-0-LEDGER-NET-0', before === after))
      ? 0 : 1;
  recordAttempt({
    id: 'ATTEMPT-0-CONTROL', fault: 'none(positive control)', exit,
    detail: `post=${r.kind === 'http' ? r.status : `transport_closed:${(r as any).code}`} sql_rows=${rowCnt} get=${g.status} ledger_net=${before === after ? 0 : 'CHANGED'}`,
    evidence: { f1: r, f2_get: g, ledger_before: JSON.parse(before), ledger_after: JSON.parse(after) },
  });
}

// ── FI-2 依赖超时：产品自身池 statement_timeout=15000ms 中止被锁阻塞的 INSERT（57014 类）──
{
  const before = await ledgerSnapshot();
  const lock = await pool.connect();
  await lock.query('BEGIN');
  await lock.query('LOCK TABLE career_path IN ACCESS EXCLUSIVE MODE');   // 先持锁，后发请求 → INSERT 必然阻塞
  const t0 = Date.now();
  const pending = postCareerPath(api.base, IV_FI2);
  let pid: number | null = null;
  for (let i = 0; i < 40 && pid === null; i++) { pid = await findBlockedInsertPid(); if (pid === null) await sleep(250); }
  const keepAlive = setInterval(() => { lock.query('SELECT 1').catch(() => undefined); }, 1500);
  const r = await pending;   // ≈15s：产品池 statement_timeout 中止
  const durationMs = Date.now() - t0;
  clearInterval(keepAlive);
  await lock.query('COMMIT').catch(() => undefined); await lock.release();
  const rowCnt = await careerRowCount(IV_FI2);
  const g = await getCareerPath(api.base, IV_FI2);
  const after = await ledgerSnapshot();
  const graphRuns = await careerGraphRunCount();
  const f1ok = A('FI2-F1-HTTP-EXPLAINABLE', r.kind === 'http' && r.status === 500 && (r as any).body?.error === 'internal_error');
  const f2a = A('FI2-F2A-SQL-NO-HALF-WRITE', rowCnt === 0);
  const f2b = A('FI2-F2B-GET-NO-FAILED-PRODUCT', g.status === 404 && (g as any).body?.error === 'not_found');
  const f3 = A('FI2-F3-LEDGER-NET-0', before === after);
  const alive = A('FI2-SERVER-ALIVE-AFTER', (await getCareerPath(api.base, IV_CTL)).status === 200);
  const exit: 0 | 1 = f1ok && f2a && f2b && f3 && alive ? 0 : 1;
  recordAttempt({
    id: 'ATTEMPT-1-FI2-STATEMENT-TIMEOUT', fault: 'FI-2 dependency timeout (pool statement_timeout=15000ms, SQLSTATE 57014 class)', exit,
    detail: `blocked_pid_found=${pid !== null} durationMs=${durationMs} http=${r.kind === 'http' ? r.status : `transport_closed:${(r as any).code}`} body=${r.kind === 'http' ? JSON.stringify((r as any).body) : '-'} sql_rows=${rowCnt} get=${g.status}/${(g as any).body?.error ?? '-'} ledger_net=${before === after ? 0 : 'CHANGED'} server_alive=${alive} graph_run_rows=${graphRuns}`,
    evidence: { blocked_pid_found: pid !== null, durationMs, f1: r, f2_sql_rows: rowCnt, f2_get: g, ledger_before: JSON.parse(before), ledger_after: JSON.parse(after) },
  });
}

// ── FI-1 连接断：pg_terminate_backend 杀掉正在执行 INSERT 的后端（如实记录 API 侧结果）──
{
  const before = await ledgerSnapshot();
  const lock = await pool.connect();
  await lock.query('BEGIN');
  await lock.query('LOCK TABLE career_path IN ACCESS EXCLUSIVE MODE');   // 先持锁，后发请求 → INSERT 必然阻塞
  const pending = postCareerPath(api.base, IV_FI1);
  let pid: number | null = null;
  for (let i = 0; i < 40 && pid === null; i++) { pid = await findBlockedInsertPid(); if (pid === null) await sleep(250); }
  let terminated = false;
  if (pid !== null) {
    const t = await pool.query('SELECT pg_terminate_backend($1) AS ok', [pid]);
    terminated = t.rows[0]?.ok === true;
  }
  const r = await pending;
  const exited = await Promise.race([api.done, sleep(5000).then(() => null)]);
  await lock.query('COMMIT').catch(() => undefined); await lock.release();
  const rowCnt = await careerRowCount(IV_FI1);
  const g = await getCareerPath(api.base, IV_FI1);   // 服务可能已死——如实记录 unreachable
  const after = await ledgerSnapshot();
  const graphRuns = await careerGraphRunCount();
  const f1 = A('FI1-F1-HTTP-EXPLAINABLE', r.kind === 'http' && r.status >= 400 && (r as any).body?.error === 'internal_error');
  const f2a = A('FI1-F2A-SQL-NO-HALF-WRITE', rowCnt === 0);
  const f2b = A('FI1-F2B-GET-NO-FAILED-PRODUCT', g.status === 404 && (g as any).body?.error === 'not_found');
  const f3 = A('FI1-F3-LEDGER-NET-0', before === after);
  const noFake = A('FI1-NO-FAKE-GRAPH-RUN', graphRuns === 0);
  const exit: 0 | 1 = f1 && f2a && f2b && f3 && noFake ? 0 : 1;
  const childState = exited === null ? 'still_running' : `exit_code=${exited.code} signal=${exited.signal}`;
  recordAttempt({
    id: 'ATTEMPT-2-FI1-CONNECTION-BREAK', fault: 'FI-1 connection break (pg_terminate_backend on INSERT backend)', exit,
    detail: `blocked_pid_found=${pid !== null} terminated=${terminated} http=${r.kind === 'http' ? r.status : `transport_closed:${(r as any).code}`} child=${childState} sql_rows=${rowCnt} get=${typeof g.status === 'string' ? `unreachable:${(g as any).body?.reason}` : `${g.status}/${(g as any).body?.error}`} ledger_net=${before === after ? 0 : 'CHANGED'} graph_run_rows=${graphRuns}`,
    evidence: { blocked_pid_found: pid !== null, terminated, f1: r, child_exit: childState, child_stderr_tail: api.stderrTail().slice(-1200), f2_sql_rows: rowCnt, f2_get: g, ledger_before: JSON.parse(before), ledger_after: JSON.parse(after) },
  });
}

// ── FI-3 图失败状态机：尝试构造 AiGraphRun(career-path) active→failed 注入点 ──
{
  const svcRel = 'apps/api/src/modules/interview/interview.service.ts';
  const svcLines = readFileSync(resolve(repoRoot, svcRel), 'utf8').split('\n');
  const genLine = svcLines.findIndex((l) => l.includes('generateCareerPath(principal'));
  const deriveLine = svcLines.findIndex((l) => l.includes('= deriveCareerPath('));
  const region = svcLines.slice(genLine, genLine + 26).join('\n');
  const regionHasGraphWire = /AiGraphRun|dispatchGraph|runGraph|enqueue|worker/i.test(region);
  const idxRel = 'packages/ai-graphs/src/index.ts';
  const idxLines = readFileSync(resolve(repoRoot, idxRel), 'utf8').split('\n');
  // 只认非注释行的 career 接线（export / import / graph 注册）；路线图注释（如 index.ts:3）不算接线证据。
  const careerInIdx = idxLines
    .map((l, i) => ({ line: i + 1, text: l.trim() }))
    .filter((x) => !x.text.startsWith('//') && !x.text.startsWith('*') && !x.text.startsWith('/*'))
    .filter((x) => /career/i.test(x.text));
  let graphFiles: string[] = [];
  try { graphFiles = readdirSync(resolve(repoRoot, 'packages/ai-graphs/src')).filter((n) => /career/i.test(n)); } catch { /* dir missing */ }
  const graphRuns = await careerGraphRunCount();
  const unreachable = !regionHasGraphWire && careerInIdx.length === 0 && graphFiles.length === 0 && graphRuns === 0;
  const reason =
    `no career-path graph wiring: ${svcRel}:${genLine + 1} generateCareerPath is sync derive (` +
    `${svcRel}:${deriveLine + 1} deriveCareerPath call, region graph-wire regex=${regionHasGraphWire}); ` +
    `${idxRel}:0 career export lines=${careerInIdx.length}; packages/ai-graphs/src career files=${graphFiles.length ? graphFiles.join(',') : 'none'}; ` +
    `ai_graph_run graph_name='career-path' rows=${graphRuns} (no fabricated run)`;
  const exit: 0 | 1 = unreachable ? 1 : 0;
  A('FI3-UNREACHABLE-RECORDED', true);   // 断言恒真：本 attempt 的语义是「如实记录不可达」
  recordAttempt({
    id: 'ATTEMPT-3-FI3-GRAPH-FAIL', fault: 'FI-3 graph fail state machine (AiGraphRun active→failed)', exit,
    detail: unreachable ? `UNREACHABLE — ${reason}` : `REACHED (unexpected on this tree) — ${reason}`,
    evidence: { generateCareerPath_line: genLine + 1, deriveCareerPath_line: deriveLine + 1, regionHasGraphWire, careerInIdx, graphFiles, graphRuns, unreachable },
  });
  console.log(`GAP  GAP-UC004-FAIL-A3  FI-3 unreachable: ${reason}`);
}

// ── EXIT 契约裁决 ──
const control = attempts[0]; const fi2 = attempts[1]; const fi1 = attempts[2]; const fi3 = attempts[3];
const exitZeroEligible =
  control?.exit === 0 && fi2?.exit === 0 && fi1?.exit === 0
  && fi3?.exit === 0;   // FI-3 必须可达且观察到 failed+降级+重试+额度不变
const finalExit = exitZeroEligible ? 0 : 1;

console.log('');
console.log(`ATTEMPTS_LEDGER attempts=${attempts.length} one_shot=true retry_to_green=false exits=${attempts.map((a) => `${a.id}:${a.exit}`).join(' ')}`);
if (finalExit !== 0) {
  console.log(`GAP  GAP-UC004-FAIL-A3  EXIT=1 honest gap retained: FI-3 unreachable (see ATTEMPT-3 file:line evidence)${fi1 && fi1.exit !== 0 ? ' + FI-1 degrade not HTTP-explainable as observed (recorded as-is, no retry)' : ''}. NHP-004-FAULT-01 stays gap. A3 NOT closed.`);
}
console.log(`NOTE releaseEvidence=false · Not HA · EXIT=${finalExit}${finalExit === 1 ? ' = 诚实保留 gap（Ban invent fix · Ban 记 flake）' : ''} · EXIT 值不翻任何 SSOT 行 · A3 关闭须 post-prove dual + 协调方授权`);
console.log(`NOTE pnpm uc004:career-path:prove（静态 mark-red EXIT0）≠ 本运行时故障注入证据的替代品`);
console.log(`CMD=pnpm uc004:career-path-fault:prove EXIT=${finalExit}`);
api.proc.kill('SIGKILL');
process.exit(finalExit);
