# OUTBOX-PARTIAL-INDEX REQUEST（P2 批表 #24·P2·5B 刀——commerce_outbox relayed 行零清理持续膨胀+ix_outbox_pending 非部分索引·修复方案卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-19 落卷·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC 落码=届时 § 逐条落录·est live=0·Ban self-approve·alone≠dual·⛔push·翻面权归协调方）

**席位**：P2 批表下一刀起草席（协调方派单·标的 **#24=P2·5B**·侦察卡五点全数届树亲证见 §0）。
**基线**：`origin/feat/mysql-schema-skeleton` @ `7a4288fb1`（`git fetch` 后亲证主仓工作树同值恰等·fetch 无漂）。分支 `line/outbox-partial-index-draft`·工作树 `meetwise-iss24`（仓根同级·本席亲立·`-B` 于派单基线即分支建位机证）。
**立项出处（蓝本·不自建 SSOT 行——批表翻面权归协调方）**：①协调方派单侦察卡（relayed 零清理膨胀+非部分索引+runner 事务行为须亲证定修法形）；②`ai-docs/delivery/production-backlog.md` `:64` P2 节（规模化才咬人）+`:81` S7 行（outbox 真实结算 exactly-once 在案=本刀只清投递标记·不清账面）；③形制沿 `ag17-REQUEST.md`（**指定蓝本 ag18-sampling-temperature-REQUEST.md 届树零命中——`ls ai-docs/delivery/harness/` 319 卷枚举亲证·制式替代如实登记·同族同工序先例同构：STOP 三处/blob 锚表/门矩阵预申明/否决面**）。

## §0 现状锚（起草席亲读·base `7a4288fb1`·file:line/blob 逐条 rg/sed/Read/`git ls-files -s` 实测·**EXEC 立项照届时 tip 全量重 pin——漂移如实改锚·结论不变则只更行号**）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：建后 **6 树**实测（主仓/本席 iss24/agN2/cap80/hotfix/iss4）——零第二 outbox 树。
- `git branch -a | grep -i outbox` 恰本席 `line/outbox-partial-index-draft` 一条；`ls ai-docs/delivery/harness/ | grep -i outbox` EXIT=1——**零同名刀卷**。→ 停止条件未触发·可落卷。
- 在飞交叠：`git log --all --oneline -i --grep=outbox` 在飞修复刀 **0 笔**（命中系历史批次：0190/0191=#25 唯一约束/FK 面·b5m 迁移批·fence 刀 prose 引）；同基线在飞 iss4（autovacuum 参数域·ops 面）与本刀触面（db 迁移+migrate runner+worker retention+本卷）**零交集**。

