# UC-030-ADV REQUEST — NHP-030-ADV-01 长会话刷新对抗臂起草卷·覆盖矩阵 §1.0.1 UC-E2E-030 `:128` ADV 列（blind 裸值·零 case——旧令牌重放/族撤销/并发双刷新竞态/时钟传输面·跨户令牌串用全族未证）（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-28 起草落卷·起草即停·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve·EXEC 立项需 ①双审 BOTH PASS 落卷 ②协调方明示授权 ③照 §0 协议对届时 tip 全量重 pin ④§1 修法面/§5 Ban/pins/§1.3 否决面零改动（改则回炉重审）·⛔push ⛔force-push）。

**席位**：UC-030 长会话刷新对抗臂起草席（docs-only 起草·协调方派·总盘 P1 小刀·认领矩阵 `:128` 行 **ADV 列 blind 裸值格**——clock 卷 §1.3 明钉「ADV 列 blind→新 case wash 风险→**留后刀**」·本卷即其后刀·与批 A/B/C、clock 卷（closed）、各 UC 专属线互斥不重叠）。
**基线**：`origin/main` @ **`c06ed67b5`**（full `c06ed67b5687a1bd52a9477d0124d6f216d8285d` · 2026-10-28 04:58:15 +0800 · `git fetch origin` 本 turn 亲跑 · 分支 `line/uc30-draft` 零独有 commit · worktree `meetwise-uc30`）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2433 ≤ cap 2438**（§2-1 亲算）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 `:47` 强制列 / §1.0.1 `:128` / §1.0.3 `:160-:166` 双表同步令）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（用例 SSOT·§1.1 `:32` 区 · `:50-:51` NHP-030 既有两行）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-030 `:373` · E1/E2/E3 `:380-:382` · 验收 `:384` · TC 三条 `:388-:390`）→ 涉事机制源 `packages/domain/src/auth.ts` / `apps/api/src/platform/principal.guard.ts` / `apps/api/src/platform/auth-session.ts` / `apps/api/src/modules/auth/auth.controller.ts` / `apps/api/src/modules/auth/auth.service.ts` / `apps/api/src/modules/profile/profile.service.ts` → 同 UC 姊妹收据（零触只读）`apps/api/test/neg-auth.proof.ts` / `uc-e2e-030-nhp-fault.proof.ts` / `uc-e2e-030-nhp-bound.proof.ts` → ADV 族先例 `harness/x16-adv-REQUEST.md`（NHP-016-ADV-01）· `harness/uc019-e2e-REQUEST.md`（NHP-019-ADV-01）· `apps/api/test/uc-e2e-033-nhp-adv.proof.ts`（NHP-033-ADV-01·零触）→ 本卷最近邻先例 `harness/clock-e2e-REQUEST.md`（UC-030-CLOCK·closed·其 §1.3 ADV 行 veto 即本卷立项出处）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`e2e-requirement-coverage-matrix.md` §1.0.1 **`:128`** UC-E2E-030 行 **ADV 列=`blind` 裸值（零 case 注记——NEG/FAULT/BOUND 三 cell 各带具名 case 收据注·ADV cell 独无）**+ 读法「长会话刷新 E2E 缺」；②case-matrix §1.1 区亲证 **无 `NHP-030-ADV-01` 行**（`:50` NEG/`:51` BOUND 之外 UC-030 零第三行·grep 亲证零命中）→ 长会话刷新对抗臂全族未证=本刀认领面；③clock 卷 §1.3 ADV 行 veto 亲读（「neg:auth/authz-harden 旁证族已密（批 A Row 3 同 veto）· 新 case wash 风险 → **留后刀**」）+ 其 ADV 盲面未认领亲证（closed @#152·仅落 BOUND cell 收据·`:128` ADV 列值亲读仍 blind 裸值）；④矩阵 §0.5 `:47` 强制列令（后续 knife 必须带 NEG+FAULT+BOUND+ADV+PERF+LOAD 列）+ §1.0.3 `:166` 双表同步令；⑤协调方派单（UC-030 长会话刷新对抗刀·docs-only 起草·⛔动主仓 ⛔push）。

---

## 认领核对 · fresh 行号亲点 + 在飞线零重叠核（本卷核心盘点）

**已认领排除面（本 turn 亲读）**：批 A=`:114/:118/:128`（FAULT cell 收据已落·措辞不动系批 A 设计）；批 B=`:115-117`；UC-004 `:115`；UC-011 `:117`；UC-014/026 `:119`；UC-015 `:120`；UC-016/029 `:121`（X16 NEG/FAULT/ADV 全落）；UC-017 `:122`；UC-018 `:123`；UC-019 `:124`；UC-025 `:125`；UC-028 `:127`；UC-031/032 `:129`（line/uc31-draft 旧线）；UC-033 `:130`（X33 已 closed）；UC-040–043 `:131` blocked；**UC-030 本行其余三 cell**=NEG partial（`:50` 行 neg:auth 既有锚）/FAULT gap（批 A 收据·升格权归协调方）/BOUND partial（clock 卷 `:51` 行收据已落）——**三 cell 本刀零触**。

