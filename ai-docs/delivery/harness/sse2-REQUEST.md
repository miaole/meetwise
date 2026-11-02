# SSE2 REQUEST — SSE 双卷 post-prove 覆盖盲区收口断言刀（regw 残窗④⑤⑥⑦+RW-3-0 自证承接 · quizdx 盲区①②③+归因口径 · 恰 2 既有 proof 增断言·零产品码零 EXEC）（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-11-02 起草落卷即停 · 三处钉：本行 + §8 + 卷尾 · 同值 · pre-exec 双审两独立外席待派 · Ban self-approve · alone≠dual · est live=0 · markers=0 · ⛔push ⛔动主仓）

**席位**：meetwise SSE 双卷盲区收口起草席（docs-only 起草 · 协调方派单「SSE-BLINDSPOT 小刀·只起草不 EXEC」· ⛔push ⛔动主仓）。

**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`ai-docs/delivery/harness/regw-REQUEST.md`（blob `4d994610` @届 tip）§0.2-(h)「已声明残窗（r7 nail 登记 · post-prove 席2 覆盖盲区）」残窗④⑤⑥⑦ + 同节附注 RW-3-0 自证性质——本卷逐条闭合；②`ai-docs/delivery/harness/quizdx-REQUEST.md`（blob `36c338d0`）§9-post-prove「残面/盲区登记（post-prove 席2 后续刀建议）」盲区①②③ + 归因口径——本卷逐条闭合（其 P2-1 endGate 注释勘误项**派单未列**，登记不修，见 §0.3）；③协调方派单令（增强两既有 proof 断言 · 禁改产品码 · 断言预算 regw 44→~49 / quizdx 62→~65 · cap 届值步进沿 nk1 卷预登形「随届值如实采」）。

## §0 现状锚（起草席亲读 · file:line + blob 逐条 `git rev-parse origin/main:<path>` 亲算 @`da1dae1de`（full `da1dae1de5cfbd62e417ecba5233394f1fd6b005` = PR #189 nk1 合卷点 · `git fetch origin` 本 turn 亲跑两次·第一次取回 #189·第二次复核零新增）· **EXEC 立项照本节对届时 tip 再重 pin**——漂移如实改锚·结论不变则只更行号）

### 0.1 blob 锚（本刀触及面全件）

| 路径 | blob | 关键行锚 |
|---|---|---|
| `apps/api/test/sse-reg-window.proof.ts` | `d1e405e1`（990 行） | ARM_IDS `:54`-`:67` · EXTRA_IDS `:68` · RW-0 块 `:531`-`:600` · RW-3 臂 `:798`-`:839`（`pumpP=` `:811` · fire `:820`）· RW-5 臂 `:885`-`:914`（RW-5-2 `:909`-`:912`）· RW-6 臂 `:916`-`:964`（fixture `:925` · countAfterStart `:943` · M4 `:959`-`:961`）· LEDGER `:981` |
| `apps/api/test/quizdx-sse-http.proof.ts` | `b2abcf15`（991 行） | import `:30`-`:35` · QD2 g1 `:515` · g2 `:525` · DX2 g1 `:759` · g2 `:769` · QD4 settle `:676`-`:683` · QD4 tokenPayload `:709`-`:711` · QD4⑨⑩ `:723`-`:724` · DX4 settle `:918`-`:925` · DX4 tokenPayload `:950`-`:952` · DX4⑨⑩ `:964`-`:965` · ARM_BUDGET `:970`-`:973` · total `:976` |
| `apps/api/src/platform/sse-pump.ts` | `b93121dc`（223 行） | `:169` 首 waitFor · `:170` catch-up emit · `:189` 循内 dispose · `:190` break 门 · `:191` 重注册 · `:199` fetchMore · `:210` 末尾 dispose · `:213` registry.unregister |
| `apps/api/src/platform/sse-registry.ts` | `94eb93d5` | `count()` `:65`-`:67`（identity Map size）· unregister 幂等 `:55`-`:59` · `getSseRegistry` 单例 `:79`-`:82` |
| `apps/api/src/platform/sse-notify.service.ts` | `a20b0720` | `waitFor` `:197`-`:208` · dispose 幂等（remove Set）· `waitingCount` `:212`-`:216`（进程级跨 key 总量） |
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2` | `:136` 谓词（恰 1 命中·亲证 `grep -Fc` =1） |
| `apps/api/src/modules/diagnosis/diagnosis.service.ts` | `2c7c882e` | `:109` 谓词（恰 1 命中·亲证 =1） |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15` | `:914` 谓词（恰 1 命中·亲证 =1） |
| `scripts/ai-docs/public-text-policy.mjs` | `f7bd43e8` | `:285` `const MAX_FILES = 2_464`（届值·亲读） |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `bbcac1e2` | 四联动点 `:452` `i < 2_464` / `:459` `scannedFiles, 2_464` / `:477` `'ai-docs/f-2464.md'` / `:480` `FILE_LIMIT}:2465` + 注释 `:460`-`:461` |

