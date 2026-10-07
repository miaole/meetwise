/**
 * UC-E2E-017 LOAD_worker focused prove — NHP-017-LOAD-w-01（大量孤儿预占回收 · bulk/concurrent sweep）.
 *
 * Knife: ai-docs/delivery/harness/gap-uc017-load-sweep-nhp.md · gap id GAP-UC017-LOAD-01.
 * Contract: PC + L1(回收完成) + L2(无漏扣·净变0) + L3(并发互斥·无双放) + L4(幂等重跑零增量)
 *           + L5(收据·≠SLO≠容量≠HA) + NEG 硬闸 N1(无双放/无双退/无重复入账) N2(漏扫漏补=EXIT1)
 *           N3(新鲜对照组不得被扫) N4(already-released 重入 0 行)。
 *
 * 造数诚实（harness :63 · reviews C-2/C-3）：
 *   - 全部消费生命周期经真产品路径 reserveEntitlement / confirmConsumption / releaseConsumption /
 *     renewReservationLease（Ban 裸 INSERT 绕 CAS/bucket 账面）。
 *   - 孤儿化 = 仅对孤儿 consumption 行置 lease_expires_at 时移（O2-sweeper 先例同款；账面字段零触碰，
 *     sweep 释放路径被真实行使）。新鲜对照组租约严格未来，fixture 永不触碰其 lease。
 *   - 桶 provision（entitlement_bucket INSERT）为夹具，沿 uc-e2e-017-orphan-reservation.proof.ts 先例。
 *   - settled cohort（rag C-1 路由 (a)）：真 reserve→真 confirm（commerce.ts:130 outbox settlement_proposed
 *     唯一生产点）→ C 并发 reconcile 行使 settleOutbox SKIP LOCKED 争用 → ledger exactly-once 断言。
 *     prove 全程 outbox 有真实行——settlement 半边非空壳绿。
 *
 * Isolation: 三层壳 pnpm uc017:nhp-load:prove → run-e2e-isolated.mjs → prove:uc017-nhp-load；
 *            assertIsolatedTestTarget 强制隔离 nonce。零 live 模型 · 零 MODEL_API_KEY。
 *
 * EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ UC-E2E-017 行升格 ≠ PERF_api/PERF_web 面填补
 *        ≠ 生产容量 ≠ SLO ≠ HA。releaseEvidence=false · Not HA · coveredCount=8 不变。
 *
 *   pnpm uc017:nhp-load:prove                (via run-e2e-isolated)
 *   pnpm -C packages/db prove:uc017-nhp-load (raw; needs isolated env + container nonce)
 *
 * Frozen params（receipt 同步登记）：N=20 owners × M=5 orphans(=100) · C=10 concurrent reconcile
 * workers · S=10 settled cohort · F=20 fresh control(1/owner) · orphan/fresh/settled units=1.00 ·
 * bucket TTL=now()+300 days（≥ run 时长+余量 · L2 净变 0 前提 C-4）。
 */
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, confirmConsumption, releaseConsumption, renewReservationLease,
  availableUnits, reconcile,
} from '../src/index.ts';

// ── frozen params（harness :63 登记 · 冻结入 receipt）─────────────────────────────
const N_OWNERS = 20;      // bulk cohort owners
const M_ORPHANS = 5;      // orphans per owner → 100 orphans
const C_WORKERS = 10;     // concurrent reconcile workers
const S_SETTLED = 10;     // settled-cohort consumptions（真 reserve→confirm 投 outbox）
const F_FRESH = 1;        // fresh control per owner（N_F = N_OWNERS × F_FRESH = 20）
const ORPHAN_UNITS = 1.0;
const BUCKET_TOTAL = M_ORPHANS * ORPHAN_UNITS + F_FRESH * ORPHAN_UNITS; // 6.00 exact
const SETTLE_BUCKET_TOTAL = S_SETTLED * ORPHAN_UNITS;                    // 10.00 exact
const LEASE_HEARTBEAT_SECONDS = 1800;
const MAX_DRAIN_WAVES = 10;
const BUCKET_TTL_DAYS = 300; // C-4：TTL ≥ run 时长 + 余量，run 期无桶 expires_at 边界穿越

