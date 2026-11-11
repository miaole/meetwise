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
 *  N-1：pg-pool 复用同一 client 对象，checkout 只重置 release、不重置 query。
 *    serializeClientQueries 若每次 checkout 再包一层会平方变慢。修法=Symbol 标记，
 *    每 client 只装一次包装（不依赖 release 成功才拆包）。
 *
 *  形制：父进程 fork 子进程（钉死 unhandled-rejections=throw）。假 pool 臂不变。
 *    AFTER（当前树）：子进程 EXIT 0（含叠加臂 D：同 client 2000 次 checkout，query
 *      包装函数恒等；顺序臂 E：先 cleanup 再 raw release）。
 *    BEFORE（固定 SHA 59baa20b231bd6d022cc6290c7803fc40b724208，合入后也不漂）：
 *      子进程必须非零且 stderr 含 already been released。
 *    MUT-GUARD（去掉 RELEASE_ONCE_GUARD / 恢复无 .catch 的 void runRelease）：EXIT 1。
 *    MUT-STACK（去掉 SERIALIZE_ONCE_GUARD）：叠加臂必须失败，EXIT 1。
 *    MUT-ORDER（先 releaseOnce 再 cleanup）：顺序臂必须失败，EXIT 1。
 *    XP-2（真实 PG，官方 isolated runner，PGPOOL_MAX=1）：60 轮 × 3 并发，A/B 交替，
 *      混合 facade.query / connect 读 / 42501 写，connect 路径 release 不 await。
 *      每次读到的 principal/thread 必须属于本租户，mismatches=0。
 *    MUT-PRECEDENCE（恢复无括号 await releaseAsync?.() ?? client.release()）：XP-2 必须 EXIT 1。
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
/** 本 PR 之基线 main tip（含 #247，不含本修复）。合入后 origin/main 会漂，SHA 不漂。 */
const BEFORE_SHA = '59baa20b231bd6d022cc6290c7803fc40b724208';
const STACK_N = 2000;

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

type Mode = 'after' | 'before' | 'mut-guard' | 'mut-stack' | 'mut-order' | 'xp-after' | 'xp-mut-precedence';