| 认领 cell（本刀） | 行号 | 现列值（亲读逐字） | 判定 |
|---|---|---|---|
| **矩阵 §1.0.1 UC-E2E-030 · ADV 列** | **`:128`** 第 5 列 | **`blind`**（裸值·零 case 注记） | **本刀唯一认领格**：具名 case `NHP-030-ADV-01` 隔离 prove 真证据登记（blind 保持+case-only 措辞·EXEC 补注·EXIT0=case≠covered） |
| case-matrix §1.1 区（`:32` 黄金路径与会话 001/002/010/030） | 全表亲证 | **无 `NHP-030-ADV-01` 行**（`:50` NEG/`:51` BOUND 之外 UC-030 无第三行·grep 亲证零命中） | 本卷 EXEC 补 §1.1 区一新行（`:51` 邻区） |
| `:128` NEG/FAULT/BOUND 三 cell+§1.1 `:188` 分面行 | `:128`/`:188` | NEG=partial（neg:auth）· FAULT=gap/case-only（批 A）· BOUND=partial/case-only（clock 卷）· `:188` partial | **零触**（§1.3 逐项留痕·升格权归协调方） |

**在飞线零重叠核（本 turn `git merge-base`+log 逐树亲读）**：`line/xrep-draft` @`aef2dc999`（已并入本基线 c06ed67b·merge-base=本 tip 亲证——其触面=runner 四位/root·api package.json/egress manifest/自 REQUEST+收据·**coverage-matrix/case-matrix/auth 链零触亲证**·SSOT 行零交叠）；`line/x17-adv-draft` @`11588183e`（mb @`35150197`·对触面文件 mb 后**零新增提交**亲证）；`line/killsw-draft` @`b00c09df3`（tip=merge-base·零独有 commit）；`line/uc31-draft` @`112ac8af0`（旧线·触面零命中）；`line/ag18-draft`/`line/cap-2272`（mb @`112e6d26` 远古基线陈线·触面提交系 cap 步进史·对 `:128`/`:50-:51` 行值零改写亲读）；`line/loadw-exec` @`62f75399d`（红停归排期卷·触 case-matrix NHP-015 行/coverage `:151` 列·与本刀 `:128`/`:50-:51` **行级互斥**）；`line/campaign-state` @`9f642762d`（触面零命中）。**38 树实测**（`git worktree list` 主仓亲跑）·`line/uc30-draft` 恰 1 命中=本席；全 worktree 扫描 `harness/` 目录 **零 uc30-adv 同名卷**（落卷后唯一同名卷=本卷）。
**在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=一隔离 prove 新文件+注册行（root `package.json` 双行/apps-api `package.json` 一行）+runner 四位（`scripts/run-e2e-isolated.mjs`：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单——**xrep 并入后位数届时亲点重钉**·批 A 第四位教训承登·第五位 resource-caps 对本 case N/A 非 PERF/LOAD 沿 clock 卷先例形）+`ai-docs/architecture/ai/provider-egress-inventory.json` additive 登记（漏登即 CI `environment_reference_unregistered` 红）+双表行内改（矩阵 `:128` ADV cell 邻区+case-matrix `:51` 邻区 §1.1 区一新行）。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `c06ed67b5` 之后新增提交 → 触停止条件「现场漂移」停手上报。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`c06ed67b5`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 本 turn **38 树**实测——`line/uc30-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep uc30-adv` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **姊妹收据零触承登**：`neg-auth.proof.ts`（`1dd9cd0a`·465 行·90 断言）/`uc-e2e-030-nhp-fault.proof.ts`（`176debe5`·273 行·49 断言）/`uc-e2e-030-nhp-bound.proof.ts`（`b1ec5758`·334 行·48 断言）三件**零触只读**——本刀十臂与三件收据逐臂 reason 级可分表见 §0.2 各臂「可分」注与 §1.3 否决表。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `54cede58`（522） | **§1.0.1 `:128`（UC-E2E-030 · NEG=partial / FAULT=gap+case-only（批 A 收据注）/ BOUND=partial+case-only（clock 卷收据注）/ **ADV=`blind` 裸值=本卷认领格** / 读法「长会话刷新 E2E 缺」）**·`§1.1 :188`（neg:auth 有令牌过期/吊销负例 · 长会话刷新 E2E 缺）·§0.5 `:47` 强制列 · §1.0.3 `:160-:166` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `24803ac5`（213） | **§1.1 区头 `:32`（黄金路径与会话 001/002/010/030）· `:50` NHP-030-NEG-01（partial · neg:auth）· `:51` NHP-030-BOUND-01（case-only · clock 卷收据锚）**·§1.1 区亲证无 NHP-030-ADV-01 行（本卷 EXEC 补一新行·`:51` 邻区） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | UC-030 `:373` · E1 `:380`/E2 `:381`/E3 `:382` · 后置 `:383` · 验收 A1/A2/A3 `:384` · TC `:388-:390` |
| `scripts/ai-docs/public-text-policy.mjs` | `272cd606`（536） | `:238` `MAX_FILES = 2_438`（cap 亲证 · §2-1 预算核） |
| `packages/domain/src/auth.ts` | `697da7dc`（109） | `:69-76` `signToken(userId,secret,ttlSec,nowSec,pwdEpoch,session?)`（nowSec/ttl 双注入口）· `:71` `exp=nowSec+ttlSec` 纯算术 · **`:95` `p.exp < nowSec` 严格小于判定（等值不拒·零最大寿命上界——TC1/TC2 对码面）** · `:92` HMAC `timingSafeEqual` · `:96` kid 守卫 |
| `apps/api/src/platform/principal.guard.ts` | `50b38bc5`（112） | **`:85` `const nowSec = Math.floor(Date.now()/1000)`（守卫实钟——TC1 传输面行使位）** · `:87-91` 候选钥窗+全不符 401 `invalid_token` · `:93-94` accountState→401 `account_inactive` · **`:95` `st.epoch !== tok.pwdEpoch` → 401 `session_revoked`（代次族撤销面——RP2/RP3 对码位）** · **`:98-99` `tok.jti && !isSessionActive(...)` → 401 `session_revoked`（jti 吊销面·恒在 `:95` 后——RP1 死 jti 重放拒位）** · `:100-101` `req.principal=tok.uid; req.jti=tok.jti`（principal 恒取签名 uid——XU1/XU2 对码位） |
| `apps/api/src/platform/auth-session.ts` | `ad1004e7`（91） | `:19` `SESSION_TTL_SEC = 7*24*3600`（**仅约束签发侧 `:43`——TC2 对码位**）· `:39-49` `issueSessionToken`（`:42` jti=randomUUID · `:43` 签发实钟恒 7d）· **`:56-66` `revokeSession`（`WHERE jti=$1 AND revoked_at IS NULL` 二次 0 行 false——RC2 并行 exactly-once 对码位）** · **`:73-84` `isSessionActive`（`:78` `SELECT 1 WHERE jti=$1 AND revoked_at IS NULL` **零 user_id 谓词**=XU2 对码位·fail-closed 行缺失/已吊销 false）** |
| `apps/api/src/modules/auth/auth.controller.ts` | `dea7229f`（37） | `:12` signup · `:20` login · **`:29-36` logout（`:34-35` `this.auth.logout(req.principal, req.jti)`——吊销恒绑定令牌自身 jti·XU1 对码位；全文件零 refresh 路由）** |
| `apps/api/src/modules/auth/auth.service.ts` | `3b0d7a59`（122） | `:11-:26` RL_SIGNUP_IP/RL_LOGIN_IP/RL_LOGIN_GLOBAL env 覆写口（产品明钉 perf/E2E 档·测试进程窗）· `:39-75` signup（`:46` 三桶序）· `:77-109` login（`:90-93` 三桶 · `:103` verifyLogin 恒时序 · `:108` `issue(u.id, u.pwd_epoch)` 令牌内嵌当前代次）· `:114-117` logout（`:115` `revokeSession` 恰单 jti） |
| `apps/api/src/modules/profile/profile.service.ts` | `3abfa3a5`（227） | `:16-:28` RL_CHGPWD/RL_CHGPWD_IP/RL_CHGPWD_FAIL env 覆写口 · **`:133` `changePassword`** · **`:147` 产品自钉竞态注释「并发两次改密各自 read-modify-write 在行锁内串行,代次 0→1→2 不丢更新…先提交者回签的令牌内嵌旧代次…会被终值判失效——**极罕见的自锁,可接受**」（RC1 行使位=产品自钉语义首次行使）** · `:154` `UPDATE ... pwd_epoch = pwd_epoch + 1`（单语句原子）· `:157` `evictPrincipalStatus` · `:159-:161` 注记+`issueSessionToken(this.db, principal, epoch)` 改密回签 · `:162` `return token ? {changed:true,token} : {changed:true}` · `:40` `me()` SELECT id,email,status...WHERE id=$1（XU1 归因读面） |
| 旁证（零触只读） | 见 §1 各臂可分注 | neg-auth `1dd9cd0a` · fault `176debe5` · bound `b1ec5758` · x33-adv `ecbf39af` |
| 静默刷新口不存在亲证 | — | `grep -rn "refresh_token\|refreshToken\|/auth/refresh" apps/api/src apps/web/src packages/domain/src` 产品 src **零命中（EXIT=2·本 turn 亲跑复证=clock 卷同钉）** → e2e-scenarios `:389`「静默刷新」分支产品未接线·停止条件维持（§1.3） |

