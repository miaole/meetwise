# REQUEST — **GAP-UC004-FAIL-A3 · FAULT real evidence** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc004-fault-real-evidence.md` · slice `gap-uc004-fault-real-evidence.slice.md`
**Parent tip**: `f3cf84c`（series open · not a prove tip）
**Date**: 2026-10-03

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

## 请审什么（mw-rag-route 视角）

C' FINAL `0652a08` 只钉「FAULT 仍 gap」；本刀 REQUEST 为 `GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` 求可复现故障注入真证据。请审：

1. **注入点设计**：FI-1 连接断（杀 PG 连接）· FI-2 依赖超时（statement/pool timeout）· FI-3 图失败状态机（本树无 AiGraphRun(career-path) 接线，预期不可达）。注入路径= `POST /interview/:id/career-path`（`generateCareerPath` 唯一产品路径）。
2. **EXIT 契约**：EXIT 0 = FI-1/FI-2 的 F1（响应可解释）+F2（无业务事实污染）+F3（额度净变 0）全成立 **且** FI-3 可达并观察到 `AiGraphRun=failed`+降级+重试+额度不变；否则 **EXIT 1 诚实保留 gap**，如实落 receipt。Ban 把 EXIT1 记成 flake。
3. **诚实条款**：Ban 伪造 `AiGraphRun=failed`；Ban 用同步 derive 5xx 冒充图失败；Ban invent fix；若做不出/关不了 → 保持 gap。
4. **口径**：不把 `pnpm uc004:career-path:prove` mark-red EXIT0 当 A3 关闭（C' 原钉）。receipt 落点 `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`。

Row **`UC-E2E-004`** FAULT column stays gap. Case `NHP-004-FAULT-01` stays gap. **Ban covered**. **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

# PRE-EXEC dual · GAP-UC004-FAIL-A3 fault real evidence · mw-rag-route（docs gate only · Ban prove · Ban product edit）

**Reviewed SHA**: `f44d8daf3a2eb385d423d0d0d4d8aa2c477cddf6`（`docs(e2e): REQUEST GAP-UC004-FAIL-A3 fault real evidence (pre_dual)`）· 审查时 origin tip，`f3cf84c`（series open）经验证为其祖先（`git merge-base --is-ancestor` 通过）。
**Review worktree**: `meetwise-rv-c2-rag-route` @ branch `rv/c2-rag-route`（本审查 git 写操作仅限此 worktree · 禁 push）。
**Reviewer**: `mw-rag-route`（route/业务口径焦点）· alone ≠ dual · 不代签 `mw-e2e-ha` · implementer 不自批。

## 检查表（file:line 证据）

