/**
 * NHP-002-HTTP-BOUND-01 · UC-002 HTTP 槽租约口 BOUND 孪生面（SSE per-principal cap=5 · 双设备一桶）
 * REQUEST 蓝本 ai-docs/delivery/harness/uc2b-REQUEST.md §1 rev r2 终形（六臂 B1–B6·两载体）。
 *
 * 需求源：e2e-scenarios.md:79（UC-002 跨设备恢复）+:89 E-并发resume（恰一抢到/输者可解释拒/不双扣——
 *   本 case 取其 SSE 槽租约边界映射面）+:93 A2 + 覆盖矩阵 §0.5:47 BOUND 强制列。
 * 产品嘴：interview.controller.ts:257-:279 —— :261 槽键 `sse:${principal}`（per-principal=跨设备天然
 *   共享桶）· :262 acquireSlot(slotKey,5) 满 5 拒→429 `too_many_streams`（具名码+JSON 非 SSE
 *   envelope）· :259-:262 UC184 领槽先于取数（拒连零取数副作用）· :278 finally releaseSlot（全退出
 *   路径释放）。
 *
 * 两载体分工：
 *   载体甲（B1–B5）=自建最小模块同进程承载（sse-principal-slot.proof.ts:91-:131 先例形·:27-:28
 *     AUTH_DEV_HEADER='1'+NODE_ENV 守卫先设·compile 期 useValue 覆盖·new RateLimitService() 无
 *     DbService=进程内 Map 形 rate-limit.service.ts:26/:150-:181·429 可达性沿 sse-slot/五 case
 *     429 子臂/XR-4 三源亲证）。设备框架=同 principal 双 HTTP client（x-user-id 同值·双
 *     AbortController=两台设备·键 `sse:${principal}` 共享一桶=UC-002 双设备场景义）。
 *   载体乙（B6）=isolated 真 PG+boot 栈（_neg-harness createApp 全量 sql/01-23+手挑迁移清单·
 *     五 case 同形）——boot 栈本体 429 不可达（migration 0189 未装载→acquireSlot 共享臂
 *     fail-open return true·rate-limit.service.ts:173-:175 机制源如实申明），429 风暴打自建
 *     最小模块（五 case :311-:378 rev2 收紧形同构），真 PG 态源前后夹逼断言零副作用。
 *
 * B4 释放传播窗（rev r2 P1 锚形）：poll-until 槽 4 带超时·先例锚 sse-cross-replica.proof.ts:317-:322
 *   （waitFor 形·stepMs=100 默认·deadline 超时=FAIL 计红）+:439 调用值先例
 *   （waitFor('xr1-lease-drained-U1', …, 15_000)）·step 100ms/上限 15s 钉死。
 *   落码注记（rev r3 P2①）：计数观测载体=slotCount(rl,'sse:${principal}')（sse-slot :54-:56 形·
 *   直读进程内 Map）·XREP waitFor 谓词签名 ()=>Promise<boolean>——本刀同步谓词以 async 包裹
 *   （async () => slotCount(…)===4）零语义改。poll 超时=机制红→§8 停止条件（「释放后设备 B 不可
 *   再占」已枚举）·Ban 借环境抖动重跑冲绿·Ban 立即断言再连（release 经 event-loop 数 tick）。
 *
 * B6 态源（rev r2 P2 词表引证）：夹具直置 status='waiting_user'=sentinel 借形——interview.status
 *   无 CHECK（sql/01:20）可写·waiting_user 系 ai_graph_run 词表（sql/01:39）借形 sentinel·非产品
 *   interview 状态机词（interview.service.ts:37-:38 产品状态机=created→completed|failed|abandoned·
 *   TERMINAL_INTERVIEW 不含 waiting_user）·在树直写先例 scor-00-http-db.proof.ts:151·GET :id
 *   （interview.service.ts:735-:766）零状态分支·interview-view.ts:12 status 直透→200+status 恒等
 *   可断·Ban 依赖 begin 推进状态（begin 后仍 created·五 case :303）。
 *
 * 非替代申明（reason 级可分·Ban 互借关列）：sse-principal-slot（单 client+stub DB 零 ledger 臂·零
 *   UC-002 行注册）≠本刀双设备框架+UC-002 行注册+B6 真 PG ledger 臂；XR-4（跨副本集群合计面·
 *   0189 共享 PG lease·措辞冻结）≠本刀单进程进程内 Map 面；五 case 429 子臂（孤儿 reserved 态源·
 *   UC-017 行）≠B6 sentinel 中段态源（UC-002 行·同码不同态源如实申明）；uc002:lease（db
 *   thread-graph fence CAS 面）≠SSE 槽租约口（acquireSlot）；uc002:http（H1–H3 GET/LED 零 429 臂）
 *   /uc002:adv（跨用户 404 零 429 臂）零重叠。
 *
 * 红停双标注（如实登记不入臂·裁决权归协调方）：①HTTP thread-lease CAS 产品口（eval §1b#1）不可测
 *   无嘴可打·本刀零臂零产品码；②snapshot 专用口（eval §1b#2·路由+ADR 双零）不可测·本刀零臂零触。
 *   两面零他刀落零重叠登记·Ban 借本刀收据宣两面闭合。
 *
 * Honest pins：releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-002 covered · EXIT0 = case ≠ covered ·
 *   coveredCount=8 零翻转 · 矩阵 BOUND 格 partial 保持+case-only 收据注 · fixture=pgvector isolated
 *   (green-risk/R5) · 零 live key · 零模型外呼 · est live=0。
 *
 *   pnpm uc002:nhp-http-bound:prove                (via run-e2e-isolated)
 *   pnpm -C apps/api prove:uc002-nhp-http-bound    (raw; needs isolated DATABASE_URL from the runner)
 */
