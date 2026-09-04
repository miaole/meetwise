import { createHmac } from 'node:crypto';
import { BASE, PAY_SECRET, readJson } from './http.ts';

/** HMAC event the live webhook verifies. Helpers never sign another event or skip verification. */
export const PAID_WEBHOOK_EVENT = 'paid' as const;
/** First credit or idempotent replay. Conflict / not_found are not success. */
export const WEBHOOK_CREDIT_RESULTS = ['credited', 'already'] as const;

export type CommerceHttpResult = { response: Response; body: any };
export type PayWebhookResult = CommerceHttpResult & { sig: string };

export function isWebhookCreditResult(result: unknown): result is (typeof WEBHOOK_CREDIT_RESULTS)[number] {
  return result === 'credited' || result === 'already';
}

export async function createOrder(headers: Record<string, string>, productId: string, idempotencyKey: string): Promise<CommerceHttpResult> {
  const response = await fetch(`${BASE}/commerce/orders`, {
    method: 'POST',
    headers: { ...headers, 'idempotency-key': idempotencyKey },
    body: JSON.stringify({ productId }),
  });
  const body = await readJson(response);
  return { response, body };
}

export function paidWebhookCanonical(orderId: string, providerTxn: string): string {
  if (typeof orderId !== 'string' || orderId.length === 0 || typeof providerTxn !== 'string' || providerTxn.length === 0) {
    throw new Error('e2e_webhook_canonical_missing');
  }
  return `${orderId}:${providerTxn}:${PAID_WEBHOOK_EVENT}`;
}

export function paidWebhookSignature(orderId: string, providerTxn: string, secret = PAY_SECRET): string {
  return createHmac('sha256', secret).update(paidWebhookCanonical(orderId, providerTxn)).digest('hex');
}

/**
 * POST the unauthenticated webhook with a caller-supplied signature.
 * Used by the fail-closed 403/404 cases. Does not invent a passing signature.
 */
export async function postPayWebhook(orderId: string, providerTxn: string, sig: string): Promise<CommerceHttpResult> {
  const response = await fetch(`${BASE}/commerce/webhook/pay/${orderId}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ providerTxn, sig }),
  });
  return { response, body: await readJson(response) };
}

export async function payWebhook(orderId: string, providerTxn: string, secret = PAY_SECRET): Promise<PayWebhookResult> {
  const sig = paidWebhookSignature(orderId, providerTxn, secret);
  return { ...await postPayWebhook(orderId, providerTxn, sig), sig };
}

export async function entitlement(headers: Record<string, string>): Promise<any> {
  return readJson(await fetch(`${BASE}/commerce/entitlement`, { headers }));
}
