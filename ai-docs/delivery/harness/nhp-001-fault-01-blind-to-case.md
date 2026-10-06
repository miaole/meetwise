# Harness — **NHP-001-FAULT-01 · UC-001 FAULT blind→case evidence**（Line AI · **`post_prove_dual_pass`** · case ≠ covered · FAULT stays partial · row UC-E2E-001 stays honest）

**Status**: **`post_prove_dual_pass`**（Line AI nail 2026-10-06 · PROVE tip NAILED TO `ac5928a` ≡ `3e3f9ff` · POST dual BOTH PASS e2e `50ce0c6` + rag `7750eef` · see §NAIL）
**History**: ~~`prove:awaiting_post_dual`~~（coding+prove AUTHORIZE · FAULT case EXIT0 · C1–C7 carried · MUT-F1-stuck-running actual `status=running` EXIT≠0 discarded · regressions neg 26/26 · bound 17/17 · report:prove EXIT0 · FAULT stays **partial** · EXIT0≠covered · coveredCount=8 · awaiting POST dual · Ban wash Y/AB/AG · Ban self-approve · Ban self-nail）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`1778d53`** / full `1778d53ac6075bfd4e361fb0cd51e8f31d4cfbb1`（includes AL `c633584` / AM `f645e13` / AG reviews as ancestors · **Ban touch** AL/AM/AG files: `gap-e2e-iso-banner*` · `g7-disclosure-r1*` · `nhp-001-adv*` · `run-e2e-isolated.mjs` product changes）
**Prior REQUEST**: `db24fc9f67a8b0409972db3ad88689235972dfc1`（pre_dual · **superseded by this re-PRE rewrite**）
**FAIL receipt**（retained · 不擦除）: `64fba0473955359e244e9c532d45e19cac6c9670`（mw-rag-route PRE-EXEC FAIL on `db24fc9` · B1–B5）
**Prove receipt**: `ai-docs/delivery/receipts/2026-10-06-nhp-001-fault-01-prove.md`
**PRE dual**: mw-e2e-ha re-PRE PASS `b449371` · mw-rag-route Re-PRE PASS `44e3665` @ REQUEST `6128b79`
**Peer note**: mw-e2e-ha PRE-EXEC PASS `899fef248d7d247f8425c037109ed4efde008e71` on prior wave tip · **alone ≠ dual** · rag FAIL ⇒ BOTH not PASS
**Wave**: Line **AI** rewrite（AI→AJ→AK sequential · this = Line **AI**）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING re-PRE · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **NHP-001-FAULT-01（Line AI）· 黄金路径 FAULT · blind→case 显式化**（report worker 注入失败 → Interview 可终态 · report 非阻塞死胡同 · **HTTP 读口**观测）
**Gap id**: **`GAP-UC001-FAULT-01`**（本刀具名 · 服务 NHP-001-FAULT-01；不发明 covered · 本 REQUEST 不登记进 matrix/backlog）
**Case id**: **`NHP-001-FAULT-01`**
**Row**: **`UC-E2E-001`** FAULT 列 only · not NEG（Line Y）· not BOUND（Line AB）· not ADV（Line AG）

## Rewrite note（re-PRE · supersedes `db24fc9` · FAIL `64fba04` B1–B5 + C1–C3）

本稿解除 mw-rag-route PRE-EXEC FAIL `64fba04` 阻断项 B1–B5，并落实非阻塞 C1–C3。peer e2e PASS `899fef2` **alone ≠ dual**。e2e 与 rag 均须对本稿 **re-PRE dual**。**不**擦除 FAIL 收据正文（见 rag stub 历史段）。

