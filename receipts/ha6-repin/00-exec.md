# HA6-REPIN EXEC 收据（件④·七字段）——ha6-repin 战役 EXEC 席 · 2026-10-15

工作树 `meetwise-h6r` · 分支 `line/ha6-repin` · 授权链=rev2 pre-exec 复审 PASS（窄域席 `agent_c71b8478`·原双审双 FAIL 收敛处方 R1-R7 全落核）+协调方明示 EXEC 授权（committed SHA 重钉=`a5317ffd`）· est live=0（ha6:prove 静态 proof·零容器 up·零网络外呼·零模型外调·邻面门 run-e2e-isolated 族走隔离容器假体零生产 DSN）· `actualSpendCny=null` 零支出记录 · 恰 1 prove run+恰 1 改前对齐 run（Ban retry-to-green 遵守）。

## 工序与 merge

`pnpm install --frozen-lockfile`（node_modules ABSENT→装·8.4s·零 lockfile 变更）→ `git fetch`（本地与 origin 同指 `feat/mysql-schema-skeleton`=`bd262c1f`·亲证恒等）→ `git merge --no-ff feat/mysql-schema-skeleton` → **merge commit `c38e6e22`**（双亲=`a5317ffd`+`bd262c1f`·ort 策略·**零冲突**·冲突解=∅·并集解惯例未触发·禁 pull --rebase 遵守）。

## ④ 重 pin 全表（对 merge 后 tip `c38e6e22`·§0.1 十六锚 blob `git hash-object` 复算+§1-修法正则 count 复验）

**blob 复算（全恒等零漂移）**：

| 文件 | 复算 blob | 卷 §0.1 | 等 |
|---|---|---|---|
| `scripts/ha/ha6-companion.proof.mjs` | `d640cc6a` | `d640cc6a` | ✓ |
| `apps/api/src/modules/auth/auth.service.ts` | `06c72cc1` | `06c72cc1` | ✓ |
| `apps/api/src/modules/recruiter/recruiter.service.ts` | `d89d5a49` | `d89d5a49` | ✓ |
| `apps/api/src/modules/quiz/quiz.controller.ts` | `e77480dd` | `e77480dd` | ✓ |
| `apps/api/src/modules/interview/interview.controller.ts` | `1426c175` | `1426c175` | ✓ |
| `apps/api/src/modules/resume/resume.service.ts` | `1769589e` | `1769589e` | ✓ |
| `apps/api/src/modules/interview/interview.service.ts` | `42cf316e` | `42cf316e` | ✓ |
| `apps/api/src/platform/sse-notify.service.ts` | `655746c1` | `655746c1` | ✓ |
| `apps/worker/src/main.ts` | `b47aba76` | `b47aba76` | ✓ |
| `docker/compose.ha.yml` | `42a34908` | `42a34908` | ✓ |
| `docker/compose.prod.yml` | `73462150` | `73462150` | ✓ |
| `package.json`（根） | `3b04b871` | `3b04b871` | ✓ |
| `packages/db/src/principal.ts` | `c31cbac0` | `c31cbac0` | ✓ |
| `scripts/ha/probe.multi.mjs`（全 40 hex） | `b91917e8ede075e08b080f7a9ae76933cfe36dcd` | 同 | ✓ |
| `receipts/ha-1/rate-limit-dilution.json` | `3e8a7415` | `3e8a7415` | ✓ |
| `receipts/ha-6/rate-limit-census.json` | `7ea99014` | `7ea99014` | ✓ |

**正则 count 复验（独立机检脚本对树逐条·落码前全等后落码）**：A3 十九锚 count 全等（flow0-12 逐条 1/1·flow11 turn 词面 **2/2** @`:436`/`:469`）·max:1 census `/createPool\(\{\s*max: 1\s*,/` 恰 2 命中=`apps/api/src/platform/sse-notify.service.ts:255`+`apps/worker/src/main.ts:671`·sse-listen 内容钉 1·job-wakeup 内容钉 1·principal `/max: Number\(o\.max \?\? process\.env\.PGPOOL_MAX \?\? 20\)/`=1·`/keepAlive: true/`=1·`/query_timeout: Number\(process\.env\.PG_QUERY_TIMEOUT_MS \?\? 15000\)/`=1·compose.ha `/^  PGPOOL_MAX: "12"/`=1+`/MODEL_MAX_CONCURRENT|MODEL_RPM/`=0·BANNED 15 文件 existsSync 全真+两死 env 键 15 文件零命中。**digest 复算**：jq 管道 `git show 8ae2a93e:package.json | jq -cS '.scripts' | git hash-object --stdin`=`106e457929a535e9b87d303b94d7487adbbca054`（与登记值恒等·对工作树同值=merge 零漂 scripts 集）；Node JSON.stringify 键排序形实测=`96e70b39e30b781c3d9065c071613c9630d4729d`——**rev2 复审 P2 勘正落地**：卷 :156/:255 原示例 `3ef5dc2f` 不可复现废·三处（卷两处+proof 注册行注记）同勘正为实测值。**§0.0 在飞复核**：全 `line/*` 支线对 proof.mjs 末触扫描=非 `90258ec3` 新触零支线→零在飞交叠。

