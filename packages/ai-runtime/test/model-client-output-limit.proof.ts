/**
 * MODEL-OP-00 transport contract: an approved text cost policy must make its
 * output bound visible to the provider request.  This is deliberately a fake
 * transport proof: it cannot spend a provider Key or turn the direct adapter
 * into the future operation registry.
 */
import { invoke, modelFor, openAICompatibleClient, planContextBudget, type ModelCostPolicy } from '../src/index.ts';
import type { DbPool } from '@meetwise/db';
import { z } from 'zod';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

// BAILIAN-04: fake transport 注入需测试专用 override 缝（NODE_ENV=test + MODEL_TEST_TRANSPORT_OVERRIDES=1）。
process.env.NODE_ENV = 'test';
process.env.MODEL_TEST_TRANSPORT_OVERRIDES = '1';

const policy: ModelCostPolicy = {
  scopeId: 'model-client-output-cap-proof',
  provider: 'proof-provider',
  model: 'proof-model',
  region: 'cn-proof',
  priceRevision: 'proof-r1',
  maxInputTokens: 1_000,
  maxOutputTokens: 73,
  contextWindowTokens: 4_096,
  contextEstimator: 'utf8-bytes-v1',
  contextSafetyMarginTokens: 128,
};

async function main() {
  const originalFetch = globalThis.fetch;
  const requestBodies: Array<Record<string, unknown>> = [];
  try {
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      requestBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ status: 'ok' }) } }],
        usage: { prompt_tokens: 3, completion_tokens: 2 },
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    const mutablePolicy = { ...policy };
    const bounded = openAICompatibleClient({
      baseUrl: 'https://model.invalid', apiKey: 'test-only', model: policy.model, costPolicy: mutablePolicy,
    });
    mutablePolicy.maxOutputTokens = 999;
    const boundedResult = await bounded.complete({ service: 'proof.output-bound', system: 'trusted', userData: 'safe fixture' }, 1);
    A('approved cost policy produces a successful structured response', boundedResult.ok);
    A('approved maxOutputTokens is transmitted as max_tokens', requestBodies[0]?.max_tokens === policy.maxOutputTokens);
    A('post-construction mutation cannot desynchronize provider cap and ledger policy', bounded.costPolicy?.maxOutputTokens === policy.maxOutputTokens);
    A('selected provider model is preserved', requestBodies[0]?.model === policy.model);
    const nextPriceRevision = openAICompatibleClient({
      baseUrl: 'https://model.invalid', apiKey: 'test-only', model: policy.model,
      costPolicy: { ...policy, priceRevision: 'proof-r2' },
    });
    const sameRequest = { service: 'proof.price-binding', system: 'trusted', userData: 'safe fixture' };
    A('模型请求摘要绑定不可变价格 revision，配置滚动后不得复用旧结果',
      modelFor(bounded, sameRequest).requestDigest !== modelFor(nextPriceRevision, sameRequest).requestDigest);

    const legacy = openAICompatibleClient({ baseUrl: 'https://model.invalid', apiKey: 'test-only', model: 'legacy-proof' });
    await legacy.complete({ service: 'proof.legacy', system: 'trusted', userData: 'safe fixture' }, 1);
    A('caller without an approved policy does not receive an invented output bound', !Object.hasOwn(requestBodies[1] ?? {}, 'max_tokens'));

    const originalNodeEnv = process.env.NODE_ENV;
    const originalEnforcement = process.env.MODEL_COST_ENFORCEMENT;
    process.env.NODE_ENV = 'production';
    process.env.MODEL_COST_ENFORCEMENT = 'enforce';
    // BAILIAN-04: 生产态不得注入 cfg.baseUrl/apiKey（会被 rejectTextTransportOverride 拒绝）。
    // 这里故意不带 endpoint/key，只验证「生产/强制计费下未绑定策略的直发客户端在派发前被拒」。
    const unboundProductionClient = openAICompatibleClient({ model: 'unbound-production-proof' });
    const unboundPlan = await unboundProductionClient.prepare?.({ service: 'proof.unbound-production', system: 'trusted', userData: 'safe fixture' }, 1);
    const unboundResult = await unboundProductionClient.complete({ service: 'proof.unbound-production', system: 'trusted', userData: 'safe fixture' }, 1);
    A('production/enforce rejects an unbound direct client before transport', unboundPlan?.ready === false
      && unboundPlan.error === 'model_operation_policy_required' && !unboundResult.ok
      && unboundResult.externalOutcome === 'known_not_executed' && requestBodies.length === 2);
    const noNodePool = new Proxy({}, {
      get() { throw new Error('logical_node_key_must_reject_before_durable_claim'); },
    }) as DbPool;
    const omittedNodeKey = await invoke({
      idempotencyKey: 'production-logical-node-key-required',
      schema: z.object({ status: z.string() }),
      businessValidate: () => null,
      model: modelFor(unboundProductionClient, { service: 'proof.unbound-production', system: 'trusted', userData: 'safe fixture' }),
    }, noNodePool, 'proof-owner');
    A('production/enforce rejects an omitted logical node key before any durable claim',
      'error' in omittedNodeKey && omittedNodeKey.error === 'model_logical_node_key_required' && requestBodies.length === 2);
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalNodeEnv;
    if (originalEnforcement === undefined) delete process.env.MODEL_COST_ENFORCEMENT; else process.env.MODEL_COST_ENFORCEMENT = originalEnforcement;

    let invalidRejected = false;
    try {
      openAICompatibleClient({
        baseUrl: 'https://model.invalid', apiKey: 'test-only', costPolicy: { ...policy, maxOutputTokens: 0 },
      });
    } catch (error) {
      invalidRejected = error instanceof Error && error.message === 'model_output_token_limit_invalid';
    }
    A('invalid configured output limit rejects before transport', invalidRejected && requestBodies.length === 2);

    let mismatchRejected = false;
    try {
      openAICompatibleClient({
        baseUrl: 'https://model.invalid', apiKey: 'test-only', model: 'different-model', costPolicy: policy,
      });
    } catch (error) {
      mismatchRejected = error instanceof Error && error.message === 'model_cost_policy_model_mismatch';
    }
    A('model and billing policy mismatch rejects before transport', mismatchRejected && requestBodies.length === 2);

    const noWindow = openAICompatibleClient({
      baseUrl: 'https://model.invalid', apiKey: 'test-only', model: policy.model,
      costPolicy: { ...policy, contextWindowTokens: undefined },
    });
    const missingWindow = await noWindow.prepare?.({ service: 'proof.no-window', system: 'trusted', userData: 'safe fixture' }, 1);
    A('billable client without an approved context window rejects before transport', missingWindow?.ready === false && missingWindow.error === 'model_context_policy_invalid' && requestBodies.length === 2);

    const overBudget = openAICompatibleClient({
      baseUrl: 'https://model.invalid', apiKey: 'test-only', model: policy.model,
      costPolicy: { ...policy, maxInputTokens: 80, contextWindowTokens: 512, contextSafetyMarginTokens: 64 },
    });
    const rejectedPlan = await overBudget.prepare?.({ service: 'proof.over-budget', system: 'trusted system'.repeat(30), userData: 'safe fixture' }, 1);
    const directRejected = await overBudget.complete({ service: 'proof.over-budget', system: 'trusted system'.repeat(30), userData: 'safe fixture' }, 1);
    A('context overflow rejects before transport for both invoke prepare and direct adapter use', rejectedPlan?.ready === false
      && rejectedPlan.error === 'model_context_budget_exceeded' && !directRejected.ok
      && directRejected.externalOutcome === 'known_not_executed' && requestBodies.length === 2);

    const imageWithoutReserve = openAICompatibleClient({
      baseUrl: 'https://model.invalid', apiKey: 'test-only', model: policy.model, costPolicy: policy,
    });
    const imagePlan = await imageWithoutReserve.prepare?.({ service: 'proof.image', system: 'trusted', userData: 'safe fixture', images: ['https://image.invalid/test.png'] }, 1);
    A('billable image request without a declared image token reserve rejects before transport', imagePlan?.ready === false
      && imagePlan.error === 'model_context_image_reserve_missing' && requestBodies.length === 2);

    const planned = planContextBudget({ service: 'proof.breakdown', system: 'system envelope', userData: '用户内容' }, policy);
    A('context plan records an explicit bounded component total', planned.ok
      && planned.plan.inputTokens === planned.plan.systemTokens + planned.plan.userDataTokens + planned.plan.ragTokens
        + planned.plan.imageDescriptorTokens + planned.plan.imageReserveTokens + planned.plan.responseFormatReserveTokens
      && planned.plan.ragTokens === 0 && planned.plan.toolReserveTokens === 0
      && planned.plan.inputTokens <= planned.plan.maxInputTokens);

    const forbiddenPool = new Proxy({}, {
      get() { throw new Error('context_budget_must_reject_before_durable_claim'); },
    }) as DbPool;
    const invokeOverBudget = await invoke({
      idempotencyKey: 'model-context-budget-preflight',
      schema: z.object({ status: z.string() }),
      businessValidate: () => null,
      model: modelFor(overBudget, { service: 'proof.over-budget-invoke', system: 'trusted system'.repeat(30), userData: 'safe fixture' }),
    }, forbiddenPool, 'proof-owner');
    A('invoke rejects an over-window prepared request before durable claim or reservation', 'error' in invokeOverBudget
      && invokeOverBudget.error === 'model_context_budget_exceeded' && requestBodies.length === 2);

    const isolationEnforcement = process.env.MODEL_COST_ENFORCEMENT;
    process.env.MODEL_COST_ENFORCEMENT = 'enforce';
    try {
      const isolatedObserve = openAICompatibleClient({
        baseUrl: 'https://model.invalid', apiKey: 'test-only', model: 'isolated-observe',
        env: { NODE_ENV: 'test', MODEL_COST_ENFORCEMENT: 'observe' },
      });
      const isolatedPlan = await isolatedObserve.prepare?.({ service: 'proof.isolated-observe', system: 'trusted', userData: 'safe fixture' }, 1);
      const isolatedResult = await isolatedObserve.complete({ service: 'proof.isolated-observe', system: 'trusted', userData: 'safe fixture' }, 1);
      A('cfg.env observe still reaches transport when process.env MODEL_COST_ENFORCEMENT=enforce',
        isolatedPlan?.ready === true && isolatedResult.ok === true && requestBodies.length === 3);

      const omittedSnapshot = openAICompatibleClient({
        baseUrl: 'https://model.invalid', apiKey: 'test-only', model: 'omitted-snapshot',
      });
      const omittedPlan = await omittedSnapshot.prepare?.({ service: 'proof.omitted-snapshot', system: 'trusted', userData: 'safe fixture' }, 1);
      const omittedResult = await omittedSnapshot.complete({ service: 'proof.omitted-snapshot', system: 'trusted', userData: 'safe fixture' }, 1);
      A('omitting cfg.env still honors process.env enforce (production fence unchanged)',
        omittedPlan?.ready === false && omittedPlan?.error === 'model_operation_policy_required'
        && omittedResult.ok === false && omittedResult.externalOutcome === 'known_not_executed'
        && requestBodies.length === 3);

      const partialEnv = openAICompatibleClient({
        baseUrl: 'https://model.invalid', apiKey: 'test-only', model: 'partial-env',
        env: { PROOF_NON_FENCE_KEY: '1' },
      });
      const partialPlan = await partialEnv.prepare?.({ service: 'proof.partial-env', system: 'trusted', userData: 'safe fixture' }, 1);
      const partialResult = await partialEnv.complete({ service: 'proof.partial-env', system: 'trusted', userData: 'safe fixture' }, 1);
      A('partial cfg.env without fence keys inherits process.env enforce',
        partialPlan?.ready === false && partialPlan?.error === 'model_operation_policy_required'
        && partialResult.ok === false && partialResult.externalOutcome === 'known_not_executed'
        && requestBodies.length === 3);

      const blankFence = openAICompatibleClient({
        baseUrl: 'https://model.invalid', apiKey: 'test-only', model: 'blank-fence',
        env: { MODEL_COST_ENFORCEMENT: undefined, NODE_ENV: '', PROOF_NON_FENCE_KEY: '1' },
      });
      const blankPlan = await blankFence.prepare?.({ service: 'proof.blank-fence', system: 'trusted', userData: 'safe fixture' }, 1);
      const blankResult = await blankFence.complete({ service: 'proof.blank-fence', system: 'trusted', userData: 'safe fixture' }, 1);
      A('undefined/blank fence keys in cfg.env cannot strip process.env enforce',
        blankPlan?.ready === false && blankPlan?.error === 'model_operation_policy_required'
        && blankResult.ok === false && blankResult.externalOutcome === 'known_not_executed'
        && requestBodies.length === 3);

      const previousEnforcement = process.env.MODEL_COST_ENFORCEMENT;
      process.env.MODEL_COST_ENFORCEMENT = 'observe';
      try {
        const enforceSnapshot = openAICompatibleClient({
          baseUrl: 'https://model.invalid', apiKey: 'test-only', model: 'enforce-snapshot',
          env: { NODE_ENV: 'test', MODEL_COST_ENFORCEMENT: 'enforce' },
        });
        const enforcePlan = await enforceSnapshot.prepare?.({ service: 'proof.enforce-snapshot', system: 'trusted', userData: 'safe fixture' }, 1);
        const enforceResult = await enforceSnapshot.complete({ service: 'proof.enforce-snapshot', system: 'trusted', userData: 'safe fixture' }, 1);
        A('cfg.env enforce still refuses an unbound client when process.env is observe',
          enforcePlan?.ready === false && enforcePlan?.error === 'model_operation_policy_required'
          && enforceResult.ok === false && enforceResult.externalOutcome === 'known_not_executed'
          && requestBodies.length === 3);
      } finally {
        if (previousEnforcement === undefined) delete process.env.MODEL_COST_ENFORCEMENT;
        else process.env.MODEL_COST_ENFORCEMENT = previousEnforcement;
      }
    } finally {
      if (isolationEnforcement === undefined) delete process.env.MODEL_COST_ENFORCEMENT;
      else process.env.MODEL_COST_ENFORCEMENT = isolationEnforcement;
    }

    const isolationNodeEnv = process.env.NODE_ENV;
    const isolationEnforce2 = process.env.MODEL_COST_ENFORCEMENT;
    process.env.NODE_ENV = 'production';
    delete process.env.MODEL_COST_ENFORCEMENT;
    try {
      const productionOmit = openAICompatibleClient({ model: 'production-omit' });
      const productionOmitPlan = await productionOmit.prepare?.({ service: 'proof.production-omit', system: 'trusted', userData: 'safe fixture' }, 1);
      const productionOmitResult = await productionOmit.complete({ service: 'proof.production-omit', system: 'trusted', userData: 'safe fixture' }, 1);
      A('omitting cfg.env still honors process.env NODE_ENV=production',
        productionOmitPlan?.ready === false && productionOmitPlan?.error === 'model_operation_policy_required'
        && productionOmitResult.ok === false && productionOmitResult.externalOutcome === 'known_not_executed'
        && requestBodies.length === 3);

      const observeOnly = openAICompatibleClient({
        model: 'observe-only-overlay',
        env: { MODEL_COST_ENFORCEMENT: 'observe' },
      });
      const observeOnlyPlan = await observeOnly.prepare?.({ service: 'proof.observe-only', system: 'trusted', userData: 'safe fixture' }, 1);
      const observeOnlyResult = await observeOnly.complete({ service: 'proof.observe-only', system: 'trusted', userData: 'safe fixture' }, 1);
      A('cfg.env observe without NODE_ENV cannot strip process.env production',
        observeOnlyPlan?.ready === false && observeOnlyPlan?.error === 'model_operation_policy_required'
        && observeOnlyResult.ok === false && observeOnlyResult.externalOutcome === 'known_not_executed'
        && requestBodies.length === 3);
    } finally {
      if (isolationNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = isolationNodeEnv;
      if (isolationEnforce2 === undefined) delete process.env.MODEL_COST_ENFORCEMENT; else process.env.MODEL_COST_ENFORCEMENT = isolationEnforce2;
    }
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log(`\n${failures === 0 ? '✓ text output limit transport contract passed' : `✗ ${failures} assertion(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
