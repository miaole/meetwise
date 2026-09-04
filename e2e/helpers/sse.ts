import { BASE } from './http.ts';

export type SseEvent = { seq: number; kind: string; payload: any };

export function parseSseBuffer(buf: string): SseEvent[] {
  const out: SseEvent[] = [];
  for (const match of buf.matchAll(/^id: (\d+)\nevent: (\w+)\ndata: (.*)$/gm)) {
    out.push({
      seq: Number(match[1]),
      kind: match[2],
      payload: (() => {
        try { return JSON.parse(match[3]); } catch { return {}; }
      })(),
    });
  }
  return out;
}

const SCORE_KEYS = new Set(['score', 'overall', 'overallScore', 'totalScore', 'deterministic_total']);
/** Kinds that must never carry a numeric-like score. report_ready.overall is display-only and reviewed separately. */
const FORBIDDEN_SCORE_KINDS = new Set(['progress', 'question_ready', 'clarification_needed', 'waiting_user', 'answer_unscored']);

function isNumericLike(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed !== '' && Number.isFinite(Number(trimmed));
  }
  return false;
}

/**
 * Numeric-like score/overall on a payload, including string "80", aliases, and one nested object.
 * Question text with digits is not a score field.
 */
export function payloadHasNumericScore(payload: any): boolean {
  if (!payload || typeof payload !== 'object') return false;
  for (const [key, value] of Object.entries(payload)) {
    if (SCORE_KEYS.has(key) && isNumericLike(value)) return true;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [innerKey, inner] of Object.entries(value as Record<string, unknown>)) {
        if (SCORE_KEYS.has(innerKey) && isNumericLike(inner)) return true;
      }
    }
  }
  return false;
}

/**
 * Progress / question / waiting / unscored frames must not carry scores.
 * A numeric-like score there is forged — never promote it to practice or B-side evidence.
 */
export function rejectForgedProgressScores(events: Iterable<SseEvent>): void {
  for (const event of events) {
    if (!FORBIDDEN_SCORE_KINDS.has(event.kind) || !payloadHasNumericScore(event.payload)) continue;
    throw new Error(event.kind === 'progress' ? 'e2e_forged_progress_score' : 'e2e_forged_score');
  }
}

/**
 * SSE is hold-and-tail. A short abort is expected; it is not a product failure.
 */
export async function readSseEvents(path: string, token: string, lastSeq: number, timeoutMs = 1200): Promise<SseEvent[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let buf = '';
  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: {
        authorization: `Bearer ${token}`,
        ...(lastSeq ? { 'last-event-id': String(lastSeq) } : {}),
      },
      signal: controller.signal,
    });
    if (response.status === 200 && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
      }
    }
  } catch {
    /* abort = expected hold-and-tail */
  } finally {
    clearTimeout(timer);
  }
  const events = parseSseBuffer(buf);
  rejectForgedProgressScores(events);
  return events;
}

export async function pollTerminal(path: string, token: string, terminals: string[], deadlineMs = 60_000): Promise<string> {
  let seq = 0;
  let term = '';
  const started = Date.now();
  while (Date.now() - started < deadlineMs) {
    const events = await readSseEvents(`${path}/events`, token, seq);
    for (const event of events) {
      seq = Math.max(seq, event.seq);
      if (terminals.includes(event.kind)) term = event.kind;
    }
    if (term) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return term;
}
