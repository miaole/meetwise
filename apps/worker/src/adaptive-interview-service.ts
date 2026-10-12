/**
 * 自适应面试 agent 的**真 deps 工厂**(把集成图的 fake deps 换成真:角色拆分 + 经 invoke 关口 + CRAG + threadId 一棵树)。
 * 角色各自一个 prompt(注册表,动静分离):规划官 planner.competencies / 面试官 interviewer.ask/ 评估官 mock-interview.evaluate(报告走舱壁,不在图内)。
 * 每次模型调用过 invoke(双校验/exactly-once/trace),带 threadId(Langfuse 一场面试一棵树)+ sources/retrieval(provenance+topScore 信号)。
 */
import { z } from 'zod';
import { asPrincipal, normalizeQuestion, recordUsage, SHADOW_METER_VERSION, type DbPool, type QuestionUsageLedgerEntry } from '@meetwise/db';
import { invoke, promptedModel, isAdmissionRefusalRetryable, type ModelClient, type GraphObserver } from '@meetwise/ai-runtime';
import { CRISIS_DISPOSITION_REASON, cragRetrieve, formatUntrustedResearchMaterial, isVerbatimCopy, refsGroundedInFacts, toCompetencySpecs, isNonAnswer, stripScoringManipulation, approvedTemplateGeneration, classifyQuestionGenerationError, critiqueQuestion, modelGeneration, unavailableGeneration, resolveCitedSources, QUESTION_GENERATION_REROLL_FAMILY, CANDIDATE_PROFILE_SIGNALS, type ResearchBoundaryDecision, type ScoredRef, type SourceDoc, type CompetencySpec } from '@meetwise/domain';
import type { AdaptiveDeps } from '@meetwise/ai-graphs';
import { CRAG_QUERY_TARGET_ROLE_MAX_CHARS, CRAG_QUERY_TECH_STACK_MAX_CHARS } from './qbank-track-local-retrieve.ts';
import { wasAsked, pastWeakDimensions } from './memory-service.ts';
import { invokeEvaluationOnce, evaluateOutcomeFromValue } from './interview-service.ts';
import { withGenerationProgress } from './generation-progress.ts';

/** Native embed/rerank miss is not “empty qbank”; do not invent a stem from the competency name. */
function nativeRetrievalFailureToken(reason: string): string | null {
  const match = /(embedder|reranker)_(not_configured|timeout|malformed)/.exec(reason);
  return match ? match[0] : null;
}

const AskSchema = z.object({ q: z.string().min(1).max(2000), refs: z.array(z.string()) });   // q 封顶:模型出的题理应短;超长=异常输出,schema 闸拦下重试(也防评估侧截断吃掉答案)

const QUESTION_OPERATION_ID = 'interview.question-generation.v1' as const;
/**
 * G7FIX-4R 有界换题上限:判重命中后每 turn 最多重掷 2 次(单 turn 生成调用总数 ≤3 含初诊)。
 * per-turn 计数、跨 turn 不累计、无循环放大;耗尽仍 unavailableGeneration('duplicate_question') 原样判死,
 * fail-closed 只从「首撞即死」收窄为「撞满上限才死」,零验证放宽。
 */
const MAX_DUPLICATE_REROLL = 2;
/**
 * AG-F(刀F·裁决①a 沿既有形制同值·可调):四类确定性出题失败族（schema 违例/供应商 malformed
 * 含刀 B deterministic_output_* 码/business 闸拒绝/external_outcome_unknown,族边界=
 * QUESTION_GENERATION_REROLL_FAMILY）+critique 复检（裁决⑤a 收进 seam）的有界 re-roll 上限。
 * per-turn 计数、跨 turn 不累计;初诊+族内 re-roll 单窗生成调用总数 ≤3 含初诊。每 roll 独立
 * logical node 各冻结一份静态 max 预留（0088 等值触发器既有机制·专家 §二-3 :18 预留上限联动,
 * 帽即硬上限）。键/revision 双换沿 G7FIX-4R `:r{k}` 形制、与判重 re-roll 共键空间统一计数
 * （`:r{k}` 单调递增零复用:同键重掷=缓存回放同错 invoke.ts,同 revision 异键=0088 canonical
 * mismatch 两死面）。耗尽 → 交图节点换 competency 臂（EXPERT §七 :65·不整场终场）;族外失败
 * 原形判死零位移。
 */
const MAX_ERROR_REROLL = 2;
/**
 * S2-B3(RESUME-GROUNDING):grounded refs 闸拒绝后的有界重试上限——独立计数(沿 G7FIX-4R 有界语义形制,
 * 但**禁复用/改动**其判重 re-roll 键面),键空间 `:gr{k}`,与判重 re-roll `:r{k}`、初诊 `:0` 零碰撞;
 * 耗尽回退既有固定模板(不判死)。单 turn grounded 生成调用总数 ≤ 1+MAX_GROUNDED_REFS_RETRY(+判重 re-roll 另计)。
 */
const MAX_GROUNDED_REFS_RETRY = 2;
/** S2-B2:grounded refs 组合闸(business #193 refsGroundedInFacts)拒绝时 invoke 返回的业务错误码。 */
const GROUNDED_REFS_GATE_ERROR = 'business:grounded_refs_not_in_facts';

/* ───────── S1-A3/S2-B1(RESUME-GROUNDING):简历 facts worker 侧确定性选择器(纯函数·禁模型选·禁进图 state) ───────── */

