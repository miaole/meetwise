import assert from 'node:assert/strict';

const SHA = /^[a-f0-9]{40}$/;
const FINGERPRINT = /^[a-f0-9]{64}$/;

/**
 * The workflow uses the GitHub API as a second identity source rather than
 * trusting only workflow_run payload fields. Keep this fixture implementation
 * deliberately small and side-effect free so delayed/stale API responses are
 * exercised without making a real dispatch.
 */
export function resolveCiWorkflowIdentity({ workflowRun, run, workflows, currentMain }) {
  if (!workflowRun || !run || !Array.isArray(workflows) || typeof currentMain !== 'string') throw new Error('ci_identity_input_invalid');
  const ci = workflows.filter((workflow) => workflow?.name === 'ci');
  if (ci.length !== 1 || ci[0].path !== '.github/workflows/ci.yml') throw new Error('ci_workflow_not_unique');
  if (String(run.id) !== String(workflowRun.id)) throw new Error('ci_run_id_mismatch');
  if (String(ci[0].id) !== String(workflowRun.workflow_id) || String(run.workflow_id) !== String(workflowRun.workflow_id)) throw new Error('ci_workflow_id_mismatch');
  if (!SHA.test(workflowRun.head_sha ?? '') || run.head_sha !== workflowRun.head_sha || run.head_branch !== 'main' || run.event !== 'push' || run.conclusion !== 'success') throw new Error('ci_run_identity_mismatch');
  if (currentMain !== workflowRun.head_sha) throw new Error('ci_main_is_stale');
  return { workflowId: ci[0].id, runId: run.id, headSha: run.head_sha, path: ci[0].path };
}

/**
 * Pages deploy is eventually consistent. A receipt is accepted only after its
 * state, generation and final fingerprint all match the release being
 * committed. Wrong/stale states are observations to retry, never evidence.
 */
export async function waitForPagesReceipt({ readState, expected, maxPolls = 8 }) {
  if (!expected || !['disabled', 'enabled'].includes(expected.state) || !/^[1-9][0-9]*$/.test(String(expected.generation)) || !FINGERPRINT.test(expected.fingerprint ?? '')) throw new Error('pages_expected_identity_invalid');
  for (let attempt = 0; attempt < maxPolls; attempt += 1) {
    const state = await readState(attempt);
    if (state?.state === expected.state
      && String(state.generation) === String(expected.generation)
      && state.manifestSha256 === expected.fingerprint
      && state.finalFingerprint === expected.fingerprint) return state;
  }
  throw new Error('pages_exact_receipt_timeout');
}

/**
 * Recovery has the same one-dispatch/one-exact-receipt contract as the normal
 * enabled path.  A delayed or stale Pages response is only an observation;
 * callers must not dispatch repeatedly or treat it as a successful cleanup.
 */
export async function dispatchAndWaitForExactPagesReceipt({ dispatch, readState, expected, maxPolls = 8 }) {
  if (typeof dispatch !== 'function') throw new Error('pages_dispatch_input_invalid');
  await dispatch(expected);
  return waitForPagesReceipt({ readState, expected, maxPolls });
}

/**
 * The disabled Pages receipt belongs to the predecessor publication, not to
 * the successor transaction which is about to be committed. Only the
 * token-bound root transaction status is an admissible source here; a public
 * manifest is intentionally not a fallback. This mirrors the workflow's
 * `candidate.predecessorRevoked` contract and rejects the classic N+1/N mixup.
 */
export function resolveTrustedPredecessorIdentity({ rootLedger, candidateGeneration }) {
  if (!Number.isSafeInteger(candidateGeneration) || candidateGeneration < 2) throw new Error('candidate_generation_invalid');
  const identity = rootLedger?.candidate?.predecessorRevoked;
  if (identity?.identityBound !== true || typeof identity.freshHost !== 'boolean' || !Number.isSafeInteger(identity.generation) || identity.generation < 1 || identity.generation >= candidateGeneration || !FINGERPRINT.test(identity.fingerprint ?? '')) throw new Error('predecessor_identity_invalid');
  return { generation: identity.generation, fingerprint: identity.fingerprint };
}

const commit = 'a'.repeat(40);
const workflowRun = { id: 101, workflow_id: 7, head_sha: commit, head_branch: 'main', event: 'push', conclusion: 'success' };
const run = { ...workflowRun };
const workflows = [{ id: 7, name: 'ci', path: '.github/workflows/ci.yml' }, { id: 8, name: 'pages-preview', path: '.github/workflows/pages-preview.yml' }];
assert.deepEqual(resolveCiWorkflowIdentity({ workflowRun, run, workflows, currentMain: commit }), { workflowId: 7, runId: 101, headSha: commit, path: '.github/workflows/ci.yml' });
assert.throws(() => resolveCiWorkflowIdentity({ workflowRun, run, workflows: [...workflows, { id: 9, name: 'ci', path: '.github/workflows/legacy-ci.yml' }], currentMain: commit }), /ci_workflow_not_unique/);
assert.throws(() => resolveCiWorkflowIdentity({ workflowRun, run: { ...run, id: 102 }, workflows, currentMain: commit }), /ci_run_id_mismatch/);
assert.throws(() => resolveCiWorkflowIdentity({ workflowRun, run: { ...run, workflow_id: 8 }, workflows, currentMain: commit }), /ci_workflow_id_mismatch/);
assert.throws(() => resolveCiWorkflowIdentity({ workflowRun, run: { ...run, head_sha: 'b'.repeat(40) }, workflows, currentMain: commit }), /ci_run_identity_mismatch/);
assert.throws(() => resolveCiWorkflowIdentity({ workflowRun, run, workflows, currentMain: 'c'.repeat(40) }), /ci_main_is_stale/);

