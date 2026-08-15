/**
 * Executes the fixed deterministic contract-regression gate plan.
 *
 * This is intentionally a local, untrusted diagnostic receipt: no model,
 * Langfuse, cloud, database URL or customer fixture is inherited. It neither
 * sends data to Langfuse nor grants a release. Strict mode refuses to hide an
 * unbound regression case; `--allow-incomplete` is only for diagnosing the
 * already-bound gates while preserving a non-zero final exit.
 */
import { execFileSync, spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { lstatSync, mkdirSync, readFileSync, readlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OFFLINE_CONTRACT_GATE_COMMANDS,
  OFFLINE_EVALUATION_CATALOG_V1,
  buildOfflineContractReceipt,
  evaluationManifestDigest,
  offlineContractReceiptDigest,
  passedContractOracleIds,
  planContractRegressionExecution,
  requireCompleteContractRegressionPlan,
  sanitizedOfflineEvaluationEnvironment,
  type ContractRegressionGateId,
  type OfflineContractGateResult,
} from '../src/index.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
const allowIncomplete = process.argv.includes('--allow-incomplete');
const localRunnerHome = resolve(repoRoot, '.tmp', 'offline-evaluation-runner-home');
const localRunnerTmp = resolve(repoRoot, '.tmp', 'offline-evaluation-runner-tmp');
const MAX_CHILD_OUTPUT_BYTES = 256 * 1024;

function executionCodeRevision(): string {
  try { return execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8').trim() || 'unknown'; }
  catch { return 'unknown'; }
}

function localWorktreeIdentity(): { codeRevision: string; worktreeState: 'clean' | 'dirty' | 'unknown'; executionTreeDigest: string | null } {
  const head = executionCodeRevision();
  try {
    const status = execFileSync('git', ['status', '--porcelain=v1', '-z'], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] });
    const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString('utf8').split('\0').filter(Boolean).sort();
    const digest = createHash('sha256');
    for (const relative of files) {
      if (relative.startsWith('../')) throw new Error('offline_evaluation_tree_path_invalid');
      const absolute = resolve(repoRoot, relative);
      digest.update(relative, 'utf8');
      try {
        const stat = lstatSync(absolute);
        if (stat.isSymbolicLink()) digest.update(readlinkSync(absolute), 'utf8');
        else if (stat.isFile()) digest.update(readFileSync(absolute));
        else throw new Error('offline_evaluation_tree_entry_invalid');
      } catch (error: unknown) {
        // A deleted tracked file is part of the executed dirty tree.  Encode
        // that fact deterministically rather than downgrading the entire
        // diagnostic receipt to unknown (or, worse, pretending HEAD ran).
        if ((error as NodeJS.ErrnoException | undefined)?.code !== 'ENOENT') throw error;
        digest.update('missing-from-worktree', 'utf8');
      }
      digest.update('\0', 'utf8');
    }
    return {
      codeRevision: head,
      worktreeState: status.length === 0 ? 'clean' : 'dirty',
      executionTreeDigest: digest.digest('hex'),
    };
  } catch {
    return { codeRevision: head, worktreeState: 'unknown', executionTreeDigest: null };
  }
}

function offlineChildEnvironment(): NodeJS.ProcessEnv {
  return {
    ...sanitizedOfflineEvaluationEnvironment(process.env),
    HOME: localRunnerHome,
    TMPDIR: localRunnerTmp,
    TEMP: localRunnerTmp,
    TMP: localRunnerTmp,
    CI: 'true',
  };
}

