# mw-e2e-ha · RE-PRE-EXEC · UC-052 unsealed NEG @`542c064`

**Role**: mw-e2e-ha（adversarial E2E evidence-honesty · docs gate only）
**Date**: 2026-10-02 (PT)
**Reviewed tip**: `542c064` / `542c0646d1635b0a3a28c5d821ad50bc6ea625a3` — `docs(delivery): retire closed UC-052 pool role gap`
**Parent**: `210f4c0dfd14b0c4eb37ae335a3868b51c636517`
**REQUEST**: `a24382b` / `a24382b6ae10464e2b7abcc957bec43ef2868061` — `docs(privacy): rewrite Line F unsealed-claim request`
**Nail cite**: `119d6c0` / `119d6c08d96fcfe6858c6686f76c9aac2d612eb2` — `docs(privacy): NAIL UC-052 pool-role-leak post_prove_dual_pass`
**Scope**: docs re-pre-exec only · no prove · no Postgres · no product edit · 不代签 mw-privacy-int
**Prior receipt left untouched**: `ai-docs/delivery/reviews/REQUEST-2026-10-02-uc052-unsealed-claim-neg-repre-mw-e2e-ha.md` @ `60cb927`（审的是 `a24382b`，不是本尖端）
**Origin at this review**: `origin/feat/mysql-schema-skeleton` = `e09a39fd83f9c2e66da7f9c137b1821033571b3a`。`542c064` 是其祖先，但不是分支尖端。自 `542c064` 起 harness 四文件无 diff。

## 1. `542c064` 自身 diff — docs-only：**是**

`git show --stat 542c064`：2 files, 2 insertions, 2 deletions。只改：

- `ai-docs/delivery/harness/uc-e2e-052-checkpoint-physical.md`
- `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md`

无产品、无 `checkpoint-principal.ts`、无 SQL role、无 proof 断言、无 migration。这一条本身不是 FAIL。

三个 SHA 都在 origin 祖先上：`git merge-base --is-ancestor` 对 `542c064`、`a24382b`、`119d6c0` 相对 `origin/feat/mysql-schema-skeleton` 均为真。

## 2. REQUEST `a24382b` — docs-only：**是**；principal 禁令：**仍在**

`git diff-tree` 仅：

- `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md`
- `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md`

相对 `542c064` 这两文件无 diff。禁令原文：

- harness L27：`Keep apps/worker/src/checkpoint-principal.ts unchanged.`
- harness L22：`No product code, migration, route, test, prove run, or nail is in scope.`
- harness L7：`this rewrite authorizes no second implementation and no second prove.`
- slice L24：`Do not edit apps/worker/src/checkpoint-principal.ts.`
- slice L7：`Do not authorize a second implementation.`

状态仍是 `draft:awaiting_re_pre_exec`。本收据不把该状态改成 nail，也不授权编码。

## 3. 读过的路径（`git show`，行号在 `542c064` 树，除非另注）

| 路径 | 行 |
|---|---|
| `ai-docs/delivery/harness/uc-e2e-052-checkpoint-physical.md` | L172–L173 |
| `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md` | L1–L12、L20–L22、L32、L35、L46、L67–L73、L86 |
| `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md` | L7、L22、L27、L32 |
| `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md` | L7、L24、L28 |
| `119d6c0` `ai-docs/delivery/gap-bug-backlog.md` | L63–L65 |
| `119d6c0` `ai-docs/delivery/execution-master-checklist.md` | L428–L432 |
| `packages/db/test/uc052-checkpoint-physical.proof.ts` | L750–L758、L763–L776、L778–L804 |
| `packages/db/migrations/0091_privacy_authorization_issuer.sql` | L369–L374 |
| `apps/worker/src/checkpoint-principal.ts` | L55–L55、L67–L104、L141–L150 |
| 收据日志 `ai-docs/delivery/receipts/uc052-pool-role-leak/logs/pool-role-leak-prove-9b39a20.log` | L19 |

