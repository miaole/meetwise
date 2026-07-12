/**
 * @meetwise/ai-runtime · 评分官质量 eval 的**纯统计度量原语**(零 IO、确定性、可 per-push 证明)。
 * 与 retrieval.ts 的度量同处一层;由 eval-metrics.proof.ts(scoring-eval:prove)对退化用例强制证明——
 * **这是整套评分 eval 里唯一不可 game 的硬门**:证明的是"stddev/Spearman/ICC 的算术对",对真评分官质量零信息(真模型质量归 nightly 信号)。
 *
 * 设计要点(经 3 份专家审计定稿):
 *  - stddev 用**样本方差(n-1, Bessel)**;n<2 无定义 → NaN(调用方按 inconclusive 处理,不喂门)。
 *  - Spearman/Kendall **tie-corrected**:评分官对 poor/nonanswer 常规整为同分(score=0),并列必然发生,简化式会算错。
 *  - 逆序对**排除相等分**(tie 不算逆序,否则 poor=nonanswer=0 被冤判炸门)。
 *  - **ICC(1,1)** 作一致性头号指标:同时刻画"组内重跑噪声(该低)"与"跨档区分度(该高)"——
 *    纯 stddev 测不出区分度(恒给 50±2 的退化评分官 stddev 完美却毫无用处),ICC 能。
 */

/** 算术均值。空数组 → NaN。 */
export function mean(xs: number[]): number {
  if (xs.length === 0) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** 样本标准差(n-1, Bessel 修正)。n<2 → NaN(方差在单样本上无定义,别当 0 喂门)。 */
export function sampleStddev(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

/** 中位数(线性插值)。空 → NaN。 */
export function median(xs: number[]): number {
  return percentile(xs, 50);
}

/** 百分位 p∈[0,100](线性插值,与 numpy 默认一致)。空 → NaN。 */
export function percentile(xs: number[], p: number): number {
  if (xs.length === 0) return NaN;
  if (xs.length === 1) return xs[0];
  const s = [...xs].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return s[lo];
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

/** 中位绝对偏差(MAD,抗 outlier 的离散度)。n<1 → NaN。 */
export function mad(xs: number[]): number {
  if (xs.length === 0) return NaN;
  const m = median(xs);
  return median(xs.map((x) => Math.abs(x - m)));
}

/** 分数秩(fractional/average rank,并列取平均秩)。返回与输入同序的秩数组(秩从 1 起)。 */
export function fractionalRanks(xs: number[]): number[] {
  const idx = xs.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const ranks = new Array(xs.length).fill(0);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;   // 找并列区间 [i,j]
    const avg = (i + j) / 2 + 1;                                     // 平均秩(1-based)
    for (let k = i; k <= j; k++) ranks[idx[k][1]] = avg;
    i = j + 1;
  }
  return ranks;
}

/** Pearson 相关(供 tie-corrected Spearman 复用)。任一方零方差 → NaN(常量与任何序列无相关)。 */
export function pearson(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return NaN;
  const ma = mean(a), mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; num += x * y; da += x * x; db += y * y; }
  if (da === 0 || db === 0) return NaN;
  return num / Math.sqrt(da * db);
}

/** **tie-corrected Spearman** = 对分数秩做 Pearson(有并列时正确,简化式 1-6Σd²/… 仅无并列成立)。 */
export function spearman(a: number[], b: number[]): number {
  return pearson(fractionalRanks(a), fractionalRanks(b));
}

/** **Kendall τ-b**(tie-corrected)。分子=一致对-不一致对;分母含 tie 修正。全并列 → NaN。 */
export function kendallTauB(a: number[], b: number[]): number {
  const n = a.length;
  if (n !== b.length || n < 2) return NaN;
  let concordant = 0, discordant = 0, tieA = 0, tieB = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const da = Math.sign(a[i] - a[j]), db = Math.sign(b[i] - b[j]);
    if (da === 0 && db === 0) { continue; }        // 双并列:两侧都不计(标准 τ-b)
    if (da === 0) { tieA++; continue; }
    if (db === 0) { tieB++; continue; }
    if (da === db) concordant++; else discordant++;
  }
  // τ-b 分母 = sqrt((nc+nd+tieA_only)(nc+nd+tieB_only));tieA=仅a并列, tieB=仅b并列(双并列上面已 continue 不计)。
  const denom = Math.sqrt((concordant + discordant + tieA) * (concordant + discordant + tieB));
  if (denom === 0) return NaN;
  return (concordant - discordant) / denom;
}

/**
 * **成对序正确率(单调性主指标,只对"档差≥minGap"的对断言)**。
 * groups: 每组 = 同一 base 题下的多档 [{rank, score}];**只在组内比较**(跨题不公平),相等分记为 tie(不计入分母)。
 * 返回 { accuracy, comparable, ties, inversions }。comparable=0 → accuracy NaN。
 */
export function pairwiseOrderAccuracy(
  groups: { rank: number; score: number }[][],
  minGap = 1,
): { accuracy: number; comparable: number; ties: number; inversions: number } {
  let correct = 0, comparable = 0, ties = 0, inversions = 0;
  for (const g of groups) {
    for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
      if (Math.abs(g[i].rank - g[j].rank) < minGap) continue;      // 只断言足够分开的档(相邻档人也难分)
      if (g[i].score === g[j].score) { ties++; continue; }         // 相等分=tie,排除出分母(不冤判逆序)
      comparable++;
      const rankHigher = g[i].rank > g[j].rank ? i : j;            // rank 大 = 质量高,应得分更高
      const scoreHigher = g[i].score > g[j].score ? i : j;
      if (rankHigher === scoreHigher) correct++; else inversions++;
    }
  }
  return { accuracy: comparable === 0 ? NaN : correct / comparable, comparable, ties, inversions };
}

/**
 * **ICC(1,1) 单向随机效应**(一致性头号指标)。items: 每 item 一档质量,内含 k 次评分(必须**平衡**,等 k)。
 *  ICC=(MSB-MSW)/(MSB+(k-1)MSW)。高 ⟺ 组内重跑噪声低 **且** 跨档区分度高。
 *  不平衡(k 不等)或 item<2/k<2 → NaN(调用方按 inconclusive 处理,别喂门)。
 */
export function icc1(items: number[][]): number {
  const n = items.length;
  if (n < 2) return NaN;
  const k = items[0].length;
  if (k < 2 || items.some((it) => it.length !== k)) return NaN;    // 需平衡 + 每档≥2 次
  const all = items.flat();
  const grand = mean(all);
  const itemMeans = items.map(mean);
  const msb = (k * itemMeans.reduce((a, m) => a + (m - grand) ** 2, 0)) / (n - 1);
  const msw = items.reduce((a, it, i) => a + it.reduce((s, x) => s + (x - itemMeans[i]) ** 2, 0), 0) / (n * (k - 1));
  const denom = msb + (k - 1) * msw;
  if (denom === 0) return NaN;                                      // 全同值 → 无区分度也无噪声,ICC 无定义
  return (msb - msw) / denom;
}
