/**
 * Named 0130 claim-join cases for HC-GAP-011 / UC-MODEL-001 E1.
 *
 *   pnpm -C packages/ai-runtime prove:claim-join-orphan
 *   pnpm runtime:prove                  (existing CI gate)
 *   pnpm runtime:isolated:prove         (isolation PG via runner env)
 *   pnpm runtime:claim-join:prove       (named isolated target)
 *
 * Uses DATABASE_URL / PG* from the caller. Does not start Docker.
 * Does not apply a new migration: 0130 is already on main.
 */
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { asPrincipal, claimModelInvocation, createPool } from '@meetwise/db';
import { invoke, type Model } from '../src/index.ts';

const pool = createPool();
let failures = 0;
function assert(name: string, cond: boolean) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures++;
}
function section(title: string) { console.log(`\n──────── ${title} ────────`); }

const OWNER = 'userA';
const QSchema = z.object({ question: z.string().min(1) });
const MIGRATIONS = [
  '0033_ai_cost_governance.sql',
  '0035_ai_cost_principal_scope.sql',
  '0036_ai_text_cost_governance.sql',
  '0037_ai_model_invocation_durable_claim.sql',
  '0056_model_invocation_reconcile.sql',
  '0057_model_invocation_cost_scope.sql',
  '0083_ai_text_cost_price_revision_binding.sql',
  '0085_ai_model_logical_node_dispatch_slot.sql',
  '0088_ai_model_invocation_controlled_state_machine.sql',
  '0119_usage_reconciliation_wiring.sql',
  '0130_model_invocation_same_key_claim_join.sql',
];

function sql(rel: string) {
  return readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
}

/** Same digest invoke() uses for a scripted model with no requestDigest / cost policy. */
function legacyDigest(idempotencyKey: string): string {
  return createHash('sha256').update(JSON.stringify({ legacy: `:${idempotencyKey}` })).digest('hex');
}

async function claim(key: string) {
  return asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER,
    idempotencyKey: key,
    logicalNodeKey: `legacy:${key}`,
    requestDigest: legacyDigest(key),
    leaseToken: randomUUID(),
    leaseSeconds: 60,
  }));
}

async function seedOrphanPermit(key: string) {
  await pool.query(
    `INSERT INTO ai_model_invocation_transition_permit(
       owner_user_id, idempotency_key, expected_old_status, expected_new_status
     ) VALUES ($1, $2, NULL, 'claimed')`,
    [OWNER, key],
  );
}

async function invocationCount(key: string): Promise<number> {
  const r = await pool.query<{ n: number }>(
    'SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, key],
  );
  return Number(r.rows[0]?.n ?? 0);
}

async function permitCount(key: string): Promise<number> {
  const r = await pool.query<{ n: number }>(
    'SELECT count(*)::int n FROM ai_model_invocation_transition_permit WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, key],
  );
  return Number(r.rows[0]?.n ?? 0);
}

function sameInvokeValue(left: unknown, right: unknown): boolean {
  return typeof left === 'object' && left !== null && 'value' in left
    && typeof right === 'object' && right !== null && 'value' in right
    && JSON.stringify((left as { value: unknown }).value) === JSON.stringify((right as { value: unknown }).value);
}

