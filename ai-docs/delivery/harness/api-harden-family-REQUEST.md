# API-HARDEN-FAMILY REQUEST（5C 拆刀排程第四发 · api-harden 面残行 · R10 停手解除落码 + 复核两项落卷 + E4/E5 呈报 · 3 码文件 + 1 新件 · 落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**
**Date**: 2026-10-16
**席位**: API-HARDEN-FAMILY 起草席（协调方派单·5C 拆刀排程第四发·QUEUE=Q1 EXEC✓·OBS/SSE-API 起草中·授权按 LEDGER :87 组标签+checklist :2680「Line API-HARDEN nail」段锚定·⛔push·⛔merge主线）
**刀位**: `ai-docs/delivery/harness/product-campaign-LEDGER.md:87`（5C 可靠性（52）行逐字：「…/#248/#245/#246/#172/#14/#216 — 🆕 **分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）**」——本刀=**API-HARDEN 子刀·靶=api-harden 面残行**）+:234（R10 行逐字：「| R10 | ensure-ok server-only 标注 | SSE nail @ed56c73b 席1 nit | lib/jobs/ensure-ok.ts 未标 server-only（无实际渗漏·可选收紧） | **5C-API-HARDEN 顺手** | 开放 |」=批表 API-HARDEN 组靶行·组内唯一在册开放行）+ `ai-docs/delivery/execution-master-checklist.md:2680/:2683/:2685`（Line API-HARDEN nail 段头/件⑥ R10 停手登记三证据/STILL OPEN 四项=J2 广播臂强度+清理频度上限+E4/E5 占位+件⑥ R10）
**Base**: `feat/mysql-schema-skeleton` @`6a6c7843`（full `6a6c78434c34743f0d7ff57862cbc8ec865fdd3b`·2026-10-16 fetch 后实测 tip·初建 935899f1 后 ssd-egress-manifest nail 波落 origin→ff-only 快进·REMOTE-IS-ANCESTOR 恒等零改写）· 分支 `line/api-harden-family`（工作树 `../meetwise-aph`：`git worktree add ../meetwise-aph -b line/api-harden-family origin/feat/mysql-schema-skeleton` 本席亲立·HEAD 落 tip 亲证）
**Pins（十一值照抄 · 零翻转）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`
**Honesty**: 蓝本=LEDGER :87 组行/:234 R10 行/:216 计件笔（HMAC #100 乙案）+ checklist :2680-:2685 + 前刀卷 `api-harden-REQUEST.md` §9.4-6（件⑥ 停手三证据原文）+ `hmac-consolidate-REQUEST.md`（乙案定谳）+ 涉案码 file:line 全起草席亲读亲证（@`6a6c7843` 实树）；基线绿本席亲跑一枚（web prove·§0.4）；桩机制本席 /tmp 隔离机检一枚（§0.5·临时目录即焚零入仓）；零实跑零 live·est live=0；markers=0（§7）。

---

## §0 现状锚（起草席亲读 · file:line 逐条实测 @`6a6c7843` · EXEC 立项照本节重 pin——基线漂移如实改锚·结论不变则只更行号）

### 0.1 靶行清点（三载体 · 逐字誊录）

1. **LEDGER :87 组标签**：5C 可靠性（52）行尾「/#248/#245/#246/#172/#14/#216 — 🆕 分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）」——API-HARDEN 子刀位在册；组内 #36/#37/#17/#129/#118 五件已随 API-HARDEN nail @`809cd46e` 翻面（:213 批5 计件笔 +5 在卷）·#139 明载「留 5C-SSE-API 子刀」·#157/#158/#181/#156=QUEUE Q1（翻面权归协调方）——**本刀靶=api-harden 面残行，非组行全集**（组行全集残余归 OBS/SSE-API 各子刀·§3-1）。
2. **LEDGER :234 R10 行**（批表 API-HARDEN 组靶行·唯一）：「ensure-ok server-only 标注…无实际渗漏·可选收紧 | 5C-API-HARDEN 顺手 | **开放**」。
3. **checklist :2683+§:2685 STILL OPEN 四项**：件⑥ R10（:234 维持开放·停手三证据 :2683 在卷）+ J2 广播臂强度（「jti live 广播窗 26ms 单次实测·强度面=采样广度/负载形留后续复核」）+ 清理频度上限（「共享表 7d 惰性 TTL 采样清理·采样频度无显式上限面·随 #129 复核面」）+ E4/E5 占位（「post 席1 五点中 E4/E5 原文不在工作树…待协调方将原文随卷归档后补处置」）。

### 0.2 R10 三证据复证（前刀卷 §9.4-6 停手面 @`6a6c7843` 全数亲证仍成立）

1. **'server-only' 全仓零安装零声明**：`pnpm-lock.yaml` rg `server-only` **零命中**；主仓已装树实测 `require.resolve('server-only',{paths:apps/web})` → **MODULE_NOT_FOUND**；`.pnpm` store 零条目。
2. **构建面不依赖安装**：`apps/web/node_modules/next/dist/compiled/{server-only,client-only}` 在位亲证=Next 打包器内建 alias（`lib/api/server.ts:1` 即 `import 'server-only';`·web 构建/typecheck 历史全绿）——安装缺失只炸 **tsx/node 裸解析面**，不炸 next 面。
3. **proof 消费面**：`apps/web/test/web-logic.proof.ts:969` `const { ensureOk } = await import('../lib/jobs/ensure-ok.ts');`（**无桩直 import**）+`:970` `const { redirect } = await import('next/navigation')`（**真 redirect**）+`:1216-1228` ensureOk 断言臂——**:1219 要求 `err.message === 'NEXT_REDIRECT'` 恰等**（真 next/navigation 形；R3 勘正：起草误植 :1218/:1216-1227·EXEC 实树复核 :1219/:1216-1228 为准）+digest 含 `/login?expired=1`。`ensure-ok.ts` 全 17 行（`:10-11` 头注自证「独立纯模块原因…使 prove4 可真实断言 401 分支」=无 server-only 系设计内）·`:13-17` ensureOk 体。生产调用点恰 1（R2 勘正：起草「恰 2」误·EXEC 实树 grep 复核）：`app/jobs/actions.ts:8`（`import { ensureOk } from '@/lib/jobs/ensure-ok';` 唯一 import 形）；`app/settings/actions.ts:13` 仅注释引用（零 import）·均 'use server'·客户端零 import=「无实际渗漏」原值维持。

### 0.3 停手解除形（本刀修法核心依据）

- **桩先例形**：`apps/web/test/f5-hooks.mjs:9-27` STUB_SOURCES 三项（server-only/next/headers/next/navigation）+`apps/web/test/interviews-actions.proof.ts:14/:16` `import { register } from 'node:module';`+`register('./f5-hooks.mjs', import.meta.url)` 形制（R3 勘正：起草误植 :20-21·EXEC 实树复核 :14/:16 为准；:18 注释自证「register() 只影响其后的模块加载」=ESM 静态 import 先于 body·动态 import 后于 body·时序成立）。
- **复用 f5-hooks 全桩不可行（码面证据）**：f5-hooks redirect 桩 `:11-14` 抛 `new Error("NEXT_REDIRECT: " + target)`——message 形 `NEXT_REDIRECT: <url>` **≠** 真 redirect 的 message 恰等 `NEXT_REDIRECT` → web-logic.proof.ts :1218 臂必红。**narrow 专桩（恰 'server-only' 一项）为唯一两全形**：桩拦截裸解析（未达 MODULE_NOT_FOUND 即 shortCircuit）·next/navigation 保持真 import·:1216 臂零改。
- **机检实证（本席 /tmp 隔离形·即焚）**：narrow hooks（STUB_SOURCES 恰一项）+mod（首行 `import 'server-only'`）+tsx `register` 动态 import → **PASS**（「stub intercepts unresolvable server-only under tsx」）。
- **基线绿（本席亲跑）**：主仓 tip 树 `pnpm -C apps/web prove`（=web-logic.proof.ts）全绿「✓ 全部通过」——R10 落码后同门复跑即为回归门（§2-1）。

### 0.4 复核两项读码结论（checklist :2685 前两项·本席复核结论落卷·零码动）

1. **J2 广播臂强度**：`apps/api/test/api-harden-shared-state.proof.ts`（320 行·31 臂 S1/S2/W1/W2/T1/T2/D1/M1/J1/J2/N1）J2 臂 `:253-274`=单次 revokeSession（对侧池 CTE UPDATE+NOTIFY 同事务）→本侧 `isSessionActive` 翻 false·窗 1000ms poll 20ms·nail 时点实测 26ms·断言 `<1s` 预算在臂。复核结论：**单次实测+窗预算断言已立；采样广度（N=1）扩 N 属断言数变更（31→33+）=门矩阵面变更，归协调方裁决，非本刀半径**（§1.3-4）。
2. **清理频度上限**：`apps/api/src/platform/rate-limit.service.ts:43-44`（`cleanupEveryOps=128`+`bucketTtlMs=7d`；R3 勘正：起草误植 :42-43·EXEC 实树复核 :43-44 为准）+`:74-84`（`maybeCleanupBuckets`·每 128 共享 ops 采样一次/进程·失败静默下窗再试）+`:112/:138` 两调用点均 `void` fire-and-forget（零热路径阻塞）。复核结论：**「采样频度无显式上限」注记与现码不符=表述过时**——每进程每 128 ops 至多一次即显式频度上界；聚合 DELETE 负载=进程数×ops/128 线性随流量·单次为 SD 函数 `gateway_rl_bucket_cleanup`（0189·TTL 定点删除·空表 no-op）→ **登记结案**（如需进程级时间节流如 ≥60s 间隔属可选收紧非缺口·归后继裁量·§1.3-4）。

### 0.5 HMAC 乙案后硬面残缺口（清点结论=零 actionable）

`hmac-consolidate-REQUEST.md:85`（「本刀普查表（§0.1-HMAC）即「HMAC 工具面」文档化 SSOT=**乙案交付本体**；env-schema 4 锚如实化=唯一残缺陷行使面（件①）」）+:75（「commerce 面…本面无残重复可收」）+:189（定谳=候选乙·三面算法同但密钥源三异·载荷框架五形即契约·三面间零复制块·principal.guard 零计算纯消费·戊案 privacy.service.ts:105 席1 边界明裁零触）——件① env-schema 锚已随 EXEC 落卷（LEDGER :216 计件笔 #100 +1 在卷）·普查表 18 位点/16 文件 SSOT 在卷只读。**硬面残缺口=零**；本刀零触 HMAC 面（防重三查 §3-6）。

### 0.6 E4/E5 占位（blocked 呈报）

checklist :2685 明载「原文不在工作树…待协调方将原文随卷归档后补处置」——**非本席可证伪面·零触**·本刀仅呈报维持（§1 件④·裁决项④催办）。

### 0.7 门基线值（EXEC 重 pin 来源·近期 nail 波亲证值）

`api-harden:prove` **31 PASS** · `neg:all` **687/687**（六段 auth 90/commerce 90/resume 91/interview 102/bend 179/input 135）· `turbo typecheck --force` **8/8** · `turbo lint --force` **12/12** 五值贴线（web **601**/root **5235**/api **1421**/worker 954/ai-runtime 628）· `docs:check` 基线 2184≤cap **2200**（R1：协调方 sanction `3cd159dd` 已行使 cap 2192→2200·`scripts/ai-docs/public-text-policy.mjs` MAX_FILES·ssd 波后本席口径推算·EXEC 实跑为准）· 迁移链头 **0204**（cost-columns 0204 在卷·本刀零迁移）。

---

## §1 修法（一件落码 + 两件复核落卷 + 一件呈报 · EXEC 立项重 pin）

### 件① R10 停手解除（恰 3 码文件·含 1 新件，+本卷 .md=4 tracked（席1 P2 措辞精化）· 零依赖零迁移零 lockfile）

- **①a `apps/web/lib/jobs/ensure-ok.ts`**：首行增 `import 'server-only';`（先例形=`apps/web/lib/api/server.ts:1`）；`:10-11` 头注「独立纯模块原因」段如实化改写（→「server-only 标注（R10·本刀）：web prove 经 `test/server-only-hooks.mjs` 窄桩可导入（tsx 裸解析面拦截·next 打包面走内建 alias）·redirect 语义与调用点零改」——Ban 保留与实现不符注释）。
- **①b `apps/web/test/server-only-hooks.mjs`（新件 ~15 行）**：f5-hooks.mjs :9-27 同构**收窄形**——STUB_SOURCES 恰 `'server-only' → 'export {};\n'` 一项·resolve/load 双 hook·其余 specifier 全 passthrough（零行为外溢）。**零包安装**：pnpm-lock 零触（构建面=next 内建 alias 已覆盖·tsx 面=桩覆盖·§0.2-1/2）。
- **①c `apps/web/test/web-logic.proof.ts`**：头部增 `import { register } from 'node:module';` + `register('./server-only-hooks.mjs', import.meta.url);`（置于静态 import 之后 body 首位——:969 ensure-ok 动态 import 在 body 内=register 先于其行使·interviews-actions :18 时序同源）；**:970 next/navigation 真 import 与 :1216-1227 断言臂零字节零改**。
- **语义面**：ensureOk 函数体零字节（401/402/容忍集/其余抛错四分支原值）；生产调用点 2 文件零触；server-only 标注=客户端误 import 构建期硬失败（R10 原意「可选收紧」兑现）。

### 件② J2 广播臂强度复核落卷（docs · 登记结案推荐案）

本卷 §0.4-1 复核结论随卷落档=登记结案（单次 26ms 实测+<1s 预算断言已立·强度面扩 N=断言数变更归协调方）；EXEC 收据如实转写。若协调方裁加强案→触发停止条件③上报（门矩阵 pin「api-harden 31」变更非本刀半径）。

### 件③ 清理频度上限复核落卷（docs · 登记结案）

本卷 §0.4-2 复核结论随卷落档=登记结案+表述过时勘正注（频度上界显式在码 `cleanupEveryOps=128`）；EXEC 收据如实转写。零码动。

### 件④ E4/E5 占位呈报（blocked · 零触）

维持 checklist :2685 原注记；本刀呈报催办=请协调方将 post 席1 E4/E5 原文随卷归档后另派补处置（裁决项④）。

**修法计数**：落码 1 件（恰 3 码文件·含 1 新件，+本卷 .md=4 tracked（席1 P2 措辞精化））+复核落卷 2 件+呈报 1 件=**4 条**；零迁移（链头 0204 零触）；零依赖（pnpm-lock 零触）。

---

## §1.3 否决（四项 · 双审可复核）

1. **否决复用 f5-hooks.mjs 全桩**：redirect 桩 message 形 `NEXT_REDIRECT: <url>`（f5-hooks.mjs :11-14）≠真形恰等 `NEXT_REDIRECT`（web-logic.proof.ts :1218 断言）→ :1218 臂必红。narrow 专桩=唯一两全形。
2. **否决「改 :1218 断言适配桩消息形」**：Ban 为过门放宽既有断言（§5）·断言先于实现。
3. **否决「apps/web 新增 server-only 直属依赖」**：包零内容（空 export）·lockfile 变更面非必要（next 打包 alias+tsx 窄桩两面已全覆盖）·徒增供应链与 lock 噪声。
4. **否决「J2 臂扩 N / 清理时间节流落码」**：api-harden:prove **31** 断言数=本刀门矩阵 pin 值（派单 brief 明载）·变更归协调方；清理节流无既有断言承载=无证产品变更。

---

## §2 验收门矩阵（十门 · pre-exec 双审核对单基面 · EXEC 立项重 pin · 门预申明）

| # | 门 | 判据 |
|---|---|---|
| 1 | web prove | `pnpm -C apps/web prove`（web-logic.proof.ts）EXIT=0 全绿·:1216 ensureOk 臂在列零改（基线绿 §0.3 已亲证·改后复跑=本刀命门） |
| 2 | 邻面回归 | `pnpm -C apps/web prove:interviews-actions` EXIT=0（f5-hooks 形制同源邻面零触回归） |
| 3 | api-harden | `api-harden:prove` EXIT=0 恰 **31 PASS** 零回退（本刀 apps/api 零码面·纯回归门） |
| 4 | neg | `neg:all` EXIT=0 **687/687**（六段 90/90/91/102/179/135） |
| 5 | typecheck | `turbo typecheck --force` **8/8**（0 cached） |
| 6 | lint | `turbo lint --force` **12/12** 五值贴线 web **601**/root **5235**/api **1421**（+worker 954/ai-runtime 628 恒等）——本刀新增行须零 warning（601 恰等贴线·register+import 形制先例 interviews-actions :20-21 零 warning 在案） |
| 7 | docs:check | EXIT=0 预期 **2186 ≤ cap 2200**（R1：cap 2192→2200 sanction `3cd159dd` 已行使·基线 2184+并线带入 5e-cleanup-sweep 卷+本卷 .md+server-only-hooks.mjs 受管件；>2200 红停·余量与在飞 OBS/SSE-API 卷共享·如实登记） |
| 8 | markers | 实质门=改动集（本卷 .md+①a/①b/①c 三文件）五类标记词 grep 零命中+`est live=0` 臂绿；`i6-gates:prove` 恰符臂红=**协议形承登**（i6-239 历史刀申报面·沿 queue-shutdown-phases 卷 §9 先例·非本刀新增红·如实复现登记） |
| 9 | diff 面 | 恰 **4 tracked** 文件（本卷 .md+ensure-ok.ts+web-logic.proof.ts+server-only-hooks.mjs）·零迁移（链头 0204 零触·`check-migration-version-uniqueness`/`drift:prove` 零触面·EXEC 可选复核）·pnpm-lock.yaml 零字节触 |
| 10 | migrate | `migrate:prove` EXIT=0（隔离 PG 链 204 头 0204·本刀零新迁移纯回归确认） |

---

## §3 范围外（边界清单 · 越界即 FAIL）

1. **组行全集残余归各子刀**：#248/#245/#246/#172/#14/#216 及 #5/#117/#7/#9/#116/#164/#182/#4 半闭面=OBS/SSE-API 各子刀靶面（5C 拆刀排程四分工位）·本刀零触。
2. #139（LISTEN 掉线不唤醒）=5C-SSE-API 子刀·零触；QUEUE Q1 收尾序四行翻面权归协调方·零触。
3. E4/E5 补处置=待协调方归档原文（§1 件④）·本刀零触。
4. apps/api 全域零码面（api-harden 31 臂/principal.guard/env-schema/commerce 硬面=纯回归门零改·NOINHERIT 仲裁/SD 四函数既有语义只增不翻）。
5. SSOT 翻面（LEDGER :234 R10 行翻面/:216 计件/checklist :2685 STILL OPEN 收行）——nail 席随落·本刀 docs-only 只读引用。
6. HMAC 普查表（§0.5）只读引用·零触；HMAC 域任何再收编=另刀。
7. web-logic.proof.ts 断言面（:1216-:1228 全臂+其余 2000+ 行）零字节零改·:969/:970 动态 import 形零字节零改——①c 头插（`node:module` import 归头部 node: 内建组+`register()` 置 body 首位）不涉断言面（§3-7 精化：席1 P2·断言臂收口行勘正 :1227→:1228+头插面明示）；f5-hooks.mjs 与 interviews-actions.proof.ts 零触（邻面不并改）。

---

## §5 Ban 列表 + pins（沿 api-harden/queue-shutdown-phases 卷同源誊录 + 本刀增补）

**Ban 列表**：Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 安装任何新 npm 依赖（pnpm-lock.yaml 零字节触·§1.3-3）；Ban 改 web-logic.proof.ts :1216-1227 断言面与 :970 真 import 形；Ban 触 apps/api/src 与 packages/ 任何码面（本刀修法半径=§1 件① 恰 3+1 文件）；Ban 动 api-harden:prove 31 臂断言集与 neg 全段断言（纯回归门）；Ban 迁移（链头 0204 零触）；Ban 复用 f5-hooks.mjs 于本刀（§1.3-1）；Ban 保留与实现不符的注释（ensure-ok.ts :10-11 随修法如实化——「登记不实施」翻「已实施·机制=X」如实形）。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全离线静态/进程内·零模型外呼·零 secrets·零消耗）。

---

## §6 est live=0

本刀零模型真实外呼：门 1/2=web 离线纯函数 proof（tsx·无浏览器无网络）；门 3-5/10=隔离容器/静态断言既有门纯回归；R10 落码=编译期标注零运行时分支。零生产操作·零 secrets 读用·零消耗（pins 脚注同源·EXEC 收据逐门登记零外呼口径）。

---

## §7 markers=0（卫生声明）

本刀改动集（起草阶段恰 1 .md=`ai-docs/delivery/harness/api-harden-family-REQUEST.md`）五类标记词 grep 零命中+冲突标记对零命中（起草席落卷时亲跑·命令与回执随 EXEC 收据留痕·词面见 `scripts/i6-239-gates.proof.mjs` 运行时组装·不入卷防自指）。恰符臂红=协议形承登（沿 queue-shutdown-phases §9 先例·非本刀新增红）。

---

## §8 STOP（开工三条款）+ 待裁决项 + 停止条件

**STOP · `executed:awaiting_post_prove_dual`（EXEC 席翻面·2026-10-16） · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md 落卷）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**（已兑现：席1 agent_ac73e84b PASS+席2 agent_448ec3d8 PASS P2×5+R1-R5 修订清单随 EXEC 立项落）；②**协调方明示授权**（已兑现：含裁决项①-④ 逐项行使=R10 解除甲案行使·件②③ 登记结案行使·docs:check 余量共享行使·E4/E5 催办行使）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（遵守：双审 P2 修订落点=措辞/勘正/登记面·修法实质零改·§9-B 逐条留痕）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

### 待裁决项（四项 · 双审/EXEC 行使 · 推荐案已注）

1. **R10 解除形行使确认**：甲=narrow 专桩案（§1 件①·推荐·机检 §0.3 已证）vs 乙=直属依赖案（§1.3-3 否决在卷·若协调方仍裁乙=越 §1.3 需明示override并知 lockfile 面）。
2. **件②③ 复核终裁**：登记结案（双推荐·§0.4）vs 加强案（J2 扩 N/清理时间节流=门矩阵与断言数变更·触发停止条件③上报）。
3. **docs:check 余量共享**：预期 2186≤2200（R1 sanction `3cd159dd` 已行使 cap 2192→2200）·余量与在飞 OBS/SSE-API 卷共享——越限即红停上报 sanction（沿 +8 先例形·不自行上调）。
4. **E4/E5 归档催办**：请协调方将 post 席1 E4/E5 原文随卷归档后另派补处置（本刀仅呈报·零触）。

### 停止条件（四类 · 命中即停手上报 · 禁自行变通）

- **现场漂移**：§0 任一锚对 HEAD 复验不符（ensure-ok.ts/web-logic.proof.ts :969-:1227 面被他刀重构/R10 已被他刀闭/门基线值漂超贴线）→ 停·重 pin 或重新归槽上报。
- **机制不满足**：narrow 桩在 EXEC 实机 tsx 版本下拦截失效（web prove :969 臂红且非本刀断言面原因）/next 打包面对 ensure-ok 构建报 server-only 解析错 → 停。
- **越界需要**：修法需触 apps/api 码面/断言集/依赖树/SSOT 翻面 → 停·上报协调方裁。
- **验收红不可修**：门 1-10 任一红且 §8 裁决四项内无自洽形 → 停·禁为绿改断言。

---

**收尾声明**：markers=0（五类标记词 grep 本刀改动集零命中）·est live=0（零模型外呼·零生产操作·零 secrets·`actualSpendCny=null` 脚注同源）·pins 十一值照抄零翻转·门预申明十门（§2）·零迁移零依赖·⛔push（本刀全程零 push）·落卷即停（终态值见 Status 行）。

## §9 EXEC 记录（2026-10-16 · EXEC 席落卷 · 七字段 · `executed:awaiting_post_prove_dual`）

**授权链**：起草 `88973303`→预执行双审 **BOTH PASS 落卷**（席1 agent_ac73e84b PASS+席2 agent_448ec3d8 PASS·P2×5+R1-R5 修订清单随 EXEC 立项落=§9-B）→**协调方明示授权 EXEC**（裁决项①-④ 逐项行使=R10 解除甲案（narrow 专桩）行使·件②③ 登记结案行使·docs:check 余量共享行使（R1 sanction `3cd159dd` 已先期行使 cap 2192→2200）·E4/E5 催办行使）。EXEC 立项未改 §1 修法实质与 §5 Ban/pins（§8-③ 遵守·双审 P2 落点=措辞/勘正/登记面·§9-B 逐条留痕）。

**序1 并线**：`git fetch` 后 `origin/feat/mysql-schema-skeleton` tip=`3cd159dd`（派单下界 tip≥3cd159dd 以等号成立=R1 sanction tip 亲证）·`git merge-tree` 预演 EXIT=0 零冲突先证·`git merge --no-ff origin/feat/mysql-schema-skeleton` 一笔并线=merge commit **`b8750ea5`**（实测 ort 零冲突 5 files +189/−8 全 5e 波卷内容·本刀七面文件区零交叠·冲突沿并集解预置未触发·⛔pull --rebase 遵守·⛔force push 未用）。

**字段① 门矩阵全表（EXEC 时点·十门）**：

| # | 门 | 判据与结果 | 结论 |
|---|---|---|---|
| 1 | web prove | `pnpm -C apps/web prove` **EXIT=0**「✓ 全部通过」·ensureOk 臂 PASS 在列（「ensureOk:401 → redirect(/login?expired=1) 抛 NEXT_REDIRECT…」输出行 :338）·断言臂零字节零改（:1216-:1228→插行后 :1222-:1234 行号漂移=头插 +6 行所致·字节零变） | 绿 |
| 2 | 邻面回归 | `pnpm -C apps/web prove:interviews-actions` **EXIT=0**「✓ FENCE-REFLOW F5/F2 interviews-actions 全部通过」（f5-hooks 形制同源邻面零触） | 绿 |
| 3 | api-harden | `pnpm api-harden:prove` **EXIT=0**·`grep -c '^PASS'`=**31** 恰等零回退（apps/api 零码面纯回归·隔离收据 `release_evidence=false` 在档） | 绿 |
| 4 | neg | `pnpm neg:all` **EXIT=0**·`grep -cE '^PASS'`=**687**·六段恰等 90/90/91/102/179/135（「条负路径用例全绿」六行亲证） | 绿 |
| 5 | typecheck | `pnpm turbo typecheck --force` **EXIT=0**「8 successful, 8 total·0 cached」（import 归组修正后复跑同值） | 绿 |
| 6 | lint | `pnpm turbo lint --force` **EXIT=0**「12 successful, 12 total·0 cached」五值恰等：web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（全包 0 error）——R10 后 web 面零警告增量兑现（中间态 +1 见字段⑥-2·非 retry-to-green） | 绿 |
| 7 | docs:check | `node scripts/ai-docs/check-docs.mjs` **EXIT=0**「scanned **2187** managed worktree files」2187≤**cap 2200**（R1 sanction `3cd159dd`·余 13·实跑值对预期 2186 差 1 见字段⑥-1） | 绿 |
| 8 | markers | 本刀改动集四文件×五类标记词 grep **零命中**（词面运行时组装防自指·见 `scripts/i6-239-gates.proof.mjs` §2-7 段·本卷不复抄词面）；`pnpm i6-gates:prove` EXIT=1 **恰符臂独红**「unexpected=apps/web/lib/jobs/ensure-ok.ts,apps/web/test/web-logic.proof.ts,apps/web/test/server-only-hooks.mjs」=**协议形承登**（i6-239 历史刀申报面·沿 queue-shutdown-phases 卷 §9 先例·非本刀新增红·该跑内 markers=0 臂+est live=0 臂全 PASS） | 绿+协议形承登 |
| 9 | diff 面 | `git status --porcelain`（R4 tsbuildinfo checkout 后）=**恰 4 tracked**：本卷 .md+`ensure-ok.ts`（+4/−2）+`web-logic.proof.ts`（+6/−0）+`server-only-hooks.mjs`（新件 24 行）·`git diff HEAD -- packages/db pnpm-lock.yaml`=空（零迁移零依赖·链头 0204 零触） | 绿 |
| 10 | migrate | `pnpm migrate:prove` **EXIT=0**「✓ 迁移运行器 全部通过」（隔离链 204 头 0204·本刀零新迁移纯回归） | 绿 |

**字段② EXIT 原值**：门1 EXIT=0（stdout 末行「✓ 全部通过」）·门2 EXIT=0（末行「✓ FENCE-REFLOW F5/F2 interviews-actions 全部通过」）·门3 EXIT=0（末行「✓ api-harden shared-state passed」+LOCAL_ISOLATED_PROOF_RECEIPT release_evidence=false）·门4 EXIT=0（六段「全绿」行）·门5 EXIT=0（「Tasks: 8 successful, 8 total / Cached: 0 cached, 8 total」）·门6 EXIT=0（「Tasks: 12 successful, 12 total / Cached: 0 cached」+五值 ✖ 计数逐包亲录）·门7 EXIT=0（「ai-docs check passed: 80 required files verified; public text policy scanned 2187 managed worktree files」）·门8 本刀探针零命中+i6 EXIT=1（恰符臂独红·字段①-8 原文亲录）·门9 porcelain 四行亲录·门10 EXIT=0（「✓ 迁移运行器 全部通过」）。

**字段③ 改前改后 PASS 名单 diff**：门1 web prove 改前（基线绿·§0.3 起草席亲跑）与改后 PASS 名单逐臂恒等（ensureOk 四分支臂同名同位在列·其余全臂名单零变）·门2 interviews-actions 全 PASS 名单恒等·门3 恰 31 PASS 恒等·门4 687 恒等——**名单 diff=空**（断言面零字节零改的直接后果）。

**字段④ diff numstat**：并线 merge `b8750ea5`（对 `3cd159dd` 零冲突并集·5 files 全 5e 波卷内容非本刀修法面）；EXEC 修法面=4 tracked：`ai-docs/delivery/harness/api-harden-family-REQUEST.md`（R1-R5+P2×5 勘正落点+本 §9 append+STOP 翻面三处）+`apps/web/lib/jobs/ensure-ok.ts` **+4/−2**+`apps/web/test/web-logic.proof.ts` **+6/−0**+`apps/web/test/server-only-hooks.mjs` **新件 +24**（untracked→commit 时 tracked）；`apps/web/tsconfig.tsbuildinfo` typecheck 构建副产物 R4 checkout 不计（见 §9-B R4）。

**字段⑤ 重 pin 全表（并线后树 `b8750ea5` EXEC 时点）**：web-logic.proof.ts blob 对起草树 `6a6c7843` **恒等**（`7b53aeaa` 双向 ls-tree 亲证·七面文件 ensure-ok.ts/web-logic.proof.ts/f5-hooks.mjs/interviews-actions.proof.ts/jobs/actions.ts/settings/actions.ts/rate-limit.service.ts + lib/api/server.ts 全 SAME 零漂移）；`pnpm-lock.yaml` rg 'server-only' 零命中复证·`apps/web/lib/api/server.ts:1` 先例形复证；R2/R3 勘正 §0 随附（R2=生产调用点恰 1 `jobs/actions.ts:8`·settings:13 仅注释；R3=:1219/:1216-:1228/:43-44/:14·:16）；修法落码后锚移：`:969→:975`（ensureOk 动态 import）·`:970→:976`（真 next/navigation import）·`:1219→:1225`（NEXT_REDIRECT 恰等断言）——漂移源=①c 头插 +6 行·字节零变。

**:969/:1219 桩后行为核（裁决项①行使语义面·§1-①c ④核）**：register() 于 body 首位行使（interviews-actions :18 同源时序）·静态 import 块先于 register 加载且基线绿在先证明其图内零 'server-only' 触面（否则起草期 tsx 已 MODULE_NOT_FOUND）→桩对本核零涉；`:975`（原 :969）动态 import ensure-ok：'server-only' 窄桩 resolve shortCircuit（未达 MODULE_NOT_FOUND）→`export {};` 静默成功；ensure-ok `:1` `import 'server-only'` 同桩静默；ensure-ok 内 `next/navigation` 非桩面→真模块加载；`:976`（原 :970）`await import('next/navigation')` 命中模块缓存=真 redirect；`:1225`（原 :1219）断言 `err.message==='NEXT_REDIRECT'` 恰等+digest 含 `/login?expired=1`——message 源=真 next/navigation，桩零涉=**绿维持（门1 PASS 行实证）**；原 `:969` 为取值行非断言臂·断言形零变化·登记零漂。

**字段⑥ 偏离清单**：①门7 实跑 **2187** 对预期 2186 差 +1——并线带入 5e-cleanup-sweep 卷受管件计数在预期推算外（方向不变 2187≤2200·如实记值沿「预期值按届时实跑」令面）；②门6 web lint 中间态 **602**（+1=`node:module` import 初插静态块尾部触 import/order 组序）→就地归组至头部 node: 内建组·register() 调用位不动（body 首位·§1-①c 形制不变）复跑 **601 恰等**——结构性归位非 retry-to-green（lint 规则/断言面零弱化零触·两次 lint 全量亲跑可复现）；③i6-gates 恰符臂红=预期内协议形承登（字段①-8）；④其余零偏离（§1 修法实质逐字落笔·§3 边界全守住·§5 零翻·七门值恰等）。

**字段⑦ pins 零翻声明**：§5 pins 十一值逐字零翻（haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false·gR45Closed=true·coveredCount=8·ms3EqualsR4Closed=false·PG-retained·公开 DELETE=503·g7SuiteGreen=false·r1Closed=false·脚注 actualSpendCny=null）；est live=0 兑现（十门全离线静态/进程内/隔离容器·零模型外呼·零生产操作·零 secrets 读用·零消耗）。

### §9-B 双审 P2 修订落点表（P2×5+R1-R5 · 随 EXEC 立项落·勘误处留痕）

| # | 审点 | 落点 | 处置（before→after） |
|---|---|---|---|
| R1 | cap 2192→2200 | §0.7+§2-7+§8-裁决③ | cap 2192→**2200**（sanction `3cd159dd` 已行使·「>2192 红停」→「>2200 红停」·余量注记随改） |
| R2 | 生产调用点恰 1 勘正 | §0.2-3 | 「恰 2：jobs/actions.ts+settings/actions.ts」→「**恰 1：jobs/actions.ts:8**（唯一 import 形）；settings/actions.ts:13 仅注释引用（零 import）」 |
| R3 | 行号勘正 | §0.2-3+§0.3+§0.4-2 | :1218→**:1219**+:1216-1227→**:1216-:1228**（web-logic 断言臂）·interviews :20-21→**:14/:16**（register 形）·rate-limit :42-43→**:43-44**（cleanupEveryOps=128）——均 EXEC 实树复核·结论零变 |
| R4 | tsbuildinfo commit 前 checkout | EXEC 工序 | `turbo typecheck --force` 构建副产物 `apps/web/tsconfig.tsbuildinfo` 现形 porcelain 后 `git checkout --` 复位→门9 恰 4 tracked 兑现（未 checkout 则恒 5 tracked 红——亲证） |
| R5 | server-only 三面语义差异登记 | 本 §9-字段⑤行为核段 | 三面互不干扰登记：**tsx 桩面**=静默成功（窄桩 shortCircuit `export {};`·裸解析面拦截）/**prod 客户端构建面**=构建期硬 throw（next 打包 alias 判 client 触面·R10 收紧本意）/**:1219（现 :1225）断言源面**=真 next/navigation（桩恰一项收窄零涉）——三面各自成立互不干扰 |
| 席1 P2-a | 「恰 3 码文件（含 1 新件）+本卷」措辞 | §1-件① 题+修法计数 | 「恰 3 码文件 + 1 新件」→「恰 3 码文件·含 1 新件，+本卷 .md=**4 tracked**」（与 §2-9 门9 判据对齐消歧） |
| 席1 P2-b | §3-7 精化 | §3-7 | 断言臂收口行勘正 :1227→**:1228**+明示「①c 头插（node:module import 归头部内建组+register() 置 body 首位）不涉断言面」=头插授权面与禁改面切分显式化 |

### §9-C STOP 翻面

三处权威 STOP（Status 行/§8/文末尾注）`draft:awaiting_pre_exec_dual`→**`executed:awaiting_post_prove_dual`**（§0-§8 勘误留痕随行·叙事原文不洗·append+勘正注形）·**STOP · `executed:awaiting_post_prove_dual`**——post-prove 双审归后继席·⛔push ⛔merge主线 ⛔force push。

### §9-补 post 双审 P2 随卷注记（2026-10-16 nail 席·post 双审会签 PASS 授权（席1 agent_95fac988+席2 重派 agent_8281b545）·append 注记形·§0-§9 上文零字节洗改·两件）

- **注记一（席1：§9 门 8 恰符臂「unexpected=3 文件」词面计数漂勘记→净树复跑实为 4 文件）**：§9 门 8 恰符臂红详注所载 unexpected 词面=`apps/web/lib/jobs/ensure-ok.ts,apps/web/test/web-logic.proof.ts,apps/web/test/server-only-hooks.mjs` 三文件——系 EXEC 期改动集判定时点词面（EXEC 期 i6 复跑在落卷前·本卷 §9 段尚未入改动集）；**净树复跑口径**（门脚本改动集判定=树净 vs HEAD~1·`scripts/i6-239-gates.proof.mjs` :34-36）下 EXEC 落卷 `0de077ad` 的改动集=**恰 4 tracked**（`git diff --name-only 0de077ad~1 0de077ad` 本席亲证=本卷 .md+ensure-ok.ts+web-logic.proof.ts+server-only-hooks.mjs·与 §9 门 9 diff 面同集）·本卷 `api-harden-family-REQUEST.md` 不在 i6-239 历史刀冻结申报 14 文件集（`scripts/i6-239-gates.proof.mjs` §恰符清单 expected 集亲读在卷）→**亦 unexpected=4 文件全本刀触面**。协议形定性不变（恰符臂红仍=协议形承登·i6-239 冻结申报面机制零触·非本刀新增红·仅文字计数 3→4 勘正）。
- **注记二（席1：tsbuildinfo checkout 操作注记）**：R4（§9-B）EXEC 期亲证 typecheck 副产物 `apps/web/tsconfig.tsbuildinfo` commit 前 `git checkout --` 复位为门 9 恰 4 tracked 前置工序；**markers/i6 门净树复跑同须先 checkout tsbuildinfo**（脏树 diffBase=HEAD 使改动集塌缩·恰符臂假绿机制=obs-family REQUEST §9-补 注记三同源机检亲证）·本 nail 波开工复证（工作树残留 tsbuildinfo 脏位·checkout 回滚后方行序 1 并线与序 3 docs:check 复跑）——后续席净树复跑沿此工序。

---

*nail 落卷 2026-10-16·post 双审会签 PASS（席1 agent_95fac988+席2 重派 agent_8281b545）后协调方派单 nail（本波唯一主线推送席）·序1 fetch+merge --no-ff origin/feat/mysql-schema-skeleton@`a9a8dcd9`（派单下界 tip≥a9a8dcd9 等号成立亲证=5c-obs nail 波 tip·merge `dda107d0` 双亲 0de077ad+a9a8dcd9·merge-tree 预演 EXIT=0 零冲突·开工前工作树 tsbuildinfo 副产物残留 checkout 回滚·⛔pull --rebase 未用）∥序2 顺携两支线并线（`git merge --no-ff line/sse-api-family@9af6bb99`=merge `9b2b508b` 零冲突 11 files +450/−4·`git merge --no-ff line/g7w-tail-seg-emit@30493162`=merge `51a06265` 零冲突 3 files +243·各 post 双审会签 PASS 随并落主线）∥序3 本卷 §9-补 post P2 随卷两件（append 注记形上文零洗=注记一 门 8 恰符臂 unexpected 词面 3→4 净树复跑勘记+注记二 tsbuildinfo checkout 操作注记）∥序4 SSOT 三处随卷（LEDGER 刀位图 5C-API-HARDEN 子刀行+配套管线 api-harden-family nail 行+checklist「Line api-harden-family nail」段·支线树内改主仓路径文件随支线推·⛔主仓单独 commit 未犯）∥序5 docs:check 复跑本席亲跑见卷∥序6 push（REMOTE-IS-ANCESTOR 机检后 `git push origin HEAD:feat/mysql-schema-skeleton` 直推非 force）+三支线 push origin∥序7 CI 结构面如实观察 PR #109·est live=0·actualSpendCny=null·⛔force push 未用·⛔pull --rebase 未用*

---

*API-HARDEN-FAMILY REQUEST · 2026-10-16 · executed:awaiting_post_prove_dual · base `feat/mysql-schema-skeleton` @`6a6c7843`（EXEC 序1 并线 `3cd159dd`=merge `b8750ea5`）· 分支 `line/api-harden-family` · 工作树 `../meetwise-aph` · 蓝本=LEDGER:87 5C 组行/:234 R10 行/:216 计件笔 + checklist:2680/:2683/:2685 + 前刀卷 api-harden-REQUEST.md §9.4-6 停手三证据 + hmac-consolidate-REQUEST.md 乙案定谳 · 形制沿 api-harden/queue-shutdown-phases 卷 §0-§8 同构 · 修法四条（R10 落码+复核两件+E4/E5 呈报）· 裁决四项 · est live=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
