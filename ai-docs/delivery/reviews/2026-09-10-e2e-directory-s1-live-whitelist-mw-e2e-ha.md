# Review — E2E 目录重构 S1（LIVE 白名单文档 only）· mw-e2e-ha

**审稿人**：mw-e2e-ha（独立；实现方不自审）  
**日期**：2026-09-10（PT）  
**切片**：S1 only（docs；不改 `LIVE_E2E_TARGETS` 行为；无 mass-move）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E** · **静态绿 ≠ live E2E**

**对照**：
- `delivery/harness/e2e-directory-s1-live-whitelist.md`
- `delivery/e2e-live-targets-whitelist.md`
- `delivery/adr-e2e-directory-restructure.md` D5 · §4 S1 · §8
- `delivery/e2e-directory-target-structure.md` §3.2 · §6 S1 · §7
- S0：`reviews/2026-09-10-e2e-directory-restructure-s0-mw-e2e-ha.md`（已批准进 S1）
- `testing/conventions/e2e-directory-contract.md`（相关：先契约后搬；本片不改树）

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass** |
| Harness 词汇 | **pass** |
| 对抗立场 | 主动猎假绿/冒充 covered；不采信实现方自报；冲突以更严为准 |
| **阻塞与反对项** | **无阻塞**（详见专节；抽查 A1–A7 均未成立） |
| 双域 | mw-e2e-ha（本审）+ mw-rag-route spot（pass）· **无更严冲突** |
| **是否批准进入 S2（contract 扩容）** | **是 · 批准** |
| releaseEvidence | false（本审不构成发布证据） |

S1 交付为文档钉：LIVE primary ⊆ `{e2e:prove, performance:e2e}`（+ isolated 包装）；UI = secondary；全部 `mysql-stack:*` = conn-only ≠ LIVE；三车道齐全；诚实承认代码 Set 仍三元。**未**改 runner LIVE 行为；**未**建 `scripts/isolated/` / `scripts/conn-stack/`；**未**搬迁 `e2e/` 场景树。

---

## Harness R1–R10

| ID | 结果 | 注 |
|----|------|----|
| R1 白名单落盘 | **pass** | `e2e-live-targets-whitelist.md` 存在 |
| R2 非 UI 为主 | **pass** | §0 / 1.A：HTTP/SSE primary = `e2e:prove` + `performance:e2e`；UI 不写主评测 |
| R3 LIVE 列表非空 | **pass** | 1.A 含 `e2e:prove` · `e2e:isolated` · `performance:e2e` · `performance:e2e:isolated` |
| R4 禁 mysql-stack LIVE | **pass** | §3 conn-only 列全族；Never LIVE；1.A 无 mysql-stack 行 |
| R5 三车道齐全 | **pass** | 1.A LIVE · §2 prove-via-isolated-shell · §3 conn-only；含 package.json 名 |
| R6 cite ADR + 意见稿 | **pass** | 文首 / §6：D5 · `e2e-directory-target-structure` |
| R7 代码 vs 文档差诚实 | **pass** | §0/§4：承认 Set 仍含 `e2e:ui`；S1 不改行为 |
| R8 无 runner 行为改 / 无 mass-move | **pass** | `LIVE_E2E_TARGETS` 仍三元；无 `scripts/isolated/` / `conn-stack/`；见「偷跑核查」 |
| R9 ADR S1 状态已更新 | **pass** | 文首 S1 docs **done**；§4 / §8 回填 |
| R10 本 harness 落盘 | **pass** | `harness/e2e-directory-s1-live-whitelist.md` |

**无 reject 项。**

---

## 硬钉对齐

| 硬钉 | 核查 | 结果 |
|------|------|------|
| LIVE primary ⊆ `e2e:prove` / `performance:e2e`（或文档定义 LIVE 集合） | 1.A 仅此二元 + isolated 包装；ADR D5 同构 | **pass** |
| UI secondary | 1.B：`LIVE_OPTIONAL_UI / secondary`；不得与主评测同级 | **pass** |
| `mysql-stack:*` = conn-only ≠ LIVE | §3 七脚本全列 F-CONN；禁止进 LIVE / covered / 发布 | **pass** |
| 非 UI 为主 | §0 主评测 = HTTP/SSE；非目标拒 UI 升格 | **pass** |
| 未改 runner LIVE / 未搬迁 | Set L40 仍 `{e2e:prove, e2e:ui, performance:e2e}`；无目录拆壳；`e2e/` 仍扁平 | **pass** |

---

## 偷跑 / 范围诚实性

| 核查 | 结果 |
|------|------|
| `scripts/isolated/` | **不存在**（S3 目标） |
| `scripts/conn-stack/` | **不存在**（S4 目标） |
| `scripts/run-e2e-isolated.mjs` | **仍在原路径** |
| `LIVE_E2E_TARGETS`（`rg` L40） | `new Set(['e2e:prove', 'e2e:ui', 'performance:e2e'])` — **未改** |
| `e2e/` | `full.e2e.ts` · `performance.e2e.ts` · `ocr-fixture.ts` · `helpers/` — 未建领域子树 |

**旁注（不记入 S1 失败）**：工作区 `scripts/run-e2e-isolated.mjs` 另有与本片无关的 WIP（R5-MARKED-RED banner、`uc017`/`uc002`/`uc015` 域 prove 挂入 isolated）。**未**改动 `LIVE_E2E_TARGETS` Set，**不是**目录重构拆壳 / mass-move / UI 升格。同 S0 旁注纪律：不否定「未改 LIVE 行为」；也不把静态绿当批准 S3 搬迁。

---

## 声称旁证（复跑 · ≠ live E2E）

