# REQUEST — **NHP-001-ADV-01 · UC-001 ADV blind→case**（主链内注入串 · 结构拒 · 不改 confirmed 账 · EXIT0≠covered）· pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE3** · awaiting re-PRE3 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: **re-PRE3 · supersedes REQUEST `4e9f568`** · cites rag Re-PRE2 FAIL **`a3364b4`/`71ad2a7`**（B-R2-1 + C1–C6）· N1–N4 / B1–B5 retained · peer e2e PASS `5875644` alone ≠ dual · Ban coding
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
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

## 请审什么（mw-rag-route · 主链输入数据化 / **/turn vs GONE /answer** / 031·032 委派边界 / GuardrailHit absent · Ban wash · B1–B5）

Line AG · 选 NHP-001-ADV-01（SCOPE UC-001 ADV only · 非 UC-004 FAULT fallback · 非 018/052/025）。本 stub 为 **re-PRE3 rewrite**（**supersedes `4e9f568`** · cites FAIL **`a3364b4`/`71ad2a7`** · 解除 **B-R2-1** 并落实 **C1–C6**；**保留** prior B1–B5 / N1–N4；peer e2e PASS `5875644` **alone ≠ dual**）。请审：

0. **B-R2-1 + C1–C6（本 re-PRE3 主因）**：逐字自检收据 `receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md`；B5 钉 `:2124/:2134` docker.sock 落点 + **L0=Key only**（neg `:61-65` / bound `:56-60`）· 两独立标签 `env-blocked(docker.sock)` / `L0-guard(key)`；变异记 V1 实际 202|409（非 400）+ EXIT≠0；LEDGER-SNAP + owner total rows + all buckets；正控≠V2 独立 issued 种子；V3 钉 **200**（`resume.controller.ts:17`）；断言 `status='issued'`。
其余（保留 B1–B5 / N1–N4 审点）：


1. **委派边界**：NHP `:39`「委派 031/032」—— 031/032 静态 S1–S6 + e2e gap / eval partial（matrix `:129`）**不**构成 UC-001 ADV 收据；本刀证据也 **不**反哺 031/032。
2. **B1**：V1/V2/V4 改靶 `POST /interview/:id/turn`（TurnDto · controller `:30-33`）；**Ban** `POST /:id/answer`（`:242-245` · 410 GONE · 无 Body · service `:914`）。可选 preview `POST /:id/answers`（`:38-46` · PublicPreviewControlledWriteGuard）须钉 `MEETWISE_PUBLIC_PREVIEW` 且 **不与 `/turn` 证据混写**。
3. **B2**：V3 删发明 quiz/JD；保留 `POST /resume` UploadResumeDto `{ text }` 非 strict（`:24` · 多余键静默剥离）· 钉 HTTP **200**（`resume.controller.ts:17`）；quiz `create(@Req())` 无 body（`:17-20`）· **JD 文本 ingress = absent**（同 V5 写法）。
4. **B3**：TurnDto `.strict()` / InterviewAnswerPreviewSubmitDto `.strict()` → **400** `{error:'invalid', issues:[unrecognized_keys…]}`（zod.pipe `:10`）；逐 V 钉 status + error + 副作用快照；已知 `/turn` 码：`invalid_turn` 400 · `answer_hash_mismatch` 422 · `answer_conflict` 409 · `interview_not_active` 409 · `interview_not_started` 409。
5. **B4**：正控合法 `/turn`→202 + 恰好 1 `enqueueInterviewJob(...,'answer')`（**独立** issued 种子 · 异于 V2 · 断言 `status='issued'`）；变异 temp 去 `.strict()`→V1 EXIT≠0 且记实际 status/error（202 或 409 · 非 400）后丢弃；V4 confirmed = 隔离 PG **seeded fixture，离线调用 `completeInterviewAndConfirm`**（commerce `:163-189` · confirm `:127` 写 `entitlement_consumption` · interview `completed` · Ban 无模型叙述 full main-chain）；账本快照 = `entitlement_consumption` + owner total rows + all buckets（Ban `consumption_record`）。
6. **B5**：执行后 `pnpm uc001:nhp-neg:prove` + `pnpm uc001:nhp-bound:prove` EXIT0 · 不改 proof/收据（Y · AB `f8cdc82`）；两独立标签 `env-blocked(docker.sock)`（`:2124/:2134`）/ `L0-guard(key)`（L0=Key only）· 自检收据必引 · **B5 未满足 → ADV ≠ EXIT0**。
7. **V5 GuardrailHit absent**：`rg -il guardrail apps/api/src packages/*/src` = 0 → 如实登记 absent，Ban 假称已接。
8. **不主张模型层防注入**：Key-blocked + Ban fake-model；结构面证据 ≠ 安全闭环。
9. **非阻断**：V2 经 `/turn` 只入队 answer job；评分=worker Key-blocked；API 可证 = 文本数据化 + status 仍 `created` + 无 skip · Ban 伪造评估。
10. **Ban wash Y/AB**：Line Y NEG / Line AB BOUND 收据不动、不互借；EXIT0 ≠ covered · coveredCount=8。
11. **专家对**：mw-e2e-ha + mw-rag-route（非 mw-model-op · 无模型面主张）是否成立。
12. **边界**：docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail；Ban touching 018/052/025 · Ban covered flip · Ban secrets · Ban force-push。

