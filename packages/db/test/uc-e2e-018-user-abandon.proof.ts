/**
 * UC-E2E-018 focused integration prove (eval-first · packages/db).
 *
 * Asserts user-abandon interview → abandoned + consumption released + resume
 * rejected + not in "in-progress" set — NO MODEL_API_KEY, NO HTTP/UI e2e.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-018 covered
 *
 *   pnpm uc018:abandon:prove          (via run-e2e-isolated)
 *   pnpm -C packages/db prove:uc018-abandon   (raw; needs isolated DATABASE_URL)
 *
 * Matrix may rise to **partial** only when this file's asserts run green.
 * Do NOT claim covered: HTTP mouth prove is separate (uc018:abandon:http:prove); full.e2e / AiGraphRun safely_terminated / TTL still gap (waiting_user CAS closed this slice).
 *
 * Cite: e2e-scenarios.md UC-E2E-018 A1/A2/A3 · matrix row UC-E2E-018
 */
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, abandonInterviewAndRelease, availableUnits,
  completeInterviewAndConfirm,
} from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `uc018-${k}-${S}`;
const IID = (k: string) => `iv-uc018-${k}-${S}`;

async function seed(owner: string, units = 5.0) {
  await pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')",
    [owner, units],
  );
}

async function consStatus(owner: string, key: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, key],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

async function ivStatus(owner: string, id: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2',
    [id, owner],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

/** Mirrors create()/list "in progress" filter used by InterviewService. */
async function inProgressIds(owner: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    "SELECT id FROM interview WHERE owner_user_id=$1 AND status NOT IN ('completed','abandoned','failed') ORDER BY id",
    [owner],
  )).then((r) => r.rows.map((row) => row.id as string));
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('UC-E2E-018 user-abandon prove · releaseEvidence=false · Not HA');
  console.log('NOTE: 本绿≠全链路 E2E covered；integration assert only；≠ matrix covered');
  console.log('NOTE: fixture=pgvector via isolated → green-risk / R5；≠ sole-stack migrated');

  // ── A1: active + reserved → abandon → abandoned + released + 额度净变 0 ──
  section('A1 · active 预留后放弃：abandoned + released + 额度净变 0');
  {
    const owner = OWN('a1'), id = IID('a1');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
      [id, owner],
    );
    const r1 = await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    A('A1 reserve → reserved', r1.status === 'reserved');
    A('A1 额度扣 1.0（5→4）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);

    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A1 abandon → abandoned', ab.status === 'abandoned');
    A('A1 released=released', ab.released === 'released');
    A('A1 interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('A1 consumption=released', (await consStatus(owner, id)) === 'released');
    A('A1 额度全回补（4→5，净变 0）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
  }

  // ── A1-shell: created 空壳未预留也可放弃（noop release）──
  section('A1-shell · created 无预留空壳放弃 → abandoned + released=noop');
  {
    const owner = OWN('shell'), id = IID('shell');
    await seed(owner, 3.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')",
      [id, owner],
    );
    const before = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A1-shell → abandoned', ab.status === 'abandoned');
    A('A1-shell released=noop', ab.released === 'noop');
    A('A1-shell interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('A1-shell 额度不变', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === before);
  }

  // ── A2: abandoned 后不可 resume / 不可 complete 复活 ──
  section('A2 · abandoned 终态：二次 abandon 幂等；complete 冲突；不可复活');
  {
    const owner = OWN('a2'), id = IID('a2');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
      [id, owner],
    );
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A2 setup interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('A2 setup consumption=released', (await consStatus(owner, id)) === 'released');

    const again = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A2 二次 abandon → already_abandoned', again.status === 'already_abandoned');
    A('A2 二次 released=noop（不双退）', again.released === 'noop');
    A('A2 额度仍满（净变 0，不二次回补）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);

    let completeConflict = false;
    let completeCode = '';
    try {
      await asPrincipal(pool, owner, (c) => completeInterviewAndConfirm(c, owner, id));
    } catch (e: any) {
      completeCode = String(e?.code ?? '');
      // released 账本 → interview_settlement_failed / already_released；或 terminal conflict
      completeConflict = completeCode === 'interview_settlement_failed'
        || completeCode === 'interview_terminal_conflict'
        || (e?.reason === 'already_released');
    }
    A('A2 complete 对 abandoned 拒（settlement_failed/terminal；不可复活）', completeConflict);
    A('A2 complete 错误码可解释', completeCode === 'interview_settlement_failed' || completeCode === 'interview_terminal_conflict');
    A('A2 仍为 abandoned（未复活）', (await ivStatus(owner, id)) === 'abandoned');
  }

  // ── A3: abandoned 不出现在进行中集合 ──
  section('A3 · abandoned 不在 in-progress（create 复用 / 进行中列表口径）');
  {
    const owner = OWN('a3'), live = IID('live'), dead = IID('dead');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created'),($3,$2,'active')",
      [live, owner, dead],
    );
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, dead, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, dead));

    const open = await inProgressIds(owner);
    A('A3 live created 仍在进行中', open.includes(live));
    A('A3 abandoned 不在进行中', !open.includes(dead));
    A('A3 abandoned 行仍可读为终态', (await ivStatus(owner, dead)) === 'abandoned');
  }

  // ── A-created-reserved: created+reserved 放弃路径（begin 后、worker 置 active 前）──
  section('A-created-reserved · created+reserved 放弃（begin 后 worker 前）');
  {
    const owner = OWN('cr'), id = IID('cr');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')",
      [id, owner],
    );
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A-created-reserved → abandoned', ab.status === 'abandoned');
    A('A-created-reserved released', ab.released === 'released');
    A('A-created-reserved 额度净变 0', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
  }

  // ── A-waiting-user: waiting_user+reserved 放弃（题间等待用户作答 · UC-E2E-018 主流程）──
  section('A-waiting-user · waiting_user+reserved 放弃 → abandoned + released');
  {
    const owner = OWN('wu'), id = IID('wu');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')",
      [id, owner],
    );
    const r1 = await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    A('A-waiting-user reserve → reserved', r1.status === 'reserved');
    A('A-waiting-user 额度扣 1.0（5→4）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);

    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A-waiting-user abandon → abandoned', ab.status === 'abandoned');
    A('A-waiting-user released=released', ab.released === 'released');
    A('A-waiting-user interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('A-waiting-user consumption=released', (await consStatus(owner, id)) === 'released');
    A('A-waiting-user 额度全回补（4→5，净变 0）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);

    const open = await inProgressIds(owner);
    A('A-waiting-user abandoned ∉ in-progress', !open.includes(id));
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-018 A1–A3 + A-waiting-user integration asserts passed (partial ladder only; ≠ covered; ≠ e2e:isolated; ≠ HTTP abandon)'
    : `✗ ${fail} UC-E2E-018 asserts failed`}`);
  console.log('CLOSED: GAP-UC018-WAITING-USER — abandon CAS now created|active|waiting_user + A-waiting-user prove');
  console.log('CLOSED_GAP_UC018_FULL_E2E: see pnpm uc018:abandon:full-e2e:prove / e2e/full.e2e.ts；AiGraphRun safely_terminated + TTL + UI + sole-stack still gap → matrix partial ≠ covered');
  console.log('PIN   GAP-UC018-GRAPH: abandonInterviewAndRelease 不碰 AiGraphRun → safely_terminated 未钉');
  console.log('PIN   GAP-UC018-TTL: TTL sweeper→abandoned 属 commerce-reconcile 旁证 ≠ 本 prove');
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
