# REQUEST — **G7 trio / Disclosure-1 / TECH_ROLE=0 ≠ R1 honesty** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha 视角）

Line L · G7 遗留 honesty docs-only REQUEST：冻结 trio（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）历史 **OPEN 1/1/1** + **Disclosure-1** + **TECH_ROLE=0 ≠ R1** 口径钉；本刀默认离线文档+收据对齐。请审：

1. **Trio 三条 CMD 现状逐一钉死**（harness §1；wiring 只读核对 @ `320c07b`）：
   - `pnpm e2e:isolated`（`package.json:240`）：`node scripts/run-e2e-isolated.mjs e2e:prove` → `e2e:prove`=`node scripts/run-e2e.mjs`（`:238`）。**为何 OPEN**：① 缺 quota-403 移除后（`b1d7b22` 及以后）已提交 SHA 上的新鲜 CMD+EXIT（末次实跑 2026-09-17 FIX，prove `a4e3de5` / dual tip `5f591ea`，EXIT=1）；② Key set 时曾 **403 `AllocationQuota.FreeTierOnly`** → `questions=0` · `interview_unavailable` / `generation_provider_not_configured` · `failureClass=api`；③ 夹具面 BUG-E2E-ISO：宽 isolated 历史绑 pgvector 镜像、云 serial runner 拒 migration/vector 全套（PRD-TEST-008）、夹具拆分属 R5 阶段 3–4 未做、**G6 still OPEN**；④ 本刀 Ban live → `not_run:no_coding_authorize`（纪律性冻结，非脚本缺失）；⑤ R5-MARKED-RED retained。
   - `pnpm e2e:ui:isolated`（`package.json:241`）：→ `e2e:ui`=`node scripts/run-e2e-ui.mjs`（`:239`）。**为何 OPEN**：① 缺新鲜 UI CMD+EXIT；末次（Key set + chromium 已装）EXIT=1 · **10 passed / 2 failed / 10 skipped** · recruiting-bound timeout（live 出题被同一配额挡住）· stream/golden partial；② CR chromium prereq 刀关（install/version/smoke 0/0/0）但 **chromium ran ≠ UI green**（UI′ `post_prove_dual_pass:honesty_red` retained）；③ 本刀 Ban live。
   - `pnpm verify:e2e-performance`（`package.json:244`）：`node scripts/run-e2e-performance-suite.mjs`。**为何 OPEN**：① 缺新鲜 perf CMD+EXIT；末次 EXIT=1 · **migrate PASS 后 HTTP full E2E fail**；② SLO / LOAD / HA 证据缺（**≠ SLO ≠ LOAD ≠ HA**；G6 OPEN）；③ 本刀 Ban live。
   - SSOT 现行口径核对：G7 FR3 nail「Trio **OPEN** 1/1/1」+ Line C live nail「Trio **not_re_run**, historical exit 1, **stay OPEN**」（`gap-bug-backlog.md:128/:181` · `execution-master-checklist.md:492`）。
2. **离线收据索引对齐（harness §5）**：仅索引既有收据（FIX / A″ / FreeTierOnly SSOT receipt `b1d7b22` / FR3 re-review / Line C live / CR / UI′ / BUG-E2E-ISO），零新跑、零新证据、零改写历史收据；`evidenceOfRecord=false` 惯例不变。
3. **Disclosure-1 与 TECH_ROLE=0 ≠ R1 口径**：`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` = non-production role path · **never counts toward R1** · `techRoleFailClosedOptOutG7Only=true` · 披露项 **OPEN**；R1 **STILL OPEN**（SSOT NOT flipped）· `r1Closed=false`；Line C live receipt 记录该 run `MEETWISE_TECH_ROLE_FAIL_CLOSED` unset。禁叙事：Ban「TECH_ROLE=0 ⇒ R1 closed」· Ban「G7 e2e 绿 ⇒ 生产 fail-closed 生效」· Ban 抹除 Disclosure-1 · Ban 跨口径引用（offline proves / Line C 单 call / CR chromium ≠ trio EXIT=0 ≠ R1/G6/R5/HA 证据）。
4. **本刀产出范围**：docs 对齐 + 离线收据整理；**不**宣称 suite green；`g7SuiteGreen=false` 保持；**本阶段 SSOT 行零触碰**（backlog / checklist / 覆盖矩阵 / north-star），nail 阶段才改且须协调方另行授权；登记为 additive 新段、不改写既有 G7 FR3 / Line C live 段。
5. **Ban live（硬）**：真实模型 API 调用零次；不加载 Key；不读 `.env*`；trio 与一切 `*:prove` 均 `not_run:no_coding_authorize`。
6. **禁假绿 / 禁 retry-to-green**：EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ 0 BUG ≠ R1/R4 closed；not_run ≠ pass；`g7_hard_disabled` ≠ pass；quota-403 removed（residual CLOSED）≠ suite green；未来任何授权跑逐 attempt 记录（含失败 attempt EXIT+时间戳），禁只留绿 attempt、禁循环重跑至绿、禁把 EXIT=1 洗成 flake。
7. **Pins 逐字**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**；coveredCount 不动、covered 不写、UC-018 / UC-052 / UC-004 / UC-025 等任何行不碰。

Trio stays **OPEN 1/1/1**. `g7SuiteGreen=false`. R1 **OPEN**. Disclosure-1 **OPEN**. G6 **OPEN**. **Ban covered**. **Ban 假绿 suite 声明**。本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方另行授权；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