function makeFakeClient(opts: { releaseThrowsAlways?: boolean; overlap?: { current: number; max: number; hits: number }; delayMs?: number }): {
  query: (...args: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>;
  release: (err?: unknown) => void;
  releaseCount: number;
} {
  let releaseCount = 0;
  let queryInFlight = 0;
  const overlap = opts.overlap;
  const delayMs = opts.delayMs ?? 15;
  const client = {
    releaseCount: 0,
    async query(..._args: unknown[]) {
      queryInFlight++;
      if (overlap) {
        overlap.current = queryInFlight;
        if (queryInFlight > 1) overlap.hits++;
        if (queryInFlight > overlap.max) overlap.max = queryInFlight;
      }
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
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

function poolLikePgReuse(client: { release: (err?: unknown) => void }): { connect: () => Promise<typeof client>; end: () => Promise<void> } {
  const rawRelease = client.release.bind(client);
  return {
    async connect() {
      let released = false;
      client.release = (err?: unknown) => {
        if (released) throw new Error(DOUBLE_RELEASE);
        released = true;
        rawRelease(err);
      };
      return client;
    },
    end: async () => undefined,
  };
}

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
  const facadeA = new boundCtor({ connect: async () => always, end: async () => undefined });
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
  const facadeB = new boundCtor({ connect: async () => serialClient, end: async () => undefined });
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

  // D: 同 client 反复 checkout（模拟 pg-pool 只重置 release）——包装层数必须恒定。
  const reuse = makeFakeClient({ delayMs: 0 });
  const rawQuery = reuse.query.bind(reuse);
  reuse.query = rawQuery;
  const poolD = poolLikePgReuse(reuse);
  const facadeD = new boundCtor(poolD);
  const querySeen: Array<(...args: unknown[]) => unknown> = [];
  await withAccess(ACCESS, async () => {
    for (let i = 0; i < STACK_N; i++) {
      const c = await facadeD.connect();
      await c.query('SELECT 1');
      if (typeof c.releaseAsync === 'function') await c.releaseAsync();
      else c.release();
      querySeen.push(c.query);
    }
  });
  const unique = new Set(querySeen).size;
  A(
    'D-1 同 client 反复 checkout 后 query 包装函数恒等（层数恒定）',
    querySeen.length === STACK_N && unique === 1 && querySeen[0] !== rawQuery,
    `n=${querySeen.length} unique=${unique}`,
  );

  // E: 先 await cleanup（SET ROLE NONE），再 raw releaseOnce。
  const order: string[] = [];
  const orderClient = {
    async query(sql: unknown) {
      if (typeof sql === 'string' && /SET ROLE NONE/i.test(sql)) order.push('cleanup');
      return { rows: [{}], rowCount: 1 };
    },
    release() {
      order.push('release');
    },
  };
  const facadeE = new boundCtor({ connect: async () => orderClient, end: async () => undefined });
  await withAccess(ACCESS, async () => {
    const c = await facadeE.connect();
    await c.query('SELECT 1');
    if (typeof c.releaseAsync === 'function') await c.releaseAsync();
    else c.release();
  });
  const iCleanup = order.indexOf('cleanup');
  const iRelease = order.indexOf('release');
  A(
    'E-1 先 await cleanup，再 releaseOnce',
    iCleanup >= 0 && iRelease >= 0 && iCleanup < iRelease,
    `order=${order.join(',')}`,
  );

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

function stripSerializeOnce(src: string): string {
  const next = src.replace(/\n\s*if \(marked\[QUERY_SERIALIZED\]\) return; \/\/ SERIALIZE_ONCE_GUARD/g, '');
  if (next === src) throw new Error('SERIALIZE_ONCE_GUARD not found');
  return next;
}


function restoreAwaitPrecedence(src: string): string {
  const from = `      const releasable = client as { releaseAsync?: () => Promise<void>; release: (err?: ReleaseArg) => void };
      if (releasable.releaseAsync) {
        await releasable.releaseAsync(); // RELEASE_ASYNC_ONLY
      } else {
        releasable.release();
      }`;
  const to = `      await (client as { releaseAsync?: () => Promise<void> }).releaseAsync?.()
        ?? Promise.resolve(client.release()); // MUT_PRECEDENCE`;
  if (!src.includes(from)) throw new Error('RELEASE_ASYNC_ONLY branch not found');
  return src.replace(from, to);
}

const XP_ROUNDS = 60;
const XP_CONCURRENCY = 3;
const SESSION_SQL = `SELECT pg_backend_pid()::int AS pid,
           current_user::text AS current_user,
           session_user::text AS session_user,
           nullif(current_setting('app.principal_user', true), '') AS principal,
           nullif(current_setting('app.checkpoint_thread_id', true), '') AS thread_id,
           nullif(current_setting('app.checkpoint_epoch', true), '') AS epoch`;

type XpAccess = { owner: string; threadId: string; fenceEpoch: number };
type XpSnap = { principal: string | null; threadId: string | null };

function xpSnapOf(row: { principal?: unknown; thread_id?: unknown }): XpSnap {
  return {
    principal: row.principal == null || row.principal === '' ? null : String(row.principal),
    threadId: row.thread_id == null || row.thread_id === '' ? null : String(row.thread_id),
  };
}

async function runXp2(mod: Record<string, unknown>): Promise<void> {
  if (process.env.E2E_ISOLATED !== '1') {
    console.log('XP-2 require E2E_ISOLATED=1 (official isolated runner)');
    process.exit(1);
  }
  const boundCtor = mod['PrincipalBoundCheckpointPool'] as new (pool: unknown) => {
    connect(): Promise<{ query: (...args: unknown[]) => unknown; release: (err?: unknown) => void; releaseAsync?: () => Promise<void> }>;
    query(...args: unknown[]): Promise<{ rows: Array<Record<string, unknown>> }>;
    end(): Promise<void>;
    readonly underlyingPool?: { end?: () => Promise<void> };
  };
  const withAccess = mod['withCheckpointAccess'] as <T>(access: XpAccess, fn: () => Promise<T>) => Promise<T>;
  const db = await import('@meetwise/db');
  const admin = db.createPool();
  const role = `xp2_rt_${process.pid}`;
  const password = 'xp2-pool-precedence-2026';
  let mismatches = 0;
  let fenced = 0;
  let fenceMiss = 0;
  const mismatchSamples: string[] = [];
  try {
    await db.assertIsolatedTestTarget(admin);
    await db.provisionRuntimeLogin(admin, { roleName: role, password });
    const port = process.env.PGPORT ?? '54329';
    const connection = `postgresql://${encodeURIComponent(role)}:${encodeURIComponent(password)}@${process.env.PGHOST ?? '127.0.0.1'}:${port}/${encodeURIComponent(process.env.PGDATABASE ?? 'meetwise')}`;
    process.env.PGPOOL_MAX = '1';
    const url = new URL(connection);
    const options = url.searchParams.get('options') ?? '';
    if (!/(?:^|\s)-c\s+role=app_role(?:\s|$)/.test(options)) {
      url.searchParams.set('options', `${options} -c role=app_role`.trim());
    }
    const pool = db.createPool({ connectionString: url.toString(), purpose: 'checkpoint' });
    const bound = new boundCtor(pool);
    const ownerA = `xp2-a-${process.pid}`;
    const ownerB = `xp2-b-${process.pid}`;
    const threadA = `xp2-thread-a-${process.pid}`;
    const threadB = `xp2-thread-b-${process.pid}`;
    await admin.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created'),($3,$4,'created')",
      [threadA, ownerA, threadB, ownerB],
    );
    const runtime = db.createPool({ user: role, password, max: 1 });
    let accessA: XpAccess;
    let accessB: XpAccess;
    try {
      const enA = await db.asPrincipal(runtime, ownerA, (c) => db.enrollCheckpointThread(c, ownerA, threadA));
      const enB = await db.asPrincipal(runtime, ownerB, (c) => db.enrollCheckpointThread(c, ownerB, threadB));
      accessA = { owner: ownerA, threadId: enA.threadId, fenceEpoch: enA.fenceEpoch };
      accessB = { owner: ownerB, threadId: enB.threadId, fenceEpoch: enB.fenceEpoch };
    } finally {
      await runtime.end();
    }

    const checkSnap = (tag: string, snap: XpSnap, access: XpAccess): void => {
      if (snap.principal !== access.owner || snap.threadId !== access.threadId) {
        mismatches += 1;
        if (mismatchSamples.length < 6) mismatchSamples.push(`${tag} ${JSON.stringify(snap)} expected=${access.owner}/${access.threadId}`);
      }
    };

    const oneOp = async (round: number, slot: number): Promise<void> => {
      const access = (round + slot) % 2 === 0 ? accessA : accessB;
      const other = access === accessA ? accessB : accessA;
      const mode = slot % 3;
      await withAccess(access, async () => {
        if (mode === 0) {
          const result = await bound.query(SESSION_SQL);
          checkSnap(`q:r${round}s${slot}`, xpSnapOf(result.rows[0] ?? {}), access);
          return;
        }
        const client = await bound.connect();
        try {
          const raw = await client.query(SESSION_SQL) as { rows: Array<Record<string, unknown>> };
          checkSnap(`c:r${round}s${slot}`, xpSnapOf(raw.rows[0] ?? {}), access);
          if (mode === 2) {
            try {
              await client.query('SELECT revoke_checkpoint_thread($1)', [other.threadId]);
              fenceMiss += 1;
            } catch (error) {
              const err = error as { code?: unknown; message?: unknown };
              if (err.code === '42501' && String(err.message ?? '').includes('checkpoint_privacy_fenced')) fenced += 1;
              else throw error;
            }
          }
        } finally {
          client.release();
        }
      });
    };

    for (let round = 0; round < XP_ROUNDS; round++) {
      await Promise.all(Array.from({ length: XP_CONCURRENCY }, (_, slot) => oneOp(round, slot)));
    }

    console.log(`XP2 mismatches=${mismatches} fenced=${fenced} fenceMiss=${fenceMiss} samples=${mismatchSamples.join(' | ')}`);
    const ok = mismatches === 0 && fenceMiss === 0 && fenced > 0;
    if (ok) console.log('CHILD_OK');
    else console.log('CHILD_FAIL XP-2');
    try { await bound.end(); } catch { /* ignore */ }
    if (!ok) throw new Error('xp2_assertion_failed');
  } finally {
    await admin.query(`DROP ROLE IF EXISTS ${role}`).catch(() => undefined);
    await admin.end().catch(() => undefined);
  }
}

function swapCleanupOrder(src: string): string {
  const from = `        await cleanupCheckpointPrincipalSession(client); // CLEANUP_BEFORE_RELEASE
        releaseOnce(); // CLEANUP_BEFORE_RELEASE`;
  const to = `        releaseOnce(); // MUT_ORDER_F
        await cleanupCheckpointPrincipalSession(client); // MUT_ORDER_F`;
  if (!src.includes(from)) throw new Error('CLEANUP_BEFORE_RELEASE sequence not found');
  return src.replace(from, to);
}

async function child(mode: Mode, moduleUrl: string): Promise<void> {
  const mod = await import(moduleUrl);
  if (mode === 'xp-after' || mode === 'xp-mut-precedence') await runXp2(mod);
  else await runScenario(mod);
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
  const runChild = (mode: Mode, moduleUrl: string, timeoutMs = 60_000) =>
    spawnSync(process.execPath, [...process.execArgv, self, `--child=${mode}`, `--module=${moduleUrl}`], {
      encoding: 'utf8',
      timeout: timeoutMs,
      env: (() => {
        const env: NodeJS.ProcessEnv = { ...process.env };
        env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ''} --unhandled-rejections=throw`.trim();
        return env;
      })(),
    });

  const after = runChild('after', `file://${srcPath}`);
  process.stdout.write(after.stdout ?? '');
  if (after.status !== 0) process.stderr.write((after.stderr ?? '').slice(0, 4000));
  A('AFTER 子进程 EXIT 0（修后）', after.status === 0 && /CHILD_OK/.test(after.stdout ?? ''), `status=${after.status}`);

  const beforeSrc = spawnSync('git', ['show', `${BEFORE_SHA}:apps/worker/src/checkpoint-principal.ts`], {
    encoding: 'utf8',
    cwd: join(here, '../../..'),
  });
  A(
    `BEFORE 能读到固定 SHA ${BEFORE_SHA.slice(0, 9)} 源`,
    beforeSrc.status === 0 && (beforeSrc.stdout ?? '').includes('installReleaseCleanup') && !(beforeSrc.stdout ?? '').includes('SERIALIZE_ONCE_GUARD'),
    `status=${beforeSrc.status}`,
  );
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

  const src = readFileSync(srcPath, 'utf8');
  const mutSrc = stripGuards(src);
  A('MUT-GUARD 变换真正去掉了 RELEASE_ONCE_GUARD', !mutSrc.includes('RELEASE_ONCE_GUARD') && /void runRelease\(err\);/.test(mutSrc));
  const mutWritten = writePatchedModule(mutSrc);
  const mut = runChild('mut-guard', mutWritten.url);
  A('MUT-GUARD 去掉 guard 后子进程非零退出', mut.status !== 0, `status=${mut.status} signal=${mut.signal}`);
  A(
    'MUT-GUARD 崩溃文案=already been released',
    /already been released to the pool/.test(`${mut.stderr ?? ''}\n${mut.stdout ?? ''}`),
    (mut.stderr ?? '').split('\n').find((l) => /already been released|Error:/.test(l)) ?? '',
  );

  const stackSrc = stripSerializeOnce(src);
  A('MUT-STACK 变换真正去掉了 SERIALIZE_ONCE_GUARD', !stackSrc.includes('SERIALIZE_ONCE_GUARD') && stackSrc.includes('serializeClientQueries'));
  const stackWritten = writePatchedModule(stackSrc);
  const mutStack = runChild('mut-stack', stackWritten.url);
  A('MUT-STACK 去掉防叠加逻辑后子进程非零退出', mutStack.status !== 0, `status=${mutStack.status} signal=${mutStack.signal}`);
  A(
    'MUT-STACK 失败在叠加臂 D-1',
    /FAIL {2}D-1 /.test(mutStack.stdout ?? ''),
    (mutStack.stdout ?? '').split('\n').find((l) => /D-1/.test(l)) ?? (mutStack.stderr ?? '').slice(0, 200),
  );

  const orderSrc = swapCleanupOrder(src);
  A('MUT-ORDER 变换把 cleanup 放到 releaseOnce 之后', orderSrc.includes('MUT_ORDER_F') && !orderSrc.includes('CLEANUP_BEFORE_RELEASE'));
  const orderWritten = writePatchedModule(orderSrc);
  const mutOrder = runChild('mut-order', orderWritten.url);
  A('MUT-ORDER 先 releaseOnce 再 cleanup 后子进程非零退出', mutOrder.status !== 0, `status=${mutOrder.status} signal=${mutOrder.signal}`);
  A(
    'MUT-ORDER 失败在顺序臂 E-1',
    /FAIL {2}E-1 /.test(mutOrder.stdout ?? ''),
    (mutOrder.stdout ?? '').split('\n').find((l) => /E-1/.test(l)) ?? (mutOrder.stderr ?? '').slice(0, 200),
  );

  A('ALERT-OLD 对现场崩溃日志假阴性', !WORKER_ALERT_RE_OLD.test(CRASH_LOG));
  A('ALERT-NEW 命中 already-released 与 Node 退出横幅', WORKER_ALERT_RE.test(CRASH_LOG));
  A('ALERT-NEW 对健康 worker.log 不误报', !WORKER_ALERT_RE.test(HEALTHY_LOG));
  A('S-1 源含 RELEASE_ONCE_GUARD', src.includes('RELEASE_ONCE_GUARD'));
  A('S-2 源含 serializeClientQueries 与 SERIALIZE_ONCE_GUARD', src.includes('serializeClientQueries') && src.includes('SERIALIZE_ONCE_GUARD'));
  A('S-3 fire-and-forget release 带 .catch', /void runRelease\(err\)\.catch\(/.test(src));
  A('S-4 源钉死先 cleanup 再 releaseOnce', src.includes('CLEANUP_BEFORE_RELEASE'));
  A('S-5 吞错路径有 warnReleasePath（无 SQL/principal）', src.includes('warnReleasePath') && !/warnReleasePath\([^)]*principal/i.test(src));
  A('S-6 façade.query finally 显式分支（无 await/?? 优先级陷阱）', src.includes('RELEASE_ASYNC_ONLY') && !/await \(client as \{ releaseAsync\?:/.test(src));

  if (process.env.E2E_ISOLATED !== '1') {
    A('XP-2 须由官方 isolated runner 提供真实 PG（E2E_ISOLATED=1）', false, `E2E_ISOLATED=${process.env.E2E_ISOLATED ?? ''}`);
  } else {
    const xp = runChild('xp-after', `file://${srcPath}`, 180_000);
    process.stdout.write(xp.stdout ?? '');
    if (xp.status !== 0) process.stderr.write((xp.stderr ?? '').slice(0, 4000));
    A('XP-2 真实 PG 并发 mismatches=0', xp.status === 0 && /CHILD_OK/.test(xp.stdout ?? '') && /XP2 mismatches=0 /.test(xp.stdout ?? ''), `status=${xp.status}`);

    const precSrc = restoreAwaitPrecedence(src);
    A('MUT-PRECEDENCE 变换恢复了无括号 await/??', precSrc.includes('MUT_PRECEDENCE') && !precSrc.includes('RELEASE_ASYNC_ONLY'));
    const precWritten = writePatchedModule(precSrc);
    const mutPrec = runChild('xp-mut-precedence', precWritten.url, 180_000);
    process.stdout.write(mutPrec.stdout ?? '');
    if (mutPrec.status !== 0) process.stderr.write((mutPrec.stderr ?? '').slice(0, 4000));
    A('MUT-PRECEDENCE 恢复无括号写法后子进程非零退出', mutPrec.status !== 0, `status=${mutPrec.status} signal=${mutPrec.signal}`);
    A(
      'MUT-PRECEDENCE 失败在 XP-2 mismatches>0',
      /XP2 mismatches=([1-9]\d*) /.test(mutPrec.stdout ?? ''),
      (mutPrec.stdout ?? '').split('\n').find((l) => /XP2 mismatches=/.test(l)) ?? (mutPrec.stderr ?? '').slice(0, 200),
    );
    rmSync(precWritten.dir, { recursive: true, force: true });
  }

  for (const dir of [beforeDir, mutWritten.dir, stackWritten.dir, orderWritten.dir]) {
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
  console.log(fail === 0 ? 'PG-CLIENT-DOUBLE-RELEASE PASS' : `PG-CLIENT-DOUBLE-RELEASE FAIL (${fail})`);
  process.exit(fail === 0 ? 0 : 1);
}

const childArg = process.argv.find((a) => a.startsWith('--child='));
const moduleArg = process.argv.find((a) => a.startsWith('--module='));
if (childArg) await child(childArg.slice('--child='.length) as Mode, (moduleArg ?? '').slice('--module='.length));
else await parent();
