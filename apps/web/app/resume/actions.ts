'use server';
import { serverFetch } from '../../lib/api/server';
import { revalidatePath } from 'next/cache';

/**
 * 简历相关 Server Actions:在服务端跑、带 httpOnly 令牌调 api、改完 revalidatePath 重渲列表。
 * 表单 action 直接绑这些函数,无需客户端 JS / fetch 包装,提交即走服务端。
 */

/** 硬失败兜底:非 ok 抛错落根错误边界(可读 + 重试),绝不静默 revalidate 让操作"点了没反应"。 */
function assertOk(res: Response) {
  if (!res.ok) throw new Error(`resume_action_failed_${res.status}`);
}

export async function uploadResumeAction(formData: FormData): Promise<void> {
  const text = String(formData.get('text') ?? '');
  if (text.trim().length < 20) return; // 过短直接忽略(表单已 required minLength=20,这里再兜一层)
  assertOk(await serverFetch('/resume', { method: 'POST', body: JSON.stringify({ text }) }));
  revalidatePath('/resume');
}

/** 文件上传(PDF/Word/图片):Server Action 直收 File → base64 → /resume/file(服务端提取+清洗)。 */
export async function uploadResumeFileAction(formData: FormData): Promise<void> {
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return;
  if (file.size > 8 * 1024 * 1024) throw new Error('resume_file_too_large');   // 8MB 上限:显式报错而非静默吞掉
  const contentBase64 = Buffer.from(await file.arrayBuffer()).toString('base64');
  assertOk(await serverFetch('/resume/file', { method: 'POST', body: JSON.stringify({ filename: file.name, mimeType: file.type, contentBase64 }) }));
  revalidatePath('/resume');
}

export async function deleteResumeAction(id: string): Promise<void> {
  assertOk(await serverFetch('/resume/' + id, { method: 'DELETE' }));
  revalidatePath('/resume');
}

export async function reparseResumeAction(id: string): Promise<void> {
  assertOk(await serverFetch('/resume/' + id + '/reparse', { method: 'POST' }));
  revalidatePath('/resume');
}
