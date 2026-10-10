/** #133 ROUTE-DICT 候选人简历路由词典 v3 + 409 退役降级臂证明（纯域，确定性，无 DB、无模型、无网络；唯一 IO = 本地 fixture 读取）。pnpm candidate-route:prove */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANDIDATE_ROUTE_POLICY_VERSION, CANDIDATE_ROUTE_TAXONOMY_VERSION, CANDIDATE_ROUTE_ALLOCATION_BPS,
  candidateRouteDecisionHash, classifyCandidateProfileByRule,
} from '../src/index.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'candidate-route-samples');

/* ── 0. 策略版本（§1.2 机制守护 iv · rev3 R3-1 升版强制）────────────────────────────── */
A('CANDIDATE_ROUTE_POLICY_VERSION = candidate-route-2026-10-frozen:v3（改词典+改仲裁=改路由语义，升版强制）',
  CANDIDATE_ROUTE_POLICY_VERSION === 'candidate-route-2026-10-frozen:v3');
A('taxonomy 恒 v1（0142 零迁移面：词典/仲裁收紧不动叶分类法）', CANDIDATE_ROUTE_TAXONOMY_VERSION === 'v1');
A('allocation 恒 10000bps 单叶（降级兜底也是单叶全分配，非多桶加权）', CANDIDATE_ROUTE_ALLOCATION_BPS === 10000);
A('policyVersion 进 decision_hash：同输入 v2/v3 决策行身份自然区分（幂等回读不串版）',
  candidateRouteDecisionHash({ interviewId: 'i', resumeId: 'r', inputDigest: 'd', leafTrackId: 'backend/general', allocationBps: 10000, policyVersion: 'candidate-route-2026-10-frozen:v2' })
    !== candidateRouteDecisionHash({ interviewId: 'i', resumeId: 'r', inputDigest: 'd', leafTrackId: 'backend/general', allocationBps: 10000, policyVersion: 'candidate-route-2026-10-frozen:v3' }));