### 0.2 盲区现实现定位（每条 = 登记原文出处 + 现实现亲读结论 + 闭合形）

| 盲区 | 登记出处 | 现实现（亲读 @届 blob） | 闭合形（本卷 §1 落点） |
|---|---|---|---|
| regw④ 三取数面谓词漂移无断言锁 | regw 卷 §0.2-(h) 残窗④ | `quiz.service.ts:136` / `diagnosis.service.ts:109` / `interview.service.ts:914` 三处逐字同谓词 `SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq`，参数序 `$1=stream_key / $2=lastId`、`>` 严格、`ORDER BY seq`——proof 现静态面（RW-0-1…RW-0-6、RW-6-S1…S8）只读 pump/控制器源，**三 service 文件零读取零断言**（`readSource` 调用点逐一亲点：`sse-pump.ts`×2 + 三控制器 + proof 自身，无 service） | 恰 3 条源 token 断言 RW-0-7a/7b/7c（三文件各一·token 恰 1 命中判据） |
| regw⑤ `:210` 末尾 `wait.dispose()` 删除不被发现 | regw 卷 §0.2-(h) 残窗⑤ | 退出路径尾 `:210` 是**终态/done/deadline/fetch-err/null/delta-写败**各 break/loop-condition 退出里 `:191` 重注册 waiter 的**唯一**摘除点（close 路径 `:189` 已摘、`:210` 幂等空转——故现臂收尾自证全走 close 路径、删 `:210` 全绿亲推）；RW-5 终态臂经 loop-condition 退出（done 置位于 `:207` emit、`:173` 判出），末轮 `:191` waiter#N 仅由 `:210` 摘——RW-5-2 只断 endCount/writesAfterEnd，**泵返回后无 waitingCount 读** | RW-5 臂增 RW-5-2b：`awaitPump` 后 `notify.waitingCount()===0`（删 `:210` ⇒ waiter#N 泄漏 ⇒ 红） |
| regw⑥ `:213` `registry.unregister` 挪位不被发现 | regw 卷 §0.2-(h) 残窗⑥ | `:124` register 在同步前缀、`:213` unregister 在全退出路径共用单点；RW-6-M4 只断 close 后 `registry.count()===0`——**泵运行中无任何 registry 读数**：提前注销（挪入循环前/` :190` 前）后 close 仍归零 ⇒ M4 绿 | RW-6 臂增 RW-6-M5：泵调用返回当拍（与 `countAfterStart` 同拍）`arm.registry.count()===1` |
| regw⑦ initial catch-up 功能性失效不被发现 | regw 卷 §0.2-(h) 残窗⑦ | **病灶在镜像 fixture 的 `initial.lastId=0`**（proof `:925`）：RW-6 镜像存储 `memStore.fetch = seq > lastSeq`，lastId=0 时循环首轮 `fetchMore(0)` 会把快照行**原样重取重写**——`sse-pump.ts:170` catch-up 整行删/`emit([])`/条件包裹后 M3 的 id 子序列仍 `[1,2]` ⇒ 全绿（变异亲推：catch-up 死 → fetchMore(lastSeq=0) 返回 [seq1,seq2] → 写出仍 [1,2]）。「`initial.lastId` 取快照 max(seq) 使窗行不可复得」=取 `lastId=1`（快照 max）后 fetchMore 恒 `seq>1`、seq=1 **只能**来自 `:170` catch-up | RW-6 fixture `initial.lastId: 0 → 1`（=快照 max(seq)）——零新增断言，既有 M3（谓词零改）转正为 catch-up 功能判据；RW-2 臂保留 `lastId=0`（真实 service 契约配对形 `rows=seq>lastId` 的等价类不丢） |
| regw⑧ RW-3-0 恒真自证 | regw 卷 §0.2-(h) 附注 | RW-3-0 断 `snapshotSeq<insertSeq<fireSeq`（`++clock` 构造恒真）+ 快照不含 seq=3——**非可判**；`:169` 同步前缀注册失败（变异三形态）时 RW-3-0 仍绿 | 增 RW-3-0b（自证类·EXTRA 台账不入臂计数）：泵调用返回当拍（fire 前）`waitingCount()===1`——可判（前缀破 ⇒ 0 ⇒ 红）；既有 RW-3-0 谓词零改 |
| quizdx① registry 注销挪位不被现有断言发现 | quizdx 卷 §9-post-prove 盲区①（变异实测主门 62/62 绿） | HTTP 世界控制器走 `?? getSseRegistry()` 单例（`sse-pump.ts:85`）；settle 门（QD4 `:677`-`:683` / DX4 `:919`-`:925`）只读 `waitingCount`/`tokenSubscriberCount`，**registry 计数零读**——`:213` 删/挪（漏式）⇒ 每连接泄漏 +1 ⇒ 全绿 | QD4 settle 后增 QD4⑪：`getSseRegistry().count()===0`（产品红 EXIT1·沿归因口径方向）；DX4 对称面登记残面（§0.3·同一产品行已被 QD4⑪ 检测覆盖） |
| quizdx② token wire 键集未钉 | quizdx 卷 §9-post-prove 盲区②（M-E `v/streamKey` 泄漏变异实测绿） | QD4⑩ `:724` / DX4⑩ `:965` 逐字段读 `tokenPayload.text/seq/attemptKey`——**键集不封顶**：`sse-pump.ts:159`-`:166` 若泄漏 `v`/`streamKey` 进 data，逐字段读仍绿 | QD4⑫ / DX4⑪：`isDeepStrictEqual(tokenPayload, { attemptKey:'att-i', seq:2, text:'tok-neutral' })` 全对象钉（键多/键少/值偏全红；复用既有 `tokenPayload` 解析变量与 `node:util` 既有 import，零新解析） |
| quizdx③ QD2⑨/DX2⑨ 无注入激励源 | quizdx 卷 §9-post-prove 盲区③ | QD2/DX2 臂零 `pg_notify(interview_token_ch)` 注入 ⇒ 「零 token_delta」近恒真 | **归类护栏**（卷内口径）：QD2⑨/DX2⑨ 承重 → 纯护栏；proof 零改（标签/谓词零触）；归类 承重 58→56 + 纯护栏 4→6（=62 不变）——择卷内建议的「归类」支，不择「补注入」（§1.3 否决） |
| quizdx④ 归因口径 | quizdx 卷 §9-post-prove 归因口径 | QD2 g1/g2（`:515`/`:525`）、DX2 g1/g2（`:759`/`:769`）回执门谓词=ids 全序字面等值——LED 重放回归先破**门**（env EXIT2 洗白）后到断言 | 4 门改 `ids().length >= N`（QD2 g1/g2 `>=2`·DX2 g1 `>=1`·g2 `>=2`）：门降为纯到达门，LED 语义判红移交既有 QD2②/QD2④/DX2②/DX2④ assertFrameSet（exp 已严格、EXIT1 产品红）；回执门非断言条（原卷钉），改门≠改断言谓词 |

