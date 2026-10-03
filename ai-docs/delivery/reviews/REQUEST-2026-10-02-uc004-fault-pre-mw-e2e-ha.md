# 审查 — GAP-UC004-FAIL-A3 NHP · pre-exec · mw-e2e-ha

**角色**: `mw-e2e-ha`（证据诚实 · 对抗）· **不代签** `mw-rag-route` · **不代签** `mw-privacy-int`
**轮次**: Line C' PRE-EXEC · docs-only · 未跑 prove · 未起 Postgres · 未改产品代码 · 未发 live/model
**审的 REQUEST**: `9a644bd` / `9a644bd360c5b78f66240d8524e6502ef178fa80`
**父提交（`git rev-parse 9a644bd^`）**: `59bdbdf` / `59bdbdfa2818017d7e11cfab5773d7e72020c9a8`
**本轮 diff**（`git diff-tree --name-only -r 9a644bd`）仅四份 docs：
- `ai-docs/delivery/harness/gap-uc004-fail-a3-nhp.md`
- `ai-docs/delivery/gap-uc004-fail-a3-nhp.slice.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-uc004-fail-a3-nhp-mw-e2e-ha.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-uc004-fail-a3-nhp-mw-rag-route.md`
**docs-only**: **yes**（无产品文件 · 矩阵/backlog/checklist 未进 diff）

alone ≠ dual。本 PASS ≠ coding authorization ≠ nail ≠ covered ≠ HA ≠ `mw-rag-route` 的签名。stub 仍 PENDING。

---

## 1. FAULT 列保持 gap — 通过

`git show 9a644bd:ai-docs/delivery/harness/gap-uc004-fail-a3-nhp.md`

L18：

> `e2e-requirement-coverage-matrix.md` §1.0.1 row **`UC-E2E-004`**: NEG **gap** · FAULT **gap** · BOUND **gap** · ADV **blind**. Readout: 整行 gap；A3 失败降级未接线.

L20：

> `non-happy-path-perf-load-case-matrix.md` row **`NHP-004-FAULT-01`**: FAULT · A3 失败降级 · status **gap** · 静态 G-GAP.

L22：

> `harness/uc-e2e-004-career-path.md` G-GAP-4 prints **`GAP-UC004-FAIL-A3`**: 无失败降级+额度 E2E. The same harness already says the matrix stays gap and EXIT 0 of the mark-red pin is not a close.

L39：`row stays gap`。slice L11：FAULT column is **gap**。stub L23：`FAULT column stays gap`。stub L25：`Dual PASS ≠ coding ≠ nail`。

没有把 FAULT 写成 covered，没有把本 REQUEST 写成 nail。

抽查同一 SHA，不是转述：

- 矩阵 L108 表头 NEG · FAULT · BOUND · ADV。L115 `UC-E2E-004` = **gap / gap / gap / blind**，读法「整行 gap；A3 失败降级未接线」。FAULT 列是 gap。
- `non-happy-path-perf-load-case-matrix.md` L83：`NHP-004-FAULT-01` status **gap** · 静态 G-GAP。
- `harness/uc-e2e-004-career-path.md` L39：G-GAP-4 打印 `GAP-UC004-FAIL-A3`：无失败降级+额度 E2E。L20：`EXIT=0 = 诚实钉缺口 ≠ A1/A2/A3 产品/E2E 闭环`。L81：`pnpm uc004:career-path:prove` 期望 EXIT **0**，且「本绿 ≠ UC-E2E-004 covered；矩阵保持 **gap**」。

L22 没有把 mark-red 的 EXIT 0 洗成产品故障路径已绿。它写明 EXIT 0 不是 close。本 REQUEST L22 后半：不跑该命令，不加命令。没有红证明被改记成绿。

## 2. 禁止改 UC-018 / UC-052 行 — 通过

harness L12：

> Ban SSOT edit · Ban invent a fix

harness L28：

> Not UC-018. Not UC-052. Not interview begin. Not `pnpm privacy-authorization:prove`. Do not flip UC-018. UC-052 stays **partial**.

slice L11：`Not UC-018. Not UC-052.` stub L23：`Do not flip UC-018. UC-052 stays **partial**.`

`Ban SSOT edit` 禁止改矩阵 / backlog / checklist。L28 点名 UC-018 与 UC-052 不在本刀，禁止 flip，UC-052 保持 partial。本 diff 没有这些行。没有授权去改它们。

## 3. docs 不是产品故障路径 — 通过

harness L3：`Ban coding · this commit is not coding authorization`。L12：`Ban invent a fix`。L26：

> It does not invent acceptance criteria, a product file to change, or a fix. It does not authorize coding.

slice L7：`Ban coding · Ban invent a fix`。stub L25：`No coding is authorized by this stub.`

点名的是已有缺口「A3 失败降级未接线」，不是把这份 docs 说成降级路径已经存在。

## 4. 销钉

harness L4 / stub 表 L14–L21 未改：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。无 HA。

## 5. 抽查（非阻塞）

- harness L6 / stub L7 写 parent tip `58c0031`。`git rev-parse 9a644bd^` 是 `59bdbdf`。头上的 parent 不是 prove tip，也不是本 commit 的父。引用句是按 `9a644bd` 树核对的，不靠那个 parent 句。
- backlog `e2e-covered-path-backlog.md` L17–L18：下一刀 1 是 UC-025，2 是 UC-004。与 harness L16 一致。L18 的「抬 covered 见下」是 backlog 旧文，本 REQUEST 没有把它当成授权去升 covered。
- 范围 L26 不扩到 `GAP-UC004-E2E-MAIN` / `GRAPH` / `GROWTH-A1A2` / `UNCERTAINTY`。那些仍是 career-path harness 里的别的 G-GAP，不是本刀。
- rag-route stub 仍 PENDING。不代签。

## 6. 条件

1. docs-only。本 PASS 不是编码授权，不是 nail，不是 covered，不是 HA。FAULT 列保持 gap。`NHP-004-FAULT-01` 保持 gap。`GAP-UC004-FAIL-A3` 不是已修。
2. `pnpm uc004:career-path:prove` 的 mark-red EXIT 0 不是 close，不得洗成 A3 失败降级已接线。本 PASS 不授权跑它，也不授权加命令。
3. 不得编辑 UC-018 或 UC-052 的矩阵行、backlog 行、checklist 行。不得 flip UC-018。UC-052 保持 partial。`Ban SSOT edit` 覆盖矩阵 / backlog / checklist，即便 L12 没有把这三个文件名再写一遍。
4. 不得把本 docs REQUEST 当成产品故障路径。不得发明修复。
5. 销钉保持：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。
6. alone ≠ dual。本文件不是 `mw-rag-route` 的签名。

## 7. 阻塞

无阻塞。

Verdict: PASS
