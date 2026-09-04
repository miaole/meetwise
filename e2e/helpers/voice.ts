import { emitE2EReview, tagE2EFailure } from './failure.ts';
import { readJson } from './http.ts';

export type LiveGatewayResult = { response: Response; body: any; attempts: number };

/**
 * Live third-party voice may return 429/5xx. E2E may retry only after a
 * definite failure, at most twice by default. Production API does not blindly
 * retry unknown writes. Failure responses print status codes, never audio.
 */
export async function callLiveVoiceGateway(label: string, operation: () => Promise<Response>): Promise<LiveGatewayResult> {
  const maxAttempts = Math.min(2, Math.max(1, Number(process.env.E2E_VOICE_MAX_ATTEMPTS ?? 2) || 2));
  let last: LiveGatewayResult | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await operation();
      const body = await readJson(response);
      last = { response, body, attempts: attempt };
      const retryable = response.status === 429 || response.status === 408 || response.status >= 500;
      if (response.status === 200 || !retryable || attempt === maxAttempts) return last;
      emitE2EReview({ class: 'provider', code: 'voice_transient' });
      console.warn(`[E2E] ${label} 暂态失败，第 ${attempt}/${maxAttempts} 次: status=${response.status}, error=${String(body?.error ?? body?.message ?? 'unknown').slice(0, 120)}`);
    } catch (error: any) {
      if (attempt === maxAttempts) throw tagE2EFailure('provider', 'voice_gateway_network', error);
      emitE2EReview({ class: 'provider', code: 'voice_transient' });
      console.warn(`[E2E] ${label} 网络异常，第 ${attempt}/${maxAttempts} 次: ${String(error?.message ?? error).slice(0, 120)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
  }
  throw tagE2EFailure('provider', 'voice_gateway_exhausted');
}
