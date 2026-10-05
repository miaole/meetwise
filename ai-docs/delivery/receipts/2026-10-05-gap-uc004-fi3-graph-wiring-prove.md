# Receipt — **GAP-UC004-FI3-GRAPH-WIRING · Candidate A 产品接线 + prove 复跑**（Line T · row stays gap）

**Date**: 2026-10-05（Asia/Shanghai）
**Knife**: Line T · `harness/gap-uc004-fi3-graph-wiring.md` · slice `gap-uc004-fi3-graph-wiring.slice.md` · 服务 gap `GAP-UC004-FAIL-A3`（FI-3 腿）· case `NHP-004-FAULT-01` · row `UC-E2E-004`
**授权链**: REQUEST `f4b95fe` → PRE-EXEC dual BOTH PASS：**mw-e2e-ha `560a93302eab325dbd08df2a6674809f4381c78e`**（C-HA-1~7）+ **mw-model-op `30892530b7f0d1184b3c0fd0f116b85a0bd0372c`**（C-MO-1~7）→ 协调方授权 tip `ad8d68e5f2536e83668ea07f6c1e224c23b32442`（Candidate A ONLY；B/C REJECTED）
**执行 worktree**: box `/workspace/meetwise-lineT` · base `origin/feat/mysql-schema-skeleton` @ `e8c63a9`（= `ad8d68e` + 1 docs-only commit；`560a933`/`3089253`/`f4b95fe` 均为祖先，`git merge-base --is-ancestor` 实测 OK）
**Code commits**: `fc9d807caaa163c7b61e9386882c572b3c350be6`（产品 + 图单测）→ **`ced3691fb7b269c6b567f9af4510513cb8486c6e`**（prove 工具层）= **prove 执行 SHA**（porcelain 0 行）
**Rebase 披露（pull --rebase，非 force）**: push 前 origin 前进 1 个 docs-only commit `9ff3daf`（Line U G7 receipts，4 个 `ai-docs/delivery/receipts/g7-trio-fresh/*.md`）。本地 `fc9d807`→**`0a3c8a8`**、`ced3691`→**`b80bf92`**（rebase 后链上 SHA）。`git diff --name-only ced3691 b80bf92` = 仅该 4 个 Line U receipt 文件；interview.service.ts / proof.ts blob 两侧逐字相同（`88c85d17…` / `c7eeee09…`）→ prove 执行的代码树内容 = 链上 `b80bf92` 代码内容。prove 实际执行于 rebase 前的 `ced3691`（该 SHA 未推送，仅存本地 reflog），未因 rebase 重跑（Ban retry）。
**Prove CMD**: `pnpm uc004:career-path-fault:prove`（三层隔离壳不变：root → `scripts/run-e2e-isolated.mjs uc004:career-path-fault:prove:raw` → apps/api `prove:uc004-career-path-fault`；容器 `meetwise-e2e-273538-1791213518287` @ `127.0.0.1:32770` · migrations applied=**135** · `ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified`）
**实际 EXIT**: **shell EXIT=0**（one-shot · 恰好执行一次 · 2026-10-05 23:18:37 → 23:19:14 CST）· `ATTEMPTS_LEDGER attempts=4 one_shot=true retry_to_green=false exits=ATTEMPT-0-CONTROL:0 ATTEMPT-1-FI2-STATEMENT-TIMEOUT:0 ATTEMPT-2-FI1-CONNECTION-BREAK:0 ATTEMPT-3-FI3-GRAPH-FAIL:0`
**Machine receipt（.tmp，gitignored）**: `.tmp/isolated-proof-receipts/2026-10-05T15-19-14-108Z-273538-eb6fe4cf-826c-46f7-aa01-14d010bda3d6.json`（outcome=passed · exitCode=0 · release_evidence=false · file sha256 `906d766c15f618f7e1d14f7175a5ea2a4044fbc1ff1ac88879ff147e4f52928f`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503（原值，零变动）

> **EXIT0 ≠ A3 closed。** `UC-E2E-004` FAULT 列 / `NHP-004-FAULT-01` / `GAP-UC004-FAIL-A3` **stays gap**。A3 关闭 = 本 prove + **post-prove dual PASS（mw-e2e-ha + mw-model-op）** + 协调方 nail 三段全链；本 receipt 不预 claim、不翻任何 SSOT 行（矩阵/checklist/backlog 零 diff）。本行其余 gap（E2E-MAIN / GRAPH / GROWTH-A1A2 / UNCERTAINTY）不因本刀关闭——career-path 图是**薄包装**，不是完整图化。

---

## 1. 运行账目（全披露）

