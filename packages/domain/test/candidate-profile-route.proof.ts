/** #133 ROUTE-DICT 候选人简历路由词典 v3 + 409 退役降级臂证明（纯域，确定性，无 DB、无模型、无网络；唯一 IO = 本地 fixture 读取）。pnpm candidate-route:prove */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANDIDATE_ROUTE_POLICY_VERSION, CANDIDATE_ROUTE_POLICY_VERSION_V2, CANDIDATE_ROUTE_TAXONOMY_VERSION,
  CANDIDATE_ROUTE_ALLOCATION_BPS, CANDIDATE_ROUTE_TARGET_ROLE_POLICY_SUFFIX,
  candidateRouteDecisionHash, classifyCandidateProfileByRule, classifyJobByRule,
  arbitrateCandidateRouteWithTargetRole, taxonomyVersionForLeaves,
} from '../src/index.ts';
/** N17 视图(宽松读形:修前导出缺失时 proof 仍可加载并如实 FAIL)。 */
type ArbView = { decided: boolean; leafTrackId?: string; targetRoleApplied?: boolean; resumeDegradedFrom?: string; policyVersion: string; inputDigest: string; reason?: string };

let fail = 0;
let total = 0;
const A = (n: string, c: boolean) => { total++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'candidate-route-samples');

/* ── 0. 策略版本（§1.2 机制守护 iv · rev3 R3-1 升版强制 · v4 #270 增量面随演）────────────────── */
A('CANDIDATE_ROUTE_POLICY_VERSION = candidate-route-2026-10-frozen:v4（#270 更强证据闸=改仲裁语义，升版强制·词典本体零改）',
  CANDIDATE_ROUTE_POLICY_VERSION === 'candidate-route-2026-10-frozen:v4');
A('taxonomy 恒 v1（0142 零迁移面：词典/仲裁收紧不动叶分类法）', CANDIDATE_ROUTE_TAXONOMY_VERSION === 'v1');
A('allocation 恒 10000bps 单叶（降级兜底也是单叶全分配，非多桶加权）', CANDIDATE_ROUTE_ALLOCATION_BPS === 10000);
A('policyVersion 进 decision_hash：同输入 v3/v4 决策行身份自然区分（幂等回读不串版）',
  candidateRouteDecisionHash({ interviewId: 'i', resumeId: 'r', inputDigest: 'd', leafTrackId: 'backend/general', allocationBps: 10000, policyVersion: 'candidate-route-2026-10-frozen:v3' })
    !== candidateRouteDecisionHash({ interviewId: 'i', resumeId: 'r', inputDigest: 'd', leafTrackId: 'backend/general', allocationBps: 10000, policyVersion: 'candidate-route-2026-10-frozen:v4' }));

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
  's16-pm-no-signal.txt':             { leaf: 'business/product', degraded: false },
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
  /* v4 #270 增量面（LEDGER :247 裁定并 #201·issues-master :352 实跑样本「后端开发 Redis MySQL 自动化测试」入册）：
     general+单叶为 qa/ai_ml 时泛词/实践级弱证据不再直取该叶（更强证据闸），强证据仍取（正臂零误伤）。 */
  'ce5-backend-general-automated-test.txt': { leaf: 'backend/general', degraded: true, from: 'ambiguous_language_evidence' },
  'ce6-backend-rag-embedding-not-ai.txt':   { leaf: 'backend/general', degraded: true, from: 'ambiguous_language_evidence' },
  'ce7-backend-ml-strong-evidence-ai.txt':  { leaf: 'ai_ml/applied', degraded: false },
  'ce8-backend-qa-strong-evidence.txt':     { leaf: 'qa/quality_engineering', degraded: false },
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
const landedQa = files.filter((f) => { const r = outcomes.get(f)!; return r.decided && r.leafTrackId === 'qa/quality_engineering'; });
A('#270 反例不落 qa：落 qa 的恰为纯 QA 类+强证据正臂（s09/s14/q1/q2/q3/ce8），「后端+裸自动化测试」零落 qa',
  landedQa.join(',') === 'ce8-backend-qa-strong-evidence.txt,q1-qa-dev-selenium.txt,q2-qa-software-jmeter.txt,q3-qa-sdet-api.txt,s09-qa-selenium.txt,s14-qa-tester-mysql.txt');
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

