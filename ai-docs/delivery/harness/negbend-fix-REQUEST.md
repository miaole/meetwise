# NEGBEND-FIX REQUEST — neg:bend 4/178 红臂修复刀（approve 解锁读路径=守卫缓存本地 evict 缺失·恰 1 产品文件一行修·negbend-fix 战役·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（起草 2026-10-15 · pre-exec 双审 **BOTH PASS 落卷**（席1 `agent_b1c540a6`+席2 `agent_68a4c9e9` 会签）·协调方明示 EXEC 授权（committed SHA 重钉=`cfc68287`）·rev3（席2 P2×2 折入·摘要见卷尾节）·**EXEC 落卷 @`1e686576`（§9 记录）·门矩阵十二门全绿·STOP 翻面（nail/行翻面归主会话批边界·alone≠dual·⛔push）**）

**席位**：negbend-fix 起草席（诊断+起草双责·协调方派·neg:all 全量收据 tip=`cf501273` 四红清单立靶）。
**基线**：`feat/mysql-schema-skeleton` @ `cf501273`（5C-API-HARDEN nail 收官 SSOT commit·docs:check 2081≤cap 2088 本树亲跑）· 分支 `line/negbend-fix`（建前 `git branch --list "line/negbend*"` 零命中·本起草席 `git worktree add ../meetwise-nbf -b line/negbend-fix feat/mysql-schema-skeleton` 亲立·HEAD 落 `cf501273` 亲证）· 工作树 `meetwise-nbf`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①neg:all 全量收据 `.tmp/receipts/neg-all-20261015.md`（主树 untracked 易失件·四红清单=其「红清单」节 `:28-:37`：实跑 551 臂 547 PASS/4 FAIL·neg:bend 178 臂 174 PASS/4 FAIL·neg:input NOT_REACHED fail-fast·总 EXIT=1）；②协调方派单 brief（2026-10-15·negbend-fix 战役·四臂+:463/:465/:473/:474+嫌疑面 0189/AUTHZ-34 指派）；③红证据日志 `/tmp/neg-all-run.log`（易失·FAIL 段 ≈行 1490-1510·收据已摘录四臂断言原文与观测值）；④结构范本 `ai-docs/delivery/harness/g7w-tail-death-REQUEST.md`（§0-§8 形制·**rev2 时序登记**：不在本分支基线树 `cf501273`（`git cat-file -e cf501273:<本路径>` exit=128 亲证）·存于主线方向 merge `90002a85`（line/g7w-tail-death @`b57cb2bb` --no-ff 并主线 @`cf501273`·blob `80f956a0`·`cf501273` 为其祖先=时序在基线后·非本 HEAD `67d9daeb` 祖先 is-ancestor 亲证）·worktree 共享对象库可解析）+ 修复刀 prove 形制 `ai-docs/delivery/harness/negresume-driver-fix-REQUEST.md`（恰 N run 零 retry·PASS 名单 diff 判据）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`cf501273`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 23 树实测（主仓+5cq/5eb/a34/ag38/ag39/ag39q/b2c1/b5m/bgp/ciw2/cost4/cost5/g7k/g7w/line-entpay/lintc/obsr/perfp/red5/s4b/uc003+本 nbf 树）——无第二 negbend 同名树。
- `git branch --list "line/negbend*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg negbend` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀唯一产品触面=`apps/api/src/modules/admin/admin.service.ts`（现 blob `6a9c62cf`·末次产品变更=`ab420f61` B271 片1·已在主线）。届时对各在飞分支执行 `git log <branch> -1 -- apps/api/src/modules/admin/admin.service.ts` 逐树复核，任一分支顶对该文件存在主线 `cf501273` 之后的新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`cf501273`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/test/neg-bend.proof.ts` | `f076c99b`（597 行） | **`:47` pendU/rejU 夹具直插（pendU=recruiter/pending·rejU=recruiter/rejected）·`:406` pend/adm 令牌·`:408-:418` pend 六臂 HTTP（:408 GET jobs/:410 POST jobs/:412 GET talent/:414 GET job/:416 GET candidates/:418 POST invite·全 403 臂·守卫缓存填充点·rev2 计数修正=六臂非五）·`:456-:460` admin approve+audit 留痕臂·`:461-:463` create 解锁臂（红① 断言行 `:463`）·`:464-:465` invite 恒定壳臂（红② 断言行 `:465`）·`:467-:471` reject+audit 留痕臂·`:472-:473` reject 分码臂（红③ 断言行 `:473`）·`:474` talent 分码臂（红④ 断言行）** |
| `apps/api/src/platform/recruiter.guard.ts` | `61bb1983`（29 行） | **`:23` `accountState()` 读（守卫唯一状态源）·`:24` role≠recruiter→`recruiter_required`·`:25` pending→`recruiter_pending_review`·`:26` 非 approved→`recruiter_rejected`**（三分码·`:12-:15` 注释自证 #118 缓存化+0189 广播依赖） |
| `apps/api/src/platform/principal.guard.ts` | `50b38bc5`（112 行） | **`:29` STATUS_TTL_MS=60_000·`:31` statusCache 进程内 Map·`:33` `evictPrincipalStatus` 导出·`:37` 收播处理器（`onPrincipalEvict('uid',…)`→delete）·`:45-:63` `accountState` 一查五列（`:50` SELECT status,pwd_epoch,role,approval_status,is_admin·`:61` 回填落缓存 exp=now+60s）** |
| `apps/api/src/platform/sse-notify.service.ts` | `93904f20`（327 行） | `:37` PRINCIPAL_EVICT_CHANNEL=`meetwise_principal_evict_v1`·`:236-:245` onNotification 双通道分派（`:238` evict 通道→`dispatchPrincipalEvict`）·**:284-:286 LISTEN 双通道·`:289-:297` establish 健康门=`interview_event_sse_notify` 触发器在场（`:294-:296` 缺席→`loseClient('trigger_missing')` 断连退避重连）** |
| `apps/api/src/modules/admin/admin.service.ts` | `6a9c62cf` | **`:81-:87` `recruiterDecision`（`:82-:83` `SELECT gateway_admin_recruiter_approval($1,$2)`·`:85` decided≠true→404·`:86` return decided:true）——本函数体内零 `evictPrincipalStatus` 调用（rg 亲证·本刀修法点）** |
| `apps/api/src/modules/profile/profile.service.ts` | `2dce92db` | **`:10` import `evictPrincipalStatus`·`:146`/`:206` 本地写路径即时 evict 先例两处（注释自证「本进程守卫缓存即时清·跨实例由 0189 触发器同事务 pg_notify 广播逐缓存」）**——本刀修法照此形 |
| `packages/db/migrations/0155_recruiter_approval_gate.sql` | `670a4a26` | **`:88-:108` `gateway_admin_recruiter_approval`（`:97-:99` UPDATE user_account.approval_status·`:101-:105` updated_rows>0 才写 admin_audit·`:106` RETURN updated_rows>0）**——audit 留痕 PASS ⟹ UPDATE 同函数内已生效（写路径无嫌疑的结构性证据） |
| `packages/db/migrations/0189_api_harden_shared_state.sql` | `a291b62e` | **`:144-:163` 件④ 守卫列广播触发器（`:160-:163` AFTER UPDATE OF status,pwd_epoch,role,approval_status,is_admin ON user_account→pg_notify(`meetwise_principal_evict_v1`)）**——approval_status 在列集内（`:161`） |
| `packages/db/migrations/0143_sse_push_notify.sql` | `4d4bf7c4` | `:33-:34` `interview_event_sse_notify` 触发器——**该触发器仅存于此迁移（packages/db/sql/05_interview_jobs.sql 零命中 rg 亲证）** |
| `apps/api/test/_neg-harness.ts` | `b03cb16b`（305 行） | **`:72` sql/01-22 全量重载（先于全部迁移——sql/09_auth.sql:3 `DROP TABLE IF EXISTS user_account CASCADE` 兜底防御性登记：DROP 时点负测库尚无 user_account 表·无可灭既存触发器·rev2）·`:75-:90` 迁移挑选单=0037/0038/0039/0046/0178/0172/0173/0167/0168/0169·`:85` 23_api_gateway.sql——`0143` 与 `0189` 均不在单（rg 亲证）** |
| `packages/db/sql/23_api_gateway.sql` | —（只读引用） | `:431-:432` approval 双函数 GRANT/REVOKE——harness `:85` 已加载⟹`app_gateway_role` 在负测库存在（0189 若入链其 GRANT 可执行·本刀零迁移故仅登记） |

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **简报嫌疑①（0189 NOINHERIT/零表 GRANT 重写）**：0189 的 NOINHERIT/零 GRANT 面仅涉**新增两表** platform_rl_bucket/platform_slot_lease（`a291b62e` `:47`「两表零 GRANT」·rg 亲证零涉 user_account）——对审批解锁链**零行为接触**；0189 对本链的真实关系=件④触发器（`:160-:163`）是审批态变更的**唯一跨请求失效通道**。嫌疑面修正登记≠简报方向推翻。
2. **简报嫌疑②（AUTHZ-34 系改动）**：**排除归因**——`line/authz-34-residual` 自分叉起零 commit 触及 recruiter.guard.ts/admin/（`git log line/authz-34-residual -- <两径>` 仅四条分叉前公共祖先亲证）；a34 tip `3284282e` 已是 HEAD 祖先（`git merge-base --is-ancestor` YES 亲证）——其面已并入主线且非本四臂回归窗。
3. **红④观测面**：收据 `:35-:37` 观测=403 达标但 body.error≠`recruiter_rejected`——与 §1.2 缓存滞留 pending 态→`:25` 码 `recruiter_pending_review` 的推定观测形一致（EXEC 改前基线 run 复核实测值·§2-1）。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**189**·头 `0189_api_harden_shared_state.sql`（与本链 SSOT `cf501273` 题面「链 189 头 0189」恒等）。
- 本刀修法=纯 API 层一行（§1-修法件①）·**预期零迁移零 DDL**。协调规则：EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**，认领号=对届时主线链顶 `ls packages/db/migrations` 亲数+在飞分支题面复核后取最小未占号顺延（零硬编码·沿 AG39 改占勘误/cost3 先例）·Ban 抢号 Ban 私占。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 行为变更点（回归窗钉死）

- **pre-nail 形（`358f3dee`·绿基线）**：`git show 358f3dee:apps/api/src/platform/recruiter.guard.ts` 亲证——RecruiterGuard 每请求直查 `SELECT role, approval_status FROM user_account WHERE id=$1`，**零缓存**→admin approve 落库后下一请求立即可读→四臂当时绿。
- **post-nail 形（`f31d56d1` API-HARDEN EXEC 件④ #118 三查并一·经 `809cd46e` nail merge 并主线）**：RecruiterGuard 改读 `accountState()` 守卫缓存（`61bb1983` `:23`）——60s TTL（`50b38bc5` `:29`/`:61`）·失效通道=①本进程写路径调 `evictPrincipalStatus`（`50b38bc5` `:33`）②跨进程/DB 函数内写走 0189 触发器 pg_notify 广播（`a291b62e` `:160-:163`→`93904f20` `:238` 收播逐缓存）。
- **缺口**：审批裁决的写路径在 DB 函数内完成（`6a9c62cf` `:82-:83` 直调 `gateway_admin_recruiter_approval`），**API 层无本地 evict 钩子**（`:81-:87` 全函数体 rg 零命中）——0189 迁移注释自证此设计（「审批态变更…应用层无钩子——以触发器补钩子」·`a291b62e` `:15-:16` 同义）。单进程正确性自此**全押广播通道**。

### 1.2 四臂根因链（每臂独立判定·观测值来源=收据 `:28-:37`）

**共因（前置链）**：负测环境内 pendU 的守卫缓存行在 `:408-:418` 六臂请求时以 `approval_status='pending'` 落缓存（`50b38bc5` `:61`·exp=now+60s）；neg:bend 全套件实测 ≈0.78s（收据 suite 表）≪ 60s——缓存行在不失效的前提下全程存活。

- **失效通道双缺口（共因的成因）**：①**生产者缺位**——0143/0189 均不在负测迁移挑选单（`b03cb16b` `:75-:90`）→审批 UPDATE **不发 pg_notify**（**rev2 措辞降级**：sql/09_auth.sql:3 DROP TABLE user_account CASCADE 非真实成因——harness 加载序 :72 sql/01-22 先于全部迁移·DROP 时点负测库尚无 user_account 表·无可灭既存触发器；被载全采面 11 件组（sql/01-22+迁移十件+23_api_gateway）触发器创建者仅 0046/02/03/11/22 且目标 job_application/interview/resume/invoice_request 零一触 user_account·全链 user_account 触发器唯一创建者=0189 `:159-:161`——生产者缺位真实成因=0189 不在挑选单·DROP 仅兜底防御性登记）；②**消费者缺位**——sse-notify establish 健康门要求 0143 触发器在场（`93904f20` `:289-:297`），负测库缺席→`trigger_missing` 断连退避循环→LISTEN 恒不稳定。双缺口叠加⟹负测环境内缓存对审批变更**不可失效**。生产全迁移链无此双缺口（api-harden:prove 26 臂含广播窗臂绿·`f31d56d1` 门矩阵承）。
- **臂① `:463`（approve 解锁 403）**：`:456-:460` decision 200+audit PASS（写路径成功的结构性证据=audit INSERT 被 `updated_rows>0` 门控·`670a4a26` `:101-:105`——audit 有行⟹approval_status 已 UPDATE 为 'approved'）→`:461` pend create→RecruiterGuard `:23` 读**滞留 'pending' 的缓存**→`:25` 抛 `recruiter_pending_review` 403→断言期望 200 判红。归因=**读路径缓存陈旧**，写路径零嫌疑。
- **臂② `:465`（invite 恒定壳 403·级联臂·随臂①）**：`:462` `JOB_PEND = unlocked.body?.id` 因臂① 403 响应体无 id→`undefined`→`:464` 实际打 `POST /recruiter/jobs/undefined/invite`→RecruiterGuard 同共因滞留缓存 403→`:465` 期望 200 恒定壳判红。**零独立根因·臂① 翻绿即随翻**（JOB_PEND 得值+缓存经件① 修法即时失效双通道恢复）。
- **臂③ `:473`（reject 分码错）**：`:467-:471` reject decision 200+audit PASS（同结构性证据·approval_status 已 UPDATE 为 'rejected'）→`:472` pend create→同滞留 'pending' 缓存→`:25` 抛 `recruiter_pending_review`→断言 `:473` 要求 status 403 **且** error==='recruiter_rejected'（`f076c99b` `:26` 映射）→status 层达标、码层判红。与收据观测「403 达标·分码不匹配」逐字一致。
- **臂④ `:474`（talent 分码错）**：同臂③ 共因——GET /recruiter/talent 过同一 RecruiterGuard→`recruiter_pending_review`≠`recruiter_rejected` 判红。零独立根因。
- **对照面（缓存机制本身在负测环境可工作的证据）**：rejU 直插 'rejected'（`f076c99b` `:47`）无先置 HTTP 填充缓存→`:421-:424` 首请求缓存 miss→DB 直读 'rejected'→`recruiter_rejected` 两臂绿（174 PASS 内）——读 SQL 路径/SET ROLE/三分码映射全链无嫌疑，**纯陈旧度问题**。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=API 写路径补本地 evict（§1-修法件①）**：与 `profile.service.ts:146`/`:206` 既有先例同形（本地写→本进程即时清·跨实例仍归 0189 广播）——单进程内确定性生效，不依赖 LISTEN 健康/触发器在场，负测与生产双环境同正。
- **候选乙（否决·Ban）=负测 harness 补载 0143+0189**：爆炸半径登记——0189 入链即全局/IP 限流桶 substrate 从进程内 Map 切 PG 共享表（`rate-limit.service.ts:108` 直调 `gateway_rl_bucket_take`·缺函数时降级本地的既有形），而 `platform_rl_bucket` 不在 sql/01-22 重载面→跨套件全进程桶残留（signup:global/login:global 全局键跨 boot 累积）→neg 六套件邻面新红风险不可界；且确定性仍受 LISTEN 健康门牵连。否决。
- **候选丙（否决·Ban）=断言改形**：四臂断言本体承载 b110 解锁/分码契约，改形即「为绿改断言」弱化（g7w/negresfix 两刀 Ban 沿承）——否决。

## §1-修法（权限链修复刀·预期恰 1 产品文件·零迁移零测试文件改动）

- **件①（唯一码改）**：`apps/api/src/modules/admin/admin.service.ts` `recruiterDecision`（现 `:81-:87`）——在 `:85` decided!==true 守卫**之后**、`return` 之前增一行 `evictPrincipalStatus(id);`（**rev2 单参形修正**：导出签名 `evictPrincipalStatus(uid: string)` 单参·`50b38bc5` :33 亲证·`profile.service.ts:146`/`:206` 两先例均单参调用——rev1 初拟两参形系误抄分发层收播 `('uid',…)` 形·两参形 EXEC 必撞 TS2554 且与 §8 立项「不得改件①」互锁成停止条件环；附一行注释照 `profile.service.ts:146` 形：本进程守卫缓存即时清·approve/reject 双向对称·跨实例由 0189 触发器同事务 pg_notify 广播逐缓存）+ 文件头 import 区增 `import { evictPrincipalStatus } from '../../platform/principal.guard';`（照 `profile.service.ts:10` 形）。**diff 预期=恰 1 文件净 +2 行（import+调用）±注释行·其余 tracked 树零改**。**rev3 调用点排序语义**：调用点位于 `asPrincipal` **COMMIT 之后**——`principal.ts:998` `await c.query('COMMIT')` 先于 await resolve（`packages/db/src/principal.ts:991-1002` 函数体 `const r = await fn(c)`→`COMMIT`→`return r` 逐行亲证·COMMIT 先于返回值出函数=调用侧 `await this.db.asPrincipal(…)` 回来时事务必已提交）；**Ban 移入回调内**（事务内 evict：清缓存时本事务未提交·并发读在其后起读经回填（`principal.guard.ts:61` miss→DB 直读**旧快照**→回填落缓存 exp=now+60s）竞态**复现 60s 陈旧窗**·而 TOCTOU 代次守卫（`principal.guard.ts:60-:61` genBefore 比对）只防「读在飞中遇 evict」·不防「evict 先于起读且先于 COMMIT」——旧态在 evict 后新代次下回填·守卫不可捕获）。
- **件②（prove·恰 1 run 零 retry-to-green）**：①`pnpm -C apps/api neg:bend`→期望 EXIT=0 **178/178**；②`pnpm -C apps/api neg:all`→期望六段全绿（auth→commerce→resume→interview→bend→input·`apps/api/package.json:74`·EXIT=0）。改前不改后对照：改前 neg:bend 红名单=收据四臂初判；**改前红名单复跑 EXEC 必做（rev2 由可选升必做）**——改前在本树实跑恰一次 neg:bend 取改前 PASS/FAIL 名单（门1「diff 恰 4 条」判据分母=本树改前实跑名单自证·不依赖主树 untracked 易失收据（出处① 件·本 nbf 树 ABSENT 亲证）·此 run 不计入 prove·零 retry 冲销纪律不变）。**rev3 指纹观测义务**：改前必做 run 须同步记录**四臂实测 `body.error` 指纹**（推定形 `recruiter_pending_review`·闭机制归因链=§8「机制不满足」停止条件的观测核对面）入收据——断言器仅打印 FAIL 名不带观测值（`_neg-harness.ts:42` 亲读）+AllExceptionsFilter 对 HttpException 静默透传零日志（`all-exceptions.filter.ts:19-21` 亲读）→观测法=树外零侵入直通 fetch 日志 preload 随该 run 顺载（纯直通不改请求/响应·不构成第二 run·不触任何树内文件·命令与输出原文入收据）。
- **件③（收据）**：`ai-docs/delivery/receipts/negbend-fix/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前改后 PASS 名单 diff+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·数字口径以实跑实测为准）

