# REQUEST — **GAP-RAG-05 semantic classifier 刀**（生产 RAG 语义/LLM 意图分类器 · 受控评测 harness 待建 · `:73` OPEN）· pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-rag-05-semantic-classifier.md` · slice `gap-rag-05-semantic-classifier.slice.md`
**Parent tip**: `50423a6f`（full `50423a6fa6f18d4c9d193611cf84c4702e067208` · SCOR/P0-CB inventory nail）
**Date**: 2026-10-07
**Line**: **Phase 4 RAG / GAP-RAG-05 semantic classifier**（队列 `REMAINING-NORTH-STAR-QUEUE.md:34-35`「GAP-RAG-02 fixture · GAP-RAG-05 semantic classifier late」· RAG02 fixture 刀已 nail · **本刀 = Phase 4 剩余行**）

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| GAP-RAG-05（backlog `:73`） | **OPEN**（retained · Ban close 整行 · Ban 翻行） |
| GAP-RAG-02（backlog `:70`） | **OPEN**（fixture 面 NAIL `6afd8c8f` · 剩余面 OPEN · 零触碰） |
| GAP-RAG-03（backlog `:71`） | **OPEN**（AQ 钉 · 零触碰 · Ban 借刀） |
| CRAG / `researchBoundary` | **≠ router**（口径钉 · Ban 洗成 router 证据） |
| liveDefault | **OFF**（默认禁 live · Route L 须双审裁 + EXEC 显式授权 · AD P4） |
| canHonestlyFlip | **false** |
| MySQL FULLTEXT / Qdrant vector truth | **Ban** |

## 请审什么（mw-rag-route · 分类器契约 / 两路线裁决 / 漏斗语义 / prove 契约与诚实失败路径）

Line Phase 4 RAG · after RAG02 fixture nail（`line/rag02-nail` `6afd8c8f`）· R4 硬过滤条件已满足（`gR45Closed=true`）→ backlog `:73`「在 R4 硬过滤关闭后条件实施」条件解除。Please review:

