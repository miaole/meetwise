# Harness — **GAP-UC004-FI3-GRAPH-WIRING · 产品接线刀**（Line T · NAIL · **`post_prove_dual_pass`** · FAULT/A3 stays gap）

**Status**: **`post_prove_dual_pass`**（Line T nail · Candidate A wired · fault prove EXIT=0 · dual BOTH PASS · **EXIT0 ≠ A3 closed** · `GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` / UC-E2E-004 FAULT **stays gap** · Ban fake close A3 · Ban covered flip · Ban suite green · Ban Meridian · Ban HA claim · Ban coding · Ban live · Ban secrets · Ban force-push · Ban self-approve beyond this authorized nail）

> **REQUEST-era note（historical · retained）**: this file began as REQUEST `draft:awaiting_pre_exec_dual`. Prove tip **`d9ddb13`** · code **`0a3c8a8`** · prove-tool **`b80bf92`**≡`ced3691` · EXIT **0**（4×0）· post dual mw-e2e-ha `a655ffd` + mw-model-op `84f8eeb` BOTH PASS. Lifecycle advanced to **`post_prove_dual_pass`** by Line T nail only.
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`377e7fc`** / full `377e7fc4fa1b35b85ebf524b668469caf66de2bc`
**Knife**: **GAP-UC004-FI3-GRAPH-WIRING（Line T）· FI-3 产品接线刀：AiGraphRun(career-path) 图失败状态机** —— A3 / `UC-E2E-004` FAULT 关闭的前置；C''/P 线钉死的**结构性不可达项**的接线 REQUEST
**Gap id**: 服务的 gap = **`GAP-UC004-FAIL-A3`**（FI-3 腿 · C'' `0652a08`/`a27e384` 原钉，不改名、不开新行）；本刀自身刀名 `GAP-UC004-FI3-GRAPH-WIRING`（文件命名沿此）
**Case id**: **`NHP-004-FAULT-01`**
**Row**: **`UC-E2E-004`** · not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-025
**Experts**: `mw-e2e-ha` + `mw-model-op`（图执行/派发预算域 · stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权 coding）

## 现状如实陈述（先读证据 · 行号按本树 `377e7fc`）

`apps/api/src/modules/interview/interview.service.ts:768-791`（C'' 时为 :749/:764，偏移来自 base 树其他落刀，P 线 receipt 已如实披露）：`generateCareerPath` = **同步** `deriveCareerPath`（:783，`packages/domain/src/career.ts` 纯逻辑无 IO）+ 单条 `INSERT INTO career_path … ON CONFLICT` upsert；`denyPublicPreviewWrite` + `guardInterviewPrivacy` 前置。**无任何 AiGraphRun(career-path) 接线**：

- `packages/ai-graphs/src/index.ts:3` 仅有**路线图注释**（「四图之二已落骨架：resume-quiz、mock-interview。career-path/report 后续按同一注入约定补」）；`packages/ai-graphs/src` career 图文件 = **none**；
- `ai_graph_run` `graph_name='career-path'` rows = **0**（C'' run4 attempt 4 实测 + P 线 2026-10-05 fresh re-run 实测，两树两次独立一致；Ban 伪造，无伪造行）；
- 现有图执行惯例可参照：`packages/db/src/interview-graph-lease.ts` `withInterviewGraphFence`（`ai_graph_run` 插入 `status='active'` + `version=version+1` + 终态释放；`uq_active_run` partial 唯一索引只锁 `('created','active','waiting_user','migrating','paused')`，`failed`/`succeeded` 终态天然让出重试槽）。

结论：FI-3「图失败状态机 active→failed 落库」**结构性不可达** → `pnpm uc004:career-path-fault:prove` 全量 **EXIT=1**（attempts：CONTROL 0 / FI-2 0 / **FI-1 0（P 线修复后转 0）** / FI-3 1 UNREACHABLE）。A3 关闭缺的最后一腿即本刀。

**证据链**：C'' receipt `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`（FI-3 段 §2 attempt 4 / §4 Findings.3 / §Appendix run4）· C'' post-prove dual `aafdffbe`（mw-rag-route）+ `4d8dc5d`（mw-e2e-ha）BOTH PASS · C'' nail `a27e384` · P 线 harness `harness/gap-principal-pool-error-listener-fix.md` · P 线 fix `f19ecba`（矩阵引 `56fc1ea`）+ 回归 prove `3a8bc0f` + nail `845d357` · P 线 receipt `receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md`（FI-1 1→0 双 fresh 验证；FI-3 UNREACHABLE 原文）· 矩阵 `e2e-requirement-coverage-matrix.md:115/:173`（FAULT 列 stays gap + FI-3 未接线明示）。

