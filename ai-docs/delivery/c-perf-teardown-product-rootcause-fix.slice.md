# Slice — **C-PERF-TEARDOWN · product rootcause fix**（Line AN-PERF-TEAR · `draft:awaiting_pre_exec_dual` · re-PRE rewrite ×5）

**Status (PROVE)**: **`prove-complete:awaiting_post_prove_dual`** · receipt `receipts/2026-10-06-an-perf-tear-c-perf-teardown-prove/README.md` · COND_SHA `60de958` · CODE_SHA `60de958`（P-HOLD · no product code change）· PC 3/3 · A-MUT FAIL×3 `A_FATAL_ON_ACTIVE` · A-POST FAIL×3 `A_FATAL_ON_ACTIVE` · B-MUT 3/3 · B-POST 3/3（`U_B=84` · `L_cli=18 ms`）· C-MUT 3/3 · C-POST FAIL×3（strict J-2 L3-sim temporal: die/destroy after first error）· R1/R2/R3 EXIT 0 · 0 Unhandled in any POST attempt · matrix not all-cells-met · Ban nail until POST dual BOTH · Ban self-nail · CONDITION `:35` OPEN
**Status (AUTHORIZE)**: **`authorized:coding+prove`** @ REQUEST `771ca84` · PRE BOTH `683d946`+`fef9408` · C-a/C-b/C-c landed in harness before prove（`## AUTHORIZE · 条件落地`）· Ban self-nail · CONDITION `:35` OPEN
**Status (history)**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST rewrite **×5 re-PRE** · supersedes `b5633f0`（→`083cce4`→`1b74fb1`→`553cfc5`→`110532e`）· cites mw-rag-route Re-PRE4 FAIL **`a07256c`**（TIMING seed 窗口 ≲213 ms vs 1 s 反应 / 10 轮余量 · C-POST 阶段矛盾）· prior FAIL `70cba94`/`20da721`/`7e97dc3`/`152b665` · peer mw-e2e-ha Re-PRE4 PASS `2900c46` cited not co-signed · alone ≠ dual · Ban coding until PRE BOTH PASS + AUTHORIZE · CONDITION may stay OPEN）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD local partial · capacityRepresentative=false
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` @ `a07256c`（ff past FAIL `a07256c` / RAG nail `1024bfc` · CODE 锚 `ac03f30`（`ac03f30..a07256c` scripts/packages/apps 零改动）· runner +18 重锚 + `:2220` 同行追加披露 · prior PERF `b5633f0` · AN siblings cited only · Ban touch AN-RAG-R3 / AN-PRIV-EXT / AN-MOP · Ban AN-CIMG-EA）
**Prior REQUESTs**: `b5633f0f20e887ce733d1d3778dedf48357ef176`（superseded by ×5）· `083cce467657c1499f748f0073eeaee7bdd9392d`（superseded）· `1b74fb1cfa9226e8904e0dc51af02f1882851c79`（superseded）· `553cfc5e4ca511b0327b647fcc2b49925828752c` · `110532e81f11064e543bc9bc420b67bb2f95ae1e`
**FAIL**: `a07256c1809f30c9ae8bda6c98fab69760cb41a7`（mw-rag-route Re-PRE4 @b5633f0）· `70cba947798c7fb33f7fa4a8a1ec8609ef6bc610` · `20da721c478f53cc7c13630f1533c4873a421501` · `7e97dc3e500c9471fe50dbdbd3aaee8d6c89e7e9` · `152b665787e02ac6ef350551e599b3823a9fa763`
**Peer PASS（cited not co-signed）**: `2900c46ef6f12258dcbc957c0273722ea83a6a47`（mw-e2e-ha Re-PRE4 @b5633f0）· `dbed2f2`（mw-rag-route Re-PRE3 @083cce4）· alone ≠ dual
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban self-approve · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push

## One-line

backlog `:35` **C-PERF-TEARDOWN CONDITION OPEN**。**rewrite ×5**（supersedes `b5633f0` · FAIL `a07256c` · peer e2e PASS `2900c46` cited not co-signed · alone ≠ dual）解除 `a07256c` 两阻塞：**TIMING** —— 容器内单次 psql 门控循环改为 **`^PERF run1:` 预启动**（门控键 `IV\_P018\_R3\_%` 在 run3 seed 前恒 0 → 相位安全），删除「LOAD run2 → psql ≤1 s」，改为可观测判据 `GATE_LOOP_START iv_rows=0 ∧ t0_ms < t_load2`（否则 `INJECT_LATE`），10 s 上限 ≈36× LOAD run2；**B-POST**（唯一依赖 seed 着陆的 B/C 格）余量按公式写死 `U_B = min(109, 110 − ceil(2·L_cli / 1.39 ms))`（`L_cli` = 执行前 5 次 `docker version` 最大值 · `U_B<6` → `BC_MARGIN_INFEASIBLE` 不执行、FAIL×3、harness-timing）；时序证据（430 ms / ≲213 ms / ≈1.9 ms/轮 / ≲19 ms · 收据路径）写入 §5.0a；**C-POST** 唯一规则 = **与阶段无关 OK keep**（PG 永久消失 → EXIT 1 · `db_pool_error`≥1 · 零 Unhandled · 不要求 `seedAbandonTargets` · 无 DRIFT），B-POST 落点复核收紧为 F2 ∧ 无 `^PERF run3:` ∧ `seedAbandonTargets`。NB 钉入：`idle_n≥2` · MUT Unhandled 栈帧须含 `pg/lib/client.js`|`pg-pool/index.js` · J-2 `wait` ∈ {143, 0} · runner `:2220` 同行追加披露 · 竞态措辞「socket 回调后 nextTick/microtask 排空内、下一回调分发前」。rewrite ×4（保留）：(ii) B/C-MUT = **MUT-ZERO**（同删 `principal.ts:929`+`:931`）· Unhandled on Client|BoundPool · `db_pool_error`=0 · `INJECT_KIND_POOLQUERY_RACE` 事前钉 FAIL；A-MUT 仍 MUT-929；C1 同快照阶段 SQL · C2 57P01 存在 · C3 容器内单次 psql · C4 AUX EXIT · runner +18 @`ac03f30`。rewrite ×3（保留）：Inject A `state='idle in transaction'` + 57P01 · A ≠ attempt1 · T1 钉 run3 seed · 阶段期望表。Cleared stay：B1(a)(b) · `:931` · R2 · +12 · B2/B5/B6。**Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN · Ban touch RAG。

## Products

| Role | Path |
|------|------|
| Harness | `harness/c-perf-teardown-product-rootcause-fix.md`（rewrite ×5） |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-c-perf-teardown-product-rootcause-fix-mw-e2e-ha.md` |
| Prove receipt | `receipts/2026-10-06-an-perf-tear-c-perf-teardown-prove/README.md`（awaiting post_prove_dual · not nail） |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-06-c-perf-teardown-product-rootcause-fix-mw-rag-route.md` |

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban product/infra code · Ban commit MUT · Ban invent product loci · Ban Redis cutover · Ban MODEL-OP closed claim · Ban MySQL/Qdrant/FULLTEXT · Ban touch AN-PRIV-EXT/MOP/RAG product · Ban 用 `state<>'idle'` 跑 A · Ban 要求 A 复现 attempt1 文本 · Ban B/C-MUT 用 MUT-929 · Ban 把 POOLQUERY_RACE 不计入/换 attempt · Ban CTU 缺席判据 · Ban 门控与终止分两次 exec · Ban「LOAD run2 → psql ≤1 s」/ 事后反应阈值 · Ban 执行后改 `L_cli`/k/t_round/`U_B` · Ban C-POST 判 DRIFT 或要求 `seedAbandonTargets` · Ban 免除 B-POST 落点复核 · Ban 新格标记不计入/换 attempt。

*Slice · C-PERF-TEARDOWN product rootcause fix · AN-PERF-TEAR re-PRE ×5 · supersedes b5633f0 · FAIL a07256c · TIMING prestart ^PERF run1 · B-POST margin formula · C-POST phase-independent · NB idle_n≥2/pg-frames/wait{143,0}/:2220/race · peer 2900c46 cited not co-signed · alone ≠ dual · draft:awaiting_pre_exec_dual · STOP*
