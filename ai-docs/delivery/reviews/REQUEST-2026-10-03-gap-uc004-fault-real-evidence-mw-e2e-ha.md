# REQUEST — **GAP-UC004-FAIL-A3 · FAULT real evidence** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha 视角）

C' FINAL `0652a08` 只钉「FAULT 仍 gap」；本刀 REQUEST 为 `GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` 求可复现故障注入真证据。请审：

1. **注入点可执行性**：FI-1 连接断（`pg_terminate_backend` 或等价）· FI-2 statement/pool 超时注入 · FI-3 图失败状态机（本树无接线 → 预期不可达，只能诚实 EXIT1）。注入路径= `POST /interview/:id/career-path`（`generateCareerPath` 唯一产品路径）。
2. **EXIT 契约**：EXIT 0 = FI-1/FI-2 每次 F1（响应可解释，非 200-假成功）+F2（`career_path` 无半写、GET 不返回失败产物）+F3（额度/计费账本净变 0，D1 不计费口径）全成立 **且** FI-3 观察到 `AiGraphRun=failed`+UI 降级+重试+额度不变；任一不成立/做不出 → **EXIT 1 诚实保留 gap**。EXIT 0 也不自动翻行：A3 关闭还须 post-prove dual + 协调方授权。
3. **隔离与安全**：prove 走 `scripts/run-e2e-isolated.mjs` 隔离惯例（同 `uc004:career-path:prove` 包装）；Ban secrets/`.env*`；`releaseEvidence=false`。
4. **口径**：现有 `pnpm uc004:career-path:prove` 是静态盘点+mark-red（S1–S5+G-GAP），EXIT0 ≠ FAULT 运行时证据 ≠ A3 关闭（C' 原钉）。receipt 落点 `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`。

Row **`UC-E2E-004`** FAULT column stays gap. Case `NHP-004-FAULT-01` stays gap. **Ban covered**. **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
