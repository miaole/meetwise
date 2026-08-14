/**
 * 模块边界 / 包 DAG 的 CI 强约束（落 module-boundaries.md 的依赖规则）。
 * run: pnpm arch 为啥
 * 规则随包逐步建起来生效；现阶段先守住"无环 / packages 不依赖 apps / apps 不互依 / ai-runtime 关口"。
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '禁止循环依赖',
      from: {},
      to: { circular: true },
    },
    {
      name: 'packages-not-depend-apps',
      severity: 'error',
      comment: 'packages 永不依赖 apps（依赖方向向下）',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'apps-not-cross-import',
      severity: 'error',
      comment: 'apps 之间不互 import（只经 contracts 类型 / 运行期 HTTP·队列）',
      from: { path: '^apps/([^/]+)/' },
      to: { path: '^apps/(?!$1/)[^/]+/' },
    },
    {
      name: 'ai-graphs-pure',
      severity: 'error',
      comment: 'ai-graphs 纯逻辑：不引 db/contracts 运行时（只 import type domain）',
      from: { path: '^packages/ai-graphs/' },
      to: { path: '^packages/(db|contracts)/', dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'ai-runtime-chokepoint',
      severity: 'error',
      comment: 'ai-runtime 只许从其公共面 import；禁深链 router/validator 内部（关口完整性，审计#6）',
      from: { pathNot: '^packages/ai-runtime/' },
      to: { path: '^packages/ai-runtime/src/(router|validators|catalog)/' },
    },
    {
      name: 'no-deep-repo-import',
      severity: 'error',
      comment: '禁跨包深链 internal/repo/entity（只 import 他包公共面 index）',
      from: {},
      to: { path: '(internal|repositor|\\.repo\\.|\\.entity\\.)', pathNot: '^(apps|packages)/[^/]+/(internal|.*\\.repo\\.|.*\\.entity\\.)' },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: { orphan: true, pathNot: '\\.(d\\.ts|json|mjs|tsx)$|(validate|main|smoke[^/]*|[^/]*-?demo|[^/]*\\.proof|[^/]*\\.int)\\.ts$|apps/web/(middleware|app/|.*page)' },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: 'node_modules|dist|\\.turbo|/smoke/' },   // smoke/ 是验证脚本(非生产 DAG),不纳入边界约束
    tsPreCompilationDeps: true,
    // 跨包 @meetwise/* 解析：用 tsconfig paths（与 tsc/IDE 一致）。否则 value import 解析为 undefined、
    // 边界规则对跨包静默失效＝假绿（已用反向注入验证：缺此配置时 ai-graphs-pure 不触发）。
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'types', 'default'],
      mainFields: ['module', 'main', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
  },
};
