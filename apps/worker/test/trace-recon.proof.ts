/**
 * Real PostgreSQL proof for the UC-028 A2 trace reconciliation backfill.
 *
 * The trace write is a fail-open side channel; this proof never calls a model
 * provider (fully offline).  The "lost trace row" state is established through
 * the same durable invocation state machine the real invoke path uses
 * (claim → dispatch → terminalize succeeded) while the trace row stays absent
 * — exactly the post-fail-open-loss world the recon sweep must repair.  Arms:
 * inject loss → discover via the owner-only gateway seam → backfill (nine
 * columns carried verbatim) → idempotent replay → non-succeeded rows are never
 * backfilled → principal guard + ACL wall → water-level gauge back to zero.
 */
import { randomUUID } from 'node:crypto';
import {
  aiTraceBackfillScoped, asPrincipal, assertIsolatedTestTarget, claimModelInvocation, completeModelInvocation,
  createPool, gatewayTraceReconMissingOwners, markModelInvocationDispatched, markModelInvocationUnknown,
} from '@meetwise/db';
import { METRIC, setMetrics } from '@meetwise/ai-runtime';
import { resolveTraceReconConfig, traceReconOwner, traceReconTick } from '../src/trace-recon.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const owner = `trace-recon-${suffix}`;
const owner2 = `trace-recon-two-${suffix}`;
const otherOwner = `trace-recon-other-${suffix}`;
const service = 'proof.trace_recon';
const requestId = `req-${suffix}`;
const config = resolveTraceReconConfig({});

interface SeededTruth {
  key: string;
  output: unknown;
  estimate: number;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
}

/** Drives the real durable state machine to a succeeded truth row; writes no trace row. */
async function seedSucceededTruth(
  seedOwner: string, key: string, output: unknown, tokens?: { input: number; output: number },
): Promise<SeededTruth> {
  const estimate = 90 + key.length;
  await asPrincipal(pool, seedOwner, async (c) => {
    const claim = await claimModelInvocation(c, {
      owner: seedOwner, idempotencyKey: key, requestDigest: 'a'.repeat(64), service, requestId,
      estimateInputTokens: estimate, leaseToken: randomUUID(), leaseSeconds: 60,
    });
    if (claim.action !== 'execute') throw new Error(`test_claim_${claim.action}`);
    if (!await markModelInvocationDispatched(c, seedOwner, key, claim.leaseToken)) throw new Error('test_dispatch_failed');
    if (!await completeModelInvocation(c, {
      owner: seedOwner, idempotencyKey: key, output,
      inputTokens: tokens?.input, outputTokens: tokens?.output, latencyMs: 1234,
    })) throw new Error('test_complete_failed');
  });
  return {
    key, output, estimate,
    inputTokens: tokens?.input ?? null, outputTokens: tokens?.output ?? null, latencyMs: 1234,
  };
}

async function seedFailedTruth(key: string) {
  await asPrincipal(pool, owner, async (c) => {
    const claim = await claimModelInvocation(c, {
      owner, idempotencyKey: key, requestDigest: 'a'.repeat(64), service,
      estimateInputTokens: 50, leaseToken: randomUUID(), leaseSeconds: 60,
    });
    if (claim.action !== 'execute') throw new Error(`test_claim_${claim.action}`);
    if (!await markModelInvocationDispatched(c, owner, key, claim.leaseToken)) throw new Error('test_dispatch_failed');
    if (!await completeModelInvocation(c, { owner, idempotencyKey: key, error: 'schema_validation_failed' })) {
      throw new Error('test_fail_complete_failed');
    }
  });
}

async function seedUnknownTruth(key: string) {
  await asPrincipal(pool, owner, async (c) => {
    const claim = await claimModelInvocation(c, {
      owner, idempotencyKey: key, requestDigest: 'a'.repeat(64), service,
      estimateInputTokens: 50, leaseToken: randomUUID(), leaseSeconds: 60,
    });
    if (claim.action !== 'execute') throw new Error(`test_claim_${claim.action}`);
    if (!await markModelInvocationDispatched(c, owner, key, claim.leaseToken)) throw new Error('test_dispatch_failed');
    if (!await markModelInvocationUnknown(c, owner, key, 'external_outcome_unknown')) throw new Error('test_unknown_failed');
  });
}

