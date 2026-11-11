/** WORKER-INFLIGHT-CRASH-01 回归 proof（2c4g sizing globalInflight=16 真崩复现形·零 DB）。
 *
 *  现场（/workspace/meetwise-sizing/2c4g-ext-db/raw/noswap-inflight16/worker.log）：N=20 时 worker
 *  +14s 因未处理的 42501 `checkpoint_privacy_fenced`（PostgresSaver.put）退出；N=40 时 +28s 因 pg
 *  `Connection terminated`（PostgresSaver.putWrites）退出。根因=LangGraph 1.4.7
 *  PregelLoop._trackCheckpointerPromise 的 `tracked` promise 只在 _streamIterator finally 才被
 *  Promise.all 挂 handler；写失败与 finally 之间节点仍在 await（模型/DB 慢=高并发下窗口变大）→
 *  unhandledRejection → Node 默认整进程退出，一个 job 的写失败拖垮全部在飞 job。
 *
 *  形制：父进程按臂 fork 子进程（子进程=Node 默认 unhandledRejection 行为，不装吞没 handler），
 *  子进程跑 INFLIGHT=16 个并发图（3 节点·每节点 await 模拟模型延迟），内层 saver 在第 2 次写时
 *  按 job 注入 42501 fenced / `Connection terminated`，外层=真 FenceCheckpointSaver（fence 查询经
 *  假 pool 恒放行——本 proof 只证收容面，三谓词面由 graph-fence-write:prove 承担）。
 *    臂 RAW（反证·恒跑）：图直接 invoke（=修前 adaptive-lifecycle 形）→ 子进程必须非零退出且
 *      stderr 含注入错 → 证明本 harness 能复现现场崩溃（不是假绿）。
 *    臂 MAIN（主路径）：经 checkpoint-fence.ts 导出的 invokeWithCheckpointContainment（与
 *      adaptive-lifecycle 四个 invoke 缝同一函数）；修前该导出不存在→退化为直接 invoke→子进程崩
 *      →本 proof EXIT 1；修后子进程 EXIT 0 且：16 个 job 全部 settle、健康 job 跑完、fenced job
 *      以 42501 失败且分类=确定性终态、terminated job 以 checkpoint_connection_lost 失败且分类=
 *      transient（requeue）、锁存后内层零续写、abort 让故障 job 不再进入第 3 节点、0 个
 *      unhandledRejection；重试臂：新 FenceCheckpointSaver（=requeue 后新 claim·新连接）从最后
 *      checkpoint 续跑到终点。
 *  静态锚：adaptive-lifecycle.ts 零裸 `await g.invoke(`、4 处 invokeWithCheckpointContainment。
 *  锁存优先级臂（#247 N-1）：先并发打入可重试（Connection terminated → checkpoint_connection_lost），
 *  再打入 42501，最终必须判不可重试；其他不可重试码同理覆盖；同级仍首个获胜；L-sync 与
 *  isTransientInterviewJobError 对拍。修前 `??=` 形本臂 EXIT 1，修后 EXIT 0。
 *  pnpm worker-inflight-crash:prove */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Annotation, END, MemorySaver, START, StateGraph, type Checkpoint, type CheckpointMetadata } from '@langchain/langgraph';

const INFLIGHT = 16;
const NODE_DELAY_MS = 40;
type Fault = 'none' | 'fenced' | 'terminated';
const faultOf = (i: number): Fault => (i % 4 === 1 ? 'fenced' : i % 4 === 3 ? 'terminated' : 'none');

function makeFenced(): Error {
  // 与现场 pg DatabaseError 同形：message=checkpoint_privacy_fenced，code=42501。
  return Object.assign(new Error('checkpoint_privacy_fenced'), { code: '42501', severity: 'ERROR' });
}
function makeTerminated(): Error {
  // pg@8.22 client.js:199 `_ending` 臂：无 code。
  return new Error('Connection terminated');
}

function latchErrCode(e: unknown): string | undefined {
  if (!e || typeof e !== 'object' || !('code' in e)) return undefined;
  const c = (e as { code: unknown }).code;
  return typeof c === 'string' ? c : undefined;
}
function latchErrMessage(e: unknown): string | undefined {
  return e instanceof Error ? e.message : undefined;
}
function latchErrCauseMessage(e: unknown): string | undefined {
  if (!e || typeof e !== 'object' || !('cause' in e)) return undefined;
  const cause = (e as { cause: unknown }).cause;
  return cause instanceof Error ? cause.message : undefined;
}

