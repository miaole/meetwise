# Prove receipt — **GAP-RAG-05 semantic classifier · EXEC Stage S**（rule→strict-enum→clarify 漏斗 · scripted/fixture 缝 · 零外呼 · EXIT=0）

**Status**: `executed:awaiting_post_prove_dual`（实现方 mw-core 自录 · **Ban self-approve** · post-prove 双审由协调方另派 · alone ≠ dual）
**Line**: Phase 4 RAG / GAP-RAG-05 semantic classifier（backlog `gap-bug-backlog.md:73` · **OPEN retained**）
**Authorization**: 协调方 EXEC Stage S 授权（coding+prove · fixture 缝零外呼）after pre-exec dual BOTH PASS（mw-rag-route `2ee5bd89` + mw-e2e-ha `48fc38cb` · 双审 Route 裁决一致 = S+L 两段式 · S 先行）。**Route L 不在本次授权内**——量化面 residual 见 §5。
**Exec worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-rag05` · `line/rag05-classifier`
**Base 重钉披露（C-RAG-1 惯例）**: 授权时 origin tip = `8c6860e3`（REQUEST 镜像 `ae30bd92` + 双审所在链）；exec 期间 origin 前进至 **`ee7563a2`**（SS2 SOLE_STACK align EXEC `ee7563a2` + AUDIT 线 docs）→ coding commit **rebase 到 `ee7563a2` 顶**。delta `8c6860e3..ee7563a2` = 7 个 ai-docs（他线 docs）+ `scripts/run-e2e-isolated.mjs` ±2 行（SS2 :5-6 头注对齐）——与本刀触碰面（`packages/ai-runtime/**` 新增 2 文件 + root/ai-runtime package.json additive 行）**零交集**；邻接两 CMD 已在终 tip 复跑（§3 adj-*-re）。
**Coding commit**: `db7da1cd` / full `db7da1cd224a93984a4a7b5f6c74523cbd70b8aa`（`feat(ai-runtime): GAP-RAG-05 semantic route Stage S (rule→strict-enum→clarify · fixture seam · zero egress)` · author mw-core · 恰 4 文件 +466/−1：`packages/ai-runtime/src/router/semantic-route.ts` 新增 260 行 + `packages/ai-runtime/test/gap-rag05-classifier.proof.ts` 新增 202 行 + root `package.json` +2 行 + `packages/ai-runtime/package.json` +1 行）· **禁 push**
**Date**: 2026-10-07 · node v22.22.3 · pnpm 10.18.0

## 1. CMD + EXIT（attempts 全记录 · 摘自 `attempt-ledger.txt`）

| label | CMD（恒 `env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL` 前缀） | code_sha | dirty | EXIT | red |
|-------|--------------------------|----------|-------|------|-----|
| smoke（披露项 · CMD 注册前 tsx 直跑 wiring 核验 · 非官方 attempt） | `pnpm -C packages/ai-runtime exec tsx test/gap-rag05-classifier.proof.ts` | pre-commit | 4 文件 dirty | **0** | [] |
| attempt-1 | `pnpm gap-rag05-classifier:prove` | `8c6860e3` | 4 文件 dirty | **0** | [] |
| **attempt-2（PRIMARY）** | `pnpm gap-rag05-classifier:prove` | **`db7da1cd`** | **[]** | **0** | [] |
| mut-1-1（变异证伪：scope guard disable） | 同上 | `db7da1cd` | M semantic-route.ts | **1**（预期红） | S3③ ×2（`seamCalls=10`） |
| mut-2-1（变异证伪：validate bypass） | 同上 | `db7da1cd` | M semantic-route.ts | **1**（预期红） | S2② NEG ×6 |
| final-1（恢复后复跑） | 同上 | `db7da1cd` | [] | **0** | [] |
| adj-rag07 / adj-rag07-re | `pnpm rag07-free-text-route:prove` | `8c6860e3` / `db7da1cd` | — | **0 / 0** | []（36 PASS） |
| adj-rag03 / adj-rag03-re | `pnpm rag03-route:prove` | `8c6860e3` / `db7da1cd` | — | **0 / 0** | []（43 PASS） |

- **主断言面自始绿**（smoke/attempt-1/attempt-2/final-1 全 EXIT=0 · 33/33）：**无任何红→绿修复轮 · 零 retry-to-green**。两条 EXIT1 均为显式变异注入的证伪跑（沿 AQ `receipts/gap-rag-03-r3-filter-locus/attempt-ledger.txt` mut-* 先例）：断言集零改动、源码经 `git diff --exit-code` 恢复复核、红名如实全录——**EXIT1 = 诚实 attempt ≠ flake**（C-5）。
- 双 fresh 之实现方侧 = 本表（post-prove 双审 fresh 复跑由协调方另派）。

## 2. 零外呼三重证（C-HA-2 · binding #3）

1. **`envModelApiKeyUnset=true`**：全部跑 CMD 层 `env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL`；proof **S0 断言门**（`PASS S0 env 三键未设`）——若任一键在环境即红，fail-closed。
2. **`providerOutboundCalls=0`**（结构性）：模块 import 面 = `node:crypto` + `node:perf_hooks` + `@meetwise/domain`，**零网络客户端构造**；模型缝 = 注入的进程内 fixture 函数（`SemanticRouteModelClassify`）；无 fetch/http/import 网络 SDK。
3. **Key 卫生**：本刀全程零 Key 值读取（`~/.meetwise-secrets/MODEL_API_KEY` name-only）；**runner 未使用**（逐点披露见 §6）；零 `.env*`；Key 值零入 receipt/ledger/commit/日志；`actualSpendCny=null`（实测前 stays null · C-HA-1 · Ban invent spend）。

## 3. 验收①②③④逐项（register PRD-TEST-017 · Stage S 结构面）

| 验收 | 结果 | 证据（断言名 · 33/33 全 PASS） |
|------|------|------|
| **① 规则命中 → 模型调用=0** | **PASS** | `S1① 规则唯一命中 → decided source=rule` · `S1① modelCalls=0（seam 若被调即抛 → 未被调）`（seam 注入即抛版，被调即红）· `S1① 词边界：前端命中 frontend/web（不串 java 桶）` · 对照 `S1① 规则 miss → 走模型 strict-enum · 恰 1 次调用` |
| **② 低置信/unknown/越权 = 0 检索** | **PASS** | `S2② NEG` 六类：低置信（`low_confidence`）/ 越权非 allowlist 叶（`over_privileged_suggestion` ← `taxonomy_invalid`）/ unknown 空建议、conflict、校准不符、过宽（`invalid_model_output`）→ 全部 unresolved + `retrievalDispatched=0` + `toolGrant=false` + `readGrant=false` + `clarificationRequired=true`；`S2② decided 结构=纯建议（无 retrieval/read/tool 授予键）` |
| **③ 同 scope ≤1 attempt + NEG/FAULT/BOUND/ADV** | **PASS** | BOUND：`S3③ 同 scope 10 并发 → 缝恰 1 次调用（seamCalls=1）` + `恰 1 decided + 9 attempt_in_flight` + 异 scope 并发各 1 attempt + settle 后 slot 释放（显式重试可达 · 非自动重试）；FAULT：`缝 throw → model_seam_failure · 0 检索 · 澄清` + `零内重试（缝恰 1 次）` + 缝超时（进程内计时器）；ADV：`注入/多语言/跨叶 → 越权建议全被拒` + `全 run 无任何 decision 携带非 allowlist 叶` |
| **④ PERF 预注册机制落位** | **PASS（机制）** | `SEMANTIC_ROUTE_PERF_BUDGET` 先于 Stage L 首调冻结（`stage='L'` · `frozenAt='2026-10-07'` · `misrouteHoldoutMax=0` · `perLeafRecallAt5MinBps=8000` · `p95ModelClassifyLatencyMs=3000` · `costHardCapCny=20` · 钉 `JOB_ROUTE_TAXONOMY_VERSION`/`JOB_ROUTE_POLICY_VERSION`）；决策携带 `durationMs`；规则路径本地实测 < P95（机制演示）。**误路由率/Recall@K/P95/成本实测留 Route L**（§5 residual）——本 proof 不证模型语义质量 |

实现面（additive-only）：`createSemanticRouteClassifier`——规则路径复用冻结词典 `classifyJobByRule`（0 模型）；模型路径 strict-enum over `TAXONOMY_V1_LEAVES` 8 叶 + `validateModelRouteOutput` 服务端双重校验；同 scope in-flight guard；失败一律 unresolved+澄清。**只建议 allowlisted track，不授读权/工具权/检索权；不替代 R4 硬过滤；CRAG/`researchBoundary` ≠ router 口径不变；sticky 持久化归 R2/RAG-07 db 状态机既有面（byte-intact 未触）**。

## 4. 触碰面与 byte-intact 自证

- 本刀 diff（`8c6860e3..db7da1cd` 最终态）：恰 4 文件——`packages/ai-runtime/src/router/semantic-route.ts`（新 · sha256 `105a6373…`）+ `packages/ai-runtime/test/gap-rag05-classifier.proof.ts`（新 · sha256 `607d9380…`）+ root `package.json`（+2 行 CMD 三层注册：`gap-rag05-classifier:prove` → `:prove:raw` → `pnpm -C packages/ai-runtime prove:gap-rag05-classifier`）+ `packages/ai-runtime/package.json`（+1 行 `prove:gap-rag05-classifier`）。
- **零触碰**：`packages/db/src/**`（R2 状态机/HMAC/sticky）、migrations（含 `0138`/`0139`）、既有 `rag03-*`/`rag04-*`/`rag05-qbank-miss`/`rag06`/`rag07`/batch4 proof 断言、`scripts/run-e2e-isolated.mjs`（本刀零改；ee7563a2 带入的 ±2 行属 SS2 线）、SSOT 四件（backlog/checklist/register/matrix/queue）、占用行 UC-018/052/025/004/011/014/026/002/001/028/016/017。
- **CMD 消歧（C-4）**：主 CMD 名 `gap-rag05-classifier` 前缀，与 `rag05-qbank-miss:prove`（UC proof 族编号 · 同名异义）零碰撞；消歧 note 写死于模块与 proof 文件头。邻接 `rag07-free-text-route:prove`（36 PASS）/ `rag03-route:prove`（43 PASS）EXIT=0 ×2 tip（rebase 前 `8c6860e3` + rebase 后 `db7da1cd`）——邻接绿态未被波及。

## 5. Route L residual 登记（binding #4 · 显式原文）

> **量化面 residual 待 Route L（须 EXEC 再授权+预算重报+阈值先冻+H19 temperature=0+prompt 版本钉）**——误路由率（misroute holdout）、per-leaf Recall@K、模型路径 P95 延迟、单例成本的生产等价实测与冻结，Stage S 未测、不宣称。预注册阈值已先于首调冻结于 `SEMANTIC_ROUTE_PERF_BUDGET`（misrouteHoldoutMax=0 · perLeafRecallAt5MinBps=8000 · p95=3000ms · costHardCapCny=20 · Ban 事后改值凑绿，CC-R8/C-3/C-HA-3）。Route L 前置：peer 双审同裁 + **EXEC 显式授权**（AD P4 · 列条件 ≠ 授权）+ 按当时牌价预算重报（粗估 ~240 calls/量级 ¥1 内/硬帽 ¥20 超帽 abort）+ `actualSpendCny` 实测（现 `null`）+ Key 仅进程环境 name-only + 外呼仅 allowlisted endpoint 名 + 单轮不重试（429/403 类按 Key-blocked 观察类记录非静默绿）。

**EXIT0 ≠**：GAP-RAG-05 `:73` CLOSED ≠ 语义质量冻结（Route L 未跑）≠ covered flip（coveredCount=**8** 不变）≠ `:70`/`:71` close ≠ router 生产接线宣称 ≠ HA ≠ `releaseEvidence=true` ≠ 替代 R4。`:73` **stays OPEN**（nail 期 SSOT additive 才记账）。

## 6. 与 harness §3.1 CMD 形状的披露差异（C-HA-2 逐点）

1. harness §3.1 主 CMD 声明含 `./scripts/with-docker-session.sh` 前缀 + isolated PG 口径；**实际 Stage S 主 proof 为进程内零 IO（纯 `packages/ai-runtime` domain/runtime 单元面），无 PG 依赖** → 未使用 docker wrapper、未起隔离 PG。CMD 层 `env -u` 三键完整保留（唯一凭证闸）。PG-retained stack 口径不变（本刀未触任何 stack 面）；邻接 `rag03-route`/`rag07-free-text-route` 均以真隔离 PG + 全迁移链复跑 EXIT=0（含终 tip），承担 PG 口径锚。
2. **runner（`scripts/run-e2e-isolated.mjs`）本刀未经过** → C-HA-2「若经 runner 需 additive 补剥 `MODEL_API_KEY`」**不触发，未改 runner**（逐点披露：主 proof 不经 runner；邻接两 CMD 经 runner 但其 CMD 层同样 `env -u` 三键前置剥离，runner 剥清单维持原样零改动）。
3. 邻接 runner 收据：`releaseEvidence=false` · `dataHandling=no_output_prompt_answer_token_endpoint_or_connection_string_persisted`（两 tip × 两 CMD 计 4 份 receipt JSON 存 `.tmp/isolated-proof-receipts/`，ledger 引用其文件名）。

## 7. Pins（原值 · 未动）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF eval-applicable（机制落位 · 实测留 L）· LOAD blind · capacityRepresentative=false · liveDefault=OFF · backlog `:73` OPEN · `:70`/`:71` OPEN。

## 8. Non-claims

Not closed · not covered · not HA · not live · not Key-read · not semantic-quality-frozen · not router-production-wired · not R4-replaced · LOAD not tested · 双 fresh 仅实现方侧完成（post-prove 双审另派）· alone ≠ dual · `post_prove_dual_pass` 由协调方落 · **禁 push** · STOP

---

*Receipt · GAP-RAG-05 Stage S · 2026-10-07 · author mw-core · awaiting_post_prove_dual · EXIT=0（主断言面自始绿 · 变异证伪 2 轮如实全录）· Route L residual 显式待 EXEC · STOP*
