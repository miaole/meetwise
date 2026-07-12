import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createResumeWithBlob, transitionResume, completeIngestion, decryptResumeBlob } from '@meetwise/db';
import { ingestResume, extractResumeText } from '@meetwise/domain';
import type { UploadResumeDto, UploadResumeFileDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';

const MAX_RESUME_BYTES = 8 * 1024 * 1024;   // 8MB 上限(防大文件 DoS)

/**
 * 简历应用服务(拥有 asPrincipal 事务边界 + 业务编排)。controller 只解析/校验/映射 HTTP,不碰 SQL(修审计 F1)。
 * 机制全复用已 gate 的 db/domain:pgp 加密 blob、结构化 profile 永不含明文 PII、去重、状态机、RLS。
 */
@Injectable()
export class ResumeService {
  constructor(private readonly db: DbService) {}

  /** 文件上传(PDF/Word/图片):解码 → **提取+清洗文本** → 复用文本上传链路(consent/加密/结构化)。 */
  async uploadFile(principal: string, dto: UploadResumeFileDto) {
    const buffer = Buffer.from(dto.contentBase64, 'base64');
    if (buffer.length === 0) throw new HttpException({ error: 'empty_file' }, HttpStatus.BAD_REQUEST);
    if (buffer.length > MAX_RESUME_BYTES) throw new HttpException({ error: 'file_too_large' }, HttpStatus.PAYLOAD_TOO_LARGE);
    let extracted: { text: string; format: string };
    try {
      extracted = await extractResumeText(buffer, dto.mimeType, dto.filename);
    } catch (e: any) {
      if (e?.code === 'image_needs_ocr') throw new HttpException({ error: 'image_ocr_unavailable', hint: '图片简历 OCR(qwen-vl)接线中,请先传 PDF/Word 或粘贴文本' }, HttpStatus.UNPROCESSABLE_ENTITY);
      throw new HttpException({ error: 'parse_failed', format: undefined }, HttpStatus.UNPROCESSABLE_ENTITY);   // 解析失败可解释,不裸崩
    }
    if (extracted.text.trim().length < 20) throw new HttpException({ error: 'extracted_too_short', format: extracted.format }, HttpStatus.BAD_REQUEST);
    const r = await this.upload(principal, { text: extracted.text });            // 复用文本链路
    return { ...r, format: extracted.format, chars: extracted.text.length };
  }

  upload(principal: string, dto: UploadResumeDto) {
    return this.db.asPrincipal(principal, async (c: any) => {
      // PIPL 硬门槛:处理简历 PII 前必须有采集同意,否则拒绝(不偷偷处理)。
      const consent = await c.query("SELECT 1 FROM consent_record WHERE purpose='resume_processing' LIMIT 1");
      if (consent.rowCount === 0) throw new HttpException({ error: 'consent_required', purpose: 'resume_processing' }, HttpStatus.FORBIDDEN);
      const up = await createResumeWithBlob(c, principal, dto.text);          // 原文加密落库 + 去重
      if (up.dedup) return { resumeId: up.resumeId, status: 'deduped' };
      await transitionResume(c, principal, up.resumeId, 'uploaded', 'ingesting');
      await completeIngestion(c, principal, up.resumeId, ingestResume(dto.text)); // 结构化 + PII 脱敏 → ingested
      return { resumeId: up.resumeId, status: 'ingested' };
    });
  }

  list(principal: string) {
    return this.db.asPrincipal(principal, async (c: any) => {
      const r = await c.query('SELECT id, status FROM resume ORDER BY id');   // RLS:只己见
      return { resumes: r.rows };
    });
  }

  reparse(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c: any) => {
      const raw = await decryptResumeBlob(c, principal, id).catch(() => null);
      if (!raw) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      await c.query("UPDATE resume SET status='ingesting', version=version+1 WHERE id=$1 AND owner_user_id=$2", [id, principal]);
      await completeIngestion(c, principal, id, ingestResume(raw));            // 重新脱敏+结构化
      return { reparsed: true };
    });
  }

  remove(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c: any) => {
      await c.query('DELETE FROM resume_profile WHERE resume_id=$1', [id]);
      await c.query('DELETE FROM resume_blob WHERE resume_id=$1', [id]);
      const d = await c.query('DELETE FROM resume WHERE id=$1', [id]);
      if (d.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      return { deleted: true };
    });
  }

  profile(principal: string, id: string) {
    return this.db.asPrincipal(principal, async (c: any) => {
      const r = await c.query('SELECT structured, pii_summary, blocked_count FROM resume_profile WHERE resume_id=$1', [id]);
      if (r.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // RLS 0 行→404
      return r.rows[0];
    });
  }
}
