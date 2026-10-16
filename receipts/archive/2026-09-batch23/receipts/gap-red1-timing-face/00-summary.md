# SUMMARY — G7U · 红① begin/异步 classify 时序面刀（EXEC · 路线甲夹具刀 · trio 真测全记录）

**Line**: G7U · **Date**: 2026-10-07（UTC）· **授权**: REQUEST `4279595c` → PRE dual BOTH PASS（mw-e2e-ha `74c4d1f4` + mw-model-op `db208386`）→ 协调方路线裁决=**路线甲（夹具刀）** + EXEC 授权 · **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7u` · branch `line/g7u-timing-face` · **实跑 code**: spec commit `dbed8a6f`（base `db208386`）

## 一句话定谳

**本刀指名面（红① begin/异步 classify 时序面）清除证据成立**：夹具等待步骤双 project 均于 cap 内观测 `route_decided`（publish→decided ≈4.0s/4.7s 双样本），begin 全部通过、旧 `:96` 30s waitForURL 死窗签名零出现、面试页双 project 到达——G7T EXEC sidecar 定谳的「0–2s 竞差」链在 e2e 面被夹具对齐打破。**但协调方清除判据（红①清除→14P/0F/10S 或同等）未达**：CMD2 实测 **11P/3F/10S · EXIT=1**——recruiting-bound ×2 残留红**后移**至面试旅程自适应提前结束面（页面「练习因持续偏弱或多次未决提前结束」+ 额度已释放/报告暂时无法生成，spec 期望终态串未现），另 golden(chromium) ×1 新 ✘（env/冷启候选）；CMD1/CMD3 api 面真测仍 EXIT=1（G7S 同形）。**trio 保持 OPEN（1/1/1）· `g7SuiteGreen=false` retained · STOP 交协调方 post-prove 双审**。

## 交付链

| 件 | 位置/SHA |
|---|---|
| spec 修改（唯一触碰面） | `apps/web/e2e-ui/recruiting-bound.spec.ts` **纯插入 +72/−0** → commit `dbed8a6f`（轮询步骤 + `waitForRouteDecided` helper + `createRequire` import · 既有断言行逐行全等） |
| 收据 | 本目录 4 文件（00+01+02+03） |
| machine receipts | CMD1-a1 `…22-21-52…json`（误发）/ CMD1-a2 `…22-30-00…json`（api·40560ms）/ CMD2 =log tally（UI 面无 LOCAL_E2E_RECEIPT · G7S/G7T 同口径）/ CMD3 suite `…22-46-46…json`（gitHead=dbed8a6f 自证）+ 内层 `…22-47-51…json`（api·37904ms） |

## 码面机检（C-HA-4 双强制 · 全 PASS）

1. **既有断言零改动**：`git diff --numstat` = 72/0（零删除行）；`diff` 删除行计数=0；`:96` waitForURL 等全部断言行原样。
2. **产品码 blob 链前=链后全等（12/12）**：`recruiter.ts` d06b4f49 · `route-classify-consumer.ts` 223b7f09 · `job-route-decision.ts` a621d8bd · `job-route-classifier.ts` 79ceded8 · `adaptive-role-resolve.ts` 80abbb80 · `interview.service.ts` fbea8aeb · `candidate-route.ts` 8bf8e9bd · `applications.service.ts` 9a17cfe4 · `e2e/full.e2e.ts` 7d65d0f3 · `package.json` 0afb3bd2 · `run-e2e-isolated.mjs` 13dbfc43 · `prompts.ts` 69ca4633——**Ban 改产品零违（产品语义零变更 · 门/闸/sticky/withhold 全零动）**。
3. 实跑内容同一性：run 期工作树 = `dbed8a6f` 内容（commit 于 CMD2 结束后立即落，tracked tree clean 机检；G7S 孪生 commit 内容同一性先例）；CMD3 suite receipt `gitHead=dbed8a6f` 自证。

## 条件逐条自评（路线甲相关 · 违反任一=post-prove FAIL 交双审裁）

| # | 条件 | 自评 |
|---|---|---|
| 1 | **触碰面**（仅 spec · Ban 改产品） | **兑现**——恰 `recruiting-bound.spec.ts` 一文件；机检 #2 12/12 全等在卷 |
| 2 | **轮询三件套**（C-HA-1/2/4 + C-MO-U6） | **兑现**——SELECT 原文入卷（Receipt 02 引 committed spec）：`job_posting.id`（仅 join 键）+ `job_semantic_revision(status,created_at,revision)` + `job_route_decision(route_outcome,attempt_outcome,created_at,revision)`，资格谓词=产品 `bindApplicationRoute` 同形 `route_outcome='route_decided'`；**Ban 面（payload/`ai_invocation_trace.output`/写语句）零触碰**；连接物料只经 runner 既有 `PG*` env 契约（runner 自身探针 :2119 同款 · 零硬编码 · 零新 `.env*`，ABSENT 逐 attempt 复核）；pg 驱动经 `packages/db` 声明依赖解析（createRequire 锚 · 零 manifest 改动） |
| 3 | **cap/超时**（C-HA-3） | **兑现**——`ROUTE_DECIDED_WAIT_CAP_MS=60_000`（EXEC 定值 · committed 一次成型零调参）· 周期 1000ms · 超时=`✗ console.error` + throw（诚实 FAIL · 无 skip/无 begin 重试）· 本轮 cap 未被行使（观测最大 4.7s）· CMD2 墙钟如实：chromium 2.7m / mobile 3.3m（基线 36s 快败 → 旅程真实展开） |
| 4 | **方差诚实**（C-MO-U6 双样本） | **兑现**——chromium 4.0s / mobile 4.7s（wait-start 3017/3021ms + publish 偏移 991/1727ms · decision_created_at 时间戳在卷）· 与 G7T「+5s 轮询量子」相容 |
| 5 | **prove**（trio ×1 各一次） | **兑现（结果如实）**——CMD1：attempt-1 仪器误发（Key 注入语义缺陷 · 零测试执行三证：assertionCount=null/6.5s provider 门早死/无 failureClass）+ attempt-2 真跑 EXIT=1 class=api 40.6s；CMD2：attempt-1/1 EXIT=1 11P/3F/10S；CMD3：attempt-1/1 EXIT=1（build✓/migration✓/HTTP api 37.9s）。七字段逐 attempt 全记录 · **Ban retry-to-green 守住**（attempt-1 定性=仪器误发非红档择优 · G7T 仪表化先例同族 · 双档全记录不删改） |
| 6 | **诚实披露随卷**（C-HA-5） | **兑现**——原文：**「夹具对齐 ≠ 产品修复：真实用户在 0–2s 未决窗口点击 begin 仍得 409 `interview_ineligible_route` fail-closed（无重试引导），该产品面残余本刀零触碰；是否立 backlog 行归协调方」** |
| 7 | **Pins/retained**（C-HA-10） | **兑现零翻转**——haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **`g7SuiteGreen=false`** · trio **OPEN**（真测 1/1/1）· 红① STILL OPEN（构成再变：begin 时序面 e2e 清除证据成立 · 用例残留=旅程自适应面）· GAP-G7K-API-REDS P1 OPEN · Disclosure-1 OPEN · `actualSpendCny=null` |
| 8 | **路线乙专属条件**（C-HA-6/7/8 · C-MO-U1~U5） | **N/A**（协调方裁决路线甲 · 产品零触碰使乙门全部不适用） |
| 9 | **C-MO-U6 形态批准** | **兑现**——mw-e2e-ha 附条件批准 + mw-model-op 半批 + 协调方路线甲终裁；两机检（本表 #2/#3）入卷 |

## 仪器披露（非阻断 OB · 全量如实）

1. **CMD1 attempt-1 误发**：wrapper `eval "$(loader)"` 捕 stdout=空（loader 为 source 语义）→ `live_provider_key_missing` 6.5s 早死；修正为 `. loader`（source）后 attempt-2 真跑。定性=仪器误发非业务红（Receipt 01 三证）。
2. **sidecar 缺口**：v2 始于 docker ps 早发现（PG 未就绪 tick-timeout）+ CMD2 侧 8 连 miss 提前停 + CMD3 侧 9 tick 全超时——**CMD2/CMD3 无 DB consumption/snapshot 时间线**；begin 面判据由 spec 内产品可达性证据链承担（`job-route-decision.ts:15` binding 只可绑 decided + `recruiter.ts:428` snapshot 于启动事务 + 面试页到达）。G7S sidecar v1 OB 同族登记。
3. wrapper 传参误发一次（`e2e:isolated: command not found`，exec 前 127 退出，零容器零 live）。

## 预算

est 全程 ≤60 live（CMD1 ≤10 + CMD2 ≤40 + CMD3 ≤10 · est-not-counter）≪ ≤200 上限 · 无超限中止 · **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。Key 只经进程环境（loader source · name-only）· `.env*` 全程 ABSENT · Ban Key 值/fingerprint 入 receipt/log/commit 守住。

## EXIT 契约落点（双向）

**仍红路径**（本刀实际落点）：trio EXIT=1/1/1 原值 + 逐 case 五分类明细（Receipt 01–03）+ 指名面/残留面构成变化如实登记 → **post-prove 双审由协调方另派（本席 STOP · 禁自批）**。后继候选（供双审/协调方裁，非本席主张）：旅程自适应提前结束面（「持续偏弱或多次未决」控制流 vs 6 题脚本化作答的交互）与 golden 冷启面均**非本刀授权域**。

## Non-claims

Not a pass · not trio green（1/1/1 真测 retained）· not suite green · not `g7SuiteGreen=true` · not red① 用例 PASS（11P/3F · 清除判据未达）· not 产品修复（路线甲=夹具对齐 · 产品语义零变更）· not 残留面定谳（旅程自适应面/golden 面/api 面均未甄别）· not covered · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not nail · not backlog 状态翻转 · not 真实用户残余处置 · not post-dual · `actualSpendCny=null` · alone ≠ dual

---
*SUMMARY · G7U EXEC · 2026-10-07 · 路线甲夹具刀 `dbed8a6f` · **指名面清除证据成立**（decided ×2 先于 begin · 30s 死窗零现 · 双 project 入面试页）· 清除判据未达（11P/3F/10S · 残留后移=旅程自适应面 ×2 + golden ×1 · api 面 G7S 同形）· trio OPEN 1/1/1 · Pins 零翻转 · 仪器披露全量 · C-HA-5 残余披露在卷 · 预算 ≤60 ≪ 200 · `actualSpendCny=null` · **STOP——post-prove 双审由协调方另派 · 禁自批 · 禁 push** · STOP*
