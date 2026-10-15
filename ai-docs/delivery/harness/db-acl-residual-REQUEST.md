# DB-ACL-RESIDUAL REQUEST — db-acl2:prove 基线红残面刀（冻结常数+非连续 ledger 崩溃·proof 改形恰 1 文件·零产品码零迁移·db-acl:prove 已随批5b 窄化翻绿零触·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`** · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT · est live=0 · ⛔push

**席位**：DB-ACL-RESIDUAL 起草席（诊断+起草双责·协调方派·台账 L05 批5 5B 行 #142 残面立靶）。
**基线**：`feat/mysql-schema-skeleton` @ `418f16e8`（=fetch 后 origin tip 亲证恒等·ops-hygiene nail 收官 SSOT·docs:check 2139≤cap 2144 本树亲跑）· 分支 `line/db-acl-residual`（本起草席 `git worktree add ../meetwise-dar -b line/db-acl-residual origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `418f16e8`）· 工作树 `meetwise-dar`（仓根同级）。
**立项出处**：①台账 `ai-docs/delivery/harness/product-campaign-LEDGER.md:86` 批5 5B 行 #142 半闭注记+指针更新（2026-10-15 docs 收口席：旧指针「CI 纳入归 ciw2」经 ciw2 nail @`ad78e0ff` 消解=归置清单实测基线红裁「不裁入·归属勘明归后刀」·残面归后继刀=本刀）；②归置卷 `ai-docs/delivery/harness/ci-wiring2-prove-placement.md:25-26`（db-acl:prove EXIT=1(6.7s)/db-acl2:prove EXIT=1(11.9s) 基线红）+差集表 ：106-109（两 prove 零动作登记·接线=恒红门）；③本席两 proof 现跑读数（§1.1·本树亲跑收据）；④形制范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8 形制·rev2/rev3 处置段先例）。

## §0 现状锚（起草席亲证·file:line+blob 逐条 rg/Read/git hash-object/实跑实测 @`418f16e8`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 17 树实测——无第二 db-acl-residual 同名树；`git branch --list "line/db-acl*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg db-acl-residual` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀唯一码触面=`packages/db/test/db-acl2.proof.ts`（现 blob `9efeae31`·426 行·末次变更=`419f85f1` DBACL-2 自身 EXEC 收据·已在主线）。届时对各在飞分支执行 `git log <branch> -1 -- packages/db/test/db-acl2.proof.ts` 逐树复核，任一分支顶对该文件存在主线 `418f16e8` 之后的新增提交→触停止条件「现场漂移」停手上报。
- **EXEC 期交叠复核重跑（@merge `dca42710`·origin tip `f417d8e7`·2026-10-15）**：全分支逐树复核——唯一非 `419f85f1` 顶触=`line/db-pgp-acl` 顶 `650b018e`（2026-10-08 20:23 DBACL-2 原始支线·其文件 blob=`9efeae31` 与主线恒等·时间早于主线基线 `418f16e8`（2026-10-15）一周=**非「418f16e8 之后新增」**·属既并线工作原始血统分支）；余全分支顶触=`419f85f1` ancestor-ok——**零在飞新触·停止条件未触发**。

### 0.1 blob 锚表（`git hash-object` 亲算 @`418f16e8`）

