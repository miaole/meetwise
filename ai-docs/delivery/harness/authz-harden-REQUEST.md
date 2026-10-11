# AUTHZ-HARDEN REQUEST（批5 5A 安全 16 件 · 授权加固域 · 簇切两子刀建议）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + 协调方明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）——**rev2 勘误落卷（2026-10-11·pre-exec 双审席1 窄 FAIL 三处方+席2 PASS 九登记一次性随落·见 §0.5·两处措辞澄清+四处锚更注披露）·Status 值维持不变·rev2 待复审**。

**席位**：#批5 AUTHZ-HARDEN 刀起草席（北星 loop · 批5 第二刀 · 授权加固域 · 与 MIG-RUNNER 零硬依赖可并行）。
**基线**：`feat/mysql-schema-skeleton` @ `c042729b`（主线 tip·`git log -1` 实测 2026-10-11·merge(i3-job-mgmt)）。分支 `line/authz-harden`·工作树 `meetwise-authz`（`git worktree add ../meetwise-authz -b line/authz-harden` 本起草席已立·建前 worktree list 实查不存在）。
**蓝本**：①批5 位图行双源：`TASK-SOP-v2.md:82` + `product-campaign-LEDGER.md:84`（逐字见 §0.2）②审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 候选 16 件逐行（#111=:248/#131=:257/#120=:255/#33=:221/#34=:375/#90=:389/#180=:278/#35=:222/#112=:249/#67=:231/#100=:245/#108=:246/#109=:247/#168=:274/#18=:218/#143=:506·修法列逐字入 §1）③LEDGER :96 执行序行 + :212 批5 水位（4/143·残 139）④形制沿 `i3-job-mgmt-REQUEST.md`（§0-§8·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `c042729b`·file:line 逐条 rg/sed/git show 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 已终局防重检查记录（强制项）

- `rg -l "AUTHZ-HARDEN|authz-harden" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md`（base `c042729b` 实跑）→ 命中 **3 件**：①`TASK-SOP-v2.md:82` 批5 位图行（登记非刀卷）；②`product-campaign-LEDGER.md:84/:96/:212`（5A 行/执行序/水位·登记非刀卷）；③`extreview-fix-campaign-SOP.md:30/:65`（扫漏登记·其中 :65 旧指「#36 归 AUTHZ-HARDEN」——**已翻**：更正版 issues-master :223 定 #36 为第5批-C，见 §0.1）。
- harness/ **无同名卷** `authz-harden-REQUEST.md`（ls 全表实测）。→ **停止条件未触发·可建树落卷**。

### 0.1 盘点总表（位图 16 件逐件·已解决?/实树判定锚/归槽·锚全 @`c042729b` 实测）

