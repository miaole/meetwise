import { defineConfig, devices } from '@playwright/test';

/**
 * 真浏览器 E2E(headless chromium):驱动真实 UI(非 HTTP 层)。
 * 栈由外部 runner(scripts/run-e2e-ui.mjs)启动:api + worker + web(production next start)。
 * 不在此配 webServer——避免重复启栈/构建。
 */
export default defineConfig({
  testDir: './e2e-ui',
  // C→B 真实浏览器链路会让 deterministic worker 走完整岗位会话；不是页面卡顿，单用例上限相应放宽。
  timeout: 150_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  // 这里的两套项目会共用同一个真实 API、worker 和数据库；C→B 用例本身还会创建第二个 browser context。
  // 将它们串行化，避免「两个端到端业务旅程抢同一测试基础设施」掩盖真正的前端回归。
  // 服务端真实并发由 performance.e2e.ts 的独立 HTTP 门量化覆盖，不能靠浏览器用例并发数冒充压测。
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100',
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