> **EXEC 重 pin 总注（@origin tip `f417d8e7`·merge `dca42710`·2026-10-15）**：七 blob 中六值恒等（db-acl2.proof.ts `9efeae31`/db-acl.proof.ts `570f5741`/migrate.ts `f472f356`/0151 `e6e76af1`/0108 `351aeb45`/package.json `3b04b871`）·唯一漂移=`run-e2e-isolated.mjs`（`e69e317a`→`0787a7ff`·行内重 pin 见该行）——**结论零变**（接线语义亲证恒等·本刀零触面）。`package.json` 行锚亲证恒等（`:405-:408` 双行+`:8` root lint 预算 5235）。db-acl2.proof.ts 行锚对 blob `9efeae31`（改形前基）逐条亲证恒等；改形后新行锚归 §9 EXEC 记录。

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `packages/db/test/db-acl2.proof.ts` | `9efeae31`（426 行） | **`:2-:23` 头注（Stage A/P4/P5 冻结描述=改形对象）·`:34-:36` ROOT/MIG_DIR/0151 名+BASE_SHA=`95911975`·`:46` EXPECTED_CLOSED_SET 恰 1=memory_runtime·`:177` pre 过滤=`version !== MIGRATION_0151`（mid-chain 洞形状=红根①）·`:178` 0151 在目录臂·`:180-:200` P5-4 官方 migrate:prove 子进程（专用第二净库·现跑绿）·`:202-:207` Stage A+P0-0（`:205` 断言 `applied.length===144` 冻结常数=红臂本体）·`:209-:232` P0 负门四臂·`:234-:252` §3 推导六臂·`:254-:259` Stage A 快照（aclA/appendDefA/encDefA）·`:261-:267` Stage B `runMigrations(pool, all)`+P5-1（`:264-:266` applied 恰 1/skipped 恰 144 冻结）·`:269-:311` P1 九臂·`:313-:352` P2 五臂·`:354-:383` P3 五臂（`:369-:382` 0151 全文白名单机检）·`:385-:408` P4 三臂（`:387-:391` P4-1 对 base 恰一 A 行冻结·`:392-:405` P4-2 全仓 7 文件白名单冻结·`:406-:407` P4-3 产品码对 base 零 diff 冻结）·`:410-:419` P5-2/P5-3（`:414` `all.length===145` 冻结·`:417` `skipped===145` 冻结）** |
| `packages/db/test/db-acl.proof.ts` | `570f5741`（694 行） | **改形先例本体（本刀零触）·`:349-:357` Stage A 改形登记（「0145/0150 后继迁移进链后结构性翻红…migration_ledger_not_contiguous_prefix…改形=回归头注原意」·本刀 §1.3 同型根因的既裁文字）·`:356-:357` 版本前缀窗 `slice(0,4)<='0143'`/`<='0150'`·`:437-:441` P7-1 expectedWindow 恰序表形·`:614-:644` P6 三段改形（P6-1 零 D/R+M 豁免/P6-2 ledger checksum/P6-3 静态体锚）·`:646-:665` P7-2/P7-2b/P7-3 catchup 参数化形** |
| `packages/db/src/migrate.ts` | `f472f356`（**EXEC 三值并列恒等：@`418f16e8`=@`f417d8e7`（origin tip）=merge 后本树工作树**·612 行） | **`:26-:28` `migrationError` 守卫 helper（声明 ：27·起草行锚 `:28` 为函数体尾行）·`:438` `migration_ledger_not_contiguous_prefix` 抛点（EXEC 亲证恒等）——本刀零触（守卫语义是被依赖对象非修法对象）** |
| `packages/db/migrations/0151_pgp_sym_encrypt_grant.sql` | `e6e76af1` | 注释块+**恰 1 条 GRANT 语句**（`GRANT EXECUTE ON FUNCTION public.pgp_sym_encrypt(text,text) TO memory_runtime;`）——P3-3/3-4/3-5 静态机检面·本刀零字节零触 |
| `packages/db/migrations/0108_ctx03_immutable_session_event_source.sql` | `351aeb45` | `:177` `conversation_event_append` 创建·`:255` `pgp_sym_encrypt(p_body, p_enc_key)` 唯一调用点·`$`-quote 体可静态提取（P4-3' 静态锚原点） |
| `scripts/run-e2e-isolated.mjs` | `0787a7ff`（**EXEC 重 pin·起草时 `e69e317a`·主线 ci-wiring3 等波合法并线所致·blob 漂移但接线语义恒等·3201 行**） | **EXEC 重 pin 行锚：`:1538-:1546` db-acl:prove:raw 触发集·`:1547-:1558` db-acl2:prove:raw 触发集·`:2162-:2163` 跑单注册·`:2489-:2492` 命令映射——接线完好亲证·本刀零触** |
| `package.json` | `3b04b871` | `:405-:408` db-acl:prove/db-acl2:prove 双行（run-e2e-isolated 包装）+`:406/:408` raw→`pnpm -C packages/db prove:db-acl(2)`·`:8` root lint 预算 5235 |
| `scripts/ai-docs/public-text-policy.mjs` | —（行锚） | 起草时 `:78` `MAX_FILES = 2_144`；**EXEC 重 pin `:90` `MAX_FILES = 2_152`**（主线 `591d07cf` cap sanction 落值·本卷 §2-11 门沿 cap 联动语义=≤2152） |

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **简报「两 proof 基线红」在本树已半失效**：`db-acl:prove` 现跑 **EXIT=0（62 PASS/0 FAIL）**（§1.1 收据）——翻绿归属=批5b 迁移簇 nail 续作三授权 `60d3fb68`「db proof 窄化」（checklist `ai-docs/delivery/execution-master-checklist.md:2690` 授权链行+:2692 门矩阵行「db proof 窄化授权形 绿（db-acl failures=0）」·db-acl.proof.ts 末次变更=`7152cd3c` 批5b EXEC 亲证）·**非 dbhy1**。简报嫌疑面「dbhy1 P4⑤ 名录补账刀（在审）是否已消其一」复核结论：**两红皆非 dbhy1 面**——dbhy1 rev3 (a)=sql/ 侧 vs 迁移侧四类对象名录 diff（`ai-docs/delivery/harness/dbhy1-db-hygiene.md:4/:96/:170`·另一承载面对象类普查）且**在审未入本树**；db-acl:prove 翻绿在树可证（上引）；db-acl2:prove 残红=冻结形状面（§1.3）·与名录补账零交集。
2. **简报「docs:check≤2136 红停」钉值过期**：本树亲跑 **2139 ≤ cap 2144 EXIT=0**（cap=`public-text-policy.mjs:78` MAX_FILES=2_144·tip `418f16e8` 自身题面「docs:check 2139≤2144」在案）——+3 归 ops-hygiene 波后演进·非内容策略面。本卷 §2 门 11 沿 cap 联动语义改钉「EXIT=0·≤2144·超 cap 红停上报」+本条勘误登记（沿 59a3826b/8b8980ef cap 联动先例形）。
3. **简报邻面臂数（dbhy1 28/28·interview 57·neg 687）以实跑实测为准**：本席静态复核 `dbhy1.proof.ts` 断言器调用 26 处（含定义行·循环倍增不排除）·`interview:prove`=`pnpm -C apps/worker prove:interview`（runner `:680-:692`/`:2349-:2351` 映射亲证）·neg:all 在 negbend §9 时点实测 686（`negbend-fix-REQUEST.md` §9 append 门 2）——三值 EXEC 期以改前基线 run 实测为准登记（§2 门 6/7/8·偏差熔断条款）。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`；`loadMigrations` 实测（本席 tsx 亲跑）：**all=202 · pre(≤0143)=144（双 0143 文件名序均在·`0143_db_id_v7_unify`+`0143_sse_push_notify`）· win(≤0151)=152 · winAdd=8 · catchup=50**。
- **EXEC 期重 pin（@merge `dca42710`·origin tip `f417d8e7`·2026-10-15·本席 node 亲跑）**：链=**204**·头 `0204_ai_cost_cached_input_price`（`0203_gateway_model_invocation_backlog`+`0204` 随主线合法并线进链·派单简报「链 203」为时点前置值如实更）；`loadMigrations` 实测：**all=204 · pre(≤0143)=144（双 0143 恒等）· win(≤0151)=152 · winAdd=8 · catchup=52**；expectedWindow 八名逐字亲证恒等；uniqueness 实测 `files=204 violations=0 exemptions=0143,0152,0160`。§1.3 红①「实测 201」=起草时点 202 链诊断历史值不改（同型形状对 204 链=203·机制结论零变）。
- 本刀修法=纯 proof 断言层改形（§1-修法件①）·**预期零迁移零 DDL**。协调规则：EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**·认领号=对届时链顶亲数+在飞分支题面复核后最小未占号顺延·Ban 抢号 Ban 私占。

## §1 红事实（机制链·全部亲证·本席两 run 现跑收据）

### 1.1 两 proof 现跑读数（2026-10-15·本树 `418f16e8` 亲跑·隔离容器·attempts 全账）

| proof | 命令 | EXIT | 臂账 | 收据 |
|---|---|---|---|---|
| db-acl:prove | `pnpm db-acl:prove` | **0** | **62 PASS / 0 FAIL**（`RESULT dbacl1-db-acl failures=0`） | 运行日志留存席（/tmp 下易失·FAIL=∅ 无名单可摘） |
| db-acl2:prove | `pnpm db-acl2:prove` | **1** | 跑前段 **11 PASS / 1 FAIL** 后**中途崩溃**：`migration_ledger_not_contiguous_prefix`（proof `:263` Stage B→`migrate.ts:438`←`:28`）·**25 臂未及执行**（P5-1/P1-1..9/P2-1..5/P3-1..5/P4-1..3/P5-2/P5-3） | 隔离收据 `.tmp/isolated-proof-receipts/2026-10-15T09-08-15-661Z-7190-eb4e71f5-1e6d-49aa-8622-d5d46812996c.json` |
| db-acl:prove（**失败首尝试·EXEC 补账**） | `pnpm db-acl:prove` | **1** | 臂账未达（收据只记 outcome/exitCode/duration·无 FAIL 名单字段·失败根因未留痕） | 起草席 09:04:22.495Z 起跑·duration 121590ms·09:06:24.085Z 收据落卷 `.tmp/isolated-proof-receipts/2026-10-15T09-06-24-085Z-3155-3772f1b9-fed5-454e-b45c-45f8a4b3158e.json`（schemaMigrationManifest count=202 latest=0202）；**随后 09:07:00 重跑 33374ms EXIT=0 62 PASS=上表绿行凭据**。本行=pre-exec 双审 N2 要求补登的一笔如实账（起草席 §1.1 原表漏记）·attempts 全账口径补齐·零改判上行绿账 |

**崩溃 run 的强旁证（零语义漂移的结构性证据）**：Stage A 当时以「全量−0151」形状应用了 **含 0152-0202 的 201 文件**——§3 推导门在全链库上全 PASS：`sdTotal=307 · pgp_sym_* SD 调用恰 1 条=memory_runtime|conversation_event_append|pgp_sym_encrypt(p_body,p_enc_key)|arity=2|encrypt`（§3-4/3-5/3-6 PASS）+P0-1..P0-4 负门全 PASS+P5-4 官方 migrate:prove 子进程（202 链全量重放）PASS——**ACL 语义面在当前全链零漂移·残红纯系冻结形状**。

### 1.2 db-acl:prove 翻绿归属链（本刀零触面·如实闭账）

ciw2 时点基线红（归置卷 ：25）→批5b 迁移簇 EXEC `7152cd3c` **「db proof 窄化」改形落地**（db-acl.proof.ts 末次码改=该提交亲证·:349-:357/:614-:665 改形登记在卷）+nail 续作三授权 `60d3fb68` 为该窄化的 **sanction 授权面**（授权处置提交·对 db-acl.proof.ts 零码改——归属两 hash 分立如实措辞·pre-exec N3）→checklist :2692 门矩阵「db-acl failures=0」→本树现跑 EXIT=0。**该面已闭·本刀零触**（§3-2）·#142 残面收窄为 **db-acl2:prove 单 proof**。

### 1.3 db-acl2:prove 红臂逐条根因（file:line·本席亲证）

- **红① P0-0（:205）**：断言 `r.applied.length === 144` 冻结常数 vs 实测 `applied=201`。成因双叠：**(a) 形状**——`:177` pre 过滤=`version !== MIGRATION_0151`（「全量挖一洞」形状·在其 EXEC 时点 `419f85f1` 链=145 文件·0151 为链尾·挖洞=恰 pre 144 且连续）；**(b) 演进**——0144-0150 七件与 0152-0202 四十七件先后进链（现 202 文件）·洞变成 mid-chain 缺口·pre 膨胀至 201。对照：db-acl.proof.ts:349-:357 改形登记对本型成因既有既裁文字（「链增长后构造回归原意·非洗基线」）。
- **红② Stage B 崩溃（:263）**：`runMigrations(pool, all)` 施于「缺 0151 的 mid-chain 洞 ledger」→`migration_ledger_not_contiguous_prefix`（`migrate.ts:28` 守卫·`:438` 抛点）——守卫语义正确（禁非连续前缀）·**修法对象是 proof 的应用集形状非守卫**。25 臂未及执行皆此红之级联。
- **红③ 冻结常数潜伏面（改形后必炸的既存冻结·非本 run 观测·行号亲证）**：P5-1 `:264-:266`（`applied===1 && skipped===144`）·P5-2 `:412-:414`（`all.length===145`）·P5-3 `:415-:418`（`skipped===145`）·P4-1 `:387-:391`（对 base `95911975` 迁移 diff 恰一 A 行）·P4-2 `:392-:405`（全仓 diff-to-base 7 文件白名单）·P4-3 `:406-:407`（产品码对 base 零 diff）——六处皆「自刀闭卷时点快照」型冻结·数十刀合法并线后结构性恒红。本席实测对 base 迁移 diff 形态=**58 A / 0 M / 0 D**（P4-1 冻结「恰一 A 行」已过 58 倍）。
- **零语义漂移对表（§1.1 旁证承此）**：EXPECTED_CLOSED_SET 恰 1·0108:255 唯一调用点·0151 恰 1 GRANT（`e6e76af1` 全文亲读）·`rg -l pgp_sym packages/db/migrations` 恰 6 文件=0001/0092/0108/0121/0122/0151（**0144-0151 窗内零 pgp_sym 面**→P1-7 ACL 跨 stage 差恰一处形状在改形窗下保持）。

### 1.4 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=proof 断言层改形（§1-修法件①）**：镜像 db-acl 已 sanction 改形先例（`60d3fb68`「db proof 窄化」+proof :349-:357 登记形）——版本前缀窗回归「0143 窗复现/0151 收尾恰一窗」头注原意·冻结常数参数化·静态门语义移交机械权威（ledger checksum+静态体锚）。改形客体=**链演进冻结常数与挖洞形状·非行为断言**：负门（P0）/正门（P1/P2）/过度授权白名单（P3）/闭集推导（§3）全数原样保留·零弱化。
- **候选乙（否决·Ban）=产品修/迁移修**：§1.1 旁证铁证全链 ACL 语义零漂移·42501 修复语义（0151）在卷且 migrate:prove 202 链全绿——无产品病灶可修；动产品码/迁移即越界（§3-1/§3-5）。
- **候选丙（否决·Ban）=删门凑绿**：删 P0-0/P4/P5 断言臂或降 EXIT 判据=洗基线（negbend 候选丙同型否决沿承）——本刀逐臂**改形保语义**·臂总数 37→**38**（+1 catchup 臂·门不减）。

## §1-修法（proof 改形刀·预期恰 1 文件 `packages/db/test/db-acl2.proof.ts`·零产品码零迁移零其他测试）

- **件①（唯一码改·六处改形·blob `9efeae31` 为基）**：
  1. **头注改形登记**（`:2-:23` 区）：Stage A/P4/P5 描述随改形更新+登记段（沿 db-acl.proof.ts:349-:357 文形）：「既有臂改形登记（链 145→202 演进后构造回归原意·非洗基线）：Stage A 原『全量−0151 挖洞』在 0144-0150 与 0152-0202 进链后 mid-chain 缺口结构性翻红（P0-0 冻结 144 vs 实测 201+Stage B 全量对缺 0151 ledger 报 migration_ledger_not_contiguous_prefix——主线基线红·与本刀扩臂无关）。改形=0143 版本前缀窗复现负门前提+≤0151 窗口补齐（0151 收尾恰一窗）+链尾 catchup 参数化+P4/P5 静态门语义移交机械权威（ledger checksum+0108 静态体锚）·负门/正门/白名单/闭集推导全数原样保留」。
  2. **Stage A 集（:177）**：`const pre = all.filter((m) => m.version !== MIGRATION_0151);` → `const pre = all.filter((m) => m.version.slice(0, 4) <= '0143');`（镜像 db-acl :356 形·双 0143 文件名序均在·实测 144 件）。
  3. **P0-0（:204-:206）**：`r.applied.length === 144` → `r.applied.length === pre.length`（断言名「144 文件」→「恰 pre 集实数·双 0143 文件名序·零 skip」·镜像 db-acl :363 形）。
  4. **Stage B 窗口化（:261-:267）**：pre 旁新增 `const windowSet = all.filter((m) => m.version.slice(0, 4) <= '0151');`；`runMigrations(pool, all)` → `runMigrations(pool, windowSet)`；P5-1 断言改形=applied 恰 **expectedWindow 八名恰序表** `['0144_db_trigfam_unify','0145_dead_table_jsonb_deprecate','0146_qbank_partition_lifecycle','0147_interview_owner_unique_index','0148_interview_composite_fk_batch1','0149_money_status_constraints','0150_uuidv7_grant_acl', MIGRATION_0151]`（0151 收尾恰一窗·「恰 0151 修复」语义保留）`&& r.skipped.length === pre.length`（镜像 db-acl :437-:441 形·实测 8/144）。
  5. **P4 静态契约门三段改形（:385-:408·镜像 db-acl P6 三段形）**：
     - **P4-1'（diff 形状）**：`git diff --name-status 95911975 HEAD -- packages/db/migrations` 断言改 `diff.status===0 && 删除/重命名行===0 && 修改行===0`（本席实测 **58A/0M/0D**·A 面=链演进新增归 uniqueness/migrate 门管·零 D/R/M=禁改历史门强形·BASE_SHA 保留仅作历史注释不再作恰一 A 行锚）。
     - **P4-2'（ledger checksum·替换原全仓 7 文件白名单）**：pre 集（≤0143 全件）逐文件 sha256 == `schema_migrations.checksum`（Stage A 后查询·镜像 db-acl :631-:636 形）——「历史零字节改」机械证·改任何一字节即红。改形登记：原白名单语义（本刀改动面收敛）由本门+P3 静态白名单（0151 全文机检 :369-:382 原样）+P4-3' 三面机械承接。
     - **P4-3'（静态体锚·替换原产品码零 diff）**：库内 `conversation_event_append` 函数体 == 0108 文件静态体逐字节（`$`-quote 提取·镜像 db-acl :637-:643 对 0143 uuidv7 的提取形·name 锚=conversation_event_append）——防落链后 OR REPLACE 篡改·与 P1-8 跨 stage 对拍独立互补。改形登记：原「packages/db/src 与 apps/*/src 对 base 零 diff」在数十刀合法并线后结构性恒红·「产品码零改」语义由 P1-8（跨 stage 全等）+本锚（静态原点全等）承接。
  6. **P5 migrate 门四臂化（:410-:419·镜像 db-acl P7 形）**：`P5-2`（catchup）`beforeCount===windowSet.length && catchup.applied.length===all.length-windowSet.length`（实测 152/50）→`P5-2b` ledger=磁盘文件数 `count===all.length`（**删 `:414` `all.length===145` 冻结**·「号位空洞不阻断」自注保留）→`P5-3` 重跑全 skip `rerun.applied.length===0 && rerun.skipped.length===all.length`（**删 `:417` `===145` 冻结**）。P5-4（:180-:200 官方 migrate:prove 子进程）**零触**。
- **件②（prove·恰 1 run 零 retry-to-green）**：`pnpm db-acl2:prove` → 期望 EXIT=0·**38/38 全 PASS**（37 保留臂+1 catchup 臂·臂清单=§1.3 保留语义臂全数+改形臂 P0-0/P5-1/P4-1'/P4-2'/P4-3'/P5-2/P5-2b/P5-3）。改前红名单=本卷 §1.1 收据（P0-0 一臂+崩溃级联 25 臂未达）·EXEC 改前不须复跑崩溃形（崩溃级联名单由门 2 改后全绿+门 1/3/4/5 邻面绿承载）。
- **件③（收据）**：`ai-docs/delivery/receipts/db-acl-residual/00-exec.md`——七字段（门矩阵全表+EXIT 原值+38 臂 PASS 全名单+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十四门·数字口径以实跑实测为准）

1. **db-acl2:prove 翻绿**：`pnpm db-acl2:prove` EXIT=0·**38/38**（熔断=0 容差：实测≠38 即触「现场漂移」停上报）·保留语义臂（P0-1..4/§3-1..6/P1-1..9/P2-1..5/P3-1..5）零弱化零缺号。
2. **db-acl:prove 不回退**：`pnpm db-acl:prove` EXIT=0·**62/62**（本席基线亲跑实测·`570f5741` 零字节触=零扰动实质绿·臂数偏差即停上报）。
3. **migrate:prove**：`pnpm migrate:prove` EXIT=0·链 **202 头 0202**（届时链顶顺延如实记）。
4. **drift:prove 零漂移**：`pnpm drift:prove` EXIT=0（豁免既登项恒等）。
5. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs` → `files=202 violations=0 exemptions=0143,0152,0160`（files 对届时链顶亲数·violations 恒 0）。
6. **dbhy1:prove 不回退**：`pnpm dbhy1:prove` EXIT=0（简报钉 28/28·本席静态计数 26 处含定义行·**分母=改前本树基线 run 实测为准·对简报值偏差如实登记·偏差>±2 停上报**）。
7. **interview:prove 不回退**：`pnpm interview:prove` EXIT=0（简报钉 57 臂·分母同上实测为准·偏差即停上报）。
8. **neg:all 不回退**：`pnpm -C apps/api neg:all` EXIT=0 六段全绿（简报钉 687·negbend §9 时点 686·分母=改前基线 run 实测为准·偏差如实登记·邻五套件 PASS 名单对基线 diff=∅）。
9. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径沿 SSOT 门矩阵）。
10. **lint 五值恰等**：`pnpm turbo lint` 五包贴线恰等 **web 601 / root 5235 / api 1421 / worker 954 / ai-runtime 628**（预算钉值=各 package.json lint `--max-warnings` 本席亲证 :7/:8/:7/:7/:14·0 errors·零第六值零新红·第三态出现即停）。
11. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·**≤cap 2144**（本席亲跑 2139≤2144·本卷落卷 +1=2140 预期·**>2144 红停上报**；简报 2136 钉值过期勘误=§0.2-2）。
12. **markers 五类零命中**：本刀改动集（1 .ts 件①+1 .md 本卷+收据目录）五类标记词 grep 零命中（词面不复抄卷内防自匹配·命令与回执入收据）。
13. **diff 面机检**：`git diff --numstat <base>` 恰 2 tracked 路径=`packages/db/test/db-acl2.proof.ts`+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）。
14. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·零模型外呼（两 proof 均无 key 隔离库机械断言·est live=0）·`actualSpendCny=null`。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零触**：`packages/db/src/**`、`apps/*/src/**`、`packages/*/src/**` 零字节改——P4-3' 静态锚改形≠产品修授权（候选乙否决·§1.4）。
2. **db-acl.proof.ts 零触**：blob `570f5741` 恒等（§1.2 翻绿面零扰动·Ban 借机「顺手再窄化」）。
3. **其他 db proof 家族红面零触**：db-id-v7/db-trigfam/db-intfk/db-money3 四 baseline 红维持归置卷「零动作登记」宿面·归属各后刀（本刀 Ban 扩面）。
4. **migrate.ts 守卫零触**：`f472f356` 恒等——`migration_ledger_not_contiguous_prefix` 是被依赖守卫语义非修法对象。
5. **零迁移零 DDL**：0151 文体零字节（`e6e76af1` 恒等·§0.3 预期零·需则停上报走认领规则）。
6. **共享 SSOT 零改**：LEDGER/checklist/登记册只读引用——#142 残面行翻面权归协调方 nail。
7. **零 CI/wiring 改**：`run-e2e-isolated.mjs`（`e69e317a`）/`package.json`（`3b04b871`）/nightly-ciw2 归置面零触——db-acl2:prove 若翻绿后是否升 nightly-ciw2 归协调方 nail 时另议（归置卷三态改判非本刀交付面）。

