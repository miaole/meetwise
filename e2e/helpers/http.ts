export const BASE = process.env.E2E_BASE ?? 'http://127.0.0.1:8787';
export const PAY_SECRET = process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret';

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
