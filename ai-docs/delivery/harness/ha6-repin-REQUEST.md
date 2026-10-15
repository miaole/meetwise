# HA6-REPIN REQUEST — ha6:prove 26 红治理锚修复刀（A3 行号锚内容化+A5 滚动注册帧+max:1 内容锚·恰 1 治理脚本 `scripts/ha/ha6-companion.proof.mjs`·零迁移零产品码·ha6-repin 战役·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-14 · pre-exec 双审两外席待派 · alone≠dual · Dual PASS ≠ 开工 · 本 commit 不预 claim 任何 post-commit EXIT · ⛔push）· **rev2 2026-10-14**：pre-exec 双审双 FAIL 机器实证收敛（席2 改后脚本落码实跑 75 PASS/1 FAIL·唯一红=flow11 互斥锚）修订席落卷·STOP 值维持待复审（卷尾 rev2 处置摘要）

**席位**：ha6-repin 起草席（诊断由 HA-6 post 席1 定域在案·本席补全逐红取证+修法裁决+起草三责·协调方派）。
**基线**：`feat/mysql-schema-skeleton` @ `8ae2a93e`（fetch 后 origin tip 与本地恒等亲证·SSOT 最新收官 commit）· 分支 `line/ha6-repin`（本席 `git worktree add ../meetwise-h6r -b line/ha6-repin feat/mysql-schema-skeleton` 亲立·建前 `git worktree list` 零同名树）· 工作树 `meetwise-h6r`（仓根同级）。
**立项出处**：①HA-6 post 席1 定域 brief（26 红四簇清单+现值读数+两度静默翻红无人察觉+后刀门矩阵均不含 ha6:prove 的失效史）；②`scripts/ha/ha6-companion.proof.mjs`（blob `d640cc6a`·365 行·`ha6:prove` 注册于根 package.json·本席亲读全 365 行+本树实跑复现 **EXIT=1·50 PASS/26 FAIL**）；③`ai-docs/delivery/harness/ha-6-companion-REQUEST.md:135` 原卷升级条款原文「行号再漂=FAIL→回 REQUEST 补审」——该路径自 HA-6 落卷起从未被行使，本刀即其首次行使；④形制范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8+trailer 形制·STOP 三条款+四类停止条件口径）。

## §0 现状锚（起草席亲证 @`8ae2a93e`·rg/sed/Read/git hash-object/实跑逐条实测·**EXEC 立项照本节对届时 tip 再重 pin**——结论不变则只更行号/blob）

### 0.0 防重双对表 + 在飞交叠

- `git branch --list "line/ha6*"` 命中 `line/ha6-close`+`line/ha6-repin` 两支：后者=本席亲立本刀分支；前者=HA-6 收官姊妹支（末触 proof.mjs=`90258ec3` 既并祖·非交叠面）。`ls ai-docs/delivery/harness/ | rg ha6-repin` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀唯一码触面=`scripts/ha/ha6-companion.proof.mjs`（治理脚本·非产品码）。起草时点全 `line/*` 支线对该文件末触=`90258ec3`（HA-6 原始落卷·已在 HEAD 历史）——**零在飞新增触**。届时重扫：`for b in $(git branch --format='%(refname:short)' | grep '^line/'); do git log -1 --format='%h' "$b" -- scripts/ha/ha6-companion.proof.mjs; done` 出现非 `90258ec3` 新触且该支非祖先→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 8 hex 亲算 @`8ae2a93e`）

| 文件 | blob（8 hex） | 关键锚 |
|---|---|---|
| `scripts/ha/ha6-companion.proof.mjs` | `d640cc6a`（365 行） | **本刀唯一码改件**。现结构：`:53` `BASELINE='8ba93f0b'` 冻结基线常量（使用点 `:206`/`:309`/`:312`/`:320`/`:332`/`:338` 六处·rg 亲证）·`:103-106` `maxOneExpected` 行号集·`:107-117` max:1 census·`:118-123` 两 lineAt 内容钉·`:205-209` C1 numstat 门·`:237-251` A3 pins 数组（13 流 20 行钉）·`:253-266` 逐 pin 循环（值全等 13 断言+行钉 20 断言）·`:308-311` `gitDiffEmpty` 助手·`:312-314` principal 零 diff 门·`:316-319` principal :957/:964 行钉·`:320-322` probe 零 diff 门·`:324-335` `BANNED_COMPOSE` 15 文件 Ban·`:337-345` 根 package.json 对基线全脚本零删改门·`:346-348` ha6:prove 注册门 |
| `apps/api/src/modules/auth/auth.service.ts` | `06c72cc1` | A3 flow0-3 四流所在·**内容已变**：`signup:${b.email}`→`signup:${email}`（归一邮箱）+`this.rl.allow(`→`await this.rl.allow(` |
| `apps/api/src/modules/recruiter/recruiter.service.ts` | `d89d5a49` | A3 flow4-5·位移+await 词面变（`f31d56d1` `!this.rl.`→`!(await this.rl.`·rev2 勘正） |
| `apps/api/src/modules/quiz/quiz.controller.ts` | `e77480dd` | A3 flow6·位移+await 词面变（同 `f31d56d1`·rev2 勘正） |
| `apps/api/src/modules/interview/interview.controller.ts` | `1426c175` | A3 flow7·位移+await 词面变（同 `f31d56d1`·rev2 勘正） |
| `apps/api/src/modules/resume/resume.service.ts` | `1769589e` | A3 flow8-9·位移+await 词面变（调用行同 `f31d56d1`·PARSE_MAX 常量行零 await 面·rev2 勘正） |
| `apps/api/src/modules/interview/interview.service.ts` | `42cf316e` | A3 flow10-12·位移+await 词面变（turn 消费点现恰 2 处 `:436`/`:469`·`!(await this.rl.allow(` 词面 rg 亲证·rev2 勘正） |
| `apps/api/src/platform/sse-notify.service.ts` | `655746c1` | max:1 sse-listen 钉·`:255` `createPool({ max: 1, purpose: 'sse-listen' })`（内容零变·行 `:151`→`:255`） |
| `apps/worker/src/main.ts` | `b47aba76` | max:1 job-wakeup 钉·`:671` `createPool({ max: 1, purpose: 'job-wakeup' })`（内容零变·行 `:661`→`:671`） |
| `docker/compose.ha.yml` | `42a34908` | `:51` anchor 块+`PGPOOL_MAX: "12"` 在位+AG24 死 env 两键零残留（`MODEL_MAX_CONCURRENT`/`MODEL_RPM` rg 零命中亲证） |
| `docker/compose.prod.yml` | `73462150` | AG24 死 env 两键零残留（rg 零命中亲证） |
| `package.json`（根） | `3b04b871` | `ha6:prove` 注册在位+`breaker:prove` 已删（AG24 sanctioned 态） |
| `packages/db/src/principal.ts` | `c31cbac0` | 池面三锚各恰 1 处（§1-修法件②正则·本席逐条验真 count=1） |
| `scripts/ha/probe.multi.mjs` | `b91917e8`（全 40 hex=`b91917e8ede075e08b080f7a9ae76933cfe36dcd`） | **滚动注册帧首个注册件**（fail-closed 面整文件） |
| `receipts/ha-1/rate-limit-dilution.json` | `3e8a7415` | 值全等断言基准列（只读） |
| `receipts/ha-6/rate-limit-census.json` | `7ea99014` | 13 行点数闭合+countClosure 13/6/7/5+zeroDriftConstants 6（只读） |

