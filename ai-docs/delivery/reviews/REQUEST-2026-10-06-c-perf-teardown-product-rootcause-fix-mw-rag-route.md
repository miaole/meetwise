# REQUEST — **C-PERF-TEARDOWN · product rootcause fix** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **×2 re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Rewrite ×2**: **supersedes REQUEST `553cfc5`**（`553cfc5e4ca511b0327b647fcc2b49925828752c` · itself superseded `110532e`）· cites mw-rag-route Re-PRE FAIL **`7e97dc3`**（`7e97dc3e500c9471fe50dbdbd3aaee8d6c89e7e9`）**B1/B3/B4/Cond 1–2 addressed** · B2/B5/B6（cleared @7e97dc3）pins retained · Ban coding · CONDITION OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/c-perf-teardown-product-rootcause-fix.md` · slice `c-perf-teardown-product-rootcause-fix.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` @ `eae1e19`（ff past `4b06058` · AN siblings cited only · Ban touch AN-PRIV-EXT / AN-MOP-Q45 / AN-CIMG-EA）
**Prior REQUESTs**: `553cfc5e4ca511b0327b647fcc2b49925828752c`（superseded）· `110532e81f11064e543bc9bc420b67bb2f95ae1e`（superseded）
**Date**: 2026-10-06
**Line**: **AN-PERF-TEAR**（wave AN · re-PRE ×2）

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
| PERF/LOAD | **local partial** · capacityRepresentative=**false** |

## 请审什么（mw-rag-route · re-PRE ×2 · 仅 `7e97dc3` 未清项 + 保留项核对）

Line AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause。本 stub = **re-PRE rewrite ×2**（supersedes `553cfc5` · cites FAIL `7e97dc3`）。harness = `harness/c-perf-teardown-product-rootcause-fix.md`。请审：

1. **B1① L3 判定程序**（harness §2.1）：J-1 回溯已读档执行——attempt1 窗口 `2026-09-24 12:57:14–12:57:35 +08:00`（box `/workspace/mw-rv-bf-results/PERF-LOAD.env`）内 `attempts.jsonl` **无** emit 记录（prove 模式末条 `04:38:14Z`；`04:50:35Z` 批为 `reemit-from-log`，`emit.mjs:304` 退出、`:505` try / `:559` 不可达）；reviewer 串行序列无重叠；`state_bytes=29 logs_bytes=29` = `Buffer.byteLength('docker_diagnostic_unavailable')` → 诊断前容器已消失，但在 `--rm` 下与 L2-self **同签名** → 结论 L3(已记录)=OUT · L3(未记录并发)/L2-self=UNDETERMINABLE。J-2 前向：每 attempt 强制 `docker events` + emitter 进程采样 → 判定表（L3 IN / L2-self IN / L1 client-side / OUT / UNDETERMINABLE）。J-3：Inject C 只 `docker rm -f` 本 run PG 对照 attempt1 签名。
2. **B1② attempt1 时序**（§2.2）：崩溃在 `LOAD run2` 后 / `PERF run3` 前；proof `:441-444` run 间无 teardown/重连；runner `:2251-2253` 与 capped child `:203` 的自有 rm 顺序上晚于 proof 退出 → 本 run harness teardown 被读码排除；**L2-self**（本 run PG 自亡 + `--rm` 自删）**不能**排除 → 交 J-2；attempt1 @`b29c191` 时 `principal.ts:928-931` 尚不存在（`f19ecba` 引入）。
3. **B3 EXIT 矩阵**（§4）：PC 3/3 EXIT **0**；A/B/C × MUT 3/3 EXIT **1** + `Unhandled 'error' event`/on Client/无 SUMMARY；A/B/C × POST 3/3 EXIT **1** + `db_pool_error`≥1 + 零 unhandled（F1/F2 形态记录）；POST 观测 EXIT 0 → `POST_EXIT_UNEXPECTED` 格 FAIL；MUT = 临时删 `:929` · Ban commit · `git diff --exit-code` 0；Ban retry / 换 attempt。
4. **B4 三注入各自钉**（§5）：(A) `pg_terminate_backend` 自身 EXIT 0 + count≥1；(B) `docker restart -t 0 <PG>` EXIT 0 + stdout==名 + `docker port` 前后；(C) `docker rm -f <PG>` EXIT 0 + stdout==名；共用触发点 **T1** = `^LOAD run2: ` 出现后 ≤1 s，`PERF run3:` 先出现 → `INJECT_LATE`；门控 `state<>'idle'` client backend ≥1（10 s 超时 → `INJECT_GATE_TIMEOUT`）。
5. **Cond 1** `pool.on('error')` = **`principal.ts:931`**；**Cond 2** R2 DB source = 一次性本 run 自有 `pgvector/pgvector:pg16` 容器（`meetwise-e2e-r2pool-*`）+ 显式 `DATABASE_URL` · Ban dev/共享 PG · 首 PASS 前连不上 → `R2_ENV_FAIL` ≠ 回归。
6. **保留核对**：B2 分层 / P-FIX 仅 `principal.ts` / emitter `:559` ≠ product close；B5 R1–R3 EXIT0 + Ban 借绿；B6 隔离真 PG · Linux-native · serial `docker ps`=0 · Ban emitter。
7. **行号重锚 disclosure**：`9e2abd0` 后 `run-e2e-isolated.mjs` @tip 实测 +12（`:1714→:1726` · `:2170→:2182` · `:2239-2241→:2251-2253`）；其余 loci 行号不变；无新增产品 locus。

