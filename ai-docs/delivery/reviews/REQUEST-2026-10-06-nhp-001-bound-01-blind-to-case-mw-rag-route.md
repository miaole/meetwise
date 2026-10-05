# REQUEST — **NHP-001-BOUND-01 · UC-001 BOUND blind→case** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/nhp-001-bound-01-blind-to-case.md` · slice `nhp-001-bound-01-blind-to-case.slice.md`
**Parent tip**: `94a8b2a`（full `94a8b2aead1b7087115a0ac1af9f790ef2a8f177`）
**Date**: 2026-10-06

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

## 请审什么（mw-rag-route · 主链 BOUND vs 017 旁证边界 · Ban wash）

Line AB · 选 NHP-001-BOUND-01（非 ADV / 非 UC-003 / 非 banned UCs）。请审：

1. **选刀**：黄金路径 BOUND（P0）在 Line Y NEG 之后 vs ADV / i18n P1 / 015-FAULT — 裁决是否成立。
2. **B1 合同**：同幂等键重复 begin → 单 ConsumptionRecord / 无双扣；UC-017 旁证 ≠ 本 case 收据。
3. **Ban live** · **Ban live default** · **Ban fake-green suite**（绿 ≠ e2e:isolated suite green / covered）。
4. **EXIT0 ≠ covered** · coveredCount=8 · Ban invent covered · Ban SSOT flip。
5. docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail。
6. 专家对 mw-e2e-ha + mw-rag-route（非 mw-model-op）是否成立。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## mw-rag-route pre-exec · 2026-10-06T00:15:40+0800

**Status**: pre-exec · docs gate only · alone ≠ dual · 不代签 mw-e2e-ha · 不 nail · 不 coding
**审查对象**: REQUEST `c6dd1a67fc6b6ef4c2dfad0f9a5beff9791d657b`（短 `c6dd1a6`）· harness `nhp-001-bound-01-blind-to-case.md` · slice 同名
**Stub 路径**: tip 上确为 `REQUEST-2026-10-06-nhp-001-bound-01-blind-to-case-mw-rag-route.md`（与任务名一致）。
**NORTH-STAR-EXECUTION-LOOP**: 见 AA 注；本审门 = `north-star-hard-gates.md` + harness/slice。
**Peer**: mw-e2e-ha stub PENDING（不代签）。

### 检查

1. **docs-only**：`git show --stat c6dd1a6` = 4 文件（harness+slice+dual stubs）· +185 · 零产品/proof。通过。
2. **BOUND 合同 B1（幂等 begin）**：同 principal + 同幂等键连续两次开面 → 至多一条 ConsumptionRecord / 无双扣；第二次幂等安全。旁证 B2：UC-017 ≠ 本收据。**未**扩到「同键异 body→409/422」或显式并发双发——scope 仅 B1 顺序重放，可接受。
3. **产品锚点（核 c6dd1a6 · 非发明）**：
   - `interview.controller.ts` `POST :id/begin`（约 `:22-25`）**无** `Idempotency-Key` header；幂等键 **≠** HTTP 头，而为 **interview id** 传入 `reserveEntitlement`。
   - `interview.service.ts:197-198` `pg_advisory_xact_lock('begin', id)`；`:287+` 已有 start job → `alreadyBegun: true`（约 `:263` 在截段）；`:271` `reserveEntitlement(c, principal, id, 'mock_interview', 1.0)`。
   - `packages/db/src/commerce.ts` `reserveEntitlement`：`ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING` → `duplicate`（约文件头注释 + INSERT 段）。
   - **结论**：产品**已有** begin 幂等/无双扣守卫（非「完全未接线」）。本刀缺口是 **UC-001 专用 BOUND prove 收据**（blind→case），不是从零接线。harness 写「口未接线→EXIT1」应读成「无本 case prove / 断言未固化则红」——**条件**：prove 文案勿假装产品零幂等；若现树上 prove 因环境失败须 EXIT1 诚实保留。
4. **与 Line Y 分离**：Y = NEG N1/N2；本刀 BOUND；Ban 洗 Y EXIT0；Ban 改 Y proof/receipts。harness 已钉。通过。
5. **FUNNEL**：仓库 `TC-RAG-FUNNEL-*` / G-R4-5 FUNNEL 族在 `ai-docs/testing/traceability-baseline.json` 与 `apps/worker/src/r4-funnel-*`。本 REQUEST/harness **零触及** FUNNEL 叙事/关账。无假关。通过。
6. **证据层**：拟 CMD `pnpm uc001:nhp-bound:prove` → **`scripts/run-e2e-isolated.mjs`** · Ban MODEL_API_KEY · Ban live。**单一**隔离 PG 层（非「隔离壳三层 + 形态对齐 in-process」混写）。对 DB UNIQUE / ledger 计数合适。未用 fake DB 宣称并发唯一约束 → 不触发硬 FAIL。**条件**：若日后改成 in-process fake 却仍叙述隔离 PG/竞态唯一，须另审 FAIL。
7. **正控 / 可红**：首次 begin 须 202 + 单 consumption；重放 `alreadyBegun` + ledger 不变；断言 exact status（非 `>=400`）；API/DB 未就绪不得 skip-to-green。EXIT1 保留 · Ban retry-to-green。
8. **范围 / Pins**：Ban 018/052/025/004/011；coveredCount=8；PG-retained；EXIT0≠covered；专家对 e2e-ha+rag-route（非 model-op）成立。

### 条件

1. Dual PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA。alone ≠ dual。
2. prove 钉：幂等键=interview id；首 beg 202；重放 alreadyBegun/同 jobId；consumption 恰 1；零双扣；`ai_invocation_trace` 不因重放增生（若路径触达）。
3. 不代签 peer；不碰 Y 收据；不碰 FUNNEL。

Verdict: PASS
