# EXEC 收据 — G7V-CALIB · 仪器校准刀（`spec:232` 第三臂等待集=初稿 B 正向断言）· 2026-10-08

**Status**: **`executed:awaiting_post_prove_dual`**（单 attempt 主证 EXIT=0 全测绿 · 机检五强制全过 · STOP 等协调方派 post-prove 双审 · Ban self-nail · alone ≠ dual）
**授权链**: REQUEST `9e1f6c74`（rebase 后 `b0598772` · patch-id 不变）→ 预执行双审 BOTH PASS（mw-e2e-ha PASS endorse :238 or-面+Option-1 载体 · mw-model-op PASS 初稿 B 码面逐字节/双向逐字/无「为绿改断言」隐通道）→ 协调方 standing authorize（§3⑤）→ 本 EXEC
**Base**: rebase 硬门 EXIT=0（clean 1/1）· rebase 后 REQUEST commit=`b0598772e70fd98420f681438eeb62c31eff27e3`（其 parent=`cb89c23d` ≥ 派刀令 tip 要求 · 含 G7V-FIX 产品态与 ANNOT-1）
**EXEC commits**: coding=**`fa7ec1f2d28e21cfabe1c35e075a676657a82302`**（恰一文件 +3/−2）· receipts=本 commit · worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7vcalib` · branch `line/g7v-spec-calib-thirdarm`

## 1. 触碰面（恰一文件三处 · 双席 endorsed 形态）

`apps/web/e2e-ui/recruiting-bound.spec.ts`（diff blob 链 `2b232748`→`9f25566b400e8e816e724bf24e3a28f446367e8c` · +3/−2）：

1. `:62`（新增 · Option-1 载体）：`const NO_REPORT_ON_CHARGED_MSG = '面试已完成并扣费结算，但未获得可信评分，本次不生成报告。岗位面试可从“我的投递”重新开始；其他面试可新建一场。';`——**串=码面 blob 转写**（EXEC 期自 `view-model.ts:71` @`e19a843b` 程序化提取，Ban 手抄文档）。
2. `:233`（原 `:232` 等待集 · 合同主触碰面）：`Promise.any` 两面集→**三面集**：`[NO_REPORT_ON_CHARGED_MSG { exact: true }, REPORT_DOWN_MSG_PART, PRACTICE_FEEDBACK_PART]` · cap 120s 承旧——初稿 B exact 面新增，报告暂不可用/报告就绪两可达面保留（G7V-FIX EXEC chromium 对照=报告暂不可用臂可达实证）。
3. `:239`（原 `:238` else 期望 · 预申报伴生 · 控制流强制）：`REPORT_DOWN_MSG_PART).or(page.getByText(NO_REPORT_ON_CHARGED_MSG, { exact: true }))` 30s——else 分支承接第三臂+报告暂不可用臂两种落臂，两支各自 exact 锁定（mw-e2e-ha endorsed or-面形态）。

**行号位移如实注记**：const 插行使原 `:229-230`→**现 `:230-231`**、原 `:232`→`:233`、原 `:238`→`:239`（机检①按内容逐字节比对非裸行号）。

## 2. 机检五强制（全过 · 逐项亲算）

| # | 检查 | 结果 | 证据 |
|---|---|---|---|
| ① | spec diff 恰申报行 ∧ `:229-230` named 负向门零 diff | **PASS** | numstat 恰一文件 +3/−2；diff 仅三处（const 行/等待集行/or-面行）；`git show HEAD:…spec.ts` 行 229-230 vs working 行 230-231 `cmp` **byte-identical**（releasedCopyOnCharged 探测+toBe(false) 消息串逐字节同） |
| ② | 九面（六禁改+两触碰+InterviewPanel）+ jobs 旁证面 blob 链前=链后全等 | **PASS** | `view-model.ts`=`e19a843b` · `interview-state.ts`=`469826e5`（两触碰面定格）· `adaptive-lifecycle.ts`=`288eb311` · `commerce.ts`=`a64784e8` · `business-events.ts`=`b7e5ab3d`（全路径 `apps/web/lib/stream/business-events.ts`）· `recruiter.ts`=`d06b4f49` · `web-logic.proof.ts`=`ee9505f5`（全路径 `apps/web/test/web-logic.proof.ts`）· `InterviewPanel.tsx`=`ec9b3fe1` · `jobs/page.tsx`=`490f231d`——HEAD vs working `git hash-object` 逐面全等；**全卷 status 恰一文件改动** |
| ③ | 断言串==码面 blob 逐字节（渲染全文==定稿判据 · 码面 diff=0） | **PASS** | spec const 串 vs `view-model.ts:71` message 串 `cmp` **byte-diff=0**（166 字节含换行 · U+201C/U+201D 全角引号在案） |
| ④ | spec blob 链：`2b232748`→新 blob 恰申报变更 | **PASS** | `2b232748`→`9f25566b` · diff 恰 §1 三处（`git diff --numstat`=3/2 恰一文件） |
| ⑤ | HEAD SHA | **在卷** | 链前=`b0598772e70fd98420f681438eeb62c31eff27e3` · coding 后=`fa7ec1f2d28e21cfabe1c35e075a676657a82302` |

**收据自检修正披露（诚实申报）**：本收据 §1 第 1 处 const 行的文档转写在初稿中误用 ASCII 直引号（正是 REQUEST §4.3 所防的文档转写失真形态）——已程序化自 spec 实际字节回填修正；**spec 本体与已 commit 的 REQUEST 文档经同口径抽查字节干净**（harness 全角引号=2 · ASCII=0 · 判据=机检③ cmp 对码面 blob，非对文档）。

**旁证面 blob 漂移披露（上游 · 非本刀）**：`jobs/page.tsx` REQUEST 时引 `6912cd61`（G7V-FIX tip 值）→ rebase 后当 tip 为 `490f231d148780adf9ba546c5a5d0574207952ef`——系 **ANNOT-1**（`a67f11d8` nail / EXEC `9abdece6`）对 `:110-111` 的 2 行注释诚实化（comment-only 零行为 · 与本刀申报面零交叠 · 派刀令已预declare「含 ANNOT-1 均零交叠面」）。链前=链后（`490f231d` 双侧同值）机检不受影响。

## 3. 主证 CMD（恰好一次 · 单 attempt）

```bash
cd /Users/miaole/Desktop/golucky/meetwise-line-g7vcalib \
  && set -a && source ~/.meetwise-secrets/load-model-api-key.sh && set +a \
  && E2E_UI_GREP='C→B: real browser binds application' pnpm e2e:ui:isolated
