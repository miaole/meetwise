import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

/**
 * UC-E2E-003 · locale=en DOM prove (Playwright secondary layer).
 *
 * Cookie-only locale contract (i18n/request.ts reads the `locale` cookie; Accept-Language
 * wiring is a separate knife). The migrated zone — upload help span, OCR banner <p>,
 * error <p> — plus the empty-file validation arm must render CJK-free in locale=en.
 * The remaining page chrome is honest named-allowlist residual: every CJK text node found
 * on /resume must belong to a named unmigrated face, and the inventory is counted into the
 * run log as residual receipt. Full-page zh clearance is a later knife — matrix stays partial.
 *
 * Known DOM-unreachable arms (no API stub allowed): the mapResumeUploadError API-response
 * arm and the :88/:113 network-failure inline faces (their en side is carried by the S4
 * static assertions), and the >8MB arm (blocked by the Next Server Action bodySizeLimit
 * before the action body runs). The deleteResumeAction four failure arms are likewise
 * DOM-unreachable here (this spec's happy path never triggers a delete); after the
 * follow-up migration their en side is carried by the S6 static assertions over the
 * messages resumeDelete namespace. The :98/:99 local-refusal arms ARE reachable via
 * setInputFiles and may strengthen en-DOM assertions in a later knife.
 *
 * Grep anchor for dedicated prove CMD: UC003-I18N-locale-en
 */

const CJK = /[\u4e00-\u9fff]/;

// Named residual faces (zero-touch this knife): source-verbatim unmigrated chrome.
// Values are per-DOM-text-node strings (SSR splits JSX text/expression children with
// comment separators, so combined source lines surface as separate nodes).
const ALLOWED_CJK_FACES: Record<string, string[]> = {
  navHardcodedLabels: ['押题', '找工作', '岗位匹配'], // Nav.tsx candidate links (:39-41 literal zh)
  resumePageHeader: [
    '简历 · 知面',
    '用于练习的简历内容会经过当前已覆盖的存储与访问约束；只提取必要结构化事实，不编造经历。删除即时生效（立即停止处理与访问）；跨存储清除回执稍后在隐私边界说明中保持如实状态。',
    '← 返回首页',
  ],
  resumePageUploadCard: ['上传简历'],
  resumePagePersonalization: [
    '面试出题个性化：',
    '已同意（简历要点将发送给模型服务商用于出题）',
    '未同意（面试仅使用通用题库）',
    '撤回出题个性化',
  ],
  resumePageListChrome: [
    '我的简历',
    '还没有简历,粘贴上传。',
    '简历列表暂不可用。',
    '诊断',
    '重新解析',
    '启动中…',
    '解析中…',
  ],
  resumePageConsentGate: [
    '先同意隐私政策(PIPL)',
    '上传简历会处理个人信息。请阅读并同意后再上传——系统只用于练习所需的结构化提取，不编造经历。删除即时生效；跨存储清除回执异步完成。',
    '允许面试出题个性化：简历要点将发送给模型服务商用于出题（不勾选则面试仅使用通用题库，可随时撤回）。',
    '我已阅读并同意隐私政策(PIPL)',
    '记录中…',
    '同意后可启用简历上传；',
    '数据边界说明',
    '会标明当前可用范围与未开放流程。',
    '撤回中…',
  ],
  resumeUploadFormsLiterals: ['提取并上传', '或粘贴文本', '上传简历', '上传中…', '在此粘贴简历原文(至少 20 字)…'],
  deleteResumeButtonLiterals: [
    '删除',
    '删除后立即从你的账号中移除并停止一切处理；后台清除稍后完成（不影响你的使用与隐私隔离）。',
    '已受理：该简历已停止处理并从你的账号移除；后台清除稍后完成（不影响你的使用与隐私隔离）。',
    '删除中…',
    '确认删除',
    '取消',
  ],
  resumeStatusLabels: ['已上传', '解析中', '解析完成', '解析失败', '删除处理中', '已删除', '状态未知'],
  localeSwitcher: ['中'], // LocaleSwitcher.tsx zh toggle label (:10 literal; EN arm is CJK-free)
};

const ALLOWED_CJK = new Set(Object.values(ALLOWED_CJK_FACES).flat());

