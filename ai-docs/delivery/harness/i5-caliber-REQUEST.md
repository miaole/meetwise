# I5 CALIBER REQUEST（批3 段 · W9 口径三态标注+文案口径 · #225/#233/#234/#235/#212/#231/#262/#264/#267 九件 · S-M 体量）

**Status**: **`draft:awaiting_pre_exec_dual`**（**rev2 勘误落卷 2026-10-11·pre-exec 双审席1 PASS（4 登记含 1 必改）+席2 窄 FAIL（四钉处方）两席处方一次落卷·待复审**·起草席落卷 2026-10-11·本刀 docs+web 文案小改·起草阶段恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push） → **`executed:awaiting_post_prove_dual`**（**EXEC 落卷 2026-10-11·I5 口径刀 EXEC 席**：pre-exec 双审 BOTH PASS+rev2 勘误 @6ee4a869+复审 PASS 后协调方开工授权派单；九件全落（§1 八触面簇+三项预裁：#212 文档标注面归本刀/5E 只余清理面·#263 挂起零触·S-M 如实登记）·**裁决⑦落值=缺省显示**（语音按钮开关默认开·现状渲染保持·用户可经 `NEXT_PUBLIC_VOICE_MODE_ENTRY=off` 关闭→不渲染·`apps/web/lib/voice-mode-entry.ts` 纯前端静态·零后端零 API）·断言落 `apps/web/test/web-logic.proof.ts` I5-CALIBER 段 35 条 additive（prove 398 PASS=基线 363+35·基线零翻）·typecheck EXIT=0·public-copy/i18n-locale/middleware/interviews-actions/application-start-error 全 EXIT=0·voice-duplex spec 零改动天然绿核（缺省渲染=现状字节·spec 消费面 ：116 亲证在场）·markers=0·触面=7 docs+10 web 文件（超出派单申报 6+6 的 4 件均 §1 明列落点：GrowthChart/报告页=§1-⑤「成长曲线/报告 overall」·voice-mode-entry.ts=§1-⑧ 开关设施·web-logic.proof.ts=§2 断言宿主·如实申报）·零 api/worker/db·零迁移·SSOT 零触·pins 十一值零翻转·est live=0·check-docs PTP_FILE_LIMIT=base 同红登记不洗（`git ls-files --cached`=5206>2048·HEAD 既有）·⛔push）

**席位**：#批3 段 I5 组盘点起草席（北星 loop · 批3 残 20 之 I5 组 · W9 口径文档刀 · 先盘点后起草）。
**基线**：`feat/mysql-schema-skeleton` @ `fe55a2ab`（主线最新 tip·`git log -1` 实测 2026-10-11·批2/批3 水位终核勘误提交）。分支 `line/i5-group`·工作树 `meetwise-i5`（`git worktree add ../meetwise-i5 -b line/i5-group` 本起草席已立·建前 `git worktree list` 实查不存在）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 候选九件+挂起一件（#225=:306/#233=:309/#235=:310/#212=:497/#231=:520/#262=:297/#263=:513/#264=:439/#267=:514/#234=:453·原文+修法列逐字誊录见 §0.1）②分组蓝本=batch-residual-plan @`ab02d499`「批3 残余 → 6 组」表 I5 行 `:111`（**逐字**：「| I5 | **W9 口径文档刀** | #225/#234/#212/#233/#235/#262/#263/#264/#267/#231 | 三态标注（已实现/仅设计/有意关闭）+抽查清单（29 条 bend UC×状态）+分数口径命名——纯 docs | **S** |」）③LEDGER `product-campaign-LEDGER.md` :210 批3 段（3/23·残 20·I5 余 10 件）+:59（#213 归 W9 补登）/:70/:72（W9 行四件+文案口径行四件·rev2 勘误：批3 表 :69 现 I4 邀请行）/:88（#212 列 5E 文档/清理·双登记如实呈报 §0.3）/:296（批3 终核：I5 仅 #213 载体面闭·W9 ADR 未扩至本组其余件）④**W9 口径方法论 SSOT**=`ai-docs/delivery/adr-diag-disposition-w9.md`（**coordinator-approved** 2026-10-11·三态披露+分层升格——本刀只**引用其口径**应用于其余文档面·**本体零触**·§3-2）⑤界线衔接=I3 卷 `i3-job-mgmt-REQUEST.md` :35/:114 留置注记（I3 收 #219/#220/#258/#197·I5 族枚举恰 8 件缺 #212/#231——分歧源如实登记 §0.3）⑥形制沿 `i4-invite-face-REQUEST.md` rev2（**跨树引用如实登记：i4 卷在 `meetwise-i4` 树 @`080dc6a5`·不在本树**·行号引用以 i4 树卷面为准·本刀不代重 pin·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `fe55a2ab`·file:line 逐条 rg/sed 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 已终局防重检查记录（强制项）