UC-E2E-001 ADV stays **blind/`case-only`** until future prove+dual+nail. **EXIT0≠covered** · coveredCount=8 · **Ban live** · **Ban fake-model** · **Ban wash Y/AB**.

本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · re-PRE3 rewrite · supersedes 4e9f568 · FAIL a3364b4/71ad2a7 B-R2-1+C1–C6 · N1–N4/B1–B5 retained · peer PASS 5875644 alone≠dual · Ban coding · awaiting expert re-PRE3 dual · STOP*

---

## Rewrite note · re-PRE3（append · do not erase FAIL sections below）

**re-PRE3 · supersedes `4e9f568` · cites FAIL `a3364b4`/`71ad2a7`** · B-R2-1 verbatim self-check committed at `receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md`（reason tags `docker.sock` + `key`）· C1–C6 landed in harness/slice · N1–N4 / B1–B5 retained · Status stays `draft:awaiting_pre_exec_dual` · Pins unchanged · Ban coding · Ban prove ADV · Ban live · Ban covered flip · Ban wash Y/AB/018/052/025 · peer e2e PASS `5875644` alone ≠ dual。

下方 Historical FAIL / Re-PRE / Re-PRE2 FAIL 正文 **原样保留不擦除**；本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL。

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

---

## Re-PRE @626e060（mw-rag-route · Line AG · docs gate only · 2026-10-06 13:35 +08:00）

**审查基线**：REQUEST `626e06053e4ae0bf9875c8e9b184bf175c35e3e4`（parent `ac590ab` · 作者 meetwise-core · supersedes `5eba515`）为 origin 祖先。`git show --stat 626e0605` = 4 个 docs 文件（harness · slice · 两 stub · +101/−52），零 `apps/` `packages/` `scripts/` `package.json`；`git diff --stat 416b6a5 626e0605 -- apps packages scripts package.json` 为空 → 下列源码行号 @ 626e060 与前审一致。本段只追加；上方 coordinator stub 改写与「Historical FAIL receipt」标题由 core 写入，我方 `863a5e6` FAIL 正文经 diff 核对未被改动。alone ≠ dual；不代签 mw-e2e-ha。

### 1. B1–B5 逐项