### 0.3 同卷登记不修面（派单未列·留痕）

- quizdx 卷 P2-1（`quizdx-sse-http.proof.ts:464` endGate 注释「status=0 归 env 分口」与实现不符·实际落编号①判产品红·保守向无洗绿）：**不在本刀修面**（协调方派单盲区清单未列）；本刀改动集不含该行，留后续刀/协调方处置。
- regw⑥ 残余亚面：unregister **挪入单一退出分支**（如仅 close 分支内注销）时 RW-6-M5（泵运行中读数）+M4（close 后读数）组合仍绿、而终态/deadline 路径泄漏——本刀不另铺面（派单处方即「泵运行中 count 读数」），登记为已知残余；HTTP 面同形残余由 §0.2 quizdx① 行同注。
- regw⑤ 变异边界：`:210` 删除的检测面=**含 `:191` 重注册的退出路径**（终态/取数失败/null/delta 写败/deadline/loop-condition）；close 路径 `:189` 先摘不受影响——RW-5-2b 判据正是前者形态。

### 0.4 checklist `:1660` 原文不翻（翻面权归协调方）· 本刀零 SSOT 触·零行旗改·零 covered 翻。

---

## §1 修法（恰 2 既有 proof 行内增强 · 零产品码零迁移零新文件零 Key · 增断言不改既有断言谓词）

**授权边界（派单原文 + 本卷 §3 显式解除授权范围）**：两卷 §5 曾 Ban「改既有 proof」——本卷解除范围**仅限**以下四类、逐处点名锚定；出此范围即越界红停：
1. **增断言**：regw +5 臂断言（RW-0-7a/7b/7c、RW-5-2b、RW-6-M5）+1 自证类（RW-3-0b·EXTRA 台账）；quizdx +3 断言（QD4⑪⑫、DX4⑪）。**既有断言谓词零改**（每条既有 A() 调用的布尔表达式逐字不动）。
2. **fixture 一处**（regw⑦）：RW-6 镜像 `initial.lastId: 0 → 1`（proof `:925` 单行；=快照 max(seq)；使既有 M3 转正为 catch-up 功能判据——非断言改动）。
3. **回执门四处**（quizdx④ 归因口径）：QD2/DX2 四门谓词改 `ids().length >= N`（门非断言条·原卷钉「回执门不入断言预算」；每门旧/新形逐字见 §1.2-E4）。
4. **台账/预算常数**（非断言谓词）：regw `ARM_IDS` +5、`EXTRA_IDS` +1、LEDGER 行 `/44`→`/49`、`/48`→`/54`、文件头注释计数面同步；quizdx `ARM_BUDGET` QD4 10→12 / DX4 10→11、`reg.length === 62` → `=== 65`、FACET 行 `/62`→`/65`、臂头注释条数同步。

