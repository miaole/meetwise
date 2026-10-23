# CONFIG-REJECT-GUIDANCE REQUEST（生产数据库配置拒绝修复指引刀——`production_local_database_host` 启动错误附人读修复指引 + 精简 CD 部署文档写明云库前提 · 拒绝语义零改 · 零迁移 · 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-22 落卷·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC 落码·est live=0·Ban self-approve·alone≠dual·⛔push）

**席位**：批表下一刀起草席（#249 · P4·运维/文档）。
**基线**：`origin/main` @ `65a9c40f407eb6a7e5f04bc627254cb20fc1faf6`（`git rev-parse` 亲证恰等）。分支 `line/config-reject-guidance-draft`·工作树 `meetwise-iss249`（派单给定·届树亲证在位）。
**立项出处（三层蓝本·不自建 SSOT 行——批表行翻面权归协调方）**：
①批表 #249 原文系仓外 `~/Documents/Meetwise产品审计-更正版/issues-master.md`——本席届树亲试读取**挂起超时（iCloud 数据逐出·已止读杀进程）＝批表原文不可读如实登记**，以仓内承登链定性（②）；
②仓内承登链三处亲读在卷：`ai-docs/delivery/harness/repo-hygiene-REQUEST.md:41`（issues-master 仓外 `:526` 摘录「NODE_ENV=production 时拒绝 localhost/postgres 等主机名并要求 verify-full+CA……非标准部署启动即失败（响亮失败，非静默）」+复核注记「**有意的响亮失败，非缺陷**（P3→P4）」+处置建议「部署文档写明前提；启动错误信息给出修复指引」）+同卷 `:64`（处置建议登记归后继运维/文档刀·裁决权归协调方）·`supply-chain-REQUEST.md:46`（#249 承登零触）·`execution-master-checklist.md:3565`（STILL OPEN 行同旨）；
③形制沿 `ag18-sampling-temperature-REQUEST.md`（同工序先例·blob 锚表+门矩阵预申明形）。
**红线**：不把任何警告改成抛错（boundedIntEnv/qbankRetrievalMode 等维持警告·本刀零触）；不改拒绝语义本身（fail-loud 设计保留）；只加指引文案与文档。

