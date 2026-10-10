# Review — E2E 目录重构 S2（contract 扩容 · 无 mass-move）· mw-e2e-ha

**审稿人**：mw-e2e-ha（独立；实现方不自审；不采信自报）  
**日期**：2026-09-10（PT）  
**切片**：S2 only（契约 MD + `directory-contract.mjs` FUTURE/doc pins + harness；**不**改 `LIVE_E2E_TARGETS` 行为；**无** mass-move / **无**建 `scripts/isolated/` 偷跑 S3）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E** · **静态绿 ≠ live E2E**

**对照**：
- `delivery/harness/e2e-directory-s2-contract.md`
- `testing/conventions/e2e-directory-contract.md`（S2 扩容）
- `delivery/adr-e2e-directory-restructure.md` D1–D6 · §4 S2 · §9
- `delivery/e2e-directory-target-structure.md` §4.1 · §6 S2（意见）
- S1 whitelist：`delivery/e2e-live-targets-whitelist.md`
- S1 审查：`reviews/2026-09-10-e2e-directory-s1-live-whitelist-mw-e2e-ha.md`（已批准进 S2）
- `scripts/e2e-platform/directory-contract.mjs`

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass** |
| Harness 词汇 | **pass** |
| 对抗立场 | 主动猎假绿 / 目录混乱 / 冒充 covered；不采信实现方自报；冲突以更严为准 |
| **阻塞与反对项** | **无阻塞**（详见专节；抽查 A1–A8 均未成立） |
| 双域 | mw-e2e-ha（本审）+ mw-rag-route spot（`reviews/2026-09-10-e2e-s2-contract-mw-rag-route-spot.md` · **pass**）· **无更严冲突** |
| **是否批准进入 S3（shim / 拆壳）** | **是 · 批准** |
| releaseEvidence | false（本审不构成发布证据） |

S2 交付为契约扩容：LIVE · prove-shell · conn-only 三车道齐全；非 UI HTTP/SSE primary；UI secondary；cite S1 白名单；mysql-stack ∈ conn-only 永不 covered（BUG-FAKE-CONN）；R5/pgvector 诚实（BUG-FAKE-R5）；FUTURE `scripts/isolated/` · `scripts/conn-stack/` 仅允许叙述；mjs `REQUIRED_CONTRACT_DOC_PINS` fail-closed；FUTURE 文件**未**进 `REQUIRED_RUNNERS`。**未**改 `LIVE_E2E_TARGETS`（仍三元）；**未**建 isolated/conn-stack；**未** mass-move `e2e/` / runners。

---

## Harness R1–R10

| ID | 结果 | 注 |
|----|------|----|
| R1 契约 MD 扩容落盘 | **pass** | `e2e-directory-contract.md` 含车道节 / 硬钉 / FUTURE dirs |
| R2 LIVE · prove-shell · conn-only | **pass** | 三车道表齐全；含 package/脚本语义；后缀 `*:prove` 不得抹平 |
| R3 非 UI 为主；UI secondary | **pass** | HTTP/SSE primary；`apps/web/e2e-ui` / `e2e:ui` = secondary / LIVE_OPTIONAL_UI |
| R4 LIVE 白名单引用 | **pass** | cite `e2e-live-targets-whitelist.md`；主集 ⊆ `{e2e:prove, performance:e2e}` |
| R5 禁 mysql-stack 为 LIVE | **pass** | conn-only 行 = 全部 `mysql-stack:*`；永不 covered；BUG-FAKE-CONN |
| R6 R5 / pgvector 假绿诚实 | **pass** | BUG-FAKE-R5 · `E2E_PG_IMAGE` legacy；sole-stack 未迁 → green-risk |
| R7 允许 FUTURE dirs 叙述 | **pass** | MD + mjs `FUTURE_ISOLATED_*` / `FUTURE_CONN_STACK_DIR`；今日可不存在 |
| R8 可执行合同兼容 | **pass** | `e2e-platform:check|prove` EXIT=0；`layout:prove` 种植仍能失败（本审复跑） |
| R9 无 mass-move / 无 LIVE Set 行为改 | **pass** | Set 仍 `{e2e:prove, e2e:ui, performance:e2e}`；无 isolated/conn-stack 目录 |
| R10 harness + ADR S2 状态 | **pass** | harness 落盘；ADR 文首/§4/§9 标 S2 contract done；独立审栏本审前为「待」（正确） |

**无 reject 项。**

---

## 硬钉对齐

