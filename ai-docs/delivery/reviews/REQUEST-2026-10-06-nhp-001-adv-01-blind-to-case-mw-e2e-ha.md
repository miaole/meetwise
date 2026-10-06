# REQUEST — **NHP-001-ADV-01 · UC-001 ADV blind→case**（主链内注入串 · 结构拒 · 不改 confirmed 账 · EXIT0≠covered）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE2** · awaiting re-PRE · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: **supersedes REQUEST `626e060`** · cites mw-e2e-ha re-PRE FAIL **`3f3a2e4`**（`3f3a2e4f45b0531e305ba0520ef8c0b5daa80938`）**N1–N4 addressed** · B1–B5 fixes（FAIL `863a5e6` on `5eba515`）retained · REQUEST 实质变更 → e2e 须 **re-PRE**（`3f3a2e4` FAIL 收据保留不擦除）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/nhp-001-adv-01-blind-to-case.md` · slice `nhp-001-adv-01-blind-to-case.slice.md`
**Parent tip**: `3e3b2af`（full `3e3b2af0ce46c294856b4c4f40ae181845ba9cb8`）
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

Line AG · 选 NHP-001-ADV-01（SCOPE UC-001 ADV only · 非 UC-004 FAULT fallback · 非 018/052/025）。本 stub 为 **re-PRE2 rewrite**（解除 re-PRE FAIL `3f3a2e4` N1–N4；保留 FAIL `863a5e6` B1–B5 修订）。请先审 N1–N4：

- **N1 账本表**：LEDGER-SNAP 与 V4 seed 全部改为 **`entitlement_consumption`**（`status` · `units_requested` · `units_settled` · `allocations` · key = interview id）+ `entitlement_bucket.units_reserved/units_consumed` + `commerce_outbox` 计数；`consumption_record`（旧表 · API 零引用）Ban；加非空转守卫（恰好 1 行且状态符合预期，否则 FAIL）+ 守卫自检变异（d）。
- **N2 V4 fixture**：离线调用产品函数 `completeInterviewAndConfirm`（`commerce.ts:163-189`）→ interview `completed` + `entitlement_consumption` confirmed + `units_settled` + bucket 已消费（披露 seeded）；replay 钉死 V1-replay **400** `invalid/unrecognized_keys` · V2 族 replay **409** `interview_not_active` · `answer` job delta 0 · LEDGER-SNAP 逐字节相同。
- **N3 B5 env EXIT1 分类**：box `uc001:nhp-neg/bound` EXIT1 源自 docker.sock 权限缺口或 `MODEL_API_KEY` Ban-live L0 闸 = `env-blocked`/`L0-guard` **≠ proof regression 证据**；**B5 未满足 → ADV ≠ EXIT0**，Ban 叙述为回归通过 / ADV 通过 / flake；授权后仍须 ENV-capable 环境 EXIT0 + 零 proof 改动；执行形式钉 `with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-{neg,bound}:prove`。
- **N4 引文**：「Quoted from the files」改为 fenced 逐字原文；`/turn` 移到读码观察 + SSOT↔代码漂移注记（SSOT `:72` 仍写 `/answer` · `:58` JD · `:76` `consumption_record`；Ban SSOT edit）。
- 非阻断 S1–S5 已并入 harness（preview 钉 env · seq delta 实测 · 行号 `:127`/`:163` · `TURN_RL` ≤30 · `answerHash` SHA-256 重算）。

其余（B1–B5 · 保留）：

1. **选刀**：UC-001 ADV 列（matrix `:112`）= **blind**/case-only 且无真证据注记 → 选 NHP-001-ADV-01；fallback GAP-UC004-FAULT residual（`:115` gap · Line T 收据已存）不触发 —— 裁决是否成立、是否与 Y（NEG）/ AB（BOUND）不冲突。
2. **B1 靶**：V1/V2/V4 落在 `POST /interview/:id/turn`（TurnDto）；**Ban** GONE `POST /:id/answer`（410 · 无 Body）。可选 `POST /:id/answers` 须钉 `MEETWISE_PUBLIC_PREVIEW` 且不与 `/turn` 混写。
3. **B2**：V3 仅 `POST /resume`（UploadResumeDto 非 strict · 剥离）；**无** quiz/JD 文本 ingress（absent）。
4. **B3 钉码**：TurnDto/InterviewAnswerPreviewSubmitDto `.strict()` → **400** `{error:'invalid', issues:[unrecognized_keys…]}`；UploadResumeDto 非 strict → strip+accept。每 V 须 HTTP status + error 码 + 副作用快照（LEDGER-SNAP：`interview.status` · `interview_job` 计数 · **`entitlement_consumption`** status/units_requested/units_settled/allocations · `entitlement_bucket` units · `commerce_outbox` 计数 · `interview_event` max seq delta）。已知 `/turn`：`invalid_turn` 400 · `answer_hash_mismatch` 422 · `answer_conflict` 409 · `interview_not_active` 409 · `interview_not_started` 409。
5. **B4**：正控合法 `/turn`→**202**+恰好 1 answer job；变异（temp）去 TurnDto `.strict()`→V1 EXIT≠0 后丢弃；V4 confirmed = 隔离 PG **seeded fixture，镜像 `completeInterviewAndConfirm`**（interview `completed` + `entitlement_consumption` confirmed · Ban 无模型 full main-chain 叙述）。
6. **B5**：授权执行后 `pnpm uc001:nhp-neg:prove` + `pnpm uc001:nhp-bound:prove` 仍 EXIT0 · **零** proof/收据改动（Y · AB `f8cdc82`）；env EXIT1（docker.sock / Key L0）= env-blocked ≠ 回归证据，且 **B5 未满足 → ADV ≠ EXIT0**（见 N3）。
7. **V5** GuardrailHit absent；**Ban live** · **Ban fake-model**；EXIT0≠covered · coveredCount=8；Ban fake-green suite。
8. **非阻断**：V2 经 `/turn` 只入队 answer job；评分=worker Key-blocked；API 可证 = 文本数据化 + status 仍 `created` + 无 skip · Ban 伪造评估。
9. **边界**：docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail；Ban 碰 018/052/025 · Ban wash Y/AB · Ban 碰 Line AD/AE/AF/AH。

UC-E2E-001 ADV stays **blind/`case-only`** until future prove+dual+nail. **EXIT0≠covered** · coveredCount=8 · **Ban live** · **Ban fake-model** · **Ban wash Y/AB**.

本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · re-PRE2 rewrite · supersedes 626e060 · FAIL 3f3a2e4 N1–N4 addressed · awaiting expert re-PRE dual · STOP*

---

## Historical FAIL receipts（retained · do not erase）

- **`3f3a2e4`**（`3f3a2e4f45b0531e305ba0520ef8c0b5daa80938`）· mw-e2e-ha **re-PRE FAIL** on REQUEST `626e060` · N1 ledger table · N2 V4 fixture/pin · N3 B5 env-EXIT1 disclosure absent · N4 misquote · 正文保留于 `reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-re-pre-mw-e2e-ha.md`（本 rewrite **未修改**该文件）· Verdict: FAIL（历史 · 不构成对新稿的 PASS/FAIL）。
- **`f215438`** · mw-e2e-ha 对 `5eba515` 的 PRE PASS —— 已由 `3f3a2e4` §0 自我撤回作废（历史保留）。
- **`863a5e6`** · mw-rag-route PRE-EXEC FAIL on `5eba515`（B1–B5）· 正文保留于 rag stub 历史段。
