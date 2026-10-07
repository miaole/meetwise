# Harness — **GAP-RAG-05 semantic classifier 刀**（生产 RAG 语义/LLM 意图分类器 · 受控评测 harness 待建 · `:73` OPEN · REQUEST · **docs-only PENDING**）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 双 stub PENDING · Ban self-approve · alone ≠ dual · **Ban coding · Ban prove · Ban push · 默认禁 live**）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF eval-applicable / LOAD **blind** · capacityRepresentative=**false** · canHonestlyFlip=**false** · liveDefault=**OFF**
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`50423a6f`** / full `50423a6fa6f18d4c9d193611cf84c4702e067208`（SCOR/P0-CB inventory nail）
**Queue**: Phase 4 RAG（`REMAINING-NORTH-STAR-QUEUE.md:34-35`「GAP-RAG-02 fixture · **GAP-RAG-05 semantic classifier late**」· RAG02 fixture 刀已 nail 于 `line/rag02-nail` `6afd8c8f` · 本刀 = Phase 4 剩余行）
**Knife**: **GAP-RAG-05 semantic classifier 刀** —— 生产 RAG 语义/LLM 意图分类器缺口（backlog `:73` 原文「无生产 RAG 语义/LLM 意图分类器；CRAG/researchBoundary ≠ router（PRD-TEST-017 / RAG-FUNNEL-07/08）」）。目标（原文）：「规则→轻量枚举→人工澄清漏斗；分类只建议 allowlisted track，不授读权」。**R4 硬过滤关闭条件已满足**（`gR45Closed=true` · G-R4-5 aggregate product face closed under authorize）→ queue 标「late」条件解除，本刀开 REQUEST。**受控评测 harness（待建）；不得替代 R4**（backlog harness 列原文）。
**Gap id**: **`GAP-RAG-05`**（backlog `gap-bug-backlog.md:73` · P1 · **OPEN** · 本刀不翻行）
**Experts**: `mw-rag-route` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: docs REQUEST only · Ban coding · Ban prove · 默认禁 live · pre-exec dual PASS 后由协调方授权 coding（若双审裁 Route L，**仍须 EXEC 显式授权 live** 方可带 Key 执行——AD P4 四要件：Key 供给 + 用户点头 + 双审 + EXEC 显式授权 · 列条件 ≠ 授权）

## 0. Why this knife（gap 现状 · 条件成立 · cite Ban re-prove）

