/**
 * 预览删除路径无库 pin：目录、回执诚实性、0125 CHECK、公开 503、0129 字面量。
 * releaseEvidence=false。
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PRIVACY_PREVIEW_SINK_CATALOG,
  PRIVACY_PREVIEW_SINK_NAMES,
  PRIVACY_PREVIEW_EDITION_LABEL,
  PRIVACY_PREVIEW_ADJACENT_SINKS,
  catalogSinksInDeletionTargetCheck,
  composePrivacyPreviewReceipt,
  dispositionForPreviewSink,
  previewLocalBeginForScope,
  statusForPreviewScope,
} from '../src/index.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const read = (rel: string) => readFileSync(resolve(root, rel), 'utf8');

A('目录 25 行且无重复 sink',
  PRIVACY_PREVIEW_SINK_CATALOG.length === 25
  && new Set(PRIVACY_PREVIEW_SINK_NAMES).size === 25);

const checkSinks = catalogSinksInDeletionTargetCheck();
A('CHECK 内 sink=22 且含 memory_vector_chunk，不含相邻缺口',
  checkSinks.length === 22
  && checkSinks.includes('memory_vector_chunk')
  && !checkSinks.includes('user_memory'));

A('相邻缺口三项进回执但不进 CHECK',
  PRIVACY_PREVIEW_ADJACENT_SINKS.join(',') === 'user_memory,ai_invocation_trace,backup_pitr'
  && PRIVACY_PREVIEW_ADJACENT_SINKS.every((sink) => PRIVACY_PREVIEW_SINK_NAMES.includes(sink)));

A('面试启动 projection，账户启动 0125，简历不启动',
  previewLocalBeginForScope('interview_data') === 'interview_projection'
  && previewLocalBeginForScope('account_data') === 'memory_vector_chunk'
  && previewLocalBeginForScope('resume_data') === null
  && statusForPreviewScope('resume_data') === 'inventoried'
  && statusForPreviewScope('interview_data') === 'local_fenced');

const interviewLines = PRIVACY_PREVIEW_SINK_CATALOG.map((spec) => ({
  sink: spec.sink,
  disposition: dispositionForPreviewSink(spec, 'interview_projection'),
}));
const interview = composePrivacyPreviewReceipt({
  requestId: '11111111-1111-4111-8111-111111111111',
  scope: 'interview_data',
  subjectId: 'iv-1',
  replayed: false,
  localSweepRequestId: '22222222-2222-4222-8222-222222222222',
  sinkLines: interviewLines,
});
A('面试回执：预览版、未完成、四 sink 已启动、外部仍 pending',
  interview.editionLabel === PRIVACY_PREVIEW_EDITION_LABEL
  && interview.productionSloClaimed === false
  && interview.completeness === 'preview_incomplete'
  && interview.status === 'local_fenced'
  && interview.sinks.filter((row) => row.disposition === 'local_begin_started').map((row) => row.sink).join(',')
    === 'checkpoint_rows,event,report,ai_graph_run'
  && interview.sinks.some((row) => row.sink === 'oss' && row.disposition === 'external_pending')
  && interview.sinks.some((row) => row.sink === 'user_memory' && row.disposition === 'honest_unresolved'));

let missingSweep = false;
try {
  composePrivacyPreviewReceipt({
    requestId: '11111111-1111-4111-8111-111111111111',
    scope: 'interview_data',
    subjectId: 'iv-1',
    replayed: false,
    localSweepRequestId: null,
    sinkLines: interviewLines,
  });
} catch (e) {
  missingSweep = (e as { code?: string }).code === 'privacy_preview_local_sweep_missing';
}
A('面试回执缺本地 sweep 拒', missingSweep);

let completedForged = false;
try {
  composePrivacyPreviewReceipt({
    requestId: '11111111-1111-4111-8111-111111111111',
    scope: 'resume_data',
    subjectId: 'owner-a',
    replayed: false,
    localSweepRequestId: null,
    sinkLines: PRIVACY_PREVIEW_SINK_CATALOG.map((spec) => ({ sink: spec.sink, disposition: 'local_begin_started' })),
  });
} catch (e) {
  completedForged = (e as { code?: string }).code === 'privacy_preview_disposition_mismatch'
    || (e as { code?: string }).code === 'privacy_preview_must_remain_incomplete';
}
A('伪造全 sink 已启动被拒', completedForged);

const migration = read('packages/db/migrations/0129_privacy_erasure_preview_path.sql');
A('0129 存在且禁止 completed / SLO，并链接 0096/0125',
  existsSync(resolve(root, 'packages/db/migrations/0129_privacy_erasure_preview_path.sql'))
  && !existsSync(resolve(root, 'packages/db/migrations/0126_privacy_erasure_preview_path.sql'))
  && migration.includes("CHECK (status IN ('inventoried','local_fenced'))")
  && migration.includes('production_slo_claimed boolean NOT NULL DEFAULT false CHECK (production_slo_claimed = false)')
  && migration.includes('interview_projection_begin_erasure')
  && migration.includes('memory_vector_chunk_begin_erasure')
  && migration.includes("'backup_pitr'")
  && migration.includes('privacy_preview_completed_forbidden')
  && migration.includes('ON CONFLICT (owner_user_id, idempotency_key_hash) DO NOTHING'));

const svc = read('apps/api/src/modules/privacy/privacy.service.ts');
A('生产 DELETE 仍 503；预览路径已接线',
  svc.includes("error: 'interview_erasure_authorization_not_available'")
  && svc.includes("error: 'resume_erasure_migration_in_progress'")
  && svc.includes('beginPrivacyPreviewErasure')
  && svc.includes('assertPublicPreviewWritesClosed'));

const page = read('apps/web/app/privacy/page.tsx');
A('web 隐私页不再只放 disabled 按钮，且契约拒伪造完成态',
  page.includes('预览版')
  && page.includes('PreviewErasureForm')
  && page.includes('PrivacyPreviewList.safeParse')
  && page.includes('PrivacyPreviewReceipt.safeParse')
  && !page.includes('删除功能暂未开放'));

const statusMachine = read('ai-docs/rules/global/status-machine.md');
A('状态机登记预览请求且禁止 completed',
  statusMachine.includes('PrivacyPreviewRequest')
  && statusMachine.includes('inventoried')
  && statusMachine.includes('local_fenced')
  && statusMachine.includes('禁止 `completed`'));

const inventory = read('ai-docs/architecture/ai/privacy-deletion-sink-inventory.md');
A('盘点文档登记预览路径且生产 DELETE 仍 fail-closed',
  inventory.includes('erasure-preview')
  && inventory.includes('预览版')
  && inventory.includes('fail-closed'));

if (fail) {
  console.error(`\n✗ privacy-erasure-preview domain ${fail} 失败`);
  process.exit(1);
}
console.log('\n✓ privacy-erasure-preview domain pin 通过');