### 0.2 现值读数（本席本树实跑亲证·2026-10-14）

`node scripts/ha/ha6-companion.proof.mjs` → **EXIT=1 · PASS=50 · FAIL=26**。实证在绿面（实质未漂）：①13 流值全等 13/13（census vs ha-1 `current` 列逐流恒等·值域 `3 burst / 0.02 perSec`…`3 burst / (3/3600) perSec`）；②六常量零漂 6/6（`zeroDriftConstants.count=6`）；③`PGPOOL_MAX: "12"` 四 service（api-a/api-b/worker-a/worker-b）anchor merge 传播全在；④x-ha anchor 消费点恰 4（现 `:156 :183 :210 :274`·门=count=4 非行号）；⑤compose config 86 stub EXIT=0；⑥A1 预算算术 14 断言全绿（76/21/64/94/100/124/62/148）；⑦A4 负断言三面全绿；⑧principal.ts:946 单源表达式在位。实证红面=§1.1 26 条。

### 0.3 迁移号登记（预期零迁移零 DDL）

`ls packages/db/migrations | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`；`node scripts/check-migration-version-uniqueness.mjs`→`files=202 violations=0 exemptions=0143,0152,0160`。本刀修法=纯治理脚本断言改形·**预期零迁移零产品码**。EXEC 期若现非预期迁移需求→停（越界需要类）上报。

## §1 红事实（26 红逐条清单·四簇·本席逐条亲跑归因）

### 1.1 红清单（实跑原文·EXIT=1）

**簇 A（20 红·A3 13 流行号钉全灭）**——`pins` 数组（proof `:237-251`）20 个行号钉逐行 `lineAt` 校验全数 FAIL，报错尾缀均为「行号再漂，回 REQUEST 补审」：

| # | 流 | 文件 | 基线行→现行 | 内容形 |
|---|---|---|---|---|
| 1 | flow0 signup:email | auth.service.ts | `:28`→`:46` | **内容变**（`b.email`→归一 `email`） |
| 2 | flow1 `'10,0.05'` | auth.service.ts | `:11`→`:13` | 纯位移（常量行·零 await 面） |
| 3 | flow1 SIGNUP_IP_CAPACITY | auth.service.ts | `:12`→`:14` | 纯位移（常量行·零 await 面） |
| 4 | flow1 SIGNUP_IP_REFILL | auth.service.ts | `:13`→`:15` | 纯位移（常量行·零 await 面） |
| 5 | flow2 signup:global | auth.service.ts | `:28`→`:46` | 位移+await 词面变（同 :46 合行） |
| 6 | flow3 login:email | auth.service.ts | `:54`→`:85` | **内容变**（`b.email`→归一 `email`） |
| 7 | flow4 invite:principal | recruiter.service.ts | `:114`→`:161` | 位移+await 词面变 |
| 8 | flow5 invite:ip | recruiter.service.ts | `:116`→`:163` | 位移+await 词面变 |
| 9 | flow6 quiz slot | quiz.controller.ts | `:56`→`:58` | 位移+await 词面变 |
| 10 | flow7 interview slot | interview.controller.ts | `:262`→`:263` | 位移+await 词面变 |
| 11 | flow8 resume-file | resume.service.ts | `:36`→`:39` | 位移+await 词面变 |
| 12 | flow9 PARSE_MAX 常量 | resume.service.ts | `:20`→`:22` | 纯位移（常量行·零 await 面） |
| 13 | flow9 resume-parse slot | resume.service.ts | `:48`→`:51` | 位移+await 词面变 |
| 14 | flow10 VOICE_RL 常量 | interview.service.ts | `:25`→`:31` | 纯位移（常量行·零 await 面） |
| 15 | flow10 voice 消费点 | interview.service.ts | `:338`→`:373` | 位移+await 词面变 |
| 16 | flow11 TURN_RL 常量 | interview.service.ts | `:27`→`:33` | 纯位移（常量行·零 await 面） |
| 17 | flow11 turn 消费点一 | interview.service.ts | `:399`→`:436` | 位移+await 词面变 |
| 18 | flow11 turn 消费点二 | interview.service.ts | `:432`→`:469` | 位移+await 词面变 |
| 19 | flow12 REPORT_RETRY_RL 常量 | interview.service.ts | `:30`→`:36` | 纯位移（常量行·零 await 面） |
| 20 | flow12 report_retry 消费点 | interview.service.ts | `:701`→`:747` | 位移+await 词面变 |

