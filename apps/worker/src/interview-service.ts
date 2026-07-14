/**
 * 面试应用服务（**生产代码**,非 demo）：把模型经 invoke 关口接进各图节点。worker 真跑、api 触发都用它;
 * 模型客户端由**配置注入**(生产默认 openAICompatibleClient 真模型;测试注入 scriptedModelClient;未配置则降级)。
 * 模型输出 schema 是契约,业务校验是第二道闸——双校验、幂等 trace、旁路不可绕,全在 invoke 里。
 */
import { z } from 'zod';
import { asPrincipal, type DbPool } from '@meetwise/db';
import { invoke, promptedModel, openAICompatibleClient, circuitBreaker, rateLimitedModel, failoverModel, type ModelClient, type ModelResult } from '@meetwise/ai-runtime';
import { groundedByFacts } from '@meetwise/domain';
import { DIAGNOSIS_SECTION_KINDS, type GenerateQuestions, type GenerateReport, type GenerateDiagnosis, type QuizItem, type RawDiagnosis, type ReportContent, type InterviewSummary } from '@meetwise/ai-graphs';

export const QuizSchema = z.object({ items: z.array(z.object({ q: z.string().min(1).max(2000), refs: z.array(z.string()) })) });   // q 封顶:模型出题理应短,超长=异常输出 → schema 闸拦下重试
// relevant:答案是否正面回应本题(off-topic/非作答 → false + score 0)。可选默认 true:旧脚本/降级路径不带也安全(保守=按 on-topic)。
export const EvalSchema = z.object({ score: z.number().min(0).max(100), evidence: z.array(z.string()), relevant: z.boolean().optional().default(true) });
export const ReportSchema = z.object({ overall: z.number().min(0).max(100), sections: z.array(z.object({ title: z.string(), body: z.string() })) });
/** 简历诊断结构化输出 schema(第一道闸:schema 校验;枚举/区间在此硬性表达)。 */
export const DiagnosisSchema = z.object({
  overall: z.number().min(0).max(100),
  summary: z.string(),
  sections: z.array(z.object({
    kind: z.enum(DIAGNOSIS_SECTION_KINDS),
    title: z.string().min(1),
    score: z.number().min(0).max(100).optional(),
    findings: z.array(z.object({ text: z.string().min(1), refs: z.array(z.string()) })),
  })),
  rewrites: z.array(z.object({ before: z.string(), after: z.string().min(1), refs: z.array(z.string()) })),
});

/** 生产默认模型客户端(真境内模型;未配 MODEL_* 时 openAICompatibleClient 自身降级为 transient)。 */
// 熔断(挂了降级+快恢复)外层包并发限流(对齐百炼 RPM/并发,防突发轰炸 429)。顺序:rateLimit 在内、circuit 在外——
// 限流先排队摊平,熔断再兜底真故障。MODEL_MAX_CONCURRENT/MODEL_RPM 不设时只限并发(默认 4),不影响功能。
/** 一个模型端点 = 限流(内)+熔断(外);限流先排队摊平,熔断兜底真故障。 */
function endpoint(cfg: { baseUrl?: string; apiKey?: string; model?: string } = {}): ModelClient {
  return circuitBreaker(rateLimitedModel(openAICompatibleClient(cfg)));
}
/** **跨供应商 failover 链(生产高可用:单供应商=单点故障)**:primary=百炼;配了 MODEL_BACKUP_BASE_URL 才启用 backup。
 *  primary 熔断打开/持续 429/超时 → 秒级切 backup(不同 key/供应商的 OpenAI 兼容端点)→ 全挂才降级。不配 backup 则等价单端点(向后兼容)。 */
function withFailover(model?: string): ModelClient {
  const primary = endpoint(model ? { model } : {});
  if (!process.env.MODEL_BACKUP_BASE_URL) return primary;
  const backup = endpoint({ baseUrl: process.env.MODEL_BACKUP_BASE_URL, apiKey: process.env.MODEL_BACKUP_API_KEY, model: process.env.MODEL_BACKUP_NAME ?? model });
  return failoverModel([primary, backup]);
}
/**
 * E2E 确定性模型(**仅 E2E_FAKE_MODEL=1 生效**,由 scripts/run-e2e.mjs 设,生产绝不激活)。
 * 为什么要它:e2e 是**接线集成门**(鉴权→交易→简历→队列→图→事件→报告→多租户 RLS),该秒级确定性跑到 report_ready 的 golden path;
 * 真 qwen ~20s/次、偶发 30s×3 重试(≈143s)会把整场面试拖过测试预算 → e2e 假红(实为环境慢,非接线错)。真模型质量归 flow:live / model:smoke。
 * 各 service 回合法 shape:高分 + 无钩子 → decideNext 每能力一轮即"够强" → 数轮内 conclude → 报告舱壁出 report_ready。
 * 未脚本化的 service(quiz/diagnosis,e2e happy path 不触发)→ scriptedModelClient 返 deterministic → 图优雅降级到 fallback,不挂不崩。
 */