1. **neg:bend 178/178**：`pnpm -C apps/api neg:bend` EXIT=0·臂总数恰 178（**熔断=0 容差**：实测≠178 即触停止条件「现场漂移」）·改前改后 PASS 名单 diff（`sort|uniq -c` 协议·改前分母=件② 必做 run 本树名单·rev2）恰 4 条=`:463`/`:465`/`:473`/`:474` 翻绿·其余 174 条零弱化（diff 出第 5 条即停）。
2. **neg:all 全量复跑绿**：EXIT=0·六段全绿 551/551（实测值对收据 551 臂总数·段序 auth→commerce→resume→interview→bend→input）——**negative 邻面不回退**的承载门：邻五套件 PASS 名单 diff=∅（diff 非空即停·如实登记归因）。
3. **api-harden:prove 不回退**：`pnpm -C apps/api prove:api-harden` EXIT=0·26 臂维持（件① 不触广播机制面·本门证零扰动）。
4. **migrate:prove**：`pnpm migrate:prove` EXIT=0·链头实测=0189（届时链顶顺延如实记）。
5. **drift:prove 零漂移**：`pnpm drift:prove` EXIT=0。
6. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`files=189 violations=0`（files 数对届时链顶亲数·violations 恒 0）。
7. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径沿 SSOT 门矩阵）。
8. **lint 承登**：`pnpm turbo lint` 12 任务·**双红承登恒等既登基线**（api 1431>1421+root 5210>5200·`358f3dee` 题面钉值）——零第三红零新增 warning（第三红出现即停）。
9. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap 2088（现值 2081 本树亲跑·**>2088 红停上报**）。
10. **markers 五类零命中**：本刀改动集（1 .md 本卷+1 .ts 件①+收据目录）五类标记词 grep 零命中（词面不复抄卷内防自匹配·命令与回执入收据）。
11. **diff 面机检**：`git diff --numstat <base>` 恰 2 路径=`apps/api/src/modules/admin/admin.service.ts`+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）。
12. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（neg 面全离线·est live=0）。

