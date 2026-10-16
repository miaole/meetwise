# E2E-RECRUITER-GATE — B110 处方2 后继刀（审批面升 e2e 级活契约 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 REQUEST 只送审 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 自动开工 · 须 meetwise 明示授权才进 EXEC） → **executed:awaiting_post_prove_dual（EXEC 已行使：rebase `feat/mysql-schema-skeleton`@`9000f02e` 干净重放 2/2 零冲突 · C1-C3 落位（run-e2e.mjs seedAdmin/E2E_ADMIN_TOKEN · auth.ts adminHeaders fail-closed + proof 两 test · full.e2e.ts 两处审批步+三步活契约·既有断言零删改）· 零模型两档 typecheck EXIT=0 + e2e-helpers:prove 28/28 EXIT=0 一次过 · §4-3 e2e:isolated 冻结待协调方排程（live 授权跑不解冻）· 收据 `ai-docs/delivery/receipts/e2e-recruiter-gate/e2e-recruiter-gate-exec.md` · markers=0 · est live=0 · alone≠dual）**
**Date**: 2026-10-10
**Base**: `feat/mysql-schema-skeleton` @`1ae677b8`（主线 tip 亲证 `git log --oneline -1`） · 分支 `line/e2e-recruiter-gate`（工作树 `/Users/miaole/Desktop/golucky/meetwise-e2rg`，`git worktree add` 亲建）
**蓝本**: `ai-docs/delivery/harness/b110-REQUEST.md` post-dual 席1 FAIL 处置 **处方2 登记行 `:177`**（后继刀 E2E-RECRUITER-GATE 三要件：隔离 runner bootstrap 播 admin 身份 · full.e2e.ts 注册后各加 `POST /admin/recruiter-approvals/{uid}/decision`（approve·recruiter2 须在 RLS 断言前过门）· 审批面升 e2e 级活契约 pending→403 分码→approve→200）+ 处方1 冻结条款 `:176`（e2e:isolated live 授权跑冻结直至处方2 落地）。**唯一蓝本，逐条忠实，禁自由发挥。**
**Honesty**: 本档全部 file:line 锚点在 `line/e2e-recruiter-gate` @`1ae677b8` 实树亲读验证（full.e2e.ts / e2e/helpers/auth.ts+http.ts / admin.controller+service / admin.guard / recruiter.guard / principal.guard / contracts / 0155 迁移 / 0001+0006+0015+0019 迁移列默认 / _neg-harness.ts / neg-bend.proof.ts / run-e2e.mjs / run-e2e-isolated.mjs / 双 package.json——行号错=审席 FAIL）。**蓝本三处 pin 勘误登记**（亲读为准·不改蓝本口径）：①`_neg-harness.ts:73-76`（is_admin 直插先例引）= b110 线内版行号，主线 @`1ae677b8` 实为 **`:161-164`**（文件区间漂移·neg-bend.proof.ts `:45` 引注同源）；②蓝本「`:287-292` RLS 断言」亲读正为 **`:293-297`**（`:287-288`=candidate 门禁 403 断言·`:292`=recruiter2 注册行）；③处方1 引 `full.e2e.ts:277` 红面，亲读断言行= **`:278`**（`:276` fetch · `:277` readJson——同一语句链，登记不改口径）。

---

## §0 立靶

**上游事实源**：b110-REQUEST `:173`（FAIL 实体原文：「本刀把招聘方注册改 `approval_status='pending'` 后未适配主层 LIVE E2E……全 suite 无审批步骤 → 刀后 e2e:isolated step 8 deterministic EXIT=1」）· `:176`（处方1 冻结）· `:177`（处方2 三要件）。

**机制链亲验 @`1ae677b8`**：

