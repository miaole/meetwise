# REQUEST — **C-PERF-TEARDOWN 根因刀 · PERF-LOAD teardown 根因判定 + 复跑验证/关闭证据** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays local partial · capacityRepresentative=false · canHonestlyFlip=false
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-perf-teardown-rootcause-fix.md` · slice `gap-perf-teardown-rootcause-fix.slice.md`
**Parent tip**: `377e7fc`（series open · not a prove tip）
**Date**: 2026-10-05

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
| PERF/LOAD | **local partial**（stays） · capacityRepresentative=false |
| `canHonestlyFlip` | **false** |

## 请审什么（mw-rag-route 视角）

1. **触碰面与产品零触碰（本刀第一审点）**：两分支触碰面 = Branch A 零码改（prove 产物 + receipt + docs）/ Branch B 仅 prove 基建（`scripts/uc018-perf-load-capped-child.mjs` · `scripts/run-e2e-isolated.mjs` 相关面 + 测试）。**Ban 碰产品 `packages/db/src/principal.ts`**（P 线 `56fc1ea` CLOSED-fixed，backlog `:359` 原钉）；Ban 借刀改任何 outbound 主链（HTTP client / ai-graphs / **qdrant / rag-control** / redis）；Ban 动 worker/rag/saver 路径。请审 REQUEST 对触碰面的自证是否完备、Branch B 触发条件是否可能被用来扩大触碰面。
2. **同族不同 scope 的边界（Ban 互借）**：本缺陷属 prove 基建层，与 P 线产品池缺陷 `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER`（CLOSED-fixed）同族不同 scope（M 线钉死、P 线 backlog `:359` 复钉「C-PERF-TEARDOWN 不互借」）。请审：本刀复用 P 线**读码事实**（pg@8.22.0/pg-pool@3.14.0 发射语义、崩溃帧同形）是否合法、而复用 P 线**关闭结论**（宣称本条件已闭）是否越界——REQUEST 的立场（事实可引、关闭须自证复跑）是否守住。
3. **根因判定独立性**：REQUEST 判定「proof 进程全部 pg 面走 `createPool()`（`db.service.ts:7`）→ P 修复结构覆盖」须 file:line 复核（wrapper `uc018-perf-load-capped-child.mjs:1-204` 零 pg · proof `h.pool` 唯一 pg 面 · `apps/api/src` 无独立 Client/Pool · abandon 同池 `interview.service.ts:494-513`/`commerce.ts:243-251` · saver 仅 worker 且包 createPool DbPool `checkpoint-principal.ts:128-131`）；残余面 `run-e2e-isolated.mjs:1889-1890` HOST_SQL_PROBE 是否如实披露且其「非 attempt1 签名」论证成立。Ban 未复核即采信。
4. **隔离与安全**：prove 走 `run-e2e-isolated.mjs` 既有隔离壳（fresh 隔离 PG · per-run 随机容器 · 动态端口 · attestation · caps 经 capped-child `_caps-evidence.json`）零放宽；frozen-lockfile；committed SHA 钉死；Ban secrets/`.env*` 入树入 receipt；receipt 脱敏沿用 `uc-e2e-018-perf-load.proof.ts:114-124` 红act 惯例（连接串/凭据/PGPASSWORD/Bearer）；`releaseEvidence=false`。
5. **attempt 台账与复跑诚实**：≥3 attempts one-shot 全记录（EXIT + 时间戳 + machine receipt）；**Ban retry-to-green**、Ban 弃 attempt、Ban 把 attempt1（`b29c191`，P 修复前的真实缺陷证据）洗成 flake——attempt2=0 不洗 attempt1（`README.md:39-41` 原钉口径）。任一 attempt 仍现 unhandled crash → EXIT1 诚实保留 + 根因重新钉（Branch B），不得迁就复跑绿。
6. **行冻结与 SSOT**：backlog `:35` `C-PERF-TEARDOWN` stays CONDITION OPEN（canHonestlyFlip=false）；**Ban 互借关闭 `C-IMAGE-DIGEST`**（其修复已落 `8b07308`、待真实 emit 实证，归它自己的条件链）；Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件；Ban 翻任何 SSOT 行；PERF/LOAD **stays local partial**（local ≠ capacity ≠ HA · capacityRepresentative=false）；coveredCount=8 不变；EXIT=0 ≠ 翻行 ≠ covered ≠ 条件关闭（还须 post-prove dual PASS + 协调方授权）。
7. **非本域越界检查（rag-route 视角）**：本刀不触 Qdrant/RAG 面任何 prove、配置、fixture（PERF/LOAD 本就 Ban MySQL/Qdrant fixtures，proof 头注 `uc-e2e-018-perf-load.proof.ts:9` 原钉）；若 Branch B 基建修复波及 `run-e2e-isolated.mjs` 公共路径，须证明对其余 prove 目标零行为改变（或逐项披露）。

Row `C-PERF-TEARDOWN` stays CONDITION OPEN. **Ban covered** · **Ban 碰产品 principal.ts** · **Ban 互借关闭 C-IMAGE-DIGEST** · **Ban retry-to-green · attempts 全记录**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail（≠ 条件关闭）。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC Dual Review — mw-rag-route（独立追加 · append-only · 本刀 docs gate only）

**Reviewer**: `mw-rag-route`（独立审 · Ban 自批 · alone ≠ dual · 不代签 mw-e2e-ha）
**被审 commit**: `3ca96286eb182eed66670becfebeb621ad917a2d`（`docs(e2e): REQUEST C-PERF-TEARDOWN rootcause fix (pre_dual)` · parent `377e7fc`）
**审查性质**: **PRE-EXEC dual · docs gate only** —— 审 REQUEST/harness/slice 的口径、边界与契约可执行性；Ban prove 执行、Ban coding、Ban 产品触碰、Ban 改共享 SSOT（backlog `:35`/`:359` 本刀零触碰，仅只读复核）。
**审查环境（如实记录）**: 本机仓库 `/Users/miaole/Desktop/golucky/meetwise`，github 网络不通，全部证据以**本地分支/本地对象**复核；`feat/mysql-schema-skeleton` 本地 tip 现为 `1c57bb3`（`3ca9628` 之上另有并行线 docs 提交 `f4b95fe`、`1c57bb3`，均 docs-only，与本刀无触碰面交集）。审查 worktree：`/Users/miaole/Desktop/golucky/meetwise-rv-s-rag-route`（branch `rv/s-rag-route`）。

## 环境事实核验（commit 形态）

- `git merge-base --is-ancestor 3ca9628 feat/mysql-schema-skeleton` → YES（本地 tip 链上祖先成立）。
- `3ca9628` diff = **4 files / 212 insertions / 0 deletions**，全部 `ai-docs/`（harness `gap-perf-teardown-rootcause-fix.md` · slice `gap-perf-teardown-rootcause-fix.slice.md` · 双审 stub `reviews/REQUEST-2026-10-05-gap-perf-teardown-rootcause-fix-mw-{e2e-ha,rag-route}.md`）→ **docs-only 成立**，零产品/脚本/SSOT 触碰。
- parent = `377e7fc` 逐字节核对成立；author = `mw-core <mw-core@meetwise.local>`（实现方提交，非审方自批）。

## 检查表（逐条 file:line 复核 · 本审全部独立重验，非采信实现方读码）

| # | 审查项 | 结果 | 证据（本审独立复核） |
|---|--------|------|---------------------|
| 1 | docs-only + 祖先 | PASS | 见上节；4 文件 212 行纯 docs |
| 2 | backlog `:35` 口径零漂移 | PASS | `ai-docs/delivery/gap-bug-backlog.md:35` C-PERF-TEARDOWN 行逐字比对 harness「Quoted from the files」一致（disclosed, not washed, not closed · attempt1 EXIT 1 mid-prove · attempt2 EXIT 0 · PERF/LOAD stays local partial · evidence chain `0d42e2c` §2 `:369-397` · log 锚 `:371-380` · RE-REVIEW `07823b5` §5 `:475-481` · capped-child `:202-204`） |
| 3 | correction `0d42e2c` §2 锚 | PASS | `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md` §2 恰为 `:369-397`（369 节头 → 397「Still local partial · Ban elevate · C-PERF-CAP-PARTIAL retained」）；`:371-380` = attempt1 log 崩溃帧锚（`throw er; Unhandled 'error' event` · `Connection terminated unexpectedly` @ `pg/lib/client.js` · run2 后/run3+SUMMARY 前）；`fatal: not a git repository` 非区分性根因原文在案 |
| 4 | RE-REVIEW `07823b5` §5 锚 | PASS | §5 = `:475-481`，C-PERF-TEARDOWN 行在 `:479`（CONDITION · README:39-41 · "Do not claim the second exit washes the first" · Not re-run） |
| 5 | attempt 台账原钉 | PASS | `receipts/uc018-receipt-backfill/README.md:39-41` 精确命中（attempt1 EXIT 1 / attempt2 EXIT 0 / 不洗口径原文）；`PERF-LOAD.json:12` exit=0、`:26-29` prior-docker-inspect+liveObservation=false、`capacityRepresentative=false` |
| 6 | wrapper 零 pg | PASS | `scripts/uc018-perf-load-capped-child.mjs` 全文 204 行，仅 docker/spawn/fs；grep 无 pg 驱动 import（`pgContainer/pgHost` 为 docker inspect caps 面）；run 形态 `:121-127`、create 形态 `:136-157`、`docker start -a` + `process.exit(start.status ?? 1)` `:202-204` |
| 7 | proof 唯一 pg 面 `h.pool` | PASS | `apps/api/test/uc-e2e-018-perf-load.proof.ts` 全部 pool 引用 = `h.pool.query`/`asPrincipal(h.pool,…)`（`:152/:193/:232-244/:355/:368/:375`）；无 `from 'pg'` 直连 import；头注 `:9` 「Stack: isolated real Postgres (run-e2e-isolated) · Ban MySQL/Qdrant fixtures」逐字在 |
| 8 | boot 链 | PASS | `apps/api/test/_neg-harness.ts:43` `boot()` → `:56-58` `createApp()` → `app.get(DbService)` → `db.pool` |
| 9 | `db.pool = createPool()` + api src 无独立面 | PASS | `apps/api/src/platform/db.service.ts:7` `readonly pool: DbPool = createPool();`；`grep -rn "new Pool\|new Client" apps/api/src/` = **零命中** |
| 10 | abandon 同池 | PASS | `apps/api/src/modules/interview/interview.service.ts:494-513` `abandon()` → `this.db.asPrincipal`（同池 client）→ `abandonInterviewAndRelease`；`packages/db/src/commerce.ts:243-251` `safelyTerminateAiGraphRunsOnAbandon` 同 client 直连 CAS SQL |
| 11 | worker/saver 面核销 | PASS | proof 进程不 boot worker（`apps/api/src/main.ts:90` 注释 createApp 仅 API/E2E）；worker `apps/worker/src/main.ts:116` `createPool({connectionString…})` → `:117` PostgresSaver 经 `PrincipalBoundCheckpointPool(pool)`（`apps/worker/src/checkpoint-principal.ts:128-131`）——即便 worker 侧 saver 亦 createPool 源 |
| 12 | P 修复在树 + 同 patch | PASS | `git merge-base --is-ancestor f19ecba 377e7fc` = YES（`f19ecba..377e7fc` = 10 提交，「11 提交前」按含自身计成立）；`git diff 56fc1ea f19ecba -- packages/db/src/principal.ts` = **0 行**（同 patch 成立）；工厂观测 `packages/db/src/principal.ts:869` WeakSet / `:886` `observePoolError` / `:928-931` `pool.on('connect')` per-client + `pool.on('error')` 实文在 |
| 13 | 时间线与帧形同形 | PASS | P 线 harness `harness/gap-principal-pool-error-listener-fix.md:14` 零监听缺陷原钉逐字在；P receipt `receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md` §Appendix B 尾注 v1 失败帧（`Connection terminated unexpectedly` @ `pg/lib/client.js:199/417` Client emit）与 attempt1 帧同形；`b29c191`（2026-09-23）早于 P 修复（2026-10-05） |
| 14 | 残余披露（HOST_SQL_PROBE） | PASS | `scripts/run-e2e-isolated.mjs:1889-1890` 独立 `new Client`（未走 createPool）实文在；仅 boot 期 `waitForPostgres` 内运行（migrate 前 readiness）、短命 try/finally、独立 `node --eval` 子进程经 `capture` + streak 重试（`:1927-1941`），失败形态 = 探针重试/`isolated_postgres_database_not_ready`，**非** attempt1「mid-prove proof 进程 unhandled crash」签名——「非 attempt1 签名」论证成立 |
| 15 | P-1/P-3 residual 随链 | PASS | backlog `:359` 原文登记 P-1/P-3；与 `observePoolError` 实现一致（非 Error 实例绕过 WeakSet 去重但仍被观测），不影响崩溃覆盖判定 |
| 16 | 不互借边界 | PASS | P 线事实（修复落地、崩溃帧同形）仅作**读码判定输入**，harness `:36` 明钉「读码判定，须以 committed SHA 复跑实证」、`:81` Ban 借 P 成果宣称已关；关闭 = 本刀自身复跑证据 + post-prove dual + 协调方授权。Branch A 转型（复跑验证刀）而非「已关闭」宣告——立场守住，未越界 |
| 17 | Branch A 契约可执行 | PASS | `pnpm uc018:perf-load:prove`（`package.json:126-127` 三层链实文在）@ committed SHA · frozen-lockfile · fresh 隔离 PG · ≥3 attempts one-shot 全记录（EXIT+时间戳+machine receipt）；关闭判据 (a)(b)(c) 可机械判定；任一 attempt 仍崩 → EXIT1 诚实保留 + 根因重新钉转 Branch B |
| 18 | attempt1 不洗 | PASS | harness `:69`、slice 诚实条款：attempt1 = P 修复前真实缺陷证据、账目保全；attempt2=0 不洗 attempt1（README:39-41 原样）；Ban retry-to-green/弃 attempt/改断言洗绿 |
| 19 | 阈值正交表述 | PASS | harness `:67` 双向正交（阈值未达 → EXIT1 诚实保留，非本刀失败条件；本刀关闭证据 Ban 外推阈值转绿）；peer stub #4 同口径——表述准确 |
| 20 | fail-closed 铁律 | PASS | 只防 uncaught crash、错误必被观测、Ban 吞错/伪装成功/静默重试、Ban 全局 `uncaughtException`/`unhandledRejection`、观测≠健康证明（NOT_HA 不变）——两分支共同约束在 |
| 21 | Pins 原值 | PASS | stub/harness/slice 三件一致：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD local partial · capacityRepresentative=false · **canHonestlyFlip=false**；backlog `:35` stays CONDITION OPEN |
| 22 | C-IMAGE-DIGEST 不互借 | PASS | backlog `:34` 实核（修复已落 `8b07308` · 待真实 emit 实证 · 判定权在协调方）；Ban 借本刀关闭在 harness/slice/Ban 列三处 |

**Minor nit（非 material、不构成 FAIL）**: harness `:75`「C-IMAGE-DIGEST stays its own CONDITION（backlog `:35` 同行族…）」——C-IMAGE-DIGEST 实际在 backlog `:34`，`:35` 为 C-PERF-TEARDOWN；「同行族」按族称读不致误导，且材料锚（`:35` = C-PERF-TEARDOWN）全链精确。建议该 harness 下次被触碰时顺带改为「backlog `:34`」。

## Fail-trigger audit（任一命中即 FAIL · 全部未触发）

- **docs-only 破坏**：未触发（212 行纯 ai-docs）。
- **共享 SSOT 改动**：未触发（backlog `:35`/`:34`/`:359` 零触碰，本审仅只读）。
- **M/A 线口径漂移**：未触发（检查表 #2-#5 全零漂移）。
- **互借 P 线 CLOSED 关本 CONDITION**：未触发（关闭路径 = 本刀自身复跑 + dual + 协调方；P 成果仅作读码判定输入并被显式要求复跑实证）。
- **复跑契约不可执行/洗 attempt**：未触发（≥3 attempts 全记录 + attempt1 账目保全 + retry-to-green 禁令齐备）。
- **阈值面与 teardown 条件混账**：未触发（正交表述双向成立）。
- **Pins 漂移 / canHonestlyFlip 翻转**：未触发（canHonestlyFlip=false 三件一致保留）。
- **产品 `principal.ts` 触碰授权泄露**：未触发（两分支均 Ban 碰产品；Branch B 触碰面仅 prove 基建 + 测试）。
- **全局 uncaughtException 兜底许可**：未触发（Ban 明钉两分支）。
- **自批 / 代签 peer**：未触发（本审只签 mw-rag-route；mw-e2e-ha stub 未被本审触碰或代签，其审在并行）。

## Blockers

**None.**

## Conditions C-*（PASS 附带 · 执行层须随账兑现）

- **C-1（prove SHA 诚实）**: Branch A 复跑的 machine receipt 必须记录**精确 committed prove SHA**；若零码改而钉 docs-only SHA（如 `377e7fc`），须随账披露其与最近代码 commit 的代码等价（仓库 EOR 惯例「EXIT 0 at code SHA only · nail SHA is not the prove SHA」，backlog `:33` 行原钉）——或径取最近代码 commit。禁止以 docs SHA 冒充代码 prove 面。
- **C-2（attempt 账目保全）**: 复跑台账必须原样保留 attempt1@`b29c191`（EXIT1）历史入账，不重写、不标 flake/环境噪声；任一新 attempt 仍现 attempt1 式 unhandled crash → EXIT1 诚实保留 + 根因重新钉转 Branch B，Ban 迁就绿。
- **C-3（正交与局部性随账）**: 任何本刀 receipt 须保持 PERF/LOAD stays **local partial** + `capacityRepresentative=false` + `haStatus=NOT_HA` + `releaseEvidence=false`；阈值面（p50/p95/p99/err/caps）结果与本刀关闭证据**互不外推**；EXIT=0 ≠ covered ≠ 翻行 ≠ 条件关闭（还须 post-prove dual PASS + 协调方授权，backlog `:35` 在此前 stays OPEN）。
- **C-4（Branch B 触发面披露）**: 若 Branch B 触发且改动 `run-e2e-isolated.mjs` 公共路径，须对其余 prove 目标逐项披露零行为改变（或如实列差异）；触碰面仅 prove 基建 + 测试，**Ban 碰产品 `packages/db/src/principal.ts`**；HOST_SQL_PROBE 若同刀覆盖，沿用同 fail-closed 观测语义。

## 三行中文摘要

1. 本刀 docs-only 成立：`3ca9628` 为本地 tip 链祖先、4 文件 212 行纯 ai-docs，零产品/脚本/SSOT 触碰；M 线锚点（backlog `:35`、correction `0d42e2c` §2 `:369-397`、RE-REVIEW `07823b5` §5 `:475-481`、README `:39-41`）逐一实核**零漂移**。
2. 根因判定链全部 file:line 独立复核成立（capped-child 零 pg · proof 唯一 pg 面 `h.pool` ← `db.service.ts:7` createPool · api src 无独立 Client/Pool · abandon 同池 · P 修复 `f19ecba`=`56fc1ea` 同 patch 在 `377e7fc` 祖先链）；「事实可引、关闭须自证复跑」的不互借边界守住，attempt1 不洗、阈值正交、fail-closed 铁律齐备。
3. Conditions C-1~C-4 随账兑现（prove SHA 诚实、attempt 账目保全、local partial + 正交随账、Branch B 触发面披露）；Blockers **None**，mw-rag-route 侧 **PASS**——alone ≠ dual，不代签 mw-e2e-ha，关闭仍须其 PASS + post-prove dual + 协调方授权。

**Verdict: PASS**
