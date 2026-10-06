# Harness — **C-PERF-TEARDOWN · product rootcause fix**（Line AN-PERF-TEAR · docs REQUEST rewrite **×4 re-PRE** · **`draft:awaiting_pre_exec_dual`** · CONDITION may stay OPEN · Ban wash attempt1）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST rewrite **×4 re-PRE** · supersedes REQUEST `083cce4`（→`1b74fb1`→`553cfc5`→`110532e`）· cites mw-e2e-ha Re-PRE3 FAIL **`70cba94`**（新阻塞 1 · B/C-MUT Unhandled-on-Client 3/3 在 seed 不可推出：`proof.ts:232` pool.query 窗口被 pg-pool `once('error')` 接住 + MUT 保留 `:931`）· prior FAIL `20da721`/`7e97dc3`/`152b665` retained · peer mw-rag-route Re-PRE3 PASS `dbed2f2` **cited not co-signed**（其 4 条 NB 条件 = 本稿 C1–C4） · alone ≠ dual · Ban coding · Ban prove · Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban self-approve · Ban self-nail · HOLD AN-CIMG-EA）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false**
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` @ **`ac03f30`**（ff past FAIL `70cba94` · peer PASS `dbed2f2` · RAG R3 CODE `264e1d7`/`ac03f30`（他线 · 只读 · 未触碰）· prior PERF rewrite ×3 `083cce4` · AN siblings cited only · Ban touch AN-RAG-R3 / AN-PRIV-EXT / AN-MOP-Q45 · Ban re-open AG/AI/AK · HOLD AN-CIMG-EA）
**Prior REQUESTs**: `083cce467657c1499f748f0073eeaee7bdd9392d`（re-PRE ×3 · **superseded by this rewrite ×4**）· `1b74fb1cfa9226e8904e0dc51af02f1882851c79`（re-PRE ×2 · superseded）· `553cfc5e4ca511b0327b647fcc2b49925828752c`（superseded）· `110532e81f11064e543bc9bc420b67bb2f95ae1e`（superseded）
**FAIL receipts**（retained · 不擦除）: `70cba947798c7fb33f7fa4a8a1ec8609ef6bc610`（Re-PRE3 FAIL @083cce4 · mw-e2e-ha · `reviews/REQUEST-2026-10-06-an-perf-tear-rewrite3-re-pre-mw-e2e-ha.md`）· `20da721c478f53cc7c13630f1533c4873a421501`（Re-PRE2 FAIL @1b74fb1 · mw-e2e-ha）· `7e97dc3e500c9471fe50dbdbd3aaee8d6c89e7e9`（Re-PRE FAIL @553cfc5）· `152b665787e02ac6ef350551e599b3823a9fa763`（PRE-EXEC FAIL @110532e）
**Peer cites（不代签）**: mw-rag-route Re-PRE3 PASS `dbed2f2098ee39f5bd83b7b2cfb0bb697bb4631f` @083cce4 · Re-PRE2 PASS `882efbc6037d849c55b9a35dcafe9d9be1836b14` @1b74fb1 · alone ≠ dual（一方 PASS + 一方 FAIL ≠ dual PASS）
**Wave**: Line **AN** REQUEST wave（this = **AN-PERF-TEAR** re-PRE ×4）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING re-PRE · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · Ban buy cloud · status `draft:awaiting_pre_exec_dual`
**Knife**: **C-PERF-TEARDOWN product rootcause fix（AN-PERF-TEAR）**——mid-prove pg Client teardown / unhandled crash 的产品根因判定 + 修复 REQUEST（≠ Line S Branch A 复跑证据刀 · ≠ Line AE CONDITION residual 容器可达证据刀 · ≠ AN-RAG-R3）
**Gap id**: **`C-PERF-TEARDOWN`**（backlog `gap-bug-backlog.md:35` · P1 · **CONDITION OPEN** · 本刀不改名、不翻行）
**Parent context（只读 · cite · distinct knife）**:
- Line S `harness/gap-perf-teardown-rootcause-fix.md` — Branch A re-run / close-evidence · NAIL `post_prove_dual_pass` · CONDITION OPEN retained
- Line AE `harness/c-perf-teardown-condition-residual.md` — container-reachability residual · NAIL `post_prove_dual_pass` · CONDITION OPEN retained · R-A Linux-native-Docker-Engine only
- **本刀 = 新产品根因修复轨** · 旧 harness 只读引用 · Ban wash Line S / AE greens as product close · **Ban touch RAG files**

## Rewrite ×4 note（supersedes `083cce4` · FAIL `70cba94` · 选 **(ii)** 写死）

`70cba94`（mw-e2e-ha）确认 **已解除且核实**、本稿**不回退**：Inject A `state='idle in transaction'` + 57P01 · A ≠ attempt1 · T1 = run3 PERF seed · `INJECT_PHASE_WARMUP` FAIL 格 · C OK keep · NB-1..4 · B1(a)(b) · `:931` · R2 · +12（本 tip 再 +18 重锚，见下）· B2/B5/B6 · backlog `:35` CONDITION OPEN。peer `dbed2f2` PASS **仅引用、不代签**；一方 PASS + 一方 FAIL ≠ dual。

| # | `70cba94` 阻塞 / peer 条件 | 本稿修订（锚） |
|---|------|------|
| **新阻塞 1 · B-MUT/C-MUT** | seed 交替 `proof.ts:232` `h.pool.query` 与 `:236` `asPrincipal`；断开落 pool.query 窗口 → pg-pool `index.js:464` `client.once('error')` 接住该 client；idle clients 经 `index.js:51-62` idleListener → `pool.emit('error')` → MUT 仍保留的 `principal.ts:931` 接住 → 无 Unhandled · MUT≡POST 无判别力 | **选 (ii)**（唯一 · 不并用 (i)）：§4 **MUT 拆两种、写死**——A 用 **MUT-929**（只删 `:929` · 原样）；**B/C 用 MUT-ZERO**（同时删 `:929` **与** `:931` · 零 error 观测者 ≡ attempt1 @`b29c191` 结构）· B/C-MUT 签名 = `Unhandled 'error' event` + `Emitted 'error' event on **Client** instance` **或** `… on **BoundPool** instance`（`pg/lib/index.js:14` `class BoundPool extends Pool`）+ `db_pool_error`=0。§5.2b 逐 seed 子步推导；**残余竞态**（pool.query 自身 client 事件先于任何 idle client 被分发 → TLA reject 同一 microtask 检查点退出）**事前**钉为 `INJECT_KIND_POOLQUERY_RACE`（格 FAIL · 计入 3 次 · Ban retry · Ban 事后改期望）；前置 `idle_n≥1` 同快照记录（C1） |
| **C1 / NB-a** | 阶段判定无观测源；A 命令只返回 count | §5.0 / §5.1：**一条 SQL** 同一时刻返回 `pid/state/xact_start/left(query,60)` + `pg_terminate_backend(pid)` + `interview` 中 `id LIKE 'IV\_P018\_R3\_%'` 行数 / 非 active 行数 + `idle_n`；阶段规则写死（§4 阶段期望表） |
| **C2 / NB-b** | A ≠ attempt1 表述过绝对；A-POST 可另有 CTU | A-MUT / A-POST 只要求 **57P01 出现**；**永不**要求 `Connection terminated unexpectedly` 缺席；FATAL 落 active query → `A_FATAL_ON_ACTIVE` 格 FAIL 计入 · Ban 换 attempt；§5.1「所证」收窄 |
| **C3 / NB-c** | 门控与终止是两次 `docker exec` | §5.1 A = **容器内单次 psql**（plpgsql `DO` 循环 · 每轮 `pg_stat_clear_snapshot()` · `pg_sleep(0.005)` · 10 s 上限）· 反应上限：`^LOAD run2: ` 检出 → psql 启动 ≤ **1 s**（收据录两时间戳）；B/C 门控同为单次容器内 psql 循环（不 kill · kill 由 docker CLI 紧随） |
| **C4 / NB-d** | 辅助命令无期望 EXIT | §5.4 **AUX EXIT 表**：R2 `docker run`/`docker port`/`pg_isready`/`docker rm -f`、NB-4 清理、J-2 `docker events`/`pgrep` 循环/`docker ps` 前后——期望 EXIT + 输出判据；偏离 → `AUX_EXIT_UNEXPECTED`（该 attempt 不计通过 · 格 FAIL 计入） |

**Tip 行号重锚（disclosure · @`ac03f30`）**：RAG R3 C-3 `264e1d7` 在 `scripts/run-e2e-isolated.mjs` 新增 `rag03-filter-locus:prove:raw` 注册（`+15` @`:1286-1300` · `+1` @`:1466` · `+2` @`:1712-1713` · 其后整体 **+18**）。本稿**实测**：容器名 `:1726 → :1744`；caps `--cpus 2 --memory 4g` `:2175-2176 → :2193-2194`；`docker run --rm -d` `:2182 → :2200`；finally `:2251-2253 → :2269-2271`（finally `:2269` · 诊断 `:2270` · 自有 `rm -f` `:2271`）；`dockerDiagnostic` `.catch` `:2021 → :2039`。`principal.ts` / `uc-e2e-018-perf-load.proof.ts` / `uc018-receipt-backfill-emit.mjs` / `uc018-perf-load-capped-child.mjs` / `pool-error-listener.proof.ts` / `gap-bug-backlog.md` 在 `70cba94..ac03f30` **零改动**（`git diff --quiet` EXIT 0）。+12 历史披露原样保留；**Ban invent product loci**。

## Rewrite ×3 note（supersedes `1b74fb1` · FAIL `20da721` · retained history）

`20da721`（mw-e2e-ha）确认 **已解除且核实** 且本稿**不回退**：B1(a) J-1/J-2/J-3 · B1(b) attempt1 时序/L2-self · Cond 1 `:931` · Cond 2 R2 DB source · runner +12 重锚 · B2/B5/B6。peer `882efbc` PASS **仅引用、不代签**。本稿**新解除** `20da721` 两阻塞（docs 契约 · Ban coding）：

| # | `20da721` 阻塞 | 本稿修订（锚） |
|---|------|------|
| **B3/B4 · Inject A** | 门控 `state<>'idle'` 同时匹配 `active` + `idle in transaction`；`pool.query` 路径错误进 query callback → **不** emit client `'error'` / 无 Unhandled；A-POST `db_pool_error=0` 打破 ≥1；`57P01` ≠ attempt1「Connection terminated unexpectedly」 | §5 **选 (i) 收窄**：A 门控与终止 SQL = **`state='idle in transaction'`**（`asPrincipal`/`pool.connect` 手持事务）；A-MUT/A-POST 签名按 **57P01** / `terminating connection due to administrator command` 重写；明文 **A ≠ attempt1 签名**（B/C socket 断开才可能复现 attempt1） |
| **B3/B4 · A/B-POST EXIT=1** | `runPerf` `:278` warmup 结果丢弃；T1 未钉 seed/warmup/measured → warmup 着陆可 EXIT0 → `POST_EXIT_UNEXPECTED`；C(`rm -f`) OK | §5 **T1 钉 seed 阶段**（run3 PERF `seedAbandonTargets`）：门控须见 seed 活动；§4 增 **阶段期望表**；warmup 着陆 = `INJECT_PHASE_WARMUP` 格 FAIL；**C 保持**（PG 永久消失 · 与阶段无关） |

**非阻塞一并钉入（carry · 非新阻塞）**：
1. B `docker restart -t0` 与官方镜像 `STOPSIGNAL SIGINT`（fast shutdown → 57P01 FATAL）竞态 — 收据必录；B-MUT 可能落入 A 同类分支。
2. A inject 自身 stdout 整数 **=0** → **`INJECT_MISS`**（该格 FAIL · 计入 3 次）· 0-conn 不再「未定义」。
3. J-2 表补 **EXTERNAL-OTHER**（kill/die/destroy 无他 PID emit）+ **L3-sim**（Inject C 本程序发起 · 早于首错误行）；R2 名 `meetwise-e2e-r2pool-*` 落在串行 `meetwise-e2e` 过滤内 → **下次 prove 前必须 `docker rm -f` 该名**。

**Cleared stay（do not regress）**：B1(a)(b) · `:931` · R2 · +12 anchors（`:1726`/`:2182`/`:2251-2253`）· B2/B5/B6。

## Rewrite ×2 note（supersedes `553cfc5` · FAIL `7e97dc3` · retained history）

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

## 2. B1+B2 · cleanup loci · 分层 · 书面初判（B2 已解除 · 钉值保留 · 行号 @ tip `ac03f30` · runner 相对 `083cce4` **+18**（RAG C-3 注册 · 见 rewrite ×4 note）· principal/proof/emitter/capped 无改）

| # | Locus（file:line @ `ac03f30`） | Layer | 行为（只读） | 可证伪判据 | 书面初判 |
|---|--------------------------|-------|--------------|------------|----------|
| **L1** | `packages/db/src/principal.ts:928-929`（`pool.on('connect')` → `client.on('error', …observePoolError)`）· **`:931`** `pool.on('error', …)` · `:886` `observePoolError` · `:872`「Fail-closed observability, not recovery」+ `:920-927` 注释· 引入 commit `f19ecba`（2026-10-05 · GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER）| **PRODUCT** | 池级 / per-client `db_pool_error` 观测 | MUT 删 `:929` + 对 **idle-in-transaction** checked-out client 注入（§5 A）→ `Unhandled 'error' event` + EXIT=1；保留 → `db_pool_error` ≥1 · 零 unhandled | **P-FIX 唯一合法产品文件**。注：attempt1 @ `b29c191` 时 **`:928-931` 尚不存在**（`git show b29c191:packages/db/src/principal.ts` 无 `on('connect')` / `on('error')`）→ attempt1 的 *崩溃形态* 已由 `f19ecba` 结构性覆盖；*连接断开本身*的来源见 L2-self / L3；**A 路径 = 57P01 ≠ attempt1 文本** |
| **L2** | `scripts/run-e2e-isolated.mjs:1744`（`meetwise-e2e-${pid}-${ts}`）· `:2200` `docker run --rm -d` · `:2269` finally · `:2270` `emitFailureDiagnostic()`（仅 `failed`）· `:2271` 自有 `docker rm -f container` | **HARNESS** | 隔离壳自有容器生命周期 | runner 自有 `rm -f` 仅在 finally、子进程退出**之后**（§2.2） | **非 P-FIX** · harness 自管 |
| **L2-self**（新增 · B1②） | 同 L2 `:2200` `--rm` + caps `--cpus 2 --memory 4g`（`:2193-2194`） | **HARNESS / INFRA-host** | 本 run PG 容器若自亡（OOM / postmaster 退出 / 宿主回收），`--rm` 立即自删 | J-2 事件：本 run PG 出现 `oom` 或 `die`（无前置外部 `kill`）且时间早于 prove 崩溃行 | **非 P-FIX** · 若 IN → 另开 harness/host 刀 · CONDITION OPEN |
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
| 签名解读 | `run-e2e-isolated.mjs` `dockerDiagnostic` `.catch(() => 'docker_diagnostic_unavailable')`（@`b29c191` `:1789` · @tip `ac03f30` `:2039`）+ `withheld-output.mjs:8` 字节数 | `Buffer.byteLength('docker_diagnostic_unavailable') = 29` → **诊断时 `docker inspect` 与 `docker logs` 均失败** = 本 run PG 容器在 finally 诊断前**已不存在**（或 docker 不可达）。`--rm`（@b29c191 `:1936`）下「被外部 rm」与「自亡后自删」**同签名** → 此签名**不区分** L3 / L2-self |
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
| **L1 / client-side** | 本 run PG 在首个错误行之后仍 `running`（无 die/destroy 早于 runner `:2271`）· 诊断 `state_bytes≠29` |
| **OUT（无断开）** | 无错误行（PC 绿） |
| **L3-sim**（Inject C） | 本 run PG 出现 `kill`(9)→`die`(137)→`destroy`，时间 **早于** 首个错误行 · 且发起者为**本程序** Inject C（非他 PID emit）· C-POST 格必判此行 |
| **EXTERNAL-OTHER** | 本 run PG 出现 `kill`→`die`→`destroy`，早于首错误行 · 但 `procs.txt` **无**他 PID `uc018-receipt-backfill-emit` · 且非本程序 Inject C → 计入 **UNDETERMINABLE** 并披露（≠ L3 IN · ≠ L3-sim） |
| **UNDETERMINABLE** | 采集文件缺失或时间戳不可比 → attempt 记 `J2_EVIDENCE_MISSING` · **不**计入任何格的通过 · **EXTERNAL-OTHER** 亦归此桶并披露 |

**J-3 · L3 确定性模拟**：§5 **Inject C**（只 `docker rm -f` 本 run PG）· 期望签名与 attempt1 `PERF-LOAD-prove.log:21-43` 对比（`Connection terminated unexpectedly` + `state_bytes=29 logs_bytes=29`）。J-3 只证明「L3 **能**产生同签名」，**不**证明 attempt1 由 L3 引起。J-2 判定表 **L3-sim** 行显式承接 C-POST。

### 2.2 B1② · attempt1 时序分析（本 run PG teardown / 重连层）

- **崩溃窗口**：`PERF-LOAD-prove.log:20` `LOAD run2 … passed=true` 之后、`PERF run3` 行之前；无 `SUMMARY`。proof `apps/api/test/uc-e2e-018-perf-load.proof.ts:441-444` 循环为 `await runPerf(r); await runLoad(r)`，run 间**无** pool `end()`、无重连、无容器操作 → 崩溃发生于 **run3 PERF 期间**（seed via `h.pool` + warmup/measured HTTP abandon，API 与 proof 同进程同池，`_neg-harness.ts:43-58` `createApp()`→`DbService.pool`）。
- **本 run harness teardown 能否先于崩溃？读码结论：不能。** runner `:2269-2271` 在 `finally`，须等 `await run(...)` 子进程退出；capped child `:203` `rm -f` 在 `:202` `start -a` 同步返回之后；二者均**顺序晚于** proof 进程退出。→ 「本 run 自有 teardown 杀了自己的 PG」在代码顺序上被排除。
- **本 run PG 自亡（L2-self）不能被排除**：`state_bytes=29` 表明诊断时容器已消失；在 `--rm` 下 PG 自亡也会自删。21 s 内 `idleTimeoutMillis=30000`（`principal.ts:918`）不会触发；`statement_timeout` / `idle_in_transaction_session_timeout`=15000（`:915-916`）为服务端带 ErrorResponse 的终止，**可**导致客户端错误，须由 J-2 区分（`die` 事件有无）。
- **重连层**：pg-pool 对断开 client 不自动重连（`:872` observability, not recovery · `:920-927`）；断开后下一次 `pool.query` 新建连接 → 若容器已不存在则 `ECONNREFUSED`（`waitForPostgres` 不在 prove 内）。故 POST 期望不含「自动恢复成 EXIT 0」。
- **对注入的约束**：§5 触发点 **T1** = attempt1 同窗口（`LOAD run2:` 行出现后、`PERF run3:` 之前）且 **钉 run3 PERF seed 阶段**（Ban warmup/measured 着陆当绿）。

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
- **MUT 两种 · 按 inject 写死（rewrite ×4 · 选 (ii) · Ban 事后换）**：
  - **MUT-929**（仅 **A-MUT**）= POST 上**临时**删除 `principal.ts:929`（`client.on('error', …)`）· 保留 `:931`。A 只终止 `idle in transaction`（checked-out）backend，idle pool clients 不受影响 → `:931` 是否保留与 A 无关；本格定义与 `083cce4` 相同（不回退已清项）。
  - **MUT-ZERO**（**B-MUT / C-MUT**）= POST 上**临时**同时删除 `principal.ts:929` **与** `:931`（`pool.on('error', …)`）→ 进程内零 error 观测者（`:928`/`:930` 空 `on('connect')` 壳可留，非 error 监听）≡ attempt1 @`b29c191` 零监听结构（`git show b29c191:packages/db/src/principal.ts` 无 `on('connect')`/`on('error')`）。
  - 两者均仅 prove worktree 本地、**Ban commit** · 每格前 `git diff --stat -- packages/db/src/principal.ts` 须恰为该 MUT（MUT-929：`1 deletion`；MUT-ZERO：`2 deletions`）· 每格结束 `git checkout -- packages/db/src/principal.ts` 且 `git diff --exit-code` EXIT 0。tip 已含 L1 修复 → **pre-fix ≡ MUT-ZERO**（本刀不另跑 b29c191）。

**EXIT 矩阵（每格 attempts=3 · 通过 = 3/3 命中期望 · Ban retry-to-green · Ban 丢/换 attempt · 偏离即该格 FAIL 并诚实记录）**

| 格 | 代码 | Inject | prove 期望 EXIT（每次） | 必要日志签名（每次） |
|----|------|--------|-------------------------|----------------------|
| **PC** | POST | 无 | **0**（3/3） | `SUMMARY allPass=true` · `CMD=pnpm uc018:perf-load:prove EXIT=0` · 零 `Unhandled 'error' event` · 零 `"event":"db_pool_error"` · J-2 判「OUT」 |
| **A-MUT** | **MUT-929** | A @T1(**seed**) | **1**（3/3） | `Unhandled 'error' event` · `Emitted 'error' event on Client instance` · 该 Unhandled 错误文本 **含 57P01 / `terminating connection due to administrator command`**（**存在性**判据 · FATAL 路径 `client.js:428`）· **永不**以 `Connection terminated unexpectedly` 的**有/无**作判据（C2）· 无 `SUMMARY` · `RAW_EXIT=1`。Unhandled 文本无 57P01（FATAL 落 active query → `:432-433` 回调 + `'end'` `:217`，C2 竞态）→ **`A_FATAL_ON_ACTIVE`** 格 FAIL · 计入 3 次 · Ban 换 attempt |
| **A-POST** | POST | A @T1(**seed**) | **1**（3/3） | 至少 1 行 `"event":"db_pool_error"` 其 `error_message` **含** `terminating connection due to administrator command`（**57P01 存在** · C2）· **零** `Unhandled 'error' event` · 允许另有 `error_message=Connection terminated unexpectedly` 的 `db_pool_error`（`'end'` 新 Error 对象 · `principal.ts:889-890` 按对象去重 → 第二条 · **不**构成 FAIL · **Ban** 要求其缺席）· 失败形态 ∈ {F1: `SUMMARY allPass=false` + run3 `miss=errRate…`；F2: 无 SUMMARY、顶层 rejection 栈（非 'error' event）}，记录形态。无 57P01 的 `db_pool_error` → `A_FATAL_ON_ACTIVE` 格 FAIL 计入 |
| **B-MUT** | **MUT-ZERO** | B @T1(**seed**) | **1**（3/3） | `Unhandled 'error' event` · `Emitted 'error' event on Client instance` **或** `Emitted 'error' event on BoundPool instance`（收据必录哪一个 · 两者均判命中 · §5.2b）· **零** `"event":"db_pool_error"`（MUT-ZERO 无观测者；出现即 `MUT_NOT_APPLIED` 格 FAIL）· 无 `SUMMARY` · `RAW_EXIT=1` · 文本可为 `Connection terminated unexpectedly` **或** 57P01（NB-1 竞态 · 收据必录）。EXIT 1 但无 Unhandled、栈为 seed 顶层 reject（含 `seedAbandonTargets`）→ **`INJECT_KIND_POOLQUERY_RACE`**：格 FAIL · 计入 3 次 · Ban retry（§5.2b 残余 · 事前钉死） |
| **B-POST** | POST | B @T1(**seed**) | **1**（3/3） | `"event":"db_pool_error"` ≥1 · **零** Unhandled · 另记 `docker port` 重启前/后（port changed true/false）· 失败形态同 A-POST F1/F2。`db_pool_error`=0（仅 NB-1 57P01 分支 + FATAL 落 pool.query active query 时可能 · §5.2b）→ **`INJECT_KIND_POOLQUERY_RACE`** 格 FAIL · 计入 3 次 |
| **C-MUT**（J-3） | **MUT-ZERO** | C @T1(**seed**) | **1**（3/3） | `Unhandled 'error' event` · `Emitted 'error' event on Client instance` **或** `… on BoundPool instance`（收据必录）· **零** `db_pool_error`（否则 `MUT_NOT_APPLIED`）· 无 `SUMMARY` · `RAW_EXIT=1` · 另需 `state_bytes=29 logs_bytes=29` · 文本记录（宜为 `Connection terminated unexpectedly` / socket 错误 · 不作判据）。无 Unhandled 的 seed 顶层 reject → **`INJECT_KIND_POOLQUERY_RACE`** 格 FAIL 计入 |
| **C-POST**（J-3） | POST | C @T1(**seed**) | **1**（3/3） | `"event":"db_pool_error"` ≥1 · 零 Unhandled · `state_bytes=29 logs_bytes=29` · J-2 判 **L3-sim**（C 无 FATAL · socket 路径 → 被断 client 的 `:929` 先于 pool.query `once` 同步观测 · §5.2b） |

### 阶段期望表（`runPerf` · `proof.ts:274/:278/:280-284` · 钉死 · Ban 事后按观测改）

| 注入着陆阶段 | 如何判定（收据必录） | A-POST / B-POST 期望 EXIT | C-POST 期望 EXIT | 备注 |
|---|---|---|---|---|
| **seed**（唯一合法 T1 着陆） | **C1 同快照**（§5.0/§5.1 单条 SQL）：`iv_rows` = `count(*) FROM interview WHERE id LIKE 'IV\_P018\_R3\_%'` ∈ **[1, 109]**（seed 第 i 轮 INSERT 已提交、asPrincipal 在其后 → seed 的 idle-in-tx 必有 `iv_rows≥1`；`=110` 起 seed 已无 INSERT）· `iv_nonactive`（`status<>'active'`）记录（seed 内恒 0）。`iv_rows=0` → 未进 seed，继续轮询不注入 | **1**（seed 顶层 `await` reject → Node EXIT 1） | **1** | §5 T1 只准此阶段 |
| **warmup** | 同快照 `iv_rows=110` 且 `iv_nonactive ∈ [1,9]`（`iv_rows=110 ∧ iv_nonactive=0` = seed 末轮/warmup 首轮不可分 → **`INJECT_PHASE_BOUNDARY`** · 不注入 · 格 FAIL 计入）· `timedAbandon` 窗口 · 错误被 `:278` 丢弃（catch 不抛 · 不计 `errorCount`） | **禁止着陆** · 若着陆且 EXIT 0 → `INJECT_PHASE_WARMUP` 格 FAIL；若碰巧 EXIT 1 仍记相位违规 FAIL | **1**（C：`rm -f` PG 永久消失 · **OK keep**） | A/B-POST「3/3 EXIT=1」**不可**建立在 warmup 上 |
| **measured** | 同快照 `iv_rows=110` 且 `iv_nonactive ≥ 10` · `:280-284` samples 计入 `errorCount`/`errorRate` | 本刀 **不**把 T1 钉此阶段；若误入记 `INJECT_PHASE_MEASURED` 格 FAIL（Ban 洗成绿） | **1** | measured 下 1 错 → `0.01>0.005` 可 EXIT1，但 T1 契约不依赖 |

**观测源钉死（C1）**：阶段只由上述同快照 SQL 判定（psql 以容器 superuser `meetwise` 连接 · 不受 RLS 影响 · 只读 `interview`）；A 的快照即终止语句本身；B/C 的快照是门控语句（§5.0 · 不 kill），断开晚于快照一个 docker CLI 往返 → B/C 门控额外要求 `iv_rows ≤ 100`（≥10 轮 seed 余量）并收录「快照→inject CMD 返回」耗时；B/C-POST 的落点复核 = F2 栈含 `seedAbandonTargets`（缺 → `INJECT_PHASE_DRIFT` 格 FAIL 计入）；B/C-MUT（MUT-ZERO）签名与阶段无关（§5.2b），只录快照阶段。

POST 期望 EXIT=1（seed 着陆）的依据：proof 无重试；**seed**（`:274` `seedAbandonTargets`）任一步失败 → 顶层 await reject → EXIT 1；PERF `errMax=0.005`（`proof.ts:33`）仅约束 measured · **warmup `:278` 不计错**。**Ban** 伪装 0；若 seed 着陆的 POST 观测到 EXIT 0，记 `POST_EXIT_UNEXPECTED`，该格 FAIL（不视为绿）。

## 5. B4 · 三种注入（**各自**钉 CMD / 自身 EXIT / 触发点 / 期望 · 只作用于本 run 自有资源）

**触发点 T1（三者共用 · 对齐 attempt1 窗口 + 钉 seed 阶段）**：
1. `prove.log` 首次出现正则 `^LOAD run2: ` 后进入注入程序（对齐 attempt1：崩溃在 LOAD run2 后 / run3 PERF 期间）。
2. **相位钉死 = run3 PERF seed**（`proof.ts:274` `seedAbandonTargets` · 在 `:278` warmup 之前）：注入前须通过下方 **seed 门控**；收据必录 `inject_phase=seed` + **同快照**（C1）的 `iv_rows` / `iv_nonactive` / `idle_n` + 被选 backend 的 `pid` / `state` / `xact_start` / `left(query,60)`。**反应上限（C3）**：`^LOAD run2: ` 检出时刻 → 容器内 psql 启动时刻 ≤ **1 s**（两时间戳 `+08:00` 毫秒必录；超出 → `INJECT_LATE` 格 FAIL 计入）。
3. 若 `PERF run3: ` 行已出现仍未完成注入 → `INJECT_LATE`（该格 FAIL · 计入 3 次）。
4. 若同快照判为 warmup / measured / boundary → `INJECT_PHASE_WARMUP` / `INJECT_PHASE_MEASURED` / `INJECT_PHASE_BOUNDARY`（**不注入** · 该格 FAIL · 计入 3 次 · **Ban** 洗成绿）。
5. 本 run PG 名 `<PG>` 取自 `prove.log` `^E2E isolated PostgreSQL: (\S+) on`。

### 5.0 门控（按注入分流 · **容器内单次 psql 循环**（C3）· 本地 socket · 不读 `.env*` · 不打印凭据）

每个 attempt 只起**一次** `docker exec -i <PG> psql -X -v ON_ERROR_STOP=1 -U meetwise -d meetwise -qtA`（stdin 喂 §5.1 的 `DO` 块），循环在**容器内**完成：每轮先 `PERFORM pg_stat_clear_snapshot()`（否则同一事务内 `pg_stat_activity` 被缓存）· 轮间 `pg_sleep(0.005)` · 自 psql 启动起上限 **10 s** → `INJECT_GATE_TIMEOUT`（该格 FAIL 计入）。所有结果以单行 `RAISE NOTICE` 输出，psql `2>&1` 落 `inject.log`。**Ban** 门控与终止分两次 `docker exec`。

| Inject | 门控条件（同一条 SQL · C1） | 为何 |
|---|---|---|
| **(A)** | `tgt` = client backend · `pid<>pg_backend_pid()` · **`state='idle in transaction'`**；同语句 `iv_rows ∈ [1,109]` 才执行终止（§5.1） | **A 收窄保留**（`20da721` 选项 (i) · 与本稿 B/C 选 (ii) 无关）：只命中 `pool.connect()` / `asPrincipal`（`principal.ts:945-955`）手持事务。**禁止**再用 `state<>'idle'` |
| **(B)(C)** | 同语句：`seed_act` = client backend 中 `state='idle in transaction' OR query LIKE 'INSERT INTO interview%' OR query LIKE 'SET LOCAL ROLE%' OR query LIKE '%set_config(''app.principal_user''%'` 计数 ≥1 · **且** `iv_rows ∈ [1,100]` · **且** `idle_n ≥ 1`（`state='idle'` client backend 数 · MUT-ZERO `BoundPool` 路径前置 · §5.2b）→ 输出 `GATE_BC phase=seed …` 后 psql 退出，宿主**紧接**执行 B/C CMD；`idle_n=0` → `INJECT_PRECOND_NO_IDLE`（不注入 · 格 FAIL 计入） | seed 门控 + 余量；B/C 的 kill 只能由 docker CLI 发起（容器内无法自删），快照→CMD 返回耗时必录 |

### 5.1 注入表

| | **(A) `pg_terminate_backend`** | **(B) `docker restart`** | **(C) L3-sim `docker rm -f`** |
|---|---|---|---|
| Inject CMD | §5.1a 单次容器内 psql `DO` 循环（门控 + 快照 + `pg_terminate_backend` **同一条 SQL**） | §5.0 B/C 门控 psql（EXIT 0 + `GATE_BC phase=seed`）→ 紧接 `docker restart -t 0 <PG>` | §5.0 B/C 门控 psql → 紧接 `docker rm -f <PG>` |
| Inject 自身期望 EXIT | psql **0** 且 `inject.log` 恰 1 行 `NOTICE:  INJECT_A phase=seed killed=<k> …` 且 **k≥1**；`k=0` → **`INJECT_MISS`**；其他标记行（`INJECT_GATE_TIMEOUT` / `INJECT_PHASE_*`）→ 对应 FAIL；均计入 3 次 | 门控 psql **0** + 恰 1 行 `GATE_BC phase=seed`；`docker restart` **0** 且 stdout == `<PG>` | 门控 psql **0** + 恰 1 行 `GATE_BC phase=seed`；`docker rm -f` **0** 且 stdout == `<PG>` |
| J-2 事件期望 | 本 run PG **无** die/destroy（容器存活） | `kill`→`die`→`start`（无 destroy · `--rm` 不因 restart 删除）；若出现 destroy 记录 | `kill`(9)→`die`(137)→`destroy` · J-2 判 **L3-sim** |
| MUT 期望 | §4 A-MUT（**MUT-929** · 57P01 **存在**） | §4 B-MUT（**MUT-ZERO** · Client 或 BoundPool） | §4 C-MUT（**MUT-ZERO** · Client 或 BoundPool） |
| POST 期望 | §4 A-POST（`db_pool_error`≥1 · 57P01 **存在** · CTU 允许） | §4 B-POST | §4 C-POST |
| 所证 | **checked-out + idle-in-transaction** client 的服务端 FATAL 终止 → L1 `client.on('error')` 覆盖路径（pg@8.22.0 `_handleErrorEvent`）。**A ≠ attempt1 的判别只用「57P01 出现」**（C2）：A 的 FATAL 落 idle-in-tx client → `:428` emit 57P01；attempt1 日志（`PERF-LOAD-prove.log:21-37`）`57P01`/`terminating connection` 匹配 0、栈为 `client.js:199` ← `:217`。**不**断言「attempt1 = socket 被杀」：FATAL 落 active query（`:432-433`）或 `idle_in_transaction_session_timeout` 25P03（`principal.ts:916`）之后同样走 `:199/:217` 得同一文本 → attempt1 文本只排除「FATAL 落 idle client」；归因仍以 J-2 为准 | 本 run PG 进程级断开 + 重连层（可能复现 attempt1 签名；NB-1 竞态） | 外部删除（L3 签名）对照 attempt1 · **C OK keep**（与 seed/warmup/measured 无关 · PG 永久消失） |


#### 5.1a Inject A · 单次容器内 psql（C1 + C3 · 写死 · 只读 `interview` · 只终止本 run PG 的 idle-in-tx client backend）

```sql
-- docker exec -i <PG> psql -X -v ON_ERROR_STOP=1 -U meetwise -d meetwise -qtA  < inject-a.sql  2>&1 | tee inject.log
DO $inj$
DECLARE r record; t0 timestamptz := clock_timestamp();
BEGIN
  LOOP
    PERFORM pg_stat_clear_snapshot();
    WITH iv AS (SELECT count(*) AS n, count(*) FILTER (WHERE status <> 'active') AS na
                  FROM interview WHERE id LIKE 'IV\_P018\_R3\_%'),
         idle AS (SELECT count(*) AS n FROM pg_stat_activity
                   WHERE datname = current_database() AND backend_type = 'client backend'
                     AND pid <> pg_backend_pid() AND state = 'idle'),
         tgt AS (SELECT pid, state, xact_start, left(query, 60) AS q FROM pg_stat_activity
                  WHERE datname = current_database() AND backend_type = 'client backend'
                    AND pid <> pg_backend_pid() AND state = 'idle in transaction'),
         k AS (SELECT t.pid, t.state, t.xact_start, t.q, pg_terminate_backend(t.pid) AS ok
                 FROM tgt t, iv WHERE iv.n BETWEEN 1 AND 109)
    SELECT (SELECT n FROM iv) AS iv_rows, (SELECT na FROM iv) AS iv_nonactive, (SELECT n FROM idle) AS idle_n,
           (SELECT count(*) FROM tgt) AS tgt_n, (SELECT count(*) FILTER (WHERE ok) FROM k) AS killed,
           (SELECT coalesce(json_agg(json_build_object('pid',pid,'state',state,'xact_start',xact_start,'q',q)),'[]') FROM k) AS snap
      INTO r;
    IF r.tgt_n >= 1 AND r.iv_rows BETWEEN 1 AND 109 THEN
      RAISE NOTICE 'INJECT_A phase=seed killed=% iv_rows=% iv_nonactive=% idle_n=% snap=%', r.killed, r.iv_rows, r.iv_nonactive, r.idle_n, r.snap; RETURN;
    ELSIF r.tgt_n >= 1 AND r.iv_rows = 110 AND r.iv_nonactive = 0 THEN
      RAISE NOTICE 'INJECT_PHASE_BOUNDARY iv_rows=% iv_nonactive=%', r.iv_rows, r.iv_nonactive; RETURN;
    ELSIF r.tgt_n >= 1 AND r.iv_rows = 110 AND r.iv_nonactive BETWEEN 1 AND 9 THEN
      RAISE NOTICE 'INJECT_PHASE_WARMUP iv_rows=% iv_nonactive=%', r.iv_rows, r.iv_nonactive; RETURN;
    ELSIF r.tgt_n >= 1 AND r.iv_rows = 110 THEN
      RAISE NOTICE 'INJECT_PHASE_MEASURED iv_rows=% iv_nonactive=%', r.iv_rows, r.iv_nonactive; RETURN;
    END IF;
    IF clock_timestamp() - t0 > interval '10 seconds' THEN
      RAISE NOTICE 'INJECT_GATE_TIMEOUT iv_rows=% idle_n=%', r.iv_rows, r.idle_n; RETURN;
    END IF;
    PERFORM pg_sleep(0.005);
  END LOOP;