| 项 | 判定 | harness 证据 | 源码核验 |
|----|------|--------------|----------|
| **B1** 靶 GONE `/answer` | **已解决** | `:41` 真入口 `/turn` · `:42` 可选 `/answers` 须钉 `MEETWISE_PUBLIC_PREVIEW` 且不混写 · `:43` Ban 靶 `/answer` · `:64` V1 靶 `/turn` · `:104` Ban 列表 | `interview.controller.ts:30-33` `@Post(':id/turn')` `@HttpCode(202)` `ZodValidationPipe(TurnDto)` ✔ · `:38-46` `/answers` + `PublicPreviewControlledWriteGuard` ✔ · `:242-245` GONE 无 Body ✔ · `interview.service.ts:913-914` 410 `legacy_answer_endpoint_disabled` ✔ |
| **B2** 发明 quiz/JD 入口 | **已解决** | `:44` JD 入口 = absent · `:66` V3 仅 `POST /resume` · `:104` Ban 发明 | `quiz.controller.ts:17-20` 无 body ✔ · `resume.controller.ts:16-19` + `contracts/src/index.ts:24` `z.object({ text: z.string().min(20).max(60_000) })` 非 strict ✔ |
| **B3** 未钉码 | **已解决** | `:46` / `:58` / `:60` / `:64` 钉 400 `invalid` + `unrecognized_keys` + 四类副作用快照 | `contracts:56-63` `TurnDto…}).strict()` ✔ · `:650-655` Preview DTO `.strict()` ✔ · `zod.pipe.ts:10` `BadRequestException({ error: 'invalid', issues })` ✔ · service `:347` 400 `invalid_turn` · `:369` 422 · `:370-371` 409 `question_not_ready`/`stale_question` · `:372` 409 · `:156`/`:159` 409 —— 与 harness `:60` 一致 |
| **B4** 正控/变异/seed | **已解决（附条件 C1/C2）** | `:72` 正控合法 `/turn` → 202 + 恰好 1 个 `answer` job · `:73` 去 `.strict()` 变异 → V1 转红、不提交 · `:67`/`:74` V4 confirmed = 隔离 PG seeded fixture，Ban 叙述为走完主链 | `enqueueInterviewJob(...,'answer',...)` 在 service `:373` ✔ · `commerce.ts:126` `finalStatus = ratio >= 1 ? 'confirmed' : 'partial_confirmed'` 为 worker 结算真相 ✔。**变异确实会转红**：ZodValidationPipe 先于 service；去 `.strict()` 后越权键被剥离、请求进入 service，结果变成 202 或 409 `question_not_ready`，都不是 400 `invalid`，V1 断言失败 |
| **B5** NEG/BOUND 回归 | **已解决（附条件 C3）** | `:79` 执行后强制 `uc001:nhp-neg:prove` + `uc001:nhp-bound:prove` EXIT 0 · 不改 proof/收据 · `:80` EXIT0 含 B5 | `package.json:167`/`:169` 两命令存在；`git log 1761311.. -- apps/api/test/uc-e2e-001-nhp-{neg,bound}.proof.ts` 仅 `6e96cf5`（AB 创建 bound）→ 两 proof 自 Y/AB 起未被改动 |

### 2. core 基线自检「EXIT 1 = docker.sock / MODEL_API_KEY 触发 L0 Ban-live」的诚实性

- **落点**：该自检文字 **不在** 626e060 的 harness/slice/stub 中（grep 无命中），仅见于 meetwise 转述。须进入执行收据（见 C3）。
- **L0 守卫源码**：`apps/api/test/uc-e2e-001-nhp-neg.proof.ts:61-65` 与 `apps/api/test/uc-e2e-001-nhp-bound.proof.ts:56-60`：入口读 `MODEL_API_KEY` → `delete` → `A('L0 Ban live: MODEL_API_KEY absent on entry (not loaded)', !keyPresentOnEntry)`。**MODEL_API_KEY 存在 → 该断言失败 → EXIT 1** —— 这一半说法为真。
- **docker.sock 不是 L0 守卫**：L0 只检查 env key；docker socket 不可用时失败发生在 `scripts/run-e2e-isolated.mjs` 起 PG 容器阶段（`:2124` `docker run` · `:2134` `docker port`），属于环境/runner 层失败，不是「Ban-live L0」。说法须拆开写，不能合称 L0。
- **我方离线复跑 @ 626e060**（temp worktree `/tmp/mwrr-626e060x` · `pnpm install --frozen-lockfile` EXIT 0 · host = macOS Docker Desktop 29.1.3 / linuxkit 6.12.54 · shell 内 MODEL_API_KEY 未设 · 未用任何真 Key · 零云）：
  - `env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-neg:prove` → **EXIT 0** · `SUMMARY asserts=26 failed=0` · `L0-ENV {"model_api_key_present_on_entry":false,…}`
  - `env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-bound:prove` → **EXIT 0** · `SUMMARY asserts=17 failed=0`
  - 与 Y 基线（26/26）、AB 基线（17/17 · `f8cdc82`）一致 → core 的 EXIT 1 判为 **环境阻断，非回归**；本次复跑是 PRE 侧的基线旁证，**不是** B5 执行证据，也不洗 Y/AB。
