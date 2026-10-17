# SSD-EGRESS-MANIFEST REQUEST — PR #109 verify step 12 provider-egress 静态清单四错未登记补登刀（session-summary.proof.ts 消费者 +1+三 env 登记 · manifest +4 entry + prove 计数同步 51→52 · 恰 3 tracked · ssd-egress-manifest 战役 · 快速链起草落卷）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-14 EXEC 落卷翻面·原 `draft:awaiting_pre_exec_dual` 起草态保全于 git 史 `673f4bd3`·快速链=起草→自审（沿 rev 确认席先例·窄域五项全 PASS 落卷）→EXEC→STOP·门矩阵八门全绿·post 双审待派 · est live=0 · ⛔push）

**席位**：ssd-egress-manifest 诊断+起草+EXEC 一体席（协调方派单 2026-10-14·#51 nail 席如实上报·PR #109 synchronize 新曝红 step 12 口径指派·快速链授权链=派单 brief 明示「起草落卷后自审→EXEC→STOP」）。
**基线**：`feat/mysql-schema-skeleton` @ `039d9baa`（origin tip 亲证=session-summary-deepen nail 序5 SSOT commit·PR #109 手术 head）· 分支 `line/ssd-egress-manifest`（本席 `git worktree add ../meetwise-seg -b line/ssd-egress-manifest origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `039d9baa` 亲证）· 工作树 `meetwise-seg`（仓根同级）。
**立项出处**：①协调方派单 brief（2026-10-14·PR #109 verify 红=step 12 模型供应商出站静态清单 `provider_egress_inventory_invalid`·简报仅点名 `MODEL_TEST_TRANSPORT_OVERRIDES` 一错——实测漂移见 §0.2）；②本起草席本树 @`039d9baa` 亲跑复现（inventory EXIT=1 四错+prove EXIT=1·全文=§1.2）；③结构范本 `ai-docs/delivery/harness/dbhy1-p4-fix-REQUEST.md`（§0-§9 形制）+计数同步先例 `ai-docs/delivery/harness/ci-red-clear-REQUEST.md:100/:108/:192`（件⑤ 49→51 sanction 形）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`039d9baa`·**EXEC 立项照本节对届时 tip 再重 pin——基线漂移如实改锚·结论不变则只更行号**）

### 0.0 防重双对表 + 在飞交叠复核

- `git worktree list` 建后实测：主仓+既有诸树+本 seg 树——无第二 ssd-egress 同名树；`git branch --list "line/ssd-egress*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg ssd` 建前零命中→落卷后本卷唯一无撞名。
- **在飞交叠复核（EXEC 立项日必做）**：本刀触面=`ai-docs/architecture/ai/provider-egress-inventory.json`+`scripts/provider-egress-inventory.proof.mjs` 两文件（现 blob `c2d7b9cc`/`3932fad7`）。届时对各在飞分支执行 `git log -1 --` 逐一复核·任一分支顶存在主线 `039d9baa` 之后对该两文件的新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`039d9baa`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `ai-docs/architecture/ai/provider-egress-inventory.json` | `c2d7b9cc`（2125 行） | **environmentReferences 计 328（python3 解析亲证）·MODEL_TEST_TRANSPORT_OVERRIDES 既有 19 entry·本文件零登记**；三插入点=`:1921-:1925` MODEL_API_KEY@resume-grounding（test-fixture）·`:2006-:2010` MODEL_ENDPOINT_PROFILE@resume-grounding（test-isolation）·`:2031-:2035` MODEL_TEST_TRANSPORT_OVERRIDES@resume-grounding（test-isolation）·消费者插入点=`:153-:156` openai-compatible-chat consumers 数组内 resume-grounding entry（local-adapter-test）·openai-compatible-chat consumers 计 20·全 manifest 消费者对计 51 |
| `scripts/provider-egress-inventory.proof.mjs` | `3932fad7`（79 行） | **`:28` TC-MODEL-002-E3-inventory-main valid 断言（改前红点·与 inventory 同源四错）·`:31` `assert.equal(result.stats.registeredConsumerSourcePairCount, 51)`（本刀同步点 51→52）** |
| `scripts/provider-egress-inventory.mjs` | `b196269c`（280 行·只读引用零触） | `:21` REQUIRED_CLASSES 四值枚举（production-runtime/manual-live-smoke/manual-evaluation/local-adapter-test）·`:125-:127` 扫描域 directSources=configSources=apps+packages（env 加 scripts·`:217-:219`）·`:213-:228` env 对账（`:216` 词边界正则·`:222-:225` entry 形=source fileInside+class 非空串·`:226-:227` unregistered/not_found 双向）·`:167-:169` consumer 对账（factory 调用词匹配·双向）·`:263` registeredConsumerSourcePairCount=consumers 数直接函数·`:276` `throw provider_egress_inventory_invalid`（CI 红名出处） |
| `apps/worker/test/session-summary.proof.ts` | `8aa8c7ef`（202 行·只读引用零触） | **`:151` MUTATED 六 env 名数组·`:153` initial Map·`:156` NODE_ENV=test·`:157` `delete process.env.MODEL_TEST_TRANSPORT_OVERRIDES`·`:158-:159` delete COST_ENFORCEMENT/ENDPOINT_PROFILE·`:160-:161` set MODEL_API_KEY/MODEL_NAME·`:162-:165` globalThis.fetch mock（零外呼）·`:166` `openAICompatibleClient()` 直调（consumer 面根因）·`:178-:181` finally 全量恢复** |
| `.github/workflows/ci.yml` | `d2dc8d2c`（365 行·只读引用） | `:77-:81` step「模型供应商出站静态清单（observe-only，非发布证据）」·`:80` `pnpm provider-egress:inventory`·`:81` `pnpm provider-egress:prove`（step 12 两半·双红同源） |
| `apps/worker/test/resume-grounding.proof.ts` | `f3af4b61`（360 行·只读先例） | `:145-:155` wire-fence 臂与 session-summary `:151-:165` 逐字同族（同 MUTATED 六名同序+同 delete 三连+同 fetch mock+同 finally 恢复形）·其 manifest 登记形=本刀逐字模板 |

