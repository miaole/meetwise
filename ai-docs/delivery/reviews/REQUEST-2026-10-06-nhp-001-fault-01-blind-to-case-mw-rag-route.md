# REQUEST — **NHP-001-FAULT-01 · UC-001 FAULT blind→case evidence** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE** · awaiting re-PRE · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: **supersedes REQUEST `db24fc9`** · cites mw-rag-route PRE-EXEC FAIL **`64fba04`**（`64fba0473955359e244e9c532d45e19cac6c9670`）**B1–B5 addressed** (+ C1–C3）· peer e2e PASS `899fef2` alone ≠ dual · Ban coding
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/nhp-001-fault-01-blind-to-case.md` · slice `nhp-001-fault-01-blind-to-case.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` tip（includes AL/AM/AG ancestors · Ban touch AL/AM/AG files）
**Date**: 2026-10-06
**Line**: **AI**

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

## 请审什么（mw-rag-route · re-PRE · B1–B5 + C1–C3）

Line AI · NHP-001-FAULT-01。本 stub 为 **re-PRE rewrite**（**supersedes `db24fc9`** · cites FAIL **`64fba04`** · 解除 B1–B5 + C1–C3；peer PASS `899fef2` **alone ≠ dual**）。请审：

1. **B1**：源锚 file:line（`report-worker.ts:31-58` / `:61-70` · `report.ts:7` / `:73-85` · controller `:174-191` · service `:661-690`）；注入 = `ReportWorkerDeps.generate` 确定性 throw（不改产品）；CMD 拟 `pnpm uc001:nhp-fault:prove` via `run-e2e-isolated.mjs` · 期望 EXIT。
2. **B2**：逐 F-case 钉 HTTP status/error（failed/quarantined/retry/export）· 正控 ready+`report_ready` · mutation `MUT-F1-stuck-running` 真变红。
3. **B3**：delta = UC-001 主链 begin→`/turn`→complete→report 注入失败后的 **HTTP 读口**；Ban borrow `report:prove` / report-bulkhead / uc011 / uc019 绿。
4. **B4**：具名回归 `uc001:nhp-neg:prove` 26 · `uc001:nhp-bound:prove` 17/17 · `report:prove` EXIT0 零改动；env EXIT1 ≠ pass ≠ regression。
5. **B5**：单一证据层 Nest HTTP + 隔离真 PG via `run-e2e-isolated.mjs`；Ban fake DB for ledger；Ban 矛盾 in-process 措辞。
6. **C1–C3**：`/turn`（`:30-33`）· Ban `/answer` 410；Y/AB prove+POST SHA 并列；attempts=1 · CMD+EXIT+±08:00+SHA · EXIT0≠covered≠FAULT upgrade≠nail≠HA。
7. **worker 面 / 终态语义**：注入点落在 worker 图/队列边界内且不触碰路由/检索语义；Interview 终态与 report 失败/降级可观测；Ban 静默吞错。

UC-E2E-001 FAULT 列 stays **partial**（逐字）· row stays honest · **EXIT0≠covered** · coveredCount=8 · Ban wash Y NEG `ff74522`/`51c0c0b` / AB BOUND `f8cdc82`/`5adb14f` / AG ADV.

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit of matrix/backlog · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 AL/AM/AG 禁触文件 · Ban product/infra code · Ban borrow `report:prove` 绿 · Ban fake DB for ledger。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-rag-route` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite · supersedes db24fc9 · FAIL 64fba04 B1–B5 · peer PASS 899fef2 alone≠dual · Ban coding · awaiting expert re-PRE dual · STOP*

---

## Rewrite note · re-PRE（append · do not erase FAIL section below）

**re-PRE · supersedes `db24fc9` · cites FAIL `64fba04`** · B1–B5 + C1–C3 landed in harness/slice · Status stays `draft:awaiting_pre_exec_dual` · Pins unchanged · Ban coding · Ban prove · Ban covered flip · Ban wash Y/AB/AG · peer e2e PASS `899fef2` alone ≠ dual。

