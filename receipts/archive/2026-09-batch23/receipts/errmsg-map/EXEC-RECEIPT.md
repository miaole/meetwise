# ERRMSG-MAP EXEC 收据 — #250/#251/#224 文案映射刀

- Date: 2026-10-07 · 席位：EXEC（mw-core·W1 主路径线）· commit author `mw-errmsg-exec`
- 蓝图: `ai-docs/delivery/harness/errmsg-map-REQUEST.md` @`2e942ace`（rev2 · `draft_rev2:pre_exec_dual_PASS`，双席 BOTH PASS 授权 EXEC）
- 工作树: `/Users/miaole/Desktop/golucky/meetwise-line-errmsg` · branch `line/errmsg-map`（开工前 `git pull`＝Already up to date，HEAD=`2e942ace`）

## 交付面（C1-C8 · §1+rev2 全项）

- C1 新增 `apps/web/lib/errors/action-error.ts`：纯函数 `actionErrorMessage(page, status, code)`（rev2 E2 页域签名·零依赖纯字符串面，沿 `lib/jobs/application-start-error.ts` 同型先例）。
- C2 `apps/web/app/interviews/page.tsx`：create_failed/begin_failed 硬编码两分支改走映射函数（兜底原文一字不改）；402/409/503 mapped 码落此页。
- C3/C4 `quiz/page.tsx`·`diagnosis/page.tsx`：同 C2（quiz/diag 码集）。
- C5 `jobs/page.tsx`（#224）：searchParams 补读 `error` + 新增 402 行渲染面；页面其余零改。
- C6 `interviews/actions.ts`：begin 非 402/401 → 解析 body `error` 码 → `?error=<code>` 透传；不可解析/未映射 → `begin_failed` 兜底（:18 402 分支零改）。
- C7 `quiz/actions.ts:14-16`·`diagnosis/actions.ts:17-19`：begin 非 402 由「静默 redirect 进会话页」改「带码回列表」（纪律注释沿 interviews/actions.ts:8 原文）；兜底=`create_failed`（rev2 E2：interviews 专属 begin_failed 文案不跨页）；402 分支零改。
- C8 `apps/web/test/web-logic.proof.ts` 新 section（9 断言）；既有 section 零删改。

## rev2 E1-E5 落实

- E1：binding_conflict 行不带链接，出口=列表「进入 →」/会话 InterviewPanel「放弃」+确认弹层两跳既有按钮面（亲读 `components/InterviewPanel.tsx:253/:264` 实证），lib 注记留痕。
- E2：签名页域化 `page:'interviews'|'quiz'|'diagnosis'|'jobs'`；quiz/diag begin 未映射兜底=create_failed；begin_failed 文案不跨页（proof 断言钉死）。
- E3：jobs 前态提示零新增（本刀 jobs 面仅 402 行=前态如实现状；「本场由企业支付」归 #271）。
- E4：落点钉 `apps/web/lib/errors/action-error.ts`（lib/errors/ 新建）。
- E5：Honesty 指误（§5-4）已在 rev2 收口，无需码动。
- rev2 席1 择一项（quiz/diag 补 begin_failed+防御码 superset 注记 vs 移除）：**EXEC 择「保留 superset」**——quiz/diag 页域接收 begin_failed/防御码归一渲染各页 create_failed 原文，lib 注记+proof 断言留痕。

## prove（§4+rev2）

- 环境准备：`pnpm install` EXIT=0（rev2 前置·不计 attempts）。
- **web-logic proof：`pnpm web:prove` 第 1 次运行 EXIT=0（一次过·Ban retry-to-green 达成；attempts=1）**；随后同码捕获全量日志一次（EXIT=0，199 PASS/0 FAIL，无任何码改动）。全量日志：`ai-docs/delivery/receipts/errmsg-map/web-prove-full.log`。
- 映射断言摘录（新 section 9 条全 PASS）：
  - `PASS 402 四码×四页同落额度行：蓝本定稿文案+『额度说明』+/pricing+如实注记（无购买承诺）`
  - `PASS interviews 409 mapped 两码逐字蓝本：无链接出口（E1：继续/放弃=列表/会话两跳既有按钮面）`
  - `PASS 409 两码为 interviews 页域专属：quiz/diagnosis/jobs → null（rev2 E2 不跨页）`
  - `PASS 503：码通道 public_preview_read_only 与 status 通道（含无码/未知码）→ 服务暂不可用`
  - `PASS create_failed 兜底三页原文一字不改（jobs 无 create 渲染面 → null）`
  - `PASS begin_failed 原文一字不改且不跨页（rev2 E2：quiz/diag 归一各页 create_failed 原文·jobs → null）`
  - `PASS 防御码七枚透传不折叠丢失：interviews 四码→begin_failed 原文；quiz/diag 三类→各页 create_failed 原文`
  - `PASS 未知码/空码/无码（非 503）→ null：四页不渲染空壳`
  - `PASS status 通道只认 503：status=409/402 + 未知码 → null（不发明渲染面）`
- 如实声明：渲染断言=纯函数输出断言（四页为 RSC，页面渲染该输出），**非浏览器 DOM 证明**。

## 门清单

- apps/api 零字节：`git diff --stat -- apps/api`=空 · `git status --porcelain apps/api`=空 ✓（begin/额度 saga/路由决策服务端语义零触）。
- 冲突标记门：全仓 `grep '^<<<<<<< \|^=======$\|^>>>>>>> '`=0 ✓。
- Ban 文案：diff 面 `消耗|次额度`=0 命中；「将消耗你 1 次额度」零新增 ✓；402 注记仅如实「预览环境暂未开放购买」 ✓。
- 兜底原文：create_failed/begin_failed 三页+interviews 逐字照抄 @`2e942ace` 现状，proof 精确串断言 ✓。
- jobs 根错误边界 throw 面（application-start-error.ts）零触 ✓；/pricing、/billing 页面本体零触 ✓；SSOT 零触 ✓；零 Key 零 secrets ✓。

## numstat（本次刀）

```
9	0	apps/web/app/diagnosis/actions.ts
15	3	apps/web/app/diagnosis/page.tsx
9	1	apps/web/app/interviews/actions.ts
15	10	apps/web/app/interviews/page.tsx
18	2	apps/web/app/jobs/page.tsx
9	0	apps/web/app/quiz/actions.ts
15	3	apps/web/app/quiz/page.tsx
53	0	apps/web/test/web-logic.proof.ts
（新增）apps/web/lib/errors/action-error.ts
```

## pins（十一值照抄 §6）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗·est live=0）

## Non-claims（§7 重申）

文案 ≠ 功能：映射文案上线 ≠ 额度/绑定/路由行为任何改变 ≠ 402 可充值；candidate_route_undecided rev3 后结构性不可达（映射行=防御≠功能存在）；充值入口=/pricing 说明页 ≠ 充值可用；`begin_failed` 兜底对未映射确定性 409 防御码仍含「请稍后重试」=如实残留（蓝本范围如此）；纯函数 prove ≠ 浏览器 DOM 渲染证明；jobs 页补读 ≠ startApplicationAction throw 面修复。
