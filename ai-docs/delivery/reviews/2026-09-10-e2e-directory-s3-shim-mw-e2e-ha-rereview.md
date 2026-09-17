# Re-review — E2E 目录 S3 shim · B1 修复 · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗复审；不采信实现方自述；独立复跑）  
**日期**：2026-09-10（PT）  
**切片**：S3 B1 修复复审 only（`isProveShellTarget` 排除 conn-only）  
**对照原审**：`reviews/2026-09-10-e2e-directory-s3-shim-mw-e2e-ha.md`（conditional · B1）  
**状态页**：`reviews/2026-09-10-e2e-s3-shim-BLOCKED-rag-conditional.md`  
**releaseEvidence=false** · **Not HA** · **shim≠HA** · **本绿≠已迁** · **prove EXIT=0 ≠ E2E covered** · **连通绿≠E2E**

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass** |
| Harness / 车道诚实 | **pass**（原 R3 / B1 已关） |
| **B1 是否清零** | **是 · 清零** |
| 对抗立场 | 独立源码读 + node 实跑 + platform 复跑；不采信自报 |
| **是否批准进入 S4（conn-stack）** | **本域赞成批 S4**；协调层仍要求 **mw-rag-route spot 复审亦 pass** 后方可解除 BLOCKED（单域 pass ≠ 自动解除；冲突取更严） |
| releaseEvidence | **false**（本复审不构成发布证据；shim 绿 ≠ HA） |

原审唯一阻塞 **B1**（`isProveShellTarget('mysql-stack:*')===true` 且 `isConnOnlyTarget===true`）经独立核验已关闭：API 排除 conn-only、运行时钉 EXIT=0、directory-contract 静态钉在 `e2e-platform:check` 路径生效。A1–A7 回归抽查未成立。

---

## B1 核验（必做 1–2）

### 源码

`scripts/isolated/targets-domain-prove.mjs`：

```js
export function isProveShellTarget(target) {
  return (
    typeof target === 'string'
    && target.length > 0
    && !isLiveE2eTarget(target)
    && !isConnOnlyTarget(target)
  );
}
```

`isConnOnlyTarget` = `target.startsWith('mysql-stack:')`。注释与 `CONN_ONLY_NOTE` 钉「NEVER prove-shell, NEVER LIVE」。

### 运行时钉（本审复跑）

| target | proveShell | connOnly | live | 期望 |
|--------|------------|----------|------|------|
| `mysql-stack:ping` | **false** | **true** | false | OK |
| `mysql-stack:skeleton` | **false** | **true** | false | OK |
| `mysql-stack:r5-mark-red` | **false** | **true** | false | OK |
| `mysql-stack:skeleton:prove`（原审曝光名） | **false** | **true** | false | OK |
| `mysql-stack:ping:prove` | **false** | **true** | false | OK |
| `e2e:prove` / `e2e:ui` / `performance:e2e` | false | false | **true** | LIVE 未误伤 |
| `vectorstore:prove` | **true** | false | false | 正常 prove-shell |

→ 打印 **`STATIC_B1_OK`** · **EXIT=0**

### 静态门钉（contract）

`scripts/e2e-platform/directory-contract.mjs`（约 L369–383）要求：

- `isConnOnlyTarget` + `startsWith('mysql-stack:')` 存在  
- `isProveShellTarget` 函数体含 `!isConnOnlyTarget(`  
- 叙事含 NEVER prove-shell  

缺任一 → `e2e_directory_contract_prove_shell_must_exclude_conn_only` 等 fail-closed。本审 `e2e-platform:check` **directoryErrors=0** → 钉生效。

---

## 旁证复跑（必做 3 · ≠ live · ≠ HA）

| CMD | EXIT | 解读 |
|-----|------|------|
| node B1 断言（ping/skeleton/r5-mark-red） | **0** | STATIC_B1_OK |
| `pnpm e2e-platform:check` | **0** | directoryErrors=0；`releaseEvidence:false` |
| `pnpm e2e-platform:prove` | **0** | 5 guards；`releaseEvidence=false`；status=draft |

