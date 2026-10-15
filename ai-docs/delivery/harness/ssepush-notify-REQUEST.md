# SSEPUSH-NOTIFY REQUEST（sse-push:notify 2/35 恒红回归修复刀·0189 并线自然实验定谳·双臂异臂同根=降级日志捕获窗错位·docs-only+恰 1 proof seam 位移·落卷即停）

**Status**: **`closed`**（2026-10-15 卷主翻面·协调方授权批量滞后卷 Status 对账翻面·沿 ag37/ag-cost5/ha-6 状态行翻面先例·一行依据=checklist「Line ssepush-notify nail」段 :2733 已载 post 双审双 PASS+nail merge @`da65e0fb`（对 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0）——原 `executed:awaiting_post_prove_dual` 系滞后登记 · est live=0 · Ban self-approve · alone≠dual · ⛔push）
**席位**：ssepush-notify 回归修复刀起草席（协调方派单·诊断+起草·⛔push·⛔改产品码——本卷唯一预期码改=1 个测试文件的捕获窗 seam 位移·无任何 src/迁移/SSOT 触面）。
**基线**：`feat/mysql-schema-skeleton` @ `cf501273`（5C-API-HARDEN nail 收官 SSOT commit·链 189 头 0189·docs:check 2081≤cap 2088 起草席本树亲跑）· 分支 `line/ssepush-notify`（建前 `git branch --list` 恰 0 命中·本席 `git worktree add ../meetwise-spn -b line/ssepush-notify feat/mysql-schema-skeleton` 亲立·HEAD 落 `cf501273` 亲证）· 工作树 `meetwise-spn`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（2026-10-14·自然实验指涉：主线 `cf501273` 恒等 2/35 红而并线树 `04cd8298` 同门 35/35 绿·差异面收敛 0189）；②SSOT 记录 `e9bca574`（TOKSTREAM-S4b 并线预备 commit 题面：「门矩阵支线树 04cd8298 亲跑=sse-push:notify:prove 35/35 全绿」——绿臂权威读数在卷）；③SSOT 记录 `809cd46e`+`cf501273`（5C-API-HARDEN nail 收官·EXEC `f31d56d1`→修复 `c31fd11e`·NOINHERIT 仲裁+SD 四函数+两表零 GRANT·0189 全链在卷）；④起草席活体复现收据 `.tmp/isolated-proof-receipts/2026-10-14T17-25-09-211Z-95214-9cf2a9e1-42f5-43cf-bd0d-60e54a77c24f.json`（exitCode=1·durationMs=58444·target=sse-push:notify:prove:raw·§1.1 读数全源）；⑤结构范本 `ai-docs/delivery/harness/g7w-tail-death-REQUEST.md`（meetwise-g7w 树·§7/§8 形制沿承）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object/活体 run 实测 @`cf501273`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 24 树实测（主仓+23 并行树含本 meetwise-spn）——无第二 ssepush-notify 同名树；`git branch --list "line/ssepush-notify"` 恰 1 命中=本席分支。
- `ls ai-docs/delivery/harness/ | rg "ssepush|sse-push-notify"` 建前零命中→落卷后唯一同名卷=本卷。
- 本刀在飞相 stock 面：零——sse-push 修复 nail（`4dfaeb01`/`d3a2ba45`/`358f3dee`）已收官并线；API-HARDEN nail（`809cd46e`）已收官并线；本刀与其零交叠（§3）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`cf501273`·本分支 HEAD 代码区≡主线 cf501273）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/test/sse-push-notify.proof.ts` | `97e3561f`（526 行·**35 断言 rg 计数亲证**） | `:54` 静态 `import { boot } from './_neg-harness'`·`:59` `const h = await boot()`·**:66-75 活体 tap 块（degradedLogs+originalWarn 捕获+console.warn 覆写+`:73-75` triggerMissingLog 兜底返回 `{line:'MISSING', t:Date.now()}`）——本刀修法唯一位移对象**·`:195` warmup waitFor（旧树单例首触点）·**:201-206 P-2a 约束①（状态臂·现 PASS）+约束②（`:204-205` regex 臂·现 FAIL）**·`:228` Phase B 装 0143 真字节·**:240-244 P-2d 健康翻转（现 PASS）+约束②收据（`:242` windowMs=healthyAt−triggerMissingLog().t·`:244` `windowMs>0` 臂·现 FAIL）** |
| `apps/api/src/platform/sse-notify.service.ts` | `93904f20`（327 行） | **`:68-71` `onPrincipalEvict()` 首订阅者即 `getSseNotify().whenHealthy()`（0189 增）**·`:87` reason 枚举·`:127-128` 初态 `{healthy:false, reason:'listen_down'}`+lastLoggedReason=undefined·`:133` 生产日志缝=console.warn·`:145-149` whenHealthy→ensureStarted·`:198-213` ensureStarted（专用池 max:1·void establish）·**:258-271 degrade()（`:262` 同因去重 `wasHealthy‖lastLoggedReason!==reason` 才打·`:264-269` 行格式 `SSE_NOTIFY_DEGRADED reason=<r> fallback=legacy_2s_poll hint=…`）**·`:273-310` establish（`:284-286` 双 LISTEN·**:289-296 pg_trigger 实证 0 行→loseClient('trigger_missing')**）·`:313-319` 单例懒起 |
| `apps/api/src/platform/principal.guard.ts` | `50b38bc5`（112 行） | **`:35-38` 模块顶层 `onPrincipalEvict('uid',…)`+`getSseNotify().whenHealthy()`——`git blame` 亲证引入 commit=`f31d56d1`（0189 EXEC）·注释自证「注册即起 LISTEN(不等首个 SSE 流·吊销广播从进程启动即有效)」=0189 吊销广播 sanctioned 行为** |
| `apps/api/test/_neg-harness.ts` | `b03cb16b`（305 行） | `:7` 静态 `import { createApp } from '../src/main'`（ESM 模块图入口）·`:59-63` createApp·`:65` assertIsolatedTestTarget（隔离库属主连接·非 app_role/app_gateway_role）·**:72-73 装载 sql/01_schema 等 22 卷自 DROP 重置→0143 trigger 不在场**·`:258` app.listen |
| `packages/db/migrations/0189_api_harden_shared_state.sql` | `a291b62e`（163 行） | `:47` 两表零 GRANT 注释（platform_rl_bucket+platform_slot_lease）·`:49-142` SD 四函数 gateway_rl_bucket_take/gateway_slot_lease_acquire/gateway_slot_lease_release/gateway_rl_bucket_cleanup（`:139-142` EXECUTE 仅授 app_gateway_role）·`:160` user_account 触发器 platform_principal_state_notify——**interview/interview_event/0143/LISTEN 实质触面零触碰（rev2 rg 亲证更正：全文命中恰 4 行且全为叙事注释——`:16` 0143 同形·`:17` interview_event_ch 通道名·`:18` LISTEN 措辞·`:144` 0143 同形；DDL 零触及）** |
| `packages/db/migrations/0143_sse_push_notify.sql` | `4d4bf7c4`（37 行） | `sse_event_notify_after_insert()` SECURITY INVOKER+`interview_event` AFTER INSERT 触发器（proof Phase B 自装件） |
| `apps/api/test/api-harden-shared-state.proof.ts` | `157376c2`（320 行·**31 断言 rg 计数亲证**） | 0189 门 proof·本刀零触（§3-3） |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4` | §2-7 markers=0 五类标记词定义（词面运行时组装防自指·五类词不复抄卷内） |
| `package.json` | `22013d68`（664 行） | `:8` lint max 5200·`:180-181` sse-push:notify:prove 接线·`:345` migrate:prove·`:457` drift:prove·`:473` api-harden:prove·`:661` turbo |
| `apps/api/package.json` | 见树 | `:7` lint max 1421·`:72` prove:sse-push-notify raw 接线 |
| `scripts/run-e2e-isolated.mjs` | `70032509`（3122 行） | `:95` api-harden:prove 目标源集（含 sse-notify.service.ts+principal.guard.ts·**不含本 proof 文件**=本刀 proof 改动零扰动该门源集）·`:1212-1214` notify 目标源集（**含本 proof 文件**=改动会进 receipt sourceDigests·如实随收据） |

