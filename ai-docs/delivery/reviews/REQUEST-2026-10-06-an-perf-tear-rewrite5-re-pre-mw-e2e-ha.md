# Re-PRE ×5 · **AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause fix** · mw-e2e-ha

**Verdict**: **PASS**（单方 · docs gate · 非 dual）
**时间**: 2026-10-06 21:50 +08:00
**REWRITE5_SHA**: `771ca8475cfbcb7efe9ce99137305da76305279b`（`771ca84` · supersedes `b5633f0` → `083cce4` → `1b74fb1` → `553cfc5` → `110532e`；docs-only 4 文件：harness / slice / 两 stub）
**Cites FAIL**: mw-rag-route Re-PRE4 FAIL `a07256c1809f30c9ae8bda6c98fab69760cb41a7`（@b5633f0 · 阻塞 1 TIMING · 阻塞 2 C-POST · NB-1..5）· 更早 FAIL `70cba94` / `20da721` / `7e97dc3` / `152b665` retained
**Own prior**: mw-e2e-ha Re-PRE4 PASS `2900c46` @b5633f0 —— 针对旧稿，**不**延用为本稿 PASS；本审对 `771ca84` 全新独立复核。alone ≠ dual。
**Peer**: mw-rag-route Re-PRE5 PASS `683d946` @771ca84（本审进行中落 origin）—— **仅引用，不代签**；本审结论与条件独立得出（pg 帧 / Emitted-at 段为本方 Node 核对独立所得，与 peer C-a 结论一致）。是否构成 dual + AUTHORIZE 由协调方判定，本审**不** AUTHORIZE。
**审查基**: `/workspace/meetwise` detached @ origin tip（`771ca84`，后 ff 至 `683d946` 仅 peer review 文件）· 只读 · 无 prove / 无 docker 操作 · 未读 `.env*` · 无 live 模型调用 · 未改 git config · Node v20.19.2 一段 /tmp 纯语义小脚本（无 DB、非产品码、非 prove）
**Scope**: PRE / docs gate only · Ban coding · Ban AUTHORIZE · Ban nail · Ban invent covered/HA · 不触碰 RAG / AN-PRIV-EXT / AN-MOP · HOLD AN-CIMG-EA · Never Meridian · QUOTA WIND-DOWN last knife · NO new knives

## Hard pins（frozen · 本审不改）

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · g7SuiteGreen=false · backlog `gap-bug-backlog.md:35` C-PERF-TEARDOWN **CONDITION OPEN** · attempt1 @ `b29c191` 不洗 · UC-018 / §1.1 partial · gap ≠ covered

## 0. 代码基 / 行号漂移（防假锚）

- `git rev-parse 771ca84` = `771ca8475cfbcb7efe9ce99137305da76305279b` ✓；为 origin `feat/mysql-schema-skeleton` 祖先 ✓。
- `git diff --quiet ac03f30 771ca84 -- scripts packages apps package.json pnpm-lock.yaml` EXIT 0 → CODE 锚 `ac03f30` 成立，runner +18 / `principal.ts` / `proof.ts` 所有行号沿用 ×4（本方 `2900c46` 已逐行核过）。
- backlog：`b5633f0..771ca84` 仅 RAG nail `1024bfc` 改 `:71` 与追加 `:661+`；`:35` 逐字比对相同 → CONDITION OPEN ✓。`771ca84` 本身未触 backlog。
- 两 stub：`b5633f0..771ca84` 仅头部 + 追加 ×5 note；历史段字节不变；rag-route stub 中 `a07256c` FAIL 正文 `a07256c..771ca84` 零改动；两 stub Verdict 仍 `PENDING`，core 未代填 ✓。
- `proof.ts` 自 `b29c191` 起唯一提交（`git log` 仅 `b29c191`）→ §5.0a 收据与现行 proof 同源 ✓。

## 1. `a07256c` 阻塞 1 · TIMING → **已解除（契约层）**

### (a) 预启动 `^PERF run1:` + 可观测「已在运行」判据

