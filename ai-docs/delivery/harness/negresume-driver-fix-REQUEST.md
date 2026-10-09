# NEGRESFIX REQUEST — neg:resume 12 红 driver 断言面回和刀（协调方定谳后立靶）

**draft_rev1:awaiting_pre_exec_dual · STOP · alone≠dual · Ban self-approve**

## §0 立靶依据（协调方定谳 2026-10-09）
G7TRIO-2 CMD3 步 10 neg:resume 12/87 红，探针定谳 12/12=driver 期望形状漂移·0 产品回归（证据：同目录 negresume-driver-fix-probe.md 12 行分类表+时间线+同 run 步 9 绿反证）。红非新发（godfn-1d 已账 base≡red）。本刀=回和 driver 断言面至已钉 fail-closed 契约，零产品码。

## §1 范围（恰 1 文件）
`apps/api/test/neg-resume.proof.ts` 唯一文件，三断言块：
- **B1 图片同意门 ×2**（:46-48 现状 403/consent_required）：对齐实际门序=OCR 能力门 422 `image_ocr_unavailable` 先答（neg harness 钉 OCR_ENABLED='0'，_neg-harness.ts:49）。改法沿本文件 §11 降级臂先例（:309-312）：断言 `f.status===422 ∧ f.body?.error==='image_ocr_unavailable'`；**保留注释**「consent 硬门在图片路径存在且先于计费 reserve（resume.service.ts:96→:98）——本断言面当前被能力门先答，pin 计费前即拦意图不变」。
- **B2 DELETE /resume/:id 族 ×6**（:226-241 现状 404/200/幂等 404）：对齐恒 503 fail-closed（resume.service.ts:278-280 不按存在性分叉）：#3/:226 404→503+error==='resume_erasure_migration_in_progress'；#4/:227 not_found_or_forbidden→同 error 码；#5/:230 越权 404→503 同码（越权面由 validate.ts:548 已钉·此处注释指引）；#6/:238 200→503（前置断言改 fail-closed 形）；#7/:240 幂等 404→503 同码；#8/:241 同 #4。
- **B3 DELETE /privacy/resume-data 族 ×4**（:282-293 现状 200+三字段）：对齐 503（privacy.controller.ts:57-61 @HttpCode(503)）：#9/:283 200→503+error 码；#10/:284 resumesRemoved===0→断言 body.error==='resume_erasure_migration_in_progress'（旧形状字段断言随退疫退役）；#11/:285-286 与 #12/:287-288 DB 计数清除断言→改「503 后行数不变」式（种子行数前后相等，沿 validate.ts:556 形）。

## §2 非范围
零产品码（apps/api/src 零 diff）·零迁移·零其他测试文件·零 harness/runner 改动·零 G7 面（finalize/consent 已 nail 契约零触）·CLAUDE.md SSOT 零触·CI 零触。

## §3 prove（恰 2 run·零 retry-to-green）
1. `neg:resume` 单套件 run：EXIT=0 87/87（12 条改后全绿+其余 75 条零弱化——改前改后 PASS 名单 diff 仅此 12 条）。
2. `neg:all` 全链 run：EXIT=0（auth 81+commerce 84+resume 87 全绿）=CMD3 步 10 面修复实证，为 trio 重验三绿铺路。
全离线本地 API·零真实模型外呼·est live=0 模型调用·收据 `ai-docs/delivery/receipts/negresume-driver-fix/`（EXIT 原值+wrapper 全文+改前改后断言 diff）。

## §4 纪律
Key name-only 零打印零落盘·.env* ABSENT·容器用后即焚·pins 十一值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false+脚注 actualSpendCny=null · 本刀≠trio 三绿≠g7SuiteGreen 翻转≠:107 关闭（三绿判定=CMD3 全套件重验另刀/协调方裁决）· Non-claims：driver 回和≠产品行为变化（产品侧 3f5bdc80 起已钉 fail-closed，本刀仅让测试对齐现实）。

## §5 交付
commit author `git -c user.name=<agent> -c user.email=<agent>@meetwise.local`·diff numstat 恰 1 文件·§3 两键 EXIT 原值·收据清单·停止条件核查（锚点形状不符/需触范围外/prove 红即停手上报）·harness 推进 exec:awaiting_post_prove_dual · 席 mw-core。
