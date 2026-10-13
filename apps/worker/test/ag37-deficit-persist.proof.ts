/** AG-37(检索 weighted-deficit 归零·持久化到图 state)prove(蓝本 ai-docs/delivery/harness/ag37-deficit-persist-REQUEST.md §2·
 *  形沿 ag-f-reroll/adaptive-flow 先例·全离线 scripted-model + 真迁移隔离 PG·零真实模型外呼 est live=0):
 *  §A DRR 选择器纯函数直证(既有 domain 函数零改动直证):6000/4000 两叶 5 题周期 [0,1,0,1,0]+deficit 值链
 *     [0,0]→[-4000,4000]→[2000,-2000]→[-2000,2000]→[4000,-4000]→[0,0] 逐位精确+配额 3:2
 *     +红面复现对照臂(现状形:每题全 0 起跑→恒偏最大权重叶·机制=旧 consumer 每 claim map(()=>0) 初始化)。
 *  §B 检索消费面真函数(assembleValidatedRetrievalPlan·worker retrieveViaDispatchTrackLocal :498-510 同点):
 *     跨轮真消费链(leafTrackId 可观察)+单叶零变+长度不配既有归一化兜底回全 0+P-FAKEPLAN/snapshot 保守面。
 *  §C 图级跨题持久化链(真图 buildAdaptiveInterviewGraph+真 seam 第 8 additive 参+真节点写位+MemorySaver
 *     checkpoint):每题独立 invoke(interrupt=claim 边界·checkpoint 跨 invoke 持久化)·localRetrieve 夹具=
 *     interview-consumer 新闭包同形镜像(seed holder.current ?? 全 0 → 真消费面 → 回写 holder);
 *     production 闭包本体由 §E 静态+r4-real-wire-impl 回归门覆盖。含 5 题整周期臂+旧 checkpoint(null)起跑
 *     兼容臂+clarify 继承臂(零 seam 零检索·deficit 原样)+legacy 臂(无 holder·通道零触+红面恒偏)。
 *  §D worker dispatch 面保守零位移(真 retrieveViaDispatchTrackLocal):route_snapshot_missing/planner_query_invalid/
 *     generation_unavailable 三降级臂 deficit 原样穿透·G-R2-5 永不 unscoped。
 *  §E 接线面静态断言(consumer seed 臂/回写·state.ts additive 位·节点第 8 参+条件写位·seam seed/出参)。
 *  pnpm prove:ag37-deficit-persist(经 scripts/run-e2e-isolated.mjs 隔离容器) */
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { MemorySaver, Command } from '@langchain/langgraph';
import {
  createPool, asPrincipal, assertIsolatedTestTarget, runMigrations, loadMigrations,
} from '@meetwise/db';
import {
  assembleValidatedRetrievalPlan, nextWeightedDeficitLeaf, planWeightedDeficitRounds,
  normalizeQuestionGenerationResult,
  type JobRouteAllocation, type QuestionGenerationResult, type ScoredRef,
} from '@meetwise/domain';
import type { ModelClient } from '@meetwise/ai-runtime';
import { buildAdaptiveInterviewGraph, createEphemeralAnswerVault } from '@meetwise/ai-graphs';
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';
import { retrieveViaDispatchTrackLocal } from '../src/qbank-track-local-retrieve.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean, detail = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${detail ? `  [${detail}]` : ''}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──── ${t} ────`);
const nonce = Date.now();

// 6000/4000 两叶快照(蓝本 §1 红事实 3 触发例子:backend 6000bps / ai_app 4000bps)。
const ALLOC: JobRouteAllocation[] = [
  { leafTrackId: 'backend', allocationBps: 6000 },
  { leafTrackId: 'ai_app', allocationBps: 4000 },
];
// DRR 值链(每轮:逐叶累加 allocationBps → argmax 并列取最小下标 → 选中叶减总权重 10000)。
const CHAIN: number[][] = [
  [0, 0], [-4000, 4000], [2000, -2000], [-2000, 2000], [4000, -4000], [0, 0],
];
const LEAVES5 = [0, 1, 0, 1, 0];
const eqArr = (a: unknown, b: number[]): boolean =>
  Array.isArray(a) && a.length === b.length && b.every((v, i) => (a as number[])[i] === v);

