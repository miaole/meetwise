# REQUEST — **GAP-RAG-05 semantic classifier 刀**（生产 RAG 语义/LLM 意图分类器 · 受控评测 harness 待建 · `:73` OPEN）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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
| PERF / LOAD | **PERF eval-applicable · LOAD blind**（capacityRepresentative=false · Ban 冒充） |
| liveDefault | **OFF**（默认禁 live · Route L 须双审裁 + EXEC 显式授权 · AD P4） |
| canHonestlyFlip | **false** |
| MySQL FULLTEXT / Qdrant vector truth | **Ban** |

## 请审什么（mw-e2e-ha · EXIT/记账诚实 / NEG·PERF·LOAD 列 / SSOT 不翻行 / live 卫生与边界）

Line Phase 4 RAG · after RAG02 fixture nail（`line/rag02-nail` `6afd8c8f`）· R4 硬过滤条件已满足（`gR45Closed=true`）→ backlog `:73` 条件实施解除。Please review:

1. **账目保全**: backlog `:73`（GAP-RAG-05 OPEN）· `:70`（RAG02 fixture 面 NAIL 剩余面 OPEN · 零触碰）· `:71`（AQ OPEN · 零触碰）· queue `:34-35` Phase 4 · register `production-readiness-remediation-register.md:56` PRD-TEST-017 验收原文 · checklist `:1145` AD P4 / `:1199-1202` Y2 先例——全部 cite 不改写 · `rag-funnel-01-08-covered-matrix.md:18-19` FUNNEL-07/08 covered **不借**关 `:73` · coveredCount=**8** 零触碰。
2. **范围诚实**: 对象 = 受控评测 harness（待建）+ additive 语义分类器模块，按 backlog 目标「规则→轻量枚举→人工澄清漏斗；分类只建议 allowlisted track，不授读权」；**不得替代 R4 硬过滤**（`gR45Closed=true` 是实施条件不是被替代对象）；CRAG/researchBoundary ≠ router 口径钉死；`classify()` 规则占位骨架 ≠ 语义分类器（Ban 借骨架宣称已接线）。
3. **NEG 列必须 + 六列口径**: NEG（unknown/低置信/越权建议 → **0 检索** + 澄清漏斗 · schema 非法 → `validation_rejected` sticky · **规则命中 → 模型调用=0**）· FAULT（模型缝 throw/timeout/非法 JSON → fail-to-clarification · 不崩 · sticky 不自动重试）· BOUND（同 scope 并发至多一次 attempt · 单外发）· ADV（注入/多语言/跨叶混淆 → 仍落 allowlist 或 unresolved）· **PERF 适用**（P95 + 单例成本阈值预注册 eval · FUNNEL-08 惯例 · 本地非容量代表）· **LOAD 显式 blind**（本刀无负载扫 · Ban 借 BOUND 并发断言冒充 LOAD · capacityRepresentative=false）。
4. **EXIT 契约**: Primary CMD `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm gap-rag05-classifier:prove` 期望 EXIT 0（named-only · 本 REQUEST 零执行）+ 邻接 `rag07-free-text-route:prove` / `rag03-route:prove` EXIT 0（断言一字不动）；CMD 名 **Ban 碰撞 `rag05-qbank-miss:prove`**（同名异义 · `package.json:252`）；红名 → **EXIT1 保留** + `attempt-ledger.txt` 全录 + **attempts 全记录** + **Ban retry-to-green**（Ban 改断言凑绿/删断言/跳过失败段/弱化其余断言）；**EXIT1 记诚实 attempt ≠ flake**（Y2 attempts 1,0 先例 · 修复类次轮显式披露 wiring 界定）；harness 建不成 → 诚实 `blocked`（≠ 失败 ≠ conn-only）或 R5 marked-red（≠ deleted）；双 fresh（实现方 + post-prove 双审各恰一次）。
5. **EXIT0 ≠ covered ≠ 翻行**: EXIT0 仅证结构面 · ≠ GAP-RAG-05 整行 CLOSED · ≠ 语义质量冻结（Route L 未跑时量化面 residual 显式保留）· ≠ router 生产接线宣称 · ≠ covered flip（coveredCount=**8**）· ≠ `:70`/`:71` close · ≠ HA · ≠ `releaseEvidence=true` · ≠ 替代 R4。
6. **默认禁 live + Key 卫生**: 本 REQUEST 期零 Key 读取零外呼；live 申报显式化——Key 已供给（`~/.meetwise-secrets/MODEL_API_KEY` · 用户已授权 live 供给）但 **pre-exec dual PASS ≠ live 授权**，Route L 须双审裁 + **EXEC 显式授权**（AD P4：Key 供给+用户点头+双审+EXEC 显式授权 · 列条件 ≠ 授权）；预算粗估 ~240 calls / 量级 ¥1 内 / 硬帽 ¥20（EXEC 授权时重报价 · `actualSpendCny` 实测）；Key 卫生：仅进程环境 · name-only presence（`keySource=<path>`）· **禁 echo/print/落盘/入 receipt/attempt-ledger/commit** · 禁 `.env*` · 外呼仅 allowlisted endpoint · 限流/配额错按 Key-blocked 观察类记录非静默绿。
7. **触碰面与 SSOT 纪律**: 本 REQUEST 恰 4 md additive under `ai-docs/delivery/` · backlog/checklist/register/matrix/queue **零触碰** · **SSOT 仅 nail 期 additive**（CC-R9 · 历史 cites 不改写）· future coding 面 additive-only · Ban 碰 `packages/db/src/**`（R2 状态机语义）/ migrations（含 `0138`/`0139`）/ 既有 rag03-*/rag04-*/rag05-qbank-miss/rag06/rag07/batch4 proof 断言 · **Ban 碰 `:70`/`:71` 已清面** · **Ban 碰已占用行/文件（UC-018/052/025/004/011/014/026/002/001/028/016/017）**。
8. **PG-retained / 边界**: 真隔离 PG + 全迁移链 · image `pgvector/pgvector:pg16` 口径不变 · Ban MySQL FULLTEXT · Ban Qdrant vector truth · docs-only · Dual PASS ≠ coding ≠ prove ≠ nail ≠ close · Ban self-approve · alone ≠ dual · Ban AN-CIMG-EA（HOLD）· Ban buy cloud · Ban Meridian · Ban G7 wash · Ban force-push · Ban open MOP / A-seed / CIMG / AP ISO-banner · Ban 触 AO COND line files · Ban push（worktree 本地 commit · 禁 push）。

