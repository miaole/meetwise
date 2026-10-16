/**
 * FENCE-REFLOW F4/C10 证明（§4-4 具名 prove 导入方）：ops/recovery/fence-reflow-repair.ts 的
 * dry-run 零写、--apply 释放+关终态+幂等（二跑 0 行）、B 端围栏跳过计数、围栏账本零触、
 * asPrincipal(app 运行角色) 禁旁路静态断言。
 *   pnpm -C apps/worker prove:fence-reflow-repair   （需 db:up·隔离库口径同 commerce-reconcile）
 *   import { dryRun, apply } from '../../../ops/recovery/fence-reflow-repair.ts'  （F4(v)）
 */
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Stats } from 'node:fs';

// B 端真 start 链 fixture 的 rule-classify HMAC key（test-only,同 commerce-reconcile.proof 先例;非生产）。
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'fence-reflow-repair-job-route-input-hmac-proof-key-not-production-01';
import {
  createPool, asPrincipal, reserveEntitlement, assertIsolatedTestTarget,
  inviteCandidate, startApplicationInterview, createJob, classifyJobRoute,
} from '@meetwise/db';
import { dryRun, apply } from '../../../ops/recovery/fence-reflow-repair.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

const S = Date.now().toString(36);
const owner = `frr-${S}`;

/** 围栏 fixture（0076 v2 判定面）：privacy_erasure_request('fenced') × privacy_checkpoint_target。admin 池直插仅作 fixture。 */
async function fenceInterview(interviewId: string) {
  const req = await pool.query(
    "INSERT INTO privacy_erasure_request(owner_user_id,scope,subject_id,idempotency_key_hash,status) VALUES ($1,'interview_data',$2,$3,'fenced') RETURNING id",
    [owner, interviewId, `frr:${owner}:${interviewId}`]);
  const requestId = req.rows[0].id as string;
  const tgt = await pool.query(
    "INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac) VALUES ($1,'checkpoint_rows',$2) RETURNING id",
    // resource_hmac 钉 64-hex（0047 privacy_deletion_target_resource_hmac_chk）——fixture 用 sha256 摘要满足格式。
    [requestId, createHash('sha256').update(`frr-hmac:${interviewId}`).digest('hex')]);
  await pool.query(
    'INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch) VALUES ($1,$2,$3,$4,2)',
    [tgt.rows[0].id, requestId, owner, interviewId]);
}
const expireLease = (key: string) =>
  pool.query("UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2", [owner, key]);
const ivStatus = (iid: string) =>
  pool.query('SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2', [iid, owner]).then((r) => r.rows[0]?.status as string | undefined);
const consStatus = (key: string) =>
  pool.query("SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2", [owner, key]).then((r) => r.rows[0]?.status as string | undefined);
const ledgerCounts = () => pool.query(`
  SELECT (SELECT count(*)::int FROM privacy_erasure_request WHERE owner_user_id=$1) AS requests,
         (SELECT count(*)::int FROM privacy_checkpoint_target WHERE owner_user_id=$1) AS targets,
         (SELECT count(*)::int FROM interview_event WHERE owner_user_id=$1) AS events`, [owner]).then((r) => r.rows[0]);
const bucketReserved = () =>
  // SUM 口径：桶上可能同时挂 C 端+B 端两笔预留（本 fixture 恰为 1.0+1.0）。
  pool.query('SELECT COALESCE(SUM(units_reserved),0)::float AS reserved FROM entitlement_bucket WHERE owner_user_id=$1', [owner]).then((r) => Number(r.rows[0]?.reserved ?? -1));

