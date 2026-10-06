# Slice — **GAP-UC025-FAULT-ISOLATED-01 · UC-025 FAULT 隔离 PG/HTTP 证据层**（Line W · docs-only REQUEST · **`draft:awaiting_pre_exec_dual`** · Ban coding · Ban prove · Ban push）

**Status**: **`draft:awaiting_pre_exec_dual`** · docs REQUEST only · not coding permission · not a prove run · not a nail · pre-exec dual PASS ≠ coding；coding 由协调方在双审 PASS 后另行授权 · Ban self-approve · alone ≠ dual
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05（Line W · coordinator-prioritized #2）
**Base**: `origin/feat/mysql-schema-skeleton` **`44154aa5`** / full `44154aa53a8c8508e8e8b1c51333c648187ac360`（AA nail `15eedd6` 之后）
**Authority**: meetwise — L0 docs only · 本 commit 不改任何代码 · 不跑 prove · 不 push
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-w`（branch `line/w-uc025-fault-isolated` · 一切 git 写操作只在独立 worktree 内）

## One-line

AA `15eedd6` 已 nail `NHP-025-FAULT-01`（409 `missing_quiz_expiry` fail-closed · code `a8b98fc` · tip `3a6ec52` · dual `c674cb5`+`42b9834`），但其 prove 为 **in-process**（`InterviewService.begin` + fake DB · 无 PG · 无网络 · 无真实 HTTP），AA harness/proof 自证「**≠ isolated Postgres/HTTP E2E** · **≠ covered** · PG/HTTP-level FAULT → **separate knife**」。本刀 = 该 separate knife：新增隔离面 FAULT prove（拟 `pnpm uc025:nhp-fault-isolated:prove`）——真实 HTTP 注入（缺锚/NaN → begin 409 `missing_quiz_expiry`）+ DB before/after 快照 + 三层隔离壳（随机容器/动态端口/迁移白名单），判据与 AA 同（409 码/NaN fail-closed/顺序 NEG→FAULT→BOUND/无 quiz-id 跳过）。**与 AA in-process 证据互补不互替**；Ban 洗 AA 证据为已足够；Ban 翻 UC-025 行（stays AA nail 后现状：row gap · FAULT 列 gap · NEG frozen · BOUND gap · ADV blind · coveredCount=8）。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc025-fault-isolated.md` |
| Pre-exec dual stub `mw-e2e-ha` | `reviews/REQUEST-2026-10-05-gap-uc025-fault-isolated-mw-e2e-ha.md` |
| Pre-exec dual stub `mw-privacy-int` | `reviews/REQUEST-2026-10-05-gap-uc025-fault-isolated-mw-privacy-int.md`（quiz 锚点涉 privacy 授权域邻接；若审后判纯 commerce/E2E 可改 `mw-rag-route` 并在 stub 说明理由） |
| AA in-process nail（只读冻结 · 不洗不替代） | `harness/nhp-025-fault-01-missing-expiry-fail-closed.md` · `nhp-025-fault-01-missing-expiry-fail-closed.slice.md` · `receipts/2026-10-06-nhp-025-fault-01-missing-expiry-fail-closed-prove.md` · proof `apps/api/test/uc-e2e-025-nhp-fault.proof.ts` @ `a8b98fc` |
| 先例（只读） | K `uc014:webhook-adv:prove`（root `package.json:148-149` 三层注册）· `scripts/run-e2e-isolated.mjs`（随机容器/动态端口/迁移白名单）· `apps/api/test/_neg-harness.ts`（`listen(0)` 真 HTTP + 迁移白名单 boot）· B'' `harness/gap-uc025-neg-real-wiring.md`（EXIT 契约写法先例） |

旧 PASS/FAIL/PENDING review 文件一律不覆写。

## Choice

