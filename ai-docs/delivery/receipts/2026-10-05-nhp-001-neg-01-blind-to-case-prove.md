# Receipt — **NHP-001-NEG-01 · UC-001 NEG blind→case prove**（Line Y · case ≠ covered）

**Date**: 2026-10-05（Asia/Shanghai）
**Knife**: Line Y · `harness/nhp-001-neg-01-blind-to-case.md` · slice `nhp-001-neg-01-blind-to-case.slice.md` · gap `GAP-UC001-NEG-01` · case `NHP-001-NEG-01` · row `UC-E2E-001`（NEG 列）
**授权链**: REQUEST `48e2a3b6f552c3382f9ed25ffad4173686011edf` → PRE-EXEC dual BOTH PASS：**mw-e2e-ha `78be465052fade0f2b278e6664317a5015d9e7ee`** + **mw-rag-route `ad376082d0de279ae9c562d08f83a1b5962185be`** → 协调方 meetwise 授权 coding+prove（Line Y ONLY）
**执行 worktree**: box `/workspace/meetwise-lineY` · base `origin/feat/mysql-schema-skeleton` @ `3003392eea497c403fd47a3005555b875b4d746b`（`48e2a3b`/`78be465`/`ad37608` 均为祖先）
**Code commit = prove 执行 SHA**: **`1761311c81e48e43d74c778b36bc86e0cebb6150`**（porcelain 0 行）
**Prove CMD**: `pnpm uc001:nhp-neg:prove`（root → `scripts/run-e2e-isolated.mjs uc001:nhp-neg:prove:raw` → `pnpm -C apps/api prove:uc001-nhp-neg` → `test/uc-e2e-001-nhp-neg.proof.ts`；容器 `meetwise-e2e-365428-1791215051649` @ `127.0.0.1:32781` · migrations applied=**135** · `ISOLATED_TARGET_ATTESTATION ok`）
**执行方式**: `sg docker -c "env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-neg:prove"`（box 会话未继承 docker 组 → `sg docker`；**显式剥离 MODEL_API_KEY/MODEL_BASE_URL**，prove 入口另行 fail-closed 断言 key 不存在）
**实际 EXIT**: **shell EXIT=0** · `CMD=pnpm uc001:nhp-neg:prove EXIT=0` · `SUMMARY asserts=26 failed=0`（one-shot · 2026-10-05 23:44:11 → 23:44:27 CST）
**Machine receipt（.tmp，gitignored）**: `.tmp/isolated-proof-receipts/2026-10-05T15-44-27-564Z-365428-d63e6526-7200-41dd-a6cf-38f70d764e9f.json`（target=`uc001:nhp-neg:prove:raw` · outcome=passed · exitCode=0 · releaseEvidence=false · sha256 `527b4708b18605547dbc275992eab46c5b8924bec9ccf26b3d43c4e38d042c50`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503（原值，零变动）

> **EXIT0 = case 级证据（blind→case）≠ covered。** `UC-E2E-001` 矩阵读法不变（NEG 仍记 blind/case-only，直到 post-prove dual + 协调方 nail）；本 receipt 不翻 SSOT、不改矩阵/NHP 行/checklist；≠ UC-E2E-001 covered · ≠ `e2e:isolated` suite green · ≠ trio green · 快乐路径仍可 blind。**Ban wash** neg:auth / neg:interview / neg:commerce / UC-011 / UC-017 旁证成本收据——本 prove 未导入 `_neg-harness`、走迁移后真实 schema + 低权 runtime login，独立成证。

## 1. 运行账目（全披露）

