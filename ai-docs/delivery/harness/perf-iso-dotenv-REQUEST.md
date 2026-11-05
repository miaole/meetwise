# ISO-DOTENV-PERF REQUEST（perf runner isolated 形跳仓根 .env 回灌守卫移植·起草席落卷）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 行使落卷·pre-exec dual r3 BOTH PASS+协调方 EXEC 授权·双席 P2 消化+B 臂 bounded 观测窗重行使单窗全绿+非 isolated 臂复验零变+三门绿在卷·待 post-prove 双审两独立外席·alone≠dual·Ban self-approve·est live=0·markers=0·⛔push⛔merge 主线）

> 任务类型：runner 测试基建面一行守卫移植（ISO-DOTENV-ISOLATION → ISO-DOTENV-UI 承登后继刀·performance 腿第三 runner·起草落卷即停·禁 EXEC 期改修法面）。
> 立项出处：协调方派单 brief（ISO-DOTENV-PERF 起草席·沿 `iso-dotenv-ui-REQUEST.md` 同构·「若结构异于 ui/iso 两先例，修法形状按实际结构定（最小移植守卫语义·禁自由发挥）」随令授权）。
> 本刀唯一修法面：`scripts/run-performance-e2e.mjs:24` 仓根 .env 回灌守卫行增 `env.E2E_ISOLATED !== '1'` 判+两行注释（先例形最小移植·净 +3/−1）。零产品码触面。

## §0 事实锚（本席亲证清单·2026-11-05）

- **基线/分支/工作树**：`origin/main` = `09fe2a23d`（=PR #199 fin-draft merge·fetch 后 `git rev-parse origin/main` 亲证·主仓 main behind 3 与本刀无涉）· 分支 `line/perf-draft`（建前 worktree 列表零 `meetwise-perf`·本席 `git worktree add ../meetwise-perf -b line/perf-draft origin/main` 亲立·**主仓只做 worktree add 零其他 mutation**）· 工作树 `meetwise-perf`（仓根同级）· 工作树仓根 `.env` ABSENT 天然成立（基线协议 ABSENT 面承载·主仓 `.env` 内容零读零复制）。
- **防重双查**：harness 目录 `perf-iso-dotenv-REQUEST.md` 建前零命中（`iso-dotenv-isolation-REQUEST.md` 系 HTTP 线原刀卷·`iso-dotenv-ui-REQUEST.md` 系 UI 腿卷（落 `meetwise-idu` 树未并主线）——本卷名零冲突）。
- **现状固化表**（全部 `git show origin/main:<path>` + Read 逐行亲读 @`09fe2a23d`·`scripts/run-performance-e2e.mjs` base blob `28ef896a`·130 内容行 wc -l 亲证）：

| # | 锚 | 亲证结论 |
| --- | --- | --- |
| 1 | `run-performance-e2e.mjs:24-29` | 仓根 .env 回灌区**无任何守卫**（:24 `if (existsSync(ROOT + '.env')) {` 直落→:25-28 逐行正则回灌·`!env[m[1]]` 不覆盖已设→:29 收）——**isolated 形照灌**·恒回灌先形。派单锚「:23-29」→实际 refill if-行在 **:24**（:23 = :11-23 env 对象收尾 `};`）·行号偏差如实登记·语义判定不受影响 |
| 2 | `run-performance-e2e.mjs:30-40` | isolated 删单段在守卫**之后**（:30 `if (env.E2E_ISOLATED === '1') {`→:31-37 凭据删单→:38 `LANGFUSE_` 命名空间整删→:39 `DATABASE_SSL_MODE='disable'`）——删单不覆盖环境语义键（APP_RUNTIME_DB_EXPECTED_ROLE/NODE_ENV/PORT 类）·与 iso 卷 §1.1 环 3 同构 |
| 3 | `run-performance-e2e.mjs:41` | `if (env.E2E_ISOLATED !== '1') throw tagE2EFailure('capability', 'performance_e2e_isolation_required')`——runner **de-facto isolated-only**·**ISOLATED 守卫位在删单段与 throw 两处在场·唯回灌区缺失**（不对称点=ui 卷同形根因） |
| 4 | `run-performance-e2e.mjs:42-47` | `assertNoFakeServiceFlags(env)`+`VOICE_FAKE/OCR_FAKE/E2E_FAKE_MODEL` 三旗扫描→`fake_service_mode_forbidden`——回灌区之后仍可达的 fail-closed 面（哨兵向量载体·§0-6） |
| 5 | `run-performance-e2e.mjs` 全文 | **无 `MODEL_API_KEY` 门·无 `live_provider_key_missing` 词面**（rg 零命中亲证）——结构异于 ui/iso 两先例的**第一异**；g6 行为门 `scripts/g6-e2e-iso-blocked.proof.mjs:103-109` 明文合同：「performance does NOT require Key」+ `:104` 断言 `!KEY_GATE_RE.test(runPerf) && /不把模型时延计入\|无外部模型/` + `:106-107` 断言 runner 词面**不含** `live_provider_key_missing`——**给 perf 加 Key 门=撞 g6 合同·Ban** |
| 6 | `run-performance-e2e.mjs:92-96` | runner 自起 api+worker 子进程（`spawnNode('api'…)`+`spawnNode('worker'… WORKER_BOOTSTRAP:'1')`·**worker spawn extraEnv 无 PORT 覆盖**）——worker 形=与 run-e2e.mjs 同形·**无 web/playwright 面**（结构第二异：无 ui 卷 B 臂的 next build 段·boot 健康观测面=:97 databaseReady+:101-102 exitCode 门+:106-110 readyz 40×1s 环） |
| 7 | `package.json:447-448` | `performance:e2e` → `node scripts/run-performance-e2e.mjs`（直跑·非 isolated·回灌区可达）· `performance:e2e:isolated` → `node scripts/run-e2e-isolated.mjs performance:e2e`（包装器注入）·包装器 baseEnv `E2E_ISOLATED:'1'`（`run-e2e-isolated.mjs:4044` 亲证）+隔离全套 env·**不注 E2E_SKIP_DOTENV**（iso 卷 §0.1-#4 沿承） |
| 8 | `run-e2e.mjs:20-22` | 先例形亲读（ISO-DOTENV-ISOLATION 已并刀）：`:20` ISO-DOTENV-ISOLATION 长注释+`:21` SKIP_DOTENV 语义保持注释+`:22` `if (process.env.E2E_SKIP_DOTENV !== '1' && env.E2E_ISOLATED !== '1') {` |
| 9 | `run-e2e-ui.mjs:29` | UI 腿已修形亲读（`meetwise-idu` 树 `line/idu-draft`·ISO-DOTENV-UI 卷 §1）：if 行加第二判 `&& env.E2E_ISOLATED !== '1'`+同文注释两行（删单行号引用按本文件修改后实值适配）——ui runner **先有** REG-FIX 组8b E2E_SKIP_DOTENV 钩（:24-26 注释在卷）故移植=纯加第二判；**本 runner 无该钩**（结构第三异·§0.2-2 定形）·〔2026-11-05 EXEC 期 P3 re-pin 分注：起草卷锚 :27 系 meetwise-idu 树届时 blob 行号·UI 刀已并 main（faeb05f76=#201 载入）·对 main 现 blob 亲证守卫 if 行实值 **:29**（:27=ISO-DOTENV-ISOLATION 注释·:28=SKIP 语义注释·if 行下移 2）〕 |
| 10 | 哨兵对照对（本席 /tmp 实证·仓树零触·fixture 副本+哨兵 .env 两行=`E2E_FAKE_MODEL=1` 与 `MODEL_API_KEY` 哑值 `dummy-perf-iso-probe`（非真实凭证·仅占位）·依赖文件同布局随拷·apps/api·apps/worker 空目录） | **旧码**（base blob `28ef896a` 原样副本）isolated 形→EXIT=1·输出含 `fake_service_mode_forbidden` ×2·spawn banner「启 API + worker」**0 命中**（哨兵穿透隔离形·spawn 前预检即斩=诊断席伪红机制对 perf runner 的操作级复证）；**修法套用副本**（`037ab2d9`）同态→EXIT=1 `code=database_not_ready`（/tmp fixture 无栈的预期收尾·有界 ~62s）·`fake_service_mode_forbidden` **0 命中**·spawn banner **在场**（哨兵未载=回灌已被阻断直证）——探针临时件已清场 |

