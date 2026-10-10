/**
 * FENCE-REFLOW F5 prove 专用模块桩（node:module register hooks）。
 * 仅服务 apps/web/test/interviews-actions.proof.ts 的离线行为证明：把
 * 'server-only' / 'next/headers' / 'next/navigation' 换成最小桩，让真实
 * app/interviews/actions.ts 代码可在 tsx 下执行。redirect 的目标 URL 编码在
 * 抛出错误的 digest 里（NEXT_REDIRECT;replace;<url>;），主线程 proof 从捕获的
 * 错误中解析——无跨线程共享状态。其余 specifier 全部透传原 loader 链。
 */
const STUB_SOURCES = new Map([
  ['server-only', 'export {};\n'],
  ['next/headers', [
    'export async function cookies() {',
    '  return { get(name) { return name === "mw_token" ? { value: "fence-reflow-proof-token" } : undefined; } };',
    '}',
    'export async function headers() { return new Headers(); }',
  ].join('\n')],
  ['next/navigation', [
    'export function redirect(url) {',
    '  const target = String(url);',
    '  throw Object.assign(new Error("NEXT_REDIRECT: " + target), { digest: "NEXT_REDIRECT;replace;" + target + ";307;" });',
    '}',
    'export function permanentRedirect(url) {',
    '  const target = String(url);',
    '  throw Object.assign(new Error("NEXT_REDIRECT: " + target), { digest: "NEXT_REDIRECT;replace;" + target + ";308;" });',
    '}',
    'export function notFound() { throw new Error("NEXT_NOT_FOUND"); }',
    'export var useRouter = () => { throw new Error("useRouter unavailable in offline proof"); };',
  ].join('\n')],
]);

export async function resolve(specifier, context, nextResolve) {
  if (STUB_SOURCES.has(specifier)) return { url: 'fence-reflow-stub:' + specifier, shortCircuit: true };
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('fence-reflow-stub:')) {
    const specifier = url.slice('fence-reflow-stub:'.length);
    return { format: 'module', source: STUB_SOURCES.get(specifier), shortCircuit: true };
  }
  return nextLoad(url, context);
}
