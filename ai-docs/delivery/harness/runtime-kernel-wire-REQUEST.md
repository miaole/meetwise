# RUNTIME-KERNEL-WIRE REQUEST — 运行内核接线修复刀（CI verify step 97 新首曝红·proof 由隔离 runner 预迁移而 CI 步指 raw 别名=结构性接线缺·恰 1 workflow 文件恰 1 行 run 值翻·runtime-kernel-wire 战役·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席落卷 2026-10-16·pre-exec 双审会签 PASS 席1 agent_6b5f6604+席2 agent_3e3ab89b+协调方 EXEC 授权·merge `80a22fc8` 并 12b21412+恰 1 行修法+门矩阵全绿（§9）·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · est live=0 · ⛔push⛔merge 主线）

**席位**：RUNTIME-KERNEL-WIRE 诊断+起草席（诊断+起草双责·协调方派单·qpl nail 席 CI 逐帧定性=「结构性接线缺·rag-cache 同族」）。
**基线**：`feat/mysql-schema-skeleton` @ `fc64c7c9`（qpl nail SSOT commit·fetch 后 origin tip 亲证=任务书下界恰等·`git log --oneline -1 origin/feat/mysql-schema-skeleton`=`fc64c7c9` 双值恒等）· 分支 `line/runtime-kernel-wire`（本起草席 `git worktree add ../meetwise-rkw -b line/runtime-kernel-wire fc64c7c9` 亲立·HEAD 落 `fc64c7c9` 亲证）· 工作树 `meetwise-rkw`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（RUNTIME-KERNEL-WIRE 运行内核接线修复刀·qpl nail 席 CI 逐帧定性在卷：红签名=`error: relation "ai_model_dispatch_slot" does not exist`（42P01）@`packages/ai-runtime/test/runtime-kernel.proof.ts:35:3`（main 首语句 TRUNCATE）·步起 2 秒即触·`DATABASE_URL=localhost:54329/meetwise`·机制=proof 体注自承「由隔离 runner 预迁移·原 01_schema 重放 bootstrap 整块移除（DBHY-1）」而 ci.yml verify job 对服务 PG 全文件零迁移步·81-103 掩蔽段首次实跑·预存非新引入）；②CI 步定义 `.github/workflows/ci.yml:330-331`（步名「运行内核（db 四原语 + ai-runtime invoke 双校验·重试·幂等 / 状态机 / 租约 / 可恢复 / 幻觉拦截）」→ `run: pnpm runtime:prove`）；③结构范本 `ai-docs/delivery/harness/qbank-pipeline-scope-REQUEST.md`（`472719ea`·§0-§8 形制）+在飞 `line/dbacl2-ci-wire`@`4ace2d5f`（isolated-runner 恒同形接线先例卷·单步版形制）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg(-a)/sed/Read/git hash-object/gh 实测 @`fc64c7c9`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list | grep -c runtime-kernel`=**1**（建后恰本树）；`git branch --list "line/runtime-kernel*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep runtime-kernel` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠登记（EXEC 立项日必复核）**：本刀唯一产品触面=`.github/workflows/ci.yml:331`（单行 run 值）。在飞 `line/dbacl2-ci-wire`@`4ace2d5f`（draft 态·非本树祖先）计划 ci.yml 纯增 4 行（插入锚=DBHY-1 步 run 行 `:192` 后·failover 步 `:193` 前）——与本刀 `:331` 值翻**零 hunk 交叠**（git 自并零冲突·并线后本刀行锚 `:331`→`:335` 平移·结论零变）；该卷自证 verify steps=102 与本树 js-yaml 亲测恒等。残枝 `origin/line/db-hygiene` 顶触 ci.yml=`1ab83bd8`（qpl 卷 §0.0 已登记残枝三枝之一·非本刀面·EXEC 日照录）。EXEC 立项日对上述两 ref 重跑 `git log <ref> -1 -- .github/workflows/ci.yml`+`git merge-base --is-ancestor` 逐树复核，任一分支顶对本刀行面存在基线后新增提交→触 §8-1 停。
- **ci.yml blob 跨卷恒等自证**：本树 `git hash-object .github/workflows/ci.yml`=`97252708`（361 行）——与 qpl 卷 §0.1 pin（`97252708`/361 行）及 dbacl2 卷重 pin（`97252708`/361 行/steps=102）三卷同值=ci-wiring3 四步并线后稳定 blob·零漂移。

