# UC-E2E-018 PERF/LOAD · post-prove dual · mw-rag-route

**角色**: mw-rag-route ONLY · Repo `/workspace/meetwise` · Ban Meridian · Ban Cloud Agent · Ban `.env*` · Ban coding/product 编辑 · Ban 改 harness（Ban self-nail）· Ban invent covered · Ban假关/假绿 · Ban forge peer mw-e2e-ha（独立复跑，不抄对方数字）

**时间**: 2026-09-23 ~19:53–19:55 PT

---

## Verdict

**PASS**

全部必核项成立：tracked+redacted 回执字段齐 + secret scan 无实密；api+pg 实测 HostConfig 封顶；本人于 `b29c191` 洁树独立复跑 `pnpm uc018:perf-load:prove` **EXIT=0** 且阈值全达标；真实 Postgres + abandon→`safely_terminated` 产品路径（非 MemorySaver/MySQL/Qdrant）；reassess `canHonestlyFlip=false` · §1.1 仍 **partial**；阈值相对 `30943df` 未放宽；仅 case-only→partial；pins 保持。  
**PERF-01 partial**：PASS · **LOAD-01 partial**：PASS（无独立 uncapped worker 进程；见 cap ruling）· overall **PASS**。  
local PERF/LOAD ≠ capacity ≠ HA · alone ≠ dual · PERF/LOAD partial ≠ UC covered。

---

## tips / ancestry

| 项 | 证据 |
|---|---|
| HEAD（复跑前/证明 tip 祖先） | `b29c191543dfbe7c1afa4278c550340a3339f295` · Author **meetwise-core** · `feat(e2e): UC018 PERF/LOAD prove + elevate case-only→partial` · branch `feat/mysql-schema-skeleton` |
| Method freeze Step A | `8c7ee0c` · **是** `b29c191` 祖先 |
| REQUEST pre-exec tip | `30943df` · **是** HEAD 祖先 |
| 洁树开跑 | 复跑前 `git status --porcelain` 空（中途曾被 peer 覆写回执后已 restore；本人未 discard 他人未提交改动） |
| Harness | `ai-docs/delivery/harness/uc-e2e-018-perf-load.md` 仍为 **`executed:awaiting_post_prove_dual`** · **未改** |

---

## receipts audit + secret scan

**目录** `ai-docs/delivery/receipts/uc018-perf-load/`（implementer 已提交 · HEAD 内容；本人复跑后已 `git checkout --` 还原）：

- `nhp-018-perf-01-run{1,2,3}.json`
- `nhp-018-load-01-run{1,2,3}.json`
- `summary.json`

**字段（逐文件）**: 均含 `gitSha` · `command` · `caps`（含 docker `HostConfig.NanoCpus`/`Memory`）· `N` · `c` · `rawLatenciesMs` · `p50`/`p95`/`p99` · `errorCount`/`errorRate`（LOAD 另有 `doubleReleaseCount`/`stuckReservationCount`）· `start`/`end` · `machine`（cpu/mem/kernel/node）。**完整：是**。

**Secret scan**:
```text
rg -n -i "(password|passwd|secret|token|bearer|cookie|set-cookie|postgres(ql)?://|mysql://|redis://|api[_-]?key|authorization|DATABASE_URL|PGPASSWORD)" ai-docs/delivery/receipts/uc018-perf-load/
→ NO_MATCHES
```
无真实 secret/DSN/凭证/env dump · **PASS**（localhost host:port 未出现带凭证 DSN）。

Implementer `summary.json` 记 `gitSha=8c7ee0c…`（见 disclosure #1）。

---

## cap ruling

**事实（runner + 回执）**:

- `scripts/run-e2e-isolated.mjs`：仅 `uc018:perf-load:prove:raw` 对 **PG** 容器加 `--cpus 2 --memory 4g`。
- `scripts/uc018-perf-load-capped-child.mjs`：prove 进程跑在 **api** docker（`--cpus=2 --memory=4g`），`docker inspect` 写入 caps evidence。
- 回执/本人复跑观测：`NanoCpus=2000000000`（≤2e9）· `Memory=4294967296`（≤4GiB）· `pg.ok=true` · `api.ok=true` · `enforced=true`。
- LOAD 路径：**无**单独 `apps/worker` 容器。LOAD 的「worker」分面 = 经 **capped API** 的 abandon→release→`ai_graph_run` safe-terminate；脚本内 `workers` 仅为客户端 Promise 并发池。  
  `PostgresSaver` 在 worker 运行时注入；本 prove **未**启动 worker 进程，图终态由 `abandonInterviewAndRelease`（`packages/db/src/commerce.ts`）在 **同一 capped API+PG** 上 CAS 到 `safely_terminated`。