async function runGate(gateId: ContractRegressionGateId, expectedOracleIds: readonly string[]): Promise<OfflineContractGateResult> {
  const gate = OFFLINE_CONTRACT_GATE_COMMANDS[gateId];
  const started = performance.now();
  let timedOut = false;
  let output = '';
  let outputBytes = 0;
  let outputTruncated = false;
  const exitCode = await new Promise<number | null>((resolveResult) => {
    const child = spawn(gate.command, [...gate.args], {
      cwd: repoRoot,
      env: offlineChildEnvironment(),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      // Every supported local profile is POSIX.  A separate process group is
      // necessary because pnpm can otherwise leave node/docker descendants
      // running after its parent has timed out.
      detached: process.platform !== 'win32',
    });
    child.stdout.on('data', (chunk: Buffer) => {
      outputBytes += chunk.length;
      if (output.length < MAX_CHILD_OUTPUT_BYTES) {
        const remaining = MAX_CHILD_OUTPUT_BYTES - Buffer.byteLength(output);
        output += chunk.subarray(0, Math.max(0, remaining)).toString('utf8');
      }
      if (outputBytes > MAX_CHILD_OUTPUT_BYTES) outputTruncated = true;
    });
    // stderr can include fixtures, endpoints and provider diagnostics. Drain it
    // to avoid back pressure, but never print or persist it.
    child.stderr.on('data', () => {});
    let settled = false;
    const settle = (code: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveResult(code);
    };
    const terminateGroup = (signal: NodeJS.Signals) => {
      try {
        if (child.pid && process.platform !== 'win32') process.kill(-child.pid, signal);
        else child.kill(signal);
      } catch { /* already exited */ }
    };
    const timer = setTimeout(() => {
      timedOut = true;
      terminateGroup('SIGTERM');
      setTimeout(() => terminateGroup('SIGKILL'), 5_000).unref();
    }, gate.timeoutMs);
    child.once('error', () => settle(null));
    child.once('exit', (code) => settle(code));
  });
  const status = timedOut ? 'timed_out' : exitCode === 0 && !outputTruncated ? 'passed' : 'failed';
  return {
    gateId,
    status,
    durationMs: Math.round(performance.now() - started),
    exitCode,
    outputTruncated,
    passedOracleIds: status === 'passed' ? passedContractOracleIds(gateId, output, expectedOracleIds) : [],
  };
}

function writeReceipt(receipt: ReturnType<typeof buildOfflineContractReceipt>): string {
  const outputRoot = resolve(repoRoot, '.tmp', 'offline-evaluation-receipts');
  mkdirSync(outputRoot, { recursive: true });
  const receiptDigest = offlineContractReceiptDigest(receipt);
  const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}.json`;
  const path = resolve(outputRoot, filename);
  // The receipt intentionally has IDs/results only; child stdout/stderr and
  // case inputs are not copied because they might later contain sensitive data.
  writeFileSync(path, `${JSON.stringify({ ...receipt, receiptDigest }, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  return path;
}

async function main(): Promise<void> {
  const plan = planContractRegressionExecution(OFFLINE_EVALUATION_CATALOG_V1);
  if (!allowIncomplete) requireCompleteContractRegressionPlan(plan);
  mkdirSync(localRunnerHome, { recursive: true, mode: 0o700 });
  mkdirSync(localRunnerTmp, { recursive: true, mode: 0o700 });
  const gateOracleIds = new Map<ContractRegressionGateId, string[]>();
  for (const binding of plan.bound) {
    const values = gateOracleIds.get(binding.gateId) ?? [];
    values.push(binding.oracleId);
    gateOracleIds.set(binding.gateId, values);
  }
  const results: OfflineContractGateResult[] = [];
  for (const [gateId, oracleIds] of gateOracleIds) results.push(await runGate(gateId, oracleIds));
  const receipt = buildOfflineContractReceipt(plan, evaluationManifestDigest(OFFLINE_EVALUATION_CATALOG_V1), localWorktreeIdentity(), results);
  const path = writeReceipt(receipt);
  const outcome = receipt.planComplete && receipt.cases.every((entry) => entry.status === 'passed') ? 'passed' : 'inconclusive_or_failed';
  const passedCases = receipt.cases.filter((entry) => entry.status === 'passed').length;
  console.log(`offline_contract_receipt=${path} outcome=${outcome} casePassed=${passedCases}/${receipt.cases.length} missing=${receipt.missing.length} releaseEvidence=false`);
  if (outcome !== 'passed') process.exitCode = 1;
}

main().catch((error: unknown) => {
  // The error codes are fixed. Do not print command/environment diagnostics.
  const code = error instanceof Error && /^offline_evaluation_[a-z0-9_]+$/.test(error.message)
    ? error.message
    : 'offline_evaluation_contract_runner_failed';
  console.error(code);
  process.exit(1);
});
