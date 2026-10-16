# Receipt 02 — CMD2 `pnpm e2e:ui:isolated`（G7U EXEC 主证 · attempt-1/1 · **红① begin 时序面清除证据成立 · 用例仍红（残留面后移）· 11P/3F/10S**）

**Line**: G7U · **Date**: 2026-10-07（UTC）· **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7u` · branch `line/g7u-timing-face`

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm run e2e:ui:isolated`（wiring `package.json:279` @`0afb3bd2` · = `node scripts/run-e2e-isolated.mjs e2e:ui`） |
| EXIT | **1**（playwright tally：**11 passed / 3 failed / 10 skipped (7.3m)** · `G7U-cmd2-ui-EXIT=1` · UI 面 e2e:ui 无 LOCAL_E2E_RECEIPT——G7S/G7T 同口径，log tally + EXIT 即记录） |
| 时间戳（UTC） | ~22:33Z → 22:42:21Z（log mtime） |
| 实跑 SHA | 工作树内容 = `dbed8a6f`（spec 纯插入 +72/−0 · 提交于 run 后立即完成，tracked tree clean 机检 · G7S 孪生 commit 内容同一性先例） |
| Key presence（name-only） | `MODEL_API_KEY=set`（loader source）· `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` · `MODEL_NAME=qwen-plus` · `.env*` 全 ABSENT |
| 关键输出 | **`[g7u-fixture] route_decided observed` ×2**（chromium：wait start 后 **3017ms** · publish click 偏移 991ms · `attempt_outcome=result_validated` · decision_created_at=22:35:34.093Z；mobile：**3021ms** · 偏移 1727ms · `result_validated` · 22:38:39.030Z）→ **双 project begin 全部通过**（旧签名 `recruiting-bound.spec.ts:96` 30s `waitForURL` 超时 **零出现**；面试页 heading「面试岗位：浏览器绑定岗位-088c02ae/44803c98」在卷） |
| 预算 | live：2×classify + 2×面试旅程（每旅程 ~3 回合×出题+评分）+ golden/uc018 面，est ≤40（est-not-counter）· `actualSpendCny=null` |

## 指名面裁决（红① begin/异步 classify 时序面）

**清除证据成立（e2e 面前进）**：夹具等待步骤双 project 均在 cap 内观测到 `route_decided`（4.0s/4.7s 自 publish click），begin（原 :95 点击 → 现 :159 后）通过、`waitForURL /interview/iv_…?applicationId=app_/` 达成、面试页渲染——**G7T EXEC sidecar 定谳的「0–2s 竞差先 begin 后 decided → binding 零落 → 409 → 30s 死窗」链被夹具对齐打破**（begin 语义上仅可在 binding 落后可达：`recruiter.ts:410/:428` 产品码次序未动、blob 全等）。

**清除判据未达（诚实）**：协调方判据=红①清除→14P/0F/10S 或同等；实际 **11P/3F/10S**——recruiting-bound ×2 仍 ✘，但**失败面后移**（见下），且 golden(chromium) ×1 新 ✘。EXIT=1 原值记账，Ban retry-to-green（不重跑、不择优）。

## 残留红面（后移 · 逐 project 五分类明细）

| project | 失败点 | 页面状态（error-context.md 在卷） | 分类 |
|---|---|---|---|
| chromium | `waitForTerminalOrAnswer` 90s（spec :52 ← :183 loop） | status「**练习因持续偏弱或多次未决提前结束**（自适应控制流，不是能力等级或招聘结论）」+ alert「没有得到足够可信的评分证据，**本次预留额度已释放**。岗位面试可从『我的投递』重新开始」 | **面试旅程自适应提前结束面**（worker/model 面 · 新暴露——G7S/G7T 基线时 begin 即死、旅程从未到达，此面在 recruiting-bound 上系首见）· 非本刀指名面 |
| mobile | 同上 | status 同上 + alert「面试已完成,但报告暂时无法生成。可稍后重试或联系支持。」 | 同上 |
| chromium（golden.spec.ts:10） | resume 页 `textarea[name="text"]` toBeVisible 20s 超时 | 注册后 /resume 页 textarea 未现 | **env/冷启候选**（suite 首测、与本刀零触碰文件、产品码零 diff；run 于 recruiting-bound 之前——非本刀时序面下游）· 精确归因留协调方 |

**Ban 边界守住**：终态断言串（`面试完成 · 综合评分|报告暂不可用`）与既有断言零触碰（C-HA-1「Ban 夹具等待步骤演变为断言放宽」——页面实际文案与断言串不一致**不构成改断言理由**，如实记录为残留面证据）。

## 仪器披露（非阻断 OB · G7S sidecar v1 缺口同族）

sidecar（`.tmp/g7u-sidecar.mjs` · SELECT-only 四面白名单 · 2s 周期）于 PG boot 窗口内 8 连 miss 触发提前停止（tick 0–7 全 `tick-timeout`，boot 后未复活）→ **本轮无 consumption/snapshot DB 时间线**；begin 面前进的产品内证据链（binding 只可绑 decided + snapshot 于启动事务，`job-route-decision.ts:15`/`recruiter.ts:428`）+ 面试页到达本身承担判据。sidecar 时钟缺陷修复留后继（本刀不再跑 CMD2，Ban retry-to-green）。

## 方差双样本（C-MO-U6 · 如实）

| sample | wait-start→decided | publish-click→wait-start 偏移 | publish→decided 折算 | attempt_outcome |
|---|---|---|---|---|
| chromium | 3017ms | 991ms | ≈4008ms | result_validated |
| mobile | 3021ms | 1727ms | ≈4748ms | result_validated |

与 G7T EXEC sidecar「+5s（5000ms 轮询量子+模型延迟）」相容（轮询量子内均匀分布）；cap=60s ≫ 观测最大 4.7s，cap 语义未被行使。

---
*Receipt 02 · G7U CMD2 主证 · 2026-10-07 · EXIT=1 · 11P/3F/10S · **红① begin 时序面清除证据成立**（decided ×2 先于 begin · 旧 30s 死窗零出现 · 面试页双 project 到达）· 清除判据未达（残留=旅程自适应提前结束 ×2 + golden ×1）· 失败面后移非本刀域 · 断言零触碰 · 方差双样本 4.0s/4.7s · sidecar 仪器缺口如实 · Ban retry-to-green · `actualSpendCny=null` · STOP*
