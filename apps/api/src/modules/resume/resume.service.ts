import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { createResumeWithBlob, transitionResume, completeIngestion, decryptResumeBlob, reserveEntitlement, confirmConsumption, releaseConsumption } from '@meetwise/db';
import { ingestResume, extractResumeText } from '@meetwise/domain';
import { visionOcr, type ModelClient } from '@meetwise/ai-runtime';
import type { UploadResumeDto, UploadResumeFileDto } from '@meetwise/contracts';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';

const MAX_RESUME_BYTES = 8 * 1024 * 1024;   // 8MB 上限(防大文件 DoS)
const MAX_RESUME_TEXT = 60_000;             // 提取文本末线(对齐文本路径契约;防解压炸弹/超大文档提取出 MB 级文本无界落库+喂模型,安全审计 F3)
const PARSE_MAX = Number(process.env.RESUME_PARSE_MAX ?? 6);   // 全站同时解析上限(安全审计 F2 纵深:并发炸弹不堆积压垮事件循环)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;   // 简历 id(uuid 列)守卫:非 uuid 直查会 22P02→500,提前当 not_found 兜成 404
/** OCR 视觉模型客户端 DI token:组合根(app.module)决定真(qwen-vl)/假(scripted,测试)——service 不硬编、只认注入的 seam,故 /resume/file 可真端到端测(非 demo)。 */
export const OCR_VISION_CLIENT = Symbol.for('meetwise.OCR_VISION_CLIENT');

/**
 * 简历应用服务(拥有 asPrincipal 事务边界 + 业务编排)。controller 只解析/校验/映射 HTTP,不碰 SQL(修审计 F1)。
 * 机制全复用已 gate 的 db/domain:pgp 加密 blob、结构化 profile 永不含明文 PII、去重、状态机、RLS。
 */
@Injectable()
export class ResumeService {
  // vision 客户端由组合根注入(真 qwen-vl / 测试 scripted),service 不硬编 → 可端到端测。
  constructor(private readonly db: DbService, @Inject(OCR_VISION_CLIENT) private readonly vision: ModelClient, private readonly rl: RateLimitService) {}

  // 文件上传 = CPU 重的解析(PDF/docx,可炸弹)+ 可能触发付费 OCR → per-principal 令牌桶(安全审计 F2)。突发 15、稳态 0.1/秒(~6/分),正常传够、滥用循环被摁住。
  private uploadGate(principal: string) {
    if (!this.rl.allow(`resume-file:${principal}`, 15, 0.1))
      throw new HttpException({ error: 'too_many_requests', message: '文件上传过于频繁,请稍候' }, HttpStatus.TOO_MANY_REQUESTS);
  }

