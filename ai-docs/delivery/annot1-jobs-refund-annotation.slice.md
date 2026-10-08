# ANNOT-1 · jobs/page.tsx:110 注释收口小刀 · slice（REQUEST docs-only）

status: executed:awaiting_post_dual（预执行双审双 PASS · meetwise §3⑤ EXEC 授权 · EXEC 落注释改写+勘误:11→:14+收据 · STOP awaiting post dual）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

- **Base**：`origin/feat/mysql-schema-skeleton`=`6006d2e8a7f2578e36e560e965157d2885c5d17d`（2026-10-07 fetch · 本地分支已 ff 同点）；worktree `meetwise-line-annot` · 分支 `line/jobs-refund-annotation-fix`（新立）。
- **缺陷面**：`apps/web/app/jobs/page.tsx:110-111`（blob `6912cd61015115cebab94ce43565d2784e21d3d9` @ 6006d2e8）注释对 `assessment_unavailable` 一刀切宣示「已退款」——对第三臂 `no_eligible_scored_answer`（`adaptive-lifecycle.ts:342-356` · `completeInterviewAndConfirm`/`commerce.ts:163` · 已扣费结算不释放）为假话；对 `evaluation_unscored` 臂（`adaptive-lifecycle.ts:357-364` · `failInterviewAndRelease`/`commerce.ts:198` · 预留释放）成立。登记出处：G7V-FIX post-prove model-op 席（`line/g7v-thirdarm-copy-fix` 线 harness :61,109 / slice :14,22 / receipts SUMMARY :37 · 注释收口小刀候选·协调方队列 · EXEC 勘误 :11→:14 亲测复核）；渲染同假面已另立 SSOT GAP-G7V-THIRDARM-COPY-SETTLEMENT P1 OPEN（backlog :796-802 · 本刀零操作）。
- **运行时影响（如实）**：纯注释零运行时影响——编译期剥离、无字符串字面量复用、无测试行号锚（唯一直读 `public-copy.proof.mjs:53` 全文禁词表不含「已退款」）；影响面=诚实性/可维护性，非产品行为。
- **修复面（EXEC 处方）**：恰一处 · `jobs/page.tsx:110-111` 两行 in-place 改写（零行移位 · 其余全文件零 diff）：如实分臂口径「evaluation_unscored=预留已释放 / no_eligible_scored_answer=已扣费结算（不释放）/ 额度处理以结算事件为准」+ 保留重试语义原文。Ban 碰 `view-model.ts`/`interview-state.ts`（G7V-FIX 线产物）、渲染字符串、settlement/early-stop 产品码。
- **Prove**：`pnpm -C apps/web prove` 期望 EXIT=0（基线同树 EXIT=0 已读）+ `pnpm -C apps/web prove:public-copy` 期望 EXIT=0（基线同树 EXIT=0 已读）；类型检查/lint 轻量脚本库内不存在（rg 亲证）；docs:check base 预存红 `PTP_FILE_LIMIT:3804`（MAX_FILES=2048）retained 不为门、Ban 翻 limit。一次优先 · Ban retry-to-green。
- **Ban 列表**：Ban covered · Ban 翻 pin · Ban 改共享 SSOT（backlog/checklist 只读引用）· Ban 自批 · Ban secrets · Ban retry-to-green · Ban covered 宣示（GAP 状态归 nail）。
- **流程**：REQUEST → 预执行双审（mw-e2e-ha + mw-model-op · stub `reviews/REQUEST-2026-10-08-annot1-{mw-e2e-ha,mw-model-op}.md`）→ meetwise 授权 → coding+prove → post-prove 双审 → meetwise 授权 nail。
- **Not-a-pass**：not fixed · not coding · not proven · not third-arm closed · not covered · not nail · not coordinator authorize · `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual。详版见 `ai-docs/delivery/harness/annot1-jobs-refund-annotation.md`。
