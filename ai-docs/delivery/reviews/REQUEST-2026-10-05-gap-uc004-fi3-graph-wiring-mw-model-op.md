# REQUEST — **GAP-UC004-FI3-GRAPH-WIRING · 产品接线** · pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`（图执行/派发预算域）
**Knife**: `harness/gap-uc004-fi3-graph-wiring.md` · slice `gap-uc004-fi3-graph-wiring.slice.md`
**Parent tip**: `377e7fc`（full `377e7fc4fa1b35b85ebf524b668469caf66de2bc` · origin/feat/mysql-schema-skeleton）
**Date**: 2026-10-05

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

## 请审什么（mw-model-op 视角：图执行/派发预算域）

本刀为 FI-3 接线授权（候选 A 图包装 derive 推荐 / B 仅失败记账 / C 完整图化）。career-path 今日是同步 `deriveCareerPath`（`packages/domain/src/career.ts` **纯逻辑无 IO**）+ 单条 upsert，零模型调用。请审：

1. **零模型调用边界（本审核心）**：Candidate A/B 下 derive 保持纯本地计算——career-path 图 dep = 注入的本地 derive 函数，**零模型调用路径、零 live 调用、零 model-op 预算影响、零 `ai_invocation_trace` 写入**（Ban 伪造 trace）；图包约定「不引 db/contracts 运行时；模型/checkpointer 经注入」不变；`@meetwise/ai-runtime` 的 model-client / model-operation-registry / model-operation-binding / prompts / router 零触碰（Line C 域，Ban 借刀）。
2. **成本申报纪律**：若双审裁决含任何模型调用的方案（如 Candidate C 校验/生成节点变体），必须显式申报（调用点 / 操作类型 / 预算归属 / 是否走既有 model-operation 通道）且**默认禁 live**；未申报的模型调用路径出现于执行提交 = FAIL；`mw-model-op` 一票否决。
3. **注入 seam 的预算面**：thread-scoped、env-gated dep 覆写（默认关闭）是 TC-E2E-004-fail `graph(fake-model)` 注入法的落点——seam 只允许使 dep **失败**，不得开启任何 live 模型端点/真实凭据路径；prove 隔离容器无模型端点运行，接线不得引入对模型端点的依赖。
4. **派发/执行形态**：Candidate A 为 API 进程内同步单节点图（无 worker 派发、无队列、无 checkpointer 新增依赖）；`apps/worker/src/*` lifecycles 零触碰；若后续真实图化/异步派发（worker 化）属其它刀，Ban 借本刀引入。
5. **prove 契约与 EXIT 诚实**：复跑 `uc004:career-path-fault:prove`（三层隔离壳不变）；期望四 attempt 全 0 → 全量 EXIT 1→0；实测若非如此按实际行为断言如实落 receipt；Ban 修 prove 迁就产品、Ban 改断言洗绿、Ban retry-to-green、Ban 记 flake；FI-1/FI-2 既有断言零减项，`FI1-NO-FAKE-GRAPH-RUN` 等强改写须双审裁。
6. **A3 关闭路径**：本刀 prove EXIT0 + post-prove dual PASS + 协调方 nail 三段全链；EXIT0 ≠ A3 closed（C'' 原钉）；**本 REQUEST 不预claim**、本 stub 不授权 coding / prove / push。

Row `UC-E2E-004` FAULT column stays gap · Case `NHP-004-FAULT-01` stays gap · 本行其余 gap（E2E-MAIN/GRAPH/GROWTH-A1A2/UNCERTAINTY）不因本刀关闭 · **Ban covered** · **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）· Ban 翻任何 SSOT 行。

pre-exec dual PASS 后由协调方授权 coding；implementer 不自批。Dual PASS ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
