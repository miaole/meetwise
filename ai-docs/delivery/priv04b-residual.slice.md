# Slice — **PRIV4-B · GAP-PRIV-04 残余面侦察+收口**（0091 issuer 对齐残余拆解 + P0-CB-01 快照表 sink 候选裁决规则 · REQUEST docs-only · 只裁规则不建表 · backlog `:60` OPEN · DELETE=503 · PG-retained · ≠ AR `:64`）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 零 coding / 零 prove / 零 migration / 零建表 / 零 SSOT 编辑 · Ban coding until PRE dual BOTH PASS + 协调方 AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · **PG-retained** · public DELETE stays **503** · backlog `:60` OPEN · `:64` OPEN · UC-052 partial · canHonestlyFlip=false
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`9265e4d8`** / full `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`（CMOP03-D nail tip · 开工时点 origin 最新 tip · fetch + 二次复核零位移）
**Authority**: meetwise — docs-only REQUEST（§3 loop 第③步）· 本刀授权物 = 裁决规则入卷，**非** coding 授权 · implementer 禁自批
**Line**: **PRIV4**（队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:32`）

## One-line

前刀（0141 · `post_prove_dual_pass` · prove 33/33）后 backlog `:60` **GAP-PRIV-04** **stays OPEN**，残余=「仍 ≠ 0091 可写/对齐 / 公开 DELETE 仍 503」+ 协调项 (a)(b)。本刀侦察判定：**「0091 可写/对齐」的本地 coding 可推进面 = 空集**（DB 主链 issue→consume→claim→purge→receipt→guard 已由 0093/0125/0141 闭合到本地可证边界；残余未闭合子面全部落在用户闸/协调闸：生产 issuer key/JWS=cutover 门 1、公开 DELETE=门 4、INT sink='vector' 作用域键=门 3、`:60` 行翻行=SSOT 协调面、UC-052 与 `:64` 各归其闸）——据此不立 coding REQUEST；**本地可推进面 = 协调项 (a)**：为未来 P0-CB-01 快照表（候选·未建 · INSERT-only immutable 证据 vs subject-erase 互斥）立 **sink 候选裁决规则 R1–R6**（R1 逐列数据分类入域判据 · R2 0125/0141 机制全对形——immutable 约束 app_role 写路径、擦除走特权租约事务 · R3 DDL 与裁决同卷 Ban 未登记落表 · R4 B 端投影引用失效不删 B 端留存 · R5 沿 AR 诚实口径 · R6 编号顺延 Ban 抢号），交双审；本刀只裁规则**不建表**；协调项 (b) 公开 DELETE=503 与 INT-TRANSCRIPT-01 属用户闸零触碰。alone≠dual。

## Evidence（cite only · Ban re-prove · blob @ `9265e4d8`）

| Item | 锚 / note |
|------|------------|
| GAP-PRIV-04 行全文 | `ai-docs/delivery/gap-bug-backlog.md:60` · blob `2e569629aa51070ad9fe9ec45becf1762b5b40ee` · 残余原文「仍 ≠ 0091 可写/对齐 / 公开 DELETE 仍 503」 |
| 0125 全链先例 | `packages/db/migrations/0125_memory_vector_chunk_erasure.sql` · blob `22a7a3d4`（A sink CHECK additive / C 写围栏 42501 / E claim 十项 fail-closed / F purge 残留 55000） |
| 0141 DELETE fence 先例 | `packages/db/migrations/0141_vector_plane_erasure_receipt_fence.sql` · blob `9229b890`（唯一合法 DELETE 上下文 = purge 事务 target+lease · 42501） |
| 0091 冻结主链 | `packages/db/migrations/0091_privacy_authorization_issuer.sql` · blob `7dec21a0`（issue `:174-240` · consume `:249-295` · receipt `:418-452` · completed guard `:524-558`） |
| 0093 account 分支 | `packages/db/migrations/0093_memory_governance.sql:838-908` · blob `6db6678a`（0091 预留挂点 · subject=principal 本人 · resume 仍 22023） |
| worker tick 无 JWS 验签 | `packages/db/src/vector-plane-erasure.ts:97-126` · blob `13df30b3`（DB 十项链 + consumed-jti feed 为唯一裁定 → 门 1 用户闸锚） |
| 生产 issuer 现状锚 | checklist `:173`「`0091` issue 按调用方字段落账，本身不做 JWS 验签；privacy worker 仍走 `0077`，HTTP 未接线」· blob `3dc402aa` |
| P0-CB-01 验收 | `ai-docs/requirements/use-cases/product-readiness-c-b-audit.md:78-96`（ApplicationSnapshot 绑定 candidate/resume_snapshot_version/competency_snapshot/consent_version）· blob `8393c67b`（erratum 注登记全等 · 零字节纪律） |
| GAP-PROD-02 面 | backlog `:78` + `:777` erratum 立卷注（生效卷 `harness/gap-cb-audit-erratum.exec.md` · blob `ec232b03`） |
| sink inventory 维护规则 | `ai-docs/architecture/ai/privacy-deletion-sink-inventory.md` §5 围栏缺口 + §6 同变更维护规则 · blob `69806659` |
| DELETE=503 | `privacy.controller.ts:51-52` · blob `6a9e2026` · `harness/privacy-erasure-http-503-pin.md` |
| 前刀 nail | checklist `:1179-1184`（`post_prove_dual_pass` · 33/33 attempts 1,0 · STILL OPEN 清单） |

## Products

| Role | Path |
|------|------|
| Harness | `ai-docs/delivery/harness/priv04b-residual.md` |
| Slice | `ai-docs/delivery/priv04b-residual.slice.md`（本文件） |
| Dual stub `mw-privacy-int` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-priv04b-residual-mw-privacy-int.md`（PENDING · 不代填 Verdict） |
| Dual stub `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-priv04b-residual-mw-e2e-ha.md`（PENDING · 不代填 Verdict） |

