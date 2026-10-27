# UC50 REQUEST — UC-E2E-050 applications.start 绕行残余刀·登记面行使+「绕行不可达」证明复核（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（三处钉：本 Status 行 + §8 + 卷尾注 · 2026-10-26 起草席落卷 · pre-exec 双审未行使 · EXEC 未授权 · 零收据零升格预支）· **起草期裁决核心（§1.5）**：总盘判「EXEC 小刀（Ban 就地补线·须独立 REQUEST）」经本席亲读核实——**零产品码改动不足以证明绕行残余受控**：绕行在起草 tip 为**结构性可达**（kill=1 下 `POST /applications/:id/start` 全链放行）→「断言绕行不可达」臂预期红=产品机制真相 → 闭合需产品码接线+静态门同刀更新 → **超 docs-only 范围·红停归协调方**（§8 停止条件「越界需要」起草期已核实命中·如实标注·EXEC 不预启动）· 改判二择一选项登记于 §1.5（裁决权归协调方·本卷零预支）。

**席位**：UC-050 applications.start 绕行残余起草席（协调方派·认领=覆盖矩阵 `:132` 聚合行 **UC-050 ADV cell 的 applications.start 绕行残余面**——即 killsw 卷 §0.3「**不认领**：…UC-050 ADV 的 applications.start 绕行修复（NOT claimed 残余·只登记）」显式留面的后继登记/裁决面·本席起草 turn 零臂零断言零产品码触·与 killsw（closed）及各在飞线互斥不重叠）。
**基线**：`origin/main` @ **`c06ed67b5`**（full `c06ed67b5687a1bd52a9477d0124d6f216d8285d` · `git fetch origin` 本 turn 成功 · #172 screg 并线点 · 分支 `line/uc50-draft` 建 worktree `git worktree add ../meetwise-uc50 -b line/uc50-draft origin/main` 亲立 · HEAD 落 tip 亲证）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2433**（stdout「public text policy scanned 2433 managed worktree files」亲读）· cap=**2438**（`public-text-policy.mjs:238` `MAX_FILES = 2_438` 亲证 · §2-1 预算核）· 工作树 `meetwise-uc50`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 行 `:28` · Phase 3 privacy `:32`）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 / §1.0.1 `:132` 聚合行 / §1.0.2 `:154` 分面登记行 / §1.1 `:192` Ban elevate 行 / §1.0.3 双表同步令）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.4 头 `:107` · `NHP-050-KILL-01` `:126` · `NHP-051-NOPII-01` `:127` · 擦除域占名 `:119-123` 只读）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-050 `:568-575`）→ 先例卷 `ai-docs/delivery/harness/killsw-REQUEST.md`（NOT claimed 登记源·§1.1 边界读 `:85` · §1.3-⑤ `:102` · §3-1 `:141`）→ 涉事机制源 `apps/api/src/platform/content-safety.ts` / `apps/api/src/modules/interview/interview.service.ts` / `apps/api/src/modules/jobs/applications.service.ts` / `apps/api/src/modules/jobs/applications.controller.ts` / `scripts/i6-239-gates.proof.mjs` → 收据先例 `apps/api/test/uc-e2e-050-nhp-kill.proof.ts` + `apps/api/test/_neg-harness.ts`（零触只读）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证·killsw 同源）；②矩阵 `:132` 聚合行 Aggregate cell 亲读逐字「**applications.start 绕行残余 NOT claimed**（applications.service.ts:44-58 只登记零臂）」（killsw EXEC 落卷显式留）+ case-matrix `:126` 同注「Ban 就地补线」；③killsw 卷 §1.1 边界读「修复=产品码触·出域归产品刀」+ §1.3-⑤「Ban 触 applications.start 绕行面产品修复」+ §3-1「含 applications.start 绕行面修复（产品码·出域）」——三处显式留=本刀独立 REQUEST 的直接出处；④协调方派单（本席·总盘判 EXEC 小刀形）。

---

## 残余盘点（认领核对·`:132` 聚合行 UC-050 面·killsw NOT claimed 显式留逐字承登）

