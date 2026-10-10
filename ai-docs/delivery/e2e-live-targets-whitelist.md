# LIVE_E2E_TARGETS 白名单（S1 · 文档钉）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E** · **静态绿 ≠ live E2E**  
**切片**：S1 docs · S2 contract · **S3 shim**（白名单模块落地；**仍不缩** Set）  
**权威**：`adr-e2e-directory-restructure.md` **D5** · `e2e-directory-target-structure.md` §3.2 / §6  
**契约**：`testing/conventions/e2e-directory-contract.md`  
**代码镜像**：`scripts/isolated/targets-live-e2e.mjs`（S3；须与 `LIVE_E2E_TARGETS` 三元对齐）  
**S3 harness**：`harness/e2e-directory-s3-shim.md`  
**交叉**：`e2e-case-inventory.md`（F-ISO / F-ISO-UI / F-PERF / F-CONN）

---

## 0. 硬钉

| 钉 | 裁定 |
|----|------|
| 主评测（non-UI primary） | HTTP/SSE live：`e2e:prove` → `e2e/full.e2e.ts`；`performance:e2e` → `e2e/performance.e2e.ts` |
| UI | `e2e:ui` = **secondary**（Playwright · `apps/web/e2e-ui/`）；可跑，**不得**与主评测同级叙述 / 发布唯一证据 |
| 今日代码 Set（**未改**） | `LIVE_E2E_TARGETS = {e2e:prove, e2e:ui, performance:e2e}`（`scripts/run-e2e-isolated.mjs`） |
| ADR 主集（文档纪律） | **Live E2E（主评测集合）** ⊆ `{e2e:prove, performance:e2e}`；`e2e:ui` 标 secondary / 可选 `LIVE_OPTIONAL_UI`（行为后移至后续切片） |
| Never LIVE | **一切** `mysql-stack:*` · `e2e-platform:*` · 域 `*:prove` 经隔离壳复用 · 静态 guards/parity/inventory prove |
| 假绿 | **禁止**把 mysql-stack / 连通 / 静态 platform 绿写成 LIVE E2E covered（**BUG-FAKE-CONN**） |
| 夹具 | 默认 `E2E_PG_IMAGE=pgvector…` = legacy（**BUG-FAKE-R5**）；LIVE 绿 ≠ sole-stack 已迁 |

---

## 1. 三车道总表（proposed · package.json 脚本名）

### 1.A — LIVE HTTP/SSE（真 live E2E · 主评测）

| package.json 脚本 | 实际入口 | 场景 / runner | 车道 | 业务 covered？ |
|-------------------|----------|---------------|------|----------------|
| `e2e:prove` | `node scripts/run-e2e.mjs` | `e2e/full.e2e.ts` | **LIVE primary** | 仅 UC 断言 + 夹具诚实；sole-stack 未迁 → 最多 partial/green-risk |
| `e2e:isolated` | `run-e2e-isolated.mjs e2e:prove` | 同上（临时 PG cluster） | **LIVE primary**（包装） | 同上；壳本身 ≠ covered |
| `performance:e2e` | `node scripts/run-performance-e2e.mjs` | `e2e/performance.e2e.ts` | **LIVE primary**（性能场景） | 同上；≠ sole-stack 性能 cutover |
| `performance:e2e:isolated` | `run-e2e-isolated.mjs performance:e2e` | 同上 | **LIVE primary**（包装） | 同上 |

**ADR 主集钉**：审查语言里「LIVE 主评测」= 上表 primary 行；**不含** UI。

### 1.B — LIVE 代码 Set 内 · UI secondary（次要 · 非主评测）

| package.json 脚本 | 实际入口 | 场景 | 车道 | 业务 covered？ |
|-------------------|----------|------|------|----------------|
| `e2e:ui` | `node scripts/run-e2e-ui.mjs` | `apps/web/e2e-ui/*.spec.ts` | **LIVE_OPTIONAL_UI / secondary** | **否**（主评测）；浏览器旁证 only |
| `e2e:ui:isolated` | `run-e2e-isolated.mjs e2e:ui` | 同上 | secondary 包装 | 同上 |

> 今日代码仍把 `e2e:ui` 放进 `LIVE_E2E_TARGETS`（假服务旗等行为共用）。**S1 只文档降级**：叙述上不得与 `e2e:prove` / `performance:e2e` 同级；移出 Set / 改名 `LIVE_OPTIONAL_UI` = **later slice**（不改行为）。

### 1.C — 相关但非 LIVE（易混淆入口）

| package.json 脚本 | 含义 | 为何不是 LIVE 主评测 |
|-------------------|------|----------------------|
| `verify:e2e-performance` | `run-e2e-performance-suite.mjs` 多步套件 | suite 编排 / 含 mark-red 行；≠ 单场景 LIVE 主集成员（见意见稿 S5） |
| `e2e-isolation:prove` | isolated 壳自证（`isolated-env:prove`） | 证明壳，不是业务旅程 |
| `e2e-runner:prove` · `e2e-receipt:prove` · `e2e-helpers:prove` | runner/receipt/helpers 合同 | 静态/单元旁证 |
| `e2e-platform:*` · `e2e-static-guards:*` · `e2e-parity:*` · `e2e-case-inventory:prove` | 目录契约 / 信任 / inventory 静态门 | **永不** live covered |