async function main() {
  await assertIsolatedTestTarget(pool);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [owner]);

  // C 端围栏空壳：'created' + 围栏锚 + 挂死预留（租约已过期）。
  const ivC = `frr-iv-c-${S}`;
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [ivC, owner]);
  await fenceInterview(ivC);
  await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, ivC, 'mock_interview', 1.0));
  await expireLease(ivC);

  // B 端围栏行（application_id≠NULL）：真 start 链 fixture（同 commerce-reconcile ⑦ 口径）。
  const recruiter = `frr-rec-${S}`;
  const resumeId = randomUUID();
  const jobRow = await asPrincipal(pool, recruiter, (c) => createJob(c, recruiter, {
    title: 'FRR B 端工程师', description: 'fence-reflow-repair prove fixture', competencies: ['nodejs'],
  }));
  const rev = Number((await pool.query('SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobRow.id])).rows[0].n);
  await classifyJobRoute(pool, recruiter, jobRow.id, rev, {
    modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
  });
  await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [resumeId, owner, `frr:${resumeId}`]);
  const app = await asPrincipal(pool, recruiter, (c) => inviteCandidate(c, recruiter, jobRow.id, owner));
  const started = await asPrincipal(pool, owner, (c) => startApplicationInterview(c, owner, app!.applicationId, resumeId));
  const ivB = (started.status === 'started' || started.status === 'reused') ? started.interviewId : undefined;
  if (!ivB) throw Object.assign(new Error('frr_b_side_start_missing'), { code: 'frr_b_side_start_missing' });
  const ivBStatusBefore = await ivStatus(ivB);
  await fenceInterview(ivB);
  await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, ivB, 'mock_interview', 1.0));
  await expireLease(ivB);

  const ledgerBefore = await ledgerCounts();

  section('C10 dry-run（默认·零写）');
  const dry = await dryRun(pool);
  const dryRow = dry.cSide.find((r) => r.interviewId === ivC);
  A('dry-run 输出在卷：C 端围栏行入选（application_id IS NULL·reservedConsumption=true 计划呈现）',
    dry.mode === 'dry-run' && !!dryRow && dryRow.reservedConsumption === true && dryRow.status === 'created');
  A('F4(ii) dry-run 报 B 端围栏跳过计数 ≥1（B 端行不入 cSide）', dry.bSideFencedSkipped >= 1 && !dry.cSide.some((r) => r.interviewId === ivB));
  A('dry-run 零写：interview 状态不变（created/created）', (await ivStatus(ivC)) === 'created' && (await ivStatus(ivB)) === ivBStatusBefore);
  A('dry-run 零写：预留仍 reserved·桶 units_reserved 不变（=2.0·C 端 1.0+B 端 1.0——EXEC 续做修正：前席漏计 B 端预留）',
    (await consStatus(ivC)) === 'reserved' && (await bucketReserved()) === 2.0);
  A('dry-run 零写：围栏账本/事件账零增量', JSON.stringify(await ledgerCounts()) === JSON.stringify(ledgerBefore));

  section('C10 --apply（释放+关终态）');
  const rep = await apply(pool);
  const applyRow = rep.cSide.find((r) => r.interviewId === ivC);
  A('apply：C 端围栏行 released=true·terminalClosed=true（恰 1 行 C 端）',
    rep.mode === 'apply' && !!applyRow && applyRow.released === true && applyRow.terminalClosed === true
    && rep.cSide.length === 1 && rep.releasedCount === 1 && rep.terminalClosedCount === 1);
  A('apply：预留 consumption 置 released·C 端 1.0 释放回池（2.0→1.0——余下 1.0=B 端预留原样,同跳零写正面证据）',
    (await consStatus(ivC)) === 'released' && (await bucketReserved()) === 1.0);
  A('apply：关终态=abandoned（复用 abandon 同枚举·无新状态）', (await ivStatus(ivC)) === 'abandoned');
  A('F4(ii) apply：B 端围栏行同跳零写（interview 状态零翻转·预留不动）',
    rep.bSideFencedSkipped >= 1 && (await ivStatus(ivB)) === ivBStatusBefore && (await consStatus(ivB)) === 'reserved');
  A('apply：围栏账本零触（privacy_erasure_request/privacy_checkpoint_target 计数状态不变·§5-3）',
    JSON.stringify(await ledgerCounts()) === JSON.stringify(ledgerBefore));
  A('apply：零事件写（围栏行不发 interview_unavailable/assessment_unavailable·interview_event 增量=0）',
    (await ledgerCounts()).events === ledgerBefore.events && ledgerBefore.events === 0);

  section('C10 幂等（二跑 0 行）');
  const rep2 = await apply(pool);
  A('二跑：cSide 空·released=0·terminalClosed=0（枚举钉外无行可选）',
    rep2.cSide.length === 0 && rep2.releasedCount === 0 && rep2.terminalClosedCount === 0);
  A('二跑：围栏账本仍零触', JSON.stringify(await ledgerCounts()) === JSON.stringify(ledgerBefore));

  section('F4(iv) asPrincipal(app 运行角色) 禁旁路——静态断言（沿 uc-e2e-001-nhp-bound lineOf 先例）');
  const opsSrc = readFileSync(resolve(repoRoot, 'ops/recovery/fence-reflow-repair.ts'), 'utf8');
  const asPrincipalAnchor = opsSrc.split('\n').findIndex((l) => l.includes('await asPrincipal(pool, owner')) + 1;
  A('逐 owner asPrincipal 连接锚在位（lineOf>0）', asPrincipalAnchor > 0);
  A('旁路字样全文 grep=0（特权角色名/SET ROLE 旁路形零出现）',
    ['privacy_api_owner', 'superuser', 'SET ROLE'].every((k) => !opsSrc.includes(k)));
  {
    // C10「零产品面引用」：产品 src 树全扫，一次性工具只允许出现在 ops/ 与 test/。
    const productRoots = ['apps/api/src', 'apps/web/src', 'apps/worker/src', 'packages/db/src', 'packages/domain/src'];
    const offenders: string[] = [];
    const walk = (dir: string) => {
      let entries: string[] = [];
      try { entries = readdirSync(dir); } catch { return; }
      for (const entry of entries) {
        const full = resolve(dir, entry);
        let stat: Stats;
        try { stat = statSync(full); } catch { continue; }
        if (stat.isDirectory()) walk(full);
        else if (/\.(ts|tsx|mjs|js)$/.test(entry) && readFileSync(full, 'utf8').includes('fence-reflow-repair')) offenders.push(full);
      }
    };
    for (const dir of productRoots) walk(resolve(repoRoot, dir));
    A('C10 零产品面引用：产品 src 树全扫无 import（一次性工具 ≠ 产品功能）', offenders.length === 0);
  }

  console.log(`\n${fail === 0 ? '✓ FENCE-REFLOW C10 fence-reflow-repair 全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
