# E2EFAIL-1 — full.e2e.ts emitE2EFailure 断链修复刀（BUG-E2E-FAILUNIMPORT · G7X ②面 erratum · 附判别 run）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `9130509e` · worktree `meetwise-line-g7drv` · 分支 `line/g7-driver-assert` · 立项依据 = 协调方码面三重实证（2026-10-08）。

## 1. 三重码面实证（协调方亲读 · 供双席复核）
1. **G7X ②面定谳误判**：`e2e/full.e2e.ts:201-203` 断言三合取项恒 True——①`trustedBSideScore === null` 与 `forgedScores === 'none'` 为 `e2e/helpers/interview.ts:235-236` **字面量硬编码**返回；②`identities.length === questions + clarifications` 恒等（provenance 终扫 :374 输入=mainLoop `seen` :309，identities 计 question_ready+clarification_needed 双 kind :210，questions :311 与 clarifications :342 分别同 kind 同源计数，无跳过分支）。**G7X 收据漏读 `+ clarifications`**（读成 identities(5)===questions(3)）——C-MO-P3「断言恒 False」定谳失效登记 erratum（G7X ①面 ai_report 烧尽钟定谳系 sidecar 时间线实证·不受影响）。
2. **断链炸弹**：`full.e2e.ts:14` import 仅 `{ createE2EReviewLedger, emitClassifiedE2EFailure }`，`:205` 却调用 `emitE2EFailure`（存在于 `e2e/helpers/failure-class.mjs:233` 并经 failure.ts re-export）——**未导入 → ReferenceError → uncaught throw → A() 兜底 class='api' EXIT=1**。时序与 G7X T-1 观察（~12s 静默后 uncaught throw·40363ms）相容。
3. **存活根因 = e2e/ 零静态门**：root tsconfig 仅路径别名无 include；e2e/ 无自有 tsconfig；`emitE2EFailure` 断链（TS2304 级）无任何 tsc/lint 程序可抓。`INTERVIEW_TERMINAL_DEADLINE_MS=420_000`（interview.ts:6）排除「deadline 超时→terminal=''」简单路径（40s run ≪ 420s）——**触发条件需判别 run 实证**。

## 2. 修法（最小两件套）
- **A（断链修复）**：`full.e2e.ts:14` import 列表补 `emitE2EFailure`（一行·零其他产品码）。
- **B（防复发门）**：`scripts/e2e-static-guards.mjs` 扩展一条机检——full.e2e.ts 调用的 `./helpers/failure.ts` 导出名必须全部出现在其 import 列表（静态文本级即可·失败 EXIT=1）——或等价最小静态门（EXEC 按现有先例选形态·禁引入新依赖）。

## 3. 判别 run（单跑 · 预注册三向判读 · Ban retry-to-green）
修复+门绿后跑 `pnpm e2e:isolated`（CMD1 主旅程）恰一次：
- **绿** ⇒ 断链即 CMD1 api 红根因 ⇒ CMD1 首绿 ⇒ G7 三绿线 CMD1 段收敛 ⇒ `:107` 收口材料之一；
- **worker 红** ⇒ honest 上报链通（terminal 超时面浮出）⇒ 真红面=报告终态语义 ⇒ 归刀②（弱输入 report 预期面校准·G7X 已立项）；
- **api 红 unchanged** ⇒ 断链非该 run 触发点 ⇒ 红因另寻（stderr 诊断输出入手）⇒ 如实上报协调方。
三向判读均如实入收据，禁洗绿禁重跑至绿。

## 4. Ban
禁触 `:201-203` 断言语义（恒 True 无需修·provenance 反伪造功能零弱化）· 禁改 helpers/failure.ts 及 failure-class.mjs · 禁触 INTERVIEW_TERMINALS 集合 · 禁 retry-to-green · 判别 run 恰一次 · pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）· 实现不自批 · alone≠dual · Key 只经进程 env name-only。

## 5. 验收
静态门 B EXIT=0（含新机检红测自证：临时摘 import 一行必红再复原）· 判别 run 恰一次全收据（EXIT 原值+stderr 摘录+三向判读结论）· 收据 `ai-docs/delivery/receipts/e2efail-import-knife/` · est：判别 run live ≤10（ai_model_invocation 记账口径同 CMOP03-F）· actualSpendCny=null。

## 6. Non-claims
本刀 ≠ G7 三绿 ≠ `:107` 关闭（判别 run 结果决定后续）≠ 刀② 落地 ≠ C-MO-P3 收口（erratum 登记后收口材料待判别 run）。
