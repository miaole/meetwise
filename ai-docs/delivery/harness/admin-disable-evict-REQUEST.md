# ADMIN-DISABLE-EVICT REQUEST — gateway_admin_disable 零 evict 同型缺陷修复刀（principal.guard:16 契约在链唯一违例闭合·恰 1 产品文件 +2 行 evict+neg 邻面增 1 判别臂·admin-disable-evict 战役·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-14 · **rev2 2026-10-14**=pre-exec 双审双 FAIL 同敛 P0「判别臂走 U() dev-header 支路→修前修后均 403 臂恒红」→判别传输面改 Bearer（本 commit·六项处置见卷尾 rev2 处置摘要）· 复审维持 awaiting · pre-exec 双审两外席待复审 · alone≠dual · Dual PASS ≠ 开工 · 本 commit 不预 claim 任何 post-commit EXIT · ⛔push）

**席位**：admin-disable-evict REQUEST 起草席（诊断由 negbend-fix post 席2 猎出·本席补全亲证+起草双责·协调方派）。
**基线**：`feat/mysql-schema-skeleton` @ `1af9803f`（LINT-CLEAN nail 收官 SSOT commit·docs:check 2099≤cap 2104 本树亲跑 EXIT=0）· 分支 `line/admin-disable-evict`（本起草席 `git worktree add ../meetwise-ade -b line/admin-disable-evict feat/mysql-schema-skeleton` 亲立·HEAD 落 `1af9803f` 亲证·建前 `git branch --list "line/admin-disable*"` 零命中）· 工作树 `meetwise-ade`（仓根同级）· **tip pin=1af9803f**（起草日 `git fetch` 后 `origin/feat/mysql-schema-skeleton` 与本地同值亲证·零更新零重 pin；rev2 日 fetch 实测主线已前进至 `3dc286a4`——本分支基线不追·届时基线适配归 §0.0 重 pin 清单）。

**立项出处**：①negbend-fix post 席2 同型病灶猎出（`gateway_admin_disable` 写 status='disabled' 零 evict·修形指派=照 negbend 修后 `admin.service.ts:87` 先例一行 evict）；②协调方派单 brief（2026-10-14·admin-disable-evict 战役·工作区/工序/门矩阵指派·漂移三条 §0.2 如实登记）；③negbend REQUEST rev3 R3-2 诊断件（post-COMMIT 语义+Ban 移入回调内先例·`packages/db/src/principal.ts:991-1002` 亲证承卷）；④**必读清单**（EXEC 席开工前全读·显式路径）：`ai-docs/delivery/harness/negbend-fix-REQUEST.md`（结构范本+同型修法先例卷·**时序登记**：不在本分支基线树 `1af9803f`（`git cat-file -e 1af9803f:<该路径>` EXIT=128 亲证）·存于 `line/negbend-fix` @`c046262d`（worktree `meetwise-nbf`·共享对象库可解析））+ `ai-docs/delivery/harness/negresume-driver-fix-REQUEST.md`（修复刀 prove 形制·恰 N run 零 retry）+ `ai-docs/delivery/harness/TASK-SOP-v2.md` + 仓根 `AGENTS.md` + `apps/api/test/_neg-harness.ts`（负测机械）+ `apps/api/src/platform/principal.guard.ts`（契约本体）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`1af9803f`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠预扫（2026-10-14 亲扫）

