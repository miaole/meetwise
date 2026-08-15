/**
 * report 图（纯拓扑）：面试结果 → 报告。作为**子图/后台 job** 跑（worker 注入持久层与模型），不在面试主链路同步出报告——
 * 这是舱壁:报告重、可能失败,不能阻塞或拖垮面试。generate 注入（真实由 ai-runtime.invoke 背书,可抛=模型失败）。
 */
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { aggregateScores } from '@meetwise/domain';

export interface InterviewSummary {
  interviewId: string;
  questionCount: number;
  scores: number[];
  owner?: string;   // 组合根注入(多 owner dispatcher 据此构 reportGenerator 的 owner/幂等键)
}
export interface ReportContent { overall: number; sections: { title: string; body: string }[]; }
/** 注入边界：真实由 ai-runtime.invoke（双校验）背书;失败应抛错（worker 据此标 report failed,不碰 interview）。 */
export type GenerateReport = (s: InterviewSummary) => Promise<ReportContent> | ReportContent;

const S = Annotation.Root({
  summary: Annotation<InterviewSummary | null>({ reducer: (_, b) => b, default: () => null }),
  report: Annotation<ReportContent | null>({ reducer: (_, b) => b, default: () => null }),
});

/** 报告段落去重使用稳定指纹：忽略大小写、空白、标点，但不尝试做不可审计的"语义去重"。 */
const fingerprint = (text: string) => text
  .normalize('NFKC')
  .toLocaleLowerCase('zh-CN')
  .replace(/[\s\p{P}\p{S}]/gu, '');

/** 一段里反复输出同一句是已复现的 P0；按换行/句末拆分后检测精确重复。 */
function paragraphFingerprints(body: string): string[] {
  return body
    .split(/(?:\r?\n){1,}|(?<=[。！？!?])\s*/u)
    .map(fingerprint)
    .filter((part) => part.length >= 8);
}

/** 报告入库前的确定性完整性门；对模型、测试注入和未来调用方同样生效。 */
export function validateReportContent(summary: InterviewSummary, report: ReportContent): void {
  const expectedOverall = aggregateScores(summary.scores);
  if (report.overall !== expectedOverall) throw new Error('report_overall_mismatch');
  if (report.sections.length === 0) throw new Error('report_empty');

  const sections = new Set<string>();
  const paragraphs = new Set<string>();
  for (const section of report.sections) {
    const title = fingerprint(section.title);
    const body = fingerprint(section.body);
    if (!title || !body) throw new Error('report_blank_section');
    const sectionKey = `${title}\n${body}`;
    if (sections.has(sectionKey)) throw new Error('report_duplicate_section');
    sections.add(sectionKey);
    for (const paragraph of paragraphFingerprints(section.body)) {
      if (paragraphs.has(paragraph)) throw new Error('report_duplicate_paragraph');
      paragraphs.add(paragraph);
    }
  }
}

export function buildReportGraph(deps: { generate: GenerateReport }) {
  return new StateGraph(S)
    .addNode('generate', async (s) => ({ report: await deps.generate(s.summary!) }))
    .addNode('validate', (s) => {                              // 业务校验：确定性总分 + 非空/不重复段落
      validateReportContent(s.summary!, s.report!);
      return {};
    })
    .addEdge(START, 'generate').addEdge('generate', 'validate').addEdge('validate', END)
    .compile();
}
