# AUTHZ-34-RESIDUAL REQUEST（AUTHZ 残面小刀 · #34 三半之②③ · ①scrypt 异步化（promisify 形）+②chunked 封顶钩子 · 零迁移 · docs-only 落卷即停）

**Status**: **`closed`**（2026-10-15 卷主翻面·协调方授权批量滞后卷 Status 对账翻面·沿 ag37/ag-cost5/ha-6 状态行翻面先例·一行依据=checklist「Line AUTHZ-34 nail」段 :2637 已载 post 双审 BOTH PASS+nail merge @`ed82b873`（对 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0）——原 `executed:awaiting_post_prove_dual` 系滞后登记 · est live=0 · Ban self-approve · alone≠dual · ⛔push）

**席位**：AUTHZ #34 残面小刀起草席（批5 AUTHZ-HARDEN 续刀 · 5A-1 账号会话簇已 nailed @`5cb78dab` 之后 · #34 三半中残 2/3 的收口刀）。
**基线**：`feat/mysql-schema-skeleton` @ `8d1ff99e`（pull 后主线 tip · `git log -1` 实测 2026-10-13 · fix(ci) provider-egress 出站清单补账）。分支 `line/authz-34-residual` · 工作树 `meetwise-a34`（`git worktree add ../meetwise-a34 -b line/authz-34-residual 8d1ff99e` 本起草席已立 · 建前 worktree list 30 树无 a34 + `git branch --list line/authz-34-residual` 空输出双查亲证 · HEAD 落 `8d1ff99e` 亲证）。
**蓝本**（不自建 SSOT 行——行翻面权归协调方）：①主卷 `ai-docs/delivery/harness/authz-harden-REQUEST.md` §1 簇② #34 行 `:97`（修法权威——「scrypt 同步改异步（worker_threads 或 node:crypto async 形·EXEC 定）；`main.ts:149-157` 1MiB 钩子对无 content-length 请求按流计数封顶（或反向代理层限制·二选一）」·本刀派单将「EXEC 定」**钉死为 promisify 形**=子裁决收窄呈报 §1-修法①）；②审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` **`:375`** #34 行逐字（§0.2 誊录）；③主卷 §0.5 **R8 防漂铁律** `:71`（worker_threads 关键词横跨 #34×#108 两域——严禁漂入 resume-extract 面 · 本刀 §1-①/§3-1/§5 逐字承袭）+ §9/§9.1（`:163`/`:175` 5A-1 nail 登记=**已落半的边界权威 · 避免重复施工**）；④LEDGER `:85` 5A 行（「#33/#34/#90/#180 login 面」字面 · 5A-1 主体已并 · SSOT 翻面滞后如实登记 §0.4）；⑤形制沿 `ag-d-admission-REQUEST.md`（§0-§8 · Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读 · base `8d1ff99e` · file:line 逐条 Read/rg/sed/git ls-tree 实测复核 · **EXEC 立项照本节重 pin**——基线漂移如实改锚 · 结论不变则只更行号）

### 0.1 锚表（blob `git ls-tree` 亲算 · 行锚 Read/rg 亲证）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `packages/domain/src/auth.ts` | `0184b5b9` | **scryptSync 恰两处**：`:6` import（`import { scryptSync, randomBytes, createHmac, createHash, timingSafeEqual } from 'node:crypto'`）· **`:11`** hashPassword 体内 `const dk = scryptSync(password, salt, 32)` · **`:36`** verifyPassword 体内 `const dk = scryptSync(password, Buffer.from(saltHex, 'hex'), 32)` · `:38` `timingSafeEqual(dk, expected)` 恒时序比对 · `:9-13` hashPassword 同步形 · `:15-16` LOGIN_DUMMY_HASH（5A-1 #33 假哈希·`scrypt$<32hex>$<64hex>` 同形）· `:23-25` verifyLogin（注入 verify 默认=verifyPassword · **`:24` domain 内部唯一转发点**）· `:33-39` verifyPassword 同步形 |
| `packages/domain/src/index.ts` | `e4ae6e7a` | `:103` 导出行（hashPassword/verifyPassword/signToken/verifyToken/verifyTokenFull/keyIdFor/normalizeEmail/verifyLogin/LOGIN_DUMMY_HASH——修法后**导出名集合零变·仅签名形变**） |
| `packages/domain/src/resume-extract.ts` | （blob 不列 · R8 面） | **R8 防漂面位亲证**：与 auth.ts 同包（packages/domain/src）——修法①零触本文件（#108 worker_threads terminate · 🔒DEPS S3 不收） |
| `apps/api/src/modules/auth/auth.service.ts` | `616d406e` | `:13-15` RL_SIGNUP_IP env 双值形（「容量,速率」先例）· `:21-26` RL_LOGIN_IP/RL_LOGIN_GLOBAL env 覆写口（5A-1 R2 已落）· `:45` signup normalizeEmail 接线（已落）· **`:57` hashPassword 调用点**（signup · `[id, email, hashPassword(password), role]` 嵌 query 实参 · 同步 · 零 await）· **`:74-79` 已落半=登录校验**（password 类型/≤128 + `Credentials.shape.email.safeParse` · 5A-1 #90/#34-login 落线）· `:82-85` login 三桶 per-email→ip→global（已落）· **`:94` verifyLogin 调用点**（login · `const passOk = verifyLogin(u?.password_hash, b.password)` · 同步 · 零 await）· `:86-89` gateway_auth_login 查询 |
| `apps/api/src/modules/auth/auth.controller.ts` | `dea7229f` | `:22-24` 「登录**故意不**套 Credentials pipe」两理由注释 + 5A-1 裁决项② service 侧最小化接线注（主卷 §0.1 旧锚 `:21` 现漂 `:22-24` · 如实更注）· `:25` login 方法零 pipe |
| `apps/api/src/modules/profile/profile.service.ts` | `25830033` | `:20-28` RL_CHGPWD/RL_CHGPWD_IP/RL_CHGPWD_FAIL env 三口（5A-1 R2 已落）· `:124-128` 入口双桶+失败锁（已落）· **`:132` verifyPassword 调用点**（changePassword 旧密复核 · 同步 · 零 await）· **`:141` hashPassword 调用点**（changePassword 新密 · `[principal, hashPassword(newPassword)]` 嵌 query 实参 · 同步 · 零 await）· **`:170` verifyPassword 调用点**（deactivate 密码复核 · 同步 · 零 await · **派单未列·本起草席 rg 实测增列**） |
| `apps/api/src/main.ts` | `7199c6df` | `:124` `bodyLimit: 12 * 1024 * 1024`（FastifyAdapter · **12MiB 传输信封**）· `:154-156` 1MiB 钩子注释（「在 body 缓冲/JSON.parse **之前**(onRequest)按 content-length 拒掉超大请求…不会先缓冲 11MB + 同步 parse 阻塞事件循环」——**该注释对 chunked 请求不成立=注释-实现不符面 · 随修法如实化**）· `:157` UPLOAD_ROUTES（`/\/resume\/file$/` + `/\/interview\/[^/]+\/transcribe$/` 两正则）· `:158` SMALL_BODY_LIMIT=1MiB · **`:159-166` 1MiB 钩子**（主卷 §1 簇②旧锚 `:149-157` 现漂 `:159-166` · +10 · 如实更注）· **`:160` `Number(req.headers['content-length'] ?? 0)` 只读 content-length**——chunked（无 content-length）时 len=0 → `len > SMALL_BODY_LIMIT` 恒假 → **恒放行 → 回落 fastify bodyLimit 12MiB 信封** |
| `packages/contracts/src/index.ts` | `7deeccfc` | `:11` 上限注释（「email 封 254(RFC 5321)，password 封 128：上限防超长输入把 scrypt 变 CPU DoS 面」）· `:12` `Credentials = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) })`（已落半的校验形源） |
| `apps/api/test/authz5a-constant-time.proof.ts` | `b5d62797` | `:21-24` countingVerify **同步签名注入形** `(pw: string, stored: string) => boolean`（await 化预申明改写点·与 :42 假哈希臂同列 · §2-3）· `:27`/`:33` verifyLogin 两注入臂（missing/existing）· `:37` 计数相等断言 · `:42` 假哈希真跑 scrypt 臂 · `:47-55` auth.service 静态接线断言（单点 verifyLogin/零直呼 verifyPassword/R4 ≤128/三桶/env 口） |
| `apps/api/test/_neg-harness.ts` | `f2bebb42` | `:29-36` Harness 接口（req/send/post/patch/raw/U——`raw: (method, path, headers, rawBody)` `:35` · fetch 形恒带 content-length）· `:180` `hashPassword('oldpass12')` 种子（pwUser/pw@x.com）——**异步化随翻点** |
| `apps/api/test/validate.ts` | `3b366def` | `:190` `hashPassword('oldpass12')`+`hashPassword(['deactpass','12'].join(''))` 两调用——**异步化随翻点** |
| `packages/domain/test/auth.proof.ts` | `2df1cee5` | `:6-10` 五臂（verifyPassword∘hashPassword roundtrip/错密拒/随机盐/无明文/畸形 stored）——**异步化随翻点（await 化改写）** |
| `apps/api/test/neg-commerce.proof.ts` | `32f1d69f` | `:24` 传输层注释（「非上传路由 content-length>1MB → onRequest 直接 413 payload_too_large(body parse 之前)」）· `:310-312` create/oversized→413 · `:530-532` webhook/oversized→413（**既有 1MiB 钩子回归双臂 · status-only 断言形**） |
| `apps/api/test/authz5a2-password-max.proof.ts` | （邻接门 · blob `git ls-tree` 可取） | `:36` 静态 R4 witness（login service ≤128 在位）· `:46` 「login 129 密码 → 400(service 最小校验·**scrypt 零执行**)」——login 面邻接门 · 本刀回归清单 |
| `package.json`（root） | `90f14cb5` | `:8` docs:check · `:22` typecheck · `:98` neg:auth · **`:99-104` authz5a 六门**（normalize/mirror/constant-time/login-ip-throttle/login-global-throttle/chgpwd-lock） |
| `apps/api/package.json` | `d7791624` | `:13-19` authz5a×4+authz5a2×3 门接线区（新门 additive 接线位） |
| `scripts/run-e2e-isolated.mjs` | （现行值 EXEC 重 pin） | `:95-102` target→文件清单注册表（authz5a 族在案）· `:1968-1970` 门清单 · `:2377` 命令映射——新 proof 三处 additive 注册位（AG-D 先例「白名单/文件清单/命令映射」） |

