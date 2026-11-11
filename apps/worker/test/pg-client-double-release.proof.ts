/** PG-CLIENT-DOUBLE-RELEASE 回归 proof（零 DB、零模型密钥）。
 *
 *  现场（/workspace/mw-b3-sizing-out/raw/noswap-inflight16-n20-r3/worker.log，
 *  代码 607f709a0，mock，inflight=16，N=20 r3，负载 +22.1s）：
 *    DeprecationWarning: Calling client.query() when the client is already executing a query
 *    Error: Release called on client which has already been released to the pool.
 *        at throwOnDoubleRelease (pg-pool/index.js:27)
 *        at Client.<anonymous> (pg-pool/index.js:374)
 *        at checkpoint-principal.ts:93:17   // swc 发出行 = catch 里第二次 originalRelease
 *        at processTicksAndRejections
 *    Node.js v24.22.1
 *
 *  根因时序（installReleaseCleanup）：
 *    1. PostgresSaver 在同一 PoolClient 上 await query（BEGIN/写/COMMIT）；release() 是
 *       同步 void，包装器用 `void runRelease()` 启动异步 cleanup（SET ROLE NONE + 清 GUC）。
 *    2. 并发下另一条 query 在 cleanup 期间进入同一 client（pg@8 只警告不拒）——现场
 *       concurrent-query 告警。cleanup 失败或 raw release 已被先调用时，try 里的
 *       originalRelease() 抛 already-released。
 *    3. catch 把该错当成 reset 失败，再调一次 originalRelease(resetErr)。
 *       `void runRelease()` 无 .catch → unhandledRejection → Node 默认退出整进程。
 *    既有 releasePromise 只保证 runRelease 主体进一次，不能让 originalRelease 幂等，
 *    也挡不住 catch 里的第二次调用。
 *
 *  形制：父进程 fork 子进程（钉死 unhandled-rejections=throw）。子进程用假 pool 复现
 *  「cleanup 成功后 raw release 抛 already-released」以及「同 client 并发 query +
 *  双 release」；并断言 42501 checkpoint_privacy_fenced 仍从 query 路径原样上抛。
 *    AFTER（当前树）：子进程 EXIT 0。
 *    BEFORE（origin/main 版 checkpoint-principal.ts）：子进程必须非零且 stderr 含
 *      already been released。
 *    MUT-GUARD（去掉 RELEASE_ONCE_GUARD / 恢复无 .catch 的 void runRelease）：EXIT 1。
 *  另：WORKER_ALERT 旧正则对现场崩溃日志假阴性；新正则命中，健康日志不误报。
 *  pnpm pg-client-double-release:prove */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = join(here, '../src/checkpoint-principal.ts');
const DOUBLE_RELEASE = 'Release called on client which has already been released to the pool.';

/** 现场 worker 崩溃摘录（无密钥）。 */
const CRASH_LOG = `(node:1310101) DeprecationWarning: Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use async/await or an external async flow control mechanism instead.
/workspace/mw-b3-sizing/node_modules/.pnpm/pg-pool@3.14.0_pg@8.22.0/node_modules/pg-pool/index.js:27
  throw new Error('Release called on client which has already been released to the pool.')
        ^

Error: Release called on client which has already been released to the pool.
    at throwOnDoubleRelease (/workspace/mw-b3-sizing/node_modules/.pnpm/pg-pool@3.14.0_pg@8.22.0/node_modules/pg-pool/index.js:27:9)
    at Client.<anonymous> (/workspace/mw-b3-sizing/node_modules/.pnpm/pg-pool@3.14.0_pg@8.22.0/node_modules/pg-pool/index.js:374:9)
    at file:///workspace/mw-b3-sizing/apps/worker/src/checkpoint-principal.ts:93:17
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)

Node.js v24.22.1
`;

const HEALTHY_LOG = `rag cost governance: observe; model cost governance: observe
interview dispatch budget: perOwner=1 globalInflight=16 (process-local)
worker ready: event wakeup + 5000ms bounded reconciliation
{"event":"reaper_takeover","kind":"report","job_ref":"requeued:1","prev_lease_expired":false}
`;