1. **B110 生产面已落主线**（本刀零触·只消费）：`packages/db/migrations/0155_recruiter_approval_gate.sql:37-38`（`approval_status text NOT NULL DEFAULT 'approved' CHECK IN ('pending','approved','rejected')`）· `:47-49`（`gateway_auth_signup` recruiter 分支直落 `'pending'`）· `:61-70`（`gateway_require_active_recruiter` 扩展加 `approval_status='approved'` 维度）；API 层三分码 `apps/api/src/platform/recruiter.guard.ts:19-21`（非招聘方→`recruiter_required` · pending→`recruiter_pending_review` · 非 approved→`recruiter_rejected`；注释 `:7-8` R6 口径）。
2. **审批面契约已立法**（本刀消费方）：`apps/api/src/modules/admin/admin.controller.ts:44-48`（`POST admin/recruiter-approvals/:id/decision` · `@HttpCode(200)` · `RecruiterDecisionDto` Zod 校验；双守卫 `:12-13` PrincipalGuard+AdminGuard）· `packages/contracts/src/index.ts:367`（`{ decision: z.enum(['approve','reject']) }`）· `apps/api/src/modules/admin/admin.service.ts:55-61`（`gateway_admin_recruiter_approval($1=目标uid,$2=decision)` → `{decided:true}`；false→404 `not_found` 不区分不存在/非招聘方）· `apps/api/src/platform/admin.guard.ts:16`（`is_admin !== true` → 403 `admin_required`）。DB 侧裁决函数 `0155:87-105`（approve/reject 翻转 + `admin_audit` 留痕 `approve_recruiter`/`reject_recruiter`）。
3. **缺口=且仅=e2e 面**：`neg-bend.proof.ts:395-469` 已在 API 级证三分码全 B 端路由 + admin 队列/裁决（b110 收据 neg:bend 157/157 绿）——主层 LIVE E2E `e2e/full.e2e.ts` step 8 无审批步：`:274` recruiter 注册（pending 落库）→ `:276-278` 断言发岗 200 实得 403 `recruiter_pending_review` → A() fail-closed deterministic 红；`:292` recruiter2 注册后 `:293-295` RLS 断言同红。与上游 FAIL 实体（`b110-REQUEST:173`）逐字对齐。
4. **e2e 侧无 admin 身份来源**：`e2e/helpers/auth.ts:15`（postAuth body role 枚举仅 `'recruiter'|'candidate'`——注册面无 admin）· `AdminGuard` 只认 `user_account.is_admin=true` 行（`admin.guard.ts:16`）→ 隔离 runner 必须自播 admin 身份。先例（测试基建域）：`apps/api/test/_neg-harness.ts:161-164`（`INSERT INTO user_account(id,email,password_hash,is_admin,role) VALUES ('adminU',…,true,'candidate')` 直插）。
5. **播入身份可过守卫链的默认值依据**（逐迁移亲读）：`status` 默认 `'active'`（`0001_baseline.sql:366`）· `pwd_epoch` 默认 `0`（`0015_pwd_epoch.sql:5`）· `role` 默认 `'candidate'`（`0006_user_role.sql:2`）· `is_admin` 默认 `false` 显式置 `true`（列源 `0019_schema_drift_reconcile.sql:54`）→ PrincipalGuard 复核链（`principal.guard.ts:48-60` Bearer 验签 + `:28-42` status/pwd_epoch 账户态复核 + 保留前缀哨兵 `:44-46`）全过；neg-bend 已实证 is_admin 直插行经 HTTP AdminGuard 放行（`neg-bend.proof.ts:431` admin 队列调用绿）。
6. **runner 现状与插入点**：`scripts/run-e2e.mjs`（`pnpm e2e:prove` 实体·package.json `:291`；隔离 wrapper 经 `run-e2e-isolated.mjs:2586` `runFullE2E('pnpm',['e2e:prove'],env)` 调它）——`:14` AUTH_SECRET 测试键单点在握 · `:119/:124` api/worker spawn · `:128-142` 就绪链（livez→DB 401 探活→worker readyz）· `:145-147` e2e 子进程 spawn（extraEnv `{E2E_TAG,E2E_BASE}`）。**插入点=`:142`（worker ready 检查后）与 `:145`（e2e spawn 前）之间**：此时隔离库迁移已完成（wrapper `migrateWithRecovery` 先于 API/worker 启动，`run-e2e-isolated.mjs:2571` 区）、`user_account` 可写。pg 直连双先例：`e2e/full.e2e.ts:241-243`（`createRequire(new URL('../packages/db/package.json', import.meta.url))('pg')`）与 runner 侧子探针 `run-e2e-isolated.mjs:2367-2377`（`node --input-type=module --eval` · cwd=`packages/db`·注释 `:2374-2375` 明示 pg 是 db workspace 依赖勿提升根依赖）。

## §1 范围（三件·同 PR·纯 e2e/runner 测试基建面）

