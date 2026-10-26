/**
 * UC-E2E-017 orphan HTTP/SSE isolated prove (eval-first · real POST /interview/:id/begin ·
 * real POST /interview/:id/abandon · real GET /interview/:id/events) — 一行一 case 五面：
 *
 *   NHP-017-HTTP-FAULT-01  FAULT  HTTP begin 202→reserved 可观测→fixture 租约过期注入（sweeper 同款）→
 *                                生产调度嘴 reconcileOwner 直调回收 → staleReleased≥1+released+额度回补
 *                                +interview_unavailable 终态事件+HTTP GET 终态可读
 *   NHP-017-HTTP-COMP-01   FAULT  HTTP 补偿嘴：begin 202+reserved → POST :id/abandon → 200 released
 *                                （interview.service.ts:654/:658 abandonInterviewAndRelease 区）+额度净零
 *   NHP-017-SSE-FAULT-01   FAULT  begin 202 后 SSE 建连→客户端中断注入（abort）→拆除本身零假释放零新
 *                                orphan（原预占语义不变）；附 404 跨主体 events+429 槽满子臂（见下承载注记）
 *   NHP-017-HTTP-BOUND-01  BOUND  同 interview 重复 HTTP begin（网络重试形·replay 臂沿
 *                                resume-reference-http.proof.ts:82-93 先例）→202 alreadyBegun 同 jobId
 *                                +start job 计数不变+consumption 恰 1 行+额度净零增量（不双扣）
 *   NHP-017-HTTP-NEG-01    NEG    错主体 abandon/events（HTTP 真嘴 RLS 零行 404·:652）→原预占仍 reserved
 *
 * Honest pins（头注必带）：
 *   releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-017 covered · EXIT0 = case ≠ covered。
 *   fixture = run-e2e-isolated 一次性 pgvector 隔离库（green-risk / R5 注记·≠ sole-stack ≠ RAG migrated）。
 *   集成半自证句对照：packages/db/test/uc-e2e-017-orphan-reservation.proof.ts:139
 *   「BLOCKED_FOR_FULL_E2E: HTTP begin-fail inject / SSE-after-commit orphan not in e2e:isolated yet」——
 *   本刀行使其 HTTP/SSE 半；fixture 租约过期注入 = commit 后故障点/进程崩溃的诚实模拟形态预登
 *   （REQUEST §1.3-(C)），非进程级 SIGKILL 注入（那归另刀）。
 *   0058 stub 注记（rev2 P2-1 归因改写）：boot() 已内置 interview_privacy_active 最小镜像
 *   （_neg-harness.ts:111-126）+ assert_interview_privacy_active（_neg-harness.ts:212-225 · 0058 真函数体
 *   逐字），覆盖五 case 全隐私触点（FAULT-01 begin+reconcileOwner 围栏 SELECT（commerce-reconcile.ts:50）/
 *   COMP-01 begin+abandon / SSE-FAULT-01 begin+events / BOUND-01 begin×2 / NEG-01 RLS 零行）——proof 级
 *   018 形 stub（uc-e2e-018-user-abandon-http.proof.ts:32-59 先例）系沿承防御面**可免装**，本刀不装；
 *   形状差备查：harness 镜像=SECURITY DEFINER，018 形 stub=invoker-rights。
 *   SSE-FAULT-01 429 子臂承载（REQUEST §9-rev 1-(b) rev2 收紧形）：默认 boot 栈下 migration 0189 未装载 →
 *   gateway_slot_lease_acquire 缺失 → RateLimitService.acquireSlot 共享臂 fail-open return true
 *   （rate-limit.service.ts:158-175 亲证）→ 429 槽满在 booted 栈永不发生；本子臂沿
 *   sse-principal-slot.proof.ts:91,112-131 形**自建最小模块同进程承载**（compile 期 useValue 覆盖 ·
 *   :91 new RateLimitService() 无 DbService=本地 Map 模式），boot() 栈承载其余子臂——boot() 无
 *   override 缝三锚亲证（_neg-harness.ts:63 createApp() 零参编译 / :29-37 Harness 返回面 / :324-329
 *   boot() 返回面均无 app 句柄）。
 *
 * 零产品码触面（apps/api/src · packages/db/src · apps/worker/src 全零字节）·零迁移（0064/0142 夹具
 * 面沿 trial-grant.proof.ts applyBeginChainPreamble/neg-interview:27-180 播种形制 additive 重放）·
 * 零 live key（boot() :61-62 delete MODEL_API_KEY/MODEL_BASE_URL 承载）·零模型外呼·est live=0。
 *
 *   pnpm uc017:orphan-http-sse:prove               (via run-e2e-isolated)
 *   pnpm -C apps/api prove:uc017-orphan-http-sse   (raw; needs isolated PG env from the runner)
 *
 * Matrix stays **partial**（e2e-requirement-coverage-matrix.md:122 六列行零触·翻面权归协调方）。
 */