const ORPHAN_TOTAL = N_OWNERS * M_ORPHANS; // 100
const FRESH_TOTAL = N_OWNERS * F_FRESH;    // 20

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `uc017load-${k}-${S}`;
const KEY = (k: string) => `iv-uc017load-${k}-${S}`;
const n2 = (x: unknown) => Number(x);
const eq = (a: number, b: number) => Math.round(a * 100) === Math.round(b * 100);

const RECEIPT_DIR = fileURLToPath(new URL('../../../.tmp/uc017-perf-load-receipts/', import.meta.url));

interface WorkerCall { owner: string; released: number; settled: number; sweptIds: string[]; ms: number; error?: string }
interface WorkerRound { round: number; calls: WorkerCall[]; released: number; settled: number; ms: number }

async function seedBucket(owner: string, total: number) {
  // 夹具 provision（O1–O4 先例同款）；TTL 冻结 300d（C-4：run 期无 expires_at 穿越）。
  await pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now() + ($3 || ' days')::interval)",
    [owner, total, String(BUCKET_TTL_DAYS)],
  );
}

async function expiredReservedCount(): Promise<number> {
  // L1/N2：全库「reserved 且 lease 已过期」残留计数（spec A3 · pool 直连=跨 owner 审计面）。
  const r = await pool.query(
    "SELECT count(*)::int n FROM entitlement_consumption WHERE status='reserved' AND lease_expires_at < now()");
  return r.rows[0].n as number;
}

async function bucketReservedSum(owner: string): Promise<number> {
  const r = await pool.query(
    'SELECT COALESCE(SUM(units_reserved),0) s FROM entitlement_bucket WHERE owner_user_id=$1', [owner]);
  return n2(r.rows[0].s);
}

async function negativeReservedBuckets(): Promise<number> {
  // N1「无双退」计数面：负 units_reserved 行数（== 0）。
  const r = await pool.query('SELECT count(*)::int n FROM entitlement_bucket WHERE units_reserved < 0');
  return r.rows[0].n as number;
}

