# 审查 — Meetwise Qdrant-backed prove 深挖 · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗独立审 · 实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT · ~03:04–03:10）  
**切片**：Qdrant-backed prove **深挖**（inventory classify + `/readyz` connect pin）  
**Harness / status**：`ai-docs/delivery/harness/qdrant-backed-prove-deepen.md` · `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（G2 · 第二枚 P8）  
**Prove body**：`scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs`（根 `scripts/mysql-stack.qdrant-backed.prove.mjs` = S4 forwarder）  
**releaseEvidence=false** · **≠ HA** · **≠ cutover** · **≠ fixtures retired** · **≠ RAG/memory on Qdrant** · **G2 仍开**

平行他域：`reviews/2026-09-10-qdrant-backed-deepen-mw-rag-route.md`（pass；本域独立复跑，不采信）。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（inventory+readyz 诚实深挖钉；硬审点全过；无偷关 G2 / 无 HA 宣称） |
| 是否批准 **inventory + connect pin** 诚实登记 | **是** |
| 是否批 RAG/memory/vectorstore **Qdrant-backed covered** | **否** |
| 是否批 **G2 关闭** | **否**（仍开 · 字面+包脚本钉） |
| 是否批 fixtures retired / cutover / sole 默认已切 | **否** |
| 是否批 HA / `releaseEvidence=true` | **否** |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| B1 | **阻塞（切流/假绿）** | **G2**：`vectorstore`/`rag*`/`memory*` 默认 prove **仍** `run-e2e-isolated`→**pgvector**；深挖 EXIT=0 **≠** G2 关；禁止把 inventory/readyz 绿写成 RAG/memory on Qdrant | **已核验仍开** · 本切片 **不关** G2 |
| B2 | **阻塞（切流/发布）** | 不得宣称 **HA**、`releaseEvidence=true`、covered、cutover、migrated、fixtures retired；local green ≠ HA | **强制遵守** · L2/L3 **未开** |
| B3 | **阻塞（假绿面）** | Qdrant `/readyz` 不可达必须 **EXIT=3**（禁静默绿）；sole 非 allowlist 请求必须 **EXIT=3** | **本审复现成立** |
| B4 | **阻塞（宣称面）** | `qdrant-store:skeleton` / `erase-honesty` / `mysql-stack:ping` / 本 prove = **additive / conn / honesty only** → **不得**写成 Qdrant-backed RAG/memory covered | **强制遵守** · inventory 表「可宣称？」列诚实 |
| B5 | **立场钉（非缺陷）** | `mysql-stack:qdrant-backed:prove` EXIT=0 = inventory 分类 + readyz connect **only**；NOTE 明示 STILL-GAP G2 | **强制遵守** |
| O1 | **nit（不降级）** | status Proven 表 **两枚 P8**（allowlist wiring + qdrant-backed deepen）；P9 已被 additive qdrant-store 占用 → 编号碰撞 | **不降级**；建议 deepen 改 P10 或重编号 |
| O2 | **nit（不降级）** | deepen harness Fail-closed 行写「sole wiring **GAP** → 3」，未区分 **allowlist wiring 可 0**（status §5 已分）；本审复跑非 allowlist=`isolated-env:prove` 仍 **3** | **不降级**；建议 harness 行改为「非 allowlist sole → 3」 |
| O3 | **nit（不降级）** | prove 运行时 inventory 把 `e2e-isolation:sole-wiring:prove` 扫进 **pgvector-isolated** 桶（启发式：凡 `run-e2e-isolated` 即归 pgvector）；实际脚本显式 `E2E_ISOLATION_STACK=mysql-qdrant-redis` | **不降级** · **未**把 sole-wiring 写成 G2 covered；建议分类加 sole-wiring 桶 |

**冲突取更严**：他域若把 O1–O3 升 conditional，以更严为准。本域因硬审点（inventory 诚实边界、G2 仍开、EXIT=3、≠HA）齐全，维持 **pass**。

---

## 硬审点核验（对抗 · 独立）

### 1. Inventory 诚实（不得把 conn-only/skeleton 写成 covered）

| 检查 | 结果 |
|------|------|
| harness §2 分类表 | **诚实**。Qdrant-native skeleton/erase → Additive only；ping → 连通 only；本 prove → ≠ RAG/memory covered；`vectorstore`/`rag*`/`memory*` → **GAP G2 · 禁止** |
| prove COVERED NOTE | **窄**：仅 `inventory classify + Qdrant /readyz connect pin when EXIT=0` |
| status P8 deepen「不得外推」 | **成立**：≠ RAG/memory Qdrant-backed；≠ G2 关 |
| 包脚本路由 | **成立**：无 `vectorstore`/`rag*`/`memory*` 脚本改道 `qdrant-store`（prove 硬 FAIL 若改道） |
| 假绿：skeleton/conn→covered？ | **未发现** |

### 2. G2 未关

| 项 | 本审裁定 |
|----|----------|
| **G2 是什么** | status §2：**Qdrant-backed** 向量/RAG/memory prove **仍未成默认**；关闭条件=关键 ANN/hybrid/recall 默认打 Qdrant fixture；当前 `vectorstore`/`rag*`/`memory*` 仍 `run-e2e-isolated`→pgvector |
| 字面仍开 | **是**。「仍未成默认」「深挖 inventory 已钉 ≠ 关闭」 |
| prove 钉 | **PASS** `status: G2 still open`；NOTE `STILL-GAP G2` |
| 偷偷关掉？ | **否**。REQUIRED_PGVECTOR_ISOLATED 仍要求 `vectorstore`/`memory`/`rag03`/`rag-generation`/`rag-corpus-version` 走 isolated |

### 3. fail-closed EXIT=3（sole / qdrant 路径）

| 路径 | 本审 EXIT |
|------|-----------|
| `QDRANT_URL=http://127.0.0.1:19999` + `node scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs` | **3**（PREREQ readyz） |
| 同上 via 根 forwarder `scripts/mysql-stack.qdrant-backed.prove.mjs` | **3** |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3**（非 allowlist；打印 G2 等 PREREQ；Refuse silent fake-green） |

