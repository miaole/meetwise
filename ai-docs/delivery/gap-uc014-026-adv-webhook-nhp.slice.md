# Slice — **NHP-014-ADV-01 · UC-E2E-014·026 webhook ADV 真证据**（docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · row stays gap · ADV is not closed）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-03
**Base**: `origin/feat/mysql-schema-skeleton` · `0345315d19c92f038519e6e4b5ebd680f36c6441`（Line K worktree `meetwise-line-k` · branch `line/k-next-nhp`）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove 执行 · Ban push · Ban invent a fix · Ban self-approve

## One-line

矩阵 `NHP-014-ADV-01`（`non-happy-path-perf-load-case-matrix.md:60`，gap→case-only）+ §1.0.1 `UC-E2E-014/026` ADV **gap**（「重放/篡改七类未全铺」）。本刀为该行求**七类 webhook ADV 真证据**：C1 伪造签名 / C2 缺字段 / C3 篡改金额（结构性无金额通道，如实断言）/ C4 同单重放 / C5 跨订单重放 / C6 并发乱序重复 / C7 未知单冒充 owner。**不是**把 `neg:commerce` §4 或 `full.e2e` 错签 403 的子集断言当七类已全铺——两者均无独立七类收据、无 PaymentOrder 零副作用快照，且 full.e2e 面 Key-blocked。

## 选行理由（Line K）

- 排除清单：UC-018（flip-ban FINAL 线）· UC-052（F/G/A' 线 · partial）· UC-025（B'/H/B'' 门锁）· UC-004（C'/C'' 线）。
- 未占用 gap|blind 行中无 P0-backlog 具名对等行（GAP-RAG-03 是 ADR 方向行；GAP-PRIV-\* 冻结/占用/另包）。
- 本行信息最全（需求源 E-flow+验收+TC 三件套齐备）且产品接线真实（`commerce.service.ts:56-68` HMAC fail-closed + owner-gateway + exactly-once CAS），钱路径优先，prove 可落地性最高。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc014-026-adv-webhook-nhp.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-03-gap-uc014-026-adv-webhook-nhp-mw-e2e-ha.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-03-gap-uc014-026-adv-webhook-nhp-mw-rag-route.md` |

（本行非隐私域：commerce webhook ADV 无 PII/擦除面 → 双审维持 mw-e2e-ha + mw-rag-route，不换 mw-privacy-int。）

## Scope / Not

只做 UC-E2E-014/026 **ADV 列**的七类 webhook ADV prove REQUEST（case `NHP-014-ADV-01`）。NEG 面内嵌于 C1/C2/C3/C7 业务拒+错误码+零副作用断言（G7 硬闸）；NEG/FAULT/BOUND 列保持既有 partial 不动；PERF/LOAD **显式 blind**（本行无 PERF/LOAD case，Ban n/a 偷关）。Not UC-018。Not UC-052。Not UC-025。Not UC-004。不碰 UC-011 refund-callback（`NHP-011-ADV-01` 产品口缺失归其它刀）、UC-019、UC-033、RAG/R4/R5 行。不发明验收标准（口径以 `e2e-scenarios.md` UC-E2E-014/026 原文为准）。

诚实条款：若七类任一做不出/断言不成立（尤其 C3 金额通道与 C5 跨订单唯一性），**保持 gap**、如实落 receipt（`receipts/2026-10-03-gap-uc014-026-adv-webhook-nhp-prove.md`）。Ban invent fix。Ban 把「结构性无金额通道」改口为「已实现金额复核」。审计后置（GuardrailHit）只披露 observed/absent，不作 EXIT 门槛。

## Ban

Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权）· Ban push · Ban covered · Ban 翻任何 SSOT 行 · Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 任何行/文件 · Ban retry-to-green（attempts 全记录）· Ban 改 `neg-commerce.proof.ts` / `full.e2e.ts` 现有断言 · Ban self-approve（alone ≠ dual）。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503.

*Slice · NHP-014-ADV-01 · UC-E2E-014·026 ADV · webhook seven-class evidence · awaiting_pre_exec_dual · gap · STOP*
