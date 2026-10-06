# REQUEST — **C-PERF-TEARDOWN · product rootcause fix** · pre-exec · mw-e2e-ha

**AUTHORIZE**: coding+prove @ REQUEST `771ca84` · PRE dual BOTH PASS（mw-rag-route Re-PRE5 `683d946` · mw-e2e-ha Re-PRE5 `fef9408`）· 条件 C-a（=e2e C-1 · Unhandled 扫描含 `Emitted 'error' event on … instance at:` 段）/ C-b（J-2 `kill -TERM` EXIT 0）/ C-c（margin.json 录 `docker version`）**已于 prove 前落 harness**（`## AUTHORIZE · 条件落地`）· **POST Verdict PENDING**（awaiting post_prove_dual · implementer 不代填 PASS · Ban self-nail · CONDITION `:35` OPEN）
**Status (PRE history)**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **×5 re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-rag-route` · 本专家既有 Re-PRE4 PASS `2900c46` @b5633f0 **不代签自身为 dual** · peer FAIL `a07256c` cited）
**Rewrite ×5**: **supersedes REQUEST `b5633f0`**（`b5633f0f20e887ce733d1d3778dedf48357ef176` · itself superseded `083cce4`→`1b74fb1`→`553cfc5`→`110532e`）· cites mw-rag-route Re-PRE4 FAIL **`a07256c`**（`a07256c1809f30c9ae8bda6c98fab69760cb41a7`）**阻塞 1 TIMING + 阻塞 2 C-POST addressed** · peer mw-e2e-ha Re-PRE4 PASS `2900c46`（`2900c46ef6f12258dcbc957c0273722ea83a6a47`）cited not co-signed · NB-e..i / NB-1..5 pinned · cleared items retained · Ban coding · CONDITION OPEN
**Rewrite ×4**（history）: **supersedes REQUEST `083cce4`**（`083cce467657c1499f748f0073eeaee7bdd9392d` · itself superseded `1b74fb1`→`553cfc5`→`110532e`）· cites mw-e2e-ha Re-PRE3 FAIL **`70cba94`**（`70cba947798c7fb33f7fa4a8a1ec8609ef6bc610`）**新阻塞 1 B/C-MUT addressed via (ii)** · peer `dbed2f2` 条件 1–4 = C1–C4 pinned · cleared items retained · Ban coding · CONDITION OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual · PASS `882efbc` @1b74fb1 **仅引用不代签**）
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

## 请审什么（mw-e2e-ha · re-PRE ×5 · 仅 `a07256c` 两阻塞 + NB + 保留项核对）

Line AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause。本 stub = **re-PRE rewrite ×5**（supersedes `b5633f0` · cites FAIL `a07256c`）。harness = `harness/c-perf-teardown-product-rootcause-fix.md`（rewrite ×5 note · §4 矩阵 + 阶段表 + 观测源段 · §4.1 · §5 T1 · §5.0 · §5.0a/b/c · §5.1a · §5.2b · §5.4）。请审：

1. **阻塞 1 TIMING (a) 预启动**：容器内**单次** psql 循环在 `^PERF run1: ` 检出即启动（按收据 ≈1006 ms 先于 `^LOAD run2: `）；门控键 `IV\_P018\_R3\_%` run3 seed 前恒 0 → 相位安全；「LOAD run2 → psql ≤1 s」删除，改为可观测判据 `GATE_LOOP_START iv_rows=0` ∧ `t0_ms < t_load2`（否则 `INJECT_LATE`）；10 s 上限 ≈36× LOAD run2（274 ms）· `INJECT_NOT_REACHED`。
2. **阻塞 1 TIMING (b) 公式**：唯一依赖 seed 着陆的 B/C 格 = B-POST · `U_B = min(109, 110 − ceil(k·L_cli / t_round))` · k=2 · t_round=1.39 ms（收据最紧上界 · 取小保守）· `L_cli` = 执行前 5× `docker version` 最大值 · `U_min=6` · `U_B<6` → `BC_MARGIN_INFEASIBLE`（不执行 · FAIL×3 · harness-timing）· `INJECT_GATE_MISSED_MARGIN`；B-MUT / C-MUT / C-POST `ub=109`（与阶段无关）；§5.0c B/C 门控 SQL 全文写死（`SET inj.ub`）。
3. **阻塞 1 TIMING (c) 证据**：§5.0a 表 · 430 ms / measured ≥216.6 ms / seed ≲213 ms / ≈1.9 ms/轮 / 10 轮 ≲19 ms / LOAD run2 274 ms · 收据 `receipts/uc018-perf-load/nhp-018-perf-01-run3.json` · `nhp-018-load-01-run2.json`（+run1/run2）。
4. **阻塞 2 C-POST 唯一规则**：C-POST **与阶段无关 OK keep**（§4.1 推导 · PG 永久消失 → EXIT 1 · `db_pool_error`≥1 · 零 Unhandled）· 不要求 F2/`seedAbandonTargets` · 无 DRIFT · EXIT 0 → `POST_EXIT_UNEXPECTED`；B-POST 落点复核 = F2 ∧ 无 `^PERF run3:` ∧ `seedAbandonTargets`（排除 LOAD run3 seed 假阳）· 阶段表 / §4 矩阵 / 观测源段三处一致。
5. **NB**：`idle_n≥2` · A/B/C-MUT Unhandled 栈帧含 `pg/lib/client.js`|`pg-pool/index.js`（否则 `UNHANDLED_NOT_PG`）· J-2 `wait` ∈ {143, 0} · runner `:2220` 同行追加披露（无偏移）· 竞态措辞「socket 回调后 nextTick/microtask 排空内、下一回调分发前」。
6. **Cleared stay**：(ii) MUT-ZERO B/C · Client|BoundPool · `db_pool_error`=0 · POOLQUERY_RACE · C1–C4 · Inject A idle-in-txn + 57P01 + MUT-929 · T1 seed · `INJECT_PHASE_WARMUP` · runner +18 @`ac03f30` · B1/B2/B5/B6 · R2 · `:931` · backlog `:35` OPEN。本 stub **不**触碰 AN-RAG-R3 文件。

刀界：≠ Line AE residual redo · ≠ Line S Branch A 复跑刀（只读 cite）· ≠ AN-RAG-R3 · **Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN · 不代签 peer `mw-rag-route` · alone ≠ dual。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code · Ban commit MUT · Ban invent product loci · Ban MySQL/Qdrant/FULLTEXT · Ban touch AN-PRIV-EXT/MOP/RAG product · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban 用 `state<>'idle'` 跑 A · Ban 要求 A 复现 attempt1 文本 · Ban B/C-MUT 用 MUT-929 · Ban 把 POOLQUERY_RACE 不计入/换 attempt · Ban CTU 缺席判据 · Ban「LOAD run2 → psql ≤1 s」/ 事后反应阈值 · Ban 执行后改 `L_cli`/k/t_round/`U_B` · Ban C-POST 判 DRIFT · Ban 免除 B-POST 落点复核。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

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

**re-PRE ×3 · supersedes `1b74fb1` · cites FAIL `20da721`** · Inject A narrow `idle in transaction` + 57P01 signatures · T1 seed phase + 阶段期望表 · NB-1..4 pinned · B1/Cond/+12/B2/B5/B6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · peer `882efbc` cited not co-signed · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史 rewrite note 原样保留。

---

## Rewrite ×2 note · re-PRE（append · do not erase history below）

**re-PRE ×2 · supersedes `553cfc5` · cites FAIL `7e97dc3`** · B1①/B1②/B3/B4/Cond1/Cond2 landed in harness §2.1/§2.2/§4/§5/§2 L1/§6 · B2/B5/B6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史 FAIL 正文原样保留。
