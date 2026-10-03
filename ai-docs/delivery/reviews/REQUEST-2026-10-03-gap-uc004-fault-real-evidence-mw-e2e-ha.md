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