| # | 项 | 结果 | 说明 |
|---|----|------|------|
| 1 | 编码期 smoke（**未提交工作树**，同 CMD，23:43 CST） | EXIT=0（26/26） | 编码自检一次，**不属 prove**，如实披露；之后零代码改动即提交 `1761311`。 |
| 2 | **`pnpm uc001:nhp-neg:prove`（恰一次 · @`1761311`）** | **EXIT=0** | 全文 §Appendix A。无 retry、无断言放宽。 |
| 3 | `node scripts/e2e-static-guards.mjs`（编码期） | EXIT=0 | runners=6 helpers=20 flags=9 aiPaths=6 |
| 4 | `node scripts/eval-harness-matrix-cite.proof.mjs` @`1761311` | EXIT=0 | 最终 tip 另跑见交付报告 |
| 5 | `node scripts/check-staged-secrets.mjs`（提交前） | passed | 零 `.env*` / 凭据 |
| 6 | 容器清理 | 无残留 `meetwise-e2e-*` | runner 自删 |

## 2. 触碰面（`git diff --stat 3003392 1761311`，4 文件 · **零产品改动**）

| 文件 | 变更 |
|------|------|
| `apps/api/test/uc-e2e-001-nhp-neg.proof.ts` | **新增** 324 行：N1/N2 真 HTTP prove + 静态锚点 |
| `apps/api/package.json` | +1 `prove:uc001-nhp-neg` |
| `package.json` | +2 `uc001:nhp-neg:prove`（isolated 壳）/ `:raw` |
| `scripts/run-e2e-isolated.mjs` | +12/−1：target 白名单、命令映射、迁移列表、receipt sourceDigests 各登记 `uc001:nhp-neg:prove:raw`（与 `uc004:career-path-fault` 同模式） |

**零 diff**：`apps/api/src/**`（含 `interview.service.ts` begin/quiz 区段——Line W BOUND 面零触碰）· `packages/**` · migrations · SSOT（矩阵 / NHP 矩阵 / checklist / backlog）· harness/slice/REQUEST 文档 · UC-003/018/025/004/052 文件。

## 3. N1 / N2 合同 → 观察（rag C-3 / e2e-ha C-4）

拓扑：真实迁移库（135）→ `provisionRuntimeLogin` 低权登录（RLS 生效）→ in-process `createApp()` 监听回环 → 真 `/auth/signup` 取真 Bearer → `POST /interview/:id/begin`。**无 worker、无模型网关**；`AUTH_DEV_HEADER` 删除（dev x-user-id 回退关闭）。

| id | 注入 | HTTP | 观察（SQL 直查，superuser） |
|----|------|------|------|
| **N1a** | 零 entitlement principal begin | **402 `insufficient_entitlement`** | interview `created`/resume_id NULL/version 不变（绑定回滚）· start job 0 · active 0 · ledger（bucket+consumption）前后逐字相同 |
| **N1b** | 已耗尽 principal（1.0 单位经真实 begin 预留 → 第二场 begin） | setup 202 → **402 `insufficient_entitlement`** | 第二场 `created`/未绑定 · start job 0 · ledger 与耗尽态逐字相同（**无双扣、无孤儿 consumption**）· 首场 replay = 202 `alreadyBegun` 同 jobId、ledger 不变、job 恰 1 |
| **N2a** | 无凭证 | **401 `unauthenticated`** | — |
| **N2b** | `Bearer garbage.token` | **401 `invalid_token`** | — |
| **N2c** | 错密钥签名 Bearer | **401 `invalid_token`** | — |
| **N2d** | 过期 Bearer（正确密钥） | **401 `invalid_token`** | — |
| **N2e** | `x-user-id` 冒充（dev header 关） | **401 `unauthenticated`** | 5 次拒后：interview 未变 · start job 0 · ledger 不变（目标有 5.0 额度） |
| N2-CONTROL | 同一 interview + 合法 Bearer | 202 | 证明上述 401 来自 PrincipalGuard 而非其他前置 |
| L0 | 入口 MODEL_API_KEY | absent | Ban live / Ban key（存在即 FAIL） |
| L1 | `ai_model_invocation` / `ai_invocation_trace` 行数 | 0→0 | 零模型路径触达 |

### 锚点（运行时解析 · 闸门断言 · @`1761311`）