- `rg -l "I5|i5-group" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md`（base `fe55a2ab` 实跑）→ 命中 **4 件**逐一核验：①`product-campaign-LEDGER.md`（:210/:296）——本组**派单登记面**（组级行·非终局 REQUEST 卷·本刀即其立项载体）；②`r4-p-planner.md`:63 ③`r4-real-wire-impl.md`:50 ④`r2-classify-job-route.md`:31——三处均为各卷表行 **I5 阶段标签**（第 5 阶段行标·与 i4 卷 §0.0 同三文件同位错一行）子串撞车·非本卷。
- `execution-master-checklist.md` 十件编号 `#(225|233|234|235|212|231|262|263|264|267)` **零命中**（exit=1 实测）；`REMAINING-NORTH-STAR-QUEUE.md`/`PARALLEL-DISPATCH-2026-10-02.md` 同零命中。
- harness/ **无同名卷**（无任何 `i5-*` 文件·ls 全表实测）。
- **邻刀占有逐卷复核**：I3 卷 :35/:114=留置注记（「#225/#233/#234/#235/#262-264/#267→I5」「bend-recruiting.md 规格文档不随本刀改（归 I5）」——**明示让渡本刀**）；i2-b 卷 :79=零触注记；QP 卷（#200/#201/#270）§3 明示「押题生成链零触」；H5 在飞卷（`line/h5-role-input` @`e54fc551`）收 #230/#266/#268——#230 押题 target-role 输入面与 #231 文案面不同件；W9 ADR=方法论 SSOT 非占有卷。→ **停止条件未触发·可落卷**。

### 0.1 盘点总表（十件逐件·已解决?/归槽判定·双表对勘=batch-residual-plan :111 I5 行十件×LEDGER :210 残 20 十件×LEDGER :70/:72 批3 表八件）