import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { asPrincipal, availableUnits } from '@meetwise/db';
import { InterviewController } from '../src/modules/interview/interview.controller.ts';
import { InterviewService } from '../src/modules/interview/interview.service.ts';
import { QuizController } from '../src/modules/quiz/quiz.controller.ts';
import { QuizService } from '../src/modules/quiz/quiz.service.ts';
import { AllExceptionsFilter } from '../src/platform/all-exceptions.filter.ts';
import { DbService } from '../src/platform/db.service.ts';
import { PrincipalGuard } from '../src/platform/principal.guard.ts';
import { RateLimitService } from '../src/platform/rate-limit.service.ts';
import { boot, mkAssert } from './_neg-harness';

// 载体甲先决（sse-principal-slot.proof.ts:27-:28 先设形）：dev header 回退须先于任何 app 组装；
// 生产 NODE_ENV 拒启守卫同形收窄为 test。
process.env.AUTH_DEV_HEADER = '1';
if (process.env.NODE_ENV === 'production') process.env.NODE_ENV = 'test';

const { A, done } = mkAssert('uc002:nhp-http-bound');
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const S = Date.now().toString(36);
const DEV = `uc002b-${S}`;            // B1–B5 双设备共享桶主体（同 principal 两台设备）
const PKEY = `sse:${DEV}`;            // 槽键（interview.controller.ts:261 形）
const ISO = `uc002i-${S}`;            // B5 异主体
const STORM = `uc002s-${S}`;          // B6 风暴主体（载体乙侧最小模块）
const IV = (k: string) => `/interview/iv-uc002b-${k}-${S}/events`;
const QZ = (k: string) => `/quiz/qz-uc002b-${k}-${S}/events`;

/**
 * 等待谓词成立（XREP sse-cross-replica.proof.ts:317-:322 同形·Ban 裸 sleep 硬等——判定面恒谓词非
 * 时长）。谓词签名 ()=>Promise<boolean>：同步谓词（进程内 Map 读数）以 async 包裹零语义改
 * （rev r3 P2① 落码注记）。超时=FAIL 计红（机制红→§8·Ban 借环境抖动重跑冲绿）。
 */
async function waitFor(label: string, predicate: () => Promise<boolean>, timeoutMs: number, stepMs = 100): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await predicate()) return true;
    if (Date.now() > deadline) {
      console.log(`FAIL  timeout_waiting:${label}（机制红：释放传播窗 15s 未观测到→§8 停止条件·Ban 借环境抖动重跑冲绿）`);
      return false;
    }
    await sleep(stepMs);
  }
}

/** 进程内槽计数观测载体（sse-slot :54-:56 形·直读 RateLimitService 私有 Map·rev r3 P2①）。 */
function slotCount(rl: RateLimitService, key: string): number {
  return (rl as unknown as { slots: Map<string, number> }).slots.get(key) ?? 0;
}