**裁定**:

- **PERF-01（api-only）**: api+pg 已封顶 → **PASS**（可 partial）。
- **LOAD-01（worker/api）**: 测量路径上 **无 uncapped 独立 worker 进程**；worker 分面工作落在 **已封顶 api** 内 → cap 条件 **满足** → **PASS**（可 partial）。  
  已提交文档中 **无** `loadWorkerUncapped=true` / 「api-capped, worker-uncapped」钉；因事实并非 uncapped worker，**不**构成 LOAD partial blocker。
- Disclosure #2（「worker path may not be capped」）: 对本刀实测路径 → **不成立为 blocker**（澄清：无独立 worker 容器；非「有 worker 但未封顶」）。

---

## my independent run

**命令**: `pnpm uc018:perf-load:prove` @ HEAD 含 `b29c191` · 洁树 · 输出 tee → `/workspace/uc018-perf-load-rag-route-run/`（scratch；回执副本在 `my-run/`；随后 `git checkout -- ai-docs/delivery/receipts/uc018-perf-load/` 还原 tracked）。

| 项 | 我的复跑 | 阈值（冻结） | implementer（tracked · gitSha=8c7ee0c） |
|---|---|---|---|
| **EXIT** | **0** | EXIT=0 才可 elevate | 声称 0 |
| **gitSha 记录** | `b29c191543dfbe7c1afa4278c550340a3339f295` | Step A 须为祖先；复现应记含 runner 的 SHA | `8c7ee0c…`（disclosure #1） |
| **caps** | pg+api NanoCpus=2e9 Memory=4GiB enforced=true | ≤2 vCPU / 4 GiB | 同形 |
| **PERF r1** | p50=22.6 p95=66.5 p99=93.7 err=0 | p50≤250 p95≤750 p99≤1500 err≤0.5% | p50=25.2 p95=57.2 p99=71.9 err=0 |
| **PERF r2** | p50=20.2 p95=41.9 p99=61.7 err=0 | 同上 | p50=18.9 p95=48.3 p99=66.9 err=0 |
| **PERF r3** | p50=20.2 p95=45.1 p99=76.3 err=0 | 同上 | p50=17.6 p95=46.7 p99=67.4 err=0 |
| **LOAD r1–3** | err=0 · dbl=0 · stuck=0 · stuckGraph=0 | err≤1% · no double-release · no stuck | 同为 0 |
| **时间戳** | 2026-09-24T02:53:45Z–02:53:47Z（UTC）≈ **19:53 PT** | — | 02:46:13Z–02:46:15Z |
| **vs 阈值** | **全达标** | — | 达标 |
| **vs implementer 发散** | 最坏 p99 比 ≈1.30×（&lt;2×）· 记 note 非 FAIL | — | — |

**结论**: 本人数字独立达标 · **未**把 peer/implementer 数字当作本人证据。

---

## disclosure #1 / #2 / #3 rulings

### #1 — receipts gitSha=8c7ee0c vs uncommitted-at-run runner
- **事实**: implementer tracked 回执 `gitSha=8c7ee0c`；runner（`uc018-perf-load-capped-child.mjs` + proof.ts）在 **`b29c191`** 才入库 → 回执 **不能** 作为「已提交 runner SHA」的可复现证据。
- **裁定**: disclosure **成立（implementer 缺陷）**；本人于 **`b29c191` 洁树独立复跑 EXIT=0** 治愈 dual 侧复现要求 → **不**单独构成 overall FAIL。

### #2 — worker path may not be capped
- **裁定**: 见上 **cap ruling** → 本刀测量路径 **无** uncapped 独立 worker → **非 LOAD blocker**。若未来 LOAD 真拉起独立 worker 容器且未封顶、又无文档 pin → 则 LOAD partial **FAIL**。