### 0.2 码面锚（对抗臂 · 注入缝+期望值逐条对码 @`c06ed67b5`）

**Case · `NHP-030-ADV-01` · RP 族（旧令牌重放/族撤销对抗）**

| 臂 | 注入缝（对码） | 期望值（逐条钉死） | 可分性（防 wash） |
|---|---|---|---|
| RP1 死 jti 令牌重放对写嘴 sweep | logout 真吊销（产品路径 `auth.controller:29-36`）后，同死令牌打**写嘴**：①再 `POST /auth/logout` ②`POST /profile/change-password`（携正确旧密）——guard `:98-99` jti 会话查恒先于 handler | 两嘴全 **401 `session_revoked`**；DB 零副作用断言：`auth_user_session` 行数零增、`pwd_epoch` 零动、`revoked_at IS NOT NULL` 恰 1 行不变、零消费面 | neg-auth `:432` 仅 **GET /profile 读面**单嘴；bound R4(b) 仅 POST /auth/logout 单嘴且明钉**不断言首次 POST 状态码**——本臂=写嘴 sweep+零副作用账面（写嘴全婴拒+账零动=新面） |
| RP2 族撤销=代次机械全族行使 | 同户 **3× login** 并存（3 jti 均 epoch 0·bound R1 只 2×）→ `change-password` 恰 1 次（`:154` 代次自增）→ 3 旧令牌逐一重放 | 3 旧令牌全 **401 `session_revoked`**（guard `:95` 代次拒）；**3 行 `revoked_at` 仍 IS NULL**（吊销由代次机械承担·`profile.service:159-161` 注记+revokeSession 仅 logout 调——行保留审计·零 DELETE）；回签新令牌 200（新代次·`profile.service:162`） | neg-auth `:360-:369` 仅**单令牌**死面；bound R3 仅**单 jti** 行保留+单令牌死——本臂=**账户级全族灭**（「族撤销」在此产品=pwd_epoch 代次·非 jti 族表——正向钉） |
| RP3 legacy 无 jti 令牌代次死面 | 手签**无 jti** legacy 令牌（测试钥·neg-auth `tokenFor` 先例形·无会话行）→ 改密后重放 | **401 `session_revoked`**（guard `:95` 代次面恒行——legacy 只跳过 `:98` 会话查**不跳代次**）；`auth_user_session` 零行零动 | neg-auth `:440-:445` legacy 仅钉 **logout 存活面**（200+revoked:false 如实）——本臂钉 legacy 在代次机械下**无死豁免**（登出无效≠改密无效·二面可分） |