### 0.1 blob 锚表（`git ls-files -s` 亲算·全 40 hex @`7a4288fb1`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0e61682603e9cd8fc1c1e8aaaf4965b79` | `:126-134` 表定义（status CHECK 闭集 pending/relayed）·**:135 `CREATE INDEX ix_outbox_pending ON commerce_outbox (owner_user_id, status);`（零 WHERE=非部分索引·判词第二半载体）**·`:150` `GRANT SELECT, INSERT, UPDATE … commerce_outbox … TO app_role`（**无 DELETE=归档 SECURITY DEFINER 形依据**）·`:152-162` ENABLE+FORCE RLS+p_owner 循环 |
| `packages/db/src/commerce/commerce.ts` | `99f6aba62194bc864ad38d28a8b99ca35151ee81` | `:192`/`:244` confirm 幂等闸（一消费恰一行 outbox）·`:225`/`:273` 两面同事务 INSERT（写入速率=确认流量）·`:635-637` settleOutbox 注释（「入账后才把 outbox 标 relayed·重跑安全…只补标 relayed」）·`:639` 函数·`:643` SELECT pending（FOR UPDATE SKIP LOCKED）·**:652 `UPDATE commerce_outbox SET status='relayed' WHERE id=$1`（判词第一半标 relayed 面·此后全仓零读者零删除**） |
| `apps/worker/src/commerce-reconcile.ts` | `5ed1b0ed801dd18a06e296a0084fbffbe140fec5` | `:20-22` owner 枚举=gatewayDispatchOwners('commerce')·`:114` commerceReconcileTick·`:138-140` runCommerceReconciler 缺省 30s——**worker 侧只有 reconcile+settle·零清扫臂=侦察卡第二点亲证** |
| `packages/db/src/migrate.ts` | `f472f356ba13679800e2e0e4df8d1c6c4007b811` | `:20` 三通道型·`:98-100` 事务控制词探测·**:212 allowlist 正则（谓词组仅 `WHERE <col> IS NULL` 单形·等值字面量必拒 `migration_concurrent_index_sql_invalid`）**·`:297-311` 定义比对（expectedPredicate 仅 IS NULL 形）·`:336-355` #145 heal·`:464-498` concurrent 臂（**裸会话+bounded 超时+账本独立事务=CONCURRENTLY 专用非事务通道生产就绪**）·`:500-551` multi-statement 臂（`:530-536` 逐语句 BEGIN/COMMIT）·`:558-574` transactional 臂（全包裹）·`:452` checksum 漂移禁令 |
| `packages/db/migrations/0190_outbox_consumption_unique_concurrent.sql` | `98d1ee12ac1099351acb42566232695554a376fe` | **#115 纪律原文：「本刀起一切新迁移在存量（热）表上建索引一律 CONCURRENTLY·commerce_outbox 为存量表」——本刀建索引通道约束** |
| `packages/db/migrations/0199_redundant_index_drop.sql` | `180470d82aeb7e146068f44697150f9214c0079f` | **案a 先例全文：非并发 `DROP INDEX IF EXISTS`·锁窗评估（元数据级不扫堆·毫秒级）·「runner 两现成模式均不能承载 DROP INDEX CONCURRENTLY」·「案b 解析器扩形须双审明示未行使」——本刀件③沿案a·件①即案b 的明示载体** |
| `packages/db/migrations/0177_usage_calibration_ag07_windowing.sql` | `e1a95296d1071e1c54a965b5322c020f0091e4bb` | `:150-172` 件⑥ `…_retention_purge(p_keep_days)` SECURITY DEFINER+`SET search_path=public, pg_temp`+fail-closed bounded RAISE+REVOKE PUBLIC/GRANT app_role——**归档函数全同构蓝本** |
| `apps/worker/src/usage-calibration-retention.ts` | `aa9a2a382b81fa837c340a098eb927e866cccd95` | env 三旋钮 bounded+非法 env 启动失败+缺省关+`runDrainLoop` 优雅排空+整拍不抛——**worker sweep 接线全同构蓝本** |
| `packages/db/src/model-op/usage-calibration.ts` | `706178640b258189e4712377c0786c40d33544c7` | `:124-132` TS 包装形（TS 侧守门+`SELECT fn($1) AS purged`）——件④同形 |
| `apps/worker/src/main.ts` | `944627576e13278a904eb4a444037f3d08f82765` | `:39` import·`:720` commerceLoop·`:741-743` retention loop resolve+条件启动·`:780` ready·`:827` stop 表——件⑤注册四触点同形 |
| `packages/db/migrations/0144_db_trigfam_unify.sql` | `29afdf465985cd7f09e96ead908ce671b2042776` | `:912-920` dispatch 枚举 commerce 臂 `WHERE o.status='pending'`（无 owner 前导列·现索引 (owner_user_id,status) 不可服役→膨胀直接拖慢每拍枚举=判词加重面） |
| `packages/db/sql/02_commerce.sql` | `8fe32532c07bdb6c37779afc5731f46b6f309cd4` | `:65` 同索引陈旧 fixture（无 0190 唯一索引/0191 FK=**fixture 不随迁移同步·0199 披露在案**——本刀零触面依据） |
| `packages/db/test/migrate.proof.ts` | `4fcb338e1a06f8f4d25ab6d1bc9257e4f2ed3c35` | runner 解析器/通道行为 proof 载体——件⑥扩臂面 |

### 0.2 判词复核定谳（起草席四读码面·**成立维持·未被近期刀顺带修复**）