### 0.2 issues-master #34 行逐字誊录（`:375`）

`| #34 | P3 | 技术缺陷 | 注册/登录 | login 不挂 ZodValidationPipe，密码 max(128) 在登录路径不生效；非上传路由有 1MiB 钩子，chunked 可回落 12MiB | apps/api/src/modules/auth/auth.controller.ts:19-22；apps/api/src/modules/auth/auth.service.ts:41-43；packages/contracts/src/index.ts:12；apps/api/src/main.ts:38,56-67 | 仍存在 | 已核实（chunked 回落为推断） | login 挂 ZodValidationPipe(Credentials)，并改 scrypt 为异步 | #84、#123、#180 | — | 第5批-A 安全/鉴权 | … |`

**三半刻画**（5A-1 已落半亲证 + 残 2/3）：①**登录校验半=已落**（auth.service.ts:74-79 Credentials 接线 + controller `:22-24` 注释如实化——主卷 §1 簇②「#90/#34-login 校验」5A-1 交付 · 避免重复施工）；②**scrypt 异步半=残（本刀修法①）**；③**chunked 钩子半=残（本刀修法②）**。issues 行修法「login 挂 ZodValidationPipe(Credentials)」已被 5A-1 裁决项②以 service 侧最小校验等价收口（主卷 §1 簇② · controller pipe 零挂是裁决非遗漏）——本刀**零触 controller 校验面**。

### 0.3 fastify 5.12.5 依赖源码实证（chunked 残面精确化 · 起草席亲读）

依赖版本：`fastify@5.12.5`（apps/api package.json 亲证）。源码 `node_modules/.pnpm/fastify@5.12.5/node_modules/fastify/lib/content-type-parser.js`（主仓 node_modules 亲读 · worktree 未装依赖如实登记 · 同版本锁文件可复现）：

1. 默认 JSON parser 以 `asString=true` 注册（`:37` `new Parser(true, false, bodyLimit, …)`）→ `ContentTypeParser.prototype.run` 对 asString/asBuffer 一律走 `rawBody`（`:214-216`）；
2. `rawBody`（`:245` 起）**双闸**：①content-length 预检（`:248-253` `if (contentLength > limit) → FST_ERR_CTP_BODY_TOO_LARGE`）②**流计数**（`:255-281` `receivedLength += chunk.length` · `if (receivedLength > limit || receivedEncodedLength > limit) → FST_ERR_CTP_BODY_TOO_LARGE`）——②不依赖 content-length 头存在；
3. **结论（升格审计推断为实证）**：fastify bodyLimit 12MiB（main.ts:124）对 chunked 请求**实际生效**（超限 413）。issues-master :375「chunked 回落为推断」中的回落事实成立、回落值 12MiB 成立；**残面精确化=非上传路由 1MiB 差异化封顶对 chunked 失守**：chunked 攻击者可对任意非上传端点（含 /auth/login 等 KB 级端点）推送至 12MiB body，传输边界不 413 → 缓冲 12MiB + 同步 JSON.parse——恰为 main.ts:154-156 注释声称防住的 DoS 放大面（该注释对 chunked 不成立）。

**勘正登记（派单字面 vs 实证）**：派单修法②「与 express.json limit 对齐不重复」——本仓 body 解析器=**Fastify bodyLimit**（main.ts:124 · FastifyAdapter :120-136），express 零依赖（全仓 package.json manifests rg `"express"` 零命中亲证）——对齐目标如实改述为「与 bodyLimit 12MiB 信封对齐 · 不重复其职责」。

### 0.4 现势并发登记（强制）