**簇 B（2 红·A1 max:1 内容钉行号灭）**：`sse-notify.service.ts:151` content drifted（现 `:255` 内容逐字恒等）+ `worker main.ts:661` content drifted（现 `:671` 内容逐字恒等）。
**簇 C（1 红·max:1 census 集合钉）**：`explicit max:1 census drifted: got [sse-notify:255, worker:671] expected [sse-notify:151, worker:661]`——全仓 `createPool({max:1` 恰 2 处治理面零变·纯行号集合失配。
**簇 D（3 红·A5 冻结基线机制灭）**：①C1 `compose.ha.yml diff vs 8ba93f0b is not exactly one added line: "1 2"`（+1=PGPOOL_MAX 在位·-2=AG24 死 env 两行删）；②`Ban violated: existing compose touched: docker/compose.prod.yml`（同 AG24 死 env 删行）；③`package.json additive violated: breaker:prove`（根脚本对基线被删·AG24 sanctioned 清理）。

### 1.2 逐簇归因（git log 逐文件亲证·主因+链续推口径）

- **簇 A/B/C 共因=基线 `8ba93f0b` 后主线持续演进·他人拥有文件必然挪行**：
  - `auth.service.ts`（红 1-6）：`ee424923` AUTHZ-HARDEN 5A-1 EXEC=主因（normalizeEmail 落码→`signup:${b.email}`/`login:${b.email}` **内容变**+常量块下移 3 行+signup 段下移 18 行）·`f31d56d1` API-HARDEN EXEC=await 异步化整行重写（`this.rl.allow(`→`await this.rl.allow(`·行差零·词面变）·`989adfdd` AUTHZ-34-RESIDUAL 链续。
  - `recruiter.service.ts`（红 7-8）：`d76eb5d2` i3-job-mgmt EXEC=主因（`:114`→`:160` +46·经 `c042729b` 并线带入·对本文件 numstat +49/-3 净 +46 本席亲证）·`ee424923` +1→`:161`·`f31d56d1` await 词面变（行差零）。**rev2 勘误（R2）**：原「`365a23b6` i4-invite-face merge=主因 +46」误标删除——`365a23b6` 对本文件仅 +7/-1 亲证非 +46 主因。
  - `quiz.controller.ts`（红 9）：`e54fc551` h5-role-input=主因（`:56`→`:58`）·`f31d56d1` await 词面变（行差零·rev2 补贡献）。
  - `interview.controller.ts`（红 10）：`baf31a4e` TOKSTREAM-S4B（经 `8676777c` s4b 并线带入）=主因（`:262`→`:263`）·`f31d56d1` await 词面变（行差零·rev2 补贡献）。
  - `resume.service.ts`（红 11-13）：`57370d67` 5E 簇D +1·`86303901` ci-wiring2 +1（`:20`→`:22`）·`f31d56d1` await 词面变（调用行 `:39`/`:51` 行差零·PARSE_MAX 常量行零 await 面·rev2 补贡献）。
  - `interview.service.ts`（红 14-20）：`7b6d0f38` i6-239 EXEC=常量块主因（`:25`→`:30`）·`57370d67` +1→`:31`·消费点段 `:338`→`:373`/`:701`→`:747` 链续推（5E/f4234c92 族）·`f31d56d1` await 词面变（消费点行 `:373`/`:436`/`:469`/`:747` 行差零·常量行 `:31`/`:33`/`:36` 零 await 面·rev2 补贡献）。
  - `sse-notify.service.ts`（簇 B 红 1+簇 C）：`baf31a4e` `:151`→`:200`·`f31d56d1`（LISTEN 第二通道接线）`:200`→`:206`·`8676777c` 并线 `:206`→`:255`。
  - `worker/src/main.ts`（簇 B 红 2+簇 C）：接线刀链续推挤（`a769554a` batch2-c1 merge 起·`9826c468`/`c6b2e437`/`d31be795`/`3e4b5de9`/`b20ee350`(AG-43 qbank-release-sweep 接线)/`0dcc73f0`/`0dc4f5d7` 族 ±1~7 连续·净 +10）`:661`→`:671`。**rev2 序注（R6/R7）**：八 commit 时间序 old→new=`0dc4f5d7`→`0dcc73f0`→`b20ee350`→`3e4b5de9`→`d31be795`→`c6b2e437`→`9826c468`→`a769554a`·前七者经 `git merge-base --is-ancestor` 对 `a769554a` 逐个亲证为祖先·即 `a769554a`=batch2-c1 收口 merge 居**链末**非链起·净 +10 为全链累积读数。
- **簇 D 共因=`724d61b5` AG24-LANGFUSE-MODEL EXEC（rev2 双审 BOTH PASS+协调方授权的合法清理刀）**：死 env 两键（`MODEL_MAX_CONCURRENT`/`MODEL_RPM`）四处删（compose.prod `:36-37`/compose.ha `:69-70`/worker.env/api.env）+根 `breaker:prove`+`prove:breaker` 两门+`circuit-breaker.ts`/`rate-limit-model.ts`/`breaker.proof.ts` 三文件整删。**ha6 的冻结基线 diff 门把他人刀的合法演进判为越触**——机制错非行为错。
- **归因结论**：26 红全部=**锚形制失效（绝对行号/冻结提交 diff 对持续演进面天然衰减）**，零一例为限流值/预算值/消费点数的实质漂移（§1.3）。两度静默翻红无人察觉+后刀门矩阵均不含 ha6:prove=该机制已丧失门效，修复属治理必需。