禁止把上表写成 live E2E / HA / 已迁 / 发布证据。

---

## 回归抽查（必做 4 · 假绿 / LIVE 缩表 / 断入口）

| # | 反对假设 | 抽查 | 结果 |
|---|---------|------|------|
| A1 | 空壳 / 口头修复 | `scripts/isolated/` 仍 3 文件；`!isConnOnlyTarget` 在函数体 | **未成立** |
| A2 | 断入口 | `e2e:isolated` / `e2e:ui:isolated` / `performance:e2e:isolated` 仍 → `node scripts/run-e2e-isolated.mjs …` | **未成立** |
| A3 | LIVE 缩表 | legacy L47 `new Set(['e2e:prove','e2e:ui','performance:e2e'])`；`LIVE_E2E_TARGET_LIST` 同三元 | **未成立** |
| A4 | mass-move | `e2e/` 仍扁平：`full.e2e.ts` · `performance.e2e.ts` · `ocr-fixture.ts` · `helpers/` | **未成立** |
| A5 | 偷跑 S4 | `scripts/conn-stack` **不存在** | **未成立** |
| A6 | platform 绿冒充 HA | JSON / prove 均 `releaseEvidence=false`；本审钉 ≠ HA | **未成立（纪律面）** |
| A7 | UI/rag 升 LIVE | PRIMARY 仍 `{e2e:prove,performance:e2e}`；LIST 无 vectorstore/rag | **未成立** |
| **B1** | conn-only 误入 prove-shell | 见上表；proveShell=false ∧ connOnly=true | **已关闭** |

---

## 阻塞与反对项（必填）

**结论栏：无阻塞 · 原 B1 已清零 · 本域 pass。**

| 状态 | 项 |
|------|-----|
| **已关闭** | **B1**：`isProveShellTarget` 已排除 `isConnOnlyTarget`；运行时钉 EXIT=0；contract fail-closed 钉随 check=0 验证 |
| **无新增反对** | A1–A7 本轮未成立 |
| **协调提醒（非本域阻塞）** | 状态页要求 **双域**（mw-e2e-ha + mw-rag-route spot）皆 pass 方可解除 BLOCKED；**单域 pass ≠ 解除**。若 rag-route 复审仍 conditional/block，取更严，整片保持 BLOCKED、**不** unlock S4 |
| **非阻塞 nit** | Runtime 仍用 legacy 内联 LIVE Set（未 import targets-live-e2e）— 与 ADR 保守落地一致；S4 前勿削弱 contract 三元对齐钉 |
| **北星** | 生产目标 100% HA；**本片 shim/B1 修复绿 ≠ HA / ≠ 可用性已证**；禁止勾 `releaseEvidence=true` |

---

## S4 前置（本复审）

| 前置 | 状态 |
|------|------|
| 原审 B1 修复 + 静态钉 | **满足**（本审独立核验） |
| platform check/prove EXIT=0 | **满足**（≠ HA） |
| LIVE 未缩 · 入口未断 · 无 conn-stack · 无 mass-move | **满足** |
| mw-e2e-ha 复审 pass | **满足（本文件）** |
| mw-rag-route spot 复审 pass | **待该域产出**（本审不代签） |

→ **本域赞成批准进入 S4**。父代理 / 协调层须在 **rag-route 复审 pass** 后解除 BLOCKED；在此之前不得单方 unlock。**禁止**把本复审写成 sole-stack / live E2E / HA / 发布证据。

---

## 归档

- 本文件：`ai-docs/delivery/reviews/2026-09-10-e2e-directory-s3-shim-mw-e2e-ha-rereview.md`
- 原审：`reviews/2026-09-10-e2e-directory-s3-shim-mw-e2e-ha.md`
- 状态页：`reviews/2026-09-10-e2e-s3-shim-BLOCKED-rag-conditional.md`
- 结论：**pass** · **B1 清零** · **本域赞成批 S4（双域门仍开）** · releaseEvidence=false · Not HA · shim≠HA