**隔离面升级（GAP-UC025-FAULT-ISOLATED-01）** over 翻行 / 重洗 AA / 重跑 NEG-BOUND：AA 自己的条款把 PG/HTTP 隔离面留给 separate knife；本刀接刀。case 仍 `NHP-025-FAULT-01`（证据层升级，不新开 NHP case 行）；gap id 新具名，不改任何既有 gap id。**互补不互替**：AA in-process 钉死服务逻辑判据；本刀证同一判据在真实 HTTP + 隔离 PG 上复现（`0135` 锚列真列 · `app.listen(0)` 真 HTTP）。

## Prove 拟案（授权后才存在 · 本 REQUEST 零代码）

- 拟 CMD：`pnpm uc025:nhp-fault-isolated:prove`（三层注册：root `:prove` → `scripts/run-e2e-isolated.mjs …:raw` → `pnpm -C apps/api prove:uc025-nhp-fault-isolated`；拟名待授权注册）。
- 注入 F1–F5：缺锚（NULL）→ 409 `missing_quiz_expiry` + 零副作用快照 · NaN 锚 → 同口 · 新鲜锚正控（防过宽假绿）· 过去锚 → `stale_quiz`（NEG 冻结顺序控制）· 无 quiz-id → 整块跳过。ADV（跨用户 replay）非本刀，Ban widen。
- 回归：同 tip `uc025:nhp-neg:prove` + `uc025:nhp-bound:prove` + `uc025:nhp-fault:prove` 仍 EXIT0；Ban 改三者迁就。

## Prove EXIT 契约

- **EXIT 0 当且仅当隔离面全部断言成立**（F1–F5 + DB before/after 快照 + 三层壳隔离证据）。
- **EXIT 1 = 诚实保留**：打印 `GAP-UC025-FAULT-ISOLATED-01` 明细落 receipt；attempts 全记录（含中断/失败逐次记录 EXIT+时间戳）；Ban retry-to-green；Ban 记 flake。
- **EXIT0 ≠ covered ≠ nail ≠ 翻行**：FAULT 列 stays gap · row stays gap · coveredCount=**8**；翻列须 post-prove dual PASS + 协调方 nail。

## Ban

Ban coding · Ban prove 执行 · Ban push · Ban 洗 AA in-process 证据为已足够（互补不互替）· Ban 重跑/改写 AA proof 冒充隔离面 · Ban 触碰 AA/B''/W 已钉 proof·harness·receipt · Ban SSOT edit · Ban covered · Ban coveredCount bump · Ban wash NEG/BOUND/FAULT · Ban widen（ADV/REGEN）· Ban invent a fix · Ban 把 EXIT1 记成 flake · Ban secrets / `.env*` · Ban Meridian · Ban HA cloud buy · Ban force-push · Ban self-approve · Ban self-nail。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503.

## Coding pins（授权 coding 前须兑现 · 预填）

- **判据 = AA 原值**：409 · `missing_quiz_expiry` · NULL/NaN fail-closed · 顺序 NEG→FAULT→BOUND · 无 quiz-id 跳过 · C-1 supersede 窄保留（NULL≠`stale_quiz`）。
- **拟新增产物**：`apps/api/test/uc-e2e-025-nhp-fault-isolated.proof.ts` + root/apps 注册两条 script（拟名见上）；**Ban 改任何既有 proof**。
- **隔离壳**：随机 `meetwise-e2e-*` 容器（只删自建）· 动态端口 · 迁移白名单（含 `20_resume_quiz` + `0135`）· `assertIsolatedTestTarget` · 真 HTTP `listen(0)`+fetch · 负路径 `MODEL_API_KEY` 删除。
- PRE：mw-e2e-ha + mw-privacy-int（或 rag-route）双 PASS 后由协调方授权 coding；本 REQUEST tip `44154aa5`。

---

*Slice · GAP-UC025-FAULT-ISOLATED-01 · Line W docs-only REQUEST · 2026-10-05 · draft:awaiting_pre_exec_dual · 隔离 PG/HTTP 面 · 与 AA in-process 互补不互替 · Ban coding · Ban prove · Ban push · Ban 洗 AA · Ban 翻行 · coveredCount=8 · STOP*
