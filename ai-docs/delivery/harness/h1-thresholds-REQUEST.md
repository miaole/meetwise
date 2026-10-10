# H1 THRESHOLDS REQUEST（阈值决议刀 · 批2 派序首刀 · 解锁 H3 LEVEL-SCHEME）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·零码动·docs-only。EXEC/任何后续行使须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工）

**交付物**：`ai-docs/delivery/harness/h1-thresholds.md`（决议本体·数值立法·与本 REQUEST 同 commit 落卷）。

## §1 蓝本与上游（亲读）

- 蓝本：`batch-residual-plan.md:96` H1 行（`line/batch1-residual` @`ab02d499` 实树亲读）——「纯 docs 决议件·LEVEL-SCHEME 验收前置」。
- 上游审计：issues-master **更正版** #45(:332 五档+scheme_version+离线对比+规则把关)/#102(:339 三套规则四数值互不关联·阈值集中到版本化策略配置)/#104(:340)/#105(:471)/#124(:341)/#125(:472)/#38(:330 关联)。行号勘误：派单锚「:250 区」实为更正版 **:330-341** 区（:248-252 为鉴权条目·已核对）；「三套规则四阈值」措辞出 #102。
- 方案源：更正版 fix-roadmap 批2 §0(:82)/验收(:94-96)/**附录 A**(:199-214·rev2 行号勘误：原锚 :155-167 系 01-成品文档副本区=真实有向依赖章（本刀起草实读面·引文混抄发现见决议 §5 注记）；更正版副本标题无「摘要」二字·「…最终方案摘要」系 01-成品文档副本 :155 措辞)；refactor-backlog A.3.1-A.3.6/A.9（Lmin 取消·S≥30-unavailable 更正·单字段+版本号+离线对比）。

## §2 范围（docs-only·零码动）

1. 现状盘点：v1 阈值散点四枚 + 关联面八处，全部 `9f6edf8f` 实测 rg 重 pin（决议 §1 表·含 `career.ts:12/:16`·`page.tsx:31/:327`·`assessment.ts:16 GAP 已单源先例`·`interview.service.ts:725/:746-747`·`controller:234/:240`·`growth-generation.ts:84-86`·`0103:14-16,235,277`·`0100:57,102`·`adaptive-interview.ts:132-139`）。
2. 决议内容：五档统一阈值表（附录 A 全量数值采纳为 v2 决议初值·S≥50/65/75/85+L1 无下限）+ 辅助常数 R1-R9 + 规则把关表（Lmax 只压不抬）+ scheme_version 版本化协议（v1/v2·追加·superseded·回滚）+ 单一出处立法（运行时单源=level_policy_version 表·TS 镜像落 contracts 沿 CONSENT_PURPOSES:449 先例·附录 A' 冻结抄写面）+ 「样本不足不出级别」条款（附录 A 第 5 条原文全引+三条推论）+ 发布门数值（κ≥0.60/高估率≤5%/跨档错判率≤1%/L5 100% review_required/黄金集 ≥150 场每档 ≥20）+ facts 召回率初值 ≥0.70（样本简历集 ≥20 份·上游 :94 明文「阈值待决议确定」）+ 校准修订协议（§7 升版制）。
3. 任务书示例值披露：派单示例「<50 junior/<65 mid/<80 senior/<90 staff」与附录 A 不一致·任务书自载「按附录 A 方案」→ **取附录 A**（决议 §2 披露条）。
4. 上游行号勘误登记：更正版 #45 族实测 :330-341（决议 header 原文记录）。

## §3 落地边界（二择一·裁决与理由）

**裁决 B：本刀仅决议文档·常量固化（contracts 单源+三散点改读）归 H3 LEVEL-SCHEME EXEC。**
理由（详情决议 §8）：① 蓝本明文「纯 docs 决议件」；② A.3.2 数值系「提议初值·须校准后方成真值」+A.3.6「不稳定不得硬编码」——现在固化 contracts=上游禁止的硬编码且校准必改必生第二出处；③ 权威单源=A.4 `level_policy_version` 表（DB·发布后不可变），TS 常量形态依赖 H3 的 TS/DB 分工·现在立形必返工；④ 改读单源必触契约冻结产品文件（interview.service.ts:725 冻结面/page.tsx #125 面）·超 docs 刀授权。决议以 §4 附录 A' 冻结抄写面保障 H3 EXEC「照抄一次落对」·立法价值不因边界 B 受损。

## §4 Prove（pre-exec 双审核对单）

1. 零码动断言：`git diff --stat 9f6edf8f..HEAD` = 恰 2 个 .md 文件（本 REQUEST+决议）·apps/packages/scripts 零 diff。
2. 散点行号复现（EXEC 立项时重跑·期望命中）：
   `rg -n "overall >= 75" packages/domain/src/career.ts` → `12`；
   `rg -n "达标\(≥70\)" packages/domain/src/career.ts` → `16`；
   `rg -n "LEVEL_LABEL" apps/web/app/report/[id]/page.tsx` → `31,327`；
   `rg -n "export const GAP" packages/domain/src/assessment.ts` → `16`；
   `rg -n "对外契约冻结:成功体" apps/api/src/modules/interview/interview.service.ts` → `725`。
3. markers=0：本刀两文件全卷无未闭合占位/未完成标记（五类标记词 grep 门·命令留 prove 回执·卷内不复抄避免自匹配）。
4. est live=0（零模型外呼·零生产操作·零迁移）；Key name-only 不适用（无运行时）。
5. 上游原文核对：预审席对照 `~/Documents/Meetwise产品审计-更正版/issues-master.md:332,339` 与 **更正版** fix-roadmap `~/Documents/Meetwise产品审计-更正版/fix-roadmap.md:205` 附录 A 第 5 条逐字核对决议 §5 引文（rev2 副本统一具名锚·防复核误对 01-成品文档副本 :160 旧抄文·席2 复核已实证会翻车）。

## §5 Ban 列表

Ban 产品码触面（apps/packages src·migrations·CI·scripts 零 diff）；Ban 触其他工作树；Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§6 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist 行与统计只读引用）；Ban 把决议初值宣称为「最终真值/已校准」；Ban 宣称 #45/#102 已收口或 v2 已 active；Ban 预落 contracts 常量（边界 B·归 H3 EXEC）；Ban 金集/样本简历集「已建」叙事（均待建）。

## §6 pins（十一值照抄·零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

## §7 Non-claims

本刀 ≠ LEVEL-SCHEME 实施 ≠ #45 族收口 ≠ 发布门已通过 ≠ v2 operative。决议数值=初值立法（§7 升版协议可修订）；黄金集（≥150 场）与样本简历集（≥20 份）为规格非存量；facts 0.70 的评测器未建前不可作通过条件；更正版上游在仓库外·行号以决议 header 亲读记录为准；散点行号系 `9f6edf8f` 实测·base 漂移须重 pin。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 写完即停零码动；预执行双审两外席 PASS + meetwise 明示授权后，H3 LEVEL-SCHEME EXEC 方可依决议 §4/§5/§6 立项（其 EXEC REQUEST 照例重 pin 行号+迁移编号）。

---

*H1 THRESHOLDS EXEC REQUEST · 2026-10-10 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`9f6edf8f` · 分支 `line/h1-thresholds` · 工作树 `meetwise-h1` · 蓝本=batch-residual-plan.md:96 H1（@ab02d499）· 裁决=边界 B（仅决议文档·理由 §3）· pins 十一值照抄 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

*rev2 卫生声明：零数值改动——本 REQUEST §6 pins 十一值与决议 §2/§6 全部数值、§3/§4 协议、§8 裁决 B 一字不动；rev2 改动仅限引用保真窄面（§1 行号锚勘误/§4.5 核对指令副本具名化·注记承载）。*

*draft_rev2:pre_exec_dual（双席 FAIL 窄面处方 7 条落卷·副本统一=具名更正版·零数值改动·待复审确认后协调方行使 EXEC 授权）*
