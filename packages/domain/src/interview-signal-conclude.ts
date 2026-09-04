/**
 * @meetwise/domain · SIGNAL-01 收尾理由的 SSE 预览投影（零 IO）。
 *
 * INT-LEVEL-SIGNAL-SSE-01：只把 early_weak / thrashing 收成最小投影，供 worker
 * 写入既有 interview_event / SSE。不是 CompetencyLevelAssessment，不写 band，
 * 不发明分数。其他 ConcludeReason 与缺字段 fail-closed 为 null。
 */

export const SIGNAL_CONCLUDE_CODES = ['early_weak', 'thrashing'] as const;
export type SignalConcludeCode = (typeof SIGNAL_CONCLUDE_CODES)[number];

/** 既有 interview_event.kind；走 GET /interview/:id/events，不是新 HTTP。 */
export const SESSION_CONCLUDED_KIND = 'session_concluded' as const;
/** 同场恰一条。缺此键会在 done 重放时双写。 */
export const SESSION_CONCLUDED_EVENT_KEY = 'session_concluded' as const;

const CITED_CAP = 8;
const CITED_NAME_MAX = 64;
const EMAIL_LIKE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_LIKE = /\+?\d[\d\s()-]{7,}\d/;

export interface SignalConcludeProjection {
  code: SignalConcludeCode;
  turn: number;
  citedCompetencies: string[];
}

export interface SessionConcludedAppend {
  kind: typeof SESSION_CONCLUDED_KIND;
  payload: { concludeReason: SignalConcludeProjection };
  eventKey: typeof SESSION_CONCLUDED_EVENT_KEY;
}

function isSignalCode(value: unknown): value is SignalConcludeCode {
  return value === 'early_weak' || value === 'thrashing';
}

function looksLikeProseOrPii(name: string): boolean {
  if (EMAIL_LIKE.test(name) || PHONE_LIKE.test(name)) return true;
  if (/答了|明文|我用|我在/.test(name)) return true;
  if (/\s/.test(name) && name.length > 16) return true;
  return false;
}

function sanitizeCited(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (looksLikeProseOrPii(trimmed)) continue;
    const name = trimmed.slice(0, CITED_NAME_MAX);
    out.push(name);
    if (out.length >= CITED_CAP) break;
  }
  return out;
}

/**
 * 只读投影。输入可以是 DecisionProvenance 或任意注入对象。
 * 缺合法 code/turn → null。score/overall/band 等额外字段一律丢弃。
 */
export function projectSignalConcludeReason(raw: unknown): SignalConcludeProjection | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const rec = raw as Record<string, unknown>;
  if (!isSignalCode(rec.code)) return null;
  if (typeof rec.turn !== 'number' || !Number.isInteger(rec.turn) || rec.turn < 0) return null;
  return {
    code: rec.code,
    turn: rec.turn,
    citedCompetencies: sanitizeCited(rec.citedCompetencies),
  };
}

/** Worker 记账形状。投影为 null 时不要 append。 */
export function sessionConcludedAppend(raw: unknown): SessionConcludedAppend | null {
  const concludeReason = projectSignalConcludeReason(raw);
  if (!concludeReason) return null;
  return {
    kind: SESSION_CONCLUDED_KIND,
    payload: { concludeReason },
    eventKey: SESSION_CONCLUDED_EVENT_KEY,
  };
}

/** 练习控制流文案。禁止等级/招聘措辞。early_weak 覆盖跳过/未决与持续偏弱，不是分数带。 */
export function signalConcludePracticeCopy(code: SignalConcludeCode): string {
  if (code === 'early_weak') {
    return '练习因持续偏弱或多次未决提前结束（自适应控制流，不是能力等级或招聘结论）';
  }
  return '练习因反复换题空转提前结束（自适应控制流，不是能力等级或招聘结论）';
}
