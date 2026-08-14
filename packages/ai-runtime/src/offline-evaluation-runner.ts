/**
 * Fixed local command registry for deterministic contract-regression gates.
 *
 * It is deliberately separate from the evaluation manifest: evaluation
 * content can select only a reviewed `gateId`, never a process command or
 * environment.  The process launcher lives in scripts/ so this module remains
 * testable and cannot itself execute anything.
 */
import { createHash } from 'node:crypto';
import {
  contractRegressionOracle,
  contractRegressionOracleDigest,
  type ContractRegressionGateId,
  type ContractRegressionExecutionPlan,
} from './offline-evaluation-execution.ts';

export interface OfflineContractGateCommand {
  command: 'pnpm';
  args: readonly string[];
  timeoutMs: number;
}

export const OFFLINE_CONTRACT_GATE_COMMANDS: Readonly<Record<ContractRegressionGateId, OfflineContractGateCommand>> = {
  'langfuse-runtime-isolated': { command: 'pnpm', args: ['runtime:isolated:prove'], timeoutMs: 300_000 },
  'langfuse-config-contract': { command: 'pnpm', args: ['langfuse-eval:prove'], timeoutMs: 60_000 },
  'api-feedback-isolation': { command: 'pnpm', args: ['api:validate'], timeoutMs: 300_000 },
  'isolated-environment': { command: 'pnpm', args: ['e2e-isolation:prove'], timeoutMs: 120_000 },
  'online-judge-control': { command: 'pnpm', args: ['online-judge-control:prove'], timeoutMs: 300_000 },
  'checkpoint-privacy-erasure': { command: 'pnpm', args: ['privacy-erasure:prove'], timeoutMs: 300_000 },
  'worker-production-graph-config': { command: 'pnpm', args: ['worker-production-config:prove'], timeoutMs: 60_000 },
  'checkpoint-runtime-role': { command: 'pnpm', args: ['checkpoint-role:prove'], timeoutMs: 300_000 },
  'memory-runtime': { command: 'pnpm', args: ['memory:prove'], timeoutMs: 300_000 },
  'rag-redis-configuration': { command: 'pnpm', args: ['rag-redis-config:prove'], timeoutMs: 60_000 },
  'rag-corpus-versioning': { command: 'pnpm', args: ['rag-corpus-version:prove'], timeoutMs: 300_000 },
  'scoring-integrity': { command: 'pnpm', args: ['scoring-integrity:prove'], timeoutMs: 300_000 },
  'voice-reliability': { command: 'pnpm', args: ['voice-reliability:prove'], timeoutMs: 60_000 },
  'migration-integrity': { command: 'pnpm', args: ['migrate:prove'], timeoutMs: 300_000 },
  'cloud-configuration': { command: 'pnpm', args: ['cloud-readiness:prove'], timeoutMs: 60_000 },
};

export interface OfflineContractGateResult {
  gateId: ContractRegressionGateId;
  status: 'passed' | 'failed' | 'timed_out';
  durationMs: number;
  exitCode: number | null;
  outputTruncated: boolean;
  /** Fixed oracle IDs whose complete PASS line was observed by the parent. */
  passedOracleIds: readonly string[];
}

export interface OfflineContractCaseResult {
  caseId: string;
  caseVersion: string;
  gateId: ContractRegressionGateId;
  oracleId: string;
  oracleDigest: string;
  profile: 'local-isolated-contract';
  /** A shared gate duration/result, never fabricated as an individual timing. */
  attribution: 'shared_gate';
  durationMs: number | null;
  exitCode: number | null;
  status: 'passed' | 'failed' | 'timed_out' | 'inconclusive';
}

export interface OfflineContractReceipt {
  schemaVersion: 1;
  classification: 'untrusted_local_contract_receipt';
  releaseEvidence: false;
  catalogDigest: string;
  /** Git commit is a base reference, never a substitute for the tree digest. */
  codeRevision: string;
  worktreeState: 'clean' | 'dirty' | 'unknown';
  /** SHA-256 of the actual tracked + untracked source tree executed locally. */
  executionTreeDigest: string | null;
  planComplete: boolean;
  cases: readonly OfflineContractCaseResult[];
  missing: readonly { caseId: string; caseVersion: string }[];
  gates: readonly OfflineContractGateResult[];
}

/**
 * Local gates inherit a tiny, positive environment allowlist.  A blacklist
 * will always miss a new credential family (object storage, payment, auth,
 * telemetry, package registry, etc.), so nothing from the caller's identity
 * or data plane is copied by default.
 */
export function sanitizedOfflineEvaluationEnvironment(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const allowed = ['PATH', 'LANG', 'LC_ALL', 'TZ'] as const;
  const clean: NodeJS.ProcessEnv = {};
  for (const key of allowed) if (env[key]) clean[key] = env[key];
  return clean;
}

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${stable(row[key])}`).join(',')}}`;
}

export function offlineContractReceiptDigest(receipt: OfflineContractReceipt): string {
  return createHash('sha256').update(stable(receipt), 'utf8').digest('hex');
}

/**
 * A PASS line must be complete.  Two legacy diagnostics expose a variable
 * count after a fixed `...:` prefix; no other substring or regular expression
 * matching is allowed.  Child stdout is not release evidence, but it is still
 * parsed by this fixed parent to prevent a gate exit code from claiming that
 * unrelated case assertions ran.
 */
export function passedContractOracleIds(
  gateId: ContractRegressionGateId,
  output: string,
  expectedOracleIds: readonly string[],
): readonly string[] {
  const lines = output.split(/\r?\n/);
  return expectedOracleIds.filter((oracleId) => {
    const oracle = contractRegressionOracle(oracleId);
    if (oracle.gateId !== gateId) throw new Error('offline_evaluation_oracle_gate_mismatch');
    return oracle.passLine.endsWith(':')
      ? lines.some((line) => line.startsWith(oracle.passLine))
      : lines.includes(oracle.passLine);
  });
}

export function buildOfflineContractReceipt(
  plan: ContractRegressionExecutionPlan,
  catalogDigest: string,
  executionIdentity: Pick<OfflineContractReceipt, 'codeRevision' | 'worktreeState' | 'executionTreeDigest'>,
  gates: readonly OfflineContractGateResult[],
): OfflineContractReceipt {
  const byGate = new Map(gates.map((gate) => [gate.gateId, gate]));
  return {
    schemaVersion: 1,
    classification: 'untrusted_local_contract_receipt',
    releaseEvidence: false,
    catalogDigest,
    ...executionIdentity,
    planComplete: plan.complete,
    cases: plan.bound.map((binding) => ({
      caseId: binding.caseId,
      caseVersion: binding.caseVersion,
      gateId: binding.gateId,
      oracleId: binding.oracleId,
      oracleDigest: contractRegressionOracleDigest(binding.oracleId),
      profile: 'local-isolated-contract',
      attribution: 'shared_gate',
      durationMs: byGate.get(binding.gateId)?.durationMs ?? null,
      exitCode: byGate.get(binding.gateId)?.exitCode ?? null,
      status: (() => {
        const gate = byGate.get(binding.gateId);
        if (!gate) return 'inconclusive';
        if (gate.status === 'timed_out') return 'timed_out';
        if (gate.status === 'failed') return 'failed';
        return gate.passedOracleIds.includes(binding.oracleId) ? 'passed' : 'inconclusive';
      })(),
    })),
    missing: plan.missing,
    gates,
  };
}