**C1 runner bootstrap admin（`scripts/run-e2e.mjs`）**：就绪链内（`:142` 后 `:145` 前）插 `seedAdmin` 三步——①pg 直连 `INSERT INTO user_account(id,email,password_hash,is_admin,role) VALUES ('e2e-admin','e2e-admin@x.com','scrypt$e2e$bootstrap',true,'candidate') ON CONFLICT (id) DO NOTHING`（幂等·先例 `_neg-harness.ts:161-164`·§0-5 默认值链保证过 guard）；②铸 token：node:crypto 内联 HMAC，**逐字同 `signToken` 形**（`packages/domain/src/auth.ts:31-35`：`base64url(JSON {uid,exp,pe}) + '.' + base64url(HMAC-SHA256(payload, secret))` · pe=0 对齐 pwd_epoch 默认），secret=runner env `AUTH_SECRET`（`:14` 测试键）；③`env.E2E_ADMIN_TOKEN` 并入 `:145` spawn extraEnv。seed/铸任一步失败 → fail-closed `tagE2EFailure('db','admin_bootstrap_failed')` 照 `:133-135` 出口形 cleanup+exit 1。定谳推荐落 `run-e2e.mjs` 而非 wrapper（理由：AUTH_SECRET `:14` 与 extraEnv `:145-147` 单点在握·覆盖直跑与 wrapper 双路径·wrapper 是通用 proof 宿主塞 e2e 专属 seed 会污染其他 target）；run-e2e.mjs 为 plain node .mjs 无 TS loader，`@meetwise/domain` 直 import 不可行故内联铸形——token 畸形会 401 deterministic 红（§0-3 守卫链自证·无静默漂移面）。双审可对落点/铸形挑战，挑战须附等价 fail-closed 论证。

**C2 e2e 侧 admin 头 helper（`e2e/helpers/auth.ts`）**：增 `adminHeaders(): Record<string,string>`——读 `process.env.E2E_ADMIN_TOKEN`，空/缺 → `throw new Error('e2e_admin_bootstrap_missing')`（fail-closed · **Ban 假绿**：绝不静默跳过、绝不 mock 决策响应）；有值 → `jsonHeaders(token)`（`e2e/helpers/http.ts:12-18`）。单测槽=`e2e/helpers/e2e-helpers.proof.ts` 增两 test（缺 env throw + 有 env 返 Bearer 头；沿 `:90-147` signupOrLogin mock 形·`:16` 已 import 同文件）。

**C3 full.e2e.ts step 8 两处审批步 + 最小三步活契约（`e2e/full.e2e.ts`）**：
- **recruiter1 区（`:274` 后 · `:276` 前插·原 `:276-278` 零改）**：①pending 态发岗 `POST /recruiter/jobs`（HR）→ `A(r.status===403 && body.error==='recruiter_pending_review', 'B端审批活契约:pending 发岗 → 403 分码')`（分码沿 neg-bend.proof.ts `:402` 同码·403 无副作用：guard 先于限流/解析零桶消耗 neg-bend `:398` 注）；②`POST /admin/recruiter-approvals/{uidFromToken(recruiter.token)}/decision` body `{'decision':'approve'}`（DTO 契约 contracts `:367`）adminHeaders → `A(r.status===200 && body.decided===true, 'B端审批活契约:admin approve → decided')`（service 契约 `admin.service.ts:59-60`）；③原 `:276-278` 200 断言照旧（approve 后自然绿=活契约第三步兑现）。
- **recruiter2 区（`:292` 后 · `:293` 前插）**：approve `{decision:'approve'}` → `A(200 && decided===true)`（uid 取 `uidFromToken(recruiter2.token)`·`uidFromToken` 已在 `:12` import）。**不加第二遍分码断言、不加 reject 支线**（最小三步=pending 403 分码→approve→200·拒绝支线 API 级已证 neg-bend `:395-469`·蓝本 `:177` 只令「recruiter2 过门」）；`:293-297` RLS 断言零改（approve 前置后自然绿）。

## §2 非范围