test('UC003-I18N-locale-en: locale=en DOM —— 迁移区三点 CJK 零残留 + 空文件臂错误码 en 断言 + 具名 allowlist 全页残留清点', async ({
  page,
}, testInfo) => {
  // ① locale=en cookie preset (cookie-only contract; no Accept-Language wiring this knife).
  await page.context().addCookies([{ name: 'locale', value: 'en', domain: '127.0.0.1', path: '/' }]);

  // ② golden-form signup → /resume (PIPL consent gate is unmigrated zh chrome).
  const suffix = randomUUID();
  const email = `e2e-uc003-i18n-${suffix}@x.com`;
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'strongpw123');
  await page.click('button[name="mode"][value="signup"]');
  await page.waitForURL('**/dashboard', { timeout: 30_000 });
  await page.goto('/resume');
  await page.getByRole('button', { name: /我已阅读并同意/ }).click();
  await page.waitForURL('**/resume?updated=consent', { timeout: 30_000 });

  // Migrated zone element-level pins (never a full-page scan masquerading as zone closure):
  // help span of the file-upload form must be CJK-free in locale=en.
  const fileForm = page.locator('form').filter({ has: page.locator('input[type="file"]') });
  const helpSpan = fileForm.locator('span').first();
  await expect(helpSpan).toBeVisible();
  const helpText = (await helpSpan.innerText()).trim();
  expect(helpText, 'help span must render copy').not.toBe('');
  expect(CJK.test(helpText), `help span must be CJK-free in locale=en, got: ${helpText}`).toBe(false);

  // OCR banner <p role="note"> is rendered only when the preview OCR gate is enabled in the
  // environment; when present it belongs to the migrated zone and must be CJK-free.
  const banner = page.locator('p[role="note"]');
  if ((await banner.count()) > 0) {
    const bannerText = (await banner.first().innerText()).trim();
    expect(CJK.test(bannerText), `banner must be CJK-free in locale=en, got: ${bannerText}`).toBe(false);
  }

  // ③ empty-file arm (single-arm trigger): a 0-byte file passes the HTML `required`
  // constraint (a chosen file, no size check) and the submit chain has no client-side
  // size/empty pre-validation, so actions.ts `file.size === 0` is DOM-reachable and its
  // message lands in #resume-upload-error (role=alert) — asserted en (A2 DOM face).
  await fileForm.locator('input[type="file"]').setInputFiles({
    name: 'empty.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.alloc(0),
  });
  await page.getByRole('button', { name: '提取并上传', exact: true }).click();
  const errorP = page.locator('#resume-upload-error');
  await expect(errorP).toBeVisible({ timeout: 30_000 });
  const errorText = (await errorP.innerText()).trim();
  expect(CJK.test(errorText), `empty-file arm error must be CJK-free in locale=en, got: ${errorText}`).toBe(false);
  expect(errorText).toContain('Please choose a file to upload');

  // ④ /login en rendering smoke over the existing messages namespace face.
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Sign up' }).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Log in / Sign up').first()).toBeVisible();

  // ⑤ full-page residual honesty: every CJK text node left on /resume must belong to a
  // named unmigrated face; the inventory is counted into the run log (residual receipt).
  await page.goto('/resume');
  await expect(page.getByRole('heading', { name: '我的简历' })).toBeVisible({ timeout: 20_000 });
  const textNodes = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const out: string[] = [];
    while (walker.nextNode()) {
      const t = (walker.currentNode.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (t) out.push(t);
    }
    return out;
  });
  const cjkHits = [...new Set(textNodes.filter((t) => CJK.test(t)))].sort();
  const unknown = cjkHits.filter((t) => !ALLOWED_CJK.has(t));
  const inventory = [
    `UC003-I18N locale=en /resume CJK residual inventory: ${cjkHits.length} distinct text node(s)`,
    ...cjkHits.map((t) => `  [${ALLOWED_CJK.has(t) ? 'allowlisted' : 'UNKNOWN'}] ${t}`),
  ].join('\n');
  console.log(inventory);
  await testInfo.attach('uc003-i18n-locale-residual-inventory.txt', { body: inventory, contentType: 'text/plain' });
  expect(unknown, `unallowlisted zh residual on /resume in locale=en:\n${unknown.join('\n')}`).toEqual([]);
});
