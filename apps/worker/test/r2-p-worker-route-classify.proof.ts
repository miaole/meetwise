/**
 * R2 P-WORKER — sole Worker classify / job_route for route_pending.
 * releaseEvidence=false · Not HA · closing P-WORKER ≠ R2 fully closed (P-API may remain)
 * ≠ 路由已生效 · ≠ R4 / HA / G6 · no flip default · no open DELETE
 * No fake rule-only classifier that claims R2 green.
 *
 * Prefer fail-closed without Key for structural proves.
 *
 * 慢模型臂（真 invoke 关口全链）：模型延迟 > 压低后的 idle 事务超时时，外呼不得再嵌在
 * 持锁事务内——修复前本臂红（tick 2 被 0209 围栏拒 → sticky known_not_sent），修复后绿
 * （tick 1 route_decided · 恰 1 次外发 · 零 sticky）。
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  bindJobRouteClassify, JOB_ROUTE_CLASSIFY_OPERATION_ID, JOB_ROUTE_CLASSIFY_PROMPT_SERVICE,
  createJobRouteModelClassify, scriptedModelClient, type ModelClient,
} from '@meetwise/ai-runtime';
import {
  assertIsolatedTestTarget, asPrincipal, classifyJobRoute, createJob, createPool,
  resolveRouteRetryUnknownCooldownMs, ROUTE_RETRY_UNKNOWN_COOLDOWN_MS, retryJobRoute, updateJob,
  type ClassifyJobRouteResult,
} from '@meetwise/db';
import { canonicalJobSemanticDigest } from '@meetwise/domain';
import { drainOwnerRouteClassify } from '../src/route-classify-consumer.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');
const appsRoot = join(repoRoot, 'apps');
const consumerPath = join(appsRoot, 'worker', 'src', 'route-classify-consumer.ts');
const mainPath = join(appsRoot, 'worker', 'src', 'main.ts');
const bindPath = join(repoRoot, 'packages/ai-runtime/src/job-route-classify.ts');
const promptPath = join(repoRoot, 'packages/ai-runtime/src/prompts.ts');
const routePath = join(repoRoot, 'packages/db/src/routing/job-route-decision.ts');
const gatewayPath = join(repoRoot, 'packages/db/src/jobs/gateway-dispatch.ts');
const migratePath = join(repoRoot, 'packages/db/migrations/0132_job_route_classify_worker_dispatch.sql');
const harnessPath = join(repoRoot, 'receipts/archive/2026-09-batch23/harness/r2-classify-job-route.md');
const statusPath = join(repoRoot, 'receipts/archive/2026-09-batch23/harness/r2-classify-job-route-status.md');
const backlogPath = join(repoRoot, 'ai-docs/delivery/gap-bug-backlog.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const requestModelOp = join(repoRoot, 'receipts/archive/2026-09-batch23/reviews/REQUEST-r2-p-worker-route-classify-mw-model-op.md');
const requestRag = join(repoRoot, 'receipts/archive/2026-09-batch23/reviews/REQUEST-r2-p-worker-route-classify-mw-rag-route.md');

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function walkTsFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.tmp') continue;
      walkTsFiles(p, out);
    } else if (/\.(ts|tsx|mjs|js)$/.test(ent.name) && !ent.name.endsWith('.proof.ts')) {
      out.push(p);
    }
  }
  return out;
}

for (const [label, path] of [
  ['route-classify-consumer.ts', consumerPath],
  ['worker main.ts', mainPath],
  ['job-route-classify.ts', bindPath],
  ['prompts.ts', promptPath],
  ['job-route-decision.ts', routePath],
  ['gateway-dispatch.ts', gatewayPath],
  ['0132 migration', migratePath],
  ['r2 harness', harnessPath],
  ['r2 status', statusPath],
  ['gap backlog', backlogPath],
  ['m4 hard gates', m4Path],
  ['REQUEST P-WORKER mw-model-op', requestModelOp],
  ['REQUEST P-WORKER mw-rag-route', requestRag],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const consumer = read(consumerPath);
const main = read(mainPath);
const bindSrc = read(bindPath);
const prompts = read(promptPath);
const route = read(routePath);
const gateway = read(gatewayPath);
const migrate = read(migratePath);
const harness = read(harnessPath);
const status = read(statusPath);
const backlog = read(backlogPath);
const m4 = read(m4Path);

A('consumer calls classifyJobRoute(', /classifyJobRoute\s*\(/.test(consumer));
A('consumer uses createJobRouteModelClassify (honest MODEL-OP, not fake rules)',
  /createJobRouteModelClassify/.test(consumer)
  && /listNextJobRoutePending/.test(consumer)
  && /gatewayDispatchOwners/.test(consumer)
  && /job_route/.test(consumer));
A('consumer forbids fake-green claims in header',
  /≠ R2 closed|NOT closed|P-API/.test(consumer)
  && /releaseEvidence=false/.test(consumer)
  && /Not HA/.test(consumer));

A('main wires runRouteClassifyConsumer + wake/stop/ready',
  /runRouteClassifyConsumer/.test(main)
  && /routeClassifyLoop/.test(main)
  && /routeClassifyLoop\.wake\(\)/.test(main)
  && /routeClassifyLoop\.stop\(\)/.test(main)
  && /routeClassifyLoop\.ready\(\)/.test(main));

A('createJobRouteModelClassify + bindJobRouteClassify present in ai-runtime',
  /export function createJobRouteModelClassify\s*\(/.test(bindSrc)
  && /export function bindJobRouteClassify\s*\(/.test(bindSrc)
  && /invoke\(/.test(bindSrc)
  && /known_not_sent|reasonCodes/.test(bindSrc)
  && /dispatched_unknown/.test(bindSrc));

A('prompt registry has job.route-classify.v1 (p.v2 · G7T calibration)',
  /'job\.route-classify\.v1'/.test(prompts)
  && /version:\s*'p\.v2'/.test(prompts)
  && JOB_ROUTE_CLASSIFY_PROMPT_SERVICE === 'job.route-classify.v1');

A('db listNextJobRoutePending + classifyJobRoute exported',
  /export async function listNextJobRoutePending\s*\(/.test(route)
  && /export async function classifyJobRoute\s*\(/.test(route)
  && /FOR UPDATE SKIP LOCKED/.test(route));

A('gateway DispatchWork includes job_route',
  /'job_route'/.test(gateway));
A('0132 migration seeds job_route gateway + pending index',
  /job_route/.test(migrate)
  && /ix_job_semantic_revision_route_pending/.test(migrate)
  && /gateway_dispatch_owners/.test(migrate));

// Sole Worker path: worker has classify; API must remain zero (P-API open).
const workerFiles = walkTsFiles(join(appsRoot, 'worker', 'src'));
const apiFiles = walkTsFiles(join(appsRoot, 'api', 'src'));
const workerHits: string[] = [];
const apiHits: string[] = [];
for (const f of workerFiles) {
  if (/classifyJobRoute\s*\(/.test(readFileSync(f, 'utf8'))) workerHits.push(f);
}
for (const f of apiFiles) {
  if (/classifyJobRoute\s*\(/.test(readFileSync(f, 'utf8'))) apiHits.push(f);
}
A('P-WORKER: apps/worker/src has classifyJobRoute( (sole consumer)',
  workerHits.length >= 1
  && workerHits.some((f) => f.replace(/\\/g, '/').endsWith('/route-classify-consumer.ts')),
  `workerCalls=${workerHits.length}`);
A('Worker sole preserved: apps/api/src zero classifyJobRoute( (wakeup-only P-API allowed)',
  apiHits.length === 0, `apiCalls=${apiHits.length}`);

// Structural fail-closed without Key: binding still works; no network.
const digest = createHash('sha256').update('p-worker-route-classify-proof', 'utf8').digest('hex');
const bound = bindJobRouteClassify(digest);
A('bindJobRouteClassify fail-closed-ready without Key (structural)',
  bound.ok === true
  && bound.ok
  && bound.provenance.operationId === JOB_ROUTE_CLASSIFY_OPERATION_ID
  && bound.provenance.semanticDigest === digest);

A('harness/status pin P-WORKER CLOSED + R2 NOT closed (P-API may be closed via wakeup)',
  /P-WORKER/.test(harness) && /CLOSED|已关|已接线/.test(harness)
  && /P-API/.test(harness + status)
  && /R2 NOT closed/.test(status)
  && /releaseEvidence=false/.test(status)
  && /Not HA/.test(status));

A('status does NOT claim 路由已生效 / R4 closed / HA',
  !/路由已生效/.test(status.replace(/≠ 路由已生效/g, '').replace(/不得宣称路由生效/g, ''))
  && /≠ 路由已生效|不得宣称路由生效/.test(status + harness)
  && /Not HA/.test(status));

const gap02 = (backlog.match(/\| GAP-RAG-02 \|[\s\S]*?(?=\n\| GAP-|$)/) || [''])[0];
A('GAP-RAG-02 still open overall; cites P-WORKER / sole / 闭环',
  /GAP-RAG-02/.test(gap02)
  && /R2 NOT closed|仍 NOT closed|仍未/.test(gap02)
  && (/P-WORKER|route-classify-consumer|sole|闭环/.test(gap02)));

A('m4 §R2 still forbids claiming 路由已生效',
  /## 3\. R2/.test(m4)
  && /无生产接线不得宣称路由生效|无生产闭环不得宣称路由生效|不得宣称路由生效/.test(m4));

A('REQUEST docs self-pin not a pass / releaseEvidence=false / 禁止自批',
  /releaseEvidence=false/.test(read(requestModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestModelOp))
  && /releaseEvidence=false/.test(read(requestRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestRag)));

function errorCode(err: unknown): string {
  if (typeof err !== 'object' || err === null || !('code' in err)) return '';
  const code = (err as { code: unknown }).code;
  return typeof code === 'string' ? code : '';
}

/**
 * 慢模型臂（全真链·红先证）：classifyJobRoute 的模型缝经真实 invoke 关口（durable claim +
 * ai_model_invocation 结算 + 0209 replay-first 围栏），模型延迟（2s）超过压低后的
 * idle_in_transaction_session_timeout（1s）。修复前：外层单事务持锁 await 模型 → 连接被
 * 服务端杀、事务回滚（revision 仍 route_pending），但 invoke 已在自身短事务 settle
 * succeeded（redactOutput=true 不可回放）；tick 2 同幂等键重领被围栏拒为
 * sensitive_result_replay_requires_artifact → 保守 known_not_sent → sticky route_unresolved
 * （岗位永久卡住且模型账已结）。修复后：外呼在任何 DB 事务之外，tick 1 直接
 * result_validated → route_decided，恰 1 次外发，无 sticky。
 */
