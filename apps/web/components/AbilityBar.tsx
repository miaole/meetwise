/**
 * 能力条(设计语言 §3):细条 + 主色填充 + 标签/数值。
 * 服务端组件友好(纯渲染,无 client)。gap/弱项维度用 `em` 让数值落主色稀缺强调。
 */
export function AbilityBar({ label, value, em = false }: { label: string; value: number; em?: boolean }) {
  const v = Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="w-28 shrink-0 truncate text-foreground" title={label}>{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
      </span>
      <span className={`w-8 shrink-0 text-right tabular-nums ${em ? 'font-semibold text-primary' : ''}`}>{v}</span>
    </div>
  );
}
