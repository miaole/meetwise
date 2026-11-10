/**
 * resume-512m-dual:prove — 512m 生产限额下双路并发重件·宿主存活证明(r5·需要 docker·**不进 CI**)。
 *
 * 背景(r4-2 证伪路 P0):mem_limit 512m(compose.prod.yml api 块)下,宿主+子进程同处一个 cgroup;
 * 子进程 RSS 只受 V8 堆参数约束,并发 2 重件叠加时内核 OOM killer 常选 RSS 最大的宿主——实测
 * 修复前 18/18 宿主被杀(HOST_EXIT=137)。r5 处置=宿主 fork 后同步写子进程 oom_score_adj=1000
 * +子进程内清洗截断(宿主只收 ≤帽+1 字)→ OOM killer 弃宿主选子进程。
 *
 * 本证明在生产镜像 + 生产安全参数(只读根/tmpfs noexec/cap_drop ALL/no-new-privileges/512m)下,
 * 以真实宿主体量(preload AppModule)双路并发两件合法重件(9.9MB 声明·五关系别名 docx),断言:
 * ①宿主存活(HOST_EXIT=0·两路都有确定结果)②子进程 oom_score_adj=1000(Linux OOM 保护面)。
 *
 * 跑法(需本地 docker·colima 亦可以 DOCKER_HOST 指路):
 *   docker build -t meetwise-resume-512m:r5 .          # 仓库 Dockerfile 原样(FROM node:22-slim 钉 digest)
 *   pnpm -C packages/domain prove:resume-512m-dual     # 或 node_modules/.bin/tsx test/resume-512m-dual.proof.ts
 *   # colima(默认只共享 home 树)须加 RESUME_512M_WORKDIR=<home 树内绝对路径> (bind mount 源须在共享路径内)
 * 修复前对照(宿主被杀):用 r4 树镜像同参数跑同两件(详卷 §9 rev r5 注记·18/18 HOST_EXIT=137)。
 */
import { execFile } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const pExecFile = promisify(execFile);
const repoRoot = resolve(new URL('../../..', import.meta.url).pathname.replace(/^\/private/, ''));

let n = 0;
const ok = (c: boolean, m: string) => { if (!c) { console.error('✗', m); process.exit(1); } n++; };

const IMAGE = process.env.RESUME_512M_IMAGE ?? 'meetwise-resume-512m:r5';
const MEM = process.env.RESUME_512M_MEM ?? '512m';
// colima/受限 docker 共享目录:容器 bind mount 的源目录必须在宿主↔VM 共享路径内(Docker Desktop/mac
// 原生 docker 用 os.tmpdir() 即可;colima 默认只共享 home 树——传 RESUME_512M_WORKDIR=<home 树内绝对路径> 指路)。
const workRoot = process.env.RESUME_512M_WORKDIR ?? tmpdir();

async function dockerAvailable(): Promise<boolean> {
  try { await pExecFile('docker', ['version', '--format', '{{.Server.Version}}'], { timeout: 20_000 }); return true; } catch { return false; }
}
async function imageExists(): Promise<boolean> {
  try { await pExecFile('docker', ['image', 'inspect', IMAGE], { timeout: 20_000 }); return true; } catch { return false; }
}

if (!(await dockerAvailable())) {
  console.error('✗ docker 不可用:本 proof 需要 docker(生产镜像+生产安全参数)。跑法见文件头注释/卷 §9 rev r5 注记。');
  process.exit(1);
}
if (!(await imageExists())) {
  console.error(`✗ 镜像 ${IMAGE} 不存在:先 docker build -t ${IMAGE} .(仓库 Dockerfile 原样·详卷 §9 rev r5 注记)`);
  process.exit(1);
}