| 件 | issues-master | 已解决? | 实树判定锚 | 归槽 |
|---|---|---|---|---|
| #111 邮箱大小写不归一 | :248 P2 | **开放** | `0001_baseline.sql:364` `email text NOT NULL UNIQUE`（大小写敏感·无 lower(email) 索引）；signup `auth.service.ts:34` `const email = b.email` 原样入库；`gateway_auth_signup` `0041:28` INSERT 原样；`gateway_auth_login` `0041:35` `u.email = p_email` 精确比较；`gateway_active_candidate` `0041:60-62` 精确比较 | **本刀簇①收** |
| #131 邀请侧归一错位 | :257 P2 | **开放**（防夹带注记：i3 卷 :149 留槽原文「#131→5A」·**本刀 bitmap 内**·随 #111 同件族收编·不另立候选） | 邀请侧 `recruiter.service.ts:167` `trim().toLowerCase()` vs 注册原样 → 大写邮箱候选人邀不到（404） | **本刀簇①收**（与 #111 同修） |
| #120 改密 TOCTOU+无限流 | :255 P2 | **半收口** | TOCTOU 半已缓解：`profile.service.ts:112` 单语句原子 UPDATE+`pwd_epoch=pwd_epoch+1`（并发改密行锁串行·注释亲证）；**限流半开放**：`:102-:120` 全函数 rl.allow 零命中（rg 实测）——被盗令牌可无限试旧密码放大 scrypt CPU | **本刀簇②收（限流/失败锁半）** |
| #33 登录时序枚举 | :221 P2 | **开放** | `auth.service.ts:61` `u && u.status === 'active' && verifyPassword(...)` 短路——`gateway_auth_login` 无 dummy row·账户不存在零行返回 verify 不跑；`:60` 注释「都跑一次 verify」与实现不符 | **本刀簇②收** |
| #34 login 校验/chunked/scrypt | :375 P3 | **半开放** | ①login 不挂 pipe 为**注释明示故意**（`auth.controller.ts:21` 理由①限流须全见②登录不校验复杂度——修法须绕开此理由=裁决项②）；②scrypt 同步 `packages/domain/src/auth.ts:10/:18` scryptSync；③`main.ts:149-157` 1MiB 钩子只读 content-length·chunked 无头回落 12MiB bodyLimit（`main.ts:115`） | **本刀簇②收**（②③两半） |
| #90 login email 无校验入限流 key | :389 P3 | **开放** | `auth.service.ts:52-54` 仅非空检查即入 `login:${b.email}` key·无格式/长度校验；`contracts:12` Credentials shape（email().max(254)）已有未用 | **本刀簇②收** |
| #180 login 无 IP/全局桶 | :278 P2 | **开放** | `auth.service.ts:54` 仅 `login:${email}` per-email 桶（对照 signup `:28` 三桶 per-email→ip→global）——分散 email 喷洒不受限 | **本刀簇②收** |
| #35 令牌无轮换/无 jti | :222 P2 | **开放** | `packages/domain/src/auth.ts:23-35` signToken 单 AUTH_SECRET 无 kid；`principal.guard.ts:9` 注释自承「无状态 HMAC(7 天 TTL,无 jti/黑名单)」；`auth.service.ts:66-70` issue() 无会话表 | **本刀簇③收** |
| #112 无登出端点/令牌不可吊销 | :249 P2 | **开放** | `auth.controller.ts` 全端点=:11 signup/:19 login（登出零）；web `auth-actions.ts:42-46` logoutAction 只清 cookie+revalidatePath·令牌 7 天仍有效 | **本刀簇③收** |
| #67 CSP unsafe-inline | :231 P2 | **开放** | `next.config.mjs:30` `script-src 'self' 'unsafe-inline'`；注释与实现不符面同在 | **本刀簇④收** |
| #100 HMAC 验签三份+pay-callback 登录可调 | :245 P2 | **开放** | `commerce.service.ts:87-89/:105-107/:135-137` 三份复制验签（无公共函数·无时间戳防重放）；`commerce.controller.ts:34-38` pay-callback 仍 `@UseGuards(PrincipalGuard)`；`privacy.service.ts:107` createHmac 为 preview digest 异用途（零触） | **本刀簇④收** |
| #108 解析超时不终止 CPU | :246 P2 | **开放·🔒DEPS S3** | `resume-extract.ts:55-60` withExtractTimeout 仍 Promise 竞速·`resume.service.ts:66` 全局槽照放·无 worker_threads terminate | **不收——🔒DEPS S3**（LEDGER :84 原文锁记；与 #107 四守卫「解压≤64MB/PK 魔数/.doc 拒绝」同域·归 DEPS-AUDIT（extreview SOP :13 REQUEST 待起草）·防夹带） |
| #109 魔数嗅探缺失/.doc 误判 | :247 P2 | **开放·🔒DEPS S3** | `resume-extract.ts:29` `.doc` 仍归 docx；`:95` text 分支 toString 任意字节；嗅探仅 PDF /Encrypt（`:47-50`） | **不收——🔒DEPS S3**（同上·防夹带） |
| #168 G7 生产不拒绝 | :274 P2 | **开放** | `api/src/main.ts:21-27` + `worker/src/main.ts:59-66` env=1 即动态 import 测试支撑·无 NODE_ENV=production 拒绝；GODFN-1b 单读点已落（两处组合根注释亲证）=前置改善非修法本体 | **本刀簇④收** |
| #18 卡住 job 明文滞留 | :218 P2 | **半收口** | 完成/失败半已闭：`interview-jobs.ts:222-237` markJobDone/markJobFailed 均 `payload-'answer'` 清明文（D6 决策兑现）；**滞留半开放**：`:262-275` sweepStuckInterviewJobs 收割只翻状态·queued 滞留 job（worker 停机期）明文无限期滞留·无 TTL 清理 | **本刀簇④收（滞留半）** |
| #143 pgp 密钥经 SQL 参数 | :506 P4 | **开放（备忘态）** | `0151:31` `pgp_sym_encrypt(p_body,p_enc_key)`——D6 决策原文「链路生产未启用…P3→P4 备忘，启用前处理」 | **登记不实施**（随本刀挂账·启用前另刀） |
| （防夹带）#36 守卫缓存多实例 | :223 P2 | **开放·归他组** | `principal.guard.ts:9-16` 60s 进程内缓存+evict——多实例 ≤60s 延迟为**注释文档化 known seam**（Redis 共享吊销源）；更正版 issues-master 定 **5C**（extreview SOP :65 旧指 AUTHZ-HARDEN 已翻） | **不收·归 5C**（S9 决策域） |
| （防夹带）#62 路径未编码 | :381 P3 | **开放·归他组** | i3 卷 :32 留槽原文「#62→5E 批量（一致性小改防面混）」 | **不收·归 5E** |

