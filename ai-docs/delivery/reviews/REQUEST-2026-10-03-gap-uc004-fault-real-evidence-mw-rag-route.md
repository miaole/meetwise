# REQUEST — **GAP-UC004-FAIL-A3 · FAULT real evidence** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc004-fault-real-evidence.md` · slice `gap-uc004-fault-real-evidence.slice.md`
**Parent tip**: `f3cf84c`（series open · not a prove tip）
**Date**: 2026-10-03

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

## 请审什么（mw-rag-route 视角）

C' FINAL `0652a08` 只钉「FAULT 仍 gap」；本刀 REQUEST 为 `GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` 求可复现故障注入真证据。请审：

1. **注入点设计**：FI-1 连接断（杀 PG 连接）· FI-2 依赖超时（statement/pool timeout）· FI-3 图失败状态机（本树无 AiGraphRun(career-path) 接线，预期不可达）。注入路径= `POST /interview/:id/career-path`（`generateCareerPath` 唯一产品路径）。
2. **EXIT 契约**：EXIT 0 = FI-1/FI-2 的 F1（响应可解释）+F2（无业务事实污染）+F3（额度净变 0）全成立 **且** FI-3 可达并观察到 `AiGraphRun=failed`+降级+重试+额度不变；否则 **EXIT 1 诚实保留 gap**，如实落 receipt。Ban 把 EXIT1 记成 flake。
3. **诚实条款**：Ban 伪造 `AiGraphRun=failed`；Ban 用同步 derive 5xx 冒充图失败；Ban invent fix；若做不出/关不了 → 保持 gap。
4. **口径**：不把 `pnpm uc004:career-path:prove` mark-red EXIT0 当 A3 关闭（C' 原钉）。receipt 落点 `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`。

Row **`UC-E2E-004`** FAULT column stays gap. Case `NHP-004-FAULT-01` stays gap. **Ban covered**. **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

# PRE-EXEC dual · GAP-UC004-FAIL-A3 fault real evidence · mw-rag-route（docs gate only · Ban prove · Ban product edit）

**Reviewed SHA**: `f44d8daf3a2eb385d423d0d0d4d8aa2c477cddf6`（`docs(e2e): REQUEST GAP-UC004-FAIL-A3 fault real evidence (pre_dual)`）· 审查时 origin tip，`f3cf84c`（series open）经验证为其祖先（`git merge-base --is-ancestor` 通过）。
**Review worktree**: `meetwise-rv-c2-rag-route` @ branch `rv/c2-rag-route`（本审查 git 写操作仅限此 worktree · 禁 push）。
**Reviewer**: `mw-rag-route`（route/业务口径焦点）· alone ≠ dual · 不代签 `mw-e2e-ha` · implementer 不自批。

## 检查表（file:line 证据）