| 检查 | 结论 | 独立依据 |
|---|---|---|
| 触发点 = `^PERF run1: ` | ✓ | `proof.ts:328-331` 于 `runPerf` 末打印 `PERF run${run}: `；循环 `:441-444` = PERF1→LOAD1→PERF2→LOAD2→PERF3→LOAD3 → run1 行早于 `^LOAD run2: ` |
| 预启动相位安全 | ✓ | 门控键 `IV\_P018\_R3\_%`；prefix `IV_P018_R${run}`（`:273`）/ LOAD `IV_L018_R${run}`（`:338`）→ run3 seed 首条 INSERT（`:232-235`）提交前恒 0；A：`k` 受 `iv.n BETWEEN 1 AND 109`；B/C §5.0c IF 各分支在 `iv_rows=0` 全不成立 → 只轮询 |
| 「LOAD run2 → psql ≤1 s」删除 | ✓ | 现行 harness 仅在 ×5 note `:26`、§5.0a `:250`、T1 `:221`（「替换 ×4」）以历史/作废语境出现；§5.4 `:431` 与 slice Ban 明禁 |
| 判据 `GATE_LOOP_START iv_rows=0 ∧ t0_ms < t_load2` | ✓ | §5.1a / §5.0c 循环首轮前 `clock_timestamp()` 打 `t0_ms` 与 `n0`；T1 第 2 步 `:221`。合取式中真正保证相位的是 `iv_rows(start)=0`（循环早于 run3 seed 首 INSERT 提交）；`t0_ms < t_load2` 为附加可观测项（PG 与宿主同内核时钟 · §7 Linux-native）。否则 `INJECT_LATE` 计入 · 不注入不洗绿 |
| 实时可检出 | ✓ | runner `run()` `spawn(..., stdio:'inherit')`（`run-e2e-isolated.mjs:1913`）→ capped child `docker start -a`（`uc018-perf-load-capped-child.mjs:202` `stdio:'inherit'`）→ 流式；`<PG>` 名 `:2214` 早于 `^PERF run1:` ✓ |
| 10 s 上限 | ✓ | 收据：`^PERF run1:`→`^LOAD run2:` 1006 ms + seed ≲213 ms ≈ 1.22 s → 10 s ≈ 8.2×；≈ 36.5× LOAD run2 274 ms ✓ · `INJECT_NOT_REACHED` / `INJECT_GATE_TIMEOUT` 均钉 FAIL |

### (b) B-POST 余量公式 `U_B` · `BC_MARGIN_INFEASIBLE`

- 公式（§5.0b `:257`）：`U_B = min(109, 110 − ceil(k·L_cli / t_round))` · k=2 · t_round=1.39 ms · `L_cli` = max(5×`docker version`) · `U_min=6` —— 正是 `a07256c` 建议 (b) 的形式，常量执行前写死、落 `margin.json`、Ban 重测/改 ✓。
- 算例独立复算：`L_cli=40` → ceil(57.55)=58 → 52 ✓；`L_cli=70` → ceil(100.7)=101 → 9 ✓；`L_cli=72` → ceil(103.6)=104 → 6（可行下限）；`L_cli=73` → ceil(105.04)=106 → 4 < 6 ✓（「≥73 ms → `U_B<6`」成立）。`U_min = ceil(6/1.39)+1 = 5+1 = 6` ✓。
- `U_B < 6` → `BC_MARGIN_INFEASIBLE`：B-POST 3 次**不执行**、FAIL×3、标 harness-timing、≠ 产品信号、不得宣称 P-HOLD 全格（§3）✓ —— 不可行时不烧 attempt，诚实记 FAIL，非假清。
- `iv_rows ∈ (U_B,109]` 首见 → `INJECT_GATE_MISSED_MARGIN`（§5.0c `:300` 分支已写出）✓。
- 公式只决定起爆时机；着陆仍由 B-POST 落点复核唯一判定（`:268`）→ 公式偏差只会致 DRIFT/MISSED FAIL，不会假绿 ✓。
- 「唯一依赖 seed 着陆的 B/C 格 = B-POST」成立：A 终止与快照同语句；B/C-MUT（MUT-ZERO）签名与阶段无关（本方 ×4 已清 · warmup/measured 中 API 请求 reject 被 HTTP 层吞、不退出 → idle 事件必分发 → Unhandled）；C-POST 见 §2。故 B-MUT / C-MUT / C-POST `ub=109` 由 ×4 的 100 放宽属有据放宽，非静默回退 ✓。

