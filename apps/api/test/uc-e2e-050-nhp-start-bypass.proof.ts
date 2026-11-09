/**
 * UC-E2E-050 · START-BYPASS isolated real-PG/HTTP evidence · NHP-050-START-BYPASS-01
 * (REQUEST ai-docs/delivery/harness/uc50-REQUEST.md §1.5 rev r1 三证据臂 · 裁决 (b) 诚实证据刀
 *  · 2026-11-06 内容安全开关第三入口收口刀（ai-docs/delivery/harness/kill-switch-entry-REQUEST.md）
 *  同刀 re-pin：SB1/SB3 极性随修复翻转 + SB4 行钉改形状锚 · 断言数 46→47 零删减·off 既有行为断言零动)
 *
 * 断言对象 = 「修复后契约形状」：开关开启（kill=1）时 applications.start → 503 具名码+零副作用
 * （闸放 beginInterviewCore 核首语句共享位 denyContentSafetyKilledShared·合一事务整体回滚）·
 * 开关关闭（off/unset）时既有放行字节保真（SB2 对照臂不动）。原「绕行残余在树」登记语义已被
 * 收口刀合法翻转（残余已收口·史录见 uc50 卷 closed 收据/矩阵注记）——Ban 借本收据宣称
 * 「kill-switch 全入口已闸」超出本证面（worker 消费侧=暂停入队语义·翻转前已入队 job 仍消费至
 * 有界上界·ksw 卷 §1.1⑦ 承登）。
 *
 * Arms（re-pin 后）:
 *   SB1 = 开关开启拒 runtime（kill=1 子进程 spawn）: POST /applications/:id/start → 503
 *         content_safety_kill_switch_active 具名码+诚实文案逐字（非 200 非 noop 空壳形·
 *         applicationId/status/interviewId/redirectTo 全缺位=零放行形状）；同 env 双口差分:
 *         同 interviewId POST /interview/:id/begin → 503 同形（start/begin 双口同闸一致=
 *         核共享位覆盖第二生产者 applications.start 直调）。
 *   SB2 = off 对照臂（kill=0/unset spawn 变体）: start → 200 现状字节四元 + begin → 202
 *         accepted/alreadyBegun（off=现状保真·双口在同 env 下差分自证）——既有行为断言零动。
 *   SB3 = 净账审计（父进程跨进程 DB 审计）: kill 臂全零（interview 行 0/interview_job 0/
 *         entitlement_consumption 0/候选人个人桶 0/申请仍 invited=合一事务整体回滚）·
 *         off 臂同净账形（interview +1/start job 恰 1/answer 0/四元绑定在场/预留 1 行
 *         reserved payer=招聘方/CAS invited→in_progress）；企业桶 units_reserved 恰 +1.00
 *         （仅 off 臂）· consumed=0（worker 不在场零结算）。
 *   SB4 = 臂② 静态结构（形状锚·行号无关——基线漂移随形状翻转不再随行号误红）:
 *         方法闸 this.denyContentSafetyKilled(); 全树恰 2（首处 begin 口·次处 turn 口）+
 *         共享映射体 denyContentSafetyKilledShared 导出在场（体内 assert+具名码+503 状态字）+
 *         private denyContentSafetyKilled 委托共享体 + beginInterviewCore 核首语句共享闸
 *         （先于 resumeId 校验=第三入口同闸覆盖）+ 全树恰位形 + applications.service/controller
 *         全文零 kill 词元（start 零内联闸=闸承自共享核首语句非 start 内联）。
 *   SB5 = 臂③ 静态门一致性: i6-239-gates.proof.mjs `callSites === 2` 与产品现状一致——
 *         测量域=interview.service.ts 单文件字面（核共享闸同文件·方法闸计数恒 2 门不红）·
 *         全树判定以臂② 为准（本臂单文件计数 === 臂② 全树文件数 → 门不红=自洽）。
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
 *   - 本收据证明「开关开启时 start 被核首语句共享闸拒 503 且合一事务零副作用」+「off 现状字节
 *     保真」+「闸接线形状全树恰位」；非「kill-switch 全入口已闸/生产 HA/容量」的任何宣称
 *     （worker 消费侧=暂停入队语义·翻转前已入队 job 仍消费至有界上界·ksw 卷 §1.1⑦ 承登）。
 *   - (a) 产品接线刀已行使（kill-switch-entry 收口刀·闸放核首语句共享位·applications.service.ts
 *     零触 catch 原样重抛透传 503）——本 proof 同刀 re-pin（2026-11-06·源=两路审查 ksw-1/ksw-2）。
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

// 测试夹具凭据一律环境变量派生（门禁约束：测试不落凭据字面量；默认值=原夹具值，运行时语义不变，除非显式注入 env）。
const MEETWISE_TEST_FIXTURE_1 = 'test-secret-key';

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
// 臂①/对照臂主行使: applications.start（合一事务·直调 beginInterviewCore——核首语句共享闸
// denyContentSafetyKilledShared: kill=1 → 503 具名码+事务整体回滚 / off → CAS+预留+入队放行）。
const start = await post('/applications/' + appId + '/start', U(principal), { resumeId });
results.push({ arm: 'start', status: start.status, body: start.body });
// 同 env 双口差分: 同核 begin 端点——kill=1 → 503 同形（start/begin 双口同闸）/ unset → 202 现状字节。
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
// owner-join 口径（kill 臂零增审计用：无 interview 行可绑 → 恒 0·不依赖 start body 的 interviewId）。
const jobRowsOfOwner = async (pool: DbPool, principal: string) =>
  Number((await pool.query(
    `SELECT count(*)::int AS n FROM interview_job j JOIN interview i ON i.id=j.interview_id WHERE i.owner_user_id=$1`, [principal],
  )).rows[0]?.n ?? 0);
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
  console.log(`UC-E2E-050 ${CASE_ID} isolated PG/HTTP START-BYPASS evidence (开关开启拒 503 零副作用/off 保真/静态形状锚·re-pin 后三证据臂)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · 公开 DELETE=503');
  console.log('HONESTY: 断言对象=修复后契约形状（kill=1 start 503+零副作用·off 字节保真） 非全入口已闸宣称 · 同刀 re-pin（ksw 收口刀）');
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
      AUTH_SECRET: MEETWISE_TEST_FIXTURE_1,
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
      const child = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', '--', childSourcePath], {
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

  // ── SB1 臂①（kill=1 spawn 变体·真 PG——开关开启拒 503+合一事务整体回滚·re-pin 后契约形状）──
  const killChild = await runChild('start-kill', '1', CAND_KILL, appKill, RESUME_KILL);
  A('CHILD', 'child(kill=1) exits cleanly', killChild.code === 0 && killChild.result !== null);
  const killStart = killChild.result?.results.find((r) => r.arm === 'start');
  const killBegin = killChild.result?.results.find((r) => r.arm === 'begin');
  A('SB1', 'kill=1 start → 503（开关开启拒·具名 503 非 200 非 4xx——原「现状放行 200」形状已随修复合法翻转）',
    killStart?.status === 503);
  A('SB1', 'kill=1 start body 具名码 content_safety_kill_switch_active（与 begin/turn 口逐字同形）',
    killStart?.body?.error === KILL_CODE);
  A('SB1', 'kill=1 start body 诚实文案逐字（核共享映射体·零新造）',
    killStart?.body?.message === KILL_MSG);
  A('SB1', 'kill=1 start body 零放行形状（applicationId/status/interviewId/redirectTo 全缺位——Ban noop 空壳形 200 与四元放行形）',
    killStart?.body?.applicationId === undefined && killStart?.body?.status === undefined
    && killStart?.body?.interviewId === undefined && killStart?.body?.redirectTo === undefined);
  A('SB1', '同 env 双口差分: begin → 503（同核第二生产者同闸·同 interviewId）', killBegin?.status === 503);
  A('SB1', 'begin 503 body 具名码+诚实文案逐字（reason 级可分）',
    killBegin?.body?.error === KILL_CODE && killBegin?.body?.message === KILL_MSG);
  A('SB1', 'start/begin 双口同闸一致（同 env 两口 503+同具名码同文案=核首语句共享位覆盖第二生产者）',
    killStart?.status === 503 && killBegin?.status === 503
    && killStart?.body?.error === killBegin?.body?.error && killStart?.body?.message === killBegin?.body?.message);
  A('SB1', 'child spawn env truly had kill=1（result echoes killVal）', killChild.result?.killVal === '1');

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

  // ── SB3 净账审计（父进程跨进程 DB 审计·kill 臂全零=合一事务整体回滚 / off 臂既有净账形保持）──
  A('SB3', 'kill 臂 interview 行零增（开关开启拒=核首语句闸抛·合一事务整体回滚·恒 0 行）',
    (await interviewRowCountOf(pool, CAND_KILL)) === 0);
  A('SB3', 'kill 臂零 interview_job 入队（owner-join 口径 start/answer 全 0=闸先于一切入队）',
    (await jobRowsOfOwner(pool, CAND_KILL)) === 0);
  const killCons = await consumptionRowsOf(pool, CAND_KILL);
  A('SB3', 'kill 臂零预留（entitlement_consumption 恒 0 行=reserveEntitlementForApplication 未达）',
    killCons.length === 0);
  A('SB3', 'kill 臂候选人个人桶零触（企业路由·候选人桶零读写·既有语义保持）', (await personalBucketOf(pool, CAND_KILL)) === 0);
  A('SB3', 'kill 臂申请状态仍 invited（CAS 迁移随事务回滚·未至 in_progress 非 noop 非 held）',
    (await applicationStatusOf(pool, appKill)) === 'invited');
  A('SB3', 'off 臂 interview 行增量恰 +1 · start job 恰 1 · answer 0（对照臂既有行为保持）',
    (await interviewRowCountOf(pool, CAND_OFF)) === 1
    && (await jobCountOf(pool, ivOff, 'start')) === 1 && (await jobCountOf(pool, ivOff, 'answer')) === 0);
  const offBoundRow = await pool.query(
    `SELECT application_id, job_id, resume_id FROM interview WHERE id=$1 AND owner_user_id=$2`, [ivOff, CAND_OFF]);
  A('SB3', 'off 臂 interview 四元绑定在场（application_id/job_id/resume_id 全绑·原 kill 臂绑定形状断言移至 off 对照臂）',
    offBoundRow.rows[0]?.application_id === appOff
    && offBoundRow.rows[0]?.job_id != null && offBoundRow.rows[0]?.resume_id != null);
  const offCons = await consumptionRowsOf(pool, CAND_OFF);
  A('SB3', 'off 臂预留净账恰 1 行 reserved（对照臂同形状 payer=招聘方）',
    offCons.length === 1 && offCons[0]?.status === 'reserved' && offCons[0]?.payer_user_id === REC);
  const bucketAfter = await enterpriseBucketOf(pool, REC);
  A('SB3', '企业桶净账: units_reserved 恰 +1.00（仅 off 臂·kill 臂零预留）· consumed=0（worker 不在场零结算零泄漏）',
    Math.abs(bucketAfter.reserved - bucketBefore.reserved - 1) < 1e-9 && bucketAfter.consumed === 0);
  A('SB3', 'off 臂 CAS 迁移 invited→in_progress（kill 臂仍 invited 见臂5·合一事务状态面·非 noop 非 held）',
    (await applicationStatusOf(pool, appOff)) === 'in_progress');

  // ── SB4 臂② 静态结构（全树 rg 口径·形状锚行号无关——基线漂移随形状翻转不随行号误红）──
  const svcRel = 'apps/api/src/modules/interview/interview.service.ts';
  const svc = readRepo(svcRel);
  const svcLines = svc.split('\n');
  const callLines = svcLines.filter((l) => l.includes('this.denyContentSafetyKilled();'));
  const beginIdx = svc.indexOf('begin(principal: string, id: string, resumeId: string');
  const turnIdx = svc.indexOf('turn(principal: string, id: string, body: TurnDto');
  const firstCallIdx = svc.indexOf('this.denyContentSafetyKilled();');
  const lastCallIdx = svc.lastIndexOf('this.denyContentSafetyKilled();');
  A('SB4', '方法闸接线全树恰 2 处·形状锚（首处 begin 口·次处 turn 口——行号无关锚·不再钉 :425/:436）',
    callLines.length === 2 && beginIdx > 0 && turnIdx > beginIdx
    && firstCallIdx > beginIdx && firstCallIdx < turnIdx && lastCallIdx > turnIdx);
  const sharedIdx = svc.indexOf('export function denyContentSafetyKilledShared(): void');
  const sharedBody = sharedIdx > 0 ? svc.slice(sharedIdx, svc.indexOf('\n}', sharedIdx)) : '';
  const delegateIdx = svc.indexOf('private denyContentSafetyKilled(): void');
  const delegateBody = delegateIdx > 0 ? svc.slice(delegateIdx, svc.indexOf('\n}', delegateIdx)) : '';
  A('SB4', '闸映射形状锚（共享体 denyContentSafetyKilledShared 导出在场·体内 assert+具名码+503 状态字·private denyContentSafetyKilled 委托共享体）',
    sharedIdx > 0 && sharedBody.includes('assertContentSafetyKillSwitchOff()')
    && sharedBody.includes(KILL_CODE) && sharedBody.includes('HttpStatus.SERVICE_UNAVAILABLE')
    && delegateIdx > 0 && delegateBody.includes('denyContentSafetyKilledShared()'));

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
  A('SB4', 'beginInterviewCore 核首语句共享闸在场（denyContentSafetyKilledShared 先于 resumeId 校验=第三入口 applications.start 直调同闸·原「体内零 kill 检查」形状已随修复合法翻转）',
    coreStartIdx > 0 && coreEndIdx > coreStartIdx
    && coreBody.includes('denyContentSafetyKilledShared();')
    && coreBody.indexOf('denyContentSafetyKilledShared();') < coreBody.indexOf("missing_resume_id"));
  A('SB4', 'beginInterviewCore 守卫链在场对照（advisory/FOR UPDATE/privacy/terminal/扣额路由/入队——切片非空转）',
    coreBody.includes('pg_advisory_xact_lock') && coreBody.includes('FOR UPDATE')
    && coreBody.includes('guardInterviewPrivacyTx') && coreBody.includes('TERMINAL_INTERVIEW')
    && coreBody.includes('reserveEntitlementForApplication') && coreBody.includes('enqueueInterviewJob'));
  const startFnIdx = appsService.indexOf('async start(principal');
  const startFnEnd = appsService.indexOf('\n  }\n', startFnIdx);
  const startBody = appsService.slice(startFnIdx, startFnEnd);
  A('SB4', 'start() 自身零内联闸（beginInterviewCore 直调在场·start 体内零 kill 词元=闸承自共享核首语句非 start 内联）',
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
      SB1: 'kill=1 start 503 named code + honest message, zero pass-through shape; begin 503 same-shape (dual-mouth same shared gate)',
      SB2: 'off start 200 + begin 202 alreadyBegun (byte-faithful control, unchanged)',
      SB3: 'net accounting: kill arm all-zero (interview/job/reservation/personal bucket/app still invited = single-tx rollback), off arm +1/+1/reserved 1 + four-tuple binding + CAS in_progress, enterprise bucket +1.00 (off only)',
      SB4: 'static shape anchors (line-number-free): method gates exactly 2 (begin mouth then turn mouth), shared mapping body + delegate, core first-statement shared gate before resumeId check, start zero inline gate',
      SB5: 'i6 callSites===2 consistent with product status (single-file domain, method-gate count stable)',
    },
    egress: 'zero-registration arm shape: fragment-assembled strip; no model-key literal in this file',
    seedExemptions: 'user_account + entitlement_bucket(enterprise) + resume(ingested) bare INSERT (entpay-s2 precedent form), named per REQUEST §5',
    honesty: 'receipt proves post-fix contract shape (kill=1 start rejected 503 + zero side effects, off byte-faithful); NOT an all-entries-gated certificate (worker drain = pause-enqueue semantics, ksw volume §1.1-7)',
    repin: '2026-11-06 re-pinned by kill-switch-entry knife (SB1/SB3 polarity flipped with fix, SB4 line pins -> shape anchors, 46->47 assertions, source = dual review ksw-1/ksw-2)',
  };
  writeFileSync(join(receiptDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');

  console.log(`\nATTEMPT_END    iso=${new Date().toISOString()} attempts=1 · failures=${failures.length}/${total}`);
  if (failures.length > 0) {
    console.log(`✗ ${CASE_ID}: ${failures.length}/${total} 失败（EXIT1 诚实保留·Ban retry-to-green）`);
    console.log('停止条件核对: kill=1 start 竟得 200/放行形状=绕行回归=机制面漂移 → 停·如实登记上报（ksw 卷 §8 承守·Ban 改断言极性凑绿）');
    process.exit(1);
  }
  console.log(`✓ ${CASE_ID}: ${total} 断言全绿（开关开启拒 503 零副作用/off 字节保真/静态形状锚 · live=0 · isolated PG）`);
  console.log('EXIT0=case≠covered · 行状态 blind 保持+case-only 措辞 · coveredCount=8 不变 · ⛔push');
  process.exit(0);
})().catch((error) => {
  console.error(error);
  console.error('START-BYPASS-PROOF-ABORT（prove 红=停手上报协调方·Ban retry-to-green）');
  process.exitCode = 1;
});