  /** 文件上传(PDF/Word/图片):解码 → **提取+清洗文本** → 复用文本上传链路(consent/加密/结构化)。图片走 OCR(按次计费)。 */
  async uploadFile(principal: string, dto: UploadResumeFileDto) {
    this.uploadGate(principal);                                              // 限流先行:解码/解析前就摁住滥用(防炸弹并发压事件循环)
    const buffer = Buffer.from(dto.contentBase64, 'base64');
    if (buffer.length === 0) throw new HttpException({ error: 'empty_file' }, HttpStatus.BAD_REQUEST);
    if (buffer.length > MAX_RESUME_BYTES) throw new HttpException({ error: 'file_too_large' }, HttpStatus.PAYLOAD_TOO_LARGE);
    // **全局解析并发闸(安全审计 F2 纵深)**:PDF/docx 解析是 CPU 重活压事件循环;即使多用户各自限流内并发涌入,
    // 全站同时最多 PARSE_MAX 个在解析,超出快速失败(503)不堆积——把"并发炸弹压垮事件循环"的爆炸半径钉死。配合已有 8s 提取超时 + 字节/文本封顶。
    if (!this.rl.acquireSlot('resume-parse:global', PARSE_MAX))
      throw new HttpException({ error: 'server_busy', message: '解析繁忙,请稍候重试' }, HttpStatus.SERVICE_UNAVAILABLE);
    let extracted: { text: string; format: string };
    try {
      extracted = await extractResumeText(buffer, dto.mimeType, dto.filename);
    } catch (e: any) {
      // 图片简历 → OCR 路径(qwen-vl 转写 → 回灌文本链路);转写文本随后与文本简历同一道门(注入清洗/stripPii/结构化)。
      // finally 在 return 前也会执行 → 解析槽恰好释放一次(不在此显式释放,避免并发下双减)。
      if (e?.code === 'image_needs_ocr') return this.uploadImageViaOcr(principal, buffer, dto);
      throw new HttpException({ error: 'parse_failed', format: undefined }, HttpStatus.UNPROCESSABLE_ENTITY);   // 解析失败可解释,不裸崩
    } finally {
      this.rl.releaseSlot('resume-parse:global');   // 所有路径(成功/图片重定向 return/解析失败 throw)都恰好释放一次
    }
    // 扫描型 PDF(文本层空)：本期图片 OCR 已通,PDF→逐页图渲染是快随项(见 UC-RES-003 A2),暂给可解释降级不静默。
    if (extracted.text.trim().length < 20) throw new HttpException({ error: 'extracted_too_short', format: extracted.format, hint: '未从文件读到足够文字;若为扫描件/图片型 PDF,请改传清晰图片或粘贴文本' }, HttpStatus.BAD_REQUEST);
    if (extracted.text.length > MAX_RESUME_TEXT) throw new HttpException({ error: 'extracted_too_long', format: extracted.format, max: MAX_RESUME_TEXT, hint: '文件内容过长(疑似非常规简历/解压炸弹),请精简后重传或粘贴核心文本' }, HttpStatus.PAYLOAD_TOO_LARGE);   // 安全审计 F3:防超大提取文本无界落库/喂模型
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
    try { structured = await this.upload(principal, { text }, 'needs_review'); }   // 结构化复用文本链路(注入清洗/stripPii/加密/去重);**OCR/图片源恒 needs_review**(伪造证件不冒充判真伪)
    catch (e) {                                                                  // 下游结构化失败 → **退 OCR 费**(决策B)
      await this.db.asPrincipal(principal, (c: any) => releaseConsumption(c, principal, ocrKey));
      throw e;
    }
    await this.db.asPrincipal(principal, (c: any) => confirmConsumption(c, principal, ocrKey));   // 可用画像已产出 → 按次落账(决策B)
    return { ...structured, format: 'image', chars: text.length, ocr: true };
  }

  /** profileStatus:OCR/图片源传 'needs_review'(系统不冒充判真伪,给人工复核落地位);文本/PDF 文本层默认 'ok'。 */
  upload(principal: string, dto: UploadResumeDto, profileStatus: 'ok' | 'needs_review' = 'ok') {
    // NUL 字节(\u0000)在 Postgres text 类型里非法,直喂 pgp_sym_encrypt 会抛 → 500;简历文本里 NUL 无意义,落库前一律剥除(负测抓到)。
    const text = dto.text.replace(/\u0000/g, '');
    return this.db.asPrincipal(principal, async (c: any) => {
      // PIPL 硬门槛:处理简历 PII 前必须有采集同意,否则拒绝(不偷偷处理)。
      const consent = await c.query("SELECT 1 FROM consent_record WHERE purpose='resume_processing' LIMIT 1");
      if (consent.rowCount === 0) throw new HttpException({ error: 'consent_required', purpose: 'resume_processing' }, HttpStatus.FORBIDDEN);
      const up = await createResumeWithBlob(c, principal, text);          // 原文加密落库 + 去重
      if (up.dedup) return { resumeId: up.resumeId, status: 'deduped' };
      await transitionResume(c, principal, up.resumeId, 'uploaded', 'ingesting');
      await completeIngestion(c, principal, up.resumeId, ingestResume(text), profileStatus); // 结构化 + PII 脱敏 → ingested
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
    // resume/resume_profile/resume_blob 的 id 是 uuid 列;非 uuid 的 :id 直查会触发 Postgres 22P02 → 500。
    // 非 uuid 不可能对应任何行,等价于 not_found → 干净 404(负测抓到 profile/delete 缺此兜底)。
    if (!UUID_RE.test(id)) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
    return this.db.asPrincipal(principal, async (c: any) => {
      await c.query('DELETE FROM resume_profile WHERE resume_id=$1', [id]);
      await c.query('DELETE FROM resume_blob WHERE resume_id=$1', [id]);
      const d = await c.query('DELETE FROM resume WHERE id=$1', [id]);
      if (d.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);
      return { deleted: true };
    });
  }

  profile(principal: string, id: string) {
    if (!UUID_RE.test(id)) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);   // 非 uuid → 22P02 500 兜底成 404(负测抓到)
    return this.db.asPrincipal(principal, async (c: any) => {
      const r = await c.query('SELECT structured, pii_summary, blocked_count, status, confidence FROM resume_profile WHERE resume_id=$1', [id]);
      if (r.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND); // RLS 0 行→404
      return r.rows[0];
    });
  }
}
