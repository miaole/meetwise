# 5C-API-HARDEN REQUEST（批5 5C 子刀 · 进程内状态共享化 + 部署约束 · #36/#37/#17/#129/#118 五件 + R10 顺手 · docs-only 落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席 2026-10-14 落码+门矩阵十三门全绿·§9 EXEC 附记在卷·⛔push·post 双审待派）
**Date**: 2026-10-14
**刀位**: `ai-docs/delivery/harness/product-campaign-LEDGER.md:87`（5C 可靠性行逐字：「…#36/#37/#17/#139 多实例…#129…#118… — 🆕 分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）」——本刀=**API-HARDEN 子刀**·进程内状态共享化+部署约束域）+:234（R10 行逐字：「ensure-ok server-only 标注…归 **5C-API-HARDEN 顺手**」）+ ha-6 处置档 `ha-6-companion-disposition.md:23`（「Redis 共享桶：归 S15/波2 云侧需 Redis 面时**另刀**」——**本刀即该另刀候选·但与 S15 买云授权解耦：本地可用形态先立**）
**Base**: `feat/mysql-schema-skeleton` @`d68ffe17`（full `d68ffe17cb9875c5e0d3c6437500c140b931ab76`·2026-10-14 fetch 后实测 tip·origin/main `c4244470` 为其祖先 `git merge-base --is-ancestor` 亲证）· 分支 `line/api-harden`（仓根同级工作树 `meetwise-apid`：`git -C ../meetwise worktree add ../meetwise-apid -b line/api-harden d68ffe17`）
**Pins（十一值照抄 · 零翻转）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`
**Honesty**: 蓝本=更正版 issues-master 五件原文行（仓外 `~/Documents/Meetwise产品审计-更正版/issues-master.md`·行号 §0.2 逐条标注）+ LEDGER 5C 行/R10 行 + ha-6 处置档全文。全部涉案码 file:line 起草席亲读亲证（本节 §0 全录·@`d68ffe17` 实树 rg/sed/Read 实测）；零实跑零 prove 零 live（本刀=REQUEST 起草·prove 判据 §2 待 EXEC 兑现）；est live=0；markers=0。

---

## §0 现状锚（起草席亲读 · file:line 逐条 rg/sed/Read 实测复核 @`d68ffe17` · **EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 防重三查（已终局·强制项）

1. **AUTHZ-HARDEN 5A-1/5A-2 已 nailed 未收本刀五件任一**：5A 位图（LEDGER:85）16 件=#111/#131/#120/#33/#90/#180/#35/#112/#34/#67/#100/#108/#109/#168/#18/#143——#36/#37/#17/#129/#118 **零重叠**。但 5A-1 落地在本刀触面上留有**只增机械**：kid 多钥窗+jti 会话吊销（principal.guard.ts:18-24 注释）与改密限流（profile.service.ts:118-135）——本刀修法**只增不翻**这些既有语义（Ban 列表明示）。
2. **旧路由登记过期勘正**：`extreview-fix-campaign-SOP.md:65` 曾登记「#36 归 AUTHZ-HARDEN、#17 归 SSE-RESILIENCE」——经查 AUTHZ-HARDEN 两子刀已收官且五件零触；SSE-RESILIENCE 刀（R6/R7/R8 域·web 侧韧性）亦零触服务端槽位。现行权威=LEDGER:87（5C 四子刀位图·#36/#37/#17/#139=「多实例」簇）+ 码内注释自认：`apps/api/src/platform/auth-session.ts:20`「（与既有 status 缓存同源 seam，**#36 归 5C 不动**）」。**rev2 补勘**：`extreview-fix-campaign-SOP.md:65`「#66 归 API-HARDEN」系过期登记（#66=web 代理 fetch 健壮面·issues-master:230 实锚 apps/web 侧 route.ts×2+transcribe-proxy.ts·非本刀域·零触）。
3. **同域相邻件界线**：#139（SSE LISTEN 掉线不唤醒·issues-master:263）归 **5C-SSE-API 子刀**不并入；#184（SSE 先取数后占槽·issues-master:424·`interview.controller.ts:258-262` 同函数内）列为**裁决项⑤**（是否本刀顺手）；#87 残面（成本分级/全局桶按 IP 分摊·issues-master:238）列为**裁决项⑦**（IP 维度桶已随 5A-1 #180 落·auth.service.ts:46/:82-84 与 profile.service.ts:124-125 实锚在树）。

### 0.2 五件归簇总表（issues-master 原文行 + 码面实锚 + 多实例失效场景推演 · 全 @`d68ffe17` 实测）

| 件 | issues-master 原文行（仓外卷） | 原文要点（节要） | 现树实锚 @`d68ffe17`（起草席亲证·原文行号漂移见 §0.7） | 多实例失效场景推演 |
|---|---|---|---|---|
| #36 | `:223` | 「守卫账号状态缓存 60s 且仅进程内，多实例吊销延迟，存在 evict 后陈旧回填 TOCTOU」·修法列：「缓存迁到共享存储或缩短 TTL，回填前比对代次」 | `apps/api/src/platform/principal.guard.ts:26`（`STATUS_TTL_MS=60_000`）·`:28`（`statusCache=new Map`）·`:30`（`evictPrincipalStatus` 只 `delete` 本进程）·`:44-58`（`accountState` 缓存读/回填·`:56` 回填点）·`:14-16`（注释自认「多实例下 evict 只清本进程…≤60s…缓存重填 TOCTOU…要真·即时+跨实例一致须换 Redis 共享吊销源(已知 seam)」）；evict 调用点恰 2：`profile.service.ts:143`（改密）/:203（注销）；**同形第二缓存**：`auth-session.ts:21-25`（`SESSION_TTL_MS=60_000`+`sessionCache`+`evictSessionRevocation`）·`:60-70`（`isSessionActive` 同形回填）·evict 唯一内部点 `:52`（`revokeSession`）·唯一调用点 `auth.service.ts:106`（logout） | 实例 A 改密/注销 → evict 只清 A 进程；B 实例缓存最长 60s 内继续放行已吊销令牌（`account_inactive`/`session_revoked` 延迟生效）。TOCTOU：B 实例并发请求在 DB 读后、缓存回填前（`:47→:56` 窗）撞上广播式 evict 时，陈旧态回填存活至 TTL |
| #37 | `:224` | 「限流 rl.allow 与 SSE 槽位都是进程内 Map，多实例按实例数放大」·修法列：「迁到 Redis/PG 共享限流；单实例阶段在部署约束中写明」 | `apps/api/src/platform/rate-limit.service.ts:4`（注释「**单实例内存**——多实例生产换 Redis 共享桶(seam:同 allow 接口)」）·`:9`（`buckets=new Map`）·`:12-19`（`allow`）·`:25-29`（`hasToken`·#120 失败锁入口探针）·`:32`（`slots=new Map`）·`:34-44`（`acquireSlot`/`releaseSlot`）；**allow 生产调用点 14 行·16 调用点（auth.service.ts:46 单行三连）**（rg 实测·偏差熔断 ±2）：interview.service.ts:375/:438/:471/:749 + profile.service.ts:124/:125/:133 + resume.service.ts:38 + recruiter.service.ts:161/:163 + auth.service.ts:46/:82/:83/:84；hasToken 调用点恰 1：profile.service.ts:127 | compose.ha 双实例（§0.5）下全部桶容量 ×2：`login:global`(300,5)、`signup:global`(60,1)、`chgpwd:ip`(60,1) 等全局/IP 桶稀释一倍；暴力破解预算翻倍 |
| #17 | `:217` | 「SSE…每主体 5 条并发槽仍是进程内 Map，多实例不受限」·修法列：「槽位计数迁到共享存储（Redis/PG），或在单实例前提下写入部署约束」 | `interview.controller.ts:262`（`acquireSlot('sse:'+principal, 5)`·`:274` release）·同形姊妹两处：`diagnosis.controller.ts:56`/:67·`quiz.controller.ts:58`/:69（三控制器共享 `sse:${principal}` cap=5·`apps/api/test/sse-principal-slot.proof.ts:1-5` 头注自证「interview / quiz / diagnosis share `sse:${principal}` cap=5」）；**第四槽**：`resume.service.ts:50`（`acquireSlot('resume-parse:global', PARSE_MAX)`·`:68` release·`PARSE_MAX=Number(process.env.RESUME_PARSE_MAX ?? 6)` @`:21`）；解析槽（短生命周期 CPU 段）与 SSE 槽（长连 10min 封顶·sse-pump.ts:85）失效面不同形 | 双实例下每主体 SSE 实效 5→10、全站解析并发 6→12——恰为 ha-6 W2 接受登记的「SSE 槽 5→10、parse 槽 6→12」（disposition:19）；LB 轮询下池压力/事件循环爆炸半径上限翻倍 |
| #129 | `:400` | 「限流 buckets Map 只增不删，login 的 email key 可无限撑大进程内存（signup 有 DTO 上限）」·修法列：「buckets 加 TTL/LRU 淘汰与容量上限」 | `rate-limit.service.ts:9`（Map 无淘汰）·`:13-14`（`allow` 首见即 `set`·零删除路径——全文件无 `buckets.delete`）；login per-email 桶 `auth.service.ts:82`（`login:${email}`·email 无 DTO 长度闸——auth.controller.ts:25 `login` 故意不套 Credentials pipe·`:22-23` 注释自证「限流必须看到所有尝试」）；signup 面 DTO 有闸（`b.email` 校验 auth.service.ts:40） | 攻击者以任意长/任意多 email 打 `/auth/login`（每次都先入桶 auth.service.ts:82 再谈密码）→ 每实例 buckets 无界增长；双实例各持一份独立无界 Map |
| #118 | `:393` | 「RecruiterGuard/AdminGuard 每请求开事务查 role/is_admin，无缓存，池压力翻倍」·修法列：「把 role/is_admin 并入 PrincipalGuard 的缓存查询（同步补吊销路径）」 | `apps/api/src/platform/recruiter.guard.ts:17-18`（`SELECT role, approval_status FROM user_account WHERE id=$1` 每请求）·`apps/api/src/platform/admin.guard.ts:14-15`（`SELECT is_admin FROM user_account WHERE id=$1` 每请求）；两守卫注册面 `platform.module.ts:11-12`（providers/exports）；审批态写侧在 DB 函数内：`admin.service.ts:82-84`（`gateway_admin_recruiter_approval($1,$2)`）——应用层无 evict 钩子 | 每条 B 端/admin 请求在 PrincipalGuard 已查一次（principal.guard.ts:47-48）之上再各查一次——三查同表同 uid；池预算账（ha-6 帽后 76·§0.5）下稳态连接压力无谓放大 |

### 0.3 LEDGER 5C 行 + R10 行（逐字誊录）

- `product-campaign-LEDGER.md:87`：「**5C 可靠性（52）**：#92 🔄 EXEC 在飞·#10 unknown 结案·#157/#158/#181/#156 worker 收尾序·**#36/#37/#17/#139 多实例**·…（中略·#129/#118 在列）… — 🆕 **分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）**」。
- `:234`：「| R10 | ensure-ok server-only 标注 | SSE nail @ed56c73b 席1 nit | lib/jobs/ensure-ok.ts 未标 server-only（无实际渗漏·可选收紧） | **5C-API-HARDEN 顺手** | 开放 |」。
- 现树实证：`apps/web/lib/jobs/ensure-ok.ts` 头部**无** `server-only` import（Read 亲证·首行 `import { redirect } from 'next/navigation';`）；先例形=`apps/web/lib/api/server.ts:1`（`import 'server-only';`）。

### 0.4 ha-6 处置承接（裁决承接 · 全文亲读 `ha-6-companion-disposition.md`）

- `:11-19` W2 裁定：限流 ×2 稀释=**预览尺度接受**（三理由：有界面/成本面「apps/api/package.json 今日零 redis 依赖…违反 EXTREV-7 与 LEDGER『右列不加厚』」/同理有界「SSE 槽 5→10、parse 槽 6→12、吊销窗 ≤60s 最终一致」）。
- `:21-25` **登记不实施三面**：①Redis 共享桶「归 S15/波2 云侧需 Redis 面时另刀（TASK-SOP:86 波2 口径）；`rate-limit.service.ts:4` seam 注释维持原样零改」；②principal 状态缓存吊销窗「单实例 evict 即时 → 多实例最坏 ≤60s 最终一致+缓存重填 TOCTOU 窗——零改·登记维持」；③**叙事红线**：「『接受 ×N』≠ 限流已多实例安全 / 已 Redis 化 / 全局精确上限已恢复——处置=登记，seam 波2 在卷」。
- **本刀定位**：上两登记面（①②）即本刀修法件②与件①——本刀=该「另刀」候选，**但与 S15 解耦**：S15=HA 买云授权时点（`TASK-SOP-v2.md:105`「北星门 2 前用户点头」），本刀修法**零云依赖零新基建**（载体裁决见 §8 裁决①·推荐 PG 本地可用形）；Redis 形仅作为接口同 seam 的波2 重裁留位，本刀零实施。
- `:41` 预算三账承重面：现状帧六池 124 → 帽后帧 6P+4=76、余 21（`PGPOOL_MAX: "12"` @`docker/compose.ha.yml:56`·消费点 `packages/db/src/principal.ts:946`）——**本刀共享化新增连接面（若有）必须复用既有连接或入账重算**（停止条件②·裁决项④）。

### 0.5 部署约束面实测（载体裁决输入 · 全 rg/Read 亲证 @`d68ffe17`）

1. **实例拓扑**：`docker/compose.prod.yml:234` api ×1（宿主回环绑定 :248-250）；`docker/compose.ha.yml:149/:176` **api-a/api-b ×2**+LB（:331 起·双后端 :352-354）+`INSTANCE_ID`（:159/:186·分流观测通道 RX-3 :21）。
2. **Redis 既有面=worker 独有·api 零依赖**：`RAG_REDIS_URL`（TLS Tair）仅 prod env 块 `docker/compose.prod.yml:63-66`；消费方全在 worker 侧（`apps/worker/src/rag-redis-cache.ts` 等·`apps/worker/package.json:163` `"redis": "catalog:"`）；**apps/api/package.json 零 redis 依赖**（rg 实测零命中）；worker 侧 Redis wakeup 通道显式「不替换 PG LISTEN/pg_notify 路径」（`worker-job-wakeup-redis.ts:4-5`·`main.ts:680`）。
3. **PG 既有共享原语（本刀推荐载体素材）**：pg_notify 通道两族——`interview_event_ch`（`packages/db/migrations/0143_sse_push_notify.sql:26` 触发器·api 侧 LISTEN 单例 `sse-notify.service.ts:151` 专用池 `max:1 purpose:'sse-listen'`）与 `meetwise_worker_wakeup_v1`（0084:14/0133:20·worker 侧）；pg advisory lock 既有（`packages/db/src/interview/interview-event.ts:22` `pg_advisory_xact_lock(hashtext($1))`·`resume/resume.ts:166` 双键形）；PG 单连接可 LISTEN 多通道（同连接挂第二通道=evict 广播零新增连接的候选机制·裁决项④）。
4. **api 池形**：`DbService` 请求池 `purpose:'api'`（`db.service.ts:7`）；池 max 由 `PGPOOL_MAX`（默认 20）统一（`principal.ts:946`）。
5. **限流参数 env 形**：桶常量已 env 可覆写（`profile.service.ts:21-28` RL_CHGPWD 族·`auth.service.ts:14-26` RL_SIGNUP_IP/RL_LOGIN_IP/RL_LOGIN_GLOBAL 族·`resume.service.ts:21` RESUME_PARSE_MAX）——共享化开关 env 若立（裁决项④）沿此形制。

### 0.6 触面计数汇总（rg 实测 @`d68ffe17`·数字口径=以 rg 复测为准·偏差熔断 ±2 即停）

- `allow(` 生产调用点 **14 行·16 调用点**（auth.service.ts:46 单行三连）；`hasToken(` **1**（profile.service.ts:127）；`acquireSlot(` **4** / `releaseSlot(` **4**（interview:262/:274·diagnosis:56/:67·quiz:58/:69·resume:50/:68）；`evictPrincipalStatus` 生产调用点 **2**（profile.service.ts:143/:203）；`evictSessionRevocation` 内部 1（auth-session.ts:52）·`revokeSession` 生产调用点 1（auth.service.ts:106）。
- 触码文件集（修法半径）：`apps/api/src/platform/{principal.guard.ts, auth-session.ts, rate-limit.service.ts, recruiter.guard.ts, admin.guard.ts, platform.module.ts, sse-notify.service.ts(连接复用面)}` + `apps/api/src/modules/{auth,profile,interview,resume,recruiter,diagnosis,quiz}/…调用点形` + `apps/web/lib/jobs/ensure-ok.ts`（R10 一行）+ 迁移 0-2 个（§8 裁决⑧）。

### 0.7 漂移登记（蓝本行号 → 现树实测 · 结论零变·仅行号）

| 蓝本锚 | 蓝本值 | 现树实测 @`d68ffe17` | 结论 |
|---|---|---|---|
| issues-master #37 引 `rate-limit.service.ts:5-6` | seam 注释 :5-6 | `:4` | 注释上移一行·语义原值 |
| issues-master #37/#129 引 `auth.service.ts:43` | allow 行 | `:46`（signup）/:82（login） | 函数体下移·桶序/参数原值 |
| issues-master #17 引 `interview.controller.ts:258` | acquireSlot 行 | `:262`（:258 现为 initial 取数行·恰为 #184 面） | 漂移 +4·cap=5 原值 |
| issues-master #118 引 `recruiter.guard.ts:15-16` | 查询行 | `:17-18` | 漂移 +2·SQL 原值 |
| issues-master #118 引 `packages/db/src/principal.ts:914` | 池错误面 | `:917`（observePoolError） | 漂移 +3·与本刀修法零触（仅池压力论据） |
| ha-6 处置档引 `LEDGER:137`「右列不加厚」 | :137 | `:139`（「右列（核心空缺）补齐之前，左列（过度工程侧）不再加厚」=EXTREV-7 具体化） | LEDGER 增行致 +2·规则在效·本刀修法受其约束（Ban 新依赖加厚） |
| 本卷 rev1 §0.2 #129 引 `auth.controller.ts:24` | `login` 行 | `:25`（`:24` 现=req.ip 注释行） | 漂移 +1·「故意不套 pipe」语义原值（rev2 勘） |
| 本卷 rev1 §0.2 #17/件③ 引 `sse-pump.ts:86` | 10min 封顶行 | `:85`（`apps/api/src/platform/sse-pump.ts` deadline 行） | 漂移 -1·cap=10min 原值（rev2 勘） |

---

## §1 修法（五件 + R10 顺手 · 每件三要素=**共享载体 + 失效语义 + 迁移路径** · EXEC 立项重 pin · 载体终形走 §8 裁决①-④行使·本节推荐案为双审基准）

### 件① #36（含 auth-session 同形第二缓存）：吊销失效广播 + 回填代次比对

- **共享载体（推荐案甲）**：零新存储——吊销真相源已在 PG（`user_account.status/pwd_epoch`·`auth_user_session.revoked_at`）。改 `evictPrincipalStatus`/`evictSessionRevocation`（principal.guard.ts:30·auth-session.ts:25）为「本进程 evict + `SELECT pg_notify('meetwise_principal_evict_v1', …)` 广播（payload=uid/jti·通道名裁决项④定名）」——**广播时序约束（rev2 增补·裁决② 输入）**：pg_notify 与状态 UPDATE 同事务同连接（随 commit 原子送达）·**禁先广播后提交**（先广播后提交则收播实例在 commit 前回读 DB 得旧态并回填·TOCTOU 复活且存活至 60s 兜底窗·裁决② 广播窗预算落空）；api 侧 LISTEN 收播即 evict 本进程缓存——**复用 `sse-notify.service.ts:151` 既有专用 LISTEN 连接挂第二通道（同连接多 LISTEN·零新增连接预算）为推荐**，独立 max:1 连接为备选（须入 ha-6 预算账重算=越界停）。
- **失效语义**：吊销窗从「≤60s 最终一致」收敛为「广播送达窗+在途请求窗」（目标预算裁决项②）；60s TTL 维持为兜底上界（`STATUS_TTL_MS`/`SESSION_TTL_MS` 零改）；LISTEN 断连/降级时退回既有 ≤60s 行为（fail-open 于时效·不 fail-open 于安全——TTL 兜底恒在）。
- **TOCTOU 回填比对（issues-master 修法列逐字「回填前比对代次」）**：`accountState` 回填点（principal.guard.ts:56）与 `isSessionActive` 回填点（auth-session.ts:68）增「回填值新鲜度守卫」——进程内维护单调 evict 序（每 uid/jti 记最近广播序），DB 读返回晚于该序的广播即放弃回填旧值（或回填前二读复核；终形 EXEC 按裁决②行使·断言见 §2-2）。
- **迁移路径**：**零迁移**（evict 全在应用写路径：profile.service.ts:143/:203·auth.service.ts:106——`pg_notify` 可语句直发·无需 DDL/触发器）。

### 件② #37：限流桶分级共享化（同 `allow`/`hasToken` 接口 · seam 注释逐字承接兑现）

- **共享载体（推荐案甲=分级共享）**：按桶类分级——**全局桶与 IP 桶**（`signup:global`/`login:global`/`signup:ip:*`/`login:ip:*`/`chgpwd:ip:*`·跨实例放大主面）迁 PG 共享桶表（单行原子 UPSERT·令牌数与 last_refill 两列·推荐案）；**per-principal/per-email 桶**（攻击域天然单主体·实例数放大 ≤ 实例数上限且有界）维持进程内+件⑤ 容量上限。`RateLimitService.allow/hasToken` 对外签名零改（rate-limit.service.ts:4 seam 注释「同 allow 接口」兑现）。裁决项①保留整桶全迁 PG 与 Redis 形两备选案（Redis 形=须 apps/api 新依赖+密钥授权+S15 耦合·与 LEDGER:139 右列不加厚冲突须协调方例外·本刀不推荐）。
- **失效语义**：共享桶 DB 往返失败时的降级形=**裁决项③**（候选：全局桶 fail-open 保可用 vs auth 类桶 fail-closed 保防爆破预算·或退化为进程内本地桶并打结构化日志——现状进程内 Map 永不失败=可用性优先基线）。池压力负账如实披露：全局/IP 桶命中频度=signup/login/chgpwd 入口频度·每次 +1 快速 UPSERT；不得为省往返绕过共享判定（否则共享化失效）。
- **迁移路径**：1 迁移（共享桶表 DDL·按需占号·起号随裁决项⑧ rev2 对账口径）+1 清理路径（TTL 惰性删除或 tick 清理·与件⑤ 同机制）。

### 件③ #17：SSE/解析并发槽共享化（原子计数 + lease 过期对账）

- **共享载体（推荐案甲）**：PG 计数行（**首占=单语句** `INSERT … ON CONFLICT (slot_key) DO UPDATE … SET n=n+1 WHERE 计数行.n<max OR expired RETURNING`（rev2 改形·EXEC 注意：原「UPDATE…无行则 INSERT」两语句在双实例并发首占时同撞 INSERT→unique violation·单语句原子占消除该竞争面）；续占=`UPDATE … SET n=n+1 WHERE slot_key=$1 AND n<$2 RETURNING`；release 对称减·零减穿）——`acquireSlot/releaseSlot` 签名零改；三 SSE 控制器（interview:262/diagnosis:56/quiz:58）与解析槽（resume:50·`resume-parse:global`）同机制。SSE acquire/release 为长连生命周期两端各 1 往返（频度=连接建立/断开·池压力可忽略）；解析槽同（CPU 段进出）。
- **失效语义**：防泄漏=lease 形——计数行带 `held_until`，acquire 顺带清过期占用（SSE 10min 封顶 sse-pump.ts:85 + 进程崩溃残留·TTL 值裁决项⑨）；PG 不可达时 SSE 槽 fail 形=**裁决项③一并**（推荐 fail-open 放行+结构化日志：槽位是资源保护非安全边界；429 语义在共享层可用时保持精确）。
- **迁移路径**：与件② 共表或独立 1 迁移（裁决项⑧）。

### 件④ #118：role/approval_status/is_admin 并入门卫缓存查询（同步补吊销路径）

- **共享载体**：`accountState` 单查询扩列（principal.guard.ts:47-48 现查 `status, pwd_epoch` → 并入 `role, approval_status, is_admin`·一查五列）；RecruiterGuard/AdminGuard（recruiter.guard.ts:17-18·admin.guard.ts:14-15）改从守卫缓存态读、零各自 SQL；issues-master 修法列「把 role/is_admin 并入 PrincipalGuard 的缓存查询」逐字兑现（approval_status 随行并入·因两守卫同表同 uid 三查并一）。
- **失效语义**：status/pwd_epoch 吊销路径=件① 广播同渠；**role/approval/is_admin 变更发生在 DB 函数内**（`gateway_admin_recruiter_approval`·admin.service.ts:82-84·应用层无钩子）——两案裁决项⑥：（i）1 迁移=DB 函数/表触发器同 0143 形发 pg_notify 广播（即时·推荐）；（ii）零迁移=审批态沿 60s TTL 最终一致（approve 后最长 60s B 端权限才生效·如实申报；**rev2 增补吊销方向对称申报**：审批拒绝/撤权→B 端权限最长 ≤60s 残留·安全相关面·采此案须一并如实登记）。is_admin/role 变更面同触发器覆盖。
- **迁移路径**：0-1 迁移（随裁决项⑥）。

### 件⑤ #129：桶无界增长收口（随件② 载体定形 · 双半）

- **共享载体**：若件② 甲案——per-email/per-principal 桶进程内 Map 增**容量上限+LRU 淘汰**（上限值裁决项⑦·量级建议 10^4 且 env 可覆写沿 RL_* 形制）；共享桶表半=行数有界（TTL 惰性删除/清理 tick·件② 迁移同卷）。
- **失效语义**：容量打满=淘汰最旧桶（新 key 视作满额桶语义按 LRU 正常建桶）——不抛错不改 429 语义；issues-master 修法列「buckets 加 TTL/LRU 淘汰与容量上限」逐字兑现。
- **迁移路径**：0（进程内半）+随件②（共享半）。

### 顺手件 R10（LEDGER:234 登记·恰一行）

- `apps/web/lib/jobs/ensure-ok.ts` 头部增 `import 'server-only';`（先例形=`apps/web/lib/api/server.ts:1`）——「无实际渗漏·可选收紧」原值登记·web typecheck/build 门随行。

**修法计数**：五件（件①-⑤）+顺手 1 件=**6 条**；迁移 0-2 个（裁决项⑥⑧终形·现树实存 max=0187：`packages/db/migrations/` ls 亲证 0186/0187 qbank 两件收尾——**不预占**·EXEC 立项/协调方派单时全场重证 max+在飞分支占号后对账定号（rev2 亲证在飞现场：0188=cost④ 在飞·0190-0199=5B 在飞·0189 空档·下一起号 0200）。

---

## §2 验收断言候选（pre-exec 双审核对单基面 · 断言力≥3 · EXEC 立项重 pin · 门预申明）

1. **跨实例吊销即时性 prove（隔离库·双池模拟双实例）**：实例 A evict（改密/注销/logout 三臂）→ 实例 B 守卫下一请求 401（`account_inactive`/`session_revoked` 各臂）·广播窗断言（预算值=裁决项②终形）；LISTEN 断连负臂=退回 ≤60s 行为不断言即时。
2. **TOCTOU 回填守卫臂**：构造「DB 读完成→广播→回填」交错——陈旧代次/已吊销态**不落缓存**或回填即失效；伪并发 ×N 臂确定性断言。
3. **共享桶精确性 prove**：双实例交替 `allow('login:global',300,5)` 合计消费恰 300（×2 稀释归零）；`hasToken` 非消费探针跨实例同形；fail 注入臂=按裁决③ 终形断言。
4. **共享槽 prove**：双实例交替 `acquireSlot('sse:x',5)` 合计恰 5·第 6 拒 429；release 零减穿；lease 过期臂=崩溃残留占用到期回收。
5. **#129 界**：distinct key 数 > 上限后进程内 Map 尺寸有界（≤ 上限）·共享表行数经清理有界。
6. **既有 proof 回归门（零语义翻转）**：`api:validate`（含 F5 槽臂 :306-308）·`sse-principal-slot.proof`·`neg-auth`/`neg:resume`/`authz5a:chgpwd-lock`/`authz5a:login-ip-throttle`/`authz5a:login-global-throttle` 全绿 EXIT=0；`prove:env-schema`（若新 env）随行。
7. **部署约束静态断言**：若立共享化开关/通道名 env——compose.prod/ha config 渲染断言（沿 ha-6 A2 形·锚传播逐 service）；`check-migration-version-uniqueness` EXIT=0（若迁移）+`drift:prove` EXIT=0。
8. **R10 门**：`ensure-ok.ts` 首行 `import 'server-only';` 静态断言 + web typecheck 绿。
9. **typecheck 门**：turbo typecheck 3/3 EXIT=0·零新错（触面文件逐个登记）。
10. **docs:check 门**：EXIT=0（基线 2062 扫描·本刀 +1 .md=2063 ≤ cap 2064）。

---

## §3 范围外（边界清单 · 越界即 FAIL）

1. #139（LISTEN 掉线不唤醒/NOTIFY 补偿）=5C-SSE-API 子刀·零触。
2. #184 若裁决⑤ 判不并入——则 `interview.controller.ts:258-262` 取数/占槽**时序零改**（仅槽位机制共享化·时序面留给 SSE 子刀）。
3. #87 残面（按接口成本分级/全局桶按 IP 分摊的新分级设计）若裁决⑦ 判不并入——本刀只做「现有桶语义原值共享化」·**零新增桶类零改桶参数**（capacity/refill 全部 16 调用点（14 行）值逐个原值）。
4. Redis/云侧引入（S15 域）·PgBouncer（ha-6 W3 已裁预览尺度不加）·云授权任何前置——零触。
5. worker 面：job-wakeup 通道本体（`main.ts:661/:672`）与 Redis wakeup（`worker-job-wakeup-redis.ts`）零触（既有 Ban 逐字承接）。
6. SSOT 翻面（LEDGER/issues-master 行与统计）——本刀 docs-only·五件状态行 nail 席随落·起草/EXEC 均只读引用。
7. compose 预算账重算（ha-6 W1 落卷 76/97 面）——若共享化被迫新增独立 LISTEN 连接即触发停止条件②·不得静默入账改数。
8. 限流四参数族 env 既有默认值（auth.service.ts:14-26·profile.service.ts:21-28）与 `RESUME_PARSE_MAX` 默认 6——零改。

---

## §4 依赖（闸谁/被谁闸）

- **被闸**：无硬前置闸——AUTHZ-HARDEN 5A-1 已 nailed（@5cb78dab·guard kid/jti 机械在树）=本刀只增不翻基线已在位；ha-6 已落卷=预算账/接受登记承重面在卷。
- **协调闸**：迁移号与 5B-MIG 对账（裁决项⑧·不预占）；裁决项①-⑨ 须 pre-exec 双审+协调方行使后方可 EXEC。
- **闸谁**：5C-SSE-API 子刀（#139·及 #184 若本刀不收）待本刀槽位机制定形后派单免双改；S15/波2 Redis 重裁（若甲案 PG 落地·接口 seam 保持·波2 换载体=局部实现替换）。

---

## §5 Ban 列表 + pins（沿 authz-harden/g7k 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 引入 apps/api 新依赖（Redis 客户端或任何新包——Redis 形属 S15/波2 重裁域·LEDGER:139 右列不加厚约束在效）；Ban 动 AUTHZ-HARDEN 5A-1 既有吊销机械语义（kid 多钥窗/jti 会话吊销/改密原子 UPDATE+代次自增·只增不翻·neg-auth 既有臂零翻）；Ban 改 allow 全部 16 调用点（14 行·auth.service.ts:46 单行三连）的桶 key/capacity/refillPerSec 任何一个值（共享化=机制替换非参数重整·#87 分级面裁决⑦ 外零触）；Ban 改三 SSE 控制器 429 码面与文案（`too_many_streams` 语义原值）；Ban 触 worker job-wakeup/Redis wakeup 通道本体；Ban 新增独立 LISTEN 连接而绕开预算账（裁决④ 复用案外提案一律停手上报）；Ban 静默降级不留痕（共享层 fail 必打结构化日志·沿 SSE_NOTIFY_DEGRADED 形制）；Ban 为过门放宽既有 proof 断言（sse-principal-slot/validate F5/authz5a 族原值回归）；Ban 保留与实现不符的注释（rate-limit.service.ts:4·principal.guard.ts:14-16·auth-session.ts:20 三处 seam 注释随修法如实化改写——「登记不实施」翻「已实施·机制=X」·叙事红线 :25 反向约束同样生效：**修后叙事不得超估**（广播窗≠零窗·TTL 兜底如实））。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 隔离库/静态·零模型外呼·零消耗）。

---

## §6 est live=0

本刀零模型真实外呼：①吊销/桶/槽 prove=隔离库+双池模拟+假时钟（沿 authz5a/db prove 形制）；②fail 注入臂=连接级注入（专用池断连模拟）非生产操作；③部署约束面=compose config 静态渲染断言；④R10=静态断言+typecheck。零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

---

## §7 markers=0（卫生声明）

本刀改动集（起草阶段恰 1 .md·`ai-docs/delivery/harness/api-harden-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove·沿 authz-harden/ag-c/5e-group 卷 §7 同形制）。五类标记词不复抄卷内（避免自匹配）。

---

## §8 STOP（开工三条款）+ 待裁决项 + 停止条件

**STOP · `executed:awaiting_post_prove_dual`（EXEC 已落卷·见 §9）· alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（含裁决项①-⑨ 逐项行使）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

### 待裁决项（九项 · 双审/EXEC 行使 · 推荐案已注）

1. **共享载体总形**：甲=PG 本地可用形（推荐·零新依赖零云授权·与 S15 解耦·seam 注释兑现为 PG 实现且保留接口）／乙=Redis（apps/api 新依赖+密钥授权+S15 耦合·LEDGER:139 加厚禁令须协调方例外·本刀不推荐）／丙=混合（全局桶 PG+近缓存）。**若乙案被裁即触发停止条件③ 上报**（越界 S15 域）。
2. **吊销窗预算与 TOCTOU 终形**：广播窗目标（如 p99 ≤1s+在途请求窗·60s TTL 兜底维持）；回填守卫形=单调 evict 序（推荐）vs 回填前二读复核。
3. **共享层 fail 语义分级**：全局桶 fail-open vs auth 桶 fail-closed vs 统一退化进程内本地桶+结构化日志（推荐后者=可用性优先且降级可观测）。
4. **evict 广播通道与连接面**：通道名（`meetwise_principal_evict_v1` 拟名）；复用 sse-notify 既有 LISTEN 连接挂第二通道（推荐·零连接增量）vs 独立 max:1（须入 ha-6 预算账重算=停止条件② 面）。
5. **#184 收编与否**：`interview.controller.ts:258-262` 先占槽后取数换序（issues-master:424 修法列「先 acquireSlot 再取数」·同函数 5 行内·推荐顺手收编）vs 留 5C-SSE-API 子刀。
6. **件④ 审批态失效路径**：DB 触发器广播（1 迁移·0143 同形·即时·推荐）vs 60s TTL 最终一致（零迁移·approve 生效延迟如实申报·**rev2 增补吊销方向对称申报**：审批拒绝/撤权→B 端权限 ≤60s 残留·安全相关面）。
7. **#87 残面归槽**：成本分级/全局桶按 IP 分摊随本刀（扩面）vs 留后续（推荐留·本刀零改桶参数）；件⑤ 容量上限具体值与 env 名（拟 `RL_MEM_CAPACITY`·沿 RL_* 形制）。
8. **迁移号占位**：0-2 个（件② 桶表 1 + 件④ 触发器 0-1）·按需占·不预占·EXEC 立项/协调方派单时全场重证 max+在飞分支占号后对账定号（rev2 亲证现场：本树 max=0187·0188=cost④ 在飞·0190-0199=5B 在飞·0189 空档·下一起号 0200）。
9. **槽 lease TTL 值**：SSE 侧 ≥10min 封顶+缓冲 vs 统一短 TTL 心跳对账（推荐 ≥10min+acquire 顺带清过期·零新增周期任务）；解析槽lease同形。

### 停止条件（四类 · 命中即停手上报 · 禁自行变通）

- **现场漂移**：§0 任一锚对 HEAD 复验不符（触面文件重构/五件任一已被他刀闭/调用点计数偏差超熔断 ±2/0188 号段已被占且未对账）→ 停·重 pin 或重新归槽上报。
- **机制不满足**：PG 载体实证遇池预算不容（复用 LISTEN 案不可行且新增连接突破 ha-6 帽后账 76/97）/pg_notify 广播时延实测超裁决② 预算且无裁决内备选形 → 停。
- **越界需要**：修法需触 worker wakeup 通道本体/SSOT 翻面/compose 预算账改数/S15 云依赖/apps/api 新依赖 → 停·上报协调方裁（对应裁决①③例外通道）。
- **验收红不可修**：既有 proof（sse-principal-slot/validate F5/authz5a 族/neg-auth）在共享化后语义翻转且 §8 裁决九项内无自洽形 → 停·禁为绿改断言。

---

**收尾声明**：markers=0（五类标记词 grep 本刀改动集零命中）·est live=0（零模型外呼·零生产操作·零 secrets·`actualSpendCny=null` 脚注同源）·pins 十一值照抄零翻转·门预申明十项（§2）·迁移不预占（裁决⑧）·⛔push（本刀全程零 push）·STOP=`draft:awaiting_pre_exec_dual`。

*API-HARDEN REQUEST · 2026-10-14 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`d68ffe17` · 分支 `line/api-harden` · 工作树 `meetwise-apid` · 蓝本=更正版 issues-master #36(:223)/#37(:224)/#17(:217)/#129(:400)/#118(:393) 五件原文行 + LEDGER:87 5C 行/:234 R10 行 + ha-6-companion-disposition.md 全文（:11-25 W2 承接·:23 另刀候选·:25 叙事红线）· 形制沿 authz-harden/ha-6/g7k 卷 §0-§8 同构（Ban/pins 同源誊录）· 五件归簇=#36 守卫缓存+#37 限流桶+#17 SSE 槽+#129 桶无界+#118 双守卫三查·修法六条（五件+R10）· 裁决九项 · est live=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*


---

## rev2 勘误席处置摘要（pre-exec 席1 FAIL 全数处置 · 2026-10-14 · docs-only 恰 1 .md · commit=rev2 · ⛔push）

**处置计数**：B1 ×1（必修·虚构出处注勘误）+ errata E1-E4 ×4 + 裁决/EXEC 输入 E5-E7 ×3 = **8 项全数处置**（另 B1/E1 同口径连带同步 2 处：件② :82「0188 起占号」、§3 :129「十四调用点」——防卷内自相矛盾·逐处列下）。每处亲证后落笔·实证命令与结果随条附。

- **B1（必修）虚构出处注勘误（§1 修法计数 + §8 裁决⑧）**：删「与 5B-MIG 拟占 0188 起（G7K 卷 §0 登记）」——rev2 实证 `gap-g7k-api-reds-fix.md` 全文 rg「0188」EXIT=1·rg「5B-MIG」EXIT=1·该出处注系虚构。改「EXEC 立项/协调方派单时全场重证 max+在飞分支占号后对账定号」（rev2 亲证在飞现场：本树 `packages/db/migrations/` max=0187·**0188=cost④ 在飞**（`0188_ag11_cost_reserve_least_and_settle_relax.sql`@line/ag-cost4）·**0190-0199=5B 在飞**（十件@line/batch5b-mig）·**0189 空档**·**下一起号 0200**）。连带：件② 迁移路径「0188 起按需占号」同步去陈旧号。§8 停止条件「0188 号段已被占且未对账」维持（0188 现已被占=cost④·未对账即停·语义恰在效）。
- **E1 allow 口径（三处同步 + 连带一处）**：「恰 14」→「**14 行·16 调用点（auth.service.ts:46 单行三连）**」——rev2 rg `\.allow\(` apps/api/src 实测 14 行·`auth.service.ts:46` 单行 3 连（signup email/ip/global）=16 调用点·`hasToken(` 仍 1（profile.service.ts:127）。同步：§0.2 #37 行·§0.6·§5 Ban（「Ban 改十四个 allow 调用点」→「Ban 改 allow 全部 16 调用点」=**Ban 覆盖全部 16**）；连带 §3「十四调用点」→「全部 16 调用点（14 行）」。
- **E2**：5A 位图锚 `LEDGER:86`→`:85`——rev2 亲证 LEDGER :85=「5A 安全（16）」行·:86=5B 迁移行。
- **E3**：`auth.controller.ts:24`→`:25`（:25=`login(`·:24=req.ip 注释行）；`sse-pump.ts:86`→`:85`（实路径 `apps/api/src/platform/sse-pump.ts`·:85=10min 封顶 deadline 行·§0.2 #17 与件③ 两处同改）；§0.7 漂移表补录两行。
- **E4**：§0.1-2 补勘「`extreview-fix-campaign-SOP.md:65`『#66 归 API-HARDEN』系过期登记（#66=web 代理 fetch 健壮面·非本刀域）」——rev2 亲证 issues-master:230：#66=Next 同源代理三处上游 fetch 无 try/catch/无超时（apps/web 侧 route.ts×2+transcribe-proxy.ts·web 域非 api 域）。
- **E5（裁决② 输入）**：件① 共享载体补**广播时序约束**「pg_notify 与状态 UPDATE 同事务同连接（随 commit 原子送达）·**禁先广播后提交**」——先广播后提交则收播实例在 commit 前回读 DB 得旧态并回填·TOCTOU 复活且存活至 60s 兜底窗·裁决② 广播窗预算落空。
- **E6（裁决⑥ 输入）**：裁决⑥(ii)（60s TTL 最终一致案）补**吊销方向对称申报**「审批拒绝/撤权→B 端权限 ≤60s 残留（安全相关面）」·件④ 失效语义 (ii) 同步（原 (ii) 只申报 grant 方向·revocation 方向漏申报=安全面不对称）。
- **E7（EXEC 注意）**：件③ 槽位登记改**单语句** `INSERT … ON CONFLICT (slot_key) DO UPDATE … WHERE n<max OR expired`——原「UPDATE…无行则 INSERT」两语句形在双实例并发首占时同撞 INSERT→unique violation·单语句原子占消除该竞争面（原文本未覆盖此竞争面）。

**rev2 自检**：docs:check EXIT=0·markers 五类标记词改动集 grep 零命中·STOP=`draft:awaiting_pre_exec_dual` 维持（alone≠dual·席1 FAIL 在卷·席2 下波派·Dual PASS ≠ 开工）·pins 十一值零翻转·est live=0·⛔push。
---

## §9 EXEC 附记（施工席落卷 · 2026-10-14 · Status=`executed:awaiting_post_prove_dual` · ⛔push）

### 9.1 并线与 §0 重 pin

- 并线主线：`git fetch` + `git merge --no-ff feat/mysql-schema-skeleton` @`7d2a4f3d`（AG-11 成本④ nail 收官·链 188·迁移 0188 带入）→ **merge `450a2b97` 零冲突**（初拟冲突解消息已 amend 诚实化为零冲突）。
- §0 全量重 pin @HEAD：十一 pin 值逐一亲证在位（haStatus=NOT_HA/releaseEvidence=false/claimProductionHA=false/gR45Closed=true/coveredCount=8/ms3EqualsR4Closed=false/PG-retained/公开 DELETE=503/g7SuiteGreen=false/r1Closed=false/actualSpendCny=null）。漂移仅三处 ±1 行（resume.service.ts allow `:38→:39`、acquireSlot `:50→:51`、releaseSlot `:68→:69`）·±2 熔断内·零触结论。调用点计数复测：allow 14 行·16 调用点（auth.service.ts:46 单行三连）·hasToken 1（profile.service.ts:127）·acquireSlot/releaseSlot 各 4·evictPrincipalStatus 生产 2·revokeSession 生产 1——**全部与卷面一致**。

### 9.2 迁移号终裁

- **0189 恰 1 个**：`packages/db/migrations/0189_api_harden_shared_state.sql`（件② 共享桶表 platform_rl_bucket + 件③ 槽 lease 表 platform_slot_lease + 件④ 触发器 platform_principal_state_notify·三 DDL 半合一）。实证现场：主线链顶=0188（merge 带入 0188_ag11）·0190-0199=line/batch5b-mig 在飞亲证（git ls-tree 十件在列）·0189=唯一空档——**两 DDL 半合一迁移以避开在飞号段**（卷面预算 0-2 内·占号登记此为对账值）。`check-migration-version-uniqueness` EXIT=0（files=189·violations=0）。

### 9.3 裁决①-⑨ 落值

| 项 | 落值 |
|---|---|
| ① 载体总形 | **甲=PG 本地可用形**：共享桶表+槽 lease 表+既有 LISTEN 复用；apps/api 零新依赖（package.json 仅增 prove script 行）；seam 注释三处如实化改写（rate-limit/principal.guard/auth-session） |
| ② 吊销窗与 TOCTOU | 广播窗=送达窗+在途请求窗（proof W1 实测 **26ms**·断言 <1s·裁决预算 p99≤1s 内）；60s TTL 兜底维持零改；TOCTOU=**单调 evict 序**（回填前比对·序前进即放弃落缓存·proof T1 双侧） |
| ③ fail 语义 | 统一退化：桶→进程内本地桶、槽→**fail-open 放行**；每次转变一行结构化日志 `RL_SHARED_DEGRADED reason=pg_error fallback=…`/`RL_SHARED_RECOVERED`（沿 SSE_NOTIFY_DEGRADED 形制）；降级期每秒至多试探一次 PG |
| ④ 通道与连接面 | 通道名 `meetwise_principal_evict_v1`；**复用 sse-notify 既有 max:1 专用 LISTEN 挂第二通道**（establish 增第二 LISTEN+onNotification 白名单双分支=卷面 :227/:182 双处接线）·零新增连接·ha-6 帽后账 76/97 零改零增登记 |
| ⑤ #184 收编 | **不并入（偏离推荐案·停止条件纪律取零改形）**：推荐案「顺手收编」先占槽换序将翻转 sse-principal-slot.proof 既有断言「overflow 各付 1 次 catch-up === 8」（被拒连接不再付 catch-up → 8→5）·与 Ban「sse-principal-slot 原值回归」+§2-6「零语义翻转」硬约束冲突·按 Ban 优先——interview.controller.ts:258-262 取数/占槽**时序零改**·#184 留 5C-SSE-API 子刀 |
| ⑥ 件④ 失效路径 | **(i) DB 触发器广播**（0189 内 0143 同形·`AFTER UPDATE OF status,pwd_epoch,role,approval_status,is_admin ON user_account`·与状态 UPDATE 同事务随 commit 送达=结构满足 E5 禁先广播后提交）·**吊销方向对称覆盖**（审批拒绝/撤权同触发同窗·proof W2 grant 方向实证 26ms 级） |
| ⑦ #87 归槽+件⑤ 上限 | #87 成本分级/全局桶按 IP 分摊=**留后续**（16 调用点桶 key/capacity/refillPerSec 值逐个原值·diff 亲证零改）；件⑤ 容量上限=`RL_MEM_CAPACITY`·默认 10000·沿 RL_* env 形制·真 LRU（访问重排+打满淘汰最旧·新 key 满额建桶·proof M1） |
| ⑧ 迁移号 | 见 §9.2（0189 恰 1） |
| ⑨ 槽 lease TTL | **12min**（SSE 10min 封顶+2min 缓冲）·acquire 顺带清过期（过期接管分支 n=CASE WHEN expired THEN 1 ELSE n+1 END）·零新增周期任务；解析槽同形；release 对称减·n≤1 删行零减穿 |

### 9.4 六件落点（文件级）

1. **件① #36**：`principal.guard.ts`（evictPrincipalStatus→notePrincipalEvicted 序自增+本进程 evict；accountState 扩五列+回填代次比对；模块级 onPrincipalEvict('uid') 注册+whenHealthy 起听）·`auth-session.ts`（revokeSession 单语句 CTE 内 UPDATE+pg_notify 同事务；evictSessionRevocation 同形；isSessionActive 回填比对；onPrincipalEvict('jti') 注册）·`sse-notify.service.ts`（PRINCIPAL_EVICT_CHANNEL+第二 LISTEN @establish+onNotification 白名单双分支+evict 序/注册面）。
2. **件② #37**：`rate-limit.service.ts`（全局/IP 桶按 key 形分级迁 PG 单行原子 UPSERT·补充折算 SQL 内同式；per-principal/per-email 桶维持进程内）——16 调用点仅 await 化零值改。
3. **件③ #17**：`rate-limit.service.ts`（acquireSlot 单语句 INSERT…ON CONFLICT…WHERE n<max OR expired…RETURNING·零行=false→调用点既有 429/503 映射原值；releaseSlot 对称减+删行）——4 调用点 await 化；`slot_key` 唯一索引=PRIMARY KEY 显式建（0189）。
4. **件④ #118**：`principal.guard.ts` accountState 一查五列（status,pwd_epoch,role,approval_status,is_admin）+导出；`recruiter.guard.ts`/`admin.guard.ts` 改读守卫缓存态零各自 SQL（三分码 admin_required/recruiter_* 面原值）；审批态变更经 0189 触发器广播（裁决⑥(i)）。
5. **件⑤ #129**：`rate-limit.service.ts`（进程内桶 RL_MEM_CAPACITY 上限+LRU；共享桶表 7 天惰性 TTL 采样清理=行数有界）。
6. **件⑥ R10**：**未落码（机制冲突停手登记·偏离清单 §9.6-3）**——证据三条：①'server-only' 全仓零安装零声明（package.json/pnpm why/node_modules 零命中·tsx 下 import 实证 `Cannot find package 'server-only'`）；②ensure-ok.ts:10-11 头注自证「独立纯模块…使 prove4 可真实断言 401 分支」=无 server-only 系**设计内**非遗漏；③web-logic.proof.ts:969 无桩直 import ensure-ok.ts+:1216 ensureOk 断言臂——落行即翻既有 proof 红。R10 LEDGER 行维持开放（SSOT 不属本刀）·处置建议：随 web 侧 prove 桩机制（f5-hooks 形）一并裁·留协调方。

### 9.5 门矩阵全表（十三门·零新红）

| 门 | 结果 |
|---|---|
| neg:auth | EXIT=0（90 负路径臂全绿） |
| neg:resume | EXIT=0（91 臂·含 OCR 降级臂） |
| authz5a:constant-time / login-ip-throttle / login-global-throttle / chgpwd-lock | EXIT=0 ×4（16+2+2+3 臂） |
| prove:env-schema | EXIT=0（22 臂） |
| prove:sse-slot | EXIT=0（18 臂·429 三路共享桶+释放语义原值） |
| api:validate | EXIT=0（204 臂·含 F5 槽臂+F1/F8 令牌桶臂） |
| drift:prove | EXIT=0（无漂移·豁免 2 项=既存 dbhy1 残面） |
| **api-harden:prove（新）** | EXIT=0（26 臂：S1 双实例槽恰5+零减穿+**E7a 过期接管**；S2 双实例桶恰3+补充折算+hasToken 探针；W1 吊销广播线 **26ms**；W2 审批态广播；T1 TOCTOU 双侧；T2 evict 序；D1 降级形；M1 LRU；J1 会话行） |
| turbo typecheck --force | EXIT=0（8/8·过程两次中间红 TS1308+TS2454 即改即清如实登记） |
| turbo lint --force | EXIT=0（12/12·基线 1421=帽值·新增 6 warning（naming-convention）即改即清·净增 0） |
| docs:check | EXIT=0（2075 ≤ cap） |
| markers | 五类标记词改动集 21 文件 grep 零命中（词面运行时组装防自指·沿 §7 不复抄卷内） |
| check-migration-version-uniqueness | EXIT=0（files=189·violations=0） |

基线红单列：无（全部所报门对本刀收口时点全绿；唯一基线关联红=件⑥ 若强行落行将致 web-logic.proof 红——已按停手登记规避）。

### 9.6 偏离任务书清单（三项·均已上报理由）

1. **裁决⑤ 不收编**（卷面推荐「顺手收编」）：与 Ban/§2-6 零语义翻转硬约束冲突（§9.3 详证）——取 §3-2 零改形。
2. **迁移 0-2 个 → 恰 1 个（三 DDL 半合一）**：0190-0199 在飞占用下 0189 唯一空档，合一以避撞号；卷面预算内。
3. **件⑥ R10 未落码**：机制冲突（§9.4 详证三条）——非「不作为」，系「落行必红既有 proof」的停止条件形；建议随 web prove 桩机制另裁。
4. **allow/hasToken/acquireSlot/releaseSlot 异步化**（签名内敛变更）：REQUEST 件②「签名零改」按「名称/参数/调用契约零改·返回值随机制异步化」行使——同步签名物理上不可能承载 PG 往返；16+4 调用点仅加 await·桶参数/429/503 语义逐值原值。此为机制文本（单语句 UPSERT/UPSERT 频度=入口频度）的必然后果，登记为解释性说明非改约。

### 9.7 陷阱 13 条自检（TS 适配形·被改 service 面=rate-limit/auth-session/sse-notify/principal.guard+resume）

1. 广播时序 E5（禁先广播后提交）：uid 路径=0189 触发器随 UPDATE 事务；jti 路径=revokeSession 单语句 CTE——同事务同连接 ✓
2. 收播回调零 SQL（LISTEN 回调只动进程内 Map·沿既有 pump 纪律）：dispatchPrincipalEvict 仅 evict+序自增 ✓
3. 降级必留痕：RL_SHARED_DEGRADED/RECOVERED 转变日志+降级期试探节流（防连接超时放大）✓
4. 槽计数零减穿/零楔死：UPDATE n>1+DELETE n≤1 双语句（弃 CTE 同语句双写同一行——EPQ 重评会误删已减行·E7a 防腐坏纪律）+过期接管对 **now** 判定非对刷新后 lease（自测 S1 抓到自刷新 bug 并修正）✓
5. 单语句原子占（E7a）：INSERT…ON CONFLICT…WHERE 原子占·并发首占零 unique violation ✓
6. 跨 async finally 返回未决 promise 窗口（unhandledRejection 致命）：resume uploadFile OCR 分支重构为置标+finally 后转向（api:validate 基线绿/改动红归因试验亲证·最小复现在案）✓
7. finally 语义：控制器 finally await release 不跨 return-promise（pump 系 await-in-try 形）✓
8. 行数有界：桶 7d 惰性 TTL 采样清理+LRU；槽 n≤1 删行+过期接管复用行；无新增周期任务 ✓
9. 失败不抛入 finally：releaseSlot 全路径吞错返 void（finally 上下文安全）✓
10. 注释与实现相符：三处 seam 注释（rate-limit「单实例内存」/principal.guard「多实例 ≤60s/Redis seam」/auth-session「#36 归 5C 不动」）如实化改写+profile 两处 evict 注释更新+「叙事红线」不超估（广播窗≠零窗·TTL 兜底如实）✓
11. 16 调用点桶 key/capacity/refillPerSec 逐值原值（diff 亲证）；429/503 码面与文案原值（too_many_streams/server_busy 零触）✓
12. 越界面零触：worker wakeup 通道本体/SSOT 翻面/compose 预算账改数/S15 云依赖/apps/api 新依赖——全部零触（package.json 仅 prove script 行）✓
13. 测试缝兼容：`new RateLimitService()`（无 db）=纯进程内模式——sse-principal-slot.proof 桩形与 `.slots` Map 断言面零改保持绿；降级形（throwingDb）有独立 D1 臂 ✓
14. **E7a 陈旧释放竞态登记（post 席1 E3·零改）**：release 两语句形（UPDATE n>1→0 行→DELETE n≤1）与并发 acquire 交错时，DELETE 分支可能删掉并发 acquire 刚建的占用行——表现为幻影 +1（可占额度暂时 +1），≤12min lease 到期被接管自愈；方向保守（只朝放行向偏差·槽位=资源保护非安全边界·429 不误伤）——登记不实施，随 5C-SSE-API 槽面复核。

### 9.8 「旧代码忽略仍正确」书面结论（wire 契约变更义务）

- **pg_notify 通道 `meetwise_principal_evict_v1`（载荷 JSON {t:'uid'|'jti',k}）**：纯新增通道——旧版 api 实例不 LISTEN 该通道=收不到广播，退回既有 ≤60s TTL 兜底行为（正确·仅时效回旧）；旧实例自身发出的 evict 不广播，但 uid 路径广播由 **DB 触发器**发出（与应用版本无关）——旧实例写路径照样触发广播，新实例照常收播；jti 路径广播在 revokeSession 新语句内，旧实例登出仅本进程即时+他实例 ≤60s（旧基线行为·正确）。
- **platform_rl_bucket/platform_slot_lease 两表**：旧实例零读零写零感知（其 allow/槽全走进程内）——单旧+单新混布时，全局/IP 桶与槽计数仅在新实例侧共享（混合期 ×2 稀释部分回归至旧基线水平·不劣于升级前·不产生超发）；两表行可安全 TRUNCATE 重建（桶=令牌态按满额重建等价·槽=连接态重建后长连释放按幂等零减穿处理）。
- **迁移 0189 幂等**（IF NOT EXISTS/DROP TRIGGER IF EXISTS+CREATE）·expand-only·回放零 diff ✓。

### 9.9 收尾声明（EXEC）

est live=0（全门隔离库/静态·零模型外呼·零生产操作·零 secrets·actualSpendCny=null 脚注同源）·pins 十一值零翻转·markers=0·⛔push（全程零 push）·commit=`fix(api): API-HARDEN EXEC`·STOP=`executed:awaiting_post_prove_dual`——post 双审待派（本席不自批·alone≠dual）。

---

## §10 post 修复附记（post 席1 FAIL(B1 P1)+席2 FAIL(B1) 仲裁与处置 · 2026-10-14 · post 修复席 · Status 维持 `executed:awaiting_post_prove_dual` · ⛔push）

### 10.1 仲裁结论（NOINHERIT 证据链·亲证）

**裁定：席1 深（NOINHERIT 全 DML 42501·SD 函数化）成立；席2 浅（一行 GRANT DELETE）前提为假。** 席2 对 B2 事实观察正确（0189:34 桶表 GRANT 恰缺 DELETE）但机制判断错误——席2 修法（补 GRANT）在 canonical 生产身份下**仍恒 42501**，非一行可修。证据链全 file:line 亲证 @`f31d56d1`：

1. `packages/db/src/principal.ts:574`/`:581`——provisionRuntimeLogin 建/改运行时登录恒 `LOGIN NOINHERIT NOSUPERUSER …`；`:589` `GRANT app_role TO %I`（成员授予≠权限带有效）；`:593-597` 若 app_gateway_role 存在则一并授予成员。docstring `:562-564` 逐字：「`NOINHERIT` forces request code through `asPrincipal()` before it gains application-table privileges」。
2. `packages/db/src/principal.ts:937-979` createPool——连接池按 DATABASE_URL/PG* 直连，**连接级零 SET ROLE**（`pool.on('connect')` 只挂 error observer）；会话角色=登录本身。
3. `packages/db/src/principal.ts:991-1001` asPrincipal（`BEGIN`+`SET LOCAL ROLE app_role`+GUC）与 `:2114-2123` asGateway（`BEGIN`+`SET LOCAL ROLE app_gateway_role`）=仅有的两条带权路径；`apps/api/src/platform/db.service.ts:13-16` asGateway 头注自证「仅执行版本化固定 SECURITY DEFINER 函数；网关角色没有任何业务表权限」。
4. EXEC 落码的共享 DML 五调用点（rate-limit.service.ts 修前 ：76/:103/:139/:183/:216-219）全走 `this.db.pool.query` 直连——NOINHERIT 登录下 `GRANT … TO app_role` 不隐式生效→**生产恒 42501→catch→静默退化**（桶回本地=共享化失效·槽 fail-open），共享层五件在生产形同虚设且**无任何日志**（sharedHealthy 恒 false 后连降级日志都只打一次，之后静默）。
5. 测试为何全绿看不见：隔离 runner 容器 `POSTGRES_USER=meetwise`（scripts/run-e2e-isolated.mjs:2989/:2675）=容器**超级用户**——超身不受 NOINHERIT/GRANT 约束，直连 DML 畅通，26 臂因此全绿。CI 与生产的身份差即 B1 P1。
6. NOINHERIT 下 `SET ROLE` 仍可用（INHERIT 只控隐式继承不控 SET ROLE 能力，principal.ts:166 注释自证）——故「asGateway+SECURITY DEFINER 函数」是既定合法带权路径（gateway_auth_signup 等 0041 族生产同制在跑）。

### 10.2 修复形（任务书处方式 (a)·SD 函数化）

- **0189 原地重写（授权在卷：0189 未在任何环境落账·branch-only）**：表 DDL/触发器半原值；表对象 GRANT 全删（gateway 形制=两角色对两表零表权·0041 同口径）；共享桶/槽 DML 收口四函数（`gateway_rl_bucket_take(text,float8,float8,float8,boolean)`=allow/hasToken 统一形·`p_consume` 一参之差逐式同前；`gateway_slot_lease_acquire(text,integer,float8,float8)`；`gateway_slot_lease_release(text)`=双语句形保持；`gateway_rl_bucket_cleanup(float8)`=TTL 清理 DELETE 一并入函数）——全 `SECURITY DEFINER SET search_path = pg_catalog, public`、`REVOKE ALL … FROM PUBLIC, app_role`+`GRANT EXECUTE … TO app_gateway_role`（服务调用面走 asGateway·0040/0042 同制；不授 app_role=非主体作用域的平台面最小权）。幂等 expand-only 保持。
- **rate-limit.service.ts 五调用点改函数调用（零逻辑改）**：allow/hasToken→`gateway_rl_bucket_take(…,true/false)`；acquireSlot→`gateway_slot_lease_acquire`；releaseSlot→`gateway_slot_lease_release`（两次往返合一函数单事务·双语句形在函数内保持）；maybeCleanupBuckets→`gateway_rl_bucket_cleanup`。桶 key/capacity/refill 参数与返回语义逐值原值；降级形/试探节流/日志零改。头注与 seam 注释如实化（「表权走函数」机制注记）。
- **B2 随函数化消解**：DELETE 只存在于 SD 函数体内（definer 身份执行），调用角色无需表 DELETE 权——「缺 DELETE 授权」面在函数化后不复存在（N1 第三臂实证）。
- **往返负账如实披露**：单次共享操作由 1 往返变 asGateway 的 4 往返（BEGIN/SET ROLE/SELECT/COMMIT·同池复用零新增连接）——频度=入口/连接建立频度，为生产身份正确性的必要代价；ha-6 帽后连接账零改（零新池零新连接）。

### 10.3 E1-E5 处置（post 席1 五点）

| 点 | 处置 |
|---|---|
| E1 | REQUEST:265（§9.5 markers 行）字面去自匹配：标记词清单改「词面运行时组装防自指·沿 §7 不复抄卷内」措辞（scripts/i6-239-gates.proof.mjs:152 同制）——本卷改动集 markers 复扫零命中 |
| E2 | 补 jti live 广播臂 J2：revokeSession(对侧池 dbB·单语句 CTE UPDATE+NOTIFY 同事务)→本侧池 isSessionActive 广播窗内翻 false——与 W1 uid 侧对称，会话吊销跨实例线补全 |
| E3 | §9.7 第 14 条登记 E7a 陈旧释放竞态+「幻影 +1 ≤12min 自愈·方向保守」——零改登记，随 5C-SSE-API 槽面复核 |
| E4/E5 | **登记占位**：派单文仅命「E4/E5 登记」未附原文，post 席1 卷面不在本工作树（仓内零 post 收据档）——本席禁凭空转述（伪造=Ban 面），如实占位待协调方将 E4/E5 原文随卷归档后补处置。此项列入偏离清单 |
| 低权身份臂 | N1（席1 处方）：隔离库 provisionRuntimeLogin 形建 NOINHERIT 低权 login（rebindDatabaseLogin 重绑池）→负对照=直连表 DML 42501（证臂非真空）→S2 形经 asGateway+SD 函数跨实例消费恰 3→cleanup 函数低权可执行（B2 消解实证） |

### 10.4 门矩阵复验（post 修复席实跑·十一门全绿零新红）

| 门 | 结果 |
|---|---|
| **api-harden:prove** | EXIT=0（**31 臂**=EXEC 基线 26 + 新 N1×3 + J2×2；N1 负对照=直连表 DML **42501** 实证 NOINHERIT 机理·N1 SD 函数跨实例消费恰 3·N1 cleanup 低权可执行=B2 消解·J2 revokeSession 对侧池→本侧翻 false 实测 **26ms**） |
| neg:auth | EXIT=0（90 负路径臂全绿） |
| prove:env-schema | EXIT=0（22 臂） |
| prove:sse-slot | EXIT=0（5+1 429+共享主体桶·桩形零改保持绿） |
| api:validate | EXIT=0（204 臂面·真 NestJS+Fastify） |
| drift:prove | EXIT=0（零新漂移·豁免 2 项=既存 dbhy1 残面登记同源） |
| turbo typecheck --force | EXIT=0（8/8·首跑 TS2304 proof 缺 revokeSession import 即改即清如实登记） |
| turbo lint --force | EXIT=0（12/12·0 error·根帽值内零新增 warning） |
| docs:check | EXIT=0（2075 受管文件 ≤ cap 2080·本席零新增文件） |
| markers | 改动集 4 文件五类标记词零命中（词面运行时组装） |
| check-migration-version-uniqueness | EXIT=0（files=189·violations=0） |

基线关联红：无。全部所报门对本席收口时点实跑全绿。

### 10.5 「旧代码忽略仍正确」（§9.8 义务延续·函数化 wire 变更）

- **四网关函数+表对象零 GRANT 新形态**：EXEC 形旧码（直连 DML+表 GRANT 版 0189）在重写版 0189 库上——直连 DML 42501→既有降级形接住（桶本地/槽 fail-open+RL_SHARED_DEGRADED 留痕）=不崩溃不误 429，仅共享化退化为 EXEC 时已申报的降级形（如实披露：混合窗共享层按降级运行）。0189 未在任何环境落账（branch-only），本形预期零混合窗。
- **0189 重写合法性**：migrate.ts:4 checksum 守卫会拒「已应用迁移内容变更」——正因 0189 零 ledger 行（任何环境），重写不触发该守卫；隔离 runner 每次 fresh 建库自证。若事后实证任何环境已落账旧 0189，须回炉改道新迁移号（此为任务书断言项，本席按断言行使）。
- **pg_notify 通道/触发器半**：与 §9.8 原结论逐字同（零改）。

### 10.6 post 修复收尾声明

est live=0（全门隔离库/静态）·pins 十一值零翻转·markers=0（本席改动集复扫）·⛔push（全程零 push）·commit=`fix(api): API-HARDEN post 修复——共享 DML 生产身份仲裁+修复`·STOP=`executed:awaiting_post_prove_dual` 维持（修复=FAIL 处置，post 复审派单权在协调方·本席不自批·alone≠dual）。