1. **B110 生产码面零字节**：0155 迁移 / `recruiter.guard.ts` / auth signup 面（gateway_auth_signup 体）/ admin 契约零触（蓝本 `:177` 只令 e2e 适配·本刀消费不改造）。
2. **C 端段与其它段零触**：step 1-7 / 9 / 专家评审段零改；`:287-288` candidate 门禁 403 断言零改；`:276-278`/`:293-297` 既有断言零删改（本刀只在注册后插入·不移动不改写）。
3. **不解冻 live**：e2e:isolated **live 授权跑仍冻结待协调方**（处方1 `b110-REQUEST:176` 条款继续有效）；本刀交付=码面+本地隔离验证，本刀 EXIT=0 ≠ 解冻 ≠ 授权跑替代。
4. **不造段门/子集开关**：亲查结论（§4-4）——「B 端段单跑」现树不存在，为它加开关=加戏（§5-5）。`E2E_UC018_ABANDON_ONLY`（full.e2e.ts `:133-141`）是 UC018 块内 early-return 特例，非通用段门，不扩散。
5. **neg 面零触**：`neg-bend.proof.ts` / `_neg-harness.ts` 零改（API 级已证·本刀不重复）。
6. **SSOT/卫生零触**：CLAUDE.md/backlog/coverage matrix/SOP/NORTH-STAR §1 零改；零迁移；零 secrets 入库（`E2E_ADMIN_TOKEN` 仅进程 env 运行时态·测试键铸发·不入卷不落盘）。

## §3 清单（file:line 现状→目标·全数亲读 @`1ae677b8`）

| # | 码面 | 现状（亲读） | 目标 |
|---|---|---|---|
| C1 | `scripts/run-e2e.mjs:142-147`（就绪链尾 `:142` → e2e spawn `:145-147` extraEnv `{E2E_TAG,E2E_BASE}`） | 无 admin 身份播入·无 pg 依赖 | seedAdmin 三步（直插+铸 token+env 交接）；失败 fail-closed `admin_bootstrap_failed`；其余行零改 |
| C2 | `e2e/helpers/auth.ts`（现 70 行·无 admin 面） | 无 | +`adminHeaders()` fail-closed（缺 env throw `e2e_admin_bootstrap_missing`）；既有 `signupOrLogin`/`uidFromToken` 零改 |
| C3 | `e2e/helpers/e2e-helpers.proof.ts:90-147`（signupOrLogin mock 先例·`:16` import） | 无 admin helper test | +两 test（缺 env throw / 有 env 返 Bearer 头）；既有 test 零删改 |
| C4 | `e2e/full.e2e.ts:274-278`（recruiter1 区）·`:292-295`（recruiter2 区） | 注册后直发岗·无审批步（deterministic 红） | C3 三步活契约两处插入；`uidFromToken` 沿 `:12` 既有 import；既有断言零删改 |

## §4 prove（验收命令·两档写死·EXEC 按协调方指令行使）

1. **静态门**：`pnpm typecheck` EXIT=0（package.json `:21-22` → `tsc -p tsconfig.e2e.json` · include `e2e/**/*`）。
2. **单元门（零模型零容器）**：`pnpm e2e-helpers:prove` EXIT=0（package.json `:14` → `node --import tsx e2e/helpers/e2e-helpers.proof.ts`）——C2/C3 helper 面在此收口。
3. **隔离端到端门（本刀 deterministic 红→绿收口面）**：本地 `pnpm e2e:isolated`（package.json `:293` → `run-e2e-isolated.mjs e2e:prove` → 隔离 docker PG + `migrateWithRecovery`（wrapper `:2571` 区）→ `run-e2e.mjs` → full.e2e.ts 全量）EXIT=0——step 8 活契约三断言绿 + 既有 RLS/门禁断言全绿 + 零回归红。MODEL_API_KEY 真供应商消耗**如实入收据另账**（不冒充授权跑·releaseEvidence=false 沿 pins）。
4. **最小验证形（亲查结论·如实登记）**：`run-e2e-isolated.mjs` 最小调用形=单 target 形参（usage `:18-35`）；`e2e:prove` **无步骤子集开关**；`full.e2e.ts` 线性脚本**无 describe/it**（唯一段门先例 `:133-141` `E2E_UC018_ABANDON_ONLY`=UC018 块内 early-return 特例）→ 「B 端段单跑」现树不存在且本刀不造（§2-4）。**两档**：(a) 若协调方接受全量隔离跑成本 → §4-1+4-2+4-3 一次过即收口；(b) 若判成本高/待排程 → 先以 §4-1+4-2（零模型零容器）交付码面，§4-3 列为本刀 prove 收口条件待协调方排程——**两档均不触碰 live 授权跑冻结**（§2-3）。
5. **门清单**：Ban retry-to-green（attempts 全账入收据）· 冲突标记门（`grep '^<<<<<<< \|^=======$\|^>>>>>>> '` 全仓 staged+工作树=0）· 既有断言零删改（`:276-278`/`:287-288`/`:293-297` 全保留）· est live=0 · 收据 `ai-docs/delivery/receipts/e2e-recruiter-gate/`。

