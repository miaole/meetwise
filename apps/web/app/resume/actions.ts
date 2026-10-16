'use server';
import { serverFetch } from '../../lib/api/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '../../i18n/request';
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

// 上传面内联文案的双语载体(zh 缺省逐字节=迁移前字面;en 值 CJK-free 由 uc003-i18n-locale prove S4 逐处断言)。
// 作用域=上传面五处;deleteResumeAction 的四条失败消息已迁 messages resumeDelete namespace(UC003 i18n 后刀承接,
// 经 next-intl 管道按 cookie locale 渲染,由同 prove S6 逐处断言)。
const UPLOAD_MESSAGES = {
  textTooShort: { zh: '简历正文至少需要 20 个字符。', en: 'Resume text needs at least 20 characters.' },
  uploadIncomplete: { zh: '上传暂未完成，请检查网络后重试；不会重复扣费。', en: 'The upload did not complete. Check your network and try again; you will not be charged twice.' },
  chooseFile: { zh: '请选择要上传的文件。', en: 'Please choose a file to upload.' },
  fileTooLarge: { zh: '文件超过 8MB 上限。', en: 'File exceeds the 8MB limit.' },
  fileUploadIncomplete: { zh: '文件上传暂未完成，请检查文件和网络后重试。不会编造识别结果。', en: 'The file upload did not complete. Check the file and network and try again. Recognition results are never invented.' },
} as const;

// locale 仅取自 cookie(i18n/request.ts 同契约;Accept-Language 另刀)。
async function resumeUploadLocale(): Promise<Locale> {
  return (await cookies()).get('locale')?.value === 'en' ? 'en' : 'zh';
}

/** 硬失败兜底:非 ok 抛错落根错误边界(可读 + 重试),绝不静默 revalidate 让操作"点了没反应"。 */
function assertOk(res: Response) {
  if (!res.ok) throw new Error(`resume_action_failed_${res.status}`);
}

export type ResumeUploadActionResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * 授予 PIPL 采集同意(上传简历前置)。此前 UI 无此入口 → 用户永远传不了简历(死胡同)。幂等。
 * G3(RESUME-GROUNDING rev3)最小同意面:上传入口一次性用途选择——勾选后同时授予
 * `interview_personalization`(面试出题个性化)。文案按审计附录 C E 项原文明示
 * 「简历要点将发送给模型服务商用于出题」;不勾选只授采集同意,worker 同意门读缺行即不注入简历要点。
 * 撤回走 DELETE /privacy/consent?purpose=…(G4,最小读写面)。
 */
export async function grantConsentAction(formData: FormData): Promise<void> {
  assertOk(await serverFetch('/privacy/consent', { method: 'POST', body: JSON.stringify({ purpose: 'resume_processing' }) }));
  if (formData.get('interview_personalization') === 'on') {
    assertOk(await serverFetch('/privacy/consent', { method: 'POST', body: JSON.stringify({ purpose: 'interview_personalization' }) }));
  }
  // 真实移动端并发 E2E 发现，仅依赖 Server Action 的 RSC patch 时偶发停在 pending：后端已写入、
  // 但当前视图未提交。显式导航到带状态的 URL 强制获得新请求的服务端真相，避免用户停在“记录中”。
  // 不在跳转前 revalidatePath：它会额外启动一轮同页 RSC 刷新，网络慢或 API 短暂拥塞时该刷新可让
  // 表单一直处于 pending。redirect 本身会发起新的 no-store 请求，已足以读取刚写入的同意状态。
  redirect('/resume?updated=consent');
}

/**
 * G4(RESUME-GROUNDING rev3)最小撤回面:撤回=停止后续使用(行删除)。
 * 已生成的题目/事件不回溯清除(Non-claims 覆盖;#81 全量撤回归 W5)。
 */
export async function withdrawInterviewPersonalizationAction(): Promise<void> {
  assertOk(await serverFetch('/privacy/consent?purpose=interview_personalization', { method: 'DELETE' }));
  revalidatePath('/resume');
  redirect('/resume?updated=consent_withdrawn');
}

/**
 * Upload actions deliberately return a small typed result instead of throwing a navigation redirect. In real mobile
 * Chromium E2E, the API write completed (303 with x-action-redirect) but the RSC redirect occasionally never
 * committed, leaving the form permanently disabled. The client owns the post-success route transition and reads the
 * authoritative list with a new no-store navigation. Calling revalidatePath inside this action made its RSC response
 * wait on an unnecessary render and itself could leave the form pending, so uploads never revalidate server-side.
 */
