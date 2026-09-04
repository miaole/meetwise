/**
 * 隐私删除预览路径（预览版）纯域目录。
 *
 * 把 #70 / 0125 sink 盘点收成可组合回执：request → inventory → receipt。
 * 零 IO、零模型、零 db。不宣称跨存储生产删除 SLO，也不重开生产 DELETE。
 */
import { PRIVACY_AUTHZ_SINK_KINDS } from './privacy-authorization.ts';
import { MEMORY_AUTHZ_SINK_KINDS } from './memory-governance.ts';
import { CONVERSATION_EVENT_SINKS } from './ctx03-event-source.ts';
import { COMPRESSION_DELETION_SINKS } from './ctx06-deletion-closure.ts';
import { MEMORY_VECTOR_CHUNK_DELETION_SINKS } from './memory-vector-chunk-deletion.ts';

export const PRIVACY_PREVIEW_EDITION = 'preview' as const;
export const PRIVACY_PREVIEW_EDITION_LABEL = '预览版' as const;
export const PRIVACY_PREVIEW_SCOPES = ['interview_data', 'account_data', 'resume_data'] as const;
export type PrivacyPreviewScope = (typeof PRIVACY_PREVIEW_SCOPES)[number];

export const PRIVACY_PREVIEW_STATUSES = ['inventoried', 'local_fenced'] as const;
export type PrivacyPreviewStatus = (typeof PRIVACY_PREVIEW_STATUSES)[number];

export const PRIVACY_PREVIEW_DISPOSITIONS = [
  'local_begin_started',
  'local_begin_available',
  'placeholder_no_target',
  'external_pending',
  'honest_unresolved',
] as const;
export type PrivacyPreviewDisposition = (typeof PRIVACY_PREVIEW_DISPOSITIONS)[number];

export const PRIVACY_PREVIEW_COMPLETENESS = 'preview_incomplete' as const;

/** 0125 CHECK 内的 sink，与签发并集逐值对齐。 */
export const PRIVACY_DELETION_TARGET_CHECK_SINKS = [
  ...PRIVACY_AUTHZ_SINK_KINDS,
  ...MEMORY_AUTHZ_SINK_KINDS,
  ...CONVERSATION_EVENT_SINKS,
  ...COMPRESSION_DELETION_SINKS,
  ...MEMORY_VECTOR_CHUNK_DELETION_SINKS,
] as const;

/** 盘点 §4.2 相邻落点：不进 privacy_deletion_target.sink CHECK，但必须出现在预览回执。 */
export const PRIVACY_PREVIEW_ADJACENT_SINKS = ['user_memory', 'ai_invocation_trace', 'backup_pitr'] as const;

export type PrivacyPreviewTrack = 'interview' | 'account' | 'resume' | 'external' | 'adjacent';
export type PrivacyPreviewLocalBegin = 'interview_projection' | 'memory_vector_chunk' | null;

export interface PrivacyPreviewSinkSpec {
  sink: string;
  track: PrivacyPreviewTrack;
  defaultDisposition: Exclude<PrivacyPreviewDisposition, 'local_begin_started'>;
  inDeletionTargetCheck: boolean;
  localBegin: PrivacyPreviewLocalBegin;
}

/**
 * 预览回执的冻结目录。增删任一 sink 必须同 PR 改盘点文档、0129 SQL 字面量与本表。
 * defaultDisposition 是「未启动本地 begin」时的诚实落点。
 */
export const PRIVACY_PREVIEW_SINK_CATALOG: readonly PrivacyPreviewSinkSpec[] = [
  { sink: 'checkpoint_rows', track: 'interview', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: 'interview_projection' },
  { sink: 'interview_job_payload', track: 'interview', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'event', track: 'interview', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: 'interview_projection' },
  { sink: 'report', track: 'interview', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: 'interview_projection' },
  { sink: 'vector', track: 'interview', defaultDisposition: 'placeholder_no_target', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'redis', track: 'external', defaultDisposition: 'external_pending', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'oss', track: 'external', defaultDisposition: 'external_pending', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'langfuse', track: 'external', defaultDisposition: 'external_pending', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'interview_answer_artifact', track: 'interview', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'ai_graph_run', track: 'interview', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: 'interview_projection' },
  { sink: 'memory_event', track: 'account', defaultDisposition: 'placeholder_no_target', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'memory_summary', track: 'account', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'memory_fact', track: 'account', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'memory_embedding', track: 'account', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'memory_cache', track: 'account', defaultDisposition: 'placeholder_no_target', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'memory_context_snapshot', track: 'account', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'memory_trace', track: 'account', defaultDisposition: 'placeholder_no_target', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'conversation_event', track: 'account', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'conversation_event_artifact', track: 'account', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'context_compression_snapshot', track: 'account', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'context_compression_dispatch', track: 'account', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: null },
  { sink: 'memory_vector_chunk', track: 'account', defaultDisposition: 'local_begin_available', inDeletionTargetCheck: true, localBegin: 'memory_vector_chunk' },
  { sink: 'user_memory', track: 'adjacent', defaultDisposition: 'honest_unresolved', inDeletionTargetCheck: false, localBegin: null },
  { sink: 'ai_invocation_trace', track: 'adjacent', defaultDisposition: 'honest_unresolved', inDeletionTargetCheck: false, localBegin: null },
  { sink: 'backup_pitr', track: 'adjacent', defaultDisposition: 'honest_unresolved', inDeletionTargetCheck: false, localBegin: null },
];

