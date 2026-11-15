#!/usr/bin/env node
/**
 * A-12：postcss override 8.4.31→8.5.32 的 CSS/UI 回归（#246 P2）。
 * 不启 api/worker/Next 全栈，不加 MODEL_API_KEY，不进全栈 E2E。
 *
 * 臂：
 *  1. 根 pnpm.overrides.postcss 恰为 8.5.32；Next 与 @tailwindcss/postcss 解析到的 postcss 也是 8.5.32。
 *  2. 用 apps/web/postcss.config.mjs 同一插件链编译 app/globals.css（from=源文件，外置 map）必须成功。
 *  3. 产物含设计语言 token 与自定义规则（暖纸底、墨字、主色、衬线 H1、button 指针、vc-shimmer、accordion）。
 *  4. source map 不泄露绝对工作区 / 家目录路径。
 *  5. Playwright Chromium：静态夹具加载编译 CSS，断言 body/h1/button/disabled/vc-shimmer 计算样式。
 *     无浏览器且未设 POSTCSS_UI_REQUIRE_BROWSER=1 时跳过 UI 臂并打印 SKIP（CI 轻量）。
 *     本机有浏览器则 UI 臂必过。
 * 反证：去掉 --primary token 后编译断言红；还原后绿。UI 臂改坏 --background 后计算样式红。
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = join(repoRoot, 'apps/web');
const EXPECTED_POSTCSS = '8.5.32';
const globalsPath = join(webRoot, 'app/globals.css');
let failures = 0;
const A = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : ` — ${detail}`}`);
  if (!ok) failures += 1;
};

const requireFrom = (fromFile) => createRequire(fromFile);
const pkgVersion = (req, name) => {
  try {
    return req(`${name}/package.json`).version;
  } catch (err) {
    return null;
  }
};

const rootPkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const override = rootPkg?.pnpm?.overrides?.postcss;
A(`根 pnpm.overrides.postcss === ${EXPECTED_POSTCSS}`, override === EXPECTED_POSTCSS, String(override));

const twReal = realpathSync(join(webRoot, 'node_modules/@tailwindcss/postcss'));
const twReq = requireFrom(join(twReal, 'package.json'));
const twPostcssVer = pkgVersion(twReq, 'postcss');
A('@tailwindcss/postcss 解析 postcss 8.5.32', twPostcssVer === EXPECTED_POSTCSS, String(twPostcssVer));

const nextPath = realpathSync(join(webRoot, 'node_modules/next'));
const nextReq = requireFrom(join(nextPath, 'package.json'));
const nextPostcssVer = pkgVersion(nextReq, 'postcss');
A('next 解析 postcss 8.5.32', nextPostcssVer === EXPECTED_POSTCSS, String(nextPostcssVer));

const postcss = twReq('postcss');
const config = (await import(pathToFileURL(join(webRoot, 'postcss.config.mjs')).href)).default;
const pluginEntries = Object.entries(config.plugins ?? {});
A('postcss.config.mjs 使用 @tailwindcss/postcss', pluginEntries.some(([n]) => n === '@tailwindcss/postcss'));
const plugins = pluginEntries.map(([name, opts]) => twReq(name)(opts ?? {}));

const TOKENS = [
  '#FAF8F4',
  '#1A1A1A',
  '#B5651D',
  '#D89A57',
  '--radius',
  'vc-shimmer',
  'Source Han Serif',
  'cursor: pointer',
  'accordion-down',
  'not-allowed',
];

const compile = async (css, from) => postcss(plugins).process(css, { from, map: { inline: false } });
/** Tailwind v4 按 from 读盘，只改 process() 的 css 字符串不会改变产物。变异必须写到临时文件并把 from 指过去。 */
const mutPath = join(webRoot, 'app/.l7-postcss-mut.css');
const compileMutated = async (css) => {
  writeFileSync(mutPath, css);
  try {
    return await compile(css, mutPath);
  } finally {
    rmSync(mutPath, { force: true });
  }
};

const sourceCss = readFileSync(globalsPath, 'utf8');
let compiledCss = '';
try {
  const result = await compile(sourceCss, globalsPath);
  compiledCss = result.css;
  A('globals.css 经 postcss 8.5.32 编译成功', compiledCss.length > 1000, `bytes=${compiledCss.length}`);
  for (const tok of TOKENS) {
    A(`编译产物含 ${tok}`, compiledCss.includes(tok));
  }
  const mapStr = result.map ? result.map.toString() : '';
  A('source map 存在', mapStr.length > 0, `mapBytes=${mapStr.length}`);
  A('source map 不泄露 /workspace 绝对路径', !mapStr.includes('/workspace'));
  A('source map 不泄露 /home/ 绝对路径', !mapStr.includes('/home/'));
} catch (err) {
  A('globals.css 经 postcss 8.5.32 编译成功', false, String(err?.stack ?? err));
}

// 反证：只在输入上追加唯一 canary 规则时产物才出现该选择器；真实 globals.css 不得含它。
{
  const canary = '.l7-postcss-canary{outline-color:#CAFE12}';
  A('真实编译产物不含 canary 选择器', !compiledCss.includes('.l7-postcss-canary'));
  const withCanary = await compileMutated(`${sourceCss}\n${canary}\n`);
  A('反证：追加 canary 后产物含该选择器', withCanary.css.includes('.l7-postcss-canary'), 'canary 未进入产物');
  const restored = await compile(sourceCss, globalsPath);
  A('反证还原：不加 canary 再编译后产物再次不含该选择器', !restored.css.includes('.l7-postcss-canary'));
}

