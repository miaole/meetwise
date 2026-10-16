/**
 * H3 LEVEL-SCHEME 政策纯函数 prove（⑦「样本不足不出级别」三推论 + rev2 处方 1 缺省语义 (a) 断言）。
 * `pnpm -C packages/domain prove:level-policy`（纯函数面·零 IO·零模型外呼·est live=0）
 *
 * 断言面（REQUEST §4.3 + §2⑤ rev2 判据钉死）：
 *   1. 推论 1 穷举：unavailable 触发条件 = insufficient_cards ∪ insufficient_coverage；
 *      任何分数路径不得产生 unavailable（低分→L1+below_l1_reference·不得把答得差伪装成无数据）。
 *   2. 推论 2 只封顶不判低：insufficient_hard_evidence → capped_by_evidence；
 *      未测（n_d=0）≠ 测了没过（P_d 低 → hard_question_underperform 否定证据）。
 *   3. 推论 3 反证判据（硬断言）：任何 unavailable 判定必满足「有效卡数 <3 ∪ 覆盖能力 <2」；
 *      存在 S 低但卡数/覆盖充分却输出 unavailable 的样本 = FAIL。
 *   4. rev2 缺省语义 (a)：缺省 profile（证据面未接入）全 S 域扫描 0..100——
 *      不产生 unavailable、不产生伪 capped_by_evidence；纯分数阶梯 85/75/65/50 派生 tier；
 *      S<30 附 below_l1_reference 且仍得 L1；回归三面锚（0→junior/60→mid）零翻自证。
 *   5. L4 kind=scenario 门（question_kind 未就绪·scenarioPassed=undefined=未测）→ L4 只封顶；
 *      L5 强制 review_required（top_tier_manual·首期不允许自动终判）。
 */
import { deriveCareerPath, evaluateLevelPolicy } from '../src/index.ts';
import { LEVEL_SCHEME_V2, LEVEL_SCHEME_ACTIVE_VERSION } from '@meetwise/contracts';

