# Harness — **INT01 · INT-TRANSCRIPT-01 生产 cutover 立卷刀（准入合同 · 沿 MOP03 六门先例）**（docs-only REQUEST · **`executed:awaiting_post_prove_dual`** · Ban 预授权六门任一 · Ban cutover-ready claim · Ban coding · Ban prove）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC lifecycle 推进落盘 2026-10-07 · PRE-EXEC dual BOTH PASS：mw-privacy-int `70e95ca`（origin 镜像 `0cee4f18`）+ mw-e2e-ha `58466c8`（origin 镜像 `b4bcff45`）· 均已收 origin · D1–D3 三裁一致（双审 ACCEPT/PASS）· 立卷产物 = REQUEST 自身（harness+slice+双 stub · 六门准入合同在内 → exec 仅推进 lifecycle 标记 + Conditions 登记 · 见 §9）· line 孪生 `397f3ece` rebase 到 origin tip `9f399f55` 与链载孪生 `c173ee0f`（同父 `313e04a7` · patch-id `9d52d8ea` 双侧亲算全等）同补丁自动 drop 落 tip（MOP03 EXEC rebase 先例）· 零 coding · 零 prove 执行 · 零 SSOT（backlog / matrix / checklist 零改 · nail 阶段才登记）· **Ban 预授权六门任一** · **Ban 宣称 cutover ready** · **Ban 把立卷写成授权** · INT-TRANSCRIPT-01 **保持 blocked** · 公开 DELETE=503 冻结 · `:60`/`:64` OPEN · UC-052 stays partial · PG LISTEN / Redis **无关本刀（零改）** · **Ban self-write `post_prove_dual_pass`** · alone ≠ dual · Ban nail until POST BOTH + 协调方 AUTHORIZE）

