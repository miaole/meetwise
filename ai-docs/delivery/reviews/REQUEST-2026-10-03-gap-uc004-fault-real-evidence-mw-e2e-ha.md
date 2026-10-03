# REQUEST — **GAP-UC004-FAIL-A3 · FAULT real evidence** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha 视角）

C' FINAL `0652a08` 只钉「FAULT 仍 gap」；本刀 REQUEST 为 `GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` 求可复现故障注入真证据。请审：

1. **注入点可执行性**：FI-1 连接断（`pg_terminate_backend` 或等价）· FI-2 statement/pool 超时注入 · FI-3 图失败状态机（本树无接线 → 预期不可达，只能诚实 EXIT1）。注入路径= `POST /interview/:id/career-path`（`generateCareerPath` 唯一产品路径）。
2. **EXIT 契约**：EXIT 0 = FI-1/FI-2 每次 F1（响应可解释，非 200-假成功）+F2（`career_path` 无半写、GET 不返回失败产物）+F3（额度/计费账本净变 0，D1 不计费口径）全成立 **且** FI-3 观察到 `AiGraphRun=failed`+UI 降级+重试+额度不变；任一不成立/做不出 → **EXIT 1 诚实保留 gap**。EXIT 0 也不自动翻行：A3 关闭还须 post-prove dual + 协调方授权。
3. **隔离与安全**：prove 走 `scripts/run-e2e-isolated.mjs` 隔离惯例（同 `uc004:career-path:prove` 包装）；Ban secrets/`.env*`；`releaseEvidence=false`。
4. **口径**：现有 `pnpm uc004:career-path:prove` 是静态盘点+mark-red（S1–S5+G-GAP），EXIT0 ≠ FAULT 运行时证据 ≠ A3 关闭（C' 原钉）。receipt 落点 `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`。

Row **`UC-E2E-004`** FAULT column stays gap. Case `NHP-004-FAULT-01` stays gap. **Ban covered**. **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · GAP-UC004-FAIL-A3 / NHP-004-FAULT-01 · FAULT real evidence · mw-e2e-ha（docs gate only · Ban prove · Ban product edit）

**被审 SHA**: `f44d8daf3a2eb385d423d0d0d4d8aa2c477cddf6`（origin tip，branch `feat/mysql-schema-skeleton`）
**审查基线**: 独立 worktree `rv/c2-e2e-ha` @ `f44d8da`；C' FINAL `0652a08` 经 `git merge-base --is-ancestor` 验证为 `f44d8da` 祖先（ANCESTOR-OK）。本审为 **PRE-EXEC dual docs gate only**：只审 REQUEST 文档的 EXIT 契约与诚实路径，**未执行任何 prove**（Ban prove），未改任何产品文件与共享 SSOT。alone ≠ dual，不代签 `mw-rag-route`（其 stub 仍 PENDING）。

## 检查表（file:line 证据）

**A. 提交形态（docs-only + 祖先链）**
- [x] `git show --stat f44d8da`：仅 4 个新增 docs 文件（slice / harness / 双 stub），+187/−0，零代码、零 SSOT 改动。
- [x] 祖先：`merge-base --is-ancestor 0652a08 f44d8da` 通过；parent tip `f3cf84c` 亦在祖先链（slice:6、stub:7 所钉 base/parent 与实际一致）。
- [x] 状态仍是 stub：`reviews/REQUEST-2026-10-03-gap-uc004-fault-real-evidence-mw-e2e-ha.md:3`（PENDING / `draft:awaiting_pre_exec_dual`）；peer stub `…-mw-rag-route.md:3` 同为 PENDING，无交叉签名（stub:34「Ban self-approve · alone ≠ dual」）。

