---
id: requirements_uc_e2e_parity_baseline
name: 用例 · E2E 用例数与断言 parity 基线
description: 静态冻结 e2e/ 与约定关键 prove 脚本的 test/assertion 身份，删除用例或削弱 expect 必须 fail-closed；合法削减只能走显式 allowlist。
type: reference
scope: shared
level: spec
status: active
owner: qa
related:
  - ./README.md
  - ../use-case-conventions.md
  - ../../testing/conventions/test-authoring.md
  - ../../testing/e2e-parity-baseline.md
  - ../../testing/strategy/test-strategy.md
  - ../../skills/testing/SKILL.md
---

# e2e-parity-baseline · 用例数 / 断言 parity（控制面）

> **边界**：本能力是测试控制面，不跑 live HTTP/UI E2E，不证明模型质量，不授予 `releaseEvidence`。唯一真相是版本化基线 + allowlist + 当前树的静态扫描。更新步骤只维护在 [`testing/e2e-parity-baseline.md`](../../testing/e2e-parity-baseline.md)。

## 承重对象

| 对象 | 最小字段 | 不可变约束 |
| --- | --- | --- |
| `ParityFileSnapshot` | `path`、`testCount`、`assertionCount`、`tests[]`、`assertions[]` | `path` 唯一；计数必须等于对应数组长度；身份 = `kind + label + conditionDigest` |
| `ParityAssertion` | `kind`、`label`、`conditionDigest` | digest 绑定规范化后的条件/参数源码；`A(true)` 与原条件不是同一身份 |
| `ParityAllowlistEntry` | `id`、`path`、`reason`、`removedTests`、`removedAssertions`、`removedFile` | `id` 唯一；reason 必须是可审的句子；被删身份必须仍留在基线里 |

不引入业务状态机。门禁结果只有 `valid=true|false`，失败不得改写基线。原语是 **allowlist**（显式许可）+ **内容摘要**（条件 digest，防削弱）。

---

## UC-e2e-parity-01 · 冻结 e2e 用例数与断言身份，玩具回归 fail-closed

- **七类覆盖**：正常 ✅ · 异常 ✅ · 特殊 ✅ · 逃逸 ✅ · 高并发 ✅ · 复杂 ✅ · 刁钻 ✅
- **角色**：质量工程师 / CI
- **前置**：仓库含 `ai-docs/testing/e2e-parity-baseline.json` 与空或已审 allowlist；扫描根为 `e2e/**/*.{e2e,proof,spec}.ts` 以及约定关键 prove：`scripts/local-e2e-receipt.proof.mjs`、`scripts/bounded-command.proof.mjs`。
- **触发**：`pnpm e2e-parity:check` 或 `pnpm e2e-parity:prove`。
- **主流程 Main：**
  1. 校验器只读版本化文件与源码，不执行 E2E、不读密钥、不写基线。
  2. 按固定规则抽出 `test`/`it` 与 `A`/`assert`/`assert.*`/`expect`/`expectCode`/`rejects` 调用身份。
  3. 当前身份 ∪ allowlist 移除集 必须恰好等于基线身份；多出的新身份视为基线过期。相对 `HEAD` 已入库的基线身份只能追加，禁止 `--print` 整文件覆盖后假装削减从未发生。
  4. 输出 `releaseEvidence=false`；`valid=false` 时非零退出。
- **备选流 Alternate：** 仅新增断言/用例：检查报 `assertion_untracked` / `test_untracked`，把新身份**追加**进基线后通过。不得用静默重写删掉旧身份。
- **异常流：**
  | flow | 场景 | 机制 | 后置 |
  |---|---|---|---|
  | E1 删除断言 | 源码去掉一条 `A`/`assert`/`expect` | 基线身份缺失且未 allowlist → `assertion_removed` | 非零退出，基线未被改写 |
  | E2 并发扫描 | 两份隔离夹具同时扫描 | 纯函数 + 排序错误码，结果全等 | 无交叉写入 |
  | E3 越权/逃逸路径 | 基线指向仓库外、`..`、符号链接 | 路径 allowlist + `realpath` fail-closed | `path_escape` / `symlink_forbidden` |
  | E4 失败不回滚写 | 校验失败 | 检查器无写路径（只读） | 基线/allowlist 字节不变 |
  | E5 依赖缺失 | 基线文件缺失/不可读 | fail-closed，不得当通过 | `baseline_unreadable` |
  | E6 超时/空树 | 扫描根空、文件超限 | 固定错误码，不挂起 | `source_empty` / `file_limit` |
- **后置：** 通过时当前树与基线对齐；失败时 Git 中的基线与 allowlist 保持原修订。
- **验收 Acceptance：**
  <!-- acceptance: UC-e2e-parity-01.acceptance.1 -->
  1. 当前仓库扫描与基线在 allowlist 为空时完全一致；`releaseEvidence` 恒为 false。
  <!-- acceptance: UC-e2e-parity-01.acceptance.2 -->
  2. 删除任一条已冻结断言 → 非零退出且含 `assertion_removed`；重复扫描同一夹具错误码相同。
  <!-- acceptance: UC-e2e-parity-01.acceptance.3 -->
  3. 符号链接、仓库外路径、缺失基线均不得 `valid=true`。
  <!-- acceptance: UC-e2e-parity-01.acceptance.4 -->
  4. 新文件或新断言未写入基线 → `file_untracked` / `assertion_untracked`，不能当通过。
- **关联：** 无业务契约。原语：allowlist、内容摘要。`TC-e2e-parity-01-main`、`TC-e2e-parity-01-E1`…`E6`。