**归槽结论**：本刀收编 **12 件 = #111+#131/#120半/#33/#34两半/#90/#180/#35/#112/#67/#100/#168/#18半**（P4 #143 随卷挂账）·不收 4 件=#108/#109（🔒DEPS S3）/#36（5C）/#62（5E）·与 LEDGER :84 位图 16 件对勘恰合（16=12+2 锁外+1 备忘+1 引号内同族 #131）。

### 0.2 批5 位图行逐字誊录

- `TASK-SOP-v2.md:82`：`| 5A | AUTHZ-HARDEN | #111+#131 邮箱归一（存量迁移）+#120+#33/#34/#90/#180 login+#35/#112 令牌+#67 CSP+#100 HMAC+#108/#109 上传守卫（🔒DEPS S3）+#168+#18（卡住清理）+#143（P4） |`
- `product-campaign-LEDGER.md:84`：`- **5A 安全（16）**：#111/#131 邮箱归一（存量迁移）·#120 改密限流·#33/#34/#90/#180 login 面·#35/#112 令牌/登出·#67 CSP·#100 HMAC 合一·#108/#109 上传守卫（🔒DEPS S3）·#168 G7 拒绝·#18 卡住清理·#143 P4 — 🆕 AUTHZ-HARDEN 刀（可 2-3 子刀）`
- `product-campaign-LEDGER.md:96`（执行序）：`6. **批 5**：MIG-RUNNER→AUTHZ-HARDEN→CI-WIRING→5C 四子刀→5E 批量（DIR-1 持续串行至 B2s+sweep）`
- `extreview-fix-campaign-SOP.md:30`（扫漏登记）：`AUTHZ-HARDEN：#110 注册审核制/#111+#131 邮箱归一/#35 令牌轮换/#112 登出/#33 时序/#34+#90 login 校验/#120 改密 TOCTOU/#180 login 限流`（#110 已随 b110 收口·`79aeb04b` nail·零触）

### 0.3 近期刀已闭面查重（逐条判已闭/开放/归他组）

1. **I4 gateway 函数 owner 谓词 fail-closed**：`0165_invite_notify_gateway.sql` SECURITY DEFINER+owner=principal 派生（Ban 入参伪造）+RLS 在位 fail-closed 断言（0156:55-72 形）——**I4 收·在飞未落 tip**（主工作树 staged 20 文件亲证·`git status` 含 0165/0166/recruiter.service.ts/neg-bend.proof.ts 等·c042729b 树内无此二迁移）。→ 邀请网关面已闭归 I4·本刀**零触**（Ban）。本刀 #131 只动邀请侧归一一处·与 I4 通知/回包/识别面零重叠（§3-1）。
2. **I3 assertPrincipal**：`recruiting/recruiter.ts` closeJob/updateJob owner 谓词+行锁、`commerce.ts` 同 helper——tip 在树亲证（i3 卷 :46/:65 登记）。→ 岗位 owner 谓词面**已闭**（I3 收）·非本刀位图件·零触。
3. **GODFN-1c**：begin() 三守卫合并+抛序等价断言面（`apps/api/test/godfn-1c-begin-guard-merge.proof.ts` tip 在树）+GODFN-1b G7 环境单读点（main.ts 两处组合根注释）——**已闭·非授权域**（查询合并/装配面）。GODFN-1b 为 #168 修法前置改善但 #168 生产拒绝本体未落（§0.1）。
4. **Ha 系 RLS 面/守卫加固**：`principal.guard.ts` 已带 pwd_epoch 改密吊销+status 复查+`__system` 保留主体拒绝+`neg-auth.proof.ts` token/devheader 25+ 负臂亲证；RLS 活断言形已成熟（0156 在位断言·0161 只读收窄·135 策略 54 迁移）。→ guard/RLS 面**已大幅加固**，本刀位图 16 件无一为 RLS 策略缺口；#36 残面唯多实例吊销源（归 5C）。本刀零新 RLS 策略（#111 lower(email) 唯一索引与簇③会话表为 §3-5 明示 DDL 例外）。

