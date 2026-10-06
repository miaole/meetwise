# Re-PRE ×4 · **AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause fix** · mw-e2e-ha

**Verdict**: **PASS**（单方 · docs gate · 非 dual）
**时间**: 2026-10-06 21:25 +08:00
**REWRITE_SHA**: `b5633f0f20e887ce733d1d3778dedf48357ef176`（`b5633f0` · supersedes `083cce4` → `1b74fb1` → `553cfc5` → `110532e`；docs-only 4 files：harness / slice / 两个 stub）
**Cites own prior FAIL**: mw-e2e-ha Re-PRE3 FAIL `70cba947798c7fb33f7fa4a8a1ec8609ef6bc610`（`reviews/REQUEST-2026-10-06-an-perf-tear-rewrite3-re-pre-mw-e2e-ha.md` · 新阻塞 1 B/C-MUT）· 更早 FAIL `20da721` / `7e97dc3` / `152b665` retained
**Peer**: mw-rag-route —— 对 `b5633f0` 截至本审**尚无收据**（origin tip = `b5633f0`）；其 Re-PRE3 PASS `dbed2f2` @083cce4 **仅引用，不代签**。本审独立。alone ≠ dual：本 PASS 单方，dual 须 peer 对 `b5633f0` 另出 PASS。
**审查基**: 临时 worktree `/tmp/e2eha-b563` @ `b5633f0`（detached）· 只读 · 无 prove / 无 docker 操作 · 未读 `.env*` · 无 live 模型调用 · 只读核对 `node_modules/.pnpm/pg@8.22.0`、`pg-pool@3.14.0_pg@8.22.0` 源码
**Scope**: PRE / docs gate only · Ban coding · Ban AUTHORIZE · Ban nail · 不触碰 RAG（POST @`7c67b4a` 另轨）· HOLD AN-CIMG-EA · Never Meridian · QUOTA WIND-DOWN（本审只做本 re-PRE，不开新线）

## Hard pins（frozen · 本审不改）

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · g7SuiteGreen=false · backlog `gap-bug-backlog.md:35` C-PERF-TEARDOWN **CONDITION OPEN**（`083cce4..b5633f0` 零改动）· attempt1 @ `b29c191` 不洗 · UC-018 / §1.1 stays partial

## 代码基核对（行号漂移 · 防假锚）

- `git diff --quiet 083cce4 b5633f0 -- principal.ts / uc-e2e-018-perf-load.proof.ts / uc018-receipt-backfill-emit.mjs / uc018-perf-load-capped-child.mjs / pool-error-listener.proof.ts / gap-bug-backlog.md` EXIT 0。
- `ac03f30..b5633f0` 区间 `scripts/ packages/ apps/` 零改动（余下仅 RAG receipt + 本 4 docs）→ harness 以 `ac03f30` 为 CODE 锚成立。
- runner `083cce4..ac03f30` 唯一改动 = RAG C-3 注册：`+15` @`:1286-1300` · `+1` @`:1466` · `+2` @`:1712-1713` → 其后 **+18**。逐行 `sed -n` 实测：`:1744` 容器名 · `:2193-2194` caps `--cpus 2 --memory 4g` · `:2200` `run --rm -d` · `:2269` finally · `:2270` 诊断 · `:2271` 自有 `rm -f` · `:2039` `docker_diagnostic_unavailable` .catch；与 `083cce4` 的 `:1726/:2175/:2182/:2251-2253/:2021` 内容逐字一致 ✓。**runner +18 重锚成立**。

## `70cba94` 新阻塞 1 核对（B/C-MUT Unhandled 在 seed pool.query 窗口不可推出）→ **已解除（契约层）**

选 (ii)（本方 `70cba94` 所列修复项之一，且 §4 `:156-159` 写死「A 用 MUT-929 / B·C 用 MUT-ZERO · Ban 事后换」，§5.4 `:308` Ban 交叉使用）。

