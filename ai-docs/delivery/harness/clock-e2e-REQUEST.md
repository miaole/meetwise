# UC-030-CLOCK REQUEST — 会话时钟/刷新 e2e 起草卷·覆盖矩阵 §1.0 UC-E2E-030 `:128` 残余面（时钟漂移/刷新轮换/长会话续命）隔离收据处置（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`** · alone≠dual · **STOP=draft（三处钉：本 Status 行 + §8 + 卷尾注）** · 本 commit 不预 claim 任何 post-commit EXIT。

**席位**：UC-030 会话时钟/刷新 e2e 起草席（docs-only 起草·协调方派·认领矩阵 `:128` 行 NHP 批已落 FAULT case 之后的残面·与批 A/B/C/各 UC 专属线互斥不重叠）。
**基线**：`origin/main` @ **`b894cad88`**（full `b894cad881ba453a4c2865fd34f66f0bd06ebb31` · `git fetch origin` 本 turn 两次亲跑 · 分支 `line/clock-e2e-draft` 零独有 commit · `git reset --hard origin/main` 亲证 HEAD 落 tip）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2381 ≤ cap 2386**（§2-1 亲算）· 工作树 `meetwise-clock`（仓根同级）。**现场漂移承登**：本 turn 首 fetch 时 origin/main 在 `47f26403b`（#145）·起草中前进至 `b894cad88`（#146 批 B 并线）——已 `reset --hard` 重 pin 全锚一次（§0.1 blob 全为重 pin 后值·结论零变）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 / §1.0.1 `:128` 残余行 / §1.0.3 合计读法）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（用例 SSOT·`:49-:50`）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-030 `:373` · TC 三条 `:388-:390`）→ 涉事机制源 `packages/domain/src/auth.ts` / `apps/api/src/platform/principal.guard.ts` / `apps/api/src/platform/auth-session.ts` / `apps/api/src/modules/auth/auth.controller.ts` / `apps/api/src/modules/profile/profile.service.ts` → 同族先例 `apps/api/test/neg-auth.proof.ts`（令牌负例+轮换既有面）与 `apps/api/test/uc-e2e-030-nhp-fault.proof.ts`（UC-030 隔离壳+净账读法先例·本卷零触）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`e2e-requirement-coverage-matrix.md` §1.0.1 **`:128`**「UC-E2E-030 · FAULT=**gap** · 读法『长会话刷新 E2E 缺』」+ §1.1 `:187`「负路径有；长会话刷新 E2E 缺」；②`non-happy-path-perf-load-case-matrix.md` **`:50` NHP-030-BOUND-01**（时钟漂移边界 · 期望「过期判定一致；无 silent extend」· 旗 **case-only** · 既有锚点 **`—`=零收据**）；③批 A REQUEST Row 3 残余明钉：D2「spec E2『静默 refresh token 刷新』产品**未接线**（全仓零 refresh token 面）→ **NOT claimed**（§1.1『长会话刷新 E2E 缺』叙事保持）」+ 处方⑦「矩阵旁证单列 `NHP-030-BOUND-01`（case-only · **本批不碰**）」；④§1.0.3 `:164` 双表同步令；⑤协调方派单（UC-030 会话时钟/刷新 e2e 刀·docs-only 起草）。

---

## 认领核对（矩阵 `:128` FAULT cell fresh 亲点 · NHP 批已落 cell 核对 · 残面认领）