/* ── 5. v4 #270 更强证据闸机制守护（in-file·0 次模型外发·零 409 现状不改）────────────────── */
const v4a = classifyCandidateProfileByRule('后端开发 Redis MySQL 自动化测试');
A('v4-a issues-master :352 实跑样本：后端+Redis+MySQL+自动化测试 → general 歧义兜底（不再静默落 qa·零 409）',
  v4a.decided === true && v4a.leafTrackId === 'backend/general' && v4a.degraded === true && v4a.degradedFrom === 'ambiguous_language_evidence');
const v4b = classifyCandidateProfileByRule('后端工程师，使用 RAG 检索和 embedding 向量存储');
A('v4-b ai_ml 同闸：后端+裸 rag/embedding（弱证据）→ general 歧义兜底（不静默落 ai_ml）',
  v4b.decided === true && v4b.leafTrackId === 'backend/general' && v4b.degraded === true && v4b.degradedFrom === 'ambiguous_language_evidence');
const v4c = classifyCandidateProfileByRule('后端工程师，Redis，机器学习平台建设');
A('v4-c 强证据正臂：后端+机器学习（岗位自述级）→ decided ai_ml 零误伤（闸只拦弱证据）',
  v4c.decided === true && v4c.leafTrackId === 'ai_ml/applied' && v4c.degraded === false);
const v4d = classifyCandidateProfileByRule('后端开发，MySQL，测试工程师');
A('v4-d 强证据正臂：后端+测试工程师（岗位自述级）→ decided qa 零误伤',
  v4d.decided === true && v4d.leafTrackId === 'qa/quality_engineering' && v4d.degraded === false);
const v4e = classifyCandidateProfileByRule('后端工程师，React 组件');
A('v4-e 语言叶优先序零翻：general+唯一语言叶 → 仍直取语言叶（闸不列语言叶=不受闸）',
  v4e.decided === true && v4e.leafTrackId === 'frontend/web' && v4e.degraded === false);
const v4f = classifyCandidateProfileByRule('自动化测试');
A('v4-f v3 g6 形零翻：裸「自动化测试」单独在场（唯一命中）→ 仍 decided qa（单叶臂=强证据）',
  v4f.decided === true && v4f.leafTrackId === 'qa/quality_engineering' && v4f.degraded === false);

