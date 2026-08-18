import {
  CONTRACT_REGRESSION_BINDINGS_V1,
  contractRegressionOracle,
  OFFLINE_EVALUATION_CATALOG_V1,
  planContractRegressionExecution,
  requireCompleteContractRegressionPlan,
} from '../src/index.ts';

let failures = 0;
function A(name: string, value: boolean): void {
  console.log(`${value ? 'PASS' : 'FAIL'}  ${name}`);
  if (!value) failures++;
}
function throwsCode(fn: () => unknown, code: string): boolean {
  try { fn(); return false; } catch (error: unknown) { return error instanceof Error && error.message === code; }
}

const plan = planContractRegressionExecution(OFFLINE_EVALUATION_CATALOG_V1);
A('已绑定 case 只能来自 contract-regression 且每个键精确一次', plan.bound.length === new Set(plan.bound.map((entry) => `${entry.caseId}@${entry.caseVersion}`)).size
  && plan.bound.every((entry) => OFFLINE_EVALUATION_CATALOG_V1.cases.some((item) => item.dataset === 'contract-regression' && item.caseId === entry.caseId && item.caseVersion === entry.caseVersion)));
A('尚未有逐 case oracle 的人工晋升、上下文压缩和真实双向语音被显式列为阻断，而非跳过通过', !plan.complete
  && plan.missing.map((entry) => entry.caseId).join(',') === 'EVAL-PROMOTE-001,GRAPH-MEM-001,VOICE-DUPLEX-001'
  && throwsCode(() => requireCompleteContractRegressionPlan(plan), 'offline_evaluation_contract_regression_unbound'));
A('每个已绑定 case 都有与 gate 一致的固定 oracle，禁止一个零退出覆盖多个未验证断言', plan.bound.every((binding) =>
  contractRegressionOracle(binding.oracleId).gateId === binding.gateId));
A('重复绑定被拒绝，不能用同一通过 gate 覆盖两次', throwsCode(() => planContractRegressionExecution(OFFLINE_EVALUATION_CATALOG_V1, [
  ...CONTRACT_REGRESSION_BINDINGS_V1,
  CONTRACT_REGRESSION_BINDINGS_V1[0]!,
]), 'offline_evaluation_binding_duplicate'));
A('普通质量集不能偷接合同 gate', throwsCode(() => planContractRegressionExecution(OFFLINE_EVALUATION_CATALOG_V1, [
  ...CONTRACT_REGRESSION_BINDINGS_V1,
  { caseId: 'OFFLINE-NORMAL-001', caseVersion: 'v1', gateId: 'langfuse-config-contract', oracleId: 'lf-config-disabled-v1' },
]), 'offline_evaluation_binding_case_unknown'));
A('未知 gate 拒绝，清单不能变成任意命令执行', throwsCode(() => planContractRegressionExecution(OFFLINE_EVALUATION_CATALOG_V1, [
  ...CONTRACT_REGRESSION_BINDINGS_V1.slice(1),
  { ...CONTRACT_REGRESSION_BINDINGS_V1[0]!, gateId: 'shell' as never },
]), 'offline_evaluation_binding_gate_unknown'));

console.log(`\n${failures === 0 ? '✓ 离线合同评测执行计划证明通过（未绑定项保持发布阻断）' : `✗ ${failures} 项失败`}`);
process.exit(failures ? 1 : 0);
