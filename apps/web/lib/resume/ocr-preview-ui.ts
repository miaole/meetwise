/**
 * Resume file-upload copy, accept list, and API error mapping for the preview
 * OCR path (UC-RES-081). Failures never invent a transcript: `text` /
 * `transcript` / `ocrText` from an error envelope are ignored.
 */

export const RESUME_TEXT_UPLOAD_TIMEOUT_MS = 8_000;
export const RESUME_OCR_PREVIEW_TIMEOUT_MS = 35_000;
export const RESUME_MAX_BYTES = 8 * 1024 * 1024;

export type ResumeUploadFailure = { ok: false; message: string; error: string };

const ANY_IMAGE_NAME = /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i;
const PREVIEW_IMAGE_NAME = /\.(png|jpe?g|webp)$/i;
const PREVIEW_IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);

const ERROR_MESSAGES: Record<string, string> = {
  image_ocr_unavailable: '图片简历识别未开放，请先传 PDF/Word 或粘贴文本。',
  ocr_failed: '图片识别失败，请换更清晰的图片或粘贴文本。系统不会编造识别结果。',
  ocr_no_content: '图片未能提取到有效简历内容，已按失败处理，不会保存编造的文字。请换更清晰的图片或粘贴文本。',
  ocr_duplicate: '该图片已在识别或对账中，请到简历列表查看，不要当作新的识别结果。',
  ocr_binding_missing: '图片简历缺少已登记识别绑定，请改传 PDF/Word 或粘贴文本。',
  ocr_binding_invalid: '图片简历绑定无法解析，已按失败处理并退还额度，请改传 PDF/Word 或粘贴文本。',
  consent_required: '请先同意隐私政策后再上传。',
  insufficient_entitlement: '额度不足，图片识别未执行。请改传 PDF/Word 或粘贴文本。',
  extracted_too_short: '未从文件读到足够文字。请粘贴文本或上传带文字层的 PDF。',
  ocr_preview_format: '预览版仅支持 PNG / JPEG / WebP。请改传这些格式、PDF/Word 或粘贴文本。',
  extracted_too_long: '文件内容过长，请精简后重传或粘贴核心文本。',
  file_too_large: '文件超过 8MB 上限。',
  empty_file: '请选择要上传的文件。',
  unsupported_file_format: '该格式尚未接入简历解析。请上传 PDF、Word，或在预览环境上传图片。',
  parse_failed: '文件解析失败，请换 PDF/Word 或粘贴文本。',
  too_many_requests: '文件上传过于频繁，请稍候再试。',
  server_busy: '解析繁忙，请稍候重试。',
  public_preview_read_only: '公开预览为只读，不能上传简历。',
  upload_timeout: '上传超时。识别失败不会编造文字，请稍后重试或改传 PDF/Word / 粘贴文本。',
  upload_failed: '文件上传暂未完成，请检查文件和网络后重试。不会编造识别结果。',
};

export function isResumeImageUpload(filename: string, mimeType: string): boolean {
  const mime = mimeType.trim().toLowerCase();
  if (mime.startsWith('image/')) return true;
  return ANY_IMAGE_NAME.test(filename);
}

/** Preview POST allowlist — must match `resumeFileAccept(true)`. */
export function isPreviewOcrImage(filename: string, mimeType: string): boolean {
  const mime = mimeType.trim().toLowerCase();
  if (PREVIEW_IMAGE_MIME.has(mime)) return true;
  if (mime.startsWith('image/')) return false;
  return PREVIEW_IMAGE_NAME.test(filename);
}

export function resumeFileAccept(ocrPreview: boolean): string {
  return ocrPreview ? '.pdf,.doc,.docx,image/png,image/jpeg,image/webp' : '.pdf,.doc,.docx';
}

export function resumeFileHelpText(ocrPreview: boolean): string {
  return ocrPreview
    ? '预览版可识别图片简历。失败不会编造文字；请改传清晰图片、PDF/Word 或粘贴文本。不是生产视觉质量承诺。≤ 8MB'
    : '支持 PDF / Word(.docx)· ≤ 8MB。图片识别未开放，请粘贴文本或上传带文字层的 PDF。';
}

export function resumeUploadCardDescription(ocrPreview: boolean): string {
  return ocrPreview
    ? '上传 PDF / Word，或在预览环境下上传图片。图片识别失败不会编造文字。'
    : '上传 PDF / Word，或直接粘贴文本。图片识别未在本环境开放。';
}

export function resumeOcrPreviewBanner(): string {
  return '预览版图片识别，不是生产视觉质量承诺。识别失败会原样提示，不会编造简历文字。';
}

export function resumeImageRefusedLocally(): ResumeUploadFailure {
  return { ok: false, error: 'image_ocr_unavailable', message: ERROR_MESSAGES.image_ocr_unavailable };
}

export function resumePreviewFormatRefused(): ResumeUploadFailure {
  return { ok: false, error: 'ocr_preview_format', message: ERROR_MESSAGES.ocr_preview_format };
}

/** Extract only the machine error code. Ignore any transcript-shaped fields. */
export function readResumeUploadErrorCode(body: unknown): string {
  if (!body || typeof body !== 'object') return 'upload_failed';
  const record = body as Record<string, unknown>;
  return typeof record.error === 'string' && record.error.trim() ? record.error.trim() : 'upload_failed';
}

export function mapResumeUploadError(status: number, body: unknown): ResumeUploadFailure {
  if (status === 413) return { ok: false, error: 'file_too_large', message: ERROR_MESSAGES.file_too_large };
  const error = readResumeUploadErrorCode(body);
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.upload_failed;
  return { ok: false, error, message };
}

export function mapResumeUploadAbort(): ResumeUploadFailure {
  return { ok: false, error: 'upload_timeout', message: ERROR_MESSAGES.upload_timeout };
}

export function isUploadTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
}