## Quoted from the files

`ai-docs/requirements/use-cases/e2e-scenarios.md:125`（UC-E2E-004 E-gen-fail 原文）：「E-gen-fail | 图不可恢复失败 | `AiGraphRun active→failed`，业务事实保全 | 用户可见降级文案 + 可重试，不消耗权益（career-path 不计费，D1）」。

`e2e-scenarios.md:133`（TC-E2E-004-fail 原文）：「TC-E2E-004-fail · graph(fake-model) · 注入图失败，断言 `AiGraphRun=failed` + UI 降级 + 额度不变」。后置：「失败 → 无业务事实污染」。

`e2e-requirement-coverage-matrix.md:115` row `UC-E2E-004`：NEG **gap** · FAULT **gap**（FI-1 缺陷已修复、FAULT 列状态不动——FI-3 `AiGraphRun(career-path)` 未接线、全量 prove EXIT=1 诚实保留）· BOUND **gap** · ADV **blind**。

C'' harness §EXIT 契约原文：「EXIT 0 = A3 真证据成立，当且仅当：FI-1 与 FI-2 每次注入 F1+F2+F3 全部成立，**且** FI-3 可达并观察到 `AiGraphRun=failed` + 降级 + 重试 + 额度不变。EXIT 0 也不自动翻行：A3 关闭还须 post-prove dual PASS + 协调方授权」。

`packages/ai-graphs/src/index.ts:2` 注入约定：「纯图拓扑（不引 db/contracts 运行时；模型/checkpointer 经注入）」。

`packages/domain/src/career.ts:1-2`：「职业路径（**纯逻辑,无 IO**）：综合分 + 弱项 → 准备度/层级/里程碑。保留不确定性、不替用户做决定」。

## 接线方案候选（≥2 · 双审裁决后执行 · 本 commit 不写码）

| 候选 | 内容 | 利 | 弊 / 取舍 |
|------|------|----|----------|
| **A · 图包装 derive（推荐）** | 新增 `packages/ai-graphs/src/career-path.ts` 单节点图：dep = 注入的 `deriveCareerPath`（纯本地计算，沿 ai-graphs 注入约定）；`generateCareerPath` 在 `asPrincipal` 内 create/reuse run 行（`graph_name='career-path'`、`thread_id=interview id`、`status='active'`、`version+1`）→ 图执行（derive）→ 落 `career_path`（原 upsert 原样）→ 成功 `active→succeeded`；失败 `active→failed`（`version+1` 落库）后 rethrow | 最小语义变更；**对外契约零变**；FI-3 真可达真可观察（真实 active 阶段 + version 转换证据）；账本对称（成功/失败都有 run 行）；零模型调用；uq_active_run 现状即适配 | 图是「薄包装」——Ban 把它叙述成完整图化（E2E-MAIN/GRAPH gap 不因此关闭）；触碰面见下节。默认推荐，双审可否决 |
| **B · derive 失败时落 failed run（仅失败记账）** | happy path 完全不动（零 run 行）；derive/INSERT 抛错后**事后补写**一条 `failed` 行 | 触碰最小 | **诚实结构性缺陷**：failed 行无 active 阶段——「active→failed」状态机是装饰性的，事后补记账 ≠ 图运行；A3 要求的转换证据（version 递增）做不出；成功路径零观测、账本不对称；与「Ban 伪造 failed run」边界模糊（行是真的、转换是假的）。**默认不推荐**，除非双审给出强理由并明示接受上述语义降级 |
| **C · 完整图化** | 多节点图：derive + 业务双校验（保留不确定性）+ 落库 + GrowthTimeline/CapabilityProfile 更新 | 最贴近场景主流程 | **越界**：侵入 `GAP-UC004-GROWTH-A1A2` / `GAP-UC004-UNCERTAINTY` / `GAP-UC004-GRAPH` / `GAP-UC004-E2E-MAIN` 等其它刀的 gap 面；若校验/生成节点引模型则触发模型调用边界（须申报 + 默认禁 live）；对同步 derive 契约风险最大。**本刀拒绝**（scope）；如双审认为必要，拆独立刀 |