### 1.3 实质未漂面（值域亲证·§1-修法值锚的凭据）

13 流值全等 13/13+六常量 6/6+PGPOOL_MAX "12"×4 service+86 stub+消费点 4+max:1 恰 2 处（`sse-listen`/`job-wakeup` 各恰 1）+principal 三池面锚各恰 1 处+死 env 两键全 compose 面零残留（15 文件逐一 rg 零命中亲证）——全部本席亲跑实证（§0.2）。

## §1-修法（恰 1 文件 `scripts/ha/ha6-companion.proof.mjs`·零迁移零产品码·四裁决）

**修法总裁决（席1 方向 sanctioned·本席落值）**：proof 的门从「位置锚（绝对行号/冻结提交 diff）」全量切换为「内容/值锚（正则+计数+注册 blob）」；行号一律降级为 PASS 消息内的非门读数。**⛔ 不得更改**：13 流值全等断言（13 条）·六常量断言·A1 全部 14 断言（含 `:51` anchor 行号门·本刀 sanction 外·现绿零触）·A2 全部门（含消费点 count=4 门）·A4 三负断言·`haStatus: NOT_HA`/`releaseEvidence: false`/`claimProductionHA: false` 三输出行·尾部 note 行格式。

### 件①（裁决一+三·A3 20 行钉→19 内容锚（rev2 删重复锚）·簇 B/C 三钉→内容钉·断言数 76→75 守恒账）

**rev2 R1（P0）**：rev1 草案 flow11 第二锚（want=1·turn allow 正则）与第三锚**逐字节相同**·同形 want=1 对现树 got 恒 2（消费点恰 2 处 `:436`/`:469` rg 亲证）≠1=恒假红·席2 改后脚本落码实跑 **75 PASS/1 FAIL·唯一红即此互斥锚**（铁证）→两审会签·协调方裁决**删重复锚**·「turn 恰两消费点」治理语义由第三锚 count=2 门独承（零损·承替注记落本件+守恒表）·二择一之真异锚承替案（`requireOwnerUserId(principal, 'interview.turn')` 保 76）否决。

1. **`pins` 数组（现 `:237-251`）整体替换**为下形（`lines: {行号: 正则}`→`anchors: [[正则, 期望命中行数], ...]`·**正则已逐条对现树验真**·EXEC 立项时须对届时 tip 复验 count 全等后再落）：

```js
const pins = [
  { file: 'apps/api/src/modules/auth/auth.service.ts', flow: 0,
    anchors: [[/rl\.allow\(`signup:\$\{email\}`, 3, 0\.02\)/, 1]] },
  { file: 'apps/api/src/modules/auth/auth.service.ts', flow: 1,
    anchors: [[/\?\? '10,0\.05'/, 1], [/^const SIGNUP_IP_CAPACITY = Number\(RL_SIGNUP_IP_RAW\[0\]\).*: 10;/m, 1], [/^const SIGNUP_IP_REFILL = Number\(RL_SIGNUP_IP_RAW\[1\]\).*: 0\.05;/m, 1]] },
  { file: 'apps/api/src/modules/auth/auth.service.ts', flow: 2,
    anchors: [[/rl\.allow\('signup:global', 60, 1\)/, 1]] },
  { file: 'apps/api/src/modules/auth/auth.service.ts', flow: 3,
    anchors: [[/rl\.allow\(`login:\$\{email\}`, 5, 0\.2\)/, 1]] },
  { file: 'apps/api/src/modules/recruiter/recruiter.service.ts', flow: 4,
    anchors: [[/rl\.allow\(`invite:\$\{principal\}`, 12, 0\.05\)/, 1]] },
  { file: 'apps/api/src/modules/recruiter/recruiter.service.ts', flow: 5,
    anchors: [[/rl\.allow\(`invite:ip:\$\{ip \?\? 'unknown'\}`, 12, 0\.05\)/, 1]] },
  { file: 'apps/api/src/modules/quiz/quiz.controller.ts', flow: 6,
    anchors: [[/rl\.acquireSlot\(slotKey, 5\)/, 1]] },
  { file: 'apps/api/src/modules/interview/interview.controller.ts', flow: 7,
    anchors: [[/rl\.acquireSlot\(slotKey, 5\)/, 1]] },
  { file: 'apps/api/src/modules/resume/resume.service.ts', flow: 8,
    anchors: [[/rl\.allow\(`resume-file:\$\{principal\}`, 15, 0\.1\)/, 1]] },
  { file: 'apps/api/src/modules/resume/resume.service.ts', flow: 9,
    anchors: [[/^const PARSE_MAX = Number\(process\.env\.RESUME_PARSE_MAX \?\? 6\)/m, 1], [/rl\.acquireSlot\('resume-parse:global', PARSE_MAX\)/, 1]] },
  { file: 'apps/api/src/modules/interview/interview.service.ts', flow: 10,
    anchors: [[/const VOICE_RL = \{ capacity: 40, refillPerSec: 0\.3 \}/, 1], [/rl\.allow\(`voice:\$\{principal\}`, VOICE_RL\.capacity, VOICE_RL\.refillPerSec\)/, 1]] },
  { file: 'apps/api/src/modules/interview/interview.service.ts', flow: 11,
    anchors: [[/const TURN_RL = \{ capacity: 30, refillPerSec: 0\.2 \}/, 1], [/rl\.allow\(`turn:\$\{principal\}`, TURN_RL\.capacity, TURN_RL\.refillPerSec\)/, 2]] },
  { file: 'apps/api/src/modules/interview/interview.service.ts', flow: 12,
    anchors: [[/const REPORT_RETRY_RL = \{ capacity: 3, refillPerSec: 3 \/ 3600 \}/, 1], [/rl\.allow\('report_retry:' \+ id, REPORT_RETRY_RL\.capacity, REPORT_RETRY_RL\.refillPerSec\)/, 1]] },
];
```

   逐 pin 循环（现 `:253-266`）改形：值全等断言（`row?.current === ha1Row?.current`）**原样保留**；行钉循环改为——每个 `[re, want]` 对整文件（按行 split）计匹配行数 `got`，`check(got === want, \`...\`${pin.file} hit-lines=[...命中行号作非门读数...]\`, \`...got ${got} != want ${want} — 值/锚形漂移，回 REQUEST 补审\`)`。flow11 第三锚（count=2）即「turn 恰两消费点」治理门·对应旧 `:399`+`:432` 双行钉。**rev2 注（R1）**：flow11 锚数 3→2·删锚=上述互斥锚（want=1 与 count=2 门同形异值）·双消费点门由第三锚（want=2）独承——现树 `:436`/`:469` 两行同词面 rg 计数=2·got=2=want=2 恒绿亲证。命中行号只入 PASS 消息文本·**⛔ 不得作为门条件**。
