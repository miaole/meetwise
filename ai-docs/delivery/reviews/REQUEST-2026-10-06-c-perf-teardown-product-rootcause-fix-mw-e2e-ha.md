# REQUEST — **C-PERF-TEARDOWN · product rootcause fix** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **×4 re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-rag-route` · peer PASS `dbed2f2` @083cce4 cited not co-signed）
**Rewrite ×4**: **supersedes REQUEST `083cce4`**（`083cce467657c1499f748f0073eeaee7bdd9392d` · itself superseded `1b74fb1`→`553cfc5`→`110532e`）· cites mw-e2e-ha Re-PRE3 FAIL **`70cba94`**（`70cba947798c7fb33f7fa4a8a1ec8609ef6bc610`）**新阻塞 1 B/C-MUT addressed via (ii)** · peer `dbed2f2` 条件 1–4 = C1–C4 pinned · cleared items retained · Ban coding · CONDITION OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual · PASS `882efbc` @1b74fb1 **仅引用不代签**）
**Knife**: `harness/c-perf-teardown-product-rootcause-fix.md` · slice `c-perf-teardown-product-rootcause-fix.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` @ `ac03f30`（ff past FAIL `70cba94` · PASS `dbed2f2` · RAG R3 CODE `264e1d7`/`ac03f30` 他线只读 · runner +18 重锚 · Ban touch AN-RAG-R3 / AN-PRIV-EXT / AN-MOP-Q45 / AN-CIMG-EA）
**Prior REQUESTs**: `083cce467657c1499f748f0073eeaee7bdd9392d`（superseded）· `1b74fb1cfa9226e8904e0dc51af02f1882851c79`（superseded）· `553cfc5e4ca511b0327b647fcc2b49925828752c`（superseded）· `110532e81f11064e543bc9bc420b67bb2f95ae1e`（superseded）
**Date**: 2026-10-06
**Line**: **AN-PERF-TEAR**（wave AN · re-PRE ×4）

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

## 请审什么（mw-e2e-ha · re-PRE ×4 · 仅 `70cba94` 新阻塞 + C1–C4 + 保留项核对）

Line AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause。本 stub = **re-PRE rewrite ×4**（supersedes `083cce4` · cites FAIL `70cba94`）。harness = `harness/c-perf-teardown-product-rootcause-fix.md`（rewrite ×4 note · §4 · §5.0 · §5.1a · §5.2b · §5.4）。请审：

1. **新阻塞 1 关闭 · 选 (ii)**：B/C-MUT = **MUT-ZERO**（临时同删 `principal.ts:929` + `:931`）· 签名 `Unhandled 'error' event` on **Client 或 BoundPool** + `db_pool_error`=0（否则 `MUT_NOT_APPLIED`）；§5.2b 逐 seed 子步（`:236` asPrincipal / `:232` pool.query / checkout 间隙）× MUT-ZERO/POST 推导；前置 `idle_n≥1`（同快照 · 否则 `INJECT_PRECOND_NO_IDLE`）；pool.query 自身 client 事件先分发 → TLA reject 退出的残余 + B-POST 57P01-on-active pool.query `db_pool_error`=0 残余 **事前**钉 `INJECT_KIND_POOLQUERY_RACE` 格 FAIL 计入 · Ban retry。A-MUT 仍 **MUT-929**（不回退）。
2. **C1**：§5.1a 一条 SQL 同时返回 pid/state/xact_start/left(query,60) + `pg_terminate_backend` + `IV\_P018\_R3\_%` 行数/非 active 行数 + `idle_n`；阶段规则写死（seed `iv_rows∈[1,109]`；`110∧0`=BOUNDARY；`110∧1..9`=WARMUP；`110∧≥10`=MEASURED · 非 seed 不终止）；B/C 门控余量 `iv_rows≤100` + POST F2 栈 `seedAbandonTargets` 复核（缺 → `INJECT_PHASE_DRIFT`）。
3. **C2**：A-MUT/A-POST 只要求 **57P01 出现**；CTU 允许并存、永不以其缺席判据；FATAL 落 active → `A_FATAL_ON_ACTIVE` 格 FAIL 计入。
4. **C3**：门控 + 终止 = 容器内**单次** psql `DO` 循环（`pg_stat_clear_snapshot()` · 5 ms · 10 s 上限）· `LOAD run2:` → psql 启动 ≤1 s。
5. **C4**：§5.4 AUX EXIT 表（R2 run/port/pg_isready/rm · NB-4 清理 · J-2 events/pgrep 循环 `wait`=143 · docker ps 前后 · B port · MUT 施加/还原）。
6. **Cleared stay**：Inject A idle-in-txn + 57P01 · A≠attempt1 · T1 run3 seed · `INJECT_PHASE_WARMUP` · C · NB-1..4 · B1(a)(b) · `:931` · R2 · +12（tip `ac03f30` 再 +18：`:1744`/`:2200`/`:2269-2271` · disclosure）· B2/B5/B6 · backlog `:35` OPEN。本 stub **不**触碰 AN-RAG-R3 文件。

刀界：≠ Line AE residual redo · ≠ Line S Branch A 复跑刀（只读 cite）· ≠ AN-RAG-R3 · **Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN · 不代签 peer `mw-rag-route` · alone ≠ dual。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code · Ban commit MUT · Ban invent product loci · Ban MySQL/Qdrant/FULLTEXT · Ban touch AN-PRIV-EXT/MOP/RAG product · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban 用 `state<>'idle'` 跑 A · Ban 要求 A 复现 attempt1 文本 · Ban B/C-MUT 用 MUT-929 · Ban 把 POOLQUERY_RACE 不计入/换 attempt · Ban CTU 缺席判据。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite ×4 · supersedes 083cce4 · FAIL 70cba94 (B/C-MUT · (ii) MUT-ZERO) · C1–C4 · Ban coding · CONDITION OPEN · awaiting expert re-PRE dual · STOP*

---

## Rewrite ×4 note · re-PRE（append · do not erase history below）

**re-PRE ×4 · supersedes `083cce4` · cites FAIL `70cba94`** · (ii) B/C-MUT = MUT-ZERO（`:929`+`:931`）· Client|BoundPool · `INJECT_KIND_POOLQUERY_RACE` 事前钉 FAIL · C1 同快照 SQL · C2 57P01 存在 · C3 单次容器内 psql · C4 AUX EXIT · runner +18 重锚 @ac03f30 · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · peer `dbed2f2` cited not co-signed · alone ≠ dual。本段仅为 rewrite 注记，**不**构成 PASS/FAIL；下方历史段原样保留。

---

## Rewrite ×3 note · re-PRE（append · do not erase history below）

**re-PRE ×3 · supersedes `1b74fb1` · cites FAIL `20da721`** · Inject A narrow `idle in transaction` + 57P01 signatures · T1 seed phase + 阶段期望表 · NB-1..4 pinned · B1/Cond/+12/B2/B5/B6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · peer `882efbc` cited not co-signed · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史 rewrite note 原样保留。

---

## Rewrite ×2 note · re-PRE（append · do not erase history below）

**re-PRE ×2 · supersedes `553cfc5` · cites FAIL `7e97dc3`** · B1①/B1②/B3/B4/Cond1/Cond2 landed in harness §2.1/§2.2/§4/§5/§2 L1/§6 · B2/B5/B6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史 FAIL 正文原样保留。
