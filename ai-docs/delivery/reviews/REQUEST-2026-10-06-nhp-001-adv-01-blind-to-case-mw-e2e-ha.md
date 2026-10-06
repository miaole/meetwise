# REQUEST — **NHP-001-ADV-01 · UC-001 ADV blind→case**（主链内注入串 · 结构拒 · 不改 confirmed 账 · EXIT0≠covered）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite · awaiting re-PRE · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: supersedes REQUEST `5eba515` · cites FAIL `863a5e6` B1–B5 addressed · REQUEST 实质变更 → e2e 须 **re-PRE**（先前 alone PASS ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/nhp-001-adv-01-blind-to-case.md` · slice `nhp-001-adv-01-blind-to-case.slice.md`
**Parent tip**: `ac590ab`（full `ac590ab7b513a9b776c6a6399eb2eb75258e9582`）
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

## 请审什么（mw-e2e-ha · 选刀 / **/turn 结构面注入合同** / 状态+账本不变量 / 正控·变异 / EXIT 诚实 · B1–B5）

Line AG · 选 NHP-001-ADV-01（SCOPE UC-001 ADV only · 非 UC-004 FAULT fallback · 非 018/052/025）。本 stub 为 **rewrite**（解除 FAIL `863a5e6` B1–B5）。请审：

1. **选刀**：UC-001 ADV 列（matrix `:112`）= **blind**/case-only 且无真证据注记 → 选 NHP-001-ADV-01；fallback GAP-UC004-FAULT residual（`:115` gap · Line T 收据已存）不触发 —— 裁决是否成立、是否与 Y（NEG）/ AB（BOUND）不冲突。
2. **B1 靶**：V1/V2/V4 落在 `POST /interview/:id/turn`（TurnDto）；**Ban** GONE `POST /:id/answer`（410 · 无 Body）。可选 `POST /:id/answers` 须钉 `MEETWISE_PUBLIC_PREVIEW` 且不与 `/turn` 混写。
3. **B2**：V3 仅 `POST /resume`（UploadResumeDto 非 strict · 剥离）；**无** quiz/JD 文本 ingress（absent）。
4. **B3 钉码**：TurnDto/InterviewAnswerPreviewSubmitDto `.strict()` → **400** `{error:'invalid', issues:[unrecognized_keys…]}`；UploadResumeDto 非 strict → strip+accept。每 V 须 HTTP status + error 码 + 副作用快照（`interview.status` · `interview_job` 计数 · `consumption_record` status/units · `interview_event.seq`）。已知 `/turn`：`invalid_turn` 400 · `answer_hash_mismatch` 422 · `answer_conflict` 409 · `interview_not_active` 409 · `interview_not_started` 409。
5. **B4**：正控合法 `/turn`→**202**+恰好 1 answer job；变异（temp）去 TurnDto `.strict()`→V1 EXIT≠0 后丢弃；V4 confirmed = 隔离 PG **seeded fixture**（Ban 无模型 full main-chain 叙述）。
6. **B5**：授权执行后 `pnpm uc001:nhp-neg:prove` + `pnpm uc001:nhp-bound:prove` 仍 EXIT0 · **零** proof/收据改动（Y · AB `f8cdc82`）。
7. **V5** GuardrailHit absent；**Ban live** · **Ban fake-model**；EXIT0≠covered · coveredCount=8；Ban fake-green suite。
8. **非阻断**：V2 经 `/turn` 只入队 answer job；评分=worker Key-blocked；API 可证 = 文本数据化 + status 仍 `created` + 无 skip · Ban 伪造评估。
9. **边界**：docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail；Ban 碰 018/052/025 · Ban wash Y/AB · Ban 碰 Line AD/AE/AF/AH。

UC-E2E-001 ADV stays **blind/`case-only`** until future prove+dual+nail. **EXIT0≠covered** · coveredCount=8 · **Ban live** · **Ban fake-model** · **Ban wash Y/AB**.

本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · rewrite · awaiting expert re-PRE dual · STOP*
