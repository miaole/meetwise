/**
 * UC-E2E-018 §1b #2 · GAP-UC018-GRAPH dedicated prove (eval-first · packages/db).
 *
 * Asserts user-abandon → AiGraphRun safe_terminating→safely_terminated + business-fact
 * retention (interview_event / interview_question / interview row). Does NOT wash from
 * abandon HTTP / full.e2e alone — this CMD nails graph terminal state.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-018 covered · matrix stays partial
 * §1b #3 TTL / #5 UI / #6 sole-stack remain OPEN
 *
 *   pnpm uc018:graph:prove                 (via run-e2e-isolated)
 *   pnpm -C packages/db prove:uc018-graph  (raw; needs isolated DATABASE_URL)
 *
 * Cite: harness/uc-e2e-018-graph-safely-terminated.md · parent §1b #2 · status-machine AiGraphRun
 */
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, abandonInterviewAndRelease, availableUnits,
} from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `uc018g-${k}-${S}`;
const IID = (k: string) => `iv-uc018g-${k}-${S}`;
const GRAPH = 'adaptive-interview';

async function seed(owner: string, units = 5.0) {
  await pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')",
    [owner, units],
  );
}

async function insertInterview(owner: string, id: string, status = 'active') {
  await pool.query(
    'INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,$3)',
    [id, owner, status],
  );
}

async function insertGraphRun(owner: string, id: string, status: string) {
  await asPrincipal(pool, owner, (c) => c.query(
    `INSERT INTO ai_graph_run(graph_name,thread_id,owner_user_id,status,version,lease_owner,lease_expires_at)
       VALUES ($1,$2,$3,$4,1,$5,now()+interval '120 seconds')`,
    [GRAPH, id, owner, status, `lease-${id}`],
  ));
}

async function insertBusinessFacts(owner: string, id: string) {
  await asPrincipal(pool, owner, async (c) => {
    await c.query(
      `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload)
         VALUES ($1,$2,1,'question_issued','{"q":"Q1"}'::jsonb)`,
      [owner, id],
    );
    await c.query(
      `INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status)
         VALUES ($1,$2,$3,1,0,$4,'issued')`,
      [owner, id, `q-${id}-1`, 'What is your strength?'],
    );
  });
}

async function graphStatus(owner: string, id: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT status, lease_owner FROM ai_graph_run WHERE owner_user_id=$1 AND thread_id=$2 ORDER BY version DESC LIMIT 1',
    [owner, id],
  )).then((r) => r.rows[0] as { status: string; lease_owner: string | null } | undefined);
}

async function eventCount(owner: string, id: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT count(*)::int AS n FROM interview_event WHERE owner_user_id=$1 AND stream_key=$2',
    [owner, id],
  )).then((r) => Number(r.rows[0].n));
}

async function questionCount(owner: string, id: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT count(*)::int AS n FROM interview_question WHERE owner_user_id=$1 AND interview_id=$2',
    [owner, id],
  )).then((r) => Number(r.rows[0].n));
}

async function ivStatus(owner: string, id: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2',
    [id, owner],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('UC-E2E-018 GRAPH safely_terminated prove · GAP-UC018-GRAPH · releaseEvidence=false · Not HA');
  console.log('NOTE: 本绿 closes GAP-UC018-GRAPH only；≠ UC-E2E-018 covered；matrix stays partial');
  console.log('NOTE: §1b #3 TTL CLOSED via uc018:ttl:prove；#5 UI / #6 sole-stack remain OPEN；Ban wash abandon HTTP/full.e2e/ttl into GRAPH/UC covered');

  section('G1 · active AiGraphRun + 业务事实 → abandon → safely_terminated + 事实保全');
  {
    const owner = OWN('g1'), id = IID('g1');
    await seed(owner, 5.0);
    await insertInterview(owner, id, 'active');
    await insertGraphRun(owner, id, 'active');
    await insertBusinessFacts(owner, id);
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));

    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('G1 abandon → abandoned', ab.status === 'abandoned');
    A('G1 released=released', ab.released === 'released');
    A('G1 interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');

    const g = await graphStatus(owner, id);
    A('G1 AiGraphRun=safely_terminated', g?.status === 'safely_terminated');
    A('G1 lease cleared', g?.lease_owner == null);
    A('G1 interview_event retained', (await eventCount(owner, id)) === 1);
    A('G1 interview_question retained', (await questionCount(owner, id)) === 1);
    A('G1 额度净变 0', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
  }

  section('G2 · waiting_user AiGraphRun → safely_terminated');
  {
    const owner = OWN('g2'), id = IID('g2');
    await seed(owner, 3.0);
    await insertInterview(owner, id, 'waiting_user');
    await insertGraphRun(owner, id, 'waiting_user');
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('G2 abandon → abandoned', ab.status === 'abandoned');
    A('G2 AiGraphRun=safely_terminated', (await graphStatus(owner, id))?.status === 'safely_terminated');
  }

  section('G3 · 无 AiGraphRun 空壳 abandon 仍成功（graph noop）');
  {
    const owner = OWN('g3'), id = IID('g3');
    await seed(owner, 2.0);
    await insertInterview(owner, id, 'created');
    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('G3 abandon → abandoned', ab.status === 'abandoned');
    A('G3 released=noop', ab.released === 'noop');
    A('G3 无 graph 行', (await graphStatus(owner, id)) === undefined);
  }

  section('G4 · 已 safely_terminated 再 abandon 幂等保持终态');
  {
    const owner = OWN('g4'), id = IID('g4');
    await seed(owner, 4.0);
    await insertInterview(owner, id, 'active');
    await insertGraphRun(owner, id, 'active');
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('G4 first → safely_terminated', (await graphStatus(owner, id))?.status === 'safely_terminated');
    const again = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('G4 second → already_abandoned', again.status === 'already_abandoned');
    A('G4 still safely_terminated', (await graphStatus(owner, id))?.status === 'safely_terminated');
  }

  section('G5 · 已在 safe_terminating 的 run → abandon 推进到 safely_terminated');
  {
    const owner = OWN('g5'), id = IID('g5');
    await seed(owner, 3.0);
    await insertInterview(owner, id, 'active');
    await asPrincipal(pool, owner, (c) => c.query(
      `INSERT INTO ai_graph_run(graph_name,thread_id,owner_user_id,status,version)
         VALUES ($1,$2,$3,'safe_terminating',1)`,
      [GRAPH, id, owner],
    ));
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('G5 → safely_terminated', (await graphStatus(owner, id))?.status === 'safely_terminated');
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-018 GRAPH safely_terminated asserts passed (GAP-UC018-GRAPH only; ≠ covered; matrix partial)'
    : `✗ ${fail} UC-E2E-018 GRAPH asserts failed`}`);
  console.log('CLOSED_GAP_UC018_GRAPH: abandonInterviewAndRelease → AiGraphRun safely_terminated + 业务事实保全；dedicated uc018:graph:prove');
  console.log('PIN   matrix stays partial · ≠ UC-E2E-018 covered');
  console.log('PIN   GAP-UC018-TTL CLOSED via uc018:ttl:prove；UI+sole-stack still OPEN → matrix partial / sole-stack still OPEN');
  console.log('PIN   haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false');
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
