/**
 * Dedicated PostgreSQL checkpoint-erasure executor.  It receives only target
 * IDs and owners from a reviewed dispatch function; locators and checkpoint
 * content never leave the database procedure boundary or enter logs.
 */
import {
  asPrivacyWorkerExecutor, asPrivacyWorkerPrincipal, claimCheckpointErasureTarget,
  listClaimableCheckpointErasureTargets, purgeCheckpointErasureTarget, type DbPool,
} from '@meetwise/db';
import { runDrainLoop } from './drain-loop.ts';

export async function checkpointPrivacyErasureTick(pool: DbPool, workerId: string): Promise<{ claimed: number; erased: number }> {
  const targets = await asPrivacyWorkerExecutor(pool, (c) => listClaimableCheckpointErasureTargets(c));
  let claimed = 0;
  let erased = 0;
  for (const target of targets) {
    try {
      const claim = await asPrivacyWorkerPrincipal(pool, target.ownerUserId, (c) =>
        claimCheckpointErasureTarget(c, target.targetId, workerId));
      if (!claim) continue;
      claimed++;
      await asPrivacyWorkerPrincipal(pool, target.ownerUserId, (c) =>
        purgeCheckpointErasureTarget(c, claim.targetId, claim.leaseToken));
      erased++;
    } catch (error: unknown) {
      // Target identifiers, owner values, source records and error detail can
      // all become privacy metadata.  Emit only a stable class for operations.
      const code = typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
        ? error.code : 'privacy_erasure_target_failed';
      console.error(`checkpoint privacy erasure target failed: ${code}`);
    }
  }
  return { claimed, erased };
}

export function runCheckpointPrivacyEraser(pool: DbPool, workerId: string, intervalMs = 5_000) {
  return runDrainLoop(() => checkpointPrivacyErasureTick(pool, workerId).then(() => undefined), intervalMs);
}
