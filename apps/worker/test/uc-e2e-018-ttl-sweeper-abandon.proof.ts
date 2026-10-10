/**
 * UC-E2E-018 §1b #3 · GAP-UC018-TTL dedicated prove (eval-first · apps/worker).
 *
 * Asserts lease-expired orphan → commerceReconcileTick → Interview=abandoned +
 * entitlement=released (+ AiGraphRun safely_terminated when present) — SAME
 * terminal口径 as user abandon. Does NOT wash from commerce-reconcile:prove alone.
 *
 * releaseEvidence=false · Not HA · 本绿 closes GAP-UC018-TTL only · ≠ UC-E2E-018 covered
 * matrix stays partial · §1b #5 UI / #6 sole-stack remain OPEN
 *
 *   pnpm uc018:ttl:prove                 (via run-e2e-isolated)
 *   pnpm -C apps/worker prove:uc018-ttl  (raw; needs isolated DATABASE_URL)
 *
 * Cite: harness/uc-e2e-018-ttl-sweeper-abandon.md · parent §1b #3 · Ban wash
 * commerce-reconcile / GRAPH / FULL-E2E / abandon:* into TTL closed / UC covered
 */
import {
  createPool, asPrincipal, reserveEntitlement, availableUnits,
  renewReservationLease, DEFAULT_LEASE_SECONDS, assertIsolatedTestTarget,
} from '@meetwise/db';
import { commerceReconcileTick } from '../src/commerce-reconcile.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `uc018ttl-${k}-${S}`;
const IID = (k: string) => `iv-uc018ttl-${k}-${S}`;
const GRAPH = 'adaptive-interview';

const evCount = (owner: string, stream: string, kind: string) =>
  asPrincipal(pool, owner, (c) => c.query(
    'SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2', [stream, kind]))
    .then((r) => r.rows[0].n as number);
const consStatus = (owner: string, key: string) =>
  asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key]))
    .then((r) => r.rows[0]?.status as string | undefined);
const ivStatus = (owner: string, id: string) =>
  asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2', [id, owner]))
    .then((r) => r.rows[0]?.status as string | undefined);
/** Mirrors create()/list in-progress filter used by InterviewService. */
const inProgressIds = (owner: string) =>
  asPrincipal(pool, owner, (c) => c.query(
    "SELECT id FROM interview WHERE owner_user_id=$1 AND status NOT IN ('completed','abandoned','failed') ORDER BY id",
    [owner]))
    .then((r) => r.rows.map((row) => row.id as string));
const graphStatus = (owner: string, id: string) =>
  asPrincipal(pool, owner, (c) => c.query(
    'SELECT status, lease_owner FROM ai_graph_run WHERE owner_user_id=$1 AND thread_id=$2 ORDER BY version DESC LIMIT 1',
    [owner, id]))
    .then((r) => r.rows[0] as { status: string; lease_owner: string | null } | undefined);

