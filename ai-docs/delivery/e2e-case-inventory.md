# E2E case inventory（需求ID → 用例验收 → 缺口 · 家族目录）

**releaseEvidence=false** · **≠HA** / **Not HA** · **本绿 ≠ 已迁**  
**硬规矩**（`impl-review-gate.md` · `north-star-hard-gates.md`）：**禁止**用 mysql-stack skeleton/ping 或单点 prove **冒充**完整 E2E。  
**评测优先**：每行对照 UC/ADR/`gap-bug-backlog.md` / remediation `PRD-TEST-*`——**连通绿不计入业务 covered**。  
**后续 knife**：家族/行必须带 **NEG + PERF** 列（盲区 SSOT：`e2e-requirement-coverage-matrix.md` §0.5 / §1.0）。仅快乐路径绿 = 假绿。  
**sole stack**：**MySQL+Qdrant+Redis** 为当前唯一真相栈方向。目标夹具：关系面 **MySQL** · 向量面 **Qdrant** · 唤醒/缓存 **Redis**（直至换夹具或 marked-red，默认仍吃 `E2E_PG_IMAGE=pgvector/pgvector:pg16`）。

关联 harness：`harness/e2e-full-suite.inventory.md`（如何跑 / EXIT 纪律）· `harness/r5-pgvector-fixture-mark-red.md` · 计划：`m5-pgvector-fixture-retirement-plan.md` · ADR：`adr-mysql-qdrant-local.md`。

**LIVE 白名单（S1）**：仅少数 package.json target 是真 HTTP/SSE live E2E — 主评测 ⊆ `{e2e:prove, performance:e2e}`（+ isolated 包装）；`e2e:ui` = secondary；经 `run-e2e-isolated` 的其余 `*:prove` = 域 prove 借壳（≠ live covered）；`mysql-stack:*` / `conn-stack:*` = **conn-only**（永不 LIVE；S4 bodies ∈ `scripts/conn-stack/`）。详见 `e2e-live-targets-whitelist.md` · ADR `adr-e2e-directory-restructure.md` D5。今日代码 Set 仍含 `e2e:ui`（行为未改）。

**状态词**：`green-risk` = 本地可绿但夹具/叙事假绿风险；`mark-red` = 已标红保留；`gap` = 缺 sole-stack 等价或需求未接线；`conn-only` = 仅连通/静态文档（**非**业务 covered）。

---

## 0. mw-e2e-ha 对齐矩阵（需求ID → 用例 → 缺口）

> 与独立审查「需求ID→用例→缺口」同构；**covered 业务**须有对应家族 EXIT 且 fixture 诚实；mysql-stack / ping **永不**填 covered。

| 需求ID | 用例 / 验收要点 | gap-bug / 登记 | 评测家族（见 §1） | 业务 covered？ |
|--------|-----------------|----------------|-------------------|----------------|
| PRD-TEST-001 / SCOR-00 | 公开伪评分旁路 410；副作用=0 | BUG-SCORE-LEGACY · GAP-PROD-01 | F-SCOR | 仅止血面；≠ SCOR-01…08 |
| PRD-TEST-003 | 真实 `hybridQbankSearch` holdout；词法 AND 暴露 | **BUG-FAKE-QBANK-EVAL** | F-QBANK-EVAL | **否**（管道机械；≠ 发布召回） |
| PRD-TEST-004 | adversarial / legacy vector 不得冒充生产检索质量 | **BUG-FAKE-QBANK-EVAL** | F-RAG-EVAL | **否** |
| PRD-TEST-008 | 云 serial ≠ Docker 全套；夹具拆分 | **BUG-E2E-ISO** | F-ISO · F-PERF | **否**（夹具未拆 sole-stack） |
| PRD-TEST-010 | demo/benchmark 诚实命名 | BUG-FAKE-QBANK-EVAL 同列 | F-RAG-EVAL · demo/bench | **否** |
| PRD-TEST-011 / 013 | 记忆治理 / 控制面；删后 recall | GAP-PRIV-04 · MEM-* | F-MEM · F-ERASURE | PG 先例 ≠ Qdrant sink |
| PRD-TEST-015 / INT-TRANSCRIPT | 事实根 + 删后 read=0 前置评分 | GAP-PRIV-03 · GAP-PROD-01 | F-INT · F-PRIV | 控制面未关 → **否** closed |
| PRD-TEST-016 / R4 | wrong_track=0 生产读面 | GAP-RAG-04 · R4 NOT closed | F-RAG-ROUTE · F-QBANK | proof≠生产 → **否** |
| ADR R5 | pgvector 夹具退役或标红 | **BUG-FAKE-R5** | F-VEC · F-ISO · F-PERF | mark-red 进行中；≠ 已迁 |
| ADR Q1/Q5 | wakeup 选型 + prove；reconcile | GAP-MOP-01 · BUG-NOTIFY-REC | F-WAKEUP | redis 旁路 ≠ 生产切 |
| ADR 隐私 DELETE=503 | 公开 DELETE 冻结 503 | GAP-PRIV-02 · BUG-PRIV-503 | F-PRIV | pin 可 covered；闭环 **否** |
| BUG-FAKE-CONN | 禁连通绿冒充已迁 | BUG-FAKE-CONN | F-CONN（反例） | **永不** covered |
| GAP-PROD-02 | C/B 浏览器矩阵 | GAP-PROD-02 | F-ISO（ui） | 未完整 CI 矩阵 → gap |

