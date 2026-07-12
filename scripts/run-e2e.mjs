/**
 * E2E 自启动 runner(你要的"做完自己跑 E2E"):起真栈(api + worker,DB 需已 up)→ 等就绪 → 跑 e2e/full.e2e.ts → 拆栈。
 * 全栈真跑:真 Bearer 鉴权 + 真 commerce(下单+HMAC webhook)+ 真简历 + 真 worker 图执行 + 真报告。
 * 用法:pnpm e2e:prove(需 docker DB 在跑;无模型 key 也跑——优雅降级到 fallback 题 + report_unavailable,仍到终态)。
 */
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
// 测试默认密钥:CI 无 .env 也能起(简历加密/去重键)。外部已设则不覆盖。e2e 每次重建 schema,不需跨运行解密,用测试键安全。
const env = { ...process.env, AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-dev-secret-key', PAY_PROVIDER_SECRET: process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret', RESUME_ENC_KEY: process.env.RESUME_ENC_KEY ?? 'e2e-resume-enc-key', RESUME_HASH_SECRET: process.env.RESUME_HASH_SECRET ?? 'e2e-resume-hash-secret', PORT: '8787' };
// 加载 .env(RESUME 加密键 + 模型),不覆盖已设
if (existsSync(ROOT + '.env')) {
  for (const line of readFileSync(ROOT + '.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const procs = [];
const run = (name, args, cwd = ROOT, extraEnv = {}) => {
  const p = spawn('node', args, { cwd, env: { ...env, ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', (d) => process.env.E2E_VERBOSE && process.stdout.write(`[${name}] ${d}`));
  p.stderr.on('data', (d) => process.env.E2E_VERBOSE && process.stderr.write(`[${name}] ${d}`));
  procs.push(p);
  return p;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cleanup = () => { for (const p of procs) { try { p.kill('SIGKILL'); } catch {} } };
process.on('exit', cleanup); process.on('SIGINT', () => { cleanup(); process.exit(1); });

const REG = '@swc-node/register/esm-register';
async function main() {
  console.log('E2E: 启 api + worker…');
  // 从各自 app 目录跑(cwd=apps/api 才能解析 @swc-node/register;同 pnpm -C apps/api serve)。
  // OCR_FAKE=1 → api 的 vision 客户端注入确定性 scripted(不依赖真 qwen-vl key),让 /resume/file 图片 OCR 走全栈可测。
  run('api', ['--import', REG, 'src/main.ts'], ROOT + 'apps/api', { OCR_FAKE: '1', OCR_FAKE_TEXT: '工作经历\n负责订单系统限流改造,用 Redis 计数器扛高并发\n技能\nRedis、限流、Kubernetes\n联系电话 13800138000' });
  // **hermetic 集成门**:e2e 证接线正确性(auth→交易→简历→队列→图→事件→报告→多租户),非真模型质量/延迟。
  //  E2E_FAKE_MODEL=1 → worker 用确定性 scripted 快模型(秒级跑到 report_ready golden path);WEB_ALLOWLIST='' → 关真 web 外呼(去外部延迟)。
  //  真模型 + 真检索的 live 冒烟归 flow:live / model:smoke,不混进确定性门(否则 qwen ~20s/次偶发超时会假红)。
  run('worker', ['--import', REG, 'src/main.ts'], ROOT + 'apps/worker', { WORKER_BOOTSTRAP: '1', E2E_FAKE_MODEL: '1', WEB_ALLOWLIST: '' });

  // 等 api 健康
  let up = false;
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    try { const r = await fetch('http://127.0.0.1:8787/health'); if (r.ok) { up = true; break; } } catch {}
  }
  if (!up) { console.error('E2E: api 未就绪'); cleanup(); process.exit(1); }
  await sleep(3000);   // 给 worker 跑完迁移 + 消费循环就绪

  console.log('E2E: 跑全栈用例…');
  const tsx = run('e2e', [ROOT + 'node_modules/tsx/dist/cli.mjs', 'e2e/full.e2e.ts'], ROOT, { E2E_TAG: 'ci' + Math.floor(process.hrtime()[1] / 1000) });
  tsx.stdout.on('data', (d) => process.stdout.write(d));
  tsx.stderr.on('data', (d) => process.stderr.write(d));
  const code = await new Promise((res) => tsx.on('exit', res));
  cleanup();
  process.exit(code ?? 1);
}
main().catch((e) => { console.error(e); cleanup(); process.exit(1); });
