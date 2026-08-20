import { test, expect } from '@playwright/test';

/**
 * 公网入口冒烟（不创建账号、不写业务数据）。
 *
 * 运行：
 *   ONLINE_BASE_URL=https://... pnpm -C apps/web exec playwright test e2e-ui/online-public.spec.ts --project=chromium
 *
 * 这个用例与本地真栈 golden path 分开：它只验证面试官从公网进入时，
 * 首页、登录页和鉴权重定向没有回到 localhost/内部错误页。
 */
const onlineBaseUrl = process.env.ONLINE_BASE_URL?.replace(/\/+$/, '');

test.describe('online public ingress', () => {
  test.skip(!onlineBaseUrl, 'set ONLINE_BASE_URL to run the ECS/public smoke');
  test.setTimeout(60_000);

  test.use({ baseURL: onlineBaseUrl });

  test('public landing and login are reachable', async ({ request }) => {
    // The App Router keeps the RSC stream open while loading client boundaries;
    // assert the server-rendered public copy through the real HTTPS response.
    // The second test below verifies the actual browser redirect + login UI.
    const home = await request.get(new URL('/', onlineBaseUrl).toString(), { timeout: 20_000 });
    expect(home.status(), 'public home HTTP status').toBe(200);
    expect(await home.text()).toMatch(/知面 Meetwise/);

    const login = await request.get(new URL('/login', onlineBaseUrl).toString(), { timeout: 20_000 });
    expect(login.status(), 'public login HTTP status').toBe(200);
    expect(await login.text()).toMatch(/name="email"/);
    expect(await login.text()).toMatch(/name="password"/);
  });

  test('protected route redirects to same public origin without localhost', async ({ browser, request }) => {
    const ingress = await request.get(new URL('/dashboard', onlineBaseUrl).toString(), { maxRedirects: 0, timeout: 20_000 });
    expect(ingress.status(), 'protected route HTTP status').toBe(307);
    const location = ingress.headers().location;
    expect(location).toBe(`${onlineBaseUrl}/login?next=%2Fdashboard`);
    expect(location).not.toContain('localhost');

    const context = await browser.newContext({ baseURL: onlineBaseUrl });
    const page = await context.newPage();
    const nav = page.goto('/dashboard', { waitUntil: 'commit', timeout: 8_000 }).catch(() => undefined);
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/, { timeout: 20_000 });
    expect(page.url()).not.toContain('localhost');
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 20_000 });
    await nav;
    await context.close();
  });
});
