/** GRAPH-FENCE 写世代围栏 proof：checkpoint 写缝拦截四面臂确定性纪实。
 *  蓝本=ai-docs/delivery/harness/graph-fence-REQUEST.md §1-修法 rev2 定稿（写缝拦截形）。
 *  门=唯三谓词（lease_owner/version/lease_expires_at·沿 assertInterviewGraphFence 复用零改）；
 *  checkpoint.id 不参与放行判定（仅世代基点记录+本 proof 断言区分新旧世代落行）。
 *  面1 接管失守拦截（主红面）：旧 worker 持 standing lease→隔离库确定性 UPDATE 强制旧 lease 过期
 *  （LEASE_SECONDS 系模块级 const 不可注入·禁 sleep 真等）→新 worker withInterviewGraphFence 接管
 *  （version+1 材料化新世代头）→旧 worker 包装 saver put→断言抛 graph_fence_lost+checkpoint 落库
 *  行数零增（旧世代写未落·新世代头未被覆盖）。
 *  面2 现行放行正对照（证零过拦）+直通完备臂：fence 现行→put/putWrites 透传落库与裸内层等价；
 *  getTuple/list/deleteThread/end/setup/serde 直通断言=透传完备性行为级证据（显式枚举形）。
 *  面3 失守谓词逐项：lease 过期/owner 错/version 错三失守项逐一抛 graph_fence_lost（对准三谓词
 *  ·每项先证现行放行正对照=门有牙且不过拦）。
 *  面4 全链层级臂：包装 cp 注入 start/submit 全链——现行臂 start 直通（投影在案）；失守臂断言
 *  写缝先拒（graph_fence_lost 于 invoke 内）先于投影侧 requireCurrentFence（投影 ledger 零行+
 *  checkpoint 头不动=图未完成投影未及运行）+TRANSIENT_INTERVIEW_JOB_ERROR_CODES.has 亲证（既有
 *  分类器零新增）。残余窗口如实披露：assert→INSERT check-then-act 毫秒级残缝（Ban 面内不可再
 *  收窄·每 takeover 至多在飞 ~5 superstep 拍）——本 proof 不声称闭合，只证拦截面生效。
 *  构造期拒 fail-closed 臂：fence/pool/inner 缺失即构造抛（禁投影侧短路放行形入写缝门）。
 *  脚本模型(CI)；MemorySaver 底座；真实 PG 隔离库（ai_graph_run fence 面+全链投影面）；
 *  固定 UUID 入参纪律。pnpm graph-fence-write:prove */