async function proveSlowModelDoesNotWedgeRoute(): Promise<void> {
  process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'r2-p-worker-slow-model-hmac-proof-key-not-production-01';
  const priorIdleTxTimeout = process.env.PG_IDLE_TX_TIMEOUT_MS;
  // 压低 idle 事务超时；只影响本函数随后 createPool 的新池（证明内其余 pool 先于本行创建，零影响）。
  // 臂尾 finally 还原，防臂序调整或被 import 时进程级扩散。
  process.env.PG_IDLE_TX_TIMEOUT_MS = '1000';
  const port = process.env.PGPORT ?? '';
  A('隔离库端口不是 54329（慢模型臂）', port !== '' && port !== '54329', `PGPORT=${port}`);
  if (port === '' || port === '54329') return;

  const pool = createPool();
  try {
    await assertIsolatedTestTarget(pool);
    const owner = `slow_${createHash('sha256').update(String(Date.now())).digest('hex').slice(0, 12)}`;
    // 无任何唯一 leaf 信号的歧义岗位：rule miss，强制走模型路径。
    const fields = { title: '全栈工程师', description: '前后端都写', competencies: ['全栈'] };
    const created = await asPrincipal(pool, owner, (c) => createJob(c, owner, fields));
    const digest = canonicalJobSemanticDigest({
      title: fields.title, description: fields.description, competencies: fields.competencies,
    });
    const idempotencyKey = `job-route-classify:${created.id}:1:${digest}`;

    const fast = scriptedModelClient({
      // eslint-disable-next-line @typescript-eslint/naming-convention -- 注册表服务键，不是 camelCase 标识符
      'job.route-classify.v1': () => ({
        ok: true as const,
        raw: {
          allocations: [
            { leafTrackId: 'backend/nodejs', allocationBps: 7000 },
            { leafTrackId: 'frontend/web', allocationBps: 3000 },
          ],
          confidenceBps: 8500, marginBps: 4000, reasonCodes: [],
        },
      }),
    });
    let providerCalls = 0;
    const slowModel: ModelClient = {
      async complete(req, attempt, signal) {
        providerCalls++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return fast.complete(req, attempt, signal);
      },
    };
    const modelClassify = createJobRouteModelClassify({ pool, owner, model: slowModel });

    // tick 1：修复前外层事务在 ~1s 被杀 → classify 抛错；invoke 已 settle succeeded（不可回放）。
    let tick1Error = '';
    let tick1: ClassifyJobRouteResult | null = null;
    try {
      tick1 = await classifyJobRoute(pool, owner, created.id, 1, { modelClassify });
    } catch (err) {
      tick1Error = err instanceof Error ? err.message : 'tick1_threw';
    }
    const invocationFace = await pool.query(
      `SELECT status, replayable FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`,
      [owner, idempotencyKey],
    );
    const inv = invocationFace.rows[0] as { status: string; replayable: boolean } | undefined;
    const rev1Face = await pool.query(
      'SELECT status FROM job_semantic_revision WHERE job_id=$1 AND revision=1', [created.id],
    );
    const tick1Status = String(rev1Face.rows[0]?.status ?? '');
    A('tick 1 结果与账面自洽（抛错+route_pending+succeeded 不可回放 · 或直接 route_decided 恰 1 外发）',
      ((tick1Error !== '' || tick1 === null) && tick1Status === 'route_pending'
        && inv?.status === 'succeeded' && inv.replayable === false && providerCalls === 1)
      || (tick1 !== null && tick1.status === 'route_decided'
        && tick1.attemptOutcome === 'result_validated' && tick1Status === 'route_decided'
        && inv?.status === 'succeeded' && providerCalls === 1),
      `err=${tick1Error || '-'} status=${tick1Status} inv=${inv?.status ?? 'none'} calls=${providerCalls}`);

    // tick 2：修复前同键重领被 0209 围栏拒 → sticky route_unresolved/known_not_sent（缺陷读数）；
    // 修复后 tick 1 已终态 → noop already_decided（零二次外发）。
    const tick2 = await classifyJobRoute(pool, owner, created.id, 1, { modelClassify });
    const finalFace = await pool.query(
      `SELECT r.status AS rev_status, d.attempt_outcome AS outcome, d.reason_codes AS reasons
         FROM job_semantic_revision r
         LEFT JOIN job_route_decision d ON d.job_id=r.job_id AND d.revision=r.revision
        WHERE r.job_id=$1 AND r.revision=1`, [created.id],
    );
    // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case 为 SQL 列别名逐字回读
    const finalRow = finalFace.rows[0] as { rev_status: string; outcome: string | null; reasons: string[] | null };
    const reasons = Array.isArray(finalRow.reasons) ? finalRow.reasons.map(String) : [];
    A('tick 2 不产生第二次外发且岗位不落 sticky known_not_sent（修复前红：sticky+sensitive_result_replay 围栏读数）',
      providerCalls === 1
      && tick2.status === 'noop' && tick2.reason === 'already_decided'
      && finalRow.rev_status === 'route_decided' && finalRow.outcome === 'result_validated'
      && !reasons.some((r) => r.includes('sensitive_result_replay')),
      `status=${finalRow.rev_status} outcome=${String(finalRow.outcome)} calls=${providerCalls} reasons=${reasons.join(',')}`);
  } finally {
    if (priorIdleTxTimeout === undefined) delete process.env.PG_IDLE_TX_TIMEOUT_MS;
    else process.env.PG_IDLE_TX_TIMEOUT_MS = priorIdleTxTimeout;
    await pool.end();
  }
}