| # | 项 | 结果 | 说明 |
|---|----|------|------|
| 1 | 图单测 `packages/ai-graphs/test/career-path.proof.ts`（@`ced3691`，`pnpm -C packages/ai-graphs exec tsx test/career-path.proof.ts`） | **EXIT=0（33/33 PASS）** | 无 DB、零模型调用；内存 ledger 镜像 service SQL 语义。编码期另跑过一次（同结果），不属 prove。 |
| 2 | **`pnpm uc004:career-path-fault:prove`（恰一次 · @`ced3691`）** | **EXIT=0** | attempts=4 全 0；全文 §Appendix A。无 retry、无断言放宽。 |
| 3 | 信息性复跑静态 mark-red `pnpm uc004:career-path:prove`（@`ced3691`，**未修改该 prove**） | **EXIT=1（预期绊线）** | `S2-http-is-deterministic-derive-not-graph` FAIL（"generateCareerPath must call deriveCareerPath"——现以函数引用注入图）· `S3-no-career-path-graph-file` FAIL（career-path.ts 存在）· `G-GAP-product-surface-or-pins` FAIL（"career-path graph … appears wired — refuse gap EXIT=0"）。这是该静态 prove 的设计绊线（接线浮出即拒 EXIT0）；harness 原钉「静态 prove 的 G-GAP 行文更新属其自己的刀，本刀不碰」→ **如实披露，未改**；需协调方另开刀处理其 EXIT0 钉。 |
| 4 | `node scripts/eval-harness-matrix-cite.proof.mjs` | EXIT=0（code SHA 与最终 tip 各跑一次，见 §8） | — |
| 5 | `pnpm install --frozen-lockfile` @`ced3691` | OK | lockfile 仅 3 行 importer link（§2）。 |
| 6 | Docker 访问 | `sg docker -c "<cmd>"` | box 用户在 `docker` 组但当前会话未继承组 → 以 `sg docker` 包装执行（未改 socket 权限、未用 sudo）。 |

## 2. 触碰面（`git diff --stat e8c63a9 ced3691`，7 文件）

| 文件 | 变更 | 申报状态 |
|------|------|----------|
| `packages/ai-graphs/src/career-path.ts` | **新增** 70 行：`buildCareerPathGraph`（单节点 `derive`，dep 注入）· `runCareerPathGraph`（图执行 + 经注入 ledger 的 AiGraphRun 状态机）· `selectCareerPathDerive`（thread-scoped fail-only seam，纯函数）。imports 仅 `@langchain/langgraph` + `import type { CareerPath } from '@meetwise/domain'`（类型擦除，零 domain 运行时依赖之外的 import） | harness §触碰面 1 |
| `packages/ai-graphs/src/index.ts` | +2 行导出 | harness §触碰面 2 |
| `apps/api/src/modules/interview/interview.service.ts` | 仅 `generateCareerPath` 区段 + 模块级 seam 解析 `careerPathFailSeamThreadId()` + 2 常量/logger + import 行 | harness §触碰面 3 |
| `packages/ai-graphs/test/career-path.proof.ts` | **新增** 图单测 | harness §触碰面 4 |
| `apps/api/test/uc-e2e-004-career-path-fault.proof.ts` | FI-3 升级 + FI1 改写（§4/§5） | harness §触碰面 5 |
| `apps/api/package.json` | +1 依赖 `"@meetwise/ai-graphs": "workspace:*"` | **执行期必需增量，此处显式披露**：apps/api 原未声明 ai-graphs，pnpm 严格隔离下 `import '@meetwise/ai-graphs'` 无法解析；仅 workspace link，零第三方包变更 |
| `pnpm-lock.yaml` | +3 行（`apps/api` importer：`'@meetwise/ai-graphs': link:../../packages/ai-graphs`） | 同上；`--frozen-lockfile` 通过 |

**零 diff（实测 `git diff --stat e8c63a9 ced3691 -- <path>` 空）**：`packages/db/src/interview-graph-lease.ts`（**C-HA-1：未触碰、未借用**——SQL 内联于 service 区段）· `packages/db/src/principal.ts` · `packages/domain/src/career.ts` · `packages/ai-runtime/**`（C-MO-1）· `apps/worker/**`（C-MO-7）· `packages/db/migrations/**`（**迁移无**）· `apps/api/test/uc-e2e-004-career-path.proof.mjs`（静态 mark-red）· `scripts/**` · SSOT 三件 · 其他 interview 路径（assessment / learning-plan / report / adaptive / turn / events / answer）· UC-018/052/025/014/026 文件。

## 3. 产品接线实现（Candidate A · `generateCareerPath`）

事务序列（全部经 `this.db.asPrincipal`：`SET LOCAL ROLE app_role` + `app.principal_user` GUC，RLS / 0059 privacy fence 同产品语义；`owner_user_id=principal`、`graph_name='career-path'`、`thread_id=interview id`）：

