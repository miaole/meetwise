/**
 * Real low-privilege-isolated PostgreSQL proof for the AG-11 settle relaxation
 * (0188: ai_cost_settle_text widened body + scoped wrapper TABLE return +
 * ai_cost_budget_month table-level CHECK drop).
 *
 * Twelve behavior arms over the settle relaxation body (0188:282-372) and
 * the cached-input price face (0204: cached price columns + six-param settle):
 *   α equal-settle (actual=reserved → overage=false, amount via original path)
 *   β reserved<actual≤header max (row expansion + overage + month net deltas)
 *   β-0 actual_input=0 (input side never expands — 0033:47 CHECK lock intact)
 *   γ actual>header max (raise ai_cost_actual_exceeds_reservation, zero writes)
 *   δ missing invocation/header (COALESCE fail-closed = original strict semantics)
 *   ε month-limit crossing (settle succeeds over the dropped CHECK; reserve gate
 *     still self-limits with budget_exhausted)
 *   ζ scoped idempotent replay + same-key drifted envelope → binding_mismatch
 *   η app_role EXECUTE on the new TABLE-return signature (ACL after DROP+CREATE)
 *   ι cached=0 bitwise identity (new formula value == legacy full-price formula)
 *   κ distinct cached price revision (reservation captures cached price; split settle)
 *   λ NULL cached price falls back to input price for the cached CEIL term
 *   μ cached>input raises ai_cost_cached_exceeds_input (fail-closed guard)
 *
 * prove-shell via the isolated runner: domain/negative-path proof on a fresh
 * migration chain — NOT HTTP/SSE live E2E covered. No provider is contacted
 * (est live=0); every fixture is seeded through the real claim/reserve/dispatch
 * procedures, and bootstrap-pool writes are fixture-only corruptions (same
 * pattern as the model-op00 proof). releaseEvidence=false · Not HA.
 */
import { randomUUID } from 'node:crypto';
import {
  __resetAiCostExhaustedCacheForTest, asPrincipal, assertIsolatedTestTarget, claimModelInvocation, createPool,
  markAiCostDispatched, markModelInvocationDispatched, reserveAiTextCost, settleAiTextCost,
} from '@meetwise/db';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const owner = `ag11-settle-${suffix}`;
const provider = `proof-provider-${suffix}`;
const model = `proof-model-${suffix}`;
const region = 'cn-proof';
const digest = '5'.repeat(64);
// Price book at 1 micro-CNY per token per side: every CEIL term equals its
// token count, so amounts are human-checkable against the reserved/actual rows.
const RATE = 1_000_000;
const scopeA = `ag11-settle-a-${suffix}`;
const scopeE = `ag11-settle-e-${suffix}`;

const MONTH_PERIOD_SQL = "to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM')";