## §0 现状锚（起草席届树亲读·base `65a9c40f`·file:line/blob 逐条 grep/sed/Read/rev-parse 实测·EXEC 立项照届时 tip 全量重 pin）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list` 实测 **9 树**（主仓 meetwise/本席 iss249/ag34/cap2338/iss73/nextfix/wssport/land-102/land-106）——零第二 guidance 树；`git branch -a | grep config-reject` 恰两线＝`line/config-reject-draft`（前刀支线）+本席 `line/config-reject-guidance-draft`（恰异名零撞）；`ls ai-docs/delivery/harness/ | grep config-reject` 恰 `config-reject-local-REQUEST.md`（前刀卷）——本卷文件名零同名。
- **前刀互补承证（非重复非在飞）**：`config-reject-local-REQUEST.md` 系同批表相邻前刀，只补 `principal-config.proof.ts` 六则点名断言（裸 `localhost`/裸 `::1`/`[::1]`·现树 `:70-93` 亲读在位）；其 §1 明文「不改 invalidDatabaseConfig/不改 resolveDatabaseConnectionString/不改 isLocalDatabaseHost」＝前刀零触本刀两面。内容入主线经 `git log HEAD -- <file>` 亲证 `7b0bf98a`+`74d2cb5e` 两笔（merge-base --is-ancestor EXIT=0 亲证在 HEAD）；`line/config-reject-draft` 支线残两重复 commit（`65247fd7`/`0443784b`·非 HEAD 祖先 EXIT=1）＝史录残线零在飞。→ 停止条件「标的已修复」**未触发**（错误信息与部署文档两面届树均未动）。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·全 40 hex @`65a9c40f`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/db/src/principal.ts` | `cbdf3a818ed956676392a896d0a8f7b9390f92b0` | `:761-763` `invalidDatabaseConfig(code)` 抛裸 `` `database_config_invalid:${code}` ``（无修复指引·判词载体）；`:789-790` URL 臂与 `:800-801` PG 组件臂 production+`isLocalDatabaseHost`→`production_local_database_host`（`NODE_ENV` 小写比较）；`:827-839` `isLocalDatabaseHost` 主机形词表（localhost/postgres/::1/0:0:0:0:0:0:0:1/127 段/::ffff:127 段/169.254 段/fe80:: 段）；`:844-846` `production_tls_verify_full_required`（邻面·零触）；`:783-951` 全文件恰 **17 个** `invalidDatabaseConfig('<code>')` 调用位＝错误码词表 |
| `packages/db/test/principal-config.proof.ts` | `55c3a23ab67ada8c7494d3a5f5fded539e91862b` | 错误串**全等断言恰 9 锚**：`:31` target_missing/`:39` url_conflicts/`:60/:64/:68/:75/:86/:93` 恰 **6 锚** `production_local_database_host`/`:97` tls_verify_full——件① 影响面=恰 6 锚 |
| `packages/db/test/pool-error-listener.proof.ts` | `84c22ddb8fe5463317473f98231e81f6fcdb938d` | `:62` 全等锚 `database_config_invalid:database_pool_purpose_invalid`（purpose 码·无 hint→字节零变零改） |
| `apps/worker/test/adaptive-consumer.proof.ts` | `6d33d0c80090614d173944925776276f8ca628c2` | `:472` 容忍正则 `/database_config_invalid/i` 分类臂——message 加后缀仍命中＝零触承证 |
| `packages/db/package.json` | `08c98d938bd67cfd0eb673ccc2a55fb401b0e089` | `:41` `prove:principal-config`: `tsx test/principal-config.proof.ts`（门① 入口·已注册零新增）；`:11` lint 帽 `--max-warnings 1042` |
| `docker/compose.prod.yml` | `663720c3e0c80601f9225bb73c57924a7d7e97d5` | `:10-14` `x-cloud-runtime-env`（`:11` NODE_ENV=production+`:12` `DATABASE_URL=${RUNTIME_DATABASE_URL:?…}`+`:13-14` verify-full+CA 已钉）；`:131-136` `x-migration-env`（`:133` `MIGRATION_DATABASE_URL`）——**verify-full/CA 前提已在 compose·主机前提零文** |
| `ai-docs/delivery/lean-cd-deployment.md` | `f59142b75df2c23f0e3aece28db1a56f39256296` | `:53-59` Secrets 节（`:58` 「`.env` 持有 DB/模型等全部运行时密钥（一次性 provision）」——**库地址须指向云库之前提+排错路径零命中**=判词第二半载体）；`:61-68` 运维节（排错行 append 位） |
| `ai-docs/architecture/current-runtime-truth.md` | `7b44790bbd9943f3160fbf0c858c5c0057b50eca` | `:47` 分层口径（「仓内 CD 契约只描述本树已落地的工作流与脚本合同」·权威交叉引用指向 lean-cd）——戊否决依据 |
| `scripts/ha/ha6-companion.proof.mjs` | `740df0a3a11dea7e2bf7b4c376991d66f9e591f0` | `:354-368` principal.ts **行号自由内容锚**三表达式（PGPOOL_MAX/query_timeout/keepAlive 各恰 1）＋`:66` 起 ROLLING_REGISTRY 恰两行（probe.multi.mjs blob+根 package.json scripts-set digest）——**零 principal.ts 行＝件① 零 blob 重注册**（邻面钉承登·门②） |
| `packages/db/test/db-trigfam-unify.proof.ts` | （邻面陈旧钉·零触申明） | `:493-510` P6 白名单门系 `48dee7a2..HEAD` 闭集断言——`48dee7a2` 非 HEAD 祖先（merge-base EXIT=1·届 diff 4752 files 亲算）＝**基线态已陈旧红·非本刀面** |
| `scripts/ai-docs/public-text-policy.mjs` | `f3b183ee0491f7c854b8548fe1e8953eded1f8d5` | `:135` `MAX_FILES = 2_338`（cap 现值·起草树 docs:check 实测 **2331**·余 7） |
| `ai-docs/delivery/harness/repo-hygiene-REQUEST.md` | `0316c1ebd3a307f61d64cbad4b4705cfc8fff200` | `:41`/`:64` #249 摘录与登记原文（立项出处②·只读蓝本） |

### 0.2 判词复核定谳（三读码面·成立维持·未被顺带修复）

1. **「启动错误信息无修复指引」**：`:761-763` 唯一抛点抛裸 `database_config_invalid:${code}`（packages/apps 全 src 零他消费零捕获点·grep 亲证）；`production_local_database_host` 恰两触发位（`:789-790`/`:800-801`）。运维在 `docker compose up`/migrate 启动日志只见错误码不见任何修复动作＝判词逐字成立。
2. **「部署文档未写明前提」**：`compose.prod.yml` 已钉 verify-full+CA（`:13-14`/`:134-135`）但**主机前提零文**；`lean-cd-deployment.md:58` 只写 `.env` 持有密钥——「库地址须指向云库、不得本机地址」前提与排错路径全仓部署文档零命中（grep 亲证）＝判词逐字成立。
3. **侦察卡勘正（注记级如实登记）**：卡载「`:827` 错误码词表」——届树 `:827` 实为 `isLocalDatabaseHost(host)` 函数首行（主机形词表）；错误码词表实为全文件 17 个 `invalidDatabaseConfig` 调用位（`:783-951` 逐一在列）。
4. **影响面亲证**：生产四族库地址全经同一解析器同一拒绝——api/worker 运行时与 migrate（compose 两 env 块）+worker 控制面（`QBANK_CONTROL_DATABASE_URL`→`apps/worker/src/main.ts:519-520` createPool；`RAG_CONTROL_DATABASE_URL`→`apps/worker/src/rag-control-runtime.ts:33,38` createPool）。拒绝面未被近期刀顺带修复；前刀只补证明＝**选标有效**。

## §1 修法（处置建议两肢全行使·**非零行为刀——错误串文案增量=修法本体·逐件如实申明**·恰 4 tracked）

### 件① 错误信息附修复指引（`packages/db/src/principal.ts` 恰一文件·载体择一见 §3-1）

- `:761-763` `invalidDatabaseConfig(code: string)` → **`invalidDatabaseConfig(code: string, hint?: string)`**：无 hint 抛串**逐字节不变**；有 hint 抛 `` `database_config_invalid:${code}（${hint}）` ``。**机读前缀 `database_config_invalid:<code>` 零变**（前缀解析/容忍正则全兼容·`adaptive-consumer.proof.ts:472` 静态承证）。
- `:790` 与 `:801` **恰两调用位**各传第二参，指引文案（推荐案甲字面）：`生产环境数据库主机不得为本机/回环/链路本地地址，请将数据库地址指向云数据库后重启`。其余 **15 个调用位零字节改**（无 hint 臂恒走原串）。
- **proof 锚影响（逐位申明）**：`principal-config.proof.ts` 恰 **6 锚**（`:60/:64/:68/:75/:86/:93`）由全等改 `startsWith('database_config_invalid:production_local_database_host')` 前缀断言并各加一则「后缀含指引非空」断言；其余 3 锚（`:31/:39/:97`）与 `pool-error-listener.proof.ts:62` **字节零变零改**。
- **行为面申明**：拒绝时机/条件/路径零变（仍 `never` throw·仍启动期 fail-loud）；唯一增量＝Error.message 后缀文案；警告面零触；导出面零变（`invalidDatabaseConfig` 模块私有·零导出·grep 亲证）。

### 件② 部署文档写明前提与排错路径（`ai-docs/delivery/lean-cd-deployment.md` 恰一文件·纯文面）

- Secrets 节 `:58` 句后 append 前提段（文意）：`.env` 的 `RUNTIME_DATABASE_URL`/`MIGRATION_DATABASE_URL`（经 compose `x-cloud-runtime-env`/`x-migration-env` 注入）主机**必须指向云数据库**，不得为 `localhost`/`127.0.0.1`/`::1`/`postgres`/链路本地地址；worker 控制面 `QBANK_CONTROL_DATABASE_URL`/`RAG_CONTROL_DATABASE_URL` 同规则。`NODE_ENV=production` 下违反即启动失败（**有意的响亮失败**），错误码 `database_config_invalid:production_local_database_host`；verify-full+CA 前提 compose 两 env 块已钉（引用不重抄）。
- 运维节 `:61-68` append 排错一行：api/worker/migrate 启动报该错误码→查 `.env` 库地址是否误填本机/容器内地址→改云库地址并核对 verify-full+CA→重跑部署。

### §1.2 触面矩阵

恰 **4 tracked**：principal.ts 1＋principal-config.proof.ts 1＋lean-cd-deployment.md 1＋本卷 1——**零新 proof 零 package.json 注册**（`prove:principal-config` 已注册 `packages/db/package.json:41` 亲证）·零迁移零 SQL·零 env 键新增改名·compose/Dockerfile/CI 零触。

### §1.3 否决（六面）

- **甲＝放宽拒绝**（本机主机改 warn/放行/回退默认 host）：判词复核注记明钉「有意的响亮失败，非缺陷」＋红线「不改拒绝语义」·Ban。
- **乙＝环境变量旁路开关**（如 `ALLOW_LOCAL_DB_IN_PRODUCTION=1` 跳检）：制造静默旁路＝弱化 fail-loud 同甲·且新增 env 键越触面·Ban。
- **丙＝独立 hint 字段/自定义 Error 类**（§3-1 案乙）：Node/docker 默认错误输出只含 message+stack·自定义属性默认不可见＝指引到不了运维日志·不解决判词·Ban（并陈留档）。
- **丁＝`production_tls_verify_full_required`（`:844-846`）一并挂 hint**：扩判词面（处置建议之「启动错误信息给修复指引」肢对应主机拒绝；verify-full 前提 compose `:13-14` 已钉＋件② 文档已写）·留后继刀·Ban。
- **戊＝文档面挂 `current-runtime-truth.md`**：其 `:47` 分层口径自钉「只描述现状事实」·运维指引归 lean-cd·混层·Ban。
- **己＝顺手扩 `isLocalDatabaseHost` 词表**（如 `0.0.0.0`/内网段）：扩词表＝扩拒绝语义越判词面·Ban。

## §2 门矩阵（EXEC 立项届树亲跑·预申明八门）

① `pnpm --filter @meetwise/db prove:principal-config` EXIT=0（6 锚改前缀断言全绿＋3 旧锚原值回归；纯 env 解析零 PG 零外呼·前刀同入口 EXIT=0 先例在卷）；② `pnpm ha6:prove` EXIT=0 回归（ha6 内容锚三表达式零触亲证＋ROLLING_REGISTRY 零 principal.ts 行＝零 blob 重注册）；③ `turbo typecheck --force` 全绿 0 cached；④ `turbo lint --force` 0 errors·计数**恰等** root 5242/api 1423/domain 115/ai-runtime 628/db 1042/worker 959/web 601（七 `--max-warnings` 亲证）；⑤ `node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned **2331＋本卷 1＝2332 ≤ cap 2338**（起草树亲跑 2331 亲证·cap `:135` 亲证）；⑥ markers 改动集五类标记词＋行首冲突标记 0 命中（预登记：iCloud 路径写 `~/Documents/…` 波浪线相对形·零本地绝对路径标记字面·零 code-host URL·零 attribution/待确认词面·零密钥形）；⑦ **出站两门豁免如实申明**：本刀零模型调用零新出站面（proof 面纯 env 解析·无 provider 无 DNS 无新 proof）——不需 `provider-egress:inventory/prove` 两门；⑧ `git diff --stat` 恰 **4 tracked**。零迁移故无 uniqueness/migrate 新门。
**邻面陈旧钉登记（append·非本刀面·防后刀误判）**：`db-trigfam-unify.proof.ts:493-510` P6 闭集门基线态已红（`48dee7a2` 非 HEAD 祖先·4752 files 亲算）·本刀零修零宣称；`pool-error-listener.proof.ts` 无 runner 注册（ad hoc 形·史录 `receipts/archive/2026-09-batch23/receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md:143`）·其 `:62` 锚静态零触。