import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { asPrincipal, availableUnits } from '@meetwise/db';
import { reconcileOwner } from '../../worker/src/commerce-reconcile.ts';
import { InterviewController } from '../src/modules/interview/interview.controller.ts';
import { InterviewService } from '../src/modules/interview/interview.service.ts';
import { AllExceptionsFilter } from '../src/platform/all-exceptions.filter.ts';
import { DbService } from '../src/platform/db.service.ts';
import { PrincipalGuard } from '../src/platform/principal.guard.ts';
import { RateLimitService } from '../src/platform/rate-limit.service.ts';
import { boot, mkAssert } from './_neg-harness';

if (process.env.NODE_ENV === 'production') process.env.NODE_ENV = 'test';

const h = await boot();
const { A, done } = mkAssert('uc017:orphan-http-sse');

console.log('UC-E2E-017 orphan HTTP/SSE prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠全链路 E2E covered；≠ UC-E2E-017 covered；EXIT0 = case ≠ covered；matrix partial 翻面权归协调方');
console.log('NOTE: fixture=pgvector isolated (green-risk/R5)·零 live key·零模型外呼·est live=0');

const S = Date.now().toString(36);
const OWNF = (k: string) => `uc017h-${k}-${S}`;
const IIDF = (k: string) => `IV_H017_${k}_${S}`;
// resume id 必须 uuid 列形（resume_id uuid）——固定可读段+case 序数，五 case 互异。
const RIDF = (n: number) => `3101${String(n).padStart(4, '0')}-1111-4111-8111-${String(n).padStart(12, '0')}`;
const SHA = (k: string) => Buffer.from(`uc017-http-sse-${k}-${S}`).toString('hex').padEnd(64, '0').slice(0, 64);

// 头构造走成员赋值（naming-convention memberLike 只警属性声明面·零新 lint warning）
const U = (owner: string): Record<string, string> => {
  const hdrs: Record<string, string> = {};
  hdrs['x-user-id'] = owner;
  return hdrs;
};
const H = (owner: string, resumeId: string): Record<string, string> => {
  const hdrs = U(owner);
  hdrs['resume-id'] = resumeId;
  return hdrs;
};
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedOwnerBucket(owner: string, units = 5.0) {
  await h.pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')",
    [owner, units],
  );
}

/** resume ingested + created 面试在 INSERT 时绑定（sql/22 触发器禁 UPDATE 绑定）——trial-grant.proof.ts
 *  seedBeginFixture 播种形制（neg-interview:218-264 同源）。route decision/snapshot 预供给 → begin 走
 *  supplyCandidateProfileRoute 幂等回读臂（candidate-route.ts:46-52）→ 免解密直通扣额/入队=202。 */