### 0.2 派单简报漂移登记（结论零变·如实改锚——两漂移均为门机检强制·非裁量扩面）

1. **简报口径「引用 MODEL_TEST_TRANSPORT_OVERRIDES 一错」→实测四错同源**：本树亲跑 `node scripts/provider-egress-inventory.mjs` EXIT=1 逐字=「`adapter_consumer_unregistered:openai-compatible-chat:apps/worker/test/session-summary.proof.ts`+`environment_reference_unregistered:MODEL_API_KEY:…`+`environment_reference_unregistered:MODEL_ENDPOINT_PROFILE:…`+`environment_reference_unregistered:MODEL_TEST_TRANSPORT_OVERRIDES:…`」——:151 MUTATED 数组六 env 中三者在册名+`:166` 直调 `openAICompatibleClient()` 触 consumer 对账面。简报只点名其一系 CI 日志摘引取样·四错同一根因（件⑨ 新 proof 未同步登记面）·绿门须四错全清。
2. **简报口径「单文件 manifest 登记·diff 恰 2 tracked·零码面零断言面」→实测恰 3 tracked**：CI step 12 两半（ci.yml `:80` inventory+`:81` prove）——manifest 补登 1 consumers entry 后 `registeredConsumerSourcePairCount` 51→52（inventory.mjs `:263` consumers 数直接函数）·prove `:31` 断言 51 必红→**step 12 仍红·任务不成**。故必含 `proof.mjs:31` 恰 1 行计数同步 51→52（机械跟进·非断言放宽·沿 `e300bfec` 33→43+`55b68d67` 48→49+ci-red-clear 件⑤ 49→51 三先例同型·doctrine=ci-red-clear-REQUEST.md:108「计数系登记面直接函数·计数同步非断言放宽」）。「零码面零断言面」前提随实测修正登记·diff 面=manifest+proof.mjs+本卷恰 3 tracked。

## §1 红事实（机制链·全部亲证）

### 1.1 首曝机制（登记面欠账·非断言缺陷）

- 归因 commit=`23c479c2`（2026-10-14·session-summary-deepen EXEC 件⑨）落 `apps/worker/test/session-summary.proof.ts`（`8aa8c7ef`）——组B wire-fence 臂直调 `openAICompatibleClient()`（`:166`）+MUTATED 数组三在册 env 名（`:151`）·随 3e36b1ff 并入 PR #109 head。
- 该 EXEC 门矩阵十四门（其收据在卷）**不含 provider-egress:inventory/prove**——本地零暴露点；PR #109 synchronize 首 run CI 达 step 12（ci.yml `:80-:81`）→**存量欠账首曝**（登记欠账本体随件⑨落卷即埋）。
- 本起草树 @`039d9baa` 双复现：inventory EXIT=1（四错全文 §0.2-1）+prove EXIT=1（`TC-MODEL-002-E3-inventory-main` 于 proof.mjs `:28` 断言·四错同文回显）——与 CI 红名 `provider_egress_inventory_invalid` 逐字同源（inventory.mjs `:276` throw）。

