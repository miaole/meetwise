/**
 * AG-09 回放优先重放刀（succeeded 可回放结果先于 digest 墙）真 PG 隔离证明。
 *
 * 修法权威=0209_ag09_replay_first_claim.sql（同 19 参签名 CREATE OR REPLACE·零 DROP·恰一序变更：
 * 「succeeded ∧ replayable → cached」臂上提至 digest 墙之前·原位保留敏感半）。issues-final AG-09
 * :148-156 触发例直证：出题成功后、checkpoint 写入前 worker 被杀——同键重放的 request digest 因
 * 检索素材/prompt/价版漂移，0184 撞墙一 → payload_mismatch 终态误杀；0209 后上提臂先回放既有
 * 结果（cached·零二次外呼·零新结算·invoke.ts cached terminal 直返）。
 *
 * 五臂（语义矩阵逐行机证）：
 *   A（承重·触发例直证）succeeded∧replayable 同键漂移 digest 重放 → cached 原值·零二次外呼·零新结算；
 *   B 敏感 succeeded（replayable=false）漂移重放 → 墙一 idempotency_key_payload_mismatch 原值
 *     （敏感臂 sensitive_result_replay_requires_artifact 仅恒等 digest 可达=原位敏感 fence 零动）；
 *   C claimed+lease 过期行漂移重放 → mismatch 原值·expired-claimed 重领不达（墙一非终态面维持）；
 *   D failed 行漂移重放 → 墙一 mismatch 原值（原错误码仅恒等 digest 重放路径=failed 臂原位零动）；
 *   E succeeded∧replayable + cost_scope 漂移 → cached（裁决① 上提形行使面·重放方零记账缝）。
 *
 * 运行方式：经 scripts/run-e2e-isolated.mjs 的 `ag09-replay-first:prove` gate（一次性 pgvector
 * 容器 + 全量版本化迁移含 0209 链顶）。不 require 任何真实 provider；确定性 stub/seam（est live=0）。
 */
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  asPrincipal, assertIsolatedTestTarget, claimModelInvocation, completeModelInvocation,
  createPool, failModelInvocationClaim, markModelInvocationDispatched,
} from '@meetwise/db';
import { invoke, type Model, type ModelCostPolicy } from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const OWNER = `ag09-rf-${process.pid}`;
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const PROVIDER = `ag09-provider-${suffix}`;
const MODEL = `ag09-model-${suffix}`;
const REGION = 'cn-proof';
const REVISION = 'ag09-r1';
const SCOPE = `ag09-scope-${suffix}`;
const SCOPE2 = `ag09-scope2-${suffix}`;
const answerSchema = z.object({ answer: z.string().min(1) });

/** 计费策略（provider/model/region 进 ai_cost_price_book；scope 进 ai_cost_budget_policy）。 */
const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: PROVIDER, model: MODEL, region: REGION, priceRevision: REVISION,
  maxInputTokens: 1000, maxOutputTokens: 500,
};

/** 计费 Model：prepare 返回 cost policy + 脚本化结果并计数（确定性 stub·digest 可漂移）。 */
function billable(result: ReturnType<Model['call']>, calls: { n: number }, digest = 'a'.repeat(64)): Model {
  return {
    requestDigest: digest,
    async call() { calls.n++; return result; },
    prepare() { return { ready: true as const, execute: () => this.call(1), cost: policy }; },
  };
}

/** 真实现：按 owner+key 读账本行（status/lease/output/digest 面·列别名 camelCase 对表）。 */
const invocationRow = async (key: string) => (await pool.query<{
  status: string; leaseToken: string | null; leaseExpiresAt: string | null;
  requestDigest: string; output: unknown; errorCode: string | null;
}>(
  `SELECT status,lease_token::text AS "leaseToken",lease_expires_at::text AS "leaseExpiresAt",
          request_digest AS "requestDigest",error_code AS "errorCode",output
     FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`, [OWNER, key],
)).rows[0];

/** 结算面观测：某 key 的 reservation 行数与首行状态/结算额。 */
const reservationFace = async (scopeId: string, key: string) => {
  const rows = await pool.query<{ status: string; settled: string | null }>(
    `SELECT status,settled_micro_cny::text AS settled FROM ai_cost_reservation
      WHERE scope_id=$1 AND idempotency_key=$2 ORDER BY created_at`, [scopeId, key]);
  return { n: rows.rows.length, row: rows.rows[0] };
};

