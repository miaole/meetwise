# Slice — **GODFN-1** · GAP-DEBT-BE-GODFN 四子刀拆解 REQUEST

**Status**: **`draft:awaiting_pre_exec_dual`**
**Date**: 2026-10-07
**Authority**: meetwise — docs-only 拆解刀（W3 前置 · 债行在卷 `gap-bug-backlog.md:880` P1 OPEN 不翻）· 四子刀（1a invoke 拆 phase / 1b G7 卫兵移组合根 / 1c interview.service 域拆+begin 守卫合并 / 1d AppError{code} 统一）可分批授权 · 每子刀独立全链（REQUEST→双审→EXEC→post-dual→nail）
**Base**: `9028eb70`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip）· worktree `meetwise-line-godfn` · branch `line/be-godfn`
**releaseEvidence=false** · **NOT_HA** · 零产品码 · docs-only · 拆解计划 ≠ coding 授权
**Experts**: `mw-model-op` + `mw-e2e-ha` · pre-exec dual PENDING · **Ban self-approve** · alone ≠ dual
**Honesty**: 现状计数以本 base 亲测为准（invoke 372 行整 · bootstrap 325 行整 · guard 641 行整 · interview.service 955 行/32 方法 · catch(:any) 30 处/18 文件 · 双轨 code 13 处+message 位点 亲证）· 债行近似值如实校准 · SSE 三胞胎已治不列范围 · 余量（HMAC×3/req:any/c:any/bootstrap 拆分）零静默丢弃另登记

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/godfn-decompose.slice.md` |
| Harness / REQUEST | `ai-docs/delivery/harness/godfn-decompose.md` |
| REQUEST stub · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-07-godfn-decompose-mw-model-op.md` |
| REQUEST stub · e2e-ha | `ai-docs/delivery/reviews/REQUEST-2026-10-07-godfn-decompose-mw-e2e-ha.md` |
| 债行（不改写） | `ai-docs/delivery/gap-bug-backlog.md:880`（GAP-DEBT-BE-GODFN · P1 · OPEN） |
| SOP | `ai-docs/engineering/TASK-SOP-REFACTOR.md`（Wave 3 · #10） |

## One-line scope

Docs-only：把 GAP-DEBT-BE-GODFN 债行拆成四把行为等价子刀并各自钉范围/Ban/证明（触面既有 prove 全复跑 + 关键路径新增断言），分批授权后续各走全链。**本刀零 coding · 零 prove 执行 · 零 SSOT。**

## Hard pins

- docs-only（4 md · 零产品码/零 package.json/零 spec/零 `.env*`）· 债行 P1 OPEN 保持 · SSE-PUSH 已治不列 · 三钉 blob 零触碰（interview.service blob 演进留 1c EXEC 登记）· Ban 行为变更/RLS/幂等键/secrets · Pins 十值照抄（NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · r1Closed=false）· `actualSpendCny=null` · 拆解 ≠ coding 授权 · Ban self-approve · alone ≠ dual

## CMD

| CMD | Status |
|-----|--------|
| docs REQUEST | `draft:awaiting_pre_exec_dual` · harness + slice + 双 stub 落盘 · 零 prove · 零 live · 零 Key |

---

*Slice · GODFN-1 decomposition REQUEST · 2026-10-07 · base `9028eb70` · awaiting pre-exec dual (mw-model-op + mw-e2e-ha) · docs-only · STOP*
