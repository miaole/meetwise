# REQUEST — **C-PERF-TEARDOWN · product rootcause fix** · pre-exec · mw-rag-route

**AUTHORIZE**: coding+prove @ REQUEST `771ca84` · PRE dual BOTH PASS（mw-rag-route Re-PRE5 `683d946` · mw-e2e-ha Re-PRE5 `fef9408`）· 条件 C-a（=e2e C-1 · Unhandled 扫描含 `Emitted 'error' event on … instance at:` 段）/ C-b（J-2 `kill -TERM` EXIT 0）/ C-c（margin.json 录 `docker version`）**已于 prove 前落 harness**（`## AUTHORIZE · 条件落地`）· **POST Verdict PENDING**（awaiting post_prove_dual · implementer 不代填 PASS · Ban self-nail · CONDITION `:35` OPEN）
**Status (PRE history)**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **×5 re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha` · 本专家既有 Re-PRE4 FAIL `a07256c` @b5633f0 由本稿回应 · peer PASS `2900c46` cited not co-signed）
**Rewrite ×5**: **supersedes REQUEST `b5633f0`**（`b5633f0f20e887ce733d1d3778dedf48357ef176` · itself superseded `083cce4`→`1b74fb1`→`553cfc5`→`110532e`）· cites mw-rag-route Re-PRE4 FAIL **`a07256c`**（`a07256c1809f30c9ae8bda6c98fab69760cb41a7`）**阻塞 1 TIMING + 阻塞 2 C-POST addressed** · peer mw-e2e-ha Re-PRE4 PASS `2900c46`（`2900c46ef6f12258dcbc957c0273722ea83a6a47`）cited not co-signed · NB-e..i / NB-1..5 pinned · cleared items retained · Ban coding · CONDITION OPEN
**Rewrite ×4**（history）: **supersedes REQUEST `083cce4`**（`083cce467657c1499f748f0073eeaee7bdd9392d` · itself superseded `1b74fb1`→`553cfc5`→`110532e`）· cites mw-e2e-ha Re-PRE3 FAIL **`70cba94`**（`70cba947798c7fb33f7fa4a8a1ec8609ef6bc610`）**新阻塞 1 B/C-MUT addressed via (ii)** · peer `dbed2f2` 条件 1–4 = C1–C4 pinned · cleared items retained · Ban coding · CONDITION OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual · FAIL `20da721` @1b74fb1 已 cite）
**Knife**: `harness/c-perf-teardown-product-rootcause-fix.md` · slice `c-perf-teardown-product-rootcause-fix.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` @ `a07256c`（ff past FAIL `a07256c` / RAG nail `1024bfc` · CODE 锚 `ac03f30` 不变 · peer PASS `2900c46` · 历史 ff past FAIL `70cba94` · PASS `dbed2f2` · RAG R3 CODE `264e1d7`/`ac03f30` 他线只读 · runner +18 重锚 · Ban touch AN-RAG-R3 / AN-PRIV-EXT / AN-MOP-Q45 / AN-CIMG-EA）
**Prior REQUESTs**: `b5633f0f20e887ce733d1d3778dedf48357ef176`（superseded by ×5）· `083cce467657c1499f748f0073eeaee7bdd9392d`（superseded）· `1b74fb1cfa9226e8904e0dc51af02f1882851c79`（superseded）· `553cfc5e4ca511b0327b647fcc2b49925828752c`（superseded）· `110532e81f11064e543bc9bc420b67bb2f95ae1e`（superseded）
**Date**: 2026-10-06
**Line**: **AN-PERF-TEAR**（wave AN · re-PRE ×5 · QUOTA WIND-DOWN last knife）

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

## 请审什么（mw-rag-route · re-PRE ×5 · 仅 `a07256c` 两阻塞 + NB + 保留项核对）

Line AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause。本 stub = **re-PRE rewrite ×5**（supersedes `b5633f0` · cites FAIL `a07256c`）。harness = `harness/c-perf-teardown-product-rootcause-fix.md`（rewrite ×5 note · §4 矩阵 + 阶段表 + 观测源段 · §4.1 · §5 T1 · §5.0 · §5.0a/b/c · §5.1a · §5.2b · §5.4）。请审：

1. **阻塞 1 TIMING (a) 预启动**：容器内**单次** psql 循环在 `^PERF run1: ` 检出即启动（按收据 ≈1006 ms 先于 `^LOAD run2: `）；门控键 `IV\_P018\_R3\_%` run3 seed 前恒 0 → 相位安全；「LOAD run2 → psql ≤1 s」删除，改为可观测判据 `GATE_LOOP_START iv_rows=0` ∧ `t0_ms < t_load2`（否则 `INJECT_LATE`）；10 s 上限 ≈36× LOAD run2（274 ms）· `INJECT_NOT_REACHED`。
2. **阻塞 1 TIMING (b) 公式**：唯一依赖 seed 着陆的 B/C 格 = B-POST · `U_B = min(109, 110 − ceil(k·L_cli / t_round))` · k=2 · t_round=1.39 ms（收据最紧上界 · 取小保守）· `L_cli` = 执行前 5× `docker version` 最大值 · `U_min=6` · `U_B<6` → `BC_MARGIN_INFEASIBLE`（不执行 · FAIL×3 · harness-timing）· `INJECT_GATE_MISSED_MARGIN`；B-MUT / C-MUT / C-POST `ub=109`（与阶段无关）；§5.0c B/C 门控 SQL 全文写死（`SET inj.ub`）。
3. **阻塞 1 TIMING (c) 证据**：§5.0a 表 · 430 ms / measured ≥216.6 ms / seed ≲213 ms / ≈1.9 ms/轮 / 10 轮 ≲19 ms / LOAD run2 274 ms · 收据 `receipts/uc018-perf-load/nhp-018-perf-01-run3.json` · `nhp-018-load-01-run2.json`（+run1/run2）。
4. **阻塞 2 C-POST 唯一规则**：C-POST **与阶段无关 OK keep**（§4.1 推导 · PG 永久消失 → EXIT 1 · `db_pool_error`≥1 · 零 Unhandled）· 不要求 F2/`seedAbandonTargets` · 无 DRIFT · EXIT 0 → `POST_EXIT_UNEXPECTED`；B-POST 落点复核 = F2 ∧ 无 `^PERF run3:` ∧ `seedAbandonTargets`（排除 LOAD run3 seed 假阳）· 阶段表 / §4 矩阵 / 观测源段三处一致。
5. **NB**：`idle_n≥2` · A/B/C-MUT Unhandled 栈帧含 `pg/lib/client.js`|`pg-pool/index.js`（否则 `UNHANDLED_NOT_PG`）· J-2 `wait` ∈ {143, 0} · runner `:2220` 同行追加披露（无偏移）· 竞态措辞「socket 回调后 nextTick/microtask 排空内、下一回调分发前」。
6. **Cleared stay**：(ii) MUT-ZERO B/C · Client|BoundPool · `db_pool_error`=0 · POOLQUERY_RACE · C1–C4 · Inject A idle-in-txn + 57P01 + MUT-929 · T1 seed · `INJECT_PHASE_WARMUP` · runner +18 @`ac03f30` · B1/B2/B5/B6 · R2 · `:931` · backlog `:35` OPEN。本 stub **不**触碰 AN-RAG-R3 文件。

刀界：≠ Line AE residual redo · ≠ Line S Branch A 复跑刀 · ≠ AN-RAG-R3 · **Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN · 不代签 peer `mw-e2e-ha` · alone ≠ dual。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code · Ban commit MUT · Ban invent product loci · Ban MySQL/Qdrant/FULLTEXT · Ban touch AN-PRIV-EXT/MOP/RAG product · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban 用 `state<>'idle'` 跑 A · Ban 要求 A 复现 attempt1 文本 · Ban B/C-MUT 用 MUT-929 · Ban 把 POOLQUERY_RACE 不计入/换 attempt · Ban CTU 缺席判据 · Ban「LOAD run2 → psql ≤1 s」/ 事后反应阈值 · Ban 执行后改 `L_cli`/k/t_round/`U_B` · Ban C-POST 判 DRIFT · Ban 免除 B-POST 落点复核。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-rag-route` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite ×5 · supersedes b5633f0 · FAIL a07256c (TIMING prestart + B-POST margin formula · C-POST phase-independent) · NB idle_n≥2/pg-frames/wait{143,0}/:2220/race · peer 2900c46 cited not co-signed · Ban coding · CONDITION OPEN · awaiting expert re-PRE dual · STOP*

