# Status — R5 retirement / sole-stack honesty（north-star parallel）

**状态**：eval-honesty track · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ migrated**  
**平行北星**：`north-star-ha.md`（HA 证据阶梯）∥ 本文件（sole-stack + R5 夹具退役诚实轨）  
**栈裁定**：sole stack = **MySQL + Qdrant + Redis**；`E2E_PG_IMAGE` / pgvector fixture **≠** sole-stack 真相。  
**硬句**：**本绿 ≠ 已迁**；**local green ≠ HA**；`EXIT=0` 仅静态标红/双轨钉 · **不得**冒充夹具已退役或发布证据。

关联：`harness/g6-e2e-iso-blocked.md` · `pnpm g6-e2e-iso-blocked:prove` · `harness/g3-e2e-pg-image.md` · `pnpm g3-e2e-pg-image:prove` · `harness/g1-default-switch-prep.md` · `pnpm g1-default-switch:prep:prove` · `harness/r5-pgvector-fixture-mark-red.md` · `harness/qdrant-backed-prove-deepen.md` · `harness/qdrant-vectorstore-adapter.md` · `harness/qdrant-vectorstore-prove.md` · `harness/qdrant-rag-prove.md` · `harness/qdrant-memory-prove.md` · `harness/qdrant-g5-erasure-ledger.md` · `harness/qdrant-g5-ledger-map.md` · `m5-pgvector-fixture-retirement-plan.md` · `adr-mysql-qdrant-local.md` · `e2e-case-inventory.md` · BUG-FAKE-R5 · `pnpm mysql-stack:r5-mark-red:prove` · `pnpm mysql-stack:qdrant-backed:prove` · `pnpm qdrant-store:vectorstore-adapter:prove` · `pnpm vectorstore:qdrant:prove` · `pnpm rag:qdrant:prove` · `pnpm memory:qdrant:prove` · `pnpm qdrant-store:g5-erasure:prove` · `pnpm qdrant-store:g5-ledger-map:prove` · `harness/retrieval-backend-qdrant.md` · `pnpm retrieval-store:qdrant:prove`

---

## 1. Proven（本轨已钉 · 静态诚实）

