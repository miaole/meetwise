# ANNOT-1 · jobs/page.tsx:110 注释收口小刀 · REQUEST（docs-only）

status: draft:awaiting_pre_exec_dual（REQUEST 就绪 · 预执行双审未做 · meetwise 未授权 EXEC · 本 commit 零产品码零注释改动）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base line 与 worktree 披露

- fetch 2026-10-07：`origin/feat/mysql-schema-skeleton` = `6006d2e8a7f2578e36e560e965157d2885c5d17d`（≥ 6006d2e8 达成；本地同名分支已 ff 至同点）。
- 本刀 worktree：`meetwise-line-annot`（仓库根同级新建）；分支 `line/jobs-refund-annotation-fix`（新立自 `origin/feat/mysql-schema-skeleton`，跟踪同名 upstream）。
- 全部 blob/行号锚均为 mw-core 在本 worktree 于 base 点以 `git ls-tree` / `git rev-parse` 亲算，非转录。

## 1. 缺陷面（REQUEST 必写①）

**码面锚**：`apps/web/app/jobs/page.tsx:110-111` @ base `6006d2e8` · blob `6912cd61015115cebab94ce43565d2784e21d3d9`（mode 100644）。原文两行：

```tsx
            // `assessment_unavailable` 是无可信分数且已退款的可恢复终态；重试必须显式由
            // 用户发起，服务端会创建新的 attempt，不会复活或覆盖旧会话。
```

该注释对 `assessment_unavailable` 终态一刀切宣示「已退款」。同 tip 码面两臂结算语义相反：

- **`evaluation_unscored` 臂（unscored > 0）**：`apps/worker/src/adaptive-lifecycle.ts:357-364`（blob `288eb311fc751d67b01e405fe6924c74dfb9f0dc`）走 `failInterviewAndRelease`（`packages/db/src/commerce.ts:198` → `releaseConsumption`）——预留额度释放，**「已退款」对该臂成立**。
- **`no_eligible_scored_answer` 臂（unscored = 0 ∧ eligible = 0，第三臂）**：`adaptive-lifecycle.ts:342-356` 走 `completeInterviewAndConfirm`（`commerce.ts:163` → `confirmConsumption`，unitsSettled）——**已扣费结算、不释放**；码面注释自证「The interaction is still completed and paid」（`adaptive-lifecycle.ts:343-345`），随后 `markApplicationNoEligibleScore`（`packages/db/src/recruiter.ts:265`）落 `assessment_unavailable` + event reason `no_eligible_scored_answer`（`adaptive-lifecycle.ts:355`）。**对该臂注释「已退款」为假话。**

**同假面的渲染层独立证据**（本刀 Ban 面，仅作缺陷定位引用）：`apps/web/lib/view-model.ts:67-68`（blob `71d1bd0d915558a2c0ed128e6cdaacb061471fba`）对 `assessment_unavailable` 不分 reason 一律渲染「本次预留额度已释放」。该 UI 文案缺口已由 G7V nail 登记 SSOT：`ai-docs/delivery/gap-bug-backlog.md:796-802` · **GAP-G7V-THIRDARM-COPY-SETTLEMENT · P1 OPEN**（2026-10-07 立行）；文案分臂修复属 `line/g7v-thirdarm-copy-fix` 线产物，本刀零操作。

**登记出处（越界面诚实收口 · G7V-FIX post-prove model-op 席记录在案）**：`line/g7v-thirdarm-copy-fix` 线文档——`ai-docs/delivery/harness/g7v-thirdarm-copy-fix.md:61,109`（Ban 顺手修 `jobs/page.tsx:110` 注释 · **登记为后续注释收口小刀候选（协调方队列 · rev2 保留观察项）**）、`ai-docs/delivery/g7v-thirdarm-copy-fix.slice.md:11,22`、`ai-docs/delivery/receipts/g7v-thirdarm-copy-fix/SUMMARY.md:37`。本 REQUEST 即该候选小刀的立卷。

## 2. 运行时影响核实（REQUEST 必写①附加 · 预期=纯注释零运行时影响 · 如实记录）

1. TS 注释编译期剥离，零运行时读取；`apps/web/app/jobs/` 目录无任何源码回读（`readFileSync`/`readFile` 零命中）。
2. 「已退款」全库检索：apps/web 应用码**仅此注释一处**命中；其余命中全在 ai-docs、`packages/db/src/interview-jobs.ts:131`（SQL 注释）、db/api 测试注释与用例名——无任何字符串字面量复用该文本。
3. 无测试锚定该文件行号或内容：`apps/web/test/web-logic.proof.ts` 零 `jobs/page` 引用；唯一直读该文件的是 `apps/web/test/public-copy.proof.mjs:53`（全文文本读，仅禁营销/署名词表，「已退款」不在任何禁表）——零命中。
4. 渲染文案为独立字面量：`jobs/page.tsx:27` `STATUS_LABEL.assessment_unavailable`「评分暂不可用（可重试）」与 `view-model.ts:68`，均与注释无共享；`:112` `startable` 读的是 `app.status` 非注释。

**结论（如实）**：影响面 = 诚实性/可维护性（码面文档假话误导后继维护者与审计），**非产品行为；零运行时影响成立**。