---

## Rewrite ×5 note · re-PRE（append · do not erase history below）

**re-PRE ×5 · supersedes `b5633f0` · cites FAIL `a07256c`（mw-rag-route Re-PRE4）· peer PASS `2900c46`（mw-e2e-ha Re-PRE4）cited not co-signed** · TIMING：`^PERF run1:` 预启动单次容器内 psql 循环 · 判据 `GATE_LOOP_START iv_rows=0 ∧ t0_ms < t_load2`（删除 ≤1 s）· B-POST 余量 `U_B = min(109, 110 − ceil(2·L_cli/1.39 ms))` · `U_min=6` / `BC_MARGIN_INFEASIBLE` · 时序证据 430 ms / ≲213 ms / ≈1.9 ms/轮 / ≲19 ms（收据路径）· C-POST 与阶段无关 OK keep（无 `seedAbandonTargets`/DRIFT）· B-POST 落点 = F2 ∧ 无 `^PERF run3:` ∧ `seedAbandonTargets` · NB `idle_n≥2` · pg 栈帧 · `wait` ∈ {143, 0} · `:2220` 披露 · 竞态措辞 · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · alone ≠ dual。本段仅为 rewrite 注记，**不**构成 PASS/FAIL；下方历史段（含 ×4 note 与全部历史 FAIL/PASS 正文）原样保留。

---

## Rewrite ×4 note · re-PRE（append · do not erase history below）

**re-PRE ×4 · supersedes `083cce4` · cites FAIL `70cba94`** · (ii) B/C-MUT = MUT-ZERO（`:929`+`:931`）· Client|BoundPool · `INJECT_KIND_POOLQUERY_RACE` 事前钉 FAIL · C1 同快照 SQL · C2 57P01 存在 · C3 单次容器内 psql · C4 AUX EXIT · runner +18 重锚 @ac03f30 · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · peer `dbed2f2` cited not co-signed · alone ≠ dual。本段仅为 rewrite 注记，**不**构成 PASS/FAIL；下方历史段原样保留。

---

## Rewrite ×3 note · re-PRE（append · do not erase history below）

**re-PRE ×3 · supersedes `1b74fb1` · cites FAIL `20da721`** · Inject A narrow `idle in transaction` + 57P01 · T1 seed phase · NB-1..4（含本专家 Re-PRE2 非阻塞 2/3）· B1/Cond/+12/B2/B5/B6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · alone ≠ dual · Ban touch RAG knife。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史 rewrite note + FAIL/PASS 正文原样保留。

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

## Re-PRE2 @1b74fb1

**时间**：2026-10-06 20:52 +08:00
**REWRITE ×2**：`1b74fb1cfa9226e8904e0dc51af02f1882851c79`（supersedes `553cfc5`，引用我方 Re-PRE FAIL `7e97dc3`）。fetch 后确认在 origin，是 tip `c515a8c` 的祖先；只改 4 个 docs（harness、slice、两个 stub）。
**审查基**：临时 worktree `/tmp/mwrr-re-pre2` @ `c515a8c` · 仅本 box · 只读，无 prove / 无 docker 操作 · 未读 `.env*` · 无 live 模型调用
**本文件历史段**：`## PRE-EXEC @110532e` 起至 `## Re-PRE @553cfc5` 结尾，与 `7e97dc3` 逐字一致（diff 为空）；core 只改了表头，并新增「Rewrite ×2 note」段，均未改动。
**Peer**：mw-e2e-ha 同线收据仍为 PENDING stub（`...-mw-e2e-ha.md:3`），无结论可引；不代签 · alone ≠ dual。

### 逐项核对（harness = `harness/c-perf-teardown-product-rootcause-fix.md` @ `1b74fb1`）

- **B1(a) L3 判定程序 · 已解除。**
  - J-1 回溯（`:58-70`）的证据我在 box 上逐条复核过：
    - `/workspace/mw-rv-bf-results/PERF-LOAD.env:6/:10` 的 STARTED / ENDED 为 `21:57:14-07:00` 至 `21:57:35-07:00`，即 2026-09-24 12:57:14–12:57:35 +08:00；`PROVE_EXIT=1` 在 `:9`。
    - `PERF-LOAD-prove.log:10` 的容器名 `meetwise-e2e-1921513-1790225837128`，时间戳换算为 12:57:17 +08:00。
    - `:40` 为 `state_bytes=29 logs_bytes=29`；`run-e2e-isolated.mjs:2021` 中 `'docker_diagnostic_unavailable'` 正好 29 字节，计数逻辑见 `scripts/withheld-output.mjs:8`。
    - `receipts/uc018-receipt-backfill/attempts.jsonl` 中：prove 模式最后一条为 `04:38:14.481Z`；`04:50:34.990Z`–`04:50:35.833Z` 七条均为 `phase=reemit-from-log`（`emit.mjs:252` 分支在 `:304` `process.exit(0)`，到不了 `:505` / `:559`）；`04:57:14–04:57:35Z` 窗口内**无**记录。
    - `PERF-LOAD-cids-before.txt` 为 0 字节。
  - 结论写得诚实：已记录 emit 判 OUT；未记录的并发 emit 与 L2-self 判 UNDETERMINABLE（`:70`），没有夸大。
  - J-2 前向（`:72-88`）每个 attempt 强制采集：`docker events` 写入 `events.jsonl`；`pgrep` 进程采样写入 `procs.txt`；CMD 前 / 后 `docker ps -a`；`prove.log`。判定表把「观测什么 → 来自哪个文件 → 得出什么判定」写清楚了：例如 L3 IN 需要本 run PG 依次出现 kill(9)、die(137)、destroy，且早于首个错误行，且 1 s 内有他 PID 的 emit 进程。采集缺失时记 `J2_EVIDENCE_MISSING`，不计入任何格的通过。
  - J-3（`:90`）用 Inject C 对照 attempt1 签名，并写明「只证能产生同签名，不证因果」。
