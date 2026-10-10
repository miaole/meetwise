# SSE-RESILIENCE EXEC 收据（#256 弱网降级+#255/#53-56 SSE 韧性刀 · rev2 dual_pass:ready_for_exec）

**EXEC**: sse-exec（seat #256 刀 EXEC 席）
**工作树**: meetwise-line-sse1 · 分支 line/sse-resilience · 起点 HEAD `3f9e91e5`（树干净已核）
**Date**: 2026-10-10
**任务书**: ai-docs/delivery/harness/sse-resilience-REQUEST.md（rev2 · dual_pass:ready_for_exec · EXEC 授权）
**est live**: **0**（纯前端/代理消费侧 + 注入式 prove,零 Key 零外呼零消耗;脚注 actualSpendCny=null 照抄）

---

## §1 prove 门（EXIT 原值全录）

| 命令（package.json 实名核对） | EXIT | 计数 | 备注 |
|---|---|---|---|
| `pnpm --filter @meetwise/web prove`（改码前·基线） | 0 | 全绿 | 预存基线,零红 |
| `pnpm --filter @meetwise/web prove`（改码后·最终树） | 0 | **236 PASS / 0 FAIL** | 含新增六组 SSE-RESILIENCE section;基线 196 项断言中 193 项零改零删 |
| `pnpm --filter @meetwise/web typecheck`（基线） | 0 | — | 预存零错 |
| `pnpm --filter @meetwise/web typecheck`（最终树） | 0 | — | 与基线 diff 零新增错 |
| `pnpm --filter @meetwise/web prove:public-copy`（最终树） | 0 | 13/13 | releaseEvidence=false 照旧 |
| markers 门禁 `grep -rEn "^<<<<<<< \|^=======$\|^>>>>>>>" apps packages scripts ai-docs .github` | — | **0 命中** | — |
| Ban 门禁 `location.reload` @ InterviewPanel/QuizPanel/DiagnosisPanel | — | **0 命中** | 全 web 面 1 命中为 useInterviewStream.ts:9 注释文字（Ban 语义本身,非代码） |

**attempt 全账（Ban retry-to-green）**：
- [dev] prove run1 EXIT=1 — 补钉常量单源迁移后 quiz-stream 引用 interview-stream 的 `CLEAN_END_NO_PROGRESS_BUDGET` 未随迁（模块解析错）→ 常量单源迁 backoff.ts
- [dev] prove run2 EXIT=1 — **3 FAIL 全为旧语义边界断言**（见 §3 C9×W1 调和）,非实现缺陷
- [dev] prove run3 EXIT=1 — 新增 section 测试构造错误 5 处 + backoff 包络 rand=1 边界钳制缺失 + quiz/diagnosis `lastFailureReason` 插错块（esbuild TransformError）→ 逐一修正
- [dev] typecheck run1 EXIT=2 — `capBackoffMs?: () => number` 与 `JitteredBackoff` 联合调用 0 参不兼容 → 签名统一 `(attempt: number) => number`
- [final] prove run4 **EXIT=0** 236 PASS · typecheck EXIT=0 · public-copy EXIT=0

## §2 改动清单对账（diff --stat 实物核对值 · 18 M + 3 A）

```
apps/web/app/jobs/actions.ts             |  12 +-   C8:ensureOk 抽出改导入+:28/:40 内联 401 同跳
apps/web/components/DiagnosisPanel.tsx   |   9 +-   C7::144/:155 reload→retry
apps/web/components/InterviewPanel.tsx   |  46 ++-  C7:草稿接线(防抖写/空框恢复/:210 成功清/:96 前缀清)+:489 reload→retry
apps/web/components/QuizPanel.tsx        |  11 +-   C7::109/:122 reload→retry
apps/web/lib/hooks/useDiagnosisStream.ts |  36 ++-  C4:同构
apps/web/lib/hooks/useInterviewStream.ts |  59 ++-  C4:browserResumeSignals 单源+401 replace 跳转+retry 出口
apps/web/lib/hooks/useQuizStream.ts      |  36 ++-  C4:同构
apps/web/lib/stream/business-events.ts   |   9 +-   C10:decodeSSE 增 sawTraffic 旗
apps/web/lib/stream/diagnosis-state.ts   |  46 ++-  C5:StreamStopReason+streamStopReason/cleanEndReconnect+归约族 flags+分臂文案
apps/web/lib/stream/diagnosis-stream.ts  | 139 ++-  C2:同构重构
apps/web/lib/stream/interview-state.ts   |  31 ++-  C5:同构(interview 面)
apps/web/lib/stream/interview-stream.ts  | 210 ++-  C2:退避换C1/干净end分家/resumeSignals/补钉1/状态码分类/lastFailureReason
apps/web/lib/stream/quiz-state.ts        |  47 ++-  C5:同构(quiz 面)
apps/web/lib/stream/quiz-stream.ts       | 139 ++-  C2:同构重构
apps/web/lib/stream/sse-cursor.ts        |  40 ++-  C3:SseOpenStatusError+isSseOpenStatusError+classifySseOpenStatus;iterateSseBody 非 OK 抛分类;sseProxyFailureResponse 零改
apps/web/lib/view-model.ts               |  38 ++-  C5:interview reconnecting/degraded 按 reason+cleanEnd 分臂(缺省文案逐字保留)
apps/web/test/web-logic.proof.ts         | 320 ++-  C9:六组新 section+3 处基线更新(§3 披露)
apps/web/lib/interview/draft-store.ts    | (新)     C6:草稿纯函数+storage 注入缝+restoreDraftIfEmpty(注记A)
apps/web/lib/jobs/ensure-ok.ts           | (新)     C8:ensureOk 纯模块(探针实证 actions.ts server-only 链不可导入)
apps/web/lib/stream/backoff.ts           | (新)     C1:full-jitter 指数退避+ResumeSignals 缝+钉值常量单源
```