GAP-RAG-05 `:73` stays **OPEN** · 受控评测 harness named-only · **Ban close** · coveredCount=8 · 默认禁 live · LOAD blind 如实。

本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权 coding（Route L 另须 EXEC 显式授权）；implementer 不自批。

---

*Stub · awaiting expert pre-exec dual · Verdict PENDING · STOP*

---

# PRE-EXEC dual 审查段（mw-e2e-ha · adversarial evidence-honesty · docs gate only）

**Reviewer**: `mw-e2e-ha`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-rag05-e2e-ha` · branch `rv/rag05-e2e-ha` · base=本地主线 tip `23b2ceb5`（full `23b2ceb54ef6fc72381b539091a508751104aed3`）· 本审 commit 于该 worktree · Ban push）
**被审 REQUEST**: `ae30bd92`（full `ae30bd92a7135e2eb5f9940df04db4779d979bff` · `docs(e2e): REQUEST GAP-RAG-05 (pre_dual)` · 本地主线最新段内 · 恰 4 md 全新增加 under `ai-docs/delivery/`：slice + harness + 双 stub，+328/−0）
**Provenance（亲算）**: `git merge-base --is-ancestor ae30bd92 23b2ceb5` PASS（REQUEST ∈ 主线 tip 祖先）；REQUEST 4 文件均 status `A`（纯 additive · 0 修改 0 删除）；`git diff ae30bd92 HEAD -- <4 rag05 文件>` = 空（其后主线 3 commit（b853b890 族 mem00/flake/c-b-audit）零触碰本刀文件 · byte-intact）；与 `line/rag05-classifier` `8f2786a8` patch-id 孪生：双侧 `git patch-id --stable` = `9f6b413e982ff845c1996239a953beb1377a7087` 全等；base 主张 `50423a6f`（full `50423a6fa6f18d4c9d193611cf84c4702e067208`）= origin tip 亲证吻合。
**审查焦点**: live 预算与 Key 卫生（Route L 申报面）· 评测诚实（预注册/EXIT1/Ban retry-to-green）· 域边界（只建议不授读/不替代 R4/不外推）· 禁碰清单+SSOT+Pins 原值。

## 检查表（P1–P12 · 逐项机检）

| # | 项 | 亲证 |
|---|----|------|
| **P1** | REQUEST 祖先 + docs-only | merge-base 亲算 PASS；4 文件全 `ai-docs/` 下 `A` 状态，non-md grep = 0；零产品码零 scripts/packages/apps/migrations 触碰 |
| **P2** | backlog 锚原文 | `gap-bug-backlog.md:73` GAP-RAG-05 P1 OPEN 行亲读吻合（无分类器/CRAG·researchBoundary≠router/规则→轻量枚举→澄清漏斗/只建议不授读权/R4 关闭后条件实施/受控评测 harness 待建·不得替代 R4）；`:70`（RAG02 fixture NAIL 剩余 OPEN）· `:71`（AQ OPEN）· `:72`（G-R4-5 `gR45Closed=true` 源）亲读吻合 |
| **P3** | register/queue/matrix/checklist 锚 | `production-readiness-remediation-register.md:56` PRD-TEST-017（仅第一格 ☑）+ 关闭验收四件亲读吻合；`REMAINING-NORTH-STAR-QUEUE.md:34-35` Phase 4 原文吻合；`rag-funnel-01-08-covered-matrix.md:18-19` FUNNEL-07/08 **covered**（funnel 缝 contract/eval 面）吻合 → 「covered 不借关 `:73`」口径成立；`execution-master-checklist.md:1145` AD P4 原文「live Key 供给 + live 预算 + 双审 + 协调方显式授权 = 另刀 · 列条件 ≠ 授权」亲读吻合；`:1199-1202` Y2 先例（EXIT=0 双 fresh 45/45 · attempts 1,0）吻合 |
| **P4** | 代码锚 read-only 吻合 | `packages/ai-runtime/src/router/index.ts` 文件头自注「骨架：先用确定性规则占位」+ `classify():16` 纯规则（harness「骨架 ≠ 语义分类器」主张实锚成立）；`packages/domain/src/job-route-classifier.ts:19/31/33` = `TAXONOMY_V1_LEAVES`（亲数恰 **8** 叶，逐叶与 harness 列表吻合）+ `JOB_ROUTE_TAXONOMY_VERSION='v1'` + `JOB_ROUTE_POLICY_VERSION='calibration-2026-08-frozen:v1'`；`packages/db/src/job-route-decision.ts` route_pending/sticky `validation_rejected`/同 (job,revision) ≤1 次外发/HMAC digest 亲读吻合；`apps/worker/src/route-classify-consumer.ts` MODEL-OP `job.route-classify.v1` 吻合；`apps/worker/src/interview-research-skills.ts:88` 邻域 `classifyInterviewResearchBoundary` 在位；`ai-docs/architecture/ai/classifier-router-tier.md` 规则→小分类器→便宜 LLM（:4）· fail-to-clarification 多域路由（:43）· H19 temperature=0+固定 prompt 版本+决策持久化（:25）亲读吻合 |
| **P5** | live 预算披露合理性 | ~240 = 8 叶×~25 例(200) + ~20% holdout 数学自洽；牌价代入亲算：36 万 in×¥0.0003/1k + 2.4 万 out×¥0.0006/1k ≈ **¥0.12** →「量级 ¥1 以内」成立且留 ≥8× 余量；硬帽 ¥20 = 估値 ~160× 防溢出；「**粗估非报价** · EXEC 授权时按当时牌价重报 · `actualSpendCny` 实测入收据」三重披露在位（§3.5）——披露诚实 |
| **P6** | Key 卫生写死 | 进程环境一次性 source + name-only presence（`keySource=<path>`）· Ban echo/print/落盘/入 receipt/attempt-ledger/commit · Ban secrets/`.env*` · 外呼仅 allowlisted endpoint、收据只记 endpoint 名（harness §3.6 · stub 第 6 条 · slice Ban 三处写死）；4 文件全文 grep `sk-*`/`KEY=<value>` = **0 hit**（仅 name-only 提及）；限流/配额错（429/403）按 Key-blocked 观察类非静默绿（§3.4 沿 G7 三分类口径） |
| **P7** | actualSpendCny=null 沿 I 线 | 本 REQUEST 期零 Key 读取零外呼 → 实测前 null；SSOT 既有口径 `execution-master-checklist.md:99`「`actualSpendCny` stays null · no invented spend」在位亲读；harness 仅约定 Route L 实跑时实测入收据（§3.4/§3.5/CC-R8）——两态边界清楚，Ban invent spend 沿线成立 |
| **P8** | 评测诚实（防挑好 case） | PERF 适用且**预注册**：misroute holdout=0 · per-leaf Recall@K 下限 · P95 预算 · 成本硬帽，Ban 事后改阈值凑绿（CC-R8）；holdout 口径沿 FUNNEL-08（multi-lang/fullstack/ambiguity/injection · matrix:19 亲读）——对抗集先于跑分固定，非跑后选优；LOAD **显式 blind** + `capacityRepresentative=false` + Ban 借 BOUND 并发断言冒充 LOAD |
| **P9** | EXIT1 诚实路径 + Ban retry-to-green | 红名 EXIT1 保留 + `attempt-ledger.txt` 全录（格式先例文件 `ai-docs/delivery/receipts/gap-rag-03-r3-filter-locus/attempt-ledger.txt` 亲验在位）+ attempts 全记录 + Ban 改断言凑绿/删断言/跳过失败段/弱化其余断言；**EXIT1 记诚实 attempt ≠ flake**（Y2 attempts 1,0 先例 · 修复类次轮须显式披露 wiring 界定）；harness 建不成 → 诚实 `blocked`（`north-star-hard-gates.md:68` blocked 约定亲读在位）或 R5 marked-red（marked-red ≠ deleted · 家族约定在 delivery docs 亲验）· 不假绿；双 fresh 各恰一次 |
| **P10** | 域边界 | 只建议 allowlisted track（8 叶）· **不授读权/工具权/检索权**（CC-R1/§2.2/§3.3 BOUND 三处写死）；**不得替代/绕过/弱化 R4 硬过滤**（gR45Closed=true 是实施条件非被替代对象）；CRAG（检索后证据分支）/`researchBoundary`（外发护栏）≠ router 口径钉死；`classify()` 骨架 ≠ 语义分类器 · Ban 宣称已接线；**Ban 外推检索/语义质量**：EXIT0 仅证结构面，Route L 未跑时量化面 residual 显式保留（§3.7/§4 Non-closing/§8）——RAG05 不借 FUNNEL-07/08 covered 绿关行 |
| **P11** | 禁碰清单 + SSOT + Pins 原值 | Pins 原值与 SSOT 逐字吻合（`execution-master-checklist.md:432`/`:443`：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount **8** · ms3EqualsR4Closed=false · PG-retained · public DELETE=503——本审零改值）；REQUEST commit 触碰面=仅 4 新 md（backlog `:70`/`:71`/`:73`/checklist/register/matrix/queue **零触碰**机检）；Ban 碰 `packages/db/src/**`/migrations（`0138`/`0139`）/rag03-*·rag04-*·rag05-qbank-miss·rag06·rag07·batch4 断言 byte-intact 全在写死；占用行 UC-018/052/025/004/011/014/026/002/001/028/016/017 列全；SSOT 仅 nail 期 additive（CC-R9 · 历史 cites 不改写）；CMD 名 Ban 碰撞：`gap-rag05-classifier:prove` 现 package.json **0 hit**（未注册 · 正确），`rag05-qbank-miss:prove` 实锚 `package.json:252` 同名异义亲读吻合 |
| **P12** | 授权边界 | pre-exec dual PASS ≠ coding ≠ prove ≠ live ≠ nail ≠ close ≠ AUTHORIZE；Route L 另须双审裁 + EXEC 显式授权（AD P4 · 列条件 ≠ 授权）；本审 alone ≠ dual · 不代签 peer `mw-rag-route` · Ban self-approve · 0 prove run · 0 coding · 0 SSOT 写 · 禁 push |

## Fail-trigger audit（触发即 FAIL · 逐条机检为负）

- REQUEST 携带 Key 物料 / `.env` 引用值 → grep 4 文件 **0 hit**。
- 产品码/迁移/scripts/packages/apps 触碰 → 4 文件全 `ai-docs/**` 纯新增 **0 hit**。
- backlog `:73` 翻行 / coveredCount 变动 / Pins 漂移 → REQUEST diff 仅新增 4 文件，SSOT 文件 0 触碰；Pins 与 checklist:432/443 逐字吻合。
- CMD 名碰撞 `rag05-qbank-miss:prove` → `gap-rag05-classifier` 前缀独异 + 现 package.json 0 注册，harness 且明令 disambiguation note 义务。
- 预注册缺位/事后改阈值口子 → CC-R8「Ban 事后改阈值凑绿」+ CC-R5「Ban 只报绿不录红」+ FUNNEL-08 holdout 先验固定。
- EXIT1 洗 flake 口子 → 三处写死（stub:38 · slice Ban · harness §3.4）+ 修复类次轮须显式披露 wiring 界定。
- 检索/语义质量外推口子 → §3.7「≠ 语义质量已冻结」+ §8 Non-closing + EXIT0≠` :73` closed 三处写死。
- live 默认开 / pre-exec PASS 即带 Key → liveDefault=OFF 三处写死 + CMD 层 `env -u` 三键 + AD P4 四要件「列条件 ≠ 授权」。

## Blockers

**0**（无阻断项）。

## Conditions（C-HA-1 ~ C-HA-7 · 随 PASS 携带 · prove/EXEC 期全额绑定）

- **C-HA-1（live 解锁链）**: Route L 执行前置 = 双审裁 + **EXEC 显式授权**（AD P4 四要件 · 列条件 ≠ 授权 · pre-exec dual PASS ≠ live 授权）；EXEC 授权时按当时牌价**重报价**并按 §3.5 硬帽 ¥20 abort；实测前 `actualSpendCny=null` 沿 I 线口径（checklist:99「stays null · no invented spend」），Ban 发明 spend。
- **C-HA-2（Key 卫生全程）**: Key 仅进程环境 · name-only presence（`keySource=<path>`）· Ban echo/print/落盘/入 receipt/attempt-ledger/commit · Ban `.env*`；Route S 唯一凭证闸 = CMD 层 `env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL` + `envModelApiKeyUnset=true` 入收据。亲验登记：`MODEL_API_KEY` 现不在 runner 剥清单（`scripts/run-e2e-isolated.mjs` 剥清单 grep 0 hit · :1965-1972 实锚为 DASHSCOPE 族）——Route L 若经 runner 执行须按 §2.1 **additive** 补剥清单，Ban 以「runner 已剥」替代 CMD 层 `env -u` 口径。
- **C-HA-3（评测诚实绑定）**: 预注册阈值（misroute holdout=0 · per-leaf Recall@K 下限 · P95 · 成本硬帽）先于跑分固定，Ban 事后改阈值凑绿（CC-R8）；红名 EXIT1 保留 + attempts 全录 + Ban retry-to-green/Ban 删断言/跳失败段/弱化断言（CC-R5）；EXIT1 = 诚实 attempt ≠ flake，修复类次轮须显式披露 wiring 界定；限流/配额错按 Key-blocked 观察类非静默绿；超硬帽立即 abort 记录。
- **C-HA-4（不外推）**: EXIT0 仅证结构面 ≠ GAP-RAG-05 整行 CLOSED ≠ 语义/检索质量冻结（Route L 未跑时量化面 residual 显式保留）≠ router 生产接线宣称 ≠ covered flip（coveredCount=8）≠ `:70`/`:71` close ≠ HA ≠ `releaseEvidence=true` ≠ 替代 R4；Ban 借 FUNNEL-07/08 covered、`classify()` 骨架、CRAG/`researchBoundary` 任一绿面关 `:73` 或洗 router 宣称。
- **C-HA-5（触碰面/SSOT 纪律）**: additive-only；`packages/db/src/**` · migrations（含 `0138`/`0139`）· 既有 rag03-*/rag04-*/rag05-qbank-miss/rag06/rag07/batch4 proof 断言 byte-intact；backlog `:70`/`:71`/`:73`/checklist/register/matrix/queue 本 REQUEST 期零触碰，SSOT 仅 nail 期 additive（CC-R9 · 历史 cites 不改写）；占用行 UC-018/052/025/004/011/014/026/002/001/028/016/017 禁碰；主 CMD 名须带 `gap-rag05-classifier` 前缀 + 文件头 disambiguation note，Ban 碰 `rag05-qbank-miss:prove`（`package.json:252` 同名异义）。
- **C-HA-6（Pins 冻结）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 原值保持，未经另行授权 Ban 改；本段 append-only（前 51 行 byte-intact）为本 PASS 组成部分。
- **C-HA-7（alone ≠ dual）**: 本 PASS 仅 `mw-e2e-ha` 一侧，dual 生效须 peer `mw-rag-route` 独立 PRE PASS（本审不读不改不代签 peer stub）；POST PASS ≠ AUTHORIZE，状态写入权归协调方流程；implementer 不自批。