- `git worktree list` 建后 24 树实测（主仓+既有 22 树+本 ade 树）——无第二 admin-disable 同名树；`git branch --list "line/admin-disable*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/` 建前 `admin-disable` 零命中→落卷后唯一同名卷=本卷。
- **本刀双产品触面在飞交叠全量预扫**（逐 branch `git log -1 -- <两径>` 取末触 commit + `git merge-base --is-ancestor <branch> HEAD` 判吸收态·2026-10-14 亲跑）：branch 集末触非基线祖者仅 **`line/negbend-fix` @`1e686576`（非 HEAD 祖先·meetwise-nbf 树·STOP=`executed:awaiting_post_prove_dual`）**——对 `admin.service.ts` 有主线 `1af9803f` 之后新增提交（recruiterDecision evict·negbend 战役交付面）；对 `neg-bend.proof.ts` 零触（negbend §3-1 测试文件零触·nbf 树 597 行与本基线全等亲证）。其余 branch 全为基线祖先（已吸收）或历史残枝（`a322d627`/`ab420f61`/`abf80ce6`/`ee02bf4d` 尾随者）。**同文件交叠处置=§4-2（managed 非停止·merge 序无关论证在卷）**；EXEC 立项日对本表重扫·出现 negbend 之外新增 novel 触者→触停止条件「现场漂移」停手上报。
- **EXEC 立项重 pin 清单（rev2 点名·三项必做·漏做即未完成立项）**：①**nbf tip 引用更新为届时值**——本卷所钉 `line/negbend-fix` @`c046262d`/`1e686576` 系起草日值·立项日照 `line/negbend-fix` 届时 tip 亲取更新（波及 §0.1 跨线锚行/§4-2/必读清单时序登记）；②**§2 门 8 root lint 判据随届时主线 sanction 值适配**——rev2 日 fetch 实测主线 tip `3dc286a4` sanction 已 root **5224**/web **601**/api 1421（uc003-i18n nail `68ffcb58` 落值承登）·本卷 §2-8 所钉 root 5202 系基线 `1af9803f` 时值·立项日以届时 SSOT/LEDGER sanction 值照抄适配；③**门 9 docs:check 预期值随届时基线 +1**——rev2 日实测主线 cap 已 2104→**2112**（`8b577e8b` 落值）·主线现值 2106·本卷 §2-9 所钉 2100/2104 系基线时值·立项日预期值=届时基线现值 +1（cap 与现值均以届时实测为准）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`1af9803f`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/src/modules/admin/admin.service.ts` | `6a9c62cf`（129 行） | **`:60-:66` `disable`（`:62-:63` `asPrincipal`→`SELECT gateway_admin_disable($1)`·`:64` disabled≠true→404 守卫·`:65` return disabled:true）——函数体及全文件零 `evictPrincipalStatus` 调用（rg 亲证·本刀件① 修法点=`:64` 与 `:65` 之间）** |
| `apps/api/src/modules/admin/admin.controller.ts` | `6ee92ca7`（83 行） | `:32-:35` `@Post('users/:id/disable')`+`@HttpCode(OK)`→`admin.disable(id, req.principal)`（disable 唯一 HTTP 入口·rg 亲证） |
| `apps/api/src/platform/principal.guard.ts` | `50b38bc5`（112 行） | **`:16` 契约行（「本进程写路径同步 evictPrincipalStatus 即时……60s TTL 仅作 LISTEN 断连/未建立时的兜底上界」）·`:29` STATUS_TTL_MS=60_000·`:31` statusCache 进程内 Map·`:33` `evictPrincipalStatus(uid: string)` 单参导出·`:48` genBefore·`:61` 回填 `exp: now+STATUS_TTL_MS`**·**rev2 判别臂锚**：`:66-:102` Bearer 支路（`:67-:68` authSecretCandidates 逐请求读 env·`:87-:89` 候选钥验签·`:93` `accountState` 读=cache miss→DB 读→回填点·`:94` `!st.active`→401 `account_inactive`·`:95` 代次检查·`:98` `tok.jti &&` 短路=无 jti 跳过 isSessionActive）·`:104-:108` dev-header 支路（绕过验签/status/代次直通 `req.principal`——**故不可用作判别传输面**） |
| `apps/api/src/platform/admin.guard.ts` | `2752e6a4`（22 行） | `:18-:19` `accountState().isAdmin!==true→403 admin_required`（`:18` accountState 读·`:19` isAdmin 判——AdminGuard 与 principal guard 同读一份守卫缓存=#118 三查并一） |
| `apps/api/test/neg-bend.proof.ts` | `f076c99b`（597 行·**178 臂**） | **`:3` import 行已含 `tokenFor`（rev2 判别臂零新增 import）·`:43-:45` b110 种子注释+`:46-:48` 种子 INSERT（pendU/rejU/freshC 直插·rev2 行号勘误：原钉 :44-:46/:47-:48 亲证各偏一行）·`:157`/`:207`/`:213` disable 鉴权臂（401/403/403）·`:202` candidate GET /admin/users→403 同面先例·`:216` §5 块头·`:218` `const adm`·`:220-:221` admin disable ghost→404 臂·`:222` 泄漏防线注释·`:590` 条数统计注释（「共 178 条」）·`:592` 分段明细（「§5 admin 特权边界+返回体泄漏 6」）——「disable→后续请求即时 401」臂零存在（rg 亲证·本刀件② 增臂点）** |
| `apps/api/test/_neg-harness.ts` | `b03cb16b`（305 行） | `:31-:36` req/send/U() 三 helper（U=x-user-id dev 头）·**:72 sql/01-22 全量重载·`:75-:90` 迁移挑选单（0037/0038/0039/0046/0178/0172/0173/0167/0168/0169+`23_api_gateway.sql`）——`0143` 与 `0189` 均不在单（rg 亲证）**·`:242-:244` userA/userB/adminU/recU 种子·**rev2 Bearer 面锚**：`:16` `AUTH_SECRET='test-secret-key'` 导出+`:52` boot() env 注入（与 guard `:67` 逐请求读同值=验签恒等）·`:25-:26` `tokenFor(uid, opts)` 导出（缺省 `pwdEpoch ?? 0`·不传 session=无 jti） |
| `packages/domain/src/auth.ts` | `697da7dc`（109 行） | **`:69` `signToken(userId, secret, ttlSec, nowSec, pwdEpoch = 0, session?: { jti })`**——tokenFor 不传第 6 参=签发**无 jti**→guard `:98` 跳过 isSessionActive（rev2 判别臂 Bearer 面锚） |
| `packages/db/sql/09_auth.sql` | `9082403f`（28 行） | **`:14` `pwd_epoch int NOT NULL DEFAULT 0`**——=tokenFor 缺省 pe 0 匹配（guard `:95` 代次检查过·rev2 锚） |
| `packages/db/src/principal.ts` | `c31cbac0`（2123 行） | **`:991-:1002` `asPrincipal`（BEGIN→SET LOCAL ROLE→set_config→`fn(c)`→`:998` `COMMIT`→`return r`——COMMIT 先于返回值出函数=调用侧 await resolve 必在提交后）** |
| `packages/db/migrations/0041_api_runtime_least_privilege.sql` | `2e981a7c`（161 行） | **`:107-:120` `gateway_admin_disable`（`:112` PERFORM `gateway_require_active_admin`·`:113` `UPDATE user_account SET status='disabled'`·`:114-:117` audit INSERT 被 updated_rows>0 门控·`:118` RETURN updated_rows>0）** |
| `packages/db/sql/23_api_gateway.sql` | `67e99f04`（766 行） | `:182-:199` 镜像同函数（**`:192` UPDATE status='disabled'**·`:437` REVOKE·`:444` GRANT） |
| `packages/db/migrations/0189_api_harden_shared_state.sql` | `a291b62e`（163 行） | **`:152` `pg_notify('meetwise_principal_evict_v1',…)`·`:159-:163` 触发器 AFTER UPDATE OF `status`,pwd_epoch,role,approval_status,is_admin ON user_account（status 在列集内=disable UPDATE 必触发同事务广播）** |
| `apps/api/src/modules/profile/profile.service.ts` | `2dce92db`（216 行） | `:10` import·`:146`/`:206` 本地写路径即时 evict 先例两处（注释自证跨实例归 0189 广播·LISTEN 断连退回 ≤60s TTL 兜底）——件① 注释形照此 |
| （跨线锚）`line/negbend-fix` 树 `apps/api/src/modules/admin/admin.service.ts` | `923fb426` | `:4` import evictPrincipalStatus·`:87` `evictPrincipalStatus(id);`（recruiterDecision·negbend 件① 交付形=本刀修法先例·nbf 树 blob 亲算）·**形状参照·非权威证据源·blob 923fb426**（rev2 加注：该行系跨线形状引用·机制/行为权威锚=本基线树各行·届时 tip 照 §0.0 重 pin 清单更新） |

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. 简报「`admin.service.ts:64` 写 status='disabled'」：精确化——`:64` 是 not-found 守卫行，**写面在 DB 函数内**（`2e981a7c` `:113`+镜像 `67e99f04` `:192`）；service 层 `:62-:63` 是对该函数的 SELECT 调用。简报行号指涉 disable 函数体域，结论（零 evict）零变。
2. 简报「0041:112-113」：亲证恒等（`:112` PERFORM+`:113` UPDATE）。
3. 简报「照 admin.service.ts:87（negbend 修后）先例」：`:87` 系 negbend 线修后行号（该线 +import 行位移所致；本基线树同函数 return 在 `:86`）——先例形以 `923fb426` `:87` 为准（跨线锚），本刀落点照 `6a9c62cf` 域内行号（`:64`/`:65` 之间）。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**201**·头 `0201_qbank_fusion_owner_rank_org_dedup.sql`（与本基线 SSOT 题面「链 201 头 0201」恒等）。
- 本刀修法=API 层一行+负测邻面纯增臂（§1-修法件①②）·**预期零迁移零 DDL**。EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**，认领号=对届时主线链顶亲数+在飞分支题面复核后取最小未占号顺延（零硬编码）·Ban 抢号 Ban 私占。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 行为变更点（回归窗钉死）

- post-`f31d56d1`（API-HARDEN #118 三查并一在链）：principal guard 走 `accountState()` 守卫缓存（`50b38bc5` `:29`/`:31`/`:61`·60s TTL）·失效通道=①本进程写路径调 `evictPrincipalStatus`（`:33`）②跨进程/DB 函数内写走 0189 触发器 pg_notify 广播（`a291b62e` `:159-:163`→收播逐缓存）。
- **契约文本**（`50b38bc5` `:16`）：「本进程写路径同步 evictPrincipalStatus 即时……60s TTL 仅作 LISTEN 断连/未建立时的兜底上界（不 fail-open 于安全）」。
- 主线树本进程写路径 evict 调用点全量（rg 亲证 @`1af9803f`）：`profile.service.ts:146`（change-password）+`:206`（注销）两处（negbend 线另增 recruiterDecision `:87`·待 nail 不在本基线）——**`gateway_admin_disable` 路径（`6a9c62cf` `:60-:66`）零调用=principal.guard:16 契约的在链唯一违例**（negbend 修后其先例面闭合·本刀闭合最后一处）。

### 1.2 根因链（disable→被停用账户滞留 active 缓存至 60s TTL）

1. `POST /admin/users/:id/disable`（`6ee92ca7` `:32-:35`）→ service `disable`（`6a9c62cf` `:62-:63`）→ asPrincipal 内 `SELECT gateway_admin_disable($1)` → DB 函数内 `UPDATE user_account SET status='disabled'`（`2e981a7c` `:113`）+audit 留痕（updated_rows>0 门控）→ `disabled:true` → `:65` return 200。**写路径成功·API 层零本地 evict 钩子**。
2. 生产广播通道在场但有界：0189 触发器 status 在列集内（`a291b62e` `:160-:163`）→ 同事务 pg_notify 必发；**降级窗**=LISTEN 断连/未建立时（收播健康门 `trigger_missing` 断连退避·`93904f20` `:289-:297` 口径沿 negbend 卷 §0.1 锚）广播丢失→本进程 `statusCache` 该 uid 行滞留 `active:true` 至 `exp=now+60s`（`50b38bc5` `:61`）。
3. 危害面：被停用账户持旧 Bearer（无状态 HMAC·7 天 TTL 无黑名单）在降级窗内续过 principal guard（status 检查吃陈旧缓存·401 缺席）→ principal.guard `:16` 契约明文「60s TTL 仅作兜底上界」被破——该路径上 60s TTL 从兜底变成**唯一失效通道**。安全审计高危#2（禁用=假开关）的降级窗残留面。
4. 同簇对照（非本刀面·零改）：approve/reject 路径同型缺口已由 negbend 件① 闭合（`line/negbend-fix` @`1e686576`·待 nail）——本刀修法形与其逐字同构（先例承卷）。

### 1.3 负测盲区（零测试暴露确认）

neg-bend.proof.ts（178 臂）disable 相关臂全量=`:157`（无鉴权 401）/`:207`（candidate 越权 403）/`:213`（recruiter 越权 403）/`:220-:221`（admin ghost 404）——**全为鉴权与存在性面·零「disable→后续请求即时 401」臂**（rg 亲证）→neg-bend 现无该臂故缺陷零测试暴露（简报「neg-bend 现无 disable→即时 401 臂」亲证恒等）。

### 1.4 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）**：disable 写路径补本地 evict（件①·照 `923fb426` `:87` negbend 修后先例形·post-COMMIT 事务外）+neg 邻面增判别臂（件②）。
- **候选乙（否决·Ban）=负测 harness 补载 0143+0189**：爆炸半径沿 negbend 卷 §1.3 候选乙承卷（0189 入链→rl 桶 substrate 进程内 Map 切 PG 共享表→跨套件桶残留不可界；且 LISTEN 健康门牵连确定性）——否决。
- **候选丙（否决·Ban）=只修不测（放弃件②）**：无判别臂则件① 改前改后全绿零 diff=修法零判别门（red→green diff 失效·未来重构静默回退零门可拦）——否决。**增臂裁决=增**（任务书授予起草席裁决权·理由=甲之 prove 可证性依赖红臂存在·分母变化与门 1 适配见 §1-修法件②-4）。
- **候选丁（否决·Ban）=既有 178 臂断言本体任何字节改**：沿 negbend §1.3 候选丙否决——件② 纯增三处（种子 tuple+新臂块+条数注释）外零字节改。
- **候选戊（rev2 否决·Ban）=判别臂走 `h.U()` dev-header 传输**：pre-exec 双审双 FAIL 收敛 P0——dev-header 支路 `50b38bc5` `:104-:108` 绕过验签/status/代次直通 `req.principal`，判别臂填充/复请求两腿走该传输则 status 检查全程缺席：修前复请求=AdminGuard 403·修后仍 403（evict 与否不可观）→**修前修后均 403·臂恒红·red→green 判别门永不翻转·EXEC 必空转**——否决·判别传输面钉死 Bearer（本 rev 件②-2）。

## §1-修法（恰 1 产品文件 +2 行 + 1 负测邻面文件纯增三处·零迁移零 DDL）

- **件①（唯一产品码改·`apps/api/src/modules/admin/admin.service.ts` 现 `6a9c62cf`）**：
  1. import 区（`:3` 后）增 `import { evictPrincipalStatus } from '../../platform/principal.guard';`（照 `2dce92db` `:10`/`923fb426` `:4` 形）；
  2. `disable` 函数 `:64` not-found 守卫**之后**、`:65` return **之前**增一行（逐字）：
     `evictPrincipalStatus(id);   // 本进程守卫缓存即时清(停用后旧令牌下一请求即 401·调用点在 asPrincipal COMMIT 之后=事务外);跨实例由 0189 触发器同事务 pg_notify 广播逐缓存(LISTEN 断连退回 ≤60s TTL 兜底)`
     （单参形 `evictPrincipalStatus(id)`——导出签名 `uid: string` 单参 `50b38bc5` `:33` 亲证·两参形必撞 TS2554（negbend rev2 承卷）；`:64` 守卫后=404 路径零 evict（DB 零变更勿清）；注释沿 `2dce92db` `:146` 形。）
  3. **调用点排序语义（negbend rev3 R3-2 承卷）**：调用点位于 `asPrincipal` **COMMIT 之后**——`c31cbac0` `:991-:1002` 函数体 `fn(c)`→`:998` `COMMIT`→`return r` 逐行亲证，调用侧 `await this.db.asPrincipal(…)` resolve 时事务必已提交=事务外。**Ban 移入回调内**：事务内 evict（清缓存时写未提交）·并发读晚于 evict 起读经 `50b38bc5` `:61` 回填旧快照→60s 陈旧窗复现·`:48`/`:61` TOCTOU 代次守卫只防「读在飞中遇 evict」一相不可捕获。
  4. **diff 预期=件① 恰 1 文件净 +2 行**（import+调用行带注释）。
