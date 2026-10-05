# Slice — G7 · **trio 新鲜跑刀**（Line U · NAIL · **`post_prove_dual_pass`**）

**状态**：**`post_prove_dual_pass`**（Line U nail · honesty of red · trio stays **OPEN 1/1/1** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · R1 **OPEN** · Ban fake green / Ban suite green / Ban covered flip · Ban coding · Ban live · Ban Meridian）

> REQUEST-era historical status was `pending:awaiting_pre_exec_dual`. Prove tip `9ff3daf` · code `e8c63a9` · EXIT 1/1/1 · post dual `4562644`+`580edc7` BOTH PASS. Lifecycle advanced by this nail only.
**日期**：2026-10-05 · base tip（fetch 后 origin tip 实测）：**`377e7fc`**（`377e7fc4fa1b35b85ebf524b668469caf66de2bc` · docs(delivery): NAIL NHP-002-ADV-01 GAP-UC002-ADV-LED-CROSSUSER evidence post_prove_dual_pass · not a prove tip）
**worktree**：`/Users/miaole/Desktop/golucky/meetwise-line-u`（branch `line/u-g7-trio-fresh` · 自 `origin/feat/mysql-schema-skeleton`）
**性质**：在 committed SHA 上**首次产出**冻结 trio 三条 CMD 的新鲜 CMD+EXIT 收据（G7 北星硬闸要求全量收据；trio OPEN 1/1/1 是当前最大缺口之一）· **预期 EXIT=1（诚实）**——本刀目的不是翻绿，是产收据 + 精确定位三条 CMD 各自 FAIL 明细（哪些 case、什么原因），为后续修复刀排队。

---

## 产物