- **B1(b) attempt1 时序与 L2-self · 已解除。**
  - `:94` 时序与证据一致：box `PERF-LOAD-prove.log` 中 run1 / run2 的 PERF、LOAD 行均为 `passed=true`，`LOAD run2` 之后紧接 `node:events:502`，没有 `PERF run3`，也没有 SUMMARY。proof 循环 `uc-e2e-018-perf-load.proof.ts:441-444` 为 `await runPerf(r); await runLoad(r)`，run 间没有 teardown；`PERF run3:` 行（`:329`）在 run3 PERF 结束时才打印，所以崩溃发生在 run3 PERF 期间。
  - `:95` 读码排除本 run 自有 teardown：runner `:2251-2253` 在 finally 内；capped child 的 `:203` rm 在 `:202` `start -a` 返回之后。
  - `:96` 新增 L2-self，并给出判据（oom，或无前置 kill 的 die）。`principal.ts:915-916/:918` 的超时数值核对无误。
  - `:48` 注明 `b29c191` 时 `principal.ts` 尚无 `on('connect')` / `on('error')`。已核实：`git show b29c191:packages/db/src/principal.ts` 中匹配数为 0；引入提交 `f19ecba`（2026-10-05）。
- **B3 EXIT 矩阵 · 已解除。** `:121-137`：
  - PC 3/3 EXIT 0。
  - A / B / C 三种注入，各配 MUT 与 POST 两格，每格 3/3 EXIT 1，并钉精确日志签名（MUT：`Unhandled 'error' event`、on Client、无 SUMMARY；POST：`db_pool_error` ≥1 且零 unhandled，失败形态限 F1 / F2）。
  - POST 若观测到 EXIT 0，记 `POST_EXIT_UNEXPECTED`，该格 FAIL。依据为 `proof.ts:33` 的 `errMax=0.005`、N=100（核对无误）。
  - 每个 inject 命令自身的 EXIT 都钉为 0，并有输出判据（`:149`）；pre-fix ≡ MUT 的理由已写明（`:123`）；禁止 retry、禁止丢或换 attempt（`:125`）。
- **B4 三注入各自钉值 · 已解除。** `:139-155`：A / B / C 都做，各自钉命令、自身 EXIT、J-2 事件期望、MUT 与 POST 结果。共用触发点 T1 = `^LOAD run2: ` 出现后 ≤1 s（与 proof `:431` 的输出格式一致）；超时记 `INJECT_LATE`。门控条件为非 idle 的 client backend ≥1，10 s 超时记 `INJECT_GATE_TIMEOUT`。`psql -U meetwise -d meetwise` 与 runner `:2184/:2186` 的 `POSTGRES_USER` / `POSTGRES_DB` 一致。MUT = 临时删除 `principal.ts:929`，禁止 commit，跑完 `git diff --exit-code` 须为 0。
- **Cond 1 · 已解除**：`:48` 改为 `:931`，与源码 `principal.ts:931` `pool.on('error', …)` 一致。
- **Cond 2 · 已解除**：`:162` 写明 R2 的数据库来源：一次性本 run 自有 `pgvector/pgvector:pg16` 容器，用显式 `DATABASE_URL`，结束时只 rm 该名；连接失败记 `R2_ENV_FAIL`，不算回归。proof 无 localhost 回退（`pool-error-listener.proof.ts:20` 注释）。
- **runner 行号 +12 · 已核实**：
  - 行号对照：`a1f3614:scripts/run-e2e-isolated.mjs:1714` 对应 tip `:1726`；`a1f3614:2239-2241` 对应 tip `:2251-2253`，内容逐字相同。tip 上 `:2182` 为 `'run', '--rm', '-d'`，`:2175-2176` 为 caps。
  - `git diff a1f3614 c515a8c` 中该文件为 +14/−2（净 +12）；`principal.ts`、`uc018-receipt-backfill-emit.mjs`、`uc018-perf-load-capped-child.mjs` 无改动。
  - capped child `:18/:107/:136-137/:202/:203`、emitter `:252/:304/:505/:559`、`principal.ts:872/:886/:920-931` 均已核实。
- **保留项没有回退**：
  - B2 分层、P-FIX 仅 `principal.ts`、emitter `:559` ≠ product close：`:49-54`、`:109`。
  - B5 回归 R1–R3 EXIT 0，并 Ban 借绿：`:159-165`。
  - B6 隔离真 PG / Linux-native / 串行 / Ban emitter / inject 范围：`:169-175`。
  - attempt1 不洗：`:42`、`:187`；不翻 UC-018 covered：`:180`、`:187`；backlog `:35` 保持 CONDITION OPEN：`:179`、`:199`；Pins 未变：`:4`、`:199`。

### 新阻断

无。

### 非阻塞条件（执行前在 harness 中补齐，或在收据中披露）

1. **A-MUT 命中确定性。** 本仓 `pg-pool@3.14.0` 的行为：
   - `pool.query()` 会给 checkout 的 client 挂上 `client.once('error', onError)`（`node_modules/.pnpm/pg-pool@3.14.0_pg@8.22.0/node_modules/pg-pool/index.js:464`）；
   - 只有 `pool.connect()` 手持的 client 在 checkout 期间没有监听器（`:344` `removeListener`）。`principal.ts:288/:570/…` 有大量 `pool.connect()` 调用。

   因此，Inject A 若只终止了 `pool.query` 路径的 backend，即使在 MUT 下也不会出现 `Unhandled`，A-MUT 格可能诚实地 FAIL。建议二选一：把门控 / 终止条件收窄到 `state='idle in transaction'`（connect 手持的事务）；或在收据中记录被终止 backend 的 `state` / `xact_start` / `query`，用于归因。
2. **J-2 判定表补两行**：
   - 本 run PG 出现 kill→die→destroy，但 `procs.txt` 中没有他 PID 的 emit 进程（非 emitter 的外部删除）：当前没有对应格，应判 `EXTERNAL-OTHER`，计入 UNDETERMINABLE 并披露；
   - C-POST 引用的「L3-sim」（`:135`）应在表中显式列出，要求时间早于首错误行，且发起者为本程序。
3. R2 容器名 `meetwise-e2e-r2pool-*` 落在串行过滤 `meetwise-e2e` 的范围内，须在下一次 prove 前确认已删除，与 `:173` 一致。

### 结论

B1(a)、B1(b)、B3、B4、Cond 1、Cond 2 均已解除，+12 重锚已核实；B2 / B5 / B6 及冻结项没有回退；无新阻断，另有 3 条非阻塞条件。本 PASS 仅为 mw-rag-route 单方 re-PRE：alone ≠ dual，不代签 mw-e2e-ha。coding 仍禁止，须双方 PASS 加协调方 AUTHORIZE。CONDITION（backlog `:35`）保持 OPEN；attempt1 @ `b29c191` 不洗；UC-018 / §1.1 保持 partial。Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。

Verdict: PASS

## Re-PRE3 @083cce4