/** Nine-column oracle: every backfilled trace column must equal its truth-face source, one column never skipped. */
async function nineColumnOracle(seedOwner: string, seed: SeededTruth) {
  const r = await pool.query(
    `SELECT t.owner_user_id, t.idempotency_key, t.output, t.service, t.input_tokens, t.output_tokens,
            t.estimate_input_tokens, t.latency_ms, t.request_id,
            i.output AS truth_output, i.estimate_input_tokens AS truth_estimate,
            i.service AS truth_service, i.request_id AS truth_request_id
       FROM ai_invocation_trace t
       JOIN ai_model_invocation i
         ON i.owner_user_id = t.owner_user_id AND i.idempotency_key = t.idempotency_key
      WHERE t.owner_user_id=$1 AND t.idempotency_key=$2`,
    [seedOwner, seed.key],
  );
  const row = r.rows[0];
  if (!row) return false;
  return row.owner_user_id === seedOwner
    && row.idempotency_key === seed.key
    && JSON.stringify(row.output) === JSON.stringify(row.truth_output)
    && JSON.stringify(row.output) === JSON.stringify(seed.output)
    && row.service === row.truth_service && row.service === service
    && row.input_tokens === seed.inputTokens
    && row.output_tokens === seed.outputTokens
    && row.estimate_input_tokens === row.truth_estimate
    && row.estimate_input_tokens === seed.estimate
    && row.latency_ms === seed.latencyMs
    && row.request_id === row.truth_request_id && row.request_id === requestId;
}