| 硬钉 | 核查 | 结果 |
|------|------|------|
| LIVE / prove-shell / conn-only 分层诚实 | 契约 §评测车道表；whitelist cite；mjs 12 pins | **pass** |
| 非 UI 主；mysql-stack∉LIVE；R5 诚实 | 硬钉表 + conn-only 行 + BUG-FAKE-R5 | **pass** |
| `LIVE_E2E_TARGETS` 未改 | `rg` L40：`new Set(['e2e:prove', 'e2e:ui', 'performance:e2e'])`；diff **无** Set 行变更 | **pass** |
| 无 `scripts/isolated/` / `scripts/conn-stack/` | `test ! -d` → absent_exit=0；未偷跑 S3+ | **pass** |

---

## 偷跑 / 范围诚实性

| 核查 | 结果 |
|------|------|
| `scripts/isolated/` | **不存在**（S3 目标；仅契约允许叙述） |
| `scripts/conn-stack/` | **不存在**（S4 目标） |
| `scripts/run-e2e-isolated.mjs` | **仍在原路径**；`REQUIRED_RUNNERS` 仍锁今日五路径 |
| `FUTURE_ISOLATED_FILES` 是否误入必存在 | **否** — `REQUIRED_RUNNERS_has_future=false`；`checkFutureLayoutOptional` 缺席 OK |
| `LIVE_E2E_TARGETS` | **未改**（仍三元，含 `e2e:ui`） |
| `e2e/` | 仍扁平：`full.e2e.ts` · `performance.e2e.ts` · `ocr-fixture.ts` · `helpers/` — 无领域子树 |
| mass-move | **未做**（契约/mjs 扩容 only） |

**旁注（不记入 S2 失败）**：工作区 `scripts/run-e2e-isolated.mjs` / `run-e2e-performance-suite.mjs` 另有与本片无关的 WIP（R5-MARKED-RED banner、uc017/uc002/uc015 域 prove 挂入、性能 suite 步骤 LEGACY 标注）。**未**改动 `LIVE_E2E_TARGETS` Set，**不是**目录重构拆壳 / mass-move / UI 升格。同 S1 旁注纪律。

---

## 声称旁证（复跑 · ≠ live E2E）

不采信实现方自报；下表为本审 **复跑** EXIT。

| CMD | EXIT | 解读 |
|-----|------|------|
| `test -f` 契约+harness+ADR+白名单 | **0** | 对照路径齐（CONTRACT_MD_OK · HARNESS_S2_OK · ADR_OK · WHITELIST_OK） |
| `test ! -d scripts/isolated`；`test ! -d scripts/conn-stack` | **0**（absent） | 未偷建 S3/S4 目录 |
| node 契约车道静态检查（harness 可选 A） | **0** | 12/12 钉 OK；≠ live；≠ 已迁 |
| fail-closed spot（缺 pin / pins 坍缩 / 原文漂移） | **0** | `doc_pin_missing` · `doc_pins_collapsed`；漂移去 BUG-FAKE-CONN → 必红 |
| `pnpm e2e-platform:check` | **0** | 合同兼容；directoryErrors=0；≠ live |
| `pnpm e2e-platform:prove` | **0** | 5 守卫（含 directory-contract）；≠ live |
| `pnpm e2e-platform:layout:prove` | **0** | 9 scenarios；种植违规能失败；≠ skip-as-pass |
| `pnpm e2e-case-inventory:prove` | **0** | 静态 inventory/假绿钉；≠ 已迁；≠ live E2E |
| `mysql-stack:*` / `e2e:isolated` / `e2e:ui:isolated` / `performance:e2e:isolated` | **N/A** | 禁止计入本切片成功（未跑） |

---

## 与 ADR / 意见稿 / S1

- ADR §4 S2 / §9：docs/contract done；行为未改；FUTURE 未建；独立审通过前方可 S3 — **与本审一致**（本审归档后实现方应把 §9「独立审 · 待」回填为 pass + 批准 S3）。
- 意见稿 §4.1 / §6 S2：先契约后搬文件；允许 `scripts/isolated/` 叙述 — **align**。
- S1 白名单 + S1 review 批准进 S2 — **前置满足**。
- Contract 扩容未抢跑 S3 git mv — **符合一次一切片**。

---

## S3 前置

