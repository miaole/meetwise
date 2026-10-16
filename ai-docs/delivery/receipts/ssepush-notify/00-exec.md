# SSEPUSH-NOTIFY EXEC 收据（00-exec · 2026-10-14 · 席位=EXEC · 授权链见卷 rev3 节）

**基线**：立项基线=`6187e8e5`（merge `1cf1416c`×`55584f1f`·`git merge --no-ff feat/mysql-schema-skeleton`·ort 零冲突自动解·卷 rev3 重 pin 节在卷）。交付 commit：rev3=`d4e21698`·EXEC 件①=`349ab0af`·收尾=本 commit（§9）。

## 一、工序（执行序逐步）

1. `git fetch`+`git merge --no-ff feat/mysql-schema-skeleton` → merge `6187e8e5`（ort 零冲突·零 union 手解需求）。
2. rev3 errata 席2 R1-R4 落卷（commit `d4e21698`）+EXEC 立项重 pin（五锚零漂移亲证·两锚漂移如实改·链/cap/lint 面值更新——详见卷 rev3 节）。
3. EXEC 件①（commit `349ab0af`）：proof tap 块（pre `:66-75`）整体位移至 `:57` 末行 import+`:58` 空行之后、`const h = await boot();`（现 `:70`）之前（块顶 `:59`）·35 断言逐字零动·零产品码零迁移。
4. 门矩阵 §2 九门全跑（下表）·本收据+§9 落卷（commit 3）·STOP=`executed:awaiting_post_prove_dual`。

## 二、件③ 判别 run（恰 1 有效 attempt·结局族 (a)）

- **attempts 全台账**：attempt#1=有效·EXIT=0·`✓ sse-push:notify: 35 条负路径用例全绿`·durationMs=56359·receipt 原物=`proof-receipt-attempt1.json`（target=`sse-push:notify:prove:raw`·outcome=passed·十二键与 rev2 亲证形制同）·stdout 全量 tee=`judgment-run-stdout-attempt1.log`。无重跑无冲销（基建红 0 次·断言红 0 次）。
- **预注册双 PIN 读数（stdout tee 为准）**：
  - `PIN OPT1-C2-LIVE-DEGRADED-LOG SSE_NOTIFY_DEGRADED reason=trigger_missing fallback=legacy_2s_poll hint=trigger_interview_event_sse_notify_absent_see_migration_0143`——**真线非 MISSING**·与 proof regex 期望逐字相符；
  - `PIN OPT1-C2-DEGRADED-WINDOW reason=trigger_missing window_ms=2860`——0<2860<60000 ✓。
- **活体时序（本次全量入卷·stdout tee :14-:16）**：`SSE_NOTIFY_DEGRADED reason=listen_down…`（:14）→`…reason=trigger_missing…`（:15）→`Server listening at http://127.0.0.1:50787`（:16）——两降级线先于 listen 上线·tap 前移后捕获窗覆盖 boot await 窗·§1.3 机制链活体复核成立。
- **R4 环境条件核记**：EXEC 判别 run 操作壳 `G7_FREETIER_REPROVE` rg 零命中（exit=1·未携带）·inheritedEnv 剥离清单不含该 env（`:2706-2718` 亲证）·本 run 双条件成立零外泄。
- **结局族判定**：**(a) 35/35 绿=修法成立+归因闭合**（行关闭效力归协调方·卷 §8-⑤·本刀不宣称关闭）。

## 三、门矩阵 §2 九门（全表）

