/**
 * Resume file-upload copy, accept list, and API error mapping for the preview
 * OCR path (UC-RES-081). Failures never invent a transcript: `text` /
 * `transcript` / `ocrText` from an error envelope are ignored.
 */
import zhMessages from '../../messages/zh.json';

export const RESUME_TEXT_UPLOAD_TIMEOUT_MS = 8_000;
export const RESUME_OCR_PREVIEW_TIMEOUT_MS = 35_000;
export const RESUME_MAX_BYTES = 8 * 1024 * 1024;

export type ResumeUploadFailure = { ok: false; message: string; error: string };
export type ResumeUploadLocale = 'zh' | 'en';

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

// Product-facing en mapping for the same 20 machine codes. Keys must stay in
// parity with the zh map above (asserted by the uc003-i18n-locale prove, S4);
// values must stay CJK-free. Unknown codes fall back to `upload_failed`.
const ERROR_MESSAGES_EN: Record<string, string> = {
  image_ocr_unavailable: 'Image resume recognition is not available here. Please upload a PDF/Word or paste text.',
  ocr_failed: 'Image recognition failed. Try a clearer image or paste text. The system never invents recognition results.',
  ocr_no_content: 'No valid resume content could be extracted from the image; it was treated as a failure and nothing invented is saved. Try a clearer image or paste text.',
  ocr_duplicate: 'This image is already being recognized or reconciled. Check the resume list instead of treating it as a new recognition result.',
  ocr_binding_missing: 'The image resume lacks a registered recognition binding. Please upload a PDF/Word or paste text.',
  ocr_binding_invalid: 'The image resume binding cannot be parsed; it was treated as a failure and the credit was refunded. Please upload a PDF/Word or paste text.',
  consent_required: 'Please agree to the privacy policy before uploading.',
  insufficient_entitlement: 'Insufficient credit; image recognition was not executed. Please upload a PDF/Word or paste text.',
  extracted_too_short: 'Not enough text could be read from the file. Please paste text or upload a PDF with a text layer.',
  ocr_preview_format: 'Preview supports PNG / JPEG / WebP only. Please switch to those formats, PDF/Word, or paste text.',
  extracted_too_long: 'The file content is too long. Trim it, upload again, or paste the core text.',
  file_too_large: 'File exceeds the 8MB limit.',
  empty_file: 'Please choose a file to upload.',
  unsupported_file_format: 'This format is not wired into resume parsing yet. Please upload PDF or Word, or an image in preview environments.',
  parse_failed: 'File parsing failed. Try a PDF/Word or paste text.',
  too_many_requests: 'File uploads are too frequent. Please wait a moment and try again.',
  server_busy: 'Parsing is busy. Please wait and retry.',
  public_preview_read_only: 'The public preview is read-only; resumes cannot be uploaded.',
  upload_timeout: 'Upload timed out. A recognition failure never invents text. Please retry later or switch to PDF/Word or pasted text.',
  upload_failed: 'The file upload did not complete. Check the file and network and try again. Recognition results are never invented.',
};

function errorMessagesFor(locale: ResumeUploadLocale): Record<string, string> {
  return locale === 'en' ? ERROR_MESSAGES_EN : ERROR_MESSAGES;
}

// Co-located zh-default labels bundle: the zh values live verbatim in
// messages/zh.json (resumeUpload namespace), so the default output is
// byte-identical to the previous in-file literals while callers can pass
// next-intl labels to render the en catalog.
export type ResumeUploadCopyLabels = (key: string) => string;

const RESUME_UPLOAD_COPY_ZH = zhMessages.resumeUpload as unknown as Record<string, string>;

const defaultResumeUploadLabels: ResumeUploadCopyLabels = (key) => RESUME_UPLOAD_COPY_ZH[key] ?? key;

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

export function resumeFileHelpText(ocrPreview: boolean, labels: ResumeUploadCopyLabels = defaultResumeUploadLabels): string {
  return labels(ocrPreview ? 'helpPreview' : 'helpStandard');
}

export function resumeUploadCardDescription(ocrPreview: boolean, labels: ResumeUploadCopyLabels = defaultResumeUploadLabels): string {
  return labels(ocrPreview ? 'cardPreview' : 'cardStandard');
}

export function resumeOcrPreviewBanner(labels: ResumeUploadCopyLabels = defaultResumeUploadLabels): string {
  return labels('banner');
}

export function resumeImageRefusedLocally(locale: ResumeUploadLocale = 'zh'): ResumeUploadFailure {
  const messages = errorMessagesFor(locale);
  return { ok: false, error: 'image_ocr_unavailable', message: messages.image_ocr_unavailable };
}

export function resumePreviewFormatRefused(locale: ResumeUploadLocale = 'zh'): ResumeUploadFailure {
  const messages = errorMessagesFor(locale);
  return { ok: false, error: 'ocr_preview_format', message: messages.ocr_preview_format };
}

/** Extract only the machine error code. Ignore any transcript-shaped fields. */
export function readResumeUploadErrorCode(body: unknown): string {
  if (!body || typeof body !== 'object') return 'upload_failed';
  const record = body as Record<string, unknown>;
  return typeof record.error === 'string' && record.error.trim() ? record.error.trim() : 'upload_failed';
}

export function mapResumeUploadError(status: number, body: unknown, locale: ResumeUploadLocale = 'zh'): ResumeUploadFailure {
  const messages = errorMessagesFor(locale);
  if (status === 413) return { ok: false, error: 'file_too_large', message: messages.file_too_large };
  const error = readResumeUploadErrorCode(body);
  const message = messages[error] ?? messages.upload_failed;
  return { ok: false, error, message };
}

export function mapResumeUploadAbort(locale: ResumeUploadLocale = 'zh'): ResumeUploadFailure {
  const messages = errorMessagesFor(locale);
  return { ok: false, error: 'upload_timeout', message: messages.upload_timeout };
}

export function isUploadTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
}