async function main() {
  await pool.query(sql('../../db/sql/01_schema.sql'));
  for (const migration of MIGRATIONS) {
    await pool.query(sql(`../../db/migrations/${migration}`));
  }
  await pool.query('TRUNCATE ai_model_dispatch_slot, ai_model_logical_node_header, ai_model_invocation, ai_model_invocation_transition_permit');

  section('HC-GAP-011-orphan-permit · leftover create-permit, no invocation row');
  const orphanKey = 'R1:hc-gap-011-orphan';
  await seedOrphanPermit(orphanKey);
  const orphanFirst = await claim(orphanKey);
  const orphanInvocations = await invocationCount(orphanKey);
  const orphanPermits = await permitCount(orphanKey);
  assert(
    'HC-GAP-011-orphan-permit: leftover create-permit with no invocation row returns wait, not execute',
    orphanFirst.action === 'wait' && orphanInvocations === 0 && orphanPermits === 0,
  );

  const orphanModel: Model & { calls: number } = {
    calls: 0,
    async call() { this.calls++; return { ok: true, raw: { question: 'orphan-join 题' } }; },
  };
  const orphanInvoke = await invoke(
    { idempotencyKey: orphanKey, schema: QSchema, businessValidate: () => null, model: orphanModel },
    pool,
    OWNER,
  );
  assert(
    'HC-GAP-011-orphan-permit: after wait, a later join executes once (calls=1, not a second dispatch from the cleared permit)',
    'value' in orphanInvoke && orphanModel.calls === 1 && (await invocationCount(orphanKey)) === 1,
  );

  section('HC-GAP-011-concurrent-no-row · two claimants, no row yet');
  const claimKey = 'R1:hc-gap-011-claim-race';
  const claimActions = await Promise.all([claim(claimKey), claim(claimKey)]);
  const executeCount = claimActions.filter((row) => row.action === 'execute').length;
  const waitCount = claimActions.filter((row) => row.action === 'wait').length;
  assert(
    'HC-GAP-011-concurrent-no-row: two claim() with no row yet → execute=1 and wait=1',
    executeCount === 1 && waitCount === 1 && (await invocationCount(claimKey)) === 1,
  );

  const invokeKey = 'R1:hc-gap-011-invoke-race';
  const raceModel: Model & { calls: number } = {
    calls: 0,
    async call() {
      this.calls++;
      await new Promise((resolve) => setTimeout(resolve, 30));
      return { ok: true, raw: { question: 'no-row 并发题' } };
    },
  };
  const raced = await Promise.all([
    invoke({ idempotencyKey: invokeKey, schema: QSchema, businessValidate: () => null, model: raceModel }, pool, OWNER),
    invoke({ idempotencyKey: invokeKey, schema: QSchema, businessValidate: () => null, model: raceModel }, pool, OWNER),
  ]);
  assert(
    'HC-GAP-011-concurrent-no-row: two invoke() with no row yet → calls=1 and both wait/cached the same value',
    raceModel.calls === 1 && sameInvokeValue(raced[0], raced[1]),
  );

  section('HC-GAP-011-orphan-concurrent · clearing leftover permit must not open a second execute');
  const orphanRaceKey = 'R1:hc-gap-011-orphan-race';
  await seedOrphanPermit(orphanRaceKey);
  const orphanRaceModel: Model & { calls: number } = {
    calls: 0,
    async call() {
      this.calls++;
      await new Promise((resolve) => setTimeout(resolve, 30));
      return { ok: true, raw: { question: 'orphan 并发题' } };
    },
  };
  const orphanRaced = await Promise.all([
    invoke({ idempotencyKey: orphanRaceKey, schema: QSchema, businessValidate: () => null, model: orphanRaceModel }, pool, OWNER),
    invoke({ idempotencyKey: orphanRaceKey, schema: QSchema, businessValidate: () => null, model: orphanRaceModel }, pool, OWNER),
  ]);
  if (orphanRaceModel.calls !== 1 || !sameInvokeValue(orphanRaced[0], orphanRaced[1])) {
    console.log('  orphan-concurrent outcomes', JSON.stringify(orphanRaced), 'calls', orphanRaceModel.calls);
  }
  assert(
    'HC-GAP-011-orphan-concurrent: two invoke() against leftover permit → execute/calls=1; follower wait/cached; calls must not become 2 from clearing permit',
    orphanRaceModel.calls === 1
      && sameInvokeValue(orphanRaced[0], orphanRaced[1])
      && (await invocationCount(orphanRaceKey)) === 1,
  );

  console.log(`\n${failures === 0 ? '✓ HC-GAP-011 claim-join named cases passed' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => { console.error(error); process.exit(1); });