**共同铁律（所有候选 · 违反任一 = 执行层 FAIL）**：

1. **诚实原则**：接线不得伪装成功——失败必须**真落 `AiGraphRun=failed`**（真实 active 阶段 + `version` 递增的转换证据）；**Ban 伪造 failed run**；Ban 无 active 阶段的装饰性行；Ban 200-假成功；Ban 吞掉图失败。
2. **对外契约冻结**：成功响应体（`{readiness, level, milestones}` 原形）/ 错误信封（`assessment_required` 409 · `insufficient_evidence` 409 · internal_error 500 统一信封）/ GET 语义（无行 404，不返回失败产物）/ `deriveCareerPath` 纯函数本身（`packages/domain/src/career.ts` 零改动）全部原样。图化是状态机接线，**不是契约改写**；Ban 为绿而改变业务语义。
3. **fail-closed**：状态机转换自身失败时（如 FI-1 连接断瞬间 UPDATE 也失败）**如实记录实际行为**（行可能停留 active），Ban 把转换失败伪装成终态成功；重试路径不得被残留 active 行卡死（沿 `withInterviewGraphFence` 的 latest-row `FOR UPDATE` 复用/接管惯例；正常路径 finally 释放、崩溃路径 TTL 让位同款语义）。执行期按实测断言，Ban 假设、Ban 编造。
4. **产品语义通道**：run 行读写走 `asPrincipal`（RLS / 0059 privacy fence 同产品语义）；`graph_name='career-path'`、`thread_id=interview id`、`owner_user_id=principal`。
5. **零模型调用边界（Candidate A/B）**：derive 保持纯本地计算，不引 model-client、不改 model-operation-registry/binding（Line C 域）、**不写 `ai_invocation_trace`（Ban 伪造 trace）**、prove 全程零 live 模型端点。若双审裁决的方案含任何模型调用，必须显式申报（调用点/操作/预算归属）且**默认禁 live**；`mw-model-op` 一票有否决权。
6. **注入 seam（FI-3 可达性前提）**：TC-E2E-004-fail 的注入法是 `graph(fake-model)`——即 ai-graphs 依赖注入约定（模型/dep 经注入）的诚实用法。实施为 **thread-scoped、env-gated 的 dep 覆写**（默认关闭；env 未设 = 零行为差；仅指定线程的 career-path 图失败，同进程其余线程不受影响——与 prove 单 API 子进程多 attempt 共存）。seam 键名/解析执行期定，交双审；Ban 用 seam 改变正常业务语义、Ban 在产品里开无申报的洞。

## 触碰面（Candidate A 精确 file 清单 · 双审裁）

1. `packages/ai-graphs/src/career-path.ts`（**新增**：图构建 + 注入 dep 类型；不引 db/contracts 运行时）
2. `packages/ai-graphs/src/index.ts`（导出 2–3 行；即 C'' 探针 `careerInIdx` 计数的接线证据位）
3. `apps/api/src/modules/interview/interview.service.ts`（**仅 `generateCareerPath` 区段** :768-791 + 注入 seam 解析；Ban 触碰其他 interview 路径）
4. 必要测试（随 coding 授权）：图构建/状态机单测（拟 `packages/ai-graphs/test/career-path.proof.ts` 或 api 侧等价：成功 succeeded 转换 + 失败 failed 转换 + version 证据 + env 未设零行为差）
5. prove 工具层：`apps/api/test/uc-e2e-004-career-path-fault.proof.ts`（FI-3 attempt 升级 + FI-1 图行探针等强改写——见下节，属申报的工具层最小增量，交双审裁）
6. 迁移：**无**（`ai_graph_run` 现有 schema 足够；graph_name 自由文本；`uq_active_run` partial 索引已适配终态重试）

**Ban 借刀改**：其他 interview 路径（assessment / learning-plan / report / adaptive / turn / events / answer）、outbound 主链（HTTP client / qdrant / redis）、`packages/db/src/principal.ts`（P 线刚落刀，Ban 借）、model-client / model-operation-registry / model-operation-binding（Line C 域）、worker lifecycles（`apps/worker/src/*`）、`packages/domain/src/career.ts`、SSOT 三件（矩阵 / checklist / backlog）。

## prove 方案（授权后才执行 · 复跑 P 线既有 prove）

