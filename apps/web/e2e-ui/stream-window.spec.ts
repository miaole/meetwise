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
  await expect(page.getByText(/面试完成 · 综合评分/)).toBeVisible();
  // A deliberately broad ceiling catches a regression to per-event O(n²) work without pretending to be a device
  // or production SLO. The exact elapsed time is emitted by Playwright's report rather than hidden in the test.
  expect(Date.now() - started).toBeLessThan(15_000);
});