`git range-diff ab96a02^..ab96a02 9b39a20^..9b39a20` 为 `=`。stable patch-id 同为 `84fc1ba316f7c420c19e9b5383266f95c81ce6ed`。`ab96a02` / `ab96a0299d8836a635077f8bf9b61a7891aa583f` 在 origin 祖先上。`9b39a20` / `9b39a20d6b53d10ac95be880037a3e716126f715` 本地对象存在，但 `git branch -r --contains` 为空，不是 origin 分支可达提交。

## 4. Open follow-ups 原文

全库 `Open follow` 只命中 checkpoint harness L172。该格原文：

`GAP-PRIV-AUTHZ-PROVE-FLAKE only — OPEN, mitigated/cause-unknown (not fixed); GAP-UC052-POOL-ROLE-LEAK CLOSED by nail 119d6c0: pnpm uc052:pool-role-leak:prove EXIT=0 (gitSha=119d6c08d96fcfe6858c6686f76c9aac2d612eb2), coding prove 9b39a20 range-diff-equal to code ab96a02; NOTE-CKPT-UNSEALED-CLAIM-NEG CLOSED by the existing cites: … L763 / L768 / L773 / header L778 / case L780 through L804; SQLSTATE 42501 check L750; 0091 L369–373`

这一格里标成 **OPEN** 的只有 `GAP-PRIV-AUTHZ-PROVE-FLAKE`。POOL 与 NOTE 在这一格里标成 CLOSED。这不洗掉同文件其余仍开放的句子（见阻塞）。

## 5. `119d6c0` 实际改了什么

`git show --stat`：仅三份文档（matrix、`execution-master-checklist.md`、`gap-bug-backlog.md`）。无产品、无 proof。

- **POOL**：backlog L63 把 `GAP-UC052-POOL-ROLE-LEAK` 从 OPEN 改成 **CLOSED**，并写 `SET ROLE NONE` + 三个 GUC + reset 抛错则销毁。树上产品路径属实，且早于该钉：`71ec2535401c6705dc3cf8ad202dbce4be5ffacf` 是 `119d6c0` 与 `542c064` 的祖先。`542c064:apps/worker/src/checkpoint-principal.ts` L79 `SET ROLE NONE`，L80–L82 清 `app.principal_user` / `app.checkpoint_thread_id` / `app.checkpoint_epoch`，L101–L103 `originalRelease(resetErr | true)`。所以 backlog 这一行不是装饰。但它**不是**证明提交。证明日志 L19 的 `gitSha=9b39a20d6b53d10ac95be880037a3e716126f715`。checklist L432 写明 `This commit does not pre-claim the post-commit EXIT table`。
- **NOTE**：backlog L64 与 checklist L429 标 **CLOSED**，指向已有 `uc052:checkpoint-physical` 负例，并写不得把 `a1a06ab` 当成第二实现。`119d6c0` 没有新增用例。负例在 `542c064` 树上仍在，且不是裸 `rejects()`：L750 `sqlState === '42501'`，L751–L755 `unchanged`，L757 `ok: refused && unchanged`；L763/L768/L773 三个 case 调 `runUnsealedClaimNeg`；L780–L804 `HP-CKPT-SEALED-CLAIM` 以 `!!lease?.leaseToken` 断言。0091 L369–L374 是 epoch 然后 digest 的 `42501`。行号引用成立。checkpoint L172 把 NOTE 的关闭归于这些既有行，而不是归于 `119d6c0`；pool L21 则写成 “CLOSED by nail 119d6c0” 再列同样行号。

flake：backlog L65 与 checklist L430 仍是 **OPEN** · mitigated/cause-unknown。与「原因未作为产品保证关闭」一致。

## 6. Pins（本 diff 没有翻）

