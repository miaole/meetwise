# REQUEST — **GAP-UC004-FI3-GRAPH-WIRING** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-05T23:28:47+08:00
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 mw-e2e-ha / mw-model-op · 不 nail
**审查对象**: REQUEST `f4b95fe` · code `0a3c8a8` + prove 工具层 origin 链上 `b80bf92`（receipt 钉 `ced3691`）· receipt `d9ddb13`
**origin tip（落笔）**: `7c631c26a1d173cd47f2543287ead287ef00fd23`。上述 SHA 均为祖先。
**NORTH-STAR-EXECUTION-LOOP**: 仓库 / `ai-docs` / `AGENTS.md` / `CLAUDE.md` / `.cursor` 再搜一轮仍 **未找到**该文件名。本审以 `ai-docs/delivery/north-star-hard-gates.md` + harness/slice 为门。
**预执行**: mw-e2e-ha `560a933`、mw-model-op `3089253`（只读其 C-HA-* / C-MO-1~7；不改、不代签）。本角色无 pre-exec stub；协调方开 post-prove。

## ced3691 ↔ b80bf92

`ced3691` **不在** origin 祖先链。`b80bf92` **在** origin，同 subject。`git show | git patch-id` 两边相同（`bdf499e6…`）。proof.ts blob 与 interview.service.ts blob 两侧相同（`c7eeee09…` / `88c85d17…`）。receipt `d9ddb13` 已披露 rebase：`fc9d807`→`0a3c8a8`、`ced3691`→`b80bf92`，prove 跑在 rebase 前的 `ced3691`。本审复跑钉 origin 上等价代码树 **`b80bf92`**。

## 实际命令（临时 worktree `/tmp/mwrr-b80bf92` @ `b80bf92` · `sg docker`）

| CMD | EXIT | 说明 |
|-----|------|------|
| `pnpm -C packages/ai-graphs exec tsx test/career-path.proof.ts` | **0** | 33/33 PASS（含 SEAM-* / SUCCESS-* / FAIL-* / TRANSITION-FAIL-* / PURITY-*） |
| `pnpm uc004:career-path-fault:prove`（第 1 次，nm 不完整） | **1** | `api_child_not_ready`（stdout 空）。如实披露，非洗绿。 |
| `pnpm install --frozen-lockfile` 后再跑同 CMD（第 2 次） | **0** | `ATTEMPTS_LEDGER attempts=4 one_shot=true retry_to_green=false exits=…CONTROL:0 …FI2:0 …FI1:0 …FI3:0`；`FI1-NO-FAKE-GRAPH-RUN` PASS；FI-3 全 PASS；`trace_rows_delta=0` |
| `pnpm uc004:career-path:prove` | **未跑** | receipt 已记该静态 mark-red 在接线后绊线 EXIT=1；本刀不碰。 |

## 检查结果

1. **触碰面**: `0a3c8a8` 六文件 = career-path.ts（新）/ index.ts / interview.service.ts / career-path.proof.ts / apps/api/package.json + pnpm-lock（workspace link，receipt 已披露）。`b80bf92` 仅 fault.proof.ts。无 principal.ts / ai-runtime / worker / domain/career.ts / SSOT 行翻转。在 harness allowlist + 披露的 lock 增量内。
2. **零模型调用**: `packages/ai-graphs/src/career-path.ts:17-18` 仅 `@langchain/langgraph` + `import type` domain；`:4-5` 明钉不写 `ai_invocation_trace`。package.json deps 仅 domain + langgraph。复跑 evidence `ai_invocation_trace` start=0 end=0。interview.service 既有 `ai-runtime` import 是语音 seam，非本路径 invoke。
3. **Seam 默认关 / fail-only**: `selectCareerPathDerive` `:48-51` 仅精确 thread 匹配才抛错；未设/空返回原 derive 同一引用。`careerPathFailSeamThreadId` `:37-39`：`NODE_ENV=production` 恒 `undefined`；否则读 `MEETWISE_CAREER_PATH_FAIL_THREAD_ID`。不读凭据、不绕过 auth。
4. **状态机真 Postgres**: ledger begin/commitSuccess/markFailed 经 `this.db.asPrincipal` 写 `ai_graph_run`（`:813-842`）。无 MemorySaver / PostgresSaver 于本路径。图 `compile()` 无 checkpointer。PG-retained。
5. **FI1-NO-FAKE 改写**: 改前（`0a3c8a8` 树 proof）`A('FI1-NO-FAKE-GRAPH-RUN', graphRuns === 0)` 全局；改后 `fi1Runs.length === 1 && status==='failed' && version >= 2`（proof `:337-339`）。等强收紧为 per-thread + version，不是放宽。复跑该断言 PASS。
6. **4 attempts 全 0**: ledger 明示 `one_shot=true retry_to_green=false`。本审第 1 次 EXIT 1 与第 2 次 EXIT 0 分账披露，不洗。
7. **矩阵**: tip `e2e-requirement-coverage-matrix.md:115` `UC-E2E-004` 仍 gap/gap/gap/blind。receipt 明钉 EXIT0 ≠ A3 closed。**条件**: 矩阵旁注仍写「FI-3 未接线、全量 prove EXIT=1」——叙事滞后，但**状态未抬 covered**，本刀零 SSOT 行翻转；不得把本 PASS 读成 A3 关闭。
8. **Pins**: NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained。UC-018/§1.1 仍 partial。未碰 018/025/052。

## 条件

1. EXIT 0 ≠ A3 closed ≠ covered ≠ nail ≠ HA。关闭仍须 post-prove dual（含 peer）+ 协调方 nail。alone ≠ dual。
2. 矩阵旁注滞后不得被洗成「已接线即 covered」。静态 `uc004:career-path:prove` 绊线属另刀。
3. 本审第 1 次 prove EXIT 1（环境 nm）保留；第 2 次 EXIT 0 复现 receipt，不互相洗。
4. 不代签 `560a933` / `3089253`。本 PASS ≠ coding 授权续刀。

Verdict: PASS