1. **docs-only / scope 干净**：`git show --stat f44d8da` = 4 文件 187 insertions 0 deletions，全部在 `harness/`+slice+2 stubs；零产品代码、零 SSOT 矩阵改动。`e2e-requirement-coverage-matrix.md:115`（UC-E2E-004 整行 gap）/`:83` NHP 矩阵（`non-happy-path-perf-load-case-matrix.md:83` NHP-004-FAULT-01 gap）在 `f44d8da` 原样未动；未碰 UC-018/052/025 任何行/文件；coveredCount=8 未改；DELETE=503 未提。✓
2. **FI-1 真实可复现**：harness `gap-uc004-fault-real-evidence.md:40` 给出具体注入手段 `pg_terminate_backend`（或等价）于 `POST /interview/:id/career-path`，观察集 F1/F2/F3 逐项写明。产品面支撑可观察性：`apps/api/src/modules/interview/interview.service.ts:749` `generateCareerPath` 唯一产品路径，`:764` 同步 `deriveCareerPath`，`:766-771` 单条 upsert `INSERT INTO career_path`（连接被杀→语句级原子，F2「无本次半写行」可经 `:777-785` `getCareerPath` 404 表面验证）。✓
3. **FI-2 真实可复现**：harness `:41` 命名机制 statement/pool 超时（`statement_timeout`、锁占位），同路径同观察集；PG-retained pin 下机制成立；具体参数留待 prove 脚本（pre-exec docs gate 可接受，机制已点名）。✓
4. **FI-3 不可达诚实路径写清**：harness `:42`/`:44` 明示本树无 AiGraphRun(career-path) 接线、预期今天不可注入不可观察、prove 须如实尝试并报告、不可达→不得 EXIT0 走诚实 EXIT1 保持 gap；**Ban 伪造 `AiGraphRun=failed`、Ban 用同步 derive 5xx 冒充图失败**。与树核实一致：`apps/api/src` 下无任何 graph/career 图文件，`interview.service.ts` 零 AiGraphRun 引用。✓
5. **EXIT 契约双向闭环**：harness `:53` EXIT0 当且仅当 FI-1∧FI-2 每次 F1+F2+F3 全成立 **且** FI-3 可达（`AiGraphRun=failed`+降级+重试+额度不变），且 EXIT0 不自动翻行（还须 post-prove dual PASS + 协调方授权）；`:54` EXIT1 诚实保留 gap、打印 `GAP-UC004-FAIL-A3` 明细、落 receipt、Ban 记 flake；`:55` 与既有 mark-red EXIT0 互不替代。与 stub `:28` 一致。✓
6. **口径不漂移（C' 原钉保持）**：harness `:7`/`:16`/`:64`、stub `:30`、slice `:11` 均重申「不把 `pnpm uc004:career-path:prove` EXIT0 当 A3 关闭」。技术根据核实：`apps/api/test/uc-e2e-004-career-path.proof.mjs:1-19` 自认「NON-UI static inventory + GAP mark-red」，不起 HTTP 不注入故障；G-GAP 打印含 `GAP-UC004-FAIL-A3`（`:192`）。C' FINAL `0652a08` 存在且引用准确（slice `gap-uc004-fail-a3-nhp.slice.md:34-44` FINAL NAIL，FAULT stays gap）。✓
7. **A3 口径以原文为准**：harness `:22` 引 `e2e-scenarios.md` E-gen-fail/TC-E2E-004-fail 与原文逐字一致（`e2e-scenarios.md:125`、`:133`，含「career-path 不计费，D1」→F3 额度净变 0 口径）；`:72` 不发明新验收标准。✓
8. **Ban invent fix 明令**：harness `:3`/`:67`、`:44`、slice `:25`/`:29`、stub `:29`/`:34`：Ban invent a fix / Ban product code / 禁止为绿改产品行为掩盖故障。✓
9. **隔离与安全惯例**：harness `:48` 待授权产物形态（`uc004:career-path-fault:prove` + apps/api `prove:uc004-career-path-fault`）与既有包装核实一致（`package.json:149-150` → `scripts/run-e2e-isolated.mjs` → `apps/api/package.json:44`）；`:12`/`:68` Ban secrets/`.env*`/force-push/push/SSOT edit；`releaseEvidence=false` 不变（`:59`）。✓
10. **Pins 原值 + alone ≠ dual**：stub `:4`/`:12-21`、harness `:4`/`:76`、slice `:4`/`:31` 全部原值：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503；UC-E2E-004 FAULT 与 NHP-004-FAULT-01 均 stays gap。peer stub `REQUEST-2026-10-03-gap-uc004-fault-real-evidence-mw-e2e-ha.md:3` 保持 PENDING，本人未代签。✓

## Fail-trigger audit

未触发任何 fail 条件：本 SHA 无 coding、无 prove 执行、无 SSOT 行改动、无 018/052/025 触碰、无 coveredCount 变化、无伪造/美化 EXIT 语义、无 invent fix、无 self-approve、无代签 peer。文档主张与 `f44d8da` 树实况（读码核实）全部对得上。

## Blockers

无。

## Conditions

