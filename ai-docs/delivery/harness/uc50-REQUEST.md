# UC50 REQUEST — UC-E2E-050 applications.start 绕行残余刀·登记面行使+「现状可达且受控登记」取证（docs-only REQUEST 卷·rev r1 裁决改判修订落卷即停）

**Status**: **`closed`**（三处钉：本 Status 行 + §8 + 卷尾注 · 2026-10-26 起草席落卷 · 同日 rev r1 裁决改判修订落卷 · 2026-10-28 **EXEC 立项+落码行使落卷**（pre-exec 双审 dual r1 双 PASS 放行·协调方授权落码+行使·dual r1 P2 修订八件随立项日履行承登 §1.5/§1.6/§0）· **三证据臂全绿兑现**（主证 `pnpm uc050:nhp-start-bypass:prove` EXIT=0 · 46 断言双 fresh · 门矩阵亲跑留痕 `receipts/nhp-050-start-bypass/`）· **2026-10-28 post-prove dual 两独立外席双 PASS 会签→收官翻面 `closed`**（原值 `executed:awaiting_post_prove_dual` 史录不洗·post dual P2 勘误七件随收官落卷承登 §2/§9·证面冻结零触·EXIT0=case≠covered 语义恒持·Ban 借本收据宣 covered/产品正确/全入口已闸 承守））。

**席位**：UC-050 applications.start 绕行残余起草席（协调方派·认领=覆盖矩阵 `:132` 聚合行 **UC-050 ADV cell 的 applications.start 绕行残余面**——即 killsw 卷 §0.3「**不认领**：…UC-050 ADV 的 applications.start 绕行修复（NOT claimed 残余·只登记）」显式留面的后继登记/裁决面·本席起草 turn 零臂零断言零产品码触·与 killsw（closed）及各在飞线互斥不重叠）。
**基线**：`origin/main` @ **`c06ed67b5`**（full `c06ed67b5687a1bd52a9477d0124d6f216d8285d` · `git fetch origin` 本 turn 成功 · #172 screg 并线点 · 分支 `line/uc50-draft` 建 worktree `git worktree add ../meetwise-uc50 -b line/uc50-draft origin/main` 亲立 · HEAD 落 tip 亲证）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2433**（stdout「public text policy scanned 2433 managed worktree files」亲读）· cap=**2438**（`public-text-policy.mjs:238` `MAX_FILES = 2_438` 亲证 · §2-1 预算核）· 工作树 `meetwise-uc50`（仓根同级）。
**EXEC 立项日基线（2026-10-28 重 pin·§8 三条款③履行）**：`git fetch origin` EXIT=0·届值 `origin/main` @ **`c8f8effff`**（#175 x17-adv 收官并线·含 #174 perf2 合卷在前·#173 sse-xrep 与 loadw-exec 等仍在飞未落 main 如实采）→ merge 零冲突兑现（merge-base=`c06ed67b5`=起草基线亲证·两集合零交叠纯 additive·merge tip **`f08e2d8d5`**）→ `pnpm install --frozen-lockfile` EXIT=0 → §0 全量重 pin（blob 漂移两件如实改锚：coverage-matrix `54cede58`→`9f482f71`（行数 522 恒一·`:132`/`:154`/`:192` 行号恒一）·case-matrix `24803ac5`→`150f6f9c`（213→216 行·§1.4 区行锚 +3：§1.4 头 `:107`→`:110`·`:126`→`:129`·`:127`→`:130`·新行落点 `:128`→`:131` 区·`:119-123`→`:122-126`）·public-text-policy.mjs `272cd606`→`bf267242`（536→541 行·MAX_FILES 行 `:238`→`:243`·cap 届值 2_438→**2_439** 届值取大）·**产品源十三锚 blob 全量恒等**（applications.service `e1bf8ff0`/applications.controller `e12e76fd`/interview.service `a8ae0d15`/content-safety `50f8c9c3`/i6 gate `339f92f4`/e2e-scenarios `9976f9c3`/NSQ `a7d8959a`/killsw 卷 `3b0841a5`/uc050 proof `641000dd`/_neg-harness `9768b323` 等=零机制漂移·停止条件「现场漂移」未触发）·合并树 docs:check 亲跑 PTP_FILE_LIMIT:2440>2439 红（本支 REQUEST 受管 1 件并入）→ **cap 沿常设预授权恰等步进 2439→2441**（EXEC terminal=合并树 2440+主证 proof 1=2441 恰等零多放·四联动点恰等改·CAP-SANCTION-2441 注记双件承登·真跑收据 .log 非扫描面不计·00-docker-info.log 同形）·EXEC 终验 docs:check **EXIT=0 · scanned 2441=cap 2441 恰等零余量**。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 行 `:28` · Phase 3 privacy `:32`）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 / §1.0.1 `:132` 聚合行 / §1.0.2 `:154` 分面登记行 / §1.1 `:192` Ban elevate 行 / §1.0.3 双表同步令）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.4 头 `:107` · `NHP-050-KILL-01` `:126` · `NHP-051-NOPII-01` `:127` · 擦除域占名 `:119-123` 只读）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-050 `:568-575`）→ 先例卷 `ai-docs/delivery/harness/killsw-REQUEST.md`（NOT claimed 登记源·§1.1 边界读 `:85` · §1.3-⑤ `:102` · §3-1 `:141`）→ 涉事机制源 `apps/api/src/platform/content-safety.ts` / `apps/api/src/modules/interview/interview.service.ts` / `apps/api/src/modules/jobs/applications.service.ts` / `apps/api/src/modules/jobs/applications.controller.ts` / `scripts/i6-239-gates.proof.mjs` → 收据先例 `apps/api/test/uc-e2e-050-nhp-kill.proof.ts` + `apps/api/test/_neg-harness.ts`（零触只读）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证·killsw 同源）；②矩阵 `:132` 聚合行 Aggregate cell 亲读逐字「**applications.start 绕行残余 NOT claimed**（applications.service.ts:44-58 只登记零臂）」（killsw EXEC 落卷显式留）+ case-matrix `:126` 同注「Ban 就地补线」；③killsw 卷 §1.1 边界读「修复=产品码触·出域归产品刀」+ §1.3-⑤「Ban 触 applications.start 绕行面产品修复」+ §3-1「含 applications.start 绕行面修复（产品码·出域）」——三处显式留=本刀独立 REQUEST 的直接出处；④协调方派单（本席·总盘判 EXEC 小刀形）。

---

## 残余盘点（认领核对·`:132` 聚合行 UC-050 面·killsw NOT claimed 显式留逐字承登）

**已认领排除面**：killsw 卷（closed·`line/killsw-draft` 并线在主线）=矩阵 `:132` 050/051 NEG/FAULT/BOUND 可测面+§1.0.2 `:154` 分面登记行+case-matrix `:126/:127` 两行（NOT claimed 注记即其显式留）；UC-052 deletion/export/DELETE 面=`:192` Ban elevate 域（freeze·零触）；UC-018 图 abandon 面（先例 `49a33634` 零触只读）；case-matrix `:119-123` `NHP-050-FAULT-01..05` 擦除域全族（UC-052 域·零触）。