| # | 阻断 / 条件（`64fba04`） | 本稿修订 |
|---|------|------|
| **B1** | 无产品源锚、无可执行设计 | §读码锚点 + §注入合同钉 file:line；注入点 = `ReportWorkerDeps.generate` 确定性 throw（**不改产品**）；CMD 拟 `pnpm uc001:nhp-fault:prove` via `run-e2e-isolated.mjs` · 期望 EXIT |
| **B2** | 未钉精确 HTTP 状态/错误码；无正控；无 mutation | 逐 F-case 钉 status/error；正控 good generate → 200 ready + `report_ready`；具名 mutation assert id |
| **B3** | 与 `report:prove` / report-bulkhead / uc011 / uc019 有 relabel 风险 | 显式 Ban 借其绿；delta = UC-001 主链 begin→`/turn`→complete→report 注入失败后的 **HTTP 读口** |
| **B4** | 回归未具名 | 具名 `uc001:nhp-neg:prove` 26 · `uc001:nhp-bound:prove` 17/17 · `report:prove`；env EXIT1 ≠ pass ≠ regression |
| **B5** | 证据层未定 / 矛盾表述 | 单一层：Nest HTTP + 隔离真 PG via `run-e2e-isolated.mjs`；Ban fake DB for ledger；Ban contradictory in-process wording |
| **C1** | 未钉驱动路径 | 驱动 `/turn`（controller `:30-33`）· Ban `/answer` 410 |
| **C2** | Y/AB 引用缺 post PASS | 并列 prove+POST PASS（Y `ff74522`/`51c0c0b` · AB `f8cdc82`/`5adb14f`） |
| **C3** | attempts / 时间 / SHA 预声明不足 | attempts=1 · CMD+EXIT+±08:00+SHA · EXIT0≠covered≠FAULT upgrade≠nail≠HA |

## 0. 为何新开文件

NEG（`harness/nhp-001-neg-01-blind-to-case.md` · Line Y NAIL）/ BOUND（`harness/nhp-001-bound-01-blind-to-case.md` · Line AB NAIL）已 `post_prove_dual_pass` 封存；ADV（Line AG）另轨 —— **Ban 碰其文件**。本刀镜像 NEG/BOUND **REQUEST-era** 结构，新开 FAULT 文件；旧文件只读引用。

## 1. Quoted from the files（只读 @ tip · 零改写）

- `e2e-requirement-coverage-matrix.md:112` UC-E2E-001 行 FAULT 列 **逐字读数 = `**partial**`**；行尾读法：「FAULT partial 仅因 isolated worker 注入下 report 未必 ready」·「happy-only 绿=假绿」· ≠ covered。
- `non-happy-path-perf-load-case-matrix.md:37`：**NHP-001-FAULT-01**「report worker 注入失败 | Interview 可终态；report 非阻塞死胡同 | **partial** | isolated worker 注入旁证」。

**诚实张力声明（FAULT 列 honesty）**：矩阵 FAULT 列写的是 **partial**（来源 = isolated worker 注入 **旁证**），而 **具名 case NHP-001-FAULT-01 无 UC-001 专用 FAULT prove 收据**（`package.json:167-170` 仅有 `uc001:nhp-neg:prove` / `uc001:nhp-bound:prove` · 无 `uc001:nhp-fault:prove`）。本刀「blind→case」指 **具名 case 证据层仍 blind**，**不是** 把 `:112` FAULT 列从 partial 改写为 blind，也 **不是** 升格。**Ban flip statuses（任一方向）** · 列文字由未来 nail + 协调方授权决定。

## 2. 读码前置观察（B1 · file:line 锚点 · 只读 @ tip · 非结论）

- **Worker drain**：`apps/worker/src/report-worker.ts:31-58` `drainReportsOnce` — generate/loadSummary 抛错 → `markReportFailed` → 返回 `'failed'`（**不碰 interview**）。
- **Worker sweep**：`apps/worker/src/report-worker.ts:61-70` `sweepReportsOnce` — 超上限 → quarantined + `report_unavailable` 终态事件（reason `max_attempts_exceeded`）。
- **DB status / sweep**：`packages/db/src/report.ts:7` `ReportStatus` = queued|running|ready|failed|quarantined；`:73-85` `sweepReports`。
- **HTTP 读口**：`apps/api/src/modules/interview/interview.controller.ts:174-177` `GET /:id/report`；`:180-184` `POST /:id/report/retry`（200）；`:187-191` `GET /:id/report/export` 未 ready → 404 `report_not_ready`。
- **Service**：`apps/api/src/modules/interview/interview.service.ts:661-677` `report()` — 有行 → 200 `{status, content}`（failed/quarantined 时 content=null）；无行且有 `interview_unavailable` → 200 `interview_failed`；无行无失败事件 → 404 `not_found`。`:680-690` `retryReport` — 200 `{requeued:true}` 或 404 `no_retriable_report`。
- **作答驱动（C1）**：`interview.controller.ts:30-33` `@Post(':id/turn')` · 202；**Ban** `:242-246` `@Post(':id/answer')` · 410 GONE。
- **旁证（≠ 本 case 收据 · B3）**：`apps/worker/test/report-bulkhead.proof.ts`（`pnpm report:prove` · `package.json:201`）已证明「报告失败绝不回滚/阻塞 interview」——矩阵 FAULT partial 所指旁证；**Ban 借其绿为本 case**。