## §4 依赖

**①上游已满足**：0151 在链（`e6e76af1`·P5-4 官方轮 202 链全绿本席实测）；db-acl 改形先例在树（`570f5741`·批5b `60d3fb68` sanction 形）；migrate 守卫语义在卷（`f472f356`）。**②无同文件并发**：db-acl2.proof.ts 末次变更=`419f85f1`（DBACL-2 自身 EXEC 收据·已在主线）·在飞交叠复核=§0.0 第二条。**③迁移号**：§0.3 预期零。**④下游**：db-acl2:prove 翻绿后 #142 残面闭·归置卷 ：106 登记行与台账 #142 行翻面归协调方；nightly-ciw2 纳入裁议归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件② 恰 1 prove run·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 产品码/迁移/DDL 改动（§3-1/§3-5·候选乙否决沿承）；Ban 删门凑绿/弱化负门正门白名单断言（候选丙否决沿承——本刀改形客体=冻结常数与应用集形状·语义保留条款=§1.4 候选甲文）；Ban 触 db-acl.proof.ts/migrate.ts/0151 文体/其他 db proof 家族/run-e2e-isolated.mjs/package.json（§3-2/3-4/3-5/3-7）；Ban 改共享 SSOT（§3-6）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因新红（门矩阵邻面若现新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄 `negbend-fix-REQUEST.md` §5 同 tip 系 SSOT·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零模型外呼零 Key 加载零生产操作零 secrets 零消耗（本席两 proof run=无 key 隔离容器机械断言·P5-4 migrate:prove 子进程同；EXEC 期 prove 亦零模型外呼·§2-14 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词不复抄卷内防自匹配——沿 negbend-fix/g7w/authz-harden 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.3 红臂根因结论与 §5 Ban/pins 与 §1-修法件① 改形面与「保留语义臂零弱化」条款**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.3 结论受疑（如 db-acl2.proof.ts 被并发刀触及/链数≠202/`loadMigrations` 实数对 §0.3 漂移/expectedWindow 八名漂移/门 1-8 任一分母超熔断）→停·重 pin 回炉。
- **机制不满足**：件② prove run 保留语义臂（P0/P1/P2/P3 任一）现红=「零语义漂移」诊断被证伪（非冻结常数面）→停·如实升级协调方回炉（Ban 就地改断言 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法件① 恰 1 文件面（需触产品码/迁移/runner/其他 proof/其他测试）→停·另刀或协调方裁决（§1.4 候选乙/丙否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 第六值/docs:check>2144/uniqueness violations>0）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