**本 commit = 上述恰 4 文件 docs-only**（零 SSOT 编辑 · backlog/checklist/matrix/queue/audit 不在 diff · 零产品码 / migration / script / package.json）。

## Scope（拟 · 未授权 · PRE dual 裁定）

- **A 残余拆解（§2 · 判定记录非 coding 面）**：已对齐面 = DB 主链全链 + worker sweep 接线 + 0129 preview 账户轨复用；未对齐残余六面逐条归属用户闸/协调闸（生产 issuer 根=门 1 · DELETE=门 4 · INT 作用域键=门 3 · `:60` 翻行=协调 SSOT · UC-052 · `:64`）→ 本地 coding 可推进面=空集。
- **B 裁决规则（§3 · 本刀主交付）**：R1 逐列数据分类入域判据（个人数据→必入域；纯 HMAC→可不入域但必须盘点面登记诚实 disposition + 立后续行；逐列清单=EXEC 必备附件）· R2 机制 0125/0141 全对形（sink CHECK additive / INSERT-only=写路径约束非 purge 豁免 / erasure-active 写围栏 / DELETE fence 租约事务消解 immutable 互斥 / purge 残留 55000 / 0091 receipt 零语义改动 / claim 十项链）· R3 DDL 与裁决同卷 Ban 未登记落表（§6 维护规则先例）· R4 B 端投影引用失效不删 B 端留存 · R5 沿 AR 诚实口径 · R6 编号顺延 Ban 抢号（现 tip 至 `0142`）。
- **非目标**：建表 / sink CHECK 改动 / 任何 migration · 0091/0093/0125/0129/0141 语义 · DELETE=503 · INT-TRANSCRIPT-01 六门任一预授权 · `:60`/`:78` 翻行 · UC-052/`:64` flip · 个案预裁（规则 ≠ 个案）。

## Prove plan（本刀）

docs-only 零 prove · 零容器 · 零远程 · 零 `.env*`。唯一机检 = 锚在位性（§1 锚 file:line+blob 于被审 commit 逐条复核，双审独立执行）。未来 EXEC 面 prove 为引用性描述（隔离真 PG 具名 CMD · 0141 六件套同形 + R4 投影 intact · EXIT 契约 attempts 全录 Ban retry-to-green），不属本刀。

## Ban

Ban coding / prove 执行 / 建表 / migration / sink CHECK 改动 · **Ban 碰 DELETE=503 · Ban 动 INT-TRANSCRIPT-01 面 · Ban 预授权六门任一** · Ban 动 0091/0093/0125/0129/0141 语义 · **Ban 改共享 SSOT**（backlog/checklist/matrix/queue/audit 本体）· Ban 借 AR `:64` 证据/状态 · Ban 洗 OPEN 钉 · Ban count-as-erased · Ban 删 qbank/共享语料 · Ban 假造 INT 作用域键 · Ban UC-052 flip · Ban retry-to-green · Ban Meridian · **Ban secrets / `.env*`** · Ban buy cloud · Ban force-push · Ban push 主线/共享分支（交付 push 仅限本 docs-only REQUEST 分支）· Ban self-approve（alone ≠ dual）· Ban self-nail。

## Non-claims

Not a pass · not run · not built · not adjudicated per-case · not `:60`/`:78` flipped · not 0091-writable/aligned flipped · not covered · not closed · not vendor/cloud wiped · not open DELETE · not HA · not releaseEvidence · alone ≠ dual · 本 REQUEST docs-only（4 文件 · 零产品码 · 零 migration · 零 SSOT 编辑）。

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · public DELETE=503 · backlog `:60` OPEN · `:64` OPEN · UC-052 partial · canHonestlyFlip=false · **STOP**

---

*Slice · PRIV4-B GAP-PRIV-04 残余面侦察+收口 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · Ban coding until PRE dual BOTH PASS + 协调方 AUTHORIZE · 只裁规则不建表 · DELETE=503 · `:60` OPEN · PG-retained · alone ≠ dual · STOP*