- **在飞登记**（两 policy 脚本触面·本席逐支亲测 MAX_FILES 承值）：`line/idu-draft` `0aac6a4c`（ISO-DOTENV-UI 承登后继卷）承 **2_480** 未落 main / `line/g7w-draft` `86af8b34` 承 **2_481** 未落 main（2026-11-05 EXEC 期对届时 tip `fd2b74635` 重引：g7w 已并 main=faeb05f76=#204+b3b660fce post-prove 落 #205·`86af8b34` 系其 EXEC 期 rebase 前史录 SHA 已非 main 祖先·merge-base --is-ancestor 亲证） / `line/r2-draft` `185b0b39` 承 **2_481** 未落 main——三支同触两 policy 脚本=已知共享热面（dual-keep 双留先例形·并线 union 沿常设预授权届时取大重算承登）。其余非祖先 ref 簇全早于基线（ancient 簇 ahead-set ≤2026-10-26·ahead=1 簇 ahead 零 policy 触）。

## §0.2 结构异形三问答（「沿先例同构」的实构适配定稿·EXEC 与双审必读）

1. **问：修法是否照抄两先例的 `E2E_SKIP_DOTENV !== '1' &&` 双判全形？答：不照抄·单判移植。** 本 runner 回灌区**素无** E2E_SKIP_DOTENV 钩（无注释无判·恒回灌先形）；ui 腿系「已有钩+加第二判」，本刀若连 SKIP 判一并移植=**给 perf 新增一个素不存在的旗语义面**（非 isolated+携旗→跳=新行为）——超出「最小移植守卫语义」·按派单「禁自由发挥」条款否决。定稿=守卫行只增 `env.E2E_ISOLATED !== '1'` 判（本刀判据面与 :30/:41 隔离合同同一变量·同源同写防双源漂移；判据时点 .env 未读→`env.` 与 `process.env.` 恒等·iso 卷 §0.2-5 同证）。
2. **问：非 isolated 形行为零变何证？答：真值表两态·唯一翻转格。** (ISO=0)→第一判真→existsSync 照评→回灌（**原样**·恒回灌先形保持）；(ISO=1)→第一判假→短路**不 stat 不回灌**（**本刀唯一新语义格**）。E2E_ISOLATED 从 .env 自举的病态形（shell 未设+.env 设 `E2E_ISOLATED=1`）修法前后行为不变（判据读回灌前 env 拷贝·回灌照走·:30 起删单照跑——iso 卷 §1-④③ 同构登记）。短路面副效应：isolated 形不再 stat 仓根 .env（纯早退·行为面等价）。
3. **问：任务书 C 臂钉 `live_provider_key_missing` 为何改形？答：perf runner 结构不可达（§0-5）。** 该码系 ui runner :55 顶抛门的行为面；perf runner **素无该门**且 g6 `:104-109` 行为合同**明文禁加**（Key-unset 快速失败语义=ui/iso 两 runner 专属·perf 走「no-model」立场）。**结构性适配**：回灌阻断的 perf 形 observable=**哨兵不载**（isolated+哨兵 .env→`fake_service_mode_forbidden` **0 命中**+spawn banner 在场=§0-10 修法臂）对旧码穿透臂（`fake_service_mode_forbidden` ×2·零 banner）——同证回灌已被阻断·强度不减（操作级对照对）。已入偏离清单（§9-①）。

## §0.3 B 臂红诊断登记（rev r2 修法扩展依据·2026-11-05 诊断归因席→rev r2 席承登·收据 `ai-docs/delivery/receipts/perf-iso-dotenv/` 四件在盘随卷）

