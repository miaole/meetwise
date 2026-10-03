# Slice — G7 · **trio / Disclosure-1 / TECH_ROLE=0 ≠ R1 honesty**（Line L · docs-only REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`executed:awaiting_post_prove_dual`**（docs 执行阶段完成 · awaiting post-prove dual · **not a pass** · docs REQUEST open · **≠ fixed** · **≠ coding** · **≠ prove** · **Ban live** · Ban自批 · 禁假绿 suite 声明）
**Date**: 2026-10-03
**Authority**: meetwise — Line L docs only · 本刀默认离线文档+收据对齐 · Dual PASS ≠ coding · Ban假绿 · 禁假绿 suite 声明 · **禁改 SSOT 行（nail 阶段才改）** · **禁 retry-to-green** · EXIT **1/1/1** retained · Ban secrets / `.env*`
**releaseEvidence=false** · **haStatus=NOT_HA** · **claimProductionHA=false** · **g7SuiteGreen=false** · **r1Closed=false** · **≠ suite green** · **≠ HA**
**Pins（原值全抄）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Experts**: **`mw-model-op` + `mw-e2e-ha`** · awaiting pre-exec dual · Ban self-approve
**Base tip**: `320c07b`（origin `feat/mysql-schema-skeleton`）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/g7-trio-disclosure-techrole-honesty.slice.md` |
| Harness | `ai-docs/delivery/harness/g7-trio-disclosure-techrole-honesty.md` |
| REQUEST · model-op | `reviews/REQUEST-2026-10-03-g7-trio-disclosure-techrole-honesty-mw-model-op.md`（pre-exec dual PASS @`b8dfb62`） |
| REQUEST · e2e-ha | `reviews/REQUEST-2026-10-03-g7-trio-disclosure-techrole-honesty-mw-e2e-ha.md`（pre-exec dual PASS @`a474ca4`） |
| L2 执行产物 · trio 现状对齐 | `harness/g7-trio-current-state-alignment.md`（含 A″→FIX 时序更正 + not_run 覆盖） |
| L2 执行产物 · 离线收据索引对齐 | `harness/g7-trio-offline-receipt-index-alignment.md`（index only · 非 run receipt · 零新证据） |
| 诚实刀具索引（parent） | `g7-honesty-knives.slice.md` · `g7-full-suite-plan.slice.md` |
| SSOT 现行段（只读本刀） | `gap-bug-backlog.md` G7 FR3 / Line C live 段 · `execution-master-checklist.md` G7 段 |

## One-line scope

Line L：G7 遗留 honesty——冻结 trio（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）历史 **OPEN 1/1/1** + **Disclosure-1**（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 仅 G7、never counts toward R1）+ **TECH_ROLE=0 ≠ R1** 口径钉进 docs；离线收据索引对齐；**不宣称 suite green**；`g7SuiteGreen=false` 保持；**Ban live**（真实模型调用零次）；zero coding / zero prove。

## Frozen trio（现状逐一 · not_run this knife）

| CMD | 现状 | 为何 OPEN（一句话） |
|-----|------|---------------------|
| `pnpm e2e:isolated` | **OPEN** · `not_run:no_coding_authorize` · prior EXIT=**1** retained | 缺 quota-403 移除后在已提交 SHA 上的新鲜 CMD+EXIT；Key set 时曾 403 `AllocationQuota.FreeTierOnly`（questions=0 · fail-closed）；夹具面 BUG-E2E-ISO/G6 仍 open；本刀 Ban live |
| `pnpm e2e:ui:isolated` | **OPEN** · `not_run:no_coding_authorize` · prior EXIT=**1** retained | 末次（Key set + chromium ran）10 passed / 2 failed / 10 skipped · recruiting-bound timeout · stream/golden partial；chromium prereq 关 ≠ UI green；本刀 Ban live |
| `pnpm verify:e2e-performance` | **OPEN** · `not_run:no_coding_authorize` · prior EXIT=**1** retained | 末次 migrate PASS 后 HTTP full E2E fail；SLO/LOAD/HA 证据缺（G6 OPEN）；本刀 Ban live |

## 口径钉（Disclosure-1 · TECH_ROLE=0 ≠ R1）

- **Disclosure-1**：G7 e2e `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` = non-production role path · **never counts toward R1** · `techRoleFailClosedOptOutG7Only=true` · **披露项 OPEN**（须持续披露，不得当已修复/已关闭）。
- **TECH_ROLE=0 ≠ R1**：`MEETWISE_TECH_ROLE_FAIL_CLOSED=0`（TECH_ROLE=0）**不是** R1；R1 **STILL OPEN**（`r1-real-close-ssot-flip`：SSOT NOT flipped）；`r1Closed=false` retained。
- **禁叙事**：Ban「TECH_ROLE=0 ⇒ R1 closed / fail-closed 已生产生效」· Ban「G7 e2e 绿 ⇒ 生产 role path 已 fail-closed」· Ban 抹除 Disclosure-1。
- **离线 prove 不冒充**：offline proves @ `b1d7b22` EXIT=0（单元 prove）· Line C 单 settled call（`post_live_dual_pass`）· CR chromium 0/0/0 —— 任一 **≠** trio EXIT=0 ≠ suite green。quota-403 removed（residual CLOSED）**≠ suite green**。
- 收据 token `g7_hard_disabled` = mapped not_run label；运行时抛 `g7_path_disabled:<capability>`；两者均 **≠ pass**。

## Hard pins

- Trio **OPEN 1/1/1** retained until fresh CMD+EXIT @ committed SHA + dual · EXIT **1/1/1** retained · `not_run:no_coding_authorize`
- `g7SuiteGreen=false` 保持 · **不宣称 suite green / full suite pass** · **禁假绿**
- **Ban live**（真实模型 API 调用零次 · 不加载 Key · 不读 `.env*`）
- **禁改 SSOT 行**（backlog / checklist / 矩阵 / north-star 本阶段零触碰；nail 阶段才改，且另行授权）
- **禁 retry-to-green**（未来任何授权跑逐 attempt 记录，禁只留绿 attempt）
- Disclosure-1 **OPEN** · **TECH_ROLE=0 ≠ R1** · R1 **OPEN** · G6 **OPEN** · R5-MARKED-RED retained
- Dual PASS ≠ coding ≠ 已修好 ≠ trio green ≠ suite green · Ban self-approve · alone ≠ dual
- `releaseEvidence=false` · `actualSpendCny=null`（No invented spend）· Ban cross-model cite · zero coding / zero prove

---

*Slice · G7 trio/disclosure/TECH_ROLE honesty · Line L · 2026-10-03 · executed:awaiting_post_prove_dual（docs 执行阶段完成 · not a pass）· dual mw-model-op@`b8dfb62`+mw-e2e-ha@`a474ca4` PASS · trio OPEN 1/1/1 retained · Disclosure-1 OPEN · TECH_ROLE=0 ≠ R1 · Ban live · 禁假绿 · g7SuiteGreen=false · releaseEvidence=false · zero coding · zero prove*