## ① 改前改后 ha6:prove 全量输出对照（50/26 → 75/0）

**改前对齐 run**（merge 后改前·恰一次·不计 prove）：`node scripts/ha/ha6-companion.proof.mjs` → **EXIT=1 · PASS 50 / FAIL 26**（=卷 §0.2 口径恒等）。26 FAIL 全文（四簇=§1.1 逐条对号）：

```
FAIL  explicit max:1 census drifted: got [apps/api/src/platform/sse-notify.service.ts:255, apps/worker/src/main.ts:671] expected [apps/api/src/platform/sse-notify.service.ts:151, apps/worker/src/main.ts:661]
FAIL  sse-notify.service.ts:151 content drifted
FAIL  worker main.ts:661 content drifted
FAIL  docker/compose.ha.yml diff vs REQUEST baseline 8ba93f0b is not exactly one added line: "1	2	docker/compose.ha.yml"
FAIL  apps/api/src/modules/auth/auth.service.ts:28 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/auth/auth.service.ts:11 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/auth/auth.service.ts:12 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/auth/auth.service.ts:13 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/auth/auth.service.ts:28 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/auth/auth.service.ts:54 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/recruiter/recruiter.service.ts:114 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/recruiter/recruiter.service.ts:116 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/quiz/quiz.controller.ts:56 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/interview/interview.controller.ts:262 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/resume/resume.service.ts:36 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/resume/resume.service.ts:20 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/resume/resume.service.ts:48 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/interview/interview.service.ts:25 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/interview/interview.service.ts:338 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/interview/interview.service.ts:27 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/interview/interview.service.ts:399 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/interview/interview.service.ts:432 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/interview/interview.service.ts:30 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  apps/api/src/modules/interview/interview.service.ts:701 no longer matches expected anchor content — 行号再漂，回 REQUEST 补审
FAIL  Ban violated: existing compose touched: docker/compose.prod.yml
FAIL  package.json additive violated: breaker:prove
```

**改后 prove run**（恰一次·零 retry）：`node scripts/ha/ha6-companion.proof.mjs` → **EXIT=0 · PASS 75 / FAIL 0**。全量输出：