### 0.2 漂移登记（派单 brief/SSOT → `cf501273` 现状·**EXEC 重 pin 同协议**）

1. **简报假说漂移①（权限半假说·证伪）**：派单 brief 指涉「0189（NOINHERIT 权限模型·SD 四函数重写·零表 GRANT）断掉 notify 写路径权限」——**证伪**：0189 触面=两桶表+SD 四函数+user_account 触发器（§0.1 第五行）·interview/interview_event/0143/LISTEN 零交集；起草席活体 run 写路径全通（P-2a 真实 HTTP 2s 轮询 2041ms/P-1 INSERT→帧 36ms/P-5 独立 LISTEN 实收裸 stream_key/P-4 双 waiter 双醒·§1.1）；且 harness 池为隔离库属主连接（`_neg-harness.ts:65`）·NOINHERIT 仲裁面不在本证明路径。
2. **简报假说漂移②（日志半假说·方向对·机制修正）**：「断掉结构化日志依赖」——实况=结构化日志**照常发出且格式与 regex 期望逐字相符**（活体 stdout 证据 §1.1-3·目击+机制推演）·红因=发出时机先于 proof 的 console.warn tap 安装（§1.3 时序链）·非依赖断非格式漂移。
3. **迁移号漂移**：brief「主线链顶 189 顺延占位 0190·若 5B nail 落 0190-0199 改 0202+」——现状：主线链顶实存 max=**0189**（`ls packages/db/migrations | tail` 亲证）·并行波 `line/batch5b-mig` 树已实占至 **0199**（meetwise-b5m 树 ls 亲证·未并线）·**本刀预期零迁移**（§0.3）。
4. **lint 基线口径**：主线 SSOT 权威值（cf501273 5C nail 卷亲跑在卷）=root 5210>5200+api 1431>1421 双红承登；tokstream 树 `e9bca574` 记 root 5223>5213 系 834e830e 支线自带 +13 面·未并主线·**非主线口径**。本刀 EXEC 亲跑实测为准·恒等判定见 §2-6。

### 0.3 迁移号登记与协调规则（预期零·实证后定）

- **主线链顶实存 max=0189**（恰 189 个 .sql 亲数·`ls | tail` 实证）；已占号：0188=ag11/0189=api_harden（已并线）；**0190-0199=line/batch5b-mig 并行树已实占（未并线）**。
- **本刀预期零迁移**（修法=proof 捕获窗 seam 位移·零产品码零迁移零新表）。**协调规则**：若 EXEC 期复判推翻本卷 §1.3 根因、确需迁移→认领号=**EXEC 立项日按届时主线链顶顺延实测**（起草时点实测 max=0189→顺延 0190 起；**若 5B nail 波已并线实占 0190-0199→改 0202 起**）·零硬编码本卷号·Ban 抢号 Ban 私占（沿 AG39 改占勘误/cost3「EXEC 立项日按主线链顶顺延登记」先例）。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 红形（起草席活体复现 @`cf501273`·meetwise-spn 树·2026-10-14）