## §3 范围外（边界清单·越界即 FAIL）

1. **断言本体零触**：`neg-bend.proof.ts` blob 前后全等（`f076c99b`·含四红臂在内的 597 行零字节改）——本刀零测试文件改动（候选丙否决·§1.3）。
2. **harness 零触**：`_neg-harness.ts` 迁移挑选单零增删（候选乙否决·§1.3 爆炸半径承卷）——0143/0189 是否入负测链归协调方另裁。
3. **同簇扩面零触**：AdminGuard/#36 缓存面、admin disable（`gateway_admin_disable`）路径的 is_admin 缓存对称性、jti 通道、sse-notify 健康门机制、0189 触发器本体——皆零改（同形缺口若 EXEC 期被发现→如实登记升级，Ban 就地顺手修）。
4. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——neg:bend 红清单行翻面权归协调方 nail。
5. **零迁移零 DDL**（§0.3）·零 CI/wrapper/runner 改·零依赖升级。

## §4 依赖

**①上游已满足**：#118 三查并一+0189 件④（`f31d56d1`/`809cd46e` 在链）=被修复机制本体；neg:all 收据（2026-10-15）=红靶确认。**②无同文件并发**：`admin.service.ts` 末次产品变更=`ab420f61`（已在主线）·在飞交叠复核规则=§0.0 第三条（EXEC 立项日必做）。**③迁移号**：§0.3 预期零。**④下游**：neg:all 六段全绿恢复=baseline 门矩阵回归前提；行翻面与 nail 排序归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§1-修法件② 恰 1 prove run·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 为绿改断言/改测试文件（§3-1·候选丙否决沿承）；Ban 触 `_neg-harness.ts`/harness 迁移链（§3-2·候选乙否决沿承）；Ban 同簇扩面（§3-3·disable/is_admin/jti/健康门/触发器本体零触）；Ban 迁移 Ban DDL（§0.3 预期零·需则停上报走认领规则）；Ban 改共享 SSOT（§3-4）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因四臂外新红（neg:all 邻面若现新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（neg 面全离线·EXEC 期 prove 亦零模型外呼·本卷 §2-12 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词不复抄卷内防自匹配——沿 g7w/authz-harden 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 四臂根因结论与 §5 Ban/pins 与 §1-修法件① 唯一码改面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.2 结论受疑（如 recruiter.guard 三分码分支改写/accountState 缓存机制变更/四臂断言行漂·neg:bend 臂总数≠178·§0.0 在飞分支对 `admin.service.ts` 有新增提交）→停·重 pin 回炉。
- **机制不满足**：件② prove run 四臂未全翻绿或观测码面与 §1.2 推定形不符（如非 `recruiter_pending_review` 形）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法件① 恰 1 文件面（需触守卫/harness/触发器/迁移/同簇面）→停·另刀或协调方裁决（§1.3 候选乙/丙否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻套件新红/lint 第三红/docs:check>2088）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*NEGBEND-FIX REQUEST · 2026-10-15 起草 · **`executed:awaiting_post_prove_dual` @`1e686576`（§9 EXEC 记录·门矩阵十二门全绿·post 双审待派·nail/行翻面归协调方）** · base `feat/mysql-schema-skeleton` @`cf501273` · 分支 `line/negbend-fix` · 工作树 `meetwise-nbf`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=neg:all 收据四红清单（.tmp/receipts/negbend 20261015·主树易失件）+协调方派单 brief · 四臂根因=approve/reject 写路径（DB 函数内 UPDATE+audit 门控亲证）成功而读路径守卫缓存（`f31d56d1` #118 三查并一·60s TTL）在负测环境不可失效（0143/0189 双缺位→广播生产者+消费者双缺·生产者缺位真实成因=0189 不在挑选单·sql/09:3 DROP 仅兜底防御性登记·rev2）→滞留 pending 态→臂① 解锁 403/臂② 级联 undefined invite/臂③④ 分码错为 `recruiter_pending_review`·AUTHZ-34 排除归因（§0.2-2）· 修法=候选甲恰 1 文件一行本地 evict（`profile.service.ts:146` 先例形·approve/reject 双向对称·跨实例 0189 广播零改）· 候选乙（harness 补链）候选丙（断言改形）否决在卷 · 门矩阵十二门（neg:bend 178/178+neg:all 551 全绿+api-harden:prove 26 臂+migrate/drift/uniqueness 189/typecheck/lint 承登双红/docs:check≤2088/markers/diff 面机检/卫生）· 迁移预期零（需则链顶顺延认领）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*

