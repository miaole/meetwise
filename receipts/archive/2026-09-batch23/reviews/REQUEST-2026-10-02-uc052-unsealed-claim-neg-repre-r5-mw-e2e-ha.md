# 审查 — UC-052 unsealed NEG re-pre-exec r5 · mw-e2e-ha

**角色**: `mw-e2e-ha`（证据诚实 · 对抗）· **不代签** `mw-privacy-int`
**轮次**: Line F RE-PRE-EXEC round 5 · docs-only · 未跑 prove · 未起 Postgres · 未改产品代码
**审的 tip**: `ff43d63` / `ff43d630d83100f0089b7d0a96f1e72a58beeda9`
**父提交**: `018d692` / `018d69225ff928b3a1a3956d48587c220342e9ec`
**前次 FAIL（未改）**: `cc326ac` · `ai-docs/delivery/reviews/REQUEST-2026-10-02-uc052-unsealed-claim-neg-repre-r4-mw-e2e-ha.md`（当时 tip `2a66c22`）
**本轮 diff**: `git diff 018d692 ff43d63 --name-only` = 仅 `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md`（+3/−3）
**docs-only**: **yes**（无 `.ts` · 无 `checkpoint-principal.ts` · 无 proof 断言变更）

alone ≠ dual。本 PASS ≠ coding authorization ≠ nail ≠ covered ≠ HA ≠ `mw-privacy-int` 的签名。

---

## 1. 清理行号 L79–L103 — 通过

`git show ff43d63:ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md` L32：

> Leak site | `apps/worker/src/checkpoint-principal.ts` cleanup path **L79** `SET ROLE NONE`, **L80–82** the three principal GUC clears, **L101–103** destroy-on-reset

不再把泄漏点标成 L51–54。

同一 tip 的 `apps/worker/src/checkpoint-principal.ts`（blob `fc354f0b41a9a1b09e5efa2c45b43e3190ae2654`，与 `ab96a02` 相同）：

- L46–53 `__setCheckpointPrincipalCleanupOverrideForTest`：L51–53 是 `E2E_ISOLATED` 测试 override 门禁，不是泄漏点。本轮引用不再指向这里。
- L79 `await client.query('SET ROLE NONE');`
- L80–82 `for (const key of GUC_KEYS)` / `set_config($1, $2, false)` / 循环结束。三键在 L55：`app.principal_user`、`app.checkpoint_thread_id`、`app.checkpoint_epoch`。
- L101–103 `catch` 里 `originalRelease(resetErr instanceof Error ? resetErr : true)`，即 reset 抛错则销毁连接。

L79–L103 仍是这条清理路径（中间还有 release 包装）。行号与当前树一致。

## 2. NOTE prove 引用 — 通过

pool L21 把 **NOTE-CKPT-UNSEALED-CLAIM-NEG** 的证明/代码钉在 **`ab96a02`**（`ab96a0299d8836a635077f8bf9b61a7891aa583f`），并写明 nail **`119d6c0`** 只是 docs-only nail，EXIT=0 挂在 `ab96a02` 而不是 nail。`9b39a20` 仍写成 range-diff-equal 且不在 origin。

核对：

- `ab96a02` 是 `origin/feat/mysql-schema-skeleton` 的祖先。`9b39a20` 不是。`119d6c0` 是 `docs(privacy): NAIL UC-052 pool-role-leak post_prove_dual_pass`。
- 该证明 blob 在 `ab96a02` 与 tip `ff43d63` 相同（`2e3ca52ec3a57d796747821d044f49d45306ad43`）。
- `packages/db/test/uc052-checkpoint-physical.proof.ts` @ `ab96a02`：L750 `sqlState === '42501'`（不是裸 `rejects()`）；L763 `NHP-CKPT-UNSEALED-NEG-EPOCH`；L768 `NHP-CKPT-UNSEALED-NEG-DIGEST`；L773 `NHP-CKPT-UNSEALED-NEG-BOTH`；L778 头注释 `HP-CKPT-SEALED-CLAIM`；L780 用例到 L804 `A(id, !!lease?.leaseToken && !!verified, ...)`。既有用例，不是新 case。

