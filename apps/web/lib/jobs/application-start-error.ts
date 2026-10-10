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
