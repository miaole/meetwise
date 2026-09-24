/**
 * G7 Key×3 FreeTierOnly re-prove guards (Line C).
 *
 * Pure offline-testable policy for free-first test runs.
 * Prices: console-reported by user via coordinator 2026-09-23 (NOT independently verified).
 * releaseEvidence stays false; free-model green ≠ production-model / perf-SLO evidence.
 */
import { createHash } from 'node:crypto';

export const G7_RUN_COST_CAP_CNY = 5;
export const G7_PRICE_BOOK_CITATION = 'console-reported by user via coordinator 2026-09-23' as const;
export const G7_ASR_GAP_ID = 'GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS' as const;
export const G7_ALLOW_PRO_FLAG = 'ALLOW_DEEPSEEK_V4_PRO_TEST' as const;

export const G7_FREE_MODELS = [
  'qwen3.8-flash',
  'qwen3.8-max',
  'qwen3.8-27b',
  'qwen3.8-omni-flash',
  'qwen3.7-flash',
] as const;

export const G7_PAID_FALLBACK_ALLOWLIST = ['qwen-plus', 'deepseek-v4-flash'] as const;
export const G7_BANNED_TEST_MODELS = ['deepseek-v4-pro'] as const;

export type G7FreeModel = (typeof G7_FREE_MODELS)[number];
export type G7PaidFallbackModel = (typeof G7_PAID_FALLBACK_ALLOWLIST)[number];
export type G7FallbackTriggerClass =
  | 'FreeTierOnly'
  | 'quota_exhausted'
  | 'capability_unsupported';

export type G7PriceRow =
  | { kind: 'token'; inputCnyPer1M: number; outputCnyPer1M: number; freeQuota?: boolean }
  | { kind: 'embed'; inputCnyPer1M: number }
  | { kind: 'audio_sec'; cnyPerSec: number };

export const G7_CONSOLE_PRICE_BOOK: Readonly<Record<string, G7PriceRow>> = Object.freeze({
  'deepseek-v4-pro': { kind: 'token', inputCnyPer1M: 12, outputCnyPer1M: 24 },
  'deepseek-v4-flash': { kind: 'token', inputCnyPer1M: 1, outputCnyPer1M: 2 },
  'qwen-plus': { kind: 'token', inputCnyPer1M: 0.8, outputCnyPer1M: 2 },
  'qwen-turbo': { kind: 'token', inputCnyPer1M: 0.3, outputCnyPer1M: 0.6 },
  'qwen-max': { kind: 'token', inputCnyPer1M: 2.4, outputCnyPer1M: 9.6 },
  'qwen-vl-max': { kind: 'token', inputCnyPer1M: 1.6, outputCnyPer1M: 4 },
  'text-embedding-v4': { kind: 'embed', inputCnyPer1M: 0.5 },
  'paraformer-realtime-v2': { kind: 'audio_sec', cnyPerSec: 0.00024 },
  'qwen3.8-flash': { kind: 'token', inputCnyPer1M: 0, outputCnyPer1M: 0, freeQuota: true },
  'qwen3.8-max': { kind: 'token', inputCnyPer1M: 0, outputCnyPer1M: 0, freeQuota: true },
  'qwen3.8-27b': { kind: 'token', inputCnyPer1M: 0, outputCnyPer1M: 0, freeQuota: true },
  'qwen3.8-omni-flash': { kind: 'token', inputCnyPer1M: 0, outputCnyPer1M: 0, freeQuota: true },
  'qwen3.7-flash': { kind: 'token', inputCnyPer1M: 0, outputCnyPer1M: 0, freeQuota: true },
});

export type G7CallRecord = {
  readonly callId: string;
  readonly actualModel: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly audioSeconds?: number;
  readonly estimatedCostCny: number;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly fallback?: {
    readonly triggerErrorClass: G7FallbackTriggerClass;
    readonly fromModel: string;
    readonly toModel: string;
  };
  readonly evidenceClass: 'free_quota_wiring_only' | 'paid_fallback' | 'skip_prereq';
};

