# 审查 — Meetwise G2 P14 · retrieval-store→Qdrant 选型 · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗独立审 · 主战场工作臂；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT · ~03:47–04:05）  
**切片**：G2 **Product retrieval backend selector → Qdrant**（meetwise-core 送审 · status **P14** · **standalone opt-in 选型**）  
**Harness / status**：`ai-docs/delivery/harness/retrieval-backend-qdrant.md` · `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P14 · **G2 仍开**）· `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md`  
**Selector**：`packages/db/src/retrieval-backend.ts`（`RETRIEVAL_VECTOR_BACKEND` · `resolveRetrievalVectorBackend` / `createRetrievalVectorBackend`）  
**pg 路径**：`packages/db/src/retrieval-store.ts`（SQL/HNSW/RLS/qbank-generation · **未改道**）  
**Prove body**：`packages/db/test/retrieval-backend-qdrant.proof.ts`  
**Runner / scripts**：根 `pnpm retrieval-store:qdrant:prove` → `pnpm -C packages/db prove:retrieval-backend-qdrant`  
**releaseEvidence=false** · **Not HA** · **≠ covered（业务/E2E）** · **≠ cutover** · **≠ 翻默认** · **opt-in only** · **未入 sole** · **默认仍 pgvector** · **G2 仍开** · **本绿 ≠ HA**

对照前次：`reviews/2026-09-10-g2-p13-rag-memory-qdrant-mw-e2e-ha.md`（P13 standalone · pass · 明示 retrieval-store 未改）· `reviews/2026-09-10-p12-sole-allowlist-mw-e2e-ha.md`（sole 恰 5）· `reviews/2026-09-10-g2-p12-vectorstore-qdrant-mw-e2e-ha.md`。  
平行域：`reviews/2026-09-10-p14-retrieval-backend-qdrant-mw-rag-route.md`（本审不采信其自报；独立复跑）。  
**勿与 sole 扩面混淆**：本刀裁定对象 = **P14 选型/opt-in 工厂登记**；**不是**默认切 Qdrant，也**不**批入 sole。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（P14 product-selector PREREQ 关闭 · 选型/opt-in 接线诚实登记；默认仍 pg；fail-closed 成立；未入 sole；无偷关 G2 / 无翻默认 / 无 HA/`releaseEvidence=true` / 无业务 covered） |
| 是否批准 **P14 选型 / `retrieval-store:qdrant:prove` opt-in 接线登记** | **是**（仅 `packages/db` 薄工厂 + standalone prove；显式 `RETRIEVAL_VECTOR_BACKEND=qdrant`） |
| 是否批 **默认已切 Qdrant / `vectorstore:prove`/`rag*`/`memory*` 默认改道** | **否**（默认/unset/空/`pg`/`pgvector` → **pgvector**；业务 prove 仍 `run-e2e-isolated`） |
| 是否批 **P14 入 sole allowlist** | **否**（送审明确未入；live **恰 5** · **不含** P14） |
| 是否批 **G2 关闭** | **否**（仍开 · status 字面 + 默认脚本仍 pgvector-isolated） |
| 是否批 **retrieval-store 生产向量真相已挂 / 静默切 Qdrant** | **否**（`retrieval-store.ts` 仍 SQL；**无** `@meetwise/qdrant-store` import；选择器为独立工厂） |
| 是否批 generation / hybrid / HNSW / RLS / serving_scope **已迁 Qdrant** | **否**（诚实 PREREQ 仍开；Qdrant 路径仅 thin adapter upsert+ANN 子集） |
| 是否批 fixtures retired / cutover / sole 默认已切 | **否** |
| 是否批 HA / `releaseEvidence=true` / 业务 covered | **否**（强制 false；L2/L3 未开；prove NOTE「COVERED (this prove)」仅窄指本叶） |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| B1 | **阻塞（切流/假绿）** | **G2**：`vectorstore`/`rag*`/`memory*` 默认 prove **仍** `run-e2e-isolated`→**pgvector**；P14 opt-in EXIT=0 **≠** G2 关；禁止把选型绿写成业务默认已切 / covered | **已核验仍开** · 本切片 **不关** G2 |
| B2 | **阻塞（切流/发布）** | 不得宣称 **HA**、`releaseEvidence=true`、covered、cutover、migrated、fixtures retired；选型绿 ≠ covered ≠ HA | **强制遵守** · L2/L3 **未开** |
| B3 | **阻塞（假绿面）** | `RETRIEVAL_VECTOR_BACKEND=qdrant` + 坏/`readyz` 不可达 `QDRANT_URL` 必须 **EXIT=3**（禁静默绿）；未知 backend 必须 throw | **本审复现成立** |
| B4 | **阻塞（宣称面）** | P14 = **standalone 选型/opt-in only** → **不得**写成已入 `SOLE_WIRING_ALLOWLIST` / 默认已迁 / 全量 RAG covered / G2 关 | **强制遵守** · live 名单亦 **未**含 P14 |
| B5 | **阻塞（接线面）** | `retrieval-store.ts` **不得**被本切片偷偷改道 Qdrant；默认工厂/env **不得**因仅设 `QDRANT_URL` 静默切 Qdrant | **已核验**：SQL intact；`QDRANT_URL` 单设仍 **pgvector** |
| B6 | **立场钉（非缺陷）** | P14 EXIT=0 = 选择器 PREREQ 关闭 + default=pg + live qdrant 子集 + bad-URL child EXIT=3 **only**；NOTE 明示 STILL-GAP G2 + 特征 PREREQ | **强制遵守** |
| — | — | **本切片代码/行为面无额外阻塞项** | **无阻塞**（已抽查：fail-closed、默认仍 pg、包脚本未改道、retrieval-store intact、未入 sole、harness/status `releaseEvidence=false`、G2 字面仍开、apps 未接生产调用） |
| O1 | **nit（不降级）** | 命名面：`retrieval-store:qdrant:prove` 与 `retrieval-store.ts` 相邻，外推「store 已默认切 Qdrant」有假绿面风险；正文/harness/status/prove 多重钉 opt-in + 默认仍 pg + 工厂分离 | **不降级**；外推禁止由 B1/B4/B5 管 |
| O2 | **nit（不降级）** | prove NOTE「COVERED (this prove)」若被外推为 E2E/业务 covered 有升阶风险；同段 STILL-GAP G2 / 特征 PREREQ | **不降级**；本审 **拒**升阶 |
| O3 | **nit（API · 不降级）** | `createRetrievalVectorBackend({ requireReadyz: false })` 可跳过 readyz 返回 qdrant handle（显式逃逸）；默认 `requireReadyz !== false` → true；prove 坏 URL 子进程强制 true → EXIT=3 | **不降级**；调用方若关 readyz 自担；本轨 prove/默认 fail-closed 仍成立 |
| O4 | **nit（inventory · 不降级）** | deepen harness **文档**列 P14，但 `mysql-stack.qdrant-backed.prove.mjs` `REQUIRED_QDRANT_NATIVE` **未**纳入 `retrieval-store:qdrant:prove`（脚本走 `packages/db` 非 qdrant-store）；inventory NOTE 仍 7 条 native | **不降级**；属 classifier 范围滞后；**不**构成假绿（P14 本身未入 sole） |

**冲突取更严**：他域若把 O1–O4 升 conditional，以更严为准。本域因默认仍 pg、fail-closed、G2 仍开、standalone only、未入 sole、retrieval-store 未改道、`releaseEvidence=false` / Not HA 齐全，维持 **pass**（仅 P14 选型/opt-in 登记）。

---

## sole 名单观测（独立 · 全文）

本审解析 `scripts/run-e2e-isolated.mjs` `SOLE_WIRING_ALLOWLIST`：**恰 5** 条：

1. `sole-stack:wiring:prove`
2. `sole-stack:ping:prove`
3. `sole-stack:qdrant-backed:prove`
4. `sole-stack:vectorstore-adapter:prove`
5. `sole-stack:vectorstore-qdrant:prove` ← P12

**不含**：任何 `retrieval*` / `retrieval-store*` / `retrieval-backend*`（`has_p14=false`）。

根 `package.json`：**无** `e2e-isolation:sole-retrieval*:prove`；仅有 standalone `retrieval-store:qdrant:prove`。

假 sole target：`sole-stack:retrieval-store-qdrant:prove` / `sole-stack:retrieval-backend:prove` → **unsupported_e2e_target**（EXIT=**1**）。

默认业务目标 sole 下仍拒（EXIT=**3**）：`vectorstore:prove:raw` · `rag03-route:prove:raw` · `memory:prove:raw`（allowlist 字面仍恰上述 5）。

**结论**：P14 **未入** sole（观测与送审一致）；批准范围 **仅** 选型/opt-in 登记。

---

## 交付定位（独立）

| 交付物 | 路径 |
|--------|------|
| 选择器工厂（本刀） | `packages/db/src/retrieval-backend.ts` |
| pgvector 活路径 | `packages/db/src/retrieval-store.ts`（**未** import qdrant-store；仅头注指向选择器） |
| Prove | `packages/db/test/retrieval-backend-qdrant.proof.ts` |
| 包 / 根 scripts | `packages/db` `prove:retrieval-backend-qdrant` · 根 `retrieval-store:qdrant:prove`（**显式 opt-in · standalone**） |
| 默认仍 pgvector | `vectorstore:prove` / `rag03-route:prove` / `memory:prove` = `run-e2e-isolated` |
| Harness | `retrieval-backend-qdrant.md` |
| Status P14 / G2 | `r5-retirement-sole-stack-status.md` |
| 深挖 inventory | `qdrant-backed-prove-deepen.md` + `node scripts/mysql-stack.qdrant-backed.prove.mjs` |

**生产接线抽查**：`createRetrievalVectorBackend` / `RETRIEVAL_VECTOR_BACKEND` 代码引用仅在 `packages/db/{src,test}` + qdrant-store **注释** + harness/docs/reviews — **apps/** **无**调用。`@meetwise/db` 已 export 选择器（可被后续接线），但本刀 **未**改业务默认路径。

**retrieval-store 抽查**：`annSearch` / `upsertVectorChunk` 仍 `PoolClient` + SQL；全文 **无** `@meetwise/qdrant-store` / `createQdrant` 生产 import。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称交付 | 独立结果 |
|----------|----------|
| P14 status Proven · standalone · 关选择器 PREREQ | **成立**。status：`RETRIEVAL_VECTOR_BACKEND=qdrant`；默认仍 pgvector；坏 URL EXIT=3；**NOT** allowlist；≠ 默认已切；≠ sole 扩面；≠ G2 关；≠ HA |
| 默认仍 pg（不得翻默认） | **成立**。resolve：unset/empty/`pgvector`/`pg`→pgvector；`QDRANT_URL` 单设仍 pgvector client-bound；业务 prove 脚本仍 isolated |
| Qdrant 仅 opt-in/显式开关 | **成立**。仅 `RETRIEVAL_VECTOR_BACKEND=qdrant` → adapter 路径 |
| fail-closed | **成立**。未知 backend throw；整进程坏 URL prove EXIT=3；子进程坏 URL EXIT=3 |
| **未入 sole** | **成立**（live=5；无 sole-retrieval 脚本；假 target unsupported；业务 sole 拒 EXIT=3） |
| G2 仍开 | **成立**。status G2 字面「仍未成默认」且明示 P14 ≠ 关闭；prove PASS `status: G2 still open`；deepen：pgvector-isolated **20**；默认 isolation banner **`pgvector-legacy`** |
| `retrieval-store` 未偷切 | **成立** |
| `releaseEvidence=false` / Not HA | **成立**。harness/status/selector 头注/prove NOTE 均硬钉 |
| 包脚本未偷关 G2 | **成立**。仅 `retrieval-store:qdrant:prove` 为新增 opt-in；`vectorstore`/`rag*`/`memory*` 默认未改道 |

### 对抗抽查

| 检查 | 结果 |
|------|------|
| 仅设 `QDRANT_URL`、未设 backend → 静默切 Qdrant？ | **否** → 仍 `pgvector` / `client-bound` |
| 空白/未知 backend？ | 空白→pgvector；`mysql`→throw fail-closed |
| 缺/坏 `QDRANT_URL` + 显式 qdrant → 假绿？ | **否** EXIT=3 / throw |
| opt-in 绿 → 被误当成默认 / G2 关 / covered / 已入 sole？ | **未发现偷写**。多重钉 |
| `retrieval-store.ts` / 业务 prove 被改道？ | **否** |
| HA / `releaseEvidence=true` / 假 covered | **未发现宣称**；强制 false |
| sole 含本刀？ | **否**（恰 5 · 不含） |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `pnpm retrieval-store:qdrant:prove`（Qdrant :6333 up） | **0** | honesty + default=pg + live selector→adapter memory upsert/ANN + bad-URL child EXIT=3；**仍钉 G2**；`releaseEvidence=false` · Not HA |
| `QDRANT_URL=http://127.0.0.1:19999 RETRIEVAL_VECTOR_BACKEND=qdrant pnpm retrieval-store:qdrant:prove` | **3** | 整进程 PREREQ fail-closed；禁假绿 |
| `node scripts/mysql-stack.qdrant-backed.prove.mjs` | **0** | inventory：sole-allowlist **恰 5**；业务 prove 仍 **pgvector-isolated（20）**；**STILL-GAP G2**；readyz OK |
| `node scripts/mysql-stack.r5-mark-red.proof.mjs` | **0** | 标红诚实；sole 恰 5；P13 OFF allowlist；G2 still OPEN；默认仍 legacy |
| 默认（无 `E2E_ISOLATION_STACK`）`node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0** | banner **`[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy`** + `releaseEvidence=false` · Not HA → **证明默认未翻 sole/Qdrant 业务轨** |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … sole-stack:retrieval-store-qdrant:prove` | **1** | `unsupported_e2e_target`（**未**入 allowlist） |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … sole-stack:retrieval-backend:prove` | **1** | 同上 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … vectorstore:prove:raw` | **3** | 默认 vectorstore 路径 sole 拒 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … rag03-route:prove:raw` | **3** | 默认 rag 路径 sole 拒 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … memory:prove:raw` | **3** | 默认 memory 路径 sole 拒 |

独立观测（tsx 对抗）：`QDRANT_URL` 单设 → `pgvector`；whitespace → `pgvector`；unknown → throw；坏 URL + `requireReadyz:true` → throw；`requireReadyz:false` → 可返回 handle（见 O3）。

正向 EXIT=0 内：resolve 默认四态=pgvector；create 默认 client-bound；bad-URL child=3；live ensureCollection + memory self-recall distance≈0；跨 owner 不泄漏。

---

## opt-in 绿 ≠ 升阶（硬钉）

| 命题 | 本审裁定 |
|------|----------|
| P14 `retrieval-store:qdrant:prove` EXIT=0 | **仅** 选型/opt-in 工厂登记（G2 **子切片** · 关选择器 PREREQ） |
| 入 sole allowlist | **否**（未入 · 不批） |
| G2 关闭 | **否** |
| `vectorstore:prove` / `rag*` / `memory*` 默认 Qdrant-backed | **否**（**默认仍 pg**） |
| retrieval-store 生产路径已静默挂 Qdrant | **否**（工厂分离；SQL intact） |
| generation / hybrid / HNSW / RLS / serving_scope covered | **否** |
| fixtures retired / cutover / migrated | **否** |
| sole / `E2E_ISOLATION_STACK` 默认已切 | **否**（仍 `pgvector-legacy`；G1 开） |
| HA / releaseEvidence | **false / Not HA**（禁止升） |

---

## 残留 GAP（对齐 status · 未关）

G1 默认仍 legacy · **G2 Qdrant-backed 业务 prove 未默认**（P11–P14 opt-in/选型 ≠ 关；产品 rag*/memory*/vectorstore 全量特征大改写 PREREQ 未解）· G3 `E2E_PG_IMAGE` 未退役 · G4 R4 · G5 erasure ledger · G6 BUG-E2E-ISO · G7 HA/releaseEvidence

---

## 对照

- `ai-docs/delivery/harness/retrieval-backend-qdrant.md`
- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P14 · G2）
- `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md`
- `packages/db/src/retrieval-backend.ts` · `retrieval-store.ts`
- `packages/db/test/retrieval-backend-qdrant.proof.ts`
- 前次：`reviews/2026-09-10-g2-p13-rag-memory-qdrant-mw-e2e-ha.md` · `reviews/2026-09-10-p12-sole-allowlist-mw-e2e-ha.md`
- 平行：`reviews/2026-09-10-p14-retrieval-backend-qdrant-mw-rag-route.md`