---

## rev2 处置摘要（审席1 FAIL 恰一处 P1+P2×4 全数处置·修订席每处亲证后落笔·STOP 维持）

1. **P1（唯一返工项）**：§1-修法件① 调用行 `evictPrincipalStatus('uid', id);` 两参形 → `evictPrincipalStatus(id);` 单参形（落点=§1-修法件①）。亲证：导出签名 `export function evictPrincipalStatus(uid: string): void` 单参（`50b38bc5` :33 sed 亲读）·`profile.service.ts:146`/`:206` 两先例均单参调用（`2dce92db` 亲读）·`recruiterDecision` 目标变量名=`id`（`6a9c62cf` :81 亲读）；rev1 两参形系误抄分发层收播形（principal.guard.ts:37 `onPrincipalEvict('uid',…)` 同形）——两参形 EXEC 必撞 TS2554·且与 §8 立项「不得改件①」互锁成停止条件环，故判唯一返工项。
2. **P2-1**：sql/09:3 DROP「灭既存触发器」因果措辞降级为「兜底防御性登记」（落点=§1.2 失效通道①+§0.1 表 `_neg-harness.ts` 行+卷尾 trailer·三处同步）。亲证：harness 加载序 :72 sql/01-22 先于全部迁移（`b03cb16b` 亲读）·sql/01-08 零 user_account 表创建者（rg 亲证）→DROP 时点负测库尚无 user_account 表·无可灭既存触发器；被载全采面 11 件组（sql/01-22+迁移 0037/0038/0039/0046/0178/0172/0173/0167/0168/0169+23_api_gateway）触发器创建者仅 0046/02/03/11/22 且目标 job_application/interview/resume/invoice_request（rg 逐件亲证零触 user_account）·全链 user_account 触发器唯一创建者=0189 `:159-:161`（0107/0112/0125/0129 四件触发器目标均 memory/privacy 系表）——生产者缺位真实成因=0189 不在挑选单·初拟「DROP 灭触发器」因果不成立。
3. **P2-2**：§0.1「五连 HTTP」→「六臂（:408/:410/:412/:414/:416/:418）」（落点=§0.1 表 neg-bend 行+§1.2 共因句「五连请求」→「六臂请求」·两处同步）。亲证：`f076c99b` :408-:418 逐行亲读恰 6 个 HTTP 调用（GET jobs/POST jobs/GET talent/GET job/GET candidates/POST invite·夹 6 断言行）——初拟「五连」系 GET job 与 GET candidates 两臂并写致计数漏 1。
4. **P2-3**：出处④ 结构范本引用补时序登记（落点=立项出处④）。亲证：`git cat-file -e cf501273:ai-docs/delivery/harness/g7w-tail-death-REQUEST.md` exit=128=不在本分支基线树；存于主线方向 merge `90002a85`（line/g7w-tail-death @`b57cb2bb` --no-ff 并主线 @`cf501273`·blob `80f956a0`）——`git merge-base --is-ancestor` 亲证 `cf501273` 为 `90002a85` 祖先=时序在基线后·`90002a85` 非本 HEAD `67d9daeb` 祖先·worktree 共享对象库可解析。
5. **P2-4**：§1-件② 改前红名单复跑由「可复跑一次」升「EXEC 必做」（落点=§1-修法件②+§2 门1 分母括注·两处同步）。亲证：`.tmp/receipts/neg-all-20261015.md` 本 nbf 树 ABSENT（ls 亲证）+主树 untracked（`git ls-files --error-unmatch` fail 亲证）——门1「diff 恰 4 条」判据分母须本树改前实跑名单自证·不依赖易失收据；此 run 不计入 prove·零 retry 冲销纪律不变。

