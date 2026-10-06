# REQUEST — **NHP-001-FAULT-01 · UC-001 FAULT blind→case evidence** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/nhp-001-fault-01-blind-to-case.md` · slice `nhp-001-fault-01-blind-to-case.slice.md`
**Parent tip**: `71ad2a7`（full `71ad2a7fccaa3dd43b47e2c54b9823890aaabdf9` · not a prove tip · AE nail `3409862` ancestor）
**Date**: 2026-10-06
**Line**: **AI**（wave AI–AM）

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

## 请审什么（mw-rag-route）

1. **worker 面**：report worker 注入点是否落在 worker 图/队列边界内且不触碰路由/检索语义（Ban 借 R2/R4 路由旁证）。
2. **终态语义**：Interview 终态与 report 失败/降级状态是否结构可观测；Ban 静默吞错 · Ban 永挂 pending 被记为 pass。
3. **gap 命名**：`GAP-UC001-FAULT-01` 服务 NHP-001-FAULT-01 · 不登记 SSOT（本 REQUEST）· 不与 NEG/BOUND/ADV gap 混用。
4. **EXIT0≠covered**：任何 EXIT0 不升 FAULT 列 / 行 · coveredCount=8 · canHonestlyFlip=false。
5. **边界**：Ban live · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · alone ≠ dual。

UC-E2E-001 FAULT 列 stays **partial**（逐字）· row stays honest · **EXIT0≠covered** · coveredCount=8 · Ban wash Y NEG `ff74522` / AB BOUND `f8cdc82` / AG ADV.

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit of matrix/backlog（REQUEST = zero matrix/backlog edits）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 Line AG `nhp-001-adv-01*` / `REQUEST-2026-10-06-nhp-001-adv*` 文件 · Ban 改写既有 nailed harness 的 nail 状态 · Ban product/infra code。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-rag-route` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · STOP*

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
