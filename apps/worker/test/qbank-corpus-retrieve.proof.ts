/**
 * H2 QBANK-CORPUS worker 面 prove·§5.3/§5.5(检索参数协议/scenario 扩面/门语义)+ §5.6 worker 面。
 *
 * 覆盖(REQUEST h2-qbank-corpus §5):
 *  - §5.5 查询三段解析向后兼容:旧单/双段形逐字节兼容(additive 可选段缺省)·新三/四段解析·
 *    fail-closed 保持(非法段/超长/保留词/控制字符 → null → planner_query_invalid,零发明)。
 *  - §5.5 scenario 面素材接入双分支:有素材(检索调用+查询带岗位/技术栈段+模型出题)/无素材
 *    (显式降级模板 approved_template·零模型调用·零 fail 硬死)·behavioral 不接检索(白名单裁决)。
 *  - §5.3 空池→degraded:scoredRefsFromDispatch 对 filteredEmpty 显式映射 no_eligible_in_scope
 *    (既有零命中空 serve 语义零改)。
 *  - §5.6 route_snapshot_missing 逐字(snapshot 缺失 → degraded ref 逐字节)+ G-R2-5 永不 unscoped。
 *
 * 模型路径用 fixture PG(invoke 关口真落库)+ scripted model(零真实模型外呼·est live=0)。
 * pnpm qbank-corpus-retrieve:prove (node scripts/run-e2e-isolated.mjs qbank-corpus-retrieve:prove)
 */
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, asPrincipal, createPool, loadMigrations, runMigrations,
} from '@meetwise/db';
import { degradedRetrieval, normalizeQuestionGenerationResult, type ScoredRef } from '@meetwise/domain';
import { buildAdaptiveDeps, buildCragPlannerQuery } from '../src/adaptive-interview-service.ts';
import {
  parseCragPlannerQuery, scoredRefsFromDispatch, retrieveViaDispatchTrackLocal,
  CRAG_QUERY_TARGET_ROLE_MAX_CHARS, CRAG_QUERY_TECH_STACK_MAX_CHARS,
} from '../src/qbank-track-local-retrieve.ts';
import type { ModelClient } from '@meetwise/ai-runtime';