### 1.2 逐错定案 + 先例形（「与 X 一致」≠「X 已证」措辞纪律全卷适用）

- **三 env 错**：`:151` 数组词面+`:157` delete+`:158-:159` delete+`:160` set——validator（inventory.mjs `:213-:228`）对 apps/packages/scripts 域词边界扫描，在册名出现即须 entry（source+class 非空）。三错=三 entry 欠登。
- **一 consumer 错**：`:166` 直调 `openAICompatibleClient()` 命中 factory 调用词（`:93-:99` directCallSources）→须 openai-compatible-chat consumers entry（class∈REQUIRED_CLASSES 四值·inventory.mjs `:165`）。
- **类定级逐字对齐先例**：同族先例=resume-grounding.proof.ts（`f3af4b61` :145-:155 wire-fence 臂与 session-summary 逐字同族：同 MUTATED 六名同序·同 delete 三连·同 fetch mock·同 finally 恢复）——其登记形=MODEL_API_KEY→**test-fixture**（语义=进程内 set 假值 `proof-key-not-live`）/MODEL_ENDPOINT_PROFILE→**test-isolation**（语义=delete 隔离环境基线）/MODEL_TEST_TRANSPORT_OVERRIDES→**test-isolation**（同 delete 隔离·**非** context-stress/ag-b-classify 的 set `'1'` test-fixture 形——本 proof 沿 S4b 同族 fetch mock 直 mock 不经 overrides 缝）·consumer→**local-adapter-test**（三 sibling proof 全此值）。session-summary 用法与 resume-grounding 逐字同形→四类值逐字承袭。
- **简报「TOKSTREAM S4b fake transport 同族」核实**：属实且更细——本 proof 系 fetch mock 直抓 wire body 形（S4b 同族）·overrides env 在此臂中系被 **delete 隔离**对象（防环境残留走缝）非注入 fixture——类定级以 delete 语义=test-isolation 为准（§0.2 漂移 1 的语义细化）。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=登记面补账**：manifest +1 consumers entry+3 environmentReferences entry（类值逐字承 §1.2 先例形）+proof.mjs:31 计数机械同步 51→52——登记欠账补齐·零测试行为触。
- **候选乙（否决·Ban）=改写 proof 件⑨ 臂**（摘 :151 env 引用或换直调为间接）：改测试行为=对 session-summary-deepen 已闭卷交付面（post 双审会签 PASS 在卷）越权回炉·且 env 恢复面/isolation 语义系防串扰守卫非冗余——否决。
- **候选丙（否决·Ban）=只修 MODEL_TEST_TRANSPORT_OVERRIDES 一 entry（简报字面）**：余三错（MODEL_API_KEY/MODEL_ENDPOINT_PROFILE/consumer）滞红+prove 计数红→step 12 仍红=红线未修复任务不成——否决（四错同源同刀全清）。
- **候选丁（否决·Ban）=count 断言放宽或摘除**：计数系登记面直接函数·同步≠放宽（ci-red-clear :108 doctrine）·摘除=削证明面——否决。

## §1-修法（登记面补账刀·预期 manifest 净 +16/−0 行+proof.mjs 1+/1-·零测试行为触）

- **件①（manifest 四 entry·`c2d7b9cc`）**：
  - consumers（openai-compatible-chat·`:153-:156` resume-grounding entry 之后插入）：`{ "source": "apps/worker/test/session-summary.proof.ts", "class": "local-adapter-test" }`
  - environmentReferences 三 entry（各承 §0.1 三插入点先例 entry 之后·形逐字同构）：`{ "name": "MODEL_API_KEY", "source": "apps/worker/test/session-summary.proof.ts", "class": "test-fixture" }` + `{ "name": "MODEL_ENDPOINT_PROFILE", "source": "apps/worker/test/session-summary.proof.ts", "class": "test-isolation" }` + `{ "name": "MODEL_TEST_TRANSPORT_OVERRIDES", "source": "apps/worker/test/session-summary.proof.ts", "class": "test-isolation" }`
  - 预期计数：environmentReferences 328→**331**·consumers 对 51→**52**（EXEC 以 `python3 -c` 解析+inventory 自报双实测为准·偏差即停）。