- **已落核对（本席 `git merge-base --is-ancestor` + 文件亲读）**：`origin/line/nhp-batch-a-draft` @`726e0761c` **已是 origin/main 祖先（批 A 已并线）**——`NHP-030-FAULT-01` 真证据已落主线：`apps/api/test/uc-e2e-030-nhp-fault.proof.ts`（blob `176debe5` · 273 行 · F1 sweep 口/F2 显式 abandon 口/F3 双触发幂等/F4 未过期对照/F5 过期令牌短回归/N1-N2 额度净账 · 49/49）+ tracked 收据 `ai-docs/delivery/receipts/nhp-030-fault-01/`（01 isolated-receipt.json + 02 gate stdout）。**矩阵 `:128` cell 措辞不动是批 A 设计**（其 §2 EXIT 契约明钉「§1.0.1 `:114/:118/:128` 措辞不动」·升格仅经 coordinator nail）——本席核对后**不碰 FAULT cell 措辞**。
- **残面认定（批 A 未 claimed 明钉 · 本席亲证）**：①**E2 静默 refresh** = 批 A D2 NOT claimed（全仓零 refresh token 面·本卷 grep 复证零命中）→ **不可测停止条件登记（§1.3）不入臂**；②**时钟漂移边界** = case-matrix `:50` `NHP-030-BOUND-01` case-only **零收据**（批 A⑦「本批不碰」）→ **本刀认领面**；③**长会话刷新 E2E 缺**（`:128` 读法 + §1.1 `:187`）→ 拆为**刷新轮换臂**（产品已接线的签发/轮换/吊销机械）+**长会话续命臂**（7d TTL 内续命·无重复扣费）两臂认领，静默刷新分支除外。
- **与 neg:auth 的 wash 界线**：`neg-auth.proof.ts`（blob `1dd9cd0a` · 465 行）已密面=令牌负例族（过期 ttl 负 `:102`/刚过期 `:106`/篡改 `:83/:90`）+ 代次失配 `:118/:122` + 改密旧令牌死 `:360-:369` + kid 窗内/窗外 `:408-:415` + logout jti 四臂 `:422-:438` + legacy 两臂 `:440-:444`。**本刀臂与其 reason 级可分**（§0.3 逐臂标注可分性）· Ban 借任一臂宣 neg:auth 加强、Ban 借 neg:auth 宣本刀臂已有。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`b894cad88`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **32 树**实测——`line/clock-e2e-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep clock-e2e` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **已并线核对**：批 A（`726e0761c`）与批 B（`e98c4381e`）均 `--is-ancestor origin/main` 亲证 **MERGED**（origin/main tip `b894cad88`=PR #146 批 B merge）——批 A 触面（`:114/:118/:128` 三行旁注 + `uc030:nhp-fault` 注册 + 收据）与批 B 触面（`:115-117` 行注 + uc004/uc010/uc011 case）已落主线，非在飞。
- **在飞逐树亲读**（本地分支·origin 无对应 ref·`git -C <tree> log -1` 亲证）：
  - `line/nhp-c-draft`（worktree `meetwise-nhp-c`）@`29fd12114`（已 merge `b894cad88`）——其 REQUEST 卷残余盘点将 `:128` 记为批 A 已认领排除面，**未认领 UC-030 BOUND/残面**；与本卷零重叠。
  - `line/uc31-draft`（worktree `meetwise-uc31`）@`112ac8af0`——认领 `:129`（UC-031/032）面；与本卷零重叠。
  - `line/ag14-residual-draft` 等各 UC 专属线——认领面各在自卷；与本卷触面（矩阵 `:128` 邻区 + case-matrix `:50` 邻区 + 新 proof `uc-e2e-030-nhp-bound` 注册族）**行级互斥**。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=一隔离 prove 新文件 + 注册行（root `package.json` 双行 / `apps/api/package.json` 一行）+ runner 注册位（`scripts/run-e2e-isolated.mjs` 四位：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单——批 A 第四位教训承登）+ `ai-docs/architecture/ai/provider-egress-inventory.json` additive 环境引用登记（沿 uc028 `10b920521`/uc004 `834c91cb3` 先例形·漏登即 CI `environment_reference_unregistered` 红）+ 双表行内改（矩阵 `:128` 邻区 + case-matrix `:50` 邻区 + §1.3 登记）。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `b894cad88` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `6fc92dd0`（520） | **§1.0.1 `:128`（UC-E2E-030 · partial/gap/partial（过期）/blind · 读法「长会话刷新 E2E 缺」）· §1.1 `:187`（neg:auth 有令牌过期/吊销负例 · 长会话刷新 E2E 缺）**·§1.0.3 `:164` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `cbf9d97f`（199） | **`:49` NHP-030-NEG-01（partial · 既有锚 neg:auth）· `:50` NHP-030-BOUND-01（时钟漂移边界 · 「过期判定一致；无 silent extend」· case-only · 锚 `—` 零收据）** |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | UC-030 `:373`（时钟漂移/会话过期+长会话 token 刷新）· E1 `:381` / E2 `:382` / E3 `:384` · 后置 `:386` · 验收 A1/A2/A3 `:387` · TC-E2E-030-expire-lazy-vs-sweeper `:388` / **TC-E2E-030-token-refresh `:389`** / **TC-E2E-030-clock-drift `:390`** |