### 0.4 现势并发登记（强制）

主仓工作树（meetwise @c042729b）**staged I4 EXEC 在飞未提交**（20 文件·含 `i4-invite-face-REQUEST.md`/0165/0166 迁移/recruiter.service.ts/neg-bend.proof.ts/notifications 等）——本卷全部锚以 **HEAD `c042729b` 纯净态 `git show` 复核**（§0.1 行号即 HEAD 态）；EXEC 立项时若 I4 已落线，recruiter.service.ts/neg-bend.proof.ts 行号照例重 pin。迁移编号位：I4 落线后占 0165/0166 → 本刀新迁移自 **0167+** 起（EXEC 时以实树重 pin·冲突即顺延）。

### 0.5 pre-exec 双审 rev2 落卷登记（2026-10-11 rev2 勘误席·席1 窄 FAIL 三处方正文已附+席2 PASS 九登记·EXEC 立项照本节与 §0 同权重重 pin——处方全系增补登记行·§1 修法清单既有行/§5 Ban-pins 语义零变）

**席1 三处方落点**：①→§1 簇①增「网关函数镜像同步」行（窄 FAIL 根因：0167+ 网关换体须携 0155 末位回填并集+与 23 auth 族区逐字节同文镜像·RX-3 承重墙）；②→§3-1 澄清（0165-0166 两函数族本体≠23 文件全体）；③→§3-5 补半句（镜像同步写 sql/ 住地不另开迁移号）。

**席2 九登记（EXEC 立项重 pin）**：

- **R1（簇③）**：存量已发令牌无 jti——会话表吊销面只对带 jti 令牌生效，无 jti 存量令牌走 **legacy 无态路径**（验签+exp+pwd_epoch/status 既有机械）至 TTL 自然过期（存量会话兼容·禁一刀切全拒）；signToken 全产点清单重 pin=两处：`apps/api/src/modules/auth/auth.service.ts:70`（issue() 内）+`apps/api/src/modules/profile/profile.service.ts:118`（改密回签）——rev2 rg 全树亲证仅此两产点+`packages/domain/src/auth.ts` 定义点。
- **R2（簇②）**：login ip/global 桶与改密失败锁参数留 **env 覆写口**（先例 `auth.service.ts:11-13` RL_SIGNUP_IP「容量,速率」双值形·prod 钉死+perf/E2E 显式落档同纪律）；簇②断言族补第三臂（EXEC 落形落位）。
- **R3（簇④）**：CSP 断言补两形=**响应头形**（Content-Security-Policy 响应头实含新策略·next.config headers 面）+**nonce 形**（静态源断言之外的运行时形）——EXEC 定断言载体。
- **R4（簇②）**：#34/#90 login 校验 shape 沿 `packages/contracts/src/index.ts:12` Credentials 既有形**含 password max(128)**（rev2 亲证在位·防 scrypt CPU DoS 上限理由同注释）——断言与实现不得弱化该上限。
- **R5（簇③）**：会话表/jti 命名与 privacy 擦除域**显式区分**：0091 `privacy_authorization_snapshot.jti`（:58 UNIQUE）/`privacy_deletion_receipt`（:84）与 0112 memory `retention_class='session'`（:88）+`p_jti` 擦除链（:876-897）属 privacy 授权/擦除谱系——簇③新会话表命名禁与之混用（EXEC 定名）。
- **R6/R7（计数口径如实登记）**：「12 收」枚举实列 13 个件号（#131 计入 #111 同族不单计）·16 位图=12 收+2 锁外（#108/#109）+1 备忘（#143）+1 同族（#131）对勘恰合（§0.1 归槽结论）——EXEC/复审按此口径，重计争议不立；Ban 计数登记照此如实。
- **R8（防漂铁律）**：worker_threads 关键词横跨两修法域=簇② #34（scrypt 改异步·worker_threads 或 node:crypto async 形）×#108（resume-extract worker_threads terminate·🔒DEPS S3 不收）——#34 实施严禁漂入 resume-extract 面（§3-2 防夹带同款）。
- **R9（簇①铁律）**：0041 三网关函数（signup :22-30/login :32-36/active_candidate :53-66+ACL :139-154）改写以 **0167+ 新迁移 `CREATE OR REPLACE`** 落——历史迁移零字节改铁律（migrate.ts checksum 守卫·0155:20-21 先例·禁原地改 0041）。