下方 Historical FAIL 正文 **原样保留不擦除**；本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL。

---

## mw-rag-route PRE-EXEC 审查 · Line AI · NHP-001-FAULT-01（2026-10-06T14:27+08:00）

**审查者**: `mw-rag-route`（独立域 · 只审不改产品 · 不代签 peer `mw-e2e-ha` · alone ≠ dual）
**REQUEST**: `db24fc9`（`db24fc9f67a8b0409972db3ad88689235972dfc1`）· 作者 meetwise-core · 2026-10-06T14:17:27+08:00
**审查时 origin tip**: `6099fcf`（协调方所述 wave tip `c562906` 已被 `51af3b2` / `7706bf7` / `6099fcf` 超越；按当前 origin 审）
**执行机器**: 仅本 box（Linux 6.12 · 临时 worktree `/tmp/mwrr-ai` @ origin tip · detached）；未在用户 Mac / 任何 machineId 上执行任何命令；未跑 prove（PRE 可选，本审未跑）。
**门文档**: `north-star-hard-gates.md` · `harness/nhp-001-fault-01-blind-to-case.md` · `nhp-001-fault-01-blind-to-case.slice.md` · `harness/NORTH-STAR-EXECUTION-LOOP.md`（注：该文件**在** origin 上，路径 `ai-docs/delivery/harness/`，由 `3003392` 引入且为 tip 祖先；与“不在 origin”的口径不符）

### 1. REQUEST 提交核对

- `git merge-base --is-ancestor db24fc9 origin/feat/mysql-schema-skeleton` → 是祖先。
- 文件 4 个，全部 docs：`harness/nhp-001-fault-01-blind-to-case.md` · `nhp-001-fault-01-blind-to-case.slice.md` · 两个 dual stub。零 `apps/` `packages/` `scripts/` `package.json`。✅

### 2. 矩阵诚实核对（✅）

- `e2e-requirement-coverage-matrix.md:112` UC-E2E-001 第 3 列（FAULT）逐字 = `**partial**`；行尾读法「FAULT partial 仅因 isolated worker 注入下 report 未必 ready」。harness §1 引用与此一致：**partial，非 blind**；“blind→case”仅指具名 case 收据层 blind，并明确不改列、不升格。诚实。
- `non-happy-path-perf-load-case-matrix.md:37` NHP-001-FAULT-01 = `**partial**` · 锚点「isolated worker 注入旁证」——与 harness 一致。
- `package.json:167-170` 仅 `uc001:nhp-neg:prove` / `uc001:nhp-bound:prove`，无 `uc001:nhp-fault:prove`——harness 所述属实。
- 未洗 Y NEG（prove `ff74522` · 我方 post PASS `51c0c0b`）/ AB BOUND（prove `f8cdc82` · 我方 post PASS `5adb14f`）/ AG ADV（Re-PRE3 已过，仍未 prove）；无 covered 翻转；pins 原样；FUNNEL / G-R4-5 未触碰。

### 3. 产品源锚 spot-check（harness 本身一个 file:line 都没引用；以下为审查者自查的真实锚点）

