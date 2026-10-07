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

---

## POST-PROVE DUAL REVIEW — mw-rag-route（2026-10-07 · append-only · Stage S 复验 · 只签本人段）

**Reviewer**: `mw-rag-route`（独立 · alone ≠ dual · 不代签 peer `mw-e2e-ha` · 只认命令 + EXIT + 可复现证据）
**Review locus**: worktree `/Users/miaole/Desktop/golucky/meetwise-rv-rag05p-rag-route`（branch `rv/rag05p-rag-route` · base = `origin/feat/mysql-schema-skeleton` tip `75ba2783` full `75ba2783d547e154227d52ea4ee98cf6547310e3` · 已含 RAG05 Stage S）
**Mandate**: Line RAG05 POST-PROVE dual（Stage S 复验 · 实现方 coding `db7da1cd` + receipt `ba64306d` · prove 主 attempt-2 EXIT=0 33/33 + mut-1/mut-2 EXIT=1 预期红 + final-1 EXIT=0 + 邻接 rag07/rag03 双 tip EXIT=0）
**Scope**: 本审零 SSOT 触碰 · 零产品码触碰（变异复核为临时注入并 `git diff --exit-code` 恢复 · 全程披露）· 零 Key 值读取 · 官方 CMD fresh re-run 恰一次 · 不代签 · 不裁 Route L 授权

### 1. 包完整性与触碰面（可复现）

| # | 检查 | 证据（复现命令 / 文件锚） | 结果 |
|---|------|------|------|
| B1 | 包内容 tip 落地一致 | `db7da1cd`/`ba64306d` 在 `line/rag05-classifier`；tip 谱系对应 `281128ce`/`0039c1b7`；`git diff db7da1cd 281128ce` 与 `git diff ba64306d 0039c1b7` 的 RAG05 面零差异（仅他线 g7-trio 收据树差）——包面 byte-identical | OK |
| B2 | 恰 4+2 文件 | `281128ce` stat = 恰 4 文件 +466/−1（semantic-route.ts 新 260 行 + proof 新 202 行 + root package.json +2 + ai-runtime package.json +1/−1）；`0039c1b7` stat = 恰 2 文件 +93（receipt 72 行 + attempt-ledger 21 行） | OK |
| B3 | 产品码零外溢 | `git diff 281128ce~1 0039c1b7 -- packages/db migrations scripts` = 空；`packages/ai-runtime/src/router/index.ts`（规则骨架）自 initial commit 零改——本刀纯 additive | OK |
| B4 | SSOT 零触碰 | backlog/checklist/register/matrix/queue 五件 diff（pair 跨度）= 空；`gap-bug-backlog.md:73` GAP-RAG-05 行原文逐字在位 · **stays OPEN** | OK |
| B5 | qbank-miss 消歧（C-4） | `rag05-qbank-miss:prove` 仍在 `package.json:252` 零改；新 CMD 注册 `:258-259` additive 零碰撞；消歧 note 写死于两新文件头（semantic-route.ts:4-7 · proof:4-9） | OK |
| B6 | 邻接 byte-intact | `rag03-*`/`rag07-*` proof 断言文件不在 pair 触碰列表；台账录 adj×4 EXIT=0（36 PASS / 43 PASS · 双 tip `8c6860e3`+`db7da1cd`） | OK |
| B7 | sha256 自证复核 | `shasum -a 256` = `105a6373…`（semantic-route.ts）/ `607d9380…`（proof）与 receipt §4 逐字同 | OK |
| B8 | Pins 原值 | receipt §7/§8 与 stub Pins 逐字同：NOT_HA / releaseEvidence=false / claimProductionHA=false / gR45Closed=true / coveredCount=8 / ms3EqualsR4Closed=false / PG-retained / DELETE=503 / `:70`/`:71`/`:73` OPEN | OK |

### 2. 验收①②③④裁决（receipt §3 实读 + 源码/proof 实读 + fresh 复跑实证）

