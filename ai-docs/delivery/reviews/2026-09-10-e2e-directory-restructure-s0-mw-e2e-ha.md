# Review — E2E 目录重构 S0（ADR/harness only）· mw-e2e-ha

**审稿人**：mw-e2e-ha（独立；实现方不自审）  
**日期**：2026-09-10（PT）  
**切片**：S0 only（文档；未搬迁）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E** · **静态绿 ≠ 批准搬迁**

**对照**：
- `delivery/e2e-directory-target-structure.md` §7
- `testing/conventions/e2e-directory-contract.md`
- `delivery/harness/e2e-directory-restructure.md`
- `delivery/adr-e2e-directory-restructure.md`（含 §3 diff 表）

---

## 结论

| 项 | 裁定 |
|----|------|
| 意见稿 §7.2 词汇 | **align-with-nits**（nit = 故意仅 S0，不与意见稿「立刻 S0+S1」捆绑；符合一次一切片） |
| 父代理要求词汇 | **pass** |
| **是否批准进入 S1（LIVE 白名单文档）** | **是 · 批准** |
| releaseEvidence | false（本审不构成发布证据） |

**Nit（不阻塞 S1）**：意见稿 §6 推荐「立刻 S0+S1」；ADR §3 #10 / §4 诚实把本片钉为 S0 only。属 scope 纪律，非冲突。S1 可立即开片（注释/文档钉 LIVE 白名单；**不改行为**）。

---

## §7.1 复审清单

| # | 检查项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 文首钉 releaseEvidence=false · Not HA · 非 UI 为主 · 引用 contract | **pass** | ADR 文首 + §0 |
| 2 | 拒绝 mysql-stack / skeleton / ping 冒充 E2E | **pass** | ADR §0 BUG-FAKE-CONN；§5 非目标 |
| 3 | 目标树保持 `e2e/` 扁平 + 仅 `helpers/` | **pass** | ADR D2；明确不做 `e2e/http/` / 领域子树 |
| 4 | 隔离壳与 live E2E 命名拆开 | **pass** | D2/D4；S3 → `scripts/isolated/run-isolated.mjs` |
| 5 | LIVE ⊆ HTTP/SSE；UI 至多次要 | **pass** | D5：主集 ⊆ `{e2e:prove, performance:e2e}`；`e2e:ui` secondary；S0 不改代码 |
| 6 | R5 / pgvector 默认仍 red ≠ 已迁 | **pass** | §0 · D3 · S6 另轨；不自批 cutover |
| 7 | 先契约后搬文件 | **pass** | D6 + §4：S2 扩 contract → S3/S4 `git mv` |
| 8 | 未把 UI 写主评测 / 发布唯一证据 | **pass** | D1 · §5；gate 一行钉非 UI 为主 |
| 9 | 与 inventory F-* 同构或声明差异 | **pass** | diff #9：家族键继续 inventory；脚本分区对称延后 S3/S4 |
| 10 | 下一切片可独立审、可回滚 | **pass** | §4 S0→S6；S1 边界清晰 |

**无 reject 项。**

---

## Harness R1–R9

| ID | 结果 | 注 |
|----|------|----|
| R1 ADR+harness 落盘 | pass | 两路径存在 |
| R2 非 UI 为主 | pass | ADR §0/D1；gate L15 |
| R3 目标树 = 意见稿 §3.1 | pass | 扁平；isolated/ + conn-stack/ 为目标态 |
| R4 diff 表 | pass | ADR §3；无 reject；1 nit 公开 |
| R5 迁移序 S0→S1→S2→S3→S4 | pass | 兼容期/shim 写清 |
| R6 混乱点覆盖 | pass | 壳名实不符列为最大项 |
| R7 禁连通冒充 | pass | BUG-FAKE-CONN / Never E2E |
| R8 本片无 mass-move | pass | 见下「偷跑核查」 |
| R9 gate 一行 | pass | `impl-review-gate.md` 钉非 UI E2E primary |