**已认领排除面**：killsw 卷（closed·`line/killsw-draft` 并线在主线）=矩阵 `:132` 050/051 NEG/FAULT/BOUND 可测面+§1.0.2 `:154` 分面登记行+case-matrix `:126/:127` 两行（NOT claimed 注记即其显式留）；UC-052 deletion/export/DELETE 面=`:192` Ban elevate 域（freeze·零触）；UC-018 图 abandon 面（先例 `49a33634` 零触只读）；case-matrix `:119-123` `NHP-050-FAULT-01..05` 擦除域全族（UC-052 域·零触）。

| 认领 cell / 落点 | 现值（亲读逐字） | 本刀可测面定标 |
|---|---|---|
| UC-050 · ADV（矩阵 `:132` 第 4 列） | **blind**（全行 050/051 面 killsw 后仍 blind·ADV 格零 case 零措辞动） | applications.start 绕行残余面=killsw 显式留 NOT claimed 的唯一 UC-050 残格 → 本刀认领=**登记面行使+刀型裁决核实**（起草 turn 零臂零断言；EXEC 面形状经 §1.5 核实为「超 docs-only 范围·红停归协调方」·改判前零 EXEC） |
| killsw 卷显式留（三处） | §1.1 `:85`「零臂零断言零修复（修复=产品码触·出域归产品刀·Ban 借本卷 wash 或宣称『全入口已闸』）」· §1.3-⑤ `:102`「Ban 触 applications.start 绕行面产品修复：绕行残余=登记面…Ban 就地补线」· §3-1 `:141`「含 applications.start 绕行面修复（产品码·出域）」 | 本刀=该显式留的后继独立 REQUEST（协调方令「须独立 REQUEST」兑现）· **承守同一 Ban：就地补线零触** |
| 矩阵 `:132` Aggregate cell 注记 | 「**applications.start 绕行残余 NOT claimed**（applications.service.ts:44-58 只登记零臂）· 图面归 UC-018 先例互不替代」 | 本刀 EXEC 面（若协调方改判准 (b) 诚实证据刀）届时行内改：ADV 格 blind→case-only 措辞+`NHP-050-START-BYPASS-01` 收据注·gap 保持·**Ban 升 covered/partial** |
| case-matrix §1.4 新行落点 | §1.4 头 `:107` · `:126` KILL · `:127` NOPII · **`:128` 空（NOPII 行后）** | 若改判 (b)：新行 `NHP-050-START-BYPASS-01` 落 `:128`（语义命名避让：`:119-123` `NHP-050-FAULT-01..05` 擦除域占名+`:126` KILL 已占）· §1.0.3 双表同步令承守 |
| backlog 登记 | `gap-bug-backlog.md` 全卷 rg「applications.start/绕行」**零命中**（本 turn 亲证） | 绕行残余的 backlog 登记权归协调方（killsw §3-5 承守）· 本卷仅卷内登记·零直书 backlog |

