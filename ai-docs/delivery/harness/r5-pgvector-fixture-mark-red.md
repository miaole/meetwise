# Harness — R5 pgvector 夹具标红（BUG-FAKE-R5 · eval honesty / mark-red）

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **vector does NOT migrate to Qdrant** — continue **Postgres pgvector**.  
> Retained truth stack: **Postgres (+pgvector + PostgresSaver)**. Ban replace-pgvector / sole-Qdrant-vector cutover.  
> Prior status preserved below for history; **do not delete**. Further Qdrant-as-required-vector work on this artifact is **banned**.  
> MySQL relational cutover likewise superseded; **Redis wake** remains separately evaluable (not canceled).  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban implementing vector cutover from this pin · Dual PASS ≠ authorize coding.

**Prior status (historical)**: eval-honesty mark-red · push toward sole MySQL+Qdrant+Redis


**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁 / ≠ cutover** · **local green ≠ HA**  
**优先级**：评测集诚实化（eval first）— 钉「哪些 prove 不得冒充需求满足」+ 标红证据 + **双轨显式标记**（推动 isolated 默认切 MySQL+Qdrant+Redis）；**不扩生产实现**；不切生产向量路径；不宣称 RAG 已迁。  
**marked-red ≠ deleted**（不删 pgvector proves）。  
**E2E_PG_IMAGE**（默认 `pgvector/pgvector:pg16`）**≠ sole-stack 真相**；sole stack = MySQL+Qdrant+Redis。  
**双轨**：`E2E_ISOLATION_STACK=pgvector-legacy`（当前显式缺省）∥ 目标 `mysql-qdrant-redis`；**禁默认可假绿**。  
**禁止冒充**：本切片 `mysql-stack:r5-mark-red:prove` 是**静态标红钉**，**不得**冒充完整 E2E / 不得用 skeleton/ping 顶替 mw-e2e-ha 复审；**need multi-instance + fault-inject for releaseEvidence**。

关联：`gap-bug-backlog.md` **BUG-FAKE-R5** · `m5-pgvector-fixture-retirement-plan.md` §2 · `e2e-case-inventory.md`（R5 假绿家族）· `harness/r5-retirement-sole-stack-status.md` · `north-star-ha.md` · `impl-review-gate.md`。

## 交付物（须与本表 CMD 同名）

| 路径 | 角色 |
|------|------|
| `ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md` | 本 harness |
| `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md` | Proven vs GAP / dual-track / local green ≠ HA |
| `ai-docs/delivery/e2e-case-inventory.md` | R5 假绿 E2E **整套家族**库存（对齐 BUG-FAKE-R5；非单点） |
| `scripts/mysql-stack.r5-mark-red.proof.mjs` | 静态 mark-red prove |
| root `package.json` | `mysql-stack:r5-mark-red:prove` + additive `:legacy` 别名 |
| `packages/db/test/vectorstore.proof.ts` | 文件头 NOTE：legacy / fake-green |
| `scripts/run-e2e-isolated.mjs` | 家族根夹具 banner：`E2E_PG_IMAGE` NOT sole-stack；sole allowlist + PREREQ fail-closed |
| `scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs` | sole wiring 连通 + receipt（≠ 默认已切） |
| root `package.json` | `mysql-stack:sole-wiring:prove` / `e2e-isolation:sole-{wiring,ping,qdrant-backed,vectorstore-adapter,vectorstore-qdrant}:prove` |
| `scripts/run-e2e-performance-suite.mjs` | 多行 pgvector-bound `LEGACY/R5-MARKED-RED`（vectorstore+memory+rag/qbank） |
| `apps/worker/smoke/rag-adversarial-pg-eval.ts` | 非 isolated 叶子文件头 R5-MARKED-RED / fake-green |
| `apps/worker/test/qbank-retrieval-eval-pg.proof.ts` | 评测叶子文件头 R5-MARKED-RED / fake-green |

## 整套 E2E 家族（标红指向家族，非单点）

下列凡绿 **仅**证明「临时 pgvector 夹具上的旧路径」——**不得冒充**：RAG 已迁、sole-stack 已切、Qdrant 检索已生产、发布需求已满足。

### 夹具根（一族同源）

| 入口 | 不得冒充 |
|------|----------|
| `scripts/run-e2e-isolated.mjs` + `E2E_PG_IMAGE`→`pgvector/pgvector:pg16` | 隔离 runner 绿 ≠ sole-stack / ≠ RAG 已迁 |
| `E2E_ISOLATION_STACK` 双轨（默认 `pgvector-legacy`；目标 `mysql-qdrant-redis`） | **禁默认可假绿**；allowlist wiring/ping/qdrant-backed/adapter/vectorstore-qdrant 可绿；非 allowlist sole → EXIT=3+PREREQ；默认仍 legacy；≠ rag/memory/`vectorstore:prove` 默认 |
| `pnpm e2e:isolated` / 宽 isolation 套件 | 同根夹具；业务 E2E 绿 ≠ 向量迁栈 |

### 向量 / RAG / qbank（高混淆）

| 入口 | 不得冒充 |
|------|----------|
| `pnpm vectorstore:prove`（`:legacy` 别名同体） | HNSW/ANN legacy 绿 ≠ Qdrant/RAG 已迁 |
| `pnpm rag03-route:prove` … `rag07-free-text-route:prove` | route prove 绿 ≠ 生产检索已切 Qdrant |
| `pnpm rag-generation:prove` / `qbank:prove` / qbank-control* / rag-control* | 同族 PG 夹具；≠ 迁栈证据 |
| `pnpm rag:adversarial:pg-eval`（`:legacy`） | legacy compatibility eval ≠ 生产检索质量 |
| `qbank-retrieval-eval-pg.proof.ts` / `prove:qbank-retrieval-eval` | `-pg` 评测绿 ≠ 发布召回达标 |

