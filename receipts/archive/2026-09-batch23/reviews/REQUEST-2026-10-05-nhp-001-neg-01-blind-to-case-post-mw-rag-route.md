# REQUEST — **NHP-001-NEG-01 · UC-001 NEG blind→case** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-05T23:48:01+0800
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 mw-e2e-ha · 不 nail
**审查对象**: REQUEST `48e2a3b6f552c3382f9ed25ffad4173686011edf` · code `1761311c81e48e43d74c778b36bc86e0cebb6150` · tip named `ff74522ac4db4ad661e72265e50ad8d860a68812` · implementer receipt SHA = tip named `ff74522`（`ai-docs/delivery/receipts/2026-10-05-nhp-001-neg-01-blind-to-case-prove.md`）
**PRE duals**: mw-e2e-ha `78be465052fade0f2b278e6664317a5015d9e7ee` · ours `ad376082d0de279ae9c562d08f83a1b5962185be`（条件已逐条复核）
**origin tip（落笔）**: 见 push 后报告。
**NORTH-STAR-EXECUTION-LOOP**: 再搜仍 **未找到**。门 = `ai-docs/delivery/north-star-hard-gates.md` + harness/slice。

## 复跑（临时 worktree `/tmp/mwrr-ff74522` @ `ff74522` · `sg docker` · `env -u MODEL_API_KEY -u MODEL_BASE_URL`）

| CMD | EXIT | 断言 |
|-----|------|------|
| `pnpm uc001:nhp-neg:prove`（one-shot · 2026-10-05T23:47:08+0800 → 23:47:38+0800） | **0** | `SUMMARY asserts=26 failed=0` |

隔离 PG `meetwise-e2e-373876-*` @ 127.0.0.1:32783 · migrations applied=135 · `ISOLATED_TARGET_ATTESTATION ok`。首次即 EXIT 0（nm 经 hardlink 自 `/workspace/meetwise-lineY`，无 `pnpm install` 失败账）。

## 检查结果

1. **零产品业务逻辑改动（`48e2a3b..ff74522` / `1761311`）**：`git show --stat 1761311` = `apps/api/test/uc-e2e-001-nhp-neg.proof.ts`（新）+ `apps/api/package.json` script + root `package.json` scripts + `scripts/run-e2e-isolated.mjs` 白名单/迁移登记。**`apps/api/src/**` 与 `packages/*/src` diff 为空**。runner 仅登记 prove target，非业务逻辑。通过。
2. **离线 / Ban live**：proof L0 入口若 `MODEL_API_KEY` 存在则断言 FAIL，并 `delete` key/base URL。本审 `env -u` 复跑；L0 PASS；L1 `ai_model_invocation`/`ai_invocation_trace` 0→0。本地 API + 临时 PG only。通过。
3. **断言非假绿**：
   - **N1**：真 HTTP `POST .../begin` → exact `status === 402` + `error === 'insufficient_entitlement'`（非 `>=400`）；interview 仍 `created`、resume 绑定回滚、start job 0、ledger 逐字不变（无双扣）。锚点运行时解析 `interview.service.ts` begin=:192 · reserve=:284 · 402 catch=:286 · rr.status=:289 · enqueue=:292（满足 pre-exec C-3 `284-289`）。N1a 零额度 + N1b 耗尽 + replay 幂等。
   - **N2 五路互异**（非同请求五次）：
     1. N2a 无凭证 → 401 `unauthenticated`
     2. N2b malformed `Bearer garbage.token` → 401 `invalid_token`
     3. N2c wrong-secret 签名 Bearer → 401 `invalid_token`
     4. N2d expired Bearer（正确密钥）→ 401 `invalid_token`
     5. N2e `x-user-id` 冒充（`AUTH_DEV_HEADER` 关）→ 401 `unauthenticated`
   - 锚：`interview.controller.ts:15` · `principal.guard.ts:54`/`:68`。N2-CONTROL 同 interview 合法 Bearer → 202，证明 401 来自 guard。五拒后 interview/ledger 未变。
   - API 未就绪：依赖 isolated runner migrate + attestation；signup/begin 非 200/预期即断言失败（无 skip-to-green）。
4. **Ban wash 011/017/neg:auth**：本刀唯一新收据 `2026-10-05-nhp-001-neg-01-blind-to-case-prove.md` @ `ff74522`；`48e2a3b..ff74522` 未改那些旁证收据/行。proof 明钉不导入 `_neg-harness`。
5. **矩阵**：tip 上 `UC-E2E-001` NEG 仍 **blind / case-only**（未升 covered）；coveredCount=8；无其他 UC 行因本刀翻转；无 RAG 假关。EXIT0 = case 证据，矩阵措辞可仍 blind 直至 nail——与 harness/receipt 一致。
6. **PG-retained**：隔离 fixture 为 pgvector-legacy（R5 marked-red 保留）；产品钉 Postgres；无 MySQL runtime / MemorySaver / Qdrant 主张。

## 条件复核（pre-exec `ad37608`）

1. PASS ≠ coding ≠ nail ≠ covered ≠ HA · alone ≠ dual — 守。
2. 不代签 peer — 守。
3. N1 钉 402/`insufficient_entitlement` @ :284-289；N2 钉 PrincipalGuard 401 五路；无 active / 无双扣 / 零 trace — **本审复跑全部满足**。
4. EXIT0 仅 case；快乐路径仍可 blind — 守。

## 条件（本 post）

1. EXIT0 ≠ covered ≠ UC-E2E-001 covered ≠ suite/trio green ≠ nail ≠ HA。升格仍须 peer post-prove + 协调方 nail。
2. 不代签 mw-e2e-ha。tip 上后续 Line W 产品改动（`6853e17`）**不在**本刀 `ff74522` 复跑树内；本审钉 `ff74522`/`1761311`。

Verdict: PASS
