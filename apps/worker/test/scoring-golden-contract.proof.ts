/**
 * 评分金标集的结构/红队覆盖门（不调用模型）。它不把 fixture 当模型质量，
 * 而是防止有人删回 happy-path 小样本、把不完整指代混成正常答案，或误把
 * 暂定相对序写成绝对分校准。
 *
 * pnpm -C apps/worker prove:scoring-golden
 */
import { isNonAnswer, stripScoringManipulation } from '@meetwise/domain';
import {
  CALIBRATION_STATUS, MANIPULATION_INVARIANTS, MONO_GROUPS, OFFTOPIC, PERTURB_GROUPS,
} from './scoring-golden.ts';

let failures = 0;
const A = (name: string, condition: boolean) => { console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`); if (!condition) failures++; };

const expectedPairs = (ranks: number[], minGap = 2) => ranks.flatMap((rank, i) => ranks.slice(i + 1).map((other) => Math.abs(rank - other) >= minGap ? 1 : 0)).reduce<number>((a, b) => a + b, 0);
const hasTag = (tag: string) => OFFTOPIC.some((c) => c.tags.includes(tag));

console.log('\n──── ① 相对序与扰动集：足够覆盖多业务域，且不能退化成两题 demo ────');
A('单调性组≥6（限流/锁/支付/RAG/图恢复/评分）', MONO_GROUPS.length >= 6);
A('每组固定五档，rank=1..5 无重复', MONO_GROUPS.every((g) => g.cases.length === 5 && [...g.cases.map((c) => c.rank)].sort((a, b) => a - b).join(',') === '1,2,3,4,5'));
const monoPairs = MONO_GROUPS.reduce((n, g) => n + expectedPairs(g.cases.map((c) => c.rank)), 0);
A('非相邻档可测成对数≥36，才可能获得 Wilson95%下界≥0.90 的量级证据', monoPairs >= 36);
A('扰动组≥4，且每组≥4 个等义改写', PERTURB_GROUPS.length >= 4 && PERTURB_GROUPS.every((g) => g.variants.length >= 4));
A('扰动跨四个业务域，非单一 Redis 题反复换词', new Set(PERTURB_GROUPS.map((g) => g.id.split('-')[1])).size >= 4);

console.log('\n──── ② 非 happy-path：明确区分确定性短路与必须让真模型判别的输入 ────');
A('红队样本≥18，其中至少10条必须交真模型判 relevant', OFFTOPIC.length >= 18 && OFFTOPIC.filter((c) => c.route === 'model').length >= 10);
A('覆盖不完整指代、错题技术回答、长篇跑题、PII 噪声、角色伪造与中英操纵', ['anaphora', 'question-mismatch', 'topic-switch', 'pii-noise', 'role-forgery', 'prompt-injection'].every(hasTag));
const deterministic = OFFTOPIC.filter((c) => c.route === 'deterministic');
A('所有 deterministic 样本在模型前被 isNonAnswer 或剥离后 isNonAnswer 命中', deterministic.every((c) => {
  const stripped = stripScoringManipulation(c.answer);
  return isNonAnswer(c.answer) || (stripped.detected && isNonAnswer(stripped.clean));
}));
const ambiguous = OFFTOPIC.filter((c) => c.tags.includes('anaphora'));
A('不完整指代明确标为 model relevant=false 测试，而不是默认为有效技术作答', ambiguous.length >= 3 && ambiguous.every((c) => c.route === 'model'));

console.log('\n──── ③ 操纵不变性与校准边界 ────');
A('攻击不变性组≥4，每组至少两种攻击尾巴', MANIPULATION_INVARIANTS.length >= 4 && MANIPULATION_INVARIANTS.every((g) => g.poisonedAnswers.length >= 2));
A('全部攻击尾巴被高精度剥离，且剩余文本逐字等于真实答案', MANIPULATION_INVARIANTS.every((g) => g.poisonedAnswers.every((poisoned) => {
  const stripped = stripScoringManipulation(poisoned);
  return stripped.detected && stripped.clean === g.cleanAnswer;
})));
A('绝对分校准显式未建立：不可把 score 当作录用/能力绝对阈值', CALIBRATION_STATUS.established === false && CALIBRATION_STATUS.required.length >= 5);

console.log(`\n${failures === 0 ? '✓ 评分金标结构与红队覆盖门全部通过（真模型质量仍须跑 scoring:eval）' : `✗ ${failures} 项失败`}`);
process.exit(failures ? 1 : 0);