## 观察（非阻断 · 2 条）

- **OBS-1**: AD P4 checklist:1145 原文中间件为「**live 预算**」，本 stub/harness 概括作「**用户点头**」——措辞略异，实质四链（Key 供给/预算或授权确认/双审/显式授权）与「列条件 ≠ 授权」一致，cite-only 不改写，登记备查。
- **OBS-2**: attempt-ledger 先例 cite 作 `receipts/gap-rag-03-r3-filter-locus/attempt-ledger.txt`（实际全路径带 `ai-docs/delivery/` 前缀，亲验在位）——惯用缩写、无歧义，登记。

## 中文三行摘要

1. 被审 REQUEST `ae30bd92`（=line/rag05-classifier `8f2786a8` patch-id 孪生 `9f6b413e`）机检为恰 4 md 纯新增 docs-only，零产品码零 SSOT 零 Key 物料，全部 cite 锚（backlog :70-73 · register :56 · queue :34-35 · matrix :18-19 · checklist :1145/:1199-1202 · 8 叶词表 · 骨架自注）逐条亲读吻合。
2. live 面（若 Route L 被裁）披露诚实：~240 calls 估算自洽、牌价亲算 ≈¥0.12 支撑「量级 ¥1 内」、硬帽 ¥20 + EXEC 授权时重报价 + `actualSpendCny` 实测/null 两态沿 I 线；Key 卫生进程环境 name-only 三处写死，零 Key 接触于本 REQUEST 期；评测诚实（预注册阈值/holdout 先验固定/EXIT1 诚实路径/Ban retry-to-green/LOAD blind）与域边界（只建议不授读/不替代 R4/不外推检索质量）全部落字无口子。
3. Pins 原值零漂移（NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503），`:73` stays OPEN；0 Blocker，Conditions C-HA-1~7 随卷；alone ≠ dual，不代签 peer `mw-rag-route`，PASS ≠ coding/prove/live/nail/close 授权。

