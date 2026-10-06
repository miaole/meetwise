# Re-PRE ×3 · **AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause fix** · mw-e2e-ha

**Verdict**: **FAIL**
**时间**: 2026-10-06 21:10 +08:00
**REWRITE_SHA**: `083cce467657c1499f748f0073eeaee7bdd9392d`（`083cce4` · supersedes `1b74fb1` → `553cfc5` → `110532e`；docs-only 4 files：harness / slice / 两个 stub；`1b74fb1..083cce4` 与 `083cce4..dbed2f2` 区间 `packages/` `apps/` `scripts/` `package.json` 零改动）
**Cites own prior FAIL**: mw-e2e-ha Re-PRE2 FAIL `20da721c478f53cc7c13630f1533c4873a421501`（`reviews/REQUEST-2026-10-06-an-perf-tear-rewrite2-re-pre-mw-e2e-ha.md` · 阻塞 1 Inject A / 阻塞 2 phase）· 更早 FAIL `7e97dc3` / `152b665` retained
**Peer**: mw-rag-route Re-PRE3 PASS `dbed2f2098ee39f5bd83b7b2cfb0bb697bb4631f` @083cce4（2026-10-06 21:03 +08:00 落 origin）—— **仅引用，不代签**。本审独立；两方结论不同（PASS vs FAIL）→ **dual 不成立**。alone ≠ dual。
**审查基**: 临时 worktree `/tmp/e2eha-083c` @ `083cce4`（detached）· 只读 · 无 prove / 无 docker 操作 · 未读 `.env*` · 无 live 模型调用 · 只读核对 `node_modules/.pnpm/pg@8.22.0`、`pg-pool@3.14.0_pg@8.22.0` 源码
**Scope**: PRE / docs gate only · Ban coding · Ban AUTHORIZE · Ban nail · 不触碰 RAG-R3（@8d52138 另轨）· HOLD AN-CIMG-EA · Never Meridian

## Hard pins（frozen · 本审不改）

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · g7SuiteGreen=false · backlog `gap-bug-backlog.md:35` C-PERF-TEARDOWN **CONDITION OPEN**（`20da721..dbed2f2` 该文件零改动）· attempt1 @ `b29c191` 不洗 · UC-018 / §1.1 stays partial

## `20da721` 阻塞逐条核对（是否在 REQUEST 文本中真实解除，而非仅声称）

| `20da721` 项 | 结论 | 依据（harness @083cce4 行号 · 独立核对） |
|----|----|----|
| **阻塞 1 · Inject A 收窄 + per-kind 签名** | **对 A 已解除** | §5.0 `:181` 门控与 §5.1 `:188` 终止 SQL 均为 `state='idle in transaction'`（等值，排除 `active` / `idle` / `idle in transaction (aborted)`）；§5.2 `:195-200` 源码描述与 `pg@8.22.0 client.js:421-433`（无 active query → `:428` `_handleErrorEvent` → `:417` emit）、`pg-pool index.js:344`（checkout 去 idleListener）、`:464` `once('error')` 一致；A-MUT `:149` 要求 57P01 文本、**禁止**要求 `Connection terminated unexpectedly`；A-POST `:150` `db_pool_error`≥1 + 零 Unhandled；`:193` 明文 A ≠ attempt1；`:211` Ban `state<>'idle'`。A 只会命中 `asPrincipal`（`principal.ts:945-955`）手持事务 → MUT 删 `:929` 后 Unhandled、POST 由 `:929` 观测，推导成立（剩余微竞态见 NB）。**但同一类缺陷在 B/C-MUT 未处理 → 见新阻塞 1** |
| **阻塞 2 · phase pin + warmup FAIL 格** | **已解除（契约层）** | T1 `:168-173` 钉 run3 PERF seed（`proof.ts:274`，`:278` warmup 之前）；阶段期望表 `:156-162`：warmup 着陆 = `INJECT_PHASE_WARMUP` FAIL（EXIT 1 也记相位违规）、measured = `INJECT_PHASE_MEASURED` FAIL；`:164` EXIT=1 依据改为 seed 顶层 reject，并写明 `errMax`（`proof.ts:33`）只约束 measured、warmup `:278` 不计错；C `:161/:193` 保留（PG 永久消失 · 与阶段无关）。seed = 110 轮（`WARMUP=10` `:31` + `PERF.N=100` `:33`），紧接 `LOAD run2:` 打印之后（`:441-444`）。阶段**可观测性**有缺口（NB-a），但该缺口不产生假绿（POST EXIT 0 任何阶段都 FAIL） |
| NB carry · restart -t0 竞态 | 已钉 | `:30` / `:151` / `:206`（NB-1，收据必录实际文本） |
| NB carry · INJECT_MISS | 已钉 | `:189` / `:207`（stdout=0 → 格 FAIL · 计入 3 次） |
| NB carry · J-2 EXTERNAL-OTHER + L3-sim | 已钉 | `:105-107`；C-POST `:154` 必判 L3-sim |
| NB carry · R2 `meetwise-e2e-r2pool-*` 清串行 | 已钉 | `:209` / `:229` |

