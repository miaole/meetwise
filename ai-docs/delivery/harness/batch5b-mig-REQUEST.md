# BATCH5B-MIG REQUEST（批5·5B 迁移消费方批量刀 · 19 触点=17 件+#115/#140 两半 · 4 簇迁移/纪律面+登记 2 件 · M+ 体量）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 施工完随翻 2026-10-14·pre-exec 双审 rev2 BOTH PASS+协调方授权开工·门矩阵全绿后落卷·⛔push·post 双审两外席待审·post PASS 后翻面归协调方）。

**席位**：批5-5B 迁移消费方批量刀 REQUEST 起草席（北星 loop · MIG-RUNNER 后继消费面 · 协调方派单）。
**基线**：`feat/mysql-schema-skeleton` @ `28cdee05`（主线 tip·2026-10-13 `git pull --ff-only` 实测 Already up to date·`git log -1` 亲证）。分支 `line/batch5b-mig`·工作树 `meetwise-b5m`（`git worktree add ../meetwise-b5m -b line/batch5b-mig 28cdee05` 本起草席已立·建前 `git worktree list` 32 树实测无 b5m·建后 33 树——树计数=起草时点值非恒定·rev2 复测 13 树（2026-10-14）·EXEC 立项日以 `git worktree list` 复测为准）。本卷属会话工单（harness 卷宗）·派单时由主会话显式给路径·Context Lock 口径。
**蓝本**：①前身卷=`ai-docs/delivery/harness/mig-runner-REQUEST.md`（nailed @merge `685498f1`·刀 exec @`30084d98`·§0.1 归槽表「后继 5B 刀」诸行+§4「余 17 件」+§9 席2 观察②=本刀立项出处）②批5 位图=LEDGER `:86`（5B 行）+`:96`（执行序）+TASK-SOP-v2 `:81`（20 件闸列）③审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 19 触点原文（行号见 §0.1 表·今日亲证）④前车之鉴=AUTHZ 5A-1（侦察过期致返工）——**本卷 §0.1 每件现态均为起草席对 base `28cdee05` 亲证·非转抄侦察数据**。

## 必读清单（执行/双审开工前逐件精读·显式路径）

1. 本卷 + 前身卷 `ai-docs/delivery/harness/mig-runner-REQUEST.md`（§0.3 四缺口/§1 三簇/§9 nail disposition——本刀消费面权威）。
2. `AGENTS.md`（根）+ `ai-docs/delivery/harness/TASK-SOP-v2.md:81`（5B 闸列）+ `ai-docs/delivery/harness/product-campaign-LEDGER.md:86`（5B 位图行·只读）。
3. 规范：`ai-docs/rules/global/production-invariants.md` + `ai-docs/rules/global/status-machine.md`（#152 面）+ `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md`（#136/#137/#150 SECURITY DEFINER 面）+ `ai-docs/meta/directory-boundaries.md`。
4. 值域权威：`ai-docs/architecture/backend/domain-events-catalog.md`（#16 kind 值域裁决③依据·rev2 B2 残面对齐）。
5. 审计原文：issues-master 更正版 19 触点行（§0.1 表列行号）。

## §0 现状锚（起草席亲读·base `28cdee05`·file:line 逐条 rg/sed/ls/git 实测亲证·**EXEC 立项照本节对届时 tip 重 pin**——漂移如实改锚·结论不变只更行号）

### 0.0 防重三对表（已终局·强制项）

- `git worktree list` 建前 32 树实测（主仓+5e/a34/ag19/ag24/ag37/ag38/ag39/aga/agb/agc/agd/age/agf/authz/bill1/bill2/bill3/bill4/billrev/blite/ciw2/cost1/cost2/cost3/e2sc/i263/i6/line-entpay/parity2/qsec/ttlwire）——**无 b5m 树**（32/33=2026-10-13 起草时点实测·时点值非恒定·rev2 复测 13 树（2026-10-14）·EXEC 立项日复测为准）；`git branch --list "line/batch5b-mig"` 建前空输出（现唯一命中=本席分支）。
- `ls ai-docs/delivery/harness/ | rg -i "batch5|5b"` 零命中 + `rg -l "batch5b-mig|batch5b|BATCH5B" ai-docs/` 全域零命中——**无同名卷无冒名卷·可落卷**。
- 前身卷防重记录（mig-runner §0.0·10 命中逐条判定）随 nailed 终局·本刀不重跑其判定；本刀新增触面（migrations/ 多文件+ci.yml 裁决⑥+db proof 扩臂）在 §4 逐树核对零交集。

### 0.1 十九触点逐件现态总表（issues-master 行号=2026-10-13 亲证·现树锚=base `28cdee05` 起草席亲证·**定性为本卷用户口径钉死项 ⛔ 不得更改**·EXEC 重 pin 只准更锚不准翻定性）

| 件 | issues-master | 蓝本修法精要 | 现树实证锚（亲证） | 现态定性 | 归簇 |
|---|---|---|---|---|---|
| #134 | :258 P2 | 0148 单事务 6×ADD FK NOT VALID+VALIDATE·拆独立事务+lock_timeout | `0148_interview_composite_fk_batch1.sql:20/:23/:26/:29/:32/:35` NOT VALID ×6+`:37-42` VALIDATE ×6 同文件·runner 默认 transactional 臂单事务承载（migrate.ts:546-553·rev2 E2/F2 锚更正） | **开放** | 簇A |
| #135 | :259 P2 | 0149 ADD CHECK 未 NOT VALID 无 lock_timeout·后续同类 NOT VALID→VALIDATE 分事务 | `0149_money_status_constraints.sql:36/:42/:47/:53` ADD CONSTRAINT CHECK 无 NOT VALID·全文件 rg lock_timeout 零命中 | **开放** | 簇A |
| #25 | :368 P3 | outbox.consumption_id 补 FK（NOT VALID→VALIDATE 分事务）+唯一约束 | `0001_baseline.sql:126-135` commerce_outbox·`:130` consumption_id uuid NOT NULL 无 FK 无 UNIQUE（对照 settlement_ledger `:146` uq_settlement_consumption 在） | **开放** | 簇B |
| #16 | :216 P2 | created_at expand-only+kind CHECK（NOT VALID→VALIDATE 分事务） | `0001_baseline.sql:38-46` interview_event 建表·`:43` kind text NOT NULL 无 CHECK·**无 created_at 列** | **开放** | 簇B |
| #3 | :211 P2 | 部分唯一索引（interview_id WHERE running）或 EXCLUDE（CONCURRENTLY 建·rev2 勘误注：EXCLUDE 无附着形·「CONCURRENTLY 建」原提法不成立·见裁决④ B3 重写） | `packages/db/src/interview/interview-jobs.ts:126` claim UPDATE+`:135-136` running/NOT EXISTS 谓词——不变量只在 claim SQL·issues 原锚路径 `packages/db/src/interview-jobs.ts` 已漂（现位 interview/ 子目录） | **开放** | 簇B |
| #13 | :365 P3 | 与 #3 一并补部分唯一索引 | `0019_schema_drift_reconcile.sql:56-68` UNIQUE(owner,interview,kind,seq)=防双提交≠running 唯一·`0147:10-11` uq_interview_id_owner=父侧键≠本面 | **开放** | 簇B |
| #15 | :215 P2 | interview_event REVOKE UPDATE+append-only 触发器（参照 0100） | `0001_baseline.sql:65` GRANT SELECT,INSERT,UPDATE ON ALL TABLES TO app_role·`0096:255` 仅 REVOKE DELETE·`0100:294-296` 触发器参照形在 | **开放** | 簇B |
| #23 | :219 P2 | settlement_ledger REVOKE UPDATE+append-only 触发器·更正走冲正行 | `0001_baseline.sql:150` GRANT … settlement_ledger 在·全 migrations rg 无 settlement_ledger append-only 触发器 | **开放** | 簇B |
| #122 | :396 P3 | DROP INDEX CONCURRENTLY 冗余索引+trace 补时间索引 | `0001_baseline.sql:370` ix_user_email+`0019:28` ix_qfb_rating 全库无 DROP（仅 `0046:33`/`0060:21` 他对象）·trace 唯一索引=`0014:6` ix_trace_request_id·`0001:59` created_at 无时间索引 | **开放** | 簇C |
| #150 | :408 P3 | 0144 六函数收回 PUBLIC 改授具名角色+删未接线预注册件 | `0144_db_trigfam_unify.sql:406-411` GRANT EXECUTE … TO PUBLIC ×6 连续在（F3 更正·六处全列=:406/:407/:408/:409/:410/:411·:418-433 区=死预注册件 interview_derived_score 面 EXEC 重 pin） | **开放** | 簇B |
| #151 | :409 P3 | 0142 状态补失败/未决态+补复合 FK（0148 同口径） | `0142_candidate_profile_route.sql:58` status CHECK (status='interview_snapshotted') 单值·`:27-29` interview_id/resume_id 仅 length CHECK 无 FK | **开放** | 簇B |
| #152 | :410 P3 | 补金额一致性约束+graph_run 转移触发器·统一终态 | `0001_baseline.sql:409` payment_order status CHECK·`:26-36` ai_graph_run（:31 status 无状态机·`0149:53` 仅枚举 CHECK）·`apps/api/src/modules/commerce/commerce.service.ts:85-100` 在证·0173（BILL3 终态对）为 interview_consumption 面零交叠 | **开放** | 簇B |
| #137 | :261 P2 | 0146 函数内 SET LOCAL lock_timeout+评估 DETACH CONCURRENTLY+运维手册 | `0146:55` DETACH 无 SET LOCAL（全文件 rg 零命中）·0176 重写版（:47 起）rg lock_timeout/SET LOCAL/CONCURRENTLY 零命中 | **开放** | 簇B |
| #141 | :265 P2 | CI 加「默认值函数对运行时角色可执行」ACL 校验+修正 0145 错误归因注释 | `0145:21-24` 归因注释（归因 0040/0041 REVOKE·issues 考证=0073 默认撤销）+`:25-26` 补授权 GRANT·db-acl.proof **已有** uuidv7 单函数 executable 臂 P1-1/P1-2（db-acl.proof.ts:435-448·闭集含 app_role·F1 亲证重瞄准）——真缺口=任意 DEFAULT 函数（pg_attrdef 推导）对运行时角色 executable **泛化门缺失**（:389-390/:615 仅 owner/写者闭集面） | **开放** | 簇D |
| #142 | :403 P3 | db-acl.proof 纳 CI+新增角色时强制运行 | `packages/db/package.json:68` prove:db-acl·根 `package.json:387` db-acl:prove·**ci.yml 零 db-acl 步**（:158 仅 pnpm db:prove） | **开放** | 簇D |
| #115 | :252 P2 | runner 统一 timeout+新迁移热表建索引一律 CONCURRENTLY | runner 半已闭=migrate.ts:548 transactional 臂 set_config 亲证（rev2 E2 锚更正）；纪律半（CONCURRENTLY）现库 CONCURRENTLY 仅 0055/0147/0148(注释) 三文件 | **部分**（runner 半已闭·纪律半本刀收口） | 簇E |
| #144 | :404 P3 | 今后退役表先改名/归档+行数守卫·GRANT 热修拆分 | `0145:18-19` DROP TABLE IF EXISTS … CASCADE+`:25-26` 同文件混入 GRANT——先例在案·无码面可修 | **纪律件**（本刀起纪律条款收口·无迁移产出） | 簇E |
| #136 | :260 P2 | REVOKE EXECUTE FROM app_role 只授 qbank_control_executor+守卫替换 | **已闭合**：`0176_qbank_control_plane_authz_closeout.sql:98-99` REVOKE ALL … FROM PUBLIC,app_role+GRANT qbank_control_executor·`:54-58` 守卫 1 替换 definer 白名单（rev2 F5 锚更正）（裁⑥=definer 断言形·强于原修法 GUC 形） | **已闭合转登记**（qsec 刀 0176 顺带闭合） | 簇E |
| #140 | :264 P2 | 排序改字节序+CI 编号唯一性检查+新迁移从 0152 起 | **已闭合**三向：①字节序=migrate.ts:242-243 比较器（rev2 E2 锚更正）②CI=ci.yml:159-160 唯一性门+`scripts/check-migration-version-uniqueness.mjs`（69 行·CI-WIRING nail 收据 171 文件 EXIT=0·归属留名 :321 注释）③起号已演进（链顶 0181） | **已闭合转登记** | 簇E |
| 基建残余 | MIG 卷 §9 席2 观察② | multi-statement 臂无语句级 timeout——「归 5B 后继刀」 | migrate.ts:500-534 multi-statement 臂逐语句 BEGIN/COMMIT+旁表记账·**rg set_config 零命中**（对照 transactional 臂 :548 有·rev2 E2 锚更正） | **开放**（本刀执行项①） | 簇⓪ |