type HeldStream = {
  ac: AbortController;
  reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
};

async function openSse(base: string, path: string, user: string): Promise<{
  status: number;
  contentType: string;
  hold: HeldStream | undefined;
  body: unknown;
}> {
  const ac = new AbortController();
  const res = await fetch(base + path, { headers: U(user), signal: ac.signal });
  const contentType = res.headers.get('content-type') ?? '';
  if (res.status === 200 && contentType.includes('text/event-stream') && res.body) {
    const reader = res.body.getReader();
    void reader.read().catch(() => undefined); // drain first chunk so ping writes do not stall
    return { status: res.status, contentType, hold: { ac, reader }, body: undefined };
  }
  // Read the JSON envelope before aborting — aborting first yields {} and hides too_many_streams.
  const body = await res.json().catch(() => ({}));
  ac.abort();
  return { status: res.status, contentType, hold: undefined, body };
}

async function release(hold: HeldStream | undefined): Promise<void> {
  if (!hold) return;
  hold.ac.abort();
  try { await hold.reader?.cancel(); } catch { /* already closed */ }
}

function createCountingDb() {
  const byPrincipal = new Map<string, number>();
  return {
    byPrincipal,
    calls(principal: string): number {
      return byPrincipal.get(principal) ?? 0;
    },
    asPrincipal: async <T>(user: string, fn: (c: { query: (...args: unknown[]) => Promise<{ rowCount: number; rows: unknown[] }> }) => Promise<T>): Promise<T> => {
      byPrincipal.set(user, (byPrincipal.get(user) ?? 0) + 1);
      return fn({
        query: async () => ({ rowCount: 1, rows: [] }),
      });
    },
  };
}

/** Catch-up/poll 计数包装（sse-slot :96-:110 形）：首 events()（无 Last-Event-ID）=catch-up；带游标=poll。 */
function wrapEvents(svc: { events: (principal: string, id: string, lastEventId?: string) => unknown }, catchUp: Map<string, number>) {
  const orig = svc.events.bind(svc);
  svc.events = (principal: string, id: string, lastEventId?: string) => {
    if (lastEventId === undefined) catchUp.set(principal, (catchUp.get(principal) ?? 0) + 1);
    return orig(principal, id, lastEventId);
  };
}

/** 载体甲最小模块（sse-slot :112-:131 形·compile 期 useValue·Map 计数即模式证人）。 */
async function startMinimalModule(_principal: string) {
  const db = createCountingDb();
  const rl = new RateLimitService();
  const interviews = new InterviewService(db as unknown as DbService, rl, {} as never, {} as never, { id: 'disabled' } as never);
  const quizzes = new QuizService(db as unknown as DbService);
  const catchUp = new Map<string, number>();
  wrapEvents(interviews, catchUp);
  wrapEvents(quizzes, catchUp);

  @Module({
    controllers: [InterviewController, QuizController],
    providers: [
      PrincipalGuard,
      { provide: RateLimitService, useValue: rl },
      { provide: InterviewService, useValue: interviews },
      { provide: QuizService, useValue: quizzes },
      { provide: DbService, useValue: db },
    ],
  })
  class Uc002NhpHttpBoundModule {}

  const app = await NestFactory.create<NestFastifyApplication>(Uc002NhpHttpBoundModule, new FastifyAdapter(), { logger: false, abortOnError: false });
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  return { app, base, db, rl, catchUp };
}

// ─────────────────────────────────────────────────────────────────────────────
// 载体乙：isolated 真 PG + boot 栈（B6 态源夹逼）· 载体甲：B1–B5 双设备框架
// ─────────────────────────────────────────────────────────────────────────────
const h = await boot();
console.log('UC-E2E-002 NHP-002-HTTP-BOUND-01 prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠UC-E2E-002 covered；EXIT0 = case ≠ covered；矩阵 BOUND 格 partial 保持+case-only 收据注');
console.log('NOTE: 红停①HTTP thread-lease CAS 口/红停②snapshot 专用口两面零臂零触（裁决权归协调方·两面未闭合）');

const U = (owner: string): Record<string, string> => {
  const hdrs: Record<string, string> = {};
  hdrs['x-user-id'] = owner;
  return hdrs;
};