/** 旧 sizing 正则：对 already-released / Node 退出假阴性。 */
export const WORKER_ALERT_RE_OLD = /checkpoint_connection_lost|checkpoint_privacy_fenced|Connection terminated|FATAL|Error: Connection terminated/;

/** 新正则：保留旧族，并覆盖未捕获异常与 worker 进程退出横幅。 */
export const WORKER_ALERT_RE = /checkpoint_connection_lost|checkpoint_privacy_fenced|Connection terminated|FATAL|already been released to the pool|unhandledRejection|uncaughtException|^Error: |Node\.js v\d/m;

const ACCESS = { owner: 'owner-a', threadId: 'thread-a', fenceEpoch: 1 };

type Mode = 'after' | 'before' | 'mut-guard';

function makeFakeClient(opts: { releaseThrowsAlways?: boolean; overlap?: { current: number; max: number; hits: number } }): {
  query: (...args: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>;
  release: (err?: unknown) => void;
  releaseCount: number;
} {
  let releaseCount = 0;
  let queryInFlight = 0;
  const overlap = opts.overlap;
  const client = {
    releaseCount: 0,
    async query(..._args: unknown[]) {
      queryInFlight++;
      if (overlap) {
        overlap.current = queryInFlight;
        if (queryInFlight > 1) overlap.hits++;
        if (queryInFlight > overlap.max) overlap.max = queryInFlight;
      }
      await new Promise((r) => setTimeout(r, 15));
      queryInFlight--;
      return { rows: [{}], rowCount: 1 };
    },
    release(_err?: unknown) {
      releaseCount++;
      client.releaseCount = releaseCount;
      if (opts.releaseThrowsAlways || releaseCount > 1) {
        throw new Error(DOUBLE_RELEASE);
      }
    },
  };
  return client;
}

type LoadedPrincipal = {
  connect(): Promise<{ query: (...args: unknown[]) => unknown; release: (err?: unknown) => void; releaseAsync?: () => Promise<void> }>;
  query(...args: unknown[]): Promise<unknown>;
};

async function runScenario(mod: Record<string, unknown>): Promise<void> {
  const boundCtor = mod['PrincipalBoundCheckpointPool'] as new (pool: unknown) => LoadedPrincipal;
  const withAccess = mod['withCheckpointAccess'] as <T>(access: typeof ACCESS, fn: () => Promise<T>) => Promise<T>;

  let fail = 0;
  const A = (n: string, c: boolean, extra = '') => {
    console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${extra ? `  [${extra}]` : ''}`);
    if (!c) fail++;
  };

  // A: raw release already throws (现场 catch 二次调用形)。双 release + 短查询。
  const always = makeFakeClient({ releaseThrowsAlways: true });
  const poolA = { connect: async () => always, end: async () => undefined };
  const facadeA = new boundCtor(poolA);
  // 不装 unhandledRejection handler：有 handler 会吞掉 Node 默认 throw，修前臂就假活。
  // PostgresSaver finally 只调同步 void release()，不等 releaseAsync。修前 catch 二次
  // originalRelease 会在此变成未捕获拒绝并杀死子进程。
  await withAccess(ACCESS, async () => {
    const c = await facadeA.connect();
    const q = c.query('SELECT 1');
    c.release();
    c.release();
    await q;
    await new Promise((r) => setTimeout(r, 40));
  });
  A('A-1 already-released 的 raw release 不杀死进程', true);

  // B: 同 client 并发 query 必须串行，双 release 只落地一次 raw release。
  const overlap = { current: 0, max: 0, hits: 0 };
  const serialClient = makeFakeClient({ overlap });
  const poolB = { connect: async () => serialClient, end: async () => undefined };
  const facadeB = new boundCtor(poolB);
  await withAccess(ACCESS, async () => {
    const c = await facadeB.connect();
    const q1 = c.query('SELECT pg_sleep(0.05)');
    const q2 = c.query('SELECT 1');
    c.release();
    c.release();
    await Promise.all([q1, q2]);
    if (typeof c.releaseAsync === 'function') await c.releaseAsync();
  });
  A('B-1 同 client 查询串行（无重叠）', overlap.hits === 0 && overlap.max <= 1, `hits=${overlap.hits} max=${overlap.max}`);
  A('B-2 raw release 至多一次', serialClient.releaseCount === 1, `count=${serialClient.releaseCount}`);

  // C: 42501 checkpoint_privacy_fenced 仍从 query 路径 fail-closed 上抛，且 release 一次。
  let releaseCountC = 0;
  const fenced = {
    async query(sql: string) {
      if (/SET ROLE|set_config/i.test(sql)) return { rows: [{}], rowCount: 1 };
      throw Object.assign(new Error('checkpoint_privacy_fenced'), { code: '42501', severity: 'ERROR' });
    },
    release() {
      releaseCountC++;
      if (releaseCountC > 1) throw new Error(DOUBLE_RELEASE);
    },
  };
  const facadeC = new boundCtor({ connect: async () => fenced, end: async () => undefined });
  let fenceErr: { code?: unknown; message?: unknown } | undefined;
  await withAccess(ACCESS, async () => {
    try {
      await facadeC.query('INSERT INTO checkpoints VALUES (1)');
    } catch (err) {
      fenceErr = err as { code?: unknown; message?: unknown };
    }
  });
  A('C-1 pool.query 上的 42501 原样上抛（fail-closed，不吞）', fenceErr?.code === '42501' && fenceErr?.message === 'checkpoint_privacy_fenced', `err=${fenceErr?.message}:${fenceErr?.code}`);
  A('C-2 fenced 之后 raw release 恰好一次', releaseCountC === 1, `count=${releaseCountC}`);

  if (fail !== 0) {
    console.log(`CHILD_FAIL ${fail}`);
    process.exit(1);
  }
  console.log('CHILD_OK');
}

const UNFIXED_INSTALL = `function installReleaseCleanup(client: any): { releaseAsync: () => Promise<void> } {
  const originalRelease = client.release.bind(client) as (err?: ReleaseArg) => void;
  let releasePromise: Promise<void> | null = null;

  const runRelease = (err?: ReleaseArg): Promise<void> => {
    if (releasePromise) return releasePromise;
    releasePromise = (async () => {
      if (err) {
        originalRelease(err);
        return;
      }
      try {
        await cleanupCheckpointPrincipalSession(client);
        originalRelease();
      } catch (resetErr) {
        originalRelease(resetErr instanceof Error ? resetErr : true);
      }
    })();
    return releasePromise;
  };

  client.release = (err?: ReleaseArg) => {
    void runRelease(err);
  };

  return { releaseAsync: () => runRelease() };
}
`;

function stripGuards(src: string): string {
  // 反证：在修后源上把 installReleaseCleanup 换回无幂等 guard / 无 .catch 的现场形。
  const start = src.indexOf('function installReleaseCleanup(');
  const end = src.indexOf('export class PrincipalBoundCheckpointPool');
  if (start < 0 || end < 0 || end <= start) throw new Error('installReleaseCleanup block not found');
  return src.slice(0, start) + UNFIXED_INSTALL + '\n' + src.slice(end);
}

async function child(mode: Mode, moduleUrl: string): Promise<void> {
  const mod = await import(moduleUrl);
  await runScenario(mod);
}

function writePatchedModule(src: string): { dir: string; url: string } {
  const dir = mkdtempSync(join(tmpdir(), 'mw-pg-release-'));
  const file = join(dir, 'checkpoint-principal.ts');
  writeFileSync(file, src);
  return { dir, url: `file://${file}` };
}

async function parent(): Promise<void> {
  let fail = 0;
  const A = (n: string, c: boolean, extra = '') => {
    console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${extra ? `  [${extra}]` : ''}`);
    if (!c) fail++;
  };
  const self = fileURLToPath(import.meta.url);
  const runChild = (mode: Mode, moduleUrl: string) =>
    spawnSync(process.execPath, [...process.execArgv, self, `--child=${mode}`, `--module=${moduleUrl}`], {
      encoding: 'utf8',
      timeout: 30_000,
      env: (() => {
        const env: NodeJS.ProcessEnv = { ...process.env };
        env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ''} --unhandled-rejections=throw`.trim();
        delete env.MODEL_API_KEY;
        delete env.MODEL_BASE_URL;
        return env;
      })(),
    });

  const after = runChild('after', `file://${srcPath}`);
  process.stdout.write(after.stdout ?? '');
  if (after.status !== 0) process.stderr.write((after.stderr ?? '').slice(0, 4000));
  A('AFTER 子进程 EXIT 0（修后）', after.status === 0 && /CHILD_OK/.test(after.stdout ?? ''), `status=${after.status}`);

  const beforeSrc = spawnSync('git', ['show', 'origin/main:apps/worker/src/checkpoint-principal.ts'], {
    encoding: 'utf8',
    cwd: join(here, '../../..'),
  });
  A('BEFORE 能读到 origin/main 源', beforeSrc.status === 0 && (beforeSrc.stdout ?? '').includes('installReleaseCleanup'), `status=${beforeSrc.status}`);
  let beforeDir = '';
  if (beforeSrc.status === 0) {
    const written = writePatchedModule(beforeSrc.stdout ?? '');
    beforeDir = written.dir;
    const before = runChild('before', written.url);
    A('BEFORE 子进程非零退出（修前复现）', before.status !== 0, `status=${before.status} signal=${before.signal}`);
    A(
      'BEFORE 崩溃文案=already been released（现场同族）',
      /already been released to the pool/.test(`${before.stderr ?? ''}\n${before.stdout ?? ''}`),
      (before.stderr ?? '').split('\n').find((l) => /already been released|Error:/.test(l)) ?? '',
    );
  }

  const mutSrc = stripGuards(readFileSync(srcPath, 'utf8'));
  A('MUT-GUARD 变换真正去掉了 RELEASE_ONCE_GUARD', !mutSrc.includes('RELEASE_ONCE_GUARD') && /void runRelease\(err\);/.test(mutSrc));
  const mutWritten = writePatchedModule(mutSrc);
  const mut = runChild('mut-guard', mutWritten.url);
  A('MUT-GUARD 去掉 guard 后子进程非零退出', mut.status !== 0, `status=${mut.status} signal=${mut.signal}`);
  A(
    'MUT-GUARD 崩溃文案=already been released',
    /already been released to the pool/.test(`${mut.stderr ?? ''}\n${mut.stdout ?? ''}`),
    (mut.stderr ?? '').split('\n').find((l) => /already been released|Error:/.test(l)) ?? '',
  );

  A('ALERT-OLD 对现场崩溃日志假阴性', !WORKER_ALERT_RE_OLD.test(CRASH_LOG));
  A('ALERT-NEW 命中 already-released 与 Node 退出横幅', WORKER_ALERT_RE.test(CRASH_LOG));
  A('ALERT-NEW 对健康 worker.log 不误报', !WORKER_ALERT_RE.test(HEALTHY_LOG));
  const src = readFileSync(srcPath, 'utf8');
  A('S-1 源含 RELEASE_ONCE_GUARD', src.includes('RELEASE_ONCE_GUARD'));
  A('S-2 源含 serializeClientQueries', src.includes('serializeClientQueries'));
  A('S-3 fire-and-forget release 带 .catch', /void runRelease\(err\)\.catch\(/.test(src));

  for (const dir of [beforeDir, mutWritten.dir]) {
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
  console.log(fail === 0 ? 'PG-CLIENT-DOUBLE-RELEASE PASS' : `PG-CLIENT-DOUBLE-RELEASE FAIL (${fail})`);
  process.exit(fail === 0 ? 0 : 1);
}

const childArg = process.argv.find((a) => a.startsWith('--child='));
const moduleArg = process.argv.find((a) => a.startsWith('--module='));
if (childArg) await child(childArg.slice('--child='.length) as Mode, (moduleArg ?? '').slice('--module='.length));
else await parent();