Verdict: PASS

---

# POST-PROVE dual 审查段（mw-e2e-ha · adversarial evidence-honesty · Stage S prove 后复核）

**Reviewer**: `mw-e2e-ha`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-rag05p-e2e-ha` · branch `rv/rag05p-e2e-ha` · base=origin/feat/mysql-schema-skeleton tip `75ba2783`（full `75ba2783d547e154227d52ea4ee98cf6547310e3`）· 本审 commit 于该 worktree · Ban push）
**被审包**: RAG05 Stage S 链 = coding `281128ce`（feat(ai-runtime) · receipt/台账侧自称 `db7da1cd` · 见 OBS-A）+ receipt `0039c1b7`（docs(delivery)）· 恰 **4+2 文件**
**前审**: PRE-EXEC dual PASS `48fc38cb`（本文件上半段 · C-HA-1~7 全额绑定本段逐条复核）· 实现方 EXEC receipt `0039c1b7` Status=`executed:awaiting_post_prove_dual` · Ban self-approve
**审查焦点**: fresh re-run 亲跑 + Route L 零执行零 Key 接触解锁链完整性 + Key 卫生 + 评测诚实 + 不外推 + additive-only + Pins + alone≠dual。

## 包完整性机检（逐项亲算）

- **恰 4+2 文件**：`281128ce` = M root `package.json`（+2 行 CMD 三层注册）+ M `packages/ai-runtime/package.json`（+1 行 prove script）+ A `packages/ai-runtime/src/router/semantic-route.ts`（260 行）+ A `packages/ai-runtime/test/gap-rag05-classifier.proof.ts`（202 行）；`0039c1b7` = A receipt md + A attempt-ledger.txt。恰 4+2，零多余。
- **零 Key 物料入树（秘密门自跑）**：`scripts/check-staged-secrets.mjs` credentialPatterns（5 条）+ `CLOUD_IDENTIFIER_RULES`（PRIVATE_KEY/CLOUD_IDENTIFIER · 含 isSyntheticIdentifier 放行逻辑）**逐条 verbatim 重放** 6 包文件 = **0 findings**；包面零 `.env*`；receipt/ledger 全程 name-only（`~/.meetwise-secrets/MODEL_API_KEY` 仅提名）。
- **SSOT 零 diff**：`git diff 760de1e1..0039c1b7` 于 backlog/checklist/register/matrix/queue 五件 = **空**；占用行零触碰随之机检成立。
- **零外呼三重证**：① `envModelApiKeyUnset=true`——本审 fresh re-run CMD 层 `env -u` 三键 + proof **S0 fail-closed 断言门 PASS**（log :13 亲读）；② `providerOutboundCalls=0` 结构性——两新文件 network-primitives grep（fetch/http/https/net/tls/dns/http2/axios/undici/WebSocket/child_process）= **0 hit**，模型缝 = 注入类型函数 `SemanticRouteModelClassify`，零网络客户端构造；③ **import 面恰 = `node:crypto` + `node:perf_hooks` + `@meetwise/domain`**（`semantic-route.ts:35-47` · proof :25-32 同域）亲读吻合。
- **base 重钉 delta 亲算**：`8c6860e3..ee7563a2` = 恰 7 ai-docs（他线）+ `scripts/run-e2e-isolated.mjs` ±2 行（:5-6 SOLE_STACK 头注对齐 · SS2 线）——与本刀 4 文件触碰面零交集，receipt §Base 重钉披露吻合。

## Fresh re-run（双审侧 · 恰一次 · 禁重试）

- **CMD**：`env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm gap-rag05-classifier:prove`
- 场景：worktree `rv/rag05p-e2e-ha` @ `75ba2783` porcelain clean · node v22.22.3 · pnpm 10.18.0（`pnpm install --frozen-lockfile` 环境准备 · 非 prove attempt）· parent env 三键 name-only 亲检 absent（闸仍全额应用）
- **结果：EXIT=0 · 33 PASS / 0 FAIL** · S0 三键未设门在卷 PASS · **首跑即绿 · 零重试** · 跑后 `git status --porcelain` = 0 行（进程内零 IO 结构性自证）
- 与实现方 PRIMARY attempt-2（`db7da1cd` clean tip）内容同源性：4 文件 blob hash 逐一 IDENTICAL（见 OBS-A）→ 双侧 fresh 同一断言面成立。

## C-HA 条件裁决（PRE 七条 · POST 逐条复核）

| 条件 | 裁决 | 亲证 |
|------|------|------|
| **C-HA-1** Route L 零执行零 Key 接触（解锁链完整带入） | **HELD** | 模块零网络客户端（结构性不可能外呼）；receipt §5 residual **原文核验**：量化面（误路由率/Recall@K/P95/成本）显式未测不宣称；四要件解锁链完整在卷 = 双审同裁 + **EXEC 显式授权**（AD P4 · 列条件≠授权）+ **按当时牌价预算重报**（粗估 ~240 calls/硬帽 ¥20 超帽 abort）+ **阈值先冻**（`SEMANTIC_ROUTE_PERF_BUDGET` stage='L' · frozenAt='2026-10-07' · misrouteHoldoutMax=0 · perLeafRecallAt5MinBps=8000 · p95=3000ms · costHardCapCny=20 · S5④ 断言在卷）+ **H19 temperature=0 + prompt 版本钉**；`actualSpendCny=null` stays null（Ban invent spend）；本审全程零 Key 读取零外呼亲证 |
| **C-HA-2** Key 卫生 | **HELD** | CMD 层 `env -u` 三键 = 唯一凭证闸（本审亲跑应用）+ proof S0 fail-closed 门（设了即红）亲跑 PASS；主 proof **不经 runner**（`:prove:raw` 直达 tsx · package.json 三层链亲读）；本刀零改 runner（delta 仅 SS2 头注 :5-6）；runner 剥清单仍**不含 `MODEL_API_KEY`**（:1957-1972 DASHSCOPE 族亲读）→ 「Route L 若经 runner 须 additive 补剥」条件继续绑定；`:72`（G7 指纹 · env -u 下恒 null ·「Fingerprint only — never persist key material」）与 `:1954`（scoring:eval:raw skip-gate）均为既有码非本刀面（OBS-B）；零 `.env*` · receipt/ledger/commit 零 Key 值（秘密门自跑 0 findings） |
| **C-HA-3** 评测诚实 | **HELD** | 阈值预注册冻结于代码常量（先于 Stage L 首调 · Ban 事后改值凑绿 · S5④ 逐项断言）；变异证伪如实录红：mut-1-1 EXIT=1（S3③ ×2 红）· mut-2-1 EXIT=1（S2② NEG ×6 红）· 断言集零改动 · `git diff --exit-code` 恢复复核在卷；主断言面自始绿（smoke/attempt-1/attempt-2/final-1 全 EXIT=0 · 台账 :20 汇总亲读）→ **零 retry-to-green**；本审 fresh re-run 亦首跑绿；EXIT1=诚实 attempt ≠ flake 口径在卷 |
| **C-HA-4** 不外推 | **HELD** | receipt §5 EXIT0≠清单在位（≠ `:73` CLOSED ≠ 语义质量冻结 ≠ covered flip ≠ `:70`/`:71` close ≠ router 生产接线 ≠ HA ≠ `releaseEvidence=true` ≠ 替代 R4）；proof S5④「规则路径本地实测 < P95」显式标 **机制演示 · 模型 P95 实测留 Stage L**（不外推）；S2② decided 结构断言 = 纯建议无 retrieval/read/tool 授予键；backlog `:73` 行亲读无 CLOSED/`post_prove_dual_pass` token；coveredCount=**8** 零翻转；matrix :18-19 FUNNEL-07/08 covered 未借关行 |
| **C-HA-5** additive-only / 触碰面 | **HELD** | 4+2 全为 A 或 additive 行；`packages/db/src/**` · migrations（含 0138/0139）· 既有 rag03-*/rag04-*/rag05-qbank-miss/rag06/rag07/batch4 proof · runner · SSOT 五件 · 占用行 **零触碰机检**；CMD 消歧（C-4）：`gap-rag05-classifier:prove` 新注册与 `rag05-qbank-miss:prove`（`package.json:252` 原位未动）零碰撞，双新文件头 disambiguation note 在卷 |
| **C-HA-6** Pins 冻结 | **HELD** | checklist `:432`/`:443` 逐字吻合 tip 原值（NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount **8** · ms3EqualsR4Closed=false · PG-retained · DELETE=503）；backlog `:70`/`:71`/`:73` 原样；register `:56` PRD-TEST-017 仅首格 ☑；queue `:34-35` Phase 4 原文；本段 append-only（前 114 行 byte-intact · git diff 仅 + 行机检）为本 PASS 组成部分 |
| **C-HA-7** alone ≠ dual | **HELD** | 本段仅 `mw-e2e-ha` 一侧裁决 · 不读不改不代签 peer `mw-rag-route`（其 POST 审并行另出）· `post_prove_dual_pass` 落账权归协调方 · implementer 不自批 · POST PASS ≠ AUTHORIZE ≠ Route L 授权 |