/** C 个并发 reconcile worker 对同一 owner 集各跑一轮（L3/N1 并发行使面）。 */
async function runConcurrentReconcileWave(round: number, owners: string[]): Promise<WorkerRound> {
  const t0 = process.hrtime.bigint();
  const rounds = await Promise.all(Array.from({ length: C_WORKERS }, async (): Promise<WorkerCall[]> => {
    const calls: WorkerCall[] = [];
    for (const owner of owners) {
      const s0 = process.hrtime.bigint();
      try {
        const rec = await asPrincipal(pool, owner, (c) => reconcile(c, owner));
        calls.push({
          owner, released: rec.staleReleased, settled: rec.settled,
          sweptIds: rec.swept.map((x) => x.consumptionId), ms: Number(process.hrtime.bigint() - s0) / 1e6,
        });
      } catch (e) {
        // L5 error rate 计数；reconcile 抛错 → asPrincipal 整事务回滚（无半程状态），记为 error call。
        calls.push({
          owner, released: -1, settled: -1, sweptIds: [],
          ms: Number(process.hrtime.bigint() - s0) / 1e6, error: (e as Error)?.message ?? String(e),
        });
        console.error(`  worker reconcile error owner=${owner}: ${(e as Error)?.message ?? e}`);
      }
    }
    return calls;
  }));
  const calls = rounds.flat();
  return {
    round,
    calls,
    released: calls.reduce((s, c) => s + (c.released > 0 ? c.released : 0), 0),
    settled: calls.reduce((s, c) => s + (c.settled > 0 ? c.settled : 0), 0),
    ms: Number(process.hrtime.bigint() - t0) / 1e6,
  };
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('UC-E2E-017 NHP-LOAD prove · NHP-017-LOAD-w-01 · releaseEvidence=false · Not HA');
  console.log(`frozen params: N=${N_OWNERS} M=${M_ORPHANS}(=${ORPHAN_TOTAL}) C=${C_WORKERS} S=${S_SETTLED} F=${FRESH_TOTAL} · TTL=${BUCKET_TTL_DAYS}d`);
  console.log('Non-claims: ≠ covered ≠ suite green ≠ PERF_api/PERF_web ≠ 容量 ≠ SLO ≠ HA · coveredCount=8 不变');

  const metrics: Record<string, unknown> = {
    caseId: 'NHP-017-LOAD-w-01',
    gapId: 'GAP-UC017-LOAD-01',
    gitSha: process.env.MW_GIT_SHA ?? 'unknown',
    frozenParams: {
      N: N_OWNERS, M: M_ORPHANS, orphanTotal: ORPHAN_TOTAL, C: C_WORKERS,
      S: S_SETTLED, F: FRESH_TOTAL, orphanUnits: ORPHAN_UNITS,
      bucketTtlDays: BUCKET_TTL_DAYS, leaseHeartbeatSeconds: LEASE_HEARTBEAT_SECONDS,
    },
    rounds: [] as WorkerRound[],
    idempotencyRounds: [] as WorkerRound[],
  };
  const roundsLog = metrics.rounds as WorkerRound[];
  const idemLog = metrics.idempotencyRounds as WorkerRound[];

  // ══ PC · positive control（镜像 O2 · 对照缺失=Ban 假绿 → bulk 前置闸）═════════════
  section('PC · positive control：单 owner 单孤儿 单 sweep（镜像 O2）');
  const pcOwner = OWN('pc'), pcKey = KEY('pc');
  await seedBucket(pcOwner, 5.0);
  const pcRes = await asPrincipal(pool, pcOwner, (c) => reserveEntitlement(c, pcOwner, pcKey, 'mock_interview', ORPHAN_UNITS));
  A('PC reserve → reserved（真路径）', pcRes.status === 'reserved');
  const pcAvailHeld = await asPrincipal(pool, pcOwner, (c) => availableUnits(c, pcOwner));
  A('PC 预占后 avail=4.0', eq(pcAvailHeld, 4.0));
  await pool.query(
    "UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2",
    [pcOwner, pcKey]);
  const pcBefore = await asPrincipal(pool, pcOwner, (c) => availableUnits(c, pcOwner));
  const pcRec = await asPrincipal(pool, pcOwner, (c) => reconcile(c, pcOwner));
  const pcAfter = await asPrincipal(pool, pcOwner, (c) => availableUnits(c, pcOwner));
  A('PC 单 sweep staleReleased === 1', pcRec.staleReleased === 1);
  A('PC sweep 回补恰等孤儿 units：avail 4.0 → 5.0（+1.0）', eq(pcBefore, 4.0) && eq(pcAfter, pcBefore + ORPHAN_UNITS));
  A('PC 孤儿生命周期净变 0（A1）：post === 预占前基线 5.0', eq(pcAfter, 5.0));
  A('PC 消费终态 released', (await pool.query(
    "SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2",
    [pcOwner, pcKey])).rows[0].status === 'released');
  const pcGate = fail === 0;
  A('PC gate 全绿（bulk 前置闸）', pcGate);

  // ══ bulk cohorts · 真路径造数 ═══════════════════════════════════════════════════
  section(`造数 · N=${N_OWNERS} owners × (M=${M_ORPHANS} orphans + 1 fresh) · 全经真 reserveEntitlement`);
  const owners: string[] = [];
  const orphanIds: string[] = [];
  const freshIds: string[] = [];
  const freshKeysByOwner = new Map<string, string>();
  let dataErrors = 0;
  for (let i = 0; i < N_OWNERS; i++) {
    const owner = OWN(`o${i}`);
    owners.push(owner);
    await seedBucket(owner, BUCKET_TOTAL);
    for (let m = 0; m < M_ORPHANS; m++) {
      const r = await asPrincipal(pool, owner, (c) =>
        reserveEntitlement(c, owner, KEY(`o${i}-orph${m}`), 'mock_interview', ORPHAN_UNITS));
      if (r.status !== 'reserved') dataErrors++;
      else orphanIds.push(r.consumptionId);
    }
    // N3 对照组同规造数（e2e C-3：Ban 双标）——真 reserve + 真 renewReservationLease 心跳维活。
    const freshKey = KEY(`o${i}-fresh`);
    const f = await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, freshKey, 'mock_interview', ORPHAN_UNITS));
    if (f.status !== 'reserved') dataErrors++;
    else {
      freshIds.push(f.consumptionId);
      freshKeysByOwner.set(owner, freshKey);
      const renewed = await asPrincipal(pool, owner, (c) =>
        renewReservationLease(c, owner, freshKey, LEASE_HEARTBEAT_SECONDS));
      if (!renewed) dataErrors++;
    }
  }
  A(`造数 0 错误（${ORPHAN_TOTAL} orphans + ${FRESH_TOTAL} fresh 全 reserved）`,
    dataErrors === 0 && orphanIds.length === ORPHAN_TOTAL && freshIds.length === FRESH_TOTAL);
  let allZeroAvail = true;
  for (const owner of owners) {
    if (!eq(await asPrincipal(pool, owner, (c) => availableUnits(c, owner)), 0)) { allZeroAvail = false; break; }
  }
  A('造数后 avail = units_total - M - 1 = 0（逐 owner 全量）', allZeroAvail);
  let allReservedSix = true;
  for (const owner of owners) {
    if (!eq(await bucketReservedSum(owner), BUCKET_TOTAL)) { allReservedSix = false; break; }
  }
  A('造数后 bucket units_reserved = 6.0（逐 owner 全量）', allReservedSix);

  // 孤儿化：仅孤儿行 lease 时移（fixture 永不触碰 fresh 行）。
  await pool.query(
    'UPDATE entitlement_consumption SET lease_expires_at = now() - interval \'1 minute\' WHERE id = ANY($1::uuid[])',
    [orphanIds]);
  A(`孤儿化后「reserved ∧ lease 过期」计数 === ${ORPHAN_TOTAL}`, (await expiredReservedCount()) === ORPHAN_TOTAL);
  A('fresh 行 lease 严格未来（fixture 零触碰）', (await pool.query(
    'SELECT count(*)::int n FROM entitlement_consumption WHERE id = ANY($1::uuid[]) AND lease_expires_at > now()',
    [freshIds])).rows[0].n === FRESH_TOTAL);

  // ══ settled cohort（rag C-1 路由 (a)）· 真 reserve→confirm 投 outbox ═════════════
  section(`settled cohort · S=${S_SETTLED} · 真落账路径投 settlement_proposed（commerce.ts:130）`);
  const settleOwner = OWN('settle');
  await seedBucket(settleOwner, SETTLE_BUCKET_TOTAL);
  const settledIds: string[] = [];
  for (let i = 0; i < S_SETTLED; i++) {
    const key = KEY(`settle${i}`);
    const r = await asPrincipal(pool, settleOwner, (c) =>
      reserveEntitlement(c, settleOwner, key, 'mock_interview', ORPHAN_UNITS));
    if (r.status !== 'reserved') { dataErrors++; continue; }
    const conf = await asPrincipal(pool, settleOwner, (c) =>
      confirmConsumption(c, settleOwner, key, 1));
    if (conf.status !== 'confirmed') dataErrors++;
    else settledIds.push(r.consumptionId);
  }
  const outboxPendingBefore = (await pool.query(
    "SELECT count(*)::int n FROM commerce_outbox WHERE owner_user_id=$1 AND status='pending'",
    [settleOwner])).rows[0].n as number;
  A(`settled cohort 真路径 0 错误 · outbox pending === ${S_SETTLED}`,
    dataErrors === 0 && settledIds.length === S_SETTLED && outboxPendingBefore === S_SETTLED);
  const settleBucket = (await pool.query(
    'SELECT COALESCE(SUM(units_consumed),0) c, COALESCE(SUM(units_reserved),0) r FROM entitlement_bucket WHERE owner_user_id=$1',
    [settleOwner])).rows[0];
  A('settle owner units_consumed === 10.0 ∧ units_reserved === 0',
    eq(n2(settleBucket.c), SETTLE_BUCKET_TOTAL) && eq(n2(settleBucket.r), 0));
  const ledgerRowsBefore = (await pool.query(
    'SELECT count(*)::int n FROM settlement_ledger WHERE owner_user_id=$1', [settleOwner])).rows[0].n as number;
  A('settle 前 settlement_ledger 行数 === 0', ledgerRowsBefore === 0);

  // ══ Wave 1 · drain 循环至稳态（L1/L3/N1/N2 + L5）═════════════════════════════════
  section(`Wave 1 · C=${C_WORKERS} 并发 reconcile · drain 至稳态`);
  const allOwners = [...owners, settleOwner];
  const allSweptIds: string[] = [];
  let totalSettled = 0;
  let errorCalls = 0;
  let totalCalls = 0;
  const availPreSweep: Record<string, number> = {};
  for (const owner of allOwners) {
    availPreSweep[owner] = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
  }
  const drainT0 = process.hrtime.bigint();
  let wave = 0;
  let waveReleased = -1;
  while (wave < MAX_DRAIN_WAVES) {
    wave++;
    const wr = await runConcurrentReconcileWave(wave, allOwners);
    roundsLog.push(wr);
    waveReleased = wr.released;
    errorCalls += wr.calls.filter((c) => c.released < 0).length;
    totalCalls += wr.calls.length;
    totalSettled += wr.settled;
    for (const c of wr.calls) allSweptIds.push(...c.sweptIds);
    const backlog = await expiredReservedCount();
    console.log(`  wave ${wave}: released=${wr.released} settled=${wr.settled} backlog=${backlog} wall=${wr.ms.toFixed(0)}ms`);
    if (waveReleased === 0) break;
  }
  const drainWallMs = Number(process.hrtime.bigint() - drainT0) / 1e6;
  const distinctSwept = new Set(allSweptIds);
  const throughputPerSec = drainWallMs > 0 ? ORPHAN_TOTAL / (drainWallMs / 1000) : 0;
  const sweptSetEqualsOrphans = (() => {
    const orphan = new Set(orphanIds);
    if (distinctSwept.size !== orphan.size) return false;
    for (const id of distinctSwept) if (!orphan.has(id)) return false;
    return true;
  })();

  // L1 · 回收完成（spec A3）
  A(`L1 drain 稳态达成（第 ${wave} 轮 released === 0）`, waveReleased === 0 && wave <= MAX_DRAIN_WAVES);
  A('L1 稳态后全库「reserved ∧ lease 过期」残留 === 0', (await expiredReservedCount()) === 0);
  A(`L1 逐孤儿终态：${ORPHAN_TOTAL}/${ORPHAN_TOTAL} released`, (await pool.query(
    "SELECT count(*)::int n FROM entitlement_consumption WHERE id = ANY($1::uuid[]) AND status='released'",
    [orphanIds])).rows[0].n === ORPHAN_TOTAL);

  // L3 · 并发互斥（释放集互斥 · 恰一次 released）
  A(`L3 Σworker reported released === ${ORPHAN_TOTAL}`, allSweptIds.length === ORPHAN_TOTAL);
  A(`L3 释放集互斥：distinct swept === ${ORPHAN_TOTAL}（每 consumption 恰一次）`, distinctSwept.size === ORPHAN_TOTAL);
  A('L3 释放集 == 孤儿集（set 等值 · 无误扫放大）', sweptSetEqualsOrphans);

  // L2 · 无漏扣（bucket 回补恰等 · 净变 0 · 无负值）——C-4 前提：TTL=300d 无 expires_at 穿越
  let l2AvailExact = true;
  for (const owner of owners) {
    // pre === units_total - M - 1 = 0（造数断言已锚）→ post 必须 === pre + M === units_total - 1 = 5.0
    const post = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    if (!eq(post, BUCKET_TOTAL - ORPHAN_UNITS) || !eq(availPreSweep[owner], 0)) { l2AvailExact = false; break; }
  }
  A('L2 sweep 窗口 avail 回补恰等孤儿 units（逐 owner：0 → 5.0 = total−1 fresh holdout）', l2AvailExact);
  let l2ReservedExact = true;
  for (const owner of owners) {
    if (!eq(await bucketReservedSum(owner), ORPHAN_UNITS)) { l2ReservedExact = false; break; }
  }
  A('L2 bucket 回补恰等 orphan allocations：units_reserved 6.0 → 1.0（逐 owner 全量）', l2ReservedExact);
  A('L2 全库无负 units_reserved（行数 === 0）', (await negativeReservedBuckets()) === 0);

  // N1 · 并发窗口审计（无双放/无双退/无重复入账 · settlement 半边真行使）
  A('N1 无双放：distinct swept === 孤儿数 ∧ set 等值（同 L3）', distinctSwept.size === ORPHAN_TOTAL && sweptSetEqualsOrphans);
  const bulkReservedLeft = n2((await pool.query(
    'SELECT COALESCE(SUM(units_reserved),0) s FROM entitlement_bucket WHERE owner_user_id = ANY($1::text[])',
    [owners])).rows[0].s);
  A(`N1 无双退：负 units_reserved 行 === 0 ∧ Σ余留 reserved === fresh holdout ${FRESH_TOTAL}.0`,
    (await negativeReservedBuckets()) === 0 && eq(bulkReservedLeft, FRESH_TOTAL * ORPHAN_UNITS));
  const ledgerAfterW1 = (await pool.query(
    'SELECT count(*)::int n, count(DISTINCT consumption_id)::int d, COALESCE(SUM(units_settled),0) u FROM settlement_ledger WHERE owner_user_id=$1',
    [settleOwner])).rows[0];
  A(`N1 无重复入账：ledger 行 === distinct consumption_id === ${S_SETTLED}`,
    ledgerAfterW1.n === S_SETTLED && ledgerAfterW1.d === S_SETTLED && eq(n2(ledgerAfterW1.u), SETTLE_BUCKET_TOTAL));
  A(`N1 Σworker settled === ${S_SETTLED}（SKIP LOCKED 多消费者恰一次）`, totalSettled === S_SETTLED);
  const outboxAfterW1 = (await pool.query(
    "SELECT count(*) FILTER (WHERE status='pending')::int p, count(*) FILTER (WHERE status='relayed')::int r FROM commerce_outbox WHERE owner_user_id=$1",
    [settleOwner])).rows[0];
  A(`N1 outbox 全 relayed：pending === 0 ∧ relayed === ${S_SETTLED}`, outboxAfterW1.p === 0 && outboxAfterW1.r === S_SETTLED);
  const ledgerIdRows = (await pool.query(
    'SELECT consumption_id FROM settlement_ledger WHERE owner_user_id=$1', [settleOwner])).rows.map((r) => String(r.consumption_id));
  const ledgerIdSet = new Set(ledgerIdRows);
  const settledWant = new Set(settledIds.map(String));
  let ledgerSetEquals = ledgerIdSet.size === settledWant.size;
  if (ledgerSetEquals) for (const id of ledgerIdSet) if (!settledWant.has(id)) { ledgerSetEquals = false; break; }
  A('N1 ledger 集 == settled cohort 集（set 等值）', ledgerSetEquals);

  // N2 · 漏扫漏补 = EXIT1（逐孤儿对账 · bucket 回补不齐）
  A('N2 漏扫 === 0：残留 reserved∧过期 === 0 ∧ 逐孤儿 released 全量', (await expiredReservedCount()) === 0);
  const unevenBuckets = (await pool.query(
    `SELECT owner_user_id FROM entitlement_bucket WHERE owner_user_id = ANY($1::text[])
      GROUP BY owner_user_id HAVING COALESCE(SUM(units_reserved),0) <> $2`,
    [owners, ORPHAN_UNITS])).rows.length;
  A('N2 回补不齐 === 0：任一 owner bucket units_reserved ≠ 1.0 的 owner 数 === 0', unevenBuckets === 0);

  // N3 · 误扫活会话 = EXIT1（新鲜对照组零被扫）
  A(`N3 fresh ${FRESH_TOTAL}/${FRESH_TOTAL} 仍 reserved（逐条计数）`, (await pool.query(
    "SELECT count(*)::int n FROM entitlement_consumption WHERE id = ANY($1::uuid[]) AND status='reserved'",
    [freshIds])).rows[0].n === FRESH_TOTAL);
  A('N3 fresh 中 released 行数 === 0（DB 面 · 零误扫）', (await pool.query(
    "SELECT count(*)::int n FROM entitlement_consumption WHERE id = ANY($1::uuid[]) AND status='released'",
    [freshIds])).rows[0].n === 0);
  A('N3 fresh ∩ swept 集 === 0（worker 面 · 零误扫）', freshIds.every((id) => !distinctSwept.has(id)));
  A('N3 fresh lease 严格未来（真 renewReservationLease 心跳维活后）', (await pool.query(
    'SELECT count(*)::int n FROM entitlement_consumption WHERE id = ANY($1::uuid[]) AND lease_expires_at > now()',
    [freshIds])).rows[0].n === FRESH_TOTAL);
  A('N3 Ban 全扫：swept 集 == 孤儿集（同 L3 set 等值）', sweptSetEqualsOrphans);

  // ══ Wave 2 · L4 幂等 + N4 重入 0 行 ═════════════════════════════════════════════
  section(`Wave 2 · 稳态后二次 C=${C_WORKERS} 并发 reconcile ×2（worker 侧幂等 · e2e C-5 措辞）`);
  const snapLedgerRows = ledgerAfterW1.n as number;
  const snapOutboxRelayed = outboxAfterW1.r as number;
  const snapReserved: Record<string, number> = {};
  for (const owner of allOwners) snapReserved[owner] = await bucketReservedSum(owner);

  let idemReleased = -1, idemSettled = -1;
  for (let w = 0; w < 2; w++) {
    const wr = await runConcurrentReconcileWave(100 + w, allOwners);
    idemLog.push(wr);
    if (w === 0) { idemReleased = wr.released; idemSettled = wr.settled; }
    errorCalls += wr.calls.filter((c) => c.released < 0).length;
    totalCalls += wr.calls.length;
  }
  const idemLedgerRows = (await pool.query(
    'SELECT count(*)::int n FROM settlement_ledger WHERE owner_user_id=$1', [settleOwner])).rows[0].n as number;
  const idemOutbox = (await pool.query(
    "SELECT count(*) FILTER (WHERE status='pending')::int p, count(*) FILTER (WHERE status='relayed')::int r FROM commerce_outbox WHERE owner_user_id=$1",
    [settleOwner])).rows[0];

  // L4 · 幂等重跑零增量
  A('L4 二次 reconcile released 增量 === 0', idemReleased === 0);
  A('L4 二次 reconcile settled 增量 === 0（worker 侧幂等）', idemSettled === 0);
  A(`L4 settlement_ledger 无新增（仍 === ${S_SETTLED}）`, idemLedgerRows === snapLedgerRows);
  A('L4 outbox 无新增：pending === 0 ∧ relayed 不变', idemOutbox.p === 0 && idemOutbox.r === snapOutboxRelayed);

  // N4 · already-released 重入 → 0 行（逐 worker 逐 owner 全 0 · 含第二轮并发重入）
  A(`N4 重入 0 行：Wave2 全部 ${C_WORKERS * allOwners.length * 2} 次 reconcile 逐 call staleReleased===0 ∧ settled===0`,
    idemLog.length === 2 && idemLog.every((wr) => wr.calls.every((c) => c.released === 0 && c.settled === 0)));
  let idemBooksUnchanged = true;
  for (const owner of allOwners) {
    if (!eq(await bucketReservedSum(owner), snapReserved[owner])) { idemBooksUnchanged = false; break; }
  }
  A('N4 账面零漂移：bucket units_reserved 与 Wave1 后逐 owner 相等', idemBooksUnchanged);
  A('N4 稳态残留仍 === 0', (await expiredReservedCount()) === 0);

  // ══ L5 · 收据（吞吐 · wall time · backlog 形状 · error rate）≠ SLO ≠ 容量 ≠ HA ══
  section('L5 · 收据落盘');
  metrics.l5 = {
    drainWaves: wave,
    drainWallMs: Number(drainWallMs.toFixed(3)),
    throughputOrphansPerSec: Number(throughputPerSec.toFixed(2)),
    backlogShape: roundsLog.map((r) => ({ round: r.round, released: r.released, settled: r.settled })),
    errorCalls, totalCalls,
    errorRate: totalCalls > 0 ? Number((errorCalls / totalCalls).toFixed(6)) : -1,
    note: 'LOAD_worker face only · ≠ 线上 SLO · ≠ 生产容量 · ≠ HA · ≠ PERF_api/PERF_web',
  };
  console.log(`  drain: waves=${wave} wall=${drainWallMs.toFixed(0)}ms throughput=${throughputPerSec.toFixed(1)} orphans/s errors=${errorCalls}/${totalCalls}`);

  // ══ 收尾 · 全 run 额度恢复原值（A1，fresh holdout 显式真路径 release）════════════
  section('收尾 · fresh cohort 真 releaseConsumption → 全 run avail 恢复原值');
  let cleanupErrors = 0;
  for (const owner of owners) {
    const rel = await asPrincipal(pool, owner, (c) => releaseConsumption(c, owner, freshKeysByOwner.get(owner) as string));
    if (rel.status !== 'released' && rel.status !== 'noop') cleanupErrors++;
  }
  let finalAvailExact = cleanupErrors === 0;
  for (const owner of owners) {
    if (!eq(await asPrincipal(pool, owner, (c) => availableUnits(c, owner)), BUCKET_TOTAL)) { finalAvailExact = false; break; }
  }
  A('收尾 0 错误 ∧ 逐 owner avail === units_total（全 run 净变 0 · A1 等值）', finalAvailExact);

  // ══ 收据写盘（.tmp · implementer pre-commit runs · not evidence of record）══════
  try {
    mkdirSync(RECEIPT_DIR, { recursive: true });
    const attemptNo = readdirSync(RECEIPT_DIR).filter((f) => f.endsWith('.json') && f.includes('nhp-load')).length + 1;
    metrics.finishedAt = new Date().toISOString();
    metrics.overall = fail === 0 ? 'PASS' : 'FAIL';
    metrics.failedAsserts = fail;
    const receiptPath = join(RECEIPT_DIR, `uc017-nhp-load-attempt${String(attemptNo).padStart(3, '0')}.json`);
    writeFileSync(receiptPath, JSON.stringify(metrics, null, 1));
    console.log(`RECEIPT_WRITTEN ${receiptPath} · implementer pre-commit run · not evidence of record`);
  } catch (e) {
    console.error(`RECEIPT_WRITE_FAILED ${(e as Error)?.message ?? e}`);
    fail++; // 收据缺失 = 契约不完整（C-6），不得静默绿
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-017 NHP-LOAD PC+L1–L5+N1–N4 asserts passed · EXIT0 ≠ covered ≠ suite green ≠ 行升格 · coveredCount=8'
    : `✗ ${fail} UC-E2E-017 NHP-LOAD asserts failed → EXIT1 诚实保留（缺陷登记 backlog · 修复另刀 · Ban 借刀改 commerce.ts）`}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', (e as Error)?.message ?? e); process.exit(1); });
