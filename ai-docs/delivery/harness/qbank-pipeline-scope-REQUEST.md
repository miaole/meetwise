# QBANK-PIPELINE-SCOPE REQUEST — agent 题库摄取管线 CI 次红线修复刀（hitsFor wrapper 调用 scope 供给缺位·恰 1 测试文件净 +2 行修·qbank-pipeline-scope 战役·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席落卷 2026-10-14·merge `62e3fca8`+四 hunk 修法+门矩阵 20 门全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · est live=0 · ⛔push）

**席位**：QBANK-PIPELINE-SCOPE 诊断+起草席（诊断+起草双责·协调方派·CI 首曝靶=PR #108 verify step 72（qbank-integrity-upgrade）翻面后下一首曝红·integrity 席1 独立 A/B 直证在案：修前修后两树同签名同臂红=非 integrity 刀因果·预存）。
**基线**：`feat/mysql-schema-skeleton` @ `0036ddd8`（nul-escape-visibility nail SSOT commit·fetch 后 origin tip 亲证=任务书下界 i18n nail 波 tip 之上·`git rev-parse` 双值恒等）· 分支 `line/qbank-pipeline-scope`（本起草席 `git worktree add ../meetwise-qpl -b line/qbank-pipeline-scope origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `0036ddd8` 亲证）· 工作树 `meetwise-qpl`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（QBANK-PIPELINE-SCOPE CI 次红线修复刀·CI 首曝实测=`qbank-pipeline:prove` EXIT=1·红签名=`qbank_retrieval_scope_missing` @ `apps/worker/test/qbank-pipeline.proof.ts:72:19`·`hitsFor(...)` `:60-62` 调 `hybridQbankSearch` 无 scope GUC 供给·DB 侧 0176/0187 fail-closed 对缺 GUC 恒 RAISE·与 qbank-scope-fix 同族）；②CI 步定义 `.github/workflows/ci.yml:292-293`（步名「agent 题库摄取管线（类型感知 / 嵌入 / 召回门）」→ `pnpm qbank-pipeline:prove`）；③结构范本 `ai-docs/delivery/harness/qbank-scope-fix-REQUEST.md`（同族直亲卷·§0-§8 形制+修法语义+门矩阵基面）；④修法先例四处（§1.3 候选甲引·全数亲证在位绿）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg(-a)/sed/Read/git hash-object 实测 @`0036ddd8`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后无第二 qbank-pipeline-scope 同名树；`git branch --list "line/qbank-pipeline*"` 恰 1 命中=本席分支。
- `ls ai-docs/delivery/harness/ | grep qbank-pipeline` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀唯一产品触面=`apps/worker/test/qbank-pipeline.proof.ts`（现 blob `6aa34cc7`·末次变更=`5c449d46` 5E 簇B 死码卫生·已在主线）。届时对各在飞分支执行 `git log <branch> -1 -- apps/worker/test/qbank-pipeline.proof.ts` 逐树复核，任一分支顶对该文件存在主线 `0036ddd8` 之后的新增提交→触停止条件「现场漂移」停手上报。
- **交叠复核回执（EXEC 立项日 2026-10-14 落·并线后 tip `62e3fca8`·基线内容=tip^2 `d186dffc`）**：全 ref 扫描 `git log --all -- <触面文件>` 全史恰 4 提交逐一 `merge-base --is-ancestor` 对基线=3 命中基线内（`9c92826e` 初建/`9aafb14a` 引入/`5c449d46` 死码卫生）+1 基线外=`c3de7fe6`「Initial public project preview」（2026-08-14 历史初始导入·早于全部战役刀·非在飞分支顶新增）→**零分支顶新增·「现场漂移」未触**。在飞/近飞 32 树逐验 `git log <branch> -1 -- <file>`（qbank-integrity-chain `0c94d1ec`·dbacl2-ci-wire `4ace2d5f`·e2e-runner-stale-build-guard `d186dffc`·secret-checker-nul-guard `d186dffc`·hmac-consolidate `d186dffc`·i18n-metadata-ssr `59127126`·nul-escape-visibility `0036ddd8`·qbank-scope-fix `5ef0b505`·uc003-arm4-filter `3229360a`·uc003-followup `a68a6464`·safewrite-backpressure `685befed`·obs-ledger `9a0ade77`·status-flip2/3/4/5·uc184-slot-order `971a4032`·batchflip `019c45ba`·batch-residual-plan `cc28b9d9`·ci-wiring3 `a3f1752a`·ci-red-clear `bb1627d8`·cache-observe-repin `77ba32ab`·dbhy1-p4-fix `eee0622d`·db-acl-residual `7ac68ed7`·ops-hygiene `81984e9b`·perfload-env-fix `63f2645b`·g7-env-billing `6dfb0fdd`·cost-columns `591d07cf`·batch1-residual `ab02d499`·receipt-archive2/3·reconcile-retry `a6675d7b`）全数「末次触碰=`5c449d46`/`9aafb14a` 在基线内」。防重三面复验：`git worktree list` 无第二 qbank-pipeline-scope 树·`git branch --list "line/qbank-pipeline*"` 恰 1·harness 目录唯一同名卷=本卷。

### 0.1 blob 锚表（`git hash-object` 亲算 @`0036ddd8`·EXEC 立项日对并线 tip `62e3fca8` 全 15 行重 pin：13 已 pin 值零漂移逐一恒等+3 补 pin·行锚勘正详 §0.4）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/worker/test/qbank-pipeline.proof.ts` | `6aa34cc7`（121 行·**本刀唯一码改面**） | **`:26` OWNER=`qbank-pipeline-reader`·`:27` METADATA（v1/backend/general 夹具）·`:28-32` RAW_HELPER（`...METADATA` spread·`:31`）·`:33-44` QUESTION（`...METADATA` spread·`:37`）·`:52-62` `hitsFor`（**`:55` asPrincipal 在场·`:55-61` `hybridQbankSearch(client,{...})` 无 `scope` 参=本红缺口①**）·`:72` 首曝调用行（CI 签名 `:72:19`）·`:73-74` `qbankQuestionResultsForHits(client,g0.recipe.id,rawHits)` 无 scope=**缺口②**·`:81` 第二 hitsFor·`:82-83` 同形无 scope=**缺口③**·`:97-102` 臂④（`ingestQuestionBankArtifacts`+直 `pool.query` 计数·非五函数面零 GUC 需求）·`:104-108` 臂⑤（recipe mismatch 拒绝臂·catch `includes('qbank_generation_recipe_mismatch')` 语义面）·`:110-114` check 汇总·`:117-121` main catch（未捕获异常→`process.exit(1)`=CI EXIT=1 形）** |
| `packages/db/src/qbank/qbank-generation-retrieval.ts` | `2c5ed849`（317 行） | **`:39-51` `QbankServingScopeInput`（`ownerKind?`/`orgId?` additive optional·`:44-45` 注释「缺省臂 = C 端语义 platform」）·`:88-96` `setServingScope`（`:89` scope undefined 直接 return→零 GUC=fail-closed 契约·`:91-95` scope 在场恒供给四 GUC：serving 双+owner 双·owner 缺省 `platform`+空串）·`:271-317` `hybridQbankSearch`（`:273` `scope?` 入参·`:277` `setServingScope` 在先·recipe mismatch 判定 `:279-281` 在五函数 SQL 之前）·`:247-264` `qbankQuestionResultsForHits`（`:249` `scope?` 第 5 参·`maxCharsPerPart` 第 4 参缺省 420·`:255` 转调 `qbankQuestionEvidenceForRefs`）·`:206-239` `qbankQuestionEvidenceForRefs`（`:216` `setServingScope`·`:222` 直调 gated `qbank_generation_question_evidence`=**缺口②③五函数证据**） |
| `packages/db/migrations/0176_qbank_control_plane_authz_closeout.sql` | `38c1ec22`（363 行·qsec 小刀 `b20ee350` 权威体·**本红因果引入迁移**） | `:118-135` 助手初形（仅 serving 维度）·`:124-127` serving 双空 RAISE（`:126` 抛点·`qbank_retrieval_scope_missing`·ERRCODE check_violation）·`:102` AG-42 形 A 注记「五函数双空放行分支→报错」 |
| `packages/db/migrations/0187_qbank_owner_scoped_retrieval.sql` | `5eee1f56`（324 行·AG39 EXEC `1408d8c2` 落·owner 维度扩入） | **`:46-68` 断言助手 owner 维度并入·`:51-55` serving 双空判定先行（0176 原判定·顺序不动·`:54` 镜像 RAISE）·`:58-64` owner 臂（`:64` owner RAISE·message/code 与 serving 臂恒等=P2-c）——本红零 GUC 场景先命中 `:52-55` serving 先行臂** |
| `.github/workflows/ci.yml` | `97252708`（361 行） | **`:25` `verify:` job 起（全部 prove 步同 job 序贯·上游红即遮蔽下游=掩蔽机制）·`:276-277` campaign step 72「agent 题库历史完整性升级」→ `qbank-integrity-upgrade:prove`（已翻面）·`:292-293` 「agent 题库摄取管线」→ `qbank-pipeline:prove`（本红步·step 72 后顺延第 7 prove 步）** |
| `package.json`（根） | `3b04b871`（675 行） | `:556-557` `qbank-pipeline:prove`→`run-e2e-isolated.mjs`→`qbank-pipeline:prove:raw` |
| `apps/worker/package.json` | `e69420d4`（180 行） | `:59` `prove:qbank-pipeline`→`tsx test/qbank-pipeline.proof.ts` |
| `ai-docs/delivery/harness/ag39-org-qbank-REQUEST.md` | `3303f991`（233 行） | `:130`/`:201` 裁决⑧（九文件逐 file:line 枚举+rev3 开放判据兜底=「rg 普查」·**枚举与兜底回执均无本刀触面文件·`git show 1408d8c2` 首日普查回执语「wrapper 间接两 proof 不在现行门矩阵登记」=漏供给机制·§1.2-环②**） |
| `ai-docs/delivery/harness/qbank-scope-fix-REQUEST.md` | `ebfcb1d8`（207 行） | 同族直亲卷（直 SQL 面 set_config canonical 形·`git show 6414c562` 恰 1 行）——carrier 按调用面分形定谳见 §1.3 候选甲 |
| `apps/worker/test/qbank-generation.proof.ts` | `929c709d`（641 行·只读引用） | **`:66-73` `search()`=本 proof `hitsFor` 直亲同族**：`:69` asPrincipal+`:71-72` `hybridQbankSearch(c,{...,scope:{taxonomyVersion,servingScopeId}})` 两字段 scope 参显式（0176 随锚形·「夹具经 scope 显式走 track-local 路径」`:67-68`）·`:556-557` qsf 刀 set_config canonical（直 SQL 面） |
| `apps/worker/test/qbank-integrity-upgrade.proof.ts` | `49c4e401`（616 行·只读引用） | `:255-258` AG39 裁决⑧ setup 注入先例（serving 双 GUC+owner 双 GUC 四 `set_config`·wrapper 调用 `:261-264` 同事务共享） |
| `apps/worker/test/qbank-retrieval-eval-pg.proof.ts` | `5d164310`（212 行·只读引用） | `:86-88` `hybridQbankSearch(...,scope)`+`:`97` `qbankQuestionResultsForHits(...,MAX_CHARS,scope)`=**与缺口①②同对偶的 scope 参供形先例**·`:139-142` set_config 形（直 SQL lexical 探针） |
| `packages/db/test/rag03-filter-locus.proof.ts` 等 rag03 族 | EXEC 补 pin `702d4bc9`（451 行）/rag03c `624025b7`（531 行） | `rag03-filter-locus.proof.ts:51` `const SCOPE={taxonomyVersion,servingScopeId}` 两字段 const+:`254` scope 参用形·`rag03c-exactk-observe.proof.ts:372` 同族 |
| `apps/worker/test/ag39-quality-fusion-rank-dedup.proof.ts` | EXEC 补 pin `be22101f`（283 行） | `:234-258` 全部 `hybridQbankSearch` 调用四字段 scope 显式（`ownerKind` 在场）——**wrapper 调用者全集普查闭合：本 proof=全仓唯一未供 scope 的 wrapper 调用者（§1.2-环②兜底亲证）** |
| `packages/db/migrations/0186_qbank_org_owner_columns.sql` | `bba0666c`（143 行·只读引用） | owner 列 `NOT NULL DEFAULT 'platform'`——夹具语料 platform 属主列层根据 |

### 0.2 派单简报漂移登记（结论零变或收敛·如实改锚）

1. **简报「hitsFor(...):60-62 无 scope 供给」→ 定谳=同面缺口共三处**：`hitsFor` 内 `hybridQbankSearch`（`:55-61`·缺口①）+`:73-74`+`:82-83` 两处 `qbankQuestionResultsForHits`（转调 `qbank_generation_question_evidence`·同属 0176/0187 五 gated 函数族·`2c5ed849:226`/`:216` 亲证）——**只修 hitsFor 则红点平移至 `:74`·门仍红**。三处同批修复=门翻绿必要条件（§1-修法件①）。
2. **简报「红签名 @:72:19」→ 定谳=首曝抛点行**：`:72` 为 `hitsFor` 首次调用（g0 激活后）·RAISE 经 `:55` asPrincipal（`:997` 传播帧）透传至 `:117-121` main catch `process.exit(1)`=未捕获异常形 EXIT=1——与同族 qsf 卷 0.2-2 传播帧口径恒等。
3. **简报「0176/0187 fail-closed 对缺 GUC 恒 RAISE」→ 定谳=三抛点两维度**：0176`:126`（serving 双空初形）+0187`:54`（serving 镜像重申）+0187`:64`（owner 维度）·全 `RAISE EXCEPTION ... check_violation`（23514）·message 恒等（P2-c）。本红零 GUC 场景：0187`:51-55` serving 双空判定**先行**（顺序不动）→实际先命中 serving 臂；owner 臂同拍必触（第二维度）——两维度同缺·修复必须四 GUC 全供给（scope 参两字段形即四 GUC 全供·见候选甲）。
4. **简报「与 qbank-scope-fix 同族（夹具补 GUC 形）」→ 定谳=同族不同调用面**：qsf=directSqlBoundary 直 SQL 臂（无 TS 包装器·set_config canonical 形 `:556-557`）；本刀=TS wrapper 调用面（`hybridQbankSearch`/`qbankQuestionResultsForHits` 均带 `scope?` 参）——wrapper 面 canonical=scope 参显式（树内四先例·§1.3 候选甲）·DB 效应恒等（`setServingScope` `:91-95` 统一注四 GUC）。
5. **简报「integrity 席1 A/B 直证预存」→ 时序亲证相容**：本席 git log 双向（§1.2-环①）红自 `b20ee350`（0176）在链·早于 integrity 刀·与 A/B 双树同签名观测恒等。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**204**·头 `0204_ai_cost_cached_input_price.sql`（链 204 头 0204 与 nul-escape EXEC 卷记恒等）。
- 本刀修法=纯测试夹具 +2 净行（§1-修法件①）·**预期零迁移零 DDL**。协调规则：EXEC 期若实测产生非预期迁移需求→停（越界需要类）上报，认领号对届时主线链顶亲数+在飞分支题面复核后取最小未占号顺延·Ban 抢号 Ban 私占。

### 0.4 EXEC 立项重 pin 回执（2026-10-14·对并线 tip `62e3fca8`·双亲 `95e9b0d5`+`d186dffc`·届时 origin tip=`d186dffc`=cap 2176 sanction 锚下界恰等亲证）

- **blob 全 15 行重 pin=零漂移**：§0.1 表 13 已 pin blob 值（`6aa34cc7`/`2c5ed849`/`38c1ec22`/`5eee1f56`/`97252708`/`3b04b871`/`e69420d4`/`3303f991`/`ebfcb1d8`/`929c709d`/`49c4e401`/`5d164310`/`bba0666c`）对届时树 `git hash-object` 逐一恒等·行数逐文件恒等——**基线漂移=零·结论不受撼·停止条件 1 未触**；3 起草席未 pin 值 EXEC 补 pin=rag03-filter-locus `702d4bc9`（451 行）/rag03c-exactk-observe `624025b7`（531 行）/ag39-quality-fusion `be22101f`（283 行）。
- **行锚勘正落卷（pre-exec 席1 P1-RP 清单六项·全数对届时树 `Read`/`awk NR` 亲证后落·结论零变仅行号）**：①`hybridQbankSearch` 内 `setServingScope` 在先 `:276`→**`:277`**；②recipe mismatch 判定 `:278-280`→**`:279-281`**；③`qbankQuestionResultsForHits` 区间 `:245-258`→**`:247-264`**·转调行 `:252`→**`:255`**；④`qbankQuestionEvidenceForRefs` gated 直调 `:226`→**`:222`**；⑤eval-pg `qbankQuestionResultsForHits(...,MAX_CHARS,scope)` 供形行 `:94`→**`:97`**；⑥`hybridQbankSearch` 区间 `:271-277`→**`:271-317`**+`qbankQuestionEvidenceForRefs` 区间 `:205-230`→**`:206-239`**（⑥系①-④落定后区间含锚的内部一致性重 pin）——另 EXEC 重 pin 顺带精化两处（非席1 清单·透明列示）：`QbankServingScopeInput` 区间 `:39-54`→**`:39-51`**·缺省臂注释 `:49-51`→**`:44-45`**。
- **行锚零漂移面（逐条亲证恒等·零勘正）**：proof.ts 14 锚（`:26/:27/:31/:37/:52-62/:55/:72/:73-74/:81/:82-83/:97-102/:104-108/:110-114/:117-121`）+0176 四锚（`:102/:118-135/:124-127/:126`）+0187 五锚（`:46-68/:51-55/:54/:58-64/:64`）+ci.yml 三锚（`:25/:276-277/:292-293`）+两 package.json（`:556-557/:59`）+ag39 卷两锚（`:130/:201`）+qbank-generation 五锚（`:66-73/:69/:71-72/:67-68/:556-557`）+integrity-upgrade 两锚（`:255-258/:261-264`）+eval-pg `:86-88/:139-142`+rag03 三锚（`:51/:254/:372`）+fusion `:234-258`+0186 `DEFAULT 'platform'`。
- **§1 体同源勘正承载**：§1.2-环⑤ `2c5ed849:276-280`→`277-281`·§1.3 候选甲 eval-pg `:94`→`:97`（同源行号勘正·语义零变）。
- **cap 对位**：cap 2168→**2176** 系 `1824b2d9` sanction 已裁在树（`public-text-policy.mjs`·非本刀改动）；docs:check 基线实测=**2161**（并线树·本席亲跑 EXIT=0）=d186dffc tip 单树 2160+本卷 REQUEST 恰 +1——§2-7/§8-6/§6/§3 四处对位勘正（P1-RP ①）。

## §1 红事实与归因链（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 CI 首曝形（观测面·本席不重测 CI·以改前必做 run 复核）

- 派单观测：PR #108 verify·campaign step 72（`qbank-integrity-upgrade:prove`）翻面后下一首曝红=`qbank-pipeline:prove` EXIT=1·`✗ qbank_retrieval_scope_missing`·栈=`qbank-pipeline.proof.ts:72:19`（`:55` asPrincipal 传播）·与 §0.1 锚行逐字相容。
- 门管线：`pnpm qbank-pipeline:prove`（根 `package.json:556`）→`scripts/run-e2e-isolated.mjs` 隔离容器→`pnpm -C apps/worker prove:qbank-pipeline`（`apps/worker/package.json:59`）→`tsx test/qbank-pipeline.proof.ts`·真迁移链 204 applied→0176/0187 在效。
- 首曝语义：`:72` 为全 proof 首个 gated 读路径调用——`:69-71` ingest/激活臂走写路径（非五函数面）全绿后，`:72` 即触（未捕获异常·臂计数分母以改前 run 实测为准）。

### 1.2 归因链（五环·git log 双向+逐文件亲证）

- **环①（因果引入·双向）**：`git log --follow -- apps/worker/test/qbank-pipeline.proof.ts`=三 commit（`9c92826e` 初建→`9aafb14a` 引入 `hybridQbankSearch` 调用→`5c449d46` 死码卫生·`git log -S "hybridQbankSearch"` 恰 1 命中 `9aafb14a`）；`git log -S "scope" --` 同文件=**全史零命中（该 proof 自诞生从未供给 scope）**。`9aafb14a` 时代五函数双空放行（0176 前权威体）→零 GUC 调用绿。**红因果引入=`b20ee350`（0176·AG-42 形 A 五函数双空放行→fail-closed RAISE·`:126`）**；`1408d8c2`（0187·AG39）扩 owner 维度入同一助手（message/code 恒等·`:64`）=第二维度同拍必触——两刀均未触及本 proof 文件（`git log` 双向亲证）。
- **环②（漏供给机制·普查分类误判）**：AG39 裁决⑧「受影响 proof setup 补两 owner GUC」九文件枚举（`3303f991:130`/`:201`）+rev3 开放判据兜底（「对五函数任一活调用且 setup 未含两 owner GUC 者·EXEC 以 rg 普查清单为准」）；0176 随锚面同批覆盖 wrapper/直调面（qbank-generation `search()` `:66-73` scope 参形+integrity-upgrade `:255-258`+eval-pg `:139-142`）。**EXEC 首日普查回执语（`1408d8c2` commit 文）：「wrapper 间接两 proof 不在现行门矩阵登记」——`git show 1408d8c2:.github/workflows/ci.yml` :240（rag-generation）/:258（qbank-pipeline）亲证两 wrapper proof 当时均已登记=该分类误判成立**→本 proof 未入裁决⑧供给集。兜底闭合亲证：现行树 wrapper 调用者全集（§0.1 末两行）中 `ag39-quality-fusion`（后于 AG39 落）全调用点四字段 scope 显式——**本 proof=全仓唯一未供 scope 的 wrapper 调用者·零第四缺口**。
- **环③（CI 掩蔽链·首曝时序）**：`.github/workflows/ci.yml:25` `verify` job 全部 prove 步同 job 序贯·上游红即遮蔽下游。campaign step 72（`qbank-integrity-upgrade:prove`·`:276-277`）自 0176 时代即基线红（`b20ee350` 门全表原文「integrity-upgrade/db-trigfam 两基线同红 stash 对照/结构性亲证非本刀面」）→`qbank-pipeline:prove`（`:292-293`·step 72 后顺延）在 CI 长期未达；0176/AG39 两刀门全表清单（commit 文亲证）均未含本门=与 CI 掩蔽互为表里。integrity 刀翻 72→顺延步逐达→本红首曝。integrity 席1 A/B 双树同签名同臂红=非该刀因果·预存——与环① `b20ee350` 时序恒等。
- **环④（生产面零嫌疑）**：生产 src 五点 `setServingScope` 注入在先+`retrieval-store.ts` 直连点同供（AG39 普查回执·`1408d8c2`）+org 值源 `deriveQbankOwnerScope` 派生注入——本红纯测试夹具供给缺·产品码零涉。
- **环⑤（夹具匹配性·修复不翻断言的根据）**：夹具全量语料同源 `METADATA`=v1/backend/general（`:27`·经 `:31`/`:37` spread 入 RAW_HELPER+QUESTION）·generation 投影沿写手 `DEFAULT 'platform'`（0186 列层）→scope 两字段形（owner 缺省归一 platform·P2-e NULLIF 契约）与夹具逐位匹配=**scoped 过滤对本夹具为零裁剪语义·臂①-⑤断言期望值零需翻**。臂⑤（recipe mismatch）在 `hybridQbankSearch` 内位于 `setServingScope` 之后、五函数 SQL 之前（`2c5ed849:277-281` 亲证·EXEC 重 pin 勘正）→供给 scope 后该臂 RAISE 面零变。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=夹具补 serving+owner 双 GUC 供给（派单候选甲）**：三缺口位点同批供给 scope（§1-修法件①）。**carrier 按调用面定谳**：本 proof 三处全为 TS wrapper 调用（`hybridQbankSearch`/`qbankQuestionResultsForHits` 均带 `scope?` 参）→canonical=**scope 参显式两字段形**（`{taxonomyVersion,servingScopeId}`·owner 缺省归一 platform）——树内四先例同族：qbank-generation `search()` `:71-72`（0176 随锚直亲同族）+rag03-filter-locus `:51`/`:254`+eval-pg `:86-88`/`:97`（与缺口①②同对偶·行号 EXEC 重 pin 勘正）+ag39-quality-fusion `:234-258`；**qsf `:556-557`/integrity-upgrade `:258` set_config 形为直 SQL 无包装器面的 canonical carrier**——本 proof 无直 SQL 臂故不适用；两 carrier DB 效应恒等（`setServingScope` `:91-95` 统一注 serving 双 GUC+owner 双 GUC 四枚·owner 两字段形=`platform`+空串=裁决⑧ canonical 值·P2-e 归一）。定性=setup 注入非断言改动（AG39 裁决⑧原口径）·零语义翻面·零断言改动。
- **候选乙（否决·Ban）=proof 断言改形（弱化·派单候选乙·简报已标 Ban 倾向）**：①-④臂=qbank 读路径唯一端到端 proof（辅助 chunk 不可单独升题/不可变 generation/完整工件 resolver/重放幂等）·本红系**环境 GUC 供给缺**非断言错——断言面零需翻；改形（删臂/改期望 RAISE/降断言）=门语义弱化·触 AG39 P2-a 负面边界同族口径（「补 GUC 后仍红=断言面零翻失败→停回炉」的反面前提不成立）+§5 Ban 为绿改断言。否决。
- **候选丙（否决·越权）=产品侧放宽（助手对缺 GUC 静默降级/放行）**：0187 fail-closed=AG39 rev2 B2 协调方裁决行使（严格 RAISE 维持）+三面断言承重（qbank-control-sec B1-B5·ag39 ②-d 四臂·rag04 :331-332）——动产品语义即翻用户决策+翻断言面。否决（沿 qsf 候选乙同款口径）。

## §1-修法（权限链修复刀·预期恰 1 测试文件净 +2 行（numstat +4/−2）·零迁移零产品码零断言改动）

- **件①（唯一码改·`apps/worker/test/qbank-pipeline.proof.ts`·blob `6aa34cc7` 四 hunk）**：
  - hunk-1（`:27` METADATA 行后新增·模块级夹具 scope·两字段形沿 qbank-generation `search()` `:71-72` 直亲同族）：

    ```ts
    const SCOPE = { taxonomyVersion: METADATA.taxonomyVersion, servingScopeId: METADATA.servingScopeId };   // 0176/0187 fail-closed 断言助手随锚：夹具 scope 显式供给（owner 缺省归一 platform·沿 qbank-generation search() 同族形）
    ```

  - hunk-2（`hitsFor` 内 `:60` `retrievalMode: 'dense',` 行后新增一行·缺口①）：

    ```ts
        scope: SCOPE,
    ```

  - hunk-3（`:74` 尾参追加 `420, SCOPE`·缺口②·`maxCharsPerPart` 显式 420=原缺省值恒等）：

    ```ts
        qbankQuestionResultsForHits(client, g0.recipe.id, rawHits, 420, SCOPE));
    ```

  - hunk-4（`:83` 同形·缺口③）：

    ```ts
        qbankQuestionResultsForHits(client, g1.recipe.id, artifactHits, 420, SCOPE));
    ```

  语义钉死四点：①值=夹具同源 v1/backend/general（§1.2-环⑤·owner 经 `setServingScope` `:93-95` 缺省归一 `platform`+空串=裁决⑧ canonical 值）→四 GUC 全供、serving/owner 双维度同拍闭合；②`set_config(…,true)`=SET LOCAL 事务级（asPrincipal 事务内·`:55`/`:73`/`:82` 三事务各自独立供给·零跨事务泄漏）；③臂①-⑤断言本体与期望值**零字节改**——臂⑤ mismatch RAISE 面零变（§1.2-环⑤）；④**三缺口同批闭合为门翻绿必要条件**（§0.2-1·只修①则红平移至 `:74`）。
- **件②（prove·恰 1 run 零 retry-to-green）**：①**改前基线 run 必做一次**（不计 prove·零冲销纪律）：`pnpm qbank-pipeline:prove` 于改前树取红证据（预期 EXIT=1·`qbank_retrieval_scope_missing`·栈 `:72:19`·与 CI 首曝同签名）入收据；②改后 `pnpm qbank-pipeline:prove` 恰 1 run 期望 EXIT=0 全臂绿。红不重跑冲销。
- **件③（收据）**：`ai-docs/delivery/receipts/qbank-pipeline-scope/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前改后红绿对照+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）。