## §9 EXEC 记录（2026-10-15 · EXEC 席·pre-exec 双审会签 PASS 席1 agent_9ffa0cc6+席2 agent_e22738db→协调方 EXEC 授权）

**并线**：`git fetch` 后 origin/feat/mysql-schema-skeleton tip=`f417d8e7`（亲证）；`git merge --no-ff feat/mysql-schema-skeleton` → **merge=`dca42710`**（merge-base `418f16e8`·merge-tree 预演 EXIT=0·**零冲突零并集解需要**·delta=33 commits·⛔pull --rebase 未用）。

**全量重 pin（N1·结论零变只更值）**：链 **204** 头 `0204_ai_cost_cached_input_price`（简报 203=时点前置值如实更）；loadMigrations 实测 all=204·pre=144·win=152·winAdd=8·catchup=52；blob 七值六恒一漂（`run-e2e-isolated.mjs` `e69e317a`→`0787a7ff`·行锚重 pin 接线恒等）；expectedWindow 八名逐字恒等；§0.0 交叠复核重跑零在飞新触（`line/db-pgp-acl`=`650b018e` 2026-10-08 原始血统支线·blob 恒等·早于主线非新增）；其余详见 §0.0/§0.1/§0.3 EXEC 注行。停止条件四类全程未触发。

