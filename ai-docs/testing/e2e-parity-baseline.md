---
id: testing_e2e_parity_baseline
name: E2E 用例数与断言 parity 基线
description: 如何读取冻结的 e2e/ 断言身份、如何追加基线、以及合法削减时如何写 allowlist。不是覆盖率门，也不是发布证据。
type: testing
scope: shared
level: guide
status: active
owner: qa
---

# E2E 用例 / 断言 parity 基线

`pnpm e2e-parity:check` 静态扫描当前树，和版本化基线对身份。删除用例、注释掉断言或削弱 `A`/`expect` 必须 **fail-closed**（非零退出）。它**不**执行 `e2e:isolated`，**不**证明模型质量，回执恒为 `releaseEvidence=false`。

用例与验收：[`requirements/use-cases/e2e-parity-baseline.md`](../requirements/use-cases/e2e-parity-baseline.md)。机器文件：

| 文件 | 职责 |
| --- | --- |
| `ai-docs/testing/e2e-parity-baseline.json` | 冻结身份（只追加，不默默删） |
| `ai-docs/testing/e2e-parity-allowlist.json` | 合法削减的显式许可 |

## 扫什么

- `e2e/**/*.{e2e,proof,spec}.ts`（含 `e2e/helpers/e2e-helpers.proof.ts`）
- `e2e/helpers/assert.ts` 整文件 digest（抽空 `createAssert` 必须改基线并 allowlist 旧 digest）
- `e2e/helpers/interview.ts` 的 `options.assert(...)` 调用点
- 约定的廉价关键 prove：`scripts/local-e2e-receipt.proof.mjs`、`scripts/bounded-command.proof.mjs`

不扫整个 prove 目录：那些文件要 Docker / 长跑，不在本门的廉价范围内。本门冻的是**调用点身份**，不证明控制流一定执行到该行。

## 怎么计数

| 计数 | 规则 |
| --- | --- |
| 用例 `testCount` | `test(` / `it(` 调用。若一个文件没有这两类调用但有断言，计 1 个 `implicit-suite` |
| 断言 `assertionCount` | 代码上下文中的 `A(`、`assert(`、`assert.<method>(`、`expect(`、`expectCode(`、`rejects(` |
| 身份 | `kind + label + conditionDigest`。`label` 是字符串/模板参数（`test`/`it` 取第一参，断言取最后的字符串参）。`conditionDigest` 是其余参数规范化空白后的 SHA-256 |

注释会被剥掉。字符串/模板里的 `A(` 不计。因此“把断言注释掉”或改成 `A(true, '原标签')` 都会改变身份，门禁红。

## 通过条件

对每个基线文件：

1. `当前身份 ∪ allowlist 移除集 === 基线身份`
2. 当前身份与移除集交集为空
3. 计数等于对应数组长度
4. `releaseEvidence` 必须是 `false`

多出来的新身份 → `test_untracked` / `assertion_untracked`（先追加基线）。  
少了却没有 allowlist → `test_removed` / `assertion_removed`。

## 追加基线（新增用例或断言）

1. 写好测试。
2. 跑 `pnpm e2e-parity:check`。它会列出 `*_untracked` 身份。
3. 把这些身份**追加**到 `e2e-parity-baseline.json` 对应 `files.<path>.tests` / `assertions`，并改 `testCount` / `assertionCount` 为数组长度。
4. 不要删除 JSON 里已有的旧身份来“对齐”新树。相对 `HEAD` 的基线身份只能追加；从 JSON 抹掉旧身份且 allowlist 未记录 → `baseline_identity_dropped`。
5. 再跑 `pnpm e2e-parity:check` 与 `pnpm e2e-parity:prove`。

`node scripts/e2e-parity-check.mjs --print` **不会**写盘。基线已存在时它只打印尚未入库的身份（`e2e_parity_untracked`），不能当成整文件覆盖稿。首次生成基线才输出完整 `files` 快照。

## 更新 allowlist（合法削减或改条件）

删除用例、删断言、或改断言条件（包括削弱 `expect` / `A(...)`）时：

1. **保留**基线 JSON 里的旧身份。
2. 在 `e2e-parity-allowlist.json` 的 `entries` **追加**一条：

```json
{
  "id": "E2E-PARITY-20260904-short-slug",
  "path": "e2e/full.e2e.ts",
  "reason": "Product removed ocr_duplicate 409; covered by resume:prove TC-resume-…",
  "removedTests": [],
  "removedAssertions": [
    {
      "kind": "A",
      "label": "同图重传 → 409 且额度不再扣减",
      "conditionDigest": "sha256:…"
    }
  ],
  "removedFile": false
}
```

3. `id` 必须匹配 `E2E-PARITY-YYYYMMDD-kebab`，全局唯一。  
   `reason` 必须是一句可审说明（至少 24 个字符、含空格），禁止 `todo` / `tbd` / `n/a` / `fix` / `temp`。  
   `removed*` 必须是基线里的完整身份（从失败日志或基线原文复制 digest）。
4. 整文件退役时：`removedFile: true`，`removedTests`/`removedAssertions` 留空，源文件必须从扫描根消失。
5. 替换断言（旧条件 → 新条件）：allowlist 写下**旧**身份，同时把**新**身份追加进基线。
6. 跑 `pnpm e2e-parity:check` 与 `pnpm e2e-parity:prove`。PR 必须能看到 allowlist diff。

## 验证

```bash
pnpm e2e-parity:check
pnpm e2e-parity:prove
```

两者都是本地静态门，`releaseEvidence=false`。通过它们不能写成 HTTP E2E 已跑或可发布。