### 1.1 regw 侧（`apps/api/test/sse-reg-window.proof.ts` @`d1e405e1`）——44 → 49 臂断言（+5）· 去重 PASS 行 48 → 54

- **E1（④）静态块 RW-0-6 之后新设三断言**（RW-0 块内、RW-0-6 的 A() 调用后）：
  - **RW-0-7a**：`const quizSvcSrc = readSource('../src/modules/quiz/quiz.service.ts')`，判据 `countOccurrences(quizSvcSrc, 'WHERE stream_key=$1 AND seq>$2 ORDER BY seq') === 1`。
  - **RW-0-7b**：同形 `diagnosis.service.ts`；**RW-0-7c**：同形 `interview.service.ts`。
  - 判据语义：token 恰 1 命中=谓词形（参数序 `$1=stream_key/$2=游标` + 严格 `>` + `ORDER BY seq`）在位；去 `ORDER BY` / 改 `>=` / 参数序换 / 谓词改名漂移 ⇒ 0 命中 ⇒ 红；复制出第二处同谓词 ⇒ 2 命中 ⇒ 红。锚 blob：`98edbeb2`/`2c7c882e`/`a8ae0d15`（命中行 `:136`/`:109`/`:914`·亲证每文件恰 1 命中）。keyless 零变（`readFileSync` 面非 import 面）。
- **E2（⑤）RW-5 臂、RW-5-2 的 A() 之后、`await notify.stop()` 之前**：
  `A('RW-5-2b', 'RW-5-2b 泵返回后 notify.waitingCount()===0（末位 waiter 仅由 sse-pump.ts:210 尾 dispose 摘除·删行即泄漏红）', notify.waitingCount() === 0, { waiting: notify.waitingCount() })`。
  判据语义：本臂经终态 loop-condition 退出，末轮 `:191` waiter 仅 `:210` 可摘；变异「删 `:210`」⇒ 泵返回后计数 1 ⇒ 红。`dispose` 幂等（`remove` Set 语义·`a20b0720` 亲读）⇒ 正常路径零假红。
- **E3（⑥）RW-6 臂、`const countAfterStart = notify.waitingCount();`（`:943`）紧邻增 `const registryAtRun = arm.registry.count();`，RW-6-M1 的 A() 之后**：
  `A('RW-6-M5', 'RW-6-M5 泵运行中 registry.count()===1（:124 register 同步前缀在位·:213 注销提前/挪位即红）', registryAtRun === 1, { registryAtRun })`。
  判据语义：`register` 在泵体同步前缀（`:124`，先于首个 `await`）⇒ 泵调用返回当拍必已在册；`:213` 挪前（循环前/` :190` 前）⇒ 当拍 0 ⇒ 红。单一退出分支形态的残余见 §0.3。
- **E4（⑦）RW-6 fixture 单行**（`:925`）：`const initial = { lastId: 0, rows: store.rows.slice() };` → `const initial = { lastId: 1, rows: store.rows.slice() };`（+行尾注：lastId=快照 max(seq)，fetchMore 恒 `seq>1` ⇒ seq=1 唯一来源=`:170` catch-up ⇒ 既有 M3 谓词零改转正为 catch-up 功能判据）。绿路复算：catch-up 写 id:1 → 60ms 兜底 → `fetchMore(1)`=[seq2] → 写 id:2 ⇒ M1/M2/M3/M4 期望值零变全绿；变异「`:170` 删/`emit([])`/条件包裹」⇒ M3 得 [2] ⇒ 红。RW-2 臂保留 `lastId=0`（真实 `events()` 契约 `rows=WHERE seq>lastId` 配对形的等价类不被本 fixture 替换——诚实注：`{lastId:1, rows:[seq1]}` 非 service 可产配对形，属**检测强化形**，泵侧输入合法）。
- **E5（RW-3-0 承接）RW-3 臂、`pumpP` 赋值后、`fire(arm.client, key)` 前**：`const countAtSyncReturn = notify.waitingCount();` + 自证类断言（aux=true）：
  `A('RW-3-0b', 'RW-3-0b 泵调用返回当拍（fire 前）waitingCount()===1（:169 同步前缀注册可判断言·自证类不入臂计数）', countAtSyncReturn === 1, { countAtSyncReturn }, true)`。
  判据语义：前缀破（首个 `await` 前移）⇒ 当拍 0 ⇒ 红（与变异三 RW-6-M1 同理、在本臂自有读点兑现）；既有 RW-3-0 谓词零改、其「自证」归类沿用原卷口径。EXTRA_IDS 增 `'RW-3-0b'`。