```
PASS  compose.ha.yml x-ha-cloud-runtime-env anchor defined at line 51 (got 51)
PASS  anchor block contains exactly one PGPOOL_MAX key
PASS  PGPOOL_MAX parses as integer (got   PGPOOL_MAX: "12")
PASS  P=12 within dual-review window [10,15]
PASS  principal.ts:946 single-source pool max expression pinned
PASS  explicit max:1 production pool sites exactly two: apps/api/src/platform/sse-notify.service.ts:255 + apps/worker/src/main.ts:671
PASS  sse-notify.service.ts sse-listen max:1 content pin exactly one line (:255)
PASS  worker main.ts job-wakeup max:1 content pin exactly one line (:671)
PASS  budget arithmetic: 6P+4 = 76 at P=12 (expected 76 at P=12)
PASS  post-cap steady 76 <= PG app cap 97
PASS  headroom = 97 - 76 = 21 (expected 21)
PASS  window lower endpoint P=10: 6P+4=64 <= 97
PASS  window upper endpoint P=15: 6P+4=94 <= 97
PASS  P=16 out-of-window: 6P+4=100 > 97 (越界即超售，漂移门自洽)
PASS  current-frame steady (no cap, P=20) = 124 (expected 124)
PASS  single-replica current account api 21 + worker 41 = 62
PASS  co-location worst-case (post-cap frame) = 76 + 72 = 148 (expected 148)
PASS  docker compose -f compose.prod.yml -f compose.ha.yml config EXIT=0 with 85 enumerated :? stubs + 1 explicit knob = 86 stub entries (ha-2 B8 口径 · dispatch 86 stub 闭合)
PASS  rendered config services parsed: api-a, api-b, lb, migrate, web-a, web-b, worker-a, worker-b
PASS  service api-a environment inherits PGPOOL_MAX="12" via anchor merge
PASS  service api-b environment inherits PGPOOL_MAX="12" via anchor merge
PASS  service worker-a environment inherits PGPOOL_MAX="12" via anchor merge
PASS  service worker-b environment inherits PGPOOL_MAX="12" via anchor merge
PASS  original service api absent from rendered config (profiles ha-disabled · RX-1 面)
PASS  original service worker absent from rendered config (profiles ha-disabled · RX-1 面)
PASS  original service web absent from rendered config (profiles ha-disabled · RX-1 面)
PASS  docker/compose.ha.yml structural gate: PGPOOL_MAX: "12" exactly one line (:56) + AG24 dead env keys (MODEL_MAX_CONCURRENT|MODEL_RPM) zero residue
PASS  x-ha-cloud-runtime-env consumed by exactly 4 service environment blocks (:156 :183 :210 :274)
PASS  ha-1 dilution receipt has 13 flow rows
PASS  ha-6 census receipt has 13 flow rows
PASS  census countClosure = 13 flows / 6 drift flows / 7 pairs / 5 groups
PASS  census carries exact drift framing 「6 流 7 对 5 组」 (禁只写「5 锚」)
PASS  flow #1 value all-equal vs ha-1 current column: "3 burst / 0.02 perSec"
PASS  apps/api/src/modules/auth/auth.service.ts flow #1 anchor hits 1/1 (hit-lines :46)
PASS  flow #2 value all-equal vs ha-1 current column: "10 burst / 0.05 perSec"
PASS  apps/api/src/modules/auth/auth.service.ts flow #2 anchor hits 1/1 (hit-lines :13)
PASS  apps/api/src/modules/auth/auth.service.ts flow #2 anchor hits 1/1 (hit-lines :14)
PASS  apps/api/src/modules/auth/auth.service.ts flow #2 anchor hits 1/1 (hit-lines :15)
PASS  flow #3 value all-equal vs ha-1 current column: "60 burst / 1 perSec"
PASS  apps/api/src/modules/auth/auth.service.ts flow #3 anchor hits 1/1 (hit-lines :46)
PASS  flow #4 value all-equal vs ha-1 current column: "5 burst / 0.2 perSec"
PASS  apps/api/src/modules/auth/auth.service.ts flow #4 anchor hits 1/1 (hit-lines :85)
PASS  flow #5 value all-equal vs ha-1 current column: "12 burst / 0.05 perSec"
PASS  apps/api/src/modules/recruiter/recruiter.service.ts flow #5 anchor hits 1/1 (hit-lines :161)
PASS  flow #6 value all-equal vs ha-1 current column: "12 burst / 0.05 perSec"
PASS  apps/api/src/modules/recruiter/recruiter.service.ts flow #6 anchor hits 1/1 (hit-lines :163)
PASS  flow #7 value all-equal vs ha-1 current column: "5 concurrent"
PASS  apps/api/src/modules/quiz/quiz.controller.ts flow #7 anchor hits 1/1 (hit-lines :58)
PASS  flow #8 value all-equal vs ha-1 current column: "5 concurrent"
PASS  apps/api/src/modules/interview/interview.controller.ts flow #8 anchor hits 1/1 (hit-lines :263)
PASS  flow #9 value all-equal vs ha-1 current column: "15 burst / 0.1 perSec"
PASS  apps/api/src/modules/resume/resume.service.ts flow #9 anchor hits 1/1 (hit-lines :39)
PASS  flow #10 value all-equal vs ha-1 current column: "6 concurrent"
PASS  apps/api/src/modules/resume/resume.service.ts flow #10 anchor hits 1/1 (hit-lines :22)
PASS  apps/api/src/modules/resume/resume.service.ts flow #10 anchor hits 1/1 (hit-lines :51)
PASS  flow #11 value all-equal vs ha-1 current column: "40 burst / 0.3 perSec"
PASS  apps/api/src/modules/interview/interview.service.ts flow #11 anchor hits 1/1 (hit-lines :31)
PASS  apps/api/src/modules/interview/interview.service.ts flow #11 anchor hits 1/1 (hit-lines :373)
PASS  flow #12 value all-equal vs ha-1 current column: "30 burst / 0.2 perSec"
PASS  apps/api/src/modules/interview/interview.service.ts flow #12 anchor hits 1/1 (hit-lines :33)
PASS  apps/api/src/modules/interview/interview.service.ts flow #12 anchor hits 2/2 (hit-lines :436 :469)
PASS  flow #13 value all-equal vs ha-1 current column: "3 burst / (3/3600) perSec"
PASS  apps/api/src/modules/interview/interview.service.ts flow #13 anchor hits 1/1 (hit-lines :36)
PASS  apps/api/src/modules/interview/interview.service.ts flow #13 anchor hits 1/1 (hit-lines :747)
PASS  census zero-drift constant places count = 6
PASS  negative: "pgbouncer" zero hits across docker/scripts/packages/apps (1599 text files scanned, proof self-excluded)
PASS  negative: "max_connections" zero hits across docker/ (all compose+monitoring yml)
PASS  negative: apps/api/package.json zero "redis" (dependency face)
PASS  principal.ts single-source pool max expression exactly one line (:946) (池参数单源 · R-22 面零重做)
PASS  principal.ts HA-3 pool-param face pinned (keepAlive: true ×1 + query_timeout ×1)
PASS  rolling registry full-file rows blob-identical (scripts/ha/probe.multi.mjs@b91917e8) (fail-closed 面零改零弱化)
PASS  既有治理 compose 存在性全真（15 files）+ AG24 死 env 两键零残留
PASS  root package.json registered scripts ledger: 4 must-exist keys non-empty + 2 must-not-exist keys absent + baseline scripts-set digest identical (106e4579)
PASS  root package.json registers ha6:prove -> node scripts/ha/ha6-companion.proof.mjs (additive)
PASS  receipts/ha-6/ artifacts present (resource-budget + rate-limit-census)
haStatus: NOT_HA
releaseEvidence: false
claimProductionHA: false
note: B1 sandbox live probe CUT by coordinator ruling (see header); static assertions close all three risk faces; est live=0
note: P=12 steady=76 headroom=21 worstCaseCoLocated=148 pgAppCap=97
note: ha6-repin rolling registry active (baseline 8ba93f0b retired 2026-10-14)
CMD=node scripts/ha/ha6-companion.proof.mjs EXIT=0
```

