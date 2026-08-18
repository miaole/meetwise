/**
 * Real low-privilege PostgreSQL proof for MODEL-OP-00-DB-STATE-001 additions:
 * same-key concurrency elects exactly one executor, and the frozen header
 * binding only ever pairs with a reservation that matches it exactly.
 *
 * No provider is contacted; the durable dispatch boundary is the externally
 * observable seam under test.  Bootstrap-pool writes are fixture-only
 * corruptions (the same pattern as the reconcile proof) used to prove the
 * trigger/procedure reject states an ordinary application role must never be
 * able to create in the first place.
 */
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  asPrincipal, assertIsolatedTestTarget, claimModelInvocation, createPool,
  failModelInvocationClaim, markModelInvocationDispatched, reserveAiTextCost,
} from '@meetwise/db';
import { invoke } from '@meetwise/ai-runtime';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const owner = `model-op00-${suffix}`;
const scope = `model-op00-${suffix}`;
const provider = `proof-provider-${suffix}`;
const model = `proof-model-${suffix}`;
const region = 'cn-proof';
const digestA = '3'.repeat(64);

async function seedBudget() {
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,'r1',1000000,1000000,'https://example.test/model-op00',clock_timestamp())`,
    [provider, model, region],
  );
  await pool.query(
    'INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,10000000,true)', [scope],
  );
}

async function billedClaim(key: string, nodeKey: string, overrides: Partial<Parameters<typeof claimModelInvocation>[1]> = {}) {
  return asPrincipal(pool, owner, (c) => claimModelInvocation(c, {
    owner, idempotencyKey: key, logicalNodeKey: nodeKey, requestDigest: digestA,
    service: 'proof.model_op00', leaseToken: randomUUID(), leaseSeconds: 60,
    costScopeId: scope, provider, model, region, priceRevision: 'r1',
    maxInputTokens: 10, maxOutputTokens: 10,
    ...overrides,
  }));
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await seedBudget();

  // ── 正常 + 高并发: 20 same-key concurrent claims elect exactly one executor.
  const sameKey = `same-key:${suffix}`;
  const sameNode = `proof:same-node:${suffix}`;
  const claims = await Promise.all(Array.from({ length: 20 }, () => billedClaim(sameKey, sameNode)));
  const executors = claims.filter((claim) => claim.action === 'execute');
  const waiters = claims.filter((claim) => claim.action === 'wait');
  const others = claims.filter((claim) => claim.action !== 'execute' && claim.action !== 'wait');
  const winner = executors[0];
  let dispatchedOnce = false;
  if (executors.length === 1 && winner) {
    dispatchedOnce = await asPrincipal(pool, owner, async (c) => {
      const cost = await reserveAiTextCost(c, {
        scopeId: scope, requestOwner: owner, idempotencyKey: sameKey,
        provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
      });
      return cost.decision === 'reserved'
        && await markModelInvocationDispatched(c, owner, sameKey, winner.leaseToken, scope);
    });
  }
  const sameKeyLedger = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2) AS invocations,
       (SELECT count(*)::int FROM ai_model_logical_node_header WHERE owner_user_id=$1 AND logical_node_key_digest=encode(digest($3,'sha256'),'hex')) AS headers,
       (SELECT count(*)::int FROM ai_model_dispatch_slot WHERE owner_user_id=$1 AND logical_node_key_digest=encode(digest($3,'sha256'),'hex')) AS slots,
       (SELECT count(*)::int FROM ai_model_invocation_transition_permit WHERE owner_user_id=$1 AND idempotency_key=$2) AS permits`,
    [owner, sameKey, sameNode],
  );
  A('20 个同 key 并发正例：恰 1 个 execute、19 个 wait，header/slot/dispatch 恰为 1 且无 permit 残留',
    executors.length === 1 && waiters.length === 19 && others.length === 0 && dispatchedOnce
    && Number(sameKeyLedger.rows[0]?.invocations) === 1
    && Number(sameKeyLedger.rows[0]?.headers) === 1
    && Number(sameKeyLedger.rows[0]?.slots) === 1
    && Number(sameKeyLedger.rows[0]?.permits) === 0);

  // ── 异常: billed dispatch without any reservation is rejected pre-slot.
  const noReservationKey = `no-reservation:${suffix}`;
  const noReservationClaim = await billedClaim(noReservationKey, `proof:${noReservationKey}`);
  let reservationRequired = false;
  if (noReservationClaim.action === 'execute') {
    await asPrincipal(pool, owner, async (c) => {
      try {
        await c.query('SAVEPOINT no_reservation_dispatch');
        await markModelInvocationDispatched(c, owner, noReservationKey, noReservationClaim.leaseToken, scope);
      } catch (error) {
        reservationRequired = String((error as Error).message).includes('ai_model_dispatch_cost_reservation_required');
        await c.query('ROLLBACK TO SAVEPOINT no_reservation_dispatch');
      }
    });
  }
  const noReservationState = await pool.query(
    `SELECT i.status,
            (SELECT count(*)::int FROM ai_model_dispatch_slot s
              WHERE s.owner_user_id=i.owner_user_id AND s.logical_node_key_digest=i.logical_node_key_digest) AS slots
       FROM ai_model_invocation i WHERE i.owner_user_id=$1 AND i.idempotency_key=$2`,
    [owner, noReservationKey],
  );
  A('有 cost scope 但无匹配 reservation 的派发在占槽前被拒绝，状态保持 claimed、slot=0',
    reservationRequired
    && noReservationState.rows[0]?.status === 'claimed'
    && Number(noReservationState.rows[0]?.slots) === 0);

  // ── 特殊: unbilled (local model) claim/dispatch carries no binding at all.
  const unbilledKey = `unbilled:${suffix}`;
  const unbilledClaim = await asPrincipal(pool, owner, (c) => claimModelInvocation(c, {
    owner, idempotencyKey: unbilledKey, logicalNodeKey: `proof:${unbilledKey}`,
    requestDigest: '4'.repeat(64), service: 'proof.model_op00_unbilled',
    leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  const unbilledDispatched = unbilledClaim.action === 'execute'
    && await asPrincipal(pool, owner, (c) => markModelInvocationDispatched(c, owner, unbilledKey, unbilledClaim.leaseToken));
  const unbilledHeader = await pool.query(
    `SELECT provider,model,region,price_revision,max_input_tokens,max_output_tokens
       FROM ai_model_logical_node_header WHERE owner_user_id=$1 AND logical_node_key_digest=encode(digest($2,'sha256'),'hex')`,
    [owner, `proof:${unbilledKey}`],
  );
  const unbilledRow = unbilledHeader.rows[0];
  A('无费用策略的本地调用可正常 claim/dispatch，header binding 全部为 NULL',
    unbilledDispatched && unbilledHeader.rowCount === 1
    && unbilledRow?.provider === null && unbilledRow?.model === null && unbilledRow?.region === null
    && unbilledRow?.price_revision === null && unbilledRow?.max_input_tokens === null && unbilledRow?.max_output_tokens === null);

  // ── 逃逸: a reservation under the same scope/key but drifted pricing
  // identity cannot cross the dispatch boundary (procedure-level BINDING-001).
  const driftKey = `binding-drift:${suffix}`;
  const driftClaim = await billedClaim(driftKey, `proof:${driftKey}`);
  await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
    scopeId: scope, requestOwner: owner, idempotencyKey: driftKey,
    provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
  }));
  // Fixture-only corruption: rewrite the pricing identity of the reserved row
  // to model an out-of-band operator error or a legacy drift.
  await pool.query(
    "UPDATE ai_cost_reservation SET provider='drifted-provider' WHERE scope_id=$1 AND request_owner_user_id=$2 AND idempotency_key=$3",
    [scope, owner, driftKey],
  );
  let bindingMismatch = false;
  if (driftClaim.action === 'execute') {
    await asPrincipal(pool, owner, async (c) => {
      try {
        await c.query('SAVEPOINT drift_dispatch');
        await markModelInvocationDispatched(c, owner, driftKey, driftClaim.leaseToken, scope);
      } catch (error) {
        bindingMismatch = String((error as Error).message).includes('ai_model_dispatch_cost_reservation_binding_mismatch');
        await c.query('ROLLBACK TO SAVEPOINT drift_dispatch');
      }
    });
  }
  const driftState = await pool.query(
    `SELECT i.status,
            (SELECT count(*)::int FROM ai_model_dispatch_slot s
              WHERE s.owner_user_id=i.owner_user_id AND s.logical_node_key_digest=i.logical_node_key_digest) AS slots
       FROM ai_model_invocation i WHERE i.owner_user_id=$1 AND i.idempotency_key=$2`,
    [owner, driftKey],
  );
  A('同 scope 同 key 但 provider 漂移的 reservation 被派发围栏拒绝：binding mismatch、状态 claimed、slot=0',
    bindingMismatch
    && driftState.rows[0]?.status === 'claimed'
    && Number(driftState.rows[0]?.slots) === 0);

  // ── 复杂: same-key replay with a different frozen binding is a deterministic
  // rejection, not a second executor.
  const replayKey = `replay-binding:${suffix}`;
  const replayFirst = await billedClaim(replayKey, `proof:${replayKey}`);
  const replayDrift = await billedClaim(replayKey, `proof:${replayKey}`, {
    provider: `drifted-${suffix}`,
  });
  const replayState = await pool.query(
    'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, replayKey],
  );
  A('同 key 重放携带不同 binding：确定性 failed(logical_node_binding_mismatch)，不产生第二个执行租约',
    replayFirst.action === 'execute'
    && replayDrift.action === 'failed' && replayDrift.error === 'logical_node_binding_mismatch'
    && replayState.rows[0]?.status === 'claimed');

  // ── 刁钻/ACL 漂移第二道防线: with INSERT/UPDATE restored, even a forged
  // permit cannot cross the dispatch boundary without header+slot+exact
  // reservation binding.
  await pool.query('GRANT INSERT, UPDATE ON ai_model_invocation TO app_role');
  try {
    const rawKey = `raw-binding:${suffix}`;
    const rawClaim = await billedClaim(rawKey, `proof:${rawKey}`);
    await asPrincipal(pool, owner, async (c) => reserveAiTextCost(c, {
      scopeId: scope, requestOwner: owner, idempotencyKey: rawKey,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
    }));
    // Fixture: a leaked/forged permit and a slot that the guarded procedures
    // would never have produced in this combination.
    await pool.query(
      `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
       VALUES($1,$2,'claimed','dispatching')`,
      [owner, rawKey],
    );
    await pool.query(
      `INSERT INTO ai_model_dispatch_slot(owner_user_id,logical_node_key_digest,canonical_idempotency_key,cost_scope_id)
       SELECT $1, logical_node_key_digest, canonical_idempotency_key, cost_scope_id
         FROM ai_model_logical_node_header WHERE owner_user_id=$1 AND canonical_idempotency_key=$2`,
      [owner, rawKey],
    );
    // Drift the reservation AFTER the slot exists: slot present, reservation mismatched.
    await pool.query(
      "UPDATE ai_cost_reservation SET price_revision='r-drift' WHERE scope_id=$1 AND request_owner_user_id=$2 AND idempotency_key=$3",
      [scope, owner, rawKey],
    );
    let triggerRejectedBinding = false;
    await asPrincipal(pool, owner, async (c) => {
      try {
        await c.query('SAVEPOINT raw_binding');
        await c.query(
          `UPDATE ai_model_invocation
              SET status='dispatching',lease_token=NULL,lease_expires_at=NULL,dispatched_at=clock_timestamp()
            WHERE owner_user_id=$1 AND idempotency_key=$2 AND status='claimed'`,
          [owner, rawKey],
        );
      } catch (error) {
        triggerRejectedBinding = String((error as Error).message).includes('ai_model_dispatch_cost_reservation_required');
        await c.query('ROLLBACK TO SAVEPOINT raw_binding');
      }
    });
    // Same forged setup but with the reservation removed entirely.
    const rawKey2 = `raw-missing:${suffix}`;
    const rawClaim2 = await billedClaim(rawKey2, `proof:${rawKey2}`);
    await pool.query(
      `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
       VALUES($1,$2,'claimed','dispatching')`,
      [owner, rawKey2],
    );
    await pool.query(
      `INSERT INTO ai_model_dispatch_slot(owner_user_id,logical_node_key_digest,canonical_idempotency_key,cost_scope_id)
       SELECT $1, logical_node_key_digest, canonical_idempotency_key, cost_scope_id
         FROM ai_model_logical_node_header WHERE owner_user_id=$1 AND canonical_idempotency_key=$2`,
      [owner, rawKey2],
    );
    let triggerRejectedMissing = false;
    await asPrincipal(pool, owner, async (c) => {
      try {
        await c.query('SAVEPOINT raw_missing');
        await c.query(
          `UPDATE ai_model_invocation
              SET status='dispatching',lease_token=NULL,lease_expires_at=NULL,dispatched_at=clock_timestamp()
            WHERE owner_user_id=$1 AND idempotency_key=$2 AND status='claimed'`,
          [owner, rawKey2],
        );
      } catch (error) {
        triggerRejectedMissing = String((error as Error).message).includes('ai_model_dispatch_cost_reservation_required');
        await c.query('ROLLBACK TO SAVEPOINT raw_missing');
      }
    });
    const rawRows = await pool.query(
      `SELECT idempotency_key,status FROM ai_model_invocation
        WHERE owner_user_id=$1 AND idempotency_key IN ($2,$3) ORDER BY idempotency_key`,
      [owner, rawKey, rawKey2],
    );
    A('ACL 漂移 + 伪造 permit/slot 下，reservation 缺失或 binding 不匹配仍被 trigger 第二道防线拒绝，状态保持 claimed',
      triggerRejectedBinding && triggerRejectedMissing
      && rawRows.rowCount === 2
      && rawRows.rows.every((row) => row.status === 'claimed'));
    if (rawClaim.action !== 'execute') A('raw drift fixture claim executed', false);
    if (rawClaim2.action !== 'execute') A('raw missing fixture claim executed', false);
  } finally {
    await pool.query('REVOKE INSERT, UPDATE ON ai_model_invocation FROM app_role');
  }

  // ── 刁钻: dispatch with a wrong lease or a foreign cost scope never crosses.
  const wrongLeaseKey = `wrong-lease:${suffix}`;
  const wrongLeaseClaim = await billedClaim(wrongLeaseKey, `proof:${wrongLeaseKey}`);
  const wrongLeaseDispatch = wrongLeaseClaim.action === 'execute'
    && await asPrincipal(pool, owner, (c) => markModelInvocationDispatched(c, owner, wrongLeaseKey, randomUUID(), scope));
  const wrongLeaseState = await pool.query(
    'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, wrongLeaseKey],
  );
  A('错误 lease 或错配 cost scope 的派发请求不越过边界（返回 false，状态不变）',
    wrongLeaseDispatch === false && wrongLeaseState.rows[0]?.status === 'claimed');

  // Tidy up the still-claimed fixture rows so nothing leaks into other proofs.
  for (const [key, claim] of [['no-reservation', noReservationClaim], ['replay-binding', replayFirst], ['wrong-lease', wrongLeaseClaim]] as const) {
    if (claim.action === 'execute') {
      await asPrincipal(pool, owner, (c) => failModelInvocationClaim(c, owner, `${key}:${suffix}`, claim.leaseToken, 'proof_complete'));
    }
  }

  // ── P0 核心：direct INSERT dispatching / 非法 terminal / 派发后 identity mutation。
  // 0088 撤权是第一道防线；此处模拟 ACL 漂移（重授 INSERT/UPDATE）后，逐条直写证明
  // trigger 的第二道防线仍然拒绝，且零 ledger/sink 增量。
  await pool.query('GRANT INSERT, UPDATE ON ai_model_invocation TO app_role');
  try {
    // (A) direct INSERT dispatching：无 permit 直写 dispatching 被 permit 门拒绝。
    const rawInsertKey = `raw-insert:${suffix}`;
    let insertRejected = false;
    await asPrincipal(pool, owner, async (c) => {
      try {
        await c.query('SAVEPOINT raw_insert');
        await c.query(
          `INSERT INTO ai_model_invocation(owner_user_id,idempotency_key,request_digest,status)
           VALUES($1,$2,$3,'dispatching')`,
          [owner, rawInsertKey, digestA],
        );
      } catch (error) {
        insertRejected = String((error as Error).message).includes('ai_model_invocation_transition_permit_required');
        await c.query('ROLLBACK TO SAVEPOINT raw_insert');
      }
    });
    const rawInsertCount = (await pool.query(
      'SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, rawInsertKey],
    )).rows[0].n;
    A('direct INSERT dispatching 被 permit 门拒绝，零账本行', insertRejected && rawInsertCount === 0);

    // (A2) 即便伪造 (NULL→dispatching) permit 骗过 permit 门，INSERT 的形状门
    // claim_shape 仍拒绝非 claimed 的直插（这是 permit 门之后的唯一防线）。
    const shapeKey = `raw-insert-shape:${suffix}`;
    await pool.query(
      `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
       VALUES($1,$2,NULL,'dispatching')`,
      [owner, shapeKey],
    );
    let shapeRejected = false;
    await asPrincipal(pool, owner, async (c) => {
      try {
        await c.query('SAVEPOINT raw_insert_shape');
        await c.query(
          `INSERT INTO ai_model_invocation(owner_user_id,idempotency_key,request_digest,status)
           VALUES($1,$2,$3,'dispatching')`,
          [owner, shapeKey, digestA],
        );
      } catch (error) {
        shapeRejected = String((error as Error).message).includes('ai_model_invocation_claim_shape_invalid');
        await c.query('ROLLBACK TO SAVEPOINT raw_insert_shape');
      }
    });
    const shapeCount = (await pool.query(
      'SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, shapeKey],
    )).rows[0].n;
    A('伪造 (NULL→dispatching) permit 后直插 dispatching 仍被 claim_shape 形状门拒绝，零账本行',
      shapeRejected && shapeCount === 0);
    await pool.query('DELETE FROM ai_model_invocation_transition_permit WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, shapeKey]);

    // (B) 非法 terminal：伪造 (claimed→succeeded) permit 后，claimed → succeeded 仍被状态机拒绝。
    const illegalTermKey = `illegal-terminal:${suffix}`;
    const illegalTermClaim = await billedClaim(illegalTermKey, `proof:${illegalTermKey}`);
    await pool.query(
      `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
       VALUES($1,$2,'claimed','succeeded')`,
      [owner, illegalTermKey],
    );
    let terminalRejected = false;
    if (illegalTermClaim.action === 'execute') {
      await asPrincipal(pool, owner, async (c) => {
        try {
          await c.query('SAVEPOINT illegal_terminal');
          await c.query(
            'UPDATE ai_model_invocation SET status=$3 WHERE owner_user_id=$1 AND idempotency_key=$2',
            [owner, illegalTermKey, 'succeeded'],
          );
        } catch (error) {
          terminalRejected = String((error as Error).message).includes('ai_model_invocation_state_transition_invalid');
          await c.query('ROLLBACK TO SAVEPOINT illegal_terminal');
        }
      });
    }
    const illegalTermState = (await pool.query(
      'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, illegalTermKey],
    )).rows[0]?.status;
    A('非法 terminal（claimed → succeeded）被状态机拒绝，状态保持 claimed',
      illegalTermClaim.action === 'execute' && terminalRejected && illegalTermState === 'claimed');
    // 先清掉伪造 permit（占用 (owner,key) 主键），再走受控失败过程收尾。
    await pool.query('DELETE FROM ai_model_invocation_transition_permit WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, illegalTermKey]);
    if (illegalTermClaim.action === 'execute') {
      await asPrincipal(pool, owner, (c) => failModelInvocationClaim(c, owner, illegalTermKey, illegalTermClaim.leaseToken, 'proof_complete'));
    }

    // (B2) 非法 terminal 变体：claimed → unknown 同样被状态机拒绝（从 claimed 只能到
    // dispatching 或 failed；unknown 是已派发后的终态，claimed 不可直达）。
    const illegalUnknownKey = `illegal-unknown:${suffix}`;
    const illegalUnknownClaim = await billedClaim(illegalUnknownKey, `proof:${illegalUnknownKey}`);
    await pool.query(
      `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
       VALUES($1,$2,'claimed','unknown')`,
      [owner, illegalUnknownKey],
    );
    let unknownTerminalRejected = false;
    if (illegalUnknownClaim.action === 'execute') {
      await asPrincipal(pool, owner, async (c) => {
        try {
          await c.query('SAVEPOINT illegal_unknown_terminal');
          await c.query(
            'UPDATE ai_model_invocation SET status=$3 WHERE owner_user_id=$1 AND idempotency_key=$2',
            [owner, illegalUnknownKey, 'unknown'],
          );
        } catch (error) {
          unknownTerminalRejected = String((error as Error).message).includes('ai_model_invocation_state_transition_invalid');
          await c.query('ROLLBACK TO SAVEPOINT illegal_unknown_terminal');
        }
      });
    }
    const illegalUnknownState = (await pool.query(
      'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, illegalUnknownKey],
    )).rows[0]?.status;
    A('非法 terminal（claimed → unknown）被状态机拒绝，状态保持 claimed',
      illegalUnknownClaim.action === 'execute' && unknownTerminalRejected && illegalUnknownState === 'claimed');
    await pool.query('DELETE FROM ai_model_invocation_transition_permit WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, illegalUnknownKey]);
    if (illegalUnknownClaim.action === 'execute') {
      await asPrincipal(pool, owner, (c) => failModelInvocationClaim(c, owner, illegalUnknownKey, illegalUnknownClaim.leaseToken, 'proof_complete'));
    }

    // (C) 派发后 identity mutation：合法派发后篡改 logical_node_key_digest 被 identity_immutable 拒绝。
    const identityKey = `identity-mut:${suffix}`;
    const identityClaim = await billedClaim(identityKey, `proof:${identityKey}`);
    const identityDispatched = identityClaim.action === 'execute'
      && await asPrincipal(pool, owner, async (c) => {
        const cost = await reserveAiTextCost(c, {
          scopeId: scope, requestOwner: owner, idempotencyKey: identityKey,
          provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
        });
        return cost.decision === 'reserved'
          && await markModelInvocationDispatched(c, owner, identityKey, identityClaim.leaseToken, scope);
      });
    const identityDigestBefore = (await pool.query(
      'SELECT logical_node_key_digest FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, identityKey],
    )).rows[0]?.logical_node_key_digest;
    await pool.query(
      `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
       VALUES($1,$2,'dispatching','dispatching')`,
      [owner, identityKey],
    );
    let identityRejected = false;
    await asPrincipal(pool, owner, async (c) => {
      try {
        await c.query('SAVEPOINT identity_mut');
        await c.query(
          'UPDATE ai_model_invocation SET logical_node_key_digest=$3 WHERE owner_user_id=$1 AND idempotency_key=$2',
          [owner, identityKey, '5'.repeat(64)],
        );
      } catch (error) {
        identityRejected = String((error as Error).message).includes('ai_model_invocation_identity_immutable');
        await c.query('ROLLBACK TO SAVEPOINT identity_mut');
      }
    });
    const identityDigestAfter = (await pool.query(
      'SELECT logical_node_key_digest FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, identityKey],
    )).rows[0]?.logical_node_key_digest;
    A('派发后篡改 logical_node_key_digest 被 identity_immutable 拒绝，digest 不变',
      identityDispatched && identityRejected && identityDigestAfter === identityDigestBefore);

    // (C2) identity_immutable 覆盖全部 8 个计费/负载字段：逐个篡改 cost_scope_id /
    // request_digest / service 均被拒绝且列值不变（cost_scope_id 篡改=改挂别人预算）。
    const identityFieldRejections: boolean[] = [];
    for (const [column, value] of [['cost_scope_id', 'other-scope'], ['request_digest', '6'.repeat(64)], ['service', 'proof.evil_service']] as const) {
      const before = (await pool.query(
        `SELECT ${column} AS v FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`,
        [owner, identityKey],
      )).rows[0]?.v;
      let rejected = false;
      await asPrincipal(pool, owner, async (c) => {
        try {
          await c.query('SAVEPOINT identity_field_mut');
          await c.query(
            `UPDATE ai_model_invocation SET ${column}=$3 WHERE owner_user_id=$1 AND idempotency_key=$2`,
            [owner, identityKey, value],
          );
        } catch (error) {
          rejected = String((error as Error).message).includes('ai_model_invocation_identity_immutable');
          await c.query('ROLLBACK TO SAVEPOINT identity_field_mut');
        }
      });
      const after = (await pool.query(
        `SELECT ${column} AS v FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`,
        [owner, identityKey],
      )).rows[0]?.v;
      identityFieldRejections.push(rejected && after === before);
    }
    A('派发后篡改 cost_scope_id / request_digest / service 均被 identity_immutable 拒绝且列值不变',
      identityDispatched && identityFieldRejections.every(Boolean));

    // (D) dispatching→terminal 三条形状门：伪造 (dispatching→succeeded/failed) permit 后，
    // 直写 succeeded 无 output→success_shape、succeeded 带 error_code→terminal_shape、
    // failed 带 output→terminal_output，均被拒绝且状态保持 dispatching。
    const termKey = `disp-terminal:${suffix}`;
    const termClaim = await billedClaim(termKey, `proof:${termKey}`);
    const termDispatched = termClaim.action === 'execute'
      && await asPrincipal(pool, owner, async (c) => {
        const cost = await reserveAiTextCost(c, {
          scopeId: scope, requestOwner: owner, idempotencyKey: termKey,
          provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
        });
        return cost.decision === 'reserved'
          && await markModelInvocationDispatched(c, owner, termKey, termClaim.leaseToken, scope);
      });
    async function attemptTerminal(permitNewStatus: string, sql: string, expected: string): Promise<boolean> {
      await pool.query('DELETE FROM ai_model_invocation_transition_permit WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, termKey]);
      await pool.query(
        `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
         VALUES($1,$2,'dispatching',$3)`,
        [owner, termKey, permitNewStatus],
      );
      let rejected = false;
      await asPrincipal(pool, owner, async (c) => {
        try {
          await c.query('SAVEPOINT term_attempt');
          await c.query(sql, [owner, termKey]);
        } catch (error) {
          rejected = String((error as Error).message).includes(expected);
          await c.query('ROLLBACK TO SAVEPOINT term_attempt');
        }
      });
      return rejected;
    }
    const termSuccessShape = await attemptTerminal('succeeded',
      "UPDATE ai_model_invocation SET status='succeeded' WHERE owner_user_id=$1 AND idempotency_key=$2",
      'ai_model_invocation_success_shape_invalid');
    const termTerminalShape = await attemptTerminal('succeeded',
      "UPDATE ai_model_invocation SET status='succeeded',error_code='boom',output='{}'::jsonb WHERE owner_user_id=$1 AND idempotency_key=$2",
      'ai_model_invocation_terminal_shape_invalid');
    const termTerminalOutput = await attemptTerminal('failed',
      "UPDATE ai_model_invocation SET status='failed',error_code='boom',output='{}'::jsonb WHERE owner_user_id=$1 AND idempotency_key=$2",
      'ai_model_invocation_terminal_output_invalid');
    const termState = (await pool.query(
      'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, termKey],
    )).rows[0]?.status;
    A('dispatching→terminal 三条形状门均拒绝（success_shape/terminal_shape/terminal_output），状态仍 dispatching',
      termDispatched && termSuccessShape && termTerminalShape && termTerminalOutput && termState === 'dispatching');
    await pool.query('DELETE FROM ai_model_invocation_transition_permit WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, termKey]);
  } finally {
    await pool.query('REVOKE INSERT, UPDATE ON ai_model_invocation FROM app_role');
  }

  // ── 不同 key 竞争同一 logical node：恰 1 个 execute，19 个确定性拒绝（非 unique violation）。
  const nodeRaceNode = `proof:node-race:${suffix}`;
  const nodeRaceClaims = await Promise.all(
    Array.from({ length: 20 }, (_, i) => billedClaim(`node-race:${i}:${suffix}`, nodeRaceNode)),
  );
  const raceExecutors = nodeRaceClaims.filter((claim) => claim.action === 'execute');
  const raceRejected = nodeRaceClaims.filter((claim) => claim.action === 'failed');
  const raceOthers = nodeRaceClaims.filter((claim) => claim.action !== 'execute' && claim.action !== 'failed');
  const raceLedger = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM ai_model_logical_node_header WHERE owner_user_id=$1 AND logical_node_key_digest=encode(digest($2,'sha256'),'hex')) AS headers,
       (SELECT count(*)::int FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key LIKE 'node-race:%') AS invocations`,
    [owner, nodeRaceNode],
  );
  A('20 个不同 key 竞争同一 logical node：恰 1 execute、19 个确定性 canonical_invocation_mismatch 拒绝',
    raceExecutors.length === 1
    && raceRejected.length === 19
    && raceRejected.every((claim) => claim.action === 'failed' && claim.error === 'logical_node_canonical_invocation_mismatch')
    && raceOthers.length === 0
    && Number(raceLedger.rows[0]?.headers) === 1
    && Number(raceLedger.rows[0]?.invocations) === 20);
  // 收尾：失败唯一 winner 的 still-claimed 行（19 个 loser 已 failed）。
  for (let i = 0; i < nodeRaceClaims.length; i++) {
    const claim = nodeRaceClaims[i];
    if (claim?.action === 'execute') {
      await asPrincipal(pool, owner, (c) => failModelInvocationClaim(c, owner, `node-race:${i}:${suffix}`, claim.leaseToken, 'proof_complete'));
    }
  }

  // ── registry node identity end-to-end (MODEL-OP-00 server-side identity):
  // `invoke` derives the logical node from the frozen operation id plus an
  // explicit business revision; replays of the same revision never transport
  // twice, and unknown/conflicting identity never creates a durable claim.
  const registryOwner = `model-op00-registry-${suffix}`;
  const registrySchema = z.object({ answer: z.string() });
  let transports = 0;
  const scriptedModel = {
    async call(): Promise<{ ok: true; raw: unknown }> {
      transports++;
      return { ok: true, raw: { answer: 'ok' } };
    },
  };
  const invokeSpec = {
    idempotencyKey: `registry:${suffix}`,
    operation: { id: 'interview.question-generation.v1', businessRevision: `br-${suffix}` },
    schema: registrySchema,
    businessValidate: (value: { answer: string }) => (value.answer === 'ok' ? null : 'bad_answer'),
    model: scriptedModel,
    service: 'proof.model_op00_registry',
  } as const;
  const firstOutcome = await invoke(invokeSpec, pool, registryOwner);
  const replayOutcome = await invoke(invokeSpec, pool, registryOwner);
  const registryNodeDigest = (await pool.query(
    'SELECT logical_node_key_digest FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
    [registryOwner, `registry:${suffix}`],
  )).rows[0]?.logical_node_key_digest;
  const expectedDigest = (await pool.query(
    "SELECT encode(digest($1,'sha256'),'hex') AS digest",
    [`model-op-registry-v1:interview.question-generation.v1:br-${suffix}`],
  )).rows[0]?.digest;
  A('registry operation 派生节点身份：同 revision 重放零额外外呼，durable digest 与服务端推导一致',
    'value' in firstOutcome && 'value' in replayOutcome
    && transports === 1 && registryNodeDigest === expectedDigest);

  const unknownOperation = await invoke({
    ...invokeSpec, idempotencyKey: `registry-unknown:${suffix}`,
    operation: { id: 'interview.unknown.v1', businessRevision: 'br1' },
  }, pool, registryOwner);
  const conflictingIdentity = await invoke({
    ...invokeSpec, idempotencyKey: `registry-conflict:${suffix}`,
    logicalNodeKey: 'proof:caller-controlled',
  }, pool, registryOwner);
  const rejectedRows = await pool.query(
    'SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key IN ($2,$3)',
    [registryOwner, `registry-unknown:${suffix}`, `registry-conflict:${suffix}`],
  );
  A('未登记 operation 与 operation+logicalNodeKey 冲突都在 durable claim 前确定性拒绝，零账本行',
    'error' in unknownOperation && unknownOperation.error === 'model_operation_unknown'
    && 'error' in conflictingIdentity && conflictingIdentity.error === 'model_logical_node_key_conflict'
    && Number(rejectedRows.rows[0]?.n) === 0);

  console.log(failures === 0
    ? '\n✓ MODEL-OP-00 DB 状态机补充回归：同 key 并发、冻结 binding 与围栏第二道防线全部通过'
    : `\n✗ ${failures} 项失败`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'model_op00_db_state_proof_failed');
  await pool.end();
  process.exit(1);
});