| 件 | issues-master（行号·原文要点·修法列逐字） | 已解决? | 实树判定锚（`fe55a2ab` 实测） | 归槽 |
|---|---|---|---|---|
| #225 | :306 P2 用例偏差·文档「B 端文档过期/互相矛盾：bend-recruiting.md 头部 status: active…UC-AIIV-005 写 completed+0–100 分与 0082 恒 scoreless 冲突；product-readiness 审计已被代码推翻；vision『物理隔离』与同库 RLS 不符」修法列「文档标注『已实现/仅设计/有意关闭』三态并下调 status」 | **开放** | `bend-recruiting.md:8` `status: active` 未下调；`:4` frontmatter「29 UC / 141 TC」vs `:18` 免责块「整套 28 UC 未全部落地」错位仍在；`vision.md:73`「**物理隔离、永不互通**」措辞仍在（同库 RLS 事实≠物理隔离）；UC-AIIV-005 `:608`/TC `:637-640` 与 0082 语义冲突面待勘；`:18` 免责块（2026-07 对齐块）已有域级披露——**逐 UC 三态与 status 下调未做** | **I5 收**（W9 三态主件） |
| #233 | :309 P2 用例偏差·开始面试「面试形态整域（UC-MODE-01~21…）无任何实现，POST /interview 无参数，计费固定 1.0」修法列「文档降级为目标态，或按产品排期实现」 | **大头已收·低残** | `interview-modality.md:8` `status: draft`+`:22`「本文是 TARGET 规格（frontmatter status=draft）」+域级 ✅/🟠/⬜ 对齐块（2026-07）——修法列「文档降级为目标态」**文档侧主句已满足**；残余=逐 UC（UC-MODE-01~21）三态颗粒度+「按产品排期」标注缺 | **I5 收**（随抽查清单顺手·低残） |
| #235 | :310 P2 用例偏差·注册/登录「认证面与文档不符：UC-AUTH-01~09 描述微信扫码/unionid/刷新令牌，代码只有邮箱+密码…」修法列「文档标注『当前=邮箱密码』；登出吊销见 #112」 | **大头已收·低残** | `cend-identity-account.md:18` 🔎 块已写「**当前登录为邮箱+密码**，无微信/OAuth」（2026-07 对齐块）——修法列主句**已满足**；残余=frontmatter `:8` `status: active` 未下调+UC-AUTH-01~09 逐条三态标注；#112（登出吊销）**不收**（另册·§3-6） | **I5 收**（随三态标注·低残） |
| #212 | :497 P3 文档不符「设计文档与代码两头不符：langgraph-blueprint 说 career-path『尚无图文件』且有 7 节点图（代码仅 1 节点）；roadmap 说成长档案/学习计划/能力曲线『❌未建』（代码在，只是无触发）」修法列「两份文档改为『已实现未接线（见 #204）』」 | **开放** | `langgraph-blueprint.md:37`「⬜ **未建**：**Graph 3 职业路径分析（career-path）尚无对应图文件**」+`:171`「## Graph 3…（⬜ 计划态，尚无图实现）」——与实存 `packages/ai-graphs/src/career-path.ts`（4186 字节·`git log` 唯一提交 `0a3c8a8a`「GAP-UC004-FI3 Candidate A graph-wrap derive」**已落主线**）直接矛盾；`roadmap.md:59-65` Phase 4 五行仍 ❌未建（`:61` 成长档案括注「记忆模块已建未接线」为半步）；**LEDGER :88 另列 #212 于「5E 文档/清理（38）」行——双登记如实呈报（§0.3）** | **I5 收**（文档标注面·5E 归属呈报协调方） |
| #231 | :520 P4 用例偏差·传简历「押题的『可能追问』是前端用本题 refs 拼装的模板（非模型生成），且无置信度字段；dashboard『标考察点与追问』中『追问』略夸大」修法列「文案改为『考察点 + 备战提示』；如要真追问再让模型产出」 | **开放** | `QuizPanel.tsx:86`「可能追问：就「{q.refs.join('、')}」追问原理、权衡与踩坑…」仍在（`:83` 注释自称「UI 派生的备战提示」——自我认知与用户文案不一致）；`dashboard/page.tsx:34`「押题预测…标考察点与追问」仍在；refs 拼装机制本体零触（§1-⑦） | **I5 收**（UI 文案小改·**非纯 docs 如实登记**） |
| #262 | :297 P2 产品偏差「同一『分数/题数』多来源口径：面试中=模型 hint；报告 overall=ScoreCard 均值；Dashboard avg=score_card 全局均值；成长曲线=assessment_report.overall；『已答题数』=题目账本」修法列「统一命名与来源：『面试中提示分/本场报告分/近期平均』」 | **开放** | `dashboard/page.tsx:82` avgScore 环+`:85` 标签「练习反馈」（非修法列命名）；`growth/page.tsx:103` ScoreRing label="最新"+`:105`「最新综合分」；四处口径命名未按修法列统一——**I5 锚点线索第三件「分数口径命名」即此** | **I5 收**（文案+来源标注） |
| #263 | :513 P4 产品偏差·B端-发岗位「公开页面仍提供招聘方注册入口（已标『内部预览』，口径一致）…是否保留取决于 D4」修法列「（D4 已决保留）入口保留；注册改审核/邀请制（#110）；B 端最小闭环交付后更新『内部预览』标注」 | **决策面已闭·动作面挂起** | `login/page.tsx:35`「招聘方（内部预览）」tab+`:38-40` 警示段在（口径一致·审计更正确认「矛盾不成立」）；D4 已决保留=决策面闭；动作面两半均**外部依赖**：注册审核/邀请制=#110（B110 EXEC✅ post-dual 收口中·LEDGER :64）、「内部预览」标注更新挂 B 端最小闭环（#218 I2 EXEC 在飞·未收）交付后 | **转挂起登记**（非 I5 可独立闭·§0.3/§3-1） |
| #264 | :439 P3 产品偏差「首页/功能页『承重点』是工程话术（『写入有双记』『关键路径有本地 prove 门』），统计卡为单词（追问/续场/核对/复盘），对求职者不构成价值陈述」修法列「改为用户结果语言」 | **开放** | `zh.json:37-44` stat 卡四单词（追问/续场/核对/复盘）+`:60`「关键路径有本地 prove 门。打开页面不算验收。」+`:63`「写入有双记」全在；`page.tsx:119-131` arch 区渲染原样 | **I5 收**（首页文案重写） |
| #267 | :514 P4 产品偏差·面试中「面试页『语音模式』按钮不看能力开关常驻显示，未配置时只靠失败回落文字（各处语音口径本身一致）」修法列「按能力开关显示语音入口」 | **开放** | `InterviewPanel.tsx:377-383` 语音模式按钮（`:378` `onClick={() => setMode('voice')}`）**无任何能力开关判定直渲染**；前端 `apps/web` 能力开关（`voiceGate|VOICE_ENABLED`）零命中属实（rg 实测 EXIT=1）——红面成立·**UI 显示开关本体不存在**=裁决项（§1-⑧）；后端 `interview.service.ts:337` 同名 `private voiceGate`=**服务端限流/回落闸**（`:513/:530/:541` 调用·`interview-voice.ts:24/:43/:54` 注释链·`production-backlog.md:112` 已接线）**非 UI 显示开关·两机制勿混**；失败回落文案（`:379` title）已在 | **I5 收**（小码改·**非纯 docs 如实登记**） |
| #234 | :453 P3 用例偏差·文档「作答辅助、3D 数字人、兑换码三域代码零命中；use-cases 索引未显式标注这 7 块『仅设计、未落代码』…读者易误读为已实现（规格缺口）」修法列「索引标注『仅设计』」 | **开放** | `use-cases/README.md:112-114` 索引三行（作答辅助 `answer-assist.md`/3D 数字人 `avatar-3d.md`/兑换码 `redemption.md`）无「仅设计」标注；`:117` §4「三者齐备方可生成生产代码」自认未落（审计更正：非矛盾·是易误读） | **I5 收**（索引三行小标） |

