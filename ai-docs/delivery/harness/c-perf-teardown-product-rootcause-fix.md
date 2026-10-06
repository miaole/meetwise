# Harness — **C-PERF-TEARDOWN · product rootcause fix**（Line AN-PERF-TEAR · docs REQUEST rewrite **×2 re-PRE** · **`draft:awaiting_pre_exec_dual`** · CONDITION may stay OPEN · Ban wash attempt1）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST rewrite **×2 re-PRE** · supersedes REQUEST `553cfc5`（which superseded `110532e`）· cites mw-rag-route Re-PRE FAIL **`7e97dc3`**（B1 partial · B3 · B4 · Cond 1/2）and PRE-EXEC FAIL `152b665`（B1–B6）· Ban coding · Ban prove · Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban self-approve · Ban self-nail · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false**
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` @ **`eae1e19`**（ff past `4b06058` / CODE `9e2abd0` AN-PRIV-EXT · AN-MOP-Q45 nail · Ban touch sibling AN files · Ban re-open AG/AI/AK · HOLD AN-CIMG-EA）
**Prior REQUESTs**: `553cfc5e4ca511b0327b647fcc2b49925828752c`（re-PRE #1 · **superseded by this rewrite ×2**）· `110532e81f11064e543bc9bc420b67bb2f95ae1e`（superseded）
**FAIL receipts**（retained · 不擦除 · 见 rag stub 历史段）: `7e97dc3e500c9471fe50dbdbd3aaee8d6c89e7e9`（Re-PRE FAIL @553cfc5）· `152b665787e02ac6ef350551e599b3823a9fa763`（PRE-EXEC FAIL @110532e）
**Wave**: Line **AN** REQUEST wave（this = **AN-PERF-TEAR** re-PRE ×2）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING re-PRE · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · Ban buy cloud · status `draft:awaiting_pre_exec_dual`
**Knife**: **C-PERF-TEARDOWN product rootcause fix（AN-PERF-TEAR）**——mid-prove pg Client teardown / unhandled crash 的产品根因判定 + 修复 REQUEST（≠ Line S Branch A 复跑证据刀 · ≠ Line AE CONDITION residual 容器可达证据刀）
**Gap id**: **`C-PERF-TEARDOWN`**（backlog `gap-bug-backlog.md:35` · P1 · **CONDITION OPEN** · 本刀不改名、不翻行）
**Parent context（只读 · cite · distinct knife）**:
- Line S `harness/gap-perf-teardown-rootcause-fix.md` — Branch A re-run / close-evidence · NAIL `post_prove_dual_pass` · CONDITION OPEN retained
- Line AE `harness/c-perf-teardown-condition-residual.md` — container-reachability residual · NAIL `post_prove_dual_pass` · CONDITION OPEN retained · R-A Linux-native-Docker-Engine only
- **本刀 = 新产品根因修复轨** · 旧 harness 只读引用 · Ban wash Line S / AE greens as product close

## Rewrite ×2 note（supersedes `553cfc5` · FAIL `7e97dc3`）

`7e97dc3` 已解除：**B2 / B5 / B6**（本稿原样保留其钉值：§2 分层、§6 R1–R3 EXIT0 + Ban 借绿、§7 证据层/宿主/串行/Ban emitter）。本稿**新解除**：

| # | `7e97dc3` 未解除点 | 本稿修订（锚） |
|---|------|------|
| **B1 ①** | L3（他线 emit `:559`）无判定程序，§4/§5 不产出 L3 入/出证据 | §2.1 **L3 判定程序**：J-1 回溯（已按 committed + box 证据执行读档，结论写出）· J-2 前向（§4 每 attempt 强制产出 `docker events` + emitter 进程采样，判定表）· J-3 L3 确定性模拟（§5 Inject C，仅本 run 容器） |
| **B1 ②** | attempt1 时序（run1/2 pass · run3 前崩 · 无 SUMMARY）未用；本 run PG teardown/重连层未分析 | §2.2 **attempt1 时序分析**：读码证明本 run harness teardown（runner `:2253` / capped child `:203`）在顺序上**不能**先于崩溃；新增 **L2-self**（本 run PG 容器自亡 + `--rm` 自删）假设与判据；`state_bytes=29 logs_bytes=29` 签名解读；注入触发点对齐该窗口 |
| **B3** | 修复后 EXIT「可为 1」未钉；attempts 通过规则；inject 步骤自身 EXIT | §4 **EXIT 矩阵**：PC 3/3 EXIT 0；每 inject × {MUT, POST} 3/3 **EXIT=1** + 精确日志签名；每个 inject 命令自身 EXIT 0 + 输出判据；Ban retry · Ban 换 attempt |
| **B4** | (A)/(B) 二选一；触发点未钉；修复后未钉 | §5 **(A) 与 (B) 都做**，另加 (C) L3-sim；**各自**钉 inject CMD+期望 EXIT、触发点 T1、MUT / POST 期望 |
| **Cond 1** | `pool.on('error')` 写 `:932` | 改为 **`:931`**（§2 L1） |
| **Cond 2** | R2 数据库来源未说明 | §6 R2 **DB source** 钉死：一次性本 run 自有 `pgvector/pgvector:pg16` 容器 + 显式 `DATABASE_URL`；env 失败分类 `R2_ENV_FAIL` ≠ 回归 |

**Tip 行号重锚（disclosure）**：AN-PRIV-EXT CODE `9e2abd0` 在 `scripts/run-e2e-isolated.mjs` 新增 target 注册行（diff `+16/−2`）。本稿于 tip `eae1e19` **实测**重锚：容器名 `:1714 → :1726`；`docker run --rm -d` `:2170 → :2182`；finally `:2239-2241 → :2251-2253`（finally `:2251` · 失败诊断 `:2252` · 自有 `rm -f` `:2253`）。实测偏移 = **+12**（与 privacy POST NB 更正一致：+12 非 +14）。`principal.ts` / `uc018-receipt-backfill-emit.mjs` / `uc018-perf-load-capped-child.mjs` 在 `a1f3614..eae1e19` 无改动，行号不变。**Ban invent product loci**：本稿未新增任何产品 locus。

## 0. 为何新开文件（distinct from AE residual）

Line S 已封存读码判定（P 池监听结构性覆盖 attempt1 路径）+ Branch A 复跑 0/0/0 · **仍 CONDITION OPEN**。Line AE 已封存容器可达 R-A 证据（Linux-native）· Desktop ECONNREFUSED class 未关 · **仍 CONDITION OPEN**。本刀：产品面根因判定 + 具名 prove；若根因落在 harness/infra（尤其 emitter `:559` 全局 `docker rm -f` 或本 run PG 容器自亡），诚实 **P-HOLD / 另开 harness 刀** · **不关 CONDITION**。**Ban** 把 AE residual 绿洗成本刀产品关闭 · **Ban wash attempt1 @ `b29c191`**。

## 1. Quoted from the files（只读 · 零改写）

- backlog `:35` **C-PERF-TEARDOWN**：「disclosed, not washed, not closed · attempt1 EXIT 1 (pg Client terminated mid-prove) · attempt2 EXIT 0 · PERF/LOAD stays local partial」。
- `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:371-380`：L17–20 run1+run2 `passed=true`；L22–37 `Unhandled 'error' event` · `Connection terminated unexpectedly` @ `pg/lib/client.js`（emitted on Client）；L42–43 `RAW_EXIT=1`；**No** `SUMMARY allPass` / no run3。
- attempt1 @ `b29c191`：**EXIT=1** · **Ban wash**。

## 2. B1+B2 · cleanup loci · 分层 · 书面初判（B2 已解除 · 钉值保留 · 行号 @ tip `eae1e19`）

| # | Locus（file:line @ `eae1e19`） | Layer | 行为（只读） | 可证伪判据 | 书面初判 |
|---|--------------------------|-------|--------------|------------|----------|
| **L1** | `packages/db/src/principal.ts:928-929`（`pool.on('connect')` → `client.on('error', …observePoolError)`）· **`:931`** `pool.on('error', …)` · `:886` `observePoolError` · `:872`「Fail-closed observability, not recovery」+ `:920-927` 注释· 引入 commit `f19ecba`（2026-10-05 · GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER）| **PRODUCT** | 池级 / per-client `db_pool_error` 观测 | MUT 删 `:929` + 对 checked-out client 注入 → `Unhandled 'error' event` + EXIT=1；保留 → `db_pool_error` ≥1 · 零 unhandled | **P-FIX 唯一合法产品文件**。注：attempt1 @ `b29c191` 时 **`:928-931` 尚不存在**（`git show b29c191:packages/db/src/principal.ts` 无 `on('connect')` / `on('error')`）→ attempt1 的 *崩溃形态* 已由 `f19ecba` 结构性覆盖；*连接断开本身*的来源见 L2-self / L3 |
| **L2** | `scripts/run-e2e-isolated.mjs:1726`（`meetwise-e2e-${pid}-${ts}`）· `:2182` `docker run --rm -d` · `:2251` finally · `:2252` `emitFailureDiagnostic()`（仅 `failed`）· `:2253` 自有 `docker rm -f container` | **HARNESS** | 隔离壳自有容器生命周期 | runner 自有 `rm -f` 仅在 finally、子进程退出**之后**（§2.2） | **非 P-FIX** · harness 自管 |
| **L2-self**（新增 · B1②） | 同 L2 `:2182` `--rm` + caps `--cpus 2 --memory 4g`（`:2175-2176`） | **HARNESS / INFRA-host** | 本 run PG 容器若自亡（OOM / postmaster 退出 / 宿主回收），`--rm` 立即自删 | J-2 事件：本 run PG 出现 `oom` 或 `die`（无前置外部 `kill`）且时间早于 prove 崩溃行 | **非 P-FIX** · 若 IN → 另开 harness/host 刀 · CONDITION OPEN |
| **L3** | `scripts/uc018-receipt-backfill-emit.mjs:505` try · `:555-560` finally（`:559` 对**所有** `meetwise-e2e*` / `meetwise-uc018*` `docker rm -f`）；`:206`/`:226`/`:248` `process.exit()` 跳过 finally；`reemit-from-log` 模式 `:252-304` 在 `:304` `process.exit(0)`，**不进入** `:505` try → `:559` 不可达 | **INFRA** | 发射器全局误杀他线容器 | J-1/J-2 判定表（§2.1） | **≠ product close** · 若 IN → 另开 emitter harness 刀 · CONDITION OPEN · **Ban** 以「产品修复」关 `:35` |
| **L4** | `scripts/uc018-perf-load-capped-child.mjs:18`（`meetwise-uc018-perf-api-${pid}-${ts}`；落在 `:559` 过滤范围）· `:107` `--rm` / `:136-137` create · `:202` `docker start -a` · `:203` 自有 `rm -f` | **HARNESS** | capped API 容器（proof + API 同进程，`--network host`） | 自有 `rm -f` `:203` 仅在 `start -a` 返回**之后** | **非 P-FIX** · harness |

**P-FIX 范围硬钉（B2 · 保留）**：只准改 `packages/db/src/principal.ts`；**禁止**以 P-FIX 名义改 `run-e2e-isolated.mjs` / `uc018-receipt-backfill-emit.mjs` / `uc018-perf-load-capped-child.mjs`；**emitter `:559` ≠ 产品关闭条件**。

### 2.1 B1① · L3 判定程序（§4/§5 实际产出证据 · 非 handwave）

**J-1 · 回溯（attempt1 · 本稿已执行读档 · docs-only · 无 docker 操作）**

| 证据 | 来源 | 读值 |
|------|------|------|
| attempt1 窗口 | box `/workspace/mw-rv-bf-results/PERF-LOAD.env` | STARTED `2026-09-23T21:57:14-07:00` → ENDED `21:57:35-07:00` = **2026-09-24 12:57:14–12:57:35 +08:00**（`04:57:14–04:57:35Z`）· PROVE_EXIT=1 |
| 本 run PG 容器 | box `PERF-LOAD-prove.log:10` | `meetwise-e2e-1921513-1790225837128`（ts → `04:57:17.128Z` = 12:57:17 +08:00） |
| 本 run 失败诊断 | `PERF-LOAD-prove.log:40` | `ISOLATED_POSTGRES_OUTPUT_WITHHELD … state_bytes=29 logs_bytes=29` |
| 签名解读 | `run-e2e-isolated.mjs` `dockerDiagnostic` `.catch(() => 'docker_diagnostic_unavailable')`（@`b29c191` `:1789` · @tip `:2021`）+ `withheld-output.mjs:8` 字节数 | `Buffer.byteLength('docker_diagnostic_unavailable') = 29` → **诊断时 `docker inspect` 与 `docker logs` 均失败** = 本 run PG 容器在 finally 诊断前**已不存在**（或 docker 不可达）。`--rm`（@b29c191 `:1936`）下「被外部 rm」与「自亡后自删」**同签名** → 此签名**不区分** L3 / L2-self |
| 已记录 emit 运行 | `receipts/uc018-receipt-backfill/attempts.jsonl` | prove 模式最后一条 `PERF-LOAD ranAt 2026-09-24T04:38:14.481Z`（:559 约在其后数秒）；`04:50:35Z` 批次为 `phase=reemit-from-log`（`:304` 前退出 · `:559` 不可达）；下一批 `2026-10-03`。**窗口 04:57:14–04:57:35Z 内无任何 emit 记录** |
| reviewer 串行序列 | box `*.env` | FULL-E2E ENDED `21:57:01-07:00` < attempt1 START `21:57:14` ；TIP（`uc018:receipt-backfill:prove`，非 emit、无 docker rm）START `21:57:47` > attempt1 END → **同序列无重叠** |
| prove 前容器 | `PERF-LOAD-cids-before.txt` | **0 bytes**（前序 key 文件含 2 cid；本 key 为空） |

**J-1 结论（书面）**：L3 via **已记录** emit = **OUT**（时间窗 19 min 隔离 + reemit 不可达 `:559`）。L3 via **未记录**并发（共享 box 上他 agent 在他 worktree 跑 emit，其 `attempts.jsonl` 不在本 repo）= **UNDETERMINABLE**（attempt1 未采集 `docker events` / 进程表）。L2-self = **UNDETERMINABLE**（同签名、无事件）。→ 回溯**不能**单独判 L3，故 J-2 强制前向采集。

**J-2 · 前向（§4 每个 attempt 必产 · 授权后执行）**

每个 attempt（PC / Inject / MUT / R1）在 CMD 前后强制采集，落盘 `.tmp/an-perf-tear/<attemptId>/`：
1. `docker events --filter type=container --format '{{json .}}' > events.jsonl &`（CMD 前启动，CMD 结束 +5 s 后停）。
2. `while :; do date +%s.%N; pgrep -af 'uc018-receipt-backfill-emit|run-e2e-isolated' ; sleep 1; done > procs.txt &`（同起止）。
3. CMD 前 / 后 `docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018 --format '{{.Names}}'`（前须 0 行 · §7）。
4. prove 日志 tee 为 `prove.log`（含 `+08:00` 起止时间戳与 code SHA）。

**L3 判定表（对本 run PG 容器 = `prove.log` 中 `E2E isolated PostgreSQL:` 行所列名）**

| 判定 | 必要条件（全部满足） |
|------|------|
| **L3 IN** | `events.jsonl` 本 run PG 出现 `kill`(signal=9)→`die`(exitCode=137)→`destroy`，时间 **早于** `prove.log` 首个 `Connection terminated`/`db_pool_error`/`Unhandled` 行 · 且 `procs.txt` 同秒或前 1 s 内存在**非本 run** PID 的 `uc018-receipt-backfill-emit` 进程 · 且非 §5 Inject C 本身 |
| **L2-self IN** | 本 run PG 出现 `oom` 或 `die`（exitCode≠137 或无前置 `kill`），早于首个错误行 · 且无他 PID emit 进程 |
| **L1 / client-side** | 本 run PG 在首个错误行之后仍 `running`（无 die/destroy 早于 runner `:2253`）· 诊断 `state_bytes≠29` |
| **OUT（无断开）** | 无错误行（PC 绿） |
| **UNDETERMINABLE** | 采集文件缺失或时间戳不可比 → attempt 记 `J2_EVIDENCE_MISSING` · **不**计入任何格的通过 |

**J-3 · L3 确定性模拟**：§5 **Inject C**（只 `docker rm -f` 本 run PG）· 期望签名与 attempt1 `PERF-LOAD-prove.log:21-43` 对比（`Connection terminated unexpectedly` + `state_bytes=29 logs_bytes=29`）。J-3 只证明「L3 **能**产生同签名」，**不**证明 attempt1 由 L3 引起。

### 2.2 B1② · attempt1 时序分析（本 run PG teardown / 重连层）

- **崩溃窗口**：`PERF-LOAD-prove.log:20` `LOAD run2 … passed=true` 之后、`PERF run3` 行之前；无 `SUMMARY`。proof `apps/api/test/uc-e2e-018-perf-load.proof.ts:441-444` 循环为 `await runPerf(r); await runLoad(r)`，run 间**无** pool `end()`、无重连、无容器操作 → 崩溃发生于 **run3 PERF 期间**（seed via `h.pool` + warmup/measured HTTP abandon，API 与 proof 同进程同池，`_neg-harness.ts:43-58` `createApp()`→`DbService.pool`）。
- **本 run harness teardown 能否先于崩溃？读码结论：不能。** runner `:2251-2253` 在 `finally`，须等 `await run(...)` 子进程退出；capped child `:203` `rm -f` 在 `:202` `start -a` 同步返回之后；二者均**顺序晚于** proof 进程退出。→ 「本 run 自有 teardown 杀了自己的 PG」在代码顺序上被排除。
- **本 run PG 自亡（L2-self）不能被排除**：`state_bytes=29` 表明诊断时容器已消失；在 `--rm` 下 PG 自亡也会自删。21 s 内 `idleTimeoutMillis=30000`（`principal.ts:918`）不会触发；`statement_timeout` / `idle_in_transaction_session_timeout`=15000（`:915-916`）为服务端带 ErrorResponse 的终止，**可**导致客户端错误，须由 J-2 区分（`die` 事件有无）。
- **重连层**：pg-pool 对断开 client 不自动重连（`:872` observability, not recovery · `:920-927`）；断开后下一次 `pool.query` 新建连接 → 若容器已不存在则 `ECONNREFUSED`（`waitForPostgres` 不在 prove 内）。故 POST 期望不含「自动恢复成 EXIT 0」。
- **对注入的约束**：§5 触发点 **T1** = attempt1 同窗口（`LOAD run2:` 行出现后、`PERF run3:` 之前）。

**初判摘要（书面 · 非推给 PRE）**：attempt1 的**崩溃形态**（unhandled on Client）在 tip 已由 L1 `f19ecba` 覆盖 → 默认 **P-HOLD（产品码已覆盖）**；**断开来源**在 L3 / L2-self 之间、J-1 无法判定 → 由 J-2 + §5 判；若 §5 POST（tip 原样）任一 inject 仍出现 `Unhandled 'error' event` → **P-FIX 仅限 L1**；若 J-2 判 L3 IN 或 L2-self IN → **另开 harness 刀** · CONDITION **may stay OPEN** 直至 honest path proved + dual + 协调方授权。

## 3. 本刀目标

| Outcome | 判据（授权后） | 仍须保留 |
|---------|----------------|----------|
| **P-FIX · 产品修复** | §5 POST（tip 原样）出现 unhandled → 最小改 `principal.ts` → §4 矩阵全格达标 | CONDITION **may stay OPEN** · attempt1 retained · Ban UC-018 covered flip |
| **P-HOLD · 无需产品码改** | §4 矩阵 POST 格全达标（tip 原样）· 断开来源按 §2.1 判定 → harness 另开刀（若 L3 / L2-self IN） | 同上 · HOLD ≠ 关闭 |

**明确非目标（Ban）**：Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved + dual + 协调方授权 · Ban wash AE residual / Line S 绿 · Ban 以 emitter `:559` 修复冒充产品 close · Ban HA/capacity/suite-green · Ban buy cloud · Ban Meridian · Ban secrets · Ban Redis cutover · Ban MODEL-OP closed claim。

## 4. B3 · LOOP §3③ · CMD / attempts / EXIT 矩阵（全钉 · 无「或」）

**Primary CMD（唯一 · 保留）**：

```text
./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove
```

Script 链：`pnpm uc018:perf-load:prove` → `run-e2e-isolated.mjs uc018:perf-load:prove:raw` → `uc018-perf-load-capped-child.mjs` → `apps/api/test/uc-e2e-018-perf-load.proof.ts`。时间戳 Asia/Shanghai（+08:00）+ code SHA per attempt。

**代码状态**：
- **POST** = tip（P-HOLD）或 tip + P-FIX commit（P-FIX）；`git diff` 必须为空。
- **MUT** = POST 上**临时**删除 `principal.ts:929`（`client.on('error', …)`）· 仅 prove worktree 本地、**Ban commit** · 每格结束 `git checkout -- packages/db/src/principal.ts` 且 `git diff --exit-code` EXIT 0。tip 已含 L1 修复 → **pre-fix ≡ MUT**（b29c191 等价于更弱的「零监听」；本刀不另跑 b29c191）。

**EXIT 矩阵（每格 attempts=3 · 通过 = 3/3 命中期望 · Ban retry-to-green · Ban 丢/换 attempt · 偏离即该格 FAIL 并诚实记录）**

| 格 | 代码 | Inject | prove 期望 EXIT（每次） | 必要日志签名（每次） |
|----|------|--------|-------------------------|----------------------|
| **PC** | POST | 无 | **0**（3/3） | `SUMMARY allPass=true` · `CMD=pnpm uc018:perf-load:prove EXIT=0` · 零 `Unhandled 'error' event` · 零 `"event":"db_pool_error"` · J-2 判「OUT」 |
| **A-MUT** | MUT | A @T1 | **1**（3/3） | `Unhandled 'error' event` · `Emitted 'error' event on Client instance` · 无 `SUMMARY` · `RAW_EXIT=1` |
| **A-POST** | POST | A @T1 | **1**（3/3） | `"event":"db_pool_error"` ≥1 · **零** `Unhandled 'error' event` · 失败形态 ∈ {F1: `SUMMARY allPass=false` + run3 `miss=errRate…`；F2: 无 SUMMARY、顶层 rejection 栈（非 'error' event）}，记录形态 |
| **B-MUT** | MUT | B @T1 | **1**（3/3） | 同 A-MUT |
| **B-POST** | POST | B @T1 | **1**（3/3） | 同 A-POST · 另记 `docker port` 重启前/后（port changed true/false） |
| **C-MUT**（J-3） | MUT | C @T1 | **1**（3/3） | 同 A-MUT · 另需 `state_bytes=29 logs_bytes=29` |
| **C-POST**（J-3） | POST | C @T1 | **1**（3/3） | 同 A-POST · 另需 `state_bytes=29 logs_bytes=29` · J-2 判「L3-sim」（本 run 自发 kill/die/destroy） |

POST 期望 EXIT=1（而非 0）的依据：proof 无重试；PERF `errMax=0.005`（`proof.ts:33`，N=100 → 1 次错误即 `0.01 > 0.005`）；seed 查询被断则顶层 await reject → Node EXIT 1。**Ban** 伪装 0；若 POST 观测到 EXIT 0，记 `POST_EXIT_UNEXPECTED`，该格 FAIL（不视为绿）。

## 5. B4 · 三种注入（**各自**钉 CMD / 自身 EXIT / 触发点 / 期望 · 只作用于本 run 自有资源）

**触发点 T1（三者共用 · 对齐 attempt1）**：`prove.log` 首次出现正则 `^LOAD run2: ` 后立即（≤1 s）进入注入程序；若 `PERF run3: ` 已出现仍未完成注入 → attempt 记 `INJECT_LATE`（该格 FAIL · 计入 3 次）。本 run PG 名 `<PG>` 取自 `prove.log` `^E2E isolated PostgreSQL: (\S+) on`。

**门控（A/B/C 共用 · 保证命中 checked-out client，与 attempt1「on Client instance」一致）**：注入前轮询（每 50 ms · 上限 10 s）
`docker exec <PG> psql -U meetwise -d meetwise -tAc "SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid() AND state<>'idle'"` → 期望 EXIT 0 且值 ≥1；10 s 内未达 → `INJECT_GATE_TIMEOUT`（该格 FAIL）。（容器内本地 socket · 不读 `.env*` · 不打印凭据）

| | **(A) `pg_terminate_backend`** | **(B) `docker restart`** | **(C) L3-sim `docker rm -f`** |
|---|---|---|---|
| Inject CMD | `docker exec <PG> psql -U meetwise -d meetwise -tAc "SELECT count(pg_terminate_backend(pid)) FROM pg_stat_activity WHERE datname=current_database() AND backend_type='client backend' AND pid<>pg_backend_pid() AND state<>'idle'"` | `docker restart -t 0 <PG>` | `docker rm -f <PG>` |
| Inject 自身期望 EXIT | **0** 且 stdout 整数 **≥1** | **0** 且 stdout == `<PG>` | **0** 且 stdout == `<PG>` |
| J-2 事件期望 | 本 run PG **无** die/destroy（容器存活） | `kill`→`die`→`start`（无 destroy · `--rm` 不因 restart 删除）；若出现 destroy 记录 | `kill`(9)→`die`(137)→`destroy` |
| MUT 期望 | §4 A-MUT | §4 B-MUT | §4 C-MUT |
| POST 期望 | §4 A-POST | §4 B-POST | §4 C-POST |
| 所证 | checked-out client 服务端终止：L1 覆盖 | 本 run PG 进程级断开 + 重连层 | 外部删除（L3 签名）对照 attempt1 |

**Ban**：全局 `docker rm -f` · 经 emitter `:559` · 触碰非本 run 容器/backend · 以 inject 红当绿。

## 6. B5 · 具名回归 + EXIT（B5 已解除 · 保留 · Cond 2 补 R2 DB source）

| # | CMD | 期望 EXIT | DB source | 说明 |
|---|-----|-----------|-----------|------|
| R1 | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove` | **0** | runner 隔离 PG `:1726`/`:2182` | 与 PC 同 CMD · 独立 attempt · Ban 借绿关本刀 CONDITION |
| R2 | `DATABASE_URL=<R2 一次性容器 URL> pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts` | **0** · 输出含 `CMD=pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts EXIT=0` · 12/12 PASS | **一次性本 run 自有容器**：`docker run --rm -d --name meetwise-e2e-r2pool-$$-$(date +%s%3N) -e POSTGRES_USER=meetwise -e POSTGRES_DB=meetwise -e POSTGRES_PASSWORD=<本次随机生成 · 不落盘> -p 127.0.0.1::5432 pgvector/pgvector:pg16` → `pg_isready` 3 次连续成功 → `DATABASE_URL` 由 `docker port` 组装（同 `receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md:21` 口径）→ 结束 `docker rm -f` **仅该名** | proof 自带目标来源 = `DATABASE_URL`/PG 组件、无 localhost 回退（`pool-error-listener.proof.ts:20`）。**Ban** 指向 dev / 共享 / 他线 PG。首个 `PASS` 前连接失败 → 记 **`R2_ENV_FAIL`**（≠ 回归 · ≠ 绿 · 计入 attempt · 诚实记录）|
| R3 | `pnpm uc018:receipt-backfill:prove` | **0** | 无 DB（静态 receipt 校验 `scripts/uc-e2e-018-receipt-backfill.proof.mjs`） | Ban 借绿 · Ban covered flip |

