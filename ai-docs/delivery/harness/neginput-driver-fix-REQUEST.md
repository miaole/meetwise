# NEGINPUT REQUEST — neg:input 4 红 driver 回和+fixture 面补刀（探针重划·协调方采纳后立靶）

**draft_rev1:awaiting_pre_exec_dual · STOP · alone≠dual · Ban self-approve**

## §0 立靶依据（探针重划定谳 2026-10-07·协调方采纳=NEGRESFIX §6 归因链 `receipts/negresume-driver-fix/2026-10-07-exec-receipt.md:89-93`·finding 登记 :91）
godfn-1d 收据 `receipts/godfn-decompose/1d/2026-10-07-exec-receipt.md:81` 钉 `neg:input EXIT=1（4/135）base≡red 签名 IDENTICAL`；NEGRESFIX run2 全链实测 2/135（`receipts/negresume-driver-fix/run2-input-signature.txt:3-6`）→ 协调方裁决：lane=base≡red 族确认·4→2 签名漂移归因**上下文依赖**非他刀 diff（neg-input.proof.ts 自 `3c87bfa7` 创建后零变更史·区间产品码仅 godfn-1d/g7fix4 均不触 input 三面·已账不重推）。探针重划 4 红分类表（本席逐锚亲读实树·行号 awk 1-based 亲验）：

| # | 断言（亲读） | 期望 | 实际/根因（亲验链） | 修法 |
|---|---|---|---|---|
| 1 | :229 `inj:non-uuid-id/resume-delete`（is4xx） | 4xx | 503 `resume_erasure_migration_in_progress`——resume.service.ts:278-280 `remove(): never` 恒 503 不按存在性/uuid 合法性分叉（pins「公开 DELETE=503」·NEGRESFIX B2 同族已 nail @`5a46c2ae`） | 断言回和 503+error 码（§1 B1） |
| 2 | :216 `inj:sqli-in-status-query-nocrash`（noCrash） | <500 | 500=42883 undefined_function+缺列——interview.service.ts 列表投影 :535 `i.created_at`/:536 `i.job_title_snapshot`（migrations/0123:39-41 面）+:537 `i.resume_id`（migrations/0028:8 面）+:561-562 `interview_privacy_active(i.id)` 谓词（migrations/0058:31 面）·_neg-harness.ts:65-69 加载面仅 23 个 sql/ 基座+4 迁移（0037/0038/0039/0046）零预放 | suite 内 fixture shim（§1 B2①②③） |
| 3 | :267 `inj:xss-in-feedback-comment-nocrash`（noCrash） | <500 | 500=42883——interview.service.ts:476 `guardInterviewPrivacy`→:156 `assertInterviewPrivacyActive`→checkpoint-privacy.ts:25 `SELECT assert_interview_privacy_active($1)`（migrations/0058:63 函数缺·0059:30 消费面）·:151-162 catch 仅映射 `interview_privacy_fenced`→410 余 rethrow | 同 B2③（fence 函数面） |
| 4 | :268 `inj:xss-in-learning-topic-nocrash`（noCrash） | <500 | 同 #3——interview-learning.ts:44-48 `completeLearningItemFor` :46 guard=同守卫注入 | 同 B2③ |

**上下文依赖 finding（协调方 §6:91 登记·本刀收编）**：:267/:268 全链转绿机制=neg:all 六段序（package.json:47·interview 先于 input）neg-interview.proof.ts:99-126 godfn-1c shim 在同 run 共享隔离容器 `CREATE OR REPLACE` 同名 fence 函数→input 段传递供给；standalone（godfn-1d 协议）为红。本刀 suite 内 shim 后 standalone≡全链恒绿，上下文依赖本身消除。
**红集 1:1 可迁移论证**：探针 4 名分类与 godfn-1d :81 计数钉 4/135 1:1 对应；NEGRESFIX run2 机证 2 红名单恰=分类表 #1（:229）+#2（:216），#3#4（:267/:268）传递供给转绿与归因链自洽——红非新发、非产品回归，4 红全部=driver 期望漂移（#1）+fixture 环境缺口（#2-#4）·0 产品码改动需求。

