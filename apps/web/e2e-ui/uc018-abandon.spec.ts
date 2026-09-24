import { test, expect, type BrowserContext, type APIRequestContext } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';

/**
 * UC-E2E-018 §1b #5 · GAP-UC018-UI dedicated browser prove.
 *
 * In-interview 「放弃」→ same HTTP abandon contract (abandoned + released · irreversible).
 * Prefer e2e:ui:isolated / Playwright. Ban wash uc018:abandon:* / full-e2e / graph / ttl EXIT=0
 * into UI closed / UC covered. UI alone ≠ UC-E2E-018 covered · matrix stays partial · #6 OPEN.
 *
 * Grep anchor for dedicated prove CMD: UC018-UI-abandon
 *
 * Setup note: signup/resume/credit via UI+HMAC; create+begin via API so we open /interview/:id
 * with a reserved live session and click 「放弃」before worker fail-closed races the reservation.
 * The assert nails the **UI trigger → same HTTP contract**, not the worker happy-path.
 */
const API = process.env.E2E_API_BASE ?? 'http://127.0.0.1:8787';
const PASSWORD = 'strongpw123';

async function tokenOf(context: BrowserContext): Promise<string> {
  const token = (await context.cookies()).find((c) => c.name === 'mw_token')?.value;
  expect(token, '注册后 browser httpOnly cookie 中应存在 Bearer token').toBeTruthy();
  return token!;
}

async function provisionPaidInterviewCredit(request: APIRequestContext, token: string, nonce: string) {
  const order = await request.post(`${API}/commerce/orders`, {
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': `ui-uc018:${nonce}`,
    },
    data: { productId: 'pack_10' },
  });
  expect(order.status(), `commerce/orders → 200 (got ${order.status()})`).toBe(200);
  const { orderId } = (await order.json()) as { orderId: string };
  const providerTxn = `ui-uc018-${nonce}`;
  const sig = createHmac('sha256', process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret')
    .update(`${orderId}:${providerTxn}:paid`)
    .digest('hex');
  const paid = await request.post(`${API}/commerce/webhook/pay/${orderId}`, {
    data: { providerTxn, sig },
  });
  expect(paid.status(), `pay webhook → 200 (got ${paid.status()})`).toBe(200);
}

