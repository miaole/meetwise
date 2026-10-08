# EXEC — **CMOP03-E · 刀② 弱输入 report_unavailable 预期面校准**（分支 P 落地 · 零码改 · sidecar 账本实测臂在卷 · 单 attempt）

**Date**: 2026-10-08 · **Line**: CMOP03-E · **授权**: meetwise EXEC（P/D 定值=**裁分支 P** · §3⑤ standing authorize · post-prove dual 归协调方派）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-knife2` · branch `line/cmop03-weak-input-calib`

## 1. base 重钉 + EXEC 实跑 code SHA

- `git fetch origin` EXIT=0 → `origin/feat/mysql-schema-skeleton` = **`b5101df4`**（≥b5101df4 满足 · g7v-calib nail 在卷）→ `git rebase origin/feat/mysql-schema-skeleton` 干净（1/1）→ **实跑 HEAD = `3186cf03`**（full `3186cf03e6838cb63f6610645fa9609576d0b591` · REQUEST 孪生 commit · 消息同 mandates）。
- base tip b5101df4 与实跑 HEAD 之间 tracked 树零改（rebase 仅重放本线 REQUEST docs commit）。

## 2. 机检钉（EXEC 前后双测全等 · 11 钉 + wiring）

| 钉 | blob（前=后 · 逐字实测） |
|---|---|
| `packages/domain/src/assessment.ts` | **`ca63f4ce`** |
| `apps/worker/src/interview-service.ts` | **`3026d9dd`** |
| `apps/worker/src/main.ts` | **`e4878b61`** |
| `packages/db/src/report.ts` | **`92c77919`** |
| `apps/worker/src/report-worker.ts` | **`06d87f73`** |
| `e2e/helpers/sse.ts` | **`9bba015d`** |
| `e2e/helpers/assert.ts` | **`975fbb38`** |
| `scripts/run-e2e-isolated.mjs` | **`13dbfc43`** |
| `packages/ai-runtime/src/model-operation-registry.ts` | **`63af556f`** |
| `e2e/full.e2e.ts` | **`1fededa5`**（零 diff · 未动） |
| `e2e/helpers/interview.ts` | **`c7001612`**（零 diff · 未动） |
| wiring `package.json` | **`0afb3bd2`**（`e2e:isolated` @`:278`） |

**`:236-237` 断言本体逐字符比对**：实文 `sed -n '236,237p' e2e/full.e2e.ts` vs 冻结引文 → `cmp` 全等 + md5 双 **`b51a03fbecb6f5632f5a79ae6c1b64b0`**（235 bytes）· run 前后双测均 `b51a03fb` → **零 diff 硬原则 PASS**。
**tracked 树零改双测**：run 前/后 `git status --porcelain` 均=0 行（非 untracked）→ tracked 树 run 前后零改 PASS。
**erratum（e2e-ha 席处方 · 本 EXEC 落）**：harness §3 机检钉行 sse.ts/assert.ts 补全路径为 `e2e/helpers/sse.ts`/`e2e/helpers/assert.ts`（blob 不变 · 纯路径补全）。

## 3. attempt 全台账（七字段 · 单 attempt · Ban retry-to-green 守住）

| 字段 | 值 |
|---|---|
| CMD 原文 | `source ~/.meetwise-secrets/load-model-api-key.sh && pnpm run e2e:isolated`（wiring `package.json:278` · `node scripts/run-e2e-isolated.mjs e2e:prove`） |
| EXIT 原值 | **CMD1_EXIT=1**（`pnpm run e2e:isolated` ELIFECYCLE Command failed with exit code 1） |
| 起止时间戳 | startedAt=**2026-10-08T04:33:28.402Z** · finishedAt=**2026-10-08T04:34:42.496Z** · durationMs=**74094**（receipt 原值） |
| 实跑 code SHA | worktree HEAD=`3186cf03`（rebase 后实测 · §1） |
| worktree+branch | `/Users/miaole/Desktop/golucky/meetwise-line-knife2` · `line/cmop03-weak-input-calib` |
| 环境探针 | `.env*` ABSENT 前后双测（zsh no-match 实测）· Key 经 loader source `~/.meetwise-secrets/load-model-api-key.sh`（**name-only** · 值零入卷）· DB 直读=容器固定测试凭据（wrapper baseEnv 同面 · 非模型 Key · SELECT-only） |
| 判读归类 | **预期红于 post-7b 窗兑现**（failureClass=api · receipt outcome=failed · 见 §5/§6）· 零第二次 run（红非重跑触发 · 零补测通道） |

machine receipt：`.tmp/e2e-receipts/2026-10-08T04-34-42-496Z-89547-f9ea3ae5-3206-4dff-bd7f-94e34abb7232.json`（class=`local_untrusted_e2e_receipt` · releaseEvidence=false）· `E2E_FAILURE_CLASS class=api`（wrapper stdout · state_bytes=217/logs_bytes=1617 withheld · **Ban readback 守住——零 stderr 回读定位**）。容器=`meetwise-e2e-89547-1791434008401`（port 51824 · migrations applied=142 skipped=0）。

## 4. sidecar 账本实测臂（SELECT-only · 冻结投影 · 36 polls）

**投影（冻结口径）**：`ai_model_invocation` 仅 **count(by status) + min/max(created_at)**；`ai_report` 仅 **status×attempts 聚合计数 + last_error code 形状计数**。零行内容、零 secrets、零 PII。轮询 1.5s × 36 次（04:33:48.691 → 04:34:40.798），容器拆除（~04:34:42.5 finally `docker rm -f`）前最后一窗在卷。

**终读数（04:34:40.798 样本原值）**：

```json
{"ai_model_invocation": {"total": 14, "minTs": "04:33:44.177Z", "maxTs": "04:34:39.747Z",
  "byStatus": {"dispatching": 1, "failed": 4, "succeeded": 9}},
 "ai_report": {"byStatusAttempts": [{"status": "quarantined", "attempts": 3, "n": 2}],
  "lastErrorShapes": [{"lastError": "score_aggregate_empty", "n": 2}]}}