**结论**：残余面**有缝可测**（绕行结构在树·机制链五点亲证见 §1.4）→ 但「缝的闭合」需产品码（§1.5 裁决）→ 本刀起草 turn 交付=登记+裁决卷（本 .md 恰 1 件）；停止条件「码面无可测注入缝」**未触发**——触发的是「闭合超 docs-only 范围」。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse/rg 亲算 @`c06ed67b5`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **39 树**实测——`line/uc50-draft` 恰 1 命中=本席；全本地 refs `git ls-tree` 逐支扫 `harness/uc50*` **零命中** → 落卷后唯一同名卷=本卷；`git log --all --diff-filter=A -- '*uc50*'` 零命中（史录亦零撞名）。
- **在飞线逐树亲读**（活跃 `line/*` 最近提交 2026-10-23～10-28 逐支 `git diff --name-only origin/main...<branch>` 对本刀触面）：
  - `line/loadw-exec` @`62f75399d`——触 case-matrix **`:89` 邻区**（`NHP-015-LOAD-w-01` 行内 EXEC 红停登记·§1.3 区）+ 零他文件——与本刀 §1.4 新行落点 `:128` **同文件邻区异行=并入届时 merge-tree 预演如实登记不停**（killsw §0.0 共享面判级承形）。
  - `line/x17-adv-draft` @`11588183e` / `line/xrep-draft` @`dab570973` / `line/perf2-draft` @`f39fb1a45`——各触**恰各自 REQUEST/harness 卷**（逐支 diff 亲证）·与本刀零字面交叠。
  - `line/uc30-draft` @`c06ed67b5`（与本刀同 tip·**零 commit**）/ `line/scoring-eval-exec` @`bed656e9` / `line/inject-draft` @`d1a947e3d` / `line/pay-neg-draft` @`5f9efa51d` / `line/backlog-reg-draft`（对 origin/main **零 diff**）——对矩阵/case-matrix/涉事机制源/本卷名**零交叠亲证**。
  - 其余大 ahead 陈旧支（`5c/5e` 族等 ahead>500）系史前基线遗留非在飞 EXEC 线——EXEC 立项日按届时树对触面逐支复核（复核规则承 killsw §0.0：本刀起草 turn 产品触面=0（docs-only 恰 1 新 .md）·EXEC 期触面=本卷 .md+（若改判 (b)）双表行内改+proof+注册行+runner 注册位+收据面·届时任一在飞支顶对独占触面新增=漂移停·共享面按行级冲突判）。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex·行数亲点）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `apps/api/src/modules/jobs/applications.service.ts` | `e1bf8ff0`（121） | **`:44-58` `start()` 逐行现形（§1.1 逐行亲读）**：`:45` preview 写门（非 kill 闸）· `:46` `requireOwnerUserId(principal, 'applications.start')` · `:53-54` asPrincipal+`startApplicationInterview` CAS · `:55` status 收窄 · `:56-63` try/catch（`:57` **`beginInterviewCore` 直调零 kill 闸**·`:59-61` catch 仅 `enterprise_insufficient_balance`→402 映射）· `:64` return——**全函数零 `denyContentSafetyKilled` 零 env 读**（blob 与 killsw 基线锚恰等=killsw EXEC 前后零漂·残余面原样在树亲证） |