### (c) 时序证据表 §5.0a —— **逐项独立复算（收据 JSON）**

| 量 | harness | 本审复算（`receipts/uc018-perf-load/*.json` · Z→+08:00） |
|---|---|---|
| PERF run3 | 430 ms | 02:46:15.205Z→15.635Z = **430** ✓ |
| measured 墙钟下界 | ≥216.6 ms | `rawLatenciesMs` n=100 · Σ=2166.01 · c=10（`mapPool` `:280`）→ 216.6 ✓ |
| seed(+warmup) 上界 | ≲213 ms | 430−216.6=213.4 ✓（`start` `:272` 在 seed 前、`end` `:294` 在 `writeReceipts` 前）|
| 每轮上界 | ≈1.94 | 213.4/110 ✓ |
| 10 轮 | ≲19 ms | ✓ |
| 收紧 t_round | 1.40 (run3) / 1.39 (run2) / 2.01 (run1) | run3 (430−216.6−10×5.90)/110=1.404 ✓；run2 (439−231.06−10×5.49)/110=1.391 ✓；run1 (572−278.95−10×7.15)/110=2.01 ✓ |
| LOAD run2 | 274 ms | 14.931→15.205 ✓；其 `end` = PERF run3 `start` 同毫秒 ✓ |
| `^PERF run1:`→`^LOAD run2:` | ≈1006 ms | 14.199→15.205 = 1006 ✓ |

结论：(a)(b)(c) 三项均落实，`a07256c` 阻塞 1 **真实解除**（非假清）。

## 2. `a07256c` 阻塞 2 · C-POST 阶段矛盾 → **已解除**

- 唯一规则：C-POST 与阶段无关 OK keep · 不要求 F2/`seedAbandonTargets` · 无 DRIFT · EXIT 0 → `POST_EXIT_UNEXPECTED`。三处一致：§4 矩阵 `:191` · 阶段表 `:197-199` C-POST 列（三行均「1 OK keep · 不判 DRIFT」）· 观测源段 `:201-205`；另 §5.1「所证」`:330` 与 slice Ban 一致。`rg INJECT_PHASE_DRIFT` 仅出现于 B-POST 与历史 ×4 语境（`:205` 明示「被本条取代 · Ban 并用两套规则」）✓。
- §4.1 推导源码核对：`rm -f` 后 PG 永久消失；warmup `:278` 吞错但 measured 全败 + `runLoad(3)` seed `:339`→`:232` `h.pool.query` 新连接失败（`connectionTimeoutMillis=5000` `principal.ts:917`，端口映射消失）→ reject（F2）；measured/LOAD run3 落点 → F1 或下一 DB await F2 → EXIT 1 ✓。`:929` per-client 永久监听 + `:931` 池监听 + `idleTimeoutMillis=30000`（`:918`）→ `db_pool_error≥1` 且零 Unhandled 与阶段无关 ✓。唯一 EXIT 0 路径（断开晚于最后 DB 调用）在 seed 起爆 + 一次 CLI 往返下不可达，且仍钉 FAIL ✓。
- **B-POST 保留更严落点**：seed 着陆 ⇔ F2 ∧ 无 `^PERF run3: ` ∧ 栈含 `seedAbandonTargets`。源码：`runPerf` seed `:274` 无 try/catch；warmup `:278` / measured `:280` 只经 `timedAbandon`（`:198-225` try/catch → `{ok:false}`）；`:281-333` 无 DB await（`writeReceipts` `:126-133` 同步 fs）→ `^PERF run3:` 前顶层 rejection 只能来自 run3 seed；LOAD run3 seed（`:339`）亦含 `seedAbandonTargets` 帧但其时 `^PERF run3:` 已打印 → 被排除 ✓。栈帧可见性：`pg-pool index.js:42-46` 与 `pg/lib/client.js:648-653` 均在 promise `.catch` 内 `Error.captureStackTrace` → async 帧经 `asPrincipal`（`principal.ts:945-955`，catch 中 ROLLBACK 失败亦走同一捕获）回到 `seedAbandonTargets` ✓。「Ban 免除 B-POST 落点复核」已入 slice/harness ✓。

