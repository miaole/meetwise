export const FAILURE_KINDS = [
  'FAIL_API',
  'FAIL_WORKER',
  'FAIL_DB',
  'FAIL_PROVIDER',
  'FAIL_CAPABILITY',
  'BLOCKED_DATA_OR_PERMISSION',
  'BLOCKED_LIVE_KEY',
] as const;

export type FailureKind = (typeof FAILURE_KINDS)[number];

export type FailureInput = {
  status?: number;
  error?: string;
  runnerCode?: string;
};

/**
 * First-pass 出处 for an E2E / runner failure. This is not a case ledger and
 * does not invent a root cause from a blob "e2e failed". Unknown 4xx/5xx stay
 * FAIL_API so callers cannot launder a gap into BLOCKED_*.
 */
export function classifyFailure(input: FailureInput): FailureKind {
  const blob = `${input.error ?? ''} ${input.runnerCode ?? ''}`;
  if (/live_provider_key_missing/.test(blob)) return 'BLOCKED_LIVE_KEY';
  if (/fake_service_mode_forbidden|e2e_isolation_required|e2e_ui_isolation_required|performance_e2e_isolation_required/.test(blob)) {
    return 'FAIL_CAPABILITY';
  }
  if (/image_ocr_unavailable|tts_unavailable|asr_unavailable|voice_operation_disabled/.test(blob)) {
    return 'FAIL_CAPABILITY';
  }
  if (input.status === 401 || input.status === 402) return 'BLOCKED_DATA_OR_PERMISSION';
  if (input.status === 403 && /insufficient_entitlement|RecruiterGuard|rls|unauthorized|forbidden_role/i.test(blob)) {
    return 'BLOCKED_DATA_OR_PERMISSION';
  }
  if (/insufficient_entitlement|ocr_duplicate/.test(blob)) return 'BLOCKED_DATA_OR_PERMISSION';
  if (input.status === 429 || input.status === 408) return 'FAIL_PROVIDER';
  if (/\b(dashscope|model_timeout|provider_timeout|E2E_VOICE)\b/.test(blob)) return 'FAIL_PROVIDER';
  if (/ECONNREFUSED.*5432|migration|postgres|schemaMigration/.test(blob)) return 'FAIL_DB';
  if (/worker|checkpoint|graph_run/.test(blob)) return 'FAIL_WORKER';
  return 'FAIL_API';
}
