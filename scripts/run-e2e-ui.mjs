/**
 * 真浏览器 E2E 自启动 runner:起真栈(api 8787 + worker + web 3100,production `next start`)→ 等就绪 →
 * 跑 Playwright(headless chromium + iPhone 13 两端)驱动真实 UI → 拆栈。
 * 这是 HTTP 层 e2e(run-e2e.mjs)之外的浏览器证据:cookie 鉴权 / middleware 在真实浏览器里端到端跑通。
 * 用法:pnpm e2e:ui(需 docker DB 在跑;web 需已 `pnpm -C apps/web build` 出 .next——本脚本不重新构建,构建太慢)。
 */
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const env = { ...process.env, AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-dev-secret-key', PAY_PROVIDER_SECRET: process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret', PORT: '8787' };
// 加载 .env(RESUME 加密键 + 模型),不覆盖已设
if (existsSync(ROOT + '.env')) {
  for (const line of readFileSync(ROOT + '.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const procs = [];
const spawnProc = (name, cmd, args, cwd = ROOT, extraEnv = {}) => {
  const p = spawn(cmd, args, { cwd, env: { ...env, ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', (d) => process.env.E2E_VERBOSE && process.stdout.write(`[${name}] ${d}`));
  p.stderr.on('data', (d) => process.env.E2E_VERBOSE && process.stderr.write(`[${name}] ${d}`));
  procs.push(p);
  return p;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cleanup = () => { for (const p of procs) { try { p.kill('SIGKILL'); } catch {} } };
process.on('exit', cleanup); process.on('SIGINT', () => { cleanup(); process.exit(1); });

const waitFor = async (url, label, tries = 60) => {
  for (let i = 0; i < tries; i++) {
    await sleep(1000);
    try { const r = await fetch(url); if (r.ok || r.status === 307 || r.status === 308) return true; } catch {}
  }
  console.error(`E2E-UI: ${label} 未就绪 (${url})`); return false;
};

const REG = '@swc-node/register/esm-register';
const NEXT_BIN = ROOT + 'apps/web/node_modules/next/dist/bin/next';
async function main() {
  console.log('E2E-UI: 启 api + worker…');
  spawnProc('api', 'node', ['--import', REG, 'src/main.ts'], ROOT + 'apps/api');
  spawnProc('worker', 'node', ['--import', REG, 'src/main.ts'], ROOT + 'apps/worker', { WORKER_BOOTSTRAP: '1' });
  if (!(await waitFor('http://127.0.0.1:8787/health', 'api', 40))) { cleanup(); process.exit(1); }
  await sleep(3000);   // 给 worker 跑完迁移 + 消费循环就绪

  console.log('E2E-UI: 启 web(production next start, :3100)…');
  // 假设 .next 已构建(构建太慢,不在此重建)。next start 直接服务 .next + 静态资源。
  spawnProc('web', 'node', [NEXT_BIN, 'start', '-p', '3100'], ROOT + 'apps/web', {
    PORT: '3100',
    API_BASE_INTERNAL: 'http://127.0.0.1:8787',
    NEXT_PUBLIC_API_BASE: 'http://127.0.0.1:8787',
  });
  if (!(await waitFor('http://127.0.0.1:3100/', 'web', 60))) { cleanup(); process.exit(1); }

  console.log('E2E-UI: 跑 Playwright 浏览器用例…');
  const pw = spawnProc('playwright', 'corepack', ['pnpm', '-C', 'apps/web', 'exec', 'playwright', 'test'], ROOT);
  pw.stdout.on('data', (d) => process.stdout.write(d));
  pw.stderr.on('data', (d) => process.stderr.write(d));
  const code = await new Promise((res) => pw.on('exit', res));
  cleanup();
  process.exit(code ?? 1);
}
main().catch((e) => { console.error(e); cleanup(); process.exit(1); });