### 0.1 blob 锚表（`git hash-object` 亲算 @`fc64c7c9`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `.github/workflows/ci.yml` | `97252708`（361 行·**本刀唯一码改面**·verify steps=**102**=3 uses+99 name/run·js-yaml@4.3.2 本席亲解析） | **`:25` `verify:` job 起·`:27-30` job env（`:30` `DATABASE_URL: postgresql://…@localhost:54329/meetwise`）·`:153` `- run: pnpm db:up`（服务 PG 唯一起法=dev compose 空卷·`016402d6` 零 initdb 挂载）·`:154-160` wait for postgres（`:157` `docker exec meetwise-postgres-dev pg_isready`）·`:163-164` 「四原语」步 `- run: pnpm db:prove`（=服务 PG 唯一 schema 供应面·`docker exec -i … psql < proof/primitives.sql` 根脚本直连形）·`:247-262` ci-wiring3 四接线步（scoring-integrity :253/tokenstream :256/stress :259/uc003 :262·isolated-runner 恒同形在树先例）·`:330` 步名「运行内核…」·`:331` `run: pnpm runtime:prove`=**本红步·本刀手术行（js-yaml 0-based idx 95·GH UI 序 97=yaml 1-based+1 隐式步·双口径并列防漂）**·`:332` 下一既有步 graph:prove（raw 形=step 97 翻面后下一首曝红嫌疑·预登记） |
| `packages/ai-runtime/test/runtime-kernel.proof.ts` | `6db1edea`（321 行·本刀零触） | **`:5` 头注「pnpm runtime:prove (需 pnpm db:up)」·`:13` `createPool()`（读 env DATABASE_URL 直连）·`:28-29` DBHY-1 体注原文「sql/01_schema 兼容镜像退役——本 proof 由隔离 runner 预迁移(migrations 单真相,含 0033-0130 全链)，原「01_schema 重放 + 逐迁移补跑」bootstrap 整块移除(断言面不变)」·`:30-34` TRUNCATE 必要性注（0037/0085 增量表·slot 受管账本不清则 ON CONFLICT 空转误报 model_dispatch_preflight_failed）·`:35` `TRUNCATE ai_model_dispatch_slot, ai_model_logical_node_header, ai_model_invocation, ai_model_invocation_transition_permit`=CI 42P01 首曝抛点（首表 0085 建表）·`:74-75` DBHY-1(0145) 幂等冒烟改打 entitlement_consumption 注·`:321` main catch `process.exit(1)`=EXIT=1 形** |
| `package.json`（根） | `3b04b871`（与 qpl 卷 pin 恒等·零漂） | **`:84` `"runtime:prove": "pnpm -C packages/ai-runtime prove"`=raw 形（CI 现指）·`:85` `"runtime:isolated:prove": "node scripts/run-e2e-isolated.mjs runtime:prove:raw"`=isolated 形（本刀改指目标·已注册零改动）·`:86` `runtime:claim-join:prove`→runner 同族邻件** |
| `packages/ai-runtime/package.json` | `a671c092` | `:15` `"prove": "tsx test/runtime-kernel.proof.ts && tsx test/claim-join-orphan.proof.ts && tsx test/diag-honesty-prompt.proof.ts && tsx test/ag24-langfuse-model.proof.ts"`=四 proof 链（isolated 形全链同跑） |
| `scripts/run-e2e-isolated.mjs` | `0787a7ff`（3201 行·与 dbacl2 卷 pin 恒等·零漂） | **`:2125` `runtime:prove:raw` 在目标白名单·`:2246-2247` 命令映射 `runtime:prove:raw`→`['pnpm',['-C','packages/ai-runtime','prove']]`（与 raw 形同链·isolated 壳内全四 proof）·`:3098` DBHY-1 预迁移名单含 `runtime:prove:raw`（名单头注「DBHY-1: sql/ 兼容镜像退役(案A 机械迁面)——这些目标改为预迁移(migrations 单真相)」·命中即 `await migrateWithRecovery(env)`+post-migrate waitForPostgres consecutive=3）·`:225` `runtime:claim-join:prove:raw` 有 isolatedReceiptSources 条目而 `runtime:prove:raw` 无（`:93` 映射·`:3176` `if (sources)` 守卫=receipt 不产出·P2 残面如实登记不借机修）·`:2619` 容器名 `meetwise-e2e-${pid}-${ts}` 只删自建** |
| `packages/db/proof/primitives.sql` | `748808d0` | `:16` CREATE TABLE interview·`:24` consumption_record·`:30` interview_event——**恰 3 表**=CI 服务 PG 实际 schema 面（经 db:prove 步灌入）；0037/0085/0088 迁移表恒缺 |
| `packages/db/migrations/0085_ai_model_logical_node_dispatch_slot.sql` | （文件锚·行锚 `:56` CREATE TABLE ai_model_dispatch_slot） | 本红首缺表来源（同文件建 ai_model_logical_node_header）；`0037`=ai_model_invocation·`0088`=ai_model_invocation_transition_permit·`0033`=ai_cost_price_book——依赖表集四增量迁移全在隔离 runner 预迁移链内 |
| `packages/db/test/qbank-retrieval-cache.proof.ts` | `29ed66ab`（rag-cache 同族对照·本刀零触） | 头注「需 pnpm db:up」·`assertIsolatedTestTarget`+`proofDatabase=meetwise_qbank_cache_proof_${randomUUID()}`=nonce 硬隔离（独占临时库+隔离靶断言）——对照详 §1.2-环⑥ |
| `ai-docs/delivery/harness/dbhy1-db-hygiene.md` | `cd0c7fc6` | DBHY-1 裁决卷（sql/ 兼容镜像退役·预迁移单真相）——候选乙否决裁据 |
| `ai-docs/delivery/harness/ci-wiring3-REQUEST.md` | `e23ac6b0` | 接线形制定谳卷（§1.2「isolated-runner 形先例=neg 六步+scor-parity·纯 `- name:`+`run: pnpm <target>` 步·零 env 零 cond 零 retry」） |
| `ai-docs/delivery/harness/qbank-pipeline-scope-REQUEST.md` | `472719ea` | 形制范本+掩蔽链同型先例（step 80 翻面→97 首曝） |
| `ai-docs/delivery/harness/product-campaign-LEDGER.md` | `d10bcf28` | `:471`/`:524` integrity nail 行承登「rag-cache（结构性未接线门）」——同族承登在案；RUNTIME-KERNEL 行=协调方翻面权 |

