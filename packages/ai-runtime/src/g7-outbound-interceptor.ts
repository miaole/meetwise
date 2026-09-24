/**
 * G7 defense-in-depth: under G7_FREETIER_REPROVE=1, any global fetch / WebSocket
 * outside an explicit allow ticket fails closed. Chat dispatch takes a ticket
 * for the duration of the reserved call. Embed/rerank/ASR/TTS are hard-disabled
 * at their entrypoints; this interceptor catches escapes.
 */
import { isG7FreetierReproveEnabled } from './g7-freetier-reprove-guard.ts';

let installed = false;
let allowDepth = 0;
let originalFetch: typeof globalThis.fetch | undefined;
let OriginalWebSocket: typeof WebSocket | undefined;

export function g7OutboundAllowDepth(): number {
  return allowDepth;
}

export function withG7OutboundAllow<T>(fn: () => Promise<T>): Promise<T> {
  allowDepth += 1;
  return fn().finally(() => {
    allowDepth -= 1;
  });
}

export function installG7OutboundInterceptor(env: NodeJS.ProcessEnv = process.env): void {
  if (!isG7FreetierReproveEnabled(env)) return;
  if (installed) return;
  originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = ((input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    if (allowDepth <= 0) {
      throw new Error(`g7_unguarded_outbound_fetch_blocked:${String(input)}`);
    }
    return originalFetch!(input, init);
  }) as typeof fetch;

  if (typeof WebSocket !== 'undefined') {
    OriginalWebSocket = WebSocket;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).WebSocket = class G7BlockedWebSocket {
      constructor(url: string | URL) {
        if (allowDepth <= 0) {
          throw new Error(`g7_unguarded_outbound_websocket_blocked:${String(url)}`);
        }
        return new OriginalWebSocket!(url);
      }
    };
  }
  installed = true;
}

export function uninstallG7OutboundInterceptor(): void {
  if (!installed) return;
  if (originalFetch) globalThis.fetch = originalFetch;
  if (OriginalWebSocket) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).WebSocket = OriginalWebSocket;
  }
  installed = false;
  allowDepth = 0;
}
