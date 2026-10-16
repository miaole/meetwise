# BOOT-VALIDATE 启动校验三态小刀（批5 盘点 Top4 · #244 PREVIEW 三态归一单源 + #245 注册零半成功 + #246 env 启动期聚合 · 起草 REQUEST · 落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落卷 §9 · post-prove 双审两外席待派 · Ban self-approve · alone≠dual · Dual PASS ≠ nail（PASS 只过审·nail 须协调方明示授权）· ⛔push）
**席位**：BOOT-VALIDATE 启动校验三态小刀诊断+起草席（协调方派单·批5 盘点席 Top4「三件一卷零迁移」·⛔push·⛔merge主线）。
**基线**：`feat/mysql-schema-skeleton` @ `5c8e122c`（本席亲 fetch 亲证 origin tip=`5c8e122c`·派单下界「tip≥5c8e122c」以等号成立亲证·docs:check 2202≤cap 2208 本席本树亲跑 EXIT=0）· 分支 `line/boot-validate`（本席 `git worktree add ../meetwise-bv -b line/boot-validate` 亲立·建树先落本地 `93b3db5a` 亲证其=origin tip 祖先后 `git merge --ff-only 5c8e122c` 快进归位·分支零自造 merge 节点·⛔pull --rebase 未用）· 工作树 `meetwise-bv`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（2026-10-16·批5 盘点席 Top4·三件一卷零迁移·靶=#244/#245/#246·量级≤1 天即起草）；②brief 三件原文（#244 MEETWISE_PUBLIC_PREVIEW 严格三态前后端各读各·非常值 API 启动行为分歧 / #245 缺 AUTH_SECRET 时注册半成功：先落 user_account 再 500 / #246 RESUME_ENC_KEY/HASH_SECRET 长度仅首传校验（<16 抛 500）非启动期·本席逐件源级亲证成立见 §1）；③issues-master 三行原文**仓外待补**（协调方持有·沿 obs-family REQUEST §立项出处④ Q1 先例·EXEC 立项时如已入卷照 §0 协议补锚）；④**编号同词异源防误并登记**：LEDGER :87 组标签在册的「#248/#245/#246 分 4 子刀（OBS…）」系 5C-OBS 子刀三行（语义=apiReady 原因位/runner 探测环/访问行 query 剥离·obs-family 卷已 nail 收官）——与本刀批5 盘点 #244/#245/#246（语义=env 启动校验/PREVIEW 三态/注册事务边界）**同编号词不同登记源**·本刀不触不并不宣称（§3-7）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git hash-object 实测 @`5c8e122c`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

> **EXEC 重 pin 记（2026-10-16·届树=merge `b96ec58f` --no-ff 并 `origin/feat/mysql-schema-skeleton@10799a3e`）**：§0.1 二十 blob（十五主锚+五证锚）`git hash-object` 亲算**全数恒等**=零漂移·行号零漂·停止条件①未触发。一处行锚勘误随落：**web-middleware.proof 非常值 throw 臂 regex 钉实位 `:92`**（起草记 `:88-91` 系区间误记·pre-exec P2-3 勘误·blob `9cc997bb` 恒等亲证·proof 文件零触）。merge 携入=worker-hang-guard 波（apps/worker src+test+其 REQUEST+SSOT 两 docs）·与本刀二十锚零交集亲证。

### 0.0 防重三对表

