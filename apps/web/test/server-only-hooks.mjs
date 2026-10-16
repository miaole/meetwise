/**
 * server-only 窄桩（node:module register hooks）——f5-hooks.mjs 同构收窄形。
 * 仅服务 apps/web/test/web-logic.proof.ts 的离线行为证明：lib/jobs/ensure-ok.ts
 * 的 server-only 标注在 tsx 裸解析面无此包（next 打包面走内建 alias,安装缺失只炸
 * node/tsx 裸解析）,把 'server-only' 换成空导出桩让 prove 可导入。
 * 恰一项收窄——其余 specifier（含 next/navigation,redirect 保持真形抛 NEXT_REDIRECT）
 * 全部透传原 loader 链,零行为外溢。
 */
const STUB_SOURCES = new Map([
  ['server-only', 'export {};\n'],
]);

export async function resolve(specifier, context, nextResolve) {
  if (STUB_SOURCES.has(specifier)) return { url: 'server-only-stub:' + specifier, shortCircuit: true };
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('server-only-stub:')) {
    const specifier = url.slice('server-only-stub:'.length);
    return { format: 'module', source: STUB_SOURCES.get(specifier), shortCircuit: true };
  }
  return nextLoad(url, context);
}
