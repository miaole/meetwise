# Slice — **MOP03-C · MODEL-OP #102 域 cutover 宣告刀**（REQUEST · docs-only · `draft:awaiting_pre_exec_dual` · 七门合同 G1–G7 全部行使）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs-only REQUEST · 零 coding · 零 prove 执行（fresh Q4/Q5 属 EXEC 面 · 本面禁跑）· 零 live · 零容器 · 零 SSOT（backlog / matrix / checklist / queue 零 diff）· 零 `:76` 触碰 · Ban self-approve · alone ≠ dual · Ban nail until 全链 + 四专家审 BOTH + 协调方 AUTHORIZE）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · **PG LISTEN retained**
**Date**: 2026-10-07（Asia/Shanghai）
**Base**: `origin/feat/mysql-schema-skeleton` · **`9265e4d8`** / `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`（fetch 后 origin tip）
**Authority**: meetwise — 待授权 · 流程：REQUEST（本 commit）→ 预执行双审（mw-model-op + mw-e2e-ha）→ meetwise 授权 → EXEC（fresh Q4/Q5 同列 + value-gate 审前 unset 核验）→ 四专家审（mw-e2e-ha + mw-privacy-int + mw-rag-route + mw-model-op）→ meetwise AUTHORIZE → nail（`:76` 行翻转在此 nail 面）

## One-line

GAP-MOP-03 `:76` **OPEN** 后继刀第三刀（MOP03-B 材料包 nail @checklist `:1384` 登记的「未来 cutover REQUEST」本身）：为「**MODEL-OP #102 域 cutover**」行使**七门合同 G1–G7 全部门**——REQUEST 面只落行使方案书 + 预执行双审 stubs，**不跑 prove、不切流、不翻转 `:76`、不宣称 cutover 成立** · 承卷 AN-MOP-Q45（`66a77ed` EXIT0 仅背景不可替代）· 承 MOP03 立卷六门合同 + MOP03-B 七门判据不加不减不降级。

## Products

| Role | Path |
|------|------|
| Harness | `harness/mop03-cutover-declare.md` |
| Slice | `mop03-cutover-declare.slice.md`（本文件） |
| Dual `mw-model-op` | `reviews/REQUEST-2026-10-07-mop03-cutover-declare-mw-model-op.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-mop03-cutover-declare-mw-e2e-ha.md` |
| 四专家审 stubs（EXEC 后另落） | mw-e2e-ha + mw-privacy-int + mw-rag-route + mw-model-op 四席 · 本 REQUEST 不预开 |

## 七门行使方案（G1–G7 · 详见 harness §2）

1. **G1 fresh 同列门**：EXEC 面新跑 `pnpm model-invocation-reconcile:prove`（Q4 `package.json:198`）+ `pnpm model-op00-usage-reconciler:prove`（Q5 `package.json:202`）同列 EXIT 0/0 · 同一 CODE_SHA · 预声明 attempt 窗（Asia/Shanghai · EXEC 授权当日 20:00–23:59 +08 · 每 CMD 单次 attempt）· attempts 全账 · Ban retry-to-green · **承卷 `66a77ed` EXIT0 仅背景不可替代**。
2. **G2 wakeup + 强制周期 reconcile**：`pnpm worker-wakeup:prove`（`package.json:391`）诚实标注 **PG-unit 层 only** · `worker-wakeup-redis:prove` EXIT0 ≠ cutover 证据 · 强制周期 reconcile 证据面（`main.ts:677/:679-680/:694/:712`）+「未在 sole stack 证明」诚实清单原样携带 · PG/Redis 两层分开标注 Ban 顶替。
3. **G3 value-gate 审前 unset + 开启只在 AUTHORIZE 后**：`MEETWISE_WAKEUP_REDIS_STREAMS` value-gate 逐字保持（`worker-job-wakeup-redis.ts:21/:49-52`）· PRE 开审前 + EXEC 落 prove 前核验 unset（入 receipt）· 审面全程 unset · flag 开启只在 meetwise AUTHORIZE 后且不解除 G4。
4. **G4 PG LISTEN retained 至最后**：`meetwise_worker_wakeup_v1`（`worker-job-wakeup.ts:15` · `main.ts:633/:640-641` · `worker-job-wakeup.ts:7`）零摘除零绕过 · 实际退役 = 宣告成立后单独授权另步 + **回滚预案**（PG fallback 回切 · 无预案不受理）。
5. **G5 独立审规格不降级**：≥ PRE/POST dual（mw-model-op + mw-e2e-ha）+ 四专家审四席（mw-e2e-ha + mw-privacy-int + mw-rag-route + mw-model-op · EXEC 后按合同召集 · 含 ADR 隐私 prove 清单全绿核对 · cite-only 本 REQUEST）· Ban 自批 · alone ≠ dual · 不互相代签 · **换审冻结**。
6. **G6 两本账分离沿 I 线**：estimated/actual 分离 · `actualSpendCny` 仅 console-cited actual 可写（今日 null）· 费率非承诺 · EXEC 面零 live 零 console spend。
7. **G7 诚实 Non-claims 全程**：EXIT0 ≠ MODEL-OP closed ≠ SLO ≠ HA ≠ suite green ≠ coveredCount 扩面 · 无洗前钉 · 无 SSOT 静默改 · 无 retry-to-green · PASS ≠「cutover 已完成」。

