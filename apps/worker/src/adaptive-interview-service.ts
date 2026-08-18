/**
 * 自适应面试 agent 的**真 deps 工厂**(把集成图的 fake deps 换成真:角色拆分 + 经 invoke 关口 + CRAG + threadId 一棵树)。
 * 角色各自一个 prompt(注册表,动静分离):规划官 planner.competencies / 面试官 interviewer.ask/ 评估官 mock-interview.evaluate(报告走舱壁,不在图内)。
 * 每次模型调用过 invoke(双校验/exactly-once/trace),带 threadId(Langfuse 一场面试一棵树)+ sources/retrieval(provenance+topScore 信号)。
 */
import { z } from 'zod';
import { normalizeQuestion, type DbPool } from '@meetwise/db';
import { invoke, promptedModel, type ModelClient, type GraphObserver } from '@meetwise/ai-runtime';
import { cragRetrieve, formatUntrustedResearchMaterial, isVerbatimCopy, toCompetencySpecs, isNonAnswer, stripScoringManipulation, type ResearchBoundaryDecision, type ScoredRef, type SourceDoc, type CompetencySpec, type QuestionKind } from '@meetwise/domain';
import type { AdaptiveDeps } from '@meetwise/ai-graphs';
import { wasAsked, pastWeakDimensions } from './memory-service.ts';
import { invokeEvaluationOnce } from './interview-service.ts';

const AskSchema = z.object({ q: z.string().min(1).max(2000), refs: z.array(z.string()) });   // q 封顶:模型出的题理应短;超长=异常输出,schema 闸拦下重试(也防评估侧截断吃掉答案)

/**
 * A deterministic same-scope shell used after a known local rejection.  It is
 * intentionally not added to QBank and carries no retrieval source: a clean
 * QBank miss is handled by QuestionPlan, not by a retry hidden in this node.
 */
function deterministicQuestionFallback(competency: string, kind: QuestionKind): { question: string; sources: string[] } {
  if (kind === 'behavioral') {
    return {
      question: '请讲一段你与同事或上级在协作中发生分歧或遇到压力的经历：当时怎样沟通、如何推进，以及事后怎样复盘？',
      sources: [],
    };
  }
  return {
    question: `请以一个具体的「${competency}」实践为例，说明目标、关键设计取舍、怎样验证结果，以及遇到问题时如何处理。`,
    sources: [],
  };
}
export interface AdaptiveServiceDeps {
  pool: DbPool; owner: string; threadId: string; model: ModelClient;
  /** 快模型(qwen-turbo):评分/relevant 等约束性任务用,显著降反问延迟;缺省回退 model(兼容旧调用)。出题仍用 model(质量关键)。 */
  fastModel?: ModelClient;
  competencies: (string | CompetencySpec)[];
  /** Only an authorization bit may reach graph deps; resume text remains in the profile artifact. */
  resumeProfileAvailable?: boolean;
  localRetrieve: (q: string) => Promise<ScoredRef[]>;   // 真:annSearch over vector_chunk
  webExplore: (q: string) => Promise<SourceDoc[]>;      // 真:allowlist 抓取(源由配置定)
  /** 低置信 CRAG 才会调用的、有源数/字符/调用预算的多源取证。未注入时兼容旧 web seam。 */
  deepResearch?: (q: string) => Promise<SourceDoc[]>;
  researchBoundary?: (q: string) => ResearchBoundaryDecision;
  competencyKeywords?: Record<string, string[]>;
  /** 图的总轮数预算；隔离 E2E 可显式缩短，生产调用保持未设置。 */
  maxTurns?: number;
  /** 仅携带图拓扑和数值状态的观测 seam，不向图节点暴露供应商 SDK。 */
  graphObserver?: GraphObserver;
  /** 运行时短暂水合答案；不得把原文放回图 state（状态）。 */
  loadAnswer?: AdaptiveDeps['loadAnswer'];
}

