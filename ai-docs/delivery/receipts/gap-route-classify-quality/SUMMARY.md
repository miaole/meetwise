# SUMMARY — G7T · 红① route/classify 输出质量校准刀（EXEC · prompt v2 + 诊断先行 · 双 attempt 全记录）

**Line**: G7T · **Date**: 2026-10-07 · **Base**: `8c92b344`（origin tip · 双审 `8c9295a9` + `0efbcd3b` 在卷）· **v2 commit**: `430d4c84` · **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7t` · branch `line/g7t-classify-quality`

## 一句话定谳

**本刀指名面（classify 输出质量/RC-1a 单叶死路）已修复并经 live e2e 复证翻绿**（`validation_rejected ×2` → `result_validated ×2` · 零拒因）；**红① 用例仍红（EXIT=1 · 12P/2F/10S ×2 attempts 全记录）**，残留根因经 sidecar 判别 = **「begin 早于异步 classify 完成」时序面**（binding 零落：`route_consumption_event=0`/`interview_route_snapshot=0`，竞差 0–2s）——即 G7S POST 双审预留的「红①时序面独立夹具 REQUEST」，**超出本刀授权面，STOP 交协调方**。

## 交付链

| 件 | 位置/SHA |
|---|---|
| v2 三文件（C-RR-3） | `packages/ai-runtime/src/prompts.ts`（`job.route-classify.v1` `p.v1→p.v2`）+ `packages/domain/src/sealed-job-route-classify-binding.ts:28`（sealed 版本常量同步）+ `apps/worker/test/r2-p-worker-route-classify.proof.ts:114`（测试钉同步）→ commit `430d4c84`（恰 3 文件 +19/−9） |
| 零 validator 改动（C-MO-G1） | `packages/domain/src/job-route-classifier.ts` blob **`79ceded8` 全程不变**（`git hash-object` 亲算复验） |
| Erratum（C-MO-G1） | harness 末尾 append-only 段 + `00-diagnosis.md` Erratum 节（§1.2 #10「单叶=10000」误读更正 → 单叶 gap=0 结构性死路） |
| 诊断收据 | `00-diagnosis.md`（RC-1a 定谳：live `validation_rejected/conflict ×3` 同 G7S 形 + 单叶形状 ×3 逐字= p.v1 示例 + 确定性探针） |
| prove 收据 | `01-cmd2-ui-attempt1.md`（EXIT=1 · sidecar 缺位 OB-2）+ `02-cmd2-ui-attempt2.md`（EXIT=1 · sidecar 判别：根因位移） |

## v2 五要素逐项（C-RR-2）

1. **删单叶条款**：「仅 1 个 leaf 时 marginBps=10000」条款删除 + 单叶唯一示例删除 + 「绝不要把全部权重集中在单一 leaf」。
2. **恒 ≥2 叶减法 few-shot**：唯一 JSON 示例改为 2 叶 7000/3000 → `marginBps=4000`（7000−3000 精确减法演示 · 该形状经 validator 十齿逐项可过）。
3. **reasonCodes 双向指令**：分类成功 ⇒ `reasonCodes` 恰 `[]`；拒分 ⇒ `allocations=[]` 且 `reasonCodes` 非空——只居其一。
4. **万分比提示**：「allocationBps 是万分比（满分 10000，不是百分比 100）」。
5. **confidence 锚**：`confidenceBps >= 7000` 才算自信分类；不足走拒分路径不猜测；margin 差 <1000 的「难以自信区分」条款。

## 条件逐条自评（binding 条件 1–7）

| # | 条件 | 自评 |
|---|---|---|
| 1 | 诊断先行 | **兑现**——先钉后修：RC-1a 经 live（`conflict` ×3 同 G7S 形）+ 确定性探针双证；v2 落码刻意后置于诊断完成（实跑基线 `8c92b344`=p.v1）；RC 排序未被推翻（RC-1 加强定谳）；live 回放 4+4+3+6=**17 次 ≤ N≤20**（C-MO-G3 · 范围冻结 · 形状内存记录 · 零落盘 Key/原始输出 · name-only） |
| 2 | v2 五要素 + 零 validator | **兑现**——五要素逐项在卷（上表）；`job-route-classifier.ts` blob `79ceded8` 不变 |
| 3 | 触碰面 ≥3 文件 | **兑现**——恰 3 文件（prompts/sealed 常量/测试钉）+ erratum；全仓 `p.v1` 残留仅剩注释；`job-route-classify-binding:prove` + `r2-p-worker-route-classify:prove` 双 PASS |
| 4 | 温度决策 | **兑现（协调方裁决版）**——prompts-only；`SERVICE_TEMPERATURE` 映射面零触碰；残余方差如实登记：F2 维持（classify 无映射 → 供应商默认温度）+ v2 锚定行为观测（confidence 恰贴 7000、margin 恰贴 1000/1500——模型贴字面下限，闸内合规；见 `00-diagnosis.md` v2 预检段） |
| 5 | prove | **兑现（结果如实为仍红）**——CMD2 恰 1 次授权 + attempt 2 为同码仪表化迭代（两 attempt 全记录 · Ban retry-to-green 守住：attempt 2 目的=判别非翻绿，判别成功且根因位移定谳）；EXIT=1 原值 ×2；七字段全记录；预算 ≤200 内（est 远低于） |
| 6 | Pins/retained 原值 | **兑现**——十 Pin 零翻转（见下） |
| 7 | 零 SSOT/出边界 | **兑现**——SSOT/backlog 零触碰；红③ `:203` 断言面零触碰；sticky 通路零改动；`recruiting-bound.spec.ts` blob `de4991e6` 零触碰（blob 机检） |

## EXIT 契约落点（双向）

**仍红路径**（本刀实际落点）：EXIT=1 原值 ×2 + 逐 case 五分类（2 失败均=red① · 12P 不变 · 10S=capability skip ≠ green）+ **根因假设修正**（红① 根因从「classify 输出质量」修正为「classify 输出质量 ✚ begin/异步 classify 时序面」——前者已修复，后者残留）→ **迭代刀重走 REQUEST**（时序面：G7S 预留的独立夹具刀「等 route_decided 再 begin」或产品面消费时序语义变更——由协调方裁决派刀）。`g7SuiteGreen` **保持 false**（未翻转：仍红 + 无 post-dual + 无 nail）。

## Pins（原值 · 零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **`g7SuiteGreen=false`** · trio OPEN（EXIT 1/−/− · CMD2 ×2 attempts 如实）· 红① STILL OPEN（构成已变：classify 面绿 · 时序面残留）· GAP-G7K-API-REDS P1 OPEN（不翻）· Disclosure-1 OPEN · `actualSpendCny=null`

## 移交协调方（本刀边界外 · 不预claim）

1. **红①时序面裁决**：独立夹具刀（spec 等 route_decided 再 begin · G7S POST 预留口径）vs 产品面（begin 同步 fallback classify / worker consumer 提速/事件唤醒）——须新 REQUEST + 双审 + 授权；本刀零触碰该面。
2. post-prove 双审由协调方另派（本席不自批）；本 SUMMARY 的 classify 面翻绿读数与根因位移证据（sidecar 时间线）供其复核。
3. sticky 存量：无（fresh-run 策略 · 每 run 随机后缀建新岗）。

---
*SUMMARY · G7T EXEC · 2026-10-07 · v2 `430d4c84` · classify 修复面 live 复证绿（result_validated ×2 · 零 validation_rejected）· 红①仍红 EXIT=1 ×2 全记录 · 残留=时序面（sidecar 定谳 · consumption=0）· 超授权面 STOP 交协调方 · Pins 零翻转 · `actualSpendCny=null` · alone ≠ dual · 禁 push · STOP*