## §3 裁决项（两件·并陈处标推荐）

1. **指引载体**：**推荐＝案甲 message 后缀**（可选参 hint 只挂两调用位·理由：默认错误输出是唯一不经额外代码即达运维日志的通道＋仓内中文指引 message 先例 `apps/api/src/main.ts:268`/`packages/db/src/retrieval/retrieval-legacy.ts:20` 在树·proof 代价＝恰 6 锚改前缀断言）；协裁定乙＝自定义 `DatabaseConfigError` 类挂 `hint` 属性（9＋1 锚全字节零变·但默认输出不可见·须另改日志面方能人读＝扩触面·缺陷如实随裁）。
2. **指引文案语种**：**推荐＝案甲中文**（运维面中文·compose 报错直读·先例同形）；协裁定乙英文 ASCII（字面换英译·件① 断言字面随裁同步）。

## §5 Ban 面

`isLocalDatabaseHost` 词表零字节；`:789-790`/`:800-801` 拒绝条件零字节；`:762` 无 hint 抛串零字节；其余 15 调用位零字节；`:844-846` verify-full 拒绝零触；boundedIntEnv/qbankRetrievalMode 等一切警告面零触；零新 env 键零改名；compose/Dockerfile/.github/CI 零触；`current-runtime-truth.md` 零触；migrations 0001-0215 零字节零新迁移；SSOT 四卷与 issues 仓外原文零触零宣称；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类（现场漂移超注记级/机制不满足/越界需要/验收红不可修）——**起草期均未触发**（§0.2 勘正均注记级·前刀互补零撞·在飞零交叠·批表不可读已如实登记并以仓内承登链定性）。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头＋本节＋卷尾注）·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC 落码·翻面权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（EXEC 面＝1 函数签名＋2 调用位文案＋6 锚断言＋1 文档段·纯本地静态门·零模型外呼零 DNS·0 Key 值·`actualSpendCny=null`）·零 env 闸零新增。
- **STOP=`draft:awaiting_pre_exec_dual`**（与 Status 头/§8 同值第三处）·落卷即停·⛔push。