**B. EXIT 契约（可复现 · 可断言 · 二元无部分分漏洞）**
- [x] EXIT 0 充要条件钉死：harness:53「FI-1 与 FI-2 每次注入 F1+F2+F3 全部成立 **且** FI-3 可达并观察到 `AiGraphRun=failed`+降级+重试+额度不变」；且 EXIT0 不自动翻行（harness:53「还须 post-prove dual PASS + 协调方授权」）——A3 关闭路径与 prove EXIT 解耦。
- [x] EXIT 1 诚实保留路径为铁律：harness:54「任一注入做不出/关不了，或 FI-3 因产品未接线而不可达 → 保持 gap，Ban invent fix，Ban 把 EXIT1 说成 flake」；harness:44「不可达 → 不得 EXIT 0」。
- [x] FI-3 可达性预判与源码事实一致（读码验证）：`apps/api/src/modules/interview/interview.service.ts:749-772` `generateCareerPath` = 同步 `deriveCareerPath`（:764）+ 单条 `INSERT INTO career_path`（:765-769）；`apps/api/src` 内 career 相关 `AiGraphRun` 引用 = **0**，无 career-path 图文件。FI-3 本树必然不可达 → 本刀唯一诚实出口今天是 EXIT1，契约已预先钉死，无洗绿空间。
- [x] 冒充通道封死：harness:44/:67「Ban 伪造 `AiGraphRun=failed`、Ban 用同步 derive 路径的 5xx 冒充图失败」——防止拿 FI-1 的 500 冒充 FI-3 达成 EXIT0。
- [x] 待授权产物与现有 prove 的关系：harness:48 拟新增 `apps/api/test/uc-e2e-004-career-path-fault.proof.mjs` + root `uc004:career-path-fault:prove`（走 `scripts/run-e2e-isolated.mjs`，同 `uc004:career-path:prove` 包装形态：root `:prove`→`:raw`→apps/api `prove:*`，见 `package.json:149-150`、`apps/api/package.json:44`）；harness:55 明确与既有 mark-red EXIT0「互不替代」。拟新增产物当前不存在（`apps/api/test/` 仅 `uc-e2e-004-career-path.proof.mjs`；package.json 无 fault 脚本；receipts 无 uc004-fault 文件）——本 commit 确实零代码。
- [x] 现有 prove 静态性结论属实（harness:28-32 的技术根据可复现）：`apps/api/test/uc-e2e-004-career-path.proof.mjs` 共 219 行，仅 S1–S5+G-GAP 静态正则断言（:52-158），无 http/fetch/inject——「EXIT0 ≠ FAULT 运行时证据」成立。

**C. 隔离惯例（沿用可复现）**
- [x] `scripts/run-e2e-isolated.mjs:9` 头注原话「local green ≠ HA · need multi-instance + fault-inject for releaseEvidence」被 harness:24 如实引用，无断章。
- [x] 隔离机制在壳内已具备：per-run `randomUUID` target token（:1724）+ 动态端口映射 `-p 127.0.0.1::5432`（:2049）+ receipt writer（:53）——唯一容器/动态端口惯例可沿用，无共享卷/固定端口需求。

**D. F1/F2/F3 断言具体性**
- [x] F1 响应可解释（非 200-假成功）：harness:40；F2 `career_path` 无本次半写 + `GET` 不返回失败产物：harness:40（两者均可经隔离 PG 直查 + HTTP GET 机器断言；单条 INSERT 语句级原子性不削弱「无失败产物」断言的可检验性）；F3 额度/计费账本净变 0（D1 不计费口径）：harness:40/42，与 `e2e-scenarios.md:125`「不消耗权益（career-path 不计费，D1）」、:133「额度不变」原文一致——未发明验收标准（slice:23「A3 口径以 e2e-scenarios.md 原文为准」）。
- [x] 注入点表：harness:39-42 三注入（FI-1 `pg_terminate_backend` 或等价 / FI-2 `statement_timeout`、锁占位 / FI-3 图状态机）均落在唯一产品路径 `POST /interview/:id/career-path`（`interview.controller.ts:231-233` 佐证唯一路由），观察集明确。

**E. receipt 与 attempts**
- [x] receipt 落点唯一且明确：harness:59 `ai-docs/delivery/receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`（EXIT 值 · FI-1/FI-2/FI-3 逐项 · F1/F2/F3 断言记录 · 可附 `.json`）；slice:25 诚实条款同口径。
- [x] harness:49「真实起 api + 隔离 PG、真实执行注入、逐项断言、如实尝试 FI-3、**全输出**落 receipt」——全输出措辞覆盖失败 attempt；EXIT1 须打印 `GAP-UC004-FAIL-A3` 明细（harness:54）。显式逐 attempt 条款见 Condition C-2。

