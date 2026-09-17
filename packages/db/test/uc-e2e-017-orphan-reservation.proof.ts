/**
 * UC-E2E-017 focused integration prove (eval-first · packages/db).
 *
 * Asserts begin-fail → reserved → released (orphan reservation) using existing
 * commerce APIs — NO MODEL_API_KEY, NO HTTP e2e:isolated scenario.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-017 covered
 *
 *   pnpm uc017:orphan:prove          (via run-e2e-isolated)
 *   pnpm -C packages/db prove:uc017-orphan   (raw; needs isolated DATABASE_URL)
 *
 * Matrix may rise to **partial** only when this file's asserts run green.
 * Do NOT claim covered until e2e:isolated includes an HTTP begin-fail inject.
 */
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, releaseConsumption, availableUnits, reconcile,
} from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `uc017-${k}-${S}`;
const KEY = (k: string) => `iv-uc017-${k}-${S}`;

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

async function consCount(owner: string, key: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, key],
  )).then((r) => r.rows[0].n as number);
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('UC-E2E-017 orphan-reservation prove · releaseEvidence=false · Not HA');
  console.log('NOTE: 本绿≠全链路 E2E covered；integration assert only；≠ matrix covered');

  // ── O1 + O2 sync: reserve succeeds, then begin-fail compensation releases ──
  section('O1/O2-sync · begin-fail 补偿：reserve → 可观测 reserved → release → released + 额度回补');
  {
    const owner = OWN('sync'), key = KEY('sync');
    await seed(owner, 5.0);
    // Interview shell may exist before begin; UC-017 fault is post-reserve failure
    // (enqueue/SSE/crash). Model the sync compensation path quiz/diagnosis use:
    // releaseConsumption after a detected begin-side failure.
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')",
      [key, owner],
    );
    const r1 = await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, key, 'mock_interview', 1.0));
    A('O1 reserve → reserved', r1.status === 'reserved');
    A('O1 consumption 可观测 reserved', (await consStatus(owner, key)) === 'reserved');
    A('O1 额度 CAS 扣 1.0（5→4）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);

    // Simulate begin-fail after reserve committed (compensation in a later TX):
    // e.g. post-commit SSE/setup failure path that must release, not leave orphan.
    const rel = await asPrincipal(pool, owner, (c) => releaseConsumption(c, owner, key));
    A('O2-sync release → released', rel.status === 'released');
    A('O2-sync consumption 终态 released', (await consStatus(owner, key)) === 'released');
    A('O2-sync 额度全回补（4→5，净变 0）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
  }

  // ── O2 sweeper: orphan reserved with expired lease → reconcile releases ──
  section('O2-sweeper · 无同步补偿的孤儿 reserved（租约过期）→ reconcile → released');
  {
    const owner = OWN('sweep'), key = KEY('sweep');
    await seed(owner, 5.0);
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, key, 'mock_interview', 1.0));
    A('O2-sweeper 预置 reserved', (await consStatus(owner, key)) === 'reserved');
    await pool.query(
      "UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2",
      [owner, key],
    );
    const before = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    const rec = await asPrincipal(pool, owner, (c) => reconcile(c, owner));
    A('O2-sweeper staleReleased≥1', rec.staleReleased >= 1);
    A('O2-sweeper consumption → released', (await consStatus(owner, key)) === 'released');
    A('O2-sweeper 额度回补 +1.0', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === before + 1.0);
  }

  // ── O3: same idempotency key does not double-reserve ──
  section('O3 · 同键重试不产生第二条 reserved（不双扣）');
  {
    const owner = OWN('idem'), key = KEY('idem');
    await seed(owner, 5.0);
    const a = await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, key, 'mock_interview', 1.0));
    const b = await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, key, 'mock_interview', 1.0));
    A('O3 首次 reserved', a.status === 'reserved');
    A('O3 同键二次 → duplicate', b.status === 'duplicate');
    A('O3 恰 1 行 consumption', (await consCount(owner, key)) === 1);
    A('O3 额度仅扣一次（5→4）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);
    // Cleanup so pool end is tidy
    await asPrincipal(pool, owner, (c) => releaseConsumption(c, owner, key));
  }

  // ── O4: cross-principal cannot see / release others' reservation ──
  section('O4 · 错主体看不到 / 动不了他人预占（404/0 行语义）');
  {
    const owner = OWN('own'), other = OWN('oth'), key = KEY('own');
    await seed(owner, 5.0);
    await seed(other, 5.0);
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, key, 'mock_interview', 1.0));
    const seen = await asPrincipal(pool, other, (c) => c.query(
      'SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, key],
    ));
    A('O4 他主体 RLS 下见 0 行', seen.rows[0].n === 0);
    const relOther = await asPrincipal(pool, other, (c) =>
      releaseConsumption(c, other, key));
    A('O4 他主体 release → not_found（不误放）', relOther.status === 'error' && (relOther as { reason?: string }).reason === 'not_found');
    A('O4 原预占仍 reserved', (await consStatus(owner, key)) === 'reserved');
    await asPrincipal(pool, owner, (c) => releaseConsumption(c, owner, key));
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-017 O1–O4 integration asserts passed (partial ladder only; ≠ covered; ≠ e2e:isolated)'
    : `✗ ${fail} UC-E2E-017 asserts failed`}`);
  console.log('BLOCKED_FOR_FULL_E2E: HTTP begin-fail inject / SSE-after-commit orphan not in e2e:isolated yet');
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
