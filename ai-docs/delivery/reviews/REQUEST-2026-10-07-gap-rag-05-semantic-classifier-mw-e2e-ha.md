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
