/**
 * UC-E2E-050 · START-BYPASS isolated real-PG/HTTP evidence · NHP-050-START-BYPASS-01
 * (REQUEST ai-docs/delivery/harness/uc50-REQUEST.md §1.5 rev r1 三证据臂 · 裁决 (b) 诚实证据刀)
 *
 * 断言对象 = 「现状与登记边界一致」非「产品正确」：applications.start 绕行残余在树且被
 * 诚实钉位（killsw 卷 NOT claimed 显式留的后继登记面行使）。case 收据语义 = 登记边界如实
 * 证据化，非行为合格证——Ban 借本收据宣称产品正确 / 洗 GAP / 宣 kill-switch 全入口已闸。
 *
 * Arms（REQUEST §1.5 rev r1 三证据臂·dual r1 P2 修订承登）:
 *   SB1 = 臂① 现状放行 runtime（kill=1 子进程 spawn）: POST /applications/:id/start 仍 200
 *         且 body 四元非 noop 形（applicationId / status∈{started,reused} / interviewId /
 *         redirectTo——Ban applications.service.ts:83 noop 空壳形 200 计为放行证据）；
 *         同 env 双口差分: 同 interviewId POST /interview/:id/begin → 503
 *         content_safety_kill_switch_active 具名码+诚实文案逐字（同核双生产者·恰一者未接线）。
 *   SB2 = off 对照臂（kill=0/unset spawn 变体）: start → 200 现状字节四元 + begin → 202
 *         accepted/alreadyBegun（off=现状保真·双口在同 env 下差分自证）。
 *   SB3 = 净账审计（父进程跨进程 DB 审计）: interview 行增量 +1/臂 · start job 恰 1 ·
 *         answer job 0 · 预留净账=entitlement_consumption 恰 1 行 reserved（owner=候选人 ·
 *         payer=招聘方 0157 单跳派生）· 企业桶 units_reserved +1.00/臂 · 候选人个人桶零触 ·
 *         job_application CAS 迁移 invited→in_progress。
 *   SB4 = 臂② 静态结构: 闸接线全树恰 2 处（interview.service.ts:425/:436 逐行）+
 *         denyContentSafetyKilled 定义 :335-347（:341 具名码·:342 503 状态字）+
 *         beginInterviewCore（:102-）体内零 kill 检查（守卫链在场对照）+
 *         start（applications.service.ts:57）直调零触 + controller 零闸 +
 *         applications.service/controller 全文零 kill 词元（接线零触=P2 防呆断言）。
 *   SB5 = 臂③ 静态门一致性: i6-239-gates.proof.mjs:53 `callSites === 2` 与产品现状一致——
 *         :52 测量域=interview.service.ts 单文件字面（P2 勘误：他文件接线不改计数）·
 *         全树判定以臂② 为准（本臂单文件计数 === 臂② 全树计数 → 门不红=登记边界自洽）。
 *
 * Evidence layer（REQUEST §1.6·uc-e2e-050-nhp-kill.proof.ts 先例形）: 隔离真 PG
 * （run-e2e-isolated pre-migrate 世界+proof 内 runMigrations skip-or-apply 幂等）+ 真 HTTP
 * 127.0.0.1 子进程 spawn env 变体（kill=1 / unset 双进程·:449-462 runChild 形）+ 三模型钥
 * 词面运行时组装剥除（码面零直书）+ _neg-harness 自剥先例承形。申请面夹具 = 产品路径种子
 * （createJob→classifyJobRoute 规则决→inviteCandidate 生产 db 函数链·entpay-s2 先例形）；
 * 豁免①具名（隔离夹具种子·REQUEST §5·逐项 PIN 留痕）: user_account / entitlement_bucket
 * (enterprise) / resume(ingested) 裸 INSERT——真迁移链上无对应产品 HTTP 面的最小种子，
 * entpay-s2.proof.ts 同形先例。quiz 三刀前提=beginInterviewCore 无 sourceQuizId 整块跳过
 * （applications.start 直调形不携 quiz header·码面亲证）。
 *
 * HONESTY:
 *   - 本收据证明「kill=1 下 applications.start 现状放行且全链零 kill 检查」=残余在+登记边界
 *     与现状一致；非「残余受控/产品正确/全入口已闸」的任何行为合格宣称（REQUEST §5 承守）。
 *   - (a) 产品接线刀清单登记归用户裁决队列（REQUEST §1.5 rev r1·本刀零产品码零接线）。
 *   - i6-gates:prove 申报清单臂对外来改动集按设计红（killsw §7 同口径）=预期形非本刀门。
 *   - 邻面旁证互不替代: uc050:nhp-kill:prove（触发面 503）/ privacy-erasure-http（UC-052）/
 *     public-preview-write-gate（preview 闸）/ entpay:s2:prove（扣费路由·非 kill 面）。
 *
 * Live-key isolation（REQUEST §1.6）: 全离线隔离 PG·api 进程零模型调用·隔离壳 worker 不在
 * 场零消费·零 Langfuse/零 OSS/零供应商网络触·三模型钥词面片段运行时组装 → est live=0。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · PG-retained · 公开 DELETE=503 · EXIT0=case≠covered · 行状态 blind 保持 +
 * case-only 措辞 · attempts 台账逐次留痕（夹具红次沿 uc033 先例如实） · Ban retry-to-green · ⛔push
 *
 *   pnpm uc050:nhp-start-bypass:prove
 *   pnpm -C apps/api prove:uc050-nhp-start-bypass   (raw; needs isolated DATABASE_URL/PG*)
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool, runMigrations, loadMigrations, asPrincipal, createJob, classifyJobRoute, inviteCandidate } from '@meetwise/db';
import type { DbPool } from '@meetwise/db';

const CMD = 'pnpm uc050:nhp-start-bypass:prove';
const CASE_ID = 'NHP-050-START-BYPASS-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();
const here = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(here, '..');
const repoRoot = resolve(apiRoot, '..', '..');

type Cls = 'ISO' | 'SEED' | 'SB1' | 'SB2' | 'SB3' | 'SB4' | 'SB5' | 'CHILD';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) { failures.push({ cls, name }); console.log(`FAIL  [${cls}] ${name}`); }
  else console.log(`PASS  [${cls}] ${name}`);
};

const KILL_ENV = 'MEETWISE_CONTENT_SAFETY_KILL_SWITCH';
const KILL_CODE = 'content_safety_kill_switch_active';
const KILL_MSG = '内容安全开关已开启：面试出题与作答提交暂停';
const BEGIN_ACCEPTED_202 = 202;

// ── egress 预置条款（零登记臂形·REQUEST §1.6）: 三模型钥词面码面零直书——片段运行时组装。 ──
const KEY_FRAGMENTS = {
  a: ['MODEL', 'API', 'KEY'],
  b: ['DASHSCOPE', 'API', 'KEY'],
  c: ['DASHSCOPE', 'COMPAT', 'BASE', 'URL'],
} as const;
const fragJoin = (parts: readonly string[]): string => parts.join('_');
const EGRESS_KEY_NAMES = [fragJoin(KEY_FRAGMENTS.a), fragJoin(KEY_FRAGMENTS.b), fragJoin(KEY_FRAGMENTS.c)];
const EGRESS_STRIP_RE = new RegExp(EGRESS_KEY_NAMES.join('|'));
const stripEgressKeys = (env: NodeJS.ProcessEnv): NodeJS.ProcessEnv =>
  Object.fromEntries(Object.entries(env).filter(([k]) => !EGRESS_STRIP_RE.test(k)));

// 子进程 runner 源（运行时落 apps/api/.tmp/startbypass/——gitignore 内·零 tracked 第二 runner 文件）。
// 形沿 uc-e2e-050-nhp-kill.proof.ts CHILD_SOURCE（受控 runner·自身不是门）: createApp 真 HTTP 服务器
 // +按 mode 脚本行使+__UC050SB_RESULT__ JSON 行落 fd1+SIGTERM 优雅停机契约（禁 process.exit 直退）。
const CHILD_SOURCE = `
import { createApp } from '../../src/main.ts';
const mode = process.env.__UC050SB_MODE__;
const killVal = process.env[${JSON.stringify(KILL_ENV)}];
const app = await createApp();
await app.init();
await app.listen(0, '127.0.0.1');
const addr = app.getHttpAdapter().getInstance().server.address();
process.stdout.write('__UC050SB_READY__ port=' + addr.port + '\\n');
const base = 'http://127.0.0.1:' + addr.port;
const U = (id) => ({ 'x-user-id': id, 'x-request-id': 'child-' + mode + '-1' });
const post = async (p, h, body) => {
  const r = await fetch(base + p, { method: 'POST', headers: { ...h, 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
  return { status: r.status, body: await r.json().catch(() => ({})) };
};
const results = [];
const principal = process.env.__UC050SB_PRINCIPAL__;
const appId = process.env.__UC050SB_APP__;
const resumeId = process.env.__UC050SB_RESUME__;
// 臂①/对照臂主行使: applications.start（合一事务 CAS+预留+入队·直调 beginInterviewCore 零 kill 闸）。
const start = await post('/applications/' + appId + '/start', U(principal), { resumeId });
results.push({ arm: 'start', status: start.status, body: start.body });
// 同 env 双口差分: 同核 begin 端点（第二生产者·闸后）——kill=1 → 503 具名码 / unset → 202 现状字节。
const iv = start.body && typeof start.body.interviewId === 'string' ? start.body.interviewId : 'none';
const begin = await post('/interview/' + iv + '/begin', { ...U(principal), 'resume-id': resumeId }, {});
results.push({ arm: 'begin', status: begin.status, body: begin.body });
process.stdout.write('__UC050SB_RESULT__ ' + JSON.stringify({ mode, killVal, appId, interviewId: iv, results }) + '\\n');
// 停机契约:等待父进程 SIGTERM → fastify/pino 优雅关停——禁 process.exit 直退（uc050 先例形）。
const shutdown = () => { void app.close().then(() => process.exit(0)); };
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
`;

interface ChildResult {
  mode: string;
  killVal: string | undefined;
  appId: string;
  interviewId: string;
  results: { arm: string; status: number; body: any }[];
}

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

// 规则决 classify 的输入 HMAC 键（entpay-s2 先例形·零模型零外呼·规则路径决定）。
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'uc050-start-bypass-proof-route-input-hmac-key-not-production-01';

const readRepo = (rel: string): string => readFileSync(join(repoRoot, rel), 'utf8');

// 产品源全树扫描（apps/api/src + packages 各 src 目录·.ts 非 spec——REQUEST §0.2 rg 口径）。
// 臂② 全树判定域:闸调用面/闸函数面/env 词面全树恰位形（P2 防呆:单文件计数域以外的判定面）。
function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.tmp') continue;
      out.push(...walkTs(p));
    } else if (e.name.endsWith('.ts') && !e.name.endsWith('.spec.ts') && !e.name.endsWith('.d.ts')) {
      out.push(p);
    }
  }
  return out;
}

// ── B3 净账审计面（父进程 DB 审计·跨进程归因）──
type Ledger = { reserved: number; consumed: number };
const enterpriseBucketOf = async (pool: DbPool, recruiter: string): Promise<Ledger> => {
  const r = await pool.query(
    `SELECT coalesce(sum(units_reserved),0)::float8 AS reserved, coalesce(sum(units_consumed),0)::float8 AS consumed
       FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [recruiter]);
  return { reserved: Number(r.rows[0]?.reserved ?? 0), consumed: Number(r.rows[0]?.consumed ?? 0) };
};
const interviewRowCountOf = async (pool: DbPool, principal: string) =>
  Number((await pool.query(`SELECT count(*)::int AS n FROM interview WHERE owner_user_id=$1`, [principal])).rows[0]?.n ?? 0);
const jobCountOf = async (pool: DbPool, interviewId: string, kind: 'start' | 'answer') =>
  Number((await pool.query(`SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1 AND kind=$2`, [interviewId, kind])).rows[0]?.n ?? 0);
const consumptionRowsOf = async (pool: DbPool, principal: string) => {
  const r = await pool.query(
    `SELECT status, payer_user_id, idempotency_key, units_requested::float8 AS units
       FROM entitlement_consumption WHERE owner_user_id=$1`, [principal]);
  return r.rows as Array<{ status: string; payer_user_id: string; idempotency_key: string; units: number }>;
};
const personalBucketOf = async (pool: DbPool, principal: string) =>
  Number((await pool.query(
    `SELECT coalesce(sum(units_reserved+units_consumed),0)::float8 AS n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind<>'enterprise'`, [principal],
  )).rows[0]?.n ?? 0);
const applicationStatusOf = async (pool: DbPool, appId: string) =>
  String((await pool.query(`SELECT status FROM job_application WHERE id=$1`, [appId])).rows[0]?.status ?? '');

(async () => {
  console.log(`UC-E2E-050 ${CASE_ID} isolated PG/HTTP START-BYPASS evidence (现状放行 runtime/静态结构/静态门一致性·三证据臂)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · 公开 DELETE=503');
  console.log('HONESTY: 断言对象=现状与登记边界一致 非产品正确 · (a) 接线刀清单归用户裁决队列·本刀零产品码零接线');
  console.log('Non-substitute: uc050:nhp-kill(触发面)/i6-gates(邻接旁证)/privacy-erasure-http/entpay:s2 互不替代互不 wash');
  console.log('EXIT0=case≠covered · 行状态 blind 保持+case-only 措辞 · est live=0 · Ban retry-to-green · Ban fake-green');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT}\n`);

  // ── ISO 面（隔离自证·非空转）──
  A('ISO', 'egress-strip-pattern-self-test(assembled names all matched · literal-zero file face)',
    EGRESS_KEY_NAMES.every((n) => EGRESS_STRIP_RE.test(n)));
  A('ISO', 'kill-switch-env-unset-at-parent(off=缺省现状·env 窗仅子进程 spawn 变体)', process.env[KILL_ENV] === undefined);

  // 载体: 隔离真 PG + 真迁移链 skip-or-apply（pre-migrate 世界=已应用零重放·virgin 世界=全量应用·世界无关确定形）。
  const pool = createPool({ purpose: 'uc050_start_bypass_proof' });
  const migrationsDir = resolve(repoRoot, 'packages', 'db', 'migrations');
  await runMigrations(pool, loadMigrations(migrationsDir));
  // 真迁移链完整性按 DB 台账断言（世界无关确定形）: schema_migrations 版本集恰等于迁移目录文件集
  // （pre-migrate 世界=runner 已应用·virgin 世界=上行 runMigrations 全量应用·两世界同判据）。
  const migVersions = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).map((f) => f.replace(/\.sql$/, '')).sort();
  const dbVersions = ((await pool.query('SELECT version FROM schema_migrations')).rows as Array<{ version: string }>)
    .map((r) => r.version).sort();
  const latestMigration = migVersions[migVersions.length - 1] ?? 'none';
  A('ISO', `truth-migration-chain fully applied (schema_migrations set == migrations dir set · last=${latestMigration})`,
    dbVersions.length === migVersions.length && dbVersions.every((v, i) => v === migVersions[i]));
  A('ISO', '0157 entpay function pair in place (SECURITY DEFINER×2·企业预留路由面)',
    (Number((await pool.query(
      `SELECT count(*)::int AS n FROM pg_proc WHERE proname IN ('gateway_entpay_reserve','gateway_entpay_apply_allocation') AND prosecdef`,
    )).rows[0]?.n ?? 0)) === 2);

  // ── SEED（申请面产品路径种子·entpay-s2 先例形）──
  // Principals: 一臂一主体（interview 行净账逐臂可归因·uc050 先例形）; 招聘方共享（企业桶总量差分按臂累加）。
  const S = Date.now().toString(36).toUpperCase();
  const REC = `nhp050sb_rec_${S}`;
  const CAND_KILL = `nhp050sb_k_${S}`;
  const CAND_OFF = `nhp050sb_o_${S}`;
  const RESUME_KILL = '15000000-0000-4000-8000-000000000001';
  const RESUME_OFF = '15000000-0000-4000-8000-000000000002';

  await pool.query(
    `INSERT INTO user_account(id,email,password_hash,role,approval_status)
     VALUES ($1,$2,'x','recruiter','approved'),($3,$4,'x','candidate','approved'),($5,$6,'x','candidate','approved')
     ON CONFLICT DO NOTHING`,
    [REC, `sb-rec-${S}@x.com`, CAND_KILL, `sb-k-${S}@x.com`, CAND_OFF, `sb-o-${S}@x.com`],
  );
  // 豁免①具名（隔离夹具种子·REQUEST §5 逐项 PIN）: ①user_account（0155 审核制语境·entpay-s2 :88 形）
  await pool.query(
    `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
     VALUES ($1,'enterprise',5.00, now()+interval '365 days')`, [REC],
  );
  // 豁免①具名 ②: entitlement_bucket(enterprise) 企业桶（0157 payer 面·候选人零个人桶=零触对照）。
  for (const [rid, owner] of [[RESUME_KILL, CAND_KILL], [RESUME_OFF, CAND_OFF]] as const) {
    await pool.query(
      `INSERT INTO resume(id, owner_user_id, status, content_sha) VALUES ($1,$2,'ingested',$3) ON CONFLICT DO NOTHING`,
      [rid, owner, sha256(`nhp050sb resume ${owner} ${S}`)],
    );
  }
  // 豁免①具名 ③: resume(ingested) 行（startApplicationInterview FOR KEY SHARE 读·entpay-s2 :94 形）。
  console.log(`PIN   NHP-050-START-BYPASS-SEED-EXEMPT: 隔离夹具裸 INSERT 三项具名=user_account+entitlement_bucket(enterprise)+resume(ingested)·真迁移链上无对应产品 HTTP 面的最小种子·entpay-s2.proof.ts 先例形·零产品码零新迁移`);

  // 产品路径种子链（生产 db 函数·非 HTTP 面但为产品代码路径·P2④ 申请面产品路径种子）:
  // createJob(规则决前提交)→classifyJobRoute(规则决·modelClassify 护栏=模型路径意外即炸·零模型零外呼)
  // →inviteCandidate(申请 invited+bindApplicationRoute 最新 route_decided 版本)。
  const seedApplication = async (candidate: string): Promise<string> => {
    const jobRow = await asPrincipal(pool, REC, (c) => createJob(c, REC, {
      title: 'Node.js 服务端工程师（start-bypass 夹具）',
      description: 'isolated fixture job for NHP-050-START-BYPASS-01',
      competencies: ['nestjs', 'express', 'koa'],
    }));
    const rev = Number((await pool.query(
      'SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobRow.id],
    )).rows[0].n);
    const cls = await classifyJobRoute(pool, REC, jobRow.id, rev, {
      modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
    });
    if (cls.status !== 'route_decided') throw new Error(`fixture route not decided: ${cls.status}`);
    const invited = await asPrincipal(pool, REC, (c) => inviteCandidate(c, REC, jobRow.id, candidate));
    return invited!.applicationId;
  };

  const appKill = await seedApplication(CAND_KILL);
  const appOff = await seedApplication(CAND_OFF);
  A('SEED', 'two applications invited with route binding (application_bound·产品路径种子链)',
    appKill.length > 0 && appOff.length > 0
    && Number((await pool.query(
      `SELECT count(*)::int AS n FROM application_route_binding WHERE application_id=ANY($1) AND status='application_bound'`,
      [[appKill, appOff]],
    )).rows[0]?.n ?? 0) === 2);
  A('SEED', 'pre-arm baseline: zero interview rows / zero consumption for both candidates',
    (await interviewRowCountOf(pool, CAND_KILL)) === 0 && (await interviewRowCountOf(pool, CAND_OFF)) === 0
    && (await consumptionRowsOf(pool, CAND_KILL)).length === 0 && (await consumptionRowsOf(pool, CAND_OFF)).length === 0);
  const bucketBefore = await enterpriseBucketOf(pool, REC);
  A('SEED', 'enterprise bucket baseline reserved=0 consumed=0', bucketBefore.reserved === 0 && bucketBefore.consumed === 0);

  // ── 子进程 env 变体面（uc050 先例 runChild 形）──
  const childDir = join(apiRoot, '.tmp', 'startbypass');
  mkdirSync(childDir, { recursive: true });
  const childSourcePath = join(childDir, 'startbypass-child.source.mjs');
  writeFileSync(childSourcePath, CHILD_SOURCE);
  console.log(`PIN   CHILD-SOURCE .tmp 落点（gitignore 内·零 tracked 第二 runner 文件）: ${childSourcePath}`);

  const baseChildEnv = (): NodeJS.ProcessEnv => {
    // DATABASE_URL 与 PG* 组件互斥（database_url_conflicts_with_pg_components fail-closed）:
    // 本壳真 PG 形=PG* 组件（runner 注入·剥 DATABASE_URL）——start 臂全链需 DB（CAS/预留/入队）。
    const env = stripEgressKeys({ ...process.env });
    delete env[KILL_ENV];
    delete env.DATABASE_URL;
    return {
      ...env,
      NODE_ENV: 'test',
      OCR_ENABLED: '0',
      AUTH_DEV_HEADER: '1',
      AUTH_SECRET: 'test-secret-key',
      RESUME_ENC_KEY: 'test-resume-enc-key',
      RESUME_HASH_SECRET: 'test-resume-hash-secret',
      PAY_PROVIDER_SECRET: 'test-pay-secret',
    };
  };

  const runChild = async (mode: string, killVal: string | undefined, principal: string, appId: string, resumeId: string) =>
    await new Promise<{ result: ChildResult | null; stdout: string[]; stderr: string[]; code: number }>((res) => {
      const env: NodeJS.ProcessEnv = {
        ...baseChildEnv(),
        __UC050SB_MODE__: mode,
        __UC050SB_PRINCIPAL__: principal,
        __UC050SB_APP__: appId,
        __UC050SB_RESUME__: resumeId,
      };
      if (killVal === undefined) delete env[KILL_ENV]; else env[KILL_ENV] = killVal;
      const child = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', childSourcePath], {
        cwd: apiRoot,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const stdout: string[] = [];
      const stderr: string[] = [];
      let buf = '';
      let result: ChildResult | null = null;
      let sawResult = false;
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk: string) => {
        buf += chunk;
        let idx: number;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line) stdout.push(line);
          if (line.startsWith('__UC050SB_RESULT__') && !sawResult) {
            sawResult = true;
            try { result = JSON.parse(line.slice('__UC050SB_RESULT__ '.length)); } catch { result = null; }
            // RESULT 已得 → SIGTERM 优雅停机（pino 缓冲随 close 落 fd1）。
            setTimeout(() => { try { child.kill('SIGTERM'); } catch { /* noop */ } }, 250);
          }
        }
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (c: string) => stderr.push(c));
      const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* noop */ } }, 180_000);
      child.on('exit', (code) => {
        clearTimeout(timer);
        if (!result) {
          const resultLine = stdout.join('').split('\n').find((l) => l.startsWith('__UC050SB_RESULT__'));
          if (resultLine) { try { result = JSON.parse(resultLine.slice('__UC050SB_RESULT__ '.length)); } catch { result = null; } }
        }
        if (!result || code !== 0) console.error(`child ${mode} no-result-or-exit-${code} stderr=${stderr.join('').slice(-800)}`);
        res({ result, stdout, stderr, code: code ?? -1 });
      });
    });

  // 子进程 env 变体自证: 剥除面无模型钥形键（ISO 面·组装口径亲证）。
  const childEnvProbe = baseChildEnv();
  A('ISO', 'child-env egress-strip: no assembled model-key-shaped key survives',
    Object.keys(childEnvProbe).every((k) => !EGRESS_STRIP_RE.test(k)));

  // ── SB1 臂①（kill=1 spawn 变体·真 PG——start 全链 CAS/预留/入队需 DB·现状放行实证）──
  const killChild = await runChild('start-kill', '1', CAND_KILL, appKill, RESUME_KILL);
  A('CHILD', 'child(kill=1) exits cleanly', killChild.code === 0 && killChild.result !== null);
  const killStart = killChild.result?.results.find((r) => r.arm === 'start');
  const killBegin = killChild.result?.results.find((r) => r.arm === 'begin');
  A('SB1', 'kill=1 start → 200（现状放行实证·非 503 非 4xx）', killStart?.status === 200);
  A('SB1', 'kill=1 start body 四元: applicationId 恒等', killStart?.body?.applicationId === appKill);
  A('SB1', 'kill=1 start body status ∈ {started,reused}（Ban :83 noop 空壳形 200 计为放行证据）',
    killStart?.body?.status === 'started' || killStart?.body?.status === 'reused');
  A('SB1', 'kill=1 start body interviewId 服务端绑定形（iv_ 前缀 newEntityId·持久化绑定·非 noop 缺位形）',
    typeof killStart?.body?.interviewId === 'string' && /^iv_[0-9a-f]{16,}$/.test(String(killStart?.body?.interviewId)));
  A('SB1', 'kill=1 start body redirectTo 形（/interview/<id>?applicationId=<app>）',
    typeof killStart?.body?.redirectTo === 'string'
    && String(killStart?.body?.redirectTo).startsWith('/interview/')
    && String(killStart?.body?.redirectTo).includes(encodeURIComponent(appKill)));
  A('SB1', '同 env 双口差分: begin → 503（同核第二生产者闸后·同 interviewId）', killBegin?.status === 503);
  A('SB1', 'begin 503 body 具名码+诚实文案逐字（reason 级可分）',
    killBegin?.body?.error === KILL_CODE && killBegin?.body?.message === KILL_MSG);
  A('SB1', 'child spawn env truly had kill=1（result echoes killVal）', killChild.result?.killVal === '1');
  const ivKill = String(killChild.result?.interviewId ?? '');

  // ── SB2 off 对照臂（kill=0/unset spawn 变体·现状字节保真）──
  const offChild = await runChild('start-off', undefined, CAND_OFF, appOff, RESUME_OFF);
  A('CHILD', 'child(off/unset) exits cleanly', offChild.code === 0 && offChild.result !== null);
  const offStart = offChild.result?.results.find((r) => r.arm === 'start');
  const offBegin = offChild.result?.results.find((r) => r.arm === 'begin');
  A('SB2', 'off start → 200 现状字节四元（off=现状保真·BOUND 对照）', offStart?.status === 200
    && offStart?.body?.applicationId === appOff
    && (offStart?.body?.status === 'started' || offStart?.body?.status === 'reused')
    && typeof offStart?.body?.interviewId === 'string' && typeof offStart?.body?.redirectTo === 'string');
  A('SB2', 'off 同 env 双口差分: begin → 202 accepted（现状字节·与 kill=1 begin 503 同口差分自证）',
    offBegin?.status === BEGIN_ACCEPTED_202 && offBegin?.body?.accepted === true);
  A('SB2', 'off begin alreadyBegun=true（start 已入队 begin 幂等短路·同核双生产者 off 形）',
    offBegin?.body?.alreadyBegun === true);
  A('SB2', 'child spawn env truly had kill unset（result echoes killVal undefined）', offChild.result?.killVal === undefined);
  const ivOff = String(offChild.result?.interviewId ?? '');

  // ── SB3 净账审计（父进程跨进程 DB 审计·预留/入队净账）──
  A('SB3', 'kill 臂 interview 行增量恰 +1（0→1·合一事务 CAS 建绑）', (await interviewRowCountOf(pool, CAND_KILL)) === 1);
  A('SB3', 'kill 臂 iv start job 恰 1 · answer job 0（入队净 1·模型面 job 在 kill=1 下仍入队=绕行铁证）',
    (await jobCountOf(pool, ivKill, 'start')) === 1 && (await jobCountOf(pool, ivKill, 'answer')) === 0);
  const killBoundRow = await pool.query(
    `SELECT application_id, job_id, resume_id FROM interview WHERE id=$1 AND owner_user_id=$2`, [ivKill, CAND_KILL]);
  A('SB3', 'kill 臂 interview 四元绑定在场（application_id/job_id/resume_id 全绑·合一事务产品事实）',
    killBoundRow.rows[0]?.application_id === appKill
    && killBoundRow.rows[0]?.job_id != null && killBoundRow.rows[0]?.resume_id != null);
  const killCons = await consumptionRowsOf(pool, CAND_KILL);
  A('SB3', 'kill 臂预留净账恰 1 行 reserved（owner=候选人·payer=招聘方·idempotency_key=interviewId·0157 形状甲）',
    killCons.length === 1 && killCons[0]?.status === 'reserved' && killCons[0]?.payer_user_id === REC
    && killCons[0]?.idempotency_key === ivKill);
  A('SB3', 'kill 臂候选人个人桶零触（企业路由·候选人桶零读写）', (await personalBucketOf(pool, CAND_KILL)) === 0);
  A('SB3', 'off 臂 interview 行增量恰 +1 · start job 恰 1 · answer 0（对照臂同净账形）',
    (await interviewRowCountOf(pool, CAND_OFF)) === 1
    && (await jobCountOf(pool, ivOff, 'start')) === 1 && (await jobCountOf(pool, ivOff, 'answer')) === 0);
  const offCons = await consumptionRowsOf(pool, CAND_OFF);
  A('SB3', 'off 臂预留净账恰 1 行 reserved（对照臂同形状）',
    offCons.length === 1 && offCons[0]?.status === 'reserved' && offCons[0]?.payer_user_id === REC);
  const bucketAfter = await enterpriseBucketOf(pool, REC);
  A('SB3', '企业桶净账: units_reserved 恰 +2.00（两臂各 +1.00）· consumed=0（worker 不在场零结算零泄漏）',
    Math.abs(bucketAfter.reserved - bucketBefore.reserved - 2) < 1e-9 && bucketAfter.consumed === 0);
  A('SB3', '两申请 CAS 迁移 invited→in_progress（合一事务状态面·非 noop 非 held）',
    (await applicationStatusOf(pool, appKill)) === 'in_progress' && (await applicationStatusOf(pool, appOff)) === 'in_progress');

  // ── SB4 臂② 静态结构（全树 rg 口径·§0.2 亲证复刻）──
  const svcRel = 'apps/api/src/modules/interview/interview.service.ts';
  const svc = readRepo(svcRel);
  const svcLines = svc.split('\n');
  const callLines = svcLines.map((l, i) => ({ l, n: i + 1 })).filter((x) => x.l.includes('this.denyContentSafetyKilled();'));
  A('SB4', '闸接线全树恰 2 处且逐行钉位 :425/:436（§0 重 pin 锚）',
    callLines.length === 2 && callLines[0]?.n === 425 && callLines[1]?.n === 436);
  A('SB4', '闸定义 :335-347（:335 头·:341 具名码·:342 503 状态字·:347 收口——P2⑦ 勘误锚）',
    svcLines[334]?.includes('private denyContentSafetyKilled(): void {') === true
    && svcLines[340]?.includes(KILL_CODE) === true
    && svcLines[341]?.includes('HttpStatus.SERVICE_UNAVAILABLE') === true
    && svcLines[346]?.trim() === '}');

  const packagesRoot = join(repoRoot, 'packages');
  const packageSrcDirs = readdirSync(packagesRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'node_modules')
    .map((e) => join(packagesRoot, e.name, 'src'))
    .filter((src) => { try { readdirSync(src); return true; } catch { return false; } });
  const productFiles = [...walkTs(join(repoRoot, 'apps', 'api', 'src')), ...packageSrcDirs.flatMap((d) => walkTs(d))];
  const filesWith = (needle: string) => productFiles.filter((p) => {
    try { return readFileSync(p, 'utf8').includes(needle); } catch { return false; }
  });
  const rel = (p: string) => p.slice(repoRoot.length + 1);
  const gateCallFiles = filesWith('denyContentSafetyKilled');
  const gateFnFiles = filesWith('assertContentSafetyKillSwitchOff');
  const envLiteralFiles = filesWith(KILL_ENV);
  A('SB4', 'denyContentSafetyKilled 全树恰 1 文件（interview.service.ts）=闸调用面全图',
    gateCallFiles.length === 1 && gateCallFiles[0]?.endsWith('interview.service.ts') === true);
  A('SB4', 'assertContentSafetyKillSwitchOff 全树恰 2 文件（content-safety.ts 定义+interview.service.ts 闸内 assert）',
    gateFnFiles.length === 2 && gateFnFiles.map(rel).sort().join('|')
      === ['apps/api/src/modules/interview/interview.service.ts', 'apps/api/src/platform/content-safety.ts'].sort().join('|'));
  A('SB4', 'kill env 词面产品树恰 1 文件（content-safety.ts·env 直读闸自钉）',
    envLiteralFiles.length === 1 && envLiteralFiles[0]?.endsWith('content-safety.ts') === true);
  const appsService = readRepo('apps/api/src/modules/jobs/applications.service.ts');
  const appsController = readRepo('apps/api/src/modules/jobs/applications.controller.ts');
  const KILL_TOKENS = ['denyContentSafetyKilled', 'assertContentSafetyKillSwitchOff', 'ContentSafetyKillSwitchActiveError', KILL_ENV];
  A('SB4', 'applications.service.ts 全文零 kill 词元（接线零触=P2① 防呆断言）',
    KILL_TOKENS.every((t) => !appsService.includes(t)));
  A('SB4', 'applications.controller.ts 全文零 kill 词元（controller 零闸零中间件）',
    KILL_TOKENS.every((t) => !appsController.includes(t)) && appsController.includes("@Post(':id/start')"));

  const coreStartIdx = svc.indexOf('export async function beginInterviewCore(');
  const coreEndIdx = svc.indexOf('\n}\n', coreStartIdx);
  const coreBody = svc.slice(coreStartIdx, coreEndIdx);
  A('SB4', 'beginInterviewCore 体内零 kill 检查（三词元全负）',
    coreStartIdx > 0 && coreEndIdx > coreStartIdx
    && !coreBody.includes('denyContentSafetyKilled') && !coreBody.includes('assertContentSafetyKillSwitchOff')
    && !coreBody.includes(KILL_ENV));
  A('SB4', 'beginInterviewCore 守卫链在场对照（advisory/FOR UPDATE/privacy/terminal/扣额路由/入队——切片非空转）',
    coreBody.includes('pg_advisory_xact_lock') && coreBody.includes('FOR UPDATE')
    && coreBody.includes('guardInterviewPrivacyTx') && coreBody.includes('TERMINAL_INTERVIEW')
    && coreBody.includes('reserveEntitlementForApplication') && coreBody.includes('enqueueInterviewJob'));
  const startFnIdx = appsService.indexOf('async start(principal');
  const startFnEnd = appsService.indexOf('\n  }\n', startFnIdx);
  const startBody = appsService.slice(startFnIdx, startFnEnd);
  A('SB4', 'start() 直调核零闸（:57 beginInterviewCore 直调在场·体内零 kill 词元）',
    startFnIdx > 0 && startBody.includes('await beginInterviewCore(c, owner, started.interviewId')
    && KILL_TOKENS.every((t) => !startBody.includes(t)));
  A('SB4', ':83 noop 空壳行在场（P2② 陷阱锚登记·本收据 Ban noop 形 200 计为放行证据）',
    appsService.includes("if (r.status === 'noop') return { applicationId: appId, status: 'noop' as const };"));

  // ── SB5 臂③ 静态门一致性（i6 :53 与现状一致=登记边界自洽）──
  const i6Rel = 'scripts/i6-239-gates.proof.mjs';
  const i6 = readRepo(i6Rel);
  const i6Lines = i6.split('\n');
  const callSitesLine = i6Lines.find((l) => l.includes('const callSites ='));
  const assertLine = i6Lines.find((l) => l.includes('callSites === 2'));
  A('SB5', 'i6 :53 钉值在场（callSites === 2 硬钉）', Boolean(assertLine) && assertLine!.includes('begin/turn 双口恰 2 处闸调用'));
  A('SB5', 'i6 :52 测量域=interview.service.ts 单文件字面（svc.split 单文件域·P2③ 勘误承登：他文件接线不改计数）',
    Boolean(callSitesLine) && callSitesLine!.includes('svc.split') && i6.includes("read('apps/api/src/modules/interview/interview.service.ts')"));
  A('SB5', '臂③ 一致性: i6 单文件计数 === 臂② 全树计数（2===2）→ 门不红=登记边界自洽',
    callLines.length === 2 && gateCallFiles.length === 1
    && callSitesLine!.includes(`svc.split('\\n').filter((l) => l.includes('this.denyContentSafetyKilled();')).length`));
  A('SB5', 'i6 :119 零触断言在场（applications.service.ts 申报面零触·P2① 同步面登记）',
    i6.includes("!changeSet.includes('apps/api/src/modules/jobs/applications.service.ts')"));

  // ── 收据 ──
  const receiptDir = join(apiRoot, '.tmp', 'nhp-050-start-bypass-receipts');
  mkdirSync(receiptDir, { recursive: true });
  const receipt = {
    caseId: CASE_ID, cmd: CMD, attemptStartedAt: ATTEMPT_STARTED_AT,
    assertions: total, failures: failures.length,
    killEnv: KILL_ENV, killCode: KILL_CODE,
    arms: {
      SB1: 'kill=1 start 200 four-tuple non-noop + same-env begin 503 named code',
      SB2: 'off start 200 + begin 202 alreadyBegun (byte-faithful control)',
      SB3: 'net accounting: interview +1/arm, start job 1, answer 0, reservation 1 (payer=recruiter), enterprise bucket +2.00',
      SB4: 'static: wiring exactly 2 (:425/:436), core zero kill checks, start direct-call zero gate',
      SB5: 'i6 :53 callSites===2 consistent with product status (registration boundary self-consistent)',
    },
    egress: 'zero-registration arm shape: fragment-assembled strip; no model-key literal in this file',
    seedExemptions: 'user_account + entitlement_bucket(enterprise) + resume(ingested) bare INSERT (entpay-s2 precedent form), named per REQUEST §5',
    honesty: 'receipt proves residual present + registration boundary consistent with product status; NOT a fitness certificate',
  };
  writeFileSync(join(receiptDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');

  console.log(`\nATTEMPT_END    iso=${new Date().toISOString()} attempts=1 · failures=${failures.length}/${total}`);
  if (failures.length > 0) {
    console.log(`✗ ${CASE_ID}: ${failures.length}/${total} 失败（EXIT1 诚实保留·Ban retry-to-green）`);
    console.log('停止条件核对: kill=1 start 竟得 503=闸已在位=机制面漂移 → 停·如实登记上报（REQUEST §1.5/§8）');
    process.exit(1);
  }
  console.log(`✓ ${CASE_ID}: ${total} 断言全绿（现状放行 runtime/静态结构/静态门一致性 · live=0 · isolated PG）`);
  console.log('EXIT0=case≠covered · 行状态 blind 保持+case-only 措辞 · coveredCount=8 不变 · ⛔push');
  process.exit(0);
})().catch((error) => {
  console.error(error);
  console.error('START-BYPASS-PROOF-ABORT（prove 红=停手上报协调方·Ban retry-to-green）');
  process.exitCode = 1;
});
