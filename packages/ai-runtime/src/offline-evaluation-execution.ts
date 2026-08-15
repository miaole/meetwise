/**
 * Offline contract-regression execution planning.
 *
 * This module intentionally does not run a shell command.  A separate root
 * runner owns the small, reviewed gate allowlist.  Keeping a manifest from
 * naming a command/path/URL prevents an evaluation item from becoming an
 * arbitrary command-execution capability in CI.
 */
import { createHash } from 'node:crypto';
import type { EvaluationManifest } from './evaluation-manifest.ts';

export const CONTRACT_REGRESSION_GATE_IDS = [
  'langfuse-runtime-isolated',
  'langfuse-config-contract',
  'api-feedback-isolation',
  'isolated-environment',
  'online-judge-control',
  'checkpoint-privacy-erasure',
  'worker-production-graph-config',
  'checkpoint-runtime-role',
  'memory-runtime',
  'rag-redis-configuration',
  'rag-corpus-versioning',
  'scoring-integrity',
  'voice-reliability',
  'migration-integrity',
  'cloud-configuration',
] as const;

export type ContractRegressionGateId = (typeof CONTRACT_REGRESSION_GATE_IDS)[number];

/**
 * A local-contract oracle is deliberately a reviewed, fixed assertion emitted
 * by an existing deterministic gate.  It is not a release-grade oracle: the
 * child process is still untrusted local code.  It does prevent a zero exit
 * code for one broad gate from being fanned out into several invented case
 * passes.
 */
export interface ContractRegressionOracle {
  oracleId: string;
  gateId: ContractRegressionGateId;
  /** Entire stdout line, including its fixed PASS/✓ prefix. */
  passLine: string;
}

export const CONTRACT_REGRESSION_ORACLES_V1: readonly ContractRegressionOracle[] = [
  { oracleId: 'lf-sec-pseudonym-payload-v1', gateId: 'langfuse-runtime-isolated', passLine: 'PASS  外送元数据只含数值/枚举/HMAC 伪名，不含原 owner/thread/幂等键/来源' },
  { oracleId: 'lf-sec-pseudonym-namespace-v1', gateId: 'langfuse-runtime-isolated', passLine: 'PASS  同密钥同标识的外送伪名稳定、不同命名空间不可混用' },
  { oracleId: 'lf-config-disabled-v1', gateId: 'langfuse-config-contract', passLine: 'PASS  开关关闭时不要求外部凭据且明确 disabled' },
  { oracleId: 'lf-config-conflict-v1', gateId: 'langfuse-config-contract', passLine: 'PASS  启用时 BASE_URL/HOST 冲突明确拒绝' },
  { oracleId: 'feedback-not-exported-v1', gateId: 'api-feedback-isolation', passLine: 'PASS  反馈原文只入业务反馈表，不触发模型/trace，因而不能经 Langfuse 外送' },
  { oracleId: 'lf-ingest-scalar-span-v1', gateId: 'langfuse-runtime-isolated', passLine: 'PASS  span 只含标量字段(无 prompt/简历原文,脱敏 by construction)' },
  { oracleId: 'lf-observability-span-v1', gateId: 'langfuse-runtime-isolated', passLine: 'PASS  ok span 出且带延迟(latencyMs>=0)' },
  { oracleId: 'lf-isolation-env-v1', gateId: 'isolated-environment', passLine: 'PASS isolated environment:' },
  { oracleId: 'isolated-diagnostic-redaction-v1', gateId: 'isolated-environment', passLine: 'PASS isolated diagnostics:' },
  { oracleId: 'judge-ten-percent-v1', gateId: 'online-judge-control', passLine: 'PASS  137 条同分层候选精确关闭 13 个 lot；任意完整前缀的 selected=13≤floor(137/10)' },
  { oracleId: 'judge-business-isolation-v1', gateId: 'online-judge-control', passLine: 'PASS  Judge 控制面无敏感正文列，且所有 selection/unknown/revoke 后业务账本、分数、权益与事件完全不变' },
  { oracleId: 'checkpoint-erasure-v1', gateId: 'checkpoint-privacy-erasure', passLine: 'PASS  专用 purge 按三表固定顺序物理删除、读回 marker=0、并将 enrollment 置 purged' },
  { oracleId: 'legacy-graph-disabled-v1', gateId: 'worker-production-graph-config', passLine: 'PASS  生产组合根显式 ADAPTIVE_INTERVIEW=0 时拒绝启动旧固定题单' },
  { oracleId: 'checkpoint-cross-tenant-v1', gateId: 'checkpoint-runtime-role', passLine: 'PASS  A/B checkpoint RLS：B 的真实 saver 恢复、SELECT、UPDATE、DELETE 成功数均为 0' },
  { oracleId: 'checkpoint-runtime-role-v1', gateId: 'checkpoint-runtime-role', passLine: 'PASS  低权登录不能绕开 app_role 直接读取 checkpoint 表' },
  { oracleId: 'memory-episode-once-v1', gateId: 'memory-runtime', passLine: 'PASS  同批归一化去重:恰 2 条 episode(重复题面合一)' },
  { oracleId: 'rag-redis-tls-v1', gateId: 'rag-redis-configuration', passLine: 'PASS  生产环境拒绝明文 redis://' },
  { oracleId: 'rag-corpus-version-v1', gateId: 'rag-corpus-versioning', passLine: 'PASS  rollback to an older content epoch is rejected instead of serving a mixed corpus' },
  { oracleId: 'score-unscored-terminal-v1', gateId: 'scoring-integrity', passLine: 'PASS  unscored 使 Agent 明确收敛，不驱动能力画像/追问' },
  { oracleId: 'migration-empty-target-v1', gateId: 'migration-integrity', passLine: 'PASS  非空且无迁移账本: DDL 前拒绝破坏性 baseline' },
  { oracleId: 'cloud-config-no-fallback-v1', gateId: 'cloud-configuration', passLine: '✓ cloud readiness 只读门禁 proof 全部通过' },
] as const;

