# FIX-ROUND2 RE-REVIEW · mw-e2e-ha · Line C G7 Key×3（答 1448cb2）

- reviewer: mw-e2e-ha（不代签 mw-model-op；不采纳 `93c6166` 的 PASS）
- reviewedAt: 2026-10-02 21:02 PT
- codeUnderTest: `3b7ea46e7eecccabbf40e58a880e97e61877eb0f`（`3b7ea46`）
- receiptCommits: `77588e9c2944f340a8ac1d4f482bb43c0ea64fed`；SHA 改写 `6045a4b0c96871c9650a24b11621d2f896da312d`、`315870e502210ac54a4068ac33aeb12721a64766`
- priorFail: `1448cb21d319d9b761f745b7b6cbf3574f959b53`（`REQUEST-2026-09-23-g7-key-x3-fix-round-re-review-mw-e2e-ha.md`）
- runner: worktree `/workspace/mw-rv-g7fr2` detached @ `3b7ea46` · `pnpm install --frozen-lockfile` · 未起 docker/postgres · 未跑 live e2e · 未读 `.env*`
- 本审重跑的离线 EXIT 记在 `3b7ea46`。回执里已提交的 EXIT 日志一律标 **run-at `05cb79f`**，不当作在 `3b7ea46` 上的重跑。

## 一句话

旧 blocker 1/3/4/5 在已提交工件 + 本审于 `3b7ea46` 的离线重跑上关闭；blocker 2 的「不计 pass」行为关闭，但 token 只写在回执。产品树 `05cb79f..3b7ea46`（排除 docs）**非空**，且 `6045a4b` 的 `rebaseNote` 写成 content-identical，与 `git diff` 相反。回执把 `offlineProvesAtCodeSha` 改成 `3b7ea46`，而日志是 run-at `05cb79f`。因此日志不能覆盖代码尖。residual CLOSED 仅指 quota-403 根因移除。trio OPEN 1/1/1。C-C OPEN。不是 G7 green。

## Ancestry / on-origin

| SHA | full | on origin/feat/mysql-schema-skeleton | note |
|---|---|---|---|
| `3b7ea46` | `3b7ea46e7eecccabbf40e58a880e97e61877eb0f` | yes | FR2 代码。parent `522590d`。patch-id `3d91a6c8005b68ac09f4e5edb7483dc057a95964` |
| `77588e9` | `77588e9c2944f340a8ac1d4f482bb43c0ea64fed` | yes | gap 原文/脱敏与回执正文。`3b7ea46` 的子提交 |
| `05cb79f` | `05cb79f6d687a693d8b6a44d20d7cf1e25cfaa5d` | **no** | 同标题、同 patch-id，parent `71ec253`。**不是** `3b7ea46` 的祖先 |
| `1448cb2` | `1448cb21d319d9b761f745b7b6cbf3574f959b53` | yes | 上一轮本审 FAIL |
| `6045a4b` | `6045a4b0c96871c9650a24b11621d2f896da312d` | yes | 只改 receipt JSON 的 tip/offline SHA + rebaseNote |
| `315870e` | `315870e502210ac54a4068ac33aeb12721a64766` | yes | 只改 receipt MD 的 tip 一行 |

`6045a4b` 与 `315870e` 不改产品代码，也不改 gap 正文/摘要数字。它们**改写了证据指针**：`tipShaFull` / `offlineProvesAtCodeSha` 从 `05cb79f6d687…` 换成 `3b7ea46e7ee…`，并加注「content-identical code tree」。该注与下面的 diff 不符，等于把 run-at `05cb79f` 的日志说成跑在 `3b7ea46`。

## 产品树 `05cb79f` vs `3b7ea46`（BLOCKER）

`git diff --stat 05cb79f 3b7ea46 -- . ':!ai-docs' ':!docs'`：

- `apps/worker/src/checkpoint-principal.ts`
- `apps/worker/test/uc052-pool-role-leak.proof.ts`
- `scripts/lib/uc-covered-real-gatherer.mjs`
- `scripts/lib/uc018-receipt-backfill-facts.mjs`
- `scripts/run-e2e-isolated.mjs`
- `scripts/uc-e2e-018-receipt-backfill.proof.mjs`
- `scripts/uc018-receipt-backfill-emit.mjs`