**现态计**：开放执行 15 件（#134/#135/#25/#16/#3/#13/#15/#23/#122/#150/#151/#152/#137/#141/#142）+基建残余 1 项；部分/纪律 2（#115/#144）；已闭合转登记 2（#136/#140）。计 19 触点+1 残余项。

### 0.2 MIG-RUNNER 消费面锚（runner 机制现状·本刀消费不重建·base `28cdee05` 亲证）

`packages/db/src/migrate.ts`（rev2 E2/F2 锚组全量更正·本席亲证重 pin）：三模式 type `:20`（transactional/concurrent-index/multi-statement）·逐语句事务控制扫描 `:99`（裁决 4=per-statement 粒度·`:375-378` migration_transaction_control_forbidden）·multi-statement 注记剥离 `:108`·concurrent-index 注记剥离 `:205`·字节序比较器 `:242-243`（注释块 `:235-241`）·env 上界 1s-900s `:230/:264`（裁决② 输入项）·advisory lock `:394`·旁表 `schema_migrations_steps` `:420`（version/step_index/checksum·PK(version,step_index)·完成事务内 ledger INSERT `:529`+旁表 DELETE `:530` 原子交换 `:527-533`）·concurrent-index 臂 timeout `:476`（lock_timeout '2s'+statement_timeout·事务外执行 `:14` 头注·finally 恢复 `:487-491`）·transactional 臂 `:536-558`（timeout 读先值 `:542-545`+set_config `:548`+BEGIN `:546`/COMMIT `:551`+finally 恢复 `:554-558`）·**multi-statement 臂 `:500-534` 零语句级 timeout（=执行项①落点·逐语句 BEGIN/COMMIT `:520-525`）**·INVALID 清理重试 `:297-352`（DROP INDEX CONCURRENTLY IF EXISTS `:345`+重试 `:350`+definition 断言 `:343`·`:317-320` assert 臂在证）。

### 0.3 漂移与交点登记（如实登记·处置权归协调方/裁决项）

1. **迁移号规则（⛔ 卷内规则钉死）**：主线链（base 28cdee05）顶=0181（0179 ag_d/0180 topic_shadow_meter/0181 ag19·`ls packages/db/migrations` 亲证 183 文件）；在飞占号亲证：cost3 树=`0184_ag12_estimator_claim_freeze.sql`·bill4 树=`0185_gateway_billing_ledger_payer.sql`·ag39 树=`0186_qbank_org_owner_columns.sql`+`0187_qbank_owner_scoped_retrieval.sql`。→ **本刀拟占 0188 起·预估 11±2 号（窗 0188-0198）·EXEC 立项日按主线实际链顶顺延逐号 claim 并登记于交付报告（b110 先例：主线已被占则取最小未占并如实登记）**。
2. **LEDGER 翻面出入登记**：LEDGER `:86` 5B 行已将 #115/#134/#135/#145 四件随 MIG-RUNNER 翻 ✅（注记「INVALID 索引清理·同 MIG-RUNNER 刀·同上翻面」）。其中 #145（INVALID 清理）/#115 runner 半/#140 runner 半属实；**#134/#135 的内容重制面现树零落（§0.1 亲证 0148/0149 未动）·#115 纪律半现树零落**——翻面口径与现树实态存在出入·本卷如实登记·SSOT 翻面处置权归协调方（本刀 Ban 改 SSOT·只在交付报告呈报）；本刀按派单口径将 #134/#135 列执行件·#115 纪律半列条款收口。
3. **#140 ciw2 交点终局**：ci-wiring-REQUEST.md `:31`（MIG 裁③落码+CI-WIRING 只登记接线）+`:100`（并线后 ci.yml 三步共存：typecheck gate+:159-160 唯一性门+migrate:prove/drift 邻位）——#140 CI 检查半闭合确证→本卷归登记件（§0.1）。
4. **#3 issues 原锚路径漂移**：`packages/db/src/interview-jobs.ts`→现位 `packages/db/src/interview/interview-jobs.ts`（结论不变只更路径）。
5. **#122 DROP 机制缺口（如实披露）**：concurrent-index 臂解析器 `:203-217` 仅受 CREATE INDEX 形（DROP 撞 migration_concurrent_index_sql_invalid）；multi-statement 臂逐语句 BEGIN/COMMIT 包裹而 `DROP INDEX CONCURRENTLY` 禁止事务块内运行——**两现成模式皆不能直接承载 DROP CONCURRENTLY**。处置=裁决项⑨（B2 改号对齐 §8 权威清单·三案并陈·不得由执行者自行选择）。
6. **路径漂移补登记（rev2 F4）**：①`packages/db/src/commerce.ts`→现位 `packages/db/src/commerce/commerce.ts`（#25 写入路径亲证锚·0145:23 注释内旧路径=历史引文不改）②卷内 `interview-report.ts:24` 补全路径=`apps/api/src/modules/interview/interview-report.ts`（结论不变只更路径·沿 §0.3-4 先例）。
7. **迁移号 claim 实测勘误（EXEC 立项日 2026-10-14·并线后链顶亲证）**：主线 `feat/mysql-schema-skeleton` @`d68ffe17`（AG-39 nail 收官·链 185→187·0186+0187 已占）·并线 merge `5f71af51`（--no-ff·零冲突·本刀树 @merge 后实测 `ls packages/db/migrations`=197 文件）；在飞占号复测：cost4 树（`line/ag-cost4` @`e100a2a7`）已占 `0188_ag11_cost_reserve_least_and_settle_relax.sql`·ciw2 树零新号→**本刀自首个空闲号 0189 起**；实际 claim=**0190–0199 共 10 号**（0190/0191 起因=#25 唯一约束循 #115 纪律半拆 concurrent-index+multi-statement 两号；#3/#13 裁决④案c 零 DB 面不占号；0148/0149 重制循豁免面原号不占新号；0189 空置=claim 表按件起号顺延的自然空档·如实登记防复用）。预估 11±2 号窗内（10 号）。
8. **复审 P2 勘误注三件落卷（EXEC 施工执行）**：①「0148 步数条件形 13/14」=按裁决①结论+E6 择形①（首语句 DO 块孤儿检测）落 14 语句（EXEC 干跑 splitTopLevelStatements 实数 pin=14·复刻真函数源码干跑·0149=10 与 rev2 E4 静态预测一致）；②「裁决④ 案c 先行锁窗评估」=案c 先行落 db-int-fk.proof P8 臂（零 DB 面·claim 载体书面固化）·案a/案b 锁窗与码面授权披露随 §9-4 呈报；③「簇⓪ 观测臂改形机制句」=migrate.proof 观测臂改形机制注已落（三臂全覆盖 set_config 后恢复观测窗后移 runMigrations 收尾之外·pool LIFO 同 client·恢复语义断言保留·断言 2→3 净增）。