刀界：≠ Line AE residual redo · ≠ Line S Branch A 复跑刀（只读 cite）· **Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN · 不代签 peer `mw-e2e-ha` · alone ≠ dual。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code · Ban commit MUT · Ban invent product loci · Ban MySQL/Qdrant/FULLTEXT · Ban touch AN-PRIV-EXT/MOP product · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-rag-route` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite ×2 · supersedes 553cfc5 · FAIL 7e97dc3 (B1/B3/B4/Cond) · Ban coding · CONDITION OPEN · awaiting expert re-PRE dual · STOP*

---

## Rewrite ×2 note · re-PRE（append · do not erase history below）

**re-PRE ×2 · supersedes `553cfc5` · cites FAIL `7e97dc3`** · B1①/B1②/B3/B4/Cond1/Cond2 landed in harness §2.1/§2.2/§4/§5/§2 L1/§6 · B2/B5/B6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史 FAIL 正文原样保留。

---

## Rewrite note · re-PRE（append · do not erase FAIL section below）

**re-PRE · supersedes `110532e` · cites FAIL `152b665`** · B1–B6 landed in harness/slice · Status stays `draft:awaiting_pre_exec_dual` · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · alone ≠ dual。

下方 Historical FAIL 正文 **原样保留不擦除**；本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL。

---

## PRE-EXEC @110532e · mw-rag-route

**时间**：2026-10-06 20:15 +08:00
**REQUEST**：`110532e81f11064e543bc9bc420b67bb2f95ae1e`（只改 4 个 docs：harness +73、slice +25、两个 stub 各 +46；docs-only，是 origin tip `d269761` 的祖先）
**审查基**：临时 worktree `/tmp/mwrr-d269761` @ `d269761`（detached）· 仅本 box · 只读源码，无 prove、无 docker 操作 · 未读 `.env*` · 无 live 模型调用
**范围**：独立审查，不代签 mw-e2e-ha · alone ≠ dual

### 已满足

- attempt1 @ `b29c191` EXIT=1 永久保留，Ban wash（harness `:24`、`:37`、`:60`）；Ban UC-018 covered flip（`:38`、`:54`）；backlog `:35` CONDITION 保持 OPEN、零 SSOT 改动（`:49`、`:53`）。
- 与 Line S / Line AE 分界，Ban 借其绿（`:13-14`、`:19`、`:40`）。
- Pins 全部保留（`:4`、`:71`）；未声称 covered（`:67`）。
- 引用的 backlog `:35` 原文与仓库一致。

### 阻断项

**B1 · 根因主张没有任何代码锚点，P-FIX / P-HOLD 的判定被推给评审。** harness `:19`、`:32-33` 只说「若双审认定仍需产品面…」，全文没有一个 file:line 指向 teardown 代码，也没有根因假设。已核实的真实候选落点：
- 产品 pg 错误观测：`packages/db/src/principal.ts:928-931`（`pool.on('connect')` 给每个 client 挂 `error` 观测，`pool.on('error')`；`:870-900` 注释说明它只观测、不恢复）。Line S 判定它在结构上覆盖 attempt1 路径（`harness/gap-perf-teardown-rootcause-fix.md:29`）。
- runner 自身容器：`scripts/run-e2e-isolated.mjs:1714`（容器名 `meetwise-e2e-${pid}-${ts}`）、`:2239-2241`（finally 只 `docker rm -f` 自己的容器）。
- 发射器全局清理：`scripts/uc018-receipt-backfill-emit.mjs:555-560`，其中 `:559` 对**所有** `meetwise-e2e*` / `meetwise-uc018*` 容器 `docker rm -f`；而 try 内 `:206` / `:226` / `:248` 的 `process.exit()` 会跳过这个 finally。
- capped child：`scripts/uc018-perf-load-capped-child.mjs:18`（容器名 `meetwise-uc018-perf-api-*`，同样落在发射器的过滤范围内）、`:105-159`。

backlog `:35` 写明 attempt1 发生在 “PERF-LOAD teardown during backfill”，即在发射器下运行。因此「另一个并发 emit 的 `:559` 全局 `docker rm -f` 删掉了正在跑的 PG 容器 → `Connection terminated unexpectedly`」是一个必须排除或确认的**基建 / harness** 候选根因。
**修复**：新增「读码锚点 + 根因假设表」，列出上述四处（含行号）。每条写清可证伪的判据，并据此给出 P-FIX 或 P-HOLD 的书面初判，而不是留给 PRE 评审裁定。

**B2 · 没有区分产品 teardown 与 harness / infra teardown。** `:33`、`:41` 只是笼统地把基建归到 AE / Branch B。
**修复**：把每个落点标为产品（`principal.ts`、API 进程）、harness（`run-e2e-isolated.mjs`、capped child）或 infra（发射器全局 rm、docker 宿主）。P-FIX 只能动具名产品文件；若根因在发射器 `:559`（含 `process.exit` 跳过 finally），应另开 harness 刀，不得以「产品修复」名义关闭 CONDITION。

**B3 · LOOP §3③（`NORTH-STAR-EXECUTION-LOOP.md:81`）：命令与期望 EXIT 未钉。** `:47` 写「`pnpm uc018:perf-load:prove`（或 PRE 裁定之产品面专用 prove）· attempts 预声明」，但没有给出具体 attempts 数，也没有期望 EXIT。
**修复**：钉死完整命令 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm <script>`、attempts=N、每个 outcome 的期望 EXIT（复现前 / 修复后 / 变异），以及 code SHA 与 +08:00 时间戳要求。