| 检查 | 结论 | 独立依据 |
|---|---|---|
| **MUT-ZERO = 同删 `:929` + `:931`** | ✓ | `principal.ts:928-931` 源码：`:929` `client.on('error')`（在 `on('connect')` 内）· `:931` `pool.on('error')`；全仓 `db_pool_error` 唯一发射点 `principal.ts:896`（`rg` apps/api/src + packages/db/src + proof + _neg-harness），无 `process.on('uncaughtException'/'unhandledRejection')` → MUT-ZERO 真正零观测者；`:928/:930` 空壳非 error 监听 ✓；施加判据 `2 deletions(-)` ✓ |
| **Unhandled on Client \| BoundPool** | ✓ | `principal.ts:10` `const { Pool } = pkg` → `pg/lib/index.js:14` `class BoundPool extends Pool` → Node 打印 `Emitted 'error' event on BoundPool instance` ✓。idle client：`pg-pool index.js:51-62` idleListener → `:62` `pool.emit('error')`，MUT-ZERO 下无监听 → 在 socket 'end' 处理器内同步抛 → Unhandled on BoundPool ✓ |
| **逐子步推导 §5.2b `:272-278`** | ✓ | asPrincipal（`:945-955`）间隙：checkout 去 idleListener（`index.js:344`）→ `client.js:198-217` 'end' → `:411-417` 同步 emit → Unhandled on Client ✓。asPrincipal active query + 57P01：`:432-433` 回调 → `:954` catch 发 ROLLBACK（client 仍 `_queryable`）→ ROLLBACK 只在 'end' 时经 `:131-135` nextTick 拒绝，而 `:217` emit 同步在先 → Unhandled on Client 先于 seed reject ✓。checkout 间隙：全 idle → BoundPool ✓。pool.query（`index.js:455-464` `once('error')`）：自身 client 被接住，idle client 先分发 → BoundPool；自身先分发 → `onError` → `cb(err)` → TLA（`proof.ts:145/:441-444` 顶层 await）reject 在该 I/O 回调的 tick/microtask 排空内终止进程 → 无 Unhandled ✓ = 文中「残余」 |
| **`db_pool_error=0`（MUT）/ ≥1（POST）判别力** | ✓ | MUT-ZERO 无观测者 → 出现即 `MUT_NOT_APPLIED` FAIL（`:168/:170`）；POST socket 路径：`:929` 于 `connect` 时先挂，先于 pool.query `once` 同步运行 → ≥1 必然（`:171/:275`）；B 的 57P01 + FATAL 落 active pool.query → `release(err)` → `_ending` → 不 emit → 可 0 → 事前钉 `INJECT_KIND_POOLQUERY_RACE`（`:169`）✓。`70cba94`「MUT≡POST 无判别力」点关闭 |
| **`idle_n≥1` 前置** | ✓（见 NB-e） | §5.0 `:201` 同快照 `state='idle'` client backend 计数 · `idle_n=0` → `INJECT_PRECOND_NO_IDLE`（不注入 · FAIL 计入）· §5.1a `:226-228` 同语句 |
| **`POOLQUERY_RACE` 钉 FAIL** | ✓ | `:168/:169/:170/:275` 事前钉死 · 格 FAIL · 计入 3 次 · Ban retry · Ban 不计入（`:308`）· 判据可观测（EXIT 1 + 无 Unhandled + 栈含 `seedAbandonTargets`）· 比例「未实测 · 不臆造」✓。与 `70cba94` 修复 (i) 明示可接受的「格 FAIL 且计入 3 次」口径一致 → **非假清**：契约确定，不承诺 3/3 绿 |

## C1–C4（= peer `dbed2f2` 条件 1–4 · 引用不代签）

- **C1 同快照阶段 SQL** ✓：§5.1a `:217-253` 单条 `WITH iv/idle/tgt/k … SELECT … INTO r`；`tgt`/`k` 各引用两次 → 物化一次，`pg_terminate_backend` 每行一次；`k` 受 `iv.n BETWEEN 1 AND 109` 约束 → 非 seed 不终止（`:256`）。源码对齐：seed id = `` `${prefix}_${i}_${S}` ``（`proof.ts:230`，`prefix=IV_P018_R${run}` `:273`；LOAD 用 `IV_L018_` `:338` 不撞）→ `LIKE 'IV\_P018\_R3\_%'` ✓；`:233` 以 `status='active'` 插入、`reserveEntitlement`（`commerce.ts:36-`）不改 interview → seed 内 `iv_nonactive=0` ✓；abandon 置 `abandoned`（`commerce.ts:275/:296`）→ warmup/measured 判别 ✓；110 轮（`WARMUP=10` `:31` + `N=100` `:33`）；末轮 `iv_rows=110∧na=0` → `INJECT_PHASE_BOUNDARY` FAIL（`:178/:240`）✓。B/C 门控 `INSERT INTO interview%` 与 `:233` 文本匹配 ✓；`iv_rows≤100` 余量 + 快照→CMD 耗时必录 + `INJECT_PHASE_DRIFT`（`:181`）✓
- **C2 57P01 存在** ✓：A-MUT `:166` / A-POST `:167` 只以 57P01 **存在**为判据；CTU 允许、永不以其有无作判据；`A_FATAL_ON_ACTIVE` FAIL 计入；§5.1「所证」`:212` 收窄（不断言 attempt1 = socket 被杀）✓
- **C3 单次容器内 psql 循环** ✓：§5.0 `:196` 一次 `docker exec -i … psql`，`pg_stat_clear_snapshot()` + `pg_sleep(0.005)` + 10 s 上限 → `INJECT_GATE_TIMEOUT`；Ban 两次 exec（`:308`）；反应上限 ≤1 s + 两时间戳（`:189`）；`^LOAD run2: ` 对齐 `proof.ts:430-431`、`<PG>` 对齐 runner `:2214` ✓
- **C4 AUX EXIT** ✓：§5.4 `:293-306` R2 run/port/pg_isready/rm、NB-4 清理、J-2 events/pgrep/ps、B 端口、MUT 施加/还原均有期望 EXIT + 输出判据；偏离 → `AUX_EXIT_UNEXPECTED`（见 NB-g）