- **现象**：EXEC 期 B 臂 isolated boot（同境同树·窗1/窗2 两窗 `b-arm-isolated-boot-window{,2}-2026-11-05.log`）：窗1 `E2E_FAILURE class=db code=isolated_postgres_database_not_ready`（docker 栈冷起·未及 runner·非本因）；窗2 PG 就绪（consecutive=3）+migrate `applied=222` 后 perf runner 启 api+worker——api 正常 listening·worker boot 期退出→`E2E_FAILURE class=worker code=worker_exited_before_test` ×2·ELIFECYCLE exit 1（§8 停止条件「机制不满足」类命中→红停诊断·Ban 改判据凑绿）。
- **诊断 run 读数原值 stderr 逐字**（E2E_VERBOSE=1 诊断 run `b-arm-diagnostic1-verbose-2026-11-05.log`·原值照录零洗）：`[worker] file:///…/packages/ai-runtime/src/model-client.ts:520` → `throw new Error('text_endpoint_profile_model_mismatch')` → 堆栈 `at openAICompatibleClient (model-client.ts:520:19) at endpoint (apps/worker/src/interview-service.ts:206:12) at withFailover (interview-service.ts:217:21) at defaultModelClient (interview-service.ts:238:12) at bootstrap (apps/worker/src/main.ts:540:19)`（:520 系 transpile 后运行时行号·TS 源码实值 :682=前缀合同判·本席 :680-682 亲读）·同 run api 侧 `[api] Server listening`+`POST /auth/login → 401` 正常（databaseReady 门达成·exit 门斩在 worker 侧）→ `worker_exited_before_test` ×2。非 isolated 直跑臂 `non-isolated-arm-2026-11-05.log`：`performance_e2e_isolation_required` 正常红（隔离门语义零变·与本因无涉）。
- **三方键集差集**（worker 构造期一致性所需键的供给对账·全程 name-only 零值读零 Key 值触）：① **perf worker 实收 env：零 `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` 键**——runner env 默认区无该二键（亲读）+仓根 `.env` ABSENT（ls 亲证·本刀修法后 isolated 形更零读）+shell `MODEL*` 零键（前缀枚举 0 亲证）；② **http/ui worker 实收 env：有**——`applyLiveE2ECapabilityEnv` 钉 `MODEL_ENDPOINT_PROFILE='dashscope-cn-beijing'`（run-e2e.mjs:65 / run-e2e-ui.mjs:69 wiring 亲证·Key-present 条件钉）+`MODEL_NAME` 走 text-endpoint-config.ts:67 缺省 `qwen-plus`——对一致（构造期过）；③ **代码缺省**：text-endpoint-config.ts:77 `MODEL_ENDPOINT_PROFILE?.trim() || 'deepseek-cn-public'` × :67 `MODEL_NAME?.trim() || 'qwen-plus'`——perf worker 零供给时唯一可达值=该缺省对。**差集={MODEL_ENDPOINT_PROFILE}（②供①缺）→ perf worker 唯一可达对=deepseek-cn-public × qwen-plus**。
- **服务供给三模态无差**：shell env / .env 回灌 / runner 缺省三模态在本环境对 `MODEL_ENDPOINT_PROFILE` 的供给无差（①三源全零·逐一亲证如上）→ 代码缺省对必达。
- **归因**：model-client.ts:680-682 构造期前缀合同（`deepseek-cn-public` 要求 `deepseek-` 前缀·`dashscope-cn-beijing` 要求 `qwen` 前缀·不合即构造期 fail-closed throw）× 缺省对（deepseek-cn-public × qwen-plus）=前缀错配→worker bootstrap（TS 源码实值 main.ts:531 `defaultModelClient` 调用·诊断堆栈 `main.ts:540:19` 系 transpile 后运行时行号·TS 源码 :540=`rawEmbedder` 行→`endpoint`→`openAICompatibleClient`）构造期 throw→`worker_exited_before_test`。**定性：ISO-DOTENV 主题真阳性**——.env 回灌关闭（本刀修法·语义正确面）暴露 baseEnv 缺键；本环境（无 .env 无 shell MODEL*）预修复同境同红（窗2 即证·非 P3 re-pin 差分诱因·P3 系行号 re-pin 纯登记面）；**不需 Key**（profile/model 非凭据·构造期校验先于 Key 挂载语义·no-Key 合同零触·g6 :104-109 禁 Key 门未撞）。

## §1 修法（已随起草落卷·逐字·⛔EXEC 期不得更改）

`scripts/run-performance-e2e.mjs` 单文件·净 3 insertions / 1 deletion（numstat 亲测）·base blob `28ef896a`→`037ab2d9`·130→132 内容行·零产品码触面：

```diff
@@ -24 +24,3 @@
-if (existsSync(ROOT + '.env')) {
+// ISO-DOTENV-ISOLATION:isolated 形(E2E_ISOLATED=1)一律跳仓根 .env 回灌——主仓 .env 在场时其环境语义键(APP_RUNTIME_DB_EXPECTED_ROLE/NODE_ENV/PORT 类)穿透隔离删单(:32-42 只删云凭据)漏入 api/worker 子进程=伪红源(G7K 诊断席环境发现);包装器 baseEnv 已供隔离全套 env,隔离形零回灌需求。
+// 本 runner 无 E2E_SKIP_DOTENV 钩(先形恒回灌):守卫语义按本文件实构取先例唯一翻转格(isolated→skip)最小移植——非 isolated 形行为零变(恒回灌先形保持)。
+if (env.E2E_ISOLATED !== '1' && existsSync(ROOT + '.env')) {
```