| # | 已证明 | 证据 / CMD | 不得外推 |
|---|--------|------------|----------|
| P1 | Sole-stack **叙事钉** = MySQL+Qdrant+Redis | ADR / M5 plan / harness / runner banner | ≠ 生产已切；≠ isolated 默认已换 |
| P2 | R5 **整套 E2E 家族**标红（非单点） | harness + `e2e-case-inventory.md` | ≠ 家族 live 全绿；≠ covered |
| P3 | `vectorstore:prove` / perf 多步 / 评测叶子 **R5-MARKED-RED** | 文件头 + perf `LEGACY/R5-MARKED-RED` | marked-red ≠ deleted；绿 ≠ 迁栈 |
| P4 | `E2E_PG_IMAGE` 文档化为 **NOT sole-stack** | harness + `run-e2e-isolated` banner | ≠ 夹具已退役 |
| P5 | **双轨显式标记**（禁默认可假绿） | `E2E_ISOLATION_STACK`：默认 `pgvector-legacy`；sole 轨显式名 | 默认仍 legacy ≠ sole 已默认 |
| P6 | 生产 pgvector serving **未切**（诚实：未 cutover） | `retrieval-store.ts` annSearch 仍在 | ≠ 应切而未切的借口；切流另审 |
| P7 | 静态 prove EXIT=0 = **标红诚实钉** | `mysql-stack:r5-mark-red:prove` / `conn-stack:r5-mark-red:prove` | ≠ fixtures retired；≠ HA；≠ releaseEvidence |
| P8 | Sole **allowlist**（**恰 5**）可对 compose.mysql-local 跑通（非永久 EXIT=3） | allowlist=`sole-stack:{wiring,ping,qdrant-backed,vectorstore-adapter,vectorstore-qdrant}:prove`（P11/P12 后保守扩；P12=opt-in qdrant prove；**P13 NOT on allowlist**）；`e2e-isolation:sole-*:prove`；gate receipt `.tmp/sole-stack-receipts/` | ≠ 默认已切 sole；≠ disposable；≠ rag/memory/vectorstore **默认**已迁；≠ fixtures retired；≠ G2 关；≠ P13 dual-approved |
| P9 | Additive `qdrant-store` skeleton / erase-honesty（已有） | `qdrant-store:skeleton:prove` / `erase-honesty:prove` EXIT=0（需 Qdrant） | ≠ 0091 ledger；≠ 生产 annSearch 已切；≠ RAG cutover |
| P10 | **Qdrant connect + prove inventory 深挖钉**（原第二枚 P8 · 编号去碰） | `harness/qdrant-backed-prove-deepen.md` + `mysql-stack:qdrant-backed:prove`；readyz :6333；分类 qdrant-native vs pgvector-isolated | ≠ RAG/memory Qdrant-backed；≠ G2 关；readyz 缺 → EXIT=3 PREREQ |
| P11 | **Qdrant vectorstore adapter real path**（G2 子切片） | `harness/qdrant-vectorstore-adapter.md` + `qdrant-store:vectorstore-adapter:prove`；live upsert/annSearch；缺 Qdrant → EXIT=3 | ≠ `vectorstore:prove` 默认已切；≠ RAG/memory covered；≠ G2 关；≠ fixtures retired；≠ HA |
| P12 | **Opt-in product vectorstore prove → Qdrant bridge**（G2 子切片） | `harness/qdrant-vectorstore-prove.md` + `vectorstore:qdrant:prove`；`ProductVectorStoreQdrantBridge`→adapter live；缺 Qdrant → EXIT=3；**PREREQ（P14 已关选择器）**：全量 SQL/HNSW/qbank generation 仍大改写；默认未切 | ≠ 默认 `vectorstore:prove` 已切；≠ RAG/memory covered；≠ G2 关；≠ fixtures retired；≠ HA |
| P13 | **Opt-in minimal rag/memory Qdrant prove slices**（G2 子切片 · **standalone only**） | `harness/qdrant-rag-prove.md` + `rag:qdrant:prove`；`harness/qdrant-memory-prove.md` + `memory:qdrant:prove`；复用 P12 bridge→adapter live 最小检索/memory 向量切片；缺 Qdrant → EXIT=3；**NOT** on `SOLE_WIRING_ALLOWLIST`；**PREREQ**：产品 `rag*`（hybrid/route/generation/serving_scope）与 lean `memory:prove`（episode/非向量）/`memory-two-stage-recall`（admission/consent）全量迁 Qdrant 仍大改写（P14=选择器 ≠ 全量 covered） | ≠ 默认 `rag*`/`memory*` 已切；≠ sole allowlist 扩面；≠ hybrid/R4/episode/two-stage covered；≠ G2 关；≠ fixtures retired；≠ HA |
| P14 | **Product retrieval backend selector → Qdrant**（G2 子切片 · **standalone**；关闭选择器 PREREQ） | `harness/retrieval-backend-qdrant.md` + `retrieval-store:qdrant:prove`；`packages/db/src/retrieval-backend.ts` · `RETRIEVAL_VECTOR_BACKEND=qdrant`（**默认仍 pgvector**）；live Qdrant EXIT=0；坏 URL EXIT=3；**NOT** on `SOLE_WIRING_ALLOWLIST`；诚实：generation/hybrid/HNSW/RLS/serving_scope **未**迁 | ≠ 默认 `vectorstore:prove`/`rag*`/`memory*` 已切；≠ sole allowlist 扩面；≠ 全量 RAG covered；≠ G2 关；≠ fixtures retired；≠ HA；≠ cutover |
| P15 | **G5 子切片：subject-scoped Qdrant erase + countable receipt + recall=0**（**standalone only**） | `harness/qdrant-g5-erasure-ledger.md` + `qdrant-store:g5-erasure:prove`；`eraseSubjectPoints` / `eraseSubjectMemoryVectors`；缺 Qdrant → EXIT=3；公开 DELETE **仍 503**（源码钉）；**NOT** on sole allowlist | ≠ **G5 关**（**recall=0+receipt ≠ 0091 ledger**）；≠ privacy covered；≠ DELETE 200/202；≠ 授权根/域 sink 进 ledger；≠ cutover；≠ HA |
| P17 | **G3 `E2E_PG_IMAGE` retirement path marked + sole fail-closed**（**≠** 默认镜像值退役 · **≠** flip isolation） | `harness/g3-e2e-pg-image.md` + `pnpm g3-e2e-pg-image:prove`；`LEGACY_PG_IMAGE_DEFAULT` 仍 `pgvector/pgvector:pg16`；sole + 显式 `E2E_PG_IMAGE` / 非 `compose.mysql-local` approved fixture → EXIT=3 `[G3-E2E-PG-IMAGE]`；defense-in-depth 禁 sole docker-run PG | ≠ **G3 关=默认已退役**；≠ flip `E2E_ISOLATION_STACK`；≠ fixtures retired；≠ G1/G2 关；≠ HA |
| P18 | **G6 Key-unset e2e:isolated/LIVE family blocked honesty pin**（≠ G6 关 · ≠ BUG-E2E-ISO 关） | `harness/g6-e2e-iso-blocked.md` + `pnpm g6-e2e-iso-blocked:prove`；同族 `uc001:live-blocked:prove`；LIVE HTTP/UI 无 Key → blocked + `live_provider_key_missing` fail-closed；有 Key 硬跑 Path 已文档化；**不读** `.env*`；**未**硬跑无 Key live | ≠ **G6 关**；≠ family green / covered；≠ sole 整套复跑收据；≠ flip default；≠ HA
| P16 | **G5 子切片：P15→0091 receipt schema/mapping + fail-closed PREREQ**（**standalone only**） | `harness/qdrant-g5-ledger-map.md` + `qdrant-store:g5-ledger-map:prove`；`ledger-receipt-map.ts`；产品账本对 Qdrant **不可写** → 非空 PREREQ；公开 DELETE **仍 503**；**NOT** on sole allowlist | ≠ **G5 关**（**mapping ≠ 0091 可写/对齐**）；≠ privacy covered；≠ DELETE 200/202；≠ sink 登记；≠ authz 根；≠ cutover；≠ HA |