2. **max:1 两内容钉+census（现 `:103-123`）替换**为三断言（1:1×3）：①census 门=全仓（`repoFiles(['apps','packages'])` ts/mts/mjs·循环原样）`/createPool\(\{\s*max: 1\s*,/` 命中行恰 2·且两命中行所在文件恰=`apps/api/src/platform/sse-notify.service.ts`+`apps/worker/src/main.ts`；②sse 门=该文件 `/createPool\(\{ max: 1, purpose: 'sse-listen' \}\)/` 恰 1 行；③worker 门=该文件 `/createPool\(\{ max: 1, purpose: 'job-wakeup' \}\)/` 恰 1 行。命中行号入消息非门。

### 件②（裁决二·A5 冻结基线机制→滚动注册帧·重锚新基线否决·断言数 1:1 守恒）

**二择一裁决=滚动注册帧**。理由：①重锚新基线只把冻结算钟归零，失败模式（他人拥有文件的合法演进 vs 快照比对）原样保留——`8ba93f0b` 后两度静默翻红已实证其必然复发；②滚动帧把「基线推进」从 git 历史的隐式行为改为 proof 内**显式注册表编辑**，每次推进=一次可审计的 REQUEST 补审动作，激活原卷 `:135` 从未被行使的升级路径；③分级注册——恒稳面用内容正则零维护，整文件面用注册 blob+再注册臂，双形各取所长。

落值（替换现 `:308-322` 五段·每段 1:1）：

1. **`:53` `BASELINE` 常量退役**：其六使用点（`:206`/`:309`/`:312`/`:320`/`:332`/`:338`）全在本件替换域内·替换后全文件 `rg BASELINE` 零命中。原位置改为滚动注册表：

```js
// ── 滚动注册帧（HA6-REPIN REQUEST sanctioned 2026-10-14·append-only）──
// 再注册唯一通道=REQUEST 补审（授权越触后更新 blob+追加登记行·Ban 静默改 blob）。
const ROLLING_REGISTRY = [
  { file: 'scripts/ha/probe.multi.mjs', blob: 'b91917e8ede075e08b080f7a9ae76933cfe36dcd',
    registered: '8ae2a93e', note: 'HA6-REPIN 初注册（fail-closed 面整文件·旧 8ba93f0b 零 diff 态顺承）' },
  { file: 'package.json', kind: 'scripts-set',
    digest: '106e457929a535e9b87d303b94d7487adbbca054', registered: '8ae2a93e',
    note: 'rev2 R5 基线 scripts 键值集 digest（计算式唯此一条：git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin·8ae2a93e 与 rev2 起草树亲证恒等·Node JSON.stringify 键排序形=3ef5dc2f 与本值字节不同形已证·Ban 另造等价形替算）' },
];
const SCRIPTS_MUST_EXIST = ['ha6:prove', 'migrate:prove', 'docs:check', 'drift:prove'];
const SCRIPTS_MUST_NOT_EXIST = ['breaker:prove', 'prove:breaker']; // 724d61b5 AG24 sanctioned 双删·防复活（rev2 R3-P2 补第二键）
```

2. **principal.ts 两门（现 `:312-314`+`:316-319`）→行号自由内容锚两断言**：①单源门=`/max: Number\(o\.max \?\? process\.env\.PGPOOL_MAX \?\? 20\)/` 全文件恰 1 处；②HA-3 面门=`/keepAlive: true/` 恰 1 处 且 `/query_timeout: Number\(process\.env\.PG_QUERY_TIMEOUT_MS \?\? 15000\)/` 恰 1 处（复合 check·两正则已验真 count=1）。选内容锚弃 blob：principal.ts 为跨刀共享面·池参数 facet 钉即治理本体·整文件 blob 必然频繁假红。
3. **probe.multi.mjs 门（现 `:320-322`）→注册 blob 门**：`execFileSync('git', ['hash-object', join(root, f)])` 对 `ROLLING_REGISTRY` **整文件登记行**逐件全等；失配 FAIL 文案固定含「文件漂移——若为授权越触·走 REQUEST 补审重注册（append-only 追加登记行）·Ban 静默改 blob」。**rev2 R5 注**：`kind: 'scripts-set'` 登记行非整文件 blob·其 digest 恒等臂归 pkg 注册账门同断言内承检（落值 6）·本门仍只对整文件登记行 hash-object。
4. **C1 numstat 门（现 `:205-209`）→结构复合门一断言**：`compose.ha.yml` 内 `/^  PGPOOL_MAX: "12"/m` 恰 1 行 **且** `/MODEL_MAX_CONCURRENT|MODEL_RPM/` 零命中（本文件）。原「+1/-0 diff」语义由「PGPOOL_MAX 在位+死 env 零残留」结构态等价承替。
5. **BANNED_COMPOSE 15 文件 Ban 门（现 `:324-335`）→存在+死 env 零残留复合门一断言**：15 文件清单原样保留·门=15 文件 `existsSync` 全真 **且** 两死 env 键词在 15 文件零命中（起草时点逐一 rg 亲证零命中）。原「对基线零 diff」判「本刀未越触」的执行期纪律已由 REQUEST/收据流程承载；演化后门值=治理面结构态不回退。
6. **根 package.json additive 门（现 `:337-345`）→注册脚本账门一断言**：`SCRIPTS_MUST_EXIST` 四键全部在 `curScripts` 且值非空 **且** `SCRIPTS_MUST_NOT_EXIST` 两键零命中（rev2 R3-P2：第二键 `prove:breaker` 与 `breaker:prove` 同刀双删·同防复活）**且**基线 scripts 键值集 digest 复算恒等（rev2 R5：ROLLING_REGISTRY `scripts-set` 登记行·同断言内按登记式 jq 管道复算·值漂=非 additive 演进→REQUEST 补审 append）**；`:346-348` ha6:prove 值等断言原样保留。