- 首行注释系 `run-e2e.mjs:20` 先例形的同文移植；其中删单行号引用按本文件修改后实值适配（起草期 `(:32-42 只删云凭据)`·2026-11-05 EXEC dual r3 后 runner :28 注释同步适配为 `(:36-46 只删云凭据)`·先例文本 `(:28-34)` 系 run-e2e.mjs 写时快照·出货 r2 终树隔离段实值 :36-46·沿 UI 卷 §1 同一适配纪律·上行 diff 引块系起草期快照原文零字节保留）。
- 次行注释系本刀实构适配声明（无 SKIP 钩→单判移植·非 isolated 零变）——**新增注释非自由发挥面**：系「同文移植不可达时按实构定形」的派单授权条款落笔（§0.2-1）。
- **守恒断言**：base :11-23 env 默认键七行零字节（AUTH_SECRET/PAY_PROVIDER_SECRET/RESUME_ENC_KEY/RESUME_HASH_SECRET/RAG_JOB_ROUTE_INPUT_HASH_KEY/RL_SIGNUP_IP 默认值面零触·终树 :11-27 含 r2 扩展 MODEL 对两键）；:36-46 删单段/:47 隔离 throw/:48 fake flags/:49-53 假旗扫描零字节（行号=出货 r2 终树实值·2026-11-05 EXEC dual r3 后 re-pin 逐行亲证·r1 期值 :32-42/:43/:44/:45-49 系 r2 扩展 +4 下移前实值）；:99 banner/:101-102 spawn 面/:103 databaseReady 门/:107-108 boot exit 门/:112-115 readyz 环零字节（同终树实值 re-pin·base 期值 :92 起 spawn 面/:97 databaseReady/:101-110 boot 门）；`assertNoFakeServiceFlags` import/call 恒在（static-guards :49-50 合同）；runner 词面**零** `live_provider_key_missing`（g6 :106-107 合同）·零 `MODEL_API_KEY` 词面（g6 :104 合同）；「无外部模型」立场注释（:2）零字节（g6 :104 正则合同）；新增注释零敏感词（token/Authorization/secret 字面值·secret-redaction 判据形）。
- **行为语义登记（非偏离·本刀明示语义）**：①真值表两态·唯一翻转格 isolated→skip（§0.2-2）；②包装器入 isolated 形零回灌=主仓 .env 泄漏向量对 `performance:e2e:isolated` 闭合；③直跑 `pnpm performance:e2e`（非 isolated）回灌面零变；④run-e2e.mjs/run-e2e-ui.mjs/capture-screenshots.mjs 零触（先行两刀面+登记面零字节）。

### §1-rev r2 修法扩展（2026-11-05·B 臂红停处置·诊断归因后·协调方 rev 派单授权·依据=§0.3·原 §1 修法 diff 块零字节改写 append-only）

`scripts/run-performance-e2e.mjs` env 默认区（base blob :11-23 对象内 RL_SIGNUP_IP 行后·出货 r2 终树 :11-27）增两缺省键·与 http/ui `applyLiveE2ECapabilityEnv` 钉值同对（dashscope-cn-beijing × qwen-plus）·仅缺省供给不覆盖已设值·构造期一致性——本扩展块纯 additive +4/−0（blob `037ab2d9`→`436a0da35`·132→136 内容行·全文件对 base blob `28ef896a` numstat **+7/−1**=原起草 +3/−1 保持+本扩展 +4/−0）：

```diff
@@ -20,6 +20,10 @@ const env = {（修后实值 hunk·git diff 亲录）
   RL_SIGNUP_IP: process.env.RL_SIGNUP_IP ?? '64,0.05',
+  // ISO-DOTENV-PERF:isolated 形 worker boot model-profile 一致对(构造期一致性·与 http/ui applyLiveE2ECapabilityEnv 钉值同对 dashscope-cn-beijing×qwen-plus;缺省对 deepseek-cn-public×qwen-plus 前缀错配→worker 构造期 fail-closed text_endpoint_profile_model_mismatch)。
+  // 两键仅缺省供给不覆盖已设值;profile/model 非凭据,no-Key 合同零触;g6 :106-107 词面禁加项仍零触。
+  MODEL_ENDPOINT_PROFILE: process.env.MODEL_ENDPOINT_PROFILE ?? 'dashscope-cn-beijing',
+  MODEL_NAME: process.env.MODEL_NAME ?? 'qwen-plus',
 };
```

- **扩展行为语义登记（非偏离·本扩展明示语义）**：①isolated 形 api/worker 子进程 env 实收一致对（删单段 :32-42 零触——`MODEL_*` 非云凭据键不在删单清单）·构造期过前缀合同（in-process 探针亲证：零供给缺省对→throw `text_endpoint_profile_model_mismatch` 复现死因 / 缺省一致对零 Key 构造 OK / 显式错配对仍构造期 fail-closed 强度不减）；②显式设值语义保持（`??` 仅缺省供给·显式 `deepseek-*`×deepseek 档照常可构造）·病态自举形登记一句：shell 无 E2E_ISOLATED 而 .env 自举 E2E_ISOLATED=1（§0.2-2 形）且 .env 携 MODEL* 时，env 默认区在回灌前先行构造使 MODEL_ENDPOINT_PROFILE/MODEL_NAME 恒已设→回灌 `!env[m[1]]` 不覆盖已设→.env MODEL* 不载（回灌面被缺省对遮蔽·缺省对与 http/ui 钉值同对构造期一致性不破·shell 显式供给仍最优先）；③非 isolated 形行为零变（隔离 throw 终树 :47 先于 spawn·r1 期锚 :43·r2 扩展 +4 下移·env 默认区新增不可达 spawn 面）；④no-Key 合同零触（profile/model 非凭据·g6 :104-109 复跑亲证·词面禁加项仍零触）。

## §2 验收断言预算（三臂+门矩阵·**数字口径以实跑实测为准+偏差熔断**·命令原样可复制）


