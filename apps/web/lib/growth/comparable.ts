/**
 * H4 R8（#269 成长曲线可比性 · 标注形·纯函数单源）。
 *
 * 修法原文「按岗位/能力集合分组或标注不可比」最小形=标注：相邻两场 overall 直连 delta 只在
 * **可比**时呈现——可比=两场均有分且**维度名交集非空**（能力集合有公共口径）。不可比 → delta 不渲染,
 * 改渲染「维度口径不同 · 不可比」中性标注（分组面留后刀）。新-#277（跨场维度曲线维度名交集小）按
 * LEDGER :107 处置=验收注记落 prove 卷（本函数即其实现面锚）。
 */
export interface GrowthPointLike { overall: number | null; dims: Record<string, number> }

/** 两场是否可比：均有 overall 分 ∧ 维度名交集非空（确定性·零外呼·零模型）。 */
export function growthDeltaComparable(prev: GrowthPointLike, curr: GrowthPointLike): boolean {
  if (prev?.overall == null || curr?.overall == null) return false;
  const prevDims = prev.dims ?? {};
  for (const k of Object.keys(curr.dims ?? {})) {
    if (Object.prototype.hasOwnProperty.call(prevDims, k)) return true;
  }
  return false;
}

export type GrowthDeltaView = { comparable: true; delta: number } | { comparable: false; delta: null };

/** 时间线相邻场 delta 视图：可比 → 数值 delta；不可比/缺分 → comparable=false（页面渲染中性标注或不渲染）。 */
export function growthDeltaView(prev: GrowthPointLike, curr: GrowthPointLike): GrowthDeltaView {
  if (!growthDeltaComparable(prev, curr)) return { comparable: false, delta: null };
  return { comparable: true, delta: (curr.overall as number) - (prev.overall as number) };
}
