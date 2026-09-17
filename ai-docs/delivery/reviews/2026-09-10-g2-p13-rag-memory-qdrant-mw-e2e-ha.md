# 审查 — Meetwise G2 P13 · rag/memory:qdrant opt-in · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗独立审 · 主战场工作臂；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT · ~03:37–03:40）  
**切片**：G2 **Opt-in minimal rag/memory Qdrant prove slices**（meetwise-core 送审 · status **P13** · **standalone only**）  
**Harness / status**：`ai-docs/delivery/harness/qdrant-rag-prove.md` · `ai-docs/delivery/harness/qdrant-memory-prove.md` · `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P13 · **G2 仍开**）· `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md`  
**Prove body**：`packages/qdrant-store/test/rag-qdrant.proof.ts` · `packages/qdrant-store/test/memory-qdrant.proof.ts`  
**Bridge**：`packages/qdrant-store/src/product-vectorstore-bridge.ts`（复用 P12 `ProductVectorStoreQdrantBridge`→`QdrantVectorStoreAdapter`）  
**Runner / scripts**：根 `pnpm rag:qdrant:prove` / `pnpm memory:qdrant:prove` → `pnpm -C packages/qdrant-store prove:rag-qdrant|prove:memory-qdrant`  
**releaseEvidence=false** · **Not HA** · **≠ covered（业务/E2E）** · **≠ cutover** · **≠ 翻默认** · **opt-in only** · **未入 sole** · **retrieval-store 未改** · **G2 仍开** · **本绿 ≠ HA**

对照前次：`reviews/2026-09-10-g2-p12-vectorstore-qdrant-mw-e2e-ha.md`（P12 opt-in prove · pass）· `reviews/2026-09-10-p12-sole-allowlist-mw-e2e-ha.md`（P12 入 sole · **conditional** · B5 live=7 / B6 sole-qdrant-backed=1）。  
平行域：`reviews/2026-09-10-g2-p13-rag-memory-qdrant-mw-rag-route.md`（本审不采信其自报；独立复跑）。  
**勿与 B5/B6 混淆**：本刀裁定对象 = **P13 standalone opt-in prove**；**不是** P12 sole 入名单修复验收，也**不**把「入 sole」写成已批。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（P13 standalone opt-in 最小 rag/memory Qdrant prove 诚实登记；fail-closed 成立；未入 sole；无偷关 G2 / 无翻默认 / 无改 retrieval-store / 无 HA/`releaseEvidence=true` / 无业务 covered） |
| 是否批准 **P13 opt-in `rag:qdrant:prove` + `memory:qdrant:prove`** 登记 | **是**（仅 `@meetwise/qdrant-store` package-script standalone prove-path；additive；复用 P12 bridge） |
| 是否批 **P13 入 sole allowlist** | **否**（送审明确「未入 sole」；本审 live 观测亦 **不含**；批准范围 **仅 standalone**） |
| 是否批 **G2 关闭** | **否**（仍开 · status 字面 + 默认脚本仍 pgvector-isolated） |
| 是否批 `rag*` / `memory*` / `vectorstore:prove` **默认已切 Qdrant** | **否**（opt-in ≠ 默认迁移） |
| 是否批 **retrieval-store / 生产向量真相已挂 Qdrant** | **否**（无 qdrant 字样；`annSearch` intact；无 `@meetwise/qdrant-store` 生产 import） |
| 是否批 hybrid / R4 / rag03–07 / episode / two-stage **业务 covered** | **否**（prove 内「COVERED (this prove)」仅窄指本叶 bridge 切片） |
| 是否批 fixtures retired / cutover / sole 默认已切 | **否** |
| 是否批 HA / `releaseEvidence=true` | **否**（强制 false；L2/L3 未开） |
| 是否与 P12 sole **B5/B6** 混批 | **否**（见下「与 B5/B6 边界」） |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| B1 | **阻塞（切流/假绿）** | **G2**：`vectorstore`/`rag*`/`memory*` 默认 prove **仍** `run-e2e-isolated`→**pgvector**；P13 opt-in EXIT=0 **≠** G2 关；禁止把 `rag:qdrant`/`memory:qdrant` 绿写成业务默认已切 / covered | **已核验仍开** · 本切片 **不关** G2 |
| B2 | **阻塞（切流/发布）** | 不得宣称 **HA**、`releaseEvidence=true`、covered、cutover、migrated、fixtures retired；opt-in 绿 ≠ covered ≠ HA | **强制遵守** · L2/L3 **未开** |
| B3 | **阻塞（假绿面）** | Qdrant `/readyz` 不可达 / 坏 `QDRANT_URL` 必须 **EXIT=3**（禁静默绿） | **本审复现成立**（rag+memory） |
| B4 | **阻塞（宣称面）** | P13 = **standalone package opt-in only** → **不得**写成已入 `SOLE_WIRING_ALLOWLIST` / `rag*`/`memory*` 默认已迁 / hybrid·R4·episode·two-stage covered / 生产后端选择器已建 | **强制遵守** · live 名单亦 **未**含 P13 |
| B5 | **阻塞（接线面）** | `packages/db/src/retrieval-store.ts` **不得**被本切片偷偷改道 Qdrant；`annSearch` / pgvector 活路径 **intact** | **已核验未改**（无 qdrant 字样；无生产 `@meetwise/qdrant-store` import） |
| B6 | **立场钉（非缺陷）** | P13 EXIT=0 = honesty + live 最小 rag 检索 / memory 向量切片 **only**；NOTE 明示 STILL-GAP G2 + 产品 PREREQ 大改写 | **强制遵守** |
| — | — | **本切片代码/行为面无额外阻塞项** | **无阻塞**（已抽查：fail-closed、默认仍 legacy、包脚本未改道、retrieval-store intact、bridge 仅包内、harness/status `releaseEvidence=false`、G2 字面仍开、sole **未**含 P13） |
| O1 | **nit（不降级）** | 命名面：`rag:qdrant:prove` / `memory:qdrant:prove` 与默认 `rag*`/`memory*` 相邻，外推「默认已切」有假绿面风险；正文/harness/status/prove 多重钉 opt-in only + standalone | **不降级**；外推禁止由 B1/B4 管 |
| O2 | **nit（不降级）** | prove NOTE「COVERED (this prove)」若被外推为 E2E/业务 covered 有升阶风险；同段 STILL-GAP G2 / ≠ hybrid/R4/episode covered | **不降级**；本审 **拒**升阶 |
| O3 | **nit（观测 · 不降级）** | 前序 P12 sole 审曾观测 live allowlist=7（含并行 `sole-stack:rag/memory-qdrant`）与 B6 `sole-qdrant-backed=1`；**本审 live 已恢复恰 5 且 P13 OFF**；qdrant-backed 现=0。属并行树抖动残留观测，**不**升本刀条件 | **不降级**；与 B5/B6 修复验收分离 |

**冲突取更严**：他域若把 O1/O2 升 conditional，以更严为准。本域因 fail-closed、G2 仍开、standalone only、未入 sole、retrieval-store 未改、`releaseEvidence=false` / Not HA 齐全，维持 **pass**（仅 P13 standalone opt-in 登记）。

---

## 与 P12 sole B5/B6 边界（硬钉 · 防混淆）

| 命题 | 本审 |
|------|------|
| 本刀对象 | **P13 standalone** `rag:qdrant:prove` / `memory:qdrant:prove` |
| 是否验收「P12 sole 入名单恰 5」修复 | **否**（另刀；见 `reviews/2026-09-10-p12-sole-allowlist-mw-e2e-ha.md`） |
| 是否验收 B5「live=7 含 rag/memory-qdrant」清退 | **否**（仅 **观测报告** 当前 live；本刀不批「入 sole」） |
| 是否验收 B6 `sole-qdrant-backed` 红→绿 | **否**（可选旁证复跑现=0，**不**算本刀通过条件） |
| 若送审写「未入 sole」而树已入 | 应升 **conditional**（宣称/范围冲突，类 B5） |
| **本审实测** | 送审「未入 sole」**与** live **一致** → **不**升条件 |

---

## sole 名单观测（独立 · 全文）

本审解析 `scripts/run-e2e-isolated.mjs` `SOLE_WIRING_ALLOWLIST`：**恰 5** 条：

1. `sole-stack:wiring:prove`
2. `sole-stack:ping:prove`
3. `sole-stack:qdrant-backed:prove`
4. `sole-stack:vectorstore-adapter:prove`
5. `sole-stack:vectorstore-qdrant:prove` ← P12（前序 conditional 窄批入名单）

**不含**：`sole-stack:rag-qdrant:prove` · `sole-stack:memory-qdrant:prove`（`HAS_RAG_QDRANT=false` · `HAS_MEM_QDRANT=false`）。

根 `package.json`：**无** `e2e-isolation:sole-rag-qdrant:prove` / `e2e-isolation:sole-memory-qdrant:prove`；仅有 standalone `rag:qdrant:prove` / `memory:qdrant:prove`。

假 sole target 行为：`sole-stack:rag-qdrant:prove` / `sole-stack:memory-qdrant:prove` → **unsupported_e2e_target**（EXIT=**1**，未进 allowlist 门控；比「在名单外 EXIT=3」更早拒绝）。

默认业务目标 sole 下仍拒（EXIT=**3**）：`rag03-route:prove:raw` · `memory:prove:raw` · `vectorstore:prove:raw`。

**结论**：P13 **未入** sole（观测与送审一致）；本审批准范围 **仅** standalone。

---

## 交付定位（独立）

| 交付物 | 路径 |
|--------|------|
| Bridge（复用 P12） | `packages/qdrant-store/src/product-vectorstore-bridge.ts` |
| Adapter（P11） | `packages/qdrant-store/src/vectorstore-adapter.ts` |
| RAG prove | `packages/qdrant-store/test/rag-qdrant.proof.ts` |
| Memory prove | `packages/qdrant-store/test/memory-qdrant.proof.ts` |
| 包 scripts | `packages/qdrant-store/package.json` → `prove:rag-qdrant` / `prove:memory-qdrant` |
| 根 scripts | `package.json` → `rag:qdrant:prove` / `memory:qdrant:prove`（**显式 opt-in · standalone**） |
| 默认仍 pgvector | `rag03-route:prove` / `memory:prove` / `vectorstore:prove` = `run-e2e-isolated` |
| Harness | `qdrant-rag-prove.md` · `qdrant-memory-prove.md` |
| Status P13 / G2 | `r5-retirement-sole-stack-status.md` |
| 深挖 inventory | `qdrant-backed-prove-deepen.md` + `pnpm mysql-stack:qdrant-backed:prove` |

**生产接线抽查**：`ProductVectorStoreQdrantBridge` / `createProductVectorStoreQdrantBridge` 引用仅出现在 `packages/qdrant-store/{src,test}` + harness/docs/reviews — **未**接入 `packages/db` / `apps/*`。

**retrieval-store 抽查**：全文 **无** qdrant 字样；`annSearch` 仍 pg `PoolClient` + legacy；prove/deepen 静态钉「not wired to qdrant-store」。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称交付 | 独立结果 |
|----------|----------|
| P13 status Proven 行 · standalone only | **成立**。status：opt-in 最小 rag/memory 切片；缺 Qdrant → EXIT=3；**NOT** on `SOLE_WIRING_ALLOWLIST`；PREREQ 产品 rag*/memory* 大改写；≠ 默认已切；≠ sole 扩面；≠ G2 关；≠ HA |
| opt-in only（不得翻默认） | **成立**。仅 `*:qdrant:prove`→qdrant-store；默认 `rag*`/`memory*`/`vectorstore:prove` 仍 isolated；banner **`pgvector-legacy`** |
| **未入 sole** | **成立**（live=5；无 sole-rag/memory 脚本；假 target unsupported；deepen/r5 钉 P13 OFF allowlist） |
| retrieval-store 未改 | **成立** |
| G2 仍开 | **成立**。status G2 字面「仍未成默认」且明示 P13 ≠ 关闭；prove PASS `status: G2 still open`；inventory **20** 条仍 pgvector-isolated；qdrant-native **6**（含本二条）标为 opt-in |
| fail-closed EXIT=3 | **成立**（坏 URL rag+memory+包脚本直跑） |
| `releaseEvidence=false` / Not HA | **成立**。harness 头、status、bridge/index 头注、prove NOTE 均硬钉 |
| 包脚本未偷关 G2 | **成立**。仅 `*(vectorstore\|rag\|memory):qdrant*` 可路由 qdrant-store |