/* ── 1. fixture 语料（rev3 R3-4：≥30 份 · 审计验收原文目录）────────────────────────── */
type Expect = { leaf: string; degraded: boolean; from?: 'ambiguous_language_evidence' | 'no_signal_hit' };
const EXPECT: Record<string, Expect> = {
  /* §1.2 S01–S16（rev3 改向行：S03 真歧义→降级 general 非 409；S16 零命中→降级 general 非 409） */
  's01-java-backend-unit-test.txt':   { leaf: 'backend/java', degraded: false },
  's02-python-go-hiking.txt':         { leaf: 'backend/python', degraded: false },
  's03-nestjs-react-fullstack.txt':   { leaf: 'backend/general', degraded: true, from: 'ambiguous_language_evidence' },
  's04-java-redis.txt':               { leaf: 'backend/java', degraded: false },
  's05-frontend-react-html.txt':      { leaf: 'frontend/web', degraded: false },
  's06-java-backend-html.txt':        { leaf: 'backend/java', degraded: false },
  's07-go-language-gin.txt':          { leaf: 'backend/go', degraded: false },
  's08-golang-algo-basics.txt':       { leaf: 'backend/go', degraded: false },
  's09-qa-selenium.txt':              { leaf: 'qa/quality_engineering', degraded: false },
  's10-python-api-test.txt':          { leaf: 'backend/python', degraded: false },
  's11-algo-engineer-recsys.txt':     { leaf: 'ai_ml/applied', degraded: false },
  's12-ml-html-report.txt':           { leaf: 'ai_ml/applied', degraded: false },
  's13-nodejs-javascript-express.txt': { leaf: 'backend/nodejs', degraded: false },
  's14-qa-tester-mysql.txt':          { leaf: 'qa/quality_engineering', degraded: false },
  's15-html-css-slicer.txt':          { leaf: 'backend/general', degraded: false },
  's16-pm-no-signal.txt':             { leaf: 'backend/general', degraded: true, from: 'no_signal_hit' },
  's17-go-uppercase-guard.txt':       { leaf: 'backend/go', degraded: false },
  /* R3-4 审计验收类目：Node+TS / Java+测试 / Python+算法 / Go+gin / 纯前端 / 纯QA / 纯算法 各 3 */
  'n1-nodejs-typescript-koa.txt':     { leaf: 'backend/nodejs', degraded: false },
  'n2-nestjs-typescript-redis.txt':   { leaf: 'backend/nodejs', degraded: false },
  'n3-nodejs-javascript-express-api.txt': { leaf: 'backend/nodejs', degraded: false },
  'j1-java-spring-itest.txt':         { leaf: 'backend/java', degraded: false },
  'j2-java-mybatis-utest.txt':        { leaf: 'backend/java', degraded: false },
  'j3-java-jvm-automated-test.txt':   { leaf: 'backend/general', degraded: true, from: 'ambiguous_language_evidence' },
  'p1-python-fastapi-algo-basics.txt': { leaf: 'backend/python', degraded: false },
  'p2-python-django-numpy.txt':       { leaf: 'backend/python', degraded: false },
  'p3-python-flask-algo-engineer.txt': { leaf: 'backend/general', degraded: true, from: 'ambiguous_language_evidence' },
  'g1-go-language-grpc.txt':          { leaf: 'backend/go', degraded: false },
  'g2-golang-go-dev-gateway.txt':     { leaf: 'backend/go', degraded: false },
  'g3-go-uppercase-backend.txt':      { leaf: 'backend/go', degraded: false },
  'f1-frontend-react-vue.txt':        { leaf: 'frontend/web', degraded: false },
  'f2-frontend-ts-react.txt':         { leaf: 'frontend/web', degraded: false },
  'f3-frontend-js-html-css.txt':      { leaf: 'frontend/web', degraded: false },
  'q1-qa-dev-selenium.txt':           { leaf: 'qa/quality_engineering', degraded: false },
  'q2-qa-software-jmeter.txt':        { leaf: 'qa/quality_engineering', degraded: false },
  'q3-qa-sdet-api.txt':               { leaf: 'qa/quality_engineering', degraded: false },
  'a1-algo-engineer-pytorch.txt':     { leaf: 'ai_ml/applied', degraded: false },
  'a2-algo-expert-nlp-llm.txt':       { leaf: 'ai_ml/applied', degraded: false },
  'a3-ai-ml-tensorflow.txt':          { leaf: 'ai_ml/applied', degraded: false },
  /* R3-2 #270 反例：「后端+自动化测试」不落 qa（有后端叶也降级 general=歧义兜底；无后端叶 general 胜出 qa） */
  'ce1-java-backend-automated-test.txt':   { leaf: 'backend/general', degraded: true, from: 'ambiguous_language_evidence' },
  'ce2-nodejs-backend-automated-test.txt': { leaf: 'backend/general', degraded: true, from: 'ambiguous_language_evidence' },
  'ce3-golang-backend-automated-test.txt': { leaf: 'backend/general', degraded: true, from: 'ambiguous_language_evidence' },
  'ce4-frontend-automated-test-not-qa.txt': { leaf: 'backend/general', degraded: true, from: 'ambiguous_language_evidence' },
};

const files = readdirSync(FIXTURE_DIR).filter((f) => f.endsWith('.txt')).sort();
A(`fixture 语料 ≥30 份（审计验收 R3-4 · 实际 ${files.length} 份）`, files.length >= 30);
A('fixture 文件与期望表一一对应（零孤儿文件 / 零缺失行——防语料漂移）',
  files.length === Object.keys(EXPECT).length && files.every((f) => f in EXPECT));

/* ── 2. 逐样本断言（每条 decided+叶(+degraded) —— §1.2「每条断言」面）───────────────── */
const outcomes = new Map<string, ReturnType<typeof classifyCandidateProfileByRule>>();
for (const f of files) {
  const text = readFileSync(join(FIXTURE_DIR, f), 'utf8');
  const r = classifyCandidateProfileByRule(text);
  outcomes.set(f, r);
  const e = EXPECT[f]!;
  const ok = r.decided === true
    && r.leafTrackId === e.leaf
    && r.degraded === e.degraded
    && (!e.degraded || r.degradedFrom === e.from)
    && r.allocationBps === 10000;
  A(`${f} → ${e.leaf}${e.degraded ? `（degraded·${e.from}）` : ''}`, ok);
}

