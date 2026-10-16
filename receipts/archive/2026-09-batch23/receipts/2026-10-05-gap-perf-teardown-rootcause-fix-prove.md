# Receipt — **C-PERF-TEARDOWN 根因刀 · Branch A 复跑验证**（prove evidence · CONDITION stays OPEN）

**Date**: 2026-10-05（Asia/Shanghai）
**Line**: **S** · implementer `mw-core`
**Knife**: harness `harness/gap-perf-teardown-rootcause-fix.md` · slice `gap-perf-teardown-rootcause-fix.slice.md`
**REQUEST**: `3ca96286eb182eed66670becfebeb621ad917a2d`（docs-only pre_dual）
**PRE dual PASS**: mw-e2e-ha `5066b5c5b6f9691ef0e3b916e0380a4a52c9ace3` + mw-rag-route `0bd7ddfee637f6829357242945aa9fe4a290a857`
**Authorize tip（协调方）**: `ad8d68e5f2536e83668ea07f6c1e224c23b32442`（docs）
**Branch**: **A ONLY** · **零产品/基建码改** · Ban `principal.ts` · Ban SSOT flip · Ban wash attempt1 · Ban close C-IMAGE-DIGEST · Ban Meridian · Ban secrets/`.env*` · Ban force-push · Ban self-nail · Ban retry-to-green

---

## Pins（unchanged）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false**

**C-PERF-TEARDOWN stays CONDITION OPEN**（backlog `:35`）· **Not a close** · **Not coding** · Pins unchanged · **POST_DUAL: BOTH PASS** mw-e2e-ha `f4441dde38eed6eee402a6d0bcf12cea697b6304` + mw-rag-route `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df` · Lifecycle **`post_prove_dual_pass`** by Line S nail（cross-ref harness/slice/SSOT）· **CONDITION still OPEN**（Ban close）

---

## C-1 — Prove SHA（诚实）

| 项 | 值 |
|----|----|
| **Prove SHA（exact）** | `e8c63a913a1e9af285f692bcab16f7593294d144` |
| Tip at prove | origin `feat/mysql-schema-skeleton` @ `e8c63a9`（authorize `ad8d68e` 之后的 docs tip；含 PRE dual 本刀两签 + 无关 G7/UC004 REQUEST docs） |
| Docs-only? | **YES**（`e8c63a9` 相对最近代码 commit 为 ai-docs 增量） |
| **Code-equivalence nearest code commit** | `55ede8980d5a23b8c021ec357207e030d222650e`（`feat(e2e): NHP-002-ADV-01 …`） |
| Equivalence surfaces（tip↔code） | `packages/db/src/principal.ts` · `apps/api/test/uc-e2e-018-perf-load.proof.ts` · `scripts/uc018-perf-load-capped-child.mjs` → **`git diff --stat 55ede89 e8c63a9 -- <paths>` 空** |
| P 修复在祖先链 | `f19ecba38f923fde0c31d4b7b98ec0da82b2e7f9` ∈ `e8c63a9` 祖先（`merge-base --is-ancestor` EXIT=0） |
| 事后 tip 漂移 | prove 完成后 origin tip 前进至含 Line U G7 trio receipt + UC004 FI-3 coding（与本刀正交）；本 receipt **钉 prove @ `e8c63a9`**，不把后续 tip 冒充为本 prove 面 |

CMD: `pnpm uc018:perf-load:prove`（`package.json` → `run-e2e-isolated.mjs` → `uc018-perf-load-capped-child.mjs`）· `pnpm install --frozen-lockfile` · fresh 隔离 PG per attempt · Docker caps `--cpus=2 --memory=4g` · one-shot ×3 · **Ban retry-to-green**

---

## Attempts（全记录 · Asia/Shanghai）

