# REQUEST — **UC-E2E-018 RECEIPT-BACKFILL · GAP-UC018-RECEIPT-BACKFILL** · pre-exec · mw-rag-route

**Status**: **pre_exec PASS**（条件化 · 见 Post-prove conditions） / harness `draft:awaiting_pre_exec_dual`  
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer  
**Knife**: `harness/uc-e2e-018-receipt-backfill.md` · slice `uc-e2e-018-receipt-backfill.slice.md`  
**REQUEST tip**: `402f242` / `402f2428779573c972f530e521bfde824e71ee69`（meetwise-core · docs only）  
**Parent nail**: `17e7654`（COVERED-CRITERION CLOSED）  
**Date**: 2026-09-23 (~21:35 PT)

## Pins（retained · 本审不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** · real PG only for ADV/isolated |
| Matrix §1.1 UC-E2E-018 | **partial** · Ban invent covered · Ban §1.1 flip |

Dual PASS ≠ coding ≠ covered ≠ nail · Ban hand-write JSON from prose · Ban retune SHA mismatch / nonzero exit.

---

## Parent nail `17e7654`（速核）

| Item | Note |
|------|------|
| Exists / ancestor | **yes** · `17e765464ef55757a68ed543773375a7328d4dac` · tip 祖先 |
| GAP | `GAP-UC018-COVERED-CRITERION` **CLOSED** · dual `fc7dc24`/`6d2841c` @ runner `22790a8` / receipts `971bb80` |
| D1 BOUND NHP | **NHP-018-BOUND-01** registered **partial**（waiting_user-CAS / `GAP-UC018-WAITING-USER`） |
| D2 FAULT SSOT | matrix §1.0.1 UC-018 **FAULT → case-only**（NHP-018-FAULT-01） |
| D3 self OPEN-GAP | self-ref OPEN-GAP **cleared** by closing COVERED-CRITERION |
| Follow-ups registered | `GAP-UC018-RECEIPT-BACKFILL` · `GAP-EVAL-PARSER-DETAILS-UNCLOSED` · **C-WORD-NEG** |
| UC-018 / §1.1 | stay **partial** · Ban invent covered |

---

## SHA table verification

| Prove | Recorded SHA | Exists | Tip ancestor | Matches nail/harness cite | `package.json` script @ SHA |
|-------|--------------|--------|--------------|---------------------------|------------------------------|
| FULL-E2E | `85d36c7` | yes | yes | nail `c36b032` / harness prove tip | `uc018:abandon:full-e2e:prove` **YES** |
| GRAPH | `f06dcba` | yes | yes | nail `08650ea` | `uc018:graph:prove` **YES** |
| TTL | `549da9c` | yes | yes | tip after body `968b8c5`（docs honesty）· nail `d698282` | `uc018:ttl:prove` **YES** |
| UI | `e88d386` | yes | yes | nail `1990b12` | `uc018:ui:prove` **YES** |
| SOLE | `23f98d3` | yes | yes | nail `aa968b1` | `uc018:sole:prove` **YES** |
| ADV | `bdc5993` | yes | yes | nail `27dd6ae` | `uc018:adv:prove` **YES** |
| PERF/LOAD | `b29c191` | yes | yes | nail `f886ea5` · Step A `8c7ee0c` | `uc018:perf-load:prove` **YES** |
| waiting_user | **not-found** | — | — | 见下 | — |

**Runner-existence**: 上表七行在 recorded SHA 均已有对应 pnpm script · 可在干净 worktree checkout 该 SHA 重跑（旧 runner 存在）。machine-readable emitter 若仅 tip 有 · 须 **tip-side wrapper**（见裁定 1/5）· 禁止把 tip 代码混进旧 SHA worktree 污染。

---

## Focus rulings

### 1. Honesty of re-run at old SHAs

- 重跑 = **新证据**（`ranAt=now`）证明 **旧代码**（`targetSha=recorded`）今日仍可 EXIT=0 · **可接受** 当且仅当：不覆盖/不回写原 prose／原 JSON；新收据另路径（如 `receipts/uc018-receipt-backfill/`）；字段含 **`targetSha` + `wrapperSha`（或 tipSha）+ `ranAt`** · 禁止用单一 `gitSha=HEAD` 在 tip 树含糊表示。
- **Evaluator 语义**（`shaFlags`）：`committed` / `shaMatchesCommitted` = SHA **存在且为 tip 祖先** · **不要求** `gitSha === HEAD`。故旧 SHA 的 EOR 可在 tip 上消除 UNCOMMITTED-RUNNER · **但这不是 tip 代码证明**。
- **漂移**：计划对「旧 SHA 绿是否代表 tip」**沉默**。裁定：本刀 **显式接受 knife-SHA EOR**（祖先）以消 MISSING-* · **不**把 backfill 当作 tip drift-proof；矩阵 **status 单元格不得因本刀改写** · UC-018/§1.1 仍 partial · Ban invent covered。若日后要 tip 证明 · 另开 tip-SHA prove 刀。