async function seedOwner(owner: string, units = 5.0) {
  await pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')",
    [owner, units],
  );
}
async function expireLease(owner: string, key: string) {
  await pool.query(
    "UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2",
    [owner, key],
  );
}
async function insertGraphRun(owner: string, id: string, status: string) {
  await asPrincipal(pool, owner, (c) => c.query(
    `INSERT INTO ai_graph_run(graph_name,thread_id,owner_user_id,status,version,lease_owner,lease_expires_at)
       VALUES ($1,$2,$3,$4,1,$5,now()+interval '120 seconds')`,
    [GRAPH, id, owner, status, `lease-${id}`],
  ));
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('UC-E2E-018 TTL sweeper abandon prove · GAP-UC018-TTL · releaseEvidence=false · Not HA');
  console.log('NOTE: 本绿 closes GAP-UC018-TTL only；≠ UC-E2E-018 covered；matrix stays partial');
  console.log('NOTE: §1b #5 UI / #6 sole-stack remain OPEN；Ban wash commerce-reconcile:prove into TTL closed');

  section('T1 · waiting_user+reserved 租约过期 → TTL tick → abandoned + released（同用户放弃终态口径）');
  {
    const owner = OWN('t1'), id = IID('t1');
    await seedOwner(owner, 5.0);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [id, owner]);
    const r1 = await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    A('T1 reserve → reserved', r1.status === 'reserved');
    A('T1 额度扣 1.0（5→4）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);
    await expireLease(owner, id);
    const tick = await commerceReconcileTick(pool);
    A('T1 tick staleReleased≥1', tick.staleReleased >= 1);
    A('T1 tick abandoned≥1', tick.abandoned >= 1);
    A('T1 interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('T1 consumption=released', (await consStatus(owner, id)) === 'released');
    A('T1 额度全回补（4→5，净变 0）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
    A('T1 interview_unavailable 终态事件', (await evCount(owner, id, 'interview_unavailable')) === 1);
    A('T1 abandoned ∉ in-progress（create 不复用尸体）', !(await inProgressIds(owner)).includes(id));
  }

  section('T2 · active+AiGraphRun 租约过期 → abandoned + safely_terminated（同 abandon 图终态）');
  {
    const owner = OWN('t2'), id = IID('t2');
    await seedOwner(owner, 5.0);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [id, owner]);
    await insertGraphRun(owner, id, 'active');
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await expireLease(owner, id);
    await commerceReconcileTick(pool);
    A('T2 interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('T2 consumption=released', (await consStatus(owner, id)) === 'released');
    const g = await graphStatus(owner, id);
    A('T2 AiGraphRun=safely_terminated', g?.status === 'safely_terminated');
    A('T2 AiGraphRun lease cleared', g?.lease_owner == null);
    A('T2 额度净变 0', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
  }

  section('T3 · 续约活会话不被 TTL 误置 abandoned');
  {
    const owner = OWN('t3'), id = IID('t3');
    await seedOwner(owner, 5.0);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [id, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await expireLease(owner, id);
    const renewed = await asPrincipal(pool, owner, (c) => renewReservationLease(c, owner, id, DEFAULT_LEASE_SECONDS));
    A('T3 续约成功', renewed === true);
    await commerceReconcileTick(pool);
    A('T3 仍 reserved', (await consStatus(owner, id)) === 'reserved');
    A('T3 仍 waiting_user（未被 TTL abandon）', (await ivStatus(owner, id)) === 'waiting_user');
    A('T3 额度未退（仍 4.0）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);
    A('T3 无 interview_unavailable', (await evCount(owner, id, 'interview_unavailable')) === 0);
  }

  section('T4 · 重跑 TTL tick 不重退 / 不重发 / 保持 abandoned');
  {
    const owner = OWN('t4'), id = IID('t4');
    await seedOwner(owner, 5.0);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [id, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await expireLease(owner, id);
    await commerceReconcileTick(pool);
    const avail1 = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    await commerceReconcileTick(pool);
    await commerceReconcileTick(pool);
    A('T4 重跑额度不变', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === avail1 && avail1 === 5.0);
    A('T4 interview_unavailable 恰 1', (await evCount(owner, id, 'interview_unavailable')) === 1);
    A('T4 仍 abandoned', (await ivStatus(owner, id)) === 'abandoned');
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-018 TTL sweeper abandon asserts passed (GAP-UC018-TTL only; ≠ covered; matrix partial)'
    : `✗ ${fail} UC-E2E-018 TTL asserts failed`}`);
  console.log('CLOSED_GAP_UC018_TTL: lease-expired orphan → abandoned+released via commerceReconcileTick/abandonInterviewAndRelease；dedicated uc018:ttl:prove');
  console.log('PIN: §1b #5 UI + #6 sole-stack remain OPEN → matrix partial ≠ covered');
  console.log('PIN: Ban wash commerce-reconcile:prove / GRAPH / FULL-E2E / uc018:abandon:* into UC covered');
  console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false');
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