async function seedPriceBook() {
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,'r1',$4,$4,'https://example.test/ag11-settle-relax',clock_timestamp())`,
    [provider, model, region, RATE],
  );
}

async function seedBudgetPolicy(scopeId: string, monthlyLimit: number) {
  await pool.query(
    'INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,$2,true)',
    [scopeId, monthlyLimit],
  );
}

interface MonthRow { reserved: number; settled: number; version: number }

async function readMonth(scopeId: string): Promise<MonthRow | undefined> {
  const r = await pool.query(
    `SELECT reserved_micro_cny, settled_micro_cny, version
       FROM ai_cost_budget_month WHERE scope_id=$1 AND period_key=${MONTH_PERIOD_SQL}`,
    [scopeId],
  );
  const row = r.rows[0];
  return row ? { reserved: Number(row.reserved_micro_cny), settled: Number(row.settled_micro_cny), version: Number(row.version) } : undefined;
}

interface ReservationRow {
  status: string; inputReserved: number; outputReserved: number; reservedMicro: number;
  settledMicro: number | null; inputActual: number | null; outputActual: number | null; overage: boolean;
}

async function readReservation(scopeId: string, key: string): Promise<ReservationRow | undefined> {
  const r = await pool.query(
    `SELECT status,input_tokens_reserved,output_tokens_reserved,reserved_micro_cny,settled_micro_cny,
            input_tokens_actual,output_tokens_actual,overage
       FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2`,
    [scopeId, key],
  );
  const row = r.rows[0];
  if (!row) return undefined;
  return {
    status: String(row.status),
    inputReserved: Number(row.input_tokens_reserved),
    outputReserved: Number(row.output_tokens_reserved),
    reservedMicro: Number(row.reserved_micro_cny),
    settledMicro: row.settled_micro_cny === null ? null : Number(row.settled_micro_cny),
    inputActual: row.input_tokens_actual === null ? null : Number(row.input_tokens_actual),
    outputActual: row.output_tokens_actual === null ? null : Number(row.output_tokens_actual),
    overage: row.overage === true,
  };
}

/**
 * Production-faithful billed fixture: durable claim freezes the header binding
 * (maxInputTokens/maxOutputTokens), reserve takes the LEAST shape (input below
 * the frozen input cap, output equal to the frozen output cap — the equality
 * side stays locked by 0188), then both dispatch boundaries flip.
 * Returns the settled-in idempotency key; lease is discarded (settle never
 * reads the invocation lease).
 */
async function billedDispatchedReservation(scopeId: string, key: string, headerMaxInput: number, headerMaxOutput: number, reservedInput: number, reservedOutput: number) {
  const claim = await asPrincipal(pool, owner, (c) => claimModelInvocation(c, {
    owner, idempotencyKey: key, logicalNodeKey: `proof:ag11:${key}`, requestDigest: digest,
    service: 'proof.ag11_settle_relax', leaseToken: randomUUID(), leaseSeconds: 120,
    costScopeId: scopeId, provider, model, region, priceRevision: 'r1',
    maxInputTokens: headerMaxInput, maxOutputTokens: headerMaxOutput,
  }));
  if (claim.action !== 'execute') throw new Error(`ag11_fixture_claim_not_executable:${key}:${claim.action}`);
  return asPrincipal(pool, owner, async (c) => {
    const reserve = await reserveAiTextCost(c, {
      scopeId, requestOwner: owner, idempotencyKey: key,
      provider, model, region, priceRevision: 'r1',
      maxInputTokens: reservedInput, maxOutputTokens: reservedOutput,
    });
    if (reserve.decision !== 'reserved') throw new Error(`ag11_fixture_reserve_refused:${key}:${reserve.decision}`);
    const invocationDispatched = await markModelInvocationDispatched(c, owner, key, claim.leaseToken as string, scopeId);
    const costDispatched = await markAiCostDispatched(c, scopeId, owner, key);
    if (!invocationDispatched || !costDispatched) throw new Error(`ag11_fixture_dispatch_refused:${key}`);
    return reserve;
  });
}

async function settleRaises(scopeId: string, key: string, actualInput: number, actualOutput: number, code: string) {
  return asPrincipal(pool, owner, async (c) => {
    let message: string | null = null;
    try {
      await c.query('SAVEPOINT ag11_settle_raise');
      await settleAiTextCost(c, scopeId, owner, key, actualInput, actualOutput, 0);
    } catch (error) {
      message = String((error as Error).message);
    } finally {
      await c.query('ROLLBACK TO SAVEPOINT ag11_settle_raise');
    }
    return message !== null && message.includes(code);
  });
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await seedPriceBook();
  await seedBudgetPolicy(scopeA, 10_000_000);
  await seedBudgetPolicy(scopeE, 1_000);

  // ── α 等值结算：actual=reserved → overage=false，金额走原 CEIL 路径零变。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `equal:${suffix}`;
    const reserve = await billedDispatchedReservation(scopeA, key, 100, 40, 40, 40);
    const monthBefore = await readMonth(scopeA);
    const result = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeA, owner, key, 40, 40, 0));
    const row = await readReservation(scopeA, key);
    const monthAfter = await readMonth(scopeA);
    A('α 等值结算 actual=reserved：{80,false}·行终态 settled 金额原路径零变·月行 reserved−80/settled+80',
      reserve.reservedMicroCny === 80 && result.microCny === 80 && result.overage === false
      && row?.status === 'settled' && row.settledMicro === 80 && row.overage === false
      && row.inputReserved === 40 && row.outputReserved === 40
      && row.inputActual === 40 && row.outputActual === 40
      && monthBefore !== undefined && monthAfter !== undefined
      && monthAfter.reserved === monthBefore.reserved - 80
      && monthAfter.settled === monthBefore.settled + 80
      && monthAfter.version === monthBefore.version + 1);
  }

  // ── β 预留<actual≤header max：行内扩（仅 actual>reserved 侧单调扩）+overage+月行净增。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `expand:${suffix}`;
    const reserve = await billedDispatchedReservation(scopeA, key, 100, 40, 40, 40);
    const monthBefore = await readMonth(scopeA);
    const result = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeA, owner, key, 60, 40, 0));
    const row = await readReservation(scopeA, key);
    const monthAfter = await readMonth(scopeA);
    A('β 预留(40)<actual(60)≤header max(100)：settled 行扩 60/金额 100·overage=true·月行 reserved−80/settled+100 净增',
      reserve.reservedMicroCny === 80 && result.microCny === 100 && result.overage === true
      && row?.status === 'settled' && row.settledMicro === 100 && row.reservedMicro === 100 && row.overage === true
      && row.inputReserved === 60 && row.outputReserved === 40
      && row.inputActual === 60 && row.outputActual === 40
      && monthBefore !== undefined && monthAfter !== undefined
      && monthAfter.reserved === monthBefore.reserved - 80
      && monthAfter.settled === monthBefore.settled + 100);
  }

  // ── β-0 actual_input=0：input 侧不扩不缩（0033:47 CHECK (input_tokens_reserved>0) 防线锁）。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `zero-input:${suffix}`;
    await billedDispatchedReservation(scopeA, key, 100, 40, 40, 40);
    const result = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeA, owner, key, 0, 40, 0));
    const row = await readReservation(scopeA, key);
    A('β-0 actual_input=0：结算绿·input_tokens_reserved 恒 40 不触扩·0 消耗不被歪曲·overage=false',
      result.microCny === 40 && result.overage === false
      && row?.status === 'settled' && row.settledMicro === 40
      && row.inputReserved === 40 && row.outputReserved === 40
      && row.inputActual === 0 && row.outputActual === 40 && row.overage === false);
  }

  // ── γ actual>header max：封顶不破，raise 原码且行态/月行零动。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `cap:${suffix}`;
    await billedDispatchedReservation(scopeA, key, 10, 10, 10, 10);
    const monthBefore = await readMonth(scopeA);
    const raised = await settleRaises(scopeA, key, 11, 10, 'ai_cost_actual_exceeds_reservation');
    const row = await readReservation(scopeA, key);
    const monthAfter = await readMonth(scopeA);
    A('γ actual(11)>header max_input(10)：raise ai_cost_actual_exceeds_reservation·行态 dispatching 零写·月行零动',
      raised && row?.status === 'dispatching' && row.settledMicro === null && row.overage === false
      && row.inputReserved === 10 && row.inputActual === null
      && monthBefore !== undefined && monthAfter !== undefined
      && monthAfter.reserved === monthBefore.reserved
      && monthAfter.settled === monthBefore.settled
      && monthAfter.version === monthBefore.version);
  }

  // ── δ 无 invocation/header 匹配：COALESCE 退回预留自值=现严格语义（fail-closed 不扩权）。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `no-header:${suffix}`;
    const reserve = await asPrincipal(pool, owner, async (c) => {
      const r = await reserveAiTextCost(c, {
        scopeId: scopeA, requestOwner: owner, idempotencyKey: key,
        provider, model, region, priceRevision: 'r1', maxInputTokens: 40, maxOutputTokens: 40,
      });
      if (r.decision !== 'reserved') throw new Error(`ag11_fixture_reserve_refused:${key}`);
      if (!await markAiCostDispatched(c, scopeA, owner, key)) throw new Error(`ag11_fixture_dispatch_refused:${key}`);
      return r;
    });
    const monthBefore = await readMonth(scopeA);
    const raised = await settleRaises(scopeA, key, 41, 40, 'ai_cost_actual_exceeds_reservation');
    const strictStillGreen = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeA, owner, key, 40, 40, 0));
    const row = await readReservation(scopeA, key);
    const monthAfter = await readMonth(scopeA);
    A('δ 无 invocation/header：actual(41)>预留自值 raise 封顶=严格语义 fail-closed·等值预留仍结算绿（{80,false}）·月行仅一次结转',
      reserve.reservedMicroCny === 80 && raised && strictStillGreen.microCny === 80 && strictStillGreen.overage === false
      && row?.status === 'settled' && row.settledMicro === 80 && row.overage === false
      && monthBefore !== undefined && monthAfter !== undefined
      && monthAfter.reserved === monthBefore.reserved - 80
      && monthAfter.settled === monthBefore.settled + 80);
  }

  // ── ε 月限穿仓：settle 期表级 CHECK 松绑后「钱已花不拒」；reserve 期闸门仍自限。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `crossing:${suffix}`;
    await billedDispatchedReservation(scopeE, key, 100, 40, 40, 40);
    // Fixture-only corruption: pull the month ledger to the exact old-CHECK
    // boundary so the overage settle must cross the dropped constraint to land.
    await pool.query(
      `UPDATE ai_cost_budget_month SET reserved_micro_cny=1000 WHERE scope_id=$1 AND period_key=${MONTH_PERIOD_SQL}`,
      [scopeE],
    );
    const result = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeE, owner, key, 60, 40, 0));
    const month = await readMonth(scopeE);
    const constraint = await pool.query(
      `SELECT count(*)::int AS n FROM pg_constraint
        WHERE conrelid='ai_cost_budget_month'::regclass AND conname='ai_cost_budget_month_check'`,
    );
    const nextReserve = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeE, requestOwner: owner, idempotencyKey: `after-crossing:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    A('ε 月限穿仓：settle(920+100=1020>1000) 成功不拒·overage=true（CHECK DROP 行为级）·约束目录零残留·新 reserve 闸自限 budget_exhausted',
      result.microCny === 100 && result.overage === true
      && month !== undefined && month.reserved === 920 && month.settled === 100
      && Number(constraint.rows[0]?.n) === 0
      && nextReserve.decision === 'budget_exhausted');
  }

  // ── ζ scoped 二次调用幂等回 {同额,同 overage}；同键异信封 reserve → binding_mismatch。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `idempotent:${suffix}`;
    await billedDispatchedReservation(scopeA, key, 100, 40, 40, 40);
    const first = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeA, owner, key, 60, 40, 0));
    const second = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeA, owner, key, 60, 40, 0));
    const driftKey = `envelope-drift:${suffix}`;
    await asPrincipal(pool, owner, async (c) => {
      const r = await reserveAiTextCost(c, {
        scopeId: scopeA, requestOwner: owner, idempotencyKey: driftKey,
        provider, model, region, priceRevision: 'r1', maxInputTokens: 40, maxOutputTokens: 40,
      });
      if (r.decision !== 'reserved') throw new Error(`ag11_fixture_reserve_refused:${driftKey}`);
    });
    const drifted = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeA, requestOwner: owner, idempotencyKey: driftKey,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 41, maxOutputTokens: 40,
    }));
    A('ζ scoped 幂等：二次 settle 回 {100,true} 同额同标·同键异信封(40→41) reserve → binding_mismatch（0083 零放松）',
      first.microCny === 100 && first.overage === true
      && second.microCny === first.microCny && second.overage === first.overage
      && drifted.decision === 'binding_mismatch' && drifted.reservedMicroCny === 0);
  }

  // ── η app_role 对新签名 TABLE 返回 scoped settle 的 EXECUTE 特权（DROP+CREATE 后 ACL 回归锁）。
  {
    const signature = 'ai_cost_settle_text_scoped(text,text,text,integer,integer,integer)';
    const acl = await pool.query(
      `SELECT has_function_privilege('app_role',$1,'EXECUTE') AS app_role_execute,
              has_function_privilege('public',$1,'EXECUTE') AS public_execute,
              to_regprocedure($1) IS NOT NULL AS signature_exists,
              (SELECT count(*)::int FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE p.proname='ai_cost_settle_text_scoped' AND n.nspname='public') AS overloads,
              (SELECT pg_get_function_result(p.oid) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE p.proname='ai_cost_settle_text_scoped' AND n.nspname='public') AS return_shape`,
      [signature],
    );
    const row = acl.rows[0];
    A('η ACL 回归：app_role EXECUTE=true·PUBLIC revoked=false·恰 1 无 overload·返回形 TABLE(micro_cny bigint, overage boolean)',
      row?.app_role_execute === true && row?.public_execute === false
      && row?.signature_exists === true && Number(row?.overloads) === 1
      && String(row?.return_shape) === 'TABLE(micro_cny bigint, overage boolean)');
  }

  // ── ι cached=0 逐位恒等：同 input/output 下新公式值==旧公式值对表（0204 行为保持铁律①）。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `cached-zero-identity:${suffix}`;
    await billedDispatchedReservation(scopeA, key, 100, 40, 40, 40);
    const result = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeA, owner, key, 60, 40, 0));
    const legacyFormula = Math.ceil((60 * RATE) / 1_000_000) + Math.ceil((40 * RATE) / 1_000_000);
    const row = await readReservation(scopeA, key);
    A('ι cached=0 逐位恒等：新公式值==旧公式值对表（60×1+40×1=100）·行态 settled 同全价路径形',
      legacyFormula === 100 && result.microCny === legacyFormula && result.overage === true
      && row?.status === 'settled' && row.settledMicro === 100
      && row.inputActual === 60 && row.outputActual === 40);
  }

  // ── κ 有缓存价分账：r2 revision 携 cached 价 400_000→预留行捕获该价+settle 三段 CEIL 精确对表。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `cached-price:${suffix}`;
    const cachedRate = 400_000;
    await pool.query(
      `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,cached_input_micro_cny_per_million,source_url,effective_at)
       VALUES($1,$2,$3,'r2',$4,$4,$5,'https://example.test/ag11-settle-relax',clock_timestamp())`,
      [provider, model, region, RATE, cachedRate],
    );
    const claim = await asPrincipal(pool, owner, (c) => claimModelInvocation(c, {
      owner, idempotencyKey: key, logicalNodeKey: `proof:ag11:${key}`, requestDigest: digest,
      service: 'proof.ag11_settle_relax', leaseToken: randomUUID(), leaseSeconds: 120,
      costScopeId: scopeA, provider, model, region, priceRevision: 'r2',
      maxInputTokens: 100, maxOutputTokens: 40,
    }));
    if (claim.action !== 'execute') throw new Error(`ag11_fixture_claim_not_executable:${key}:${claim.action}`);
    const reserve = await asPrincipal(pool, owner, async (c) => {
      const r = await reserveAiTextCost(c, {
        scopeId: scopeA, requestOwner: owner, idempotencyKey: key,
        provider, model, region, priceRevision: 'r2', maxInputTokens: 40, maxOutputTokens: 40,
      });
      if (r.decision !== 'reserved') throw new Error(`ag11_fixture_reserve_refused:${key}:${r.decision}`);
      if (!await markModelInvocationDispatched(c, owner, key, claim.leaseToken as string, scopeA)) throw new Error(`ag11_fixture_dispatch_refused:${key}`);
      if (!await markAiCostDispatched(c, scopeA, owner, key)) throw new Error(`ag11_fixture_dispatch_refused:${key}`);
      return r;
    });
    const result = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeA, owner, key, 60, 40, 20));
    const row = await readReservation(scopeA, key);
    const capturedCached = await pool.query(
      'SELECT cached_input_micro_cny_per_million AS c FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2',
      [scopeA, key],
    );
    A('κ 有缓存价分账：预留行捕获 cached 价 400_000（缺口②闭）·settle(60,40,cached 20)=CEIL(40×1)+CEIL(20×0.4)+CEIL(40×1)=88·overage=true',
      reserve.reservedMicroCny === 80 && result.microCny === 88 && result.overage === true
      && Number(capturedCached.rows[0]?.c) === cachedRate
      && row?.status === 'settled' && row.settledMicro === 88 && row.overage === true);
  }

  // ── λ NULL 缓存价回退：r1 cached 价 NULL→cached(20) 部分按 input 价计（铁律②·非 cached 计 0 的 80）。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `cached-null-fallback:${suffix}`;
    await billedDispatchedReservation(scopeA, key, 100, 40, 40, 40);
    const result = await asPrincipal(pool, owner, (c) => settleAiTextCost(c, scopeA, owner, key, 60, 40, 20));
    const row = await readReservation(scopeA, key);
    A('λ NULL 缓存价回退：cached(20) 部分按 input 价计=CEIL(40)+CEIL(20)+CEIL(40)=100（cached 计 0 形会得 80）·overage=true',
      result.microCny === 100 && result.overage === true
      && row?.status === 'settled' && row.settledMicro === 100);
  }

  // ── μ cached>input 拒绝：六参守卫 fail-closed raise 原码·行态零写（savepoint 回滚）。
  {
    __resetAiCostExhaustedCacheForTest();
    const key = `cached-over-input:${suffix}`;
    await billedDispatchedReservation(scopeA, key, 100, 40, 40, 40);
    const raised = await asPrincipal(pool, owner, async (c) => {
      let message: string | null = null;
      try {
        await c.query('SAVEPOINT ag11_cached_raise');
        await settleAiTextCost(c, scopeA, owner, key, 40, 40, 41);
      } catch (error) {
        message = String((error as Error).message);
      } finally {
        await c.query('ROLLBACK TO SAVEPOINT ag11_cached_raise');
      }
      return message !== null && message.includes('ai_cost_cached_exceeds_input');
    });
    const row = await readReservation(scopeA, key);
    A('μ cached(41)>input(40)：raise ai_cost_cached_exceeds_input·行态 dispatching 零写·月行零动',
      raised && row?.status === 'dispatching' && row.settledMicro === null && row.overage === false);
  }

  // ══ 预算排空态决策短窗缓存四臂（零 SQL 短路/TTL 过窗/自愈清键/重放变形钉死）══
  // 计数客户端：包住 asPrincipal 事务客户端，对 query 计数作「短路零 SQL」判别。
  const countingClient = (c: Parameters<typeof reserveAiTextCost>[0], counter: { n: number }) => new Proxy(c, {
    get(target, prop, recv) {
      if (prop === 'query') {
        return (...args: Parameters<typeof target.query>) => { counter.n += 1; return target.query(...args); };
      }
      return Reflect.get(target, prop, recv);
    },
  });

  // ── ν 臂1 排空态第二调用零 SQL：改前（无缓存）第二调用必上锁（计数≥1 红），改后短路零触碰。
  {
    __resetAiCostExhaustedCacheForTest();
    const scopeN = `ag11-cache-n-${suffix}`;
    await seedBudgetPolicy(scopeN, 1_000);
    await billedDispatchedReservation(scopeN, `warm-n:${suffix}`, 10, 10, 10, 10);
    await pool.query(
      `UPDATE ai_cost_budget_month SET reserved_micro_cny=1000 WHERE scope_id=$1 AND period_key=${MONTH_PERIOD_SQL}`,
      [scopeN],
    );
    const first = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeN, requestOwner: owner, idempotencyKey: `exhausted-first:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    const counter = { n: 0 };
    const second = await asPrincipal(pool, owner, (c) => reserveAiTextCost(countingClient(c, counter), {
      scopeId: scopeN, requestOwner: owner, idempotencyKey: `exhausted-second:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    A('ν 排空态第二调用零 SQL 短路：第一调 budget_exhausted(SQL)·第二调同形 {exhausted,0}·query 计数=0（热点行零触碰）',
      first.decision === 'budget_exhausted' && second.decision === 'budget_exhausted'
      && second.reservedMicroCny === 0 && second.priceRevision === undefined && counter.n === 0);
  }

  // ── ξ 臂2 TTL 过窗复查：窗内预算回补仍拒（保守误拒披露面·回补不清键）；复位缝=TTL 过窗后放行。
  {
    __resetAiCostExhaustedCacheForTest();
    const scopeX = `ag11-cache-x-${suffix}`;
    await seedBudgetPolicy(scopeX, 1_000);
    await billedDispatchedReservation(scopeX, `warm-x:${suffix}`, 10, 10, 10, 10);
    await pool.query(
      `UPDATE ai_cost_budget_month SET reserved_micro_cny=1000 WHERE scope_id=$1 AND period_key=${MONTH_PERIOD_SQL}`,
      [scopeX],
    );
    const pinned = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeX, requestOwner: owner, idempotencyKey: `window-pin:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    await pool.query(
      `UPDATE ai_cost_budget_month SET reserved_micro_cny=0 WHERE scope_id=$1 AND period_key=${MONTH_PERIOD_SQL}`,
      [scopeX],
    );
    const inWindow = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeX, requestOwner: owner, idempotencyKey: `in-window:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    __resetAiCostExhaustedCacheForTest();
    const afterWindow = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeX, requestOwner: owner, idempotencyKey: `after-window:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    A('ξ TTL 过窗复查：窗内拒绝入缓存·预算回补后窗内仍拒（≤TTL 保守延迟）·窗外（缝）复查放行 reserved',
      pinned.decision === 'budget_exhausted' && inWindow.decision === 'budget_exhausted'
      && afterWindow.decision === 'reserved');
  }

  // ── ο 臂3 自愈失效：非 exhausted 返回清键 + 绝不缓存授予（同键自愈唯一通道=TTL 过窗/缝）。
  {
    __resetAiCostExhaustedCacheForTest();
    const scopeO = `ag11-cache-o-${suffix}`;
    await seedBudgetPolicy(scopeO, 1_000);
    const granted = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeO, requestOwner: owner, idempotencyKey: `grant:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
    }));
    await pool.query(
      `UPDATE ai_cost_budget_month SET reserved_micro_cny=1000 WHERE scope_id=$1 AND period_key=${MONTH_PERIOD_SQL}`,
      [scopeO],
    );
    const exhausted = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeO, requestOwner: owner, idempotencyKey: `exhausted:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    await pool.query(
      `UPDATE ai_cost_budget_month SET reserved_micro_cny=0 WHERE scope_id=$1 AND period_key=${MONTH_PERIOD_SQL}`,
      [scopeO],
    );
    const pinned = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeO, requestOwner: owner, idempotencyKey: `pinned:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    __resetAiCostExhaustedCacheForTest();
    const healed = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeO, requestOwner: owner, idempotencyKey: `healed:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 10, maxOutputTokens: 10,
    }));
    await pool.query(
      `UPDATE ai_cost_budget_month SET reserved_micro_cny=1000 WHERE scope_id=$1 AND period_key=${MONTH_PERIOD_SQL}`,
      [scopeO],
    );
    const reExhausted = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeO, requestOwner: owner, idempotencyKey: `re-exhausted:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    A('ο 自愈+绝不缓存授予：授予 reserved 不入缓存·exhausted 入缓存·回补窗内仍拒（settle/回补不清键）·缝后非 exhausted 直达 SQL 并清键·再排空后新拒绝来自 SQL（若授予曾入缓存此处必被错误放行）',
      granted.decision === 'reserved' && exhausted.decision === 'budget_exhausted'
      && pinned.decision === 'budget_exhausted' && healed.decision === 'reserved'
      && reExhausted.decision === 'budget_exhausted');
  }

  // ── π 臂4 重放变形行为钉死：窗内 held/binding_mismatch 全族被遮蔽为 budget_exhausted；
  //     窗过期（缝）重放得真值 held（零双重计费）/真值终态 fail（binding_mismatch）。
  {
    __resetAiCostExhaustedCacheForTest();
    const scopeP = `ag11-cache-p-${suffix}`;
    await seedBudgetPolicy(scopeP, 10_000_000);
    const keyR = `replay:${suffix}`;
    // 未派发 reserved 行（0204:113：status='reserved' 重放真值=held；dispatching 重放=unknown）。
    await asPrincipal(pool, owner, async (c) => {
      const r = await reserveAiTextCost(c, {
        scopeId: scopeP, requestOwner: owner, idempotencyKey: keyR,
        provider, model, region, priceRevision: 'r1', maxInputTokens: 40, maxOutputTokens: 40,
      });
      if (r.decision !== 'reserved') throw new Error(`ag11_fixture_reserve_refused:${keyR}:${r.decision}`);
    });
    const rowBefore = await readReservation(scopeP, keyR);
    await pool.query(
      `UPDATE ai_cost_budget_month SET reserved_micro_cny=10000000 WHERE scope_id=$1 AND period_key=${MONTH_PERIOD_SQL}`,
      [scopeP],
    );
    const seedExhausted = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeP, requestOwner: owner, idempotencyKey: `seed-exhausted:${suffix}`,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 1, maxOutputTokens: 1,
    }));
    const counterHeld = { n: 0 };
    const maskedHeld = await asPrincipal(pool, owner, (c) => reserveAiTextCost(countingClient(c, counterHeld), {
      scopeId: scopeP, requestOwner: owner, idempotencyKey: keyR,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 40, maxOutputTokens: 40,
    }));
    const counterMismatch = { n: 0 };
    const maskedMismatch = await asPrincipal(pool, owner, (c) => reserveAiTextCost(countingClient(c, counterMismatch), {
      scopeId: scopeP, requestOwner: owner, idempotencyKey: keyR,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 41, maxOutputTokens: 40,
    }));
    __resetAiCostExhaustedCacheForTest();
    const trueHeld = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeP, requestOwner: owner, idempotencyKey: keyR,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 40, maxOutputTokens: 40,
    }));
    const trueMismatch = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: scopeP, requestOwner: owner, idempotencyKey: keyR,
      provider, model, region, priceRevision: 'r1', maxInputTokens: 41, maxOutputTokens: 40,
    }));
    const rowAfter = await readReservation(scopeP, keyR);
    A('π 重放变形窗内遮蔽/窗外真值：已 reserved 键窗内重放(同信封/异信封)均被遮蔽为 {exhausted,0} 零 SQL·窗外重放得真值 held·异信封得真值 binding_mismatch 终态 fail·预留行金额/状态零双重计费',
      seedExhausted.decision === 'budget_exhausted'
      && maskedHeld.decision === 'budget_exhausted' && maskedHeld.reservedMicroCny === 0 && counterHeld.n === 0
      && maskedMismatch.decision === 'budget_exhausted' && maskedMismatch.reservedMicroCny === 0 && counterMismatch.n === 0
      && trueHeld.decision === 'held'
      && trueMismatch.decision === 'binding_mismatch' && trueMismatch.reservedMicroCny === 0
      && rowBefore !== undefined && rowAfter !== undefined
      && rowBefore.status === 'reserved' && rowAfter.status === 'reserved'
      && rowBefore.reservedMicro === 80 && rowAfter.reservedMicro === 80
      && rowBefore.inputReserved === 40 && rowAfter.inputReserved === 40);
  }

  console.log(failures === 0
    ? '\n✓ AG-11 settle 放宽体十二臂+决策缓存四臂行为级补证全部通过（0188 settle/body+scoped TABLE+月限 CHECK 松绑+0204 cached 价列六参结算+排空态短窗缓存）'
    : `\n✗ ${failures} 臂失败`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'ag11_settle_relax_proof_failed');
  await pool.end();
  process.exit(1);
});