| 认领 cell / 落点 | 现值（亲读逐字） | 本刀可测面定标 |
|---|---|---|
| UC-050 · ADV（矩阵 `:132` 第 4 列） | **blind**（全行 050/051 面 killsw 后仍 blind·ADV 格零 case 零措辞动） | applications.start 绕行残余面=killsw 显式留 NOT claimed 的唯一 UC-050 残格 → 本刀认领=**登记面行使+现状取证**（起草 turn 零臂零断言；裁决 (b) 已下·EXEC 面形状=§1.5 rev r1 三证据臂·仍待 pre-exec 双审+明示 EXEC 授权·改判前零 EXEC） |
| killsw 卷显式留（三处） | §1.1 `:85`「零臂零断言零修复（修复=产品码触·出域归产品刀·Ban 借本卷 wash 或宣称『全入口已闸』）」· §1.3-⑤ `:102`「Ban 触 applications.start 绕行面产品修复：绕行残余=登记面…Ban 就地补线」· §3-1 `:141`「含 applications.start 绕行面修复（产品码·出域）」 | 本刀=该显式留的后继独立 REQUEST（协调方令「须独立 REQUEST」兑现）· **承守同一 Ban：就地补线零触** |
| 矩阵 `:132` Aggregate cell 注记 | 「**applications.start 绕行残余 NOT claimed**（applications.service.ts:44-58 只登记零臂）· 图面归 UC-018 先例互不替代」 | 裁决 (b) 已下：EXEC 届时行内**格值零动**（blind/NOT claimed 注记语义保持）·只加 case-only 收据注记+`NHP-050-START-BYPASS-01` 注（沿 PERF2 收官先例 `93124ba0d` 形）·gap 保持·**Ban 升 covered/partial** · §1.0.3 双表同步令承守 |
| case-matrix §1.4 新行落点 | §1.4 头 `:110`（EXEC 重 pin·起草 `:107`+3 行漂如实承登）· `:129` KILL · `:130` NOPII · **`:131` 区（NOPII 行后·现 `:131`=`NHP-040-BOUND-01` 行随插下移）** | 裁决 (b) 已下：新行 `NHP-050-START-BYPASS-01` 落 **`:131` 区**（`:130` NOPII 行后插入·现 `:131`=`NHP-040-BOUND-01` 行随插下移·届时行号重 pin）· **勘误（史录留痕）**：原卷左格「`:128` 空」系行号实点误记（rev r1 亲证实点=既有 `NHP-040-BOUND-01` 行·落点语义改为插行区）·语义命名避让承旧（`:122-126` `NHP-050-FAULT-01..05` 擦除域占名+`:129` KILL 已占）·沿先例行形（`NHP-050-KILL-01` 行八列形照 §1.4 表头——P2⑥ 勘误：原卷「七列形」误记·§1.4 表头实为八列 `Case ID/派生 UC/列/面/场景/期望/当前旗/既有锚点` 亲点）·**EXEC 落卷兑现：新行已插 `:131` 区（blind→case-only 措辞·行状态不动）** |
| backlog 登记 | `gap-bug-backlog.md` 全卷 rg「applications.start/绕行」**零命中**（本 turn 亲证） | 绕行残余的 backlog 登记权归协调方（killsw §3-5 承守）· 本卷仅卷内登记·零直书 backlog |

**结论**：残余面**有缝可测**（绕行结构在树·机制链五点亲证见 §1.4）→ 「缝的闭合」需产品码（(a) 清单已登记归用户裁决队列·§1.5 rev r1）→ 裁决 (b) 已下：本刀 EXEC 面=现状取证（§1.5 三证据臂·仍待 pre-exec 双审+授权）；停止条件「码面无可测注入缝」**未触发**——起草期触发的是「闭合超 docs-only 范围」（红停已上报·裁决已下·史录留痕）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse/rg 亲算 @`c06ed67b5`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **39 树**实测——`line/uc50-draft` 恰 1 命中=本席；全本地 refs `git ls-tree` 逐支扫 `harness/uc50*` **零命中** → 落卷后唯一同名卷=本卷；`git log --all --diff-filter=A -- '*uc50*'` 零命中（史录亦零撞名）。
- **在飞线逐树亲读**（活跃 `line/*` 最近提交 2026-10-23～10-28 逐支 `git diff --name-only origin/main...<branch>` 对本刀触面）：
  - `line/loadw-exec` @`62f75399d`——触 case-matrix **`:89` 邻区**（`NHP-015-LOAD-w-01` 行内 EXEC 红停登记·§1.3 区）+ 零他文件——与本刀 §1.4 新行落点 `:128` **同文件邻区异行=并入届时 merge-tree 预演如实登记不停**（killsw §0.0 共享面判级承形）。
  - `line/x17-adv-draft` @`11588183e` / `line/xrep-draft` @`dab570973` / `line/perf2-draft` @`f39fb1a45`——各触**恰各自 REQUEST/harness 卷**（逐支 diff 亲证）·与本刀零字面交叠。
  - **EXEC 立项日复核（2026-10-28·P2⑤ 补登）**：x17/perf2 两支已随 **#175/#174 并线落 main**（tip 漂移如实承登——不再是在飞独立线·其 case-matrix/coverage-matrix/runner/policy 触面已成本刀届值基线的组成·merge 零冲突兑现）；**xrep-draft 在飞触面实测 21 件**（`git diff --name-only origin/main...line/xrep-draft` 亲证：xrep-REQUEST+harness uc010 卷+provider-egress-inventory+current-runtime-truth+execution-master-checklist+runner script+policy 两 script+两 package.json+sse-cross-replica proof+收据 log 11 件）·与本刀触面**零字面交叠**（runner/policy 两 script 共享文件=异区 additive·届时并线 merge-tree 预演如实登记不停·loadw-exec 触 case-matrix `:89` 邻区在飞承旧·本刀新行落点 `:131` 区异区零冲突）。
  - `line/uc30-draft` @`c06ed67b5`（与本刀同 tip·**零 commit**）/ `line/scoring-eval-exec` @`bed656e9` / `line/inject-draft` @`d1a947e3d` / `line/pay-neg-draft` @`5f9efa51d` / `line/backlog-reg-draft`（对 origin/main **零 diff**）——对矩阵/case-matrix/涉事机制源/本卷名**零交叠亲证**。
  - 其余大 ahead 陈旧支（`5c/5e` 族等 ahead>500）系史前基线遗留非在飞 EXEC 线——EXEC 立项日按届时树对触面逐支复核（复核规则承 killsw §0.0：本刀起草 turn 产品触面=0（docs-only 恰 1 新 .md）·EXEC 期触面=本卷 .md+（裁决 (b) 已下）双表行内注记+proof+注册行+runner 注册位+收据面·届时任一在飞支顶对独占触面新增=漂移停·共享面按行级冲突判）。

### 0.0.rev-r1 改判修订台账（2026-10-26·修订席落卷·rev 唯一交付=本小节+全卷对裁决的如实改写）