**时间**：2026-10-06 21:06 +08:00
**REWRITE ×3**：`083cce467657c1499f748f0073eeaee7bdd9392d`（supersedes `1b74fb1`，回应 mw-e2e-ha Re-PRE2 FAIL `20da721` 的阻塞 1 / 2，以及非阻塞项）。fetch 后确认在 origin，是 tip `eb8fb09` 的祖先；只改 4 个 docs（harness、slice、两个 stub）。`882efbc..eb8fb09` 区间 `packages/`、`apps/`、`scripts/`、`package.json` 零改动，所以 `principal.ts`、`run-e2e-isolated.mjs`、emitter、capped child、proof 的行号与 Re-PRE2 时相同。
**审查基**：临时 worktree `/tmp/mwrr-perf-pre3` @ `eb8fb09` · 仅本 box · 只读 · 无 prove / 无 docker 操作 · 未读 `.env*` · 无 live 模型调用。只读核对了 `node_modules/.pnpm/pg@8.22.0`、`pg-pool@3.14.0_pg@8.22.0` 源码，以及 box `/workspace/mw-rv-bf-results/PERF-LOAD-prove.log`。不审 RAG 线；AN-CIMG-EA HOLD。
**本文件历史段**：`## PRE-EXEC @110532e` 起至 `## Re-PRE2 @1b74fb1` 结尾，与 `882efbc` 逐字一致（diff 为空）。
**Peer**：mw-e2e-ha 对 `1b74fb1` 的 Re-PRE2 FAIL 为 `20da721`（`reviews/REQUEST-2026-10-06-an-perf-tear-rewrite2-re-pre-mw-e2e-ha.md`），只引用，不代签；mw-e2e-ha 对 `083cce4` 尚无收据，同线 stub 为 PENDING。alone ≠ dual。

### 自我更正

`20da721` 阻塞 2（warmup 不计错，导致 A/B-POST 的「EXIT=1」依据不成立）是我方 Re-PRE2 `882efbc` 漏掉的。`proof.ts:278` 中 warmup 结果被丢弃，`timedAbandon`（`:198-223`）自己 catch，不抛错。我方在 `882efbc` 中把 B3 判为已解除，并以 `proof.ts:33` 的 `errMax` 作依据，这个判断不完整，在此更正。阻塞 1 我方只列成了非阻塞条件 1，没有覆盖 A-POST 中 `db_pool_error=0` 的分支。

### `20da721` 阻塞项逐条核对

- **阻塞 1 · Inject A 收窄 · 已解除。**
  - **选择条件**：§5.0 `:181`（门控）与 §5.1 `:188`（终止 SQL）都改为 `state='idle in transaction'`。PG 中 `pg_stat_activity.state` 的取值里，`active`、`idle`、`idle in transaction (aborted)`、`fastpath function call` 都是独立字符串，等值比较能把它们全部排除。
  - **源码复核（pg@8.22.0 `lib/client.js`）**：
    - `_handleErrorMessage` 在 `:421-434`：没有 active query 时，`:427-428` 调用 `_handleErrorEvent(msg)`，进而 `emit('error')`（`:417`）；有 active query 时，错误交给 query callback（`:432-433`），不 emit。
    - pg-pool `index.js:344` 在 checkout 时 `removeListener('error', idleListener)`。`pool.query()` 在 `:464-480` 挂 `once('error')`，回调里 `release(err)`；`_release` 在 `:392` 遇到 err 时走 `_remove`，`:181` 调用 `client.end()`，置 `_ending`；随后 socket 'end' 时，`client.js:205` 的 `if (!this._ending)` 不成立，不会 emit。
    - `asPrincipal`（`principal.ts:945-955`）用 `pool.connect()` 手持 client，依次发 BEGIN、SET LOCAL ROLE、set_config、fn、COMMIT，往返间隙中服务端状态为 `idle in transaction`。
    - 因此 A 命中 idle-in-transaction 时：MUT（删 `:929`）下必然 Unhandled，文本为 57P01；POST 下 `:929` 必然记 `db_pool_error`。§5.2（`:195-200`）的描述与源码一致。
  - **A ≠ attempt1 是真实的路径差异，不只是字符串差异**：
    - A 走 FATAL 消息路径（`client.js:428`，错误对象为 57P01 的 DatabaseError）；attempt1 走 socket 'end' 路径（`:199` 构造 `Connection terminated unexpectedly`，`:217` emit）。attempt1 日志 `PERF-LOAD-prove.log:21-37` 的栈正是 `client.js:199:73` → `:417` ← `:217`；全文 `administrator` / `57P01` / `terminating connection` 匹配数为 0。
    - 结论：57P01 出现与否可以区分「A 路径」与「attempt1 路径」。但要注意，它不能证明 attempt1 是 socket 层被杀，见条件 2。
- **阻塞 2 · T1 钉在 seed 阶段 · 已解除（契约层面）。**
  - T1 改为 run3 PERF 的 `seedAbandonTargets`（`:168-173`），并新增阶段期望表（`:156-162`）：seed 阶段 A/B/C-POST 期望 EXIT 1；warmup 着陆记 `INJECT_PHASE_WARMUP`，该格 FAIL，即使碰巧 EXIT 1 也记为相位违规；measured 着陆记 `INJECT_PHASE_MEASURED`，该格 FAIL；C 与阶段无关。`:164` 改写了 EXIT=1 的依据，明确 `errMax` 只约束 measured，warmup 不计错。这与 `proof.ts:274`（seed）、`:278`（warmup 结果丢弃）、`:280-284`（measured）一致。`WARMUP=10`（`:31`）、N=100，所以 seed 共 110 轮，每轮一条 INSERT 加一个 asPrincipal 事务（`:227-246`），且 seed 紧接在 `LOAD run2:` 行之后开始（`:441-444`）。
  - 防假绿：warmup 着陆即使 EXIT 0，也会因 `POST_EXIT_UNEXPECTED`（`:164`）或 `INJECT_PHASE_WARMUP` 被判 FAIL，不能当证据，符合 `north-star-hard-gates.md:46/:117`。
  - 阶段的**可观测性**仍有缺口，见条件 1。这个缺口只影响标签是否准确，不会造成假绿：POST 格的 EXIT 0 在任何阶段都 FAIL；MUT 格在哪个阶段着陆都不改变「删 `:929` → Unhandled」这一被测性质。
- **C 保留**：`:188`、`:192-193`、`:153-154`；C-POST 必须判为 J-2 的 L3-sim（`:105`、`:154`）。
- **非阻塞项已钉入**：
  - NB-1：restart -t0 竞态，收据必录实际文本（`:206`）；B-MUT 允许两种文本（`:151`）。
  - NB-2：`INJECT_MISS`（`:189`、`:207`）。
  - NB-3：J-2 新增 EXTERNAL-OTHER 与 L3-sim 两行（`:105-107`）。
  - NB-4：R2 的 `meetwise-e2e-r2pool-*` 须在下次 prove 前删除（`:209`、`:229`）。

### 已解除项 · 无回退

- B1(a) J-1 / J-2 / J-3、B1(b) 时序与 L2-self：§2.1 / §2.2 只增加了两行判定表和 T1 的 seed 约束，其余不变。
- L1 `principal.ts:928-931`（`:65`；`:931` 为 `pool.on('error')`，源码未变）。
- R2 数据库来源（§6）。
- +12 重锚：`:1726` / `:2182` / `:2251-2253`，源码未变。
- B2：P-FIX 仅 `principal.ts`，emitter `:559` ≠ product close。
- B5：R1–R3 EXIT 0。
- B6：隔离真 PG / Linux-native / 串行 / Ban emitter（`:229`）。
- attempt1 不洗；不翻 UC-018 covered。
- backlog `:35` 保持 CONDITION OPEN（`:57`、`:235`）。
- Pins 未变（`:4`、`:255`）；PG only，无 MySQL / Qdrant / FULLTEXT。

### 新阻断

