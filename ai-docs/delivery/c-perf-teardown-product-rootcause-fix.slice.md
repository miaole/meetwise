# Slice — **C-PERF-TEARDOWN · product rootcause fix**（Line AN-PERF-TEAR · `draft:awaiting_pre_exec_dual` · re-PRE rewrite ×3）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST rewrite **×3 re-PRE** · supersedes `1b74fb1`（→`553cfc5`→`110532e`）· cites mw-e2e-ha Re-PRE2 FAIL **`20da721`**（B3/B4 Inject A + A/B-POST phase）· prior FAIL `7e97dc3`/`152b665` · peer rag PASS `882efbc` cited not co-signed · alone ≠ dual · Ban coding until PRE BOTH PASS + AUTHORIZE · CONDITION may stay OPEN）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD local partial · capacityRepresentative=false
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` @ `8d52138`（ff past FAIL `20da721` · RAG rewrite3 landed · prior PERF `1b74fb1` · AN siblings cited only · Ban touch AN-RAG-R3 / AN-PRIV-EXT / AN-MOP · Ban AN-CIMG-EA）
**Prior REQUESTs**: `1b74fb1cfa9226e8904e0dc51af02f1882851c79`（superseded）· `553cfc5e4ca511b0327b647fcc2b49925828752c` · `110532e81f11064e543bc9bc420b67bb2f95ae1e`
**FAIL**: `20da721c478f53cc7c13630f1533c4873a421501` · `7e97dc3e500c9471fe50dbdbd3aaee8d6c89e7e9` · `152b665787e02ac6ef350551e599b3823a9fa763`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban self-approve · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push

## One-line

backlog `:35` **C-PERF-TEARDOWN CONDITION OPEN**。rewrite ×3 解除 `20da721` 两阻塞：**Inject A** 门控/终止收窄为 `state='idle in transaction'` · A-MUT/A-POST 按 **57P01** 重写 · **A ≠ attempt1**「Connection terminated unexpectedly」；**T1 钉 seed 阶段**（`runPerf` `:274` · Ban warmup `:278` 着陆当 EXIT0 绿）· 阶段期望表 · C(`rm -f`) OK keep。Cleared stay：B1(a)(b) · `:931` · R2 · +12 · B2/B5/B6。Carry NB：B `restart -t0` 竞态 · A stdout=0=`INJECT_MISS` · J-2 EXTERNAL-OTHER+L3-sim · R2 名清串行过滤。**Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN · Ban touch RAG。

## Products

| Role | Path |
|------|------|
| Harness | `harness/c-perf-teardown-product-rootcause-fix.md`（rewrite ×3） |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-c-perf-teardown-product-rootcause-fix-mw-e2e-ha.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-06-c-perf-teardown-product-rootcause-fix-mw-rag-route.md` |

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban product/infra code · Ban commit MUT · Ban invent product loci · Ban Redis cutover · Ban MODEL-OP closed claim · Ban MySQL/Qdrant/FULLTEXT · Ban touch AN-PRIV-EXT/MOP/RAG product · Ban 用 `state<>'idle'` 跑 A · Ban 要求 A 复现 attempt1 文本。

*Slice · C-PERF-TEARDOWN product rootcause fix · AN-PERF-TEAR re-PRE ×3 · supersedes 1b74fb1 · FAIL 20da721 · draft:awaiting_pre_exec_dual · STOP*