任一门未过 → 宣告不成立（可部分通过 = 不成立 · Ban「大体通过」）。

## Bans（硬 Ban）

- **Ban Redis cutover**（PG LISTEN/NOTIFY 保留 · Redis 只评估不切 · 不启 flag · 不写 Redis prove 授权 · PG LISTEN 退役另步）
- **Ban MODEL-OP fake closed**（本 REQUEST 不关 `:76` 行 · Ban SLO forge / fake green / coveredCount 扩面）
- **Ban 洗「prove EXIT 同列绿 禁止宣称 MODEL-OP/SLO/cutover 已关」原钉**（backlog `:76` 原文 · checklist `:1031`/`:1132` 逐字保留）
- **Ban 改共享 SSOT**（backlog / matrix / checklist / queue 零 diff；`:76` 行翻转 = 本刀全链 + 四专家审 BOTH + 单独 nail + 协调方 AUTHORIZE 后的 nail 面动作 · 缺一不可）
- **Ban secrets**（`.env*` 读改）· Ban coding · Ban prove 执行（fresh Q4/Q5 属 EXEC 面 · 授权前禁跑）· Ban live / 容器 · Ban Meridian · Ban buy cloud · Ban force-push · Ban 碰 sibling 刀文件 · Ban 独立审降级 · Ban self-approve（alone ≠ dual）· Ban 互相代签 · Ban 静默换审

## EXIT 契约（预声明 · 适用于授权后 EXEC · 本 REQUEST 零执行）

attempts 全记录（序号 · Asia/Shanghai 起止 · code SHA · EXIT）· 失败与成功同列入账 · 原样零改 · 诚实失败判 fail · **Ban retry-to-green**（重跑须新 REQUEST + 双审）· 预声明窗内每 CMD 单次 attempt · EXIT0 ≠ MODEL-OP closed ≠ SLO ≠ cutover ≠ HA ≠ suite（Line C 口径 · not_run 不计 pass）· 四专家审可独立复跑 EXEC receipt。

## Non-claims

docs-only REQUEST 七门行使方案书 · not #102 cutover 成立 · not MODEL-OP closed · not SLO · not Redis cutover · not flag 开启 · not PG LISTEN 退役 · not HA · not suite green · not `releaseEvidence=true` · not coveredCount 扩面 · `actualSpendCny=null` · `:76` **OPEN** · alone ≠ dual · PASS ≠ 执行 ≠ AUTHORIZE ≠ nail · 四专家审面未开（EXEC 后按合同召集）

*Slice · MOP03-C MODEL-OP #102 domain cutover declare · 2026-10-07 · `draft:awaiting_pre_exec_dual` · 七门合同 G1–G7 全部行使 · 零 coding · 零 prove 执行（fresh Q4/Q5 属 EXEC 面）· 承卷 `66a77ed` 仅背景不可替代 · Ban Redis cutover · Ban MODEL-OP fake closed · Ban 洗原钉 · Ban 改共享 SSOT · PG LISTEN retained · `:76` OPEN · alone ≠ dual · nail = 协调方授权 · STOP（awaiting pre-exec dual）*