### 件③（裁决四·漂移事实 append-only 登记）

文件头注释块（现 `:2-33` JSDoc 内·`A5 治理回归` 描述段后）追加 `HA6-REPIN 漂移账（append-only·禁删改旧行）`：记 2026-10-14 复审 26 红四簇归因（簇 A 20=§1.2 逐文件主因 commit；簇 B/C=位移链；簇 D 三红=`724d61b5` AG24 合法清理）+裁决四条+冻结基线 `8ba93f0b` 退役（由滚动注册帧承替）+初注册提交 `8ae2a93e`。输出段（现 `:359-364`）追加一行 `note: ha6-repin rolling registry active (baseline 8ba93f0b retired 2026-10-14)`。**后续任何再注册/再锚只追加新行·Ban 删改历史登记**。

### 件④（收据·交付报告格式）

`ai-docs/delivery/receipts/ha6-repin/00-exec.md` 七字段：①改前改后 ha6:prove 全量输出（50/26→75/0 对照）；②门矩阵全表+逐门 EXIT 原值（§2 十二门）；③diff numstat（恰 1 tracked 码件+本卷 .md 翻面）；④重 pin 全表（对届时 tip 的 §0.1 blob 复算+正则 count 复验逐条）；⑤偏离清单（无偏离写「零偏离」）；⑥断言总数守恒自证（PASS+FAIL 恰 75）；⑦est live=0 声明。

### 断言总数守恒表（rev2 重排：改前面 76→落值 75·差额恰 1=flow11 删重复锚·双列行和=列合计）

| 原断言（改前实跑面） | 数 | 新断言（rev2 落值） | 数 |
|---|---|---|---|
| A3 行钉 | 20 | A3 内容锚（flow11 删字节恒等重复锚·turn 双消费点由 count=2 门承替） | 19 |
| max:1 census+sse:151+worker:661 | 3 | census 集合门+sse 内容门+worker 内容门 | 3 |
| C1 numstat | 1 | C1 结构复合门 | 1 |
| BANNED_COMPOSE 零 diff | 1 | 15 文件存在+死 env 零残留 | 1 |
| pkg additive（零删改） | 1 | pkg 注册脚本账（两键 Ban+scripts-set digest 恒等臂·同断言内） | 1 |
| principal 零 diff+957/964 行钉 | 2 | principal 单源门+HA-3 面门 | 2 |
| probe 零 diff | 1 | probe 注册 blob 门 | 1 |
| 其余（A1 14+A2 10+A3 值等 13+receipt 形 5+A4 3+ha6 注册 1+artifacts 1 等） | 47 | 原样零触（rev2 补账：A2 8→10=补 `:190` rendered/`:215` 消费点 count 两门·receipt 形 4→5=补 `:269` zeroDriftConstants·三处 `check()` 在位本席亲证） | 47 |
| **合计** | **76**（=改前实跑 50+26 恒等·原卷「其余 44」漏账 3 修正） | | **75**（删锚案=19+3+1+1+1+2+1+47） |

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·数字口径以实跑实测为准·偏差熔断另注）