| 锚 | 事实（read-only 定位 · 本 REQUEST 零修改） |
|----|------|
| backlog 原文 | `gap-bug-backlog.md:73` GAP-RAG-05 · P1 · OPEN：「无生产 RAG 语义/LLM 意图分类器；CRAG/researchBoundary ≠ router（PRD-TEST-017 / RAG-FUNNEL-07/08）」→ 目标「规则→轻量枚举→人工澄清漏斗；分类只建议 allowlisted track，不授读权」→ 条件「在 R4 硬过滤关闭后条件实施」→ harness「受控评测 harness（待建）；不得替代 R4」 |
| register 验收原文 | `production-readiness-remediation-register.md:56` PRD-TEST-017（P1 · 仅第一格 ☑）：「CRAG 是检索后证据分支，`researchBoundary` 是外发护栏，未接线 `classify()` 骨架不是运行时 router」；关闭验收 = **规则直达模型调用=0** · **低置信/unknown/越权=0 检索** · **同 scope 并发至多一次 attempt** · **误路由、P95 和成本阈值经生产等价评测冻结** |
| `classify()` 骨架现状 | `packages/ai-runtime/src/router/index.ts`：`classify()` = 纯规则占位（辱骂/越界 regex + 长度启发式 tier），文件头自注「骨架：先用确定性规则占位（真实接便宜分类模型只换实现，签名不变）」→ **不是语义/LLM 分类器，未接线为运行时 router** |
| CRAG ≠ router | `packages/domain/src/crag.ts`：检索**后**证据分支（use_local/augment_web/fallback_web），无题域意图分类职责 |
| researchBoundary ≠ router | `packages/domain/src/research-policy.ts` + `apps/worker/src/interview-research-skills.ts:88`（`classifyInterviewResearchBoundary`）：web 探索**外发护栏**，非题域路由 |
| 既有 rule 面（冻结词典） | `packages/domain/src/job-route-classifier.ts`：`TAXONOMY_V1_LEAVES` 8 叶（backend/nodejs·java·go·python·general · frontend/web · qa/quality_engineering · ai_ml/applied）· `JOB_ROUTE_TAXONOMY_VERSION='v1'` · `JOB_ROUTE_POLICY_VERSION='calibration-2026-08-frozen:v1'` · `classifyJobByRule` 冻结信号词典 |
| 既有状态机（R2 face · CLOSED 结构面） | `packages/db/src/job-route-decision.ts` `classifyJobRoute`：route_pending→rule_decided/model_prepared→result_validated→route_decided/route_unresolved · 每 (job,revision) 至多 1 次模型外发 · sticky 终态不自动重试 · 输入 HMAC（digest 不存原文）；sole consumer `apps/worker/src/route-classify-consumer.ts` 经 MODEL-OP `job.route-classify.v1` binding（`createJobRouteModelClassify`）——**R2 structural CLOSED ≠ 语义质量已证**（P-LIVE ≠ 路由已生效，backlog `:70` 既有口径） |
| FUNNEL-07/08 covered ≠ 本刀已关 | `rag-funnel-01-08-covered-matrix.md:18-19`：07 covered（`classifyFreeTextScope` + 仅建议 allowlisted track + 无特权扩张）· 08 covered（生产等价 eval matrix）——**covered 的是 funnel 缝的 contract/eval 面**，backlog `:73` 语义分类器行仍 OPEN；FUNNEL-08 eval 先例（multi-lang/fullstack/ambiguity/injection holdout · per-leaf Recall@K · wrong-track=0 · P95/成本阈值预注册 · release receipts bound）= 本刀受控评测 harness 的直接惯例来源 |
| 设计原语 | `ai-docs/architecture/ai/classifier-router-tier.md`：工具选择顺序「规则→小分类器→便宜 LLM few-shot→强 LLM」；RAG 题域路由失败模式 = **fail-to-clarification**（低置信/unknown 标 unresolved、要求补充输入；不得兜底全量检索或让用户选桶）；审计 H19：LLM 路由 temperature=0 + 固定 prompt 版本 + 决策持久化不重算 |
| 条件成立 | `gR45Closed=true`（G-R4-5 aggregate product face closed under authorize · backlog `:72`）→「在 R4 硬过滤关闭后条件实施」条件满足；**不得替代 R4**（硬过滤仍是权威，分类器只建议） |

## 1. Residual statement（frozen · disclosed）

| Residual | Status | Note |
|----------|--------|------|
| GAP-RAG-05（backlog `:73`） | **OPEN** | 本刀不翻行 · 受控评测 harness 属「待建」→ 未来 coding 刀按 §2/§3 授权后建 |
| `classify()` 骨架未接线 | **OPEN 面之一** | `packages/ai-runtime/src/router/index.ts` 规则占位 ≠ 语义分类器 · **Ban 宣称 router 已接线** |
| CRAG/researchBoundary | **≠ router（口径钉）** | 二者职责不变 · **Ban 把 CRAG/护栏洗成 router 证据** |
| GAP-RAG-02（backlog `:70`） | **OPEN**（fixture 面 NAIL `line/rag02-nail` `6afd8c8f` · 剩余面 OPEN） | **零触碰** · R2 structural CLOSED ≠ HA/suite/verbal/controlPlane/R4/FUNNEL · P-LIVE ≠ 路由已生效 |
| GAP-RAG-03（backlog `:71`） | **OPEN**（AQ 钉） | **零触碰** · Ban 借刀 |
| coveredCount | **8** | 本刀 Ban covered flip · **Ban invent coveredCount** |