1. **读数**：CMD `pnpm sse-push:notify:prove`（经 run-e2e-isolated 隔离 PG 容器 meetwise-e2e-95214-1791998650765）→ **`✗ sse-push:notify: 2/35 失败` EXIT=1**·恰双臂红：
   - 臂①＝proof `:204-205` **P-2a 约束②结构化降级日志**——`PIN OPT1-C2-LIVE-DEGRADED-LOG MISSING`（活体 tap 未捕获任何 `reason=trigger_missing` 线）；
   - 臂②＝proof `:244` **P-2d 约束②收据**——`PIN OPT1-C2-DEGRADED-WINDOW reason=trigger_missing window_ms=0`（MISSING 兜底 t=调用当下→窗口塌 0·`windowMs>0` 假）。
2. **其余 33 臂全 PASS**：含 P-2a 约束①状态臂（`:201-202` reason=trigger_missing 在位=状态机正确抵达降级态）·P-2a 退化轮询真实 HTTP 首 ping 2041ms∈[1800,3600]·P-2c/P-2d 全部单元臂（注入 log 缝·tap 无关）·P-1 真延迟 36ms·P-3/P-4/P-5。
3. **活体 stdout 时序证据（rev2 证据等级如实降格=起草席目击+机制推演：复现 run 全量 stdout 未入收据 JSON·无独立可复验原物；时序结论不变）·复现 run 原样所见**：`SSE_NOTIFY_DEGRADED reason=listen_down …` → `SSE_NOTIFY_DEGRADED reason=trigger_missing fallback=legacy_2s_poll hint=trigger_interview_event_sse_notify_absent_see_migration_0143` → `Server listening at http://127.0.0.1:…` → prove 横幅——**两条降级日志均先于 boot() 返回、更先于 proof:66-75 tap 安装**；且 trigger_missing 线与 `:205` regex `/^SSE_NOTIFY_DEGRADED reason=trigger_missing fallback=legacy_2s_poll hint=/` **逐字相符**=产品日志行为正确·仅捕获窗错位。

### 1.2 双臂归因（异臂同根·同一缺失捕获·两断言分别塌）

同根=**唯一的活体 `SSE_NOTIFY_DEGRADED reason=trigger_missing` 线发出于 tap 安装之前**。臂①塌于「未捕获→regex 对 MISSING 兜底串必假」；臂②塌于「未捕获→`:73-75` 兜底 `t=Date.now()`（调用当下）→`:242` window=healthyAt−当下≈0→`:244` `>0` 假」。两臂断言本体、阈值、regex 零缺陷。

### 1.3 时序机制链（逐环 file:line 亲证）

1. `f31d56d1`（0189 EXEC·HEAD 祖先 `merge-base --is-ancestor` 亲证）改 `principal.guard.ts`：模块顶层 `:37-38` 注册 evict 处理器+`getSseNotify().whenHealthy()`（0189 件⑤#129 吊销广播收播·sanctioned 行为本刀零翻案）。
2. `sse-notify.service.ts:68-71`：`onPrincipalEvict()` 首订阅者即 `whenHealthy()`→`:145-149`→`:198-213` ensureStarted（专用池 max:1）→`void establish()`。
3. **ESM 装载序**：proof `:54` 静态 import `_neg-harness`→`_neg-harness.ts:7` 静态 `import { createApp } from '../src/main'`→src 模块图评估期 principal.guard.ts 模块体执行——**先于 proof 体任何语句**（含 `:59` boot 与 `:66-75` tap）。
4. harness `:72-73` 于 boot() 窗内装载 `sql/01_schema.sql` 等 22 卷自 DROP 重置→0143 trigger 不在场→establish `:289-296` pg_trigger 实证 0 行→`loseClient('trigger_missing')`→`degrade()` `:264-269` 经 `:133` 生产缝 console.warn 打线——**落在 `await boot()`（proof:59）await 窗内·tap 未装**（活体 §1.1-3 时序亲证）。
5. `:262` 同因去重（`lastLoggedReason!==reason` 才打）→持续降级期**唯一一条** trigger_missing 线即 boot 期那条·永不重发→tap 后续永不捕获→**确定性恒红（非 flake）**。
6. Phase B（`:228` 装 0143 真字节）后备避重连 `:289-298` 实证 trigger 在场→healthy 翻转（P-2d 翻转臂 PASS）·但收据窗口源头（降级线 t）已不可得→臂②恒红。

### 1.4 并线树对照（自然实验闭合）

1. `04cd8298`（=834e830e×358f3dee·含 sse-push 修复 `4dfaeb01`·不含 0189）：SSOT `e9bca574` 题面载「门矩阵支线树 04cd8298 亲跑=sse-push:notify:prove 35/35 全绿」。
2. 码面（`git show 04cd8298:…` 亲证）：该树 principal.guard.ts **无 sse-notify import、无模块级懒起**；同树 sse-notify.service.ts **无 onPrincipalEvict 钩**→单例纯惰性·首触点=proof `:195` warmup waitFor（tap 之后）→降级线被 tap 捕获→双臂绿。
3. **`git diff 358f3dee cf501273 -- apps/api/test/sse-push-notify.proof.ts` = 0 行**（两树证明文件逐字节恒等亲证）→红绿分叉纯产品侧=0189 引入的模块级懒起 LISTEN·`358f3dee`/`f31d56d1`/`4dfaeb01` 全 HEAD 祖先亲证。

### 1.5 权限假说证伪登记（简报漂移①·§0.2-1）

