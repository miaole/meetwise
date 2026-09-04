/**
 * HC-GAP-009 isolated PostgreSQL proof.
 *
 * Honest current behaviour (not a production fail-closed change):
 *   1. invoke without `operation` does not write `ai_model_concurrency_lease`;
 *   2. invoke with a wired operation and max_concurrency=2 rejects the third
 *      slot as `model_concurrency_exhausted` (zero extra provider calls).
 *
 * Run only through the isolation runner (ephemeral cluster + nonce). Never
 * `pnpm db:up` / compose.dev. This environment does not invent a receipt.
 *
 *   pnpm model-slot-bypass:prove
 */
import { z } from 'zod';
import { assertIsolatedTestTarget, createPool } from '@meetwise/db';
import { invoke, type Model, type ModelResult } from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const OWNER = 'hc-gap-009-owner';
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const Schema = z.object({ answer: z.string().min(1) });
const DIGEST = 'e'.repeat(64);
const SCORER = 'interview.answer-scoring.v1';

function scripted(result: ModelResult, calls: { n: number }): Model {
  return {
    requestDigest: DIGEST,
    async call() {
      calls.n += 1;
      return result;
    },
  };
}

function latchModel() {
  let started!: () => void;
  const startedP = new Promise<void>((resolve) => { started = resolve; });
  let finish!: (value: ModelResult) => void;
  const resultP = new Promise<ModelResult>((resolve) => { finish = resolve; });
  const calls = { n: 0 };
  const model: Model = {
    requestDigest: DIGEST,
    async call() {
      calls.n += 1;
      started();
      return resultP;
    },
  };
  return { model, startedP, finish, calls };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`hc_gap_009_latch_timeout:${label}`)), ms);
    promise.then((value) => { clearTimeout(timer); resolve(value); }, (error) => { clearTimeout(timer); reject(error); });
  });
}

async function leaseSnapshot() {
  const r = await pool.query(
    `SELECT provider_account, region, model_or_recipe, operation_id, slot_index,
            owner_user_id, idempotency_key, lease_expires_at
       FROM ai_model_concurrency_lease
      ORDER BY provider_account, region, model_or_recipe, operation_id, slot_index`,
  );
  return JSON.stringify(r.rows);
}

async function occupiedScorerLeases() {
  const r = await pool.query(
    `SELECT count(*)::int n FROM ai_model_concurrency_lease
      WHERE operation_id=$1 AND owner_user_id IS NOT NULL
        AND lease_expires_at IS NOT NULL AND lease_expires_at > clock_timestamp()`,
    [SCORER],
  );
  return Number(r.rows[0]?.n ?? 0);
}

