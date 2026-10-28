/**
 * UC-E2E-017 · ADV isolated PG/HTTP evidence · NHP-017-ADV-01
 * (REQUEST ai-docs/delivery/harness/x17-adv-REQUEST.md §1 rev r2 终形 · 矩阵 :122 ADV 列 blind 保持+case-only)
 *
 * Evidence layer: isolated real PG + real Nest HTTP (boot() three-layer shell ·
 * uc-e2e-017-orphan-http-sse.proof.ts 同 harness 形 · h.post/h.req/seedBeginFixture/
 * applyBeginChainPreamble 形制 additive 重放 · 每臂独立 interview/report/job 空间).
 * Scope: 孤儿任务对抗六臂族（V1/V2/V4/V5/V6/N · V3 撤臂 rev r1 §0.0.1·GAP-UC017-ADV-LEGACY-GUARD-UNPROVED
 * 留痕 rev r2 §0.0.2 零臂对准）:
 *   V1  = 伪造预占同键异 units（夹具 consumption 行 key=interview id·units_requested=0.5·非产品路径
 *         如实申明）→ begin → 409 idempotency_units_mismatch（commerce.ts:60-73 ON CONFLICT 占坑 0 行→
 *         :67-72 具名错 → interview.service.ts:265-267 catch 映射）·零 start job 零入队·桶 units_reserved
 *         零动（余额零变）·伪造行字节零动（事务回滚）
 *   V2  = v64 start job 种（绑定三元组恰等形自愿构造——harness 世界无 interview_job 触发器·sql/05 仅
 *         UNIQUE(owner,interview,kind,seq)·0144/0064 系迁移链真相锚非在码闸·rev r2 R3）+夹具期超户直
 *         UPDATE resume.privacy_epoch 1→2（boot 镜像世界无 0152 write-guard·privacy_api_owner 不存在·
 *         PGUSER=meetwise 容器引导超户恒绕 FORCE RLS·在码 resume UPDATE 触发器唯一
 *         trg_resume_source_kind_immutable 仅钉 source_kind（sql/03:117-121）·非产品路径如实申明）→
 *         begin → guard :125 零预判（0058:63-72 仅查归属+围栏零 epoch 比对）→ :217-231 v64 谓词
 *         r.privacy_epoch=i.resume_privacy_epoch 失配（2≠1）不命中 → :232-234 anyExistingStart 命中 →
 *         409 legacy_resume_reference_unavailable（拒采纳·不静默换基·不复活）·EXEC 字节级亲证：陈旧
 *         job 行+interview 行 SELECT * 前后逐列零动·resume 行仅 privacy_epoch 1→2（夹具自致·非 begin
 *         副作用）·consumption 0 行·余额零动
 *   V4  = begin 202→fixture 租约过期→POST abandon 先行（200 released·回补）→ reconcileOwner：
 *         sweep 谓词 status='reserved'（commerce.ts:591）不命中 released 行 → staleReleased=0·abandoned=0
 *         （零双释放零双回补）·余额恒=种子原值·interview_unavailable 事件 0 条·consumption 恰 1 行 released
 *   V5  = begin 202→租约过期→reconcileOwner 先行（released+abandoned+恰 1 事件）→POST abandon：
 *         settleOrReleaseForTerminal（commerce.ts:323）→releaseConsumption 对 released 行返 {status:'noop'}
 *         （commerce.ts:289）→CAS 0 行→:541-542 already_abandoned noop → 200
 *         {abandoned:true, released:'noop', alreadyAbandoned:true}（interview.service.ts:659 映射）·
 *         余额恒=种子原值（reconcile 恰一次回补·abandon 零二次退款）·事件仍恰 1 条（零重放）
 *   V6  = V5 回收链上同 id re-begin → 409 interview_not_active（status:'abandoned'·TERMINAL_INTERVIEW
 *         interview.service.ts:38/:128-129）·零新 start job 零二次扣·interview 仍 abandoned·consumption
 *         与 V5 同行零新增
 *   N   = 全程净账审计：V1/V2 零扣零误退（余额恒值·伪造行/job 行字节零动）；V4/V5/V6 各恰一次 1.0 扣+
 *         恰一次 1.0 回补=净零；consumption 逐臂 consCount() 断言（沿五 case :204-207 先例形）：V4 臂恰 1
 *         （released）·V5 臂恰 1（released）·V6 臂零新增（与 V5 同行仍 1）；终审计：全臂合账净耗 0.0·
 *         interview_unavailable 事件恰 1 条（V5 回收发出·V4/V6 零新增）
 *
 * Honest pins（头注必带）：
 *   releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-017 covered · EXIT0 = case ≠ covered · ADV blind 保持+
 *   case-only 措辞 · coveredCount=8 不变 · Ban 借本收据宣 covered/ADV 列升格 · Ban 借收据 wash 五 case/
 *   neg-interview/uc019/uc017-PERF（五 case 0fb8f654 逐条 reason 级可分：BOUND 同键同 units 短路≠V1 异
 *   units 拒面·FAULT-01 单 reconcile≠V4/V5 双嘴串联·COMP-01 单 abandon≠V4/V5·FAULT-01 回收后止于
 *   GET≠V6 re-begin）· GAP-UC017-ADV-LEGACY-GUARD-UNPROVED（V3 pre-v64 父壳臂撤 rev r1：0064:48-51
 *   对拒插+0064:72-83 堵改绑=产品迁移链 schema 不可达·boot 镜像世界无 0064 对触发器夹具可造但无产品
 *   证明价值·零臂对准·登记留痕防蒸发）。
 *   fixture = run-e2e-isolated 一次性 pgvector 隔离库（boot() 真 HTTP·green-risk/R5·≠ sole-stack ≠
 *   RAG migrated）·零迁移（0064/0049/0142 夹具面 additive 重放）·零模型外呼·零 drain。
 *   夹具豁免具名（REQUEST §5 枚举内·枚举完备）：①桶种子（V4/V5/V6 begin 臂·seedOwnerBucket 五 case
 *   :92-97 先例形）②壳行种子含状态钉（V1/V2 绑定壳·seedBeginFixture 五 case :102-127 形制）③伪造预占
 *   种子（V1 consumption 行 key=interview id·units_requested=0.5·非产品路径如实申明）④陈旧 v64 job 种子
 *   （V2 start job 行·三元组恰等形自愿构造·rev r2 R3）⑤租约过期 UPDATE（V4/V5·五 case :232-235 同款）
 *   ⑥resume.privacy_epoch 夹具期特权 UPDATE（V2·超户直 UPDATE·先例形②DISABLE TRIGGER+超户 UPDATE 同族
 *   resume-erasure-tombstone-foundation.proof.ts:57-64）。
 *
 * Live-key isolation（uc016-nhp-adv 先例形·egress inventory test-isolation 登记臂 additive 2 条目）:
 *   shell strip list lacks MODEL_API_KEY → this proof deletes MODEL_API_KEY and MODEL_BASE_URL
 *   in-process FIRST, then asserts unset before and after boot. Zero provider egress · est live=0。
 *
 *   pnpm uc017:nhp-adv:prove               (via run-e2e-isolated)
 *   pnpm -C apps/api prove:uc017-nhp-adv   (raw; needs isolated PG env from the runner)
 *
 * Matrix stays **blind**（e2e-requirement-coverage-matrix.md:122 ADV cell blind 保持+case-only 收据注·
 * 翻面权归协调方）·⛔push。
 */
