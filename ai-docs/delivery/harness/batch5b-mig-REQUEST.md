# BATCH5B-MIG REQUEST（批5·5B 迁移消费方批量刀 · 19 触点=17 件+#115/#140 两半 · 4 簇迁移/纪律面+登记 2 件 · M+ 体量）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀恰 1 .md 零码动·⛔push。EXEC/任何实施须预执行双审两外席 BOTH PASS 落卷 + 协调方明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工）。

**席位**：批5-5B 迁移消费方批量刀 REQUEST 起草席（北星 loop · MIG-RUNNER 后继消费面 · 协调方派单）。
**基线**：`feat/mysql-schema-skeleton` @ `28cdee05`（主线 tip·2026-10-13 `git pull --ff-only` 实测 Already up to date·`git log -1` 亲证）。分支 `line/batch5b-mig`·工作树 `meetwise-b5m`（`git worktree add ../meetwise-b5m -b line/batch5b-mig 28cdee05` 本起草席已立·建前 `git worktree list` 32 树实测无 b5m·建后 33 树）。本卷属会话工单（harness 卷宗）·派单时由主会话显式给路径·Context Lock 口径。
**蓝本**：①前身卷=`ai-docs/delivery/harness/mig-runner-REQUEST.md`（nailed @merge `685498f1`·刀 exec @`30084d98`·§0.1 归槽表「后继 5B 刀」诸行+§4「余 17 件」+§9 席2 观察②=本刀立项出处）②批5 位图=LEDGER `:86`（5B 行）+`:96`（执行序）+TASK-SOP-v2 `:81`（20 件闸列）③审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 19 触点原文（行号见 §0.1 表·今日亲证）④前车之鉴=AUTHZ 5A-1（侦察过期致返工）——**本卷 §0.1 每件现态均为起草席对 base `28cdee05` 亲证·非转抄侦察数据**。

## 必读清单（执行/双审开工前逐件精读·显式路径）

1. 本卷 + 前身卷 `ai-docs/delivery/harness/mig-runner-REQUEST.md`（§0.3 四缺口/§1 三簇/§9 nail disposition——本刀消费面权威）。
2. `AGENTS.md`（根）+ `ai-docs/delivery/harness/TASK-SOP-v2.md:81`（5B 闸列）+ `ai-docs/delivery/harness/product-campaign-LEDGER.md:86`（5B 位图行·只读）。
3. 规范：`ai-docs/rules/global/production-invariants.md` + `ai-docs/rules/global/status-machine.md`（#152 面）+ `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md`（#136/#137/#150 SECURITY DEFINER 面）+ `ai-docs/meta/directory-boundaries.md`。
4. 值域权威：`ai-docs/architecture/backend/domain-events-catalog.md`（#16 kind 值域裁决④依据）。
5. 审计原文：issues-master 更正版 19 触点行（§0.1 表列行号）。

## §0 现状锚（起草席亲读·base `28cdee05`·file:line 逐条 rg/sed/ls/git 实测亲证·**EXEC 立项照本节对届时 tip 重 pin**——漂移如实改锚·结论不变只更行号）

### 0.0 防重三对表（已终局·强制项）

- `git worktree list` 建前 32 树实测（主仓+5e/a34/ag19/ag24/ag37/ag38/ag39/aga/agb/agc/agd/age/agf/authz/bill1/bill2/bill3/bill4/billrev/blite/ciw2/cost1/cost2/cost3/e2sc/i263/i6/line-entpay/parity2/qsec/ttlwire）——**无 b5m 树**；`git branch --list "line/batch5b-mig"` 建前空输出（现唯一命中=本席分支）。
- `ls ai-docs/delivery/harness/ | rg -i "batch5|5b"` 零命中 + `rg -l "batch5b-mig|batch5b|BATCH5B" ai-docs/` 全域零命中——**无同名卷无冒名卷·可落卷**。
- 前身卷防重记录（mig-runner §0.0·10 命中逐条判定）随 nailed 终局·本刀不重跑其判定；本刀新增触面（migrations/ 多文件+ci.yml 裁决⑥+db proof 扩臂）在 §4 逐树核对零交集。

### 0.1 十九触点逐件现态总表（issues-master 行号=2026-10-13 亲证·现树锚=base `28cdee05` 起草席亲证·**定性为本卷用户口径钉死项 ⛔ 不得更改**·EXEC 重 pin 只准更锚不准翻定性）