## 3. NB 落实（`a07256c` NB-1..5 = 本方 `2900c46` NB-e/g/h）

- **`idle_n≥2`** ✓：§5.0 表 `:234` · §5.0c `:294` `IF r.idle_n >= 2` · §5.2b `:391`；不满足 → `INJECT_PRECOND_NO_IDLE` FAIL 计入。
- **pg 帧** ✓（附条件 C-1）：A/B/C-MUT `:186/:188/:190` 要求 Unhandled 栈帧含 `pg/lib/client.js` | `pg-pool/index.js`，缺 → `UNHANDLED_NOT_PG`。
- **`wait∈{143,0}`** ✓：§5.4 `:423-424` 写死，其他值 → `AUX_EXIT_UNEXPECTED`。
- **`:2220` 披露** ✓：实测 `scripts/run-e2e-isolated.mjs:2220` 为 migrate target 列表单行；`264e1d7` diff 该行仅在 `rag04-track-local` 后同行插入 `'rag03-filter-locus:prove:raw'`，无行偏移；该列表本不含 `uc018:perf-load:prove:raw` → 不影响本刀 target ✓。
- **竞态措辞** ✓：§5.2b `:396`「该 socket 回调后的 nextTick/microtask 排空内、下一回调分发前」；结论不变，`INJECT_KIND_POOLQUERY_RACE` 仍事前钉 FAIL。

## 4. Cleared stay（rewrite4 已清项 · 无静默回退）

- **MUT-ZERO**（同删 `:929`+`:931` · `2 deletions(-)`）B/C-MUT `:188/:190` · **MUT-929** A-MUT `:186` ✓；`db_pool_error=0` / `MUT_NOT_APPLIED` ✓；Client | BoundPool ✓。
- **POOLQUERY_RACE** 事前钉 FAIL（`:188-190` · §5.2b `:396`）✓。
- **C1** §5.1a 单条 SQL：`771ca84` 对 §5.1a 仅增 `n0` 与 `GATE_LOOP_START` NOTICE，`iv/idle/tgt/k` 语句未动 ✓；**C2** 57P01 存在性判据 / CTU 不作判据 / `A_FATAL_ON_ACTIVE` ✓；**C3** 单次容器内 psql 保留（Ban 两次 exec `:431`），反应阈值改为预启动判据属本轮修订 ✓；**C4** AUX 表保留 + 新增 `L_cli` 基线 `:427`、预启动注入程序 `:428` 期望 EXIT ✓。
- **Inject A** idle-in-txn + 57P01 + T1 seed + `INJECT_PHASE_WARMUP/MEASURED/BOUNDARY` ✓；runner +18 @`ac03f30` ✓（代码零改动）；B1(a)(b) / `:931` / R2 / B2/B5/B6 ✓。
- 无 invent product locus；无 covered / HA 宣称；Non-claims `:469-471` 增「×5 时序为收据上界、`U_B` 未计算」✓。

## 5. 阻塞项

**无阻塞。**

## 6. 条件 / 非阻塞（执行前写入执行脚本或收据口径 · 均只可能致诚实 FAIL，不产生假绿）

