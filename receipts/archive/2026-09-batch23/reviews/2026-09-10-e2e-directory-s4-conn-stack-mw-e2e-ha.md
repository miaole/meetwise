# 审查 — E2E 目录 S4 conn-stack · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗主审；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT）  
**切片**：S4 only（`scripts/conn-stack/` + legacy thin forwarders；不 mass-move 场景；不缩 LIVE）  
**Harness**：`ai-docs/delivery/harness/e2e-directory-s4-conn-stack.md`  
**对照**：ADR D1/D2/D4 · §4/§11 · `e2e-directory-target-structure.md` §3.1/§6 · `testing/conventions/e2e-directory-contract.md` · S3 CLEARED · rag spot `…-s4-conn-stack-mw-rag-route-spot.md`（pass）  
**releaseEvidence=false** · **Not HA** · **shim/conn-stack 绿 ≠ HA** · **≠ covered** · **连通绿 ≠ E2E** · **静态绿 ≠ live E2E** · **LIVE 未缩**

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass** |
| Harness R1–R11（本域） | **通过**（见下；反对项均为非阻塞 nit） |
| LIVE Set | **未缩**（仍三元 `{e2e:prove, e2e:ui, performance:e2e}`；无 mysql-stack/conn-stack） |
| conn-only 车道 | **成立**：`isConnOnlyTarget` 含 `mysql-stack:` **或** `conn-stack:`；`proveShell=false`；∉ LIVE |
| layout fail-closed | **成立**（缺 `scripts/conn-stack/` → `checkConnStackLayoutRequired` 报 `missing_dir` + bodies missing；已进 `checkDirectoryContract`） |
| 是否批 HA / covered | **否**（明确拒绝） |
| S0–S4 文档切片闭环 | **本域 + rag spot 均 pass → 文档切片链可闭环**（协调层双域齐后标 S4 done）；**≠** sole-stack cutover / ≠ 生产 HA / ≠ UC covered |
| 进入 S5 | **本域不反对**（仍须协调层确认双域齐；一次一切片；勿把本绿写成 HA） |

---

## 阻塞与反对项

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| — | **阻塞** | （无）本切片无成立阻塞项 | **无阻塞** |
| O1 | **反对 / nit（不降级）** | `directory-contract.mjs` → `checkIsolatedLayoutRequired` 源码正则仍只强制 `startsWith('mysql-stack:')`，**未**静态要求源码含 `startsWith('conn-stack:')`。运行时 `isConnOnlyTarget` 已含两者（STATIC_B1 绿）；若有人删掉 `conn-stack:` 分支，platform check **不一定**红。 | **不降级**；与 rag spot nit 同构。建议后续切片把 `conn-stack:` 前缀写入静态钉（fail-closed 补强）。 |
| O2 | **反对 / nit（不降级）** | 契约 MD 文首写「**S4 conn-stack done** · 待独立审」——在双域审归档前用词略超前；ADR §11 仍正确为 **in progress / done-when-proves-green**（不自批 covered）。 | **不降级**；协调层标 done 时建议把契约 MD 与 ADR §11 对齐为「独立审归档后 done」。 |
| O3 | **立场钉（非缺陷）** | `mysql-stack:*:prove` / `conn-stack:*:prove` EXIT=0 **不得**记为业务 E2E covered / sole-stack cutover / R5 已关 / RAG 已迁 / 生产 HA。 | **强制遵守**；本审不批任何 covered/HA。 |

**冲突取更严**：若协调层或另一域升格 O1 为条件项，以更严为准。本域判定 O1 为 nit（主别名 `mysql-stack:*` 已钉；`conn-stack:` 为可选别名且运行时已覆盖）。

---

## 声称核验（独立 · 不采信 PENDING 自报）

| 声称 | 独立结果 |
|------|----------|
| `scripts/conn-stack/` + legacy forwarders | **成立**。8 bodies 在 `scripts/conn-stack/`；8× `scripts/mysql-stack.*.proof.mjs` 各 ~10 行，均 `import './conn-stack/…'` |
| `isConnOnlyTarget` 含 `mysql-stack:` **或** `conn-stack:` | **成立**（源码 + STATIC_B1） |
| `checkConnStackLayoutRequired` | **成立**；`REQUIRED_CONN_STACK_FILES` / `FORWARDERS`；委托启发式 + forwarder size 守卫；挂入 `checkDirectoryContract` |
| harness `e2e-directory-s4-conn-stack.md` | **存在**；含 rollback；硬禁连通冒充 covered |
| LIVE 未缩 | **成立**（runner Set + `targets-live-e2e.mjs` 同三元；无 conn 成员） |

