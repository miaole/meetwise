import {
  LANGFUSE_CONTRACT_REGRESSION_V1,
  LANGFUSE_DATASET_NAMES,
  OFFLINE_EVALUATION_CATALOG_V1,
  evaluationManifestDigest,
  langfuseDatasetExpectedOutput,
  langfuseDatasetMetadata,
  resolveLangfuseConnection,
  validateOfflineEvaluationCatalog,
  sampleOnlineJudgeAttempts,
  selectOnlineJudgeLot,
  validateEvaluationManifest,
  type EvaluationManifest,
  type OnlineJudgeEligibleAttempt,
} from '../src/index.ts';

let failures = 0;
function A(name: string, value: boolean): void {
  console.log(`${value ? 'PASS' : 'FAIL'}  ${name}`);
  if (!value) failures++;
}
function throwsCode(fn: () => unknown, code: string): boolean {
  try { fn(); return false; } catch (error: any) { return error?.code === code || error?.message === code; }
}

console.log('\n──── Langfuse 配置、离线评测集与在线抽样合同 ────');
const valid = {
  LANGFUSE_TRACING_ENABLED: 'true',
  LANGFUSE_BASE_URL: 'https://us.cloud.langfuse.com',
  LANGFUSE_HOST: 'https://us.cloud.langfuse.com/',
  LANGFUSE_PUBLIC_KEY: 'pk-test',
  LANGFUSE_SECRET_KEY: 'sk-test',
  LANGFUSE_CORRELATION_SECRET: 'fixture-only-secret',
};
A('开关关闭时不要求外部凭据且明确 disabled', resolveLangfuseConnection({ LANGFUSE_TRACING_ENABLED: 'false' }).enabled === false);
A('无效开关 fail-closed', throwsCode(() => resolveLangfuseConnection({ LANGFUSE_TRACING_ENABLED: 'yes' }), 'langfuse_tracing_enabled_invalid'));
A('启用时缺公钥/私钥明确拒绝', throwsCode(() => resolveLangfuseConnection({ ...valid, LANGFUSE_SECRET_KEY: '' }), 'langfuse_credentials_missing'));
A('启用时 BASE_URL/HOST 冲突明确拒绝', throwsCode(() => resolveLangfuseConnection({ ...valid, LANGFUSE_HOST: 'https://cloud.langfuse.com' }), 'langfuse_base_url_conflict'));
A('生产外送关联要求专用 secret', throwsCode(() => resolveLangfuseConnection({ ...valid, LANGFUSE_CORRELATION_SECRET: '' }, { requireCorrelationSecret: true }), 'langfuse_correlation_secret_missing'));
const resolved = resolveLangfuseConnection(valid, { requireCorrelationSecret: true });
A('合法配置只在内存组装且统一 BASE_URL', resolved.enabled && resolved.baseUrl === 'https://us.cloud.langfuse.com');

validateEvaluationManifest(LANGFUSE_CONTRACT_REGRESSION_V1);
const digestA = evaluationManifestDigest(LANGFUSE_CONTRACT_REGRESSION_V1);
const digestB = evaluationManifestDigest({ ...LANGFUSE_CONTRACT_REGRESSION_V1, cases: [...LANGFUSE_CONTRACT_REGRESSION_V1.cases] });
 A('本轮已验证的安全问题均已入合成回归集', ['LF-SEC-001', 'LF-SEC-002', 'LF-CFG-001', 'LF-CFG-002', 'LF-INGEST-001', 'LF-OBS-001', 'LF-ISO-001', 'EVAL-ONLINE-001', 'EVAL-ONLINE-002', 'EVAL-PROMOTE-001', 'GRAPH-PRIV-001', 'GRAPH-CFG-001'].every((id) => LANGFUSE_CONTRACT_REGRESSION_V1.cases.some((entry) => entry.caseId === id)));
 A('错误集锦回归集达到 24 条', LANGFUSE_CONTRACT_REGRESSION_V1.cases.length === 24);