/** 第 failAt 次写（put/putWrites 合计）注入故障；armed=false 时为健康 saver（重试臂=重连后）。 */
class FaultySaver extends MemorySaver {
  writeCount = 0;
  /** 注入故障之后才「开始」的内层写次数（锁存后零续写断言）。 */
  writesStartedAfterFault = 0;
  private faulted = false;
  armed = true;
  constructor(private readonly fault: Fault, private readonly failAt = 2) { super(); }
  private maybeFail(): void {
    this.writeCount++;
    if (!this.armed || this.fault === 'none' || this.writeCount !== this.failAt) return;
    this.faulted = true;
    throw this.fault === 'fenced' ? makeFenced() : makeTerminated();
  }
  override async put(...args: Parameters<MemorySaver['put']>) {
    if (this.faulted) this.writesStartedAfterFault++;   // 入口即计（「开始」口径）
    await new Promise((r) => setTimeout(r, 2));
    this.maybeFail();
    return super.put(...args);
  }
  override async putWrites(...args: Parameters<MemorySaver['putWrites']>) {
    if (this.faulted) this.writesStartedAfterFault++;   // 入口即计（「开始」口径）
    await new Promise((r) => setTimeout(r, 2));
    this.maybeFail();
    return super.putWrites(...args);
  }
}

/** asPrincipal 所需最小 pool 面：BEGIN/SET/fence SELECT/COMMIT 恒成功且 rowCount=1（fence 恒现行）。 */
const fakePool = {
  async connect() {
    return { async query() { return { rows: [{}], rowCount: 1 }; }, release() {} };
  },
} as never;

function buildGraph(cp: unknown, visits: Record<string, number>) {
  const S = Annotation.Root({ steps: Annotation<string[]>({ reducer: (a, b) => a.concat(b), default: () => [] }) });
  const node = (name: string) => async () => {
    visits[name] = (visits[name] ?? 0) + 1;
    await new Promise((r) => setTimeout(r, NODE_DELAY_MS));
    return { steps: [name] };
  };
  return new StateGraph(S)
    .addNode('a', node('a')).addNode('b', node('b')).addNode('c', node('c'))
    .addEdge(START, 'a').addEdge('a', 'b').addEdge('b', 'c').addEdge('c', END)
    .compile({ checkpointer: cp as never });
}