| `ai-docs/delivery/harness/nhp-batch-a-REQUEST.md` | —（本卷只读引用） | Row 3 D2「E2 静默 refresh 产品未接线 → NOT claimed」· 处方⑦「NHP-030-BOUND-01 case-only 本批不碰」 |
| `scripts/ai-docs/public-text-policy.mjs` | `e33818a6`（447） | `:149` `MAX_FILES = 2_386`（cap 亲证 · §2-1 预算核） |

### 0.2 码面锚（产品缝 · 注入缝 file:line 亲证 · symbol 级位移按 symbol 重钉）

**缝 A · 令牌钟缝（domain 纯函数 · nowSec 双端注入形——本刀主注入缝）**

| 锚 | blob（行数） | 钉位（逐条对码） |
|----|------------|------|
| `packages/domain/src/auth.ts` | `697da7dc`（109） | `:3` 卷头明钉「nowSec 注入便于 gate 确定性」· `:69-76` `signToken(userId, secret, ttlSec, nowSec, pwdEpoch=0, session?{jti})`——**nowSec 形参注入**· `:71` `exp: nowSec + ttlSec`（exp=签发钟+TTL 纯算术·无 grace 无容差）· `:86-104` `verifyTokenFull(token, secret, nowSec)`——**nowSec 形参注入**· **`:95` `if (typeof p.uid !== 'string' || typeof p.exp !== 'number' || p.exp < nowSec) return null;`（exp 判定面：严格小于——`exp === nowSec` 合法·`exp === nowSec - 1` 拒 = ±1s 边界缝亲证）**· `:92` HMAC `timingSafeEqual`（篡改 fail-closed）· `:96` `p.kid !== keyIdFor(secret)` → null（kid 错配拒）· `:97` pe 防御性归一（非负整数外塌 0）· `:52` `VerifiedToken{uid,pwdEpoch,jti?,kid?}` |

**缝 B · HTTP 守卫面（实钟 · 错误码优先序）**

| 锚 | blob（行数） | 钉位（逐条对码） |
|----|------------|------|
| `apps/api/src/platform/principal.guard.ts` | `50b38bc5`（112） | **`:85` `const nowSec = Math.floor(Date.now() / 1000);`（守卫侧实钟·不可注入——背签臂经真守卫行使即服务端钟权威面）**· `:87-90` 候选钥窗循环（`AUTH_SECRET` + `AUTH_SECRET_PREVIOUS` 逗号分隔·逐请求读 env）· `:91` 全不符 → 401 `invalid_token` · `:94` status 非 active → 401 `account_inactive` · **`:95` `st.epoch !== tok.pwdEpoch` → 401 `session_revoked`（代次吊销面）**· **`:98-99` `tok.jti && !isSessionActive(...)` → 401 `session_revoked`（jti 吊销面·恒在 `:95` 之后=错误码优先序：验签 exp 面 `:87-91` 先于代次先于会话查）**· `:101` `req.jti` 挂载供 logout |

**缝 C · 签发/轮换/吊销链（产品已接线刷新形 = 双产点 + logout；静默刷新口不存在）**