/** 敏感域词小黑名单(P4 选择器加固):薪资/证件/生日年龄/婚育/健康——脱敏正则管不住的域词面。 */
const SENSITIVE_FACT_RES: readonly RegExp[] = [
  /薪资|工资|薪酬|薪水|待遇/,
  /身份证|证件号|护照号/,
  /生日|出生/,
  /\d+\s*岁/,
  /已婚|未婚|婚育|怀孕|备孕/,
  /患病|病史|病历|体检|残疾/,
];
/** C1 选择器过滤:脱敏产物行(含 [已脱敏]/*** 掩码值)、敏感域词行、重复行不入 prompt 池。 */
function sanitizeResumeFactsForPrompt(texts: readonly unknown[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of texts) {
    if (typeof raw !== 'string') continue;
    const t = raw.trim();
    if (!t || t.includes('[已脱敏]') || t.includes('***')) continue;
    if (SENSITIVE_FACT_RES.some((re) => re.test(t))) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}
/** 按**码点**安全截取(末位高代理回退一位,不留半个字符;形制沿 model-client codepointSafeSlice)。 */
function boundedTextSlice(s: string, max: number): string {
  if (s.length <= max) return s;
  let end = max;
  const code = s.charCodeAt(end - 1);
  if (code >= 0xd800 && code <= 0xdbff) end -= 1;
  return s.slice(0, end);
}
/** facts 池帽(deps 闭包持有上限):planner ≤8 条与 grounded ≤4 条的选取都从本池确定性截取。 */
export const RESUME_FACT_POOL_MAX_COUNT = 24;
export const RESUME_FACT_POOL_MAX_CHARS = 200;
export const PLANNER_FACTS_MAX_COUNT = 8;
export const PLANNER_FACTS_MAX_CHARS = 120;
export const GROUNDED_FACTS_MAX_COUNT = 4;
export const GROUNDED_FACTS_MAX_CHARS = 200;
/** S3 追问上下文预算(C13/C15):题目摘要/作答摘要/证据弱点逐段有界。 */
export const FOLLOWUP_QUESTION_MAX_CHARS = 200;
export const FOLLOWUP_ANSWER_SUMMARY_MAX_CHARS = 200;
export const FOLLOWUP_WEAKNESS_MAX_CHARS = 80;
export const FOLLOWUP_WEAKNESS_MAX_COUNT = 3;

/** 供 prompt 的简历 facts 上下文( worker deps 闭包持有,禁入图 state)。 */
export interface FollowUpAskContext {
  question: string;
  answerSummary: string;
  weaknesses: string[];
}

/** A-3 确定性相关性:关键词(能力/岗位)与 fact 的词元+CJK bigram 重合度(0..1;禁模型选 facts,可 gate 可审计)。 */
function relevanceScore(fact: string, keyword: string): number {
  const tokens = new Set<string>();
  for (const word of keyword.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    if (word.length < 2) continue;
    tokens.add(word);
    for (let i = 0; i + 2 <= word.length; i += 1) tokens.add(word.slice(i, i + 2));
  }
  if (tokens.size === 0) return 0;
  const hay = fact.toLowerCase();
  let hits = 0;
  for (const tok of tokens) if (hay.includes(tok)) hits += 1;
  return hits / tokens.size;
}
/** 稳定排序(得分降序,同分保持池序=experience>skills 小节优先级),确定性可复现。 */
function rankedFacts(pool: readonly string[], keywords: readonly string[]): string[] {
  return pool
    .map((fact, index) => ({ fact, index, score: keywords.reduce((sum, k) => sum + relevanceScore(fact, k), 0) }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map((x) => x.fact);
}
/**
 * C1:resume_profile.structured(experience/skills 小节)→ 有界 facts 池(小节优先 experience>skills ∩
 * 脱敏/敏感词过滤 ∩ 池帽)。纯函数;同一 RLS+admit 门读出后仅存活于 worker deps 闭包,直达模型 seam。
 */
export function buildResumeFactPool(profile: { experience?: unknown; skills?: unknown }): string[] {
  const textsOf = (v: unknown): string[] => (Array.isArray(v)
    ? v.map((x) => (x && typeof x === 'object' && 'text' in x ? String((x as { text: unknown }).text ?? '') : typeof x === 'string' ? x : '')).filter(Boolean)
    : []);
  return sanitizeResumeFactsForPrompt([...textsOf(profile.experience), ...textsOf(profile.skills)])
    .map((f) => boundedTextSlice(f, RESUME_FACT_POOL_MAX_CHARS))
    .slice(0, RESUME_FACT_POOL_MAX_COUNT);
}
/** A-1:planner 事实预算——按岗位相关性 ≤8 条 × ≤120 字符/条(严于 prompts.ts 20k 兜底,EXEC 只收严)。 */
export function selectPlannerFacts(pool: readonly string[], role: string): string[] {
  return rankedFacts(pool, role.trim() ? [role.trim()] : [])
    .slice(0, PLANNER_FACTS_MAX_COUNT)
    .map((f) => boundedTextSlice(f, PLANNER_FACTS_MAX_CHARS));
}
/** B-1:grounded 出题事实预算——与目标能力最相关 2-4 条 × ≤200 字符/条(确定性选,同 A-3 形制)。 */
export function selectGroundedFacts(pool: readonly string[], competency: string): string[] {
  return rankedFacts(pool, competency.trim() ? [competency.trim()] : [])
    .slice(0, GROUNDED_FACTS_MAX_COUNT)
    .map((f) => boundedTextSlice(f, GROUNDED_FACTS_MAX_CHARS));
}

/* ───────── H2 #79:CRAG 查询构造(岗位/技术栈段)·协议与 parseCragPlannerQuery 同源 ───────── */
/** 构造段清洗:含保留词(岗位/栈/难度)/控制字符/超长 → 段整体缺省(确定性降级为旧两段形,非截断非改写;
 *  解析端(qbank-track-local-retrieve.parseCragPlannerQuery)对非法段 fail-closed null——构造端先清洗,
 *  生产查询永不触发解析拒绝面;解析端保留严格形制防未来其他构造源绕过清洗)。 */
function sanitizeCragSegment(value: string, max: number): string | null {
  const v = value.trim();
  if (!v || v.length > max || /[\u0000-\u001f\u007f]/.test(v) || /岗位|栈|难度/.test(v)) return null;
  return v;
}

export interface CragQueryBuildContext {
  /** 用户显式岗位(begin 头 targetRole 透传,#259 供给线)。 */
  targetRole?: string;
  /** 技术栈=resume facts 池既有面(selectGroundedFacts 同源);取最相关 ≤2 条 × ≤60 字符拼接。 */
  techStackFacts?: readonly string[];
}

/** 组装 CRAG planner 查询:`${competency}[ 岗位{role}][ 栈{stack}] 难度${difficulty}`(旧两段形字节兼容)。 */
export function buildCragPlannerQuery(competency: string, difficulty: number, ctx: CragQueryBuildContext = {}): string {
  let q = competency.trim();
  const role = ctx.targetRole ? sanitizeCragSegment(ctx.targetRole, CRAG_QUERY_TARGET_ROLE_MAX_CHARS) : null;
  if (role) q += ` 岗位${role}`;
  const stack = (ctx.techStackFacts ?? [])
    .map((f) => sanitizeCragSegment(f, 60)).filter((f): f is string => f !== null)
    .slice(0, 2).join(' ');
  const stackClean = stack && stack.length <= CRAG_QUERY_TECH_STACK_MAX_CHARS ? stack : null;
  if (stackClean) q += ` 栈${stackClean}`;
  return `${q} 难度${difficulty}`;
}

/** #79:scenario 无素材显式降级模板(自撰,零模型调用;括注明示降级,非伪造素材非静默通用题)。 */
export function scenarioDegradeTemplate(competency: string): string {
  return `（题库暂无「${competency}」的情景题素材，已降级为通用情景题）请描述一个你亲身处理过的、与「${competency}」相关的具体场景，说明背景、关键决策、取舍理由和最终验证方式。`;
}

/* ───────── billing P1（BILL1-TOPIC-FIELDS 修法⑦）：0171 question_usage_ledger 归集挂点（§8 裁决项②按推荐行使） ─────────
 * 挂点=worker 侧本文件三调用点（plan `${threadId}:plan` / ask generate() 全体键（初诊+:gr{k}}+:r{k}）/ assess 评估键），
 * ai-runtime 零触。归集行 usage 列由 recordUsage 从 ai_model_invocation 按键单语句复制（单真相零二次记账）；
 * usage_source='missing' ↔ 上游 0174 打标行 'usage_missing'（§1.4 映射）。 */
/** 派发前确定性拒绝（MODEL-OP-02 共享准入权威·零外呼臂错误码族）→ 'admission_rejected'；其余调用失败 → 'generation_failed'。 */
export function usageCauseForInvokeError(error: string): 'generation_failed' | 'admission_rejected' {
  return error === 'model_circuit_open' || error === 'model_circuit_half_open'
    || error === 'model_concurrency_exhausted' || error.startsWith('budget')
    ? 'admission_rejected'
    : 'generation_failed';
}
/**
 * 归集写=审计面 **fail-soft**（蓝本 §6.2 原文「只做成本侧和审计，不参与默认方案定价」——归集写失败
 * 绝不阻断面试主链；与 reserve/settle 计费函数的 fail-loud 升级语义刻意相反）。recordUsage 内部
 * PK (owner,invocation_key) ON CONFLICT DO NOTHING = 崩溃重放天然去重（蓝本 §6.5 原文）。
 * 失败仅 stderr 观测（审计面可见性），零业务升级。
 */
function recordUsageSoft(pool: DbPool, owner: string, entry: QuestionUsageLedgerEntry): void {
  void asPrincipal(pool, owner, (c) => recordUsage(c, owner, entry)).catch((error: unknown) => {
    console.error('question_usage_ledger_write_failed', { cause: entry.cause, interviewId: entry.interviewId, error: String((error as Error)?.message ?? error) });
  });
}

export interface AdaptiveServiceDeps {
  pool: DbPool; owner: string; threadId: string; model: ModelClient;
  /** 快模型(qwen-turbo):评分/relevant 等约束性任务用,显著降反问延迟;缺省回退 model(兼容旧调用)。出题仍用 model(质量关键)。 */
  fastModel?: ModelClient;
  competencies: (string | CompetencySpec)[];
  /**
   * Only an authorization bit may reach graph deps; resume text remains in the profile artifact.
   * (C4/RESUME-GROUNDING)有界 facts 池例外:仅在 worker deps 闭包内持有、经 `<data-nonce>` 围栏直达
   * 模型 seam(planner/grounded ask/追问上下文),**禁入图 state/checkpoint/interrupt/SSE/episode**;
   * 模型产出的 grounded 题面属派生内容可持久化,其擦除残差归 #183/#153 PRIVACY-FACE 收口(Non-claims)。
   */
  resumeProfileAvailable?: boolean;
  /** 有界脱敏 facts 池(C1 buildResumeFactPool 产出;闭包内供 prompt,禁入图 state)。 */
  resumeFacts?: string[];
  /** H4 R3(#252):focus 弱项标签(专项面软预算 5-8 派生面;只进 plan 节点,绝不影响难度/信心)。 */
  focusWeaknesses?: string[];
  /** H2 #79(#259 供给线):用户显式岗位(begin 头透传)——CRAG 查询岗位段供给。缺省 undefined=旧两段查询。 */
  targetRole?: string;
  localRetrieve: (q: string) => Promise<ScoredRef[]>;   // 真:annSearch over vector_chunk
  webExplore: (q: string) => Promise<SourceDoc[]>;      // 真:allowlist 抓取(源由配置定)
  /** 低置信 CRAG 才会调用的、有源数/字符/调用预算的多源取证。未注入时兼容旧 web seam。 */
  deepResearch?: (q: string) => Promise<SourceDoc[]>;
  researchBoundary?: (q: string) => ResearchBoundaryDecision;
  competencyKeywords?: Record<string, string[]>;
  /** 软预算初值；隔离 E2E 可显式缩短，生产不传则按覆盖计划派生。 */
  maxTurns?: number;
  /** 平台 runaway 杀开关；隔离 E2E 可与软预算一起压低控费。生产默认 120。 */
  absoluteMaxTurns?: number;
  /** 仅携带图拓扑和数值状态的观测 seam，不向图节点暴露供应商 SDK。 */
  graphObserver?: GraphObserver;
  /** 运行时短暂水合答案；不得把原文放回图 state（状态）。 */
  loadAnswer?: AdaptiveDeps['loadAnswer'];
}

/* ───────── QBANK-PLANNER-HONESTY #201(planner 输出上限/相关性·#270 同域):确定性闸构件(同文件 relevanceScore/weaknessMatches 先例形·零新依赖·禁 embedding) ───────── */
/** planner 输出条数硬闸(裁决项②):min(3).max(5)——与 planner system「提炼 3–5 个」对齐(软约束→schema 硬闸)。 */
export const PLANNER_COMPETENCY_MIN_COUNT = 3;
export const PLANNER_COMPETENCY_MAX_COUNT = 5;
/** 单个能力名长度封顶(裁决项②·AskSchema q.max(2000) 封顶形;值沿 targetRole/focus 安全标量 100 同域纪律——
 *  planner system 明示「用简短技术名词」,超长=异常输出 schema 闸拦下)。 */
export const PLANNER_COMPETENCY_MAX_CHARS = 100;
/** #201 兜底默认集(:221 优雅降级三件套提名为具名常量·值逐字零变·prove 直行使;规划失败/校验拒 → 面试仍开)。 */
export const PLANNER_DEFAULT_COMPETENCIES = ['项目经验', '技术深度', '问题解决'];
/** planner 输出 schema(#201 硬闸具名导出·prove 直行使):条数 3-5 + 单名 ≤100 封顶 + 非空串。 */
export const PlannerPlanSchema = z.object({ competencies: z.array(z.string().min(1).max(PLANNER_COMPETENCY_MAX_CHARS)).min(PLANNER_COMPETENCY_MIN_COUNT).max(PLANNER_COMPETENCY_MAX_COUNT) });
/** 能力名 vs 岗位叶子领域相关性阈值(weaknessMatches 阈值形同源·确定性·无模型·可 gate)。 */
export const COMPETENCY_RELEVANCE_THRESHOLD = 0.5;
/**
 * #201 纯函数:能力名 vs 岗位叶子领域词表(domain CANDIDATE_PROFILE_SIGNALS 同源单源,#270 v4 同一词典)的相关性判定:
 * 归一化精确相等短路 → 逐信号 weaknessMatches(词元+CJK bigram 双向取最大 ≥ 阈值)。任一信号命中=域内。
 * 未知叶/空词表/空名 → true(零误杀:叶子源缺失=闸不适用,如实登记;空名由 schema min(1) 拒)。
 * 禁 embedding/向量召回(§3-6 确定性构件纪律)。
 */
export function competencyMatchesLeafDomain(name: string, leafTrackId: string | undefined): boolean {
  if (!leafTrackId) return true;
  const signals = (CANDIDATE_PROFILE_SIGNALS as Record<string, readonly string[]>)[leafTrackId];
  if (!signals || signals.length === 0) return true;
  const a = normalizeQuestion(name);
  if (!a) return true;
  return signals.some((s) => weaknessMatches(a, s));
}
/**
 * #201 businessValidate 本体(具名纯函数·prove 直行使):空计划 → empty_plan(既有错误码零改);**全离题**计划
 * (任一能力名均低于叶子领域阈值)→ off_topic_competency 整案拒 → :221 优雅降级默认集三件套,面试仍开
 * (Ban 硬删能力)。叶子源缺失(relevanceLeaf=undefined)→ 全放行(闸不适用零误杀,如实登记)。
 * 混合计划(部分离题)不整案拒——交 filterCompetenciesByLeafDomain 逐名过滤(§2-2「被拒/过滤」双臂·R3 被过滤
 * 能力名不进组装产物),域内名零误伤。
 */
export function plannerPlanBusinessError(competencies: string[], relevanceLeaf: string | undefined): string | null {
  if (competencies.length === 0) return 'empty_plan';
  if (!relevanceLeaf) return null;
  const allOffTopic = competencies.every((n) => !competencyMatchesLeafDomain(n, relevanceLeaf));
  return allOffTopic ? 'off_topic_competency' : null;
}
/**
 * #201 过滤臂(纯函数·prove 直行使):逐名丢弃叶子域外能力名(§2-2「过滤」/R3「被过滤能力名不出现在组装产物」),
 * 域内名原序保留零误伤;全被滤空 → 调用方(planCompetencies)落默认集三件套。叶子源缺失 → 恒等(零误杀)。
 */
export function filterCompetenciesByLeafDomain(names: readonly string[], relevanceLeaf: string | undefined): { kept: string[]; dropped: string[] } {
  if (!relevanceLeaf) return { kept: [...names], dropped: [] };
  const kept = names.filter((n) => competencyMatchesLeafDomain(n, relevanceLeaf));
  return { kept, dropped: names.filter((n) => !kept.includes(n)) };
}

/** 规划官:据岗位+简历提目标能力(plan-and-solve 的 plan)。经 invoke。**约束性任务,走快模型**(缺省回退 model)。
 *  H4 R2④(#252 focus 进题链·断点⑤):第 7 形参 focus=本场报告 gap 维度名(上一轮评估摘要 criterion+弱点标签,
 *  fix-roadmap :97 验收原文)——只进 planner prompt 'planner.competencies' v3 可选段(喂 planner·「考哪些能力」面),
 *  prompt v3 buildData 对缺省/空数组逐字节回退 v2 输出(resume-grounding B1/S1-1 守卫);**绝不影响难度/信心**。
 *  I3 JOB-MGMT(#197/#258·裁决⑥):第 8 形参 job=岗位侧供给(competencies+JD 摘要·interview-consumer 经
 *  RLS+快照同源门条件化供给)——只进 planner prompt 'planner.competencies' v4 可选段;缺省 undefined →
 *  buildData 与 v3 输出逐字节一致(同上守卫);只影响「考哪些能力」,绝不影响难度/信心。
 *  QBANK-PLANNER-HONESTY #200-A ⑷(裁决项①=A 路·裁决项⑥ data 段+逐字节回退):第 9 形参 quizQuestions=押题题面
 *  (begin quiz-id 头→payload sourceQuizId→consumer owner-scoped 读 resume_quiz.questions→本参;只进 planner
 *  <data> 押题段·禁入图 state;缺省 undefined → 段不渲染=现状字节)。#201:第 10 形参 relevanceLeaf=路由快照
 *  primary 叶(缺省 undefined=相关性闸不适用零误杀);schema 3-5/单名 ≤100 硬闸 + businessValidate 全离题整案拒
 *  + 混合计划逐名过滤(域内零误伤·被滤名不进组装产物);拒/滤空沿 :221 优雅降级默认集(面试仍开·Ban 硬删能力·
 *  Ban 无界重试=校验拒零重试直落兜底,可计数)。
 *  [merge nail 双刀接龙登记]QP 分支独立计形(quizQuestions=8/relevanceLeaf=9)与 I3 已并主线(job=8)同位互斥:
 *  并线后形参序=focus(7)→job(8,I3 在先钉死)→quizQuestions(9)→relevanceLeaf(10),prompt vars 携 job+quizQuestions
 *  双段,QP 侧编号随演顺延两位;两可选段互斥缺省,语义零纠缠。 */
export async function planCompetencies(pool: DbPool, owner: string, threadId: string, model: ModelClient, role: string, facts: string[], focus?: string[], job?: { competencies: string[]; jdSummary: string }, quizQuestions?: string[], relevanceLeaf?: string): Promise<CompetencySpec[]> {
  // billing P1 修法⑦：plan 归集键（原内联串零变·仅提变量供归集行同值）。
  const planInvocationKey = `${threadId}:plan`;
  const out = await invoke({
    idempotencyKey: planInvocationKey, operation: { id: 'interview.competency-planning.v1', businessRevision: planInvocationKey }, threadId, privacyInterviewId: threadId,
    // #201 硬闸(具名导出·prove 直行使):条数 3-5 + 单名 ≤100 封顶;businessValidate=相关性闸纯函数委托。
    schema: PlannerPlanSchema,
    businessValidate: (v) => plannerPlanBusinessError(v.competencies, relevanceLeaf),
    model: promptedModel(model, 'planner.competencies', { role, facts, focusWeaknesses: focus, job, quizQuestions }),
  }, pool, owner);
  // billing P1 修法⑦（裁决项②）：plan 调用归集行——成功 system_plan / 失败臂同写
  // （MODEL-OP-02 零外呼拒绝臂=admission_rejected，余=generation_failed；usage 列由 recordUsage 归集复制）。
  // billing P2 修法②：meter_version='shadow-v1' 增量兑现（0171 预留列「P2 起填」·存量 NULL 零回填）。
  recordUsageSoft(pool, owner, {
    invocationKey: planInvocationKey, interviewId: threadId, operationId: 'interview.competency-planning.v1',
    cause: 'error' in out ? usageCauseForInvokeError(out.error) : 'system_plan',
    meterVersion: SHADOW_METER_VERSION,
  });
  // 优雅降级:规划失败 → 用默认能力集,面试仍可开(不因规划抖动整场开不了)。
  // toCompetencySpecs(纯逻辑):top 1-2 标 core(追问上限 3)+ 确定性附加 1 个行为槽(题型 behavioral)。
  // #201 过滤臂:混合计划(部分离题)逐名滤除域外名(域内原序零误伤·被滤名不进组装产物);全滤空 → 默认集三件套。
  const names = 'error' in out ? PLANNER_DEFAULT_COMPETENCIES
    : (() => { const { kept } = filterCompetenciesByLeafDomain(out.value.competencies, relevanceLeaf); return kept.length > 0 ? kept : PLANNER_DEFAULT_COMPETENCIES; })();
  const biased = await biasByPastWeakness(pool, owner, names);   // 历史弱项软偏置(hint,非硬过滤;快照进能力清单一次,decideNext 对其纯运算)
  return toCompetencySpecs(biased);
}

/** 弱项软偏置(**反 confirmation-bias**):把规划官**本次已提**、且命中历史弱项(assessment_report gap=true)的能力**稳定前移**
 *  → 更可能落进 core(复测更充分);但**只重排、绝不注入岗位无关能力**(hint 非硬过滤)。
 *  关键:记忆只影响"考哪些能力",**绝不影响"多难/多有信心"**——难度仍由 initMind 从中性 2 起(上次弱→这次中性难度复测,prior 完全向中性衰减),
 *  confidence 恒从 0 起(只累积本场证据)。空历史(冷启动/记忆不可用)→ 稳定分区自然恒等(**非特殊分支**:空集 → 全部落后桶、保持原序)。
 *  (#204 GROWTH-GEN S2:export 仅 prove 可见性——interview.proof ③a 直接行使本函数断言弱项偏置非 no-op。)
 *  H4 R7(#203 语义匹配·#203 终裁留本刀):命中判定由「归一化精确串等」升级为**确定性相似度匹配**(同文件 :94-106
 *  relevanceScore 词元+CJK bigram 纯函数先例·A-3 生产在用)——**禁 embedding/向量召回**(memory lean MVP 注记
 *  memory-service.ts:1-7 2 专家审计砍瘦定稿·Ban 条款照守);同义名(如「高并发能力」↔「高并发」)命中、异名
 *  (「项目经验」↔「技术深度」)不误挡,精确相等恒命中短路。阈值固定 0.5(确定性·无模型·可 gate)。
 *  分桶面(#203 修法「按岗位/简历分桶」)如实缩面:assessment_report 无岗位/简历列,分桶需新持久化(零迁移 Ban)
 *  → 走 REQUEST 降级条款登记,本刀落 owner 域即桶(RLS owner 过滤原样=租户桶),岗位/简历分桶整条登记后刀。 */
export const WEAKNESS_MATCH_THRESHOLD = 0.5;
/** 弱项名确定性匹配:归一化精确相等短路 → relevanceScore 双向取最大(词元+CJK bigram 覆盖度)≥阈值。纯函数·无模型·禁 embedding。 */
export function weaknessMatches(name: string, weak: string): boolean {
  const a = normalizeQuestion(name);
  const b = normalizeQuestion(weak);
  if (!a || !b) return false;
  if (a === b) return true;
  return Math.max(relevanceScore(a, b), relevanceScore(b, a)) >= WEAKNESS_MATCH_THRESHOLD;
}
export async function biasByPastWeakness(pool: DbPool, owner: string, names: string[]): Promise<string[]> {
  const weak = await pastWeakDimensions(pool, owner).catch(() => [] as string[]);   // 记忆不可用/冷启动 → [] → 恒等(fail-soft,绝不因判重故障阻断开面)
  const isWeak = (n: string) => weak.some((w) => weaknessMatches(n, w));            // R7 确定性相似度匹配(语义前移·hint 非硬过滤)
  return [...names.filter(isWeak), ...names.filter((n) => !isWeak(n))];             // 稳定分区:弱项前移、其余原序(逐字节原形·零逻辑改)
}

export function buildAdaptiveDeps(d: AdaptiveServiceDeps): AdaptiveDeps {
  // S3/C13/C15(RESUME-GROUNDING):追问上下文(上轮题目摘要+作答摘要+评分证据弱点)只在本闭包内派生与持有,
  // **禁新增图 state 字段**——follow-up 与 evalAnswer 同一次 graph invoke 内生成:assess 先跑(置上下文)、
  // genQuestion 后读(retrieveAndGenerate 渲染进 interviewer.ask v7 的 <data> 不可信段)。
  // 作答摘要派生顺序钉死:stripScoringManipulation **先**、确定性截取 ≤200 字符**后**(禁倒置);
  // 证据弱点 criteria-only(quote 在评分消费面已弃,禁改传 quotes);原始作答仍禁入 state/checkpoint。
  let lastFollowUp: FollowUpAskContext | null = null;
  // AG-F(刀F):统一 per-turn 掷序计数器——`:r{k}` 键单调递增零复用（键空间纪律:同键重掷=缓存回放
  // 同错 invoke.ts cached 臂;键复用撞 0088 canonical mismatch）。判重 re-roll/四类族 re-roll/换
  // competency 续掷（图节点换序后同 turn 再入）共此一计数;`:gr{k}` grounded 专闸既有面零碰撞;
  // 跨 turn 复位（per-turn 语义,与 MAX_DUPLICATE_REROLL/MAX_ERROR_REROLL 帽口径一致）。
  let rollTurn = -1;
  let rollSeq = 0;
  return {
    competencies: d.competencies,
    resumeProfileAvailable: d.resumeProfileAvailable,
    focusWeaknesses: d.focusWeaknesses,
    loadAnswer: d.loadAnswer ?? (async () => { throw new Error('answer_artifact_unavailable'); }),
    maxTurns: d.maxTurns,
    absoluteMaxTurns: d.absoluteMaxTurns,
    graphObserver: d.graphObserver,
    competencyKeywords: d.competencyKeywords,
    async retrieveAndGenerate(competency, difficulty, attempt, turn, _legacyFacts, kind, asked) {
      // `attempt` remains in this compatibility seam so older graph fixtures
      // type-check, but a non-zero value must never issue another provider
      // request for the same logical node.  The graph only calls zero.
      // AG-F(刀F):四类族内 re-roll 与「耗尽换 competency 继续」的全部重掷都走 seam 内部
      // 键+revision 双换（统一 `:r{k}` 计数）产生的新独立 logical node——attempt 通道恒 0、
      // 同 logical node 永不二派发语义零放宽（registry「any retry requires a new revision
      // and therefore a new, auditable node」契约原文·本禁令本体字节零改）。
      if (attempt !== 0) {
        return unavailableGeneration('attempt_replay_forbidden', {
          operationId: QUESTION_OPERATION_ID,
          idempotencyKey: `${d.threadId}:ask:t${turn}:0`,
        });
      }
      // C5/S2-B1(RESUME-GROUNDING):`_legacyFacts` 图侧传参退役注记——facts 只经 worker deps 闭包
      // (d.resumeFacts)进 prompt,图 state 永不携带;graph 侧恒调 retrieveAndGenerate(..., [], kind)。
      // 选定=确定性相关性(与目标能力最相关 2-4 条 × ≤200 字符,selectGroundedFacts)。
      const groundedFacts = kind === 'grounded' ? selectGroundedFacts(d.resumeFacts ?? [], competency) : [];
      // Candidate-specific first questions have a stricter trust boundary than
      // generic qbank questions.  Only a parsed fact may be quoted as a claim
      // about the candidate; everything else is a neutral request to explain
      // that fact.  This avoids a model turning “Redis” into a fabricated
      // e-commerce project, metric, employer or duration.
      if (kind === 'grounded' && groundedFacts.length === 0) {
        // 无可用选定事实(未授权/画像无事实/全被选择器过滤)→ 既有固定模板回退,零模型调用;
        // 模板文案与既有逐字一致(:107 无授权版 / :109 授权版),模板本身零改。
        return approvedTemplateGeneration(
          d.resumeProfileAvailable
            // Do not repeat a resume fact: the question is checkpointed, sent by
            // interrupt/SSE, recorded in events and later normalized into an
            // episode.  The candidate can choose which authorized experience to
            // discuss without that original fact becoming a second data copy.
            ? `请结合你简历中一段与「${competency}」相关的真实经历，说明你的做法、关键取舍和验证结果。`
            : `请结合你的实际经验，说明在「${competency}」方面你会如何做关键取舍，并如何验证结果。`,
        );
      }
      // TOKSTREAM 阶段1(裁定触发面之一):interviewer.ask 模型调用面包装层回调——题间等待(检索→生成→校验)
      // 发生成进度事件(invoke 关口零改动;attempt≠0 重放与 grounded 无事实模板回退在上方早退,不产生进度事件;
      // grounded 带事实真生成走本层,正常发进度)。
      // AG-F(刀F):per-turn 计数器复位 + 初诊键选定——fresh turn 初诊键/revision 形零变
      // （`:0`+裸 revision,g7fix4 断言面）;「耗尽换 competency」同 turn 再入（图节点换序回环）时
      // 初诊**不复用** `:0`（同键=缓存回放同错/账本双死面）——续统一 `:r{k}` 键+同步 revision,
      // 新独立 logical node,单调递增零复用。
      if (turn !== rollTurn) {
        rollTurn = turn;
        rollSeq = 0;
      }
      if (rollSeq > 0) rollSeq += 1;
      const initialKey = rollSeq === 0 ? `${d.threadId}:ask:t${turn}:0` : `${d.threadId}:ask:t${turn}:r${rollSeq}`;
      const initialRevision = rollSeq === 0 ? `${d.threadId}:ask:t${turn}` : initialKey;
      return withGenerationProgress(d.pool, d.owner, d.threadId, {
        jobKind: 'next_question', operationId: QUESTION_OPERATION_ID,
        attemptKey: initialKey, segments: ['retrieve', 'generate', 'validate'],
      }, async (run) => {
      // 题型决定接地(H2 #79 扩面):fundamental/scenario 用 CRAG 检索真题素材;grounded 走简历选定
      // 事实(上方早退),behavioral 考行为面经、与技术题库语料错配——检索白名单 EXEC 裁决=fundamental
      // +scenario,behavioral 纳入与否留后刀如实登记(非「漏接」)。
      const useRetrieval = kind === 'fundamental' || kind === 'scenario';
      const cragQuery = buildCragPlannerQuery(competency, difficulty, {
        targetRole: d.targetRole,
        techStackFacts: selectGroundedFacts(d.resumeFacts ?? [], competency),
      });
      const { local, web, verdict } = useRetrieval
        ? await cragRetrieve(cragQuery, { localRetrieve: d.localRetrieve, webExplore: d.webExplore, deepResearch: d.deepResearch, researchBoundary: d.researchBoundary })
        : { local: [] as ScoredRef[], web: [] as SourceDoc[], verdict: undefined };
      if (useRetrieval && verdict) {
        const nativeError = nativeRetrievalFailureToken(verdict.reason);
        if (nativeError) {
          return unavailableGeneration(classifyQuestionGenerationError(nativeError), {
            operationId: QUESTION_OPERATION_ID,
            idempotencyKey: `${d.threadId}:ask:t${turn}:0`,
            invokeError: nativeError,
          });
        }
      }
      // H2 #79:scenario 检索无素材(题库零命中且 web 零结果)→ 显式降级模板(沿 :247-257 grounded
      // 无事实回退先例形),零 fail 硬死、绝不静默拿空素材喂模型发明情景题。fundamental 既有语义零改。
      if (kind === 'scenario' && local.length === 0 && web.length === 0) {
        return approvedTemplateGeneration(scenarioDegradeTemplate(competency), {
          operationId: QUESTION_OPERATION_ID,
          idempotencyKey: `${d.threadId}:ask:t${turn}:0`,
        });
      }
      const docs: SourceDoc[] = web;
      // Web 和本地 qbank excerpt 都不是可信 prompt；二者进入模型前均保持显式 data 信封、固定预算。
      // 本地 evidence 由 active generation + approved source 在刚取回时二次授权；没有 evidence 的兼容 seam
      // 只给 opaque ref，绝不从 ref 伪造正文。模型只能从下列 knownRefs 回填 citation。
      const knownRefs = [...local.map((l) => l.ref), ...web.map((w) => w.url)];
      const localMaterial = local.map((l) => {
        const excerpt = l.evidence?.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 600);
        return excerpt
          ? `[UNTRUSTED_RAG_EVIDENCE ref=${l.ref}]\n${excerpt}\n[/UNTRUSTED_RAG_EVIDENCE]`
          : `[RAG_LOCAL_REF]\n${l.ref}\n[/RAG_LOCAL_REF]`;
      }).join('\n');
      const material = [
        localMaterial,
        formatUntrustedResearchMaterial(web, 1_600),
      ].filter(Boolean).join('\n');
      // One logical question node has exactly one provider attempt.  Duplicate
      // detection is post-response and deterministic; since G7FIX-4R a hit no
      // longer dies on first contact — it re-rolls under a NEW revision (a new
      // auditable logical node), never a second dispatch of the same node.
      // G7FIX-4R:键/revision 参数化——初诊沿用 `:0` 键+基础 revision;判重命中后的有界 re-roll
      // 逐次换 `:r{k}` 键+同步 revision(registry 契约:同键只会缓存回放同题,新 revision=新可审计 logical node)。
      // payload(schema/businessValidate/model/material)与初诊完全同一组确定性闸。
      // billing P1 修法⑦（裁决项②）：ask seam 全体键（初诊 `:0`/`:gr{k}`/`:r{k}`）经本包装逐调用落归集行——
      // 成功 system_ask / 失败臂同写；出题调用先于 question identity 发射，question/topic 维度本行可空
      // （ledger 列可空语义·题目行经 generationProvenance 与 lifecycle 时序对账）。
      const generate = async (idempotencyKey: string, businessRevision: string) => {
        const outcome = await invoke({
          idempotencyKey, operation: { id: 'interview.question-generation.v1', businessRevision },
          threadId: d.threadId, privacyInterviewId: d.threadId,
          sources: local.map((l) => l.ref), retrieval: local,                          // provenance + topScore 信号
          schema: AskSchema,
          businessValidate: (v) => {
            if (isVerbatimCopy(v.q, docs)) return '照搬原文(版权)';
            if (kind === 'grounded') {
              // C6/S2-B2+#193 组合闸:refs 非空 ∧ 逐条为**选定事实**子串(委托 domain.refsGroundedInFacts,
              // 禁重实现)。fact 子串 refs 仅作闸料:grounded 无检索 → knownRefs=[] → resolveCitedSources
              // 恒 ok 且 sources=[],fact refs 禁入 modelGeneration sources/pending.sources/Turn.sources。
              return refsGroundedInFacts(v.refs, groundedFacts) ? null : 'grounded_refs_not_in_facts';
            }
            const cited = resolveCitedSources(knownRefs, v.refs);
            return cited.ok ? null : cited.reason;
          },
          // 检索素材(material)走 rag 字段独立分账(仍在 <data> 围栏内、受 DATA_BOUNDARY_RULE 保护),不进 buildData 的 userData。
          // C6/S3:grounded 传选定事实(2-4 条);followUp=上轮上下文(闭包派生,不可信,buildData 封段标记)。
          model: promptedModel(d.model, 'interviewer.ask', { competency, difficulty, kind, resumeFacts: groundedFacts, followUp: lastFollowUp ?? undefined }, undefined, material),
        }, d.pool, d.owner);
        recordUsageSoft(d.pool, d.owner, {
          invocationKey: idempotencyKey, interviewId: d.threadId, operationId: QUESTION_OPERATION_ID,
          cause: 'error' in outcome ? usageCauseForInvokeError(outcome.error) : 'system_ask',
          meterVersion: SHADOW_METER_VERSION,   // billing P2：meter_version 增量兑现（存量 NULL 零回填）。
        });
        // AG-D（刀 D·AG-01 准入拒绝去终态化·裁决项③）：瞬时准入拒绝族（熔断/并发/预算——invoke 侧
        // 已按案A 释放 claim·零外呼零费用）不落图投影判死：unavailableGeneration 投影会随 superstep
        // 提交进 checkpoint，job 级重试只能重放判死、模型永不真重试。带 code 异常在此抛出=节点中止、
        // checkpoint 停 last-good superstep（next=[genQuestion]），consumer errCode 白名单（刀 C 面·
        // 本刀准入族六码只增）requeue+退避，到点重领=0130 expired-claimed 重领真重试。抛出形沿
        // adaptive-lifecycle graph_fence_lost Object.assign 惯例；零图包触（落点在 worker 包内）。
        // 确定性配置拒绝（operation_unknown/blocked/project_missing/disabled、failover cost policy
        // mismatch）不在族内——原样返回走既有判死链（retry 必败不放大）。
        if ('error' in outcome && isAdmissionRefusalRetryable(outcome.error)) {
          throw Object.assign(new Error(outcome.error), { code: outcome.error });
        }
        return outcome;
      };
      run.stage('generate');                                                           // 段名进下一帧心跳(纯时间窗,不为切段加帧)
      let out = await generate(initialKey, initialRevision);
      run.stage('validate');                                                           // invoke 返回后的确定性检查(查重/引文/refs 闸)段
      let idempotencyKey = initialKey;
      // S2-B3(RESUME-GROUNDING):grounded refs 闸拒绝 → **丢弃**→ 有界重试(独立计数 MAX_GROUNDED_REFS_RETRY,
      // `:gr{k}` 键=新可审计 logical node;禁复用/改动判重 re-roll `:r{k}` 面)→ 耗尽回退既有固定模板。
      if ('error' in out && kind === 'grounded' && out.error === GROUNDED_REFS_GATE_ERROR) {
        let exhausted = true;
        for (let refsRetry = 1; refsRetry <= MAX_GROUNDED_REFS_RETRY; refsRetry += 1) {
          const retryKey = `${d.threadId}:ask:t${turn}:gr${refsRetry}`;
          idempotencyKey = retryKey;
          const retry = await generate(retryKey, retryKey);
          out = retry;
          if (!('error' in retry) || retry.error !== GROUNDED_REFS_GATE_ERROR) { exhausted = false; break; }
        }
        if (exhausted) {
          return approvedTemplateGeneration(
            `请结合你简历中一段与「${competency}」相关的真实经历，说明你的做法、关键取舍和验证结果。`,
            // S2-B3:回退轨迹可审计——provenance 携带耗尽时所在的最后一个独立重试键(:gr{k})。
            { operationId: QUESTION_OPERATION_ID, idempotencyKey },
          );
        }
      }
      // AG-F(刀F)修法①(裁决①a/④a·可调):四类确定性出题失败族单发判死 → 有界 re-roll——复用上方
      // 参数化 generate 闭包(本体零改),`:r{k}` 统一计数键+revision 双换(每 roll=新独立可审计 logical
      // node,registry 契约「new revision ⇒ new auditable node」),每 roll 重过全既有确定性闸
      // (schema/verbatim/引文/grounded-refs 全在闭包内)+critique 复检(裁决⑤a 收进 seam,asked 由
      // 图节点 transcript 透传)+下方 wasAsked 判重复检。族内命中→上限内换 roll 重掷;上限内成功或
      // critique/判重全过 → 走既有 modelGeneration 形;耗尽 → 族形 failure 交图节点换 competency 臂
      // (EXPERT §七 :65「耗尽换 competency 不终场」)。族外(provider_timeout 瞬态/provider_not_
      // configured 重掷必败/generation_unavailable 兜底)与 grounded-refs 专闸(`:gr{k}` 面已在上游
      // 回退)不 re-roll——原形判死零位移(g7fix4 §4.3c 断言面)。瞬态网络面不借 re-roll 无界放大
      // (Ban 列表);每 roll 静态 max 预留由 0088 等值触发器既有机制冻结(专家 §二-3 :18)。
      let familyRolls = 0;
      const seamCritique = (q: string) => critiqueQuestion(q, competency, asked ?? [], d.competencyKeywords ?? {});
      for (;;) {
        const rerollable = 'error' in out
          ? out.error !== GROUNDED_REFS_GATE_ERROR
            && QUESTION_GENERATION_REROLL_FAMILY.includes(classifyQuestionGenerationError(out.error))
          : !seamCritique(out.value.q).ok;
        if (!rerollable || familyRolls >= MAX_ERROR_REROLL) break;
        familyRolls += 1;
        rollSeq += 1;
        const rollKey = `${d.threadId}:ask:t${turn}:r${rollSeq}`;
        idempotencyKey = rollKey;
        out = await generate(rollKey, rollKey);
      }
      if ('error' in out) {
        // Missing keys, timeouts and malformed/schema failures must not become
        // a canned interview stem.  Structured error + provenance only.
        return unavailableGeneration(classifyQuestionGenerationError(out.error), {
          operationId: QUESTION_OPERATION_ID,
          idempotencyKey,
          invokeError: out.error,
          ...(familyRolls > 0 ? { reroll: familyRolls } : {}),
        });
      }
      if (!seamCritique(out.value.q).ok) {
        // AG-F(刀F)裁决⑤a:critique 复检族预算耗尽仍拒 → business_invalid 判死形——与图节点既有
        // critique 拒绝 provenance 同形(origin/errorCode/invokeError),generationFailureOf reason
        // 映射不变;图节点 critique 终闸保留零触(直接 deps 注入面/纵深防御)。
        return unavailableGeneration('business_invalid', {
          operationId: QUESTION_OPERATION_ID,
          idempotencyKey,
          invokeError: 'question_critique_failed',
          ...(familyRolls > 0 ? { reroll: familyRolls } : {}),
        });
      }
      // G7FIX-4R 有界换题:跨会话精确判重命中(唯一真相仍是归一化精确匹配,wasAsked)不再首撞即判死——
      // seam 内有界 re-roll(上限 MAX_DUPLICATE_REROLL,per-turn 计数,生成调用总数 ≤3 含初诊),每 roll
      // 同步换 `:r{k}` 键+revision(新可审计 logical node)、重过全既有确定性闸(schema/verbatim/引文)再复检判重;
      // 上限内得到非重复题面 → 正常 modelGeneration 出题(provenance 落 reroll 轨迹);撞满上限仍重复 →
      // unavailableGeneration('duplicate_question') 原样判死(provenance 落耗尽轨迹)。记忆不可用
      // (duplicate_check_failed)与 provider/schema/business 分类判死零放宽。
      let duplicate = false;
      try {
        duplicate = await wasAsked(d.pool, d.owner, out.value.q);
      } catch {
        return unavailableGeneration('generation_unavailable', {
          operationId: QUESTION_OPERATION_ID, idempotencyKey, invokeError: 'duplicate_check_failed',
        });
      }
      let rerolls = 0;
      while (duplicate && rerolls < MAX_DUPLICATE_REROLL) {
        rerolls += 1;
        rollSeq += 1;                                                                      // AG-F:统一 `:r{k}` 计数(四类族/判重共键空间·fresh-turn 纯判重路径键形零变)
        idempotencyKey = `${d.threadId}:ask:t${turn}:r${rollSeq}`;
        const replacement = await generate(idempotencyKey, idempotencyKey);
        if ('error' in replacement) {
          // re-roll 途中 provider/schema/business 失败 → 既有分类判死原样,不借 re-roll 放宽。
          return unavailableGeneration(classifyQuestionGenerationError(replacement.error), {
            operationId: QUESTION_OPERATION_ID, idempotencyKey, invokeError: replacement.error, reroll: rerolls,
          });
        }
        const replacementCited = resolveCitedSources(knownRefs, replacement.value.refs);
        if (!replacementCited.ok) {
          return unavailableGeneration(classifyQuestionGenerationError(`business:${replacementCited.reason}`), {
            operationId: QUESTION_OPERATION_ID, idempotencyKey, invokeError: `business:${replacementCited.reason}`, reroll: rerolls,
          });
        }
        try {
          duplicate = await wasAsked(d.pool, d.owner, replacement.value.q);
        } catch {
          return unavailableGeneration('generation_unavailable', {
            operationId: QUESTION_OPERATION_ID, idempotencyKey, invokeError: 'duplicate_check_failed', reroll: rerolls,
          });
        }
        if (!duplicate) out = replacement;                                               // 上限内得到非重复替代题:换题成功
      }
      if (duplicate)
        return unavailableGeneration('duplicate_question', { operationId: QUESTION_OPERATION_ID, idempotencyKey, reroll: familyRolls + rerolls });
      const cited = resolveCitedSources(knownRefs, out.value.refs);
      if (!cited.ok) {
        return unavailableGeneration(classifyQuestionGenerationError(`business:${cited.reason}`), {
          operationId: QUESTION_OPERATION_ID, idempotencyKey, invokeError: `business:${cited.reason}`,
        });
      }
      return modelGeneration(out.value.q, cited.sources, {
        operationId: QUESTION_OPERATION_ID, idempotencyKey, ...(familyRolls + rerolls > 0 ? { reroll: familyRolls + rerolls } : {}),
      });
      });
    },
    async assess(question, answer, _competency, turn, identity) {
      // **结构化防评分操纵(红队实测:靠 prompt 让 turbo 自己抵抗不可靠)**:评分前确定性剥离评分元指令/伪造截断标记。
      //  真答案+注入尾巴 → 剥尾巴按真内容评(不被抬到100、不误伤清零);纯操纵 → 剥空 → 下方 relevant 判非作答→score 0。不赌模型听话。
      const { clean, detected } = stripScoringManipulation(answer);
      const scored = detected ? clean : answer;
      // **检到操纵 → 评分升级到 quality 模型(qwen-plus 更抗残留注入)**,并对剥空的直接判非作答(免一次模型调用 + 杜绝空输入误评)。
      // billing P1 修法⑤（席1 E7 显式钉）：剥离后非作答=澄清双因第三源 → clarifyCause='non_answer'
      // （纯附加字段，既有 score/evidence/relevant/hasHook/dispositions 值逐位不变）。
      if (detected && isNonAnswer(scored)) return { score: 0, evidence: ['含评分操纵企图,剥离后无实质作答(已忽略操纵指令)'], relevant: false, hasHook: false, dispositions: [], clarifyCause: 'non_answer' };
      // 同一 pending question 的 stateVersion/turn 写进 idempotency base。逐字引文
      // 无法核验时只澄清原题，不派生 repair key 再次调用模型。
      // Graph 调用始终提供 identity。保留这个固定 fallback 仅兼容旧的 isolated-deps
      // 测试 seam；它不属于 lifecycle/API 生产路径，不能把不同答案混到同一 hash key。
      const stableIdentity = identity ?? { questionId: `direct-assess-t${turn}`, stateVersion: 0 };
      const out = await invokeEvaluationOnce(d.pool, d.owner, {
        baseIdempotencyKey: `${d.threadId}:eval:q:${stableIdentity.questionId}:v:${stableIdentity.stateVersion}:t:${turn}`,
        threadId: d.threadId,
        privacyInterviewId: d.threadId,
        question,
        answer: scored,
        model: detected ? d.model : (d.fastModel ?? d.model),
      });
      // 引文无法逐字核验而答案仍是正常作答时，不能写 unscored/能力画像；图会走 clarify，
      // 让用户以同一题补充一次。其余确定性/供应商失败仍严格 unscored（不编造分数）。
      // billing P1 修法⑦（裁决项②）：评分调用归集行——键=primaryIdempotencyKey 实发键（含答案摘要
      // 派生面）；scored/quote_repair_exhausted 均已消耗模型调用 → 'system_score'；failed → 'unknown'
      // （REQUEST 失败臂）。危机触发短路臂（零外呼零消耗）不入账——归集行↔模型调用一一对应。
      if (!(out.status === 'failed' && out.error === CRISIS_DISPOSITION_REASON)) {
        recordUsageSoft(d.pool, d.owner, {
          invocationKey: out.primaryIdempotencyKey, interviewId: d.threadId,
          questionId: stableIdentity.questionId, topicId: stableIdentity.topicId,
          operationId: 'interview.answer-scoring.v1',
          cause: out.status === 'failed' ? 'unknown' : 'system_score',
          answerLen: Buffer.byteLength(scored, 'utf8'),
          meterVersion: SHADOW_METER_VERSION,   // billing P2：meter_version 增量兑现（存量 NULL 零回填）。
        });
      }
      if (out.status === 'quote_repair_exhausted') {
        // billing P1 修法⑤（席1 E7 显式钉）：quote_repair_exhausted 源 → clarifyCause='quote_unverifiable'
        // （纯附加字段，既有 score/evidence/relevant/hasHook/dispositions 值逐位不变）。
        return { status: 'scored' as const, score: 0, evidence: ['评分证据无法逐字核验，请围绕原题补充一次具体作答。'], relevant: false, hasHook: false, dispositions: [], clarifyCause: 'quote_unverifiable' };
      }
      if (out.status === 'failed') return { status: 'unscored' as const, reason: `evaluation_${out.error}` };
      // #52 v6：score=evaluate 侧确定性派生（档位×量表权重，非模型输出）；dispositions=0103
      // 契约证据随 assess 返回（evaluate-answer 节点透传进 transcript → 投影后供 score-writer）。
      const derived = evaluateOutcomeFromValue(out.value, clean);
      // S3/C13/C15(RESUME-GROUNDING):真实评分过的回合 → 捕获追问上下文(仅本闭包,禁入图 state):
      // 题目摘要=本轮题目(有界截取);作答摘要=stripScoringManipulation 后的 clean(**先剥离**)再确定性截取
      // ≤200 字符(**后截取**,顺序钉死禁倒置);证据弱点=评分 criteria(mind evidence 同源材料,slice(-6) 语义
      // 的消费面有界),quote 不传(评分消费面已弃)。clarify/unresolved/unscored 回合不捕获(无评分证据弱点)。
      lastFollowUp = {
        question: boundedTextSlice(question, FOLLOWUP_QUESTION_MAX_CHARS),
        answerSummary: boundedTextSlice(clean, FOLLOWUP_ANSWER_SUMMARY_MAX_CHARS),
        weaknesses: derived.evidence.slice(-FOLLOWUP_WEAKNESS_MAX_COUNT)
          .map((c) => boundedTextSlice(c, FOLLOWUP_WEAKNESS_MAX_CHARS)),
      };
      // 业务规整(双校验补强,非仅 schema):relevant=false 时**强制** score=0 + hasHook=false(对齐 prompt 契约,
      // 防模型自相矛盾地"判跑题却给高分/给钩子"驱动错误深挖;两个控制流布尔不裸过 schema)。
      const relevant = out.value.relevant;
      return relevant
        ? { status: 'scored' as const, score: derived.score, evidence: derived.evidence, relevant: true, hasHook: out.value.hasHook, dispositions: derived.dispositions }
        : { status: 'scored' as const, score: 0, evidence: derived.evidence, relevant: false, hasHook: false, dispositions: derived.dispositions };
    },
    // 无 report:报告走舱壁 report-worker(失败隔离),不在 agent 图内出。
  };
}