| `apps/api/src/modules/jobs/applications.controller.ts` | `e12e76fd`（39） | 调用面：`:11` `@Controller('applications')` · `:12` `@UseGuards(PrincipalGuard)`（仅鉴权）· **`:21-26` `@Post(':id/start')` `@HttpCode(OK)` → `applications.start(req.principal, id, b, req.reqId)`**——controller 零 kill 闸零 kill 中间件 |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918） | `:17-21` 闸 import（`:17` D6 #239-① 注释「begin/turn 双口」自钉）· **`:95-96` `beginInterviewCore` 头注自钉「begin 端点（C 端练习·原路径）与 applications.start 合一事务（S2-C4 修法⑤）共用本函数」=同核双生产者** · `:102` core 导出 · **core 体内守卫链零 kill 闸**（`:122` advisory lock→`:123` FOR UPDATE→`:125` privacy→`:128-129` terminal→quiz 三刀→扣额路由→入队）· **`:335-348` `denyContentSafetyKilled`（`:341` 503+诚实文案）· `:425` begin 口 / `:436` turn 口——全树 `this.denyContentSafetyKilled();` 调用恰 2 处**（rg 亲证·各先于 `:426`/`:437` preview 写门） |
| `apps/api/src/platform/content-safety.ts` | `50f8c9c3`（43） | **`:4-6` D6 契约文注「One env switch stops … **at the api begin/turn entries**」——NOT claimed 显式留的产品契约自钉语义（§1.3）**· `:15-21` 三态 fail-closed（unset/`0`=off·`1`=engaged·余者 throw）· `:27-33` 专名错误类 · `:39-43` assert 闸 · `:16`/`:40` `process.env.MEETWISE_CONTENT_SAFETY_KILL_SWITCH` default-param 直读（产品词面全树恰此 2 处·rg 亲证） |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4`（201） | **`:53` `A('① begin/turn 双口恰 2 处闸调用', callSites === 2, …)`——静态门硬钉恰 2**：闸第三接线（applications.start 补线）必踩此门红 → 产品修复须同刀更新本门（§1.5 裁决依据之五）· `:152-163` markers 词面运行时组装（§2-2/§7 口径）· 注册=root `package.json:746` `i6-gates:prove` |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `54cede58`（522） | **§1.0.1 `:132` 聚合行（ADV 格=blind · Aggregate cell「applications.start 绕行残余 NOT claimed（applications.service.ts:44-58 只登记零臂）」亲读逐字）**· §1.0.2 `:154` 分面登记行（050/051 三值 blind）· §1.1 `:192`（「Ban elevate UC-050/051/export」·killsw 9p.3 勘正后行号 `:192` 亲证） |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `24803ac5`（213） | §1.4 头 `:107` · **`:126` `NHP-050-KILL-01`（行内 NOT claimed+「Ban 就地补线」亲读）· `:127` `NHP-051-NOPII-01` · 新行落点 `:128`** · `:119-123` 擦除域占名（零触） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | UC-050 `:568-575`（TC-E2E-050-kill `:575`） |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `a7d8959a`（54） | Phase 2 #12 `:28` · Phase 3 privacy `:32`（DELETE=503 freeze） |
| `scripts/ai-docs/public-text-policy.mjs` | `272cd606`（536） | `:238` `MAX_FILES = 2_438`（cap 亲证 · §2-1 预算核） |
| `ai-docs/delivery/harness/killsw-REQUEST.md` | `3b0841a5`（238） | §1.1 `:85` 边界读 · §1.3-⑤ `:102` · §3-1 `:141`（三处显式留源·closed 史录零洗零触） |
| `apps/api/test/uc-e2e-050-nhp-kill.proof.ts` | `641000dd`（599） | 收据先例（killsw Case 1·59 断言 EXIT=0 落卷）·零触只读 |
| `apps/api/test/_neg-harness.ts` | `9768b323`（330） | `:61-62` `delete process.env.MODEL_API_KEY/MODEL_BASE_URL` 自剥（keyless §1.6 依据） |

### 0.2 机制补充锚（rg 亲证）

- `MEETWISE_CONTENT_SAFETY_KILL_SWITCH` **不在 env-schema 注册**（`apps/api/src/platform/env-schema.ts` rg 零命中·本 turn 复证）——设计内：env 直读闸三态自校（`content-safety.ts:11-13` 注释·非法值 throw 不静默回退）。
- `denyContentSafetyKilled`/`assertContentSafetyKillSwitchOff` 调用面全树 rg（apps/api/src+packages·非 spec）：**恰 `interview.service.ts:337`（闸定义内 assert）+`:425`/`:436`（双口接线）**=产品闸面全图亲证·applications.service.ts/controller 零命中 → 绕行可达的结构性铁证。
- `beginInterviewCore` 调用面：`interview.service.ts:431`（begin 口·闸后）+ `applications.service.ts:57`（start 合一事务·**零闸前置**）=同核双生产者·恰一者未接线。

### 0.3 认领登记（逐 cell 定标汇总）

认领=矩阵 `:132` **UC-050 ADV cell 的 applications.start 绕行残余面**——本刀起草 turn 交付=登记+裁决卷（本 .md）；EXEC 面两形（产品接线刀/诚实证据刀）**均待协调方改判派单·本卷零预支**；**不认领**：产品码接线面（§1.5 裁决·超 docs-only）、UC-052 擦除/导出域、UC-018 图面、backlog 直书（翻面权归协调方）。

---

## §1 交付面（红事实·机制链全部亲证 @`c06ed67b5`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 applications.service.ts:44-58 逐行现形（产品面侦察·逐行亲读）

- `:44` `async start(principal, appId, dto: StartApplicationDto, requestId?)`——候选人 C 端申请开面入口。
- `:45` `this.denyPublicPreviewWrite();`——**public-preview 写门（非 kill 闸）**。
- `:46` `requireOwnerUserId(principal, 'applications.start')`——PRIV01-C 第二层 E1 授权根。
- `:47-52` 注释自钉 S2-C4 修法⑤：start+begin 服务端动作合一（同 asPrincipal 事务·企业预留与状态迁移原子提交·`#227` 缺陷收口）——**合一事务正是绕行的成因面**：begin 语义被内联后不再经过 begin 端点。
- `:53-54` `asPrincipal` 事务内 `startApplicationInterview(c, owner, appId, dto.resumeId)`（DB CAS 建绑）。
- `:55` status 收窄（非 started/reused 即短路返回）。
- `:56-63` `try { await beginInterviewCore(c, owner, started.interviewId, dto.resumeId, requestId) }`（**`:57` 直调核·零 kill 闸**）`catch`（`:59-61` 仅 `enterprise_insufficient_balance`→402 `application_enterprise_pay_unavailable` 映射·余者原样重抛）。
- `:64` `return started`。
- **env 开关名**：`MEETWISE_CONTENT_SAFETY_KILL_SWITCH`——`start()` 全函数（`:44-94`）零读该 env 零调闸（rg 亲证·0.2）。
- **「只登记零臂」语义**：killsw 卷对本面**零臂零断言零修复**·仅在卷内三处显式留注（§0.1 killsw 行）——「登记」=残余被命名并钉位（矩阵+case-matrix+killsw 卷）·「零臂」=无任何行使/断言/修复·「NOT claimed」=killsw 明示不认领不修复·留待独立刀。

