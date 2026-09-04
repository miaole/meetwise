'use server';
import { serverFetch } from '../../lib/api/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isOcrPreviewEnabled } from '../../lib/ocr-preview';
import {
  RESUME_MAX_BYTES,
  RESUME_OCR_PREVIEW_TIMEOUT_MS,
  RESUME_TEXT_UPLOAD_TIMEOUT_MS,
  isPreviewOcrImage,
  isResumeImageUpload,
  isUploadTimeoutError,
  mapResumeUploadAbort,
  mapResumeUploadError,
  resumeImageRefusedLocally,
  resumePreviewFormatRefused,
  type ResumeUploadFailure,
} from '../../lib/resume/ocr-preview-ui';

/**
 * 简历相关 Server Actions:在服务端跑、带 httpOnly 令牌调 api、改完 revalidatePath 重渲列表。
 * 表单 action 直接绑这些函数,无需客户端 JS / fetch 包装,提交即走服务端。
 */

/** 硬失败兜底:非 ok 抛错落根错误边界(可读 + 重试),绝不静默 revalidate 让操作"点了没反应"。 */
function assertOk(res: Response) {
  if (!res.ok) throw new Error(`resume_action_failed_${res.status}`);
}

export type ResumeUploadActionResult =
  | { ok: true }
  | { ok: false; message: string };

/** 授予 PIPL 采集同意(上传简历前置)。此前 UI 无此入口 → 用户永远传不了简历(死胡同)。幂等。 */
export async function grantConsentAction(): Promise<void> {
  assertOk(await serverFetch('/privacy/consent', { method: 'POST', body: JSON.stringify({ purpose: 'resume_processing' }) }));
  // 真实移动端并发 E2E 发现，仅依赖 Server Action 的 RSC patch 时偶发停在 pending：后端已写入、
  // 但当前视图未提交。显式导航到带状态的 URL 强制获得新请求的服务端真相，避免用户停在“记录中”。
  // 不在跳转前 revalidatePath：它会额外启动一轮同页 RSC 刷新，网络慢或 API 短暂拥塞时该刷新可让
  // 表单一直处于 pending。redirect 本身会发起新的 no-store 请求，已足以读取刚写入的同意状态。
  redirect('/resume?updated=consent');
}

/**
 * Upload actions deliberately return a small typed result instead of throwing a navigation redirect. In real mobile
 * Chromium E2E, the API write completed (303 with x-action-redirect) but the RSC redirect occasionally never
 * committed, leaving the form permanently disabled. The client owns the post-success route transition and reads the
 * authoritative list with a new no-store navigation. Calling revalidatePath inside this action made its RSC response
 * wait on an unnecessary render and itself could leave the form pending, so uploads never revalidate server-side.
 */
async function readUploadFailure(res: Response): Promise<ResumeUploadFailure> {
  let body: unknown = null;
  try { body = await res.json(); } catch { /* non-JSON stays mapped as upload_failed */ }
  return mapResumeUploadError(res.status, body);
}

export async function uploadResumeAction(formData: FormData): Promise<ResumeUploadActionResult> {
  const text = String(formData.get('text') ?? '');
  if (text.trim().length < 20) return { ok: false, message: '简历正文至少需要 20 个字符。' };
  try {
    // API upload is content-HMAC idempotent. Bound the internal hop: an unavailable API must return a recoverable
    // result to the browser instead of holding React's transition pending forever.
    const res = await serverFetch('/resume', { method: 'POST', body: JSON.stringify({ text }), signal: AbortSignal.timeout(RESUME_TEXT_UPLOAD_TIMEOUT_MS) });
    if (res.status === 401) redirect('/login?expired=1');
    if (!res.ok) return readUploadFailure(res);
    return { ok: true };
  } catch (error) {
    if (isUploadTimeoutError(error)) return mapResumeUploadAbort();
    return { ok: false, message: '上传暂未完成，请检查网络后重试；不会重复扣费。' };
  }
}

/** 文件上传(PDF/Word/预览图片):Server Action 直收 File → base64 → /resume/file。失败不编造转写。 */
export async function uploadResumeFileAction(formData: FormData): Promise<ResumeUploadActionResult> {
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return { ok: false, message: '请选择要上传的文件。' };
  if (file.size > RESUME_MAX_BYTES) return { ok: false, message: '文件超过 8MB 上限。' };
  const image = isResumeImageUpload(file.name, file.type);
  if (image && !isOcrPreviewEnabled()) return resumeImageRefusedLocally();
  if (image && !isPreviewOcrImage(file.name, file.type)) return resumePreviewFormatRefused();
  const timeoutMs = image ? RESUME_OCR_PREVIEW_TIMEOUT_MS : RESUME_TEXT_UPLOAD_TIMEOUT_MS;
  try {
    const contentBase64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    const res = await serverFetch('/resume/file', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, mimeType: file.type, contentBase64 }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.status === 401) redirect('/login?expired=1');
    if (!res.ok) return readUploadFailure(res);
    return { ok: true };
  } catch (error) {
    if (isUploadTimeoutError(error)) return mapResumeUploadAbort();
    return { ok: false, message: '文件上传暂未完成，请检查文件和网络后重试。不会编造识别结果。' };
  }
}

export async function reparseResumeAction(id: string): Promise<void> {
  assertOk(await serverFetch('/resume/' + id + '/reparse', { method: 'POST' }));
  revalidatePath('/resume');
  redirect('/resume?updated=reparsed');
}
