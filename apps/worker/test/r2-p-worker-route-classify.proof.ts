/**
 * R2 P-WORKER — sole Worker classify / job_route for route_pending.
 * releaseEvidence=false · Not HA · closing P-WORKER ≠ R2 fully closed (P-API may remain)
 * ≠ 路由已生效 · ≠ R4 / HA / G6 · no flip default · no open DELETE
 * No fake rule-only classifier that claims R2 green.
 *
 * Prefer fail-closed without Key for structural proves.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  bindJobRouteClassify, JOB_ROUTE_CLASSIFY_OPERATION_ID, JOB_ROUTE_CLASSIFY_PROMPT_SERVICE,
  scriptedModelClient,
} from '@meetwise/ai-runtime';
import {
  assertIsolatedTestTarget, asPrincipal, classifyJobRoute, createJob, createPool, updateJob,
} from '@meetwise/db';
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

proveStaleRevisionDoesNotBlockDrain().then(() => {
  console.log(failures === 0
    ? '\nOK  r2-p-worker-route-classify prove (P-WORKER closed via sole route-classify consumer + MODEL-OP modelClassify; R2 NOT closed; ≠ 路由已生效; releaseEvidence=false; Not HA)'
    : `\nFAIL  r2-p-worker-route-classify prove (${failures} failures)`);
  process.exit(failures === 0 ? 0 : 1);
}).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