**自检（rev2 commit 前亲跑）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（2082≤cap 2088·零新增受管文件）·markers 五类零新增命中（改动集恰 1 .md·五类词面 grep 亲跑全 EXIT=1·词面不复抄卷内防自匹配）·STOP=`draft:awaiting_pre_exec_dual` 维持·STOP 三条款/四类停止条件/pins 十一值/Ban 列表零翻转·docs-only 恰 1 .md·本 commit=rev2（⛔push）。

---

## rev3 处置摘要（pre-exec 双审 BOTH PASS 落卷后 EXEC 授权·席2 P2×2 折入·EXEC 席亲证后落笔·随并线树 1ce04516 生效）

**前置登记（EXEC 工序 1 并主线）**：`line/negbend-fix @cfc68287` `--no-ff` 并 `feat/mysql-schema-skeleton @55584f1f`（AG39-QUALITY nail 收官随翻·链 201 头 0201·cap 2104）→merge `1ce04516` 零冲突自动合（ort·43 文件·`admin.service.ts`/`neg-bend.proof.ts`/`recruiter.guard.ts`/`principal.guard.ts`/`_neg-harness.ts` 全数不在 diff 集=§0.1 锚零漂移）；§0.1 十锚 blob 逐条 `git hash-object` 复算与起草卷恒等（f076c99b/61bb1983/50b38bc5/6a9c62cf/2dce92db/b03cb16b/670a4a26/a291b62e/4d4bf7c4/93904f20）；§0.0 在飞交叠复核亲跑=全 branch 集对 `admin.service.ts` 逐一 `git log -1 -- <file>`+`merge-base --is-ancestor` 扫描·唯一命中 `line/b110-recruiter-gate @ee02bf4d` 经判定为**历史残枝非在飞**（其树版 blob `e6c102e9` 在 `cf501273` 历史可达亲证+日期 2026-10-10 早于基线 2026-10-15+`recruiterDecision` 函数体与现树逐字恒等·内容全被主线吸收·零碰撞面）→漂移停止条件未触。cap/链深/唯一性分母随并线翻新（docs:check cap 2088→**2104**·迁移链头 0189→**0201**·uniqueness files 189→**201**）——§2 相应门按届时值如实记·门语义零变。

