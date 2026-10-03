# REQUEST — NOTE-CKPT-UNSEALED-CLAIM-NEG · pre-exec · mw-e2e-ha

**Status**: pre-exec **PASS**（有条件）· `draft:awaiting_pre_exec_dual` · 不代签 `mw-privacy-int` · alone≠dual
**Expert**: `mw-e2e-ha`
**REQUEST**: `a1a06ab04bdf5b765b0c62ef0825c9ba3e8f13e0`（`a1a06ab`）
**Docs-only**: `git show --stat a1a06ab` 仅 4 个 markdown。无迁移、无 prove、无 principal 改动。该 SHA 是 tip `5cd6cbc` 的祖先，且在 `origin/feat/mysql-schema-skeleton` 上。
**Knife**: `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md` · `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md`
**Date**: 2026-10-02（PT）
**本 PASS**: ≠ 现在就可以 coding · ≠ covered · ≠ nail · ≠ next knife · alone≠dual · **`49ef158` 的 post-prove PASS 不是 Line B nail**

## Pins（保留）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（保持） |

## 编码必须等 Line B nail

harness `:10`：本开档不授权 coding；coding 是下一刀，而且只在 Line B `GAP-UC052-POOL-ROLE-LEAK` **nailed** 之后。`:32` 再次写「starts only after Line B is nailed」。`:51–52` prove 计划第一步是等待该 nail。slice `:1`、`:12` 同。stub 原文 `:25` 也写 No coding is authorized。

我在 `49ef158` 的 post-prove PASS（`ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-post-prove-mw-e2e-ha.md:24`、`:32`、`:145`）写明该 PASS ≠ nail。`:146` 点名本 REQUEST 当时未审。本 REQUEST **没有**把 `49ef158` 写成开工许可。现在不能开工。

## 负例保持精确

已在 pool-role-leak prove 上判定 **C-UNSEALED-NEG = MET**（同上 post-prove `:112`）：NULL epoch、NULL digest、both；`sqlState=42501`；`claimed=false`；`unchanged=true`；不是只 `rejects()`。源在 `packages/db/migrations/0091_privacy_authorization_issuer.sql:369–374`：epoch 先于 digest；NULL epoch → `privacy_authorization_epoch_mismatch` / `42501`；NULL digest → `privacy_authorization_digest_mismatch` / `42501`。

本计划没有放宽：

- 三案表 harness `:21–23`：同样两个 NULL 加 both；ERRCODE **`42501`**；行不变 / 无写入。both 走 epoch 分支，禁止另造第三个 SQLSTATE（`:23`）。
- `:26`：只有应用层 catch、没有 SQLSTATE ≠ pass。任一 NULL 案却 claim 成功 ≠ pass。
- NHP `:42–47`：三案都要 `42501` 且无写入；错误 SQLSTATE 或写出一行 → fail；伪造应用层异常而没有 DB ERRCODE → fail。
- slice `:12`：拒绝是 SQLSTATE `42501` 且无写入。

没有改成「抛了就算过」，也没有放宽接受面。不触发 FAIL。

## 条件

1. 编码与 prove 只在 Line B **nail** 之后，不在 `49ef158` / `7cb7010` 的 post-prove PASS 之后。本文件不是 nail。
2. 新刀必须保持：NULL epoch、NULL digest、both；SQLSTATE 正好 `42501`；both 仍是 epoch 文案；无状态变化（`unchanged=true`）。只断言 throws / `rejects()` 不算过。
3. 默认只做 DB prove。不并行改 `checkpoint-principal.ts`（harness `:30`）。public DELETE 保持 **503**。coveredCount 保持 **8**。UC-052 ≠ covered。
4. 不代签 privacy-int。

Verdict: PASS

---

# RE-PRE-EXEC · rewrite `a24382b` · mw-e2e-ha