---

## 1. 家族目录（脚本 · 夹具 · 状态 · 目标 sole-stack · backlog）

| ID | 家族 | 脚本 / CMD | 夹具绑定 | status | 目标 sole-stack 夹具 | P0/P1 → backlog |
|----|------|-------------|---------|--------|----------------------|-----------------|
| F-ISO | e2e-isolated HTTP | `pnpm e2e:isolated` → `scripts/run-e2e-isolated.mjs e2e:prove` | **pgvector**（`E2E_PG_IMAGE`） | green-risk | MySQL 关系 +（向量断言拆 Qdrant 或标红跳过） | P1 **BUG-E2E-ISO** · P0 **BUG-FAKE-R5** |
| F-ISO-UI | e2e-isolated UI | `pnpm e2e:ui:isolated` | **pgvector** | green-risk | 同上 + 浏览器 | P1 **BUG-E2E-ISO** · GAP-PROD-02 |
| F-PERF | performance suite | `pnpm verify:e2e-performance` → `scripts/run-e2e-performance-suite.mjs` | 多步；含 **pgvector** HNSW 行 | green-risk / 内嵌 mark-red | 拆分：非向量步 MySQL；向量步 Qdrant 或标红 | P1 **BUG-E2E-ISO** · P0 **BUG-FAKE-R5** |
| F-VEC | vectorstore | `pnpm vectorstore:prove`（`:legacy` 同体）→ `packages/db` `prove:vectorstore` | **pgvector** HNSW | **mark-red** | **Qdrant**-backed ANN prove | P0 **BUG-FAKE-R5** |
| F-RAG-ROUTE | rag03–07 | `pnpm rag03-route:prove` … `rag07-free-text-route:prove` | isolated **PG**/pgvector | green-risk | MySQL 元数据 + Qdrant filter | P0 **BUG-FAKE-R5** · GAP-RAG-02/03 |
| F-RAG-CTRL | rag/qbank 控制·生成 | `rag-generation:prove` / `qbank:prove` / `qbank-control-role:prove` / rag-control* / `qbank-pipeline:prove` | isolated **PG** | green-risk | MySQL 控制面 + Qdrant serving | P0 **BUG-FAKE-R5** · GAP-RAG-01…04 |
| F-RAG-EVAL | rag adversarial / demo | `pnpm rag:adversarial:pg-eval`（`:legacy`）；`rag:adversarial:eval`；`rag:demo`；`retrieval:benchmark` | **pgvector** / 离线 | mark-red / gap | 重建 generation schema 或永久 legacy 名 | P1 **BUG-FAKE-QBANK-EVAL** · PRD-TEST-004/010 |
| F-QBANK-EVAL | qbank retrieval eval | `pnpm -C apps/worker prove:qbank-retrieval-eval`（`qbank-retrieval-eval-pg.proof.ts`）；`pnpm qbank:retrieval:eval`；`qbank:retrieval:fixture:prove` | **PG** FTS + **pgvector** ANN | mark-red / green-risk | Qdrant hybrid + 显式 real-embed 旗 | P1 **BUG-FAKE-QBANK-EVAL** · PRD-TEST-003 |
| F-PRIV | privacy HTTP / authz | `privacy-erasure:http:prove`；`privacy-erasure:prove`；`privacy-erasure-preview:prove`；`privacy-authorization:prove` | isolated **PG**（RLS/GUC） | green-risk（夹具） | MySQL 显式 tenant 等价 + 同 HTTP pin | P0 GAP-PRIV-02 · **BUG-PRIV-503** |
| F-WAKEUP | wakeup | `pnpm worker-wakeup:prove`（LISTEN/NOTIFY）；`pnpm worker-wakeup-redis:prove`（Streams 旁路） | **PG** NOTIFY / **Redis** 原型 | green-risk / gap（切流） | **Redis Streams** + reconcile | P0 GAP-MOP-01 · **BUG-NOTIFY-REC** |
| F-MEM | memory / mem* | `memory:prove`；`memory-*:prove`；`mem02-summary:prove`；`mem03-summary-tree:prove` | isolated **pgvector**/PG | green-risk | MySQL + Qdrant recall | P0 **BUG-FAKE-R5** · PRD-TEST-011/013 |
| F-ERASURE | vector chunk erasure | `memory-vector-chunk-erasure:prove` | isolated **PG** | green-risk | **Qdrant** sink recall=0 + per-sink receipt | P0 GAP-PRIV-04 · **BUG-FAKE-R5** |
| F-INT | INT transcript / dual-write | `int-answer-dual-write-fence:prove`；`int-transcript-*:prove` | isolated **PG** | gap（控制面未关） | MySQL artifact + deletion ledger | P0 GAP-PRIV-03 · PRD-TEST-015 |
| F-SCOR | scor-00 止血 | `scor-00:http:prove`；`scor-00-honesty:prove`；`scoring:eval` | isolated **PG** / domain | green-risk（≠闭环） | 同业务断言换 MySQL 夹具 | P0 **BUG-SCORE-LEGACY** · GAP-PROD-01 |
| F-CONN | mysql-stack / conn-stack 连通/静态 | `mysql-stack:{skeleton,ping,m2-tenant,m3-queue,m4-rag,m5-fixtures,r5-mark-red}:prove`（可选 `conn-stack:*` 同体）；bodies ∈ `scripts/conn-stack/`；legacy `scripts/mysql-stack.*` = thin forwarders | **mysql**/none（静态） | **conn-only** | n/a（**永不**冒充 E2E / covered；目录迁 ≠ 业务 covered） | P0 **BUG-FAKE-CONN** |

