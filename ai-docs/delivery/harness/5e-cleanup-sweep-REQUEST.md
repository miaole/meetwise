# 5E-CLEANUP-SWEEP REQUEST（5E 批量清理长尾刀 · W9 既定 · 批表盘点席 Wave D 14 行逐行定谳 · a 类核翻 9 件+剔除呈报 5 件 · docs-only 零码面 · 体量 S）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动零执行·本卷起草阶段恰 1 新增 .md=本卷·⛔push ⛔merge主线 · alone≠dual · Ban self-approve · est live=0）

**席位**：#5E 批量清理长尾 诊断+起草席（批表盘点席 Wave D · 北星 loop · W9 批量清理刀既定未开工之清点定稿+起草）。
**基线**：`feat/mysql-schema-skeleton` @ `397d037b`（主线最新 tip·fetch 后 `origin/feat/mysql-schema-skeleton` 同值亲证=tip≥最新·本席亲跑 `git fetch origin`+`git rev-parse` 双值恒等）。分支 `line/5e-cleanup-sweep`·工作树 `meetwise-5e`（`git worktree add ../meetwise-5e -b line/5e-cleanup-sweep` 本席已立·建前 `git worktree list` 实查该路径空闲·建后 tip `397d037b` 亲证）。
**蓝本**：①LEDGER `ai-docs/delivery/harness/product-campaign-LEDGER.md` `:89`（批表 5E 行·本卷 14 行载体=「#6/#21/#22/#28/#166/#170/#192/#212（仅清理面·文档标注面已随 I5 @388e5f7b 收口…）」组之 3 件 #21/#22/#28+行尾「/#39/#85/#63/#64/#65/#62/#101 部分/#1/#8/#12/#19/#130/#2/#5/#121 — 🆕 批量清理刀（W9）」组之 11 件）+:213（批5 水位 78/143·「+5E GROUP 批量收编 25 件（22 整件+#63/#39 两残面+#212 清理面）@eb5c3f09·对 HEAD `git merge-base --is-ancestor` 祖先亲证」在卷）/:216（合计 202/271·5E GROUP +25 已计件）②审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 逐行原文（#1 `:360`/#2 `:361`/#8 `:363`/#12 `:364`/#19 `:367`/#39 `:376`/#62 `:381`/#63 `:382`/#64 `:383`/#65 `:384`/#85 `:388`/#21 `:486`/#22 `:487`/#28 `:488`·外部只读蓝本）③邻卷=5E GROUP 卷 `5e-group-REQUEST.md`（§0.1 收编 25 件盘点表+§8.1 裁决①-⑫行使记录+收编 25 件=22 整件+#63/#39 两残面+#212 清理面·nail merge @`eb5c3f09` --no-ff 双亲 7500ac73+9d3e927f·post-prove 双席 BOTH PASS·详情 checklist「Line 5E GROUP nail」段）④LEDGER `:97` 执行序「批 5…→5E 批量（DIR-1 持续串行至 B2s+sweep）」=W9 批量清理刀既定排期⑤翻面形制先例=#132 wave81 补翻（:89 行内「本行枚举漏翻·沿『翻面载体不在原席任务书面』惯例补翻」）+2026-10-15 批表翻面笔（docs 收口席·协调方裁全翻·行内【】注记形）+批表增量同步席（2026-10-12·docs-only·恰台账 1 文件零码动）。

## §0 现状锚+清点定稿（Wave D 14 行逐行·三源对勘=issues-master 更正版逐行×LEDGER `:89` 载体词面×实树锚亲证 @`397d037b`）

### 0.0 已终局防重检查记录（强制项·起草席实跑）