无。

### 非阻塞条件（执行前在 harness 中补齐，否则 A 格大概率记 `INJECT_MISS` / 相位 FAIL，浪费一次 prove）

1. **阶段判定须有确定的观测源。**
   - 现状的问题：
     - A 的门控只看 `state='idle in transaction'`；但 warmup / measured 阶段的 API 请求同样走 `asPrincipal`（`interview.service.ts:196/:358/:390`），同样会产生 idle-in-transaction，所以这个条件并非 seed 专有。
     - B/C 门控（`:182`）的 OR 项中只有 `INSERT INTO interview%` 是 seed 专有，`SET LOCAL ROLE%`、`set_config('app.principal_user'…)`、`idle in transaction` 都不是。
     - 阶段表 `:160` 中「尚未出现 HTTP abandon 痕迹」没有定义观测源。
     - §5.1 A 的命令只返回 `count(pg_terminate_backend(pid))`，无法满足 `:170` 要求记录的「被选 backend 的 state / xact_start / left(query,60)」。
   - 建议：在终止的同一条 SQL 中，用 CTE 一次性返回 `pid, state, xact_start, left(query,60)` 与 `pg_terminate_backend(pid)`；同时在同一快照里查 `interview` 中 `id LIKE 'IV_P018_R3_%'` 的行数与非 active 行数（容器内 `meetwise` 为超级用户，不受 RLS 影响）。判定：行数 <110 且非 active 行数为 0 → seed；行数 =110 且非 active 行数 ≤10 → warmup；否则 measured。
2. **A ≠ attempt1 的表述须收窄。**
   - A-POST 日志里同样会出现 `Connection terminated unexpectedly`。原因：57P01 被 `:929` 观测之后，socket 'end' 走到 `client.js:205/:216-217`（`_connectionError` 为假），再次 emit 一个**新的** Error 对象；`observePoolError` 按对象身份去重（`principal.ts:889-890`），所以会第二次记 `db_pool_error`。A-POST 的签名不得要求该文本缺席，判别依据只能是「57P01 出现」。
   - `:193` 写「attempt1 = socket 'end'」过于绝对。服务端 FATAL 命中某个 connect client 的 active query 时（`client.js:432-433`），之后同样会走 `:199/:217`，产生同一文本；`idle_in_transaction_session_timeout` 的 FATAL 25P03（`principal.ts:916`）也会如此。所以 attempt1 的文本只能排除「FATAL 落在 idle client」这一种情形，不能单凭文本判定 L3 / L2-self。归因仍以 J-2 的 docker 事件为准，这一点 §2.1 已有。
   - A-MUT 存在竞态：若 FATAL 到达时 client 恰好已发出下一条查询，就会得到 `Connection terminated unexpectedly` 而没有 57P01，该格 FAIL。须如实记录，禁止换 attempt。
3. **INJECT_MISS 可行性。** idle-in-transaction 只存在于 asPrincipal 各次往返之间，每段为亚毫秒到毫秒级；seed 共 110 轮，紧接在 `LOAD run2:` 之后。现稿中门控与终止是两次独立的 `docker exec psql`，两次之间隔着进程启动延迟，T1 第 1 步（`:169`）也删去了原来的「≤1 s」上限。建议把「轮询 + 终止」合并为容器内的单次 psql 调用（例如 plpgsql 循环，配 `pg_sleep(0.005)`，见到第一个目标立即终止并返回快照），并恢复反应时间上限。
4. **LOOP §3③ 辅助命令的期望 EXIT。** 以下命令须补上 EXIT 0 及输出判据：R2 一次性容器的 `docker run` / `docker port` / 结束时的 `docker rm -f <该名>`（`:162`），NB-4 清理用的 `docker rm -f`（`:209`），以及 J-2 采集用的 `docker events` / `pgrep` / `docker ps`。

### 结论

`20da721` 的两个阻塞都已在契约层面解除：A 已收窄到 idle-in-transaction，并改用 57P01 签名，与 pg@8.22.0 / pg-pool@3.14.0 源码一致；T1 已钉在 seed 阶段，warmup 着陆的 EXIT 0 不能作为证据。各非阻塞项已钉入，此前已解除的项目无回退，无新阻断。4 条条件中，条件 1 与条件 3 决定 A 格能否真正产出可判定的证据，强烈建议在 AUTHORIZE 前补齐。本 PASS 仅为 mw-rag-route 单方 re-PRE：mw-e2e-ha 对 `083cce4` 尚无收据，alone ≠ dual，不代签。coding 仍禁止，须双方 PASS 加协调方 AUTHORIZE。CONDITION（backlog `:35`）保持 OPEN；attempt1 @ `b29c191` 不洗；UC-018 / §1.1 保持 partial；gap ≠ covered。Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（无 MySQL / Qdrant / FULLTEXT）· public DELETE=503。

Verdict: PASS

## Re-PRE4 @b5633f0

- 审查人：mw-rag-route（独立复核；alone≠dual，不代签 mw-e2e-ha）
- 时间：2026-10-06 21:33 +08:00
- 输入：REWRITE_SHA `b5633f0`（supersedes `083cce4`；docs-only 4 文件：harness / slice / 两个 stub）· 引用 mw-e2e-ha Re-PRE3 FAIL `70cba94` · 我方 Re-PRE3 PASS `dbed2f2`（条件 C1–C4）
- 审查基：box 临时 worktree `/tmp/mwrr-perf-pre4`（detached @ origin tip `a1de77d`，含 `b5633f0`），完成后已移除。docs/source-only：未运行 prove，未执行任何 docker 命令，未触碰 .env*，未调用模型，未写 git config。
- 源码核对：`node_modules/.pnpm/pg@8.22.0`、`pg-pool@3.14.0_pg@8.22.0`、`principal.ts`、`run-e2e-isolated.mjs`@`ac03f30`、`uc-e2e-018-perf-load.proof.ts`。`ac03f30..b5633f0` 在 packages/apps/scripts/package.json 下零改动；`083cce4..ac03f30` 中 principal.ts、PERF proof、_neg-harness 零改动（`git diff --quiet` EXIT 0）。
- 补充说明：我在 box 上用 Node v20.19.2 跑了两段纯 Node 语义小脚本（无 DB、无 docker、非 prove），见 §1。
- 对端：mw-e2e-ha Re-PRE4 PASS `2900c46`，仅引用，不代签。

### 1. `70cba94` 新阻塞 1（B/C-MUT）→ 契约层已解除

- MUT-ZERO 定义（harness :156-159）：同删 `principal.ts:929`（`client.on('error')`）与 `:931`（`pool.on('error')`），施加判据为 `2 deletions(-)`。全仓 API 进程中 `createPool` 仅 `apps/api/src/platform/db.service.ts:7` 一处，`h.pool` 即该池；apps/api/src、packages/db/src、_neg-harness 中除 :928-931 外无其他 `on('error'|'connect')`。MUT-ZERO 下确为零观测者。
- 源码路径逐条成立：
  - idle client 经 pg-pool `index.js:51-62` idleListener 触发 `:62` `pool.emit('error')`，无监听时抛出。BoundPool 来自 `pg/lib/index.js:14`。
  - checkout 时 `index.js:344` 去掉 idleListener。asPrincipal（`principal.ts:945-955`）事务间隙经 `client.js:198-217` 或 `:427-428` → `:417` emit，无监听 → Unhandled on Client。
  - asPrincipal 遇 active query + FATAL：`:432-433` 回调 → `:954` catch 发 ROLLBACK 并挂起 → 'end' 时 `:205` `_ending` 为假 → `:217` emit → Unhandled on Client。
  - pool.query（`index.js:455-464` `once('error')`）接住自身 client；释放路径 `:384-397`。
