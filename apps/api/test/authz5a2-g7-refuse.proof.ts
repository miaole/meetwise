/**
 * authz5a2-g7-refuse.proof.ts — AUTHZ-HARDEN 5A-2 #168 G7 生产拒启证明(子进程环境注入探针·零外呼)。
 *
 * 探针形(R2):真组合根作为子进程启动(spawn node --import @swc-node/register/esm-register src/main.ts)，
 * 环境矩阵三臂×两组合根(api/worker)：
 *   ①NODE_ENV=production + G7_FREETIER_REPROVE=1 → 进程**非零退出**且输出含 refusal 标记
 *     'refusing_to_start'（先于任何动态 import/端口绑定·fail-closed 拒启兑现）；
 *   ②NODE_ENV=production + 开关缺省 → 无 refusal 标记（门只对 env=1 触发·生产正常路径不被误杀；
 *     进程随后因测试环境缺关键 env 自行退出≠拒启）；
 *   ③非 production(缺省 NODE_ENV) + G7_FREETIER_REPROVE=1 → 无 refusal 标记（非生产放行·GODFN-1b
 *     语义保持）。
 * 构建上下文排除清单断言(§2-5·修法列「镜像排除 test/」)：.dockerignore 含双星 test 排除行(所有层级
 * test 目录不进镜像) + 两 Dockerfile context=仓库根(COPY . . 前置)→ 单一 .dockerignore 即共同权威。
 * est live=0:子进程本地 spawn·拒绝臂先于任何外呼退出;放行臂无 G7 图执行零 outbound。
 *   运行:pnpm -C apps/api authz5a2:g7-refuse
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..');

let total = 0, failures = 0;
const A = (name: string, cond: boolean) => { total++; if (!cond) { failures++; console.log(`FAIL  ${name}`); } else console.log(`PASS  ${name}`); };

const REFUSAL = 'refusing_to_start';
const GRACE_MS = 60_000;
const IDLE_MS = 8_000;

/** 跑一个组合根子进程:收集 stdout+stderr,至退出或超时(超时则 kill·armed=false 观察臂用)。 */
function runRoot(cwd: string, rel: string, env: Record<string, string | undefined>, mode: 'await-exit' | 'observe'): Promise<{ code: number | null; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', rel], {
      cwd,
      env: { ...process.env, ...env, PORT: '0' },   // PORT=0:放行臂若真起 http 也用临时口·零抢占
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (d) => { output += String(d); });
    child.stderr.on('data', (d) => { output += String(d); });
    let settled = false;
    const done = (code: number | null) => {
      if (settled) return;
      settled = true;
      resolve({ code, output });
    };
    child.on('exit', (code) => done(code));
    child.on('error', (e) => { output += String(e); done(-1); });
    if (mode === 'observe') {
      setTimeout(() => {
        if (!settled) { child.kill('SIGKILL'); done(null); }   // null=存活至观察窗结束(未拒启)
      }, IDLE_MS);
    } else {
      setTimeout(() => { if (!settled) { child.kill('SIGKILL'); done(null); } }, GRACE_MS);
    }
  });
}

async function main() {
  const apiDir = join(repoRoot, 'apps', 'api');
  const workerDir = join(repoRoot, 'apps', 'worker');

  // ── 臂①:production + env=1 → 拒启(非零退出 + refusal 标记)──
  for (const [name, cwd, rel] of [['api', apiDir, 'src/main.ts'], ['worker', workerDir, 'src/main.ts']] as const) {
    const r = await runRoot(cwd, rel, { NODE_ENV: 'production', G7_FREETIER_REPROVE: '1' }, 'await-exit');
    A(`#168 臂① ${name}: production+env=1 → 非零退出(实际 code=${r.code})`, r.code !== null && r.code !== 0);
    A(`#168 臂① ${name}: 输出含 refusing_to_start 拒启标记`, r.output.includes(REFUSAL));
    A(`#168 臂① ${name}: 拒启先于 g7-test-support 动态装载(无 interceptor 安装迹象)`, !r.output.includes('installG7OutboundInterceptor'));
  }

  // ── 臂②:production + 开关缺省 → 不拒启(生产正常路径不被误杀)──
  for (const [name, cwd, rel] of [['api', apiDir, 'src/main.ts'], ['worker', workerDir, 'src/main.ts']] as const) {
    const env: Record<string, string | undefined> = { NODE_ENV: 'production', G7_FREETIER_REPROVE: undefined };
    const r = await runRoot(cwd, rel, env, 'observe');
    A(`#168 臂② ${name}: production+开关缺省 → 无拒启标记(实际 ${r.code === null ? '存活至观察窗' : `exit=${r.code}`})`, !r.output.includes(REFUSAL));
  }

  // ── 臂③:非 production + env=1 → 放行(无拒启标记·GODFN-1b 语义保持)──
  for (const [name, cwd, rel] of [['api', apiDir, 'src/main.ts'], ['worker', workerDir, 'src/main.ts']] as const) {
    const env: Record<string, string | undefined> = { NODE_ENV: undefined, G7_FREETIER_REPROVE: '1' };
    const r = await runRoot(cwd, rel, env, 'observe');
    A(`#168 臂③ ${name}: 非生产+env=1 → 无拒启标记(放行·实际 ${r.code === null ? '存活至观察窗' : `exit=${r.code}`})`, !r.output.includes(REFUSAL));
  }

  // ── 构建上下文排除清单断言(修法列「镜像排除 test/」·§2-5)──
  const dockerignore = readFileSync(join(repoRoot, '.dockerignore'), 'utf8');
  A('构建清单: .dockerignore 含 **/test 排除(测试支撑/证明面不进镜像)', dockerignore.includes('**/test'));
  A('构建清单: .dockerignore 注明 #168 修法出处', dockerignore.includes('#168'));
  const rootDockerfile = readFileSync(join(repoRoot, 'Dockerfile'), 'utf8');
  const webDockerfile = readFileSync(join(repoRoot, 'apps', 'web', 'Dockerfile'), 'utf8');
  A('构建清单: root Dockerfile 与 web Dockerfile 均 COPY . .(context=仓库根→.dockerignore 为共同权威)',
    rootDockerfile.includes('COPY . .') && webDockerfile.includes('COPY . .'));

  console.log(`\n${failures === 0 ? '✓' : '✗'} authz5a2:g7-refuse — ${total} 断言, 失败 ${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
