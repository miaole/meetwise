'use server';
import { serverFetch } from '../../lib/api/server';

/**
 * 语音同意记录（CONSENT-MIN · #69 缩水件）：语音功能使用时由前端协议勾选卡触发本 action，
 * 服务端带 httpOnly 令牌 POST /privacy/consent {purpose:'voice_capture'} 落一条 consent_record。
 * 与上传采集同意（resume/actions.ts grantConsentAction）同形制，零新机制。
 *
 * await 落库成功前端才进 connecting/开录；非 ok 抛 `voice_consent_failed_<status>`
 * （沿 resume/actions.ts:26-28 assertOk 形），失败=停留/重开同意卡，不假前进、不请求麦克风。
 * 零 redirect 零 revalidate——本 action 只做记录，不动导航面。
 */
export async function grantVoiceCaptureConsentAction(): Promise<void> {
  const res = await serverFetch('/privacy/consent', { method: 'POST', body: JSON.stringify({ purpose: 'voice_capture' }) });
  if (!res.ok) throw new Error(`voice_consent_failed_${res.status}`);
}