/* ── 6. G6 N-17 targetRole 参与裁决（重构审查 P2-5·修前 targetRole 只写 payload 不参与裁决）──────── */
{
  const dm = await import('../src/index.ts') as Record<string, unknown>;
  const arb = dm.arbitrateCandidateRouteWithTargetRole as undefined | ((raw: string, role?: string) => ArbView);
  A('N17-0 domain 导出 arbitrateCandidateRouteWithTargetRole（修前缺失=targetRole 无裁决入口）', typeof arb === 'function');
  if (typeof arb === 'function') {
    const AMBIG = 'Java Spring 微服务开发；Python Django 数据平台'; // ≥2 specific → 简历降级 general
    const NOSIG = '负责团队管理与项目沟通';                         // 零命中 → 简历降级 general
    const PLAIN = 'Java Spring Boot，Redis，MySQL';                   // 非降级 → backend/java
    const base = classifyCandidateProfileByRule(AMBIG);
    A('N17-a 前提：歧义简历单独 rule = general 降级（ambiguous_language_evidence）',
      base.decided && base.leafTrackId === 'backend/general' && base.degraded === true);
    const r1 = arb(AMBIG, 'Java 后端工程师');
    A('N17-b 歧义简历 + targetRole「Java 后端工程师」→ backend/java（targetRole 做裁决·targetRoleApplied）',
      r1.decided && r1.leafTrackId === 'backend/java' && r1.targetRoleApplied === true && r1.resumeDegradedFrom === 'ambiguous_language_evidence');
    A('N17-c 采纳时 policyVersion 追加 +target-role:v2 后缀（≤64 字符 0142 CHECK）且 digest ≠ 纯简历 digest',
      r1.policyVersion === `${CANDIDATE_ROUTE_POLICY_VERSION}${CANDIDATE_ROUTE_TARGET_ROLE_POLICY_SUFFIX}`
      && r1.policyVersion.endsWith('+target-role:v2') && r1.policyVersion.length <= 64
      && r1.inputDigest !== arb(AMBIG).inputDigest && /^[0-9a-f]{64}$/.test(r1.inputDigest));
    const r2 = arb(NOSIG, '前端开发工程师');
    A('N17-d 零命中简历 + targetRole「前端开发工程师」→ frontend/web', r2.decided && r2.leafTrackId === 'frontend/web' && r2.targetRoleApplied === true);
    const r3 = arb(PLAIN, 'Python 工程师');
    A('N17-e 简历非降级（java）+ 冲突 targetRole → 简历证据胜，零翻现状 policy/digest',
      r3.decided && r3.leafTrackId === 'backend/java' && r3.targetRoleApplied === false
      && r3.policyVersion === CANDIDATE_ROUTE_POLICY_VERSION && r3.inputDigest === arb(PLAIN).inputDigest);
    const r4 = arb(AMBIG);
    const r5 = arb(AMBIG, '   ');
    const r6 = arb(AMBIG, '后端开发');       // targetRole 只命中 general → 不改
    const r7 = arb(AMBIG, '产品经理');       // product 不在 AMBIG 简历命中闭集 → 不采纳（#279 规则③）
    const r8 = arb(AMBIG, 'Java/Python 工程师'); // targetRole 自身歧义 → 不改
    A('N17-f 缺省/空白/仅 general/闭集外/自身歧义 targetRole → 原降级 general，policy/digest 与修前逐字节一致',
      [r4, r5, r6, r7, r8].every((r) => r.decided && r.leafTrackId === 'backend/general' && r.targetRoleApplied === false
        && r.policyVersion === CANDIDATE_ROUTE_POLICY_VERSION && r.inputDigest === r4.inputDigest));
    const r9 = arb('', 'Java 后端工程师');
    A('N17-g 空简历 + targetRole → 仍 profile_empty 未决（409 profile_unavailable 防御面保留·targetRole 不替代简历）',
      r9.decided === false && r9.reason === 'profile_empty');
    const r10 = arb(AMBIG, '自动化测试');    // qa 弱证据：不得再走单叶臂绕过 v4 闸
    const r11 = arb(AMBIG, 'Java 后端工程师');
    A('N17-h 确定性：同输入同决策（leaf/policy/digest 全等）', JSON.stringify(r11) === JSON.stringify(r1) && r10.decided === true);
    const r12x = arb(AMBIG, '前端开发工程师');
    A('N17-i 歧义简历 + 简历未命中的叶（前端）→ 维持 general，不采纳',
      r12x.decided && r12x.leafTrackId === 'backend/general' && r12x.targetRoleApplied === false
      && r12x.policyVersion === CANDIDATE_ROUTE_POLICY_VERSION);
    A('N17-j 歧义简历 + 弱证据「自动化测试」/「rag」→ 维持 general（不绕 v4 闸）',
      r10.decided && r10.leafTrackId === 'backend/general' && r10.targetRoleApplied === false
      && arb(AMBIG, 'rag').leafTrackId === 'backend/general' && arb(AMBIG, 'rag').targetRoleApplied === false);
    A('N17-k 零命中 + 弱证据「rag」→ 不采纳；+「算法工程师」→ ai_ml',
      arb(NOSIG, 'rag').targetRoleApplied === false && arb(NOSIG, 'rag').leafTrackId === 'backend/general'
      && arb(NOSIG, '算法工程师').targetRoleApplied === true && arb(NOSIG, '算法工程师').leafTrackId === 'ai_ml/applied'
      && arb(NOSIG, '算法工程师').resumeDegradedFrom === 'no_signal_hit');
    const GENERAL = '负责订单系统，使用 Redis、MySQL 与高并发限流';
    const g0 = classifyCandidateProfileByRule(GENERAL);
    A('N17-l 前提：general-only 简历单独 rule = backend/general 非降级',
      g0.decided && g0.leafTrackId === 'backend/general' && g0.degraded === false);
    const g1 = arb(GENERAL, 'Java 后端工程师');
    A('N17-m general-only + targetRole「Java 后端工程师」→ backend/java（专向生效）',
      g1.decided && g1.leafTrackId === 'backend/java' && g1.targetRoleApplied === true
      && g1.resumeDegradedFrom === undefined
      && g1.policyVersion === `${CANDIDATE_ROUTE_POLICY_VERSION}${CANDIDATE_ROUTE_TARGET_ROLE_POLICY_SUFFIX}`);
    A('N17-n general-only + 弱证据「自动化测试」→ 仍 general',
      arb(GENERAL, '自动化测试').targetRoleApplied === false && arb(GENERAL, '自动化测试').leafTrackId === 'backend/general');
    A('N17-o 采纳臂大小写折叠：Java/java 同叶且 digest 相同',
      g1.inputDigest === arb(GENERAL, 'java 后端工程师').inputDigest
      && arb(AMBIG, 'Java 后端工程师').inputDigest === arb(AMBIG, 'java 后端工程师').inputDigest);
  }
}