| 件 | issues-master | 蓝本修法精要 | 现树实证锚（亲证） | 现态定性 | 归簇 |
|---|---|---|---|---|---|
| #134 | :258 P2 | 0148 单事务 6×ADD FK NOT VALID+VALIDATE·拆独立事务+lock_timeout | `0148_interview_composite_fk_batch1.sql:20/:23/:26/:29/:32/:35` NOT VALID ×6+`:37-42` VALIDATE ×6 同文件·runner 默认 transactional 臂单事务承载（migrate.ts:492-495） | **开放** | 簇A |
| #135 | :259 P2 | 0149 ADD CHECK 未 NOT VALID 无 lock_timeout·后续同类 NOT VALID→VALIDATE 分事务 | `0149_money_status_constraints.sql:36/:42/:47/:53` ADD CONSTRAINT CHECK 无 NOT VALID·全文件 rg lock_timeout 零命中 | **开放** | 簇A |
| #25 | :368 P3 | outbox.consumption_id 补 FK（NOT VALID→VALIDATE 分事务）+唯一约束 | `0001_baseline.sql:126-135` commerce_outbox·`:130` consumption_id uuid NOT NULL 无 FK 无 UNIQUE（对照 settlement_ledger `:146` uq_settlement_consumption 在） | **开放** | 簇B |
| #16 | :216 P2 | created_at expand-only+kind CHECK（NOT VALID→VALIDATE 分事务） | `0001_baseline.sql:38-46` interview_event 建表·`:43` kind text NOT NULL 无 CHECK·**无 created_at 列** | **开放** | 簇B |
| #3 | :211 P2 | 部分唯一索引（interview_id WHERE running）或 EXCLUDE（CONCURRENTLY 建） | `packages/db/src/interview/interview-jobs.ts:126` claim UPDATE+`:135-136` running/NOT EXISTS 谓词——不变量只在 claim SQL·issues 原锚路径 `packages/db/src/interview-jobs.ts` 已漂（现位 interview/ 子目录） | **开放** | 簇B |
| #13 | :365 P3 | 与 #3 一并补部分唯一索引 | `0019_schema_drift_reconcile.sql:56-68` UNIQUE(owner,interview,kind,seq)=防双提交≠running 唯一·`0147:10-11` uq_interview_id_owner=父侧键≠本面 | **开放** | 簇B |
| #15 | :215 P2 | interview_event REVOKE UPDATE+append-only 触发器（参照 0100） | `0001_baseline.sql:65` GRANT SELECT,INSERT,UPDATE ON ALL TABLES TO app_role·`0096:255` 仅 REVOKE DELETE·`0100:294-296` 触发器参照形在 | **开放** | 簇B |
| #23 | :219 P2 | settlement_ledger REVOKE UPDATE+append-only 触发器·更正走冲正行 | `0001_baseline.sql:150` GRANT … settlement_ledger 在·全 migrations rg 无 settlement_ledger append-only 触发器 | **开放** | 簇B |
| #122 | :396 P3 | DROP INDEX CONCURRENTLY 冗余索引+trace 补时间索引 | `0001_baseline.sql:370` ix_user_email+`0019:28` ix_qfb_rating 全库无 DROP（仅 `0046:33`/`0060:21` 他对象）·trace 唯一索引=`0014:6` ix_trace_request_id·`0001:59` created_at 无时间索引 | **开放** | 簇C |
| #150 | :408 P3 | 0144 六函数收回 PUBLIC 改授具名角色+删未接线预注册件 | `0144_db_trigfam_unify.sql:406-410` GRANT EXECUTE … TO PUBLIC ×5 在（:411/:421-433 区 EXEC 重 pin 全列） | **开放** | 簇B |
| #151 | :409 P3 | 0142 状态补失败/未决态+补复合 FK（0148 同口径） | `0142_candidate_profile_route.sql:58` status CHECK (status='interview_snapshotted') 单值·`:27-29` interview_id/resume_id 仅 length CHECK 无 FK | **开放** | 簇B |
| #152 | :410 P3 | 补金额一致性约束+graph_run 转移触发器·统一终态 | `0001_baseline.sql:409` payment_order status CHECK·`:26-36` ai_graph_run（:31 status 无状态机·`0149:53` 仅枚举 CHECK）·`apps/api/src/modules/commerce/commerce.service.ts:85-100` 在证·0173（BILL3 终态对）为 interview_consumption 面零交叠 | **开放** | 簇B |
| #137 | :261 P2 | 0146 函数内 SET LOCAL lock_timeout+评估 DETACH CONCURRENTLY+运维手册 | `0146:55` DETACH 无 SET LOCAL（全文件 rg 零命中）·0176 重写版（:47 起）rg lock_timeout/SET LOCAL/CONCURRENTLY 零命中 | **开放** | 簇B |
| #141 | :265 P2 | CI 加「默认值函数对运行时角色可执行」ACL 校验+修正 0145 错误归因注释 | `0145:21-24` 归因注释（归因 0040/0041 REVOKE·issues 考证=0073 默认撤销）+`:25-26` 补授权 GRANT·db-acl.proof 无 uuidv7-executable 臂（:389-390/:615 为 owner 闭集面） | **开放** | 簇D |
| #142 | :403 P3 | db-acl.proof 纳 CI+新增角色时强制运行 | `packages/db/package.json:68` prove:db-acl·根 `package.json:387` db-acl:prove·**ci.yml 零 db-acl 步**（:158 仅 pnpm db:prove） | **开放** | 簇D |
| #115 | :252 P2 | runner 统一 timeout+新迁移热表建索引一律 CONCURRENTLY | runner 半已闭=migrate.ts:490 transactional 臂 set_config 亲证；纪律半（CONCURRENTLY）现库 CONCURRENTLY 仅 0055/0147/0148(注释) 三文件 | **部分**（runner 半已闭·纪律半本刀收口） | 簇E |
| #144 | :404 P3 | 今后退役表先改名/归档+行数守卫·GRANT 热修拆分 | `0145:18-19` DROP TABLE IF EXISTS … CASCADE+`:25-26` 同文件混入 GRANT——先例在案·无码面可修 | **纪律件**（本刀起纪律条款收口·无迁移产出） | 簇E |
| #136 | :260 P2 | REVOKE EXECUTE FROM app_role 只授 qbank_control_executor+守卫替换 | **已闭合**：`0176_qbank_control_plane_authz_closeout.sql:98-99` REVOKE ALL … FROM PUBLIC,app_role+GRANT qbank_control_executor·`:44-47` 守卫 1 替换 definer 白名单（裁⑥=definer 断言形·强于原修法 GUC 形） | **已闭合转登记**（qsec 刀 0176 顺带闭合） | 簇E |
| #140 | :264 P2 | 排序改字节序+CI 编号唯一性检查+新迁移从 0152 起 | **已闭合**三向：①字节序=migrate.ts:236-239 比较器②CI=ci.yml:159-160 唯一性门+`scripts/check-migration-version-uniqueness.mjs`（69 行·CI-WIRING nail 收据 171 文件 EXIT=0·归属留名 :321 注释）③起号已演进（链顶 0181） | **已闭合转登记** | 簇E |
| 基建残余 | MIG 卷 §9 席2 观察② | multi-statement 臂无语句级 timeout——「归 5B 后继刀」 | migrate.ts:500-531 multi-statement 臂逐语句 BEGIN/COMMIT+旁表记账·**rg set_config 零命中**（对照 transactional 臂 :490 有） | **开放**（本刀执行项①） | 簇⓪ |