- `ls ai-docs/delivery/harness/ | grep -i "cleanup|sweep"` → 唯一命中 `gap-uc017-load-sweep-nhp.md`（load 压测域·非清理域·零卷占有）·**无同名卷/无同域刀卷**（exit 判定亲证）。
- `git merge-base --is-ancestor eb5c3f09 HEAD` → **EXIT=0**（5E GROUP nail 已入本支线基线祖先·本席亲跑亲证）——a 类 9 件的收口证据链全部在主线祖先·零在飞依赖。
- LEDGER `:213`/:216` 计件行已入账 5E GROUP +25（含本卷 a 类 9 件）——本卷翻面=**+0 计件纯名目对账**（非计件笔·计件递推零涉）。
- 邻刀占有复核：5E GROUP 卷已 `closed`（其 Status 行 2026-10-15 翻面在卷）；本卷触面=LEDGER `:89` 单行名目注记·与 5E GROUP 卷 SSOT 只读 Ban 不冲突（本卷=专用名目对账卷·沿批表增量同步席/docs 收口席先例·专用翻面授权面）→ **停止条件未触发·可落卷**。

### 0.1 清点表（14 行逐行原文+现状核+分桶）

**a 类·已完成未翻面（9 件·核证据后翻面）**——统一收口证据=5E GROUP nail merge @`eb5c3f09`（--no-ff 双亲 `7500ac73`+`9d3e927f`·post-prove 双席 BOTH PASS·:213/:216 计件在账）对 HEAD `397d037b` `git merge-base --is-ancestor` **EXIT=0** 本席亲证；逐件实树注记锚 @`397d037b` 亲证在卷：

| 件 | issues-master 更正版（行号·原文要点） | LEDGER `:89` 载体词面 | 现状核（实树亲证锚） | 处置 |
|---|---|---|---|---|
| #62 | `:381` P3·Server Action 把 jobId/appId 直接拼进路径未编码 | W9 尾组 | `apps/web/app/jobs/actions.ts:13/:25/:56` 三处 `encodeURIComponent`+`:23` 注释「#62（5E 2026-10-12）路径内插 id 统一 encodeURIComponent」 | 翻面 |
| #63 | `:382` P3·saveSettingsAction 不看响应即 revalidate、lang 无白名单、改密 400 报错混 | W9 尾组（残面件） | `apps/web/app/settings/actions.ts:12-19` 注释「#63（5E 2026-10-12）残面修补…现补响应检查+响亮失败」+`:19` `if (!res.ok) throw new Error(偏好保存未受理…)`（白名单/改密面已随 I4 先闭） | 翻面 |
| #64 | `:383` P3·登录/注册表单只判非空、错误文案直拼后端错误码、fetch 无超时 | W9 尾组 | `apps/web/app/auth-actions.ts:14` 注记「撤销旧后端码直拼」+`AbortSignal.timeout` ×3 亲证 | 翻面 |
| #65 | `:384` P3·生产路由内置 E2E 压测数据源仅靠 env 开关 | W9 尾组 | `apps/web/app/api/interview/[id]/events/route.ts:19-21` 注记「【#65 裁决项⑤『移出生产构建』形·5E 2026-10-12】」+`apps/web/next.config.mjs:18` define `__E2E_UI_STRESS__` 构建期内联 | 翻面 |
| #85 | `:388` P3·资源 id 非法各模块错误码不一（404 vs 400）、UUID 正则三份各写 | W9 尾组 | `apps/api/src/platform/uuid.ts:1-9`「资源 id UUID 校验单源（#85 归一·5E 批量清理刀 2026-10-12）」+错误码语义表（两形两码刻意差异·零行为） | 翻面 |
| #39 | `:376` P3·budget_exhausted 死枚举 | W9 尾组（残面件） | `packages/domain/src/interview-control-signals.ts:24-26`「软预算语义（#39 如实注 2026-10-12）…`budget_exhausted` 保留=枚举/wire 兼容位」（5E GROUP §8.1 裁决⑨保留形落定=处置即闭） | 翻面 |
| #21 | `:486` P3 文档不符·commerce.ts 注释称「大余数法」实现是前 n-1 桶按比例舍入 | 仅清理面组 | `packages/db/src/commerce/commerce.ts:9-10` 头注「#21 勘误 2026-10-12：旧注『大余数法』与实现措辞不符——实现是尾桶吸收差额形」（零码动只改注释面落定） | 翻面 |
| #22 | `:487` P3 文档不符·0001 注释自相矛盾（下游 STUB 双注） | 仅清理面组 | `packages/db/src/commerce/commerce.ts:220`「【#6/#22 勘误 2026-10-12】0001_baseline.sql:125 旧注措辞已过时」（对侧勘误形落定·`packages/db/migrations/` 本体铁律零触·:213 计件在账） | 翻面 |
| #28 | `:488` P3 文档不符·ADR/footprint 仍写 BullMQ/pg-boss 实为 PG 表队列 | 仅清理面组 | `ai-docs/architecture/dependency-footprint.md:82/:87/:229/:338` 四处「#28 勘误 2026-10-12」+:99 nodemailer 连带勘误（I4 卷登记面顺手）在卷 | 翻面 |

**c 类·需另立/裁（5 件·剔除出本卷·零触）**：

| 件 | issues-master 更正版（行号·原文要点） | LEDGER `:89` 载体 | 现状核 | 处置 |
|---|---|---|---|---|
| #1 | `:360` P3 **第5批-C**·空闲放弃后 interview_question 仍 issued（cancelOpenInterviewQuestion 无生产调用方） | W9 尾组 | 全仓仅 `packages/db/src/index.ts:155` 导出+`interview-question.ts:139` 定义·生产调用方零命中（审计「仍存在」维持）——**码面行为件非清理件** | 剔除·归槽呈报 |
| #8 | `:363` P3 **第5批-C**·ai_graph_run 面试 completed 后 run 仍停 waiting_user 无终态写入方 | W9 尾组 | 行为/状态机面（0149:52-55+`interview-graph-lease.ts:83`·审计「部分修复」）——非清理件 | 剔除·归槽呈报 |
| #12 | `:364` P3 **第5批-C**·空闲回收路径 interview_unavailable 仍无 event_key 且不 cancel issued 题 | W9 尾组 | 现核=`commerce-reconcile.ts:84` appendEvent 无 key（`adaptive-lifecycle.ts:79`/`interview-consumer.ts:163` 已带 key=「部分修复」维持）——非清理件 | 剔除·归槽呈报 |
| #19 | `:367` P3 **第5批-C**·report_unavailable 与回收路径仍无 event_key（appendEvent 无 key 不去重） | W9 尾组 | 行为面（`report-worker.ts:68`·审计「部分修复·重复风险低」）——非清理件 | 剔除·归槽呈报 |
| #2 | `:361` P3 第5批-E·预留租约 1800s 只在 claim/心跳续期·用户思考>30 分钟被回收（**有意设计**） | W9 尾组+5E GROUP 簇E | 5E GROUP §8.1 裁决①「簇E 11 件不收编（呈报维持·零触）」在卷——修法=产品确认 30 分钟上限（产品决议件） | 剔除·维持呈报 |

### 0.2 分桶统计（三类定谳）

- **a 类 已完成未翻面=9**：#21/#22/#28/#39/#62/#63/#64/#65/#85（证据链齐·@`eb5c3f09` 祖先亲证 EXIT=0+逐件实树注记锚在卷+:213/:216 计件已在账）。
- **b 类 可批量清小件=0**：14 行内无未处置 docs 词面/残留小件——5E 清理面已被 5E GROUP 卷一卷收净（25 件@`eb5c3f09`）·本卷 14 行剩余实态=名目残行（a）+非清理域残行（c）。
- **c 类 需另立/裁=5**：#1/#8/#12/#19（issues-master 第5批-C 可靠性/运维/API·码面行为件·审计状态「仍存在/部分修复」）+#2（第5批-E 设计取舍件·5E GROUP 裁决①不收编呈报维持）。
- **a+b=9 ≥5 → 达起草线**·本卷成立。

### 0.3 漂移/出入如实登记

1. **LEDGER `:89` 行尾 W9 枚举与 :213/:216 计件行自不一致**：9 件（a 类）已于 2026-10-12 随 5E GROUP 收编入账（:213/:216 明记 +25 含 22 整件+#63/#39 两残面），但 `:89` 行尾仍列「/#39/#85/#63/#64/#65/#62/…— 🆕 批量清理刀（W9）」待清字面=枚举残行·**名目面滞后非计件出入**（+0 计件·沿 #132 wave81 补翻先例「本行枚举漏翻」同形）。
2. **同源残 token（不在本卷 14 行派单面·零触）**：仅清理面组之 #6/#166/#170/#192/#212+W9 尾组之 #130/#5/#101 部分/#121——同形对账归后继同形笔或 SSOT 刀·本卷如实登记不越面（#121 系 5E GROUP 簇D 收编件·#130 系簇E 呈报件·#5/#101 部分系第5批-C 跨登记·同 §0.3-1 形）。
3. **issues-master 归属勘明**：#1/#8/#12/#19 载体词面列于 5E W9 尾组，但 issues-master 更正版批次列=**第5批-C 可靠性/运维/API**（非第5批-E 文档/清理）·行为缺陷四件系 LEDGER `:88` 清单级跨登记出入之延续（5E GROUP §0.2 已登记该出入族 #1/#5/#8/#12/#19/#101=第5批-C）——本卷按 issues-master 更正版为组成权威（5E GROUP §0.3-2 同源口径）呈报剔除。

## §1 修法（逐件·docs-only 零码面·EXEC 立项重 pin·**码面零字节**）

### 簇A a 类 9 件·LEDGER `:89` 批表行枚举勘误翻面注记（本卷唯一触面·+0 计件）

- **形制**：`:89` 行内 append 注记（沿 #132 wave81 补翻+2026-10-15 批表翻面笔【】注记先例·原文前缀逐字保留零洗改·不改行头/不改他行/不改 :213/:216 计件行与统计）。
- **逐件注记（9 件一体一笔·逐件实锚引 §0.1 表）**：`#21/#22/#28/#39/#62/#63/#64/#65/#85 ✅（2026-10-16 批表盘点席 Wave D 核翻·5E GROUP nail merge @eb5c3f09 对 HEAD 祖先亲证 EXIT=0·:213/:216 已计在账·逐件实锚=5e-cleanup-sweep-REQUEST §0.1·+0 计件纯名目对账·计件行零触）`——插注位置=该行尾组 W9 枚举段内（EXEC 时点按行现文重 pin 漂移）。
- **翻面纪律**：涉引 hash 须 `git merge-base --is-ancestor` 对 EXEC 时点 HEAD 亲证 EXIT=0 后落笔（§2-G5）；Ban 写任何未经亲证的 ✅；Ban 触计件数/百分比/水位（+0 计件卷·递推面零涉）。