### 0.2 漂移登记（issues-master 证据列旧锚 vs `fe55a2ab` 实测）

| 旧锚 | 现锚（实测）·漂移主因 |
|---|---|
| #267 `InterviewPanel.tsx:320-326` | `:377-383`——G3 EXEC `541a8f20`（+7 行）/G4 EXEC `b70d7d81`（+11 行）触 InterviewPanel 为主因 |
| #231 `QuizPanel.tsx:78,85-87` | `:78`（考察点 span 零漂）+`:83-87`（追问块微漂·文案在 `:86`） |
| #231 `quiz/page.tsx:43` | EXEC 时重 pin——**H5 在飞** `e54fc551` 已触 `quiz/page.tsx`（+4 行·target-role 面） |
| #262 `dashboard/page.tsx:56` | `:82-88`（审计 2026-10-09 更正已记·本席亲证 `:82`/:85） |
| #262 `growth/page.tsx:109` | `:103-105`（ScoreRing/「最新综合分」） |
| #264 `zh.json:38-45,58-64` | `:37-44`（stat 卡）/`:58-66`（arch 区·`prove 门`=:60·`写入有双记`=:63） |
| #234 `README.md:117-124` | 索引行实锚 `:112-114`（`:117` 现=「## 4. 落代码前置条件」标题） |
| #225 `bend-recruiting.md:22→:18` | 审计更正已记·本席亲证 `:8` status/`:4` description 29UC/`:18` 免责块 28UC |
| #212 `blueprint:37,171`/`roadmap:59-65` | **零漂亲证**（career-path 矛盾两锚行号与审计一致） |
| #263 `login/page.tsx:35-39` | `:35`（tab·rev2 勘误）/`:38-40`（微漂） |
| issues-master 十行 `:297/:306/:309/:310/:439/:453/:497/:513/:514/:520` | **零漂亲证**（审计更正版现行卷面） |
| **rev2 勘误（pre-exec 双审锚更正·2026-10-11 亲证）** | cend 披露块 :17→**:18**·interview-modality TARGET :18→**:22**·LEDGER 批3 表 :69-:70→**:70/:72**（:69 现 I4 邀请行）·login tab :36→**:35**·UC 计数断言按各文实锚形制钉死：bend `rg -c "^### UC-"`=29（**UC 标题实为 ### 非 ##**·席2 给定 `^## UC-` 实测=0）·interview-modality `^## UC-`=21·cend `^## UC-AUTH-`=9（cend 全文 `^## UC-`=46 系 ACCT/AUTH/CONSENT/ENT/ONB/PAY 六族合计） |

**重 pin 免责**：本节锚为起草席 base `fe55a2ab` 一次性亲读；EXEC 立项/双审照例全量重 pin，漂移只更行号不改结论（I4 卷 §0.2/i3 卷同款先例）。

### 0.3 三项分歧/挂起如实登记（终裁建议呈报协调方）