**现态计**：开放执行 15 件（#134/#135/#25/#16/#3/#13/#15/#23/#122/#150/#151/#152/#137/#141/#142）+基建残余 1 项；部分/纪律 2（#115/#144）；已闭合转登记 2（#136/#140）。计 19 触点+1 残余项。

### 0.2 MIG-RUNNER 消费面锚（runner 机制现状·本刀消费不重建·base `28cdee05` 亲证）

`packages/db/src/migrate.ts`：三模式 type `:20`（transactional/concurrent-index/multi-statement）·逐语句事务控制扫描 `:99`（裁决 4=per-statement 粒度·`:375-378` migration_transaction_control_forbidden）·multi-statement 注记剥离 `:108`·concurrent-index 注记剥离 `:205`·字节序比较器 `:236-239`·advisory lock `:394`·旁表 `schema_migrations_steps` `:420`（version/step_index/checksum·PK(version,step_index)·完成事务内 ledger INSERT+旁表 DELETE 原子交换 `:527-531`）·concurrent-index 臂 timeout `:476`（lock_timeout '2s'+statement_timeout·事务外执行 `:14` 头注）·transactional 臂 timeout `:490`+BEGIN/COMMIT `:492-495`·**multi-statement 臂 `:500-531` 零语句级 timeout（=执行项①落点）**·INVALID 清理重试 `:297-352`（DROP INDEX CONCURRENTLY IF EXISTS `:345`+重试+definition 断言 `:317-320`）。

### 0.3 漂移与交点登记（如实登记·处置权归协调方/裁决项）

