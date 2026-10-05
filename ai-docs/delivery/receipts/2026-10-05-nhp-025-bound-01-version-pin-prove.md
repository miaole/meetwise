# Receipt — **NHP-025-BOUND-01 · UC-025 BOUND resumeVersion pin**（Line W · NAIL · **`post_prove_dual_pass`** · row stays gap · BOUND column stays gap）

**Date**: 2026-10-05（Asia/Shanghai）
**Line**: **W** · implementer `mw-core`（commit identity `meetwise-core`）
**Knife**: harness `harness/nhp-025-bound-01-version-pin.md` · slice `nhp-025-bound-01-version-pin.slice.md`
**Gap / Case**: `GAP-UC025-BOUND-01` · `NHP-025-BOUND-01` · scenarios TC-E2E-025-version-mismatch / E-简历变更
**REQUEST**: `73b9d8574844e390180586b82af3b1a128fcbd8b`（docs-only pre_dual）
**PRE dual BOTH PASS**: mw-e2e-ha `df6a89796b898cadf99189c3bdfd60a6ac2982b2` + mw-rag-route `cdcd11fd3af584a0dc111032680ae80c94e5e8d5`
**Authority**: coordinator meetwise — coding+prove AUTHORIZED · Ban self-nail · Ban SSOT flip · Ban wash B'' NEG · Ban HA · Ban secrets / `.env*` · Ban force-push · Ban Meridian · zero MODEL_API_KEY live calls

---

## Pins（unchanged）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · canHonestlyFlip=**false**（本行）

**Row**: `UC-E2E-025` stays **gap** · BOUND 列 **未翻** · FAULT gap · ADV blind · NEG B'' CLOSED(wired) **frozen**（不重跑洗绿、不借 NEG EXIT0 记 BOUND 进度）

---

## HTTP / error pin（本刀钉死 · rag C-4 条件兑现）

| 项 | 值 |
|----|----|
| HTTP status | **409 CONFLICT** |
| Body | `{ "error": "resume_version_mismatch" }` |
| Trigger | begin 携带 `quiz-id` 且工件 0061 typed pin `(resume_quiz.resume_id, privacy_epoch)` 非 NULL，并且：begin `resume-id` ≠ pin `resume_id`（简历变更后拿旧押题），或 pin `privacy_epoch` ≠ 该简历当前 `privacy_epoch`（含 owner 下简历行不可见） |
| Ordering | 抛点 `interview.service.ts:246` 先于 resume bind `UPDATE interview i` `:268` / `reserveEntitlement` `:309` / `enqueueInterviewJob` `:317` → Interview 不入 active · 不扣额度 · 不入队 |
| NULL pin | 0061 前旧工件（无 typed 引用）**不**当失配拒（对齐 NEG `expires_at` NULL 语义 · 披露：旧工件无 BOUND 保护） |
| 无 quiz-id | 整块跳过，零 `resume_quiz` 读，行为与接线前一致 |
| NEG | `stale_quiz` 块 `:207-223`（throw `:222`）逐字节未改；顺序 = not_found → stale(NEG) → version(BOUND) |

---

## C-1 — SHAs

| 项 | 值 |
|----|----|
| Base（origin tip at start） | `3003392eea497c403fd47a3005555b875b4d746b`（含 REQUEST `73b9d85` + 两 PRE PASS）；push 前 `pull --rebase` 落到 `ff74522`（Line Y NHP-001 docs/test · 与本刀文件零重叠） |
| Pre-rebase local code SHA（未推送 · 已被 rebase 取代） | `51d935af1bf22f8f3b67c5248550908caba40ba0`（同 diff；该 SHA 上同 CMD 亦 EXIT=0 @ `2026-10-05T23:44:31+08:00`–`23:44:34+08:00`，输出与下表逐行一致） |
| **CODE_SHA = PROVE_SHA（exact）** | `6853e177adedd9c35e88d9c1acaa98899744d6be` |
| Code files | `apps/api/src/modules/interview/interview.service.ts`（+25）· `apps/api/test/uc-e2e-025-nhp-bound.proof.ts`（new）· `apps/api/package.json`（`prove:uc025-nhp-bound`）· `package.json`（`uc025:nhp-bound:prove`） |
| Tree at prove | `git status --porcelain` 空（clean） |

---

## Prove run

CMD: **`pnpm uc025:nhp-bound:prove`**（root → `pnpm -C apps/api prove:uc025-nhp-bound` → `node --import @swc-node/register/esm-register test/uc-e2e-025-nhp-bound.proof.ts`）

| Run | SHA | Start (Asia/Shanghai) | End | Shell EXIT |
|-----|-----|------------------------|-----|------------|
| **Committed prove（pushed code SHA）** | `6853e17` | `2026-10-05T23:45:46+08:00` | `2026-10-05T23:45:50+08:00` | **0** |
| Pre-rebase local（superseded） | `51d935a` | `2026-10-05T23:44:31+08:00` | `2026-10-05T23:44:34+08:00` | **0** |
| Pre-wiring honesty（同脚本 · service 回退至 base `3003392`，未提交） | base | 2026-10-05 ~23:42 | — | **1**（`GAP GAP-UC025-BOUND-01 … unwired`） |

### Output（committed prove · 原文）