/** 过期修订必须离开 route_pending，同一次抽干才能领到较新的待分类修订。hmac 不匹配仍抛错。 */
async function proveStaleRevisionDoesNotBlockDrain(): Promise<void> {
  process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'r2-p-worker-stale-drain-hmac-proof-key-not-production-01';
  const port = process.env.PGPORT ?? '';
  A('隔离库端口不是 54329', port !== '' && port !== '54329', `PGPORT=${port}`);
  if (port === '' || port === '54329') return;

  const pool = createPool();
  try {
    await assertIsolatedTestTarget(pool);
    const owner = `stale_${createHash('sha256').update(String(Date.now())).digest('hex').slice(0, 12)}`;
    const hmacOwner = `hmac_${owner}`;
    const fresh = {
      title: 'Node.js 服务端工程师',
      description: '使用 NestJS 构建服务',
      competencies: ['nestjs', 'express', 'koa'],
    };
    const created = await asPrincipal(pool, owner, (c) => createJob(c, owner, {
      title: '过期修订占位岗',
      description: '旧描述',
      competencies: ['旧能力'],
    }));
    const updated = await asPrincipal(pool, owner, (c) => updateJob(c, owner, created.id, fresh));
    const before = await pool.query(
      'SELECT revision::int AS revision, status FROM job_semantic_revision WHERE job_id=$1 ORDER BY revision',
      [created.id],
    );
    const beforeRows = before.rows as Array<{ revision: number; status: string }>;
    A('抽干前两修订都在 route_pending',
      updated !== null
      && beforeRows.length === 2
      && Number(beforeRows[0]?.revision) === 1 && beforeRows[0]?.status === 'route_pending'
      && Number(beforeRows[1]?.revision) === 2 && beforeRows[1]?.status === 'route_pending');

    const model = scriptedModelClient({});
    let drainError = '';
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        drainOwnerRouteClassify({ pool, model }, owner),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error('drain_did_not_idle')), 20_000);
        }),
      ]);
    } catch (err) {
      drainError = err instanceof Error ? err.message : 'drain_threw';
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
    A('同一次抽干能结束', drainError === '', drainError);

    const after = await pool.query(
      'SELECT revision::int AS revision, status FROM job_semantic_revision WHERE job_id=$1 ORDER BY revision',
      [created.id],
    );
    const afterRows = after.rows as Array<{ revision: number; status: string }>;
    const rev1 = afterRows.find((row) => Number(row.revision) === 1);
    const rev2 = afterRows.find((row) => Number(row.revision) === 2);
    A('过期修订不再停留在 route_pending', rev1?.status === 'route_unresolved', rev1?.status ?? 'missing');
    A('同一次抽干仍领到较新的待分类修订', rev2?.status === 'route_decided', rev2?.status ?? 'missing');

    const decisions = await pool.query(
      'SELECT revision::int AS revision FROM job_route_decision WHERE job_id=$1 ORDER BY revision',
      [created.id],
    );
    const decisionRevs = (decisions.rows as Array<{ revision: number }>).map((row) => Number(row.revision));
    A('过期修订不插入 job_route_decision', !decisionRevs.includes(1) && decisionRevs.includes(2), decisionRevs.join(','));

    const events = await pool.query(
      `SELECT reason, decision_id AS "decisionId"
         FROM job_route_event WHERE job_id=$1 AND revision=1 AND to_status='route_unresolved'`,
      [created.id],
    );
    const event = events.rows[0] as { reason: string | null; decisionId: string | null } | undefined;
    A('过期修订事件原因恰为 stale_revision',
      (events.rowCount ?? 0) === 1 && event?.reason === 'stale_revision' && event.decisionId === null,
      event?.reason ?? 'none');

    const hmacJob = await asPrincipal(pool, hmacOwner, (c) => createJob(c, hmacOwner, fresh));
    const flipped = 'ab'.repeat(32);
    const tamper = await asPrincipal(pool, hmacOwner, (c) => c.query(
      `UPDATE job_semantic_revision SET input_hmac=$2
        WHERE job_id=$1 AND revision=1 AND status='route_pending' AND input_hmac <> $2`,
      [hmacJob.id, flipped],
    ));
    let hmacCode = '';
    try {
      await classifyJobRoute(pool, hmacOwner, hmacJob.id, 1, {
        modelClassify: async () => {
          throw Object.assign(new Error('hmac_path_called_model'), { code: 'hmac_path_called_model' });
        },
      });
    } catch (err) {
      hmacCode = errorCode(err);
    }
    const hmacStatus = await pool.query(
      'SELECT status FROM job_semantic_revision WHERE job_id=$1 AND revision=1',
      [hmacJob.id],
    );
    const hmacDecisions = await pool.query(
      'SELECT count(*)::int AS n FROM job_route_decision WHERE job_id=$1',
      [hmacJob.id],
    );
    A('hmac 不匹配仍抛错且不改成终态',
      (tamper.rowCount ?? 0) === 1
      && hmacCode === 'job_route_input_hmac_mismatch'
      && hmacStatus.rows[0]?.status === 'route_pending'
      && Number(hmacDecisions.rows[0]?.n) === 0,
      `code=${hmacCode} status=${String(hmacStatus.rows[0]?.status ?? '')}`);
  } finally {
    await pool.end();
  }
}