1. **迁移号规则（⛔ 卷内规则钉死）**：主线链（base 28cdee05）顶=0181（0179 ag_d/0180 topic_shadow_meter/0181 ag19·`ls packages/db/migrations` 亲证 183 文件）；在飞占号亲证：cost3 树=`0184_ag12_estimator_claim_freeze.sql`·bill4 树=`0185_gateway_billing_ledger_payer.sql`·ag39 树=`0186_qbank_org_owner_columns.sql`+`0187_qbank_owner_scoped_retrieval.sql`。→ **本刀拟占 0188 起·预估 11±2 号（窗 0188-0198）·EXEC 立项日按主线实际链顶顺延逐号 claim 并登记于交付报告（b110 先例：主线已被占则取最小未占并如实登记）**。
2. **LEDGER 翻面出入登记**：LEDGER `:86` 5B 行已将 #115/#134/#135/#145 四件随 MIG-RUNNER 翻 ✅（注记「INVALID 索引清理·同 MIG-RUNNER 刀·同上翻面」）。其中 #145（INVALID 清理）/#115 runner 半/#140 runner 半属实；**#134/#135 的内容重制面现树零落（§0.1 亲证 0148/0149 未动）·#115 纪律半现树零落**——翻面口径与现树实态存在出入·本卷如实登记·SSOT 翻面处置权归协调方（本刀 Ban 改 SSOT·只在交付报告呈报）；本刀按派单口径将 #134/#135 列执行件·#115 纪律半列条款收口。
3. **#140 ciw2 交点终局**：ci-wiring-REQUEST.md `:31`（MIG 裁③落码+CI-WIRING 只登记接线）+`:100`（并线后 ci.yml 三步共存：typecheck gate+:159-160 唯一性门+migrate:prove/drift 邻位）——#140 CI 检查半闭合确证→本卷归登记件（§0.1）。
4. **#3 issues 原锚路径漂移**：`packages/db/src/interview-jobs.ts`→现位 `packages/db/src/interview/interview-jobs.ts`（结论不变只更路径）。
5. **#122 DROP 机制缺口（如实披露）**：concurrent-index 臂解析器 `:203-217` 仅受 CREATE INDEX 形（DROP 撞 migration_concurrent_index_sql_invalid）；multi-statement 臂逐语句 BEGIN/COMMIT 包裹而 `DROP INDEX CONCURRENTLY` 禁止事务块内运行——**两现成模式皆不能直接承载 DROP CONCURRENTLY**。处置=裁决项⑩（三案并陈·不得由执行者自行选择）。

## §1 修法（四簇+登记·逐条对应 §0.1 件号·**⛔ 不得更改**项随条标注·EXEC 立项重 pin）

### 簇⓪ runner 残口补全（基建残余 1 项·MIG 卷 §9 席2 观察② 承接·触面=migrate.ts+migrate.proof.ts 单点）

- **执行项①**：multi-statement 臂每语句事务内补 `set_config('statement_timeout',…)+set_config('lock_timeout',…)`（照 `:490` transactional 臂同族·finally 恢复原值照 concurrent-index 臂 finally 形制）·默认值与 env 形=**裁决项②**。超时→当前语句事务回滚+该步零记账+fail-loud exit≠0（零 retry-to-green）。`⛔ 不得更改`：三模式既有语义/advisory lock/序贯/漂移守卫/INVALID 清理/字节序六面零触——本簇只许 :500-531 臂内 timeout 单点增强。

### 簇A VALIDATE 族·历史两文件重制（#134/#135·**裁决项①** 案1 推荐/案2 并陈）

- **案1（推荐·mig-runner §3-2 明文「0148/0149 内容重制归后继刀」=授权出处）**：①`0148` 加 `-- @migration-mode multi-statement` 头注记（migrate.ts:108 剥离形）——12 语句（6×ADD FK NOT VALID+6×VALIDATE）经 splitTopLevelStatements 各自独立事务+逐步记账=拆事务达成；②`0149` 重制为 NOT VALID 先行 4 语句+VALIDATE 后行 4 语句+同注记（`:11` 前置脏值检测 DO 块保持首语句）·全文件补 `SET LOCAL` 面由簇⓪ 语句级 timeout 承载（**不再在语句间手工夹 SET LOCAL——跨语句事务失效·禁止**）。**代价如实披露**：两文件内容改=checksum 变·已应用环境（dev 库）migrate 撞 ledger checksum 对账红=预期形·处置=dev 库重建（隔离面 db:down/up）+交付报告登记；前提=releaseEvidence=false（pins）零生产库在案。**⛔ 不得更改**：重制豁免面=恰 0148/0149 两文件·其余 0001-0181 零字节。
- **案2（并陈）**：零回改·新号补偿迁移重做约束面（弱修·fresh-deploy 面不治·如实披露后由裁决①定）。
- **#134 修法「发布前跑孤儿检测」落地**：六张子表孤儿行计数=0 断言进 proof（VALIDATE 前置臂·红即拒跑）。
- 新迁移证明面：fresh 隔离库全量版本化迁移+0148/0149 逐步记账旁表断言+完成交换+全量 skip 幂等零漂移。

