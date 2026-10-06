# REQUEST — **NHP-001-ADV-01 · UC-001 ADV blind→case**（主链内注入串 · 结构拒 · 不改 confirmed 账 · EXIT0≠covered）· pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE2** · awaiting re-PRE · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: **supersedes REQUEST `626e060`** · cites mw-e2e-ha re-PRE FAIL **`3f3a2e4`**（`3f3a2e4f45b0531e305ba0520ef8c0b5daa80938`）**N1–N4 addressed** · prior rag FAIL receipt `863a5e6` B1–B5 fixes retained · rag **须 re-PRE**（e2e 亦须 re-PRE；alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
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

## 请审什么（mw-rag-route · 主链输入数据化 / **/turn vs GONE /answer** / 031·032 委派边界 / GuardrailHit absent · Ban wash · B1–B5）

Line AG · 选 NHP-001-ADV-01（SCOPE UC-001 ADV only · 非 UC-004 FAULT fallback · 非 018/052/025）。本 stub 为 **re-PRE2 rewrite**（`626e060` 已解除本专家 FAIL `863a5e6` B1–B5；本稿再解除 e2e re-PRE FAIL `3f3a2e4` N1–N4：**N1** 账本快照/seed 改 `entitlement_consumption` + 非空转守卫 · **N2** V4 fixture 镜像 `completeInterviewAndConfirm`（interview `completed` + confirmed）· replay 钉 400 `invalid` / 409 `interview_not_active` · **N3** B5 env EXIT1（docker.sock / `MODEL_API_KEY` L0）= env-blocked ≠ 回归证据，且 B5 未满足 → ADV ≠ EXIT0 · **N4** 引文区逐字 · `/turn` 移入读码观察 + SSOT `:72` `/answer` 漂移注记）。请审：

1. **委派边界**：NHP `:39`「委派 031/032」—— 031/032 静态 S1–S6 + e2e gap / eval partial（matrix `:129`）**不**构成 UC-001 ADV 收据；本刀证据也 **不**反哺 031/032。
2. **B1**：V1/V2/V4 改靶 `POST /interview/:id/turn`（TurnDto · controller `:30-33`）；**Ban** `POST /:id/answer`（`:242-245` · 410 GONE · 无 Body · service `:914`）。可选 preview `POST /:id/answers`（`:38-46` · PublicPreviewControlledWriteGuard）须钉 `MEETWISE_PUBLIC_PREVIEW` 且 **不与 `/turn` 证据混写**。
3. **B2**：V3 删发明 quiz/JD；保留 `POST /resume` UploadResumeDto `{ text }` 非 strict（`:24` · 多余键静默剥离）；quiz `create(@Req())` 无 body（`:17-20`）· **JD 文本 ingress = absent**（同 V5 写法）。
4. **B3**：TurnDto `.strict()` / InterviewAnswerPreviewSubmitDto `.strict()` → **400** `{error:'invalid', issues:[unrecognized_keys…]}`（zod.pipe `:10`）；逐 V 钉 status + error + 副作用快照；已知 `/turn` 码：`invalid_turn` 400 · `answer_hash_mismatch` 422 · `answer_conflict` 409 · `interview_not_active` 409 · `interview_not_started` 409。
5. **B4**：正控合法 `/turn`→202 + 恰好 1 `enqueueInterviewJob(...,'answer')`；变异 temp 去 `.strict()`→V1 转红后丢弃；V4 confirmed = 隔离 PG **seeded fixture，离线调用 `completeInterviewAndConfirm`**（commerce `:163-189` · confirm `:127` 写 `entitlement_consumption` · interview `completed` · Ban 无模型叙述 full main-chain）；账本快照表 = `entitlement_consumption`（Ban `consumption_record`）。
6. **B5**：执行后 `pnpm uc001:nhp-neg:prove` + `pnpm uc001:nhp-bound:prove` EXIT0 · 不改 proof/收据（Y · AB `f8cdc82`）；env EXIT1（docker.sock / Key L0）= env-blocked ≠ 回归证据 · **B5 未满足 → ADV ≠ EXIT0**。
7. **V5 GuardrailHit absent**：`rg -il guardrail apps/api/src packages/*/src` = 0 → 如实登记 absent，Ban 假称已接。
8. **不主张模型层防注入**：Key-blocked + Ban fake-model；结构面证据 ≠ 安全闭环。
9. **非阻断**：V2 经 `/turn` 只入队 answer job；评分=worker Key-blocked；API 可证 = 文本数据化 + status 仍 `created` + 无 skip · Ban 伪造评估。
10. **Ban wash Y/AB**：Line Y NEG / Line AB BOUND 收据不动、不互借；EXIT0 ≠ covered · coveredCount=8。
11. **专家对**：mw-e2e-ha + mw-rag-route（非 mw-model-op · 无模型面主张）是否成立。
12. **边界**：docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail；Ban touching 018/052/025 · Ban covered flip · Ban secrets · Ban force-push。