| 前置 | 状态 |
|------|------|
| S1 独立审通过并批准 S2 | **满足**（S1 review） |
| S2 契约 MD + mjs FUTURE/doc pins + harness 落盘 | **满足** |
| LIVE / prove-shell / conn-only / 非 UI / 禁 mysql-stack LIVE / R5 诚实 | **满足**（对抗抽查见下） |
| 未偷改 LIVE Set / 未 mass-move / 未建 isolated·conn-stack | **满足** |
| platform check/prove/layout 兼容且 layout 种植能失败 | **满足**（复跑） |
| 双域齐全（≥2 · S2 含 mw-rag-route spot） | **满足**（spot pass；无冲突） |

→ **批准进入 S3**（`run-e2e-isolated.mjs` → `scripts/isolated/run-isolated.mjs` + 薄 shim；拆 `targets-live-e2e` / `targets-domain-prove`）。S3 完成后须再独立审（≥2 域），方可进 S4（conn-only 区）。**禁止**把本审静态绿写成 sole-stack / live E2E / 发布证据。

---

## 阻塞与反对项（对抗 · 必填）

**结论栏：无阻塞 / 无反对项（内容面）。** 不阻止 S3。  
冲突规则：若他域更严则以其为准；本片 **mw-rag-route spot = pass**，与本审 **无冲突**，故整片不升级为 conditional/block。

### 主动猎假绿 / 冒充 covered / 目录混乱（抽查清单）

| # | 反对假设（实现方可能偷渡） | 抽查动作 | 结果 |
|---|---------------------------|----------|------|
| A1 | 三车道抹平 / 只列 LIVE | 契约评测车道表含 LIVE · LIVE_OPTIONAL_UI · prove-shell · conn-only · static；mjs pins 含三车道标签 | **未成立** |
| A2 | UI 写成主评测 | 硬钉 + LIVE_OPTIONAL_UI = 次要；否（主评测） | **未成立** |
| A3 | mysql-stack 进 LIVE / covered | LIVE 行无 mysql-stack；conn-only = 全部 mysql-stack:* · Never covered · BUG-FAKE-CONN | **未成立** |
| A4 | 删 R5 诚实 / 声称 sole-stack 已迁 | BUG-FAKE-R5 · pgvector legacy · green-risk 仍在；inventory prove 仍钉 R5 | **未成立** |
| A5 | 声称已拆壳 / 已建 isolated 却无文件 / 或偷建并宣称 S3 done | `scripts/isolated`/`conn-stack` **absent**；ADR §9 明示未建；FUTURE 非 REQUIRED_RUNNERS | **未成立** |
| A6 | 改 `LIVE_E2E_TARGETS` 或 mass-move | Set L40 仍三元；git diff Set 行无变更；`e2e/` 仍扁平；runners 仍根路径 | **未成立** |
| A7 | contract 扩容假绿 / skip-as-pass | 复跑 check/prove/layout=0；layout 种植场景显式失败路径；缺 pin → `doc_pin_missing`；pins 坍缩 → `doc_pins_collapsed` | **未成立** |
| A8 | 用 mysql-stack / live e2e 绿顶替本片；或双域缺失放行 | 旁证仅静态；**未跑** mysql-stack/live isolated；rag-route spot 已落且 pass | **未成立** |

### 非阻塞提醒（不得误读为反对）

1. runner 工作区 WIP（UC prove / R5 banner / suite LEGACY 标签）≠ S2 范围；**禁止**据此声称「runner 已为目录重构改完 / S3 已做」。  
2. LIVE primary 包装仍吃 BUG-FAKE-R5 pgvector 默认夹具 — 契约已标 green-risk；**禁止**把夹具绿写成 sole-stack / covered（与 rag-route nit 同向）。  
3. ADR §9「独立审 · 待」在双域归档后应由实现方回填「mw-e2e-ha pass + rag-route spot pass · 批准 S3」— 文档回填，非交付缺口。  
4. mjs 对「mysql-stack 当 LIVE 行并列表述」的正则禁令偏窄；主防线仍是 MD 车道表 + whitelist cite + pins。S3 改 runner 时勿削弱 doc pins。

### 采信边界

不采信实现方 harness「可选静态 prove」自报；上表旁证均为本审 **复跑** EXIT。不以本审或 spot 勾 `releaseEvidence=true`。

---

## 归档

- 本文件：`ai-docs/delivery/reviews/2026-09-10-e2e-directory-s2-contract-mw-e2e-ha.md`
- 第二域：`ai-docs/delivery/reviews/2026-09-10-e2e-s2-contract-mw-rag-route-spot.md`（pass）
- 结论：**pass** · **批准 S3** · releaseEvidence=false · Not HA