**席1 登记项随落**：

- **席1-R1（随刀更注）**：neg-interview 计数注释陈旧——`apps/api/test/neg-interview.proof.ts:579` 注「合计:97」vs 静态 `A(` 断言 rev2 实测 **102**（97 系 H3 EXEC 时点值·后续刀增臂未更注）——随本刀 EXEC 面更注（重核实数后落）。
- **席1-R3（锚小漂+全路径）**：四处小漂 rev2 已实测并按 §0 免责条款原位更锚（只更行号零语义）：①#34 `domain/auth.ts:7/:15`→`packages/domain/src/auth.ts:10/:18`（scryptSync 实位 :5 import/:10 hash/:18 verify·:7/:15 系文档注释）；②#35 `principal.guard.ts:11`→`:9`（「无状态 HMAC」引文实位）；③#120 `:102-:127`→`:102-:120`（changePassword 全函数实界）；④`domain/auth.ts` 卷内两处补全路径 `packages/domain/src/auth.ts`。余 §0.1 锚 rev2 全量亲验零漂（0041:28/:35/:60-62·auth.service:34/:52-54/:54/:60-61/:66-70·0001:364·contracts:12·next.config:30·api main.ts:21-27/:115/:149-157·worker main.ts:59-66·commerce.service:87-89/:105-107/:135-137·commerce.controller:34-38·privacy:107·resume-extract:29/:47-50/:55-60/:95·resume.service:66·interview-jobs:222-237/:262-275·recruiter:167·auth-actions:42-46·auth.controller:11/:19/:21·0151:31·0156:55-72）。

**rev2 现势实测（登记·§0.4 原文不动）**：I4 已落主线（`f5fa2f52` EXEC → 主线 tip `2f6662ef` 实测·0165 `gateway_notify_invited`/0166 `gateway_recruiter_contact_share` 在树·23 镜像追加 :660-732 纯插入 75 行 auth 族区字节零触亲证）→ §0.4「staged 在飞未提交」系起草时点实情；迁移空位自 **0167** 起合卷面口径（注：**0164 亦空号且全史零痕**·最小未占=0164·沿 0155「取最小未占号」先例与卷面 0167+ 口径两存——EXEC 重 pin 裁决·不阻塞）。

## §1 修法（四触面簇·修法列逐字固化·file:line 实锚·EXEC 立项重 pin·**簇切两子刀建议：5A-1=簇①②③（账号/会话）·5A-2=簇④（面硬化）**——LEDGER「可 2-3 子刀」·单刀或分派=裁决项⑧）

### 簇① 邮箱归一（#111 修法列逐字：「统一 trim+lowercase（或 citext）并加 lower(email) 唯一索引；先排查存量冲突账号」+#131 修法列逐字：「随 #111 统一邮箱归一（含存量迁移）」）

- **写侧归一**：signup `auth.service.ts:34` 入库前 `email.trim().toLowerCase()`；`gateway_auth_signup`（0041）SQL 侧同归一（双闸·应用层为主 SQL 层兜底）。
- **读侧归一**：`gateway_auth_login`（0041:35）/`gateway_active_candidate`（0041:60-62）比较改 `lower(u.email)=lower(p_email)`（或登录入参先归一后精确比较·二选一=裁决项①附带）。
- **存量迁移（新迁移 0167+）**：①冲突预检报告（`GROUP BY lower(email) HAVING count(*)>1`——冲突行**只报告不静默合并**·处置归运营决）；②无冲突行 `UPDATE user_account SET email=lower(trim(email))`；③`CREATE UNIQUE INDEX ux_user_email_lower ON user_account (lower(email))`；④迁移幂等可重跑。
- **网关函数镜像同步**〖rev2 席1-①增补·登记义务行·窄 FAIL 根因〗：0167+ 新迁移对 `gateway_auth_signup`/`gateway_auth_login`/`gateway_active_candidate` 三函数换体（SQL 侧归一闸）须：①携带 0155 末位回填并集（trial 桶 grant+approval_status 审批分支·漏携即抹 #228 trial 同事务发放行为·`0155:53-57` 亲证）；②函数体+ACL 与住地 `packages/db/sql/23_api_gateway.sql` auth 族区（函数区 :5-47/:83 起+ACL :411-429）**逐字节同文镜像**（0159 RX-3 承重墙判据·0165/0166 两函数区段同款先例）。
- **邀请侧统一**：`recruiter.service.ts:167` 归一改调与注册同源的单一 helper（行为等价·消除双处各写）；I4 面（通知/回包/识别）零触。

