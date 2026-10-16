/**
 * 职业路径（纯逻辑,无 IO）：综合分 + 弱项 → 准备度/层级/里程碑。补全"评估→学习→职业路径"成长链。
 * 保留不确定性、不替用户做决定(里程碑是建议,非承诺)。
 *
 * H3 LEVEL-SCHEME（#45/#102 · H1 阈值决议落码）：
 *   * v1 三档（75/50 分桶）转历史只读（H1 §3.3）：既有 career_path 行不改写不迁移·禁 v1/v2
 *     双写；判定面切 v2 五档单路径，五档枚举值入 career_path.level（level 列为无 CHECK text）。
 *   * 数值读 ② 镜像 LEVEL_SCHEME_V2（contracts 单源·禁字面量散布，沿 GAP 先例 + rg 门）。
 *   * 域内 v2 政策评估纯函数 evaluateLevelPolicy（evidence profile + overall → judgment）：
 *     只消费 evidence profile；从原始作答生产 profile 归范围外（R1-R9 算法·后刀 §3.3）。
 *   * 缺省语义 (a)（rev2 处方 1·2026-10-11 裁定）：卡数证据面为空=「证据面未接入」→ 跳过
 *     卡数/覆盖门控走纯分数阶梯——缺省 profile 不产生 unavailable、不产生伪 capped_by_evidence；
 *     卡数/覆盖门控（「样本不足不出级别」三推论·H1 §5）仅对显式传入非空 evidence profile 生效。
 */
import {
  LEVEL_SCHEME_V2,
  type LevelTier, type LevelReasonCode, type LevelJudgmentStatus,
} from '@meetwise/contracts';

export interface Milestone { stage: string; goal: string }
// level：v2 五档（读镜像 LevelTier 派生）；v1 三枚 junior/mid/senior 为其子集（历史行只读·显示承接归 page LEVEL_LABELS）。
export interface CareerPath { readiness: string; level: LevelTier; milestones: Milestone[] }

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/**
 * 证据 profile（只消费面）。全部硬证据字段缺省语义=未测（n_d=0）→ 只封顶不判低（推论 2·H1 §5）。
 * question_kind 冻结列未就绪 → scenarioPassed 不可真产（A.3.2 L4 kind=scenario 门·R9 暂不开放集
 * 规则行：undefined=未测 → L4 只封顶·不判低·非 unavailable）。
 */
export interface EvidenceProfile {
  cards: number;        // 有效卡数（推论 1/3 门）
  coverage: number;     // 覆盖能力数（推论 1/3 门）
  cardsDge3?: number;   // d≥3 有效卡数（L2 mid 硬证据·A.3.2）
  pDge3?: number;       // d≥3 通过率（有卡才可判·undefined=未测）
  cardsDge4?: number;   // d≥4 有效卡数（L3 senior/L4 staff 硬证据）
  pDge4?: number;       // d≥4 通过率
  cardsEq5?: number;    // d=5 有效卡数（L4 staff/L5 principal 硬证据）
  p5?: number;          // d=5 通过率
  scenarioPassed?: boolean; // L4「≥1 道 kind=scenario 题 ≥70」门（未就绪→undefined=未测）
}

/** v2 判定输出（A.3.5 状态机派生面·reviewed/superseded/fenced 为存储/围栏态非派生输出）。 */
export interface LevelJudgment {
  schemeVersion: 'v2';
  tier: LevelTier | null;          // unavailable 时 null（不输出任何档位）
  status: LevelJudgmentStatus;
  reasonCodes: LevelReasonCode[];
}

/** v2 五档分数阶梯（scoreFloor 单源读镜像·禁字面量）：S≥85→principal · ≥75→staff · ≥65→senior · ≥50→mid · 无下限→junior。 */
function ladderTier(overall: number): LevelTier {
  const floor = LEVEL_SCHEME_V2.scoreFloor;
  return overall >= floor.principal ? 'principal'
    : overall >= floor.staff ? 'staff'
    : overall >= floor.senior ? 'senior'
    : overall >= floor.mid ? 'mid'
    : 'junior';   // L1 无分数下限（附录 A 第 5 条）
}