- **E6（台账）**：`ARM_IDS` 按 `:55`-`:67` 既有分组次序插入 `'RW-0-7a','RW-0-7b','RW-0-7c'`（RW-0-6 后）、`'RW-5-2b'`（RW-5-2 后）、`'RW-6-M5'`（RW-6-M4 后）→ 49；`EXTRA_IDS` 尾插 `'RW-3-0b'` → 5；LEDGER 行 `arm_assertions=${armPass}/44  dedup_pass_lines=${dedupPass}/48` → `/49` 与 `/54`；文件头 `:15`-`:18` 计数注同步（静态 25=RW-0 10+RW-6 15 · 动态 24=PA-0 1+RW-1 4+RW-2 5+RW-3 3+RW-4 3+RW-5 3+RW-6 5；自证 2=INJECTION+RW-3-0b；PA-0 fake 契约 3 项；去重 54）。
- **断言预算：44 → 49**（派单预算 ~49 恰落）；墙钟增量 ≈0（全部新增读数为同步读+3 次 readFileSync）。

### 1.2 quizdx 侧（`apps/api/test/quizdx-sse-http.proof.ts` @`b2abcf15`）——62 → 65 断言（+3）· 逐臂 {5,9,7,**12**,5,9,7,**11**}

- **E1（①）import 区（`:34` 后）**：`import { getSseRegistry } from '../src/platform/sse-registry.ts';`（该路径已在 runner 收据 26 件源清单内·quizdx 卷 §1 注册面④亲点·零收据面变更）。**QD4 settle 块（`:677`-`:683`）之后、`const expQz` 之前**：
  `A('QD4⑪ settle 后 getSseRegistry().count()===0（三连接 abort+settle 落定后在册清零·sse-pump.ts:213 删/挪漏式即泄漏红）', getSseRegistry().count() === 0)`。
  判据语义：abort 路径泵经 `:190` break→`:210`→`:213` 同步尾；settle 门已等 `waitingCount/tokenSubscriberCount` 归基线（=0），单线程原子尾保证 poll 观察到 0 时 `:213` 已执行（`:189`→`:222` 无 await·亲读）；`:213` 删行/挪入不走分支 ⇒ count ≥1 ⇒ 产品红 EXIT1（归因口径方向）。DX4 对称面不另设（§0.3 残面登记）。
- **E2（②）QD4⑩ 之后**：`A('QD4⑫ token wire 键集恰 {attemptKey,seq,text}（isDeepStrictEqual 全对象钉·v/streamKey 泄漏即红）', isDeepStrictEqual(tokenPayload, { attemptKey: 'att-i', seq: 2, text: 'tok-neutral' }))`；**DX4⑩ 之后同形**（id=DX4⑪·载荷 attemptKey 同为 `'att-i'`·`{v:1,streamKey:'IV_ISO_DX',…}` 注入形亲点 `:907`）。复用既有 `tokenPayload`（QD4 `:709`-`:711` / DX4 `:950`-`:952`·已自 snapIv 首 token 帧解析）与既有 `isDeepStrictEqual` import（`:33`）——零新解析零新 import。判据语义：`sse-pump.ts:161`-`:164` 若泄漏 `v`/`streamKey`/未来新增键 ⇒ 键集超 ⇒ 红；缺键/值偏 ⇒ 红。
- **E3（预算台账）**：`ARM_BUDGET` `['QD4', 10]`→`['QD4', 12]`、`['DX4', 10]`→`['DX4', 11]`（`:971`-`:972`）；`const totalOk = reg.length === 62` → `=== 65`（`:976`）；FACET 行 `total=${reg.length}/62` → `/65`（`:978`）；QD4/DX4 臂头注释「10 条」→「12 条」/「11 条」（注释面）。
- **E4（④ 归因口径·回执门四处·门非断言条）**：
  - QD2 g1（`:515`）：`until(() => r1.ids().join(',') === '2,3', 1500)` → `until(() => r1.ids().length >= 2, 1500)`（LED 语义判红移交 QD2②）
  - QD2 g2（`:525`）：`until(() => r2.ids().join(',') === '4,5', 1500)` → `until(() => r2.ids().length >= 2, 1500)`（移交 QD2④）
  - DX2 g1（`:759`）：`until(() => r1.ids().join(',') === '2', 1500)` → `until(() => r1.ids().length >= 1, 1500)`（移交 DX2②）
  - DX2 g2（`:769`）：`until(() => r2.ids().join(',') === '3,4', 1500)` → `until(() => r2.ids().length >= 2, 1500)`（移交 DX2④）
  语义：LED 重放/窗行丢等回归不再先破门（env EXIT2 洗白），由既有 assertFrameSet 严格 exp（`[2,3]`/`[4,5]`/`[2]`/`[3,4]`）判产品红 EXIT1；门保留「catch-up 非空=响应头已冲刷+waiter 已注册」的到达门职（P1-5/P2⑧ 面不弱化：`>=N` 仍要求 N 帧到达）。
