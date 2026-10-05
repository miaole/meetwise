# REQUEST — **NHP-001-NEG-01 · UC-001 NEG blind→case** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/nhp-001-neg-01-blind-to-case.md` · slice `nhp-001-neg-01-blind-to-case.slice.md`
**Parent tip**: `6a79946`（full `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df`）
**Date**: 2026-10-05

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

## 请审什么（mw-rag-route · 主链面 vs 旁证边界 · Ban wash 011/017 成 001）

Line Y · 选 NHP-001-NEG-01（非 UC-003）。请审：

1. **选刀**：黄金路径 P0 vs i18n P1 — 裁决是否成立。
2. **N1/N2 合同**：无额度/鉴权失败 → 拒 + 不落 active Interview；旁证 ≠ 本 case 收据。
3. **Ban live** · **Ban fake-green suite**（绿 ≠ e2e:isolated suite green / covered）。
4. **EXIT0 ≠ covered** · coveredCount=8 · Ban invent covered · Ban SSOT flip。
5. docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## mw-rag-route pre-exec · 2026-10-05T23:36:25+0800

**Status**: pre-exec · docs gate only · alone ≠ dual · 不代签 mw-e2e-ha · 不 nail · 不 coding
**审查对象**: REQUEST `48e2a3b6f552c3382f9ed25ffad4173686011edf`（短 `48e2a3b`）· harness `nhp-001-neg-01-blind-to-case.md` · slice `nhp-001-neg-01-blind-to-case.slice.md`
**origin tip（落笔）**: 见 push 后报告。`48e2a3b` 须为 origin 祖先。
**NORTH-STAR-EXECUTION-LOOP**: 再搜仍 **未找到**。门 = `north-star-hard-gates.md` + 本 harness/slice。
**Peer**: mw-e2e-ha stub 仍 PENDING（只读 · 不改 · 不代签）。

### 检查

1. **docs-only**：`git show --stat 48e2a3b` = 4 文件（harness + slice + dual stubs）· 零产品/proof 改动。通过。
2. **选刀**：矩阵 `:112` UC-001 NEG blind/case-only；NHP `:36` NHP-001-NEG-01 case-only；P0-3 vs UC-003/i18n P1——选黄金路径 NEG 成立。未碰 003/018/025/004/052。
3. **N1/N2 fail-closed（核 48e2a3b 产品树 · harness 合同 + 本审补锚）**：
   - harness N1：「零 entitlement → 业务拒 + 可解释错误码；不落 active Interview；额度账本无双扣」。产品实锚：`interview.service.ts:282-289` → `insufficient_entitlement` **402**（`HttpStatus.PAYMENT_REQUIRED`）；`reserveEntitlement`（`@meetwise/db`）。**条件**：后续 coding/prove 须钉此码与「reserve 前失败 → 无 Interview active / 无双扣」；harness 未写死 402 属欠钉非发明。
   - harness N2：「无/错凭证 → 401/403 族；无 Interview 行泄露」。产品实锚：`interview.controller.ts:15` `@UseGuards(PrincipalGuard)`；`principal.guard.ts:54` `invalid_token`、`:68` `unauthenticated` → **401** `UnauthorizedException`。通过。
   - 旁证 011/017/neg:auth ≠ 本 case 专用收据——harness 已 Ban wash。通过。
4. **拟 prove 离线**：`pnpm uc001:nhp-neg:prove`；**不加载 MODEL_API_KEY** · Ban live。EXIT0 = N1+N2 case 级证据（blind→case）**≠ covered**；EXIT1 诚实保留 · Ban retry-to-green。Ban fake-green suite / trio / `e2e:isolated` 绿叙事。既有 `uc001:live-blocked:prove` ≠ 本 NEG 收据。
5. **授权边界**：Ban coding · Ban invent covered · coveredCount=8。Pins：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · **PG-retained**（无 MySQL runtime / MemorySaver / Qdrant 主张）。UC-018/§1.1 仍 partial。

### 条件

1. Dual PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA。alone ≠ dual。
2. 不代签 peer。不碰其他 UC 行 / SSOT 翻转。
3. post-prove/coding 须把 N1 钉到 `insufficient_entitlement`/402 @ `interview.service.ts:284-289`，N2 钉到 PrincipalGuard 401 族；并显式断言无 active Interview、无额度双扣、无 live 模型 / 无凭空 `ai_invocation_trace` 副作用（若路径会触达）。
4. EXIT0 仅 case 证据；主链快乐路径仍可 blind；≠ UC-001 covered。

Verdict: PASS