- 本地 Node 语义核对（v20.19.2）：
  - 异步回调内对无监听 emitter emit Error，stderr 含 `throw er; // Unhandled 'error' event` 与 `Emitted 'error' event on Client instance`；子类名为 BoundPool 时打印 `on BoundPool instance`。
  - 模拟 POOLQUERY_RACE：先到的回调拒绝 TLA 链，进程在下一个回调分发前以 EXIT 1 退出，无 Unhandled，栈含 `at async seed…`（pg-pool `index.js:42-46` 的 `captureStackTrace` 保证 seed 帧可见）。
  - 结论：§5.2b :272-278 推导成立，残余竞态真实存在，并已事前钉为 `INJECT_KIND_POOLQUERY_RACE` 格 FAIL。
- 防假绿：B/C-MUT 命中需同时满足 Unhandled、`db_pool_error=0`、无 SUMMARY、`RAW_EXIT=1`，且施加前 diff 恰为 2 deletions。MUT-929 误用会因 idle 路径经 `:931` 记 `db_pool_error` 而落 `MUT_NOT_APPLIED`；POST（socket 路径）`:929` 先挂 → `db_pool_error≥1`。因此不能假绿，MUT/POST 有判别力。
- idle_n≥1：在门控同一条语句内测量（§5.0 :201、§5.1a :226-228），时点正确。它是服务端代理量，见 NB-1。

### 2. C1–C4（我方 `dbed2f2` 条件）

- C1 已落实：§5.1a :217-253 用单条 `WITH iv/idle/tgt/k … SELECT … INTO r`，同时返回 pid/state/xact_start/left(query,60)、`pg_terminate_backend`、`IV\_P018\_R3\_%` 行数 / 非 active 行数 / idle_n。`tgt`、`k` 各被引用两次 → 物化一次，每行只终止一次；非 seed 不终止（:256）。seed id 为 `${prefix}_${i}_${S}`、prefix `IV_P018_R${run}`（proof :230/:273），以 `status='active'` 插入（:233），阶段规则见 :177-179。
- C2 已落实：A-MUT :166 与 A-POST :167 只以 57P01 存在为判据，永不以 CTU 缺席作判据；A 竞态 → `A_FATAL_ON_ACTIVE` 格 FAIL 计入、如实记录；attempt1 归因只依 J-2（:212）。
- C3 已落实：§5.0 :196 单次 `docker exec -i … psql` `DO` 循环（`pg_stat_clear_snapshot()`、5 ms、10 s 上限 → `INJECT_GATE_TIMEOUT`）；`INJECT_MISS`（k=0）见 :208/:288；禁止两次 exec（:308）。但反应上限的取值见阻塞 1。
- C4 已落实：§5.4 :293-306 给出 R2 run/port/pg_isready/rm、NB-4 清理、J-2 events/pgrep/ps 前后、B 端口、MUT 施加/还原的期望 EXIT 与输出判据，偏离 → `AUX_EXIT_UNEXPECTED`。`wait=143` 假设见 NB-3。

### 3. runner +18 重锚 @ac03f30：成立

- 逐行实测：`:1744` 容器名、`:2039` `docker_diagnostic_unavailable`、`:2193-2194` caps、`:2200` `run --rm -d`、`:2214` `E2E isolated PostgreSQL:` 打印、`:2269` finally / `:2270` 诊断 / `:2271` 自有 `rm -f`。与 `083cce4` 的 `:1726/:2021/:2175-2176/:2182/:2251-2253` 内容逐字一致。
- 插入块为 `+15 @:1286-1300`、`+1 @:1466`、`+2 @:1712-1713`，合计 +18。
- 另有一处未披露的单行改写 `:2220`（migrate 列表追加 `rag03-filter-locus:prove:raw`），不产生偏移、不影响 uc018 target（NB-4）。

### 4. Cleared stay

- harness §2 / §6 / §7 的 `083cce4..b5633f0` 改动仅为行号重锚。B1(a)(b)、`:931` 归属、R2 DB source、B2/B5/B6 无回退。
- `20da721` 阻塞 1/2 保持解除：Inject A 仍为 `idle in transaction` + 57P01 + MUT-929（:157/:200/:280），T1 仍为 seed，`INJECT_PHASE_WARMUP` FAIL 格保留，C keep。
- backlog `gap-bug-backlog.md:35` 在 `083cce4..b5633f0` 零改动，CONDITION OPEN。
- 我方历史段字节不变（`70cba94..b5633f0` 对本文件的改动仅在 core 头部与新增 Rewrite ×4 note）。

### 5. 阻塞项

#### 阻塞 1：T1=seed 的时间窗与钉定的反应上限 / 余量量级不符，seed 着陆 3/3 不可推出

本仓已提交的同一 proof 实测记录（`ai-docs/delivery/receipts/uc018-perf-load/nhp-018-perf-01-run3.json` / `nhp-018-load-01-run2.json`；proof 自 `b29c191` 引入后从未改动，caps 同为 `--cpus 2 --memory 4g`）：
- LOAD run2 结束于 2026-09-24 10:46:15.205 +08:00。
- PERF run3 从同一毫秒开始，到 10:46:15.635 +08:00 结束，全程 430 ms（含 seed 110 轮 + warmup 10 + measured 100）。
- measured 墙钟按 rawLatenciesMs 总和 2166 ms / c=10 ≈ 217 ms，因此 seed ≤ 约 213 ms，约 ≤1.9 ms/轮；10 轮余量 ≤ 约 19 ms。
- `asPrincipal` / `seedAbandonTargets` 热路径自 `b29c191` 以来无改动（principal.ts 仅新增监听与 purpose）。

与 harness 钉值对照：
- T1 第 2 步与 C3（:29/:189）的反应上限是 `^LOAD run2:` 检出 → psql 启动 ≤ 1 s。这比整个 PERF run3（430 ms）还长，约为 seed 窗口的 5 倍。日志检出、docker attach 转发、docker exec 起 psql 的延迟都落在这个量级内。只要 psql 晚于约 0.2 s 启动，A 就只能记 `INJECT_PHASE_*`，B/C 只能记 `INJECT_GATE_TIMEOUT`（iv_rows 已为 110），这些都是格 FAIL。
- B/C 门控（:181/:201）要求 `iv_rows≤100`（“≥10 轮 seed 余量”），而 kill 还要再经过 psql 退出、docker exec 收尾和一次 docker CLI 往返。10 轮约 ≤19 ms，与 CLI 往返不在一个量级。B/C-POST 几乎必然记 `INJECT_PHASE_DRIFT`。
- 后果：这不会产生假绿，因为相位违规均钉为 FAIL。但 A-MUT/A-POST/B-POST/C-POST，以及门控失败时的 B/C-MUT，都会被 harness 时序而非产品行为系统性判 FAIL。矩阵无法得出 P-HOLD / P-FIX 结论。这与 `70cba94` / `20da721` 的阻塞同类（3/3 不可推出），且在配额收尾期会可预见地浪费 18 次 inject attempt。
- docs 内修复建议（AUTHORIZE 前写死，Ban 事后改）：
  - (a) 容器内单次 psql 循环提前启动，例如在 `^PERF run2: ` 或更早出现时启动。门控键 `IV\_P018\_R3\_%` 在 run3 seed 前恒为 0，本身相位安全。10 s 上限改为覆盖 LOAD run2 的时长（约 0.3 s，取充足倍数）。删除或替换“LOAD run2 后 ≤1 s”上限，改为“LOAD run2 行出现时循环已在运行”的可观测判据。
  - (b) B/C 余量按公式钉死：`iv_rows ≤ 110 − ceil(k·L_cli / t_round)`。`t_round` 取上述收据推算或执行前实测，`L_cli` 取执行前一次 docker CLI 往返基线，k 为安全倍数，取值须事前写入。或者证明 B/C-POST 不依赖 seed 着陆，并相应改写期望。
  - (c) 在 harness 中写明 seed 时长的证据来源与数值，不得只写“≥10 轮余量”。

