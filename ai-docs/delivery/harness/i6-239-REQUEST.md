# I6 D6-COMPLIANCE REQUEST（批3 段 · D6 合规最低集四件 · #239 · M 体量如实呈报）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷 2026-10-12·本刀 docs+web 文案+api/worker 闸面小改·起草阶段恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push） → **`executed:awaiting_post_prove_dual`**（**EXEC 落卷 2026-10-12·I6 #239 EXEC 席 @`7b6d0f38`**：pre-exec 双审 BOTH PASS+协调方派单即 §8 开工授权·D6 合规最低集四件全落（恰 14 件·零迁移零新表·SSOT 零触·pins 十一值零翻转·est live=0）·七裁决项现裁见 §8.1 现裁记录·四门收据补录 `receipts/i6-239/`（机械门 40 断言 ALL PASS·web prove 427 PASS·uc003-i18n-locale·public-copy 14/14·全 EXIT=0）·post-prove 席1 裁定 FAIL（码面四件交付与 proof/回归抽验全绿·FAIL 全因文书义务三项+一条诚实性勘误·见 §8.2 erratum 小节）·文书收口席三义务修补落卷·⛔push）

**席位**：#批3 段 I6 组盘点起草席（北星 loop · 批3 残 2 之 #239 件 · D6-COMPLIANCE 刀 · 先盘点后起草）。
**基线**：`feat/mysql-schema-skeleton` @ `8b8e20bc`（主线最新 tip·`git log -1` 实测 2026-10-12 13:03 merge(e2e-r3-v4-follow)·建树时点亲读）。分支 `line/i6-239`·工作树 `meetwise-i6`（`git worktree add ../meetwise-i6 -b line/i6-239` 本起草席已立·建前 `git worktree list` 实查不存在）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` :314 #239 行（原文/证据列/修法列/备注逐字誊录 §0.1）②分组蓝本=batch-residual-plan @`ab02d499`「批3 残余 → 6 组」表 I6 行 `:112`（**逐字**：「| I6 | **D6-COMPLIANCE 小刀** | #239 | kill-switch/危机话术/年龄声明/B 端自动化决策说明四件（D6 已决按建议版本·措辞法务复核保留） | **S-M** |」·**跨树引用如实登记：该档实体在 `line/batch1-residual` 树·非 tip 祖先（merge-base 实测）·`git show ab02d499` 亲读·沿 I5 卷 @ab02d499 同款跨树引用先例**）③LEDGER `product-campaign-LEDGER.md` :71 槽行（「#239 | 🆕 D6 合规四件」）+:211 批3 水位（21/23·残 2）+:330 残 2 复述（#263/#239）④位图行=TASK-SOP-v2 `:72`（「D6-COMPLIANCE（#239 四件）| kill-switch+危机话术+年龄声明+B 端自动化决策说明」）+EXECUTION-SOP `:34` W9 ②（#239 口径文档待命职责·双登记呈报 §0.3-②）⑤邻卷让渡界线=I3 卷 `:37`/`:116`+I4 卷 `:31`/`:120`（「#239=I6」零触注记）+I5 卷 `:126`（「与 I6 零交集」）⑥形制沿 `i5-caliber-REQUEST.md` rev2（本树 @`8b8e20bc` 在卷·§0-§8 全·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `8b8e20bc`·file:line 逐条 rg/sed 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 已终局防重检查记录（强制项）

- `rg -l "I6|i6-239|#239" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md`（base `8b8e20bc` 实跑）→ 命中 **6 件**逐一核验：①`product-campaign-LEDGER.md`（:71/:211/:294/:297/:330）——本组**派单登记面**（组级行+批3 终核「#239 I6 未开工（无 REQUEST 卷）」·本刀即其立项载体）；②`TASK-SOP-v2.md`:72 ③`product-campaign-EXECUTION-SOP.md`:34——位图行/W9 职责行登记面；④`i3-job-mgmt-REQUEST.md`（:37/:116）⑤`i4-invite-face-REQUEST.md`（:31/:120）⑥`i5-caliber-REQUEST.md`（:126）——三卷**明示让渡注记**（「#239→I6」「I6 合规零触」「与 I6 零交集」）非占有。`execution-master-checklist.md` **零命中**（不在命中清单·机检亲证）；harness/ **无 i6-\* 同名卷**（ls 全表实测）。
- **邻刀占有逐卷复核**：I3/I4/I5 三卷让渡注记如上（零夹带·LEDGER :211 批3 残 2 口径一致）；authz-harden 5A 在飞（`line/authz-harden` @`dec1e9a5`·vs 基线 37 文件——**【EXEC 重 pin 2026-10-12 更正：`git merge-base` 实测=`dec1e9a5` 已并线为基线祖先（5A-1 nail 已并·本行 pin 陈旧）·在飞 tip=`d1e2a363`（§0.2 自认）·真实在飞 diff=32 文件非 37（`git diff --name-only dec1e9a5..d1e2a363 | wc -l` 实测）·与本刀候选触面 grep 零交集 EXIT=1 实证·`interview-jobs.ts` 仍零触】）——账号会话/面硬化件族·与 §1 候选触面**零文件交集**（唯 `packages/db/src/interview/interview-jobs.ts` DB payload 清理面相邻·本刀零触该文件）；unstub-erase `f9383f76`（2026-10-10·tip 祖先亲证）落 D6 **删除/擦除半域**（#236/#242/#247 面）——非本组四件；entpay/blite/e2sc/5e 四在飞树域零交集。→ **停止条件未触发·可落卷**。

### 0.1 盘点总表（#239 单件四子件·原文/修法列逐字+四子面实测）

**issues-master :314 原文逐字誊录**：P2·用例偏差·面试中——「安全/合规类用例零实现：危机 safety_hold/辱骂/自伤路由、内容安全类 kill-switch、未成年、自动化决策拒绝权/跨境同意在代码中零命中（平台级 runaway/成本杀开关与预览写门存在，不算此类）」。证据列：「（rg safety_hold\|risk_held\|crisis\|kill.?switch\|未成年\|guardian\|自动化决策\|跨境 零相关命中）；packages/domain/src/adaptive-interview.ts:94（平台杀开关，非内容安全）」。状态「仍存在」·核实度「未找到（rg 范围 apps/packages 非 md 非测试）」。修法列逐字：「（D6 合规最低集）内容安全 kill-switch + 危机话术固定处置 + 年龄声明 + B 端自动化决策说明与人工复核入口；不做 safety_hold 状态机等重方案」。硬依赖列：「—（D6 已决，按现有建议版本执行；措辞建议法务复核，保留）」。批次「第3批」。备注三级：①审计更正（kill-switch 一项过头·平台级开关在场·改为「没有内容安全类 kill-switch」）②D6 决策（四项执行口径①kill-switch ②危机/自伤固定处置文案与转介信息 ③注册年龄声明未满 18 不提供服务 ④B 端（D4 保留）岗位面试自动化决策说明+「要求人工复核/拒绝仅由自动化决定」入口（PIPL 第 24 条）·不做 safety_hold 状态机/辱骂分级路由）③「按现有建议版本执行不再另出方案；措辞建议法务复核（保留，不阻塞开工）」。

| 子件 | 已解决? | 实树判定锚（`8b8e20bc` 实测·2026-10-12 现势） |
|---|---|---|
| ①内容安全 kill-switch | **开放（零实现）** | `rg "内容安全\|content.?safety\|moderation\|内容审核"` apps/packages（非 md 非测试）**EXIT=1 零命中**；平台级开关三处在场非此类=`packages/domain/src/adaptive-interview.ts:94`（runaway 轮次上界注释·与证据列锚**零漂亲证**·块 :93-99）/`apps/api/src/platform/public-preview.ts:40/:51/:60`（预览三态写门）/`apps/api/src/modules/interview/interview.service.ts:392-404`（turn 入口 denyPublicPreviewWrite+成本 DoS 闸）+worker 模型熔断 failover 链 `apps/worker/src/interview-service.ts:196-227`——审计更正口径现 tip 仍成立 |
| ②危机话术固定处置 | **开放（零实现）** | `rg "自伤\|自杀\|suicide\|危机\|热线\|心理援助\|转介"` apps/web/packages **EXIT=1**（唯一表面命中=`apps/worker/smoke/adaptive-attack.ts:64` 攻防对照注释「自伤攻破」非本域）；zh/en i18n 危机词面 EXIT=1；固定处置文案与转介信息零实现 |
| ③注册年龄声明 | **开放（零实现）** | `apps/web/app/login/page.tsx` signup 表单仅 email `:44`+password `:48` 两字段（`:26` form·该文件历 2 commit：initial+`54cf5956` #81）；`rg "未成年\|未满.?18\|年龄"` 零年龄门命中（命中面系 `packages/domain/src/research-policy.ts:41` 反歧视正则+`adaptive-interview-service.ts:42` 脱敏域词·非本域） |
| ④B 端自动化决策说明+人工复核入口 | **开放（零实现）** | `apps/web/app/jobs/page.tsx:109-110` 申请表单零披露零入口；`apps/api/src/modules/jobs/applications.service.ts:16` scoreless+人工复核状态系评分校准 hold 披露（SCOR/0082 面）**非 PIPL24 候选人入口**；`apps/web/app/legal/page.tsx:45`「自动招聘决定尚未开放」系边界声明页非流程内说明——说明+入口两半零实现 |

**域内邻面定性（防措辞过头·沿审计更正先例）**：admin 审计日志（`packages/db/src/audit/audit.ts:3-9` append-only+`admin/page.tsx:134` 卡=特权写问责面）、保留分类枚举（`packages/domain/src/memory-summary.ts:39-41`=数据模型分类非用户承诺）、legal 边界页（诚实化声明面）——三邻面在场但**均非 #239 四件**，本刀不收不触；「整域零实现」措辞按 §0.3-③ 收窄为「D6 合规最低集四件零实现」。

### 0.2 漂移登记（证据列旧锚 @`2fab7946`（2026-10-09 审计基线）vs `8b8e20bc` 实测）

| 旧锚 | 现锚（实测）·漂移主因 |
|---|---|
| 证据列 rg 词面（apps/packages 非 md 非测试） | **复扫 EXIT=1 零命中维持**——「整域零实现」复核成立·未被任何近期刀顺带落面 |
| `adaptive-interview.ts:94` | `:94` 注释行**零漂亲证**（块界 :93-99） |
| issues-master :314 行 | **零漂亲证**（更正版现行卷面） |
| 近期刀逐卷排查（2026-10-09 后） | `f9383f76` unstub-erase=D6 删除半域（非四件）；`ee424923`/`d1e2a363` authz 5A-1/5A-2=账号会话+面硬化（批5 件族）；`8262d976` dir-b2 纯移；I5 九件 nail（`388e5f7b`→`f92a5035` 并线）零触 #239（I5 卷 :126）；H4/EVIDENCE/QP/HA 系词面零命中——**四件零顺带落面结论成立** |

**重 pin 免责**：本节锚为起草席 base `8b8e20bc` 一次性亲读；EXEC 立项/双审照例全量重 pin，漂移只更行号不改结论（I5 卷 §0.2 同款先例）。

### 0.4 EXEC 重 pin 记录（2026-10-12·结论不变只更锚·§1/§5 零改）

- **主线 tip 复测**：`feat/mysql-schema-skeleton` @`8b8e20bc`（local=origin 0/0）——`229c8dad`（docs ledger 批表同步）/`03db1b84` 均已是其祖先·`git rebase feat/mysql-schema-skeleton` 实跑=「Current branch line/i6-239 is up to date.」EXIT=0 no-op（merge-base=8b8e20bc=tip 本身·0 behind）。§0 基线锚零漂。
- **authz 在飞 pin/计数更正**：如 §0.0 内联更正——merge-base=`dec1e9a5` 已并线·在飞 tip=`d1e2a363`·真实在飞 diff=32 文件非 37·零文件交集维持。
- **#263 面窗微漂**：起草席钉 `login/page.tsx:33-38` → 现势实测 `:38-40`（`招聘方入口是内部预览骨架，不是已上线产品` 标注句窗·本刀 ③ 插入位于 :50 password 块后·行级零重叠·`git diff --numstat` 删行=0 实证）。
- **③④互洽面增补（席2 处方承接）**：how-it-works `apps/web/app/recruiter/how-it-works/page.tsx:36`「校准和人工复核工单还没开放」+ surface.ts `apps/web/lib/recruiter/surface.ts:95`「校准和人工复核做完之前」+ legal `apps/web/app/legal/page.tsx:45`「自动招聘决定尚未开放」——三句为 ④ 诚实形之佐证面，本刀断言其零触（机械门内联断言）。
- **②到达通道实锚更正**：lifecycle 对 unscored 回合发固定字面量 reason `evaluation_unscored`（`adaptive-lifecycle.ts:487`·不透传细分原因）——故 ② 用户可见固定处置文案落 web 提交口本地确定性拦截（InterviewPanel 警示区 role="alert"）+worker `invokeEvaluationOnce` 前扫拒评（pinned 落点 :164·沿既有 failed→unscored 释放链·零新联合成员）双半实现；life-cycle 事件面零触。

### 0.3 三项分歧/呈报如实登记（终裁建议呈报协调方）

1. **体量组标签分歧**：residual-plan :112 标 **S-M**；实测四件跨 api 闸（①begin/turn 双口）+worker 出题口（①②触发面）+web 文案三页（②③④）+jobs 流入口（④）——**M 如实登记**（S 收不下·沿 I5「组标签与实触面分歧如实呈报」先例）。四件一次收 vs 拆刀（①④码面较重可拆后刀）=裁决项⑤呈报。
2. **W9 ② 双登记**：EXECUTION-SOP :34 W9 职责行列「#234/#235/#239 口径文档（三态标注·D6 四件）」——I5 已执行 #234/#235 而 #239 明示零触（I5 卷 :126）。#239 整件由本刀收编·W9 ② 之 #239 口径文档职责由本刀实现面承接（D6 四件落面即口径文档面）——承接呈报协调方·LEDGER 归属刷新归 SSOT 刀·本刀零触 SSOT。
3. **「整域零实现」措辞收窄**：沿审计更正先例（kill-switch 一项过头更正同形）——域内 admin audit/保留枚举/legal 边界页三邻面在场（§0.1 定性）·修法面收窄为「D6 合规最低集四件零实现」·防「整域」措辞过头。

## §1 修法（四件·D6 已决按建议版本执行·逐字值=裁决项·file:line 实锚·EXEC 立项重 pin）

### ① 内容安全 kill-switch（修法列逐字：「内容安全 kill-switch」·D6 口径「可一键停用模型出题/对话」）

- env 静态读闸（形沿 `public-preview.ts:40` resolve 三态/HA-4 refuse-by-default 先例·闸名与缺省值=裁决项①·倾向缺省 off=现状字节零翻）+api begin/turn 双入口 fail-closed（`interview.service.ts:382-388` begin/`:392` turn 入口·触发即 503+诚实文案）+worker 模型出题口同闸（`adaptive-interview-service.ts` run 链/`interview-service.ts:164` invokeEvaluationOnce·双口或三口=裁决项①）——**平台级既有开关（runaway/写门/熔断/成本治理）语义字节零触**（§3-4）。

### ② 危机话术固定处置（D6 口径：「危机/自伤话术的固定处置文案与转介信息」）

- 确定性触发词表（词表=裁决项②）→ 固定处置文案+转介信息（web 渲染层 `InterviewPanel.tsx` 警示区 `:487`/`:572` 形·文案逐字=裁决项②·**转介信息措辞建议法务复核保留不阻塞**）——**不做 safety_hold 状态机、辱骂分级路由**（修法列原文「不做等重方案」·引入即越界 §3-1）。

### ③ 注册年龄声明（D6 口径：「注册时年龄声明（未满 18 岁不提供服务）」）

- `login/page.tsx` signup 区（`:42-52` 字段区·**行级避开 `:33-38` #263 内部预览标注面**）加年龄声明（声明文案 vs 必选勾选=裁决项③）；后端 signup 是否同步校验=裁决项③（最小集可仅声明层·校验层若收须同刀断言）。

### ④ B 端自动化决策说明+人工复核入口（D6 口径：「岗位面试的自动化决策说明与『要求人工复核/拒绝仅由自动化决定』的入口（PIPL 第 24 条）」）

- `jobs/page.tsx` 申请流程内披露文案+「要求人工复核/拒绝仅由自动化决定」入口（`:109-110` 表单区落点·入口形制=裁决项④：**静态受理入口 vs 真端点记账**——记账须新表=§3-9 闸外·倾向静态受理形）；`applications.service.ts:16` scoreless+人工复核既有语义零翻（披露文案如实引用该状态·**不虚称已有独立复核通道**·Ban 假称既有）。

## §2 验收断言候选（静态源+docs 断言+既有 prove 回归形制·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **①断言**：env 闸读取静态断言+begin/turn 双入口闸存在断言+worker 出题口闸断言（随裁决①落点）+**缺省 off 行为=现状字节断言**（基线 prove EXIT 原值对照）+闸触发 503 诚实文案断言。
2. **②断言**：触发词表+固定处置文案+转介信息三要素存在断言+「不做状态机」负断言（无新状态枚举/无新表/无新迁移）。
3. **③断言**：signup 区年龄声明落位静态断言（file:line 钉死）+`:33-38` #263 面 diff 零断言（行级零重叠兑现面）。
4. **④断言**：jobs 流披露文案+入口存在断言+`applications.service.ts` scoreless 语义零翻断言+「不虚称独立复核通道」措辞断言。
5. **邻面零触断言**：平台级开关（`adaptive-interview.ts:94` 注释块/`public-preview.ts`/熔断 failover 链）+隐私擦除域+admin audit diff 零断言。
6. **回归面随改随核**：web prove/typecheck/api 既有 prove 全 EXIT 原值·base 同红登记不洗（E5 流程·批前实测基线入收据）。
7. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **safety_hold 状态机/辱骂分级路由不收**（修法列原文「不做等重方案」·引入即越界）。
2. **#263 零触**（`login/page.tsx:33-38` 内部预览标注面·I5 裁决②挂起登记在案挂 #110/#218——**批3 残 2 另一件不预支不夹带**）。
3. **隐私擦除域零触**（unstub-erase `f9383f76` 面·privacy/resume DELETE/0152/0153 迁移链）。
4. **平台级开关语义零触**（`adaptive-interview.ts:94` runaway/`public-preview.ts` 写门/模型熔断 failover 链/成本治理 enforce——审计更正「不算此类」原文）。
5. **authz 5A 面零触**（在飞 37 文件·`interview-jobs.ts` 零触·§4）。
6. **admin audit 域/保留分类枚举/legal 边界页零触**（§0.1 邻面定性·非四件）。
7. **prompt-injection/jailbreak e2e 域零触**（uc-e2e-031-032 系 LLM 硬化测试非内容安全 kill-switch）。
8. **W9 ADR 本体+SSOT 零触**（LEDGER/checklist/issues-master 只读引用）。
9. **零迁移零新表**（④入口记账须新表=闸外停手上报·静态受理形为裁决④前置；①闸 env 读零 schema）。
10. **est live=0**：零模型真实外呼·零生产操作·零 secrets·零 SMTP。

## §4 依赖

**零未决硬依赖**。①D6 决策面已闭（issues-master :314 备注两级用户决策 2026-10-09：「只做合规最低集」+「按现有建议版本执行不再另出方案」）——修法两向中「域裁撤」向已被用户决议闭死·本刀只余实现向；②法务复核措辞=保留项**不阻塞开工**（硬依赖列原文）；③四件无跨件硬依赖·组内自洽。**闸关系**：I6 不闸任何刀（零下游件依赖 #239）·I6 不被任何未决刀闸（residual-plan :114 派序「其余按 LEDGER 执行序」·无前置锁）。**并发面**：authz 5A 在飞零文件交集（§0.0）；#263 `login/page.tsx` 同文件行级零重叠（`:33-38` vs `:42-52`·沿 I5-H5 先例）；I5 已并线（`InterviewPanel.tsx:20-21` #267 开关在场=I5 产物·②插入面 `:487`/`:572` 行区不重叠）；H5/EVID/HA 系已并线或域零交集。

## §5 Ban 列表 + pins（沿 I5 卷 §5 同源·逐字誊 + 本刀面增补）

**Ban 列表**（I5 卷 §5 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀零迁移·迁移冲动=停手上报）；Ban 触其他工作树（meetwise-authz/5e/entpay/blite/e2sc 零触）；Ban 伪造已问/已验来源（零机制现状不假称既有——**Ban 假称已有内容安全/危机处置/年龄门/复核通道既有设施（§0.1 四子面零实现实测）·④披露文案 Ban 虚称已有独立人工复核通道**）；**本刀增补**：Ban 引入 safety_hold 状态机/辱骂分级路由（§3-1）；Ban 触 #263 面（`login/page.tsx:33-38`·§3-2）；Ban 触隐私擦除域与公开 DELETE 链（§3-3）；Ban 翻平台级既有开关语义（runaway/写门/熔断/成本治理·§3-4）；Ban 触 authz 5A 在飞面与 `interview-jobs.ts`（§3-5）；Ban 弱化或虚化既有合规措辞（legal 边界页「不伪装完成」承诺语义零降级）；Ban 危机转介信息冒充正式医疗/心理服务承诺（固定文案+转介信息·法务复核保留项如实标注）；Ban 触 admin audit/保留枚举域（§3-6）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全静态/既有回归·零模型外呼·零消耗）

**pins 漂移如实登记（照抄不翻·supersession 行使权归协调方）**：unstub-erase `f9383f76`（协调方授权含 pin supersession·双审 BOTH PASS）已将 resume-data DELETE 改 202——现势 `privacy.service.ts:68-70` **interview-data DELETE 仍 503**（`interview_erasure_authorization_not_available` 实测）；十一值沿 authz-harden 批5 卷（c042729b 基线·晚于 unstub-erase）同源照抄先例零翻转。

## §6 est live=0

本刀零模型真实外呼：全部断言=静态源断言（`ln()/正则 .test(readSrc)` 先例形制）+既有 prove 回归；闸/文案/入口均静态与确定性面·零生产操作·零 secrets·零 SMTP·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草阶段恰 1 .md·`ai-docs/delivery/harness/i6-239-REQUEST.md`）五类标记词 grep 零命中（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 I3/I4/I5 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀起草阶段恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**随翻（2026-10-12·EXEC 落卷 @`7b6d0f38`）**：三条款已全部行使（双审 BOTH PASS+协调方派单即授权+§1/§5 零改 EXEC 重 pin 只更锚）·本节状态 `draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`**·上文原文照录零改。

**待双审/EXEC 裁决项**：①kill-switch 闸名/缺省值/落点（api begin+turn 双口 vs 加 worker 出题口三口·倾向缺省 off=现状字节）；②危机触发词表与固定处置文案+转介信息逐字值（转介信息法务复核保留标注形）；③年龄声明形制（声明文案 vs 必选勾选·后端 signup 是否同步校验）；④④入口形制（静态受理 vs 真端点记账·记账须新表=闸外）；⑤体量 M 呈报与四件一次收 vs 拆刀（①④ 码面较重可拆后刀）；⑥W9 ② #239 口径文档职责承接呈报（LEDGER 归属刷新归 SSOT 刀）；⑦法务复核保留项处理口径（保留不阻塞=issues-master 原文·EXEC 收据如实标注）。

### §8.1 七裁决项现裁记录（EXEC 落卷 2026-10-12·七值从 EXEC commit `7b6d0f38` message 誊入·收口席落卷）

1. **①kill-switch**：闸名 `MEETWISE_CONTENT_SAFETY_KILL_SWITCH`·缺省 off（现状字节零翻）·**裁决落点=begin/turn 双口**（api `interview.service.ts` begin/turn 双入口首行闸·触发即 503 诚实文案）。
2. **②危机固定处置**：触发词表+固定处置文案+转介信息·**不做状态机**（零新枚举零新表零迁移·纯函数确定性形）。
3. **③年龄声明**：声明文案形（非勾选·zh/en i18n 各恰 +1 行）·**后端 signup 零校验新增**（最小集声明层）。
4. **④入口形制**：**mailto 静态受理**（`mailto:privacy@meetwise.app`·人工受理·不虚称独立复核通道·零端点零新表）。
5. **⑤拆刀裁决**：不拆刀·**四件一次收**（体量 M 如实登记·14 文件跨 api/worker/domain/web）。
6. **⑥W9 ② 承接**：#239 口径文档职责由本刀实现面承接（LEDGER 归属刷新归 SSOT 刀·本刀零触 SSOT）。
7. **⑦法务复核保留两处标注**（如实落码面）：②转介文案=`packages/domain/src/crisis-disposition.ts:5-6`+`apps/web/lib/interview/crisis-disposition.ts:7-8`·④受理邮箱=`apps/web/app/jobs/page.tsx:93-95`（保留不阻塞·上线前确认）。

**四门收据补录**（收口席亲跑 2026-10-12·stdout 全落 `receipts/i6-239/`）：`node scripts/i6-239-gates.proof.mjs` 40 断言 ALL PASS EXIT=0（`i6-239-gates-proof.log`）·`npm run prove`（apps/web）427 PASS EXIT=0（`i6-239-web-prove.log`）·`npm run prove:uc003-i18n-locale` EXIT=0（`i6-239-web-prove-uc003-i18n-locale.log`）·`npm run prove:public-copy` 14/14·releaseEvidence=false 现场值·EXIT=0（`i6-239-web-prove-public-copy.log`）。

### §8.2 诚实性勘误（erratum·收口席 append-only 落卷 2026-10-12·不改史）

EXEC commit `7b6d0f38` message「执行期事件如实登记」段「其残件零采用零残留（…内容-safety 命名巧合系同题同解）」表述与 stash 物证相抵，如实更正登记（append-only·原文照录不擦改）：

- **`packages/domain/src/crisis-disposition.ts` 成立面更正**：stash@{0}（协调方 2026-10-12 13:59 保全·「i6-stray-exec-residue」）内同名件与落卷版**逐字节相同**（`cmp` EXIT=0 实测）——「残件零采用」与物证相抵，成立面更正为「**stash 幸存或采用两说并存·以逐字节同一为准如实登记**」。
- **「同题同解」成立面**（两处·均架构不同非同一文件）：①`apps/api/src/platform/content-safety.ts`——stash 版 32 行雏形 vs 落卷版 43 行实质重写；②`packages/domain/src/index.ts`——stash 版导出 `CONTENT_SAFETY_CRISIS_TERMS`/`detectCrisisTerms`/`CONTENT_SAFETY_CRISIS_HOLD_CODE`/`CONTENT_SAFETY_CRISIS_DISPOSAL_MESSAGE`（自 `./content-safety.ts`）vs 落卷版 `CRISIS_*` 导出（自 `./crisis-disposition.ts`）·架构不同。
- **stash 孤儿件归档**：`packages/domain/src/content-safety.ts`（stash 版 58 行单源成形版·未被落卷采用）已从 stash@{0}^3 提取归档至 `receipts/i6-239/stash-orphan-archive/content-safety.ts`（附 3 行 README 说明来源与处置）。

---

*I6 D6-COMPLIANCE REQUEST · 2026-10-12 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`8b8e20bc` · 分支 `line/i6-239` · 工作树 `meetwise-i6` · 蓝本=更正版 issues-master :314（原文/证据列/修法列/备注三级逐字）+ batch-residual-plan @`ab02d499` I6 行 `:112` 逐字（跨树非 tip 祖先如实登记）+ LEDGER :71/:211/:330 + TASK-SOP-v2 :72 + EXECUTION-SOP :34 + I3 :37/:116·I4 :31/:120·I5 :126 让渡界线 + 形制 i5-caliber rev2（本树在卷）· 收编恰 1 件=#239（D6 合规最低集四件：①内容安全 kill-switch ②危机话术固定处置+转介 ③注册年龄声明 ④B 端自动化决策说明+人工复核入口）· 整域零实现复核过（四子面现势 EXIT=1 零命中·近期刀 f9383f76/authz5A/dir-b2/I5 逐卷排查零顺带落面·平台级开关三处与审计更正口径一致）· 三邻面定性登记（admin audit/保留枚举/legal 边界页=非四件不收）· 三分歧呈报（体量 S-M→M 如实·W9 ② 双登记承接·「整域」措辞收窄）· #263 不预支（批3 残 2 另一件·挂起登记在案·login 行级零重叠）· D6 决策面已闭（域裁撤向被用户决议闭死·只余实现向）· §2 断言候选七条（静态源+负断言+回归 EXIT 原值）· §3 范围外十条·§4 零未决硬依赖零闸·Ban+pins 十一值照抄（unstub-erase supersession 漂移如实登记·照抄不翻）· est live=0 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual · **随翻 2026-10-12：EXEC 落卷 @`7b6d0f38` → `executed:awaiting_post_prove_dual`（§8 随翻·七裁决现裁记录 §8.1·诚实性勘误 §8.2「残件零采用」表述更正·四门收据 `receipts/i6-239/` 补录）***