#### 评测叶子显式标红（须文件头 R5-MARKED-RED / fake-green；prove 检测）

| 叶子 | 文件头 / 入口 | 备注 |
|------|---------------|------|
| `pnpm rag:adversarial:pg-eval`（+ `:legacy`） | `apps/worker/smoke/rag-adversarial-pg-eval.ts` | **非 isolated**（自建临时 pgvector DB；无 runner banner） |
| `qbank-retrieval-eval-pg` / `prove:qbank-retrieval-eval` | `apps/worker/test/qbank-retrieval-eval-pg.proof.ts` | 可经 isolated raw，仍须文件头 NOTE；≠ 发布召回 |

### Memory / 擦除（夹具仍 PG）

| 入口 | 不得冒充 |
|------|----------|
| `pnpm memory:prove` + memory-* 经 `run-e2e-isolated` | memory 隔离绿 ≠ Qdrant sink / ≠ RAG 已迁 |
| `pnpm memory-vector-chunk-erasure:prove` | 关系库 erasure 先例 ≠ Qdrant erasure sink 已证 |

### 性能套件

| 入口 | 不得冒充 |
|------|----------|
| `run-e2e-performance-suite.mjs` 中 **多行** `LEGACY/R5-MARKED-RED`（不止 vectorstore） | 性能行绿 ≠ sole-stack 性能 / ≠ 迁栈完成 |

显式标红步（pgvector-bound；名含 `LEGACY/R5-MARKED-RED`）：

| 步名关键字 | CMD |
|------------|-----|
| pgvector HNSW compatibility | `vectorstore:prove` |
| memory isolation on pgvector fixture | `memory:prove` |
| RAG immutable generation on PG fixture | `rag-generation:prove` |
| RAG corpus version on PG fixture | `rag-corpus-version:prove` |
| qbank control-role on PG fixture | `qbank-control-role:prove` |
| RAG/qbank cache on pgvector fixture | `rag-cache:prove` |

## 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | harness + `e2e-case-inventory.md` 存在；家族警告串钉死；`vectorstore:prove` **仍在**；`E2E_PG_IMAGE` 文档化为 NOT sole-stack；打印 `CMD=`/`EXIT=`；**本绿≠已迁** |
| `node scripts/mysql-stack.r5-mark-red.proof.mjs` | **0** | 同上 |
| `pnpm mysql-stack:sole-wiring:prove` / `e2e-isolation:sole-*:prove`（wiring/ping/qdrant-backed/adapter/vectorstore-qdrant） | **0**（compose/Qdrant up） | sole allowlist；≠ fixtures retired；≠ HA；≠ G2 关 |
| non-allowlist `E2E_ISOLATION_STACK=mysql-qdrant-redis …`（rag*/memory*/vectorstore/migrate…） | **3** | PREREQ fail-closed |

## 非目标 / 禁止宣称

- **不**扩生产实现；**不**切向量真相 / pgvector serving / production retrieval
- **不**删/禁 `vectorstore:prove` 或家族 proves；**不**改 `E2E_PG_IMAGE` 默认
- **不**以本 prove / skeleton / ping **冒充**完整 E2E；完整 E2E 仍待 mw-e2e-ha 对照 inventory 复审
- **不**宣称 RAG 已迁、R5 已关、夹具已换、HA、`controlPlaneClosed=true`、`releaseEvidence=true`
- `EXIT=0` **仅**标红静态钉绿 ≠ 夹具退役 ≠ cutover ≠ 需求已满足

## Proven vs GAP（摘要 · 详表见 status）

详表：`harness/r5-retirement-sole-stack-status.md`（north-star parallel）。

| 类 | 要点 |
|----|------|
| **Proven** | 家族标红；双轨显式 `E2E_ISOLATION_STACK`；`E2E_PG_IMAGE` NOT sole-stack；静态 `r5-mark-red:prove` EXIT=0=诚实钉；**P8** sole allowlist（wiring/ping/qdrant-backed/adapter/vectorstore-qdrant）可绿 |
| **GAP** | isolated **默认仍** `pgvector-legacy`；sole allowlist ≠ L1；Qdrant-backed prove 未默认；R4 未关；erasure ledger；整套 E2E 复跑；**HA** |

## Local green ≠ HA

- **本绿 ≠ HA**；**need multi-instance + fault-inject for releaseEvidence**
- L0 静态标红可达 ≠ L2 多实例 ≠ L3 故障注入 ≠ `releaseEvidence=true`
- 禁止把本 prove / skeleton / ping 写成 HA / covered / cutover / migrated

## 双轨推动（禁静默假绿）

| `E2E_ISOLATION_STACK` | 角色 |
|----------------------|------|
| `pgvector-legacy`（当前缺省写入） | R5-MARKED-RED legacy；必须 banner；不得当 sole 真相 |
| `mysql-qdrant-redis`（目标默认） | sole stack 名；**allowlist** `sole-stack:{wiring,ping,qdrant-backed,vectorstore-adapter,vectorstore-qdrant}:prove` 可绿（compose 共享栈）；非 allowlist（含 rag*/memory*/`vectorstore:prove` 默认）**EXIT=3 + PREREQ**；全量 disposable/业务 **仍 GAP** |

推动：默认名显式 legacy + sole 名进 banner/harness/status；直至 G1 关闭前 **不得**叙事「isolated 已默认 sole」。

## 审查

- 结论落入 `ai-docs/delivery/reviews/`；合入权在协调/用户；**禁止自批切流**；实现方不自审
- 分域：rag / e2e（**mw-rag-route · mw-e2e-ha**）对照本 harness + status + BUG-FAKE-R5 + `e2e-case-inventory.md`