7 files, +201/−26。**产品 diff 非空。**

G7 补丁本身：`git show 05cb79f` 与 `git show 3b7ea46` 的 stable patch-id 相同（`3d91a6c8…`），且 `git diff 05cb79f 3b7ea46 -- <FR2 文件列表>` 为空。差异来自 rebase 基底（UC018 backfill、pool-role-leak、isolated runner），不是第二份 G7 diff。这**不能**把两棵产品树说成同一棵。`05cb79f` 的日志没有覆盖 `3b7ea46` 上那些产品文件。按加注规则：产品树不同 = BLOCKER（log tip ≠ code under test）。

`git rev-parse 3b7ea46` = `3b7ea46e7eecccabbf40e58a880e97e61877eb0f`。SSOT markdown（`315870e`）与 JSON（`6045a4b`）写的就是这一串。父 SHA `82981ff1f5798f44a40b564031d532f94c842e4d` 与 `git rev-parse` 一致（旧错串 `82981ff86e57…` 已不在 SSOT）。父提交是 `3b7ea46` 的祖先。

## CMD|EXIT（本审实际 · offline @ `3b7ea46`，除非另注）

| CMD | EXIT | where |
|---|---|---|
| `pnpm install --frozen-lockfile` | 0 | worktree `3b7ea46` |
| `pnpm -C packages/ai-runtime prove:g7-freetier-fix-round2` | 0 | `3b7ea46`。factor 535→300；`fetchCalls=0`；spy delta 0；release active=0 calls=0 |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | 0 | `3b7ea46` |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | 0 | `3b7ea46` |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | 0 | `3b7ea46` |
| `pnpm -C packages/ai-runtime prove:context-budget` | 0 | `3b7ea46` |
| `pnpm -C packages/ai-runtime prove:text-endpoint-config` | 0 | `3b7ea46` |
| `pnpm -C apps/web prove:application-start-error` | 0 | `3b7ea46` |
| `node scripts/eval-harness-matrix-cite.proof.mjs` | 0 | `3b7ea46` · 静态 · 无 PG |
| `node scripts/g7-freetier/redact-gap-evidence.mjs --prove-idempotent` | **1** | `3b7ea46` ENOENT：`gap-evidence/raw` 不在该提交（也不在 `05cb79f`） |
| 同上 | 0 | 仅把 `77588e9` 的脚本+gap-evidence 解出后重跑。三份 sha256 与回执一致 |
| `pnpm exec tsc --noEmit -p packages/ai-runtime/tsconfig.json --pretty false` | 2 | `3b7ea46` · `error TS` 行数 **14**。无一条落在 FR2 改动文件 |
| `pnpm exec tsc --noEmit -p apps/web/tsconfig.json --pretty false` | 0 | `3b7ea46` · 0 条 `error TS` |
| `pnpm -C apps/worker prove:nhp-r4-adv-covered` | **未跑** | 需要 PG。见 nhp 钉 |

未做第二棵基线 worktree 的 tsc。回执写 before=14 / after=14 / newErrors=0。本审在 `3b7ea46` 数到 14，且错误文件不是 FR2 路径（`interview-voice-seams.ts`、`job-route-classify-binding.proof.ts`、`model-slot-bypass.proof.ts`、`resume-ocr-binding.proof.ts`、`packages/domain`）。与「new=0」相容，但不是独立的前后 diff 计数。

回执 `integration[]` / `offlineProves[]` 里的 EXIT 0（及 nhp EXIT 1）是 **run-at `05cb79f`**，不是本表。

## 旧 blocker 复查

### 1) 三份 GAP 脱敏摘录 + 脚本 + raw/redacted 摘要 — 关闭

已提交（自 `77588e9`，`3b7ea46` 与 `05cb79f` 都没有这些文件）：

- `ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/gap-evidence/raw/*.raw.txt`
- `.../redacted/*.redacted.txt`
- 脚本 `scripts/g7-freetier/redact-gap-evidence.mjs`（在 `3b7ea46`）

本审对 origin 尖上的字节重算 sha256，与回执 `gapEvidence.digests` 一致：

