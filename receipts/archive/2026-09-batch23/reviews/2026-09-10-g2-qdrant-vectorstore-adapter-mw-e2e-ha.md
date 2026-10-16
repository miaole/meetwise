# 审查 — Meetwise G2 Qdrant vectorstore adapter · P11 · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗独立审 · 主战场工作臂；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT · ~03:15–03:19）  
**切片**：G2 **Qdrant vectorstore adapter real path**（meetwise-core 送审 · status **P11**）  
**Harness / status**：`ai-docs/delivery/harness/qdrant-vectorstore-adapter.md` · `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P11 · **G2 仍开**）· `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md`  
**Prove body**：`packages/qdrant-store/test/qdrant-vectorstore-adapter.proof.ts`  
**Runner / scripts**：根 `pnpm qdrant-store:vectorstore-adapter:prove` → `pnpm -C packages/qdrant-store prove:vectorstore-adapter`  
**releaseEvidence=false** · **Not HA** · **≠ covered（业务/E2E）** · **≠ cutover** · **≠ 翻默认** · **G2 仍开** · **本绿 ≠ HA**

对照前次：`reviews/2026-09-10-qdrant-backed-deepen-mw-e2e-ha.md`（P10 inventory+readyz · G2 仍开）· `reviews/2026-09-10-sole-wiring-mw-e2e-ha.md`（P8 wiring · 默认仍 legacy）。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（P11 adapter 实路径诚实登记；fail-closed 成立；无偷关 G2 / 无翻默认 / 无 HA/`releaseEvidence=true` / 无业务 covered） |
| 是否批准 **P11 adapter real-path** 登记 | **是**（仅 `@meetwise/qdrant-store` thin adapter live upsert+annSearch + honesty 钉；additive） |
| 是否批 **G2 关闭** | **否**（仍开 · status 字面 + 包脚本仍 pgvector-isolated） |
| 是否批 `vectorstore:prove` / `rag*` / `memory*` **默认已切 Qdrant** | **否** |
| 是否批 RAG/memory/vectorstore **业务 E2E covered** | **否**（prove 内「COVERED (this prove)」仅窄指 adapter 本叶；≠ E2E covered） |
| 是否批 fixtures retired / cutover / sole 默认已切 | **否** |
| 是否批 HA / `releaseEvidence=true` | **否**（强制 false；L2/L3 未开） |
| 是否批生产向量真相已切离 pgvector | **否**（`retrieval-store.annSearch` intact；adapter **未**接入 apps/db 业务路径） |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| B1 | **阻塞（切流/假绿）** | **G2**：`vectorstore`/`rag*`/`memory*` 默认 prove **仍** `run-e2e-isolated`→**pgvector**；P11 adapter EXIT=0 **≠** G2 关；禁止把 adapter 绿写成业务默认已切 / covered | **已核验仍开** · 本切片 **不关** G2 |
| B2 | **阻塞（切流/发布）** | 不得宣称 **HA**、`releaseEvidence=true`、covered、cutover、migrated、fixtures retired；adapter 绿 ≠ covered ≠ HA | **强制遵守** · L2/L3 **未开** |
| B3 | **阻塞（假绿面）** | Qdrant `/readyz` 不可达 / 坏 `QDRANT_URL` 必须 **EXIT=3**（禁静默绿） | **本审复现成立** |
| B4 | **阻塞（宣称面）** | P11 = **additive G2 子切片 real path only** → **不得**写成 `vectorstore:prove` 已迁 / RAG/memory on Qdrant / 生产向量路径已切 | **强制遵守** · 生产 import 面仅包内 |
| B5 | **立场钉（非缺陷）** | `qdrant-store:vectorstore-adapter:prove` EXIT=0 = honesty + live adapter upsert/annSearch **only**；NOTE 明示 STILL-GAP G2/G1 | **强制遵守** |
| — | — | **本切片代码/行为面无额外阻塞项** | **无阻塞**（已抽查：fail-closed、默认仍 legacy、包脚本未改道、annSearch intact、无 apps 接线、receipt/harness `releaseEvidence=false`、G2 字面仍开） |
| O1 | **nit（不降级）** | prove NOTE「COVERED (this prove)」若被外推为 E2E/业务 covered 有假绿面风险；正文已钉 STILL-GAP G2 / ≠ RAG/memory covered | **不降级**；外推禁止由 B1/B4 管 |
| O2 | **nit（不降级）** | `upsertVectorChunk` / `annSearch` 自身不调 `requireReadyz`（仅 `ensureCollection` / prove 入口调）；坏 endpoint 仍因 fetch 失败，但入口纪律依赖调用方 | **不降级** · prove 级 fail-closed 已钉；建议后续入口统一 requireReadyz |

**冲突取更严**：他域若把 O1/O2 升 conditional，以更严为准。本域因 fail-closed、G2 仍开、≠翻默认、`releaseEvidence=false` / Not HA 齐全，维持 **pass**（仅 P11 adapter 实路径登记）。

---

## 交付定位（独立）

| 交付物 | 路径 |
|--------|------|
| Adapter 实现 | `packages/qdrant-store/src/vectorstore-adapter.ts` |
| 导出 | `packages/qdrant-store/src/index.ts`（`QdrantVectorStoreAdapter` / `createQdrantVectorStoreAdapter` / `pointIdForChunk`） |
| Prove | `packages/qdrant-store/test/qdrant-vectorstore-adapter.proof.ts` |
| 包 scripts | `packages/qdrant-store/package.json` → `prove:vectorstore-adapter` |
| 根 script | `package.json` → `qdrant-store:vectorstore-adapter:prove` |
| Harness | `ai-docs/delivery/harness/qdrant-vectorstore-adapter.md` |
| Status P11 / G2 | `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md` |
| 深挖 inventory | `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md` + `pnpm mysql-stack:qdrant-backed:prove` |
| 相关（非本切片切流） | `qdrant-store:skeleton:prove` · `qdrant-store:erase-honesty:prove` · `vectorstore:prove`（仍 isolated/pgvector） |

**生产接线抽查**：`createQdrantVectorStoreAdapter` / `QdrantVectorStoreAdapter` 引用仅出现在 `packages/qdrant-store/{src,test}` — **未**接入 `packages/db` / `apps/*` 业务默认路径。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称交付 | 独立结果 |
|----------|----------|
| P11 status Proven 行 | **成立**。status：adapter live upsert/annSearch；缺 Qdrant → EXIT=3；≠ vectorstore 默认已切；≠ RAG/memory covered；≠ G2 关；≠ fixtures retired；≠ HA |
| G2 仍开 | **成立**。status G2 字面「仍未成默认」且明示 P11 ≠ 关闭；prove PASS `status: G2 still open`；deepen NOTE `STILL-GAP G2` |
| fail-closed EXIT=3 | **成立**（本审 `QDRANT_URL=http://127.0.0.1:19999` → **3** + PREREQ + refuse silent fake-green） |
| ≠ 翻默认 | **成立**。`E2E_ISOLATION_STACK` 未设 → `pgvector-legacy`；`isolated-env:prove` banner **R5-MARKED-RED … pgvector-legacy**；`vectorstore`/`memory`/`rag03-route` 仍 `run-e2e-isolated` |
| pgvector 活路径 intact | **成立**。`retrieval-store.ts` 仍 `export async function annSearch`；`vectorstore.proof.ts` 仍绑 pgvector；`E2E_PG_IMAGE` 仍在 |
| `releaseEvidence=false` / Not HA | **成立**。harness 头、status、adapter 头注、prove NOTE 均硬钉；禁令列含禁止 `releaseEvidence=true`（≠ 声称 true） |
| 包脚本未偷关 G2 | **成立**。无 `vectorstore`/`rag*`/`memory*` 改道 `qdrant-store`；deepen inventory 将 adapter 归 **qdrant-native additive**，业务 prove 仍 **pgvector-isolated** |

### 对抗抽查

| 检查 | 结果 |
|------|------|
| adapter 绿 → G2 关闭 / default flipped / covered？ | **未发现偷写**。status/harness/prove 三重钉 G2 仍开 / ≠ 默认 / ≠ RAG/memory covered |
| 「COVERED (this prove)」升阶风险 | **可管控**。限定本叶 upsert+annSearch；同段 NOTE STILL-GAP G2；本审 **拒**升为 E2E covered |
| fail-closed：坏 endpoint | **成立** EXIT=3 |
| 默认仍非 Qdrant-backed 业务默认 | **成立**（脚本路由 + isolated-env banner + deepen inventory） |
| 冒充生产向量路径已切 | **否**。无 apps/db 接线；annSearch intact |
| HA / releaseEvidence=true | **未发现宣称**；强制 false |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `pnpm qdrant-store:vectorstore-adapter:prove`（Qdrant :6333 up） | **0** | honesty + live upsert/annSearch；**仍钉 G2/G1 GAP**；`releaseEvidence=false` · Not HA |
| `QDRANT_URL=http://127.0.0.1:19999 pnpm qdrant-store:vectorstore-adapter:prove` | **3** | PREREQ fail-closed；禁假绿 |
| `QDRANT_URL=http://127.0.0.1:19999 pnpm -C packages/qdrant-store prove:vectorstore-adapter` | **3** | 包脚本直跑同 EXIT=3 |
| `pnpm mysql-stack:qdrant-backed:prove` | **0** | inventory+readyz；adapter 列入 qdrant-native；**STILL-GAP G2** |
| `pnpm conn-stack:qdrant-backed:prove` | **0** | 同上（body） |
| 默认（无 `E2E_ISOLATION_STACK`）`node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0** | banner **`[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy`** + `releaseEvidence=false` · Not HA → **证明默认未翻 sole/Qdrant 业务轨** |

独立观测（正向 EXIT=0）：qbank 自查 top-1、qbank 共享、memory 私有 filter、idempotent pointId、默认仍 legacy、三业务脚本仍 isolated、无 qdrant-store 改道。

---

## adapter 绿 ≠ 升阶（硬钉）

| 命题 | 本审裁定 |
|------|----------|
| P11 adapter EXIT=0 | **仅** additive real-path 登记（G2 **子切片**） |
| G2 关闭 | **否** |
| `vectorstore:prove` / rag* / memory* 默认 Qdrant-backed | **否** |
| 业务 / E2E covered | **否** |
| fixtures retired / cutover / migrated | **否** |
| sole / `E2E_ISOLATION_STACK` 默认已切 | **否**（仍 `pgvector-legacy`；G1 开） |
| HA / releaseEvidence | **false / Not HA**（禁止升） |

---

## 残留 GAP（对齐 status · 未关）

G1 默认仍 legacy · **G2 Qdrant-backed 业务 prove 未默认**（P11 ≠ 关）· G3 `E2E_PG_IMAGE` 未退役 · G4 R4 · G5 erasure ledger · G6 BUG-E2E-ISO · G7 HA/releaseEvidence

---

## 对照

- `ai-docs/delivery/harness/qdrant-vectorstore-adapter.md`
- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P11 · G2）
- `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md`
- `packages/qdrant-store/src/vectorstore-adapter.ts` · `test/qdrant-vectorstore-adapter.proof.ts`
- 前次：`reviews/2026-09-10-qdrant-backed-deepen-mw-e2e-ha.md` · `reviews/2026-09-10-sole-wiring-mw-e2e-ha.md`