**Case · `NHP-030-ADV-01` · RC 族（并发双刷新竞态）**

| 臂 | 注入缝（对码） | 期望值（逐条钉死） | 可分性（防 wash） |
|---|---|---|---|
| RC1 并发双改密自锁钉 | 同户两路**并行** `POST /profile/change-password`（Promise.all·同正确旧密）——`profile.service:154` 单语句 `pwd_epoch+1` 行锁内串行 + `:147` 产品自钉注释行使 | 两响应 **200 `changed:true`**；`pwd_epoch` 终值=**始值+2**（零丢更新）；两回签令牌**恰一活一死**（先提交者内嵌旧代次→401 `session_revoked`·后提交者→200——`profile.service:147`「极罕见的自锁,可接受」产品自钉语义首次行使钉·**不钉孰先孰后·钉恰一活一死不变式**）；旧会话行零 DELETE | bound R2 **串行**单改密回签；R5 串行三签发 jti 唯一——本臂=**并行竞态格**（两 UPDATE 竞争行锁+两回签代次窗） |
| RC2 并发双吊销 exactly-once | 同 jti 两路**并行** `POST /auth/logout`（Promise.all）——`revokeSession` `:56-66` `WHERE revoked_at IS NULL` 并发行锁串行恰一 UPDATE 命中 | 响应集合 `{revoked:true, revoked:false}` **恰多重各 1**（不钉顺序——并行发出序不钉）；`revoked_at` 落账**恰一次**（恰 1 行非 NULL）；两响应 `loggedOut:true` | bound R4(a) **串行执行顺序钉 true→false**（R4 消歧句随 clock 卷）；neg-auth `:428` 单次 revoked:true——本臂=**并行发出+集合钉**（竞态 exactly-once 面·串行序钉的竞态变体） |

**Case · `NHP-030-ADV-01` · TC 族（时钟对抗 · 传输面新向）**

| 臂 | 注入缝（对码） | 期望值（逐条钉死） | 可分性（防 wash） |
|---|---|---|---|
| TC1 传输面实钟短窗行使 | 背签 `signToken(uid, secret, 1, now, 0, {jti})`（ttl=1s·`:69-76` 注入形）+ 会话行种子（豁免②·签发侧恒 7d 实钟不可产短窗）→ 立即 GET /profile → 等 ≥2s → 再打 | 立即 **200**（guard `:85` 实钟 `exp−now=1s` 窗内）；≥2s 后 **401 `invalid_token`**（`auth.ts:95` exp 判定经真守卫行使）——服务端钟权威的**真墙钟传输面**行使 | bound C1/C2/C3 全为**域函数 nowSec 注入面**（零实钟零传输）；本臂=真墙钟+真守卫传输面（clock 卷 §1.3「web 客户端钟注入 e2e:ui 降次未接线」域外·隔离进程内 sleep 非 web 面） |
| TC2 远期 exp 背签越 TTL 窗（诚实钉+P3 疣候选） | 背签 `signToken(uid, secret, 180*86400, now, 0, {jti})`（ttl=180d ≫ SESSION_TTL_SEC）+ 行种子（豁免②）→ GET /profile | **200**（`verifyTokenFull` `:95` 只判 `exp<now` **零最大寿命上界**；`SESSION_TTL_SEC` `auth-session.ts:19` 仅约束签发侧 `:43`）——诚实钉「守卫层零最大寿命执行」**现状态语义**+**P3 语义疣候选登记（翻面权归协调方）**；披露：需持 AUTH_SECRET=测试面自持·现实敌手无钥不可造——**语义钉非漏洞宣称** | bound L1 背签在 7d TTL 窗**内**（3d 停顿）；L2 朝**过去**过期——本臂朝**未来越窗**新向（三向可分：窗内/过去/远期未来） |

**Case · `NHP-030-ADV-01` · XU 族（跨户令牌串用）**

