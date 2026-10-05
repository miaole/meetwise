# REQUEST — **GAP-UC004-FI3-GRAPH-WIRING · 产品接线** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha 视角）

C'' prove（EXIT=1，dual `aafdffbe`/`4d8dc5d` + nail `a27e384`）+ P 线修复回归（nail `845d357`，FI-1 attempt 1→0）后，`uc004:career-path-fault:prove` 全量 EXIT=1 的唯一残留根因是 **FI-3 结构性不可达**：career-path 同步 derive（`interview.service.ts:768-791`）、无 AiGraphRun(career-path) 接线、`ai_graph_run` career-path rows=0。本刀（Line T）求 FI-3 接线授权：`AiGraphRun` 行真实 create/reuse（active, version+1）+ 失败状态机 active→failed 真落库。请审：

1. **方案裁决（evidence-honesty 焦点）**：候选 A 图包装 derive（推荐）/ B 仅失败记账（默认不推荐：failed 行无 active 阶段，「active→failed」转换证据做不出，与 Ban 伪造 failed run 边界模糊）/ C 完整图化（越界 GROWTH/UNCERTAINTY/GRAPH/E2E-MAIN 其它 gap 面）。三候选利弊与共同铁律见 harness。
2. **诚实原则**：失败必须真落 `AiGraphRun=failed`（真实 active 阶段 + version 递增转换证据）；Ban 伪装成功、Ban 200-假成功、Ban 无 active 阶段的装饰性行、Ban 吞错；**对外契约冻结**（成功响应体 / 错误信封 / GET 语义 / `deriveCareerPath` 纯函数原样——Ban 为绿而改变业务语义）。
3. **触碰面收敛**：仅 `packages/ai-graphs/src/career-path.ts`（新增）+ `index.ts` 导出 + `interview.service.ts` 仅 `generateCareerPath` 区段 + 注入 seam + 必要测试 + prove 工具层；**迁移无**；Ban 借刀改其他 interview 路径 / outbound 主链 / model-client（Line C 域）/ worker lifecycles / `principal.ts` / 静态 mark-red prove。
4. **注入 seam**：TC-E2E-004-fail 的 `graph(fake-model)` 注入法 = ai-graphs 依赖注入约定的诚实用法；thread-scoped、env-gated、默认关闭（env 未设零行为差），与 prove 单 API 子进程多 attempt 共存；Ban 用 seam 改变正常业务语义、Ban 开无申报的洞。
5. **prove 升级契约（工具层最小增量 · 交双审裁，先例 = FI1-CHILD-SURVIVES）**：FI-3 attempt 从静态不可达探测器升级为真注入 + 真观察（新增 `IV_FI3` 种子；断言集 ① POST 可解释失败 ② per-thread 恰一行 `failed` + version>=2 转换证据 ③ GET 404 ④ 账本净变 0 ⑤ server alive ⑥ in-fault 重试不污染 ⑦ 静态接线证据降为 evidence 字段）；`FI1-NO-FAKE-GRAPH-RUN`（全局 `graphRuns===0`）等强改写为 per-thread 真实执行证据——改写前后断言原文 receipt 全披露；**Ban 减既有项、Ban 放宽（接受 status 任意/无 version 证据 = FAIL）**。
6. **EXIT 诚实契约**：期望 attempts=4 全 0 → 全量 EXIT 1→0；实测若非如此按实际行为断言并如实落 receipt；attempts 全记录 · one-shot · 隔离壳三层包装不变（per-run 随机容器 + 动态端口 + attestation）· machine receipts 落 `.tmp/isolated-proof-receipts/` · **Ban 修 prove 迁就产品、Ban 改断言洗绿、Ban retry-to-green、Ban 把 EXIT1 记成 flake**。
7. **A3 关闭路径**：本刀 prove EXIT0 + post-prove dual PASS + 协调方 nail 三段全链；EXIT0 ≠ A3 closed（C'' 原钉）；**本 REQUEST 不预claim**、本 stub 不授权 coding / prove / push。

Row `UC-E2E-004` FAULT column stays gap · Case `NHP-004-FAULT-01` stays gap · 本行其余 gap（E2E-MAIN/GRAPH/GROWTH-A1A2/UNCERTAINTY）不因本刀关闭 · **Ban covered** · **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）· Ban 翻任何 SSOT 行。

pre-exec dual PASS 后由协调方授权 coding；implementer 不自批。Dual PASS ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