/**
 * 重试二次计费闸臂（全真链·红先证已证 · GAP-ROUTE-RETRY-UNKNOWN-REBILL 修复面）：
 * dispatched_unknown sticky 后，同内容 retryJobRoute 写新 revision（同 digest → 新幂等键
 * `job-route-classify:{jobId}:{rev+1}:{digest}`）绕开 invoke durable claim——0209 replay-first
 * 围栏对同键 unknown 恒 refusal、对异键无知——首账 unknown（provider 可能已计费待对账）时
 * 第二次真实外发=可能的二次计费。修复前红读数（base d549a497b 隔离 PG 亲跑）：
 * tick1 dispatched_unknown+inv1=unknown(model_execution_timeout)+calls=1 → retry=retried@rev2
 * → tick2 第二次真实派发 calls=2。修复后绿：冷却窗内重试抑制（unknown_pending·零新 revision
 * 零外发）；并发双击零新 revision；冷却过期（opts 注入 30ms 小窗·updated_at 已老化）放行且
 * 快模型走完分类（不永久阻塞用户）；环境变量覆盖臂（第二岗位·env=30ms 同形放行）；known_not_sent
 * （账 failed）不触闸照常重试（独立臂）。
 */
async function proveRetryGateBlocksDoubleBilling(): Promise<void> {
  process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'r2-p-worker-retry-gate-hmac-proof-key-not-production-01';
  const port = process.env.PGPORT ?? '';
  A('隔离库端口不是 54329（重试计费闸臂）', port !== '' && port !== '54329', `PGPORT=${port}`);
  if (port === '' || port === '54329') return;

  // 压低执行预算（env 每次 invoke 读取·transport ≤ execution 两值同设防 config invalid 臂）：
  // scripted 模型悬挂超预算 → invoke 到点 abort → 账 unknown(model_execution_timeout) →
  // dispatched_unknown sticky（rtx M2 形）。臂尾 finally 还原（沿慢模型臂 env 纪律）。
  const priorExecTimeout = process.env.MODEL_EXECUTION_TIMEOUT_MS;
  const priorTransportTimeout = process.env.MODEL_TIMEOUT_MS;
  const priorCooldownMs = process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS;
  process.env.MODEL_EXECUTION_TIMEOUT_MS = '4000';
  process.env.MODEL_TIMEOUT_MS = '4000';
  const pool = createPool();
  try {
    await assertIsolatedTestTarget(pool);
    const owner = `rgate_${createHash('sha256').update(String(Date.now())).digest('hex').slice(0, 12)}`;
    const fields = { title: '全栈工程师', description: '前后端都写', competencies: ['全栈'] };
    const created = await asPrincipal(pool, owner, (c) => createJob(c, owner, fields));
    const digest = canonicalJobSemanticDigest({
      title: fields.title, description: fields.description, competencies: fields.competencies,
    });
    const key1 = `job-route-classify:${created.id}:1:${digest}`;

    let providerCalls = 0;
    const hangModel: ModelClient = {
      async complete() {
        providerCalls += 1;
        // 悬挂超执行预算（非配合 adapter）：invoke 到点 abort → unknown，本 promise 随后自灭。
        await new Promise((resolve) => setTimeout(resolve, 9000));
        return { ok: true as const, raw: { allocations: [{ leafTrackId: 'backend/general', allocationBps: 10000 }], confidenceBps: 5000, marginBps: 3000, reasonCodes: [] } };
      },
    };
    const fastModel: ModelClient = {
      async complete() {
        providerCalls += 1;
        // 响应形状逐值取慢模型臂已验 accepted 面（服务端双重校验过·防 validation_rejected 干扰本臂语义）。
        return { ok: true as const, raw: { allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }], confidenceBps: 8500, marginBps: 4000, reasonCodes: [] } };
      },
    };
    const modelClassify = createJobRouteModelClassify({ pool, owner, model: hangModel });
    const fastClassify = createJobRouteModelClassify({ pool, owner, model: fastModel });
    const revCount = async (): Promise<number> => Number((await pool.query(
      'SELECT count(*)::int AS n FROM job_semantic_revision WHERE job_id=$1', [created.id],
    )).rows[0]?.n ?? 0);

    const tick1 = await classifyJobRoute(pool, owner, created.id, 1, { modelClassify });
    const tick1Face = tick1.status === 'route_unresolved' ? tick1 : null;
    const inv1 = await pool.query(
      'SELECT status, error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, key1],
    );
    // eslint-disable-next-line @typescript-eslint/naming-convention -- snake_case 为 SQL 列逐字回读
    const inv1Row = inv1.rows[0] as { status: string; error_code: string | null } | undefined;
    A('tick 1 落 dispatched_unknown sticky 且账 unknown（首呼已真实外发·调用=1）',
      tick1.status === 'route_unresolved' && tick1Face?.attemptOutcome === 'dispatched_unknown'
      && providerCalls === 1 && inv1Row?.status === 'unknown' && (await revCount()) === 1,
      `outcome=${tick1Face?.attemptOutcome ?? tick1.status} inv1=${inv1Row?.status ?? 'none'}(${inv1Row?.error_code ?? '-'}) calls=${providerCalls} reasons=${tick1Face?.reasonCodes.join(',') ?? ''}`);

    const retry1 = await asPrincipal(pool, owner, (c) => retryJobRoute(c, owner, created.id));
    const revisions1 = await revCount();
    A('同内容重试在首账 unknown 冷却窗内被抑制（修复前红：retried@rev2=第二次真实派发·二次计费窗口）',
      retry1 !== null && retry1.status === 'unknown_pending' && retry1.revision === 1
      && revisions1 === 1 && providerCalls === 1,
      `status=${retry1?.status ?? 'null'} revision=${retry1?.revision ?? '-'} revisions=${revisions1} calls=${providerCalls}`);

    const dbl = await Promise.all([
      asPrincipal(pool, owner, (c) => retryJobRoute(c, owner, created.id)),
      asPrincipal(pool, owner, (c) => retryJobRoute(c, owner, created.id)),
    ]);
    const revisions2 = await revCount();
    A('并发双击重试零新 revision 零外发（只发一次·两路均 unknown_pending）',
      dbl[0]?.status === 'unknown_pending' && dbl[1]?.status === 'unknown_pending'
      && revisions2 === 1 && providerCalls === 1,
      `statuses=${dbl.map((x) => x?.status ?? 'null').join('/')} revisions=${revisions2} calls=${providerCalls}`);

    // 冷却过期放行（先确定性老化 250ms，再以 opts 注入 100ms 小窗：updated_at 已老化超窗）→
    // retried@rev2；快模型走完 rev2 分类=用户出口恢复（此处 calls=2 系窗后放行的产品决策面）。
    await new Promise((resolve) => setTimeout(resolve, 250));
    const retryAged = await asPrincipal(pool, owner, (c) => retryJobRoute(c, owner, created.id, { unknownOutcomeCooldownMs: 100 }));
    const revisions3 = await revCount();
    A('冷却过期后重试放行（不永久阻塞用户·retried@rev2·sticky 旧 revision 原样留存）',
      retryAged !== null && retryAged.status === 'retried' && retryAged.revision === 2 && revisions3 === 2,
      `status=${retryAged?.status ?? 'null'} revision=${retryAged?.revision ?? '-'} revisions=${revisions3}`);
    const tick2 = await classifyJobRoute(pool, owner, created.id, 2, { modelClassify: fastClassify });
    const rev2Face = await pool.query(
      'SELECT status FROM job_semantic_revision WHERE job_id=$1 AND revision=2', [created.id],
    );
    A('放行后的重试真实派发并走完分类（用户出口恢复）',
      tick2.status === 'route_decided' && tick2.attemptOutcome === 'result_validated'
      && providerCalls === 2 && String(rev2Face.rows[0]?.status ?? '') === 'route_decided',
      `status=${tick2.status}/${tick2.status === 'route_decided' ? tick2.attemptOutcome : '-'} calls=${providerCalls}`);

    // 环境变量覆盖臂（第二岗位·缺省调用路径）：新缺省 2 分钟窗内抑制 → env 置 30ms + 确定性
    // 老化 60ms 后缺省调用即放行 retried@rev2（覆盖真实流入 SQL 窗口·非仅 opts 注入形）。
    const created2 = await asPrincipal(pool, owner, (c) => createJob(c, owner, fields));
    const key2a = `job-route-classify:${created2.id}:1:${digest}`;
    const tick1b = await classifyJobRoute(pool, owner, created2.id, 1, { modelClassify });
    const inv2a = await pool.query(
      'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, key2a],
    );
    const retry2a = await asPrincipal(pool, owner, (c) => retryJobRoute(c, owner, created2.id));
    A('第二岗位缺省 2 分钟冷却窗内同样抑制（unknown_pending·新缺省生效）',
      tick1b.status === 'route_unresolved' && inv2a.rows[0]?.status === 'unknown'
      && retry2a?.status === 'unknown_pending' && providerCalls === 3,
      `status=${retry2a?.status ?? 'null'} inv=${String(inv2a.rows[0]?.status ?? 'none')} calls=${providerCalls}`);
    process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS = '30';
    await new Promise((resolve) => setTimeout(resolve, 60));
    const retry2b = await asPrincipal(pool, owner, (c) => retryJobRoute(c, owner, created2.id));
    const revisionsJ2 = Number((await pool.query(
      'SELECT count(*)::int AS n FROM job_semantic_revision WHERE job_id=$1', [created2.id],
    )).rows[0]?.n ?? 0);
    A('环境变量覆盖生效（ROUTE_RETRY_UNKNOWN_COOLDOWN_MS=30·老化后缺省调用放行 retried@rev2）',
      retry2b !== null && retry2b.status === 'retried' && retry2b.revision === 2 && revisionsJ2 === 2,
      `status=${retry2b?.status ?? 'null'} revision=${retry2b?.revision ?? '-'} revisions=${revisionsJ2}`);
  } finally {
    if (priorExecTimeout === undefined) delete process.env.MODEL_EXECUTION_TIMEOUT_MS;
    else process.env.MODEL_EXECUTION_TIMEOUT_MS = priorExecTimeout;
    if (priorTransportTimeout === undefined) delete process.env.MODEL_TIMEOUT_MS;
    else process.env.MODEL_TIMEOUT_MS = priorTransportTimeout;
    if (priorCooldownMs === undefined) delete process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS;
    else process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS = priorCooldownMs;
    await pool.end();
  }
}