| 臂 | 注入缝（对码） | 期望值（逐条钉死） | 可分性（防 wash） |
|---|---|---|---|
| XU1 令牌=身份归因+跨户登出零扰 | A/B 双户各 login（产品路径）；A 令牌 GET /profile + A 令牌 POST /auth/logout | GET /profile **200 且响应 `id`/`email`=A**（`profile.service:40` `WHERE id=$1` 按签名 uid 归因）；A logout 恰吊 A jti（`auth.controller:34-35` req.jti 来自令牌自身）→ **B 令牌照常 200 + B 行 `revoked_at` 仍 IS NULL**（`revokeSession:57` `WHERE jti=$1` 单行） | X33 E2 系会话**缓存键隔离**（logout 不 evict 他主体缓存）；neg-auth `:434` 异 jti 不互吊系**同户**两 jti——本臂=跨户**归因+DB 行面**零扰 |
| XU2 jti-uid 非绑定现状态语义钉（诚实披露） | 持测试钥手签 uid=**A** + jti=**B 的活跃 jti**（真实 login 产·非种子）→ GET /profile | **200 且 principal=A**（`isSessionActive:78` `SELECT 1 WHERE jti=$1` 零 user_id 谓词=行活性不绑 uid；`guard:100` principal 恒取签名 uid）→ 响应身份恒 A（B 数据零可达）+ **B 行零扰动+B 令牌照常 200**；披露：需钥=全局失守面·零特权提升（有钥敌手可直签 uid=B）——**信任模型语义钉非漏洞宣称·零修复诉求** | 全姊妹收据零同面（X33 E2 缓存键/neg-auth 同户/跨户均未行使 jti-uid 绑定语义）——unowned 面首次钉 |
| XU3 跨户代次推进零串扰 | B `change-password`（B epoch+1）→ A 令牌再打 GET /profile | **200 零扰**（`accountState:50` `WHERE id=$1` 按 uid 键控·B 代次推进不触 A 态）；A 的 `pwd_epoch`/会话行零动 | X33 E1 系**目标主体被 disable** 的广播 401 `account_inactive` 正拒面——本臂=**他主体代次推进**对 A 的负向零扰面（方向与拒码均异） |

**N · 净账审计（会话账口径）**：逐臂枚举 `auth_user_session` 行账（每臂前后行数+`revoked_at IS NOT NULL` 计数·枚举式沿 clock 卷/批 C 先形）+ `pwd_epoch` 单调账（RP2 +1 / RC1 +2 / RP3+XU3 +1·恒单调零回退）+ **零消费面零 entitlement 触**（全臂零 interview/resume/consent/额度触——审计口径=**会话账**非额度账·与 bound L3/fault N1-N2 额度账口径如实申明互不替代）。

### 0.3 认领登记（行号+用例名+现值·亲读逐字）

| 行号 | 用例名 | 现列值（亲读） | 本刀补 |
|---|---|---|---|
| **矩阵 `:128` ADV cell** | **UC-E2E-030 ADV** | **`blind`**（裸值·零注记） | 具名 case `NHP-030-ADV-01`（blind 保持+case-only 措辞+收据注·EXIT0=case≠covered） |
| case-matrix §1.1 区 | —（无行） | 无 `NHP-030-ADV-01` 行 | EXEC 补一新行（`:51` 邻区） |
| 矩阵 `:128` NEG/FAULT/BOUND+`:188` 分面 | NHP-030-NEG-01/FAULT-01/BOUND-01 | partial / gap+case-only / partial+case-only / partial | **零触**（§1.3 留痕·升格权归协调方） |

---

## §1 修法（恰 1 具名 case=`NHP-030-ADV-01` · 一 proof 四臂族十臂 · 沿 x16/x33/bound 先例形 · 零产品码触 · 零 invent covered · 零 live key）

**修法形状**：新 proof `apps/api/test/uc-e2e-030-nhp-adv.proof.ts`（隔离真 PG+Nest createApp+listen(0)+fetch 真 HTTP 三层壳·沿 `b1ec5758` 同 UC 同壳先例）+ apps/api `package.json` 注册行（`prove:uc030-nhp-adv`·沿 `prove:uc030-nhp-bound` 同形）+ root `package.json` 双行（`uc030:nhp-adv:prove`/`:prove:raw`·**零碰撞亲证**：`uc030:nhp-fault`/`uc030:nhp-bound` 在树·`uc030:nhp-adv` 全树 grep 零命中）+ runner 注册位四位（SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单·届时亲点重钉——**第五位 resource-caps N/A**：CAPS_CHILD 仅 PERF/LOAD 目标·本 case ADV 非 PERF/LOAD·clock/X16 先例形承登）+ egress 环境引用登记（`ai-docs/architecture/ai/provider-egress-inventory.json` additive·MODEL_API_KEY/DASHSCOPE_API_KEY/DASHSCOPE_COMPAT_BASE_URL × 新 proof·class=test-isolation·沿 bound 卷三目先形·proof 内 in-process 自删+boot 前后断言·漏登即 CI 红）· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**；isolated 真 PG（`run-e2e-isolated` 全迁移链）· **零 MODEL_API_KEY 零外呼**（`env -u` 三键具名：`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL`）；AUTH_SECRET=测试进程窗自持测试值（背签/手签缝·沿 neg-auth `tokenFor`/bound 背签臂先形·非供应商 Key）；RL env 覆写口测试进程窗具名（`RL_SIGNUP_IP`/`RL_LOGIN_IP`/`RL_LOGIN_GLOBAL`/`RL_CHGPWD`/`RL_CHGPWD_IP`/`RL_CHGPWD_FAIL`·`auth.service.ts:11-26`/`profile.service.ts:16-28` 产品明钉 perf/E2E 覆写档·零配置文件改）；姊妹收据 `neg-auth`/`uc-e2e-030-nhp-fault`/`uc-e2e-030-nhp-bound` 三件零触；收据 `.tmp/uc030-nhp-adv-receipts/` + tracked `ai-docs/delivery/receipts/uc030-nhp-adv/`（implementer pre-commit runs · not evidence of record）。行/列状态一字不动：EXIT0=case≠covered，coveredCount=8 不变。