UC-E2E-001 ADV stays **blind/`case-only`** until future prove+dual+nail. **EXIT0≠covered** · coveredCount=8 · **Ban live** · **Ban fake-model** · **Ban wash Y/AB**.

本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · re-PRE2 rewrite · supersedes 626e060 · FAIL 3f3a2e4 N1–N4 addressed · awaiting expert re-PRE dual · STOP*

---

## Historical FAIL receipt（retained · do not erase verdict · REQUEST `5eba515` · tip then）

> 以下为 mw-rag-route 对 **旧 REQUEST `5eba515`** 的 PRE-EXEC FAIL 正文（commit `863a5e6`）。本 rewrite 声称已按 §5 解除条件修订；**新 stub 上方为 PENDING re-PRE**，本段仅作历史证据，**不**构成对新稿的 PASS/FAIL。

## mw-rag-route PRE-EXEC 审查（Line AG · docs gate only · 2026-10-06 13:10 +08:00）

**审查基线**：origin tip `2d422c14e585c544a162f536cc9b3058a7d14e30`（含 `b12e20d`）· REQUEST `5eba515ac638d6c6a2d51c9ff96cfd5d47ba6d22`（作者 meetwise-core）。本审零实跑、零产品改动，只追加本 stub。`git diff --stat 416b6a5 2d422c1 -- apps/api/src packages` 为空 → 下列行号 @ base 与 @ tip 相同。alone ≠ dual；不代签 mw-e2e-ha。

### 1. Docs-only

`git show --stat 5eba515a`：仅 4 个 docs 文件（harness 91 · slice 31 · 两 stub 各 44），零代码/脚本/`package.json`。

### 2. 已核实为真（非阻断）

- `non-happy-path-perf-load-case-matrix.md:39` NHP-001-ADV-01「结构拒或 GuardrailHit；不改 confirmed 账 · case-only · 委派 031/032」—— 原文一致。
- `e2e-requirement-coverage-matrix.md:112` UC-E2E-001 = **blind** / `case-only`，NEG 注记为 Line Y（`1761311`/`ff74522` · 3b605ac + 51c0c0b）；`:129` 031/032 = gap(e2e)/partial(eval)「禁 fake-model 冒充安全闭环」—— 一致。
- 控制器口：`resume.controller.ts:11` `@Controller('resume')` · `quiz.controller.ts:11` `@Controller('quiz')` · `interview.controller.ts:14` `@Controller('interview')` · `:242` `@Post(':id/answer')` —— 行号均真。
- GuardrailHit：`grep -ril guardrail apps/api/src packages/*/src` = **0**（仅 `apps/api/test/uc-e2e-011-…adv.proof.ts` · `uc-e2e-031-032-injection-jailbreak.proof.mjs` · `uc-e2e-014-026-webhook-adv.proof.ts`）→ V5「absent 如实登记」诚实。
- 证据层单一：harness:43 / :57 均为 `run-e2e-isolated.mjs` + 真 PG + 不加载 MODEL_API_KEY；**无**「隔离壳三层 / 形态对齐 in-process」自相矛盾（grep 0 命中）。
- 分离：harness:71 Ban wash Y（GAP-UC001-NEG-01）/ AB（GAP-UC001-BOUND-01）；:73 / :79 Ban 018/052/025；:72 本刀证据不反哺 031/032；:70 coveredCount=8、Ban covered flip；:58 EXIT0 ≠ covered；:37 不主张模型层防御。FUNNEL / G-R4-5 / `r4-funnel-*` 在 harness/slice 中 0 命中、不触碰。
- 专家对 mw-e2e-ha + mw-rag-route（不主张模型面 → 不需 mw-model-op）成立。

### 3. 阻断项（Blocking）

**B1 · V1/V2 靶向已下线端点 → 必然假绿。** harness:35 / :49 把作答注入落在 `POST /interview/:id/answer`。实况：`interview.controller.ts:242-246` 该路由 `@HttpCode(HttpStatus.GONE)`、**无 `@Body`**；`interview.service.ts:913-914` `answer()` 无条件抛 `410 legacy_answer_endpoint_disabled`（`replacement:'turn'`）；`:154` 注释「/answer 在认证后无条件 410，不参与任何面试状态判断」。对该口注入任何内容都得 410 且零状态变化 —— V1/V2 将不经任何产品防御即「通过」。真实作答入口是 `POST :id/turn`（`interview.controller.ts:30-33` · `ZodValidationPipe(TurnDto)` → `interview.service.ts:343-373`）及预览账本 `POST :id/answers`（`:38-46` · `PublicPreviewControlledWriteGuard`）。须改靶并重写 V1/V2/V4 合同。