### 1.2 调用面（controller/route 亲读）

`POST /applications/:id/start`（`applications.controller.ts:21-26`·`@HttpCode(OK)`·`ZodValidationPipe(StartApplicationDto)`·`reqId` 透传）→ `ApplicationsService.start()`。链上仅 `PrincipalGuard`（`:12`·鉴权）——**controller→service 全链零 kill 闸零 kill 中间件零拦截器**（rg 全树亲证·0.2）。

### 1.3 「NOT claimed 显式留」的语义（三源互证）

1. **产品契约自钉**：`content-safety.ts:4-6` D6 minimum set 契约文注「One env switch stops model-driven interview question generation / conversation **at the api begin/turn entries**」——开关产品文面自钉边界=begin/turn 双口；`interview.service.ts:17` 注释同钉「begin/turn 双口」。⇒ applications.start 未接线是**文档面显式钉出的已知边界**（登记面）·非未察觉缺陷。
2. **静态门自认**：`i6-239-gates.proof.mjs:53` 把「双口恰 2 处闸调用」钉为合规断言（`callSites === 2`）——产品+门面双料自认最小集边界。
3. **killsw 卷显式留**：§1.1/§1.3-⑤/§3-1 三处 + 矩阵 `:132` + case-matrix `:126` 五处留注（§0.1/§残余盘点 亲读逐字）——残余被诚实登记且被 Ban「就地补线」·须独立 REQUEST（本卷即其兑现）。

### 1.4 绕行可达证据链（五点·全部亲证）

1. 闸调用面全树**恰 2 处**（`interview.service.ts:425`/`:436`·rg+静态门 `:53` 双证）。
2. `beginInterviewCore`（`:102-`）体内守卫链**零 kill 检查**（advisory→FOR UPDATE→privacy→terminal→quiz 三刀→扣额路由→入队·逐段亲读）。
3. `applications.service.start()`（`:44-58`）零闸触点·直调核（`:57`）。
4. controller（`:21-26`）零闸零中间件（§1.2）。
5. 同核对照面：begin 口同核在闸后（`:425`→`:431`）——**同核双生产者·恰一者未接线**（`:95-96` 头注自钉）。
⇒ **kill=1 下 `POST /applications/:id/start` 结构性放行**：CAS+预留+入队全链零 kill 检查=绕行可达为产品现状事实（非 harness 推定·码面铁证）。

### 1.5 刀型裁决（起草席核实·本卷核心交付）