### 簇② login/改密面（#33：「不存在/停用时对假哈希跑一次 verifyPassword，统一耗时」·#120：「改密加按主体+IP 限流与失败锁定，校验与更新同事务」·#180：「login 加 IP 维度与全局桶，挂 Credentials 校验」·#90：「同 #34：login 挂 Credentials 校验后再入限流 key」·#34：「login 挂 ZodValidationPipe(Credentials)，并改 scrypt 为异步」）

- **#33 恒时序**：账户不存在/停用时对**内存常量假哈希**跑一次同参 scrypt verify 后再 401（推荐·零 DB 变化=裁决项③；`:60` 注释随之如实化）。
- **#180 桶补全**：login 桶序对齐 signup 形制 per-email→**ip→global**（`:54` 扩三桶·参数 EXEC 定）。
- **#90/#34-login 校验**：`Credentials` shape（contracts:12）服务侧最小校验（email 格式/长度·password 类型）——**controller 故意不挂 pipe 的两理由保留**（限流全见+不校验复杂度·`:21` 注释原文），修法绕行=裁决项②。
- **#120 限流+失败锁**：changePassword 入口加 per-principal+IP 限流与连续失败锁定（参数=裁决项⑥附带）；`:112` 原子 UPDATE 零改。
- **#34 其余两半**：scrypt 同步改异步（worker_threads 或 node:crypto async 形·EXEC 定）；`main.ts:149-157` 1MiB 钩子对无 content-length 请求按流计数封顶（或反向代理层限制·二选一）。

### 簇③ 令牌/会话（#35：「引入 kid 多密钥轮换 + jti/会话表支持单独吊销与登出」·#112：「补登出（服务端吊销）、邮箱验证与重置密码流程」）

- **kid 轮换**：令牌头带 kid·AUTH_SECRET 支持多钥（当前钥签发+旧钥验证窗·轮换=环境配置面·零停机）。
- **jti/会话表**：新表（迁移同 0167+ 簇①或独立 0168·裁决项④附带）记 jti/uid/吊销态；`principal.guard.ts` 验签后查会话表（缓存策略沿既有 60s 形·evict 同步）——`pwd_epoch`/status/保留主体既有机械**零改**（neg-auth 既有臂零翻）。
- **登出端点**：POST /auth/logout（吊销当前 jti）+web logoutAction 接线；「邮箱验证与重置密码流程」=**登记残面不本刀实施**（SMTP 依赖未在位·LEDGER :84 位图只锁「令牌/登出」两字面·防面扩）。

### 簇④ 面/杂项硬化（#67：「改 nonce/hash 方案去掉 unsafe-inline，并修正注释」·#100：「抽公共验签函数（含时间戳防重放），pay-callback 改为仅服务端/签名访问；渠道接入另立项」·#168：「NODE_ENV=production 时开关为真即启动失败；镜像排除 test/」·#18：「对超时卡住的 job 定期清理 payload 明文」）

- **#67**：next.config.mjs CSP 去 unsafe-inline（nonce 或 hash 形·裁决项⑦）+注释与实现对齐。
- **#100**：`verifyCommerceSig(id,providerTxn,kind,sig,ts)` 公共函数（三调用点收敛 :87/:105/:135+时间戳防重放窗）；pay-callback 移除 PrincipalGuard 改纯签名访问（裁决项⑤）；commerce 账务语义（CAS/exactly-once）零触。
- **#168**：两组合根（api main.ts:21-27/worker main.ts:59-66）加 NODE_ENV=production 且开关为真即 throw 拒启；Dockerfile/.dockerignore 排除 test/（构建面·EXEC 验收以静态源断言+构建上下文清单）。
- **#18 滞留半**：周期清理超龄滞留 job（queued/running 且租约过期超 TTL·默认只对「重队列终态不可达」行清 `payload-'answer'`·活跃 running 零触=TTL 值裁决项⑥）——收割函数 `sweepStuckInterviewJobs` 语义零改·新增旁路清理函数。
- **#143**：随卷登记备忘（P4·启用前改应用侧加密·零码动）。

