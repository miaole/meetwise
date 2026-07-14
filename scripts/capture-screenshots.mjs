/**
 * README 截图采集 runner:起真栈(api 8787 + worker + web 3100,production `next start`,E2E_FAKE_MODEL=1
 * 使图执行确定性/秒级)→ 等就绪 → 只跑 screenshots.spec.ts(chromium)→ 拆栈。
 * 用法:node scripts/capture-screenshots.mjs(需 docker DB 在跑;web 需已 build 出 .next)。截图落 docs/screenshots/。
 * 只用演示数据(假邮箱 + 通用简历文本),不含任何真实 PII/密钥。
 */
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const env = {
  ...process.env,
  AUTH_SECRET: process.env.AUTH_SECRET ?? 'shots-dev-secret-key',
  PAY_PROVIDER_SECRET: process.env.PAY_PROVIDER_SECRET ?? 'shots-pay-secret',
  RESUME_ENC_KEY: process.env.RESUME_ENC_KEY ?? 'shots-resume-enc-key',
  RESUME_HASH_SECRET: process.env.RESUME_HASH_SECRET ?? 'shots-resume-hash-secret',
  E2E_FAKE_MODEL: '1', OCR_FAKE: '1', VOICE_FAKE: '1',
  PORT: '8787',
};
if (existsSync(ROOT + '.env')) {
  for (const line of readFileSync(ROOT + '.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const procs = [];
const spawnProc = (name, cmd, args, cwd = ROOT, extraEnv = {}) => {
  const p = spawn(cmd, args, { cwd, env: { ...env, ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', (d) => process.env.VERBOSE && process.stdout.write(`[${name}] ${d}`));
  p.stderr.on('data', (d) => process.env.VERBOSE && process.stderr.write(`[${name}] ${d}`));
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
  console.error(`SHOTS: ${label} 未就绪 (${url})`); return false;
};

async function resetDemoUser() {
  const { createRequire } = await import('node:module');
  const req = createRequire(ROOT + 'packages/db/package.json');   // 从 db 包处解析 pg(pnpm 不 hoist 到 root)
  const pg = req('pg');
  const pool = new pg.Pool({
    host: env.PGHOST ?? '127.0.0.1', port: Number(env.PGPORT ?? 54329),
    user: env.PGUSER ?? 'meetwise', password: env.PGPASSWORD ?? 'meetwise_dev_password', database: env.PGDATABASE ?? 'meetwise',
  });
  try {
    const u = await pool.query("SELECT id FROM user_account WHERE email='demo@meetwise.app'");
    if (u.rowCount) {
      const id = u.rows[0].id;
      const cols = await pool.query("SELECT table_name FROM information_schema.columns WHERE column_name='owner_user_id' AND table_schema='public'");
      for (const r of cols.rows) { try { await pool.query(`DELETE FROM ${r.table_name} WHERE owner_user_id=$1`, [id]); } catch {} }
      await pool.query('DELETE FROM user_account WHERE id=$1', [id]);
      console.log('SHOTS: 重置演示用户', id);
    }
  } catch (e) { console.log('SHOTS: 重置演示用户跳过', e.message); } finally { await pool.end(); }
}

const REG = '@swc-node/register/esm-register';
const NEXT_BIN = ROOT + 'apps/web/node_modules/next/dist/bin/next';
async function main() {
  console.log('SHOTS: 启 api + worker(fake model)…');
  spawnProc('api', 'node', ['--import', REG, 'src/main.ts'], ROOT + 'apps/api');
  spawnProc('worker', 'node', ['--import', REG, 'src/main.ts'], ROOT + 'apps/worker', { WORKER_BOOTSTRAP: '1' });
  if (!(await waitFor('http://127.0.0.1:8787/health', 'api', 40))) { cleanup(); process.exit(1); }
  await sleep(3000);

  // 重置演示用户 demo@meetwise.app(可复现:每次采集都从干净态起——同意门 + 上传态都能稳定截到)。
  await resetDemoUser();

  console.log('SHOTS: 启 web(:3100)…');
  spawnProc('web', 'node', [NEXT_BIN, 'start', '-p', '3100'], ROOT + 'apps/web', {
    PORT: '3100', API_BASE_INTERNAL: 'http://127.0.0.1:8787', NEXT_PUBLIC_API_BASE: 'http://127.0.0.1:8787',
  });
  if (!(await waitFor('http://127.0.0.1:3100/', 'web', 60))) { cleanup(); process.exit(1); }

  console.log('SHOTS: 跑 Playwright 截图用例…');
  const pw = spawnProc('pw', 'corepack', ['pnpm', '-C', 'apps/web', 'exec', 'playwright', 'test', 'screenshots.spec.ts', '--project=chromium'], ROOT);
  pw.stdout.on('data', (d) => process.stdout.write(d));
  pw.stderr.on('data', (d) => process.stderr.write(d));
  const code = await new Promise((res) => pw.on('exit', res));
  cleanup();
  console.log(code === 0 ? 'SHOTS: 完成 → docs/screenshots/' : 'SHOTS: 失败');
  process.exit(code ?? 1);
}
main().catch((e) => { console.error(e); cleanup(); process.exit(1); });