1. **R3-1（席2 P2-A）**：件② 改前必做 run 增「四臂实测 `body.error == 'recruiter_pending_review'` 指纹记录入收据」义务（落点=§1-修法件②）。亲证：四臂断言 `f076c99b` `:463`/`:465`/`:473`/`:474` 判红仅打印 FAIL 名（`_neg-harness.ts:42` `A()` 实现亲读·不带观测值）+`all-exceptions.filter.ts:19-21` HttpException 分支静默透传（仅 500 落日志）→改前 run stdout **本身不携 `body.error`**·指纹须以树外直通观测件随 run 顺载取得——不入收据则 §8「机制不满足」停止条件（观测码面与 §1.2 推定形相符）无执行面·机制归因链不闭。
2. **R3-2（席2 P2-B）**：件① 补「调用点位于 asPrincipal COMMIT 之后（`principal.ts:998` 先于 await resolve）·Ban 移入回调内（事务内 evict 并发下经回填竞态复现 60s 陈旧窗·TOCTOU 守卫不可捕获）」排序语义句（落点=§1-修法件①）。亲证：`packages/db/src/principal.ts:991-1002` `asPrincipal` 函数体 `const r = await fn(c); await c.query('COMMIT'); return r;`——`:998` COMMIT 先于 `return r`·await 侧 resolve 必在提交后；回调内 evict 的失效窗=evict（代次++）先于 COMMIT·并发读者起读晚于 evict 时 `genBefore` 已取新代次·读得旧快照后在 `:61` 以新代次回填（gen 比对恒过）→60s 陈旧窗复现·`:60-:61` 代次守卫只覆盖「读在飞中遇 evict」一相。

