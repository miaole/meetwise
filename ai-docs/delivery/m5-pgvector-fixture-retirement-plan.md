# M5 — pgvector prove 夹具退役计划（R5）

**状态**：plan draft · **releaseEvidence=false** · Not HA · 不宣称 controlPlaneClosed  
**栈裁定**：**MySQL + Qdrant + Redis** 为架构 **当前唯一真相**（sole stack）；本文件是 **R5 夹具退役计划**，不是向量真相切流、不是生产检索改造。  
**本切片范围（协调方已确认）**：**仅计划文档** + 静态 `mysql-stack:m5-fixtures:prove`；**不切向量真相** / **不切 pgvector serving** / **不切 qbank 生产路径** / **不改 production retrieval**；**不宣称题域隔离已关**；**不宣称 RAG 已切流 / cutover**。  
**实现方不自批切流**：合入/切流前须独立审查 + 相关 prove 退出码；本里程碑 **禁止自批 cutover**。  
**硬句**：**pass ≠ cutover**；**本绿 ≠ 已迁**；本 prove 绿 **≠** 夹具已换 **≠** 向量已迁 **≠** RAG 已切流。

关联：`ai-docs/delivery/adr-mysql-qdrant-local.md`（R5 / M5）；`ai-docs/delivery/m4-rag-hard-gates.md`（R1–R5 硬门；R5 夹具换新属 M5）。

---

## 0. 本切片硬钉（静态 prove 会匹配）

| 钉 | 裁定 |
|----|------|
| M5 本切片交付 | **仅计划文档** `m5-pgvector-fixture-retirement-plan.md` + 静态 `mysql-stack:m5-fixtures:prove` |
| 栈 | **MySQL+Qdrant+Redis sole stack**；不以 legacy `compose.dev.yml` 双跑为主路径 |
| 向量 / serving / qbank | **不切向量真相**；**不切 pgvector serving**；**不切 qbank 生产路径**；**不改 production retrieval**（`retrieval-store` / `hybridQbankSearch` / `annSearch` 等代码本切片不动） |
| R5 | **假绿风险** 仍在：`vectorstore:prove` / `run-e2e-isolated`（`E2E_PG_IMAGE`→`pgvector/pgvector:pg16`）等仍绑 pgvector；本地绿 ≠ RAG 已迁 |
| R4 | **题域隔离 NOT closed**；显式 **M4/M5 门** —— 未证明隔离前不得切题库/向量真相 |
| 擦除 | **Qdrant as erasure sink**：删后 **recall=0** + **逐 sink receipt**（per-sink receipt）须在向量切流前证明；**metadata stays relational** |
| 目标（后续切片，非本绿） | pgvector fixtures → **Qdrant-backed** 或 **marked-red retirement**（legacy fixture，不得当迁栈证据） |
| 证据 | `releaseEvidence=false`；Not HA；不勾 `controlPlaneClosed=true`；**cutover blocked until proves**；**pass ≠ cutover**；**本绿 ≠ 已迁** |

中文钉死：

- **不切向量真相**
- **本绿 ≠ 已迁**
- **pass ≠ cutover**
- **MySQL+Qdrant+Redis sole stack**
- **R5 假绿风险**（直至 Qdrant fixtures / marked-red）
- **题域隔离 NOT closed**（R4 → M4/M5 gate）
- **Qdrant as erasure sink**（recall=0 + 逐 sink receipt）** before cutover**
- **metadata stays relational**
- **禁止自批 cutover**

---

## 1. 目标态（sole stack；夹具退役 ≠ 真相切流）

| 面 | 目标 | 本切片 |
|----|------|--------|
| 架构真相 | **MySQL + Qdrant + Redis sole stack** | 只钉；不切生产 |
| Prove 夹具 | 关键 RAG/向量/memory prove **不再默认**依赖临时 `pgvector/pgvector:*`；改为 **Qdrant-backed** 隔离夹具，或 **marked-red retirement**（脚本保留但标红：legacy / 不得当迁栈证据） | **仅计划**；不换夹具、不删 `vectorstore:prove` |
| 生产检索 | 仍可走现有 pgvector serving，直至独立切流批准 | **不切向量真相**；**不改 production retrieval** |
| RAG_REDIS | ADR M5：RAG_REDIS 本地 + prove 去 pgvector 夹具 | 本计划登记；本切片不接线生产 Redis 检索 |

**硬句**：夹具退役计划绿 **≠** 向量真相已迁；**本绿 ≠ 已迁**；**pass ≠ cutover**。

---

## 2. 库存：仍绑 pgvector / `run-e2e-isolated` 的 prove（实查）

下列为 **R5 假绿面**：绿只能证明「临时 pgvector 夹具上的旧路径」，**不得**写作 Qdrant/sole-stack 已迁。