import 'reflect-metadata';
import { asPrincipal, availableUnits } from '@meetwise/db';
import { reconcileOwner } from '../../worker/src/commerce-reconcile.ts';
import { boot, mkAssert } from './_neg-harness';

if (process.env.NODE_ENV === 'production') process.env.NODE_ENV = 'test';

// R6 live-key isolation（uc016-nhp-adv.proof.ts:88-98 同形）: in-process self-delete pre-boot,
// assert unset before and after boot（boot() :61-62 自删双保险）。
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;

const h = await boot();
const { A, done } = mkAssert('uc017:nhp-adv');

console.log('UC-E2E-017 orphan ADV prove · NHP-017-ADV-01 · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠UC-E2E-017 covered；EXIT0=case≠covered；ADV blind 保持+case-only·翻面权归协调方');
console.log('NOTE: fixture=pgvector isolated (green-risk/R5)·零 live key·零模型外呼·est live=0');
A('ISO model-key-unset-in-process (self-deleted pre-boot · shell strip list lacks MODEL_API_KEY)',
  process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);
A('ISO model-key-still-unset-after-boot (boot() :61-62 自删双保险·零 re-import regression)',
  process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

const S = Date.now().toString(36);
const OWNF = (k: string) => `uc017a-${k}-${S}`;
const IIDF = (k: string) => `IV_A017_${k}_${S}`;
// resume id 必须 uuid 列形（resume_id uuid）——固定可读段+case 序数，六臂互异（3102 段=本刀专属·五 case 3101 段零碰撞）。
const RIDF = (n: number) => `3102${String(n).padStart(4, '0')}-1111-4111-8111-${String(n).padStart(12, '0')}`;
const SHA = (k: string) => Buffer.from(`uc017-nhp-adv-${k}-${S}`).toString('hex').padEnd(64, '0').slice(0, 64);

// 头构造走成员赋值（five-case :80-84 同形·naming-convention memberLike 零新 warning）
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

async function seedOwnerBucket(owner: string, units = 5.0) {
  await h.pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')",
    [owner, units],
  );
}