### 簇B c 类 5 件·剔除登记（零触·不 silently 落弃）

- **#1/#8/#12/#19**：剔除出本卷·归槽呈报=issues-master 第5批-C 可靠性/运维/API 行为面（#1 死函数接线或删的裁决件/#8 run 终态写入/#12/#19 event_key 补齐）——归 5C 域行为小刀或后继刀·**归协调方派单裁**·本卷零触码面（呈报面随 §1-簇A 注记同笔带一句剔除登记·零新增节）。
- **#2**：剔除·维持 5E GROUP §8.1 裁决①呈报面（产品确认 30 分钟上限·设计取舍件·零触）·同笔带登记。

## §2 门矩阵（EXEC 断言·docs-only 面·断言力≥3）

| # | 门 | 判据 |
|---|---|---|
| G1 | docs:check | `node scripts/ai-docs/check-docs.mjs` EXIT=0 且 managed files ≤cap 2184（起草基线 2175+本卷 1=2176·余量 8·本席起草时点亲跑 EXIT=0 在案·EXEC 时点复跑同判） |
| G2 | markers 五类标记词 | 改动集（本卷 .md+LEDGER 恰 1 .md）五类标记词+冲突标记零命中 **0/0**（词面运行时组装防自指·§7 同源·沿 i6-gates 门⑦形） |
| G3 | migrations 字节零触 | `git diff <base> -- packages/db/migrations` 空（0 行·沿 5E GROUP G1 形·checksum 铁律兑现面） |
| G4 | diff 面 | `git diff --numstat` 恰 1 tracked .md（LEDGER `:89` 单行行内 append 注记·零码面零迁移零他文件）·本卷 .md 系起草阶段既有新增不计 EXEC 工作面 |
| G5 | 受影响 prove 抽验 | 本卷零码面→码面 prove 零新增面；抽验三件=`git merge-base --is-ancestor eb5c3f09 HEAD` EXIT=0（翻面证据锚失效即红停）+G1+G2；`:89` 行号漂移则只更行号不改结论（沿 I3/I4/I5/5E GROUP 重 pin 先例） |
| G6 | est live=0 声明 | 零模型外呼·零生产操作·零 secrets·零 SMTP（收据逐门登记·pins 脚注 `actualSpendCny=null` 同源） |