/**
 * known_not_sent 不触闸臂：确定性拒绝（scripted {ok:false,kind:'deterministic'}·known-not-executed）
 * → sticky known_not_sent + 账 failed（无计费歧义·任务书「已知未发送仍允许正常重试」）→
 * 缺省冷却下重试照常 retried@rev2 → 快模型走完分类。
 */
async function proveKnownNotSentRetryUnblocked(): Promise<void> {
  process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'r2-p-worker-retry-gate-hmac-proof-key-not-production-01';
  const port = process.env.PGPORT ?? '';
  A('隔离库端口不是 54329（known_not_sent 不触闸臂）', port !== '' && port !== '54329', `PGPORT=${port}`);
  if (port === '' || port === '54329') return;

  const pool = createPool();
  try {
    await assertIsolatedTestTarget(pool);
    const owner = `kns_${createHash('sha256').update(String(Date.now())).digest('hex').slice(0, 12)}`;
    const fields = { title: '全栈工程师', description: '前后端都写', competencies: ['全栈'] };
    const created = await asPrincipal(pool, owner, (c) => createJob(c, owner, fields));
    const digest = canonicalJobSemanticDigest({
      title: fields.title, description: fields.description, competencies: fields.competencies,
    });

    let providerCalls = 0;
    const refuseModel: ModelClient = {
      async complete() {
        providerCalls += 1;
        return { ok: false as const, kind: 'deterministic' as const };
      },
    };
    const fastModel: ModelClient = {
      async complete() {
        providerCalls += 1;
        // 响应形状逐值取慢模型臂已验 accepted 面（服务端双重校验过·防 validation_rejected 干扰本臂语义）。
        return { ok: true as const, raw: { allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }], confidenceBps: 8500, marginBps: 4000, reasonCodes: [] } };
      },
    };
    const refuseClassify = createJobRouteModelClassify({ pool, owner, model: refuseModel });
    const fastClassify = createJobRouteModelClassify({ pool, owner, model: fastModel });

    const tick1 = await classifyJobRoute(pool, owner, created.id, 1, { modelClassify: refuseClassify });
    const tick1Face = tick1.status === 'route_unresolved' ? tick1 : null;
    const inv1 = await pool.query(
      'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, `job-route-classify:${created.id}:1:${digest}`],
    );
    A('tick 1 落 known_not_sent sticky 且账 failed（确定性拒绝·无计费歧义）',
      tick1.status === 'route_unresolved' && tick1Face?.attemptOutcome === 'known_not_sent'
      && inv1.rows[0]?.status === 'failed',
      `outcome=${tick1Face?.attemptOutcome ?? tick1.status} inv1=${String(inv1.rows[0]?.status ?? 'none')} calls=${providerCalls}`);

    const retry = await asPrincipal(pool, owner, (c) => retryJobRoute(c, owner, created.id));
    A('known_not_sent（账 failed）重试不受闸拦照常写新 revision（缺省冷却）',
      retry !== null && retry.status === 'retried' && retry.revision === 2,
      `status=${retry?.status ?? 'null'} revision=${retry?.revision ?? '-'}`);
    const tick2 = await classifyJobRoute(pool, owner, created.id, 2, { modelClassify: fastClassify });
    A('known_not_sent 重试走完分类（用户出口恢复）',
      tick2.status === 'route_decided' && providerCalls === 2,
      `status=${tick2.status} calls=${providerCalls}`);
  } finally {
    await pool.end();
  }
}