- **C-1**：本 PASS 仅为 docs gate；prove 执行须待协调方在 pre-exec dual PASS 后单独授权，implementer 不自批；本 REQUEST 内不添加任何代码行。
- **C-2**：prove 产物须按 harness `:48` 形态走 `scripts/run-e2e-isolated.mjs` 隔离惯例（同 `uc004:career-path:prove` 包装），receipt 落 `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`，`releaseEvidence=false` 惯例不变。
- **C-3**：EXIT0 亦不自动翻行——A3 关闭另须 post-prove dual PASS + 协调方授权；FI-3 不可达必须 EXIT1 保持 gap 并打印 `GAP-UC004-FAIL-A3` 明细，Ban 把 EXIT1 记成 flake/环境问题；Ban 伪造 `AiGraphRun=failed`、Ban 用同步 derive 5xx 冒充图失败。
- **C-4**：本审查只签 `mw-rag-route` 本 stub；`mw-e2e-ha` stub 保持 PENDING 由其独立签署，alone ≠ dual。不代签、不碰 UC-018/052/025、不写 covered。

## 中文三行摘要

1. `f44d8da` docs-only 干净：FI-1（`pg_terminate_backend`）/FI-2（statement_timeout）注入手段具体、F1/F2/F3 观察集与 `interview.service.ts:749` 同步 derive+单条 upsert 的产品实况对得上，FI-3 无接线→诚实 EXIT1 路径写明，Ban 伪造/冒充条款齐备。
2. EXIT 契约双向闭环：EXIT0 须 FI-1∧FI-2 全过且 FI-3 可达且不自动翻行；EXIT1 诚实保留 gap 禁记 flake；C' 原钉「`uc004:career-path:prove` EXIT0 ≠ A3 关」逐处保持，无 invent fix。
3. Pins 八项原值未动，未碰 018/052/025，不代签 mw-e2e-ha（alone ≠ dual）；pre-exec dual 通过，prove 待协调方授权。

---

# REVIEW — **GAP-UC004-FAIL-A3 · FAULT real evidence prove** · POST-PROVE dual · mw-rag-route

**Status**: **REVIEWED · prove 包 `e09978d` 复验通过 · EXIT=1 诚实保留 · A3 / NHP-004-FAULT-01 仍 gap（本 verdict 不关闭任何行）**
**Reviewer**: `mw-rag-route`（独立复验 · 不信任实现方摘要 · alone ≠ dual · 不代签 mw-e2e-ha · implementer 不自批）
**对象**: line/c2-uc004-fault tip `e09978d`（本地未 push）· 复验分支 `rv/c2p-rag-route` @ worktree `meetwise-rv-c2p-rag-route`
**Date**: 2026-10-03

## 1. 包完整性（独立核验）

- `git show --stat e09978d` 恰 5 申报文件 +489/−1：`apps/api/test/uc-e2e-004-career-path-fault.proof.ts`（新增 347 行）+ root `package.json`(+2) + `apps/api/package.json`(+1) + `scripts/run-e2e-isolated.mjs`(+12/−1) + receipt(+128)。**零产品源码改动**。
- **UC-018 / UC-052 / UC-025 文件零触碰**（diff 仅上列 5 文件；`run-e2e-isolated.mjs` 三处改动均为新 target 纯增量注册）。**SSOT 三件零 diff**（`gap-uc004-fault-real-evidence.slice.md` / `harness/gap-uc004-fault-real-evidence.md` / `w0-w8-workflow-status.md`，3dfea02..e09978d）。
- 机器回执 digest 比对：提交版 9 个源文件 sha256 与 run4 回执 `…11-57-22-333Z-38319-*.json` **逐项一致**（prove 脚本 = run4 探针修复版 `97e9655b…`；interview.service/controller/db.service/all-exceptions.filter/principal.ts 产品面 digest 与 run3 `…11-52-31-702Z-34430-*.json` 完全相同 → 两录制运行之间产品未变）。run3/run4 回执均 `exitCode=1`、`outcome=failed`、`releaseEvidence=false`、迁移 manifest count=134。

## 2. Fresh re-run（C-DUAL-FROM-FRESH · 恰一次 · 禁重试 · 未重试）

