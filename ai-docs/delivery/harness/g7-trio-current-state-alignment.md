# Harness — G7 · **trio 现状对齐**（Line L · docs 执行产物 L2 · **`executed:awaiting_post_prove_dual`**）

**Status**: **`executed:awaiting_post_prove_dual`**（docs alignment only · **not a pass** · **≠ suite close** · **zero prove** · **zero live** · **zero code** · Ban自批）
**Date**: 2026-10-03
**产物定位**: 本文件 = harness `g7-trio-disclosure-techrole-honesty.md` §3 第 2 项「离线收据整理 / trio 现状对齐」的 L2 执行产物之一。授权链：REQUEST `56d9b3d`（tree-identical mirror `0345315`）→ pre-exec dual **BOTH PASS**（mw-model-op @`b8dfb62` + mw-e2e-ha @`a474ca4`）→ 协调方 standing authorize（docs 执行阶段）。
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained**: `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · `nail=false` · `actualSpendCny=null` · **trio OPEN 1/1/1** · Disclosure-1 **OPEN**
**配套产物**: `harness/g7-trio-offline-receipt-index-alignment.md`（离线收据索引 · 时序修正后）

---

## 1. trio 三条 CMD 现状（对齐复核 · 状态不变）

**Wiring 行号钉定（一律附 @SHA；实测）**：

| 行号 | @`320c07b` / @`0345315`（钉定 base） | @`0cf8591` / @`8dde8e3`（origin tip 后移 · 实测漂移 +2 行） |
|------|-----------------------------------|----------------------------------------------------------|
| `e2e:prove` | `:238` | `:240` |
| `e2e:ui` | `:239` | `:241` |
| `e2e:isolated` | `:240` | `:242` |
| `e2e:ui:isolated` | `:241` | `:243` |
| `verify:e2e-performance` | `:244` | `:246` |

解析链不变：`e2e:isolated` = `run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs`；`e2e:ui:isolated` = `run-e2e-isolated.mjs e2e:ui` → `run-e2e-ui.mjs`；`verify:e2e-performance` = `run-e2e-performance-suite.mjs`。

**逐一现状（与 REQUEST harness §1 一致 · 本刀零变化）**：

| CMD | 状态 | 历史 EXIT | 缺什么（收据 / 环境 / 纪律） |
|-----|------|-----------|------------------------------|
| `pnpm e2e:isolated` | **OPEN** · `not_run:no_coding_authorize` | **1** retained | 缺 quota-403 移除（`b1d7b22` @ 2026-09-23）后在已提交 SHA 上的新鲜 CMD+EXIT；Key set 时曾 **403 `AllocationQuota.FreeTierOnly`** → `questions=0` · `interview_unavailable` / `generation_provider_not_configured` · `failureClass=api`；夹具面 BUG-E2E-ISO（`gap-bug-backlog.md:98` @`0345315`：pgvector 绑定 · 云 serial runner 拒全套 PRD-TEST-008 · 拆分属 R5 阶段 3–4）· **G6 still OPEN**；R5-MARKED-RED retained；本刀 Ban live |
| `pnpm e2e:ui:isolated` | **OPEN** · `not_run:no_coding_authorize` | **1** retained | 缺新鲜 UI CMD+EXIT；末次（Key set + chromium ran）**10 passed / 2 failed / 10 skipped** · recruiting-bound timeout · stream/golden partial；CR chromium prereq 关（install/version/smoke 0/0/0）**≠ UI green**（UI′ `post_prove_dual_pass:honesty_red` retained）；本刀 Ban live |
| `pnpm verify:e2e-performance` | **OPEN** · `not_run:no_coding_authorize` | **1** retained | 缺新鲜 perf CMD+EXIT；末次 **migrate PASS 后 HTTP full E2E fail**（`e2e_performance_suite_failed:HTTP full E2E:exit=1`）；**≠ SLO ≠ LOAD ≠ HA ≠ suite green**（G6 OPEN）；本刀 Ban live |

**汇总口径（SSOT 现行 · 引用行号附 @SHA）**：
- 「Trio **OPEN** 1/1/1」＝ `gap-bug-backlog.md:128` @`0345315`（G7 FR3 nail）。
- 「Trio **not_re_run**, historical exit 1, **stay OPEN**」＝ `gap-bug-backlog.md:181` @`0345315` · `execution-master-checklist.md:492` @`0345315`（Line C live nail）。
- 收据 token `g7_hard_disabled` = **mapped not_run label**；运行时抛 `g7_path_disabled:<capability>`；两者均 **≠ pass**；Do not change code。

---

## 2. 时序更正（A″ 先于 FIX · model-op C-2 / e2e-ha C-1 落地）

**收据原文（归档 · 零改写）**：

| 收据 | Date 原文（:3） | prove / dual SHA |
|------|-----------------|------------------|
| A″ Key×3 re-run（`receipts/2026-09-17-g7-key-x3-rerun.md`） | 「2026-09-17 **~19:29–19:37 PT（execute）** · dual archived ~19:40 PT · nail ~19:50 PT」 | prove/dual **`e697c81`** |
| FIX Key×3 fix iso/UI/perf（`receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md`） | 「2026-09-17 **~20:04–20:17 PT（execute）** · tip pin ~20:19 PT · post-prove dual ~20:20–20:21 PT · nail ~20:23 PT」 | prove **`a4e3de5`** · tip at dual **`5f591ea`** |

**更正内容**：
1. **A″ 实跑（19:29–19:37 PT）早于 FIX 实跑（20:04–20:17 PT）**。正确顺序为 **A″ → FIX**。
2. Erratum：REQUEST stub（model-op）`:33`「**此后** A″（dual `e697c81`）EXIT 1/1/1」中「此后」为时序倒置措辞（model-op C-2 / e2e-ha C-1 登记）。stub 与两份归档收据**均不改写**（本刀禁改归档）；更正以本产物与后续 nail 阶段 SSOT 措辞为准。本文件及配套索引一律按 **A″ → FIX** 顺序表述，禁止把 A″ 写成 FIX 之后的复跑。
3. **材料事实不变**：两者均 EXIT **1/1/1** · `post_prove_dual_pass:honesty_red` **retained** · 均早于 `b1d7b22`（2026-09-23 quota-403 移除）· 均不构成 suite green。
4. **「末次 trio 实跑 = FIX」表述成立**（时间上 FIX 是最后一次 trio 实跑）；「A″ 先于 FIX」与「末次 = FIX」不矛盾：前者是 execute 顺序，后者是时间轴位置。

---

## 3. `not_run` 标记覆盖（本刀全量 · 逐一）

| 对象 | 标记 | 说明 |
|------|------|------|
| `pnpm e2e:isolated` | **`not_run:no_coding_authorize`** | prior EXIT=1 retained（末次实跑 = FIX，§2） |
| `pnpm e2e:ui:isolated` | **`not_run:no_coding_authorize`** | prior EXIT=1 retained |
| `pnpm verify:e2e-performance` | **`not_run:no_coding_authorize`** | prior EXIT=1 retained |
| 一切 `*:prove`（含 offline 单元 prove 如 `prove:g7-freetier-*`） | **not run this knife** | 本刀零 prove 执行；FR3 @`b1d7b22` offline EXIT=0 为历史单元 prove，≠ trio 证据 |
| 真实模型 API 调用（chat / embed / rerank / asr / tts / stream 全族） | **0 次** | Ban live；无 fetch、无调用安排 |
| Key 动作 | **0 次** | 无加载、无 NEW_SHELL_STATUS probe、无 fingerprint 计算、无 `.env*` 读取 |
| spend | **`actualSpendCny=null`** | No invented spend（本刀无任何消耗） |

> 标注惯例沿用：`not_run:no_coding_authorize`（FR3 / residual 先例）。本刀无任何新 EXIT 产生；本 commit 不预claim 任何 post-commit EXIT。

---

## 4. 口径保持（状态原值 · 禁翻绿暗示）

- `g7SuiteGreen=false` · `r1Closed=false` · Disclosure-1 **OPEN**（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` = non-production role path · **never counts toward R1** · `techRoleFailClosedOptOutG7Only=true` · 须持续披露）· `techRoleFailClosedOptOutG7Only=true` 原值 · trio **OPEN 1/1/1**。
- 本刀为**离线文档+收据对齐刀**：不产生任何 suite 新证据；禁止任何「已可翻绿 / 距绿一步 / 绿在望」暗示；quota-403 removed（residual CLOSED）**≠ suite green**（G7 FR3 nail 原文）。
- **未来授权跑纪律（e2e-ha C-2 / model-op C-4 · 沿用）**：逐 attempt 记录 **CMD + EXIT + 时间戳**（**含失败 attempt**）；记录**实跑 code SHA**（receipt commit ≠ prove SHA 惯例不变）；禁 retry-to-green、禁只留绿 attempt、禁把 EXIT=1 洗成 flake / 环境偶发；引用行号一律附 **@SHA** 或按当 tip 重核。

---

## 5. Non-claims

Not a pass · not suite green · not trio green · not family green · not fixed · not R1 closed · not TECH_ROLE closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail（SSOT 零触碰）· not new evidence · not run · not live · `g7SuiteGreen=false` · `r1Closed=false` · trio OPEN 1/1/1 · Disclosure-1 OPEN · EXIT 1/1/1 retained

---

*Harness · G7 trio 现状对齐 · Line L L2 执行产物 · 2026-10-03 · executed:awaiting_post_prove_dual · not a pass · A″（19:29–19:37 PT）先于 FIX（20:04–20:17 PT）· 末次 trio 实跑 = FIX（`a4e3de5`）· trio OPEN 1/1/1 · not_run:no_coding_authorize 全覆盖 · Ban live · 禁假绿 · g7SuiteGreen=false · Disclosure-1 OPEN · TECH_ROLE=0 ≠ R1 · releaseEvidence=false · zero prove · zero live*