1. **零清理（侦察卡第二点）**：`DELETE FROM commerce_outbox` 全仓 rg **0 命中**（5686 文件机证·宽化组合同查 0）；无归档表、无清理函数、worker 仅 reconcile 驱动——relayed 行只进不出。
2. **膨胀机制**：confirm 两面 `:225`/`:273` 同事务 INSERT（幂等闸 `:192`/`:244` 保证一消费恰一行）；settle `:652` 翻 relayed 后**全仓产品码零读 relayed**（rg 亲证·唯 proof 计数面）零删除→行数单调增=确认流量积分·无界；且 `:920` 枚举纯 pending 扫描随膨胀退化=每拍成本递增。
3. **非部分索引（侦察卡第一点）**：`:135` 亲读零 WHERE·零漂（`sql/02_commerce.sql:65` 同形镜像·陈旧 fixture 不属证伪面）。
4. **runner 事务行为亲证（修法形裁决核心·侦察卡触面预估主问）**：三通道——transactional 全包裹（`:562-569`）/multi-statement 逐语句 BEGIN/COMMIT（`:530-536`·**CONCURRENTLY 事务块内禁=结构不可行**）/concurrent-index 裸会话（`:464-498`·事务外语句+账本独立事务+`#145` heal+bounded 超时）→ **CONCURRENTLY 专用非事务通道生产就绪且在役（0190/0055/0147/0198/0207 先例）**；但 allowlist `:212` 谓词组仅受 IS NULL 单形——**本刀谓词 `status='pending'` 走 concurrent 通道须窄扩解析器·即 0199 案b 预留的「双审明示」入口·本卷即明示载体**。修法定形：建索引=件①窄扩+件② concurrent 通道（0190 `#115` 纪律恰锚本表·非并发建=§1.3-甲否决）；删旧索引=件③普通事务 DROP（0199 案a 先例·元数据级毫秒锁窗·与建索引堆扫描本质不同）。
5. **未被顺带覆盖**：0190/0191 系 #25 唯一约束/FK 收编面·0199 冗余索引 DROP 未触 `ix_outbox_pending`·零清理零部分化现状维持 → **选标有效·停止条件未触发**。

## §1 修法（五件·部分索引替换+SECURITY DEFINER 归档+worker sweep 接线·沿在役先例全同构·est live=0）

### 件① runner 窄扩（`migrate.ts` 唯一 runner 码面·additive）

- allowlist `:212` WHERE 组扩**等值单列字面量**形：`(?:\s+WHERE\s+<col>\s+IS\s+NULL)` 之外并列 `(?:\s+WHERE\s+<col>\s+=\s+'<lit>')`——`<lit>` 字符类禁 `'`/`;`/`\`/注释符序·单谓词零 AND/OR/IN/负向·「恰一语句不可藏 DDL/DML」铁律原样（`:210-211` 注释口径随注同延）。
- `ConcurrentIndexStatement` +`predicate` 字段；`concurrentIndexStateMatchesDefinition` `:297-311` 等值形 expectedPredicate=声明谓词归一化后与 `pg_get_expr(indpred)` 归一比对（型铸后缀如 `::text` 剥除规则入码·**恰值渲染由件⑥活库臂钉死·不凭记忆**）。
- IS NULL 既有形与两通道（transactional/multi-statement）结构零触·`#145` heal/超时/账本臂零触。

### 件② 迁移 0211（`@migration-mode concurrent-index`·恰 1 语句）

`CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_outbox_unsettled ON commerce_outbox (owner_user_id) WHERE status = 'pending';`——0190 `#115` 纪律在案故走 CONCURRENTLY（甲否决）；谓词即 pending→**索引体量=未入账存量（有界）·`:652` 翻 relayed 即出索引**；服役两面：settleOutbox `:643`（owner+pending 恰合）+dispatch 枚举 `:920`（纯 pending·部分谓词恰合·现索引不可服役之面就此收口）。

### 件③ 迁移 0212（transactional 默认·恰 4 语句·零事务控制词）

`DROP INDEX IF EXISTS ix_outbox_pending;`+`CREATE FUNCTION commerce_outbox_relayed_retention_purge(p_keep_days integer, p_batch_cap integer) RETURNS integer`+`REVOKE ALL … FROM PUBLIC`+`GRANT EXECUTE … TO app_role`——函数沿 0177 `:150-172` 全同构（SECURITY DEFINER+`SET search_path = public, pg_temp`+fail-closed bounded `7..365`/`1..10000` RAISE `commerce_outbox_retention_invalid_input`）；DELETE 谓词**钉死 `status='relayed' AND created_at < clock_timestamp() - make_interval(days => p_keep_days)`**·`WHERE id IN (SELECT id … LIMIT p_batch_cap)` 单语句单事务=短锁窗批间让路。旧索引去留=0199 案a 先例（非并发 DROP·元数据级不扫堆·锁窗毫秒级·卷内披露在案）。