```
PASS  S0-begin-region-parseable
PASS  S1-controller-forwards-quiz-id
PASS  S2-bound-throw-409-resume_version_mismatch
PASS  S3-reads-quiz-resumeVersion-pin(resume_id+privacy_epoch)
PASS  S4-throw-before-bind/reserve/enqueue
PASS  S5-no-local-catch-swallows-bound-throw
PASS  S6-schema-pin-columns(0061+sql/20)
NOTE  NEG B'' stale block text present/untouched=true (frozen · not BOUND evidence)
PASS  R1-resume-changed(pin R_A, begin R_B) → 409 resume_version_mismatch
PASS  R1-no-bind/reserve/enqueue-before-refusal(interview not active · quota untouched)
PASS  R2-epoch-drift(pin epoch 1, current 2) → 409 resume_version_mismatch
PASS  R2-no-side-effect
PASS  R3-pinned-resume-gone(current null) → 409 resume_version_mismatch
PASS  R4-accept-asymmetry(pin matches, case-insensitive uuid) → passes guard, reaches bind
PASS  R5-legacy-unpinned-quiz(NULL pin) → not false-rejected, reaches bind
PASS  R6-no-quiz-id → zero resume_quiz reads, behaviour unchanged, reaches bind

PASS  NHP-025-BOUND-01  interview begin refuses a resumeVersion-pin mismatch with 409 resume_version_mismatch before bind/reserve/enqueue
HTTP_ERROR_PIN  status=409 CONFLICT · error=resume_version_mismatch
ROW_STILL_GAP  UC-E2E-025 BOUND column not flipped. FAULT gap · ADV blind · NEG frozen. coveredCount=8.
NOTE  service-level in-process evidence (fake DB client) ≠ HTTP/PG end-to-end ≠ covered ≠ nail ≠ HA

CMD=pnpm uc025:nhp-bound:prove EXIT=0
```

---

## Evidence-layer honesty（请 post dual 审）

- **S 层**：静态 inventory（controller 透传 quiz-id · BOUND throw 形状 · pin 列读取 · 抛点先于 bind/reserve/enqueue · 无 catch 吞 · 0061 + sql/20 pin 列）。
- **R 层**：真 `InterviewService.begin` 进程内执行，`DbService.asPrincipal` 注入**记录型 fake client**（未知 SQL 即抛 `UNEXPECTED_SQL`；bind UPDATE 处以 sentinel 截停）。**零 PostgreSQL · 零网络 · 零模型 · 零 secrets**（`MODEL_API_KEY`/`MODEL_BASE_URL` 进程内删除）。
- **不是**：HTTP 全链路 · 隔离 PG prove · RLS 实测 · covered。**Evidence layer MUST state（nail）**：in-process `InterviewService.begin` + fake DB · shape aligned to nhp-neg · **≠ isolated Postgres/HTTP E2E** · harness「隔离壳三层」本刀 **NOT run**（soft/aspirational · not a hard blocker of this PASS）。PG/HTTP 级 BOUND prove 须 **separate knife**（本 nail 不得宣称）。
- `pnpm uc025:stale-quiz-expiry:prove`（旧 mark-red pin）在 base `3003392` 已 **EXIT=1**（NEG 接线后 S1/S3/S4/G 即失败 · 本刀前既有 · 非本刀引入 · 本刀不改该脚本 · 披露不洗）。
- NEG 回归只读核：`node apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` @`6853e17` EXIT=0（**frozen · 不计入 BOUND 进度**）。
- `tsc -p apps/api/tsconfig.json --noEmit`：本刀新增文件/改动零新增错误（@`51d935a` 实测 24 条，与 base `3003392` 计数一致，均为既有错误）。
- `node scripts/eval-harness-matrix-cite.proof.mjs` @`6853e17` EXIT=0。

## Docs-align（本 receipt commit）

- harness `:209` → 抛点 `:222` 旁注对齐（rag C-3）；矩阵 `e2e-requirement-coverage-matrix.md:125` 原文 `:209` **未改**（SSOT Ban edit）。
- harness/slice 追加 Line W prove 段；状态 = **prove done · awaiting post-prove dual**。

## Non-claims

Not covered · not BOUND column flip · not NEG re-open · not FAULT · not ADV · **not isolated Postgres/HTTP E2E** · not HA · alone ≠ dual

## Line W NAIL（`post_prove_dual_pass`）

- Post-prove dual BOTH PASS：mw-e2e-ha `9aad765a10cc65093c9d5b3554e7142c5405ea34` + mw-rag-route `c0485338eab5cf638558d2cd998f39b1c2fb84a3`。
- Lifecycle advanced to **`post_prove_dual_pass`** by Line W nail（cross-ref harness/slice/SSOT）。
- **Evidence layer MUST state**：in-process `InterviewService.begin` + fake DB · shape aligned to nhp-neg · **≠ isolated Postgres/HTTP E2E** · harness three-layer isolated setup NOT run this knife（soft/aspirational · not hard blocker of this PASS）。若要 PG/HTTP-level BOUND 证据 → separate knife（本 nail 不得宣称）。
- **STILL_GAP**：UC-E2E-025 **row** stays **gap** · **BOUND column** stays **gap** · EXIT0≠covered · coveredCount=**8** · canHonestlyFlip=**false** · NEG B'' CLOSED(wired) **frozen** Ban wash · FAULT gap · ADV blind。
- Pins：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · canHonestlyFlip=false。

*Receipt · NHP-025-BOUND-01 · Line W · prove EXIT=0 @6853e17 · post dual 9aad765+c048533 PASS · lifecycle post_prove_dual_pass · evidence in-process+fake-db ≠ isolated PG/HTTP · row+BOUND gap · coveredCount=8 · Ban wash NEG · Ban invent covered · STOP*
