/**
 * G7 composition-root injection seam (GODFN-1b · design godfn-decompose.md §2.2).
 *
 * The runtime package never reads process.env for G7 test-state sensing: the
 * pre-1b scattered direct reads (`isG7FreetierReproveEnabled(process.env)` at
 * model-client.ts:220/:347/:376 and context-budget.ts:281) converge here as a
 * predicate/ticket pair injected by composition roots.
 *  - apps/api/src/main.ts and apps/worker/src/main.ts each read
 *    G7_FREETIER_REPROVE exactly once at startup (env key name and the `=1`
 *    activation semantics stay pinned to the guard: `trim() === '1'`) and
 *    install this injection alongside the outbound interceptor.
 *  - In-process test proves install the injection from the test-support face.
 * Until a composition root assembles G7, the default injection is OFF with a
 * pass-through ticket — byte-equivalent with the pre-1b runtime whenever
 * G7_FREETIER_REPROVE is unset, and fail-closed toward production (a process
 * that forgets to assemble never enters G7 test-mode).
 */
export type G7OutboundAllowTicket = <T>(fn: () => Promise<T>) => Promise<T>;

export interface G7RuntimeInjection {
  /**
   * Composition-root single-read predicate. The env is read ONCE by the
   * composition root; this predicate only returns that decision.
   */
  readonly freetierReproveEnabled: () => boolean;
  /** Opens the G7 outbound-transport allow window around one dispatch. */
  readonly withOutboundAllow: G7OutboundAllowTicket;
}

const passThroughTicket: G7OutboundAllowTicket = (fn) => fn();

const defaultInjection: G7RuntimeInjection = Object.freeze({
  freetierReproveEnabled: () => false,
  withOutboundAllow: passThroughTicket,
});

let injection: G7RuntimeInjection = defaultInjection;

/** Composition roots / test support install the G7 runtime injection here. */
export function configureG7RuntimeInjection(next: G7RuntimeInjection): void {
  injection = Object.freeze({
    freetierReproveEnabled: next.freetierReproveEnabled,
    withOutboundAllow: next.withOutboundAllow,
  });
}

/** Test-support reset — production never resets the injection. */
export function resetG7RuntimeInjection(): void {
  injection = defaultInjection;
}

/** Current injection (default OFF + pass-through until configured). */
export function g7RuntimeInjection(): G7RuntimeInjection {
  return injection;
}