- **harness 是否要求有效环境**：`:79` 只写「仍 EXIT 0」，**没写**「环境阻断导致的 EXIT 1 不计为 B5 通过、也不得叙述为通过」→ 条件 C3。

### 3. 证据层 / 越界 / 洗白 / covered

- 证据层单一：`:54` / `:78` 均为 `run-e2e-isolated.mjs` + 真 PG + 不加载 MODEL_API_KEY；harness/slice 中「隔离壳 / 形态对齐 / in-process / fake DB」grep 0 命中 → 无新自相矛盾。
- Y/AB：`:93` 不动不洗；B5 仅要求复跑原 proof，不改不借。018/052/025：`:95` / `:101` Ban。FUNNEL / G-R4-5 / `r4-funnel`：0 命中，未触碰。covered：`:92` ADV stays blind/`case-only` · `:80` EXIT0 ≠ covered · coveredCount=8。模型层：`:48` / `:108` 不主张、评分 Key-blocked。

### 4. 条件（PASS 附带）

1. **C1 正控与 V2 的题目 seed 须披露**：合法 `/turn` 要拿到 202，`claimInterviewAnswer`（`packages/db/src/interview-question.ts:69`）必须查到 `interview_question` 行；查不到返回 `not_ready` → 409 `question_not_ready`（service `:370`）。离线无 worker/模型时这一行只能 seed，须与 V4 一样标注 **seeded fixture**（题行 + `answerHash`/`stateVersion`/`turn` 对齐）。Ban 把 409 `question_not_ready` 记作正控通过，Ban 叙述为 worker 出题。
2. **C2 变异记录**：变异 run 须记下去 `.strict()` 后 V1 的实际 status/error（预期 202 或 409 `question_not_ready`，不是 400 `invalid`）+ EXIT≠0；只在 temp worktree 内做，丢弃，不提交。`/turn` 时 `MEETWISE_PUBLIC_PREVIEW` 须保持 unset（service `:344` `denyPublicPreviewWrite`）；若加测 `/answers`，单独 env、单独记账。
3. **C3 B5 有效环境**：B5 回归须在 MODEL_API_KEY / MODEL_BASE_URL unset、docker 可用的环境中跑；收据须记 `L0-ENV` 行与 `SUMMARY asserts=26/17 failed=0`。因 Key 泄入（L0 断言 `neg:65` / `bound:60`）或 docker.sock / runner 起容器失败导致的 EXIT 1 = **env block**：既不计为 B5 通过，也不得叙述为通过或回归；须修环境后重跑。core 基线自检须原样写入执行收据，并拆分两种原因（L0 Key 断言 ≠ docker runner 失败）。
4. **C4 频控**：V1/V2/V4/正控在同一 principal 下连续 `/turn`，可能触发 `too_many_requests` 429（service `:354-355` `TURN_RL`）；须分 principal 或间隔，Ban 把 429 记作结构拒。
5. **C5 V3 实际状态码**：执行时钉 `POST /resume` 实测 2xx 码与剥离后的落库字段（`:66`「2xx 依现实现」须落为具体码）。

### Pins（本审不改）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained · UC-E2E-001 ADV stays blind/`case-only`

**结论**：B1–B5 均已在 harness 中落地，锚点与产品真实返回一致，变异可真转红，证据层单一，无洗白、无越界、无 covered 翻转；core 的 EXIT 1 经离线复跑（26/26 · 17/17 EXIT 0）证实为环境阻断。PASS（附 C1–C5）。PASS ≠ coding ≠ prove ≠ covered ≠ nail；须 mw-e2e-ha 独立 PASS + 协调方 AUTHORIZE。

Verdict: PASS

---

## Re-PRE2 @4e9f568（mw-rag-route · Line AG · 只审文档 · 2026-10-06 14:20 +08:00）