### 簇B 新迁移约束/权限面（9 件·每件一迁移号·multi-statement/concurrent-index/transactional 模式按机制适配·模式选择=修法条款非执行者自由量裁）

- **#25**：新迁移（multi-statement 注记）=①`ADD CONSTRAINT fk_outbox_consumption … NOT VALID`+`VALIDATE`（引用列与 ON DELETE 行为=**裁决项⑤**·EXEC 以 0001 表定义+`packages/db/src/commerce.ts` 写入路径亲证后定）②唯一约束形=**裁决项⑥**（CREATE UNIQUE INDEX CONCURRENTLY+ADD CONSTRAINT … USING INDEX vs 直接 ADD CONSTRAINT·outbox 行数量级亲证后定）。孤儿预检断言随簇A 同形。
- **#16**：新迁移（multi-statement）=①`ADD COLUMN created_at timestamptz NOT NULL DEFAULT now()`（expand-only）②kind CHECK NOT VALID→VALIDATE 分事务·值域=**裁决项③**（权威=domain-events-catalog.md+代码 INSERT 面 rg 实测·`interview-report.ts:24` 见 'interview_unavailable'/'assessment_unavailable' 在用·存量 kind 值全量 SELECT 破除断言先行）。
- **#151**：新迁移=status CHECK 扩（失败/未决态值域=**裁决项⑤**·应用零触·约束换名重建形）+复合 FK 与 0148 同口径（NOT VALID→VALIDATE）。
- **#152**：新迁移=①金额一致性约束（payment_order/settlement_ledger 形=**裁决项⑤**）②ai_graph_run 转移触发器（状态机形沿 0100/0173 触发器先例·终态统一 succeeded/completed 形=**裁决项⑤**·status-machine.md 为规范依据）。
- **#15/#23**：合一新迁移（transactional）=interview_event 与 settlement_ledger 各 REVOKE UPDATE FROM app_role+BEFORE UPDATE/DELETE 触发器 RAISE（形沿 `0100:294-296` assert_question_rubric_immutable 同族·SECURITY DEFINER SET search_path 形沿）·settlement_ledger 更正=冲正行纪律（DB 面拒原地 UPDATE·应用面零触）。**执行前置硬门**：EXEC 立项 rg 实测 `UPDATE interview_event`/`UPDATE settlement_ledger` 在 packages/db/src+apps 零合法调用点（预期零·非零=机制不满足停止条件停手上报）。
- **#150**：新迁移=0144 六函数 REVOKE EXECUTE FROM PUBLIC→GRANT 具名角色（角色集=**裁决项⑤**·触发器函数 EXECUTE 授权语义沿 0144 头注成因复核）·:411/:421-433 区全列 EXEC 重 pin·死预注册件（interview_derived_score）删除面=**裁决项⑤**（DB 对象 vs 码面归属·码面触=越界停止条件）。
- **#137**：新迁移=`CREATE OR REPLACE FUNCTION qbank_release_retired_generation_storage` 逐字承 0176 版体+体内增 `SET LOCAL lock_timeout`（值=裁决项② 同族·**0176 版体外零改**）·DETACH CONCURRENTLY 适用判据=**裁决项⑦**（PG 版本门）·运维手册=ai-docs/architecture/backend/ 增补短节（登记面·docs:check 必过）·0176 登记面如实承登（函数不在 manifest·守卫 1 fail-closed=本补强属纵深防御）。
- **#3/#13**：新迁移=「每面试至多一个有效 running」DB 面·三案=**裁决项⑧**：案a partial unique `ON interview_job (interview_id) WHERE status='running'`——**机制冲突如实披露**：claim 谓词 `:135-136` 允许过期-running 与新 running 共存（租约过期可重领）·案a 须先置过期态迁移（reaper/领取路径状态前置=码面扩界触越界停止条件）；案b（推荐）EXCLUDE 约束（btree_gist·interview_id WITH =+租约期 tstzrange WITH &&·CONCURRENTLY 建底层索引·零码面）；案c 零 DB 面仅 proof 断言（弱修并陈）。部分唯一索引在树先例=`0021:3-4` uq_interview_event_key WHERE event_key IS NOT NULL。