- `apps/worker/src/report-worker.ts:31-58` `drainReportsOnce`：generate/loadSummary 抛错 → `markReportFailed` → 返回 `'failed'`（不碰 interview）。
- `apps/worker/src/report-worker.ts:61-70` `sweepReportsOnce`：超上限 → quarantined + `report_unavailable` 终态事件（reason `max_attempts_exceeded`）。
- `packages/db/src/report.ts:7` ReportStatus = queued|running|ready|failed|quarantined；`:73-85` `sweepReports`。
- `apps/api/src/modules/interview/interview.controller.ts:174-177` `GET /:id/report`；`:180-184` `POST /:id/report/retry`（200）；`:187-191` `GET /:id/report/export` 未 ready → 404 `report_not_ready`。
- `apps/api/src/modules/interview/interview.service.ts:661-677` `report()`：有行 → 200 `{status, content}`（failed/quarantined 时 content=null）；无行且有 `interview_unavailable` → 200 `interview_failed`；无行无失败事件 → 404 `not_found`。`:680-690` `retryReport`：200 `{requeued:true}` 或 404 `no_retriable_report`。
- 活口核对：上述 report 路由均为活路由（非 410）。答题主链须走 `/turn`（controller `:30-33`，202）；`/answer`（`:242-246`）为 `HttpStatus.GONE` 410——harness 未写驱动路径，见条件。
- 关键既有旁证：`apps/worker/test/report-bulkhead.proof.ts:1-4`（`pnpm report:prove` · `package.json:201` · 真 PG via run-e2e-isolated）已证明「报告失败绝不回滚/阻塞 interview；可独立 requeue」——这正是矩阵 FAULT partial 所指的“isolated worker 注入旁证”。

### Blockers（FAIL）

1. **B1 无产品源锚、无可执行设计**：harness 全文零 file:line；§3 末句「注入点、文件路径、断言数在 PRE dual 中由专家裁定」把 case 设计交给审查者，违反 LOOP §3③（REQUEST+harness 须含命令、期望 EXIT）。须引用上列锚点（或等价），写明注入点（如 `ReportWorkerDeps.generate` 注入确定性 throw，不改产品）。
2. **B2 未钉精确 HTTP 状态/错误码；无正控；无 mutation/负控**：F1/F2 只有“可终态 / 显式失败/降级 / 错误可解释”。须逐 case 钉死，例如：`GET /interviews/:id` → `status='completed'`；`GET /:id/report` → 200 `{status:'failed',content:null}`；sweep 超限后 → 200 `{status:'quarantined'}` + `interview_event` 有 `report_unavailable`；`POST /:id/report/retry` → 200 `{requeued:true}`；`GET /:id/report/export` → 404 `report_not_ready`。正控：同夹具 good generate → 200 `{status:'ready'}` + `report_ready` 事件。mutation：至少一条会真变红的（如让失败路径不调用 `markReportFailed` → 报告滞留 running，断言红；或让报告失败把 interview 置 failed → 断言红），并写明预期红的断言 id。
3. **B3 与既有 `report:prove` 未区分（relabel 风险）**：F3 只禁洗 Y/AB/AG，未禁洗 `report:prove`（report-bulkhead）/ `uc011:report-refund*` / `uc019:report-regenerate*`。若新 case 只是 worker 函数直调 + 失败注入，则等于 `report-bulkhead.proof.ts` 换名。须写明 delta（建议：UC-001 主链 begin → `/turn` → 完成 → report 注入失败后的 **HTTP 读口** 观测），并显式 Ban 借 `report:prove` 绿。
4. **B4 回归未具名**：须列明 `uc001:nhp-neg:prove`（26 asserts）、`uc001:nhp-bound:prove`（17/17）、`report:prove` 在实现 tip 上必须 EXIT 0 且 proof 零改动；环境性 EXIT 1（docker.sock 权限 / 环境 `MODEL_API_KEY` 触发 L0 guard）既不算通过也不算回归，须如实记录后在 `with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL` 下重跑。
5. **B5 证据层未定**：仅 §2 一句「`run-e2e-isolated.mjs` 隔离壳」，未说明是 Nest HTTP in-process + 隔离真 PG 还是 worker 函数直调；F1「无双扣」需真 PG ledger 观测，fake DB 不足。须单一表述并全文一致（避免前例“in-process”与“隔离壳三层”并存的自相矛盾）。

### 改写时一并落实（非阻塞）

- C1 驱动主链用 `/turn`（`:30-33`），禁用 `/answer`（410，必败、会造成伪红或伪绿）。
- C2 Y / AB 引用补全 post-prove PASS SHA（`51c0c0b` / `5adb14f`）与 prove tip 并列。
- C3 预声明 attempts=1、CMD+EXIT+起止（+08:00）+ code SHA；EXIT0 仍 ≠ covered ≠ FAULT 列升格 ≠ nail ≠ HA。