## §1 范围（恰 1 文件）
`apps/api/test/neg-input.proof.ts` 唯一文件，两块：
- **B1 :229 断言回和 ×1**：`inj:non-uuid-id/resume-delete` is4xx → `status===503 ∧ body?.error==='resume_erasure_migration_in_progress'`（沿 NEGRESFIX B2 已 nail 形 @`5a46c2ae`·`resume.service.ts:278-280` 恒 fail-closed 不泄漏存在性；A() 名零改）。同行陈注「疑似 22P02→500」同步回和+文件尾 [BUG-2] 注记（:310-314）落勘误注记=**注释面非断言**（E1 先例）。对照面零触：:228/:230/:231 resume-profile 族仍 404（resume.service.ts:283 `UUID_RE` 兜底）·:233 reparse-caught-404 仍 404。
- **B2 :216/:267/:268 环境 shim ×3 面（断言零改·三条 noCrash A() 行 byte-identical）**：`boot()` 后断言前插 suite 内 fixture shim（neg-interview.proof.ts:24-31/:99-126 godfn-1c 已钉先例=**suite 文件内 shim·_neg-harness.ts 零触**·shim 内容亲读该区后按同构写·幂等可重入）：
  - ① **0123 面**：`ALTER TABLE interview ADD COLUMN IF NOT EXISTS job_title_snapshot text, created_at timestamptz`（镜像 migrations/0123:39-41·仅列面·不加 DEFAULT/回填——列表 `ORDER BY i.created_at DESC NULLS LAST` 容 NULL）；
  - ② **0028 面**：`ALTER TABLE interview ADD COLUMN IF NOT EXISTS resume_id uuid`（镜像 migrations/0028:8·`job_application.resume_id`〔0028:9〕不在三红路径=不加·最小 stub 原则沿 godfn-1c ①形）；
  - ③ **0058/0059 面**：`CREATE OR REPLACE FUNCTION interview_privacy_active(text)`+`assert_interview_privacy_active(text)`+`GRANT EXECUTE ... TO app_role` ×2（镜像 neg-interview.proof.ts:99-126 逐句形=migrations/0058:31/:63/:61/:76 最小函数面·0059:30 消费面仅需函数存在·trigger 零加）。
  判据：shim 后三条 noCrash **真绿非跳过**（:216 列表查询真执行 200/4xx·:267/:268 守卫真过 2xx 落库 question_feedback/learning_progress）·全链重入与 neg-interview 同名 shim 逐句同构=零漂移。

## §2 非范围
零产品码（apps/api/src 零 diff）·零 _neg-harness.ts（:65-69 加载面零触——缺口由 suite 内 shim 补·非 harness 全域面）·零迁移（packages/db 零 diff·0123/0028/0058/0059 仅镜像蓝本）·零其他测试文件（neg-interview.proof.ts 等零触）·零 runner/CI·零 G7 面（finalize/consent 契约零触）·CLAUDE.md SSOT 零触·**断言零弱化**——noCrash 三条断言文本零改（:216/:267/:268）+:229 回和=对齐已钉契约非弱化·其余 131 条 A() 位点逐字零变。

## §3 prove（恰 2 run·零 retry-to-green）
1. `neg:input` 单套件 run（隔离门·fresh 容器）：EXIT=0 **135/135**（分母 135 稳定·mkAssert 实印）；改前改后 PASS 名单 diff **恰 4 条**（:216/:229/:267/:268 四名 FAIL→PASS·名单 byte 稳定——base 4 红名单=探针定谳〔godfn-1d :81 计数级钉账未枚举名单·NEGRESFIX run2 机证 2 红子集同名互证〕·恰 2 run 纪律禁 base 复跑·导出式引用同 NEGRESFIX run1 先例）。
2. `neg:all` 全链 run（六段序 auth→commerce→resume→interview→bend→input·package.json:47）：**六段全绿 EXIT=0（原值如实记）**——auth 81+commerce 84+resume 87+interview 97+bend 120（前五段 counts 锚 NEGRESFIX @`5a46c2ae` run2 实证·resume 修复已在链）+input 135（本刀补段）；全链 EXIT=0 可达·**安全港退役**：本刀即清该 lane 之刀·任何段红（含前五段非 input locus）=§5 停手上报·无预存红豁免。
协议同 NEGRESFIX §2：两键均经 `node scripts/run-e2e-isolated.mjs <target>`（每 run 一次性 disposable pgvector 容器+按名单迁移预放·`--rm` 自拆·绝不触开发库）·首跑前置 `pnpm install --frozen-lockfile`·全离线本地 API·零真实模型外呼·est live=0·收据 `ai-docs/delivery/receipts/neginput-driver-fix/`（EXIT 原值+两 run wrapper 全文+input 段 PASS/FAIL 名单 `sort|uniq -c` 形+改前改后名单 diff 机证）。

## §4 纪律
Key name-only 零打印零落盘·.env* ABSENT·容器用后即焚·pins 十一值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false+脚注 actualSpendCny=null · 本刀≠trio 三绿≠g7SuiteGreen 翻转≠:107 关闭（三绿判定=CMD3 全套件重验另刀/协调方裁决）· Non-claims：fixture shim≠产品 schema 变化（disposable 容器内 additive-only·产品 sql/migrations 零触）·driver 回和≠产品行为变化（产品侧 resume.service.ts:278-280 起已钉 fail-closed·本刀仅让测试对齐现实）·上下文依赖 finding 收编≠独立三绿证据。

## §5 交付
commit author `git -c user.name=mw-neginput-draft -c user.email=mw-neginput-draft@meetwise.local`·diff numstat 恰 1 文件·§3 两键 EXIT 原值·收据清单·停止条件：**shim 后 :216/:267/:268 仍 500=停手上报禁改断言**（fixture 缺口定谳若不成立即重划·Ban self-approve）·锚点形状不符（:216/:229/:267/:268 或 neg-interview.proof.ts:24-31/:99-126 或 _neg-harness.ts:65-69 行号/形状漂移）=停手·需触范围外任何文件=停手·prove 红=停手·需 live 外呼=停手·harness 推进 exec:awaiting_post_prove_dual · 席 mw-neginput-draft。
