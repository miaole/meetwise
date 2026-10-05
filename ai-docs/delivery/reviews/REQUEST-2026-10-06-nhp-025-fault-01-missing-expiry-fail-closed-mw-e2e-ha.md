# REQUEST — **NHP-025-FAULT-01 · UC-025 FAULT missing-expiry fail-closed** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/nhp-025-fault-01-missing-expiry-fail-closed.md` · slice `nhp-025-fault-01-missing-expiry-fail-closed.slice.md`
**Parent tip**: `f43bea1`（full `f43bea12fc7f2e28e7bb0052b6a80811eac47e91`）
**Date**: 2026-10-06

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

## 请审什么（mw-e2e-ha · evidence-honesty / EXIT · Ban wash NEG/BOUND）

Line AA · 选 **FAULT**（next non-BOUND after W）：NHP 序 #2 missing/NULL `expires_at` fail-closed。请审：

1. **选面诚实**：FAULT = absent expiry fail-closed；与 NEG（有锚且过期→`stale_quiz`）/ BOUND（`resume_version_mismatch` @W `2af0640`）正交——裁决是否成立。
2. **W nail honesty**：cite `2af0640` — BOUND EXIT0≠covered · evidence=in-process+fake-db ≠ PG/HTTP · BOUND 列仍 gap · Ban 借 BOUND/NEG 绿关 FAULT。
3. **blind→case/prove**：本 REQUEST 仅 docs 显式化；prove 拟 `uc025:nhp-fault:prove`；口未接线 → EXIT1 保留。
4. **Ban wash B'' NEG + Ban wash W BOUND**；Ban 编辑对应产品路径。
5. **行 stays gap** · coveredCount=8 · Ban invent covered · Ban SSOT status 翻写。

Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

## PRE-EXEC review — mw-e2e-ha（2026-10-06 00:11 CST · docs only · Ban coding）

**Reviewed at**: origin `feat/mysql-schema-skeleton` tip `f3eeb04`（detached）· REQUEST commit **`448a33e`**（`448a33e2460f919b15af1db6c9c44497dc585b62`）· parent **`bb1721b`**（`bb1721bd6b3fdf76d5195a463543a9c3bf841d18`，其 parent = `f43bea1`）—— verified via `git log -1 --format='%H %P'`。
**Read**: this stub · harness `harness/nhp-025-fault-01-missing-expiry-fail-closed.md` · slice `nhp-025-fault-01-missing-expiry-fail-closed.slice.md`（all unchanged since `448a33e`）· matrix `e2e-requirement-coverage-matrix.md:125` · `harness/uc-e2e-025-nhp.md:23,45` · `non-happy-path-perf-load-case-matrix.md:84` · `interview.service.ts` begin NEG/BOUND 区段（read-only）· `uc-e2e-025-nhp-bound.proof.ts` fixture（read-only）。

### 审点核对

| # | 审点 | 结论 | 依据 |
|---|------|------|------|
| 1 | 选面诚实：FAULT = absent/NULL `expires_at` fail-closed，与 NEG / BOUND 正交 | **成立** | NHP 序 #2 原文「Missing expiry field fails closed · Ban treating absent `expires_at` as fresh」（`uc-e2e-025-nhp.md:45`）。NEG = 有锚且 `expires_at <= now` → `stale_quiz`；BOUND = pin 失配 → `resume_version_mismatch`；FAULT = 锚缺失。三者输入域不重叠。 |
| 2 | FAULT 缺口事实 | **属实** | 产品 `quizExpired = expires_at != null && …`：NULL → 放行（注释明言「不得当过期拒」）。= 把 absent 当 fresh，正是 NHP FAULT 所禁。harness 行号 `:209-222` 近似（实为 ~`:207-222`），不影响裁决。 |
| 3 | W nail cite `2af0640` | **核实** | `2af0640ac510c2d09c35dc47a817a7d7e8bf0d1d` 存在且为 origin tip 祖先（`merge-base --is-ancestor` OK）；subject `NAIL NHP-025-BOUND-01 GAP-UC025-BOUND-01 post_prove_dual_pass`。harness 引述（EXIT0≠covered · in-process+fake-db ≠ PG/HTTP · BOUND 列仍 gap · canHonestlyFlip=false）与矩阵 `:125` 一致。 |
| 4 | Ban wash B'' NEG / W BOUND | **守住** | `448a33e` 仅 4 个新增 docs 文件（harness/slice/2 stubs）；零触碰产品码、矩阵、NEG/BOUND 叙事。harness 显式 Ban 借 NEG/BOUND EXIT0 关 FAULT。 |
| 5 | 行 stays gap · coveredCount=8 · Ban invent covered | **守住** | 矩阵 `:125` 行 = gap · FAULT 列 = gap；REQUEST 不翻任何 status；NHP 矩阵无 FAULT 行（登记留 nail）——诚实。 |
| 6 | prove 方案 EXIT 诚实 | **成立** | 拟 `uc025:nhp-fault:prove`；产品未改 → EXIT1 保留 FAULT gap；Ban 改 NEG/BOUND 块冒充绿。 |