export const PRIVACY_PREVIEW_SINK_NAMES = PRIVACY_PREVIEW_SINK_CATALOG.map((row) => row.sink);

export interface PrivacyPreviewSinkLine {
  sink: string;
  track: PrivacyPreviewTrack;
  disposition: PrivacyPreviewDisposition;
  inDeletionTargetCheck: boolean;
}

export interface PrivacyPreviewReceiptView {
  requestId: string;
  scope: PrivacyPreviewScope;
  subjectId: string;
  status: PrivacyPreviewStatus;
  edition: typeof PRIVACY_PREVIEW_EDITION;
  editionLabel: typeof PRIVACY_PREVIEW_EDITION_LABEL;
  productionSloClaimed: false;
  completeness: typeof PRIVACY_PREVIEW_COMPLETENESS;
  replayed: boolean;
  localSweepRequestId: string | null;
  sinks: PrivacyPreviewSinkLine[];
}

const fail = (code: string): never => {
  throw Object.assign(new Error(code), { code });
};

export function assertPrivacyPreviewScope(scope: string): asserts scope is PrivacyPreviewScope {
  if (!(PRIVACY_PREVIEW_SCOPES as readonly string[]).includes(scope)) fail('privacy_preview_scope_invalid');
}

export function previewLocalBeginForScope(scope: PrivacyPreviewScope): PrivacyPreviewLocalBegin {
  if (scope === 'interview_data') return 'interview_projection';
  if (scope === 'account_data') return 'memory_vector_chunk';
  return null;
}

export function dispositionForPreviewSink(
  spec: PrivacyPreviewSinkSpec,
  startedBegin: PrivacyPreviewLocalBegin,
): PrivacyPreviewDisposition {
  if (startedBegin && spec.localBegin === startedBegin) return 'local_begin_started';
  return spec.defaultDisposition;
}

export function statusForPreviewScope(scope: PrivacyPreviewScope): PrivacyPreviewStatus {
  return previewLocalBeginForScope(scope) ? 'local_fenced' : 'inventoried';
}

export function composePrivacyPreviewReceipt(input: {
  requestId: string;
  scope: string;
  subjectId: string;
  replayed: boolean;
  localSweepRequestId: string | null;
  sinkLines: ReadonlyArray<{ sink: string; disposition: string }>;
}): PrivacyPreviewReceiptView {
  assertPrivacyPreviewScope(input.scope);
  if (typeof input.requestId !== 'string' || input.requestId.length === 0) fail('privacy_preview_request_invalid');
  if (typeof input.subjectId !== 'string' || input.subjectId.length === 0) fail('privacy_preview_subject_invalid');
  const started = previewLocalBeginForScope(input.scope);
  if (started && !input.localSweepRequestId) fail('privacy_preview_local_sweep_missing');
  if (!started && input.localSweepRequestId) fail('privacy_preview_local_sweep_unexpected');

  const bySink = new Map(input.sinkLines.map((row) => [row.sink, row.disposition]));
  if (bySink.size !== PRIVACY_PREVIEW_SINK_CATALOG.length) fail('privacy_preview_sinks_incomplete');

  const sinks: PrivacyPreviewSinkLine[] = PRIVACY_PREVIEW_SINK_CATALOG.map((spec) => {
    const disposition = bySink.get(spec.sink);
    if (disposition === undefined) fail('privacy_preview_sink_missing');
    const expected = dispositionForPreviewSink(spec, started);
    if (disposition !== expected) fail('privacy_preview_disposition_mismatch');
    if (!(PRIVACY_PREVIEW_DISPOSITIONS as readonly string[]).includes(disposition)) fail('privacy_preview_disposition_invalid');
    return {
      sink: spec.sink,
      track: spec.track,
      disposition: disposition as PrivacyPreviewDisposition,
      inDeletionTargetCheck: spec.inDeletionTargetCheck,
    };
  });

  const hasUnresolved = sinks.some((row) =>
    row.disposition === 'external_pending' || row.disposition === 'honest_unresolved' || row.disposition === 'placeholder_no_target');
  if (!hasUnresolved) fail('privacy_preview_must_remain_incomplete');

  return {
    requestId: input.requestId,
    scope: input.scope,
    subjectId: input.subjectId,
    status: statusForPreviewScope(input.scope),
    edition: PRIVACY_PREVIEW_EDITION,
    editionLabel: PRIVACY_PREVIEW_EDITION_LABEL,
    productionSloClaimed: false,
    completeness: PRIVACY_PREVIEW_COMPLETENESS,
    replayed: input.replayed === true,
    localSweepRequestId: input.localSweepRequestId,
    sinks,
  };
}

export function catalogSinksInDeletionTargetCheck(): string[] {
  return PRIVACY_PREVIEW_SINK_CATALOG.filter((row) => row.inDeletionTargetCheck).map((row) => row.sink);
}
