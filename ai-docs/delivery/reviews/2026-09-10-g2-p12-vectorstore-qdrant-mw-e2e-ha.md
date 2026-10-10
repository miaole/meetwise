# 审查 — Meetwise G2 P12 · vectorstore:qdrant:prove · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗独立审 · 主战场工作臂；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT · ~03:24–03:28）  
**切片**：G2 **Opt-in product vectorstore prove → Qdrant bridge**（meetwise-core 送审 · status **P12**）  
**Harness / status**：`ai-docs/delivery/harness/qdrant-vectorstore-prove.md` · `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P12 · **G2 仍开**）· `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md`  
**Prove body**：`packages/qdrant-store/test/vectorstore-qdrant.proof.ts`  
**Bridge**：`packages/qdrant-store/src/product-vectorstore-bridge.ts`（`ProductVectorStoreQdrantBridge`→`QdrantVectorStoreAdapter`）  
**Runner / scripts**：根 `pnpm vectorstore:qdrant:prove` → `pnpm -C packages/qdrant-store prove:vectorstore-qdrant`  
**releaseEvidence=false** · **Not HA** · **≠ covered（业务/E2E）** · **≠ cutover** · **≠ 翻默认** · **opt-in only** · **retrieval-store 未改** · **G2 仍开** · **本绿 ≠ HA**

对照前次：`reviews/2026-09-10-g2-qdrant-vectorstore-adapter-mw-e2e-ha.md`（P11 thin adapter · G2 仍开）· `reviews/2026-09-10-qdrant-backed-deepen-mw-e2e-ha.md`（P10 inventory · G2 仍开）。  
平行域：`reviews/2026-09-10-g2-p12-vectorstore-qdrant-mw-rag-route.md`（本审不采信其自报；独立复跑）。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（P12 opt-in product-shaped prove 诚实登记；fail-closed 成立；无偷关 G2 / 无翻默认 / 无改 retrieval-store / 无 HA/`releaseEvidence=true` / 无业务 covered） |
| 是否批准 **P12 opt-in `vectorstore:qdrant:prove`** 登记 | **是**（仅 `@meetwise/qdrant-store` prove-path bridge→adapter live + honesty 钉；additive） |
| 是否批 **G2 关闭** | **否**（仍开 · status 字面 + 包脚本仍 pgvector-isolated） |
| 是否批 `vectorstore:prove` / `rag*` / `memory*` **默认已切 Qdrant** | **否**（opt-in ≠ 默认迁移） |
| 是否批 **retrieval-store / 生产向量真相已挂 Qdrant** | **否**（`annSearch` intact；无 `@meetwise/qdrant-store` import；PREREQ 大改写仍钉） |
| 是否批 RAG/memory/vectorstore **业务 E2E covered** | **否**（prove 内「COVERED (this prove)」仅窄指本叶 bridge 形状；≠ E2E covered） |
| 是否批 fixtures retired / cutover / sole 默认已切 | **否** |
| 是否批 HA / `releaseEvidence=true` | **否**（强制 false；L2/L3 未开） |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| B1 | **阻塞（切流/假绿）** | **G2**：`vectorstore`/`rag*`/`memory*` 默认 prove **仍** `run-e2e-isolated`→**pgvector**；P12 opt-in EXIT=0 **≠** G2 关；禁止把 `vectorstore:qdrant:prove` 绿写成业务默认已切 / covered | **已核验仍开** · 本切片 **不关** G2 |
| B2 | **阻塞（切流/发布）** | 不得宣称 **HA**、`releaseEvidence=true`、covered、cutover、migrated、fixtures retired；opt-in 绿 ≠ covered ≠ HA | **强制遵守** · L2/L3 **未开** |
| B3 | **阻塞（假绿面）** | Qdrant `/readyz` 不可达 / 坏 `QDRANT_URL` 必须 **EXIT=3**（禁静默绿） | **本审复现成立** |
| B4 | **阻塞（宣称面）** | P12 = **opt-in prove-path only** → **不得**写成 `vectorstore:prove` 已迁 / RAG/memory on Qdrant / 生产后端选择器已建 / retrieval-store 已挂 Qdrant | **强制遵守** · 生产 import 面仅包内 |
| B5 | **阻塞（接线面）** | `packages/db/src/retrieval-store.ts` **不得**被本切片偷偷改道 Qdrant；`annSearch` / pgvector 活路径 **intact** | **已核验未改**（无 qdrant import；git 无 retrieval-store diff；prove 静态钉） |
| B6 | **立场钉（非缺陷）** | `vectorstore:qdrant:prove` EXIT=0 = honesty + live product-shaped upsert/annSearch **only**；NOTE 明示 STILL-GAP G2/G1 + PREREQ | **强制遵守** |
| — | — | **本切片代码/行为面无额外阻塞项** | **无阻塞**（已抽查：fail-closed、默认仍 legacy、包脚本未改道、retrieval-store intact、bridge 仅包内、receipt/harness `releaseEvidence=false`、G2 字面仍开） |
| O1 | **nit（不降级）** | 命名面：`vectorstore:qdrant:prove` 与默认 `vectorstore:prove` 相邻，外推「默认已切」有假绿面风险；正文/harness/status/prove 三重钉 opt-in only | **不降级**；外推禁止由 B1/B4 管 |
| O2 | **nit（不降级）** | prove NOTE「COVERED (this prove)」若被外推为 E2E/业务 covered 有升阶风险；同段 STILL-GAP G2 / ≠ RAG/memory covered | **不降级**；本审 **拒**升阶 |

**冲突取更严**：他域若把 O1/O2 升 conditional，以更严为准。本域因 fail-closed、G2 仍开、opt-in only、retrieval-store 未改、`releaseEvidence=false` / Not HA 齐全，维持 **pass**（仅 P12 opt-in product prove 登记）。

---

## 交付定位（独立）

| 交付物 | 路径 |
|--------|------|
| Bridge 实现 | `packages/qdrant-store/src/product-vectorstore-bridge.ts` |
| Adapter（P11 复用） | `packages/qdrant-store/src/vectorstore-adapter.ts` |
| 导出 | `packages/qdrant-store/src/index.ts`（`ProductVectorStoreQdrantBridge` / `createProductVectorStoreQdrantBridge`） |
| Prove | `packages/qdrant-store/test/vectorstore-qdrant.proof.ts` |
| 包 scripts | `packages/qdrant-store/package.json` → `prove:vectorstore-qdrant` |
| 根 script | `package.json` → `vectorstore:qdrant:prove`（**显式 opt-in**） |
| 默认仍 pgvector | `package.json` → `vectorstore:prove` = `run-e2e-isolated` → `packages/db prove:vectorstore` |
| Harness | `ai-docs/delivery/harness/qdrant-vectorstore-prove.md` |
| Status P12 / G2 | `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md` |
| 深挖 inventory | `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md` + `pnpm mysql-stack:qdrant-backed:prove` |
| 相关（非本切片切流） | `qdrant-store:vectorstore-adapter:prove`（P11）· `vectorstore:prove`（仍 isolated/pgvector） |

**生产接线抽查**：`ProductVectorStoreQdrantBridge` / `createProductVectorStoreQdrantBridge` 引用仅出现在 `packages/qdrant-store/{src,test}` + harness/docs — **未**接入 `packages/db` / `apps/*`。`packages/db` / `apps/{api,worker}/src` **无** `@meetwise/qdrant-store` import。

**retrieval-store 抽查**：`packages/db/src/retrieval-store.ts` 仍 `export async function annSearch`（pg `PoolClient` + generation/legacy）；全文 **无** qdrant 字样；本工作树对该文件 **无 diff**。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称交付 | 独立结果 |
|----------|----------|
| P12 status Proven 行 | **成立**。status：opt-in product prove via bridge→adapter；缺 Qdrant → EXIT=3；PREREQ retrieval-store 尚不能选 Qdrant；≠ 默认 `vectorstore:prove` 已切；≠ RAG/memory covered；≠ G2 关；≠ fixtures retired；≠ HA；≠ 生产后端选择器 |
| opt-in only（不得翻默认） | **成立**。根脚本仅 `vectorstore:qdrant:prove`→qdrant-store；`vectorstore:prove`/`legacy`/`memory:prove`/`rag03-route:prove` 仍 `run-e2e-isolated`；isolated-env banner **`pgvector-legacy`** |
| retrieval-store 未改 | **成立**。无 qdrant import；`annSearch` intact；prove 静态钉「not wired to qdrant-store」；git 无 retrieval-store diff |
| G2 仍开 | **成立**。status G2 字面「仍未成默认」且明示 P12 ≠ 关闭；prove PASS `status: G2 still open`；deepen inventory 将 `vectorstore:qdrant:prove` 归 **qdrant-native opt-in**，业务 prove 仍 **pgvector-isolated（20）** |
| fail-closed EXIT=3 | **成立**（本审 `QDRANT_URL=http://127.0.0.1:19999` → **3** + PREREQ + refuse silent fake-green；包脚本直跑同 EXIT=3） |
| `releaseEvidence=false` / Not HA | **成立**。harness 头、status、bridge 头注、prove NOTE 均硬钉；禁令列含禁止 `releaseEvidence=true`（≠ 声称 true） |
| 包脚本未偷关 G2 | **成立**。仅 `vectorstore:qdrant*` 可路由 qdrant-store；deepen/prove 均钉「only vectorstore:qdrant* may route…」 |

### 对抗抽查

| 检查 | 结果 |
|------|------|
| opt-in 绿 → 被误当成默认 / G2 关闭 / covered？ | **未发现偷写**。status/harness/prove 三重钉 G2 仍开 / opt-in only / ≠ RAG/memory covered；命名相邻风险由 O1/B1 管 |
| prove 绿偷关 G2 / 写成 covered？ | **否**。NOTE：`STILL-GAP G2`；inventory 仍列 20 条 pgvector-isolated |
| retrieval-store 被改接线？ | **否**。无 import；无 diff；`annSearch` 仍 pgvector 生产路径 |
| 「COVERED (this prove)」升阶风险 | **可管控**。限定本叶 product-shaped upsert+annSearch；同段 STILL-GAP；本审 **拒**升为 E2E covered |
| fail-closed：坏 endpoint | **成立** EXIT=3 |
| 默认仍非 Qdrant-backed 业务默认 | **成立**（脚本路由 + isolated-env banner + deepen inventory） |
| HA / releaseEvidence=true | **未发现宣称**；强制 false |
| 假 HA / covered / `releaseEvidence=true` | **禁止且未出现** |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `pnpm vectorstore:qdrant:prove`（Qdrant :6333 up） | **0** | honesty + live bridge→adapter upsert/annSearch；**仍钉 G2/G1 GAP**；`releaseEvidence=false` · Not HA；PREREQ retrieval-store 未解 |
| `QDRANT_URL=http://127.0.0.1:19999 pnpm vectorstore:qdrant:prove` | **3** | PREREQ fail-closed；禁假绿 |
| `QDRANT_URL=http://127.0.0.1:19999 pnpm -C packages/qdrant-store prove:vectorstore-qdrant` | **3** | 包脚本直跑同 EXIT=3 |
| `pnpm mysql-stack:qdrant-backed:prove` | **0** | inventory+readyz；`vectorstore:qdrant:prove` 列入 **qdrant-native opt-in**；`vectorstore:prove`/`rag*`/`memory*` 仍 **pgvector-isolated**；**STILL-GAP G2** |
| 默认（无 `E2E_ISOLATION_STACK`）`node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0** | banner **`[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy`** + `releaseEvidence=false` · Not HA → **证明默认未翻 sole/Qdrant 业务轨** |

独立观测（正向 EXIT=0）：60 chunks via bridge；ANN 自查 top-1；暴力余弦 5/5；幂等 pointId；qbank 共享 / memory 私有；默认仍 legacy；三业务脚本族仍 isolated；仅 `vectorstore:qdrant*` 可走 qdrant-store；retrieval-store 未接线。

---

## opt-in 绿 ≠ 升阶（硬钉）

| 命题 | 本审裁定 |
|------|----------|
| P12 `vectorstore:qdrant:prove` EXIT=0 | **仅** additive opt-in product-shaped prove 登记（G2 **子切片**） |
| G2 关闭 | **否** |
| `vectorstore:prove` / rag* / memory* 默认 Qdrant-backed | **否**（**opt-in only**） |
| retrieval-store 已挂 / 可选 Qdrant | **否**（PREREQ 仍开） |
| 业务 / E2E covered | **否** |
| fixtures retired / cutover / migrated | **否** |
| sole / `E2E_ISOLATION_STACK` 默认已切 | **否**（仍 `pgvector-legacy`；G1 开） |
| HA / releaseEvidence | **false / Not HA**（禁止升） |

---

## 残留 GAP（对齐 status · 未关）

G1 默认仍 legacy · **G2 Qdrant-backed 业务 prove 未默认**（P11 adapter + **P12 opt-in ≠ 关**；retrieval-store 后端选择器 PREREQ 未解）· G3 `E2E_PG_IMAGE` 未退役 · G4 R4 · G5 erasure ledger · G6 BUG-E2E-ISO · G7 HA/releaseEvidence

---

## 对照

- `ai-docs/delivery/harness/qdrant-vectorstore-prove.md`
- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P12 · G2）
- `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md`
- `ai-docs/delivery/harness/qdrant-vectorstore-adapter.md`（P11）
- `packages/qdrant-store/src/product-vectorstore-bridge.ts` · `test/vectorstore-qdrant.proof.ts`
- 前次：`reviews/2026-09-10-g2-qdrant-vectorstore-adapter-mw-e2e-ha.md` · `reviews/2026-09-10-qdrant-backed-deepen-mw-e2e-ha.md`
- 平行：`reviews/2026-09-10-g2-p12-vectorstore-qdrant-mw-rag-route.md`