| 锚 | blob（行数） | 钉位（逐条对码） |
|----|------------|------|
| `apps/api/src/platform/auth-session.ts` | `ad1004e7`（91） | **`:19` `SESSION_TTL_SEC = 7 * 24 * 3600`（=604800·7 天）**· `:39-52` `issueSessionToken`：`:41` `jti=randomUUID()` · **`:43` `signToken(uid, secret, SESSION_TTL_SEC, Math.floor(Date.now() / 1000), ...)`（签发侧亦实钟·背签臂须夹具种子）**· `:44-47` INSERT `auth_user_session(jti,user_id,pwd_epoch)`（同请求原子先后=发出的 jti 必有行）· `:56-69` `revokeSession`：UPDATE `revoked_at=now() WHERE jti=$1 AND revoked_at IS NULL` + 同语句 CTE pg_notify + 返回是否真吊销（**幂等面：二次调用 0 行 → false 如实**）· `:73-85` `isSessionActive`（**fail-closed：行缺失/已吊销 → false**·60s 缓存+回填代次比对）· `:87-91` `issueSessionTokenOrThrow`（缺 AUTH_SECRET → 500 `auth_not_configured`） |
| `apps/api/src/modules/auth/auth.controller.ts` | `dea7229f`（37） | `:12` `@Post('signup')` · `:20` `@Post('login')` · `:29` `@Post('logout')`（**全文件零 refresh 路由**）· `auth.service.ts:120` login/signup 签发走 `issueSessionTokenOrThrow`（R1 产点清单第一处） |
| `apps/api/src/modules/profile/profile.service.ts` | `3abfa3a5`（227） | `:154` `UPDATE user_account SET password_hash=$2, pwd_epoch = pwd_epoch + 1 ...`（改密代次自增单语句原子）· `:158` `evictPrincipalStatus`（本进程即时+0189 广播）· **`:161` `issueSessionToken(this.db, principal, epoch)` 改密回签（R1 产点第二处·新代次新 jti）· `:162` `return token ? { changed: true, token } : { changed: true };`（回签令牌出响应体=续命面）**· `:161-163` 注记「旧 jti 会话由 pwd_epoch 前进天然失效（守卫既有机械零改）」=**改密不吊销会话行**（revoked_at 仍 NULL·吊销由代次机械承担·行保留审计） |
| 静默刷新口不存在亲证 | — | `grep -rn "refresh_token\|refreshToken\|/auth/refresh" apps/api/src apps/web/src packages/domain/src` 产品 src **零命中**（本卷亲跑·batch A D2 同钉复证）→ e2e-scenarios `:389` TC-E2E-030-token-refresh「静默刷新」分支**产品未接线·先接线后 prove**（§1.3 停止条件登记） |
| 旁证（零改动 · 互不替代） | `1dd9cd0a` / `176debe5` | `neg-auth.proof.ts`（既有轮换/吊销负例面 · 见认领核对 wash 界线）· `uc-e2e-030-nhp-fault.proof.ts`（E1 abandoned/额度面 · F1-F5+N1-N2 · 本刀零重铺零借用） |

### 0.3 认领登记（行号+用例名+缺列·亲读逐字）

| 行号 | 用例名 | 现列值（亲读） | 本刀补 |
|---|---|---|---|
| **矩阵 §1.0.1 `:128`** | **UC-E2E-030**（时钟漂移 / token 刷新） | NEG=**partial** · FAULT=**gap**（NHP-030-FAULT-01 已落主线·批 A 设计措辞不动）· BOUND=**partial**（过期）· ADV=**blind** · 读法「长会话刷新 E2E 缺」 | **残面隔离收据**（具名 case=`NHP-030-BOUND-01` 执行·case-matrix `:50` 锚 `—`→收据入账·BOUND 措辞 case-only 保留·EXIT0=case≠covered）；FAULT cell 措辞零触（升格权归协调方）；静默刷新分支停止条件登记（§1.3） |
| **case-matrix `:50`** | **NHP-030-BOUND-01**（时钟漂移边界 · 期望「过期判定一致；无 silent extend」） | 旗=**case-only** · 既有锚点=**`—`（零收据）**（批 A⑦ 明钉本批不碰） | **执行收据**（C/R/L 三臂族 · `:50` 措辞 case-only 保留+收据路径入账）；`:49` NHP-030-NEG-01 零触（neg:auth 既有锚保留） |

---

## §1 修法（残面补隔离收据 · 一行一 case 三臂族 · 零产品码触 · 零 invent covered · 零 live key）