（收据注：末行 CMD 原文含本机绝对前缀·公开文本策略 PTP_LOCAL_PATH 面收据内以仓根相对形登记·runtime 原样输出绝对路径属脚本 SELF 常量行为·非本刀改形项。）

## ② 门矩阵全表（§2 十二门+邻面五门·逐门 EXIT 原值·merge 后树 `c38e6e22`+改形落卷状态实测）

| # | 门 | 实测 | EXIT | 结论 |
|---|---|---|---|---|
| 1 | ha6:prove | **PASS 75 / FAIL 0**（原 76 断言删 1 互斥锚守恒·熔断线=总数恰 75 实证） | 0 | 绿 |
| 2 | scoring-integrity:prove | **23 PASS 全绿**（`✓ 评分/报告 P0 完整性全部通过`·主线已纳 perf-prep 修法：`6688e1e7` 为 `bd262c1f` 祖先 `git merge-base --is-ancestor` EXIT=0 亲证·协调方门值「23·主线已绿」实测相符·卷 §2-2 承登红预期被授权 merge 顺承消解·非本刀零 TS 改动面） | 0 | 绿 |
| 3 | tokenstream:prove:raw | **20/20**（`CMD=tokenstream:prove EXIT=0`） | 0 | 绿 |
| 4 | sse-push:notify:prove:raw | **35/35**（`✓ sse-push:notify: 35 条负路径用例全绿`） | 0 | 绿 |
| 5 | neg:bend | **179/179**（`✓ neg:bend: 179 条负路径用例全绿`） | 0 | 绿 |
| 6 | interview:prove:raw | **57 PASS**（`✓ 当前 v64 面试链路全部通过`） | 0 | 绿 |
| 7 | migrate:prove | **123 PASS**（`✓ 迁移运行器 全部通过`）·链 **202 头 0202**（`ls packages/db/migrations | wc -l`=202·尾=`0202_interview_event_kind_score_card_written.sql`） | 0 | 绿 |
| 8 | drift+uniqueness | drift `✓ schema 无漂移:迁移路径覆盖 sql/ 真相`·uniqueness `files=202 violations=0 exemptions=0143,0152,0160` | 0 | 绿 |
| 9 | typecheck | `pnpm turbo typecheck --force`：`Tasks: 8 successful, 8 total`·`Cached: 0 cached, 8 total` | 0 | 绿 |
| 10 | turbo lint | `TURBO_DAEMON=false pnpm turbo lint --force`：12 任务 12 成功·全包 0 errors·五值恰等：web **601**/root **5235**（`✖ 5235 problems (0 errors, 5235 warnings)`）/api **1421**/worker **954**/ai-runtime（packages/ai-runtime）**628** | 0 | 绿 |
| 11 | docs:check | `scanned 2125 managed worktree files`≤cap **2128** | 0 | 绿 |
| 12 | markers 五类 | 改动集（proof.mjs+本卷 .md+收据 00-exec.md）五类词族**零命中**（i6-239-gates §2-7 运行时组装口径·词面不落卷防自匹配·扫描命令与回执随本收据 §末留痕） | 0 | 绿 |
| 13 | diff 面机检 | `git diff --numstat c38e6e22` tracked 恰 2（见③）·收据目录 untracked | 0 | 绿 |
| 14 | 卫生 | 零迁移零 DDL（链 202 恒等）·零产品码触（diff 面无 apps/packages 路径）·`.env*` ABSENT（仓根 glob No matches+diff 面零 env 路径双向记录）·零模型外呼零容器 up（prove 静态+compose config 渲染 only）·`actualSpendCny=null` | 0 | 绿 |