async function child(mode: 'raw' | 'main'): Promise<void> {
  const fenceMod = await import('../src/checkpoint-fence.ts') as Record<string, any>;
  const consumer = await import('../src/interview-consumer.ts');
  const { FenceCheckpointSaver } = fenceMod;
  const contain: (cp: unknown, run: (s?: AbortSignal) => Promise<unknown>) => Promise<unknown> =
    mode === 'main' && typeof fenceMod.invokeWithCheckpointContainment === 'function'
      ? fenceMod.invokeWithCheckpointContainment
      : (_cp, run) => run(undefined);
  if (mode === 'main' && typeof fenceMod.invokeWithCheckpointContainment !== 'function')
    console.error('NOTE invokeWithCheckpointContainment 不存在（修前形）→ 主路径退化为直接 invoke');
  // 不注册 unhandledRejection handler：依赖 Node 默认（外溢=立即崩=子进程 EXIT≠0），M-10 走到即证 0 外溢。
  const fence = { owner: 'u-proof', interviewId: 'i-proof', leaseOwner: 'w-proof', version: 1 };
  const jobs = Array.from({ length: INFLIGHT }, (_, i) => {
    const inner = new FaultySaver(faultOf(i));
    const cp = new FenceCheckpointSaver(inner, fakePool, { ...fence, interviewId: `i-${i}` });
    const visits: Record<string, number> = {};
    const g = buildGraph(cp, visits);
    const cfg = { configurable: { ['thread_id']: `t-${i}` } };
    const run = mode === 'raw'
      ? g.invoke({ steps: [] }, cfg)
      : contain(cp, (signal) => g.invoke({ steps: [] }, signal ? { ...cfg, signal } : cfg));
    return { i, fault: faultOf(i), inner, cp, visits, cfg, run: (run as Promise<unknown>).then(
      (v) => ({ ok: true as const, v }), (e: unknown) => ({ ok: false as const, e })) };
  });
  const results = await Promise.all(jobs.map((j) => j.run));
  // 再给事件循环两拍：迟到 rejection（若有）必须在此窗口内显形（Node 默认=崩）。
  await new Promise((r) => setTimeout(r, 200));
  let fail = 0;
  const A = (n: string, c: boolean, extra = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${extra ? `  [${extra}]` : ''}`); if (!c) fail++; };
  A(`M-1 ${INFLIGHT} 个并发 job 全部 settle（进程存活）`, results.length === INFLIGHT);
  for (const j of jobs) {
    const r = results[j.i]!;
    if (j.fault === 'none') {
      const steps = (r.ok ? (r.v as { steps: string[] }).steps : []) ?? [];
      A(`M-2 job${j.i} 健康 → 跑完 a,b,c`, r.ok && steps.join(',') === 'a,b,c', r.ok ? steps.join(',') : String((r as any).e?.message));
    } else {
      const e = r.ok ? undefined : (r as { e: any }).e;
      const code = e?.code as string | undefined;
      if (j.fault === 'fenced') {
        A(`M-3 job${j.i} fenced → 原码 42501 上抛`, !r.ok && code === '42501' && e?.message === 'checkpoint_privacy_fenced', `code=${code}`);
        A(`M-3c job${j.i} 分类=确定性终态（非 transient）`, !consumer.isTransientInterviewJobError(code));
      } else {
        A(`M-4 job${j.i} terminated → checkpoint_connection_lost（cause 保原错）`,
          !r.ok && code === 'checkpoint_connection_lost' && e?.cause?.message === 'Connection terminated', `code=${code}`);
        A(`M-4c job${j.i} 分类=transient（requeue 重试）`, consumer.isTransientInterviewJobError(code));
      }
      A(`M-5 job${j.i} 锁存后内层零续写（失败那次之后不再写）`, j.inner.writesStartedAfterFault === 0, `afterFault=${j.inner.writesStartedAfterFault} innerWrites=${j.inner.writeCount}`);
      A(`M-6 job${j.i} abort 生效：故障后不进入节点 c`, (j.visits['c'] ?? 0) === 0, JSON.stringify(j.visits));
      let readErr: any;
      try { await j.cp.getTuple(j.cfg); } catch (er) { readErr = er; }
      A(`M-7 job${j.i} 锁存后读缝 getTuple 抛同一错（getState 不读到半截态）`, readErr === e);
    }
  }
  // 重试臂：terminated job 在新 claim（新 FenceCheckpointSaver·内层已「重连」）上从最后 checkpoint 续跑到终点。
  const t = jobs.find((j) => j.fault === 'terminated')!;
  t.inner.armed = false;
  const cp2 = new FenceCheckpointSaver(t.inner, fakePool, { ...fence, interviewId: `i-${t.i}`, version: 2 });
  const visits2: Record<string, number> = {};
  const g2 = buildGraph(cp2, visits2);
  const out = await contain(cp2, (signal) => g2.invoke(null, signal ? { ...t.cfg, signal } : t.cfg)) as { steps: string[] };
  A('M-8 重试臂：requeue 后新 claim 从最后 checkpoint 续跑到终点', out?.steps?.join(',') === 'a,b,c' && (visits2['c'] ?? 0) === 1, `steps=${out?.steps?.join(',')} visits=${JSON.stringify(visits2)}`);
  // 作用域外直调语义零变（graph-fence-write 面1/面3 既有契约）：原样上抛。
  const direct = new FenceCheckpointSaver(new FaultySaver('fenced', 1), fakePool, fence);
  let directErr: any;
  const ck = Object.fromEntries([['v', 4], ['id', '00000000-0000-4000-8000-000000000001'], ['ts', new Date().toISOString()], ['channel_values', {}], ['channel_versions', {}], ['versions_seen', {}]]) as unknown as Checkpoint;
  try { await direct.put({ configurable: { ['thread_id']: 'direct' } }, ck, { source: 'loop', step: 1, parents: {} } as unknown as CheckpointMetadata, {}); } catch (er) { directErr = er; }
  A('M-9 作用域外直调 put 原样上抛（既有契约零变）', directErr?.code === '42501');
  A('M-10 0 个 unhandledRejection（走到此行=进程未被 Node 默认行为杀死）', true);
  console.log(fail === 0 ? `CHILD_MAIN_OK` : `CHILD_MAIN_FAIL ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
}


/** 两条写缝都已进入 guardedWrite 后，按握手先抛 first、待其锁存再抛 second，返回最终锁存错。 */
async function latchConcurrent(first: unknown, second: unknown): Promise<{ ok: boolean; error: unknown }> {
  const fenceMod: typeof import('../src/checkpoint-fence.ts') = await import('../src/checkpoint-fence.ts');
  const fenceSaverCtor = fenceMod.FenceCheckpointSaver;
  let resolveSecondEntered!: () => void;
  const secondEntered = new Promise<void>((r) => { resolveSecondEntered = r; });
  class HandshakeSaver extends MemorySaver {
    override async put(..._args: Parameters<MemorySaver['put']>): ReturnType<MemorySaver['put']> {
      await secondEntered;
      throw first;
    }
    override async putWrites(..._args: Parameters<MemorySaver['putWrites']>): ReturnType<MemorySaver['putWrites']> {
      resolveSecondEntered();
      const start = Date.now();
      // 等 first 已被锁存（不能在 latch 前进第二刀，否则测不到「覆盖」路径）。
      while (cp.writeFailure === undefined) {
        if (Date.now() - start > 2000) throw new Error('latchConcurrent timeout waiting for first latch');
        await new Promise((r) => setTimeout(r, 1));
      }
      throw second;
    }
  }
  const fence = { owner: 'u-latch', interviewId: 'i-latch', leaseOwner: 'w-latch', version: 1 };
  const inner = new HandshakeSaver();
  const cp = new fenceSaverCtor(inner, fakePool, fence);
  const cfg = { configurable: { ['thread_id']: 't-latch' } };
  const ck = Object.fromEntries([['v', 4], ['id', '00000000-0000-4000-8000-000000000002'], ['ts', new Date().toISOString()], ['channel_values', {}], ['channel_versions', {}], ['versions_seen', {}]]) as unknown as Checkpoint;
  const meta = { source: 'loop', step: 1, parents: {} } as unknown as CheckpointMetadata;
  try {
    await fenceMod.invokeWithCheckpointContainment(cp, async (): Promise<void> => {
      await Promise.all([
        cp.put(cfg, ck, meta, {}),
        cp.putWrites(cfg, [], 'task-latch'),
      ]);
    });
    return { ok: true, error: cp.writeFailure };
  } catch (e) {
    return { ok: false, error: e };
  }
}

function assignCode(message: string, code: string): Error {
  return Object.assign(new Error(message), { code });
}

async function latchPriorityArm(A: (n: string, c: boolean, extra?: string) => void): Promise<void> {
  const fenceMod: typeof import('../src/checkpoint-fence.ts') = await import('../src/checkpoint-fence.ts');
  const consumer = await import('../src/interview-consumer.ts');
  const isLatchRetryable = fenceMod.isRetryableCheckpointLatchError;
  A('L-sync isRetryableCheckpointLatchError 已导出', typeof isLatchRetryable === 'function');
  if (typeof isLatchRetryable === 'function') {
    let syncOk = true;
    const codes = [
      ...consumer.TRANSIENT_INTERVIEW_JOB_ERROR_CODES,
      '42501', 'checkpoint_privacy_fenced', '23514', '08006', '08001', 'some_terminal_code',
    ];
    for (const code of codes) {
      const a = isLatchRetryable({ code });
      const b = consumer.isTransientInterviewJobError(code);
      if (a !== b) { syncOk = false; A(`L-sync 码 ${code} 锁存口径≠consumer`, false, `latch=${a} consumer=${b}`); }
    }
    const noCode = isLatchRetryable(new Error('Connection terminated')) === false
      && consumer.isTransientInterviewJobError(undefined) === false;
    A('L-sync 瞬时白名单 ∪ 08* ∪ 42501 等与 isTransientInterviewJobError 对拍', syncOk && noCode);
  }

  const r1 = await latchConcurrent(makeTerminated(), makeFenced());
  const c1 = latchErrCode(r1.error);
  A('L-1 先可重试（Connection terminated）后 42501 → 最终 42501',
    !r1.ok && c1 === '42501' && latchErrMessage(r1.error) === 'checkpoint_privacy_fenced', `ok=${r1.ok} code=${c1}`);
  A('L-1c 最终分类=不可重试（确定性终态，非 transient）',
    !r1.ok && c1 === '42501' && !consumer.isTransientInterviewJobError(c1));

  const r2 = await latchConcurrent(makeFenced(), makeTerminated());
  const c2 = latchErrCode(r2.error);
  A('L-2 先 42501 后可重试 → 保持 42501（不可降级）', !r2.ok && c2 === '42501', `code=${c2}`);

  const r3 = await latchConcurrent(makeTerminated(), assignCode('graph_fence_lost', 'graph_fence_lost'));
  const c3 = latchErrCode(r3.error);
  A('L-3 先 connection_lost 后 graph_fence_lost（同级可重试）→ 仍首个 checkpoint_connection_lost',
    !r3.ok && c3 === 'checkpoint_connection_lost' && latchErrCauseMessage(r3.error) === 'Connection terminated', `code=${c3}`);

  const r4 = await latchConcurrent(makeTerminated(), assignCode('checkpoint_privacy_fenced', 'checkpoint_privacy_fenced'));
  const c4 = latchErrCode(r4.error);
  A('L-4 先可重试后 checkpoint_privacy_fenced（其他不可重试码）→ 覆盖为该码',
    !r4.ok && c4 === 'checkpoint_privacy_fenced' && !consumer.isTransientInterviewJobError(c4), `code=${c4}`);

  const r5 = await latchConcurrent(makeTerminated(), assignCode('check_violation', '23514'));
  const c5 = latchErrCode(r5.error);
  A('L-5 先可重试后 23514（其他不可重试码）→ 覆盖为 23514',
    !r5.ok && c5 === '23514' && !consumer.isTransientInterviewJobError(c5), `code=${c5}`);

  const r6 = await latchConcurrent(assignCode('connection_failure', '08006'), makeFenced());
  const c6 = latchErrCode(r6.error);
  A('L-6 先 08006（08 族可重试）后 42501 → 覆盖为 42501',
    !r6.ok && c6 === '42501' && !consumer.isTransientInterviewJobError(c6), `code=${c6}`);
}

async function parent(): Promise<void> {
  let fail = 0;
  const A = (n: string, c: boolean, extra = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${extra ? `  [${extra}]` : ''}`); if (!c) fail++; };
  const self = fileURLToPath(import.meta.url);
  const runChild = (mode: string) => spawnSync(process.execPath, [...process.execArgv, self, `--child=${mode}`], {
    encoding: 'utf8', timeout: 60_000,
    // 钉死 Node 默认 unhandledRejection=throw（防外部 NODE_OPTIONS=--unhandled-rejections=warn 假绿）。
    env: { ...process.env, ['NODE_OPTIONS']: `${process.env.NODE_OPTIONS ?? ''} --unhandled-rejections=throw`.trim() },
  });
  // 反证臂：修前形（直接 invoke）在 16 inflight 注入下必须崩。
  const raw = runChild('raw');
  A('R-1 反证：直接 invoke（修前形）子进程非零退出', raw.status !== 0, `status=${raw.status} signal=${raw.signal}`);
  A('R-2 反证：崩溃原因=注入的 checkpoint 写错（fenced 或 Connection terminated）外溢',
    /checkpoint_privacy_fenced|Connection terminated/.test(raw.stderr ?? ''), (raw.stderr ?? '').split('\n').find((l) => /fenced|terminated/.test(l)) ?? '');
  const main = runChild('main');
  process.stdout.write(main.stdout ?? '');
  if (main.status !== 0) process.stderr.write((main.stderr ?? '').slice(0, 4000));
  A('M-0 主路径（invokeWithCheckpointContainment）子进程 EXIT 0', main.status === 0 && /CHILD_MAIN_OK/.test(main.stdout ?? ''), `status=${main.status}`);
  // 锁存优先级（#247 N-1）：父进程即可，不依赖 unhandledRejection。
  await latchPriorityArm(A);
  // 静态接线锚：生产四个 invoke 缝都走收容函数。
  const life = readFileSync(fileURLToPath(new URL('../src/adaptive-lifecycle.ts', import.meta.url)), 'utf8');
  const bare = (life.match(/await g\.invoke\(/g) ?? []).length;
  const wired = (life.match(/invokeWithCheckpointContainment\(d\.cp,/g) ?? []).length;
  A('S-1 adaptive-lifecycle 零裸 await g.invoke(', bare === 0, `bare=${bare}`);
  A('S-2 adaptive-lifecycle 4 处 invoke 缝经 invokeWithCheckpointContainment', wired === 4, `wired=${wired}`);
  console.log(fail === 0 ? 'WORKER-INFLIGHT-CRASH-01 PASS' : `WORKER-INFLIGHT-CRASH-01 FAIL (${fail})`);
  process.exit(fail === 0 ? 0 : 1);
}

const childArg = process.argv.find((a) => a.startsWith('--child='));
if (childArg) await child(childArg.slice('--child='.length) as 'raw' | 'main');
else await parent();