### Case · `NHP-030-ADV-01`（UC-030 ADV 残余 · 长会话刷新对抗四臂族十臂）

- **需求源**：`e2e-scenarios.md:373`（UC-030 时钟漂移/会话过期+长会话 token 刷新）· E3 `:382` 服务端钟权威（TC 族）· E2 `:381`/A2 `:384` 产品已接线子面（签发/轮换/吊销机械——**静默刷新分支除外·§1.3 停止条件维持**）· E1/A1 出域（fault 卷已落·§1.3）+ 矩阵 §0.5 `:47` ADV 强制列 + `:128` ADV cell blind 认领。
- **证据层**：isolated 真 PG + 真产品 HTTP 守卫面（缝 B）+ domain 纯函数背签注入（缝 A）+ 真 HTTP 签发/轮换/吊销链（缝 C）+ Promise.all 并行竞态口（RC 族）。
- **臂**：PC = signup/login happy 对照基面（真 HTTP 双产点·供各臂复用）；**RP1** 死 jti 重放对写嘴 sweep（§0.2 期望表）；**RP2** 代次族撤销全族行使（3 并存会话一改密全灭+行保留）；**RP3** legacy 无 jti 令牌代次死面；**RC1** 并发双改密自锁钉（恰一活一死+epoch+2 零丢更新）；**RC2** 并发双吊销 exactly-once（{true,false} 恰多重各 1·不钉顺序）；**TC1** 传输面实钟 TTL=1 短窗行使；**TC2** 远期 exp 背签越 TTL 窗诚实钉+P3 疣候选；**XU1** 令牌=身份归因+跨户登出零扰；**XU2** jti-uid 非绑定语义钉（诚实披露）；**XU3** 跨户代次推进零串扰；**N** = 会话账净审计（§0.2）。
- **非替代申明**：`neg:auth`（`1dd9cd0a`·令牌负例族/单令牌代次死/kid 窗/logout jti 四臂含同 jti 复用**读面**/legacy logout 存活/reserved_principal 三臂）· `uc030:nhp-fault`（`176debe5`·E1 abandoned/sweep 双触发幂等/额度面）· `uc030:nhp-bound`（`b1ec5758`·C1-C6 域函数时钟面/R1-R5 串行轮换/L1-L3 窗内续命）· X33（`ecbf39af`·跨主体写竞态/缓存键隔离/会话 jti 键 logout 面）= 旁证互不替代 · Ban 互借关列 · EXIT0≠covered。

---

## §1.3 否决表（落选项诚实留痕 · 含停止条件登记 · 与认领核对互补）