/* ── 3. 审计验收聚合断言（R3-4/R3-2）────────────────────────────────────────────────── */
const undecided = files.filter((f) => outcomes.get(f)!.decided === false);
A('后端类（全语料）candidate_route_undecided 计数 = 0（v3 降级臂下分类器对非空输入恒 decided）',
  undecided.length === 0);
const landedQa = files.filter((f) => outcomes.get(f)!.decided && outcomes.get(f)!.leafTrackId === 'qa/quality_engineering');
A('#270 反例不落 qa：落 qa 的恰为纯 QA 类（s09/s14/q1/q2/q3），「后端+自动化测试」零落 qa',
  landedQa.join(',') === 'q1-qa-dev-selenium.txt,q2-qa-software-jmeter.txt,q3-qa-sdet-api.txt,s09-qa-selenium.txt,s14-qa-tester-mysql.txt');
const degradedAll = files.filter((f) => { const r = outcomes.get(f)!; return r.decided && r.degraded; });
A('降级臂形态守恒：degraded 结果必为 backend/general @10000bps 且携 from 信号',
  degradedAll.length > 0 && degradedAll.every((f) => {
    const r = outcomes.get(f)! as { leafTrackId: string; allocationBps: number; degradedFrom: string };
    return r.leafTrackId === 'backend/general' && r.allocationBps === 10000
      && (r.degradedFrom === 'ambiguous_language_evidence' || r.degradedFrom === 'no_signal_hit');
  }));

/* ── 4. 机制守护（§1.2 i–iii · rev3 改写仲裁面）────────────────────────────────────── */
const g1 = classifyCandidateProfileByRule('I love google search and github hosting');
A('守护 i：google/github 不命中 backend/go（词边界机制 + 裸 go 移除后零信号 → 降级 general 非 409）',
  g1.decided === true && g1.leafTrackId === 'backend/general' && g1.degraded === true && g1.degradedFrom === 'no_signal_hit');
const g2 = classifyCandidateProfileByRule('I like to go hiking on weekends');
A('守护 i+：英文动词裸 go 不命中 backend/go（零其余信号 → 降级 general）',
  g2.decided === true && g2.leafTrackId === 'backend/general' && g2.degraded === true && g2.degradedFrom === 'no_signal_hit');
const g3 = classifyCandidateProfileByRule('I write javascript and typescript daily');
A('守护 ii：javascript/typescript 不因 java 命中 backend/java（\\b 守护）→ 仅 general 共享桶命中',
  g3.decided === true && g3.leafTrackId === 'backend/general' && g3.degraded === false);
const g4 = classifyCandidateProfileByRule('redis，mysql，nginx 运维，消息队列');
A('守护 iii-a：general 单独命中 → decided backend/general（:99 既有面维持）',
  g4.decided === true && g4.leafTrackId === 'backend/general' && g4.degraded === false);
const g5 = classifyCandidateProfileByRule('后端工程师，React 组件');
A('守护 iii-b：general+唯一 specific 叶 → 取 specific 叶（:100-102 优先序不变）',
  g5.decided === true && g5.leafTrackId === 'frontend/web' && g5.degraded === false);
const g6 = classifyCandidateProfileByRule('自动化测试');
A('守护 R3-2：裸「自动化测试」单叶 → decided qa（收窄 token 单独在场=强证据）',
  g6.decided === true && g6.leafTrackId === 'qa/quality_engineering' && g6.degraded === false);
const g7 = classifyCandidateProfileByRule('');
const g8 = classifyCandidateProfileByRule('    ');
A('守护 R3-3：空输入 → profile_empty 未决（唯一剩余 undecided；db 侧 profile_unavailable → 409 防御面保留）',
  g7.decided === false && g7.reason === 'profile_empty' && g8.decided === false && g8.reason === 'profile_empty');
A('退役面：no_signal_hit / ambiguous_language_evidence 不再作为未决拒因产出（仅存于 degradedFrom 对账信号）',
  (() => { const r: ReturnType<typeof classifyCandidateProfileByRule> = g2; return r.decided && r.degradedFrom === 'no_signal_hit' && !('reason' in r); })());

console.log(`\n${fail === 0 ? `✓ #133 ROUTE-DICT 词典 v3 + 409 退役降级臂全部通过（fixture ${files.length} 份 · 断言 ${33 + files.length} 项）` : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