## 3. blind→case 显式化

| 今日 | 本 REQUEST | 授权后（拟 · 未授权） |
|------|------------|------------------------|
| FAULT 列 partial = 旁证；无 NHP-001-FAULT-01 专用 CMD+EXIT 收据 | docs：具名 gap `GAP-UC001-FAULT-01` + harness + 注入合同（B1–B5）+ dual stubs（rewrite） | 拟 `pnpm uc001:nhp-fault:prove`（`node scripts/run-e2e-isolated.mjs uc001:nhp-fault:prove:raw` · **Ban live** · 不加载 `MODEL_API_KEY`） |

## 4. 注入合同（FAULT 一 case · B1/B2/B3 · 拟）

**注入点（B1 · 不改产品）**：在隔离 proof 内向 `ReportWorkerDeps.generate` 注入**确定性 throw**（或等价拒绝），使 `drainReportsOnce` 走 `:47-50` `markReportFailed` 路径。**Ban** 编辑 `apps/worker/src/report-worker.ts` / `packages/db/src/report.ts` / controller/service 产品文件。

**主链 delta（B3）**：UC-001 主链 `begin` → **`/turn`**（C1）→ **offline seed** `completeInterviewAndConfirm` + `enqueueReport`（C2 · Ban 叙述成无模型跑通主链）→ report job 注入失败 → 经 **Nest HTTP 读口**观测（非 worker 函数直调冒充 HTTP）。**Ban borrow** `report:prove` / report-bulkhead / `uc011:report-refund*` / `uc019:report-regenerate*` 绿。

| id | 注入 | 钉死观察（B2） |
|----|------|----------------|
| **F1 report worker 失败** | `ReportWorkerDeps.generate` 确定性 throw | `GET /interview/:id` → interview `status='completed'`（C1 · `@Controller('interview')` · 非 `/interviews/`）（可终态 · 不因 report 失败回滚）；`GET /:id/report` → **200** `{status:'failed', content:null}` |
| **F2 sweep 隔离** | F1 后耗尽 attempts 触发 sweep | `GET /:id/report` → **200** `{status:'quarantined', content:null}`；`interview_event` 含 `report_unavailable`（reason `max_attempts_exceeded`） |
| **F2b retry / export** | **F2 前 / 独立 fixture**（C3 · `requeueFailedReport` 仅 `status='failed'`；quarantined 后 retry → **404** `no_retriable_report`） | `POST /:id/report/retry` → **200** `{requeued:true}`；`GET /:id/report/export` → **404** `{error:'report_not_ready'}` |
| **F3 旁证分离** | NEG/BOUND/`report:prove` 收据只读对照（不重跑替本 case） | 本 case 收据 **独立**；Ban 用 Y NEG / AB BOUND / AG ADV / `report:prove` 绿替代 FAULT |
| **PC 正控** | 同夹具 · good `generate`（无 throw） | `GET /:id/report` → **200** `{status:'ready', content:…}` + `interview_event` 含 `report_ready` |
| **MUT-F1**（mutation · 真变红） | temp 变异：失败路径**跳过** `markReportFailed`（报告滞留 `running`） | assert id **`MUT-F1-stuck-running`** → 期望 F1 断言红（`status='failed'` 不成立）· EXIT≠0 · temp only · never commit |

## 5. 证据层（B5 · 单一表述）