## 2. Scope（future coding knife 触碰面 · 本 REQUEST 零执行）

### 2.1 Touch（允许面 · additive-only 原则）

| 面 | 允许 |
|----|------|
| 语义分类器/评测源码 | **新增** additive 模块（建议落点由双审裁：`packages/ai-runtime/src/router/**` 真实分类器实现（签名不变换实现）或 `packages/domain/src/**` 新增语义路由模块；复用 `TAXONOMY_V1_LEAVES`/`JOB_ROUTE_POLICY_VERSION` 词表，**Ban 改词表/版本常量语义**） |
| 受控评测 harness | **新增** proof/eval 文件（fixtures：多语言 holdout · per-leaf 用例 · wrong-track 对抗集 · unknown/低置信集 · 越权建议集；Y2/RAG02 夹具惯例：fixture 注入 seam） |
| CMD 注册 | root `package.json` **additive** 注册 named CMD（见 §3）：主 CMD 名须带 `gap-rag05-classifier` 前缀 **Ban 复用/碰撞既有 `rag05-qbank-miss:prove`**（UC proof 族编号与 backlog GAP-RAG-05 同名异义 · 须在文件头 disambiguation note 显式声明） |
| runner 剥凭证清单 | 仅当 live 路线被双审裁 + EXEC 授权后才允许 additive（非本 REQUEST 期） |

### 2.2 Ban touch

| 面 | 禁止 |
|----|------|
| `packages/db/src/**`（含 `recruiter.ts` · `job-route-decision.ts` · `free-text-route-decision.ts`） | R2 structural CLOSED 证据面 + FUNNEL-07 covered 面 · **Ban 改状态机/HMAC/sticky 语义** |
| `packages/db/migrations/**` | Ban 借刀碰 schema（含 `0138`/`0139` HNSW `:71` 面） |
| `packages/db/test/rag03-*.proof.ts` · `rag04-*` · `rag05-qbank-miss*` · `rag06-*` · `rag07-free-text-route*` · `apps/worker/test/r4-funnel-covered-count-batch4.proof.ts` | 既有断言 **byte-intact** · Ban 触 |
| `apps/worker/src/free-text-route-funnel.ts` · `route-classify-consumer.ts` · `interview-research-skills.ts` · `packages/domain/src/crag.ts` · `research-policy.ts` · `job-route-classifier.ts` 词表 | Ban 改语义（CRAG/护栏 ≠ router 口径钉 · 词表 frozen） |
| R4 硬过滤面 | 分类器**只建议 allowlisted track** · Ban 替代/绕过/弱化 R4 · Ban 授读权/工具权 |
| 已占用行/文件 | **Ban 碰 UC-018/052/025/004/011/014/026/002/001/028/016/017** 任一行的 harness/proof/matrix 文件（他线占用 · 一刀一行） |
| backlog `:70`/`:71`/`:73`/checklist/matrix/queue | 本 REQUEST 期零触碰 · **SSOT 仅 nail 期 additive**（§5） |

## 3. Prove 方案（future coding knife · 本 REQUEST 零执行 · 两路线利弊交双审裁）

### 3.1 CMD+EXIT 契约（named-only · Ban execute now）

| CMD（named） | 期望 EXIT | 说明 |
|--------------|-----------|------|
| `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm gap-rag05-classifier:prove` | **0**（主证） | Route S 主路径 · isolated 真隔离 PG + 全迁移链 · image `pgvector/pgvector:pg16` 口径不变 · fixture seam 注入模型输出（零 provider 外呼 · `envModelApiKeyUnset=true` 入收据）· 断言覆盖 §3.3 全列 |
| `pnpm gap-rag05-classifier-live:eval` | 预注册阈值全过 = 0 | **仅 Route L 被双审裁 + EXEC 显式授权后**方可执行；预注册阈值（misroute holdout=0 · per-leaf Recall@K 下限 · P95 预算 · 成本硬帽）+ release receipts bound（FUNNEL-08 eval 惯例）· 单轮不重试 |
| `pnpm rag07-free-text-route:prove` | 0 | 邻接复核 · FUNNEL-07 covered 面未被波及 · 断言一字不动 |
| `pnpm rag03-route:prove` | 0 | 邻接复核 · R2 classify 状态机面未被波及 · 断言一字不动 |

