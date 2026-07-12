/**
 * report 图（纯拓扑）：面试结果 → 报告。作为**子图/后台 job** 跑（worker 注入持久层与模型），不在面试主链路同步出报告——
 * 这是舱壁:报告重、可能失败,不能阻塞或拖垮面试。generate 注入（真实由 ai-runtime.invoke 背书,可抛=模型失败）。
 */
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

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

export function buildReportGraph(deps: { generate: GenerateReport }) {
  return new StateGraph(S)
    .addNode('generate', async (s) => ({ report: await deps.generate(s.summary!) }))
    .addNode('validate', (s) => {                              // 业务校验：分数区间、节数 > 0
      const r = s.report!;
      if (r.overall < 0 || r.overall > 100) throw new Error('report_score_out_of_range');
      if (r.sections.length === 0) throw new Error('report_empty');
      return {};
    })
    .addEdge(START, 'generate').addEdge('generate', 'validate').addEdge('validate', END)
    .compile();
}