**件① 六处改形落点（恰 1 文件 `packages/db/test/db-acl2.proof.ts`·改形前 blob `9efeae31` 基）**：
1. 头注（:2-:23 区）：Stage A/B/P4/P5 描述随改形更新+既有臂改形登记段（沿 db-acl :349-:357 文形·链 145→204 演进·非洗基线）；
2. Stage A 集（原 :177）：`version !== MIGRATION_0151` → `version.slice(0,4) <= '0143'`（0143 版本前缀窗·镜像 db-acl :356 形）+windowSet（≤0151）旁置；
3. P0-0（原 :204-:206）：`applied.length === 144` 冻结 → `=== pre.length`（恰 pre 集实数·零 skip·镜像 db-acl :363 形）；
4. Stage B 窗口化（原 :261-:267）：`runMigrations(pool, all)` → `runMigrations(pool, windowSet)`·P5-1=applied 恰 expectedWindow 八名恰序表（0151 收尾恰一窗）+skipped===pre.length（镜像 db-acl :437-:441 形）；
5. P4 三段（原 :385-:408）：P4-1' 恰一 A 行→零 D/R/M（BASE_SHA 保留仅作历史注释）·P4-2' 全仓 7 文件白名单→ledger checksum 对账（≤0143 逐文件 sha256==schema_migrations.checksum·与 migrate.ts:365 同源）·P4-3' 产品码零 diff→conversation_event_append 静态体锚（库内函数体==0108 文件 `$`-quote 静态体·name 锚·镜像 db-acl :637-:643 形）；
6. P5（原 :410-:419）四臂化：P5-2 catchup 参数化（beforeCount===windowSet.length && applied===all.length−windowSet.length）+P5-2b 新臂（ledger===all.length·删 `===145` 冻结·「号位空洞不阻断」自注保留）+P5-3（`===145` 冻结删·参数化）——P5-4 官方子进程零触。**臂 37→38 零删门零弱化**（负门 P0/正门 P1/P2/白名单 P3/闭集 §3 全数原样）。