## Cleared stay（无回退 · 抽查）

- B1(a) J-1/J-2/J-3 · B1(b) 时序 / L2-self：§2.1 / §2.2 仅增两行判定表 + T1 seed 约束，其余与 `1b74fb1` 同。
- `:931`：`principal.ts:931` `pool.on('error', …)` · `:928-929` connect→`client.on('error')` · `:886` · `:872` 源码逐行核对 ✓。
- R2 DB source（§6 `:218`）无改 ✓。
- +12：`run-e2e-isolated.mjs:1726` 容器名 · `:2182` `run --rm -d` · `:2251` finally · `:2252` 诊断 · `:2253` 自有 `rm -f` ✓（源码自 `1b74fb1` 零改动）。
- B2（P-FIX 仅 `principal.ts` `:71`）· B5（R1–R3 EXIT0 `:217-221`）· B6（`:227-231`）✓。
- 两 stub Verdict 均 `PENDING`，core 未代填；rag-route stub `## PRE-EXEC @110532e` 起历史段与 `882efbc` 逐字一致（diff 空）✓。
- 无 invent covered / HA；无新增产品 locus；行号无漂移（`principal.ts` / `proof.ts` / runner / `client.js` / `index.js` 所引行逐一 `sed -n` 核对）。

## 阻塞项（反对项）

### 新阻塞 1 · B-MUT / C-MUT「`Unhandled 'error' event` · on Client」3/3 在已钉的 seed 阶段不可推出（与 `20da721` 阻塞 1 同类，rewrite ×3 只修了 A）

本稿把 T1 钉在 run3 PERF seed（`proof.ts:227-246`）。seed 每轮**交替**两种 checkout：`:232` `h.pool.query(INSERT INTO interview …)`（pg-pool `pool.query` 路径）与 `:236` `asPrincipal(...)`（`pool.connect` 手持）。B（`docker restart -t 0`）/ C（`docker rm -f`）在 CLI 往返之后才断开 socket，断开时刻相对 seed 子步是随机的（门控 `:182` 的命中时刻 ≠ 断开时刻）。按本仓锁定源码：

- 断开落在 `:232` pool.query 窗口：socket `'end'` → `client.js:198-217` → `_handleErrorEvent`（`:411-417`，同步 `emit('error')`）→ 由 `pg-pool index.js:455-464` 挂的 `client.once('error', onError)` 接住（`_errorAllQueries` 的 query 回调经 `client.js:132-134` `process.nextTick` 延后，emit 时 once 监听仍在）→ **无** Unhandled。
- 同时池内 idle clients（LOAD run2 c=20 刚结束，`idleTimeoutMillis=30000` `principal.ts:918` 未到）走 `index.js:51-62` idleListener → `pool.emit('error')` → **MUT 仍保留的 `principal.ts:931`** 接住 → 也**无** Unhandled（MUT 只删 `:929`，`:142`）。
- 断开落在两次 checkout 之间：同上，无 checked-out 无监听 client。
- 只有断开落在 `:236` asPrincipal 窗口（含其事务内 active query 时：`'end'` → `:217` 同步 emit，checkout 已去 idleListener）MUT 下才出现 `Unhandled 'error' event` / `Emitted 'error' event on Client instance`。

因此 B-MUT（`:151`）/ C-MUT（`:153`）要求的签名在 pool.query 窗口着陆时**必然**缺席：得到的是 seed 顶层 reject（EXIT 1、无 SUMMARY、F2 形态），按 §4 该 attempt FAIL；该窗口是每一轮 seed 都重复出现的非零时间占比（未实测比例，不臆造数字），所以「3/3 命中」在源码上不可推出。且本稿自己的 §5.2 `:197-198` 已写明 pool.query 路径不 emit 到无监听者——只应用到 A，未应用到 B/C，属契约内部不一致。另注：该窗口着陆时 MUT 与 POST 都会经 `:931` 记 `db_pool_error`、都无 Unhandled → 这类 attempt 对 MUT/POST **无判别力**。

`20da721` 时我只把 B 列为非阻塞 1（STOPSIGNAL 竞态），未识别此路径；此处为本方前审遗漏的更正。peer `dbed2f2` 亦未覆盖 B/C-MUT 的 pool.query 窗口（其论据「MUT 格在哪个阶段着陆都不改变删 `:929` → Unhandled」对 A 成立，对 B/C 不成立）。

