import { test, expect } from '@playwright/test';

/**
 * 真浏览器黄金路径:落地页 → 注册(Server Action 设 httpOnly cookie + 服务端跳转)→ 受保护页可达。
 * 这是 HTTP 层 e2e 之外的另一证据:cookie 鉴权在「真实浏览器」里端到端跑通,middleware 真拦截未登录。
 * 每次运行用唯一邮箱注册,避免与历史账户冲突。
 */

test('golden path: landing → signup → cookie auth lets protected pages render in the real browser', async ({ page }) => {
  // 1) 落地页:hero 含「知面 / Meetwise」,且有登录入口
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/知面|Meetwise/);
  // 登录入口(hero 按钮或导航):用 href 锚定,避免文案差异
  await expect(page.locator('a[href="/login"]').first()).toBeVisible();

  // 2) 进登录页,注册(唯一邮箱)
  await page.goto('/login');
  const email = `e2e-ui-${Date.now()}@x.com`;
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'strongpw123');
  // 注册按钮:Server Action 设 mw_token cookie 并服务端 redirect 到 /dashboard
  await page.click('button[name="mode"][value="signup"]');

  // 3) 断言已落到 /dashboard(服务端跳转)且渲染仪表盘内容(Suspense 流式补上的主标题)
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: /继续打磨你的面试表现/ })).toBeVisible({ timeout: 20_000 });

  // 4) 经导航访问 /resume 与 /interviews:各自渲染标题,且不被踢回 /login(证明浏览器里 cookie 鉴权生效)
  // 用 exact 锚定导航链接(避免命中页内「管理简历 →」「查看面试 →」等含同字按钮)
  await page.getByRole('link', { name: '简历', exact: true }).click();
  await page.waitForURL('**/resume', { timeout: 20_000 });
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.getByRole('heading', { name: /简历/ }).first()).toBeVisible();

  await page.getByRole('link', { name: '面试', exact: true }).click();
  await page.waitForURL('**/interviews', { timeout: 20_000 });
  await expect(page).toHaveURL(/\/interviews$/);
  await expect(page.getByRole('heading', { name: /面试/ }).first()).toBeVisible();
});

test('protected page in a fresh (no-cookie) context redirects to /login (middleware works)', async ({ browser }) => {
  // 全新 context:没有任何 cookie
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/dashboard');
  // middleware 在请求到达页面前就重定向到 /login(带 next 回跳参数)
  await page.waitForURL('**/login**', { timeout: 20_000 });
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await context.close();
});