export type G7RunCostState = {
  readonly runningCostCny: number;
  readonly calls: readonly G7CallRecord[];
  readonly capCny: number;
};

export type G7TestProfile = {
  readonly mode: 'g7_freetier_reprove';
  readonly primaryModel: G7FreeModel;
  readonly fastModel: G7FreeModel;
  readonly paidFallbackAllowlist: readonly G7PaidFallbackModel[];
  readonly paidFallbackEnabled: boolean;
  readonly endpointProfile: 'dashscope-cn-beijing';
  readonly evidenceLabel: 'free-tier model; not production-model evidence; not perf SLO evidence';
};

export function keyFingerprintPrefix(secret: string, hexChars = 8): string {
  return createHash('sha256').update(secret, 'utf8').digest('hex').slice(0, hexChars);
}

export function isG7FreetierReproveEnabled(env: NodeJS.ProcessEnv): boolean {
  return String(env.G7_FREETIER_REPROVE ?? '').trim() === '1';
}

export function isDeepseekV4ProTestApproved(env: NodeJS.ProcessEnv): boolean {
  return String(env[G7_ALLOW_PRO_FLAG] ?? '').trim() === '1';
}

export function resolveG7TestProfile(env: NodeJS.ProcessEnv = process.env): G7TestProfile {
  const primary = (env.G7_FREE_PRIMARY_MODEL?.trim() || 'qwen3.8-flash') as G7FreeModel;
  const fast = (env.G7_FREE_FAST_MODEL?.trim() || 'qwen3.8-flash') as G7FreeModel;
  if (!(G7_FREE_MODELS as readonly string[]).includes(primary)) {
    throw new Error(`g7_free_primary_model_undeclared:${primary}`);
  }
  if (!(G7_FREE_MODELS as readonly string[]).includes(fast)) {
    throw new Error(`g7_free_fast_model_undeclared:${fast}`);
  }
  const paidFallbackEnabled = String(env.G7_PAID_FALLBACK_ENABLED ?? '0').trim() === '1';
  return Object.freeze({
    mode: 'g7_freetier_reprove',
    primaryModel: primary,
    fastModel: fast,
    paidFallbackAllowlist: G7_PAID_FALLBACK_ALLOWLIST,
    paidFallbackEnabled,
    endpointProfile: 'dashscope-cn-beijing',
    evidenceLabel: 'free-tier model; not production-model evidence; not perf SLO evidence',
  });
}

export function applyG7FreetierReproveEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const next: NodeJS.ProcessEnv = { ...env, G7_FREETIER_REPROVE: '1' };
  const profile = resolveG7TestProfile(next);
  next.MODEL_ENDPOINT_PROFILE = profile.endpointProfile;
  next.MODEL_NAME = profile.primaryModel;
  next.MODEL_FAST_NAME = profile.fastModel;
  next.MODEL_PRIMARY_BILLING_MODEL = profile.primaryModel;
  next.MODEL_FAST_BILLING_MODEL = profile.fastModel;
  next.MODEL_PRIMARY_BILLING_PROVIDER = 'dashscope';
  next.MODEL_FAST_BILLING_PROVIDER = 'dashscope';
  next.MODEL_PRIMARY_BILLING_REGION = 'cn-beijing';
  next.MODEL_FAST_BILLING_REGION = 'cn-beijing';
  if (!String(next.MODEL_PRIMARY_PRICE_REVISION ?? '').trim()) {
    next.MODEL_PRIMARY_PRICE_REVISION = 'g7-free-quota-2026-09-23';
  }
  if (!String(next.MODEL_FAST_PRICE_REVISION ?? '').trim()) {
    next.MODEL_FAST_PRICE_REVISION = 'g7-free-quota-2026-09-23';
  }
  if (!String(next.MODEL_PRIMARY_INPUT_MICRO_CNY_PER_MILLION ?? '').trim()) {
    next.MODEL_PRIMARY_INPUT_MICRO_CNY_PER_MILLION = '0';
  }
  if (!String(next.MODEL_PRIMARY_OUTPUT_MICRO_CNY_PER_MILLION ?? '').trim()) {
    next.MODEL_PRIMARY_OUTPUT_MICRO_CNY_PER_MILLION = '0';
  }
  if (!String(next.MODEL_FAST_INPUT_MICRO_CNY_PER_MILLION ?? '').trim()) {
    next.MODEL_FAST_INPUT_MICRO_CNY_PER_MILLION = '0';
  }
  if (!String(next.MODEL_FAST_OUTPUT_MICRO_CNY_PER_MILLION ?? '').trim()) {
    next.MODEL_FAST_OUTPUT_MICRO_CNY_PER_MILLION = '0';
  }
  return next;
}