| 落选项 | 否决/登记理由 |
|---|---|
| **E2 静默刷新分支（TC-E2E-030-token-refresh `:389`）** | **停止条件登记维持：码面不存在可测注入缝**——产品无 refresh token 口（§0.1 grep EXIT=2 复证·auth.controller 全文件零 refresh 路由·clock 卷同钉）→ 不可测·不硬造断言·先接线后 prove；产品已接线子面（签发/轮换/吊销/续命）由 RP/RC/TC 族对码行使。 |
| 伪造 reserved `__system` 前缀令牌臂 | neg-auth `:126/:130/:135` 三臂已钉（401 `reserved_principal`·guard `:92`）→ 同缝再臂 wash。 |
| kid 窗内/窗外+错 kid 臂 | neg-auth 簇③两臂+bound C6 伴行已钉 → wash。 |
| 双 login 并存串行面 / 单改密回签串行面 / logout 串行幂等序 | bound R1/R2/R4 已钉 → RC 族只取**并行竞态格**（RC1 并发双改密/RC2 并发双吊销）·串行面零重铺。 |
| login∥login 并行竞态臂 | 并行 login 零共享可竞争状态（randomUUID+INSERT 零冲突面·`auth-session.ts:42-47`）→ 无对抗增益·硬造臂=wash 风险 → 不设臂。 |
| 时钟域函数面（±1s 边界/零宽窗/单调/仅延长 exp 篡改/优先序） | bound C1-C5 已钉 → TC 族只取**传输面实钟**（TC1）与**远期背签越窗**（TC2）两新向。 |
| 额度/扣费重放面 | bound L3（轮换无重复扣费）+fault N1-N2（恰一次 release）已钉 → 本刀零额度臂（N 审计=会话账口径·§0.2）。 |
| x-user-id dev-header 逃逸臂 | `AUTH_DEV_HEADER=1` 测试窗系产品明钉开发面+生产硬闸（`guard:105` `NODE_ENV!=='production'`）+neg-auth devheader 臂已有 → 出域。 |
| e2e:ui 客户端钟篡改面 | 分面刀归属·降次未接线（clock 卷 §1.3 同 veto）→ 留后刀。 |
| TC2/XU2 的修复诉求 | 本刀**只语义钉零修复诉求**（TC2=零最大寿命执行·XU2=jti-uid 非绑定——均需持钥·零特权提升·现实敌手面外）→ P3 语义疣候选仅 TC2 一条登记（翻面权归协调方·Ban 借收据宣漏洞/宣修复）。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2433**（stdout「public text policy scanned 2433 managed worktree files」亲读）· cap=**2438**（`public-text-policy.mjs:238` `MAX_FILES = 2_438` 亲证）· 本卷新文件 +1 → 预期 **2434 ≤ 2438 = 不越限 · 无需步进**（余量 4）；EXEC 期 +1 proof → 2435 ≤ 2438（tracked 收据 `.log` 非 TEXT_EXTENSIONS 不计受管扫描·沿 clock/X16 收据先形）· 届时若并线致 union 实测 >2438 → 触「验收红不可修」停手上报（步进 sanction 归协调方·Ban 就地改 cap）。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:158-163`·不复抄卷内防自指）+行首冲突标记严格形 grep 零命中（起草席亲跑·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 .md；EXEC 期 diff 面=本卷+新 proof 1+注册三行（root 双行/apps-api 一行）+runner 四位（届时亲点）+egress additive 登记+双表行内改（矩阵 `:128` ADV cell 邻区+case-matrix `:51` 邻区 §1.1 区一新行）+tracked 收据面 `ai-docs/delivery/receipts/uc030-nhp-adv/`——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin）**：`pnpm uc030:nhp-adv:prove` EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 邻面不回退（`neg:auth` 90 断言恒等+`uc030:nhp-bound` 48 恒等+`uc030:nhp-fault` 49 恒等·按届时 SSOT 口径）· 十臂断言逐条对 §0.2 缝锚（任一臂实测与对码期望不符 → §8「机制不满足」停·**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）· **RC1/RC2 并行臂环境红/机制红分口**：并行口超时/挂起系环境红（停判 ENV-RED marker·零断言迁就·xrep 卷先形）；确定性断言红（epoch 终值/多重集合/恰一活一死不变式）系机制红·两分口如实台账 · 双表同步 diff 逐件登记（§1.0.3 `:166` 令）· **lint 帽承登预置**：EXEC 期新 proof 如添 warning → 沿 X16 §9-post 双帽先例形·协调方 sanction 面·非本起草刀落码 · 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:128` ADV cell 与 case-matrix §1.1 新行措辞仅允许「blind 保持+case-only 收据注」诚实登记 · NEG/FAULT/BOUND 三 cell+`:188` 分面零触 · coveredCount=8 零翻转 · 静默刷新停止条件登记零解除 · Ban 借本收据宣 UC-030 covered/ADV 列升格 · Ban 借收据 wash neg:auth/fault/bound/X33（本刀臂与其 reason 级可分·互不借用）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行+runner 注册位·沿 bound/X16 prove-only 先例）。
2. **姊妹收据零触**：`neg-auth.proof.ts`+`uc-e2e-030-nhp-fault.proof.ts`+`uc-e2e-030-nhp-bound.proof.ts` 三件只读；X33/uc010/uc017 等他 UC proof 族只读；clock 卷 REQUEST 只读。
3. **静默刷新分支零实施**：§1.3 停止条件登记面——Ban 硬造 refresh 口断言、Ban 借 RP/RC/TC 族宣「静默刷新已测」。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方（含 TC2 P3 语义疣候选词条翻面）。
5. **covered/queue 翻面零预支** · **零迁移零配置零 Key**（行种子系隔离夹具种子沿豁免具名·非迁移；AUTH_SECRET/RL_* env 仅限测试进程窗·零配置文件改·Ban 造 .env*）。

## §4 依赖