0189 三触面（两桶表零 GRANT/SD 四函数/user_account 触发器）与 notify 写路径（interview_event INSERT→0143 触发器 pg_notify→LISTEN）**零交集**；活体写路径三面（INSERT 触发/LISTEN 收/HTTP 泵）全 PASS（§1.1-2）。**本刀 Ban 走迁移/GRANT/SD 扩权路径**（§3-2·证伪假说的修法路径零行使）。

### 1.6 边界面（零并入声明）

`RL_SHARED_DEGRADED reason=pg_error fallback=fail_open` 线（复现 run 活体所见·0189 限流共享态降级旁路·非断言臂）零归因零触碰；`api-harden:prove` 31 臂门独立在树（本刀门矩阵不回退项·非本刀归因面）；sse-slot/uc010/interview 兄弟 proof 零触。

## §1-修法（proof 捕获窗回归原意·预期零产品码零迁移·三件）

- **件① tap 块前移（唯一码改·`apps/api/test/sse-push-notify.proof.ts`）**：将 `:66-75` 活体 tap 块整体（degradedLogs 数组+originalWarn 捕获+console.warn 覆写+triggerMissingLog 函数——块自包含·零 `h` 引用）位移至 `:59` `const h = await boot();` **之前**——落点=紧随 `:58` 之后、`:59` `const h = await boot();` 之前（proof 体首个 top-level await 之前的同步先导段内·rev2 亲证更正：末行 import 实为 `:57`·`:58` 为 import 块后空行——锚位 `:58/:59` 之间唯一）；**任何不早于 `:59` 的落点（含 `:62` 横幅附近——该行实测在 boot 返回之后）禁止**；其余语句零改·**35 条断言首参文本+regex+阈值逐字冻结零 diff**（位移致行号平移·如实登记）。**不弱化论证**：捕获窗从「boot 返回后」恢复为约束②原意「进程起全窗」；断言集合/断言力/33 绿臂零扰动（tap=前缀过滤旁路记录·原样透传）。**落位注释（rev2 残余边界登记·G7_FREETIER_REPROVE 外泄面）**：`src/main.ts:30-37` 为全 src 唯一模块级 `await import`（`:31` 动态载 `@meetwise/ai-runtime/g7-test-support`·处于 `if (g7FreetierReproveEnabled)` 分支内·rg 计数亲证恰 1 处）——该 env 分支若被外泄置位，其效应发生于 ESM 模块图评估期（proof `:54`→`_neg-harness.ts:7`·先于 proof 体任何语句·含前移后 tap）；现隔离面三重=`_neg-harness.ts` 全卷零读写该 env（rg 亲证零命中·rev3 @6187e8e5 复证）+隔离 runner 仅 baseEnv 显式携带才透传（baseEnv=`...inheritedEnv` 展开 `run-e2e-isolated.mjs:2721-2722`·G7 ledger 附属分支 `:2734-2744`·rev3 并线后重 pin：原锚 `:2700`/`:2690-2697` 于 blob `70032509`→`f986c56b` 后漂移如实改）——**rev3 环境条件断言注记（席2 R4 落卷）：inheritedEnv 剥离清单（显式名单 `:2706-2717`+LANGFUSE_ 前缀 `:2718`）不含 G7_FREETIER_REPROVE**——该 env 一旦操作壳携带即原样穿透剥离面进 baseEnv/子进程·隔离不靠 runner 剥离承担·条件=「操作壳不携带+该 env 于 harness/proof 全卷零读写」双条成立·EXEC 判别 run 期如实核记实际携带状况；本 proof 目标 baseEnv 不携带；残余若兑现→件③ 结局族 (b)/(c) 兜底停。tap 前移不新增此面·仅登记。
- **件② 归因登记（docs·本卷 §1.2/§1.3/§1.5 承载）**：双臂异臂同根定谳候选+0189 权限假说证伪+产品行为面零翻案声明。
- **件③ 复绿判别 run（EXEC 期·预注册结局族）**：`pnpm sse-push:notify:prove` 恰 1 有效 attempt·预注册读数：`OPT1-C2-LIVE-DEGRADED-LOG`=真线非 MISSING·`OPT1-C2-DEGRADED-WINDOW window_ms`>0 且<60000·35/35 EXIT=0。结局族：**(a) 35/35 绿**=修法成立+归因闭合（行关闭效力归协调方·§8-⑤）；**(b) 双臂仍红**=§1.3 根因被证伪→**停止条件②回炉**（Ban 就地改因）；**(c) 他臂新红/表外形**→停·升级协调方；**(d) 隔离基建红**（isolated_postgres_database_not_ready 等未进 prove 进程·起草席亲历一例后次跑成功）→允许重启重试·attempts 全台账（基建红≠断言红·不适用恰 1 attempt 纪律）；prove 进程内断言红→恰 1 attempt·Ban 重跑冲销。

## §2 验收断言候选（EXEC 门矩阵·pre-exec 双审核对单基面·全过为绿）

