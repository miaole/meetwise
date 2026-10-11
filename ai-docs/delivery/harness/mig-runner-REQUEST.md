# MIG-RUNNER REQUEST（批5 首刀 · 迁移 runner 基建 · #179 本体+收编 #115/#145/#140 runner 半 · M 体量）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**席位**：#批5 首刀 MIG-RUNNER 任务书起草席（北星 loop · 迁移 runner 基建 · M 体量）。
**基线**：`feat/mysql-schema-skeleton` @ `ad89c1c5`（主线最新 tip·`git log -1` 实测 2026-10-11·merge(h5-role-input)·任务书指定下限 `8231b05c` 经 `git merge-base --is-ancestor` 亲证为 HEAD 祖先·主线领先 5 commit）。分支 `line/mig-runner`·工作树 `meetwise-mig`（`git worktree add ../meetwise-mig -b line/mig-runner` 本起草席已立·建前 `git worktree list` 实查不存在）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` **#179（:277 原文+证据列+修法列逐字誊录 §0.1）**+依赖族五件（#115=:252/#134=:258/#135=:259/#140=:264/#145=:266·修法列指向 runner 面逐条）②批5 位图=LEDGER `product-campaign-LEDGER.md` :85/:96/:197/:212 + TASK-SOP-v2:81 ③活样本盘点=H2 0162/0163 双迁移（`8231b05c` 落线）+0160 双号（I2/H3 两刀同号）+QP 卷 :47/:120 起号勘误 ④形制沿 `i3-job-mgmt-REQUEST.md`（meetwise-i3 树 @`d76eb5d2`·§0-§8 全·Ban/pins 同源誊录）。

## §0 现状锚（起草席亲读·base `ad89c1c5`·file:line 逐条 rg/sed 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 已终局防重检查记录（今日教训·强制项）

- `rg -l "MIG-RUNNER|mig-runner|migrate.*runner" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md`（base `ad89c1c5` 实跑）→ 命中 **10 件逐条判定**：
  ①`product-campaign-LEDGER.md`（:85/:96/:197/:212）+②`TASK-SOP-v2.md`（:81）+③`extreview-fix-campaign-SOP.md`（:35）——三件均为**批5 立项位图/依赖注记**（「🆕 MIG-RUNNER 刀先行」「#179 总前置」「#115/#134/#135/#145/#137 全依赖此」）＝本刀立项槽本体记载·非既有卷；
  ④`g7-trio-fresh-run.md`（:32「migrate runner PASS」）+⑤`RESOURCE-HYGIENE.md`（:47「runner 每次自起临时 PG」）+⑥`e2e-recruiter-gate-REQUEST.md`+⑦`priv01-tenant-wiring.md`（:108/:138 三道门）+⑧`g1-score-s3-REQUEST.md`（:127「migrate 白名单」）——命中均为 **e2e 隔离 runner（`run-e2e-isolated.mjs` 面）或 migrate:prove 机制引用**·与迁移 runner（`packages/db/src/migrate.ts`）不同面·非立项；
  ⑨`ha-3-db-resilience-REQUEST.md`——「runMigrations/advisory lock 零碰（census 结构断言）」＝ha-3 卷如实登记**未触**本刀面·非立项；
  ⑩`trial-grant-REQUEST.md`——「0018 重跑形制」迁移文件引用·非 runner 面。
  `execution-master-checklist.md` **零命中**。harness/ **无同名卷** `mig-runner-REQUEST.md`（ls 全表实测）。→ **停止条件未触发·可落卷**。

### 0.1 盘点总表（#179+依赖族·issues-master 行号自查实测·双表对勘=LEDGER :85「5B 迁移/DB（22）」单×TASK-SOP-v2:81 20 件闸列）

| 件 | issues-master | 状态/核实 | 实树判定锚（`ad89c1c5` 实测） | 归槽 |
|---|---|---|---|---|
| **#179** | :277 P2「迁移 runner 缺口：事务路径无超时覆盖（继承 15s）、只有 concurrent-index/transactional 两种模式，无法真正分事务做 NOT VALID→VALIDATE」 | 仍存在·已核实①②③ | §0.3 三缺口全亲证 | **MIG-RUNNER 收（本体）** |
| #115 | :252「runner 对未来新事务迁移无统一 lock_timeout/statement_timeout 覆盖」·修法「runner 对事务迁移统一 SET LOCAL…」 | 部分修复·「15s 覆盖确认为未处理」（2026-10-09 独立复核更正 P1→P2 附记） | 与 #179 修法①同面（§0.3 缺口①）·concurrent-index 模式已自管 timeout（migrate.ts:270）事务模式零覆盖 | **runner 半=本刀收**；「新迁移热表建索引一律 CONCURRENTLY」=迁移纪律面归后继 5B 刀对表 |
| #134 | :258「0148 单事务内 6×ADD FK NOT VALID + VALIDATE…需 #179 的 runner 新模式」 | 仍存在 | 0148 拆事务**消费**新模式·迁移内容重制非 runner 面 | 后继 5B 刀（本刀只供承载面·§3-2） |
| #135 | :259「0149 ADD CHECK 未用 NOT VALID…无 lock_timeout」 | 仍存在 | 0149:35-36 `ADD CONSTRAINT ck_payment_order_amount_cents_positive CHECK (amount_cents>0)` 无 NOT VALID 亲证 | 后继 5B 刀（同上） |
| #140 | :264「两份 0143 前缀迁移靠 localeCompare 排序…多环境乱序应用会卡死部署」·修法「排序改字节序；CI 加迁移编号唯一性检查；新迁移从 0152 起」 | 仍存在·已核实（当前提交风险已关闭·乱序场景推断） | migrate.ts:195 localeCompare 亲证仍在（§0.3 缺口④）·CI 唯一性检查零命中（ci.yml 仅 :150/:240 两 prove 步） | **runner 半（字节序）=本刀收**；CI 检查半=裁决项③（本刀 ci.yml 小步 vs CI-WIRING） |
| #145 | :266「concurrent-index 失败留下 INVALID 索引，runner 检测后抛错但不清理，后续启动卡死需人工 DROP」·修法「自动 DROP INDEX CONCURRENTLY 后重试，并记录」 | 仍存在·已核实 | migrate.ts:183 `migration_concurrent_index_not_valid` 抛后零清理亲证（§0.3 缺口③） | **本刀收（runner 面全件）** |
| #25 | :368「commerce_outbox.consumption_id 仍无 FK…NOT VALID→VALIDATE 分事务」 | 部分修复 | 新模式消费方·迁移内容面 | 后继 5B 刀 |
| #16 | :216（kind CHECK NOT VALID→VALIDATE 分事务·依赖列 #179） | 仍存在 | 新模式消费方 | 后继 5B 刀 |
| #94 | :491（health 注释 query_timeout 不实·依赖列 #179） | 仍存在 | 与 runner 无关（客户端超时注释面） | 5E 批量·非本刀 |

**归槽结论**：本刀收编 = **#179 本体 + #115 runner 半 + #145 全件 + #140 runner 半**（四件全落 `packages/db/src/migrate.ts` 单文件 runner 面·附 prove 扩形）；#134/#135/#25/#16 等 17 件为新模式/timeout 面的**消费方**归 5B 序后继刀；#94→5E。与 TASK-SOP-v2:81「MIG-RUNNER（#179 总前置）→20 件」位图完全对勘（本刀落位=闸列前置面就位）。

### 0.2 漂移登记（issues-master 证据列旧锚 vs `ad89c1c5` 实测）

| 旧锚 | 现锚（实测） |
|---|---|
| `packages/db/src/migrate.ts:259-296` | `:255-296` 区（concurrent-index 臂 :255-287·transactional 臂 :289-296） |
| `packages/db/src/migrate.ts:305-318` | `:192-206`（canonicalMigrations·内含 :195 排序/:199 重复版检查/:201-203 事务控制禁令）+`:306-313`（loadMigrations·:312 模式正则）+`:238-240`（连续前缀校验） |
| `packages/db/src/principal.ts:915` | `:947-948`（`statement_timeout: PG_STATEMENT_TIMEOUT_MS ?? 15000`·`idle_in_transaction_session_timeout ?? 15000`） |
| `packages/db/src/migrate-cli.ts:6` | **仍准零漂**（:6 `createPool({ purpose: 'migrate' })` 亲证） |
| `0148*.sql:9-11,19-42` | `:15-42` 区（NOT VALID+VALIDATE 同文件=runner 单事务承载·亲证） |
| `0149*.sql:34-61` | `:34-36` 区（ADD CONSTRAINT … CHECK 无 NOT VALID·亲证） |

**重 pin 免责**：本节锚为起草席 base `ad89c1c5` 一次性亲读；EXEC 立项/双审照例全量重 pin，漂移只更行号不改结论（i3 卷 §0.2 同款先例）。

### 0.3 #179 缺口实锚（修法列两向逐条核·`ad89c1c5` 亲证）

- **缺口①事务迁移无 timeout 覆盖（#179 修法①+#115 runner 半）**：`migrate.ts:289-296` 事务臂＝`:290 BEGIN`→迁移 SQL→ledger INSERT→`:294 COMMIT` 裸形，**无任何 set_config** → 继承池级 `principal.ts:947` `statement_timeout ?? 15000`——长 DDL >15s 即被杀、整事务（迁移+记账）回滚＝部署失败。对照面：同文件 concurrent-index 臂**已**自管 timeout（`:270` `set_config('statement_timeout',…)+set_config('lock_timeout','2s',false)`·`:275-281` finally 恢复原值）——**同文件两臂 timeout 治理不对称＝缺口实形**。
- **缺口②模式仅两种（#179 修法②）**：`loadMigrations:312` `executionMode: /^\s*--\s*@migration-mode\s+concurrent-index\s*$/mi.test(sql) ? 'concurrent-index' : 'transactional'` 二值——「多语句非事务+逐步记账」模式全仓 rg 零命中（不存在）→ #134「VALIDATE 拆独立事务」/#135 NOT VALID→VALIDATE 分事务/#25/#16 消费面**无 runner 承载**。
- **缺口③INVALID 不清理（#145）**：`migrate.ts:183` `throw migrationError('migration_concurrent_index_not_valid')`——检测即抛、零清理、零重试 → 失败留下的 INVALID 索引使后续每次启动在同号重放检测处恒炸、需人工 DROP（#145 原文全句亲证成立）。
- **缺口④localeCompare 排序（#140 runner 半）**：`migrate.ts:195` `.sort((a, b) => a.version.localeCompare(b.version))`——ICU 环境敏感序 × `:238-240` `migration_ledger_not_contiguous_prefix` 连续前缀校验（序敏感）→ 多环境 locale 不一致可翻序卡死部署；`:199` `migration_manifest_duplicate_version` 仅**全文件名级**重复拦——数值前缀双号不拦（0143×2/0152×2/0160×2 三先例全容忍过闸·§0.4）。

### 0.4 迁移链治理现状（活样本盘点·防漏件）

- **号位链实测**：主线 migrations/ 最新＝0163（`0162_qbank_served_question_ref`+`0163_qbank_plan_snapshot_interview_fk` 均 H2 一刀双迁移·`8231b05c` 落线）；0160 双号＝I2 B-DELIVERABLE（`0160_b_qualitative_projection`）+H3 LEVEL-SCHEME（`0160_level_policy_version`）两刀同号；0161＝G5 SCOR-S3；**下一空号＝0164**（QP 卷 `qbank-planner-honesty-REQUEST.md`:47/:120 勘误实锚「主线链下一号实测=0164（最新=0163 H2·无 0164 在树）」+i3 卷 §9「H2 占 0162/0163 不入本树」亲证·本刀默认零迁移·0164 留后继刀 claim）。
- **双号治理先例链＝纯人工 SOP 零机器闸**：b110 卷（0152×2 主线双占亲证·「EXEC 时若主线已被占则取最小未占并如实登记」discipline·先例 `c51c792d` trial 0152→0154 同型）+db-intfk rev2（0143×2 历史双占·协调方顺延裁定 0147/0148·「不改迁移内容只改号」）——#140 修法「CI 加迁移编号唯一性检查」至今零命中（ci.yml 仅 `:150 migrate:prove`/`:240 migrate-cli:prove` 两步·亲证）。
- **H2 0162/0163 活样本缺口形态**：一刀占双号合法过闸全靠文件名序（0162<0163 locale 与字节序恰好同序·零失效先例）；跨 worktree 并发 claim 靠 `ls migrations` 亲核+登记 discipline——runner 对数值前缀双号零感知、CI 零唯一性闸＝**缺口形态坐实**（本刀③-c 裁决项承接口）。

### 0.5 既有防撞/序贯/漂移面盘点（本刀只增强不削弱·Ban 来源）

- **并发迁移防撞＝已有**：`migrate.ts:211` `pg_advisory_lock(hashtext('meetwise_migrations'))`（注释「串行化迁移者」·session 级单 client 互斥）+ finally `:299` pg_advisory_unlock——既有面零弱化（Ban 项）。
- **序贯保障＝已有**：连续前缀校验 `:238-240`+顺序 for-loop 逐号应用+顶层事务控制禁令 `:201-203`（`migration_transaction_control_forbidden`）+空 ledger 非空 schema 守卫 `:218-224`（`migration_uninitialized_nonempty_database`）——既有面。
- **漂移检测＝已有（边界如实记）**：ledger checksum 逐行对账 `:233-236`（`migration_ledger_unknown_version`/`migration_drift`）+重放期 drift 复查 `:246`+concurrent-index 物理重断言 `:244-248`（assertConcurrentIndexDefinition·「账本证明的是 runner 曾记录，不是操作者未删并发索引」头注原话）——物理重断言仅 concurrent-index 模式承载（其余对象不复检＝#179 修法列外边界·本刀不扩·如实记）。
- **prove 既有机制**：`migrate:prove`＝runMigrateProof 断言计数器形制（`migrate.proof.ts` `A()` 计数·**95 PASS 既有先例**＝g1 卷 :131「migrate:prove 0（95 PASS）」）经 `scripts/run-e2e-isolated.mjs` 隔离 PG（根 package.json `:309`）；`migrate-cli:prove` 链（根 package.json `:516-517` 双脚本→`packages/db` `prove:migrate-cli`）；`level-policy-migrate:prove`（`:451`）；ci.yml `:150`/`:240` 两步；ha-3 增补连接层退避（`migrate-cli.ts:8-11` W3/R-22 注释亲证 warmUpPool 面·**runMigrations/advisory lock 零碰**＝ha-3 卷如实登记·本刀同纪律）。

## §1 修法（runner 三簇·#179 修法列两向逐字固化·file:line 实锚·EXEC 立项重 pin）

### 簇① 事务迁移 timeout 覆盖（#179 修法①逐字「事务迁移显式 SET LOCAL lock_timeout/statement_timeout」+#115 runner 半）

- 事务臂 `:290 BEGIN` 后、迁移 SQL 前 `set_config('lock_timeout',…)`/`set_config('statement_timeout',…)`（会话级 SET LOCAL 形·照 `:270` concurrent-index 同族）+ finally 恢复原值（照 `:275-281` 形制）。
- 默认值与 env 形＝裁决项①（env 可调沿 `PG_STATEMENT_TIMEOUT_MS` 命名族·runner 默认应高于池默认 15s·具体值 EXEC 定）；超时→整事务回滚+ledger 零推进+fail-loud exit≠0（零 retry-to-green·R-22「DDL 失败不重试」语义对齐）。
- 池级生产默认零翻：`principal.ts:947-948` 两 env 默认值字节不动（本刀只 runner 内会话级覆盖·裁决项①边界）。

### 簇② 多语句非事务+逐步记账模式（#179 修法②逐字「新增『多语句非事务+逐步记账』模式」）

- 第三种 executionMode：注记语法＝裁决项②（倾向 `-- @migration-mode multi-statement` 沿 `:312` 正则同族·`:112` checksum 剥离面同步对齐）。
- 语义：文件内语句逐条**独立事务**执行+每句成功即写 ledger（逐步记账·形制＝concurrent-index 臂 `:282-287` 独立短事务记账同族扩展）→ 断点续跑幂等：重跑已记账句 skip、未记账句续跑；句级失败即停 fail-loud（已记账步不回滚＝非事务模式本义·与 NOT VALID→VALIDATE 分事务消费面 #134/#135 对表）。
- 顶层事务控制禁令 `:201-203` 对该模式的适用粒度＝裁决项④（逐语句检查 vs 全文件·倾向逐语句）。

### 簇③ runner 治理面（#145 全件+#140 runner 半收编）

- **③-a INVALID 自动清理重试（#145 修法逐字「runner 检测到 INVALID 时自动 DROP INDEX CONCURRENTLY 后重试，并记录」）**：DROP 授权边界＝裁决项⑤（仅限 runner 本次构建产物·名称/定义与 manifest 断言精确匹配方可·重试**恰一次**·再败 fail-loud·清理动作落日志记录）。
- **③-b 排序改字节序（#140 修法①「排序改字节序」）**：`migrate.ts:195` localeCompare→显式字节序比较器（零环境依赖·裁决项⑦实现形）；切换前置 prove 断言＝现树 migrations/ 全量文件名两序逐对等价（0143×2/0152×2/0160×2 双号对内序全等亲验·不等价即停上报回炉）。
- **③-c CI 迁移编号唯一性检查（#140 修法②·裁决项③）**：倾向本刀 ci.yml 小步（数值前缀唯一性脚本+workflow 一步·双号需显式豁免登记面·现树 EXIT=0 基线）；若协调方裁归 CI-WIRING 则本刀零触 ci.yml（③ 未决期间两刀两不动·EXEC 定一分一落）。

**本刀零新迁移**：`packages/db/migrations/` 目录零新增零改动（0001-0163 checksum 零漂移·0164 起号留后继 5B 刀 claim）；0148/0149 内容重制归 #134/#135 后继刀——新模式 prove 用 fixture 迁移目录（migrate.proof 形制·非树内 migrations/）。

## §2 验收断言候选（migrate.proof/migrate-cli.proof 扩形·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **timeout 生效断言**：事务迁移执行期 lock_timeout/statement_timeout 会话级观测断言（SHOW 对表）+执行后恢复原值断言（`:275-281` finally 形制对拍）。
2. **长 DDL 超预算形态断言**：fixture 长 DDL → statement_timeout 触发 → 整事务回滚 + ledger 零推进 + fail-loud tagged 错误面断言。
3. **multi-statement 逐步记账断言**：N 句 fixture 第 k 句失败 → 前 k-1 句已记账（重跑 skip k-1 续跑 k·幂等收敛）+失败句零记账+全成功形记账 N 句。
4. **INVALID 清理重试断言**：预植 INVALID 索引 → DROP CONCURRENTLY+重建+重试恰一次成功断言；再败 fail-loud 断言；非 runner 产物索引零触碰断言（裁决项⑤边界）。
5. **字节序切换等价断言**：现树 migrations/ 全量文件名 localeCompare 序==字节序逐对比对零翻；翻序用例负测（构造差异样本证明比较器真切换）。
6. **双号容忍回归断言**：0160×2 形 fixture 双号文件过闸序稳定（字节序下）+全文件名重复仍拒（`:199` 语义零弱化）。
7. **CI 唯一性检查断言（随裁决项③）**：脚本对现树 EXIT=0·构造数值前缀冲突样本 EXIT≠0+豁免登记面命中。
8. **回归面随改随核**：`migrate:prove`（95 PASS 基线→扩后计数如实宣布·**只增不减零洗**）+`migrate-cli:prove`+`level-policy-migrate:prove`+`db:prove` 全 EXIT 原值；真 PG 隔离库 0001-0163 全量 applied=0/skip 全量幂等零漂移断言；ha-3 connect-retry 面（`ha3-migrate-connect-retry.proof.ts`）EXIT 原值。
9. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **migrations/ 目录零新增零改动**（0001-0163 checksum 零漂移·0164 起号留后继 5B 刀）——本刀 Ban 迁移越权；任何迁移冲动=停手上报回炉。
2. **0148/0149/历史迁移内容重制归后继刀**：#134（0148 VALIDATE 拆事务）/#135（0149 NOT VALID 化）/#25（outbox FK）/#16（kind CHECK 分事务）——本刀只供 runner 承载面·消费刀零触。
3. **e2e 隔离 runner 零触**（`run-e2e-isolated.mjs`·migrateWithRecovery/PG-migrate 白名单 `:1188` 面/supported-target 三道门）——不同 runner 面（防重判定 §0.0·priv01 卷三道门登记形制零涉）。
4. **ha-3 W3 连接层退避面零触零弱化**（`migrate-connect-retry.ts`/warmUpPool/principal keepAlive·`runMigrations`/advisory lock 既有语义零弱化＝ha-3 卷「零碰」纪律同源）。
5. **生产库操作零发生**（est live=0·prove 全走隔离 fixture 库）；secrets 零触；`PG_STATEMENT_TIMEOUT_MS`/`PG_IDLE_TX_TIMEOUT_MS` 生产默认零翻（§1 簇①边界）。
6. **裁决项③ 未决期间 ci.yml 两不动**（本刀小步 vs CI-WIRING·EXEC 定一分一落·防两刀同触一文件）。
7. **SSOT 只读**：issues-master/LEDGER/TASK-SOP-v2/execution-master-checklist 行与统计零改。
8. **est live=0**：零模型真实外呼·零生产操作·零 secrets（§6）。

## §4 依赖（批5 位图核实·MIG-RUNNER 闸谁/被谁闸）

- **被谁闸＝零未决硬依赖**：DIR-B2 域文件夹化（5B 前置）已收官 merge @`8262d976`+hotfix @`6799544f`（LEDGER :197「19/19 收官…MIG-RUNNER 前置全齐」亲读）→ 本刀=批5 首刀可开工（LEDGER :96「批 5：MIG-RUNNER→AUTHZ-HARDEN→CI-WIRING→5C 四子刀→5E 批量」·箭头序为 DIR-1 车道串行安排非依赖闸·亲读如实）。
- **闸谁＝5B 迁移/DB 20 件**（TASK-SOP-v2:81 逐字：#115/#134/#135/#145/#140/#141/#142/#136/#137/#3/#13/#15/#23/#16/#25/#122/#144/#150/#151/#152——其中 #115/#145/#140-runner 半已由本刀收编·余 17 件＝新模式/timeout 面**消费方**待本刀落位后开工）；extreview-fix-campaign-SOP:35「#115/#134/#135/#145/#137 全依赖此」同源。
- **与 AUTHZ-HARDEN/CI-WIRING/5C 四子刀/5E＝无硬依赖**（域不相交：AUTHZ=api 授权面·CI-WIRING=ci 网络面·5C=可靠性四子刀·5E=文档清理）；唯一交点＝裁决项③（#140 CI 唯一性检查归属·两刀择一）。
- **并发面**：QP 卷（meetwise-qp·#200/#201·draft 待双审）与 H5 EXEC 在飞——均零触 `migrate.ts`/migrations·与本刀零文件交集；本刀触面＝`packages/db/src/migrate.ts`+`migrate-cli.ts`（如需注记）+`packages/db/test/migrate.proof.ts`+`migrate-cli.proof.ts`+根 ci.yml（裁决③）——照 G4 例登记零重叠。

## §5 Ban 列表 + pins（沿 i3 卷 §5 同源逐字誊 + 本刀面增补）

**Ban 列表**（i3 卷同源逐字誊 + 本刀增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀零新迁移·migrations/ 零新增零改动·0164 起号留后继 5B 刀 claim·迁移冲动=停手上报）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 历史迁移零改（0001-0163 checksum 零漂移）；Ban 弱化 advisory lock/序贯/漂移既有语义（§0.5 三面只增强不削弱）；Ban fail-open（timeout 穷尽/INVALID 再败必须 fail-loud exit≠0）；Ban 无界重试（INVALID 清理重试恰一次·裁决项⑤）；Ban 动 e2e 隔离 runner 与 ha-3 退避面（§3-3/§3-4）；Ban 洗 95 PASS 基线计数（扩后只增不减·如实宣布）；Ban 生产库直连操作（prove 全隔离 fixture 库）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全隔离库/fixture·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：prove 全隔离 PG/fixture 库机械断言（migrate.proof 形制·§2 九条）·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/mig-runner-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 i3 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①事务迁移 timeout 默认值与 env 形（runner 默认>池默认 15s·env 沿 `PG_STATEMENT_TIMEOUT_MS` 命名族·lock_timeout/statement_timeout 分设值 EXEC 定·池级生产默认零翻）；②multi-statement 模式注记语法（倾向 `-- @migration-mode multi-statement` 沿既有正则同族·checksum 剥离面 `:112` 同步）；③#140 CI 唯一性检查归属（倾向本刀 ci.yml 小步·CI-WIRING 让渡；裁归 CI-WIRING 则本刀零触 ci.yml）；④multi-statement 模式顶层事务控制禁令适用粒度（倾向逐语句）；⑤INVALID DROP 授权边界（仅 runner 本次构建产物·定义断言精确匹配·重试恰一次·日志记录）；⑥两模式 timeout 常量单源 vs 分设（`:132` concurrentIndexTimeoutMs() 与新事务 timeout 的统一面）；⑦字节序比较器实现形（倾向显式字节序比较器零环境依赖·禁 ICU 固定 locale 位）。

---

*MIG-RUNNER REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`ad89c1c5`（下限 `8231b05c` 祖先亲证）· 分支 `line/mig-runner` · 工作树 `meetwise-mig`（本起草席立·建前实查不存在）· 蓝本=更正版 issues-master #179（:277 原文/证据列/修法列逐字）+依赖族（#115=:252/#134=:258/#135=:259/#140=:264/#145=:266 修法列指向 runner 面逐条）+批5 位图（LEDGER :85/:96/:197/:212+TASK-SOP-v2:81）+活样本（H2 0162/0163 一刀双号·0160×2 I2/H3 两刀同号·QP 卷 0164 起号勘误）· 形制沿 i3-job-mgmt-REQUEST（meetwise-i3 树 @`d76eb5d2` §0-§8 全·Ban/pins 同源誊录）· 收编四件=#179 本体+#115 runner 半+#145 全件+#140 runner 半（三簇修法=事务 timeout 覆盖/multi-statement 逐步记账模式/治理面 INVALID 清理+字节序+CI 唯一性裁决）· 消费方 17 件归 5B 后继刀·#94→5E · 缺口四向实锚（:289-296 裸事务/:312 二值模式/:183 INVALID 不清理/:195 localeCompare）·既有防撞/序贯/漂移三面已有=只增强不削弱 · 本刀零新迁移（0164 留后继）· 防重双对表过（10 命中逐条判定非立项·checklist 零命中·无同名卷）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
