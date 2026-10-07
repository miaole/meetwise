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
