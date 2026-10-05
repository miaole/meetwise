# REQUEST — **G7 trio 新鲜跑刀**（committed SHA 新鲜 CMD+EXIT 收据 + 逐 case FAIL 明细）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`
**Knife**: `harness/g7-trio-fresh-run.md` · slice `g7-trio-fresh-run.slice.md`
**Parent tip**: `377e7fc`（fetch 后 origin tip 实测 · `377e7fc4fa1b35b85ebf524b668469caf66de2bc` · not a prove tip）
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
| `g7SuiteGreen` | **false**（retained） |
| `r1Closed` | **false**（retained） |
| `techRoleFailClosedOptOutG7Only` | **true**（retained） |

## 请审什么（mw-model-op 视角）

Line U · G7 北星硬闸要求全量 CMD+EXIT 收据；冻结 trio（`pnpm e2e:isolated` @`package.json:246` · `pnpm e2e:ui:isolated` @`:247` · `pnpm verify:e2e-performance` @`:250`，均 @`377e7fc`）自 FIX（2026-09-17 · prove `a4e3de5`）后**零实跑**，trio **OPEN 1/1/1**。本刀在 committed SHA 上首次产出三条 CMD 的新鲜 CMD+EXIT 收据并逐 case 定位 FAIL 明细。请审：

1. **Ban live（硬 · model-op 首责）**：真实模型 API 调用**零次**（chat / embed / rerank / asr / tts / stream 全族）；**不加载 Key**（无 `load-model-api-key.sh`、无 NEW_SHELL_STATUS probe、无 Key fingerprint 计算、无 `.env*` 读取）；`actualSpendCny=null` · No invented spend。与 Line C live chat-only（2026-10-02 · 单 settled call · receipt `7eb1a7e`）**互不替代**：那次不是 trio run，这次是 Key-blocked fail-closed trio run，两者都不构成 trio green。
2. **Key-blocked fail-closed 如实记录**：无 Key 时 iso / perf 的 live 相关路径按产品既有 fail-closed 行为（`generation_provider_not_configured` / Key-blocked / `g7_path_disabled:<capability>` 家族）失败是**预期行为**，须作为 FAIL 原因如实入账；**Ban 顺手装 Key / 复制 Key 进 vision/ASR/TTS 槽位 / 改环境蒙混**；Ban 把 Key-blocked 说成 pass 或 not_run。历史 Key-set 403 `AllocationQuota.FreeTierOnly`（FIX 收据 CMD#1）root cause 已于 `b1d7b22`（2026-09-23）移除，但 **quota-403 removed ≠ trio green ≠ suite green**（G7 FR3 nail 原文口径）。
3. **跑法纪律三要素**（L 线 `g7-trio-current-state-alignment.md` §4 沿用）：committed SHA（`377e7fc` 或协调方重钉 origin tip）+ frozen-lockfile + 独立 worktree；三条 CMD **各自**独立 attempt 记录（CMD + EXIT + 时间戳 + **实跑 code SHA**；receipt commit ≠ 实跑 SHA）；引用行号一律附 @SHA 或按当 tip 重核（本刀实测 `377e7fc` wiring 已从 L 线 `0cf8591` 的 +2 漂移到 +6，见 harness §1）。
4. **预期 EXIT=1（诚实）· 恰一次**：本刀**不是翻绿刀**——每条 CMD 恰一次，红了不重跑；**Ban retry-to-green · Ban 只留绿 attempt · Ban 把 EXIT=1 记 flake / 环境偶发冲销**（环境缺口可如实定性 env-gap 但必须作为 FAIL 原因入账，EXIT=1 就是 1）。
5. **收据落点与内容**：`ai-docs/delivery/receipts/g7-trio-fresh/` 三份 per-CMD receipt（`e2e-isolated.md` / `e2e-ui-isolated.md` / `verify-e2e-performance.md`）+ `SUMMARY.md`；逐 case FAIL 明细（case 名 + 原因 + 分类 api/fixture/env-gap/frontend）+ 环境缺口披露 + Ban live 声明（调用 0 次）；**Ban secrets / Key / `.env*` 内容入树入 receipt**；原始日志落 `.tmp/` 不入 git。
6. **诚实条款**：`g7SuiteGreen=false` 保持；**跑绿任何一条也绝不宣称 suite green**（三条全绿才讨论，且仍须 post-run dual + 协调方授权 + nail 登记）；**Ban 假绿 suite 叙事 · Ban「quota-403 removed ⇒ trio green」**。
7. **边界**：零产品代码改动 · 零 prove 脚本改动（`run-e2e*.mjs` / `package.json` / lockfile 零触碰）；SSOT（backlog / checklist / 矩阵 / north-star）零触碰——trio 状态翻转与 gap id 登记留 nail 阶段且须协调方另行授权；**push 禁止**；playwright chromium **可装**（测试浏览器非 Key），安装动作逐条记录且 chromium ran ≠ UI green。
8. **Disclosure-1 retained**：`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` = non-production role path · never counts toward R1 · `techRoleFailClosedOptOutG7Only=true` 须持续披露；本刀任何收据不得抹除该披露。

Trio stays **OPEN 1/1/1**（收据不自动翻转状态）. `g7SuiteGreen=false`. R1 **OPEN**. Disclosure-1 **OPEN**. 历史 EXIT **1/1/1** retained · 预期实跑 **EXIT=1（诚实）**. **Ban covered** · coveredCount=8. **Ban 假绿 suite 声明**。本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权 prove 执行；implementer 不自批。Dual PASS ≠ coding ≠ 实跑 ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
