# G7FIX-4R S1 EXEC 收据 — duplicate re-roll 根因刀（判重命中→有界换题）

- 席位：mw-core EXEC（mw-reroll-exec）
- 日期：2026-10-07
- 工作树：/Users/miaole/Desktop/golucky/meetwise-line-reroll-exec（branch `line/g7fix4-reroll-exec`，基线主线 `0aa1d503` + 蓝图 cherry-pick `49c7122d`）
- 唯一蓝本：`ai-docs/delivery/harness/g7fix4-reroll.md` @ `49c7122d`（`draft_rev5:pre_exec_dual_PASS`，协调方 EXEC 授权）
- 范围执行：蓝本 §5 S1（worker seam re-roll + domain provenance optional 字段 + §4 全键 prove）·零图零 lifecycle 零 DB 零 e2e 零 migrations

## 1. 生产 diff 面（恰蓝本 §5.S1 两文件）

| 文件 | 改动 |
|---|---|
| `apps/worker/src/adaptive-interview-service.ts` | `MAX_DUPLICATE_REROLL=2` 上限常量；`generate` 键/revision 参数化（初诊 `:0` 键+基础 revision 原值不变）；判死点改写为有界 re-roll 循环（每 roll 同步换 `:r{k}` 键+revision、重过同一组 schema/verbatim/引文闸+wasAsked 复检）；耗尽仍 `unavailableGeneration('duplicate_question')`（provenance 携带 `reroll:2`）；成功面 provenance 携带 `reroll:k` |
| `packages/domain/src/question-generation.ts` | `QuestionGenerationProvenance` 增 optional `reroll?: number`（类型级零迁移零 SSOT） |

行级披露（同文件内、语义改写的机械必要延伸，非跨文件超范围）：
- 原 :150-151/:164/:166（`generate` 构造/初诊调用/键常量）：键+revision 参数化——蓝本 §1.4 自列 :151/:166 为键面、§2.2 强制 re-roll 必换键+revision，参数化是唯一无 payload 复制风险的落法。初诊字面量逐值保留。
- 原 :147-149 注释（蓝本 §1.4 所引「cannot create a second :d1 request」自证面）：末句更新为 G7FIX-4R 后语义（命中不再首撞即死、换题走新 revision=新可审计 logical node、同节点仍单次派发）。原注释若保留将与新码面直接矛盾。
- :86-91（attempt 闸）·:167-175（provider/schema/business 分类判死）·:181-184（duplicate_check_failed）·:188-193（引文复检）：零触/逐字节保留（:188-193 代码行零改）。

## 2. §4 六键 prove EXIT 原值（终跑，`pnpm -C apps/worker prove:g7fix4-reroll`）

隔离环境：手动起临时 pgvector/pgvector:pg16 容器（与 `scripts/run-e2e-isolated.mjs` legacy 路径同构：`meetwise.e2e_run_token` 服务端 nonce + `E2E_ISOLATED=1` + `E2E_TEST_CONTAINER`/`E2E_TEST_TARGET_TOKEN` 对 + 属主连接跑 `pnpm -C packages/db migrate` applied=152）；`DASHSCOPE_*`/`LANGFUSE_*` 全剥离。**全 fake seam（scriptedModelClient/自写 scripted ModelClient），零真实模型外呼，est live=0。**

| §4 键 | 断言要点（全部 PASS） | EXIT |
|---|---|---|
| ① 主断言（命中→re-roll→新题成功） | ok===true 无 unavailable；normalizeQuestion(q)≠S1 且=S2；invoke 计数===2；第二次键=provenance.idempotencyKey===`:r1` 精确相等；provenance.reroll===1∧origin=model；DB 恰两笔 invocation 行（基础键+`:r1` 键）；DB 恰两棵 logical node（基础与 `:r1` revision header digest 各一行，`registryLogicalNodeKeyDigest` 硬算） | 0 |
| ② 耗尽回归 | 恒返 S1 → 撞满上限仍 `unavailableGeneration('duplicate_question')`；provenance.reroll===2∧键停 `:r2`；调用总数===3（含初诊）；errorCode 保持 duplicate_question（generationFailureOf reason 前置不变） | 同上 |
| ③ fail-closed 三面零位移 | wasAsked throw→`generation_unavailable`+`duplicate_check_failed` 零 re-roll（键仍 `:0`、reroll 缺省、模型调用===1）；attempt=1→`attempt_replay_forbidden` 零外呼；provider 确定性失败→既有分类判死（≠duplicate_question、分类自洽、零 re-roll 轨迹） | 同上 |
| ④ DB/registry 契约负证 | 同 revision 异键首投 ok（注册 canonical 头）；同 revision 异键再投→`logical_node_canonical_invocation_mismatch`（0088:272 实证）；新 revision 形过 `resolveModelOperation` ok∧logicalNodeKey 相异∧含 `:r1` revision | 同上 |
| ⑤ 事件面回归 | 真实 lifecycle（B 端 bound 面）start 判死：reason=`generation_duplicate_question`（generationFailureOf 真函数路径）；终态 provenance reroll===2；调用总数===3；事件键恰一 `assessment_unavailable:generation_duplicate_question` 零 question_ready；事件 payload provenance 自带 reroll===2；interview=failed∧预留释放；全链键账 `:0`→`:r1`→`:r2` 恰三笔 | 同上 |
| ⑥ neg | 见 §3 | — |

