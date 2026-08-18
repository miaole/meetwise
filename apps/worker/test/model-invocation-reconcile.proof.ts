/**
 * Real PostgreSQL proof for the post-dispatch model reconciler.
 *
 * It deliberately never calls a model provider.  Instead it creates the same
 * durable `dispatching` boundary that a provider call creates, ages it past
 * the configured ambiguity window, and proves that recovery freezes both the
 * invocation and the billable reservation without a retry/release path.
 */
import { randomUUID } from 'node:crypto';
import {
  asPrincipal, assertIsolatedTestTarget, claimModelInvocation, createPool,
  failModelInvocationClaim, markAiCostDispatched, markModelInvocationDispatched, reserveAiTextCost,
} from '@meetwise/db';
import { modelInvocationReconcileTick, resolveModelInvocationReconcileConfig } from '../src/model-invocation-reconcile.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const owner = `model-reconcile-${suffix}`;
const otherOwner = `model-reconcile-other-${suffix}`;
const scope = `model-reconcile-${suffix}`;
const unrelatedScope = `model-reconcile-unrelated-${suffix}`;
const provider = `proof-provider-${suffix}`;
const model = `proof-model-${suffix}`;
const region = 'cn-proof';
const config = { olderThanMs: 70_000, limit: 100 };

async function seedBudget() {
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,'r1',1000000,1000000,'https://example.test/model-reconcile',clock_timestamp())`,
    [provider, model, region],
  );
  await pool.query(
    'INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,10000000,true)', [scope],
  );
  await pool.query(
    'INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,10000000,true)', [unrelatedScope],
  );
}

async function dispatch(ownerUserId: string, key: string, budgetScope = scope) {
  return asPrincipal(pool, ownerUserId, async (c) => {
    const cost = await reserveAiTextCost(c, {
      scopeId: budgetScope, requestOwner: ownerUserId, idempotencyKey: key,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
    });
    if (cost.decision !== 'reserved') throw new Error(`test_cost_reserve_${cost.decision}`);
    const claim = await claimModelInvocation(c, {
      owner: ownerUserId, idempotencyKey: key, requestDigest: 'a'.repeat(64),
      service: 'proof.model_reconcile', leaseToken: randomUUID(), leaseSeconds: 60, costScopeId: budgetScope,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
    });
    if (claim.action !== 'execute') throw new Error(`test_model_claim_${claim.action}`);
    const invocationDispatched = await markModelInvocationDispatched(c, ownerUserId, key, claim.leaseToken, budgetScope);
    const costDispatched = await markAiCostDispatched(c, budgetScope, ownerUserId, key);
    if (!costDispatched || !invocationDispatched) throw new Error('test_dispatch_boundary_failed');
  });
}

/**
 * Test-fixture-only corruption used to age an already-valid dispatch without
 * weakening the app_role state machine.  The isolated bootstrap connection is
 * the cluster owner; ordinary paths never receive replication-role access.
 */
async function ageInvocation(ownerUserId: string, key: string) {
  const c = await pool.connect();
  try {
    await c.query("SET session_replication_role='replica'");
    await c.query(
      "UPDATE ai_model_invocation SET dispatched_at=clock_timestamp()-interval '2 minutes' WHERE owner_user_id=$1 AND idempotency_key=$2",
      [ownerUserId, key],
    );
  } finally {
    await c.query("SET session_replication_role='origin'").catch(() => undefined);
    c.release();
  }
}

/** Isolated-fixture-only: expire a claimed lease without granting a runtime role raw writes. */
async function expireClaimLease(ownerUserId: string, key: string) {
  const c = await pool.connect();
  try {
    await c.query("SET session_replication_role='replica'");
    await c.query(
      "UPDATE ai_model_invocation SET lease_expires_at=clock_timestamp()-interval '1 second' WHERE owner_user_id=$1 AND idempotency_key=$2",
      [ownerUserId, key],
    );
  } finally {
    await c.query("SET session_replication_role='origin'").catch(() => undefined);
    c.release();
  }
}

async function statuses(key: string) {
  const invocation = await pool.query(
    'SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key]);
  const cost = await pool.query(
    'SELECT status,reason_code FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2', [scope, key]);
  return { invocation: invocation.rows[0], cost: cost.rows[0] };
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await seedBudget();
  A('配置拒绝小于派发不确定窗口的对账时间', (() => {
    try { resolveModelInvocationReconcileConfig({ MODEL_INVOCATION_RECONCILE_AFTER_MS: '34999' }); return false; }
    catch (error) { return error instanceof Error && error.message === 'model_invocation_reconcile_after_invalid'; }
  })());
  A('配置拒绝执行上限 120 秒而对账仅 35 秒（不能提前冻结合法请求）', (() => {
    try {
      resolveModelInvocationReconcileConfig({
        MODEL_EXECUTION_TIMEOUT_MS: '120000', MODEL_TIMEOUT_MS: '30000',
        MODEL_INVOCATION_WAIT_MS: '35000', MODEL_INVOCATION_RECONCILE_AFTER_MS: '35000',
      });
      return false;
    } catch (error) { return error instanceof Error && error.message === 'model_invocation_reconcile_after_before_execution_settlement'; }
  })());

  const directAcl = await pool.query(
    "SELECT has_table_privilege('app_role','ai_model_invocation','INSERT') AS can_insert, has_table_privilege('app_role','ai_model_invocation','UPDATE') AS can_update, has_table_privilege('app_role','ai_model_invocation','DELETE') AS can_delete",
  );
  A('正常 runtime role 对调用账本没有 INSERT/UPDATE/DELETE 直写权限',
    directAcl.rows[0]?.can_insert === false && directAcl.rows[0]?.can_update === false && directAcl.rows[0]?.can_delete === false);

  const rawDispatch = `raw-dispatch:${suffix}`;
  let aclBlocked = false;
  let deleteBlocked = false;
  await asPrincipal(pool, owner, async (c) => {
    const claim = await claimModelInvocation(c, {
      owner, idempotencyKey: rawDispatch, logicalNodeKey: `proof:${rawDispatch}`,
      requestDigest: 'c'.repeat(64), service: 'proof.raw_dispatch',
      leaseToken: randomUUID(), leaseSeconds: 60,
    });
    if (claim.action !== 'execute') throw new Error(`test_raw_dispatch_claim_${claim.action}`);
    await c.query('SAVEPOINT raw_dispatch_attempt');
    try {
      await c.query(
        `UPDATE ai_model_invocation
            SET status='dispatching',lease_token=NULL,lease_expires_at=NULL,dispatched_at=clock_timestamp()
          WHERE owner_user_id=$1 AND idempotency_key=$2 AND status='claimed'`,
        [owner, rawDispatch],
      );
    } catch (error) {
      aclBlocked = String((error as Error).message).includes('permission denied');
      await c.query('ROLLBACK TO SAVEPOINT raw_dispatch_attempt');
    }
    await c.query('SAVEPOINT raw_delete_attempt');
    try {
      await c.query(
        'DELETE FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
        [owner, rawDispatch],
      );
    } catch (error) {
      deleteBlocked = String((error as Error).message).includes('permission denied');
      await c.query('ROLLBACK TO SAVEPOINT raw_delete_attempt');
    }
  });
  const rawSlot = await pool.query(
    'SELECT count(*)::int n FROM ai_model_dispatch_slot WHERE owner_user_id=$1', [owner],
  );
  const rawDispatchRow = await pool.query(
    'SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, rawDispatch],
  );
  A('app_role 不能绕过受控过程直写或删除调用账本：ACL 在 slot 前拒绝，原 claimed 记录仍在',
    aclBlocked && deleteBlocked && Number(rawSlot.rows[0]?.n) === 0 && Number(rawDispatchRow.rows[0]?.n) === 1);

  const expiredLeaseKey = `expired-lease:${suffix}`;
  await asPrincipal(pool, owner, async (c) => {
    const cost = await reserveAiTextCost(c, {
      scopeId: scope, requestOwner: owner, idempotencyKey: expiredLeaseKey,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
    });
    if (cost.decision !== 'reserved') throw new Error(`test_expired_lease_reserve_${cost.decision}`);
    const claim = await claimModelInvocation(c, {
      owner, idempotencyKey: expiredLeaseKey, logicalNodeKey: `proof:${expiredLeaseKey}`,
      requestDigest: 'e'.repeat(64), service: 'proof.expired_lease', leaseToken: randomUUID(), leaseSeconds: 60,
      costScopeId: scope, provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
    });
    if (claim.action !== 'execute') throw new Error(`test_expired_lease_claim_${claim.action}`);
  });
  await expireClaimLease(owner, expiredLeaseKey);
  const expiredLeaseDispatch = await asPrincipal(pool, owner, async (c) => {
    const row = await c.query<{ lease_token: string }>(
      'SELECT lease_token FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
      [owner, expiredLeaseKey],
    );
    return markModelInvocationDispatched(c, owner, expiredLeaseKey, String(row.rows[0]?.lease_token), scope);
  });
  const expiredLeaseState = await pool.query(
    `SELECT i.status, count(s.owner_user_id)::int AS slot_count
       FROM ai_model_invocation AS i
       LEFT JOIN ai_model_dispatch_slot AS s
         ON s.owner_user_id=i.owner_user_id AND s.logical_node_key_digest=i.logical_node_key_digest
      WHERE i.owner_user_id=$1 AND i.idempotency_key=$2
      GROUP BY i.status`,
    [owner, expiredLeaseKey],
  );
  A('过期 lease 的旧 worker 不能取得 dispatch 边界：状态保持 claimed、slot 增量为 0',
    expiredLeaseDispatch === false
    && expiredLeaseState.rows[0]?.status === 'claimed'
    && Number(expiredLeaseState.rows[0]?.slot_count) === 0);

  // The following isolated-only ACL drift demonstrates that the trigger is a
  // second barrier, rather than relying on an ACL declaration alone.
  await pool.query('GRANT INSERT, UPDATE ON ai_model_invocation TO app_role');
  try {
    const rawInsert = `raw-insert:${suffix}`;
    let insertBlocked = false;
    await asPrincipal(pool, owner, async (c) => {
      await c.query('SAVEPOINT raw_insert_attempt');
      try {
        await c.query(
          `INSERT INTO ai_model_invocation(owner_user_id,idempotency_key,logical_node_key_digest,request_digest,status,service)
           VALUES($1,$2,$3,$4,'dispatching','proof.raw_insert')`,
          [owner, rawInsert, 'e'.repeat(64), 'f'.repeat(64)],
        );
      } catch (error) {
        insertBlocked = String((error as Error).message).includes('ai_model_invocation_transition_permit_required');
        await c.query('ROLLBACK TO SAVEPOINT raw_insert_attempt');
      }
    });
    const rawTerminal = `raw-terminal:${suffix}`;
    let terminalBlocked = false;
    let unknownBlocked = false;
    await asPrincipal(pool, owner, async (c) => {
      await dispatch(owner, rawTerminal);
      await c.query('SAVEPOINT raw_terminal_attempt');
      try {
        await c.query(
          `UPDATE ai_model_invocation
              SET status='succeeded',output='{"forged":true}'::jsonb,completed_at=clock_timestamp()
            WHERE owner_user_id=$1 AND idempotency_key=$2`,
          [owner, rawTerminal],
        );
      } catch (error) {
        terminalBlocked = String((error as Error).message).includes('ai_model_invocation_transition_permit_required');
        await c.query('ROLLBACK TO SAVEPOINT raw_terminal_attempt');
      }
      await c.query('SAVEPOINT raw_unknown_attempt');
      try {
        await c.query(
          `UPDATE ai_model_invocation
              SET status='unknown',error_code='forged_unknown'
            WHERE owner_user_id=$1 AND idempotency_key=$2`,
          [owner, rawTerminal],
        );
      } catch (error) {
        unknownBlocked = String((error as Error).message).includes('ai_model_invocation_transition_permit_required');
        await c.query('ROLLBACK TO SAVEPOINT raw_unknown_attempt');
      }
    });
    const rawIdentity = `raw-identity:${suffix}`;
    await dispatch(owner, rawIdentity);
    let identityBlocked = false;
    await asPrincipal(pool, owner, async (c) => {
      await c.query('SAVEPOINT raw_identity_attempt');
      try {
        await c.query(
          `UPDATE ai_model_invocation SET request_digest=$3
            WHERE owner_user_id=$1 AND idempotency_key=$2`,
          [owner, rawIdentity, '9'.repeat(64)],
        );
      } catch (error) {
        identityBlocked = String((error as Error).message).includes('ai_model_invocation_transition_permit_required')
          || String((error as Error).message).includes('ai_model_invocation_identity_immutable');
        await c.query('ROLLBACK TO SAVEPOINT raw_identity_attempt');
      }
    });
    const rawRows = await pool.query(
      `SELECT count(*)::int n FROM ai_model_invocation
        WHERE owner_user_id=$1 AND idempotency_key IN ($2,$3,$4)`,
      [owner, rawInsert, rawTerminal, rawIdentity],
    );
    const rawCosts = await pool.query(
      `SELECT count(*)::int n FROM ai_cost_reservation
        WHERE scope_id=$1 AND idempotency_key IN ($2,$3,$4)`,
      [scope, rawInsert, rawTerminal, rawIdentity],
    );
    const rawTerminalState = await pool.query(
      `SELECT status,output FROM ai_model_invocation
        WHERE owner_user_id=$1 AND idempotency_key=$2`,
      [owner, rawTerminal],
    );
    A('即使测试中恢复 INSERT/UPDATE 权限，direct INSERT dispatching、dispatching→succeeded|unknown 伪造 terminal 和派发后 identity mutation 仍被 permit 触发器拒绝',
      insertBlocked && terminalBlocked && unknownBlocked && identityBlocked
      && Number(rawRows.rows[0]?.n) === 2 && Number(rawCosts.rows[0]?.n) === 2
      && rawTerminalState.rows[0]?.status === 'dispatching' && rawTerminalState.rows[0]?.output === null);
  } finally {
    await pool.query('REVOKE INSERT, UPDATE ON ai_model_invocation FROM app_role');
  }

  const canonicalFirst = `canonical-first:${suffix}`;
  const canonicalSecond = `canonical-second:${suffix}`;
  let canonicalBlocked = false;
  await asPrincipal(pool, owner, async (c) => {
    const first = await claimModelInvocation(c, {
      owner, idempotencyKey: canonicalFirst, logicalNodeKey: `proof:canonical:${suffix}`,
      requestDigest: 'd'.repeat(64), service: 'proof.canonical', leaseToken: randomUUID(), leaseSeconds: 60,
    });
    if (first.action !== 'execute'
      || !await failModelInvocationClaim(c, owner, canonicalFirst, first.leaseToken, 'known_not_sent_for_proof')) {
      throw new Error('test_canonical_first_failed');
    }
    const second = await claimModelInvocation(c, {
      owner, idempotencyKey: canonicalSecond, logicalNodeKey: `proof:canonical:${suffix}`,
      requestDigest: 'd'.repeat(64), service: 'proof.canonical', leaseToken: randomUUID(), leaseSeconds: 60,
    });
    canonicalBlocked = second.action === 'failed' && second.error === 'logical_node_canonical_invocation_mismatch';
  });
  const canonicalSlots = await pool.query(
    'SELECT count(*)::int n FROM ai_model_dispatch_slot WHERE owner_user_id=$1 AND logical_node_key_digest=encode(digest($2,\'sha256\'),\'hex\')',
    [owner, `proof:canonical:${suffix}`],
  );
  A('known-not-sent 后不能用新的 idempotency key 重开同一逻辑节点，且不会预占 dispatch slot',
    canonicalBlocked && Number(canonicalSlots.rows[0]?.n) === 0);

  // This is the actual different-key race which 0085 never covered.  The
  // candidate procedure must elect one canonical header without a unique-key
  // exception; only the winner may reserve and cross the durable boundary.
  const concurrentNode = `proof:concurrent:${suffix}`;
  const concurrentKeys = Array.from({ length: 20 }, (_, index) => `concurrent-${index}:${suffix}`);
  const concurrentClaims = await Promise.all(concurrentKeys.map(async (key) => asPrincipal(pool, owner, (c) =>
    claimModelInvocation(c, {
      owner, idempotencyKey: key, logicalNodeKey: concurrentNode,
      requestDigest: '2'.repeat(64), service: 'proof.concurrent',
      leaseToken: randomUUID(), leaseSeconds: 60, costScopeId: scope,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
    }))));
  const executable: Array<{ key: string; leaseToken: string }> = [];
  for (const [index, claim] of concurrentClaims.entries()) {
    if (claim.action === 'execute') executable.push({ key: concurrentKeys[index]!, leaseToken: claim.leaseToken });
  }
  const deterministicLosers = concurrentClaims.filter((claim) =>
    claim.action === 'failed' && claim.error === 'logical_node_canonical_invocation_mismatch');
  let concurrentDispatched = false;
  const winner = executable[0];
  if (executable.length === 1 && winner !== undefined) {
    concurrentDispatched = await asPrincipal(pool, owner, async (c) => {
      const cost = await reserveAiTextCost(c, {
        scopeId: scope, requestOwner: owner, idempotencyKey: winner.key,
        provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
      });
      return cost.decision === 'reserved'
        && await markModelInvocationDispatched(c, owner, winner.key, winner.leaseToken, scope)
        && await markAiCostDispatched(c, scope, owner, winner.key);
    });
  }
  const concurrentLedger = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM ai_model_logical_node_header WHERE owner_user_id=$1 AND logical_node_key_digest=encode(digest($2,'sha256'),'hex')) AS headers,
       (SELECT count(*)::int FROM ai_model_dispatch_slot WHERE owner_user_id=$1 AND logical_node_key_digest=encode(digest($2,'sha256'),'hex')) AS slots,
       (SELECT count(*)::int FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key = ANY($3::text[]) AND status='dispatching') AS dispatches,
       (SELECT count(*)::int FROM ai_cost_reservation WHERE scope_id=$4 AND idempotency_key = ANY($3::text[])) AS reservations`,
    [owner, concurrentNode, concurrentKeys, scope],
  );
  A('20 个不同 key 并发竞争同一节点：一条 canonical header、一个 slot/dispatch/reservation，19 个确定性拒绝且无唯一键异常',
    executable.length === 1 && deterministicLosers.length === 19 && concurrentDispatched
    && Number(concurrentLedger.rows[0]?.headers) === 1
    && Number(concurrentLedger.rows[0]?.slots) === 1
    && Number(concurrentLedger.rows[0]?.dispatches) === 1
    && Number(concurrentLedger.rows[0]?.reservations) === 1);

  const stale = `stale:${suffix}`;
  const fresh = `fresh:${suffix}`;
  await dispatch(owner, stale);
  await dispatch(owner, fresh);
  await ageInvocation(owner, stale);
  await pool.query(
    "UPDATE ai_cost_reservation SET dispatched_at=clock_timestamp()-interval '2 minutes' WHERE scope_id=$1 AND idempotency_key=$2",
    [scope, stale],
  );

  const first = await modelInvocationReconcileTick(pool, config);
  const after = await statuses(stale);
  A('过期派发被对账为 invocation=unknown，明确禁止自动重发',
    first.invocations === 1 && after.invocation?.status === 'unknown' && after.invocation?.error_code === 'model_terminalization_reconcile');
  A('同一事务冻结匹配费用预留为 unknown，既不释放也不结算',
    first.frozenCosts === 1 && after.cost?.status === 'unknown' && after.cost?.reason_code === 'model_terminalization_reconcile');
  const replay = await asPrincipal(pool, owner, (c) => claimModelInvocation(c, {
    owner, idempotencyKey: stale, requestDigest: 'a'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60, costScopeId: scope,
    provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
  }));
  A('unknown 重放只返回未知终态，绝不重新取得执行租约', replay.action === 'unknown');
  const freshAfter = await statuses(fresh);
  A('未过不确定窗口的派发不被提前冻结', freshAfter.invocation?.status === 'dispatching' && freshAfter.cost?.status === 'dispatching');

  // One owner can use identical idempotency text in different business
  // budgets.  The durable invocation carries the selected scope, so recovery
  // must not freeze a coincidental reservation belonging to another product.
  const scopeCollision = `scope-collision:${suffix}`;
  await dispatch(owner, scopeCollision, scope);
  await asPrincipal(pool, owner, async (c) => {
    const reserve = await reserveAiTextCost(c, {
      scopeId: unrelatedScope, requestOwner: owner, idempotencyKey: scopeCollision,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
    });
    if (reserve.decision !== 'reserved' || !await markAiCostDispatched(c, unrelatedScope, owner, scopeCollision))
      throw new Error('test_unrelated_scope_dispatch_failed');
  });
  await ageInvocation(owner, scopeCollision);
  const collisionTick = await modelInvocationReconcileTick(pool, config);
  const unrelated = await pool.query(
    'SELECT status FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2', [unrelatedScope, scopeCollision],
  );
  const collisionOwned = await statuses(scopeCollision);
  A('跨 scope 同键只冻结调用绑定预算，不误占用无关 RAG/业务预算',
    collisionTick.invocations === 1 && collisionTick.frozenCosts === 1
      && collisionOwned.cost?.status === 'unknown' && unrelated.rows[0]?.status === 'dispatching');

  const replayTick = await modelInvocationReconcileTick(pool, config);
  A('重复 tick 无二次终态化或费用冻结', replayTick.invocations === 0 && replayTick.frozenCosts === 0);

  const race = `race:${suffix}`;
  await dispatch(owner, race);
  await ageInvocation(owner, race);
  const [a, b] = await Promise.all([
    modelInvocationReconcileTick(pool, config),
    modelInvocationReconcileTick(pool, config),
  ]);
  const raced = await statuses(race);
  A('双 worker 并发只终态化一次（SKIP LOCKED，无双冻结）',
    a.invocations + b.invocations === 1 && a.frozenCosts + b.frozenCosts === 1
      && raced.invocation?.status === 'unknown' && raced.cost?.status === 'unknown');

  const crossTenantCount = await asPrincipal(pool, otherOwner, (c) =>
    c.query('SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1', [owner]));
  A('其他主体不能读取该用户的调用终态（强制行级安全）', Number(crossTenantCount.rows[0]?.n) === 0);

  // A corrupt/missing paired cost row is infrastructure failure, not a
  // successful reconciliation tick.  The worker must surface it to
  // runDrainLoop so readiness becomes false after repeated failures; silently
  // returning here would leave billable dispatches stuck forever while green.
  const broken = `broken-pair:${suffix}`;
  // Create a valid billable dispatch first.  The test then models database
  // corruption or an out-of-band operator error by deleting the paired row
  // with the bootstrap pool.  An app_role caller must not be able to create
  // this invalid boundary: the trigger above rejects it before dispatch.
  await dispatch(owner, broken);
  await pool.query(
    'DELETE FROM ai_cost_reservation WHERE scope_id=$1 AND request_owner_user_id=$2 AND idempotency_key=$3',
    [scope, owner, broken],
  );
  await ageInvocation(owner, broken);
  let surfacedFailure = false;
  try { await modelInvocationReconcileTick(pool, config); }
  catch (error) { surfacedFailure = error instanceof Error && error.message === 'model_invocation_reconcile_owner_failed'; }
  const brokenAfter = await pool.query(
    'SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, broken],
  );
  A('对账基础设施/配对失败向 drain loop 传播，事务回滚且不会假报 ready',
    surfacedFailure && brokenAfter.rows[0]?.status === 'dispatching');

  console.log(failures === 0
    ? '\n✓ 模型派发后对账：冻结未知、幂等、并发与 RLS 全部通过'
    : `\n✗ ${failures} 项失败`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'model_invocation_reconcile_proof_failed');
  await pool.end();
  process.exit(1);
});