#### 阻塞 2：C-POST 相位期望自相矛盾

- 阶段期望表 :178-179 中，C-POST 在 warmup / measured 着陆的期望为 EXIT 1 “OK keep”。
- :181 规定 B/C-POST 落点复核须 F2 栈含 `seedAbandonTargets`，缺失即 `INJECT_PHASE_DRIFT` 格 FAIL。
- 同一 C-POST 在非 seed 着陆时，一处判通过、一处判 FAIL，留下事后选择空间，违反“钉死 · Ban 事后按观测改”。按阻塞 1 的时序证据，这一情形大概率会被实际触发。须写明唯一优先规则。

### 6. 非阻塞

- NB-1：idle_n≥1 不充分（同意 peer `2900c46` NB-e）。seed 自身 client 在 checkout 间隙即为 `state='idle'`，可单独满足条件，因此建议改为 `idle_n≥2`。若不改，该情形落 RACE（FAIL），不会假绿，但会把“池内无他 idle client”误标为竞态。
- NB-2：`Emitted 'error' event on Client instance` 不是 pg 专有（undici 等也有 Client 类）。建议同时要求 Unhandled 栈含 `pg/lib/client.js` 或 `pg-pool/index.js` 帧。
- NB-3：`docker events` / pgrep 循环在 SIGTERM 下 `wait=143` 是未验证假设（同意 peer NB-g）。须在 AUTHORIZE 前写死可接受值集合。
- NB-4：runner `:2220` 单行改写未在重锚披露中列出（无偏移、无影响），建议补一句。
- NB-5：“同一 microtask 检查点”宜改为“该 socket 回调后的 nextTick/microtask 排空内、下一回调分发前”（同意 peer NB-h）；结论不变，已由本地 Node 语义核对佐证。

### 7. 自我更正

我方 Re-PRE3 `dbed2f2` 只要求阶段观测源（C1）与单次 psql（C3），未核对 seed 实际时长与 1 s 反应上限 / 10 轮余量的量级关系，属遗漏。本次依据仓内已提交收据补正。

### 8. 状态

- `70cba94` 新阻塞 1 在契约层已解除；C1–C4 已落实；runner +18 重锚成立；cleared stay 无回退。
- 新增阻塞 1（seed 时间窗 vs 反应上限 / 余量）与阻塞 2（C-POST 相位期望矛盾），均可在 docs 内修复，不要求 prove。
- 对端 mw-e2e-ha Re-PRE4 PASS `2900c46` 仅引用、不代签。本方 FAIL → dual 不成立。Ban coding，直至 dual PASS + 协调员 AUTHORIZE。
- backlog `:35` C-PERF-TEARDOWN CONDITION OPEN；attempt1 @ `b29c191` 不洗；UC-018 / §1.1 partial；gap ≠ covered。
- Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（无 MySQL / Qdrant / FULLTEXT）· public DELETE=503。

Verdict: FAIL

## Re-PRE5 @771ca84

- 审查人：mw-rag-route（独立复核；alone≠dual，不代签 mw-e2e-ha）
- 时间：2026-10-06 21:47 +08:00
- 输入：REWRITE5_SHA `771ca8475cfbcb7efe9ce99137305da76305279b`（supersedes `b5633f0`；docs-only 4 文件）· 引用我方 Re-PRE4 FAIL `a07256c`（阻塞 1 时序、阻塞 2 C-POST 矛盾）
- 审查基：box 临时 worktree `/tmp/mwrr-perf-pre5`（detached @ origin tip `771ca84`），完成后已移除。docs/source-only：未运行 prove，未执行 docker 命令，未触碰 .env*，未调用模型，未写 git config。
- 源码与收据：`a07256c..771ca84` 在 packages/apps/scripts/package.json 下零改动（`git diff --quiet` EXIT 0）。另用一段纯 Node 小脚本（Node v20.19.2，无 DB、无 docker）核对 pg Client 的 Unhandled 输出帧。
- 历史段：我方 `## PRE-EXEC @110532e` 起的历史段与 `a07256c` 逐字一致（diff EXIT 0）；core 只改了头部。
- 对端：截至 origin `771ca84`，mw-e2e-ha 尚无 Re-PRE5 收据。其上一份为 Re-PRE4 PASS `2900c46`，仅引用，不代签。

### 1. 阻塞 1（时序）→ 已解除

- 预启动触发点存在且早于 seed：
  - proof :328-331 打印 `PERF run${run}: …`；主循环 :441-444 的顺序为 PERF run1 → LOAD run1 → PERF run2 → LOAD run2 → PERF run3（seed :274）。
  - attempt1 的 `PERF-LOAD-prove.log:17-20` 中 `PERF run1:` / `LOAD run2:` 行均在行首、无前缀，`^PERF run1: ` 可匹配。
  - harness :220（T1 第 1 步）在首见该行即启动唯一一次容器内循环。
- 不会提前起爆：
  - 门控键只数 `IV\_P018\_R3\_%`；run1/run2 用 `IV_P018_R1_`/`R2_`（:273），LOAD 用 `IV_L018_R<n>_`（:338）；PG 为每次 prove 新建的隔离容器。
  - `iv_rows=0` 时，A 的 `k`（:353，`iv.n BETWEEN 1 AND 109`）不调用 `pg_terminate_backend`，A 与 B/C（§5.0c :293-308）各分支都不成立，只轮询（:317/:378）。
- “循环已在运行”可观测：
  - 判据是 `GATE_LOOP_START … iv_rows=0` 且 `t0_ms < t_load2`（:221，:341/:280）。
  - 宿主检出存在延迟，单看 `t0_ms < t_load2` 不足以证明循环早于 seed，但 `iv_rows(start)=0` 这一项把关：循环若晚于 run3 首条 INSERT 才启动，n0 就会 ≥1，从而记 `INJECT_LATE`。判据成立。
  - 10 s 上限覆盖收据 ≈1.0 s + ≲0.21 s（:229）。
