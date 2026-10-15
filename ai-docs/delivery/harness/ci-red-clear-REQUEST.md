# CI-RED-CLEAR REQUEST — PR #108 双红+僵尸步清欠刀（gitleaks allowlist 补登+provider-egress manifest 补账+breaker:prove 僵尸步删除+lint 基线注释对表·ci-red-clear 战役·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-14 · rev2 amend 2026-10-14＝pre-exec 双审双 FAIL 处置（P0 假 key 字面脱敏+P1 numstat 实测修正+P2 五项+§0.2-4 升级项登记）·旧起草卷 commit `b0877528` 已被 amend 重写失效·新 SHA=本 commit · pre-exec 双审两外席待派 · alone≠dual · 本 commit docs-only 恰 1 .md · ⛔push）

**席位**：ci-red-clear 起草席（诊断已由 CI 对账席完成·本席四项现场核验+起草·协调方派）。
**基线**：`feat/mysql-schema-skeleton` @ `79382f4d`（`git fetch` 后 origin/feat/mysql-schema-skeleton 与本地支线同指 `79382f4d` 亲证）· 分支 `line/ci-red-clear`（本起草席 `git worktree add ../meetwise-crc -b line/ci-red-clear feat/mysql-schema-skeleton` 亲立·HEAD 落 `79382f4d` 亲证）· 工作树 `meetwise-crc`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①CI 对账席 brief（2026-10-14）：PR #108（main←feat/mysql-schema-skeleton）近 5 次 run 全 failure·两红根因+一僵尸+一注释漂移（§1 逐项亲证）；②修法先例四 commit：`626ac3cc`（gitleaks allowlist 先例一：receipts 假 token·+3 行）+`98d4bab7`（gitleaks allowlist 先例二：test-support-fakes.proof.ts·「沿 626ac3cc 形制」）+`16114f7d`（egress manifest 补账先例：MODEL_BACKUP_API_KEY@estimator-v2-cjk·+5 行·「0e85de19 新增 proof 引 env 未入 manifest=主线 tip CI 红根因」同构）+`724d61b5`（AG24 EXEC·熔断机制整删刀·僵尸步成因）；③形制范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8+STOP 三条款+四类停止条件）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object/实跑实测 @`79382f4d`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git branch --list "line/ci-red-clear*"` 恰 1 命中=本席分支（建前零命中）；`git worktree list | grep -c crc`=1；`ls ai-docs/delivery/harness/ | grep -c ci-red-clear` 建前=0→落卷后唯一同名卷=本卷。
- **在飞交叠复核（EXEC 立项日必做）**：本刀三产品触面=`.github/workflows/ci.yml`+`.gitleaks.toml`+`ai-docs/architecture/ai/provider-egress-inventory.json`。起草日扫描：全 `line/*` 分支逐一 `git log -1 --format=%H -- <file> <branch>`+`merge-base --is-ancestor` 判定=**三触面零在飞交叠**（全部末触 commit 均 HEAD 祖先亲证）。EXEC 日重扫同口径，任一分支出现非祖先新触→触停止条件「现场漂移」停手上报。
- **ci-wiring3 互斥登记（rev2 增补·串行序写死）**：`line/ci-wiring3` tip=`fa8ad4e0`（docs-only 起草卷·基线同 `79382f4d`·其卷 `ci-wiring3-REQUEST.md` §0.0 自证起草日本分支尚零卷宗）——其 §1-修法件②=ci.yml lint gate 注释块对表刷新（彼卷锚 `:103-:106` 四行）与本刀件④ 同触同一注释块=唯一已知在飞交叠面（其件① 四门接线步亦触 ci.yml 但为 `:249` 后纯增行·与本刀 :104-:105 注释区+:193-:194 删行零语义交叠）。**互斥裁决=串行序写死：本刀 EXEC 先行落卷·ci-wiring3 EXEC 后行**——彼刀依其卷 §0.0 既定复核规则（`git log -1 line/ci-red-clear` 出现对同一注释块的非祖先新提交→摘除其件②·Ban 双写同一注释块）让面·对表归本刀件④ 独写。EXEC 立项日双向复核：`git log -1 line/ci-wiring3 -- .github/workflows/ci.yml` 出现主线 `79382f4d` 后非本刀新触→触停止条件「现场漂移」停手上报；本刀 EXEC 未落卷前 ci-wiring3 不得先行开工（次序写死·派单归协调方照此）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`79382f4d`）

