# REQUEST — **C-PERF-TEARDOWN · product rootcause fix** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **×2 re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Rewrite ×2**: **supersedes REQUEST `553cfc5`**（`553cfc5e4ca511b0327b647fcc2b49925828752c` · itself superseded `110532e`）· cites mw-rag-route Re-PRE FAIL **`7e97dc3`**（`7e97dc3e500c9471fe50dbdbd3aaee8d6c89e7e9`）**B1/B3/B4/Cond 1–2 addressed** · B2/B5/B6（cleared @7e97dc3）pins retained · Ban coding · CONDITION OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual）
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

## 请审什么（mw-e2e-ha · re-PRE ×2 · 仅 `7e97dc3` 未清项 + 保留项核对）

Line AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause。本 stub = **re-PRE rewrite ×2**（supersedes `553cfc5` · cites FAIL `7e97dc3`）。harness = `harness/c-perf-teardown-product-rootcause-fix.md`。请审：

1. **B1① L3 判定程序**（harness §2.1）：J-1 回溯已读档执行——attempt1 窗口 `2026-09-24 12:57:14–12:57:35 +08:00`（box `/workspace/mw-rv-bf-results/PERF-LOAD.env`）内 `attempts.jsonl` **无** emit 记录（prove 模式末条 `04:38:14Z`；`04:50:35Z` 批为 `reemit-from-log`，`emit.mjs:304` 退出、`:505` try / `:559` 不可达）；reviewer 串行序列无重叠；`state_bytes=29 logs_bytes=29` = `Buffer.byteLength('docker_diagnostic_unavailable')` → 诊断前容器已消失，但在 `--rm` 下与 L2-self **同签名** → 结论 L3(已记录)=OUT · L3(未记录并发)/L2-self=UNDETERMINABLE。J-2 前向：每 attempt 强制 `docker events` + emitter 进程采样 → 判定表（L3 IN / L2-self IN / L1 client-side / OUT / UNDETERMINABLE）。J-3：Inject C 只 `docker rm -f` 本 run PG 对照 attempt1 签名。
2. **B1② attempt1 时序**（§2.2）：崩溃在 `LOAD run2` 后 / `PERF run3` 前；proof `:441-444` run 间无 teardown/重连；runner `:2251-2253` 与 capped child `:203` 的自有 rm 顺序上晚于 proof 退出 → 本 run harness teardown 被读码排除；**L2-self**（本 run PG 自亡 + `--rm` 自删）**不能**排除 → 交 J-2；attempt1 @`b29c191` 时 `principal.ts:928-931` 尚不存在（`f19ecba` 引入）。
3. **B3 EXIT 矩阵**（§4）：PC 3/3 EXIT **0**；A/B/C × MUT 3/3 EXIT **1** + `Unhandled 'error' event`/on Client/无 SUMMARY；A/B/C × POST 3/3 EXIT **1** + `db_pool_error`≥1 + 零 unhandled（F1/F2 形态记录）；POST 观测 EXIT 0 → `POST_EXIT_UNEXPECTED` 格 FAIL；MUT = 临时删 `:929` · Ban commit · `git diff --exit-code` 0；Ban retry / 换 attempt。
4. **B4 三注入各自钉**（§5）：(A) `pg_terminate_backend` 自身 EXIT 0 + count≥1；(B) `docker restart -t 0 <PG>` EXIT 0 + stdout==名 + `docker port` 前后；(C) `docker rm -f <PG>` EXIT 0 + stdout==名；共用触发点 **T1** = `^LOAD run2: ` 出现后 ≤1 s，`PERF run3:` 先出现 → `INJECT_LATE`；门控 `state<>'idle'` client backend ≥1（10 s 超时 → `INJECT_GATE_TIMEOUT`）。
5. **Cond 1** `pool.on('error')` = **`principal.ts:931`**；**Cond 2** R2 DB source = 一次性本 run 自有 `pgvector/pgvector:pg16` 容器（`meetwise-e2e-r2pool-*`）+ 显式 `DATABASE_URL` · Ban dev/共享 PG · 首 PASS 前连不上 → `R2_ENV_FAIL` ≠ 回归。
6. **保留核对**：B2 分层 / P-FIX 仅 `principal.ts` / emitter `:559` ≠ product close；B5 R1–R3 EXIT0 + Ban 借绿；B6 隔离真 PG · Linux-native · serial `docker ps`=0 · Ban emitter。
7. **行号重锚 disclosure**：`9e2abd0` 后 `run-e2e-isolated.mjs` @tip 实测 +12（`:1714→:1726` · `:2170→:2182` · `:2239-2241→:2251-2253`）；其余 loci 行号不变；无新增产品 locus。

刀界：≠ Line AE residual redo · ≠ Line S Branch A 复跑刀（只读 cite）· **Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN · 不代签 peer `mw-rag-route` · alone ≠ dual。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code · Ban commit MUT · Ban invent product loci · Ban MySQL/Qdrant/FULLTEXT · Ban touch AN-PRIV-EXT/MOP product · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite ×2 · supersedes 553cfc5 · FAIL 7e97dc3 (B1/B3/B4/Cond) · Ban coding · CONDITION OPEN · awaiting expert re-PRE dual · STOP*

---

## Rewrite ×2 note · re-PRE（append · do not erase history below）

**re-PRE ×2 · supersedes `553cfc5` · cites FAIL `7e97dc3`** · B1①/B1②/B3/B4/Cond1/Cond2 landed in harness §2.1/§2.2/§4/§5/§2 L1/§6 · B2/B5/B6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史 FAIL 正文原样保留。
