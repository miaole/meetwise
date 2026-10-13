# BATCH2-C1 REQUEST（批2 域刀 C1 · 外呼检索与 invoke 域收尾刀 · 四件修法 #80 外呼源裁决 + #119 流式读/超限 abort/解析后 IP 校验 + #173 follower 指数退避 + #171 接线三前置书面契约 · docs-only 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·零码动·待 pre-exec 双审两外席 **BOTH PASS** 落卷 + 协调方明示授权后方可 EXEC 立项·**Ban self-approve** · **alone≠dual** · **Dual PASS ≠ 开工** · ⛔push）。

**席位**：批2 域刀 C1 REQUEST 起草席（批2 H7 挂账四件收刀·协调方派单）。
**基线**：`feat/mysql-schema-skeleton` @ `f0147886`（起草时主线 tip·`git log -1` 实测 2026-10-13·AG-COST3 成本轨③ nail 收官随翻三件 docs commit）·分支 `line/batch2-c1`·工作树 `meetwise-b2c1`（`git worktree add ../meetwise-b2c1 -b line/batch2-c1 f0147886` 本起草席已立·建前 `worktree list` 无同名树·`git branch` 无同名分支双查实测）。origin fetch 当时 SSL 失败（离线窗）·本地 `feat/mysql-schema-skeleton` 与 `origin/feat/mysql-schema-skeleton` 同步且 `origin/main` 为其祖先（merge-base 亲证）——EXEC 立项照 §0 协议对届时 tip 重 pin。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①外部审计总表**更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md`（本机外部件·不入仓）四行原文亲读：**#80 `:470`**（P3·AI能力缺口·面试中·「CRAG 外呼兜底硬编码 6 个英文站点 ?q= 搜索页，与中文查询不匹配」·旧锚 `apps/worker/src/main.ts:77-88,91,528`·「已核实（有效性未联网实测）」·修法「评估后改为中文可用的受控来源，或默认关闭外呼兜底」·关联 #119·第2批）；**#119 `:394`**（P3·技术缺陷·面试中·「外呼抓取先读完整响应再截断，字节上限形同虚设；SSRF 只比对 host，DNS rebinding 残留」·旧锚 `packages/domain/src/web-explore.ts:50,177-182；apps/worker/src/main.ts:528`·「已核实」·修法「流式读取并在超限时 abort；解析后校验解析 IP 非私网」·关联 #80·第2批）；**#171 `:416`**（P3·技术缺陷·面试中·「semantic-route.ts 是未接线的『生产 RAG 漏斗』，接线前需解决 ledger 只增、超时不 abort、绕开 invoke 计费」·旧锚 `packages/ai-runtime/src/router/semantic-route.ts:1-45,133-134,147,171,212`·「已核实（更正后）」·修法「文件头明确『未接线』；接线时走 invoke 关口并补 abort」·第2批）；**#173 `:418`**（P3·技术缺陷·面试中·「invoke follower 仍 20ms 轮询等待同 key 结果，N 个 follower 线性放大 DB 事务」·旧锚 `packages/ai-runtime/src/invoke.ts:612-620`·「已核实」·修法「改指数退避或 LISTEN 唤醒」·第2批）。②批位登记=`ai-docs/delivery/harness/product-campaign-LEDGER.md` 批2「其他」行 `:59`（「#80/#119（外呼）#171（未接线）」在册）+水位行 `:210`（批2 41/54·残 13·H7 挂账 12 件含 #80/#119/#171/#173「归 5E/域刀」）——本卷即该四件域刀向之起草兑现。③仓库工作流门=`AGENTS.md`（文档先行/契约先行/测试先行·P0 不默认信任 AI 产出·变更后只走 `ai-docs/skills/testing/sop.md`）。

## §0 现状锚（起草席亲读·全部 file:line 对本树 HEAD `f0147886` rg/sed/Read/git ls-tree 实测·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建前实测（主仓+5e/a34/ag19/ag24/ag37/ag38/ag39/aga/agb/agc/agd/age/agf/authz/b5m/bill1-bill4/billrev/blite/ciw2/cost1-cost3/e2sc/i263/i6/integrate/line-entpay/parity2/qsec/regfix/ttlwire 等）——**无 b2c1 树**；建树后 `line/batch2-c1` 唯一。
- `rg -l "batch2-c1" ai-docs/delivery/harness/` 建前零命中——本卷落卷后唯一同名卷=本卷·无他卷冒名。

### 0.1 blob 锚表（`git ls-tree` 亲算 @`f0147886`）

| 文件 | blob（8 hex·括号全 40 hex） | 关键行锚（起草席逐行亲读） |
|---|---|---|
| `apps/worker/src/main.ts` | `950417b5`（`950417b52fff8acf3b11c62dcbaf1b9d3f52324d`·全 **841 行**） | import :14（`webExplore, deepExplore, createSafeFetch, AllowedSource, RawFetch` 自 `@meetwise/domain`）·头注 :81-84（「默认非空 = CRAG fallback 真外呼已启用(SSRF 门在 createSafeFetch/isAllowed 里承重)」:83）·`src()` 构造器 **:85**·**`DEFAULT_WEB_ALLOWLIST` 六英文站 :86-93**（postgresql.org :87 / kubernetes.io :88 / redis.io :89 / developer.mozilla.org :90 / nginx.org :91 / en.wikipedia.org :92·各站 `?q=` 检索端点）·env 覆盖注 :95-98（「env WEB_ALLOWLIST 覆盖(逗号分隔域名)。未设 → 用默认权威源;显式设空串 → [](关闭外呼,只用本地题库)」:96）·**`resolveWebAllowlist` :99-103**（raw===undefined→默认 :100·split/trim/lowercase :101·通用 `?q=` 占位 :102）·组合根接线 **:544-549**（WEB_ALLOWLIST 解析 :546·rawFetch 手动包一层 :548·**`createSafeFetch(rawFetch, WEB_ALLOWLIST, { timeoutMs: 8000 })` :549**）·consumer seam **:626-630**（webExplore 兼容缝 :628·**`deepResearch: WEB_ALLOWLIST.length > 0` 门 :629-630**）·启动日志 :649 |
| `packages/domain/src/web-explore.ts` | `82d978da`（`82d978dab10cdbfb3bd01beaba4efe594f9bda1a`·全 **245 行**） | 头注 :1-11（SSRF 承重铁律 :6-8·**DNS rebinding 残留自白 :9-10**：「isAllowed 校验的是 host **字符串**,不是解析后的 IP。allowlist 域若把 DNS 指向私网 IP 仍可绕过。彻底堵需『解析 DNS→校验 IP→pin 该 IP 连接』,属带 IO 的加固,不在纯逻辑层;此处标注,生产网络层/出口代理再兜」）·`AllowedSource` :14·`FetchFn` :16·**`isPrivateHost` :22-51**（IPv4 全段判定 :26-40 含 0/8·127/8·10/8·172.16/12·192.168/16·**169.254/16 云元数据 :37**·CGNAT :38·组播 :39·IPv6 :43-48·**普通域名放行 :50**「(DNS rebinding 风险见文件头注释)」）·**`isAllowed` :53-62**（协议白名单 :57·isPrivateHost 前置 :59·host **字符串**对 allowlist 相等/子域比对 :60）·**`RawResponse` :81（仅 `text(): Promise<string>`——无流式/字节面）**·`RawFetch` :82（`redirect:'manual'`+`signal`）·`SafeFetchOpts` :84（maxRedirects/timeoutMs/maxBytes）·**`createSafeFetch` :154-188**（maxRedirects=4 :155·timeoutMs=8000 :156·**maxBytes=8000 :157**·共享 deadline :161·每跳 isAllowed :163·`AbortSignal.timeout(remainingMs)` :166·手动逐跳重定向 :167-172·非 2xx 拒 :173·**整读再截断 :177-182**：「`(await res.text()).replace(script/style/comment)…replace(去标签).slice(0, maxBytes)`——先全量读 body 再截断=字节上限在传输层形同虚设（#119 定谳承重锚）」·超跳数 :185·fail-soft :186）·`deepExplore` :196-233（预算 :199-204·Promise.all 并发 :209·源级 isAllowed :213/:216·字符预算 :220-231）·`webExplore` :236-245 |
| `packages/domain/test/web-explore.proof.ts` | `38d29dfd`（`38d29dfdbf94b823c90095700986eebbbe9856bc`·全 **111 行·`A(` 恰 **24 臂**亲数**） | 头注 :1（门名 `pnpm web-explore:prove`）·import :2·SSRF 臂 :19-27（云元数据/localhost/环回/10/8/192.168/16/172.16-31 边界/IPv6）·fake 构造器 **:44-46**（`resp(status,opts)` 仅 `text()` 返回——**全 proof 唯一 RawResponse 构造点·#119 扩面的单点改处**）·`rec` 记录器 :47·safeFetch 臂 :50-87（200 去标签 :50-52·逐跳 :53-62·Location 缺失 :71·重定向环 :74·总超时 :81·抛错 fail-soft :84·非 2xx :87）·deepExplore 臂 :102-108 |
| `packages/ai-runtime/src/invoke.ts` | `030d273b`（`030d273b1dd0d8e9541244a9d3550b314b179bb5`·全 **1119 行**） | `sleep` 定义 **:259**（`(ms) => new Promise(setTimeout)`）·`MODEL_INVOCATION_WAIT_MS` :321（默认 35_000·界 100-120_000）·**GODFN-1a 冻结注 :488-492**（五相位编排 :489-490·**「错误码/抛序/SQL 事务边界/时序常量（sleep(20)/60s lease/deadline）零变，导出面签名零变」:492——该冻结系 GODFN-1a 重构自等价声明·#173 行为修刀须随改此注而非绕行**）·**claim 相位 :710-738**（头注 :710「GODFN-1a 相位 2/5 · claim（原 :463-482 逐字搬移 · durable claim 轮询 + follower 20ms 真轮询）」·claimModelInvocation :716·`leaseSeconds: 60` :718·execute :729/cached :730/failed·unknown :731·**deadline 强制 `model_invocation_wait_timeout` :732**·**follower 轮询 :733-735：「Followers must join, never execute.  20ms is still a real poll of durable status (claimed/dispatching → succeeded), not an in-process single-flight.」+ `await sleep(20)`——#173 承重锚**） |
| `packages/ai-runtime/test/claim-join-orphan.proof.ts` | `9edc2dfc`（`9edc2dfc15470ccd1924df0c4cab3ce52c4e25cb`·全 **186 行·`assert(` 恰 **5 断言臂**亲数**） | 头注 :1-10（0130 同键 join 契约证明·需 DATABASE_URL·不启 Docker·不加新迁移）·双 claim 并发 execute=1/wait=1 :134-138·双 invoke 并发 calls=1 同值 :151-156·孤儿 permit 清理后 calls=1 :171-179·**在 ai-runtime 默认 prove 链内**（`packages/ai-runtime/package.json:14`「prove」=runtime-kernel && claim-join-orphan && diag-honesty && ag24 四连） |
| `packages/ai-runtime/test/runtime-kernel.proof.ts` | `6db1edea`（`6db1edea01cda0d452d24a3a748ab72a23396f2e`） | 生产拒毫秒级执行时限 :195-197·非法 wait 预算→`model_invocation_wait_invalid` :199-206·E2 双并发 execution-timeout 派发一次收口一致 :208-213——**#173 改轮询形后此三门（wait 无效拒绝/deadline 超时/并发 join）为回归基线** |
| `packages/ai-runtime/src/router/semantic-route.ts` | `fb11ee46`（`fb11ee46ba6fc6ec055abedea69808d13e929fbd`·全 **260 行**） | 头注 :1-34（「生产 RAG 语义/LLM 意图分类漏斗（Stage S · scripted/fixture 缝 · 零外呼）」:2·CMD 消歧 :4-7·漏斗三层 :9-18·「只建议、不授权…不得替代 R4 硬过滤」:20-22·**Stage S 授权面 :24-28：「modelClassify 只能是注入的受控 seam…本模块零网络客户端构造、零 provider 外呼。Stage L（真模型 live eval…）不在 Stage S 授权内——须 EXEC 再显式授权（AD P4）+ 预算重报 + 阈值先冻…」**·**pins :30-33（含「router 生产接线宣称 ≠ … ≠ closed」:32-33——**头注现状无『生产未接线』明示句，pins 仅以否定式暗载**）**·`costHardCapCny: 20` :129-130·`SEMANTIC_ROUTE_SEAM_TIMEOUT_MS` :134·`SemanticRouteClassifierOptions` :136·**`withTimeout` :147-160（setTimeout 到点仅 `reject(new Error('semantic_route_seam_timeout'))`——**底层 promise 不 cancel=超时不 abort（#171 定谳承重锚之一）**）·`createSemanticRouteClassifier` :162-165（**进程内 `ledger` 数组 :165**）·**`ledger.push` 只增 :171**·`classify` :175·**`await withTimeout(...)` 调用点 :212**·`attempts: () => [...ledger]` :259（**ledger 只增面收官读点**） |
| `packages/ai-runtime/src/index.ts` | `e6ecc64e`（`e6ecc64ef77848dba0fed533425523131c2da94c`） | **AG-24 删除面自证 :196-198**：「进程内限流/熔断残留(circuit-breaker.ts/rate-limit-model.ts)已删:MODEL-OP-02(迁移 0120)的共享权威(ai_model_admission_acquire_scoped·model-admission.ts)在 invoke() 内统一裁决并发/熔断。」·`failoverModel` 活导出零字节保留 :199——**本刀 #173 修法不得复活任何进程内限流/熔断面（Ban 依据）** |
| `apps/api/src/platform/rate-limit.service.ts` | （在树·本刀零触） | HTTP 层登录/报名频控面（#129 域·第5批）——与 AG-24 已删的 ai-runtime `rate-limit-model.ts` 同名异域·**本刀零触** |
| `ai-docs/delivery/harness/product-campaign-LEDGER.md` | （SSOT 只读） | 批2「其他」行 :59（#80/#119/#171 在册）·批2 水位 :210（41/54·H7 挂账 12 件含四件）·**:456「迁移链纪律 0184 先于 0185 落地」（AG-COST3 nail 登记行——0185 号已被计费链预订占位·本刀零迁移·若双审裁定需迁移须协调方另行分配）** |
| `packages/db/migrations/` | 目录实测 | **恰 184 个 .sql·tip=`0184_ag12_estimator_claim_freeze.sql`·0182/0183 空号**——四件修法均零 DB 面→**本刀预期零迁移（实证结论·§4-③）** |
| 根 `package.json` | `9e16ab22` | **`web-explore:prove` :521**（`pnpm -C packages/domain prove:web-explore`）·`adaptive-consumer:prove` :515-516（run-e2e-isolated 门）·`ag-d-admission:prove` 等门编排同区 |
| `apps/worker/test/adaptive-consumer.proof.ts` | （回归基线参照·31 臂） | `webExplore`/`deepResearch` 注入在 **consumer deps seam** :143-144（`async () => []`/`async () => [doc]` 形——非 RawResponse 面）·deep 断言 :186——**RawResponse 接口扩面不经此缝·该 proof 预期零改零红**（EXEC 收据复核登记） |
| `.github/workflows/ci.yml` | — | node-version: **22**（:39·本地 v22.22.3 同大版）——`AbortSignal.any`/undici `Response.body`（web ReadableStream）可用性成立（#119 修法形状前提） |
| `scripts/ai-docs/check-docs.mjs` | — | 本树起草前基线亲跑 **EXIT=0·scanned 2049 ≤ cap 2064**（80 required files）——本卷落卷后 +1 文件·余量充足 |

### 0.2 漂移登记（issues-master 更正版旧锚 → 本树 `f0147886` 实测·结论零变·EXEC 重 pin 同协议处理）

1. **#80 旧锚 `main.ts:77-88,91` → 现 `:81-103`**：六站常量现位 :86-93（`:91` 旧锚 nginx.org 行现位恰合 :91）·头注区扩至 :81-84——机制零变（六站+env 覆盖+「默认非空=真外呼已启用」声明全在）。**旧锚 `main.ts:528` → 现 `:544-549`**（现 :528 为「自适应图是唯一生产面试路径」注释行·safeFetch 构造现位 :549）。
2. **#119 旧锚 `web-explore.ts:50,177-182` → 现位精确合**（:50 域名放行·:177-182 整读再截断·零漂）；连带 `main.ts:528` 同上漂至 :549。**`RawResponse :81` 仅 `text()` 单读面**=#119「先读完整响应」的接口层成因（起草席补充锚·issues 原文未列）。
3. **#173 旧锚 `invoke.ts:612-620` → 现 `:733-735`**（GODFN-1a 五相位拆解逐字搬移所致·:710 头注自证「原 :463-482 逐字搬移」；现 :612-620 为 InvokeDispatchArgs/InvokeExecuteArgs 接口声明区·非轮询面）——`sleep(20)` 语义零变。
4. **#171 旧锚 `semantic-route.ts:1-45,133-134,147,171,212` → 现 `:1-34,129-134,147,171,212`**（头注收窄至 :1-34·costHardCap 区微移 :129-134·:147 withTimeout/:171 ledger.push/:212 调用点三锚精确合·零漂）。

## §1 红事实（四件机制链·源=issues-master 更正版 :394/:416/:418/:470+§0 亲证锚）

### 1.1 #119 外呼字节上限形同虚设 + DNS rebinding 残留（SSRF 面·安全承重）

逐行链：①`createSafeFetch` :154-188 是 CRAG 真外呼唯一安全通道（main.ts :549 注入·每跳 isAllowed :163+共享 8s 硬超时 :166 已在证）。②**:177 `(await res.text())` 先全量读 body**——`RawResponse` :81 只暴露 `text()` 单读面，`maxBytes=8000`（:157）只在 **:182 `.slice(0, maxBytes)` 内存截断**生效：恶意/异常大页（或 allowlist 域被攻陷返回 GB 级 body）在截断前已完整进内存+占满带宽=「字节上限形同虚设」（issues #119 定谳）。③**:9-10 头注自白 + isAllowed :60 host 字符串比对**：allowlist 域 DNS 可重绑定指向 169.254.169.254/10.0.0.5 等私网——isPrivateHost :22-51 对普通域名 :50 直接放行，解析后 IP 从未校验=SSRF 残留（代码自证与 issues 定谳一致·非推断）。④放大面：deepExplore :209 对至多 6 源并发（Promise.all）→ 单源慢/大体量响应在 8s deadline 内仍可注入全量传输+内存压力。

### 1.2 #80 外呼源与中文查询错配（能力缺口·含默认开的风险面）

①`DEFAULT_WEB_ALLOWLIST` :86-93 六站全为英文站（postgresql/kubernetes/redis/MDN/nginx/en.wikipedia）·构造 URL 走各站公开检索端点 :87-92。②中文查询（C 端面试主语境）送入英文站 `?q=` → 命中质量不可期（issues「有效性未联网实测」边界如实承袭·本刀 est live=0 不联网验证）。③**默认非空=真外呼默认开**（:83 头注自证）——检索 miss 即触真外呼+真外呼计费面（模型改写出题另算）；`env WEB_ALLOWLIST` 显式空串可关（:96/:100-102）但默认值背书外呼。④`deepResearch` 门 :629 以 `WEB_ALLOWLIST.length > 0` 自适配——**源集裁决改动只须动 :86-93 常量本体，:99-103 env 机制与 :629 门形零动自适配**（修法最小触面依据）。

### 1.3 #173 follower 20ms 恒定轮询线性放大 DB 事务

①claim 相位 :710-738：同幂等键非首位 caller 走 follower 路径——**:733-735 每拍 `await sleep(20)` 后重跑 `claimModelInvocation`（:716·一条短事务）直至 execute/cached/failed/deadline**。②N 个 follower × 50 拍/秒 × 35s 上限（:321 默认 35_000ms·:732 deadline 强制）=同 key 风暴下 DB 事务量线性放大（issues 定谳「N 个 follower 线性放大 DB 事务」）。③**GODFN-1a 冻结注 :492 现钉「时序常量（sleep(20)）零变」**——该注系重构等价声明（「逐字搬移」自证），#173 为行为修刀：**改 :733-735 必须同步改写 :492 冻结注与 :710 头注**（如实载 #173 授权），不得绕行亦不得静默改。④join 语义红线：follower「must join, never execute」（:733 注）+ execute=1/wait=1 + calls=1 三不变式（claim-join-orphan :134-156 在证）——**退避只改等待节奏·零改 claim 判定序**。

### 1.4 #171 semantic-route 未接线面书面契约缺明示

①头注 :1-34 现状：Stage S「零外呼」授权（:24-28）+pins 否定式暗载（「router 生产接线宣称 ≠ … ≠ closed」:32-33）——**无「生产未接线」明示句**，接线前置条件散落无书面契约。②三前置实锚：**ledger 只增**（:165 进程内数组+:171 push+:259 读点——接线后即语义审计漏斗的内存口径，须改持久化/有界面）；**超时不 abort**（withTimeout :147-160 到点仅 reject·底层模型缝 promise 照跑=计费照烧）；**绕开 invoke 计费**（模块自持 `costHardCapCny` :129-130+SEAM_TIMEOUT_MS :134·不经 invoke() 的 durable claim/计费账本/MODEL-OP-02 准入——若直接接线即开「第二计费面」）。③码面改造（ledger 持久化/abort 语义/invoke 关口接线）**留排期不在本刀**（协调方批位口径）——本刀交付=书面契约落卷（载体裁决 §8-③）。

## §1-修法（四件·两件带案A/案B 裁决·严格沿 issues 修法原文·⛔ 不改 issues 定谳语义）

- **修法①（#80·外呼源集·裁决项①）**：只触 `apps/worker/src/main.ts` 三处注释+一常量——**案A 默认关（推荐）**：`DEFAULT_WEB_ALLOWLIST` :86-93 改 `[]`（空数组常量·保留类型 `AllowedSource[]`）+:81-84 头注随翻（「默认空=CRAG 外呼默认关闭·env WEB_ALLOWLIST 显式 opt-in 后真外呼才启用」）+:544 注释随翻+:96-103 env 机制与 :629 `length > 0` 门**零动自适配**（空集→deepResearch 关·webExplore 循环空跑·CRAG 落本地题库=既有优雅降级面 :4/:32 在证）。**案B 中文受控源枚举**：:86-93 六站替换为中文受控源枚举（**具体域名清单归 EXEC 裁决时列名呈报·本卷不代裁**——有效性未联网实测边界承袭 issues 原文·live 验证明示不在本刀·est live=0 守恒）+头注/注释随翻。**推荐=案A**（可计算·零外呼零成本默认·运营 opt-in 面保留·不新增未经验证的 egress；案B 若裁须连「源有效性如何事后验证」一并呈报）。
- **修法②（#119·流式读+超限 abort+解析后 IP 私网校验）**：只触 `packages/domain/src/web-explore.ts`+`apps/worker/src/main.ts`+proof，三段——
  - **(a) 流式读+超限 abort**：`RawResponse` :81 增可选字节流面 `body?: ReadableStream<Uint8Array> | null`（与 undici `Response.body` 同形——生产 `rawFetch` 返回真 Response :548 零适配成本）。`createSafeFetch` :177-182 改流式：`res.body` 在场→`getReader()` 逐 chunk 累计·**字节计数超 `maxBytes` 即 `reader.cancel()` 并返回 null（超限=拒该源·非截断续用——issues 修法「超限时 abort」直译）**·未超限→TextDecoder 解码+既的去标签管线（:177-181 三段 replace 零动）作用于有界文本。`res.body` 缺席（text()-only 形）→ **fail-closed 返回 null**（上限诚实性优先·树内唯一构造点=proof `resp` 助手 :44-46 同刀扩齐·生产真 Response 恒有 body 零影响）。超时链 :161/:166（共享 deadline+AbortSignal.timeout）零动。
  - **(b) 解析后 IP 私网校验**：`SafeFetchOpts` :84 增注入缝 `resolve?: (hostname: string) => Promise<string[]>`（**纯逻辑层零 IO——domain 包纯净性守持**）。`createSafeFetch` 每跳（:163 isAllowed 过后）调 `resolve(u.hostname)`→**每个解析 IP 逐一过 `isPrivateHost`（:22-51 复用零新增判定逻辑）·任一命中即返回 null**；resolve 抛错/超时→null（fail-soft 同 :186 全函数基调）。缝缺省（不传）→维持 host-only 现状语义+头注残留声明收窄改写（:9-10 改为「IP 校验缝已建·生产已注 resolver·未注 resolver 的嵌入方仍残留」）。**生产接线**：main.ts :549 改 `createSafeFetch(rawFetch, WEB_ALLOWLIST, { timeoutMs: 8000, resolve: lookupAll })`·`lookupAll = async (h) => (await dns.promises.lookup(h, { all: true })).map(r => r.address)`（`node:dns/promises`·worker 包非纯逻辑层·import 在 main.ts）。**残留如实声明**：resolve-then-connect 仍存 TOCTOU 重绑定窗（彻底堵=pin 该 IP 连接）——头注改写保留该残句·issues 修法原文「解析后校验解析 IP 非私网」已足额覆盖·pin 连接面越出本刀（§3）。
  - **(c) 头注随翻**：:6-11 SSRF 铁律块同步改写（流式上限/解析后 IP 校验在证+残留声明收窄）——**禁止留「自白与实现矛盾」的双口径头注**。
- **修法③（#173·follower 指数退避·裁决项②）**：只触 `packages/ai-runtime/src/invoke.ts` 三处+proof——**案A 指数退避（推荐）**：:733-735 `sleep(20)` 改退避序列（**推荐参数：初值 20ms·倍率 ×2·封顶 1000ms·以模块常量声明（如 `CLAIM_POLL_BACKOFF_INITIAL_MS=20 / _FACTOR=2 / _CAP_MS=1000`）供 proof 静态断言**——首拍与现状等延迟=join 快路径零劣化·deadline :732 强制不变=总等待上界不变）；**:492 冻结注随改**（「sleep(20)」字样改「claim follower 指数退避（20ms×2 封顶 1000ms·#173）」+注明 GODFN-1a 等价声明自此由 #173 行为修刀承替）·**:710 头注随改**（「follower 20ms 真轮询」→「follower 指数退避真轮询」）。**案B LISTEN/NOTIFY 唤醒（并陈·不推荐）**：需专用常驻连接+新 NOTIFY 通道+重连缓冲语义=新机制面（invoke.ts :483-486 头注现钉「the remote call holds neither a connection nor an advisory lock」设计约束相抵·AG-24 已删进程内等待面先例 :196-198 反向印证）——若裁 LISTEN 须连「连接预算/多副本 fanout/回退轮询」一并呈报。**join 语义三不变式零动**（§1.3-④）。
- **修法④（#171·接线三前置书面契约·载体=裁决项③）**：**码面零改（留排期）**·契约内容五要素（缺一不收）：(i)「本模块生产**未接线**（生产调用点=0·仅 proof/scripted 缝消费）」明示句；(ii) 接线前置一=**必须走 invoke() 关口**（durable claim+幂等+计费账本+MODEL-OP-02 准入单一权威·Ban 绕开计费面新开第二口径——:129-130 costHardCapCny 属 Stage-S 实验预算面非生产计费）；(iii) 接线前置二=**缝超时改 abort**（withTimeout :147-160 现 reject-only 不 cancel·接线前改造·锚 :147/:212）；(iv) 接线前置三=**ledger 只增面改持久化/有界**（:165/:171/:259）；(v) Stage L live 面（:26-28）授权链不变+「router 生产接线宣称」pins 否定式**维持不翻**。**载体案A（推荐）=semantic-route.ts 头注扩写**（:24-33 区后增「Wiring preconditions」段——issues 修法原文「文件头明确『未接线』」直指案A·模块内自证·零新文件）；**载体案B=新 ADR**（`ai-docs/delivery/adr-semantic-route-wiring-preconditions.md`·头注 :30-33 pins 加一行指路）——案B 多一文件且头注/ADR 双处维护。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力逐条可独立判 PASS/FAIL）

1. **web-explore 既有 24 臂回归**：`pnpm web-explore:prove` EXIT=0——**`resp` 助手 :44-46 同刀扩齐字节流面后既有臂语义零变**（200 去标签/逐跳/重定向环/总超时/fail-soft/非 2xx 全绿）=「接口扩面非回归破坏」的在证形。
2. **新 proof（`packages/domain/test/b2c1-web-egress.proof.ts`·纯注入零真网）**断言力≥8（①-⑧ 逐条独立可判 PASS/FAIL）：①大体量 body 流（计数 chunk 形）超 maxBytes → 返回 null 且 reader 被 cancel（**超限 abort 直证**）；②未超限 body → 文本完整+去标签语义与现状一致；③`resolve` 返私网 IP（10.0.0.5/169.254.169.254）→ null（**解析后 IP 校验直证**）；④resolve 返全公网 IP → 放行（不误杀）；⑤resolve 抛错 → null；⑥text()-only RawResponse（无 body）→ null（fail-closed 直证）；⑦重定向第二跳解析 IP 私网 → null（每跳重校验直证）；⑧静态断言：web-explore.ts 头注无「实现与注释矛盾」残留（:9-10 旧自白句已改写）。
3. **invoke prove 扩臂**：`pnpm -C packages/ai-runtime prove` EXIT=0（四连链·含 claim-join-orphan）——**既有 5 断言臂语义零变**（execute=1/wait=1/calls=1/孤儿不双发=join 三不变式）+**新增退避臂≥2**：静态臂（退避常量导出面=初值 20/倍率 2/封顶 1000·若 §8-② 裁他值随裁）+动态臂（follower 等待期 poll 次数较恒定 20ms 形显著减少且 deadline `model_invocation_wait_timeout` 路径仍可达——:732 回归）。runtime-kernel 三门（毫秒时限拒绝/wait 无效拒绝/E2 并发）零红。
4. **typecheck 权威形**：`turbo typecheck --force` 3/3 绿+根 `pnpm typecheck` EXIT=0。
5. **账本纪律**：`git diff` 断言 `packages/db/migrations/**` 零改动（184 文件零增零改）+`packages/ai-runtime/src/index.ts` :196-199 AG-24 删除面零字节改（**Ban 复活进程内限流/熔断**）+`apps/api/src/platform/rate-limit.service.ts` 零触+semantic-route.ts 除头注区（:24-33 后插）外零字节（案A 载体）或零字节（案B 载体）。
6. **docs 门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（scanned ≤ cap·本卷 +1 文件后基线 2050 ≤ 2064 实测余量）。

## §3 范围外（边界清单·越界即 FAIL）

1. **#80 源有效性联网验证零触**（issues「有效性未联网实测」边界承袭·est live=0）——案B 若裁·live 验证归后继另授权。
2. **pin 该 IP 连接（connect-to-resolved-IP）零触**——TOCTOU 残窗以头注如实声明收口（§1-修法②(b)）·越出 issues 修法原文。
3. **#171 码面改造零触**（ledger 持久化/withTimeout abort/invoke 接线/Stage L live 面——码面留排期·协调方批位口径·本刀只落书面契约）。
4. **AG-24 已删面零复活**：circuit-breaker/rate-limit-model 及其 proof 零重建零引用（:196-198 删除自证·MODEL-OP-02 共享准入单一权威不动）·`apps/api` HTTP 层 rate-limit.service.ts（#129 域）零触。
5. **invoke 计费/幂等/准入语义零触**：claim 判定序（execute/cached/failed/unknown :729-731）·leaseSeconds :718·deadline :732·trace 面（#172 域）零动——#173 只改等待节奏。
6. **deepExplore/webExplore 预算形零触**（:196-245·:629 门形零动·#119 只改 createSafeFetch 内部读法与 resolve 缝）。
7. **共享 SSOT 只读零改**：LEDGER/execution-master-checklist/issues-master（外部件）/ai-capability-review 四件+INDEX——批表翻面权归协调方；**semantic-route.ts pins :30-33 既有否定式零翻**。
8. **migrations 零增零改**（§0.1 实证 184 文件·四件修法均零 DB 面·若双审推翻此结论须停下单走协调方批位·含 0185 占位链 :456）。
9. e2e/API/前端产品面零触；`apps/worker/test/adaptive-consumer.proof.ts`（seam 注入形 :143-144 预期零改零红·收据复核登记）。

## §4 依赖

**①上游零硬前置**：四件互不依赖·可同刀并行施工（#80/#119 同文件 main.ts 相邻区·须同 commit 一致性自检）。**②并发登记面**：起草时点 `line/batch2-c1` 为唯一本域在飞分支（§0.0 双查）——`packages/domain/src/web-explore.ts`/`apps/worker/src/main.ts`/`packages/ai-runtime/src/invoke.ts`/`packages/ai-runtime/src/router/semantic-route.ts` 四文件无他刀登记触面（LEDGER H7 挂账 12 件中余八件 #38/#73/#185/#202/#49/#160/#163/#48 均不同文件域·如实核对基线 tip 后维持）。**③迁移号=零（实证）**：§0.1 迁移行+§3-⑧。**④下游**：#80/#119 闭→外呼面安全与成本默认可算；#173 闭→H7 余件中同 invoke 域件可续；#171 契约落→接线刀立项有书面前置可引。

## §5 Ban 列表 + pins（沿 ag-d/b2 系卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master 外部件/ai-capability-review 四件+INDEX·批表与刀位行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已读/已验来源；**本刀增补**：**Ban 真网外呼**（全 proof 纯注入·#80 源有效性 live 验证越界·§3-①）；**Ban 复活 AG-24 已删进程内限流/熔断面**（§3-④·:196-198 删除自证）；**Ban 迁移面**（§3-⑧·184 文件零增零改·0185 链位归协调方 :456）；**Ban 截断续用**（#119 超限语义=abort 拒源·禁止「流式读了但超限仍 slice 续用」的半吊子形——issues 修法原文「超限时 abort」）；**Ban domain 包引入 IO**（#119 resolve 必须注入缝形·`node:dns` 只准入 main.ts）；**Ban join 语义变更**（#173 execute=1/wait=1/calls=1 三不变式+claim 判定序 :729-731 零动）；**Ban 冻结注静默漂**（:492/:710 随 #173 改写必须显式载 #173 行为授权·禁止不注行为变更的偷改）；**Ban semantic-route pins 翻面**（:30-33 否定式零翻·#171 契约只增写不翻转）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀全 proof 纯注入+零真网·零模型外呼零消耗）

## §6 est live=0

本刀零真实外呼零联网：web-explore/新 proof=纯注入（fake fetch/resolver/counting stream·零真网）；invoke 侧=真 PG 隔离容器（run-e2e-isolated/claim-join 既有形·DATABASE_URL 由调用方供）+确定性 stub·零真实 provider；typecheck/docs:check=本地门——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。#80 案B 裁后的源有效性 live 验证明示不在本刀（§3-①）。

## §7 markers=0（卫生声明）

本刀改动集（起草阶段恰 1 .md=`ai-docs/delivery/harness/batch2-c1-REQUEST.md`）**五类标记词 grep 零命中**（起草席落卷后亲跑五类扫描+`node scripts/ai-docs/check-docs.mjs` 复验·EXIT=0 见收尾记录·命令与回执沿 ag-a-resume receipts/05-markers 形留执行席收据）。五类标记词不复抄卷内（避免自匹配·沿 ag-d 系卷 §7 同形制）。EXEC 阶段改动集预期=main.ts/web-explore.ts/invoke.ts/(semantic-route.ts 头注或 ADR 一件)+proof 三件（web-explore 扩面+b2c1-web-egress 新件+claim-join 扩臂）——收据同形亲跑登记。

## §8 STOP（开工三条款+裁决项+交付报告格式）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（起草阶段恰 1 .md·⛔push）。开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（LEDGER 批2「其他」行 :59 与水位行 :210 H7 挂账系登记出处·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·含 §0.2 漂移登记协议）。**停止条件（命中即停上报·禁止自行处置）**：**(a) 现场漂移**——EXEC 立项对届时 tip 重 pin 时 §0.1 任一 blob/行锚漂移且**机制结论受影响**（如 createSafeFetch 结构被他刀重写、claim 相位搬移、头注被改写）；**(b) 机制不满足**——修法②(a) 流式形状遇 undici/Node 22 行为与处方冲突、或修法③退避形遇 claim-join 既有臂不可保绿（join 三不变式与退避不相容情形）；**(c) 越界需要**——施工中发现任一件须触 §3 边界（如需迁移/需真网验证/需触 AG-24 已删面）方能收口；**(d) 验收红不可修**——§2 任一门红且归因非本刀改动集内可修（既有基线红如实登记归因·禁 retry-to-green）。命中任一→STOP 落卷如实登记·归协调方。

**待双审/EXEC 裁决项（三项·EXEC 裁决行使须逐项落卷呈报）**：
- **①外呼源集（#80·案A/案B 二选一）**：推荐=**案A 默认关**（`DEFAULT_WEB_ALLOWLIST`→`[]`·env opt-in 保留·零新增未验证 egress）vs 案B 中文受控源枚举（EXEC 列具体域名清单呈报+连「源有效性事后验证路径」一并呈报·live 验证仍越本刀）。
- **②退避参（#173·案A/案B 二选一+参数裁定）**：推荐=**案A 指数退避**（初值 20ms/倍率 2/封顶 1000ms·模块常量导出供 proof 静态断言·首拍零劣化）vs 案B LISTEN/NOTIFY（须连连接预算/多副本 fanout/回退轮询三面呈报·:483-486 无连接约束相抵如实披露）；参数值（初值/倍率/封顶）若裁非推荐值须附「deadline 上界不变」演算。
- **③171 契约载体（案A/案B 二选一）**：推荐=**案A semantic-route.ts 头注扩写**（:24-33 后增 Wiring preconditions 段·五要素 §1-修法④·零新文件）vs 案B 新 ADR `ai-docs/delivery/adr-semantic-route-wiring-preconditions.md`（头注 pins 加指路行）。

**交付报告格式（EXEC 收据·落 `ai-docs/delivery/receipts/b2c1/`）**：①逐件修法↔issues 行号映射表（#80→:470/#119→:394/#173→:418/#171→:416·行使裁决逐项）；②改动文件清单（预期 7±2：main.ts/web-explore.ts/invoke.ts/契约载体一件/web-explore.proof.ts/b2c1-web-egress.proof.ts/claim-join-orphan.proof.ts）逐文件行数前后；③§2 六门逐门命令原样+EXIT+臂/断言数（web-explore 24 臂基线+扩后实数·claim-join 5 臂基线+扩后实数·typecheck 3/3·docs:check scanned 数）；④markers 五类亲跑回执；⑤est live=0 逐 prove 零外呼口径登记；⑥Ban 自检逐条（§5 增补七条+十一值 pins 零翻+migrations 零增零改 git diff 亲证）；⑦STOP 翻面记录（draft→executed:awaiting_post_prove_dual·⛔push 维持）。

---

*BATCH2-C1 REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`f0147886` · 分支 `line/batch2-c1` · 工作树 `meetwise-b2c1`（git worktree add 本起草席立·建前 worktree list+branch 双查不存在）· 立项出处=issues-master 更正版 #119 :394/#171 :416/#173 :418/#80 :470（本机外部件·四行原文亲读）+LEDGER :59/:210（H7 挂账·归域刀）· 红事实四链（#119 整读再截断 :177-182+RawResponse :81 单读面+DNS rebinding 自白 :9-10/:50·#80 六英文站 :86-93+默认开自证 :83+门形自适配 :629·#173 follower sleep(20) :733-735+GODFN 冻结注 :492+join 三不变式 claim-join :134-156·#171 头注无明示句+ledger 只增 :165/:171/:259+withTimeout reject-only :147+绕开计费 :129-130/:134）· 修法四件（①外呼源裁决②流式+abort+resolve 缝③指数退避+冻结注随改④契约五要素·前两件案A/案B 并陈）· 断言六门（24 臂回归+新 proof ≥8 断言+invoke 扩臂+typecheck 3/3+账本纪律+docs:check）· 迁移号零（184 文件实证·0185 链位归协调方）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