**B4 · 没有可复现的故障注入、正控或变异。** 若无法让 mid-prove client teardown 确定性复现，P-FIX 就无法证明「修好了」。
**修复**：钉一个只针对本 run 自身资源的确定性注入。例如在 prove 中途对本 run 的 backend 执行 `pg_terminate_backend`，或只 `docker restart` 本 run 的容器 `meetwise-e2e-${pid}-…`，并钉住期望：修复前（或删去 `principal.ts:929` 的变异下）出现 `Unhandled 'error' event` / EXIT≠0；修复后为 `db_pool_error` 被观测、无未处理异常，EXIT 按设计钉死。正控为无注入时 EXIT 0。

**B5 · 回归未具名。**
**修复**：具名列出回归及期望 EXIT 0。至少包括 Line S 的 `uc018:perf-load:prove`、引入 pool 观测的 C'' FI prove，以及 PRE 选定的 UC-018 其他 prove。并写明 Ban 借这些绿当本刀证据。

**B6 · 证据层、宿主类与串行规则未声明。**
**修复**：
- 证据层：`run-e2e-isolated.mjs` 隔离真 PG（pgvector/pg16 fixture）。
- 宿主类：沿用 Line AE 的 R-A Linux-native-Docker-Engine；Desktop 类不在本刀范围。
- 串行规则：每次 prove 前 `docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018` 必须为 0，有他线 prove 时不得运行。**禁止**经 `uc018:receipt-backfill:emit` 跑本刀（其 `:559` 会误杀他线容器）；故障注入只准作用于本 run 自己的容器 / backend。