`542c064` 两处替换后的文本仍写 UC-052 **partial**、**≠ covered**、coveredCount **8**。Pins 行 L173：`NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503`。未改 UC-018 覆盖，未把 UC-052 标 covered，未宣称 HA。coveredCount=8 不是本刀把 UC-052 算进去。

REQUEST 仍禁止第二实现。但 pool harness §4 没有撤掉允许清单（阻塞 3）。本 FAIL **不是**编码授权。

## Blockers

1. **证明 gitSha 张冠李戴。** checkpoint L172 与 pool L20 写 `pnpm uc052:pool-role-leak:prove` EXIT=0 且 `gitSha=119d6c08d96fcfe6858c6686f76c9aac2d612eb2`。同树收据日志 L19 的 gitSha 是 `9b39a20`。`119d6c0` 只改三份 SSOT 文档，checklist L432 明确不预领 post-commit EXIT。后半句 “coding prove `9b39a20` range-diff-equal `ab96a02`” 我核对为真，不能把钉 SHA 说成那次证明的 gitSha。关闭句的主证据令牌是假的。
2. **同一 pool 文件否定自己的 CLOSED。** L21 说 NOTE CLOSED，L35 仍写 `C-DIGEST-JWS asserts pre-seal NULL · no claim-before-seal NEG`（负例不存在）。L32 仍把泄漏现场写成 `checkpoint-principal.ts` **L51–L54**、`SET ROLE app_role`、无 RESET。`542c064` 树上 L51–L54 已是测试 override 的环境检查，不是泄漏点；释放清理在 L79–L103。L46 `NHP-UNSEALED-NEG-01` 仍作为待证期望留着。Open follow-ups 那一格虽然只把 flake 标 OPEN，这份被 `542c064` 改过的 harness 仍把 NOTE 说成缺失、把 POOL 说成未修。
3. **§4 仍允许改 principal 并做第二轮负例。** L69–L71 允许清单包含 `apps/worker/src/checkpoint-principal.ts` 与 `packages/db/test/uc052-checkpoint-physical.proof.ts`（UNSEALED NEG only）。这与 REQUEST harness L27 / slice L24 的 principal 禁令、以及 “no second implementation” 矛盾。文件头 L12 仍写 `Ban coding until dual+authorize`，所以这不是当下开工令，但它是未撤回的第二实现允许清单。`542c064` 只改了 L20，没有撤掉它。

## Conditions

1. Open follow-ups **格子**里唯一 OPEN 名字是 `GAP-PRIV-AUTHZ-PROVE-FLAKE`（mitigated/cause-unknown，not fixed）。阻塞 2 是同文件其他节，不是该格里的第二个 OPEN 标签。
2. `119d6c0` backlog L63–L64 确实把 POOL 与 NOTE 标成 CLOSED，产品 `SET ROLE NONE` 路径与既有 42501 负例也在。阻塞不是「钉完全是装饰」，而是 harness 把钉 SHA 当成 prove gitSha，并且同文件残留未修/负例不存在/允许改 principal。
3. origin 尖端已是 `e09a39f`，不是 `542c064`。其后提交未改本审的四份 harness/slice。`9b39a20` 不在 origin 可达集，仅与在分支上的 `ab96a02` patch 相等。
4. 0091 harness 写 L369–L373；`END IF` 在 L374。RAISE 本身在 L370 与 L373。
5. `119d6c0` 消息里的 dual `49ef158` / `7cb7010` 本收据不复核、不代签。alone ≠ dual。
6. 本 FAIL ≠ covered ≠ nail ≠ HA ≠ 编码授权。`retention_pending` 与 public DELETE=503 保持。去掉「等 Line B nail」的句子不是开工许可。

## 不是什么

- 不签 mw-privacy-int
- 不把 PASS/FAIL 当成 UC-052 covered
- 不授权改 `checkpoint-principal.ts` 或再写一套 unsealed NEG
- 不宣称 haStatus 不是 NOT_HA

Verdict: FAIL