**F. 禁碰与 Pins**
- [x] f44d8da 未碰任何 SSOT 文件（diff 仅 4 新增 docs）；矩阵 `e2e-requirement-coverage-matrix.md:115` `UC-E2E-004 = gap/gap/gap/blind` 原样、`:352/:363` C'/FINAL NAIL「Do not treat `pnpm uc004:career-path:prove` EXIT 0 as A3 closed」原样保留；NHP `non-happy-path-perf-load-case-matrix.md:83` `NHP-004-FAULT-01 = gap · 静态 G-GAP` 原样。
- [x] UC-018 / UC-052 / UC-025 零接触（stub:32、slice:29、harness:66 三处 Ban 一致）；coveredCount=8 未动；UC-E2E-004 FAULT 列与 `NHP-004-FAULT-01` 保持 gap（A3 未关）。
- [x] Pins 原值逐字一致（stub:4 = slice:4 = harness:4 = peer stub:4 = harness:76）：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503。
- [x] 授权边界：stub:34、slice:7/:29、harness:3/:12/:63 一致「Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权）· Ban push · Ban secrets/`.env*` · Ban force-push · Ban SSOT edit · Ban self-approve」。本审未执行 prove、未写代码、未 push。

## Fail-trigger audit（逐项均未触发）

1. REQUEST 授权 coding/prove/push → 未触发（Ban 三重钉死，见 F）。
2. 把 `uc004:career-path:prove` mark-red EXIT0 当 A3 关闭 / 给 EXIT0 翻行授权 → 未触发（harness:53/:55、C' nail 原文保留，matrix:352/:363）。
3. FI-3 允许伪造 `AiGraphRun=failed` 或拿同步 5xx 冒充 → 未触发（harness:44/:67 封死）。
4. EXIT1 可被记成 flake/环境问题 → 未触发（harness:54/:67 明文 Ban；EXIT1 = 可收诚实证据）。
5. Ban invent fix 被绕开（REQUEST 夹带修法）→ 未触发（harness:12/:25/:63/:67；REQUEST 只求证据不定义修法）。
6. 碰 UC-018/052/025 或翻任何行 / coveredCount 变动 / DELETE=503 变动 → 未触发（diff 文件清单 + F 项核查）。
7. Pins 偏移 → 未触发（四文件逐字一致）。
8. F1/F2/F3 不可机器断言（纯措辞）→ 未触发（B/D 项：状态码+响应体、SQL 直查、GET、账本快照均可落地；加固见 C-3）。

## Blockers

无（none）。

## Conditions（prove 落地时必须满足；违反任一 → post-prove 审 FAIL）

- **C-1 隔离壳强制**：新 target 必须注册进 `scripts/run-e2e-isolated.mjs` 目标表并沿用 `uc004:career-path:prove` 同款三层包装（root `:prove` → `:raw` → apps/api `prove:uc004-career-path-fault`），不得绕壳裸跑；沿用 per-run 随机容器（randomUUID, run-e2e-isolated.mjs:1724）+ 动态端口（:2049），禁共享卷、禁固定端口复用。
- **C-2 attempts 全记录 · Ban retry-to-green**：receipt 须逐次记录每次注入 attempt（含中断/失败 attempt 与其各自 EXIT 值与时间戳）；不得只保留绿色 attempt 或循环重跑至绿。EXIT1 时 `GAP-UC004-FAIL-A3` 明细须含 FI-3 不可达的具体原因（缺图接线/缺 AiGraphRun 观察点的 file:line）。
- **C-3 F1/F2/F3 实测化**：F3 不得以「career-path 本就不计费」跳过断言——须在隔离 PG 内对额度/计费账本做 before/after 实测快照并落 receipt（净变 0 是观察结果，不是假设）；F1 须记录每次注入的准确 HTTP 状态码 + 响应体；F2 须同时有 SQL 直查（`career_path` 无本次行）+ HTTP GET 两侧证据。
- **C-4 行语义冻结**：无论 EXIT0/EXIT1，`UC-E2E-004` FAULT 列与 `NHP-004-FAULT-01` 保持 gap 由本刀钉死；EXIT0 也不翻行（A3 关闭须 post-prove dual + 协调方授权）；与既有 `uc004:career-path:prove` 的 mark-red EXIT0 互不替代（harness:55）。