**件② prove（恰 1 run·零 retry-to-green）**：`pnpm db-acl2:prove` → **EXIT=0 · 38 PASS / 0 FAIL**（`RESULT dbacl2-db-acl failures=0`·DERIVE closed-set owners=memory_runtime sdTotal=282 恰 1 调用点 arity=2 encrypt）·隔离收据 `.tmp/isolated-proof-receipts/2026-10-15T14-12-22-990Z-59467-7781358d-463d-45bc-8d0e-4d5a6dfd5390.json`。38 臂全 PASS 名单=P5-4·P0-0·P0-1·P0-2·P0-3·P0-4·§3-1·§3-2·§3-3·§3-4·§3-5·§3-6·P5-1·P1-1..9（九臂）·P2-1..5（五臂）·P3-1..5（五臂）·P4-1·P4-2·P4-3·P5-2·**P5-2b（新臂）**·P5-3。

**门矩阵十四门（EXIT 原值）**：
| # | 门 | 结果 |
|---|---|---|
| 1 | db-acl2:prove | **EXIT=0 · 38/38 翻绿**（含 P5-2b 新臂·恰 1 run） |
| 2 | db-acl:prove | **EXIT=0 · 62 PASS/0 FAIL 维持**（`RESULT dbacl1-db-acl failures=0`·blob `570f5741` 零触·本席两跑全绿如实账：首跑 grep 管道丢 EXIT 码·复跑显式捕获 EXIT=0 62/0·两跑均绿非 retry-to-green） |
| 3 | migrate:prove | **EXIT=0**（全绿·链 204 头 0204 届时实数） |
| 4 | drift:prove | **EXIT=0**（零漂移·豁免 2 项既登恒等） |
| 5 | uniqueness | **EXIT=0 `files=204 violations=0 exemptions=0143,0152,0160`** |
| 6 | dbhy1:prove | **EXIT=0 · 28/0**（对简报钉 28 偏差 0·§0.2-3 静态计数 26 口径差如实存档） |
| 7 | interview:prove | **EXIT=0 · 57/0**（对简报钉 57 偏差 0） |
| 8 | neg:all | **EXIT=0 · 687 PASS/0 FAIL 六段全绿**（对简报钉 687 偏差 0；isolated runner 形 `node scripts/run-e2e-isolated.mjs neg:all`——裸 `pnpm -C apps/api neg:all` 缺 PG env 即 env_schema_invalid 红=环境供给面非码红·如实登记；严格 `^FAIL`=0·6 处 "FAIL" 字样均 IV_FAIL 夹具 ID 载于 PASS 行） |
| 9 | typecheck | **EXIT=0 · 8/8 successful · 0 cached** |
| 10 | lint 五值恰等 | **EXIT=0 · web 601 / root 5235 / api 1421 / worker 954 / ai-runtime 628 全恰等 · 全域 0 errors · 零第六值** |
| 11 | docs:check | **EXIT=0 · scanned 2149 ≤ cap 2152**（cap=`public-text-policy.mjs:90` 主线 `591d07cf` sanction 落值·终值含件③收据面·余量 3） |
| 12 | markers 五类 | **零命中**（改动集 2 tracked 词面运行时组装扫描·沿 `i6-239-gates.proof.mjs:151-163` 形·EXIT=0） |
| 13 | diff 面机检 | **恰 2 tracked**=`packages/db/test/db-acl2.proof.ts`（+76/−39）+本卷 .md（+9/−4）+收据目录 untracked（件③·零多 tracked） |
| 14 | 卫生 | **`pnpm install --frozen-lockfile` EXIT=0 lockfile 零改 · `.env*` ABSENT 双向记录 · 零模型外呼（est live=0·两 proof 均无 key 隔离容器机械断言）· `apps/web/tsconfig.tsbuildinfo` 运行翻动 checkout 归位不入 commit（cost-columns 先例形）· `actualSpendCny=null`** |