1. **tx1（零写）**：`denyPublicPreviewWrite` → `guardInterviewPrivacy` → `assessment_report` 读取 → `assessment_required` 409 / `insufficient_evidence` 409 前置（原代码原样）。前置失败 = 图未启动 = **不产生 run 行**。
2. **tx2 begin（create/reuse → active）**：`guardInterviewPrivacy` → `pg_advisory_xact_lock(hashtext('career-path'), hashtext(owner:id))`（同线程并发 begin 串行化，提交即释放）→ latest-row `SELECT … ORDER BY version DESC LIMIT 1 FOR UPDATE` → 无行：`INSERT … status='active', version=1, lease_owner=<uuid>, lease_expires_at=now()+120s`；有行：`UPDATE … status='active', version=version+1, lease_owner/lease 续新`（复用/接管同一行 → 每线程恰一行）。**提交后 active 阶段真实持久化，先于图执行。**
3. **图执行**：`runCareerPathGraph` → `buildCareerPathGraph({ derive })` → 单节点 `derive(overall, weaknesses)`；`derive = selectCareerPathDerive(id, careerPathFailSeamThreadId(), deriveCareerPath)`。
4. **tx3 commitSuccess**：`guardInterviewPrivacy` → `INSERT INTO career_path … ON CONFLICT DO UPDATE`（**原 SQL 逐字不变**）→ 同事务 `UPDATE ai_graph_run SET status='succeeded', version=version+1, lease_owner=NULL, lease_expires_at=NULL WHERE run_id=$1 AND owner_user_id=$2 AND version=$3 AND status='active'`（version fence；被并发接管时 0 行 = 不越权改他人 run，derive 确定性故业务行无歧义）。返回 `cp` 原形 `{readiness, level, milestones}`。
5. **失败（图 dep 抛错 / tx3 任一失败）→ tx4 markFailed**：独立事务 `UPDATE ai_graph_run SET status='failed', version=version+1, lease 清空 WHERE … version=$3 AND status='active'` → **rethrow 原错误** → 全局 filter 统一 500 `internal_error`（Ban 吞错 / Ban 200-假成功）。tx3 回滚 → career_path 零半写。
6. **fail-closed（铁律 3）**：tx4 自身失败（如连接断）→ 不伪装终态：原错误照常抛出，转换错误经 `CareerPathGraph` logger 记 `career_path_graph_run_failed_transition_error[code]`，行如实停留 `active`；下一次 begin 走 latest-row `FOR UPDATE` 接管（不被残留 active 卡死）——图单测 `TRANSITION-FAIL-*` 4 项覆盖。本次 prove 中 FI-1/FI-2/FI-3 的 failed 转换**全部实测成功**（§4）。
7. **C-MO-6**：终态只落 `succeeded`/`failed`（不复用 adaptive fence 的 `waiting_user` 收尾）；终态清空 lease → `uq_active_run` 让出重试槽（FI-3 ⑥ 实测：failed v2 → active v3 → failed v4 同一行）。
8. **对外契约冻结**：成功体 / 409 信封 / 500 `internal_error` / GET 404 `not_found` 语义原样；`deriveCareerPath` 纯函数零改动。HTTP 不可见的实现差异：方法改为 `async`（`denyPublicPreviewWrite` 同步 throw → rejected promise，Nest 统一 filter 处理等价）；新增 ai_graph_run 行即本刀接线本身。

## 4. 注入 seam（C-HA-2 / C-MO-2 披露）

- **env 键**：`MEETWISE_CAREER_PATH_FAIL_THREAD_ID`；**值形态**：interview id 字符串（精确相等匹配，`trim()` 后比较；prove 中 = `IV_C2F3C_<STAMP>`，本次 `IV_C2F3C_MUVEADC4`）。
- **默认关**：未设 / 空 / 纯空白 → `selectCareerPathDerive` 返回**同一引用** `deriveCareerPath`（单测 `SEAM-UNSET/NULL/EMPTY/BLANK-SAME-REF` + `ZERO-DELTA-OUTPUT-EQUALS-DOMAIN` 6 输入 + `ZERO-DELTA-DOMAIN-ERROR-PASSTHROUGH`）。**`NODE_ENV=production` 恒关**（额外加严，`careerPathFailSeamThreadId()` 直接返回 undefined）。
- **精确线程**：其余线程原 dep（单测 `SEAM-OTHER-THREAD / PREFIX / SUBSTRING-NO-MATCH`；prove 同进程 CONTROL `IV_CTL` 200 + succeeded v2 = 同进程其余线程零影响）。
- **fail-only**：匹配时 dep 换为确定性 `throw { code: 'career_path_graph_injected_failure' }`，不产出任何结果（单测 `SEAM-EXACT-MATCH-FAIL-ONLY`）；不触网、不读凭据、不写 `ai_invocation_trace`。
- **生效点**：tx1 guards/assessment/前置与 tx2 begin **之后**，仅替换图 dep（失败路径因此必有真实 active 阶段）。
- 失效残留风险（e2e-ha 已评）：持 env 控制权者可令指定线程 career-path 失败——非权限提升、fail-closed；生产恒关。

## 5. prove 断言增量（C-HA-3/4/5 · C-MO-5 · 改写前后原文逐字）

### 5.1 `FI1-NO-FAKE-GRAPH-RUN` 等强改写

- **改写前（原文 @`e8c63a9` proof.ts:299）**：
  ```ts
  const noFake = A('FI1-NO-FAKE-GRAPH-RUN', graphRuns === 0);
  ```
  （`graphRuns = careerGraphRunCount()` = `SELECT count(*) FROM ai_graph_run WHERE graph_name='career-path'`，全表无线程过滤）
