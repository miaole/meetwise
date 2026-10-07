# REQUEST — **G7 trio 带 Key 新鲜跑**（北星 G7 闸核心冲击刀 · AD P4 解锁刀 · ≠ suite green）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7-trio-keyed-fresh-run.md` · slice `g7-trio-keyed-fresh-run.slice.md`
**Base tip**: `50423a6f`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7K**

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
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained） |
| Trio | **OPEN 1/1/1**（retained · AC `7c818c5` + AD `880f144` EXIT 1/1/1 retained） |
| `techRoleFailClosedOptOutG7Only` | **true**（retained · Disclosure-1） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 诚实性 / HA 口径）

Line G7K · **G7 trio 带 Key 新鲜跑刀**（AD P4 解锁刀 · 北星 G7 闸核心冲击刀）。请审：

1. **跑法三要素（harness §2 · L 线 `g7-trio-current-state-alignment.md` §4 纪律沿用）**：committed SHA + frozen-lockfile + 独立 worktree；三条 CMD（`pnpm e2e:isolated` `:276` / `pnpm e2e:ui:isolated` `:277` / `pnpm verify:e2e-performance` `:280` @`50423a6f` 实测；解析链 iso→`run-e2e.mjs`、ui:iso→`run-e2e-ui.mjs`、perf→`run-e2e-performance-suite.mjs` 不变）**各自恰好一次**；单条 CMD 内部既有重试机制按其自身契约算一次 attempt（配置原值披露 · Ban 临时调高）；**每 attempt 全记录：CMD + EXIT + 起止时间戳 + 实跑 code SHA（receipt commit ≠ 实跑 code SHA）+ 环境探针 + 逐 case FAIL 明细**。
2. **wiring 行号漂移登记（harness §1）**：AC 钉定 `:251/:252/:255` → G7B 实测 `:260/:261/:264` → 本刀 `:276/:277/:280` @`50423a6f`——漂移如实登记、历史收据不改写；EXEC 时 tip 前移则按「按当 tip 重核行号」重测回填。gate blob `c655235c`/`aa86fb3f` 零漂移。
3. **期望诚实双向（harness §3 · e2e-ha 首责）**：带 Key 后三 gate 应解除、**真目标 = 翻绿**；任何红如实收——EXIT1 原值 + 逐 case FAIL 明细（case 名/原因/分类 api/fixture/env-gap/frontend/provider）→ 产品缺陷登记 backlog（修复另刀）；**Ban 假绿 · Ban flake 记法（env-gap 可定性为 FAIL 原因但不得冲销 EXIT=1）· Ban 只留绿 attempt · Ban retry-to-green · Ban 为绿改产品**。
4. **环境缺口诚实（harness §2.5）**：本机 macOS host ≠ 历史 Linux box——docker/chromium/pnpm/DB 探针逐 attempt 记录；env 缺口如实记 env-gap 类 FAIL 原因；chromium 可安装例外保留且逐条记录（**chromium ran ≠ UI green** · UI′ `post_prove_dual_pass:honesty_red` retained 惯例）；docker 组激活仅限 `with-docker-session.sh` 先例（Ban sudo/chmod/usermod/setfacl · 本机不可行则如实记 env-gap 不发明替代路径）。
5. **夹具披露保持**：R5-MARKED-RED `E2E_ISOLATION_STACK=pgvector-legacy`（BUG-E2E-ISO · G6 still OPEN）原样披露；本刀**不修夹具**（G7B Q1/Q2/Q3 排队 ≠ 授权 · 各须另刀）；R5 步绿 ≠ sole-stack ≠ RAG migrated ≠ G6 closed。
6. **收据与口径（harness §4）**：`receipts/g7-trio-keyed/` 3 per-CMD + SUMMARY；归档（A″/FIX/AC/AD/U/L/G7B）零改写；**`g7SuiteGreen=false` 保持至三条全绿 + post-run dual BOTH PASS + 协调方 nail**；单条绿 ≠ trio 绿；trio 绿 ≠ suite green ≠ HA ≠ SLO/LOAD ≠ covered ≠ `releaseEvidence=true`；`EXIT=0 ≠ 0 BUG ≠ fixed`；not_run ≠ pass；SSOT 留 nail 阶段。
7. **Ban live 侧纪律（与 model-op 分工共守）**：Key 只经进程环境 · Ban `.env*` · Ban Key 值/fingerprint 入树；live 调用面如实披露（text chat + embed 族 · voice/OCR/ASR/TTS honest capability skip = 0 调用且 Ban 洗 skip-as-pass）；`actualSpendCny=null` 沿 I 线。
8. **边界**：本 REQUEST turn docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push/force-push · Ban SSOT · Ban 碰 sibling 归档 · ERRATUM 措辞冻结（观察=`3424dc1` · 消除轮=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban `b1d7b22`@09-23）。

Trio stays **OPEN 1/1/1**. `g7SuiteGreen=false`. `r1Closed=false`. Disclosure-1 **OPEN**. **Key set ≠ auto green** · chromium ran ≠ UI green · capability skip ≠ voice green · gate 解除 ≠ case 全过 · **Ban 假绿叙事**.

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权实跑；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。