- **件②（prove 计数同步·`3932fad7` :31 恰 1 行）**：`assert.equal(result.stats.registeredConsumerSourcePairCount, 51);` → `…, 52);`（其余 78 行零字节触·沿 e300bfec/55b68d67/ci-red-clear 件⑤ 三先例 numstat 1/1 同型）。
- **件③（收据）**：`ai-docs/delivery/receipts/ssd-egress-manifest/00-exec.md` 七字段——**untracked 不入库**（negbend §9 先例·checker worktree claim 计入 +1 如实登记）。
- **diff 预期=恰 3 tracked**：manifest JSON（净 +16/−0）+proof.mjs（1+/1−）+本卷 .md——多任何 tracked 路径即停（越界需要类）。

## §2 验收断言（自审核对单基面·门矩阵八门·数字口径以实跑实测为准+偏差熔断）

1. **provider-egress:inventory 红→绿**：`pnpm provider-egress:inventory` EXIT=0·自报 `adapters=5; operations=10; registered_consumer_source_pairs=52; environment_references=331`·四错清零（改前基线=§1.1 EXIT=1 四错在案）。
2. **provider-egress:prove 绿**：`pnpm provider-egress:prove` EXIT=0 **7/7**（TC-main `:28`/:31 双锚过·52=52）。
3. **session-summary.proof 17/17 邻面不回退**：`pnpm -C apps/worker prove:session-summary` EXIT=0 **17 PASS**（改前基线本树亲跑 17 PASS EXIT=0 在案·零触该文件为绿前提）。
4. **typecheck**：`pnpm turbo typecheck --force` EXIT=0 8/8（零 .ts 触·恒等预期）。
5. **lint 五值恰等**：`pnpm turbo lint` 12/12 0 errors·五贴线值=root **5235**/web **601**/api **1421**/worker **954**/ai-runtime **628** 恒等——任一≠即停·零新增 warning。
6. **docs:check ≤cap**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·基线 **2180**（本树亲跑·cap=2192 `public-text-policy.mjs:100` 亲证）·本卷 +1+收据（untracked 亦计入）→终值预期 **2182≤2192**——>2192 红停·Ban 自升 cap。
7. **markers 五类零命中**：本刀改动集（manifest+proof.mjs+本卷 .md）五类标记词+冲突标记 grep 零命中（词面运行时组装防自匹配·沿 i6-239 §2-7 口径·命令与回执入收据）。
8. **diff 面机检+卫生**：`git diff --numstat HEAD` 恰 3 tracked（manifest 净 +16/−0+proof.mjs 1+/1−+本卷 .md）·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·est live=0（全门本地静态+隔离·零模型外呼·`actualSpendCny=null`）。

## §3 范围外（边界清单·越界即 FAIL）

1. **proof 件⑨ 面零触**：`apps/worker/test/session-summary.proof.ts`（`8aa8c7ef`）零字节改（候选乙否决·§1.3）。
2. **inventory 工具面零触**：`scripts/provider-egress-inventory.mjs`（`b196269c`）零字节改（:276 校验逻辑/枚举/扫描域零扩面诉求）。
3. **断言本体零触**：prove 除 `:31` 计数数字外零字节触·Ban 为绿改断言/削断言（候选丁否决）。
4. **policy 面零触**：`scripts/provider-egress-policy.mjs` REQUIRED_PROVIDER_EGRESS_POLICY 零字节改（adapters/operations/environmentNames 全集守恒）。
5. **邻套件/共享 SSOT 零触**：neg/interview/migrate/drift/gitleaks/backlog/checklist/LEDGER 只读引用——红清单行翻面权归协调方。

## §4 依赖

**①上游已满足**：件⑨ 在主线（`23c479c2` 并 `3e36b1ff`→head `039d9baa`）=欠账本体；ci.yml `:80-:81` step 12 接线在卷。**②无同文件并发**：§0.0 在飞交叠复核 EXEC 日必做。**③下游**：step 12 翻绿=PR #109 verify 通道恢复前提；登记计数 331/52 为后继 manifest 刀新基线（随收据留痕）。**④迁移**：预期零迁移零 DDL。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban retry-to-green（门 1/2/3 各恰 1 改后 run·红不重跑冲销）；Ban 翻 pins（零翻转）；Ban 触 proof 件⑨ 面/inventory 工具面/policy 面（§3）；Ban 为绿改断言削断言（候选丁）；Ban 扩 manifest 登记外任何顺手面（届时曝第五错→如实登记升级协调方·Ban 借机扩 entries）；Ban 改共享 SSOT（§3-5）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban docs:check 超限后自升 cap。

