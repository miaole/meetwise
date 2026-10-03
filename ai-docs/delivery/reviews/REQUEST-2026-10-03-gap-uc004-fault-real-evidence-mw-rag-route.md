# REQUEST — **GAP-UC004-FAIL-A3 · FAULT real evidence** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc004-fault-real-evidence.md` · slice `gap-uc004-fault-real-evidence.slice.md`
**Parent tip**: `f3cf84c`（series open · not a prove tip）
**Date**: 2026-10-03

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

## 请审什么（mw-rag-route 视角）

C' FINAL `0652a08` 只钉「FAULT 仍 gap」；本刀 REQUEST 为 `GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` 求可复现故障注入真证据。请审：

1. **注入点设计**：FI-1 连接断（杀 PG 连接）· FI-2 依赖超时（statement/pool timeout）· FI-3 图失败状态机（本树无 AiGraphRun(career-path) 接线，预期不可达）。注入路径= `POST /interview/:id/career-path`（`generateCareerPath` 唯一产品路径）。
2. **EXIT 契约**：EXIT 0 = FI-1/FI-2 的 F1（响应可解释）+F2（无业务事实污染）+F3（额度净变 0）全成立 **且** FI-3 可达并观察到 `AiGraphRun=failed`+降级+重试+额度不变；否则 **EXIT 1 诚实保留 gap**，如实落 receipt。Ban 把 EXIT1 记成 flake。
3. **诚实条款**：Ban 伪造 `AiGraphRun=failed`；Ban 用同步 derive 5xx 冒充图失败；Ban invent fix；若做不出/关不了 → 保持 gap。
4. **口径**：不把 `pnpm uc004:career-path:prove` mark-red EXIT0 当 A3 关闭（C' 原钉）。receipt 落点 `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`。

Row **`UC-E2E-004`** FAULT column stays gap. Case `NHP-004-FAULT-01` stays gap. **Ban covered**. **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