| 文件 | blob（8 hex） | 关键锚 |
|---|---|---|
| `.github/workflows/ci.yml` | `4cfa1ed3`（344 行） | **`:10` secrets-scan job·`:18-:19` `uses: gitleaks/gitleaks-action@dcedce43c6f43de0b836d1fe38946645c9c638dc # v2`·`:80-:81` `pnpm provider-egress:inventory`+`pnpm provider-egress:prove` 两步·`:104-:105` lint 基线注释（漂移④ 修法点）·`:107` lint gate 步·`:193-:194` 僵尸步 name+run（漂移③ 修法点）·`:195-:196` failover 步（邻面·零触）** |
| `.gitleaks.toml` | `2b07fafc`（30 行） | `[allowlist]` paths 现 6 条目（末条=`(^|/)packages/ai-runtime/test/test-support-fakes\.proof\.ts$`·`98d4bab7` 增）+regexes 3 条——修法件① 落点=paths 数组尾 append |
| `ai-docs/architecture/ai/provider-egress-inventory.json` | `083bd226`（2112 行） | `schemaVersion=1`·`mode=observe-only`·`releaseEvidence=false`·adapters 5（openai-compatible-chat consumers 18·末条=:161-:164 `model-usage-cache-observe.proof.ts`/local-adapter-test）·environmentReferences **327**（MODEL_API_KEY 组末块=:1944-:1947 `scripts/ha/ha-sandbox.mjs`/test-fixture·`16114f7d` 即在此块尾 append 形制） |
| `packages/ai-runtime/test/ag24-langfuse-model.proof.ts` | `2a703c58` | **`:85` `process.env.MODEL_API_KEY = 'ag24-proof-…'（全字面见 proof.ts:85）`（红① 被标行）·`:101-:104` `globalThis.fetch = (async …)` 全程 mock 拦截=零 provider 外呼**；假 key 值字面**源码面** rg 恰 1 命中（proof.ts:85·docs/receipts 面不计·零断言耦合·本卷 rev2 起草卷自身脱敏不复抄字面） |
| `package.json`（根） | `3b04b871` | **`:36-:37` `provider-egress:inventory`/`provider-egress:prove`·`:467` `"failover:prove": "pnpm -C packages/ai-runtime prove:failover"`·全文件 rg `breaker` 零命中（script 缺位实证）** |

### 0.2 派单简报漂移登记（结论零变·如实归位）