**修法形状**（沿批 A/uc001/uc025 `nhp-*-prove` 族先例）：一个具名 NHP case = 新 proof 文件 `apps/api/test/uc-e2e-030-nhp-bound.proof.ts` + `apps/api/package.json` 注册行（`prove:uc030-nhp-bound`·沿 `:40` `prove:uc030-nhp-fault` 同形）+ root `package.json` 双行（`uc030:nhp-bound:prove`/`:raw`·沿 `:137-138` 同形）+ runner 四位注册（SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单——批 A 第四位教训承登）+ egress-inventory additive 登记· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**；isolated 真 PG（`run-e2e-isolated` 全迁移链）+ Nest createApp+listen(0)+fetch 真产品 HTTP（沿 `uc-e2e-030-nhp-fault.proof.ts` 同壳）+ domain 纯函数直接 import（缝 A 臂零 DB 面）· 零 live 模型 · 零 MODEL_API_KEY · 零外呼（`env -u` 三键具名：`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL`）；收据 `.tmp/<case>-receipts/` + tracked `ai-docs/delivery/receipts/uc030-bound-01/`（implementer pre-commit runs · **not evidence of record**）。行状态/列状态一字不动：EXIT0=case≠covered，升格仅经 coordinator nail 的 additive honesty；coveredCount=8 不变。

### Case · `NHP-030-BOUND-01` 执行（UC-030 · `apps/api/test/uc-e2e-030-nhp-bound.proof.ts`）

- **需求源**：`e2e-scenarios.md:373`（UC-030）· E3 `:384`「TTL/过期判定一律以**服务端时钟**为准 · 不被客户端篡改时间绕过」· A3 `:387`「篡改客户端时间不能延长会话」· TC-E2E-030-clock-drift `:390` · E2 `:382`/A2 `:387` 中**产品已接线子面**（重注入 principal 续跑 · 额度无第二次扣费——**静默刷新分支除外·§1.3**）+ case-matrix `:50` 期望「过期判定一致；无 silent extend」。
- **证据层**：isolated 真 PG + 真产品 HTTP 守卫面（缝 B）+ domain 纯函数注入面（缝 A）+ 真 HTTP 轮换链（缝 C）。
- **臂族一 · 时钟漂移臂（C1–C6 · 缝 A/B · 期望全部对码）**：
  - **C1 边界含等 ±1s 两向**：`signToken(u, s, 100, t0)` → `exp=t0+100`（`:71`）；`verifyTokenFull(令牌, s, t0+100)` → **非 null**（`:95` `p.exp < nowSec` 等值不拒）；同令牌 `verifyTokenFull(..., t0+101)` → **null**。零宽界两向各一断言。
  - **C2 零宽过期窗**：`ttl=0` → `exp=t0`：verify(t0) 非 null · verify(t0+1) null——**无 grace 秒无漂移容差**（过期判定一致·缝 A 纯算术对码）。
  - **C3 钟偏单调一致**：同令牌在注入 `nowSec ∈ {t0−86400, t0, t0+99, t0+100, t0+101}` 判定为 {有效,有效,有效,有效,null}——判定是 nowSec 的纯单调函数·客户端钟偏（快/慢）在域函数面无任何额外效应（E3「一律以服务端时钟为准」域函数面对码）。
  - **C4 无 silent extend（仅延长 exp 的篡改）**：合法令牌 payload **仅改 exp 位**（重编 base64url 不重签）→ `verifyTokenFull` null（`:92` HMAC）；同篡改体经真 HTTP `GET /profile` → **401 `invalid_token`**（guard `:87-91`）——篡改目标=**仅延长会话**（TC-E2E-030-clock-drift 传输面替身·与 neg-auth `:81-83` 首字符翻转臂 reason 级可分）。
  - **C5 错误码优先序（过期+已吊销叠合）**：jti 令牌经 logout 真吊销后**再背签使其过期**（exp<now）→ HTTP **401 `invalid_token`** 非 `session_revoked`（验签 exp 面 `:87-91` 先 throw·`:98` 恒不达——优先序对码臂）。
  - **C6 kid 守卫伴行臂**：错 kid 令牌 verify null（`:96`）+ HTTP 401 `invalid_token`——neg-auth `:408-:415` 窗内/窗外两臂已有·本臂仅 C 族回归伴行（**Ban 借臂宣 kid 轮换新证据·互不替代登记**）。
