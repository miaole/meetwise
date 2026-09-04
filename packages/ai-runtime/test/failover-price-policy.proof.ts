/**
 * MODEL-OP-00 剩余子项「backup 价格 policy 语义」的对抗式证明。
 *
 * 出处（不可自由发挥，逐条可追溯）：
 *  - ai-docs/delivery/production-readiness-remediation-register.md:101（MODEL-OP-00）
 *  - ai-docs/delivery/execution-master-checklist.md:202（「不同价格 policy 的 backup 只能按
 *    明确 pre-dispatch 选择语义运行，已派发 unknown 不自动重试」）
 *
 * 被证明/证伪的四条语义：
 *  (a) pre-dispatch 选择：主端点 prepare 返回 not-ready（如熔断打开）时，选路必须在任何派发
 *      之前选中 backup，且绑定的 cost policy 是 backup 的（可与主端点不同 priceRevision/
 *      model/scopeId）。
 *  (b) 不同 price policy 正确绑定：backup 的 priceRevision 不被主端点静默替换，最终落到
 *      费用账本 ai_cost_reservation 的价格 revision 必须是 backup 的。
 *  (c) 已派发 unknown 不自动重试：主端点已派发后返回 unknown（超时/5xx），同一幂等键绝不
 *      再对 backup 发起第二次 provider 请求——用 client.complete 实际调用次数计数断言。
 *  (d) 半开 route-retry 的 cost 一致性护栏：晚到的 route 变化若切换到不同 cost policy，被
 *      model_failover_cost_policy_mismatch 拒绝（invoke.ts 约 423-429 行）。
 *
 * 两层证明：
 *  - 纯 failover 选路层（无 DB）：直接调 failoverModel.prepare/complete，验「派发前即选定
 *    backup 并绑定其 policy」与「unknown 后不向 backup 重发」的机制。
 *  - 隔离 PostgreSQL 账本层：真落库验 (b) 的 price revision、(c) 的 durable unknown 冻结
 *    与 (d) 的 claim=failed / 零预留。
 *
 * 安全性：隔离目标必须由 assertIsolatedTestTarget 证明（容器 nonce），否则在触碰任何
 * 表之前 fail-closed——绝不把 01_schema.sql 的 DROP 施加到开发/生产库。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { assertIsolatedTestTarget, createPool } from '@meetwise/db';
import {
  failoverModel, invoke, modelFor,
  type Model, type ModelClient, type ModelCostPolicy, type ModelResult,
} from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

// 每次运行使用唯一后缀，避免与同库其它 proof 的 owner/scope 冲突（同 model-op00 手法）。
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWNER = `failover-price-${suffix}`;
const PRIMARY_SCOPE = `scope-primary-${suffix}`;
const BACKUP_SCOPE = `scope-backup-${suffix}`;
const SAME_SCOPE = `scope-same-${suffix}`;      // (d) 对照：半开重选仍同 policy
const MISMATCH_SCOPE = `scope-mismatch-${suffix}`; // (d)：半开重选切换不同 policy

// 主/备两套真实差异化的 price policy：provider/model/scopeId/priceRevision 全不同，
// 以便在账本层无歧义地分辨「到底绑了谁」。
const primaryPolicy: ModelCostPolicy = {
  scopeId: PRIMARY_SCOPE, provider: 'p-primary', model: 'm-primary', region: 'cn-proof',
  priceRevision: 'primary-r1', maxInputTokens: 1000, maxOutputTokens: 500,
};
const backupPolicy: ModelCostPolicy = {
  scopeId: BACKUP_SCOPE, provider: 'p-backup', model: 'm-backup', region: 'cn-proof',
  priceRevision: 'backup-r9', maxInputTokens: 1000, maxOutputTokens: 500,
};

const Schema = z.object({ answer: z.string().min(1) });
const OK: ModelResult = { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 10, outputTokens: 20 } };
const UNKNOWN: ModelResult = { ok: false, kind: 'transient', externalOutcome: 'unknown' };
const REQ = { service: 'proof.failover-price', system: 'trusted', userData: 'fixture' };

async function main() {
  // 在触碰任何表之前证明目标容器是隔离的一次性库（否则抛 destructive_proof_requires_e2e_isolated）。
  await assertIsolatedTestTarget(pool);

  // ────────────────────────────────────────────────────────────────────────────
  // 第一层：纯 failover 选路（无 DB）。这些断言不依赖账本，直接演练 failoverModel 的选择语义。
  // ────────────────────────────────────────────────────────────────────────────

  // (a)+(b)：主端点 prepare 返回 not-ready（熔断打开），prepare 必须在零派发下选定 backup
  // 并绑定其 cost policy。
  {
    const primaryCalls = { n: 0 };
    const backupCalls = { n: 0 };
    const primary: ModelClient = {
      costPolicy: primaryPolicy,
      async complete() { primaryCalls.n++; return OK; },
      prepare() { return { ready: false as const, error: 'model_circuit_open' }; },
    };
    // backup 无自定义 prepare → failoverModel 的 fallback 会取 backup.costPolicy 作为绑定 cost。
    const backup: ModelClient = {
      costPolicy: backupPolicy,
      async complete() { backupCalls.n++; return OK; },
    };
    const chain = failoverModel([primary, backup]);
    const plan = await chain.prepare!(REQ, 1);
    A('(a) 主端点 not-ready 时 prepare 在零派发下选定 backup', plan.ready === true && primaryCalls.n === 0 && backupCalls.n === 0);
    A('(b) 选定 plan 绑定的 cost policy 是 backup 的（priceRevision/scopeId/provider/model 均非主端点）',
      plan.ready === true
        && plan.cost?.priceRevision === backupPolicy.priceRevision
        && plan.cost?.scopeId === backupPolicy.scopeId
        && plan.cost?.provider === backupPolicy.provider
        && plan.cost?.model === backupPolicy.model
        && plan.cost?.priceRevision !== primaryPolicy.priceRevision);
  }

  // (c) 机制层：主端点 ready 且已派发返回 unknown 后，failoverModel.complete 不向 backup 重发。
  {
    const primaryCalls = { n: 0 };
    const backupCalls = { n: 0 };
    const primary: ModelClient = {
      costPolicy: primaryPolicy,
      async complete() { primaryCalls.n++; return UNKNOWN; },
    };
    const backup: ModelClient = {
      costPolicy: backupPolicy,
      async complete() { backupCalls.n++; return OK; },
    };
    const chain = failoverModel([primary, backup]);
    const r = await chain.complete(REQ, 0);
    A('(c) 主端点已派发返回 unknown → backup complete 调用次数为 0（不换端点重发）',
      r.ok === false && r.externalOutcome === 'unknown' && primaryCalls.n === 1 && backupCalls.n === 0);
  }

  // (e) prepare 抛异常(非返回 not-ready)也降级到 backup:纯预派发,抛异常无计费歧义,语义与 not-ready 对齐(审计 M6 反例)。
  {
    const primaryCalls = { n: 0 };
    const backupCalls = { n: 0 };
    const throwingPrimary: ModelClient = {
      costPolicy: primaryPolicy,
      async complete() { primaryCalls.n++; return OK; },
      prepare() { throw new Error('model_prepare_internal_error'); },
    };
    const backup: ModelClient = {
      costPolicy: backupPolicy,
      async complete() { backupCalls.n++; return OK; },
    };
    const chain = failoverModel([throwingPrimary, backup]);
    const plan = await chain.prepare!(REQ, 1);
    A('(e) 主端点 prepare 抛异常 → 仍降级到 backup（与 not-ready 语义对齐，零派发）',
      plan.ready === true && plan.cost?.provider === backupPolicy.provider && primaryCalls.n === 0 && backupCalls.n === 0);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 隔离账本 bootstrap（同 model-cost-governance.proof.ts：01_schema + ai 成本/调用迁移）。
  // ────────────────────────────────────────────────────────────────────────────
  await pool.query(sql('../../db/sql/01_schema.sql'));
  for (const f of ['0033_ai_cost_governance.sql', '0035_ai_cost_principal_scope.sql', '0036_ai_text_cost_governance.sql', '0037_ai_model_invocation_durable_claim.sql', '0056_model_invocation_reconcile.sql', '0057_model_invocation_cost_scope.sql', '0083_ai_text_cost_price_revision_binding.sql', '0085_ai_model_logical_node_dispatch_slot.sql', '0088_ai_model_invocation_controlled_state_machine.sql', '0119_usage_reconciliation_wiring.sql', '0130_model_invocation_same_key_claim_join.sql']) {
    await pool.query(sql(`../../db/migrations/${f}`));
  }

  // 清理 + 播种（唯一后缀，只碰自己名下数据；费用账本 FK 顺序：reservation → budget_month → budget_policy）。
  await pool.query(`DELETE FROM ai_model_invocation WHERE owner_user_id=$1`, [OWNER]);
  for (const scope of [PRIMARY_SCOPE, BACKUP_SCOPE, SAME_SCOPE, MISMATCH_SCOPE]) {
    await pool.query(`DELETE FROM ai_cost_reservation WHERE scope_id=$1`, [scope]);
    await pool.query(`DELETE FROM ai_cost_budget_month WHERE scope_id=$1`, [scope]);
    await pool.query(`DELETE FROM ai_cost_budget_policy WHERE scope_id=$1`, [scope]);
  }
  await pool.query(`DELETE FROM ai_cost_price_book WHERE provider=$1 AND model=$2 AND region=$3`, ['p-primary', 'm-primary', 'cn-proof']);
  await pool.query(`DELETE FROM ai_cost_price_book WHERE provider=$1 AND model=$2 AND region=$3`, ['p-backup', 'm-backup', 'cn-proof']);
  // 价格书（provider/model/region/revision 主键）与预算策略：主端点、backup、以及 (d) 对照用的同一 scope 各一份。
  for (const [provider, model, revision] of [['p-primary', 'm-primary', 'primary-r1'], ['p-backup', 'm-backup', 'backup-r9'], ['p-primary', 'm-primary', 'route-same']] as const) {
    await pool.query(
      `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
       VALUES($1,$2,'cn-proof',$3,1000000,2000000,'https://example.test/failover-price',clock_timestamp())`,
      [provider, model, revision],
    );
  }
  for (const scope of [PRIMARY_SCOPE, BACKUP_SCOPE, SAME_SCOPE]) {
    await pool.query(`INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)`, [scope]);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 第二层：隔离账本（真落库）。invoke 全链路跑一遍 claim → reserve → dispatch → settle/unknown。
  // ────────────────────────────────────────────────────────────────────────────

  // (a)+(b) 落库：主端点不可用时选 backup，backup 派发恰一次、主端点零派发，
  // 且 ai_cost_reservation 的 provider/model/price_revision 绑定 backup（非主端点）。
  {
    const daPrimaryCalls = { n: 0 };
    const daBackupCalls = { n: 0 };
    const daPrimary: ModelClient = {
      costPolicy: primaryPolicy,
      async complete() { daPrimaryCalls.n++; return OK; },
      prepare() { return { ready: false as const, error: 'model_circuit_open' }; },
    };
    const daBackup: ModelClient = {
      costPolicy: backupPolicy,
      async complete() { daBackupCalls.n++; return OK; },
    };
    const daChain = failoverModel([daPrimary, daBackup]);
    const daKey = `failover-backup:${suffix}`;
    const daResult = await invoke({
      idempotencyKey: daKey, schema: Schema, businessValidate: () => null,
      model: modelFor(daChain, REQ),
    }, pool, OWNER);
    const daReservation = await pool.query(
      `SELECT provider,model,region,price_revision,status FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2`,
      [BACKUP_SCOPE, daKey],
    );
    A('(a)(b) 主端点不可用时选 backup：backup 派发恰一次、主端点零派发，账本绑定 backup 的 provider/model/price_revision',
      'value' in daResult && daBackupCalls.n === 1 && daPrimaryCalls.n === 0
        && daReservation.rows[0]?.provider === 'p-backup'
        && daReservation.rows[0]?.model === 'm-backup'
        && daReservation.rows[0]?.price_revision === 'backup-r9'
        && daReservation.rows[0]?.status === 'settled');
  }

  // (c) 落库：主端点 ready 且已派发返回 unknown → 冻结 durable unknown；重放同一幂等键
  // 零第二次外呼，backup 始终零外呼。
  {
    const dcPrimaryCalls = { n: 0 };
    const dcBackupCalls = { n: 0 };
    const dcPrimary: ModelClient = {
      costPolicy: primaryPolicy,
      async complete() { dcPrimaryCalls.n++; return UNKNOWN; },
    };
    const dcBackup: ModelClient = {
      costPolicy: backupPolicy,
      async complete() { dcBackupCalls.n++; return OK; },
    };
    const dcChain = failoverModel([dcPrimary, dcBackup]);
    const dcSpec = {
      idempotencyKey: `failover-unknown:${suffix}`, schema: Schema, businessValidate: () => null,
      model: modelFor(dcChain, REQ),
    };
    const dcFirst = await invoke(dcSpec, pool, OWNER);
    const dcSecond = await invoke(dcSpec, pool, OWNER);
    const dcReservation = await pool.query(
      `SELECT status FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2`,
      [PRIMARY_SCOPE, `failover-unknown:${suffix}`],
    );
    A('(c) 已派发 unknown 冻结：主端点恰一次外呼、backup 零外呼，同键重放零第二次外呼',
      'error' in dcFirst && dcFirst.error === 'external_outcome_unknown'
        && 'error' in dcSecond && dcSecond.error === 'external_outcome_unknown'
        && dcPrimaryCalls.n === 1 && dcBackupCalls.n === 0
        && dcReservation.rows[0]?.status === 'unknown');
  }

  // (d) 护栏：第一次 prepare 绑定 policyA，admit 抛 model_circuit_half_open 触发 route-retry；
  // 第二次 prepare 绑定 policyB（priceRevision 不同）→ 被 sameCostPolicyBinding 拒绝。
  // 注意：该拒绝发生在 durable claim 之后、dispatch/reserve 之前（invoke.ts 393-440 行）。
  {
    let mismatchPrepareCalls = 0;
    let mismatchProviderCalls = 0;
    const mismatchPolicyA: ModelCostPolicy = { ...primaryPolicy, scopeId: MISMATCH_SCOPE, priceRevision: 'route-r1' };
    const mismatchPolicyB: ModelCostPolicy = { ...primaryPolicy, scopeId: MISMATCH_SCOPE, priceRevision: 'route-r2' };
    const mismatchCall = async (): Promise<ModelResult> => { mismatchProviderCalls++; return OK; };
    const mismatchModel: Model = {
      requestDigest: 'e'.repeat(64),
      call: mismatchCall,
      prepare() {
        mismatchPrepareCalls++;
        return {
          ready: true as const,
          cost: mismatchPrepareCalls === 1 ? mismatchPolicyA : mismatchPolicyB,
          admit: async () => { throw new Error('model_circuit_half_open'); },
          execute: () => mismatchCall(),
        };
      },
    };
    const mmKey = `route-mismatch:${suffix}`;
    const mmResult = await invoke({
      idempotencyKey: mmKey, schema: Schema, businessValidate: () => null, model: mismatchModel,
    }, pool, OWNER);
    const mmInvocation = await pool.query(
      `SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`,
      [OWNER, mmKey],
    );
    const mmReservation = await pool.query(
      `SELECT count(*)::int n FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2`,
      [MISMATCH_SCOPE, mmKey],
    );
    A('(d) 晚到 route 变化切换到不同 cost policy 被拒：零外呼、durable claim=failed、零费用预留，且暴露具体错误码（不吞成通用 admission_failed）',
      'error' in mmResult && mmResult.error === 'model_failover_cost_policy_mismatch'
        && mismatchProviderCalls === 0
        && mismatchPrepareCalls === 2
        && mmInvocation.rows[0]?.status === 'failed'
        && mmInvocation.rows[0]?.error_code === 'model_failover_cost_policy_mismatch'
        && Number(mmReservation.rows[0]?.n) === 0);
  }

  // (d·对照) 半开重选仍绑定同一 cost policy 时，route-retry 必须成功派发恰一次——
  // 证明上面的拒绝是「cost policy 漂移」触发的护栏，而非「任何 route-retry 一律失败」。
  {
    let samePrepareCalls = 0;
    let sameAdmitCalls = 0;
    let sameProviderCalls = 0;
    const samePolicy: ModelCostPolicy = { ...primaryPolicy, scopeId: SAME_SCOPE, priceRevision: 'route-same' };
    const sameCall = async (): Promise<ModelResult> => { sameProviderCalls++; return OK; };
    const sameRetryModel: Model = {
      requestDigest: 'f'.repeat(64),
      call: sameCall,
      prepare() {
        samePrepareCalls++;
        return {
          ready: true as const,
          cost: samePolicy,
          admit: async () => {
            sameAdmitCalls++;
            if (sameAdmitCalls === 1) throw new Error('model_circuit_half_open');
            return { release: () => {} };
          },
          execute: () => sameCall(),
        };
      },
    };
    const sameResult = await invoke({
      idempotencyKey: `route-same:${suffix}`, schema: Schema, businessValidate: () => null, model: sameRetryModel,
    }, pool, OWNER);
    A('(d·对照) 半开重选仍同一 cost policy 时 route-retry 成功派发恰一次',
      'value' in sameResult && sameProviderCalls === 1 && samePrepareCalls === 2 && sameAdmitCalls === 2);
  }

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ failover 价格 policy 语义全部通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'failover_price_policy_proof_failed');
  await pool.end();
  process.exit(1);
});