- **A 臂（改前基线红·本席哨兵对照对操作级复证在卷 §0-10）**：修复前同宿主形态（isolated·哨兵 .env 在场）→旧码 `fake_service_mode_forbidden` ×2·spawn banner 0（哨兵穿透=伪红机制源证·/tmp fixture 副本·仓树零触）。
- **B 臂（主断言·EXEC 期亲跑·docker 隔离栈·bounded 观测窗）**：修复后 worktree（仓根 `.env` **ABSENT** 形——本刀语义下 isolated 形零回灌需求·哨兵/真实 .env 均零需求）+零 shell Key+零哨兵·`pnpm performance:e2e:isolated`：断言 **`worker_exited_before_test` 0 次**+**`api_exited_before_test` 0 次**+runner 越 `:99` banner/`:103` databaseReady 门/`:107-108` boot exit 门/`:112-115` readyz 40×1s 环推进至 perf client spawn 段（:117）=隔离 boot 健康正面观测达成（行号=出货 r2 终树实值·2026-11-05 EXEC dual r3 后 re-pin·原锚 `:101`/`:106-110` 系 base 期值如实改锚）；本席有界杀窗截断（外呼面零·performance.e2e.ts 纯 API burst 无模型·RL_SIGNUP_IP 默认放宽值自足）·**不强求全量绿**（杀窗截断预期 code 面如实登记·沿 UI 卷 §2 B 臂「或」判据先例形）。
- **B 臂增补验收行（rev r2·模型 profile 对供给）**：worker 子进程 env 实收 model-profile 一致对（`MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` × `MODEL_NAME=qwen-plus` 缺省供给·与 http/ui `applyLiveE2ECapabilityEnv` 钉值同对·§1-rev r2）——worker boot 构造期 `text_endpoint_profile_model_mismatch` **0 命中**（诊断前该码=B 臂红死因·§0.3）；**B 臂主判据不变**：`worker_exited_before_test`=0 次+`api_exited_before_test`=0 次照旧。
- **C 臂（回灌阻断门证据·本席亲跑在卷 §0-10+EXEC 期可复跑）**：isolated+哨兵 .env 同态→修法副本 `fake_service_mode_forbidden` **0 命中**+spawn banner **在场**（哨兵不载=回灌阻断直证）对旧码穿透臂×2——**结构性适配**：任务书钉的 `live_provider_key_missing` 在 perf runner 不可达（g6 :104-109 合同禁 Key 门·§0.2-3）·C 臂码面按实构定为哨兵不载 observable·已入偏离清单（§9-①）。
- **门矩阵**（起草已跑七件+EXEC 期补跑三件）：

| # | 门 | 期望 | 实测（起草 turn 亲跑） | 结论 |
|---|---|---|---|---|
| 0a | docs:check **改前基线** | EXIT=0 | EXIT=0·scanned **2480**=cap 2480 恰等零余量 | 绿 |
| 0b | PTP proof **改前基线** | 12/12 | EXIT=0 `selected=12/12` | 绿 |
| 0c | static-guards **改前基线** | EXIT=0 | EXIT=0 runners=6 helpers=21 flags=9 aiPaths=6 | 绿 |
| 0d | g6-e2e-iso-blocked **改前基线** | EXIT=0 | EXIT=0 | 绿 |
| 1 | static-guards **改后** | EXIT=0·四值恰等 | EXIT=0 runners=6 helpers=21 flags=9 aiPaths=6 | 绿恰等 |
| 2 | g6-e2e-iso-blocked **改后**（runner 形制行为门零回归） | EXIT=0 | EXIT=0（performance no-Key 门/三 LIVE 目标/包装器 wiring 断言全绿） | 绿 |
| 3 | 非 isolated 直跑臂（修后树·`.env` ABSENT 形） | EXIT=1+`performance_e2e_isolation_required` | EXIT=1·`E2E_FAILURE class=capability code=performance_e2e_isolation_required`（零 spawn 秒级早退·隔离要求语义零变） | 绿恰等 |
| 4 | `node --check` 修后 runner | PARSE-OK | PARSE-OK（两 policy 脚本同跑 PARSE-OK） | 绿 |
| 5 | docs:check **落卷后** | EXIT=0·scanned=cap 2481 恰等 | 见 §9 落卷读数 | 待落卷实测 |
| 6 | PTP proof **落卷后** | 12/12 | 见 §9 落卷读数（cap 联动后已预验 12/12） | 待落卷实测 |
| 7 | markers 五类 **落卷后** | 改动集零命中 | 见 §9 落卷读数 | 待落卷实测 |
| 8 | B 臂 isolated boot（EXEC 期·docker） | 双 0 次 exit 门+越门推进 | EXEC 期亲跑收据留痕 | EXEC 待跑 |

## §3 cap 预登（CAP-SANCTION-2481 恰等步进·随届值如实采）