### 结论

上述 6 项阻断未解除前不得进入 coding / prove。CONDITION（backlog `:35`）保持 OPEN；UC-018 / §1.1 保持 partial；attempt1 不洗。Pins 未变：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。本审不代签 mw-e2e-ha；alone ≠ dual；coding 须双方 PASS 加协调方 AUTHORIZE。

Verdict: FAIL

## Re-PRE @553cfc5

**时间**：2026-10-06 20:28 +08:00
**REWRITE**：`553cfc5e4ca511b0327b647fcc2b49925828752c`（supersedes `110532e`，引用我方 FAIL `152b665` B1–B6）。fetch 后确认在 origin，是 tip `a1f3614` 的祖先；只改 4 个 docs（harness +100/-24、slice、两个 stub）。
**审查基**：临时 worktree `/tmp/mwrr-553cfc5` @ `a1f3614` · 仅本 box · 只读，无 prove / docker 操作 · 未读 `.env*` · 无 live 模型调用
**本文件历史段**：`## PRE-EXEC @110532e` 正文与 `152b665` 逐字一致（区段比对通过）；core 新增的表头 / Rewrite note 未改动。
**Peer**：mw-e2e-ha 的同线收据仍为 PENDING stub，无结论可引；不代签 · alone ≠ dual。

### 逐项核对（harness = `harness/c-perf-teardown-product-rootcause-fix.md`）

- **B1 · 部分解除，仍阻断。**
  - 已解除：四个 locus 已具名并带锚点（`:48-51`）。L1 `principal.ts:928-931` ✓；L2 `run-e2e-isolated.mjs:1714` / `:2239-2241` ✓；L3 `uc018-receipt-backfill-emit.mjs:555-560` / `:559`，并注明 `:206` / `:226` / `:248` 跳过 finally ✓；L4 `uc018-perf-load-capped-child.mjs:18` ✓。根因初判已书面给出（`:58`），可证伪判据见 `:48-51`。小误差：`:48` 写 `pool.on('error')` 在 `:932`，实际在 `:931`。
  - 仍缺 ①：L3（他线 emit 的 `:559` 删掉 PG 容器）只写了「优先排除」（`:58`）和判据「日志见他 PID 容器消失」（`:50`），**没有说明如何判定**。§4 / §5 没有任何一步能产生 L3 的入 / 出证据：既没有读取 attempt1 证据链（backlog `:35` 指向 `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:371-380`，以及 `attempts.jsonl`）核对是否有并发 emit，也没有设计能区分 L3 签名的复现。
  - 仍缺 ②：attempt1 的时序证据没有被用来约束假设或注入时机。`:233` 写「on PG teardown」；纠正段 `:371-380` 写 run1+run2 `passed=true` 后出现 Unhandled `Connection terminated unexpectedly`，没有 run3，也没有 `SUMMARY`，即崩溃发生在 run2 通过后、run3 之前。harness 未分析此窗口内 proof 自身的 PG 收尾 / 重连（本 run 资源，L2 / L4 层）能否产生同一签名。`:49` 仅以「不扫他线」排除 L2。
  - **修复**：
    1. 在 §2 增加「L3 判定程序」：(a) 读取 attempt1 日志锚点与 `attempts.jsonl`，比对时间窗内是否存在并发 emit / 他 PID 容器删除，写出结论（入 / 出 / 无法判定）；(b) 给出一个模拟外部删除的确定性复现（只针对本 run 容器），把错误签名与 attempt1 的 `:376` 对比。
    2. 在 L2 / L4 中补充「run 间 / PG teardown 窗口内本 run 资源时序」假设，以及对应判据。