**自检（rev3 commit 前亲跑）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（并线树 cap 2104 口径·实测值随 commit 记）·markers 五类改动集零命中（改动集恰 1 .md·五类词族沿 i6-239 门口径·词面不复抄卷内防自匹配）·pins 十一值零翻转·§1.2 四臂根因结论/§5 Ban/§8 停止条件零改·本 commit=rev3（docs-only 恰 1 .md·⛔push）。

---

## §9 EXEC 记录（EXEC 席落卷·2026-10-14·授权链=pre-exec 双审 BOTH PASS+协调方 EXEC 授权 @`cfc68287`·收据=件③ `ai-docs/delivery/receipts/negbend-fix/00-exec.md`+01/02/03 raw log·untracked §2-11 口径）

**工序与 commit 链**：①并主线 `git merge --no-ff feat/mysql-schema-skeleton @55584f1f`（零冲突 ort·43 文件）→`1ce04516`；②rev3 errata（席2 P2×2 折入·docs-only）→`4ac521ac`；③件① 恰 1 产品文件净 +2 行（import+`evictPrincipalStatus(id);` 调用行带注释·rev2 单参形·`profile.service.ts:146` 先例形·落点=:85 decided 守卫后 :86 return 前·调用点在 asPrincipal COMMIT 之后事务外）→`1e686576`；④本 §9 落卷=commit 3。

