# REQUEST — **F-F · interview_job last_error 甄别刀**（仪器化重跑 + 容器拆除前 DB 只读甄别 · ≠ 修复 ≠ trio 翻绿）· pre-dual · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · trio OPEN · GAP-G7K-API-REDS **P1 OPEN** · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/g7r-ff-last-error-discriminator.md` · slice `g7r-ff-last-error-discriminator.slice.md`
**上游**: G7R post-dual **mw-model-op POST 段 §3.4-C 即本刀母本**（「F-F 诊断 attempt：协调方授权一次仪器化重跑，跑后受权从 DB 读 `last_error`/账本分布并落 name-only 收据——不破 stderr withhold `:2093`」）· G7R post-dual BOTH PASS `bfd868e0` · G7R EXEC 实跑 code SHA `3767f783`（trio EXIT 1/1/1 retained）
**Base tip**: `bfd868e0`（full `bfd868e028821531db0dcb905066730d56f64685` · 本机 origin ref 实测 · **如实登记：本 turn fetch 两次网络失败，以本机 ref 为基线恰满足预期 ≥`bfd868e0`；EXEC 期重 fetch 重钉** · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **F-F**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained） |
| Trio | **OPEN**（EXIT 1/1/1 真实业务红 retained） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态） |
| `actualSpendCny` | **null**（沿 G7R/I 线 · Ban invented spend） |

## 请审什么（mw-model-op · live 调用面 / 模型账本判读 / 预算与 Key 卫生 / 甄别器码面）

Line F-F · **interview_job last_error 甄别刀**（贵席 G7R post-dual §3.4-C 交付的执行化）。请审（model-op 首责面）：

1. **甄别器码面（贵席 POST 段裁决的复验）**：`markJobFailed` 持久化 `error.message.slice(0,500)` → `interview_job.last_error`（`packages/db/src/interview-jobs.ts:214-217` 亲读）；throw 路径签名链 `interview-consumer.ts:93`（`interview_unavailable{reason,kind}`）+ `:162`（`failClaimedInterviewJob`→`terminalizeUnsettledInterview('job_failed', kind)`）+ catch-all `:370-381`；invoke 内部态 throw 值域 `model_invocation_admission_state`/`model_execution_aborted`/`model_invocation_dispatch_state`/`model_cost_unknown_state`（`invoke.ts:494/:524/:562/:601/:662/:683`）；`graph_fence_lost` 走 requeue 不落 failed（`:374-377`）；reaper 写 `last_error='reaped:worker_died'`（`interview-jobs.ts:251`）——判读表 §1.4 逐值域映射与行号是否全中、有无漏域（如 answer 面特有 throw）。
2. **H0-alt-1 出局的引用纪律（贵席 §3.4-B 判读表的下游）**：协调方 Key 直探（F-A-1 配对 200 成功 + 错配 401 复现）作为**输入事实**引用——本 turn 零 Key 值读取零复跑；**401/404 在 invoke 层扁平化为 `provider_rejected`（`model-client.ts:515-516`）的不可分注记是否随 `provider_rejected` 判读行保留**；EXEC 读数若现 `provider_rejected` 行（与直探结论张力）→ 如实登记回协调方的路由是否在案（Ban 就地解读洗掉张力）。
3. **读取窗口机制与 DB 账本面**：sidecar 直读隔离 PG（凭据=runner 自身 `HOST_SQL_PROBE` 同面 `:2298-2300`+`:2119`；`meetwise.e2e_run_token` 系 server GUC 非连接门的判定）——连接面/凭据面/采样时序论证是否成立；SELECT 列白名单（Ban `interview_job.payload`、Ban `ai_invocation_trace.output`——虽然 `markJobFailed`/`markJobDone` 均 `payload=payload-'answer'` 剥除，最小读面纪律）是否守住；`ai_model_invocation` 三态（succeeded/failed/unknown · `completeModelInvocation`/`markModelInvocationUnknown` `packages/db/src/model-invocation.ts:139-158`）+ `ai_invocation_trace` success-only（`invoke.ts:348-352` 注释自证「只在输出校验通过时调用」）的判读语义是否如实。
4. **预算与 live 面**：甄别 run 沿 G7R 授权口径 **≤200 内报备**；诚实结构估——H0-alt-5（pre-model throw）成立则大概率零 live 调用（G7R EXEC 实测 <50 佐证失败未达 provider）；读数反证则与 G7R CMD 同量级；超限即停如实记中止（不洗 not_run）；voice/OCR/ASR/TTS 无 DASHSCOPE key → honest capability skip = 0 调用；**`actualSpendCny=null` 保持**（Ban invented spend）。
5. **Key 卫生（硬 · 沿 C-MO-6/C-K6 全量）**：本刀读数**零模型 Key 依赖**（DB 直读用容器固定测试凭据 `meetwise`/容器口令——测试基建凭据非 secret 面，但 Ban 入收据原文，name-only 纪律同）；EXEC 期模型 Key 仅 name-only 探针（loader 进程环境）；**Ban 写任何 `.env*`**；Ban Key 值/fingerprint 入 receipt/log/commit/截图。
6. **甄别→修复路由边界（C-MO-11 延续）**：读数定谳 H0-alt-5 子面（a 结构门 / a′ start locator / b invoke 内部态 / c 基建）→ 修复走**对应产品刀另 REQUEST**；读数反证 provider/准入面 → 值迭代须协调方**新 EXEC**（C-MO-7 纪律，Ban 就地换值重跑）；**Ban 为绿改产品**（EXEC 期顺手修=违纪）；**Ban 碰 `:68`/`:70`/`:71` 已清面**（registry start-job chat ops `wired:true` 裁决域零触碰零加固）。
7. **定谳措辞（C-MO-2/C-MO-8 延续）**：SUMMARY 根因定谳段按证据强度措辞——「与 H0-alt-5·X 一致」≠「H0-alt-5 已证」；三面读数（last_error + invocation 分布 + trace 计数）**联合判读**，单一读数不定谳；矛盾读数（混合面）合法且如实记。
8. **Ban 清单确认**：Ban coding · Ban prove 执行（本 turn 零实跑零 live 零 Key 加载零 DB 连接）· Ban push · Ban SSOT/backlog 状态翻转（GAP P1 OPEN 不翻）· Ban 洗绿/Ban retry-to-green/Ban flake 记法（备选 iso run 触发条件唯一且登记）· Ban 改 withhold 机制（`run-e2e-isolated.mjs` 零 diff）· Ban 碰 sibling 归档（G7R 收据零改写）· Ban self-approve · alone ≠ dual。

Trio stays **OPEN**（EXIT 1/1/1 真实业务红）。`g7SuiteGreen=false`. `actualSpendCny=null`. **甄别器 = last_error 一步定谳工具，非翻绿工具** · 读数 ≠ 修复 · 判读表 ≠ 根因断言 · **Ban 假绿叙事**。

本 stub 不授权 prove 执行 / 甄别 run / DB 连接；pre-dual BOTH PASS 后由协调方授权 EXEC（run 面裁定与机制 B 预批由协调方落字）；implementer 不自批；本 PASS（如落）仅为 mw-model-op 半签，不代签并行 peer mw-e2e-ha。

---

*REQUEST stub · F-F last_error discriminator · Line F-F · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-dual · alone ≠ dual · 禁 push · STOP*
