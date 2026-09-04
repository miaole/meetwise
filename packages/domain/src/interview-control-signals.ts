/**
 * @meetwise/domain · 面试控制信号（UC-INT-LEVEL-SIGNAL-01）纯域原语（零 IO、零模型、零 db）。
 *
 * INT-LEVEL-SIGNAL-01 控制流地基（≠ INT-LEVEL-01）：从已持久化的 mind 观察 weak / thrashing，供 decideNext 消费。
 * 不是 CompetencyLevelAssessment，不写 band，不读简历年限/受保护属性。
 * 旧 checkpoint 缺轨迹字段或分数样本不足 → fail-closed 为 none（不提前终止、不补造分数）。
 *
 * 与覆盖驱动时长协调：本模块永不改写 maxTurns；safety_ceiling（turn>=absoluteMaxTurns）由 decideNext 先判。
 * 不冻结产品轮次上限。本文件不 import adaptive-interview.ts，避免与 decideNext 形成环。
 */

/** 观察面（结构兼容 InterviewMind；刻意不从 adaptive-interview 取值类型，以保持 DAG 单向）。 */
export interface InterviewMindSignalView {
  competencies?: Array<{ confidence?: number; depthProbed?: number } | null> | null;
  turn?: number;
  recentScores?: unknown;
  pivotCount?: number;
}

export const INTERVIEW_CONTROL_SIGNAL_KINDS = ['none', 'weak', 'thrashing'] as const;
export type InterviewControlSignalKind = (typeof INTERVIEW_CONTROL_SIGNAL_KINDS)[number];

/** 与 coverage-driven length 的 ConcludeReason 对齐（thrashing 不是 early_thrashing）。 */
export const INTERVIEW_CONCLUDE_REASONS = [
  'budget_exhausted',
  'all_resolved',
  'coverage_met',
  'early_weak',
  'thrashing',
  'safety_ceiling',
] as const;
export type InterviewConcludeReason = (typeof INTERVIEW_CONCLUDE_REASONS)[number];

/** 至少两门已探过，才谈“跨能力持续弱”；单能力 off-ramp 仍走既有 pivot。 */
export const WEAK_MIN_PROBED = 2;
/** 最小观察轮次：两轮 off-ramp 后仍允许再探下一门一次；与当时软预算/绝对杀开关无关。 */
export const WEAK_MIN_TURNS = 4;
/** 已探能力的 confidence 必须都低于此（hasHook 封顶 0.6 不会误判 weak）。 */
export const WEAK_CONFIDENCE_CEILING = 0.35;
/** 与 adaptive-interview CONF_ENOUGH 对齐：够强则既非 weak 也非 thrashing。 */
export const SIGNAL_CONF_ENOUGH = 0.7;
export const THRASH_MIN_SAMPLES = 4;
export const THRASH_MIN_FLIPS = 3;
export const THRASH_MIN_PIVOTS = 3;
export const SCORE_HIGH = 70;
export const SCORE_LOW = 40;
export const SIGNAL_TRAIL_CAP = 6;

export interface InterviewControlSignal {
  kind: InterviewControlSignalKind;
  /** 已探能力数（depthProbed≥1）。 */
  probedCount: number;
  /** 高/低分带翻转次数（中档分不计数）。 */
  scoreFlips: number;
  pivotCount: number;
}

const emptySignal = (probedCount: number, scoreFlips: number, pivotCount: number): InterviewControlSignal => ({
  kind: 'none', probedCount, scoreFlips, pivotCount,
});

function asFiniteScores(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100);
}

function scoreFlips(scores: number[]): number {
  let flips = 0;
  let last: 'high' | 'low' | null = null;
  for (const s of scores) {
    const band = s >= SCORE_HIGH ? 'high' : s < SCORE_LOW ? 'low' : null;
    if (!band) continue;
    if (last && band !== last) flips++;
    last = band;
  }
  return flips;
}

/**
 * 只读观察。不读 extra 字段（observedBand/年限/性别/学校/权重）。缺轨迹 → none。
 */
export function observeInterviewSignals(mind: InterviewMindSignalView | null | undefined): InterviewControlSignal {
  if (!mind || !Array.isArray(mind.competencies)) return emptySignal(0, 0, 0);
  const comps = mind.competencies;
  const probed = comps.filter((c) => typeof c?.depthProbed === 'number' && c.depthProbed >= 1);
  const trailReady = Array.isArray(mind.recentScores);
  const scores = asFiniteScores(mind.recentScores);
  const flips = scoreFlips(scores);
  const pivots = typeof mind.pivotCount === 'number' && Number.isFinite(mind.pivotCount) && mind.pivotCount >= 0
    ? Math.floor(mind.pivotCount)
    : 0;
  const turn = typeof mind.turn === 'number' && Number.isFinite(mind.turn) ? mind.turn : 0;
  const anyStrong = comps.some((c) => (c?.confidence ?? 0) >= SIGNAL_CONF_ENOUGH);

  // 旧 checkpoint 无 recentScores → 两类提前终止都 fail-closed（weak 不能只靠 turn/confidence 开火）。
  if (!trailReady) return emptySignal(probed.length, flips, pivots);

  // 分数样本不足（含仅 clarify/unresolved、图 unscored 未入轨迹）不开火：不靠 turn/confidence 单独提前停。
  const weak = !anyStrong
    && scores.length >= WEAK_MIN_PROBED
    && probed.length >= WEAK_MIN_PROBED
    && turn >= WEAK_MIN_TURNS
    && probed.every((c) => (c.confidence ?? 1) < WEAK_CONFIDENCE_CEILING);

  // 震荡必须同时满足：跨能力 pivot + 高/低带翻转。单能力 hasHook 深挖或平稳换题单独不够。
  const thrashing = !anyStrong
    && scores.length >= THRASH_MIN_SAMPLES
    && flips >= THRASH_MIN_FLIPS
    && pivots >= THRASH_MIN_PIVOTS;

  if (weak) return { kind: 'weak', probedCount: probed.length, scoreFlips: flips, pivotCount: pivots };
  if (thrashing) return { kind: 'thrashing', probedCount: probed.length, scoreFlips: flips, pivotCount: pivots };
  return emptySignal(probed.length, flips, pivots);
}