**Ban** 将 R1–R3 绿记作本刀产品关闭证据 · **Ban UC-018 covered flip**。

## 7. B6 · 证据层 · 宿主 · 串行（B6 已解除 · 保留）

| 项 | 钉死 |
|----|------|
| **证据层** | `run-e2e-isolated.mjs` **隔离真 PG**（`pgvector/pgvector:pg16` · `:1726` 容器）· Ban fake DB |
| **宿主类** | **Linux-native-Docker-Engine**（Line AE R-A）· Desktop / macOS Docker Desktop **不在本刀范围** |
| **串行** | 每次 prove **前** `docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018` 必须为 **0** 行；有他线 prove 时 **不得** 跑本刀 |
| **Ban emitter** | **禁止**经 `uc018:receipt-backfill:emit`（`:555-560` / `:559`）跑本刀 prove / inject |
| **Inject 范围** | 只准本 run 自有容器 / backend（§5） |

## 8. 行语义（冻结）

- backlog `:35` **C-PERF-TEARDOWN stays CONDITION OPEN** · canHonestlyFlip=false · PERF/LOAD local partial · capacityRepresentative=false · coveredCount=8
- UC-018 / §1.1 stay **partial** · Ban covered flip
- Line S / Line AE nails **原样保留**（只读 cite）
- 本 REQUEST 零触碰 backlog `:35` / checklist / 矩阵 / UC-018 行