- **件②（neg 邻面增 1 判别臂·`apps/api/test/neg-bend.proof.ts` 现 `f076c99b`·纯增三处·既有 178 臂断言本体零字节改）**：
  1. `:44` 注释行尾追加 `evictU=active candidate 专供「admin disable→后续请求即时 401」判别臂(§5)。`；`:48` 种子行逐字改为：
     `  "('freshC','f@x.com','scrypt$f$f','candidate','approved'),('evictU','ev@x.com','scrypt$ev$v','candidate','approved')");`
     （**专用夹具用户 evictU**：userB/freshC/victimU 后段在用逐点亲证（`:261-:276`/`:296-:299`/`:491-:557`/`:196`）·复用既有用户即级联误伤后段臂·专用=零耦合·沿 pendU/rejU/freshC 直插先例（本文件 `:46-:48` 直插——**rev2 勘正**：原引 `_neg-harness.ts:73` 系 harness sql 重载循环行（`for (const f of ['01_schema'…]) await db.pool.query(sql(…))`）非直插先例）。）
  2. `:221`（404 臂）与 `:222`（泄漏防线注释）之间插入复合单臂（恰 1 个 `A(`·分母 +1·逐字）：
     ```ts
     // admin-disable-evict 件②:停用后下一请求即时 401(本进程 evict 契约臂·判别传输面=Bearer(rev2)·修前此臂红=守卫缓存滞留 active:
     // 填充腿 Bearer 经 principal.guard :93 accountState 读 cache miss→DB active→回填 :61(缓存落 active 点)→:94 过→403 落 AdminGuard :18 accountState 读/:19 isAdmin!==true;
     // 停用 200 落库;无本地 evict 时复请求腿 Bearer :93 吃陈旧 active 缓存→:94 过→403(AdminGuard)非 401)
     A('admin disable 后该用户下一请求即时 401(本进程守卫缓存 evict·非 60s TTL 兜底)',
       (await h.req('GET', '/admin/users', { authorization: 'Bearer ' + tokenFor('evictU') })).status === 403 &&
       (await h.send('POST', '/admin/users/evictU/disable', adm, {})).status === 200 &&
       (await h.req('GET', '/admin/users', { authorization: 'Bearer ' + tokenFor('evictU') })).status === 401);
     ```
     （三事实复合判据=防空转绿：填充腿 Bearer 403 同 `:202` 同面先例（该臂本身走 dev-header·403=admin_required 面同型·与传输面无关）保证缓存确已落 active；停用 200 保证写路径确已走；任一前置不成立即整臂红。**判别传输面=Bearer（rev2 钉死·候选戊否决承 §1.4）**——`tokenFor`（`_neg-harness.ts:25-26` 导出·`neg-bend.proof.ts:3` 已 import 零新增）签发经 `:87-:89` 验签过（AUTH_SECRET 由 harness boot() `:52` 注入与 guard `:67` 逐请求读同值恒等·`_neg-harness.ts:16`）·缺省 pe 0 与 `pwd_epoch` DEFAULT 0（`sql/09_auth.sql:14`）匹配→`:95` 过·签发无 jti（signToken 第 6 参不传·`packages/domain/src/auth.ts:69`）→`:98` 跳过 isSessionActive。**终判 401 与 403 的分野在 principal guard Bearer 支路 `:93-:94` 内部（`:94` `!st.active`→401 account_inactive）·dev-header 支路 `:104-:108` 绕过 status 检查故不可用作判别传输面**——修前复请求吃陈旧 active 缓存→`:94` 过→AdminGuard 403·修后 evict→cache miss→Bearer 支路 DB 读 disabled→`:94` 401·严格二值。`adm` 取 `:218` 既有 `h.U('adminU')`——**disable 腿留 dev-header 传输（rev2 亲证择定·两腿改形非三腿）**：该腿判别面无关（仅承担写路径触发·其传输不经 evictU 缓存面）·复用 `:220-:221` 404 臂同款 `adm` 形零额外面·改形面收敛于判别必需最小集。）
  3. `:590` 条数注释「共 178 条」→「共 179 条」并在括注尾增 `+admin-disable-evict 增臂 1`；`:592` 分段明细「§5 admin 特权边界+返回体泄漏 6」→「7」。
  4. **臂数分母变化与门 1 判据适配（增臂裁决登记）**：neg:bend **178→179**·neg:all **686→687**（bend 段 178→179·其余五段 90/90/91/102/135 不变）·门 1=改前必做 run 预期 **178 PASS/1 FAIL（唯一红=新臂）**·改后 **179/179**·PASS 名单 diff **恰 +1（新臂翻绿）·其余 178 条零弱化（diff 出第 2 条即停）**。