> **Pre-exec-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（docs-only REQUEST 立卷 · L0 · Ban coding · Ban prove execution · Ban push · alone ≠ dual · Ban nail until PRE BOTH PASS + 协调方 AUTHORIZE）
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`313e04a7`** / full `313e04a7fc0ca91ef60fb229802dd374f85cc93d`
**Wave**: Line **INT01**（queue Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:31-32`：「## Phase 3 privacy / DELETE=503 freeze · INT-TRANSCRIPT-01 · GAP-PRIV-01 tenant≠RLS · GAP-PRIV-04 vector erase」）
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（pre-exec dual · alone ≠ dual · Ban self-approve · Ban 代签 peer）
**Knife**: **INT-TRANSCRIPT-01 生产 cutover 立卷刀**（队列 Phase 3）— 把 `INT-TRANSCRIPT-01` 生产 cutover 的授权口径沿 **MOP03 六门先例（`harness/gap-mop-03-successor.md` §2b · 准入合同）** 书面立卷为未来独立 cutover REQUEST 的**准入合同**；本刀只立卷，**不执行 cutover、不预授权任何一门、不宣称 cutover ready**。
**Gap id**: 关联 **GAP-PRIV-03**（backlog `:59` · P0 · OPEN：INT-TRANSCRIPT 控制面未关 · 00 ◐ · 01 blocked）· 关联 **GAP-PRIV-02**（`:58` · DELETE=503 冻结）· 关联 **GAP-PRIV-04**（`:60` · OPEN）· 关联 **GAP-PRIV-EXTERNAL-SINK-RETENTION**（`:64` · OPEN）

## 0. 硬钉原文（只读引用 · 零改写）

1. `execution-master-checklist.md:173`（INT-TRANSCRIPT-00 段收尾）：「这**不**授权 `INT-TRANSCRIPT-01` 生产 cutover，也不把 rehearsal purge 或预览删除回执称为公开删除已闭环。」
2. `execution-master-checklist.md:169`（依赖段）：「00 不授权 01 生产写入；树上 0092/0096 rehearsal 表/函数与预览 `/answers` 都不是公开 01 write route，也不把 rehearsal purge 称为删除已闭环。」
3. `execution-master-checklist.md:176`（INT-TRANSCRIPT-01）：「真实用户 canonical 写入有两个不可拆分的 release gate：先由 00 验证授权/删除合同；再由**同一部署迁移**安装 artifact/draft/submission/item/ref-only-job/view 的 target resolver、deletion ledger、逐 sink receipt 与删后 read=0，并以真实 HTTP/SSE/RLS 组合根证明。两个 gate 任一缺失时仅允许非用户数据的 test-only rehearsal，所有真实 **01 canonical** raw-answer write route 保持 disabled。」
4. `gap-bug-backlog.md:64`（GAP-PRIV-EXTERNAL-SINK-RETENTION · OPEN）：「**:64 stays OPEN** until real cloud vendor evidence · … · **Ban close via docs/stub** · … · **`external_confirmed` ≠ vendor data deleted（NB-3）** · stub≠cloud · cloudVendorDeleted=false」。
5. `gap-bug-backlog.md:60`（GAP-PRIV-04 · OPEN）：「Qdrant **尚未**登记为可证明擦除 sink」+ checklist `:1181`：「**EXIT0 = 本地向量面行级证据 ≠ covered ≠ backlog `:60` closed ≠ `:64` close ≠ 云端删除 ≠ UC-052 flip ≠ DELETE 开放**」。INT transcript 的向量 sink 在 PRIV4 刀为 **no-target**（该刀证据面 = PG `memory_vector_chunk` kind=memory 本地行级），作用域键设计属本合同门 3。
6. `gap-bug-backlog.md:100`（BUG-REV-COND）：「切流/放弃 RLS 仍 block · 切流前 ADR 隐私 prove 清单全绿 + 四专家审；禁止自批」。

## 1. 「立卷 ≠ 授权」解读（implementer 解读 · 双审裁决点）

**解读（一句话）**：本刀沿 MOP03 successor 先例，把 `INT-TRANSCRIPT-01` 生产 cutover 的**授权口径**立卷为一纸**准入合同**（六门 + 两道 checklist `:176` 不可拆 release gate + dual-write 切换顺序前提）——合同定义的是「未来 cutover REQUEST 必须同时满足什么才**可被授权**」，它本身**不满足其中任何一门、不启动任何一门、不豁免任何一道既有 gate**；`INT-TRANSCRIPT-01` 在 checklist 中仍为 `[ ]` blocked，本刀零改 SSOT。

**裁决点（留给 PRE dual · mw-privacy-int + mw-e2e-ha）**：

1. **D1 · 范围口径**：本刀 = 立卷合同 only。六门按派单原文**不加不减**（不把 GAP-PRIV-01 tenant≠RLS 并入本刀、不把 SCOR-01/02 评分面并入）；若双审判须增删门，须显式改写本合同而非口头扩面。
2. **D2 · 门 2 vendor 证据形态**：云端 vendor real-delete 证据的**可复核形态**（vendor 控制台回执 / console-cited actual / 工单级确认）本合同**不定死**，留给未来 cutover REQUEST 自行定义 + 双审；但**Ban** 以 local_isolated_stub（AR PATH 证据）、`external_confirmed`（NB-3）或 docs 自述顶替 vendor 证据——形态可留白，顶替禁入。
3. **D3 · 四专家审名单**：BUG-REV-COND 原文只说「四专家审」未列名单——按「**不降级 + 名单留 AUTHORIZE**」理解：≥ 既有 mw-privacy-int + mw-e2e-ha 双审再加两席，具体名单由协调方 AUTHORIZE 时指派；本刀 **Ban 代指派**、Ban 把四专家审降为双审即切（沿 MOP03 D2 口径）。

## 2. 本刀范围（docs · 立卷合同 = 全部产出）

| Face | 本 REQUEST（拟） | 仍须保留 |
|------|------------------|----------|
| **立卷合同** | 书面定义 INT-TRANSCRIPT-01 生产 cutover 的六门准入合同（见 §2b） | Ban 预授权任何一门 · Ban cutover-ready claim · 01 stays blocked |
| **现状诚实清单** | preview 版能力边界 / legacy plaintext / TC 现状逐条引 checklist 原文（见 §2c） | Ban 把预览/rehearsal 写成已闭环 |
| **prove 方案** | named-not-run + EXIT 契约预声明（见 §4/§5） | 本 REQUEST 零执行 · named ≠ 授权（I2 先例） |
| **Pins** | 原值全抄写死（见 §6） | 零翻动 |

**无关面**：PG LISTEN/NOTIFY、Redis Streams wakeup、MODEL-OP 双 reconciler——均属 MOP03 successor cutover 面（`harness/gap-mop-03-successor.md` · PG LISTEN retained 口径），**与本刀无关**；本刀不定义、不引用、不改其任何开关。

### 2b. INT-TRANSCRIPT-01 生产 cutover 准入合同（本刀书面钉 · 全部 docs · 六门全过才可另立 cutover REQUEST）

未来 cutover REQUEST（另 REQUEST · 非本刀）至少须**同时**满足以下六门 + §2b-0 结构前提；**每门独立审、独立证据，任一门不过即整体不可授权**。本合同不预授权任何一门，也不因任何单门提前达标而宣布 cutover ready。

**§2b-0 结构前提（checklist `:176` 两道不可拆 release gate + 切换顺序，非门、缺一即止）**

- **0a**：先由 `INT-TRANSCRIPT-00` 验证授权/删除合同（checklist `:176`「先由 00 验证授权/删除合同」）。
- **0b**：再由**同一部署迁移**安装 artifact/draft/submission/item/ref-only-job/view 的 target resolver、deletion ledger、逐 sink receipt 与删后 read=0，并以**真实 HTTP/SSE/RLS 组合根**证明（checklist `:176` 原文；rehearsal / 预览账本 / test-only ≠ 该证明）。
- **0c**：启用 01 前按 `ai-docs/architecture/backend/interview-answer-dual-write-cutover.md` 切换图**切断 legacy `/turn` 明文 payload**（0126 双写互斥围栏在案；`INT-P0-RAW-QUEUE` 关闭须按该图另证，Ban 文字洗白）。

**门 1 · 0091 生产级 issuer key 管理与轮换证明**

- 可执行判据：生产 issuer 密钥**部署级管理**证明——密钥来源非 repo/非 `AUTH_SECRET`（checklist `:169`「不得复用 `AUTH_SECRET`、runtime SQL、worker/deleter 或 GUC 身份根」）；**轮换流程**有逐次证据（旧 key 验签窗口 + 新 key 签发 + 轮换期间 receipt 连续性）；**JWS 验签落地**（现状 `:173`：「`0091` issue 按调用方字段落账，本身不做 JWS 验签」——门 1 要求验签在真实组合根生效）；生产组合根 issue→verify→receipt 全链路证据；无回执时 `releaseEvidence=false` 维持。
- 现状锚：checklist `:167`「无部署密钥、无真实组合根回执（`releaseEvidence=false`）」。

**门 2 · 外部 sink 逐个 real-delete 证据（AR `:64` 关闭前提）**

- 可执行判据：oss / redis / langfuse 每个外部 sink 一份 **cloud vendor 级**删除证据（形态留待 D2，但 Ban local stub / `external_confirmed` NB-3 / docs 自述顶替）；逐 sink 与 `0091`+`0140` 异步 purge 链对齐；`cloudVendorDeleted` 逐 sink 可复核为 true；`:64` 的 flip 由协调方 nail 阶段裁决——**本合同 Ban 自行 flip `:64`**。
- 现状锚：backlog `:64` OPEN（AN-PRIV-EXT + AR 两刀均 `post_prove_dual_pass` 但均 **stub≠cloud** · AR = local_isolated_stub PATH only）。

**门 3 · 向量面 INT sink 作用域键设计（PRIV4 no-target 的后续）**

- 可执行判据：INT transcript 向量 sink 的**作用域键设计**成文（subject / interview id scope → erasure 目标解析）；Qdrant **作为可证明擦除 sink 登记**（backlog `:60` acceptance 原文：「删后 **recall=0** + **逐 sink receipt** **对齐 0091** ledger」）；INT 面 receipt 进 `0091` 账本；HNSW 内部页 / WAL / 备份 / 副本不在行级证据面的披露沿 AR 口径保留（诚实披露 ≠ 静默豁免）。
- 现状锚：PRIV4 刀 `post_prove_dual_pass` 证据面 = PG `memory_vector_chunk` kind=memory 本地行级（checklist `:1179-1184`），**INT sink='vector' 为 no-target**；`:60` stays OPEN。

**门 4 · 公开 DELETE 从 503 → 真删除的开关合同 + 独立审**

- 可执行判据：开关合同**书面写死**切换条件 = backlog `:58` acceptance 原文「issuer/lease + 逐 sink receipt + 删后 read=0」；放开前 `pnpm privacy-erasure:http:prove`（含 DELETE=503 pin）先以 503 语义入账，再在开关合同满足时由**独立 prove + 专家审批准**（≥ mw-privacy-int + mw-e2e-ha dual · Ban 自批）放行；0129 `erasure-preview` 保持 `preview_incomplete` 语义直至开关合同满足；公开 DELETE 的 503→真删除是**单一明确开关**（合同点名的那个），Ban 多入口绕行。
- 现状锚：backlog `:58`「**必须保持 503**（冻结）… 独立 prove + 专家审批准前 **不得放开**」；checklist `:173`「公开 `DELETE /privacy/interview-data/:id` 仍 503」。

**门 5 · 公平重放/幂等**

- 可执行判据：checklist `:176` 三项在**真实组合根**复证——「同 key/同体回放、同 key/异体冲突、同题双 tab 一 winner」（回放幂等成功 / 异体显式冲突 / 双 tab 恰一 winner）；公平调度面：`0128` dispatch fairness 已在 main 但「公开预览下 OCR 组合根仍关」（checklist `:175`），门 5 要求生产组合根级公平性证据，**预览级证据不得顶替**。
- 现状锚：0126 互斥围栏 + 0128 fairness 已 main（checklist `:174-175`），均「不是生产 01 HTTP」。

**门 6 · BUG-REV-COND 四专家审**

- 可执行判据：backlog `:100` 原文全量满足——「切流前 ADR 隐私 prove 清单全绿 + 四专家审；禁止自批」；ADR 隐私 prove 清单逐项全绿（含本合同门 1–5 的 named proves）在案；四专家审不降级（D3）；四专家审 + 协调方 AUTHORIZE 全齐后 cutover REQUEST 才可进入执行；alone ≠ dual 贯穿全程。
- 现状锚：BUG-REV-COND 属流程阻塞项，当前未见四专家审记录在案（本刀双审只是 REQUEST 级 docs gate，**不是**门 6）。

### 2c. 现状诚实清单（preview 版能力边界 · 逐条引 checklist 原文 · Ban 洗白）

| # | 现状 | 原文锚（只读引用） |
|---|------|--------------------|
| H1 | **preview 能做什么**：`0129` 预览删除是盘点面，可盘 sink 并链接 begin | checklist `:173`：「`0129` 预览版 `POST /privacy/erasure-preview` 可盘点 sink 并链接 0096/0125 begin，回执固定未完成、`releaseEvidence=false`，不是 issuer 生产删除。」 |
| H2 | **preview 删除回执固定未完成**；公开预览下该面仍 503 | checklist `:173` 同句「回执固定未完成」；`:175`：「`0129` 预览删除是另一条账本，公开预览下仍 503。」 |
| H3 | **preview `/answers`**：接 0092 rehearsal 账本，受控写、非预览 404、不入 apiContract | checklist `:175`：「预览路径把 `POST /interview/:id/answers` 接到既有 `submitInterviewAnswer`（0092 rehearsal 账本）。仅 `MEETWISE_PUBLIC_PREVIEW=1` 可写；非预览 404。不入 `apiContract`，不写 plaintext `/turn` job，不宣称 01 生产 cutover。」 |
| H4 | **公开 DELETE=503 冻结** | backlog `:58`（GAP-PRIV-02）+ checklist `:154`：「其余方法在 NestJS(Fastify) `onRequest` 前置门固定 `503 public_preview_read_only`」+ `:173`「公开 `DELETE /privacy/interview-data/:id` 仍 503」 |
| H5 | **legacy `/turn` plaintext job payload = `INT-P0-RAW-QUEUE` 不可洗** | checklist `:173`：「现有 legacy `/turn` 仍写 plaintext job payload，必须如实保留为 `INT-P0-RAW-QUEUE`，不可被文字误称为已停用。」；cutover 图盘点表：「`interview_job.payload` 含 TurnDto **明文 `answer`** … `INT-P0-RAW-QUEUE` 仍 open」 |
| H6 | **七类 TC 仍 planned/unmapped** | checklist `:173`：「七类 TC 仍 planned/unmapped，无部署密钥、无真实组合根回执（`releaseEvidence=false`）」；`:154`：「该项的 `TC-public-preview-01-main/E1…E6` 仍是 planned/unmapped」 |
| H7 | **UC-052 stays partial** | checklist `:173`：「矩阵 **UC-052 deletion=partial** · **≠ covered** · **≠** INT-TRANSCRIPT-01 / controlPlaneClosed · externals 仍 `retention_pending`」 |
| H8 | **0091 issuer / 账本现状（只读）**：本地合同已冻结、无验签、worker 走 0077、HTTP 未接线 | checklist `:173`：「独立 `PrivacyAuthorizationIssuer`（ECDSA P-256 / ES256，`iss=meetwise-privacy-authz-v1`）与 0091 `privacy_authorization_snapshot` / `privacy_deletion_receipt`、受约束 claim、no-forge-completed guard 已在源码落地；… `0091` issue 按调用方字段落账，本身不做 JWS 验签；privacy worker 仍走 `0077`，HTTP 未接线。submission/receipt 合同已冻结且不进 OpenAPI。」 |
| H9 | **AR `:64` OPEN**：external sink 云端删除未发生 | backlog `:64`：「stub≠cloud · cloudVendorDeleted=false · Ban close :64 · … NB-3 `external_confirmed` ≠ vendor data deleted」 |
| H10 | **PRIV4 `:60`**：本地行级证据已落 ≠ `:60` close；INT sink='vector' no-target | checklist `:1181`：「EXIT0 = 本地向量面行级证据 ≠ covered ≠ backlog `:60` closed ≠ `:64` close ≠ 云端删除 ≠ UC-052 flip ≠ DELETE 开放」 |
| H11 | **账本 HTTP 证明环境**：远程 Postgres 环境变量 · Ban `pnpm db:up` | checklist `:173`/`:175`：「账本 HTTP 证明须远程 Postgres 环境变量，禁止 `pnpm db:up`，无回执时 `releaseEvidence=false`」 |
| H12 | **checkpoint 恢复面有限** | checklist `:167`：「checkpoint 只足以恢复 pending graph 工作，legacy `/turn` raw answer 在 answer job 终态前仍为明文 payload，SSE/client 状态不构成历史面试账本。」 |
| H13 | **0092/0096 rehearsal ≠ 公开 write route** | checklist `:169`：「树上 0092/0096 rehearsal 表/函数与预览 `/answers` 都不是公开 01 write route，也不把 rehearsal purge 称为删除已闭环。」 |

## 3. 相关历史（只读 cite · 零改写）

| 来源 | 口径 |
|------|------|
| MOP03 successor 六门先例 | `harness/gap-mop-03-successor.md` §2b（准入合同式立卷 · Ban 借立卷宣称 cutover 已开 · alone ≠ dual）— 本合同**沿其结构**，门内容按 INT 面重写，两刀互不引用对方开关面 |
| UC-052 内部授权擦除第一刀 | `post_prove_dual_pass`（prove tip `3c4847a` · EOR dual `08d54f8`/`3e39c1e`）· deletion=partial ≠ covered（checklist `:173`） |
| AN-PRIV-EXT / AR 两刀 | `:64` 两度 `post_prove_dual_pass`（0137 fail-closed honesty + 0140 local_isolated_stub PATH）· 均 stub≠cloud · `:64` OPEN（backlog `:64`） |
| PRIV4 向量面收尾刀 | `post_prove_dual_pass`（REQUEST `f4268abe` · CODE `fb1885a5`+`90e4de7e` · mig `0141` · PROVE 33/33 attempts 1,0 全录）· 本地行级证据 · `:60`/`:64` stays OPEN（checklist `:1179-1184`） |
| 0126 双写互斥围栏 | `INT-ANSWER-DUAL-WRITE-FENCE`（checklist `:174`）· `/turn` 无 ledger 时仍写明文 payload · 切换顺序见 `interview-answer-dual-write-cutover.md` |
| GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` | mitigated/cause-unknown · **Ban retry-to-green 先例**（attempts 全录 · 单次后绿不关因） |

