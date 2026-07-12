import { defineConfig, devices } from '@playwright/test';

/**
 * 真浏览器 E2E(headless chromium):驱动真实 UI(非 HTTP 层)。
 * 栈由外部 runner(scripts/run-e2e-ui.mjs)启动:api(8787)+ worker + web(production next start, 3100)。
 * 不在此配 webServer——避免重复启栈/构建。
 */
export default defineConfig({
  testDir: './e2e-ui',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // 第二端:H5 响应式(Pixel 5 视口/chromium)——验证移动端同样跑通登录→鉴权。
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
