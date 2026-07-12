/**
 * 成长档案/能力曲线（纯逻辑,无 IO）：历次评估报告 → 按时间排序的成长点 + 维度集合 + 汇总(场次/最佳/最新/趋势)。
 * 读侧聚合,零副作用。真数据来源 = assessment_report（每场面试一行:overall + 维度分 + 时间戳）。
 * 隐私:只产出分数/维度标签/时间戳,绝不含简历原文或作答原文（维度标签来自 AI 生成的题面摘要,与 owner 自己的评估端点同源)。
 * 趋势仅由最新两场 overall 决定（up/down/flat），不足两场=none（0/1 场的边界不臆造方向）。
 */
export interface GrowthDim { dimension: string; score: number }
export interface GrowthRow {
  interviewId: string;
  overall: number | null;
  dimensions: GrowthDim[];
  at: string; // ISO 时间戳
}
export interface GrowthPoint {
  at: string;
  interviewId: string;
  overall: number | null;
  dims: Record<string, number>;
}
export type GrowthTrend = 'up' | 'down' | 'flat' | 'none';
export interface GrowthView {
  points: GrowthPoint[];
  dimensions: string[];
  totals: {
    sessions: number;
    answered: number;
    bestScore: number | null;
    latestScore: number | null;
    trend: GrowthTrend;
  };
}

const clampScore = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** 把一行 assessment_report 原始记录映射成 GrowthRow(单一映射真相:service 与 proof 都用它,杜绝两份手抄漂移)。 */
export function toGrowthRow(raw: { interview_id: string; overall: number | null; dimensions: unknown; created_at: Date | string }): GrowthRow {
  return {
    interviewId: raw.interview_id,
    overall: raw.overall ?? null,
    dimensions: Array.isArray(raw.dimensions)
      ? raw.dimensions.map((d: any) => ({ dimension: String(d?.dimension ?? ''), score: Number(d?.score) }))
      : [],
    at: raw.created_at instanceof Date ? raw.created_at.toISOString() : String(raw.created_at),
  };
}

/** rows 可乱序传入;此处按 (时间→interviewId) 稳定升序，保证曲线左老右新且确定性。answered=已评估答题数(由调用方查)。 */
export function deriveGrowth(rows: GrowthRow[], answered = 0): GrowthView {
  const sorted = [...rows].sort((a, b) =>
    a.at < b.at ? -1 : a.at > b.at ? 1 : a.interviewId < b.interviewId ? -1 : a.interviewId > b.interviewId ? 1 : 0,
  );

  const dimSet = new Set<string>();
  const points: GrowthPoint[] = sorted.map((r) => {
    const dims: Record<string, number> = {};
    for (const d of r.dimensions ?? []) {
      if (d && typeof d.dimension === 'string' && d.dimension.trim() !== '' && Number.isFinite(d.score)) {
        dims[d.dimension] = clampScore(d.score);
        dimSet.add(d.dimension);
      }
    }
    return {
      at: r.at,
      interviewId: r.interviewId,
      overall: r.overall == null || !Number.isFinite(r.overall) ? null : clampScore(r.overall),
      dims,
    };
  });

  // bestScore = 历来已评分场次的最高分(空则 null)。
  const scored = points.map((p) => p.overall).filter((x): x is number => x != null);
  const bestScore = scored.length ? Math.max(...scored) : null;
  // **诚实语义(修审计 #4)**:latestScore/trend 锚定"最新一场"(而非"最新已评分场")。
  //   若最新一场未评分(ready 但 overall=null,schema 合法),latestScore=null、trend=none——
  //   绝不把更早的旧分冒充"最新",也不画一条无视最新场的趋势。
  const latestScore = points.length ? points[points.length - 1].overall : null;
  let trend: GrowthTrend = 'none';
  if (points.length >= 2) {
    const prev = points[points.length - 2].overall;
    const last = points[points.length - 1].overall;
    if (prev != null && last != null) trend = last > prev ? 'up' : last < prev ? 'down' : 'flat';
  }

  return {
    points,
    dimensions: [...dimSet].sort(),
    totals: { sessions: points.length, answered: Math.max(0, Math.round(answered)), bestScore, latestScore, trend },
  };
}