### 件④ db TS 包装（`commerce.ts`+`index.ts` 导出·additive）

`purgeExpiredRelayedOutbox(c, keepDays, batchCap)` 沿 usage-calibration.ts `:124-132` 同形：TS 侧同域守门 fail-closed（安全整数+两 bounded 域）+`SELECT commerce_outbox_relayed_retention_purge($1,$2) AS purged`；`packages/db/src/index.ts:76` 导出区 additive 一名。

### 件⑤ worker sweep 接线（`apps/worker/src/commerce-outbox-retention.ts` 新模块+`main.ts` 四触点）

沿 usage-calibration-retention.ts **全同构**：`COMMERCE_OUTBOX_RETENTION_ENABLED` 缺省 **false**（生产数据删除·启用=显式后继运维决策·同 AG-COST2 先例）·`_DAYS` 缺省 **30** bounded 7..365·`_INTERVAL_MS` 缺省 3_600_000（按小时·churn 面高于观测表故高频于按天先例）bounded 60s..7d·`_BATCH` 缺省 500 bounded 1..10000·**一拍至多 40 批（2 万行/拍上界）删尽即止**；非法 env=启动失败绝不静默回退；整拍不抛失败下拍重试；`runDrainLoop` 优雅排空；main.ts 注册四触点（`:39`/`:741-743`/`:780`/`:827` 同形）。**保留期 30d 取值依据**：relayed 行零独立信息价值（settlement_ledger `uq_settlement_consumption`=结算 SSOT+`ON CONFLICT` exactly-once 在案·outbox 行仅投递标记·全仓零读者亲证）；30d=月度对账窗+reconciler 停摆一周 4 倍容错；协裁两案并陈 §3-1。

### §1.2 触面矩阵

估 **13 tracked**：migrate.ts 1+新迁移 2（0211/0212·版本词干全目录唯一·`ls | tail`=0210 亲证）+commerce.ts 1+db index.ts 1+worker 新模块 1+main.ts 1+proof 2（新 retention proof 1+migrate.proof.ts 扩臂 1）+package.json 2（worker+root 注册）+run-e2e-isolated.mjs 1+本卷 1——EXEC 届树重 pin。`packages/db/sql/` fixture 零触（0199 先例·`:65` 陈旧偏差如实登记非本刀修面）。

### §1.3 否决（六面）

- **甲=非并发普通建索引**（transactional 内裸 CREATE INDEX）：违 0190 `#115` 明文纪律且恰锚本表；锁窗随堆体量线性增长·与 0199 案a DROP 元数据操作本质不同·Ban。
- **乙=multi-statement 通道承载 CONCURRENTLY**：runner 逐语句 BEGIN/COMMIT 包裹（`:530-536` 亲证）·PG 禁事务块内 CONCURRENTLY·结构不可行·Ban。
- **丙=CASE/COALESCE 表达式索引伪造部分性**：NULL 键行仍入 btree=膨胀照旧·planner 须逐字表达式匹配才服役·语义不等价·Ban。
- **丁=改 relay 语义（settle 同事务即删）**：动 `:652` exactly-once 补标臂语义（`:635-637` 重跑安全注释在案）·剥夺运维调试窗·非 P2 最小修·Ban。
- **戊=分区表重造**：不可增量·checksum 铁律禁洗历史（`:452`）·blast radius 全表·Ban。
- **己=直改 0001_baseline/复用旧名 ix_outbox_pending**：前者 checksum 漂移禁令（`:452` 同源）·后者建新→删旧序中同名冲突且丢前后可辨性·Ban。

## §2 门矩阵（EXEC 立项届树亲跑·预申明十一门）

