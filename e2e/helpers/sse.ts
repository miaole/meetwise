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

/** Numeric score / overall on a payload. Progress must never carry these. */
export function payloadHasNumericScore(payload: any): boolean {
  return typeof payload?.score === 'number' || typeof payload?.overall === 'number';
}

/**
 * Progress is UI-only. A numeric score or overall on progress is a forged
 * score — the client must not promote it to practice or B-side evidence.
 */
export function rejectForgedProgressScores(events: Iterable<SseEvent>): void {
  for (const event of events) {
    if (event.kind === 'progress' && payloadHasNumericScore(event.payload)) {
      throw new Error('e2e_forged_progress_score');
    }
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