| 验收 | 裁决 | 依据（33 断言实读：S0=1 + S1=7 + S2=7 + S3=7 + S4=3 + S5=8） |
|------|------|------|
| **① 规则命中 → 模型调用=0** | **PASS** | `semantic-route.ts:183-194` 规则路径不触缝；proof S1 注入**被调即抛缝**（`seam_must_not_be_called_on_rule_hit`）→ decided source=rule modelCalls=0（被调即红 = 未被调实证）；词边界由冻结词典 `signalMatches` ASCII `\b` 保证（`javascript` 不命中 `java` · domain 实读）；对照规则 miss → 模型恰 1 次（`seamCalls===1`） |
| **② NEG 六类全 unresolved + 0 检索 + 只建议不授读权** | **PASS** | S2 六类（低置信/越权非 allowlist 叶/unknown 空建议/conflict/校准不符/过宽）全 `unresolved` + `retrievalDispatched=0` + `toolGrant=false` + `readGrant=false` + `clarificationRequired=true`；decided 结构断言 = 精确键集（allocations/confidenceBps/durationMs/kind/marginBps/modelCalls/scopeKey/semanticDigest/source）**无任何授予键**；类型面 unresolved 变体四字段为字面量常量 |
| **③ 10 并发同 scope 恰 1 次 + 缝 throw 不崩零内重试** | **PASS** | in-flight guard（`:197-207,210,254-256`）：S3 10 并发 `seamCalls===1` + 恰 1 decided + 9 `attempt_in_flight`（各 modelCalls=0）；异 scope 并发互不阻塞；settle 后 slot 释放（显式重试 ≠ 自动重试）；缝 throw → `model_seam_failure` + `faultCalls===1`（零内 retry）；进程内计时器超时 → 同 reason |
| **④ PERF 预注册机制落位** | **PASS（机制）** | `SEMANTIC_ROUTE_PERF_BUDGET` const 于模块加载期冻结（先于任何首调）：stage=L · frozenAt=2026-10-07 · misrouteHoldoutMax=0 · perLeafRecallAt5MinBps=8000 · p95=3000ms · **costHardCapCny=20** · 钉 TAXONOMY/POLICY 版本；决策携带 durationMs（测量机制在位）；误路由/Recall@K/P95/成本**实测显式留 Route L**（receipt §5）——本 proof 不证语义质量，口径诚实 |

### 3. 变异证伪核验（本审独立复现 · 断言零改动 · 注入即披露）

| 变异 | 实现方台账 | 本审独立复现（同 CMD · `env -u` 三键 · 只动 semantic-route.ts · proof 零改动） | 恢复复核 |
|------|------|------|------|
| **mut-1**（scope guard disable） | EXIT=1 · 红 = S3③ ×2（seamCalls=10） | **EXIT=1** · 红恰 = `S3③ 同 scope 10 并发 → 缝恰 1 次调用 — seamCalls=10` + `S3③ 恰 1 decided + 9 attempt_in_flight`，31 PASS——**与台账逐字一致** | `git checkout` + `git diff --exit-code` → clean ✓ |
| **mut-2**（validate bypass） | EXIT=1 · 红 = S2② NEG ×6 | **EXIT=1** · S2② 六类全 `decided(RED)`（核心红面一致）；本审变体形状（`if (true)` 直通）附加级联 S4ADV 红并于第 23 断言处 abort（undefined allocations）——见 O-2 | `git checkout` + `git diff --exit-code` → clean ✓ |

**有效性判定**：两条变异均证实断言面**非空转**——守卫摘除与校验旁路必被 S3③/S2② 捕获，主绿面非恒真。实现方 mut-1/mut-2 作为防空转证据**有效**；EXIT1 如实录账、断言零改动、恢复复核齐全（C-5 兑现）。本审两条变异跑 = 显式披露的复核性注入（预期红 · 非官方 attempt · 非重试），官方 fresh re-run 仅末尾恰一次。

### 4. Route L residual 登记核验（receipt §5 逐字）

| 要素（我方上轮裁定原文） | §5 在位证据 | 结果 |
|------|------|------|
| EXEC 再授权 | 「须 EXEC 再授权」「peer 双审同裁 + EXEC 显式授权（AD P4 · 列条件 ≠ 授权）」 | ✓ |
| 预算重报 | 「按当时牌价预算重报（粗估 ~240 calls/量级 ¥1 内/硬帽 ¥20 超帽 abort）+ `actualSpendCny` 实测（现 `null`）」 | ✓ |
| 阈值先冻 | 「阈值先冻」「预注册阈值已先于首调冻结于 `SEMANTIC_ROUTE_PERF_BUDGET`（… Ban 事后改值凑绿，CC-R8/C-3/C-HA-3）」 | ✓ |
| H19 | 「H19 temperature=0 + prompt 版本钉」 | ✓ |
| 单轮 | 「单轮不重试（429/403 类按 Key-blocked 观察类记录非静默绿）」 | ✓ |

五要素**逐字完整**；`EXIT0 ≠ :73 CLOSED ≠ 语义质量冻结 ≠ covered flip ≠ :70/:71 close ≠ router 生产接线 ≠ HA ≠ 替代 R4` 全列在位（§5/§8）。**登记 COMPLETE。**

### 5. fresh re-run（官方 CMD · 恰好一次 · 禁重试遵守）

- 环境：本审 worktree @ `75ba2783` clean（`git status --porcelain` = 0）· `pnpm install --frozen-lockfile`（setup · 非 prove）· node v22.22.3 / pnpm 10.18.0
- CMD：`env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm gap-rag05-classifier:prove`
- 结果：**EXIT=0 · 33/33 全 PASS**（S0 三键 unset 门 PASS · 末行「全部通过 · GAP-RAG-05 Stage S 结构面（EXIT=0）· 量化面 residual 留 Route L」）· 恰好一次 · 零重试

