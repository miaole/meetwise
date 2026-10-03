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
