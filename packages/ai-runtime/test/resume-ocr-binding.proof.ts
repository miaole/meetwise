/**
 * MODEL-OP-01 resume OCR binding seam (本地、确定性：无网络、无数据库、无真实 Key)。
 *
 * UC-MODEL-OCR-01：typed binding 缺失/伪造/URL 媒体/digest 错配 → 零 invoke；
 * 成功绑定产出密封 provenance；面试/图源码不得临时调 visionOcr。
 */
import { createHash } from 'node:crypto';
import { readdirSync as listDir, readFileSync as readFile, statSync as stat } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DbPool } from '@meetwise/db';
import {
  bindResumeOcr, bindResumeOcrOperation, resumeOcrMediaDigest, visionOcr,
  RESUME_OCR_OPERATION_ID, type ModelClient,
} from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const PAYLOAD = Buffer.from('AAAA', 'base64');
const DIGEST = createHash('sha256').update(PAYLOAD).digest('hex');
const DATA_URI = 'data:image/png;base64,AAAA';

A('data URI 媒体 digest 由 payload 字节决定，非 URI 字符串',
  resumeOcrMediaDigest(DATA_URI) === DIGEST
  && resumeOcrMediaDigest('https://evil.example.test/x.png') === null
  && resumeOcrMediaDigest('data:image/png;base64,') === null);

const bound = bindResumeOcr(DIGEST);
A('TC-MODEL-OCR-01-main：resume.ocr.v1 + 合法 digest → 密封 provenance',
  bound.ok === true
  && bound.provenance.operationId === RESUME_OCR_OPERATION_ID
  && bound.provenance.modelOrRecipe === 'vision-ocr'
  && bound.provenance.endpointProfileId === 'dashscope-cn-beijing'
  && bound.provenance.mediaDigest === DIGEST
  && bound.provenance.wired === true
  && Object.isFrozen(bound.provenance));

A('TC-MODEL-OCR-01-E4：未登记 operation → binding 缺失，零适配器',
  bindResumeOcrOperation('interview.unknown.v1', DIGEST).ok === false
  && bindResumeOcrOperation('interview.unknown.v1', DIGEST).error === 'model_operation_unknown');

A('TC-MODEL-OCR-01-特：未接线 native operation 不能冒充 OCR binding',
  bindResumeOcrOperation('voice.asr.v1', DIGEST).ok === false
  && bindResumeOcrOperation('qbank.embedding-build.v1', DIGEST).ok === false);

A('非法 digest 拒绝（非 sha256 hex）',
  bindResumeOcr('not-a-digest').error === 'ocr_media_digest_invalid'
  && bindResumeOcr('').error === 'ocr_media_digest_invalid');

const dummyPool = {} as DbPool;
const dummyClient = {
  async complete() { throw new Error('binding-fail must not reach model client'); },
} as unknown as ModelClient;

const urlReject = await visionOcr(dummyClient, dummyPool, 'owner', 'https://evil.example.test/r.png', `ocr:${DIGEST}`);
const httpReject = await visionOcr(dummyClient, dummyPool, 'owner', 'http://internal/r.png', `ocr:${DIGEST}`);
A('TC-MODEL-OCR-01-刁：provider URL 媒体零 invoke',
  urlReject.ok === false && urlReject.reason === 'ocr_provider_url_forbidden'
  && httpReject.ok === false && httpReject.reason === 'ocr_provider_url_forbidden');

const mismatch = await visionOcr(dummyClient, dummyPool, 'owner', DATA_URI, `ocr:${'b'.repeat(64)}`);
A('TC-MODEL-OCR-01-刁：幂等键 digest 与图片字节错配 → 零 invoke',
  mismatch.ok === false && mismatch.reason === 'ocr_media_digest_mismatch');

function walkTs(dir: string, acc: string[] = []): string[] {
  for (const name of listDir(dir)) {
    const full = join(dir, name);
    if (stat(full).isDirectory()) walkTs(full, acc);
    else if (name.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const banned = ['visionOcr', 'createOcrVisionClient', 'bindResumeOcr'];
const interviewSurfaces = [
  ...walkTs(join(root, 'apps/worker/src')),
  ...walkTs(join(root, 'packages/ai-graphs/src')),
  ...walkTs(join(root, 'apps/api/src/modules/interview')),
];
const leaks = interviewSurfaces.filter((file) => {
  const text = readFile(file, 'utf8');
  return banned.some((token) => text.includes(token));
});
A('TC-MODEL-OCR-01-E5：worker / 面试图 / API interview 模块零 visionOcr / OCR 客户端',
  leaks.length === 0);

console.log(failures === 0
  ? '\n✓ MODEL-OP-01 resume OCR binding fail-closed 全部通过（本地静态证据）'
  : `\n✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