| Attempt | Shell EXIT | Start (Asia/Shanghai) | End (Asia/Shanghai) | `Unhandled 'error' event` | run3 + SUMMARY | `db_pool_error` | Isolated PG | Machine receipt (`.tmp/` · gitignored) |
|---------|------------|------------------------|---------------------|---------------------------|----------------|-----------------|-------------|----------------------------------------|
| **A** | **0** | `2026-10-05T23:14:02+08:00` | `2026-10-05T23:14:47+08:00` | **absent** | **yes** · `SUMMARY allPass=true capsEnforced=true` | **absent**（无真实断连） | `meetwise-e2e-259191-1791213243589` @ `127.0.0.1:32768` | `.tmp/isolated-proof-receipts/2026-10-05T15-14-47-131Z-259191-a1e8f6e1-f6cd-4351-8905-8aa1f16a4014.json` |
| **B** | **0** | `2026-10-05T23:17:55+08:00` | `2026-10-05T23:18:15+08:00` | **absent** | **yes** · `SUMMARY allPass=true capsEnforced=true` | **absent** | `meetwise-e2e-270771-1791213476480` @ `127.0.0.1:32769` | `.tmp/isolated-proof-receipts/2026-10-05T15-18-15-156Z-270771-38938f6d-a6d3-45e6-bfcd-6fee31b52161.json` |
| **C** | **0** | `2026-10-05T23:20:03+08:00` | `2026-10-05T23:20:24+08:00` | **absent** | **yes** · `SUMMARY allPass=true capsEnforced=true` | **absent** | `meetwise-e2e-276715-1791213604385` @ `127.0.0.1:32772` | `.tmp/isolated-proof-receipts/2026-10-05T15-20-24-198Z-276715-d2593250-0270-473a-bfb4-660156a2daa4.json` |

### Per-attempt run lines（原文摘要）

**A**: PERF/LOAD run1–3 均 `passed=true`（例 PERF run3 p50=24.4 p95=74.5 p99=99.3 err=0；LOAD run3 p50=37.0 p95=128.7 p99=133.8 err=0 dblRel=0 stuck=0）
**B**: PERF/LOAD run1–3 均 `passed=true`（例 PERF run3 p50=20.2 p95=57.5 p99=74.3；LOAD run3 p50=37.7 p95=120.8 p99=131.5）
**C**: PERF/LOAD run1–3 均 `passed=true`（例 PERF run3 p50=20.0 p95=50.5 p99=81.9；LOAD run3 p50=38.3 p95=103.6 p99=130.3）

非区分性噪声（三 attempt 均出现 · 与 attempt1/2 历史同形 · **非**本刀崩溃签名）：容器内 `fatal: not a git repository: …/worktrees/meetwise-lineS`（gitdir 在 docker mount 外；proof 仍完成 SUMMARY）。

---

## Branch A 关闭证据判据（相对本刀 teardown 目标 · **≠** 条件自动关闭）

| 判据 | 结果 |
|------|------|
| (a) 全 attempts 零 `Unhandled 'error' event` / mid-prove 进程崩溃 | **PASS**（A/B/C 均 absent） |
| (b) 每次至 run3 + `SUMMARY` 完整到达 | **PASS**（A/B/C 均 `SUMMARY allPass=true`） |
| (c) 若真实断连：`db_pool_error` 可见 + 诚实 FAIL/PASS | **N/A**（三 attempt 无真实断连 · 无 `db_pool_error` 行） |

**Branch A vs B 结论**: 复跑 **未**复现 attempt1 式 unhandled crash → **Branch A 成立**（读码判定未被证伪）· **不转入 Branch B**。

**Latency / EXIT 正交性**: 本三 attempt 均为 shell EXIT=0（阈值面本机达标）。若未来出现阈值 miss EXIT=1，与 teardown 条件**正交**——诚实入账，**Ban** 洗成关闭证据、也 **Ban** 外推为 SLA 转绿。本刀 EXIT=0 **≠** UC covered **≠** 翻 §1.1 **≠** 条件关闭。

---

## Historical attempt1（账目保全 · Ban wash）