const E2E_SCRIPTS: Record<string, (attempt: number) => ModelResult> = {
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['高并发', '分布式锁'] } }),
  'interviewer.ask': () => ({ ok: true, raw: { q: '请结合你的经历,谈谈在高并发系统里你做过的一个关键技术决策及其权衡。', refs: [] } }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 82, evidence: ['给出了具体方案与权衡'], relevant: true, hasHook: false } }),
  'report.generate': () => ({ ok: true, raw: { overall: 82, sections: [{ title: '综合评估', body: '整体表现稳定,能给出具体方案与权衡。' }] } }),
  // 押题/诊断脚本化(refs='限流'/'Redis' 须接地于 e2e 简历 facts,过 factuality 歪曲门不被过滤空)→ 让 quiz/diagnosis 也能在全栈 e2e 经真 HTTP 跑到终态,不再只降级到 fallback。
  'resume-quiz.generate': () => ({ ok: true, raw: { items: [{ q: '你在高并发订单系统里怎么用 Redis 做限流?讲讲取舍。', refs: ['限流'] }, { q: 'Redis 做分布式锁,可靠性(误删/续期)怎么保证?', refs: ['Redis'] }] } }),
  'resume-diagnosis.generate': () => ({ ok: true, raw: { overall: 78, summary: '后端经验扎实,建议补充可量化的业绩数据。', sections: [{ kind: 'highlight', title: '亮点', score: 80, findings: [{ text: '有高并发限流实践', refs: ['限流'] }] }, { kind: 'risk', title: '风险', findings: [{ text: '缺量化数据支撑', refs: [] }] }], rewrites: [] } }),
};
const useFakeModel = () => process.env.E2E_FAKE_MODEL === '1';
// **内容感知**(取代 content-blind scriptedModelClient):既跑 happy path,又能对**单个面试**注入失败以测跨进程失败终态兜底。
// 失败注入:答案含 `E2E_REPORT_FAIL` 标记 → 评分给哨兵 7 → 报告输入 scores 含 7 → report.generate 确定性失败 →
//   报告舱壁重试耗尽→quarantine→**report_unavailable**(无死胡同兜底)。只影响带标记的那场,happy path 不受污染。
function e2eScriptedModel(): ModelClient {
  return {
    async complete(req: { service: string; userData?: string }): Promise<ModelResult> {
      const data = req.userData ?? '';
      if (req.service === 'mock-interview.evaluate') {
        const sentinel = data.includes('E2E_REPORT_FAIL');
        return { ok: true, raw: { score: sentinel ? 7 : 82, evidence: ['给出了具体方案与权衡'], relevant: true, hasHook: false } };
      }
      if (req.service === 'report.generate') {
        const nums = (data.match(/\d+/g) ?? []).map(Number);
        if (nums.includes(7)) return { ok: false, kind: 'deterministic' };   // scores 含哨兵 7 → 报告确定性失败(测舱壁→report_unavailable)
        return { ok: true, raw: { overall: 82, sections: [{ title: '综合评估', body: '整体表现稳定,能给出具体方案与权衡。' }] } };
      }
      const s = E2E_SCRIPTS[req.service];
      return s ? s(0) : { ok: false, kind: 'deterministic' };
    },
  };
}

/** 生产默认模型客户端(真境内模型 + 跨供应商 failover;未配 MODEL_* 时 openAICompatibleClient 自身降级为 transient)。 */
export function defaultModelClient(): ModelClient { return useFakeModel() ? e2eScriptedModel() : withFailover(); }
/** 快模型(qwen-turbo 等):**约束性任务**(评分/relevant 判定、能力规划)用它——质量够、明显更快更省。同样带 failover。 */
export function fastModelClient(): ModelClient {
  return useFakeModel() ? e2eScriptedModel() : withFailover(process.env.MODEL_FAST_NAME ?? 'qwen-turbo');
}

/** 押题:resume-quiz 图的 generate。经 invoke(双校验:schema + 非空业务校验)+ 图侧 factuality 过滤幻觉。 */
export function quizGenerator(pool: DbPool, owner: string, resumeFacts: string[], idempotencyKey: string, model: ModelClient): GenerateQuestions {
  return async (): Promise<QuizItem[]> => asPrincipal(pool, owner, async (c) => {
    const out = await invoke({
      idempotencyKey, schema: QuizSchema,
      businessValidate: (v) => (v.items.length === 0 ? 'empty_quiz' : v.items.some((it) => !it.q.trim()) ? 'blank_question' : null),
      model: promptedModel(model, 'resume-quiz.generate', { facts: resumeFacts }),
    }, c, owner);
    if ('error' in out) throw new Error('quiz:' + out.error);
    return out.value.items;
  });
}

