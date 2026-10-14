# 5C-API-HARDEN REQUEST（批5 5C 子刀 · 进程内状态共享化 + 部署约束 · #36/#37/#17/#129/#118 五件 + R10 顺手 · docs-only 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `apid-draft` · docs-only 恰 1 .md 零码动 · Ban coding · Ban prove 实跑 · Ban self-approve · **alone≠dual** · **Dual PASS ≠ 开工** · **⛔push** · 本 commit 不预claim 任何 post-commit EXIT）
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

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（含裁决项①-⑨ 逐项行使）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

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