- `git branch --list "line/boot-validate"` 恰 1 命中=本席分支；`git worktree list` 中 `meetwise-bv` 恰 1 树=本席工作树（建前双查不存在）。
- `ls ai-docs/delivery/harness/ | grep boot-validate` 建前零命中→落卷后唯一同名卷=本卷。
- 本刀三触面（env-schema.ts/auth.service.ts/public-preview.ts+web 镜像）`git worktree list` 全树扫：零第二在飞树锚定此三文件（51+ 树清点·obs-family :14 同款口径）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`5c8e122c`·建树即本基线零漂移）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/src/platform/public-preview.ts` | `c6e05839`（82 行） | **`:40-44` `resolvePublicPreviewMode` 后端三态真源（undefined/'0'→false·'1'→true·else throw `invalid_meetwise_public_preview`）**·`:51`/`:60` 两 assert 复用之·`:75-82` `installPublicPreviewIngressGate`（零触） |
| `apps/web/lib/public-preview.ts` | `0b2c0aa9`（10 行） | **`:6-10` `resolvePublicPreview` 前端复制形——三态形逐字同 api 第二份**·头注 `:2-5` 自认「Keep this aligned with apps/api/src/platform/public-preview.ts」=双源漂移风险自认正身 |
| `apps/web/middleware.ts` | `6c718b4e`（123 行） | **`:97` 逐请求读点**（非常值→throw→每请求 500·进程不死=无 boot 拒启位）·`:2` 注记「与 API resolvePublicPreviewMode 对齐」 |
| `apps/web/app/layout.tsx` | `a59de1ce`（56 行） | **`:37` 根布局逐渲染读点**（非常值→throw→渲染错·进程不死） |
| `apps/api/src/main.ts` | `f396de91`（322 行） | **`:140` `assertCriticalEnv()` boot 第一道·`:141` `resolvePublicPreviewMode()` boot 读（非常值→裸 throw→bootstrap `:317-322` catch 后 exitCode 1=api 拒启）**——同一非常值三进程三行为的 api 肢 |
| `apps/api/src/modules/resume/ocr-model-client.ts` | `9f1dbc7e`（54 行） | **`:19` `isProductionOcrLocked` 内 `MEETWISE_PUBLIC_PREVIEW === '1'` 直比**（非常值→静默 false·不 throw=锁读者形①） |
| `apps/web/lib/ocr-preview.ts` | `f5411642`（24 行） | **`:14` 同形直比**——`apps/web/test/public-copy.proof.mjs:296` `requireText(…, "MEETWISE_PUBLIC_PREVIEW === '1'", …)` **词面钉本行**（零触硬约束） |
| `apps/web/lib/voice-stream-preview.ts` | `22c236a9`（25 行） | **`:15` 同形直比**（锁读者形③） |
| `packages/ai-runtime/src/voice-stream-preview.ts` | `f276f4ef`（69 行） | **`:23` 同形直比**（锁读者形④·ai-runtime **无** @meetwise/contracts 依赖=package.json :80-82 亲读） |
| `packages/ai-runtime/src/model-client.ts` | `61471ed4`（1179 行） | **`:344` 同形直比**（MODEL_TEXT_STREAM 锁·锁读者形⑤） |
| `apps/api/src/modules/auth/auth.service.ts` | `06c72cc1`（117 行） | **`:57-61` `gateway_auth_signup` 写点（asGateway 自成事务·user_account 此刻已提交）→ `:68-69` `this.issue(id)` 写后签发**·`:63` 23505→409 email_taken（半成功后重注册撞死位）·全仓 `gateway_auth_signup` 产品调用点恰此一处（api-harden proof :109 系测试直调） |
| `apps/api/src/platform/auth-session.ts` | `ad1004e7`（91 行） | **`:39-41` `issueSessionToken` 读 `AUTH_SECRET ?? ''`·`if (!secret) return null`→ `:86-91` `issueSessionTokenOrThrow` 500 `auth_not_configured`**（写后抛错=半成功触发器·`:37` 注记「login/signup 抛 auth_not_configured；改密降级仅 changed——原语义保留」） |
| `packages/db/src/resume/resume.ts` | `f55d772b`（223 行） | **`:13-18` `requireSecret`（`:15` prod 缺失抛·`:16` `length<16` 抛 `too weak (min 16 chars)`）·`:20`/`:22` 惰性工厂 `RESUME_ENC_KEY()`/`CONTENT_HMAC_SECRET()`=首调才校验（#246 首传形正身）**·`:36` `contentDigest` 首调位（上传即触→500）·`:26-29` `keyForVersion` 历史钥回落链·`:11` `IS_PROD=NODE_ENV==='production'` |
| `apps/api/src/platform/env-schema.ts` | `0dc10e7c`（127 行） | **先例形正身（#91 obs-envschema 刀）：`parseCriticalEnv` 纯函数+`assertCriticalEnv` boot fail-fast+`databaseTargetProblem` 恒算 helper 形+issueToProblemCode 稳定码映射**·头注 `:12-20` T1/T2/T3 三档注记（现 T1=AUTH_SECRET+DB 目标·**零 RESUME 双键零 PREVIEW 三态**=本刀扩位） |
| `apps/api/test/env-schema.proof.ts` | `600ea949`（171 行） | **22 臂亲跑全绿（A1-A10/B1-B3/C1/D1/E1-E4/F1-F3）**·`:119` `createPool()`=隔离 PG 依赖（**门=根 `pnpm env-schema:prove` isolated 包装·raw 直跑必红**§0.2-3）·新臂落点 |
| `apps/api/test/public-preview-write-gate.proof.ts` | `5ecf7ee6`（236 行） | `:21` env 键清单·preview 开关臂 `:98`/`:116`/`:127`/`:138`=件②邻面门 |
| `apps/web/test/web-middleware.proof.ts` | `9cc997bb`（98 行） | `:52-72` preview 行为臂·**`:88-91` 非常值 `'true'` fail-closed throw 臂**（`/invalid_meetwise_public_preview/` regex 钉错误词=单源归一后错误词恒等承载） |
| `apps/web/test/web-logic.proof.ts` | `a1548212`（1990 行） | `:706-710`/`:787-791` OCR/voice 锁读者行为臂（锁读者零触的维持承载） |
| `apps/api/test/neg-bend.proof.ts` | `bf616d09`（604 行） | neg authz 段载体（`pnpm neg:bend` isolated·auth.service.ts 触面邻证） |
| `packages/contracts/src/index.ts` | `1050feeb`（1630 行） | 单源住地邻证：contracts package.json exports 现仅 `.`+`./openapi` 两子径（亲读）——件②新子径零触 index 本体 |

### 0.2 漂移登记（派单 brief/登记原文 → `5c8e122c` 现状）

1. **issues-master 仓外**：#244/#245/#246 三行原文协调方持有未入卷——不阻起草（派单 brief 三件原文为内容锚·§立项出处①②·沿 obs-family §0.2-1 Q1 先例）·EXEC 立项时如已入卷照 §0 协议补锚·未入卷则维持仓外登记。**编号同词异源**见 §立项出处④（LEDGER :87 5C-OBS 三行≠本刀三行·防误并）。
2. **#244「API 启动行为分歧」精确化（brief 原文→源级）**：非常值分歧不止 api-web 两肢——api=boot 拒启（main.ts:141 裸 throw·exit 1）·web=进程活每请求/每渲染抛（middleware.ts:97/layout.tsx:37·web-middleware proof :88-91 钦定 throw 形·**无 boot 拒启位**）·锁读者五处=静默 false（`=== '1'` 直比·不 throw）——**同一非常值三种行为**+throw 形本身两份复制（api/web 头注互指 align）·本 §1.1 展开为行为矩阵。
3. **env-schema.proof 运行形登记**：该证 `:119` `createPool()` 需隔离 PG——**门=根 `pnpm env-schema:prove`（run-e2e-isolated 包装）**；本席亲证 raw 直跑（`pnpm -C apps/api prove:env-schema`）15 PASS 后于 db 层 `database_target_missing` 崩出 EXIT=1=**隔离门形非回归**（如实登记防 EXEC 误判·沿 obs-family §0.2-5 贴边登记形）。
4. **#245 与 #91 obs-envschema 刀关系**：boot 期 `assertCriticalEnv`（main.ts:140）已把缺 AUTH_SECRET 进程挡在启动前——运行进程内缺钥 signup 500 在合法部署不可达；**红事实残余=写路径自身零前置校验（不变式悬空于 boot 单点）+半成功中间态机制在卷**（服务级直调/嵌入者/未来 boot 形变更即回归）·brief 盘点口径=机制登记收口·本 §1.2 展开。
5. **web middleware proof 断言数**：本席亲跑 **36 臂全绿**（`prove:middleware`）+`prove:authz5a2-csp` **18 臂全绿**（附 `:51` 注记「空串是非法 preview 值·fail-closed」=PREVIEW 空串非法语义先例锚·件① zod 形不得套 blankToUndefined 的承压点）。

### 0.3 迁移号登记与协调规则（预期零·实证后定）

- 本刀**预期零迁移**（三件=启动校验聚合扩展+PREVIEW 单源归一+signup 校验前置·零 SQL 零新表零 DDL）。**协调规则**：若 EXEC 期复判确需迁移→认领号=EXEC 立项日按届时主线链顶顺延实测·零硬编码本卷号·Ban 抢号 Ban 私占（沿 obs-family §0.3 同款）。

## §1 红事实（brief 三件承引+源级亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 #244：PREVIEW 严格三态前后端各读各+非常值行为分歧（亲读在卷）

三态语义（undefined/'0'→关·'1'→开·其余非法）现行**两份 throw 形复制**：api 真源 `public-preview.ts:40-44` + web 复制 `web/lib/public-preview.ts:6-10`（头注互指「对齐」=零机械保证的漂移面）。另有**五处静默直比锁读者**（`=== '1'`·§0.1 形①-⑤）不抛不聚。**同一非常值（如 `'true'`/`''`/`' 1'`）三进程三行为**：

| 进程/面 | 非常值行为 | 锚 |
|---|---|---|
| api | **boot 拒启**（createApp 内裸 throw→exit 1） | main.ts `:141`→`:317-322` |
| web | **进程活·每请求/每渲染抛**（500/渲染错·无 boot 位） | middleware.ts `:97`·layout.tsx `:37`·web-middleware proof `:88-91` 钦定 throw 形 |
| 锁读者五处（api OCR/web OCR/web voice/ai-runtime voice/ai-runtime model） | **静默 false**（不抛不聚·锁未加） | §0.1 形①-⑤ |

分歧实质：非法配置的失败时点（boot/请求/永不）与失败方式（exit/500/静默）零约定——聚合校验缺位=「非常值只能在 api 进程一处被偶发拦住」。

### 1.2 #245：注册半成功中间态（先落 user_account 再 500·亲读在卷）

`signup` 链：限流三桶（`:45-47`）→ **`:57-61` `gateway_auth_signup` 写点（asGateway 独立事务·提交即 user_account 落定）**→ `:68-69` `this.issue(id)`→ auth-session `:40-41` 缺 `AUTH_SECRET` return null→ `:88-89` `issueSessionTokenOrThrow` 抛 **500 `auth_not_configured`**。中间态=**账户已提交·令牌未签·会话行未落·客户端 500**；客户端重试同邮箱→`:63` 23505→**409 email_taken 撞死**（半成功不可自愈=真伤害面）。#91 刀后 boot 期已挡缺钥进程（main.ts:140·§0.2-4）——残余红事实=**写点前置零校验**：「能走到 gateway 写点」与「签发必成」之间的不变式只靠 boot 单点悬空维持，服务级直调/嵌入者/进程内 env 面变更即回退半成功。login 无先写点（零半成功）·changePassword 降级 changed-only 系 `:37` 注记原语义（均非本刀面）。

### 1.3 #246：RESUME 双键长度仅首传校验·非启动期（亲读在卷）

`resume.ts:13-18` `requireSecret`：`:15` prod 缺失抛·`:16` **`length<16` 抛 `too weak`**——但 `:20`/`:22` 惰性工厂 `RESUME_ENC_KEY()`/`CONTENT_HMAC_SECRET()` 使校验**推迟到首调**：上传链 `:36` `contentDigest`（HMAC 取 CONTENT_HMAC_SECRET）与 `:79`/`:202` blob 加密取 RESUME_ENC_KEY=**首个请求才炸→500**·启动期零校验。env-schema 现收 T1 恰两件（AUTH_SECRET+DB 目标·`:12-20` 头注三档亲读）·RESUME 双键零入册=启动校验聚合缺口正身。

### 1.4 基线读数（起草席本树亲跑 @`5c8e122c`·2026-10-16·全绿在卷）

`pnpm env-schema:prove`（isolated 包装·隔离 PG）**22/22 EXIT=0**·`pnpm -C apps/web prove:middleware` **36 臂 EXIT=0**·`pnpm -C apps/web prove:authz5a2-csp` **18 臂 EXIT=0**·`node scripts/ai-docs/check-docs.mjs` **2202≤cap 2208 EXIT=0**。即：**既有门全绿=本刀为登记缺口收口刀非复绿刀**（三件缺口全在门覆盖外·新臂即新增覆盖）。

## §1-修法（三件+proof 件·零迁移·沿 #91 env-schema 先例形·fail-closed 纪律零触）

- **件① 启动校验聚合扩展（env-schema.ts 单点·#244 api boot 肢+#246 全部）**：
  - `MEETWISE_PUBLIC_PREVIEW` 入 `criticalEnvSchema`：`z.enum(['0','1']).optional()`——**禁套 `blankToUndefined`**（空串按 resolver 语义=非法·authz5a2-csp proof `:51` 注记先例）；`issueToProblemCode` 扩映射稳定码 **`invalid:MEETWISE_PUBLIC_PREVIEW:strict_three_state`**。语义逐字镜像 `resolvePublicPreviewMode`（undefined 过·`'0'`/`'1'` 过·其余含 `''`/`'true'`/`' 1'` 列 problem）。
  - RESUME 双键恒算 helper `resumeSecretProblems(env)`（普通代码·沿 `databaseTargetProblem` 先例形·parse 后并入 problems 一次性列全）：镜像 `requireSecret` 逐字语义——`!v`（undefined/空串 falsy 同支）且 `env.NODE_ENV === 'production'`（镜像 `resume.ts:11` 恒等式）→ **`missing:<KEY>:prod_required`**；`v` 真值且 `v.length < 16` → **`invalid:<KEY>:min_length_16`**；非 prod 缺失→无 problem（dev 默认钥在位=设计如此·`requireSecret :15` dev 支）。
  - `parseCriticalEnv`/`assertCriticalEnv` 形制零改（错误码前缀 `env_schema_invalid` 恒一）；头注 T 档注记随实更新（T3 族补三键·沿 obs-envschema 卷形）。**main.ts 零字节**：`:140` assertCriticalEnv 先于 `:141` resolvePublicPreviewMode→非常值死亡面从 `:141` 裸 Error 升级为 `:140` `env_schema_invalid` 聚合列全（同死形·更全消息·`:141` 在合法值域内成为无害重申）。
  - 联动面零改码：`health.service.ts:96` `configReady` 复用 `parseCriticalEnv`→新检查自动入 readiness 配置位（obs-ready proof F 段同型臂承载）。
- **件② PREVIEW 三态归一单源（#244 各读各收口）**：
  - 真源下移 `packages/contracts/src/public-preview.ts`（**新文件·纯函数零依赖零 process.env 默认参**）：`export function resolvePublicPreview(raw: string | undefined): boolean`——三态形逐字承 api 现行（undefined/'0'→false·'1'→true·else `throw new Error('invalid_meetwise_public_preview')`·**错误词逐字冻结**=web-middleware proof `:91` regex 承载）。contracts package.json exports 增 `"./public-preview"` 子径（**index.ts 零触**·零 churn）。
  - api `platform/public-preview.ts` 改委托：`resolvePublicPreviewMode(raw: unknown = process.env.MEETWISE_PUBLIC_PREVIEW)` 签名面零变（调用面 `:51`/`:60`/main.ts `:141` 零 churn）·错误类/ingress gate 全在本文件零动；web `lib/public-preview.ts` 同委托（middleware.ts `:97`/layout.tsx `:37` 零触）。归一后 throw 形两份复制→机械单源·web/api 漂移面归零。
  - **五处 `=== '1'` 锁读者零字节**（§1.3-3 否决改形）——件①聚合后合法 booted 进程内非常值不可达=直比与单源语义恒等；`public-copy.proof.mjs:296` 词面钉+ai-runtime 无 contracts 依赖=零触双硬约束。
- **件③ #245 注册校验前置（零半成功·写点前移）**：
  - `auth.service.ts` signup：`:56` `hashPassword` 后、`:57` asGateway 写点**前**插前置校验——`if (!(process.env.AUTH_SECRET ?? '')) throw new HttpException({ error: 'auth_not_configured' }, HttpStatus.INTERNAL_SERVER_ERROR);`（条件与 `auth-session.ts:40-41` 失败判据逐字同源·错误词与 `:88-89` 逐字同源）。
  - 效果：`auth_not_configured` 失败类全部前移到**首个写点之前**→user_account 与（令牌+会话行）要么都成要么都不落·该失败类内半成功中间态归零；boot 期 assertCriticalEnv（件①扩展后）维持第一道·写路径自持不变式不再悬空。
  - login/changePassword 零字节（§1.3-6）。
- **件④ proof 新臂（机检基面·EXEC 落值）**：
  - `apps/api/test/env-schema.proof.ts` **22 既有臂逐字维持**+新增纯 parse 臂 ≥6：P1 合法三态（undefined 剔除/'0'/'1'）→ok；P2 非常值（''/'true'/' 1'/'2'）→`invalid:MEETWISE_PUBLIC_PREVIEW:strict_three_state`；P3 RESUME_ENC_KEY 15 字符→`invalid:min_length_16`；P4 恰 16 字符→ok（下界含等号）；P5 NODE_ENV=production 注入缺 RESUME_HASH_SECRET→`missing:prod_required`（非 prod 同态→ok=dev 默认支）；P6 双键同坏+PREVIEW 非法同现→problems 一次列全三问题（聚合不短路）。
  - **signup 前置源级臂 ≥2**（同落 env-schema.proof.ts·沿 obs-family 件②源级臂先例·零新脚本零新 DB 面）：readFileSync `auth.service.ts` 断言（i) AUTH_SECRET 前置校验行 index **<** `gateway_auth_signup` 写点 index（ii) `auth_not_configured` 错误词在场+asGateway 写点恰 1。
  - web 侧零新臂：`web-middleware.proof.ts` 36 臂/`authz5a2-csp.proof.ts` 18 臂零触维持（委托后行为恒等即绿=单源归一的等价性证）。

## §1.3 否决（替代路径·全数否决·越界行使即停止条件）

1. **否决「运行时热加载 env（watch/逐读重校验使非法值可热修）」**：三态/密钥读点逐请求读 process.env 是现制（auth-session.ts:40/锁读者五处）——热加载=每读点加倍校验面+半态窗口（同请求内读到换值）+与 #91「boot fail-fast 一次定谳」先例形相逆；非法值死在 boot 是契约不是缺陷。
2. **否决「本刀做密钥轮转面（AUTH_SECRET_PREVIOUS 窗映到 RESUME_ENC_KEY_V{n} 族/轮转 runbook/在线换钥）」**：`keyForVersion`（resume.ts:26-29）按 blob key_version 选历史钥机制已在轮·轮转编排=部署运维面；本刀只做「在场即合法（prod 缺失即拒）」启动校验·轮转归后刀。
3. **否决「五处 `=== '1'` 锁读者改抛错形/改读单源」**：fail-closed '1'-only 设计如此（各自头注自认+web-logic proof :706-791 行为臂在钉）·`public-copy.proof.mjs:296` 词面钉死 web OCR 行·ai-runtime 无 contracts 依赖（新增依赖=扩触面）——件①聚合后合法进程内语义恒等·改形零收益纯风险。
4. **否决「web 侧加 boot 拒启位（next.config/instrumentation 层启动校验）」**：Next 无 createApp 同位 boot 钩子·强造=新机制越面；web 非常值行为已被 web-middleware proof `:88-91` 钦定为逐请求 fail-closed throw·单源归一（件②）已消漂移面·boot 位诉求归协调方另裁。
5. **否决「会话行与 user_account 单事务化（asGateway+asPrincipal 合流）」**：`gateway_auth_signup`（SECURITY DEFINER 网关路径）与 `auth_user_session` INSERT（principal 角色 GUC 身份）双角色双连接——单事务化=签发机制重架构（违 #91「Ban 大规模重构」先例）；校验前置已达成派单「零半成功」契约（auth_not_configured 类·brief 点名触发器）·残余 DB 故障类半成功如实维持登记（非本刀面）。
6. **否决「前置校验顺手铺到 login/changePassword」**：login 无先写点零半成功面·changePassword 缺钥降级 changed-only 系 auth-session.ts:37 注记原语义保留——扩面 Ban。
7. **否决「AUTH_SECRET 长度/熵校验顺带入聚合」**：#246 登记面只点名 RESUME 双键 <16·AUTH_SECRET 无长度消费点——发明新阈=越面（邻域诉求归协调方）。
8. **否决「RESUME_ENC_KEY_V{n} 历史钥族入启动校验」**：登记面零点名·历史钥缺失有 `??` 回落当前钥链（resume.ts:26-29）语义在先——顺带扩面 Ban。

## §2 验收断言候选（EXEC 门矩阵·pre-exec 双审核对单基面·全过为绿）

1. **neg authz 段门**：`pnpm neg:bend`（isolated）**EXIT=0**——`neg-bend.proof.ts`（blob `bf616d09`）零触承载·断言总数改前亲数冻结改后恒等（auth.service.ts 触面邻证）。
2. **env-schema 门**：`pnpm env-schema:prove`（**isolated 包装·raw 直跑红形=§0.2-3 登记非回归**）EXIT=0——22 既有臂逐字存活（pre/post 清单 diff=恰件④新增·零既有臂 diff）+新臂全绿（预期 ≥28/28）。
3. **write-gate 邻面**：`pnpm public-preview-write-gate:prove` EXIT=0（`public-preview.ts` 委托后行为恒等承载）。
4. **web 邻面三门**：`pnpm -C apps/web prove:middleware`（36 臂）+`prove:authz5a2-csp`（18 臂）+`prove:public-copy`（`:296` 词面钉臂·锁读者零触直证）全 EXIT=0。
5. **obs-ready 邻面**：`pnpm obs-ready:prove`（isolated）EXIT=0（15 臂·configReady 联动面零漂承载）。**EXEC 勘误（pre-exec P2-1·席1）**：臂数 15→**18**（起草误记·EXEC 亲跑 18/18 全绿承载）。
6. **typecheck 门**：`TURBO_DAEMON=false pnpm turbo typecheck --force` EXIT=0（8/8 0 cached 口径）。
7. **lint 门**：root `pnpm lint` + `pnpm -C apps/api lint`（**1421 贴边零余量**）+`pnpm -C packages/contracts lint`（预算 265 内）亲跑实测——零新增 warning 为预期·漂移即停如实登记归因（**Ban 借机修 lint**）。
8. **docs:check 门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（基线 2202·本卷 +1→**2203 ≤ cap 2208 余 5**·>2208 红即停上报·cap sanction 权归协调方）。
9. **markers 门**：改动集（本卷 .md+件①②③ src+件④ proof+contracts 两件）五类标记词零命中+`est live=0` 臂绿——**恰符臂红=协议形承登**（i6-239 历史刀申报面·沿 obs-family §2-8/§7 先例·非本刀新增红）。
10. **diff 面（改动面窄断言）**：EXEC diff（对立项基线）=恰 **8 tracked 路径**——本卷 .md+`packages/contracts/src/public-preview.ts`（新）+`packages/contracts/package.json`+`apps/api/src/platform/public-preview.ts`+`apps/web/lib/public-preview.ts`+`apps/api/src/platform/env-schema.ts`+`apps/api/src/modules/auth/auth.service.ts`+`apps/api/test/env-schema.proof.ts`——五处锁读者/main.ts/middleware.ts/layout.tsx/`packages/ai-runtime`/`packages/db`/`migrations`/SSOT 四卷零文件入 diff（`git diff` 词面机检·typecheck 副产物 tsbuildinfo checkout 回滚沿先例）。
11. **零迁移门**：改动集零 SQL 零新表（§0.3 预期零实证）。

## §3 范围外（边界清单·越界即 FAIL）

1. **零产品码越面**：仅 §2-10 八路径——`main.ts`/`middleware.ts`/`layout.tsx`/五处锁读者/`auth-session.ts`/`resume.ts`/worker src/`health.service.ts` 零字节（件①联动面系零改码复用·承诺兑现位）。
2. **fail-closed 纪律零触**：三态语义逐字冻结（合法值集/错误词/throw 形）·requireSecret 判据逐字镜像不收紧不放松·signup 限流三桶/23505 分码零触。
3. **web 非常值行为形零改**：逐请求 fail-closed throw 维持（web-middleware proof `:88-91` 钦定）·boot 位诉求归 §1.3-4。
4. **共享 SSOT 零改**：LEDGER（含 :87 组标签行）/checklist/batch-residual-plan/issues-master 只读引用——批表三行翻面权归协调方 nail·本刀不宣称行关闭；5C-OBS 同编号三行（§立项出处④）零触不并。
5. **零迁移零依赖升级**（§0.3）·contracts 新子径=exports 条目非依赖变更。
6. **兄弟刀零触**：QUEUE/SSE-API/API-HARDEN 各子刀靶件（#172/#14/#216/#139）零字节零宣称。
7. **锁读者与 ai-runtime/db 零触**（§1.3-3·§2-10）。
8. est live=0（起草 turn·§6）。

## §4 依赖

**①上游已满足**：`5c8e122c` 主线已含 #91 obs-envschema 先例形（env-schema.ts blob `0dc10e7c` 在树·parseCriticalEnv/assertCriticalEnv 形+isolated 门形）+obs-family nail（configReady 联动面）+PREVIEW 三态现行语义（write-gate/web-middleware 两证在钉）。**②无同文件并发**：§0.0 三对表亲证。**③迁移号**：§0.3（预期零）。**④下游**：批表 #244/#245/#246（批5 盘点行·编号同词异源防误并§立项出处④）翻面登记权归协调方 nail（本刀交付读数）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（⛔push·git 写只本 worktree commit）·Ban merge 主线（⛔merge主线）·Ban 自批（pre-exec 双审须独立外席·alone≠dual 不代签）·Ban 弱化断言（22/36/18 既有臂逐字冻结·新臂力不减·§1-件④）·Ban retry-to-green（断言红恰 1 attempt·基建红除外）·Ban 触三态语义与 fail-closed 纪律（§3-2/§3-3）·Ban 触锁读者/main.ts/worker/db/migrations（§2-10/§3-1/§3-7）·Ban 触共享 SSOT 与 5C-OBS 同编号三行（§3-4）·Ban 抢迁移号 Ban 私占（§0.3）·Ban 借机修 lint/cap/协议形红（§2-7/§2-8/§2-9）·Ban 顺带密钥轮转/热加载/AUTH_SECRET 长度/历史钥族（§1.3-1/2/7/8）·Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）·Ban 触其他工作树。

**pins（本卷钉值·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼零消耗）——**刀专项**：PREVIEW 合法值集=**{undefined,'0','1'}**（错误词 `invalid_meetwise_public_preview` 逐字冻结）·RESUME 最小长度=**16**（含等号·<16 即 problem）·prod 缺失码=`missing:<KEY>:prod_required`·聚合前缀=`env_schema_invalid` 恒一·env-schema 既有臂=**22**（亲跑亲证）·web middleware=**36**/authz5a2-csp=**18**（亲跑亲证）·api lint=**1421 贴边**·contracts lint 预算 **265**·docs 基线 **2202**/cap **2208**·迁移=**0**·diff 面=**8 tracked 路径**·est live=0（起草 turn）。

## §6 est live=0（起草 turn）+ EXEC 门预申明

- **起草 turn（本 commit）**：est live=**0**——零模型外呼零 Key 加载零生产操作零消耗（基线 run=纯本地 tsx/node+隔离 PG 容器·用后即焚）。
- **EXEC 期门预申明（授权后方可行）**：①件①②③④落码落位（契约条款逐条对照·Ban 就地改契约）；②§2 十一门全跑全落收据（EXIT 逐门入卷·isolated 门=根包装命令形）；③`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改；④收据落点 `ai-docs/delivery/receipts/boot-validate/`（余量 5 内 EXEC 自裁最小集·越即停上报）+harness 本卷推进注记（append-only）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+EXEC 期五 src/新件+一 proof+contracts 两件+收据）**五类标记词 grep 零命中**（起草席落卷时对本卷亲跑直证·回执随 EXEC 收据留痕·五类词面见 `i6-239-gates.proof.mjs` 运行时组装·不入卷防自指）。**承登（基线红如实）**：`i6-gates:prove` 恰符臂以 i6-239 历史刀申报清单为期望集·任何后继刀必红该臂=**协议形承登**（沿 obs-family §7/queue-shutdown §7 先例）；本刀实质臂=改动集五类词面零命中+`est live=0`+邻面零触+零迁移+SSOT 零触（本刀改动集口径）·全绿为门。

