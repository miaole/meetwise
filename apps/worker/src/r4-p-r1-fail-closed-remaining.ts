/**
 * Knife F4 — P-R1 **fail-closed remaining** honesty classifiers (G-R4-3 / PR1-A–D).
 *
 * Inventory (r4-domain-isolation §2 / §6c.3 · G-R4-3 · GAP-RAG-01 / m4 §R1):
 *   PR1-A = legacy「技术岗」when flag explicitly OFF (product default ON after G-R4-3/R1 flip)
 *   PR1-B = fail-closed flag-on / combo-root evidence (true only from real evidence · ≠ flip default · ≠ product closed)
 *   PR1-C = default-on / no-legacy path evidence (true only from real evidence · Ban silent flip · ≠ R1 closed)
 *   PR1-D = hard pins (≠ R1/R4 closed · releaseEvidence=false · sole 恰 5 ·
 *           G-R4-5 parallel open · no flip without authorize)
 *
 * Prior F2 sealed P-R1 remaining honesty (default OFF · legacy on · r1Closed
 * false). This knife deepens fail-closed remaining-gap honesty only —
 * it does NOT close R1 / R4 / 题域已隔离 · does NOT flip default.
 *
 * HARD:
 *   - Default flip only under G-R4-3 / R1 product-close authorize (this module observes live default).
 *   - Ban claiming R1 closed / R4 closed / 题域已隔离.
 *   - Contract prove green ≠ R1 closed ≠ combo-root evidence alone closes product.
 *   - comboRootFlagOnEvidence / defaultOnNoLegacyPathEvidence true **only** from
 *     real assessors (Ban forge / Ban silent hardcode true).
 *   - Evidence emit ≠ PR1-B/C product closed ≠ G-R4-3 closed (same as EG1/EG2).
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
import { hasComboRootFlagOnProductionEvidence } from './r4-pr1b-combo-root-flag-on-evidence.ts';
import { hasDefaultOnNoLegacyPathEvidence } from './r4-pr1c-default-on-no-legacy-evidence.ts';

/** PR1-A–D fail-closed remaining surface (deepened vs F2 PR1). */
export type PR1FailClosedRemainingStatus = {
  /** Empty-env default of fail-closed flag (true after G-R4-3 / R1 product-close flip). */
  failClosedFlagDefaultOn: boolean;
  /** Legacy default string still documented for flag-off path. */
  legacyDefaultLabel: string;
  /** PR1-A: production still depends on legacy「技术岗」fallback when flag off. */
  productionDependsOnLegacyDefault: boolean;
  /**
   * PR1-B: unit/contract flag-on path exists (r1 prove E4–E6) —
   * ≠ product close by itself.
   */
  flagOnContractUnitExists: boolean;
  /**
   * PR1-B: combo-root / production flag-on evidence —
   * true **only** when live assessor passes (Ban forge hardcode).
   * Evidence ≠ PR1-B product closed ≠ G-R4-3 closed.
   */
  comboRootFlagOnEvidence: boolean;
  /** PR1-C: contract harness + prove exist (旁证 ≠ closed). */
  contractHarnessExists: boolean;
  /**
   * PR1-C: default-on / no-legacy path evidence —
   * true **only** when live assessor passes · post-flip default ON · Ban forge still-0.
   * Evidence ≠ PR1-C product closed ≠ R1 closed.
   */
  defaultOnNoLegacyPathEvidence: boolean;
  /** R1 closed claim — always false on this knife (Ban product close from evidence alone). */
  r1Closed: boolean;
  /** PR1-D: G-R4-5 / P-META serving remains parallel open (not this F4). */
  gR45PMetaServingParallelOpen: boolean;
};

/**
 * Honest P-R1 fail-closed remaining snapshot (PR1-A–D).
 * Aligns with F2 classifyPR1Remaining default-off / legacy / r1Closed=false;
 * combo-root / no-legacy evidence bits come from live assessors only.
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
    comboRootFlagOnEvidence: hasComboRootFlagOnProductionEvidence(),
    contractHarnessExists: base.contractHarnessExists,
    defaultOnNoLegacyPathEvidence: hasDefaultOnNoLegacyPathEvidence(),
    r1Closed: false,
    gR45PMetaServingParallelOpen: true,
  };
}

/**
 * R1 closed only when production no longer depends on legacy default AND
 * combo-root flag-on evidence exists AND fail-closed default is on —
 * not this F4 classifier alone (r1Closed forced false · product close via dedicated knife).
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