| 角色 | 路径 |
|------|------|
| Harness（执行计划） | `ai-docs/delivery/harness/g7-trio-fresh-run.md` |
| 本切片索引 | `ai-docs/delivery/g7-trio-fresh-run.slice.md` |
| REQUEST · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-05-g7-trio-fresh-run-mw-model-op.md` |
| REQUEST · e2e-ha | `ai-docs/delivery/reviews/REQUEST-2026-10-05-g7-trio-fresh-run-mw-e2e-ha.md` |
| 收据落点（实跑授权后落盘 · 本 REQUEST 不预建不预填） | `ai-docs/delivery/receipts/g7-trio-fresh/`：`e2e-isolated.md` · `e2e-ui-isolated.md` · `verify-e2e-performance.md` · `SUMMARY.md` |
| L 线纪律前置（只读依据） | `harness/g7-trio-current-state-alignment.md` · `harness/g7-trio-offline-receipt-index-alignment.md` |
| SSOT 硬闸（只读 · 零触碰） | `north-star-hard-gates.md` **G7** · `execution-master-checklist.md` G7 段（`:492`）· `gap-bug-backlog.md:98/:128/:181` |

## 范围（授权后实跑 · 逐条）

1. **跑法**：committed SHA（`377e7fc` 或协调方重钉的更新 origin tip）+ `pnpm install --frozen-lockfile` + 独立 worktree；三条 CMD **各自独立** attempt 记录（CMD + EXIT + 时间戳 + 实跑 code SHA；receipt commit ≠ 实跑 SHA）。
2. **每条 CMD 恰一次**：红了不重跑；Ban retry-to-green · Ban 只留绿 attempt · Ban 把 EXIT=1 记 flake。
3. **收据**：三份 per-CMD receipt + `SUMMARY.md`；每份含逐 case FAIL 明细（case 名 + 原因 + 分类 api/fixture/env-gap/frontend）与环境缺口披露。
4. **Ban live**：真实模型 API 调用 0 次；不加载 Key、不读 `.env*`；Key-blocked 路径 fail-closed 如实记录为 FAIL 原因；playwright chromium **可装**（测试浏览器非 Key），安装动作逐条入 receipt。
5. **诚实**：`g7SuiteGreen=false` 保持；跑绿任何一条**不**宣称 suite green（三条全绿才讨论）；EXIT 全部如实。

## 非范围（Ban）

自批 pass；翻 SSOT 行 / trio 状态（nail 阶段才登记）；改产品代码 / prove 脚本 / `package.json` / lockfile；改写历史收据（A″ `e697c81` · FIX `a4e3de5` · FR3 · Line C）；装 Key / 改环境蒙混；push / force-push；把 EXIT=0 冲销为 covered / suite green / HA / 0 BUG；发明 spend（`actualSpendCny=null`）。

## trio CMD 表（历史 EXIT · 本刀期望）

| CMD | wiring @`377e7fc` | 历史 EXIT | 历史失败一句话 | 本刀期望 |
|-----|-------------------|-----------|----------------|----------|
| `pnpm e2e:isolated` | `package.json:246` | **1** | Key set 时 live chat 403 `AllocationQuota.FreeTierOnly` → `questions=0`；夹具面 BUG-E2E-ISO · G6 OPEN | **EXIT=1 诚实** · 恰一次 · 逐 case 明细入 `e2e-isolated.md` |
| `pnpm e2e:ui:isolated` | `package.json:247` | **1** | 10 passed / 2 failed / 10 skipped · recruiting-bound timeout · chromium ran ≠ UI green | **EXIT=1 诚实** · 恰一次 · 逐 case 明细入 `e2e-ui-isolated.md` |
| `pnpm verify:e2e-performance` | `package.json:250` | **1** | migrate PASS 后 HTTP full E2E fail（`e2e_performance_suite_failed:HTTP full E2E:exit=1`） | **EXIT=1 诚实** · 恰一次 · 逐 case 明细入 `verify-e2e-performance.md` |

末次 trio 实跑 = **FIX**（2026-09-17 ~20:04–20:17 PT · prove `a4e3de5` · dual tip `5f591ea`）；A″（`e697c81`）先于 FIX（L 线时序更正）；此后 FR3 offline / Line C live chat-only / Line L 均 not_re_run。**本 REQUEST commit 不预claim 任何 post-commit EXIT。**

## 硬钉

- **预期 EXIT=1（诚实）**；EXIT=1 不是 flake、不是环境偶发冲销（env-gap 必须如实入账为 FAIL 原因）
- `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 **OPEN** · trio **OPEN 1/1/1**（实跑收据不自动翻转任何状态）
- **跑绿一条 ≠ suite green**；三条全绿才讨论（仍须 post-run dual + 协调方授权 + nail 登记）
- Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · quota-403 removed ≠ suite green
- Dual = mw-model-op + mw-e2e-ha；Dual PASS ≠ coding ≠ 实跑 ≠ nail；implementer 不自批

---

---

## Line U NAIL（`post_prove_dual_pass` · additive · 2026-10-05）

- Prove tip NAILED TO: `9ff3daf2ee7b9e5d355212d0e877f5b8be79db38` · prove code `e8c63a913a1e9af285f692bcab16f7593294d144` · EXIT **1/1/1**.
- POST dual BOTH PASS: mw-model-op `456264420d75c4beddd5eed56c31ecd5f956fb86` + mw-e2e-ha `580edc73e1c12271d60d5f0cb4b0ad5d7d2ddb0a`.
- FAIL classes: **env-gap**（`database_not_ready` / migrate EXIT1 → HTTP E2E not_run）.
- STILL_OPEN: trio OPEN 1/1/1 · g7SuiteGreen=false · Disclosure-1 OPEN · R1 OPEN.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.
- **ERRATUM**: FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban `b1d7b22` @ 09-23 for that removal.

---

*Slice · G7 trio 新鲜跑刀 · Line U NAIL · 2026-10-05 · lifecycle post_prove_dual_pass · prove tip 9ff3daf · EXIT 1/1/1 · g7SuiteGreen=false · Disclosure-1 OPEN · R1 OPEN · Ban fake/suite green · Ban covered flip · Ban live · releaseEvidence=false · STOP*
