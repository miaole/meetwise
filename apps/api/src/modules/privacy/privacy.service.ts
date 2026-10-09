import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHmac, randomUUID } from 'node:crypto';
import {
  beginPrivacyPreviewErasure, getPrivacyPreviewReceipt, listPrivacyPreviewReceipts,
  beginResumeSoftDelete,
} from '@meetwise/db';
import type { PrivacyPreviewBeginDto } from '@meetwise/contracts';
import { assertPublicPreviewWritesClosed, PublicPreviewReadOnlyError } from '../../platform/public-preview';
import { DbService } from '../../platform/db.service';

const POLICY_VERSION = process.env.PRIVACY_POLICY_VERSION ?? 'v1';
const IDEMPOTENCY_RE = /^[\x21-\x7e]{8,128}$/;

/** PIPL 合规应用服务:采集同意 / 数据可携导出 / 删除权。全经 principal/RLS(修审计 F1)。 */
@Injectable()
export class PrivacyService {
  constructor(private readonly db: DbService) {}

  async consent(principal: string, purpose = 'resume_processing') {
    // 幂等:同一 purpose 已同意则不重复插行(否则前端重复点击/双提交会堆积重复同意记录)。
    await this.db.asPrincipal(principal, async (c) => {
      const ex = await c.query('SELECT 1 FROM consent_record WHERE purpose=$1 LIMIT 1', [purpose]);
      if (ex.rowCount === 0)
        await c.query('INSERT INTO consent_record(id, owner_user_id, purpose, policy_version) VALUES ($1,$2,$3,$4)', [randomUUID(), principal, purpose, POLICY_VERSION]);
    });
    return { recorded: true, policyVersion: POLICY_VERSION };
  }

  /** 查采集同意状态(前端据此决定是否显示"同意隐私政策"卡片,避免上传即报错的死胡同)。 */
  async consentStatus(principal: string, purpose = 'resume_processing') {
    const consented = await this.db.asPrincipal(principal, async (c) =>
      (await c.query('SELECT 1 FROM consent_record WHERE purpose=$1 LIMIT 1', [purpose])).rowCount! > 0);
    return { consented, purpose, policyVersion: POLICY_VERSION };
  }

  // 数据可携:导出结构化档案,不含加密原文/明文 PII。已软删（erasure_fenced/erased）的
  // 简历与已围栏面试不再进导出（数据可携不含已删数据）;consent_record 照旧——同意史是审计面。
  export(principal: string) {
    return this.db.asPrincipal(principal, async (c) => {
      const resumes = (await c.query("SELECT id, status FROM resume WHERE status NOT IN ('erasure_fenced','erased')")).rows;
      const interviews = (await c.query('SELECT id, status FROM interview WHERE interview_privacy_active(interview.id)')).rows;
      const assessments = (await c.query('SELECT interview_id, overall FROM assessment_report WHERE interview_privacy_active(assessment_report.interview_id)')).rows;
      const consents = (await c.query('SELECT purpose, policy_version, granted_at FROM consent_record')).rows;
      return { exportedAt: new Date().toISOString(), resumes, interviews, assessments, consents };
    });
  }

  /**
   * This endpoint is intentionally paused.  The previous implementation
   * delegated owner authorization to `app.principal_user`, which is a routing
   * GUC and not an unforgeable identity for callers that hold runtime SQL
   * credentials.  A privacy authorization snapshot/issuer is required before
   * any destructive request can be accepted again.
   */
  eraseInterviewData(_principal: string, _interviewId: string, _idempotencyKey: string | undefined): never {
    // 公开入口保持 503。0125 只闭合 memory_vector_chunk 向量块 sweep；
    // inventory §4.2 的 user_memory / ai_invocation_trace / 外部 sink 仍未齐。
    throw new HttpException({ error: 'interview_erasure_authorization_not_available' }, HttpStatus.SERVICE_UNAVAILABLE);
  }

