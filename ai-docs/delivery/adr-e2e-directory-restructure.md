# ADR — E2E 目录重构（非 UI 为主 · 对齐 mw-e2e-ha 目标结构意见）

**状态**：active（S0–S4 **CLEARED** · LIVE Set 未缩） · **releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁 / ≠ cutover** · **连通绿 ≠ E2E / ≠ HA** · **未声称 covered**  
**切片进度**：S0→S1→S2→S3→**S4 CLEARED**（双域 pass：e2e-ha + rag spot；`reviews/2026-09-10-e2e-directory-s4-CLEARED.md`）。  
**硬禁仍有效**：**禁止** mass-move `e2e/*.e2e.ts` / 业务 `*.proof.ts`；**禁止**无 dual approval 缩小 `LIVE_E2E_TARGETS`；**禁止** mysql-stack/conn-stack 绿冒充 E2E covered/HA。  
**权威意见稿**：`e2e-directory-target-structure.md`（mw-e2e-ha）  
**引用契约**：`testing/conventions/e2e-directory-contract.md`（S3+S4 演进目录已回填）  
**S1 白名单**：`e2e-live-targets-whitelist.md`  
**实现方不自批**：后续切片仍须 ≥2 域对抗审；S4 nits O1–O3 跟进中。

---

## 0. 硬钉（与意见稿 §0 同构）

| 钉 | 裁定 |
|----|------|
| 主评测路径 | **HTTP / SSE / API 非 UI E2E**（`e2e/*.e2e.ts` + `scripts/run-e2e*.mjs`）+ **prove 纪律**（域集成 / 负路径 / 静态门） |
| UI | `apps/web/e2e-ui/` + `scripts/run-e2e-ui.mjs` = **次要**；不得写成唯一全链路 / 主评测 |
| 目录契约 | `e2e/` 根下**只允许**目录 `helpers/`；场景扁平 `*.e2e.ts`；**禁止** `booking/` 式领域树 |
| 假绿 | **禁止** `mysql-stack` skeleton/ping/m2–m5 连通绿冒充 E2E / covered（**BUG-FAKE-CONN**） |
| R5 | 默认 `E2E_PG_IMAGE=pgvector/pgvector:pg16` = **legacy fixture**（**BUG-FAKE-R5**）；本地绿 ≠ sole-stack / ≠ RAG 已迁 |
| 证据 | `releaseEvidence=false`；静态 platform 绿 ≠ live E2E |

---

## 1. 背景 — 采纳意见稿混乱点（有序）

实现方确认并采纳 `e2e-directory-target-structure.md` §2：

1. **`run-e2e-isolated.mjs` 名实不符（最大）** — 实为「临时 PG cluster + 任意 pnpm target」通用隔离壳；~96 域 prove 与 3 个 live E2E 共用；易把 `memory:prove` 当成业务 E2E covered。  
2. **默认夹具仍绑 pgvector（BUG-FAKE-R5）** — 宽 E2E / 多数 isolated prove = green-risk。  
3. **prove vs e2e vs 连通后缀抹平** — 同一 `:prove` 覆盖静态门、域集成、live E2E、mysql-stack 连通。  
4. **入口叠床架屋** — 性能三入口；静态 `e2e-platform*` / `e2e-static-guards*` / `e2e-parity*` / inventory prove 并列。  
5. **UI 与 LIVE 同级** — `e2e:ui` 进 `LIVE_E2E_TARGETS` 与 `e2e:prove` 并列，易升格主评测。  
6. **壳叙事 =「重建 schema 的 E2E」** — 文件头以 E2E 举例却被 memory/RAG/privacy 复用。  
7. **平台静态门与 live 前缀相邻** — `e2e-platform:*` vs `e2e:isolated`。  
8. **连通绿仍挂 `*:prove`** — F-CONN 文档已钉，脚本扫一眼仍像评测通过。  
9. **场景树相对干净** — 混乱在 `scripts/` 巨石 + package.json 别名，不在 `e2e/*.e2e.ts`。  
10. **合同锁定与演进张力** — 须**先扩 contract 再迁文件**。

---

## 2. 决策

### D1 — 主层 / 次层 / 永不 E2E

