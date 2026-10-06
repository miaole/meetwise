# Harness — **C-PERF-TEARDOWN · product rootcause fix**（Line AN-PERF-TEAR · docs REQUEST rewrite **re-PRE** · **`draft:awaiting_pre_exec_dual`** · CONDITION may stay OPEN · Ban wash attempt1）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST rewrite **re-PRE** · supersedes REQUEST `110532e` · cites mw-rag-route PRE-EXEC FAIL `152b665` **B1–B6** · Ban coding · Ban prove · Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false**
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` tip（includes AN-PRIV-EXT / AN-MOP-Q45 PRE as ancestors · Ban touch sibling AN files · Ban re-open AG/AI/AK · Ban AN-CIMG-EA）
**Prior REQUEST**: `110532e81f11064e543bc9bc420b67bb2f95ae1e`（pre_dual · **superseded by this re-PRE rewrite**）
**FAIL receipt**（retained · 不擦除）: `152b665787e02ac6ef350551e599b3823a9fa763`（mw-rag-route PRE-EXEC FAIL on `110532e` · B1–B6）
**Wave**: Line **AN** REQUEST wave（this = **AN-PERF-TEAR** re-PRE）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING re-PRE · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **C-PERF-TEARDOWN product rootcause fix（AN-PERF-TEAR）**——针对 mid-prove pg Client teardown / unhandled crash 的 **产品根因修复** REQUEST（≠ Line S Branch A 复跑证据刀 · ≠ Line AE CONDITION residual 容器可达证据刀）
**Gap id**: **`C-PERF-TEARDOWN`**（backlog `gap-bug-backlog.md:35` · P1 · **CONDITION OPEN** · 本刀不改名、不翻行）
**Parent context（只读 · cite · distinct knife）**:
- Line S `harness/gap-perf-teardown-rootcause-fix.md` — Branch A re-run / close-evidence · NAIL `post_prove_dual_pass` · CONDITION OPEN retained
- Line AE `harness/c-perf-teardown-condition-residual.md` — container-reachability residual · NAIL `post_prove_dual_pass` · CONDITION OPEN retained · R-A Linux-native-Docker-Engine only
- **本刀 = 新产品根因修复轨** · 不扩写旧 harness · 旧文件只读引用 · Ban wash Line S / AE greens as product close

## Rewrite note（re-PRE · supersedes `110532e` · FAIL `152b665` B1–B6）

本稿解除 mw-rag-route PRE-EXEC FAIL `152b665` 阻断项 **B1–B6**。e2e 与 rag 均须对本稿 **re-PRE dual**。**不**擦除 FAIL 收据正文（见 rag stub 历史段）。**Ban wash attempt1** · **Ban UC-018 covered flip** · CONDITION stays OPEN。

| # | 阻断（`152b665`） | 本稿修订 |
|---|------|------|
| **B1** | 无代码锚点 / 根因假设 | §2 具名 4 cleanup loci + 可证伪判据 + 书面初判（P-FIX / P-HOLD / 另开 harness 刀） |
| **B2** | 产品 vs harness/infra 未拆 | §2 每落点标 PRODUCT / HARNESS / INFRA；**P-FIX 只动具名产品文件**；emitter `:559` ≠ product close |
| **B3** | CMD/EXIT 未钉（含「或 PRE 选定」） | §4 钉死完整 wrapper CMD · attempts=3 · 各 outcome EXIT · code SHA + +08:00 时间戳 · **无**「或 PRE 选定」 |
| **B4** | 无故障注入 / 正控 / 变异 | §5 钉 `pg_terminate_backend` **或** 仅 `docker restart` 本 run 自有容器 · pre/post/mut 期望 |
| **B5** | 回归未具名 | §6 具名回归 + EXIT0 · Ban 借绿当本刀证据 |
| **B6** | 证据层 / 宿主 / 串行未声明 | §7 隔离真 PG · Linux-native Docker · serial `docker ps` 清零 · **Ban** 经 emitter `:559` 跑本刀 |

## 0. 为何新开文件（distinct from AE residual）

Line S 已封存读码判定（P 池监听结构性覆盖 attempt1 路径）+ Branch A 复跑 0/0/0 · **仍 CONDITION OPEN**。Line AE 已封存容器可达 R-A 证据（Linux-native）· Desktop ECONNREFUSED class 未关 · **仍 CONDITION OPEN**。本刀 **新开** `c-perf-teardown-product-rootcause-fix.md`：产品面根因修复 + 具名 prove；若根因落在 harness/infra（尤其 emitter `:559` 全局 `docker rm -f`），诚实 **P-HOLD / 另开 harness 刀** · **不关 CONDITION**。**Ban** 把 AE residual 绿洗成本刀产品关闭 · **Ban wash attempt1 @ `b29c191`**。

## 1. Quoted from the files（只读 · 零改写）

- backlog `:35` **C-PERF-TEARDOWN**：「disclosed, not washed, not closed · attempt1 EXIT 1 (pg Client terminated mid-prove) · attempt2 EXIT 0 · PERF/LOAD stays local partial」。
- attempt1 @ `b29c191` / `b29c191543dfbe7c1afa4278c550340a3339f295`：**EXIT=1** · mid-prove `Unhandled 'error' event` · `Connection terminated unexpectedly` @ `pg/lib/client.js` · **Ban wash**。
- Line S NAIL：CONDITION OPEN retained · canHonestlyFlip=false · Ban close from re-run alone。
- Line AE NAIL：CONDITION OPEN retained · Ban Desktop ECONNREFUSED 假关 · Ban Branch B invention（AE 范围）。
- backlog `:35` 语境：attempt1 发生在 “PERF-LOAD teardown during backfill”（发射器路径下）→ emitter 全局清理是必须排除或确认的 harness/infra 候选根因。

## 2. B1+B2 · 四 cleanup loci · 分层 · 书面初判

| # | Locus（file:line @ tip） | Layer | 行为（只读） | 可证伪判据 | 书面初判 |
|---|--------------------------|-------|--------------|------------|----------|
| **L1** | `packages/db/src/principal.ts:928-931`（`pool.on('connect')` → `client.on('error', observePoolError)`；`:932` `pool.on('error', …)`；`:870-900` 注释：只观测、不恢复） | **PRODUCT** | 池级 `db_pool_error` 观测（Line S 判定结构性覆盖 attempt1 路径） | 变异删 `:929` listener → mid-inject 出现 `Unhandled 'error' event` / EXIT≠0；保留 listener → 有 `db_pool_error` 观测、无未处理崩溃 | **P-FIX 唯一合法产品文件**（若双审确认仍有未覆盖产品面）。若 mid-prove 仅在 emitter 并发全局 rm 下复现 → **不**以 L1 关 CONDITION |
| **L2** | `scripts/run-e2e-isolated.mjs:1714`（`meetwise-e2e-${pid}-${ts}`）+ `:2239-2241`（finally 仅 `docker rm -f` **自己的** `container`） | **HARNESS** | 隔离壳自有容器生命周期 | 本 run 容器名与 `docker rm -f` 目标恒等 · 不扫他线 | **非 P-FIX** · harness 自管 · Ban 当产品关闭 |
| **L3** | `scripts/uc018-receipt-backfill-emit.mjs:555-560`（`:559` 对**所有** `meetwise-e2e*` / `meetwise-uc018*` `docker rm -f`）；try 内 `:206`/`:226`/`:248` `process.exit()` 可跳过 finally | **INFRA** | 发射器全局误杀他线容器 → 可致 running PG `Connection terminated unexpectedly` | 并发另一 emit 时本 run PG 被外部 rm · 日志见他 PID 容器消失 | **≠ product close**。若确认为本刀根因 → **另开 harness/emitter 刀** · CONDITION 保持 OPEN · **Ban** 以「产品修复」关 `:35` |
| **L4** | `scripts/uc018-perf-load-capped-child.mjs:18`（`meetwise-uc018-perf-api-${pid}-${ts}`；落在 emitter `:559` 过滤范围）+ `:105-159` | **HARNESS** | capped API 容器 · 可被 L3 误杀 | 容器名匹配 emit 过滤 · 仅本 run PID | **非 P-FIX** · harness |

**P-FIX 范围硬钉（B2）**:
- **只准**改具名产品文件：`packages/db/src/principal.ts`（及授权后明确追加的同层产品面；本 REQUEST 默认仅此）。
- **禁止**以 P-FIX 名义改 `run-e2e-isolated.mjs` / `uc018-receipt-backfill-emit.mjs` / `uc018-perf-load-capped-child.mjs`。
- **emitter `:559` 全局 `rm -f` ≠ 产品关闭条件** · 确认后另开刀。

**初判摘要（书面 · 非推给 PRE）**: attempt1 语境在 backfill/emit 下 → **优先排除 L3 INFRA**；L1 已有观测钩子（Line S）→ 若无 inject 复现 unhandled，倾向 **P-HOLD（产品码已覆盖）+ 另开 emitter harness 刀**；若 inject 在无 L3 干扰下仍 unhandled → **P-FIX 仅限 L1**。CONDITION 无论 P-FIX/P-HOLD **may stay OPEN** until honest path proved + dual + 协调方授权。

## 3. 本刀目标

| Outcome | 判据（授权后） | 仍须保留 |
|---------|----------------|----------|
| **P-FIX · 产品修复** | §2 初判 + dual 确认 L1 未覆盖面 → 最小改 `principal.ts` + §4–§5 prove | CONDITION **may stay OPEN** · attempt1 retained · Ban UC-018 covered flip |
| **P-HOLD · 无需产品码改** | 根因在 L3/L2/L4 或 L1 已足 → docs 诚实 HOLD · **另开 harness 刀若 L3** · **不关 CONDITION** | 同上 · HOLD ≠ 关闭 |

**明确非目标（Ban）**:
- **Ban wash attempt1 @ `b29c191`**（EXIT=1 历史永久保留）
- **Ban UC-018 covered flip** · Ban invent covered · Ban coveredCount invent
- **Ban close CONDITION** without honest fix proved + dual + 协调方授权
- **Ban wash AE residual** / Line S Branch A 绿为本刀产品关闭
- Ban 以 emitter `:559` 修复冒充产品 close · Ban Branch B invention 冒充本刀
- Ban HA/capacity/suite-green · Ban buy cloud · Ban Meridian · Ban secrets · Ban Redis cutover · Ban MODEL-OP closed claim

## 4. B3 · LOOP §3③ · 钉死 CMD / attempts / EXIT（无「或 PRE 选定」）

**Primary CMD（唯一 · 钉死）**:

```text
./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove
```

| 项 | 钉死值 |
|----|--------|
| **Script** | `pnpm uc018:perf-load:prove` → `run-e2e-isolated.mjs uc018:perf-load:prove:raw` → `uc018-perf-load-capped-child.mjs` |
| **Wrapper** | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL`（Ban live Key） |
| **Attempts** | **3**（全录 · Ban retry-to-green · Ban 丢 attempt） |
| **Timestamps** | Asia/Shanghai（+08:00）+ **code SHA** per attempt |
| **EXIT · 正控（无 inject）** | **0**（跑完 SUMMARY · 零 `Unhandled 'error' event`） |
| **EXIT · 修复前 / 变异（§5 inject）** | **≠0** 或进程崩溃 / `Unhandled 'error' event`（诚实记录） |
| **EXIT · 修复后 + inject** | 按设计：**有** `db_pool_error` 观测 · **无** unhandled · EXIT 按 errorRate/missReasons 诚实（可为 1）· **Ban** 伪装 0 |
| **Ban** | 「或 PRE 裁定之产品面专用 prove」类含糊措辞 · 本 REQUEST **仅**上表 CMD |

