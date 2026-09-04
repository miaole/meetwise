/**
 * Local, untrusted review receipts for the E2E platform loop.
 *
 * AI output is never trusted by default. A green command list is verification
 * evidence only. Review stays mandatory. Multi-round writes a new file.
 * Receipts stay under repo .tmp and never store secrets. releaseEvidence=false.
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { existsSync, lstatSync } from 'node:fs';
import { relative, resolve } from 'node:path';

export const RELEASE_EVIDENCE = false;
export const REVIEW_RECORD_CLASS = 'local_untrusted_e2e_platform_review';
export const REVIEW_STATUSES = Object.freeze(['pending_review', 'rejected']);
export const STEP_IDS = Object.freeze(['refactor', 'test', 'ui', 'regression']);
export const STEP_OUTCOMES = Object.freeze(['passed', 'failed', 'not_run', 'not_requested']);
export const RUNNER_KINDS = Object.freeze(['pnpm_spawn', 'injected_for_proof']);
export const ALLOWED_STEP_COMMANDS = Object.freeze([
  'pnpm e2e-platform:check',
  'pnpm e2e-platform:prove',
  'pnpm e2e:ui:isolated',
  'pnpm regression',
]);
export const SKIP_REASONS = Object.freeze(['live_provider_key_missing']);

const SOURCE_PATHS = Object.freeze([
  'scripts/e2e-platform/check.mjs',
  'scripts/e2e-platform/core-boundaries.mjs',
  'scripts/e2e-platform/directory-contract.mjs',
  'scripts/e2e-platform/review-loop.mjs',
  'scripts/e2e-platform/review-record.mjs',
  'scripts/e2e-platform/trust-guard.mjs',
  'ai-docs/testing/conventions/e2e-directory-contract.md',
]);

const FORBIDDEN_KEY_PATTERN = /^(token|password|prompt|answer|rawoutput|secret|apikey|authorization|env|model_api_key|stdout|stderr)$/i;

const RECEIPT_KEYS = Object.freeze([
  'schemaVersion', 'class', 'round', 'predecessorReceiptId', 'reviewStatus',
  'aiOutputTrusted', 'releaseEvidence', 'liveE2E', 'runnerKind', 'steps',
  'platformSourceDigests', 'startedAt', 'finishedAt', 'durationMs', 'dataHandling',
]);

const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`;

function assertPlainObject(value, code) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error(code);
}

function assertIsoDate(value, code) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) throw new Error(code);
}

function assertNoSecretKeys(value, label) {
  if (value === null || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEY_PATTERN.test(key)) throw new Error(`e2e_review_secret_field:${label}:${key}`);
    if (typeof value[key] === 'object') assertNoSecretKeys(value[key], `${label}.${key}`);
  }
}

async function sourceDigests(repoRoot) {
  return Object.fromEntries(await Promise.all(SOURCE_PATHS.map(async (sourcePath) => [
    sourcePath,
    sha256(await readFile(resolve(repoRoot, sourcePath))),
  ])));
}

export function assertReviewSteps(steps) {
  assertPlainObject(steps, 'e2e_review_steps_invalid');
  const keys = Object.keys(steps);
  if (keys.length !== STEP_IDS.length || STEP_IDS.some((id) => !keys.includes(id))) {
    throw new Error('e2e_review_steps_missing');
  }
  for (const id of STEP_IDS) {
    const step = steps[id];
    assertPlainObject(step, `e2e_review_step_invalid:${id}`);
    assertNoSecretKeys(step, id);
    if (!ALLOWED_STEP_COMMANDS.includes(step.command)) {
      throw new Error(`e2e_review_step_command_invalid:${id}`);
    }
    if (!STEP_OUTCOMES.includes(step.outcome)) throw new Error(`e2e_review_step_outcome_invalid:${id}`);
    if (step.exit !== null && (!Number.isInteger(step.exit) || step.exit < 0 || step.exit > 255)) {
      throw new Error(`e2e_review_step_exit_invalid:${id}`);
    }
    if (step.outcome === 'passed' && step.exit !== 0) throw new Error(`e2e_review_step_pass_exit_mismatch:${id}`);
    if (step.outcome === 'failed' && (step.exit === 0 || step.exit === null)) {
      throw new Error(`e2e_review_step_fail_exit_mismatch:${id}`);
    }
    if ((step.outcome === 'not_run' || step.outcome === 'not_requested') && step.exit !== null) {
      throw new Error(`e2e_review_step_not_run_must_omit_exit:${id}`);
    }
    if (step.skipReason !== undefined) {
      if (step.outcome !== 'not_run' || !SKIP_REASONS.includes(step.skipReason)) {
        throw new Error(`e2e_review_step_skip_reason_invalid:${id}`);
      }
    }
    const extra = Object.keys(step).filter((key) => !['command', 'outcome', 'exit', 'skipReason'].includes(key));
    if (extra.length) throw new Error(`e2e_review_step_extra_key:${id}:${extra.join(',')}`);
  }
}

export function assertStatusMatchesSteps(reviewStatus, steps) {
  const blocking = STEP_IDS.filter((id) => ['failed', 'not_run'].includes(steps[id].outcome));
  if (reviewStatus === 'pending_review' && blocking.length) {
    throw new Error(`e2e_review_status_step_mismatch:pending_review:${blocking.join(',')}`);
  }
  if (reviewStatus === 'rejected' && blocking.length === 0) {
    throw new Error('e2e_review_status_step_mismatch:rejected');
  }
}

export async function writeReviewRecord({
  repoRoot,
  receiptRoot,
  round = 1,
  predecessorReceiptId = null,
  reviewStatus,
  aiOutputTrusted = false,
  runnerKind,
  liveE2E = 'not_requested',
  steps,
  startedAt,
  finishedAt,
  ...rest
}) {
  const extra = Object.keys(rest);
  if (extra.length) throw new Error(`e2e_review_forbidden_field:${extra.join(',')}`);
  if (aiOutputTrusted !== false) throw new Error('e2e_review_ai_output_trusted_forbidden');
  if (!REVIEW_STATUSES.includes(reviewStatus)) throw new Error(`e2e_review_status_invalid:${reviewStatus}`);
  if (!RUNNER_KINDS.includes(runnerKind)) throw new Error(`e2e_review_runner_kind_invalid:${runnerKind}`);
  if (liveE2E !== 'not_requested') throw new Error('e2e_review_live_e2e_claim_forbidden');
  if (!Number.isInteger(round) || round < 1 || round > 1_000) throw new Error('e2e_review_round_invalid');
  if (predecessorReceiptId !== null && (typeof predecessorReceiptId !== 'string' || !/^[A-Za-z0-9._:-]{8,180}$/.test(predecessorReceiptId))) {
    throw new Error('e2e_review_predecessor_invalid');
  }
  assertIsoDate(startedAt, 'e2e_review_time_invalid');
  assertIsoDate(finishedAt, 'e2e_review_time_invalid');
  if (finishedAt < startedAt) throw new Error('e2e_review_time_invalid');
  assertReviewSteps(steps);
  assertStatusMatchesSteps(reviewStatus, steps);
  assertNoSecretKeys({ steps, reviewStatus, runnerKind }, 'receipt');

  const root = resolve(repoRoot);
  const tmpRoot = resolve(root, '.tmp');
  const outputRoot = resolve(receiptRoot);
  if (outputRoot !== tmpRoot && !outputRoot.startsWith(`${tmpRoot}/`)) {
    throw new Error('e2e_review_receipt_root_outside_tmp');
  }
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  const receiptId = `${finishedAt.toISOString().replace(/[:.]/g, '-')}-r${round}-${process.pid}-${randomUUID()}`;
  const finalPath = resolve(outputRoot, `${receiptId}.json`);
  const temporaryPath = resolve(outputRoot, `${receiptId}.partial.json`);
  if (!finalPath.startsWith(`${outputRoot}/`) || !temporaryPath.startsWith(`${outputRoot}/`)) {
    throw new Error('e2e_review_path_escape');
  }
  if (existsSync(finalPath)) throw new Error('e2e_review_overwrite_forbidden');

  if (predecessorReceiptId) {
    const predecessorPath = resolve(outputRoot, `${predecessorReceiptId}.json`);
    if (!predecessorPath.startsWith(`${outputRoot}/`) || !existsSync(predecessorPath) || !lstatSync(predecessorPath).isFile()) {
      throw new Error('e2e_review_predecessor_missing');
    }
  }

  const receipt = {
    schemaVersion: 1,
    class: REVIEW_RECORD_CLASS,
    round,
    predecessorReceiptId,
    reviewStatus,
    aiOutputTrusted: false,
    releaseEvidence: RELEASE_EVIDENCE,
    liveE2E: 'not_requested',
    runnerKind,
    steps,
    platformSourceDigests: await sourceDigests(root),
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    dataHandling: 'no_output_prompt_answer_token_endpoint_or_connection_string_persisted',
  };
  const unknownKeys = Object.keys(receipt).filter((key) => !RECEIPT_KEYS.includes(key));
  if (unknownKeys.length) throw new Error(`e2e_review_schema_drift:${unknownKeys.join(',')}`);

  await writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  await rename(temporaryPath, finalPath);
  return { receipt, receiptId, finalPath, relativePath: relative(root, finalPath) };
}