// B6 场景种子（owned∧ingested 绑定壳+begin 链+状态种子写+额度种子·seedBeginFixture 形制 additive
// 重放·§5 豁免①具名）：resume ingested+created 面试在 INSERT 时绑定（sql/22 触发器禁 UPDATE 绑定）。
const RID_B6 = `32020000-1111-4111-8111-${'b'.padStart(12, '0')}`;
const SHA_B6 = Buffer.from(`uc002-nhp-http-bound-b6-${S}`).toString('hex').padEnd(64, '0').slice(0, 64);
const IV_B6 = `IV_UC002_B6_${S}`;
const OWNB6 = `uc002b6-${S}`;

// begin 链夹具前置（additive-only·0064/0049/0142 面·真相=迁移链·≠ 迁移 covered）——须先于
// interview INSERT（绑定壳 INSERT 时绑定·sql/01 严格 ck 全 NULL/全非 NULL 先放开）。
await h.pool.query('ALTER TABLE interview ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint');
await h.pool.query('ALTER TABLE interview ADD COLUMN IF NOT EXISTS application_attempt int');
await h.pool.query(`
ALTER TABLE interview_job ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;
ALTER TABLE interview_job ALTER COLUMN reference_schema_version SET DEFAULT 64;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_check;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_chk;
ALTER TABLE interview_job ADD CONSTRAINT interview_job_reference_schema_version_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version IN (49, 50, 64));
`);
await h.pool.query(`
ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_binding_complete;
ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
  CHECK (
    (application_id IS NULL AND job_id IS NULL)
    OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL)
  );
`);
await h.pool.query(readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0142_candidate_profile_route.sql', import.meta.url)), 'utf8'));

await h.pool.query(
  "INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind,privacy_epoch) VALUES ($1,$2,'ingested',$3,'text',1) ON CONFLICT DO NOTHING",
  [RID_B6, OWNB6, SHA_B6],
);
await h.pool.query(
  "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,1)",
  [IV_B6, OWNB6, RID_B6],
);
// route decision/snapshot 预供给（RLS 会话内·五 case seedBeginFixture 同形）：begin 走
// supplyCandidateProfileRoute 幂等回读臂（无决策 → 409·interview.service.ts:238）。
{
  const cli = await h.pool.connect();
  try {
    await cli.query('BEGIN');
    await cli.query(`SET app.principal_user='${OWNB6}'`);
    await cli.query(
      `INSERT INTO candidate_profile_route_decision(id,interview_id,owner_user_id,resume_id,resume_content_sha,input_digest,taxonomy_version,policy_version,route_outcome,attempt_outcome,leaf_track_id,allocation_bps,decision_hash)
       VALUES ($1,$2,$3,$4,$5,$5,'v1','policy-uc002-1','route_decided','rule_decided','backend',10000,$5) ON CONFLICT (interview_id) DO NOTHING`,
      [`uc002b-cprd-${IV_B6}`, IV_B6, OWNB6, RID_B6, SHA_B6],
    );
    await cli.query(
      `INSERT INTO candidate_profile_route_snapshot(interview_id,candidate_user_id,decision_id,resume_content_sha,input_digest,taxonomy_version,leaf_track_id,allocation_bps,status)
       VALUES ($1,$2,$3,$4,$4,'v1','backend',10000,'interview_snapshotted') ON CONFLICT (interview_id) DO NOTHING`,
      [IV_B6, OWNB6, `uc002b-cprd-${IV_B6}`, SHA_B6],
    );
    await cli.query('COMMIT');
  } finally { cli.release(); }
}
await h.pool.query(
  "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')",
  [OWNB6],
);

const bal = (owner: string) => asPrincipal(h.pool, owner, (c) => availableUnits(c, owner));
const consCountAll = (owner: string) =>
  asPrincipal(h.pool, owner, (c) => c.query('SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1', [owner]))
    .then((r) => r.rows[0].n as number);
const consStatusOf = (owner: string, key: string) =>
  asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key],
  )).then((r) => r.rows[0]?.status as string | undefined);
const evCount = (owner: string, stream: string, kind: string) =>
  asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT count(*)::int n FROM interview_event WHERE owner_user_id=$1 AND stream_key=$2 AND kind=$3', [owner, stream, kind],
  )).then((r) => r.rows[0].n as number);

