/**
 * 报告页「逐题点评」投影（EVIDENCE-DELIVERY S2 · P3 形态钉死：纯函数沿 lib/interview/turn-submission.ts 先例，
 * 组件测试形态否决——prove 面只测本纯函数，零 React harness）。
 *
 * transcript turns（GET /interview/:id/transcript，web 首次接线）→ AnnotationCard props：
 * - question = turn.question 真题目文本（**维度名冒充退役**）；
 * - note = turn.evidence 模型判据(criterion)列表（**固定串退役**；**note 空⇒undefined**——
 *   旧行/未评分回合 evidence 缺失→回退隐藏（P2），AnnotationCard 的 `note ? … : null` 天然不渲染，
 *   **禁止任何新造回退文案**）；
 * - score = turn.score（分数权威=ScoreCard；**无卡 null⇒undefined**——无数值呈现，SCOR-02 纪律保持，
 *   transcript 分数列 null-until-ScoreCard 是如实呈现）。
 */

/** GET /interview/:id/transcript 响应 turns[] 的消费面形状（interview-report.ts transcriptView 投影）。 */
export interface TranscriptTurn {
  index: number;
  question: string;
  competency?: string;
  score: number | null;
  outcome?: string;
  evidence?: string[];
}

/** AnnotationCard 消费的最小 props 形状（note/score 缺省=不渲染对应区块）。 */
export interface TurnAnnotation {
  question: string;
  note?: string;
  score?: number;
}

export function projectTurnAnnotations(turns: readonly TranscriptTurn[]): TurnAnnotation[] {
  return turns.map((turn) => ({
    question: turn.question,
    note: Array.isArray(turn.evidence) && turn.evidence.length > 0 ? turn.evidence.join('；') : undefined,
    score: typeof turn.score === 'number' ? turn.score : undefined,
  }));
}
