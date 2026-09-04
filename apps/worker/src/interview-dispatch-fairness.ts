/**
 * Interview-queue fairness: rotate owners with a one-job quantum and bound
 * in-process concurrency. Claim/lease/RLS remain the source of truth.
 */
export interface InterviewDispatchBudget {
  perOwnerInflight: number;
  globalInflight: number;
}

export const DEFAULT_INTERVIEW_DISPATCH_BUDGET: InterviewDispatchBudget = {
  perOwnerInflight: 1,
  globalInflight: 4,
};

/** Per-owner launches inside one fairDrain call. Prevents a retry loop from livelocking the tick. */
export const DEFAULT_INTERVIEW_OWNER_LAUNCH_CAP = 32;

export function readInterviewDispatchBudget(
  env: Record<string, string | undefined> = process.env,
): InterviewDispatchBudget {
  const perOwnerInflight = readBoundedInt(env, 'WORKER_INTERVIEW_PER_OWNER_INFLIGHT', 1, 1, 32);
  const globalInflight = readBoundedInt(env, 'WORKER_INTERVIEW_GLOBAL_INFLIGHT', 4, 1, 64);
  if (perOwnerInflight > globalInflight) throw new Error('interview_dispatch_budget_invalid');
  return { perOwnerInflight, globalInflight };
}

function readBoundedInt(
  env: Record<string, string | undefined>, name: string, fallback: number, min: number, max: number,
): number {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  // Reject scientific notation, decimals, signs, and leading zeros. Number('1e1')
  // is an integer 10 and would otherwise silently enlarge the budget.
  if (!/^[1-9]\d*$/.test(raw)) throw new Error(`${name}_invalid`);
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name}_invalid`);
  return value;
}

export interface FairDrainOnceResult {
  claimed: number;
  idleRounds: number;
}

/**
 * Serve at most one job per owner per slice, then rotate. A single owner with
 * many queued jobs cannot occupy the tick until idle while others wait.
 * `globalInflight` is the number of overlapping drainOnce calls in this
 * process; it is not a cluster-wide lock.
 *
 * Slice rejection is isolated: other in-flight slices settle before this
 * function returns or rethrows. `isIdle` must be true only when claim found
 * nothing; `isRetry` keeps the owner in rotation (privacy requeue, lost lease,
 * graph-fence miss). A per-owner launch cap then drops a sticky retry owner.
 */
export async function fairDrainInterviewOwners<D, R>(
  deps: D,
  owners: readonly string[],
  budget: InterviewDispatchBudget,
  drainOnce: (deps: D, owner: string) => Promise<R>,
  isIdle: (result: R) => boolean,
  isRetry: (result: R) => boolean = () => false,
): Promise<FairDrainOnceResult> {
  if (budget.perOwnerInflight < 1 || budget.globalInflight < 1 || budget.perOwnerInflight > budget.globalInflight) {
    throw new Error('interview_dispatch_budget_invalid');
  }
  const remaining = new Set(owners);
  const ownerInflight = new Map<string, number>();
  const ownerLaunches = new Map<string, number>();
  const running = new Set<Promise<void>>();
  let claimed = 0;
  let idleRounds = 0;
  let cursor = 0;
  let firstError: unknown;

  const launch = (owner: string): void => {
    ownerInflight.set(owner, (ownerInflight.get(owner) ?? 0) + 1);
    ownerLaunches.set(owner, (ownerLaunches.get(owner) ?? 0) + 1);
    const work = drainOnce(deps, owner)
      .then((result) => {
        if (isIdle(result)) {
          remaining.delete(owner);
          idleRounds += 1;
          return;
        }
        if (!isRetry(result)) claimed += 1;
        if ((ownerLaunches.get(owner) ?? 0) >= DEFAULT_INTERVIEW_OWNER_LAUNCH_CAP) {
          remaining.delete(owner);
        }
      })
      .catch((error) => {
        remaining.delete(owner);
        firstError ??= error;
      })
      .finally(() => {
        ownerInflight.set(owner, Math.max(0, (ownerInflight.get(owner) ?? 1) - 1));
        running.delete(work);
      });
    running.add(work);
  };

  const pickNext = (): string | undefined => {
    if (owners.length === 0) return undefined;
    for (let offset = 0; offset < owners.length; offset++) {
      const owner = owners[(cursor + offset) % owners.length]!;
      if (!remaining.has(owner)) continue;
      if ((ownerInflight.get(owner) ?? 0) >= budget.perOwnerInflight) continue;
      if ((ownerLaunches.get(owner) ?? 0) >= DEFAULT_INTERVIEW_OWNER_LAUNCH_CAP) continue;
      cursor = (cursor + offset + 1) % owners.length;
      return owner;
    }
    return undefined;
  };

  while (remaining.size > 0 || running.size > 0) {
    while (running.size < budget.globalInflight) {
      const owner = pickNext();
      if (!owner) break;
      launch(owner);
    }
    if (running.size === 0) break;
    await Promise.race(running);
  }
  if (running.size > 0) await Promise.all(running);
  if (firstError) throw firstError;
  return { claimed, idleRounds };
}