const ORACLES_BY_ID = new Map(CONTRACT_REGRESSION_ORACLES_V1.map((oracle) => [oracle.oracleId, oracle]));

export function contractRegressionOracle(oracleId: string): ContractRegressionOracle {
  const oracle = ORACLES_BY_ID.get(oracleId);
  if (!oracle) throw new Error('offline_evaluation_binding_oracle_unknown');
  return oracle;
}

export function contractRegressionOracleDigest(oracleId: string): string {
  const oracle = contractRegressionOracle(oracleId);
  return createHash('sha256').update(`${oracle.oracleId}\u0000${oracle.gateId}\u0000${oracle.passLine}`, 'utf8').digest('hex');
}

export interface ContractRegressionBinding {
  caseId: string;
  caseVersion: string;
  gateId: ContractRegressionGateId;
  oracleId: string;
}

/**
 * Only entries backed by a real existing deterministic test gate may appear
 * here.  Missing entries are a release block, never a silent skip.
 */
export const CONTRACT_REGRESSION_BINDINGS_V1: readonly ContractRegressionBinding[] = [
  { caseId: 'LF-SEC-001', caseVersion: 'v1', gateId: 'langfuse-runtime-isolated', oracleId: 'lf-sec-pseudonym-payload-v1' },
  { caseId: 'LF-SEC-002', caseVersion: 'v1', gateId: 'langfuse-runtime-isolated', oracleId: 'lf-sec-pseudonym-namespace-v1' },
  { caseId: 'LF-CFG-001', caseVersion: 'v1', gateId: 'langfuse-config-contract', oracleId: 'lf-config-disabled-v1' },
  { caseId: 'LF-CFG-002', caseVersion: 'v1', gateId: 'langfuse-config-contract', oracleId: 'lf-config-conflict-v1' },
  { caseId: 'LF-FB-001', caseVersion: 'v1', gateId: 'api-feedback-isolation', oracleId: 'feedback-not-exported-v1' },
  { caseId: 'LF-INGEST-001', caseVersion: 'v1', gateId: 'langfuse-runtime-isolated', oracleId: 'lf-ingest-scalar-span-v1' },
  { caseId: 'LF-OBS-001', caseVersion: 'v1', gateId: 'langfuse-runtime-isolated', oracleId: 'lf-observability-span-v1' },
  { caseId: 'LF-ISO-001', caseVersion: 'v1', gateId: 'isolated-environment', oracleId: 'lf-isolation-env-v1' },
  { caseId: 'EVAL-ONLINE-001', caseVersion: 'v1', gateId: 'online-judge-control', oracleId: 'judge-ten-percent-v1' },
  { caseId: 'EVAL-ONLINE-002', caseVersion: 'v1', gateId: 'online-judge-control', oracleId: 'judge-business-isolation-v1' },
  { caseId: 'GRAPH-PRIV-001', caseVersion: 'v1', gateId: 'checkpoint-privacy-erasure', oracleId: 'checkpoint-erasure-v1' },
  { caseId: 'GRAPH-CFG-001', caseVersion: 'v1', gateId: 'worker-production-graph-config', oracleId: 'legacy-graph-disabled-v1' },
  { caseId: 'GRAPH-RLS-001', caseVersion: 'v1', gateId: 'checkpoint-runtime-role', oracleId: 'checkpoint-cross-tenant-v1' },
  { caseId: 'GRAPH-ROLE-001', caseVersion: 'v1', gateId: 'checkpoint-runtime-role', oracleId: 'checkpoint-runtime-role-v1' },
  { caseId: 'GRAPH-MEM-002', caseVersion: 'v1', gateId: 'memory-runtime', oracleId: 'memory-episode-once-v1' },
  { caseId: 'RAG-CACHE-001', caseVersion: 'v1', gateId: 'rag-redis-configuration', oracleId: 'rag-redis-tls-v1' },
  { caseId: 'RAG-VERSION-001', caseVersion: 'v1', gateId: 'rag-corpus-versioning', oracleId: 'rag-corpus-version-v1' },
  { caseId: 'SCORE-STATE-001', caseVersion: 'v1', gateId: 'scoring-integrity', oracleId: 'score-unscored-terminal-v1' },
  { caseId: 'E2E-TARGET-001', caseVersion: 'v1', gateId: 'isolated-environment', oracleId: 'isolated-diagnostic-redaction-v1' },
  { caseId: 'MIGRATION-001', caseVersion: 'v1', gateId: 'migration-integrity', oracleId: 'migration-empty-target-v1' },
  { caseId: 'CLOUD-CONFIG-001', caseVersion: 'v1', gateId: 'cloud-configuration', oracleId: 'cloud-config-no-fallback-v1' },
] as const;