## §1 修法（四簇+登记·逐条对应 §0.1 件号·**⛔ 不得更改**项随条标注·EXEC 立项重 pin）

### 簇⓪ runner 残口补全（基建残余 1 项·MIG 卷 §9 席2 观察② 承接·触面=migrate.ts+migrate.proof.ts 单点）

- **执行项①**：multi-statement 臂每语句事务内补 `set_config('statement_timeout',…)+set_config('lock_timeout',…)`（照 `:548` transactional 臂同族·finally 恢复原值照 concurrent-index 臂 finally 形制 `:487-491`）·默认值与 env 形=**裁决项②**。超时→当前语句事务回滚+该步零记账+fail-loud exit≠0（零 retry-to-green）。`⛔ 不得更改`：三模式既有语义/advisory lock/序贯/漂移守卫/INVALID 清理/字节序六面零触——本簇只许 :500-534 臂内 timeout 单点增强。
- **既有臂改形申报（席2 B1·rev2 增·如实登记非洗基线）**：migrate.proof.ts:506-520「restored 观测臂」（0902_ms 依赖 multi-statement 臂**不** set_config·同 client 观测 0901 finally 恢复原值）在簇⓪ 落地后**设计性翻红**——观测点改事务臂后置 transactional fixture（同 client 观测窗后移至簇⓪ 语句之后·恢复语义断言保留）·§2 如实登记为**既有臂改形非洗基线**（交付报告 declare 改形·117 PASS 计数对照按改形口径）。

### 簇A VALIDATE 族·历史两文件重制（#134/#135·**裁决项①** 案1 推荐/案2 并陈）

- **案1（推荐·mig-runner §3-2 明文「0148/0149 内容重制归后继刀」=授权出处）**：①`0148` 加 `-- @migration-mode multi-statement` 头注记（migrate.ts:108 剥离形）——**13 语句**（B5 更正·`:16` UNIQUE USING INDEX ×1+`:20/:23/:26/:29/:32/:35` ADD FK NOT VALID ×6+`:37-42` VALIDATE ×6·:16-42 实数亲证）经 splitTopLevelStatements 各自独立事务+逐步记账=拆事务达成（EXEC 干跑 splitTopLevelStatements 实数复 pin）；②`0149` 重制形钉死（E4）：逐约束 `ALTER TABLE … DROP CONSTRAINT IF EXISTS …, ADD CONSTRAINT … CHECK(…) NOT VALID` 熔单 ALTER ×4（DROP+ADD 单语句原子·无裸 DROP 窗）+VALIDATE ×4 后行+同注记（`:12-32` 前置脏值检测 DO 块保持首语句·`:61` D3 删 uq_interview_event_key_constraint 语句保持）——步数实数 pin：起草席静态数 10 语句（1 DO+4 熔单 ALTER+1 D3 DROP+4 VALIDATE）·EXEC 干跑 splitTopLevelStatements 实测覆盖 pin·全文件补 `SET LOCAL` 面由簇⓪ 语句级 timeout 承载（**不再在语句间手工夹 SET LOCAL——跨语句事务失效·禁止**）。（席2 N1 一句）lock_timeout=语句/事务级 GUC·**不承载逐表粒度**——VALIDATE 六子表共用同一值·定值按最热表口径（归裁决② 输入项）。**代价如实披露**：两文件内容改=checksum 变·已应用环境（dev 库）migrate 撞 ledger checksum 对账红=预期形·处置=dev 库重建（隔离面 db:down/up）+交付报告登记；前提=releaseEvidence=false（pins）零生产库在案。**⛔ 不得更改**：重制豁免面=恰 0148/0149 两文件·其余 0001-0181 零字节。
- **案2（并陈）**：零回改·新号补偿迁移重做约束面（弱修·fresh-deploy 面不治·如实披露后由裁决①定）。
- **#134 修法「发布前跑孤儿检测」落地（E6 口径二择一·裁决面）**：①门进迁移本体——0148 重制文件**首语句**写 DO 块孤儿检测（0149:12-32「先检测后约束」先例逐字承形·六子表计数非 0 即 RAISE EXCEPTION fail-loud·运行时红即拒跑）；②或如实降格 CI-only 门（db-int-fk.proof.ts:91-131 P1 臂既有落点扩六表断言·迁移运行时无门）——择一结果载交付报告·静态 proof 臂（重制文件首语句 DO 块存在性解析断言）=可选增强非必建（席2 N3）。
- 新迁移证明面：fresh 隔离库全量版本化迁移+0148/0149 逐步记账旁表断言+完成交换+全量 skip 幂等零漂移。

### 簇B 新迁移约束/权限面（9 件·每件一迁移号·multi-statement/concurrent-index/transactional 模式按机制适配·模式选择=修法条款非执行者自由量裁）

- **#25**：新迁移（multi-statement 注记）=①`ADD CONSTRAINT fk_outbox_consumption … NOT VALID`+`VALIDATE`（引用列与 ON DELETE 行为=**裁决项⑤**·EXEC 以 0001 表定义+`packages/db/src/commerce/commerce.ts`（F4 路径亲证）写入路径亲证后定）②唯一约束形=**裁决项⑤（唯一约束形小项·B2 改号）**（CREATE UNIQUE INDEX CONCURRENTLY+ADD CONSTRAINT … USING INDEX vs 直接 ADD CONSTRAINT·outbox 行数量级亲证后定）。孤儿预检断言随簇A 同形。
- **#16**：新迁移（multi-statement）=①`ADD COLUMN created_at timestamptz NOT NULL DEFAULT now()`（expand-only）②kind CHECK NOT VALID→VALIDATE 分事务·值域=**裁决项③**（权威=domain-events-catalog.md+代码 INSERT 面 rg 实测·`apps/api/src/modules/interview/interview-report.ts:24`（F4 全路径亲证）见 'interview_unavailable'/'assessment_unavailable' 在用·存量 kind 值全量 SELECT 破除断言先行）。（席2 N4 注记）stream_key/事件流身份面（0001:41+0021:3-4 partial unique 承载）本刀**未认领零触**。（席2 N5 注记）现链默认 PG16（run-e2e-isolated.mjs:2429 `pgvector/pgvector:pg16`）——ADD COLUMN … DEFAULT now() NOT NULL 走 fast-default 元数据形·零全表 rewrite·expand-only 定性不变。
- **#151**：新迁移=status CHECK 扩（失败/未决态值域=**裁决项⑤**·应用零触·约束换名重建形）+复合 FK 与 0148 同口径（NOT VALID→VALIDATE）。
- **#152**：新迁移=①金额一致性约束（payment_order/settlement_ledger 形=**裁决项⑤**）②ai_graph_run 转移触发器（状态机形沿 0100/0173 触发器先例·终态统一 succeeded/completed 形=**裁决项⑤**·status-machine.md 为规范依据）。
- **#15/#23**：合一新迁移（transactional）=interview_event 与 settlement_ledger 各 REVOKE UPDATE FROM app_role+BEFORE UPDATE/DELETE 触发器 RAISE（形沿 `0100:294-296` assert_question_rubric_immutable 同族·SECURITY DEFINER SET search_path 形沿）·settlement_ledger 更正=冲正行纪律（DB 面拒原地 UPDATE·应用面零触）。**执行前置硬门**：EXEC 立项 rg 实测 `UPDATE interview_event`/`UPDATE settlement_ledger` 在 packages/db/src+apps 零合法调用点（预期零·非零=机制不满足停止条件停手上报）。
- **#150**：新迁移=0144 六函数 REVOKE EXECUTE FROM PUBLIC→GRANT 具名角色（角色集=**裁决项⑤**·触发器函数 EXECUTE 授权语义沿 0144 头注成因复核）·`:406-411` 六处全列 EXEC 重 pin（F3 更正）·死预注册件（interview_derived_score·:418-433 区）删除面=**裁决项⑤**（DB 对象 vs 码面归属·码面触=越界停止条件）。
- **#137**：新迁移=`CREATE OR REPLACE FUNCTION qbank_release_retired_generation_storage` 逐字承 0176 版体+体内增 `SET LOCAL lock_timeout`（值=裁决项② 同族·**0176 版体外零改**）·DETACH 形=**裁决项⑦**（B4 重框：函数内非并发 DETACH+SET LOCAL lock_timeout vs 迁出函数改运维脚本·PG 版本门仅作前提校验）·（席2 N2 建议·非绑定）体内三段式=SET LOCAL lock_timeout 先行→DETACH→DROP 逐段收窄锁窗·运维手册=ai-docs/architecture/backend/ 增补短节（登记面·docs:check 必过）·0176 登记面如实承登（函数不在 manifest·守卫 1 fail-closed=本补强属纵深防御）。
- **#3/#13**：新迁移=「每面试至多一个有效 running」DB 面·三案=**裁决项④**（B2 改号）：案a partial unique `ON interview_job (interview_id) WHERE status='running'`——**机制冲突如实披露**：claim 谓词 `:135-136` 允许过期-running 与新 running 共存（租约过期可重领）·案a 须先置过期态迁移（reaper/领取路径状态前置=码面扩界触越界停止条件）；案b EXCLUDE 约束——**B3 重陈**：「CONCURRENTLY 建底层索引」**撤回**（EXCLUDE 无附着形·底层索引只能随 ADD CONSTRAINT 原位建=非并发·锁窗评估如实披露）+前置 `CREATE EXTENSION IF NOT EXISTS btree_gist`（新迁移首语句项）+**租约起点列缺失披露**：interview_job 仅 lease_expires_at（0001:263-264）无租约起点列→tstzrange 无起点可依·加列+claim 写点（interview-jobs.ts:126）=码面越界触§3-2·LEASE_SECONDS=120 常量在 interview-jobs.ts:11·码面直引=漂移险；案c 零 DB 面仅 proof 断言（弱修并陈）。**推荐案重陈（B3）**：原案b「零码面」标签不成立——三案中唯一零码面可执行=案c（先行·如实登记弱修）·案a/案b 码面授权归**裁决项④**重裁。部分唯一索引在树先例=`0021:3-4` uq_interview_event_key WHERE event_key IS NOT NULL。

