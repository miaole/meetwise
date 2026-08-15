/**
 * Production configuration for text/vision model billing.  A model endpoint is
 * not allowed to become billable in production without an immutable price
 * revision, input/output upper bounds and one hard monthly scope.  The runtime
 * attaches the selected endpoint policy to `modelFor`; the invoke gateway then
 * reserves before dispatch and freezes ambiguous outcomes.
 */
import { asPrincipal, type DbPool } from '@meetwise/db';
import type { ModelCostPolicy } from '@meetwise/ai-runtime';

export interface ModelCostPolicySet {
  primary?: ModelCostPolicy;
  fastPrimary?: ModelCostPolicy;
  backup?: ModelCostPolicy;
  fastBackup?: ModelCostPolicy;
}
export interface ModelCostPriceRow extends ModelCostPolicy {
  inputMicroCnyPerMillion: number;
  outputMicroCnyPerMillion: number;
  sourceUrl: string;
}
export interface ModelCostGovernanceConfig {
  mode: 'observe' | 'enforce';
  policies: ModelCostPolicySet;
  priceRows: ModelCostPriceRow[];
  scopeId?: string;
  monthlyBudgetMicroCny?: number;
}

export interface ModelCostPriceBinding {
  scopeId: string;
  provider: string;
  model: string;
  region: string;
  priceRevision: string;
  inputMicroCnyPerMillion: number;
  outputMicroCnyPerMillion: number;
  sourceUrl: string;
}

export function modelCostPriceBindings(cfg: ModelCostGovernanceConfig): ModelCostPriceBinding[] {
  if (cfg.mode !== 'enforce' || !cfg.scopeId) return [];
  return cfg.priceRows.map((row) => ({
    scopeId: cfg.scopeId!, provider: row.provider, model: row.model, region: row.region,
    priceRevision: row.priceRevision, inputMicroCnyPerMillion: row.inputMicroCnyPerMillion,
    outputMicroCnyPerMillion: row.outputMicroCnyPerMillion, sourceUrl: row.sourceUrl,
  }));
}

type ModelCostBindingVerifier = (binding: ModelCostPriceBinding) => Promise<boolean>;

/**
 * The runtime account owns neither the price book nor its policy rows.  It
 * can only ask a fixed SECURITY DEFINER predicate whether every configured
 * immutable binding is still present and enabled.  That check happens before
 * worker consumers start, so an operator must run the privileged configure
 * command rather than letting a request choose an accidental latest price.
 */
export async function verifyModelCostGovernance(
  pool: DbPool, cfg: ModelCostGovernanceConfig, verifier?: ModelCostBindingVerifier,
): Promise<void> {
  if (cfg.mode !== 'enforce') return;
  const check = verifier ?? (async (binding: ModelCostPriceBinding) => asPrincipal(pool, '__system_model_cost_startup__', async (c) => {
    const result = await c.query(
      `SELECT ai_cost_text_price_binding_matches_scoped($1,$2,$3,$4,$5,$6,$7,$8) AS ok`,
      [binding.scopeId, binding.provider, binding.model, binding.region, binding.priceRevision,
        binding.inputMicroCnyPerMillion, binding.outputMicroCnyPerMillion, binding.sourceUrl],
    );
    return result.rows[0]?.ok === true;
  }));
  for (const binding of modelCostPriceBindings(cfg)) {
    if (!await check(binding)) throw new Error(`model_cost_price_binding_not_provisioned:${binding.model}`);
  }
}

const token = /^[A-Za-z0-9._:-]{1,160}$/;
function required(env: NodeJS.ProcessEnv, name: string, pattern = token): string {
  const value = env[name];
  if (!value || !pattern.test(value)) throw new Error(`model_cost_invalid_${name.toLowerCase()}`);
  return value;
}
/** Keys are opaque secrets, not identifiers; validate only presence and a
 * bounded printable shape so startup never logs or normalizes their value. */
function requiredSecret(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value || value.length > 1_024 || /[\u0000-\u001f\u007f]/.test(value))
    throw new Error(`model_cost_invalid_${name.toLowerCase()}`);
  return value;
}
function positive(env: NodeJS.ProcessEnv, name: string, max = 1_000_000_000): number {
  const value = Number(env[name]);
  if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`model_cost_invalid_${name.toLowerCase()}`);
  return value;
}