1. **范围与原文一致性**: knife 对象 = backlog `gap-bug-backlog.md:73` GAP-RAG-05（P1 · OPEN）原文「无生产 RAG 语义/LLM 意图分类器；CRAG/researchBoundary ≠ router（PRD-TEST-017 / RAG-FUNNEL-07/08）」；目标「规则→轻量枚举→人工澄清漏斗；分类只建议 allowlisted track，不授读权」；harness 列「受控评测 harness（待建）；不得替代 R4」。代码锚现状独立自证：`packages/ai-runtime/src/router/index.ts` `classify()` 纯规则占位（文件头自注骨架）；`packages/domain/src/crag.ts` 检索后证据分支；`packages/domain/src/research-policy.ts` 外发护栏——三者均 ≠ router（register `production-readiness-remediation-register.md:56` 原文）。
2. **FUNNEL covered 不借**: `rag-funnel-01-08-covered-matrix.md:18-19` FUNNEL-07/08 covered（`classifyFreeTextScope` 缝 + eval matrix）不等于语义分类器行已关——Ban 借其绿关 `:73` · coveredCount=8 不变 · Ban invent covered。
3. **漏斗与词表契约**: 规则命中→模型调用=0（PRD-TEST-017 验收①）；未命中→轻量模型 strict enum over `TAXONOMY_V1_LEAVES` 8 叶（`job-route-classifier.ts:19`）；低置信/unknown → fail-to-clarification + **0 检索**（classifier-router-tier §2 RAG 行失败模式）；越权建议=拒绝；分类结果只建议、永不授读权/工具权/检索权；**不得替代 R4 硬过滤**；Ban 兜底全量检索 · Ban 用户选桶；H19：temperature=0 + 固定 prompt 版本 + 决策持久化不重算。
4. **NEG 列必须 + 六列口径**: NEG（unknown/低置信/越权→0 检索 · schema 非法→`validation_rejected` sticky · 规则直达模型调用=0）· FAULT（模型缝失败→澄清不崩不重试）· BOUND（同 scope 并发至多一次 attempt · 单外发）· ADV（注入/多语言/跨叶混淆→仍落 allowlist 或 unresolved）· **PERF 适用**（P95+成本阈值预注册 eval · FUNNEL-08 惯例）· **LOAD 显式 blind**（Ban 借并发断言冒充 LOAD · capacityRepresentative=false）。
5. **两路线交双审裁**: Route S（scripted/fixture seam · Y2 先例 `execution-master-checklist.md:1199-1202` · `env -u` 三键 · `envModelApiKeyUnset=true` · 零 provider 外呼）证 PRD-TEST-017 结构面；Route L（live 真模型 eval）证量化面（misroute/Recall@K/P95/成本冻结）——**live 申报显式化且默认禁 live**：Key 已供给（`~/.meetwise-secrets/MODEL_API_KEY` · 用户已授权 live 供给）但 pre-exec dual PASS ≠ live 授权，Route L 须双审裁 + **EXEC 显式授权**（AD P4 四要件 `execution-master-checklist.md:1145` · 列条件 ≠ 授权）方可带 Key；预算粗估 ~240 calls / 量级 ¥1 内 / 硬帽 ¥20（EXEC 授权时重报价 · `actualSpendCny` 实测入收据）；Key 卫生：仅进程环境 · name-only presence · 禁 echo/落盘/入 receipt/attempt-ledger/commit · 禁 `.env*` · 外呼仅 allowlisted endpoint（收据只记 endpoint 名）。
6. **Prove 契约（CMD+EXIT）**: Primary `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm gap-rag05-classifier:prove` 期望 EXIT 0（named-only · 本 REQUEST 零执行）+ 邻接 `rag07-free-text-route:prove` / `rag03-route:prove` EXIT 0（断言一字不动）；**CMD 名 Ban 碰撞既有 `rag05-qbank-miss:prove`**（UC proof 族编号与 GAP 行同名异义 · `package.json:252`）；红名 → **EXIT1 保留** + `attempt-ledger.txt` 全录（容器/image digest/起止/红名/dirty）+ attempts 全记录 + **Ban retry-to-green**（Ban 改断言凑绿/删断言/跳过失败段/弱化其余断言）；**EXIT1 记诚实 attempt ≠ flake**（Y2 attempts 1,0 先例 · 修复类次轮须显式披露 wiring 界定）；harness 建不成 → 诚实 `blocked` 或 R5 marked-red（≠ deleted）· 不假绿；双 fresh（实现方 + post-prove 双审各恰一次）。
7. **EXIT0 ≠**: EXIT0 仅证结构面 · ≠ GAP-RAG-05 整行 CLOSED · ≠ 语义质量冻结（Route L 未跑时量化面 residual 显式保留）· ≠ router 生产接线宣称 · ≠ covered flip（coveredCount=8）· ≠ `:70`/`:71` close · ≠ HA · ≠ `releaseEvidence=true` · ≠ 替代 R4。
8. **触碰面与 SSOT**: additive-only（新增模块/harness/CMD 注册 additive 行 · 词表/版本常量语义 Ban 改）· Ban 碰 `packages/db/src/**`（R2 状态机/HMAC/sticky 语义）· Ban 碰 migrations（含 `0138`/`0139`）与既有 rag03-*/rag04-*/rag05-qbank-miss/rag06/rag07/batch4 proof 断言 · **Ban 碰 `:70`/`:71` 已清面** · **Ban 碰已占用行/文件（UC-018/052/025/004/011/014/026/002/001/028/016/017）** · backlog/checklist/register/matrix/queue 本 REQUEST 期零触碰 · **SSOT 仅 nail 期 additive**（CC-R9 · 历史 cites 不改写）。
9. **边界**: docs-only · Dual PASS ≠ coding ≠ prove ≠ nail ≠ close · Ban self-approve · alone ≠ dual · Ban AN-CIMG-EA（HOLD）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban G7 wash · Ban force-push · Ban open MOP / A-seed / CIMG / AP ISO-banner · Ban 触 AO COND line files · Ban push（worktree 本地 commit · 禁 push）。

GAP-RAG-05 `:73` stays **OPEN** · 受控评测 harness 待建 named-only · **Ban close** · coveredCount=8 · 默认禁 live。

本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权 coding（Route L 另须 EXEC 显式授权）；implementer 不自批。

---

*Stub · awaiting expert pre-exec dual · Verdict PENDING · STOP*

---

## PRE-EXEC DUAL REVIEW — mw-rag-route（2026-10-07 · append-only · 只签本人 stub）