- **唯一证据层**：**Nest HTTP**（`createApp` + `listen(0)` + `fetch` 对真实 HTTP 契约 · **C7** · Ban 误导性 Supertest-only 叙述）+ **隔离真 PG** via `scripts/run-e2e-isolated.mjs`。
- **Ban fake DB** 作为 ledger / report 状态观测依据。
- **C5 选定**：本 case **做 LEDGER-SNAP**（真 PG · interview exact-1 consumption 保持 `confirmed` · owner totals/all buckets 在 report 失败/retry/quarantine/ready 前后字节相同）。**不是**「本 case 不做 ledger 断言」。
- **Ban** 全文混用「in-process only / fake DB」与「隔离壳三层」等矛盾措辞；全文只认上句单一层。

## 6. prove 方案（授权后 · Ban live · C3）

- **CMD（拟）**: `pnpm uc001:nhp-fault:prove`（包装 `node scripts/run-e2e-isolated.mjs …`）· **attempts=1**（正式）· 全记录。
- **期望 EXIT**: case 证据齐 → **EXIT 0**；任一 F/PC/MUT 失败 → **EXIT ≠ 0**。
- **时间戳**: 起止 Asia/Shanghai（**+08:00**）+ code SHA。
- **EXIT0** = F1–F3 + PC case 证据；**EXIT0≠covered** · ≠ suite green · ≠ FAULT 列升格 · ≠ nail · ≠ HA · row UC-E2E-001 stays honest · coveredCount=8。
- **EXIT1** = 诚实保留；Ban retry-to-green · Ban 记 flake · Ban 改断言洗绿。

## 7. 回归（B4 · 授权执行后 · 零 proof 改动）

| CMD | 基线 | 要求 |
|-----|------|------|
| `pnpm uc001:nhp-neg:prove` | **26** asserts（Y · prove `ff74522` / post PASS `51c0c0b`） | EXIT **0** · 零 proof/收据改动 |
| `pnpm uc001:nhp-bound:prove` | **17/17**（AB · prove `f8cdc82` / post PASS `5adb14f`） | EXIT **0** · 零 proof/收据改动 |
| `pnpm report:prove` | report-bulkhead 旁证 | EXIT **0** · 零 proof 改动（**≠ 借其绿为本 case**） |

**Env EXIT1 分类**：docker.sock 权限缺口 / Key L0（`MODEL_API_KEY`）触发 → **env-blocked / L0-guard ≠ pass ≠ regression**；如实记录后在 `with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL` 下重跑。B4 未满足 → FAULT ≠ EXIT0。

## 8. 行语义（冻结）

- UC-E2E-001 行与 FAULT 列 **逐字不动**（partial 保留 · 不改 blind · 不升 covered）· NHP `:37` partial 不动 · coveredCount=8 · canHonestlyFlip=false。
- 本 REQUEST 零 matrix/backlog/checklist edit。

## 9. Ban 列表

- **Ban wash Y NEG**（prove `ff74522` / `ff74522ac4db4ad661e72265e50ad8d860a68812` · post `51c0c0b` / `51c0c0b6c59ee27f804ed0ff9660930b9b85d0b5`）· **Ban wash AB BOUND**（prove `f8cdc82` / `f8cdc82748922a15f668993fe742411052cf21fd` · post `5adb14f` / `5adb14f68f43108c09ef277db03c674e9b93bfa3`）· **Ban wash AG ADV**（Ban 碰 `nhp-001-adv-01*` / `REQUEST-2026-10-06-nhp-001-adv*`）
- **Ban borrow** `report:prove` / report-bulkhead / `uc011:report-refund*` / `uc019:report-regenerate*` 绿为本 case
- Ban wash isolated worker 旁证为 case 收据 · Ban live · Ban fake-green suite · Ban invent covered · Ban flip FAULT 列/行
- Ban self-nail · Ban self-approve（alone ≠ dual · awaiting POST）· Ban invent covered · Ban flip FAULT 列/行 · Ban SSOT edit of matrix/backlog · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban 碰 AL/AM/AG 禁触文件 · Ban product edits beyond C4 additive runner + this proof · Ban fake DB for ledger · Ban wash Y/AB/AG · Ban borrow report:prove

## 10. Non-claims

Not a pass · not run · not covered · not FAULT 列 flip · not nail · not HA · not `releaseEvidence=true` · EXIT0≠covered · alone ≠ dual · peer `899fef2` alone ≠ BOTH

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false · row UC-E2E-001 unchanged · FAULT stays **partial** · STOP

