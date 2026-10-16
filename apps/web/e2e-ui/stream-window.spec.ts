import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

/**
 * Real browser pressure proof: a guard-only, synthetic SSE source emits 10k durable question events. The screen
 * must retain all reducer state yet materialize only the newest fixed DOM window; this catches both O(n²) reducer
 * copies and accidental unbounded React trees. It is not a production throughput/latency certification.
 */
test('10k SSE replay with exact redelivery keeps a unique 80-turn DOM window and reaches a terminal view', async ({ page }) => {
  test.setTimeout(30_000);
  const started = Date.now();
  await page.goto('/login');
  await page.fill('input[name="email"]', `e2e-stream-stress-${randomUUID()}@x.com`);
  await page.fill('input[name="password"]', 'strongpw123');
  await page.getByRole('button', { name: /注册|Sign up/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });

  await page.goto('/interview/__e2e_stream_stress__?duplicateFrames=1');
  const window = page.getByTestId('history-window');
  await expect(window).toContainText('显示第 9921–10000 轮 / 共 10000 轮', { timeout: 15_000 });
  await expect(page.getByTestId('interview-turn')).toHaveCount(80);
  const questions = await page.getByTestId('interview-turn').evaluateAll((nodes) => nodes.map((node) => node.textContent?.match(/压力回放题 \d+/)?.[0] ?? ''));
  expect(questions).toHaveLength(80);
  expect(new Set(questions).size).toBe(80);
  expect(questions).toEqual(Array.from({ length: 80 }, (_, i) => `压力回放题 ${9921 + i}`));
  await expect(page.getByText(/练习完成 · 本次练习反馈/)).toBeVisible();
  // A deliberately broad ceiling catches a regression to per-event O(n²) work without pretending to be a device
  // or production SLO. The exact elapsed time is emitted by Playwright's report rather than hidden in the test.
  expect(Date.now() - started).toBeLessThan(15_000);
});

/**
 * G3 BEGIN-GUARD #161/#256（REQUEST §3 C8/R3：浏览器断言落槽=本 spec·STRESS 源属主）。
 * 注入源=events/route.ts STRESS 门内 e2e-guard-only 变体 id（__e2e_stream_progress__/__e2e_stream_silent__），
 * 走真实同源 SSE 代理→BusinessEvent 判别→interview-state reducer→面板 DOM 全管线（非 page.route mock）。
 */
async function registerAndGo(page: import('@playwright/test').Page, stressId: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', `e2e-stream-g3-${randomUUID()}@x.com`);
  await page.fill('input[name="password"]', 'strongpw123');
  await page.getByRole('button', { name: /注册|Sign up/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
  await page.goto(`/interview/${stressId}`);
}

test('progress variant: connecting renders real generation progress, question_ready clears it and shows the planned-turn badge', async ({ page }) => {
  test.setTimeout(30_000);
  await registerAndGo(page, '__e2e_stream_progress__');
  // W3 臂1：connecting 期 progress 帧（retrieve/已 3 秒）→ 静态文案拼真实进度（段名+时长；R-B 零思考原文）。
  await expect(page.getByText('正在建立连接…（AI 生成中 · 检索素材 · 已 3 秒）')).toBeVisible();
  // W3 臂2：question_ready 到达 → 进度文案消失、题面渲染。
  await expect(page.getByText('进度预演题：讲一个你主导的线上事故复盘。')).toBeVisible();
  await expect(page.getByText(/正在建立连接/)).toHaveCount(0);
  // W4 形制 A：徽标=「第 1 题 / 预计约 5 题（自适应，可能调整）」（turn=0 → 1 基第 1 题；约数+可调注记）。
  await expect(page.getByTestId('interview-progress-badge')).toHaveText('第 1 题 / 预计约 5 题（自适应，可能调整）');
  // 拍3：终态收口（复用既有 report_ready 渲染）。
  await expect(page.getByText(/练习完成 · 本次练习反馈/)).toBeVisible();
});

test('silent variant: zero progress frames keep the static connecting copy verbatim; missing plannedTurns degrades to 第 N 题 only', async ({ page }) => {
  test.setTimeout(30_000);
  await registerAndGo(page, '__e2e_stream_silent__');
  // W3 臂3：零进度帧 → 静态文案逐字兜底（不空转不编造、无括号进度尾）。
  await expect(page.getByText('正在建立连接…', { exact: true })).toBeVisible();
  // W4 降级臂：question_ready 无 plannedTurns → 只显「第 N 题」。
  await expect(page.getByText('静默连接题：零进度帧时连接文案保持静态兜底。')).toBeVisible();
  await expect(page.getByTestId('interview-progress-badge')).toHaveText('第 1 题');
  await expect(page.getByText(/练习完成 · 本次练习反馈/)).toBeVisible();
});
