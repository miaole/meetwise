# Review — E2E 目录重构 S3（shim / 清晰入口）· mw-e2e-ha

**审稿人**：mw-e2e-ha（独立；实现方不自审；不采信自报）  
**日期**：2026-09-10（PT）  
**切片**：S3 only（`scripts/isolated/` 薄入口 + LIVE/prove-shell 模块；**不** mass-move；**不**缩 LIVE；**不**建 `scripts/conn-stack/`）  
**releaseEvidence=false** · **Not HA** · **shim/目录重构绿 ≠ HA / ≠ 可用性已证** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E** · **静态绿 ≠ live E2E** · **未声称 covered/HA**

**对照**：
- `delivery/harness/e2e-directory-s3-shim.md`（R1–R10 + rollback）
- `delivery/adr-e2e-directory-restructure.md` D2/D6 · §4 S3 · §10
- `delivery/e2e-directory-target-structure.md` §3.1 · §6 S3
- `testing/conventions/e2e-directory-contract.md`（S3 演进目录）
- S2 审查：`reviews/2026-09-10-e2e-directory-s2-contract-mw-e2e-ha.md`（已批准进 S3）
- 第二域 spot：`reviews/2026-09-10-e2e-s3-shim-mw-rag-route-spot.md`（**conditional**）

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **conditional** |
| Harness 词汇 | **conditional**（R3 命名诚实缺口；取更严） |
| 对抗立场 | 主动猎假绿 / 偷搬迁 / LIVE 缩表 / 断入口；不采信实现方自报；冲突以更严为准 |
| **阻塞与反对项** | **有阻塞**（见专节 B1；A1–A7 未成立） |
| 双域 | mw-e2e-ha（本审 **conditional**）+ mw-rag-route spot（**conditional**）· **同向 · 无更严冲突以外升级** |
| **是否批准进入 S4（conn-stack）** | **否 · 不批准**（conditional 清零 + 双域复审 pass 前方可） |
| releaseEvidence | **false**（本审不构成发布证据；shim 绿 ≠ HA / ≠ 可用性已证） |

S3 主体交付（三文件落盘、薄 forward、别名不破、LIVE 三元未缩、无 mass-move、无 conn-stack、platform/inventory 静态绿、ADR §10 + harness rollback）**大体对齐**。  
**但** `targets-domain-prove.mjs` 的 `isProveShellTarget` 对 `mysql-stack:*` 返回 **true**（与同文件「Conn-only never prove-shell」注释及三车道纪律冲突）→ **车道 API 诚实缺口**，可支撑 BUG-FAKE-CONN 误读。第二域已 **conditional**；本审独立复现后取更严 → **conditional**，**不批 S4**。

---

## Harness R1–R10

| ID | 结果 | 注 |
|----|------|----|
| R1 `scripts/isolated/` 落盘 | **pass** | `run-isolated.mjs` · `targets-live-e2e.mjs` · `targets-domain-prove.mjs` 齐；legacy `run-e2e-isolated.mjs` 在 |
| R2 清晰入口不破别名 | **pass** | `e2e:isolated` / `e2e:ui:isolated` / `performance:e2e:isolated` 仍 → `node scripts/run-e2e-isolated.mjs …`；`wrappersOnNewIsolated=0`；新入口为薄 spawn forward |
| R3 prove-shell 命名诚实 | **fail → conditional** | 头注释钉「域 prove ≠ LIVE」OK；**但** `isProveShellTarget('mysql-stack:…')===true` 把 conn-only 标成 prove-shell（见 B1） |
| R4 LIVE 白名单诚实 | **pass** | `LIVE_E2E_PRIMARY⊆{e2e:prove,performance:e2e}`；`e2e:ui`=secondary；代码 Set 仍三元 |
| R5 未缩小 LIVE | **pass** | legacy L47：`new Set(['e2e:prove','e2e:ui','performance:e2e'])`；`targets-live-e2e` LIST 同三元 |
| R6 无 mass-move / 无 conn-stack | **pass** | `e2e/` 仍扁平（`full`·`performance`·`ocr-fixture`·`helpers/`）；`scripts/isolated/` 仅 3 薄文件；`test ! -d scripts/conn-stack` → absent_exit=0 |
| R7 platform / inventory 绿 | **pass** | 本审复跑：check=0 · prove=0 · inventory=0（≠ live / ≠ HA） |
| R8 harness + rollback | **pass** | `harness/e2e-directory-s3-shim.md` 含 rollback；旧入口保留 |
| R9 ADR S3 状态 | **pass（过程）** | §10 标 S3 shim done；独立审栏本审前为「待」— 正确；本审后应为 conditional · **不批 S4** |
| R10 非 UI · 禁连通冒充 | **conditional** | 文档仍钉 HTTP/SSE primary、mysql-stack∉LIVE；**API** 侧 `isProveShellTarget` 未排除 conn-only → 冒充风险未关死 |