命名纪律：主 CMD 带 `gap-rag05-classifier` 前缀；**`rag05-qbank-miss:prove`（`package.json:252`）是 UC proof 族编号，与本 GAP 行同名异义**——Ban 触碰、Ban 复用其名、Ban 洗其 EXIT。

### 3.2 两路线（Route S / Route L · 利弊交双审裁 · 默认 S）

| | **Route S — scripted/fixture seam（默认）** | **Route L — live 真模型 eval（申报 · 默认禁）** |
|--|--|--|
| 先例 | Y2 NHP-016-FAULT-01 scripted 缝（`env -u` 三键 · `envModelApiKeyUnset=true` · 零 provider 外呼 · attempts 1,0 全录）· R2 P-MODEL/P-FAKE fake seam | G7 Key/live ×3 · AD P4 解锁链（Key 供给+用户点头+双审+EXEC 显式授权=另刀·列条件≠授权） |
| 可证面 | 契约/状态机/fail-to-clarification/allowlist-only/无特权扩张/unknown=0 检索/规则直达模型调用=0/同 scope ≤1 attempt（PRD-TEST-017 验收的**结构性**面） | 真模型**语义质量**面：misroute/Recall@K/P95/**成本**经生产等价评测冻结（PRD-TEST-017 验收的**量化**面） |
| 不可证面 | 语义质量量化验收（真模型 misroute/P95/cost）→ EXIT0 **≠ GAP-RAG-05 closed** | —（网络抖动/限流属诚实失败路径 §3.4） |
| 利 | 确定·可回归（classifier-router-tier §4）·零成本·零外呼风险·CI 可重复 | 唯一能诚实冻结量化阈值的路径 |
| 弊 | 「语义/LLM」面无真证据 | 成本+Key 卫生义务+外发面+非确定（须 temperature=0+固定 prompt 版本 · H19）·须另刀 |
| 裁决 | 双审可裁 S 为本刀全部（structural 面）并显式声明量化面 residual | 双审可裁 S+L 两段式：S 先 structural、L 经 EXEC 显式授权后另轮 live eval |

**live 申报显式化**：本刀申报存在 Route L 需求（真模型调用），Key 已供给（`~/.meetwise-secrets/MODEL_API_KEY` · 用户已授权 live 供给）；**默认禁 live**——pre-exec dual PASS ≠ live 授权；EXEC 显式授权前任何 prove **不得带 Key**（CMD 层 `env -u` 三键为准）。

### 3.3 断言列（NEG 必列 · 六列口径）

| 列 | 本刀 |
|----|------|
| **NEG** | unknown/低置信 → 澄清漏斗（unresolved/要求补充输入）+ **0 检索**；越权建议（非 `TAXONOMY_V1_LEAVES` 叶）= 拒绝 + 0 检索；schema 非法模型输出 → `validation_rejected` sticky；**规则命中 → 模型调用=0**（规则直达模型调用=0 验收） |
| FAULT | 模型缝失败（throw/timeout/非法 JSON）→ fail-to-clarification · 不派发检索 · 不崩 · sticky 不自动重试 |
| BOUND | 同 scope 并发至多一次 attempt（(job,revision)/scope 单外发）· allocation bps 有界 · 只建议不授读权 |
| ADV | 注入/多语言/跨叶混淆/全栈诱导 → 建议仍落 allowlist 或 unresolved · 永不扩张特权（FUNNEL-08 holdout 口径） |
| **PERF** | **适用**：classify P95 + 单例成本阈值预注册入 eval（FUNNEL-08 惯例）· 本地非容量代表（capacityRepresentative=false） |
| **LOAD** | **显式 blind**（本刀无负载扫 · Ban 借并发断言冒充 LOAD） |

### 3.4 诚实失败路径（EXIT 契约）

- 任何红名 → **EXIT1 保留** · 容器/image digest/起止时间/红名/dirty 全录 `attempt-ledger.txt`（沿用 `receipts/gap-rag-03-r3-filter-locus/attempt-ledger.txt` 格式）· **attempts 全记录** · **Ban retry-to-green**（Ban 改断言凑绿 · Ban 删/跳过失败段 · Ban 弱化其余断言）；**EXIT1 记为诚实 attempt ≠ flake**（Y2 先例：#1 EXIT1 wiring 缺陷 → 修复后 #2 EXIT0 · 断言集零改动 · 非 retry-to-green——修复类次轮须显式披露 wiring 界定，Ban 把失败洗成 flake）。
- harness 建不成（双审否决设计或无法诚实绿）→ 诚实降级：标 `blocked`（`north-star-hard-gates.md` blocked ≠ 失败 ≠ conn-only）或走 R5 marked-red 家族惯例（marked-red ≠ deleted）· 不假绿。
- Route L 若被裁+授权：限流/配额错（429/403 类）→ 按 Key-blocked 观察类记录（沿 G7 三分类口径），**非静默绿**；`actualSpendCny` 实测入收据；超成本硬帽立即 abort 记录。
- 双 fresh：实现方 + post-prove 双审各独立复跑恰一次（沿 Y2/RAG02 惯例）。

### 3.5 Route L 预算预估（申报用粗估 · EXEC 授权时重报价）

| 项 | 估算 | 备注 |
|----|------|------|
| 用例规模 | ~8 叶 × ~25 例 = **~200 calls** + ~20% holdout 复跑 ≈ **~240 calls** | FUNNEL-08 holdout 口径（multi-lang/fullstack/ambiguity/injection） |
| token | ~1.5k in + ~0.1k out / call → 共 ~36 万 in + ~2.4 万 out | 便宜档模型（qwen-turbo/flash 类）few-shot 枚举 |
| 费用 | 量级 **¥1 以内**（典型公开牌价 ~¥0.0003/1k in · ~¥0.0006/1k out）· 申报硬帽 **¥20** 超帽 abort | **粗估非报价**：EXEC 授权时按当时牌价重报；实测 `actualSpendCny` 入收据 |
| 时钟 | 串行 ~240×1s ≈ 4–8 min（并发≤4 时更短） | P95 预算另按 eval 预注册 |

### 3.6 Key 卫生（Route L 才触发 · 本 REQUEST 期零 Key 接触）

- Key 仅进程环境：exec shell 一次性 source 注入（`~/.meetwise-secrets/MODEL_API_KEY` · 沿 `/home/box/.meetwise-secrets/load-model-api-key.sh` name-only 先例）· **Ban echo/print/落盘** · presence 记 name-only（`keySource=<path>` · value 永不入收据/ledger/commit）。
- **Ban secrets / `.env*`** · **Ban Key 入 receipt/attempt-ledger/commit/日志** · 非本刀 CMD 一律 `env -u` 三键剥凭证（runner 剥清单 `scripts/run-e2e-isolated.mjs:1965-1972` 口径）。
- 外呼仅 allowlisted endpoint · 收据只记 endpoint 名不记带 token URL · `dataHandling=no key material persisted` 口径。

### 3.7 EXIT0 ≠

主 CMD EXIT0 仅证 §3.3 结构面（契约/漏斗/边界/NEG/FAULT/BOUND/ADV + PERF 预注册机制）成立；**≠ GAP-RAG-05 整行 CLOSED**（除非双审裁 S-only 且 post-prove dual PASS + nail 期 additive 记账）· **≠ 语义质量已冻结**（Route L 未跑时量化面 residual 显式保留）· **≠ router 已生产接线宣称**（接线为另一把 coding 面 · 本刀 harness 面）· **≠ covered flip（coveredCount=8）** · **≠ `:70`/`:71` close** · **≠ HA** · **≠ releaseEvidence=true** · **≠ 替代 R4**。

## 4. Closing criteria checklist（future coding+prove knife · Ban claim now）

| # | Closing criterion | Required evidence class | Ban |
|---|-------------------|-------------------------|-----|
| **CC-R1** | 分类只建议 `TAXONOMY_V1_LEAVES` allowlisted track · 无读取/工具/检索特权授予 | proof source + EXIT0 receipt | Ban 授读权 · Ban 替代/绕过 R4 硬过滤 |
| **CC-R2** | 漏斗序：规则命中→模型调用=0；未命中→轻量枚举（strict enum over 8 叶）；低置信/unknown→澄清·0 检索 | proof 断言 | Ban 兜底全量检索 · Ban 用户选桶 |
| **CC-R3** | 同 scope 并发至多一次 attempt · sticky 终态不自动重试 | proof 断言 | Ban 静默重发 |
| **CC-R4** | Primary CMD EXIT 0 + 邻接 `rag07-free-text-route:prove`/`rag03-route:prove` EXIT 0 · 断言 byte-intact | receipt + CMD | Ban 触既有断言 · Ban CMD 名碰撞 `rag05-qbank-miss` |
| **CC-R5** | 红名 EXIT1 保留 + attempts 全录 + **Ban retry-to-green**；EXIT1 ≠ flake 洗白 | `attempt-ledger.txt` | Ban 只报绿不录红 |
| **CC-R6** | **默认零 live**：`env -u` 三键 + fixture seam + `envModelApiKeyUnset=true` 入收据；Route L 仅在双审裁 + EXEC 显式授权后、按 §3.5/§3.6 预算与卫生执行 | receipt env/命令记录 | Ban 未经 EXEC 授权带 Key · Ban Key 入 receipt/commit |
| **CC-R7** | PG-retained：真隔离 PG + 全迁移链 · `pgvector/pgvector:pg16` 口径不变 | receipt image/env | Ban MySQL FULLTEXT · Ban Qdrant vector truth |
| **CC-R8** | Route L 预注册阈值（misroute/Recall@K/P95/成本帽）+ release receipts bound · `actualSpendCny` 实测 | eval receipt | Ban 事后改阈值凑绿 |
| **CC-R9** | Pins unchanged unless separately authorized · **SSOT 仅 nail 期 additive**（backlog `:73` cite + residual 显式） | SSOT additive diff | Ban 翻行 · Ban invent coveredCount · Ban 改写历史 cites |

**Non-closing facts（explicit）**：EXIT0 ≠ gap close ≠ covered ≠ HA ≠ 语义质量冻结（Route L 未跑）≠ router 生产接线宣称；CRAG/researchBoundary ≠ router 口径不变；alone ≠ dual · PASS ≠ 关 gap ≠ HA。

## 5. SSOT touch policy（本 knife）

| File | Allowed touch | Ban |
|------|---------------|-----|
| `gap-bug-backlog.md:73` | **仅 nail 期 additive**：收据 cite + residual 显式（量化面 residual 若 Route L 未跑） | 本 REQUEST 期不改 · Ban CLOSED · Ban 翻行 |
| `gap-bug-backlog.md:70`/`:71` | **不触** | Ban 借刀 · Ban wash |
| `production-readiness-remediation-register.md:56`（PRD-TEST-017） | 仅 nail 期 additive（验收进展 cite） | Ban 翻 ☑ 列（仅 EXEC+nail 权） |
| `e2e-requirement-coverage-matrix.md` | 不触（coveredCount=**8** 不变） | Ban covered flip · Ban invent covered |
| `REMAINING-NORTH-STAR-QUEUE.md:34-35` | 仅 nail 期 additive（Phase 4 进度） | Ban wash |
| 已占用行（UC-018/052/025/004/011/014/026/002/001/028/016/017） | **Do not touch** | Ban |

## 6. Verification contract（this REQUEST · zero prove）

1. Docs-only：本 REQUEST 4 文件（harness + slice + 双 stub）additive under `ai-docs/delivery/` · 无 product/scripts/packages/apps touch。
2. Dual PRE stubs `draft:awaiting_pre_exec_dual` · Verdict PENDING · Ban self-approve · alone ≠ dual。
3. No `pnpm` prove · no docker · no Key 读取 · no live（零执行 · 默认禁 live）。
4. pre-exec dual PASS 后由协调方授权 coding；若双审裁 Route L，**live 仍须 EXEC 显式授权**（AD P4）；coding+prove 后须收据 + POST dual + coordinator AUTHORIZE（nail 期才碰 SSOT · CC-R9）。

## 7. Ban list

- Ban coding · Ban prove · Ban push · Ban product/scripts/packages/apps（本 REQUEST 期）
- **默认禁 live**：Ban 未经 EXEC 显式授权带 Key/probe 真模型 · Ban Key 值 echo/print/落盘/入 receipt/commit · Ban secrets / `.env*` · Ban 装 Key 蒙混 / 假 Key 占位
- Ban retry-to-green · Ban 改断言凑绿 / 删断言 / 跳过失败段 / 弱化其余断言 · **Ban 把 EXIT1 洗成 flake**
- Ban 碰 `:70`/`:71` 已清面（R2 fixture 面 · HNSW `0138`/`0139` · rag03-*/rag04-* 断言）· Ban close `:70`/`:71`
- Ban 碰既有 UC proof 族（**`rag05-qbank-miss`** 同名异义 · rag06/rag07 · batch4 proof）· Ban CMD 名碰撞
- Ban 替代/绕过/弱化 R4 硬过滤 · Ban 授读权/工具权 · Ban 兜底全量检索 · Ban 用户选桶
- Ban 把 CRAG/`researchBoundary` 洗成 router 证据 · Ban 宣称 `classify()` 骨架=语义分类器
- Ban covered flip · Ban invent covered · Ban claim HA / claimProductionHA · Ban 翻行（EXIT0 ≠ covered ≠ 翻行）
- Ban 碰已占用行/文件（**UC-018/052/025/004/011/014/026/002/001/028/016/017**）
- Ban MySQL FULLTEXT · Ban Qdrant vector truth · Ban buy cloud · Ban Meridian · Ban force-push · Ban G7 wash · Ban AN-CIMG-EA（HOLD）
- Ban self-approve（alone ≠ dual）· Ban self-nail · Ban open MOP / A-seed / CIMG / AP ISO-banner · Ban 触 AO COND line files
- **SSOT 仅 nail 期 additive**（backlog `:73`/checklist/register/queue 本 REQUEST 期零触碰）

## 8. Non-claims

Not a pass · not run · not built · not closed · not covered · not HA · not SLO/LOAD · not capacity · not `releaseEvidence=true` · not live · not Key-read · not nail · GAP-RAG-05 `:73` **OPEN**（本刀不翻行）· 语义质量量化面 residual（Route L 未跑时显式保留）· CRAG/researchBoundary ≠ router · `classify()` 骨架 ≠ 语义分类器 · GAP-RAG-02 `:70` OPEN · GAP-RAG-03 `:71` OPEN · alone ≠ dual · harness 绿 ≠ 路由已生效 ≠ verbal 生效 ≠ R4 被替代

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF eval-applicable · LOAD blind · capacityRepresentative=false · canHonestlyFlip=false · liveDefault=OFF · backlog `:73` GAP-RAG-05 **OPEN** · backlog `:70`/`:71` OPEN · STOP

*Harness · GAP-RAG-05 semantic classifier · 2026-10-07 · draft:awaiting_pre_exec_dual · `:73` OPEN · docs-only REQUEST · Ban coding · Ban prove · 默认禁 live · Ban retry-to-green · Ban touch `:70`/`:71`/占用行 · STOP*