## 三行中文摘要

1. `f44d8da` 纯 docs（4 新增文件 +187/−0，C' `0652a08` 祖先验证通过），REQUEST 只为 `GAP-UC004-FAIL-A3`/`NHP-004-FAULT-01` 求可复现故障注入证据，EXIT0/EXIT1 契约二元钉死、FI-3 不可达走诚实 EXIT1 为铁律，与读码事实（`generateCareerPath` 同步 derive + 单 INSERT、career `AiGraphRun` 引用为 0）一致，无洗绿通道。
2. 隔离惯例可沿用（per-run 随机容器 + 动态端口 + receipt writer 均在 `run-e2e-isolated.mjs` 已具备），F1/F2/F3 断言具体可机器化，现有 mark-red prove 的静态性结论经源码复核属实，「EXIT0 ≠ A3 关闭」原钉完整保留。
3. 无 Blockers，附 4 条 Conditions（隔离壳注册、attempts 全记录禁 retry-to-green、F3 账本实测快照不得假设、行语义冻结）；本审 docs gate only，未执行 prove、未改产品与 SSOT；alone ≠ dual，不代签 mw-rag-route。

Verdict: PASS

# POST-PROVE dual 审查 · **mw-e2e-ha**（adversarial evidence-honesty · 独立复验）