| 项 | 值 |
|----|----|
| attempt1 @ `b29c191543dfbe7c1afa4278c550340a3339f295` | **EXIT=1** · mid-prove `Unhandled 'error' event` · `Connection terminated unexpectedly` @ `pg/lib/client.js` · run2 后 / run3+SUMMARY 前 |
| attempt2 @ same SHA | EXIT=0 |
| 口径 | **FAIL-UNREPRODUCED-ON-FIRST** · **Do not claim the second exit washes the first**（`receipts/uc018-receipt-backfill/README.md:39-41`） |
| 本 receipt | attempt1 **retained as historical real defect evidence**（P 修复落地前）· **not flake** · **not washed** |

---

## Residual（C-3 携带 · 非 attempt1 签名）

- **HOST_SQL_PROBE** `scripts/run-e2e-isolated.mjs:1889-1890` 独立 `new Client`（未走 `createPool()`）：boot 期短命子进程探针 · exit 经 `capture` streak 重试 · 故障形态 ≠ mid-prove proof unhandled crash。本刀 Branch A **未改**该面。
- **P-1** purpose 观测标签现记 `'default'`（调用点布线超 P 线触碰面）
- **P-3** 非 Error 实例发射绕过 WeakSet（pg 现状恒发 Error；升级须复评）

---

## Dual conditions carried（mw-e2e-ha C-1..C-4 + mw-rag-route C-1..C-4）

| ID | Source | Carried in this receipt |
|----|--------|-------------------------|
| C-1 | e2e-ha：复跑契约刚性 / rag：prove SHA 诚实 | ✓ exact prove SHA + code-equivalence disclosure |
| C-2 | e2e-ha：关闭判据三分 / rag：attempt 账目保全 | ✓ A/B/C 全录 + attempt1@b29c191 EXIT1 retained |
| C-3 | e2e-ha：残留面 / rag：正交与局部性 | ✓ HOST_SQL_PROBE + P-1/P-3 · local partial · capacityRepresentative=false |
| C-4 | e2e-ha：行冻结 / rag：Branch B 触发面 | ✓ backlog `:35` stays OPEN · Branch B **not** triggered · Ban principal.ts |

---

## Ban list（live）

Ban coding（本提交仅 receipt + 可选 harness/slice 状态注）· Ban 碰 `packages/db/src/principal.ts` · Ban SSOT/backlog/checklist **status row** 翻转 · Ban wash attempt1 · Ban close C-IMAGE-DIGEST · Ban Meridian · Ban secrets/`.env*` · Ban force-push · Ban self-nail · Ban retry-to-green · Ban 全局 uncaughtException 兜底 · Ban 观测面发明健康叙事（NOT_HA 不变）· Ban 互借 P 线宣称本条件已关闭

---

## Verdict

**Branch A prove evidence complete** @ `e8c63a9` · 3/3 attempts EXIT=0 · 零 unhandled crash · 均至 run3+SUMMARY · 无真实断连故无 `db_pool_error` 样本（观测路径未触发，非失败）。

**C-PERF-TEARDOWN stays CONDITION OPEN** · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false** · **Not a close** · **Not coding** · Pins unchanged.

**POST_DUAL: BOTH PASS** — mw-e2e-ha `f4441dde38eed6eee402a6d0bcf12cea697b6304` + mw-rag-route `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df`（alone≠dual）.

**NAIL**: Line S authorized nail advances lifecycle to **`post_prove_dual_pass`** on harness/slice + receipt cross-ref dual SHAs · SSOT additive honesty only · **backlog `:35` C-PERF-TEARDOWN stays CONDITION OPEN**（canHonestlyFlip=false · Ban close · Ban wash attempt1 · Ban covered flip · Ban HA · Ban Meridian · Ban Branch B invention · Ban coding · Ban secrets · Ban force-push）· STOP

*Receipt · Line S · Branch A · C-PERF-TEARDOWN · prove tip 920666a · EXIT 0/0/0 · post dual f4441dd+6a79946 PASS · lifecycle post_prove_dual_pass · CONDITION OPEN retained · Ban close · STOP*