### Pins（核对未变）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · public DELETE=503 · PG-retained（Postgres/pgvector/PostgresSaver；禁 MySQL runtime / Qdrant / MemorySaver）· UC-018 与 §1.1 仍 partial · PASS ≠ coding ≠ covered ≠ nail ≠ HA · EXIT0 ≠ covered。

本审不授权 coding / prove。peer `mw-e2e-ha` 独立审，本人未阅改其文件。

Verdict: FAIL

---

## Re-PRE @6128b79（mw-rag-route · Line AI · NHP-001-FAULT-01 · 只审文档 · 2026-10-06 14:47 +08:00）

**REQUEST**: `6128b7964df504f8127ef77b1bdf5b7a822a4add`（meetwise-core · 2026-10-06 14:34:16 +08:00 · supersedes `db24fc9`）· 是 origin 祖先；审查时 origin tip `2bf22c5`，harness 自 `6128b79` 起未再变。
**改动文件**（4 个，全 docs）：`harness/nhp-001-fault-01-blind-to-case.md` · `nhp-001-fault-01-blind-to-case.slice.md` · 两个 dual stub。零 `apps/` `packages/` `scripts/` `package.json`。✅
**本文件被 core 改动的核对**：core 改了本 stub 的页眉 / 请审清单并插入 rewrite 注记；我方 `64fba04` 的 FAIL 正文逐字未变（抽取 FAIL 段 diff 为空）。
**执行机器**：只在本 box 上执行（临时 worktree `/tmp/mwrr-6128b79` @ origin tip）；只读文档与源码，未跑 prove；用户 Mac / 任何 machineId 上零命令。

### 1. 我方 FAIL `64fba04` 阻断项逐条

| # | 状态 | 依据（harness file:line） |
|---|------|---------------------------|
| B1 无源锚 / 设计交审查者 | **已解除** | `:44-52` 列出锚点；复核为真：`report-worker.ts:31-58` / `:61-70`、`report.ts:7` / `:73-85`、controller `:174-177` / `:180-184` / `:187-191`、service `:661-677` / `:680-690`、`/turn` `:30-33`、`/answer` `:242-246` 410。`:62` 注入点 = `ReportWorkerDeps.generate` 确定性 throw，不改产品。 |
| B2 未钉状态码 / 无正控 / 无 mutation | **已解除** | `:66-73`：F1 200 `{status:'failed',content:null}`；F2 200 `quarantined` + `report_unavailable`；F2b retry 200 `{requeued:true}`、export 404 `report_not_ready`；PC 200 `ready` + `report_ready`；`MUT-F1-stuck-running` 预期红。 |
| B3 与 `report:prove` 换名风险 | **已解除** | `:52` / `:64` / `:71` / `:107` 明文 Ban 借 `report:prove` / report-bulkhead / uc011 / uc019 绿；delta = 主链 begin → `/turn` → 完成 → 注入失败后的 HTTP 读口。 |
| B4 回归未具名 | **已解除** | `:89-97` 具名 `uc001:nhp-neg:prove`（26）、`uc001:nhp-bound:prove`（17/17）、`report:prove`，零 proof 改动；环境 EXIT 1 ≠ pass ≠ regression。 |
| B5 证据层 | **已解除** | `:75-79` 单一层 = Nest HTTP + 隔离真 PG（run-e2e-isolated），Ban fake DB 作为 ledger / report 状态依据。 |
| C1 `/turn` | 已落实 | `:29` / `:51` / `:64`。 |
| C2 Y/AB post SHA | 已落实 | `:30` / `:93-94` / `:106`。 |
| C3 attempts / 时间 / SHA | 已落实 | `:83-87`。 |

