# Receipt 00 — G7T §3.0 诊断先行（精确拒因判别 · C-RR-5 + C-MO-G3 授权范围 · 先钉拒因后落 v2）

**Line**: G7T · **Date**: 2026-10-07 · **EXEC 授权链**: pre-exec dual BOTH PASS（mw-rag-route `8c9295a9` + mw-model-op `0efbcd3b`）→ 协调方 EXEC 授权（prompt v2 校准 + 诊断先行阶段）· **实跑 code SHA**: `8c92b344`（v2 落码前 · p.v1 现行源码）

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | 诊断仪器（非 prove CMD）：scratch PG（docker `pgvector/pgvector:pg16` · `meetwise-e2e-g7t-diag` · migrations **applied=142 skipped=0** 与 G7S 基线同形）+ `node --import tsx apps/worker/.tmp/g7t-diag-classify.ts`（临时脚本 · gitignored · 不提交）· 两轮：round-1 direct+route 双调用 ×4；round-2 **route-only**（classifyJobRoute 唯一调用方 · 产品真实路径）×4 |
| EXIT | round-1 EXIT=0（数据在卷）· round-2 EXIT=0 |
| 时间戳（UTC） | 2026-10-07（本 turn EXEC 段） |
| 实跑 SHA | `8c92b344`（v2 前基线 · 诊断必须打 p.v1 现行源码——v2 落码刻意后置） |
| Key presence（name-only） | `MODEL_API_KEY=set`（`~/.meetwise-secrets/load-model-api-key.sh` 进程环境 loader · name-only · **零 Key 值读取零落盘**）· `profile=dashscope-cn-beijing model=qwen-plus` · 五个 `.env*` 全 ABSENT（未创建） |
| 关键输出 | **RC-1a 定谳（下节）** · live 预算：**8 次调用**（4+4 · ≤ C-MO-G3 N≤20 · 叶数形状全记录） |
| 预算 | 累计 live 调用 ≤200 报备口径内（本诊断 8 + v2 预检 3 = 11 · CMD2 另计）· `actualSpendCny=null`（无计价数据源 · Ban invented spend） |

## 精确拒因定谳（回答 REQUEST 核心问题：为什么 classify 输出过不了校验）

### 1. RC-1a 结构性探针（零模型 · 校验器确定性 · `validateModelRouteOutput` 零改动亲测）

| 输入形状 | 结果 |
|---|---|
| 单叶 `backend/general`@10000 + `marginBps=10000`（**p.v1 唯一示例形状逐字**） | `{"ok":false,"reasons":["conflict"]}` |
| 单叶 + `marginBps=0`（validator `:150` 单叶 fallback gap=10000−10000=0 派生形状） | `{"ok":false,"reasons":["conflict"]}` |

**单叶输出结构性不可过闸**（`:151` 恒等要求 margin=gap=0 与 `:152` 阈值 ≥1000 永久矛盾）——双审 F1/RC-1a 裁决 live+确定性双重复证。

### 2. Round-1（seam 直调 · 输出形状证据 · 叶数形状按 C-MO-G3 记录）

| ITER | 叶数 | leaves | bps | confidence | margin | reasonCodes | validateModelRouteOutput |
|---|---|---|---|---|---|---|---|
| 1 | **1** | backend/general | [10000] | 9000 | 10000 | [] | **conflict** |
| 2 | **1** | backend/general | [10000] | 7500 | 10000 | [] | **conflict** |
| 3 | **1** | backend/general | [10000] | 9000 | 10000 | [] | **conflict** |
| 4 | 0 | （空） | — | 0 | 0 | ["ambiguous"] | invalid_schema（classifyJobRoute 先走 known_not_sent 面） |

**3/4 次模型照 p.v1 唯一示例形状逐字输出**（单叶 + margin=10000）→ 必拒。分布：`{"0":1,"1":3}`；拒因 `{"conflict":3,"invalid_schema":1}`。

**OB-1（仪器面 · 非阻断如实登记）**：round-1 的 DB 行被双调用设计污染——直调先消费 `idempotencyKey` 写 redacted trace，classifyJobRoute 二次调用命中缓存触发 `sensitive_result_replay_requires_artifact` → `known_not_sent`。**仪器伪影非产品行为**（真实链路每 job 恰一个调用方；G7S ×2 即单调用方）；round-1 的 4 行 DB 读数不作归因依据。