- **E5（③ 归类·卷内口径零码改）**：QD2⑨/DX2⑨ 归类**纯护栏**（无注入激励源·近恒真·判别力不认领）；归类表 承重 58→**56** + 纯护栏 4→**6**（=65 内·条数不变）；proof 内标签/谓词零触。
- **断言预算：62 → 65**（派单预算 ~65 恰落）；八臂逐臂 {QD1:5, QD2:9, QD3:7, QD4:12, DX1:5, DX2:9, DX3:7, DX4:11}。

### 1.3 否决表（落选项诚实留痕）

| 落选项 | 否决/登记理由 |
|---|---|
| quizdx③ 择「补注入」（QD2/DX2 加 token 注入激励） | 需动 QD2/DX2 臂时序（新激励点+门+窗），面大于派单处方（「补注入**或归类护栏**」二择）；归类护栏零码改、预算恰合 65。补注入留后续刀。 |
| ⑤⑥ 并入既有 RW-5-2 / RW-6-M4 谓词 | 违「仅增断言不改既有断言谓词」硬约束 → 独立新 ID。 |
| ⑦ 增「catch-up 功能」新断言于旧 fixture | 旧 fixture（lastId=0）下 fetchMore 重取掩蔽 catch-up 死——新断言恒真=自证重演；转正既有 M3（fixture 一行）才是可判闭合。 |
| quizdx DX4 对称增 registry settle 断言 | 检测同一产品行（`:213`），QD4⑪ 已承担检测职；+1 会破 65 预算算术；对称面登记残面（§0.3）。 |
| 改 runner/两 package.json/收据面 | 本刀零新 proof 零新注册（两 proof 均已在册）→ 无注册面；receipt 源清单 26 件已含 `sse-registry.ts`（QD4⑪ 新 import 的所属文件）→ 零登记面变更。 |
| 产品码修法（如泵侧关窗/`:210`/`:213` 形改） | 越界：本刀 proof-only 只证不修（两源卷同款否决沿用）。 |

---

## §2 验收门矩阵（起草门本 commit 适用 + EXEC 届树届时重 pin）

1. **docs:check（亲跑·EXIT 原值）**：`node scripts/ai-docs/check-docs.mjs` → 起草前本树 **EXIT=0 · scanned 2464 = cap 2464 恰等**（届 tip `da1dae1de`·MAX_FILES `:285` 亲读）；本卷落卷后 **scanned 2465 = cap 2465**（CAP-SANCTION-2465·§3-C）。EXEC 期两 proof 行内改零新受管件 → terminal 2465 零新增；**在飞各线任一先并线即届值重算如实采（Ban 按本卷预登数硬行使）**。
2. **PTP 公开文字政策（亲跑）**：`node scripts/ai-docs/public-text-policy.proof.mjs` → **12/12 EXIT=0**（起草 commit 已随 cap 2465 形亲跑）。
3. **markers 四类标记词（词面运行时组装·同 `scripts/i6-239-gates.proof.mjs:152`-`:163` 口径）+ 行首冲突标记**：起草 commit 改动集（本卷 1 `.md` + 两 policy 脚本）grep **零命中**（亲跑·卷内不复抄防自指）；EXEC 期改动集=两 proof 行内改 → 同口径复跑零命中。
4. **diff 面机检**：起草 commit `git diff --numstat origin/main` **恰 3 tracked 路径**=本卷 `.md` + `scripts/ai-docs/public-text-policy.mjs` + `scripts/ai-docs/public-text-policy.proof.mjs`；EXEC 期=两 proof（`sse-reg-window.proof.ts` + `quizdx-sse-http.proof.ts`）行内改 + 收据 `.log`（若落·∉TEXT_EXTENSIONS 不计）——多任何未登记 tracked 路径即停。
5. **EXEC 主门（届时）**：`pnpm -C apps/api prove:sse-reg-window` EXIT=0·LEDGER `arm_assertions=49/49 dedup_pass_lines=54/54 failures=0`；`pnpm quizdx:sse-http:prove` EXIT=0·预算逐臂 {5,9,7,12,5,9,7,11}·总数 65；`pnpm -C apps/api typecheck` EXIT=0；eslint 不新增 warning（帽以 EXEC 实测为准）；**变异自检三则（必做·同 turn 还原·`git diff --exit-code` 零残留·读数入收据）**：〔变异四〕删 `sse-pump.ts:210` → 期望红=RW-5-2b（其余绿）；〔变异五〕`:213` unregister 挪至 `:190` 前 → 期望红=RW-6-M5 + QD4⑪ 若 HTTP 面同跑（其余绿·单一分支形态不属本变异判据面）；〔变异六〕`:170` → `emit([])` → 期望红=RW-6-M3（新 fixture 下；对照旧 fixture 同变异 M3 绿=残窗⑦原貌实证·一次性对照可入收据不入门）。
6. **行/列冻结**：EXIT0=case≠covered · `:1660` 行零改 · 两源卷（regw/quizdx）字节零改 · Ban 借本刀收据宣残窗/盲区「已关闭」（闭合读数=本刀断言绿，行面翻面权归协调方）。

