# CI-WIRING3 EXEC 收据 — 五门接线刀（四门 per-push 接线+卷尾登记注记·恰 1 码面 ci.yml 纯增 19 行·四门各恰 1 run 绿零 retry·docs:check PTP_FILE_LIMIT 红停上报）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 依 rev3 pre-exec 窄域复审 PASS `agent_7a80eab2`+协调方明示 EXEC 授权开工·**门 8 docs:check `PTP_FILE_LIMIT:2137>2136` 红=停止条件「验收红不可修」命中·红停上报如实登记见 §9-1·cap 上调权归协调方·本席零自修**·⛔push · est live=0 · releaseEvidence=false · claimProductionHA=false · actualSpendCny=null）

**席位**：ci-wiring3 EXEC 席（协调方派·工作树 `meetwise-ciw3`·分支 `line/ci-wiring3`）。
**开工链**：起草 `fa8ad4e0`→rev2 `174bb401`→rev3 `e1cc0c44`（STOP=draft:awaiting_pre_exec_dual）→ rev3 pre-exec 窄域复审 PASS（`agent_7a80eab2`）→ 协调方 EXEC 授权（立项前置=ci-red-clear 已 nail 并线 `0c06033d` 其件③僵尸步删+件④ lint 注释已在主线树）→ 本收据。

## §1 重 pin 全表（对届时 tip `1be05b4b`=本线 merge origin/feat/mysql-schema-skeleton@`0c06033d` 后·`git hash-object` 8 hex 亲算）