**测试用例**
- TC-e2e-parity-01-main · unit（`e2e-parity:prove`）· 真仓库扫描 valid，stats 与基线一致，`releaseEvidence=false`。
- TC-e2e-parity-01-E1 · unit · 夹具删掉一条 `A(...)` → `assertion_removed`；再扫一次错误码相同。
- TC-e2e-parity-01-E2 · unit · 两份隔离目录并发扫描，错误集合全等。
- TC-e2e-parity-01-E3 · unit · 基线 path=`../secret.ts` 或源文件为 symlink → 拒绝。
- TC-e2e-parity-01-E4 · unit · 校验器导出函数无写盘；失败结果不产生新文件。
- TC-e2e-parity-01-E5 · unit · 缺失基线 / 不可读目录 → fail-closed。
- TC-e2e-parity-01-E6 · unit · 空扫描根或超大文件 → 固定错误，不通过。

---

## UC-e2e-parity-02 · 合法削减只能走显式 allowlist

- **七类覆盖**：正常 ✅ · 异常 ✅ · 特殊 ✅ · 逃逸 ✅ · 高并发 ✅ · 复杂 ✅ · 刁钻 ✅
- **角色：** 质量工程师（评审）
- **前置：** 基线已冻结旧身份；产品/测试变更确实要删或改条件。
- **触发：** 作者提交 allowlist 条目并重跑 `e2e-parity:check`。
- **主流程：**
  1. 基线**保留**被删身份（禁止从 JSON 默默抹掉）。
  2. allowlist 增加一条：稳定 `id`、精确 `path`、可审 `reason`、完整 `removed*` 身份。
  3. 当前树不再包含这些身份；检查器验证 `current ∪ removed === baseline` 且交集为空。
  4. 评审看 allowlist diff，而不是“计数还差不多”。
- **备选流：** `removedFile=true` 整文件退役；该 path 下基线身份全部视为 removed，源文件必须消失。
- **异常流：**
  | flow | 场景 | 机制 | 后置 |
  |---|---|---|---|
  | E1 空理由/占位 | `reason` 过短或 `todo`/`tbd` | schema 拒绝 | `allowlist_reason_invalid` |
  | E2 伪造身份 | removed 不在基线 | 集合差集校验 | `allowlist_unknown_assertion` |
  | E3 仍在源码 | allowlist 声明删除但源码还在 | 交集必须为空 | `allowlist_still_present` |
  | E4 重复 id | 两条同一 id | 唯一键 | `allowlist_id_duplicate` |
  | E5 削弱同标签 | `A(cond, 'x')` 改成 `A(true, 'x')` | conditionDigest 变了 = 旧身份消失 | 无 allowlist → `assertion_removed`；有新身份未入库 → `assertion_untracked` |
  | E6 注释假断言 | 把断言注释掉，或只在字符串里写 `A(` | 注释剥离 + 只在代码上下文抽调用 | 计为删除，不能假绿 |
- **后置：** 合法削减后基线身份仍在，allowlist 追加一条；非法削减门禁红。
- **验收：**
  <!-- acceptance: UC-e2e-parity-02.acceptance.1 -->
  1. 精确匹配的 allowlist 条目可使对应删除通过，且 `releaseEvidence=false`。
  <!-- acceptance: UC-e2e-parity-02.acceptance.2 -->
  2. 空理由、未知身份、源码仍在、重复 id 均为 `valid=false`。
  <!-- acceptance: UC-e2e-parity-02.acceptance.3 -->
  3. 条件改成 `true`/`r.status===200` 而标签不变时，旧 digest 缺失必须失败，除非 allowlist 写下旧身份并把新身份追加进基线。
- **关联：** [`testing/e2e-parity-baseline.md`](../../testing/e2e-parity-baseline.md) 是更新步骤的唯一正文。`TC-e2e-parity-02-*`。

**测试用例**
- TC-e2e-parity-02-main · unit · allowlist 精确移除一条后 valid。
- TC-e2e-parity-02-E1 · unit · reason=`todo` / 过短 → 拒绝。
- TC-e2e-parity-02-E2 · unit · removed digest 不在基线 → 拒绝。
- TC-e2e-parity-02-E3 · unit · 源码仍含该断言 → `allowlist_still_present`。
- TC-e2e-parity-02-E4 · unit · 重复 allowlist id → 拒绝。
- TC-e2e-parity-02-E5 · unit · `A(x&&y,'L')` 改为 `A(true,'L')` 无 allowlist → 失败。
- TC-e2e-parity-02-E6 · unit · 断言被注释后视为删除，字符串里的 `A(` 不计入；正则字面量诱饵不计入。
- TC-e2e-parity-02-E7 · unit · 用缩小后的基线对齐削弱后的源码、allowlist 为空 → `baseline_identity_dropped`（相对上一份基线 append-only）。
- TC-e2e-parity-02-E8 · unit · 新文件 `file_untracked`；删 `test(` → `test_removed`；`releaseEvidence: true` → `release_evidence_claimed`。

---

# 七类覆盖自检

| UC | 正常 | 异常 | 特殊 | 逃逸 | 高并发 | 复杂 | 刁钻 |
|---|---|---|---|---|---|---|---|
| 01 冻结 parity | ✅ 真仓库对齐 | ✅ 删除失败 | ✅ 空树/超限 | ✅ 缺基线 fail-closed | ✅ 隔离并发全等 | ✅ 多文件+prove 同基线 | ✅ 路径逃逸/symlink |
| 02 allowlist | ✅ 精确许可 | ✅ 未知身份 | ✅ 整文件退役 | ✅ 源码仍在拒绝 | ✅ 重复 id | ✅ 替换=删旧+追加新 / 缩基线必须红 | ✅ 削弱 digest / 注释假绿 / 正则诱饵 |