## §3 范围外（边界清单·越界即 FAIL）

1. **码面零触**：`apps/`/`packages/`/`scripts/` 全域字节零改（docs-only 卷）。
2. **`packages/db/migrations/` 全目录字节零触**（checksum 铁律·G3）。
3. **c 类 5 件码面/文档零触**（#1/#8/#12/#19 行为面+第5批-C 归槽·#2 产品决议面·§1-簇B 呈报 only）。
4. **SSOT 触面恰一**：LEDGER `:89` 单行行内 append 注记外·LEDGER 其他行（:213/:216 计件行/刀位图/其他批表行）与 execution-master-checklist/TASK-SOP-v2/batch-residual-plan/issues-master **零触**；§0.3-2 同源残 token 9 token 零触。
5. **est live=0**：零模型真实外呼·零生产操作·零 secrets·零 SMTP。
6. **⛔push ⛔merge主线 ⛔force push**（nail/推送归后继席·协调方派单）。

## §4 依赖

**零未决硬依赖**：a 类 9 件收口证据链已全在主线祖先（@`eb5c3f09` 已 nail 并线·EXIT=0 亲证）·本卷=纯名目对账无前置。**并发面**：LEDGER `:89` 行系多刀共写热点行（历次行内翻面笔先例 6+ 次·冲突沿 append/union 解）——EXEC 立项照例 fetch 重 pin（`:89` 漂移只更行号·§2-G5）。

