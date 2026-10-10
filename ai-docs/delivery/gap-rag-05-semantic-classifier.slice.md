# Slice — **GAP-RAG-05 semantic classifier 刀**（生产 RAG 语义/LLM 意图分类器 · 受控评测 harness 待建 · `:73` OPEN · REQUEST · docs-only PENDING）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 双 stub PENDING · Ban self-approve · alone ≠ dual · **Ban coding · Ban prove · Ban push · 默认禁 live**）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF eval-applicable · LOAD **blind** · capacityRepresentative=false · canHonestlyFlip=false · liveDefault=**OFF**
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`50423a6f`** / full `50423a6fa6f18d4c9d193611cf84c4702e067208`（SCOR/P0-CB inventory nail）
**Worktree tip at REQUEST**: 本 REQUEST commit（branch `line/rag05-classifier` · worktree `/Users/miaole/Desktop/golucky/meetwise-line-rag05` · Ban push）
**Queue**: Phase 4 RAG（`REMAINING-NORTH-STAR-QUEUE.md:34-35`「GAP-RAG-02 fixture · **GAP-RAG-05 semantic classifier late**」· RAG02 fixture 刀已 nail（`line/rag02-nail` `6afd8c8f`）· 本刀 = **Phase 4 剩余行**）
**Authority**: docs REQUEST only · Ban coding · Ban prove · 默认禁 live · pre-exec dual PASS 后由协调方授权 coding；Route L（live）另须 **EXEC 显式授权**（AD P4：Key 供给+用户点头+双审+EXEC 显式授权 · 列条件 ≠ 授权）

## One-line

backlog `:73`（GAP-RAG-05 · P1 · OPEN）：生产无 RAG 语义/LLM 意图分类器——`packages/ai-runtime/src/router/index.ts` `classify()` 是纯规则占位骨架未接线为运行时 router，CRAG（`packages/domain/src/crag.ts`）是检索后证据分支、`researchBoundary`（`packages/domain/src/research-policy.ts`）是外发护栏，**均 ≠ router**（register `production-readiness-remediation-register.md:56` PRD-TEST-017 原文）；RAG-FUNNEL-07/08 covered（`rag-funnel-01-08-covered-matrix.md:18-19`）证的是 funnel 缝 contract/eval 面，不关本行。R4 硬过滤条件已满足（`gR45Closed=true`）→ 本刀按 backlog 目标原文「规则→轻量枚举→人工澄清漏斗；分类只建议 allowlisted track，不授读权」REQUEST 受控评测 harness（待建）：PRD-TEST-017 关闭验收四件（规则直达模型调用=0 · 低置信/unknown/越权=0 检索 · 同 scope 并发至多一次 attempt · 误路由/P95/成本经生产等价评测冻结）。两路线交双审裁：**Route S** scripted/fixture seam（Y2 先例 · 默认）证结构面；**Route L** live 真模型 eval（AD P4 申报 · **默认禁 live** 至 EXEC 显式授权）证量化面（预算粗估 ~240 calls/量级 ¥1 内/硬帽 ¥20 · Key 卫生：进程环境 name-only · 禁入 receipt/commit）。EXIT0 ≠ GAP-RAG-05 closed ≠ 语义质量冻结 ≠ covered ≠ `:70`/`:71` close ≠ HA ≠ 替代 R4。coveredCount stays **8**。

## Products