async function seedBeginFixture(owner: string, interviewId: string, resumeId: string, sha: string) {
  await h.pool.query(
    "INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind,privacy_epoch) VALUES ($1,$2,'ingested',$3,'text',1) ON CONFLICT DO NOTHING",
    [resumeId, owner, sha],
  );
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,1)",
    [interviewId, owner, resumeId],
  );
  const cli = await h.pool.connect();
  try {
    await cli.query('BEGIN');
    await cli.query(`SET app.principal_user='${owner}'`);
    await cli.query(
      `INSERT INTO candidate_profile_route_decision(id,interview_id,owner_user_id,resume_id,resume_content_sha,input_digest,taxonomy_version,policy_version,route_outcome,attempt_outcome,leaf_track_id,allocation_bps,decision_hash)
       VALUES ($1,$2,$3,$4,$5,$5,'v1','policy-uc017-1','route_decided','rule_decided','backend',10000,$5) ON CONFLICT (interview_id) DO NOTHING`,
      [`uc017h-cprd-${interviewId}`, interviewId, owner, resumeId, sha],
    );
    await cli.query(
      `INSERT INTO candidate_profile_route_snapshot(interview_id,candidate_user_id,decision_id,resume_content_sha,input_digest,taxonomy_version,leaf_track_id,allocation_bps,status)
       VALUES ($1,$2,$3,$4,$4,'v1','backend',10000,'interview_snapshotted') ON CONFLICT (interview_id) DO NOTHING`,
      [interviewId, owner, `uc017h-cprd-${interviewId}`, sha],
    );
    await cli.query('COMMIT');
  } finally { cli.release(); }
}

/** begin 链夹具前置（additive-only）：沿 trial-grant.proof.ts applyBeginChainPreamble 形制（其自证源=
 *  neg-interview:27-180），0058 栅栏函数块**不重放**（boot() :111-126/:212-225 已内置镜像=rev2 P2-1
 *  可免装注记）。真相=迁移链 0064（v64 面）/0049（绑定语义）/0142（route 供给表）；此处为 harness
 *  sql/01-23 挑选单的 additive 补齐，≠ 迁移 covered。 */
async function applyBeginChainPreamble() {
  // ② 0064 interview.resume_privacy_epoch 列
  await h.pool.query('ALTER TABLE interview ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint');
  // ⑤ 0064 interview_job v64 面（begin 幂等查询/enqueue 均写 64；sql/05 inline CHECK=50 须双名.drop）
  await h.pool.query(`
ALTER TABLE interview_job ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;
ALTER TABLE interview_job ALTER COLUMN reference_schema_version SET DEFAULT 64;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_check;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_chk;
ALTER TABLE interview_job ADD CONSTRAINT interview_job_reference_schema_version_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version IN (49, 50, 64));
`);
  // ④ 0049 绑定语义对齐（CHECK 放开 application/job 全 NULL 时 resume 独立；触发器允许恰好一次绑定）
  await h.pool.query('ALTER TABLE interview ADD COLUMN IF NOT EXISTS application_attempt int');
  await h.pool.query(`
ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_binding_complete;
ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
  CHECK (
    (application_id IS NULL AND job_id IS NULL)
    OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL)
  );
`);
  await h.pool.query(`
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
  // ③ 0142 candidate-profile route 面（begin 供给面 supplyCandidateProfileRoute 直查；幂等可重放）
  const mig = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/${f}`, import.meta.url)), 'utf8');
  await h.pool.query(mig('0142_candidate_profile_route.sql'));
}
await applyBeginChainPreamble();
console.log('PIN   GAP-UC017-BEGIN-FIXTURE-PREAMBLE: 0064/0049/0142 additive 夹具补齐（真相=迁移链·≠ 迁移 covered）');
console.log('PIN   GAP-UC017-PRIVACY-MIRROR: boot() 内置 0058 镜像承载隐私触点（proof 级 stub 可免装·rev2 P2-1）');

const bal = (owner: string) => asPrincipal(h.pool, owner, (c) => availableUnits(c, owner));
const ivStatus = (id: string) =>
  h.pool.query('SELECT status FROM interview WHERE id=$1', [id]).then((r) => r.rows[0]?.status as string | undefined);
const consStatus = (owner: string, key: string) =>
  asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key],
  )).then((r) => r.rows[0]?.status as string | undefined);
const consCount = (owner: string, key: string) =>
  asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key],
  )).then((r) => r.rows[0].n as number);
const evCount = (owner: string, stream: string, kind: string) =>
  asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT count(*)::int n FROM interview_event WHERE owner_user_id=$1 AND stream_key=$2 AND kind=$3', [owner, stream, kind],
  )).then((r) => r.rows[0].n as number);
