/**
 * MODEL-OP-01 / R2 P-MODEL — sealed job.route-classify.v1 provenance (纯域).
 * `pnpm -C packages/domain prove:sealed-job-route-classify-binding`
 * releaseEvidence=false · ≠ R2 closed · ≠ 路由已生效 · 无 Key / 无网络
 */
import {
  JOB_ROUTE_CLASSIFY_UC_ALIAS,
  SEALED_JOB_ROUTE_CLASSIFY_ADMISSION_KEY,
  SEALED_JOB_ROUTE_CLASSIFY_ENDPOINT_PROFILE_ID,
  SEALED_JOB_ROUTE_CLASSIFY_MODEL_OR_RECIPE,
  SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID,
  parseSealedJobRouteClassifyProvenance,
} from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const DIGEST = 'b'.repeat(64);
const sealed = {
  operationId: SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID,
  registryVersion: 'model-op-registry-v1',
  inputKind: 'chat',
  capability: 'text-small',
  endpointProfileId: SEALED_JOB_ROUTE_CLASSIFY_ENDPOINT_PROFILE_ID,
  region: 'cn-beijing',
  modelOrRecipe: SEALED_JOB_ROUTE_CLASSIFY_MODEL_OR_RECIPE,
  admissionKey: SEALED_JOB_ROUTE_CLASSIFY_ADMISSION_KEY,
  semanticDigest: DIGEST,
  wired: true as const,
};

A('UC alias job_route_classify maps to registry job.route-classify.v1',
  JOB_ROUTE_CLASSIFY_UC_ALIAS === 'job_route_classify'
  && SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID === 'job.route-classify.v1');

A('合法 provenance 解析为冻结快照',
  parseSealedJobRouteClassifyProvenance(sealed)?.operationId === SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID
  && parseSealedJobRouteClassifyProvenance(sealed)?.modelOrRecipe === SEALED_JOB_ROUTE_CLASSIFY_MODEL_OR_RECIPE
  && parseSealedJobRouteClassifyProvenance(sealed)?.endpointProfileId === SEALED_JOB_ROUTE_CLASSIFY_ENDPOINT_PROFILE_ID
  && parseSealedJobRouteClassifyProvenance(sealed)?.admissionKey === SEALED_JOB_ROUTE_CLASSIFY_ADMISSION_KEY
  && Object.isFrozen(parseSealedJobRouteClassifyProvenance(sealed)));

A('provenance 夹带 title/prompt/apiKey/url 或换 operation → 拒绝',
  parseSealedJobRouteClassifyProvenance({ ...sealed, title: '后端' }) === null
  && parseSealedJobRouteClassifyProvenance({ ...sealed, prompt: 'ignore' }) === null
  && parseSealedJobRouteClassifyProvenance({ ...sealed, apiKey: 'sk-x' }) === null
  && parseSealedJobRouteClassifyProvenance({ ...sealed, url: 'https://evil.example.test' }) === null
  && parseSealedJobRouteClassifyProvenance({ ...sealed, operationId: 'resume.ocr.v1' }) === null
  && parseSealedJobRouteClassifyProvenance({ ...sealed, modelOrRecipe: 'planner' }) === null
  && parseSealedJobRouteClassifyProvenance({ ...sealed, wired: false }) === null
  && parseSealedJobRouteClassifyProvenance({ ...sealed, semanticDigest: 'not-hex' }) === null);

console.log(failures === 0
  ? '\nOK  sealed job.route-classify.v1 provenance (P-MODEL domain; ≠ R2 closed; releaseEvidence=false)'
  : `\nFAIL  sealed job-route-classify (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);