## §2 验收断言（pre-exec 双审核对单基面·数字口径以实跑实测为准·基线权威值=`0036ddd8` 树+nul-escape/qsf 两 nail 卷记 union）

1. **qbank-pipeline:prove 红翻绿（本刀主门）**：`pnpm qbank-pipeline:prove` EXIT=0·改前必做 run 红签名与 CI 首曝同形（§1-修法件②）·改后恰 1 run 全臂绿零 retry。
2. **qbank 九邻面不回退全 EXIT=0**：`qbank-control-sec:prove`（26 断言）+`ag39-org-qbank:prove`（50 臂·现行输出 53 PASS 行=50 臂+夹具行恒等映射）+`qbank-handoff-closure:prove`（16）+`qbank-control-role:prove`（12）+`dbhy1:prove`（28）+`rag03-filter-locus:prove`（12）+`rag03-hnsw-completeness:prove`（16）+`rag03c-exactk-observe:prove`（7）+`rag04-track-local:prove`（33）——臂数对基线登记值·任一漂移±1 即触「现场漂移」上报。
3. **sibling 同族面**：`rag-generation:prove` **40/40** EXIT=0（qbank-generation.proof·qsf 修复面·同 METADATA 夹具族回归）。
4. **neg 邻面**：`neg:all` 六段全绿 EXIT=0·总臂 **687**（90/90/91/102/179/135·±2 熔断上报）·PASS 名单对基线 diff=∅。
5. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached）。
6. **lint**：`pnpm turbo lint` 12/12·0 cached·五值恰等 web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（恰等·任一越值即停）。
7. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2176**（cap 2168→2176 系 `1824b2d9` sanction 已裁在树·非本刀改动；基线实测 `0036ddd8`=**2158** 起草席亲跑·并线树=**2161** EXEC 亲跑=d186dffc tip 单树 2160+本卷 REQUEST 恰 +1·落收据后预期 2161 不增（§9 收据入卷内零新文件）·无需 sanction）。
8. **markers 五类零新增**：本刀改动集（本卷 .md·EXEC 期+件① .ts+收据）五类标记词运行时组装词面 `grep -a` 零命中（i6-239 口径·词面不复抄卷内防自匹配·命令与回执入收据）。
9. **diff 面机检**：起草卷 `git diff --numstat`（对 `0036ddd8`）恰 1 tracked 路径=本卷 .md（+1/−0）；EXEC 卷恰 2 tracked 路径=件① .ts（+4/−2）+本卷 .md——多任何 tracked 路径即停（越界需要类）。
10. **卫生**：est live=0（prove 全 run-e2e-isolated 隔离容器·零宿主库直跑）·0 Key 值·`.env*` ABSENT 双向记录·`actualSpendCny=null`。
11. **贴边注意（三条·EXEC 必读）**：①本 proof 现行树**零 NUL 字节**（`6aa34cc7` 亲证·与 qsf 触面文件不同·裸 rg 可用——但仍 Ban 对任何仓内文件以裸 rg 二进制静默跳过下结论·qsf §2-12① 沿承）；②turbo 副产 `apps/web/tsconfig.tsbuildinfo` 若被门运行翻动→`git checkout` 回滚保门 9 恰路径（negbend §9 先例形）；③全部 prove 门经 `run-e2e-isolated.mjs` 隔离容器跑·Ban 宿主环境直连跑（夹具真迁移链 204 前提）。

