/**
 * calibration-dispatch-budget.ts — MODEL-OP-00 P3 因子回派发接线。
 *
 * 把 `resolveLatestCalibratedFactor` 读到的因子注入 `planDispatchBudgetFromCostPolicy` /
 * `contextBudgetPolicyFromCostPolicy` → `planDispatchBudget`。
 * 缺因子 / 校验失败 → null 省略 calibration（未精化预算）；绝不静默 invent factor=1.0。
 *
 * 独立文件：避免 usage-calibration-reconciler ↔ context-budget ↔ model-client ↔ invoke 循环依赖。
 */
import type { Client } from '@meetwise/db';
import {
  planDispatchBudgetFromCostPolicy,
  type ContextBudgetComponents,
  type ContextBudgetComponentId,
  type ContextBudgetDecision,
} from './context-budget.ts';
import type { ModelCostPolicy } from './invoke.ts';
import { resolveLatestCalibratedFactor } from './usage-calibration-reconciler.ts';
import type { EstimatorVersion } from './usage-reconciliation.ts';

export async function planDispatchBudgetWithLatestCalibration(
  c: Client,
  owner: string,
  components: ContextBudgetComponents,
  costPolicy: ModelCostPolicy,
  opts: {
    service: string;
    model: string;
    estimator?: EstimatorVersion;
    trimOrder?: readonly ContextBudgetComponentId[];
    allowDegrade?: boolean;
  },
): Promise<ContextBudgetDecision> {
  const estimator = opts.estimator ?? 'utf8-bytes-v1';
  const factor = await resolveLatestCalibratedFactor(c, owner, opts.service, opts.model, estimator);
  return planDispatchBudgetFromCostPolicy(components, costPolicy, {
    service: opts.service,
    trimOrder: opts.trimOrder,
    allowDegrade: opts.allowDegrade,
    calibration: factor,
  });
}
