import { test, expect, type BrowserContext, type Page, type APIRequestContext } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';

/**
 * 真浏览器 C→B 闭环：两个独立 cookie context 分别扮演候选人/招聘方。
 *
 * 额度到账是支付方异步签名回调，不是前端可伪造的「购买」按钮；此用例仅以真实 HMAC webhook
 * provision 一笔测试额度，然后所有招聘方建岗/邀请、候选人简历/申请/开始/答题、前端 finalize
 * 都必须经 production Next UI 和 Server Action 完成。
 */
const API = process.env.E2E_API_BASE ?? 'http://127.0.0.1:8787';
const PASSWORD = 'strongpw123';

async function signUp(page: Page, email: string, role: 'candidate' | 'recruiter') {
  await page.goto('/login');
  if (role === 'recruiter') await page.getByRole('tab', { name: /招聘方/ }).click();
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.getByRole('button', { name: /注册|Sign up/i }).click();
  await page.waitForURL(role === 'recruiter' ? '**/recruiter/jobs' : '**/dashboard', { timeout: 20_000 });
}

async function tokenOf(context: BrowserContext): Promise<string> {
  const token = (await context.cookies()).find((c) => c.name === 'mw_token')?.value;
  expect(token, '注册后 browser httpOnly cookie 中应存在 Bearer token').toBeTruthy();
  return token!;
}

async function provisionPaidInterviewCredit(request: APIRequestContext, token: string, nonce: string) {
  const order = await request.post(`${API}/commerce/orders`, {
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'idempotency-key': `ui-cb:${nonce}` },
    data: { productId: 'pack_10' },
  });
  expect(order.status()).toBe(200);
  const { orderId } = await order.json() as { orderId: string };
  const providerTxn = `ui-cb-${nonce}`;
  const sig = createHmac('sha256', process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret').update(`${orderId}:${providerTxn}:paid`).digest('hex');
  const paid = await request.post(`${API}/commerce/webhook/pay/${orderId}`, { data: { providerTxn, sig } });
  expect(paid.status()).toBe(200);
}

/**
 * 提交最后一题时，SSE 的报告终态与 textarea 卸载是两个独立 React commit。
 * E2E 必须等待「下一题可答」或「终态已展示」任一事件，不能把 textarea
 * 消失后的瞬间误判为产品失败。
 */
async function waitForTerminalOrAnswer(page: Page, timeout = 90_000): Promise<'terminal' | 'answer'> {
  const terminal = page.getByText(/面试完成 · 综合评分|报告暂不可用/);
  const answer = page.locator('textarea[placeholder^="打字作答"]');
  return Promise.race([
    terminal.waitFor({ state: 'visible', timeout }).then(() => 'terminal' as const),
    answer.waitFor({ state: 'visible', timeout }).then(() => 'answer' as const),
  ]);
}