- **CMD 不变**：`pnpm uc004:career-path-fault:prove`（三层隔离壳：root → `scripts/run-e2e-isolated.mjs …:raw` → apps/api `prove:uc004-career-path-fault`；per-run 随机容器 + 动态端口 + loopback/nonce attestation 同 C''/P 线惯例）。
- **FI-3 attempt 从「静态不可达探测器」升级为「真注入 + 真观察」**（prove 工具层增量，随本刀 coding 一并授权）：
  - 新增第四个种子面试 `IV_FI3`（种子法同现有三例）；API 子进程以 thread-scoped 注入 env 启动（仅 `IV_FI3` 的 career-path 图失败）；
  - **断言集（等强新增 · Ban 减既有项）**：① POST 失败可解释（`kind==='http'` ∧ `status>=400` ∧ 实测错误体——预期与 FI-2 同形 500 `internal_error` 信封，实测为准，Ban 编造）；② `ai_graph_run(career-path, IV_FI3)` 恰一行 `status='failed'` 且 `version>=2`（**active→failed 转换证据**；Ban 接受无 active 阶段的行）；③ GET 404 无失败产物；④ 账本 before/after 实测快照净变 0（career-path 不计费 D1）；⑤ server alive；⑥ **in-fault 重试不污染**：再次 POST → 再次可解释失败 + run 行 version 递增，`career_path` 仍 0 行、账本仍净变 0（A3「可重试」的 e2e 可观察面；重试成功路径由同进程 CONTROL（无注入）覆盖）；⑦ 静态接线证据（`careerInIdx`/`graphFiles`/`regionHasGraphWire`）降为 evidence 字段，不再作 unreachable 闸门；
  - **`FI1-NO-FAKE-GRAPH-RUN` 等强改写（须双审裁 · 先例 = FI1-CHILD-SURVIVES 升级路径）**：现断言为**全局** `careerGraphRunCount()===0`（`ai_graph_run graph_name='career-path'` 全表行数）。接线后图行真实存在（CONTROL 成功行、FI-1/FI-2 真失败行），「无伪造」的语义 = **行反映真实执行**而非行数=0——改写为「`IV_FI1` 线程恰一行 `failed` 行 + version 转换证据」；FI-2 的 `graph_run_rows` detail 同步升级为 per-thread 观察。改写前后断言原文 + 理由在 receipt 全披露；**Ban 放宽**（接受 status 任意 / 无 version 证据 / 行数随意 = FAIL）。
- **期望（诚实契约）**：attempts=4 全 0（CONTROL / FI-2 / FI-1 / FI-3）→ **全量 EXIT 1→0**。实测若非如此（如 FI-1 连接断瞬间 failed 转换自身失败、in-fault 重试行为与预期不符），按实际行为断言并如实落 receipt——两种结果都如实记录；**Ban 修 prove 迁就产品、Ban 改断言洗绿、Ban retry-to-green、Ban 把 EXIT1 记成 flake**。attempts 全记录 · one-shot · machine receipts 落 `.tmp/isolated-proof-receipts/` · receipt 落 `ai-docs/delivery/receipts/`（命名随执行日）。
- **A3 关闭路径**：本刀 prove EXIT0（若实测）+ **post-prove dual PASS**（mw-e2e-ha + mw-model-op）+ **协调方 nail 授权**——三段全链缺一不可；**本 REQUEST 不预claim**（EXIT0 ≠ A3 closed，C'' 原钉不变；行翻转只在 nail 阶段）。
- 与静态 mark-red prove（`pnpm uc004:career-path:prove` EXIT0）互不替代（C'' 原钉）；后者 G-GAP 行文是否随接线更新属静态 prove 自己的刀，本刀不碰。

## 成本 / 预算披露（model-op 关注点）

- **Candidate A/B：derive 仍是纯本地计算 → 零模型调用路径、零 live 调用、零 model-op 预算影响、零 `ai_invocation_trace` 写入**。prove 在隔离容器（无模型端点）运行——接线不得引入对任何模型端点的依赖；`@meetwise/ai-runtime` 的 model-client / registry / binding / prompts 零触碰。
- 若双审裁决含模型调用的方案（如 Candidate C 变体）：必须显式申报且**默认禁 live**；`mw-model-op` 一票否决；调用点须走既有 model-operation 通道，Ban 绕过。
- **Ban live**（本刀默认边界）；Ban 借刀给 career-path 加任何模型调用（那属于 GAP-UC004-GRAPH/UNCERTAINTY 其它刀）。

