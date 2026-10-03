# GAP-UC025-NEG-01 real wiring · post-wiring prove receipt（真接线落地后）

**Column**: NEG (UC-E2E-025 §1.0.1 first NHP column only) · case NHP-025-NEG-01
**Phase**: AFTER real wiring（刀 B'' coding 落地后 · harness `harness/gap-uc025-neg-real-wiring.md` EXIT 契约后半）
**CMD**: `pnpm uc025:nhp-neg:prove`
**EXIT**: **0**（实际值 · PROCESS_EXIT=0 · **第 1 次尝试即得，无重试、无 wash、attempts=1**）
**Code / runner SHA**: `6cbaf04` / `6cbaf04e14f405670d80a3e3e5f5a38ffd74528e`（接线代码 commit，author mw-core）
**Ran at**: that SHA（worktree HEAD after wiring commit）
**Date**: 2026-10-03

## Proof output（verbatim）

```
UC-E2E-025 NHP-025-NEG-01 stale quiz as interview input (NEG column only)
releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=503
Not FAULT · Not BOUND · Not ADV · no nail · matrix not edited
inventory acceptsQuiz=true realStaleReject=true resume_quiz_expiry_column=false
contracts_stale_token=false
PASS  NHP-025-NEG-01  interview begin throws a stale-quiz HttpException
ROW_STILL_GAP  UC-E2E-025 §1.0.1 NEG was not flipped. The row is still gap.
NOTE  case pass ≠ covered ≠ nail ≠ FAULT/BOUND/ADV

CMD=pnpm uc025:nhp-neg:prove EXIT=0
```

## Honesty notes（post-prove 双审请核查）

- **Proof 未改**: `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` 一字未动（git 无该文件 diff）。EXIT 0 由真实产品代码命中既有正则：门1 经 service `begin(principal: string, id: string, resumeId: string, requestId?: string, sourceQuizId?: string)` 签名（rag C-1 可靠路径，controller 首匹配截断陷阱已规避）；门2 经 `interview.service.ts` begin 体 stale_quiz throw（位于 `begin(principal` 起 4500 字符 region 内偏移 2173）。
- **`resume_quiz_expiry_column=false` 是诚实读数**: proof 的该旁证读的是 `migrations/0007_resume_quiz.sql`（按禁令原地重写 0007 被禁，故保持 false）。锚点列走新增非破坏迁移 `0135_resume_quiz_freshness_anchor.sql`（ADD COLUMN IF NOT EXISTS，无 DROP）+ `sql/20_resume_quiz.sql` 重放镜像同列（DROP+CASCADE 型，新库与已迁移库都得到锚点）。该字段不在 EXIT 0 判定门内（门= acceptsQuiz && realReject）。
- **`contracts_stale_token=false` 同为诚实读数**: 未动 `packages/contracts`（proof 非门项，避免 widen）。
- **token/status 收敛唯一（rag C-3）**: 实际抛出 `throw new HttpException({ error: 'stale_quiz' }, HttpStatus.CONFLICT)` = `stale_quiz` + **409 CONFLICT**。
- **顺序（rag C-4）**: stale 拒绝位于 `apps/api/src/modules/interview/interview.service.ts` begin 事务体内、`interview_not_active` 守卫之后、resume 绑定块之前 —— **先于** `reserveEntitlement`（扣额度）与 `enqueueInterviewJob`（入队）。无局部 catch 吞该 throw（begin 体内唯一 catch 只映射 `insufficient_entitlement` 且原样重抛，位于 stale 检查之后）。
- **owner-scoped 真消费（C-4）**: `SELECT status, expires_at FROM resume_quiz WHERE id=$1 AND owner_user_id=$2`，且处于 `db.asPrincipal(principal, ...)` RLS 事务内；工件行被读取（status + expires_at 真比较），非占位。
- **锚点写入**: `apps/worker/src/quiz-lifecycle.ts` ready CAS 同事务写 `expires_at = now()+QUIZ_FRESH_TTL_MS(7d)`；NULL（0135 前旧工件/无锚点）不判过期（e2e-ha C-1：已迁移库不假拒）。
- **C-6**: begin 不带 quiz 工件 → service `if (sourceQuizId)` 整块跳过，行为与接线前一致。

## Not a close

EXIT 0 = case pass ≠ covered ≠ nail ≠ FAULT/BOUND/ADV。**不关 GAP-UC025-NEG-01**（其 OPEN→关闭由本刀自身 post-prove dual 决定）· **不升 UC-E2E-025 行**（保持 gap，矩阵/SSOT 本刀零触碰）· coveredCount=8 不动。FAULT / BOUND / ADV 未跑。既单独 pin `pnpm uc025:stale-quiz-expiry:prove` EXIT 0 与本案无关。

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503

STOP · 下一步 = post-prove 双审（mw-rag-route + mw-e2e-ha）· 实现方不自批。
