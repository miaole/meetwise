/**
 * @meetwise/domain · 评分测量事实根（SCOR-01）纯域原语（零 IO、零模型、零 db）。
 *
 * 这是「版本化 rubric + 两阶段评分事实根」的唯一**状态机真相**：ScoreCard 证据流转移表 +
 * ScoreRequest permit/fence 状态机 + 可评分判定。DB 侧迁移 0100 的触发器
 * （assert_score_card_status_transition / assert_score_request_status_oneway）与这里逐值一致，
 * 靠跨侧 test pin（proof 逐值比对）兜底——两侧是两份手写真相，漂移不会在运行期被自动拒绝。
 *
 * 铁律（对齐 interview-scoring-measurement.md §3）：
 *   - 显式状态 enum，禁布尔汤；审计转移 DB 触发器重校验，非法转移被拒。
 *   - `unscored / review_required / calibration_blocked / evidence_invalid` **非 0 分且不参与
 *     聚合/求平均**（不是「打了 0 分」，是「没有可参与评分的分数」）——消费侧必须把它们
 *     当 scoreless 渲染，绝不当 0 分排名（同 recruiter 的 assessment_unavailable 语义）。
 *   - 只有 `practice_eligible` 可进入 C 端评分，只有 `b_review_eligible` 可进入 B 端评审。
 *   - `superseded`（更正）与 `fenced`（删除）是吸收态，从任意非吸收态可达，但不可再迁出。
 */

/** ScoreCard 状态（与迁移 0100 的 CHECK 枚举逐值一致）。 */
export const SCORE_CARD_STATUSES = [
  'pending_evidence', 'evidence_valid', 'evidence_invalid', 'unscored', 'practice_eligible',
  'review_required', 'calibration_blocked', 'b_review_eligible', 'superseded', 'fenced',
] as const;
export type ScoreCardStatus = (typeof SCORE_CARD_STATUSES)[number];

/** ScoreRequest permit/fence 状态（与迁移 0100 的 CHECK 枚举逐值一致）。 */
export const SCORE_REQUEST_STATUSES = ['pending', 'claimed', 'dispatched', 'scored', 'fenced'] as const;
export type ScoreRequestStatus = (typeof SCORE_REQUEST_STATUSES)[number];

/** QuestionRubric 状态（唯一可达态 published；append-only，禁原地改写）。 */
export const QUESTION_RUBRIC_STATUSES = ['published'] as const;
export type QuestionRubricStatus = (typeof QUESTION_RUBRIC_STATUSES)[number];

/** 吸收态：更正/删除一旦进入，不可再迁出（触发器与 canTransitionScoreCard 双份守卫）。 */
const SCORE_CARD_ABSORBING_STATUSES: readonly ScoreCardStatus[] = ['superseded', 'fenced'];

/**
 * 证据流转移表（interview-scoring-measurement.md §3 状态机）：
 *   pending_evidence → evidence_valid | evidence_invalid
 *   evidence_valid   → practice_eligible | review_required
 *   practice_eligible→ calibration_blocked | b_review_eligible
 *   review_required  → b_review_eligible | unscored（SCOR-03：独立复核既可裁决进入 B 端评审，
 *                      也可判为无分——两者都是 review_required 的合法出边）
 *   evidence_invalid → unscored
 * `unscored / calibration_blocked / b_review_eligible` 是证据流终态（无出边）。
 * 生命周期转移（→superseded/fenced）不走本表，由 canTransitionScoreCard 单独放行。
 */
export const SCORE_CARD_TRANSITIONS: Readonly<Record<ScoreCardStatus, readonly ScoreCardStatus[]>> = {
  pending_evidence: ['evidence_valid', 'evidence_invalid'],
  evidence_valid: ['practice_eligible', 'review_required'],
  evidence_invalid: ['unscored'],
  practice_eligible: ['calibration_blocked', 'b_review_eligible'],
  review_required: ['b_review_eligible', 'unscored'],
  calibration_blocked: [],
  b_review_eligible: [],
  unscored: [],
  superseded: [],
  fenced: [],
};

/** 审计转移判定（与 0100 触发器 assert_score_card_status_transition 逐值一致）。
 *  同一态幂等 = true；吸收态不可迁出 = false；→superseded/fenced 从任意非吸收态 = true。 */
export function canTransitionScoreCard(from: ScoreCardStatus, to: ScoreCardStatus): boolean {
  if (from === to) return true;
  if ((SCORE_CARD_ABSORBING_STATUSES as readonly string[]).includes(from)) return false;
  if ((SCORE_CARD_ABSORBING_STATUSES as readonly string[]).includes(to)) return true;
  return (SCORE_CARD_TRANSITIONS[from] ?? []).includes(to);
}

/** 只有这两个态是可参与评分/评审的「有效分」；其余状态一律不可评分。 */
export function isScoreCardScorable(status: ScoreCardStatus): boolean {
  return status === 'practice_eligible' || status === 'b_review_eligible';
}

/**
 * 非评分态：这些状态**不是 0 分**，消费侧必须把它们当 scoreless 处理，绝不参与聚合/求平均。
 * （SCOR-01 只定义语义；SCOR-02 的确定性聚合器在消费时据此跳过这些态。）
 */
export const SCORE_CARD_NON_SCORING_STATUSES = [
  'unscored', 'review_required', 'calibration_blocked', 'evidence_invalid',
] as const;