## §8 STOP（开工三条款 + 待双审/EXEC 裁决项）

**STOP · `executed:awaiting_post_prove_dual`（EXEC 已落卷=§9 · post-prove 双审两外席待派 · alone≠dual · Dual PASS ≠ nail（PASS 只过审·nail 须协调方明示授权）。前值 `draft:awaiting_pre_exec_dual`=史录。）** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（含 §8 裁决行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1-修法定稿契约与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号）。**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（env-schema.ts 被他刀改/三态 resolver 语义被改/signup 写点链被改/锁读者词面被改）→停·重 pin 回炉；**机制不满足**=件①②③④落位后 §2-2/3/4 命中红（既有臂非预期外有 diff/新臂不绿/错误词漂）→停·如实升级协调方（Ban 就地改因 Ban 扩面修）；**越界需要**=任何迁移/main.ts/web boot 位/锁读者/SSOT 改动诉求→停·另刀或 §8 裁决行使（Ban 就地修）；**验收红不可修**=门矩阵静态红（typecheck/lint 贴边漂移/docs:check>2208）且根因不在本刀交付面→停·如实登记（Ban 借机修）。

**待双审/EXEC 裁决项**：
- **①RESUME 双键 prod 缺失语义追认（§1-件①）**：镜像 requireSecret=prod 缺失列 problem+非 prod 缺失放行（dev 默认钥）——推荐=追认（逐字镜像零发明）vs prod 无条件必需（破坏 dev 人体工学·反 `:15` dev 支设计）。
- **②signup 前置校验形态追认（§1-件③）**：写点前逐字同源判据（`!(process.env.AUTH_SECRET ?? '')`）+500 同错误词=零行为面新增（仅时点前移）——推荐=追认 vs 提取 auth-session 共享判据 helper（+1 触面文件·收益=防双写漂移·裁决归双审）。
- **③单源住地追认（§1-件②）**：contracts 新子径（index 零触）vs index re-export（authz5a watch 面入邻）——推荐=新子径。
- **④零迁移确认（§0.3）**：预期零；若 EXEC 复判需迁移→§0.3 协调规则。
- **⑤行关闭效力**：EXEC 命中门矩阵全绿+post 双审 BOTH PASS→批5 盘点 #244/#245/#246 三行（仓外 issues-master/协调方持有·编号同词异源防误并§立项出处④）的关闭/翻面登记权归协调方 nail（本刀交付读数·不宣称关闭）。