- **臂族二 · 刷新轮换臂（R1–R5 · 缝 C 真 HTTP 产品路径 · 期望全部对码）**：
  - **R1 双 login 轮换并存**：同户两次 `POST /auth/login`（`:20`）→ 两令牌 **jti 相异** + `auth_user_session` 恰 **2 行**且均 `revoked_at IS NULL` + 两令牌 `GET /profile` 均 **200**（多会话并存——neg-auth logout 段 signup+login 未断言 jti 相异/行数形状·可分）。
  - **R2 改密回签续命**：`POST /profile/change-password` 200 → 响应体 **`{changed:true, token}`**（profile.service `:162` 对码）→ **新令牌 `GET /profile` 200**（neg-auth `:360-:369` 只钉旧令牌死·**新令牌活面 unowned=本臂主断言**）+ 新 jti 行落账（恰 +1 行）+ 行内 `pwd_epoch` 快照 = 自增后代次（对 `auth_user_session.pwd_epoch` 列）。
  - **R3 改密吊销双保险机械对码**：改密后旧 jti 行 `revoked_at` **仍 IS NULL**（`:161-163` 注记+revokeSession 仅 logout 调·DB 直读对码）但旧令牌 **401 `session_revoked`**（guard `:95` 代次拒绝·先于 `:98` 会话查）——吊销由代次机械承担、0169 行保留审计（无 DELETE 形）。
  - **R4 logout 幂等**：同 jti 第二次 `POST /auth/logout` → 200 **`{loggedOut:true, revoked:false}`**（revokeSession `:56-69` `WHERE revoked_at IS NULL` 0 行如实 false——neg-auth `:428` 仅单次 `revoked:true`·二次幂等面 unowned）。
  - **R5 jti 唯一性**：signup+login+改密回签三次签发 → 三 jti 互异 + 恰 3 行（0169 jti PRIMARY KEY · `auth-session.ts:41` randomUUID 对码）。
- **臂族三 · 长会话续命臂（L1–L3 · 背签注入缝 + 产品守卫实钟 · 期望全部对码）**：
  - **L1 3 天停顿续命**：背签 jti 令牌（`signToken(uid, secret, SESSION_TTL_SEC, now−259200, epoch, {jti})` → `exp=now+345600`）+ `auth_user_session` 行种子（夹具豁免具名——`auth-session.ts:43` 签发实钟不可注入·背签必需）→ `GET /profile` **200**（guard `:85` 实钟判 `exp−now=4 天` 在窗内——7d TTL 内 3 天停顿续命真行使·服务端钟权威）。
  - **L2 超 TTL 一致拒**：同形背签 `now−8*86400`（`exp=now−86400 < now`）→ **401 `invalid_token`**（令牌面 8d>7d 一致拒·E1 abandoned/额度面 ≠ 本臂——`uc-e2e-030-nhp-fault` F1/F2 已钉·互不替代）。
  - **L3 续命/轮换无重复扣费**：R1 新 login 令牌走产品链 consent（`POST /privacy/consent`·`uc-e2e-001-nhp-adv.proof.ts:264` 先例形）+ owned∧ingested resume（`POST /resume` 文本）→ 面试 begin（沿 `uc-e2e-030-nhp-fault.proof.ts` 同形真产品口·EXEC 期按届时路由亲证重钉；202·**恰扣 1 单位**）→ **换 R1 第二令牌（异 jti 同户）** 读同场面试 GET **200** + `availableUnits` 净变**恰 −1**（不因续命/轮换重扣——E2「不重复扣费·幂等键守」域内对码；**Ban 借臂宣 SSE threadId 断点恢复面——UC-002/010 属·本臂零 SSE**）。
- **非替代申明**：`neg:auth`（既有负例/轮换面）· `uc030:nhp-fault`（E1 abandoned/双触发幂等/额度恰一次）· `full.e2e`（无 Key blocked 层）= 旁证互不替代 · Ban 互借关列 · EXIT0≠covered。

---

## §1.3 否决表（落选面诚实留痕 · 含停止条件登记 · 与认领核对互补）

