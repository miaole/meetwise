/** CONTEXT-BUDGET-WIRE(AG-20 CTX-02 显式接线) prove·纯函数+渲染字节+静态接线三组臂·零 DB 零外呼零 env·tsx 直跑免 runner 注册。
 *  组A=sessionSurvivesAskBudget 纯裁定(缺省零触臂/真实形 within_budget/窗口紧 degraded 裁 summary/窗口算术破 ok:false 委任臂/FromCostPolicy throw 委任臂/确定性);
 *  组B=renderSessionSummarySection 单一装配源字节恒一(后缀差恒等/缺省臂 v7 形守卫/段结构+弱点空省行 P2-c);
 *  组C=静态接线五锚(readFileSync:service 出口/prompts 单源/四段管道/CTX-02 真消费/注册)。
 *  断言失败输出只记命中标记,禁 dump 提示词原文(no-dump-on-fail)。est live=0(零 Key·零 fetch·零 env 触)。 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  contextBudgetPolicyFromCostPolicy, getPrompt, planDispatchBudget, renderSessionSummarySection,
  type ModelCostPolicy,
} from '@meetwise/ai-runtime';
import { sessionSurvivesAskBudget } from '../src/ask-context-budget.ts';

let failures = 0;
const sha16 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16);
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok || !detail ? '' : `  [sha=${sha16(detail)} len=${detail.length}]`}`);
  if (!ok) failures++;
};

// ───────────────────────── 夹具(纯内存·零 IO) ─────────────────────────
const POLICY_BASE: ModelCostPolicy = {
  scopeId: 'proof-scope', provider: 'proof-provider', model: 'qwen-proof', region: 'proof-region',
  priceRevision: 'proof-rev', maxInputTokens: 131072, maxOutputTokens: 8192,
  contextWindowTokens: 131072, contextEstimator: 'utf8-bytes-v1', contextSafetyMarginTokens: 4096, contextToolReserveTokens: 0,
};
const NORMAL_PARTS = { system: 'sys'.repeat(32), userData: 'dat'.repeat(32), rag: 'rag'.repeat(32), summary: 'sum'.repeat(32) };
const FIX_SESSION = {
  turns: [
    { n: 1, competency: '缓存一致性', kind: 'grounded', score: 3, q: '第一轮题目' },
    { n: 2, competency: '消息队列', kind: 'fundamental', score: 4, q: '第二轮题目' },
  ],
  weaknesses: ['w-alpha', 'w-beta'],
};

// ───────────────────────── 组A sessionSurvivesAskBudget 纯裁定 ─────────────────────────
function sectionA() {
  A('A1 costPolicy 缺省 → true(零触缺省臂=现状字节)', sessionSurvivesAskBudget(NORMAL_PARTS, undefined) === true);
  const normalDecision = planDispatchBudget({
    system: NORMAL_PARTS.system, permissionSnapshot: '', schema: '', tools: '',
    userData: NORMAL_PARTS.userData, rag: NORMAL_PARTS.rag, recentTurns: [], summary: NORMAL_PARTS.summary,
  }, contextBudgetPolicyFromCostPolicy(POLICY_BASE, { service: 'interviewer.ask', trimOrder: ['summary'], allowDegrade: true }));
  A('A2 真实形 policy(window=131072/out=8192/margin=4096/in=131072)+正常形部件 → true(within_budget 零降级)',
    sessionSurvivesAskBudget(NORMAL_PARTS, POLICY_BASE) === true
    && normalDecision.ok && normalDecision.plan.status === 'within_budget');

  const tight = { ...POLICY_BASE, contextWindowTokens: 1000, maxOutputTokens: 100, contextSafetyMarginTokens: 1, maxInputTokens: 1000, contextToolReserveTokens: 0 };
  const tightParts = { system: 'a'.repeat(100), userData: 'b'.repeat(100), rag: 'c'.repeat(100), summary: 's'.repeat(1000) };
  const tightDecision = planDispatchBudget({
    system: tightParts.system, permissionSnapshot: '', schema: '', tools: '',
    userData: tightParts.userData, rag: tightParts.rag, recentTurns: [], summary: tightParts.summary,
  }, contextBudgetPolicyFromCostPolicy(tight, { service: 'interviewer.ask', trimOrder: ['summary'], allowDegrade: true }));
  A('A3 窗口紧 policy(available=899·system/userData/rag 各 100B+summary 1000B) → false(degraded·trimmedComponents 含 summary·裁后 fit)',
    tightDecision.ok && tightDecision.plan.status === 'degraded'
    && tightDecision.plan.trimmedComponents.includes('summary')
    && sessionSurvivesAskBudget(tightParts, tight) === false);

  const brokenWindow = { ...POLICY_BASE, contextWindowTokens: 100, maxOutputTokens: 100, contextSafetyMarginTokens: 1, maxInputTokens: 1000, contextToolReserveTokens: 0 };
  const brokenDecision = planDispatchBudget({
    system: NORMAL_PARTS.system, permissionSnapshot: '', schema: '', tools: '',
    userData: NORMAL_PARTS.userData, rag: NORMAL_PARTS.rag, recentTurns: [], summary: NORMAL_PARTS.summary,
  }, contextBudgetPolicyFromCostPolicy(brokenWindow, { service: 'interviewer.ask', trimOrder: ['summary'], allowDegrade: true }));
  A('A4 window=100/maxOutput=100 → available<1 → ok:false 臂 → true(委任 transport 权威拒绝臂)',
    !brokenDecision.ok && sessionSurvivesAskBudget(NORMAL_PARTS, brokenWindow) === true);

  let threw = false;
  let survived = false;
  try {
    survived = sessionSurvivesAskBudget(NORMAL_PARTS, { ...POLICY_BASE, contextSafetyMarginTokens: 0 });
  } catch {
    threw = true;
  }
  A('A5 safetyMargin=0(FromCostPolicy throw 形·与 transport validPositive 同破损面) → true 不抛(委任臂)',
    !threw && survived === true);

  A('A6 同输入双调恒等同输出(确定性·无随机无墙钟)',
    sessionSurvivesAskBudget(tightParts, tight) === sessionSurvivesAskBudget(tightParts, tight)
    && sessionSurvivesAskBudget(NORMAL_PARTS, POLICY_BASE) === sessionSurvivesAskBudget(NORMAL_PARTS, POLICY_BASE));
}

// ───────────────────────── 组B renderSessionSummarySection 单一装配源字节恒一 ─────────────────────────
function sectionB() {
  const tpl = getPrompt('interviewer.ask');
  const varsNo = { competency: '缓存一致性', difficulty: 3, kind: 'grounded', resumeFacts: [] as string[], followUp: undefined };
  const varsWith = { ...varsNo, session: FIX_SESSION };
  const noSs = tpl.buildData(varsNo);
  const withSs = tpl.buildData(varsWith);
  A('B1 单源恒一:buildData(带 session) === buildData(去 session)+renderSessionSummarySection(后缀差恒等)',
    withSs === noSs + renderSessionSummarySection(FIX_SESSION));
  A('B2 缺省臂:函数输出===\'\' ∧ buildData 去 session 输出不含「本场至今」(v7 形守卫)',
    renderSessionSummarySection(undefined) === '' && !noSs.includes('本场至今'));
  const outNoW = renderSessionSummarySection({ ...FIX_SESSION, weaknesses: [] });
  A('B3 段结构:「[本场至今·不可信数据」+「已考察能力与得分:」+弱点非空「累计评分证据弱点:」行·弱点空省行(P2-c)',
    renderSessionSummarySection(FIX_SESSION).includes('[本场至今·不可信数据')
    && renderSessionSummarySection(FIX_SESSION).includes('已考察能力与得分:')
    && renderSessionSummarySection(FIX_SESSION).includes('累计评分证据弱点:w-alpha;w-beta')
    && !outNoW.includes('累计评分证据弱点:'));
}

// ───────────────────────── 组C 静态接线锚(readFileSync 子串) ─────────────────────────
function sectionC() {
  const svc = readFileSync(fileURLToPath(new URL('../src/adaptive-interview-service.ts', import.meta.url)), 'utf8');
  const prompts = readFileSync(fileURLToPath(new URL('../../../packages/ai-runtime/src/prompts.ts', import.meta.url)), 'utf8');
  const lifecycle = readFileSync(fileURLToPath(new URL('../src/adaptive-lifecycle.ts', import.meta.url)), 'utf8');
  const consumer = readFileSync(fileURLToPath(new URL('../src/interview-consumer.ts', import.meta.url)), 'utf8');
  const main = readFileSync(fileURLToPath(new URL('../src/main.ts', import.meta.url)), 'utf8');
  const budget = readFileSync(fileURLToPath(new URL('../src/ask-context-budget.ts', import.meta.url)), 'utf8');
  const runtimeIndex = readFileSync(fileURLToPath(new URL('../../../packages/ai-runtime/src/index.ts', import.meta.url)), 'utf8');
  const pkg = readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8');
  A('C1 service:sessionSurvivesAskBudget(+session: sessionOut+askCostPolicy?: ModelCostPolicy 三锚在案',
    svc.includes('sessionSurvivesAskBudget(') && svc.includes('session: sessionOut') && svc.includes('askCostPolicy?: ModelCostPolicy'));
  A('C2 prompts.ts:export function renderSessionSummarySection+buildData 尾单源调用在案',
    prompts.includes('export function renderSessionSummarySection') && prompts.includes('renderSessionSummarySection(v.session)'));
  A('C3 四段管道:lifecycle+consumer 含 askCostPolicy: d.askCostPolicy ∧ main 含 modelCost.policies.primary 注入',
    lifecycle.includes('askCostPolicy: d.askCostPolicy') && consumer.includes('askCostPolicy: d.askCostPolicy')
    && main.includes('askCostPolicy: modelCost.policies.primary'));
  A('C4 CTX-02 真消费非复刻:budget 含 planDispatchBudget(+trimOrder: ASK_SESSION_TRIM_ORDER ∧ runtime index 含单源导出',
    budget.includes('planDispatchBudget(') && budget.includes('trimOrder: ASK_SESSION_TRIM_ORDER')
    && runtimeIndex.includes('renderSessionSummarySection'));
  A('C5 worker package.json:prove:context-budget-wire 注册在案', pkg.includes('prove:context-budget-wire'));
}

// ───────────────────────── 主序 ─────────────────────────
sectionA();
sectionB();
sectionC();
console.log(`context-budget-wire prove: ${failures === 0 ? 'ALL PASS' : `${failures} FAIL`}`);
if (failures > 0) process.exitCode = 1;
