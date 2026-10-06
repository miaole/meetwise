# REQUEST — **C-PERF-TEARDOWN · product rootcause fix** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Rewrite**: **supersedes REQUEST `110532e`** · cites mw-rag-route PRE-EXEC FAIL **`152b665`**（`152b665787e02ac6ef350551e599b3823a9fa763`）**B1–B6 addressed** · Ban coding · CONDITION OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual）
**Knife**: `harness/c-perf-teardown-product-rootcause-fix.md` · slice `c-perf-teardown-product-rootcause-fix.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` tip（AN siblings cited only · Ban touch AN-PRIV-EXT / AN-MOP-Q45 / AN-CIMG-EA）
**Prior REQUEST**: `110532e81f11064e543bc9bc420b67bb2f95ae1e`（superseded）
**Date**: 2026-10-06
**Line**: **AN-PERF-TEAR**（wave AN · re-PRE）

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

## 请审什么（mw-e2e-ha · re-PRE · B1–B6）

Line AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause。本 stub = **re-PRE rewrite**（**supersedes `110532e`** · cites FAIL **`152b665`** · 解除 B1–B6）。请审：

1. **B1 四 loci 具名+初判**：`principal.ts:928-931` · `run-e2e-isolated:1714`+`:2239-2241` · `emit.mjs:555-560`/`:559` · `capped-child:18` · 各有可证伪判据与书面 P-FIX/P-HOLD/另开刀初判。
2. **B2 分层**：PRODUCT / HARNESS / INFRA 拆清 · **P-FIX 只动产品文件** · **emitter `:559` ≠ product close**。
3. **B3 LOOP §3③**：CMD = `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove` · **attempts=3** · EXIT 表钉死 · **无**「或 PRE 选定」。
4. **B4 inject/PC/MUT**：`pg_terminate_backend` 或仅 restart 本 run 自有容器 · pre/post/mut 期望钉死 · Ban 全局 rm / 他线。
5. **B5 回归**：R1 `uc018:perf-load:prove` · R2 `pool-error-listener.proof.ts` · R3 `uc018:receipt-backfill:prove` · 均 EXIT0 · Ban 借绿。
6. **B6 证据层**：隔离真 PG · Linux-native-Docker-Engine · serial `docker ps`=0 · **Ban** 经 emitter `:559` 跑本刀。

刀界：≠ Line AE residual redo · ≠ Line S Branch A 复跑刀（只读 cite）· **Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite · supersedes 110532e · FAIL 152b665 B1–B6 · Ban coding · CONDITION OPEN · awaiting expert re-PRE dual · STOP*