export function assertPriceBookHasModel(model: string): G7PriceRow {
  const row = G7_CONSOLE_PRICE_BOOK[model];
  if (!row) throw new Error(`g7_price_book_missing:${model}`);
  return row;
}

export function assertModelAllowedForTest(model: string, env: NodeJS.ProcessEnv = process.env): void {
  if ((G7_BANNED_TEST_MODELS as readonly string[]).includes(model)) {
    if (!isDeepseekV4ProTestApproved(env)) {
      throw new Error(`g7_model_banned_without_approval:${model}`);
    }
  }
  const declared =
    (G7_FREE_MODELS as readonly string[]).includes(model)
    || (G7_PAID_FALLBACK_ALLOWLIST as readonly string[]).includes(model)
    || model === 'qwen-turbo'
    || model === 'qwen-max'
    || model === 'qwen-vl-max'
    || model === 'text-embedding-v4'
    || model === 'paraformer-realtime-v2'
    || (isDeepseekV4ProTestApproved(env) && model === 'deepseek-v4-pro');
  if (!declared) throw new Error(`g7_model_undeclared:${model}`);
  assertPriceBookHasModel(model);
}

export function estimateCallCostCny(args: {
  model: string;
  inputTokens: number;
  outputTokens: number;
  audioSeconds?: number;
}): number {
  const row = assertPriceBookHasModel(args.model);
  if (row.kind === 'audio_sec') {
    return Math.max(0, args.audioSeconds ?? 0) * row.cnyPerSec;
  }
  const inT = Math.max(0, args.inputTokens);
  const outT = Math.max(0, args.outputTokens);
  if (row.kind === 'embed') return (inT / 1_000_000) * row.inputCnyPer1M;
  return (inT / 1_000_000) * row.inputCnyPer1M + (outT / 1_000_000) * row.outputCnyPer1M;
}

export function createG7RunCostState(capCny = G7_RUN_COST_CAP_CNY): G7RunCostState {
  return { runningCostCny: 0, calls: [], capCny };
}

export function recordCallAndAccumulateCost(
  state: G7RunCostState,
  call: Omit<G7CallRecord, 'estimatedCostCny'> & { estimatedCostCny?: number },
  env: NodeJS.ProcessEnv = process.env,
): G7RunCostState {
  assertModelAllowedForTest(call.actualModel, env);
  const estimatedCostCny = call.estimatedCostCny ?? estimateCallCostCny({
    model: call.actualModel,
    inputTokens: call.inputTokens,
    outputTokens: call.outputTokens,
    audioSeconds: call.audioSeconds,
  });
  const nextRunning = state.runningCostCny + estimatedCostCny;
  if (nextRunning > state.capCny) {
    throw new Error(`g7_cost_cap_exceeded:COST_CAP:running=${nextRunning}:cap=${state.capCny}`);
  }
  const full: G7CallRecord = Object.freeze({ ...call, estimatedCostCny });
  return {
    runningCostCny: nextRunning,
    calls: [...state.calls, full],
    capCny: state.capCny,
  };
}