- 前置：`pnpm install --frozen-lockfile` EXIT=0（16.6s）；隔离镜像 `pgvector/pgvector:pg16` 本地已在（docker.io 不通、无拉取需求）。
- **CMD**: `pnpm uc004:career-path-fault:prove`
- **EXIT=1**（2026-10-03T12:07:15Z→12:07:43Z；随机容器 `meetwise-e2e-41335-1791029236295` · 动态端口 `127.0.0.1:51513` · applied=134 · `ISOLATED_TARGET_ATTESTATION ok` · 机器回执 `…12-07-43-008Z-41335-f20f5ca7-….json` exitCode=1 / releaseEvidence=false）。
- 与实现方摘要**逐项同形**（可复现，非偶发）：
  - ATTEMPT-0-CONTROL exit=0：POST 200 + SQL rows=1 + GET 200 + 账本净 0（注入点可达）。
  - FI-2 exit=0：500 `{"error":"internal_error"}` durationMs=15011≈产品 15s（`packages/db/src/principal.ts:844` statement_timeout）；SQL rows=0 + GET 404 `{"error":"not_found"}`；账本快照 before===after；server alive（run3 探针缺陷①在提交版已修正：改测 IV_CTL GET=200）。
  - FI-1 exit=1：`transport_closed: UND_ERR_SOCKET`、API 子进程 exit_code=1 signal=null、stderr `Emitted 'error' event on Client instance`（pg@8.22.0 client.js:199/417）——我方 fresh run 复现同根因；SQL rows=0、GET 侧 ECONNREFUSED、账本净 0、`graph_run_rows=0`。
  - FI-3 exit=1 **UNREACHABLE**：`interview.service.ts:749` generateCareerPath 同步 derive（`:764` deriveCareerPath 调用、region graph-wire=false）、`packages/ai-graphs/src/index.ts` 非注释 career 行=0（run3 探针缺陷②已修正：注释行不再计入）、career 图文件=none、`ai_graph_run` career rows=0（未伪造）。
  - `ATTEMPTS_LEDGER attempts=4 one_shot=true retry_to_green=false exits=…CONTROL:0 …FI2:0 …FI1:1 …FI3:1` → **EXIT=1 结构性成立**（FI-3 不可达 + FI-1 真缺陷）。

## 3. 条件裁决（pre-exec 六条）

| 条件 | 裁决 | 证据 |
|---|---|---|
| C-1 隔离壳三处注册 + 随机容器/动态端口 | **PASS** | `run-e2e-isolated.mjs` 三处注册（`isolatedReceiptSources` / `unsupported_e2e_target` 守卫 / migrate 白名单）+ 两级 package.json 包装；fresh run 随机容器 + 动态端口 51513；loopback + `meetwise.e2e_run_token` nonce attestation ok |
| C-2 attempts 全记录（含中断与探针缺陷保留，非 retry-to-green） | **PASS** | run1/run2 bootstrap 中断 0 attempts 如实入账（0059 fence 种子 GUC 依赖属实：0058:36/:71 `app.principal_user` / `interview_privacy_fenced`；run2 为实现方 `ReferenceError: dims`）；run3 两处探针缺陷标注原样保留；run3/run4 EXIT 同为 1，无绿可追，不构成 retry-to-green |
| C-3 F1/F2/F3 实测 | **PASS** | F1 500 信封 15021/15011ms；F2 SQL 直查 + HTTP GET 双证；F3 全行快照（bucket 5.00/0.00/0.00 · consumption [] · orders []）进 receipt §Appendix run4 EVIDENCE 与我方 fresh run EVIDENCE，逐字 before===after。注：run3 快照仅内存比对未落盘——receipt §1 run4 行「增加 EVIDENCE 全量落盘（C-3 快照）」+ §3 原样收录无 EVIDENCE 行的 run3 stdout，构成披露（偏隐式）；录制证据以 run4 为准，不阻塞 |
| C-4 receipt 路径 / releaseEvidence=false | **PASS** | 落点 `ai-docs/delivery/receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`；receipt 与全部 3 份机器回执 `releaseEvidence=false` |
| C-5 行语义冻结 | **PASS** | EXIT1 → gap 保持：SSOT 三件零 diff、UC-E2E-004 FAULT 列未动、coveredCount=8 原值；未伪造 AiGraphRun（各 attempt `graph_run_rows=0` 实测 + `FI1-NO-FAKE-GRAPH-RUN` PASS）；未用同步 5xx 冒充图失败（500 只记为 FI-2 的 F1，FI-3 记 UNREACHABLE）；未 invent fix（diff 零产品改动）；mark-red EXIT0 未替代（receipt/prove 双 NOTE 显式互不替代） |
| C-6 零越界 + pins 原值 | **PASS** | 恰 5 文件、零 UC-018/052/025 触碰、分支本地未 push（无 origin 远端跟踪 ref）；pins haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE 503 全部原值 |