- **红停上报（史录留痕·零洗）**：起草席对总盘判原形「断言绕行不可达」亲读核实为「零产品码改动不足以证明绕行残余受控」（§1.4 五点铁证）→ §8 停止条件「越界需要」命中 → 红停归协调方（原卷 §1.5 登记·改判二择一 (a)/(b) 选项登记不预支）。
- **协调方裁决（2026-10-26）**：采 **(b) 诚实证据刀**——断言极性翻转「断言绕行不可达」→「**断言绕行现状可达且受控登记**」·钉「现状放行形状」为 case 证据（keyless·零产品码·零接线）·**产品接线刀 (a) 清单登记归用户裁决队列（卷内登记·不入本刀）**。
- **修订清单索引（本 rev 恰 1 tracked 文件=本卷 .md）**：①§1.5 臂表重构（三证据臂·断言对象=「现状与登记边界一致」非「产品正确」）②§5 Ban 增「Ban 借本收据宣称产品正确/Ban 借本收据洗 GAP」+case 收据语义=「登记边界如实证据化」非「行为合格证」+(a) 清单队列登记 ③矩阵 `:132`/`:154`+case-matrix `:128` 区落点改注记形（格值零动·沿 PERF2 收官先例）+`:128` 勘误 ④§1.6 keyless 行使面 sharpen（kill=1 env 注入+worker 不在场零消费）⑤本小节。
- **rev 时点零漂亲证（停止条件「现场漂移」未触发）**：§0.1 十三 blob `git rev-parse` 逐件重算 @rev 前端点 `0f4e0744a` **全量恒等**（行数亦恒等）；极性翻转与产品码现形**零冲突**（闸调用面 rg 仍恰 2=`:425`/`:436`·`beginInterviewCore` `:102` 体内零 kill 检查·`start` `:57` 直调零闸·i6 `:53` 钉值仍 `callSites === 2`）。
- **STOP 三处维持 `draft:awaiting_pre_exec_dual`**（Status 行+§8+卷尾注·裁决改判≠EXEC 授权·pre-exec 双审未行使）。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex·行数亲点）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `apps/api/src/modules/jobs/applications.service.ts` | `e1bf8ff0`（121） | **`:44-58` `start()` 逐行现形（§1.1 逐行亲读）**：`:45` preview 写门（非 kill 闸）· `:46` `requireOwnerUserId(principal, 'applications.start')` · `:53-54` asPrincipal+`startApplicationInterview` CAS · `:55` status 收窄 · `:56-63` try/catch（`:57` **`beginInterviewCore` 直调零 kill 闸**·`:59-61` catch 仅 `enterprise_insufficient_balance`→402 映射）· `:64` return——**全函数零 `denyContentSafetyKilled` 零 env 读**（blob 与 killsw 基线锚恰等=killsw EXEC 前后零漂·残余面原样在树亲证） |
| `apps/api/src/modules/jobs/applications.controller.ts` | `e12e76fd`（39） | 调用面：`:11` `@Controller('applications')` · `:12` `@UseGuards(PrincipalGuard)`（仅鉴权）· **`:21-26` `@Post(':id/start')` `@HttpCode(OK)` → `applications.start(req.principal, id, b, req.reqId)`**——controller 零 kill 闸零 kill 中间件 |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918） | `:17-21` 闸 import（`:17` D6 #239-① 注释「begin/turn 双口」自钉）· **`:95-96` `beginInterviewCore` 头注自钉「begin 端点（C 端练习·原路径）与 applications.start 合一事务（S2-C4 修法⑤）共用本函数」=同核双生产者** · `:102` core 导出 · **core 体内守卫链零 kill 闸**（`:122` advisory lock→`:123` FOR UPDATE→`:125` privacy→`:128-129` terminal→quiz 三刀→扣额路由→入队）· **`:335-347` `denyContentSafetyKilled`（`:341` 具名码+诚实文案·`:342` 503 状态字——P2⑦ 勘误：原卷 `:335-348` 行段误记勘正·`:347` 函数收口）· `:425` begin 口 / `:436` turn 口——全树 `this.denyContentSafetyKilled();` 调用恰 2 处**（rg 亲证·各先于 `:426`/`:437` preview 写门） |
| `apps/api/src/platform/content-safety.ts` | `50f8c9c3`（43） | **`:4-6` D6 契约文注「One env switch stops … **at the api begin/turn entries**」——NOT claimed 显式留的产品契约自钉语义（§1.3）**· `:15-21` 三态 fail-closed（unset/`0`=off·`1`=engaged·余者 throw）· `:27-33` 专名错误类 · `:39-43` assert 闸 · `:16`/`:40` `process.env.MEETWISE_CONTENT_SAFETY_KILL_SWITCH` default-param 直读（产品词面全树恰此 2 处·rg 亲证） |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4`（201） | **`:53` `A('① begin/turn 双口恰 2 处闸调用', callSites === 2, …)`——静态门硬钉恰 2**。**P2① 勘误（dual r1 承登）**：`:52` `callSites` 计数域=`svc.split('\n')`=**interview.service.ts 单文件字面**——闸第三接线（applications.start 补线在他文件）**不改 `:52` 计数，「必踩此门红」系假命题**；防呆正形=扩 `:52` 扫描面至全树（或新增 applications.service.ts 接线断言）+同步 `:119` 零触断言与卷尾申报清单豁免实现；**`:53` 单改钉值 2→3 将致门永久红**（计数恒 2）→ (a) 清单 ② 据此勘正（§1.5）。**:152-163** markers 词面运行时组装（§2-2/§7 口径）· 注册=root `package.json` `i6-gates:prove` |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `9f482f71`（522·EXEC 重 pin：起草锚 `54cede58` 恒行数漂 blob=x17 并线注记面） | **§1.0.1 `:132` 聚合行（ADV 格=blind · Aggregate cell「applications.start 绕行残余 NOT claimed（applications.service.ts:44-58 只登记零臂）」亲读逐字）**· §1.0.2 `:154` 分面登记行（050/051 三值 blind）· §1.1 `:192`（「Ban elevate UC-050/051/export」·行号恒一亲证）——**EXEC 落卷：`:132` Aggregate cell+`:154` 尾列各加 case-only 收据注记（格值零动·blind/NOT claimed 语义保持）** |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `150f6f9c`（216→EXEC 落卷后 +1 行；起草锚 `24803ac5`（213）漂 blob=perf2/x17 并线 +3 行·§1.4 区行锚 +3 如实改锚） | §1.4 头 `:110` · **`:129` `NHP-050-KILL-01`（行内 NOT claimed+「Ban 就地补线」亲读）· `:130` `NHP-051-NOPII-01` · 新行落点 `:131` 区**（`:131` 现=`NHP-040-BOUND-01` 行随插下移）· `:122-126` 擦除域占名（零触）——**EXEC 落卷：新行 `NHP-050-START-BYPASS-01` 落 `:131` 区（八列形照 §1.4 表头·插后 `NHP-040-BOUND-01` 下移 `:132`）** |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | UC-050 `:568-575`（TC-E2E-050-kill `:575`） |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `a7d8959a`（54） | Phase 2 #12 `:28` · Phase 3 privacy `:32`（DELETE=503 freeze） |
| `scripts/ai-docs/public-text-policy.mjs` | `bf267242`（541·EXEC 重 pin：起草锚 `272cd606`（536）漂 blob=x17 cap 步进注记面） | **`:243` `MAX_FILES`（cap 亲证 · §2-1 预算核）**——届值链：起草 `:238` 2_438 → x17 并线届值 2_439（`bf267242` 亲证）→ **EXEC 恰等步进 2_441**（CAP-SANCTION-2441 注记承登·EXEC 终态 2441 恰等零余量） |
| `ai-docs/delivery/harness/killsw-REQUEST.md` | `3b0841a5`（238） | §1.1 `:85` 边界读 · §1.3-⑤ `:102` · §3-1 `:141`（三处显式留源·closed 史录零洗零触） |
| `apps/api/test/uc-e2e-050-nhp-kill.proof.ts` | `641000dd`（599） | 收据先例（killsw Case 1·59 断言 EXIT=0 落卷）·零触只读 |
| `apps/api/test/_neg-harness.ts` | `9768b323`（330） | `:61-62` `delete process.env.MODEL_API_KEY/MODEL_BASE_URL` 自剥（keyless §1.6 依据） |

### 0.2 机制补充锚（rg 亲证）

- `MEETWISE_CONTENT_SAFETY_KILL_SWITCH` **不在 env-schema 注册**（`apps/api/src/platform/env-schema.ts` rg 零命中·本 turn 复证）——设计内：env 直读闸三态自校（`content-safety.ts:11-13` 注释·非法值 throw 不静默回退）。
- `denyContentSafetyKilled`/`assertContentSafetyKillSwitchOff` 调用面全树 rg（apps/api/src+packages·非 spec）：**恰 `interview.service.ts:337`（闸定义内 assert）+`:425`/`:436`（双口接线）**=产品闸面全图亲证·applications.service.ts/controller 零命中 → 绕行可达的结构性铁证。
- `beginInterviewCore` 调用面：`interview.service.ts:431`（begin 口·闸后）+ `applications.service.ts:57`（start 合一事务·**零闸前置**）=同核双生产者·恰一者未接线。

### 0.3 认领登记（逐 cell 定标汇总）

认领=矩阵 `:132` **UC-050 ADV cell 的 applications.start 绕行残余面**——本刀起草 turn 交付=登记+裁决卷（本 .md）；裁决已下采 (b) 诚实证据刀（§1.5 rev r1）·EXEC 面仍待 pre-exec 双审+明示授权；**(a) 产品接线刀清单登记归用户裁决队列（§1.5·不入本刀·零预支零预启）**；**不认领**：产品码接线面（(a) 队列·超 docs-only）、UC-052 擦除/导出域、UC-018 图面、backlog 直书（翻面权归协调方）。

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

### 1.5 刀型裁决（rev r1 重构·协调方改判 (b) 已下·断言极性翻转）

- **红停上报（史录留痕·零洗）**：总盘判原形「EXEC 小刀——断言绕行不可达（或可达则如实红停）」经起草席亲读核实为**「零产品码改动不足以证明绕行残余受控」**——§1.4 五点铁证 ⇒ 绕行**结构性可达**·「不可达断言」臂预期红=产品机制真相（非 harness 红·非夹具红）→ §8 停止条件「越界需要」起草期命中 → 红停归协调方（原卷改判二择一 (a)/(b) 选项登记不预支·史录不洗）。
- **协调方裁决（2026-10-26·rev r1 承登）**：采 **(b) 诚实证据刀**——**断言极性翻转：「断言绕行不可达」→「断言绕行现状可达且受控登记」**。钉「现状放行形状」为 case 证据（**keyless·零产品码·零接线**·本刀仍 docs-only+proof 面·产品码与静态门零触）；**产品接线刀 (a) 清单登记归用户裁决队列（卷内登记·不入本刀·零预支零预启）**。
- **三证据臂表（断言对象=「**现状与登记边界一致**」·非「产品正确」）**：

| 臂 | 断言形（极性翻转后） | 证据锚（rev r1 时点重 pin·零漂亲证） |
|---|---|---|
| ① 现状放行 runtime 臂 | kill=1 下 env 开关 `MEETWISE_CONTENT_SAFETY_KILL_SWITCH` 置 1 → `POST /applications/:id/start` 仍 **200/正常 begin 面**（非 503 现状放行形状如实断言·interview 行增+预留/入队净账如实）=**现状放行实证**；同 env 双口差分对照臂 kill=1 begin → 503 具名码（reason 级可分）·**B1 判据（P2② 承登）：Ban noop 形 200 计为放行证据——放行形状判据=body 四元（applicationId/status∈{started,reused}/interviewId/redirectTo）+DB interview 行增量+预留/入队净账**（applications.service.ts `:83` noop 空壳陷阱如实防呆） | controller `:21-26`→`start()` `:44-58` 全链零闸（§1.1/§1.2）·届时 spawn 面行使（§1.6 kill=1 env 注入）·B2 off 现状字节对照+B3 净账审计随臂 |
| ② 静态结构臂 | 闸接线面全树**恰 2 处**（`interview.service.ts:425`/`:436`）+ `beginInterviewCore`（`:102`）体内零 kill 检查 + `start`（`applications.service.ts:57`）直调零触=**结构性放行形状静态铁证** | §1.4 五点链+rg 全树亲证（rev r1 复证恒等·0.0.rev-r1） |
| ③ 静态门一致性臂 | `i6-239-gates.proof.mjs:53` `callSites === 2` 硬钉与产品现状一致——**门不红=登记边界自洽**（产品契约文注/静态门/登记卷三方同钉 begin/turn 双口最小集·§1.3 三源互证）·**P2③ 注：`callSites` 测量域=interview.service.ts 单文件字面（`:52`）——全树判定以臂② rg 为准**（本臂证「门钉值与单文件现状一致」·全树恰 2 由臂② 承证） | `:53` 亲读·与 ② 恰 2 处互证 |

- **case 收据语义=「登记边界如实证据化」非「行为合格证」**：收据证明的是「**残余在+被诚实钉位**」（登记边界与产品现状一致）——**非**「残余受控/产品正确/全入口已闸」的任何行为合格宣称（§5 Ban 承守）。
- **EXEC 行使形状（届时重 pin）**：B1=kill=1 子进程 spawn 下 start 放行形状如实断言（具名响应形状+interview 行增+预留/入队净账如实·对照臂 kill=1 begin → 503=同 env 双口差分）·B2=off 现状字节对照·B3=净账审计；新行 `NHP-050-START-BYPASS-01` 落 case-matrix `:128` 区（沿先例行形）+矩阵 `:132`/`:154` 行内**格值零动·只加 case-only 注记**（blind/NOT claimed 注记语义保持·沿 PERF2 收官先例 `93124ba0d` 形·gap 保持·`coveredCount=8` 零动）。
- **(a) 产品接线刀清单（登记归用户裁决队列·不入本刀）**：①`applications.service.start()` 补 `denyContentSafetyKilled()`（503 映射语义面归产品刀裁量·core 内接线备选仍登记）②**i6 静态门同步面（P2① dual r1 勘误承登）**：`:52` `callSites` 计数域=interview.service.ts 单文件字面——接线 applications.service.ts **不改计数，「必踩门红」为假命题**；防呆=扩 `:52` 扫描面至全树（或新增 applications.service.ts 接线断言）+同步 `:119` 零触断言与卷尾申报清单豁免实现（`:119` `!changeSet.includes('applications.service.ts')` 与申报清单臂均须同刀豁免·否则产品码触面即门红）；**:53 单改钉值 2→3 将致门永久红（计数恒 2）——原 rev r1「同刀同步 `:53` 钉值 2→3」的写法据此勘正**③双表勘正（矩阵 `:132` NOT claimed 注记+case-matrix `:129` 注记·killsw 卷史录不洗）——三件整包·翻面权/派单权归用户·本卷零触零预支。
- **EXEC 期机制推定形不符面**：kill=1 start 竟得 503=闸已在位·残余已闭合→(a) 队列前提翻转·放行形状断言红=机制面漂移——均命中停止条件「机制不满足」→ 停·如实登记上报（翻面权归协调方）·Ban retry-to-green·Ban 改断言极性凑绿。

### 1.6 keyless 判定核（env 闸子进程 spawn 面零外呼亲证）

- **起草 turn**：est live=**0**——本 turn 零实跑零模型外呼零 Key 加载（git/Read/rg/docs:check 全本地）。
- **EXEC 面（裁决 (b) 已下）**：沿 uc050 收据先例形（`641000dd` 零触承形）——隔离 PG+`127.0.0.1` 本地 HTTP（uc050 proof `:111`/`:114` 本地 base 亲证）+子进程 spawn env 变体（`:462` spawn·`:507` 假 `DATABASE_URL`（db.invalid）·503/对照路径零 DB 依赖论证先形）+**kill=1 env 注入子进程 spawn 面**（现状放行臂注入窗=测试进程 env 变体·零配置文件改·§3-7 承守）+三键词面**运行时组装零直书**（`:84-85` fragment join 形）+`_neg-harness` 自剥（`_neg-harness.ts:61-62` delete `MODEL_API_KEY`/`MODEL_BASE_URL`·egress inventory 已登记）。
- **臂① 夹具领地（P2④ dual r1 承登）**：臂①夹具为**申请面产品路径种子**（job_application+route ready+resume 绑定+quiz 三刀前提）——quiz 三刀前提=applications.start 直调形不携 sourceQuizId，`beginInterviewCore` quiz 三刀块整块跳过（码面亲证·零 quiz 夹具需求如实钉）；route ready=`createJob→classifyJobRoute 规则决（modelClassify 护栏=模型路径意外即炸·零模型零外呼）→inviteCandidate` 生产 db 函数链+真迁移链（entpay-s2 先例形·begin shell 先例之外**新夹具领地**）；隔离夹具裸 INSERT 豁免①具名三项（user_account/entitlement_bucket(enterprise)/resume(ingested)·真迁移链上无对应产品 HTTP 面的最小种子·entpay-s2 `:88/:92/:94` 同形·逐项 PIN 入收据）·**attempts 台账预期含夹具红次沿 uc033 先例如实留痕**（零断言谓词迁就）。
- **行使面外呼定性**：applications.start 绕行臂行使链=DB CAS+预留+入队（**全 PG 面**·api 进程零模型调用·隔离壳 worker 不在场零消费·零 Langfuse/零 OSS/零供应商网络触）→ **keyless 判定成立：零外呼·零模型/供应商触·「触外呼即红停」条款未触发**。

---

## §2 验收门矩阵（pre-exec 双审核对单基面·起草门 3 门本 commit 适用+EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（含 PTP cap 预算核·亲算）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·本树起草前亲跑 **EXIT=0 · scanned 2433**（stdout 亲读）· cap=**2438**（`public-text-policy.mjs:238` 亲证）· 本卷新文件 +1 → 预期 **2434 ≤ 2438 = 不越限·无需步进·无越限臂联动**。**rev r1 时点亲跑 EXIT=0 · scanned 2434**（draft 已入树基数·rev 零新增文件恒 2434≤2438 零步进）·PTP `public-text-policy:prove` rev r1 亲跑 **EXIT=0 · 12/12**。EXEC 面（裁决 (b) 已下）届时 **+3～+4 tracked 文件**（本卷 .md+proof+注册行+收据若落 text-extension）→ EXEC 日按届时 scanned 基数重算余量如实·**越限沿常设预授权恰等步进**（`public-text-policy.proof.mjs` 越限臂 fabricated 数随 cap 联动·cap 上抬权归协调方·Ban 就地改 cap）·越限且无预授权即「验收红不可修」停手上报。**EXEC 日兑现（2026-10-28）**：届值 c8f8effff 承 cap 2439（x17 恰等步进后·`bf267242:243` 亲证）·合并树亲跑 **PTP_FILE_LIMIT:2440>2439 红**（本支 REQUEST 受管 1 件并入·真 EXIT=1 亲证）→ **cap 沿常设预授权恰等步进 2439→2441**（EXEC terminal 算式=合并树 2440+主证 proof 1=2441 恰等零多放·四联动点恰等改+CAP-SANCTION-2441 注记双件承登）·EXEC 终验 docs:check **EXIT=0 · scanned 2441=cap 2441 恰等零余量**（收据 06）·PTP prove **EXIT=0 · 12/12**（收据 07）·真跑收据 stdout 落 **.log ∉TEXT_EXTENSIONS 非扫描面不计**（docker-info 收据取 .log 形——`.txt` ∈TEXT_EXTENSIONS 计面·sse-xrep 先例形规避承登）。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词+行首冲突标记 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:152-163`·不复抄卷内防自指——本卷文面零直书该五词面）· 起草席亲跑·回执 §7 · **rev r1 改动集（仍恰本卷 1 .md）markers 亲跑 EXIT=0 零命中**· est live=0（§1.6/§6）。**EXEC 日兑现**：改动集 22 路径（8 M+2 新 tracked 面含 proof+收据 log 面）markers 五类+行首冲突标记组装亲跑 **零命中 EXIT=0**（收据 08·**post dual 席1② 时效注记：08 系中程收据**——capture 时点 changeSet files=18=落码中程面，本卷收尾编辑与双表同步未落·非终态改动集·终态 markers 复跑亲证随 §9-post 收官补登）·est live=0 兑现（隔离 PG 全离线·api 进程零模型调用·worker 不在场零消费·零 Langfuse/零 OSS/零供应商网络触·三键词面运行时组装剥除双亲进程）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 .md（多任何 tracked 路径即停）·`apps/*/src`/`packages/*/src` 零 diff 亲证。EXEC 期 diff 面（若改判）=届时逐件登记（本卷+双表行内改+proof+注册行+runner 注册位+egress 预置条款行使面+收据面）·多任何未登记 tracked 路径即停。**EXEC 落卷 diff 面（git numstat/status 亲证·收据 09）**：8 M（本卷 .md+双表 2+apps/api/package.json+root package.json+policy 两 script+runner script）+2 新 tracked 面（`apps/api/test/uc-e2e-050-nhp-start-bypass.proof.ts`+`ai-docs/delivery/receipts/nhp-050-start-bypass/` 13 件 .log——**post dual 席1③ 勘误：原记「14 件」误记勘正·`ls` 亲点 00-09 十件+attempt1-3 三件=13**）·`apps/*/src`/`packages/*/src` **零 diff 亲证**（产品源零触·§3-1 承守）·零未登记 tracked 路径。**post dual 席1②+席2① 收据时效与 numstat 计数注记**：收据 08/09 系**中程收据**（capture 时点 numstat 实测 5 M+2 `??`·changeSet files=18——本卷收尾编辑与双表同步落笔前的落码中程面·非终态）；numstat 表仅计 tracked 未暂存改动行数，untracked 新面以 `??` 状态另列不入 numstat 行数——终态 diff 面与 markers 复跑由 post dual 复审亲证随 §9-post 收官补登。
4. **EXEC 预基面（届时重 pin·裁决 (b) 极性已下·pre-exec 双审与 EXEC 授权仍待）**：隔离 prove EXIT=0 **双 fresh**（implementer+独立复验·attempts 台账含红次如实）·邻面不回退（`uc050:nhp-kill:prove` 59 断言/`i6-gates:prove`/`neg:all` 按届时 SSOT 口径恒等——**B1 放行形状断言与 uc050 K1/K2 503 断言并存=绕行面差分自证·互不替代互不 wash**）·双表同步 diff 逐件登记（§1.0.3 令）·pre-exec 双审两独立外席 BOTH PASS 落卷（alone≠dual）·任一门红 → §8 停止条件。**EXEC 日兑现（2026-10-28·门矩阵亲跑·docker info EXIT=0 亲证·EXIT 原值收据 `receipts/nhp-050-start-bypass/`）**：主证 `pnpm uc050:nhp-start-bypass:prove` **EXIT=0 · 46 断言双 fresh**（fresh1 收据 01+独立复验 fresh2 收据 02·implementer attempts 台账=4（3 夹具/自校准红次（含期望字面误设勘正）——**post dual 席2② 归类措辞承登**：①attempt1=42703 consumption 列名误设+ISO-3 迁移链断言红 **双面**（attempt1 红日志两 FAIL 亲证·post dual 席1④ 归因精确化承登）②迁移集语义+期望形勘误修正 interviewId uuid→iv_ 前缀形（**正向不弱化**——据实钉持久化绑定形状·非放宽非凑绿）③schema_migrations version 后缀形误设——**零断言谓词迁就零极性翻转·46 断言数恒定·P2④ 预期夹具红次沿 uc033 先例如实留痕**·attempt1-3 红日志随收据留痕））·邻面 `uc050:nhp-kill:prove` **EXIT=0 · 59 断言恒等**（收据 03）·邻面 `neg:all` **EXIT=0** 全负路径族绿（收据 05）·邻面 `i6-gates:prove` **EXIT=1 恰 1 臂红=申报清单臂**（`改动集恰符` 对外来改动集按设计红——killsw §7 同口径·预期形非本刀门·①-⑦七臂全 PASS 含 markers 臂·收据 04 如实留痕）·双表同步 diff 逐件登记（§2-3）。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:132`/`:154` UC-050 面格值零动·仅允许行内 case-only 收据注记加注（裁决 (b) 已下·blind/NOT claimed 注记语义保持·沿 PERF2 收官先例 `93124ba0d` 形·gap/blind 保持）· case-matrix 新行 `NHP-050-START-BYPASS-01` 当前旗落 **blind**+case-only 措辞（gap→case-only 形沿 `NHP-050-KILL-01` 先例·行状态不动）· `:192`「Ban elevate UC-050/051/export」逐字维持 · DELETE=503 零动 · **coveredCount=8 零翻转** · Ban 借 uc050/uc051 收据宣本面已覆盖·Ban 借本卷宣「kill-switch 全入口已闸」。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff——**含 applications.start 绕行面接线（§1.5 裁决·超 docs-only·红停归协调方）与 env-schema 注册补录**；`scripts/i6-239-gates.proof.mjs` 零触（静态门钉值更新归产品刀同刀·本卷零触）。
2. **UC-052 擦除/导出域零触**：case-matrix `:119-123` NHP-050-FAULT 全族、`privacy-erasure-http.proof.ts`、DELETE=503、export 面（Phase 3 freeze `queue:32`）——只读。
3. **UC-018 图面零触**：`:575` TC 需求面的图终态语义归 `49a33634` 先例——只读旁证·收据互不借用。
4. **killsw 卷史录零触**：`harness/killsw-REQUEST.md` closed 史录零洗零改（NOT claimed 注记的勘正权归协调方/后继产品刀双表同步面）。
5. **其余 §1.0 行零触**：盘点表排除面全部只读（在飞支触面清单见 §0.0·行号 EXEC 日重 pin）。
6. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方（**绕行残余的 backlog 直书零触**·killsw §3-5 承守）。
7. **covered/queue 翻面零预支** · **零迁移零配置**：Ban 新迁移 Ban 触告警/CI 配置；`MEETWISE_CONTENT_SAFETY_KILL_SWITCH` 仅测试进程 env 窗（spawn env 变体）·零配置文件改·零 `.env*` 落树落据。

## §4 依赖

**①上游已满足**：kill 闸机制全在树（§0.1 blob 亲算 13 件）+ uc050 收据先例（`641000dd`·spawn env 变体/假 DB 论证/净账审计技法全承形）+ 三层隔离壳+`_neg-harness` 自剥先例。**②同文件并发**：起草 turn 恰 1 新 .md 零交涉面；EXEC 期（裁决 (b) 已下）触矩阵 `:132`/`:154`+case-matrix `:128` 区落点——§0.0 在飞交叠复核必做（loadw-exec 触 `:89` 邻区在飞·行号届时重 pin）。**③下游**：裁决已下（(b)·三向裁量收束）；(a) 产品接线刀整包清单已登记归用户裁决队列（§1.5 rev r1·含静态门同步面——防「只改产品码踩静态门红」的二次返工·派单权归用户）；(b) 收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§1.5 红预期承守·红=机制真相时 Ban 凑绿 Ban 改断言极性凑绿）；Ban invent covered（升格 partial/covered·借 uc050/uc051 收据 wash·借本卷宣「全入口已闸」·**Ban 借本收据宣称产品正确·Ban 借本收据洗 GAP——本卷 case 收据语义=「登记边界如实证据化」非「行为合格证」（§1.5 rev r1·收据证的是残余在+登记边界与现状一致·非残余受控非接线合格）**）；Ban live key（零 `MODEL_API_KEY` 加载/伪造·零 live 外呼·est live=0·三键词面码面零直书·`env -u`/`_neg-harness` 剥除·否则 `environment_reference_unregistered` 红停）；Ban 触产品码/静态门/迁移/CI 告警配置（§3-1·**含绕行面就地补线——killsw §1.3-⑤ 逐字承守·(a) 清单已登记归用户裁决队列非本刀面**）；Ban 触 UC-052 擦除导出域与 UC-018 图面与 killsw 卷史录与其余 §1.0 行（§3-2/3/3-4）；Ban 改共享 SSOT/backlog 直书（§3-6）；Ban 触既有 proof 文件（uc050/uc051/obs-logging/privacy-erasure-http 零触只读引用）；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·新增豁免先回炉修订本卷）；Ban 就地归因门矩阵外新红（新红如实登记升级·Ban 借机修）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 `.env*`/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（**rev r1 同 est live=0**·门面本地亲跑零外呼；EXEC 期裁决 (b)：全离线隔离 PG·spawn env 变体+kill=1 env 注入零外呼·`_neg-harness` 自剥·§1.6 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词+行首冲突标记 grep 零命中**（起草席亲跑·回执随 commit 信息留痕·词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:152-163`·不复抄卷内防自匹配——沿 killsw §7 同形制）· **如实登记**：全量 `i6-gates:prove` 系 i6 刀**自持申报清单门**（申报清单臂对外来改动集按设计红——本卷非 i6 刀触面·该臂红=预期形非本刀门·markers ⑦臂对词面修正后 PASS 亲证）；**勘误留痕（史录不洗）**：起草首版本卷 §2-2 曾直书五类标记词词面致 ⑦臂红·同 turn 自纠（删词面直书·改口径引用）·零 commit 前留痕零凑绿。**rev r1（裁决改判修订）改动集仍恰本卷 1 .md**——五类标记词+行首冲突标记 grep 亲跑 **EXIT=0 零命中**（同口径组装·回执随 rev commit 信息留痕）·全量 `i6-gates:prove` 申报清单臂红=按设计非本刀门承旧（§2 承登）。