1. **#212 双登记**：LEDGER :88 列 #212 于「5E 文档/清理（38）」批量清理刀行；batch-residual-plan :111 与 LEDGER :210/:296 列 #212 于 I5 十件——两登记并存。I3 卷 :35/:114 的 I5 族枚举恰 8 件（缺 #212/#231）系沿 LEDGER 批3 表 :70/:72 口径（该两行亦只列 8 件·rev2 勘误锚）。**终裁建议**：#212 的**文档标注面**（blueprint/roadmap「已实现未接线」两处）归本刀（与 #225/#234 同域同方法论·触面零重叠）；5E 批量清理刀若另立则 #212 对其只剩一般清理面·不重复收。**协调方裁决后 LEDGER 归属行由 SSOT 刀刷新·本刀零触 SSOT**。
2. **#263 转挂起**：决策面（D4 保留）已闭、动作面两半全外部依赖（#110 收口/#218 I2 交付）。**终裁建议**：不收编·转挂起登记，触发条件=B 端最小闭环（#218）nail 后由协调方重排（半行文案改·任何在飞 web 刀可顺手收或独立微刀）。
3. **「纯 docs」组标签与实触面分歧**：residual-plan :111 标「纯 docs·S」；实测十件中 4 件（#231/#262/#264/#267）触 `apps/web` 码面（文案/标签/前端开关），#267 且需**引入开关设施**（现前端 UI 开关零基建·后端 `interview.service.ts:337` 同名 `voiceGate` 系限流闸勿混·§0.1）。体量按 S-M 登记如实呈报；本刀 §1 已按「docs 为主+web 文案小改+一处前端开关」收窄，§3-7 钉死后端零触。

## §1 修法（八触面簇·修法列逐条固化·file:line 实锚·EXEC 立项重 pin）

### ① B 端文档三态标注+status 下调面（#225 修法列逐字：「文档标注『已实现/仅设计/有意关闭』三态并下调 status」）

- `bend-recruiting.md` frontmatter `status: active`→下调（倾向 `draft`·裁决项①）；三态逐 UC 标注沿 W9 ADR 口径（**已实现/仅设计/有意关闭**·引用 `adr-diag-disposition-w9.md` Decision 表形制·**ADR 本体零触**）。
- 计数勘误：`:4`「29 UC / 141 TC」为准·`:18`「28 UC」随之勘误；UC-AIIV-005 与 UC-AIIV-0082 评分语义冲突面=标注层勘误（二文互洽·**规格 case 结构与七类 TC 矩阵零改写**·§3-4）。
- `vision.md:73`「物理隔离、永不互通」→改为与同库 RLS 事实一致的措辞（倾向「数据隔离（同库行级 RLS）/永不互通」形·逐字值=裁决项②）；**隔离强度语义零降级**——措辞对齐事实·承诺本体（不互通/不用于筛人/不出卖数据）逐字保留。

### ② use-cases 索引「仅设计」标注面（#234 修法列逐字：「索引标注『仅设计』」）

- `use-cases/README.md:112-114` 三行（作答辅助/3D 数字人/兑换码）各加「（仅设计·未落代码）」类标注（逐字值=裁决项③）；索引其余行零触。

### ③ blueprint/roadmap「已实现未接线」勘误面（#212 修法列逐字：「两份文档改为『已实现未接线（见 #204）』」）

- `langgraph-blueprint.md:37`「尚无对应图文件」→「已实现未接线（`packages/ai-graphs/src/career-path.ts`·见 #204）」形；`:171` Graph 3 标题「⬜ 计划态，尚无图实现」同步勘误；`roadmap.md:59-65` Phase 4 各行按实态勘误（职业路径分析=已实现未接线；成长档案/学习计划/能力曲线按 `:61` 既有半步表述对齐）——**只改状态标注·蓝图图/正文规格零改写**。

### ④ 逐 UC 三态标注+抽查清单面（#233/#235 残面+I5 锚点线索「抽查清单（29 条 bend UC×状态）」）

- `interview-modality.md` UC-MODE-01~21、`cend-identity-account.md` UC-AUTH-01~09 逐条加三态标注（已实现/仅设计/有意关闭·域级 2026-07 对齐块保留为导语）；两文件 frontmatter `status` 下调（`cend-identity-account.md:8` 现 active）。
- **抽查清单**：bend-recruiting 29 条 UC×三态状态清单表（落本卷 EXEC 产物或独立清单文档·形制=裁决项④·倾向附于 `bend-recruiting.md` 头部对齐块后）。

### ⑤ 分数口径命名统一面（#262 修法列逐字：「统一命名与来源：『面试中提示分/本场报告分/近期平均』」）

- `dashboard/page.tsx:85`「练习反馈」→「近期平均（面试中提示分/本场报告分的口径说明）」形；`growth/page.tsx:105`「最新综合分」、成长曲线、报告 overall 标签按修法列三元命名对齐——**命名与来源标注统一·ScoreRing 组件语义与取数链零触**（§3-7）；逐字文案=裁决项⑤。