### 2. Reviewer verdicts

- 同意 coordinator：审者须 **独立复核 fresh run** · 在 **自己的** review 文件 **追加** 新严格末行 `Verdict: PASS|FAIL` · **禁止**把旧 prose 改写成严格行冒充历史。
- 计划写「Dual reviewers append last-line」· **未写死**「禁止 implementer 改 reviewer 文件」。裁定：**硬禁** implementer 提交触碰 `reviews/*-mw-rag-route.md` / `*-mw-e2e-ha.md` · 否则 latest author≠role → slot **null** → MISSING-DUAL。
- Parser：last-line-only + path suffix + author bind · 仅认审者新末行。

### 3. waiting_user SHA

- 调查：`GAP-UC018-WAITING-USER` 在 parent harness §1b#4 **CLOSED** · 证据为 A/H-waiting-user 嵌在 `pnpm uc018:abandon:prove` + `pnpm uc018:abandon:http:prove` · 审档 `reviews/2026-09-10-uc-e2e-018-waiting-user-mw-e2e-ha.md` 仅引 `.tmp/isolated-proof-receipts/…`（未入库 tip）· 文件本身由 `db0d513` 回填引入 · covered-lift evidence `#4 waiting_user: CLOSED` **无 SHA**。
- **裁定**：**MISSING-EVIDENCE**（fail-closed）· **禁止**挑任意历史 tip · 本刀 **不**为 waiting_user 伪造 recorded SHA；若要 machine-readable BOUND 收据 · **另开 fresh knife** 或在 authorize 后以 **有引用的** abandon prove tip 单列并披露「非原 WAITING-USER close tip」。

### 4. Risk of upgrading column beyond old evidence

- 计划 NHP PERF/LOAD 钉 local ≠ capacityRepresentative · Ban elevate PERF covered · **同意**。
- 硬条件：矩阵 **status 单元格不变**（partial/case-only 保持）；仅增 machine-readable 字段；`stack` 必须来自 **当次 run**（docker inspect / 脚本探测）· **禁止**假定；PERF/LOAD 保持 local-only partial · implementer 旧收据仍非 EOR。

### 5. Ban hand-writing JSON

- 计划 Ban hand-write · 但 **未指定** emitter 脚本与防伪。
- 裁定（authorize 前须写入 harness）：tip-side **emitter** 从 process 捕获的 exit/stdout 写 JSON；JSON 含 `emittedBy` / `stdoutDigest`（或等价）+ `exit`；配套 prove 断言「缺 marker / digest 不匹配 → FAIL」· **禁止**人工粘贴 prose 成 JSON。

---

## Plan / pins / harness 检查

| Check | Result |
|-------|--------|
| Status | `draft:awaiting_pre_exec_dual` · L0 docs only · Ban coding until dual+authorize |
| Pins | NOT_HA / releaseEvidence=false / claimProductionHA=false / gR45Closed / coveredCount=8 / ms3EqualsR4Closed=false / PG-retained **HOLD** |
| Ban invent covered / Ban §1.1 flip | **yes** |
| Prove CMDs listed | **yes** · EXIT：记录 · 不重调 |
| Optional FX-DUAL-DETAILS-UNCLOSED | in-scope if dual agrees · 非本审 blocker |
| Real PG | ADV / isolated 家族须真 PG · Ban 假栈 |

---

## Blockers

**无**（L0 计划诚实 · SHA/脚本核验通过 · waiting_user 已 flag）。下列为 **硬 Post-prove / authorize 条件** · 未满足则 post-prove **FAIL** · 非「默认可跳过」。

---

## Post-prove conditions（mandatory）

1. 新收据路径独立 · **不**覆盖原 knife receipts；`ranAt=now` · `targetSha=<recorded>` · `wrapperSha=<tip emitter commit>`。
2. tip-side emitter + guard（stdoutDigest/exit/emittedBy）；prove 校验脚本生成。
3. 干净 worktree 每 SHA 重跑 · 脏树拒绝 · SHA mismatch / nonzero **只记录不重调**。
4. **禁止** implementer 编辑 reviewer 文件；审者独立复核后追加末行严格 Verdict。
5. waiting_user：**MISSING-EVIDENCE** · 不自造 SHA · 需则另刀。
6. 矩阵 status **不升级** · stack 实测 · PERF/LOAD 仍 local-only partial。
7. 披露：EOR@祖先 SHA ≠ tip drift-proof · Ban invent covered / Ban §1.1 flip。
8. 重跑后 `pnpm uc018:covered-criterion:prove`：期望 MISSING-* 诚实减少 · `canHonestlyFlip` 仍须诚实（Ban 假翻）。

---

## Verdict

**PASS**（pre-exec · 条件化）· Dual PASS ≠ coding · alone ≠ dual

### signature（pre-exec）

**mw-rag-route** · 2026-09-23 (~21:35 PT) · RECEIPT-BACKFILL pre-exec PASS

Verdict: PASS