### 0.2 派单简报漂移登记（结论零变或收敛·如实改锚）

1. **简报「甲=ci.yml step 97 改 isolated runner 形·需 runner 注册该 proof——注册面核查」→ 定谳=注册面三处全在·零注册缺口**：`0787a7ff` `:2125`（白名单）+`:2246-2247`（命令映射）+`:3098`（DBHY-1 预迁移名单）逐一亲证在位；根别名 `3b04b871:85` 已在。**修法自简报预估收敛=ci.yml `:331` 恰 1 行 run 值翻·runner 与根 package.json 零字节改**（§1-修法件①）。
2. **简报「本地跑门值=需 pnpm db:up（isolated runner 形绿否亲跑）」→ 已亲跑双证**：绿=`pnpm runtime:isolated:prove` 捕获跑 EXIT=0（`migrations: applied=204 skipped=0`+post-migrate READY·四 proof 链 ✓ 收官·`^PASS` 83/`^FAIL` 0·容器 `meetwise-e2e-80326-1792103165271@127.0.0.1:52865`）；红=空库 raw 形逐字复现 CI 签名（§1.2-环⑤）。头注 `:5`「需 pnpm db:up」=本地门值·CI 服务 PG 无迁移步=该本地前提在 CI 恒缺——即结构性缺口本体。
3. **简报「step 97」→ 双口径并列**：GH UI 序=97（`gh run view 38813291785 --json jobs` steps[].number=97 亲证·含 runner 隐式步 +1）；yaml 口径=verify steps 0-based idx 95（js-yaml 亲解析·与 dbacl2 卷「UI 序=yaml 1-based+1」口径恒等）。
4. **简报「rag-cache 同族」→ 同族度定谳=半同族**（§1.2-环⑥）：根脚本直连同族是·runner 零注册非（三处在）·nonce 硬隔离非（本 proof 无 assertIsolatedTestTarget·直连 env 库）·CI 步缺位非（步在位 `:330-331` 仅指错别名）——runtime-kernel=「wired-but-mis-wired」（已接线指错形）·rag-cache=「un-wired」（结构性未接线门·LEDGER `:471` 承登）·故本刀修法量级恰 1 行·rag-cache 归专刀。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**204**·头 `0204_ai_cost_cached_input_price.sql`（与 qpl 卷 0.3 恒等）。
- 本刀修法=纯 workflow 值翻·**预期零迁移零 DDL 零依赖变更**。EXEC 期若实测产生非预期迁移/码面需求→停（越界需要类）上报。

## §1 红事实与归因链（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 CI 首曝形（观测面·gh 亲证）

- `gh run view 38813291785`（headSha=`fc64c7c9`·2026-10-15T21:53:54Z 起跑）：verify job **step 97「运行内核…」=failure**·steps 81-96 全 success·98-103 连锁 skipped（fail-fast 序贯）·log 逐字=`error: relation "ai_model_dispatch_slot" does not exist`（`2026-10-15T22:06:45.3749762Z`）+帧 `at async main (/home/runner/work/meetwise/meetwise/packages/ai-runtime/test/runtime-kernel.proof.ts:35:3)`——与派单签名逐字恒等·与 §0.1 锚行恒等。
- 门管线：`pnpm runtime:prove`（`:331`）→`3b04b871:84`→`pnpm -C packages/ai-runtime prove`→`a671c092:15` 四 proof 链·**首语句 `:35` TRUNCATE 即触**（`DATABASE_URL` 取 job env `:30`=服务 PG 54329）·42P01 未捕获→`:321` catch→EXIT=1。
- 首曝语义：服务 PG 由 `:153` db:up（空卷）+`:164` db:prove（primitives.sql 恰 3 表）构成·TRUNCATE 首表 `ai_model_dispatch_slot`（0085 建）不在其列→步起即 42P01（秒级·与简报「步起 2 秒即触」相容）。

### 1.2 归因链（六环·git log 双向+逐文件亲证+本席亲跑）

