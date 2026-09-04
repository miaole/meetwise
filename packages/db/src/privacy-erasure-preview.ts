/**
 * 隐私删除预览路径（预览版）存储侧。
 * 受理预览请求、落盘点行、可选链接既有本地 sweep。不宣称生产删除完成。
 */
import type { Client } from './principal.ts';
import {
  composePrivacyPreviewReceipt,
  type PrivacyPreviewReceiptView,
  type PrivacyPreviewScope,
} from '@meetwise/domain';

function fail(code: string): never {
  throw Object.assign(new Error(code), { code });
}

interface PreviewRow {
  request_id: string;
  request_status: string;
  scope: string;
  subject_id: string;
  edition: string;
  production_slo_claimed: boolean;
  completeness: string;
  replayed: boolean;
  local_sweep_request_id: string | null;
  sink: string;
  track: string;
  disposition: string;
  in_deletion_target_check: boolean;
}

function toReceipt(rows: PreviewRow[]): PrivacyPreviewReceiptView {
  const first = rows[0];
  if (!first?.request_id) fail('privacy_preview_receipt_empty');
  if (first.edition !== 'preview' || first.production_slo_claimed !== false || first.completeness !== 'preview_incomplete') {
    fail('privacy_preview_honesty_violated');
  }
  return composePrivacyPreviewReceipt({
    requestId: first.request_id,
    scope: first.scope,
    subjectId: first.subject_id,
    replayed: first.replayed === true,
    localSweepRequestId: first.local_sweep_request_id,
    sinkLines: rows.map((row) => ({ sink: row.sink, disposition: row.disposition })),
  });
}

export async function beginPrivacyPreviewErasure(
  c: Client, scope: PrivacyPreviewScope, subjectId: string | null, idempotencyKeyHash: string,
): Promise<PrivacyPreviewReceiptView> {
  const r = await c.query<PreviewRow>(
    'SELECT * FROM privacy_preview_begin_erasure($1,$2,$3)',
    [scope, subjectId, idempotencyKeyHash],
  );
  return toReceipt(r.rows);
}

export async function getPrivacyPreviewReceipt(
  c: Client, requestId: string,
): Promise<PrivacyPreviewReceiptView> {
  const r = await c.query<PreviewRow>(
    'SELECT * FROM privacy_preview_get_receipt($1::uuid)',
    [requestId],
  );
  return toReceipt(r.rows);
}

export interface PrivacyPreviewListRow {
  requestId: string;
  scope: PrivacyPreviewScope;
  subjectId: string;
  status: 'inventoried' | 'local_fenced';
}

export async function listPrivacyPreviewReceipts(
  c: Client, maxItems = 8,
): Promise<PrivacyPreviewListRow[]> {
  const r = await c.query<{ request_id: string; scope: PrivacyPreviewScope; subject_id: string; request_status: 'inventoried' | 'local_fenced' }>(
    'SELECT * FROM privacy_preview_list_receipts($1)',
    [maxItems],
  );
  return r.rows
    .filter((row) => row.request_id && row.scope && row.subject_id && (row.request_status === 'inventoried' || row.request_status === 'local_fenced'))
    .map((row) => ({
      requestId: row.request_id,
      scope: row.scope,
      subjectId: row.subject_id,
      status: row.request_status,
    }));
}