### 4. ≠ HA

| 检查 | 结果 |
|------|------|
| harness / status / prove 头 | **releaseEvidence=false** · **Not HA** |
| 偷写 HA / releaseEvidence=true？ | **未发现** |
| G7 | 仍开（HA/releaseEvidence） |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `node scripts/mysql-stack.qdrant-backed.prove.mjs`（≡ `pnpm mysql-stack:qdrant-backed:prove`；Qdrant :6333 up） | **0** | inventory+readyz；**仍钉 G2 GAP**；≠ RAG/memory covered |
| `node scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs`（≡ `pnpm conn-stack:qdrant-backed:prove`） | **0** | 同上（body） |
| `QDRANT_URL=http://127.0.0.1:19999 node scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs` | **3** | PREREQ fail-closed；禁假绿 |
| `QDRANT_URL=http://127.0.0.1:19999 node scripts/mysql-stack.qdrant-backed.prove.mjs` | **3** | forwarder 透传 EXIT=3 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** | sole 非 allowlist fail-closed；文案含 status G2 |

独立观测 inventory NOTE（EXIT=0 跑）：qdrant-native=2（skeleton/erase-honesty）；pgvector-isolated≈21（含 vectorstore/memory/rag*；**误桶** sole-wiring 见 O3）；static/conn=8（含本 prove / ping / r5 / m4）。

---

## 对抗假绿摘要

| 假绿叙事 | 本审 |
|----------|------|
| 「qdrant-backed:prove 绿 = RAG/memory 已在 Qdrant」 | **拒**。COVERED 仅 inventory+readyz |
| 「skeleton/erase/ping 绿 = G2 关 / covered」 | **拒**。Additive / 连通 only |
| 「G2 已被深挖关闭」 | **拒**。status G2 仍开；包脚本仍 pgvector-isolated |
| 「sole mysql-qdrant-redis 已可跑业务 prove」 | **拒**。非 allowlist → EXIT=3；allowlist wiring ≠ L1 |
| 「本绿 = HA / releaseEvidence / fixtures retired / cutover」 | **拒** |

---

## 残留 GAP（status 对齐 · 未关）

G1 默认仍 legacy · **G2 Qdrant-backed 未默认** · G3 `E2E_PG_IMAGE` 未退役 · G4 R4 · G5 erasure ledger · G6 BUG-E2E-ISO · G7 HA/releaseEvidence

---

## 对照

- `ai-docs/delivery/harness/qdrant-backed-prove-deepen.md`
- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`
- `scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs`
- 他域：`reviews/2026-09-10-qdrant-backed-deepen-mw-rag-route.md`
- 前序：`reviews/2026-09-10-r5-sole-stack-mw-e2e-ha.md` · `…-qdrant-store-mw-rag-route.md` · `…-qdrant-erase-count-honesty-mw-privacy-int.md`