1. **红① 先例引证归正**：对账席 brief「allowlist 先例 .gitleaks 626ac3cc/16114f7d」——实测 `626ac3cc`=gitleaks allowlist 先例（receipts/log 假 token·+3 行）；`16114f7d`=**egress manifest 补账先例**（非 gitleaks 面·服务修法件②）；gitleaks allowlist 第二先例=**`98d4bab7`**（test-support-fakes.proof.ts·commit message 自证「沿 626ac3cc 形制」）。件① 沿 626ac3cc+98d4bab7·件② 沿 16114f7d——两先例各归其位·裁决方向零变。
2. **红② 计数归正**：brief「两 proof 未登记+MODEL_API_KEY 引用」——实测 `node scripts/provider-egress-inventory.mjs` EXIT=1 恰 **3** findings：consumer 缺登 2（invoke-model-delta.proof.ts+model-op02-endpoint-partition.proof.ts·均 openai-compatible-chat）+env 缺登 **1**（MODEL_API_KEY 仅 invoke-model-delta.proof.ts——model-op02 用 `openAICompatibleClient({ env: {} })` 字面量（:160-:162）零 `process.env` 读·rg+检查器双证）。恰 3 非笼统「两+一组」。
3. **红③ 补强证据**：`724d61b5` commit message 自证「残留清理：circuit-breaker.ts 131 行+rate-limit-model.ts 162 行+breaker.proof.ts 138 行整删+index.ts :196-201 删 5 保 :199 failoverModel+根 breaker:prove+ai-runtime prove:breaker 两门+alert.rules ModelCircuitBreakerOpen 块」——script 删除为 AG24 合法清理本体，CI 步接线为其残留。
4. **rev2 实测新发现（升级协调方·未决前 Ban EXEC 立项）**：`scripts/provider-egress-inventory.proof.mjs:31` 硬编码断言 `registeredConsumerSourcePairCount===49`——件② verbatim 落码 /tmp 树实测：inventory EXIT=0（自报 51 pairs/328 env）而 **prove EXIT=1（`51 !== 49` 断言红·本席双面亲跑）**→门2「双绿」按现卷不可达。该计数断言随登记增存在既定机械跟进先例：`e300bfec`（egress1 EXEC·「proof.mjs:31 单行 33→43 机械跟进（486e1fad 同型·diff 亲证恰 1 行·其余断言零改·Ban 括注 proof.mjs:31 豁免）」）+`55b68d67`（AG-24 nail·「计数断言按实数同步 48→49·计数基线随 union 增非放宽」）——所需修法=proof.mjs `:31` 单行 49→51（恰 1 行·其余断言零改·沿先例同型）。但该文件现属 §3-2 Ban 面（零检查器触）→**扩权裁决归协调方**：选项 a=§3-2 增 proof.mjs:31 单行豁免括注+该单行并入修法（届时 4 tracked 文件）；选项 b=维持 3 文件则门2 prove 半门必红=「机制不满足」类停。本 rev2 不擅扩·件①-④ verbatim 零触照旧·门2 已附 rev2 交叉引用·pre-exec 复审必须先决本项。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`（与对账席题面「migrate 链 202」恒等）。本刀=配置+清单+注释面·**零迁移零 DDL**。EXEC 期若实测产生迁移需求→停（越界需要类）上报·认领号归协调方·Ban 抢号。

## §1 红事实（机制链·起草席逐项亲证）

### 1.1 红① gitleaks generic-api-key @ ag24 桩（allowlist 二择一裁决=allowlist）

- 被标行=`2a703c58` `:85` 测试进程内 env 注入假 key（值字面=`'ag24-proof-…'`（全字面见 proof.ts:85）·**源码面** rg 恰 1 命中零断言耦合·rev2 起草卷自身脱敏不复抄字面）；该 proof 的 provider 面为 **scripted client**：`:101` 起 `globalThis.fetch` 整体替换为本地 mock（回执固定 Response·零网络语义）——值仅用于满足 registry 解析的 apiKey 在场前置（`:84` 恢复环连同 :38 MUTATED 清单）。
- CI 现行红面本地复现：`gitleaks detect -c .gitleaks.toml -v --log-opts="origin/main..HEAD"`（本地 8.30.1）→Finding=ag24 `:85`·RuleID=`generic-api-key`·指纹 `724d61b5…:packages/ai-runtime/test/ag24-langfuse-model.proof.ts:generic-api-key:85` 起逐 commit 重复——与对账席红根因逐字恒等。本地 8.30.1 全量另有既存历史面（`98d4bab7` 已注「本地余量为 8.30.1 新规则既存历史面·非 CI 现行红面·终审靠 CI pinned 版本」·CI pin=`dcedce43` # v2 @ ci.yml:18-19）。
- **裁决=allowlist（沿 `626ac3cc`+`98d4bab7` 形制）·改形否决**：①改形触 AG24 已 nail proof 文件（`724d61b5` 20 断言收据面）→需重证·爆炸半径大；②改形对熵启发式不可本地终验（本地 8.30.1 与 CI pinned 版本规则集不同·改后字面在 CI 版本下是否消红无法闭证）→把不可验证赌注引入；③本文件与 `test-support-fakes.proof.ts`（`98d4bab7` 已 allowlist 先例）同性质=测试桩假值·零密钥语义·path 精确锚定+注释取证即闭环。

### 1.2 红② provider-egress 三 findings（补账沿 `16114f7d` 形制）

- 检查面：`scripts/provider-egress-inventory.mjs`（静态扫描仓内 adapter consumer 源+env 引用·凡检出未登记即 fail-closed）+`scripts/provider-egress-inventory.proof.mjs`（读 `ai-docs/architecture/ai/provider-egress-inventory.json` manifest）。清单根 `package.json:36-:37`·CI 步 ci.yml:80-81。
- 起草树实跑：inventory EXIT=1+prove EXIT=1·错误块逐字=`adapter_consumer_unregistered:openai-compatible-chat:packages/ai-runtime/test/invoke-model-delta.proof.ts`+同形 `…model-op02-endpoint-partition.proof.ts`+`environment_reference_unregistered:MODEL_API_KEY:packages/ai-runtime/test/invoke-model-delta.proof.ts`——与 CI 红面恒等。
- 消费形态取证：两 proof 均为 ai-runtime 本地适配器测试——invoke-model-delta `:85` `modelFor(openAICompatibleClient(), REQ)`+`:53/:71/:98` fetch mock（`:103`/`:222` 注入假 key·零外呼·自注释「fetch 全程被 mock 拦截」）；model-op02 `:160-:162` `openAICompatibleClient({ env: {} }).prepare!` 零 env 读。二者同 `ag24-langfuse-model.proof.ts`（manifest 已登记 local-adapter-test consumer+test-fixture env·`724d61b5` 随刀登记）同形——登记缺账系后继刀新增 proof 漏随·非出站面扩张。
- 登记形制先例：`16114f7d`（+5 行·同 name 末块尾 append·零通配·单一显式 source 对·env refs 326→327）。

### 1.3 红③ `breaker:prove` 僵尸步（三择一裁决=删步+记账）

- 现场三证：①ci.yml:193-194 步在（name「模型熔断器（连败→降级快速失败不打模型→冷却半开→恢复关闭）」+`run: pnpm breaker:prove`）；②根 `package.json` rg `breaker` 零命中（`724d61b5` 整删·blob `3b04b871` 亲证）→`pnpm breaker:prove` 必 `Command failed`/missing script 非零退出；③该步位于单 job 步序列中→一红挡尽后继全部步（failover/neg:/commerce/resume 等）——与对账席「上游修绿后此步必红挡全 job」恒等。
- **三择一裁决**：改指等价 script=**否决**（唯一近邻 `failover:prove`（`package.json:467`→ai-runtime `prove:failover`·跨供应商 failover 机制）机制不同且已有独立步 ci.yml:195-196·改指即双跑同门零增益）；恢复 script=**否决**（复活 `724d61b5` AG24 合法清理已删的熔断机制面=为绿复活死码·Ban 级）；**采纳=删步两行+记账**——记账面=本卷 §1.3+EXEC 交付报告必载（「breaker:prove 僵尸步删除·归因 `724d61b5` 合法清理残留接线·本刀补清」）·campaign LEDGER 刀位图行翻面权归协调方（nail 时随翻·EXEC 席 Ban 自翻共享 SSOT）。

### 1.4 漂移④ lint 基线注释旧值（五值+root 对表）

- ci.yml:104-105 注释值=点亮日旧基线 `api 1412/web 579/worker 950/ai-runtime 597/db 1038`（+未漂七值 ai-graphs 47/config 0/contracts 265/db-mysql 0/domain 115/qdrant-store 27）。
- 现 `--max-warnings` 实测（逐 workspace package.json rg 亲证）：api **1421**（apps/api）·web **601**（apps/web）·worker **954**（apps/worker）·ai-runtime **628**·db **1042**（packages/db）·root **5235**·七未漂值恒等。五值漂移成因=后续清债刀上调预算随 script 落值而注释未随——注释失真即对表面失准·修法件④ 对表。

### 1.5 修法候选淘汰登记（防 EXEC 期重开）

- 红① 候选「改形假 key 字面」：否决（§1.1 三理由）。
- 红③ 候选「改指 failover:prove」「恢复 breaker script」：否决（§1.3）。
- 红② 候选「放宽检查器/降级 warn」：否决——fail-closed 检查语义为 egress 治理本体（`scripts/provider-egress-policy.mjs` 策略面）·为绿改门=Ban 同类。

## §1-修法（权限链修复刀·预期恰 3 tracked 文件·零迁移零测试码零产品码）

- **件①（红① allowlist 补登）**：`.gitleaks.toml` `[allowlist]` paths 数组尾（现末条=test-support-fakes 行后、`]` 前）append 恰 3 行（原样照抄·沿 `626ac3cc` +3 行形制）：
  ```toml
    # 测试桩假 key·非凭据：AG-24 Langfuse model proof 进程内 env 注入（globalThis.fetch :101 全程 mock 拦截·
    # 零 provider 外呼·值仅满足 registry apiKey 在场断言·generic-api-key 启发式误读·沿 626ac3cc/98d4bab7 形制）。
    '''(^|/)packages/ai-runtime/test/ag24-langfuse-model\.proof\.ts$''',
  ```
  预期 diff=恰 +3/-0。零改 regexes·零改既有 6 条目。
- **件②（红② manifest 补账·恰 3 条目·零通配·零改既有条目）**：`ai-docs/architecture/ai/provider-egress-inventory.json` 两处 append（原样照抄·2 空格缩进层级照现文件）：
  - openai-compatible-chat.consumers 数组尾（`:161-:164` 末条对象后·`]:` 前补逗号衔接）+恰 2 条目（**实测 +8/-0**·rev2 /tmp 树 verbatim 落码 numstat：git 配对下旧末条 `        }` 与新末条 `        }` 恒等对齐为上下文·补逗号行计纯增·零删行）：
    ```json
        {
          "source": "packages/ai-runtime/test/invoke-model-delta.proof.ts",
          "class": "local-adapter-test"
        },
        {
          "source": "packages/ai-runtime/test/model-op02-endpoint-partition.proof.ts",
          "class": "local-adapter-test"
        }
    ```
  - environmentReferences 内恰 `{"name":"MODEL_API_KEY","source":"scripts/ha/ha-sandbox.mjs","class":"test-fixture"}` 对象（`:1944-:1947`）之后、次 name 组首对象之前 insert 恰 1 条目（**实测 +5/-0**·`16114f7d` 同 name 末块尾 append 同形·rev2 /tmp 树 numstat 亲证）：
    ```json
    {
      "name": "MODEL_API_KEY",
      "source": "packages/ai-runtime/test/invoke-model-delta.proof.ts",
      "class": "test-fixture"
    },
    ```
  计数口径：consumers 18→**20**·environmentReferences 327→**328**（以改后 `python3 -c` 解析实测为准·偏差即停）。**rev2 /tmp 树实测**：verbatim 落码后 JSON.parse 合法·两计数=20/328 亲证·inventory EXIT=0 自报 `registered_consumer_source_pairs=51`+`environment_references=328`·manifest 合计 diff **+13/-0**（consumers +8/-0+env +5/-0·`git diff --numstat` 实测·非估算）。
- **件③（红③ 僵尸步删除+记账）**：`.github/workflows/ci.yml` 删 `:193-::194` 恰 2 行（name+run 全对）·上下步（:191-:192 dbhy1 步 run 行/:195-:196 failover 步）零字节。预期 diff=恰 0+/2-·步序列余步零位移语义（删除整步非改步）。**对表豁免（rev2）**：该步=script 已删必红假门（根 package.json `breaker` 零命中·`724d61b5` 残留接线·§1.3）——**非 ci.yml:338「只增不减」纪律的保护对象**（该纪律保护既有活步防静默拆门·死接线删除即对表归正·注记块 :337-:344 本身零触）·记账口径承 §1.3。
- **件④（漂移④ 注释对表）**：ci.yml `:104-:105` 两行注释原位替换（2→2 行·原样照抄）：
  ```yaml
        # "lint": "eslint . --max-warnings N"（N=现行预算·点亮日 dlx dry-run 基线随清债刀上调·与各 workspace
        # package.json lint script 恰等：api 1421/web 601/worker 954/ai-graphs 47/ai-runtime 628/config 0/contracts 265/db-mysql 0/db 1042/domain 115/qdrant-store 27/root 5235）——
  ```
  断言：替换后注释所列 12 值与各 workspace package.json `lint` script 值**逐值恰等**（EXEC 以 rg 对表回执·一值不等即停）。
- **件⑤（收据）**：`ai-docs/delivery/receipts/ci-red-clear/00-exec.md`——七字段（门矩阵全表+EXIT 原值+红① 改前 gitleaks finding 原文与改后消红对照+红② 改前 3 findings 原文与改后双绿+diff numstat（**基准=rev2 /tmp 树实测三文件逐件值：.gitleaks.toml +3/-0·manifest +13/-0·ci.yml +2/-4·门4**）+重 pin 全表+偏离清单（含 §0.2-4 升级项处置结果））。**untracked 口径不入库**（沿 negbend 收据先例）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十一门·数字口径以实跑实测为准·偏差熔断见各门）

> **实跑前置（rev2·适用门5/7/8）**：EXEC 先 `pnpm install --frozen-lockfile`（EXIT=0 且 `git status --porcelain pnpm-lock.yaml` 零输出=零 lockfile 变更·有输出即停越界类）再跑三门。

1. **红① 消红（本地目标面）**：`gitleaks detect -c .gitleaks.toml -v --log-opts="origin/main..HEAD"` 输出中 `ag24-langfuse-model.proof.ts` 命中=**0**（verbose grep 实测·改前=逐 commit 重复命中）；`.gitleaks.toml` diff=恰 +3/-0；且 **verbose 输出中 `Commit:` 归属本分支新 commit（amend 后起草卷 SHA）的 finding=0·不限 proof.ts 文件面**（rev2 增列——起草卷自身此前即因假 key 字面入库被 gitleaks 标 `ci-red-clear-REQUEST.md:23` generic-api-key（旧 `b0877528` 指纹本席亲证）·rev2 脱敏后必须零·逐 Finding grep Commit 字段实测）。**CI 终审=推 PR 后观察 secrets-scan 绿**（CI pinned action 版本全量口径本地不可闭证——显式登记「推 PR 后观察」）。
2. **红② 双绿**：`pnpm provider-egress:inventory` EXIT=0（环境引用实测 327→**328**·openai-compatible-chat consumers 18→**20**·检查器自报计数入收据）+`pnpm provider-egress:prove` EXIT=0（7/7·改前 EXIT=1 恰 3 findings 对照原文入收据）。**rev2 交叉引用**：prove 半门达成依赖 §0.2-4 升级项（proof.mjs:31 计数断言单行 49→51 机械跟进）协调方先决——未决时件② 落码后 prove 实测 EXIT=1（`51 !== 49`·本席亲证）=机制不满足类停·Ban 凑绿。
3. **ci.yml 解析门**：`actionlint .github/workflows/ci.yml` 判据=**actionlint 自身零 error 级 finding**（1.7.12 本地在位亲证·起草日对基线跑通零 error）；装 shellcheck 的主机对其 `:146`（SC1083 warning×2）与 `:155`（SC2034 warning）报**既存 3 条 SC warning=基线登记面·非本刀触面**（rev2 口径·本席实测基线与件③④落码后输出恒等·该情形 EXIT=1 不判红——判据=逐条 finding 归属面·非 EXIT 裸值）；推 PR 后观察 CI workflow 解析零红。
4. **diff 面机检**：`git diff --numstat <起草卷 commit>` 恰 3 tracked 路径=`.github/workflows/ci.yml`（0+/2-+2+/2- 注释区）+`.gitleaks.toml`（3+/0- 件①）+manifest（**13+/0-** 件②＝consumers +8/-0+env +5/-0·rev2 /tmp 树逐件 verbatim 落码 `git diff --numstat` 实测·非估算）——多任何 tracked 路径即停（越界需要类）；收据目录 untracked 另记。
5. **邻面不回退**：failover 步与全 job 步序列零动（diff 判据承门 4）+`pnpm failover:prove` EXIT=0 实跑（scripted 零外呼）。
6. **migrate 链机检**：`ls packages/db/migrations | wc -l`=**202**·头=`0202_interview_event_kind_score_card_written.sql`（届时链顶顺延如实记·本刀零迁移）。
7. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径沿 SSOT 门矩阵）。
8. **lint 五值**：`pnpm turbo lint` EXIT=0·贴线恰等 **api 1421/web 601/worker 954/ai-runtime 628/db 1042+root 5235**（以届时 package.json 实测为准·恰等不等即停）·零第三红。
9. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2128**（基线 2123 本树亲跑·落卷后 2124·**>2128 红停上报**）。
10. **markers 五类零命中**：本刀改动集（本卷 1 .md+3 tracked 修法件+收据目录）五类标记词 grep 零命中（词面不复抄卷内防自匹配·命令与回执入收据）。
11. **CI 实跑终审（推 PR 后观察口径）**：secrets-scan 绿+provider-egress 两步绿+lint gate 绿+僵尸步消失后 job 全步贯通——本地不可行项（pinned gitleaks 版本全量/workflow 汇总）一律以推 PR 后 CI run 为终审·EXEC 报告登记 run 链接·**push 动作本身归协调方/pusher**（EXEC 席 ⛔push 不变）。

## §3 范围外（边界清单·越界即 FAIL）

1. **零测试码零产品码**：两 proof 文件+ai-runtime src 零字节改（红① 红② 修法均在配置/清单侧·§1.5 改形否决承卷）。
2. **零检查器/门语义改**：`scripts/provider-egress-*.mjs`/`scripts/ai-docs/*`/alerts 面/其余 workflow 文件零触。
3. **manifest 既有条目零改零删**：仅 append/insert 恰 3 新条目（§1-件②）·Ban 通配·Ban 重排既有序（现数组非全序·序不动）。
4. **共享 SSOT 零改**：campaign LEDGER/backlog/checklist/north-star 只读引用——僵尸步删除的 LEDGER 行翻面权归协调方。
5. **零迁移零 DDL**（§0.3）·零依赖升级·零 lockfile 改·零其他工作树触。

## §4 依赖

**①上游已满足**：`724d61b5` AG24 清理（已并 feat/mysql-schema-skeleton）=僵尸步成因本体；`16114f7d`/`98d4bab7`/`626ac3cc` 三先例均在链；PR #108 红面=CI 对账席 brief 立靶。**②无同文件并发**：三触面在飞交叠起草日零命中（§0.0·EXEC 日重扫必做）。**③迁移号**：§0.3 预期零。**④下游**：本刀绿后 PR #108 job 贯通恢复=主线 merge 前提；行翻面与 nail 归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit·push 归协调方/pusher）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban 越出 §1-修法四件触面（三 tracked 文件+收据·就地扩面即停）；Ban 为绿改 proof 断言/改测试码/改检查器语义（§1.5 候选否决沿承）；Ban 恢复 breaker script/复活 `724d61b5` 已删面（§1.3）；Ban 通配/重排/删改 manifest 既有条目（§3-3）；Ban 迁移 Ban DDL（§0.3·需则停上报）；Ban 改共享 SSOT（§3-4·Ban 执行席自翻 LEDGER）；Ban 翻 pins；Ban 造 .env*/写真 Key 值入树入据；Ban 顺带升级依赖包；Ban markers 词面入卷；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）。