- **改写后（原文 @`ced3691`）**：
  ```ts
  const noFake = A('FI1-NO-FAKE-GRAPH-RUN', fi1Runs.length === 1 && fi1Runs[0]!.status === 'failed' && fi1Runs[0]!.version >= 2);
  ```
  （`fi1Runs = careerGraphRuns(IV_FI1)` = `SELECT status, version, lease_owner FROM ai_graph_run WHERE graph_name='career-path' AND thread_id=$1 ORDER BY version`）
- **理由**：接线后诚实执行必然产生 career-path 行（CONTROL succeeded、FI-2/FI-1 真失败行）→ 全表 0 与诚实执行不相容；「无伪造」语义 = 行反映真实执行。per-thread「恰一行 ∧ status='failed' ∧ version>=2」要求转换证据（active v1→failed v≥2）、拒装饰行（无 active 阶段的直插 failed = version 1 → FAIL）、拒多行、拒 status 任意 → **严格更严，无放宽**。全局行数保留为 evidence（`graph_run_rows_global`），不再断言（mw-e2e-ha pre-exec 裁决 ② 原文「Ban 任何残余全局零断言以『诚实运行必挂』形态存活」）。
- **实测**：`graph_run_rows(IV_FI1)=[{"status":"failed","version":2,"lease_owner":null}]` → PASS。

### 5.2 FI-3 attempt：静态不可达探测器 → 真注入 + 真观察

- **改写前**：`unreachable = !regionHasGraphWire && careerInIdx.length===0 && graphFiles.length===0 && graphRuns===0`，`exit = unreachable ? 1 : 0`，断言行 `A('FI3-UNREACHABLE-RECORDED', true)`（恒真）。
- **改写后**：恒真行与 unreachable 闸门删除（C-HA-5：不得残留为闸门）；新增 10 条真实断言并入 attempt exit 合取：`FI3-F1-HTTP-EXPLAINABLE`（①）· `FI3-GRAPH-RUN-FAILED-TRANSITION`（② 前置 0 行 ∧ 恰一行 failed ∧ version>=2）· `FI3-F2A-SQL-NO-HALF-WRITE` · `FI3-F2B-GET-NO-FAILED-PRODUCT`（③）· `FI3-F3-LEDGER-NET-0`（④）· `FI3-SERVER-ALIVE-AFTER`（⑤）· `FI3-RETRY-EXPLAINABLE-FAIL` · `FI3-RETRY-VERSION-INCREMENTS`（恰一行 ∧ failed ∧ version 严格递增）· `FI3-RETRY-SQL-NO-HALF-WRITE` · `FI3-RETRY-LEDGER-NET-0`（⑥）。静态探针 `regionHasGraphWire/careerInIdx/graphFiles/graph_run_rows_global` 降为 `static_probes_evidence_only` 字段（⑦，亦不作绿灯闸门）。
- **① 断言形态**：`kind==='http' ∧ status>=400 ∧ body.error==='internal_error'`（与 FI-1 F1 同形，运行前钉定）；实测 `500 {"error":"internal_error"}` 两次。

### 5.3 其余

- **FI-1/FI-2/CONTROL 既有断言零减项、零语义改动**（`FI1-F1/F2A/F2B/F3/CHILD-SURVIVES`、`FI2-*`、`CONTROL-0-*` 原文不变）。
- FI-2 `graph_run_rows` detail → per-thread 观察 `graph_run_rows(IV_FI2)` + `graph_run_rows_global`（仍非断言，FI-2 从未断言图行）。**实测**：`[{"status":"failed","version":2}]`（statement_timeout 中止 tx3 → tx4 failed 转换成功）。
- CONTROL per-thread succeeded 为**非阻塞 evidence**（`INFO CONTROL-0-GRAPH-RUN-SUCCEEDED … observed=true`，不进 EXIT）。**实测**：`[{"status":"succeeded","version":2,"lease_owner":null}]`。
- 新增 evidence（非断言）：`ai_invocation_trace` 全表行数（进程起止 + FI-3 前后）。
- `ATTEMPTS_LEDGER` 格式不变；EXIT1 文案改为列出实际非 0 attempt（原文案硬编码「FI-3 unreachable」，接线后不再成立）；EXIT0 增打印「EXIT=0 ≠ A3 closed」。

## 6. 实测 attempt 摘要（@`ced3691` · one-shot）

| Attempt | exit | 关键观察 |
|---------|------|----------|
| ATTEMPT-0-CONTROL | 0 | POST 200 · career_path 1 行 · GET 200 · 账本净变 0 · graph_run(IV_CTL)=succeeded v2 |
| ATTEMPT-1-FI2-STATEMENT-TIMEOUT | 0 | blocked_pid_found · 15026ms · 500 internal_error · 0 行 · GET 404 · 账本净变 0 · alive · graph_run(IV_FI2)=failed v2 |
| ATTEMPT-2-FI1-CONNECTION-BREAK | 0 | terminated=true · 500 internal_error · child still_running · pool_error_observed=true · 0 行 · GET 404 · 账本净变 0 · **graph_run(IV_FI1)=failed v2** |
| ATTEMPT-3-FI3-GRAPH-FAIL | 0 | before 0 行 → post1 500 internal_error · **graph_run(IV_FI3)=failed v2** · 0 行 · GET 404 · 账本净变 0 · alive · retry post2 500 · **failed v4（同一行）** · 0 行 · 账本净变 0 · trace delta 0 |

