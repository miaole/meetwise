import { createHmac } from 'node:crypto';
import { BASE, PAY_SECRET, readJson } from './http.ts';

export async function createOrder(headers: Record<string, string>, productId: string, idempotencyKey: string): Promise<any> {
  const response = await fetch(`${BASE}/commerce/orders`, {
    method: 'POST',
    headers: { ...headers, 'idempotency-key': idempotencyKey },
    body: JSON.stringify({ productId }),
  });
  const body = await readJson(response);
  return { response, body };
}

export async function payWebhook(orderId: string, providerTxn: string, secret = PAY_SECRET): Promise<any> {
  const sig = createHmac('sha256', secret).update(`${orderId}:${providerTxn}:paid`).digest('hex');
  const response = await fetch(`${BASE}/commerce/webhook/pay/${orderId}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ providerTxn, sig }),
  });
  return { response, body: await readJson(response), sig };
}

export async function entitlement(headers: Record<string, string>): Promise<any> {
  return readJson(await fetch(`${BASE}/commerce/entitlement`, { headers }));
}