---

## 2. GAP（仍未关闭 · R5 retirement / sole-stack）

> **Main-track（G7 · 2026-09-16 ~23:16 PT）**：**sole夹具退役 ⋂ scor-00** — inventory **`G7-SCOR00-PG-FIXTURE`**. Canonical：`harness/g7-sole-fixture-retire-scor00.md`. Pre-exec dual **PASS** · post-prove dual **PASS**（mw-e2e-ha + mw-rag-route · 6 CMD EXIT=0 · rag fresh rerun）· status **`post_prove_dual_pass`（honesty only）**. Landed：`pnpm scor-00:sole-fixture:prove`（sole honesty · allowlist 恰 5 未扩）· legacy scor Nest HTTP fixture seed（createJob+rule classify）+ `[G7-SCOR00-PG-FIXTURE]` R5-MARKED-RED · **未 flip** `E2E_ISOLATION_STACK` default · Nest-on-MySQL **PREREQ GAP**. **R5 green-risk retained** · **≠ R5 retired** · **≠ sole cutover complete** · **≠ G1 flip** · **≠ R4 closed** · **≠ suite green** · **R2/R4 still open** · `releaseEvidence=false` · **≠HA** · F1 REQUEST dual **OPENED**（coding still needs F1 pre-exec dual + authorize；no self-approve）.