- **环①（因果引入·双向）**：`git log -S "01_schema" --follow -- packages/ai-runtime/test/runtime-kernel.proof.ts`=三 commit（`9c92826e` 初建引入→`fc472d97` 统一模型出口→**`ea4e5796` DBHY-1 EXEC 移除 bootstrap 整块**）；`git log -S "TRUNCATE ai_model_dispatch_slot"` 恰 1 命中=`5d33e81d`（slot 账本显式清防误报引入）；`git log -S "pnpm runtime:prove" -- .github/workflows/ci.yml` 恰 1 命中=`9c92826e`（初建即 raw 形·**从未接线 runner**）。→ 红因果引入=`ea4e5796`（DBHY-1）：proof 前提自「自带 bootstrap」改为「隔离 runner 预迁移」·而 CI 步自初建即 raw·两前提在 `ea4e5796` 落线时起不相容=**红预存**。
- **环②（服务 PG 供应面·结构性缺）**：ci.yml 全文件对 `meetwise-postgres-dev` 的供应恰两处=`:153` db:up（`016402d6` pgvector/pgvector:pg16·命名卷·零 initdb 挂载=空库）+`:164` db:prove（`748808d0` 恰 3 表）。`migrate:prove`（`:168`）/`migrate-cli:prove`（`:291`）/`drift:prove` 均隔离容器自持目标（`0787a7ff:3098` 名单内）**零一对服务 PG 应用迁移的步**——0037/0085/0088 增量表面在 CI 服务 PG 恒缺。
- **环③（掩蔽链·首曝时序）**：verify job 步序贯 fail-fast·上游 step 72（integrity 刀翻面 `0c94d1ec` 时代）/step 80（qpl 刀翻面 `fc64c7c9` 时代）两基线红长期掩蔽下游；两 nail 后 81-103 段首次实跑（分支全史 verify 零 success 面）→step 97=新首曝红·**预存非新引入**（环① 时序与掩蔽机制互证·qpl/integrity 同型）。
- **环④（runner 形绿直证·本席亲跑）**：`pnpm runtime:isolated:prove` 捕获跑 **EXIT=0**（无管道 `CAPTURE_EXIT=0` 原值在卷）：容器 `meetwise-e2e-80326-1792103165271@127.0.0.1:52865`·`migrations: applied=204 skipped=0`+`E2E_POSTGRES_READY label=post-migrate consecutive=3`·四 proof 链全绿（runtime-kernel「全部通过」/claim-join「HC-GAP-011 named cases passed」/diag-honesty/AG-24 四 ✓ 收官行在卷·`^PASS` 83·`^FAIL` 0）——**runner 注册面三处（环④即甲候选可行性直证）+预迁移链=本红闭合充分路径**。
- **环⑤（红绿对同树亲证）**：一次性 throwaway 容器 `meetwise-rkw-red-pg`（非 runner 命名空间·本席自建自清 `docker rm -f` 回执在卷）+raw 形 `tsx test/runtime-kernel.proof.ts` 对空库→逐字复现 CI 签名 `error: relation "ai_model_dispatch_slot" does not exist`（code 42P01·帧 `runtime-kernel.proof.ts:35:3`）·**TRUE_EXIT=1**——红=供应面缺非断言错·归因闭环。
- **环⑥（rag-cache 同族对照）**：`rag-cache:prove`（`3b04b871:512`）=`pnpm -C packages/db prove:qbank-cache`=raw tsx 直连（根脚本绕 runner 同族是）；runner 零注册（`grep qbank-cache|rag-cache scripts/run-e2e-isolated.mjs` 零命中）+ci.yml 零步（grep cache 恰 `:40` pnpm 缓存一行之差）+proof 内 nonce 硬隔离（`29ed66ab` assertIsolatedTestTarget+`proofDatabase=…${randomUUID()}` 独占临时库）=**结构性未接线门**（LEDGER `:471`/`:524` 承登）。runtime-kernel 同族度=根脚本直连同族·余三面全异（§0.2-4）→半同族·修法量级差三个数量级（1 行 vs 接线三面）。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=ci.yml `:331` run 值 `pnpm runtime:prove`→`pnpm runtime:isolated:prove`（恰 1 行值翻）**：根别名 `:85` 已注册（零根改动）·runner 三处注册面全在（§0.2-1）·`runtime:prove:raw` 在 DBHY-1 预迁移名单=隔离壳内全迁移链自持（环④直证绿）·四 proof 链同跑=覆盖面较现状只增不减。先例三处：ci-wiring3 `2d1cc66b`（四门 isolated-runner 恒同形·已在树 `:247-262`）+dbacl2-ci-wire `4ace2d5f`（同形单步·在飞）+neg 六步/scor-parity 既有步族（`e23ac6b0` §1.2 形制定谳=「纯 name+run 步·零 env 零 cond 零 retry」）。改后行为=隔离容器+全迁移链+宿库零触·与同 job 既有 isolated 步（api:validate `:334` 等）资源形恒同。
- **候选乙（否决·Ban）=proof 内 bootstrap 回填（迁移动面·简报已标 Ban 倾向）**：`ea4e5796`（DBHY-1 EXEC）恰是移除该块的 commit·体注 `:28` 自承「由隔离 runner 预迁移(migrations 单真相)」=修法方向已被 DBHY-1 裁决钉死（`cd0c7fc6` 退役案 A 单真相·runner 名单 `:3098` 头注同口径）；回填=复活已退役 sql/01_schema 双真相+翻已裁门形+与 runner 预迁移名单自相矛盾。否决。
- **候选丙（否决·失据）=local-only（步 skip/删除/降 nightly）**：卷内零裁据且反证在卷——`ai-docs/requirements/use-cases/UC-interview-submit-answer.md:33-37` E1/E2/E4/E5 四业务验收臂挂 `runtime:prove` 为断言载体+`ai-docs/testing/golden-tasks/registry.json:129` 登记同名 command=产品面视其为真验收门；步名 `:330` 自承门语义且居 per-push 门链=CI 意图在树；dbacl2 卷候选乙同款否决先例（「local-only 失据否决·原裁据灭失」）。运行内核=db 四原语+invoke 关口核心门·local-only 化=门覆盖回退。否决。

## §1-修法（接线修复刀·预期恰 1 workflow 文件恰 1 行值翻（numstat +1/−1）·零迁移零码面零断言改动）

