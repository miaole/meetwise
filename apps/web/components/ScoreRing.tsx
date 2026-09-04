/**
 * 分数环(设计语言 §4「分数环描画」):主色 SVG 环 + 中心计数。
 * 服务端组件友好。无发光/渐变——克制单色,主色稀缺强调。
 */
export function ScoreRing({ score, size = 120, label = '/100' }: { score: number; size?: number; label?: string }) {
  const finite = Number.isFinite(score);
  const v = finite ? Math.max(0, Math.min(100, Math.round(score))) : null;
  const stroke = Math.max(6, Math.round(size * 0.075));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - (v ?? 0) / 100);
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-primary tabular-nums">{v ?? '—'}</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