function endpoint(
  env: NodeJS.ProcessEnv, prefix: string, scopeId: string, expectedModel: string,
): ModelCostPriceRow {
  const model = required(env, `${prefix}_BILLING_MODEL`);
  if (model !== expectedModel) throw new Error(`model_cost_model_binding_mismatch:${prefix.toLowerCase()}`);
  const maxInputTokens = positive(env, `${prefix}_MAX_INPUT_TOKENS`, 1_000_000);
  const maxOutputTokens = positive(env, `${prefix}_MAX_OUTPUT_TOKENS`, 1_000_000);
  const contextWindowTokens = positive(env, `${prefix}_CONTEXT_WINDOW_TOKENS`, 2_000_000);
  const contextSafetyMarginTokens = positive(env, `${prefix}_CONTEXT_SAFETY_MARGIN_TOKENS`, 1_000_000);
  if (maxInputTokens + maxOutputTokens + contextSafetyMarginTokens > contextWindowTokens) {
    throw new Error(`model_cost_invalid_${prefix.toLowerCase()}_context_budget`);
  }
  return {
    scopeId,
    provider: required(env, `${prefix}_BILLING_PROVIDER`, /^[A-Za-z0-9._-]{1,80}$/),
    model,
    region: required(env, `${prefix}_BILLING_REGION`, /^[A-Za-z0-9._-]{1,80}$/),
    priceRevision: required(env, `${prefix}_PRICE_REVISION`, /^[A-Za-z0-9._:-]{1,80}$/),
    inputMicroCnyPerMillion: positive(env, `${prefix}_INPUT_MICRO_CNY_PER_MILLION`),
    outputMicroCnyPerMillion: positive(env, `${prefix}_OUTPUT_MICRO_CNY_PER_MILLION`),
    sourceUrl: required(env, `${prefix}_PRICE_SOURCE_URL`, /^https:\/\/.{1,1992}$/),
    maxInputTokens,
    maxOutputTokens,
    contextWindowTokens,
    contextEstimator: required(env, `${prefix}_CONTEXT_ESTIMATOR`, /^utf8-bytes-v1$/) as 'utf8-bytes-v1',
    contextSafetyMarginTokens,
  };
}

/** Production always enforces. Development defaults to observe to keep local scripted tests free of pricing secrets. */
export function resolveModelCostGovernance(env: NodeJS.ProcessEnv = process.env): ModelCostGovernanceConfig {
  const production = env.NODE_ENV?.trim().toLowerCase() === 'production';
  const mode = env.MODEL_COST_ENFORCEMENT ?? (production ? 'enforce' : 'observe');
  if (mode !== 'observe' && mode !== 'enforce') throw new Error('model_cost_invalid_mode');
  if (production && mode !== 'enforce') throw new Error('model_cost_enforcement_required_in_production');
  if (mode === 'observe') return { mode, policies: {}, priceRows: [] };

  const scopeId = required(env, 'MODEL_COST_BUDGET_SCOPE');
  const monthlyBudgetMicroCny = positive(env, 'MODEL_COST_MONTHLY_BUDGET_MICRO_CNY');
  const primaryModel = env.MODEL_NAME ?? 'qwen-plus';
  const fastModel = env.MODEL_FAST_NAME ?? 'qwen-turbo';
  const primary = endpoint(env, 'MODEL_PRIMARY', scopeId, primaryModel);
  const fastPrimary = endpoint(env, 'MODEL_FAST', scopeId, fastModel);
  const rows = [primary, fastPrimary];
  const policies: ModelCostPolicySet = { primary, fastPrimary };
  if (env.MODEL_BACKUP_BASE_URL) {
    // A configured backup without its secret only defers an avoidable error
    // until failover selection.  Refuse at startup, before any durable claim.
    requiredSecret(env, 'MODEL_BACKUP_API_KEY');
    const backupModel = env.MODEL_BACKUP_NAME ?? primaryModel;
    const fastBackupModel = env.MODEL_FAST_BACKUP_NAME ?? env.MODEL_BACKUP_NAME ?? fastModel;
    const backup = endpoint(env, 'MODEL_BACKUP', scopeId, backupModel);
    const fastBackup = endpoint(env, 'MODEL_FAST_BACKUP', scopeId, fastBackupModel);
    policies.backup = backup; policies.fastBackup = fastBackup;
    rows.push(backup, fastBackup);
  }
  return { mode, policies, priceRows: rows, scopeId, monthlyBudgetMicroCny };
}

/** A price revision is immutable: a changed rate/source under the same revision blocks boot. */
export async function configureModelCostGovernance(pool: DbPool, cfg: ModelCostGovernanceConfig): Promise<void> {
  if (cfg.mode !== 'enforce') return;
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    for (const row of cfg.priceRows) {
      await c.query(
        `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,clock_timestamp())
         ON CONFLICT(provider,model,region,revision) DO NOTHING`,
        [row.provider, row.model, row.region, row.priceRevision, row.inputMicroCnyPerMillion, row.outputMicroCnyPerMillion, row.sourceUrl],
      );
      const stored = await c.query(
        `SELECT input_micro_cny_per_million,output_micro_cny_per_million,source_url FROM ai_cost_price_book
          WHERE provider=$1 AND model=$2 AND region=$3 AND revision=$4`,
        [row.provider, row.model, row.region, row.priceRevision],
      );
      const actual = stored.rows[0];
      if (stored.rowCount !== 1 || Number(actual?.input_micro_cny_per_million) !== row.inputMicroCnyPerMillion
        || Number(actual?.output_micro_cny_per_million) !== row.outputMicroCnyPerMillion || actual?.source_url !== row.sourceUrl) {
        throw new Error('model_cost_price_revision_conflict');
      }
    }
    await c.query(
      `INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,$2,true)
       ON CONFLICT(scope_id) DO UPDATE SET monthly_limit_micro_cny=EXCLUDED.monthly_limit_micro_cny,enabled=true,updated_at=clock_timestamp()`,
      [cfg.scopeId, cfg.monthlyBudgetMicroCny],
    );
    await c.query('COMMIT');
  } catch (error) { await c.query('ROLLBACK'); throw error; } finally { c.release(); }
}
