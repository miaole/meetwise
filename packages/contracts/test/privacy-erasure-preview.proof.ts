/**
 * 预览删除契约：合法回执通过；completed / SLO=true 拒绝；生产 DELETE 仍不进 OpenAPI。
 */
import { randomUUID } from 'node:crypto';
import {
  PrivacyPreviewBeginDto, PrivacyPreviewReceipt, PrivacyPreviewList, apiContract,
} from '../src/index.ts';
import { buildOpenApiDocument } from '../src/openapi.ts';

let n = 0;
function ok(cond: boolean, msg: string) { if (!cond) { console.error('✗', msg); process.exit(1); } n++; }

const legalLine = {
  sink: 'event',
  track: 'interview' as const,
  disposition: 'local_begin_started' as const,
  inDeletionTargetCheck: true,
};
const legal = {
  requestId: randomUUID(),
  scope: 'interview_data' as const,
  subjectId: 'iv-1',
  status: 'local_fenced' as const,
  edition: 'preview' as const,
  editionLabel: '预览版' as const,
  productionSloClaimed: false as const,
  completeness: 'preview_incomplete' as const,
  replayed: false,
  localSweepRequestId: randomUUID(),
  sinks: [legalLine],
};

ok(PrivacyPreviewBeginDto.safeParse({ scope: 'resume_data' }).success, '简历范围可无 subject');
ok(!PrivacyPreviewBeginDto.safeParse({ scope: 'account_wipe' }).success, '非法 scope 拒');
ok(PrivacyPreviewReceipt.safeParse(legal).success, '合法预览回执通过');
ok(!PrivacyPreviewReceipt.safeParse({ ...legal, productionSloClaimed: true }).success, 'SLO=true 拒');
ok(!PrivacyPreviewReceipt.safeParse({ ...legal, completeness: 'completed' }).success, 'completed completeness 拒');
ok(!PrivacyPreviewReceipt.safeParse({ ...legal, status: 'completed' }).success, 'completed status 拒');
ok(!PrivacyPreviewReceipt.safeParse({ ...legal, editionLabel: '正式版' }).success, '非预览版文案拒');
ok(!PrivacyPreviewReceipt.safeParse({ ...legal, extra: 1 }).success, 'strict 拒额外键');
ok(PrivacyPreviewList.safeParse({ editionLabel: '预览版', productionSloClaimed: false, items: [] }).success, '空列表合法');

const doc: any = buildOpenApiDocument();
ok(apiContract.some((r) => r.id === 'privacyPreviewBegin' && r.path === '/privacy/erasure-preview'),
  '预览 POST 进 apiContract');
ok(String(doc.paths['/privacy/erasure-preview']?.post?.summary ?? '').includes('预览版'),
  'OpenAPI 标明预览版');
ok(doc.paths['/privacy/interview-data/{id}'] === undefined
  && doc.paths['/privacy/resume-data'] === undefined,
  '生产 DELETE 仍不进 OpenAPI');
ok(!apiContract.some((r) => r.path.includes('privacy/interview-data') || r.path.includes('privacy/resume-data')),
  '生产删除路径不登记');

console.log(`✓ contracts privacy-erasure-preview 全部通过(${n} 断言)`);