export interface ContractRegressionExecutionPlan {
  bound: readonly ContractRegressionBinding[];
  missing: readonly { caseId: string; caseVersion: string }[];
  complete: boolean;
}

function caseKey(caseId: string, caseVersion: string): string {
  return `${caseId}@${caseVersion}`;
}

/**
 * Returns an explicit incomplete plan rather than pretending an unbound
 * catalogue case passed.  The caller decides whether it is allowed to run a
 * diagnostic partial plan; release/CI strict profiles must reject it.
 */
export function planContractRegressionExecution(
  manifest: EvaluationManifest,
  bindings: readonly ContractRegressionBinding[] = CONTRACT_REGRESSION_BINDINGS_V1,
): ContractRegressionExecutionPlan {
  const regression = manifest.cases.filter((entry) => entry.dataset === 'contract-regression');
  const expected = new Map(regression.map((entry) => [caseKey(entry.caseId, entry.caseVersion), entry]));
  const seen = new Set<string>();
  for (const binding of bindings) {
    const key = caseKey(binding.caseId, binding.caseVersion);
    if (!expected.has(key)) throw new Error('offline_evaluation_binding_case_unknown');
    if (seen.has(key)) throw new Error('offline_evaluation_binding_duplicate');
    if (!(CONTRACT_REGRESSION_GATE_IDS as readonly string[]).includes(binding.gateId)) {
      throw new Error('offline_evaluation_binding_gate_unknown');
    }
    if (contractRegressionOracle(binding.oracleId).gateId !== binding.gateId) {
      throw new Error('offline_evaluation_binding_oracle_gate_mismatch');
    }
    seen.add(key);
  }
  const missing = [...expected.values()]
    .filter((entry) => !seen.has(caseKey(entry.caseId, entry.caseVersion)))
    .map((entry) => ({ caseId: entry.caseId, caseVersion: entry.caseVersion }))
    .sort((a, b) => caseKey(a.caseId, a.caseVersion).localeCompare(caseKey(b.caseId, b.caseVersion)));
  return { bound: [...bindings], missing, complete: missing.length === 0 };
}

export function requireCompleteContractRegressionPlan(plan: ContractRegressionExecutionPlan): void {
  if (!plan.complete) throw new Error('offline_evaluation_contract_regression_unbound');
}