- `apps/api/src/modules/interview/interview.service.ts`：begin `:192` · `reserveEntitlement` `:284` · 402 catch `:286` · 402 `rr.status!=='reserved'` `:289` · `enqueueInterviewJob(start)` `:292`（402 在 reserve 后、入队前）
- `apps/api/src/modules/interview/interview.controller.ts`：`@UseGuards(PrincipalGuard)` `:15` · `class InterviewController` `:16` · `@Post(':id/begin')` `:22`
- `apps/api/src/platform/principal.guard.ts`：401 `invalid_token` `:54` · dev-header 闸 `:63` · 401 `unauthenticated` `:68`

## 4. 诚实边界

- EXIT0 ≠ covered · coveredCount=8 · Ban invent covered · Ban SSOT flip · Ban self-nail。
- NEG 升格仅经本 prove + **post-prove dual（mw-e2e-ha + mw-rag-route）** + 协调方 nail。
- 本 prove 未触 FAULT/BOUND/ADV；UC-003 i18n 未借刀；既有 `uc001:live-blocked:prove` ≠ 本 NEG 收据。
- fixture = pgvector-legacy 隔离 PG（R5 marked-red 提示原样保留）· PG-retained · Not HA · releaseEvidence=false。

## Appendix A — prove 全文（`/tmp` 原样，@`1761311`）