async function main() {
  await assertIsolatedTestTarget(pool);

  // ── Arm ① inject loss + discovery seam ────────────────────────────────────
  // Computed keys keep the env-var names verbatim while staying off the
  // literal-property naming rule (SCREAMING_SNAKE env names are the contract).
  A('配置拒绝越界的 owner 批上限', (() => {
    try { resolveTraceReconConfig({ ['TRACE_RECON_OWNER_BATCH']: '0' }); return false; }
    catch (error) { return error instanceof Error && error.message === 'trace_recon_owner_batch_invalid'; }
  })());
  A('配置拒绝越界的逐 owner 键批上限', (() => {
    try { resolveTraceReconConfig({ ['TRACE_RECON_OWNER_KEY_BATCH']: '10001' }); return false; }
    catch (error) { return error instanceof Error && error.message === 'trace_recon_owner_key_batch_invalid'; }
  })());
  A('枚举缝拒绝越界限值（22023 族）', await gatewayTraceReconMissingOwners(pool, 0)
    .then(() => false)
    .catch((error: unknown) => error instanceof Error && error.message.includes('gateway_trace_recon_limit_invalid')));

  // The lost world: a validated-success invocation whose trace INSERT lost the
  // fail-open race.  Truth face carries the same `stored` value the two write
  // paths share (redactOutput shape `{redacted:true}` included).
  const seed1 = await seedSucceededTruth(owner, `lost:${suffix}`, { redacted: true }, { input: 11, output: 7 });
  const traceAbsent = await pool.query(
    'SELECT 1 FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, seed1.key]);
  A('丢失注入：succeeded 真相行在而 trace 行缺失（fail-open 丢失态成立）', traceAbsent.rowCount === 0);
  const owners = await gatewayTraceReconMissingOwners(pool, config.ownerLimit);
  A('差集枚举缝：只出 owner id 不出键（owner-only 定稿）',
    owners.length === 1 && owners[0] === owner);

  // ── Arm ② backfill + nine-column verbatim equality ───────────────────────
  const tick1 = await traceReconTick(pool, config);
  A('回补：tick 报告恰 1 owner 恰 1 行回补', tick1.owners === 1 && tick1.backfilled === 1);
  A('九列逐列恒等：owner/key/output(含 redacted 标记)/service/input/output/estimate(同源直携)/latency/request_id',
    await nineColumnOracle(owner, seed1));

  // ── Arm ③ idempotent replay ──────────────────────────────────────────────
  const tick2 = await traceReconTick(pool, config);
  const replayCount = await pool.query(
    'SELECT count(*)::int AS n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, seed1.key]);
  A('幂等重放：二次 tick 零新增零 owner 且行数恒 1',
    tick2.owners === 0 && tick2.backfilled === 0 && replayCount.rows[0]?.n === 1);
  A('幂等重放：回补行零值漂（九列重对账仍恒等）', await nineColumnOracle(owner, seed1));
  A('幂等重放：逐 owner 反连接复扫零缺行键（差集已空）',
    await traceReconOwner(pool, owner, config) === 0);

  // ── Arm ④ non-succeeded rows are never backfilled ────────────────────────
  const failedKey = `failed:${suffix}`;
  const unknownKey = `unknown:${suffix}`;
  await seedFailedTruth(failedKey);
  await seedUnknownTruth(unknownKey);
  const tick3 = await traceReconTick(pool, config);
  const absent = await pool.query(
    'SELECT count(*)::int AS n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key IN ($2,$3)',
    [owner, failedKey, unknownKey],
  );
  A('非 success 不补：failed/unknown 行差集外（tick 零 owner 零回补·trace 零行）',
    tick3.owners === 0 && tick3.backfilled === 0 && absent.rows[0]?.n === 0);
  A('非 success 不补：直调回补函数对 failed 源返回 false（源缺不插）',
    await asPrincipal(pool, owner, (c) => aiTraceBackfillScoped(c, owner, failedKey)) === false);

  // ── Arm ⑤ principal guard + ACL wall ─────────────────────────────────────
  const crossOwnerRejected = await asPrincipal(pool, otherOwner, (c) => aiTraceBackfillScoped(c, owner, seed1.key))
    .then(() => false)
    .catch((error: unknown) => String((error as Error).message).includes('ai_cost_principal_mismatch'));
  A('principal 卫：跨 owner 调用回补被 insufficient_privilege 拒绝', crossOwnerRejected === true);
  const gatewayAclDenied = await asPrincipal(pool, owner, (c) =>
    c.query('SELECT owner_user_id FROM gateway_trace_recon_missing_owners($1)', [config.ownerLimit]))
    .then(() => false)
    .catch((error: unknown) => String((error as Error).message).includes('permission denied'));
  A('ACL：runtime principal 无权 EXECUTE 差集枚举函数（REVOKE 生效）', gatewayAclDenied === true);

  // ── Arm ⑥ water-level gauge back to zero ─────────────────────────────────
  // A second owner's fresh loss enters the diff set; the tick must backfill it
  // and drive the residual diff owner count back to 0 (steady state).
  const seed2 = await seedSucceededTruth(owner2, `lost2:${suffix}`, { redacted: true });
  const capturedGauges = new Map<string, number>();
  const capturedCounters = new Map<string, number>();
  setMetrics({
    inc: (name, _labels, by = 1) => capturedCounters.set(name, (capturedCounters.get(name) ?? 0) + by),
    observe: () => undefined,
    setGauge: (name, value) => capturedGauges.set(name, value),
    render: () => '',
  });
  const tick4 = await traceReconTick(pool, config);
  A('水位 gauge：回补后差集 owner 计数归零（稳态 0）',
    tick4.owners === 1 && tick4.backfilled === 1
    && capturedGauges.get(METRIC.aiTraceReconMissing) === 0);
  A('回补计数：本 tick 恰 +1（counter 语义）',
    capturedCounters.get(METRIC.aiTraceReconBackfilled) === 1);
  A('第二 owner 回补行九列恒等', await nineColumnOracle(owner2, seed2));

  console.log(failures === 0
    ? '\n✓ trace 对账回补：丢失→发现→回补→幂等→卫面→水位全部通过'
    : `\n✗ ${failures} 项失败`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