## 行语义（冻结 · 本 REQUEST 与后续 coding 均不翻行）

- `UC-E2E-004` FAULT 列 / `NHP-004-FAULT-01` / A3：**stays gap**（C'' `a27e384` + P 线 nail `845d357` 原钉）——本刀接线落地 **≠** A3 关闭；A3 关闭 = prove + post-prove dual + 协调方 nail 全链。
- 本行其余 gap（E2E-MAIN / GRAPH / GROWTH-A1A2 / UNCERTAINTY）不因本刀关闭；coveredCount=**8** 不变；haStatus=**NOT_HA** 不变。
- Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件 · Ban covered · Ban SSOT edit（docs REQUEST 阶段零 SSOT diff）。

## Ban 列表

- **Ban coding**（本 turn docs-only）；**Ban prove 执行**（pre-exec dual PASS 后由协调方授权）；**Ban push**；Ban force-push；Ban secrets / `.env*`。
- **Ban 借刀**改其他 interview 路径 / outbound 主链 / model-client（Line C 域）/ worker lifecycles / `principal.ts`（P 线面）/ `deriveCareerPath` 纯函数 / 静态 mark-red prove。
- Ban 伪装成功 · Ban 200-假成功 · Ban 伪造 failed run · Ban 无 active 阶段的装饰性 failed 行 · Ban 伪造 `ai_invocation_trace` · Ban 吞错/静默重试。
- Ban 为绿而改变业务语义（HTTP 契约/错误信封/GET 语义/derive 输出原样）· Ban 改 prove 断言迁就（申报的等强升级除外，且须双审裁）· Ban 断言放宽。
- Ban live 模型调用（零 live 边界；含模型调用的方案须申报且默认禁 live）· Ban 借刀加模型调用。
- Ban retry-to-green · Ban 把 EXIT1 记成 flake · Ban 碰 UC-018 / UC-052 / UC-025 · Ban covered · Ban 翻任何 SSOT 行 · **Ban self-approve（alone ≠ dual）**。

## Scope / Not

只做 `GAP-UC004-FAIL-A3`（FI-3 腿）/ `NHP-004-FAULT-01` 的 AiGraphRun(career-path) 接线 REQUEST + 复跑 prove 契约。Not A3 关闭刀（关闭走 prove + post-prove dual + 协调方 nail）。Not HA 刀。Not E2E-MAIN / GRAPH / GROWTH / UNCERTAINTY（其它刀）。不发明新验收标准——A3 口径以 `e2e-scenarios.md` E-gen-fail / TC-E2E-004-fail 原文为准。

## Pins

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · row stays gap · STOP



---

## Line T NAIL lifecycle（`post_prove_dual_pass` · 2026-10-05 · additive）

- Lifecycle on this harness/slice/receipt: **`post_prove_dual_pass`**.
- Prove tip NAILED TO: `d9ddb13fa9cc1e505e04d97cde9ad6620dc49b58`.
- Code: `0a3c8a8ad16667bd6b140cbb6b02f04d1ce20bf2` · prove-tool `b80bf92d4b3dc901a63bdcb585df47c5e7a285bb` ≡ `ced3691fb7b269c6b567f9af4510513cb8486c6e` · **PROVE_EXIT 0** · attempts **4×0**.
- POST dual BOTH PASS: mw-e2e-ha `a655ffdab52093e669dca8793c5cd8b6d1fbade5` + mw-model-op `84f8eeb454bc682031dc4795cefd44460f7b2d09`.
- Seam: `MEETWISE_CAREER_PATH_FAIL_THREAD_ID` production-off · workspace:* lock +3 accepted · zero-model/zero-trace ledger boundary retained.
- Static `pnpm uc004:career-path:prove` EXIT=1 = expected tripwire（separate knife）.
- **STILL_OPEN**: `GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` / UC-E2E-004 FAULT **gap** · **EXIT0 ≠ A3 closed**.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.

---

*Harness · GAP-UC004-FI3-GRAPH-WIRING · Line T NAIL · 2026-10-05 · lifecycle post_prove_dual_pass · prove tip d9ddb13 · EXIT 0 · post dual a655ffd+84f8eeb PASS · EXIT0 ≠ A3 closed · FAULT stays gap · Ban fake close A3 · Ban covered flip · Ban live · Ban Meridian · Ban HA · releaseEvidence=false · STOP*