**Status**: re-pre-exec **PASS**（有条件）· alone≠dual · 不代签 `mw-privacy-int`
**Expert**: `mw-e2e-ha`
**被审 SHA**: `a24382b6ae10464e2b7abcc957bec43ef2868061`（`a24382b`，docs(privacy) rewrite）
**基线 tip**: `3d7063f9335398b776a89327c5131382b8629c55`（`a24382b` 是其祖先，EXIT=0）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-f-e2e-ha`（branch `rv/f-e2e-ha`）
**Date**: 2026-10-02（PT）
**本 PASS**: ≠ dual · ≠ 开工许可 · ≠ UC-052 covered · 本线 docs-only **永久无 coding**

## 检查表（file:line 证据）

| # | 项 | 证据 | 结果 |
|---|-----|------|------|
| 1 | 祖先关系 | `git merge-base --is-ancestor a24382b HEAD` EXIT=0 @ `3d7063f` | ✓ |
| 2 | docs-only | `git show --name-status a24382b` 仅 `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md` + `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md`；无产品代码/迁移/route/package.json/principal/SSOT 触碰 | ✓ |
| 3 | 引证零漂移 | `git log a24382b..HEAD -- packages/db/test/uc052-checkpoint-physical.proof.ts packages/db/migrations/0091_privacy_authorization_issuer.sql` 为空；引证在 @`a24382b` 与 @`3d7063f` 同样有效 | ✓ |
| 4 | 负例精确性未放宽 | `packages/db/migrations/0091_privacy_authorization_issuer.sql:369–371` epoch 先判（NULL → `privacy_authorization_epoch_mismatch` · `42501`）；`:372–374` digest（NULL → `privacy_authorization_digest_mismatch` · `42501`）。harness:15–18 / slice:13–16 陈述与此一致：refusal + unchanged rows；both 先 epoch；未放宽接受面 | ✓ |
| 5 | 引证逐一实测相符 | EPOCH=`proof.ts:763–766` · DIGEST=`:768–771` · BOTH=`:773–776`（both→epoch 文案 `:747–749`）· 正控=`:780–804`（lease 断言 `:804`）· 共享断言 `sqlState==='42501'`+拒绝文案+unchanged=`:750–758` | ✓ |
| 6 | 无 evidence 洗白 | 矩阵 `ai-docs/delivery/e2e-requirement-coverage-matrix.md:124`/`:182`：UC-052 仍 **partial / ≠ covered**、coveredCount **8**、externals **`retention_pending`**、DELETE **503**；`a24382b` 未触碰矩阵/backlog/checklist；harness:29 "do not flip coverage or invent a covered result"、:26 "pin, not completion evidence" | ✓ |
| 7 | 退役≠放宽 | harness:7/:11/:20/:22（"documentary only; do not rerun or extend the proof" · "No product code, migration, route, test, prove run, or nail is in scope"）、:27–:28（principal/proof 文件保持不变）、:34（no self-approve）· slice:6–7/:11/:18/:24/:30。比旧 C1（等 Line B nail 才许 coding）**更严**：本线永久无 coding | ✓ |
| 8 | Pins 8+1 原值 | harness:26/:30/:32 · slice:22/:26/:28：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · PG-retained · 公开 DELETE=**503** · external retention **`retention_pending`**；与 SSOT 现值一致 | ✓ |

## Nit（非 blocker）

共享断言的 `expectMsg` 计算在 `proof.ts:747–749`，紧邻 harness:20 所引区间 `750–758` 之前；区间起点写 747 更精确。断言语句本身均在区间内，语义相符，不构成 blocker。

## Blockers

无。

## Conditions（binding）

- **C1-NO-CODING-THIS-LINE-PERMANENT**: 重写后本线（NOTE-CKPT-UNSEALED-CLAIM-NEG）实现刀已退役：本线**永久**无 coding、无 prove、无 nail；两份 docs、`apps/worker/src/checkpoint-principal.ts`、`packages/db/test/uc052-checkpoint-physical.proof.ts` 保持原样。恢复实现范围或对两份 docs 的实质语义变更必须开**新 REQUEST** 并重新双审（协议性状态位翻转 draft→dual-pass 不在此限，但不得引入新语义）。任何未来实现刀仍受旧 C1 前置：coding 只在 Line B `GAP-UC052-POOL-ROLE-LEAK` **nail** 之后；`49ef158` post-prove PASS ≠ nail。
- **C2-NEG-PRECISION**: 若未来重开负例实现：NULL epoch / NULL digest / both 三案；SQLSTATE 正好 `42501`；both 仍走 epoch 文案；无状态变化（`claimed=false` / `unchanged=true`）；只断言 throws / `rejects()` 不算过。
- **C3-PINS-FROZEN**: 8+1 pins 不动（见检查表 #8）。UC-052 ≠ covered；coveredCount=8；三 SSOT（e2e-requirement-coverage-matrix / e2e-covered-path-backlog / execution-master-checklist）不得由本线改动。
- **C4-ALONE-NOT-DUAL**: 本 PASS 仅 `mw-e2e-ha` 单签；不代签 `mw-privacy-int`。dual 成立需 privacy-int 对 `a24382b` 的独立 re-pre-exec 收据（其上轮 S5/S6 是否闭合由其自行判定）。

## 中文三行摘要

1. `a24382b` 纯文档化、零实现面：退役补测刀，四案 file:line 引证逐一实测相符，与 0091 的 SQLSTATE/文案语义一致，负例精确性未放宽。
2. 无洗白：矩阵 UC-052 仍 partial/≠ covered、coveredCount=8、externals `retention_pending`、公开 DELETE=503 原值；8+1 pins 齐全且 "pin, not completion evidence" 表述诚实。
3. 旧条件重述更严（本线永久无 coding，恢复实现须新 REQUEST 且仍受 Line B nail 前置）；单签 PASS，dual 待 `mw-privacy-int` 独立复审。

Verdict: PASS
