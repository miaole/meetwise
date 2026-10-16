# DBACL2-CI-SHALLOW-FIX 00-exec 收据（EXEC 席·2026-10-16·untracked 口径沿 dbacl2-ci-wire 件② 先例）

工作区 `meetwise-dsf` · 分支 `line/dbacl2-ci-shallow-fix` · EXEC 基线=merge `cadd973e`（origin tip=`f2e8de7b`=派单下界「tip≥f2e8de7b」以等号成立亲证·merge-base=`d1d01853`·入并 1 commit=`f2e8de7b` cap sanction 2184→2192）· pre-exec 双审会签 PASS（席1 agent_753a33c4+席2 agent_fb238374·P2 重 pin 四件+席1 P2-B 随卷落）· est live=0 · actualSpendCny=null。

## 字段① 门矩阵十二门全表（EXIT 原值内嵌）

| 门 | 结论 | 证据（EXIT 原值） |
|---|---|---|
| 1 解析 | 绿 | js-yaml@4.3.2 parse EXIT=0·verify steps=**103 恒等**（零步增·with 面修非增步·步数熔断=0 未行使）·`steps[0].with` 恰 `{"fetch-depth":0}`·全 103 步 name/run/uses 序列对改前基线逐位恒等（全序列 diff 唯一变化=idx0 增 with 键·剥除该键后 diffs=0）·`steps[0].env`=null·continue-on-error=null·retry 无 |
| 2 actionlint | 绿 | actionlint 1.7.12 告警集对基线**恒等**=恰 3 既有 shellcheck（SC1083×2+SC2034×1·非本刀面）·行锚 `:146`×2/`:155`×1→`:150`×2/`:159`×1 恰 **+4 平移**（插入块落位 `:33-:36` 使然·告警文本逐字节恒等 modulo 行号·零新增零消失）·yamllint 不在仓如实登记 |
| 3 db-acl2:prove | 绿 | 两跑均 EXIT=0·PASS 恰 **38**/FAIL 0（0 容差）：run1 墙钟 **23.126s**/收据 durationMs **22440** outcome=passed·run2 墙钟 **20.535s**/收据 **19788** passed·均 ≤56.8s 熔断（band 8-25s 带内·draft 双跑 18.28s/15.03s 同带）·恰 2 run 零 retry（run2=协调方「fetch-depth:0 后本地行为恒等核」·首跑已绿非 retry-to-green）·RESULT 两跑 failures=0 |
| 4 纯增机检 | 绿 | `git diff f2e8de7b -- .github/workflows/ci.yml`（届时基线 SHA=P2-1 重 pin 值）numstat **+4/−0**·删行（`^-[^-]`）**恰零**·**单 hunk**（`@@` 计数=1） |
| 5 锚位机检 | 绿 | `:32` checkout 行逐字（`- uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4`）→新增块 `:33-:36`→`:37` 空行→`:38` `- uses: pnpm/action-setup@f40ffcd9367d9f12939873eb1018b921a783ffaa # v4`（新增块后首个非空行·sed 亲证）·卷 `:58-:61` 提取块对树内 `:33-:36` diff EXIT=0 **逐字节恒等** |
| 6 零触 blob | 绿 | 改后全等：db-acl2.proof.ts=`31ce9fb5`+package.json=`3b04b871`+run-e2e-isolated.mjs=`0787a7ff`+nightly.yml=`ac47e884`+nightly-ciw2.yml=`09cd220a`（五值零漂）·ci.yml=`d2dc8d2c`→`527a1d80`（365→369 行·唯一码改件） |
| 7 CI 形模拟双形复跑 | 绿 | 红形=`git clone --depth 1 --no-local`（@merge `cadd973e`·is-shallow=true·5628 files）→`git diff --name-status 95911975 HEAD -- packages/db/migrations` **EXIT=128**·`fatal: bad revision '95911975'`（与 CI run 38866256244 job log status=128 恒等）；绿形=同仓 `git fetch --no-tags origin line/db-pgp-acl` 后同 diff **EXIT=0**·**60 行全 A**·D/R/M 恰 0。双形与起草席 §1.2③④ 复现恒等 |
| 8 docs:check | 绿 | `node scripts/ai-docs/check-docs.mjs` EXIT=0·收据落卷后终值 **2178 ≤ cap 2192**（P2-2 operative·`f2e8de7b` sanction 落值·锚行 `:100` MAX_FILES=2_192 亲证·=d1d01853 主线 2177+本收据 1·本卷已在 d1d01853 后本支线 c90f8bc7 计入 2177 口径承 wire 收据计入先例） |
| 9 markers | 绿 | 五类标记词（词族运行时组装防自匹配=四词组装+冲突标记对）改动集（ci.yml+本卷 .md+本收据）grep 零命中 EXIT=0 |
| 10 diff 面 | 绿 | EXEC turn 恰 **2 tracked**=ci.yml（+4/−0）+本卷 .md（Status 翻面+P2 重 pin 落卷+§9 append）·收据目录 untracked（本件）·零多 tracked |
| 11 卫生 | 绿 | `pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向（zsh no matches+`git ls-files '.env*'`=0）·actualSpendCny=null·零模型外呼·零 Key·隔离容器 2 件次（db-acl2×2 run）runner 自清残留 0 |
| 12 CI 实跑 | 移交 | 推 PR 后观察归 pusher/协调方（本席 ⛔push）·PR #109 verify step 40 预期转绿=终证（job log 应现全史 fetch+P4-1 PASS）·首跑 fetch 增时回填本收据字段⑥ |

## 字段② EXIT 原值

门 1 js-yaml parse EXIT=0；门 2 actionlint EXIT=1（既有 3 告警·基线 `cadd973e` 同形 EXIT=1 恒等·告警集见字段①）；门 3 run1/run2 EXIT=0/EXIT=0；门 7 红形 EXIT=128/绿形 EXIT=0（模拟口径·非门红）；门 8 check-docs EXIT=0；门 9 markers grep EXIT=0（零命中）；门 11 frozen-lockfile EXIT=0。

## 字段③ 复跑时长与 PASS 计数

- db-acl2:prove run1：墙钟 **23.126s** / 收据 **22440ms** · PASS **38** / FAIL 0
- db-acl2:prove run2：墙钟 **20.535s** / 收据 **19788ms** · PASS **38** / FAIL 0（本地行为恒等核·fetch-depth:0 对本地全史仓零影响兑现）

## 字段④ diff numstat

- EXEC turn 终态（对 merge `cadd973e`）：`.github/workflows/ci.yml` **4 0** + 本卷 `.md`（Status 三处翻面+P2 重 pin+§3-3 措辞+§4 补强+§9 append）·收据目录 untracked。
- merge `cadd973e` 对 `f2e8de7b`：2 files +9/−7（cap sanction 双件 public-text-policy.mjs+proof·零 ci.yml 触亲证）。
- merge `cadd973e` 对 `d1d01853`：ci.yml 恰 0 触（d1d01853..f2e8de7b 对 ci.yml 零 commit 亲证）+本卷 .md（起草卷）。

## 字段⑤ 重 pin 全表（对届时 tip `f2e8de7b`/merge `cadd973e`·P2-1/P2-2 承载）

| 锚 | pin 值 | 漂 |
|---|---|---|
| ci.yml | blob `d2dc8d2c`/365 行（改前·零漂恒等）·行锚 `:15-:17`（secrets-scan 全史先例）+`:32` verify checkout+`:33` 空+`:34` action-setup+`:164` db:prove+`:196` db-acl2:prove 全命中·steps=103·红步 idx 38/1b 39/UI 40·`steps[0].with` ABSENT | 无 |
| db-acl2.proof.ts | `31ce9fb5`/463 行·`:44-:45` BASE_SHA='95911975'+`:414-:420` P4-1 断言面 | 无 |
| package.json | `3b04b871`·`:407-:408` db-acl2:prove 注册链 | 无 |
| run-e2e-isolated.mjs | `0787a7ff`/3201 行 | 无 |
| nightly.yml / nightly-ciw2.yml | `ac47e884` / `09cd220a` | 无 |
| 基线锚 | `d1d01853`→**`f2e8de7b`**（P2-1·`d1d01853` is-ancestor `f2e8de7b` 亲证·merge `cadd973e` 并入） | P2-1 有漂·卷内已同步 |
| cap 锚 | `public-text-policy.mjs` `:98`→**`:100`** MAX_FILES 2_184→**2_192**（`f2e8de7b` sanction 落值·§2-8/§0.1 同步） | P2-2 有漂·卷内已同步 |
| 锚存活依赖 | `git ls-remote origin refs/heads/line/db-pgp-acl`=`3f50095f` 存活（=起草日恒等） | 无 |
| §0.0 双对表 | branch `line/dbacl2-ci-shallow-fix` 恰 1·worktree `meetwise-dsf` 恰 1·卷名恰 1 | 无 |
| §0.0 在飞复核（立项日全量重跑·含 P2-3 sanction 点名四支） | 七线 tips 与 §0.0 pin 恒等（qbank-integrity-chain `0c94d1ec`/e2e-runner-stale-build-guard `d186dffc`/qbank-pipeline-scope `fc64c7c9`/runtime-kernel-wire `56ae9016`/dbhy1-p4-fix `eee0622d`/hmac-consolidate `fe7071b0`/gitleaks-archive-expand `f20e38c8`）·对 ci.yml 自 d1d01853 **恰 0 触/线**；sanction 四支=本支（件① 本体预期 1 触）+5e-cleanup-sweep `d751e1c2`+queue-shutdown-phases `18a34b41`+session-summary-deepen `039d9baa` **恰 0 触/支** | 无（ssd 支 EXEC 期活推进 f9025ee4→`039d9baa` docs-only nail·0 触如实登记） |
| 全 ref superset sweep | ci.yml-touching 未达 HEAD 近史残支唯一=line/db-hygiene `1ab83bd8`（2026-10-08 dbhy1 EXEC·drift:prove→dbhy1:prove 值翻 +1/−1 零步增·其功能内容已由主线 ci.yml `:191-:192` DBHY-1 步 realization·tip `ecf01edc`=dbhy1 nail docs-only 收官「cross-knife account closed」·rkw EXEC P2-2 已承登残枝）·余为 preview/ecs/cursor/codex 古早期支（战役窗前陈旧面） | 登记不熔断（沿 rkw P2-2 残枝登记先例） |

## 字段⑥ CI 首跑实测时长回填

⛔push 遵守——首跑时长与 step 40 翻面观察归门 12 观察席（pusher/协调方推 PR 后回填本节）。本地口径：全史 fetch 增时估 +5~20s/verify 跑（§1.3·size-pack 83.86 MiB·>60s 异常带登记上报）·db-acl2 步（UI 序 40）预期转绿。

## 字段⑦ 偏离清单

1. actionlint 3 既有告警行锚 +4 平移（`:146`/`:155`→`:150`/`:159`）——纯插入位 `:33-:36` 行使·告警集恒等零新增·登记非偏离。
2. 卷 §8 停止条件第 4 类与卷尾 trailer 内「2184」字面系起草期时代冻结文本——operative cap=**2192**（P2-2·门 8 实测 2178≤2192 绿）·沿 dbacl2-ci-wire §9-R3「字面留档不洗·注记为唯一通行口径」形·§9 注记承载。
3. 字段⑥ 空置待回填=⛔push 口径使然（门 12 移交）·非偏离。
4. 余零偏离：修法恰 1 文件恰 4 行逐字节材料化·§1 裁位（候选甲单点 wiring）/件① 逐字节/§5 Ban/pins 十一值零触零翻。

## 字段⑧ post 双审 P2 随卷注记（2026-10-16 nail 波 append 注记形·post 双审会签 PASS 席1 `agent_a47a9657`+席2 `agent_a23efd7b`·三件承登·本节以上原文零洗史）

1. **P2-A CI refspec ⊂ 本地 `--all` 差异面补记一行**：CI verify `fetch-depth: 0` 的 fetch 面=仅 origin 单远端 heads+tags；本地 `git fetch --all` 面=origin+ccl 双远端全 heads（tags auto-follow·ccl=本地路径型第二远端·指向仓根同级树 `meetwise-ccl`·`git ls-remote ccl` 1043 refs 亲证）——即 **CI fetch 面 ⊂ 本地验证面**（严格子集）。含义：本刀 §1.2④ 绿形模拟与本地 38/38 的锚可达证明域=origin∪ccl；若未来某冻结锚对象**仅经 ccl 可达**（origin 无对应 ref）→CI depth 0 仍缺对象红·本地绿对该形不构成证明。§3-3 潜伏三锚（`8bf82a1b`/`48dee7a2`/`9f6edf8f`）今日均经 origin 支可达·不受此差异面影响。
2. **P2-B `db-acl.proof.ts` `:621` 注释与 `:623` 活锚矛盾登记（未来迁锚刀立项前须知）**：`:621` 注释言「BASE_SHA 保留仅作历史注释不再作断言锚」·但 `:623` `spawnSync('git',['diff','--name-status',BASE_SHA,'HEAD',…])` 仍以 `8bf82a1b` 为**活断言锚**（`diff.status===0` sanity 前置项·与 db-acl2 `:44-:45` 注释/`:414` 活锚同型矛盾·本刀起草期 §0.1 已对 db-acl2 亲证同构·本条对 db-acl 面补登）——**未来迁锚刀（§4① P2-4 tag 承锚首选）立项时须按「活锚」对 db-acl 面同权覆盖·不能采信 `:621` 注释的「纯历史」定性**（否则 `8bf82a1b` 对象脱离 fetch 集时 P6-1 将以 status≠0 机械红·同本刀 step 40 归因链）。blob `570f5741` 零触承 §3-3。
3. **P2-C feat tip 活推进 `039d9baa`→`2717e5e7` 零触已证登记**：EXEC 字段⑤ §0.0 pin 的 session-summary-deepen 支 tip `039d9baa` 在 post 期活推进至 `2717e5e7`（=QUEUE-SHUTDOWN nail 波 `d870fc6b`/`f4ddbae0`/`8262df89`+LEDGER 计件 `dd89d290` 顺携并线落 origin）——`f2e8de7b..2717e5e7` 恰 16 commit 对 `.github/workflows/ci.yml` **恰 0 commit 触**（`git log` 亲证·本刀唯一触面零交叠）·门矩阵十二门结论零变·零触已证登记（nail 波序 1 并线即以 `2717e5e7` 为并入 tip·merge `2701f356`）。