/** 档位硬证据判定（A.3.2 难度证据要求列）：null=过 · 'untested'=未测/不足额（只封顶）· 'underperform'=测了没过（否定证据）。 */
function hardEvidenceVerdict(tier: LevelTier, e: EvidenceProfile): null | 'untested' | 'underperform' {
  const he = LEVEL_SCHEME_V2.hardEvidence;
  if (tier === 'mid') {
    if ((e.cardsDge3 ?? 0) < he.mid.cardsDge3) return 'untested';
    if (e.pDge3 === undefined) return 'untested';
    return e.pDge3 < he.mid.pDge3 ? 'underperform' : null;
  }
  if (tier === 'senior') {
    if ((e.cardsDge4 ?? 0) < he.senior.cardsDge4) return 'untested';
    if (e.pDge4 === undefined) return 'untested';
    return e.pDge4 < he.senior.pDge4 ? 'underperform' : null;
  }
  if (tier === 'staff') {
    if ((e.cardsDge4 ?? 0) < he.staff.cardsDge4) return 'untested';
    if ((e.cardsEq5 ?? 0) < he.staff.cardsEq5) return 'untested';
    if (e.pDge4 === undefined) return 'untested';
    if (e.pDge4 < he.staff.pDge4) return 'underperform';
    // L4 kind=scenario 门（A.3.2 其他条件·question_kind 冻结列落地前 L4 不开放·R9 暂不开放集规则行）：
    // undefined=未测 → 只封顶不判低；false=测了没过 → 否定证据。
    if (e.scenarioPassed === undefined) return 'untested';
    return e.scenarioPassed ? null : 'underperform';
  }
  if (tier === 'principal') {
    if ((e.cardsEq5 ?? 0) < he.principal.cardsEq5) return 'untested';
    if (e.p5 === undefined) return 'untested';
    return e.p5 < he.principal.p5 ? 'underperform' : null;
  }
  return null;   // L1 无硬证据要求（兜底档·A.3.2）
}

/**
 * 域内 v2 政策评估纯函数（evidence profile + overall → judgment）。
 *
 * 缺省（无 evidence）：纯分数阶梯（(a) 语义）——R8 信息码 + L5 强制复核两条规则行仍生效。
 * 显式 evidence：⑦ 三推论落码——
 *   推论 1（穷举）：unavailable 触发条件 = insufficient_cards ∪ insufficient_coverage；
 *     任何分数路径不得产生 unavailable（低分→L1+below_l1_reference·不把答得差伪装成无数据）。
 *   推论 2（只封顶不判低）：insufficient_hard_evidence → capped_by_evidence（补测引导语义）；
 *     未测（n_d=0·只封顶）≠ 测了没过（P_d 低·hard_question_underperform 否定证据）。
 *   推论 3（反证判据·prove 硬断言）：任何 unavailable 判定必满足「有效卡数 <3 ∪ 覆盖能力 <2」
 *     （= L1 最低门 minCards.junior=3 / minCoverage.junior=2·本函数唯一 unavailable 出口）。
 */