## 7. 零模型调用 / 零 trace（C-MO-1/3 · 证据）

- **结构**：`career-path.ts` imports 仅 `@langchain/langgraph` + type-only `@meetwise/domain`（单测 `PURITY-IMPORTS-ONLY-LANGGRAPH-DOMAIN` / `PURITY-DOMAIN-TYPE-ONLY` / `PURITY-NO-ENV-NO-TRACE-NO-NET`）；`@meetwise/ai-graphs` package deps 未变（domain + langgraph）；service 新 import 仅 `runCareerPathGraph, selectCareerPathDerive, CAREER_PATH_GRAPH_NAME`；`packages/ai-runtime/**` 零 diff → 调用链不可达 `invoke`（全仓唯一 trace INSERT 点）。
- **运行时观察**：`EVIDENCE ZERO-TRACE ai_invocation_trace rows start=0 end=0 delta=0`；FI-3 `ai_invocation_trace_rows_before=0 / after=0`；API 子进程 env 删除 `MODEL_API_KEY` / `MODEL_BASE_URL`；隔离容器无模型端点。**零 live、零模型调用、零 model-op 预算影响。**
- **两本账分离（C-MO-3）**：`ai_graph_run(career-path)` 行 = 运行状态 / fence 审计证据（version 递增是状态机转换证据，**不是**计费计数器、不是 spend 事件）；spend 侧证据独立由 entitlement_bucket / entitlement_consumption / payment_order 全行 before/after 快照「净变 0」承载（career-path 不计费 D1）；`actualSpendCny=null` 口径不变。

## 8. 机器 receipt 与源摘要

- machine receipt `sourceDigests`（runner 固定清单，未改 runner）：proof.ts `sha256:363bcb51…2520` · interview.service.ts `sha256:2ff135d0…cde2` · principal.ts `sha256:d73407ed…d195`（与 base 一致，未改）· schemaMigrationManifest count=135 latest `0135_resume_quiz_freshness_anchor.sql`。
- runner 清单不含 ai-graphs 文件（runner 不在触碰面，未扩）；补记 @`ced3691`：`packages/ai-graphs/src/career-path.ts` sha256 `12ca8d130a360b0c480e34afba12cea0a2e60a72062a716796c948999b6b5729` · `packages/ai-graphs/src/index.ts` `6fcc79fad2c9ef08a20cec263b6538bdf94a9f9bb20a4e68575ed6065925699c` · `packages/ai-graphs/test/career-path.proof.ts` `bee240eb5a2f0a2448a8b7ff54d559fbcdf07191a180049b01d3baa570d2f0ad`。
- `node scripts/eval-harness-matrix-cite.proof.mjs` @`ced3691`：EXIT=0。

## 9. Conditions 自检

| Cond | 自检 |
|------|------|
| C-HA-1 | create/reuse/failed 逻辑：SQL 在 `interview.service.ts` generateCareerPath 区段，编排在 `packages/ai-graphs`；`interview-graph-lease.ts` 零 diff 零借用 ✓（附加披露：`apps/api/package.json` + lockfile workspace link，§2） |
| C-HA-2 | 默认关 · fail-only · 精确线程 · guards 之后 · 零 trace · 零端点；键 + 值形态 §4 ✓ |
| C-HA-3 | FI1 改写前后原文 + 理由 §5.1；既有断言零减项；FI-2 实测如实；CONTROL succeeded 非阻塞 ✓ |
| C-HA-4 | 恰一行 per-thread（FI-1 IV_FI1；FI-3 含 in-fault 重试后评估）✓ |
| C-HA-5 | 静态探针仅 evidence，无 unreachable 闸门、无绿灯闸门 ✓ |
| C-HA-6 | 本次执行可连 GitHub，基于 origin tip `e8c63a9` ✓ |
| C-HA-7 | 三层隔离壳 / CMD 不变；machine receipt 落 `.tmp/isolated-proof-receipts/`；ledger 全记录 ✓ |
| C-MO-1 | ai-runtime 零 diff；career.ts 零 diff ✓ |
| C-MO-2 | env 未设零行为差单测 + seam 披露 ✓ |
| C-MO-3 | 两本账叙述分离 §7 ✓ |
| C-MO-4 | 无任何模型调用变体 ✓ |
| C-MO-5 | 同 C-HA-3/5 ✓ |
| C-MO-6 | 终态仅 succeeded/failed，不复用 fence 的 waiting_user ✓ |
| C-MO-7 | API 进程内同步单节点，worker 零 diff，无队列/checkpointer ✓ |