## §9-rev rev 修订注记（pre-exec 双审 FAIL+PASS 两席合并清单·席1 PASS（2×P2）＋席2 FAIL（P1×1＋P2×3）·四条届树亲证成立全落卷·零跳过）

本节系 rev 席按两独立外席合并修订清单**逐条届树亲证后**的落卷注记：**上文 §0-§8 零字洗**（原文一字未改），EXEC 期凡上文与本节冲突处**以本节为准读**。**rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve。**STOP=`draft:awaiting_pre_exec_dual` 三处同值维持不动（Status 头＋§8＋卷尾注）。

### rev-1（P1-甲·席2·亲证成立）门② `pnpm ha6:prove` 预申明 EXIT=0 失实——基线即红三 FAIL 臂，改同形红 diff 承登协议

- **亲跑承证（rev 席届树亲跑 `pnpm ha6:prove`）**：基线 **EXIT=1**，席2 所报三 FAIL 臂逐一复现：
  ①principal.ts `:946` 行钉臂漂移——`FAIL principal.ts:946 pool max single-source expression drifted`（proof `scripts/ha/ha6-companion.proof.mjs:116-119` 以 `lineAt(principal, 946)` 钉行；该单源表达式届树实位 **:959**——同跑自由锚臂 PASS 文面 `exactly one line (:959)` 亲证）；
  ②根 package.json scripts-set digest 变——`FAIL package.json registered scripts ledger violated: digest got=5adb6bae51efd6e892fddcb56efbbcc3f55ef614 want=106e457929a535e9b87d303b94d7487adbbca054`（实测 **5adb6bae≠登记 106e4579**）；
  ③pgbouncer 大小写不敏感负检命中注释——`FAIL negative violated: pgbouncer hits: packages/db/src/interview/interview-graph-lease.ts`（届树 sed 亲读 `interview-graph-lease.ts:5` 注释「PgBouncer 事务池」在位）。