## §8 STOP（开工三条款 + 停止条件四类·三处钉之二）

**STOP · `closed`**（三处钉：Status 行+本节+卷尾注 · 2026-10-26 起草落卷 · 同日 rev r1 裁决改判修订落卷 · **2026-10-28 EXEC 立项+落码行使落卷翻转本值**——开工三条款兑现：①pre-exec 双审 dual r1 两外席 BOTH PASS 落卷（P2 修订八件随立项日履行承登）②协调方明示 EXEC 授权（落码+行使·裁决 (b) 承登）③§1.5 裁决面/§5 Ban/pins/§3 范围外零改（改则回炉承守·立项日重 pin=行号/blob 如实改锚·机制结论零翻·§0 基线行承登）· **2026-10-28 post-prove dual 两独立外席双 PASS 会签→收官翻面本值 `closed`**（原值 `executed:awaiting_post_prove_dual` 史录不洗·post dual P2 勘误七件随收官落卷承登 §2/§9·证面冻结零触·EXIT0=case≠covered·Ban 借本收据宣 covered/产品正确/全入口已闸 承守））。**停止条件（四类·命中即停手上报·Ban 就地处置）·EXEC 期核对**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（`applications.service.ts` blob 离 `e1bf8ff0`=绕行面被改·闸调用面数变·`i6-239-gates.proof.mjs:53` 钉值被他刀改·`:132`/`:126` NOT claimed 注记被改写·loadw-exec 等在飞卷并线与本刀对同表冲突改行）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §1 红事实推定形不符（裁决 (b) 三证据臂形：kill=1 applications.start **竟得 503**=闸已在位·残余已闭合→(a) 裁决队列前提翻转·放行形状断言红=机制面漂移·均如实登记上报）→ 根因诊断被证伪 → 停·如实登记上报（翻面权归协调方）·Ban retry-to-green。
- **越界需要**：修法诉求超出 docs-only 面（**接线产品码/静态门 `callSites` 钉值/backlog 直书/covered 翻面/共享 SSOT**）→ 停·**起草期已核实命中一次（§1.5·闭合需产品码）·本卷如实标注「超 docs-only 范围·红停归协调方」·EXEC 不预启动**·EXEC 期再命中同款即停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 越届时 cap / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。**EXEC 期核对（2026-10-28）：四类均未触发**——现场漂移=产品源十三锚 blob 恒等（双表漂移如实改锚§0 基线行）·机制不满足=kill=1 start 竞得 **200 非 503**（现状放行形状与 §1 推定形恰符·SB1 臂全绿）·越界需要=零产品码零静态门钉值触（diff 面零 `apps/*/src`）·验收红不可修=门矩阵全绿（i6 申报清单臂红=设计内非本刀门·§2-4 承登）。