END $inj$;
```

- **同一时刻（C1）**：`iv` / `idle` / `tgt` / `k` 同属一条语句（READ COMMITTED 下 plpgsql 每条语句一个新快照；`tgt`、`k` 各被引用两次 → PG 物化一次，`pg_terminate_backend` 每行只调用一次）；快照 JSON 即被终止 backend 的 `pid/state/xact_start/left(query,60)`，满足 T1 第 2 步收录要求。
- 阶段不为 seed 时**不终止**（`k` 的 `WHERE iv.n BETWEEN 1 AND 109`）→ 相位违规格不会产生「误注入后的观测」。
- B/C 门控 = 同结构 `DO` 块，去掉 `k`，条件换成 §5.0 (B)(C) 行，输出 `GATE_BC phase=seed iv_rows=% idle_n=% seed_act=%` 或 `INJECT_PRECOND_NO_IDLE` / `INJECT_PHASE_*` / `INJECT_GATE_TIMEOUT`。
- 本 SQL 为 harness 执行脚本文本（docs 钉值），**非**产品码 · 不入 repo 源码树 · AUTHORIZE 后由执行方原样落 `.tmp/an-perf-tear/<attemptId>/inject-*.sql`。

### 5.2 pg 路径钉死（docs · 对应 `20da721` 阻塞 1 源码依据 · Ban invent）

- `pg@8.22.0` `client.js:421-433`：后端 FATAL（`pg_terminate_backend` → 57P01）到达时，若有 **active query** → `activeQuery.handleError` → callback · **不** emit `'error'`。
- `pg-pool@3.14.0` `index.js:464-480` `pool.query()`：checkout 挂 `client.once('error')`；callback 内 `release(err)` → `_remove` → `client.end()` → 随后 socket `'end'` 因 `_ending` **不** emit `'error'`。
- 仅 `pool.connect()` 手持且处于 **`idle in transaction`**（事务间隙 · 无 active query）→ `_handleErrorEvent` → `emit('error')`；MUT 删 `:929` 后 → `Unhandled 'error' event`。
- 故 A **必须**收窄到 `state='idle in transaction'`；保留 `state<>'idle'` 会使 A-MUT/A-POST 3/3 **不可推出**。


### 5.2b B/C × MUT-ZERO / POST · 逐 seed 子步推导（对应 `70cba94` 新阻塞 1 · 选 (ii) · pg@8.22.0 / pg-pool@3.14.0 · Ban invent）

前提（C1 同快照记录）：`idle_n ≥ 1`——LOAD run2（c=20）刚结束，`idleTimeoutMillis=30000`（`principal.ts:918`）未到，pool `_idle` 中有 client，其上挂 `makeIdleListener`（`index.js:51-62`）；API 与 proof 同进程同池（§2.2）。B/C 断开对**所有** backend 同时生效（restart/rm 作用于整个 PG）。

| 断开时 seed 子步 | 被断 client 状态 | MUT-ZERO（删 `:929`+`:931`） | POST（tip） |
|---|---|---|---|
| **`:236` asPrincipal**（`pool.connect` 手持 · 事务间隙或 active query） | checkout 已去 idleListener（`index.js:344`），无任何 error 监听 | 间隙：`'end'`/FATAL → `_handleErrorEvent` → `emit('error')` 无监听 → **Unhandled on Client**。active query：FATAL → 回调（`:432-433`）→ `asPrincipal` catch 发 `ROLLBACK` 挂起 → `'end'`（`_ending` 假）→ `:217` emit → **Unhandled on Client**（seed 在 ROLLBACK 落定前不 reject）。idle clients 若先被分发 → idleListener → `pool.emit('error')` 无监听 → **Unhandled on BoundPool**。两者均命中 | `:929` 观测（必然 · 同上路径都经 emit）→ `db_pool_error`≥1 · 零 Unhandled |
| **`:232` pool.query**（pg-pool `once('error', onError)` `index.js:455-464`） | 其自身 client 被 `once` 接住（`70cba94` 已证） | 该 client **不**产生 Unhandled；任一 idle client 的断开事件被分发 → idleListener → `pool.emit('error')` 无 `:931` → **Unhandled on BoundPool**。**残余**：若该 pool.query client 的事件先被分发，`onError` → `cb(err)` → seed `await` reject → top-level await reject 在同一 microtask 检查点内终止进程，idle 事件来不及分发 → 无 Unhandled → **`INJECT_KIND_POOLQUERY_RACE`**（事前钉死 · 格 FAIL · 计入 3 次 · Ban retry · 比例未实测 · 不臆造） | socket 路径（C；B 的 SIGKILL 分支）：`'end'` → `_handleErrorEvent` 同步 emit，`:929`（`connect` 时先挂）先于 `once` 运行 → `db_pool_error`≥1 必然。B 的 57P01 分支且 FATAL 落 active pool.query：回调 → `release(err)` → `_remove` → `client.end()` 置 `_ending` → 不 emit → `db_pool_error` 依赖 idle 事件先于退出 → 可为 0 → **`INJECT_KIND_POOLQUERY_RACE`**（同上钉死） |
| **两次 checkout 之间** | 全部 client idle（idleListener 在） | 首个 idle 事件 → `pool.emit('error')` 无监听 → **Unhandled on BoundPool**（必然） | `:929`（per-client · 永久）→ `db_pool_error`≥1 必然 |

- 结论：MUT-ZERO 下 asPrincipal 子步与 checkout 间隙子步 **必然** Unhandled（Client 或 BoundPool）；pool.query 子步在 `idle_n≥1` 下 Unhandled on BoundPool，**唯一**残余为上表分发顺序竞态，已事前钉为 FAIL 计分，不靠事后观测改期望。MUT-ZERO 恒 `db_pool_error=0`、POST（socket 路径）恒 ≥1 → MUT/POST 有判别力（`70cba94`「无判别力」点关闭）。
- `Emitted 'error' event on BoundPool instance`：Node 以 emitter 构造器名打印；pg 导出的 Pool 为 `pg/lib/index.js:14` `class BoundPool extends Pool`。
- A 仍用 MUT-929：A 只终止 idle-in-tx（checked-out）backend，不触及 idle clients，`:931` 不参与 → A-MUT 推导（§5.2）不变。
- 本节只钉期望，**不**改产品码；MUT-ZERO 只在 prove worktree 临时存在（§4）。

### 5.3 非阻塞 carry（钉入 · 执行前遵守 · 非新阻塞）

| ID | 项 | 钉值 |
|----|----|------|
| **NB-1** | B `docker restart -t 0` 竞态 | 官方 postgres/pgvector 镜像常 `STOPSIGNAL SIGINT`（fast shutdown → backend 先发 57P01 FATAL）与 `-t 0` SIGKILL 竞态；B-MUT 可能落入 A 同类 57P01 分支。收据**必录**实际错误文本 + 是否出现 destroy。本刀不改 B CMD。 |
| **NB-2** | A terminate 0-conn | 见上：stdout=0 → **`INJECT_MISS`** · 格 FAIL · 计入 3 次 |
| **NB-3** | J-2 EXTERNAL-OTHER + L3-sim | 见 §2.1 判定表已补两行 |
| **NB-4** | R2 名 vs 串行过滤 | `meetwise-e2e-r2pool-*` 匹配 `docker ps --filter name=meetwise-e2e` → **下次 prove 前**必须 `docker rm -f` 该 R2 容器 · 与 §7 串行 0 行一致 |


### 5.4 AUX EXIT 表（C4 · 写死 · 偏离 → `AUX_EXIT_UNEXPECTED`：该 attempt 不计通过 · 格 FAIL 计入）

| 用途 | CMD | 期望 EXIT | 输出判据 |
|---|---|---|---|
| R2 起容器 | `docker run --rm -d --name meetwise-e2e-r2pool-<pid>-<ms> … pgvector/pgvector:pg16` | **0** | stdout 恰 1 行 64 位 hex cid |
| R2 端口 | `docker port <R2名> 5432/tcp` | **0** | stdout 恰 1 行匹配 `^127\.0\.0\.1:[0-9]+$` |
| R2 就绪 | `docker exec <R2名> pg_isready -U meetwise -d meetwise`（连续 3 次） | **0**（×3 连续） | 每次 stdout 含 `accepting connections`；30 s 内未达 3 连续 → `R2_ENV_FAIL` |
| R2 收尾 | `docker rm -f <R2名>` | **0** | stdout == `<R2名>` |
| NB-4 清理（每次 prove 前） | `docker ps -a --filter name=meetwise-e2e-r2pool- --format '{{.Names}}'` → 对每行 `docker rm -f <名>` | 列举 **0**；每个 rm **0** | 每个 rm stdout == 该名；随后 §7 串行检查 0 行 |
| J-2 事件流 | `docker events --filter type=container --format '{{json .}}' > events.jsonl &`（CMD 前起 · CMD 结束 +5 s 后 `kill -TERM`） | `wait` 返回 **143**（SIGTERM 终止 · 预期）；其他值 → `AUX_EXIT_UNEXPECTED` | `events.jsonl` 每行可解析 JSON · 至少 1 行 `Actor.Attributes.name` == 本 run PG 名（`create`/`start`） |
| J-2 进程采样 | `while :; do date +%s.%N; pgrep -af 'uc018-receipt-backfill-emit\|run-e2e-isolated'; sleep 1; done > procs.txt &`（同起止 · `kill -TERM`） | `wait` 返回 **143**；循环内 `pgrep` 无匹配时 EXIT 1 属预期、不计偏离 | 时间戳行数 ≥ CMD 时长（秒）−1 · 至少 1 行含本 run `run-e2e-isolated` |
| J-2 前后容器 | `docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018 --format '{{.Names}}'`（CMD 前 / 后） | **0** / **0** | 前 **0 行**（否则不得开跑 · §7）；后 **0 行**（runner `:2271` / `--rm` 已收尾；残留 → 记录并 `AUX_EXIT_UNEXPECTED`） |
| B 端口对照 | `docker port <PG> 5432/tcp`（restart 前 / 后） | **0** / **0**（后若容器已被 runner 删 → EXIT 1 + `No such container` 记 `PORT_POST_UNAVAILABLE` · 披露 · 不计偏离） | 记录 port changed true/false |
| MUT 施加/还原 | `git diff --stat -- packages/db/src/principal.ts`（施加后）· `git checkout -- packages/db/src/principal.ts && git diff --exit-code`（还原） | **0** / **0** | 施加后 MUT-929=`1 deletion(-)`、MUT-ZERO=`2 deletions(-)`；还原后无输出 |

**Ban**：全局 `docker rm -f` · 经 emitter `:559` · 触碰非本 run 容器/backend · 以 inject 红当绿 · 事后按观测改阶段/签名期望 · 用 `state<>'idle'` 跑 A · 要求 A 复现 attempt1「Connection terminated unexpectedly」· 以 CTU **缺席**作判据（C2）· 门控与终止分两次 `docker exec`（C3）· B/C-MUT 用 MUT-929 · A-MUT 用 MUT-ZERO · 把 `INJECT_KIND_POOLQUERY_RACE` / `A_FATAL_ON_ACTIVE` / `INJECT_PRECOND_NO_IDLE` 不计入或换 attempt。

## 6. B5 · 具名回归 + EXIT（B5 已解除 · 保留 · Cond 2 补 R2 DB source）

| # | CMD | 期望 EXIT | DB source | 说明 |
|---|-----|-----------|-----------|------|
| R1 | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove` | **0** | runner 隔离 PG `:1744`/`:2200` | 与 PC 同 CMD · 独立 attempt · Ban 借绿关本刀 CONDITION |
| R2 | `DATABASE_URL=<R2 一次性容器 URL> pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts` | **0** · 输出含 `CMD=pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts EXIT=0` · 12/12 PASS | **一次性本 run 自有容器**：`docker run --rm -d --name meetwise-e2e-r2pool-$$-$(date +%s%3N) -e POSTGRES_USER=meetwise -e POSTGRES_DB=meetwise -e POSTGRES_PASSWORD=<本次随机生成 · 不落盘> -p 127.0.0.1::5432 pgvector/pgvector:pg16` → `pg_isready` 3 次连续成功 → `DATABASE_URL` 由 `docker port` 组装（同 `receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md:21` 口径）→ 结束 `docker rm -f` **仅该名** | proof 自带目标来源 = `DATABASE_URL`/PG 组件、无 localhost 回退（`pool-error-listener.proof.ts:20`）。**Ban** 指向 dev / 共享 / 他线 PG。首个 `PASS` 前连接失败 → 记 **`R2_ENV_FAIL`**（≠ 回归 · ≠ 绿 · 计入 attempt · 诚实记录）|
| R3 | `pnpm uc018:receipt-backfill:prove` | **0** | 无 DB（静态 receipt 校验 `scripts/uc-e2e-018-receipt-backfill.proof.mjs`） | Ban 借绿 · Ban covered flip |

