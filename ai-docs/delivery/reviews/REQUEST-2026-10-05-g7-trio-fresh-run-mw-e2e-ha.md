# REQUEST — **G7 trio 新鲜跑刀**（committed SHA 新鲜 CMD+EXIT 收据 + 逐 case FAIL 明细）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha 视角）

Line U · trio 三条 CMD 历史 **EXIT 1/1/1**（末次实跑 = FIX 2026-09-17 · prove `a4e3de5` · A″ `e697c81` 先于 FIX），自 FIX 后零实跑、trio **OPEN 1/1/1**（`gap-bug-backlog.md:128/:181` · `execution-master-checklist.md:492`）。本刀产出新鲜 CMD+EXIT 收据 + 逐 case FAIL 明细，为修复刀排队。请审：

1. **历史失败明细基线是否如实钉定**（harness §2 · 引归档收据零改写）：
   - `pnpm e2e:isolated`（`package.json:246` @`377e7fc`）：FIX 21s · Key set 下 live chat **403 `AllocationQuota.FreeTierOnly`** → `questions=0` · `interview_unavailable` / `generation_provider_not_configured` · `failureClass=api` · R5-MARKED-RED pgvector-legacy；夹具面 **BUG-E2E-ISO**（`gap-bug-backlog.md:98`：宽 iso/perf 默认绑同一 pgvector 镜像 · 云 serial runner 拒全套）· **G6 still OPEN**。
   - `pnpm e2e:ui:isolated`（`:247`）：FIX 143s · **10 passed / 2 failed / 10 skipped** · recruiting-bound chromium+mobile `waitForURL(/interview/iv_…)` 30s timeout（live interview start 被同 quota 403 阻断）· `E2E_FAILURE class=frontend code=client_exited` · voice 诚实 capability skip · **chromium ran ≠ UI green**（UI′ `post_prove_dual_pass:honesty_red` retained）。
   - `pnpm verify:e2e-performance`（`:250`）：FIX 77s · migrate runner PASS 后 **HTTP full E2E fail**（`e2e_performance_suite_failed:HTTP full E2E:exit=1`）· ≠ SLO ≠ LOAD ≠ HA ≠ suite green。
2. **attempt 台账契约**：三条 CMD **各自**独立 attempt 记录——CMD + EXIT + 时间戳（开始/结束）+ **实跑 code SHA**（worktree HEAD 实测；receipt commit ≠ 实跑 SHA）；`pnpm install --frozen-lockfile` EXIT 亦记录；**每条 CMD 恰一次，红了不重跑**；**Ban retry-to-green · Ban 只留绿 attempt · Ban 把 EXIT=1 记 flake / 环境偶发冲销**。
3. **预期 EXIT=1（诚实）**：本刀不是翻绿刀；EXIT 全部如实（1 就是 1）；失败明细**逐 case 列出**（case 名 + 失败原因 + 分类 api / fixture / env-gap / frontend），粒度须可让后续修复刀直接排队，Ban 散文式「部分失败」带过。
4. **环境缺口的诚实定性**：无 Key（Ban live，本刀不加载）→ Key-blocked / fail-closed 路径失败是**预期**，定性为 **env-gap / api 类 FAIL 原因入账**，**Ban 顺手装 Key / 改环境蒙混 / 把 env-gap 冲销成 not_run**；playwright chromium **可装**（测试浏览器非 Key），install/version/smoke 逐条记录入 receipt，**CR chromium prereq 关 ≠ UI green**（0/0/0 先例 + UI′ honesty_red retained）；夹具面 BUG-E2E-ISO / G6 OPEN 限制如实披露，不 wash。
5. **收据落点与卫生**：`ai-docs/delivery/receipts/g7-trio-fresh/`（`e2e-isolated.md` / `e2e-ui-isolated.md` / `verify-e2e-performance.md` / `SUMMARY.md`）；每份含 CMD 原文、EXIT、时间戳、实跑 SHA、worktree/branch、install 记录、逐 case FAIL 明细、环境缺口披露、Ban live 声明（调用 0 次）；原始日志落 `.tmp/` 不入 git；**Ban secrets / Key / `.env*` 内容入树入 receipt**；`SUMMARY.md` 汇总 EXIT 表 + `g7SuiteGreen=false` 等口径原值；evidenceOfRecord / SSOT 登记留 nail 阶段。
6. **诚实条款与禁翻状态**：`g7SuiteGreen=false` 保持；**跑绿任何一条也绝不宣称 suite green**（三条全绿才讨论，且仍须 post-run dual + 协调方授权 + nail 登记）；**EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ 0 BUG ≠ fixed**；收据不自动翻转 trio 状态（OPEN 1/1/1 翻转留 nail）；**Ban 假绿 suite 叙事**。
7. **边界**：零产品代码改动 · 零 prove 脚本改动（`run-e2e*.mjs` / `package.json` / lockfile 零触碰）；SSOT 零触碰；历史收据（A″ / FIX / FR3 / Line C）零改写；**push 禁止**；Disclosure-1 retained（`techRoleFailClosedOptOutG7Only=true` 持续披露）。

Trio stays **OPEN 1/1/1**（收据不自动翻转状态）. `g7SuiteGreen=false`. R1 **OPEN**. Disclosure-1 **OPEN**. 历史 EXIT **1/1/1** retained · 预期实跑 **EXIT=1（诚实）**. **Ban covered** · coveredCount=8. **Ban 假绿 suite 声明**。本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权 prove 执行；implementer 不自批。Dual PASS ≠ coding ≠ 实跑 ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