## §3 范围外（边界清单·越界即 FAIL）

产品码与 0176/0186/0187 owner 语义（候选丙否决沿承）；其他 proof 夹具与断言面（臂①-⑤期望值零改）；`setServingScope`/`QbankServingScopeInput` 契约（additive optional 缺省臂系 AG39 已裁·零改）；共享 SSOT（LEDGER/checklist 行翻面权归协调方）；cap/sanction `public-text-policy.mjs`（本卷无需：并线树 2161≤2176·cap 2168→2176 系 `1824b2d9` sanction 已裁非本刀改动）；rg 普查工具化/门矩阵清单自动核（后继工具刀候选·如实登记不借机修）；依赖升级；其他工作树。

## §4 est live=0（起草 turn·EXEC 期同）

全隔离容器（run-e2e-isolated）·假体 embedder 零模型外呼·零 secrets 消耗·`actualSpendCny=null`·pins 十一值照抄零翻。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban merge 主线；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件② 恰 1 prove run·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 为绿改断言/改期望值/删臂（候选乙否决沿承）；Ban 触产品码与 0176/0186/0187 owner 语义（候选丙否决沿承）；Ban 触其他 proof 夹具（§3）；Ban 迁移 Ban DDL（§0.3 预期零·需则停上报走认领规则）；Ban 改共享 SSOT（§3）；Ban 自改 cap/sanction（§3·归协调方）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因红靶外新红（邻面若现新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 落卷自检（本席亲跑面·起草 turn）