### 2.1 夹具根：`run-e2e-isolated` + `E2E_PG_IMAGE`

| 入口 | 实查钉 |
|------|--------|
| `scripts/run-e2e-isolated.mjs` | `const image = process.env.E2E_PG_IMAGE ?? 'pgvector/pgvector:pg16'`（默认临时 **pgvector** 镜像） |
| 根 `package.json` | 大量 `*:prove` → `node scripts/run-e2e-isolated.mjs …:raw`（凡走该 runner 的 isolation prove 默认吃同一 PG 夹具） |

### 2.2 向量 / RAG 核心（高优先退役或标红）

| 脚本 / 证明体 | 绑定方式 |
|---------------|----------|
| `pnpm vectorstore:prove` → `vectorstore:prove:raw` → `packages/db` `prove:vectorstore` | `packages/db/test/vectorstore.proof.ts`：**真 Postgres + pgvector HNSW**；`annSearchLegacy`；经 `run-e2e-isolated` |
| `pnpm rag03-route:prove` … `rag07-free-text-route:prove` | 均经 `run-e2e-isolated` → `packages/db` 对应 `prove:rag0*`（隔离 PG 夹具） |
| `pnpm rag-generation:prove` / `qbank:prove` | `run-e2e-isolated` → worker `prove:qbank-generation` |
| `pnpm rag-corpus-version:prove` / `rag-control-role:prove` / `rag-control-upgrade:prove` / `rag-control-dispatch:prove` | `run-e2e-isolated` → `packages/db` rag-control* |
| `pnpm qbank-control-role:prove` / `qbank-handoff-closure:prove` / `qbank-pipeline:prove` / `qbank-integrity-upgrade:prove` | `run-e2e-isolated`；控制面/管线仍吃临时 PG |
| `pnpm rag:adversarial:pg-eval` | `apps/worker/smoke/rag-adversarial-pg-eval.ts`：**legacy compatibility** embedding → pgvector/RLS/`annSearchLegacy` |
| `apps/worker/test/qbank-retrieval-eval-pg.proof.ts` | 真实 PG FTS + **pgvector ANN** + `hybridQbankSearch`（命名已钉 `-pg`） |
| `pnpm qbank:retrieval:fixture:prove` / `qbank:retrieval:eval` | worker smoke；与 PG/retrieval fixture 同族（发布边界见 testing docs） |

### 2.3 Memory / 擦除（夹具仍 PG；擦除 sink 先例）

| 脚本 / 证明体 | 绑定方式 |
|---------------|----------|
| `pnpm memory:prove` | `run-e2e-isolated` → worker `prove:memory`（临时 pgvector 集群启停；见 architecture 文档） |
| `pnpm memory-governance:prove` / `memory-admission:prove` / `memory-fact-adjudication:prove` / `memory-index-generation:prove` / `memory-two-stage-recall:prove` / `memory-control-surface:prove` | 均经 `run-e2e-isolated` → `packages/db` memory* |
| `pnpm memory-vector-chunk-erasure:prove` | `run-e2e-isolated` → `packages/db` `prove:memory-vector-chunk-erasure`；关系库侧 erasure 先例（`0125` / `memory-vector-chunk-erasure.ts`）；**迁 Qdrant 后须另证 Qdrant sink** |

### 2.4 性能 / 套件入口

| 入口 | 绑定方式 |
|------|----------|
| `scripts/run-e2e-performance-suite.mjs` | 含 `['pgvector HNSW compatibility proof', ['vectorstore:prove']]` |
| `pnpm e2e:isolated` / 宽 isolation 套件 | 同一 `E2E_PG_IMAGE` 根夹具 |

**本切片**：只登记库存；**不换夹具**、不删脚本、不改 `E2E_PG_IMAGE` 默认、不切 `retrieval-store`。

---

## 3. 退役目标策略（后续切片执行；本切片不执行）

对上表每个入口，后续必须二选一（或分阶段组合），**且不得**用绿假充迁栈：

| 策略 | 含义 | 关闭条件（未在本切片达成） |
|------|------|---------------------------|
| **A. Qdrant-backed** | isolation runner / prove 体改为打本地/临时 **Qdrant**（+ MySQL 元数据）；断言对齐 payload filter / recall 合同 | 关键 RAG/向量 prove 默认路径不再拉起 `pgvector/pgvector:*`；文档与 CMD 明示 Qdrant fixture |
| **B. Marked-red retirement** | 脚本可留作 **legacy compatibility**，但 CI/发布叙事 **标红**：不得当 sole-stack / RAG 已迁证据；入口名或输出含 legacy / red 标记 | 发布清单与 ADR 明确「legacy fixture ≠ 迁栈证据」；误用为 cutover 证据必须红 |