---

## §9 EXEC 落卷（2026-10-28·协调方授权落码+行使·pre-exec dual r1 双 PASS 放行·P2 修订八件随立项日履行）

**开工三条款兑现**：①pre-exec dual r1 两独立外席 BOTH PASS（P2 修订八件=席1+席2 合并·随本节承登：①§1.5 (a)②+§0.1 i6 行「必踩门红」假命题勘误 ②§1.5 B1 Ban noop 形 200 ③臂③ callSites 单文件域注 ④§1.6 臂①申请面夹具领地 ⑤§0.0 xrep 21 件+x17/perf2 tip 漂移补登 ⑥七列形→八列形勘误 ⑦denyContentSafetyKilled 锚 `:335-348`→`:335-347`（`:342`=503 状态字）+⑧§0 基线/§2/§8/卷尾 EXEC 落卷面）②协调方明示 EXEC 授权（落码+行使）③§1.5 裁决面/§5 Ban/pins/§3 范围外零改亲证（pins 十一值零翻·coveredCount=8 零动·产品源零触）。

**EXEC 立项序（§8 三条款③履行）**：`git fetch origin` EXIT=0·届值 `c8f8effff`（#175·含 #174/#171/#170 在前·#173 sse-xrep+loadw-exec 在飞未落 main 如实采）→ merge 零冲突兑现（merge-base=`c06ed67b5`·tip `f08e2d8d5`·两集合零交叠纯 additive·merge-tree 预演与实 merge 零冲突恒等）→ `pnpm install --frozen-lockfile` EXIT=0 → §0 全量重 pin（基线行承登·blob 漂两件+行锚 +3 如实改·机制结论零翻）→ cap 恰等步进 2439→2441（CAP-SANCTION-2441 双件）。