**Reject/conditional 项**：R3（及连带 R10 API 面）→ 整片 **conditional**。

---

## 硬钉对齐

| 硬钉 | 核查 | 结果 |
|------|------|------|
| 薄 shim · 别名不破 | `run-isolated.mjs` 仅 spawn legacy；package 三入口仍 legacy | **pass** |
| `LIVE_E2E_TARGETS` 未缩 | legacy Set + `LIVE_E2E_TARGET_LIST` 皆三元含 `e2e:ui` | **pass** |
| 无 mass-move / 无 `conn-stack` | e2e 树未迁；conn-stack absent | **pass** |
| 车道诚实（LIVE · prove-shell · conn-only） | LIVE/UI 分层 OK；**prove-shell∩conn-only 非空** | **fail（B1）** |
| 北星：shim 绿 ≠ HA | 文首 + 旁证解读钉死；releaseEvidence=false | **pass（纪律）** |

---

## 偷跑 / 范围诚实性

| 核查 | 结果 |
|------|------|
| `scripts/isolated/` | **已建**（S3 目标；3 薄文件 only · 非 body mv） |
| `scripts/conn-stack/` | **不存在**（未偷跑 S4） |
| `scripts/run-e2e-isolated.mjs` | **保留**为实现宿主；runtime **未** import `targets-live-e2e`（双源；contract `checkIsolatedLayoutRequired` 钉三元对齐） |
| package.json 别名 | **未断**；未批量改脚本名指向 `scripts/isolated/` |
| `LIVE_E2E_TARGETS` | **未缩** |
| `e2e/` mass-move | **未做** |
| 用 mysql-stack / live e2e 顶替本片 | **未采信**；旁证仅静态复跑 |

---

## 声称旁证（复跑 · ≠ live E2E · ≠ HA）

不采信实现方自报；下表为本审 **复跑** EXIT。

| CMD | EXIT | 解读 |
|-----|------|------|
| `test -f scripts/isolated/run-isolated.mjs`（及 targets-*） | **0** | ISOLATED_ENTRY_OK · TARGETS_LIVE_OK · TARGETS_PROVE_OK |
| `test -f scripts/run-e2e-isolated.mjs` | **0** | LEGACY_IMPL_OK |
| `test -f ai-docs/delivery/harness/e2e-directory-s3-shim.md` | **0** | HARNESS_S3_OK |
| `test ! -d scripts/conn-stack` | **0**（absent） | conn_stack_absent_exit=0 |
| `rg LIVE_E2E_TARGETS scripts/run-e2e-isolated.mjs` | **0** | L47 仍三元 |
| node 读 `package.json` 三入口 | **0** | 皆 `node scripts/run-e2e-isolated.mjs …` |
| node 导入 lane 分类器抽查 | **0** | **暴露 B1**：`mysql-stack:skeleton:prove` → proveShell=true · connOnly=true |
| `pnpm e2e-platform:check` | **0** | directoryErrors=0；≠ live；≠ HA |
| `pnpm e2e-platform:prove` | **0** | 5 守卫；≠ live；≠ HA |
| `pnpm e2e-case-inventory:prove` | **0** | 静态 inventory；≠ 已迁；≠ HA |
| `mysql-stack:*` / `e2e:isolated` / live | **N/A** | 禁止计入本切片成功（未跑） |

---

## 阻塞与反对项（对抗 · 必填）

**结论栏：有阻塞 · 反对项 B1 · 不批准 S4。**  
冲突规则：他域更严则以其为准；mw-rag-route spot = **conditional**，本审独立复现同向 → 整片 **conditional**（不升级为无证据 block，亦不放水为 pass）。

### 主动猎假绿 / 偷搬迁 / LIVE 缩表 / 断入口（抽查）