- **件①（唯一码改·`.github/workflows/ci.yml:331` 单行）**：

  ```yaml
          run: pnpm runtime:isolated:prove
  ```

  （原值 `run: pnpm runtime:prove` 逐字节替换·8 空格缩进保持·步名 `:330` 零字节改·零步增删零 env 零 if 零 retry——ci-wiring3 恒同形纪律）。语义钉死四点：①目标=根别名 `:85`→runner `runtime:prove:raw`→白名单 `:2125`+命令映射 `:2246-2247`（四 proof 链原样）+DBHY-1 预迁移名单 `:3098`（migrateWithRecovery 全链 204+post-migrate 三连 READY）；②服务 PG（54329 dev 库）零触（runner 只建删自建 `meetwise-e2e-*` 容器·`:2619`）·掩蔽期风险归零；③断言面零字节改（proof `6db1edea` 零触·候选乙 Ban 沿承）；④**本刀不触 `:332` 起 raw 形步**（graph/pipeline/web/retrieval 等·§3 范围外·下一首曝红如实上报归协调方逐刀）。
- **件②（EXEC 复核面）**：①改前红证据已在卷双源（CI `38813291785`+起草席环⑤复现·EXEC 期零需重放红——throwaway 重放须申报）；②`pnpm runtime:isolated:prove` 恰 1 复跑 EXIT=0（环④同形·零 retry-to-green）；③js-yaml 解析对 `:331` 新值（§2 门 3）。
- **件③（收据）**：`ai-docs/delivery/receipts/runtime-kernel-wire/00-exec.md`（untracked 不入库·ci-wiring3 先例形）——七字段（门矩阵全表+EXIT 原值+红绿对照+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）。

## §2 验收断言（pre-exec 双审核对单基面·数字口径以实跑实测为准·基线权威值=`fc64c7c9` 树+qpl nail 卷记）

1. **主门（本刀使命）**：改后 CI 观察 verify step 97 翻面 SUCCESS（归 pusher/协调方·门 10）·本地等价证=起草席环④两跑在卷+EXEC 恰 1 复跑 `pnpm runtime:isolated:prove` EXIT=0·四 proof 链 ✓·零 retry。
2. **红证（改前基线·已闭合）**：CI `38813291785` step 97 签名+环⑤空库复现逐字恒等（42P01@`:35:3`·TRUE_EXIT=1）——EXEC 期如需重演须申报。
3. **CI 形模拟**：js-yaml（`node_modules/.pnpm/js-yaml@4.3.2` 本席亲证可用）解析改后 ci.yml：verify steps=**102** 恒等（3 uses+99 name/run）·运行内核 idx 95 run 值=新值·全步名面对基线逐位恒等·恰 1 hunk +1/−1·零 env/if/retry 键增·yamllint 不在仓如实登记（dbacl2 先例）。
4. **邻面**：`pnpm runtime:claim-join:prove` EXIT=0（runner 同族邻件·本刀零触其文件·起草席绿跑内已覆盖·EXEC 恰 1 单目标留痕）。
5. **typecheck/lint 零涉**：本刀触面仅 ci.yml（零 .ts/.mjs）→两门不适用如实登记；EXEC 期触任何码面即停（越界需要类）。
6. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2176**（基线实测 @`fc64c7c9`=**2162** 本席亲跑·落卷后预期 **2163**·余量 13·收据 untracked 不计数）。
7. **markers 五类+冲突标记零命中**：本刀改动集（起草=本卷 .md·EXEC=+ci.yml）五类标记词运行时组装词面 `grep -a` 零命中（`scripts/i6-239-gates.proof.mjs` §2-7 口径·词面不复抄卷内防自匹配·命令与回执入收据）。
8. **diff 面机检**：起草 commit `git diff --numstat` 恰 1 tracked 路径=本卷 .md（+N/−0）；EXEC 卷恰 2 tracked=ci.yml（+1/−1）+本卷状态注记——多任何 tracked 路径即停（越界需要类）。
9. **卫生**：est live=0（isolated 容器零模型外呼·四 mock model）·0 Key 值·`.env*` ABSENT 双向记录·throwaway `meetwise-rkw-red-pg` 已 `docker rm -f` 自清零残留·`actualSpendCny=null`。
10. **CI 观察（归 pusher/协调方·本刀使命终验）**：PR 上线后 step 97 翻面 SUCCESS·98-103 连锁解除实跑·新首曝红逐帧如实上报（`:332` graph:prove raw 形=预登记嫌疑·勿修饰）·全绿即报 verify 里程碑。

## §3 范围外（边界清单·越界即 FAIL）

其余 raw 形步接线（`:332` graph、`:340` pipeline、`:338` web、`:304` retrieval、db:prove primitives 供应形等）——逐刀归协调方；rag-cache 结构性未接线门（LEDGER 承登·归专刀·本刀零触 `29ed66ab`）；runner `isolatedReceiptSources`/watchlist 为 `runtime:prove:raw` 补条目（P2 残面登记不借机修）；DBHY-1 案 A 收敛面；迁移/DDL（§0.3 零预期）；共享 SSOT（LEDGER/checklist 行翻面权归协调方）；cap/sanction（`public-text-policy.mjs` 零触）；依赖升级；其他工作树。

## §4 est live=0（起草 turn·EXEC 期同）

全隔离容器（run-e2e-isolated·四 mock model 零供应商外呼）·零 secrets 消耗·`actualSpendCny=null`·pins 十一值照抄零翻。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban merge 主线；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件② 恰 1 复跑·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 触 proof 断言面与产品码（候选乙/丙否决沿承·`6db1edea`/`a671c092` 零字节）；Ban 触 §3 范围外面（其余 raw 步/rag-cache/runner receipt 面）；Ban 迁移 Ban DDL；Ban 改共享 SSOT 与 cap/sanction；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因红靶外新红（98-103 解除后新红如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 落卷自检（本席亲跑面·起草 turn）