`node scripts/ai-docs/check-docs.mjs` EXIT=0 **2158≤2168**（落卷前基线·起草席亲跑）→落卷后复跑预期 2159（EXEC 重 pin 对位：cap 2168→**2176** 系 `1824b2d9` sanction 已裁·并线树实测 **2161**≤2176 EXEC 亲跑）；markers 五类改动集（本卷 .md）运行时组装词面 grep -a 零命中（命令与回执入 commit 卷语）；`git diff --numstat` 恰 1 tracked .md；worktree/分支防重（§0.0）亲证。

## §8 停止条件（触一即停·如实上报勿修饰）

1. **现场漂移**：EXEC 立项日 `git log <branch> -1 -- apps/worker/test/qbank-pipeline.proof.ts` 任一在飞分支顶对 §0.0 规则触线·或届时 tip 对 §0.1 锚 blob 漂移且结论受撼→停上报（重 pin 流程）。
2. **改前 run 签名不符**：改前基线 run 红签名≠`qbank_retrieval_scope_missing`@`:72:19` 形（他签名/他行号/臂断言红）→停上报勿修饰（归因重开）。
3. **改后仍红**：件① 三缺口全闭后主门 run 仍 EXIT=0 不达→停回炉（沿 qsf 沿承口径）·Ban 重跑冲销·Ban 断言改形救绿（候选乙 Ban 沿承）。
4. **邻面新红**：九邻面/rag-generation/neg 任一门现基线外新红→如实登记升级停上报·Ban 借机修。
5. **越界需要**：实测产生非预期迁移/DDL/产品码触面需求（§0.3/§3）→停上报走认领规则。
6. **docs:check 超限**：落卷后 >2176→停上报（cap 2168→2176 系 `1824b2d9` sanction 已裁·本卷并线树实测 2161·落收据后仍 2161·余量 15）。