| # | 反对假设 | 抽查动作 | 结果 |
|---|---------|----------|------|
| A1 | 假绿：仅口头 shim / 空目录 | `ls scripts/isolated/` 三文件；薄 forward 可读 | **未成立** |
| A2 | 断入口 / 批量改 package 别名 | 三 `*:isolated` 仍指 legacy；97 wrappersOnLegacy | **未成立** |
| A3 | LIVE Set 缩表（删 `e2e:ui` 或主集） | legacy + targets LIST 仍三元 | **未成立** |
| A4 | 偷搬迁 mass-move `e2e/` / proof | e2e 仍扁平；isolated 仅 3 mjs | **未成立** |
| A5 | 偷跑 S4 建 `conn-stack` | `test ! -d` absent | **未成立** |
| A6 | 用 platform/inventory 绿冒充 live/HA/已迁 | JSON `releaseEvidence:false`；本审钉 ≠ HA | **未成立（纪律面）** |
| A7 | 把 UI / rag prove 升 LIVE | PRIMARY 无 UI；LIST 无 vectorstore/rag*/memory | **未成立** |
| **B1** | **车道 API 把 mysql-stack 标成 prove-shell（假绿/冒充通道）** | `isProveShellTarget('mysql-stack:skeleton:prove')===true` 且 `isConnOnlyTarget===true`；注释自相矛盾 | **成立 → 阻塞** |

### B1 明细（必须关闭后方可复审 pass / 批 S4）

1. **修复**：`isProveShellTarget` = `!isLiveE2eTarget(t) && !isConnOnlyTarget(t)`（或等价），使 `mysql-stack:*` **既非 LIVE 亦非 prove-shell**。  
2. **静态钉**：`directory-contract` / 最小 prove 断言：`mysql-stack:*` ∉ prove-shell、∉ LIVE；缺钉则 fail-closed。  
3. **文档一句**：调用方不得把 `isProveShellTarget` 真值写成 conn-only covered（修 API 前亦须）。  
4. **复审**：双域（mw-e2e-ha + mw-rag-route spot）对修复片再审；**皆 pass** 后方可解除 conditional 并考虑批 S4。

### 非阻塞提醒（不得误读为反对清零）

1. Runtime 仍用 legacy 内联 Set、未 import `targets-live-e2e` — ADR「保守落地 / body mv 延后」对齐；contract 已钉三元成员对齐。S4 前勿削弱该钉。  
2. `FUTURE_ISOLATED_*` 命名残留（已 REQUIRED）— 文档/符号整洁 nit，非阻塞。  
3. `e2e-platform:check` 绿 **未**捕获 B1 — 证明静态门不足以代替车道 API 抽查；修复须补钉。  
4. **北星**：生产目标 100% HA；**本片 shim/目录重构绿 ≠ HA / ≠ 可用性已证**；禁止把本审或 spot 勾 `releaseEvidence=true`。

### 采信边界

不采信实现方自报 EXIT；上表旁证均为本审复跑。不采信「platform=0 ⇒ 车道诚实」。不以 conditional 清零前的任何静态绿批准 S4。

---

## S4 前置（本审裁定）

| 前置 | 状态 |
|------|------|
| S2 独立审通过并批准 S3 | **满足** |
| S3 三文件 + 薄 forward + 别名不破 + LIVE 未缩 + 无 mass-move + 无 conn-stack | **满足** |
| harness + ADR §10 + rollback | **满足** |
| platform check/prove + inventory 复跑 EXIT=0 | **满足**（≠ HA） |
| **prove-shell / conn-only 分类器诚实 + 静态钉** | **未满足（B1）** |
| 双域皆 pass（无 conditional） | **未满足**（双域皆 conditional） |

→ **不批准进入 S4**。修复 B1 并双域复审 pass 后另开批准。**禁止**把本审静态绿写成 sole-stack / live E2E / HA / 发布证据。

---

## 归档

- 本文件：`ai-docs/delivery/reviews/2026-09-10-e2e-directory-s3-shim-mw-e2e-ha.md`
- 第二域：`ai-docs/delivery/reviews/2026-09-10-e2e-s3-shim-mw-rag-route-spot.md`（conditional）
- 协调阻塞条：`reviews/2026-09-10-e2e-s3-shim-BLOCKED-rag-conditional.md`（与本审同向）
- 结论：**conditional** · **不批准 S4** · releaseEvidence=false · Not HA · shim 绿 ≠ HA / ≠ 可用性已证