---

## 2. R5 假绿家族（eval honesty · 摘要）

| 家族组 | 代表 CMD | 绿了能证明什么 | **不得冒充的需求满足** |
|--------|----------|----------------|------------------------|
| 夹具根 | `run-e2e-isolated.mjs`；`E2E_PG_IMAGE`→`pgvector/pgvector:pg16`；sole allowlist `sole-stack:wiring:prove`（compose.mysql-local） | 隔离 cluster 可起、旧 PG 路径可跑；sole wiring 连通可绿 ≠ 默认已切 | sole-stack 默认；RAG 已迁；disposable sole isolation |
| 宽 E2E | `e2e:isolated` / `e2e:ui:isolated` / 多数 `*:prove`→isolated | 业务在 PG 夹具上的回归 | 向量真相已切；发布栈已迁 |
| 向量核心 | `vectorstore:prove`（+ `:legacy`） | legacy ANN/RLS/去重 | Qdrant serving；RAG cutover |
| RAG route / qbank | rag03–07；rag-generation；qbank-* | 旧合同在 PG | 生产 Qdrant 检索已接线 |
| 评测 legacy | `rag:adversarial:pg-eval`；`qbank-retrieval-eval-pg` | 管道机械正确 | 生产检索质量 / 发布召回 SLO |
| Memory / 擦除 | `memory:prove`；`memory-vector-chunk-erasure:prove` | PG RLS / 关系库 receipt 先例 | Qdrant sink recall=0 已证 |
| 性能套件 | `verify:e2e-performance` 中 **R5-MARKED-RED** 行 | legacy HNSW 兼容 | sole-stack 性能；迁栈完成 |

**标红状态**：夹具根 banner + `vectorstore.proof.ts` NOTE + **非 isolated** `rag-adversarial-pg-eval.ts` / `qbank-retrieval-eval-pg.proof.ts` 文件头 `R5-MARKED-RED` + performance **多行** `LEGACY/R5-MARKED-RED`（vectorstore+memory+rag-generation/corpus/qbank-control/rag-cache）+ `:legacy` 别名 + `pnpm mysql-stack:r5-mark-red:prove`。**marked-red ≠ deleted**。

---

## 3. 非本表业务 covered（勿用本文件冒充）

- mysql-stack skeleton/ping/m2–m5 **文档连通绿**（**BUG-FAKE-CONN**）— **不是** E2E，**不计**业务 covered  
- `e2e-case-inventory:prove` / `mysql-stack:r5-mark-red:prove` — 静态钉 only  
- 生产 retrieval / qbank serving / wakeup 切流（须独立审 + sole-stack 夹具绿）  
- 云 serial runner 全套（PRD-TEST-008）— 另轨  

全量如何跑与 EXIT 纪律：见 `harness/e2e-full-suite.inventory.md`。**本切片不宣称 full E2E green**。

---

## 4. 维护

1. 新增默认吃 `E2E_PG_IMAGE`/pgvector 的 prove → 追加 §1 行，并挂 **BUG-FAKE-R5** / **BUG-E2E-ISO**。  
2. 新增评测脚本 → 写清需求ID（PRD-TEST / ADR R·Q / UC）与「不得冒充」。  
3. 更新 `gap-bug-backlog.md` 时同步本矩阵「缺口」列。  
4. mw-e2e-ha 复审以本文件 + full-suite harness 为对照；实现方不自审。