## 10. 开放项 / 不声称

- **STILL OPEN**：`GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` / `UC-E2E-004` FAULT gap（**EXIT0 ≠ A3 closed** · Ban fake close A3）。Post-prove dual BOTH PASS：mw-e2e-ha `a655ffdab52093e669dca8793c5cd8b6d1fbade5` + mw-model-op `84f8eeb454bc682031dc4795cefd44460f7b2d09`。Lifecycle advanced to **`post_prove_dual_pass`** by Line T nail（cross-ref harness/slice/SSOT）。NAIL_SHA = Line T nail tip（本树后续 commit）。SSOT_DELTA = additive honesty only（matrix FI-3 措辞更新 · FAULT/A3 stays gap · coveredCount=8）。
- 静态 mark-red `uc004:career-path:prove` 现 EXIT=1（§1 #3，预期绊线，本刀未碰）——需协调方决定其后续刀。
- 观察未覆盖（evidence 级说明，非新闸）：「复用后转成功」路径未在 e2e 观察（单测 `RETRY-AFTER-FAULT-SUCCEEDED-V6` 覆盖）；tx4 转换自身失败路径本次 e2e 未触发（单测覆盖）。
- releaseEvidence=false · Not HA · 本绿 ≠ covered ≠ A3 closed。

---

## Appendix A — prove 全文（`pnpm uc004:career-path-fault:prove` @`ced3691` · shell EXIT=0）