test('C→B: real browser binds application to a new interview, completes it, and front-end finalizes it', async ({ page, browser, request }) => {
  // 这是一个 6 题的真实模型旅程：每题都包含 worker、模型评分和 SSE（服务器发送事件）回写。
  // 150 秒不足以覆盖已经实测的单轮真实语音延迟，导致“系统仍在正确收口”被误报为产品失败。
  // 此处只放宽旅程总预算；单服务延迟仍由 performance E2E（端到端）门独立量化，不能把该值当性能目标。
  test.setTimeout(420_000);
  const suffix = randomUUID();
  const candidateEmail = `e2e-bound-candidate-${suffix}@x.com`;
  const recruiterEmail = `e2e-bound-recruiter-${suffix}@x.com`;
  const jobTitle = `浏览器绑定岗位-${suffix.slice(0, 8)}`;

  // C 端：注册、同意隐私、上传已摄取简历（全为页面交互）。
  await signUp(page, candidateEmail, 'candidate');
  await page.goto('/resume');
  await page.getByRole('button', { name: /我已阅读并同意/ }).click();
  await page.fill('textarea[name="text"]', '后端工程师，熟悉 Redis 限流、幂等订单和可观测性。');
  await page.getByRole('button', { name: '上传简历', exact: true }).click();
  await expect(page.getByText(/状态:ingested/).first()).toBeVisible({ timeout: 20_000 });
  const candidateToken = await tokenOf(page.context());
  // 真实支付回调是本用例唯一非 UI 的环境准备：前端不提供「假装支付成功」入口。
  await provisionPaidInterviewCredit(request, candidateToken, suffix);

  // B 端：独立浏览器身份注册、建岗、邀请这个已注册的候选人。
  const recruiterContext = await browser.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100' });
  const recruiter = await recruiterContext.newPage();
  await signUp(recruiter, recruiterEmail, 'recruiter');
  await recruiter.fill('input[name="title"]', jobTitle);
  await recruiter.fill('input[name="competencies"]', '高并发, 幂等, 限流');
  await recruiter.getByRole('button', { name: '发布岗位' }).click();
  const jobLink = recruiter.getByRole('link', { name: new RegExp(jobTitle) });
  await expect(jobLink).toBeVisible({ timeout: 20_000 });
  await jobLink.click();
  await recruiter.getByRole('button', { name: '邀请候选人' }).click();
  await recruiter.fill('input[name="candidateEmail"]', candidateEmail);
  await recruiter.getByRole('button', { name: '发送邀请' }).click();
  await expect(recruiter.getByRole('status')).toContainText(/已邀请/, { timeout: 20_000 });

  // C 端：从真实「我的投递」选择简历并点击开始。URL 的 interviewId 是服务端持久化 binding 返回值。
  await page.goto('/jobs');
  await expect(page.getByRole('button', { name: '开始面试' })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: '开始面试' }).click();
  await page.waitForURL(/\/interview\/iv_[^?]+\?applicationId=app_/, { timeout: 30_000 });
  const url = new URL(page.url());
  const boundInterviewId = url.pathname.split('/').at(-1)!;
  const applicationId = url.searchParams.get('applicationId')!;
  expect(applicationId).toMatch(/^app_/);
  // 旁路读 API 只作验收：验证 UI 启动后数据库一对一 binding 已落到申请记录，不依赖 HTML 猜测。
  const applications = await request.get(`${API}/applications`, { headers: { authorization: `Bearer ${candidateToken}` } });
  expect(applications.status()).toBe(200);
  const app = (await applications.json() as { applications: Array<{ id: string; status: string; interview_id: string | null }> }).applications.find((x) => x.id === applicationId);
  expect(app).toEqual(expect.objectContaining({ status: 'in_progress', interview_id: boundInterviewId }));

  // 真 UI 逐题作答到终态。useInterviewStream 收到 report 终态后会自动 POST 同源 /api/applications/:id/finalize。
  const finalizeResponses: number[] = [];
  page.on('response', (res) => { if (res.url().includes(`/api/applications/${applicationId}/finalize`)) finalizeResponses.push(res.status()); });
  for (let turn = 0; turn < 12; turn++) {
    if (await waitForTerminalOrAnswer(page) === 'terminal') break;
    const answer = page.locator('textarea[placeholder^="打字作答"]');
    await answer.fill('我会用稳定幂等键约束写操作，配合 outbox、重试退避和指标告警确保最终一致。');
    await page.getByRole('button', { name: '提交', exact: true }).click();
    // 非最后一题等待当前编辑器卸载；最后一题则可能直接进入报告终态。
    await Promise.race([
      page.getByText(/面试完成 · 综合评分|报告暂不可用/).waitFor({ state: 'visible', timeout: 20_000 }),
      answer.waitFor({ state: 'hidden', timeout: 20_000 }),
    ]);
  }
  await expect(page.getByText(/面试完成 · 综合评分|报告暂不可用/)).toBeVisible({ timeout: 90_000 });
  await expect.poll(() => finalizeResponses.some((status) => status === 200), { timeout: 15_000 }).toBeTruthy();

  // B 端刷新后只见流程状态，不见候选人的逐题内容或数值分；校准 hold 下终态是待人工复核。
  await recruiter.reload();
  await expect(recruiter.getByText(/待人工复核|已完成/).first()).toBeVisible({ timeout: 20_000 });
  await expect(recruiter.getByText(/综合评分|我的回答|评分 \d+/)).toHaveCount(0);
  const reviewLink = recruiter.getByRole('link', { name: '查看复核' }).first();
  await expect(reviewLink).toBeVisible();
  await reviewLink.click();
  await expect(recruiter.getByRole('heading', { name: '申请复核' })).toBeVisible({ timeout: 20_000 });
  await expect(recruiter.getByText(/看不到面试内容/)).toBeVisible();
  await expect(recruiter.getByText(/综合评分|我的回答/)).toHaveCount(0);
  await recruiterContext.close();
});