/** 改写建议封顶(防单帧/单串失控,审计 SRE 中危的纵深兜底)。 */
const MAX_REWRITES = 12, MAX_REWRITE_CHARS = 2000;
/** 数字接地闸:被断言文本里出现的每个数字串,必须在锚文本(原句 + 简历事实)里出现过——否则=虚构量化(造假最高发形态)。
 *  只拦阿拉伯数字串(QPS/百分比/年限/团队规模等可确定性检出者);中文数字/专有名词语义虚构属 LLM-judge 层,不在此过度声明。 */
function hasUngroundedNumber(text: string, anchors: string[]): boolean {
  const nums = text.match(/\d+/g);
  if (!nums) return false;
  return nums.some((n) => n.length >= 1 && !anchors.some((a) => a.includes(n)));
}

/**
 * 简历诊断:resume-diagnosis 图的 generate。经 invoke 双校验 + **分层接地业务闸**:
 *   ① schema 校验(枚举/区间)→ ② business validator:非空诊断;改写建议硬闸——
 *      refs 必须非空且接地于简历 facts(否则 fabricated_experience/rewrite_unanchored);
 *      **after 不得引入简历里没有的数字**(fabricated_metric——量化造假是简历虚构最高发、最可确定性检出的形态);
 *      条数/长度封顶(防失控 payload)。任一不过 → 整次诊断走失败路径(绝不交付一份教人编造经历的诊断)。
 * findings 的接地由图侧 validate 节点优雅过滤(亮点/匹配度等正面声明必须引证)。
 * 残留:refs 接地但正文语义虚构非确定性可拦,属 ai-eval/LLM-judge 层——不在此过度声明已解决。
 */
export function diagnosisGenerator(pool: DbPool, owner: string, resumeFacts: string[], role: string | undefined, idempotencyKey: string, model: ModelClient): GenerateDiagnosis {
  return async (): Promise<RawDiagnosis> => asPrincipal(pool, owner, async (c) => {
    const out = await invoke({
      idempotencyKey, schema: DiagnosisSchema, service: 'resume-diagnosis.generate',
      businessValidate: (v) => {
        if (v.sections.length === 0) return 'empty_diagnosis';
        // 每条 finding 至少要有文字结论(schema 已保 min(1),此处守 trim 空白)。
        if (v.sections.some((sec) => sec.findings.some((f) => !f.text.trim()))) return 'blank_finding';
        if (v.rewrites.length > MAX_REWRITES) return 'too_many_rewrites';                // 封顶:防失控 payload(SRE 纵深)
        // **虚构经历硬闸(绝不虚构经历)**:改写建议必须锚定真实经历 + 不得编造量化数据。
        for (const r of v.rewrites) {
          if (r.before.length > MAX_REWRITE_CHARS || r.after.length > MAX_REWRITE_CHARS) return 'rewrite_too_long';
          if (r.refs.length === 0) return 'rewrite_unanchored';                          // 无锚=凭空改写
          if (!groundedByFacts(r.refs, resumeFacts)) return 'fabricated_experience';     // 引用了简历里没有的经历=虚构
          if (hasUngroundedNumber(r.after, [r.before, ...resumeFacts])) return 'fabricated_metric';   // after 编造了简历里没有的数字=量化造假
        }
        return null;
      },
      model: promptedModel(model, 'resume-diagnosis.generate', { facts: resumeFacts, role }),
    }, c, owner);
    if ('error' in out) throw new Error('diagnosis:' + out.error);
    return out.value;
  });
}

/** 评分:一题一答经 invoke(无证据的分数=业务校验失败)。 */
export async function evaluateAnswer(pool: DbPool, owner: string, idempotencyKey: string, question: string, answer: string, model: ModelClient): Promise<{ score: number; evidence: string[] }> {
  return asPrincipal(pool, owner, async (c) => {
    const out = await invoke({
      idempotencyKey, schema: EvalSchema,
      businessValidate: (v) => (v.evidence.length === 0 ? 'no_evidence' : null),
      model: promptedModel(model, 'mock-interview.evaluate', { question, answer }),
    }, c, owner);
    if ('error' in out) throw new Error('eval:' + out.error);
    return out.value;
  });
}

/** 报告:report 图的 generate,经 invoke(空报告=业务校验失败)。 */
export function reportGenerator(pool: DbPool, owner: string, idempotencyKey: string, model: ModelClient): GenerateReport {
  return (s: InterviewSummary): Promise<ReportContent> => asPrincipal(pool, owner, async (c) => {
    const out = await invoke({
      idempotencyKey, schema: ReportSchema,
      businessValidate: (v) => (v.sections.length === 0 ? 'empty_report' : null),
      model: promptedModel(model, 'report.generate', { scores: s.scores }),
    }, c, owner);
    if ('error' in out) throw new Error('report:' + out.error);
    return out.value;
  });
}