**落码面**：`apps/api/test/uc-e2e-050-nhp-start-bypass.proof.ts`（rev r1 三证据臂·spawn 面沿 uc050 收据先例 `:449-462` runChild 形+隔离 PG+`127.0.0.1`+三键词面运行时组装+_neg-harness 自剥承形；申请面夹具=entpay-s2 真迁移链先例形·§1.6 P2④ 承登）。注册面=runner 四位（fixture map/targets/命令映射/pre-migrate 名单·`scripts/run-e2e-isolated.mjs` additive）+`apps/api/package.json` `prove:uc050-nhp-start-bypass`+root `package.json` `uc050:nhp-start-bypass:prove`/`:prove:raw` 两行。typecheck（apps/api tsc --noEmit）**EXIT=0**。

**三臂断言数（主证 EXIT=0 · 46/46 双 fresh·post dual 席1① 勘误承登：本行分解改收据实点——原记「ISO 4+SEED 3+CHILD 4+SB1 9+SB4 12」系误记勘正·fresh1/fresh2 stdout PASS 逐臂亲点 ISO 5+SEED 3+CHILD 2+SB1 8+SB2 4+SB3 9+SB4 11+SB5 4=46 恒等·证面零触）**：ISO 5+SEED 3+CHILD 2+**SB1 臂① 8 断言**（kill=1 start→200+四元非 noop 形+iv 前缀形+redirectTo 形+同 env begin→503 具名码+诚实文案逐字+killVal echo）+**SB2 off 对照 4 断言**（start 200 四元+begin 202 alreadyBegun+killVal undefined echo）+**SB3 净账 9 断言**（interview 行增 +1/臂+start job 恰 1+answer 0+四元绑定在场+预留恰 1 行 reserved payer=recruiter+个人桶零触+企业桶 +2.00 恰等+CAS in_progress）+**SB4 臂② 静态 11 断言**（闸接线恰 2 逐行 `:425`/`:436`+闸定义 `:335-347`/`:341` 具名码/`:342` 503 状态字+全树恰位形三断言+applications.service/controller 零 kill 词元+core 体内零 kill 检查+守卫链在场对照+start 直调零闸+`:83` noop 空壳锚）+**SB5 臂③ 4 断言**（i6 `:53` 钉值+`:52` 单文件域+单文件计数===全树计数一致+`:119` 零触断言在场）。

