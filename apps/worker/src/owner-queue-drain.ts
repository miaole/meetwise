/**
 * Sequential owner drain used by quiz / diagnosis / report ticks.
 * Finish one listed owner to idle, then the next. This is head-of-line,
 * not interview quantum rotation (`fairDrainInterviewOwners`).
 */

export interface OwnerDrainHooks {
  /** Runs before the first drainOnce for this owner (quiz/diagnosis reap). */
  beforeOwner?: (owner: string) => Promise<void>;
  /** Runs after this owner returns idle (report sweep). */
  afterOwner?: (owner: string) => Promise<void>;
}

export interface SequentialDrainResult {
  claimed: number;
}

/**
 * Drain each owner to idle in gateway-listed order. A deep first owner
 * occupies the tick until idle (`A,A,A,B`). Claim/lease/RLS stay in drainOnce.
 */
export async function drainOwnersInListedOrder<D, R>(
  deps: D,
  owners: readonly string[],
  drainOnce: (deps: D, owner: string) => Promise<R>,
  isIdle: (result: R) => boolean,
  hooks: OwnerDrainHooks = {},
): Promise<SequentialDrainResult> {
  let claimed = 0;
  for (const owner of owners) {
    await hooks.beforeOwner?.(owner);
    for (;;) {
      const result = await drainOnce(deps, owner);
      if (isIdle(result)) break;
      claimed += 1;
    }
    await hooks.afterOwner?.(owner);
  }
  return { claimed };
}