checkpoint harness L172 仍写 NOTE CLOSED by the existing cites（同一组行号），与 pool L21 不再互相把关闭归于 nail `119d6c0`。

## 3. §4 allowlist 与 principal 禁令 — 通过

pool L69–L71：

> `apps/worker/test/*`（new pool-leak prove · not `packages/db/test/*`, not the unsealed-NEG proof, and not a second implementation of that proof）
> `package.json` / `scripts/run-e2e-isolated.mjs`
> Ban Line A / Line C / migrations unless dual allows · Ban matrix mid-flight

名单里没有 `apps/worker/src/checkpoint-principal.ts`，也没有 `packages/db/test/uc052-checkpoint-physical.proof.ts`。通配明确排除 `packages/db/test/*` 与 unsealed-NEG 证明及其第二实现。

principal 禁令仍在、且本提交未改这些文件：

- `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md` L27：`Keep apps/worker/src/checkpoint-principal.ts unchanged.`
- `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md` L23：`Do not edit apps/worker/src/checkpoint-principal.ts.`
- slice L7：不得授权第二实现；slice L24：不得改 checkpoint physical proof。

`ff43d63` 相对父提交没有碰到 principal，也没有改 proof 断言。

## 4. Flake 与销钉

- **GAP-PRIV-AUTHZ-PROVE-FLAKE** 仍 **OPEN**，**mitigated/cause-unknown**（not fixed）。pool L22 与 checkpoint L172 都没有用散文把它写成已修。
- coveredCount 仍 **8**（pool L9 / L20 / L84）。UC-052 仍 **partial**（pool L20；矩阵行未由本 diff 改写，仍 partial、≠ covered）。
- 无 HA。`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `ms3EqualsR4Closed=false` · PG-retained。
- `retention_pending` 仍在 note harness L26 与 slice L22。public DELETE 仍 **503**（pool L9 / L61 / L87）。源码抽查：`apps/api/src/modules/privacy/privacy.service.ts` L53–56 `eraseInterviewData` 抛 `HttpStatus.SERVICE_UNAVAILABLE`。

## 5. 抽查（非阻塞）

- 0091 @ tip：L369–373 是 epoch/digest NULL 或不等则 `42501`（L370 / L373 RAISE）；L374 是 `END IF`。pool L21 写 L369–373，inventory L34 写 L369–374。两段都盖住守卫，差一行结束括号，不构成阻塞。
- pool L46 `NHP-UNSEALED-NEG-01` 仍是计划表里的期望句，与 L21「既有证明 CLOSED」并存。本轮未把它写成新 case。不升为阻塞。
- 矩阵/backlog 仍有历史句 “prove `9b39a20` range-diff-equal code `ab96a02`”。本 diff 未改矩阵。pool L20/L21 已把 EXIT=0 钉在 `ab96a02` 并声明 `9b39a20` 不在 origin。不把旧矩阵句当成新的 119d6c0 张冠李戴。

## 6. 条件

1. docs-only tip。principal 未进 diff。PASS ≠ 编码授权。
2. 不授权改 `checkpoint-principal.ts`，不授权再写一套 unsealed NEG，不授权把 `packages/db/test/*` 放进本刀 allowlist。
3. flake 保持 OPEN。不得 retry-to-green。不得把 `119d6c0` 或 `9b39a20` 写成 prove SHA。
4. coveredCount 保持 8。UC-052 保持 partial。不得 covered flip。`retention_pending` 保持。公开 DELETE 保持 503。
5. alone ≠ dual。本文件不是 `mw-privacy-int` 的签名。

## 7. 阻塞

无阻塞。

Verdict: PASS