let fail = 0;
let assertions = 0;
const A = (n: string, c: boolean) => { assertions++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const throws = (fn: () => unknown, code?: string) => {
  try { fn(); return false; }
  catch (e) { return code ? (e as { code?: string }).code === code : true; }
};

// ── 充分证据合成 profile（卡数/覆盖全档达标·硬证据全测全过·零伪造进 live 面：仅纯函数 prove 消费）。
interface FullEvidence { cards: number; coverage: number; cardsDge3: number; pDge3: number; cardsDge4: number; pDge4: number; cardsEq5: number; p5: number }
const fullEvidence: FullEvidence = {
  cards: LEVEL_SCHEME_V2.minCards.principal,        // 10
  coverage: LEVEL_SCHEME_V2.minCoverage.principal,  // 5
  cardsDge3: 6, pDge3: 0.9,
  cardsDge4: 5, pDge4: 0.9,
  cardsEq5: 3, p5: 0.9,
};
const sufficient = (over: Partial<FullEvidence> = {}) => ({ ...fullEvidence, ...over });

// ── 1·rev2 缺省语义 (a)：全 S 域扫描 0..100（缺省 profile 纯分数阶梯）。
let defaultScanOk = true;
for (let s = 0; s <= 100; s++) {
  const j = evaluateLevelPolicy(s);
  const expectTier = s >= 85 ? 'principal' : s >= 75 ? 'staff' : s >= 65 ? 'senior' : s >= 50 ? 'mid' : 'junior';
  if (j.tier !== expectTier || j.status === 'unavailable' || j.status === 'capped_by_evidence') defaultScanOk = false;
  if (s < 30 && (!j.reasonCodes.includes('below_l1_reference') || j.tier !== 'junior')) defaultScanOk = false;  // S<30 附信息码且仍得 L1
  if (s >= 30 && j.reasonCodes.includes('below_l1_reference')) defaultScanOk = false;
  if (s >= 85 && (j.status !== 'review_required' || !j.reasonCodes.includes('top_tier_manual'))) defaultScanOk = false;  // L5 强制复核
  if (s < 85 && j.status !== 'auto_final') defaultScanOk = false;
}
A('rev2(a) 缺省 profile 全域扫描：纯分数阶梯·零 unavailable·零 capped_by_evidence·L5 强制复核', defaultScanOk);
A('rev2(a) 回归锚零翻自证：0→junior / 60→mid（scoring-honesty.proof.ts:102-105 同断言）',
  evaluateLevelPolicy(0).tier === 'junior' && evaluateLevelPolicy(60).tier === 'mid');
A('rev2(a) deriveCareerPath 缺省通路零 unavailable 化：0→junior / 60→mid',
  deriveCareerPath(0, ['限流']).level === 'junior' && deriveCareerPath(60, []).level === 'mid');
A('active 指针恒 v1（本刀不翻·H1 §4.3）', LEVEL_SCHEME_ACTIVE_VERSION === 'v1');
A('缺省路径 below_l1_reference 仅信息码非下限：S=29 仍得 L1 非 unavailable',
  (() => { const j = evaluateLevelPolicy(29); return j.tier === 'junior' && j.status === 'auto_final' && j.reasonCodes.includes('below_l1_reference'); })());

// ── 2·推论 3 反证判据（硬断言）：S 低 + 卡数/覆盖充分 → 永不 unavailable。
A('推论3 低分+充分证据 → L1 非 unavailable（不把答得差伪装成无数据）',
  (() => { const j = evaluateLevelPolicy(5, sufficient()); return j.tier === 'junior' && j.status === 'auto_final'; })());
A('推论3 S 低+充分证据附 below_l1_reference 且仍得 L1',
  (() => { const j = evaluateLevelPolicy(10, sufficient()); return j.tier === 'junior' && j.reasonCodes.includes('below_l1_reference'); })());

// ── 3·推论 1 穷举：unavailable 仅 insufficient_cards ∪ insufficient_coverage。
const cardsFloor = LEVEL_SCHEME_V2.minCards.junior;    // 3
const coverageFloor = LEVEL_SCHEME_V2.minCoverage.junior;  // 2
A('推论1 卡数不足 L1 门 → unavailable·insufficient_cards',
  (() => { const j = evaluateLevelPolicy(90, sufficient({ cards: cardsFloor - 1 })); return j.tier === null && j.status === 'unavailable' && j.reasonCodes.includes('insufficient_cards'); })());
A('推论1 覆盖不足 L1 门 → unavailable·insufficient_coverage',
  (() => { const j = evaluateLevelPolicy(90, sufficient({ coverage: coverageFloor - 1 })); return j.tier === null && j.status === 'unavailable' && j.reasonCodes.includes('insufficient_coverage'); })());
A('推论1 卡数/覆盖双不足 → 双理由码并集',
  (() => { const j = evaluateLevelPolicy(90, sufficient({ cards: 0, coverage: 0 })); return j.status === 'unavailable' && j.reasonCodes.includes('insufficient_cards') && j.reasonCodes.includes('insufficient_coverage'); })());
A('推论1 穷举面：L1 门恰过（cards=3·coverage=2）即非 unavailable（分数路径零 unavailable）',
  (() => { const j = evaluateLevelPolicy(0, sufficient({ cards: cardsFloor, coverage: coverageFloor })); return j.status !== 'unavailable' && j.tier === 'junior'; })());

// 推论 3 硬断言（穷举扫描）：任何 unavailable 判定必满足「卡<3 ∪ 覆盖<2」。
let exhaustiveOk = true;
for (const cards of [0, 1, 2, 3, 4, 5, 6, 8, 10, 12]) {
  for (const coverage of [0, 1, 2, 3, 4, 5, 6]) {
    for (const overall of [0, 29, 50, 64, 74, 84, 100]) {
      const j = evaluateLevelPolicy(overall, sufficient({ cards, coverage }));
      if (j.status === 'unavailable' && !(cards < cardsFloor || coverage < coverageFloor)) exhaustiveOk = false;
      if (j.status !== 'unavailable' && (cards < cardsFloor || coverage < coverageFloor)) exhaustiveOk = false;  // 反向：门不足必 unavailable
    }
  }
}
A('推论3 穷举扫描（卡×覆盖×S 网格）：unavailable ⇔ 卡<3 ∪ 覆盖<2（双向硬断言）', exhaustiveOk);

// ── 4·推论 2 只封顶不判低：未测（n_d=0）→ capped_by_evidence·非 unavailable·非否定。
A('推论2 未测 d≥3（n_d=0）→ capped_by_evidence·insufficient_hard_evidence·非 unavailable',
  (() => {
    const j = evaluateLevelPolicy(60, sufficient({ cards: 5, coverage: 3, cardsDge3: 0 }));
    return j.tier === 'junior' && j.status === 'capped_by_evidence' && j.reasonCodes.includes('insufficient_hard_evidence');
  })());
A('推论2 测了没过（P_d 低）→ hard_question_underperform 否定证据·降档非 capped 非 unavailable',
  (() => {
    const j = evaluateLevelPolicy(60, sufficient({ cards: 5, coverage: 3, cardsDge3: 3, pDge3: 0.2 }));
    return j.tier === 'junior' && j.status === 'auto_final' && j.reasonCodes.includes('hard_question_underperform');
  })());
A('推论2 区分度：同分数同卡数，n_d=0 与 P_d 低走不同理由码（未测≠没过）',
  (() => {
    const untested = evaluateLevelPolicy(60, sufficient({ cards: 5, coverage: 3, cardsDge3: 0 }));
    const failed = evaluateLevelPolicy(60, sufficient({ cards: 5, coverage: 3, cardsDge3: 3, pDge3: 0.2 }));
    return untested.reasonCodes.includes('insufficient_hard_evidence') && !untested.reasonCodes.includes('hard_question_underperform')
      && failed.reasonCodes.includes('hard_question_underperform') && !failed.reasonCodes.includes('insufficient_hard_evidence');
  })());
A('推论2 高分+缺 d=5 证据 → L5 封顶不判低（principal/staff 硬证据未测→降档 senior capped）',
  (() => {
    const j = evaluateLevelPolicy(90, sufficient({ cardsEq5: 0 }));
    return j.tier === 'senior' && j.status === 'capped_by_evidence' && j.reasonCodes.includes('insufficient_hard_evidence');
  })());
A('推论2 L4 kind=scenario 门未就绪（scenarioPassed=undefined）→ L4 只封顶至 senior·非 unavailable',
  (() => {
    const j = evaluateLevelPolicy(80, sufficient());
    return j.tier === 'senior' && j.status === 'capped_by_evidence' && j.reasonCodes.includes('insufficient_hard_evidence');
  })());
A('L5 全证据达标（显式 profile）→ review_required·top_tier_manual（强制复核·不自动终判）',
  (() => {
    const j = evaluateLevelPolicy(90, { ...sufficient(), scenarioPassed: true });
    return j.tier === 'principal' && j.status === 'review_required' && j.reasonCodes.includes('top_tier_manual');
  })());

// ── 5·卡数/覆盖降档面（§2.3 守卫行·非 unavailable 非 capped）。
A('卡数足 L1 不足 L2（cards=4）→ 降档至 junior·insufficient_cards 记因·非 unavailable',
  (() => {
    const j = evaluateLevelPolicy(60, sufficient({ cards: 4, coverage: 3 }));
    return j.tier === 'junior' && j.status === 'auto_final' && j.reasonCodes.includes('insufficient_cards');
  })());
A('覆盖足 L1 不足 L2（coverage=2）→ 降档·insufficient_coverage 记因',
  (() => {
    const j = evaluateLevelPolicy(60, sufficient({ cards: 5, coverage: 2 }));
    return j.tier === 'junior' && j.status === 'auto_final' && j.reasonCodes.includes('insufficient_coverage');
  })());
A('充分证据+高分 → 按阶梯到顶前的最高可达档（S=70·全证→senior·L4 scenario 门未就绪封顶）',
  (() => { const j = evaluateLevelPolicy(70, sufficient()); return j.tier === 'senior'; })());

// ── 6·输入校验与 v1 通路零触。
A('非法 overall → insufficient_evidence（:11 通路零触·409 信封承接面）',
  throws(() => evaluateLevelPolicy(-1), 'insufficient_evidence')
  && throws(() => evaluateLevelPolicy(101), 'insufficient_evidence')
  && throws(() => evaluateLevelPolicy(60.5), 'insufficient_evidence')
  && throws(() => deriveCareerPath(NaN, []), 'insufficient_evidence'));

// ── 7·单源 rg 门（§4.5·GAP 先例「一处定义，全仓复用禁字面量散布」静态断言形）。
//    白名单=contracts 定义区（含「占位·待校准」注记行·可见性自证）+ 0160 seed；
//    operative 面（career.ts/page.tsx）五档阶梯字面量零命中；测试面期望值断言沿
//    scoring-honesty:60 字面先例（非 operative 定义）。
import { readFileSync } from 'node:fs';
const here = new URL('.', import.meta.url).pathname;
const read = (rel: string) => readFileSync(here + rel, 'utf8');
// 门形=阶梯比较字面量（>= 85 等）·裸值白名单进不了 operative 面（Tailwind /50 等非阈值语义不误伤）。
const tierLiterals = /(>=|<=|<|>)\s*(85|75|65|50)\b/;
// 注记行白名单（沿 GAP 先例：assessment.ts:12 注记自带 60 字面·门只查 operative 代码行）。
const stripComments = (src: string) => src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
const careerSrc = stripComments(read('../src/career.ts'));
A('rg 门·career.ts operative 行五档阶梯字面量零命中（数值读镜像禁字面量·注记白名单沿 GAP）', !tierLiterals.test(careerSrc));
const pageSrc = stripComments(read('../../../apps/web/app/report/[id]/page.tsx'));
A('rg 门·report page operative 行五档阶梯字面量零命中（标签读 LEVEL_LABELS 单源）', !tierLiterals.test(pageSrc) && !/LEVEL_LABEL: Record<string, string> = \{/.test(pageSrc));
const contractsSrc = read('../../contracts/src/index.ts');
A('rg 门·contracts 定义区为白名单命中面（LEVEL_SCHEME_V2 在卷）', /export const LEVEL_SCHEME_V2 = \{/.test(contractsSrc));
A('rg 门·「占位·待校准」注记行在白名单命中集内（可见性自证·nit5）', contractsSrc.includes('占位·待校准'));
const seedSrc = read('../../db/migrations/0160_level_policy_version.sql');
const bareTiers = /\b(85|75|65|50)\b/;   // 白名单面查裸值在卷（seed 为数值定义·非比较形）
A('rg 门·0160 seed 为白名单命中面（16 字段数值在卷）', seedSrc.includes("'calibrating'") && bareTiers.test(seedSrc));
A('rg 门·LEVEL_SCHEME_ACTIVE_VERSION 恒 v1 不翻（本刀禁翻转）', /export const LEVEL_SCHEME_ACTIVE_VERSION = 'v1' as const;/.test(contractsSrc));

console.log(`\n${fail === 0 ? `✓ level-policy 政策纯函数 prove 全部通过（${assertions} 断言）` : `✗ ${fail} 失败（/${assertions}）`}`);
if (fail > 0) process.exitCode = 1;