| # | 门 | 命令 | 结果 | 关键读数 |
|---|---|---|---|---|
| 0 | §6-③ install | `pnpm install --frozen-lockfile` | 绿 | EXIT=0·lockfile 零改（`git status pnpm-lock.yaml` 空） |
| 1 | 改动面窄 | `git diff 6187e8e5`+status | 绿 | 恰 3 类=本卷 .md+proof .ts+收据目录；`rg -c "^\s*A\("` pre==post=**35**；35 断言首参 pre/post 双清单 diff=∅（`asserts-pre.txt`/`asserts-post.txt`·钉死命令 hex 双形态·剥行号列）；src//migrations 入 diff=**0 文件** |
| 1+ | 机检行（rev3 R1） | `rg -n 'const degradedLogs\|const originalWarn\|triggerMissingLog'` | 绿 | pre==post=**5 行**；post 三绑定声明各恰 1（`const degradedLogs`:60·`const originalWarn`:61·`function triggerMissingLog`:66）+调用点恰 2（:203/:242·与 pre 同行号·:77 起全树行号零净平移）。pre 原文（`:67/:68/:73/:203/:242` 五行）与 post 原文（`:60/:61/:66/:203/:242` 五行）全文转载本表下「机检转载」段 |
| 2 | 复绿门（见证点） | `pnpm sse-push:notify:prove` | **绿 35/35** | EXIT=0·双 PIN 读数见上节·结局族 (a) |
| 3 | 不回退门 | `pnpm api-harden:prove` | 绿 | EXIT=0·31 臂（PASS 计数=31·FAIL=0·stdout tee=`gate3-api-harden-stdout.log`）·receipt 原物=`.tmp/isolated-proof-receipts/2026-10-14T19-05-23-487Z-38917-298416bf-61f1-42a6-9eae-0200b8dc038c.json`（.tmp 忽略面·不入受管树以守 cap 预算） |
| 4 | 迁移链门 | `pnpm migrate:prove`+`pnpm drift:prove`+`node scripts/check-migration-version-uniqueness.mjs packages/db/migrations` | 绿 | migrate EXIT=0；drift EXIT=0 零漂移；uniqueness **files=201 violations=0**（exemptions=0143,0152,0160·链 201 头 0201） |
| 5 | typecheck 门 | `pnpm turbo typecheck --force` | 绿 | **8 successful, 8 total / 0 cached**·EXIT=0（stdout tee=`gate5-typecheck-stdout.log`） |
| 6 | lint 承登门 | `pnpm lint`+`pnpm -C apps/api lint` | 绿（恒等承登） | root **5212 problems (0 errors)** ==主线 55584f1f 既登基线 5212；api **1431 problems (0 errors)** ==既登 1431；EXIT=1 系超 max（5200/1421）既登承登红恒等·**零漂移零新增**（stdout tee=gate6a/gate6b） |
| 7 | docs:check 门 | `node scripts/ai-docs/check-docs.mjs` | 绿（终态） | 中间态一红如实登记（见「偏离登记」②）→收据布局合并后终态 **2104≤cap 2104** EXIT=0（计数机制=`ls-files --cached --others`+受管根+文本扩展名·未提交新文件计入） |
| 8 | markers 门 | 五类标记词（词面运行时组装防自指·i6-239-gates §2-7 同源五类·词面不入卷不入收据）改动集直扫 | 绿 | 零命中（改动集=本卷 .md+proof .ts+收据目录全文件） |
| 9 | 净树门 | `git status --porcelain` | 绿（终态） | typecheck 副产物 `apps/web/tsconfig.tsbuildinfo` 已 `git restore`·非交付面零残留 |

## 四、机检转载（rev3 R1·pre/post 全文）

**pre**（基线 blob `97e3561f`）：
```
67:const degradedLogs: Array<{ line: string; t: number }> = [];
68:const originalWarn = console.warn.bind(console);
73:function triggerMissingLog(): { line: string; t: number } {
203:  const trigLog = triggerMissingLog();
242:  const windowMs = healthyAt - triggerMissingLog().t;
```
**post**（`349ab0af`）：
```
60:const degradedLogs: Array<{ line: string; t: number }> = [];
61:const originalWarn = console.warn.bind(console);
66:function triggerMissingLog(): { line: string; t: number } {
203:  const trigLog = triggerMissingLog();
242:  const windowMs = healthyAt - triggerMissingLog().t;
```

## 五、偏离登记（EXEC 期全量·理想零·实际二·均交付面内）

1. **收据布局合并（docs:check cap 预算约束）**：卷 §6-⑤ 收据物清单全数在卷，但承载布局两处合并——(a) 机检 pre/post 两 `.txt` 并入本收据第三节转载段（§2-1 命令已入卷·证物内容零灭）；(b) 门 3 api-harden receipt 原物不复制入受管树、引用 `.tmp` 原路径（门 3 非本刀收据物定义面·stdout tee 已入卷）。**根因**：并线后 cap 2104 对主线 2099+本卷 1 余量仅 4·而收据物受管计数（.txt/.json/.md 计·.log 不计）按卷 §6-⑤ 最小集=4 已提交+2 必需（00-exec.md+判别 receipt 原物）超 2——cap sanction 权归协调方（Ban 借机修 cap）·故在交付面内合并布局零灭证。中间态 docs:check 一红（2106>2104）于门 7 首跑如实登记·终态 2104≤2104 EXIT=0。**若协调方裁须还原独立文件布局→须同步 sanction cap 上调·归 post/协调方裁决。**
2. **门 7/门 9 首跑为中间态红**：门 7 首跑 2106（收据未定型）·门 9 首跑 `apps/web/tsconfig.tsbuildinfo` 残留（typecheck 副产物）——均当场处置（布局合并/`git restore`）·终态复跑绿。非既登基线红·非本刀产品面红。

## 六、与所改无关的基线红（单列·非本刀面）

- lint root 5212>5200+api 1431>1421 承登红（主线 55584f1f SSOT 既登·本刀恒等零新增）。
- `receipts/`（仓根）3280 个未忽略文件——非本刀产物·不受管（MANAGED_ROOTS 外）不占 cap·如实登记存在。
