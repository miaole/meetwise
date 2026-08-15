import {
  OFFLINE_CONTRACT_GATE_COMMANDS,
  OFFLINE_EVALUATION_CATALOG_V1,
  buildOfflineContractReceipt,
  evaluationManifestDigest,
  offlineContractReceiptDigest,
  passedContractOracleIds,
  planContractRegressionExecution,
  sanitizedOfflineEvaluationEnvironment,
} from '../src/index.ts';

let failures = 0;
function A(name: string, value: boolean): void {
  console.log(`${value ? 'PASS' : 'FAIL'}  ${name}`);
  if (!value) failures++;
}

const plan = planContractRegressionExecution(OFFLINE_EVALUATION_CATALOG_V1);
A('每个已绑定 gate 都由代码内固定 pnpm 参数和硬时限定义', plan.bound.every((binding) => {
  const gate = OFFLINE_CONTRACT_GATE_COMMANDS[binding.gateId];
  return gate.command === 'pnpm' && gate.args.length === 1 && /^[a-z0-9:-]+$/.test(gate.args[0]!) && gate.timeoutMs >= 60_000;
}));
const cleaned = sanitizedOfflineEvaluationEnvironment({
  PATH: '/safe/bin', LANG: 'C', HOME: '/unsafe/home', CI: 'true',
  LANGFUSE_SECRET_KEY: 'must-not-reach-local-gate', MODEL_API_KEY: 'must-not-reach-local-gate',
  DATABASE_URL: 'must-not-reach-local-gate', PGPASSWORD: 'must-not-reach-local-gate', REDIS_URL: 'must-not-reach-local-gate',
  OSS_ACCESS_KEY_ID: 'must-not-reach-local-gate', OSS_ACCESS_KEY_SECRET: 'must-not-reach-local-gate',
  OBJECT_STORAGE_SECRET_KEY: 'must-not-reach-local-gate', RESUME_ENC_KEY: 'must-not-reach-local-gate',
  PAY_PROVIDER_SECRET: 'must-not-reach-local-gate', AUTH_SECRET: 'must-not-reach-local-gate',
  AWS_SESSION_TOKEN: 'must-not-reach-local-gate', GITHUB_TOKEN: 'must-not-reach-local-gate', NPM_TOKEN: 'must-not-reach-local-gate',
  SENTRY_AUTH_TOKEN: 'must-not-reach-local-gate', OTEL_EXPORTER_OTLP_HEADERS: 'must-not-reach-local-gate',
});
const safeEnvironment = { PATH: '/safe/bin', LANG: 'C' };
A('离线 gate 子进程只继承正向 allowlist，绝不继承遥测、云、对象存储、支付、认证或数据库凭据', JSON.stringify(cleaned) === JSON.stringify(safeEnvironment));
const configBinding = plan.bound.find((entry) => entry.caseId === 'LF-CFG-001')!;
const base = buildOfflineContractReceipt(plan, evaluationManifestDigest(OFFLINE_EVALUATION_CATALOG_V1), {
  codeRevision: 'deadbeef', worktreeState: 'dirty', executionTreeDigest: 'a'.repeat(64),
}, [
  {
    gateId: 'langfuse-config-contract', status: 'passed', durationMs: 12, exitCode: 0,
    outputTruncated: false, passedOracleIds: [configBinding.oracleId],
  },
]);
A('没有命中自己的固定 oracle 的 case 只能是 inconclusive，不得由同 gate 的零退出扇出为通过', base.cases.find((entry) => entry.caseId === 'LF-CFG-001')?.status === 'passed'
  && base.cases.find((entry) => entry.caseId === 'LF-CFG-002')?.status === 'inconclusive'
  && base.cases.some((entry) => entry.gateId !== 'langfuse-config-contract' && entry.status === 'inconclusive'));
A('缺失 case 仍为发布阻断，回执显式不是发布证据', base.releaseEvidence === false && base.classification === 'untrusted_local_contract_receipt' && base.missing.length === 3);
const changedCatalog = { ...base, catalogDigest: `${base.catalogDigest.slice(0, -1)}0` };
A('回执明确区分 Git 基准与实际执行树摘要；脏工作树不得伪装为干净提交', base.worktreeState === 'dirty'
  && base.executionTreeDigest === 'a'.repeat(64) && base.codeRevision === 'deadbeef');
A('完整最小化回执摘要绑定 catalog、代码、case、gate 与 oracle，但不包含原始评测输入', offlineContractReceiptDigest(base) === offlineContractReceiptDigest(base)
  && offlineContractReceiptDigest(base) !== offlineContractReceiptDigest(changedCatalog)
  && !JSON.stringify(base).includes('synthetic_only'));
A('父运行器仅接受 gate 对应的完整固定 PASS 行，不能用任意零退出或子串伪造 case 通过', passedContractOracleIds(
  configBinding.gateId,
  'prefix PASS  开关关闭时不要求外部凭据且明确 disabled suffix',
  [configBinding.oracleId],
).length === 0 && passedContractOracleIds(
  configBinding.gateId,
  'PASS  开关关闭时不要求外部凭据且明确 disabled',
  [configBinding.oracleId],
).length === 1);

console.log(`\n${failures === 0 ? '✓ 离线合同运行器安全边界证明通过' : `✗ ${failures} 项失败`}`);
process.exit(failures ? 1 : 0);