export function evaluateLevelPolicy(overall: number, evidence?: EvidenceProfile): LevelJudgment {
  if (!Number.isInteger(overall) || overall < 0 || overall > 100) fail('insufficient_evidence');

  // ── 缺省语义 (a)：证据面未接入 → 纯分数阶梯（rev2 §2⑤：不产生 unavailable·不产生伪 capped_by_evidence）。
  if (evidence === undefined) {
    const tier = ladderTier(overall);
    const reasonCodes: LevelReasonCode[] = [];
    if (overall < LEVEL_SCHEME_V2.belowL1Reference) reasonCodes.push('below_l1_reference');   // R8 信息码·非下限
    if (tier === 'principal') {   // A.3.2 L5「强制 review_required·首期不允许自动终判」（top_tier_manual）
      reasonCodes.push('top_tier_manual');
      return { schemeVersion: 'v2', tier, status: 'review_required', reasonCodes };
    }
    return { schemeVersion: 'v2', tier, status: 'auto_final', reasonCodes };
  }

  // ── 显式 evidence profile：卡数/覆盖门控 + 硬证据封顶。
  const reasonCodes: LevelReasonCode[] = [];
  const minCards = LEVEL_SCHEME_V2.minCards;
  const minCoverage = LEVEL_SCHEME_V2.minCoverage;
  const noCards = evidence.cards < minCards.junior;
  const noCoverage = evidence.coverage < minCoverage.junior;
  if (noCards || noCoverage) {   // 推论 1+3：唯一 unavailable 出口（L1 门即最低门）
    if (noCards) reasonCodes.push('insufficient_cards');
    if (noCoverage) reasonCodes.push('insufficient_coverage');
    return { schemeVersion: 'v2', tier: null, status: 'unavailable', reasonCodes };
  }

  // 分数阶梯为上界，向下走梯：每档过卡数/覆盖/硬证据三门才可达；未达即降档（§2.3 规则只算上限 Lmax·永不抬高）。
  let status: LevelJudgmentStatus = 'auto_final';
  const tiers = LEVEL_SCHEME_V2.tiers;
  let tier: LevelTier = 'junior';
  for (let i = tiers.indexOf(ladderTier(overall)); i >= 0; i--) {
    const t = tiers[i]!;
    if (evidence.cards < minCards[t]) {
      if (!reasonCodes.includes('insufficient_cards')) reasonCodes.push('insufficient_cards');
      continue;   // §2.3：目标档及以上不可达·按卡数降 Lmax
    }
    if (evidence.coverage < minCoverage[t]) {
      if (!reasonCodes.includes('insufficient_coverage')) reasonCodes.push('insufficient_coverage');
      continue;   // §2.3：按覆盖数降 Lmax
    }
    const hard = hardEvidenceVerdict(t, evidence);
    if (hard === 'untested') {
      if (!reasonCodes.includes('insufficient_hard_evidence')) reasonCodes.push('insufficient_hard_evidence');
      status = 'capped_by_evidence';   // 推论 2：未测只封顶不判低（capped_by_evidence·补测引导）
      continue;
    }
    if (hard === 'underperform') {
      if (!reasonCodes.includes('hard_question_underperform')) reasonCodes.push('hard_question_underperform');
      continue;   // §2.3：测了没过=否定证据·不得上调（降档·非 unavailable 非 capped）
    }
    tier = t;
    break;
  }
  if (overall < LEVEL_SCHEME_V2.belowL1Reference) reasonCodes.push('below_l1_reference');   // R8 信息码·非下限
  if (tier === 'principal') { reasonCodes.push('top_tier_manual'); status = 'review_required'; }   // L5 强制复核
  return { schemeVersion: 'v2', tier, status, reasonCodes };
}

/** 五档 readiness 展示文案（v1 三枚原文保留·staff/principal 按既有语气机械补写·纯展示）。 */
function readinessFor(level: LevelTier): string {
  return level === 'principal' ? '已至专家档（建议保持深度影响力）'
    : level === 'staff' ? '资深岗位竞争力成形（建议对齐目标职级）'
    : level === 'senior' ? '可冲刺目标岗位（建议保持手感）'
    : level === 'mid' ? '需补强后投递'
    : '基础夯实阶段';
}

/**
 * deriveCareerPath（冻结签名 (overall, weaknesses) + 冻结返回形 {readiness,level,milestones}）。
 * 内部走 v2 决议：缺省 evidence profile（证据面未接入·生产面 #40 未接通·不得伪造卡数）→
 * 纯分数阶梯；unavailable 复用既有 insufficient_evidence 通道（409 信封由 interview.service
 * tx1 catch 承接·零新增响应码零新增响应键）。
 */
export function deriveCareerPath(overall: number, weaknesses: string[]): CareerPath {
  if (!Number.isInteger(overall) || overall < 0 || overall > 100) fail('insufficient_evidence');
  const j = evaluateLevelPolicy(overall);
  // 缺省路径恒非 unavailable（rev2 纯函数断言）；防御守门走既有 fail 通道（与上行同码同信封）。
  if (j.tier === null || j.status === 'unavailable') fail('insufficient_evidence');
  const level = j.tier;
  const readiness = readinessFor(level);
  const milestones: Milestone[] = [];
  if (weaknesses.length) milestones.push({ stage: '补短板', goal: `优先攻克：${weaknesses.join('、')}` });
  milestones.push({ stage: '模拟实战', goal: '完成 3 场达标(≥70)模拟面试' });   // S2 字面与数值零触（#102·待校准登记项·milestoneSimulationPass 规则改造范围外）
  if (level !== 'principal') milestones.push({ stage: '进阶', goal: '系统项目沉淀 + 深度题复盘' });   // 未到顶建议进阶（v2 顶档=principal·机械对齐）
  return { readiness, level, milestones };
}