/**
 * 跨 owner 冷却隔离臂（pre-exec 双审两路 P2 补证·EXEC 令随令行使）：owner-A 岗位首账 unknown
 * 处于缺省冷却窗内时，owner-B 独立岗位的重试不受 owner-A 冷却窗影响——闸谓词
 * `owner_user_id=$1 AND idempotency_key=$2`（ai_model_invocation PK 0037 同构）+ FORCE RLS
 * owner 相等（0037）双保险，冷却窗按各 owner 自身前账结算时刻计。正向对照：owner-A 自身重试
 * 同窗仍抑制（unknown_pending），证明隔离是「B 不被 A 拦」而非「闸失效」。
 */
async function proveCrossOwnerRetryIsolation(): Promise<void> {
  process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'r2-p-worker-retry-gate-hmac-proof-key-not-production-01';
  const port = process.env.PGPORT ?? '';
  A('隔离库端口不是 54329（跨 owner 冷却隔离臂）', port !== '' && port !== '54329', `PGPORT=${port}`);
  if (port === '' || port === '54329') return;

  const priorExecTimeout = process.env.MODEL_EXECUTION_TIMEOUT_MS;
  const priorTransportTimeout = process.env.MODEL_TIMEOUT_MS;
  const priorCooldownMs = process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS;
  process.env.MODEL_EXECUTION_TIMEOUT_MS = '4000';
  process.env.MODEL_TIMEOUT_MS = '4000';
  delete process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS;
  const pool = createPool();
  try {
    await assertIsolatedTestTarget(pool);
    const suffix = createHash('sha256').update(`${Date.now()}:cross-owner`).digest('hex').slice(0, 12);
    const ownerA = `xown_a_${suffix}`;
    const ownerB = `xown_b_${suffix}`;
    const fields = { title: '全栈工程师', description: '前后端都写', competencies: ['全栈'] };
    const jobA = await asPrincipal(pool, ownerA, (c) => createJob(c, ownerA, fields));
    const jobB = await asPrincipal(pool, ownerB, (c) => createJob(c, ownerB, fields));
    const digest = canonicalJobSemanticDigest({
      title: fields.title, description: fields.description, competencies: fields.competencies,
    });

    let hangCalls = 0;
    let refuseCalls = 0;
    let fastCalls = 0;
    const hangModel: ModelClient = {
      async complete() {
        hangCalls += 1;
        await new Promise((resolve) => setTimeout(resolve, 9000));
        return { ok: true as const, raw: { allocations: [{ leafTrackId: 'backend/general', allocationBps: 10000 }], confidenceBps: 5000, marginBps: 3000, reasonCodes: [] } };
      },
    };
    const refuseModel: ModelClient = {
      async complete() {
        refuseCalls += 1;
        return { ok: false as const, kind: 'deterministic' as const };
      },
    };
    const fastModel: ModelClient = {
      async complete() {
        fastCalls += 1;
        return { ok: true as const, raw: { allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }], confidenceBps: 8500, marginBps: 4000, reasonCodes: [] } };
      },
    };
    const hangA = createJobRouteModelClassify({ pool, owner: ownerA, model: hangModel });
    const refuseB = createJobRouteModelClassify({ pool, owner: ownerB, model: refuseModel });
    const fastB = createJobRouteModelClassify({ pool, owner: ownerB, model: fastModel });

    const tick1a = await classifyJobRoute(pool, ownerA, jobA.id, 1, { modelClassify: hangA });
    const invA = await pool.query(
      'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [ownerA, `job-route-classify:${jobA.id}:1:${digest}`],
    );
    const retryA = await asPrincipal(pool, ownerA, (c) => retryJobRoute(c, ownerA, jobA.id));
    A('正向对照：owner-A 缺省窗内自身重试仍抑制（unknown_pending·闸未失效）',
      tick1a.status === 'route_unresolved' && invA.rows[0]?.status === 'unknown'
      && retryA?.status === 'unknown_pending' && hangCalls === 1,
      `invA=${String(invA.rows[0]?.status ?? 'none')} retryA=${retryA?.status ?? 'null'} hangCalls=${hangCalls}`);

    const tick1b = await classifyJobRoute(pool, ownerB, jobB.id, 1, { modelClassify: refuseB });
    const tick1bFace = tick1b.status === 'route_unresolved' ? tick1b : null;
    const retryB = await asPrincipal(pool, ownerB, (c) => retryJobRoute(c, ownerB, jobB.id));
    A('跨 owner 隔离：owner-A 冷却窗内时 owner-B 重试不受影响（缺省冷却下照常 retried@rev2）',
      tick1bFace?.attemptOutcome === 'known_not_sent' && refuseCalls === 1
      && retryB !== null && retryB.status === 'retried' && retryB.revision === 2,
      `outcome=${tick1bFace?.attemptOutcome ?? tick1b.status} retryB=${retryB?.status ?? 'null'}@${retryB?.revision ?? '-'}`);
    const tick2b = await classifyJobRoute(pool, ownerB, jobB.id, 2, { modelClassify: fastB });
    const invAAfter = await pool.query(
      'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [ownerA, `job-route-classify:${jobA.id}:1:${digest}`],
    );
    A('owner-B 重试走完分类且 owner-A 前账 unknown 原样未动',
      tick2b.status === 'route_decided' && fastCalls === 1
      && invAAfter.rows[0]?.status === 'unknown',
      `tick2b=${tick2b.status} fastCalls=${fastCalls} invAAfter=${String(invAAfter.rows[0]?.status ?? 'none')}`);
  } finally {
    if (priorExecTimeout === undefined) delete process.env.MODEL_EXECUTION_TIMEOUT_MS;
    else process.env.MODEL_EXECUTION_TIMEOUT_MS = priorExecTimeout;
    if (priorTransportTimeout === undefined) delete process.env.MODEL_TIMEOUT_MS;
    else process.env.MODEL_TIMEOUT_MS = priorTransportTimeout;
    if (priorCooldownMs === undefined) delete process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS;
    else process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS = priorCooldownMs;
    await pool.end();
  }
}

