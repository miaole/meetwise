# REQUEST — **GAP-UC004-FAIL-A3** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-02 (~22:22 PT)
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 不 nail
**审查对象**: nail `0807d27` / `0807d2729bd38d4f6b37add0196f819cb51247d2`
**与 origin 的关系**: 审查时该 SHA 是 `origin/feat/mysql-schema-skeleton` 的祖先。prove 跑在随后的 tip 工作树 `5372c39`（相对 `3ee28d3` 只多一份无关 review）。evaluator、证明脚本与本刀产品树相对 `0807d27` 无差异。
**前判**: 预执行 PASS `68ba979` / `68ba979874dfaa2669cee847b2aadb35691a3d50`，文件 `reviews/REQUEST-2026-10-02-gap-uc004-fail-a3-nhp-mw-rag-route.md`。本文件是新收据，不改那一份。

## 实际命令

- `node scripts/eval-harness-matrix-cite.proof.mjs`（nail 点名的 `pnpm eval-harness-matrix-cite:prove`）**EXIT 0**。输出含 `matrix: UC-E2E-004 remains gap`、`matrix: UC-E2E-018 is partial`、`releaseEvidence=false`。本绿 ≠ covered。
- 未跑 `pnpm uc004:career-path:prove`。`scripts/run-e2e-isolated.mjs` 会起临时 Postgres 容器；harness 写明该命令的 EXIT 0 不是 A3 收口，本 nail 也不把它当成缺口通过。

## 事实

`git show --stat 0807d27` 只有五份 docs：矩阵、checklist、backlog、slice、harness。没有 `scripts/`、`apps/`、`packages/`，没有 evaluator，没有产品修复。

- 矩阵 §1.0.1 行 `UC-E2E-004` 仍是 gap / gap / gap / blind（`e2e-requirement-coverage-matrix.md:115`：整行 gap；A3 失败降级未接线）。本 commit 只在文末加注（`:352`），不改这一行。
- `NHP-004-FAULT-01` 仍是 gap（`non-happy-path-perf-load-case-matrix.md:83`）。该文件不在本 diff。
- harness `:53` FAULT 保持 gap，行保持 gap，不是 UC-018 / UC-052 / UC-025。`:55` 禁止把 `pnpm uc004:career-path:prove` EXIT 0 当成 A3 关闭，禁止发明修复，禁止写 covered。
- slice `:11`、`:28` 同旨。pins `:57`：NOT_HA、releaseEvidence=false、claimProductionHA=false、coveredCount=8、gR45Closed=true、ms3EqualsR4Closed=false、PG-retained、DELETE=503。

SSOT 三份是文末追加，写明不把已有 gap/partial/OPEN 改成 CLOSED 或 covered。没有把行抬成 covered，没有声称 HA。

## 条件

1. FAULT 列与 `NHP-004-FAULT-01` 在真正的 fail-closed prove 之前保持 gap。本 PASS 不是那个 prove。
2. 旧 `pnpm uc004:career-path:prove` EXIT 0 不是本缺口。不得扩到其它 UC-004 gap id。
3. 不得改 UC-018 / UC-052 / UC-025 的行。UC-018 与 §1.1 保持 partial。
4. pins 保持。本 PASS ≠ coding ≠ covered ≠ nail ≠ HA。alone ≠ dual。不代签 peer。

Verdict: PASS
