/**
 * 自适应面试 agent 的**真 deps 工厂**(把集成图的 fake deps 换成真:角色拆分 + 经 invoke 关口 + CRAG + threadId 一棵树)。
 * 角色各自一个 prompt(注册表,动静分离):规划官 planner.competencies / 面试官 interviewer.ask/ 评估官 mock-interview.evaluate(报告走舱壁,不在图内)。
 * 每次模型调用过 invoke(双校验/exactly-once/trace),带 threadId(Langfuse 一场面试一棵树)+ sources/retrieval(provenance+topScore 信号)。
 */
import { z } from 'zod';
import { asPrincipal, type DbPool } from '@meetwise/db';
import { invoke, promptedModel, type ModelClient } from '@meetwise/ai-runtime';
import { cragRetrieve, isVerbatimCopy, toCompetencySpecs, isNonAnswer, stripScoringManipulation, type ScoredRef, type SourceDoc, type CompetencySpec, type QuestionKind } from '@meetwise/domain';
import type { AdaptiveDeps } from '@meetwise/ai-graphs';

const AskSchema = z.object({ q: z.string().min(1).max(2000), refs: z.array(z.string()) });   // q 封顶:模型出的题理应短;超长=异常输出,schema 闸拦下重试(也防评估侧截断吃掉答案)
// relevant:答案是否正面回应本题(off-topic/非作答 → false + score 0)。可选默认 true(保守:模型漏给则按 on-topic,不误触澄清环)。
// hasHook:这答案有无"可深挖的具体钩子"(值得就同一能力多问一轮)。**默认 false**(模型漏给 → 不强行深挖,保守收敛)。
const EvalSchema = z.object({ score: z.number().min(0).max(100), evidence: z.array(z.string()), relevant: z.boolean().optional().default(true), hasHook: z.boolean().optional().default(false) });

export interface AdaptiveServiceDeps {
  pool: DbPool; owner: string; threadId: string; model: ModelClient;
  /** 快模型(qwen-turbo):评分/relevant 等约束性任务用,显著降反问延迟;缺省回退 model(兼容旧调用)。出题仍用 model(质量关键)。 */
  fastModel?: ModelClient;
  competencies: (string | CompetencySpec)[];
  resumeFacts?: string[];                               // 简历事实:出题个性化(经图状态 durable)
  localRetrieve: (q: string) => Promise<ScoredRef[]>;   // 真:annSearch over vector_chunk
  webExplore: (q: string) => Promise<SourceDoc[]>;      // 真:allowlist 抓取(源由配置定)
  competencyKeywords?: Record<string, string[]>;
}

/** 规划官:据岗位+简历提目标能力(plan-and-solve 的 plan)。经 invoke。**约束性任务,走快模型**(缺省回退 model)。 */
export async function planCompetencies(pool: DbPool, owner: string, threadId: string, model: ModelClient, role: string, facts: string[]): Promise<CompetencySpec[]> {
  const out = await asPrincipal(pool, owner, (c) => invoke({
    idempotencyKey: `${threadId}:plan`, threadId,
    schema: z.object({ competencies: z.array(z.string().min(1)).min(1) }),
    businessValidate: (v) => (v.competencies.length === 0 ? 'empty_plan' : null),
    model: promptedModel(model, 'planner.competencies', { role, facts }),
  }, c, owner));
  // 优雅降级:规划失败 → 用默认能力集,面试仍可开(不因规划抖动整场开不了)。
  // toCompetencySpecs(纯逻辑):top 1-2 标 core(追问上限 3)+ 确定性附加 1 个行为槽(题型 behavioral)。
  const names = 'error' in out ? ['项目经验', '技术深度', '问题解决'] : out.value.competencies;
  return toCompetencySpecs(names);
}