**基线**：REQUEST `4e9f568ce6e8bf71cc91465b6ff07b1a5d792323`（parent `3e3b2af` · meetwise-core · 取代 `626e060`），是 origin 的祖先；改动 4 个文档文件（harness +83/−22 · slice +15/−6 · e2e 占位 +25/−9 · 本占位页眉 +7/−7），零代码。这是一次全新审查，不沿用 `2fadf2b` 对 `626e060` 的 PASS。**执行机披露**：本审只读 box 文件系统和 GitHub 只读原文，**没有复跑任何 prove**，用户 Mac 上没有执行任何命令。回执由 mw-rag-route 在 box 临时 worktree（origin @ `5875644`）中提交。另披露：此前引用的 `626e060` 离线复跑结果（neg 26/26 · bound 17/17 EXIT 0）是在用户 Mac 上跑的（发生在新规之前），不计为 box 证据。不代签 mw-e2e-ha（其 re-PRE2 PASS `5875644` 独立存在）。

### 1. N1–N4（mw-e2e-ha `3f3a2e4`）
- **N1 已解决**：账本快照和 V4 seed 改用 `entitlement_consumption`。该表真实存在（`packages/db/sql/02_commerce.sql:27-40`，字段 `status`/`units_requested`/`units_settled`/`allocations`，唯一键 `(owner, idempotency_key)`）。写入点：`commerce.ts:48-51`（reserve）、`:85`（allocations）、`:127`（confirm）；bucket 在 `:73-75`/`:121-123`；outbox 在 `:129-131`。「恰好 1 行」守卫能抓出第二条扣费行，bucket units 和 outbox 计数能抓出双重结算。
- **N2 已解决**：V4 fixture 离线调用 `completeInterviewAndConfirm`（`commerce.ts:163-189`）。DB 触发器 `02_commerce.sql:88-124` 强制 completed⇔confirmed，所以这是唯一自洽的 seed 方式。V2 族 replay 得 409 `interview_not_active`，因为 `assertAnswerable`（`:367`）在 claim（`:368`）之前执行；V1-replay 得 400，因为 pipe 在 service 之前执行。
- **N3 部分解决**：B5 已写入 env EXIT1 分类，也写明「B5 未满足 → ADV ≠ EXIT0」；但 core 自检的原始记录没有入库，见 B-R2-1。
- **N4 已解决**：引文与 `e2e-scenarios.md:58/:61/:72/:76` 逐字一致。

### 2. B1–B5（相对 `626e060` 无回退）
`/turn` 锚点逐项复核属实：`interview.service.ts:24`、`:26`、`:102-108`、`:329`、`:343-374`。`/answer` 410 仍禁用，JD 仍记为 absent，strict 校验失败仍钉 400 `invalid`。

### 3. 我方 C1–C5
- C1 **已采纳**：用 `persistInterviewQuestion`（`interview-question.ts:42`）种题行并标明 seeded；409 `question_not_ready` 不得算通过。
- C2 **部分采纳**：已钉死 `MEETWISE_PUBLIC_PREVIEW` 不开启、变异代码不提交；但没有要求记录变异状态下 V1 的实际状态码。
- C3 **已采纳**：环境导致的 EXIT1 既不算通过也不算回归，须在可运行的环境中取得 EXIT0。
- C4 **已采纳**：`/turn` 调用总数 ≤30（`:356-357`）。我方先前引用的 `:354-355` 有误，以 `:356-357` 为准。
- C5 **未采纳**：V3 仍写「2xx 依现实现」，实际是 **200**（`resume.controller.ts:16` `@HttpCode(HttpStatus.OK)`，coordinator 已亲自核对）。

### 4. B5 措辞与 core 自检
- 两种原因已分开命名：`env-blocked`（docker.sock）和 `L0-guard`（MODEL_API_KEY，断言在 `nhp-neg.proof.ts:61-65` / `nhp-bound.proof.ts:56-60`）。钉死的运行形式 `with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL …` 同时规避两者。不足之处：没有引用 docker 实际失败的位置 `run-e2e-isolated.mjs:2124`（`docker run`）/ `:2134`（`docker port`）；slice（`:42`）仍把两者压缩写成「docker.sock / `MODEL_API_KEY` L0」。
- **core 自检原文未入库**：harness `:135` 只有协调方的分类声明（「EXIT1 源自 docker.sock 权限缺口 **或** MODEL_API_KEY …」），没有自检的运行记录（命令、时间、EXIT、首条失败行、实际触发的是哪一种原因）。coordinator 已在 origin @ `5875644` 用 rg 复核：harness 和 slice 中都没有这份记录。