1. **5A-1 已并主线**：`git merge-base --is-ancestor 5cb78dab HEAD` EXIT=0 亲证（`5cb78dab` = merge(authz-harden): 5A-1 账号会话簇 nail）；码面锚（normalizeEmail/verifyLogin/kid/jti/0169 会话表/logout）全在证（§0.1）。**SSOT 翻面滞后如实登记**：LEDGER `:213`/`:216` 与 execution-master-checklist `:2276`/`:2345` 仍载「5A-1（簇①②③）未开工」，而 checklist `:2529`（CI-WIRING nail 复验段）已亲证「authz-harden 5A-1 @5cb78dab 并主线所携」——同卷内部不一致即翻面滞后实证。**本卷零改 SSOT**（翻面权归协调方 · EXEC 立项时以届时 SSOT 现值重 pin 本节）。
2. 建前主仓工作树 30 worktree 实查（git worktree list）无第二 a34 树无同名分支；`rg -l "authz-34|AUTHZ-34" ai-docs/delivery/harness/` 零命中（EXIT=1 亲证）——**无同名卷 · 防重检查过**。
3. 本刀触面文件（packages/domain/src/auth.ts · apps/api/src/modules/auth/profile · apps/api/src/main.ts · 对应测试面）在建前 worktree list 中无他刀登记同文件在飞声明（§4-② · EXEC 时复核）。
4. **lying-CL 残面登记（rev2 双审登记不阻）**：仓库根 `CLAUDE.md`（`:9`）现势失实段——「8 reproducible gates」「`apps/web` … still planned, not built」与现势不符（rev2 席亲证：`apps/` 实查 api/web/worker 三包在位 · root package.json 门 roster 已远超 8）——归**后续续刀**修 · 本刀 docs-only 恰 1 .md 零触 CLAUDE.md=Ban 除外合法（登记不修）。

### 0.5 数字口径（rg 实测为准 · 偏差熔断）