### 6. C-1~C-7 逐条裁决

| 条件 | 裁决 | 依据 |
|------|------|------|
| C-1（docs gate ≠ coding/live/push 授权 · L 须 EXEC 显式授权） | **SATISFIED** | coding/prove 在 pre-exec dual（`2ee5bd89`+`48fc38cb`）后由协调方 EXEC Stage S 授权（receipt Authorization 行）；Route L 未执行且 §5 门控 EXEC 再授权；本审零 push |
| C-2（alone ≠ dual · 不代签 peer） | **MAINTAINED** | 本段只签 mw-rag-route；mw-e2e-ha post-prove 审并行在途、未读未代签 |
| C-3（L 前置：阈值先冻 Ban 事后改 / actualSpendCny 实测 / H19 / Key name-only / 单轮不重试） | **SATISFIED（登记态）** | §5 五要素逐字在位（§4 核验表）；阈值已代码化冻结（const）；`actualSpendCny=null` 保持未发明；本刀零 Key 值读取 |
| C-4（CMD 消歧 + 邻接 byte-intact） | **SATISFIED** | B5/B6：`:252` 零改、新 CMD additive 零碰撞、双文件头 note、邻接断言零触碰 + 双 tip EXIT=0 台账 |
| C-5（EXIT1 诚实 + 全录 + Ban retry-to-green + 双 fresh） | **SATISFIED** | 主断言面自始绿零修复轮（smoke/attempt-1/attempt-2/final-1 全 0）；两条 EXIT1 = 显式变异预期红如实录账 + `git diff --exit-code` 恢复；实现方 fresh ✓ + 本审 fresh 恰一次 ✓ |
| C-6（EXIT0 ≠ 全列） | **SATISFIED** | B8：Pins 原值零漂移；`:73` OPEN 原文在位；coveredCount=8；无任何 HA/生产接线/语义质量宣称 |
| C-7（SSOT 仅 nail 期 additive · REQUEST/coding 期零触碰 · 占用行零触碰） | **SATISFIED** | B4：五件 SSOT pair 跨度零 diff；本授权刀正确地**未做** nail 期记账（属后置独立刀）；占用行不在触碰列表 |

### 7. Observations（非阻塞 · 如实披露）

- **O-1**：proof S1 注释称「javascript 不得命中 java」，实际断言输入为前端 React/TypeScript → frontend/web；词边界语义由冻结词典 `signalMatches`（ASCII `\b`）实读确证，无诚实性问题，唯注释所辖略宽于断言面。不阻塞。
- **O-2**：实现方 mut-2 台账 red 列录 6 项（S2② NEG ×6）；本审复现显示全 bypass 形变必附加级联 S4ADV 红（越权建议同走校验拒绝路径）。疑台账 red 列仅录预期主面未录级联项——主红面一致、证伪有效性不变，唯 red 列颗粒度可再全。不阻塞。
- **O-3**：`db7da1cd`/`ba64306d` 在 `line/rag05-classifier`，tip 经 `281128ce`/`0039c1b7` 同内容落地（base 重钉已在 receipt §0 披露、delta 零面交集经 B1 实证）。不阻塞。

### 8. Blockers

无。

### 9. Conditions（维持 · 不新增）

C-1..C-7 全数维持效力；Route L 量化面 residual 依 receipt §5 原样后置——**peer 双审同裁 + EXEC 显式授权（AD P4 · 列条件 ≠ 授权）+ 预算重报 + 阈值先冻（已在位 Ban 改）+ H19 temperature=0/prompt 版本钉 + Key name-only + 单轮不重试** 全部满足前，Ban 任何 live 外呼、Ban 语义质量宣称、Ban `:73` 翻行。

### 10. 中文三行摘要

1. 包完整性成立：coding/receipt 在 tip 谱系 byte-identical 落地（恰 4+2 文件），packages/db/migrations/scripts 零外溢，SSOT/backlog `:73`/qbank-miss `:252`/邻接断言全零触碰，sha256 与 Pins 逐字复核一致。
2. 验收①②③④全 PASS（seam 即抛证零调用、NEG 六类 + decided 无授予键、10 并发恰 1 次 + 零内重试、PERF 预算 ¥20 硬帽先冻）；mut-1/mut-2 本审独立复现预期红且 `git diff --exit-code` 恢复——防空转证据有效；fresh re-run 恰一次 EXIT=0 33/33。
3. Route L residual §5 五要素（EXEC 再授权/预算重报/阈值先冻/H19/单轮）逐字完整登记；C-1..C-7 全数 SATISFIED；零 Blocker；alone ≠ dual，不代签 mw-e2e-ha。

Verdict: PASS
