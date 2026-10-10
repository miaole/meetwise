/**
 * MODEL-OP-01 / R2 P-MODEL — job.route-classify.v1 typed binding prove.
 * 本地、确定性：无网络、无数据库、无真实 Key。
 *
 * Closes P-MODEL (binding exists + fail-closed). P-WORKER may have sole
 * classifyJobRoute( via route-classify-consumer; P-API must stay zero.
 * ≠ R2 closed · releaseEvidence=false · Not HA.
 */
import { createHash } from 'node:crypto';
import { readdirSync as listDir, readFileSync as readFile, statSync as stat } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  JOB_ROUTE_CLASSIFY_OPERATION_ID,
  MODEL_OPERATION_REGISTRY,
  bindJobRouteClassify, bindJobRouteClassifyOperation,
  isRegistryLogicalNodeKey, resolveModelOperation, validateModelOperationRegistry,
} from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const DIGEST = createHash('sha256').update('job-route-classify-proof', 'utf8').digest('hex');

A('registry 静态不变量仍成立（含 job.route-classify.v1）',
  validateModelOperationRegistry().length === 0);

A('十个已接线操作(七文本含 job.route-classify + 一视觉 OCR + 批量 ASR/TTS)与六个未接线 typed contract',
  MODEL_OPERATION_REGISTRY.filter((d) => d.wired).length === 10
  && MODEL_OPERATION_REGISTRY.filter((d) => !d.wired).length === 6
  && MODEL_OPERATION_REGISTRY.some((d) => d.operationId === JOB_ROUTE_CLASSIFY_OPERATION_ID && d.wired));

const resolved = resolveModelOperation(JOB_ROUTE_CLASSIFY_OPERATION_ID, 'rev-1');
A('resolveModelOperation(job.route-classify.v1) ok + registry logicalNodeKey',
  resolved.ok === true
  && resolved.ok
  && isRegistryLogicalNodeKey(resolved.logicalNodeKey)
  && resolved.admissionKey === 'dashscope-main|cn-beijing|job-route-classifier|job.route-classify.v1'
  && resolved.definition.fallbackAction === 'route_unresolved'
  && resolved.definition.maxDispatches === 1);

const bound = bindJobRouteClassify(DIGEST);
A('bindJobRouteClassify(合法 semanticDigest) → 密封 provenance（无 Key / 无网络）',
  bound.ok === true
  && bound.ok
  && bound.provenance.operationId === JOB_ROUTE_CLASSIFY_OPERATION_ID
  && bound.provenance.modelOrRecipe === 'job-route-classifier'
  && bound.provenance.endpointProfileId === 'text-cn-public'
  && bound.provenance.semanticDigest === DIGEST
  && bound.provenance.wired === true
  && Object.isFrozen(bound.provenance));

A('未登记 / 错 kind operation → binding 缺失 fail-closed',
  bindJobRouteClassifyOperation('interview.unknown.v1', DIGEST).ok === false
  && bindJobRouteClassifyOperation('interview.unknown.v1', DIGEST).error === 'model_operation_unknown'
  && bindJobRouteClassifyOperation('resume.ocr.v1', DIGEST).ok === false
  && bindJobRouteClassifyOperation('qbank.embedding-build.v1', DIGEST).ok === false);

A('非法 semanticDigest 拒绝（非 sha256 hex）',
  bindJobRouteClassify('not-a-digest').error === 'job_route_semantic_digest_invalid'
  && bindJobRouteClassify('').error === 'job_route_semantic_digest_invalid');

A('未知 operation / 未接线仍 fail-closed（旁证）',
  resolveModelOperation('interview.unknown.v1', 'r1').ok === false
  && resolveModelOperation('qbank.embedding-build.v1', 'r1').ok === false);

function walkTs(dir: string, acc: string[] = []): string[] {
  if (!stat(dir).isDirectory()) return acc;
  for (const name of listDir(dir)) {
    const full = join(dir, name);
    if (stat(full).isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name === '.tmp') continue;
      walkTs(full, acc);
    } else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.proof.ts')) acc.push(full);
  }
  return acc;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const workerFiles = walkTs(join(root, 'apps/worker/src'));
const apiFiles = walkTs(join(root, 'apps/api/src'));
const workerHits: string[] = [];
const apiHits: string[] = [];
for (const f of workerFiles) {
  if (/classifyJobRoute\s*\(/.test(readFile(f, 'utf8'))) workerHits.push(f);
}
for (const f of apiFiles) {
  if (/classifyJobRoute\s*\(/.test(readFile(f, 'utf8'))) apiHits.push(f);
}
A('P-WORKER sole: apps/worker/src classifyJobRoute( via route-classify-consumer (≥1)',
  workerHits.length >= 1
  && workerHits.some((f) => f.replace(/\\/g, '/').endsWith('/route-classify-consumer.ts')),
  `workerCalls=${workerHits.length}`);
A('Worker sole preserved: apps/api/src zero classifyJobRoute(（wakeup-only; ≠ R2 closed）',
  apiHits.length === 0, `apiCalls=${apiHits.length}`);

console.log(failures === 0
  ? '\nOK  job.route-classify.v1 MODEL-OP binding prove (P-MODEL closed; Worker sole≥1; API=0; R2 NOT closed; no Key; releaseEvidence=false)'
  : `\nFAIL  job-route-classify-binding (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);