## §5 Ban 列表 + pins（沿 5E GROUP 卷 §5 同源誊录+本卷面增补）

**Ban 列表**：Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT 除本卷授权触面（LEDGER `:89` 单行 append 注记外·LEDGER 其他行/checklist/TASK-SOP-v2/batch-residual-plan/issues-master 零触）；Ban 触计件数/水位/百分比（+0 计件卷）；Ban 写未亲证翻面（涉引 hash 须 merge-base --is-ancestor 亲证后落笔）；Ban 触 c 类 5 件任何码面/文档面（呈报 only·不 silently 落弃）；Ban 迁移越权（`packages/db/migrations/` 全目录字节零触）；Ban 触其他工作树（worktree list 在册 47+ 树零触）；Ban 伪造已问/已验来源；Ban 弱化既有产品承诺或安全语义；Ban retry-to-green/masking/假绿叙事；Ban secrets/`.env*`（Key name-only）；Ban G7 面/车道/live 套件；Ban Meridian；Ban buy cloud。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本卷 prove 全静态/docs/git 亲证·零模型外呼·零消耗）

## §6 est live=0

本卷零模型真实外呼：全部断言=静态源/docs 静态断言+git 亲证（§2-G1~G6）；零生产操作·零 secrets·零 SMTP·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐门登记零外呼口径）。

## §7 markers=0（卫生声明）

本卷改动集（起草阶段恰 1 .md=`ai-docs/delivery/harness/5e-cleanup-sweep-REQUEST.md`）五类标记词 grep 零命中（起草席自检·命令与回执留 prove·五类标记词不复抄卷内避免自匹配·沿 5E GROUP/I3/I4/I5 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本卷起草阶段恰 1 新增 .md=本卷）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·漂移只更行号不改结论）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①c 类 5 件归槽呈报确认（#1/#8/#12/#19 归 5C 域行为小刀或后继刀·#2 归产品决议/簇E 呈报维持）；②`:89` 行注记形制（行内 append 沿 #132 先例=建议 vs 文末翻面笔节沿 2026-10-15 docs 收口席形）；③§0.3-2 同源残 token（不在 14 行派单面）同形对账时点与归属（后继笔 or SSOT 刀）；④EXEC 时点 `:89` 行号漂移重 pin 行使。

---

*5E-CLEANUP-SWEEP REQUEST · 2026-10-14 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`397d037b`（fetch 后 origin tip 同值亲证）· 分支 `line/5e-cleanup-sweep` · 工作树 `meetwise-5e` · 蓝本=LEDGER `:89`（14 行载体）+`:213`/:216`（计件在账）+`:97`（W9 排期）+ issues-master 更正版 14 行（:360/:361/:363/:364/:367/:376/:381/:382/:383/:384/:388/:486/:487/:488）+ 5E GROUP 卷（收编 25 件@`eb5c3f09`·§0.1/§8.1）· 分桶=**a 类已完成未翻面 9**（#21/#22/#28/#39/#62/#63/#64/#65/#85·@`eb5c3f09` 祖先亲证 EXIT=0+逐件实树注记锚在卷+计件已在账=+0 计件纯名目对账）/**b 类可批量清小件 0**/**c 类另立或裁 5**（#1/#8/#12/#19=第5批-C 行为面剔除归槽呈报+#2=设计取舍产品决议件剔除·零触不落弃）· a+b=9≥5 达起草线·修法=LEDGER `:89` 恰 1 行行内 append 翻面注记（簇A 一笔 9 件+簇B 剔除登记同笔·docs-only 零码面零迁移）· 门矩阵 G1-G6（docs:check≤cap 2184+markers 0/0+migrations 零触+diff 恰 1 .md+祖先锚复证+est live=0）· 防重检查过（harness 无同名卷·邻刀逐卷零占有）· est live=0 · pins 十一值照抄零翻 · markers=0 · ⛔push ⛔merge主线 ⛔force push · Ban self-approve · alone≠dual · Dual PASS ≠ 开工*