  /**
   * S1 软删受理（UNSTUB-ERASE rev2 · D6 最低集）：遍历 owner 全部 active 态简历，
   * 逐份走 0152 受审墓碑函数（同一事务，任一失败整体回滚=无部分态），202 +
   * `mode:'logical'` + `purgePending:true`。OCR 派生痕迹（`ai_invocation_trace`/
   * `ai_model_invocation` 的 resume.vision 面）**登记不删**（S2 清除）。空集（无
   * active 简历）→ 202 `resumesFenced:0` 同形。**不撒谎边界**：本地围栏 ≠ 物理清除，
   * `purgePending:true` 恒真直至 S2 简历轨 claim/purge worker 闭合。
   */
  async deleteResumeData(principal: string) {
    return this.db.asPrincipal(principal, async (c) => {
      const active = await c.query(
        "SELECT id FROM resume WHERE owner_user_id=$1 AND status IN ('uploaded','ingesting','ingested','failed') ORDER BY created_at, id",
        [principal],
      );
      let firstRequestId: string | null = null;
      for (const row of active.rows) {
        const receipt = await beginResumeSoftDelete(c, principal, row.id);
        if (!firstRequestId) firstRequestId = receipt.requestId;
      }
      return {
        mode: 'logical' as const,
        purgePending: true as const,
        resumesFenced: active.rowCount ?? 0,
        requestId: firstRequestId,
      };
    });
  }

  private hashPreviewIdempotencyKey(raw: string | undefined): string {
    if (!raw || !IDEMPOTENCY_RE.test(raw)) {
      throw new HttpException({ error: 'idempotency_key_missing_or_invalid' }, HttpStatus.BAD_REQUEST);
    }
    const secret = process.env.PRIVACY_ERASURE_IDEMPOTENCY_HMAC_KEY ?? process.env.AUTH_SECRET;
    if (!secret) throw new HttpException({ error: 'privacy_preview_hmac_unavailable' }, HttpStatus.SERVICE_UNAVAILABLE);
    return createHmac('sha256', secret).update(`privacy-preview:${raw}`).digest('hex');
  }

  private mapPreviewError(error: unknown): never {
    if (error instanceof PublicPreviewReadOnlyError) {
      throw new HttpException({ error: 'public_preview_read_only' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
    const message = error instanceof Error ? error.message : '';
    if (code === '23505' || message.includes('privacy_preview_idempotency_conflict') || message.includes('privacy_preview_subject_mismatch')) {
      throw new HttpException({ error: 'privacy_preview_idempotency_conflict' }, HttpStatus.CONFLICT);
    }
    if (code === '42501' || message.includes('privacy_preview_not_found_or_forbidden') || message.includes('privacy_preview_account_not_found')) {
      throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    }
    if (code === '22023' || message.includes('privacy_preview_invalid') || message.includes('privacy_preview_subject_required') || message.includes('privacy_preview_scope_invalid')) {
      throw new HttpException({ error: 'privacy_preview_invalid' }, HttpStatus.BAD_REQUEST);
    }
    throw new HttpException({ error: 'privacy_preview_unavailable' }, HttpStatus.SERVICE_UNAVAILABLE);
  }

  async beginPreview(principal: string, body: PrivacyPreviewBeginDto, idempotencyKey: string | undefined) {
    try {
      assertPublicPreviewWritesClosed();
    } catch (error) {
      this.mapPreviewError(error);
    }
    const hash = this.hashPreviewIdempotencyKey(idempotencyKey);
    if (body.scope === 'interview_data' && !body.subjectId) {
      throw new HttpException({ error: 'privacy_preview_subject_required' }, HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.db.asPrincipal(principal, (c) =>
        beginPrivacyPreviewErasure(c, body.scope, body.subjectId ?? null, hash));
    } catch (error) {
      this.mapPreviewError(error);
    }
  }

  async getPreview(principal: string, requestId: string) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
      throw new HttpException({ error: 'privacy_preview_invalid' }, HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.db.asPrincipal(principal, (c) => getPrivacyPreviewReceipt(c, requestId));
    } catch (error) {
      this.mapPreviewError(error);
    }
  }

  async listPreview(principal: string) {
    try {
      const items = await this.db.asPrincipal(principal, (c) => listPrivacyPreviewReceipts(c, 8));
      return {
        editionLabel: '预览版' as const,
        productionSloClaimed: false as const,
        items: items.map((row) => ({
          requestId: row.requestId,
          scope: row.scope,
          subjectId: row.subjectId,
          status: row.status,
          edition: 'preview' as const,
          editionLabel: '预览版' as const,
          productionSloClaimed: false as const,
          completeness: 'preview_incomplete' as const,
        })),
      };
    } catch (error) {
      this.mapPreviewError(error);
    }
  }
}