export function buildAdaptiveDeps(d: AdaptiveServiceDeps): AdaptiveDeps {
  return {
    competencies: d.competencies,
    resumeFacts: d.resumeFacts,
    competencyKeywords: d.competencyKeywords,
    async retrieveAndGenerate(competency, difficulty, attempt, turn, facts, kind) {
      // 题型决定接地:grounded/fundamental 用 CRAG 检索真题素材;scenario/behavioral 与简历/题库解耦(空素材、空来源)。
      const useRetrieval = kind === 'grounded' || kind === 'fundamental';
      const useFacts = kind === 'grounded';                            // 仅 grounded 接简历事实;fundamental 考通用原理(不绑候选人项目)
      const { local, web } = useRetrieval
        ? await cragRetrieve(`${competency} 难度${difficulty}`, { localRetrieve: d.localRetrieve, webExplore: d.webExplore })
        : { local: [] as ScoredRef[], web: [] as SourceDoc[] };
      const docs: SourceDoc[] = web;
      const material = [...local.map((l) => l.ref), ...web.map((w) => w.text)].join('\n').slice(0, 2000);
      const out = await asPrincipal(d.pool, d.owner, (c) => invoke({
        idempotencyKey: `${d.threadId}:ask:t${turn}:${attempt}`, threadId: d.threadId,   // 持久 turn → 跨进程 resume 不碰撞
        sources: local.map((l) => l.ref), retrieval: local,                          // provenance + topScore 信号
        schema: AskSchema,
        businessValidate: (v) => (isVerbatimCopy(v.q, docs) ? '照搬原文(版权)' : null),   // 版权门:照搬→重试
        model: promptedModel(d.model, 'interviewer.ask', { competency, difficulty, kind, material, resumeFacts: useFacts ? facts : [] }),
      }, c, d.owner));
      if ('error' in out) {
        // **优雅降级(北极星)**:出题失败(模型抖动/重试耗尽/业务校验不过)→ 不抛错崩掉整场面试,改用确定性兜底题继续(题型适配)。
        const fallback = kind === 'behavioral'
          ? `请讲一段你与同事/上级在协作中发生分歧或遇到压力的经历:当时怎么沟通、如何推进、事后你怎么复盘?`
          : `请结合你的经验,谈谈在「${competency}」方面你做过的工作、遇到过的挑战,以及当时是怎么权衡和解决的。`;
        return { question: fallback, sources: [] };
      }
      return { question: out.value.q, sources: out.value.refs };
    },
    async assess(question, answer, _competency, turn) {
      // **结构化防评分操纵(红队实测:靠 prompt 让 turbo 自己抵抗不可靠)**:评分前确定性剥离评分元指令/伪造截断标记。
      //  真答案+注入尾巴 → 剥尾巴按真内容评(不被抬到100、不误伤清零);纯操纵 → 剥空 → 下方 relevant 判非作答→score 0。不赌模型听话。
      const { clean, detected } = stripScoringManipulation(answer);
      const scored = detected ? clean : answer;
      // **检到操纵 → 评分升级到 quality 模型(qwen-plus 更抗残留注入)**,并对剥空的直接判非作答(免一次模型调用 + 杜绝空输入误评)。
      if (detected && isNonAnswer(scored)) return { score: 0, evidence: ['含评分操纵企图,剥离后无实质作答(已忽略操纵指令)'], relevant: false, hasHook: false };
      const out = await asPrincipal(d.pool, d.owner, (c) => invoke({
        idempotencyKey: `${d.threadId}:eval:t${turn}`, threadId: d.threadId,            // 持久 turn 键
        // 非作答(relevant=false)允许空 evidence —— 否则模型正确判跑题但漏给 evidence 会触发 no_evidence→降级→relevant 被翻回 true,把一次正确的非作答检测吞掉(审计中)。
        schema: EvalSchema, businessValidate: (v) => (v.evidence.length === 0 && v.relevant !== false ? 'no_evidence' : null),
        model: promptedModel(detected ? d.model : (d.fastModel ?? d.model), 'mock-interview.evaluate', { question, answer: scored }),
      }, c, d.owner));
      // 优雅降级:评分失败 → 不崩面试,给中性分 + 留痕(relevant=true:**是我方模型挂了,绝不据此误判候选人非作答去触发澄清环**;hasHook=false:不强行深挖)。
      if ('error' in out) return { score: 50, evidence: ['(评分降级:模型暂不可用,按中性计)'], relevant: true, hasHook: false };
      // 业务规整(双校验补强,非仅 schema):relevant=false 时**强制** score=0 + hasHook=false(对齐 prompt 契约,
      // 防模型自相矛盾地"判跑题却给高分/给钩子"驱动错误深挖;两个控制流布尔不裸过 schema)。
      const relevant = out.value.relevant;
      return relevant
        ? { score: out.value.score, evidence: out.value.evidence, relevant: true, hasHook: out.value.hasHook }
        : { score: 0, evidence: out.value.evidence, relevant: false, hasHook: false };
    },
    // 无 report:报告走舱壁 report-worker(失败隔离),不在 agent 图内出。
  };
}