```text
HEAD=1761311c81e48e43d74c778b36bc86e0cebb6150 porcelain=0 start=2026-10-05 23:44:11 CST
SHELL_EXIT=0 end=2026-10-05 23:44:27 CST

> meetwise@0.1.0 uc001:nhp-neg:prove /workspace/meetwise-lineY
> node scripts/run-e2e-isolated.mjs uc001:nhp-neg:prove:raw

[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy (dual-track; intended sole default=mysql-qdrant-redis) E2E_PG_IMAGE=pgvector/pgvector:pg16 is a legacy pgvector isolation fixture — NOT sole-stack truth (sole stack = MySQL+Qdrant+Redis). Local green ≠ RAG migrated. releaseEvidence=false · Not HA · 本绿≠已迁 · local green ≠ HA · need multi-instance + fault-inject for releaseEvidence.
E2E_POSTGRES_READY label=boot consecutive=3 attempt=4
E2E isolated PostgreSQL: meetwise-e2e-365428-1791215051649 on 127.0.0.1:32781
E2E_ISO_STACK_NOTE isolated shell = test infrastructure only: isolated test PG ≠ product stack change ≠ cutover evidence; product stack pin = ai-docs/delivery/adr-postgres-retained.md (Postgres retained · PostgresSaver · pgvector). releaseEvidence=false · Not HA.

> @meetwise/db@0.0.0 migrate /workspace/meetwise-lineY/packages/db
> tsx src/migrate-cli.ts

migrations: applied=135 skipped=0 rag_control_manifest=not_requested qbank_control_manifest=not_requested runtime_login=not_requested qbank_control_login=not_requested privacy_worker_login=not_requested
E2E_POSTGRES_READY label=post-migrate consecutive=3 attempt=3
E2E_POSTGRES_READY label=pre-prove consecutive=3 attempt=3

> @meetwise/api@0.0.0 prove:uc001-nhp-neg /workspace/meetwise-lineY/apps/api
> node --import @swc-node/register/esm-register test/uc-e2e-001-nhp-neg.proof.ts

NHP-001-NEG-01 UC-E2E-001 NEG blind→case prove (N1 insufficient_entitlement · N2 PrincipalGuard)
Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503
NOTE: EXIT0 = case evidence ≠ covered ≠ suite green ≠ trio green · Ban live · Ban MODEL_API_KEY · neg:auth/011/017 旁证 ≠ this receipt
PASS  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)
EVIDENCE L0-ENV {"model_api_key_present_on_entry":false,"model_base_url_present_on_entry":false}
ANCHOR interview.service.ts:begin=192
ANCHOR interview.service.ts:reserveEntitlement=284
ANCHOR interview.service.ts:402(catch insufficient_entitlement)=286
ANCHOR interview.service.ts:402(rr.status!==reserved)=289
ANCHOR interview.service.ts:enqueueInterviewJob(start)=292
ANCHOR interview.controller.ts:@UseGuards(PrincipalGuard)=15
ANCHOR interview.controller.ts:class InterviewController=16
ANCHOR interview.controller.ts:@Post(:id/begin)=22
ANCHOR principal.guard.ts:401 invalid_token=54
ANCHOR principal.guard.ts:401 unauthenticated=68
ANCHOR principal.guard.ts:dev-header gate=63
PASS  ANCHOR-N1 402 insufficient_entitlement emitted inside begin, after reserveEntitlement, before start-job enqueue
PASS  ANCHOR-N2 PrincipalGuard is class-level on InterviewController (covers POST :id/begin)
PASS  ANCHOR-N2 PrincipalGuard emits 401 invalid_token / unauthenticated; dev header gated
ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified
PASS  N1a precondition: principal has zero entitlement buckets
EVIDENCE N1a {"http":{"status":402,"body":{"error":"insufficient_entitlement"}},"interview_before":{"status":"created","resume_id":null,"epoch":null,"version":"0"},"interview_after":{"status":"created","resume_id":null,"epoch":null,"version":"0"},"start_jobs":0,"active_interviews":0,"ledger_before":{"bucket":[],"consumption":[]},"ledger_after":{"bucket":[],"consumption":[]}}
PASS  N1a zero entitlement → HTTP 402 insufficient_entitlement
PASS  N1a interview not active (status stays created; resume binding rolled back)
PASS  N1a zero start job enqueued · zero active interviews for principal
PASS  N1a ledger unchanged (no bucket, no consumption row)
PASS  N1b setup: first begin consumes the only unit → 202 accepted
PASS  N1b setup: bucket fully reserved (1.00/1.00) with exactly one consumption row
EVIDENCE N1b {"setup_first_begin":{"status":202,"body":{"accepted":true,"jobId":"c4001236-f5be-46c2-8b78-9990ddcc4843"}},"http":{"status":402,"body":{"error":"insufficient_entitlement"}},"interview_before":{"status":"created","resume_id":null,"epoch":null,"version":"0"},"interview_after":{"status":"created","resume_id":null,"epoch":null,"version":"0"},"start_jobs_second":0,"ledger_exhausted":{"bucket":[{"id":"ab4d77cd-48f4-489a-9a14-769a798bfc60","kind":"paid","units_total":"1.00","units_reserved":"1.00","units_consumed":"0.00","version":1}],"consumption":[{"idempotency_key":"uc001-nhp-neg-n1b-first-366291","service_type":"mock_interview","units_requested":"1.00","status":"reserved"}]},"ledger_after":{"bucket":[{"id":"ab4d77cd-48f4-489a-9a14-769a798bfc60","kind":"paid","units_total":"1.00","units_reserved":"1.00","units_consumed":"0.00","version":1}],"consumption":[{"idempotency_key":"uc001-nhp-neg-n1b-first-366291","service_type":"mock_interview","units_requested":"1.00","status":"reserved"}]}}
PASS  N1b exhausted principal → HTTP 402 insufficient_entitlement
PASS  N1b second interview not active (status created; resume binding rolled back)
PASS  N1b zero start job for second interview
PASS  N1b ledger unchanged by the rejected begin (no double reservation, no orphan consumption)
EVIDENCE N1b-REPLAY {"http":{"status":202,"body":{"accepted":true,"jobId":"c4001236-f5be-46c2-8b78-9990ddcc4843","alreadyBegun":true}},"ledger_after_replay":{"bucket":[{"id":"ab4d77cd-48f4-489a-9a14-769a798bfc60","kind":"paid","units_total":"1.00","units_reserved":"1.00","units_consumed":"0.00","version":1}],"consumption":[{"idempotency_key":"uc001-nhp-neg-n1b-first-366291","service_type":"mock_interview","units_requested":"1.00","status":"reserved"}]},"start_jobs_first":1}
PASS  N1b replay of first begin is idempotent (alreadyBegun, same job) and ledger unchanged (no 双扣)
PASS  N1b no interview reached active (no worker; begin never activates)
PASS  N2a no credential → HTTP 401 unauthenticated
PASS  N2b malformed bearer → HTTP 401 invalid_token
PASS  N2c wrong-secret bearer → HTTP 401 invalid_token
PASS  N2d expired bearer → HTTP 401 invalid_token
PASS  N2e x-user-id spoof (dev header disabled) → HTTP 401 unauthenticated
EVIDENCE N2 {"observed":[{"id":"N2a no credential","http":{"status":401,"body":{"error":"unauthenticated"}}},{"id":"N2b malformed bearer","http":{"status":401,"body":{"error":"invalid_token"}}},{"id":"N2c wrong-secret bearer","http":{"status":401,"body":{"error":"invalid_token"}}},{"id":"N2d expired bearer","http":{"status":401,"body":{"error":"invalid_token"}}},{"id":"N2e x-user-id spoof (dev header disabled)","http":{"status":401,"body":{"error":"unauthenticated"}}}],"interview_before":{"status":"created","resume_id":null,"epoch":null,"version":"0"},"interview_after":{"status":"created","resume_id":null,"epoch":null,"version":"0"},"start_jobs":0,"ledger_before":{"bucket":[{"id":"44de5843-9ff6-4e88-a500-fc217cfba295","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","version":0}],"consumption":[]},"ledger_after":{"bucket":[{"id":"44de5843-9ff6-4e88-a500-fc217cfba295","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","version":0}],"consumption":[]}}
PASS  N2 no interview mutation after 5 rejected opens (status created, unbound, same version)
PASS  N2 zero start job · ledger unchanged (no reservation leaked by unauthenticated calls)
EVIDENCE N2-CONTROL {"http":{"status":202,"body":{"accepted":true,"jobId":"4d26a2eb-a72f-4540-85ac-0a005db31ec9"}},"start_jobs":1,"ledger_after_control":{"bucket":[{"id":"44de5843-9ff6-4e88-a500-fc217cfba295","kind":"paid","units_total":"5.00","units_reserved":"1.00","units_consumed":"0.00","version":1}],"consumption":[{"idempotency_key":"uc001-nhp-neg-n2-366291","service_type":"mock_interview","units_requested":"1.00","status":"reserved"}]}}
PASS  N2 control: valid bearer on the same interview → 202 (guard, not another precondition, produced the 401s)
EVIDENCE ZERO-MODEL-SIDE-EFFECTS {"start":{"ai_model_invocation":0,"ai_invocation_trace":0},"end":{"ai_model_invocation":0,"ai_invocation_trace":0}}
PASS  L1 zero ai_model_invocation / ai_invocation_trace rows created (no model path reached)

SUMMARY asserts=26 failed=0
CASE  NHP-001-NEG-01 N1(402 insufficient_entitlement)+N2(401 PrincipalGuard) real HTTP evidence = blind→case
NOTE  EXIT0 ≠ covered · ≠ UC-E2E-001 covered · ≠ e2e:isolated suite green · ≠ trio green · coveredCount=8 · happy path may stay blind
NOTE  releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · PG-retained · public DELETE=503 · no SSOT flip · no nail
CMD=pnpm uc001:nhp-neg:prove EXIT=0
LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/isolated-proof-receipts/2026-10-05T15-44-27-564Z-365428-d63e6526-7200-41dd-a6cf-38f70d764e9f.json release_evidence=false
```

*Receipt · NHP-001-NEG-01 · Line Y · prove EXIT=0 @1761311 · case ≠ covered · coveredCount=8 · awaiting post-prove dual (mw-e2e-ha + mw-rag-route) · Ban self-nail · STOP*
