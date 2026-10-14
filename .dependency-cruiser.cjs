/**
 * 模块边界 / 包 DAG 的 CI 强约束（落 module-boundaries.md 的依赖规则）。
 * run: pnpm arch
 * 规则随包逐步建起来生效；现阶段先守住"无环 / packages 不依赖 apps / apps 不互依 / ai-runtime 关口"。
 * 豁免逐条 justification 见 module-boundaries.md 附录（*.proof.ts 验证 harness / 同包深链 / 退役墓碑）。
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
      // from 豁免 .proof.ts 验证脚本——跨层 prove 是"验证 harness"非运行时依赖；
      // 生产面（非 proof）的 packages→apps 依旧全量封禁。
      comment: 'packages 永不依赖 apps（依赖方向向下·生产面）；*.proof.ts 验证脚本豁免（跨层 prove 合法落点，逐条 justification 见门豁免台账）',
      from: { path: '^packages/', pathNot: '\\.proof\\.ts$' },
      to: { path: '^apps/' },
    },
    {
      name: 'apps-not-cross-import',
      severity: 'error',
      // 同口径豁免 *.proof.ts（api/worker 间经进程内函数直执的 prove，非生产互依）。
      comment: 'apps 之间不互 import（只经 contracts 类型 / 运行期 HTTP·队列）；*.proof.ts 验证脚本豁免',
      from: { path: '^apps/([^/]+)/', pathNot: '\\.proof\\.ts$' },
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
      // from 带 $2 捕获（$1=(apps|packages)·$2=包名）+ to 负向前瞻 ^…$2(/|$) —— 规则对齐 module-boundaries.md §4
      // 「只许 import 他模块 index」：只禁"跨包"深链；同包内 index 组装导出/兄弟 import/自测深链不属边界违规。
      // 旧式 pathNot 豁免把真实 internal/ 目录整体放行（跨包深链误放行洞），本式封洞。
      comment: '禁跨包深链 internal/repo/entity（只 import 他包公共面 index）；同包内组装/导出/自测不在此限（module-boundaries.md §4「他模块」口径）',
      from: { path: '^(apps|packages)/([^/]+)' },
      to: { path: '^(?!(apps|packages)/$2(/|$)).*(internal|repositor|\\.repo\\.|\\.entity\\.)' },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      // apps/worker/src/interview-lifecycle.ts 是"退役即失败关闭"的隐私围栏墓碑（文件头明令禁止恢复旧实现），
      // 有意无 importer —— 登记豁免；删除反而拆掉文档化的兼容边界。
      comment: '孤儿告警；apps/worker/src/interview-lifecycle.ts 为 fail-closed 退役墓碑（有意保留·见文件头）',
      from: { orphan: true, pathNot: '\\.(d\\.ts|json|mjs|tsx)$|(validate|main|smoke[^/]*|[^/]*-?demo|[^/]*\\.proof|[^/]*\\.int)\\.ts$|apps/web/(middleware|app/|.*page)|apps/worker/src/interview-lifecycle\\.ts$' },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: 'node_modules|dist|\\.turbo|/smoke/|\\.next' },   // smoke/ 是验证脚本(非生产 DAG)、.next 是构建产物,均非源码 DAG,不纳入边界约束
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