## Fail-trigger audit（触发即 FAIL · 逐条机检为负）

- 包面 Key 物料 / `.env*` → 秘密门 verbatim 重放 6 文件 **0 findings**。
- 重试凑绿 / 断言改动 → 台账 attempts 全录 + 本审恰一次首跑绿 + 4 文件 blob 与 PRIMARY attempt 同源 IDENTICAL。
- 事后改阈值口子 → 阈值为 `as const` 代码常量 + S5④ 断言逐项钉值 + receipt §5「Ban 事后改值凑绿」写死。
- Route L 偷跑口子 → 模块零网络客户端 + 缝=注入函数 + residual 四要件解锁链完整 + EXEC 未授权。
- `:73` 翻行 / covered flip / Pins 漂移 → SSOT 五件 0 diff + `:73` 行无 closed token + checklist :432/:443 原值亲读。
- 外推口子 → S5④ 机制演示显式 + §5/§8 Non-claims 双写。

## Blockers

**0**（无阻断项）。

## Conditions（随 PASS 携带）

- **C-HA-1 ~ C-HA-7 全额继续绑定**（PRE 段原文为准 · POST 复核全 HELD 无稀释）；其中 C-HA-2 之「Route L 若经 runner 须 additive 补剥 `MODEL_API_KEY`」与 C-HA-1 之 Route L 四要件解锁链（EXEC 再授权+预算重报+阈值先冻+H19 t=0/prompt 版本钉）为本 PASS 的继续生效前提。
- 本刀口径边界继续绑定：EXIT=0（双侧 fresh）仅证 **Stage S 结构面**；Route L 量化面 residual 按 receipt §5 原文待 EXEC；`actualSpendCny` stays null；coveredCount=8；`:73` stays OPEN。
- 无新增 Conditions（2 条观察非阻断登记如下）。

