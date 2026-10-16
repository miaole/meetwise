/**
 * session-summary.ts — #51 会话级结构化会话摘要（CONTEXT-DEEP 小刀）纯拓扑原语。
 *
 * 职责：从 checkpoint 安全的 transcript 派生字段（q/competency/kind/score/outcome/evidence——
 * state.ts「作答原文禁入」纪律零破·evidence=模型判据非用户原文）确定性聚合「本场至今」摘要,
 * 经 genQuestion 第 9 additive 形参传入 worker 闭包,渲染进 interviewer.ask v8 的 <data> 不可信段。
 *
 * 这里不做：作答文本聚合（原始作答/其派生摘要仍只在 worker 闭包单槽 lastFollowUp——回放确定性
 * 与隐私双约束,REQUEST §1.3 候选丙否决）；context-budget/CTX-02 接线（AG-20/#217 面·候选丁）；
 * 持久化（MEM-00 完成前禁写任何记忆摘要——execution-master-checklist :66）。
 */
import type { QuestionKind } from '@meetwise/domain';

/**
 * Turn 的只读结构子集（AI-GRAPHS-CYCLE-BREAK 环解）：本模块只消费这六个 checkpoint 派生字段,
 * 以局部结构子集承接而不 import Turn——拆除 session-summary→state 回边后保单向
 * state→session-summary（state.ts 经 TurnCoversSessionTurnInput 编译期守卫+const 断言消费者
 * 钉死结构覆盖,失覆盖漂移即 state.ts 断言行 TS2322 红）。零运行时副作用零行为变更。
 */
export interface SessionTurnInput {
  q: string;
  competency: string;
  score: number | null;
  outcome: 'answered' | 'clarify' | 'unresolved' | 'unscored';
  kind: QuestionKind;
  evidence?: string[];
}

/** 聚合窗：最近 3 个已评分回合（更早回合只贡献弱点累计,不重复进窗）。 */
export const SESSION_SUMMARY_MAX_TURNS = 3;
/** 每回合题面摘要帽（窄于 followUp 上轮题目 200——会话段多行,逐行更紧）。 */
export const SESSION_QUESTION_MAX_CHARS = 120;
/** 弱点累计帽：跨全回合去重后 ≤6 条 × ≤80 字符（沿 FOLLOWUP_WEAKNESS_MAX_CHARS 同帽）。 */
export const SESSION_WEAKNESS_MAX_CHARS = 80;
/** 弱点预算薄登记(P2-d):≤6 条系 prompt 渲染预算帽非安全边界——先到先得·帽满即止·后到弃置
 *  (早回合弱点恒占槽,晚回合新弱点可能挤不出),语义去重归后继(#203)。 */
export const SESSION_WEAKNESS_MAX_COUNT = 6;
/** 能力名帽（planner 硬闸单名 ≤100 同值）。 */
export const SESSION_COMPETENCY_MAX_CHARS = 100;

/** 单回合摘要（全部为 checkpoint 已有派生字段·零新增敏感面）。 */
export interface SessionTurnDigest {
  /** 已评分回合序数（1 起,全场连续计——非 transcript 下标）。 */
  n: number;
  competency: string;
  kind: SessionTurnInput['kind'];
  score: number;
  q: string;
}

/** 会话级结构化摘要（null=尚无已评分回合——渲染端缺省=段不渲染=v7 输出字节）。 */
export interface SessionSummary {
  turns: SessionTurnDigest[];
  weaknesses: string[];
}

function bounded(s: string, max: number): string {
  if (s.length <= max) return s;
  let end = max;
  const code = s.charCodeAt(end - 1);
  if (code >= 0xd800 && code <= 0xdbff) end -= 1;
  return s.slice(0, end);
}

/**
 * 确定性聚合：只取 outcome==='answered' ∧ score 为数的回合（clarify/unresolved/unscored 不捕获——
 * 沿 S3 lastFollowUp 同一捕获纪律）；窗=最近 SESSION_SUMMARY_MAX_TURNS 个；弱点=全已评分回合
 * evidence 先界后并、精确串去重保首现、帽内截断。纯函数零 IO 零模型零墙钟。弱点去重=精确串
 * （确定性可 gate）；语义去重归后继（#203 weaknessMatches 先例可后挂,本刀不引 worker 依赖）。
 */
export function buildSessionSummary(transcript: readonly SessionTurnInput[]): SessionSummary | null {
  const scored = transcript.filter((t) => t.outcome === 'answered' && typeof t.score === 'number');
  if (scored.length === 0) return null;
  const windowed = scored.slice(-SESSION_SUMMARY_MAX_TURNS);
  const first = scored.length - windowed.length + 1;
  const weaknesses: string[] = [];
  for (const t of scored) {
    for (const raw of t.evidence ?? []) {
      const w = bounded(raw, SESSION_WEAKNESS_MAX_CHARS);
      if (w && !weaknesses.includes(w) && weaknesses.length < SESSION_WEAKNESS_MAX_COUNT) weaknesses.push(w);
    }
  }
  return {
    turns: windowed.map((t, i) => ({
      n: first + i,
      competency: bounded(t.competency, SESSION_COMPETENCY_MAX_CHARS),
      kind: t.kind,
      score: t.score as number,
      q: bounded(t.q, SESSION_QUESTION_MAX_CHARS),
    })),
    weaknesses,
  };
}