## 9. Ban 列表

- Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）
- **Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · **Ban close CONDITION** without honest fix proved
- Ban wash AE residual / Line S as product close · Ban invent green · Ban HA/capacity claim · Ban invent product loci
- Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push
- Ban re-open AG/AI/AK · HOLD AN-CIMG-EA · Ban 碰 AN-PRIV-EXT / AN-MOP product · Ban product/infra code this turn · Ban commit MUT
- Ban Redis cutover · Ban MODEL-OP closed claim · Ban 经 emitter `:559` 跑本刀 · Ban MySQL/Qdrant/FULLTEXT

## 10. Non-claims

Not a pass · not run · not closed · not fixed · not root-caused（J-1 仅回溯读档，L3/L2-self UNDETERMINABLE）· not HA · not SLO/LOAD · not capacity · not covered · not `releaseEvidence=true` · not nail · CONDITION OPEN · alone ≠ dual · ≠ AE residual redo · emitter `:559` ≠ product close

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false · backlog `:35` CONDITION OPEN · STOP

*Harness · C-PERF-TEARDOWN product rootcause fix · AN-PERF-TEAR re-PRE ×2 · supersedes 553cfc5 (→110532e) · FAIL 7e97dc3 + 152b665 · B2/B5/B6 retained · B1/B3/B4/Cond closed in draft · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · CONDITION OPEN · alone ≠ dual · STOP*
