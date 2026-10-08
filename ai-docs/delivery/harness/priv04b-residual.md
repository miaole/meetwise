# Harness — **PRIV4-B · GAP-PRIV-04 残余面侦察+收口刀**（0091 issuer 对齐残余拆解 + P0-CB-01 快照表 sink 候选裁决规则 · REQUEST docs-only · 只裁规则不建表 · backlog `:60` OPEN · DELETE=503 · PG-retained · ≠ AR `:64`）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 本 commit 零 coding / 零 prove / 零产品码 / 零 migration / 零 SSOT 编辑 · Ban coding until PRE dual **BOTH PASS** `mw-privacy-int` + `mw-e2e-ha` + 协调方 AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · **PG-retained** · public DELETE stays **503** · backlog `:60` OPEN · `:64` OPEN · UC-052 partial · canHonestlyFlip=false
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`9265e4d8`** / full `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`（CMOP03-D nail tip · 开工前 `git fetch origin` 实测 origin 最新 tip 且本地 `feat/mysql-schema-skeleton` 已与之全等 · ≥ `9265e4d8` 满足派单前提 · 开工后写 REQUEST 前二次 fetch 复核 tip 未位移）
**Line**: **PRIV4**（队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:32`「DELETE=503 freeze · INT-TRANSCRIPT-01 · GAP-PRIV-01 tenant≠RLS · GAP-PRIV-04 vector erase」）
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（PRE dual · alone ≠ dual · 不代签 · backlog `:60` 域列 privacy/rag + `:78` 域列 product/e2e——本刀横跨两域，双审以协调方钉的两席为准）
**Authority**: meetwise — 本文件为 docs-only REQUEST（§3 loop 第③步）· **Ban coding · Ban prove · Ban 建表** · PRE dual BOTH PASS 后由协调方授权（本刀授权物 = 裁决规则入卷，**非** coding 授权）· implementer 禁自批
**Knife**: **PRIV04-B · GAP-PRIV-04 残余面收口**· ①「仍 ≠ 0091 可写/对齐」残余拆解与本地可推进性判定；② 协调项 (a)：P0-CB-01 快照表（候选·未建）擦除面 sink 候选**裁决规则**（转本线裁决 · 本刀只裁规则，**不建表**）；③ 协调项 (b)：公开 DELETE=503 与 INT-TRANSCRIPT-01 属用户闸——本刀零触碰，如实登记
**Related（只读）**: `harness/gap-priv-04-vector-erase.md`（前刀 · `post_prove_dual_pass` · 0141 fence+feed+receipt 收尾）· `harness/privacy-erasure-http-503-pin.md`（DELETE=503）· `harness/gap-int-transcript-01-cutover-contract.md`（六门合同 · 用户闸）· `harness/gap-cb-audit-erratum.exec.md`（P0-CB-01 erratum 生效卷）· `architecture/ai/privacy-deletion-sink-inventory.md`（§3/§5/§6 维护规则）· `harness/uc-e2e-050-052-privacy-erasure.md`（UC-052 partial）· 0091 · 0093 · 0125 · 0129 · 0141 · AR 线 `71713718`（`:64` OPEN · cite only）

## 0. 本刀定位（两步刀 · 为何 docs-only · 为何只裁规则）

1. **两步刀约定**：①只读侦察（已完成，结论入 §2）；②本地可推进面存在 → 写本 REQUEST（docs-only）写完即停。
2. **为何不立 coding REQUEST**：§2 拆解证明「0091 可写/对齐」残余的**全部**未闭合子面都落在用户闸/协调闸面（cutover 门 1/3/4 · `:60` 行翻行 · UC-052 · `:64`）——DB 级主链已由 0093/0125/0141 闭合到本地可证边界。任何再往前的 coding 都必须先过用户闸，故本刀**零 coding 面**。
3. **为何裁决规则是本地可推进面**：协调项 (a) 明文转本线裁决——P0-CB-01 快照表（候选·未建，属 GAP-PROD-02 `:78` 面）是擦除面**新 sink 候选**，其 INSERT-only（immutable 证据）与 subject-erase 存在机制互斥张力；若不在建表前预立裁决规则，未来 EXEC 可能产生**未登记 sink**（sink inventory §5「触发器不拦 DELETE」已知缺口与 §6 同变更维护规则均为先例为戒）。立规则本身零产品码、零 SSOT 编辑，是纯 docs 收口面。
4. **Ban 借刀**：本刀不翻 `:60`/`:78` 任何行、不洗任何 OPEN 钉、不预裁 EXEC 个案（规则 ≠ 个案裁决——个案裁决发生在未来 P0-CB-01 EXEC REQUEST，逐列清单 + 双审）。

## 1. Cited evidence（只读 · Ban re-prove · 锚 = file:line + blob @ `9265e4d8`）

| Item | 锚（file:line） | blob |
|------|----------------|------|
| GAP-PRIV-04 行全文（P0 OPEN · `post_prove_dual_pass` · 残余「仍 ≠ 0091 可写/对齐 / 公开 DELETE 仍 503」· 本行语义按原文判定不变） | `ai-docs/delivery/gap-bug-backlog.md:60` | `2e569629aa51070ad9fe9ec45becf1762b5b40ee` |
| GAP-PROD-02 行（P0-CB-01…03 · product/e2e）+ erratum 立卷注（audit 本体 blob 零字节全等） | `ai-docs/delivery/gap-bug-backlog.md:78` · `:777` | `2e569629aa51070ad9fe9ec45becf1762b5b40ee` |
| P0-CB-01 验收本体（ApplicationSnapshot / CandidateEvaluationSession 绑定 `job_id、candidate、resume_snapshot_version、competency_snapshot、consent_version`）+ 实施顺序（01→02→03） | `ai-docs/requirements/use-cases/product-readiness-c-b-audit.md:78-96` · `:245-248` | `8393c67ba3fa0e73ea6413be13086a5ac8c103cb`（与 `:777` erratum 注登记 blob 全等） |
| 0125 全链先例：A sink CHECK 扩 `memory_vector_chunk` · B ACL+RLS · C 写围栏（42501）· D begin · E claim（十项 fail-closed · `privacy_authorization_issuer_mismatch`/`not_consumed`/`owner_mismatch`/`scope_mismatch`/`sink_forbidden`/`subject_mismatch`/`epoch_mismatch`/`digest_mismatch`/`target_drift`）· F purge（残留≠0 → 55000 `memory_vector_chunk_target_residual_rows`） | `packages/db/migrations/0125_memory_vector_chunk_erasure.sql:21-47/54-67/72-115/120-188/193-299/304-383` | `22a7a3d4c27ef7e1183b9f9025106cd92f5ab464` |
| 0141 additive fence：A lease 绑定 DELETE fence（唯一合法 DELETE 上下文 = 0125 purge 事务 target+lease · 42501 `vector_plane_erasure_delete_not_authorized`）· B dispatch feed · C 只读 jti feed | `packages/db/migrations/0141_vector_plane_erasure_receipt_fence.sql:37-83/88-107/114-133` | `9229b890078ceb30d7fb85623cc1684cc5e59523` |
| 0091 issuer 主链（Ban 动）：`privacy_issue_authorization_snapshot`（0091 原版仅 interview 分支 · account 分支预留）· consume CAS（M6 issuer_id 三拷贝 pin）· `privacy_record_deletion_receipt` · completed guard（零 target / 未 erased / external 未解析 → 55000） | `packages/db/migrations/0091_privacy_authorization_issuer.sql:174-240/249-295/418-452/524-558` | `7dec21a0a48aec6b890a5b09e28a3ef60febb723` |
| 0093 issuer account 分支（0091 冻结代码显式预留挂点 · subject 必须=principal 本人且账户存在 · resume 分支仍 22023 fail-closed） | `packages/db/migrations/0093_memory_governance.sql:838-908` | `6db6678abdcaa7b36c2bcef35dedd46f985a7e7a` |
| 0129 preview 盘点面：`memory_vector_chunk` 登记行（`('memory_vector_chunk','account','local_begin_available',true,'memory_vector_chunk')`）+ 账户轨 begin 复用 0125 | `packages/db/migrations/0129_privacy_erasure_preview_path.sql:116/175/215-218` | `5f391eee159fa5b94a7c66fac80522fc6aac4bb5` |
| proof 面授权链：`signAccountSnapshot`（purpose='account_data_erasure'）→ `issueAndConsume` → 0125 claim 真入口 | `packages/db/test/vector-plane-erasure.proof.ts:108-125` | `7d8002521fb55aef95473d2ce02416b55d4dac72` |
| worker 产品 sweep：`runVectorPlaneErasureTick`（feed → jti feed → claim → purge → local_erased receipt · **无 ECDSA/JWS 验签**——DB 十项链 + consumed 快照为唯一裁定） | `packages/db/src/vector-plane-erasure.ts:97-126` | `13df30b35baaf3eb0ed8782dee08546c1d22cda0` |
| sweep 已接线 main worker | `apps/worker/src/privacy-erasure-worker.ts:41-67` · `apps/worker/src/main.ts:682-686` | `9da3dcc297aefeab5203f1155dac8db4dc13d5c3` / `e4878b61d11238b3e2da6ea9c0e50b6ab9ce481e` |
| 公开 DELETE=503 冻结 | `apps/api/src/modules/privacy/privacy.controller.ts:51-52` · `harness/privacy-erasure-http-503-pin.md` | `6a9e202616ce1e0f9159289ec0fcd1409c4878c7` / `2a9de38623d26307f6fba01e7d45398ef803d70f` |
| checklist 现状锚：INT-TRANSCRIPT-00 ◐「`0091` issue 按调用方字段落账，本身不做 JWS 验签；privacy worker 仍走 `0077`，HTTP 未接线」+ `0129` 预览回执固定未完成 + Pins retained 行；`INT-TRANSCRIPT-01` 两道不可拆 release gate（`:176`） | `ai-docs/delivery/execution-master-checklist.md:173` · `:176` | `3dc402aafcc78b3c09f7b34b11d2d1262ccee3b6` |
| PRIV4 前刀 nail 记录（`post_prove_dual_pass` · prove 33/33 attempts 1,0 · STILL OPEN 清单） | `ai-docs/delivery/execution-master-checklist.md:1179-1184` | `3dc402aafcc78b3c09f7b34b11d2d1262ccee3b6` |
| 队列 Phase 3 privacy 行 | `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md:32` | `87c812d988622abb1d9675be60857b1fd37b55f7` |
| sink inventory 维护规则（新增含用户内容表必须同变更更新 §3/§4 + registry + CHECK + pin 证明 · 生产入口保持 503） | `ai-docs/architecture/ai/privacy-deletion-sink-inventory.md:142-150`（§6）· §5 围栏表 `:129-140` | `698066593c43dd7c5a80878421d5bbb2fd36f21f` |
| 前刀 Pins 行（本刀文首照抄源） | `ai-docs/delivery/harness/gap-priv-04-vector-erase.md:4` | `85c50920f6197f1be150b1d4aba9b5f9a001ae7b` |
| 六门合同（门 1 issuer key/JWS · 门 3 INT 向量 sink 作用域键+Qdrant 登记+receipt 对齐 · 门 4 DELETE 开关） | `ai-docs/delivery/harness/gap-int-transcript-01-cutover-contract.md`（§2b） | `316dab7b614ea29313f044d66c3aab4c91ec76fd` |

## 2. 侦察结论 A：「0091 可写/对齐」残余拆解（判定：本地 coding 可推进面 = 空集）

### 2.1 已对齐面（DB 级主链今日已可写 · cite only）

issue（0093 `:870-886` account 分支 · 0091 冻结代码显式预留挂点）→ consume（0091 `:249-295` CAS + M6 issuer 三拷贝 pin）→ claim（0125 `:193-299` 十项 fail-closed，唯一授权裁定者）→ purge（0125 `:304-383` 物理 DELETE `owner=principal AND kind='memory'` · 残留≠0 → 55000）→ receipt（0091 `:418-452` 既有 `privacy_record_deletion_receipt` 落 `local_erased` · 0141 候选 C 收尾 · 零语义改动）→ completed guard（0091 `:524-558`）。proof：`vector-plane-erasure:prove` EXIT=0 33/33（attempts 1,0 全录）+ `privacy-erasure:http:prove` 19/0 同列入账（checklist `:1179-1184`）。产品 sweep 已接线（worker `:682-686`）；0129 preview 账户轨已复用 0125 begin（`:116/:215-218`）。

### 2.2 未对齐残余面（逐面归属 · 全部非本地 coding 面）

| # | 残余面 | 具体缺口（锚） | 闸归属 |
|---|--------|----------------|--------|
| 1 | 生产 issuer 授权根 | `privacy_issuer` 角色无生产 provisioning、无 key 管理/轮换；0091 issue 按调用方字段落账不做 JWS 验签（checklist `:173`）；worker tick 无 ECDSA 验签——`runVectorPlaneErasureTick` 仅依赖 DB 十项链 + 0141 consumed-jti feed（`vector-plane-erasure.ts:97-126`） | **用户闸**：INT-TRANSCRIPT-01 cutover 合同门 1（协调项 (b) 明文不可动） |
| 2 | 公开 DELETE=503 | `privacy.controller.ts:51-52` + 503 pin harness「必须保持 503，直至独立 prove + 专家审批准放开」 | **用户闸**：GAP-PRIV-02 `:58` 冻结 + 协调项 (b) |
| 3 | INT sink='vector' 作用域键 + Qdrant 登记 + receipt 对齐 | `vector_chunk` 无 interview 作用域键 → 0141 头注「诚实不建 target · Ban 假造面试作用域键」；Qdrant 面 STOPPED（PG-retained） | **用户闸**：cutover 合同门 3 + PG-retained 钉 |
| 4 | backlog `:60` 行翻行 | 行目标列字面「Qdrant as erasure sink…逐 sink receipt 对齐 0091 ledger…对齐前不得切向量真相」——PG-retained 钉下该字面目标不可诚实满足；行语义按原文判定不变（checklist `:1184` STILL OPEN） | **协调方/nail 面**（SSOT 翻行 · 本刀 Ban） |
| 5 | UC-052 flip | deletion=partial ≠ covered；flip 需 DELETE 开放 + 真实组合根回执（checklist `:173`） | **用户闸** |
| 6 | `:64` external sink 云端删除 | stub≠cloud · `cloudVendorDeleted=false` · NB-3 | 用户/协调闸（AR 线 · 非本线） |

**判定**：`GAP-PRIV-04` 残余中「≠ 0091 可写/对齐」的**可操作内核**（PG 面 receipt/fence/issue 分支）已被 0141 刀闭合至本地可证边界；剩余子面每一个都以其闸为前提，本地**无**不依赖用户闸的 coding 子面。本刀据此不立 coding REQUEST，如实登记空集结论。

## 3. 侦察结论 B → 本刀交付：P0-CB-01 快照表 sink 候选裁决规则（只裁规则不建表）

### 3.0 候选事实

- P0-CB-01 验收要求 `JobApplication + ApplicationSnapshot + CandidateEvaluationSession`，创建事务绑定 `job_id、candidate、resume_snapshot_version、competency_snapshot、consent_version`（audit `:90-96`）——subject 级个人数据面（B 端评估证据 + consent 版本记录）。
- 快照表候选（**未建**）：验收证据面为 immutable `CandidateEvaluationSnapshot`/`consent_version`（erratum 生效卷 `harness/gap-cb-audit-erratum.exec.md` · GAP-PROD-02 缺口重心四面之一）→ INSERT-only / append-only 语义。
- 互斥张力：INSERT-only（证据不可变）vs subject-erase（物理删除）。0125/0141 先例已给出消解机制：**不可变性约束普通写路径（app_role），擦除走特权租约事务（privacy_worker_owner + target+lease）**——0141 DELETE fence 的「唯一合法 DELETE 上下文 = purge 事务」正是同形。
- 风险：若 EXEC 先落表后补裁，产生**未登记 sink**——sink inventory §5 已披露同型缺口（0125 触发器不拦 DELETE · 收据与真实删除者脱节）为戒；§6 维护规则要求新增含用户内容表**同变更**更新盘点面。

### 3.1 裁决规则（RULES · 交双审 · 未来 EXEC 按此裁 · 本刀不预裁个案）

- **R1（入域判据 · 数据分类先行）**：EXEC 立表时逐列分类决定入不入擦除范围。若快照表任一列承载 subject 可识别/可关联个人数据（candidate 身份、resume 快照内容或版本引用、competency 评估、consent 版本等）→ **必须入域**（新增 sink 枚举 + R2 全套机制）；若实现为纯 HMAC/伪匿名引用且无任何 subject 关联列 → 可不入域，但必须在 0129 `privacy_preview_sink_line` 同形盘点面登记诚实 disposition（`honest_unresolved`/`placeholder_no_target` 同形）+ 立后续行。**逐列分类清单（列名→PII 分类→入域结论）是 EXEC REQUEST 必备附件**，双审逐列复核。判据时点 = DDL 定稿时点的实际列集，非本 REQUEST 的猜测列集。
- **R2（机制对齐 · 若入域）**：0125/0141 全对形，Ban 发明新形状：① sink CHECK **additive** 扩展（0125 A 同形 · Ban 重写既有枚举行）；② INSERT-only = app_role 写路径约束（INSERT 许 / UPDATE·DELETE 拒），**不是**对 privacy purge 的豁免；③ erasure-active 写围栏拒迟到 INSERT（0125 C 同形 42501）；④ DELETE fence：唯一合法 DELETE 上下文 = purge 事务 target+lease 绑定（0141 A 同形 42501 fail-closed）——immutable 与 subject-erase 的互斥以此消解；⑤ purge：subject 作用域物理 DELETE + 残留≠0 → 55000 + `receipt_hash`（0125 F 同形），scope 谓词精确（owner+subject/application 绑定）防越界；⑥ receipt：`local_erased` 经 0091 既有 `privacy_record_deletion_receipt`（零语义改动）；⑦ claim：0091 十项 fail-closed 链同形；purpose/scope 轨道映射（account 轨沿 0093 分支；application/interview 轨若涉及须显式申报 issuer 侧 subject 校验方案）。
- **R3（时序约束 · Ban 未登记落表）**：快照表 DDL 与擦除域裁决（入域 + R2 机制 / 不入域 + 盘点登记）必须**同卷**（同一 EXEC REQUEST）或裁决卷先行；Ban 先落表后补裁。SSOT 侧沿 sink inventory §6：同变更更新盘点面 + registry + CHECK + 对应 pin 证明。
- **R4（owner/多主体边界）**：快照表若被 B 端（招聘方 tenant）读取，擦除只删 subject 个人数据行/列引用；Ban 借擦除删 B 端合法留存记录；B 端聚合/均分等投影面必须按「引用失效」处理而非「B 端数据删除」，投影具体面 EXEC 时单独申报。
- **R5（诚实边界 · 沿 AR/0141 口径）**：任何入域擦除证据 = 本地/隔离行级证据 ≠ 云端删除 ≠ B 端投影失效 ≠ DELETE 开放 ≠ UC-052 flip ≠ `:78` closed；Ban 以 soft 标记宣称 erased；Ban「不可变表 = 永不删除」叙事（与 R1 入域结论冲突时以 R1 为准）；`releaseEvidence=false` 直至独立复审。
- **R6（编号与流程）**：EXEC 时 migration 编号按开工时 main tip 顺延（Ban 抢号——0124/0125 先例注释为戒；现 main tip 至 `0142`）；EXEC 另立 REQUEST 另走全程（PRE dual → AUTHORIZE → EXEC → POST dual → nail），本规则卷不授权任何 EXEC。

## 4. prove 方案（本刀）

- **docs-only 零 prove**：本刀零 coding / 零容器 / 零远程 / 零 `.env*`。唯一机检 = §1 锚在位性（被审 commit 上 `file:line` + blob SHA 逐条 grep/`git ls-tree` 复核，双审各自独立执行）。
- **未来 EXEC 面 prove（引用性描述 · 非本刀）**：沿 `scripts/run-e2e-isolated.mjs` 隔离真 PG（pgvector fixture 惯例）具名 CMD；断言沿 0141 六件套同形 + R4 投影面 intact 断言；EXIT 契约：EXIT0 ≠ covered ≠ `:78`/`:60` closed ≠ UC-052 flip ≠ DELETE 开放 ≠ HA；EXIT1 = 诚实保留 · attempts 全录（Asia/Shanghai + SHA）· Ban retry-to-green。

## 5. 硬 Ban 列表

**Ban 碰公开 DELETE=503**（GAP-PRIV-02 `:58` 冻结 · 协调项 (b)）· **Ban 动 INT-TRANSCRIPT-01 面**（blocked · 用户闸 · Ban 预授权 cutover 六门任一）· **Ban 建快照表 / Ban sink CHECK 改动 / Ban 任何 migration**（本刀只裁规则）· **Ban 动 0091/0093/0125/0129/0141 既有函数与语义**（冻结主链 · cite only）· **Ban 改共享 SSOT**（backlog `:58`/`:59`/`:60`/`:64`/`:77`/`:78`/`:777` · checklist · matrix · queue · audit 本体 blob `8393c67b` 零字节）· Ban 借 AR `:64` 证据/状态 · Ban 洗任何 OPEN 钉 · Ban count-as-erased · Ban 删 qbank/共享语料 · Ban 假造 INT sink='vector' 面试作用域键 · Ban UC-052 flip · Ban retry-to-green · Ban Meridian · **Ban secrets / `.env*`** · Ban buy cloud · Ban force-push · Ban push 主线/共享分支（本刀交付 push 仅限 `line/priv04-residual-scope` docs-only REQUEST 分支 · 派单交付步）· Ban self-approve（alone ≠ dual）· Ban self-nail · Ban product/infra code this turn。

## 6. 流程声明（§3 loop）

本 REQUEST（4 文件 docs-only：harness + slice + 双空审 stub）→ PRE dual BOTH PASS（`mw-privacy-int` + `mw-e2e-ha` · alone ≠ dual · 不代签）→ 协调方 AUTHORIZE（授权物 = §3.1 裁决规则入卷）→ nail 期 SSOT 登记（若协调方裁登记）由协调方/nail 执行，本刀 Ban 自登记。implementer 禁自批；本 REQUEST 零 prove 执行、零容器、零产品码、零 SSOT 编辑。

## 7. Non-claims

Not a pass · not run · not built（无表被建）· not adjudicated per-case（规则 ≠ 个案裁决）· not 0091-writable/aligned flipped（`:60` 原文残余如实保留）· not covered · not closed · not vendor/cloud wiped · not open DELETE · not HA · not releaseEvidence · alone ≠ dual · 本地/隔离擦除证据 ≠ 生产彻底删除（沿 AR 口径）· 本 REQUEST docs-only（4 文件 · 零产品码 · 零 migration · 零 SSOT 编辑）。

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · public DELETE=503 · backlog `:60` OPEN · `:64` OPEN · UC-052 partial · canHonestlyFlip=false · **STOP**

---

*Harness · PRIV4-B GAP-PRIV-04 残余面侦察+收口 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · Ban coding until PRE dual BOTH PASS (mw-privacy-int + mw-e2e-ha) + 协调方 AUTHORIZE · Ban 建表 · 只裁规则不建表 · DELETE=503 · `:60` OPEN · PG-retained · ≠ AR `:64` · alone ≠ dual · STOP*