1. **ha6:prove 75/75 复绿**：`node scripts/ha/ha6-companion.proof.mjs` EXIT=0·PASS 恰 75/FAIL 恰 0（**熔断=总数≠75 即停「现场漂移」**·rev2 总账 75=改前面 76（50+26）−flow11 删重复锚 1·对不上即停·守恒表 §1-修法）。改前基线=本卷 §0.2（50/26·EXIT=1·EXEC 开工前须在本树复跑一次对齐·该 run 不计入 prove）。
2. **scoring-integrity 存量承登如实**：`node scripts/run-e2e-isolated.mjs scoring-integrity:prove` EXIT=1=预期承登红·红签名须与 d49865ee 门矩阵既登逐字恒等（`scoring-report-integrity.proof.ts:116:50` TypeError Object.hasOwn+`token_stream_reconcile frames=0` 指纹）——签名漂移即停上报（本刀零 TS 零测试改·消红归 perf-prep `6ca9f361` 在途）。
3. **tokenstream 20/20**：`node scripts/run-e2e-isolated.mjs tokenstream:prove:raw` EXIT=0 20 PASS（实测≠20 即如实记并停对表）。
4. **sse-push 35/35**：`node scripts/run-e2e-isolated.mjs sse-push:notify:prove:raw` EXIT=0 35/35（双 LISTEN 三通道并集愈合链维持）。
5. **migrate:prove 链 202**：`node scripts/run-e2e-isolated.mjs migrate:prove` EXIT=0·链 202 头 0202（届时链顶顺延如实记）。
6. **uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`files=202 violations=0 exemptions=0143,0152,0160`（files 对届时链顶亲数）。
7. **typecheck**：`pnpm turbo typecheck --force` EXIT=0 8/8·0 cached。
8. **lint 五值恰等**：`pnpm turbo lint` 12 任务·五值=web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628** 全恰等贴线（全 0 errors·第三红或任一值漂即停）。
9. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2128**（现值 2121 本树亲跑·本卷落卷后 +1=2122·rev2 同卷翻面本树复跑 EXIT=0 仍 2122·**>2128 红停上报**）。
10. **markers 五类零命中**：本刀改动集（proof.mjs+本卷 .md+收据目录）五类标记词零命中（词族定义=`scripts/i6-239-gates.proof.mjs` §2-7·运行时组装·词面不落卷防自匹配·命令与回执入收据）。
11. **diff 面机检**：`git diff --numstat <base>` tracked 路径恰 2=`scripts/ha/ha6-companion.proof.mjs`+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）。
12. **卫生**：零迁移零 DDL（§0.3）·零产品码触（apps/packages src 零字节·proof.mjs 属 scripts/ 治理面）·`.env*` ABSENT 双向记录·零模型外呼零容器 up（proof 自 est live=0）·`actualSpendCny=null`。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零触**：A3 六文件+sse-notify/worker/principal 等 §0.1 全部被读文件零字节改——本刀只改锚的**读法**·不改被读物（为绿改产品码=本战役反向 Ban）。
2. **断言弱化 Ban**：13 流值全等/六常量/A1 14 断言/A2/A4 零触（§1-修法 ⛔ 不得更改清单）·count 门只许等值断言·Ban 放宽为 ≥。
3. **A1 `:51` anchor 行号门维持原样**：现绿·sanction 外·不搭车内容化（若 EXEC 期翻红→停止条件如实登记·归协调方另裁）。**rev2 R6/R7 残留风险登记（备后刀）**：A1 域内尚存两绝对行号门——compose `:51` anchor 门（proof `:77-79`·`anchorStartIdx === 50`）+principal `:946` 行号门（proof `:95-100`·`lineAt(principal, 946)`）·与本刀已内容化的 :957/:964 行钉同款衰减机制·主线再挪行必翻红——登记备后刀同款 REQUEST 补审内容化·本刀零触。
4. **收据/账本只读**：`receipts/ha-6/*`·`receipts/ha-1/*` 零字节改（值全等断言基准面）。
5. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star/ha-6-companion-REQUEST.md 原卷只读——行翻面权归协调方。
6. **零迁移零 DDL 零 CI/wrapper/runner 改零依赖升级**（§0.3）。

## §4 依赖

**①上游已满足**：26 红归因链（§1.2）全在主线 `8ae2a93e`；AG24 清理（`724d61b5`）已并——滚动帧初注册即其 sanctioned 后态。**②无同文件并发**：§0.0 在飞复核规则（EXEC 立项日必做）。**③迁移号**：§0.3 预期零。**④下游**：ha6:prove 复绿后归入后刀门矩阵的建议（含 ha6:prove 一门）归协调方裁量·本卷只断言本刀门值。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§2 门 1 恰 1 prove run+改前对齐 run 各一次·红不重跑冲销）；Ban 翻 pins（十二值+proof 三输出行·零翻转）；Ban 为绿改被读文件/产品码（§3-1·本刀只改读法）；Ban 断言弱化/count 放宽（§3-2·rev2 R1 flow11 删重复锚系两审会签+协调方裁决 sanctioned 承替·不属此 Ban）；Ban 静默改 `ROLLING_REGISTRY` blob/digest 或删漂移账历史行（§1-修法件②③·再注册唯一通道=REQUEST 补审 append）；Ban 触 A1 `:51` 行号门（§3-3 不搭车）；Ban 触收据/SSOT 原卷（§3-4/3-5）；Ban 迁移 Ban DDL（§0.3·需则停上报）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因 26 红外新红（复跑出新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十二值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · P=12/steady=76/headroom=21（proof A1 预算三元·`EXPECTED_P=12` 零改）。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑 prove 门（§0.2 取证 run 为只读静态脚本+docker compose config 渲染·零容器 up 零网络外呼零模型外调）·零 secrets·零生产操作。EXEC 期 ha6:prove 同为静态 proof（est live=0 自证在卷）·邻面门中 run-e2e-isolated 族走隔离容器假体·零生产 DSN 零真实外呼。

## §7 markers=0（卫生声明）

本刀起草改动集（本卷 1 .md）五类标记词零命中（起草席亲跑·词族沿 i6-239-gates §2-7 口径·词面不落卷防自匹配·回执随 EXEC 收据留痕）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 红事实归因结论与 §1-修法四裁决与 §5 Ban/pins 与「恰 1 文件 proof.mjs」唯一码改面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（§0.1 blob 复算+§1-修法正则 count 复验·漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一 blob 漂移且 §1.3 未漂结论受疑（如流值/常量/PGPOOL_MAX 实质变·max:1 不再恰 2 处·principal 三锚失形·§0.1 正则 count 复验不等·§0.0 在飞支线对 proof.mjs 有新增触）→停·重 pin 回炉。
- **机制不满足**：门 1 改后 run 有任一 FAIL（含新钉假红=正则过脆证据）或断言总数≠75（rev2 口径）·或 scoring-integrity 红签名对既登漂移→锚形制裁决被证伪→停·如实升级协调方回炉（Ban 就地加宽正则凑绿·Ban 削断言）。
- **越界需要**：修法诉求超出 proof.mjs 恰 1 文件面（需触被读产品码/收据/SSOT/CI/迁移）→停·另刀或协调方裁决（§3 全条沿承）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 五值漂/docs:check>2128/migrate 链≠202）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*HA6-REPIN REQUEST · 2026-10-14 起草 · **rev2 2026-10-14**（pre-exec 双审双 FAIL 机器实证收敛·协调方裁决删重复锚 75 口径+归因勘误+守恒表重排·处置摘要卷尾）· **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`8ae2a93e` · 分支 `line/ha6-repin` · 工作树 `meetwise-h6r`（本起草席立·建前零同名）· 立项出处=HA-6 post 席1 定域 brief+proof.mjs 本席实跑复现（EXIT=1·50/26）+原卷 `:135` 升级条款首次行使 · 26 红四簇归因（A3 行钉 20 灭=主线演进挪行·auth 两钉兼内容变 `ee424923` 归一邮箱+`f31d56d1` await 化；A1 max:1 两钉+census=位移链；A5 三红=`724d61b5` AG24 合法清理撞冻结基线机制）· 实质未漂亲证（13 流值 13/13+六常量 6/6+PGPOOL_MAX "12"×4+消费点 4+max:1 恰 2）· 修法四裁决=行号锚→已验真内容正则+count 门（值等断言保留·行号降非门读数）+A5 滚动注册帧（重锚否决理由在卷）+max:1 内容集合门+漂移账 append-only·断言总数 rev2 起 **75**（改前面 76=50+26·flow11 删重复锚差额恰 1）守恒表在卷 · 门矩阵十二门（ha6:prove 75/75+scoring-integrity 承登红签名恒等+tokenstream 20/20+sse-push 35/35+migrate 202+uniqueness+typecheck 8/8+lint 五值恰等+docs:check≤2128 红停+markers+diff 面机检+卫生）· 零迁移零产品码 · est live=0 · markers=0 · pins 十二值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*