**①上游已满足**：缝 A/B/C 产品缝全在树（§0.1 blob 亲算——六机制文件 blob 与 clock 卷 §9-EXEC 重 pin 值**逐值恰等**=零机制漂移亲证）+ 三层隔离壳先例（`b1ec5758` 同 UC 同壳）+ 背签/行种子豁免先形（bound 豁免②同形）+ RL env 覆写口在树（`auth.service.ts:11-26`/`profile.service.ts:16-28`）+ 手签 legacy 令牌先形（neg-auth `tokenFor`）。**②同文件并发**：起草 turn 恰 1 新 .md 零交涉面；EXEC 期触矩阵 `:128` 邻区与 case-matrix `:51` 邻区+runner/package.json/egress/policy 共享 additive 面——§0.0 在飞交叠复核必做（xrep 在飞触共享面·SSOT 行零交叠亲证·冲突沿 #154/#155 dual-keep 先例形处置）。**③下游**：ADV 残余收据供 UC-030 行升格评估族引用（评估权归后继刀·本刀 Ban 代评）；静默刷新接线后由后续刀补 TC-E2E-030-token-refresh 真臂。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就·RC 族环境红/机制红分口如实台账）；Ban invent covered（含升格 blind/借旁证 wash/实例宣伞）；Ban live key（零供应商 Key 面硬跑·est live=0·AUTH_SECRET=测试进程窗自持测试值非供应商 Key）；Ban 触产品码面/迁移/CI 告警配置/cap 值（越限停手上报·步进 sanction 归协调方）；Ban 触姊妹 proof 三件（neg-auth/fault/bound）与 X33/他 UC proof 族、clock 卷、共享 SSOT；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·**枚举完备**：① `auth_user_session` 行种子（**仅 TC1/TC2 两臂**·背签必需——`auth-session.ts:43` 签发实钟+恒 7d TTL 不可注入的诚实替代·bound 豁免②同形）——**枚举外零种子**：全部 principal/会话/吊销/改密走产品路径（signup/login/logout/change-password 真产品口）·XU2 手签令牌系测试钥签名面非 DB 种子·零桶种子零 consent 种子（全臂零额度面）——枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban RC 族顺序过度钉死（RC2 并行发出序不钉·钉集合不变式；RC1 钉恰一活一死不钉孰先）；Ban 借 TC2/XU2 语义钉宣漏洞/宣修复/宣产品缺陷（P3 候选仅 TC2 一条·翻面权归协调方）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零供应商 Key 加载零生产操作零 secrets 零消耗（EXEC 期全臂隔离 PG+本地真 HTTP+测试钥背签·零 MODEL_API_KEY 零外呼·RL env 覆写仅测试进程窗·§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）五类标记词 + conflict-marker grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径·不复抄卷内防自匹配——沿 clock/X16 §7 同形制）。

## §8 STOP · **`draft:awaiting_pre_exec_dual`**（起草落卷即停 · 前值无 · 后继=pre-exec 双审两独立外席待派 · alone≠dual · Ban self-approve）

**开工三条款（EXEC 立项前提）**：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 修法面与 §5 Ban/pins 与 §1.3 否决面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（`:128` ADV 列值被他刀改写 · 姊妹三收据被改写 · 缝 A nowSec 注入形/`:95` exp 判定/`:98-99` jti 查/`:56-66` revokeSession/`:78` jti 单谓词/`:147-:154` 改密竞态注释与单语句被改 · 在飞线并线与本卷对同表冲突改行）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期臂收据与 §0.2 对码期望不符（如死 jti 写嘴被放行 · 族改密后任一旧代次令牌仍 200 · RC1 epoch 终值非 +2 或双回签全活/全死 · RC2 集合非 {true,false} 恰各 1 · TC1 ≥2s 后仍 200 · XU1 登出互扰他户 · XU2 principal 窜为 B）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 1 case 四臂族十臂面（需触产品码/静默刷新接线/姊妹收据/covered 翻面/共享 SSOT/迁移/cap 步进 sanction）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2438 / `neg:auth`·`uc030:nhp-bound`·`uc030:nhp-fault` 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-10-28 起草落卷·起草即停 · 残面非空=矩阵 `:128` ADV cell blind 裸值+case-matrix 零 ADV 行 → 1 case 四臂族十臂起草 · 状态翻面权归协调方 · alone≠dual · Ban self-approve · ⛔push ⛔force-push）· 卷 draft ≠ 执行 ≠ covered ≠ 矩阵列升格（coveredCount=8 零动 · EXIT0≠covered · blind 保持+case-only）。

---

*UC-030-ADV REQUEST · 2026-10-28 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行·起草即停·pre-exec 双审待派）· NHP-030-ADV-01 长会话刷新对抗臂（矩阵 `:128` ADV cell=blind 裸值=本卷认领格·case-matrix §1.1 区零 ADV 行=对抗臂全族未证亲证·clock 卷 §1.3「留后刀」veto 的后刀即本卷）· 一 proof 四臂族十臂：RP 族=死 jti 写嘴 sweep/代次族撤销全族（3 会话一改密全灭+行保留）/legacy 代次死面 + RC 族=并发双改密自锁钉（`profile.service:147` 产品自钉「极罕见自锁可接受」首次行使·恰一活一死+epoch+2）/并发双吊销 exactly-once（{true,false} 恰各 1）+ TC 族=传输面实钟 TTL=1 短窗/远期 exp 背签越 TTL 窗诚实钉+P3 疣候选 + XU 族=令牌身份归因+跨户登出零扰/jti-uid 非绑定语义钉（诚实披露）/跨户代次零串扰 · 逐臂对码 `auth.ts:69-76/:95`/`guard:85/:95/:98-99/:100`/`auth-session:19/:43/:56-66/:73-84/:78`/`auth.controller:29-36`/`auth.service:11-26/:108`/`profile.service:16-28/:133/:147/:154/:159-162` · 姊妹收据 neg-auth(90)/fault(49)/bound(48)/X33(61) 逐臂 reason 级可分互不替代 · 静默刷新停止条件登记维持（grep EXIT=2 复证·先接线后 prove）· keyless=隔离 PG+测试钥背签零供应商 Key 零外呼 · est live=0 · cap=2438（`public-text-policy.mjs:238`）· scanned 2433+1=2434 不越限零步进 · pins 十一值零翻 · releaseEvidence=false · ≠HA · ⛔push*