- **总盘判**：EXEC 小刀（Ban 就地补线·须独立 REQUEST）——不修改产品码·以 proof 行使登记面+断言绕行不可达（或可达则如实红停）。
- **起草席核实结论：零产品码改动不足以证明绕行残余受控。** §1.4 五点铁证 ⇒ 绕行**结构性可达**；「断言绕行不可达」臂按届时推定形**预期红**——红=产品机制真相（非 harness 红·非夹具红）·命中 killsw 承守的「机制不满足」停止条件形态。
- **闭合面清单（=产品码触·超 docs-only 范围）**：接线二择一（`applications.service.start()` 补 `denyContentSafetyKilled()`（映射 503）或 `beginInterviewCore` 核内接线（双口变双闸冗余·语义面归产品刀裁量））**+ 同刀同步 `i6-239-gates.proof.mjs:53` `callSites === 2` 钉值与断言措辞**（静态门必踩红·Ban 只改产品码不改门=门红不可收）+ 双表行内勘正（矩阵 `:132` NOT claimed 注记+case-matrix `:126` 注记·killsw 卷史录不洗）⇒ **超 docs-only 范围·红停归协调方**（§8 停止条件「越界需要」起草期已核实命中·如实标注·EXEC 不预启动·Ban 就地扩面）。
- **协调方改判二择一选项（登记不预支）**：
  - **(a) 产品接线刀**：闭合绕行（§上行清单整包·产品码+静态门+双表同刀）·另卷派单·本卷零触。
  - **(b) 诚实证据刀（零产品码可绿·但断言极性与总盘判相反·须协调方明示改判）**：行使 kill=1 applications.start **如实钉「现状放行形状」为 case 证据**——臂形（届时重 pin）：B1=kill=1 子进程 spawn 下 start → **非 503 放行形状如实断言**（具名响应形状+interview 行增+预留/入队净账如实·对照臂 kill=1 begin → 503 具名码=同 env 双口差分·reason 级可分）·B2=off 现状字节对照·B3=净账审计；新行 `NHP-050-START-BYPASS-01` 落 case-matrix `:128`+矩阵 `:132` ADV 格 blind→case-only 措辞（gap 保持·**Ban 宣称受控/Ban 升 covered/partial**·`coveredCount=8` 零动）——此形证明的是「**残余在**」而非「残余受控」·与总盘判「断言绕行不可达」极性相反。
- **若协调方维持原判强制按「不可达断言」EXEC**：预期红收据如实落卷（红=机制真相）→ 命中停止条件「机制不满足」→ 红停上报·**Ban retry-to-green·Ban 凑绿·Ban 改断言极性凑绿**。

### 1.6 keyless 判定核（env 闸子进程 spawn 面零外呼亲证）

- **起草 turn**：est live=**0**——本 turn 零实跑零模型外呼零 Key 加载（git/Read/rg/docs:check 全本地）。
- **EXEC 面（若改判 (b)）**：沿 uc050 收据先例形（`641000dd` 零触承形）——隔离 PG+`127.0.0.1` 本地 HTTP（uc050 proof `:111`/`:114` 本地 base 亲证）+子进程 spawn env 变体（`:462` spawn·`:507` 假 `DATABASE_URL`（db.invalid）·503/对照路径零 DB 依赖论证先形）+三键词面**运行时组装零直书**（`:84-85` fragment join 形）+`_neg-harness` 自剥（`_neg-harness.ts:61-62` delete `MODEL_API_KEY`/`MODEL_BASE_URL`·egress inventory 已登记）。
- **行使面外呼定性**：applications.start 绕行臂行使链=DB CAS+预留+入队（**全 PG 面**·api 进程零模型调用·隔离壳 worker 不在场零消费·零 Langfuse/零 OSS/零供应商网络触）→ **keyless 判定成立：零外呼·零模型/供应商触·「触外呼即红停」条款未触发**。

---