export function classifyProviderError(message: string): G7FallbackTriggerClass | null {
  const m = message.toLowerCase();
  if (m.includes('allocationquota.freetieronly') || m.includes('freetieronly')) return 'FreeTierOnly';
  if (m.includes('quota') && (m.includes('exhaust') || m.includes('exceed') || m.includes('insufficient'))) {
    return 'quota_exhausted';
  }
  if (
    m.includes('model_not_found')
    || m.includes('unsupported')
    || m.includes('does not exist')
    || m.includes('invalid_model')
  ) {
    return 'capability_unsupported';
  }
  return null;
}

export function selectPaidFallback(args: {
  fromModel: string;
  triggerErrorClass: G7FallbackTriggerClass;
  preferredPaid?: G7PaidFallbackModel;
  paidFallbackEnabled: boolean;
}): { toModel: G7PaidFallbackModel; triggerErrorClass: G7FallbackTriggerClass; fromModel: string } {
  if (!args.paidFallbackEnabled) {
    throw new Error(`g7_paid_fallback_disabled:${args.triggerErrorClass}:${args.fromModel}`);
  }
  const toModel = args.preferredPaid ?? 'qwen-plus';
  if (!(G7_PAID_FALLBACK_ALLOWLIST as readonly string[]).includes(toModel)) {
    throw new Error(`g7_paid_fallback_not_allowlisted:${toModel}`);
  }
  if ((G7_BANNED_TEST_MODELS as readonly string[]).includes(toModel)) {
    throw new Error(`g7_paid_fallback_banned:${toModel}`);
  }
  return { toModel, triggerErrorClass: args.triggerErrorClass, fromModel: args.fromModel };
}

export function assertModelApiKeyPresent(env: NodeJS.ProcessEnv = process.env): string {
  const key = String(env.MODEL_API_KEY ?? '').trim();
  if (!key) throw new Error('g7_model_api_key_missing');
  return keyFingerprintPrefix(key, 8);
}

export function bounded429BackoffMs(
  attempt: number,
  opts?: { maxRetries?: number; baseMs?: number; maxMs?: number },
): number {
  const maxRetries = opts?.maxRetries ?? 3;
  const baseMs = opts?.baseMs ?? 200;
  const maxMs = opts?.maxMs ?? 2000;
  if (attempt < 0) throw new Error('g7_429_attempt_invalid');
  if (attempt >= maxRetries) throw new Error(`g7_429_backoff_exhausted:maxRetries=${maxRetries}`);
  return Math.min(maxMs, baseMs * 2 ** attempt);
}

export function asrPathStatus(): {
  status: 'skip_prereq';
  gapId: typeof G7_ASR_GAP_ID;
  countedAsPass: false;
  label: string;
} {
  return {
    status: 'skip_prereq',
    gapId: G7_ASR_GAP_ID,
    countedAsPass: false,
    label: 'ASR path skipped while GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS open; never counted as pass',
  };
}

export function assertCalibrationModelMatch(factorModel: string, dispatchModel: string): void {
  if (factorModel !== dispatchModel) {
    throw new Error(`g7_calibration_cross_model_forbidden:${factorModel}->${dispatchModel}`);
  }
}

export function buildG7ReceiptFields(args: {
  runnerCommitSha: string;
  porcelainClean: boolean;
  keyFingerprint8: string;
  costState: G7RunCostState;
  startedAt: string;
  finishedAt: string;
  profile: G7TestProfile;
}): Record<string, unknown> {
  return {
    g7FreetierReprove: true,
    runnerCommitSha: args.runnerCommitSha,
    porcelainClean: args.porcelainClean,
    keyFingerprint: args.keyFingerprint8,
    priceBookCitation: G7_PRICE_BOOK_CITATION,
    runCostCapCny: args.costState.capCny,
    estimatedCostCny: args.costState.runningCostCny,
    actualSpendCny: null,
    calls: args.costState.calls,
    startedAt: args.startedAt,
    finishedAt: args.finishedAt,
    evidenceLabel: args.profile.evidenceLabel,
    asr: asrPathStatus(),
    releaseEvidence: false,
  };
}