| 车道 | 含义 | 入口 | 目录 |
|------|------|------|------|
| **Primary · 非 UI live** | HTTP/SSE 业务旅程 | `e2e:prove` / `e2e:isolated`（过渡名）→ `e2e/full.e2e.ts`；`performance:e2e` | `e2e/*.e2e.ts` + `e2e/helpers/` |
| **Prove 纪律** | 域集成 / 负路径 / 合同（≠ 全链路 covered） | `*:prove` via 隔离壳 | 包内 `*.proof.ts`（共址保留） |
| **Secondary · UI** | cookie / 页面 / 移动布局 | `e2e:ui` / `e2e:ui:isolated` | **`apps/web/e2e-ui/`**（不升格） |
| **Never E2E** | 连通 / 静态钉 | `mysql-stack:*` → 目标 `conn-stack:`；`e2e-platform:*` | `scripts/conn-stack/`（S4）· `scripts/e2e-platform/` |

### D2 — 目标目录树（与意见稿 §3.1 **align**；场景保持扁平）

```text
e2e/                              # 仅 HTTP/SSE 非 UI 客户端（contract 锁定）
  helpers/                        # 可复用原语 + e2e-helpers.proof.ts
  *.e2e.ts                        # 扁平场景（full / performance / 未来 UC）
  *-fixture.ts                    # 夹具（ocr 等）

apps/web/e2e-ui/                  # 次要 Playwright（勿升格主评测）

scripts/
  run-e2e.mjs                     # 非隔离：已有 DB → e2e/full.e2e.ts
  run-e2e-performance*.mjs        # 性能场景（spawn e2e/performance.e2e.ts）
  run-e2e-ui.mjs                  # 次要 UI（保留，文档降级）
  isolated/                       # 【S3 目标】通用隔离壳（不再叫 run-e2e-isolated）
    run-isolated.mjs              # 起临时 DB cluster → spawn 任意 target
    targets-live-e2e.mjs          # 仅 LIVE 白名单（S1 先文档化）
    targets-domain-prove.mjs      # 域 prove 白名单（非 E2E covered）
  e2e-platform/                   # 静态目录契约 / 信任守卫（≠ live）
  conn-stack/                     # 【S4 目标】mysql-stack.* 连通/静态（显式 conn-only）

ai-docs/
  testing/conventions/e2e-directory-contract.md
  delivery/e2e-directory-target-structure.md   # mw-e2e-ha 意见稿
  delivery/adr-e2e-directory-restructure.md    # 本 ADR
  delivery/e2e-case-inventory.md               # F-* 家族 × 假绿
```

**明确不做**：在 `e2e/` 下建 `http/` 或领域子树（与意见稿/contract 冲突）。重构重心 = **拆壳 + 命名/白名单 + conn-only 区**，不是搬场景文件。

### D3 — Fixture profiles（夹具诚实；跟 M5，不自批 cutover）

| Profile | 栈 | 今日 | 不得冒充 |
|---------|----|------|----------|
| `legacy-pgvector` | `E2E_PG_IMAGE=pgvector…` | **默认**（R5-MARKED-RED） | sole-stack 已迁 · RAG cutover · 发布 covered |
| `sole-stack` | MySQL + Qdrant + Redis | 未接线为宽 E2E 默认 | （目标态） |
| `redis-bypass` | Redis Streams 旁路 | wakeup 原型 | 生产 wakeup 已切 |
| `none/static` | 无业务栈 | platform / inventory / mysql-stack | **任何**业务 E2E |

### D4 — 命名纪律（意见稿 §3.2）

| 前缀/后缀 | 含义 | 业务 covered？ |
|-----------|------|----------------|
| `e2e:*` / `e2e/*.e2e.ts` | HTTP/SSE **live** | 仅 UC 断言 + 夹具诚实；未迁 sole-stack → 最多 partial/green-risk |
| `e2e:ui*` | Playwright 次要 | **否**（主评测） |
| `e2e-platform:*` | 静态门 | 永不 live covered |
| `*:prove`（域包） | 集成/合同/负路径 | partial 旁证；≠ 全链路 E2E |
| `isolated:*` / `run-isolated` | **夹具壳**（S3） | 永不单独 covered |
| `mysql-stack:*` / `conn-stack:*` | 连通/文档 | **永不** covered |

### D5 — LIVE 白名单（S1 文档钉；行为后移）

今日代码：`LIVE_E2E_TARGETS = {e2e:prove, e2e:ui, performance:e2e}`。

**ADR 裁定**：