**Reviewer**: `mw-rag-route`（独立 · alone ≠ dual · 不代签 peer `mw-e2e-ha` · 只认命令 + EXIT + 可复现证据）
**Review locus**: worktree `/Users/miaole/Desktop/golucky/meetwise-rv-rag05-rag-route`（branch `rv/rag05-rag-route` · base = 主线 tip `feat/mysql-schema-skeleton` `23b2ceb5` · REQUEST `ae30bd92` 为其祖先实证）
**Scope**: docs gate only · 本审零 prove · 零 docker · 零 Key 值读取（name-only presence）· 零 product/scripts/packages/apps 触碰 · 零 SSOT 触碰 · 全锚点 read-only 复核

### 1. 检查表（命令可复现）

| # | 检查 | 证据（复现命令 / 文件锚） | 结果 |
|---|------|------|------|
| A1 | REQUEST 祖先 | `git merge-base --is-ancestor ae30bd92 feat/mysql-schema-skeleton` → 真 | OK |
| A2 | REQUEST docs-only | `git show --stat ae30bd92` = 恰 4 md（harness 182 + slice 45 + 双 stub 50/51）+328/−0 under `ai-docs/delivery/` · 零产品码零 SSOT | OK |
| A3 | backlog `:73` 原文一致 | GAP-RAG-05 P1 OPEN：「无生产 RAG 语义/LLM 意图分类器；CRAG/researchBoundary ≠ router…」目标/条件/harness 列与 harness §0 逐句对齐（harness 列原文「受控评测 harness（待建）；不得替代 R4」在位） | OK |
| A4 | register `:56` PRD-TEST-017 | 四件关闭验收原文一致（规则直达模型调用=0 · 低置信/unknown/越权=0 检索 · 同 scope ≤1 attempt · 误路由/P95/成本生产等价评测冻结）· 仅第一格 ☑ · 双前提满足：FUNNEL-07/08 条件（matrix `:18-19` covered）+ R4 条件（`gR45Closed=true` 源 backlog GAP-RAG-04 行 `:72` 语境） | OK |
| A5 | `classify()` 骨架现状 | `packages/ai-runtime/src/router/index.ts` 纯规则占位（ABUSE/OUT_OF_SCOPE regex + 长度启发式）· 文件头自注「骨架…签名不变」· ≠ 语义/LLM 分类器 · 未接线运行时 router | OK |
| A6 | `TAXONOMY_V1_LEAVES` 8 叶对齐 | `packages/domain/src/job-route-classifier.ts:19` 恰 8 叶（backend/nodejs·java·go·python·general · frontend/web · qa/quality_engineering · ai_ml/applied）· `:31` `JOB_ROUTE_TAXONOMY_VERSION='v1'` · `:33` policy frozen · 与 migration `0086_qbank_routed_metadata_taxonomy.sql` 种子逐一相同 | OK |
| A7 | CMD 命名消歧 | `rag05-qbank-miss:prove` 恰在 `package.json:252`（UC proof 族 · 同名异义）· rag03/04/05/06/07 prove 族 `:244-257` 与 slice 引用精确一致 · 无既有 `gap-rag05*` → 主 CMD additive 零碰撞 · 文件头 disambiguation note 已强制（harness §2.1/§3.1） | OK |
| A8 | 邻接 EXIT0 可满足性 | `rag03-route:prove` 历史「须换夹具或标红（R5）」面已在 RAG02 fixture nail `6afd8c8f` 清（换夹具对齐 fail-closed 契约 · EXIT=0 ×3 + 双 fresh 43/43 · backlog 尾 append-only 登记 · `:70` 行本体零改动）→ adjacency `rag03-route:prove`/`rag07-free-text-route:prove` EXIT0 期望非空头 · Ban byte-intact 保护该绿态 | OK |
| A9 | AD P4 / Y2 先例 | `execution-master-checklist.md:1145` 四要件（Key 供给+用户点头+双审+EXEC 显式授权 · **列条件 ≠ 授权**）· `:1199-1202` Y2 NHP-016-FAULT-01 scripted 缝先例（EXIT=0 双 fresh 45/45 · attempts 1,0 · 修复类次轮显式披露 wiring 界定） | OK |
| A10 | Key 供给 name-only + 剥凭证 | `test -f ~/.meetwise-secrets/MODEL_API_KEY` → 在（name-only · 未读值 · 禁读禁 echo）· runner 剥清单 `scripts/run-e2e-isolated.mjs:1965-1972` 含 `DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL` · `MODEL_API_KEY` 由 CMD 层 `env -u` 三键前置剥离（双保险）· `envModelApiKeyUnset=true` 入收据要求在位（§3.1/CC-R6） | OK |
| A11 | 设计锚一致 | `architecture/ai/classifier-router-tier.md` H19（:25 temperature=0+固定 prompt 版本+决策持久化不重算）与 fail-to-clarification（:43「不能把"默认"解释成全量检索」）↔ NEG 列 + Ban 兜底全量检索 + Ban 用户选桶 逐条对齐 | OK |
| A12 | Pins 原值零漂移 | stub/harness/slice 三处 Pins 逐字同主线 master pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 | OK |
| A13 | 六列口径 | NEG 4 条（含规则命中→模型调用=0 · schema 非法→`validation_rejected` sticky）· FAULT（缝失败→澄清不崩不重试）· BOUND（同 scope ≤1 attempt · 只建议不授读权）· ADV（注入/多语言/跨叶→allowlist 或 unresolved）· **PERF 预注册 eval**（P95+成本阈值先于首调冻结 · capacityRepresentative=false）· **LOAD 显式 blind**（Ban 借并发断言冒充） | OK |
| A14 | 红名/诚实失败路径 | EXIT1 保留 + `attempt-ledger.txt` 全录（先例 `ai-docs/delivery/receipts/gap-rag-03-r3-filter-locus/attempt-ledger.txt` 实存）+ attempts 全记录 + Ban retry-to-green · EXIT1=诚实 attempt ≠ flake · 建不成→`blocked` 或 R5 marked-red（≠ deleted）不假绿 | OK |
| A15 | Ban 面 | `:70`/`:71` 已清面（R2 fixture · HNSW `0138`/`0139` · rag03-*/rag04-*/rag05-qbank-miss/rag06/rag07/batch4 断言）零触碰 · 占用行 UC-018/052/025/004/011/014/026/002/001/028/016/017 零触碰 · backlog/checklist/register/matrix/queue 本 REQUEST 期零触碰 · SSOT 仅 nail additive（CC-R9） | OK |
| A16 | Route L 预算算术 | ~8 叶 × ~25 例 ≈ 200 + 20% holdout ≈ ~240 calls · ~36 万 in + ~2.4 万 out · 按申报牌价 ≈ ¥0.12 → 「量级 ¥1 内」为诚实量级表述 · 硬帽 ¥20 超帽 abort · EXEC 授权时重报 · `actualSpendCny` 实测入收据 · 已声明「粗估非报价」 | OK |
| A17 | peer stub 状态 | `mw-e2e-ha` stub 仍 PENDING · 本审未触碰 · dual 待其独立 verdict | OK |

