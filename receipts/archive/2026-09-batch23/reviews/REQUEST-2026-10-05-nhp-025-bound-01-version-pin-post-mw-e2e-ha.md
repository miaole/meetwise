# Review — mw-e2e-ha — NHP-025-BOUND-01 version-pin · POST-PROVE（Line W）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-rag-route`）
**Review date**: 2026-10-05（Asia/Shanghai）
**Knife**: `GAP-UC025-BOUND-01` / `NHP-025-BOUND-01` · TC-E2E-025-version-mismatch / E-简历变更
**REQUEST**: `73b9d85`（`73b9d8574844e390180586b82af3b1a128fcbd8b`）
**PRE dual BOTH PASS**: mw-e2e-ha `df6a897`（`df6a89796b898cadf99189c3bdfd60a6ac2982b2`）+ mw-rag-route `cdcd11f`（`cdcd11fd3af584a0dc111032680ae80c94e5e8d5`）
**CODE**: `6853e17`（`6853e177adedd9c35e88d9c1acaa98899744d6be`）
**PROVE tip / receipt tip**: `e8fa74c`（`e8fa74cd35c8acbbcadbba0851e05ca754aec60d`）
**Receipt**: `ai-docs/delivery/receipts/2026-10-05-nhp-025-bound-01-version-pin-prove.md`
**Harness**: `ai-docs/delivery/harness/nhp-025-bound-01-version-pin.md`
**本审**：独立 `git fetch` + detach `origin/feat/mysql-schema-skeleton`；独立跑 prove **一次**；零 `.env*` · 零 secrets · 零 force-push · 零产品改动 · 零 SSOT 翻写 · 零 wash NEG。

本 PASS = 证据诚实半签。**EXIT0 ≠ covered ≠ nail ≠ HA**。行 stays **gap** · coveredCount=**8**。alone ≠ dual。

---

## 1. SHA 核验 — 通过

| 项 | Claim | 本审独立核 |
|----|-------|------------|
| tip @ start | `e8fa74c` | `git rev-parse HEAD` = `e8fa74cd35c8acbbcadbba0851e05ca754aec60d` ✓ |
| CODE | `6853e17` | `6853e177adedd9c35e88d9c1acaa98899744d6be` · `feat(interview): NHP-025-BOUND-01 resumeVersion pin mismatch guard` ✓ |
| REQUEST | `73b9d85` | docs-only 4 md ✓ |
| PRE e2e | `df6a897` | PRE-EXEC dual PASS ✓ |
| PRE rag | `cdcd11f` | pre-exec PASS ✓ |

CODE 文件面（`git show --name-only 6853e17`）：`interview.service.ts`（+BOUND 守卫）· `uc-e2e-025-nhp-bound.proof.ts`（new）· `apps/api/package.json` · root `package.json`。**BOUND 范围**；零 NEG wash；零矩阵/SSOT 行翻转（prove tip 旁注 harness `:209`→抛点 `:222`，矩阵原文 `:209` 未改）。

---

## 2. 独立 prove · CMD | EXIT · 409 pin — 通过

**Measured**（本审 · Asia/Shanghai · tip `e8fa74c` / code `6853e17`）：

```
CMD=pnpm uc025:nhp-bound:prove
Start: 2026-10-05T23:47:30+08:00
End:   2026-10-05T23:47:34+08:00
EXIT=0
```

输出与 receipt 原文一致：S0–S6 PASS · R1–R6 PASS · `HTTP_ERROR_PIN  status=409 CONFLICT · error=resume_version_mismatch` · `ROW_STILL_GAP … coveredCount=8` · `NOTE  service-level in-process evidence (fake DB client) ≠ HTTP/PG end-to-end ≠ covered ≠ nail ≠ HA`。

**409 pin 抽查**：

- 产品：`interview.service.ts:246` `throw new HttpException({ error: 'resume_version_mismatch' }, HttpStatus.CONFLICT)`。
- 顺序：抛点 `:246` 先于 bind UPDATE `:268` / `reserveEntitlement` `:309` / `enqueueInterviewJob` `:317`（S4 + R1/R2 no-side-effect 核）。
- begin 在 binding/quota/enqueue **前**拒绝 ✓。

**Tripwire（guard 摘除→EXIT1）**：proof `uc-e2e-025-nhp-bound.proof.ts:95-99` — `if (!wired)` → `GAP GAP-UC025-BOUND-01 … unwired` + `EXIT=1`。Receipt 披露接线前同脚本 EXIT=1。本审**读 proof tripwire**核路径存在；**未**改产品摘守卫（Ban 改产品码 · Ban invent）。不另造摘除实验。

Ban retry-to-green：本审只跑 **一次** prove（装 deps 为环境前置，非红绿重试）。

---

## 3. 证据层诚实裁决 — Condition（非硬 FAIL）