- **Live E2E（主评测集合）** ⊆ `{e2e:prove, performance:e2e}`（HTTP/SSE）。  
- **`e2e:ui`**：保留可跑，但文档/inventory/矩阵标 **secondary**；**S1 已钉**不得与主评测同级叙述（见 `e2e-live-targets-whitelist.md`）；后续可移出 LIVE 集或标 `LIVE_OPTIONAL_UI`（另切片，**仍不改代码**直至该片）。  
- 其余经 isolated 的 `*:prove` = **域 prove / 壳复用**，**不是** live E2E covered。

### D6 — 兼容期

| 机制 | 规则 |
|------|------|
| 脚本名 | S0–S2：**不改** `e2e:isolated` / 全部 `*:prove` / `:legacy`；S3 起 `e2e:isolated` 可仍指向 shim |
| 文件路径 | S3：**保守落地** — `scripts/isolated/run-isolated.mjs` 薄 forward → legacy `run-e2e-isolated.mjs`（实现宿主 + R5/static 钉）；完整 body `git mv` 延后至扫描钉同步片；旧路径 / 别名保留 |
| Contract | **先扩** `directory-contract.mjs` / md（S2），再 `git mv`（S3/S4） |
| 覆盖矩阵 | 路径列对齐 **later**（意见稿未强制本片）；本片不改矩阵行 |
| 退役 | shim / 旧名删除须 mw-e2e-ha ack + `e2e-platform:check|layout:prove` =0 |

---

## 3. 与意见稿 diff 表（必填 · 供 §7 复审）

| # | 主题 | 意见稿（`e2e-directory-target-structure.md`） | 本 ADR | 关系 |
|---|------|-----------------------------------------------|--------|------|
| 1 | 主评测 | HTTP/SSE 非 UI + prove 纪律 | 同左（D1） | **align** |
| 2 | UI | `apps/web/e2e-ui/` 次要 | 同左；明确勿与 LIVE 主集同级叙述 | **align** |
| 3 | `e2e/` 树 | 扁平 `*.e2e.ts` + 仅 `helpers/` | **不**建 `e2e/http/` 或领域子树 | **align** |
| 4 | 隔离壳 | 改名 `scripts/isolated/run-isolated.mjs` + LIVE/域白名单拆分 | 采纳；S3 执行，S0/S1 先文档 | **align** |
| 5 | LIVE 集 | 仅登记 live；UI 至多可选次要 | 主集 ⊆ `{e2e:prove, performance:e2e}`；`e2e:ui` 次要（S1 钉，S0 不改代码） | **align**（行为延后） |
| 6 | conn-only | `scripts/conn-stack/` + 命名空间 | 采纳为 S4 | **align** |
| 7 | 切片序 | S0 ADR → S1 LIVE 文档 → S2 contract → S3 shim 改名 → S4 conn-only（+S5/S6） | **原样采纳**为迁移序 | **align** |
| 8 | R5 / sole-stack | 跟 M5；不自批 cutover | D3 profiles；S6 另轨 | **align** |
| 9 | F-* inventory | 须同构或声明差异 | 继续以 `e2e-case-inventory.md` F-* 为家族键；脚本分区对称延后到 S3/S4 | **align** |
| 10 | 本片范围 | S0 = ADR；推荐立刻 S0+S1 | **仅 S0**（ADR+harness+gate 一行）；S1 另切片 | **align-with-nit**：S1 不塞进本片以免混 scope |
| 11 | 早期草案曾拟 `e2e/http/` | 意见稿拒绝领域/额外子树 | **撤回**；以扁平为准 | **align**（纠偏） |

**无 reject 项。** 唯一 nit：本切片边界 = S0 only（意见稿「优先 S0+S1」中的 S1 留给下一切片，保持「一次一切片」）。

---

## 4. 迁移阶段（= 意见稿 §6 切片）

