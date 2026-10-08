# REQUEST — **GODFN-1 · GAP-DEBT-BE-GODFN 拆解刀**（invoke 拆 phase / G7 卫兵移组合根 / interview.service 域拆 / AppError{code} 统一 · 四子刀可分批授权）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false`（十值照抄 · 本 stub 不改）· 另沿 `actualSpendCny=null` · GAP-DEBT-BE-GODFN P1 OPEN 保持
**Expert**: `mw-model-op`
**Knife**: `harness/godfn-decompose.md` · slice `godfn-decompose.slice.md`
**Base tip**: `9028eb70`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip）
**Date**: 2026-10-07
**Line**: **GODFN**（W3 前置）

## 请审什么（mw-model-op · invoke 状态机 / 模型端点治理 / 卫兵与预算边界 / 错误码域）

四子刀并陈拆解（各自范围/Ban/证明 · 可分批授权 · 每子刀独立走全链）。请审（model-op 首责面）：

1. **1a invoke 相位拆分的等价性边界（harness §2.1）**：五相位切分（resolve+prepare `:404-461` / claim `:463-482` / admit `:487-570` / reserve+dispatch `:572-629` / execute+settle `:631-773`）是否沿**既有事务边界**切、无新事务/无事务合并；Ban 错误码字符串与返回语义（含 `:557-559` `model_failover_cost_policy_mismatch` 特例口）、sleep(20)/deadline/60s lease 常量、`asPrincipal` 包裹层是否钉全；「主函数只编排 + 跨相位显式参数对象、禁闭包共享可变态」的切法是否会引入相位间状态漂移面；六关键路径新增断言（§2.1 ①-⑥）是否覆盖 invoke 状态机的全部对外可观测分支。
2. **1b G7 卫兵移组合根的治理边界（harness §2.2）**：monkey-patch interceptor（7 装+7 卸 · `(x as any)` 4 处）移 test-only + `g7-bootstrap` 生产入口摘除（`apps/api/src/main.ts:2` · `apps/worker/src/main.ts:9`）后，**生产文件 8 处 g7 感知点收敛为注入谓词**（model-client/context-budget/voice/voice-stream/embedder/reranker）是否可行且零语义变；价格表 `G7_PRICE_BOOK_CITATION='console-reported by user via coordinator 2026-09-23'` 聊天口述口径**原样保留**（核价另刀）是否如实；Ban 松动 fail-closed 门 / Ban 改激活语义 / Ban 借迁移装回生产路径是否钉死；「生产构建零 g7-bootstrap import 静态门」断言是否足以证明运行时包不感知测试态。
3. **1d AppError{code} 双轨收敛（harness §2.4）**：30 处 `catch(:any)`（亲测 · 债行 26 近似）逐处 narrow + message 轨位点（`invoke.ts:200` `model_circuit_half_open` / `model-client.ts:517` `g7_` 前缀 / `voice.ts:453` / cloud-* helpers）迁 code 判定时，**错误码字符串本体零变**的 Ban 是否足以保 13 处 `e?.code` 消费方零回归；行级 26 消费方清单作 EXEC 前置交付物（`receipts/godfn-decompose/1d-consumers.md`）的门是否够硬；1a/1d invoke 冻结面交叉（先 1a 后 1d）排序是否正确。
4. **prove 矩阵完备性（harness §5）**：1a 列（model-op02/breaker/failover×2/claim-join-orphan/model-cost-governance/estimate-threading×2/usage-calibration/interview-dispatch 族/adaptive 族）是否漏 invoke 触面 prove；「EXIT=0 或 base 同红零回归」口径与 E5 惯例一致是否如实。
5. **三钉 blob（harness §3.5）**：`run-e2e-isolated.mjs`（blob `796b12e4` · withhold `:2162-2163` 零触碰）· `text-endpoint-config.ts`（blob `005c68cc` · proof `:31-36` enshrined 零触碰）· `interview.service.ts`（blob `d43a569c` · 1c 本体必触 → blob 演进对照入收据）三处处置是否与 G7K/G7R 上游钉一致。
6. **新观察零处置纪律**：`vectorPlaneErasureLoop`（`apps/worker/src/main.ts:686`）未入 SIGTERM `:713` teardown 串——登记不修（行为变更 Ban）是否正确。
7. **Ban 清单确认**：Ban coding（本 turn 与拆解刀本体）· Ban prove 执行 · Ban live/Key 加载 · Ban SSOT/backlog 翻转 · Ban push-before-dual · Ban self-approve · alone ≠ dual。

拆解计划 ≠ coding 授权；本 stub PENDING；dual BOTH PASS 后由协调方分批授权各子刀 EXEC。

---

*REQUEST stub · GODFN-1 decomposition · Line GODFN · 2026-10-07 · PENDING awaiting mw-model-op + mw-e2e-ha pre-exec dual · alone ≠ dual · STOP*
