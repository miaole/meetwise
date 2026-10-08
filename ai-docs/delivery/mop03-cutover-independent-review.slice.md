# Slice — **MOP03-B · MODEL-OP #102 域 cutover 独立审材料包**（REQUEST · docs-only · `draft:awaiting_pre_exec_dual`）

**Status**: **`executed:awaiting_post_dual`**（EXEC 材料包核验已落 · 2026-10-07 · rg 复验 **46/46 HIT · 0 偏离** · §2-F 订正锚全用新号 · 收据 `receipts/mop03-cutover-review/00-summary.md` · rg 结果在 exec commit message · 零 coding · 零 prove 执行 · 零 live · 零 SSOT · 零 `:76` 触碰 · Ban self-approve · alone ≠ dual · Ban self-nail until POST BOTH + meetwise AUTHORIZE）

> **Pre-exec-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（L0 docs only · 材料包组装）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · **PG LISTEN retained**
**Date**: 2026-10-07（Asia/Shanghai）
**Base**: `origin/feat/mysql-schema-skeleton` · **`fe218b7a`** / `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9`（fetch 后 origin tip）
**Authority**: meetwise — 待授权 · 流程：REQUEST → 预执行双审（mw-model-op + mw-e2e-ha）→ meetwise 授权 → 执行（材料包核验 + 引用面 rg 实证）→ post 双审 → meetwise 授权 nail

## One-line

GAP-MOP-03 `:76` **OPEN** 后继刀第二刀：为「**MODEL-OP #102 域 cutover**」组装**独立审材料包**（承卷证据清单 Q4/Q5 EXIT / wiring 锚 / PG LISTEN retained / Redis unset / model-operation-registry 面 + 独立审判据七门不降级 + 审后残留义务）· **本刀不切流 · 不关行 · 不宣称 cutover 成立** · 承卷 AN-MOP-Q45 `post_prove_dual_pass`（Q4/Q5 EXIT 0/0 @`66a77ed` · Redis unset · PG LISTEN retained）勿重做。

## Products

| Role | Path |
|------|------|
| Harness | `harness/mop03-cutover-independent-review.md` |
| Dual `mw-model-op` | `reviews/REQUEST-2026-10-07-mop03-cutover-mw-model-op.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-mop03-cutover-mw-e2e-ha.md` |

## 材料包三件（harness §2–§4）

1. **承卷证据清单**（§2 A–E · 锚 @`fe218b7a` 实测）：Q4/Q5 同列 EXIT 0/0（`package.json:198/:202` · PROVE `a1f3614` · CODE `66a77ed` · attempt 1）· wiring 锚（`apps/worker/src/main.ts:677/:680/:694/:712`）· PG LISTEN retained（`main.ts:633/:641` · `packages/db/src/worker-job-wakeup.ts:7/:15`）· Redis unset + value-gate default-off（`worker-job-wakeup-redis.ts:21/:49-52` · `test/worker-job-wakeup-redis.proof.ts:27-28`）· model-operation-registry 面（`packages/ai-runtime/src/model-operation-registry.ts` · `model-op-registry-v1` · wired:false fail-closed）。
2. **独立审判据**（§3 七门 · 沿 MOP03 `:76` successor 六门合同不加不减）：fresh Q4/Q5 同列门（承卷 `66a77ed` 是背景不可替代）· wakeup prove + 强制周期 reconcile · flag 默认关→审后开 · PG LISTEN retained 至最后 · 独立审 ≥ dual + BUG-REV-COND 四专家审不降级 · 两本账沿 I 线 · 诚实非 claims（任一门未过 → 声明不成立）。
3. **审后残留义务**（§4）：行翻转另 nail · PG LISTEN 退役另步 + 回滚预案 · GAP-MOP-01 有界延迟窗携带 · GAP-MOP-02 `:75` 独立行不动 · 矩阵零触碰 coveredCount=8 · 两本账持续 · Redis 只评估不切 · 旧 prove 语义标注另刀处置。

## 执行面（授权后 · 只读）

`rg` / `git` 对 §2 A–E 锚逐条复验 + 材料包完备性核对。**Ban**：产品码 · SSOT · flag · 容器 · prove 执行 · live · `.env*`。

## Bans（硬 Ban）

- **Ban Redis cutover**（PG LISTEN/NOTIFY 保留 · Redis 只评估不切 · 不启 flag · 不写 Redis prove 授权）
- **Ban MODEL-OP fake closed**（本刀不关 `:76` 行 · 行翻转 = 独立审 BOTH PASS 后另 nail · Ban SLO forge / covered 扩面）
- **Ban 洗掉「prove EXIT 同列绿 禁止宣称 MODEL-OP/SLO/cutover 已关」原钉**
- **Ban 改共享 SSOT**（backlog / matrix / checklist / queue 零 diff · nail 阶段才登记）
- Ban #102 借本刀合入 · Ban 独立审降级（四专家审不可减）· Ban self-approve（alone ≠ dual）· Ban 互相代签
- Ban coding / prove 执行 / live / 容器 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push

## EXIT 契约（预声明 · 适用于未来授权后的独立审 prove · 本 REQUEST 零执行）

attempts 全记录（逐条 EXIT · Asia/Shanghai · code SHA）· 诚实失败原样入账 · **Ban retry-to-green**（`:68` flake 先例）· **承卷 `66a77ed` EXIT0 是背景证据，不可替代独立审 fresh 门** · EXIT0 ≠ MODEL-OP closed ≠ SLO ≠ cutover ≠ HA ≠ suite（Line C 口径 · not_run 不计 pass）。

## Non-claims

not #102 cutover 成立 · not MODEL-OP closed · not SLO · not Redis cutover · not PG LISTEN 退役 · not HA · not suite green · not `releaseEvidence=true` · not coveredCount 扩面 · `actualSpendCny=null` · `:76` **OPEN** · alone ≠ dual · PASS ≠ 执行 ≠ AUTHORIZE ≠ nail

*Slice · MOP03-B MODEL-OP #102 domain cutover independent review evidence pack · 2026-10-07 · `executed:awaiting_post_dual` · EXEC 材料包核验 46/46 HIT · 0 偏离 · 零 coding · 零 prove 执行 · Ban Redis cutover · Ban MODEL-OP closed · PG LISTEN retained · `:76` OPEN · alone ≠ dual · STOP（awaiting post dual）*