## §9 EXEC 记录（EXEC 席落卷 2026-10-16·七字段+双审修订五件落点+部署注意呈报·STOP→`executed:awaiting_post_prove_dual`）

**授权链**：起草落卷 `f7815f3d` → pre-exec 双审会签 **PASS×2**（席1 `agent_346a7088`+席2 `agent_94b949a9`·§8 五待裁全追认·修订五件 P2 随 EXEC 落）→ 协调方授权 EXEC → EXEC 本卷（merge `b96ec58f` --no-ff 并 `origin/feat/mysql-schema-skeleton@10799a3e`·派单下界「届时 tip≥10799a3e」等号成立亲证·**零冲突**·⛔pull --rebase 未用）。

**① §0 重 pin**：届树二十 blob（十五主锚+五证锚）全数恒等·停止条件①未触发——详 §0 头「EXEC 重 pin 记」（内含 web-middleware proof 行锚 :92 勘误）。

**② 门矩阵十一门+卫生全表**（并线树 `b96ec58f` 基·交付 commit 前亲跑）：

| # | 门 | 判据 | 实测 | EXIT | 结论 |
|---|---|---|---|---|---|
| 1 | env-schema（根 isolated 包装） | EXIT=0·22 既有臂逐字存活+新臂全绿（预期 ≥28/28） | **30/30 全绿**=既有 22（A1-A10/B1-B3/C1/D1/E1-E4/F1-F3 名录 diff 恰件④新增·零既有臂 diff）+新 8 臂 | 0 | 绿 |
| 2 | write-gate 邻面 | EXIT=0（委托后行为恒等承载） | **110 assertions ✓**（`1`/`null`→throw 词面钉=write-gate proof :69 直转型等价亲证） | 0 | 绿 |
| 3 | web 邻面三门 | middleware 36+authz5a2-csp 18+public-copy 词面钉 | **36 ✓+18 ✓+public-copy 14/14**（static_preflight_valid·:296 `MEETWISE_PUBLIC_PREVIEW === '1'` 词面钉零触直证） | 0 | 绿 |
| 4 | obs-ready 邻面（isolated） | EXIT=0（**18 臂**=P2-1 勘误值） | **18/18 全绿** | 0 | 绿 |
| 5 | neg authz 段门（isolated） | EXIT=0·断言数改前冻结 | **179 条负路径用例全绿**（neg-bend.proof.ts 零触承载） | 0 | 绿 |
| 6 | typecheck | 8/8·0 cached | 8 successful, 8 total · Cached: 0 | 0 | 绿 |
| 7 | lint 五值 | root 5235+api **1421 贴边**+contracts 预算 265 | root **5235** 恰等+api **1421** 恰等（中途 +14 红自纠·见 §9-⑥偏离1）+contracts **265/265** 恰等 | 0 | 绿 |
| 8 | docs:check | EXIT=0·≤cap 2208 | **2205 ≤ 2208 余 3**（§9 落卷后终树复跑值·PTP 公开文字政策含本地路径/标记词两违例中途自纠归零） | 0 | 绿 |
| 9 | markers | 改动集五类词零命中+est live=0 臂绿 | 改动集 8 文件直扫四标记词+行首冲突标记**零命中**（词表沿 `scripts/i6-239-gates.proof.mjs` 运行时组装口径·词面不誊防自匹配）·门 1-4 证尾 est live=0 臂绿在卷 | 0 | 绿 |
| 10 | diff 面 | 恰 8 tracked 路径 | 7 修改+1 新增（`packages/contracts/src/public-preview.ts`）·tsbuildinfo 门副产 checkout 回滚·锁读者五处/main.ts/middleware.ts/layout.tsx/packages/ai-runtime/packages/db/migrations/SSOT 四卷零入 diff（`git status` 词面机检） | 0 | 绿 |
| 11 | 零迁移 | 改动集零 SQL 零新表 | diff 零迁移文件零 SQL（§0.3 预期零实证） | 0 | 绿 |
| 卫生 | frozen-lockfile+est live | lockfile 零改·纯本地 | `pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改 · est live=0（零模型外呼零容器新面·isolated PG 用后即焚）·`actualSpendCny=null` | 0 | 绿 |

**③ 新臂账（件④·恰 8 新·既有 22 逐字零改）**：P1 PREVIEW 合法三态（剔除/'0'/'1'）→ok；P2 非常值（''/'true'/' 1'/'2'）→`invalid:MEETWISE_PUBLIC_PREVIEW:strict_three_state` 单列（空串不视同缺失）；P3 RESUME_ENC_KEY 15 字符→`invalid:min_length_16`；P4 恰 16 字符→ok（下界含等号）；P5 prod 缺 RESUME_HASH_SECRET（ENC 合法注入）→`missing:RESUME_HASH_SECRET:prod_required` 精确单列+非 prod 同态→ok（dev 默认支）；P6 双键同坏+PREVIEW 非法同现→problems 一次列全三（聚合不短路）；P-SRC1 AUTH_SECRET 前置校验行 index<网关写点 index（源级机检）；P-SRC2 `auth_not_configured` 错误词在 auth.service 源+网关写点恰 1。纯 parse 6+signup 源级 2=判据 ≥6+≥2 恰等。

**④ diff numstat（对并线落点 `b96ec58f`）**：auth.service.ts +5/−0（件③）·env-schema.ts +40/−2（件①）·platform/public-preview.ts +6/−3（件②api 委托）·env-schema.proof.ts +47/−0（件④）·web/lib/public-preview.ts +3/−6（件②web 委托）·contracts/package.json +2/−1（件②exports 子径）·contracts/src/public-preview.ts 新增（件②真源）·本 REQUEST +§0 重 pin 记/§2-5 勘误/§8 STOP/§9（harness 推进注记 append-only）。**恰 8 tracked 路径**。

**⑤ 双审修订五件落点（P2 账·全落）**：
- **P2-1（席1·obs-ready 15→18 勘误）**→ §2-5 内联勘误注记+§9 门 4 实测 18/18。
- **P2-1（席1·件② api 委托直转型）**→ platform/public-preview.ts 委托体 `resolvePublicPreview(raw as string | undefined)`——**零类型收窄改写**（无 typeof 分支·非 string raw 不降级 unset）·write-gate :69 `1`/`null`→throw 钉面等价亲证（门 2 110 ✓）。
- **P2-2（席1·件① 纯函数形+两分支并入）**→ `resumeSecretProblems(env)` NODE_ENV 自 env 参取（不读 process.env）·`parseCriticalEnv` success/fail 两分支均并入 resumeProblems（P5/P6 臂承载）。
- **P2-3（席2·web-middleware proof 行锚 :88-91→:92）**→ §0 EXEC 重 pin 记勘误登记（proof 文件零触·blob 恒等）。
- **P2-2（席2·worker 覆盖面维持登记）**→ worker 零 RESUME 消费面（`packages/db` resume.ts 惰性工厂仅 api 上传链消费·worker src 零 import 亲证）·api 侧 boot 聚合+signup 前置校验完备·worker 零字节零臂（diff 面亲证）。

**⑥ 部署注意呈报（P2-1·归协调方/用户）**：件① 聚合扩展生效后，**prod 部署若 RESUME_ENC_KEY/RESUME_HASH_SECRET 任一短钥（<16 字符）将在 boot 即拒启**（`env_schema_invalid: invalid:<KEY>:min_length_16` 聚合列全·前行为惰性首调 500 不挡启动）。compose `${VAR:?}` 仅挡缺省/空串**不挡短钥**（docker/compose.prod.yml:20-21·docker/compose.ha.yml:60-61 亲读）——**现网双钥长度核查归协调方/用户在部署升级前完成**；本刀不改 compose（Ban 面）·呈报即义务履行。

**⑦ 偏离清单（理想零·登记两条非越面自纠/基线漂移）**：
1. **api lint 中途 +14 红自纠（非偏离终局·自纠归因在案）**：件④ 新臂 env 名对象字面量键触发 naming-convention（1435>1421 贴边）——根因在本刀交付面（非「验收红不可修」停止条件·非 Ban 借机修 lint 的「借机」），沿 authz34-chunked-cap.proof.ts 行内豁免先例形（env 名=外部 wire 字面值不可改名）自纠：proof env 注入改成员赋值形（`envWith` helper）+wire 字面基座单点豁免，api lint 复归 **1421 恰等 EXIT=0**。断言强度零弱化（同键同值臂逐字等价·门 1 复跑 30/30）。
2. **docs:check 基线漂移登记（非违约）**：任务书 §2-8 预期「本卷 +1→2203 余 5」——merge 携入 worker-hang-guard nail 使并线树基线=2203（origin tip 卷尾亲证值），本刀落卷后终树复跑=**2205 余 3 ≤ cap 2208**（contracts 新受管文件 +1+worker 卷 managed 计入差 +1·如实登记防误判）；§9 手迹两违例中途自纠（markers 行误誊四词面+七字段行本地路径各 1·PTP 红→归零复绿 EXIT=0）。

**⑧ pins 零翻声明+停止条件判定**：§5 pins 全值对届树复验恰等（PREVIEW 合法值集 {undefined,'0','1'}/错误词逐字冻结/RESUME 最小 16 含等号/prod 缺失码/聚合前缀 `env_schema_invalid`/22·36·18 臂/typecheck 8/8/lint 三值/docs cap 2208/迁移 0/diff 8 tracked/est live=0）。停止条件四类逐条判定：①现场漂移——**未触发**（二十 blob 恒等）；②机制不满足——**未触发**（既有臂零 diff+新臂全绿+错误词恒等）；③越界需要——**未触发**（零迁移零 main.ts/锁读者/SSOT/web boot 位诉求）；④验收红不可修——**未触发**（唯一中途红 lint +14 根因在交付面·自纠复绿）。

**⑨ 七字段（SOP trace）**：
- **任务类型**：EXEC 席落码（boot-validate 启动校验三态小刀·契约定稿四件+十一门矩阵·L2+ 经 pre-exec 双审 PASS×2+协调方授权链）。
- **工作区范围**：worktree `meetwise-bv`（仓根同级·分支 `line/boot-validate`·恰 8 tracked 路径·零他树触碰）。
- **来源证据**：任务书 §0 二十锚重 pin 全恒等+§1 红事实三件源级亲读（本卷在卷）+门矩阵十一门 EXIT 收据（§9-②）+双审修订五件（协调方派单令载·落点 §9-⑤）。
- **已读文档**：本任务书全文·`AGENTS.md`·`ai-docs/README.md`·`ai-docs/meta/task-sop.md`·worker-hang-guard-REQUEST §9.8（EXEC 记录先例形）·`scripts/i6-239-gates.proof.mjs`（markers 词表运行时组装口径）·`packages/config/eslint.config.base.mjs`（naming-convention 形）+件①②③④八路径源文件全文。
- **跳过文档及原因**：`ai-docs/rules/*`（本刀零新规则面·契约由任务书 §1-修法定稿承载）·`ai-docs/product|requirements|architecture/*`（契约定稿面零涉·起草席已按 §0 亲证消费点）——L2+ 治理以双审会签+任务书契约为准·非 freehand。
- **结论状态**：`executed:awaiting_post_prove_dual`（EXEC 落卷·门矩阵全绿·post-prove 双审两独立外席待派·行翻面权归协调方 nail）。
- **验证命令**：§9-② 全表 11 门+卫生逐条亲跑 EXIT 在卷（env-schema/write-gate/middleware/authz5a2-csp/public-copy/obs-ready/neg:bend/typecheck/lint×3/docs:check/frozen-lockfile/markers/diff 机检）。

---

*BOOT-VALIDATE REQUEST · 2026-10-16 起草 · **STOP=`executed:awaiting_post_prove_dual`（EXEC 落卷=§9·post-prove 双审两外席待派·前值 `draft:awaiting_pre_exec_dual`=史录）** · EXEC 并线=merge `b96ec58f` --no-ff 并 `origin/feat/mysql-schema-skeleton@10799a3e`（下界等号成立亲证·零冲突）· 起草 base=`feat/mysql-schema-skeleton` @`5c8e122c`（本席亲 fetch·origin tip 等号成立亲证·⛔pull --rebase 未用）· 分支 `line/boot-validate` · 工作树 `meetwise-bv`（本起草席立·建前 branch/worktree/同名卷三查不存在）· 立项出处=协调方派单 brief（批5 盘点席 Top4·三件一卷零迁移）+三件原文源级亲证成立（#244 三态两份 throw 形复制+五处静默直比·同一非常值 api boot 拒启/web 逐请求 500/锁读者静默 false 三行为分歧 + #245 gateway 写点→issue 500 半成功中间态·重试 409 撞死 + #246 requireSecret <16 惰性首调·启动零校验）· 修法三件+proof 件=env-schema 聚合扩展（preview 严格三态+RESUME 双键 min16/prod 缺失·稳定码三项）+PREVIEW 单源下移 contracts 子径（api/web 委托·锁读者零触）+signup 校验前置（auth_not_configured 前移写点前·零半成功）+22 既有臂冻结+新臂 ≥8 · 触面=8 tracked 路径恰类 · 零迁移零锁读者触零 SSOT 触 · est live=0（起草 turn）· markers=0（恰符臂协议形承登）· 停止条件四类全设未触发 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · ⛔push · ⛔merge主线 · STOP*