**门矩阵 EXIT 原值（docker info EXIT=0 亲证·stdout 留痕 `ai-docs/delivery/receipts/nhp-050-start-bypass/`）**：主证 fresh1 `01` **EXIT=0 · 46/46**（attempts=4：attempt1 红 42703 consumption 列名+ISO-3 迁移链断言双面/attempt2 红 迁移集语义+期望形勘误修正 uuid→iv_（正向不弱化）/attempt3 红 version 后缀形——**3 夹具/自校准红次（含期望字面误设勘正）如实留痕（attempt 日志随收据·post dual 席2② 归类措辞承登）·零断言谓词迁就·沿 uc033 先例**）+独立复验 fresh2 `02` **EXIT=0 · 46/46**；邻面 `uc050:nhp-kill:prove` `03` **EXIT=0 · 59 断言恒等**；邻面 `neg:all` `05` **EXIT=0**；邻面 `i6-gates:prove` `04` **EXIT=1 恰 1 臂红=申报清单臂**（外来改动集按设计红·killsw §7 同口径·①-⑦臂全 PASS·预期形非本刀门如实承登）；docs:check `06` **EXIT=0 · scanned 2441=cap 2441 恰等**；PTP `07` **EXIT=0 · 12/12**；markers 组装核 `08` **零命中**；diff numstat `09` 8 M+2 新 tracked 面·`apps/*/src`/`packages/*/src` 零 diff 亲证。**post dual 席2③ SB4 域口径注记核对：已有承登零新改**（`:52` 单文件测量域注记已在 §0.1 i6 行 P2① 勘误+§1.5 (a)②+臂③ P2③ 注三处承登·本行 SB5 项「`:52` 单文件域」同钉）。**停止条件四类零触发**（§8 EXEC 期核对行）。

**双表同步（§1.0.3 令·格值零动）**：case-matrix 新行 `NHP-050-START-BYPASS-01` 落 `:131` 区（八列形照 §1.4 表头·**blind→case-only 措辞·行状态不动·post dual 待**）·coverage-matrix `:132` Aggregate cell+`:154` 尾列行内 case-only 收据注记（ADV 格 blind 保持零翻·NOT claimed 注记语义保持·沿 PERF2 收官先例形）。

**keyless/egress**：est live=0 兑现（全离线隔离 PG·api 进程零模型调用·隔离壳 worker 不在场零消费·classifyJobRoute 规则决护栏=modelClassify 意外即炸·零 Langfuse/零 OSS/零供应商网络触）·三键词面运行时组装剥除（码面零直书·provider-egress-inventory 零新登记）·裸 INSERT 豁免三项具名入收据（§1.6 P2④）。

**post-prove dual（EXEC 落卷时点待审→2026-10-28 双 PASS 会签·§9-post 承登）**：本收据语义=「残余在+登记边界与现状一致」如实证据化·非行为合格证·(a) 产品接线刀清单仍登记归用户裁决队列（§1.5 P2① 勘正形）·Ban 借本收据宣称产品正确/洗 GAP/宣「全入口已闸」·翻面权归协调方。

