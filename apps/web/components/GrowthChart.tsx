/**
 * 能力曲线(设计语言:克制琥珀 + 纯 SVG,无图表库)。
 * 服务端组件友好(纯渲染,零 client / 零动画 → 天然 reduced-motion 安全)。
 * 主曲线 = 综合分随训练演进(真实纵向数据);若某维度在 ≥2 场都出现,叠加为细线(否则只画综合,绝不臆造单点连线)。
 * 入参 points 已按时间升序;分值缺失(null)的点断线(不插值假数据)。
 */
interface Pt { at: string; interviewId: string; overall: number | null; dims: Record<string, number> }

const W = 720, H = 240, PAD_L = 34, PAD_R = 16, PAD_T = 16, PAD_B = 28;
const MAX_POINTS = 60;     // 720px 宽下 >~60 点像素间距已 <12px,再多只会糊成噪点且 path 体积线性膨胀
// 维度叠加线配色(暖色系,克制):与主色拉开但不喧宾夺主。
const DIM_COLORS = ['#7C6F5B', '#A8763E', '#5F7A6B', '#9C5A4D', '#6E6A8A'];

/** 极端场景(100+ 场)抽样:**只挑真实点的子集**(绝不平均/合成),保留首/尾、全局最高/最低综合分,
 *  以及**所有 null 断点**——后者是硬不变量:`segments()` 靠数组里的 null 断线,丢了 null 会把"报告缺失"的真实断档
 *  伪连成连续曲线(=凭空插值,违反"null 断线不插值")。其余等距抽样到 ~MAX_POINTS 个。
 *  诚实边界:仅保**全局**峰谷,两个采样点之间的**局部**波动可能被平滑(子集抽样固有取舍,非失真式合成)。
 *  x 轴本就按场次索引等距(非时间),抽样后每格代表的场次数不再均匀——它只是减少绘制点数,不引入假数据。 */
function downsample<T extends { overall: number | null }>(pts: T[]): T[] {
  const n = pts.length;
  if (n <= MAX_POINTS) return pts;
  const keep = new Set<number>([0, n - 1]);
  let maxI = 0, minI = 0, maxV = -Infinity, minV = Infinity;
  pts.forEach((p, i) => {
    if (p.overall == null) { keep.add(i); return; }     // null 断点必留,否则断档被伪连
    if (p.overall > maxV) { maxV = p.overall; maxI = i; }
    if (p.overall < minV) { minV = p.overall; minI = i; }
  });
  keep.add(maxI); keep.add(minI);
  const stride = (n - 1) / (MAX_POINTS - 1);
  for (let k = 0; k < MAX_POINTS; k++) keep.add(Math.round(k * stride));
  return Array.from(keep).sort((a, b) => a - b).map((i) => pts[i]);
}

function xAt(i: number, n: number): number {
  if (n <= 1) return PAD_L + (W - PAD_L - PAD_R) / 2;
  return PAD_L + (i * (W - PAD_L - PAD_R)) / (n - 1);
}
const yAt = (v: number): number => PAD_T + (1 - v / 100) * (H - PAD_T - PAD_B);

/** 把一串可能含 null 的值切成连续折线段(null 处断开),每段生成 path d。 */
function segments(values: Array<number | null>, n: number): string[] {
  const segs: string[] = [];
  let cur: string[] = [];
  values.forEach((v, i) => {
    if (v == null) {
      if (cur.length > 1) segs.push(cur.join(' '));
      cur = [];
      return;
    }
    cur.push(`${cur.length ? 'L' : 'M'}${xAt(i, n).toFixed(1)},${yAt(v).toFixed(1)}`);
  });
  if (cur.length > 1) segs.push(cur.join(' '));
  return segs;
}

export function GrowthChart({ points: rawPoints }: { points: Pt[] }) {
  const total = rawPoints.length;
  const points = downsample(rawPoints);     // 100+ 场时抽样到 ≤MAX_POINTS,保持线条可读、SVG path 不膨胀
  const n = points.length;
  const overalls = points.map((p) => p.overall);

  // 综合分面积(只在有 ≥2 个连续真实点时画填充,避免断点处怪异多边形)。
  const overallPts = points.map((p, i) => (p.overall != null ? { i, v: p.overall } : null)).filter(Boolean) as { i: number; v: number }[];
  const areaD =
    overallPts.length >= 2
      ? `M${xAt(overallPts[0].i, n).toFixed(1)},${yAt(0).toFixed(1)} ` +
        overallPts.map((p) => `L${xAt(p.i, n).toFixed(1)},${yAt(p.v).toFixed(1)}`).join(' ') +
        ` L${xAt(overallPts[overallPts.length - 1].i, n).toFixed(1)},${yAt(0).toFixed(1)} Z`
      : '';

  // 维度叠加:仅取在 ≥2 场出现的维度(否则单点无法成"曲线")。**是否成线用全量 rawPoints 判定**,
  // 避免某维度因抽样恰好掉到 <2 而整条线+图例凭空消失(与 ≤60 场时行为不一致);取值仍在抽样点上绘制。
  const dimNames = Array.from(new Set(rawPoints.flatMap((p) => Object.keys(p.dims))));
  const dimSeries = dimNames
    .filter((name) => rawPoints.filter((p) => name in p.dims).length >= 2)
    .map((name) => ({ name, values: points.map((p) => (name in p.dims ? p.dims[name] : null)) }))
    .slice(0, DIM_COLORS.length);

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
        aria-label={`能力曲线:综合分随 ${total} 场面试演进，最新 ${overalls[n - 1] ?? '—'} 分`}>
        {/* 横向网格 + 刻度 */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={PAD_L} y1={yAt(g)} x2={W - PAD_R} y2={yAt(g)} stroke="var(--border)" strokeWidth={1} />
            <text x={PAD_L - 8} y={yAt(g) + 3} textAnchor="end" fontSize={10} fill="var(--muted-foreground)" className="tabular-nums">{g}</text>
          </g>
        ))}

        {/* 综合分面积 + 主线 */}
        {areaD && <path d={areaD} fill="var(--primary)" opacity={0.1} />}
        {segments(overalls, n).map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {points.map((p, i) => p.overall != null && (
          <circle key={p.interviewId} cx={xAt(i, n)} cy={yAt(p.overall)} r={3.5} fill="var(--primary)" stroke="var(--background)" strokeWidth={1.5} />
        ))}

        {/* 维度叠加线(细、低饱和) */}
        {dimSeries.map((s, si) =>
          segments(s.values, n).map((d, i) => (
            <path key={`${si}-${i}`} d={d} fill="none" stroke={DIM_COLORS[si]} strokeWidth={1.25} strokeDasharray="4 3" strokeLinejoin="round" opacity={0.85} />
          )),
        )}
      </svg>

      {/* 图例 */}
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded bg-primary" />综合分</span>
        {dimSeries.map((s, si) => (
          <span key={s.name} className="inline-flex items-center gap-1.5" title={s.name}>
            <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: DIM_COLORS[si] }} />
            <span className="max-w-[12rem] truncate">{s.name}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