`node scripts/ai-docs/check-docs.mjs` EXIT=0 **2162≤2176**（落卷前基线·起草席亲跑）→落卷后复跑预期 2163；markers 五类改动集（本卷 .md）运行时组装词面+冲突标记 grep 零命中（命令与回执入 commit 卷语·词面沿 i6-239 §2-7 不复抄）；js-yaml 解析基线留痕 verify steps=102·idx95 run 值=`pnpm runtime:prove`·uses=3（`node_modules/.pnpm/js-yaml@4.3.2`）；绿门亲跑凭据=捕获跑无管道 `CAPTURE_EXIT=0`（首跑 tail 观测面全绿但其 EXIT 变量经 `${PIPESTATUS}` 在 zsh 下空回退不作为凭据·如实登记）；红证 TRUE_EXIT=1 原值在卷；diff 恰 1 tracked .md；worktree/分支/卷名防重三查（§0.0）亲证。

## §8 停止条件（触一即停·如实上报勿修饰）

1. **现场漂移**：EXEC 立项日 `fc64c7c9` 后任一在飞分支顶对 ci.yml `:331` 面新增提交（dbacl2-ci-wire 并线致行锚平移=结论零变只更行号·非停）·或届时 tip 对 §0.1 锚 blob 漂移且结论受撼→停上报（重 pin 流程）。
2. **改后 CI 签名不符**：PR 观察 step 97 仍红或红签名≠本卷 §1.1 形→停上报（归因重开）。
3. **isolated 复跑红**：件② 复跑 EXIT≠0→停回炉（环④ 等价证翻·Ban retry 冲销）。
4. **邻面新红**：98-103 解除后任一门现基线外新红→如实登记升级停上报·Ban 借机修（预登记 `:332` graph:prove 嫌疑=上报非停）。
5. **越界需要**：实测产生迁移/DDL/码面触面需求（§0.3/§3）→停上报走认领规则。
6. **docs:check 超限**：落卷后 >2176→停上报（基线 2162·本卷 +1=2163·余量 13）。

**STOP=`executed:awaiting_post_prove_dual`**（EXEC 席终态 2026-10-16·原起草终态 `draft:awaiting_pre_exec_dual` 经 pre-exec 双审会签 PASS 席1 agent_6b5f6604+席2 agent_3e3ab89b+协调方 EXEC 授权后推进·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·nail/行翻面权归协调方·本席⛔push ⛔merge 主线 ⛔force push 未用）。

## §9 EXEC 记录（2026-10-16·EXEC 席·pre-exec 双审会签 PASS 席1 agent_6b5f6604+席2 agent_3e3ab89b·协调方授权 EXEC）

**序回执**：序1 `git fetch`+`merge --no-ff origin/feat/mysql-schema-skeleton@12b21412`（届时 tip=12b21412=ISO-DOTENV-ISOLATION+G7K-REDS-REMAP nail·≥任务书下界恰等·merge-base=fc64c7c9 亲证 is-ancestor·ort 零冲突 6 files +419/−1=checklist/backlog/remap 卷/iso 卷/LEDGER/run-e2e.mjs 隔离守卫·**qpl 波后携入零触 ci.yml 与 runner 零触 run-e2e-isolated.mjs**·冲突沿并集解预置未触发·禁 pull --rebase 遵守·**merge=`80a22fc8`** 双亲 0862948a+12b21412）→序2 §0 全量重 pin（字段④）→序3 EXEC 修法恰 1 行（ci.yml :331 run 值翻·逐字节沿 §1-修法件① 定稿）→序4 门矩阵（字段①）→本 §9 落卷+commit+STOP 三处翻面。

**字段① 门矩阵全表（EXIT 原值·全绿）**：

