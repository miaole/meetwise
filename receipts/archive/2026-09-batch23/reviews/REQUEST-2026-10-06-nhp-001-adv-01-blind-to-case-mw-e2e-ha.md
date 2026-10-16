# REQUEST — **NHP-001-ADV-01 · UC-001 ADV blind→case**（主链内注入串 · 结构拒 · 不改 confirmed 账 · EXIT0≠covered）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE3** · awaiting re-PRE3 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: **re-PRE3 · supersedes REQUEST `4e9f568`** · cites rag Re-PRE2 FAIL **`a3364b4`/`71ad2a7`**（B-R2-1 + C1–C6）· N1–N4 / B1–B5 retained · peer e2e PASS `5875644` alone ≠ dual · Ban coding
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/nhp-001-adv-01-blind-to-case.md` · slice `nhp-001-adv-01-blind-to-case.slice.md`
**B5 self-check（B-R2-1）**: `receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md`（reason `docker.sock` + `key`）
**Parent tip**: `71ad2a7`（full `71ad2a7fccaa3dd43b47e2c54b9823890aaabdf9` · includes AE `3409862`）
**Date**: 2026-10-06
**Line**: **AG**

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
| UC-E2E-001 ADV 列 | **blind / `case-only`**（retained · Ban flip） |
| Line Y NEG / Line AB BOUND | 原样（Ban wash） |

## 请审什么（mw-e2e-ha · 选刀 / **/turn 结构面注入合同** / 状态+账本不变量 / 正控·变异 / EXIT 诚实 · B1–B5 · **N1–N4**）

Line AG · 选 NHP-001-ADV-01（SCOPE UC-001 ADV only · 非 UC-004 FAULT fallback · 非 018/052/025）。本 stub 为 **re-PRE3 rewrite**（supersedes `4e9f568` · 解除 rag FAIL `a3364b4`/`71ad2a7` **B-R2-1 + C1–C6**；**保留** N1–N4 / B1–B5；peer PASS `5875644` alone ≠ dual）。请先审：

- **B-R2-1**：逐字自检收据 `receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md`（CMD · +08:00 · EXIT · first fail · reason `docker.sock`|`key`）且 harness B5 引用该路径。
- **C1**：B5 钉 `run-e2e-isolated.mjs:2124`/`:2134` 为 docker.sock 落点；**L0 = Key assert only**（neg `:61-65` / bound `:56-60`）；两独立标签 `env-blocked(docker.sock)` 与 `L0-guard(key)`（Ban 合并）。
- **C2**：变异记 V1 实际 HTTP status+error（预期 202 或 409 `question_not_ready`/`stale_question` · 非 400 `invalid`）+ EXIT≠0 · temp only · never commit。
- **C3**：LEDGER-SNAP 加 owner-scoped `entitlement_consumption` **total row count** + **all buckets**（镜像 bound `:158-162`）。
- **C4**：正控与 V2 各独立 seed **issued** 题（不同 questionId/turn）；同题二次 → 409 `stale_question`（`interview-question.ts:80-95`）。
- **C5**：V3 钉 HTTP **200**（`resume.controller.ts:17` · errata `71ad2a7`）。
- **C6**：断言 seeded 题行 `status='issued'`。
- **N1–N4 保留**：账本=`entitlement_consumption`+非空转；V4=`completeInterviewAndConfirm`+replay 钉码；B5 env 分类 + 未满足→ADV≠EXIT0；引文逐字。
- 非阻断 S1–S5 已并入 harness。

其余（B1–B5 · 保留）：

1. **选刀**：UC-001 ADV 列（matrix `:112`）= **blind**/case-only 且无真证据注记 → 选 NHP-001-ADV-01；fallback GAP-UC004-FAULT residual（`:115` gap · Line T 收据已存）不触发 —— 裁决是否成立、是否与 Y（NEG）/ AB（BOUND）不冲突。
2. **B1 靶**：V1/V2/V4 落在 `POST /interview/:id/turn`（TurnDto）；**Ban** GONE `POST /:id/answer`（410 · 无 Body）。可选 `POST /:id/answers` 须钉 `MEETWISE_PUBLIC_PREVIEW` 且不与 `/turn` 混写。
3. **B2**：V3 仅 `POST /resume`（UploadResumeDto 非 strict · 剥离）；**无** quiz/JD 文本 ingress（absent）。
4. **B3 钉码**：TurnDto/InterviewAnswerPreviewSubmitDto `.strict()` → **400** `{error:'invalid', issues:[unrecognized_keys…]}`；UploadResumeDto 非 strict → strip+accept · V3 钉 **200**。每 V 须 HTTP status + error 码 + 副作用快照（LEDGER-SNAP：`interview.status` · `interview_job` 计数 · **`entitlement_consumption`** status/units + **owner total row count** + **all buckets** · `commerce_outbox` 计数 · `interview_event` max seq delta）。已知 `/turn`：`invalid_turn` 400 · `answer_hash_mismatch` 422 · `answer_conflict` 409 · `interview_not_active` 409 · `interview_not_started` 409。
5. **B4**：正控合法 `/turn`→**202**+恰好 1 answer job（**独立** issued 种子 · 异于 V2）；变异（temp）去 TurnDto `.strict()`→V1 EXIT≠0 且记实际 status/error（202 或 409 · 非 400）后丢弃；V4 confirmed = 隔离 PG **seeded fixture，镜像 `completeInterviewAndConfirm`**（interview `completed` + `entitlement_consumption` confirmed · Ban 无模型 full main-chain 叙述）。
6. **B5**：授权执行后 `pnpm uc001:nhp-neg:prove` + `pnpm uc001:nhp-bound:prove` 仍 EXIT0 · **零** proof/收据改动（Y · AB `f8cdc82`）；两独立标签 `env-blocked(docker.sock)`（`:2124/:2134`）/ `L0-guard(key)`（L0=Key only）· 自检收据必引 · **B5 未满足 → ADV ≠ EXIT0**（见 N3/C1）。
7. **V5** GuardrailHit absent；**Ban live** · **Ban fake-model**；EXIT0≠covered · coveredCount=8；Ban fake-green suite。
8. **非阻断**：V2 经 `/turn` 只入队 answer job；评分=worker Key-blocked；API 可证 = 文本数据化 + status 仍 `created` + 无 skip · Ban 伪造评估。
9. **边界**：docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail；Ban 碰 018/052/025 · Ban wash Y/AB · Ban 碰 Line AD/AE/AF/AH。

UC-E2E-001 ADV stays **blind/`case-only`** until future prove+dual+nail. **EXIT0≠covered** · coveredCount=8 · **Ban live** · **Ban fake-model** · **Ban wash Y/AB**.

本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · re-PRE3 rewrite · supersedes 4e9f568 · FAIL a3364b4/71ad2a7 B-R2-1+C1–C6 · N1–N4/B1–B5 retained · peer PASS 5875644 alone≠dual · Ban coding · awaiting expert re-PRE3 dual · STOP*

---

## Historical FAIL receipts（retained · do not erase）

- **`3f3a2e4`**（`3f3a2e4f45b0531e305ba0520ef8c0b5daa80938`）· mw-e2e-ha **re-PRE FAIL** on REQUEST `626e060` · N1 ledger table · N2 V4 fixture/pin · N3 B5 env-EXIT1 disclosure absent · N4 misquote · 正文保留于 `reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-re-pre-mw-e2e-ha.md`（本 rewrite **未修改**该文件）· Verdict: FAIL（历史 · 不构成对新稿的 PASS/FAIL）。
- **`f215438`** · mw-e2e-ha 对 `5eba515` 的 PRE PASS —— 已由 `3f3a2e4` §0 自我撤回作废（历史保留）。
- **`863a5e6`** · mw-rag-route PRE-EXEC FAIL on `5eba515`（B1–B5）· 正文保留于 rag stub 历史段。
- **`a3364b4`/`71ad2a7`** · mw-rag-route **Re-PRE2 FAIL** on REQUEST `4e9f568` · B-R2-1 self-check not committed verbatim · C5 200 unpinned（errata `:17`）· 正文保留于 rag stub · 本 re-PRE3 声称已解除 · **不**构成对新稿 PASS。
- **`5875644`** · mw-e2e-ha re-PRE2 PASS on `4e9f568` · **alone ≠ dual**（rag FAIL ⇒ BOTH not PASS）· 历史旁证 · 不代签本 re-PRE3。

