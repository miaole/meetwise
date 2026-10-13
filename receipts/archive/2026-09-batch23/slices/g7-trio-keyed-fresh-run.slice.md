# Slice — G7 · **trio 带 Key 新鲜跑**（Line G7K · docs REQUEST · `draft:awaiting_pre_exec_dual`）

**配套**: harness `harness/g7-trio-keyed-fresh-run.md`（SSOT 细节以 harness 为准）· 双审 stub `reviews/REQUEST-2026-10-07-g7-trio-keyed-fresh-run-mw-model-op.md` + `reviews/REQUEST-2026-10-07-g7-trio-keyed-fresh-run-mw-e2e-ha.md`
**Base**: `origin/feat/mysql-schema-skeleton` `50423a6f` · worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7k` · branch `line/g7k-trio-keyed`
**本 turn 边界**: docs-only 一次 commit · Ban coding · Ban prove 执行 · Ban live（本 turn 零调用零 Key 加载）· Ban push · Ban SSOT · Ban 碰 sibling 归档 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT

## 范围（REQUEST 要点五条）

1. **跑法**：committed SHA（协调方 EXEC 时重钉；默认本刀 line 分支 tip `50423a6f` 系）+ `pnpm install --frozen-lockfile` + 独立 worktree；**Key 只经进程环境**（`source ~/.meetwise-secrets/load-model-api-key.sh` 或等价 · Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit）；三条 CMD（`pnpm e2e:isolated` `:276` / `pnpm e2e:ui:isolated` `:277` / `pnpm verify:e2e-performance` `:280` @`50423a6f`）**各自恰好一次**——单条 CMD 内部既有重试机制按其自身契约算一次 attempt（配置原值披露 · Ban 临时调高）；每 attempt 全记录：CMD+EXIT+起止时间戳+实跑 code SHA+环境探针+逐 case FAIL 明细。环境探针必做：本机 macOS ≠ 历史 Linux box（AC Path A host）；docker/chromium/pnpm 逐项；env 缺口如实记 env-gap 类 FAIL 原因；chromium 可安装例外保留（**chromium ran ≠ UI green**）；docker 组激活仅限 `with-docker-session.sh` 先例路径（Ban sudo/chmod/usermod）。
2. **期望（诚实双向）**：AD P4 解锁账 U1（用户供给 Key · 协调方探测 HTTP 200）+ U2（用户授权）已满足 → **Key-blocked 三 gate（`run-e2e.mjs:43` blob `c655235c` / `run-e2e-ui.mjs:48` blob `aa86fb3f` @`50423a6f` 零漂移 + perf HTTP 级联）应解除**——**真目标 = 翻绿**（G7 全量收据核心；quota 已由消除轮 `82981ff` 移除，业务 case 首次真实执行）。任何红如实收：EXIT1 原值 + 逐 case FAIL 明细（case 名/原因/分类）→ **产品缺陷登记 backlog（修复另刀）**；Ban 假绿 · Ban flake 记法（env-gap 可定性为 FAIL 原因但不冲销 EXIT=1）· **Ban 为绿改产品**（EXEC 期顺手修 = 违纪）。
3. **收据落点**：`ai-docs/delivery/receipts/g7-trio-keyed/`——3 per-CMD（`e2e-isolated.md` · `e2e-ui-isolated.md` · `verify-e2e-performance.md`）+ `SUMMARY.md`；归档收据零改写；evidenceOfRecord/SSOT 登记**留 nail 阶段**。**`g7SuiteGreen=false` 保持至：三条全绿 + post-run dual BOTH PASS + 协调方 nail**（缺一不翻转；单条绿 ≠ trio 绿；trio 绿 ≠ suite green——G6 OPEN / R5-MARKED-RED / Disclosure-1 OPEN 独立核算）。
4. **预算披露**：live 调用仅 text chat + embed 族（voice/OCR/ASR/TTS 无 DASHSCOPE key → honest capability skip = 0 调用）；数量级**上限约 200 次**（估计 · 以 machine receipt 实测为准）；**额度上限以协调方 EXEC 指令为准，超限即停如实记中止**；**`actualSpendCny=null` 沿 I 线**（No invented spend · 金额须协调方另给计价依据）。
5. **AD P4 兑现状态**：U1 满足（Key 供给）· U2 满足（用户授权 · cap 待 EXEC 下达）· **U3 = 本 REQUEST + pre-exec dual（mw-model-op + mw-e2e-ha · alone ≠ dual）** · **U4 = 协调方 EXEC 时显式授权（待下达 · 双审 PASS ≠ 实跑授权）** · U5 in force（Ban fake key/fake-model/fake service flags/Ban 改 `run-e2e*.mjs` · `run-e2e.mjs:42` `fake_service_mode_forbidden` 守门在位）。

## ERRATUM（retained · 原文措辞）

FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban 写 `b1d7b22` @ 09-23 为该移除。

## Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not suite green · not trio green · not fixed · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · not live（本 turn）· not coordinator authorize（U4 待 EXEC）· Key set ≠ auto green · gate 解除 ≠ case 全过 · trio OPEN 1/1/1 · 历史 EXIT 1/1/1 retained · `actualSpendCny=null` · alone ≠ dual

## Pins（原值 + retained）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false`（retained · 至三绿+post-dual+协调方 nail）· `r1Closed=false`（retained）· `techRoleFailClosedOptOutG7Only=true`（retained · Disclosure-1 OPEN）· trio OPEN 1/1/1 · STOP

---
*Slice · G7K trio keyed fresh run · 2026-10-07 · draft:awaiting_pre_exec_dual · docs-only · 真目标=翻绿 · 红如实收 · Ban 假绿/flake 记法/为绿改产品 · Key 只经进程环境 · 每 CMD 恰一次 · STOP*