async function main() {
  await assertIsolatedTestTarget(pool);
  const previousMax = await pool.query(
    `SELECT max_concurrency FROM ai_model_admission_policy WHERE operation_id=$1`,
    [SCORER],
  );
  const restoreMax = Number(previousMax.rows[0]?.max_concurrency ?? 4);

  try {
  const beforeLegacy = await leaseSnapshot();
  const legacyCalls = { n: 0 };
  const legacy = await invoke({
    idempotencyKey: `hcg009:legacy:${suffix}`,
    logicalNodeKey: `hc-gap-009:legacy:${suffix}`,
    schema: Schema,
    businessValidate: () => null,
    model: scripted({ ok: true, raw: { answer: 'legacy' } }, legacyCalls),
  }, pool, OWNER);
  A('无 operation + 显式 logicalNodeKey 的 invoke 仍可走 MODEL-OP-00 兼容缝（外呼 1）',
    'value' in legacy && legacyCalls.n === 1);
  A('无 operation 的成功 invoke 不写 ai_model_concurrency_lease',
    (await leaseSnapshot()) === beforeLegacy);

  const derivedCalls = { n: 0 };
  const previousNodeEnv = process.env.NODE_ENV;
  const previousEnforce = process.env.MODEL_COST_ENFORCEMENT;
  process.env.NODE_ENV = 'test';
  delete process.env.MODEL_COST_ENFORCEMENT;
  const derived = await invoke({
    idempotencyKey: `hcg009:legacy-derived:${suffix}`,
    schema: Schema,
    businessValidate: () => null,
    model: scripted({ ok: true, raw: { answer: 'derived' } }, derivedCalls),
  }, pool, OWNER);
  A('非生产无 logicalNodeKey 的 legacy 派生路径也不写 lease',
    'value' in derived && derivedCalls.n === 1 && (await leaseSnapshot()) === beforeLegacy);

  process.env.NODE_ENV = 'production';
  const strictCalls = { n: 0 };
  const strict = await invoke({
    idempotencyKey: `hcg009:legacy-strict:${suffix}`,
    schema: Schema,
    businessValidate: () => null,
    model: scripted({ ok: true, raw: { answer: 'must-not-send' } }, strictCalls),
  }, pool, OWNER);
  A('生产无 operation/logicalNodeKey → model_logical_node_key_required 且不写 lease',
    'error' in strict && strict.error === 'model_logical_node_key_required'
      && strictCalls.n === 0 && (await leaseSnapshot()) === beforeLegacy);
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  if (previousEnforce === undefined) delete process.env.MODEL_COST_ENFORCEMENT;
  else process.env.MODEL_COST_ENFORCEMENT = previousEnforce;

  const hungLegacy = latchModel();
  const hungLegacyInvoke = invoke({
    idempotencyKey: `hcg009:legacy-hang:${suffix}`,
    logicalNodeKey: `hc-gap-009:legacy-hang:${suffix}`,
    schema: Schema,
    businessValidate: () => null,
    model: hungLegacy.model,
    executionTimeoutMs: 8_000,
  }, pool, OWNER);
  await withTimeout(hungLegacy.startedP, 4_000, 'legacy-hang');
  A('无 operation 的在途 invoke 仍不写 ai_model_concurrency_lease',
    (await leaseSnapshot()) === beforeLegacy && hungLegacy.calls.n === 1);
  hungLegacy.finish({ ok: true, raw: { answer: 'legacy-hang' } });
  const hungLegacyResult = await hungLegacyInvoke;
  A('无 operation 的在途 invoke 收口后 lease 表仍未变',
    'value' in hungLegacyResult && (await leaseSnapshot()) === beforeLegacy);

  await pool.query(
    `UPDATE ai_model_admission_policy SET max_concurrency=2
      WHERE operation_id=$1`,
    [SCORER],
  );
  await pool.query(`DELETE FROM ai_model_concurrency_lease WHERE operation_id=$1`, [SCORER]);
  const maxRow = await pool.query(
    `SELECT max_concurrency FROM ai_model_admission_policy WHERE operation_id=$1`,
    [SCORER],
  );
  A('证明用分区 max_concurrency=2', Number(maxRow.rows[0]?.max_concurrency) === 2);

  const holdA = latchModel();
  const holdB = latchModel();
  const invokeA = invoke({
    idempotencyKey: `hcg009:op-a:${suffix}`,
    operation: { id: SCORER, businessRevision: `hc-gap-009-a:${suffix}` },
    schema: Schema,
    businessValidate: () => null,
    model: holdA.model,
    executionTimeoutMs: 8_000,
  }, pool, OWNER);
  const invokeB = invoke({
    idempotencyKey: `hcg009:op-b:${suffix}`,
    operation: { id: SCORER, businessRevision: `hc-gap-009-b:${suffix}` },
    schema: Schema,
    businessValidate: () => null,
    model: holdB.model,
    executionTimeoutMs: 8_000,
  }, pool, OWNER);
  await Promise.all([
    withTimeout(holdA.startedP, 4_000, 'op-a'),
    withTimeout(holdB.startedP, 4_000, 'op-b'),
  ]);
  A('有 operation 时两槽均 occupied（invoke 已过 0120 admit）',
    holdA.calls.n === 1 && holdB.calls.n === 1 && (await occupiedScorerLeases()) === 2);

  const thirdCalls = { n: 0 };
  const third = await invoke({
    idempotencyKey: `hcg009:op-c:${suffix}`,
    operation: { id: SCORER, businessRevision: `hc-gap-009-c:${suffix}` },
    schema: Schema,
    businessValidate: () => null,
    model: scripted({ ok: true, raw: { answer: 'must-not-send' } }, thirdCalls),
  }, pool, OWNER);
  const thirdClaim = await pool.query(
    `SELECT status, error_code FROM ai_model_invocation
      WHERE owner_user_id=$1 AND idempotency_key=$2`,
    [OWNER, `hcg009:op-c:${suffix}`],
  );
  A('max=2 时第三条 invoke 拒绝 concurrency_exhausted、零外呼、非 wait/dispatching',
    'error' in third && third.error === 'model_concurrency_exhausted'
      && third.error !== 'model_invocation_wait_timeout'
      && thirdCalls.n === 0
      && thirdClaim.rows[0]?.status === 'failed'
      && thirdClaim.rows[0]?.status !== 'dispatching'
      && thirdClaim.rows[0]?.error_code === 'model_concurrency_exhausted');
  A('拒绝第三条后仍只占两槽', (await occupiedScorerLeases()) === 2);

  holdA.finish({ ok: true, raw: { answer: 'a' } });
  holdB.finish({ ok: true, raw: { answer: 'b' } });
  const [doneA, doneB] = await Promise.all([invokeA, invokeB]);
  A('前两槽 invoke 收口成功', 'value' in doneA && 'value' in doneB);
  } finally {
    await pool.query(
      `UPDATE ai_model_admission_policy SET max_concurrency=$2 WHERE operation_id=$1`,
      [SCORER, restoreMax],
    );
  }

  console.log(failures ? `\n✗ ${failures} HC-GAP-009 isolated failed` : '\n✓ HC-GAP-009 isolated: legacy writes 0 leases; third slot rejects');
  await pool.end();
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