### 5. 其他
Y/AB 没有被洗；018/052/025 只出现在 Ban 行；没有提到 FUNNEL；证据层只有一层（隔离真 PG，V4 用产品函数 seed 并已披露），没有自相矛盾；pins 和 coveredCount=8 不变。

### 6. 阻断项
**B-R2-1 · core 自检原文未逐字入库。** 须把 neg/bound 自检的原始记录逐字提交入库，包括命令、起止时间（+08:00）、EXIT、首条失败断言或 docker 错误首行，以及判定结果（是 docker.sock 还是 Key），并在 harness B5 中引用其路径。

### 7. 条件（B-R2-1 解除后适用）
1. B5 引用 `run-e2e-isolated.mjs:2124/:2134` 作为 docker.sock 的失败位置，写明 L0 只指 Key 断言；slice 改为两个独立标签。
2. 变异 run 记录 V1 的实际状态码和错误码（预期 202 或 409，不是 400），且 EXIT≠0。
3. 账本快照另加该 owner 名下 `entitlement_consumption` 的总行数和全部 bucket（同 `nhp-bound.proof.ts:158-162`），以抓出用不同 key 的扣费。
4. 正控和 V2 各用一道独立种入、状态为 issued 的题（不同 questionId/turn）：同一道题第二次作答会得到 409 `stale_question`（`interview-question.ts:80-95`）。
5. V3 钉 **200**。
6. 断言种入的题行 `status='issued'`。

### Pins（本审不改）
haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained · UC-E2E-001 ADV 保持 blind/`case-only`

**结论**：N1–N4 实质解决，B1–B5 无回退；C1/C3/C4 已采纳，C2 部分采纳，C5 未采纳；但 core 自检原文未逐字入库（B-R2-1），所以 FAIL。FAIL ≠ 方案方向错误；补齐 B-R2-1 并落实条件 1–6 后可以再审。alone≠dual。

Verdict: FAIL

### 勘误（Re-PRE2 @4e9f568 · 2026-10-06 14:22 +08:00）
上文 §3 C5 所引 `resume.controller.ts:16` 有误，`@HttpCode(HttpStatus.OK)` 实际位于 **`:17`**（`:16` 是 `@Post()`）。结论不变。

Verdict: FAIL

---

## Re-PRE3 @51af3b2（mw-rag-route · Line AG · 只审文档 · 2026-10-06 14:30 +08:00）

**基线**：REQUEST `51af3b273bf51945808c7bb31843b53dfcce44fc`（parent `c562906` · meetwise-core · 取代 `4e9f568`），是 origin 的祖先。改动 5 个文档文件（harness +52 · slice +30 · 新增自检收据 +158 · e2e 占位 · 本占位页眉），`apps/` `packages/` `scripts/` `package.json` 零改动。这是全新审查，不沿用 `2fadf2b`（@626e060）的 PASS，也不代签 mw-e2e-ha 的 `5875644`。**执行机**：只在 box 上执行（临时 worktree `/tmp/mwrr-51af3b2`），只读文档与源码，没有复跑任何 prove，用户 Mac 上零命令。核对了本占位文件的改动：core 只改了页眉、追加了 rewrite 注记，我方此前的 FAIL / Re-PRE / Re-PRE2 正文未被删改。