- PROVENANCE raw=redacted `8f7867b00e1946cc611807d46b449b56077e1e43f0bc11bb5daf65a826a503fc`（484）
- REPORT-MAX-ATTEMPTS raw=redacted `6cf5028c175ca6ceeed80164284a6a0a4e4b77eafda0ddf57f697e58300e01d3`（353）
- UI-409 raw=redacted `505c7d12c91951d995e49bd2c5be883754c6cd0fd0b3dcc851b529263276b7fc`（467）

摘录里有被引失败行（`identities=4`、`terminal=report_unavailable; reason=max_attempts_exceeded`、`application_start_failed_409`）。raw 与 redacted 同摘要，是因为摘录里没有脚本规则能打中的密钥/邮箱/长 hex，不是只摘要了 gitignore 的 `.tmp`。`77588e9` 树上 `--prove-idempotent` EXIT 0。

条件（不挡这节关闭）：顶层 `gap-evidence/digests.json` 还记了 `_idem_*` = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`（空串 sha256）。脚本跑完会删 `_idem_*` 临时文件，这些空摘要不是摘录正文。回执 `gapEvidence.digests` 没有引用它们。

### 2) embed/rerank/voice = not_run(g7_hard_disabled) — 行为关闭，token 只在回执

回执 JSON `g7HardDisabledTrioSteps`：embed、rerank、asr、tts、asr_stream、tts_stream 均为 `status=not_run`、`reason=g7_hard_disabled`。markdown 写「never pass」。没有把它们算进 pass。

代码并不发出这两个 token。`assertG7UnguardedPathDisabled`（`packages/ai-runtime/src/g7-freetier-reprove-guard.ts:413-415`）在 G7 下 `throw new Error(\`g7_path_disabled:${path}\`)`。入口：`embedder.ts:31`、`reranker.ts:26`、`voice.ts:430`、`voice.ts:474`、`voice-stream.ts:54`、`voice-stream.ts:79`。全库产品源码没有 `g7_hard_disabled` 字符串。本审 fix-round2 / paths EXIT 0 看到的是 `g7_path_disabled:*`，不是会计行 `not_run`。

伤害（静默缩覆盖、当成 pass）已由抛错 + 回执清单堵住。字面「会计代码发出 not_run(g7_hard_disabled)」仍未满足，记为条件，不单独把已关闭的行为再说成未修。

### 3) 校准必须走聊天路径 `planContextBudget` — 关闭

`packages/ai-runtime/src/model-client.ts:215` `planContextBudget` 在 `:224` 调用 `assertCalibrationModelMatch`。`prepare` `:354` 与 `complete` `:373` 都调用 `planContextBudget`，不是只走 `planDispatchBudget`。`context-budget.ts` 里的 `planDispatchBudget` 仍有自己的断言（paths 证明仍覆盖它），但聊天适配器走的是 `planContextBudget`。

`g7-freetier-fix-round2.proof.ts:113-124` 比较无因子与 factor=0.5：本审输出 `uncal=535 tight=300`。`:147-150` 在 `openAICompatibleClient.complete` 上要求 mismatch 且 `fetchCalls===0`。EXIT 0。

### 4) zero-fetch spy=0 与 dispatch-fail 后 release — 关闭

- 零传输：`g7-freetier-fix-round2.proof.ts:127-150`，本审 `fetchCalls=0`。
- spy：同文件 `:191-224`，安装拦截器后 embed/rerank/asr/tts/asr_stream/tts_stream 抛 `g7_path_disabled`，`g7OutboundSpy` 的 fetch/http/https/ws/wsPackage 增量均为 0。拦截器计数在 `g7-outbound-interceptor.ts:32-38`，`blockOrPass` `:59-64`。
- release：`model-client.ts:509-511` 在 G7 catch 里 `releaseG7ReservationOnSharedLedger`。证明 `:226-247` 断言 `activeReservationCount===0 && callCount===0`。本审 `{"active":0,"calls":0,"reserved":0}`。

条件：`:239` 写成 `res.ok === false || true`，该行恒真，不能单独当证明。真正的断言是下一行账本。测试仍 EXIT 0。

### 5) SSOT 全 SHA — 关闭

`315870e` markdown 与 `6045a4b` JSON 的代码尖 = `git rev-parse 3b7ea46`。父 `82981ff1f5798f44a40b564031d532f94c842e4d` 正确。旧 typo 不在当前 SSOT。

## nhp（未重跑）

`apps/worker/test/nhp-r4-adv-covered.proof.ts:47-68`：没有 `E2E_ISOLATED`+`PGHOST`+token、也没有 `DATABASE_URL` / 全套 `PG*` 时，打印 `COVERED_PATH_GAP: real Postgres required...` 并 `process.exit(1)`。注释写明 skip ≠ pass。回执 `nhpR4AdvCovered.exit=1`、`status=PINNED_EXPECTED_FAIL`、`reason` 含 `COVERED_PATH_GAP`。不是洗成绿。本审没有跑这条，也没有起 Postgres。

## 措辞（回执本身）

`freeTierOnlyResidual.status=CLOSED` 且 reason 限定 quota-403 / 不蕴含 suite、trio、C-C、nail。`trio` 三条 EXIT 1。`ccConfirmed=false`。`pins.g7SuiteGreen=false`。markdown：「CLOSED (quota-403 removed) · trio OPEN 1/1/1 · C-C OPEN · ≠ G7 green」。没有把本轮写成 G7 green。本审沿用：residual CLOSED = 只去掉 quota 403 根因；trio OPEN；C-C OPEN。

## Pins（本审不新证 HA / 删除闭环）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503（沿用钉，本轮未重跑删除 HTTP）· trio 1/1/1 OPEN · C-C OPEN · free model（qwen3.8-flash）≠ prod qwen-plus ≠ perf · alone≠dual · Disclosure-1：`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 仅 G7 e2e，生产 fail-closed 仍 ON，不计 R1。

PASS ≠ G7 green。本文件结论也不是 G7 green。

## Blockers

1. **产品树非空 + 假的 content-identical + 日志 SHA 被改写。** `git diff 05cb79f 3b7ea46` 排除 `ai-docs`/`docs` 仍有 7 个产品文件。`05cb79f` 不在 origin、也不是 `3b7ea46` 的祖先。回执 `offlineProvesAtCodeSha` 被 `6045a4b` 写成 `3b7ea46…`，但那些 EXIT 是 run-at `05cb79f`。`rebaseNote`「content-identical code tree」为假。G7 patch-id 相同不能抵消整棵产品树差异。本审在 `3b7ea46` 另跑的离线 EXIT 0 只覆盖本表命令，不能把对方的 `05cb79f` 日志升格成代码尖证据。

## Conditions（不把它们写成已关）

- trio OPEN 1/1/1（isolated / ui isolated / perf）。本审未跑。
- C-C OPEN。perf 不是 SLO。
- Disclosure-1：G7 用 `MEETWISE_TECH_ROLE_FAIL_CLOSED=0`，不是生产 fail-closed。
- free ≠ prod qwen-plus ≠ perf。alone ≠ dual。
- blocker 2 的字面 token：代码发 `g7_path_disabled`，回执写 `not_run`/`g7_hard_disabled`。行为是 hard-disable，不是会计函数打出该状态。
- fix-round2 `:239` 恒真断言。
- `gap-evidence/digests.json` 的空 `_idem_*` 摘要。
- tsc new=0 未用第二 worktree 独立对基线；本审只数到 14 且不在 FR2 文件上。
- nhp EXIT 1 维持 PINNED_EXPECTED_FAIL / COVERED_PATH_GAP。未重跑。
- 本审 redact 幂等在 `3b7ea46` 为 EXIT 1（输入不在该提交）；EXIT 0 只在 `77588e9` 的 gap 树上。

## Non-claims

不签 mw-model-op。不改 Line A `REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md`，不改 Line B pool-role-leak 回执。不宣称 G7 green、HA、releaseEvidence、R1、R4 covered、ms3=R4。

## 三行中文摘要

产品树 `05cb79f` 到 `3b7ea46` 排除文档后仍有 7 个产品文件，回执却写成 content-identical，并把 run-at `05cb79f` 的 EXIT 指到 `3b7ea46`，所以 FAIL。
GAP 摘录摘要、聊天路径校准、零 fetch 与失败释放、SSOT 全 SHA 经本审在 `3b7ea46` 离线重跑（脱敏幂等在 `77588e9` 树）对上；nhp 仍是钉死的 EXIT 1，未重跑。
residual 只关 quota-403；trio 与 C-C 仍 OPEN；这不是 G7 green。

Verdict: FAIL
