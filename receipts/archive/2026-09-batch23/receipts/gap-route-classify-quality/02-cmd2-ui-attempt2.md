# Receipt 02 — CMD2 `pnpm e2e:ui:isolated`（G7T EXEC · attempt 2/2 · sidecar 仪表化迭代 · **根因位移定谳**）

**Line**: G7T · **Date**: 2026-10-07（UTC start ≈20:56:4xZ）· **实跑 code SHA**: `430d4c84`（与 attempt 1 同码 · 零产品码变更——本 attempt 目的=仪表化判别，非 retry-to-green：两 attempt 全记录）

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm e2e:ui:isolated`（同 wiring `package.json:279`）+ **sidecar 仪表**：`.tmp/g7t-sidecar.sh`（SELECT-only 白名单轮询 · 2s 周期 · `job_route_decision(attempt_outcome,reason_codes)` / `job_semantic_revision(status)` / `route_consumption_event` / `interview_route_snapshot` · Ban payload/`ai_invocation_trace.output`/任何写查询 · 拆除前末次快照在卷） |
| EXIT | **1**（**12 passed / 2 failed / 10 skipped (2.1m)** · 失败仍=红① recruiting-bound ×2 · `:96:14` 30s `waitForURL` · 错误横幅同形） |
| 时间戳（UTC） | sidecar 首读 `20:56:49Z`（fresh DB 建表）→ 末读 `20:59:03Z`（拆除前） |
| 实跑 SHA | `430d4c84` |
| Key presence（name-only） | `MODEL_API_KEY=set`（loader 进程环境 name-only）· profile=dashscope-cn-beijing · model=qwen-plus · 五个 `.env*` ABSENT |
| 关键输出 | **v2 修复面绿（本 attempt 核心证据）**：`job_route_decision` = **`result_validated` ×2、零 `validation_rejected`**（G7S 同位读数曾为 `validation_rejected ×2`）· `job_semantic_revision` = `route_decided ×2` · **残留断点位移**：`route_consumption_event`=0、`interview_route_snapshot`=0（贯穿全程至拆除末读）→ binding 零落 |
| 预算 | live classify ×2（双 project 各 1）· 累计全程（诊断/预检 11 + attempt1 ≈2 + attempt2 2 + 面试面既有模型调用）**远低于 ≤200** · `actualSpendCny=null` |

## 根因位移时间线（sidecar 逐秒 · 判别定谳）

| UTC | 读数 | 释义 |
|---|---|---|
| 20:57:08 | `rev=[route_pendingx1]` | chromium job 发布（API 写 revision） |
| **20:57:13** | **`rd=[result_validated]`** `rev=[route_decidedx1]` | **worker classify 完成（publish + 5s：consumer 轮询 5000ms + 模型延迟）——v2 输出过闸** |
| ~20:57:12–14 | （spec 内推算） | chromium begin 点击（spec 35.8s · publish→jobLink→邀请→已邀请→/jobs→开始面试 ≈5–6s 步进）→ **bindApplicationRoute 先于 route_decided 到达** → `interview_ineligible_route` 409 → 错误边界 → 30s waitForURL 死窗（期间 20:57:13 起决策已在卷，无重试路径） |
| 20:58:03 | `rev=[route_pendingx1,route_decidedx1]` | mobile job 发布 |
| **20:58:08** | **`rd=[result_validated ×2]`** `rev=[route_decidedx2]` | mobile classify 完成（publish + 5s）——同形态过闸 |
| ~20:58:06–08 | （spec 内推算） | mobile begin 点击 → 同一竞态（差 0–2s）→ 409 → 30s 死窗 |
| 20:59:03（末读） | `consumption=0 snapshot=0` | **binding/snapshot 零落贯穿全程**——两 project 的 begin 全部先于各自 route_decided |

## 判别定谳（回答「为什么 v2 后仍红」）

1. **classify 输出质量面（本刀 C-MO-P1 指名面）：已修复并经 live e2e 复证**——`validation_rejected ×2`（G7S）→ `result_validated ×2`（本 attempt）；零 conflict、零 low_confidence、零 taxonomy_invalid；sidecar 白名单内 reason_codes 全空（过闸行）。REQUEST §1.6 RC 排序裁决兑现：修复面正是 RC-1a。
2. **残留红① =「begin 早于异步 classify 完成」时序面**：worker consumer 5000ms 轮询 + 模型延迟 ≈5s ≥ spec publish→begin 步进（≈5–6s），两 project 均以 0–2s 之差先 begin 后 decided；begin 是一次性动作（409 后 spec 无重试），决策晚到 1–2s 也无法被该次 begin 消费。**consumption=0/snapshot=0 是 binding 从未成功落的直接读数**（若 begin 后到，`bindApplicationRoute` 必落 binding+consumption event——G7S 供给链语义，未被本刀触碰）。
3. **归属**：此残留面即 G7S POST 双审预留的「**红①时序面**」（「recruiting-bound『等 route_decided 再 begin』若需要，属独立夹具 REQUEST」· `harness/gap-begin-snapshot-supply-fix.md` §2 排序段原文）；产品面备选（begin 同步 fallback classify / consumer 提速/事件唤醒）= 消费时序产品语义变更。**两者均超出本刀 EXEC 授权（prompt v2 校准 + 诊断先行）**——本席 Ban 无授权夹具改动（occupied 行 `recruiting-bound.spec.ts` 零触碰机检：blob `de4991e6` 本 turn 全程不变），**STOP 交协调方裁决**。

## Non-claims

attempt 2 ≠ retry-to-green（同码仪表化迭代 · 两 attempt 全记录 · 未择优留档）· 12P/2F ≠ 基线未动（失败面构成已变：G7S 双红=classify 拒；本刀双红=时序面，classify 面读数已翻绿）· route_decided ×2 ≠ trio 绿 ≠ `g7SuiteGreen` 翻转 · 时序面归因 ≠ 夹具刀授权 · STOP ≠ 自批 · alone ≠ dual

---
*Receipt 02 · G7T CMD2 attempt 2/2 · 2026-10-07 · EXIT=1 · 12P/2F/10S · **v2 修复面 live 复证绿**（result_validated ×2 · 零 validation_rejected）· 残留=begin/异步 classify 时序面（consumption=0 · 竞差 0–2s）· 属 G7S 预留独立夹具刀 · STOP*