| # | 缺口 | 关闭条件（未宣称达成） | 阻塞切流？ |
|---|------|------------------------|------------|
| G1 | **isolated 默认仍 `pgvector-legacy`**（**prep landed** · `harness/g1-default-switch-prep.md` 清单/回滚/gates · **flip NOT open** · **禁止本轮翻默认**）；sole allowlist **恰 5**（wiring/ping/qdrant-backed/adapter/vectorstore-qdrant；共享 compose ≠ disposable；**仍不含** rag/memory/`vectorstore:prove` 默认） | 默认切 **MySQL+Qdrant+Redis** isolation（或业务 prove 不再依赖 `E2E_PG_IMAGE`）；disposable per-run sole fixtures；宽业务 allowlist 另审；**须先** §4 prove gates + 双域审（见 prep harness） | 是（假绿面） |
| G2 | **Qdrant-backed** 向量/RAG/memory prove **仍未成默认**（P10 inventory + **P11 adapter** + **P12** `vectorstore:qdrant` + **P13** `rag:qdrant`/`memory:qdrant` + **P14** selector opt-in ≠ 关闭） | 关键 ANN/hybrid/recall prove **默认**打 Qdrant fixture；`vectorstore:prove`/`rag*`/`memory*` 仍 `run-e2e-isolated`→pgvector（opt-in qdrant proves + P14 选择器 ≠ 默认迁移；product rag/memory 全量特征大改写仍未解） | 是 |
| G3 | `E2E_PG_IMAGE` **默认值仍未退役**（**path marked** · `harness/g3-e2e-pg-image.md` · sole **fail-closed** 禁 unmarked pgvector 假绿 · **≠ flip** `E2E_ISOLATION_STACK` · **默认镜像值仍 OPEN**） | 仅当 G1+G2 + 独立审后改默认或删除 legacy 静默默认值；本切片只关「sole 不得假绿 / retirement path 钉」，**不**关「默认镜像已删」 | 是（legacy 默认假绿面仍在） |
| G4 | R4 题域隔离 **NOT closed**（诚实钉 + **partial P-WIRE**；**dispatch/recheck 未接线** honesty PREREQ；**prove 绿 ≠ 关**；**≠ wrong_track=0**） | M4/M5 门；未证隔离前不得切题库/向量真相；见 `harness/r4-domain-isolation.md` / `pnpm g4-dispatch-recheck-prereq:prove` / GAP-RAG-04 | 是（并行门） |
| G5 | Qdrant erasure sink **recall=0 + 逐 sink receipt** 未对齐 0091 ledger（**P15** subject erase + **P16** schema/mapping/PREREQ **≠** 关闭本 GAP） | before cutover；**recall=0+receipt ≠ 0091**；mapping ≠ ledger 可写；公开 DELETE 仍 503；count-honesty/P15/P16 ≠ ledger 对齐 | 是 |
| G6 | 宽 `e2e:isolated` / LIVE / performance **整套复跑**未关 BUG-E2E-ISO（**P18** Key-unset **blocked honesty landed** · `g6-e2e-iso-blocked:prove` · **≠** 关本 GAP；无 Key 禁止硬跑假绿；有 Key 后仍须 sole 复跑 + inventory 复审） | Key 到位硬跑收据 + sole-stack 整套复跑 + mw-e2e-ha 对照 inventory 复审 | 是（E2E 诚实） |
| G7 | **HA / releaseEvidence** | 见 §3；本地 sole-stack 绿 **不够** | 是（发布） |

---

## 3. Local green ≠ HA（发布证据阶梯）

| 阶 | 内容 | 本轨状态 |
|----|------|----------|
| L0 | 静态标红 + 双轨显式标记 + sole-stack 叙事钉 | **本绿可达**（`r5-mark-red:prove`） |
| L1 | isolated / 业务 prove 默认 sole-stack（MySQL+Qdrant+Redis）或 pgvector 仅显式 opt-in legacy | **GAP**（G1–G3；G3=path/fail-closed landed ≠ 默认镜像退役）；P8 allowlist（含 ping/qdrant-backed/adapter/vectorstore-qdrant）≠ L1 关闭 |
| L2 | 多实例拓扑（同 VPC / 多 replica） | **未开** — **local green ≠ HA** |
| L3 | 故障注入（kill instance / net partition / redis/qdrant/mysql 单点）+ 恢复证明 | **未开** — **need multi-instance + fault-inject for releaseEvidence** |
| L4 | `releaseEvidence=true` + CI + 独立双域审 | **禁止**直至 L2+L3 收据齐；本文件 **永远不自勾** |

**硬禁**：不得把 `mysql-stack:*` / `conn-stack:*` / 本 status / mark-red EXIT=0 写成 HA、covered、cutover、migrated、`releaseEvidence=true`。

---

## 4. Dual-track（推动默认切 sole · 禁静默假绿）