/* ── L8 非技术岗硬过滤（纯域·0 次模型外发）──────────────────────────────── */
{
  const pm = classifyCandidateProfileByRule('产品经理，负责 B 端需求与产品路线图');
  A('L8-a 产品经理简历 → business/product，不降级到 backend/general',
    pm.decided === true && pm.leafTrackId === 'business/product' && pm.degraded === false);
  const pmStack = classifyCandidateProfileByRule('产品经理，日常会看 Redis 与 MySQL 报表');
  A('L8-b 产品经理 + 通用后端栈词 → 仍取 business/product（不把非技术岗送进后端题库）',
    pmStack.decided === true && pmStack.leafTrackId === 'business/product' && pmStack.degraded === false);
  const hybrid = classifyCandidateProfileByRule('Java 工程师兼产品经理，Spring 与产品路线图');
  A('L8-c 技术叶与【强】非技术叶同时命中 → business/general 降级（岗位自述级强证据闸·禁止静默落到 Java 题库）',
    hybrid.decided === true && hybrid.leafTrackId === 'business/general' && hybrid.degraded === true
    && taxonomyVersionForLeaves([hybrid.leafTrackId]) === 'v2');
  const jobPm = classifyJobByRule({ title: '产品经理', description: '负责需求与产品路线图', competencies: ['用户故事'] });
  A('L8-d 岗位「产品经理」rule 唯一命中 business/product（0 次模型）', jobPm === 'business/product');
  const jobNode = classifyJobByRule({ title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs'] });
  A('L8-e 既有技术岗 rule 不回归（仍是 backend/nodejs）', jobNode === 'backend/nodejs');
  A('L8-f 非技术叶决策写 taxonomy v2，纯技术决策仍写 v1',
    taxonomyVersionForLeaves(['business/product']) === 'v2' && taxonomyVersionForLeaves(['backend/nodejs']) === 'v1');
  A('L8-g 默认 CANDIDATE_ROUTE_TAXONOMY_VERSION 仍为 v1（技术面零翻）',
    CANDIDATE_ROUTE_TAXONOMY_VERSION === 'v1');
}

/* ── L8-R 反向隔离回归（#281 mw-rag-route BLOCK 修复·#279 规则①：简历唯一 specific 叶胜出、
    弱命中只进消歧集——技术简历 + 弱非技术命中仍走技术路由）────────────────────────── */
{
  // mw-rag-route BLOCK 实测三探针（修前全部误降 business/general → 空题库）：
  const javaPrd = classifyCandidateProfileByRule('Java Spring Boot，Redis，MySQL，写过 prd');
  A('L8-R1 Java 简历 + 弱命中「写过 prd」→ 仍技术面（backend/general 降级·不入 business/general）',
    javaPrd.decided && javaPrd.leafTrackId === 'backend/general' && javaPrd.degraded === true
    && javaPrd.degradedFrom === 'ambiguous_language_evidence');
  const javaStory = classifyCandidateProfileByRule('Java 工程师，把用户故事拆成技术任务');
  A('L8-R2 Java 简历 + 弱命中「用户故事」→ 仍技术面（不入 business 面）',
    javaStory.decided && javaStory.leafTrackId === 'backend/general' && javaStory.degraded === true);
  const fePrd = classifyCandidateProfileByRule('前端 React 工程师，写过 prd');
  A('L8-R3 前端简历 + 弱命中「prd」→ 仍技术面降级桶（不入 business 面）',
    fePrd.decided && fePrd.leafTrackId === 'backend/general' && fePrd.degraded === true);
  A('L8-R4 弱命中降级桶 taxonomy/policy 仍技术面（v1 + candidate-route v4）',
    javaPrd.decided && javaPrd.leafTrackId === 'backend/general'
    && taxonomyVersionForLeaves([javaPrd.leafTrackId]) === 'v1');
  const strongHybrid = classifyCandidateProfileByRule('Java 工程师，后端转产品，现任产品经理');
  A('L8-R5 强非技术证据在场才降 business/general（岗位自述级闸放行·与弱词反证形成对比）',
    strongHybrid.decided && strongHybrid.leafTrackId === 'business/general' && strongHybrid.degraded === true);
  // 弱词不得绕闸走单叶/general+单叶臂（同 v4 qa 闸形）：
  const weakSolo = classifyCandidateProfileByRule('后端工程师，写过 prd');
  A('L8-R6 general+弱命中单叶（product 闸不过）→ 不直取 business/product，落技术面降级桶',
    weakSolo.decided && weakSolo.leafTrackId === 'backend/general' && weakSolo.degraded === true);
  // #279 规则③：弱命中进消歧闭集——targetRole 强证据岗位在闭集内可采纳（用户自述意向）：
  const arbPm = arbitrateCandidateRouteWithTargetRole('Java 工程师，写过 prd', '产品经理');
  A('L8-R7 闭集内消歧：技术+弱prd 简历 + targetRole「产品经理」→ business/product（targetRoleApplied·v5 策略）',
    arbPm.decided && arbPm.leafTrackId === 'business/product' && arbPm.targetRoleApplied === true
    && arbPm.resumeDegradedFrom === 'ambiguous_language_evidence'
    && arbPm.policyVersion === `${CANDIDATE_ROUTE_POLICY_VERSION_V2}${CANDIDATE_ROUTE_TARGET_ROLE_POLICY_SUFFIX}`);
  const arbPmWeak = arbitrateCandidateRouteWithTargetRole('Java 工程师，写过 prd', 'prd');
  A('L8-R8 targetRole 仅弱词（prd 闸不过）→ 不采纳，维持技术面降级',
    arbPmWeak.decided && arbPmWeak.leafTrackId === 'backend/general' && arbPmWeak.targetRoleApplied === false);
  // business/general 单独在场仍单叶臂（v3 g6 形零翻·0234 已播种非空）：
  const bizGeneral = classifyCandidateProfileByRule('通用职场协作与商务沟通');
  A('L8-R9 business/general 单叶命中 → decided（单叶臂=强证据·降级桶语义另见 L8-c/R5）',
    bizGeneral.decided && bizGeneral.leafTrackId === 'business/general' && bizGeneral.degraded === false
    && taxonomyVersionForLeaves([bizGeneral.leafTrackId]) === 'v2');
}

console.log(`\n${fail === 0 ? `✓ #133 ROUTE-DICT 词典 v3 + v4 #270 更强证据闸 + 409 退役降级臂 + L8 非技术岗硬过滤 + L8-R 反向隔离回归全部通过（fixture ${files.length} 份 · 断言 ${total} 项）` : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
