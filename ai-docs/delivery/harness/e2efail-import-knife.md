# E2EFAIL-1 — full.e2e.ts emitE2EFailure 断链修复刀（BUG-E2E-FAILUNIMPORT · G7X ②面 erratum · 附判别 run）

**状态**：`draft_rev3:awaiting_pre_exec_dual`（rev2 席1 史实订正 supersession；rev3 席2 三处方：est ≤25·sidecar v2 实测臂按 E-4 前向纪律·§1.2 可达性算术降级「未排除但未证」——断链=潜伏炸弹非已证红因·branch 3 为最可能预注册结局） · base = 主线 `9130509e` · worktree `meetwise-line-g7drv` · 分支 `line/g7-driver-assert` · 立项依据 = 协调方码面三重实证（2026-10-08）。

## 1. 三重码面实证（协调方亲读 · 供双席复核）【rev2 · 席1 史实考证订正：supersession 叙事】
1. **C-MO-P3 断言面史实链（supersession 非误判）**：G7X 实跑码 `979a85e4`（blob `7d65d0f3`·与 G7X 登记块同源钉）的 `full.e2e.ts:202` 当时为 `provenance.identities.length === questions`——**「恒 False（5 vs 3）」定谳对其码成立且正确**；`+ clarifications` 系其后继 `1789e321`（CMOP03-FIX 刀①·git 亲证 ancestor）引入——**现树恒 True 是已被修复取代（supersession）的状态**：①`trustedBSideScore === null`/`forgedScores === 'none'` 为 `helpers/interview.ts:235-236` 字面量；②`identities.length === questions + clarifications` 同源恒等（终扫 :374 输入=seen :309·seq 去重门卫 :306-307·identities :210 双 kind·questions :311/clarifications :342 同循环无跳过·一切 throw 路径使 :201 永不求值）。**G7X ②面定谳维持成立零翻案；断言修复已由 1789e321 完成——本刀对象=残余断链**（G7X ①面 ai_report 烧尽钟 sidecar 时间线定谳不受影响）。
2. **断链炸弹（可达性算术约束·席2 订正）**：`full.e2e.ts:14` import 仅 `{ createE2EReviewLedger, emitClassifiedE2EFailure }`，`:205` 却调用 `emitE2EFailure`（存在于 `e2e/helpers/failure-class.mjs:233` 并经 failure.ts re-export）——**未导入 → ReferenceError → uncaught → `main().catch` fallback class='api' EXIT=1**。但 `:205` 可达当且仅当首循环空转满 420s（interview.ts:287/:294/:302/:375·三处调用 :187/:225/:356 均不传 deadlineMs·循环内抛错直达 :395 绕过 :205）——**G7X T-1 40363ms/CMOP03-FIX 78798ms/G7Y 101906ms 算术上不可能是 :205 触发**：与历史红「未排除但未证」关联，断链系潜伏炸弹（未来 terminal='' 路径必炸）而非已证红因；判别 run 最可能结局=branch 3（api 红 unchanged→红因另寻）。
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
静态门 B EXIT=0（含新机检红测自证——**优先固化为常驻负例 TC**：e2e-static-guards.proof.mjs expectError/writeTree/captureGuard 夹具机械·沿 :30-52 先例；手工摘-复原态可接受为下限）· 判别 run 恰一次全收据（EXIT 原值+stdout E2E_FAILURE 行摘录+三向判读结论）· 收据 `ai-docs/delivery/receipts/e2efail-import-knife/` · **est：判别 run live ≤25**（对齐 CMOP03-F 实测 11 与 CMOP03-FIX 全程 ≤25 先例·绿向 11-17 覆盖）· **sidecar v2 实测臂必派**（CMOP03-FIX E-4 前向纪律：本线后续 run 须派 sidecar·succeeded+failed 双计·dispatching 不计·五条纪律+CMOP03-E 叠加条全沿）· actualSpendCny=null。

**席1 附注登记（rev2 收录）**：① boundLoop `full.e2e.ts:368` 断言仍 `identities.length === boundLoop.questions`（未含 clarifications）——backlog `:830` 已登记候修行·非本刀域；② 兜底细节措辞：ReferenceError 经 `:394-397` main().catch fallback `{class:'api',code:'client_uncaught'}` 而非 A() 兜底——无害·收据措辞以本附注为准。

## 6. Non-claims
本刀 ≠ G7 三绿 ≠ `:107` 关闭（判别 run 结果决定后续）≠ 刀② 落地 ≠ C-MO-P3 收口（erratum 登记后收口材料待判别 run）。
