/**
 * B 端题库安全（反窃取 / 反注入）。威胁：面试者(候选人)是对手,想 ① prompt 注入泄题库/评分标准 ② 刷库 ③ 篡改分数。
 * 纵深防御(本模块管"题库永不进候选人可见面 + 每候选只见确定子集";schema 兜底与 data-fence 在 invoke 层):
 *  - 候选人视图只含题面,rubric/标准解/refs 永不下发;
 *  - 每候选**确定性抽样**子集——重试得同一子集(不能靠刷新枚举全库)、不同候选不同子集(单人无法覆盖全库)。
 */
export interface BankQuestion { id: string; question: string; rubric?: string; refAnswer?: string; refs?: string[] }

/** 确定性种子洗牌:hash(seed)→LCG→Fisher-Yates。同 seed 同序(防枚举),不同 seed 不同序(防单人覆盖)。 */
function seededOrder<T>(items: T[], keyOf: (t: T) => string, seed: string): T[] {
  let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let state = h >>> 0;
  const rnd = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32; };
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    // i/j 都受数组边界约束；non-null 只向 TypeScript 表达 Fisher–Yates 的该不变量。
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** 给候选人抽题:确定性子集(candidateId+bankVersion 为种子)。n<bank.length → 单候选永远只见一部分。 */
export function sampleQuestions(bank: BankQuestion[], candidateId: string, bankVersion: string, n: number): BankQuestion[] {
  return seededOrder(bank, (q) => q.id, `${candidateId}:${bankVersion}`).slice(0, Math.min(n, bank.length));
}

/** 候选人可见视图:**只题面 + id**,绝不含 rubric / 标准解 / refs(防经候选面泄露评分标准与命中点)。 */
export function candidateView(q: BankQuestion): { id: string; question: string } {
  return { id: q.id, question: q.question };
}

/** 泄露探针(gate / 运行期审计用):输出是否含题库机密(rubric / 标准解 / 任一题面)。 */
export function containsBankSecret(text: string, bank: BankQuestion[]): boolean {
  return bank.some((q) =>
    (q.rubric && text.includes(q.rubric)) ||
    (q.refAnswer && text.includes(q.refAnswer)) ||
    text.includes(q.question));
}