终跑合计 **25 PASS / 0 FAIL，EXIT=0**。原值日志：`2026-10-07-g7fix4-reroll-prove-raw.log`（本目录）。

### 2.1 prove 迭代披露（禁 retry-to-green 核查）

终跑前有 4 次未绿运行，全部为 **prove 脚本自身的夹具装配缺陷**，零生产码改动、零蓝本原因红：
1. 缺 `E2E_TEST_CONTAINER` attestation env（隔离靶证明对不齐）；
2. 全部 seam 测试线程的 interview 行误插同一属主 → `privacy_fenced_pre_dispatch`（privacyInterviewId 跨属主被 privacy 闸 pre-dispatch 拦截）；期间以调试脚本证实 seam 耗尽语义本身正确（调用 3 次、duplicate_question、reroll:2、键 `:r2`）；
3. `resume.id` 为 uuid 类型，测试串非法；
4. owners.bound 缺 entitlement bucket seed。
两次生产文件夹具无关的收据修正：`ai_model_logical_node_header` 对 app_role 不可读 → header 断言改属主连接（lifecycle proof 同先例）。生产两文件自首次 prove 起逐字节未变。

## 3. neg 面（同隔离 PG，全绿零弱化）

| 面 | 结果 | EXIT | 原值日志 |
|---|---|---|---|
| `prove:adaptive-life`（含 G7FIX-4 对称标记/finalize/mark-then-recover 全键） | 42 PASS / 0 FAIL | 0 | `2026-10-07-neg-adaptive-life-raw.log` |
| `prove:memory`（判重归一化精确+RLS+隐私） | 11 PASS / 0 FAIL | 0 | `2026-10-07-neg-memory-raw.log` |
| `prove:adaptive-degrade`（fail-closed 出题+unscored 评分） | 11 PASS / 0 FAIL | 0 | `2026-10-07-neg-adaptive-degrade-raw.log` |

tsc：
- `tsc -p apps/worker/tsconfig.json --noEmit`：base（stash 后）41 errors == 本刀 41 errors，**diff 逐行为空 → 零新增**（41 条全部为未触文件既有）。
- 官方门 `pnpm typecheck`（`tsc -p tsconfig.e2e.json`）：**EXIT=0**。

## 4. 停止条件核查（无命中声明）

- a) 现状码面 vs 蓝本锚点：:178-187/:180/:186-187/:86-91/:147-149/:151/:166/:154/:156/:157-158/:188-193/:167-175/:181-184/:82-196、domain :24-31/:54-63/:13、memory-service :12-14、memory-store :27-42、registry :243-263、0088 :272/:417-426 —— 全部亲读相符。**未命中**。
- b) S1 外文件：零触图/ai-graphs、零触 adaptive-lifecycle.ts（§4.2/§4.5 经其公开面 `startAdaptiveInterview` 真函数驱动，源零改）、零触 packages/db、零触 e2e、零触 migrations。**未命中**。
- c) prove 键非蓝本原因红：4 次迭代红均为测试夹具装配（见 §2.1），非语义红。**未命中**。
- d) live 调用/Key 值：est live=0（scripted 全覆盖+云凭据剥离），零 Key 值使用（Key 仅 name-only）。**未命中**。
- e) 蓝本未预见语义分叉：唯一裁决点是 §4.2/§4.5 中 `generationFailureOf`/`writeGenerationUnavailable` 为模块私有函数——按蓝本「prove 判据」以真实 lifecycle 公开面（`startAdaptiveInterview`→unavailable.reason→事件键）整链驱动替代 import 私有函数，证明力更强且零触源码。**无语义分叉，未命中**。

## 5. pins 十一值照抄（蓝本 §6，零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null

## 6. Non-claims

本收据 ≠ G7FIX-4 finalize 契约刀 ≠ critique 场内判重语义（S2 另裁，residual：`generate-question.ts:69-80` critique duplicate 面仍旧）≠ G7 收官 ≠ g7SuiteGreen 翻转 ≠ 判重/记忆读取语义改动（只改判重命中后的后果）。实现不自批：本收据为 EXEC 自证材料，post_prove_dual 双审未发生前不视为已验证（`exec:awaiting_post_prove_dual`）。

## 7. 残余登记

- 蓝图 §5.S2（critique 场内 duplicate 面同语义化，ai-graphs 跨包）未做，本刀外。
- `scripts/run-e2e-isolated.mjs` 未注册 `g7fix4-reroll:prove:raw` 目标（蓝本 §4 只钉 worker 级 `prove:g7fix4-reroll` 命名；复跑需协调方另裁 runner 注册或按本收据 §2 同构手动起隔离 PG）。
- re-roll 复用基础 progress attemptKey（`:0`）——生成进度事件面观测语义未随 re-roll 细分（蓝本零要求，TOKSTREAM 面零触）。