## §2 验收断言候选（neg-auth/neg-bend/db prove/静态源断言形制·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **归一族（db prove·隔离库）**：大写邮箱注册→lower 落库；大写邮箱登录命中同账户；大写邮箱候选人被邀请→invite 200 非 404；存量冲突预检脚本对双写冲突库输出报告且不合并；迁移重跑幂等（二次执行零 diff）。
2. **恒时序族（api prove·假哈希计数）**：不存在邮箱与存在错密邮箱 verify 调用次数相等（时序面以调用计数证·非墙钟）；停用账户同口径。
3. **限流族（api prove·假桶）**：分散 5+ 邮箱同 IP 连击→429（ip 桶）；全局阈值击穿→429（global 桶）；改密连败→锁定面 429/locked（参数注入短窗）。
4. **令牌族（neg-auth 既有形·增臂不翻旧臂）**：kid 轮换后旧钥令牌验证窗内通过/窗外 401；logout 后同 jti 复用→401 session_revoked；不同 jti 会话互不吊销（单点登出≠全端登出·除非 EXEC 裁决全吊销）。
5. **CSP/HMAC/G7 族**：CSP 静态源断言（unsafe-inline 零命中+nonce 形在位）；HMAC 公共函数单源断言（rg 三内联点清零+防重放过期窗拒）；G7 生产拒启子进程探针（production+env=1→非零退出·非生产回归放行）；test/ 构建上下文排除清单断言。
6. **#18 滞留清理族（db prove·假时钟）**：超 TTL 滞留 queued job→payload-'answer' 落账；活跃 running（租约内）零触；收割函数 requeued/failed 计数零回归。
7. **回归面随改随核**：`pnpm neg:auth`+`pnpm neg:bend`+auth/commerce 既有 prove 全 EXIT 原值·base 同红登记不洗；principal.guard 既有臂（session_revoked/reserved_principal/account_inactive）零翻。
8. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **I4 界线（划清）**：邀请通知/回包 owner_user_id/候选人识别/0165-0166 网关函数族——全不触（I4 staged 在飞·§0.4）；本刀触 recruiter.service.ts 仅 `:167` 归一 helper 一处。〖rev2 席1-②澄清：「0165-0166 网关函数族全不触」指 0165/0166 所定义邀请两函数族本体（`gateway_notify_invited`/`gateway_recruiter_contact_share`）非 23_api_gateway.sql 文件全体；23 内 auth 族区段（`gateway_auth_signup`/`gateway_auth_login`/`gateway_active_candidate`）镜像同步属簇①义务（§1）非越界——I4 落线先例即 23 纯插入追加（:660-732）auth 族区零触〗
2. **#108/#109 不顺手**（🔒DEPS S3=DEPS-AUDIT 四守卫域·PK 魔数/.doc 拒绝/解压上限同族·防夹带）；**#36 不顺手**（5C·S9 Redis 决策域）；**#62 不顺手**（5E）。
3. **邮箱验证/重置密码流程不实施**（§1-簇③·SMTP 依赖未在位·位图字面只锁令牌/登出）；**渠道接入不立项**（#100 修法列原文「渠道接入另立项」）。
4. **commerce 账务语义零触**：reserve/confirm/release/CAS/exactly-once 与企业桶面字节零改（#100 只动验签与访问控制）。
5. **DDL 白名单**：本刀迁移仅限簇①归一+唯一索引与簇③会话表两件（0167+ 编号 EXEC 重 pin）；**零新 RLS 策略/零 BYPASSRLS/零角色授权变更**——任何额外迁移冲动=停手上报；镜像同步写 `sql/` 住地文件（23 auth 族区段）不另开迁移编号（仍在白名单两件语义内·rev2 席1-③）。
6. **PrincipalGuard 既有吊销机械零改**：pwd_epoch/status/保留主体/60s 缓存 evict 语义只增不翻（#36 多实例 seam 不动·归 5C）。
7. **est live=0**：零模型真实外呼·零生产操作·零 secrets（§6）。
8. MIG-RUNNER 约束族（#115/#134/#135/#145/#140/#141/#142/#136/#137/#3/#13/#15/#23/#16/#25/#122/#144/#150/#151/#152）零触·runner 特性零消费。

## §4 依赖