**LOOP §3③（命令 + 期望 EXIT）**：`:58` / `:83-84` 给出 `pnpm uc001:nhp-fault:prove`（`node scripts/run-e2e-isolated.mjs uc001:nhp-fault:prove:raw`），case 齐 EXIT 0、任一失败 EXIT≠0；回归表也有 EXIT。✅
**矩阵诚实**：`:39-42` FAULT 列仍按 partial 引用，不改 blind、不升格；`:101` 行冻结。✅

### 2. 改写引入的新问题（不阻断，执行前须落实）

1. **路径写错**：`:68` 写 `GET /interviews/:id`，实际 controller 前缀是 `@Controller('interview')`（`interview.controller.ts:14`）、`@Get(':id')` 在 `:168`，应为 `GET /interview/:id`。
2. **“完成”一步须写明是 seed**：生产中 `completeInterviewAndConfirm` + `enqueueReport` 只在 worker 打分后调用（`apps/worker/src/adaptive-lifecycle.ts:340-341`），而本刀 Ban live、无 worker 打分。`:64`「begin → /turn → complete」须注明 complete + enqueueReport 是离线 seed（如 AG `7eb1c88` V4 的做法），并禁止叙述成“无模型跑通主链”。
3. **F2 / F2b 顺序**：`retryReport` 先选 `status IN ('failed','quarantined')`（service `:684`），但 `requeueFailedReport` 只更新 `status='failed'`（`packages/db/src/report.ts:60-64`），所以对 quarantined 报告 retry 实际返回 **404 `no_retriable_report`**。`:70`「F1 后」须钉死 F2b 在 F2 之前执行，或用各自独立的 interview fixture；建议同时把“quarantined 后 retry → 404 `no_retriable_report`”作为观察记录（不得写成 200）。
4. **runner 接线与 Ban 自相矛盾**：`:6` 禁碰 `run-e2e-isolated.mjs`，`:109` 写「Ban product/infra code」，但 `run-e2e-isolated.mjs` 对未登记目标会抛 `unsupported_e2e_target`，新 CMD 必须在该文件和 `package.json` 里做纯增量的目标登记（AG `7eb1c88` 先例：receipt sources、支持目标表、命令映射、migrate 白名单，+16/-1）。须明文允许“仅增量登记、不改其他目标行为”，否则执行时不是违 Ban 就是 CMD 跑不起来。
5. **“无双扣”断言已消失**：原 F1 的「无双扣」在改写后不见了，但 `:28` / `:78` 仍谈 ledger。须二选一：加 LEDGER 快照（interview 的 exact-1 consumption 保持 confirmed、`units_settled` 不变、owner 总行数 + 全部 bucket 在报告失败 / retry 前后字节相同，真 PG），或明确声明本 case 不做 ledger 断言。
6. MUT-F1 执行时记录 F1 的实际值（预期 200 `{status:'running'}`），EXIT≠0，只在临时 worktree 中做，不提交。
7. `:77`「Supertest」一词与仓内做法不符（现有 proof 用 `createApp` + `app.listen(0)` + fetch），写法统一即可。

### 3. 洗白 / 越界

Y / AB / AG 只读引用、Ban 洗；未碰 AL / AM / AG 文件；FUNNEL / G-R4-5 未触碰；零 SSOT 编辑；pins 不变。

### Pins（本审不改）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · public DELETE=503 · PG-retained（禁 MySQL runtime / Qdrant / MemorySaver）· UC-018 与 §1.1 仍 partial · FAULT 列 partial 不动 · PASS ≠ coding ≠ covered ≠ nail ≠ HA · EXIT0 ≠ covered。

**结论**：B1–B5 全部解除，C1–C3 落实，LOOP §3③ 满足；第 2 节 1–7 为执行前须落实的条件。PASS（附条件 1–7）。须 mw-e2e-ha 对 `6128b79` 独立结论并经协调方 AUTHORIZE；不代签 peer。alone ≠ dual。

Verdict: PASS