## §5 Ban（全列）

1. **Ban self-approve** · **alone≠dual**：本 REQUEST 只送 pre-exec 双审，Dual PASS ≠ 开工。
2. **Ban 动 B110 生产码面**：0155 / recruiter.guard / auth signup 面 / admin 契约零字节（§2-1）。
3. **Ban admin 旁路**：必须走真 HTTP `POST /admin/recruiter-approvals/:id/decision`（活契约本体）；Ban 直写 `UPDATE user_account SET approval_status='approved'` 旁路；Ban dev-header（`x-user-id`）冒充——run-e2e.mjs 不设 `AUTH_DEV_HEADER`（principal.guard dev 回退支路生产形不启）。
4. **Ban 假绿**：`E2E_ADMIN_TOKEN` 缺失必须 throw 不跳过（C2 fail-closed）；Ban mock/伪造审批决策响应；Ban skip-as-pass。
5. **Ban 加戏**：不加段门/子集开关（§2-4）/第二遍分码断言/reject 支线/perf 面/helper 之外新抽象。
6. **Ban C 端段与既有断言删改**（§2-2）。
7. **Ban retry-to-green**：prove EXIT=0 一次过，attempts 全账如实。
8. **Key name-only**：零 live 授权跑（est live=0）·零 secrets/.env 入库（§2-6）。

## §6 pins（十一值照抄现行）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=202 软删受理(purge_pending)（UNSTUB-ERASE supersession 现行值·沿 fence-reflow §6 同源不改口） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零 live 授权跑·est live=0；本地隔离跑真供应商消耗另账如实登记·不冒充不计入本值）

## §7 Non-claims

e2e 绿 ≠ 审批制产品验收（处置裁决留协调方·b110 R6 分码≠处置口径）≠ live 授权跑解冻；runner 播 admin = 测试基建身份（先例 _neg-harness adminU 同域）≠ 产品 admin 功能 ≠ 权限面变更 ≠ 生产凭据发放通路（E2E_ADMIN_TOKEN=测试键铸发·进程 env 运行时态）；三分码 e2e 断言 ≠ 全路由分码矩阵（neg-bend `:395-469` 已证 API 级·e2e 只钉发岗一面）；最小三步 ≠ reject 支线 e2e 化（API 级已证·本刀不加）；本地隔离跑绿 ≠ releaseEvidence（false 沿 pins）≠ HA；审批过门 ≠ 企业付费主体成立（#271 挂点另刀·0155 头注口径）；本 REQUEST ≠ EXEC 编码授权；`actualSpendCny=null`。

## §8 STOP

**STOP · `awaiting_pre_exec_dual` · alone≠dual。** REQUEST 写完即停零码动（本刀树仅本 REQUEST 文档一笔 commit·零码改）；EXEC 须 pre-exec 双审两外席 PASS + meetwise 明示授权；Ban self-approve；Ban retry-to-green。

---

*E2E-RECRUITER-GATE EXEC REQUEST · 2026-10-10 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`1ae677b8` · 分支 `line/e2e-recruiter-gate` · 蓝本=b110-REQUEST post-dual 席1 FAIL 处方2 `:177`+处方1 冻结 `:176` · pin 勘误三处登记（_neg-harness :73-76→:161-164 · RLS :287-292→:293-297 · 红面 :277→:278）· pins 十一值照抄 · est live=0 · Dual PASS ≠ 开工 · Ban self-approve*