①**迁移唯一性**：0211/0212 词干全目录唯一+账本 contiguous prefix 门原样亲证；②**迁移结构机证**：0211 恰 1 语句+mode 注记+扩形后解析器接受亲证·0212 默认 transactional 零事务控制词（`containsTopLevelTransactionControl` 原样过）；③`commerce-outbox-retention.proof` 五臂全绿——(a)**只清 relayed∧超期**（fresh relayed+超期 pending+未超期 relayed 三行各造·purge 后恰删一）(b)**批上限断言**（造 cap+2 行·恰删 cap·余 2）(c)ACL 双面（`has_table_privilege('app_role','commerce_outbox','DELETE')`=false+`has_function_privilege(…purge…,'EXECUTE')`=true·0177 proof `:406` 同形）(d)索引形（pg_index 谓词恰等+indisvalid+0212 后旧索引 catalog 缺席）(e)越界天数/批数 fail-closed；④migrate.proof 扩臂+原臂原值（等值形收/尾随语句拒/谓词漂移拒/IS NULL 原形回归/multi-statement 下 CONCURRENTLY 仍拒）；⑤commerce:prove+commerce-reconcile prove 原值（settleOutbox/reconcile 链路零触回归）；⑥db-acl/db-acl2/dbhy1 原值；⑦`turbo typecheck --force` 全绿；⑧`turbo lint --force` 全绿·**帽 root 5242/db 1042/worker 959 不越**·零 disable 注释；⑨`docs:check` ≤2272（起草树实测 **2270**·+本卷=2271 余 1·EXEC 届值如实录）；⑩markers 改动集五类标记词+行首冲突标记 0 命中亲跑（词面运行时组装不落卷面）；⑪`git diff --stat` 恰 §1.2 tracked 数。**无模型调用不需出站两门——如实申明**（全门隔离 PG+本地静态·零模型外呼零 DNS 零 Key 值）。

## §3 裁决项（三件·两案并陈处标推荐）

1. **保留期 N**：**推荐 30 天**（件⑤取值依据三条）；协裁 7 天（纯运维窗）或 90 天（对齐 0177 观测先例）均 env 可调不阻塞·SQL 侧 bounded 7..365 不变。
2. **旧索引时序**：**推荐 0211/0212 紧邻同部署**（双索引写放大窗≈一次部署时长）；协裁观察期则 0212 拆后继刀·0211 可独立先行。
3. **解析器扩形域**：**推荐仅等值单列单谓词**（件①域）；负向/IN/复合谓词/多语句不扩留后继明示——0199 案b「须双审明示」口径即此。

## §5 Ban 面

0001-0210 历史迁移零字节；settleOutbox/reconcile/confirm 结算链路零语义触（exactly-once/幂等/RLS 原样）；`packages/db/sql/` fixture 零触；IS NULL 既有谓词形与 transactional/multi-statement 两通道结构零触（仅 additive 扩）；app_role 对 commerce_outbox 直 DELETE 零授予（清除只经 SECURITY DEFINER 到达·baseline `:150` insert/update-only 纪律零破坏）；SSOT 四卷+LEDGER+批表零触；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类：现场漂移超注记级/机制不满足/越界需要/验收红不可修——**起草期均未触发**（§0.0 三查零撞·§0.2-5 选标有效·蓝本缺席系制式替代已登记非现场漂移）。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC 落码·翻面权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（全门隔离 PG+本地静态·零模型外呼零 DNS零 Key 值·`actualSpendCny=null`）·env 三旋钮缺省关·零新增必填 env。
- **STOP=`draft:awaiting_pre_exec_dual`**（与 Status 头/§8 同值第三处）·起草落卷即停·⛔push。

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-19 落卷·基线 `7a4288fb1`·指定蓝本 ag18 缺席改沿 ag17 同构已登记·**runner 事务行为亲证=三通道在案（transactional 全包裹/multi-statement 逐语句 BEGIN-COMMIT/concurrent-index 裸会话+账本独立事务）·concurrent 通道谓词 allowlist IS NULL-only·等值字面量必拒**·修法形=窄扩解析器（0199 案b「双审明示」入口·本卷即载体）+0211 部分索引 CONCURRENTLY 建（0190 `#115` 纪律）+0212 旧索引普通 DROP（0199 案a 先例）+SECURITY DEFINER 归档函数（0177 全同构·app_role 无 DELETE 纪律零破坏）+worker retention 接线（usage-calibration-retention 全同构·缺省关）·est live=0·actualSpendCny=null·⛔push·翻面权归协调方·alone≠dual·Ban self-approve。