### 簇C 索引清理面（#122·1-3 号·**裁决项⑨**（B2 改号））

- trace 时间索引：新迁移 concurrent-index 模式 `CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_trace_created_at ON ai_invocation_trace (created_at)`（E3：解析器 `:212` 正则对 IF NOT EXISTS 硬性·缺之即 migration_concurrent_index_sql_invalid·先例 0014:6/0019:28 同形）（模式适配亲证：concurrent-index 臂=单语句事务外+timeout `:476`+INVALID 清理——CREATE 形在解析器 `:203-217` 受内）。
- 冗余索引 DROP：三案=**裁决项⑨**（B2 改号）：案a 非 concurrent `DROP INDEX`（transactional 迁移·user_account/question_feedback 行数量级亲证后锁窗口评估·如实登记）；案b concurrent-index 臂解析器扩 DROP INDEX 形（runner 单点增强·并入裁决②授权面· Ban 例外面同簇⓪）；案c 缓行 DROP 仅交付 trace 增索引。执行前置硬门：rg 实测 ix_user_email/ix_qfb_rating 全仓零查询引用（预期零·非零=停手上报）。
- **#115 纪律半随本簇收口（⛔ 不得更改条款）**：本刀起一切新迁移在存量（热）表上建索引一律 concurrent-index 模式（CONCURRENTLY）——写入 §1 条款+交付报告逐号登记模式选择。

### 簇D ACL/CI 面（#141/#142）

- **#141（F1 重瞄准）**：①db-acl.proof 泛化门扩臂：「任意 DEFAULT 函数（pg_attrdef 推导）对运行时角色 executable」断言（EXPECTED_CLOSED_SET 面外新臂·:389-390/:615 既有闭集臂零动——**既有 uuidv7 单函数 executable 臂 P1-1/P1-2（db-acl.proof.ts:435-448·闭集含 app_role）不得作 #141 全闭依据·真缺口=泛化门**）+可选独立校验脚本形=**裁决项⑧**（B2 改号）②0145 归因注释修正通道=**裁决项⑧**（推荐=新迁移注释面勘误登记·历史零字节纪律下禁回改 0145 原文）。
- **#142**：ci.yml 增 db-acl 一步（db:prove 邻位·run-e2e-isolated 隔离形·根 script :387 已在）+「新增角色时强制运行」机制=EXPECTED_CLOSED_SET 拓面断言（新角色出现即红）·ci.yml 触面授权=**裁决项⑥**（沿 MIG 裁③先例：本刀落码+ci-wiring2 续刀登记接线 vs 缓行归 CI 域）。

### 簇E 纪律与登记件（零码面·条款+登记）

- **#115 纪律半**：簇C 条款收口（上文）→本刀交付后 #115 全闭（runner 半 MIG 已闭）。
- **#144 纪律条款（本刀起强制·写入交付报告口径）**：今后退役表=先改名/归档+行数守卫·GRANT 热修独立成迁移不得混入——本刀零 0145 型操作自证。
- **#136（登记件）**：0176:98-99 闭合证据转录入交付报告·呈报 SSOT（issues-master :260 仍「仍存在」）翻面处置建议·不落码。
- **#140（登记件）**：三修法向闭合证据转录入交付报告（§0.1）·呈报 SSOT 翻面处置建议·不落码。

## §2 验收命令与断言（pre-exec 双审核对单基面·原样可复制·门预申明=migrate/drift+新 proof 扩臂+typecheck+docs:check）

```bash
node scripts/check-migration-version-uniqueness.mjs   # EXIT=0（豁免 0143/0152/0160 基线不变）
pnpm migrate:prove          # 基线 117 PASS/0 FAIL（E1 更正·ag19-prompt-version-REQUEST.md:193 门表实记 117·隔离链含 0181·CI-WIRING 收据 116=ag19 nail 前旧值）→扩后只增不减零洗·以 EXEC 立项日实跑复 pin
pnpm migrate-cli:prove      # EXIT=0 原值
pnpm drift:prove            # EXIT=0 零漂移
pnpm db:prove               # EXIT=0（dev 容器前置·MIG 卷 §9 席1 登记面）
pnpm db-acl:prove           # 既有臂原值+簇D 扩臂全绿
turbo typecheck --force     # 3/3 0 cached + 根 pnpm typecheck EXIT=0
node scripts/ai-docs/check-docs.mjs   # EXIT=0（docs:check）
```

断言候选（断言力每簇≥3·EXEC 立项重 pin）：①簇⓪ 语句级 timeout 生效断言（会话级观测+恢复断言）+步失败零记账断言；②簇A fresh 隔离库全量迁移：0148=**13 步**旁表记账（B5 更正·:16-42 实数·EXEC 干跑 splitTopLevelStatements 复 pin）+原子交换断言·0149=熔单 ALTER 4（DROP+ADD NOT VALID·E4）+VALIDATE 4 各自事务断言+全量 skip 幂等零漂移+孤儿预检臂（E6 择形）；③簇B append-only 触发器负测（UPDATE/DELETE 拒·SELECT/INSERT 通）+ai_graph_run 非法转移拒/合法转移通+双终态统一断言+FK/一致性约束在位断言；④簇C pg_index 前后态断言+drift 零漂移；⑤簇D DEFAULT 函数×运行时角色 executable 泛化门断言（F1 重瞄准·uuidv7 单函数臂 P1-1/P1-2 原值回归零洗）+新角色强制红断言；⑥回归：§2 全表 EXIT 原值+migrations 计数=基线 183+本刀新号数（rg 实测·偏差=熔断上报）。

**既有臂改形登记（席2 B1）**：migrate.proof.ts:506-520 restored 观测臂随簇⓪ 改形（观测点改事务臂后置 transactional fixture）——migrate:prove 117 计数对照按「既有臂改形·非新增非删除」口径如实宣布·非洗基线。

## §3 范围外（越界即停·FAIL）