## 观察（非阻断 · 2 条）

- **OBS-A**: receipt/台账 coding commit 自称 `db7da1cd`（=rebase 到 `ee7563a2` 顶的 sha · parent 亲证 `ee7563a2`），落地主线 coding commit 实为 `281128ce`（parent `760de1e1`）——**落地后 sha 未在 receipt 提名**。内容面机检全等：`git patch-id --stable` 双侧 = `f714263032b8cd41f84531ecbb5cafc6239eef06` 全等 + 4 文件 blob hash 逐一 IDENTICAL（`077aebab`/`a099c0c4`/`9549cb28`/`ee0a3204`）→ 重钉已披露、内容零漂移，登记备查不阻断；后续 receipt 惯例建议并列披露 pre/post-landing 双 sha。
- **OBS-B**: runner 既有 `MODEL_API_KEY` 引用两处（`:72` G7 freetier 指纹——本刀口径下 env -u 恒 null · 代码自注 never persist key material；`:1954` `scoring:eval:raw` skip-gate——live eval 显式申报面）均**先于本刀存在**（`8c6860e3..ee7563a2` delta 仅 :5-6 头注），非本刀触碰；剥清单仍不含 `MODEL_API_KEY`，与 PRE 段 C-HA-2 亲验登记一致（PRE 引 :1965-1972 与现行号微漂 · 实质内容 DASHSCOPE 族成立）。