1. **改动面窄断言**：EXEC diff（对立项基线）=恰 3 类——本卷 .md+proof .ts+收据目录；`rg -c "^\s*A\(" apps/api/test/sse-push-notify.proof.ts` pre==post=**35**·且 35 条断言首参文本逐字不变（EXEC 收据载 pre/post 两清单·diff=∅）·src//migrations 零文件入 diff。**rev3 机检行（席2 R1 落卷）**：tap 三绑定符 `rg -n 'const degradedLogs|const originalWarn|triggerMissingLog' apps/api/test/sse-push-notify.proof.ts` 逐行计数 pre==post=**5 行**·post 三绑定声明各恰 1（`const degradedLogs`/`const originalWarn`/`function triggerMissingLog`）+调用点恰 2（pre 实测 :203/:242·位移后随块平移）恒等——位移只许整块搬移·禁增删改任何绑定行。**rev3 首参提取命令钉死（席2 R2 落卷）**：`rg -No '^\s*A\(\x27(?:[^\x27]|\\\x27)*\x27|^\s*A\(\x60[^\x60]*\x60' apps/api/test/sse-push-notify.proof.ts | sed -E 's/^[0-9]+://'`（hex 转义双形态·单引号字面量 31+反引号模板 4 恰覆盖 35·EXEC 亲证与 raw 形态逐行恒等；**剥行号列后 pre/post 双清单 diff=∅**——tap 前移致断言行号整体平移·行号列不参 diff·剥列命令同钉）·pre 清单已落 `ai-docs/delivery/receipts/ssepush-notify/asserts-pre.txt`（基线 blob `97e3561f` 生成）。
2. **复绿门**：`pnpm sse-push:notify:prove` **35/35 EXIT=0**（件③ 结局族 (a)·双 PIN 读数在卷）。
3. **不回退门**：`pnpm api-harden:prove` EXIT=0（31 臂·0189 门零扰动）。
4. **迁移链门**：`pnpm migrate:prove` EXIT=0（链 189 头 0189）+`pnpm drift:prove` EXIT=0 零漂移+`node scripts/check-migration-version-uniqueness.mjs packages/db/migrations` files=189 violations=0。
5. **typecheck 门**：`pnpm turbo typecheck --force` EXIT=0（8/8 0 cached 口径·沿 sse-push nail 卷形制）。
6. **lint 承登口径**：`pnpm lint`（root max 5200）+`pnpm -C apps/api lint`（max 1421）亲跑实测——恒等既登基线 root **5210**/api **1431**（§0.2-4·本刀 proof 改动零新增 warning 为预期；漂移即如实登记归因·**Ban 借机修 lint**）。
7. **docs:check 门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（本卷 +1→2082≤cap 2088 预期·>2088 红即停上报）。
8. **markers 门**：改动集五类标记词零命中（i6-239-gates §2-7 同五类·词面不入卷防自匹配）。
9. **净树门**：`git status --porcelain` 非交付面零残留（tsbuildinfo 等·沿 nail 卷先例）。

## §3 范围外（边界清单·越界即 FAIL）

1. **零产品码**：`sse-notify.service.ts`/`principal.guard.ts`/`rate-limit.service.ts`/`auth-session.ts`/`sse-pump.ts`/0189 SQL/0143 SQL 及一切 src/·migrations/ 面零触——本刀码改面=恰 1 个 proof 文件内 tap 块位移。
2. **Ban 迁移/GRANT/SD 扩权路径**：§1.5 证伪假说的修法路径零行使（含「给 harness 角色补授权」「SD 函数扩面」类方向）。
3. **0189 行为面零翻案**：模块级懒起 LISTEN=0189 sanctioned（吊销广播从进程启动即有效）——本刀不改其语义·**亦否决产品侧替代修法**（如 `:38` 移 onApplicationBootstrap：日志仍在 boot() await 窗内先于 tap·§1.3-3/4 时序论证覆盖·修不了本红）——若协调方仍裁产品侧行使→另刀（§8-④）。
4. **兄弟 proof 零触**：api-harden-shared-state/sse-slot/uc010/interview 等 proof 与 `run-e2e-isolated.mjs` wrapper 零 diff。
5. **共享 SSOT 零改**：LEDGER/backlog/checklist 行与统计只读引用——sse-push nail 段红登记翻面权归协调方 nail；本刀不宣称行关闭。
6. est live=0（起草 turn·§6）。

## §4 依赖

**①上游已满足**：`4dfaeb01`（sse-push bodyless 修复）+`f31d56d1`/`c31fd11e`（0189 EXEC+修复）+`809cd46e`/`cf501273`（nail merge+SSOT）全 HEAD 祖先亲证。**②无同文件并发**：worktree list 24 树亲证·零第二树触 proof 文件或 sse-notify 面（§0.0）。**③迁移号**：§0.3（预期零·需则按协调规则）。**④下游**：sse-push nail 段红登记处置+0189 与 sse-push 两 nail 卷的互引注记·归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree docs commit）；Ban 自批（pre-exec 双审须独立外席·alone≠dual 不代签）；**Ban 改产品码**（件① 外任何触面·§3-1）；Ban 翻 0189 行为面（懒起 LISTEN/NOINHERIT 仲裁/SD 四函数/零表 GRANT·§3-3）；**Ban 弱化断言**（35 条断言首参/regex/阈值逐字冻结·只许 tap 块位移·§2-1）；Ban retry-to-green（断言红恰 1 attempt·基建红除外·件③(d)）；Ban 抢迁移号 Ban 私占（§0.3）；Ban 触其他工作树；Ban 改共享 SSOT（§3-5）；Ban 借机修 lint 红（§2-6 承登恒等口径）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 顺带升级依赖包；Ban 归因 RL_SHARED_DEGRADED 线（§1.6）。

**pins（本卷钉值·零翻转）**：releaseEvidence=false · Not HA · actualSpendCny=null · PG-retained · ⛔push · sse-push:notify 门断言总数=**35**（rg 亲证） · api-harden 门断言总数=**31**（rg 亲证） · 主线链顶=**0189** · docs cap=**2088** · 双臂异臂同根=本卷定谳候选（待双审追认） · est live=0（起草 turn）。

## §6 est live=0（起草 turn）+ EXEC 门预申明

