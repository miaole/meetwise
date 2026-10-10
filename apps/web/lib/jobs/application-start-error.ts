/**
 * Application-start 409 subclass surfacing (GAP-G7-E2E-UI-APPLICATION-START-409).
 * Pure helper — keeps the server action thin and offline-provable.
 */
export const APPLICATION_START_CONFLICT_SUBCLASSES = [
  'resume_not_ready',
  'application_binding_invalid',
  'interview_ineligible_route',
  'application_start_unexpected',
] as const;

export type ApplicationStartConflictSubclass =
  (typeof APPLICATION_START_CONFLICT_SUBCLASSES)[number];

/**
 * B271 片2 S2-C4/C6（rev2-R8 §9-8 第二白名单落点）：start 402 **redirect 形**错误分码注册表——
 * redirect 通道不走 applicationStartFailureMessage（那是 throw/log 形），但分码与其稳定文案必须
 * 同落本文件单源（Ban 散落双份漂移）。文案=修法③候选人稳定拒因（片2 交付）；
 * 费用文案（修法⑥「本场由企业支付」）归片3·本文件零含。
 */
export const APPLICATION_START_REDIRECT_ERRORS = {
  application_enterprise_pay_unavailable: '该岗位面试暂不可用，请联系招聘方',
} as const;

export type ApplicationStartRedirectErrorCode = keyof typeof APPLICATION_START_REDIRECT_ERRORS;

/** 402 redirect 分码守卫：未知 402 分码回落 legacy `interview_credits_unavailable`（C 端语义零改）。 */
export function applicationStartRedirectError(code: string | undefined): string {
  return code && code in APPLICATION_START_REDIRECT_ERRORS ? code : 'interview_credits_unavailable';
}

/** Read `error` from an API conflict/error JSON body; unknown shapes → undefined. */
export function extractApplicationStartConflictSubclass(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const err = (body as { error?: unknown }).error;
  if (typeof err !== 'string') return undefined;
  const trimmed = err.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Status + optional subclass → stable thrown/log message (subclass after `:` when present). */
export function applicationStartFailureMessage(status: number, body: unknown): string {
  const subclass = extractApplicationStartConflictSubclass(body);
  return subclass
    ? `application_start_failed_${status}:${subclass}`
    : `application_start_failed_${status}`;
}