```

**口径行（model-op 席处方落字）**：live 计数=**succeeded+failed 双计**（9+4=13 计入 · dispatching 1 为终窗在途行如实另计）→ **live=14（终读数下限界 · teardown 竞态 ±最后轮询窗 ≤1-2 行）**；与 G7X T-1 口径（succeeded 5+failed 2=7 双计）同法。**est ≤10/run 期望面未中（14>10 · est-not-counter 如实记 · 硬帽 ≤200 未触 · 零超限中止）**。侧记：sidecar2（operation 分组投影 · 04:35:34 晚启）误中**外来** `meetwise-e2e-*` 容器（他 session 并行 run · 前缀匹配误靶）——查询全部 SELECT-only 计数、零写入、读数**零采信**（其库 schema 与本 run 无关）；外来容器零触碰如实登记。

## 5. 报告链钟分段（判据 b 读数 · ±1.5s 轮询分辨率）

| 段 | tick 序（sidecar 实测） | 时长 | 判 |
|---|---|---|---|
| **钟段① 主面试** | 04:33:59.7 首见 failed attempts=1（`score_aggregate_empty`）→ 04:34:04.5 attempts=2 → 04:34:09.2 **quarantined attempts=3** | ≈**9.5-11s** | 落 ~10-12s 预期带 ✓ |
| **钟段② 7a failLoop** | 04:34:26.6 首见第二行 failed attempts=1 → 04:34:31.3 attempts=2 → 04:34:36.1 **quarantined attempts=3** | ≈**9.5s** | 落 ~10-12s 预期带 ✓ |

tick 等距 ~4.7-4.8s/步（=dispatcher tick 5s 对齐 + 退避 2s/4s 重叠 · `report.ts:53`/`report-worker.ts:104` 机制一致）。**三判**：(1) tick 序 1→2→3 两面试同构 ✓ (2) `score_aggregate_empty` 计数=每面试 3 attempts 全部同 code（`ai_report` quarantined ×2 · lastErrorShapes 仅此一 code n=2）✓ (3) last_error 形状=**零** `schema_validation_failed`、**零** `e2e_forced_report_post_provider_failure`（`E2E_REPORT_FAIL_ALL` 注入未达——gate 先抛 · 刀① erratum ② 同象复证）✓。两段间 04:34:09→04:34:26 空窗=主旅程终态处理+failLoop 面试全轮（旅程正常构成）。

## 6. reviewLedger（receipt 原值 · 6 条有序）

`capability/image_ocr_unavailable` → `capability/voice_unavailable`（DASHSCOPE 未注入 → skipped · 承卷）→ **`worker/report_unavailable`（:209 主旅程）** → **`worker/report_unavailable`（:235 7a failLoop）** → **`worker/quiz_unavailable`（:249）** → **`worker/diagnosis_ready`（:255）**。

**越行序理（沿刀① 方法）**：A() fail-closed 首假即退 → `:247`/`:255` 两条 recordTerminal 严格位于 `:236-237` 之后 ⇒ **`:236-237` 本次实跑通过**（形状=report_unavailable+quarantined 如实兑现）。ledger 末条=:255 → 死亡窗 ∈**(:256, 旅程末]**（与刀① post-prove 收紧窗 ∈(:256,:356] 同族 · `GAP-CMOP03-POST7B` 鉴别刀域 · 本刀零触碰零归因）。durationMs=74094（刀① EXEC 78798ms 同窗族 · 零冲销）。

## 7. Non-claims

not a pass（EXIT=1 · 预期红兑现 ≠ suite green ≠ 判据面失败——四判据判读见 SUMMARY）· not post-7b 定位/归因（鉴别刀域零触碰）· not report_unavailable 产品语义终谳（P 裁定≠D 假说关闭）· not nail（post-prove dual + meetwise 授权 nail 归协调方）· not HA · not covered · not `releaseEvidence=true` · `g7SuiteGreen=false` · trio OPEN · **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）· alone ≠ dual · 零第二次 run · 零代码改动（11 钉+wiring 前后全等机检）· 外来容器零触碰零采信
