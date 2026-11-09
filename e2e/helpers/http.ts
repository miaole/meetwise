export const BASE = process.env.E2E_BASE ?? 'http://127.0.0.1:8787';
export const PAY_SECRET = process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret';

// SSRF 守卫（门禁处置刀）：E2E 靶只允许回环/私有网段——与 performance.e2e.ts assertPerfTarget 同族。
// 每个 fetch 的最终拼合串在请求前重验（模板组合会切断 BASE 上校验的数据流链接），E2E_BASE 指向公网即 fail-closed。
const assertE2eTarget = (raw: string): string => {
  const url = new URL(raw);
  const host = url.hostname;
  const loopback = host === '127.0.0.1' || host === 'localhost' || host === '[::1]' || host === '::1';
  const privateV4 = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error(`e2e_target_protocol_forbidden:${url.protocol}`);
  if (!loopback && !privateV4) throw new Error(`e2e_target_not_private:${host}`);
  return raw;
};

/** 全部 E2E fetch 的唯一上游 URL 出口：`fetch(e2eUrl('/path'))`。 */
export const e2eUrl = (path: string): string => assertE2eTarget(`${BASE}${path}`);


/** 全部 E2E helper 的统一 HTTP 请求出口（r9·扫描器 SSRF 入口面消解：
 *  helper 内不出现裸 fetch(URL) 形态——统一经 testHttp 走 e2eUrl 守卫的唯一出口）。 */
export async function testHttp(path: string, init?: RequestInit): Promise<Response> {
  return fetch(e2eUrl(path), init);
}

export async function readJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function jsonHeaders(token?: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    'content-type': 'application/json',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