路径自检 = harness「必选只读」`test -f` 链（无独立 pnpm 脚本名；本审以该链 EXIT=0 记）。

| CMD | EXIT | 解读 |
|-----|------|------|
| path self-check（`test -f` 白名单+harness+ADR+opinion+contract+S0） | **0** | 对照路径齐 |
| whitelist static（node/python 钉：非 UI · LIVE 非空 · 禁 mysql-stack 进 1.A · cite） | **0** | 文档钉未漂；≠ live；≠ 已迁 |
| `pnpm e2e-case-inventory:prove` | **0** | 静态 inventory/假绿钉；≠ 已迁；≠ live E2E |
| `pnpm e2e-platform:check` | **0** | 现行合同/信任未因 S1 docs 破坏；≠ live；≠ 批准搬迁 |
| `mysql-stack:*` / `e2e:isolated` / `e2e:ui:isolated` / `performance:e2e:isolated` | **N/A** | 禁止计入本切片成功（未跑） |

---

## 与 ADR / 意见稿 / contract

- ADR D5 / §4 S1 / §8：主集 ⊆ HTTP/SSE；UI secondary；docs done；行为未改 — **与白名单一致**。
- 意见稿 §3.2 / §6 S1：白名单文档化、不改行为 — **align**。
- Contract：本片不要求改 `e2e/` 树或 runners 锁定清单；S2 才扩 contract — **符合「先契约后搬文件」**；S1 不抢跑。

---

## S2 前置

| 前置 | 状态 |
|------|------|
| S0 独立审通过并批准 S1 | **满足**（S0 review） |
| S1 白名单 + harness 落盘且独立审过 | **本审满足** |
| LIVE / UI / mysql-stack 硬钉正确 | **满足**（对抗抽查见下） |
| 未偷改 LIVE Set / 未 mass-move | **满足** |
| 双域齐全（≥2 · S1 含 mw-rag-route spot） | **满足**（`reviews/2026-09-10-e2e-s1-live-whitelist-mw-rag-route-spot.md` · 结论 pass；与本审无冲突） |
| S2 范围仍为 contract 扩容（非 git mv） | ADR §4 已钉 |

→ **批准进入 S2（`e2e-directory-contract` / `directory-contract.mjs` 扩容草案）**。S2 完成后须再独立审（≥2 域），方可进 S3（shim / 拆壳）。

---

## 阻塞与反对项（对抗 · 必填）

**结论栏：无阻塞 / 无反对项（内容面）。** 不阻止 S2。  
冲突规则：若他域更严则以其为准；本片 **mw-rag-route spot = pass**，与本审 **无冲突**，故整片不升级为 conditional/block。

### 主动猎假绿 / 冒充 covered / 目录混乱（抽查清单）

| # | 反对假设（实现方可能偷渡） | 抽查动作 | 结果 |
|---|---------------------------|----------|------|
| A1 | 1.A LIVE primary 混入 `e2e:ui` 升格主评测 | 解析 §1.A 至 §1.B；脚本行仅 `e2e:prove` / `e2e:isolated` / `performance:e2e` / `performance:e2e:isolated`；**无** `e2e:ui` | **未成立** → UI 仅在 1.B secondary |
| A2 | 1.A / LIVE 表写入 `mysql-stack:*` 冒充 live | 1.A 文本无 `mysql-stack`；§3 七条 conn-only 全列 F-CONN + Never LIVE + BUG-FAKE-CONN | **未成立** |
| A3 | RAG/vector/memory `*:prove` 升 LIVE covered | §2 钉 prove-via-isolated-shell；明示「不是 HTTP/SSE 全链路 live E2E covered」；rag-route spot 同证 | **未成立** |
| A4 | 声称已移出 Set / 已拆壳 / 已迁 | 白名单 §4 诚实「仍三元」；`rg` L40 Set 仍含 `e2e:ui`；无 `scripts/isolated/` · `conn-stack/` | **未成立**（未假称已改） |
| A5 | 用 inventory/platform/mysql-stack 绿顶替本片 | 旁证仅静态 EXIT=0 记档；**未跑** mysql-stack / live isolated；文首钉静态绿≠live | **未成立** |
| A6 | S1 偷改 runner LIVE 行为 | `git diff` runner：仅 R5 banner + UC prove 挂入（域 WIP）；**未改** `LIVE_E2E_TARGETS` | **未成立**（LIVE 行为未改；WIP 旁注不记失败） |
| A7 | 双域缺失却单审放行 S2 | 复核 `*s1*rag*` spot 已落且 pass | **未成立** |

### 非阻塞提醒（不得误读为反对）

1. runner 工作区 WIP（UC prove / R5 banner）≠ S1 范围；**禁止**据此声称「runner 已为目录重构改完」。  
2. LIVE primary 包装仍吃 BUG-FAKE-R5 pgvector 默认夹具 — 白名单已标 green-risk；**禁止**把夹具绿写成 sole-stack / covered（与 rag-route nit 同向）。  
3. ADR §8「独立审待」在双域归档后应由实现方回填「mw-e2e-ha pass + rag-route spot pass · 批准 S2」— 文档回填，非交付缺口。

### 采信边界

不采信实现方 harness「可选静态 prove」自报；上表旁证均为本审 **复跑** EXIT。不以本审或 spot 勾 `releaseEvidence=true`。

---

## 归档

- 本文件：`ai-docs/delivery/reviews/2026-09-10-e2e-directory-s1-live-whitelist-mw-e2e-ha.md`
- 第二域：`ai-docs/delivery/reviews/2026-09-10-e2e-s1-live-whitelist-mw-rag-route-spot.md`（pass）
- 结论：**pass** · **批准 S2** · releaseEvidence=false · Not HA