**pins（十值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——起草侧实跑=inventory/prove 红复现+session-summary 17 PASS 基线+docs:check 基线+install --frozen-lockfile（全本地静态/隔离·零模型外呼零 Key 加载）·零生产操作·零 secrets。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）五类标记词+冲突标记 grep 零命中（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装防自匹配·沿 negbend §7 同形制）。

## §8 STOP（快速链开工条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual`（EXEC 落卷翻面·原 `draft:awaiting_pre_exec_dual` 保全于 `673f4bd3`·§9） · 快速链授权=协调方派单 brief 明示「起草落卷后自审（沿 rev 确认席先例·窄域：§0 锚/修法/门矩阵/STOP/markers/docs:check 自查）→自审 PASS 即 EXEC→STOP」·开工条款①自审五项全 PASS 已落卷。** 后续条款：②EXEC 立项照 §0 协议对届时 tip 全量重 pin（已行使·§9.1 全恒等）；③EXEC **不得改 §1.2 先例类定级与 §5 Ban/pins 与 §1-修法件①② 登记面**（已遵守·§9.5 偏离零越界）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.2 结论受疑（如 manifest 结构改写/计数≠328·51/proof.mjs 断言移位/§0.0 在飞分支对两触面有主线后新增提交）→停·重 pin 回炉。
- **机制不满足**：件①② 落码后 inventory 四错未清零或曝第五错（=§1.2 归因有漏采）→停·如实升级协调方回炉（Ban 就地凑绿）。
- **越界需要**：修法诉求超出 §1-修法件①② 面（需触 proof 件⑨/inventory 工具/policy/断言本体）→停·另刀或协调方裁决。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻套件新红/lint 第五值外新值/docs:check>2192）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*SSD-EGRESS-MANIFEST REQUEST · 2026-10-14 起草 · base `feat/mysql-schema-skeleton` @`039d9baa`（PR #109 head 亲证） · 分支 `line/ssd-egress-manifest` · 工作树 `meetwise-seg` · 修法=manifest 四 entry（1 consumers local-adapter-test+3 env 逐字承 resume-grounding 同族先例类值）+proof.mjs:31 计数同步 51→52（三先例同型机械跟进）· 预期计数 env 328→331/consumers 对 51→52 · **`executed:awaiting_post_prove_dual`**（EXEC 落卷·门矩阵八门全绿·快速链自审代 pre-exec 双审如实登记·post 双审待派） · ⛔push · ⛔force push · STOP*

---

## §9 EXEC 记录（2026-10-14·EXEC 席=起草席一体·快速链自审 PASS 后开工·STOP=`executed:awaiting_post_prove_dual`）

### 9.0 快速链开工依据

- 自审五项全 PASS 落卷：①§0 锚复测恒等（resume-grounding `f3af4b61`/360+四插入点 `:154`/`:1923`/`:2008`/`:2033` 逐一定位吻合）②修法形与先例逐字同构（key 序 name/source/class+缩进 6/8 空格双层）③门矩阵八门命令全部在案（package.json/worker package.json 亲证）④STOP 字面恰 3 处 ⑤markers hits=0+docs:check 2181≤2192。授权链=派单 brief 快速链（偏离登记 §9.5-2）。

### 9.1 重 pin 全表（EXEC 立项日 @起草 commit `673f4bd3`·两码面 blob 恒等）

§0.1 全表复测零漂（manifest `c2d7b9cc`/proof.mjs `3932fad7`/inventory.mjs `b196269c`/proof 件⑨ `8aa8c7ef`/ci.yml `d2dc8d2c`/先例 `f3af4b61` 全恒等·cap 锚 `:100`=2192 恒等·§0.0 在飞交叠复扫=两触面非祖先顶触 **0**·§0.2 两漂移复现恒等·四错清单逐字吻合）。

### 9.2 落码面（件①+件②）

- **件①**：manifest 四 entry 落位——consumers（openai-compatible-chat）resume-grounding entry 后 +1：`{"source": "apps/worker/test/session-summary.proof.ts", "class": "local-adapter-test"}`；environmentReferences 三 entry 各承 resume-grounding 先例 entry 之后：MODEL_API_KEY→test-fixture/MODEL_ENDPOINT_PROFILE→test-isolation/MODEL_TEST_TRANSPORT_OVERRIDES→test-isolation（source=session-summary.proof.ts 三件）。实计数 env 328→**331**/消费者对 51→**52**（python3 解析+inventory 自报双实测恰等）。
- **件②**：`scripts/provider-egress-inventory.proof.mjs:31` 恰 1 行 `…registeredConsumerSourcePairCount, 51)` → `…, 52)`（其余 78 行零字节触）。

