/**
 * resume-diagnosis 图（纯拓扑）：简历 → 结构化诊断报告。
 *   parse(摄取清洗) → generate(注入,经 ai-runtime.invoke 双校验) → validate(factuality 歪曲门:逐条 finding 过接地) → finalize(业务派生:计数+区间校验)。
 * 与 resume-quiz 同构、同纪律：纯逻辑——不引 db/contracts 运行时、不碰模型 SDK；模型经注入的 generate 进来
 * （真实由 ai-runtime.invoke 背书,测试由确定性 fake 背书）。
 *
 * 诊断维度：结构/完整性、亮点、风险/硬伤、岗位匹配度、可改写建议(基于真实经历优化表达,**绝不虚构经历**)。
 * 接地闸(分层,审计后强化——refs 接地≠内容接地,见 ADR/失败模式):
 *  ① **business validator**(注入边界 = diagnosisGenerator)硬拒改写虚构:改写 refs 必须接地 + **after 不得引入简历里没有的数字**
 *     (量化造假是简历虚构最高发、最可确定性检出的形态)+ 条数/长度封顶。任一不过 → 整次诊断走失败路径。
 *  ② **本图 validate 节点**(此处)优雅过滤:逐条 finding 过 factuality 歪曲门;**正面信用声明维度(亮点/匹配度)必须引证**
 *     (空 refs 的正面声明=无依据吹捧 → 剔除),其余维度(结构/完整性/风险=观察或缺口,无具体经历可引)允许空 refs。
 *  残留缺口(诚实声明,非 theater):refs 接地但正文语义虚构(如引用真词却编造无关声明)非确定性可拦,属 LLM-judge/ai-eval 层职责——
 *     不在本确定性闸内过度声明已解决。
 */
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { ingestResume, groundedByFacts, type ResumeProfile } from '@meetwise/domain';

/** 合法诊断维度(枚举,业务校验在注入边界把关;图侧按维度渲染)。 */
export const DIAGNOSIS_SECTION_KINDS = ['structure', 'completeness', 'highlight', 'risk', 'match'] as const;
export type DiagnosisSectionKind = typeof DIAGNOSIS_SECTION_KINDS[number];
/** 正面信用声明维度:断言候选人"拥有 X 经验/匹配 Y"——必须引证真实经历(空 refs=无依据吹捧,剔除)。
 *  其余维度(结构/完整性=表单观察、风险=缺口提示)非正面信用声明,允许无 refs。 */
const CLAIM_KINDS = new Set<string>(['highlight', 'match']);

/** 一条诊断发现:text=结论,refs=接地依据(简历里出现过的关键词,factuality 门保证非幻觉;空 refs=泛结构性观察可保留)。 */
export interface DiagnosisFinding { text: string; refs: string[] }
export interface DiagnosisSection { kind: DiagnosisSectionKind; title: string; score?: number; findings: DiagnosisFinding[] }
/** 一条改写建议:before=原表达,after=优化表达(**只优化表达,不新增经历**),refs=该建议锚定的真实经历(必须接地)。 */
export interface RewriteSuggestion { before: string; after: string; refs: string[] }

/** 模型出的原始诊断(已过 invoke 的 schema + business 双校验)。 */
export interface RawDiagnosis {
  overall: number;
  summary: string;
  sections: DiagnosisSection[];
  rewrites: RewriteSuggestion[];
}
/** 落库/交付的诊断报告(图 finalize 派生 groundedCount/rejectedCount)。 */
export interface DiagnosisReport extends RawDiagnosis {
  groundedCount: number;     // 过 factuality 门保留的 finding 数
  rejectedCount: number;     // 被歪曲门过滤的 finding 数
}

/** 注入边界：返回的诊断应已过 schema/业务双校验（真实流由 ai-runtime.invoke 保证;改写虚构在此被硬拒）。 */
export type GenerateDiagnosis = (profile: ResumeProfile) => Promise<RawDiagnosis> | RawDiagnosis;

const S = Annotation.Root({
  raw: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),
  profile: Annotation<ResumeProfile | null>({ reducer: (_, b) => b, default: () => null }),
  diagnosis: Annotation<RawDiagnosis | null>({ reducer: (_, b) => b, default: () => null }),
  rejected: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),   // factuality 门过滤掉的 finding 数(可观测)
  report: Annotation<DiagnosisReport | null>({ reducer: (_, b) => b, default: () => null }),
});

export function buildResumeDiagnosisGraph(deps: { generate: GenerateDiagnosis }) {
  return new StateGraph(S)
    .addNode('parse', (s) => ({ profile: ingestResume(s.raw) }))
    .addNode('generate', async (s) => ({ diagnosis: await deps.generate(s.profile!) }))
    .addNode('validate', (s) => {                                // factuality 歪曲门(纵深防御):逐条 finding 过接地
      const facts = s.profile!.facts;
      let rejected = 0;
      const sections = s.diagnosis!.sections.map((sec) => {
        const isClaim = CLAIM_KINDS.has(sec.kind);               // 正面信用声明维度(亮点/匹配度):必须引证,空 refs=无依据吹捧 → 剔除
        const kept = sec.findings.filter((f) => {
          if (isClaim && f.refs.length === 0) return false;       // 正面声明无 refs → 剔除(堵住"空 refs 走私虚构信用")
          return groundedByFacts(f.refs, facts);                  // 有 refs 必须接地;非声明维度(结构/完整性/风险=观察/缺口)允许空 refs
        });
        rejected += sec.findings.length - kept.length;
        return { ...sec, findings: kept };
      });
      // 改写建议已在注入边界(business validator)硬性接地;此处再过一遍纵深防御,绝不交付虚构改写。
      const rewrites = s.diagnosis!.rewrites.filter((r) => groundedByFacts(r.refs, facts));
      rejected += s.diagnosis!.rewrites.length - rewrites.length;
      return { diagnosis: { ...s.diagnosis!, sections, rewrites }, rejected };
    })
    .addNode('finalize', (s) => {                                // 业务派生 + 区间/枚举校验(第二道闸纵深)
      const d = s.diagnosis!;
      if (d.overall < 0 || d.overall > 100) throw new Error('diagnosis_overall_out_of_range');
      for (const sec of d.sections) {
        if (!DIAGNOSIS_SECTION_KINDS.includes(sec.kind)) throw new Error('diagnosis_bad_section_kind:' + sec.kind);
        if (sec.score != null && (sec.score < 0 || sec.score > 100)) throw new Error('diagnosis_section_score_out_of_range');
      }
      const groundedCount = d.sections.reduce((n, sec) => n + sec.findings.length, 0);
      const report: DiagnosisReport = { ...d, groundedCount, rejectedCount: s.rejected };
      return { report };
    })
    .addEdge(START, 'parse').addEdge('parse', 'generate')
    .addEdge('generate', 'validate').addEdge('validate', 'finalize').addEdge('finalize', END)
    .compile();
}