```

- **EXIT=0 原值** · **2 passed（chromium 1.6m + mobile 1.3m · 3.0m）· 0 failed**（原始日志 `mainprove.raw.log` 在卷 · 32 行 runner 摘要 · 隔离 PG `meetwise-e2e-60925-1791431241089` · 142 migrations · production next start）
- **.env* ABSENT 逐向记录**（model-op 席微瑕补核）：prove 前 repo 根+`apps/web` 根 find=0；attempt 后 `envcount.txt`=**0**（在卷）
- Key：loader 进程环境 presence（name-only · 零值/零 fingerprint 入卷）；`actualSpendCny=null`（无计价数据源）；est ≤30 live（2×classify+2×旅程[早停族 ~4-5 回合]+报告 worker 结算项）≪200 硬帽——单 attempt 实跑即此口径，Ban invented 精确计数值

## 4. 落臂矩阵判读（如实 · 含读数盲区披露）

**结构性确证（EXIT=0 + spec 硬断言可推）**：双 project 均通过无条件早停锚（`:214` exact `EARLY_STOP_COPY` ≤90s）→ session_concluded/early_weak 双双落臂（脚本化弱旅程成立）；`:233` 三面集双双 ≤120s 命中（初稿 B/报告暂不可用/报告就绪三面之一渲染）；凡走 completed 路径 project `:230-231` named 负向门 PASS（释放词零出现）；finalize 200 + recruiter hold 块双 project PASS。

**读数盲区（如实申报 · Ban 冒充）**：**逐 project 精确落臂支（第三臂 vs 报告暂不可用 vs 报告就绪 vs 释放）无直接运行时读数**——绿 run 零失败工件（error-context 仅红 run 产出 · G7V-FIX 落臂读数即来自其红 run a11y 快照）；api/worker 进程 tail 为设计性 withheld（`tailAppend` 纯内存计数 · 绿 run 不落盘不回放）；隔离 PG 用后即焚。故矩阵①「第三臂落臂被行使」**未获直接读数确认**（Ban 冒充命中），矩阵⑤「双 project 均未落第三臂」**同样未获读数**（Ban 冒充全称 not-demonstrated）。

**处置（按纪律）**：本刀**仪器合同面已兑现**——EXIT=0 全测绿（单 attempt 一次过）+ 判别门三面集/or-面/负向门落码且机检全过；「第三臂落臂行使」子面按**读数缺失**如实升级协调方裁量（**Ban 追臂重跑**——是否需 instrumented 复核 run[如 E2E_VERBOSE 或红面探针] 归协调方派，非本刀自跑）。时序旁证（**不计为证据** · 仅存档）：chromium 1.6m / mobile 1.3m，双时长同 G7V 族量级。

## 5. Non-claims

Not nail · not covered · not trio green · not suite green（`g7SuiteGreen=false` 不翻）· not HA · not `releaseEvidence=true` · not backlog 行操作（G7V-CALIB P2 OPEN 状态行归协调方 nail）· not 逐 project 落臂定谳（读数盲区如实申报 · 升级协调方）· not「第三臂落臂行使」已证（①未获直接读数）· not retry-to-green（单 attempt EXIT=0 原值）· not 追臂重跑 · not SSOT 操作 · not pins 翻转 · **`actualSpendCny=null`** · .env* ABSENT · alone ≠ dual

---
*Receipt · G7V-CALIB EXEC · 2026-10-08 · 单 attempt EXIT=0 全测绿（2 passed · 3.0m）· 机检五强制全过（:230-231 named 门 byte-identical · 九面+jobs 旁证 blob 全等[490f231d=ANNOT-1 上游值如实披露] · 断言串==码面 diff=0 · spec 链 2b232748→9f25566b 恰三处 · HEAD SHA 双记）· 触碰面=恰一文件三处（:62 const 载体/:233 三面集/:239 or-面 · 双席 endorsed 形态）· .env* ABSENT 双向记录 · 落臂支读数盲区如实升级（Ban 追臂）· STOP 等协调方派 post-prove 双审 · STOP*