## §2 验收门矩阵（pre-exec 双审核对单基面·起草门 3 门本 commit 适用+EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（含 PTP cap 预算核·亲算）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·本树起草前亲跑 **EXIT=0 · scanned 2433**（stdout 亲读）· cap=**2438**（`public-text-policy.mjs:238` 亲证）· 本卷新文件 +1 → 预期 **2434 ≤ 2438 = 不越限·无需步进·无越限臂联动**。EXEC 面（若改判 (b)）届时 **+3～+4 tracked 文件**（本卷 .md+proof+注册行+收据若落 text-extension）→ EXEC 日按届时 scanned 基数重算余量如实·**越限沿常设预授权恰等步进**（`public-text-policy.proof.mjs` 越限臂 fabricated 数随 cap 联动·cap 上抬权归协调方·Ban 就地改 cap）·越限且无预授权即「验收红不可修」停手上报。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词+行首冲突标记 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:152-163`·不复抄卷内防自指——本卷文面零直书该五词面）· 起草席亲跑·回执 §7 · est live=0（§1.6/§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 .md（多任何 tracked 路径即停）·`apps/*/src`/`packages/*/src` 零 diff 亲证。EXEC 期 diff 面（若改判）=届时逐件登记（本卷+双表行内改+proof+注册行+runner 注册位+egress 预置条款行使面+收据面）·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin·仅当协调方明示改判授权后适用）**：隔离 prove EXIT=0 **双 fresh**（implementer+独立复验·attempts 台账含红次如实）·邻面不回退（`uc050:nhp-kill:prove` 59 断言/`i6-gates:prove`/`neg:all` 按届时 SSOT 口径恒等——**B1 放行形状断言与 uc050 K1/K2 503 断言并存=绕行面差分自证·互不替代互不 wash**）·双表同步 diff 逐件登记（§1.0.3 令）·pre-exec 双审两独立外席 BOTH PASS 落卷（alone≠dual）·任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:132` UC-050 ADV 格仅允许 blind→case-only 措辞（若改判 (b)·gap/blind 保持）· `:192`「Ban elevate UC-050/051/export」逐字维持 · DELETE=503 零动 · **coveredCount=8 零翻转** · Ban 借 uc050/uc051 收据宣本面已覆盖·Ban 借本卷收据宣「kill-switch 全入口已闸」。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff——**含 applications.start 绕行面接线（§1.5 裁决·超 docs-only·红停归协调方）与 env-schema 注册补录**；`scripts/i6-239-gates.proof.mjs` 零触（静态门钉值更新归产品刀同刀·本卷零触）。
2. **UC-052 擦除/导出域零触**：case-matrix `:119-123` NHP-050-FAULT 全族、`privacy-erasure-http.proof.ts`、DELETE=503、export 面（Phase 3 freeze `queue:32`）——只读。
3. **UC-018 图面零触**：`:575` TC 需求面的图终态语义归 `49a33634` 先例——只读旁证·收据互不借用。
4. **killsw 卷史录零触**：`harness/killsw-REQUEST.md` closed 史录零洗零改（NOT claimed 注记的勘正权归协调方/后继产品刀双表同步面）。
5. **其余 §1.0 行零触**：盘点表排除面全部只读（在飞支触面清单见 §0.0·行号 EXEC 日重 pin）。
6. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方（**绕行残余的 backlog 直书零触**·killsw §3-5 承守）。
7. **covered/queue 翻面零预支** · **零迁移零配置**：Ban 新迁移 Ban 触告警/CI 配置；`MEETWISE_CONTENT_SAFETY_KILL_SWITCH` 仅测试进程 env 窗（spawn env 变体）·零配置文件改·零 `.env*` 落树落据。

## §4 依赖