- **B2 · 已解除。** 每个 locus 标了 PRODUCT / HARNESS / INFRA（`:48-51`）；P-FIX 只准改 `packages/db/src/principal.ts`（`:53-56`）；明确「emitter `:559` ≠ product close」（`:50`、`:56`、`:72`、`:143`）。
- **B3 · 部分解除，仍阻断（与 B4 合并）。**
  - 已解除：唯一命令 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove`，带 `env -u` 前缀（`:80`、`:86`）；attempts=3（`:87`）；时间戳与 SHA 要求（`:88`）；去掉了「或 PRE 选定」（`:92`）。
  - 仍缺：
    - `:91`「修复后 + inject」的 EXIT 写成「按设计诚实（可为 1）」，**未钉值**，违反 LOOP §3③（`NORTH-STAR-EXECUTION-LOOP.md:81`）。
    - attempts=3 的通过要求没写清：正控是否必须 3/3 EXIT 0？inject / 变异各跑几次？
    - inject 这一步本身（`pg_terminate_backend` / `docker restart`）没有期望 EXIT。
  - **修复**：逐条钉出：正控 3/3 EXIT 0；pre / 变异 inject 每次 EXIT 精确值（或「≠0 且日志含 `Unhandled 'error' event`」）；修复后 inject 的精确 EXIT 及判定（例如 EXIT=1 且 reason=X、`db_pool_error` 计数 ≥1、无 unhandled）；inject 命令期望 EXIT 0。
- **B4 · 未解除，阻断。**
  - `:98` 仍是「(A) `pg_terminate_backend` **或** (B) `docker restart` 本 run 容器」二选一，交给实施方选择，两者的预期也没分开。
  - 注入时机未钉：只说 mid-prove，没有触发点（例如负载阶段第 N 个请求后，或 run2 通过后、run3 前），而 attempt1 发生在 run2 通过后、run3 前（`09-23 review :371-380`）。
  - 修复后期望未钉（同 B3）。变异 = 删去 `principal.ts:929`（`:101`、`:103`）✓。
  - **修复**：二选一定案，或两者都做并各自钉预期；钉触发点（建议至少包含与 attempt1 一致的 run 间窗口）；分别钉修复前 / 修复后 / 变异的 EXIT 与日志签名。
- **B5 · 已解除。** 回归 R1–R3 各带期望 EXIT 0（`:109-111`），并 Ban 借绿（`:113`）。已核实 `packages/db/test/pool-error-listener.proof.ts` 与根 `package.json:524` 的 `uc018:receipt-backfill:prove` 都存在（见条件 2）。
- **B6 · 已解除。** 隔离真 PG（`:119`）；Linux-native-Docker-Engine，Desktop 不在范围（`:120`）；串行要求 `docker ps` 为 0 行（`:121`）；禁止经 emitter 跑（`:122`）；inject 只作用于本 run 资源（`:99`、`:123`）。
- **其他**：attempt1 @ `b29c191` 不洗（`:39`、`:68`、`:135`）；无 UC-018 covered flip（`:69`、`:128`）；backlog `:35` 保持 CONDITION OPEN（`:127`）；Pins 未变（`:4`、`:147`）。

### 非阻塞条件（随下次 rewrite 一并处理）

1. `:48` 的 `:932` 改为 `:931`。
2. R2 `pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts`（`:110`）需要说明数据库来源（经 isolated runner 还是 proof 自带），否则 env 失败会被误记为回归。

### 结论

B2 / B5 / B6 已解除；B1、B3、B4 仍阻断（L3 判定程序缺失，attempt1 时序未用于约束假设；修复后 EXIT 与 attempts 通过条件未钉；注入手段仍是二选一、时机未钉）。CONDITION（backlog `:35`）保持 OPEN；UC-018 / §1.1 保持 partial；attempt1 不洗。Pins 未变：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。coding 仍禁止，须双方 PASS 加协调方 AUTHORIZE；本审不代签 mw-e2e-ha。

Verdict: FAIL