// ── B6 前置：begin 202（真产品路径·本地隔离库 keyless·零模型触点）+ sentinel 直置 ──
{
  console.log('\n──────── B6 · 载体乙真 PG 场景种子（begin 202→reserved→sentinel 直置）────────');
  const beginHeaders = U(OWNB6);
  beginHeaders['resume-id'] = RID_B6;
  const b = await h.post(`/interview/${IV_B6}/begin`, beginHeaders, {});
  A('B6.begin HTTP begin → 202 accepted+jobId（真产品嘴·本地隔离库）', b.status === 202 && b.body?.accepted === true && typeof b.body?.jobId === 'string');
  A('B6.begin consumption 恰 1 行 reserved（idempotency_key=interview id）', (await consCountAll(OWNB6)) === 1 && (await consStatusOf(OWNB6, IV_B6)) === 'reserved');
  A('B6.begin 额度 5→4（真实扣 1·begin 后仍 created·Ban 状态推进依赖）', (await bal(OWNB6)) === 4 && (await h.pool.query('SELECT status FROM interview WHERE id=$1', [IV_B6])).rows[0].status === 'created');
  // 夹具直置 sentinel（rev r2 P2 词面：waiting_user 借形·断言面值无关·直写先例 scor-00:151）
  await h.pool.query("UPDATE interview SET status='waiting_user' WHERE id=$1 AND owner_user_id=$2", [IV_B6, OWNB6]);
  const before = await h.req('GET', `/interview/${IV_B6}`, U(OWNB6));
  A('B6.sentinel GET :id → 200+status=waiting_user（前夹逼·零状态分支直透）', before.status === 200 && before.body?.status === 'waiting_user');
}