| # | 门 | 期望 | 实测（EXIT 原值） | 结论 |
|---|---|---|---|---|
| 0a | docs:check **改前基线**（并线后改前树=`80a22fc8`） | EXIT=0·≤cap 2176 | EXIT=0·scanned **2165**（=fc64c7c9 基线 2162+本卷 +1=2163+并线携入 iso/remap 两卷恰 +2·余量 11） | 绿 |
| 1 | 主门 `pnpm runtime:isolated:prove` **恰 1 复跑**（件②·无管道） | CAPTURE_EXIT=0·四链 ✓·^PASS 83/^FAIL 0·零 retry | CAPTURE_EXIT=**0**·容器 meetwise-e2e-2031-1792107105075@127.0.0.1:61344·migrations **applied=204 skipped=0**·post-migrate consecutive=3·四链 ✓ 收官（runtime-kernel「全部通过」/「HC-GAP-011 claim-join named cases passed」/diag-honesty/AG-24）·`^PASS`=**83**/`^FAIL`=**0** 恰等起草环④基线·wall-clock 11s（字段⑦-P2-1） | 绿 |
| 2 | 邻面 `pnpm runtime:claim-join:prove` 恰 1 单目标留痕 | CAPTURE_EXIT=0 | CAPTURE_EXIT=**0**·容器 meetwise-e2e-2572-1792107167803@127.0.0.1:61770·`^PASS`=7/`^FAIL`=0·收官 ✓ HC-GAP-011·receipt release_evidence=false | 绿 |
| 3 | js-yaml 形模拟改后 | verify steps=102 恒等·idx95 run=新值·全步名面逐位恒等·恰 1 hunk +1/−1·零 env/if/retry 键增 | 4.3.2 双解析（`git show HEAD:` 改前 vs 工作树改后）：steps=**102** 恒等（3 uses+99 name/run）·运行内核 idx=**95** run=`pnpm runtime:isolated:prove`·全步名面 diff=**0**·run 值 diff 恰 1 处@idx95·env/if/retry 键前后恒等 0/0/0·numstat 恰 1 hunk +1/−1·yamllint 不在仓如实登记（dbacl2 先例） | 绿 |
| 4 | typecheck/lint 零涉 | 不适用如实登记 | 本刀触面仅 ci.yml（零 .ts/.mjs）→两门不适用（§2-5）·EXEC 期零码面触（§8-5 未触） | 登记结 |
| 5 | 红证闭合面 | EXEC 期零需重演（件②①） | CI `38813291785` step 97 签名+起草席环⑤空库复现双源在卷·EXEC 期零重演零 throwaway 容器 | 闭合 |
| 6 | docs:check **改后**（§9 落卷+收据落盘后终态面） | EXIT=0·≤cap 2176 | EXIT=0·**2166**≤2176（余量 10·=改前 2165+收据件恰 +1——**收据 untracked 仍入 worktree 扫描面计数：起草 §2-6「收据 untracked 不计数」预期实测否定·偏离清单③如实登记**·ci-wiring3 cap 冲突同构成而本刀余量充足绿·cap sanction 权归协调方零自升） | 绿 |
| 7 | markers 五类 | 改动集零命中 | 四标记词+冲突标记对（词面运行时组装·防自匹配·不落卷）对改动集两文件 grep -a·**零命中** | 零命中 |
| 8 | diff 面 | EXEC 恰 2 tracked | vs HEAD `80a22fc8`：ci.yml **+1/−1**+本卷 .md（§9 append+三处终态翻转）；vs merge 第二亲 `12b21412`：ci.yml +1/−1+本卷 .md 全新增形（iso 勘误一同款口径）——两口径均恰 2 tracked 零第三·收据 untracked 不入库不入 diff | 恰等 |
| 9 | 卫生 | est live=0·0 Key·.env* ABSENT·容器零残留·零 lockfile 改 | est live=0（四 mock model 零供应商外呼）·0 Key 值·根+apps `.env*` ABSENT 双向亲证·runner 容器自清（runner 只删自建机制）·零 lockfile 改·actualSpendCny=null | 恒等 |

**字段② 改前改后行为对照**：ci.yml :331 单行 run 值翻（§1-修法件① 逐字节·8 空格缩进保持·步名 :330 零字节改·零步增删零 env 零 if 零 retry）——改前 `pnpm runtime:prove`（raw 直连 job env 服务 PG 54329·供应面恰 primitives 3 表·proof 首语句 TRUNCATE 首表 42P01 EXIT=1·步起约 2s·CI 帧 `38813291785`）；改后 `pnpm runtime:isolated:prove`（根别名 :85→runner `runtime:prove:raw`·隔离容器自持+DBHY-1 预迁移全链 204+四 proof 链同跑·服务 PG 零触）——断言面零字节改（proof `6db1edea` 恒等亲证·候选乙 Ban 沿承）·:332 起 raw 形步零触（§3 范围外沿承）。本地等价证=门 1 复跑绿（红绿对照：改前红=CI 帧+环⑤在卷·改后绿=门 1·同树零 retry）。

**字段③ diff numstat**：`.github/workflows/ci.yml` **+1/−1**（:331 单行 run 值翻·恰 1 hunk）+本卷 .md（本 §9 append+Status/§8/卷尾三处终态翻转）——恰 2 tracked 路径零第三（门 8）。

**字段④ 重 pin 全表（对届时树=`80a22fc8`）**：§0.1 十一锚逐一——ci.yml `97252708`/361 行**恒等**（行锚 :25/:30/:153/:164/:253/:256/:259/:262/:330/:331/:333 grep -n 逐条恒等）·proof `6db1edea`/321 **恒等**（:5/:13/:28-29/:35/:321 逐字亲证）·根 package.json `3b04b871` **恒等**（:84/:85/:86）·ai-runtime package.json `a671c092` **恒等**（:15 四链）·runner `0787a7ff`/3201 **恒等**（:2125 白名单/:2246-2247 命令映射/:3098 DBHY-1 预迁移名单/:225 receipt 面仅 claim-join/:3176 if(sources) 守卫/:2619 容器名——P2 残面零借机修沿承）·primitives `748808d0` **恒等**（:16/:24/:30 恰 3 表）·0085 行锚 :56 CREATE TABLE **恒等**·rag-cache `29ed66ab` **恒等**·dbhy1 `cd0c7fc6` **恒等**·ci-wiring3 `e23ac6b0` **恒等**·qpl 卷 `472719ea` **恒等**；**漂移一笔如实改锚**：LEDGER `d10bcf28`→`e484c6b7`（589 行=12b21412 iso+remap nail SSOT 四行携入·生命周期预期漂移·rag-cache 承登 :471 恒等/:524→:526 平移·结论零变）。迁移链 204·头 `0204_ai_cost_cached_input_price.sql` **恒等**（§0.3 恒等）。**步骤基线口径=102**（双口径落定：dbacl2 未并主线实证=ci.yml blob `97252708` 恒等→本刀行锚 **:331 维持**·非 :335 平移·verify steps **102 维持**·GH UI 序 97 双口径并列防漂沿承）——**停止条件 1 未触**。