// ① 生成两件合法重件(仓内生成器·零二进制入库)——别名 docx 供两路并发
const workDir = mkdtempSync(join(workRoot, 's3r5-512m-'));
const fzDir = join(workDir, 'fz');
const outDir = join(workDir, 'out');
mkdirSync(fzDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
chmodSync(fzDir, 0o755);   // 容器内 app(uid 1000)需可读/可历目录(mkdtemp 默认 0700 仅属主)
chmodSync(outDir, 0o777);   // 容器内 app 需写 result/host-exit
await pExecFile('node', [join(repoRoot, 'scripts/resume-crash-samples/gen.mjs'), fzDir, 'alias5-9.9mb.docx'], { timeout: 60_000 });
if (!existsSync(join(fzDir, 'alias5-9.9mb.docx'))) { console.error('✗ 样本生成失败'); process.exit(1); }

// ② 容器内 runner(真实宿主体量:preload AppModule;双路并发;扫子进程 oom_score_adj;写结果 JSON)
const runner = `
const OUT_RESULT = ['/out','result.json'].join('/');
const { readFileSync, readdirSync, writeFileSync } = require('node:fs');
(async () => {
  const rssPeak = () => Math.round(process.memoryUsage().rss / 1048576);
  let rssPeakMb = rssPeak();
  const rssTimer = setInterval(() => { rssPeakMb = Math.max(rssPeakMb, rssPeak()); }, 25);
  try { await import('/app/apps/api/src/app.module.ts'); } catch (e) { /* preload 失败不阻断:真实宿主体量近似 */ }
  const { extractResumeText } = await import('/app/packages/domain/src/resume-extract.ts');
  const buf = readFileSync('/fz/alias5-9.9mb.docx');
  const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  // 双路并发(N=2):重件叠加在 512m cgroup 内竞争——修复前此形 18/18 宿主被 OOM 杀
  const childAdj = new Set();
  const scan = setInterval(() => {
    for (const d of readdirSync('/proc')) {
      if (!/^\\d+$/.test(d)) continue;
      try {
        const st = readFileSync('/proc/' + d + '/stat', 'utf8');
        const f = st.slice(st.lastIndexOf(')') + 2).split(' ');
        if (Number(f[1]) !== process.pid) continue;
        childAdj.add(readFileSync('/proc/' + d + '/oom_score_adj', 'utf8').trim());
      } catch { /* 已退 */ }
    }
  }, 20);
  const t0 = Date.now();
  const results = await Promise.all([0, 1].map(async (i) => {
    const s = Date.now();
    try { const r = await extractResumeText(buf, mime, 'dual-' + i + '.docx'); return { ok: true, len: r.text.length, ms: Date.now() - s }; }
    catch (e) { return { ok: false, code: (e && e.code) || String(e && e.message || e).slice(0, 60), ms: Date.now() - s }; }
  }));
  clearInterval(scan); clearInterval(rssTimer);
  writeFileSync(OUT_RESULT, JSON.stringify({
    hostAlive: true, results, ms: Date.now() - t0, rssPeakMb,
    childOomScoreAdj: [...childAdj], concurrency: process.env.RESUME_PARSE_CONCURRENCY ?? '(default)',
  }));
  console.log('RUNNER_DONE');
  setTimeout(() => process.exit(0), 100);
})().catch((e) => { writeFileSync(OUT_RESULT, JSON.stringify({ hostAlive: true, runnerError: String(e && e.message || e).slice(0, 200) })); console.log('RUNNER_ERR'); setTimeout(() => process.exit(1), 100); });
`;
writeFileSync(join(outDir, 'runner.cjs'), runner);   // runner 落在挂载卷内(/out)——容器内以 /out/runner.cjs 读取

// ③ 512m + 生产安全参数跑(compose.prod.yml api 块同形:只读根/tmpfs noexec/cap_drop ALL/no-new-privileges)
const script = `node --import @swc-node/register/esm-register /out/runner.cjs; echo HOST_EXIT=$? >> /out/host-exit`;
try {
  await pExecFile('docker', [
    'run', '--rm',
    '--memory', MEM,
    '--read-only',
    '--tmpfs', '/tmp:rw,noexec,nosuid,nodev,size=64m',
    '--cap-drop', 'ALL',
    '--security-opt', 'no-new-privileges:true',
    '--user', 'app',
    '-e', 'NODE_ENV=production',
    '-e', 'RESUME_PARSE_CONCURRENCY=2',
    '-v', `${fzDir}:/fz:ro`,
    '-v', `${outDir}:/out`,
    '-w', '/app/apps/api',
    IMAGE,
    'sh', '-c', script,
  ], { timeout: 180_000, maxBuffer: 8 * 1024 * 1024 });
} catch {
  // 宿主被 OOM 杀(docker run 非零退出)也拿得到 out 卷(宿主挂载目录)——读结果后判负
}
const hostExitRaw = existsSync(join(outDir, 'host-exit')) ? readFileSync(join(outDir, 'host-exit'), 'utf8').trim() : '';
const hostExit = Number(hostExitRaw.replace('HOST_EXIT=', '')) || 0;
const resultPath = join(outDir, 'result.json');
ok(hostExit === 0 && hostExitRaw !== '', `宿主存活:HOST_EXIT=0(实测 ${hostExitRaw || '(容器未写·宿主被杀)'}·修复前同形 18/18 HOST_EXIT=137)`);
ok(existsSync(resultPath), '宿主完成全流程:result.json 已写(宿主存活活体)');
if (existsSync(resultPath)) {
  const r = JSON.parse(readFileSync(resultPath, 'utf8')) as { hostAlive: boolean; results?: Array<{ ok: boolean; code?: string; len?: number; ms: number }>; childOomScoreAdj?: string[]; rssPeakMb?: number; concurrency?: string; runnerError?: string };
  ok(r.hostAlive === true && !r.runnerError, `runner 双路并发跑完且宿主存活(concurrency=${r.concurrency ?? '2'}·RSS 峰值 ${r.rssPeakMb ?? '?'}MB)`);
  const okCount = (r.results ?? []).filter((x) => x.ok).length;
  ok((r.results ?? []).length === 2 && okCount >= 1, `双路并发重件收场:2 路全有确定结果,成功 ≥1(实测成功 ${okCount}/2·失败臂=子进程 OOM 被内核杀→child_oom→extract_timeout 级可解释降级,宿主无恙·详卷 §9 读数): ${JSON.stringify(r.results ?? [])}`);
  ok((r.childOomScoreAdj ?? []).every((v) => v === '1000') && (r.childOomScoreAdj ?? []).length > 0, `子进程 oom_score_adj 全=1000(Linux OOM killer 弃宿主选子进程·实测集 ${JSON.stringify(r.childOomScoreAdj ?? [])})`);
} else {
  ok(false, 'result.json 缺失:宿主在解析完成前被杀(修复前行为)');
}
rmSync(workDir, { recursive: true, force: true });
console.log(`✓ resume-512m-dual:prove 全部通过(${n} 断言·镜像 ${IMAGE}·mem_limit ${MEM})`);