**零未决硬依赖（MIG-RUNNER 零硬依赖复核）**：①本刀迁移为普通 SQL 基线文件·非 #179 runner 特性消费方·不依赖分事务/超时模式——LEDGER :96 排序 MIG-RUNNER→AUTHZ-HARDEN 为**排程序非技术闸**·两刀可并行（任务书前提复核成立）；②迁移编号交点=packages/db/migrations 目录并发写与 0167+ 编号位（I4 staged 已占 0165/0166·§0.4）——照 G4/i2-b :137 例登记·EXEC 时重 pin。**下游无硬闸**：CI-WIRING(5D) #114 neg:* 纳 CI 顺手纳入本刀新臂（非闸）；5C 立项时 #36 形状随簇③会话表落地重估（登记不阻塞）；5E 批量与本刀零文件交集。**簇内前置**：#35/#112 同簇共生（登出依赖会话表·同刀同收）；#111/#131 同件族（同迁移）。

## §5 Ban 列表 + pins（沿 i3/diag 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 触 I4 面（邀请通知/回包 owner_user_id/候选人识别/0165-0166 网关函数族·§3-1 零触）；Ban 动 PrincipalGuard 既有吊销机械语义（§3-6 只增不翻·neg-auth 既有臂零翻）；Ban 新增 RLS 策略/BYPASSRLS/角色授权面（DDL 白名单=§3-5 两件·越界即停手上报）；Ban 存量邮箱静默合并（冲突行只报告·处置归运营·修法列「先排查存量冲突账号」逐字兑现）；Ban 无界清 payload（#18 只限超 TTL 滞留行·活跃 running 零触）；Ban 扩触 commerce 账务语义（§3-4）；Ban 顺带升级依赖包（DEPS-AUDIT 域·#106/#107 零触）；Ban 保留与实现不符的注释/宣称（`:60` 时序注释·CSP 注释随修法如实化）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 假体/静态·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①归一/滞留清理=隔离库 db prove（假时钟）②时序/限流/令牌=api prove 假哈希计数+假桶+假密钥③G7 拒启=子进程环境注入探针（零外呼）④CSP/HMAC=静态源断言+单测。prove 全 假体/静态/隔离库·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/authz-harden-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 diag/i3 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①归一形制 trim+lowercase+lower(email) 唯一索引 vs citext（推荐前者·citext 需扩展依赖）；读侧归一=SQL lower 比较 vs 入参先归一（推荐后者·SQL 函数零改）；②login 校验形=service 侧最小校验（推荐·保留 controller 限流全见理由）vs 挂 pipe 改限流序；③#33 恒时序=内存常量假哈希（推荐）vs SQL dummy row；④簇③会话表迁移与簇①同卷或独立编号；⑤#100 pay-callback 收权=纯签名（推荐·修法列原意）vs 登录+签名双门；⑥#120 失败锁定与 #18 TTL 两参数值；⑦CSP nonce vs hash（推荐 nonce·Next 中间件形）；⑧子刀切分=5A-1 账号会话簇（簇①②③·迁移两件）/5A-2 面硬化簇（簇④·零迁移）两子刀分派（推荐·LEDGER「可 2-3 子刀」·本卷为全域 REQUEST 两子刀共用）。

---

*AUTHZ-HARDEN REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`c042729b` · 分支 `line/authz-harden` · 工作树 `meetwise-authz` · 蓝本=批5 位图行双源（TASK-SOP-v2:82+LEDGER:84/:96 逐字）+更正版 issues-master 候选 16 件（:218-:278/:245-:249/:375/:389/:506 修法列逐字入 §1）+LEDGER :212 批5 水位（4/143 残 139）+形制 i3-job-mgmt-REQUEST（§0-§8·Ban/pins 同源）· 收编 12 件=#111+#131/#120半/#33/#34两半/#90/#180/#35/#112/#67/#100/#168/#18半（四簇=邮箱归一/login 改密/令牌会话/面硬化·簇切两子刀建议）· 不收 4 件=#108/#109（🔒DEPS S3）/#36（5C）/#62（5E）·#143 P4 随卷挂账 · 查重四条=I4 网关 owner 谓词（在飞未落 tip）/I3 assertPrincipal/GODFN-1c/Ha 系 RLS 守卫加固面全已闭零触 · 防重检查过（3 命中全登记性·无同名卷）· 现势并发登记=主工作树 I4 EXEC staged 20 文件未提交·锚全 HEAD 纯净态 git show 复核 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
