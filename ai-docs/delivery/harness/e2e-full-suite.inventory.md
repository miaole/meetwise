# Harness — 本地全量 E2E 家族 inventory（mw-e2e-ha 对照入口）

**releaseEvidence=false** · **≠HA** / **Not HA** · **本绿 ≠ 已迁 / ≠ cutover**  
**栈裁定**：sole stack 方向 = **MySQL + Qdrant + Redis**；默认 `E2E_PG_IMAGE=pgvector/pgvector:pg16` **≠** sole-stack 真相。  
**硬禁**（`impl-review-gate.md` · `north-star-hard-gates.md` G1–G6）：**禁止**用 `mysql-stack` skeleton/ping/m2–m5 文档连通绿或单点 prove **冒充**完整 E2E。仅快乐路径绿 = 假绿。  
**评测优先（eval first）**：本 harness 钉的是「需求验收如何跑 / EXIT 如何记 / 假绿如何标红」——**连通绿不计入业务 covered**。  
**后续 knife**：家族执行记录必须带 **NEG + PERF** 列（盲区 SSOT：`e2e-requirement-coverage-matrix.md` §0.5 / §1.0）。本地绿 ≠ 生产容量。

关联：`e2e-case-inventory.md`（需求ID→用例→缺口矩阵）· `gap-bug-backlog.md`（BUG-FAKE-R5 / BUG-E2E-ISO / BUG-FAKE-QBANK-EVAL / BUG-FAKE-CONN / BUG-PRIV-503 …）· `adr-mysql-qdrant-local.md` · `m4-rag-hard-gates.md` · `m5-pgvector-fixture-retirement-plan.md` · `harness/r5-pgvector-fixture-mark-red.md` · `harness/g6-e2e-iso-blocked.md` · `pnpm g6-e2e-iso-blocked:prove` · remediation-register `PRD-TEST-*`。

## 本 harness 评哪些需求（不是连通）

| 需求族 | 验收意图（业务） | 主要家族 CMD | 期望 EXIT 记录 | 假绿 / 标红 |
|--------|------------------|--------------|----------------|-------------|
| HTTP/UI 主链路 | 鉴权→简历→交易→面试→报告必测路径（frontend-blueprint / GAP-PROD-02） | `pnpm e2e:isolated`；`pnpm e2e:ui:isolated` | **逐家族**记 EXIT；套件总 EXIT 另记 | 默认 pgvector 夹具 → **BUG-E2E-ISO** / **BUG-FAKE-R5**；绿 ≠ sole-stack 已迁 |
| 性能门 | 本地可复现性能/回归门（非云发布证据） | `pnpm verify:e2e-performance` | 套件逐步 EXIT 入 receipt；失败停 | 内含 **R5-MARKED-RED** `vectorstore:prove` 行；≠ sole-stack 性能 |
| 隐私 HTTP | 公开 DELETE=503 pin；erasure preview 非 SLO（ADR 隐私清单 / GAP-PRIV-02） | `pnpm privacy-erasure:http:prove`；专文 `harness/privacy-erasure-http-503-pin.md` | 0=pin 仍在；**本绿≠产品删除闭环** | 经 isolated PG；迁栈后换夹具；**BUG-PRIV-503**；矩阵 PRIVACY-HTTP / UC-E2E-050–052 |
| 向量 / RAG | ANN/HNSW、route、qbank、题域（R1–R5 / PRD-TEST-003/004/016） | `vectorstore:prove`；rag03–07；qbank* | 0=legacy PG 路径；**不得**写 RAG 已迁 | **BUG-FAKE-R5** mark-red；pgvector fixtures = fake-green until retired |
| 检索评测 | holdout / adversarial 机械管道（PRD-TEST-003/004/010） | `qbank:retrieval:eval`；worker `prove:qbank-retrieval-eval`；`rag:adversarial:pg-eval` | 0=管道机械正确；**≠** 发布召回 SLO | **BUG-FAKE-QBANK-EVAL** |
| Wakeup / 队列 | LISTEN/NOTIFY 旧路径 vs Redis Streams 旁路（Q1/Q5 / GAP-MOP-01） | `worker-wakeup:prove`；`worker-wakeup-redis:prove` | 分别记 EXIT；redis 旁路绿 ≠ 生产已切 | **BUG-NOTIFY-REC**；禁连通绿宣称已切（**BUG-FAKE-CONN**） |
| MEM / INT | 记忆治理与 INT-TRANSCRIPT 事实根（PRD-TEST-011/013/015 · GAP-PRIV-03） | `memory:*`；`mem02*`；`int-*` | 0=PG 夹具合同；控制面未关 | 夹具仍 PG；**≠** controlPlaneClosed |
| SCOR 止血 | 伪评分旁路 410 / 诚实闸（PRD-TEST-001） | `scor-00:http:prove`；`scor-00-honesty:prove` | 0=止血；**≠** SCOR-01…08 闭环 | **BUG-SCORE-LEGACY** |
| mysql-stack 文档 | 骨架/ping/m2–m5 **仅**文档/连通 | `mysql-stack:*:prove` | 0=静态/连通钉 | **永不**计入业务 covered；**BUG-FAKE-CONN** |