- **scryptSync 定义点**：`rg -n "scryptSync" packages/domain/src/auth.ts` 恰 3 行（:6 import/:11/:36 · 调用恰 2）——修法后该 rg 须 EXIT=1（0 命中）=修法①静态验收。
- **生产调用点**：`rg -n "hashPassword|verifyPassword|verifyLogin" apps/ packages/ --glob '!**/test/**' --glob '!**/*.proof.ts' --glob '!**/node_modules/**'` 排除定义/导出/注释行后**恰 5 调用点**=auth.service.ts:57/:94 + profile.service.ts:132/:141/**:170**（派单列 4 处 · :170 deactivate 密码复核为本起草席 rg 实测增列）+ domain 内部唯一转发点 auth.ts:24（verifyLogin→verify 默认绑定）=**await 化触点 6**（派单「六调用点」口径与 rg 实测对勘恰合）。**EXEC 实跑调用点计数 ≠5（±0 熔断）即停手上报**。
- **测试面触点 4 文件**（签名异步化随翻清单）：_neg-harness.ts:180 · validate.ts:190 · packages/domain/test/auth.proof.ts:6-10 · authz5a-constant-time.proof.ts:21-24/:27/:33/:42。
- **门基线值**（§9.1 补登-E 沿承 · EXEC 收据逐门登记原值）：authz5a:normalize:prove 15 臂 · authz5a:mirror:prove 15 臂 · authz5a:constant-time:prove 16 臂 · neg:auth `A(`=90（3 基线红=deactivate 三臂沿补登-D 恒等登记不洗）。

## §1 红事实 + 修法（两件 · 零迁移）

### 1.1 红事实（两半）

- **A. 事件循环阻塞面（scrypt 同步）**：node:crypto scryptSync 默认参（N=16384/r=8/p=1）单次派生 ~数十 ms 纯 CPU，跑在事件循环主线程。四条生产路径全同步：signup（:57 hashPassword）· login（:94 verifyLogin——**含 #33 恒时序假哈希臂，账户不存在也同步跑满 scrypt**）· changePassword（:132 verify + :141 hash 连跑两次）· deactivate（:170 verify）。并发期 head-of-line 阻塞放大全部请求尾延迟；#120 失败锁已收「无限试旧密码放大」的**次数面**（profile.service.ts:127-128），但单次仍同步阻塞——async 化是次数面收口后的自然补全。
- **B. chunked 回落面**：main.ts:159-166 钩子只读 content-length（:160）——chunked（无 content-length）恒放行 → 非上传路由回落 12MiB 信封（§0.3 实证）——差异化封顶（上传 12MiB/非上传 1MiB）对 chunked 失守；注释面（:154-156）与实现对 chunked 的实际行为不符。

### 1-修法

**修法① scrypt 异步化（promisify 形 · 派单钉死=主 REQUEST 簇②「worker_threads 或 node:crypto async 形·EXEC 定」之子裁决收窄呈报）**：

- `packages/domain/src/auth.ts` import 换形：`import { scrypt as scryptCallback, randomBytes, createHmac, createHash, timingSafeEqual } from 'node:crypto'` + `import { promisify } from 'node:util'` + `const scrypt = promisify(scryptCallback)`；
- `hashPassword`（:9-13）→ `async`：`const dk = await scrypt(password, salt, 32)`——**参数三参形零改**（`(password, salt, 32)`·promisify 形与 scryptSync 共享默认 N=16384/r=8/p=1 → 派生输出逐字节等价 → **存量 password_hash 零重哈希=零迁移根基**）；
- `verifyPassword`（:33-39）→ `async`：`const dk = await scrypt(...)` · **`timingSafeEqual` 比对保持同步恒时序**（:38 形零变——异步化只移 KDF·不移比对）；
- `verifyLogin`（:23-25）→ `async`：注入 verify 形换 `(password, stored) => Promise<boolean>` · LOGIN_DUMMY_HASH（:15-16）零改 · 「verify 恰调用一次与账户存在性/状态无关」语义零变；
- **生产调用点 5 处全 await 化**：auth.service.ts `:57`（**hoist 出 query 实参**：`const hash = await hashPassword(password)` 置 try 前——等价注记：hoist 后 scrypt 异常不经 `errCode(e)==='23505'` 分支而直抛·该分支本就对非 23505 错 `throw e` 照抛 = 行为等价）· `:94`（`await verifyLogin(...)`）；profile.service.ts `:132`（`await verifyPassword(...)`）· `:141`（**hoist**：`const newHash = await hashPassword(newPassword)` 后入 query 实参 · **hoist 位置钉死=verifyPassword 错密分支（:132-136）后、UPDATE query（:141-143）前**——错密早抛路径零新密 scrypt 计算 · rev2 双审 N3 登记）· `:170`（`await verifyPassword(...)`）；
- **登录/改密两路径性能注记**（随注释落码）：scrypt 转入 libuv 线程池（UV_THREADPOOL_SIZE 默认 4）·单请求工作量不变·并发吞吐提升 + 事件循环零阻塞；限流桶扣减序零变（`rl.allow`/`hasToken` 先于 verify 的既有序保留 · 桶参数/env 口零改）；改密路径两次 scrypt 连跑计数不变（verify→hash 顺序保留）；
- packages/domain/src/index.ts:103 导出名集合零变（仅 JSDoc/签名形变·如触注释行如实更新）；**零 worker_threads 引入**（R8 · §3-1）。

**修法② chunked 封顶钩子（机制钉死 · 阈值=裁决项①两案并陈）**：

- **触发条件**=请求无 `content-length` 头（覆盖 `transfer-encoding: chunked` 主形 + HTTP/1.0 close-delimited 罕形——沿主 REQUEST 簇②「无 content-length 请求按流计数」字面）；
- **机制**=Fastify `preParsing` 钩子挂流计数（onRequest 生命周期拿不到 body 流 · preParsing 收 body stream——计数包装转发 · 超阈即 `reply.code(413).send({ error: 'payload_too_large' })` 与既有 1MiB 钩子同信封同错码）；路由分流**单源复用** UPLOAD_ROUTES（:157）与 SMALL_BODY_LIMIT（:158）· **零新正则零新常量**；上传路由零增钩（fastify bodyLimit 12MiB 流计数已兜底 = §0.3 实证 · **不重复**）；GET/HEAD 无体请求流计数恒 0≤限 · **零特判零新分支**；
- **阈值两案并陈（§8 裁决项①）**：**案A（推荐）**=非上传路由无 content-length 时封 SMALL_BODY_LIMIT(1MiB)——chunked 与 content-length 两路同政策 · 真闭合 #34「chunked 可回落 12MiB」差异面（主 REQUEST 簇② 1MiB 钩子修法字面的直接兑现）；**案B（派单字面「流计数封顶 12MiB」）**=无 content-length 一律流计数封 12MiB——与 fastify bodyLimit 职责重复（§0.3 实证 · 12MiB 对 chunked 已生效）· 对 1MiB 差异面**不闭合** · 如实登记为纵深防御等价形（若裁案B·§2-2 第一臂断言值随改 ≥12MiB 触发）；
- main.ts:154-156 注释随修法如实化（补「无 content-length（chunked）按流计数封顶」· 注释-实现相符 · 沿 #33 注释如实化先例）。

## §2 验收断言候选（门预申明 · pre-exec 双审核对单基面 · 断言力≥3）

1. **新 proof 异步臂**（`apps/api/test/authz34-scrypt-async.proof.ts` · run-e2e-isolated 隔离容器形）：①静态：`rg "scryptSync" packages/domain/src/auth.ts` 零命中 + promisify/scrypt import 在位 + `timingSafeEqual` 仍在位（恒时序比对保持）；②**参数等价正证**：`await promisify(scrypt)(pw, salt, 32)` 与 `scryptSync(pw, salt, 32)` 输出逐字节相等（存量哈希兼容的机械证明）；③**计数证恒等**：verifyLogin 注入 async 计数 verify（沿 authz5a-constant-time.proof.ts:21-37 形异步化改写）——missing/existing 恰各 1 次·计数相等；④Promise 形：hashPassword/verifyPassword/verifyLogin 调用返回 instanceof Promise；⑤HTTP 面：signup→login roundtrip 200 + 错密 401（neg-auth 同口径）+ **deactivate 错密臂**：POST /profile/deactivate 错密 → 401 `wrong_password` 且账户 `status` 未动（DB 直查仍 `active`）——本臂落本新 proof·neg:auth 90 臂原值不扰动（§0.5·含 3 基线红 deactivate 三臂恒等登记）+ 并列静态 witness 臂：生产面 `await hashPassword|await verifyPassword|await verifyLogin` rg 计数恰 5（§0.5 五生产调用点 await 形在位 · ±0 熔断）。
2. **新 proof chunked 臂**（`apps/api/test/authz34-chunked-cap.proof.ts` · 同隔离形）：①chunked（无 content-length · node:http ClientRequest 写体不设 content-length → Node 自动 transfer-encoding: chunked——harness 现有 req/send/raw 三 helper 均 fetch 形恒带 content-length（_neg-harness.ts:29-36）· 新增 **additive** chunked helper 零改既有 helper）1MiB+α 至非上传路由（/commerce/orders）→ **413 payload_too_large**（案A 阈值形）；②chunked KB 级正常体 login（种子 pwUser=_neg-harness.ts:180）→ 200（body 真解析非 413）；③chunked >12MiB 至上传路由 /resume/file → 413（fastify bodyLimit 兜底 · **status-only 断言沿 neg-commerce :312/:532 形 · 信封 body 不钉**——fastify CTP 错误信封与 app 信封异形属既有事实如实登记）；④既有 content-length 1MiB 双臂回归：neg-commerce.proof.ts:310-312/:530-532 原值；⑤**chunked 注入 RST 容忍注记（rev2 双审登记）**：服务端 413 提前断流形下 node:http 写侧可能 ECONNRESET/EPIPE——chunked helper 按「响应已达则以 status 断言 · 写侧 RST 不另行判红」容忍形实现 · 响应未达不得绿判（门红如实上报）。
3. **六门回归**（root package.json:99-104 · 全 EXIT=0 臂数原值）：authz5a:normalize:prove（15 臂）· authz5a:mirror:prove（15 臂 · packages/db prove:authz5a-mirror 形·非 run-e2e-isolated）· authz5a:constant-time:prove（16 臂 · **预申明臂改写点=constant-time proof 计数注入形（:21-24/:27/:33）+假哈希臂（:42）随 await 化改写·臂数 16 零变**）· authz5a:login-ip-throttle:prove · authz5a:login-global-throttle:prove · authz5a:chgpwd-lock:prove。
4. **邻接面回归**：neg:auth（90 臂·3 基线红 deactivate 三臂恒等登记不洗——本刀 await 化恰触其 hashPassword 种子路径·红面零增）+ authz5a2:password-max:prove（:36 静态 R4 witness + :46 login 129→400 scrypt 零执行臂零翻）+ packages/domain 既有 test（auth.proof :6-10 await 化改写）+ validate.ts/_neg-harness.ts 两处种子 await 化随翻。
5. **typecheck 权威形**：`turbo typecheck --force` 3/3 + 根 `pnpm typecheck` EXIT=0——typecheck 仅捕获比较位漏 await（TS2367）·三生产点（auth.service.ts:94 `&&` 形·profile.service.ts:132/:170 `!` 形）经 tsc --strict 实证不报——漏 await 防线=运行时 HTTP 臂（proof⑤+neg-auth:351）。
6. markers=0（§7）+ est live=0（§6）双声明入收据 + **docs:check EXIT=0**。

## §3 范围外（边界清单 · 越界即 FAIL）

1. **R8 防漂铁律（主卷 §0.5 R8 逐字承袭）**：worker_threads 关键词横跨两修法域=#34（本刀 scrypt 改异步）×#108（resume-extract worker_threads terminate · 🔒DEPS S3 不收）——**本刀实施严禁漂入 resume-extract 面**（packages/domain/src/resume-extract.ts + apps/api resume 摄取链零字节）；修法①钉 promisify 形 · **零 worker_threads 引入**（node:crypto async 跑 libuv 线程池 · 非 worker_threads · 注释不得宣称 worker_threads）。
2. **#108/#109 上传守卫四守卫面零触**（🔒DEPS S3）——UPLOAD_ROUTES 清单（:157）**只读复用 · 零增删条目**（上传路由政策面归 DEPS-AUDIT 域）；bodyLimit 12MiB 值零改（#70 勘误既定值 · 主卷 §1 簇④面）。
3. **#33/#90/#120/#180 已落面零重施工**：恒时序形/桶序与参数/Credentials 接线/失败锁（auth.service.ts:21-26/:45/:74-79/:82-85 · profile.service.ts:20-28/:124-128）零改——本刀只 await 化不改断言/参数/序（六门臂数原值=防重复施工机械闸）；controller 校验面零触（§0.2 三半刻画①）。
4. **零迁移**：scrypt 参数等价 → 存量 password_hash 零重哈希；两修法均无 DDL；**零新迁移文件 · 历史迁移 0001-0179 零字节**（本刀改动域=码面+测试面+门接线面三类）。
5. **apps/worker 零触 · apps/web 零触**（#34 面=apps/api 公网 JSON 面）。
6. PrincipalGuard/会话表/0167-0169 迁移面零触（5A-1 已收）；commerce 账务语义零触；共享 SSOT（LEDGER/checklist/issues-master/batch-residual-plan）只读零改——**5A-1 翻面滞后（§0.4-1）登记不翻 · 翻面权归协调方**。
7. est live=0（§6）。
8. 主卷 §3 Ban 沿承全零相关零触：I4 面/RLS 策略/BYPASSRLS/渠道接入/邮箱验证与重置流程/MIG-RUNNER 特性消费。

## §4 依赖

**零未决硬依赖**：①5A-1 已并主线（`5cb78dab` 祖先亲证 §0.4-1）——本刀为其后残面小刀，簇②其余件（#33/#90/#180/#120限流半）已落零耦合，await 化只动签名不动语义（六门回归即闸）；②**文件并发登记**：本刀触 packages/domain/src/auth.ts（+index.ts 注释面）、apps/api/src/modules/auth/{auth.service,auth.controller}.ts（controller 仅注释如实化或不触）、apps/api/src/modules/profile/profile.service.ts、apps/api/src/main.ts、测试 6 文件、apps/api/package.json、root package.json、scripts/run-e2e-isolated.mjs——建前 30 树无同文件他刀在飞登记；EXEC 立项时对届时 tip 照 §0 协议重 pin（并线漂移如实更锚）；③**新门接线**=run-e2e-isolated.mjs 三处 additive 注册（:95-102 文件清单/:1968-1970 门清单/:2377 命令映射 · AG-D 先例）。**下游**：无——#34 残面唯本刀两半，闭后 issues-master :375 整行可翻（翻面权归协调方）。

## §5 Ban 列表 + pins（沿 authz-harden §5 同源誊录 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值 · 含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用——含 §0.4-1 之 5A-1 翻面滞后登记）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：**Ban 触 resume-extract 面**（packages/domain/src/resume-extract.ts 零字节 · R8 防漂 · 越界即 FAIL §3-1）；**Ban 引入 worker_threads**（修法①钉 promisify 形）；**Ban 改 scrypt 参数**（`(password, salt, 32)` 三参形+默认 N/r/p 零变——存量哈希兼容=零迁移根基 · 参数变即成迁移刀=越界 §3-4）；**Ban 动限流桶序/桶参数/恒时序断言形**（#33/#90/#120/#180 已落面 · 六门臂数原值 §3-3）；**Ban 动 UPLOAD_ROUTES 清单与 bodyLimit 12MiB 值**（§3-2）；**Ban 新增 content-length 既有路径行为变化**（修法②只覆盖无 content-length 形 · 有头路径零改——neg-commerce 既有双臂原值）；**Ban 保留与实现不符的注释**（main.ts:154-156 chunked 面随修法如实化）。

**pins（十一值照抄 · 零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 隔离容器+静态源断言+注入假体 · 零模型外呼 · 零生产操作 · 零消耗）

## §6 est live=0

本刀零模型真实外呼：两新 proof=run-e2e-isolated 隔离容器（真栈 HTTP 假体+chunked node:http 注入+静态源断言+注入计数 verify）·六门回归=既有隔离形原值 · typecheck/docs:check=本地门——零生产操作 · 零 secrets · 零消耗（pins 脚注同源 · EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md · `ai-docs/delivery/harness/authz-34-residual-REQUEST.md`）**五类标记词 grep 零命中**（起草席亲跑 · 命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配 · 沿 authz-harden/ag-d 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审 · 立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审 · 开工须协调方授权）。

**停止条件（命中即停上报）**：①**现场漂移**：§0 锚（blob/行号/§0.5 计数 5±0）实跑不符——只更锚可续，语义漂移即停；②**机制不满足**：promisify scrypt 派生与 scryptSync 非逐字节等价（§2-1② 红）/preParsing 钩子无法与既有 413 信封同形/隔离容器 boot 后 chunked 注入不可达——停手上报；③**越界需要**：修法需触碰 resume-extract/迁移/上传政策/SSOT 任一面才可达成——停手上报（改则回炉重审）；④**验收红不可修**：六门回归/neg-auth 既有 3 基线红之外任何门红——基线红恒等登记不洗，新红归因非本刀亦停登记。

**待双审/EXEC 裁决项**：①**chunked 封顶阈值**（推荐=**案A** 非上传路由 SMALL_BODY_LIMIT(1MiB)·chunked 与 content-length 同政策真闭合差异面（主 REQUEST 簇②字面兑现） vs **案B**=派单字面统一 12MiB·与 fastify bodyLimit 职责重复如实登记 §0.3·对 1MiB 差异面不闭合）；②**封顶阈值 env 化**（推荐=不设新 env · SMALL_BODY_LIMIT 既有常量单源复用（对齐 prod 钉死纪律） vs RL_* 双值 env 覆写口同款并陈——新 env 口须携 perf/E2E 显式落档义务随行）；③**异步化对恒时序的影响**（登记=**计数证形不受影响**（verify 恰一次语义零变 · authz5a-constant-time 断言形不依赖墙钟）· 墙钟面 libuv 线程池调度存在理论抖动 · 推荐=不引入墙钟断言 · 登记接受）。

---

*AUTHZ-34-RESIDUAL REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`8d1ff99e`（pull 后主线 tip 实测）· 分支 `line/authz-34-residual` · 工作树 `meetwise-a34`（worktree add 本起草席立 · 建前 30 树无 a34 无同名分支双查）· 蓝本=authz-harden-REQUEST §1 簇② `:97`（修法权威·「EXEC 定」收窄为 promisify 形呈报）+issues-master 更正版 `:375` #34 逐字+§0.5 R8 `:71` 防漂承袭+§9/§9.1 已落半边界+LEDGER `:85` 5A 行 · 三半刻画=登录校验半已落（5A-1 @`5cb78dab` 祖先亲证）+scrypt 异步半/chunked 钩子半两残（本刀）· 锚全亲证（blob 14+行锚 40+·fastify 5.12.5 依赖源码 4 锚升格审计推断为实证）· 派单偏差四条如实登记=①:170 deactivate 第五调用点增列（六触点对勘恰合）②express.json 勘正为 Fastify bodyLimit ③main.ts 钩子/controller 注释行锚漂移更注（:149-157→:159-166/:21→:22-24）④SSOT 5A-1 翻面滞后登记 · 修法两件（scrypt 异步化 promisify 形+chunked 封顶钩子 preParsing 流计数·阈值案A/B 并陈）· 零迁移 · est live=0 · pins 十一值照抄 · markers=0 · 门预申明=authz5a 六门回归+authz34 两新 proof（异步臂+chunked 臂）+neg:auth/authz5a2:password-max 邻接回归+turbo typecheck 3/3+docs:check · rev2（pre-exec 双审处置）：席2 B1 三条+席1 errata 三条全数落卷·登记不阻 N1/N2/N3 三条·Status/STOP 零改——见卷尾处置摘要 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

## rev2 勘误席处置摘要（pre-exec 双审 rev2 · 2026-10-13 · docs-only 恰 1 .md 不变）

**双审输入**：席1 PASS（errata 三条行级）· 席2 FAIL（B1 必改三条）——rev2 席全数处置 · 逐处亲证后落笔 · 本摘要卷尾 append。**处置计数=9**（修订 6+登记不阻 3）+同源随修 3 处（§0.1 :21-24 括注对齐/§1-修法① index.ts 锚/trailer :85+rev2 指针）。

| # | 处置 | 落位 | rev2 亲证 |
|---|---|---|---|
| 席2-B1-1 | §2-5 静态保险丝改述：删「async 化漏 await 处被 TS 捕获…=本刀静态保险丝」→ 改「typecheck 仅捕获比较位漏 await（TS2367）·三生产点经 tsc --strict 实证不报——漏 await 防线=运行时 HTTP 臂（proof⑤+neg-auth:351）」 | §2-5 | rev2 探针亲证：主仓 tsc `--ignoreConfig --strict --noEmit` 对 :94 `&&` 形/:132/:170 `!` 形同形复制零报错 · 仅比较位（constant-time proof :42 同形 `=== false`）报 TS2367 |
| 席2-B1-2 | §2-1⑤ 增 deactivate 错密臂（POST /profile/deactivate 错密→401 wrong_password 且 status 未动 · 放新 proof · neg:auth 90 臂原值不扰动）+并列 5 处 `await hashPassword\|await verifyPassword\|await verifyLogin` 静态 witness 臂 | §2-1⑤ | profile.controller.ts `@Controller('profile')`:11+`@Post('deactivate')`:44 · profile.service.ts:169-172 错密 401 零副作用分支亲读 · neg-auth.proof.ts `A(`=90 亲算 · deactivate 负例区 :383-402 亲读 |
| 席2-B1-3 | §2-3 措辞对齐：「constant-time proof 计数注入形（:21-24/:27/:33）+假哈希臂（:42）随 await 化改写·臂数 16 零变」（消 :42 触点「其余臂零动」龃龉） | §2-3（+§0.1 :21-24 括注同源对齐） | authz5a-constant-time.proof.ts :21/:27/:33/:37/:42 行锚 rg 亲证 · `A(` 计数 16 亲算 · :42 原形 `verifyPassword(...) === false` 亲读（比较位=改写必要性实证） |
| 席1-errata-① | §0.5 rg 计数改「恰 3 行（:6 import/:11/:36 · 调用恰 2）——修法后该 rg 须 EXIT=1」 | §0.5 | `rg -n "scryptSync" packages/domain/src/auth.ts` 实测恰 3 行（6/11/36）EXIT=0 |
| 席1-errata-② | 蓝本④ LEDGER `:84`→`:85`（`:84` 系节标题行） | §蓝本④+卷尾 trailer 同源随修 | product-campaign-LEDGER.md `:84`=`## 批 5A-5E（工程门禁 141 条）`·`:85`=5A 行（「#33/#34/#90/#180 login 面」字面在 :85）sed 亲读 |
| 席1-errata-③（E2） | index.ts 锚 `:102-103`→`:103`（`:102` 系注释行） | §0.1 锚表+§1-修法① | index.ts :102=`// AUTHZ-HARDEN 5A-1 增…`注释 · :103=`export { hashPassword, … } from './auth.ts'` 导出行 sed 亲读 |
| N1（登记不阻） | lying-CL 残面→后续续刀·本刀 Ban 除外合法 | §0.4-4 | CLAUDE.md `:9`「8 reproducible gates/`apps/web` … not built」vs `apps/` 实查 api/web/worker 三包在位——失实段亲证 |
| N2（登记不阻） | chunked 注入 RST 容忍注记 | §2-2⑤ | 登记位落 §2-2 尾（容忍形=响应已达以 status 断言·写侧 RST 不判红·响应未达不得绿判） |
| N3（登记不阻） | `:141` hoist 位置钉死（verifyPassword 错密分支后·UPDATE 前） | §1-修法① :141 条目 | profile.service.ts :132-136 错密分支/:139-140 `const newPassword` 捕获/:141-143 UPDATE query 亲读 |

**rev2 自检**：docs:check EXIT=0 · 五类标记词 grep 零命中（命令与回执留 rev2 席 prove · 不复抄卷内）· §8 STOP（`draft:awaiting_pre_exec_dual`）与 Status 行零改维持 · 本刀 docs-only 恰 1 .md（本卷）· ⛔push。

## §9 EXEC 附记（续作席落卷 · 2026-10-14 · 施工两件承接 + normalize 随链随翻登记 + 门全表 · ⛔push）

**§9.0 开工现势重 pin**：开工 HEAD=`5dede1a2`（`merge(authz): AUTHZ-34-RESIDUAL EXEC 并线主线 feat/mysql-schema-skeleton @cfead6e4`——上席已并线并重 pin §0 · 施工改动在树未提交 · 分支 `line/authz-34-residual` · 树 `meetwise-a34`）。§0 锚在新 HEAD 复核：`rg "scryptSync" packages/domain/src/auth.ts` EXIT=1（0 命中=修法①静态验收 §0.5）·生产面 await 调用点 rg 计数**恰 5**（§0.5 ±0 熔断过）·resume-extract 面 `git diff` 零字节（R8 过）。

**§9.1 上席施工两件落点承接（本席逐 diff 复核）**：

1. **修法① scrypt 异步化（promisify 形·§1-修法① 全条落地）**：`packages/domain/src/auth.ts`（blob `0184b5b9`→`697da7dc`）——import 换形 `scrypt as scryptCallback`+`promisify` · `const scrypt = promisify(scryptCallback)` 显式钉三参签名形 · hashPassword/verifyPassword/verifyLogin 三函数 async 化 · **参数三参形零改**（默认 N/r/p 共享 → 派生逐字节等价=存量 password_hash 零重哈希零迁移根基 · 新门参数等价臂机械证明）· `timingSafeEqual` 比对保持同步恒时序 · LOGIN_DUMMY_HASH 零改 · 导出名集合零变（packages/domain/src/index.ts 零字节）。生产调用点 5 处 await 化：auth.service.ts signup hash **hoist 出 query 实参**（等价注记随码）+login `await verifyLogin` · profile.service.ts changePassword verify await+新密 hash **hoist 钉死在错密分支后 UPDATE 前**（rev2 N3 形）+deactivate verify await。测试面 4 文件随翻：`_neg-harness.ts:180`/`validate.ts:190` 两种子 await 化 · `packages/domain/test/auth.proof.ts` 五臂 await 化改写 · `authz5a-constant-time.proof.ts` 计数注入形+假哈希臂 await 化改写（臂数 16 零变）。
2. **修法② chunked 封顶钩子（§8 裁决项① **案A** 落地）**：`apps/api/src/main.ts`（`7199c6df`→`99ffb688`）——preParsing 流计数闸：仅无 `content-length` 形触发 · 非上传路由封 `SMALL_BODY_LIMIT`(1MiB)（chunked 与 content-length 同政策·真闭合差异面）· UPLOAD_ROUTES/SMALL_BODY_LIMIT 单源复用零新常量 · 上传路由零增钩（fastify bodyLimit 12MiB 流计数已兜底·不重复）· GET/HEAD 零特判 · 413 同信封同错码 `payload_too_large` · 计数包装 PassThrough 超阈 destroy 停转发 · `:154-156` 注释随修法如实化（注释-实现相符）。既有 onRequest content-length 钩子原值零改（有头路径零变化·新门静态臂在证）。
3. **两新门三处 additive 注册（AG-D 先例形）**：`apps/api/package.json`（`authz34:scrypt-async`/`authz34:chunked-cap` 两直跑门）+root `package.json`（两 `:prove` isolated 包装）+`scripts/run-e2e-isolated.mjs` 三处（:95 区来源清单两条/:2006 区门清单两条/:2433 区命令映射两臂）。两新 proof 落 `apps/api/test/authz34-scrypt-async.proof.ts`（14 臂）/`authz34-chunked-cap.proof.ts`（7 臂）。

**§9.2 normalize 随链随翻登记（独立随翻义务 · 沿链深 pin 随翻先例·非越界）**：

- **归因**：`authz5a:normalize:prove` 基线红 `migration_ledger_not_contiguous_prefix`——上席 stash 干跑同红=非本刀施工引入。根因=该 proof 阶段 A staging 只剔除 0167/0168/0169 三前缀，而主线迁移链已 183→185（≥0167 现存 17 文件·0182/0183 空号）——阶段 A 把 0170+ 一并提前应用，ledger 变成「≤0166+0170…0185」非全 manifest 字节序前缀，阶段 B 全链重放时 runner 前缀守卫（migrate.ts `expectedPrefix` 逐位比对）fail-closed。该 proof 属主线已 nail 面（authz-harden 5A-1 @`5cb78dab` 所携），本支线随翻随本刀落主线归主线。
- **修复形（判据化·非全列硬编码）**：`packages/db/test/authz5a-email-normalization.proof.ts`（blob `40a423c0`→`9531d7c2`）——阶段 A staging 过滤由「剔除三前缀」改**字节序判据** `manifest.filter((m) => m.version < '0167')`（预链=严格字节序前缀 <0167 即 ≤0166·与 runner 自身 byte-order 前缀语义同源）——≥0167 整段（0167/0168/0169+主线延伸段 0170-0185·现 17 文件）统一延后到阶段 B 一次过链。主线链尾再延伸（0186+）判据自动覆盖零再翻。阶段 B 断言算式 `manifest.length - preManifest.length` 与 0167/0168/0169 恰在 applied 的 every 臂零改自然成立；臂计划名如实更注「≥0167 整段过链」。**臂数 15 零变**（门基线值 §0.5 不扰动）。
- **语义核验（落笔前亲读 runner）**：migrate.ts 应用序=manifest 字节序排序后逐个应用、ledger 须为传入 manifest 的精确字节序前缀——随翻后阶段 A 恰应用 ≤0166 前缀、阶段 B 全 manifest 一次过链（17 applied=0167…0185 恰全）·重放全 skipped 臂原值绿=幂等零扰动。

**§9.3 门矩阵全表（续作席本树亲跑 · 2026-10-14）**：

| # | 门 | 命令 | 结果 |
|---|---|---|---|
| 1 | authz5a:normalize:prove（随翻后） | `pnpm authz5a:normalize:prove`（isolated） | **EXIT=0 · 15 断言全绿**（臂数原值·「≥0167 整段过链」臂绿） |
| 2 | authz5a:mirror:prove | `pnpm authz5a:mirror:prove` | **EXIT=0 · 15 臂全绿** |
| 3 | authz5a:constant-time:prove | `pnpm authz5a:constant-time:prove`（isolated） | **EXIT=0 · 16 臂全绿**（await 化改写后臂数 16 零变） |
| 4 | authz5a:login-ip-throttle:prove | `pnpm authz5a:login-ip-throttle:prove`（isolated） | **EXIT=0 · 2 臂全绿** |
| 5 | authz5a:login-global-throttle:prove | `pnpm authz5a:login-global-throttle:prove`（isolated） | **EXIT=0 · 2 臂全绿** |
| 6 | authz5a:chgpwd-lock:prove | `pnpm authz5a:chgpwd-lock:prove`（isolated） | **EXIT=0 · 3 臂全绿** |
| 7 | authz34:scrypt-async:prove（新门） | `pnpm authz34:scrypt-async:prove`（isolated） | **EXIT=0 · 14 臂全绿**（含参数逐字节等价+await 恰 5 静态臂） |
| 8 | authz34:chunked-cap:prove（新门） | `pnpm authz34:chunked-cap:prove`（isolated） | **EXIT=0 · 7 臂全绿**（案A 阈值 413 同信封+存活臂） |
| 9 | neg:auth | `pnpm neg:auth`（isolated） | **EXIT=1 · 3/90 失败=deactivate 三臂基线红恒等承登**（§0.5 原值·87 PASS 零新红） |
| 10 | neg:commerce | `pnpm neg:commerce`（isolated） | **EXIT=0 · 90 臂全绿**（含既有 content-length 1MiB 双臂原值） |
| 11 | authz5a2:password-max:prove | `node scripts/run-e2e-isolated.mjs authz5a2:password-max:prove` | **EXIT=0 · 10 臂全绿** |
| 12 | packages/domain prove:auth | `pnpm -C packages/domain prove:auth` | **EXIT=0 · 11 臂全绿**（await 化改写后） |
| 13 | typecheck 权威形 | `pnpm turbo typecheck --force` | **EXIT=0 · 3 successful/3 total · 0 cached** |
| 14 | docs:check | `pnpm docs:check` | **EXIT=0**（80 required files · scanned 2057） |
| 15 | markers 五类 | 五类标记词 grep ×本刀改动集（15 文件） | **零新增**（冲突/遗留标/secrets 三类 EXIT=1·弱化词界形复扫 EXIT=1·fake-green 4 命中=runner 既有拒跑护栏文案非本刀新增行·附注见 §9.4） |

**§9.4 卫生双声明**：est live=0（门 1-12 全 isolated 容器/静态源断言/契约假体·门 13/14 本地构建·零模型外呼零生产操作零 secrets 零消耗·pins 脚注 `actualSpendCny=null` 同源）· markers=0 零新增（沿 qbank-control-sec 收据附注先例：五类=冲突标记/绕过词/门弱化/遗留标/secrets 样值——冲突/遗留标/secrets 三类零命中；门弱化原始形 `xit\(` 子串误中 `process.exit(` 已按 ag-b-classify 先例词界形复扫 EXIT=1；fake-green 词 4 命中全在 `scripts/run-e2e-isolated.mjs` :3/:7/:2537/:2547 既有「Refuse silent fake-green」拒跑护栏文案——本刀该文件仅三处 additive 注册行（:100-105/:2006-2010/:2433-2441·git diff hunk 行域亲证）·非本刀新增）。词面运行时组装不入卷。pins 十一值零翻。

**§9.5 越面自查（13 条陷阱自检）**：

1. 并线重 pin：上席已并线 `5dede1a2`（merge 双亲 `f06f5cb2`+`cfead6e4`·施工改动在其上未提交）·本席 §9.0 复核静态锚全过 ✓
2. 修法①机制等价根基：参数三参形零改·promisify(scrypt) 与 scryptSync 派生逐字节相等（新门参数等价臂机械证明）=存量哈希零重哈希 ✓
3. 修法①恒时序保持：timingSafeEqual 同步比对在位（新门静态臂）·verifyLogin 恰一次语义零变（计数三臂）·限流桶序/桶参数/Credentials 接线/失败锁零改（六门臂数原值即机械闸）✓
4. 修法②有头路径零改：既有 onRequest content-length 钩子原值（chunked-cap 静态臂在证）·neg:commerce 既有 413 双臂原值绿 ✓
5. 零迁移：改动集零 .sql · 历史迁移 0001-0185 零字节 · `git status` 零迁移文件 ✓
6. R8 防漂：零 worker_threads 引入（rg 全改动码面使用点零·命中两处均系否定声明文本：auth.ts:7「非 worker_threads」如实声明注释+authz34-scrypt-async.proof.ts:30 静态臂断言名·非使用）·resume-extract 面 git diff 零字节 ✓
7. normalize 随链随翻三核验：臂数 15 零变 · 判据化修复形（非 0170-0185 全列硬编码·链尾延伸自动覆盖）· runner 字节序前缀语义亲读后落笔（§9.2）✓
8. 既有臂零回归：门 1-8/10-12 臂数全原值（normalize 15/mirror 15/constant-time 16/login-ip 2/login-global 2/chgpwd 3/neg-auth 90/neg-commerce 90/password-max 10/domain-auth 11）·neg:auth 3 基线红 deactivate 三臂恒等承登不洗不增 ✓
9. 越面自查：UPLOAD_ROUTES 清单只读复用零增删 · bodyLimit 12MiB 零改 · controller 校验面零触 · commerce 账务语义零触 · 共享 SSOT（LEDGER/checklist/issues-master/batch-residual-plan）只读零改 · worker/web 零触（web tsbuildinfo 型构建缓存本次 typecheck 抖动已 checkout 还原不入卷）✓
10. 回滚面：改动集=6 码/测文件改+2 新 proof+3 注册文件+1 随翻 proof+本卷 §9——单 commit 分节可整回滚·零迁移=零 DDL 回滚面 ✓
11. 停止条件：零不可修红——normalize 基线红在协调方授权随翻面内修（归因 stash 干跑同红=非本刀引入·§9.2）·其余门全绿 ✓
12. ⛔push：本卷零 push（commit 后停·Status=`executed:awaiting_post_prove_dual` 待 post-prove 双审两外席）✓
13. est live=0+markers=0+pins 十一值零翻：§9.4 双声明 ✓

## §9.6 sse-push 回归修复附记（S4b sse-push 红诊断修复席落卷 · 2026-10-14 · 施工②引入真回归·最小修复 · ⛔push）

**红事实**：S4b nail 停 sse-push:notify:prove 3/35 红（P-2a/P-3/P-4 三臂同断言 `router 归零`·四树归因收敛引入窗=批2-C1 nail merge 61d5911d）。

**精确引入 commit+文件（二分亲证）**：本刀 EXEC `989adfdd` 施工② main.ts preParsing 流计数钩子。二分：窗基 `c4025186` 跑门 **EXIT=0 · 35/35 绿**；`989adfdd` 跑门 **EXIT=1 · 同三臂红**（P-2a/P-3/P-4 逐字复现）·窗内 `c4025186..989adfdd` 门相关触面（apps/api+packages/db）唯一=`989adfdd`·merge `5dede1a2` 双亲之一 `cfead6e4` 经 `merge-base --is-ancestor` 亲证为窗基祖先（带入面零）。

**根因（(a) 真回归·非断言随形）**：钩子对无 content-length 请求（含 SSE 的 GET）给载荷流挂 `data/end` 监听——fastify 5.12.5 preParsing 首轮载荷流=`request.raw`（route.js `runPreParsing` :657 `request[kRequestPayloadStream]=request.raw`），挂监听即把 bodyless IncomingMessage 推入 flowing→空消息即刻消费完成→`close` 在连接未断时提前发出（node:http 探针：挂监听形 `req.close@+1ms` vs 真 abort `socket.close@+414ms`；无监听形 `close` 仅在真断开发出）。SSE 泵（sse-pump.ts :86）在 handler/hijack 之后才挂 `reqRaw.on('close')`——事件已发永不达→客户端断开不可侦测→pump 循环兜底计时器续转（退化 2s/健康 30s）直至 10min deadline，waiter 不注销。P-2a/P-3 直接红（`until(waitingCount===0,2000)` 超时）；P-3 尾 :293 同款等待未断言只等待→泄漏滞留→P-4 同步 dispose 自身三 waiter 后计数仍>0 连带红。生产影响=每弃连 SSE 持 waiter+SSE 槽+限流槽至 10min（真泄漏非测试断言漂移）。

**修复形（最小·源修）**：`apps/api/src/main.ts` preParsing 钩顶增 bodyless 早退直通 `method === 'GET' || method === 'HEAD' → done(null, body)`（fastify bodyless 分类=GET/HEAD：本不缓冲不 parse，封顶政策无对象；并消流消费副作用）·:175 错误注释「零特判零新分支」如实更正（该句所依赖的「挂监听零副作用」前提不成立）。chunked-cap 门静态三断言（`addHook('preParsing'`/`req.headers['content-length'] !== undefined`/`new PassThrough()`)与七动态臂（全 chunked POST）零扰动。

**门矩阵（本席支线树 line/sse-push-fix @修复后亲跑）**：sse-push:notify:prove **EXIT=0 · 35/35 全绿**（修复前同树 3/35 红）+authz34:chunked-cap:prove **EXIT=0 · 7 臂全绿**+authz34:scrypt-async:prove **EXIT=0 · 14 臂全绿**+sse-slot:prove **EXIT=0**+interview:prove **EXIT=0 · 57 PASS**+turbo typecheck --force **EXIT=0 · 8/8 · 0 cached**+turbo lint **api 1431>1421+root 5210>5200 双红=§9.4 既登基线恒等零新增**（worker 950=950/db 1040=1040/domain 115/ai-runtime 621 贴线绿直跑亲证）+docs:check **EXIT=0**（2078 managed ≤ cap 2080）。est live=0（全 isolated 容器/本地门·零外呼零 secrets）·markers 门按先例 commit 后净树亲跑（未提交态改面恰符臂=申报面属 i6-239 历史刀清单·红属协议形非门失效）。