## Cleared stay（无回退 · 抽查）

- Inject A `state='idle in transaction'`（`:200/:231`）+ 57P01 · A ≠ attempt1 · A 仍 MUT-929（`:157/:280`，与 `083cce4` 同义）✓
- T1 = run3 PERF seed（`:131/:189`）· 阶段表 warmup `INJECT_PHASE_WARMUP` FAIL / measured FAIL / C OK keep（`:173-183`）✓
- NB-1..4（`:283-290`）· J-2 EXTERNAL-OTHER + L3-sim（`:119-121`）✓
- B1(a)(b) §2.1/§2.2 · L1 `:928-931/:886/:872` · R2 DB source（§6 `:315`）· B2/B5/B6 ✓；+12 历史披露原样（`:63`）
- 两 stub Verdict 均 `PENDING`，core 未代填；rag-route stub `## PRE-EXEC @110532e` 起历史段与 peer `dbed2f2` 逐字一致（diff 空）；e2e-ha stub 历史段与 `083cce4` 一致 ✓
- 无 invent covered / HA；无新增产品 locus；`principal.ts` / `proof.ts` / runner / `client.js` / `index.js` 所引行逐一核对无漂移

## 阻塞项

**无阻塞。**

## 非阻塞（执行前建议补齐 · 均不产生假绿，只可能致诚实 FAIL）

- **NB-e · `idle_n≥1` 不充分**：seed 串行时其自身 client 在 checkout 间隙即为 `state='idle'`，可单独满足 `idle_n≥1`；若池中仅此一 client，断开落 pool.query 窗口则无他 idle client → 确定性 `POOLQUERY_RACE`。实际 LOAD run2 c=20 后池通常多 client，但建议门控改 `idle_n≥2` 或另录 `pool.totalCount`。
- **NB-f · B/C 余量未实测**：`iv_rows≤100`（≈10 轮 seed）对比 `docker restart/rm -f` CLI 往返；不足时 B/C-POST 记 `INJECT_PHASE_DRIFT`（已钉 FAIL）。建议执行前记一次本机 CLI 往返基线。
- **NB-g · `docker events` SIGTERM → `wait`=143 假设**：部分 docker CLI 版本捕获 SIGTERM 后以其他码退出；若不符将系统性触发 `AUX_EXIT_UNEXPECTED`。建议执行前先在本机单测一次该期望，或事前钉 {143, 0} 两值（须在 AUTHORIZE 前写死，Ban 事后改）。
- **NB-h · 「同一 microtask 检查点」措辞**：准确表述为「该 socket I/O 回调结束后的 nextTick/microtask 排空内、下一 socket 回调分发前」；结论不变。
- **NB-i · R2 `pg_isready` 与 entrypoint 初始化临时服务器**：容器内 socket 上可能先就绪后重启；已由 `R2_ENV_FAIL` 兜底（≠ 绿）。

## Spot-check 清单（全部只读）

- `git rev-parse b5633f0` = `b5633f0f20e887ce733d1d3778dedf48357ef176` · `git ls-remote origin feat/mysql-schema-skeleton` = 同值 · `ac03f30` 为其祖先
- harness @b5633f0 `:20-32/:75-83/:144-183/:185-308/:310-354` 全文读过；slice / 两 stub diff 读过
- `principal.ts:10/:869-933/:945-955` · `commerce.ts:36-100/:275/:296`
- `uc-e2e-018-perf-load.proof.ts:31/:33/:145/:227-247/:271-284/:338/:430-431/:441-444`
- `apps/api/src/platform/db.service.ts:7` · `_neg-harness.ts:43-59`
- `pg@8.22.0 lib/client.js:127-146/:198-224/:411-434` · `lib/index.js:13-16` · `pg-pool@3.14.0 index.js:51-63/:338-350/:452-486`
- runner `:1744/:2039/:2193-2194/:2200/:2214/:2269-2271`（vs `083cce4` `:1726/:2021/:2175/:2182/:2251-2253`）
- backlog `:35`（OPEN · 未改）

## 结论

`70cba94` 新阻塞 1 由 (ii) MUT-ZERO（`:929`+`:931`）+ Client|BoundPool 签名 + `db_pool_error=0` + `idle_n≥1` 前置 + `INJECT_KIND_POOLQUERY_RACE` 事前钉 FAIL **在契约层真实解除**，非假清：剩余竞态已事前计分，不靠事后改期望。C1–C4 已落实；runner +18 @`ac03f30` 实测成立；cleared stay 无回退。**无阻塞 → PASS（单方）**。

Ban coding（直到 BOTH PASS + 协调方 AUTHORIZE）· 本审不 AUTHORIZE · Ban nail · Ban self-approve · Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · backlog `:35` CONDITION OPEN · peer mw-rag-route 对 `b5633f0` 尚无收据、`dbed2f2` 已引用未代签 · alone ≠ dual · releaseEvidence=false · NOT_HA · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · 不触碰 RAG POST @`7c67b4a` · HOLD AN-CIMG-EA · Never Meridian。

Verdict: PASS