**①上游已满足**：kill 闸机制全在树（§0.1 blob 亲算 13 件）+ uc050 收据先例（`641000dd`·spawn env 变体/假 DB 论证/净账审计技法全承形）+ 三层隔离壳+`_neg-harness` 自剥先例。**②同文件并发**：起草 turn 恰 1 新 .md 零交涉面；EXEC 期（若改判 (b)）触矩阵 `:132`/case-matrix `:128` 落点——§0.0 在飞交叠复核必做（loadw-exec 触 `:89` 邻区在飞·行号届时重 pin）。**③下游**：本卷裁决供协调方对 (a)/(b)/维持原判三向裁量；(a) 产品接线刀整包清单已列（§1.5·含静态门同步面——防「只改产品码踩静态门红」的二次返工）；(b) 收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§1.5 红预期承守·红=机制真相时 Ban 凑绿 Ban 改断言极性凑绿）；Ban invent covered（升格 partial/covered·借 uc050/uc051 收据 wash·借本卷宣「全入口已闸」）；Ban live key（零 `MODEL_API_KEY` 加载/伪造·零 live 外呼·est live=0·三键词面码面零直书·`env -u`/`_neg-harness` 剥除·否则 `environment_reference_unregistered` 红停）；Ban 触产品码/静态门/迁移/CI 告警配置（§3-1·**含绕行面就地补线——killsw §1.3-⑤ 逐字承守**）；Ban 触 UC-052 擦除导出域与 UC-018 图面与 killsw 卷史录与其余 §1.0 行（§3-2/3/3-4）；Ban 改共享 SSOT/backlog 直书（§3-6）；Ban 触既有 proof 文件（uc050/uc051/obs-logging/privacy-erasure-http 零触只读引用）；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·新增豁免先回炉修订本卷）；Ban 就地归因门矩阵外新红（新红如实登记升级·Ban 借机修）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 `.env*`/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（EXEC 期若改判 (b)：全离线隔离 PG·spawn env 变体零外呼·`_neg-harness` 自剥·§1.6 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词+行首冲突标记 grep 零命中**（起草席亲跑·回执随 commit 信息留痕·词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:152-163`·不复抄卷内防自匹配——沿 killsw §7 同形制）· **如实登记**：全量 `i6-gates:prove` 系 i6 刀**自持申报清单门**（申报清单臂对外来改动集按设计红——本卷非 i6 刀触面·该臂红=预期形非本刀门·markers ⑦臂对词面修正后 PASS 亲证）；**勘误留痕（史录不洗）**：起草首版本卷 §2-2 曾直书五类标记词词面致 ⑦臂红·同 turn 自纠（删词面直书·改口径引用）·零 commit 前留痕零凑绿。

## §8 STOP（开工三条款 + 停止条件四类·三处钉之二）

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：Status 行+本节+卷尾注 · 2026-10-26 起草落卷 · pre-exec 双审未行使 · EXEC 未授权）· 开工三条款（若协调方改判准 EXEC 后适用）：①pre-exec 双审两独立外席 BOTH PASS 落卷；②协调方明示 EXEC 授权（含 §1.5 断言极性改判明示——「不可达断言」与「现状放行形状证据」二择一·逐字随令）；③EXEC 立项不得改 §1.5 裁决面与 §5 Ban/pins 与 §3 范围外（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（`applications.service.ts` blob 离 `e1bf8ff0`=绕行面被改·闸调用面数变·`i6-239-gates.proof.mjs:53` 钉值被他刀改·`:132`/`:126` NOT claimed 注记被改写·loadw-exec 等在飞卷并线与本刀对同表冲突改行）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §1 红事实推定形不符（按总盘判原形：kill=1 applications.start **竟得 503**=闸已在位·残余已闭合→改判 (a) 面前提翻转·如实登记上报；按 (b) 形：放行形状断言红=机制面漂移）→ 根因诊断被证伪 → 停·如实登记上报（翻面权归协调方）·Ban retry-to-green。
- **越界需要**：修法诉求超出 docs-only 面（**接线产品码/静态门 `callSites` 钉值/backlog 直书/covered 翻面/共享 SSOT**）→ 停·**起草期已核实命中一次（§1.5·闭合需产品码）·本卷如实标注「超 docs-only 范围·红停归协调方」·EXEC 不预启动**·EXEC 期再命中同款即停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 越届时 cap / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*UC50 REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行·起草落卷即停·pre-exec 双审与 EXEC 授权与断言极性改判均待协调方）· UC-E2E-050 applications.start 绕行残余面（killsw 卷 NOT claimed 显式留的后继独立 REQUEST）· 覆盖矩阵 §1.0.1 `:132` 聚合行 UC-050 ADV 格（blind）+ case-matrix §1.4 `:128` 预留落点 · 基线 `origin/main` `c06ed67b5` · 分支 `line/uc50-draft` · 工作树 `meetwise-uc50` · 产品面现形=`:44-58` 零 kill 闸直调核（`:57`）+controller `:21-26` 零闸+闸调用面全树恰 2（`:425`/`:436`）+core 体内零闸+静态门 `:53` `callSites === 2` 硬钉 · **刀型裁决=零产品码不足以证明残余受控·绕行结构性可达·闭合需产品码接线+静态门同步·超 docs-only 范围·红停归协调方**（改判二择一 (a) 产品接线刀/(b) 诚实证据刀登记于 §1.5·零预支）· keyless 判定=成立（spawn 面 PG/127.0.0.1/假 DB/三键自剥·零模型零供应商）· cap 2433+1=2434 ≤ 2438 零步进 · docs:check EXIT=0 亲跑 · markers=0 · est live=0 · pins 十一值零翻 · coveredCount=8 不变 · ⛔push ⛔force-push*