**STOP=`executed:awaiting_post_prove_dual`**（EXEC 席终态 2026-10-14·原起草终态 `draft:awaiting_pre_exec_dual` 经 pre-exec 双审会签 PASS 席1 agent_37823b6d+席2 agent_0f8cb631+协调方 EXEC 授权后推进·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve）——EXEC 授权与 nail/行翻面归协调方·本席⛔push ⛔merge 主线 ⛔force push 未用。

## §9 EXEC 记录（2026-10-14·EXEC 席·pre-exec 双审会签 PASS 席1 agent_37823b6d+席2 agent_0f8cb631·协调方授权 EXEC）

**序回执**：序1 `git fetch`+`merge --no-ff origin/feat/mysql-schema-skeleton@d186dffc`（届时 tip=d186dffc=cap 2176 sanction 锚恰等下界亲证·ort 零冲突 15 files +815/−38·冲突沿并集解预置未触发·禁 pull --rebase 遵守·**merge=`62e3fca8`** 双亲 95e9b0d5+d186dffc）→序2 P1-RP 三项修订落卷（cap 四处对位+§0.1 行锚勘正+§0.0 交叠复核回执补记）→序3 §0 全量重 pin 落 **§0.4**→序4 EXEC 修法四 hunk→序5 门矩阵→本 §9 落卷+commit。

