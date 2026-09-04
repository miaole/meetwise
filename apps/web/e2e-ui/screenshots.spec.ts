import { test, expect, Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * 演示截图采集(**非断言测试**,只截图):驱动演示路径并把截图写入未跟踪临时目录。
 * 只用**演示数据**(假邮箱 demo@meetwise.app + 通用简历文本),绝不含任何真实 PII / 密钥 / 个人信息。
 * 由 scripts/capture-screenshots.mjs 起真栈(api+worker+web)后运行；假服务开关会使采集器失败。
 */

const DIR = '.tmp/demo-screenshots';
const DEMO_EMAIL = 'demo@meetwise.app';
const DEMO_PW = 'demopass123';
const RESUME = '资深后端工程师,5 年经验。主导高并发订单系统:Redis 令牌桶限流、分布式锁 Lua 原子释放、MySQL 分库分表、消息队列削峰填谷;主导服务可用性从 99.5% 提升到 99.95%。';

async function shot(page: Page, name: string) {
  await page.waitForTimeout(600);   // 让流式/字体稳定
  await page.screenshot({ path: `${DIR}/${name}.png`, fullPage: true });
}

async function auth(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', DEMO_EMAIL);
  await page.fill('input[name="password"]', DEMO_PW);
  // 先试注册;若邮箱已存在(重复跑),回退登录。二者都落到 /dashboard(Server Action 设 cookie + 跳转)。
  await page.click('button[name="mode"][value="signup"]');
  await page.waitForTimeout(1500);
  if (!/\/dashboard/.test(page.url())) {
    await page.goto('/login');
    await page.fill('input[name="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"]', DEMO_PW);
    await page.click('button[name="mode"][value="login"]');
    await page.waitForURL('**/dashboard', { timeout: 20_000 });
  }
}

test('capture demo screenshots (desktop)', async ({ page }) => {
  mkdirSync(DIR, { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1) 落地页(营销 hero)
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await shot(page, '01-landing');

  // 2) 登录/注册页
  await page.goto('/login');
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await shot(page, '02-login');

  // 3) 注册 → 仪表盘
  await auth(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  await shot(page, '03-dashboard');

  // 4) 简历页:先截 PIPL 同意门(隐私亮点),再授予同意 → 粘贴演示简历 → 上传 → 列表出现已摄取
  //  用 waitFor(带超时)而非瞬时 isVisible——RSC 流式渲染下瞬时判断会误判为不可见而漏截。
  await page.goto('/resume');
  const consentBtn = page.getByRole('button', { name: /我已阅读并同意/ });
  const hasConsentGate = await consentBtn.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
  if (hasConsentGate) {
    await shot(page, '04a-resume-consent');   // PIPL 同意门(上传前必须同意,原文加密、只提结构化事实)
    await consentBtn.click();
    await expect(page.locator('textarea[name="text"]')).toBeVisible({ timeout: 20_000 });   // 等 revalidate 出上传框
  }
  const ta = page.locator('textarea[name="text"]');
  if (await ta.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false)) {
    await ta.fill(RESUME);
    await page.getByRole('button', { name: '上传简历', exact: true }).click();
    await expect(page.getByText(/状态:ingested/).first()).toBeVisible({ timeout: 20_000 });
  }
  await shot(page, '04-resume');

  // 5) 面试列表
  await page.goto('/interviews');
  await shot(page, '05-interviews');

  // 6) 定价页(营销)
  await page.goto('/pricing');
  await shot(page, '06-pricing');

  // 7) 能力/特性页
  await page.goto('/features');
  await shot(page, '07-features');

  // 8) 成长曲线页
  await page.goto('/growth');
  await shot(page, '08-growth');
});

test('capture demo screenshots (mobile H5)', async ({ page }) => {
  mkdirSync(DIR, { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });   // iPhone 12/13 视口
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await shot(page, 'm1-landing-mobile');
  await auth(page);
  await shot(page, 'm2-dashboard-mobile');
});