## 5. B4 · 确定性故障注入 · 正控 · 变异

| 项 | 钉死 |
|----|------|
| **注入手段（二选一 · 仅本 run 自有资源）** | (A) 对本 run PG backend `SELECT pg_terminate_backend(pid)`（仅本容器内 backend）· **或** (B) `docker restart meetwise-e2e-${pid}-…`（**仅**本 run `:1714` 容器名） |
| **Ban** | 全局 `docker rm -f` · 经 emitter `:559` · 杀他线容器 · 非本 run 资源 |
| **正控（PC）** | 无 inject · CMD ×3 · 期望 EXIT **0** · 零 unhandled |
| **预（pre-fix / baseline mut）** | 临时移除 `principal.ts:929` `client.on('error', …)`（或等价变异）+ inject → 期望 `Unhandled 'error' event` / EXIT **≠0** |
| **后（post-fix）** | 保留 L1 观测（或 P-FIX 后）+ inject → 期望结构化 `db_pool_error` · 无 unhandled · EXIT 按设计诚实 |
| **变异（MUT）** | 同上 pre 变异 · EXIT≠0 为红断言通过条件 · Ban 借红当绿 |

## 6. B5 · 具名回归 + EXIT

| # | CMD | 期望 EXIT | 说明 |
|---|-----|-----------|------|
| R1 | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove` | **0** | Line S Branch A 同 CMD · Ban 借绿关本刀 CONDITION |
| R2 | `pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts`（C'' / GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER pool 观测 FI） | **0** | 池观测回归 · Ban 借绿 |
| R3 | `pnpm uc018:receipt-backfill:prove` | **0** | UC-018 相关 · Ban 借绿 · Ban covered flip |

**Ban** 将 R1–R3 绿记作本刀产品关闭证据 · **Ban UC-018 covered flip**。

## 7. B6 · 证据层 · 宿主 · 串行

| 项 | 钉死 |
|----|------|
| **证据层** | `run-e2e-isolated.mjs` **隔离真 PG**（default image `pgvector/pgvector:pg16` · `:1714` 容器）· Ban fake DB |
| **宿主类** | **Linux-native-Docker-Engine**（Line AE R-A）· Desktop / macOS Docker Desktop **不在本刀范围** |
| **串行** | 每次 prove **前** `docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018` 必须为 **0** 行；有他线 prove 时 **不得** 跑本刀 |
| **Ban emitter** | **禁止**经 `uc018:receipt-backfill:emit`（`:555-560` / `:559` 全局 `rm -f`）跑本刀 prove / inject |
| **Inject 范围** | 只准本 run 自有容器 / backend（§5） |

## 8. 行语义（冻结）

- backlog `:35` **C-PERF-TEARDOWN stays CONDITION OPEN** · canHonestlyFlip=false · PERF/LOAD local partial · capacityRepresentative=false · coveredCount=8
- UC-018 / §1.1 stay **partial** · Ban covered flip
- Line S / Line AE nails **原样保留**（只读 cite）
- 本 REQUEST 零触碰 backlog `:35` / checklist / 矩阵 / UC-018 行

## 9. Ban 列表

- Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）
- **Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · **Ban close CONDITION** without honest fix proved
- Ban wash AE residual / Line S as product close · Ban invent green · Ban HA/capacity claim
- Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push
- Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban 碰 sibling AN 文件 · Ban product/infra code this turn
- Ban Redis cutover · Ban MODEL-OP closed claim · Ban 经 emitter `:559` 跑本刀

## 10. Non-claims

Not a pass · not run · not closed · not fixed · not root-caused（直至授权 prove）· not HA · not SLO/LOAD · not capacity · not covered · not `releaseEvidence=true` · not nail · CONDITION OPEN · alone ≠ dual · ≠ AE residual redo · emitter `:559` ≠ product close

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false · backlog `:35` CONDITION OPEN · STOP

*Harness · C-PERF-TEARDOWN product rootcause fix · AN-PERF-TEAR re-PRE · supersedes 110532e · FAIL 152b665 B1–B6 · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban coding · Ban wash attempt1 · Ban UC-018 covered flip · CONDITION OPEN · cite AE residual parent · alone ≠ dual · STOP*