/** 规划官:据岗位+简历提目标能力(plan-and-solve 的 plan)。经 invoke。**约束性任务,走快模型**(缺省回退 model)。 */
export async function planCompetencies(pool: DbPool, owner: string, threadId: string, model: ModelClient, role: string, facts: string[]): Promise<CompetencySpec[]> {
  const out = await invoke({
    idempotencyKey: `${threadId}:plan`, operation: { id: 'interview.competency-planning.v1', businessRevision: `${threadId}:plan` }, threadId, privacyInterviewId: threadId,
    schema: z.object({ competencies: z.array(z.string().min(1)).min(1) }),
    businessValidate: (v) => (v.competencies.length === 0 ? 'empty_plan' : null),
    model: promptedModel(model, 'planner.competencies', { role, facts }),
  }, pool, owner);
  // 优雅降级:规划失败 → 用默认能力集,面试仍可开(不因规划抖动整场开不了)。
  // toCompetencySpecs(纯逻辑):top 1-2 标 core(追问上限 3)+ 确定性附加 1 个行为槽(题型 behavioral)。
  const names = 'error' in out ? ['项目经验', '技术深度', '问题解决'] : out.value.competencies;
  const biased = await biasByPastWeakness(pool, owner, names);   // 历史弱项软偏置(hint,非硬过滤;快照进能力清单一次,decideNext 对其纯运算)
  return toCompetencySpecs(biased);
}

/** 弱项软偏置(**反 confirmation-bias**):把规划官**本次已提**、且命中历史弱项(assessment_report gap=true)的能力**稳定前移**
 *  → 更可能落进 core(复测更充分);但**只重排、绝不注入岗位无关能力**(hint 非硬过滤)。
 *  关键:记忆只影响"考哪些能力",**绝不影响"多难/多有信心"**——难度仍由 initMind 从中性 2 起(上次弱→这次中性难度复测,prior 完全向中性衰减),
 *  confidence 恒从 0 起(只累积本场证据)。空历史(冷启动/记忆不可用)→ 稳定分区自然恒等(**非特殊分支**:空集 → 全部落后桶、保持原序)。 */
async function biasByPastWeakness(pool: DbPool, owner: string, names: string[]): Promise<string[]> {
  const weak = await pastWeakDimensions(pool, owner).catch(() => [] as string[]);   // 记忆不可用/冷启动 → [] → 恒等(fail-soft,绝不因判重故障阻断开面)
  const weakSet = new Set(weak.map(normalizeQuestion));
  const isWeak = (n: string) => weakSet.has(normalizeQuestion(n));
  return [...names.filter(isWeak), ...names.filter((n) => !isWeak(n))];             // 稳定分区:弱项前移、其余原序
}