| 落选项 | 否决/登记理由 |
|---|---|
| **E2 静默刷新分支（TC-E2E-030-token-refresh `:389`）** | **停止条件登记：码面不存在可测注入缝**——产品无 refresh token 口（§0.2 grep 零命中亲证 · auth.controller 全文件零 refresh 路由 · batch A D2 NOT claimed 同钉）→ **不可测·不硬造断言·先接线后 prove**；产品已接线子面（重注入续跑/无重复扣费）由 L3/R 族认领。 |
| FAULT cell 措辞（`:128` gap） | NHP-030-FAULT-01 已落主线但批 A 设计措辞不动（升格仅经 coordinator nail）——本卷零触。 |
| E1 abandoned/双触发幂等/额度恰一次面 | `uc030:nhp-fault` F1–F3+N1-N2 已钉（`176debe5`）→ 本卷零重铺（L2 仅令牌面·Ban 借臂双算）。 |
| ADV 列（`:128` blind） | neg:auth/authz-harden 旁证族已密（批 A Row 3 同 veto）· 新 case wash 风险 → 留后刀。 |
| SSE threadId 断点恢复 | UC-002/010 属（L3 明钉零 SSE）→ 出域。 |
| kid 轮换窗新 case | neg-auth 5A-1 簇③窗内/窗外两臂已有（`:408-:415`）→ 仅 C6 伴行臂不入新账。 |
| PERF/LOAD 分面 + web 客户端钟注入（e2e:ui） | 分面刀归属 · e2e:ui 降次未接线（服务端钟权威已由 C/L 臂覆盖）→ 留后刀。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2381**（stdout「public text policy scanned 2381 managed worktree files」亲读）· cap=**2386**（`public-text-policy.mjs:149` `MAX_FILES=2_386` 亲证）· 本卷新文件 +1 → 预期 **2382 ≤ 2386 = 不越限 · 无需步进**。如实承登：若 EXEC 期在飞并线使届时 scanned+1 > 2386 → 触「验收红不可修」停手上报（Ban 就地改 cap；步进 sanction 归协调方）。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自指·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 .md；EXEC 期 diff 面=本卷+双表行内改（矩阵 `:128` 邻区 + case-matrix `:50` 邻区）+ 一 proof 新文件 `apps/api/test/uc-e2e-030-nhp-bound.proof.ts` + 注册行（root `package.json` 双行 + `apps/api/package.json` 一行）+ runner 四位 + egress-inventory additive 登记 + 收据 tracked 面 `ai-docs/delivery/receipts/uc030-bound-01/`——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin）**：本 case 隔离 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 邻面不回退（`neg:auth` 与 `uc030:nhp-fault` 按届时 SSOT 口径恒等 EXIT0）· C/R/L 三臂族断言逐条对 §0.2 缝锚（任一臂实测与对码期望不符 → §8「机制不满足」停·**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）· 双表同步 diff 逐件登记（§1.0.3 `:164` 令）· 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:128` FAULT=**gap 零触**（升格权归协调方）· case-matrix `:50` 措辞 case-only 保留+收据路径入账（锚 `—`→收据）· `:49` NEG 行零触 · coveredCount=8 零翻转 · Ban 借 C/R/L 臂互 wash、Ban 借本刀收据宣 neg:auth/uc030-fault 加强。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行+runner 注册位·沿 uc001/uc025/uc030-fault nhp 族 prove-only 先例）。
2. **批 A/B/C 与 UC 专属线触面零触**：矩阵 `:114/:118`（批 A）· `:115-117` 行注（批 B）· 批 C 在飞卷触面（`:120/:121/:146`）· uc31/uc004/uc011/ag 线——只读；`provider-egress-inventory.json` 系共享 additive 登记面不在零触之列。
3. **静默刷新分支零实施**：§1.3 停止条件登记面——Ban 硬造 refresh 口断言、Ban 借 L3/R 族宣「静默刷新已测」。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支** · **零迁移零配置**（Ban 新迁移 Ban 触告警/CI 配置 · `AUTH_SECRET_PREVIOUS` 类 env 仅限 C6 测试进程窗·零配置文件改）。

## §4 依赖

**①上游已满足**：缝 A/B/C 产品缝全在树（§0.2 blob 亲算）+ 三层隔离壳先例（`176debe5` 同 UC 同壳）+ 净账读法先例（同文件 N1-N2）+ 夹具豁免先例（`uc-e2e-018-ttl-sweeper-abandon.proof.ts:56-61` 行种子形 + `uc-e2e-001-nhp-adv.proof.ts:264` consent 形）。**②同文件并发**：起草 turn 恰 1 新 .md 零交涉面；EXEC 期触矩阵 `:128` 与 case-matrix `:50` 邻区——§0.0 在飞交叠复核必做（批 A/B 已并线·零在飞重叠亲证）。**③下游**：残面收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）；静默刷新接线后由后续刀补 TC-E2E-030-token-refresh 真臂。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含升格 partial/借旁证 wash/实例宣伞）；Ban live key（零 Key 面硬跑）；Ban 触批 A/B/C/UC 专属线触面与其余 §1.0 行；Ban 触产品码面/迁移/CI 告警配置/cap 值（越限停手上报）；Ban 改共享 SSOT；Ban 触既有 proof 文件（`neg-auth.proof.ts`/`uc-e2e-030-nhp-fault.proof.ts` 零触只读引用）；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·**枚举完备**：① entitlement_bucket 种子（L3·`uc-e2e-018-ttl-sweeper-abandon.proof.ts:56-61` 先例形）+ ② `auth_user_session` 行种子（L1/L2 背签必需·`auth-session.ts:43` 实钟不可注入的诚实替代）+ ③ consent_record 种子（L3·`uc-e2e-001-nhp-adv.proof.ts:264` 先例形）+ ④ 面试壳行种子含状态钉（如该臂需跳过长链·沿 `176debe5` 壳行先例）——枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（EXEC 期全臂离线隔离 PG·零模型零外呼·§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）五类标记词 + conflict-marker grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径·不复抄卷内防自匹配——沿批 B/C §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 修法面与 §5 Ban/pins 与 §1.3 否决面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（`:128`/case-matrix `:50` 行值被他刀改写 · 缝 A nowSec 注入形/`:95` exp 判定/缝 B 优先序/缝 C 轮换链被改 · nhp-c/uc31 线并线与本卷对同表冲突改行）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期臂收据与 §1 对码期望不符（如 `exp === nowSec` 被拒 · 仅延长 exp 的篡改被放行 · 改密回签无 token · logout 二次 revoked:true · L1 背签 4d 余量被拒）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 1 case 三臂族面（需触产品码/静默刷新接线/covered 翻面/共享 SSOT/迁移/cap 值）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2386 / `neg:auth`·`uc030:nhp-fault` 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-10-26 起草落卷 · 残面非空 → 1 case 三臂族起草 · 起草即停）· pre-exec 双审两独立外席待派（窄域=本卷 §0 锚亲证+§1 修法+§1.3 否决+§2 门）· 状态终翻面权归协调方 · alone≠dual · Ban self-approve · **⛔push**。

---

*UC-030-CLOCK REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（本卷唯一 STOP 终态·三处钉：Status 行+§8+本行）· 覆盖矩阵 §1.0 UC-E2E-030 `:128` 残余面（FAULT case 批 A 已落主线核对后认领 · FAULT cell 措辞零触）· 修法=恰 1 具名 case（`NHP-030-BOUND-01` 执行 · case-matrix `:50` 锚 `—` 零收据 → 收据入账）三臂族：时钟漂移臂 C1–C6（缝 A `auth.ts:69/:71/:86/:95` nowSec 双端注入形 · 边界含等 ±1s/零宽窗/钟偏单调/仅延长 exp 篡改 401 invalid_token/错误码优先序/kid 伴行）+ 刷新轮换臂 R1–R5（缝 C 签发双产点 `auth-session.ts:39-52`+`profile.service.ts:154/:161-162` · 双 login 并存/回签续命/代次-行双保险/logout 幂等/jti 唯一）+ 长会话续命臂 L1–L3（背签注入缝 · 7d TTL 内 3 天停顿 200/超 TTL 401/轮换无重复扣费恰 −1）· 静默刷新分支=码面无可测注入缝停止条件登记（§1.3·不入臂·先接线后 prove）· docs+test-only 零产品码触 · cap 预算核=2381+1=2382≤2386 无需步进（亲算承登）· 双表同步令沿 §1.0.3 `:164` · base=origin/main `b894cad88`（#146 · 起草中自 #145 前进已 reset 重 pin 全锚如实承登）· 分支 `line/clock-e2e-draft` · 工作树 `meetwise-clock` · 与批 A（已并 `726e0761c`）/批 B（已并 `e98c4381e`）/批 C/uc31/ag 线行级互斥零重叠 · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0≠covered · releaseEvidence=false · ≠HA · ⛔push*
