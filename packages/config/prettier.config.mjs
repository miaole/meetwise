/**
 * @meetwise/config prettier 独立条目 — LINT-DESIGN §1.5 S1 config 产物（≤3 文件之一）
 *
 * 蓝本：ai-docs/delivery/harness/lint-design.md §1.2 format 半边（唯一授权面）
 * - 恰设计钉死四键：printWidth 140 · semi true · singleQuote true · trailingComma 'all'
 * - 其余项取 prettier 默认（含缩进 2 空格零 tab——设计 §1.2 仓内惯例亲证与默认一致，
 *   不另落键）；eslint9 胜出分支 → format 归属 prettier（§1.1 选型结论）
 * - .prettierignore（dist/** · src/generated/** · pnpm-lock.yaml · coverage）为设计
 *   §1.2 落位项，超出本切片 ≤3 文件预算，顺延登记（收据如实披露，非本刀丢弃）
 */

/** @type {import("prettier").Config} */
const config = {
  printWidth: 140,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
};

export default config;
