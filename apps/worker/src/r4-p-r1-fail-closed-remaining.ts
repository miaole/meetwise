/**
 * Knife F4 — P-R1 **fail-closed remaining** honesty classifiers (G-R4-3 / PR1-A–D).
 *
 * Inventory (r4-domain-isolation §2 / §6c.3 · G-R4-3 · GAP-RAG-01 / m4 §R1):
 *   PR1-A = legacy「技术岗」default-on (MEETWISE_TECH_ROLE_FAIL_CLOSED default OFF)
 *   PR1-B = fail-closed flag-on / combo-root evidence remaining (≠ flip default)
 *   PR1-C = r1-tech-role-fail-closed contract 旁证 ≠ R1 closed
 *   PR1-D = hard pins (≠ R1/R4 closed · releaseEvidence=false · sole 恰 5 ·
 *           G-R4-5 parallel open · no flip without authorize)
 *
 * Prior F2 sealed P-R1 remaining honesty (default OFF · legacy on · r1Closed
 * false). This knife deepens fail-closed remaining-gap honesty only —
 * it does NOT close R1 / R4 / 题域已隔离 · does NOT flip default.
 *
 * HARD:
 *   - No flip of MEETWISE_TECH_ROLE_FAIL_CLOSED default.
 *   - Ban claiming R1 closed / R4 closed / 题域已隔离.
 *   - Contract prove green ≠ R1 closed ≠ combo-root evidence.
 *   - No invent MODEL_API_KEY · releaseEvidence=false · ≠HA · sole 恰 5.
 */
import {
  classifyPR1Remaining,
  isR1Closed,
  type PR1RemainingStatus,
} from './r4-p-meta-p-r1-remaining.ts';
import {
  isTechRoleFailClosedEnabled,
  LEGACY_TECH_ROLE_DEFAULT,
} from './adaptive-role-resolve.ts';

/** PR1-A–D fail-closed remaining surface (deepened vs F2 PR1). */
export type PR1FailClosedRemainingStatus = {
  /** Empty-env default of fail-closed flag (must stay false — no flip). */
  failClosedFlagDefaultOn: boolean;
  /** Legacy default string still documented for flag-off path. */
  legacyDefaultLabel: string;
  /** PR1-A: production still depends on legacy「技术岗」fallback when flag off. */
  productionDependsOnLegacyDefault: boolean;
  /**
   * PR1-B: unit/contract flag-on path exists (r1 prove E4–E6) —
   * ≠ combo-root / compose / production flag-on evidence.
   */
  flagOnContractUnitExists: boolean;
  /** PR1-B: combo-root / production flag-on evidence — still missing. */
  comboRootFlagOnEvidence: boolean;
  /** PR1-C: contract harness + prove exist (旁证 ≠ closed). */
  contractHarnessExists: boolean;
  /** R1 closed claim — always false on this knife. */
  r1Closed: boolean;
  /** PR1-D: G-R4-5 / P-META serving remains parallel open (not this F4). */
  gR45PMetaServingParallelOpen: boolean;
};

/**
 * Honest P-R1 fail-closed remaining snapshot (PR1-A–D).
 * Aligns with F2 classifyPR1Remaining default-off / legacy / r1Closed=false;
 * adds production-depends-on-legacy + combo-root-missing honesty.
 */
export function classifyPR1FailClosedRemaining(
  env: NodeJS.ProcessEnv = {},
  base: PR1RemainingStatus = classifyPR1Remaining(env),
): PR1FailClosedRemainingStatus {
  const flagDefaultOn = isTechRoleFailClosedEnabled(env);
  return {
    failClosedFlagDefaultOn: flagDefaultOn,
    legacyDefaultLabel: base.legacyDefaultLabel,
    productionDependsOnLegacyDefault:
      !flagDefaultOn && base.legacyDefaultLabel === LEGACY_TECH_ROLE_DEFAULT,
    flagOnContractUnitExists: true,
    comboRootFlagOnEvidence: false,
    contractHarnessExists: base.contractHarnessExists,
    r1Closed: false,
    gR45PMetaServingParallelOpen: true,
  };
}

/**
 * R1 closed only when production no longer depends on legacy default AND
 * combo-root flag-on evidence exists — not this knife (always false here).
 */
export function isPR1FailClosedR1Closed(
  status: PR1FailClosedRemainingStatus = classifyPR1FailClosedRemaining(),
): boolean {
  return (
    status.r1Closed === true
    && status.productionDependsOnLegacyDefault === false
    && status.comboRootFlagOnEvidence === true
    && status.failClosedFlagDefaultOn === true
  );
}

/** Consistency with F2 PR1 classifiers (must not diverge on shared bits). */
export function failClosedAlignsWithF2PR1(
  fc: PR1FailClosedRemainingStatus = classifyPR1FailClosedRemaining(),
  f2: PR1RemainingStatus = classifyPR1Remaining(),
): boolean {
  return (
    fc.failClosedFlagDefaultOn === f2.failClosedFlagDefaultOn
    && fc.legacyDefaultLabel === f2.legacyDefaultLabel
    && fc.contractHarnessExists === f2.contractHarnessExists
    && fc.r1Closed === f2.r1Closed
    && isPR1FailClosedR1Closed(fc) === isR1Closed(f2)
  );
}
