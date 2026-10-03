# REQUEST — **G7 trio / Disclosure-1 / TECH_ROLE=0 ≠ R1 honesty** · pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`
**Knife**: `harness/g7-trio-disclosure-techrole-honesty.md` · slice `g7-trio-disclosure-techrole-honesty.slice.md`
**Parent tip**: `320c07b`（origin `feat/mysql-schema-skeleton` tip · not a prove tip）
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
| `g7SuiteGreen` | **false**（retained） |
| `r1Closed` | **false**（retained） |

## 请审什么（mw-model-op 视角）

Line L · G7 遗留 honesty docs-only REQUEST：冻结 trio（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）历史 **OPEN 1/1/1** + **Disclosure-1** + **TECH_ROLE=0 ≠ R1** 口径钉；本刀默认离线文档+收据对齐。请审：

1. **Trio 现状钉是否属实、逐一完整**（harness §1）：
   - `pnpm e2e:isolated`（`package.json:240` → `run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs`）：缺 quota-403 移除（`b1d7b22` 及后）在已提交 SHA 上的新鲜 CMD+EXIT；Key set 时曾 **403 `AllocationQuota.FreeTierOnly`** → `questions=0` · `interview_unavailable` / `generation_provider_not_configured` · `failureClass=api`；夹具面 BUG-E2E-ISO / G6 OPEN；R5-MARKED-RED retained。
   - `pnpm e2e:ui:isolated`（`package.json:241` → `e2e:ui` → `run-e2e-ui.mjs`）：末次（Key set + chromium ran）EXIT=1 · **10 passed / 2 failed / 10 skipped** · recruiting-bound timeout · stream/golden partial；CR chromium prereq 关 ≠ UI green（UI′ honesty_red retained）。
   - `pnpm verify:e2e-performance`（`package.json:244` → `run-e2e-performance-suite.mjs`）：末次 migrate PASS 后 **HTTP full E2E fail**；SLO/LOAD/HA 证据缺（G6 OPEN）。
   - 末次 trio 实跑 = 2026-09-17 FIX（prove `a4e3de5` · dual tip `5f591ea`）；此后 A″（dual `e697c81`）EXIT 1/1/1；FR3 / Line C live（2026-10-02）均 **not_re_run · stay OPEN**。
2. **Disclosure-1 口径钉**：`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` = non-production role path · **never counts toward R1** · `techRoleFailClosedOptOutG7Only=true`（G7-only opt-out）；披露项 **OPEN** 须持续披露。禁叙事：Ban「TECH_ROLE=0 ⇒ R1 closed / fail-closed 已生产生效」· Ban「G7 e2e 绿 ⇒ 生产 role path 已 fail-closed」· Ban 抹除 Disclosure-1。
3. **TECH_ROLE=0 ≠ R1**：R1 **STILL OPEN**（`r1-real-close-ssot-flip`：SSOT NOT flipped）· `r1Closed=false`；Ban 跨口径引用（offline proves @ `b1d7b22` EXIT=0 / Line C 单 settled call EXIT=0 / CR chromium 0/0/0 任一 ≠ trio EXIT=0 ≠ R1 证据）。
4. **本刀范围**：docs 对齐 + **离线收据索引对齐**（harness §5，零新跑、零改写历史收据）；**不**宣称 suite green；`g7SuiteGreen=false` 保持；SSOT 行（backlog / checklist / 矩阵）**本阶段零触碰**，nail 阶段才改且须协调方另行授权。
5. **Ban live（硬）**：真实模型 API 调用零次（chat/embed/rerank/asr/tts/stream 全族）；不加载 Key；不跑 NEW_SHELL_STATUS probe；不读 `.env*`；`actualSpendCny=null`（No invented spend）。
6. **禁假绿 / 禁 retry-to-green**：EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ 0 BUG；not_run ≠ pass；收据 token `g7_hard_disabled` = mapped not_run label（运行时抛 `g7_path_disabled:<capability>`）≠ pass；未来任何授权跑逐 attempt 记录（含失败），禁只留绿 attempt、禁循环重跑至绿。
7. **quota-403 residual CLOSED ≠ suite green**（G7 FR3 nail 原文口径）——Ban「quota-403 removed ⇒ trio green」。

Trio stays **OPEN 1/1/1**. `g7SuiteGreen=false`. R1 **OPEN**. Disclosure-1 **OPEN**. **Ban covered**. **Ban 假绿 suite 声明**。本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方另行授权；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