## §3 范围外（越界即 FAIL）+ CAP-SANCTION 登记

1. **产品码零触**：`apps/*/src`、`packages/*/src`、migrations 零 diff。变异自检临时触码不在此列（carve-out 沿 regw 卷 §3-1 形：同 turn 还原、`git diff --exit-code -- apps/api/src/platform/sse-pump.ts` 亲证零残留、不 commit）。
2. **既有 proof 改动面=§1 授权边界四类逐处点名**；出名单即 FAIL。两源卷（`regw-REQUEST.md`/`quizdx-REQUEST.md`）与其他 proof/harness 仪器零触。
3. **SSOT/登记文件零改**：checklist、case-matrix、coverage-matrix、current-runtime-truth、台账卷零改；收据 additive（仅 `.log`·`.md`/`.txt`/`.json` ∈TEXT_EXTENSIONS 计面必越 cap·Ban）。
4. **runner/CI/两 package.json 零触**（零新 proof 零新注册）。
5. **HA/SLO/发布叙事零涉**；Ban 借读数宣生产 30s/槽容量/跨副本（各归其源卷非 claim 面）。
6. **零 Key 零配置**：不读 `.env*`、零模型外呼。
7. **CAP-SANCTION-2465 登记（C 编号·沿 nk1 卷预登形「随届值如实采」）**：届值如实采 origin/main `da1dae1de`=#189 nk1 合卷已落——**届扫 2464 = cap 2464 恰等零余量**（`MAX_FILES = 2_464` `:285` 亲读 + docs:check 起草前亲跑 EXIT=0 scanned 2464 亲证）+ 本卷 REQUEST 受管 1 件 = **2465 必超** → 起草 commit 即行使 **cap 2464→2465 恰等零多放**：①`public-text-policy.mjs` `MAX_FILES 2_464→2_465` + 链区 `CAP-SANCTION-2465` 注记；②`public-text-policy.proof.mjs` 四联动点 **`i < 2_465` / `scannedFiles, 2_465` / `'ai-docs/f-2465.md'` / `${FILE_LIMIT}:2466`** + 注释 `第 2466 个注入路径`/`PTP_FILE_LIMIT:2466` + 链区注记（四处同一届值·禁一处手改）。EXEC 期两 proof 行内改零新受管件 → terminal 2465 零新增。**届值重采条款**：EXEC/并线期若在飞线（任一含 policy 触面分支）先并线致届扫 >2464，cap 随合并树实测如实采恰等步进（dual-keep 预案沿 CAP-SANCTION-2461 CWN 收官并线先例形：main 侧后至注记全保留史录并留+本支改写届值）；**Ban 按本卷预登 2465 硬行使**。先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。

## §4 依赖

- 机制源全在树（§0.1 blob 亲算）；两 proof 均在册（root/`apps/api` package.json 注册行既有·quizdx runner 五位注册既有）——本刀零注册面。
- `getSseRegistry` 单例（`sse-registry.ts:79`-`:82`）惰性建、无副作用（仅 Map 包装）⇒ quizdx 新 import 不破 boot 世界（该文件已在收据源清单 26 件）。
- regw 三 service 源读取=本 proof 既有 `readSource`（`node:fs` + `import.meta.url` 相对寻址）零新依赖。

## §5 Ban 列表 + pins