---

## rev2 处置摘要（2026-10-14 修订席落卷·两审席会签·协调方裁决采「删重复锚→75 口径」案·append-only 卷尾·逐处亲证后落笔）

**收敛基座**：pre-exec 双审双 FAIL·机器实证收敛（席2 把改后脚本落码实跑=75 PASS/1 FAIL·唯一红=flow11 互斥锚）·docs-only 恰 1 .md 翻面·commit=rev2·⛔push。七项落点：

- **R1（P0）→件①**：flow11 `pins` 删第二锚（want=1·与第三锚正则逐字节相同·got 恒 2≠want 1 恒假红）→A3 内容锚 20→**19**·turn 双消费点由第三锚 count=2 门承替（现树 `:436`/`:469` rg 计数=2 亲证·承替注记落件①+守恒表）·全文断言总数「76」口径改 **75/75**（§2 门 1 熔断线/§8 机制不满足/件④①⑥/守恒表合计/trailer 逐处·A1 预算值组与 pins `steady=76` 系预算口径**非断言总数·零改**）·二择一采删简案（`requireOwnerUserId` 真异锚承替保 76 案否决·理由注记落件①）。
- **R2（P1）→§1.2 recruiter 行**：主因改 `d76eb5d2` i3-job-mgmt EXEC（`:114`→`:160` +46·经 `c042729b` 并线带入·对本文件 numstat +49/-3 净 +46 亲证）·`ee424923` +1→`:161` 维持·「`365a23b6` 主因 +46」误标删除（该 merge 对本文件仅 +7/-1 亲证）。
- **R3（P1）→守恒表重排**：A2 8→**10**（补 `:190` rendered/`:215` 消费点 count 两门）·receipt 形 4→**5**（补 `:269` zeroDriftConstants）·三处 `check()` 在位本席亲证·其余 44→**47**·左列和=**76**（=改前实跑 50+26 恒等·原卷漏账 3 修正·双列行和=列合计）·右列和=**75**（删锚案=19+3+1+1+1+2+1+47）·差额恰 1=flow11 删重复锚。
- **R3-P2→件②落值 1/6**：`SCRIPTS_MUST_NOT_EXIST` 补第二键 `prove:breaker`（`724d61b5` 同刀双删·`8ae2a93e` 根 package.json 两键 rg 零命中亲证·防复活不设防补齐）。
- **R4→§0.1 五行+§1.1 十一行+§1.2 五行**：「纯位移（内容零变）」改「位移+await 词面变（`f31d56d1` `!this.rl.`→`!(await this.rl.`）」·recruiter/quiz/ivc/resume/interview.service 五文件调用行词面变贡献逐一亲证补录（f31d56d1 触面 `git show --name-only` 亲证）·常量行（auth `:13-15`·resume `:22`·interview.service `:31/:33/:36`）零 await 面逐行 sed 亲证维持纯位移加注。
- **R5（可选·采）→件②落值 1/3/6+ROLLING_REGISTRY**：增基线 scripts 键值集 digest 登记行（`106e457929a535e9b87d303b94d7487adbbca054`·计算式钉死 `git show <tip>:package.json | jq -cS '.scripts' | git hash-object --stdin` 一条·`8ae2a93e` 与 rev2 起草树恒等亲证·Node JSON.stringify 键排序形=`3ef5dc2f` 与之字节不同形已证并记 Ban 另造等价形）·digest 恒等臂入 pkg 注册账门**同断言内**·断言总数零增·保全全量 additive 语义。
- **R6/R7→§3-3+§1.2 worker 行**：A1 `:51` anchor 门（proof `:77-79`·`anchorStartIdx === 50`）+principal `:946` 行号门（proof `:95-100`·`lineAt(principal, 946)`）两残留行号门风险登记备后刀（本刀零触·同款衰减机制·行使通道=同款 REQUEST 补审）·worker 位移链 commit 序注记（八 commit 时间序 old→new=`0dc4f5d7`→`0dcc73f0`→`b20ee350`→`3e4b5de9`→`d31be795`→`c6b2e437`→`9826c468`→`a769554a`·前七者 merge-base --is-ancestor 对 `a769554a` 逐个亲证为祖先·收口 merge 居链末非链起）。

**自检**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（2122≤2128）·markers 五类零命中（词族沿 i6-239-gates §2-7 运行时组装口径·词面不落卷防自匹配）·STOP=`draft:awaiting_pre_exec_dual` 维持待复审。