推荐顺序（计划级，非本切片排期承诺）：

1. **标红**高混淆入口（`vectorstore:prove`、`rag:adversarial:pg-eval`、`qbank-retrieval-eval-pg`、performance suite 中的 pgvector HNSW 行）——降低假绿误读。  
2. 为 **ANN / hybrid / memory recall** 建 **Qdrant-backed** 最小 prove（与 production serving 切流解耦）。  
3. 宽 `run-e2e-isolated` 业务 prove：随关系面迁 MySQL 后，**去掉对 pgvector image 的默认依赖**（向量断言拆到 Qdrant prove 或标红跳过）。  
4. **E2E_PG_IMAGE** 默认值退役：仅当所有关键路径已 Qdrant-backed 或 marked-red，且独立审查通过。

---

## 4. R5 假绿风险（本切片仍钉活）

| 现状 | 门 | 本切片 |
|------|-----|--------|
| `vectorstore:prove` / `run-e2e-isolated` / 多条 rag·memory·qbank prove 仍起临时 **pgvector** | **R5 假绿风险**：本地绿 ≠ RAG 已迁；须换 Qdrant/新夹具或标红退役 | **钉风险 + 计划**；不换夹具 |
| 性能套件仍把 `vectorstore:prove` 写作 pgvector HNSW compatibility | 不得外推为 Qdrant/sole-stack 性能或迁栈完成 | 只登记 |

**硬句**：**本绿 ≠ 已迁**；`mysql-stack:m5-fixtures:prove` EXIT=0 **≠** R5 已关 **≠** 夹具已换。

---

## 5. R4 — 题域隔离仍为 M4/M5 门

| 现状 | 门 | 本切片 |
|------|-----|--------|
| track-local / wrong_track 合同可在 proof 存在，**非**生产 Worker 接线；Worker 仍可固定「技术岗」 | **题域隔离 NOT closed**；显式 **M4/M5 门**：未证明隔离前 **不得切题库/向量真相** | **保留否定句**；不宣称已关；不切生产出题路径 |

夹具退役（R5）**不能**替代 R4 关闭；二者并行挡切流。

---

## 6. 擦除 sink：recall=0 + receipt **before cutover**

ADR / M4 隐私等价强制：向量/题库 chunk 删除后，**Qdrant 必须仍是可证明的擦除 sink**。

| 要求 | 裁定 |
|------|------|
| 删后召回 | **recall=0**（同 owner / 同 ref 再检索不得命中） |
| 回执 | **逐 sink receipt**（per-sink receipt）；形状与关系库 `privacy_deletion_target` ledger 对齐（先例：`0125` / `memory-vector-chunk-erasure` / `pnpm memory-vector-chunk-erasure:prove`） |
| 元数据 | **metadata stays relational**（原文/状态机/ACL/擦除账本留 MySQL；Qdrant 只持向量+允许的 payload ref） |
| 切流 | receipt 形状未对齐 + sink prove 未绿前 **不得切向量真相**；**before cutover** |

**本切片**：只钉前置；不实现 Qdrant client、不改 `0125`、不切向量真相。

---

## 7. 非目标 / 禁止宣称

- **不切向量真相**；不切 pgvector serving；不切 qbank 生产路径；**不改 production retrieval**。
- **不宣称题域隔离已关**；**不宣称 RAG 已切流**；**pass ≠ cutover**；**本绿 ≠ 已迁**。
- 不以 `vectorstore:prove` / e2e-isolated / 本计划 prove 绿当作 Qdrant 已迁（**R5 假绿**）。
- 不以 legacy `compose.dev.yml` 双跑为产品计划；**MySQL+Qdrant+Redis sole stack**。
- `releaseEvidence=false`；Not HA；不勾 `controlPlaneClosed=true`；**禁止自批 cutover**；**cutover blocked until proves**。
- 本切片 **不执行** 夹具换新 / marked-red 落地 / `E2E_PG_IMAGE` 默认变更（那些是后续执行切片）。

---

## 8. 静态 prove

```bash
pnpm mysql-stack:m5-fixtures:prove
# ≡ node scripts/mysql-stack.m5-fixtures.skeleton.proof.mjs
```

期望：本计划文件存在 + 钉死 sole stack / R5 假绿 / R4 NOT closed / erasure sink recall=0+receipt / **不切向量真相** / **本绿 ≠ 已迁** / **pass ≠ cutover** / releaseEvidence=false / Not HA；并确认 `vectorstore.proof.ts` / `run-e2e-isolated.mjs` 仍显示 pgvector 绑定（R5 仍活）。EXIT=0 **仅**表示计划文档骨架绿，**≠** 夹具已退役 **≠** 向量 cutover。