**pins 零翻声明**：§5 十一值+`actualSpendCny=null` 脚注全数照抄零翻转。**偏离清单**：①门 8 neg:all 裸命令形缺 PG env 红（环境供给面·runner 形绿·如实登记非就地处置）②门 2 db-acl:prove 两跑全绿账（首跑 EXIT 码丢失于管道·复跑捕获·两跑均绿）③§0.1 run-e2e-isolated.mjs blob 漂移重 pin（主线合法并线·非本刀触）④门 11 cap 联动 2144→2152（主线 sanction 已落值·本卷 §0.1 行随更）——四项均如实登记·零停止条件触发。**件③ 收据**：`ai-docs/delivery/receipts/db-acl-residual/00-exec.md`（untracked·七字段）。**STOP → `executed:awaiting_post_prove_dual`**（待 post-prove 双审·Ban self-approve·alone≠dual·⛔push）。

---

*DB-ACL-RESIDUAL REQUEST · 2026-10-15 起草 · **EXEC 落卷 2026-10-15（§9）**：pre-exec 双审 BOTH PASS（席1 agent_9ffa0cc6+席2 agent_e22738db）+协调方 EXEC 授权·并线 `dca42710`（--no-ff feat/mysql-schema-skeleton@f417d8e7·零冲突）·全量重 pin（链 204 头 0204·blob 六恒一漂·八名恒等·交叠复核零新触）·六处改形全落恰 1 文件·db-acl2:prove EXIT=0 **38/38 翻绿**（37 保留+P5-2b 新臂·零删门零弱化）·db-acl:prove 62/0 维持·门矩阵十四门全绿·STOP=**`executed:awaiting_post_prove_dual`**·待 post-prove 双审 · 基线 `feat/mysql-schema-skeleton` @`418f16e8`（起草时点 origin tip）→EXEC 时点 origin tip `f417d8e7` · 分支 `line/db-acl-residual` · 工作树 `meetwise-dar` · 修法=候选甲恰 1 文件六处改形·臂 37→38 零删门 · 迁移预期零=实际零（migrations 目录零字节触）· est live=0 · markers=0 · pins 十一值照抄零翻 · 停止条件四类全程未触发 · Ban self-approve · alone≠dual · ⛔push*
