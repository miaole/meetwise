# REQUEST — **NHP-025-FAULT-01 · UC-025 FAULT missing-expiry fail-closed** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/nhp-025-fault-01-missing-expiry-fail-closed.md` · slice `nhp-025-fault-01-missing-expiry-fail-closed.slice.md`
**Parent tip**: `f43bea1`（full `f43bea12fc7f2e28e7bb0052b6a80811eac47e91`）
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

## 请审什么（mw-rag-route · quiz/resume 跨图编排 · FAULT 诚实面）

Line AA · 选 **FAULT**（next non-BOUND after W）：NHP 序 #2 missing/NULL `expires_at` fail-closed。请审：

1. **选面诚实**：FAULT = absent expiry fail-closed；与 NEG（有锚且过期→`stale_quiz`）/ BOUND（`resume_version_mismatch` @W `2af0640`）正交——裁决是否成立。
2. **W nail honesty**：cite `2af0640` — BOUND EXIT0≠covered · evidence=in-process+fake-db ≠ PG/HTTP · BOUND 列仍 gap · Ban 借 BOUND/NEG 绿关 FAULT。
3. **blind→case/prove**：本 REQUEST 仅 docs 显式化；prove 拟 `uc025:nhp-fault:prove`；口未接线 → EXIT1 保留。
4. **Ban wash B'' NEG + Ban wash W BOUND**；Ban 编辑对应产品路径；Ban 把 quiz 图绿冒充 FAULT 关账。
5. **行 stays gap** · coveredCount=8 · Ban invent covered · Ban SSOT status 翻写。

Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