- 时序证据表（§5.0a :240-250）逐项按已提交收据复算，全部一致：
  - perf-01-run3：02:46:15.205Z → 15.635Z（10:46:15.205 → 15.635 +08:00），430 ms；`rawLatenciesMs` 总和 / 10 = 216.60 ms；seed 上界 213.4 ms，1.940 ms/轮；扣 10×min(5.90) 后为 1.404 ms/轮。
  - perf-01-run2：439 ms；231.06 ms；min 5.49；1.391 ms/轮。
  - perf-01-run1：2.014 ms/轮。
  - load-01-run2：02:46:14.931Z → 15.205Z，274 ms，且 `end` 与 perf run3 `start` 同毫秒。
  - perf run1 `end` → load run2 `end` = 1006 ms。
- B-POST 余量公式（§5.0b :256-269）：
  - 方向正确。取最小 t_round=1.39 ms，在同一延迟下多算轮数，因此更早起爆，偏保守。k=2 覆盖实际每轮快至约 0.7 ms 或实际延迟约 2·L_cli 的情形。
  - U_min=6 由 6 ms 轮询周期推出，合理。L_cli、U_B 在第一个 B-POST 前一次写死，禁止重测或改动（:264/:431）。
  - 公式只决定何时起爆；是否着陆 seed 由独立的唯一规则判定（:268），公式偏差最多导致诚实 FAIL，不能制造绿。判定：公式成立。
- `BC_MARGIN_INFEASIBLE` 是诚实的非绿结果：
  - 不执行，格 FAIL ×3，标为 harness-timing，不作产品信号或 P-FIX 依据。
  - 不得宣称 P-HOLD 全格达标，CONDITION OPEN（:266）。
  - 禁止不计入或换 attempt（:431），Non-claims :471 写明 U_B 未计算。
  - 判定：不可能计为 PASS 或 covered，接受。

### 2. 阻塞 2（C-POST）→ 已解除，每格唯一规则

- C-POST 与阶段无关：
  - 矩阵 :191、阶段表 :195-199 的 C-POST 列、观测源 :203、§4.1 :209-214、注入表 :330 五处一致。
  - 不要求 F2 或 `seedAbandonTargets`，不判 DRIFT；任一阶段出现 EXIT 0 → `POST_EXIT_UNEXPECTED` FAIL。
- B-POST 保留更严的唯一规则：
  - :189、:198-199、:202 规定 seed 着陆 ⇔ F2 ∧ 无 `^PERF run3: ` 行 ∧ 栈含 `seedAbandonTargets`，否则记 DRIFT。
  - 依据经源码核对：seed :274 之后，warmup :278 与 measured :280 只经 `timedAbandon`（:198-225，try/catch 不抛）；:281-331 无 DB await，只有计算、`writeReceipts` 与打印。所以 `PERF run3:` 之前带 `seedAbandonTargets` 帧的顶层 rejection 只能来自 run3 seed；LOAD run3 的 seed 已在该行之后，被排除。
- ×4 旧规则显式作废（:205），Ban 并用（:431）。全文残留的 `iv_rows≤100` 只出现在 ×5 note 与证据表的历史引用中，没有作为现行规则（:27/:246）。
- 阶段无关的 C-POST 仍不能假绿：
  - EXIT 0 → FAIL；须 `db_pool_error≥1`（唯一发射点 `principal.ts:896`，只能来自 :929/:931 观测者，天然 pg-pool 来源）。
  - 须零 Unhandled（任何 Unhandled 均 FAIL，比要求 pg 帧更严），并须 `state_bytes=29 logs_bytes=29` 与 J-2 L3-sim（kill(9)→die(137)→destroy 早于首错误行）。
  - 若 :929 或 :931 失效，idle 路径或 checkout 路径必出现 Unhandled → FAIL。

### 3. NB 落实

- NB-1 `idle_n≥2`：已落实（:234、§5.0c :294、:391）。
- NB-2 pg 帧：已落实，A/B/C-MUT 均有（:186/:188/:190），缺失 → `UNHANDLED_NOT_PG`。用法须澄清，见条件 C-a。
- NB-3 `wait∈{143,0}`：接受。
  - 该值是 `docker events` / pgrep 循环这两个采集进程自身被 `kill -TERM` 后的退出码，与 PG 容器以 SIGKILL 还是优雅方式停止无关。143 表示默认动作被 SIGTERM 终止；0 表示 CLI 捕获 SIGTERM 后正常退出。采集进程若被 SIGKILL，应为 137，仍落 `AUX_EXIT_UNEXPECTED`。
  - PG 容器的停止方式与 C 的 L3-sim 归因只看 `events.jsonl` 内容（`kill` 的 signal=9、`die` 的 exitCode=137、`destroy`），因此接受 0 不削弱 C 的归因；事件缺失时 L3-sim 不成立 → 格 FAIL。
  - 唯一歧义见条件 C-b。
- NB-4 runner `:2220`：已披露（:33），实测为同行追加、无偏移。
- NB-5 竞态措辞：已改（:396），结论不变。

### 4. Cleared stay

- MUT-929 / MUT-ZERO（:176-179）、C1–C4、+18 锚（runner、principal、proof 在 `ac03f30..771ca84` 零改动）、B1(a)(b) 与 §2（`b5633f0..771ca84` 无改动）、`:931` 归属、R2、B2/B5/B6、A 的 T1=seed（A 的终止与快照同一语句，:353/:358）均无回退。
- backlog `:35` 逐字未变（`b5633f0..771ca84` 中 backlog 仅有 RAG nail `1024bfc` 改动的 :71 与追加段），CONDITION OPEN。
- §3③：新增命令都有期望 EXIT（`L_cli` 基线 :427、预启动注入程序 :428、门控 psql :326）。例外见条件 C-b。

### 5. 阻塞项

无。

### 6. 条件（不阻断，执行前写入执行脚本或收据口径）

- C-a：NB-2 的“Unhandled 栈帧”须明确包含 Node 输出中的 `Emitted 'error' event on … instance at:` 段。
  - 纯 Node 核对：调用真实 pg Client 的 `_handleErrorMessage`（57P01、无 active query），该段首帧为 `pg/lib/client.js:417`（`_handleErrorEvent`）与 `:428`。
  - 但真实 FATAL 的 DatabaseError 由 pg-protocol 的 parser 构造，其自身栈帧不含 `pg/lib/client.js`。若只扫错误自身的栈，A-MUT 会被误判 `UNHANDLED_NOT_PG`。
  - 这只会造成假 FAIL，不会假绿。BoundPool 路径的该段首帧为 `pg-pool/index.js:62`。
- C-b：J-2 的 `kill -TERM <pid>` 须钉期望 EXIT 0（证明采集进程在被终止时仍在运行）。否则 `wait=0` 无法区分“捕获 SIGTERM 正常退出”与“流提前自行结束”。后者即使发生，也会因 events 缺失而使 L3-sim 不成立，所以不构成假绿。
- C-c：U_B 与 L_cli 落 `margin.json` 时同时记录宿主 docker 版本，便于复核。

### 7. 状态

- `a07256c` 阻塞 1、阻塞 2 真实解除；NB-1..5 落实；cleared stay 无回退。
- 本方 Re-PRE5 PASS（单方，docs gate）。mw-e2e-ha 对 `771ca84` 尚无收据，dual 未成立。Ban coding，直至 dual PASS + 协调员 AUTHORIZE。
- backlog `:35` C-PERF-TEARDOWN CONDITION OPEN；attempt1 @ `b29c191` 不洗；UC-018 / §1.1 partial；gap ≠ covered。
- Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（无 MySQL / Qdrant / FULLTEXT）· public DELETE=503。

Verdict: PASS
