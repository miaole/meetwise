/**
 * 由 owner-scoped、已清洗的结构化字段生成面向用户的简历名称。
 * 不读取原始简历或内部 id；清洗只覆盖已支持的直接标识符，不宣称消除全部 PII。
 */
export type ResumeDisplaySource = {
  created_at?: string | Date | null;
  experience_hint?: unknown;
  skill_hint?: unknown;
  content_sha?: unknown;
};

function compactHint(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact) return null;
  return compact.length > 28 ? `${compact.slice(0, 28)}…` : compact;
}

function chineseDate(value: ResumeDisplaySource['created_at']): string {
  if (value === null || value === undefined || value === '') return '上传时间待同步';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '上传记录';
  const beijing = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return `${beijing.getUTCFullYear()}年${String(beijing.getUTCMonth() + 1).padStart(2, '0')}月${String(beijing.getUTCDate()).padStart(2, '0')}日 ${String(beijing.getUTCHours()).padStart(2, '0')}:${String(beijing.getUTCMinutes()).padStart(2, '0')}`;
}

function chineseVersion(value: unknown): string | null {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{6,}$/.test(value)) return null;
  let number = 0;
  for (const char of value) number = (number * 33 + char.charCodeAt(0)) % 1_000_000;
  return `版本${String(number).padStart(6, '0')}`;
}

export function resumeDisplayName(source: ResumeDisplaySource): string {
  const hint = compactHint(source.experience_hint) ?? compactHint(source.skill_hint);
  const parts = ['简历', hint, chineseDate(source.created_at), chineseVersion(source.content_sha)].filter(Boolean);
  return parts.join(' · ').slice(0, 80);
}