---

## 2. Prove-via-isolated-shell（域 prove · 借壳 · ≠ live E2E covered）

**定义**：`package.json` 中经 `node scripts/run-e2e-isolated.mjs <target>` 包装的脚本，**且** target ∉ `{e2e:prove, e2e:ui, performance:e2e}`。

| 事实（S1 探测） | 值 |
|-----------------|----|
| 经 `run-e2e-isolated` 的包装数 | **~97**（含 3 个 LIVE 包装别名） |
| 其中真 LIVE（代码 Set） | **3** targets：`e2e:prove` · `e2e:ui` · `performance:e2e` |
| 其余 | **域集成 / 负路径 / 合同 prove** — partial 旁证；**不是** HTTP/SSE 全链路 live E2E covered |

**代表脚本族（非穷尽 · 说明「借壳 ≠ E2E」）**：

| 族 | 代表 package.json 名 | inventory 家族 |
|----|----------------------|----------------|
| 负路径 | `neg:auth` · `neg:commerce` · `neg:resume` · `neg:interview` · `neg:all` · `api:validate` | （负路径纪律） |
| 域 HTTP/集成 prove | `interview:prove` · `commerce:prove` · `privacy-erasure:http:prove` · `resume-reference:http:prove` · `scor-00:http:prove` · … | F-PRIV · F-SCOR · F-INT · … |
| RAG / memory / vector | `rag03-route:prove` … `rag07-*:prove` · `memory:prove` · `vectorstore:prove` · `qbank:prove` · … | F-RAG-* · F-MEM · F-VEC |
| 壳/夹具自证 | `migrate:prove` · `e2e-isolation:prove` · `runtime:isolated:prove` | F-ISO 夹具根（≠ 旅程） |

**纪律**：审稿不得把上述 EXIT=0 写成「E2E covered / LIVE 通过」。隔离壳名实不符见 ADR §1 #1 / 意见稿 §2.1。

---

## 3. Conn-only（永不 LIVE · 永不业务 covered）

| package.json 脚本 | 角色 | inventory |
|-------------------|------|-----------|
| `mysql-stack:skeleton:prove` | 连通/骨架文档 | **F-CONN** |
| `mysql-stack:ping:prove` | ping 连通 | **F-CONN** |
| `mysql-stack:m2-tenant:prove` | M2 骨架 | **F-CONN** |
| `mysql-stack:m3-queue:prove` | M3 骨架 | **F-CONN** |
| `mysql-stack:m4-rag:prove` | M4 骨架 | **F-CONN** |
| `mysql-stack:m5-fixtures:prove` | M5 骨架 | **F-CONN** |
| `mysql-stack:r5-mark-red:prove` | R5 标红静态钉 | **F-CONN** / R5 旁证 |

**硬禁**：上述任一脚本（及可选 `conn-stack:*` 同体）**禁止**列入 LIVE 主集、禁止冒充 UC-E2E covered、禁止顶替本切片 / 发布证据（**BUG-FAKE-CONN**）。**S4**：bodies ∈ `scripts/conn-stack/`；legacy `scripts/mysql-stack.*` = thin forwarders；可选 `conn-stack:*` 别名 — **目录迁 ≠ covered**。

---

## 4. 代码 vs 文档差（诚实 · S1 不改行为）

| 面 | 今日 | S1 文档裁定 | 行为变更？ |
|----|------|-------------|------------|
| `LIVE_E2E_TARGETS` Set | `{e2e:prove, e2e:ui, performance:e2e}` | 承认代码三元；**主评测叙述**只认 HTTP/SSE 二元 | **否**（S1） |
| `e2e:ui` | 在 Set 内 | **secondary** / `LIVE_OPTIONAL_UI` | 否；移出 Set = later |
| 域 `*:prove` via isolated | ~94 借壳 | **prove-via-isolated-shell** | 否；S3 拆 `targets-domain-prove` |
| `mysql-stack:*` / `conn-stack:*` | `*:prove` 后缀 | **conn-only**；永不 LIVE；bodies ∈ `scripts/conn-stack/`（S4） | S4 已迁区（别名保留）；**≠ covered** |

---

## 5. 非目标（本片）

- 改 `LIVE_E2E_TARGETS` / `run-e2e-isolated.mjs` 分支行为  
- `git mv` runners · 建 `scripts/isolated/` · 建 `scripts/conn-stack/`  
- 把 UI 升格主评测或把 mysql-stack 写入 LIVE 表  
- `releaseEvidence=true` / HA / sole-stack cutover  
- 跑 `e2e:isolated` / `mysql-stack:*` 作为本片成功证据  

---

## 6. 引用

| 路径 | 角色 |
|------|------|
| `adr-e2e-directory-restructure.md` D5 · §4 S1 | ADR 裁定 |
| `e2e-directory-target-structure.md` §3 · §6 S1 | mw-e2e-ha 意见稿 |
| `reviews/2026-09-10-e2e-directory-restructure-s0-mw-e2e-ha.md` | S0 批准进 S1 |
| `harness/e2e-directory-s1-live-whitelist.md` | 本片审查 |
| `e2e-case-inventory.md` §1 F-ISO / F-ISO-UI / F-PERF / F-CONN | 家族同构 |
| `scripts/run-e2e-isolated.mjs` L40 | 代码 Set（只读对照） |