**字段① 门矩阵全表（EXIT 原值·20 门全绿）**：

| # | 门 | 期望 | 实测（EXIT 原值） | 结论 |
|---|---|---|---|---|
| 0a | qbank-pipeline:prove **改前基线 run**（不计 prove） | EXIT=1·`qbank_retrieval_scope_missing`@`:72:19` | EXIT=1·`✗ error: qbank_retrieval_scope_missing`·栈=`retrieval.ts:285:21`→`principal.ts:997`（传播帧·§0.2-2 预判恒等）→`proof.ts:72:19`·隔离 PG `applied=204 skipped=0` | **红**·签名与 CI 首曝同形（§8-2 未触） |
| 0b | qbank-pipeline:prove **改后恰 1 run**（主门·零 retry） | EXIT=0 全臂绿 | EXIT=0·臂①-⑤ 全 PASS·`✓ qbank current read path ... passed`·`applied=204 skipped=0` | **红翻绿** |
| 1 | qbank-control-sec:prove | 26 断言 | EXIT=0·26 PASS·「26 断言全绿」 | 绿恰等 |
| 2 | ag39-org-qbank:prove | 50 臂（53 PASS 行恒等映射） | EXIT=0·53 PASS 行·「ALL GREEN」 | 绿恰等 |
| 3 | qbank-handoff-closure:prove | 16 | EXIT=0·16 PASS | 绿恰等 |
| 4 | qbank-control-role:prove | 12 | EXIT=0·12 PASS | 绿恰等 |
| 5 | dbhy1:prove | 28 | EXIT=0·28 PASS·「28 断言全绿」 | 绿恰等 |
| 6 | rag03-filter-locus:prove | 12 | EXIT=0·12 PASS | 绿恰等 |
| 7 | rag03-hnsw-completeness:prove | 16 | EXIT=0·16 PASS | 绿恰等 |
| 8 | rag03c-exactk-observe:prove | 7 | EXIT=0·7 PASS | 绿恰等 |
| 9 | rag04-track-local:prove | 33 | EXIT=0·33 PASS | 绿恰等 |
| 10 | rag-generation:prove | 40/40 | EXIT=0·40 PASS | 绿恰等 |
| 11 | interview:prove | 57 | EXIT=0·57 PASS·「v64 面试链路全部通过」 | 绿恰等 |
| 12 | migrate:prove | 链 204 | EXIT=0·「迁移运行器 全部通过」+隔离链 `applied=204 skipped=0`（主门两 run 迁移行+uniqueness files=204 三面互证） | 绿 |
| 13 | drift:prove | EXIT=0 | EXIT=0·「✓ schema 无漂移」（列缺口 5+约束 2 全豁免登记·未登记 0） | 绿 |
| 14 | uniqueness | EXIT=0 | EXIT=0·`files=204 violations=0`（豁免 0143/0152/0160 既有） | 绿 |
| 15 | typecheck（`turbo typecheck --force`） | 8/8·0 cached | EXIT=0·8/8·0 cached | 绿恰等 |
| 16 | lint | 12/12·0 cached·五值恰等 | EXIT=0·12/12·**0 cached**（`--force` 正形）·web **601**/root(**//**) **5235**/api **1421**/worker **954**/ai-runtime **628** 五值恰等 | 绿恰等 |
| 17 | docs:check | ≤2176 | EXIT=0·**2161**≤2176（并线树基线同值 2161·收据入卷内零新文件） | 绿 |
| 18 | markers 五类 | 改动集零命中 | 词面运行时组装（`['T','O','D','O']`/`['F','I','X','M','E']`/`['X','X','X']`/`['H','A','C','K']` 四 .join('')+冲突标记对组装形·词面不入卷防自匹配·i6-239 canonical 形·同 qsf 收据）`grep -a` 改动集两文件·EXIT=1 零命中 | 零命中 |
| 19 | diff 面 | 恰 2 tracked 路径=件① .ts（+4/−2）+本卷 .md | `numstat`：`apps/worker/test/qbank-pipeline.proof.ts` **4/2**（blob `6aa34cc7`→`1c0cccd7`）+本卷 .md 增注·零第三 tracked 路径 | 恰等 |
| 20 | 卫生 | est live=0·0 Key·.env* ABSENT | 全门经 run-e2e-isolated 隔离容器·`ls .env*` 零命中（no matches）·零 Key 值入树入据·est live=0 | 恒等 |

**字段② 改前改后红绿对照**：改前（blob `6aa34cc7`·恰 1 次基线 run 不计 prove）=EXIT=1·`qbank_retrieval_scope_missing`·首曝帧 `:72:19`（hitsFor 首调·asPrincipal `:55` 传播）——与 CI 首曝签名逐字同形；改后（blob `1c0cccd7`·恰 1 run 零 retry）=EXIT=0·臂①辅助 chunk 不可单独升题/②内容 epoch 重建活动 generation/③resolver 四角色证据/④重放幂等不双建/⑤mismatch 拒绝全绿——臂⑤同绿=供给 scope 后 mismatch RAISE 面零变直证（§1.2-环⑤ 预判兑现）。红因=环境 GUC 供给缺（三缺口同批闭合）非断言错·断言期望值零翻。

**字段③ diff numstat**：`apps/worker/test/qbank-pipeline.proof.ts` +4/−2（hunk-1 `:28` SCOPE 两字段 const·hunk-2 `hitsFor` 内 `scope: SCOPE,`·hunk-3 `:75` 尾参 `420, SCOPE`·hunk-4 `:84` 同形）+本卷 .md 增注（§0.0 回执+§0.4 重 pin+cap 四处对位+§1 体两处同源行号+本 §9+Status/STOP/卷尾三处终态翻转）——恰 2 tracked 路径零第三。

**字段④ 重 pin 全表**：见 §0.4（15 blob 零漂移+3 补 pin·行锚勘正八项·零漂移锚清单·§1 体同源承载·cap 对位）+§0.0 交叠复核回执（全 ref 扫描 4 提交定性+32 树逐验零触+防重三面）——重 pin 结论=基线漂移零·停止条件 1 未触。

**字段⑤ 偏离清单（五项·全透明·零实质偏离）**：
1. **件③ 收据落位改定**：协调方 EXEC 令改定为本卷 §9 承载（七字段照录）·原 `receipts/qbank-pipeline-scope/00-exec.md` 路径不另落盘——与 §2-9「恰 2 tracked 路径」门自洽（另立收据文件即第三路径触停）。
2. **P1-RP docs:check 基线口径对位实跑**：协调方令文「基线 scanned 2160（落收据后 ~2162）」——实跑=并线树 **2161**（=d186dffc tip 单树 2160+本卷 REQUEST 恰 +1）·落收据后仍 **2161**（收据入卷内零新文件）·沿 §2 前言「数字口径以实跑实测为准」落卷·cap 2176 余量 15。
3. **§0.4 行锚勘正含两项重 pin 顺带精化**（`QbankServingScopeInput` 区间 `:39-54`→`:39-51`·缺省臂注释 `:49-51`→`:44-45`）非席1 清单原六项——§0 头部「EXEC 立项照本节对届时 tip 再重 pin」授权面内·§0.4 透明列示。
4. **§1 体两处同源行号勘正承载**（环⑤ `276-280`→`277-281`·§1.3 eval-pg `:94`→`:97`）——与 §0.1 同源勘正·语义零变。
5. **lint 首跑 9 cached→按门面「0 cached」要求以 `--force` 复跑取正形**（门面明定 0 cached·非 retry-to-green·主门 prove 恰 1 run 未重跑未冲销）。

**字段⑥ pins 零翻声明**：十一值照抄零翻转——haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。全门矩阵跑后零翻转。

**字段⑦ P2-1 supply-only 负路径交叉承载照录（pre-exec 审查项）**：本刀改动全为 scope 供给面（模块级 const+调用参注入·setup 性质沿 AG39 裁决⑧口径）·断言本体零字节改·零断言弱化·零产品码。fail-closed 负路径断言承载面=qbank-control-sec:prove 26 断言（B1-B5）+ag39-org-qbank:prove 50 臂（②-d 四臂）+rag04-track-local:prove 33（`:331-332` fail-closed 臂）+本 proof 臂⑤（mismatch RAISE 拒绝·改后同绿直证 RAISE 面零变）——四门在门矩阵全数复跑 EXIT=0（表 #1/#2/#9/0b）·**交叉承载不回退=supply-only 对负路径零弱化直证**。另 wire 契约面「旧代码忽略仍正确」结论：本刀零 wire 契约/Redis 结构变更——`qbankQuestionResultsForHits` 显式 `420` 恒等于原缺省值（`2c5ed849:248`）·`scope` 原 undefined=零 GUC fail-closed 路径改显式两字段供给（`set_config(…,true)`=SET LOCAL 事务级·事务出即逝零泄漏）·SQL 函数签名/迁移/持久化 wire 面零触·旧调用者（qbank-generation/eval-pg/rag03/fusion 各形）行为面零变。

**STOP=`executed:awaiting_post_prove_dual`**（§9 落卷即停·post-prove 双审两独立外席待派·nail/行翻面归协调方·本席⛔push ⛔merge 主线 ⛔force push 未用）

### §9-补 post P2 勘误随卷（2026-10-16 nail 席·post 双审会签 PASS 席1 agent_7e2c4ea6+席2 agent_5b1201a9 授权·append 注记形·上文零字洗改·勘误三件）

- **P2-1（§9 字段③ hunk-3/4 行号勘正）**：字段③所载「hunk-3 `:75` 尾参 `420, SCOPE`·hunk-4 `:84` 同形」勘正为 **hunk-3=`:76`·hunk-4=`:85`**——nail 并线树 `06f120b7` grep -n+sed -n 亲证（blob `1c0cccd7` merge 后 ls-tree 恒等零字节变）：`:76`=`qbankQuestionResultsForHits(client, g0.recipe.id, rawHits, 420, SCOPE));`·`:85`=`qbankQuestionResultsForHits(client, g1.recipe.id, artifactHits, 420, SCOPE));`·`:75`/`:84` 实为各行紧邻前置的 `asPrincipal` 行——numstat +4/−2 与语义结论零变。
- **P2-2（门矩阵 isolated 收据机制注记+本席亲跑直证在卷）**：§9 门矩阵 neg:all 等五目标无 isolated 收据机制（run 证据仅卷内表格/文字承载·无 receipts/ 逐 run 归档文件）——nail 席于并线树 `06f120b7` 亲跑 `pnpm neg:all` 补直证：**EXIT=0·全卷 PASS 行恰 687·六段 90/90/91/102/179/135 对 §2-4 基线逐位恰等零漂移**（隔离容器 `meetwise-e2e-59418-1792100756064`@127.0.0.1:54227·run 完 2026-10-15T21:46:49Z·原始终端 log 不入树=与 §2-9 恰 tracked 路径门自洽·本条文字即收据载体）。
- **P2-3（CI 签名引注标注树版本）**：§1.1 派单观测与 §9 字段②「与 CI 首曝签名逐字同形」的 CI 签名引注补树版本注记——①CI 首曝观测树=**PR #108 verify @ `origin/feat/mysql-schema-skeleton` `0c94d1ec` 波**（integrity nail 推送 run·引帧=proof.ts `:72:19`·协调方派单 brief 载·§1.1「本席不重测 CI」口径沿承）；②挡板期对照=**树 `3229360a` verify 恰 step 72 一红·step 80（ci.yml `:292-293`）skipped**（`0c94d1ec` 在树 integrity 卷 §9-④ 亲证引）；③本地改前基线 run 全栈帧 `retrieval.ts:285:21`（§9 表 0a）=检索变体 **`2c5ed849`** 的 denseRows `await c.query` 行（cat-file 亲证）——nail 并线后变体 `3fd0c292`（owner-surface 345 行版）该读路径重排为 DENSE_SEARCH_WITH_OWNER `:279` 常量+`:305` 探针形·`:285` 现为注释行——**红签名行号树版本敏感·后继签名比对须按树 pin·不得跨树逐字比对**。

---

*QBANK-PIPELINE-SCOPE REQUEST · 2026-10-14 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`0036ddd8`（origin tip·fetch 后亲证=i18n nail 波 tip 之上）· 分支 `line/qbank-pipeline-scope` · 工作树 `meetwise-qpl`（`git worktree add ../meetwise-qpl -b line/qbank-pipeline-scope origin/feat/mysql-schema-skeleton` 本起草席亲立）· 立项出处=协调方派单 brief（CI step 72 翻面后下一首曝红·`qbank-pipeline:prove` EXIT=1·`qbank_retrieval_scope_missing`@`qbank-pipeline.proof.ts:72:19`）+integrity 席1 A/B 直证（非 integrity 刀因果·预存）· 诊断三项=调用链三缺口（hitsFor `:55-61`+`:73-74`+`:82-83`·wrapper 面 `scope?` 供给缺·asPrincipal 在场非缺）+归因五环（红因果引入=`b20ee350` 0176 五函数 fail-closed·`1408d8c2` 0187 owner 维度扩入·AG39 普查「wrapper 间接两 proof 不在现行门矩阵登记」分类误判=漏供给直接成因（ci.yml@1408d8c2 :258 已登记亲证反证）·CI verify job 步序贯掩蔽链·生产面零嫌疑）+修法定谳=候选甲采纳（scope 参两字段形三缺口同批·wrapper 面 canonical 沿 qbank-generation `search()` `:71-72` 直亲同族+rag03/eval-pg/fusion 三先例·与 qsf `:556` set_config 形为分调用面同族 carrier·DB 效应恒等四 GUC）·候选乙（断言改形弱化）否决 Ban·恰 1 测试文件净 +2 行·est live=0·pins 十一值照抄·markers=0（亲跑）·docs:check 基线 2158≤2168 本席亲跑·STOP=`draft:awaiting_pre_exec_dual`·⛔push ⛔merge 主线 ⛔force push 未用*

*EXEC 落卷 2026-10-14·序1 merge `62e3fca8` --no-ff 并 `d186dffc`（cap 2176 sanction 锚恰等·零冲突）·序2/3 P1-RP 三项修订+§0 全量重 pin 落卷（§0.0 交叠复核回执+§0.4：15 blob 零漂移+3 补 pin+行锚勘正八项）·序4 四 hunk 落 `apps/worker/test/qbank-pipeline.proof.ts`（`6aa34cc7`→`1c0cccd7`·+4/−2·臂①-⑤断言零字节改）·序5 主门红翻绿（改前基线 run EXIT=1 `qbank_retrieval_scope_missing`@`:72:19` 同 CI 签名→改后恰 1 run EXIT=0 全臂绿·零 retry）·门矩阵 20 门全绿（九邻面 26/53/16/12/28/12/16/7/33+rag-generation 40+neg:all 687 六段 90/90/91/102/179/135 恰等+interview 57+migrate `applied=204`+drift+uniqueness+typecheck 8/8 0 cached+lint 12/12 0 cached 五值恰等 601/5235/1421/954/628+docs:check 2161≤2176+markers 五类零命中+diff 恰 2 tracked 路径）·STOP=`executed:awaiting_post_prove_dual`·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push 未用*

*nail 落卷 2026-10-16·序1 merge `06f120b7` --no-ff 并 origin/feat/mysql-schema-skeleton@`0c94d1ec`（integrity nail SSOT tip=retrieval 变体 `3fd0c292` owner-surface 345 行版 ls-tree 恒等亲证·零冲突 7 files +429/−2·本刀 proof 修法零触 retrieval.ts·冲突沿并集解预置未触发·⛔pull --rebase 未用）·序2 post P2 勘误随卷三件（§9-补 append 注记形上文零洗=P2-1 hunk-3/4 行号 :75/:84→`:76`/`:85` 实树亲证+P2-2 门矩阵 neg:all 等五目标无 isolated 收据机制注记·本席亲跑 neg:all EXIT=0 PASS 恰 687 六段 90/90/91/102/179/135 恰等补直证+P2-3 CI 签名引注树版本三注含 `:285:21` 帧=`2c5ed849` denseRows 行·`3fd0c292` 已重排 :279/:305 不得跨树比对）·序3 docs:check 复跑 EXIT=0 ≤cap 2176 本席亲跑·序4 SSOT 三处随卷（LEDGER 刀位图 QBANK-PIPELINE-SCOPE 行+配套管线 qbank-pipeline-scope nail 行+checklist「Line qbank-pipeline-scope nail」段·支线树内改主仓路径文件随支线推·⛔主仓单独 commit 未犯）·序5 push（REMOTE-IS-ANCESTOR `git push origin HEAD:feat/mysql-schema-skeleton` 直推非 force+支线 push origin line/qbank-pipeline-scope）·序6 CI 观察 PR #108 逐 job（本刀使命·**预期 step 80 qbank-pipeline 翻面 SUCCESS**·fail-fast 继续解除·81-103 实跑·新首曝红逐帧如实上报定性）·est live=0·actualSpendCny=null·⛔force push 未用*