**B2 · V3「`POST /quiz` JD 文本」为不存在的输入面。** `quiz.controller.ts:17-20` `create(@Req() req)` **不收 body**；`:24-28` `begin` 只收 header `resume-id`；`packages/contracts/src/index.ts` 无 JD 文本 DTO。V3 的 quiz/JD 分支是发明锚点。须删除，或指认真实 JD 入口；若无，登记 absent（同 V5 写法）。简历分支可保留：`resume.controller.ts:16-19` `UploadResumeDto`（`contracts/src/index.ts:24` `z.object({ text })` · **非 strict** → 多余键静默剥离）。

**B3 · 未钉精确 HTTP 状态 / 错误码。** harness:49「4xx 具名码 或 静默忽略」二选一未定。产品事实可直接钉死：`TurnDto` `.strict()`（`contracts/src/index.ts:56-63`）与 `InterviewAnswerPreviewSubmitDto` `.strict()`（`:650-655`）→ 越权字段 = **400 `{error:'invalid', issues:[unrecognized_keys…]}`**（`apps/api/src/platform/zod.pipe.ts:10`）；`UploadResumeDto` 非 strict → 剥离 + 正常受理。`/turn` 其余已知码：`invalid_turn` 400（`interview.service.ts:347`）· `answer_hash_mismatch` 422（`:369`）· `answer_conflict` 409（`:372`）· `interview_not_active` 409（`:156`）· `interview_not_started` 409（`:159`）。每个 V 须写死「状态码 + error 码 + 副作用快照」（`interview.status`、`interview_job` 计数、`consumption_record` status/units、`interview_event.seq`）。

**B4 · 无正控、无变异计划。** harness 全文无 positive control / mutation。最低要求：(a) 正控 —— 同一已 begin 会话发**合法** `/turn` → 202 且恰好 1 个 `answer` job 入队（`interview.service.ts:373` `enqueueInterviewJob`），证明路由活着、400 不是环境故障；(b) 变异 —— 仅在 temp worktree 去掉 `TurnDto` 的 `.strict()`，V1 必须转红（EXIT≠0），丢弃变异不提交；(c) V4 须写明如何离线得到 `confirmed` ConsumptionRecord（`confirmed` 由 worker 结算 `packages/db/src/commerce.ts:126` 产生，离线无模型时须用隔离 PG fixture 种子并披露为 seeded，不得叙述为走完主链）。

**B5 · 未要求 NEG/BOUND 回归。** 须写明执行后 `pnpm uc001:nhp-neg:prove`（`package.json:167`）与 `pnpm uc001:nhp-bound:prove`（`:169`）仍 EXIT 0，且本刀不改其 proof 文件 / 收据（AB 基线：`f8cdc82` · 隔离真 PG · 17 asserts；Y 基线：26 asserts）。

### 4. 非阻断提示

- V2 经 `/turn` 只入队 answer job，评分在 worker（需模型 = Key-blocked）；API 层可证者仅「文本原样数据化 + status 仍 `created`（`interview.service.ts:151` 注释：自适应流程全程 `created`）+ 无越级」，须如此限定，Ban 伪造评估。
- `/answers` 受 `MEETWISE_PUBLIC_PREVIEW` 控制；若纳入须钉 env 取值并披露，不得与 `/turn` 证据混写。

### 5. 解除条件（重提 REQUEST 后复审）

修订 harness：V1/V2/V4 改靶 `/turn`（可选 `/answers`）；V3 删 quiz/JD 或指认真入口；逐 V 钉状态码/错误码/副作用快照；补正控 + `.strict()` 变异 + V4 seeding 披露；补 NEG/BOUND 回归 EXIT 0 要求。其余（证据层、分离、Bans、pins）保持原样即可。

### 6. 门禁说明

NORTH-STAR-EXECUTION-LOOP 未见；本审以 `north-star-hard-gates.md` + 本 harness/slice 为门禁。

### Pins（本审不改）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained · UC-E2E-001 ADV stays blind/`case-only`

**结论**：选刀、证据层、分离与 Bans 诚实；但作答注入靶向无条件 410 的遗留端点（B1）、quiz/JD 输入面不存在（B2）、状态/错误码未钉（B3）、无正控与变异（B4）、未要求 NEG/BOUND 回归（B5）—— 按现稿执行会产出假绿。FAIL（B1–B5）。

Verdict: FAIL