const snapOf = (interviewId: string) => ({ interviewId, routeDigest: `ag37-digest-${interviewId}`, allocations: ALLOC });

/** §C 夹具:interview-consumer 新闭包同形镜像(seed→真消费面→回写)+leaf 观察。
 *  zeroAlways=true=现状形(旧闭包每 claim `map(() => 0)` 起跑)红面复现。 */
function fixtureRetrieve(snapshot: ReturnType<typeof snapOf>, ref: { current: number[] | null }, leaves: number[], zeroAlways = false) {
  return async (_q: string): Promise<ScoredRef[]> => {
    const out = assembleValidatedRetrievalPlan({
      snapshot,
      // 同形镜像:interview-consumer `trackLocalDeficitRef.current ?? routeSnapForRetrieve?.allocations?.map(() => 0) ?? []`
      deficit: zeroAlways ? snapshot.allocations.map(() => 0) : (ref.current ?? snapshot.allocations.map(() => 0)),
      competencyId: '并发', difficulty: 3, generationId: `qgen-${randomUUID()}`, recipeId: `qrecipe-${randomUUID().replaceAll('-', '')}`,
    });
    if (!out.ok) throw new Error(`ag37 fixture assemble failed: ${out.reason}`);
    leaves.push(out.leafIndex);
    if (!zeroAlways) ref.current = out.deficit;
    return [{ ref: 'question:ag37:fixture', score: 0.95, evidence: '[prompt] AG-37 夹具素材' }] as ScoredRef[];
  };
}

/** §C scripted 模型:ask 恒返新题(判重零命中);evaluate 第 `clarifyOn` 次返 relevant=false 触发澄清臂。 */
function ag37Model(owner: string, clarifyOn: number | null): ModelClient {
  let askSeq = 0;
  let evalSeq = 0;
  return {
    async complete(req) {
      if (req.service === 'interviewer.ask') {
        return { ok: true, raw: { q: `${owner} 第 ${++askSeq} 轮:请围绕限流场景说明一次具体的取舍与验证方法`, refs: [] } };
      }
      if (req.service === 'mock-interview.evaluate') {
        evalSeq += 1;
        if (clarifyOn !== null && evalSeq === clarifyOn) {
          // 合法 relevant=false(v6 形:全分项 below+quote 为回答原文子串)→ classifyTurn 'clarify' 真澄清臂。
          return { ok: true, raw: { relevant: false, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'below', quote: '计数器' }] } };
        }
        // 'meets'=50 分确定性分量:非低分(≥40 不计 consecutiveLow)且 <CONF_ENOUGH(0.7)→ keep probing。
        return { ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'meets', quote: '滑动窗口' }] } };
      }
      return { ok: false, kind: 'deterministic' as const };
    },
  };
}

async function seedInterview(threadId: string, owner: string): Promise<void> {
  await asPrincipal(pool, owner, async (c) => {
    await c.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active') ON CONFLICT (id) DO NOTHING", [threadId, owner]);
  });
}

type GraphRun = {
  /** chain[i]=第 i+1 题 genQuestion 写位后的 checkpoint 值(每 invoke 独立读·跨 claim 持久化本体)。 */
  chain: (number[] | null)[];
  concluded: boolean;
  questions: number;
};