async function entitlementUnits(request: APIRequestContext, token: string): Promise<number> {
  const res = await request.get(`${API}/commerce/entitlement`, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  const body = (await res.json()) as { availableUnits?: number };
  return Number(body.availableUnits ?? 0);
}

async function primaryResumeId(request: APIRequestContext, token: string): Promise<string> {
  const res = await request.get(`${API}/resume`, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  const body = (await res.json()) as { resumes?: Array<{ id: string; status?: string }> };
  const list = body.resumes ?? [];
  const ready = list.find((r) => r.status === 'ingested') ?? list[0];
  expect(ready?.id, '至少一份可用简历').toBeTruthy();
  return ready!.id;
}

test('UC018-UI-abandon: in-interview 放弃 → abandoned+released · irreversible · same HTTP contract', async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const suffix = randomUUID();
  const email = `e2e-uc018-ui-${suffix}@x.com`;

  // 1) 注册（真浏览器 Server Action → mw_token cookie）
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[name="mode"][value="signup"]');
  await page.waitForURL('**/dashboard', { timeout: 20_000 });

  const token = await tokenOf(page.context());
  await provisionPaidInterviewCredit(request, token, suffix);
  const unitsBefore = await entitlementUnits(request, token);
  expect(unitsBefore, '支付入账后额度 ≥ 1').toBeGreaterThanOrEqual(1);

  // 2) PIPL 同意 + 上传简历（页面交互）
  await page.goto('/resume');
  await page.getByRole('button', { name: /我已阅读并同意/ }).click();
  await page.fill(
    'textarea[name="text"]',
    '后端工程师 3 年。熟悉 Redis 限流、幂等订单、MySQL 分库分表与可观测性。',
  );
  await page.getByRole('button', { name: '上传简历', exact: true }).click();
  await expect(page.getByText(/解析完成/).first()).toBeVisible({ timeout: 30_000 });
  const resumeId = await primaryResumeId(request, token);

  // 3) API create+begin → reserved live session（与 full.e2e abandon 同前置；UI 负责触发 abandon）
  const created = await request.post(`${API}/interview`, {
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    data: {},
  });
  expect(created.status(), `POST /interview → 200/201 (got ${created.status()})`).toBeGreaterThanOrEqual(200);
  expect(created.status()).toBeLessThan(300);
  const createdBody = (await created.json()) as { interviewId?: string; id?: string };
  const interviewId = createdBody.interviewId ?? createdBody.id;
  expect(interviewId, 'create → interviewId').toBeTruthy();

  const begin = await request.post(`${API}/interview/${encodeURIComponent(interviewId!)}/begin`, {
    headers: {
      authorization: `Bearer ${token}`,
      'resume-id': resumeId,
      'content-type': 'application/json',
    },
    data: {},
  });
  const beginText = await begin.text();
  expect(
    begin.status() === 202 || begin.status() === 200,
    `POST begin → 202/200 (got ${begin.status()} body=${beginText.slice(0, 200)})`,
  ).toBe(true);
  const unitsAfterBegin = await entitlementUnits(request, token);
  expect(unitsAfterBegin, 'begin 后额度 -1（reserved）').toBe(unitsBefore - 1);

  // 4) 打开面试页 → 立刻点「放弃」（赶在 worker fail-closed 把会话打成 failed 之前）
  await page.goto(`/interview/${interviewId}`);
  await expect(page.getByTestId('uc018-abandon-trigger').first()).toBeVisible({ timeout: 10_000 });
  const abandonRespPromise = page.waitForResponse(
    (r) =>
      r.url().includes(`/api/interview/${encodeURIComponent(interviewId!)}/abandon`) &&
      r.request().method() === 'POST',
    { timeout: 15_000 },
  );
  await page.getByTestId('uc018-abandon-trigger').first().click();
  await expect(page.getByTestId('uc018-abandon-confirm')).toBeVisible({ timeout: 5_000 });
  await page.getByTestId('uc018-abandon-confirm-yes').click();
  const abandonResp = await abandonRespPromise;
  expect(abandonResp.status(), 'UI abandon proxy → 200').toBe(200);
  const abandonBody = (await abandonResp.json()) as {
    abandoned?: boolean;
    released?: string;
    alreadyAbandoned?: boolean;
  };
  expect(abandonBody.abandoned, 'body.abandoned=true').toBe(true);
  expect(abandonBody.released, 'body.released=released（同 HTTP 合同）').toBe('released');
  expect(abandonBody.alreadyAbandoned === true, '首弃 alreadyAbandoned≠true').toBe(false);

  // 5) 终态：跳转列表 / 可读 abandoned；额度净变 0；begin 拒复活；二次 abandon 幂等
  await page.waitForURL('**/interviews**', { timeout: 20_000 });
  const unitsAfterAbandon = await entitlementUnits(request, token);
  expect(unitsAfterAbandon, 'abandon 后额度净变 0').toBe(unitsBefore);

  const got = await request.get(`${API}/interview/${encodeURIComponent(interviewId!)}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(got.status()).toBe(200);
  const gotBody = (await got.json()) as { status?: string };
  expect(gotBody.status, 'GET interview → abandoned').toBe('abandoned');

  await expect(page.getByText(/已放弃/).first()).toBeVisible({ timeout: 20_000 });

  const beginAgain = await request.post(`${API}/interview/${encodeURIComponent(interviewId!)}/begin`, {
    headers: { authorization: `Bearer ${token}`, 'resume-id': resumeId },
    data: {},
  });
  expect(beginAgain.status(), 'abandon 后 begin → 409（不可 resume）').toBe(409);
  const beginBody = (await beginAgain.json().catch(() => ({}))) as { error?: string };
  expect(beginBody.error ?? '', 'begin error=interview_not_active').toMatch(/interview_not_active/);

  const again = await request.post(`${API}/interview/${encodeURIComponent(interviewId!)}/abandon`, {
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    data: {},
  });
  expect(again.status()).toBe(200);
  const againBody = (await again.json()) as {
    abandoned?: boolean;
    released?: string;
    alreadyAbandoned?: boolean;
  };
  expect(againBody.abandoned).toBe(true);
  expect(againBody.alreadyAbandoned).toBe(true);
  expect(againBody.released).toBe('noop');
});