### 对抗抽查

| 检查 | 结果 |
|------|------|
| opt-in 绿 → 被误当成默认 / G2 关闭 / covered / 已入 sole？ | **未发现偷写**。status/harness/prove/r5 多重钉 standalone + G2 仍开 + NOT allowlist |
| prove 绿偷关 G2 / 写成 covered？ | **否**。NOTE：`STILL-GAP G2`；inventory 仍列 20 条 pgvector-isolated |
| 命名外推「rag/memory 已迁」 | **风险存在（O1）**；钉文齐全；本审拒升阶 |
| retrieval-store / 生产路径被改？ | **否** |
| 「COVERED (this prove)」升阶风险 | **可管控**。限定本叶最小切片；同段 STILL-GAP；本审 **拒**升为 E2E covered |
| fail-closed：坏 endpoint | **成立** EXIT=3 |
| 默认仍非 Qdrant-backed 业务默认 | **成立** |
| HA / releaseEvidence=true | **未发现宣称**；强制 false |
| 假 HA / covered / `releaseEvidence=true` | **禁止且未出现** |
| 与 B5/B6 混淆批「入 sole」？ | **否** · 本刀明确不批入 sole |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `pnpm rag:qdrant:prove`（Qdrant :6333 up） | **0** | honesty + live 最小 qbank ANN via bridge；**仍钉 G2/G1 GAP**；`releaseEvidence=false` · Not HA；PREREQ 产品 rag* 未解；SOLE 排除钉 |
| `pnpm memory:qdrant:prove`（同上） | **0** | honesty + live 最小 memory 向量 upsert/owner-ANN；跨 owner=0；**仍钉 G2**；episode/two-stage ≠ covered |
| `QDRANT_URL=http://127.0.0.1:19999 pnpm rag:qdrant:prove` | **3** | PREREQ fail-closed；禁假绿 |
| `QDRANT_URL=http://127.0.0.1:19999 pnpm memory:qdrant:prove` | **3** | 同上 |
| `QDRANT_URL=http://127.0.0.1:19999 pnpm -C packages/qdrant-store prove:rag-qdrant` | **3** | 包脚本直跑同 EXIT=3 |
| `pnpm mysql-stack:qdrant-backed:prove` | **0** | inventory：rag/memory:qdrant ∈ **qdrant-native opt-in**；sole-allowlist **恰 5**（P13 OFF）；业务 prove 仍 **pgvector-isolated（20）**；**STILL-GAP G2** |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | 标红诚实；钉 P13 = standalone NOT allowlist；G2 still OPEN；默认仍 EXIT=3 |
| 默认（无 `E2E_ISOLATION_STACK`）`node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0** | banner **`[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy`** + `releaseEvidence=false` · Not HA → **证明默认未翻 sole/Qdrant 业务轨** |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … sole-stack:rag-qdrant:prove` | **1** | `unsupported_e2e_target`（目标未注册；**未**入 allowlist） |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … sole-stack:memory-qdrant:prove` | **1** | 同上 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … rag03-route:prove:raw` | **3** | 默认 rag 路径 sole 拒 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … memory:prove:raw` | **3** | 默认 memory 路径 sole 拒 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node … vectorstore:prove:raw` | **3** | 默认 vectorstore 路径 sole 拒 |

独立观测（正向 EXIT=0）：rag 40 qbank chunks；ANN 自查；暴力余弦 5/5；qbank 共享读；幂等。memory 24 owner-A chunks；跨 owner=0；幂等。SOLE 排除 / 默认 still isolated / G2 open 静态钉全绿。

---

## opt-in 绿 ≠ 升阶（硬钉）

| 命题 | 本审裁定 |
|------|----------|
| P13 `rag:qdrant`/`memory:qdrant` EXIT=0 | **仅** additive standalone opt-in 最小切片登记（G2 **子切片**） |
| 入 sole allowlist | **否**（未入 · 不批） |
| G2 关闭 | **否** |
| `rag*` / `memory*` / `vectorstore:prove` 默认 Qdrant-backed | **否**（**opt-in only**） |
| retrieval-store 已挂 / 可选 Qdrant | **否**（PREREQ 仍开） |
| hybrid / R4 / episode / two-stage covered | **否** |
| fixtures retired / cutover / migrated | **否** |
| sole / `E2E_ISOLATION_STACK` 默认已切 | **否**（仍 `pgvector-legacy`；G1 开） |
| HA / releaseEvidence | **false / Not HA**（禁止升） |

---

## 残留 GAP（对齐 status · 未关）

G1 默认仍 legacy · **G2 Qdrant-backed 业务 prove 未默认**（P11 adapter + P12/P13 opt-in ≠ 关；产品 rag*/memory* 大改写 PREREQ 未解）· G3 `E2E_PG_IMAGE` 未退役 · G4 R4 · G5 erasure ledger · G6 BUG-E2E-ISO · G7 HA/releaseEvidence

---

## 对照

- `ai-docs/delivery/harness/qdrant-rag-prove.md` · `qdrant-memory-prove.md`
- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P13 · G2）
- `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md`
- `packages/qdrant-store/test/rag-qdrant.proof.ts` · `memory-qdrant.proof.ts`
- 前次：`reviews/2026-09-10-g2-p12-vectorstore-qdrant-mw-e2e-ha.md` · `reviews/2026-09-10-p12-sole-allowlist-mw-e2e-ha.md`（B5/B6 · **勿混**）
- 平行：`reviews/2026-09-10-g2-p13-rag-memory-qdrant-mw-rag-route.md`