### ⑥ 首页文案用户语言面（#264 修法列逐字：「改为用户结果语言」）

- `zh.json:37-44` stat 卡（追问/续场/核对/复盘）与 `:58-66` arch 区（「写入有双记」「关键路径有本地 prove 门」「打开页面不算验收」）改写为用户结果语言——**承诺语义零降级零虚化**（工程事实改述·不删承诺·逐字文案=裁决项⑥·en.json 同步面=裁决项附项）；`page.tsx` 结构零触。

### ⑦ 押题「备战提示」文案面（#231 修法列逐字：「文案改为『考察点 + 备战提示』；如要真追问再让模型产出」）

- `QuizPanel.tsx:86`「可能追问：…」→「备战提示：…」形；`:83` 注释与文案对齐；`dashboard/page.tsx:34`「标考察点与追问」→「标考察点与备战提示」形——**refs 拼装机制与数据链字节零触**（只改字面量·§3-7）；「模型产出真追问」半句**不收**（§3-5）。

### ⑧ 语音按钮能力开关面（#267 修法列逐字：「按能力开关显示语音入口」）

- 最小形：`InterviewPanel.tsx:377-383` 按钮包前端静态能力开关判定——开关源=裁决项⑦（倾向 env `NEXT_PUBLIC_*` 静态读·**缺省行为=裁决项**·倾向缺省显示维持现状+开关关闭时隐藏·或缺省隐藏 fail-closed 二选一由协调方裁）；**零后端零 API 零新基建**（前端 apps/web 开关零命中如实登记·后端 `interview.service.ts:337` 同名 `voiceGate` 系限流/回落闸勿混·§0.1）；失败回落文案（`:379`）零触。