| 序 | 切片 | 本 ADR 约束 | 搬代码？ |
|----|------|-------------|---------|
| **S0** | 本 ADR + harness + gate 钉非 UI 为主 | 本文；mw-e2e-ha 按 §7 / harness 复审 | **否** |
| **S1** | LIVE_E2E_TARGETS 文档化：白名单 + harness；UI 次要；禁 mysql-stack LIVE | **docs done**（`e2e-live-targets-whitelist.md`）；静态 cite prove；**不改行为**；runner 头注释/Set 改名延后 | 否（文档 only · 2026-09-10） |
| **S2** | 扩 `e2e-directory-contract` / `directory-contract.mjs`：车道 + 白名单 cite + 假绿禁 + 允许 `scripts/isolated/` 叙述 | **docs/contract done**（2026-09-10）；`e2e-platform:check|prove` 兼容；`layout:prove` 种植仍能失败；**不改行为** | 否（契约） |
| **S3** | 引入 `scripts/isolated/` 清晰入口 + `targets-live-e2e` / `targets-domain-prove`；legacy `run-e2e-isolated.mjs` **保留为实现宿主**（薄 forward：新→旧；完整 body mv 延后以免断 R5/static 钉） | package.json 别名不破；`REQUIRED_ISOLATED_FILES` + `checkIsolatedLayoutRequired`；**LIVE Set 未缩** | **shim done**（2026-09-10；待独立审） |
| **S4** | conn-only 命名空间：`scripts/conn-stack/` + 可选 `conn-stack:*`；mysql-stack 脚本迁显式区（legacy forwarders） | **S4 landed · dual-review CLEARED · ≠ covered/HA**（`reviews/2026-09-10-e2e-directory-s4-CLEARED.md`）；inventory F-CONN 对齐；冒充检测仍绿 | 连通脚本 only |
| S5 | 性能入口收敛文档（suite vs 单场景） | 可选 deprecate | 否优先 |
| S6 | R5 夹具轨道（跟 M5） | 不自批 cutover | 另轨 |

**原则（意见稿 §4）**：先契约后搬文件；场景树不动优先；壳与旅程分离；假绿显式化；platform fail-closed 保留；一次一切片；非 UI 优先于 UI 矩阵。

---

## 5. 非目标

- Playwright / `e2e:ui*` 升格主评测或发布唯一证据  
- `e2e/` 下建领域目录或 `e2e/http/`  
- mysql-stack 绿充 UC-E2E covered / sole-stack cutover  
- 删除 R5 marked-red 并声称已迁  
- `e2e-platform:loop` 进 always-on  
- 本 ADR 勾 `releaseEvidence=true` / HA  
- S0 改 runner 行为或 mass-move prove/e2e 文件  

---

## 6. 后果

- 审查语言与 mw-e2e-ha 意见稿 / F-* inventory / A–F harness **同构**。  
- 后续 S1–S4 可独立审、可回滚；S0 零行为风险。  
- UI 降级与 LIVE 白名单纪律写进 ADR；**S1 文档已钉**（`e2e-live-targets-whitelist.md`）；行为变更仍后移。  

## 7. 关联

| 路径 | 角色 |
|------|------|
| `e2e-directory-target-structure.md` | mw-e2e-ha 意见稿（本 ADR 对齐源） |
| `harness/e2e-directory-restructure.md` | 专家如何审 S0 |
| `e2e-live-targets-whitelist.md` | **S1** LIVE / prove-shell / conn-only 白名单 |
| `harness/e2e-directory-s1-live-whitelist.md` | 专家如何审 S1 |
| `harness/e2e-directory-s2-contract.md` | 专家如何审 S2（contract 扩容） |
| `harness/e2e-directory-s3-shim.md` | 专家如何审 S3（shim / 清晰入口 + rollback） |
| `e2e-case-inventory.md` · `harness/e2e-full-suite.inventory.md` | 家族 × 跑法 |
| `testing/conventions/e2e-directory-contract.md` | HTTP 目录合同（S2 扩容：车道 / 白名单 / 假绿 / FUTURE dirs） |
| `impl-review-gate.md` | 非 UI E2E primary 闸 |
| `m5-pgvector-fixture-retirement-plan.md` · `harness/r5-pgvector-fixture-mark-red.md` | R5 / S6 |
| `adr-mysql-qdrant-local.md` | sole-stack |

---

## 8. S1 状态回填（2026-09-10）

| 项 | 状态 |
|----|------|
| 切片 | **S1 docs done**（in-progress→done 于本回填） |
| 交付 | `e2e-live-targets-whitelist.md` · `harness/e2e-directory-s1-live-whitelist.md` |
| `LIVE_E2E_TARGETS` 行为 | **未改**（仍 `{e2e:prove, e2e:ui, performance:e2e}`） |
| mass-move / isolated 拆壳 | **未做**（S3） |
| 独立审 | **done** — mw-e2e-ha pass（`reviews/2026-09-10-e2e-directory-s1-live-whitelist-mw-e2e-ha.md`）+ rag spot；已批准进 S2 |
| releaseEvidence | false |

---

## 9. S2 状态回填（2026-09-10）