### 3. Round-2（route-only · 产品真实路径 · DB 忠实 · C-RR-5 判别查询）

`job_route_decision`（fresh jobs ×4 · 每行恰 1 次真实外发）：

| attempt_outcome | reason_codes | ×N | 与 G7S 红①签名对照 |
|---|---|---|---|
| **`validation_rejected`** | **`["conflict"]`** | **3** | **同形**（G7S CMD2：`validation_rejected` ×2 未查 reason_codes；本轮补齐=conflict） |
| `known_not_sent` | `["ambiguous"]` | 1 | 模型自走拒分路径（p.v1 拒分指令完整执行面） |

**定谳**：红① `validation_rejected` 的精确拒因 = **`conflict`** = RC-1/RC-1a（margin 恒等自洽 + 单叶死路）：模型对红① OOD 输入（`浏览器绑定岗位-<hex>` / `高并发, 幂等, 限流` / description 恒空）依 p.v1 唯一示例输出单叶 `backend/general`@10000 + `marginBps=10000`，`validateModelRouteOutput:150` 单叶 gap=0 → `:151` 恒等拒 → `:152` 阈值拒 → sticky `route_unresolved`。**RC 排序未被推翻（RC-1 加强定谳；RC-2/3/4/5 本样本零出现）→ 按 EXEC 授权继续落 v2，不停不停迭**。RC-4（叶覆盖）再降权佐证：模型自然叶 `backend/general` 存在且被选中——非覆盖缺口。

## Erratum（C-MO-G1 · 本席 REQUEST harness §1.2 #10 误读更正 · append-only 原文未动）

本刀 REQUEST harness `harness/gap-route-classify-quality.md` §1.2 表 #10 括注「（单叶=10000）」**误读**：该括注抄自 p.v1 prompt 的自述条款，而 validator 代码（`job-route-classifier.ts:150`）单叶 fallback=`JOB_ROUTE_TOTAL_BPS` → gap=**0**；`单叶=10000` 的输出恒被 `:151/:152` 拒——**恰是单叶死路本身**，也是 v1 必拒示例的根源。更正以本收据为准；harness 原文 append-only 保留（erratum 段另附于该 harness 末尾）。双审（`8c9295a9` OB-RR-2 + `0efbcd3b` F1）先于本席发现，承卷更正。

## v2 生效预检（落码后 · CMD2 前 · route-only ×3 · 累计 live 11/≤20）

| ITER | routeStatus | DB attempt_outcome | allocations |
|---|---|---|---|
| 1 | `route_decided` | `result_validated` | 4 叶 4000/3000/2000/1000（=10000）· confidence 7000 · margin 1000（4000−3000 精确） |
| 2 | `route_decided` | `result_validated` | 3 叶 4500/3000/2500（=10000）· confidence 7000 · margin 1500（精确） |
| 3 | `route_decided` | `result_validated` | 3 叶 4500/3000/2500（=10000）· confidence 7000 · margin 1500（精确） |

**3/3 过闸**。残差登记（C-MO-G2）：confidence/margin 均精确贴 prompt 锚值（7000/1000/1500）——模型贴字面下限，闸内合规但锚定行为真实存在；**prompts-only 决议维持**（`SERVICE_TEMPERATURE` 无 `job.route-classify.v1` 映射 → live 跑供应商默认温度，F2 扩面钉 0 须重新双审，本刀不动，残差如实入卷）。

## Non-claims

诊断收据 ≠ prove 收据 ≠ 红①清除（CMD2 另证）· v2 预检 3/3 ≠ e2e 绿 · scratch DB 读数 ≠ 生产读数 · alone ≠ dual · 本收据不翻任何 Pin · `g7SuiteGreen=false` · `actualSpendCny=null`

---
*Receipt 00 · G7T §3.0 诊断先行 · 2026-10-07 · 实跑 `8c92b344`（p.v1）· RC-1a 定谳：validation_rejected/conflict=单叶死路（p.v1 唯一示例=必拒形状）· live 11 次 ≤ N≤20+预检 · Key name-only · STOP*