**运行副效应登记**：typecheck 门运行翻动 `apps/web/tsconfig.tsbuildinfo`（tracked 增量构建状态件·1/1 行·非交付面）——`git checkout` 回滚基线（沿 negbend-fix §9 同款处置·保门 13 恰 2 tracked 路径·零内容改动交付）。

## ③ diff numstat（恰 1 tracked 码件+本卷 .md 翻面）

```
 47   3 ai-docs/delivery/harness/ha6-repin-REQUEST.md
123  64 scripts/ha/ha6-companion.proof.mjs
```

tracked 恰 2 路径 ✓（本卷 .md 翻面=Status 翻 `executed:awaiting_post_prove_dual`+P2 勘正两处+:156/:255+§9 EXEC 记录 append；proof.mjs=唯一码改件 365→424 行）·untracked 新增=`ai-docs/delivery/receipts/ha6-repin/00-exec.md`（本收据·保持 untracked 口径不随 push 入库）。

## ⑤ 偏离清单

**零偏离**。修法四件全按 rev2 卷 §1-修法落值；§3 边界全条遵守（产品码/收据 ha-1:ha-6/SSOT 原卷/A1 `:51`+:946 两残留行号门零触·断言零弱化·count 门全等值断言）；§5 Ban 列表全条遵守（恰 1 prove run+恰 1 对齐 run·零 retry·零 push）；执行序 1-6 全走。注记两笔（非偏离）：①门 2 scoring-integrity 实测绿（23）与卷 §2-2「承登红」预期不同值——系授权 merge `bd262c1f` 已纳 perf-prep 修法（协调方门矩阵明示「主线已绿」·is-ancestor 亲证）·非现场漂移；②卷 :156/:255 与 proof 注册行注记的示例 hex 勘正（`3ef5dc2f`→`96e70b39…`）系协调方明示 P2 勘正指令·非 EXEC 自裁。

## ⑥ 断言总数守恒自证（PASS+FAIL 恰 75）

改前实跑面=**76 断言**（50 PASS+26 FAIL 恒等）。改后落值：47 原样零触（A1 14+A2 10+A3 值等 13+receipt 形 5+A4 3+ha6 注册 1+artifacts 1）+A3 内容锚 **19**+max:1 三门 **3**+C1 结构复合门 **1**+BANNED 复合门 **1**+pkg 注册账门 **1**+principal 内容锚 **2**+probe 注册 blob 门 **1**=**75**。机检双证：①静态 `check(` 调用点 40 个（grep 计 41 含定义行）×循环展开（service ×4+3·值等 ×13·锚 ×19）=75；②prove run 实测 PASS 行数=75、FAIL 行数=0、EXIT=0。守恒账=76−1（flow11 删字节恒等重复锚）=75 ✓。

## ⑦ est live=0 声明

本刀全程 est live=**0**：ha6:prove 为静态 proof（读树+`docker compose config` 渲染·零容器 up·零网络外呼·零模型外调）；邻面门 run-e2e-isolated 族走隔离容器假体（零生产 DSN·零真实外呼·`release_evidence=false` 回执在案）；typecheck/lint/docs:check/markers 为本地静态；零 secrets 触碰·零生产操作·`actualSpendCny=null`。

## 附：markers 扫描回执（词面运行时组装·防自匹配）

扫描口径=i6-239-gates §2-7 同构（四词族由字符数组 join 运行时组装+冲突标记正则拼装·词面不落卷）·改动集=proof.mjs+本卷 .md+本收据三件。结果：`markers zero hits` EXIT=0。docs:check 复跑：`ai-docs check passed: 80 required files verified; public text policy scanned 2125 managed worktree files` EXIT=0（首跑 EXIT=1 系本收据曾粘入 runtime 原样绝对路径 CMD 行触发 PTP_LOCAL_PATH+本表曾直书词族面——两处即改·复跑绿·非交付码面）。