### 2. Route 裁决（mw-rag-route 专家裁：**S+L 两段式 · S 先行 · L 门控后置**）

- **Stage S（本刀 coding 期默认执行）**：scripted/fixture seam（`env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL` · `envModelApiKeyUnset=true` 入收据 · 零 provider 外呼）证 PRD-TEST-017 全部**可证伪结构面**——验收①规则命中→模型调用=0、②低置信/unknown/越权=0 检索、③同 scope ≤1 attempt，加 NEG/FAULT/BOUND/ADV 全列与 PERF 预注册机制。理由：确定、可回归（classifier-router-tier §4）、零成本、零外呼风险，Y2/RAG02 先例完备——**S 面现在即可证伪的部分先证**，不应被 L 面未决问题阻塞。
- **Stage L（量化面 · 门控后置）**：真模型 live eval 是唯一能诚实证验收④（误路由/P95/成本经生产等价评测冻结）的路径，fixture 缝无法伪证语义质量；裁 S-only 将使量化 residual 沦为无主面、`:73` 永无诚实关闭路径——故裁 **S+L** 而非 S-only。**L 面开放问题（EXEC 授权前必须解决）**：预算按当时牌价重报（粗估 ~240 calls/量级 ¥1 内/硬帽 ¥20 · `actualSpendCny` 实测）、eval 基准与 holdout 构成先冻（FUNNEL-08 口径：multi-lang/fullstack/ambiguity/injection · per-leaf Recall@K 下限 · misroute holdout=0）、模型档位选择、非确定性毒性（temperature=0 + 固定 prompt 版本 + 决策持久化 · H19）、Key 卫生义务（进程环境 name-only · 禁 echo/落盘/入 receipt/commit · Ban `.env*` · 外呼仅 allowlisted endpoint 名）。
- **门链不变**：本 dual PASS ≠ live 授权 ≠ coding 授权；Route L 另须 peer 同裁 + **EXEC 显式授权**（AD P4 · 列条件 ≠ 授权）。S+L 两段式下 Primary CMD EXIT0 仍 ≠ `:73` CLOSED（Route L 未跑时量化面 residual 显式保留，harness §3.7 已写死）。