### #3 — covered-lift-reassess still computes canHonestlyFlip
- `git diff 8c7ee0c^ b29c191 -- scripts/uc-e2e-018-covered-lift-reassess.proof.mjs`：列状态仍从 matrix/NHP **读取**；`refuseReasons` 含 `PERF/LOAD partial≠covered`；布尔现为 `let canHonestlyFlip = false` 硬初始化 + knife hard-refuse（不再从 true 按六列降级）。
- **复跑**: `pnpm uc018:covered-lift-reassess:prove` → **EXIT=0** · `canHonestlyFlip=false` · refuse=`PERF/LOAD partial ≠ UC covered …` · columns PERF=partial LOAD=partial · matrix UC-E2E-018 **partial** · **未**翻 §1.1 covered。
- **裁定**: **结果 PASS**（期望 false · §1.1 仍 partial · Ban假关）。方法注记：布尔硬 init false（非纯六列推导）；refuse 仍矩阵驱动 · 非 skipped check · **不**因此 overall FAIL（未返回 true / 未翻 covered）。

---

## PG path

| 检查 | 结果 |
|---|---|
| 隔离栈真实 Postgres 容器 | **YES** · `run-e2e-isolated` 起 `pgvector/pgvector:pg16` · 本跑 `meetwise-e2e-1496305-…` |
| `_neg-harness` boot → Nest + `DbService.pool` | **YES** · 非内存假库 |
| LOAD 图终态 | seed `ai_graph_run` → abandon → `abandonInterviewAndRelease` → `safely_terminated` SQL CAS |
| MemorySaver / 纯内存 checkpointer | **未**用于本 prove |
| MySQL / Qdrant 业务切流 | **未** · Ban reopen STOPPED R5 |
| PostgresSaver | worker 产品路径持有；本 prove 走 API abandon 的 PG 对齐终态，**非** MemorySaver 夹具 |

**PG path: YES**（真实 PG + 产品 abandon/graph 终态路径）。

---

## reassess result

- **CMD** `pnpm uc018:covered-lift-reassess:prove` · **EXIT=0**
- **canHonestlyFlip**=`false`
- **refuse**=PERF/LOAD partial ≠ UC covered（matrix §0.5/§1.0）
- **§1.1** stays **partial** · Ban invent covered · Ban假关
- coveredCount=8 · releaseEvidence=false · NOT_HA · claimProductionHA=false **retained**

---

## retained family EXITs

Harness 写 Family CMDs **not_run this open**（cite prior）；本人仍复跑：

| CMD | EXIT |
|---|---|
| `pnpm uc018:covered-lift-reassess:prove` | **0** |
| `pnpm eval-harness-matrix-cite:prove` | **0** |
| `pnpm uc018:adv:prove` | **0** |

---

## pins

| pin | 状态 |
|---|---|
| haStatus=NOT_HA | **HOLD** |
| releaseEvidence=false | **HOLD** |
| claimProductionHA=false | **HOLD** |
| coveredCount=8 | **HOLD** |
| gR45Closed=true | **HOLD** |
| ms3EqualsR4Closed=false | **HOLD** |
| alone≠dual | **HOLD** |
| local PERF/LOAD ≠ capacity ≠ HA | **HOLD** |
| PERF/LOAD partial ≠ UC covered · §1.1 partial | **HOLD** |
| thresholds vs 30943df | **未放宽**（同 p50≤250 / p95≤750 / p99≤1500 / err≤0.5% · LOAD err≤1% · N/c 同）· 仅 status **case-only→partial** |
| no invented covered | **HOLD** |

---

## blockers

**无**。  
（已治愈/已澄清：#1 由本人 `b29c191` 复跑覆盖；#2 无 uncapped 独立 worker；#3 结果 false。）

若回归：LOAD 拉起独立 worker 且未封顶又无文档 pin → LOAD partial blocker；阈值事后放宽或 miss 仍 EXIT=0 → FAIL；§1.1 翻 covered → FAIL。

---

## harness left

`ai-docs/delivery/harness/uc-e2e-018-perf-load.md` **未编辑** · 仍 **`executed:awaiting_post_prove_dual`** · Ban self-nail。

复跑后 tracked receipts **已还原** HEAD · 树洁（仅本 receipt 待提交）。

---

## signature

**mw-rag-route** · 2026-09-23 · post-prove dual · Verdict **PASS** · Ban Meridian · Ban Cloud Agent · Ban `.env*` · Ban invent covered · Ban假关 · Ban forge peer