Harness REQUEST 段（`:54`）拟 CMD 写「隔离壳三层；**形态对齐** `uc025:nhp-neg:prove`」。

核：

1. `uc025:nhp-neg:prove` 本身 = **静态源码 inventory**（无 Postgres / 无网络 / 无 HTTP E2E）。「形态对齐 NEG」指向非 PG 证据面，**不是**硬要求隔离 PG 三层 DB 作为本刀 acceptance gate。
2. 「隔离壳三层」落在 **拟** CMD 括号内，属 REQUEST 时点规划用语；harness 授权后 prove 段（`:85`）已明文接受并披露：静态 inventory + 进程内 `InterviewService.begin` + 记录型 fake DB client；**≠** HTTP/PG 端到端。
3. Receipt §Evidence-layer honesty 同披露：未采用 isolated PG runner；PG/HTTP 级 BOUND prove 留后续刀。

**裁决**：harness **未硬要求**隔离 PG / 三层隔离 DB 作为本刀 PASS 门 → **不**因证据层 FAIL。须 **Condition** 钉死：本 EXIT0 证据层 = **进程内 + fake DB**（源码锚点 + `InterviewService.begin`）· **≠** 隔离 PG E2E · **≠** covered · **≠** nail。行 stays gap。

---

## 4. Ban wash B'' NEG · BOUND only — 通过

- NEG `stale_quiz` 块 `:207-223`（throw `:222`）仍在；CODE diff 仅在 stale 块**之后**插入 BOUND 守卫（`:225-248`）。
- Proof NOTE：`NEG B'' stale block text present/untouched=true (frozen · not BOUND evidence)`。
- 本审旁路核：`pnpm uc025:nhp-neg:prove` **EXIT=0**（frozen 回归）——**不计入** BOUND 进度 · Ban 把 NEG 绿洗成 BOUND/整行 covered。
- 旧 `uc025:stale-quiz-expiry:prove` mark-red 非本刀证据 · 不洗。

---

## 5. 行 stays gap · EXIT0≠covered · pins — 通过

- `UC-E2E-025` stays **gap** · BOUND 列未翻 · FAULT gap · ADV blind · NEG B'' CLOSED(wired) frozen。
- coveredCount=**8** · EXIT0 ≠ covered ≠ nail ≠ HA · canHonestlyFlip=false · Ban self-nail。
- Pins（硬钉 · 本审不翻）：haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503**。

---

## 6. alone ≠ dual — 通过

本文件 = mw-e2e-ha **半签**。不代签 `mw-rag-route`。须 peer 独立 post-prove PASS 才构成 dual。alone ≠ dual · PASS ≠ nail。

---

## Blockers

无。

（证据层「隔离壳三层」为拟/软对齐 NEG 非 PG 面，非硬 acceptance gate → 不升 Blocker；见 Conditions。）

---

## Conditions

- **C-POST-HA-1（证据层）**：本刀 EXIT0 = 源码锚点 + 进程内 `InterviewService.begin` + fake DB client；**无** Postgres / 网络 / model。**进程内 ≠ 隔离 PG E2E**。不得把本绿写成 HTTP/PG 全链路或 covered。
- **C-POST-HA-2**：EXIT0 ≠ covered ≠ nail ≠ HA；`UC-E2E-025` BOUND 列 / 整行 stays **gap**；coveredCount=8；Ban SSOT 翻写 / Ban invent covered。
- **C-POST-HA-3**：Ban wash B'' NEG `stale_quiz` / NEG EXIT0 / 旧 stale-quiz-expiry mark-red 入 BOUND 账。
- **C-POST-HA-4**：alone ≠ dual；本 PASS 不代签 `mw-rag-route`；不授权 nail。
- **C-POST-HA-5**：HTTP pin 保持 **409** `{ error: 'resume_version_mismatch' }` · begin 在 bind/reserve/enqueue 前拒；NULL pin 不假拒 · 无 quiz-id 跳过。
- **C-POST-HA-6**：pins 八项原值冻结（NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503）。
- **C-POST-HA-7**：若后续刀要求隔离 PG / 三层 DB E2E，须新 REQUEST；本刀不得回写把进程内证据升格为 PG E2E。

---

## 中文三行摘要

1. 独立核 tip `e8fa74c` / CODE `6853e17`；`pnpm uc025:nhp-bound:prove` **EXIT=0**；409 `resume_version_mismatch` 先于 bind/reserve/enqueue 钉死。
2. 证据层 = 进程内 + fake DB（对齐 NEG 非 PG 形态）；harness「隔离壳三层」为拟/软，非硬门 → Condition 披露，非 FAIL；行 stays gap · coveredCount=8 · Ban wash NEG。
3. Blockers 无。本 PASS = 诚实半签；alone≠dual；EXIT0≠covered≠nail≠HA。

Verdict: PASS