---

## 与 contract 对齐

- Contract 锁定：`e2e/` 仅 `helpers/`；场景扁平 `*.e2e.ts`；runners = `scripts/run-e2e*.mjs` 等 — **ADR 不要求本片改树**，与「先扩契约再 git mv」一致。
- 现状探测：`e2e/` = `full.e2e.ts` · `performance.e2e.ts` · `ocr-fixture.ts` · `helpers/` — 仍合规。
- **无**「先搬后修」或跳过 platform 门的方案。

---

## 偷跑 / 兼容期诚实性

| 核查 | 结果 |
|------|------|
| `scripts/isolated/` | **不存在**（S3 目标，未提前建） |
| `scripts/conn-stack/` | **不存在**（S4 目标） |
| `scripts/run-e2e-isolated.mjs` | **仍在原路径**（未改名搬迁） |
| `LIVE_E2E_TARGETS` | 仍为 `{e2e:prove, e2e:ui, performance:e2e}`（S0 承诺不改行为；属实） |
| `e2e/` 场景树 | 未搬迁 / 未建领域子树 |

**旁注（不记入 S0 失败）**：工作区另有与本片无关的 WIP（R5 banner、UC prove 入口挂入 isolated、package.json 脚本增补等）。该类改动**不是**目录重构 mass-move / 拆壳 / LIVE 行为变更；**不**用其否定 S0「未搬迁」声明，也**不**把静态绿当批准 S3 搬迁。

兼容期（ADR D6）：S0–S2 不改脚本名；S3 shim；先 contract 后 mv — **诚实**。

---

## Diff 表如实性

- ADR §3 逐条标 align；#10 **align-with-nit**（S0 only vs 意见稿优先 S0+S1）— 如实，未隐瞒。
- #11 撤回早期 `e2e/http/` 草案 — 纠偏透明。
- **无**把 `e2e-platform:check` / inventory prove 绿写成「已批准搬迁」或 cutover。

---

## 声称核对（旁证复跑 · ≠ live E2E）

| CMD | EXIT | 解读 |
|-----|------|------|
| `pnpm e2e-case-inventory:prove` | **0** | 静态 inventory/假绿钉未漂；≠ 已迁；≠ live E2E |
| `pnpm e2e-platform:check` | **0** | 现行目录契约/信任守卫未因 S0 破坏；≠ live E2E；≠ 批准搬迁 |
| `mysql-stack:*` / `e2e:isolated` / `e2e:ui:isolated` | **N/A** | 禁止计入本切片成功（未跑） |

路径自检：`ADR_OK` · `HARNESS_OK` · `OPINION_OK`。

---

## S1 前置

| 前置 | 状态 |
|------|------|
| S0 ADR + harness + gate 落盘且独立审过 | **满足** |
| 与意见稿/contract 无冲突 | **满足** |
| 未偷跑搬迁 | **满足** |
| S1 范围仍为文档/头注释（不改 `LIVE_E2E_TARGETS` 行为） | ADR §4 已钉 |

→ **批准进入 S1（LIVE 白名单文档化）**。S1 完成后须再独立审，方可进 S2（契约扩容）。

---

## 阻塞

**无阻塞。** 不阻止 S1。

（提醒，非阻塞）gate 措辞「主评测 = e2e:isolated / full.e2e / prove 家族」略把 prove 纪律与 live 主路径并列；与 ADR D1 车道表相比偏松，可在后续文档润色，不挡 S1。

---

## 意见稿 §7.3 回填建议

- 实现方 ADR：`ai-docs/delivery/adr-e2e-directory-restructure.md`
- harness：`ai-docs/delivery/harness/e2e-directory-restructure.md`
- 差异表：ADR §3
- 复审日期 / 审查人：2026-09-10 · mw-e2e-ha
- 结论：`align-with-nits`（映射父代理 **pass**；批准 S1）