import { fileURLToPath } from 'node:url';
import { MemorySaver, type Checkpoint, type CheckpointMetadata } from '@langchain/langgraph';
import {
  answerHash, asPrincipal, claimInterviewAnswer, createPool, loadMigrations, reserveEntitlement,
  runMigrations, withInterviewGraphFence, type InterviewGraphFence,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { startAdaptiveInterview, submitAdaptiveAnswer, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';
import { FenceCheckpointSaver } from '../src/checkpoint-fence.ts';
import { TRANSIENT_INTERVIEW_JOB_ERROR_CODES } from '../src/interview-consumer.ts';

// Test-only HMAC key for job route input hashing (same pattern as adaptive-legacy-checkpoint.proof.ts; not production).
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'graph-fence-write-job-route-input-hmac-proof-key-not-production-1';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean, extra = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${extra ? `  [${extra}]` : ''}`); if (!c) fail++; };
const OWNER = 'graph-fence-write';
const GRAPH_NAME = 'adaptive-interview'; // 与 interview-graph-lease.ts 模块常量同源字面（db/src 零改边界）。
const OLD_LEASE = 'gf-old-worker';
const NEW_LEASE = 'gf-new-worker';
/** 固定 UUID 入参纪律（禁 randomUUID 两遍异值假红）。 */
const FACE4_ANSWER_ID = '6f6c0001-0000-4000-8000-00000000f001';
const FACE4_ANSWER = '我用令牌桶限流+幂等键去重扛突发，超阈快速失败保住核心下单链路，降级非核心推荐';

type Row = Record<string, unknown>;
type SaverStore = { storage: Record<string, Record<string, Record<string, unknown[]>>>; writes: Record<string, Record<string, unknown[]>> };

/** 直写用最小 Checkpoint 构造器（id 世代可区分供断言·不参与放行判定；键名随 Checkpoint 契约面）。 */
let ckptSeq = 0;
const mkCheckpoint = (tag: string): Checkpoint => {
  const fields: Record<string, unknown> = {};
  fields['v'] = 4;
  fields['id'] = `6f6c0000-0000-4000-8000-${String(++ckptSeq).padStart(12, '0')}`;
  fields['ts'] = new Date().toISOString();
  fields['channel_values'] = { tag };
  fields['channel_versions'] = { tag: 1 };
  fields['versions_seen'] = {};
  return fields as unknown as Checkpoint;
};
const meta = { source: 'loop', step: 1, writes: null, parents: {} } as unknown as CheckpointMetadata;
const cfgOf = (threadId: string) => ({ configurable: { ['thread_id']: threadId } });

/** 内层落库行数（storage 命名空间键计数·确定性零时钟依赖）。 */
const innerCount = (saver: MemorySaver, threadId: string): number => {
  const namespaces = (saver as unknown as SaverStore).storage[threadId];
  return Object.keys(namespaces?.[''] ?? {}).length;
};
const headId = async (saver: MemorySaver, threadId: string): Promise<string | undefined> =>
  (await saver.getTuple(cfgOf(threadId)))?.checkpoint.id;

/** 隔离库确定性 fence 状态操作（proof 专用·仅行级 UPDATE 零 schema 零迁移·沿 asPrincipal RLS 纪律）。 */
const forgeLease = async (iid: string, leaseOwner: string, minutesAhead: number) => {
  await asPrincipal(pool, OWNER, (c) => c.query(
    `UPDATE ai_graph_run SET status='active', lease_owner=$4,
       lease_expires_at=now()+($5||' minutes')::interval
       WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3`,
    [GRAPH_NAME, iid, OWNER, leaseOwner, String(minutesAhead)],
  ));
};
const forceExpire = async (iid: string) => {
  await asPrincipal(pool, OWNER, (c) => c.query(
    `UPDATE ai_graph_run SET lease_expires_at=now()-interval '1 second'
       WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3`,
    [GRAPH_NAME, iid, OWNER],
  ));
};
const fenceRow = async (iid: string): Promise<Row | undefined> => (await asPrincipal(pool, OWNER, (c) => c.query(
  'SELECT version, lease_owner, lease_expires_at FROM ai_graph_run WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3',
  [GRAPH_NAME, iid, OWNER],
))).rows[0] as Row | undefined;

/** 确定性脚本模型：planner 满三条+ask 放行（ag16-legacy 同族形）。 */
const scriptedModel = (): ModelClient => scriptedModelClient({
  ['planner.competencies']: () => ({ ok: true, raw: { competencies: ['限流', '幂等'] } }),
  ['interviewer.ask']: () => ({ ok: true, raw: { q: '结合你的限流经历聊聊突发流量下怎么保住核心链路，并说明验证方法', refs: [] } }),
  ['mock-interview.evaluate']: () => ({ ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } }),
});

const seedInterview = async (iid: string) => {
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [iid, OWNER]);
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, iid, 'mock_interview', 1.0));
};

/** lifecycle deps 组装（fence 在场=与 consumer 装配同形·cp 可为围栏 façade）。 */
const lifecycleDeps = (cp: MemorySaver | FenceCheckpointSaver, iid: string, model: ModelClient, fence: InterviewGraphFence): AdaptiveLifecycleDeps => ({
  pool, cp, owner: OWNER, interviewId: iid, model, fence,
  localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }], webExplore: async () => [],
});

const eventCount = async (iid: string): Promise<number> => {
  const r = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
    'SELECT count(*)::int n FROM interview_event WHERE stream_key=$1', [iid],
  ));
  return Number(r.rows[0]?.n ?? -1);
};
const questionCount = async (iid: string): Promise<number> => {
  const r = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
    'SELECT count(*)::int n FROM interview_question WHERE interview_id=$1', [iid],
  ));
  return Number(r.rows[0]?.n ?? -1);
};

/** err.code 读取（Object.assign code 惯例形）。 */
const codeOf = (e: unknown): string => (e instanceof Error ? String((e as { code?: unknown }).code ?? '') : '');

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',60.0, now()+interval '300 days')", [OWNER]);

  // unhandledRejection 记录式（非立即退出）：装版 1.4.7 写缝 put 系 detached-tracked promise
  // （loop.js _trackCheckpointerPromise 再抛形·invoke 结束经 finally Promise.all(checkpointerPromises)
  // 重throw→invoke 拒）——失守臂的拒斥在 interim 会经 unhandledRejection 面暴露一次。收口断言
  // 「记录面全部为 graph_fence_lost」=非预期面即红（沿 ag16 纪律·只对预期面放行）。
  const unhandled: unknown[] = [];
  process.on('unhandledRejection', (reason: unknown) => {
    unhandled.push(reason);
    console.error('⚠ unhandledRejection(记录)', reason instanceof Error ? reason.stack : reason);
  });

  // ══════════ 构造期拒 fail-closed 臂（fence/pool/inner 缺失即拒·短路放行形禁入写缝门） ══════════
  console.log('\n──── 面0 构造期拒 fail-closed：fence/pool/inner 缺失即构造抛 ────');
  const probeFence: InterviewGraphFence = { owner: OWNER, interviewId: 'gf-probe', leaseOwner: OLD_LEASE, version: 1 };
  const probeInner = new MemorySaver();
  let ctorMissed = 0;
  try { new FenceCheckpointSaver(probeInner, pool, undefined as unknown as InterviewGraphFence); ctorMissed += 1; } catch (e) { A('面0 fence 缺失=构造期拒(checkpoint_fence_required)', codeOf(e) === 'checkpoint_fence_required', codeOf(e)); }
  try { new FenceCheckpointSaver(probeInner, pool, { ...probeFence, leaseOwner: '' }); ctorMissed += 1; } catch (e) { A('面0 fence 残缺(空 leaseOwner)=构造期拒', codeOf(e) === 'checkpoint_fence_required', codeOf(e)); }
  try { new FenceCheckpointSaver(probeInner, null as unknown as typeof pool, probeFence); ctorMissed += 1; } catch (e) { A('面0 pool 缺失=构造期拒(checkpoint_fence_pool_required)', codeOf(e) === 'checkpoint_fence_pool_required', codeOf(e)); }
  try { new FenceCheckpointSaver(null as unknown as MemorySaver, pool, probeFence); ctorMissed += 1; } catch (e) { A('面0 inner 缺失=构造期拒(checkpoint_fence_inner_required)', codeOf(e) === 'checkpoint_fence_inner_required', codeOf(e)); }
  A('面0 四臂全拒（零构造成功）', ctorMissed === 0);

  // ══════════ 面1 接管失守拦截（主红面）：强制过期→接管 version+1 材料化→旧世代写拒 ══════════
  console.log('\n──── 面1 接管失守拦截：确定性 UPDATE 强制旧 lease 过期→新 worker 接管→旧 put 拒 ────');
  const iid1 = `gf-face1-${Date.now()}`;
  await seedInterview(iid1);
  const r1 = await withInterviewGraphFence(pool, OWNER, iid1, `${OLD_LEASE}:job1`, async (f) => f);
  if (!r1.acquired) throw new Error('gf_face1_fence_unavailable');
  A('面1 前置:旧 worker 取得 fence(v1)', r1.value.version === 1);
  const fence1 = r1.value;
  const inner1 = new MemorySaver();
  const staleSaver = new FenceCheckpointSaver(inner1, pool, fence1);
  // standing lease 修形（fence callback 退出即 finally 释放=owner NULL；proof 以行级 UPDATE 复原
  // 「旧 worker 持 lease 在飞」窗②形态——确定性零时钟依赖零长眠）。
  await forgeLease(iid1, `${OLD_LEASE}:job1`, 100);
  const ckptOld = mkCheckpoint('old-gen');
  await staleSaver.put(cfgOf(iid1), ckptOld, meta, { tag: 1 });
  A('面1 standing lease 正对照:现行三谓词全真→旧世代 put 放行落库', await headId(inner1, iid1) === ckptOld.id && innerCount(inner1, iid1) === 1);
  await forceExpire(iid1);
  const takeover = await withInterviewGraphFence(pool, OWNER, iid1, `${NEW_LEASE}:job2`, async (f2) => {
    // 新 worker（合法世代）材料化新世代 checkpoint 头（新 worker 自身写零门禁）。
    const ckptNew = mkCheckpoint('new-gen');
    await inner1.put(cfgOf(iid1), ckptNew, meta);
    return { fence: f2, head: ckptNew.id };
  });
  if (!takeover.acquired) throw new Error('gf_face1_takeover_unavailable');
  A('面1 接管:过期门(:40 判据)放行→version+1 材料化(v2)+新世代头落库',
    takeover.value.fence.version === 2 && (await headId(inner1, iid1)) === takeover.value.head);
  await forgeLease(iid1, `${NEW_LEASE}:job2`, 100);
  const countBeforeStale = innerCount(inner1, iid1);
  const ckptStale = mkCheckpoint('stale-gen');
  let staleErr: unknown = null;
  try { await staleSaver.put(cfgOf(iid1), ckptStale, meta, { tag: 1 }); } catch (e) { staleErr = e; }
  A('面1 旧世代写拒:接管后旧 wrapper put 抛 graph_fence_lost', codeOf(staleErr) === 'graph_fence_lost', codeOf(staleErr));
  A('面1 旧世代写未落:checkpoint 落库行数零增+新世代头未被覆盖',
    innerCount(inner1, iid1) === countBeforeStale && (await headId(inner1, iid1)) === takeover.value.head);
  let staleWritesErr: unknown = null;
  try { await staleSaver.putWrites(cfgOf(iid1), [['tag', 'stale-write']], 'gf-stale-task'); } catch (e) { staleWritesErr = e; }
  A('面1 putWrites 缝同门:旧世代 putWrites 抛 graph_fence_lost（三谓词即全部判据·config checkpoint_id 不参与放行判定）',
    codeOf(staleWritesErr) === 'graph_fence_lost'
    && Object.keys((inner1 as unknown as SaverStore).writes).every((k) => !k.includes(iid1)));

  // ══════════ 面2 现行放行正对照（证零过拦）+直通完备臂（显式枚举形） ══════════
  console.log('\n──── 面2 现行放行正对照：put/putWrites 透传落库+getTuple/list/deleteThread/end/setup/serde 直通 ────');
  const iid2 = `gf-face2-${Date.now()}`;
  await seedInterview(iid2);
  const inner2 = new MemorySaver();
  const face2 = await withInterviewGraphFence(pool, OWNER, iid2, 'gf-face2-worker', async (fence) => {
    const saver = new FenceCheckpointSaver(inner2, pool, fence);
    const ckpt = mkCheckpoint('face2-gen');
    const putCfg = await saver.put(cfgOf(iid2), ckpt, meta, { tag: 1 });
    A('面2 put 透传落库:与裸 MemorySaver 行为等价（头 id+行数）',
      (await headId(inner2, iid2)) === ckpt.id && innerCount(inner2, iid2) === 1
      && String(putCfg.configurable?.['thread_id']) === iid2);
    await saver.putWrites(
      { configurable: { ['thread_id']: iid2, ['checkpoint_ns']: '', ['checkpoint_id']: ckpt.id } },
      [['tag', 'face2-write']], 'gf-face2-task',
    );
    const writeKeys = Object.keys((inner2 as unknown as SaverStore).writes).filter((k) => k.includes(iid2));
    A('面2 putWrites 透传落库:内层 writes 形可见（写缝门零读 checkpoint_id·仅 MemorySaver 自身寻址需之）',
      writeKeys.length >= 1 && writeKeys.some((k) => k.includes(ckpt.id)));
    const tuple = await saver.getTuple(cfgOf(iid2));
    A('面2 getTuple 直通:tuple 同指内层头 checkpoint', tuple?.checkpoint.id === ckpt.id);
    const listedWrapper: string[] = [];
    for await (const t of saver.list(cfgOf(iid2))) listedWrapper.push(t.checkpoint.id);
    const listedInner: string[] = [];
    for await (const t of inner2.list(cfgOf(iid2))) listedInner.push(t.checkpoint.id);
    A('面2 list 直通(实名 AsyncGenerator):枚举序列与内层恒等', JSON.stringify(listedWrapper) === JSON.stringify(listedInner) && listedWrapper.length === 1);
    A('面2 serde 委托:序列化协议面与内层恒等同源', saver.serde === inner2.serde);
    await saver.deleteThread(iid2);
    A('面2 deleteThread 直通:删后内层头空', (await saver.getTuple(cfgOf(iid2))) === undefined && innerCount(inner2, iid2) === 0);
    return fence;
  });
  A('面2 fence callback 全程现行:零误拒零放行漂移', face2.acquired === true);

  const innerEnd = new MemorySaver() as MemorySaver & { end: () => Promise<void>; setup: () => Promise<void> };
  let endCalls = 0; let setupCalls = 0;
  (innerEnd as { end: () => Promise<void> }).end = async () => { endCalls += 1; };
  (innerEnd as { setup: () => Promise<void> }).setup = async () => { setupCalls += 1; };
  const endSaver = new FenceCheckpointSaver(innerEnd, pool, { owner: OWNER, interviewId: 'gf-end-probe', leaseOwner: 'gf-end-worker', version: 1 });
  await endSaver.end(); await endSaver.setup();
  A('面2 end/setup 有则绑内层:调用透传至内层（façade 同族先例形）', endCalls === 1 && setupCalls === 1);
  const bareEndSaver = new FenceCheckpointSaver(inner2, pool, { owner: OWNER, interviewId: 'gf-end-probe2', leaseOwner: 'gf-end-worker', version: 1 });
  let endBareErr: unknown = null;
  try { await bareEndSaver.end(); await bareEndSaver.setup(); } catch (e) { endBareErr = e; }
  A('面2 end/setup 无则零触:MemorySaver 底座直通臂零抛', endBareErr === null);

  // ══════════ 面3 失守谓词逐项：lease 过期/owner 错/version 错（对准三谓词·每项带现行正对照） ══════════
  console.log('\n──── 面3 失守谓词逐项：三谓词各一臂·先证现行放行再证单项失守 ────');
  const predicateArm = async (label: string, mutate: (iid: string) => Promise<void>) => {
    const iid = `gf-face3-${label}-${Date.now()}`;
    await seedInterview(iid);
    const inner = new MemorySaver();
    const acquired = await withInterviewGraphFence(pool, OWNER, iid, 'gf-face3-worker', async (fence) => {
      const saver = new FenceCheckpointSaver(inner, pool, fence);
      const before = mkCheckpoint(`face3-${label}-pass`);
      await saver.put(cfgOf(iid), before, meta, { tag: 1 });
      return { fence, count: innerCount(inner, iid) };
    });
    if (!acquired.acquired) throw new Error(`gf_face3_${label}_fence_unavailable`);
    A(`面3 ${label} 现行正对照:put 放行落库`, acquired.value.count === 1);
    const fence = acquired.value.fence as InterviewGraphFence;
    await forgeLease(iid, 'gf-face3-worker', 100);
    const saver = new FenceCheckpointSaver(inner, pool, fence);
    const control = mkCheckpoint(`face3-${label}-control`);
    await saver.put(cfgOf(iid), control, meta, { tag: 1 });
    A(`面3 ${label} standing lease 复原正对照:forge 后仍放行`, (await headId(inner, iid)) === control.id);
    await mutate(iid);
    let err: unknown = null;
    try { await saver.put(cfgOf(iid), mkCheckpoint(`face3-${label}-deny`), meta, { tag: 1 }); } catch (e) { err = e; }
    const count = innerCount(inner, iid);
    A(`面3 ${label} 失守:抛 graph_fence_lost+落库零增`, codeOf(err) === 'graph_fence_lost' && count === 2, `${codeOf(err)} count=${count}`);
  };
  await predicateArm('lease过期', async (iid) => { await forceExpire(iid); });
  await predicateArm('owner错', async (iid) => { await asPrincipal(pool, OWNER, (c) => c.query('UPDATE ai_graph_run SET lease_owner=$4 WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3', [GRAPH_NAME, iid, OWNER, 'gf-face3-other-worker'])); });
  await predicateArm('version错', async (iid) => { await asPrincipal(pool, OWNER, (c) => c.query('UPDATE ai_graph_run SET version=version+1 WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3', [GRAPH_NAME, iid, OWNER])); });
  const liveRow = await fenceRow(iid1);
  A('面3 表结构在案:ai_graph_run 行含 version/lease_owner/lease_expires_at 三列（assertInterviewGraphFence 三谓词面）',
    liveRow !== undefined && 'version' in liveRow && 'lease_owner' in liveRow && 'lease_expires_at' in liveRow);

  // ══════════ 面4 全链层级臂：包装 cp 注入 start/submit 全链（现行直通 vs 失守写缝先拒） ══════════
  console.log('\n──── 面4 全链层级：现行臂 start 直通投影在案；失守臂写缝先拒（ledger 零行+头不动） ────');
  const iid4 = `gf-face4-${Date.now()}`;
  await seedInterview(iid4);
  const inner4 = new MemorySaver();
  let staleDeps: AdaptiveLifecycleDeps | null = null;
  const startResult = await withInterviewGraphFence(pool, OWNER, iid4, 'gf-face4-old', async (fence) => {
    const cp = new FenceCheckpointSaver(inner4, pool, fence);
    const deps = lifecycleDeps(cp, iid4, scriptedModel(), fence);
    staleDeps = deps;
    return startAdaptiveInterview(deps, '后端工程师', ['限流改造']);
  });
  if (!startResult.acquired) throw new Error('gf_face4_start_fence_unavailable');
  A('面4 现行臂:start 全链直通（写缝+投影侧 fence 全真）→首题在案',
    !!startResult.value.questionId && startResult.value.stateVersion === 1);
  const questionId4 = startResult.value.questionId as string;
  const eventsAfterStart = await eventCount(iid4);
  const questionsAfterStart = await questionCount(iid4);
  A('面4 现行臂投影在案:question_ready 事件+question ledger 行已提交（对照基点）',
    eventsAfterStart >= 1 && questionsAfterStart === 1);
  const input4 = {
    questionId: questionId4, stateVersion: 1, answerId: FACE4_ANSWER_ID,
    answerHash: answerHash(FACE4_ANSWER), turn: 0, answer: FACE4_ANSWER,
  };
  const claim = await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, iid4, input4));
  A('面4 answer identity 被 API/DB ledger 接受', claim.status === 'accepted');
  // 接管前置步（臂钉）:standing lease 复原→确定性 UPDATE 强制旧 lease 过期→新 worker 接管 v2。
  await forgeLease(iid4, 'gf-face4-old', 100);
  await forceExpire(iid4);
  const takeover4 = await withInterviewGraphFence(pool, OWNER, iid4, 'gf-face4-new', async (f2) => f2);
  if (!takeover4.acquired) throw new Error('gf_face4_takeover_unavailable');
  A('面4 接管:version+1 材料化（旧世代 wrapper 持 v1 失守）',
    takeover4.value.version === 2 && staleDeps !== null);
  const headBefore = await headId(inner4, iid4);
  const eventsBeforeStale = await eventCount(iid4);
  const questionsBeforeStale = await questionCount(iid4);
  let submitErr: unknown = null;
  try { await submitAdaptiveAnswer(staleDeps as unknown as AdaptiveLifecycleDeps, input4); } catch (e) { submitErr = e; }
  A('面4 失守臂:submit 全链 invoke 内写缝先拒抛 graph_fence_lost', codeOf(submitErr) === 'graph_fence_lost', codeOf(submitErr));
  A('面4 写缝先拒层级对准:checkpoint 头不动（写未落·新世代头未被旧世代覆盖）+ledger 零行（投影侧 requireCurrentFence 未及运行）',
    (await headId(inner4, iid4)) === headBefore
    && (await eventCount(iid4)) === eventsBeforeStale
    && (await questionCount(iid4)) === questionsBeforeStale);
  A('面4 既有分类器零新增:TRANSIENT_INTERVIEW_JOB_ERROR_CODES.has(graph_fence_lost)=true（requeue+退避）',
    TRANSIENT_INTERVIEW_JOB_ERROR_CODES.has('graph_fence_lost') === true);

  A('收口:unhandledRejection 记录面全部为 graph_fence_lost（装版 detached-tracked promise 预期面·非预期面即红）',
    unhandled.every((r) => codeOf(r) === 'graph_fence_lost'), `count=${unhandled.length}`);

  console.log(`\n${fail === 0 ? '✓ GRAPH-FENCE 写世代围栏:构造期拒+四面臂全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e: unknown) => { console.error('✗', e instanceof Error ? e.stack : e); process.exit(1); });