**零触面（对账 §2 非范围）**：apps/api/\*\*（sse-pump.ts/interview.controller.ts/三 route 代理零 diff）·packages/\*\* 零 diff · error.tsx 零 diff · server.ts 零 diff · app/recruiter/jobs/actions.ts 零 diff · 中间件/登录页零 diff。tsconfig.tsbuildinfo 为 typecheck 运行产物,还原不入 commit。

## §3 C9×W1 冲突调和披露（EXEC 裁决未获回复,按推荐路径执行,提请补审）

任务书内部矛盾：C9「既有全部 section 零改零删」vs §1 W1②/C2「maxRetries 耗尽不再 degraded」。实测基线全绿树下，忠实实现 W1 后恰 3 处旧断言红（全部钉死被废除的「≤maxRetries+1 次即 degraded」语义），其余 196 项断言全 PASS。处置（已尝试 AskUserQuestion 上报，未获回复，按最小披露路径继续）：

| 处 | 改前（钉旧语义） | 改后（钉新语义） |
|---|---|---|
| proof 旧 :291-292（interview 耗尽） | `A('重连耗尽(≤maxRetries+1 次)后 degraded 收尾', exhaustedRun.degraded && exhaustedRun.connection === 'closed')` / `A('确实有界,不无限重连', opens <= 3)` | 断言值改钉「耗尽不即时降级;绝对上限(缺省100)兜底仍有界 degraded」+ `opens > 3 && opens <= 105`（实测 101）;section 标题同步注记基线更新 |
| proof 旧 :504（quiz 耗尽） | `qExhaust.degraded && qExhaust.connection === 'closed' && qOpens <= 3` | 同构：`qOpens > 3 && qOpens <= 105`（实测 101） |
| proof 旧 :578（diagnosis 耗尽） | `dExhaust.degraded && ... && dOpens <= 3` | 同构：`dOpens > 3 && dOpens <= 105`（实测 101） |

覆盖**只增不减**：新六组 section 另以「耗尽转永续后仍恢复到终态（三驱动）」「绝对上限有界」「补钉1 宽限+预算」「sawTraffic 差分对照」钉死新语义。**旧断言改前逐字已录本表**，提请 post-prove 双审裁决；如否决本调和，回滚面仅此 3 处 + 对应 section 标题。

**范围外新文件披露（1 处）**：`apps/web/lib/jobs/ensure-ok.ts`——C8 的实现细节。探针实证 `app/jobs/actions.ts` 因 'use server'+server-only 依赖链在 tsx prove 下不可导入（Cannot find package 'server-only'），prove4 要求真实断言 ensureOk 401→NEXT_REDIRECT（EXEC 附注自认仓内无先例）；ensureOk 单源抽纯模块（仅依赖 next/navigation，tsx 可导入），actions.ts 改导入、行为零变。与 C1/C6 新增 lib 文件同款模式。

## §4 pins 照抄核查（十一值零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained` · 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · `actualSpendCny=null`（本刀零外呼零消耗 · est live=0）。本刀未触任何 pins 载体文件。

## §5 est live=0 披露

零 secrets/Key 值接触（仅 env name 面,本刀甚至未触 env）·零网络外呼（prove 全注入式,new Response 本地构造）·零消耗。prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走 post-prove 双审 + nail）。