- 届值亲证：起草前 worktree `node scripts/ai-docs/check-docs.mjs` **EXIT=0 scanned 2480 = cap 2480 恰等零余量**（本席亲跑·`MAX_FILES = 2_480` 行亲证 @origin/main `09fe2a23d`）。
- 本卷 REQUEST 受管 1 件 → 2481 必超 → 沿协调方派单 §4「基=origin/main 届 cap +1·CAP-SANCTION-<n+1> 注记沿链式」+ 常设预授权先例形随令行使 +1 恰等零多放：**cap 2480→2481（CAP-SANCTION-2481）**。
- 四联动点已随卷恰等改（两 policy 脚本）：`policy.mjs` `MAX_FILES 2_481` + 链区注记；`proof.mjs` loop `i < 2_481` / atCap `scannedFiles 2_481` / overCap `f-2481.md` / `FILE_LIMIT:2482` + 链区注记（越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。PTP 12/12 联动后预验绿。
- 在飞如实列（§0 末条亲测）：**g7w-draft `86af8b34` 承 2_481**（同触两 policy·dual-keep 先例形）/**idu-draft `0aac6a4c`（ISO-DOTENV-UI）承 2_480**（同前）/**r2-draft `185b0b39` 承 2_481**（同前）——g7w/r2 承值与本卷预登同值 2481·并线 union 沿常设预授权「届时取大重算承登」·idu 并线则 union 2482 届时重算。
- EXEC 期=既有 runner 单文件零新受管文件（修法已随起草落卷·真跑收据 .log ∉TEXT_EXTENSIONS 不计）→ EXEC terminal **2481 零新增**。

## §5 Ban

- Ban self-approve · alone≠dual（pre-exec 双审两独立外席待派）· Dual PASS ≠ 开工。
- Ban 触产品码（本刀修法面=scripts runner 基建面唯一）· Ban 改 `run-e2e.mjs`/`run-e2e-ui.mjs` 既有先例形与已修形 · Ban 改 perf runner 立场注释「无外部模型」与 g6 no-Key 合同面（:104-109）· Ban 给 perf runner 加任何 Key 门/词面。
- Ban push · Ban merge 主线 · Ban force push · 一切改动只交付本工作树（主仓零 mutation·worktree add 除外）。
- Ban 超出 §3 预登值（2481）自升 cap（cap sanction 权归协调方·并线期 union 越限沿常设预授权届时重算承登·非本席越权）。
- Ban 洗史录（两 policy 注记栈 append-only·既有注记零字节改写）· Ban 假绿绕过与测试门弱化 · Ban 读/打印 .env 值（本刀全程 name-only·哨兵系哑值非真实凭证·零真实 Key 值触面）· Ban 造/复制/删仓树任何形态 `.env`（哨兵仅限 /tmp fixture 副本·已清场）。
- Ban 重跑冲销（门矩阵任一门红不重跑冲销·如实登记升级）· Ban 就地归因邻面新红（Ban 借机修）· Ban 触其他工作树。

## §8 停手

**STOP · `executed:awaiting_post_prove_dual` · 2026-11-05 EXEC 行使落卷即停 · post-prove 双审两独立外席待派 · 开工三条款已兑现（①dual r3 BOTH PASS 落卷 ②协调方明示 EXEC 授权 ③立项对届时 tip `8fa7c7736` 全量重 pin·锚漂如实改锚·结论不变只更行号）· Ban self-approve · alone≠dual。** 停止条件四类（命中即停手上报·Ban 就地处置）：
- **file:line 不符**：亲证阶段全锚吻合·唯两处如实登记（派单 refill 锚 :23-29→实值 :24-29·机制判定不受影响§0-1；C 臂码面结构性适配§0.2-3）——EXEC 期再遇锚漂 → 停手上报。
- **机制不满足**：EXEC 期复跑 B 臂若现 `worker_exited_before_test`/`api_exited_before_test` 任一 → 红停上报（Ban 改判据凑绿）；哨兵对照对任一臂码面翻转 → 红停。
- **验收红且口径内修不了**：docs:check 超 §3 届值且协调方未裁 → 红停；PTP proof 红 → 红停；markers 净增行非零 → 红停；g6/static-guards 改后红 → 红停。
- **越界**：需触产品码 / 别的仓 / 主仓 mutation（worktree add 除外）/ 超出 §1 修法面的改动才能继续 → 停手记录现场证据上报。

## §9 落卷记录（2026-11-05 起草席）

- **落卷内容**（本 commit tracked 面恰 4 文件）：① `scripts/run-performance-e2e.mjs`（§1 修法·唯一码面·base blob `28ef896a`→`037ab2d9`·+3/−1）② 本卷 `ai-docs/delivery/harness/perf-iso-dotenv-REQUEST.md` ③ `scripts/ai-docs/public-text-policy.mjs`（§3 cap+链注）④ `scripts/ai-docs/public-text-policy.proof.mjs`（§3 四联动点+链注）。
- **三门读数（本席落卷前亲跑·树上终形 staged 后实测）**：门 1 docs:check **EXIT=0·scanned 2481 = cap 2481 恰等零余量**；门 2 PTP proof **12/12 EXIT=0**（`static_preflight_valid: selected=12/12; releaseEvidence=false`）；门 3 markers 五类标记词探针（i6-239 §2-7 运行时组装口径·四词 join 形+行首冲突标记对·**词面防自指不入卷**）对本 commit 改动集 4 文件 **0 命中**（首跑红系本卷 §9 本行曾直写四词词面触发自匹配——按「词面防自指」纪律改写去词面后复跑 0 命中·如实登记非掩盖）。
- **改前基线七件亲跑在卷**（§2 门矩阵 0a-0d+1-4 行）：docs 2480 恰等/PTP 12/12/static-guards 6-21-9-6/g6 EXIT=0/哨兵对照对两臂/非 isolated 直跑臂/`node --check` PARSE-OK——全部绿。
- **偏离任务书清单（如实·三处）**：
  1. **C 臂码面结构性适配**：任务书 §2 钉「C 臂回灌阻断=`live_provider_key_missing`」→ perf runner 素无该门且 g6 `:104-109` 行为合同明文禁加（Key-unset 快速失败=ui/iso 两 runner 专属·perf 走 no-model 立场）→ C 臂 observable 按实构定=哨兵不载（`fake_service_mode_forbidden` 0 命中+spawn banner 在场）对旧码穿透臂——回灌阻断的证明强度不减（操作级对照对·§0-10）。派单「若结构异于先例按实际结构定」条款授权面内·非自由发挥。
  2. **refill 锚行号**：派单锚「:23-29」→实际回灌 if-行 **:24-29**（:23=env 对象收尾 `};`）——语义判定不受影响·照实改锚。
  3. **B 臂 draft 期不跑**：B 臂需 docker 隔离栈（长驻服务面）——起草席 est live=0 纪律下留 EXEC 期 bounded 观测窗执行·draft 期以哨兵对照对+非 isolated 直跑臂+g6 行为门三件零 docker 证据承载机制面。
- **est live=0**：起草 turn 零模型外呼零 Key 加载（哨兵哑值占位非真实凭证）零生产操作零 secrets 零 docker 栈·哨兵探针秒级-有界 fail-closed 已清场。
- **rev r2 落卷注记（2026-11-05 rev r2 席·B 臂红停处置·诊断归因后修法扩展·协调方 rev 派单授权）**：
  - **修法扩展**：`scripts/run-performance-e2e.mjs` env 默认区 +4/−0（`MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` 缺省一致对 dashscope-cn-beijing × qwen-plus·与 http/ui `applyLiveE2ECapabilityEnv` 钉值同对·仅缺省供给不覆盖已设值·blob `037ab2d9`→`436a0da35`·全文件对 base `28ef896a` numstat **+7/−1**=原起草 +3/−1 保持+本扩展纯 additive·原 §1 修法 diff 块零字节改写）·归因依据=§0.3（诊断收据四件 `receipts/perf-iso-dotenv/` 随卷：b-arm-diagnostic1-verbose / b-arm-isolated-boot-window / -window2 / non-isolated-arm）·in-process 构造期探针四例亲证（零供给缺省对 throw 复现死因/缺省一致对零 Key 构造 OK/显式对保持/显式错配仍 fail-closed·零网络零外呼零 Key 值触·探针 /tmp 临时件已清场）。
  - **三门复跑（本席亲跑·树上终形）**：docs:check **EXIT=0·scanned 2485 = 本支 cap 现值（MAX_FILES=2_485·CAP-SANCTION-2485 EXEC 并线承值）恰等零余量**（rev r2 零新增受管件：runner/REQUEST 既有件 in-place additive+收据 .log ∉TEXT_EXTENSIONS 不计）；PTP proof **12/12 EXIT=0**；markers 五类标记词探针（i6-239 §2-7 运行时组装口径·四词 join 形+行首冲突标记对·词面防自指不入卷）对本 commit（rev r2 落卷 commit）改动集（runner+REQUEST+收据 .log 四件·共 6 件同扫·两 policy 系起草 commit 面非本 commit diff·原句「runner+REQUEST+两 policy+收据 .log」系 8 件超集口径·2026-11-05 EXEC P3-2 如实修正）**0 命中**。
  - **门复跑辅助**：g6-e2e-iso-blocked **EXIT=0**（no-Key 合同零回归亲证·performance no-Key 门/三 LIVE 目标/包装器 wiring 断言全绿）；static-guards **EXIT=0**（runners=6 helpers=21 flags=9 aiPaths=6 恰等）；`node --check` 修后 runner **PARSE-OK**。
  - **状态保持 `draft:awaiting_pre_exec_dual`**（待 dual r3 复审 rev r2 扩展面·B 臂 docker 隔离栈复跑+「model-profile 对供给」验收行行使归 EXEC 边界·本席零长驻服务零 E2E 场景亲跑·est live=0 沿承）。

### §9-EXEC 落卷注记（2026-11-05 EXEC 席·pre-exec dual r3 BOTH PASS+协调方 EXEC 行使授权后重行使）

- **双席 P2/P3 修订 EXEC 期消化（沿 dual r3 重 pin 条款·取并集）**：席1 P2-1 §0.3 `main.ts` 锚改源码实值 `:531`+transpile 标注（诊断堆栈 `main.ts:540:19` 系 transpile 运行时行·TS 源码 :540=`rawEmbedder` 行·本席 apps/worker/src/main.ts :531/:540 亲读）；席1 P2-2+席2 P3-1 §1-rev r2 标题措辞→「原 §1 修法 diff 块零字节改写」（§9-rev 同短语第二处同步适配）；席1 P2-3 §1-rev r2 头注补终树 :11-27+③ 补终树 :47（r1 期锚 :43·r2 扩展 +4 下移）；席2 P2-1 §1 守恒断言+§2 B 臂锚按出货 r2 终树改钉（:36-46/:47/:48/:49-53/:99/:101-102/:103/:107-108/:112-115 终树逐行亲证·base 期值如实注）+runner `:28` 注释同步适配 `(:32-42 只删云凭据)`→`(:36-46 只删云凭据)`（注释行号引用·代码零字节）；席2 P2-2 §1-rev r2 ② 增补病态自举形（shell 无 E2E_ISOLATED+.env 自举携 MODEL*）回灌面被缺省对遮蔽语义登记一句；席2 P3-2 §9-rev markers 句文件超集口径如实修正（原句 8 件超集→实际 6 件=runner+REQUEST+收据 .log 四件·两 policy 系起草 commit 面）。
- **B 臂 bounded 观测窗重行使（恰 1 窗·rev r2 供给对在位·无重跑）**：`node scripts/run-e2e-isolated.mjs performance:e2e`（=pnpm performance:e2e:isolated 同形·E2E_ISOLATED=1 包装器注入）·docker 隔离栈 boot 健康（E2E_POSTGRES_READY boot consecutive=3 attempt=4+migrate applied=222 skipped=0）→ runner `:99` banner 在场→`worker_exited_before_test` **0 次**+`api_exited_before_test` **0 次**（双 0 门）→`text_endpoint_profile_model_mismatch` **0 命中**（model-profile 缺省一致对构造期过·rev r2「model-profile 对供给」验收行达成）→越 `:103` databaseReady 门/`:107-108` boot exit 门/`:112-115` readyz 环推进至 perf client spawn 段→窗内自然跑毕**全量绿**（`✓ performance E2E passed`·livez 256/256·commerce_products 128/128·signup 24/24·resume_ingest 8/8 无 5xx）·wrapper EXIT=0·观测强于杀窗截断下限（不强求全量绿条款下自然达成）·收据 `receipts/perf-iso-dotenv/b-arm-exec-window-2026-11-05.log` 随卷（.log ∉TEXT_EXTENSIONS 不计 cap）·容器/进程零残留亲证。
- **非 isolated 臂复验**：`node scripts/run-performance-e2e.mjs`（shell 无 E2E_ISOLATED）→ EXIT=1 `E2E_FAILURE class=capability code=performance_e2e_isolation_required`（:47 秒级零 spawn）零变·收据 `receipts/perf-iso-dotenv/non-isolated-arm-exec-2026-11-05.log` 随卷。
- **三门+辅助门复跑（本席亲跑·树上终形）**：docs:check **EXIT=0 scanned 2485 = cap 2485（MAX_FILES=2_485）恰等零余量**（EXEC 期零新增受管件：REQUEST/runner 既有件 in-place·收据 .log ∉TEXT_EXTENSIONS 不计）；PTP proof **12/12 EXIT=0**（`static_preflight_valid: selected=12/12; releaseEvidence=false`）；markers 五类标记词探针（i6-239 §2-7 运行时组装口径·四词 join 形+行首冲突标记对·词面防自指不入卷）改动集 4 件（REQUEST+runner+两收据 .log）**0 命中**；`node --check` 修后 runner **PARSE-OK**；g6-e2e-iso-blocked **EXIT=0**（no-Key 合同零回归·performance no-Key 门/三 LIVE 目标/包装器 wiring 断言全绿·词面禁加项零触）。
- **状态转轨**：四处 live 状态 pin（Status 头/§8 STOP/文末 STOP/卷尾摘要）`draft:awaiting_pre_exec_dual`→**`executed:awaiting_post_prove_dual`**；上方 rev r2 席「状态保持」行系史录 byte 级保留（沿 mop02 lifecycle 史录保留先例形）；待 post-prove 双审两独立外席·nail/批表/行翻面权归协调方。
- **est live=0**：B 臂 docker 隔离栈系本地 test infra（isolated PG 非外呼·容器用毕即清）；performance.e2e.ts 纯 API burst 无模型零外部模型 IO 零 Key 加载（profile/model 非凭据·no-Key 合同零触）；零生产操作零 secrets 触面。
- **CI 修复登记（2026-11-05 nail 完成席·协调方 ISO-DOTENV-PERF nail 派单令·登记源=CI verify 红 PR #208）**：CI verify 红定谳 `provider_egress_inventory_invalid: environment_reference_unregistered:MODEL_ENDPOINT_PROFILE:scripts/run-performance-e2e.mjs`（rev r2 env 默认区 `:25` MODEL_ENDPOINT_PROFILE 缺省键未在出站合同 manifest 登记·该 env 全仓登记 17 处唯缺本 runner·`MODEL_NAME` 不在 policy environmentNames 受扫名单不触发）→ `ai-docs/architecture/ai/provider-egress-inventory.json` **additive +5/−0** 增登记 `MODEL_ENDPOINT_PROFILE @ scripts/run-performance-e2e.mjs` class=`live-test-launcher`（照既有 runner 条目同形·run-e2e/run-e2e-ui/run-post-change-regression 家族同 class·语义如实=env 默认区**无条件缺省供给**一致对 dashscope-cn-beijing×qwen-plus·非 Key-present 条件钉·profile/model 非凭据 no-Key 合同零触）· **runner 代码零触**（封卷保持·rev r2 blob `436a0da35` 零字节）· provider-egress 校验复跑 **EXIT=0**（adapters=5·operations=10·environment_references=401=400+1 additive）· 零新增受管件 cap 不变·三门复跑全绿 docs EXIT=0 scanned 2486=cap 2486 恰等/PTP 12/12 EXIT=0/markers 改动集（manifest+REQUEST 两件）五类标记词+行首冲突标记 0 命中。

**STOP · `executed:awaiting_post_prove_dual` · 2026-11-05 EXEC 行使落卷 · post-prove 双审两独立外席待派 · nail/批表/行翻面权归协调方 · alone≠dual · ⛔push⛔merge 主线⛔force push**

---

*ISO-DOTENV-PERF REQUEST · 2026-11-05 起草落卷 · **`executed:awaiting_post_prove_dual`（2026-11-05 EXEC 行使落卷·post-prove 双审待派）** · base `origin/main` @`09fe2a23d`（=PR #199 fin-draft merge·fetch 后 rev-parse 亲证）· 分支 `line/perf-draft` · 工作树 `meetwise-perf`（本起草席 `git worktree add` 亲立·主仓零其他 mutation·建前 worktree 列表零同名）· 立项出处=协调方派单 brief（ISO-DOTENV-UI 承登后继刀·performance 腿第三 runner·沿 `iso-dotenv-ui-REQUEST.md` 同构）· 现状固化=`run-performance-e2e.mjs` base blob `28ef896a` 130 行·:24-29 回灌区无任何守卫（恒回灌先形·派单锚 :23-29→实值 :24-29 照实改锚）+:30-42 删单段+:43 隔离 throw（ISOLATED 守卫位删单/throw 两处在场·唯回灌区缺失=ui 卷同形不对称根因）+**无 Key 门**（g6 :104-109 行为合同明文禁加=结构第一异）+runner 自起 api+worker 无 web 面（第二异）+**素无 E2E_SKIP_DOTENV 钩**（第三异）· 先例对照=run-e2e.mjs :20-22 双判全形（HTTP 线已并刀）+run-e2e-ui.mjs :27 已修形（meetwise-idu 树 ISO-DOTENV-UI 卷·先有 SKIP 钩加第二判形）· 修法=单文件净 +3/−1（守卫行增 `env.E2E_ISOLATED !== '1'` 判+两行注释·`28ef896a`→`037ab2d9`·真值表两态唯一翻转格 isolated→skip·非 isolated 零变·E2E_ISOLATED 自举病态形零变）· 哨兵对照对亲证（/tmp fixture·哑值哨兵·仓树零触已清场：旧码穿透 `fake_service_mode_forbidden` ×2 零 banner / 修法 `0` 命中 banner 在场 `database_not_ready` 有界收尾）· 三臂断言（A 穿透在卷 / B EXEC 期 docker bounded 隔离 boot 健康·双 0 次 exit 门 / C 哨兵不载回灌阻断——C 臂码面结构性适配偏离登记·`live_provider_key_missing` 在 perf 不可达 g6 合同禁加）· CAP-SANCTION-2481 恰等步进预登（2480→2481·四联动点 2_481/f-2481.md/:2482·在飞 idu 2_480/g7w 2_481/r2 2_481 三支两 policy 热面如实列·union 届时取大重算）· 三门本席亲跑 docs 2481=cap 恰等+PTP 12/12+markers 0/0（改前基线四门+改后四门全绿在卷）· 偏离三处如实登记（C 臂码面适配/refill 锚 :24 实值/B 臂 EXEC 期跑）· pins 十一值照抄零翻（haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false·gR45Closed=true·coveredCount=8·ms3EqualsR4Closed=false·PG-retained·公开 DELETE=503·g7SuiteGreen=false·r1Closed=false·actualSpendCny=null）· est live=0 · markers=0 · 停止条件四类全设 · ⛔push ⛔merge主线 ⛔force push · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