| 项 | 状态 |
|----|------|
| 切片 | **S2 contract done**（docs + 最小可执行钉） |
| 交付 | `testing/conventions/e2e-directory-contract.md`（车道 / 白名单 cite / 假绿 / FUTURE dirs）· `scripts/e2e-platform/directory-contract.mjs`（`REQUIRED_CONTRACT_DOC_PINS` · `FUTURE_ISOLATED_*` · `FUTURE_CONN_STACK_DIR`）· `harness/e2e-directory-s2-contract.md` |
| `LIVE_E2E_TARGETS` 行为 | **未改**（仍 `{e2e:prove, e2e:ui, performance:e2e}`） |
| `scripts/isolated/` · `scripts/conn-stack/` | S2 时点 **未建**（仅契约允许叙述；落地 = S3/S4） |
| mass-move / 场景树 | **未做**（S3） |
| platform 兼容 | 须 `e2e-platform:check|prove` EXIT=0；`layout:prove` 种植仍失败 |
| 独立审 | **done** — mw-e2e-ha pass + rag spot（`reviews/2026-09-10-e2e-directory-s2-contract-mw-e2e-ha.md`）；已批准进 S3 |
| releaseEvidence | false |

---

## 10. S3 状态回填（2026-09-10）

| 项 | 状态 |
|----|------|
| 切片 | **S3 shim done**（清晰入口 + 白名单模块；非 big-bang body mv） |
| 交付 | `scripts/isolated/run-isolated.mjs`（薄 forward → legacy）· `targets-live-e2e.mjs` · `targets-domain-prove.mjs` · `harness/e2e-directory-s3-shim.md` · 契约 MD / `directory-contract.mjs` REQUIRED isolated |
| package.json 别名 | **未破**（`e2e:isolated` 等仍 → `scripts/run-e2e-isolated.mjs`） |
| `LIVE_E2E_TARGETS` 行为 | **未缩**（仍 `{e2e:prove, e2e:ui, performance:e2e}`）；文档主集 ⊆ `{e2e:prove, performance:e2e}`；UI secondary |
| legacy impl | **保留** `scripts/run-e2e-isolated.mjs`（R5/static 扫描钉 + 实现宿主） |
| mass-move / `e2e/` 场景树 | **未做** |
| `scripts/conn-stack/` | **未建**（S4） |
| platform / inventory | 须 `e2e-platform:check|prove` EXIT=0；`e2e-case-inventory:prove` EXIT=0 |
| 独立审 | S3 **CLEARED**（e2e-ha + rag rereview pass）→ **已批准进 S4** |
| releaseEvidence | false |
| 回滚 | 见 `harness/e2e-directory-s3-shim.md`（git revert / 删 isolated + 还原 contract 钉；保留旧入口） |

---

## 11. S4 状态回填（2026-09-10）

| 项 | 状态 |
|----|------|
| 切片 | **S4 conn-stack** — **S4 landed · dual-review CLEARED · ≠ covered/HA**（实现方不自批 covered/HA） |
| 交付 | `scripts/conn-stack/mysql-stack.*.proof.mjs`（bodies）· legacy `scripts/mysql-stack.*.proof.mjs` 薄 forwarders · 可选 `conn-stack:*:prove` 别名 · `directory-contract.mjs` `checkConnStackLayoutRequired` · `harness/e2e-directory-s4-conn-stack.md` · 契约 MD / inventory F-CONN 对齐 |
| package.json | `mysql-stack:*:prove` **未破**（仍可走 legacy forwarder）；可选 `conn-stack:*` |
| `LIVE_E2E_TARGETS` | **未缩**（仍 `{e2e:prove, e2e:ui, performance:e2e}`） |
| mysql-stack 车道 | **仍** NEVER LIVE · NEVER prove-shell · NEVER covered（`isConnOnlyTarget` 含 `mysql-stack:` + `conn-stack:`；**连通绿 ≠ covered/HA**） |
| mass-move 场景 / 业务 prove | **未做** |
| platform / inventory | 须 `e2e-platform:check|prove` EXIT=0；`e2e-case-inventory:prove` EXIT=0 |
| 独立审 | **CLEARED** — mw-e2e-ha + mw-rag-route spot pass；见 `reviews/2026-09-10-e2e-directory-s4-CLEARED.md` |
| releaseEvidence | false |
| 回滚 | 见 `harness/e2e-directory-s4-conn-stack.md` |