**修复（docs 内，任选其一并写死 · Ban coding）**：
- (i) **per-kind**：收据必录断开时 seed 子步类别（判据钉死：MUT 下有无 `Unhandled 'error' event`，及 seed reject 栈帧落在 `proof.ts:232` 还是 `:236` / `asPrincipal`），B/C-MUT 的 3/3 只在 asPrincipal 类别内计；pool.query 类别给出**独立的钉死期望**与计分规则（例如记 `INJECT_KIND_POOLQUERY`，格 FAIL 且计入 3 次，或明确为不计分但披露——须写死，Ban 事后选择）；或
- (ii) **改 MUT 定义**：B/C-MUT 同时删 `:929` 与 `:931`（≡ attempt1 @`b29c191` 的零监听），并把签名放宽为 `Unhandled 'error' event` on `Client` **或** `BoundPool` instance（idle clients 经 `index.js:62` `pool.emit('error')` 必然存在）——同时说明 pool.query 自身 once 监听仍会接住其 client；或
- (iii) 其他能让 B/C-MUT 签名在 seed 子步任意时刻都成立、且不依赖事后观测改期望的写法。

### 非阻塞（AUTHORIZE 前建议补齐 · 引用并同意 peer `dbed2f2` 条件 1–4，不代签）

- **NB-a · 阶段判定观测源**（= peer 条件 1）：A 门控 `idle in transaction` 与 B/C 门控 `SET LOCAL ROLE%` / `set_config(...)` 均非 seed 专有——warmup/measured 的 abandon handler 同样走 asPrincipal（`interview.service.ts:554` → `platform/db.service.ts:10` → `principal.ts:945-955`）；`:160`「尚未出现 HTTP abandon 痕迹」无观测源；§5.0 `:182`「保证 T1 落在 seed」为 overclaim；§5.1 A 命令只返回 count，无法满足 `:170` 的 `state/xact_start/left(query,60)` 收录要求。建议同一快照记 `interview` 中 `id LIKE 'IV\_P018\_R3\_%'` 行数（<110 → seed）及非 `active` 行数（=0 → 尚无 abandon），并用 CTE 一次返回被终止 backend 快照 + `pg_terminate_backend(pid)`。
- **NB-b · A ≠ attempt1 表述 + A-MUT 微竞态**（= peer 条件 2）：A-POST 日志可能另有 `Connection terminated unexpectedly`，判别只能是「57P01 出现」；FATAL 到达时 client 恰已发下一条查询 → 走 `:432-433` 回调 + `'end'` `:217` → A-MUT 得到无 57P01 文本 → 该格 FAIL，须如实记录、Ban 换 attempt。
- **NB-c · INJECT_MISS 可行性**（= peer 条件 3）：门控与终止为两次独立 `docker exec`，`:169` 删去了原「≤1 s」上限；建议容器内单次 psql 轮询+终止并恢复反应时间上限。
- **NB-d · 辅助命令 EXIT**（= peer 条件 4）：R2 `docker run`/`docker port`/`docker rm -f`、NB-4 清理、J-2 `docker events`/`pgrep`/`docker ps` 补期望 EXIT 0 + 输出判据。

## Spot-check 清单（全部只读）

- `git cat-file -t 083cce4` = commit · `git show --stat 083cce4`（4 docs）· `git diff --quiet 1b74fb1 083cce4 -- packages scripts apps` 与 `083cce4..dbed2f2 -- packages apps scripts package.json` 均空
- harness @083cce4 `:20-34/:61-71/:97-109/:117/:142/:146-164/:168-211/:213-231/:233-238`
- `principal.ts:872/:886/:889-890/:915-918/:928-929/:931/:945-955`
- `uc-e2e-018-perf-load.proof.ts:31/:33/:198-223/:227-246/:232/:236/:272-284/:329/:339/:441-444`
- `interview.service.ts:552-565`（abandon → asPrincipal）· `platform/db.service.ts:9-10`
- `pg@8.22.0 lib/client.js:131-145/:198-224/:411-434` · `pg-pool@3.14.0 index.js:51-62/:335-350/:384-397/:455-485`
- `run-e2e-isolated.mjs:1726/:2182/:2251-2253`
- backlog `gap-bug-backlog.md:35`（disclosed OPEN · 未改）
- 两 stub Verdict PENDING · rag-route stub 历史段 vs `882efbc` diff 空 · peer `dbed2f2` 全文读过

## 结论

`20da721` 阻塞 1（对 Inject A）与阻塞 2（T1 seed + warmup FAIL 格 + C 保留）在 REQUEST 文本中**真实解除**；NB-1..4 已钉；B1(a)(b) / `:931` / R2 / +12 / B2 / B5 / B6 无回退。**新阻塞 1**：B-MUT / C-MUT 的 Unhandled 签名在已钉 seed 阶段因 `proof.ts:232` pool.query 窗口（pg-pool `once('error')`）与 MUT 保留的 `:931` 而不可 3/3 推出——与 `20da721` 阻塞 1 同类，docs 内可修，本审**不**要求 prove。

Ban coding（直到 BOTH PASS + 协调方 AUTHORIZE）· 本审不 AUTHORIZE · Ban nail · Ban self-approve · Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · backlog `:35` CONDITION OPEN · peer `dbed2f2` PASS 已引用、未代签 · alone ≠ dual（一方 PASS + 一方 FAIL ≠ dual PASS）· releaseEvidence=false · NOT_HA · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · 不触碰 RAG-R3 · HOLD AN-CIMG-EA · Never Meridian。

Verdict: FAIL