## §9-post 收官台账（2026-10-28·post 双审双 PASS 会签+收官并线+终验三门·协调方收官令步进预 sanction 行使）

- **post-prove dual 会签翻面**：两独立外席席1 PASS+席2 PASS → 收官翻面 **`closed`**（Status/§8/卷尾三处同值·原值 `executed:awaiting_post_prove_dual` 史录不洗）·**P2 勘误七件随收官落卷（证面冻结零触）**：席1① §9 断言分解改收据实点（ISO 5+SEED 3+CHILD 2+SB1 8+SB2 4+SB3 9+SB4 11+SB5 4=46·fresh stdout 逐臂亲点）·席1② §2-2/§2-3 收据时效注记（08/09 中程收据·终态由本节补登）·席1③ §2-3 收据件数 14→13·席1④ §2-4 attempts 归因精确化（attempt1=42703+ISO-3 双面·attempt2 期望形勘误修正 uuid→iv_ 正向不弱化·零极性翻转·46 恒定）·席2① numstat 计数注记·席2② 红次归类=夹具/自校准红次（含期望字面误设勘正）·席2③ SB4 域口径注记核对已有承登零新改。
- **收官并线**：`git fetch origin` EXIT=0·届值 `origin/main` **`2818c2522`**=#176（uc30 收官合卷已落·cap 届值承 2441）→ merge `ef9ed3b9d`（恰 2 处冲突=两 policy 脚本 CAP-SANCTION-2441 注记区·**dual-keep 双留沿先例形**·余 auto-merge 零冲突）→ `pnpm install --frozen-lockfile` EXIT=0。
- **终验三门**：**门1** docs:check 步进前 EXIT=1 `PTP_FILE_LIMIT:2443`（union 实测 2443=main 届扫 2441+本支并入互斥受管 2 件〔uc50-REQUEST.md+uc050 proof .ts〕·双亲各自合规 2441+2441）→ **协调方收官令步进预 sanction 行使：CAP-SANCTION-2443 恰等步进 +2（2441→2443·policy `MAX_FILES`+proof 四联动点 2_443/f-2443.md/:2444 恰等改+双 script 链区注记承登）·PTP `public-text-policy:prove` 12/12 EXIT=0 亲跑·复跑 docs:check EXIT=0 scanned 2443=cap 恰等零余量**；**门2** 收官改动集 22 tracked paths markers 五类+行首冲突标记组装亲跑 **零命中 EXIT=0**（词面运行时组装口径）·est live=0（收官 turn 全本地 git/node/docs:check/PTP·零模型外呼零 Key 加载）；**门3** `git merge-base --is-ancestor origin/main HEAD` **EXIT=0**+产品源 `apps/*/src`/`packages/*/src` **零 diff**（22 tracked 全 docs/proof/注册/收据面）。
- **终态 diff 面（席1② 补登·`git diff --name-status origin/main...HEAD` 亲证）**：22 tracked paths=7 M（coverage-matrix+case-matrix+两 package.json+policy 两 script+runner script）+15 A（本卷 .md 1+uc050 proof .ts 1+收据 .log 13——.log ∉TEXT_EXTENSIONS 非扫描面不计）·对 EXEC 落卷值恒等（收尾编辑仅本卷 .md 行内·双表零再触）·`apps/*/src`/`packages/*/src` 零 diff 恒一。

---

*UC50 REQUEST · 2026-10-26 起草 · 同日 **rev r1 裁决改判修订**（协调方对红停上报采 **(b) 诚实证据刀**·**断言极性翻转「断言绕行不可达」→「断言绕行现状可达且受控登记」**·三证据臂承登 §1.5·**(a) 产品接线刀清单登记归用户裁决队列·不入本刀**·case 收据语义=「登记边界如实证据化」非「行为合格证」）· **2026-10-28 EXEC 立项+落码行使落卷**（pre-exec dual r1 双 PASS 放行·协调方授权·P2 修订八件随立项日履行·§9 承登）· **STOP=`closed`**（三处钉：Status 行+§8+本行·**2026-10-28 post-prove dual 两独立外席双 PASS 会签收官翻面**·原值 `executed:awaiting_post_prove_dual` 史录不洗·post dual P2 勘误七件随收官落卷承登 §2/§9·证面冻结零触·EXIT0=case≠covered·Ban 借本收据宣 covered/产品正确/全入口已闸 承守）· UC-E2E-050 applications.start 绕行残余面（killsw 卷 NOT claimed 显式留的后继独立 REQUEST）· 覆盖矩阵 §1.0.1 `:132` 聚合行 UC-050 ADV 格（blind 保持零翻·行内 case-only 收据注记已加）+ §1.0.2 `:154` 分面登记行（三值 blind 零动·行内注记已加）+ case-matrix §1.4 `:131` 区新行 `NHP-050-START-BYPASS-01` 已落（八列形照 §1.4 表头·blind→case-only 措辞·行状态不动）· EXEC 基线：届值 `origin/main` `c8f8effff`=#175·merge tip `f08e2d8d5` 零冲突兑现·merge-base=`c06ed67b5` · 产品面现形=`:44-58` 零 kill 闸直调核（`:57`）+controller `:21-26` 零闸+闸调用面全树恰 2（`:425`/`:436`）+core 体内零闸+静态门 `:53` `callSites === 2`（`:52` 单文件测量域·P2① 勘误承登）——EXEC 重 pin 产品源十三锚 blob 恒等·机制结论零翻 · **三证据臂全绿兑现（主证 `pnpm uc050:nhp-start-bypass:prove` EXIT=0 · 46 断言双 fresh·attempt1-3 夹具红次如实留痕零谓词迁就）**（①kill=1 start 现状 200 四元非 noop 形+同 env begin 503 差分+净账恰等②闸接线恰 2+core 零检+start 直调零触静态结构③i6 单文件计数===全树计数=登记边界自洽）· **断言对象=「现状与登记边界一致」非「产品正确」** · keyless 判定=成立（spawn 面 PG/127.0.0.1/三键自剥+kill=1 env 注入·worker 不在场零消费·零模型零供应商·est live=0）· cap 2439→2441 恰等步进（EXEC terminal 2441=cap 恰等零余量·CAP-SANCTION-2441 双件）· 门矩阵亲跑 EXIT 原值收据 `receipts/nhp-050-start-bypass/`（主证双 fresh EXIT=0/kill 邻面 EXIT=0 59 断言/neg:all EXIT=0/i6 申报清单臂设计红如实登记/docs:check+PTP+markers EXIT=0）· markers=0 · est live=0 · pins 十一值零翻 · coveredCount=8 不变 · (a) 接线刀清单仍登记归用户裁决队列·本刀零产品码零接线 · ⛔push ⛔force-push（EXEC 期·史录承旧不洗）· **2026-10-28 post dual 收官翻面 `closed`**（双 PASS 会签·P2 勘误七件落卷·证面冻结零触·§9-post 台账承登）· 收官并线届值 `origin/main` `2818c2522`=#176 如实采·merge `ef9ed3b9d` dual-keep 恰 2 冲突=两 policy 脚本 CAP-SANCTION-2441 注记区双留·终验三门亲跑（门1 docs:check 步进前 PTP_FILE_LIMIT:2443 红→CAP-SANCTION-2443 恰等步进 2441→2443 四联动点+PTP 12/12 亲跑+复跑 scanned 2443=cap 恰等零余量·门2 markers 22 路径零命中·门3 ancestor EXIT=0+产品源零 diff）· 收官 push 沿协调方收官令行使*