*rev2 勘误注记（append-only · pre-exec 双席 FAIL 锚点处方落卷 · 逐处 awk 亲读定谳 @`1ae677b8` 实树 · 只动锚点行号零设计变更）：①`0155` approval_status ALTER `:41`→`:37-38`（亲读 :37-38 即 ALTER 全句·:41 实为 gateway_auth_signup CREATE 行）；②recruiter pending 分支 `:44-47`→`:47-49`（:47 IF recruiter·:49 INSERT 'pending'·:50=ELSE candidate 支线——席2 对·席1 `:47-50` 越一行）；③`gateway_require_active_recruiter` 扩展 `:108-117`→`:61-70`（:61 幅注·:62 CREATE·:66 approval_status 维度·:70 收尾·:108-117 实为 REVOKE/GRANT 块）；④`admin.guard.ts` is_admin 检查 `:19-20`→`:16`（全文件 19 行·:16 单行即 `is_admin !== true` 403·:19-20 引不存在行）；⑤`http.ts` jsonHeaders `:17-24`→`:12-18`（全文件 18 行）；⑥蓝本处方2 登记行 `:178`→`:177`（亲读 b110-REQUEST：:177=处方2 三要件·:178=卫生观察条——处方列 :6/:13/:85 三处·实查全文五处 :6/:13/:32/:36/:85 全改）；⑦neg-bend 区间 `:398-431`→`:395-469`（13) b110 段幅注释 :395 起·块闭 :469 止·approve 解锁/留痕 :446-456·reject 裁决/留痕 :457-465·404 边界 :466-468——席1 :395-468 漏 :469 块闭·席2 :398-446 截断解锁/reject 留痕/边界·点锚 :398/:402/:431 亲读 exact 不动）；⑧principal.guard 三子锚 `:42-49`/`:24-38`/`:39-41`→`:48-60`/`:28-42`/`:44-46`（Bearer 验签=canActivate :48 起 :60 return true 止·账户态复核=accountState 方法体 :28-42·哨兵=isReserved :44-46——席1 全对·席2 :28-41 漏 :42 收括号·":48-50+" 开放式不取）；⑨低危两锚亲读不改：`domain/auth.ts` signToken 恰 `:31-35`（:31 export 起·:35 收括号·席2 提 :30-34 反错·:30 为注释尾）·`_neg-harness.ts` INSERT 开行恰 `:161`、`:161-164` 完整四行（席1 对·席2 :159-161 错）——其余口径一字未动（含已登记蓝本勘误三处与 §4 验收两档）。*

draft_rev2:pre_exec_dual（双席锚点处方落卷·逐处亲读定谳·待窄域复审）

---

## nail 落卷（2026-10-10 · post-prove 双席 BOTH PASS·B110 同批收口）

**双审结果**：席1（实现语义）+席2（契约/旅程）互盲复核 BOTH PASS。C1 铸形逐字同 signToken（payload+'.'+HMAC·pe=0·secret 同一 env 对象传 API 子进程 HMAC 必然互验）·INSERT ON CONFLICT 幂等·fail-closed 分类链亲证（tagE2EFailure→E2E_FAILURE_LINE_RE→cleanup+exit 1）·C3 三步活契约真 HTTP 全链（响应体 error 字段断言对齐生产分码·admin 步走全生产链 Bearer HMAC→principal→admin guard→zod→0155 SQL+audit 留痕）·**真 signup 路径增量达成**（neg-bend 为 dev-header+DB 直插·本刀 pending 由生产 signup 真产生）·零删改结构性证明（13+/1− 唯一删除行=import）·两档门双席独立复跑绿（typecheck+28/28）。merge 落主线 @cedf631b。

**B110 同批收口（裁决席附条件兑现）**：B110 EXEC 实体合格（0155 在链·neg:bend 157/157·三分码·双层守卫）+处方1 登记三实体锚点亲证+处方2 本刀三要件全交付——B110 正式收口。附条件兑现：①live 冻结至本刀合入（现已合入）②同批 nail（本卷）③合入前主线 tip 四面零漂已证。

**e2e:isolated 解冻判断（席2）**：解冻条件已满足（pending→403 分码→approve→200 链码面闭合·bootstrap 失败 fail-closed 无假绿旁路·残余依赖=wrapper 每跑新容器与现行行为一致）——live 授权跑（MODEL_API_KEY 真消耗）归协调方/用户排程。

**Status**: `nail:closed`（post-prove 双席 BOTH PASS·merge 落主线 @cedf631b·B110 同批收口·0-b 前置闸开启→ENTPAY 片2 EXEC 授权链就绪·markers=0·est live=0）。