const pool = createPool();
let fail = 0;
const A = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`); if (!ok) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
void pool;

/** scripted 面试官模型:interviewer.ask 恒返固定题面(零真实外呼)。 */
function scriptedAskModel(question: string): { model: ModelClient; calls: () => number } {
  let calls = 0;
  const model: ModelClient = {
    async complete(req) {
      if (req.service === 'interviewer.ask') { calls += 1; return { ok: true, raw: { q: question, refs: [] } }; }
      return { ok: false, kind: 'deterministic' as const };
    },
  };
  return { model, calls: () => calls };
}

function main() {
  /* ── §5.5 parseCragPlannerQuery 协议扩展·向后兼容 ── */
  section('§5.5a parseCragPlannerQuery:旧形逐字节兼容+新段解析+fail-closed');
  const old1 = parseCragPlannerQuery('高并发 难度3');
  A('旧双段:competency/difficulty 原值', !!old1 && old1.competencyId === '高并发' && old1.difficulty === 3);
  A('旧双段:可选段缺省(无 targetRole/techStack 键)', !!old1 && !('targetRole' in old1) && !('techStack' in old1));
  const old2 = parseCragPlannerQuery('数据库 难度5');
  A('旧双段第二样本', !!old2 && old2.competencyId === '数据库' && old2.difficulty === 5);
  const four = parseCragPlannerQuery('缓存与一致性 岗位后端开发工程师 栈Redis Kafka 难度3');
  A('新四段:competency+岗位+栈+难度全解析', !!four && four.competencyId === '缓存与一致性'
    && four.targetRole === '后端开发工程师' && four.techStack === 'Redis Kafka' && four.difficulty === 3);
  const three = parseCragPlannerQuery('并发 岗位后端 难度2');
  A('新三段(仅岗位)', !!three && three.competencyId === '并发' && three.targetRole === '后端' && !('techStack' in three));
  const threeS = parseCragPlannerQuery('并发 栈Go 难度2');
  A('新三段(仅栈)', !!threeS && threeS.competencyId === '并发' && threeS.techStack === 'Go' && !('targetRole' in threeS));
  const nulls: [string, string][] = [
    ['无难度尾段', '只有能力词'],
    ['难度越界', '并发 难度6'],
    ['难度非数字', '并发 难度x'],
    ['空 competency', '难度3'],
    ['保留词入栈段', '并发 栈岗位x 难度2'],
    ['保留词入岗位段', '并发 岗位难度2 难度3'],
    ['岗位段超长', `并发 岗位${'r'.repeat(CRAG_QUERY_TARGET_ROLE_MAX_CHARS + 1)} 难度2`],
    ['栈段超长', `并发 栈${'s'.repeat(CRAG_QUERY_TECH_STACK_MAX_CHARS + 1)} 难度2`],
    ['控制字符', '并发\u0007 岗位x 难度2'],
  ];
  for (const [name, q] of nulls) A(`fail-closed: ${name} → null`, parseCragPlannerQuery(q) === null);
  A('fail-closed: 非字符串 → null', parseCragPlannerQuery(undefined as unknown as string) === null);

  section('§5.5b buildCragPlannerQuery 构造(岗位/技术栈段·与解析同源)+roundtrip');
  const q4 = buildCragPlannerQuery('缓存与一致性', 3, { targetRole: '后端开发工程师', techStackFacts: ['负责 Redis 缓存与限流模块设计', 'Kafka 数据管道'] });
  A('四段构造逐字', q4 === '缓存与一致性 岗位后端开发工程师 栈负责 Redis 缓存与限流模块设计 Kafka 数据管道 难度3', q4);
  A('构造↔解析 roundtrip', (() => { const p = parseCragPlannerQuery(q4)!; return p.competencyId === '缓存与一致性' && p.difficulty === 3 && p.targetRole === '后端开发工程师' && !!p.techStack?.startsWith('负责 Redis'); })());
  const qDropRole = buildCragPlannerQuery('并发', 2, { targetRole: '岗位管理员', techStackFacts: [] });
  A('保留词岗位段构造端清洗缺省(确定性降级旧两段形·非截断)', qDropRole === '并发 难度2' && parseCragPlannerQuery(qDropRole) !== null, qDropRole);
  const qMixed = buildCragPlannerQuery('并发', 2, { techStackFacts: ['含栈字词', 'Redis', 'Kafka'] });
  A('含保留词 fact 被剔除,合法 fact 保留', qMixed === '并发 栈Redis Kafka 难度2', qMixed);
  A('缺省上下文=旧两段形逐字', buildCragPlannerQuery('高并发', 4) === '高并发 难度4');

  /* ── §5.3 filteredEmpty → degraded 映射(空池→degraded 非发明) ── */
  section('§5.3 空池 degraded 语义(scoredRefsFromDispatch)');
  const fe = scoredRefsFromDispatch({ status: 'served', planId: 'p', cacheStatus: 'miss', results: [], recheckedRefs: 0, filteredEmpty: true });
  A('filteredEmpty → 显式 degraded no_eligible_in_scope', fe.length === 1 && fe[0]!.ref === '__rag_degraded__:no_eligible_in_scope' && fe[0]!.availability === 'degraded');
  const legacyEmpty = scoredRefsFromDispatch({ status: 'served', planId: 'p', cacheStatus: 'miss', results: [], recheckedRefs: 0 });
  A('既有零命中空 serve 语义零改(仍 [],CRAG 走 fallback_web)', legacyEmpty.length === 0);
  A('非空 served 映射零改', (() => {
    const r = scoredRefsFromDispatch({ status: 'served', planId: 'p', cacheStatus: 'hit', results: [{ ref: 'q1', score: 0.9, evidence: 'e' }], recheckedRefs: 1 });
    return r.length === 1 && r[0]!.ref === 'q1' && r[0]!.score === 0.9;
  })());

  /* ── §5.6 route_snapshot_missing 逐字 + 永不 unscoped ── */
  section('§5.6 route_snapshot_missing 逐字(snapshot 缺失面·pool 零触)');
  void main2();
}
async function main2() {
  section('§5.6 retrieveViaDispatchTrackLocal(snapshot 缺失 → 逐字 degraded)');
  const out = await retrieveViaDispatchTrackLocal({
    pool: pool, owner: 'h2q-worker-prove', snapshot: null,
    query: '并发 难度3', deficit: [0], deps: { embedderVersion: 'h2q-prove:v1', k: 5, embed: async () => [[]], cache: {} as never },
  });
  A('缺 snapshot → __rag_degraded__:route_snapshot_missing 逐字(G-R2-5 永不 unscoped)',
    out.refs.length === 1 && out.refs[0]!.ref === '__rag_degraded__:route_snapshot_missing');
  const emptyAlloc = await retrieveViaDispatchTrackLocal({
    pool: pool, owner: 'h2q-worker-prove',
    snapshot: { interviewId: 'i', jobId: '', revision: 1, decisionId: 'd', routeDigest: 'x', allocations: [] },
    query: '并发 难度3', deficit: [0], deps: { embedderVersion: 'h2q-prove:v1', k: 5, embed: async () => [[]], cache: {} as never },
  });
  A('缺叶(空 allocations)→ 同逐字 degraded(门语义零弱化·缺行缺叶同拒)',
    emptyAlloc.refs.length === 1 && emptyAlloc.refs[0]!.ref === '__rag_degraded__:route_snapshot_missing');

  /* ── §5.5c scenario 双分支(有素材/无素材)+behavioral 白名单 ── */
  section('§5.5c scenario 检索接入:无素材显式降级(零模型·零 fail 硬死)');
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await assertIsolatedTestTarget(pool);
  // 每个 invoke 都带 privacyInterviewId=threadId;预派发隐私围栏要求 interview 行真实存在且 owner 匹配
  // (adaptive-flow 同形 seed;无模型路径的用例不 seed)。无素材/behavioral 不触模型路径,但仍按需 seed。
  const seedInterview = (threadId: string, owner: string) => asPrincipal(pool, owner, async (c) => {
    await c.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active') ON CONFLICT (id) DO NOTHING", [threadId, owner]);
  });
  let noMatLocalCalls = 0;
  const noMatModel = scriptedAskModel('不该被调用');
  const noMat = buildAdaptiveDeps({
    pool: pool, owner: 'h2q-scenario-empty', threadId: `h2q-scenario-empty-${randomUUID()}`,
    model: noMatModel.model,
    competencies: ['缓存与一致性'],
    targetRole: '后端开发工程师',
    localRetrieve: async () => { noMatLocalCalls += 1; return []; },
    webExplore: async () => [],
  });
  const noMatOut = normalizeQuestionGenerationResult(await noMat.retrieveAndGenerate('缓存与一致性', 3, 0, 0, [], 'scenario'));
  A('scenario 无素材 → approved_template 显式降级', noMatOut.ok === true && noMatOut.provenance.origin === 'approved_template');
  A('降级模板含明示降级语(非伪造素材非静默通用题)', noMatOut.ok === true && noMatOut.question.includes('已降级为通用情景题'));
  A('零模型调用(零 fail 硬死·零发明)', noMatModel.calls() === 0 && noMatLocalCalls === 1);

  section('§5.5c scenario 检索接入:有素材(检索调用+查询带岗位/技术栈+模型出题)');
  let capturedQuery = '';
  let capLocalCalls = 0;
  const withMatModel = scriptedAskModel('情景题面素材接地样本');
  const matThreadId = `h2q-scenario-mat-${randomUUID()}`;
  await seedInterview(matThreadId, 'h2q-scenario-mat');
  const withMat = buildAdaptiveDeps({
    pool: pool, owner: 'h2q-scenario-mat', threadId: matThreadId,
    model: withMatModel.model,
    competencies: ['缓存与一致性'],
    targetRole: '后端开发工程师',
    resumeFacts: ['负责 Redis 缓存与限流模块设计', 'Kafka 数据管道', '非相关事实文本样例'],
    localRetrieve: async (q) => { capLocalCalls += 1; capturedQuery = q; return [{ ref: 'question:fixture:1', score: 0.95, evidence: '[prompt] 情景素材' }] as ScoredRef[]; },
    webExplore: async () => [],
  });
  const matOut = normalizeQuestionGenerationResult(await withMat.retrieveAndGenerate('缓存与一致性', 3, 0, 0, [], 'scenario'));
  A('scenario 有素材 → 模型出题(检索素材接入)', matOut.ok === true && matOut.provenance.origin === 'model', JSON.stringify(matOut.provenance));
  A('查询带岗位段+技术栈段(resume facts 同源·selectGroundedFacts)', capturedQuery.includes('岗位后端开发工程师') && capturedQuery.includes('栈负责 Redis'), capturedQuery);
  A('查询以难度段收尾(协议完整)', /难度3$/.test(capturedQuery));
  A('构造查询过解析面(生产查询永不触发解析拒绝)', parseCragPlannerQuery(capturedQuery) !== null);
  A('模型恰好一次调用', withMatModel.calls() === 1 && capLocalCalls === 1);

  section('§5.5c fundamental 行为零改+behavioral 不接检索(白名单裁决)');
  let fundQuery = '';
  const fundModel = scriptedAskModel('基础题面样本：解释缓存一致性');
  const fundThreadId = `h2q-fund-${randomUUID()}`;
  await seedInterview(fundThreadId, 'h2q-fund');
  const fund = buildAdaptiveDeps({
    pool: pool, owner: 'h2q-fund', threadId: fundThreadId,
    model: fundModel.model,
    competencies: ['缓存与一致性'],
    targetRole: '后端开发工程师',
    localRetrieve: async (q) => { fundQuery = q; return [{ ref: 'question:fixture:2', score: 0.95, evidence: '[prompt] 素材' }] as ScoredRef[]; },
    webExplore: async () => [],
  });
  const fundOut = normalizeQuestionGenerationResult(await fund.retrieveAndGenerate('缓存与一致性', 3, 0, 0, [], 'fundamental'));
  A('fundamental 检索仍接通+模型出题(既有语义零改)', fundOut.ok === true && fundOut.provenance.origin === 'model' && fundModel.calls() === 1, JSON.stringify(fundOut.provenance));
  A('fundamental 查询同样带岗位/技术栈段(#79 查询构造全检索面)', fundQuery.includes('岗位后端开发工程师'));
  let behavLocalCalls = 0;
  const behavModel = scriptedAskModel('行为题面');
  const behavThreadId = `h2q-behav-${randomUUID()}`;
  await seedInterview(behavThreadId, 'h2q-behav');
  const behav = buildAdaptiveDeps({
    pool: pool, owner: 'h2q-behav', threadId: behavThreadId,
    model: behavModel.model,
    competencies: ['项目经验'],
    localRetrieve: async () => { behavLocalCalls += 1; return []; },
    webExplore: async () => { throw new Error('behavioral must not explore'); },
  });
  const behavOut = normalizeQuestionGenerationResult(await behav.retrieveAndGenerate('项目经验', 2, 0, 0, [], 'behavioral'));
  A('behavioral 不接检索不外呼(零检索调用;题面由模型侧自由生成·白名单裁决如实)', behavLocalCalls === 0, `origin=${behavOut.ok ? behavOut.provenance.origin : 'n/a'}`);

  console.log(`\n${fail === 0 ? 'H2 QBANK-CORPUS worker 面 prove 全部通过' : `${fail} 个断言失败`}`);
  process.exit(fail === 0 ? 0 : 1);
}

void main();