async function readUploadFailure(res: Response, locale: Locale): Promise<ResumeUploadFailure> {
  let body: unknown = null;
  try { body = await res.json(); } catch { /* non-JSON stays mapped as upload_failed */ }
  return mapResumeUploadError(res.status, body, locale);
}

export async function uploadResumeAction(formData: FormData): Promise<ResumeUploadActionResult> {
  const locale = await resumeUploadLocale();
  const text = String(formData.get('text') ?? '');
  if (text.trim().length < 20) return { ok: false, message: UPLOAD_MESSAGES.textTooShort[locale] };
  try {
    // API upload is content-HMAC idempotent. Bound the internal hop: an unavailable API must return a recoverable
    // result to the browser instead of holding React's transition pending forever.
    const res = await serverFetch('/resume', { method: 'POST', body: JSON.stringify({ text }), signal: AbortSignal.timeout(RESUME_TEXT_UPLOAD_TIMEOUT_MS) });
    if (res.status === 401) redirect('/login?expired=1');
    if (!res.ok) return readUploadFailure(res, locale);
    return { ok: true };
  } catch (error) {
    if (isUploadTimeoutError(error)) return mapResumeUploadAbort(locale);
    return { ok: false, message: UPLOAD_MESSAGES.uploadIncomplete[locale] };
  }
}

/** 文件上传(PDF/Word/预览图片):Server Action 直收 File → base64 → /resume/file。失败不编造转写。 */
export async function uploadResumeFileAction(formData: FormData): Promise<ResumeUploadActionResult> {
  const locale = await resumeUploadLocale();
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return { ok: false, message: UPLOAD_MESSAGES.chooseFile[locale] };
  if (file.size > RESUME_MAX_BYTES) return { ok: false, message: UPLOAD_MESSAGES.fileTooLarge[locale] };
  const image = isResumeImageUpload(file.name, file.type);
  if (image && !isOcrPreviewEnabled()) return resumeImageRefusedLocally(locale);
  if (image && !isPreviewOcrImage(file.name, file.type)) return resumePreviewFormatRefused(locale);
  const timeoutMs = image ? RESUME_OCR_PREVIEW_TIMEOUT_MS : RESUME_TEXT_UPLOAD_TIMEOUT_MS;
  try {
    const contentBase64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    const res = await serverFetch('/resume/file', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, mimeType: file.type, contentBase64 }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.status === 401) redirect('/login?expired=1');
    if (!res.ok) return readUploadFailure(res, locale);
    return { ok: true };
  } catch (error) {
    if (isUploadTimeoutError(error)) return mapResumeUploadAbort(locale);
    return { ok: false, message: UPLOAD_MESSAGES.fileUploadIncomplete[locale] };
  }
}

export async function reparseResumeAction(id: string): Promise<void> {
  assertOk(await serverFetch('/resume/' + id + '/reparse', { method: 'POST' }));
  revalidatePath('/resume');
  redirect('/resume?updated=reparsed');
}

/**
 * 简历软删受理（UNSTUB-ERASE rev2）：DELETE /resume/:id → 202 {mode:'logical',
 * purgePending:true}。**如实态**：受理即从列表/画像/一切处理面消失；后台物理清除
 * 稍后完成（purgePending 恒真直至 S2 逐回执闭合），本 action 永不把它显示成
 * 「已彻底删除」。幂等由 0152 内部派生键保证（重放同 requestId，不建第二份账）。
 */
export type ResumeDeleteActionResult =
  | { ok: true; purgePending: true }
  | { ok: false; message: string };

export async function deleteResumeAction(id: string): Promise<ResumeDeleteActionResult> {
  const t = await getTranslations({ locale: await resumeUploadLocale(), namespace: 'resumeDelete' });
  let res: Response;
  try {
    res = await serverFetch('/resume/' + encodeURIComponent(id), { method: 'DELETE' });
  } catch {
    return { ok: false, message: t('networkError') };
  }
  if (res.status === 401) redirect('/login?expired=1');
  if (res.status === 404) return { ok: false, message: t('notFound') };
  if (res.status !== 202) return { ok: false, message: t('notAccepted', { status: res.status }) };
  const body = await res.json().catch(() => null) as { mode?: string; purgePending?: boolean } | null;
  if (body?.mode !== 'logical' || body?.purgePending !== true) {
    return { ok: false, message: t('invalidShape') };
  }
  revalidatePath('/resume');
  return { ok: true, purgePending: true };
}