## §2 验收断言候选（web 静态源断言+docs 静态断言形制·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **#225 断言**：`bend-recruiting.md` frontmatter `status` 非 active 断言；全卷「28 UC」零残留且「29 UC」计数自洽断言（rg 计数）；`vision.md` 「物理隔离」字面量零残留断言（替换措辞含 RLS 事实表述）；UC-AIIV-005/0082 二文评分语义互洽静态断言（随裁决①勘误落点·**0082 第二文 rev2 增钉**：migration `packages/db/migrations/0082_b_side_score_calibration_hold.sql`+`application-assessment-terminal.md:19/:47/:68`+`adr/0020-scorecard-authority-and-eligibility.md:24`·bend-recruiting 勘误落点 `:608`/TC `:637-640`）。
2. **#234 断言**：`README.md` 索引三行各含「仅设计」标注静态断言（三行逐一）。
3. **#212 断言**：`blueprint.md` career-path 行含「已实现未接线」且「尚无对应图文件」零残留断言+实路径引用存在断言；`roadmap.md` Phase 4 职业路径行同步勘误断言；两文互洽（引用 #204 一致）。
4. **#233/#235 断言**：两文件逐 UC 三态标注存在断言（计数断言 rev2 按各文实锚形制钉死：interview-modality `rg -c "^## UC-"`=21·cend `rg -c "^## UC-AUTH-"`=9·三态值域封闭集断言）；`cend-identity-account.md` status 下调断言；`cend-identity-account.md:18` 既有「邮箱+密码」披露块零回归。
5. **抽查清单断言**：29 条 bend UC×状态清单存在·计数=29 断言（rev2 实测形制：`rg -c "^### UC-" bend-recruiting.md`=29·**bend UC 标题实为 ### 非 ##**）·三态值域封闭断言。
6. **#262 断言**：修法列三元命名（面试中提示分/本场报告分/近期平均）在 dashboard/growth 标签落位静态断言；旧孤立口径标签（「练习反馈」独立语义）按裁决⑤落点断言。
7. **#264 断言**：「写入有双记」「prove 门」工程话术 `zh.json` 零残留断言+替换文案承诺语义保留断言（裁决⑥逐字值 pin）。
8. **#231 断言**：「可能追问」全仓零残留断言（`QuizPanel.tsx`/`dashboard/page.tsx`）+「备战提示」落位断言**钉死 file:line（`dashboard/page.tsx:34`+`QuizPanel.tsx:86` 行形·rev2 增钉：防 `QuizPanel.tsx:83` 注释含「备战提示」自匹配恒真）**+refs 拼装代码块 diff 零断言（`rg -n "可能追问" apps/web` EXIT=1 形）。
9. **#267 断言**：「开关关闭→不渲染」恒断言+「缺省行为」断言**随裁决⑦分支落值**（缺省显示→缺省渲染断言·缺省隐藏→缺省不渲染断言·rev2 参数化·消捆绑写死与裁决⑦冲突）+开关开启渲染断言+`:379` 回落文案零触断言。
10. **回归面随改随核**：`apps/web` 既有 prove（web-logic/public-copy 形制）+typecheck 全 EXIT 原值·base 同红登记不洗（E5 流程·批前实测基线入收据）；docs 面 `check-docs.mjs`（README §4 引用·若入门禁）EXIT 原值。
11. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **#263 不收**（§0.3-2 转挂起·D4 决策面已闭·动作面挂 #110/#218——`login/page.tsx` 零触）。
2. **W9 ADR 本体零触**：`adr-diag-disposition-w9.md` 系 coordinator-approved 决议 SSOT——本刀只**引用**其三态口径与 Decision 表形制；任何「统一处置」动议=新产品决议+新刀（ADR Consequences 原文）；supersede 不经本卷。
3. **诊断/面试硬闸与退款链零触**：`interview-service.ts` 硬闸/`diagnosis-consumer.ts` 退款链/`resume-diagnosis.ts` 歪曲门语义字节零动（ADR 行为零改声明承袭）。
4. **UC 规格语义零改写**：三态标注/status 下调/计数勘误/冲突面标注=标注层操作；七类 case 结构、TC 矩阵、验收阈值本体零改（#225 修法列「三态标注」原意即标注非重写）。
5. **#231 修法列后半不收**：「如要真追问再让模型产出」=模型能力排期面（归 5E/AI 质量面后继）——本刀只做文案诚实化。
6. **#112 登出吊销不收**（#235 修法列「见 #112」系指针非收编·另册）。
7. **后端/API/迁移零触**：本刀零 `apps/api`/`apps/worker`/`packages/db`/contracts 码动·零迁移；#267 仅 `apps/web` 前端静态开关。
8. **H5 在飞面零重叠纪律**：H5 `e54fc551` 已触 `dashboard/page.tsx`（QUICK_ACTIONS `:38` 加 /roles 行）与 `quiz/page.tsx`（+4 行）——本刀 #231 改 `dashboard` `:34` 行内文案与 `QuizPanel.tsx`·**行级零重叠**；EXEC 立项时 H5 若已并线则照新树重 pin·若仍在飞照 G4 例登记并行。
9. **E2E 场景面归矩阵刀**（I4 卷 §3-5 同形制）：本刀 prove 只认静态源/docs 断言+web 既有 prove 回归（§2 形制）·零新增 Playwright 场景。**消费面增钉（rev2·席2 钉2·席2 单记 §3-8·实测 E2E 项=本条 §3-9·照实落位）**：既有 `apps/web/e2e-ui/voice-duplex.spec.ts` 语音模式按钮消费面 `:116`（toBeVisible）+`:182/:213/:270`（click）——#267 按钮改条件渲染后「缺省隐藏」分支翻该 e2e 全文件；裁决⑦连带钉 e2e 处置两选一呈报：**缺省显示→spec 天然绿；缺省隐藏→e2e env 置开关 on 入收据·或 spec 适配入本刀 scope**（二选一协调方裁）。
10. **est live=0**：零模型真实外呼·零生产操作·零 secrets·零 SMTP。

## §4 依赖

**零未决硬依赖**。①W9 口径方法论 SSOT 已 `coordinator-approved`（`adr-diag-disposition-w9.md` Status 行 2026-10-11 亲读）——三态口径引用面就绪；②#204 已闭（H4 行🔒·LEDGER 批2 表）——#212 标注引用无阻塞；③#233/#235 修法主句已由 2026-07 对齐块满足——本刀只补颗粒度·零前置；④H2 已落线（`8231b05c`）——种子题库实态与 #233 部分接线表述对齐基础在。**并发面**：与 I4（recruiter/settings 域）零文件交集；与 H5 在飞照 §3-8 行级零重叠登记（`dashboard/page.tsx` 同文件不同行·`quiz/page.tsx` 本刀零触该文件）；与 I2/I3/I6 零交集；docs 五文件（bend-recruiting/README/interview-modality/cend-identity-account/blueprint/roadmap）无在飞刀触（I3 卷 :114 明示不触 bend-recruiting）。

## §5 Ban 列表 + pins（沿 I4 卷 §5 同源·逐字誊 + 本刀面增补）

