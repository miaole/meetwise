/**
 * G7 defense-in-depth: under G7_FREETIER_REPROVE=1, outbound transports outside
 * an explicit allow ticket fail closed. Covers:
 *   - globalThis.fetch / globalThis.WebSocket (mutable globals)
 *   - node:http / node:https request+get via CJS require() surface (ESM
 *     `import * as http` namespaces are frozen in Node 20+; named ESM bindings
 *     like voice.ts `import { request as httpsRequest }` are snapshot at load
 *     and are covered by entrypoint assertG7UnguardedPathDisabled instead)
 *   - optional `ws` package WebSocket constructor when resolvable
 * Chat dispatch takes a ticket for the reserved call; embed/rerank/ASR/TTS are
 * hard-disabled at their entrypoints — this interceptor catches escapes.
 */
import { createRequire } from 'node:module';
import { isG7FreetierReproveEnabled } from './g7-freetier-reprove-guard.ts';

const require = createRequire(import.meta.url);

let installed = false;
let allowDepth = 0;
let originalFetch: typeof globalThis.fetch | undefined;
let OriginalWebSocket: typeof WebSocket | undefined;
let originalHttpRequest: ((...args: any[]) => any) | undefined;
let originalHttpGet: ((...args: any[]) => any) | undefined;
let originalHttpsRequest: ((...args: any[]) => any) | undefined;
let originalHttpsGet: ((...args: any[]) => any) | undefined;
let OriginalWs: unknown;
let wsModule: { WebSocket?: new (...args: unknown[]) => unknown } | undefined;
let httpCjs: { request: (...args: any[]) => any; get: (...args: any[]) => any } | undefined;
let httpsCjs: { request: (...args: any[]) => any; get: (...args: any[]) => any } | undefined;

/** Test/spy counters — reset via resetG7OutboundSpyCounters(). */
export const g7OutboundSpy = {
  fetch: 0,
  websocket: 0,
  httpRequest: 0,
  httpsRequest: 0,
  wsPackage: 0,
};

export function resetG7OutboundSpyCounters(): void {
  g7OutboundSpy.fetch = 0;
  g7OutboundSpy.websocket = 0;
  g7OutboundSpy.httpRequest = 0;
  g7OutboundSpy.httpsRequest = 0;
  g7OutboundSpy.wsPackage = 0;
}

export function g7OutboundAllowDepth(): number {
  return allowDepth;
}

export function withG7OutboundAllow<T>(fn: () => Promise<T>): Promise<T> {
  allowDepth += 1;
  return fn().finally(() => {
    allowDepth -= 1;
  });
}

function blockOrPass(kind: keyof typeof g7OutboundSpy, label: string, detail = ''): void {
  g7OutboundSpy[kind] += 1;
  if (allowDepth <= 0) {
    const suffix = detail ? `:${detail}` : '';
    throw new Error(`g7_unguarded_outbound_${label}_blocked${suffix}`);
  }
}

function wrapNodeRequest(
  kind: 'httpRequest' | 'httpsRequest',
  label: string,
  original: (...args: any[]) => any,
): (...args: any[]) => any {
  return function patched(this: unknown, ...args: any[]) {
    blockOrPass(kind, label);
    return original.apply(this, args);
  };
}

export function installG7OutboundInterceptor(env: NodeJS.ProcessEnv = process.env): void {
  if (!isG7FreetierReproveEnabled(env)) return;
  if (installed) return;

  originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = ((input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : String((input as Request).url ?? input);
    blockOrPass('fetch', 'fetch', url);
    return originalFetch!(input, init);
  }) as typeof fetch;

  if (typeof WebSocket !== 'undefined') {
    OriginalWebSocket = WebSocket;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).WebSocket = class G7BlockedWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        blockOrPass('websocket', 'websocket');
        return new OriginalWebSocket!(url, protocols as never);
      }
    };
  }

  // Patch CJS surfaces (writable). ESM Module namespaces are frozen.
  httpCjs = require('http') as typeof httpCjs & object;
  httpsCjs = require('https') as typeof httpsCjs & object;
  originalHttpRequest = httpCjs!.request;
  originalHttpGet = httpCjs!.get;
  originalHttpsRequest = httpsCjs!.request;
  originalHttpsGet = httpsCjs!.get;
  httpCjs!.request = wrapNodeRequest('httpRequest', 'http_request', originalHttpRequest);
  httpCjs!.get = wrapNodeRequest('httpRequest', 'http_get', originalHttpGet);
  httpsCjs!.request = wrapNodeRequest('httpsRequest', 'https_request', originalHttpsRequest);
  httpsCjs!.get = wrapNodeRequest('httpsRequest', 'https_get', originalHttpsGet);

  try {
    const mod = require('ws') as { WebSocket?: new (...args: unknown[]) => unknown };
    if (mod?.WebSocket) {
      wsModule = mod;
      OriginalWs = mod.WebSocket;
      const Orig = OriginalWs as new (...a: unknown[]) => unknown;
      // Function constructor (not class) so we can return a foreign instance without TS2409.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mod as any).WebSocket = function G7BlockedWs(this: unknown, ...args: unknown[]) {
        blockOrPass('wsPackage', 'ws_package');
        return new Orig(...args);
      };
    }
  } catch {
    // `ws` not installed — static inventory + paths prove cover this.
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
  if (httpCjs && originalHttpRequest) httpCjs.request = originalHttpRequest;
  if (httpCjs && originalHttpGet) httpCjs.get = originalHttpGet;
  if (httpsCjs && originalHttpsRequest) httpsCjs.request = originalHttpsRequest;
  if (httpsCjs && originalHttpsGet) httpsCjs.get = originalHttpsGet;
  if (wsModule && OriginalWs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wsModule as any).WebSocket = OriginalWs;
  }
  installed = false;
  allowDepth = 0;
}

/** True after a successful install under G7 (for entrypoint proves). */
export function isG7OutboundInterceptorInstalled(): boolean {
  return installed;
}
