# REQUEST — **C-PERF-TEARDOWN · product rootcause fix** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **×3 re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-rag-route` · peer PASS `882efbc` cited not co-signed）
**Rewrite ×3**: **supersedes REQUEST `1b74fb1`**（`1b74fb1cfa9226e8904e0dc51af02f1882851c79` · itself superseded `553cfc5`→`110532e`）· cites mw-e2e-ha Re-PRE2 FAIL **`20da721`**（`20da721c478f53cc7c13630f1533c4873a421501`）**B3/B4 Inject A + A/B-POST phase addressed** · B1(a)(b)/Cond1/Cond2/+12/B2/B5/B6（cleared @20da721）pins retained · Ban coding · CONDITION OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual · PASS `882efbc` @1b74fb1 **仅引用不代签**）
**Knife**: `harness/c-perf-teardown-product-rootcause-fix.md` · slice `c-perf-teardown-product-rootcause-fix.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` @ `8d52138`（ff past FAIL `20da721` · RAG rewrite3 landed · prior PERF `1b74fb1` · AN siblings cited only · Ban touch AN-RAG-R3 / AN-PRIV-EXT / AN-MOP-Q45 / AN-CIMG-EA）
**Prior REQUESTs**: `1b74fb1cfa9226e8904e0dc51af02f1882851c79`（superseded）· `553cfc5e4ca511b0327b647fcc2b49925828752c`（superseded）· `110532e81f11064e543bc9bc420b67bb2f95ae1e`（superseded）
**Date**: 2026-10-06
**Line**: **AN-PERF-TEAR**（wave AN · re-PRE ×3）

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

## 请审什么（mw-e2e-ha · re-PRE ×3 · 仅 `20da721` 未清项 + 保留项核对）

Line AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause。本 stub = **re-PRE rewrite ×3**（supersedes `1b74fb1` · cites FAIL `20da721`）。harness = `harness/c-perf-teardown-product-rootcause-fix.md`。请审：

1. **阻塞 1 关闭 · Inject A 收窄 (i)**（harness §5 / §5.2）：门控与终止 SQL 从 `state<>'idle'` 改为 **`state='idle in transaction'`**；A-MUT/A-POST 签名按 **57P01** / `terminating connection due to administrator command`（`client.js:428`）重写；明文 **A ≠ attempt1**「Connection terminated unexpectedly」；pg@8.22.0 / pg-pool@3.14.0 路径钉死（active pool.query → 无 client `'error'` / `db_pool_error=0` 已排除）。
2. **阻塞 2 关闭 · T1 钉 seed 阶段**（§5 / §4 阶段期望表）：T1 = `LOAD run2:` 后 + **run3 PERF seed**（`proof.ts:274`）；warmup `:278` 着陆 = `INJECT_PHASE_WARMUP` FAIL；A/B-POST EXIT=1 依据 = seed 顶层 reject（**非** warmup 丢弃路径）；**C(`rm -f`) OK keep**。
3. **Carry NB 已钉**：NB-1 B `restart -t0` 竞态；NB-2 A stdout=0=`INJECT_MISS`；NB-3 J-2 **EXTERNAL-OTHER** + **L3-sim**；NB-4 R2 `meetwise-e2e-r2pool-*` 下次 prove 前必清。
4. **Cleared stay（勿回退）**：B1(a) J-1/J-2/J-3 · B1(b) attempt1 时序/L2-self · Cond 1 `:931` · Cond 2 R2 DB source · runner +12（`:1726`/`:2182`/`:2251-2253`）· B2/B5/B6。
5. **行号重锚 disclosure**：+12 仍有效 · 无新增产品 locus · Ban invent。

刀界：≠ Line AE residual redo · ≠ Line S Branch A 复跑刀（只读 cite）· ≠ AN-RAG-R3 · **Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN · 不代签 peer `mw-rag-route` · alone ≠ dual。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code · Ban commit MUT · Ban invent product loci · Ban MySQL/Qdrant/FULLTEXT · Ban touch AN-PRIV-EXT/MOP/RAG product · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban 用 `state<>'idle'` 跑 A · Ban 要求 A 复现 attempt1 文本。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite ×3 · supersedes 1b74fb1 · FAIL 20da721 (B3/B4 Inject A + phase) · Ban coding · CONDITION OPEN · awaiting expert re-PRE dual · STOP*

---

## Rewrite ×3 note · re-PRE（append · do not erase history below）

**re-PRE ×3 · supersedes `1b74fb1` · cites FAIL `20da721`** · Inject A narrow `idle in transaction` + 57P01 signatures · T1 seed phase + 阶段期望表 · NB-1..4 pinned · B1/Cond/+12/B2/B5/B6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · peer `882efbc` cited not co-signed · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史 rewrite note 原样保留。

---

## Rewrite ×2 note · re-PRE（append · do not erase history below）

**re-PRE ×2 · supersedes `553cfc5` · cites FAIL `7e97dc3`** · B1①/B1②/B3/B4/Cond1/Cond2 landed in harness §2.1/§2.2/§4/§5/§2 L1/§6 · B2/B5/B6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · CONDITION OPEN · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史 FAIL 正文原样保留。