## NAIL（2026-10-06 · Line AI · `post_prove_dual_pass` · EXIT0≠covered · FAULT stays partial）

- Lifecycle → **`post_prove_dual_pass`**（authorized coordinator nail · AUTHORIZE nail · Line AI · NHP-001-FAULT-01 · BOTH POST PASS · implementer does not self-approve beyond this nail）.
- REQUEST `6128b79`（`6128b7964df504f8127ef77b1bdf5b7a822a4add`） → PRE dual mw-e2e-ha `b449371`（`b44937184aa1787b7c1441e26a79b8fc0949e675`）+ mw-rag-route `44e3665`（`44e3665aa38f834de70a234a8e94d0e98c6acfc1`） PASS → PROVE tip **NAILED TO** `ac5928a`（`ac5928a6e028a80510e2283321931a68662bf506`） on feat（equiv content of pinned PROVE_TIP `3e3f9ff`（`3e3f9ff0ac1e60d8ddfc0b8b9e4f4c18851515a7`） · knife files byte-identical · `package.json`/`apps/api/package.json`/`run-e2e-isolated.mjs` delta = AK `4a804a8` ancestor only）.
- EXIT: `pnpm uc001:nhp-fault:prove` **EXIT 0 · asserts=61 failed=0** · regress `uc001:nhp-neg:prove` **26/26** · `uc001:nhp-bound:prove` **17/17** · `pnpm report:prove` EXIT0 **≠ borrow** · MUT-F1-stuck-running EXIT1 **discarded**（temp only · never committed）.
- POST dual BOTH PASS: mw-e2e-ha `50ce0c6`（`50ce0c6ab0527e8ae3b71016562ceb476fb8e43d`） + mw-rag-route `7750eef`（`7750eef5733118368b777e48635dc3d25f1626db`） · alone≠dual satisfied by BOTH POST.
- POST carry（rag `7750eef` §7 · non-block · recorded not resolved）: (1) 「61 asserts」≠ 行为证据数 —— 读作 行为断言 44 + 静态锚点 3 + 弱 8 + 恒真 6（6 tautology asserts flagged · 删除/改名另刀）; (2) F2 quarantine 经 proof 内 `UPDATE ai_report SET next_attempt_at` 加速 · 非真实退避等待; (3) LEDGER-SNAP 无变异证据 · 措辞限于「本次快照逐字节相等」· 不对外 claim no double-charge; (4) PROVE_TIP 原始 `3e3f9ff` + feat 落地 `ac5928a` 均记 · 收据 Baseline tip `13fc781` 叙述滞后（`3e3f9ff` parent `856680b` · `ac5928a` parent `c4d3b9f`）· MUT-F1 计数 删除行→failed=9（含静态锚点）/ 注释行→failed=8。
- **HOLD**: FAULT stays **partial** · EXIT0≠covered · Ban wash Y/AB/AG · Ban fake green · Ban invent covered · Ban flip FAULT · C1–C7 carried · coveredCount=**8** · NOT_HA · releaseEvidence=false · claimProductionHA=false · PG-retained · DELETE=503 · Ban buy cloud · Ban secrets · Ban force.
- **SCOPE UC-001 FAULT only** · gap **`GAP-UC001-FAULT-01`** 登记 · matrix `:112` FAULT 列逐字 **partial**（cite only）· NHP `:37` partial 不动 · prove-only（零 `apps/api/src` / `apps/worker/src` / `packages/`）.
- Keep siblings（Y NEG · AB BOUND · AG ADV · AL/AM · AJ/AK）as written. Ban coding · Ban HA · Ban live · Ban Meridian · Ban claiming covered · Ban self-nail beyond this AUTHORIZE nail.

Header base `1778d53` / REQUEST-era authority lines above are historical（retained · not rewritten）.

*Harness · NHP-001-FAULT-01 · UC-001 FAULT blind→case evidence · Line AI · post_prove_dual_pass · FAULT EXIT0 61/0 · C1–C7 · MUT discarded · FAULT stays partial · EXIT0≠covered · coveredCount=8 · Ban wash Y/AB/AG · Ban covered flip · STOP*