A('重试 unknown 冷却缺省=2 分钟（120000ms·2026-11-06 协调方裁定·env ROUTE_RETRY_UNKNOWN_COOLDOWN_MS 可覆盖）',
  ROUTE_RETRY_UNKNOWN_COOLDOWN_MS === 120_000, String(ROUTE_RETRY_UNKNOWN_COOLDOWN_MS));

{
  // 冷却窗环境变量覆盖 resolver 断言（纯函数·零 DB）：缺省回落 / env 数值生效 / 非法值
  // fail-closed 回退缺省并警告一次（EXEC 令 P2 裁定：0/负数/非数字/越界不再抛错、也绝不静默
  // 关闸——统一回退缺省 120000·进程生命周期内警告恰一次）。
  const priorCd = process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS;
  const cdRestore = () => {
    if (priorCd === undefined) delete process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS;
    else process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS = priorCd;
  };
  let defaultOk = false;
  let envOk = false;
  let invalidFallbacks = 0;
  let warnCalls = -1;
  try {
    delete process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS;
    defaultOk = resolveRouteRetryUnknownCooldownMs() === 120_000;
    process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS = '30';
    envOk = resolveRouteRetryUnknownCooldownMs() === 30;
    const warns: string[] = [];
    const priorWarn = console.warn;
    console.warn = (...args: unknown[]) => { warns.push(args.map(String).join(' ')); };
    try {
      // 六例非法：非数字/负数/0（旧「关闭」语义废止）/小数/越上限/纯空白静默归 0 角。
      for (const bad of ['abc', '-1', '0', '1.5', '3600001', ' ']) {
        process.env.ROUTE_RETRY_UNKNOWN_COOLDOWN_MS = bad;
        if (resolveRouteRetryUnknownCooldownMs() === 120_000) invalidFallbacks += 1;
      }
    } finally {
      console.warn = priorWarn;
    }
    warnCalls = warns.length;
  } finally {
    cdRestore();
  }
  A('冷却窗环境变量覆盖 resolver（缺省 120000·env 数值生效·非法六例 fail-closed 全回退缺省·警告恰一次）',
    defaultOk && envOk && invalidFallbacks === 6 && warnCalls === 1,
    `default=${defaultOk} env=${envOk} fallbacks=${invalidFallbacks} warns=${warnCalls}`);
}


proveStaleRevisionDoesNotBlockDrain()
  .then(() => proveSlowModelDoesNotWedgeRoute())
  .then(() => proveRetryGateBlocksDoubleBilling())
  .then(() => proveKnownNotSentRetryUnblocked())
  .then(() => proveCrossOwnerRetryIsolation())
  .then(() => {
  console.log(failures === 0
    ? '\nOK  r2-p-worker-route-classify prove (P-WORKER closed via sole route-classify consumer + MODEL-OP modelClassify; R2 NOT closed; ≠ 路由已生效; releaseEvidence=false; Not HA)'
    : `\nFAIL  r2-p-worker-route-classify prove (${failures} failures)`);
  process.exit(failures === 0 ? 0 : 1);
}).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