**改前必做 run（件② rev2 升必做条款·恰一次不计 prove）**：`4ac521ac` 树 EXIT=1·**174 PASS/4 FAIL**·红名单恰 `:463`/`:465`/`:473`/`:474` 四臂；**四臂实测 `body.error` 指纹全=`recruiter_pending_review`**（rev3 R3-1 义务·树外零侵入直通 fetch preload 随 run 顺载·臂② 级联形 `POST /recruiter/jobs/undefined/invite` 同码）——与 §1.2 推定形逐字相符·机制归因链闭面·「机制不满足」停止条件未触。

**门矩阵十二门终值（并线树基 `1ce04516`·commit 2=`1e686576` 状态实测·全绿）**：

| # | 门 | 实测 | EXIT |
|---|---|---|---|
| 1 | neg:bend | **178/178**·`✓ 全绿`·PASS 名单 diff（改前 174 分母本树自证）**恰 4 条**=四臂翻绿·零弱化零第 5 条 | 0 |
| 2 | neg:all 六段 | **686/686 全绿**（auth 90+commerce 90+resume 91+interview 102+bend 178+input **135 首达**）·邻四套件对基线 PASS 名单逐套 diff=∅ | 0 |
| 3 | api-harden:prove | PASS 31/FAIL 0·proof 文件自基线 `cf501273` 零字节变更=零扰动实质绿（口径更 26→31·见下） | 0 |
| 4 | migrate:prove | 全 PASS·链 **201 头 0201** | 0 |
| 5 | drift:prove | `✓ schema 无漂移`（豁免 2 项既登恒等） | 0 |
| 6 | uniqueness | `files=201 violations=0 exemptions=0143,0152,0160` | 0 |
| 7 | typecheck | `Tasks: 8 successful, 8 total`·0 cached | 0 |
| 8 | lint 承登 | **恰双红恒等既登**：api `1431>1421`+root `5212>5200`（0 errors·零第三红·与并线携入 AUTHZ 基线逐字恒等） | 1（承登） |
| 9 | docs:check | `scanned 2100`≤cap **2104** | 0 |
| 10 | markers 五类 | 改动集新增行零命中（i6-239 词族口径） | 1（零命中） |
| 11 | diff 面机检 | 恰 2 tracked 路径=件① .ts（2+/0-）+本卷 .md（rev3+§9）+收据目录 untracked | — |
| 12 | 卫生 | frozen-lockfile EXIT=0·`.env*` ABSENT 双向三查·`actualSpendCny=null`·est live=0 | 0 |

**口径如实更三处（§2「数字口径以实跑实测为准」条款内·非偏离）**：api-harden 26→**31**（proof 自卷面基线零字节变更·26 系沿 `f31d56d1` EXEC 期旧登记·`c31fd11e` 修复增臂后即 31）；neg:all 551→**686**（551=收据 fail-fast 五段分母·input 段本轮首达 135 臂全绿）；cap/链深/唯一性分母随并线 2088→**2104**/0189→**0201**/189→**201**（§2-4/9 括注「届时值如实记」预授权）。

**运行副效应登记**：typecheck 门运行曾翻动 `apps/web/tsconfig.tsbuildinfo`（tracked 增量构建状态件·1/1 行·非交付面）——`git checkout` 回滚基线以保门 11 恰 2 路径·零内容改动交付。

**停止条件四类全数未触**（现场漂移=§0.1 十锚 blob 复算零漂移+§0.0 在飞复核 b110 残枝判定；机制不满足=四臂指纹推定形相符+四臂全翻绿；越界需要=修法恒等件① 恰 1 文件面；验收红不可修=十二门全绿+承登双红恒等）·**§1.2 四臂根因结论/§5 Ban/pins 十一值/§8 三条款零改零翻转**。

**STOP · `executed:awaiting_post_prove_dual` · 码面/门矩阵 EXEC 侧已收口·post 双审两外席待派 · nail 与 neg:bend 红清单行翻面权归协调方/主会话批边界 · alone≠dual · ⛔push**