**字段⑤ 偏离清单（零实质偏离·三项透明登记）**：
1. 主门 wall-clock 实测 11s 低于派单简报预估 band「+25-60s」下沿（P2-1 详字段⑦·如实登记非修饰）。
2. 门 3 全步名面初版比对以临时快照文件按行切分，因 yaml 折行步名（名内含换行）错位误报漂移——改 HEAD/工作树双解析内存比对定谳步名 diff=0（比对方法学勘误·非现场漂移·门 3 结论零变·临时件清场）。
3. 起草 §2-6「收据 untracked 不计数」预期实测否定：收据件落盘后 docs:check scanned 2165→**2166**（untracked 文件仍入 worktree 扫描面计数·ci-wiring3 门 8 cap 冲突同构成）——本刀 cap 2176 余量充足 EXIT=0 绿·零 cap 自改·如实登记归协调方知悉（后继刀若基线贴 cap 需预留收据 +1 预算）。

**字段⑥ pins 零翻声明**：十一值照抄零翻转——haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。全门矩阵跑后零翻转。

**字段⑦ P2 三件承载落点（协调方 EXEC 令·随卷注记）**：
1. **P2-1 时长对照落 EXEC 收据**：改前失败形=CI step 97 步起约 **2s** 即触 42P01 EXIT=1（gh 帧 `38813291785` log 时戳 2026-10-15T22:06:45Z）；改后 isolated 形本地单次复跑 wall-clock 实测 **11s**（pnpm 全调用含容器 boot+204 迁移+四链·本机 docker 29.1.3·零 retry）——**Δ≈+9s/步·低于简报 band「+25-60s」下沿**，如实登记不修饰（band 系简报预估值·本地机与 CI runner 性能差面·CI 侧实际 wall-clock 归门 10 CI 观察面由 pusher/协调方逐帧照录）。收据=`ai-docs/delivery/receipts/runtime-kernel-wire/00-exec.md`（untracked 不入库·ci-wiring3 先例形）。
2. **P2-2 dbacl2 pin 引注新鲜度（EXEC 日复核即清）**：dbacl2 tip `4ace2d5f`→**`08e0590c`**（rev2 勘误落卷 docs-only +14/−0 零触 ci.yml·`git log ccl/line/dbacl2-ci-wire -1 -- ci.yml` last-touch=`2d1cc66b` 已在主线=对本刀行面零基线后新增提交·§8-1 未触）；且 `08e0590c` 非 `12b21412` 祖亲（dbacl2 未并主线）→§0.0 预置双口径按届时树实测取 **「rkw 先并」臂=行锚 :331 维持/steps=102 维持**。残枝 `origin/line/db-hygiene` last-touch ci.yml 仍=`1ab83bd8`@2026-10-08 照录零变。
3. **P2-3 proof :5 头注陈旧登记不修**：修后 CI 语境 proof.ts :5「pnpm runtime:prove (需 pnpm db:up)」陈旧化（CI 步改指 isolated 形=容器自持+预迁移零需 db:up·raw 形本地门值仍真）——沿 Ban 列表「Ban 触 proof 断言面」零字节不修（`6db1edea` 恒等亲证）·登记归协调方/后继刀酌处。

**STOP=`executed:awaiting_post_prove_dual`**（§9 落卷即停·post-prove 双审两独立外席待派·nail/批表/行翻面权归协调方·本席⛔push ⛔merge 主线 ⛔force push 未用）

---

*EXEC 落卷 2026-10-16·序1 merge `80a22fc8` --no-ff 并 origin/feat/mysql-schema-skeleton@`12b21412`（=ISO+REMAP nail≥下界恰等·零冲突 6 files +419/−1·merge-base=fc64c7c9 亲证）·序2 §0 全量重 pin（十 blob 锚恒等+LEDGER `d10bcf28`→`e484c6b7` 漂移改锚=nail SSOT 四行携入·迁移链 204/0204 恒等·步骤基线口径=102·行锚 :331 维持=dbacl2 未并主线实证）·序3 EXEC 修法恰 1 行（ci.yml :331 run 值翻·逐字节沿 §1-修法件①）·序4 门矩阵全绿（改前基线 docs:check 2165+主门 `pnpm runtime:isolated:prove` 恰 1 复跑 CAPTURE_EXIT=0·applied=204 skipped=0·四链 ✓·`^PASS` 83/`^FAIL` 0·wall-clock 11s+邻面 claim-join CAPTURE_EXIT=0+js-yaml 形模拟 steps=102 恒等步名面 diff=0 run 值 diff 恰 1@idx95+markers 五类零命中+diff 恰 2 tracked+卫生恒等）·P2 三件落点在 §9 字段⑦（时长对照 Δ≈+9s 低于 band 下沿如实登记/dbacl2 新鲜度复核即清 tip `08e0590c` 零触本刀行面/proof :5 头注陈旧登记不修）·收据 `ai-docs/delivery/receipts/runtime-kernel-wire/00-exec.md` untracked 不入库·STOP=`executed:awaiting_post_prove_dual`·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push 未用*
