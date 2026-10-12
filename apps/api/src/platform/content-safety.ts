export const CONTENT_SAFETY_KILL_SWITCH_ACTIVE = 'content_safety_kill_switch_active';

/**
 * Content-safety kill switch (D6 minimum set · #239-①). One env switch stops
 * model-driven interview question generation / conversation at the api
 * begin/turn entries. It is independent from the platform-level runaway cap,
 * the public-preview write gate, model failover circuitry and cost governance
 * — those keep their semantics byte-for-byte (audit-corrected "平台级开关
 * 不算此类" boundary).
 *
 * Fail-closed three-state resolution (same shape as resolvePublicPreviewMode):
 * unset/`0` = off (default; current bytes preserved), `1` = engaged, anything
 * else throws instead of guessing.
 */
export function resolveContentSafetyKillSwitch(
  raw: unknown = process.env.MEETWISE_CONTENT_SAFETY_KILL_SWITCH,
): boolean {
  if (raw === undefined || raw === '0') return false;
  if (raw === '1') return true;
  throw new Error('invalid_meetwise_content_safety_kill_switch');
}

/**
 * Thrown when the kill switch is engaged. The api begin/turn entries map this
 * to 503 with honest copy; nothing model-facing is enqueued while it is on.
 */
export class ContentSafetyKillSwitchActiveError extends Error {
  readonly code = CONTENT_SAFETY_KILL_SWITCH_ACTIVE;
  constructor() {
    super(CONTENT_SAFETY_KILL_SWITCH_ACTIVE);
    this.name = 'ContentSafetyKillSwitchActiveError';
  }
}

/**
 * Service-layer gate: refuse while the content-safety kill switch is engaged.
 * Default (env unset) is off, so existing behavior is preserved byte-for-byte.
 */
export function assertContentSafetyKillSwitchOff(
  raw: unknown = process.env.MEETWISE_CONTENT_SAFETY_KILL_SWITCH,
): void {
  if (resolveContentSafetyKillSwitch(raw)) throw new ContentSafetyKillSwitchActiveError();
}