### 3. Fail-trigger audit（红线逐条过）

docs-only 违反（A2 干净）· SSOT 触碰（REQUEST 4 文件外零触碰）· CMD 执行/Key 值读取（零）· Pins 漂移（A12 无）· CMD 名碰撞（A7 无）· 邻接/既有断言面 Ban 违反（无）· 占用行触碰（无）· EXIT1 洗 flake 条款缺失（在位 §3.4）· Route L 默认开（无——liveDefault=OFF 于 stub/harness/slice 三处一致）· CRAG/researchBoundary 洗成 router 证据（无——口径钉在位）· 替代/绕过 R4（无——只建议 allowlisted track 不授读权写死于 CC-R1/§2.2/§3.7）。**零触发。**

### 4. Blockers

无。

### 5. Conditions（C-*）

- **C-1**：本 PASS 仅是 PRE-EXEC docs gate——不授权 coding/prove/live/push；coding 由协调方在 dual PASS 后授权；Route L 另须 EXEC 显式授权（AD P4 四要件 · 列条件 ≠ 授权）。
- **C-2**：alone ≠ dual——dual 以 `mw-e2e-ha` stub 独立 verdict 落地为完成；本审不代签、不读取其结论。
- **C-3**：Route L EXEC 期前置：阈值预注册先于首调且 Ban 事后改阈值凑绿（misroute holdout=0 / per-leaf Recall@K 下限 / P95 预算 / 硬帽 ¥20 超帽 abort 记录）· `actualSpendCny` 实测入收据 · temperature=0+固定 prompt 版本+决策持久化（H19）· Key 仅进程环境 name-only（`keySource=<path>` · value 零入 receipt/ledger/commit/日志）· 单轮不重试（429/403 类按 Key-blocked 观察类记录 · 非静默绿）。
- **C-4**：主 CMD 保持 `gap-rag05-classifier` 前缀 + 文件头 disambiguation note（vs `rag05-qbank-miss:prove` `package.json:252` 同名异义）；邻接 `rag07-free-text-route:prove`/`rag03-route:prove` 断言 byte-intact；Ban 复用/碰撞既有 CMD 名。
- **C-5**：红名 → EXIT1 保留 + attempt-ledger 全录（容器/image digest/起止/红名/dirty）+ attempts 全记录 + Ban retry-to-green（Ban 改断言凑绿/删/跳/弱化）；EXIT1 = 诚实 attempt ≠ flake；修复类次轮显式披露 wiring 界定；双 fresh（实现方 + post-prove 双审各恰一次）。
- **C-6**：EXIT0 ≠ `:73` CLOSED ≠ 语义质量冻结（Route L 未跑）≠ covered flip（coveredCount=8）≠ `:70`/`:71` close ≠ router 生产接线宣称 ≠ HA ≠ `releaseEvidence=true` ≠ 替代 R4；CRAG/`researchBoundary` ≠ router 口径不变。
- **C-7**：SSOT 仅 nail 期 additive（backlog `:73` 收据 cite + residual 显式 · register `:56` 验收进展 cite · queue 进度 · 历史 cites 不改写）；REQUEST/coding 期 backlog/checklist/register/matrix/queue 零触碰；占用行 UC-018/052/025/004/011/014/026/002/001/028/016/017 零触碰。

### 6. 中文三行摘要

1. REQUEST `ae30bd92` 祖先 + docs-only 成立；backlog `:73`、register `:56`、`classify()` 规则骨架、8 叶词表（含 migration 0086 种子逐一比对）、同名异义 CMD `rag05-qbank-miss:prove:252` 消歧、Pins 原值——全部锚点只读复核一致，零漂移。
2. Route 裁 **S+L 两段式**：S（fixture 缝 · 零外呼 · 三键剥凭证）先证全部结构面与 PERF 预注册机制，L（真模型 eval）门控后置证量化面，须 peer 同裁 + EXEC 显式授权 + 预算重报 + 阈值先冻；EXIT0 ≠ 关行。
3. 零 Blocker；Conditions C-1..C-7（docs gate 界定 / alone≠dual / L 前置 / CMD 消歧 / EXIT1 诚实 / EXIT0≠ / SSOT nail 期 additive）随本 PASS 生效。

Verdict: PASS