export function buildAdaptiveDeps(d: AdaptiveServiceDeps): AdaptiveDeps {
  return {
    competencies: d.competencies,
    resumeProfileAvailable: d.resumeProfileAvailable,
    loadAnswer: d.loadAnswer ?? (async () => { throw new Error('answer_artifact_unavailable'); }),
    maxTurns: d.maxTurns,
    graphObserver: d.graphObserver,
    competencyKeywords: d.competencyKeywords,
    async retrieveAndGenerate(competency, difficulty, attempt, turn, _facts, kind) {
      // `attempt` remains in this compatibility seam so older graph fixtures
      // type-check, but a non-zero value must never issue another provider
      // request for the same logical node.  The graph only calls zero.
      if (attempt !== 0) return deterministicQuestionFallback(competency, kind);
      // Candidate-specific first questions have a stricter trust boundary than
      // generic qbank questions.  Only a parsed fact may be quoted as a claim
      // about the candidate; everything else is a neutral request to explain
      // that fact.  This avoids a model turning “Redis” into a fabricated
      // e-commerce project, metric, employer or duration.
      if (kind === 'grounded') {
        if (!d.resumeProfileAvailable) {
          // The graph normally routes this to fundamental before arriving here.
          // Retain a safe direct-call fallback for tests and future callers.
          return {
            question: `请结合你的实际经验，说明在「${competency}」方面你会如何做关键取舍，并如何验证结果。`,
            sources: [],
          };
        }
        return {
          // Do not repeat a resume fact: the question is checkpointed, sent by
          // interrupt/SSE, recorded in events and later normalized into an
          // episode.  The candidate can choose which authorized experience to
          // discuss without that original fact becoming a second data copy.
          question: `请结合你简历中一段与「${competency}」相关的真实经历，说明你的做法、关键取舍和验证结果。`,
          sources: [],
        };
      }
      // 题型决定接地:grounded/fundamental 用 CRAG 检索真题素材;scenario/behavioral 与简历/题库解耦(空素材、空来源)。
      const useRetrieval = kind === 'fundamental';
      const useFacts = false; // grounded was returned above; non-grounded questions never make resume claims.
      const { local, web } = useRetrieval
        ? await cragRetrieve(`${competency} 难度${difficulty}`, { localRetrieve: d.localRetrieve, webExplore: d.webExplore, deepResearch: d.deepResearch, researchBoundary: d.researchBoundary })
        : { local: [] as ScoredRef[], web: [] as SourceDoc[] };
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
      // detection is deliberately post-response and deterministic; it cannot
      // create a second :d1 request with a new idempotency key.
      const generate = () => invoke({
          idempotencyKey: `${d.threadId}:ask:t${turn}:0`, operation: { id: 'interview.question-generation.v1', businessRevision: `${d.threadId}:ask:t${turn}` },
          threadId: d.threadId, privacyInterviewId: d.threadId,
          sources: local.map((l) => l.ref), retrieval: local,                          // provenance + topScore 信号
          schema: AskSchema,
          businessValidate: (v) => {
            if (isVerbatimCopy(v.q, docs)) return '照搬原文(版权)';
            // 来源列表是 provenance，不是模型可自由编造的文案。空资料时允许空 refs；有资料时
            // 任一 ref 都必须精确属于本次 local/web evidence，防“看似有引用”的幻觉审计记录。
            if (v.refs.some((ref) => !knownRefs.includes(ref))) return 'unknown_retrieval_reference';
            return null;
          },
          // 检索素材(material)走 rag 字段独立分账(仍在 <data> 围栏内、受 DATA_BOUNDARY_RULE 保护),不进 buildData 的 userData。
          model: promptedModel(d.model, 'interviewer.ask', { competency, difficulty, kind, resumeFacts: [] }, undefined, material),
        }, d.pool, d.owner);
      const out = await generate();
      if ('error' in out) {
        // **优雅降级(北极星)**:出题失败(模型抖动/重试耗尽/业务校验不过)→ 不抛错崩掉整场面试,改用确定性兜底题继续(题型适配)。
        return deterministicQuestionFallback(competency, kind);
      }
      // Cross-session exact duplicate is a known local result, not a reason to
      // call the provider again.  Return a same-competency deterministic shell
      // and let a future QuestionPlan own curated QBank-miss generation.
      if (await wasAsked(d.pool, d.owner, out.value.q).catch(() => false))
        return deterministicQuestionFallback(competency, kind);
      return { question: out.value.q, sources: out.value.refs };
    },
    async assess(question, answer, _competency, turn, identity) {
      // **结构化防评分操纵(红队实测:靠 prompt 让 turbo 自己抵抗不可靠)**:评分前确定性剥离评分元指令/伪造截断标记。
      //  真答案+注入尾巴 → 剥尾巴按真内容评(不被抬到100、不误伤清零);纯操纵 → 剥空 → 下方 relevant 判非作答→score 0。不赌模型听话。
      const { clean, detected } = stripScoringManipulation(answer);
      const scored = detected ? clean : answer;
      // **检到操纵 → 评分升级到 quality 模型(qwen-plus 更抗残留注入)**,并对剥空的直接判非作答(免一次模型调用 + 杜绝空输入误评)。
      if (detected && isNonAnswer(scored)) return { score: 0, evidence: ['含评分操纵企图,剥离后无实质作答(已忽略操纵指令)'], relevant: false, hasHook: false };
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
      if (out.status === 'quote_repair_exhausted') {
        return { status: 'scored' as const, score: 0, evidence: ['评分证据无法逐字核验，请围绕原题补充一次具体作答。'], relevant: false, hasHook: false };
      }
      if (out.status === 'failed') return { status: 'unscored' as const, reason: `evaluation_${out.error}` };
      // 业务规整(双校验补强,非仅 schema):relevant=false 时**强制** score=0 + hasHook=false(对齐 prompt 契约,
      // 防模型自相矛盾地"判跑题却给高分/给钩子"驱动错误深挖;两个控制流布尔不裸过 schema)。
      const relevant = out.value.relevant;
      return relevant
        ? { status: 'scored' as const, score: out.value.score, evidence: out.value.evidence.map((item) => item.criterion), relevant: true, hasHook: out.value.hasHook }
        : { status: 'scored' as const, score: 0, evidence: out.value.evidence.map((item) => item.criterion), relevant: false, hasHook: false };
    },
    // 无 report:报告走舱壁 report-worker(失败隔离),不在 agent 图内出。
  };
}