// ─────────────────────────────────────────────────────────────────────────────
// B1–B5 · 载体甲（双设备一桶·进程内 Map 形）
// ─────────────────────────────────────────────────────────────────────────────
const m = await startMinimalModule(DEV);
const held: HeldStream[] = [];
try {
  // ── B1 · 跨设备共享桶占满（同 principal·设备 A×3+设备 B×2·面试/押题双口交叉）──
  console.log('\n──────── B1 · 跨设备共享桶占满（设备 A×3+设备 B×2=5·双口交叉）────────');
  const devA1 = await openSse(m.base, IV('a'), DEV);
  const devA2 = await openSse(m.base, IV('a'), DEV);
  const devA3 = await openSse(m.base, QZ('a'), DEV);
  A('B1 设备A面试第1条 → 200 text/event-stream', devA1.status === 200 && devA1.contentType.includes('text/event-stream') && !!devA1.hold);
  A('B1 设备A面试第2条 → 200 text/event-stream', devA2.status === 200 && devA2.contentType.includes('text/event-stream') && !!devA2.hold);
  A('B1 设备A押题第3条 → 200 text/event-stream（同主体跨口同桶）', devA3.status === 200 && devA3.contentType.includes('text/event-stream') && !!devA3.hold);
  const devB1 = await openSse(m.base, IV('b'), DEV);
  const devB2 = await openSse(m.base, QZ('b'), DEV);
  A('B1 设备B面试第4条 → 200 text/event-stream（跨设备同 principal 共享桶）', devB1.status === 200 && devB1.contentType.includes('text/event-stream') && !!devB1.hold);
  A('B1 设备B押题第5条 → 200 text/event-stream', devB2.status === 200 && devB2.contentType.includes('text/event-stream') && !!devB2.hold);
  A('B1 双设备合计进程内槽计数 = 5（sse:${principal} 键跨 client 共享=UC-002 双设备一桶）', slotCount(m.rl, PKEY) === 5);
  for (const r of [devA1, devA2, devA3, devB1, devB2]) if (r.hold) held.push(r.hold);

  // ── B2 · 第 6 条 429 具名码（设备 B 第 6 条·JSON 非 SSE envelope·被拒不占槽）──
  console.log('\n──────── B2 · 设备 B 第 6 条 → 429 too_many_streams ────────');
  const sixth = await openSse(m.base, IV('b'), DEV);
  const sixthErr = (sixth.body as { error?: string }).error;
  A('B2 第 6 条（设备B·面试口）→ 429 具名码 too_many_streams', sixth.status === 429 && sixthErr === 'too_many_streams');
  A('B2 拒绝为 JSON 非 SSE envelope（无 hold·无 event-stream 头）', !sixth.contentType.includes('text/event-stream') && !sixth.hold && typeof sixth.body === 'object');
  A('B2 三次拒绝后槽仍为 5（被拒不占槽·RL_SHARED_DEGRADED 前置形不承登=载体甲无 db 结构性不可达·Map 计数即模式证人）', slotCount(m.rl, PKEY) === 5);

  // ── B3 · 拒连零取数零轮询（UC184 领槽先于取数 :259-:262 同码）──
  console.log('\n──────── B3 · 拒连零取数（catch-up）零轮询（2s 环不入）────────');
  A('B3 catch-up 计数恰 5（仅 5 条占槽连接付取数·拒连零付·UC184 领槽先于取数）', (m.catchUp.get(DEV) ?? 0) === 5);
  const afterReject = m.db.calls(DEV);
  await sleep(2100);
  A('B3 满 5 后一个 poll 周期 counting stub 只 +5（holders 入环·被拒连接不入 2s 轮询环）', m.db.calls(DEV) - afterReject === 5);

  // ── B4 · 释放跨设备交接（设备 A abort 一条→finally releaseSlot :278→poll-until 槽 4→设备 B 再连）──
  console.log('\n──────── B4 · 释放传播 poll-until 槽 4（XREP waitFor 形·step 100ms·上限 15s）→设备 B 再连 200 ────────');
  await release(devA1.hold);
  try { await devA1.hold?.reader?.cancel(); } catch { /* already closed */ }
  const drained = await waitFor('b4-slot-4', async () => slotCount(m.rl, PKEY) === 4, 15_000);
  A('B4 设备A abort 一条后槽传播至 4（finally releaseSlot 全退出路径·poll-until 非裸 sleep·超时=机制红）', drained);
  const devB3 = await openSse(m.base, IV('b'), DEV);
  A('B4 释放后设备 B 再连 → 200 text/event-stream（交接方向跨设备=UC-002 场景义·非立即断言再连）', devB3.status === 200 && devB3.contentType.includes('text/event-stream') && !!devB3.hold);
  if (devB3.hold) held.push(devB3.hold);
  A('B4 再占后槽回到 5（XR-4「释放可再占」单进程同构臂）', slotCount(m.rl, PKEY) === 5);

  // ── B5 · 异主体隔离（第三主体独立桶不受满桶影响·userA 槽位双侧不变）──
  console.log('\n──────── B5 · 异主体隔离（userB 独立桶·userA 双侧不变）────────');
  const iso = await openSse(m.base, IV('iso'), ISO);
  A('B5 异主体满桶下仍 → 200 text/event-stream', iso.status === 200 && iso.contentType.includes('text/event-stream') && !!iso.hold);
  if (iso.hold) held.push(iso.hold);
  A('B5 userB 自有槽 = 1（独立桶）', slotCount(m.rl, `sse:${ISO}`) === 1);
  A('B5 userA 槽位双侧不变：A 侧桶仍 5（异主体零挤占）', slotCount(m.rl, PKEY) === 5);
  A('B5 userB catch-up 自付恰 1（取数面同样隔离）', (m.catchUp.get(ISO) ?? 0) === 1);
} finally {
  for (const hold of held) await release(hold);
  await m.app.close();
}