**Ban 列表**（I4 卷 §5 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀零迁移·迁移冲动=停手上报）；Ban 触其他工作树（meetwise-i3/i4/i2/entpay/ptp/h2q/h5/e2ar 零触）；Ban 伪造已问/已验来源（零机制现状不假称既有——**前端 UI 开关设施不存在如实引用 §0.1·Ban 假称既有 UI 能力开关（后端 `interview.service.ts:337` 同名 `voiceGate` 系限流/回落闸·非显示开关·勿混）**）；**本刀增补**：Ban 触 `adr-diag-disposition-w9.md` 本体（coordinator-approved SSOT·引用零改·§3-2）；Ban 触诊断/面试硬闸与退款链（§3-3）；Ban 改写 UC 规格 case 结构/TC 矩阵/验收阈值（只加标注·§3-4）；Ban 弱化或虚化既有产品承诺措辞（#264 改述=对齐事实不删承诺·#225 vision 隔离承诺本体逐字保留）；Ban 触 ScoreRing 组件语义与分数取数链（#262 只改标签文案·§3-7）；Ban 触 QuizPanel refs 拼装机制与押题生成链（#231 只改字面量·QP 卷「押题生成链零触」承袭）；Ban 引入后端能力开关/API/新基建（#267 仅前端静态·§3-7）；Ban 触 `login/page.tsx`（#263 挂起·§3-1）；Ban 触 H5 在飞行（QUICK_ACTIONS `:38` 行与 quiz target-role 面·§3-8）；Ban planner/评分/sticky 路由语义触碰（本刀零相关）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全静态/docs·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：全部断言=docs 静态断言+web 静态源断言（`ln()/正则 .test(readSrc)` 先例形制）+既有 prove 回归；零生产操作·零 secrets·零 SMTP·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草阶段恰 1 .md·`ai-docs/delivery/harness/i5-caliber-REQUEST.md`）五类标记词 grep 零命中（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 I3/I4 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀起草阶段恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①#225 status 下调目标值（倾向 `draft`）；②vision.md 隔离措辞逐字值（倾向「数据隔离（同库行级 RLS）/永不互通」形·承诺本体零动）；③#234 索引标注逐字值（倾向「（仅设计·未落代码）」）；④抽查清单形制与落点（倾向附 `bend-recruiting.md` 头部对齐块后·29 行表）；⑤#262 三元命名逐字文案与四落点分配（dashboard/growth/成长曲线/报告 overall）；⑥#264 替换文案逐字值（stat 四卡+arch 三处·en.json 同步面）；⑦#267 开关源与缺省行为（倾向 env `NEXT_PUBLIC_*` 静态读·缺省显示维持现状 vs 缺省隐藏 fail-closed 二选一·**rev2 连带钉 e2e 处置两选一呈报**：voice-duplex.spec 消费面缺省显示→天然绿/缺省隐藏→env 置 on 入收据或 spec 适配入本刀 scope·§3-9）；⑧#212 归槽终裁呈报（本刀收文档标注面·5E 只余清理面·LEDGER 归属行刷新归 SSOT 刀）；⑨#263 挂起登记措辞与触发点（#218 nail 后重排）。

---

*I5 CALIBER REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`fe55a2ab` · 分支 `line/i5-group` · 工作树 `meetwise-i5` · 蓝本=更正版 issues-master 九件+挂起一件（#225=:306/#233=:309/#235=:310/#212=:497/#231=:520/#262=:297/#263=:513/#264=:439/#267=:514/#234=:453 原文/修法列逐字）+ batch-residual-plan @`ab02d499` I5 行 `:111` 逐字 + LEDGER :59/:70/:72/:88/:210/:296 + W9 ADR `adr-diag-disposition-w9.md`（coordinator-approved·口径引用面·本体零触）+ I3 卷 :35/:114 留置界线 + 形制 i4-invite-face rev2（跨树 @`080dc6a5`·Ban/pins 同源誊录）· 收编九件=#225/#233（低残）/#234/#235（低残）/#212/#231/#262/#264/#267 · 挂起=#263（D4 已决·挂 #110/#218）· 已闭核销=零整件（#233/#235 大面子闭登记·#213 系批2 不在本组）· 双登记呈报=#212（LEDGER :88 5E 行）· 组标签分歧呈报=「纯 docs S」→实触 web 文案+一处前端开关·S-M · 防重检查过（三处 I5 阶段标签子串撞车+LEDGER 组登记面·checklist 零命中·无同名卷·邻刀逐卷复核零占有）· rev2 勘误 2026-10-11（pre-exec 双审席1 PASS 4 登记含 1 必改+席2 窄 FAIL 四钉+锚漂更正一次落卷·待复审）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