1. **docs-only / scope 干净**：`git show --stat f44d8da` = 4 文件 187 insertions 0 deletions，全部在 `harness/`+slice+2 stubs；零产品代码、零 SSOT 矩阵改动。`e2e-requirement-coverage-matrix.md:115`（UC-E2E-004 整行 gap）/`:83` NHP 矩阵（`non-happy-path-perf-load-case-matrix.md:83` NHP-004-FAULT-01 gap）在 `f44d8da` 原样未动；未碰 UC-018/052/025 任何行/文件；coveredCount=8 未改；DELETE=503 未提。✓
2. **FI-1 真实可复现**：harness `gap-uc004-fault-real-evidence.md:40` 给出具体注入手段 `pg_terminate_backend`（或等价）于 `POST /interview/:id/career-path`，观察集 F1/F2/F3 逐项写明。产品面支撑可观察性：`apps/api/src/modules/interview/interview.service.ts:749` `generateCareerPath` 唯一产品路径，`:764` 同步 `deriveCareerPath`，`:766-771` 单条 upsert `INSERT INTO career_path`（连接被杀→语句级原子，F2「无本次半写行」可经 `:777-785` `getCareerPath` 404 表面验证）。✓
3. **FI-2 真实可复现**：harness `:41` 命名机制 statement/pool 超时（`statement_timeout`、锁占位），同路径同观察集；PG-retained pin 下机制成立；具体参数留待 prove 脚本（pre-exec docs gate 可接受，机制已点名）。✓
4. **FI-3 不可达诚实路径写清**：harness `:42`/`:44` 明示本树无 AiGraphRun(career-path) 接线、预期今天不可注入不可观察、prove 须如实尝试并报告、不可达→不得 EXIT0 走诚实 EXIT1 保持 gap；**Ban 伪造 `AiGraphRun=failed`、Ban 用同步 derive 5xx 冒充图失败**。与树核实一致：`apps/api/src` 下无任何 graph/career 图文件，`interview.service.ts` 零 AiGraphRun 引用。✓
5. **EXIT 契约双向闭环**：harness `:53` EXIT0 当且仅当 FI-1∧FI-2 每次 F1+F2+F3 全成立 **且** FI-3 可达（`AiGraphRun=failed`+降级+重试+额度不变），且 EXIT0 不自动翻行（还须 post-prove dual PASS + 协调方授权）；`:54` EXIT1 诚实保留 gap、打印 `GAP-UC004-FAIL-A3` 明细、落 receipt、Ban 记 flake；`:55` 与既有 mark-red EXIT0 互不替代。与 stub `:28` 一致。✓
6. **口径不漂移（C' 原钉保持）**：harness `:7`/`:16`/`:64`、stub `:30`、slice `:11` 均重申「不把 `pnpm uc004:career-path:prove` EXIT0 当 A3 关闭」。技术根据核实：`apps/api/test/uc-e2e-004-career-path.proof.mjs:1-19` 自认「NON-UI static inventory + GAP mark-red」，不起 HTTP 不注入故障；G-GAP 打印含 `GAP-UC004-FAIL-A3`（`:192`）。C' FINAL `0652a08` 存在且引用准确（slice `gap-uc004-fail-a3-nhp.slice.md:34-44` FINAL NAIL，FAULT stays gap）。✓
7. **A3 口径以原文为准**：harness `:22` 引 `e2e-scenarios.md` E-gen-fail/TC-E2E-004-fail 与原文逐字一致（`e2e-scenarios.md:125`、`:133`，含「career-path 不计费，D1」→F3 额度净变 0 口径）；`:72` 不发明新验收标准。✓
8. **Ban invent fix 明令**：harness `:3`/`:67`、`:44`、slice `:25`/`:29`、stub `:29`/`:34`：Ban invent a fix / Ban product code / 禁止为绿改产品行为掩盖故障。✓
9. **隔离与安全惯例**：harness `:48` 待授权产物形态（`uc004:career-path-fault:prove` + apps/api `prove:uc004-career-path-fault`）与既有包装核实一致（`package.json:149-150` → `scripts/run-e2e-isolated.mjs` → `apps/api/package.json:44`）；`:12`/`:68` Ban secrets/`.env*`/force-push/push/SSOT edit；`releaseEvidence=false` 不变（`:59`）。✓
10. **Pins 原值 + alone ≠ dual**：stub `:4`/`:12-21`、harness `:4`/`:76`、slice `:4`/`:31` 全部原值：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503；UC-E2E-004 FAULT 与 NHP-004-FAULT-01 均 stays gap。peer stub `REQUEST-2026-10-03-gap-uc004-fault-real-evidence-mw-e2e-ha.md:3` 保持 PENDING，本人未代签。✓

## Fail-trigger audit

未触发任何 fail 条件：本 SHA 无 coding、无 prove 执行、无 SSOT 行改动、无 018/052/025 触碰、无 coveredCount 变化、无伪造/美化 EXIT 语义、无 invent fix、无 self-approve、无代签 peer。文档主张与 `f44d8da` 树实况（读码核实）全部对得上。

## Blockers

无。

## Conditions

- **C-1**：本 PASS 仅为 docs gate；prove 执行须待协调方在 pre-exec dual PASS 后单独授权，implementer 不自批；本 REQUEST 内不添加任何代码行。
- **C-2**：prove 产物须按 harness `:48` 形态走 `scripts/run-e2e-isolated.mjs` 隔离惯例（同 `uc004:career-path:prove` 包装），receipt 落 `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`，`releaseEvidence=false` 惯例不变。
- **C-3**：EXIT0 亦不自动翻行——A3 关闭另须 post-prove dual PASS + 协调方授权；FI-3 不可达必须 EXIT1 保持 gap 并打印 `GAP-UC004-FAIL-A3` 明细，Ban 把 EXIT1 记成 flake/环境问题；Ban 伪造 `AiGraphRun=failed`、Ban 用同步 derive 5xx 冒充图失败。
- **C-4**：本审查只签 `mw-rag-route` 本 stub；`mw-e2e-ha` stub 保持 PENDING 由其独立签署，alone ≠ dual。不代签、不碰 UC-018/052/025、不写 covered。

## 中文三行摘要

1. `f44d8da` docs-only 干净：FI-1（`pg_terminate_backend`）/FI-2（statement_timeout）注入手段具体、F1/F2/F3 观察集与 `interview.service.ts:749` 同步 derive+单条 upsert 的产品实况对得上，FI-3 无接线→诚实 EXIT1 路径写明，Ban 伪造/冒充条款齐备。
2. EXIT 契约双向闭环：EXIT0 须 FI-1∧FI-2 全过且 FI-3 可达且不自动翻行；EXIT1 诚实保留 gap 禁记 flake；C' 原钉「`uc004:career-path:prove` EXIT0 ≠ A3 关」逐处保持，无 invent fix。
3. Pins 八项原值未动，未碰 018/052/025，不代签 mw-e2e-ha（alone ≠ dual）；pre-exec dual 通过，prove 待协调方授权。

Verdict: PASS