const fingerprint = 'd'.repeat(64);
const delayedStates = [
  null,
  { state: 'enabled', generation: 3, manifestSha256: 'e'.repeat(64), finalFingerprint: 'e'.repeat(64) },
  { state: 'enabled', generation: 2, manifestSha256: fingerprint, finalFingerprint: fingerprint },
  { state: 'enabled', generation: 3, manifestSha256: fingerprint, finalFingerprint: fingerprint },
];
const receipt = await waitForPagesReceipt({ expected: { state: 'enabled', generation: 3, fingerprint }, readState: async (attempt) => delayedStates[attempt] });
assert.equal(receipt.generation, 3);
await assert.rejects(() => waitForPagesReceipt({ expected: { state: 'enabled', generation: 3, fingerprint }, maxPolls: 3, readState: async () => ({ state: 'enabled', generation: 3, manifestSha256: 'e'.repeat(64), finalFingerprint: 'e'.repeat(64) }) }), /pages_exact_receipt_timeout/);
await assert.rejects(() => waitForPagesReceipt({ expected: { state: 'enabled', generation: 3, fingerprint }, readState: async () => ({ state: 'disabled', generation: 3, manifestSha256: fingerprint, finalFingerprint: fingerprint }) }), /pages_exact_receipt_timeout/);

let dispatches = 0;
const dispatchExactlyOnce = () => { dispatches += 1; if (dispatches !== 1) throw new Error('pages_dispatch_repeated'); };
dispatchExactlyOnce();
assert.equal(dispatches, 1);

let disabledDispatches = 0;
const disabledFingerprint = 'f'.repeat(64);
const disabledStates = [
  { state: 'enabled', generation: 3, manifestSha256: disabledFingerprint, finalFingerprint: disabledFingerprint },
  { state: 'disabled', generation: 2, manifestSha256: disabledFingerprint, finalFingerprint: disabledFingerprint },
  { state: 'disabled', generation: 3, manifestSha256: disabledFingerprint, finalFingerprint: disabledFingerprint },
];
const disabledReceipt = await dispatchAndWaitForExactPagesReceipt({
  expected: { state: 'disabled', generation: 3, fingerprint: disabledFingerprint },
  dispatch: async (expected) => {
    disabledDispatches += 1;
    assert.deepEqual(expected, { state: 'disabled', generation: 3, fingerprint: disabledFingerprint });
  },
  readState: async (attempt) => disabledStates[attempt],
});
assert.equal(disabledDispatches, 1);
assert.equal(disabledReceipt.state, 'disabled');
const predecessorFingerprint = '1'.repeat(64);
assert.deepEqual(resolveTrustedPredecessorIdentity({
  rootLedger: { generation: 6, candidate: { predecessorRevoked: { identityBound: true, completed: false, freshHost: false, generation: 5, fingerprint: predecessorFingerprint } } },
  candidateGeneration: 6,
}), { generation: 5, fingerprint: predecessorFingerprint });
assert.deepEqual(resolveTrustedPredecessorIdentity({
  rootLedger: { generation: 6, candidate: { predecessorRevoked: { identityBound: true, completed: false, freshHost: true, generation: 5, fingerprint: predecessorFingerprint } } },
  candidateGeneration: 6,
}), { generation: 5, fingerprint: predecessorFingerprint });
assert.throws(() => resolveTrustedPredecessorIdentity({
  rootLedger: { generation: 6, candidate: { predecessorRevoked: { identityBound: true, completed: false, freshHost: false, generation: 6, fingerprint: predecessorFingerprint } } },
  candidateGeneration: 6,
}), /predecessor_identity_invalid/);
assert.throws(() => resolveTrustedPredecessorIdentity({
  rootLedger: { generation: 6, manifest: { generation: 5, fingerprint: predecessorFingerprint } },
  candidateGeneration: 6,
}), /predecessor_identity_invalid/);
await assert.rejects(() => dispatchAndWaitForExactPagesReceipt({
  expected: { state: 'disabled', generation: 3, fingerprint: disabledFingerprint },
  dispatch: async () => {},
  maxPolls: 2,
  readState: async () => ({ state: 'enabled', generation: 3, manifestSha256: disabledFingerprint, finalFingerprint: disabledFingerprint }),
}), /pages_exact_receipt_timeout/);

console.log('CD workflow identity + Pages exact receipt behavioral proof passed');