### 9.3 门矩阵八门全表（EXIT 原值·各门恰一次改后 run·零 retry-to-green）

| # | 门 | 命令 | EXIT | 实测 |
|---|---|---|---|---|
| 1 | provider-egress:inventory 红→绿 | `pnpm provider-egress:inventory` | 0 | `adapters=5; operations=10; registered_consumer_source_pairs=52; environment_references=331; releaseEvidence=false`（四错清零） |
| 2 | provider-egress:prove | `pnpm provider-egress:prove` | 0 | `selected=7/7; releaseEvidence=false`（TC-main `:28`/`:31` 双锚过·52=52） |
| 3 | session-summary 邻面 | `pnpm -C apps/worker prove:session-summary` | 0 | **17 PASS** ALL PASS（基线恒等·proof 文件零字节触） |
| 4 | typecheck | `pnpm turbo typecheck --force` | 0 | 8/8·Cached: 0·tsbuildinfo 副产 checkout 回滚沿先例 |
| 5 | lint 五值恰等 | `pnpm turbo lint --force` | 0 | 12/12 0 errors·root **5235**/web **601**/api **1421**/worker **954**/ai-runtime **628** 恰等钉值·零新增 warning |
| 6 | docs:check ≤cap | `node scripts/ai-docs/check-docs.mjs` | 0 | 基线 2180→REQUEST 后 2181→**收据落盘终值 2182≤2192 余 10**（80 required files verified·cap 锚 `:100`） |
| 7 | markers 五类 | 词面运行时组装扫改动集（manifest+proof.mjs+本卷+收据） | 0 | **hits=0** |
| 8 | diff 面机检+卫生 | `git diff --numstat`+lockfile+`.env*` | — | 恰 **2 tracked 改动**=manifest **+19/−0**+proof.mjs **1+/1−**（本卷已在起草 commit·收据 untracked 不计）·pnpm-lock.yaml 零改·`.env*` ABSENT 双零命中 |

### 9.4 改前/改后对照（门 1 机证）

```
改前（@039d9baa 亲跑）                            改后（本 EXEC run）
  provider_egress_inventory_invalid:                static_provider_egress_inventory_valid:
    adapter_consumer_unregistered:openai-…            adapters=5; operations=10;
    environment_reference_unregistered:MODEL_API_KEY  registered_consumer_source_pairs=52;
    environment_reference_unregistered:MODEL_ENDPOINT environment_references=331;
    environment_reference_unregistered:MODEL_TEST_…   releaseEvidence=false
  （inventory EXIT=1+prove EXIT=1 TC-main 红）       prove EXIT=0 selected=7/7
```

### 9.5 偏离清单（如实登记·两件·零越界）

1. **manifest diff +19/−0（起草预期 +16/−0）**：§1-修法算术草稿漏计 env entry 各 5 行（name+source+class+双括号）vs consumer entry 4 行——实账=1×4+3×5=**19**（numstat 机证）·门 8 判据随实测定谳「净 +19/−0」·恰 4 entry 落位结论方向零变。
2. **快速链自审代 pre-exec 双审**：派单 brief 明示授权（§8 开工条款①）——自审五项 PASS 落卷后开工·alone≠dual 状态如实登记·post 双审待派补位。

### 9.6 markers 扫描回执

命令形=四标记词运行时字符拼接+冲突标记对正则（词面不入卷防自匹配·`i6-239-gates.proof.mjs:151-:163` 同形）·改动集四文件（manifest JSON+proof.mjs+本卷 REQUEST+收据 00-exec）逐文件扫描——**hits=0 EXIT=0**（起草 turn 与 EXEC 终树两次行使全零）。

### 9.7 pins 零翻声明

十值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null。Ban 列表零触（⛔push/proof 件⑨ 零触/inventory 工具+policy 面零触/断言本体零触——`:31` 恰 1 数字同步沿 e300bfec/55b68d67/ci-red-clear 件⑤ 三先例/SSOT 零触/恰一次 prove 零 retry）。收据 `ai-docs/delivery/receipts/ssd-egress-manifest/00-exec.md` 七字段 untracked 不入库（negbend §9 先例）。
