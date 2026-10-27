/**
 * @meetwise/config eslint flat base — LINT-DESIGN §1.5 S1 config 产物（≤3 文件之一）
 *
 * 蓝本：ai-docs/delivery/harness/lint-design.md §1.2 规则集（唯一授权面）
 * - 四规则全部 warn 起步（设计 §1.2 总则「首日零红结构保证」）
 * - 钉死组合零调参：本文件只落设计 §1.2 明文参数，无任何清单外规则/选项
 * - 零 resolver 设置：eslint-import-resolver-typescript 不在 S0 四包清单（S0 REQUEST §2.5），
 *   import/order 纯排序面（builtin/external/相对分类 + pathGroups 正则）以插件自带
 *   eslint-import-resolver-node 即可运行，无需额外插件
 * - 消费方式（S2 面）：根 eslint.config.mjs / 各 workspace `import base from '@meetwise/config/eslint/base'`
 */

import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

// 全局 ignores（P2-C lint 门状态序依赖修正·eslint-ignores-REQUEST.md §1）：
// 生成物面 **/.next/**（prove web 容器 build 回写宿主 apps/web/.next/·gitignored .gitignore:6）+
// **/.tmp/**（runner 收据面 run-e2e-isolated.mjs 写 .tmp/*/_caps-child.source.mjs·gitignored :15）——
// 生成物非交付面：在场致 web lint 605→2917 warnings 红 + root lint 5362→7675 红（含
// _caps-child.source.mjs Parsing error 1 error·文本留痕非 JS·亲证 eslint-ignores-REQUEST.md §0.2）
// → lint 门状态序依赖 prove 残留（CI fresh clone 不受影响·两生成物均 gitignored）。
// 双星锚形（**/ 前缀）：根跑（cwd=仓根）与各 workspace 跑（cwd=apps/web 等）共用本 base·
// 相对 ignores 按行使 cwd config 锚定（'apps/web/.next/**' root-relative 落法在 web 跑锚下不命中·
// 根 shell 单点落法 2917 红不退亲证留 eslint-ignores-REQUEST.md §1.3 否决表）——**/ 前缀双锚通
// 命中·沿本文件 pathGroups '@meetwise/**' 双星 glob 项形·零规则改动（ignores ≠ rules·
// 四规则面零触·`files` 三元组零动）。
export default tseslint.config(
  {
    ignores: ['**/.next/**', '**/.tmp/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
    },
    rules: {
      // 设计 §1.2.1 — no-explicit-any：warn 起步渐进收紧（不做 any→unknown 假清零）
      '@typescript-eslint/no-explicit-any': 'warn',

      // 设计 §1.2.2 — naming-convention：
      //   types/classes/interfaces PascalCase（interface 禁 `I` 前缀）
      //   · variables/functions/成员 camelCase · 常量 UPPER_CASE
      //   · 设计原文 allowLeadingUnderscores: true（typescript-eslint 选项名为
      //     leadingUnderscore: 'allow'，语义映射如实登记收据）
      //   · 常量 UPPER_CASE 以 variable 双格式并集落法（constant ⊂ variable 选择器重叠面，
      //     独占 UPPER_CASE 会对全仓 camelCase 字面量 const 大面积误警，与设计「存量宽容起步」
      //     冲突——映射决策登记收据，S3 dry-run 实测复核项）
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
          leadingUnderscore: 'allow',
        },
        {
          selector: ['class', 'typeAlias'],
          format: ['PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'memberLike',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],

      // 设计 §1.2.3 — no-unused-vars：warn 起步 · argsIgnorePattern '^_'
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // 设计 §1.2.4 — import-order：`node:` 内建 → 外部包 → `@meetwise/*` → 相对路径
      //   pathGroupsExcludedImportTypes: [] 为钉死顺序的机械使能件（默认值会把 external
      //   类的 @meetwise/* 排除在 pathGroups 重划之外，@meetwise/* 槽位无法成立）——
      //   非调参，钉死顺序的必要落法，登记收据
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: '@meetwise/**', group: 'internal', position: 'after' }],
          pathGroupsExcludedImportTypes: [],
        },
      ],
    },
  },
);
