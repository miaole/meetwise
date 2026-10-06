# Slice — **NHP-028-FAULT-01 · UC-028 FAULT trace-fail-open**（Line X · **`draft:awaiting_pre_exec_dual`** · EXIT0≠covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · stub · Ban coding · Ban prove · Ban push · alone ≠ dual）
**History**: docs REQUEST（本 commit）→ PRE dual（mw-e2e-ha + mw-rag-route）→ coding+prove（授权后）→ POST dual → coordinator nail（后续，均未发生）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` · `4766d4fc2a9d06f2d95a7ab7759430c4cc494bfc`（`git fetch origin` 当次网络失败 curl 28 · 以本地 origin ref 为准 = 预期下限 · pre-exec 前复核 tip 未前进）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban push · Ban self-approve

## One-line

选 **NHP-028-FAULT-01**（UC-028 FAULT · trace 写失败不阻塞业务 · A1 fail-open；**非** ① covered-criterion 复核、非 027/016/012/031/040 系）：① 判无实义——UC-001 无 covered-criterion 脚本（全仓仅 uc-e2e-018-covered-criterion）且 AB nail `6b878da` 后矩阵行已诚实（NEG/BOUND 保持 blind/case-only · FAULT partial · ADV blind · coveredCount=8），且 UC-001 行正被 Line AG（NHP-001-ADV-01）占用。backlog「下一刀顺序」#3（#1 025 / #2 004 均排除）+ NHP 矩阵具名 gap case + 代码 seam 明确（`packages/ai-runtime/src/invoke.ts:707-708` persistTrace 与 settle/complete 同事务 → trace 失败连坐 `external_outcome_unknown` ≠ spec fail-open）。本刀 docs 显式化 gap→case/prove：**F1** trace INSERT 必败（isolated 真 PG trigger/REVOKE 注入）业务仍 completed+额度 confirmed；**F2/F4/F5 = NEG 硬闸**（真相写失败必须阻塞 · 无双扣 · recon 不冒充）。本刀 WILL touch product（`invoke.ts` 拆旁路）——coding 仅在 pre-exec dual PASS + 协调方授权后。**Ban live** · **Ban fake-green suite** · EXIT0 ≠ covered · coveredCount=8。Dual = mw-e2e-ha + mw-rag-route（非隐私域 · 不换 privacy-int）。

## Products

| Role | Path |
|------|------|
| Harness | `harness/nhp-028-fault-01-trace-fail-open.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-nhp-028-fault-01-trace-fail-open-mw-e2e-ha.md`（PENDING stub） |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-06-nhp-028-fault-01-trace-fail-open-mw-rag-route.md`（PENDING stub） |
| Prove receipt（授权后） | `receipts/2026-10-XX-nhp-028-fault-01-trace-fail-open-prove.md`（未创建 · 授权后另片） |

## Choice

**NHP-028-FAULT-01**（UC-E2E-028 FAULT）over ①（UC-001 covered-criterion 复核 · 无脚本无失实 · 碰 AG）与 027/016/012/024/031/032/040–043（backlog 顺序靠后 / blocked / 批量面另刀）。Documented in harness。Ban UC-018/052/025/004/011/014/026/002/001。

## EXIT 契约（一句话）

`pnpm uc028:nhp-fault:prove`（isolated 真 PG · 零 live 模型）**EXIT0 = F1–F5 全绿 = NHP-028-FAULT-01 具名真证据 ≠ covered ≠ suite green**，UC-028 行/FAULT 保持 gap 措辞、coveredCount=8；**EXIT1 = 诚实保留**（注入不可观测/业务未 completed/F2 守卫失守 → attempts 全记录 · Ban retry-to-green · gap 不翻行）。

## Ban

Ban coding · Ban prove · Ban push · Ban live · Ban live default · Ban fake-green suite · Ban covered · Ban SSOT flip · Ban self-approve · Ban self-nail · Ban Meridian · Ban HA cloud buy · Ban retry-to-green · Ban invent covered · Ban 静默改老 `uc028:trace-fail-open:prove`（接线后其 EXIT=1 为设计绊线）· Ban wash `GAP-UC028-RECON`/`TRUTH-BLOCK-E2E`。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503.

---

*Slice · NHP-028-FAULT-01 · draft:awaiting_pre_exec_dual · EXIT0≠covered · coveredCount=8 · STOP*