## 如何跑：全量本地 E2E 家族（命令构成）

> **本切片不要求跑完**（会很久）。下列即「full run」构成；审查时按家族 **分别**记录 EXIT。  
> 全绿 ≠ releaseEvidence；全绿 ≠ cutover；pgvector 上的绿 ≠ sole-stack 已迁。

### A. 宽隔离 HTTP / UI（家族根：`run-e2e-isolated`）

```bash
pnpm e2e:isolated          # → node scripts/run-e2e-isolated.mjs e2e:prove
pnpm e2e:ui:isolated       # → node scripts/run-e2e-isolated.mjs e2e:ui
```

期望：各 CMD EXIT=0 才可记「该家族本地绿」；仍须在 inventory 标 **fixture=pgvector**、**status=green-risk**。

**G6 / Key 诚实（本切片）**：无 `MODEL_API_KEY` 时 **勿硬跑**上表；记 **blocked**；诚实钉 `pnpm g6-e2e-iso-blocked:prove`（EXIT=0=钉 blocked ≠ family 绿 ≠ G6 关；见 `harness/g6-e2e-iso-blocked.md`）。有 Key 后才硬跑并逐家族记 EXIT；即使绿仍 R5；**BUG-E2E-ISO / G6 仍 OPEN**。

### B. 性能套件（逐步；含 R5 标红行）

```bash
pnpm verify:e2e-performance   # → node scripts/run-e2e-performance-suite.mjs
```

期望：套件内每步 EXIT 写入 `.tmp/e2e-receipts/*.json`；`releaseEvidence: false`；pgvector HNSW 步即使 0 也是 **LEGACY/R5-MARKED-RED**。

### C. 隐私 / 评分止血（业务验收，非连通）

```bash
pnpm privacy-erasure:http:prove
pnpm privacy-erasure:prove
pnpm privacy-erasure-preview:prove
pnpm privacy-authorization:prove
pnpm scor-00:http:prove
pnpm scor-00-honesty:prove
```

### D. 向量 / RAG / qbank / memory（R5 假绿面；须标红解读）

```bash
pnpm vectorstore:prove
pnpm rag03-route:prove   # … rag04 … rag07
pnpm rag-generation:prove
pnpm qbank-control-role:prove
pnpm memory:prove
pnpm memory-vector-chunk-erasure:prove
pnpm rag:adversarial:pg-eval
pnpm -C apps/worker prove:qbank-retrieval-eval
pnpm qbank:retrieval:eval
```

### E. Wakeup / MEM·INT 代表

```bash
pnpm worker-wakeup:prove              # 旧 LISTEN/NOTIFY 路径
pnpm worker-wakeup-redis:prove        # Streams 旁路静态/原型；≠ 生产切流
pnpm mem02-summary:prove
pnpm int-answer-dual-write-fence:prove
pnpm int-transcript-answer-fact-root:prove
```

### F. **非** E2E（禁止并入「全量 E2E 绿」叙事）

```bash
pnpm mysql-stack:skeleton:prove
pnpm mysql-stack:ping:prove
pnpm mysql-stack:m2-tenant:prove
pnpm mysql-stack:m3-queue:prove
pnpm mysql-stack:m4-rag:prove
pnpm mysql-stack:m5-fixtures:prove
pnpm mysql-stack:r5-mark-red:prove    # 仅静态标红钉；≠ 全量 E2E
pnpm e2e-case-inventory:prove         # 仅 inventory 静态钉；≠ 全量 E2E
```

## EXIT 记录纪律

1. **按家族**记录 `CMD=` / `EXIT=`（套件逐步亦可）；禁止只报「mysql-stack ping=0」。  
2. fixture 列必须写清：`pgvector` / `PG` / `mysql` / `qdrant` / `redis` / `none`。  
3. `status=green-risk` 的家族：EXIT=0 **只**可写「legacy 夹具机械绿」，**不可**勾业务 covered / cutover。  
4. `status=mark-red`：保留脚本，叙事标红。  
5. `status=gap`：无 sole-stack 等价夹具或需求未接线。  
6. **连通绿不计入业务 covered**（对齐 mw-e2e-ha「需求ID→用例→缺口」矩阵）。

## 静态 prove（本切片）

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm e2e-case-inventory:prove` | **0** | harness + case inventory 存在；钉「禁止 mysql-stack 冒充 E2E」；家族数 ≥N；交叉引用 gap-bug-backlog；**本绿≠已迁** |
| `node scripts/e2e-case-inventory.proof.mjs` | **0** | 同上 |

## 非目标

- **不**宣称 full E2E green / HA / `releaseEvidence=true` / `controlPlaneClosed=true`  
- **不**跑完整 `verify:e2e-performance` 作为本切片必达（inventory + mark-red guidance 足够）  
- **不**把 mysql-stack / r5-mark-red / inventory prove 写作业务验收已覆盖  
- 实现方不自审；完成后由协调派 **mw-e2e-ha** 对照本 harness + `e2e-case-inventory.md` 独立复审

## 审查

- 结论落入 `ai-docs/delivery/reviews/`；合入权在协调/用户；禁止自批切流