```text

> meetwise@0.1.0 uc004:career-path-fault:prove /workspace/meetwise-lineT
> node scripts/run-e2e-isolated.mjs uc004:career-path-fault:prove:raw

[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy (dual-track; intended sole default=mysql-qdrant-redis) E2E_PG_IMAGE=pgvector/pgvector:pg16 is a legacy pgvector isolation fixture — NOT sole-stack truth (sole stack = MySQL+Qdrant+Redis). Local green ≠ RAG migrated. releaseEvidence=false · Not HA · 本绿≠已迁 · local green ≠ HA · need multi-instance + fault-inject for releaseEvidence.
E2E_POSTGRES_READY label=boot consecutive=3 attempt=4
E2E isolated PostgreSQL: meetwise-e2e-273538-1791213518287 on 127.0.0.1:32770
E2E_ISO_STACK_NOTE isolated shell = test infrastructure only: isolated test PG ≠ product stack change ≠ cutover evidence; product stack pin = ai-docs/delivery/adr-postgres-retained.md (Postgres retained · PostgresSaver · pgvector). releaseEvidence=false · Not HA.

> @meetwise/db@0.0.0 migrate /workspace/meetwise-lineT/packages/db
> tsx src/migrate-cli.ts

migrations: applied=135 skipped=0 rag_control_manifest=not_requested qbank_control_manifest=not_requested runtime_login=not_requested qbank_control_login=not_requested privacy_worker_login=not_requested
E2E_POSTGRES_READY label=post-migrate consecutive=3 attempt=3
E2E_POSTGRES_READY label=pre-prove consecutive=3 attempt=3

> meetwise@0.1.0 uc004:career-path-fault:prove:raw /workspace/meetwise-lineT
> pnpm -C apps/api prove:uc004-career-path-fault


> @meetwise/api@0.0.0 prove:uc004-career-path-fault /workspace/meetwise-lineT/apps/api
> node --import @swc-node/register/esm-register test/uc-e2e-004-career-path-fault.proof.ts

UC-E2E-004 career-path FAULT real evidence prove · releaseEvidence=false · Not HA
NOTE: EXIT0 ≠ A3 closed（还须 post-prove dual + 协调方授权）· EXIT1 = 诚实保留 gap · Ban invent fix
NOTE: 与静态 mark-red prove（uc004:career-path:prove EXIT0）互不替代 · attempts one-shot · Ban retry-to-green
ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified
API_CHILD_READY base=http://127.0.0.1:46401 seam=MEETWISE_CAREER_PATH_FAIL_THREAD_ID=IV_C2F3C_MUVEADC4
INFO  CONTROL-0-GRAPH-RUN-SUCCEEDED(non-blocking evidence) observed=true rows=[{"status":"succeeded","version":2,"lease_owner":null}]
PASS  CONTROL-0-POST-200
PASS  CONTROL-0-SQL-ROW-1
PASS  CONTROL-0-GET-200
PASS  CONTROL-0-LEDGER-NET-0
ATTEMPT 1 id=ATTEMPT-0-CONTROL fault=none(positive control) exit=0 ts=2026-10-05T15:18:52.817Z post=200 sql_rows=1 get=200 ledger_net=0 graph_run(IV_CTL)=[{"status":"succeeded","version":2,"lease_owner":null}]
EVIDENCE ATTEMPT-0-CONTROL {"f1":{"kind":"http","status":200,"body":{"readiness":"需补强后投递","level":"mid","milestones":[{"stage":"补短板","goal":"优先攻克：分布式锁、消息队列"},{"stage":"模拟实战","goal":"完成 3 场达标(≥70)模拟面试"},{"stage":"进阶","goal":"系统项目沉淀 + 深度题复盘"}]}},"f2_get":{"status":200,"body":{"readiness":"需补强后投递","level":"mid","milestones":[{"goal":"优先攻克：分布式锁、消息队列","stage":"补短板"},{"goal":"完成 3 场达标(≥70)模拟面试","stage":"模拟实战"},{"goal":"系统项目沉淀 + 深度题复盘","stage":"进阶"}]}},"ledger_before":{"bucket":[{"id":"6731a559-b0d2-415f-a5df-7ad46ad5c79d","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-08-01 15:18:50.150871+00"}],"consumption":[],"orders":[]},"ledger_after":{"bucket":[{"id":"6731a559-b0d2-415f-a5df-7ad46ad5c79d","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-08-01 15:18:50.150871+00"}],"consumption":[],"orders":[]},"graph_run_thread":[{"status":"succeeded","version":2,"lease_owner":null}],"graph_run_succeeded_observed":true}
PASS  FI2-F1-HTTP-EXPLAINABLE
PASS  FI2-F2A-SQL-NO-HALF-WRITE
PASS  FI2-F2B-GET-NO-FAILED-PRODUCT
PASS  FI2-F3-LEDGER-NET-0
PASS  FI2-SERVER-ALIVE-AFTER
ATTEMPT 2 id=ATTEMPT-1-FI2-STATEMENT-TIMEOUT fault=FI-2 dependency timeout (pool statement_timeout=15000ms, SQLSTATE 57014 class) exit=0 ts=2026-10-05T15:19:07.864Z blocked_pid_found=true durationMs=15026 http=500 body={"error":"internal_error"} sql_rows=0 get=404/not_found ledger_net=0 server_alive=true graph_run_rows(IV_FI2)=[{"status":"failed","version":2,"lease_owner":null}] graph_run_rows_global=2
EVIDENCE ATTEMPT-1-FI2-STATEMENT-TIMEOUT {"blocked_pid_found":true,"durationMs":15026,"f1":{"kind":"http","status":500,"body":{"error":"internal_error"}},"f2_sql_rows":0,"f2_get":{"status":404,"body":{"error":"not_found"}},"ledger_before":{"bucket":[{"id":"6731a559-b0d2-415f-a5df-7ad46ad5c79d","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-08-01 15:18:50.150871+00"}],"consumption":[],"orders":[]},"ledger_after":{"bucket":[{"id":"6731a559-b0d2-415f-a5df-7ad46ad5c79d","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-08-01 15:18:50.150871+00"}],"consumption":[],"orders":[]},"graph_run_thread":[{"status":"failed","version":2,"lease_owner":null}],"graph_run_rows_global":2}
PASS  FI1-F1-HTTP-EXPLAINABLE
PASS  FI1-F2A-SQL-NO-HALF-WRITE
PASS  FI1-F2B-GET-NO-FAILED-PRODUCT
PASS  FI1-F3-LEDGER-NET-0
PASS  FI1-NO-FAKE-GRAPH-RUN
PASS  FI1-CHILD-SURVIVES
ATTEMPT 3 id=ATTEMPT-2-FI1-CONNECTION-BREAK fault=FI-1 connection break (pg_terminate_backend on INSERT backend) exit=0 ts=2026-10-05T15:19:13.156Z blocked_pid_found=true terminated=true http=500 child=still_running pool_error_observed=true sql_rows=0 get=404/not_found ledger_net=0 graph_run_rows(IV_FI1)=[{"status":"failed","version":2,"lease_owner":null}] graph_run_rows_global=3
EVIDENCE ATTEMPT-2-FI1-CONNECTION-BREAK {"blocked_pid_found":true,"terminated":true,"f1":{"kind":"http","status":500,"body":{"error":"internal_error"}},"child_exit":"still_running","graph_run_thread":[{"status":"failed","version":2,"lease_owner":null}],"graph_run_rows_global":3,"pool_error_log_seen":true,"pool_error_log_line":"{\"event\":\"db_pool_error\",\"purpose\":\"default\",\"count\":1,\"error_name\":\"Error\",\"error_message\":\"Connection terminated unexpectedly\"}","child_stderr_tail":"{\"event\":\"db_pool_error\",\"purpose\":\"default\",\"count\":1,\"error_name\":\"Error\",\"error_message\":\"Connection terminated unexpectedly\"}\n","f2_sql_rows":0,"f2_get":{"status":404,"body":{"error":"not_found"}},"ledger_before":{"bucket":[{"id":"6731a559-b0d2-415f-a5df-7ad46ad5c79d","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-08-01 15:18:50.150871+00"}],"consumption":[],"orders":[]},"ledger_after":{"bucket":[{"id":"6731a559-b0d2-415f-a5df-7ad46ad5c79d","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-08-01 15:18:50.150871+00"}],"consumption":[],"orders":[]}}
PASS  FI3-F1-HTTP-EXPLAINABLE
PASS  FI3-GRAPH-RUN-FAILED-TRANSITION
PASS  FI3-F2A-SQL-NO-HALF-WRITE
PASS  FI3-F2B-GET-NO-FAILED-PRODUCT
PASS  FI3-F3-LEDGER-NET-0
PASS  FI3-SERVER-ALIVE-AFTER
PASS  FI3-RETRY-EXPLAINABLE-FAIL
PASS  FI3-RETRY-VERSION-INCREMENTS
PASS  FI3-RETRY-SQL-NO-HALF-WRITE
PASS  FI3-RETRY-LEDGER-NET-0
ATTEMPT 4 id=ATTEMPT-3-FI3-GRAPH-FAIL fault=FI-3 graph fail state machine (AiGraphRun active→failed) via MEETWISE_CAREER_PATH_FAIL_THREAD_ID=IV_FI3 fail-only seam exit=0 ts=2026-10-05T15:19:13.212Z post1=500/{"error":"internal_error"} graph_run(IV_FI3)_after_post1=[{"status":"failed","version":2,"lease_owner":null}] sql_rows=0 get=404/not_found ledger_net=0 server_alive=true retry_post2=500/{"error":"internal_error"} graph_run(IV_FI3)_after_retry=[{"status":"failed","version":4,"lease_owner":null}] retry_sql_rows=0 retry_ledger_net=0 trace_rows_delta=0
EVIDENCE ATTEMPT-3-FI3-GRAPH-FAIL {"seam_env_key":"MEETWISE_CAREER_PATH_FAIL_THREAD_ID","seam_thread":"IV_C2F3C_MUVEADC4","f1":{"kind":"http","status":500,"body":{"error":"internal_error"}},"graph_run_thread_before":[],"graph_run_thread_after_post1":[{"status":"failed","version":2,"lease_owner":null}],"f2_sql_rows":0,"f2_get":{"status":404,"body":{"error":"not_found"}},"ledger_before":{"bucket":[{"id":"6731a559-b0d2-415f-a5df-7ad46ad5c79d","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-08-01 15:18:50.150871+00"}],"consumption":[],"orders":[]},"ledger_after_post1":{"bucket":[{"id":"6731a559-b0d2-415f-a5df-7ad46ad5c79d","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-08-01 15:18:50.150871+00"}],"consumption":[],"orders":[]},"server_alive_get":200,"retry_f1":{"kind":"http","status":500,"body":{"error":"internal_error"}},"graph_run_thread_after_retry":[{"status":"failed","version":4,"lease_owner":null}],"retry_sql_rows":0,"ledger_after_retry":{"bucket":[{"id":"6731a559-b0d2-415f-a5df-7ad46ad5c79d","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-08-01 15:18:50.150871+00"}],"consumption":[],"orders":[]},"ai_invocation_trace_rows_before":0,"ai_invocation_trace_rows_after":0,"static_probes_evidence_only":{"generateCareerPath_line":785,"runCareerPathGraph_line":805,"regionHasGraphWire":true,"careerInIdx":[{"line":15,"text":"export { buildCareerPathGraph, runCareerPathGraph, selectCareerPathDerive, CAREER_PATH_GRAPH_NAME, CAREER_PATH_INJECTED_FAILURE } from './career-path.ts';"},{"line":16,"text":"export type { DeriveCareerPath, CareerPathRun, CareerPathRunLedger } from './career-path.ts';"}],"graphFiles":["career-path.ts"],"graph_run_rows_global":4}}
EVIDENCE ZERO-TRACE ai_invocation_trace rows start=0 end=0 delta=0 (evidence field, non-gating; child env MODEL_API_KEY/MODEL_BASE_URL deleted)

ATTEMPTS_LEDGER attempts=4 one_shot=true retry_to_green=false exits=ATTEMPT-0-CONTROL:0 ATTEMPT-1-FI2-STATEMENT-TIMEOUT:0 ATTEMPT-2-FI1-CONNECTION-BREAK:0 ATTEMPT-3-FI3-GRAPH-FAIL:0
NOTE EXIT=0 ≠ A3 closed · NHP-004-FAULT-01 / UC-E2E-004 FAULT stays gap until post-prove dual (mw-e2e-ha + mw-model-op) + 协调方 nail
NOTE releaseEvidence=false · Not HA · EXIT=0 · EXIT 值不翻任何 SSOT 行 · A3 关闭须 post-prove dual + 协调方授权
NOTE pnpm uc004:career-path:prove（静态 mark-red EXIT0）≠ 本运行时故障注入证据的替代品
CMD=pnpm uc004:career-path-fault:prove EXIT=0
LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/isolated-proof-receipts/2026-10-05T15-19-14-108Z-273538-eb6fe4cf-826c-46f7-aa01-14d010bda3d6.json release_evidence=false
```

*Receipt · GAP-UC004-FI3-GRAPH-WIRING · Line T · prove EXIT=0 · post dual a655ffd+84f8eeb PASS · lifecycle post_prove_dual_pass · EXIT0 ≠ A3 closed · FAULT stays gap · Ban fake close A3 · STOP*
