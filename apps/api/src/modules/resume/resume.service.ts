import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { createResumeWithBlob, transitionResume, completeIngestion, decryptResumeBlob, reserveEntitlement, confirmConsumption, releaseConsumption } from '@meetwise/db';
import { ingestResume, extractResumeText } from '@meetwise/domain';
import { visionOcr, openAICompatibleClient, type ModelClient } from '@meetwise/ai-runtime';
import type { UploadResumeDto, UploadResumeFileDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';

const MAX_RESUME_BYTES = 8 * 1024 * 1024;   // 8MB 上限(防大文件 DoS)

/**
 * 简历应用服务(拥有 asPrincipal 事务边界 + 业务编排)。controller 只解析/校验/映射 HTTP,不碰 SQL(修审计 F1)。
 * 机制全复用已 gate 的 db/domain:pgp 加密 blob、结构化 profile 永不含明文 PII、去重、状态机、RLS。
 */
@Injectable()
export class ResumeService {
  // 视觉模型客户端(qwen-vl):OCR 转写用。key/endpoint 从 env;未配置 → 当瞬时不可用触发降级(不崩)。
  private readonly vision: ModelClient = openAICompatibleClient({ model: process.env.VISION_MODEL_NAME ?? 'qwen-vl-max' });
  constructor(private readonly db: DbService) {}

  /** 文件上传(PDF/Word/图片):解码 → **提取+清洗文本** → 复用文本上传链路(consent/加密/结构化)。图片走 OCR(按次计费)。 */
  async uploadFile(principal: string, dto: UploadResumeFileDto) {
    const buffer = Buffer.from(dto.contentBase64, 'base64');
    if (buffer.length === 0) throw new HttpException({ error: 'empty_file' }, HttpStatus.BAD_REQUEST);
    if (buffer.length > MAX_RESUME_BYTES) throw new HttpException({ error: 'file_too_large' }, HttpStatus.PAYLOAD_TOO_LARGE);
    let extracted: { text: string; format: string };
    try {
      extracted = await extractResumeText(buffer, dto.mimeType, dto.filename);
    } catch (e: any) {
      // 图片简历 → OCR 路径(qwen-vl 转写 → 回灌文本链路);转写文本随后与文本简历同一道门(注入清洗/stripPii/结构化)。
      if (e?.code === 'image_needs_ocr') return this.uploadImageViaOcr(principal, buffer, dto);
      throw new HttpException({ error: 'parse_failed', format: undefined }, HttpStatus.UNPROCESSABLE_ENTITY);   // 解析失败可解释,不裸崩
    }
    // 扫描型 PDF(文本层空)：本期图片 OCR 已通,PDF→逐页图渲染是快随项(见 UC-RES-003 A2),暂给可解释降级不静默。
    if (extracted.text.trim().length < 20) throw new HttpException({ error: 'extracted_too_short', format: extracted.format, hint: '未从文件读到足够文字;若为扫描件/图片型 PDF,请改传清晰图片或粘贴文本' }, HttpStatus.BAD_REQUEST);
    const r = await this.upload(principal, { text: extracted.text });            // 复用文本链路
    return { ...r, format: extracted.format, chars: extracted.text.length };
  }

  /**
   * 图片简历 OCR(同步走关口,按次计费)。承重(专家审计定稿):
   *  - 计费(决策B,用户拍板):图字节 HMAC 为幂等锚 `ocr:<hmac>`(不用易变 docId),reserve→**只有产出可用画像才 confirmed**;转写失败/无有效内容/结构化失败一律 released(退 OCR 费)。
   *  - 关口:视觉调用只走 invoke()(双校验 + PII 不入 trace + advisory-lock exactly-once)。
   *  - kill-switch:能力级 flag(`OCR_ENABLED=0`)→ 不 reserve、不调用,返回与现状一致的 422(前端已有降级文案),终态不重排。
   *  - 时序:响应形状不变(返回 `ingested`/`deduped`),前端与契约零改动。
   */
  private async uploadImageViaOcr(principal: string, buffer: Buffer, dto: UploadResumeFileDto) {
    if (process.env.OCR_ENABLED === '0') throw new HttpException({ error: 'image_ocr_unavailable', hint: '图片简历 OCR 暂不可用,请先传 PDF/Word 或粘贴文本' }, HttpStatus.UNPROCESSABLE_ENTITY);   // kill-switch
    const imgHash = createHash('sha256').update(buffer).digest('hex');
    const ocrKey = `ocr:${imgHash}`;                                             // 幂等锚 = 图片字节(同图重传/并发不重扣、不重调付费视觉模型)
    const dataUri = `data:${dto.mimeType || 'image/png'};base64,${dto.contentBase64}`;

    // reserve → 视觉转写 → confirm/release,同一 principal 事务(invoke 需事务 client 持 advisory 锁跨调用)。
    const text = await this.db.asPrincipal(principal, async (c: any) => {
      // PIPL:处理简历 PII(且要付费)前必须先有采集同意,绝不先扣费再拒。
      const consent = await c.query("SELECT 1 FROM consent_record WHERE purpose='resume_processing' LIMIT 1");
      if (consent.rowCount === 0) throw new HttpException({ error: 'consent_required', purpose: 'resume_processing' }, HttpStatus.FORBIDDEN);
      let reserve;
      try { reserve = await reserveEntitlement(c, principal, ocrKey, 'ocr', 1); }
      catch (e: any) {
        if (e?.code === 'insufficient_entitlement') throw new HttpException({ error: 'insufficient_entitlement', hint: '额度不足,请充值后再识别图片简历', requested: e.requested, available: e.available }, HttpStatus.PAYMENT_REQUIRED);
        throw e;
      }
      // 同图并发/重传:已在处理或已识别过 → 不重复调用/扣费,导用户去列表查看(无死胡同)。
      if (reserve.status === 'duplicate') throw new HttpException({ error: 'ocr_duplicate', hint: '该图片已识别或正在识别,请在简历列表查看' }, HttpStatus.CONFLICT);

      const r = await visionOcr(this.vision, c, principal, dataUri, ocrKey);
      if (!r.ok) {
        const reason = 'reason' in r ? r.reason : 'ocr_failed';                 // in 守卫收窄(稳健,不依赖判别式跨 await)
        await releaseConsumption(c, principal, ocrKey);                          // 转写失败/降级 → 不扣费
        throw new HttpException({ error: 'ocr_failed', reason, hint: '图片识别失败,请换更清晰的图片或粘贴文本' }, HttpStatus.UNPROCESSABLE_ENTITY);
      }
      return r.text as string;                                                   // 转写成功,**先不 confirm**(决策B:结构化产出可用画像才扣)
    });

    // **决策B(用户拍板):只有产出可用画像才扣 OCR 费;转写成功但无有效内容 / 结构化失败 → 一律退还。**
    //  预留在此保持 reserved(两 tx 之间若崩,C1 对账层按租约到期 sweep 回收,不泄漏)。
    if (ingestResume(text).facts.length === 0) {                                 // 转写成功但提取不到有效简历事实 → 画像不可用 → 退费
      await this.db.asPrincipal(principal, (c: any) => releaseConsumption(c, principal, ocrKey));
      throw new HttpException({ error: 'ocr_no_content', hint: '图片识别成功但未提取到有效简历内容,已退还额度,请换更清晰的图片或粘贴文本' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    let structured;
    try { structured = await this.upload(principal, { text }); }               // 结构化复用文本链路(注入清洗/stripPii/加密/去重同文本简历)
    catch (e) {                                                                  // 下游结构化失败 → **退 OCR 费**(决策B)
      await this.db.asPrincipal(principal, (c: any) => releaseConsumption(c, principal, ocrKey));
      throw e;
    }
    await this.db.asPrincipal(principal, (c: any) => confirmConsumption(c, principal, ocrKey));   // 可用画像已产出 → 按次落账(决策B)
    return { ...structured, format: 'image', chars: text.length, ocr: true };
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
