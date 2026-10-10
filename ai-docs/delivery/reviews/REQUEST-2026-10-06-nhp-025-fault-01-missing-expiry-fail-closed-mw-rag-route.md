# REQUEST — **NHP-025-FAULT-01 · UC-025 FAULT missing-expiry fail-closed** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
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

## 请审什么（mw-rag-route · quiz/resume 跨图编排 · FAULT 诚实面）

Line AA · 选 **FAULT**（next non-BOUND after W）：NHP 序 #2 missing/NULL `expires_at` fail-closed。请审：

1. **选面诚实**：FAULT = absent expiry fail-closed；与 NEG（有锚且过期→`stale_quiz`）/ BOUND（`resume_version_mismatch` @W `2af0640`）正交——裁决是否成立。
2. **W nail honesty**：cite `2af0640` — BOUND EXIT0≠covered · evidence=in-process+fake-db ≠ PG/HTTP · BOUND 列仍 gap · Ban 借 BOUND/NEG 绿关 FAULT。
3. **blind→case/prove**：本 REQUEST 仅 docs 显式化；prove 拟 `uc025:nhp-fault:prove`；口未接线 → EXIT1 保留。
4. **Ban wash B'' NEG + Ban wash W BOUND**；Ban 编辑对应产品路径；Ban 把 quiz 图绿冒充 FAULT 关账。
5. **行 stays gap** · coveredCount=8 · Ban invent covered · Ban SSOT status 翻写。

Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## mw-rag-route pre-exec · 2026-10-06T00:15:22+0800

**Status**: pre-exec · docs gate only · alone ≠ dual · 不代签 mw-e2e-ha · 不 nail · 不 coding
**审查对象**: REQUEST `448a33e2460f919b15af1db6c9c44497dc585b62`（短 `448a33e`）· harness `nhp-025-fault-01-missing-expiry-fail-closed.md` · slice 同名
**origin tip（落笔）**: 见 push 后报告。
**NORTH-STAR-EXECUTION-LOOP**: tip 上已有该文件名（他线产物）；本审门仍以 `north-star-hard-gates.md` + 本 harness/slice 为准，不借他线叙事。
**Peer**: mw-e2e-ha stub PENDING（只读 · 不改 · 不代签）。

### 检查

1. **docs-only**：`git show --stat 448a33e` = 4 文件（harness + slice + dual stubs）· +212 · 零 `apps/`/`packages/`/`proof`。通过。
2. **选面 FAULT 诚实**：NHP 序 #2 missing expiry fail-closed；矩阵 FAULT=gap；与 NEG（有锚且过期→`stale_quiz`）/ BOUND（`resume_version_mismatch` @W）正交。Ban wash NEG/BOUND。成立。
3. **fail-open 实锚（核 448a33e）**：`interview.service.ts:219-222`：
   - `quizExpired = expires_at != null && Date(...) <= now` → NULL **不**进过期支 → **fail-OPEN**（与 harness 意图相反 = 诚实缺口）。
   - 同式：不可解析日期 → `getTime()`=NaN · `NaN <= now` 为 false → **亦 fail-OPEN**。harness **仅钉 NULL**，未覆盖 invalid date → **条件**（不因此 FAIL）：wiring/prove 宜显式处理或披露不在本 case。
4. **fail-closed 期望**：harness 写「可解释错误码」+ 无 active / 未扣额度 / 先于 reserve。**未**钉死复用 `stale_quiz` 409 vs 新码 → **条件**：授权 coding 前须钉 exact HTTP+error（复用或新码均可，须写进 harness/prove）。副作用断言方向正确。
5. **诚实路径 / Ban wash**：口未接线 → EXIT1；Ban 改 NEG/BOUND 冒充；Ban 借 NEG/BOUND/`stale-quiz-expiry` EXIT0。通过。
6. **回归守卫（条件）**：harness 未明文要求 FAULT 接线后 `uc025:nhp-neg:prove` + `uc025:nhp-bound:prove` 仍 EXIT0 且不改脚本——**条件**补钉（非 NULL 过期语义与 BOUND 顺序不得削弱）。
7. **正控（条件）**：harness 未点名「未来非空 expires_at → 越过本检查」——**条件**：prove 须含正控，否则不可证断言能红。
8. **证据层裁定**：harness `:81`「隔离壳三层；形态对齐 `uc025:nhp-neg:prove` / `uc025:nhp-bound:prove`」= Line W 同类自相矛盾。NEG=静态 inventory；BOUND=进程内 fake DB；皆 **≠** `run-e2e-isolated` PG。**不**升 `BOUND-EVIDENCE-LAYER-FAKE-DB` 式硬 FAIL（未把 in-process 宣成隔离 PG/HTTP E2E / covered）。**条件**：协调方须择一证据层并在矩阵/harness 明钉「所选层 ≠ 另一层 ≠ covered」。
9. **schema**：`0135_resume_quiz_freshness_anchor.sql` `ADD COLUMN … expires_at timestamptz`（**无 NOT NULL**）；`sql/20_resume_quiz.sql` 同为可空。NULL = 0135 前旧工件/无锚点——FAULT 场景有库层正当理由。通过。
10. **Pins**：NOT_HA · coveredCount=8 · DELETE=503 · PG-retained · 行 stays gap · ADV blind · 非 018/052。

### 条件汇总

1. Dual PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA。alone ≠ dual。
2. 钉 exact error/HTTP；invalid-date 披露或不在 scope。
3. 证据层择一 + 明钉 ≠ isolated PG E2E（若选 in-process）或反之。
4. prove 须正控 + NEG/BOUND 回归 EXIT0（不改其脚本）。
5. 不代签 peer。

Verdict: PASS