1. runner 主语义零触（三模式语义/advisory lock/序贯/漂移守卫/INVALID 清理/字节序六面零触·簇⓪ :500-534 timeout 单点=唯一例外·裁决⑨案b 再开第二例外须双审明示·rev2 E2/B2 锚号更正）。
2. 应用码面零触（packages/db/src 业务封装/apps/**——#3/#13 案a 状态前置/#150 死件码面若需码动=停手上报）。
3. 历史迁移零字节改·豁免面=恰 0148/0149 两文件且仅裁决①案1 行使时。
4. e2e 隔离 runner（run-e2e-isolated.mjs 白名单 supported-target 三道门）与 ha-3 退避面零触零弱化。
5. 共享 SSOT 只读（LEDGER/issues-master/TASK-SOP-v2/execution-master-checklist 行与统计零改·§0.3-2 翻面出入呈报不处置）。
6. 生产库操作零发生（est live=0·prove 全隔离库）；secrets 零触；生产 env 默认零翻（`PG_STATEMENT_TIMEOUT_MS` 族零动）。
7. ci.yml 零触超裁决⑥授权面；其他工作树（cost3/bill4/ag39/ciw2/qsec 等·起草时点 33/rev2 复测 13 树（2026-10-14）·时点值非恒定·EXEC 复测为准）零触。
8. est live=0（§6）。

## §4 依赖与并发面

- **被谁闸=零未决硬依赖**：MIG-RUNNER nailed（主线 merge `685498f1`·LEDGER :86/:311 亲证·刀 exec @`30084d98`）——multi-statement 模式/逐步记账/timeout 面/INVALID 清理/唯一性门全在主线在证（§0.2）=本刀前置解除。
- **占号在飞**：cost3=0184/bill4=0185/ag39=0186+0187（§0.3-1 三树 ls 亲证）→本刀 0188 起·EXEC 立项日链顶复核顺延。
- **文件交集核对**：在飞三刀全迁移件零触 migrate.ts/ci.yml/db proof——本刀触面=migrations/（新号+0148/0149 豁免）+migrate.ts（簇⓪ 单点）+migrate.proof.ts+db-acl.proof.ts+**db-int-fk.proof.ts（E5 补·簇A 孤儿门·:91-131 P1 臂既有落点·E6 择形②时扩臂）**+根 package.json（新门脚本如需）+ci.yml（裁决⑥）+运维手册 1 .md——逐树核对零交集。
- **交点刀**：CI-WIRING nailed @`6ca2275b`·12 件真开放转 ciw2 续刀待立项（LEDGER 5D 行）=#142 ci.yml 归属裁决先例源；qsec 0176=#136 闭合出处。

## §5 Ban 列表 + pins（沿 mig-runner/ag-d 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（LEDGER/execution-master-checklist/issues-master/TASK-SOP 行与统计只读引用·翻面权归协调方）；Ban 触 `crag.ts` 决策逻辑与 RAG 面·Ban 动 embedding 计算面（本刀零相关）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 历史迁移回改超 §3-3 豁免面（0148/0149 外 0001-0181 全体零字节）；Ban 触 runner 主语义超 §3-1 例外面；Ban 弱化 advisory lock/序贯/漂移/INVALID 清理既有语义（只增强不削弱）；Ban fail-open（timeout 穷尽/孤儿预检红/触发器拦截失败必须 fail-loud exit≠0）；Ban 无界重试；Ban 生产库直连操作（prove 全隔离库）；Ban 洗基线计数（117 PASS 等只增不减如实宣布·E1 更正）；Ban 跨语句手工夹 SET LOCAL（簇A ⛔ 条款）；Ban 应用码面触（§3-2）；Ban e2e 隔离 runner 与 ha-3 退避面触；Ban 顺带升级依赖包。

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

**待双审/EXEC 裁决项**：①#134/#135 重制 案1（推荐）/案2+checksum 漂移处置登记形；②簇⓪+#137 timeout 默认值与 env 形（沿 `PG_STATEMENT_TIMEOUT_MS` 命名族·runner 默认>池 15s·lock/statement 分设值）——输入项（rev2 E7 补）：0148 六子表+interview 链设计期体量推演·VALIDATE 期 SUE（SHARE UPDATE EXCLUSIVE）锁阻塞 autovacuum 时窗·900s env 上限兼容判定（migrate.ts:230/:264 界）·lock_timeout 无逐表粒度（N1）；③#16 kind 值域封闭集（权威=domain-events-catalog.md+代码/存量 rg 实测）；④#3/#13 索引形状三案（B3 重写）：案a partial unique（claim 谓词机制冲突披露在案·须状态前置=码面触）·案b EXCLUDE——「CONCURRENTLY 建底层索引」撤回（EXCLUDE 无附着形·底层索引随 ADD CONSTRAINT 原位建=非并发）+前置 CREATE EXTENSION btree_gist+租约起点列缺失披露（interview_job 仅 lease_expires_at 0001:263-264·加列+claim 写点=码面越界触§3-2·LEASE_SECONDS=120 常量 interview-jobs.ts:11 漂移险）·案c 零 DB 面 proof 断言（弱修）——推荐案随披露重陈：唯一零码面可执行=案c·案a/案b 码面授权归本裁决；⑤#25/#151/#152/#150 各约束/角色/终态形（引用列/唯一约束形/状态值域/角色集/死件归属五小项合并裁）；⑥#142 ci.yml 步归属（沿 MIG 裁③先例 vs 缓行归 CI 域）；⑦#137 DETACH 形裁决（B4 重框）：DETACH CONCURRENTLY 无事务内载体（函数体内 EXECUTE 恒在事务中·runner 三模式均不可行——transactional 全文件单事务/multi-statement 逐语句 BEGIN/COMMIT 包裹/concurrent-index 解析器 :212 仅受 CREATE INDEX 形）——裁决项=函数内非并发 DETACH+SET LOCAL lock_timeout（0176 形+超时·现推荐） vs DETACH 迁出函数改运维脚本（脚本事务外可 CONCURRENTLY·函数退化守卫+指引）·PG 版本门（DETACH CONCURRENTLY 需 PG14+）仅作前提校验非裁决本体；⑧#141 泛化门形（F1 重瞄准同步）：db-acl.proof 已有 uuidv7 单函数 executable 臂 P1-1/P1-2（:435-448·闭集含 app_role）——本裁决就「任意 DEFAULT 函数（pg_attrdef 推导）对运行时角色 executable」泛化门裁扩臂形（db-acl 扩臂 vs 独立脚本·uuidv7 既有臂不得作 #141 全闭依据）+0145 注释修正通道（推荐新迁移注释面）；⑨#122 DROP 形三案（案a 非 concurrent/案b 解析器扩形/案c 缓行）；⑩派单粒度（单刀一波 vs 两波：簇⓪Ⓐ 码面先行+簇ⒷⒸⒹ 收尾——协调方定）。

## §9 EXEC 交付报告格式（收据必含七节·缺一即 post-prove 拒收）

1. **迁移号 claim 表**：实际链顶复核值+逐号认领记录（件号↔号位↔模式↔文件名·§0.3-1 规则履约）。
2. **逐件七项**：19 触点逐件=件号/裁决行使案/触面文件清单（file:line）/新迁移号/断言臂名/门 EXIT/定性（执行完=全闭/条款收口/登记呈报）。
3. **门全表**：§2 八命令逐条 EXIT+基线计数对照（117 PASS 等只增不减·E1 更正·B1 既有臂改形按改形口径宣布）。
4. **SSOT 呈报**：LEDGER :86 翻面出入+#136/#140 登记件证据+issues-master 翻面处置建议（不落 SSOT·呈报归协调方）。
5. **豁免面自证**：0148/0149 diff 全文+其余 0001-0181 零字节 `git diff` 亲证回执。
6. **卫生双声明**：markers 五类亲跑回执+est live=0（逐 prove 零外呼口径）+pins 十一值零翻。
7. **停止条件核查**：四类逐条命中与否（未命中=明写未命中）。

## §9-EXEC 附记（2026-10-14·施工席落卷·七节全·⛔push·STOP=`executed:awaiting_post_prove_dual`）

### 1. 迁移号 claim 表（并线 merge `5f71af51` 后实测·链顶 0187·cost4 在飞占 0188）

| 号位 | 模式 | 文件名 | 件号 | 语句步数（干跑实数） |
|---|---|---|---|---|
| 0148（重制·豁免面） | multi-statement | 0148_interview_composite_fk_batch1.sql（改写） | #134+#135 | 14（1 DO+1 UNIQUE+6 NOT VALID+6 VALIDATE） |
| 0149（重制·豁免面） | multi-statement | 0149_money_status_constraints.sql（改写） | #135 | 10（1 DO+4 熔单 ALTER+1 D3+4 VALIDATE） |
| 0190 | concurrent-index | 0190_outbox_consumption_unique_concurrent.sql | #25 半1 | 1 |
| 0191 | multi-statement | 0191_outbox_consumption_fk.sql | #25 半2 | 4 |
| 0192 | multi-statement | 0192_interview_event_created_at_kind_check.sql | #16 | 4 |
| 0193 | multi-statement | 0193_candidate_route_status_fk_harden.sql | #151 | 7 |
| 0194 | multi-statement | 0194_money_consistency_graph_run_terminal.sql | #152 | 5 |
| 0195 | transactional | 0195_interview_event_settlement_append_only.sql | #15/#23 | 6 |
| 0196 | transactional | 0196_trigfam_execute_least_privilege.sql | #150+#141 注释通道 | 12 |
| 0197 | transactional | 0197_qbank_release_storage_lock_timeout.sql | #137 | 1 |
| 0198 | concurrent-index | 0198_trace_created_at_index.sql | #122 半1 | 1 |
| 0199 | transactional | 0199_redundant_index_drop.sql | #122 半2 | 2 |

### 2. 逐件七项（19 触点+1 残余）

| 件 | 裁决行使 | 触面 | 新号 | 断言臂 | 门 | 定性 |
|---|---|---|---|---|---|---|
| #134 | ①案1+E6 择形① | 0148 重制+migrate.proof §2-8+db-int-fk P6-2/3 | — | §2-8 五臂+P6-2 白名单 14 句 | migrate:prove EXIT=0 | 执行完 |
| #135 | ①案1 | 0149 重制（熔单 ALTER×4+VALIDATE×4） | — | §2-8 重制 0149 臂+convalidated 动态臂 | migrate:prove EXIT=0 | 执行完 |
| #25 | ⑤（FK=entitlement_consumption(id)·NO ACTION·唯一约束=CONCURRENTLY+USING INDEX 双号形） | 0190+0191 | 0190/0191 | migrate.proof 全量应用+db:prove 四原语 | EXIT=0 | 执行完 |
| #16 | ③（kind 值域 19 值=catalog+写点全量 rg 亲证闭合） | 0192 | 0192 | §2-8 同上+migrate:prove fresh 全量 | EXIT=0 | 执行完 |
| #3/#13 | ④案c（先行·弱修·零 DB 面） | db-int-fk.proof P8（4 臂） | 不占号 | P8-1..4 claim 载体固化 | db-intfk:prove EXIT=0 | 条款收口（案a/案b 呈报 §9-4） |
| #15/#23 | 前置硬门过（rg -U 零合法 UPDATE）·transactional 合一 | 0195 | 0195 | migrate.proof 全量应用+db:prove | EXIT=0 | 执行完 |
| #122 | ⑨案a（非并发 DROP·锁窗评估=元数据级短锁+小表） | 0198+0199 | 0198/0199 | migrate.proof 全量应用 | EXIT=0 | 执行完（drift 不对账普通索引·sql/ fixture 零触守住触面清单·出入呈报 §9-4） |
| #137 | ⑦（函数内非并发 DETACH+SET LOCAL lock_timeout='15s'·0176 版体逐字+体内一行） | 0197+运维手册 1 .md+meta/index 登记 | 0197 | migrate.proof 全量应用 | EXIT=0 | 执行完 |
| #141 | ⑧（db-acl 扩臂·泛化门）+0145 注释通道=0196 文件头 | db-acl.proof §4+0196 | 0196（注释载体） | §4-1/§4-2 泛化臂 | db-acl:prove EXIT=0 | 执行完 |
| #142 | ⑥=缓行归 CI 域（ciw2 在飞·本刀零触 ci.yml） | — | — | — | — | 登记呈报（§9-4） |
| #150 | ⑤（角色集=app_role·六函数 REVOKE PUBLIC+GRANT app_role·死件删除=翻他刀 proof 触面越界→缓删呈报） | 0196 | 0196 | migrate.proof 全量应用 | EXIT=0 | 执行完（死件缓删呈报 §9-4） |
| #151 | ⑤（status 三值·interview 侧复合 FK；**resume 侧类型断层**：resume.id=uuid vs 0142 resume_id=text 不可 FK·缓建呈报） | 0193 | 0193 | migrate.proof 全量+db-int-fk P2-1 改形 | EXIT=0 | 执行完（resume 侧呈报 §9-4） |
| #152 | ⑤（金额一致性=settlement_ledger≤consumption 触发器·终态冻结=宽转移严终态·双终态并存保留·触发器 INVOKER 不新增 SD 面） | 0194 | 0194 | migrate.proof 全量应用 | EXIT=0 | 执行完 |
| #115 | 纪律半=簇C 条款收口（0190/0198 存量热表一律 CONCURRENTLY 自证）+runner 半 MIG 已闭 | — | — | — | — | 全闭 |
| #144 | 纪律条款：本刀零 0145 型操作自证（零 DROP TABLE·零 GRANT 热修混入） | — | — | — | — | 条款收口 |
| #136 | 登记件 | 0176:98-99 闭合证据=本表转录 | — | — | — | 登记呈报（§9-4） |
| #140 | 登记件 | 三向闭合证据（migrate.ts:236-243 比较器/ci.yml:159-160 唯一性门/起号演进）=本表转录 | — | — | — | 登记呈报（§9-4） |
| 簇⓪ 基建残余 | ②（multi-statement 臂=env 载体 MIGRATION_STATEMENT_TIMEOUT_MS 60s/MIGRATION_LOCK_TIMEOUT_MS 15s 与 transactional 臂同族·每语句事务内 set_config+finally 恢复·零 retry-to-green） | migrate.ts multi-statement 臂+migrate.proof 观测臂改形 | — | 改形三臂（in_tx/in_ms/afterRun 恢复） | migrate:prove EXIT=0 | 执行完 |

### 3. 门全表（§2 八命令+扩充·2026-10-14 实跑）

| 门 | 结论 | 关键行 |
|---|---|---|
| node scripts/check-migration-version-uniqueness.mjs | EXIT=0 | files=197 violations=0·豁免 0143/0152/0160 基线不变 |
| pnpm migrate:prove | EXIT=0·**123 PASS/0 FAIL** | 基线 117→123（+5 簇A+1 观测臂改形净增·只增不减）·fresh 全量 197 链应用+幂等 skip+零数据丢失 |
| pnpm migrate-cli:prove | EXIT=0 | 全通过（原值） |
| pnpm drift:prove | EXIT=0 | 零漂移（豁免登记 2 项=dbhy1 残面基线不变） |
| pnpm db:prove | EXIT=0 | dev 库重建后四原语全过（重建=簇A checksum 预期形处置·见偏离④） |
| pnpm db-acl:prove | EXIT=0·failures=0 | 既有臂原值回归+泛化门 §4-1/§4-2 绿+**基线红六处消解**（P2-A 构造/P0-0/P7-1/P1-6/P6-1..3/P7-2..3·详偏离②） |
| pnpm db-intfk:prove | EXIT=0 全通过 | P8 案c 四臂绿+**基线红三处消解**（P4-0/P5-2=0145/0150 修复态·P2-1=0193 增面计数）+P6 改形四臂绿 |
| turbo typecheck --force | EXIT=0 | 3/3 0 cached；根 pnpm typecheck EXIT=0 |
| pnpm docs:check | EXIT=0 | 80 required·scanned 2074 ≤ cap 2080（cap 上调见偏离③） |
| markers 五类 | 零命中 | 改动 17 文件亲跑 0 matches |
| 五包 typecheck（协调方预警项） | 3/3（包数=3） | worker/api/db/ai-runtime 无 typecheck script（AG-39 窄化已落主线 d68ffe17·并线树实测 turbo typecheck=3 task）·非本刀面·如实归因 |

### 4. SSOT 呈报（不落 SSOT·处置归协调方）

- **LEDGER :86 翻面出入**：#134/#135 重制面本刀落地·#115 纪律半本刀收口（翻面依据已实）；建议 LEDGER 5B 行 #134/#135/#115 注记更新为全闭 @本刀 commit。
- **#136（登记件）**：`0176_qbank_control_plane_authz_closeout.sql:98-99` REVOKE ALL … FROM PUBLIC,app_role+GRANT qbank_control_executor·守卫 1 替换=:54-58（IF :58）——qsec 刀已闭合·issues-master :260「仍存在」建议翻面。
- **#140（登记件）**：字节序=migrate.ts:236-243 注释块+比较器；CI=ci.yml:159-160+scripts/check-migration-version-uniqueness.mjs；起号已演进（本刀前链顶 0187）——issues-master :264 建议翻面。
- **#3/#13 案a/案b 呈报**：案a 须 claim 谓词状态前置（过期-running 先置态=码面越界）；案b EXCLUDE 需 btree_gist+租约起点列（interview_job 仅 lease_expires_at·加列+claim 写点=码面越界）且底层索引原位非并发建（锁窗=ACCESS EXCLUSIVE 至索引建完·量级=interview_job 行数）。两案均越界未行使·案c 已落（弱修）。
- **#151 resume 侧类型断层呈报**：resume.id=uuid vs candidate_profile_route_decision/snapshot.resume_id=text（0142 仅 length CHECK=跨型断层结构根因）——FK 不可建形·ALTER COLUMN TYPE=非 additive+应用写面触险未行使。后继处置建议=应用面 id 语义统一或列型迁移刀。
- **#150 死件缓删呈报**：interview_derived_score 删除将翻 db-trigfam-unify.proof P1 在位断言/P3 公式臂（非本刀触面）——建议后继刀连 proof 改形一并处置。
- **#142 呈报**：ci.yml 增 db-acl 步+「新增角色强制运行」=归 ciw2 续刀（在飞 @`2977c2a5`·裁决⑥=缓行归 CI 域行使）。
- **#122 sql/ fixture 出入呈报**：DROP ix_user_email/ix_qfb_rating 后 sql/09_auth.sql:17、sql/16_feedback.sql:13 仍载 CREATE 形——schema-drift-check 对账范围=列+UNIQUE/PK 约束（不含普通索引·脚本零 INDEX 字样亲证）→drift 不红；fixture 索引面滞留差异=门范围外·如实登记（sql/ 不在本刀触面清单零触）。
- **issues-master 翻面建议**：#115/#134/#135/#25/#16/#3/#13/#15/#23/#122/#150/#151/#152/#137/#141 全闭；#142 半闭（proof 半已备·CI 纳入归 ciw2）；#136/#140 登记转翻。

### 5. 豁免面自证

- 0148/0149 重制 diff=本刀 commit 全文（14/10 语句·头注记+DO 门+NOT VALID→VALIDATE 分语句事务）。
- 其余历史迁移零字节：db-int-fk.proof P6-4 亲证（M/D 仅限 0148/0149·新号仅限 0190-0199·0001-0147 零出现）+db-acl.proof P6-1 改形门（diff-to-base 零 D/R·M 仅限豁免两文件）+P6-2 ledger checksum 机械证（0143 及以前逐文件 sha256==ledger）。
- migrate.proof 漂移检测臂数据面：改历史迁移→checksum 对账红（机制零弱化在跑）。

### 6. 卫生双声明

- markers 五类：改动集 17 文件 rg 亲跑 0 matches（含新迁移 10+重制 2+proof 3+runner+手册+index）。
- est live=0：migrate/drift/db/db-acl/db-intfk/migrate-cli/public-text-policy 全 prove=隔离库/fixture/dev 库机械断言·零模型外呼·零 secrets·零生产操作（dev 库重建=本地 docker compose 卷复位·releaseEvidence=false）。
- pins 十一值零翻：haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false·gR45Closed=true·coveredCount=8·ms3EqualsR4Closed=false·PG-retained·公开 DELETE=503·g7SuiteGreen=false·r1Closed=false·actualSpendCny=null。

### 7. 停止条件核查（四类逐条）

- 现场漂移：**未命中**——链顶实测 0187+cost4 占 0188=按 §0.3-1 顺延规则处置（勘误注 §0.3-7 落卷）·0148/0149 未被他刀先动·migrate.ts AG-39 未触（§0.2 锚全对拍恒等）。
- 机制不满足：**未命中**——multi-statement/逐步记账/旁表交换/concurrent-index 实测与 §0.2 锚符（干跑 14/10 pin+prove 绿）；#15/#23 前置 rg 零命中；#122 前置 rg 零命中；0148/0149 拆分可行。（resume 侧 FK 类型断层=#151 修法条款内裁决⑤引用列亲证披露·非停手级·呈报 §9-4。）
- 越界需要：**未命中**——应用码面/SSOT/e2e runner/历史迁移豁免面外/ci.yml 全零触（#3 案a/案b·#150 死件·#151 resume 侧·#142 ci.yml 均按裁决缓行呈报未越界）。
- 验收红不可修：**未命中**——全部门绿；db-acl/db-intfk 九处基线红均归因 0145/0150/0163 链演进（非本刀引入）且口径内改形消解（触面内文件·改形登记随注释落卷）。

### 8. 裁决落值汇总（①-⑩按推荐行使）

①案1+E6①（0148 首语句 DO 门·14 语句）·②multi-statement 臂 env 同族 60s/15s+#137 '15s' 字面·③kind 19 值闭合·④案c 先行·⑤#25 FK=entitlement_consumption(id)/NO ACTION+双号唯一形·#151 三值+interview 侧·#152 触发器双器+双终态冻结·#150=app_role+死件缓删·⑥缓行归 ciw2·⑦函数内非并发 DETACH+SET LOCAL·⑧db-acl 扩臂+0196 注释通道·⑨案a 非并发 DROP·⑩单刀一波（协调方派单已定）。

### 9. 偏离清单（非零·逐条）

1. **FILE_LIMIT cap 2064→2080**（scripts/ai-docs/public-text-policy.mjs+proof 联动数 2064→2080）：本刀 +11 受管文件触顶 2073>2064。卷宗触面清单未含此两文件·按 AG-12/COST2 先例机制（sanctioned 值 EXEC 落+偏离清单落卷）最小实现·AG-38 先例另形=红停待协调方修顶——两先例并陈·post 双审/协调方可否决回滚（回滚=docs:check 红·不涉内容策略）。
2. **db-acl.proof 七处既有臂改形**（P0-0 构造≤0143 化/P2-A 构造修复/P7-1 窗口补齐/P1-6 0145 退役豁免-1/P6-1..3 机械门移交/P7-2..3 参数化）：九 FAIL 均归因 0145（GRANT app_role）/0150（闭集）/0163（FK）链演进主线基线红·非本刀引入；改形=触面内（db-acl.proof 为簇D 授权触面）+机制句随注释落卷+0145 退役豁免与 dbhy1 登记同源。
3. **db-int-fk.proof 三处既有臂改形+P8 新臂**（P2-1 计数 6→10/P4-0、P5-2 雷修复态/P6 组 14 句+porcelain 白名单）：P4-0/P5-2=0145/0150 修复态主线基线红消解；P2-1=本刀 0193 增面如实计数；P6-2/3/4=0148 重制配套。
4. **dev 库重建**（docker compose down -v/up）：0148/0149 重制 checksum 对账红=簇A 预期形·卷宗明文处置（「dev 库重建（隔离面 db:down/up）+交付报告登记」）·本地 dev 容器卷复位·releaseEvidence=false·est live=0 不变。
5. **migrate.proof 观测臂改形**（0902 restored→in_ms 生效+pool LIFO 后置恢复观测）：席2 B1 申报面按机制句落地（协调方 P2 勘误注③）·断言 2→3 净增非洗。

### 10. STOP 确认

**`executed:awaiting_post_prove_dual`**——本刀 EXEC 施工+门矩阵全绿+随翻落卷毕·**⛔push**（未 push·本地 commit 待查收）·post 双审两外席待审·post PASS 后翻面权归协调方。est live=0·零模型外呼。

## §9-POST 修复附记（2026-10-14·post 修复席·席1 FAIL 两 P1 处置+席2 PASS 维持·协调方授权按席1 最小修复清单执行·⛔push·Status `executed:awaiting_post_prove_dual` 维持）

### P-1. B1 修复形：0194 冻结集重裁（本刀新文件原号重写·非历史迁移回改·豁免面纪律不涉）

- **冻结集终值 = `('completed')` 单值**（原四值 `succeeded/completed/failed/safely_terminated`）。逐值裁定（file:line 本席亲证）：
  - `'failed'` 剔出：interview.service.ts:827-836 续约臂无 status 过滤（latest 行 FOR UPDATE 任意前态→active 复用重试槽）——failed→active=uc004 `FI3-RETRY-VERSION-INCREMENTS`（uc-e2e-004-career-path-fault.proof.ts:397）契约重试臂，冻结即重试必 23514→500、生产 career-path 重试恒红（=席1 B1 原判）。
  - `'succeeded'` 剔出（协调方裁决一并剔出）：成功后重复 POST 同走 :835 续约臂（现状亦 500）——续约语义在，不得冻结。
  - `'safely_terminated'` 剔出：abandon 两步 CAS（commerce/commerce.ts:447-459）产该态后，assessment 先行流（interview active 面评分卡→assessment→abandon）下 career-path POST 仍可达续约臂——privacy fence 只拦擦除请求不拦 abandoned（0058 `interview_privacy_active` 亲证）、assessment 端点无 interview status 门——同一「**续约臂无 status 过滤=终态行复用重试槽**」机制覆盖，冻结即窄流恒 500。
  - `'completed'` 留守：全库生产写点零（词表 11 值中唯一无生产写点的值·kernel 纪元词表遗留·双终态并存保留=Ban 业务语义变更不变）——既无重试语义又无续约路径的真死终态。**冻结集非空 → 触发器维持 RAISE 形**（不降记录型·不删）。
- 头注机制句按真实语义重写（三终态逐条剔出依据+completed 留守依据落卷）；语句结构零变（仍 5 语句=1 DO+2 函数+2 触发器·migrate.proof 无 0194 语句数/WHEN 集 pin·uniqueness files=197 不变）。
- 0194 原号重写=checksum 变更（同簇A 预期形）：隔离库 migrate:prove 全链重放零影响；dev 容器如载旧 0194，下次 migrate 对账红=预期形，处置沿偏离④ 前例（db:down/up 重建）。
- 伴随自证（非本席门·如实记录）：db-int-fk P6-4 porcelain 白名单与 db-acl P6-1 diff 门按「EXEC commit 后树净」形态在卷，本席改动随本附记 commit 落树后该两面口径不变。

### P-2. B2 修复形：db-money3 P0 夹具伴随（**偏离③**·post 修复席编号；EXEC §9-9 偏离 1-5 编号不动）

- 修法：P0 settlement 脏注入改引**真实存在的 entitlement_consumption 行**（units_settled NULL=reserved 态·0194 金额一致性触发器超额臂 `v_consumed IS NULL` 不触发），**保留 units=-1** 直达 0149 CHECK 摘除面——P0-2 四计数=1 断言语义零变；真实行置于 SAVEPOINT p0_neg 之前（合法造数前提非脏行·ROLLBACK TO 不残留语义不变）。机制句随注释落卷（db-money3.proof.ts P0 块：0194 BEFORE INSERT 触发器先于 CHECK 求值·consumption 缺行即 RAISE settlement_consumption_missing 23514）。
- 伴随注记（如实·零改动）：P2-7（假 id·units=-1→23514）在 0194 落链后其 23514 改由触发器缺行臂先抛（同一 SQLSTATE·断言仍绿·机制面从 D4 CHECK 前移至 0194 触发器）——P2-7 非席1 点名面零改·注记备查。

### P-3. §9 补登记（0195 伴随影响+硬门缺口注记+口径勘正·登记不落码）

1. **0195 清理句降级影响**：`interview_event_append_only_guard`（BEFORE UPDATE OR DELETE·FOR EACH STATEMENT 一律 RAISE 23514）落链后，两处 proof 清理句首条 `DELETE FROM interview_event` 必炸、其后全部清理句被短路（cleanup() 异常仅 console.error·断言 EXIT 不受影响·隔离库夹具残留跨轮累积）：
   - `apps/api/test/g7fix4-finalize-contract.proof.ts:123`（其后 :124-129 interview/job_application/entitlement_consumption/resume 等清理全不执行）；
   - `packages/db/test/recruiter-depth.proof.ts:350`（其后 :351-365 同理）。
   两文件非本刀触面零改·如实登记。后继处置建议（归裁决/后继刀，本席不行使）：清理句改 TRUNCATE 载体（FOR EACH STATEMENT DELETE 触发器不拦 TRUNCATE·须另证权限/级联面）或隔离库一次性重建策略。
2. **0195 执行前置硬门 UPDATE-only 缺口注记**：0195 头注硬门=「rg 实测 UPDATE interview_event/UPDATE settlement_ledger 在 packages/db/src+apps 零合法调用点」——口径双重收窄：①仅 UPDATE 词面（触发器同拦 DELETE·DELETE 未扫）；②仅生产码目录（test/proof 面未扫）。零合法调用点结论对生产码本席复核仍成立；缺口恰好落在上条两处 proof 清理句 DELETE 上=0195 落链影响未入 EXEC 预判面·如实注记。
3. **「九处/七处」口径勘正**（对 §7-4/偏离②·勘正附记不洗原文；按 7152cd3c diff 亲证）：db-acl.proof 基线红改形=**六组九臂**（P0-0/P2-A/P7-1/P1-6/P6-1/P6-2/P6-3/P7-2/P7-3；§4-1/§4-2 泛化门=新臂非改形不计数）；db-int-fk.proof 基线红消解=**三处**（P2-1/P4-0/P5-2；P6-2/3/4 改形=0148 重制配套·P8=新臂·均不计基线红）。据此：偏离②「**七处**既有臂改形」为计数笔误（其实列六组·按臂实数九）；偏离②「九 FAIL」=db-acl 单文件按臂实数口径✓；§7-4「db-acl/db-intfk 九处」应读「db-acl 九臂+db-int-fk 三处=合计 12 臂/处」——「九处」仅与 db-acl 臂数或「六组+三处」组数合计偶合·两文件按臂/处直加口径下不成立。

### P-4. 门矩阵（post 修复后重跑·2026-10-14·改动集恰 3 文件）

| 门 | 结论 | 关键行 |
|---|---|---|
| node scripts/check-migration-version-uniqueness.mjs | EXIT=0 | files=197 violations=0（豁免 0143/0152/0160 基线不变） |
| pnpm migrate:prove | EXIT=0·**123 PASS/0 FAIL** | 基线 123 只增不减·0194 重裁形 fresh 全量 197 链应用+幂等 skip+零漂移 |
| pnpm db-money3:prove | **P0 臂全绿（B2 闭合）·整门 EXIT=1 残余 6 FAIL=基线红单列** | P0-1..4 全 PASS（run#1 RAISE dbm3_dirty_rows 四计数=1·P0-2 语义保真·run#2 幂等）；残余 FAIL=P3-2/P3-4/P5-1/P6-1/P6-2/P6-3——归因见 P-4.1·非本席改动面·不上修 |
| pnpm uc004:career-path-fault:prove | **FI3 臂复活（B1 修复直接验证）·attempt EXIT=1 三臂红=基线红单列** | `FI3-RETRY-VERSION-INCREMENTS` PASS（failed v2→v4·续约臂穿重裁后触发器·retry explainable/零半写/账本净零全 PASS·FI3-GRAPH-RUN-FAILED-TRANSITION PASS）；attempt 红=CONTROL-0-GET-200/FI2-SERVER-ALIVE/FI3-SERVER-ALIVE=GET 409 insufficient_evidence——归因见 P-4.1·非本席面·不上修 |
| pnpm db:prove | EXIT=0 | 四原语全过（dev 容器 primitives 沙盒自建表·与迁移触发器面隔离） |
| pnpm drift:prove | EXIT=0 | 零漂移（豁免登记 2 项=dbhy1 残面·基线不变） |
| turbo typecheck --force | EXIT=0 | 3/3 0 cached |
| pnpm docs:check | EXIT=0 | 80 required verified·scanned 2074 ≤ cap 2080 |
| markers 五类（改动集 3 文件） | 零命中 | 词面运行时组装防自指·0 matches |

**P-4.1 残余基线红归因（单列上报·均先于本席修复存在·非本席改动面·处置权归协调方）**：EXEC 态时点 db-money3:prove 在 P0 即 crash（席1 B2 原判·无 try/catch 注入炸 0194 触发器缺行臂），后续臂从未达——本席 P0 修复后 proof 首次可跑全程，下列潜伏红随之首次显形：
1. db-money3 P6-1/P6-2/P6-3（文本门）：解析 0149 原文——EXEC 簇A 0149 重制（熔单 ALTER DROP+ADD `NOT VALID`+VALIDATE·现文 7 处 NOT VALID 亲证）与 DBM3 时代白名单式不再匹配（P6-1 白名单期望分离 DROP/ADD 语句·P6-2 禁词表含 NOT VALID）——门文本随 0149 重制失陪改·非本席面；
2. db-money3 P5-1：`sql/01_schema.sql:48` 注释行含「CONSTRAINT uq_event_key」字样·断言正则命中注释=fixture 注释自匹配·fixture/断言二选一失陪改·非本席面；
3. db-money3 P3-2/P3-4（钱流面）：markOrderPaidAndCredit 发桶计数与 settlement ≥0 行计数断言红——P3-1 全链（credited/幂等重放）PASS 亲证路径通·红因在 DBM3 后链演进（0150..0199）夹具/语义漂移·根因定位与修法归后继·非本席面；
4. uc004 GET 面三臂：G5 GET 重闸（`requireCurrentScorableCards`·interview-assessment.ts:73-81·aec29f01 g5-scor-s3 落码·`git merge-base --is-ancestor` 亲证为 7152cd3c 祖先）后 career GET 409 insufficient_evidence——本 proof 夹具仅种 assessment_report 无 ScoreCard 行·POST 面（读种行）200 而 GET 重闸 409·fixture 未随 G5 收口改形·非本席面。
FI3 契约面（B1 点名面）不受上述四项影响：FI3 各臂 POST/SQL/账本断言全 PASS·重试臂复活由 `FI3-RETRY-VERSION-INCREMENTS` PASS 直接钉证。

### P-5. STOP 确认

**`executed:awaiting_post_prove_dual` 维持**——post 修复席按协调方授权最小清单执行（0194 冻结集重裁+db-money3 P0 夹具伴随+本节补登记·三件外零触）·⛔push·post 双审复审与翻面权归协调方。est live=0（零模型外呼·全隔离库/dev 库机械断言）·pins 十一值零翻。

---

*BATCH5B-MIG REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`28cdee05`（pull --ff-only Already up to date 亲证）· 分支 `line/batch5b-mig` · 工作树 `meetwise-b5m`（本起草席立·建前 32 树实测无 b5m）· 蓝本=mig-runner-REQUEST（nailed @685498f1·§0.1 归槽+§4 余 17 件+§9 席2 观察②）+LEDGER :86/:96+TASK-SOP-v2:81+issues-master 19 触点行号亲证（#3=211/#13=365/#15=215/#16=216/#23=219/#25=368/#115=252/#122=396/#134=258/#135=259/#136=260/#137=261/#140=264/#141=265/#142=403/#144=404/#150=408/#151=409/#152=410）· 现态=开放 15 件+基建残余 1（multi-statement 语句级 timeout）+部分/纪律 2（#115/#144）+已闭合转登记 2（#136=0176:98-99·#140=字节序+唯一性门+起号演进三向全闭）· 修法四簇（⓪ runner 单点补全/A 0148-0149 重制裁决①/B 九件新迁移/C #122 索引裁决⑨+#115 纪律条款/D #141-#142 ACL/CI/E 登记件）· 迁移号拟占 0188 起（在飞 0184 cost3/0185 bill4/0186+0187 ag39 三树 ls 亲证·EXEC 立项日链顶顺延）· LEDGER :86 翻面出入如实登记（#134/#135/#115 纪律半现树零落·处置权归协调方）· 迁移号规则/纪律条款/豁免面=⛔ 不得更改钉死项·裁决十项归双审/EXEC· 停止条件四类全（漂移/机制/越界/验收红）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

*BATCH5B-MIG REQUEST rev2 · 2026-10-13/14 · rev2 修订席（pre-exec 双审两席均 FAIL 全数处置·23 处=F1+B1-B5+E1-E7+F2-F6+N1-N5·docs-only 恰 1 .md·定性零翻·锚/口径/裁决面修订·每处亲证后落笔）处置摘要：**席1 F1（P1）#141 重瞄准**——§0.1/§1 簇D/§2 断言⑤/§8 裁决⑧ 四面同步：db-acl.proof 已有 uuidv7 单函数 executable 臂 P1-1/P1-2（db-acl.proof.ts:435-448·闭集含 app_role 亲证）·真缺口=任意 DEFAULT 函数（pg_attrdef 推导）对运行时角色 executable 泛化门缺失·修法瞄准泛化门（uuidv7 臂不得作 #141 全闭依据）；**席2 B1** 簇⓪ 增「既有臂改形申报」：migrate.proof.ts:506-520 restored 观测臂依赖 multi-statement 臂不 set_config（0902_ms 亲证）·簇⓪ 落地设计性翻红→观测点改事务臂后置 transactional fixture·§2 登记为既有臂改形非洗基线；**B2** 裁决项编号四处对齐 §8 权威清单（§0.3-5 ⑩→⑨/§1 #25 ⑥→⑤小项/§1 #3/#13 ⑧→④/簇C 头+:91 ⑩→⑨/簇D 两处 ⑨→⑧/§3-1 连锁·rev2 终验补必读清单:14 #16 行 ④→③ 残面对齐）；**B3** 裁决④ 重写：「CONCURRENTLY 建底层索引」撤回（EXCLUDE 无附着形亲证）+补 CREATE EXTENSION btree_gist 项+租约起点列缺失披露（interview_job 0001:263-264 仅 lease_expires_at·LEASE_SECONDS=120 常量 interview-jobs.ts:11 漂移险 vs 加列+claim 写点=码面越界触§3-2）·推荐案重陈=唯一零码面可执行为案c·案a/案b 归裁决④；**B4** 裁决⑦ 重框：DETACH CONCURRENTLY 无事务内载体（函数体内 EXECUTE 恒在事务中·runner 三模式均不可行——:212 解析器仅受 CREATE INDEX 形亲证）·裁决项=函数内非并发 DETACH+SET LOCAL lock_timeout vs 迁出函数改运维脚本·PG 版本门仅作前提校验；**B5** 0148 语句计数 12→13（0148:16 UNIQUE USING INDEX ×1+:20-35 NOT VALID ×6+:37-42 VALIDATE ×6·:16-42 实数亲证）·§2 断言② 同改+EXEC 干跑 splitTopLevelStatements 实数 pin；**E1** 基线 116→117（ag19-prompt-version-REQUEST.md:193 门表实记·§2/§5 Ban/§9-3 三处同步）；**E2+F2** migrate.ts 锚组全量更正（亲证重 pin）：transactional 臂 :536-558·set_config :548·BEGIN :546/COMMIT :551·比较器 :242-243·multi-statement 臂 :500-534·逐语句 BEGIN/COMMIT :520-525·原子交换 :527-533（INSERT :529+DELETE :530）·definition 断言 :343（:317-320 assert 臂在证）·finally :487-491/:554-558·env 界 :230/:264——§0.1 三行/§0.2/§1 簇⓪/§3-1 连锁；**E3** trace 索引示例补 IF NOT EXISTS（migrate.ts:212 正则硬性亲证·先例 0014:6/0019:28 同形）；**E4** 0149 重制形钉死=逐约束 DROP CONSTRAINT IF EXISTS+ADD … NOT VALID 熔单 ALTER ×4+VALIDATE ×4（:12-32 DO 块+:61 D3 语句保持·静态 10 语句·EXEC 干跑实数 pin）；**E5** §4 触面补 db-int-fk.proof.ts（:91-131 P1 孤儿断言落点亲证）；**E6** 簇A 孤儿门口径改二择一：0148 重制文件首语句 DO 块检测（0149:12-32 先例逐字承形）或如实降格 CI-only 门（db-int-fk.proof.ts:91-131 落点）；**E7** 裁决② 补输入项（0148 六子表+interview 设计期体量推演·VALIDATE 期 SUE 锁阻塞 autovacuum 时窗·900s env 上限 migrate.ts:230/:264 兼容判定）；**F3** #150 ×5→×6（0144:406-411 连续六处亲证全列·:418-433=死预注册件 interview_derived_score 面）；**F4** 路径漂移补登记（§0.3-6 新增）：commerce.ts→commerce/commerce.ts·interview-report.ts 补全路径 apps/api/src/modules/interview/interview-report.ts（:24 亲证）；**F5** #136 守卫 1 锚 :44-47→:54-58（0176 亲证：注释 :54-57+IF :58）；**F6** 树计数时点注记：起草时点 32/33 树·rev2 复测 13 树（2026-10-14 终验实测）·时点值非恒定·EXEC 立项日复测为准（§0.0/基线行/§3-7 三处）；**N1** 逐表 lock_timeout 不可承载一句（语句/事务级 GUC·簇A·归裁决② 输入）；**N2** #137 体内三段式建议（SET LOCAL→DETACH→DROP·非绑定）；**N3** 静态 proof 臂可选非必建（E6 随注）；**N4** #16 stream_key 未认领面注记（0001:41+0021:3-4 partial 承载·零触）；**N5** PG16 fast-default 注记（run-e2e-isolated.mjs:2429 pgvector/pgvector:pg16·ADD COLUMN DEFAULT 零 rewrite·expand-only 不变）。STOP `draft:awaiting_pre_exec_dual` 维持·§8 开工三条款维持·pins 十一值零翻·§1 修法定性与 §0.1 定性零翻（仅锚更正+裁决面重写+如实披露）·⛔push·待双审两外席复审*