**pins（零翻转）**：manifest `schemaVersion=1`·`mode=observe-only`·`releaseEvidence=false` 恒等；gitleaks action pin=`dcedce43c6f43de0b836d1fe38946645c9c638dc` # v2 恒等；environmentReferences 327→328·openai-compatible-chat consumers 18→20；迁移链 202 头 0202（届时顺延如实记）；lint 贴线六口径 api 1421/web 601/worker 954/ai-runtime 628/db 1042/root 5235；docs:check cap 2128；`actualSpendCny=null` 脚注（本刀零消费面）。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零模型外呼零 Key 加载零生产操作零 secrets 零消耗（本席实跑仅本地静态检查：gitleaks detect/egress 双检查/docs:check·全离线）；EXEC 期同（全部门=本地静态+scripted·CI 实跑归推 PR 后观察）。

## §7 markers=0（卫生声明）

本刀改动集（起草 turn=本卷恰 1 .md）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词不复抄卷内防自匹配——沿 negbend/ag39 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 红事实四项结论与 §1.5 淘汰登记与 §5 Ban/pins 与 §1-修法件①-④ verbatim 落值**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠重扫必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/行锚漂移且结论受疑（如 gitleaks action pin 变/manifest 计数非 327/18·ci.yml 僵尸步行号位移或已被他刀删·lint 值再漂）·或 §0.0 在飞重扫现非祖先新触→停·重 pin 回炉。
- **机制不满足**：件①② 改后目标红未消（gitleaks 仍现 ag24 命中/egress 仍现 3 findings 任一）→归因链被证伪→停·如实升级协调方回炉（Ban 就地改裁决 Ban 凑绿）。
- **越界需要**：修法诉求超出三 tracked 文件面（需触检查器/proof/迁移/共享 SSOT）→停·另刀或协调方裁决。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（lint 第三红/typecheck 新红/docs:check>2128/邻 job 步新红）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*CI-RED-CLEAR REQUEST · 2026-10-14 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`79382f4d` · 分支 `line/ci-red-clear` · 工作树 `meetwise-crc`（本起草席立·建前 branch+worktree+harness 同名卷三查零命中）· 立项出处=CI 对账席 brief（PR #108 近 5 run 全 failure）· 四项核验=①ag24:85 测试桩假 key（fetch :101 mock 零外呼·本地 gitleaks 8.30.1 range 扫指纹复现·裁决 allowlist 沿 626ac3cc+98d4bab7·改形否决）②egress EXIT=1 恰 3 findings 亲证（两 proof openAICompatibleClient 本地测试消费+invoke-model-delta 假 key env·补账沿 16114f7d 形制恰 3 条目）③breaker:prove 僵尸步（script `724d61b5` 整删+步 ci.yml:193-:194 残留·裁决删步+记账·改指/恢复双否决）④lint 注释五值+root 对表（点亮日旧值 vs package.json 现值逐值亲证）· 修法四件 verbatim 落值（.gitleaks.toml +3/manifest **+13/-0＝consumers +8/-0+env +5/-0 rev2 实测**/ci.yml 删 2+注释对表 +2/-4）· 门矩阵十一门（消红+双绿+actionlint+diff 面机检+邻面+migrate 202+typecheck+lint 六口径+docs:check≤2128+markers+CI 推 PR 后观察口径）· rev2 amend 自 `b0877528`（旧 SHA 失效·审席引用自知·新 SHA=本 commit）＝P0 假 key 字面 :23/:40 截断脱敏（全字面仅存 proof.ts:85）+P1 numstat 实测修正+门1 增列本分支新 commit finding=0+门3 SC warning 基线口径+门5/7/8 install 前置+件③ 对表豁免+§0.0 ci-wiring3 互斥串行写死+§0.2-4 proof:31 升级项待协调方 · 预期零迁移· est live=0 · markers=0 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