validateOfflineEvaluationCatalog(OFFLINE_EVALUATION_CATALOG_V1);
const coverage = OFFLINE_EVALUATION_CATALOG_V1.cases.reduce<Record<string, number>>((acc, entry) => ({ ...acc, [entry.coverage]: (acc[entry.coverage] ?? 0) + 1 }), {});
A('离线样本至少三位数，且正常/异常/错误集锦严格为 20%/60%/20%', OFFLINE_EVALUATION_CATALOG_V1.cases.length === 120 && coverage.normal === 24 && coverage.abnormal === 72 && coverage.regression === 24);
A('同一来源 group 不能同时出现在开发集与发布留出集', throwsCode(() => {
  const first = OFFLINE_EVALUATION_CATALOG_V1.cases[0]!;
  const second = OFFLINE_EVALUATION_CATALOG_V1.cases[1]!;
  validateOfflineEvaluationCatalog({
    ...OFFLINE_EVALUATION_CATALOG_V1,
    cases: [
      ...OFFLINE_EVALUATION_CATALOG_V1.cases.slice(0, 1),
      { ...second, groupId: first.groupId, dataset: second.dataset === 'golden-dev' ? 'release-holdout' : 'golden-dev' },
      ...OFFLINE_EVALUATION_CATALOG_V1.cases.slice(2),
    ],
  });
}, 'offline_evaluation_catalog_group_collision'));
A('四个托管分区名称固定且每个分区都有至少一个冻结 case', Object.values(LANGFUSE_DATASET_NAMES).length === 4 && new Set(Object.values(LANGFUSE_DATASET_NAMES)).size === 4 && Object.keys(LANGFUSE_DATASET_NAMES).every((dataset) => OFFLINE_EVALUATION_CATALOG_V1.cases.some((entry) => entry.dataset === dataset)));
const firstOfflineCase = OFFLINE_EVALUATION_CATALOG_V1.cases[0]!;
const hostedOutput = langfuseDatasetExpectedOutput(firstOfflineCase);
const hostedMetadata = langfuseDatasetMetadata(firstOfflineCase);
A('托管 item 只包含冻结的期望和白名单元数据', Object.keys(hostedOutput).sort().join(',') === 'expected,expectedAction,forbiddenDisclosures' && Object.keys(hostedMetadata).sort().join(',') === 'caseId,caseVersion,coverage,feature,policyVersion,sourcePolicy');
A('manifest digest 稳定，可作为云端同步 receipt 的版本锚点', digestA === digestB && digestA.length === 64);
const unsafeField = structuredClone(LANGFUSE_CONTRACT_REGRESSION_V1) as EvaluationManifest;
unsafeField.cases[0]!.input = { raw_answer: 'synthetic only' };
A('含原始回答字段的 case 被拒绝，不可同步', throwsCode(() => validateEvaluationManifest(unsafeField), 'evaluation_manifest_sensitive_field'));
const unsafeText = structuredClone(LANGFUSE_CONTRACT_REGRESSION_V1) as EvaluationManifest;
unsafeText.cases[0]!.input = { marker: 'contact me at person@example.com' };
A('含 PII 格式的 case 被拒绝，不可同步', throwsCode(() => validateEvaluationManifest(unsafeText), 'evaluation_manifest_sensitive_value'));
const unsafeMetadata = structuredClone(LANGFUSE_CONTRACT_REGRESSION_V1) as EvaluationManifest;
unsafeMetadata.cases[0]!.versions.policy = 'policy-sk-example-secret-value';
A('会外送的 policy/metadata 字段同样经过敏感内容扫描', throwsCode(() => validateEvaluationManifest(unsafeMetadata), 'evaluation_manifest_sensitive_value'));
const unsafeDisclosure = structuredClone(LANGFUSE_CONTRACT_REGRESSION_V1) as EvaluationManifest;
unsafeDisclosure.cases[0]!.forbiddenDisclosures = ['sk-example-secret-value'];
A('会外送的 forbiddenDisclosures（禁止披露项）同样拒绝密钥形态', throwsCode(() => validateEvaluationManifest(unsafeDisclosure), 'evaluation_manifest_sensitive_value'));

const makeAttempt = (index: number, stratum = 0): OnlineJudgeEligibleAttempt => ({
  attemptId: `attempt-${stratum}-${index}`,
  feature: stratum ? 'rag' : 'scoring',
  languageGroup: stratum ? 'en' : 'zh',
  modality: stratum ? 'asr' : 'text',
  riskBucket: stratum ? 'low_evidence' : 'normal',
});
let capHeldForEveryPrefix = true;
let noDuplicateForEveryPrefix = true;
for (let total = 0; total <= 137; total++) {
  const stream = Array.from({ length: total }, (_, index) => makeAttempt(index, index % 3));
  const selected = sampleOnlineJudgeAttempts(stream, 'sampling-fixture-secret', 'judge-policy-v1');
  const by = new Map<string, { eligible: number; sampled: number }>();
  for (const item of stream) {
    const k = `${item.feature}/${item.languageGroup}/${item.modality}/${item.riskBucket}`;
    const row = by.get(k) ?? { eligible: 0, sampled: 0 }; row.eligible++; by.set(k, row);
  }
  for (const item of selected) {
    const k = `${item.feature}/${item.languageGroup}/${item.modality}/${item.riskBucket}`;
    by.get(k)!.sampled++;
  }
  capHeldForEveryPrefix &&= [...by.values()].every((row) => row.sampled <= Math.floor(row.eligible / 10));
  noDuplicateForEveryPrefix &&= new Set(selected.map((item) => item.attemptId)).size === selected.length;
}
A('0–137 条任意前缀、任意分层在线评审均不超过 10%', capHeldForEveryPrefix);
A('0–137 条任意前缀均无重复在线样本', noDuplicateForEveryPrefix);
const lot = Array.from({ length: 10 }, (_, index) => makeAttempt(index));
A('同一 lot 与策略密钥选出稳定且唯一的样本', selectOnlineJudgeLot(lot, 'sampling-fixture-secret', 'judge-policy-v1')?.attemptId === selectOnlineJudgeLot(lot, 'sampling-fixture-secret', 'judge-policy-v1')?.attemptId);
A('不完整 lot 不抽样，绝不超额补样本', sampleOnlineJudgeAttempts(lot.slice(0, 9), 'sampling-fixture-secret', 'judge-policy-v1').length === 0);

console.log(`\n${failures === 0 ? '✓ Langfuse 评测合同全部通过' : `✗ ${failures} 项失败`}`);
process.exit(failures ? 1 : 0);