| Role | Path |
|------|------|
| Harness（gap 现状 + 两路线 + scope + prove 契约 + CC-R1..R9） | `harness/gap-rag-05-semantic-classifier.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-07-gap-rag-05-semantic-classifier-mw-rag-route.md`（PENDING） |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-rag-05-semantic-classifier-mw-e2e-ha.md`（PENDING） |

## Parent evidence（cite only · Ban re-prove · Ban wash）

| Item | SHA / note |
|------|------------|
| Base tip | `50423a6f` / `50423a6fa6f18d4c9d193611cf84c4702e067208` |
| backlog 锚 | `gap-bug-backlog.md:73`（GAP-RAG-05 · P1 · OPEN）· `:70`（RAG02 fixture 面 NAIL 剩余面 OPEN）· `:71`（RAG03/AQ OPEN）· `:72`（G-R4-5 `gR45Closed=true` 源）· `execution-master-checklist.md:1145`（AD P4）· `:1199-1202`（Y2 scripted 缝先例） |
| register 验收锚 | `production-readiness-remediation-register.md:56`（PRD-TEST-017 关闭验收四件）· `:151`（代码锚三件） |
| 设计锚 | `architecture/ai/classifier-router-tier.md`（规则→小分类器→便宜 LLM；fail-to-clarification；H19 temperature=0+prompt 版本钉）· `requirements/use-cases/rag-funnel-intent-routing.md` |
| 代码锚（read-only） | `packages/ai-runtime/src/router/index.ts`（`classify()` 规则占位骨架）· `packages/domain/src/job-route-classifier.ts:19/31/33`（8 叶词表 v1 + policy frozen）· `packages/db/src/job-route-decision.ts`（R2 状态机 · CLOSED 面）· `apps/worker/src/route-classify-consumer.ts`（MODEL-OP `job.route-classify.v1`）· `packages/domain/src/crag.ts` · `research-policy.ts` · `apps/worker/src/free-text-route-funnel.ts` |
| covered 面（不借） | `rag-funnel-01-08-covered-matrix.md:18-19`（FUNNEL-07/08 covered · coveredCount=8 · Ban 借其绿关 `:73`）· RAG02 fixture nail `line/rag02-nail` `6afd8c8f` |
| CMD 族 | `package.json:244-257`（rag03/04/05/06/07 prove 族 · **`rag05-qbank-miss:prove:252` 同名异义 Ban 碰撞**）· runner 剥清单 `scripts/run-e2e-isolated.mjs:1965-1972` |

## What future coding+prove must require（named here · Ban execute now）

See harness §2-§4. Headline：additive 模块 + 受控评测 harness（8 叶 allowlist · 漏斗序 · NEG/FAULT/BOUND/ADV 全断言 · PERF=P95/成本预注册 eval · LOAD 显式 blind）；Primary CMD `env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm gap-rag05-classifier:prove` 期望 EXIT 0 + 邻接 `rag07-free-text-route:prove`/`rag03-route:prove` EXIT 0；红名 → **EXIT1 保留** + `attempt-ledger.txt` 全录 + **Ban retry-to-green**（EXIT1 ≠ flake 洗白）；Route L 仅双审裁 + EXEC 显式授权后按预注册阈值/预算硬帽/Key 卫生执行单轮。**分类只建议 allowlisted track，不授读权；不得替代 R4**。EXIT0 ≠ GAP-RAG-05 closed ≠ 语义质量冻结 ≠ covered ≠ `:70`/`:71` close。

## Ban

Ban coding · Ban prove · Ban push · **默认禁 live**（Ban 未经 EXEC 显式授权带 Key/probe 真模型 · Ban Key echo/print/落盘/入 receipt/commit · Ban secrets/`.env*`）· Ban retry-to-green / 改断言凑绿 / 删断言 / 跳过失败段 / 弱化其余断言 · **Ban 把 EXIT1 洗成 flake** · **Ban 碰 `:70`/`:71` 已清面**（R2 fixture 面 · HNSW `0138`/`0139` · rag03-*/rag04-* 断言一字不动）· Ban close `:70`/`:71`/`:73` · Ban 碰既有 UC proof 族（**`rag05-qbank-miss` 同名异义** · rag06/rag07 · batch4 proof）· Ban CMD 名碰撞 · Ban 改 R2 状态机/HMAC/sticky 语义 · Ban 改词表/版本常量语义 · Ban 改 CRAG/research-policy/funnel consumer 语义 · Ban 替代/绕过/弱化 R4 硬过滤 · Ban 授读权/工具权 · Ban 兜底全量检索 · Ban 用户选桶 · Ban 把 CRAG/`researchBoundary` 洗成 router 证据 · Ban 宣称 `classify()` 骨架=语义分类器 · **Ban 碰已占用行/文件（UC-018/052/025/004/011/014/026/002/001/028/016/017）** · Ban MySQL FULLTEXT · Ban Qdrant vector truth · Ban covered flip / invent covered · Ban claim HA / claimProductionHA · Ban 翻行 · Ban buy cloud · Ban Meridian · Ban force-push · Ban G7 wash · Ban AN-CIMG-EA（HOLD）· Ban self-approve（alone ≠ dual）· Ban self-nail · Ban open MOP / A-seed / CIMG / AP ISO-banner · Ban 触 AO COND line files · **SSOT 仅 nail 期 additive**（backlog `:73`/checklist/register/matrix/queue 本 REQUEST 期零触碰）

Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · PERF eval-applicable · LOAD blind · liveDefault=OFF · backlog `:73` GAP-RAG-05 OPEN · backlog `:70`/`:71` OPEN · canHonestlyFlip=false.

*Slice · GAP-RAG-05 semantic classifier · 2026-10-07 · draft:awaiting_pre_exec_dual · `:73` OPEN · 两路线交双审裁 · 默认禁 live · Ban close · Ban coding · Ban retry-to-green · STOP*
