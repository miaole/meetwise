/**
 * Shared fail-closed checks for DashScope-native JSON bodies.
 * A 200 with missing/empty/non-finite payload is malformed, not an empty success.
 */
export function requireRecord(value: unknown, code: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

export function requireNonEmptyText(value: unknown, code: string): string {
  if (typeof value !== 'string') throw new Error(code);
  const text = value.trim();
  if (text.length < 1 || text.length > 32_000) throw new Error(code);
  return text;
}

export function requireFiniteVector(value: unknown, dim: number, code: string): number[] {
  if (!Array.isArray(value) || value.length !== dim) throw new Error(code);
  const out: number[] = [];
  for (const item of value) {
    if (typeof item !== 'number' || !Number.isFinite(item)) throw new Error(code);
    out.push(item);
  }
  return out;
}

export function requireHttpsUrl(value: unknown, code: string): string {
  if (typeof value !== 'string' || value.length < 12 || value.length > 2_048) throw new Error(code);
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new Error(code); }
  if (parsed.protocol !== 'https:') throw new Error(code);
  if (parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error(code);
  return parsed.toString();
}