## 4. 离线 prove 计划（named · **本 REQUEST 零执行** · named ≠ coding/prove 授权（I2 先例））

| Command | State | 关联门 |
|---------|-------|--------|
| `pnpm privacy-erasure:http:prove`（含 DELETE=503 pin） | 已存在 · 本 REQUEST **不跑** | 门 4 判据面 · 503 pin 现行入账 |
| `pnpm int-answer-dual-write-fence:prove` | 已存在 · 本 REQUEST **不跑** | §2b-0c 切换顺序前置（0126 围栏） |
| `pnpm uc052:internal-erasure:prove` | 已存在 · 本 REQUEST **不跑** | 门 4 read=0 语义现状锚 |
| `pnpm uc052:external-sink-retention:prove` / `pnpm uc052:external-sink-async-purge:prove` | 已存在 · 本 REQUEST **不跑** | 门 2 现状锚（stub 面） |
| `pnpm vector-plane-erasure:prove` / `pnpm qdrant-store:g5-erasure:prove` | 已存在 · 本 REQUEST **不跑** | 门 3 现状锚（memory_vector_chunk 面） |
| `pnpm mem00-int00:prove-path`（#103） | 已存在 · 本 REQUEST **不跑** | §2b-0a（00→01 prove 路径） |
| 生产组合根组合证 / issuer 轮换证明 / INT 向量 sink / DELETE 开关合同 prove | **不命名 · 不授权** | 属未来 cutover REQUEST 自带（远程 Postgres · Ban `pnpm db:up`） |

