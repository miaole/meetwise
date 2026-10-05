# Slice — **GAP-UC004-FI3-GRAPH-WIRING · 产品接线刀**（Line T · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · row stays gap）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base**: `origin/feat/mysql-schema-skeleton` · `377e7fc4fa1b35b85ebf524b668469caf66de2bc`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve

## One-line

`GAP-UC004-FAIL-A3`（`UC-E2E-004` FAULT / `NHP-004-FAULT-01` / A3）在 C'' prove（EXIT=1）+ P 线修复（FI-1 attempt 1→0）后只剩 FI-3 一腿，且被 C''/P 线**钉死为结构性不可达**：career-path 是同步 `deriveCareerPath` + 单条 upsert（`interview.service.ts:768-791`），无 AiGraphRun(career-path) 接线（`ai-graphs` 包零 career 图文件、`ai_graph_run` career-path rows=0 两树两次实测）。本刀（Line T）为其求**产品接线授权**：career-path 从同步 derive 增为图执行路径——`AiGraphRun` 行真实 create/reuse（active, version+1）+ 失败状态机 **active→failed 真落库**（诚实原则：不伪装成功、Ban 伪造 failed run、对外契约冻结）。方案候选 A 图包装 derive（推荐）/ B 仅失败记账（默认不推荐：装饰性状态机）/ C 完整图化（本刀拒绝：越界其它 gap），交双审裁。prove = 复跑 `uc004:career-path-fault:prove`，FI-3 注入从 UNREACHABLE 变可达（thread-scoped env-gated dep seam，沿 TC-E2E-004-fail `graph(fake-model)` 注入约定），期望四 attempt 全 0、**全量 EXIT 1→0**；A3 关闭 = 本刀 prove + post-prove dual + 协调方 nail 全链，**本 REQUEST 不预claim**。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc004-fi3-graph-wiring.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-05-gap-uc004-fi3-graph-wiring-mw-e2e-ha.md` |
| Dual `mw-model-op` | `reviews/REQUEST-2026-10-05-gap-uc004-fi3-graph-wiring-mw-model-op.md` |

## Scope / Not

只做 FI-3 接线 REQUEST（刀名 `GAP-UC004-FI3-GRAPH-WIRING`，服务 gap `GAP-UC004-FAIL-A3` FI-3 腿，不改名不开新行）。触碰面（Candidate A）：`packages/ai-graphs/src/career-path.ts`（新增）+ `packages/ai-graphs/src/index.ts`（导出）+ `apps/api/src/modules/interview/interview.service.ts` 仅 `generateCareerPath` 区段（:768-791）+ 注入 seam + 必要测试 + prove 工具层（`uc-e2e-004-career-path-fault.proof.ts`：FI-3 attempt 升级 + `FI1-NO-FAKE-GRAPH-RUN` 等强改写，交双审裁）；**迁移无**。Ban 借刀改其他 interview 路径 / outbound 主链 / model-client（Line C 域）/ worker lifecycles / `principal.ts`（P 线面）/ `deriveCareerPath` 纯函数。Not E2E-MAIN / GRAPH / GROWTH-A1A2 / UNCERTAINTY（其它刀）。

**成本边界（model-op）**：Candidate A/B 的 derive 仍是纯本地计算 → **零模型调用、零 live、零预算影响、零 `ai_invocation_trace` 写入**；prove 隔离容器无模型端点。含模型调用的方案（如 C 变体）必须显式申报且默认禁 live，model-op 一票否决。Ban live。

诚实条款：prove 复跑期望全量 EXIT 1→0（四 attempt 全 0）；实测若非如此（如 FI-1 瞬间 failed 转换自身失败、重试行为不符预期），按实际行为断言并如实落 receipt。Ban 修 prove 迁就产品、Ban 改断言洗绿、Ban retry-to-green、Ban 把 EXIT1 记成 flake。`UC-E2E-004` FAULT 列 / `NHP-004-FAULT-01` / A3 在 prove + post-prove dual + 协调方 nail 全链完成前 **stays gap**；本行其余 gap（E2E-MAIN/GRAPH/GROWTH/UNCERTAINTY）不因本刀关闭；coveredCount=8 不变。

## Ban

Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权）· Ban push · Ban covered · Ban 翻任何 SSOT 行 · Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件 · Ban 借刀（见 Scope）· Ban 伪装成功 / Ban 200-假成功 / Ban 伪造 failed run / Ban 无 active 阶段的装饰性 failed 行 / Ban 伪造 `ai_invocation_trace` · Ban 改 HTTP 契约/错误信封/GET 语义/derive 纯函数 · Ban live 模型调用 · Ban 改 prove 断言迁就（申报的等强升级除外，须双审裁）· Ban retry-to-green · Ban 记 flake · Ban self-approve（alone ≠ dual）。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503.

*Slice · GAP-UC004-FI3-GRAPH-WIRING · AiGraphRun(career-path) graph wiring · awaiting_pre_exec_dual · FAULT gap · STOP*
