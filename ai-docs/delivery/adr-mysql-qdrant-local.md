# ADR — MySQL + Qdrant + Redis（当前唯一真相栈）

**状态**：draft · **releaseEvidence=false** · 不宣称生产 HA / controlPlaneClosed  
**栈裁定**：**MySQL 8.0+ + Qdrant + Redis** 为交付与架构文档的 **当前唯一真相**；切流须 prove 绿 + 独立审查，禁止自批。  
**实现方不自批**：合入前须 `mw-privacy-int` / `mw-model-op` / `mw-rag-route` / `mw-e2e-ha` 独立审查 + prove 退出码。

## 背景
- 目标拓扑：本地 docker（`docker/compose.mysql-local.yml`）→ 日后腾讯云上海托管 MySQL + Qdrant/Redis。
- 不新购阿里云 ECS/Tair；本地栈自洽，不阻塞于外部 RDS。
- 新 seed/fixture 与 prove 夹具按本栈重建；不以外部托管库历史 dump 为迁移源。

## 决策（当前唯一真相）
1. **关系库**：**MySQL 8.0+**（本地 `docker/compose.mysql-local.yml`）。应用层 tenant 为迁栈目标强制面之一，**应用层 tenant ≠ RLS 等价物**（见下「隐私不倒退」）。
2. **向量**：**Qdrant**；原文/状态机/ACL/**擦除账本**留关系库。**Qdrant 必须仍是可证明的擦除 sink**（见下）。
3. **唤醒**：**Redis Streams 或 PubSub**（持久 + reconcile 仍要）。M3 本阶段仅选型，**不切生产 wakeup 代码**。
4. **锁/claim**：Redis 租约；MySQL 8 `FOR UPDATE SKIP LOCKED` 同语义或 Streams consumer group。
5. **全文**：不以 MySQL FULLTEXT 冒充原 `to_tsvector` 等价；评估 Qdrant 全文或应用 BM25。
6. **遗留产物**：`docker/compose.dev.yml`（若仍在树内）仅作 **legacy 待删产物**，**不是**双跑主路径或产品计划。

## 隐私不倒退（硬节 · 挡 M2+ / 「唯一真相库」切流）

**授权根不得静默降级为「应用层 tenant」。** 现有代码隐私边界仍依赖 DB fail-closed（RLS FORCE / SECURITY DEFINER / privacy GUC / issuer / AUTH_SECRET≠隐私 JWS 等）。**应用层 tenant ≠ RLS 等价物**；不得把「每次查询注入 `owner_user_id`」当作已完成的等价强制。

**活门（非怀旧）**：在 privacy prove **未绿**前，**不得放弃代码中的 RLS 强制路径**（`principal.ts` / migrations 本任务仅允许注释级触及；不得删弱 FORCE / `set_config`）。未列出等价强制模型且下列 prove **未绿**前，**禁止切流**。

库存依赖面快照（迁移工作用）：`.tmp/pg-mysql-pivot/PG-DEPENDENCY-INVENTORY.md`（**仅依赖面；里程碑以本 ADR 为准**）。约 ~49 RLS / ~348 POLICY / ~429 DEFINER。

### 等价强制（须在切流前写清并证明）
| 现网代码强制（须保留至 prove 绿） | 迁栈后最低等价（拟议，未证明） |
|----------|-------------------------------|
| RLS FORCE + principal GUC | 显式强制策略（非默认可选 filter）+ 跨 owner fail-closed prove |
| privacy issuer / lease GUC | 等价授权根与 lease 语义；禁 AUTH_SECRET 冒充隐私 JWS |
| SECURITY DEFINER 写路径 | 收敛写入口 + 契约 prove |
| 向量/题库 chunk 删除 | **Qdrant 登记为擦除 sink**：删后 **recall=0** + **逐 sink receipt**；receipt 形状与关系库 ledger 对齐前 **不得切向量真相** |

### M2 前 prove 清单（具体脚本；未跑通=红；未绿禁止切流）
- `pnpm privacy-authorization:prove`
- `pnpm privacy-authorization:crypto:prove`
- `pnpm privacy-erasure-preview:prove`（及 `privacy-erasure-preview:domain:prove` / `contract:prove` 按需）
- `pnpm privacy-erasure:prove` / `pnpm privacy-erasure:http:prove`（含 **公开 DELETE=503 pin**）
- `pnpm memory-vector-chunk-erasure:prove`（迁 Qdrant 后须有对应 sink prove；无 receipt 形状前标红）

### 重构期冻结（显式）
- **不得**放开公开 DELETE（保持 **DELETE=503**），直至独立 prove + 专家审批准。
- **不得**勾 `controlPlaneClosed=true`，**不得**宣称 INT-TRANSCRIPT / 控制面已关。
- **不得**宣称生产 HA；`releaseEvidence=false` 直至另有回执。

## RAG / 路由硬缺口（挡 M4/M5 切流；**不挡** M0 文件骨架）

主线 B1–B4 **不在本 M0 伪关**。下列须写入里程碑门禁；未关闭前禁止宣称题域隔离已关或 RAG 已可切流。

| ID | 缺口 | 门 |
|----|------|----|
| **R1** | Worker「技术岗」硬编码 | 去掉/参数化前不得当通用出题路径就绪 |
| **R2** | `classifyJobRoute` / route snapshot **生产接线** | 无生产接线不得宣称路由生效 |
| **R3** | `qbank_serving_scope` + hybrid：过滤落点须明确；**禁止用 MySQL FULLTEXT 冒充**等价 | M4 向量/检索切流前定案并 prove |
| **R4** | 题域隔离未关 | **显式 M4/M5 门**：未证明隔离前不得切题库/向量真相 |
| **R5** | 现有 prove 仍绑 **pgvector** 夹具（如 `run-e2e-isolated` / `vectorstore:prove`） | **M5 前假绿风险**：须换 Qdrant/新夹具或标红退役；本地绿≠RAG 已迁 |

## MODEL-OP / 队列硬缺口（挡 M3 切流；**不挡** M0/M1 连通门）

mw-model-op 对 M0/M1：**conditional**（亲自复跑 `mysql-stack:skeleton:prove` / `ping:prove` =0）。Wakeup / claim / advisory **有写未伪关** → 落地 **M3**。

| ID | 缺口 | 门 |
|----|------|----|
| **Q1** | Wakeup（现代码仍含 `LISTEN/NOTIFY` `meetwise_worker_wakeup_v1`） | M3 前 **选型**（Redis Streams / PubSub / 轮询）并文档钉死；**本切片不切生产 wakeup 代码**；切流前另需 wakeup prove |
| **Q2** | Claim（现代码 `FOR UPDATE SKIP LOCKED`） | MySQL 8 同语义或 Streams consumer group；须 claim prove |
| **Q3** | 租约/串行（现代码 `pg_advisory_*`） | Redis `SET NX PX` 或表行锁+fence；须锁 prove |
| **Q4** | MODEL-OP reconciler / 费用·校准主链 | **禁止**用不连通绿宣称队列或 reconciler **已切**；切流前须 **同列** 证据：`pnpm model-invocation-reconcile:prove` **与** `pnpm model-op00-usage-reconciler:prove`（`usageCalibrationReconciler`） |
| **Q5** | wakeup + reconcile 证据 | **M3 切流前必须**：选型文档 + wakeup prove + **Q4 双 reconciler prove**（迁栈后换夹具或标红） |

**硬句**：**本绿 ≠ 已迁 / ≠ cutover**；mysql-stack skeleton/ping/m3-queue 绿 **≠** 队列已迁 **≠** MODEL-OP reconciler 已切。`releaseEvidence=false`；非 HA。  
**硬句**：**MySQL+Qdrant+Redis sole stack**；**cutover blocked until proves**；**no abandon RLS code until proves**。

## 非目标
- 不宣称云端闭环 / 生产 HA / `controlPlaneClosed=true`。
- 不把密钥或密码写入 git（compose 内仅为本地占位口令；非生产）。
- 不在 M0/M1 完成且隐私硬缺口未写清、未证明前，合入破坏性 schema 迁移到「唯一真相库」。
- **公开 DELETE 仍为 503**，直至独立 prove + 专家审。
- skeleton / ping EXIT=0 **≠** 栈可用于切流或隐私/RAG/队列/MODEL-OP 可迁（仅文件/连通门禁）。
- **禁止**用不连通绿宣称队列或 MODEL-OP reconciler 已切（Q4）。
- **不在本 M0 伪关题域隔离**（R4）或 Worker 技术岗/route 接线（R1/R2）。
- **不以** legacy `compose.dev.yml` 作为双跑主路径或产品计划。

## 影响面摘要
见 `.tmp/pg-mysql-pivot/PG-DEPENDENCY-INVENTORY.md`（依赖面快照；**里程碑以本 ADR 为准**）。约 130 mig / RLS·DEFINER / wakeup / 向量 / prove 夹具。

## 里程碑
| ID | 内容 | 门禁 |
|----|------|------|
| **M0** | 本 ADR + `docker/compose.mysql-local.yml` + `scripts/mysql-stack.skeleton.proof.mjs` | 文件落地 + skeleton prove（CMD/EXIT）；静态钉 releaseEvidence=false / 禁 HA / RLS≠tenant / DELETE=503 / sole stack；**不**要求 R1–R5 已关 |
| **M1** | mysql/redis/qdrant 只读 ping（`mysql-stack:ping:prove`） | 命令+exit；compose 插件缺必须红；仍≠切流 |
| **M2** | 关系 schema 子集 + 应用层 tenant 原型 | 「隐私不倒退」prove 清单绿；授权根不得静默降级；RLS 代码路径 intact 至 prove 绿 |
| **M3** | 队列：Redis Streams/PubSub；claim/advisory 对齐 | **Q1–Q5**：本切片=**仅选型文档**（`m3-queue-wakeup-selection.md` + `mysql-stack:m3-queue:prove`）；**不切生产 wakeup**；**不宣称 reconciler 已接/已切**；切流前另需 wakeup prove + Q4 双 reconciler（model-invocation-reconcile **与** usageCalibrationReconciler）prove；**本绿≠已迁**；禁连通绿宣称已切 |
| **M4** | 向量 → Qdrant；元数据留关系库；**硬门文档** `m4-rag-hard-gates.md`（R1–R5 可行动门；本切片不切向量真相） | **R1–R4** + Qdrant 擦除 sink（recall=0 + 逐 sink receipt）；禁 FULLTEXT 冒充；**本绿≠已迁**；R5 夹具换新仍属 M5 |
| **M5** | RAG_REDIS 本地 + prove 去 pgvector 夹具 | **R5** 夹具换新或标红；题域隔离门（R4） |
| **M6** | 域切流 | 隐私+RAG 硬门全绿 + 四专家审；禁止自批；不宣称 HA |

## 回滚 / 遗留
- 切流未批准前：保持现有隐私/wakeup **代码路径** intact（活门），不以文档叙事把旧栈写成并行产品真相。
- `compose.dev.yml`：legacy 待删；失败回退指 **停止新栈实验、修复后再进**，不是「双跑为主」。