### 簇C 索引清理面（#122·1-3 号·**裁决项⑩**）

- trace 时间索引：新迁移 concurrent-index 模式 `CREATE INDEX CONCURRENTLY ix_trace_created_at ON ai_invocation_trace (created_at)`（模式适配亲证：concurrent-index 臂=单语句事务外+timeout `:476`+INVALID 清理——CREATE 形在解析器 `:205-217` 受内）。
- 冗余索引 DROP：三案=**裁决项⑩**：案a 非 concurrent `DROP INDEX`（transactional 迁移·user_account/question_feedback 行数量级亲证后锁窗口评估·如实登记）；案b concurrent-index 臂解析器扩 DROP INDEX 形（runner 单点增强·并入裁决②授权面· Ban 例外面同簇⓪）；案c 缓行 DROP 仅交付 trace 增索引。执行前置硬门：rg 实测 ix_user_email/ix_qfb_rating 全仓零查询引用（预期零·非零=停手上报）。
- **#115 纪律半随本簇收口（⛔ 不得更改条款）**：本刀起一切新迁移在存量（热）表上建索引一律 concurrent-index 模式（CONCURRENTLY）——写入 §1 条款+交付报告逐号登记模式选择。

### 簇D ACL/CI 面（#141/#142）

- **#141**：①db-acl.proof 扩臂：「uuidv7 对运行时角色 executable」断言（EXPECTED_CLOSED_SET 面外新臂·:389-390/:615 既有臂零动）+可选独立校验脚本形=**裁决项⑨**②0145 归因注释修正通道=**裁决项⑨**（推荐=新迁移注释面勘误登记·历史零字节纪律下禁回改 0145 原文）。
- **#142**：ci.yml 增 db-acl 一步（db:prove 邻位·run-e2e-isolated 隔离形·根 script :387 已在）+「新增角色时强制运行」机制=EXPECTED_CLOSED_SET 拓面断言（新角色出现即红）·ci.yml 触面授权=**裁决项⑥**（沿 MIG 裁③先例：本刀落码+ci-wiring2 续刀登记接线 vs 缓行归 CI 域）。

### 簇E 纪律与登记件（零码面·条款+登记）

- **#115 纪律半**：簇C 条款收口（上文）→本刀交付后 #115 全闭（runner 半 MIG 已闭）。
- **#144 纪律条款（本刀起强制·写入交付报告口径）**：今后退役表=先改名/归档+行数守卫·GRANT 热修独立成迁移不得混入——本刀零 0145 型操作自证。
- **#136（登记件）**：0176:98-99 闭合证据转录入交付报告·呈报 SSOT（issues-master :260 仍「仍存在」）翻面处置建议·不落码。
- **#140（登记件）**：三修法向闭合证据转录入交付报告（§0.1）·呈报 SSOT 翻面处置建议·不落码。

## §2 验收命令与断言（pre-exec 双审核对单基面·原样可复制·门预申明=migrate/drift+新 proof 扩臂+typecheck+docs:check）

```bash
node scripts/check-migration-version-uniqueness.mjs   # EXIT=0（豁免 0143/0152/0160 基线不变）
pnpm migrate:prove          # 基线 116 PASS/0 FAIL（CI-WIRING nail @6ca2275b 收据形）→扩后只增不减零洗·以 EXEC 立项日实跑复 pin
pnpm migrate-cli:prove      # EXIT=0 原值
pnpm drift:prove            # EXIT=0 零漂移
pnpm db:prove               # EXIT=0（dev 容器前置·MIG 卷 §9 席1 登记面）
pnpm db-acl:prove           # 既有臂原值+簇D 扩臂全绿
turbo typecheck --force     # 3/3 0 cached + 根 pnpm typecheck EXIT=0
node scripts/ai-docs/check-docs.mjs   # EXIT=0（docs:check）
```

断言候选（断言力每簇≥3·EXEC 立项重 pin）：①簇⓪ 语句级 timeout 生效断言（会话级观测+恢复断言）+步失败零记账断言；②簇A fresh 隔离库全量迁移：0148=12 步旁表记账+原子交换断言·0149=NOT VALID 4+VALIDATE 4 各自事务断言+全量 skip 幂等零漂移+孤儿预检臂；③簇B append-only 触发器负测（UPDATE/DELETE 拒·SELECT/INSERT 通）+ai_graph_run 非法转移拒/合法转移通+双终态统一断言+FK/一致性约束在位断言；④簇C pg_index 前后态断言+drift 零漂移；⑤簇D uuidv7-executable 断言+新角色强制红断言；⑥回归：§2 全表 EXIT 原值+migrations 计数=基线 183+本刀新号数（rg 实测·偏差=熔断上报）。

