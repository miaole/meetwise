# REQUEST — **GAP-UC025-FAULT-ISOLATED-01 · UC-025 FAULT 隔离 PG/HTTP 证据层** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-uc025-fault-isolated.md` · slice `gap-uc025-fault-isolated.slice.md`
**Parent tip**: `44154aa5`（full `44154aa53a8c8508e8e8b1c51333c648187ac360` = origin tip · AA nail `15eedd6` 之后）
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

## 请审什么（mw-e2e-ha · evidence-honesty / EXIT 契约 / 三层隔离壳）

Line W · UC-025 FAULT 隔离面升级刀（AA in-process nail `15eedd6` 之后 · coordinator-prioritized #2）。请审：

1. **互补不互替裁决**：AA in-process（`InterviewService.begin` + fake DB · 无 PG 无网络 · proof 自证「no PostgreSQL, no network」）≠ isolated ≠ covered；AA harness 明文「PG/HTTP-level FAULT → separate knife」。本刀是否诚实定性为**新增隔离面**而非重跑/替代/洗 AA；Ban 洗 AA 证据为已足够。
2. **判据原值**：隔离面判据 = AA 钉死口径原值（409 · `missing_quiz_expiry` · NULL/NaN fail-closed fold 同口 · 顺序 NEG `stale_quiz`→FAULT→BOUND `resume_version_mismatch` · 无 quiz-id 整块跳过 · C-1 supersede 窄保留 NULL≠`stale_quiz`）——是否零漂移、未发明新验收标准。
3. **三层隔离壳方案**：随机 `meetwise-e2e-*` 容器（只删自建、不触开发库）+ 动态端口（`app.listen(0)` 先例 `_neg-harness.ts:89`）+ 迁移白名单（`01_schema`…`22_interview_invitation` 含 `20_resume_quiz`/`0135`）+ `assertIsolatedTestTarget`；注册先例 K `uc014:webhook-adv:prove`（root `package.json:148-149` 三层）；真 HTTP = 真 Nest app 真 fetch 非直调 service。方案是否与 `run-e2e-isolated.mjs` 头注契约一致、是否引入 fake-green 面。
4. **注入面 F1–F5**：缺锚（NULL）主断言 + NaN 锚同口 + 新鲜锚正控（防「带 quiz-id 一律拒」过宽假绿）+ 过去锚 `stale_quiz` 顺序控制 + 无 quiz-id 跳过；DB before/after 零副作用快照（interview 未建/额度未扣/队列未入）。是否完整覆盖 AA 判据、是否越界（ADV 跨用户 replay 非本刀，owner-scope 仅 disclosed-not-blocking）。
5. **EXIT 契约诚实**：EXIT 0 当且仅当隔离面全部断言成立；任一做不出 → EXIT1 诚实保留（`GAP-UC025-FAULT-ISOLATED-01` 明细落 receipt）；attempts 全记录（含中断/失败逐次记录 EXIT+时间戳）、Ban retry-to-green、Ban 记 flake；EXIT0 ≠ covered ≠ nail ≠ 翻行。
6. **禁碰与回归**：AA in-process proof/harness/slice/receipt + B'' NEG proof + 前 W BOUND proof 零改动（ruler 冻结）；授权 prove 时同 tip `uc025:nhp-neg:prove` + `uc025:nhp-bound:prove` + `uc025:nhp-fault:prove` 仍 EXIT0、Ban 改三者迁就；SSOT 零触碰（登记留 nail）；UC-018/052/004/014/026/002/011 不碰。
7. **Pins 原值**：上表 8 项不翻；row stays gap · FAULT 列 stays gap · coveredCount=8。

Dual PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA.

---

*Stub · awaiting expert pre-exec dual · STOP*