- **件③（prove·零 retry-to-green）**：①改前必做 run（恰一次·不计 prove·**件② 落树后、件① 落树前**本树实跑）`pnpm -C apps/api neg:bend`→预期 EXIT=1·178 PASS/1 FAIL·FAIL 名恰=新臂名；**若新臂不红→判据空转（修前即绿=臂无判别力）→停「机制不满足」**。②改后 prove run 集=§2 门矩阵全表。
- **件④（收据）**：`ai-docs/delivery/receipts/admin-disable-evict/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前改后 PASS 名单 diff+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）·untracked（§2-11 口径沿 negbend）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·数字口径以实跑实测为准）

1. **neg:bend（门 1·增臂适配口径）**：改前必做 run（件③①）EXIT=1·178 PASS/1 FAIL 唯一红=新臂；prove run `pnpm -C apps/api neg:bend` EXIT=0 **179/179**（**熔断=0 容差**：实测臂总数≠179 即触停止条件「现场漂移」）·改前改后 PASS 名单 diff（`sort|uniq -c` 协议·分母=本树改前实跑名单自证）恰 +1=新臂·其余 178 条零弱化（diff 出第 2 条即停）。
2. **neg:all 全量复跑绿**：`pnpm -C apps/api neg:all` EXIT=0·**687/687** 六段（auth 90+commerce 90+resume 91+interview 102+bend **179**+input 135·段序沿 `apps/api/package.json:74`）——邻五套件 PASS 名单对改前 diff=∅（非空即停·如实登记归因）。
3. **api-harden:prove 不回退**：`pnpm -C apps/api prove:api-harden` EXIT=0·**31 PASS/0 FAIL**（negbend EXEC 口径更 26→31 承卷）·proof 文件对基线零字节变更=零扰动。
4. **migrate:prove**：`pnpm migrate:prove` EXIT=0·链头实测=**0201**（链 201·届时顺延如实记）·**零新迁移**（新迁移出现即停「越界需要」）。
5. **drift:prove 零漂移**：`pnpm drift:prove` EXIT=0。
6. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`files=201 violations=0`（files 对届时链顶亲数·violations 恒 0）。
7. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径沿 SSOT 门矩阵）。
8. **lint 全绿贴边口径（LINT-CLEAN nail 后）**：`pnpm turbo lint` 12 任务全绿·root ≤**5202**+api ≤**1421**（**贴边零余量**——任一 +1 warning 即红→触停止条件「验收红不可修」·Ban 借机消偿 Ban 自升 sanction·消偿归协调方）·**rev2 加注**：root 5202 系基线 `1af9803f` 时值——EXEC 立项日照 §0.0 重 pin 清单②随届时主线 sanction 适配（rev2 日主线 tip `3dc286a4` 实测现值 root **5224**/web **601**/api 1421）。
9. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned ≤cap **2104**（现值 2099 本树亲跑·本卷 +1 受管件预期 **2100**·**>2104 红停上报**·cap 张弛归协调方）·**rev2 加注**：2100/2104 系基线时值——立项日预期值=届时基线现值 +1·cap 以届时值为准（rev2 日主线 tip `3dc286a4` 实测 cap **2112**/现值 2106）。
10. **markers 五类+冲突标记零命中**：本刀改动集（本卷 1 .md+件① 1 .ts+件② 1 .ts·收据 untracked 不入集）五类标记词（沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·**词面不复抄卷内防自匹配**）+冲突标记 grep 零命中（命令与回执入收据）。
11. **diff 面机检**：`git diff --numstat <base>` 恰 **3 tracked 路径**=件① `admin.service.ts`（+2/0-）+件② `neg-bend.proof.ts`（纯增三处·既有 178 臂零字节改）+本卷 .md——多任何 tracked 路径即停（越界需要类·typecheck 增量副效应 `apps/web/tsconfig.tsbuildinfo` 翻动则 `git checkout` 回滚保门 11·negbend EXEC §9 副效应登记先例）。
12. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（neg 面全离线·est live=0）。

## §3 范围外（边界清单·越界即 FAIL）

1. **既有 178 臂断言本体零触**：件② 纯增三处外 `neg-bend.proof.ts` 零字节改（候选丁否决）。
2. **harness 零触**：`_neg-harness.ts` 迁移挑选单零增删（候选乙否决·爆炸半径承卷）。
3. **recruiterDecision/negbend 面零触**：该面归 `line/negbend-fix` 管辖（STOP=`executed:awaiting_post_prove_dual`）——本刀不代 nail 不代翻面（行翻面权归协调方）·Ban 触 meetwise-nbf 工作树。
4. **同簇扩面零触**：0143/0189 触发器本体、AdminGuard/is_admin 缓存对称性、jti 会话通道、sse-notify 健康门机制、无启用端点面（disable 单向外·系统无 re-enable 写口=停用不可逆性登记项·零改）——皆零改；同形缺口若 EXEC 期被发现→如实登记升级·Ban 就地顺手修。
5. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——红清单/行翻面权归协调方。
6. **零迁移零 DDL**（§0.3）·零 CI/wrapper/runner 改·零依赖升级。

## §4 依赖

1. **上游已满足**：#118 三查并一+0189 件④ 在链（`1af9803f` 亲证）=被修复机制本体；LINT-CLEAN nail 收官=lint 全绿贴边基线（`1af9803f` 题面承）。
2. **同文件在飞（managed·预登记非停止）**：`line/negbend-fix` @`c046262d`（`1e686576` 件①）对本刀件① 同文件——**merge 序无关论证**：函数域不相交（disable `:60-:66` vs recruiterDecision `:81-:87`）·调用行异地·import 行两侧同文（同内容加行 git 自动合）→任一序并线零冲突预期。EXEC 立项日处置二态：届时主线已吸收 negbend（`git cat-file -e <届时tip>:ai-docs/delivery/harness/negbend-fix-REQUEST.md` 可解析判）→件① import 行免重（已在）·仅增调用行·件① diff 净 +1 行如实记；未吸收→照抄 import 行（净 +2）。§0.0 重扫出现 negbend 之外 novel 触者→停「现场漂移」。**EXEC 立项重 pin 清单（rev2 点名·与 §0.0 第三项同源）**：nbf tip 引用更新为届时值（本条所钉 `c046262d`/`1e686576` 系起草日值）+§2 门 8 root lint 判据随届时主线 sanction 值适配（rev2 日主线现值 **5224** 起）+门 9 docs:check 预期值随届时基线 +1（rev2 日主线 cap 2112/现值 2106）。
3. **迁移号**：§0.3 预期零。**下游**：neg 邻面判别臂增益随 bend 段归卷主·SSOT 行翻面与 nail 排序归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件③ 恰 1 改前 run+§2 prove 集·红不重跑冲销）；Ban 翻 pins（十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 为绿改既有断言/既有 178 臂任何字节改（§3-1·候选丁否决）；Ban 触 `_neg-harness.ts`/harness 迁移链（§3-2·候选乙否决承卷）；Ban 移 evict 入 asPrincipal 回调内（件①-3·TOCTOU 回填竞态·negbend rev3 R3-2 承卷）；Ban 两参形 evict（TS2554·negbend rev2 承卷）；**Ban 判别臂走 dev-header 传输面（rev2 增·候选戊否决——判别臂填充/复请求两腿必 Bearer·dev-header 支路 `:104-:108` 绕过 status 检查=臂恒红）**；Ban 同簇扩面（§3-4·触发器/is_admin/jti/健康门零触）；Ban 迁移 Ban DDL（§0.3 预期零·需则停上报走认领规则）；Ban 改共享 SSOT（§3-5）；Ban 触其他工作树（含 meetwise-nbf·§3-3）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因新红（任一门新红→如实登记升级·Ban 借机修·含 Ban 借机消偿 lint·sanction 归协调方）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（neg 面全离线·EXEC 期 prove 亦零模型外呼·本卷 §2-12 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词+冲突标记 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·不复抄卷内防自匹配——沿 negbend/g7w/authz-harden 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 根因结论与 §5 Ban/pins 与 §1-修法件①② 唯一码改面与增臂裁决与件②-2 判别传输面=Bearer 裁定（rev2）**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·**§0.0 重 pin 清单三项必做（rev2 点名）**·§0.0 在飞交叠重扫必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.2 结论受疑（如 principal.guard 缓存机制改写/0041·23 镜像函数改写/neg-bend 臂总数≠178/neg-bend.proof.ts 被他线先改/§0.0 重扫出 negbend 外 novel 触者）→停·重 pin 回炉。
- **机制不满足**：改前必做 run 新臂不红（填充/停用/复请求任一事实不成立=空转绿嫌疑·含 429/500 干扰）或改后 prove 新臂不绿或 401/403 分野观测与 §1-修法件②-2（rev2 Bearer 形）推定不符（修前复请求 403·修后 401 经 Bearer 支路 `:94`）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出「件① 恰 1 产品文件净 +2 行（或并线 negbend 后 +1 行）+件② 恰 1 测试文件纯增三处」面（需触 guard/harness/触发器/迁移/negbend 面/同簇面）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（lint 贴边零余量 +1 warning 即红/docs:check 超届时 cap/邻套件新红/api-harden 回退）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*ADMIN-DISABLE-EVICT REQUEST · 2026-10-14 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`1af9803f`（fetch 后 tip 同值·零重 pin）· 分支 `line/admin-disable-evict` · 工作树 `meetwise-ade`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=negbend-fix post 席2 同型病灶猎出（gateway_admin_disable 写 disabled 零 evict）+协调方派单 brief 2026-10-14 · 根因=disable 写路径（DB 函数内 UPDATE `2e981a7c` :113+镜像 `67e99f04` :192·audit updated_rows>0 门控亲证）成功而 principal.guard `50b38bc5` :16 契约「本进程写路径同步 evict 即时」零调用=在链唯一违例·0189 广播在场有界（status 在 `a291b62e` :160-:163 列集）但 LISTEN 降级窗内被停用账户滞留 active 缓存至 60s TTL（`:61`）·neg-bend 零「disable→即时 401」臂=零测试暴露（四 disable 臂 `:157`/`:207`/`:213`/`:220-221` 全为鉴权/404 面亲证）· 修法=件① 恰 1 产品文件 +2 行（import+post-COMMIT evict·`923fb426` :87 negbend 修后先例形·Ban 移入回调内）+件② neg 邻面增 1 判别臂（**增臂裁决=增**·专用夹具 evictU·复合三事实判据防空转绿·判别传输面=Bearer（rev2）·分母 178→179/686→687·门 1 适配=改前 178 PASS/1 FAIL 唯一红新臂→改后 179/179 diff 恰 +1）· 候选乙（harness 补链）候选丙（只修不测）候选丁（既有臂改形）候选戊（dev-header 判别传输·rev2 增）否决在卷 · 门矩阵十二门（neg:bend 增臂适配+neg:all 687+api-harden:prove 31+migrate 链 201 头 0201 零迁移+drift+uniqueness 201+typecheck 8/8+lint 全绿贴边（基线时值 5202/1421·届时随 sanction 适配）+docs:check（基线时值 2100≤2104·届时随基线适配）+markers 五类+diff 面恰 3 tracked 路径+卫生）· 同文件在飞=line/negbend-fix（merge 序无关论证 §4-2·import 同文自动合·届时二态处置）· 迁移预期零 · est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*

## rev2 处置摘要（2026-10-14 修订席·pre-exec 双审双 FAIL 同敛 P0 收敛落卷·仅改本 .md·⛔push）

**双审 FAIL 收敛点（P0）**：rev1 件②-2 判别臂填充/复请求两腿走 `h.U()`（=x-user-id dev 头）→principal.guard dev-header 支路 `50b38bc5` `:104-:108` 直通 `req.principal` 绕过 status 检查→修前修后该两腿均不得达 `:94`→复请求均 403（AdminGuard）非 401·臂恒红·red→green 判别门永不翻转·EXEC 必空转。**协调方 sanction 修订方向（两审席一致处方）=判别臂改 Bearer 传输面**。六项处置（每处亲证后落笔）：

1. **P0 件② 臂改形**：件②-2 代码块填充/复请求两腿改 `{ authorization: 'Bearer ' + tokenFor('evictU') }`。亲证链：`tokenFor` `_neg-harness.ts:25-26` 已导出（缺省 `pwdEpoch ?? 0`）·`neg-bend.proof.ts:3` import 行已含 `tokenFor` 零新增·签发无 jti（`packages/domain/src/auth.ts:69` signToken 第 6 参 `session?` 不传）→guard `:98` `tok.jti &&` 短路跳过 isSessionActive·缺省 pe 0=`pwd_epoch` DEFAULT 0（`sql/09_auth.sql:14`）→guard `:95` 过·AUTH_SECRET 由 harness boot() `:52` 注入与 guard `:67` 逐请求读同值（`_neg-harness.ts:16`）→`:87-:89` 验签过。括注「分野」改写：**分野在 principal guard Bearer 支路 `:93-:94` 内部（`:94` `!st.active`→401 account_inactive）·dev-header 支路 `:104-:108` 绕过 status 检查故不可用作判别传输面**。**disable 腿择定留 `adm`（=`:218` 既有 `h.U('adminU')`）**（两腿改形非三腿）：该腿判别面无关（仅触发写路径·传输不经 evictU 缓存面）·复用 `:220-:221` 404 臂同款 `adm` 形·改形面收敛判别必需最小集——择定理由在卷（§1-修法件②-2 括注尾）。
2. **P0 同根文本随臂形改写**：件②-2 代码块注释与括注机制描述随 Bearer 形重写（填充腿缓存落 active 点=principal.guard `:93` accountState 读 miss→DB active→回填 `:61`·403 落 AdminGuard `:18` accountState 读/`:19` isAdmin 判；修后 evict→cache miss→Bearer 支路 DB 读 disabled→`:94` 401）。§1.4 增**候选戊（dev-header 判别传输）否决·Ban**；§8 机制不满足停止条件补「与件②-2（rev2 Bearer 形）推定不符」；§5 Ban 列表增「Ban 判别臂走 dev-header 传输面」。**一处置协调方括注的精确化登记**：sanction 文「填充 403 的缓存落 active 发生在 AdminGuard:18 经 accountState 读」系 rev1 U() 形下成立（彼时唯一 accountState 读在 AdminGuard `:18`）——臂改 Bearer 后首读移至 principal.guard `:93`（miss→回填），AdminGuard `:18` 为命中读+403 抛点；本卷机制文本按亲证二点分写（落点 `:93`·403 点 `:18-:19`），判别分野与修后链照 sanction 原文钉死。
3. **P2 行号勘误**：§0.1 proof.ts 行 b110 注释区间 `:44-:46`→**`:43-:45`**·INSERT 区间 `:47-:48`→**`:46-:48`**（sed 亲证：`:43` 注释头行/`:45` 注释末行/`:46` INSERT 起行/`:48` INSERT 末行；件②-1 两落点锚 `:44`（注释行尾追加）/`:48`（种子行逐字改）不动）。
4. **P2 重 pin 义务显式化**：§0.0 增第三项「**EXEC 立项重 pin 清单（三项必做·漏做即未完成立项）**」+§4-2 句尾同名清单：①nbf tip 引用更新为届时值（`c046262d`/`1e686576` 系起草日值）；②§2 门 8 root lint 判据随届时主线 sanction 适配（rev2 日 fetch 实测主线 tip `3dc286a4`·uc003-i18n nail `68ffcb58` 落值 root **5224**/web 601/api 1421）；③门 9 docs:check 预期值随届时基线 +1（rev2 日实测 cap 已 2104→**2112** `8b577e8b` 落值·主线现值 2106）。§2-8/§2-9 各加 rev2 加注互引。
5. **P2 先例行加注**：§0.1 跨线锚行尾增「**形状参照·非权威证据源·blob 923fb426**」（机制/行为权威锚=本基线树各行·届时 tip 归重 pin 清单①）。
6. **P2 引用勘误**：件②-1 括注「沿 pendU/rejU/freshC 直插先例（`_neg-harness.ts:73` 同法）」勘正为「（本文件 `:46-:48` 直插）」——sed 亲证 `_neg-harness.ts:72-:73` 系 sql 重载循环行（`for (const f of ['01_schema'…]) await db.pool.query(sql(…))`）非直插先例。

**rev2 附带增锚（§0.1 协议自洽·判别臂新依赖入表受重 pin 管辖）**：principal.guard 行补 rev2 判别臂锚（`:66-:102` Bearer 支路 `:87-:89`/`:93`/`:94`/`:95`/`:98`+`:104-:108` dev-header 支路）·harness 行补 `:16`/`:25-:26`/`:52`·proof.ts 行补 `:3` import tokenFor·新两行 `packages/domain/src/auth.ts`（blob `697da7dc`·109 行·`:69` signToken）与 `packages/db/sql/09_auth.sql`（blob `9082403f`·28 行·`:14` pwd_epoch DEFAULT 0）——blob 对 `1af9803f` 亲算（`git diff --name-only 1af9803f HEAD` 仅本 .md=工作树 hash-object 即基线 blob）。基线栏补记 rev2 日 fetch 主线已前进 `1af9803f`→`3dc286a4`（本分支基线不追·届时适配归重 pin 清单）。

**rev2 自检（本树亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（`2100≤cap 2104` 本树·基线时值；届时值归重 pin 清单③）·本卷五类标记词+冲突标记零命中（i6-239 §2-7 运行时组装同法 node 亲跑 hits=0·词面不复抄卷内）·**STOP=`draft:awaiting_pre_exec_dual` 维持**（复审重派两外席·alone≠dual·Dual PASS ≠ 开工）·diff 面=本卷 1 .md。commit：`docs(admin-disable-evict): REQUEST rev2——判别臂改 Bearer 传输面+机制描述随形（⛔push）`。