- **起草 turn（本 commit）**：est live=**0**——零模型外呼零 Key 加载（复现 run 纯本地隔离 PG·harness `:61-62` 显式 delete MODEL_API_KEY/MODEL_BASE_URL 自证）·零生产操作·零消耗。
- **EXEC 期门预申明（授权后方可行）**：①件① seam 位移落位+件③ 判别 run 恰 1 有效 attempt（结局族预注册）；②门矩阵 §2 九项全跑全落收据；③`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改；④隔离容器用后即焚零残留·外来容器零触碰；⑤收据落点 `ai-docs/delivery/receipts/ssepush-notify/`（00-exec.md+proof receipt 原物+attempts 全台账+pre/post 断言清单对照+**件③ 判别 run 全量 stdout tee 落卷**——收据 JSON 无 stdout 字段（rev2 十二键亲证：class/dataHandling/durationMs/exitCode/finishedAt/outcome/releaseEvidence/schemaMigrationManifest/schemaVersion/sourceDigests/startedAt/target）·预注册双 PIN 读数全系 stdout 承载（proof `:206`/`:243` console.log·非 JSON 键）·不落 stdout 则件③ 预注册读数无从复核）+harness 本卷推进注记（append-only）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+EXEC 期 proof .ts+收据）**五类标记词 grep 零命中**（起草席本 commit 亲跑·回执随 EXEC 收据留痕·五类词不复抄卷内防自匹配——沿 g7w/ag-d/authz-harden 卷 §7 同形制）。

## §8 STOP（开工三条款 + 待双审/EXEC 裁决项）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（含 §8 裁决行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1.3 时序根因结论与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·含 §0.2 四条漂移复核与 §0.3 迁移号实占复核）。**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（tap 块迁位/断言行变/懒起钩被他人改/链顶非 0189）→停·重 pin 回炉；**机制不满足**=件① 落位后判别 run 命中结局族 (b)/(c)（双臂仍红=根因证伪·或他臂新红）→停·如实升级协调方（Ban 就地改因 Ban 扩面修）；**越界需要**=任何产品码/0189 行为面/兄弟 proof/wrapper 改动诉求→停·另刀或 §8 裁决行使（Ban 就地修）；**验收红不可修**=门矩阵静态红（typecheck/docs:check/uniqueness/lint 漂移）且根因不在本刀交付面→停·如实登记（基线红 stash 对照先例·Ban 借机修·docs:check >2088 红即停上报）。

**待双审/EXEC 裁决项**：
- **①tap 前移定性追认**：seam 修正（捕获窗回归约束②原意）非「为绿改测试」——证据=断言文本/regex/阈值逐字冻结（§2-1）+活体时序证据（§1.1-3·目击+机制推演）+33 绿臂零扰动。推荐=追认行使 vs 翻案（翻案即回炉）。
- **②双臂异臂同根归因追认+0189 权限假说证伪登记**（§1.2/§1.5）——若任一席提出权限面残余疑点→停·升级协调方（Ban 就地扩权验证）。
- **③迁移号**：预期零确认；若 EXEC 复判需迁移→§0.3 协调规则（0190 起顺延实测·5B 实占 0190-0199 则 0202 起）。
- **④产品侧替代方案否决追认**（§3-3）：`principal.guard.ts:38` 移 onApplicationBootstrap 修不了本红（时序论证）·若协调方仍裁产品侧行使→另刀全链（本刀零码不变）。
- **⑤行关闭效力**：EXEC 命中结局族 (a)+门矩阵九项全绿+post-prove 双审 BOTH PASS→sse-push nail 段 2/35 红登记的关闭/翻面登记权归协调方 nail（本刀交付读数·不宣称关闭）。

---

*SSEPUSH-NOTIFY REQUEST · 2026-10-14 起草 · STOP=`draft:awaiting_pre_exec_dual` · 起草 base=`feat/mysql-schema-skeleton` @`cf501273` · 分支 `line/ssepush-notify` · 工作树 `meetwise-spn`（本起草席立·建前 worktree list+branch 双查不存在）· 立项出处=协调方派单 brief（自然实验 cf501273 2/35 vs 04cd8298 35/35）+SSOT `e9bca574`/`809cd46e`/`cf501273` · 根因=0189（`f31d56d1`）principal.guard.ts:35-38 模块级懒起 LISTEN→trigger_missing 结构化降级线于 boot() await 窗内发出（先于 proof:66-75 tap 安装·:262 同因去重永不重发）→P-2a②/P-2d② 双臂确定性恒红（异臂同根）· 0189 权限假说证伪（触面零交集+写路径活体全通）· 修法=proof tap 块前移至 boot 前（断言逐字冻结·零产品码零迁移）· est live=0（起草）· markers=0 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · ⛔push · STOP*

## rev2 处置摘要（审席1 PASS 附 P1 必改+P2×3 全数处置·2026-10-14·docs-only 恰本卷 1 个 .md·STOP 与 §5 Ban/pins 零翻转）

1. **P1（必改·修法落点钉死）**：§1-件① 原「建议紧随 `:62` 横幅行前后」系自相矛盾措辞——实测 `:62` 横幅在 `:59` boot 返回之后·照抄必把 tap 装到捕获窗之外→双臂仍红→误触结局族 (b) 根因证伪回炉。已改无歧义锚：**落点=紧随 `:58` 之后、`:59` `const h = await boot();` 之前（proof 体首个 top-level await 之前的同步先导段内）·任何不早于 `:59` 的落点（含 `:62` 横幅附近）禁止**。附亲证更正一处：末行 import 实为 `:57`·`:58` 为 import 块后空行（**rev3 勘正：原「proof:54-58 五行 import 亲读」系计数误把 ：58 空行计入 import 行——实 `:54-:57` 四行 import+`:58` 空行**·proof:50-57 共 8 行 import 块末四行即 ：54-:57·锚位 `:58/:59` 按审席指示保留·括注按实测如实化）。
2. **P2-1（收据承载面+证据等级如实化）**：①§6-⑤ 增补「件③ 判别 run 全量 stdout tee 落卷」——收据 JSON 十二键亲证无 stdout 字段·预注册双 PIN 读数全系 stdout 承载（proof `:206`/`:243` console.log·mkAssert PASS/FAIL 亦 stdout）·不落 stdout 则件③ 读数无从复核；②§1.1-3「活体铁证」降格为「起草席目击+机制推演」（复现 run 全量 stdout 未入收据·无独立可复验原物·时序结论不变）·§0.2-2 与 §8-① 两处「铁证」引述同步对齐（不改结论）。
3. **P2-2（0189 触面措辞如实化）**：§0.1 第五行原「rg 全文亲证（零命中）」与实测不符——rg 实测全文命中恰 4 行且全为叙事注释（`:16` 0143 同形/`:17` interview_event_ch 通道名/`:18` LISTEN 措辞/`:144` 0143 同形）·DDL 零触及。已改「实质触面零触碰」+四行明列。附亲证补一行：审席口径「:16/:17/:144 三处」漏计 `:18`（LISTEN）·按实测四行落笔。
4. **P2-3（G7_FREETIER_REPROVE 外泄残余边界登记）**：§1-件① 增落位注释——`src/main.ts:30-37` 全 src 唯一模块级 `await import`（`:31`·rg 计数亲证恰 1）在该 env 分支内·harness 全卷零读写该 env（rg 亲证零命中）·隔离 runner 仅 baseEnv 显式携带才透传（`run-e2e-isolated.mjs:2700`·`:2690-2697` 附属 ledger 分支同门）·本 proof 目标 baseEnv 不携带；残余若兑现→件③ 结局族 (b)/(c) 兜底停。tap 前移不新增此面·仅登记。

**rev2 自检**：docs:check EXIT=0（本树亲跑·≤cap 2088）·markers 五类（词面见 i6-239-gates §2-7·不入卷防自指）改动卷直扫零新增·STOP=`draft:awaiting_pre_exec_dual` 维持·alone≠dual·Dual PASS ≠ 开工·⛔push·本 rev2 commit 不预 claim 任何 post-commit EXIT。

## rev3 errata 落卷（EXEC 立项 commit·席2 R1-R4·2026-10-14·docs-only 恰本卷 1 个 .md+pre 收据工件·STOP 与 §5 Ban/pins 零翻转）

**授权链落卷（开工三条款①②）**：pre-exec 双审两外席 **BOTH PASS**（席1 `agent_667bcebe`+席2 `agent_900c3fa3`·协调方会签在案）+**协调方明示 EXEC 授权**（派单令载明·席2 附 R1-R4 四条 errata 先落卷后开工）。本节由 EXEC 席落卷·不代签双审内容·只登记授权事实与四条处置。

1. **R1（§2-1 机检行增补·已落）**：tap 三绑定符 rg 逐行计数 pre==post=5 行+post 三绑定声明各恰 1+调用点恰 2·命令与口径见 §2-1 rev3 机检行。
2. **R2（§2-1 首参提取命令钉死·已落）**：hex 双形态恰 35（单引号 31+反引号模板 4）+剥行号列后 diff=∅ 口径·命令见 §2-1 rev3 提取命令钉死段·pre 清单 `receipts/ssepush-notify/asserts-pre.txt`。
3. **R3（rev2 摘要措辞勘正·已落）**：「proof:54-58 五行 import」→实 `:54-:57` 四行 import+`:58` 空行·勘正落 rev2-P1 括注内（§8-③ 行号如实改锚先例·结论不变）。
4. **R4（件① 落位注释增补·已落）**：inheritedEnv 剥离清单（`:2706-2717` 显式名单+`:2718` LANGFUSE_ 前缀）不含 G7_FREETIER_REPROVE 之环境条件断言注记落 §1-件①·附并线后 `run-e2e-isolated.mjs` 锚重 pin。

**EXEC 立项重 pin（§0 协议·§8-③·@merge `6187e8e5`=`1cf1416c`×`55584f1f`·`git merge --no-ff` ort 零冲突自动解）**：核心五锚零漂移——proof `97e3561f`/sse-notify.service `93904f20`/principal.guard `50b38bc5`/_neg-harness `b03cb16b`/api-harden proof `157376c2` 全 `git hash-object` 亲证与 §0.1 同值·proof `:54`/`:57`/`:58`/`:59`/`:66-75` 行锚全数亲读在位·`i6-239-gates.proof.mjs` `339f92f4` 零漂移。漂移两锚如实改——package.json `22013d68`→`5aa5a7fc`（并线 +4 行 ag39/model-op02 prove 接线·`:8` lint max 5200 与 `:180-181` sse-push:notify:prove 接线行号不变·`:345`→`:347` migrate:prove·`:457`→`:461` drift:prove·`:473`→`:477` api-harden:prove·`:661`→`:665` turbo）·run-e2e-isolated.mjs `70032509`→`f986c56b`（`:95` api-harden 目标源集不变仍不含本 proof 文件·notify 目标源集含本 proof 行 `:1212-1214`→`:1250`·inheritedEnv 面 `:2690-2697`/`:2700`→`:2706-2718`/`:2721-2722`/`:2734-2744`）。**面值更新（并线实占）**：链顶 0189→**链 201 头 0201**（并线引入 0190-0201 十二卷·§0.3 协调规则随之——EXEC 期如需迁移认领 0202 起·本刀预期仍零迁移）·docs cap 2088→**2104**（`scripts/ai-docs/public-text-policy.mjs:60 MAX_FILES=2_104` 在树亲证·主线 55584f1f sanction 已含）·lint 承登基线以主线现值为准=api `apps/api/package.json:7` max **1421**+root `package.json:8` max **5200**·SSOT `55584f1f` 题承登红=**root 5212/api 1431**（取代 §0.2-4 时点值 5210/1431·§2-6 恒等判定对 5212/1431 行使）。**§1.3 时序根因结论与 §5 Ban/pins 零翻转（§8-③ 合规）·结论不变只更行号/基线值。** Status 行翻面随 EXEC 收尾 commit（§9）一并行使·本 commit 维持不预 claim 任何 post-commit EXIT·⛔push。

## §9 EXEC 记录（2026-10-14·EXEC 席·工序/收据/门矩阵/偏离·收尾 commit·STOP 翻面随本节）

- **授权与 commit 链**：双审 BOTH PASS（席1 `agent_667bcebe`+席2 `agent_900c3fa3`）+协调方明示 EXEC 授权→`git fetch`+`git merge --no-ff feat/mysql-schema-skeleton`=**`6187e8e5`**（ort 零冲突自动解·零 union 手解需求）→**`d4e21698`**（rev3 R1-R4 落卷+立项重 pin）→**`349ab0af`**（EXEC 件① tap 位移+post 收据）→本 commit（§9+收据 `00-exec.md`+判别 receipt 原物）。
- **件① 落位复核（§1-修法）**：tap 块 pre `:66-75` 整体位移→新位 **`:59-:68`**（块顶注释 `:59` 紧随 `:58` 空行·`const h = await boot();` 现 `:70` 在块后——「任何不早于 boot 落点禁止」合规·捕获窗覆盖 boot await 窗=约束②原意）·35 断言首参/regex/阈值逐字零动（钉死命令 pre/post 双清单 `asserts-pre.txt`/`asserts-post.txt` **diff=∅**·基线 blob `97e3561f`）·机检行 pre==post=**5 行**·post 三绑定声明各恰 1（`:60/:61/:66`）+调用点恰 2（`:203/:242`·`:77` 起全树行号零净平移）·其余语句零改·零产品码零迁移零 SSOT 触面（diff src/migrations=0 文件亲证）。
- **件③ 判别 run（恰 1 有效 attempt）**：`pnpm sse-push:notify:prove` **35/35 全绿 EXIT=0**·预注册双 PIN 读数逐字兑现——`OPT1-C2-LIVE-DEGRADED-LOG`=真线非 MISSING（与 regex 期望逐字相符）·`OPT1-C2-DEGRADED-WINDOW reason=trigger_missing window_ms=2860`∈(0,60000)·**结局族 (a)=修法成立+归因闭合**（行关闭效力归协调方·§8-⑤·本刀不宣称关闭）·活体时序全量入卷（降级线先于 Server listening·stdout tee `:14-:16`）·`G7_FREETIER_REPROVE` 操作壳零携带核记（R4 环境条件成立）·receipt 原物 `proof-receipt-attempt1.json`（outcome=passed·durationMs=56359）。
- **门矩阵九门终态全绿**：①改动面窄（恰 3 类·`rg -c "^\s*A\("` 35==35·双清单 diff=∅·机检 5==5·src/migrations=0）②复绿 **35/35 EXIT=0（本刀见证点）** ③api-harden EXIT=0 31 臂 0 FAIL ④migrate EXIT=0 链 201 头 0201+drift EXIT=0 零漂移+uniqueness files=201 violations=0 ⑤typecheck --force 8/8 successful 0 cached EXIT=0 ⑥lint 恒等承登 root **5212**(0 errors)/api **1431**(0 errors)==主线 55584f1f 既登基线逐值相等零新增（EXIT=1 系超 max 承登红恒等）⑦docs:check **2104≤cap 2104 EXIT=0** ⑧markers 五类零命中 ⑨净树（typecheck 副产物 tsbuildinfo 已 restore·非交付面零残留）。§6-③ `pnpm install --frozen-lockfile` EXIT=0 lockfile 零改。全表+attempts 台账+stdout tee 索引=`ai-docs/delivery/receipts/ssepush-notify/00-exec.md`。
- **偏离二条（理想零·实际二·均在本刀交付面内·详见收据 00-exec.md §五）**：①**收据布局合并**——机检 pre/post 两 `.txt` 并入 `00-exec.md` 转载段（证物内容零灭·§2-1 命令在卷）+门 3 api-harden receipt 原物引用 `.tmp` 原路径不复制入受管树；根因=并线后 cap 2104 对 2099+本卷 1 余量仅 4·收据受管计数（.txt/.json/.md 计·.log 不计）按 §6-⑤ 最小集超 2·**cap sanction 权归协调方（Ban 借机修 cap）**故交付面内合并零灭证；若协调方裁还原独立文件布局→须同步 sanction cap 上调·归 post/协调方裁决。②**门 7/门 9 首跑中间态红**（docs:check 2106 系收据未定型·tsbuildinfo 系 typecheck 副产物）——均当场处置终态复跑绿·非既登基线红非产品面红·如实登记。
- **STOP 翻面**：`draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`**（待 post-prove 双审·BOTH PASS 后 nail 收官/行翻面归协调方）。卷尾起草 footer 之 STOP 值系起草时点历史记录·现值以头部 Status 行+本节为准。⛔push。