### Conditions（非 blocker · 对后续 prove/code 刀有约束）

- **C-1 张力须显式处置**：现行产品注释引 `e2e-ha C-1`（已迁移库 0135 前旧工件 NULL `expires_at` 不假拒）。FAULT fail-closed 与之方向相反。授权写码前，harness/code REQUEST 必须**显式声明 supersede 或收窄** C-1（例如：旧工件经迁移回填锚点 / 或明确旧工件拒绝属预期），Ban 静默翻转。
- **独立 FAULT 守卫 · 独立错误码**：FAULT 必须以独立块 + 区别于 `stale_quiz` / `resume_version_mismatch` 的可解释错误码实现；先于 `reserveEntitlement` / `enqueueInterviewJob`；**NEG 块逐字节冻结**（W BOUND proof `negBlockIntact` 正则锁定 `SELECT status, expires_at FROM resume_quiz WHERE id=$1 AND owner_user_id=$2`，不得变）。
- **非回归**：FAULT prove 时须同 tip 复跑 `uc025:nhp-neg:prove` 与 `uc025:nhp-bound:prove` 仍 EXIT0（BOUND fixture `expires_at` = now+1d 非 NULL，正交，预期不受影响）；任一回归 = FAIL，Ban 改 NEG/BOUND proof 迁就。
- **证据层诚实**：若 FAULT prove 亦为 in-process + fake DB，须与 W 同样标注 ≠ isolated PG/HTTP；EXIT0 ≠ covered；FAULT 列直到 nail 前 stays gap。
- **Tip-cite 小瑕**：harness/slice/stub 记 parent tip `f43bea1`，实际 `448a33e` parent = `bb1721b`（Line Z 先落，`f43bea1` 为祖父）。非 blocker；建议协调方按 Line AB `f3eeb04` 方式做 tip-cite 修正，或在 nail 时注明 assigned start tip `f43bea1`。

### Blockers

无。

### Pins（原值 · 未翻）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · UC-E2E-025 row stays **gap** · FAULT column stays **gap**。

### Non-claims

PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA。本 review 仅 mw-e2e-ha 单签：**alone ≠ dual**；mw-rag-route stub 仍 PENDING，不代签。

### 中文三行摘要

1. 选面 FAULT（NULL/缺失 `expires_at` fail-closed）诚实成立，与 NEG `stale_quiz` / BOUND `resume_version_mismatch` 正交；产品现按 NULL 放行 = 真缺口；W nail `2af0640` 引述核实。
2. 未洗 B'' NEG / W BOUND，零产品码改动，行 stays gap · coveredCount=8 · pins 原值；条件：C-1 张力须显式处置、独立守卫+独立错误码、NEG/BOUND 非回归、tip-cite `f43bea1`→`bb1721b` 小瑕。
3. PASS ≠ coding ≠ nail ≠ covered ≠ HA；alone ≠ dual，待 mw-rag-route 另签。

Verdict: PASS