**Ban**：push/force-push/动主仓；自批（pre-exec 双审两独立外席·alone≠dual）；retry-to-green（红即停·attempts 台账）；invent covered（含借本刀读数宣残窗/盲区 closed/翻 `:1660` 行）；触产品码/迁移/runner/两 package.json/SSOT；**出 §1 授权边界的既有 proof 改动（含改既有断言谓词/断言标签/门超四处/收据面）**；改共享 lint 配置；live key/secrets/.env；顺带升级依赖；借读数宣 HA/SLO/发布叙事；收据落 `.md`/`.txt`/`.json`（∈TEXT_EXTENSIONS 计面·只落 `.log`）；Ban 按预登 cap 硬行使（届值如实采）。

**pins（十一值照抄同族卷·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
**本卷附加钉**：Not HA · 断言预算 regw 49 / quizdx 65（逐条判据 §1）· 既有断言谓词零改 · ⑦ 闭合形=fixture 一行+既有 M3 转正（零新增断言）· cap=2465（**随届值如实采=唯一豁免项**）· 两源卷字节零改 · `:1660` 行零改。

## §6 keyless 判定 + est live=0

- regw 侧 keyless 零变：三 service 文件走 `readSource`（readFileSync）非 import；新增断言全部同步读/源 token 读；零 DB 零 PG 零 HTTP 零模型零环境变量。
- quizdx 侧 EXEC 期世界零变：boot 形、隔离 PG、真 HTTP、AUTH_DEV_HEADER 沿原卷；新 import `getSseRegistry` 为纯内存单例（惰性 Map）零 IO。
- est live=0（起草 turn 与 EXEC 期同：零外呼零 Key 零生产操作零消耗）。

## §7 markers=0（卫生声明）

本刀改动集（起草 turn=本卷 1 `.md` + 两 policy 脚本 cap 步进；EXEC 期=两 proof 行内改+收据 `.log`）四类标记词（词面运行时组装·同 i6-239 口径）+ 行首冲突标记 grep **零命中**（起草席亲跑·卷内不复抄防自匹配）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：Status 行 + 本节 + 卷尾 · 同值）。** 开工三条款（未履行不得 EXEC）：①pre-exec 双审两独立外席 BOTH PASS 落卷；②协调方明示 EXEC 授权；③§0 全量对届时 tip 重 pin——两 proof/`sse-pump.ts`/三 service 谓词/两 policy 脚本任一漂移且结论受疑即回炉。
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/行锚漂移（尤其三 service 谓词行、`sse-pump.ts:169/:170/:189/:191/:210/:213`、两 proof 臂结构、policy 四联动点行号）或两 proof 被在飞刀改写 → 停·重 pin 回炉。
- **机制不满足**：EXEC 期新断言基线红（如 QD4⑪ 在健康世界 count≠0、RW-6 新 fixture 下 M3 红等）⇒ 等价类/判据推演被证伪 → 红停上报（Ban 改断言迁就；若属产品真回归 → EXIT1 诚实保留+backlog 登记升级协调方）。
- **越界需要**：修法诉求超出 §1 授权边界（需产品码/新 proof/改断言谓词/第四处以外门改）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check > cap / PTP 红 / markers 命中 / typecheck / lint 超）→ 停·stash 对照亲证基线·如实登记·Ban 借机修。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-11-02 起草落卷即停 · 前无状态 · pre-exec 双审两独立外席待派 · Ban self-approve · alone≠dual · ⛔push ⛔动主仓 · est live=0 · markers=0 · 本节 append-only 不改既有字）。

---

*SSE2 REQUEST · 2026-11-02 起草落卷 · 认领=regw 卷 §0.2-(h) 残窗④⑤⑥⑦+RW-3-0 自证承接（blob `4d994610`）+ quizdx 卷 §9-post-prove 盲区①②③+归因口径（blob `36c338d0`）· 修法=恰 2 既有 proof 行内增强（增断言不改既有断言谓词：regw +5 臂断言+1 自证类=44→49·quizdx +3=62→65；fixture 一处 `initial.lastId 0→1`=⑦ 闭合；回执门四处 `ids().length >= N`=归因口径；台账/预算常数随动）· 零产品码零迁移零新文件零注册面零 Key · cap **CAP-SANCTION-2465**（届扫 2464=cap 恰等 + 本卷 1=2465 必越·2464→2465 恰等零多放·四联动点 2_465/f-2465.md/:2466·随届值如实采=附加钉唯一豁免项·Ban 按预登硬行使）· 起草门亲跑：docs:check EXIT=0（起草前 scanned 2464=cap 恰等→落卷后 2465=cap 恰等）· PTP 12/12 EXIT=0 · markers 零命中 · pins 十一值零翻 · 基线 `origin/main` @`da1dae1de`（#189 nk1 合卷点·fetch 本 turn 两次亲跑）· 分支 `line/sse2-draft` · 工作树 `meetwise-sse2`（派单令原样重建）· est live=0 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行·同值）· ⛔push ⛔动主仓*