/** resume ingested + created 面试在 INSERT 时绑定——five-case seedBeginFixture 播种形制 additive 重放
 *  （route decision/snapshot 预供给 → begin 走 supplyCandidateProfileRoute 幂等回读臂 → 202）。 */
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
      [`uc017a-cprd-${interviewId}`, interviewId, owner, resumeId, sha],
    );
    await cli.query(
      `INSERT INTO candidate_profile_route_snapshot(interview_id,candidate_user_id,decision_id,resume_content_sha,input_digest,taxonomy_version,leaf_track_id,allocation_bps,status)
       VALUES ($1,$2,$3,$4,$4,'v1','backend',10000,'interview_snapshotted') ON CONFLICT (interview_id) DO NOTHING`,
      [interviewId, owner, `uc017a-cprd-${interviewId}`, sha],
    );
    await cli.query('COMMIT');
  } finally { cli.release(); }
}

/** begin 链夹具前置（five-case applyBeginChainPreamble additive 重放·0058 栅栏不重放=boot() 已内置镜像）：
 *  0064 v64 面+0049 绑定语义+0142 route 供给表。 */
async function applyBeginChainPreamble() {
  await h.pool.query('ALTER TABLE interview ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint');
  await h.pool.query(`
ALTER TABLE interview_job ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;
ALTER TABLE interview_job ALTER COLUMN reference_schema_version SET DEFAULT 64;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_check;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_chk;
ALTER TABLE interview_job ADD CONSTRAINT interview_job_reference_schema_version_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version IN (49, 50, 64));
`);
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
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const mig = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/${f}`, import.meta.url)), 'utf8');
  await h.pool.query(mig('0142_candidate_profile_route.sql'));
}
await applyBeginChainPreamble();
console.log('PIN   GAP-UC017-BEGIN-FIXTURE-PREAMBLE: 0064/0049/0142 additive 夹具补齐（真相=迁移链·≠ 迁移 covered）');
console.log('PIN   GAP-UC017-PRIVACY-MIRROR: boot() 内置 0058 镜像承载隐私触点（五 case 同形）');

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
/** 字节级亲证助手：单行 SELECT * → 稳定 JSON 串（列序/值确定性·Date 序列化确定） */
const rowJson = async (sqlText: string, params: unknown[]): Promise<string> =>
  JSON.stringify((await h.pool.query(sqlText, params)).rows[0] ?? null);

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-ADV-01 · V1 · 伪造预占·同键不同 units → 409 idempotency_units_mismatch
// ─────────────────────────────────────────────────────────────────────────────
const v1Owner = OWNF('v1'), v1Id = IIDF('v1'), v1Rid = RIDF(1);
{
  console.log('\n──────── NHP-017-ADV-01 V1 · 伪造预占同键异 units → 409 idempotency_units_mismatch ────────');
  await seedOwnerBucket(v1Owner, 5.0);
  await seedBeginFixture(v1Owner, v1Id, v1Rid, SHA('v1'));
  // 豁免③伪造预占种子（非产品路径如实申明）: key=interview id·units_requested=0.5·reserved·租约远期。
  await h.pool.query(
    `INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, status, lease_expires_at)
     VALUES ($1,$2,'mock_interview',0.5,'reserved', now()+interval '300 minutes')`, [v1Owner, v1Id]);
  const before = await bal(v1Owner);
  const forged0 = await rowJson('SELECT * FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [v1Owner, v1Id]);

  const b = await h.post(`/interview/${v1Id}/begin`, H(v1Owner, v1Rid), {});
  A('V1 begin → 409 idempotency_units_mismatch（commerce.ts:67-72 具名错→interview.service.ts:265-267 映射）',
    b.status === 409 && b.body?.error === 'idempotency_units_mismatch');
  A('V1 零 start job 零入队', (await startJobs(v1Id)) === 0);
  A('V1 桶 units_reserved 零动（余额恒种子值 5.0）', (await bal(v1Owner)) === before && before === 5.0);
  A('V1 伪造行字节零动（SELECT * 前后逐列恒等·事务回滚）',
    (await rowJson('SELECT * FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [v1Owner, v1Id])) === forged0);
  A('V1 units_requested 仍 0.5（异 units 拒面原值钉）',
    Number((await h.pool.query('SELECT units_requested FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [v1Owner, v1Id])).rows[0]?.units_requested) === 0.5);
  A('V1 consumption 恰 1 行（伪造行·无新增）', (await consCount(v1Owner, v1Id)) === 1);
  A('V1 零 interview_unavailable 事件', (await evCount(v1Owner, v1Id, 'interview_unavailable')) === 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-ADV-01 · V2 · 伪造/陈旧 start job 拒采纳 → 409 legacy_resume_reference_unavailable
// ─────────────────────────────────────────────────────────────────────────────
const v2Owner = OWNF('v2'), v2Id = IIDF('v2'), v2Rid = RIDF(2);
{
  console.log('\n──────── NHP-017-ADV-01 V2 · v64 job 种+夹具 epoch 失配 → 409 legacy_resume_reference_unavailable ────────');
  await seedOwnerBucket(v2Owner, 5.0);
  await seedBeginFixture(v2Owner, v2Id, v2Rid, SHA('v2'));
  // 豁免④陈旧 v64 job 种子（三元组恰等形自愿构造·rev r2 R3: harness 世界无 interview_job 触发器·
  // sql/05 仅 UNIQUE(owner,interview,kind,seq)·0144/0064 系迁移链真相锚非在码闸）。
  await h.pool.query(
    `INSERT INTO interview_job(owner_user_id, interview_id, kind, seq, resume_id, reference_schema_version, resume_privacy_epoch)
     VALUES ($1,$2,'start',0,$3,64,1)`, [v2Owner, v2Id, v2Rid]);
  A('V2 v64 job 种在场（start 恰 1·绑定三元组恰等形）', (await startJobs(v2Id)) === 1);
  // 字节级亲证基线先于夹具 UPDATE 捕获（epoch=1 原值·attempt1 红次修正形：基线后捕=两快照同域假 diff·
  // 期望按真实钉死——夹具自致 1→2 的唯一列动证面恰需 pre-fixture 基线）。
  const resBefore = (await h.pool.query('SELECT * FROM resume WHERE id=$1', [v2Rid])).rows[0];
  // 豁免⑥夹具期特权 UPDATE（超户直 UPDATE·boot 镜像世界无 0152 write-guard·PGUSER=meetwise 容器引导
  // 超户恒绕 FORCE RLS·在码 resume UPDATE 触发器唯一 trg_resume_source_kind_immutable 仅钉 source_kind）。
  await h.pool.query('UPDATE resume SET privacy_epoch=2 WHERE id=$1 AND owner_user_id=$2', [v2Rid, v2Owner]);
  A('V2 夹具 resume.privacy_epoch 1→2 已施（超户直 UPDATE·非产品路径如实申明）',
    Number((await h.pool.query('SELECT privacy_epoch FROM resume WHERE id=$1', [v2Rid])).rows[0]?.privacy_epoch) === 2);
  const before = await bal(v2Owner);
  const job0 = await rowJson("SELECT * FROM interview_job WHERE owner_user_id=$1 AND interview_id=$2 AND kind='start'", [v2Owner, v2Id]);
  const iv0 = await rowJson('SELECT * FROM interview WHERE id=$1', [v2Id]);

  const b = await h.post(`/interview/${v2Id}/begin`, H(v2Owner, v2Rid), {});
  A('V2 begin → 409 legacy_resume_reference_unavailable（v64 谓词 :217-231 失配 2≠1→anyExistingStart :232-234 命中拒）',
    b.status === 409 && b.body?.error === 'legacy_resume_reference_unavailable');
  A('V2 陈旧 job 行字节零动（SELECT * 前后逐列恒等·零采纳）',
    (await rowJson("SELECT * FROM interview_job WHERE owner_user_id=$1 AND interview_id=$2 AND kind='start'", [v2Owner, v2Id])) === job0);
  A('V2 interview 行字节零动（SELECT * 前后逐列恒等·零绑定写零 version 动）',
    (await rowJson('SELECT * FROM interview WHERE id=$1', [v2Id])) === iv0);
  A('V2 start job 计数不变（仍 1·零复活零换基）', (await startJobs(v2Id)) === 1);
  A('V2 consumption 0 行（零扣额）', (await consCount(v2Owner, v2Id)) === 0);
  A('V2 余额零动（恒种子值 5.0）', (await bal(v2Owner)) === before && before === 5.0);
  const resAfter = (await h.pool.query('SELECT * FROM resume WHERE id=$1', [v2Rid])).rows[0];
  const diffKeys = Object.keys(resBefore ?? {}).filter((k) => JSON.stringify((resBefore as Record<string, unknown>)?.[k]) !== JSON.stringify((resAfter as Record<string, unknown>)?.[k]));
  A('V2 resume 行仅 privacy_epoch 一列动（1→2 夹具自致·非 begin 副作用·逐列 diff 恰 1 键）',
    diffKeys.length === 1 && diffKeys[0] === 'privacy_epoch'
    && Number((resBefore as Record<string, unknown>)?.privacy_epoch) === 1
    && Number((resAfter as Record<string, unknown>)?.privacy_epoch) === 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-ADV-01 · V4 · abandon 先行 → reconcile 零双释放（sweep 谓词 status='reserved' 不命中 released）
// ─────────────────────────────────────────────────────────────────────────────
const v4Owner = OWNF('v4'), v4Id = IIDF('v4'), v4Rid = RIDF(4);
{
  console.log('\n──────── NHP-017-ADV-01 V4 · begin→租约过期→abandon 先行→reconcile 零双释放 ────────');
  await seedOwnerBucket(v4Owner, 5.0);
  await seedBeginFixture(v4Owner, v4Id, v4Rid, SHA('v4'));
  const before = await bal(v4Owner);
  const b = await h.post(`/interview/${v4Id}/begin`, H(v4Owner, v4Rid), {});
  A('V4 begin → 202 accepted+jobId', b.status === 202 && b.body?.accepted === true && typeof b.body?.jobId === 'string');
  A('V4 reserved 可观测（consumption key=interview id）', (await consStatus(v4Owner, v4Id)) === 'reserved');
  A('V4 预留扣 1.0（5→4）', (await bal(v4Owner)) === before - 1);

  // fixture 租约过期注入（五 case FAULT-01 :232-235 同款·豁免⑤）
  await h.pool.query(
    "UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2",
    [v4Owner, v4Id],
  );
  // abandon 先行（HTTP 补偿嘴·200 released）
  const r = await h.post(`/interview/${v4Id}/abandon`, U(v4Owner), {});
  A('V4 POST abandon → 200 released（已回补）', r.status === 200 && r.body?.abandoned === true && r.body?.released === 'released' && r.body?.alreadyAbandoned !== true);
  A('V4 abandon 后 consumption released', (await consStatus(v4Owner, v4Id)) === 'released');
  A('V4 abandon 回补（4→5·恰一次）', (await bal(v4Owner)) === before);
  A('V4 interview 终态 abandoned', (await ivStatus(v4Id)) === 'abandoned');

  // reconcile 后行（生产调度嘴直调·五 case FAULT-01 同款调度嘴形态·进程内直调非跨进程编排）
  const rec = await reconcileOwner(h.pool, v4Owner);
  A('V4 reconcile staleReleased===0（sweep 谓词 status=\'reserved\' commerce.ts:591 不命中 released·零双释放）', rec.staleReleased === 0);
  A('V4 reconcile abandoned===0（swept 空·零回收零双终态）', rec.abandoned === 0);
  A('V4 余额恒种子原值（零双回补·恰一次退款）', (await bal(v4Owner)) === before);
  A('V4 interview_unavailable 事件 0 条（无回收即无事件）', (await evCount(v4Owner, v4Id, 'interview_unavailable')) === 0);
  A('V4 consumption 恰 1 行终态 released（consCount 逐臂=1）', (await consCount(v4Owner, v4Id)) === 1 && (await consStatus(v4Owner, v4Id)) === 'released');
}

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-ADV-01 · V5 · reconcile 先行 → abandon 幂等 noop → 200 alreadyAbandoned
// ─────────────────────────────────────────────────────────────────────────────
const v5Owner = OWNF('v5'), v5Id = IIDF('v5'), v5Rid = RIDF(5);
{
  console.log('\n──────── NHP-017-ADV-01 V5 · begin→租约过期→reconcile 先行→abandon noop ────────');
  await seedOwnerBucket(v5Owner, 5.0);
  await seedBeginFixture(v5Owner, v5Id, v5Rid, SHA('v5'));
  const before = await bal(v5Owner);
  const b = await h.post(`/interview/${v5Id}/begin`, H(v5Owner, v5Rid), {});
  A('V5 begin → 202 accepted+jobId', b.status === 202 && b.body?.accepted === true && typeof b.body?.jobId === 'string');
  A('V5 reserved 可观测', (await consStatus(v5Owner, v5Id)) === 'reserved');
  A('V5 预留扣 1.0（5→4）', (await bal(v5Owner)) === before - 1);

  // fixture 租约过期注入（豁免⑤·五 case 同款）
  await h.pool.query(
    "UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2",
    [v5Owner, v5Id],
  );
  // reconcile 先行（生产调度嘴直调）
  const rec = await reconcileOwner(h.pool, v5Owner);
  A('V5 reconcile staleReleased≥1（sweep 谓词命中 reserved 行）', rec.staleReleased >= 1);
  A('V5 reconcile abandoned≥1（C 端回收分支 abandonInterviewAndRelease）', rec.abandoned >= 1);
  A('V5 consumption released', (await consStatus(v5Owner, v5Id)) === 'released');
  A('V5 interview 终态 abandoned', (await ivStatus(v5Id)) === 'abandoned');
  A('V5 interview_unavailable 事件恰 1 条', (await evCount(v5Owner, v5Id, 'interview_unavailable')) === 1);
  A('V5 reconcile 恰一次回补（4→5）', (await bal(v5Owner)) === before);

  // abandon 后行（反向序·幂等 noop: releaseConsumption :289 noop→CAS 0 行→:541-542 already_abandoned）
  const r = await h.post(`/interview/${v5Id}/abandon`, U(v5Owner), {});
  A('V5 POST abandon → 200 {abandoned:true, released:"noop", alreadyAbandoned:true}（interview.service.ts:659 映射）',
    r.status === 200 && r.body?.abandoned === true && r.body?.released === 'noop' && r.body?.alreadyAbandoned === true);
  A('V5 余额恒种子原值（abandon 零二次退款·净恰一次回补）', (await bal(v5Owner)) === before);
  A('V5 事件仍恰 1 条（零重放）', (await evCount(v5Owner, v5Id, 'interview_unavailable')) === 1);
  A('V5 consumption 恰 1 行 released（consCount 逐臂=1）', (await consCount(v5Owner, v5Id)) === 1 && (await consStatus(v5Owner, v5Id)) === 'released');
}

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-ADV-01 · V6 · 回收壳复活拒（V5 链上续·同 id re-begin → 409 interview_not_active）
// ─────────────────────────────────────────────────────────────────────────────
{
  console.log('\n──────── NHP-017-ADV-01 V6 · V5 回收壳同 id re-begin → 409 interview_not_active ────────');
  const reBegin = await h.post(`/interview/${v5Id}/begin`, H(v5Owner, v5Rid), {});
  A('V6 re-begin → 409 interview_not_active（TERMINAL_INTERVIEW :38/:128-129·status=abandoned）',
    reBegin.status === 409 && reBegin.body?.error === 'interview_not_active' && reBegin.body?.status === 'abandoned');
  A('V6 零新 start job（仍 1·零复活零入队）', (await startJobs(v5Id)) === 1);
  A('V6 零二次扣（余额恒种子值 5.0）', (await bal(v5Owner)) === 5.0);
  A('V6 interview 仍 abandoned（不复活）', (await ivStatus(v5Id)) === 'abandoned');
  A('V6 consumption 与 V5 同行零新增（consCount 仍 1）', (await consCount(v5Owner, v5Id)) === 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// NHP-017-ADV-01 · N · 全程净账审计（逐臂 consCount 断言·合账净耗 0.0·事件恰 1 条）
// ─────────────────────────────────────────────────────────────────────────────
{
  console.log('\n──────── NHP-017-ADV-01 N · 全程净账审计 ────────');
  A('N V1 臂零扣（余额恒 5.0·伪造行零动）', (await bal(v1Owner)) === 5.0);
  A('N V2 臂零扣零误退（余额恒 5.0）', (await bal(v2Owner)) === 5.0);
  A('N V4 臂 consCount 恰 1（终态 released·恰一次扣+恰一次回补）', (await consCount(v4Owner, v4Id)) === 1 && (await bal(v4Owner)) === 5.0);
  A('N V5 臂 consCount 恰 1（released·净零）', (await consCount(v5Owner, v5Id)) === 1 && (await bal(v5Owner)) === 5.0);
  A('N V6 臂零新增（与 V5 同行·consCount 仍 1）', (await consCount(v5Owner, v5Id)) === 1);
  A('N 全臂合账净耗 0.0（V1/V2 零扣·V4/V5/V6 各恰一次 1.0 扣+恰一次 1.0 回补）',
    (await bal(v1Owner)) + (await bal(v2Owner)) + (await bal(v4Owner)) + (await bal(v5Owner)) === 20.0);
  A('N interview_unavailable 事件全臂恰 1 条（V5 回收发出·V4/V6 零新增）',
    (await evCount(v4Owner, v4Id, 'interview_unavailable')) === 0
    && (await evCount(v5Owner, v5Id, 'interview_unavailable')) === 1
    && (await evCount(v1Owner, v1Id, 'interview_unavailable')) === 0
    && (await evCount(v2Owner, v2Id, 'interview_unavailable')) === 0);
}

// ── Honesty pins: still ≠ covered ──
console.log('\n──────── GAP pins (抬 covered 仍缺) ────────');
console.log('GAP-UC017-ADV-LEGACY-GUARD-UNPROVED: V3 pre-v64 父壳臂撤臂留痕（rev r1 §0.0.1·rev r2 R2 §0.0.2）——interview.service.ts:190-195 守卫真实在码但产品迁移链 schema 下 HTTP/DB 层不可达（0064:48-51 对拒插+0064:72-83 堵改绑）；boot 镜像世界无 0064 对触发器该态夹具可造但无产品证明价值——零臂对准维持·本收据不复述即登记蒸发面');
console.log('GAP-UC017-HTTP-SSE-PROCESS-CRASH: 真 commit 后故障点/进程级 SIGKILL 注入未行使（五 case :432 预登归另刀·本刀 fixture 租约注入同形不越界）');
console.log('NOTE: 零报告链风暴/白名单臂+零跨主体臂=对 uc019-adv V2-V5/neg-interview/uc017-perf/五 case NEG-01 的 wash 规避（REQUEST §1.3 否决表）');
A('honesty: ADV isolated prove 绿 ≠ UC-E2E-017 covered（EXIT0=case≠covered·ADV blind 保持+case-only·coveredCount=8 零动·翻面权归协调方）', true);

await done();