**Ban** 将 R1–R3 绿记作本刀产品关闭证据 · **Ban UC-018 covered flip**。

## 7. B6 · 证据层 · 宿主 · 串行（B6 已解除 · 保留）

| 项 | 钉死 |
|----|------|
| **证据层** | `run-e2e-isolated.mjs` **隔离真 PG**（`pgvector/pgvector:pg16` · `:1744` 容器）· Ban fake DB |
| **宿主类** | **Linux-native-Docker-Engine**（Line AE R-A）· Desktop / macOS Docker Desktop **不在本刀范围** |
| **串行** | 每次 prove **前** `docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018` 必须为 **0** 行（含清掉 R2 `meetwise-e2e-r2pool-*` · §5.3 NB-4）；有他线 prove 时 **不得** 跑本刀 |
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

*Harness · C-PERF-TEARDOWN product rootcause fix · AN-PERF-TEAR re-PRE ×4 · supersedes 083cce4 (→1b74fb1→553cfc5→110532e) · FAIL 70cba94 + 20da721 + 7e97dc3 + 152b665 · (ii) B/C-MUT = MUT-ZERO (:929+:931) · Client|BoundPool · POOLQUERY_RACE pinned FAIL · C1–C4 · Inject A idle-in-txn + 57P01 + T1 seed retained · runner +18 re-anchor @ac03f30 · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · CONDITION OPEN · peer dbed2f2 cited not co-signed · alone ≠ dual · STOP*