const rgbPaper = 'rgb(250, 248, 244)';
const rgbInk = 'rgb(26, 26, 26)';
const runUi = async (css, expectPaper) => {
  const dir = mkdtempSync(join(tmpdir(), 'l7-postcss-ui-'));
  const serverRef = { server: null, browser: null };
  try {
    writeFileSync(join(dir, 'app.css'), css);
    writeFileSync(join(dir, 'index.html'), `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><link rel="stylesheet" href="/app.css"></head>
<body>
  <h1>知面</h1>
  <button type="button">开始</button>
  <button type="button" disabled>禁用</button>
  <div class="vc-shimmer" id="shimmer">loading</div>
</body></html>`);
    const server = createServer((req, res) => {
      const urlPath = req.url === '/' ? '/index.html' : req.url;
      const file = join(dir, decodeURIComponent(String(urlPath).split('?')[0]));
      if (!file.startsWith(dir)) { res.statusCode = 403; return res.end(); }
      try {
        const body = readFileSync(file);
        res.setHeader('content-type', file.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
        res.end(body);
      } catch {
        res.statusCode = 404;
        res.end();
      }
    });
    serverRef.server = server;
    await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
    const { port } = server.address();
    const pwReq = requireFrom(join(webRoot, 'package.json'));
    const { chromium } = pwReq('@playwright/test');
    const browser = await chromium.launch({ headless: true });
    serverRef.browser = browser;
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
    return await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const h1 = getComputedStyle(document.querySelector('h1'));
      const btn = getComputedStyle(document.querySelector('button'));
      const disabled = getComputedStyle(document.querySelector('button[disabled]'));
      const shimmer = getComputedStyle(document.querySelector('#shimmer'));
      return {
        bg: body.backgroundColor,
        color: body.color,
        font: body.fontFamily,
        hFont: h1.fontFamily,
        hWeight: h1.fontWeight,
        hSpacing: h1.letterSpacing,
        cursor: btn.cursor,
        disabledCursor: disabled.cursor,
        shimmerName: shimmer.animationName,
      };
    });
  } finally {
    if (serverRef.browser) await serverRef.browser.close().catch(() => {});
    if (serverRef.server) await new Promise((r) => serverRef.server.close(r));
    rmSync(dir, { recursive: true, force: true });
  }
};

const browserRequired = process.env.POSTCSS_UI_REQUIRE_BROWSER === '1';
const pwBin = join(webRoot, 'node_modules/.bin/playwright');
let browserOk = false;
if (existsSync(pwBin)) {
  try {
    const pwReq = requireFrom(join(webRoot, 'package.json'));
    const { chromium } = pwReq('@playwright/test');
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    browserOk = true;
  } catch (err) {
    if (browserRequired) {
      A('Playwright Chromium 可启动（POSTCSS_UI_REQUIRE_BROWSER=1）', false, String(err));
    } else {
      console.log(`SKIP  UI 臂：Chromium 无法启动（${String(err).split('\n')[0]}）`);
    }
  }
} else if (browserRequired) {
  A('Playwright 已安装（POSTCSS_UI_REQUIRE_BROWSER=1）', false);
} else {
  console.log('SKIP  UI 臂：未找到 apps/web Playwright');
}

if (browserOk && compiledCss) {
  const styles = await runUi(compiledCss, true);
  A('UI body 背景为暖纸底 #FAF8F4', styles.bg === rgbPaper, styles.bg);
  A('UI body 文字为墨色 #1A1A1A', styles.color === rgbInk, styles.color);
  A('UI body 字体为思源黑体栈', styles.font.includes('Source Han Sans SC'), styles.font);
  A('UI h1 为思源宋体栈', styles.hFont.includes('Source Han Serif SC'), styles.hFont);
  A('UI h1 font-weight 700', styles.hWeight === '700', String(styles.hWeight));
  A('UI h1 letter-spacing 0.5px', styles.hSpacing === '0.5px', styles.hSpacing);
  A('UI button cursor=pointer', styles.cursor === 'pointer', styles.cursor);
  A('UI disabled button cursor=not-allowed', styles.disabledCursor === 'not-allowed', styles.disabledCursor);
  A('UI .vc-shimmer animationName=vc-shimmer', styles.shimmerName === 'vc-shimmer', styles.shimmerName);

  const badCss = compiledCss.replaceAll(rgbPaper, 'rgb(0, 0, 0)').replaceAll('#FAF8F4', '#000000');
  const bad = await runUi(badCss, false);
  A('反证：把暖纸底改成黑后 body 背景不再是 #FAF8F4', bad.bg !== rgbPaper, bad.bg);
  const restored = await runUi(compiledCss, true);
  A('反证还原：原编译 CSS 的 body 背景恢复暖纸底', restored.bg === rgbPaper, restored.bg);
}

if (failures > 0) {
  console.error(`postcss-css-regression: ${failures} FAIL`);
  process.exit(1);
}
console.log('postcss-css-regression: all PASS');