## §3 范围外（越界即停·FAIL）

1. runner 主语义零触（三模式语义/advisory lock/序贯/漂移守卫/INVALID 清理/字节序六面零触·簇⓪ :500-531 timeout 单点=唯一例外·裁决⑩案b 再开第二例外须双审明示）。
2. 应用码面零触（packages/db/src 业务封装/apps/**——#3/#13 案a 状态前置/#150 死件码面若需码动=停手上报）。
3. 历史迁移零字节改·豁免面=恰 0148/0149 两文件且仅裁决①案1 行使时。
4. e2e 隔离 runner（run-e2e-isolated.mjs 白名单 supported-target 三道门）与 ha-3 退避面零触零弱化。
5. 共享 SSOT 只读（LEDGER/issues-master/TASK-SOP-v2/execution-master-checklist 行与统计零改·§0.3-2 翻面出入呈报不处置）。
6. 生产库操作零发生（est live=0·prove 全隔离库）；secrets 零触；生产 env 默认零翻（`PG_STATEMENT_TIMEOUT_MS` 族零动）。
7. ci.yml 零触超裁决⑥授权面；其他工作树（cost3/bill4/ag39/ciw2/qsec 等 33 树）零触。
8. est live=0（§6）。

## §4 依赖与并发面

- **被谁闸=零未决硬依赖**：MIG-RUNNER nailed（主线 merge `685498f1`·LEDGER :86/:311 亲证·刀 exec @`30084d98`）——multi-statement 模式/逐步记账/timeout 面/INVALID 清理/唯一性门全在主线在证（§0.2）=本刀前置解除。
- **占号在飞**：cost3=0184/bill4=0185/ag39=0186+0187（§0.3-1 三树 ls 亲证）→本刀 0188 起·EXEC 立项日链顶复核顺延。
- **文件交集核对**：在飞三刀全迁移件零触 migrate.ts/ci.yml/db proof——本刀触面=migrations/（新号+0148/0149 豁免）+migrate.ts（簇⓪ 单点）+migrate.proof.ts+db-acl.proof.ts+根 package.json（新门脚本如需）+ci.yml（裁决⑥）+运维手册 1 .md——逐树核对零交集。
- **交点刀**：CI-WIRING nailed @`6ca2275b`·12 件真开放转 ciw2 续刀待立项（LEDGER 5D 行）=#142 ci.yml 归属裁决先例源；qsec 0176=#136 闭合出处。

## §5 Ban 列表 + pins（沿 mig-runner/ag-d 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（LEDGER/execution-master-checklist/issues-master/TASK-SOP 行与统计只读引用·翻面权归协调方）；Ban 触 `crag.ts` 决策逻辑与 RAG 面·Ban 动 embedding 计算面（本刀零相关）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 历史迁移回改超 §3-3 豁免面（0148/0149 外 0001-0181 全体零字节）；Ban 触 runner 主语义超 §3-1 例外面；Ban 弱化 advisory lock/序贯/漂移/INVALID 清理既有语义（只增强不削弱）；Ban fail-open（timeout 穷尽/孤儿预检红/触发器拦截失败必须 fail-loud exit≠0）；Ban 无界重试；Ban 生产库直连操作（prove 全隔离库）；Ban 洗基线计数（116 PASS 等只增不减如实宣布）；Ban 跨语句手工夹 SET LOCAL（簇A ⛔ 条款）；Ban 应用码面触（§3-2）；Ban e2e 隔离 runner 与 ha-3 退避面触；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全隔离库/fixture·零模型外呼·零消耗）。

## §6 est live=0

本刀零模型真实外呼：全 prove 走隔离 PG/fixture 库机械断言（migrate.proof/run-e2e-isolated 形）·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/batch5b-mig-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 EXEC 收据）。五类标记词不复抄卷内（避免自匹配·沿 mig-runner/ag-d 卷 §7 同形制）。

## §8 STOP（开工三条款+四类停止条件+裁决项）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·漂移只更行号不改结论）。

**四类停止条件（命中即停·停手上报回炉）**：
- **现场漂移**：主线 tip 前进致 §0 锚漂（重 pin 不能平）、在飞 0184-0187 已并线改链顶（照 §0.3-1 顺延规则处理·双占/跳号=停）、0148/0149 被他刀先动、migrate.ts 被后继刀改动。
- **机制不满足**：multi-statement/逐步记账/旁表交换/concurrent-index 事务外执行任一实测与 §0.2 锚不符；#15/#23 前置 rg 发现合法 UPDATE 调用点；#122 前置 rg 发现冗余索引在用；0148/0149 语句拆分实测不可行（分裂器行为异常）。
- **越界需要**：任何修法要求触应用码面/SSOT/e2e runner/历史迁移豁免面外对象/ci.yml 超裁决⑥面（含 #3 案a 状态前置、#150 死件码面）。
- **验收红不可修**：§2 门任一红且归因非本刀改动面·或基线计数缺失无法对照（只增不减断言失据）。

**待双审/EXEC 裁决项**：①#134/#135 重制 案1（推荐）/案2+checksum 漂移处置登记形；②簇⓪+#137 timeout 默认值与 env 形（沿 `PG_STATEMENT_TIMEOUT_MS` 命名族·runner 默认>池 15s·lock/statement 分设值）；③#16 kind 值域封闭集（权威=domain-events-catalog.md+代码/存量 rg 实测）；④#3/#13 索引形状三案（推荐案b EXCLUDE·案a 码面冲突披露在案）；⑤#25/#151/#152/#150 各约束/角色/终态形（引用列/唯一约束形/状态值域/角色集/死件归属五小项合并裁）；⑥#142 ci.yml 步归属（沿 MIG 裁③先例 vs 缓行归 CI 域）；⑦#137 DETACH CONCURRENTLY 适用判据（PG 版本门）；⑧#141 扩臂形（db-acl 扩臂 vs 独立脚本）+0145 注释修正通道（推荐新迁移注释面）；⑨#122 DROP 形三案（案a 非 concurrent/案b 解析器扩形/案c 缓行）；⑩派单粒度（单刀一波 vs 两波：簇⓪Ⓐ 码面先行+簇ⒷⒸⒹ 收尾——协调方定）。

## §9 EXEC 交付报告格式（收据必含七节·缺一即 post-prove 拒收）

1. **迁移号 claim 表**：实际链顶复核值+逐号认领记录（件号↔号位↔模式↔文件名·§0.3-1 规则履约）。
2. **逐件七项**：19 触点逐件=件号/裁决行使案/触面文件清单（file:line）/新迁移号/断言臂名/门 EXIT/定性（执行完=全闭/条款收口/登记呈报）。
3. **门全表**：§2 八命令逐条 EXIT+基线计数对照（116 PASS 等只增不减）。
4. **SSOT 呈报**：LEDGER :86 翻面出入+#136/#140 登记件证据+issues-master 翻面处置建议（不落 SSOT·呈报归协调方）。
5. **豁免面自证**：0148/0149 diff 全文+其余 0001-0181 零字节 `git diff` 亲证回执。
6. **卫生双声明**：markers 五类亲跑回执+est live=0（逐 prove 零外呼口径）+pins 十一值零翻。
7. **停止条件核查**：四类逐条命中与否（未命中=明写未命中）。

---

*BATCH5B-MIG REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`28cdee05`（pull --ff-only Already up to date 亲证）· 分支 `line/batch5b-mig` · 工作树 `meetwise-b5m`（本起草席立·建前 32 树实测无 b5m）· 蓝本=mig-runner-REQUEST（nailed @685498f1·§0.1 归槽+§4 余 17 件+§9 席2 观察②）+LEDGER :86/:96+TASK-SOP-v2:81+issues-master 19 触点行号亲证（#3=211/#13=365/#15=215/#16=216/#23=219/#25=368/#115=252/#122=396/#134=258/#135=259/#136=260/#137=261/#140=264/#141=265/#142=403/#144=404/#150=408/#151=409/#152=410）· 现态=开放 15 件+基建残余 1（multi-statement 语句级 timeout）+部分/纪律 2（#115/#144）+已闭合转登记 2（#136=0176:98-99·#140=字节序+唯一性门+起号演进三向全闭）· 修法四簇（⓪ runner 单点补全/A 0148-0149 重制裁决①/B 九件新迁移/C #122 索引裁决⑨+#115 纪律条款/D #141-#142 ACL/CI/E 登记件）· 迁移号拟占 0188 起（在飞 0184 cost3/0185 bill4/0186+0187 ag39 三树 ls 亲证·EXEC 立项日链顶顺延）· LEDGER :86 翻面出入如实登记（#134/#135/#115 纪律半现树零落·处置权归协调方）· 迁移号规则/纪律条款/豁免面=⛔ 不得更改钉死项·裁决十项归双审/EXEC· 停止条件四类全（漂移/机制/越界/验收红）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
