'use server';
import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/api/server';

/** 删除权(PIPL):删自己的简历数据(原文 blob + 结构化 profile + 记录)。服务端读 cookie 加 Bearer。 */
export async function deleteResumeDataAction() {
  const res = await serverFetch('/privacy/resume-data', { method: 'DELETE' });
  // 不可撤销的删除:失败必须显式报错(落根错误边界),绝不静默"看起来成功了"。
  if (!res.ok) throw new Error(`delete_resume_data_failed_${res.status}`);
  revalidatePath('/privacy');
  revalidatePath('/resume');
}