- **修正句（门② 改读）**：`pnpm ha6:prove` **基线即红，EXIT=0 预申明作废**；改「**三 FAIL 臂 pre/post 同形红 diff 协议承登**」——EXEC 前后各亲跑一次，两轮 FAIL 臂集合与 FAIL 文面逐字节同形＝本刀零新漂移承证（不要求 EXIT=0）；并**本刀可影响臂零触亲证**：`scripts/ha/ha6-companion.proof.mjs:354-368` 三行号自由内容锚（PGPOOL_MAX/query_timeout/keepAlive 各恰 1——基线 PASS `exactly one line (:959)`＋`HA-3 pool-param face pinned` 亲证现绿）、probe.multi.mjs blob 登记行（基线 PASS `rolling registry full-file rows blob-identical (scripts/ha/probe.multi.mjs@b91917e8)` 亲证现绿）。
- **邻面陈旧钉登记补列（append 形·归后继 ha6-repin 刀·非本刀面·本刀零修零宣称·防后刀误判）**：上 §2 邻面登记之外补三臂——principal.ts `:946` 行钉漂移（现 `:959`）；根 package.json scripts-set digest 漂（`5adb6bae`≠`106e4579`）；pgbouncer 负检命中 `interview-graph-lease.ts:5` 注释。