| Track | `E2E_ISOLATION_STACK` | 含义 | 默认可假绿？ |
|-------|----------------------|------|--------------|
| **Legacy（当前默认）** | `pgvector-legacy` | 临时 PG/pgvector isolation；R5-MARKED-RED | **禁止静默** — 必须 banner + 标红 |
| **Sole（目标默认）** | `mysql-qdrant-redis` | MySQL+Qdrant+Redis；`compose.mysql-local.yml` 类 | 目标轨；**allowlist** wiring/ping/qdrant-backed/adapter/vectorstore-qdrant **可绿**；**rag/memory/`vectorstore:prove` 默认 / 全量 / disposable isolation 仍 GAP** |

推动规则（诚实）：

1. Runner **必须**解析并打印 `E2E_ISOLATION_STACK`（缺省写入 `pgvector-legacy`，不得无名默认）。  
2. Sole 名显式出现在 banner / harness / 本 status（推动默认切）。  
3. pgvector 路径 **不得**被叙述为 sole-stack 或「已默认可信」。  
4. 未实现的 sole isolation **不得假绿**（非 allowlist 的 sole 请求 → EXIT=3 + PREREQ 清单；allowlist 绿 ≠ 默认已切 ≠ 夹具退役 ≠ G2 关）。

---

## 5. Prove CMD（诚实钉）

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | 标红 + 双轨 + 本 status proven/GAP 钉；**仅诚实** |
| `pnpm g1-default-switch:prep:prove` | **0** | G1 **PREP only**：默认仍 legacy + prep docs + **不翻 env**；**≠** flip open；**≠** G1 关 |
| `pnpm g3-e2e-pg-image:prove` | **0** | G3 **path marked + sole fail-closed**：默认 `E2E_PG_IMAGE` 仍 pgvector；sole+显式 image/非批准 fixture → EXIT=3；**≠** 默认镜像退役；**≠** flip isolation |
| `pnpm g6-e2e-iso-blocked:prove` | **0** | G6 **Key-unset blocked honesty**：LIVE HTTP/UI 无 Key=blocked；fail-closed 源码钉；**≠** family 绿；**≠** G6/BUG-E2E-ISO 关；有 Key 硬跑 Path 仅文档 |
| `pnpm conn-stack:r5-mark-red:prove` | **0** | 同上（conn-stack body） |
| `pnpm mysql-stack:m5-fixtures:prove` | **0** | M5 计划骨架；≠ 夹具已换 |
| `pnpm mysql-stack:sole-wiring:prove` / `conn-stack:sole-wiring:prove` | **0**（compose up） | sole compose 连通 + receipt；≠ 默认已切；≠ disposable；≠ HA |
| `pnpm e2e-isolation:sole-wiring:prove` | **0**（compose up） | allowlist wiring；gate receipt |
| `pnpm e2e-isolation:sole-ping:prove` | **0**（compose up） | allowlist ping（conn）；gate receipt；≠ RAG |
| `pnpm e2e-isolation:sole-qdrant-backed:prove` | **0**（Qdrant up）/ **3** | allowlist inventory+readyz；**仍钉 G2 开** |
| `pnpm e2e-isolation:sole-vectorstore-adapter:prove` | **0**（Qdrant up）/ **3** | allowlist P11 adapter real-path；≠ vectorstore/rag/memory 默认；≠ G2 关 |
| `pnpm e2e-isolation:sole-vectorstore-qdrant:prove` | **0**（Qdrant up）/ **3** | allowlist P12 opt-in `vectorstore:qdrant:prove` path + gate receipt；≠ `vectorstore:prove`/rag*/memory* 默认；≠ G2 关 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs isolated-env:prove`（及任意非 allowlist：migrate / rag* / memory* / vectorstore…） | **3** | fail-closed + PREREQ；禁假绿 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis E2E_PG_IMAGE=pgvector/pgvector:pg16 node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** | **G3** sole + unmarked `E2E_PG_IMAGE` fail-closed（`[G3-E2E-PG-IMAGE]`） |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis E2E_SOLE_APPROVED_FIXTURE=bogus … sole-stack:wiring:prove` | **3** | **G3** without approved fixture config（需 `compose.mysql-local`） |
| `E2E_ISOLATION_STACK=bogus …` | **2** | unknown stack 拒识 |
| 默认（无 `E2E_ISOLATION_STACK`）`… isolated-env:prove` | **0**（leaf） | banner 仍 **pgvector-legacy**；证明默认未切 sole |
| `pnpm mysql-stack:qdrant-backed:prove` | **0**（Qdrant up）/ **3**（PREREQ） | inventory + readyz；**钉 G2 仍开**；≠ RAG/memory on Qdrant |
| `pnpm conn-stack:qdrant-backed:prove` | **0** / **3** | 同上（body） |
| `pnpm qdrant-store:skeleton:prove` | **0**（需 Qdrant） | additive store 原型 only |
| `pnpm qdrant-store:erase-honesty:prove` | **0**（需 Qdrant） | count honesty；≠ 0091 ledger |
| `pnpm qdrant-store:g5-erasure:prove` | **0**（Qdrant up）/ **3**（PREREQ） | **P15** subject erase + recall=0 + countable receipt；**仍钉 G5 开**（≠ 0091）；公开 DELETE 仍 503；**NOT** sole allowlist |
| `pnpm qdrant-store:g5-ledger-map:prove` | **0**（静态） | **P16** schema/mapping + fail-closed PREREQ（ledger not writable）；**仍钉 G5 开**；公开 DELETE 仍 503；**NOT** sole allowlist |
| `pnpm qdrant-store:vectorstore-adapter:prove` | **0**（Qdrant up）/ **3**（PREREQ） | P11 adapter upsert/annSearch live；**仍钉 G2 开**；≠ vectorstore/rag/memory 默认已切；≠ HA |
| `pnpm vectorstore:qdrant:prove` | **0**（Qdrant up）/ **3**（PREREQ） | P12 opt-in product-shaped prove via bridge→adapter；**仍钉 G2 开**；默认 `vectorstore:prove` intact；≠ RAG/memory covered；≠ HA |
| `pnpm rag:qdrant:prove` | **0**（Qdrant up）/ **3**（PREREQ） | P13 **standalone** opt-in 最小 RAG 检索切片 via bridge（**NOT** sole allowlist）；**仍钉 G2 开**；默认 `rag*` intact；≠ hybrid/R4 covered；≠ HA |
| `pnpm memory:qdrant:prove` | **0**（Qdrant up）/ **3**（PREREQ） | P13 **standalone** opt-in 最小 memory 向量切片 via bridge（**NOT** sole allowlist）；**仍钉 G2 开**；默认 `memory*` intact；≠ episode/two-stage covered；≠ HA |
| `pnpm retrieval-store:qdrant:prove` | **0**（Qdrant up）/ **3**（PREREQ/坏 URL） | P14 **standalone** product-selector：`RETRIEVAL_VECTOR_BACKEND=qdrant`；默认/unset=pgvector；**仍钉 G2 开**；≠ 全量 RAG covered；≠ HA；**NOT** sole allowlist |
| `E2E_ISOLATION_STACK=bogus node scripts/run-e2e-isolated.mjs isolated-env:prove` | **2** | unknown stack 拒识 |

---

## 6. 审查

- 双域：`mw-e2e-ha` + `mw-rag-route` 对照本 status + mark-red harness + `g3-e2e-pg-image`（**G3 path ≠ 默认退役**） + `g1-default-switch-prep`（**G1 prep ≠ flip**） + `g6-e2e-iso-blocked`（**G6 Key-unset blocked ≠ G6 关**） + `qdrant-backed-prove-deepen` + `qdrant-vectorstore-adapter` + `qdrant-vectorstore-prove` + `qdrant-rag-prove` + `qdrant-memory-prove`
- **G5 / P15 / P16**：`mw-privacy-int` **必须** + `mw-rag-route`（或 `mw-e2e-ha`）对照 `qdrant-g5-erasure-ledger.md` + `qdrant-g5-ledger-map.md`；**禁止自批** ledger 对齐 / DELETE 开放 / G5 关闭
- **P14 selector**：另见 `retrieval-backend-qdrant.md`（G2；≠ G5）  
- 合入/切流权在协调/用户；**禁止自批 cutover / HA**  
- 结论落 `ai-docs/delivery/reviews/`