/** §C 驱动:每题一个独立 invoke(interrupt=claim 边界),interrupt 时点逐题读 cp state 位。 */
async function runGraph(
  deps: Parameters<typeof buildAdaptiveInterviewGraph>[1],
  threadId: string,
  vault: ReturnType<typeof createEphemeralAnswerVault>,
  answer: (round: number) => string,
): Promise<GraphRun> {
  const g = buildAdaptiveInterviewGraph(new MemorySaver(), deps);
  const cfg = { configurable: { thread_id: threadId } };
  const chain: (number[] | null)[] = [];
  let questions = 0;
  let concluded = false;
  let res: any = await g.invoke({}, cfg);
  let guard = 0;
  while (res?.__interrupt__) {
    if (guard++ > 24) throw new Error('ag37 graph loop guard');
    // genQuestion 写位后=interrupt(claim 边界)——此刻读 checkpoint 即该题写下的终值。
    const snap: any = await g.getState(cfg);
    chain.push((snap?.values?.weightedDeficit ?? null) as number[] | null);
    questions += 1;
    res = await g.invoke(new Command({ resume: vault.issue(answer(questions)) }), cfg);
  }
  concluded = res?.concluded === true;
  return { chain, concluded, questions };
}

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await assertIsolatedTestTarget(pool);

  /* ── §A DRR 选择器纯函数直证(既有函数零改动) ── */
  section('§A DRR 纯函数:5 题周期 [0,1,0,1,0]+deficit 值链逐位精确+配额 3:2');
  A('planWeightedDeficitRounds(6000/4000,5)=[0,1,0,1,0](既有纯函数直证)',
    JSON.stringify(planWeightedDeficitRounds(ALLOC, 5)) === JSON.stringify(LEAVES5),
    JSON.stringify(planWeightedDeficitRounds(ALLOC, 5)));
  {
    let deficit = ALLOC.map(() => 0);
    const walked: number[][] = [deficit];
    const walkedLeaves: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const step = nextWeightedDeficitLeaf(ALLOC, deficit);
      walkedLeaves.push(step.leafIndex);
      deficit = step.deficit;
      walked.push(deficit);
    }
    A('逐轮值链恰 [0,0]→[-4000,4000]→[2000,-2000]→[-2000,2000]→[4000,-4000]→[0,0](逐位精确)',
      JSON.stringify(walked) === JSON.stringify(CHAIN), JSON.stringify(walked));
    A('5 题周期末 deficit 回 [0,0](周期回零·下一周期从头收敛)', eqArr(deficit, [0, 0]));
    A('周期配额恰 3:2=allocationBps 占比(leaf0×3+leaf1×2)',
      walkedLeaves.filter((l) => l === 0).length === 3 && walkedLeaves.filter((l) => l === 1).length === 2,
      JSON.stringify(walkedLeaves));
  }
  section('§A 红面复现对照臂(现状形:每题全 0 起跑→恒偏最大权重叶)');
  {
    const redLeaves: number[] = [];
    let redDeficit: number[] | null = null;
    for (let i = 0; i < 5; i += 1) {
      const step = nextWeightedDeficitLeaf(ALLOC, ALLOC.map(() => 0));   // 旧 consumer 闭包每 claim 全 0 初始化
      redLeaves.push(step.leafIndex);
      redDeficit = step.deficit;
    }
    A('现状形 5 题恒 leaf 0(backend 6000bps·ai_app 叶零命中=issues-final :461 触发例子)',
      JSON.stringify(redLeaves) === JSON.stringify([0, 0, 0, 0, 0]), JSON.stringify(redLeaves));
    A('现状形 deficit 恒 [-4000,4000](从不收敛·按轮配额被 claim 边界切断)',
      eqArr(redDeficit, [-4000, 4000]));
  }

  /* ── §B 检索消费面真函数(assembleValidatedRetrievalPlan=worker :498-510 同点) ── */
  section('§B 检索消费面真函数:跨轮 leaf/deficit 链+兼容臂+保守面');
  {
    const snap = snapOf('ag37-b');
    let deficit: readonly number[] = snap.allocations.map(() => 0);
    const bLeaves: number[] = [];
    const bTracks: string[] = [];
    const bChain: number[][] = [[...deficit]];
    for (let i = 0; i < 5; i += 1) {
      const out = assembleValidatedRetrievalPlan({
        snapshot: snap, deficit, competencyId: '并发', difficulty: 3,
        generationId: `qgen-${randomUUID()}`, recipeId: `qrecipe-${randomUUID().replaceAll('-', '')}`,
      });
      if (!out.ok) throw new Error(`§B assemble failed: ${out.reason}`);
      bLeaves.push(out.leafIndex);
      bTracks.push(out.plan.leafTrackId);
      deficit = out.deficit;
      bChain.push([...deficit]);
    }
    A('消费面 5 轮 leaf 序列 [0,1,0,1,0](planInterviewTurn 选中叶)', JSON.stringify(bLeaves) === JSON.stringify(LEAVES5), JSON.stringify(bLeaves));
    A('消费面 leafTrackId 观察序列 backend/ai_app 交替(检索真落叶可观察)',
      JSON.stringify(bTracks) === JSON.stringify(['backend', 'ai_app', 'backend', 'ai_app', 'backend']), JSON.stringify(bTracks));
    A('消费面 deficit 值链逐位=CHAIN(六值)', JSON.stringify(bChain) === JSON.stringify(CHAIN), JSON.stringify(bChain));

    // 兼容臂①:单叶岗位(allocations 长 1)行为零变(leaf 恒 0·deficit 自洽)。
    const one: JobRouteAllocation[] = [{ leafTrackId: 'backend', allocationBps: 10000 }];
    let d1: readonly number[] = [0];
    const oneLeaves: number[] = [];
    const oneChain: number[][] = [[...d1]];
    for (let i = 0; i < 3; i += 1) {
      const out = assembleValidatedRetrievalPlan({ snapshot: { interviewId: 'ag37-b1', routeDigest: 'd1', allocations: one }, deficit: d1, competencyId: '并发', difficulty: 3, generationId: `qgen-${randomUUID()}`, recipeId: `qrecipe-${randomUUID().replaceAll('-', '')}` });
      if (!out.ok) throw new Error('§B1 assemble failed');
      oneLeaves.push(out.leafIndex); d1 = out.deficit; oneChain.push([...d1]);
    }
    A('兼容臂①:单叶岗位 leaf 恒 0·每轮步进后 deficit 自洽回 [0](10000−10000·行为零变)',
      JSON.stringify(oneLeaves) === JSON.stringify([0, 0, 0]) && JSON.stringify(oneChain) === JSON.stringify([[0], [0], [0], [0]]),
      `${JSON.stringify(oneLeaves)} ${JSON.stringify(oneChain)}`);
    // 兼容臂②:长度不配 → 既有归一化兜底回全 0(qbank-track-local-retrieval :227-230 零位移)。
    const mismatch = assembleValidatedRetrievalPlan({ snapshot: snap, deficit: [1, 2, 3], competencyId: '并发', difficulty: 3, generationId: `qgen-${randomUUID()}`, recipeId: `qrecipe-${randomUUID().replaceAll('-', '')}` });
    A('兼容臂②:deficit 长度不配 → 兜底重置全 0 起跑 leaf 0·更新 [-4000,4000](既有兜底零位移)',
      mismatch.ok && mismatch.leafIndex === 0 && eqArr(mismatch.deficit, [-4000, 4000]));
    // 保守面:P-FAKEPLAN 与 snapshot 缺失原样。
    const fake = assembleValidatedRetrievalPlan({ snapshot: snap, deficit: [0, 0], competencyId: '并发', difficulty: 3, generationId: '', recipeId: '' });   // P-FAKEPLAN 臂=空形原样
    A('保守面:无 generation/recipe → generation_or_recipe_missing(P-FAKEPLAN 原样)', !fake.ok && fake.reason === 'generation_or_recipe_missing');
    const noSnap = assembleValidatedRetrievalPlan({ snapshot: null, deficit: [0, 0], competencyId: '并发', difficulty: 3, generationId: `qgen-${randomUUID()}`, recipeId: `qrecipe-${randomUUID().replaceAll('-', '')}` });
    A('保守面:snapshot 缺失 → route_snapshot_missing(G-R2-5 永不 unscoped)', !noSnap.ok && noSnap.reason === 'route_snapshot_missing');
  }

  /* ── §C 图级跨题持久化链(真图+真 seam 第 8 参+真节点写位+MemorySaver checkpoint) ── */
  section('§C1 5 题整周期臂:跨 claim checkpoint 持久化·state 位值链逐题精确');
  {
    const owner = `ag37-c1-${nonce}`;
    const threadId = `ag37-c1-t-${nonce}`;
    await seedInterview(threadId, owner);
    const ref: { current: number[] | null } = { current: null };
    const leaves: number[] = [];
    const vault = createEphemeralAnswerVault();
    const deps = buildAdaptiveDeps({
      pool, owner, threadId, model: ag37Model(owner, null), competencies: ['并发', '缓存', '消息队列'],
      localRetrieve: fixtureRetrieve(snapOf(threadId), ref, leaves),
      webExplore: async () => [], loadAnswer: vault.loadAnswer,
      trackLocalDeficitRef: ref, absoluteMaxTurns: 5,
    });
    const run = await runGraph(deps, threadId, vault, () => '我用 Redis 计数器加滑动窗口扛高并发,阈值压测后灰度放量并复盘验证。');
    A('恰 5 题(absoluteMaxTurns=5 硬顶 safety_ceiling 收尾·每题恰一次检索)', run.questions === 5 && leaves.length === 5, `questions=${run.questions} leaves=${JSON.stringify(leaves)}`);
    A('跨题 leaf 序列 [0,1,0,1,0](下一题读上一题写下的值·不再归零)', JSON.stringify(leaves) === JSON.stringify(LEAVES5), JSON.stringify(leaves));
    A('checkpoint 值链逐题=[-4000,4000]→[2000,-2000]→[-2000,2000]→[4000,-4000]→[0,0](每 invoke 独立读 cp)',
      JSON.stringify(run.chain) === JSON.stringify(CHAIN.slice(1)), JSON.stringify(run.chain));
    A('周期末回 [0,0]+配额 3:2(整周期收敛)',
      eqArr(run.chain[4], [0, 0]) && leaves.filter((l) => l === 0).length === 3 && leaves.filter((l) => l === 1).length === 2);
    A('收尾 concluded(软预算真终场)', run.concluded === true);
  }

  section('§C2 兼容臂③:旧 checkpoint(null)起跑+clarify 重发 deficit 原样继承(零 seam 零检索)');
  {
    const owner = `ag37-c2-${nonce}`;
    const threadId = `ag37-c2-t-${nonce}`;
    await seedInterview(threadId, owner);
    const ref: { current: number[] | null } = { current: null };
    const leaves: number[] = [];
    const vault = createEphemeralAnswerVault();
    const deps = buildAdaptiveDeps({
      pool, owner, threadId, model: ag37Model(owner, 1), competencies: ['并发', '缓存', '消息队列'],
      localRetrieve: fixtureRetrieve(snapOf(threadId), ref, leaves),
      webExplore: async () => [], loadAnswer: vault.loadAnswer,
      trackLocalDeficitRef: ref, absoluteMaxTurns: 3,
    });
    const run = await runGraph(deps, threadId, vault, () => '我围绕计数器与滑动窗口做压测并灰度放量,事后复盘验证。');
    A('首题从 null(旧 checkpoint 缺省臂)全 0 起跑选中 leaf 0·写位 [-4000,4000]',
      leaves[0] === 0 && eqArr(run.chain[0], [-4000, 4000]), `leaves=${JSON.stringify(leaves)} chain=${JSON.stringify(run.chain)}`);
    A('clarify 重发(首次 relevant=false)零检索零 seam:检索仍恰 2 次(leaf 序列不推进)',
      leaves.length === 2, `leaves=${JSON.stringify(leaves)} questions=${run.questions}`);
    A('clarify 题写位缺省:通道原值继承 [-4000,4000](不归零不发明)',
      eqArr(run.chain[1], [-4000, 4000]), JSON.stringify(run.chain));
    A('clarify 后下一题读持久化 deficit 选中 leaf 1·写位 [2000,-2000]',
      leaves[1] === 1 && eqArr(run.chain[2], [2000, -2000]), JSON.stringify(run.chain));
    A('软预算 3 题收尾(含 clarify 重发·图零放大)', run.concluded === true && run.questions === 3, `questions=${run.questions}`);
  }

  section('§C3 legacy 臂(现状形):无 holder scripted deps→通道零触+红面恒偏(真图流复现)');
  {
    const owner = `ag37-c3-${nonce}`;
    const threadId = `ag37-c3-t-${nonce}`;
    await seedInterview(threadId, owner);
    const ref: { current: number[] | null } = { current: null };
    const leaves: number[] = [];
    const vault = createEphemeralAnswerVault();
    const deps = buildAdaptiveDeps({
      pool, owner, threadId, model: ag37Model(owner, null), competencies: ['并发', '缓存', '消息队列'],
      // zeroAlways=true=现状形闭包(每题全 0 起跑)·不传 trackLocalDeficitRef=旧 scripted deps 形。
      localRetrieve: fixtureRetrieve(snapOf(threadId), ref, leaves, true),
      webExplore: async () => [], loadAnswer: vault.loadAnswer,
      absoluteMaxTurns: 2,
    });
    const run = await runGraph(deps, threadId, vault, () => '我用计数器加滑动窗口限流,压测后灰度。');
    A('无 holder:state 位零触恒 null(键缺席不写·零发明零回填)',
      run.chain.every((v) => v === null), JSON.stringify(run.chain));
    A('现状形红面于真图流复现:每题全 0 起跑恒 leaf 0(=[0,0])',
      JSON.stringify(leaves) === JSON.stringify([0, 0]), JSON.stringify(leaves));
    // legacy seam 出参:无 holder → 结果不带 weightedDeficit 键 → 节点条件写位不触发(与上通道 null 同源)。
    // 独立 owner(零 episode 既有题面·零判重 re-roll 干扰)。
    const legacyOwner = `ag37-c3b-${nonce}`;
    const legacyThread = `ag37-c3b-t-${nonce}`;
    await seedInterview(legacyThread, legacyOwner);
    const legacyDeps = buildAdaptiveDeps({
      pool, owner: legacyOwner, threadId: legacyThread, model: ag37Model(legacyOwner, null), competencies: ['并发'],
      localRetrieve: async () => [{ ref: 'question:ag37:legacy', score: 0.9, evidence: '[prompt] legacy' }] as ScoredRef[],
      webExplore: async () => [],
    });
    const legacyOut: QuestionGenerationResult = normalizeQuestionGenerationResult(
      await legacyDeps.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'),
    );
    A('7 参 legacy 调用:出参键缺席(undefined)=normalize passthrough 原样·节点不写',
      legacyOut.ok === true && !('weightedDeficit' in legacyOut),
      `ok=${String((legacyOut as { ok?: boolean }).ok)} keys=${Object.keys(legacyOut).join(',')} err=${(legacyOut as { error?: string }).error ?? '-'}`);
  }

  /* ── §D worker dispatch 面保守零位移(真 retrieveViaDispatchTrackLocal) ── */
  section('§D worker dispatch 面:三降级臂 deficit 原样穿透(G-R2-5 永不 unscoped)');
  {
    const trackDeps = { embedderVersion: `ag37-prove:${nonce}`, k: 5, embed: async () => [[]], cache: {} as never };
    const snap = snapOf('ag37-d');
    const missing = await retrieveViaDispatchTrackLocal({ pool, owner: 'ag37-d-owner', snapshot: null, query: '并发 难度3', deficit: [7, 7], deps: trackDeps });
    A('缺 snapshot → route_snapshot_missing 逐字+deficit 原样穿透 [7,7]',
      missing.refs.length === 1 && missing.refs[0]!.ref === '__rag_degraded__:route_snapshot_missing' && eqArr(missing.deficit, [7, 7]));
    const badQuery = await retrieveViaDispatchTrackLocal({ pool, owner: 'ag37-d-owner', snapshot: snap, query: '只有能力词', deficit: [7, 7], deps: trackDeps });
    A('planner_query_invalid → degraded+deficit 原样穿透 [7,7](既有门语义零位移)',
      badQuery.refs.length === 1 && badQuery.refs[0]!.ref.includes('planner_query_invalid') && eqArr(badQuery.deficit, [7, 7]));
    const noGen = await retrieveViaDispatchTrackLocal({ pool, owner: 'ag37-d-owner', snapshot: snap, query: '并发 难度3', deficit: [7, 7], deps: trackDeps });
    A('隔离库无 active generation → generation_unavailable+deficit 原样穿透 [7,7](本刀零新分支)',
      noGen.refs.length === 1 && noGen.refs[0]!.ref.includes('generation_unavailable') && eqArr(noGen.deficit, [7, 7]));
  }

  /* ── §E 接线面静态断言(production 闭包本体·夹具镜像之外的真实源) ── */
  section('§E 接线面静态断言(consumer seed 臂/回写·state 位·节点条件写位·seam seed/出参)');
  {
    const here = dirname(fileURLToPath(import.meta.url));
    const workerSrc = join(here, '..', 'src');
    const graphsSrc = join(here, '..', '..', '..', 'packages', 'ai-graphs', 'src', 'adaptive-interview');
    const domainSrc = join(here, '..', '..', '..', 'packages', 'domain', 'src');
    const read = (p: string) => readFileSync(p, 'utf8');
    const consumer = read(join(workerSrc, 'interview-consumer.ts'));
    const state = read(join(graphsSrc, 'state.ts'));
    const genQ = read(join(graphsSrc, 'nodes', 'generate-question.ts'));
    const seam = read(join(workerSrc, 'adaptive-interview-service.ts'));
    const qgen = read(join(domainSrc, 'question-generation.ts'));
    A('consumer:deficit 从 holder seed 起跑(缺省臂=既有全 0 表达式字节保留)',
      /deficit: trackLocalDeficitRef\.current \?\? routeSnapForRetrieve\?\.allocations\?\.map\(\(\) => 0\) \?\? \[\]/.test(consumer));
    A('consumer:rag.retrieve 一出回写 holder(不再丢给 claim 局部量)',
      /trackLocalDeficitRef\.current = out\.deficit;/.test(consumer)
      && !/let trackLocalDeficit: number\[\] = routeSnapForRetrieve/.test(consumer));
    A('state.ts:additive 位 weightedDeficit(number[]|null·reducer (_, b) => b·default null)',
      /weightedDeficit: Annotation<number\[\] \| null>\(\{ reducer: \(_, b\) => b, default: \(\) => null \}\)/.test(state));
    A('generate-question:第 8 additive 参读 state 位+成功形条件写位(键缺席=继承不写)',
      /retrieveAndGenerate\(route\.competency, route\.difficulty, 0, turn, \[\], effectiveKind, asked, state\.weightedDeficit \?\? null\)/.test(genQ)
      && /\.\.\.\(weightedDeficitOut !== undefined \? \{ weightedDeficit: weightedDeficitOut \} : \{\}\)/.test(genQ));
    A('seam:第 8 参 seed holder+success 形出参 attach(失败/无 holder 原样)',
      /trackLocalDeficitRef\.current = weightedDeficit;/.test(seam)
      && /weightedDeficit: d\.trackLocalDeficitRef\.current \?\? null/.test(seam));
    A('domain:QuestionGenerationResult additive 可选出参字段(纯数字数组·仅 success 形)',
      /weightedDeficit\?: number\[\] \| null;/.test(qgen));
  }

  console.log(`\n${fail === 0 ? '✓ AG-37 §A-§E 全绿:DRR 5 题周期 [0,1,0,1,0]+deficit 值链逐位+红面复现对照+checkpoint 跨题持久化(真图真 seam 真节点)+四兼容臂+dispatch 保守面零位移' : '✗ ' + fail + ' 失败'}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.stack ?? e?.message ?? e); process.exit(1); });