- **C-1 · NB-2「Unhandled 栈帧」扫描范围须钉为 Node 打印的整块（含 `Emitted 'error' event on … instance at:` 段）**。本方 /tmp 纯 Node 核对（v20.19.2）：在 A 文件构造 Error、经 `pg/lib/client.js` 路径的 `_handleErrorEvent` emit 且无监听 → stderr 中 err 自身栈只含构造处帧，`pg/lib/client.js` 帧仅出现在 `Emitted 'error' event on Client instance at:` 段。真实 57P01 `DatabaseError` 由 `pg-protocol` parser 构造 → 若只扫 `err.stack`，**A-MUT（判据要求 57P01）会确定性落 `UNHANDLED_NOT_PG` 3/3**。须在 AUTHORIZE 前写明范围，Ban 事后择读法。（与 peer `683d946` C-a 同结论 · 独立得出 · 不代签）
- **NB-a · `t_round` 只有上界、无下界**：收据只能给出 seed 每轮上界；实际若快于 1.39 ms/轮，同一 `L_cli` 下消耗轮数更多，k=2 为唯一缓冲 → B-POST 可能 DRIFT / MISSED_MARGIN（已钉 FAIL · harness-timing）。另：「warmup ≥ 10×min(measured)」以并发 c=10 下的最小延迟作串行 warmup 下界并不严格，但其误差方向只会让 1.39 偏小 = 更保守，不破坏「取小 = 保守」。
- **NB-b · `GATE_LOOP_START iv_rows>0`（迟启动）时宿主是否仍执行 B/C CMD 未写明**；结果均为 `INJECT_LATE` 计 FAIL，建议钉「迟启动 → 不执行 B/C CMD」以免多余破坏。
- **NB-c · `U_min=6` 依赖「每轮门控查询 ≤1 ms」与 `pg_sleep` 粒度**，未实测；偏差只致 MISSED_MARGIN FAIL。建议收据录门控实测轮询周期。
- **NB-d · 行号小漂移**：§4 观测源段引 `proof.ts:197-` 为 `timedAbandon`，实为 `:198`（try 在 `:202`）；无语义影响。

## 7. Spot-check 清单（全部只读）

- `git rev-parse 771ca84` · `git log 771ca84..origin` = 仅 peer `683d946`（rag-route stub 单文件）
- harness @771ca84 全 diff vs `b5633f0`（299 行）读过；`:20-36/:164-215/:217-320/:333-380/:389-431/:469-475` 逐段核
- slice / 两 stub diff；`a07256c` FAIL 正文全文；本方 `2900c46` 全文
- 收据 `nhp-018-perf-01-run{1,2,3}.json` · `nhp-018-load-01-run{1,2,3}.json`（start/end/rawLatenciesMs/c 复算）
- `proof.ts:28-34/:92/:126-133/:198-247/:271-334/:336-345/:430-444`
- `principal.ts:914-918/:945-955`；`pg@8.22.0 lib/client.js:636-653`；`pg-pool@3.14.0 index.js:36-48`
- `run-e2e-isolated.mjs:1905-1918/:2210-2222` · `264e1d7` 对 runner diff；`uc018-perf-load-capped-child.mjs:202`
- `gap-bug-backlog.md:35`（b5633f0 vs 771ca84 逐字同）

## 结论

`a07256c` 两阻塞在契约层**真实解除**：TIMING 以 `^PERF run1:` 预启动 + `iv_rows(start)=0 ∧ t0_ms<t_load2` 可观测判据取代 1 s 阈值；B-POST 以执行前写死的 `U_B` 公式 + `BC_MARGIN_INFEASIBLE` / `INJECT_GATE_MISSED_MARGIN` 诚实计分；时序证据逐项可由仓内收据复算；C-POST 收敛为与阶段无关单一规则，B-POST 保留并收紧落点复核。NB-1..5 落实；rewrite4 已清项（MUT-ZERO / C1–C4 / POOLQUERY_RACE / Inject A / +18）无静默回退。条件 C-1 须在 AUTHORIZE 前写死。**无阻塞 → PASS（单方）**。

Ban coding（直到 BOTH PASS + 协调方 AUTHORIZE）· 本审**不** AUTHORIZE · Ban nail · Ban self-approve · Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · backlog `:35` CONDITION OPEN · cites FAIL `a07256c` · peer mw-rag-route Re-PRE5 PASS `683d946` cited not co-signed · own `2900c46` 不延用 · alone ≠ dual · NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · HOLD AN-CIMG-EA · Never Meridian · QUOTA WIND-DOWN · NO new knives。

Verdict: PASS