## 3. 修复面（EXEC 处方 · 本 REQUEST 不动码）

**恰一处**：仅 `apps/web/app/jobs/page.tsx:110-111` 两行注释 in-place 改写（2 行 → 2 行，零行移位，其余全文件零 diff）。处方文案（预执行双审可改字；语义须保持分臂如实或中性，Ban 再现「已退款」一刀切口径）：

```tsx
            // `assessment_unavailable` 是无可信分数的可恢复终态；额度处理以结算事件为准：
            // evaluation_unscored=预留已释放，no_eligible_scored_answer=已扣费结算（不释放）。重试必须显式由用户发起，服务端会创建新的 attempt，不会复活或覆盖旧会话。
```

文案约束：不含 URL / 绝对路径 / 署名词（PTP 与 public-copy 禁表）；不发明「报告就绪/额度已释放」假面；不改动 `:112` 起任何逻辑与任何渲染字符串。

**Ban**：碰 `view-model.ts` / `interview-state.ts`（G7V-FIX 线产物）；碰一切渲染字符串；碰 settlement/early-stop 产品码（`adaptive-lifecycle.ts` / `commerce.ts` / `recruiter.ts` / `recruiting-bound.spec.ts` / `web-logic.proof.ts`）；碰 backlog/checklist 等 SSOT 行与行统计（只读引用）。

## 4. Prove 计划（REQUEST 必写③ · 期望全 EXIT=0 · 一次优先 · Ban retry-to-green）

| 命令 | 期望 | 基线读数（2026-10-07 · 同树 6006d2e8） |
| --- | --- | --- |
| `pnpm -C apps/web prove`（主证 · 零行为变更佐证） | EXIT=0 | EXIT=0「✓ 全部通过」（主检出，tracked 内容与 worktree base 全等） |
| `pnpm -C apps/web prove:public-copy`（副证 · 注释在全文扫描面内） | EXIT=0 | EXIT=0（static_preflight_valid: selected=13/13; releaseEvidence=false） |

- **类型检查/lint 如实记录**：apps/web 与根 package.json 均无 lint/typecheck/tsc 轻量脚本（rg 亲证零命中），无可写命令；以上两证为门。
- **docs:check 预存红披露**：`node scripts/ai-docs/check-docs.mjs`（= `pnpm docs:check`）于干净 base `6006d2e8` 即 EXIT=1：`public_text_policy:PTP_FILE_LIMIT:3804`（MAX_FILES=2048 · `scripts/ai-docs/public-text-policy.mjs:253` · POLICY_VERSION=5）；主检出与干净 worktree 两读一致 = **base 预存红，与本刀无关，不在本刀范围**，Ban 借机翻 limit（共享策略面）；本刀不以其为门，Ban retry-to-green。
- pre-commit（`.githooks/pre-commit` = `check-staged-secrets.mjs`）：docs-only 预期通过。

## 5. Ban 列表（REQUEST 必写④）

Ban covered；Ban 翻 pin（文首 pins 原值，含 `g7SuiteGreen=false` · `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（`gap-bug-backlog.md` / `execution-master-checklist.md` 行与行统计只读引用）；Ban 自批（预执行/post-prove 双审均须 mw-e2e-ha + mw-model-op 独立席位）；Ban secrets；Ban retry-to-green；Ban 碰渲染字符串 / `view-model.ts` / `interview-state.ts` / settlement 与 early-stop 产品码（§3）；Ban covered 宣示（GAP-G7V-THIRDARM-COPY-SETTLEMENT 的 OPEN/CLOSE 状态归 nail，本刀零 backlog 操作）。

## 6. 流程声明（REQUEST 必写⑦）

REQUEST（本文）→ 预执行双审（mw-e2e-ha + mw-model-op · 空审 stub 见 §7）→ meetwise 授权 → coding+prove（恰一处注释 in-place + §4 两证）→ post-prove 双审 → meetwise 授权 nail。执行地：worktree `meetwise-line-annot` · 分支 `line/jobs-refund-annotation-fix`。

## 7. 交付物与本 commit

- `ai-docs/delivery/harness/annot1-jobs-refund-annotation.md`（本文）
- `ai-docs/delivery/annot1-jobs-refund-annotation.slice.md`（切片速览）
- `ai-docs/delivery/reviews/REQUEST-2026-10-08-annot1-mw-e2e-ha.md`（空审 stub · 待审席填写）
- `ai-docs/delivery/reviews/REQUEST-2026-10-08-annot1-mw-model-op.md`（空审 stub · 待审席填写）

本 commit = 上述四文件、零其他 diff；作者/提交者 `mw-core <mw-core@meetwise.local>`。

## 8. Not-a-pass 诚实尾条

Not a pass · not fixed · not coding · not proven（§4 为计划与基线读数，非本刀改后读数）· not third-arm closed · not UI 文案 closed（GAP-G7V-THIRDARM-COPY-SETTLEMENT P1 OPEN retained · 状态归 G7V 线与 nail）· not covered · not nail · not coordinator authorize · not 预执行双审 done · `g7SuiteGreen=false` · `actualSpendCny=null` · docs:check base 预存红（PTP_FILE_LIMIT:3804）retained 不因本刀洗绿 · alone ≠ dual