// ── B6 · 载体乙风暴+真 PG 态源前后夹逼（额度桶恒值+consumption 零新增+GET :id 恒等）──
console.log('\n──────── B6 · 同主体 6×429 风暴（载体甲同构最小模块）→ 真 PG 态源夹逼 ────────');
{
  const db6 = {
    asPrincipal: async <T>(_user: string, fn: (c: { query: (...args: unknown[]) => Promise<{ rowCount: number; rows: unknown[] }> }) => Promise<T>): Promise<T> =>
      fn({ query: async () => ({ rowCount: 1, rows: [] }) }),
  };
  const rl6 = new RateLimitService();
  const interviews6 = new InterviewService(db6 as unknown as DbService, rl6, {} as never, {} as never, { id: 'disabled' } as never);
  const slotCount6 = (key: string) => (rl6 as unknown as { slots: Map<string, number> }).slots.get(key) ?? 0;
  type Held6 = { ac: AbortController; reader: ReadableStreamDefaultReader<Uint8Array> | undefined };
  const openSse6 = async (user: string): Promise<{ status: number; ct: string; hold: Held6 | undefined; body: unknown }> => {
    const ac6 = new AbortController();
    const res6 = await fetch(base6 + `/interview/iv-uc002b-storm-${S}/events`, { headers: U(user), signal: ac6.signal });
    const ct6 = res6.headers.get('content-type') ?? '';
    if (res6.status === 200 && ct6.includes('text/event-stream') && res6.body) {
      const rd = res6.body.getReader();
      void rd.read().catch(() => undefined);
      return { status: res6.status, ct: ct6, hold: { ac: ac6, reader: rd }, body: undefined };
    }
    const body = await res6.json().catch(() => ({}));
    ac6.abort();
    return { status: res6.status, ct: ct6, hold: undefined, body };
  };
  const release6 = async (hold: Held6 | undefined) => {
    if (!hold) return;
    hold.ac.abort();
    try { await hold.reader?.cancel(); } catch { /* already closed */ }
  };
  @Module({
    controllers: [InterviewController],
    providers: [
      PrincipalGuard,
      { provide: RateLimitService, useValue: rl6 },
      { provide: InterviewService, useValue: interviews6 },
      { provide: DbService, useValue: db6 },
    ],
  })
  class Uc002StormModule {}

  const app6 = await NestFactory.create<NestFastifyApplication>(Uc002StormModule, new FastifyAdapter(), { logger: false, abortOnError: false });
  app6.useGlobalFilters(new AllExceptionsFilter());
  await app6.listen(0, '127.0.0.1');
  const base6 = (await app6.getUrl()).replace('[::1]', '127.0.0.1');
  const held6: Held6[] = [];
  try {
    const five = await Promise.all([openSse6(STORM), openSse6(STORM), openSse6(STORM), openSse6(STORM), openSse6(STORM)]);
    five.forEach((r, i) => A(`B6.storm 风暴前占槽 ${i + 1}/5 → 200 text/event-stream`, r.status === 200 && r.ct.includes('text/event-stream') && !!r.hold));
    five.forEach((r) => { if (r.hold) held6.push(r.hold); });
    A('B6.storm 满额进程内槽计数=5', slotCount6(`sse:${STORM}`) === 5);
    const rejects = await Promise.all([openSse6(STORM), openSse6(STORM), openSse6(STORM), openSse6(STORM), openSse6(STORM), openSse6(STORM)]);
    A('B6.storm 6×429 全部具名码 too_many_streams（同主体风暴·非 SSE envelope）',
      rejects.every((r) => r.status === 429 && (r.body as { error?: string }).error === 'too_many_streams' && !r.ct.includes('text/event-stream')));
    A('B6.storm 风暴后槽仍 5（被拒不占槽）', slotCount6(`sse:${STORM}`) === 5);

    // 真 PG 态源前后夹逼（boot 栈 429 不可达=fail-open 机制源如实申明·风暴零产品路径写入）
    const afterBal = await bal(OWNB6);
    const afterCons = await consCountAll(OWNB6);
    A('B6.clamp 额度桶恒值 4.0（429 风暴零假扣零双扣=:89「输者不双扣」槽满边界映射）', afterBal === 4);
    A('B6.clamp consumption 零新增（恰 begin 种子 1 行·reserved 原样）', afterCons === 1 && (await consStatusOf(OWNB6, IV_B6)) === 'reserved');
    const afterGet = await h.req('GET', `/interview/${IV_B6}`, U(OWNB6));
    A('B6.clamp 原会话 GET :id → 200+status=waiting_user 恒等（后夹逼·TERMINAL_INTERVIEW 不含 waiting_user·零状态分支直透）', afterGet.status === 200 && afterGet.body?.status === 'waiting_user');
    A('B6.clamp 零假终态（无 interview_unavailable 事件）', (await evCount(OWNB6, IV_B6, 'interview_unavailable')) === 0);
    for (const hold of held6) await release6(hold);
  } finally {
    for (const hold of held6) await release6(hold);
    await app6.close();
  }
}

console.log('\nNOTE: still ≠covered; matrix BOUND cell stays **partial**+case-only; red-stop ①②两面未闭合零臂零触');
await done();