## 中文三行摘要

1. POST-PROVE dual 机检全过：RAG05 Stage S 链恰 4+2 文件（coding `281128ce` + receipt `0039c1b7` · 台账侧 `db7da1cd` 与落地 `281128ce` patch-id `f7142630` 全等 + 4 blob IDENTICAL · OBS-A 登记）；秘密门 verbatim 重放 6 包文件 0 findings、SSOT 五件 0 diff、零外呼三重证成立（env -u 三键 + S0 门 PASS + 网络原语 0 hit + import 面恰 node:crypto/perf_hooks/domain）。
2. 本审 fresh re-run 恰一次：`env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm gap-rag05-classifier:prove` → **EXIT=0 · 33/33** · 首跑即绿零重试、跑后 porcelain=0 零 IO 自证；C-HA-1~7 逐条复核全 HELD（Route L 四要件解锁链 receipt §5 原文完整 · 阈值 as const 先冻 · 变异 2 轮 EXIT=1 如实录红零 retry-to-green · EXIT0≠`:73` CLOSED≠语义质量≠covered flip · additive-only · Pins 八项原值 · alone≠dual）。
3. 0 Blocker · C-HA-1~7 全额随卷继续绑定（runner 补剥 + EXEC 再授权链为 Route L 前提）· 观察 2 条非阻断（landing sha 未并列披露 · runner 既有 MODEL_API_KEY 引用特征化）；本段仅 mw-e2e-ha 一侧，不代签 peer `mw-rag-route`，`post_prove_dual_pass` 落账权归协调方；PASS ≠ Route L 授权 ≠ close ≠ HA · 禁 push。

Verdict: PASS