**Reviewer**: `mw-e2e-ha`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-c2p-e2e-ha` @ `e09978d9b6fcee5aeb13d7ae491ed4721c8c6e16`，分支 `rv/c2p-e2e-ha` ← `line/c2-uc004-fault`）· **Date**: 2026-10-03 · 审对象 = prove 提交 `e09978d`（5 files +489/−1）。alone ≠ dual，不代签 mw-rag-route。

## A. 包完整性（独立复核）

- `git show --stat e09978d` = 恰 **5 申报文件**：proof `apps/api/test/uc-e2e-004-career-path-fault.proof.ts`（新增 347 行）+ receipt md + root `package.json`（×2 script）+ `apps/api/package.json`（×1 script）+ `scripts/run-e2e-isolated.mjs`（×3 注册：allowlist / migrate 白名单 / `isolatedReceiptSources`）。**零产品源码触碰**（`apps/api/src/**`、`packages/**` 无 diff）→ Ban invent fix 成立。
- **SSOT 三件零 diff**：`git diff 3dfea02..e09978d` 在 `ai-docs/delivery/` 下仅新增 receipt。SSOT 三件（e2e-requirement-coverage-matrix / execution-master-checklist / gap-bug-backlog）相对 origin/main 的全部 diff 均来自 pre-exec dual 已 PASS 的 `3dfea02`（REQUEST docs），prove 提交零翻行。实测钉行：`UC-E2E-004` 整行 **gap**（matrix:115/173）、`NHP-004-FAULT-01` **stays gap**（backlog:249/253）、coveredCount=**8**。
- **UC-018/052/025 零触碰**：migrate 白名单行为整行重写，逐字节比对 uc052 段 **UNCHANGED**，delta 恰为 37 字节 `,'uc004:career-path-fault:prove:raw'` 追加；allowlist / receipt sources 均纯新增，无任何 uc018/uc052/uc025 语义修改。
- **机器回执一致性**：`.tmp/isolated-proof-receipts/`（line-c2 worktree）4 份全录：`11-46-06`（run1）/`11-50-36`（run2）/`11-52-31-702Z`（run3）/`11-57-22-333Z`（run4），EXIT 均 1、`releaseEvidence=false`。11 项 sourceDigests 中**产品文件 digest 四次运行逐字节恒定**（principal `63bd6f09…`、interview.service `6e3ad159…` 等）→ 无中途改产品。提交的 proof.ts sha256 `97e9655b…` 与 run4 回执 digest **相等**；receipt md §3/§Appendix 的 ATTEMPT/EVIDENCE 行与 run3/run4 机器回执声称的 stdout 逐项一致（F1 精确状态码+响应体、F2 双证、F3 全行快照、FI-1 stderr tail）。

## B. Fresh re-run（C-DUAL-FROM-FRESH · 恰好一次 · 禁重试遵守）

- CMD: `pnpm install --frozen-lockfile`（Done 8.3s）→ **恰好一次** `pnpm uc004:career-path-fault:prove` → **EXIT=1**（stderr 侧 `PROVE_EXIT=1`）。
- 隔离壳自管：随机容器 `meetwise-e2e-44529-1791029930435` @ `127.0.0.1:52677`（动态端口）；`ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified`；migrations applied=134。本地已有 pgvector:pg16（daocloud 镜像 digest `sha256:7b822b0a…`），壳为 `docker run` 直启、无 docker.io 依赖。
- 4 attempts 逐项复现 run4（same shape, zero deviation）：
  | # | id | exit | 关键实测（本次 fresh run） |
  |---|----|------|--------------------------|
  | 1 | ATTEMPT-0-CONTROL | **0** | POST=200 · sql_rows=1 · GET=200 · ledger before===after 净变 0 |
  | 2 | ATTEMPT-1-FI2-STATEMENT-TIMEOUT | **0** | durationMs=**15012**≈产品 15s 超时 · F1=500 `{"error":"internal_error"}` · F2 rows=**0** + GET **404** `{"error":"not_found"}` · F3 快照逐行相等净变 0 · server_alive=true · graph_run_rows=0 |
  | 3 | ATTEMPT-2-FI1-CONNECTION-BREAK | **1** | blocked_pid 命中 · terminated=true · HTTP 无响应 `transport_closed:UND_ERR_SOCKET` · **API 子进程 exit_code=1**（stderr：`Emitted 'error' event on Client instance` @ pg@8.22.0 client.js:199/417 `Connection terminated unexpectedly`）· rows=0 · GET 侧 unreachable:ECONNREFUSED · 净变 0 |
  | 4 | ATTEMPT-3-FI3-GRAPH-FAIL | **1 UNREACHABLE** | interview.service.ts:**749** `generateCareerPath` 同步 derive（:**764** `deriveCareerPath`）· region graph-wire regex=false · ai-graphs index.ts 非注释 career 行=**0**（:3 为注释）· career 图文件=none · `ai_graph_run` career-path rows=**0**（未伪造） |
- `ATTEMPTS_LEDGER attempts=4 one_shot=true retry_to_green=false exits=CONTROL:0 FI2:0 FI1:1 FI3:1` — 与 run4 完全一致 → **可复现**。fresh 机器回执 `.tmp/isolated-proof-receipts/2026-10-03T12-19-17-716Z-44529-5759ad39-2982-460c-9395-07e38e35defd.json`，sourceDigests 与 run4 逐字节相同。

## C. 条件裁决表

| 条件 | 裁决 | 依据（独立验证，非采信实现方自述） |
|------|------|------|
| C-1 隔离壳三处注册 + 随机容器/动态端口 | **PASS** | diff 见 3 处注册；fresh run 容器名含 pid+ts、端口 52677≠run4 的 50369；attestation loopback+nonce 实际执行 |
| C-2 attempts 全记录 · 中断如实入账 · 无 retry-to-green | **PASS** | run1/2 bootstrap 中断（11.9s/7.5s，0 attempts）如实入 receipt §1；run3 两处探针缺陷**原样保留**（未抹除、未重跑至绿）；run3/run4/fresh 终 EXIT 同为 1，无绿可追；ledger one_shot=true |
| C-3 F1/F2/F3 实测化 | **PASS** | F1 精确状态码+体落 EVIDENCE；F2=SQL 直查 rows + HTTP GET 双证；F3=entitlement_bucket/consumption/payment_order 全行 before/after JSON 快照（非 D1 口径假设），run4 附录与 fresh run 均实测落盘 |
| C-4 行语义冻结（EXIT0/1 均不翻行 · A3 未关 · 未伪造 · mark-red 未替代） | **PASS** | prove 提交零 SSOT diff；A3 NOT close 文案在 proof+receipt 原样保留；graph_run_rows=0 实测（Ban 伪造遵守）；「静态 mark-red prove 互不替代」NOTE 保留于 proof.ts:26 + receipt §4.5 |
| Ban invent fix | **PASS** | 5 文件中零产品源码；FI-1 崩溃缺陷**未修**，仅记录（正确方向） |
| EXIT 契约 | **PASS** | EXIT0 需四 attempt 全 0 且 FI-3 可达观察 failed+降级+重试+额度不变；FI-3 结构性不可达 → EXIT1 是**唯一诚实值**；fresh EXIT=1 符合预测，无形态偏离 |

## D. FI-1 缺陷定性（证据链闭合验证）

实测 stderr（`Emitted 'error' event on Client instance` → uncaught → child exit_code=1）+ 本方独立 grep：`packages/db/src/principal.ts` 池构造（`createPool` @ :837，`new Pool` @ :838）**零 `pool.on('error')` 监听**（grep exit=1，全文件无 on('error')/uncaughtException 兜底）。链条闭合：后端被终止 → pg Client 'error' → pg-pool idleListener `pool.emit('error')` → 无监听器 → uncaughtException → 进程退出。**结论：「A3 降级契约在连接断下不成立」由运行时+静态双证据支撑**；修复属产品刀（须另刀授权），本 prove 不修 = Ban invent fix 合规。此缺陷应作为 `NHP-004-FAULT-01` 的核心 gap 内容留在 backlog。

## E. Fail-trigger audit（触发即 FAIL 的情形 · 全部未触发）

1. fresh re-run EXIT0 或崩溃形态不同 → 实测 EXIT=1、四 attempt 形态与 run4 逐项一致。未触发。
2. run1/2 中断隐瞒或 run3 探针缺陷被洗白 → receipt §1/§3 全披露且机器回执可对账。未触发。
3. 伪造 `AiGraphRun=failed` 凑 FI-3 → rows=0 实测且 proof 明言 Ban 伪造。未触发。
4. 借 prove 顺手修产品（principal.ts 加 error 监听等）→ 11 项 digest 四次运行恒定 + commit 零产品源码。未触发。
5. SSOT 翻行 / coveredCount 变化 / 碰 UC-018/052/025 → prove 提交零 SSOT diff、白名单 delta=37 字节纯追加。未触发。
6. EXIT1 记成 flake / 用静态 mark-red EXIT0 替代运行时故障证据 → receipt 明文 Ban 且双证并存。未触发。

## F. Blockers

无。

## G. Conditions（PASS 附带条件）

1. 本 PASS = post-prove dual 中 mw-e2e-ha 一票；**alone ≠ dual**，须 mw-rag-route 独立签署后方可交协调方；A3 关闭最终须协调方授权，本审查不关闭 A3、不翻任何 SSOT 行。
2. `NHP-004-FAULT-01` 与 `UC-E2E-004` FAULT 列 **stays gap**（EXIT=1 语义如实保留）；coveredCount=8、releaseEvidence=false、haStatus=NOT_HA 等 pins 原值。
3. FI-1（pg 池无 error 监听 → 连接断即进程崩溃）为真实产品可用性缺陷，修复必须走独立产品刀 + 授权；Ban 在 review/ prove 层顺手修。
4. FI-2 已证「超时类依赖故障下可解释降级+无污染+账本净变 0」为真证据，但仅覆盖 statement_timeout 单类，不得外推为全故障类 covered。

## 中文三行摘要

1. 独立 fresh 复跑 `pnpm uc004:career-path-fault:prove` 恰好一次，EXIT=1，四 attempt（对照 0 / 超时 0 / 连接断 1 / 图失败不可达 1）与 run4 逐项一致，可复现。
2. 包完整性通过：恰 5 文件零产品源码、SSOT 三件零 diff、UC-018/052/025 零触碰、run1-4 机器回执全披露，run3 探针缺陷原样保留无 retry-to-green。
3. FI-1 崩溃链（principal.ts:837 池零 error 监听 → uncaught → exit 1）双证闭合且未修产品（Ban invent fix 合规）；EXIT=1 诚实保留 gap，A3 不关，待 peer 独立签署与协调方授权。

Verdict: PASS