### rev-2（P2-乙·两席同·亲证成立）`invalidDatabaseConfig` 调用位计数勘误 17→15

- **届树亲证**：`grep -n invalidDatabaseConfig packages/db/src/principal.ts` 恰 **16 行**＝`:761` 定义 1 处＋调用位 **15** 处（`:783/:786/:787/:788/:790/:792/:797/:799/:801/:844/:846/:849/:852/:854/:951` 逐一在列）。
- **修正句**：§0.1 blob 表 principal.ts 行与 §0.2-3「恰 17 个调用位」改读「**调用位恰 15（含定义共 16 处）**」（首 `:783` 末 `:951` 区间锚不变）；§1 件①「其余 15 个调用位零字节改」与 §5「其余 15 调用位零字节」改读「**其余 13 调用位零字节改**」（15−`:790`/`:801` 两 hint 调用位）。

### rev-3（P2-丙·两席同·亲证成立）rag-control-runtime.ts createPool 行锚 :38→:36

- **届树亲证**：`grep -n createPool apps/worker/src/rag-control-runtime.ts`——`deps.createPool({ connectionString, purpose: 'rag-control' })` 实位 **:36**；`:33` 为 `RAG_CONTROL_DATABASE_URL` 读取行（原锚不变）；`:38` 现为 `await deps.assertIdentity(pool)` 非锚行。
- **修正句**：§0.2-4「`apps/worker/src/rag-control-runtime.ts:33,38` createPool」改读「**`:33,36`**」。

### rev-4（P2-丁·席2·亲证成立）门④ 大帽计数器性质注记

- **届树亲证**：`--max-warnings` 全仓（零 node_modules）恰 **12 处 package.json**；门④ 所列七值逐一比对全等（root 5242/api 1423/domain 115/ai-runtime 628/db 1042/worker 959/web 601）；其余五包＝packages/config 0、packages/contracts 265、packages/db-mysql 0、packages/qdrant-store 27、packages/ai-graphs 47。
- **修正句（门④ append 注）**：「所列七值为 `--max-warnings` **大帽计数器**（帽值·非逐包计数断言），全仓 `--max-warnings` 恰 **12 处**，其余五包（config/contracts/db-mysql/qdrant-store/ai-graphs）本刀零触」。

### rev-0 覆盖申明

- 合并清单四条**全部届树亲证成立、全落卷，零跳过条目**（「不成立即如实登记跳过」之规则本番零适用）。
- **rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节（§9-rev）落点复验·alone≠dual·Ban self-approve**；STOP=`draft:awaiting_pre_exec_dual` 三处同值维持不变。

---

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·2026-10-22 落卷·基线 `origin/main` `65a9c40f`·分支 `line/config-reject-guidance-draft`·工作树 `meetwise-iss249`·批表原文不可读（iCloud 逐出·读取挂起止读）以仓内承登链三处定性·前刀 config-reject-local 互补承证·est live=0·actualSpendCny=null·pre-exec 双审两独立外席待派·翻面权归协调方·alone≠dual·Ban self-approve·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。**rev 2026-10-22**：pre-exec 双审两席合并清单四条修订入 §9-rev（门② ha6:prove 基线即红三 FAIL 臂承登协议勘误＋`invalidDatabaseConfig` 计数 17→15 含定义 16＋rag-control createPool 行锚 :38→:36＋门④ 大帽计数器注记·四条全届树亲证零跳过）·rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=§9-rev 落点复验·alone≠dual·Ban self-approve·STOP 三处同值维持不变。