async function main() {
  await assertIsolatedTestTarget(pool);

  // ── 预置：计费价格表 + 项目预算（billed invoke 用）。 ──────────────────────────
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,$4,1000000,2000000,'https://example.test/ag09',clock_timestamp())`,
    [PROVIDER, MODEL, REGION, REVISION],
  );
  await pool.query(
    `INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)`, [SCOPE],
  );

  // ── 臂 A（承重·触发例直证）：succeeded∧replayable 同键漂移 digest 重放 → cached 原值·零二次外呼·零新结算。 ──
  const aCalls = { n: 0 };
  const aKey = `ag09:a:${suffix}`;
  const aFirst = await invoke({
    idempotencyKey: aKey, operation: { id: 'interview.question-generation.v1', businessRevision: 'ag09:a' },
    schema: answerSchema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'ag09-original' }, usage: { inputTokens: 100, outputTokens: 200 } }), aCalls),
  }, pool, OWNER);
  const aFaceBefore = await reservationFace(SCOPE, aKey);
  const aRowBefore = await invocationRow(aKey);
  // 崩溃恢复重放形：同键、digest 漂移（检索素材/prompt/价版漂移的机面）——0184 此处=mismatch 终态误杀。
  const aReplay = await invoke({
    idempotencyKey: aKey, operation: { id: 'interview.question-generation.v1', businessRevision: 'ag09:a' },
    schema: answerSchema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'must-not-send' } }), aCalls, 'd'.repeat(64)),
  }, pool, OWNER);
  const aFaceAfter = await reservationFace(SCOPE, aKey);
  const aRowAfter = await invocationRow(aKey);
  A('臂 A：succeeded∧replayable 漂移重放 → cached 原值（崩溃恢复不再误杀·0209 上提臂）',
    'value' in aFirst && 'value' in aReplay && aReplay.value.answer === 'ag09-original');
  A('臂 A：零二次外呼 + 零新结算（reservation 恰 1 行 settled·结算额原值）+ 账本行零改写',
    aCalls.n === 1 && aFaceBefore.n === 1 && aFaceAfter.n === 1
    && aFaceAfter.row?.status === 'settled' && aFaceAfter.row?.settled === aFaceBefore.row?.settled
    && aRowAfter?.status === 'succeeded' && JSON.stringify(aRowAfter?.output) === JSON.stringify(aRowBefore?.output));

  // ── 臂 B：敏感 succeeded（replayable=false）→ 漂移重放=墙一 mismatch 原值；恒等重放=原位敏感臂原值。 ──
  const bKey = `ag09:b:${suffix}`;
  const bToken = randomUUID();
  const bClaim = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: bKey, requestDigest: 'b'.repeat(64), leaseToken: bToken, leaseSeconds: 60,
  }));
  const bDispatched = await asPrincipal(pool, OWNER, (c) => markModelInvocationDispatched(c, OWNER, bKey, bToken));
  const bCompleted = await asPrincipal(pool, OWNER, (c) => completeModelInvocation(c, {
    owner: OWNER, idempotencyKey: bKey, output: { answer: 'ag09-secret' }, replayable: false,
  }));
  const bCalls = { n: 0 };
  const bDrift = await invoke({
    idempotencyKey: bKey, operation: { id: 'interview.question-generation.v1', businessRevision: 'ag09:b' },
    schema: answerSchema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'must-not-send' } }), bCalls, 'c'.repeat(64)),
  }, pool, OWNER);
  const bIdentityCalls = { n: 0 };
  // 恒等重放用 unbilled stub（无 cost→invocationDigest 直返 supplied）：claim digest 逐字=b'.repeat(64)
  // 种子行原值，方可达原位敏感臂（billed stub 的终 digest 经 sha256({requestDigest,costPolicy}) 必漂）。
  const bIdentity = await invoke({
    idempotencyKey: bKey, operation: { id: 'interview.question-generation.v1', businessRevision: 'ag09:b' },
    schema: answerSchema, businessValidate: () => null,
    model: {
      requestDigest: 'b'.repeat(64),
      async call() { bIdentityCalls.n++; return { ok: true as const, raw: { answer: 'must-not-send' } }; },
      prepare() { return { ready: true as const, execute: () => this.call(1) }; },
    },
  }, pool, OWNER);
  A('臂 B 前置：敏感 succeeded 行就位（claim→dispatch→complete replayable=false）',
    bClaim.action === 'execute' && bDispatched === true && bCompleted === true
      && (await invocationRow(bKey))?.status === 'succeeded');
  A('臂 B：敏感行漂移重放 → 墙一 idempotency_key_payload_mismatch 原值·零外呼（敏感 fence 零动·上提臂不含非回放行）',
    'error' in bDrift && bDrift.error === 'idempotency_key_payload_mismatch' && bCalls.n === 0);
  A('臂 B：敏感行恒等 digest 重放 → 原位敏感臂 sensitive_result_replay_requires_artifact 原值（fence 未上提未弱化·零外呼）',
    'error' in bIdentity && bIdentity.error === 'sensitive_result_replay_requires_artifact' && bIdentityCalls.n === 0);

  // ── 臂 C：claimed+lease 过期行漂移重放 → mismatch 原值·expired-claimed 重领不达（墙一非终态面维持）。 ──
  const cKey = `ag09:c:${suffix}`;
  const cToken = randomUUID();
  const cClaim = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: cKey, requestDigest: 'c'.repeat(64), leaseToken: cToken, leaseSeconds: 1,
  }));
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const cReplay = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: cKey, requestDigest: 'd'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  const cRow = await invocationRow(cKey);
  const cLeaseExpired = cRow?.leaseExpiresAt !== null && !!(cRow?.leaseExpiresAt)
    && new Date(cRow.leaseExpiresAt).getTime() < Date.now();
  A('臂 C：claimed 过期行漂移重放 → 墙一 mismatch 原值（重领 execute 不达）',
    cClaim.action === 'execute' && cLeaseExpired
    && cReplay.action === 'failed' && cReplay.error === 'idempotency_key_payload_mismatch');
  A('臂 C：账本行零改写（status=claimed·lease_token 原值承袭·重领未发生）',
    cRow?.status === 'claimed' && cRow?.leaseToken === cToken);

  // ── 臂 D：failed 行漂移重放 → 墙一 mismatch 原值；恒等 digest 重放 → 原错误码（failed 臂原位零动）。 ──
  const dKey = `ag09:d:${suffix}`;
  const dToken = randomUUID();
  const dClaim = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: dKey, requestDigest: 'e'.repeat(64), leaseToken: dToken, leaseSeconds: 60,
  }));
  const dFailed = await asPrincipal(pool, OWNER, (c) =>
    failModelInvocationClaim(c, OWNER, dKey, dToken, 'ag09_seed_failure'));
  const dDrift = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: dKey, requestDigest: 'f'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  const dIdentity = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: dKey, requestDigest: 'e'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  A('臂 D：failed 行漂移重放 → 墙一 idempotency_key_payload_mismatch 原值（非终态面墙一维持）',
    dClaim.action === 'execute' && dFailed === true
    && dDrift.action === 'failed' && dDrift.error === 'idempotency_key_payload_mismatch');
  A('臂 D：failed 行恒等 digest 重放 → 原错误码 ag09_seed_failure（failed 臂原位零动·重放 failed 不放宽）',
    dIdentity.action === 'failed' && dIdentity.error === 'ag09_seed_failure'
      && (await invocationRow(dKey))?.status === 'failed');

  // ── 臂 E：succeeded∧replayable + cost_scope 漂移 → cached（裁决① 上提形行使面·重放方零记账缝）。 ──
  const eCalls = { n: 0 };
  const eKey = `ag09:e:${suffix}`;
  const eFirst = await invoke({
    idempotencyKey: eKey, operation: { id: 'interview.question-generation.v1', businessRevision: 'ag09:e' },
    schema: answerSchema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'ag09-scope-ok' }, usage: { inputTokens: 10, outputTokens: 20 } }), eCalls),
  }, pool, OWNER);
  const eReplay = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: eKey, requestDigest: 'a'.repeat(64),
    costScopeId: SCOPE2, provider: PROVIDER, model: MODEL, region: REGION, priceRevision: REVISION,
    maxInputTokens: 1000, maxOutputTokens: 500,
    leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  const eScope2Face = await reservationFace(SCOPE2, eKey);
  A('臂 E：succeeded∧replayable + cost_scope 漂移 → cached 原值（上提臂先于 cost_scope 墙·裁决① 上提形）',
    'value' in eFirst && eReplay.action === 'cached'
    && JSON.stringify(eReplay.output) === JSON.stringify({ answer: 'ag09-scope-ok' }));
  A('臂 E：重放方零记账缝（漂移 scope 零 reservation 行·cached 直返零 reserve 零 settle·既有语义非新敞口）',
    eCalls.n === 1 && eScope2Face.n === 0);

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ AG-09 回放优先重放（succeeded 先于 digest 墙）五臂全部通过（隔离库真迁移链·零外呼）');
  await pool.end();
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