const startJobs = (id: string) =>
  h.pool.query("SELECT count(*)::int n FROM interview_job WHERE interview_id=$1 AND kind='start'", [id])
    .then((r) => r.rows[0].n as number);

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-HTTP-FAULT-01 · FAULT · HTTP begin→reserved→fixture 租约过期→生产调度嘴 reconcileOwner 回收
// ─────────────────────────────────────────────────────────────────────────────
{
  console.log('\n──────── NHP-017-HTTP-FAULT-01 · HTTP begin → 租约过期注入 → reconcileOwner 回收 ────────');
  const owner = OWNF('fault'), id = IIDF('fault'), rid = RIDF(1);
  await seedOwnerBucket(owner, 5.0);
  await seedBeginFixture(owner, id, rid, SHA('fault'));
  const before = await bal(owner);

  const b = await h.post(`/interview/${id}/begin`, H(owner, rid), {});
  A('FAULT-01 HTTP begin → 202 accepted+jobId', b.status === 202 && b.body?.accepted === true && typeof b.body?.jobId === 'string' && b.body?.alreadyBegun !== true);
  A('FAULT-01 reserved 可观测（consumption idempotency_key=interview id）', (await consStatus(owner, id)) === 'reserved');
  A('FAULT-01 预留扣 1.0（5→4）', (await bal(owner)) === before - 1);

  // fixture 租约过期注入（sweeper 同款·commit 后故障的诚实模拟形态·REQUEST §1.3-(C) 预登）
  await h.pool.query(
    "UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2",
    [owner, id],
  );
  // 生产调度嘴直调（apps/worker/src/commerce-reconcile.ts:34 导出形·进程内直调同一函数·非跨进程 worker 编排）
  const rec = await reconcileOwner(h.pool, owner);
  A('FAULT-01 reconcileOwner staleReleased≥1', rec.staleReleased >= 1);
  A('FAULT-01 reconcileOwner abandoned≥1（mock_interview 终态口径）', rec.abandoned >= 1);
  A('FAULT-01 consumption → released', (await consStatus(owner, id)) === 'released');
  A('FAULT-01 interview 终态 abandoned', (await ivStatus(id)) === 'abandoned');
  A('FAULT-01 interview_unavailable 终态事件已补发（无静默死胡同）', (await evCount(owner, id, 'interview_unavailable')) >= 1);
  A('FAULT-01 额度全回补（4→5·净零泄漏）', (await bal(owner)) === before);
  const got = await h.req('GET', `/interview/${id}`, U(owner));
  A('FAULT-01 HTTP GET 终态可读（200 abandoned）', got.status === 200 && got.body?.status === 'abandoned' && got.body?.id === id);
}

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-HTTP-COMP-01 · FAULT · HTTP 补偿嘴 abandon（:654/:658 abandonInterviewAndRelease 区）
// ─────────────────────────────────────────────────────────────────────────────
{
  console.log('\n──────── NHP-017-HTTP-COMP-01 · HTTP begin → POST abandon → 200 released ────────');
  const owner = OWNF('comp'), id = IIDF('comp'), rid = RIDF(2);
  await seedOwnerBucket(owner, 5.0);
  await seedBeginFixture(owner, id, rid, SHA('comp'));
  const before = await bal(owner);

  const b = await h.post(`/interview/${id}/begin`, H(owner, rid), {});
  A('COMP-01 HTTP begin → 202 accepted', b.status === 202 && b.body?.accepted === true);
  A('COMP-01 reserved 可观测', (await consStatus(owner, id)) === 'reserved');
  A('COMP-01 预留扣 1.0（5→4）', (await bal(owner)) === before - 1);

  const r = await h.post(`/interview/${id}/abandon`, U(owner), {});
  A('COMP-01 POST abandon → 200', r.status === 200);
  A('COMP-01 body.abandoned=true', r.body?.abandoned === true);
  A('COMP-01 body.released=released', r.body?.released === 'released');
  A('COMP-01 body.alreadyAbandoned≠true', r.body?.alreadyAbandoned !== true);
  A('COMP-01 interview=abandoned', (await ivStatus(id)) === 'abandoned');
  A('COMP-01 consumption 终态 released', (await consStatus(owner, id)) === 'released');
  A('COMP-01 额度净零（回补·4→5）', (await bal(owner)) === before);
}

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-SSE-FAULT-01 · FAULT · SSE 建连→abort→拆除零假释放零新 orphan；附 404 跨主体+429 槽满子臂
// ─────────────────────────────────────────────────────────────────────────────
{
  console.log('\n──────── NHP-017-SSE-FAULT-01 · SSE 建连→abort→拆除（附 404 跨主体/429 槽满子臂）────────');
  const owner = OWNF('sse'), id = IIDF('sse'), rid = RIDF(3);
  await seedOwnerBucket(owner, 5.0);
  await seedBeginFixture(owner, id, rid, SHA('sse'));
  const before = await bal(owner);

  const b = await h.post(`/interview/${id}/begin`, H(owner, rid), {});
  A('SSE-FAULT-01 HTTP begin → 202 accepted', b.status === 202 && b.body?.accepted === true);
  A('SSE-FAULT-01 原预占 reserved（拆除前基线）', (await consStatus(owner, id)) === 'reserved');

  // SSE 建连（boot() 真 HTTP 栈·真 GET /interview/:id/events hijack 泵）
  const ac = new AbortController();
  const res = await fetch(h.base + `/interview/${id}/events`, { headers: U(owner), signal: ac.signal });
  const ct = res.headers.get('content-type') ?? '';
  A('SSE-FAULT-01 建连 → 200 text/event-stream', res.status === 200 && ct.includes('text/event-stream') && !!res.body);
  const reader = res.body!.getReader();
  void reader.read().catch(() => undefined);   // drain 首帧，防 ping 写滞留（sse-principal-slot 同形）
  await sleep(500);
  // 客户端中断注入（abort/close）
  ac.abort();
  try { await reader.cancel(); } catch { /* already closed */ }
  await sleep(800);   // 拆除窗：reqRaw close → 泵退出 → 控制器 finally releaseSlot
  A('SSE-FAULT-01 拆除零假释放（consumption 仍 reserved）', (await consStatus(owner, id)) === 'reserved');
  A('SSE-FAULT-01 拆除零新 orphan（恰 1 行 consumption）', (await consCount(owner, id)) === 1);
  A('SSE-FAULT-01 原预占语义不变（额度仍 -1）', (await bal(owner)) === before - 1);
  A('SSE-FAULT-01 零假终态（无 interview_unavailable 事件）', (await evCount(owner, id, 'interview_unavailable')) === 0);
  A('SSE-FAULT-01 interview 未被 SSE 拆除翻转（仍 created）', (await ivStatus(id)) === 'created');

  // 附 404 跨主体 events（HTTP 真嘴 RLS）
  const other = OWNF('sse-other');
  await seedOwnerBucket(other, 5.0);
  const x404 = await h.req('GET', `/interview/${id}/events`, U(other));
  A('SSE-FAULT-01 附：跨主体 events → 404 not_found_or_forbidden', x404.status === 404 && x404.body?.error === 'not_found_or_forbidden');

  // 429 槽满子臂：沿 sse-principal-slot.proof.ts:91,112-131 形自建最小模块同进程承载
  // （compile 期 useValue 覆盖·new RateLimitService() 无 DbService=本地 Map；boot() 无 override 缝三锚）。
  const countingDb = {
    asPrincipal: async <T>(user: string, fn: (c: { query: (...args: unknown[]) => Promise<{ rowCount: number; rows: unknown[] }> }) => Promise<T>): Promise<T> =>
      fn({ query: async () => ({ rowCount: 1, rows: [] }) }),
  };
  const rl = new RateLimitService();
  const interviews = new InterviewService(countingDb as unknown as DbService, rl, {} as never, {} as never, { id: 'disabled' } as never);
  const slotCount = (key: string) => (rl as unknown as { slots: Map<string, number> }).slots.get(key) ?? 0;
  type Held = { ac: AbortController; reader: ReadableStreamDefaultReader<Uint8Array> | undefined };
  const openSse = async (base: string, user: string): Promise<{ status: number; ct: string; hold: Held | undefined; body: unknown }> => {
    const oac = new AbortController();
    const oh = U(user);
    const oRes = await fetch(base + '/interview/iv-uc017-slot/events', { headers: oh, signal: oac.signal });
    const oCt = oRes.headers.get('content-type') ?? '';
    if (oRes.status === 200 && oCt.includes('text/event-stream') && oRes.body) {
      const or = oRes.body.getReader();
      void or.read().catch(() => undefined);
      return { status: oRes.status, ct: oCt, hold: { ac: oac, reader: or }, body: undefined };
    }
    const body = await oRes.json().catch(() => ({}));
    oac.abort();
    return { status: oRes.status, ct: oCt, hold: undefined, body };
  };
  const releaseHold = async (hold: Held | undefined) => {
    if (!hold) return;
    hold.ac.abort();
    try { await hold.reader?.cancel(); } catch { /* already closed */ }
  };
  @Module({
    controllers: [InterviewController],
    providers: [
      PrincipalGuard,
      { provide: RateLimitService, useValue: rl },
      { provide: InterviewService, useValue: interviews },
      { provide: DbService, useValue: countingDb },
    ],
  })
  class Uc017Sse429Module {}

  const app429 = await NestFactory.create<NestFastifyApplication>(Uc017Sse429Module, new FastifyAdapter(), { logger: false, abortOnError: false });
  app429.useGlobalFilters(new AllExceptionsFilter());
  await app429.listen(0, '127.0.0.1');
  const base429 = (await app429.getUrl()).replace('[::1]', '127.0.0.1');
  const sseUser = OWNF('sse429');
  const held: Held[] = [];
  try {
    const five = await Promise.all([openSse(base429, sseUser), openSse(base429, sseUser), openSse(base429, sseUser), openSse(base429, sseUser), openSse(base429, sseUser)]);
    five.forEach((r, i) => A(`SSE-FAULT-01 429 臂·占槽 ${i + 1}/5 → 200 text/event-stream`, r.status === 200 && r.ct.includes('text/event-stream') && !!r.hold));
    five.forEach((r) => { if (r.hold) held.push(r.hold); });
    A('SSE-FAULT-01 429 臂·满额进程内槽计数=5', slotCount(`sse:${sseUser}`) === 5);
    const sixth = await openSse(base429, sseUser);
    const sixthErr = (sixth.body as { error?: string }).error;
    A('SSE-FAULT-01 429 臂·第 6 条同主体 → 429 too_many_streams（零取数副作用·不占槽）',
      sixth.status === 429 && sixthErr === 'too_many_streams' && !sixth.ct.includes('text/event-stream') && !sixth.hold);
    A('SSE-FAULT-01 429 臂·被拒后槽仍 5', slotCount(`sse:${sseUser}`) === 5);
    for (const hold of held) await releaseHold(hold);
    await sleep(2500);
    A('SSE-FAULT-01 429 臂·holds 断开后槽释放为 0', slotCount(`sse:${sseUser}`) === 0);
    const reused = await openSse(base429, sseUser);
    A('SSE-FAULT-01 429 臂·释放后可再占槽 → 200', reused.status === 200 && !!reused.hold);
    if (reused.hold) { await releaseHold(reused.hold); await sleep(500); }
  } finally {
    for (const hold of held) await releaseHold(hold);
    await app429.close();
  }
  // 主场景原预占语义在 429 臂全程后仍不变
  A('SSE-FAULT-01 收束：主场景预占仍 reserved（全程零假释放）', (await consStatus(owner, id)) === 'reserved');
}

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-HTTP-BOUND-01 · BOUND · 同 interview 重复 HTTP begin（replay 臂沿 resume-reference-http:82-93 先例）
// ─────────────────────────────────────────────────────────────────────────────
{
  console.log('\n──────── NHP-017-HTTP-BOUND-01 · 重复 HTTP begin → 202 alreadyBegun 同 jobId（不双扣）────────');
  const owner = OWNF('bound'), id = IIDF('bound'), rid = RIDF(4);
  await seedOwnerBucket(owner, 5.0);
  await seedBeginFixture(owner, id, rid, SHA('bound'));
  const before = await bal(owner);

  const first = await h.post(`/interview/${id}/begin`, H(owner, rid), {});
  A('BOUND-01 首次 begin → 202 accepted+jobId（alreadyBegun 缺席）',
    first.status === 202 && first.body?.accepted === true && typeof first.body?.jobId === 'string' && first.body?.alreadyBegun !== true);
  A('BOUND-01 首次后恰 1 个 start job', (await startJobs(id)) === 1);
  A('BOUND-01 首次后恰 1 行 consumption（reserved）', (await consCount(owner, id)) === 1 && (await consStatus(owner, id)) === 'reserved');
  A('BOUND-01 首次后额度 -1（5→4）', (await bal(owner)) === before - 1);

  const replay = await h.post(`/interview/${id}/begin`, H(owner, rid), {});
  A('BOUND-01 重复 begin → 202 alreadyBegun 同 jobId', replay.status === 202 && replay.body?.alreadyBegun === true && replay.body?.jobId === first.body?.jobId);
  A('BOUND-01 start job 计数不变（仍 1·不双入队）', (await startJobs(id)) === 1);
  A('BOUND-01 consumption 行计数不变（仍 1 行）', (await consCount(owner, id)) === 1);
  A('BOUND-01 额度净零增量（仍 4·不双扣）', (await bal(owner)) === before - 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-HTTP-NEG-01 · NEG · 错主体 abandon/events（HTTP 真嘴 RLS 零行 404）→原预占仍 reserved
// ─────────────────────────────────────────────────────────────────────────────
{
  console.log('\n──────── NHP-017-HTTP-NEG-01 · 错主体 abandon/events → 404 + 原预占仍 reserved ────────');
  const owner = OWNF('neg'), intruder = OWNF('neg-intruder'), id = IIDF('neg'), rid = RIDF(5);
  await seedOwnerBucket(owner, 5.0);
  await seedOwnerBucket(intruder, 5.0);
  await seedBeginFixture(owner, id, rid, SHA('neg'));
  const before = await bal(owner);

  const b = await h.post(`/interview/${id}/begin`, H(owner, rid), {});
  A('NEG-01 HTTP begin → 202 accepted', b.status === 202 && b.body?.accepted === true);
  A('NEG-01 原预占 reserved', (await consStatus(owner, id)) === 'reserved');

  const ab = await h.post(`/interview/${id}/abandon`, U(intruder), {});
  A('NEG-01 错主体 abandon → 404 not_found_or_forbidden（RLS 零行·:652）', ab.status === 404 && ab.body?.error === 'not_found_or_forbidden');
  const ev = await h.req('GET', `/interview/${id}/events`, U(intruder));
  A('NEG-01 错主体 events → 404 not_found_or_forbidden', ev.status === 404 && ev.body?.error === 'not_found_or_forbidden');
  A('NEG-01 原预占仍 reserved（未被误放）', (await consStatus(owner, id)) === 'reserved');
  A('NEG-01 consumption 恰 1 行', (await consCount(owner, id)) === 1);
  A('NEG-01 额度仍 -1（未被 intruder 触碰）', (await bal(owner)) === before - 1);
  A('NEG-01 interview 仍 created（未被误改）', (await ivStatus(id)) === 'created');
}

// ── Honesty pins: still ≠ covered ──
console.log('\n──────── GAP pins (抬 covered 仍缺) ────────');
console.log('GAP-UC017-HTTP-SSE-PROCESS-CRASH: 真 commit 后故障点/进程级 SIGKILL 注入未行使（fixture 租约过期=预登诚实模拟形态·REQUEST §1.3-(C)）');
console.log('GAP-UC017-SSE-AFTER-COMMIT-ORPHAN: SSE 建连后 commit 侧孤儿注入未行使（本刀只证拆除零副作用半）');
console.log('GAP-UC017-ADV: 对抗面零触（:122 行 ADV=blind 保持·归对抗族刀）');
console.log('GAP-UC017-FULL-E2E: e2e/full.e2e.ts 纳入归协调方另裁；本绿 ≠ 全链路 E2E covered');
A('honesty: HTTP/SSE isolated prove 绿 ≠ UC-E2E-017 covered（五 case 收据≠升格·翻面权归协调方 post 双审链）', true);

await done();