## 4. FI-1 缺陷证据定性核查

- **只留证未修产品 = 符合 Ban invent fix**：e09978d diff 无任何产品源码；run1 的种子 GUC 修复是 prove 侧 seeding（proof.ts 种子块 `set_config('app.principal_user','userA')`，与产品 `asPrincipal` 同语义），非产品行为修改。
- **证据链充分，表述成立**：`createPool`（`packages/db/src/principal.ts:837-850`）返回裸 pg Pool；产品侧（`db.service.ts` / `all-exceptions.filter.ts` / `packages/db/src/*.ts`）grep 实证**零 `pool.on('error')` 监听器**；pg@8.22.0 idle client error → `pool.emit('error')` → uncaughtException → 进程 exit 1（fresh run stderr 复现同帧）。单后端 `pg_terminate_backend` 即令 API 崩溃、无 HTTP 响应、GET 侧不可达——**「A3 降级契约在连接断下不成立」有充分运行时证据支撑**；修复（池 error 监听 / 降级响应）属产品工作，须另刀授权。

## 5. Fail-trigger audit

- EXIT1 记成 flake：**未发生**（receipt/GAP 行均明示 honest gap retained）。
- 伪造 `AiGraphRun=failed`：**未发生**（三重实测 rows=0）。
- 同步 5xx 冒充图失败：**未发生**（500 只作 FI-2 F1 记录；FI-3 独立记 UNREACHABLE）。
- invent fix：**未发生**（零产品 diff）。
- SSOT 行翻转 / coveredCount 变动：**未发生**（SSOT 三件零 diff）。
- mark-red EXIT0 替代运行时证据：**未发生**（显式互不替代 NOTE，独立 target）。
- 越界触碰他线文件 / 分支 push：**未发生**。
- fresh re-run 形态偏离（EXIT0 或崩溃形态不同）：**未发生**（EXIT=1 同形复现）。

## 6. Blockers

无。

## 7. Conditions（C-*，非阻塞记录）

- **C-A** run3 F3 快照未落盘属已披露的 prove 工具层缺口；本刀录制证据以 run4 为准；后续 prove 沿用 run4 探针版（含 EVIDENCE 全量落盘）。
- **C-B** prove 脚本 FI-3 分支：若未来树上出现接线，将记 attempt exit=0 而未实际观察 failed+降级+重试+额度不变（EXIT 契约对 FI-3 的全条件）；本树 UNREACHABLE → EXIT=1 不受影响；复用于有接线树前须先补 FI-3 观察探针。
- **C-C** FI-1 修复（池 error 监听/连接断降级）属产品工作，须另刀 REQUEST + 协调方授权，不得随任何 prove/docs 刀搭车。
- **C-D** A3 / NHP-004-FAULT-01 关闭前置 = 本 POST-PROVE dual PASS **且** mw-e2e-ha 独立签署（alone ≠ dual）**且** 协调方显式授权；任何单项均不构成关闭；ban push。

## 8. 摘要（中文三行）

1. 包完整恰 5 文件零越界：SSOT 三件与 pins 原值不动，机器回执 digest 与提交版逐项一致，run1/2 bootstrap 中断与 run3 探针缺陷如实入账，run3/run4 EXIT 同为 1，无 retry-to-green。
2. 我方 fresh re-run 恰一次 **EXIT=1**：FI-2 全绿（500 internal_error @≈15s + SQL/GET 双证无半写 + 账本快照净变 0）、FI-1 进程崩溃同根因复现（产品池无 error 监听，只留证未修产品）、FI-3 结构性不可达（749/764 同步 derive、零图接线、零伪造 run）。
3. pre-exec 六条件全 PASS、fail-trigger 零命中，gap 诚实保留、A3 not closed；待 mw-e2e-ha 独立签署与协调方授权；禁 push。