### Harness 勾选（抽查）

| ID | 结果 |
|----|------|
| R1 目录落盘 | PASS |
| R2 别名不破 | PASS（`mysql-stack:skeleton|r5-mark-red:prove`；可选 `conn-stack:skeleton:prove`） |
| R3 薄 forwarders | PASS（≤~2500B；均委托 conn-stack） |
| R4 conn-only forever | PASS（samples：connOnly=true · proveShell=false） |
| R5 NEVER LIVE | PASS（Set 三元；无 mysql-stack/conn-stack） |
| R6 无 mass-move | PASS（`e2e/*.e2e.ts` 未搬；conn-stack 仅 mysql-stack.* bodies） |
| R7 platform/inventory 绿 | PASS（见 CMD 表） |
| R8 harness + rollback | PASS |
| R9 ADR S4 状态 | PASS（§11 done-when-proves-green · 不自批 covered；O2 仅契约 MD 用词 nit） |
| R10 非 UI · 禁连通冒充 | PASS（文档仍钉 HTTP/SSE；F-CONN 永不 covered） |
| R11 directory-contract 钉 | PASS（checkConnStackLayoutRequired + 既有 NEVER LIVE / NEVER prove-shell；O1=conn-stack 前缀静态钉缺口） |

---

## 旁证 CMD + EXIT（本审复跑）

| CMD | EXIT | 解读 |
|-----|------|------|
| `test -d scripts/conn-stack` / bodies / legacy forwarder / harness | **0** | 显式区 + forwarder + harness |
| `pnpm e2e-platform:check` | **0** | 合同+conn-stack 钉；≠ live；≠ HA |
| `pnpm e2e-platform:prove` | **0** | 5 guards；≠ live |
| `pnpm e2e-case-inventory:prove` | **0** | 静态 inventory；≠已迁 |
| STATIC_B1（`mysql-stack:ping\|skeleton\|r5-mark-red:prove` · `conn-stack:skeleton:prove`） | **0** | 全员 `connOnly=true` · `proveShell=false` · `live=false`；LIVE 三元仍 live |
| `pnpm mysql-stack:skeleton:prove` | **0** | 连通/静态；**≠ covered** |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | mark-red 诚实钉；**≠ RAG migrated** |
| `pnpm conn-stack:skeleton:prove` | **0** | 直指 body；**≠ covered** |
| `checkConnStackLayoutRequired(tmp_without_dir)` | errors>0 | fail-closed：`missing_dir:scripts/conn-stack` |
| live `e2e:isolated` / UI / performance | **N/A** | 禁止计入本切片 |

LIVE 字面：`scripts/run-e2e-isolated.mjs` L47 = `new Set(['e2e:prove','e2e:ui','performance:e2e'])`；`targets-live-e2e.mjs` `LIVE_E2E_TARGET_LIST` 同构。

---

## S0–S4 文档切片闭环（本域）

| 切片 | 状态（本域视角） |
|------|------------------|
| S0 ADR | done（既有审） |
| S1 LIVE whitelist | done |
| S2 contract | done |
| S3 shim | CLEARED（双域 pass → 批进 S4） |
| S4 conn-stack | **本域 pass**；rag spot **pass** → **文档切片可闭环**（协调层更新 PENDING→CLEARED / ADR §11 done） |

**明确非闭环**：生产 100% HA、sole-stack 宽 E2E 默认、R5 退役、UC-E2E covered、releaseEvidence。

---

## 非宣称（硬禁）

- 不批 **HA** / **covered** / **releaseEvidence=true**
- 不以 conn-stack / mysql-stack / platform 绿冒充 live E2E 或 sole-stack cutover
- 不批准缩小 `LIVE_E2E_TARGETS`、不批准 mass-move `e2e/*.e2e.ts` / 业务 prove
- 不把本审当作 S5 自动开工令（一次一切片；另开 harness）

---

## reviews 路径

`ai-docs/delivery/reviews/2026-09-10-e2e-directory-s4-conn-stack-mw-e2e-ha.md`
