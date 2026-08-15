/**
 * Privileged, short-lived deployment command for immutable model-price receipts
 * and budget policies. It is intentionally never called by the worker loop.
 * Docker Compose runs it only inside the migration service, which owns DDL and
 * operator configuration credentials; the API/worker runtime login has neither.
 */
import { createPool } from '@meetwise/db';
import { configureRagCostGovernance, resolveRagCostGovernance } from './rag-cost-governance.ts';
import { configureModelCostGovernance, resolveModelCostGovernance } from './model-cost-governance.ts';

async function main(): Promise<void> {
  const pool = createPool();
  try {
    const rag = resolveRagCostGovernance();
    const model = resolveModelCostGovernance();
    await configureRagCostGovernance(pool, rag);
    await configureModelCostGovernance(pool, model);
    console.log(`cost configuration: rag=${rag.mode} model=${model.mode}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'cost_configuration_failed');
  process.exit(1);
});