本 REQUEST 不新增脚本、不改 `package.json`、不跑任何 prove、不起容器、不连任何远程环境。

## 5. EXIT 契约（预声明 · 适用于未来授权后的 prove · 本 REQUEST 零执行）

- **attempts 全记录**：每次 prove 尝试逐条入 receipt（attempt 序号 · Asia/Shanghai 时间窗 · code SHA · EXIT 值）；失败与成功同列入账（PRIV4 先例：#1 EXIT=1 42P08 确定性缺陷诚实保留 · #2 EXIT=0）。
- **诚实失败路径**：EXIT≠0 → 原样记录 → 判 fail → **Ban retry-to-green**（GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` 先例：记录每次 attempt，单次后绿不关因）。
- 预声明单次 attempt 窗口；如需重跑须新 REQUEST + 双审。
- **EXIT0 ≠** cutover ready ≠ 六门任一关闭 ≠ INT-TRANSCRIPT-01 解禁 ≠ DELETE 开放 ≠ `:60`/`:64` closed ≠ UC-052 covered ≠ HA ≠ `releaseEvidence=true` ≠ suite green（Line C 口径：wiring 级绿 ≠ suite）。
- 账本 HTTP 证明一律远程 Postgres 环境变量，**Ban `pnpm db:up`**（checklist `:173`）。

## 6. Pins（原值全抄 · retained 写死）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **public DELETE=503**（冻结 · GAP-PRIV-02）· `:60` OPEN · `:64` OPEN（`cloudVendorDeleted=false`）· UC-052 partial · INT-TRANSCRIPT-01 **blocked** · `INT-P0-RAW-QUEUE` open · 七类 TC planned/unmapped · PG LISTEN / Redis **unchanged（无关本刀）**

## 7. Ban 列表

- **Ban coding**（本刀 docs-only）· **Ban prove execution** · **Ban live**（无 Key/网络/付费/控制台 spend · Ban `pnpm db:up`）
- **Ban 预授权六门任一**（合同只定义判据，任何门的达标裁决都属未来 cutover REQUEST + 双审 + AUTHORIZE）
- **Ban 宣称 cutover ready** / Ban 把立卷写成授权 / Ban INT-TRANSCRIPT-01 flip 或 blocked 摘除 / Ban「01 已解禁」叙事
- **Ban 公开 DELETE 开放**（503 冻结 · GAP-PRIV-02）· Ban 0129 preview 回执写成完成 · Ban 预览删除称为 issuer 生产删除
- **Ban `:58`/`:60`/`:64` flip**（docs/stub 关 gap 一律禁 · backlog 原文）· Ban UC-052 covered flip · Ban coveredCount 变动 · Ban matrix/checklist/backlog SSOT 改（nail 阶段才登记）
- **Ban `INT-P0-RAW-QUEUE` 洗白**（plaintext payload 不得文字洗成已停用）· Ban 七类 TC 映射/翻行 · Ban rehearsal purge 称删除闭环
- **Ban PG LISTEN/Redis 任何改动或引用为切流语义**（无关本刀 · MOP03 面保留口径）
- Ban 云 vendor 删除以 local stub / `external_confirmed`（NB-3）/ docs 自述顶替（D2）· Ban 四专家审降级或代指派（D3）
- Ban 碰 sibling AN 文件（PRIV-EXT / PERF-TEAR / RAG-R3 / AO COND body / MOP 系列）· Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push**（本刀禁 push）· Ban self-approve（alone ≠ dual）

## 8. Non-claims

docs-only REQUEST 立卷 · **not cutover ready** · **not INT-TRANSCRIPT-01 授权/解禁** · not 六门任一关闭 · not DELETE 开放（503 冻结）· not `:60`/`:64` closed · not UC-052 covered · not `cloudVendorDeleted=true` · not HA · not `releaseEvidence=true` · not 完整面试记录/控制面已关（checklist `:67`）· PG LISTEN/Redis unchanged · alone ≠ dual · PASS ≠ AUTHORIZE ≠ coding ≠ prove

## 9. EXEC 登记（2026-10-07 · lifecycle 推进 · docs-only · 协调方 AUTHORIZE 后落盘）

| 项 | 登记 |
|----|------|
| **PRE-EXEC dual BOTH PASS** | mw-privacy-int `70e95ca` / `70e95cafd40df1263043b89077e28c27708f6232`（origin 镜像 `0cee4f18`）+ mw-e2e-ha `58466c8` / `58466c836d910ff6a1c120c6ae9450cc7a250fac`（origin 镜像 `b4bcff45`）· 均 0 Blocker · Verdict PASS · 均已收 origin |
| **REQUEST 落链 provenance** | line 孪生 `397f3ece`（parent `313e04a7`）EXEC rebase 到 origin tip `9f399f55` 时，与 origin 链载孪生 `c173ee0f`（同父 `313e04a7` · tree `8ac5a976` 一致 · patch-id `9d52d8ea` 双侧亲算全等）同补丁**自动 drop 落 tip**（MOP03 EXEC rebase 先例）· 内容零漂移 · 后续 nail/dual 记账按 **C-3 / C-EH-7** 钉实际祖先 sha `c173ee0f` |
| **D1 裁决（双审一致）** | **六门不加不减 = ACCEPT/PASS**：不并入 GAP-PRIV-01 tenant≠RLS、不并入 SCOR-01/02；未来增删门须显式改写本合同 + 双审，Ban 口头扩面/缩面（C-EH-3）；GAP-PRIV-01/SCOR 排除**不**豁免 RLS 作为门5/§2b-0b 证据根（`:100` 切流 block 原样在案） |
| **D2 裁决（双审一致）** | **vendor 证据形态留白·自洽 = ACCEPT/PASS**：正面形态留未来 cutover REQUEST 定义 + 双审；顶替禁令类别级写死（local_isolated_stub / `external_confirmed` NB-3 / docs 自述为示例非穷尽白名单）；未来形态定义须产出 **vendor 侧可复核工件**、Ban 实现方自述/无交叉核 console 截图顶替（C-EH-4） |
| **D3 裁决（双审一致）** | **四专家名单留 AUTHORIZE = ACCEPT/PASS**：不降级 · 下限 ≥ mw-privacy-int + mw-e2e-ha 再加两席 · 名单由协调方 AUTHORIZE 指派 · Ban 代指派 · Ban 降为双审即切（C-EH-5） |
| **Conditions 落点 · privacy C-1（修正义务 · exec 如实引用）** | harness §4 表与 slice 将 `pnpm mem00-int00:prove-path`（#103）标为「已存在」——在被审 base 上该脚本**不在任何 package.json**，backlog `:24`/`:45` 记 #103 为 **INFLIGHT** PR（`chore/mem00-int00-prove-path`）未合入 `feat/mysql-schema-skeleton`。本刀零执行、仅 named-not-run 故不阻 Verdict。**义务：nail 阶段须把该格改注为「属 #103 INFLIGHT、合入后方可称已存在」，未来任何引用前须在承载分支复核**——本 exec 仅登记该义务，不改 §4 表格原文（SSOT/立卷原文 exec 零触碰） |
| **Conditions 落点 · privacy C-2** | 引用纪律：双审 PASS 仅 REQUEST 级 docs gate；不得被引用为六门任一达标、cutover ready、01 解禁或 DELETE 开放；六门裁决一律发生在未来独立 cutover REQUEST + 协调方 AUTHORIZE |
| **Conditions 落点 · privacy C-3** | sha 记账：后续 nail/dual 记账钉实际祖先 sha `c173ee0f`（已按本表 provenance 行落实） |
| **Conditions 落点 · e2e-ha C-EH-1** | 门5 唯一合格证据根 = **真实 HTTP/SSE/RLS 组合根**（out-of-process 真 HTTP + 真 SSE + RLS 开启远程 Postgres · Ban `pnpm db:up`）；**in-process（supertest 式 app / 直调 service/仓储 / scripted seam / 0092/0096 rehearsal 面 / 0128 预览级证据）一律不足以过门 5**；「双 tab 恰一 winner」须**两个独立并发 HTTP/SSE 会话**、串行两次调用不算数（随卷携带 · 合同原文 + 本 Condition 双重钉） |
| **Conditions 落点 · e2e-ha C-EH-2** | 门4 放行前置 = 独立 prove（DELETE=503 pin 先行入账）+ ≥ mw-privacy-int + mw-e2e-ha dual 专家审 + Ban 自批 + 单一明确开关 Ban 多入口绕行；0129 `preview_incomplete` 直至开关合同满足 |
| **Conditions 落点 · e2e-ha C-EH-3** | D1 落地（见上 D1 行） |
| **Conditions 落点 · e2e-ha C-EH-4** | D2 落地（见上 D2 行） |
| **Conditions 落点 · e2e-ha C-EH-5** | D3 落地（见上 D3 行） |
| **Conditions 落点 · e2e-ha C-EH-6** | 双审 PASS 仅 docs gate 一票 · alone ≠ dual · 不预授权六门任一 · PASS ≠ AUTHORIZE ≠ coding ≠ prove ≠ cutover · INT-TRANSCRIPT-01 stays blocked · §5 EXIT0 ≠ 清单在未来执行期持续绑定 |
| **Conditions 落点 · e2e-ha C-EH-7** | OB-EH-1 lineage：协调方 nail 阶段落链时以 patch-id `9d52d8ea` 复核 `397f3ece` ≡ `c173ee0f` 且合并零内容漂移 |
| **携带口径注记** | 派单写「C-EH-1~5 随卷携带」，实审 Conditions 为 **C-EH-1~7**——按**超集全携带**（C-EH-6/7 一并绑定），零弱化 |

## Review stubs

| Expert | Stub |
|--------|------|
| `mw-privacy-int` | `reviews/REQUEST-2026-10-07-gap-int-transcript-01-cutover-contract-mw-privacy-int.md` |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-int-transcript-01-cutover-contract-mw-e2e-ha.md` |

**Pre-exec dual BOTH PASS（2026-10-07 · mw-privacy-int `70e95ca` + mw-e2e-ha `58466c8` · D1–D3 三裁一致）· 执行已按协调方 AUTHORIZE 落盘（docs-only lifecycle 推进 + §9 Conditions 登记）· 本 REQUEST 仍不授权 coding / prove / cutover；POST dual + 协调方 AUTHORIZE 前 Ban nail / Ban SSOT 登记 / Ban self-write `post_prove_dual_pass`。**

*Harness · INT01 INT-TRANSCRIPT-01 生产 cutover 立卷合同 · 2026-10-07 · `executed:awaiting_post_prove_dual` · 零 coding · 零 prove 执行 · Ban 预授权六门任一 · Ban cutover-ready claim · DELETE=503 冻结 · `:60`/`:64` OPEN · UC-052 partial · alone ≠ dual · STOP（awaiting POST dual）*
