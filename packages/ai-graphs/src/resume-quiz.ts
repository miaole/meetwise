/**
 * resume-quiz 图（纯拓扑）：parse(摄取清洗) → generate(注入) → validate(factuality 歪曲门) → make_report(业务派生)。
 * 纯逻辑——不引 db/contracts 运行时、不碰模型 SDK。模型经注入的 generate 进来（真实由 ai-runtime.invoke 背书，
 * 测试由确定性 fake 背书）。这样图本身可用 fake 确定性单测，易失技术全在注入边界外。
 */
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { ingestResume, groundedByFacts, type ResumeProfile } from '@meetwise/domain';

export interface QuizItem { q: string; refs: string[] }
/** 注入边界：返回的 items 应已过 schema/业务双校验（真实流由 ai-runtime.invoke 保证）。 */
export type GenerateQuestions = (profile: ResumeProfile) => Promise<QuizItem[]> | QuizItem[];

const S = Annotation.Root({
  raw: Annotation<string>({ reducer: (_, b) => b, default: () => '' }),
  profile: Annotation<ResumeProfile | null>({ reducer: (_, b) => b, default: () => null }),
  questions: Annotation<QuizItem[]>({ reducer: (_, b) => b, default: () => [] }),
  rejected: Annotation<QuizItem[]>({ reducer: (_, b) => b, default: () => [] }),
  report: Annotation<{ score: number; grounded: number; summary: string } | null>({ reducer: (_, b) => b, default: () => null }),
});

export function buildResumeQuizGraph(deps: { generate: GenerateQuestions }) {
  return new StateGraph(S)
    .addNode('parse', (s) => ({ profile: ingestResume(s.raw) }))
    .addNode('generate', async (s) => ({ questions: await deps.generate(s.profile!) }))
    .addNode('validate', (s) => {                               // factuality 歪曲门
      const grounded: QuizItem[] = [], rejected: QuizItem[] = [];
      for (const it of s.questions) (groundedByFacts(it.refs, s.profile!.facts) ? grounded : rejected).push(it);
      return { questions: grounded, rejected };
    })
    .addNode('make_report', (s) => {
      const score = Math.min(100, 40 + s.questions.length * 20);
      if (score < 0 || score > 100) throw new Error('score_out_of_range'); // 业务校验
      return { report: { score, grounded: s.questions.length, summary: `接地生成 ${s.questions.length} 题，过滤幻觉 ${s.rejected.length} 题` } };
    })
    .addEdge(START, 'parse').addEdge('parse', 'generate')
    .addEdge('generate', 'validate').addEdge('validate', 'make_report').addEdge('make_report', END)
    .compile();
}