| 文件 | 起草卷 blob（rev3） | @`1be05b4b` 实测 | 结论 |
|---|---|---|---|
| `.github/workflows/ci.yml` | `4cfa1ed3`（344 行·预描并线后 342 行/98 步） | **`e7d2031a`（342 行）** | 预描并线后形态恒等（行数/步数/僵尸步删/lint 注释刷新全符）·blob 更 pin（ci-red-clear 件③④ 合法落刀·本刀唯一码改件）·verify steps=**98**·breaker 僵尸步 rg 恰 0 命中·scor-parity 步 name `:246`/run `:247`·下一既有步「agent 模型可观测」name `:248`（=起草卷预描锚位逐字命中） |
| `package.json`（根） | `3b04b871` | `3b04b871` | 恒等·五门注册行锚全零漂：`:215` uc003:i18n-locale:prove/`:216` …:raw/`:217` …-ui:prove/`:275` stress:prove/`:495` scoring-integrity:prove/`:536` tokenstream:prove/`:539` …:raw/`:658` ha6:prove·lint 预算 root `:8`=5235 亲读恒等 |
| `.github/workflows/nightly.yml` | `ac47e884`（65 行） | `ac47e884`（65 行） | 恒等（零触） |
| `.github/workflows/nightly-ciw2.yml` | `09cd220a`（42 行） | `09cd220a`（42 行） | 恒等（零触） |
| `scripts/run-e2e-isolated.mjs` | `e69e317a` | `e69e317a`（3189 行） | 恒等（零触） |
| `scripts/run-e2e-ui.mjs` | `84f9cd2d` | `84f9cd2d`（248 行） | 恒等（零触） |
| `scripts/ha/ha6-companion.proof.mjs` | `d640cc6a`（365 行） | **`740df0a3`（424 行）** | **漂移——line/ha6-repin 已合法并主线落刀**（`git merge-base --is-ancestor line/ha6-repin HEAD` 是）·本刀对该件零触结论不变·更 pin·详见 §9-2 |
| `apps/worker/test/scoring-report-integrity.proof.ts` | `35984431` | `35984431`（207 行） | 恒等（零触） |
| `apps/worker/test/tokenstream-progress.proof.ts` | `53e88ffe` | `53e88ffe`（208 行） | 恒等（零触） |
| `apps/worker/test/context-stress.proof.ts` | `31401cec` | `31401cec`（265 行） | 恒等（零触） |
| `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` | `8c3cfd4f` | `8c3cfd4f`（286 行） | 恒等（零触） |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4` | `339f92f4`（201 行） | 恒等（零触） |

- **立项序前置亲证**：origin fetch 后 tip=`0c06033d`（本地 `feat/mysql-schema-skeleton` 与 origin 恒等）；`git merge-base --is-ancestor line/ci-red-clear origin/feat/mysql-schema-skeleton` EXIT=0（其 EXEC `bb1627d8` 已并主线）——§0.0「未并线 Ban 立项」前置满足。
- **lint 五值（协调方门·§3-2 Ban 动真实预算值）**：api 1421/web 601/worker 954/ai-runtime 628/db 1042（+root 5235）逐包 `rg '"lint"'` 亲读恰等 §0.1 pin 十二值·根 package.json blob `3b04b871` 恒等故值面不可能漂·ci.yml lint 注释块（`:103-:106` 刷新后十二值形）本刀零触（diff 纯增无删行亲证）。
- **migrate 链**：`ls packages/db/migrations/*.sql | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql` 恒等（四门收据 schemaMigrationManifest count=202 互证）。

## §2 件① 落码回执（唯一码改面·四门接线步）

- 插入点=ci.yml scor-parity 步 `run:` 行（并线后 `:247`）后、「agent 模型可观测」步 name 行（`:248`）前·**逐字节材料化 §1-修法件① yaml 块 15 行**（块头注 3+四步各 3 行 12）。
- **逐字节自证**：REQUEST `:78-:92` 卷载块 `sed` 提取 vs 树内 `:248-:262` 提取 `diff` EXIT=0 恒等。
- 四步形（isolated-runner 恒同形·每步恰 `- name:`+`run: pnpm <脚本名>` 两键两行·零 env 零 if 零 retry 零 continue-on-error）：js-yaml 键面亲证恰 `["name","run"]`·run 值=`pnpm scoring-integrity:prove`/`pnpm tokenstream:prove`/`pnpm stress:prove`/`pnpm uc003:i18n-locale:prove`。
- **四新步脚本名注册面**（协调方门）：四名对根 package.json 注册行 `:495`/`:536`/`:275`/`:215` 恰命中（isolated-runner 通道）。
- 插入后 js-yaml 解析 verify steps=**102**（98+4·新增恰 4 熔断内）·四新步 idx=63-66（scor-parity idx=62 后·「agent 模型可观测」idx=63→**67** 平移）·**剪除新增四步后余 98 步 name 序列对并线后基线（`git show HEAD:ci.yml` 解析）逐位恒等**（js-yaml 抽取比对 EXIT=0 零错位=既有步零重排零删除零改语义）。

## §3 件③ 落码回执（卷尾纪律注记）

- ci.yml 末行（并线后 `:342`）后追加注释恰 4 行·**逐字节自证**：REQUEST `:99-:102` 卷载块 vs 树内 `:358-:361` `diff` EXIT=0 恒等。
- 注记内容=四门接线归属+ha6 不接线归属 line/ha6-repin 另批+UI 件三缺不接线+nightly 双件与 lint 注释面（归 ci-red-clear）零触——**登记注记逐字节维持**（§8-③ Ban 改件①③字节·ha6 届时已绿不回写注记·见 §9-2）。

## §4 件② 零双写对表说明（rev2 摘除·归属让渡 ci-red-clear）

- 本刀 diff（`git diff --numstat HEAD -- ci.yml`=**19 0** 纯增）删行恰 0——lint 注释块零触。
- 主线树内 `:103-:106` 现形=ci-red-clear 件④ 刷新后十二值形（api 1421/web 601/worker 954/ai-graphs 47/ai-runtime 628/config 0/contracts 265/db-mysql 0/db 1042/domain 115/qdrant-store 27/root 5235）——与本刀零交叠零双写：本刀对同一注释块零改零增零删。
- 其件③ 僵尸步删（breaker:prove 2 行）亦已在其 EXEC `bb1627d8` 落主线树：本刀基线 steps=98 形即其删后形态（`熔断器` 步名 rg 恰 0 命中亲证）——零双删零回添。

## §5 四门 attempts 全台账（各恰 1 run·红不重跑零 retry·Ban 恰 1 run 故热复跑不做·热口径基准沿卷在案）

| 门 | 命令 | EXIT | PASS/FAIL | 墙钟 | runner 收据 durationMs | 卷载基准（冷/热） |
|---|---|---|---|---|---|---|
| scoring-integrity | `pnpm scoring-integrity:prove` | **0** | **23/0**（全量输出 PASS 行 23·proof `A()` 调用点静态计数恰 23 双证·尾行 ✓ 全部通过） | 10.220s | （runner 不落收据：target 不在 `isolatedReceiptSources` 白名单·如实记） | 10.9s |
| tokenstream | `pnpm tokenstream:prove` | **0** | **20/0** | 18.758s | 18311 | 17.5s（收据 16.9-21.0s） |
| stress | `pnpm stress:prove` | **0** | **29/0** | 8.798s（冷口径） | 8404 | 冷 8.0s/热 25.9s（收据 7587-25953ms） |
| uc003 i18n-locale | `pnpm uc003:i18n-locale:prove` | **0** | **7/0**（S1-S6+G3' 七查） | 3.045s | 2675 | 2.9s（收据 2.6-3.4s） |

- **绝对预算熔断 ≤56.8s（硬上限）**：四门单步墙钟最大=tokenstream 18.758s，全部 ≤56.8s·PASS 计数 23/20/29/7 **恰等 0 容差**。
- 全量日志留 `/tmp/ciw3-{tokenstream,stress,uc003}.log`（untracked .tmp 面）。

## §6 门矩阵十二门终值

| 门 | 断言 | 终值 |
|---|---|---|
| 1 解析 | js-yaml@4.3.2 repo realpath parse EXIT=0·steps=102（98+4·新增恰 4）·剪除四步后 98 步 name 逐位恒等基线 | **绿** |
| 2 四门实跑 | 四命令各恰 1 run EXIT=0·PASS 恰 23/20/29/7·单步 ≤56.8s | **绿** |
| 3 ha6 恒等 | `pnpm ha6:prove` 实测 **EXIT=0·75 PASS/0 FAIL**（非卷载红形）——「少 FAIL=已重钉」臂·归 ha6-repin 对表·§9-2 | **绿（已重钉臂·如实登记）** |
| 4 邻面 diff | `git diff HEAD -- ci.yml` 删行 `^-` 恰 **0**·纯增恰 **19 行**（件① 15+件③ 4） | **绿** |
| 5 nightly 双件 | blob `ac47e884`/`09cd220a` 前后恒等 | **绿** |
| 6 ui 零接线 | `rg -c "i18n-locale-ui\|e2e:ui" ci.yml` 基线 1→落码后 **1**（零新增命中） | **绿** |
| 7 typecheck | `pnpm turbo typecheck` EXIT=0 **8/8**（7 cached·零翻动 tsbuildinfo·tracked 面零副产） | **绿** |
| 8 docs:check | `node scripts/ai-docs/check-docs.mjs` 实测 `ai-docs check failed: public_text_policy:PTP_FILE_LIMIT:2137`（**2137>cap 2136**）——**红停上报**·§9-1 | **红（根因不在本刀交付面）** |
| 9 markers | 五类词族（`scripts/i6-239-gates.proof.mjs:151-:153` 运行时组装四词+冲突标记对）对本刀改动集（ci.yml diff 全文+本卷 .md+收据）grep 零命中 | **绿** |
| 10 diff 面机检 | 码面时刻 `git diff --numstat HEAD` 恰 1 tracked=ci.yml（19/0）；落卷时刻恰 2=ci.yml+本卷 .md（收据目录 untracked 入计面见 §9-1） | **绿** |
| 11 卫生 | `pnpm install --frozen-lockfile` EXIT=0（555ms·零 lockfile 改）·`.env*` ABSENT 双向记·actualSpendCny=null·零模型外呼 | **绿** |
| 12 CI 实跑 | 「推 PR 后观察」归 pusher/协调方（四新步首跑时长 GitHub Actions 实测归其面） | **移交** |

### 邻面不回退（协调方加门·各恰 1 run）

| 邻面 | 命令 | EXIT | PASS/FAIL | 墙钟 |
|---|---|---|---|---|
| neg:bend | `pnpm neg:bend` | 0 | **179/0**（✓ 179 条负路径用例全绿） | 6.531s |
| sse-push:notify | `pnpm sse-push:notify:prove` | 0 | **35/0** | 56.651s（runner 收据 56212ms） |
| tokenstream | §5 | 0 | 20/0 | 18.758s |
| scoring-integrity | §5 | 0 | 23/0 | 10.220s |

### migrate 链（协调方加门）

`packages/db/migrations/*.sql` 计数恰 **202**·头 `0202_interview_event_kind_score_card_written.sql`·四门收据 manifest count=202 互证——**绿**。

## §7 ha6 红名单 diff 对本卷 §1.5（门 3 对表）

- 卷载 §1.5（@`79382f4d`·proof blob `d640cc6a`/365 行）：EXIT=1·50 PASS/**26 FAIL**（20 锚漂+2 钉内容+1 census+3 治理）。
- EXEC 实测（@`1be05b4b`·proof blob `740df0a3`/424 行）：**EXIT=0·75 PASS/0 FAIL**·proof 尾注自证 `ha6-repin rolling registry active (baseline 8ba93f0b retired 2026-10-14)`。
- 定性=门 3「**少 FAIL=已重钉**」臂（26→0·零新增 FAIL·零现场漂移）：ha6-repin 已合法并主线（is-ancestor 亲证）落重钉+滚动登记制改形·对表归 ha6-repin。**接线维持不接**（协调方 EXEC 面指令：登记注记维持·接线前置=届时 tip 本地 ha6:prove 绿 ✓+归属 ha6-repin 已 nail ✓·归**另批**）·件①块头注/件③ 注记历史亲证记录逐字节不改（§8-③）。

## §8 成本与容器

- est live=**0**（全门=静态/隔离库机械断言·零模型外呼零 Key 加载零 secrets 消耗）·actualSpendCny=null。
- 隔离容器：isolated-runner 临时 `meetwise-e2e-*` 共 6 件次（四门+neg:bend+sse-push·各一次 run）·runner 自清·收尾 `docker ps -a` 残留 **0** 亲证。
- 收据落 `.tmp/isolated-proof-receipts/`（gitignored `.gitignore:15`·树洁）。

## §9 红与偏差如实登记（Ban 借机修·裁决权归协调方）

1. **门 8 红=停止条件「验收红不可修」命中**：`node scripts/ai-docs/check-docs.mjs` 实测 `ai-docs check failed: public_text_policy:PTP_FILE_LIMIT:2137`（**2137>cap 2136**·+本收据 1）。stash 对照亲证基线：移出本收据文件后同树实测 `ai-docs check passed: … scanned 2136 managed worktree files` EXIT=0 **绿**（本刀 tracked 改动 ci.yml 对计数贡献=0·yaml 虽受管但为既有件非新增）——红构成全分解=**并线后基线恰 2136（=cap 零余量）+件④ 收据 1=2137**。根因=ci-red-clear sanction cap 2136 时其 union 树实测 2135 余 1，其后主线 `0a787906` 并入 batch-residual-plan.md（+1 受管文件）恰耗尽余量，本刀件④ 收据（§1-修法钉定路径 `ai-docs/delivery/receipts/ci-wiring3/00-exec.md`·受管根 `ai-docs/` 下 .md 非忽略件必入计）无从在 cap 内落卷。**本席 Ban 自改 cap**（`public-text-policy.mjs` cap 史全部协调方 sanction·perfload-env-fix 先例「EXEC 红停 PTP_FILE_LIMIT:2131>2128」同形）·按 §8 红停上报·**请协调方裁决上调幅度**（最少 +1 至 2137·沿 +8 先例取 2144 头空可选）。删收据避红=Ban（件④ 为任务书强制产出·且 untracked 面同计 worktree 计数·红与 commit 与否无关）。
2. **门 3 ha6 已重钉转绿登记**（非红非漂移）：卷载红形 26 FAIL→实测 **0 FAIL**·归因=line/ha6-repin 并主线落刀（proof blob `d640cc6a`→`740df0a3`·baseline 8ba93f0b retired·§1 重 pin 全表）·门 3「少 FAIL=已重钉·如实登记归 ha6-repin 对表」臂·登记注记与不接线裁定不变（归另批）。
3. **merge 卷入面登记（零本刀触）**：本线 merge `0c06033d`（merge `1be05b4b`·merge-tree 预演 EXIT=0 零冲突·⛔pull --rebase 未用）卷入 85 文件（ci-red-clear/ha6-repin/batch-residual-plan/perfload-env-fix 等合法落刀）·对本刀 §0.1 锚面唯一漂=ha6-companion.proof.mjs（§1/§9-2）·其余十一锚全恒等。

## §10 卫生与 pins

- markers 五类零命中（ci.yml diff 19 行+本卷 REQUEST 全文+本收据 grep EXIT 空）·命令回执：词族运行时组装自 `scripts/i6-239-gates.proof.mjs:151-:153`·词面不入卷防自匹配。
- `pnpm install --frozen-lockfile` EXIT=0·`pnpm-lock.yaml` 零改·`.env*` 双向 ABSENT（status 零触+文件零新增）·零迁移零 DDL 零依赖升级零产品码。
- 五门 proof/脚本本体（§1 表 7 件）+nightly 双件+package.json+共享 SSOT 前后 blob 恒等零触。
- pins 十一值零翻：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