### 1. B-R2-1（自检原文入库）→ 已解除
`ai-docs/delivery/receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md` 共 4 条记录，每条都有 CMD、+08:00 起止时间、EXIT、首条失败行和原因标签：
- Record 1/2（neg/bound，裸 session，`env -u` 去 Key）：EXIT 1，标签 `docker.sock`。
- Record 3/4（`with-docker-session.sh`，故意继承环境中的 Key）：EXIT 1，首条失败行为 `FAIL L0 Ban live: MODEL_API_KEY absent on entry`，分别是 26 条断言中 1 条失败、17 条中 1 条失败，标签 `key`。
- 另有 session 基线：box 当前 gid 不含 docker 组，`docker info` EXIT 1、`docker run hello-world` EXIT 126。Key 只记录是否存在，不打印值。
- **box 侧旁证（coordinator 亲自核对）**：收据引用的 4 份隔离收据都在 `/workspace/meetwise-lineAG/.tmp/isolated-proof-receipts/` 下，时间为 06:18:01 / 06:18:09 / 06:18:23 / 06:18:42 UTC（即 14:18 +08:00），全部 `outcome=failed`、`exitCode=1`。Record 1 的 `durationMs=16`，与「PG 起来之前连 sock 就失败」一致；Record 3 的 `durationMs=12707`，说明容器已起，失败点在 proof 入口。这两组时长能区分两种原因。
- **弱点（披露，不阻断）**：Record 1/2 的 docker 错误首行是同一 session 中另跑 `docker info` 得到的旁证行，不是 prove 自身 stderr 里的原文（runner 的日志很薄，没有透出 docker stderr）。收据对此如实注明「companion」，结合 16ms 时长可以接受。

### 2. 我方 Re-PRE2 条件 1–6 → 全部落实
- 条件 1：harness `:155-157` 写明 `env-blocked(docker.sock)` 落点为 `run-e2e-isolated.mjs:2124`（`docker run`）/ `:2134`（`docker port`），`L0-guard(key)` 只指 Key 断言（neg `:61-65` / bound `:56-60`）；slice `:44` / `:52` 已拆成两个独立标签，`:189` 禁止合并标签。
- 条件 2：`:26` / `:145` 要求记录去掉 `.strict()` 后 V1 的实际状态码和错误码（预期 202 或 409，不是 400），且 EXIT≠0，只在临时 worktree 中做，不提交。
- 条件 3：`:27` / `:124` 加上该 owner 名下 `entitlement_consumption` 的总行数和全部 bucket（镜像 `nhp-bound.proof.ts:158-162`）。
- 条件 4：`:28` / `:144` / `:148` 规定正控和 V2 各自种入一道 issued 题，禁止复用，并注明 409 `stale_question` 的误读风险。
- 条件 5：`:29` / `:138` 将 V3 钉为 **200**（`resume.controller.ts:17`）。
- 条件 6：`:30` / `:107` / `:144` 断言种入题行 `status='issued'`。

### 3. 保留项
N1–N4 和 B1–B5 相对 `4e9f568` 无回退；Y/AB 未被洗；018/052/025 只出现在 Ban 行；FUNNEL 未触碰；证据层仍只有一层（隔离真 PG，seed 已披露）；pins 与 coveredCount=8 不变。

### 4. 条件（执行和 POST 时适用）
1. **B5 必须在 box 上实际取得 EXIT 0**：用 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-{neg,bound}:prove`，neg 26/26、bound 17/17，不改 proof。本收据中的 4 条 EXIT 1 只是环境分类，不算 B5 通过，也不算回归。
2. POST 回执须同时附上 prove 自身的 docker / L0 首行（若再出现环境失败），不得再只用旁证行。
3. harness `:36` 的历史叙述仍写「本稿在 `626e060` 基础上只修 `3f3a2e4`」，与 re-PRE3 的现状不符。执行时顺手更正即可（不阻断）。
4. 自检收据只证明环境分类，不是 ADV 证据，也不是 covered 证据；UC-E2E-001 ADV 保持 blind/`case-only`，直到 prove、双审和 nail 全部完成。

### Pins（本审不改）
haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained

**结论**：B-R2-1 已解除（自检原文入库，4 条记录要素齐全，box 侧隔离收据可以佐证）；我方条件 1–6 全部落实；N1–N4、B1–B5 无回退。PASS（附条件 1–4）。PASS ≠ coding ≠ prove ≠ covered ≠ nail；须 mw-e2e-ha 对 `51af3b2` 独立给出结论，并经协调方 AUTHORIZE。alone≠dual。

Verdict: PASS
