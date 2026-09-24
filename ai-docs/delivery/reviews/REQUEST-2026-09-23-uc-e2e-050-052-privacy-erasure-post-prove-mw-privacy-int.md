# POST-PROVE 独立审查 · UC-E2E-052 内部授权擦除（Line B · 第一刀）

| 字段 | 值 |
|------|-----|
| 角色 | `mw-privacy-int` |
| 时刻 | 2026-09-23 20:43 PDT |
| 前置 PRE-EXEC r3 | `f51dcd4`（仅文档 PASS） |
| Step0 SHA | `4643c02` |
| Prove SHA | `6d6e11b` |
| 收据 SHA（mw-core） | `b0db484` |
| 审查工作树 | `/workspace/wt-pi-step0` · `/workspace/wt-pi-prove`（detached；未改共享 worktree / Line A / stash） |
| Pins | `haStatus=NOT_HA` · `releaseEvidence=false` · 公开 DELETE=503 · 外部=`retention_pending` · Ban covered / Ban HA / Ban 关控制面 |

**原则**：只采信本角色亲自跑的命令 EXIT 与亲自读的源码；不采信 mw-core 口头声明。

---

## 1. Step0 与祖先

| 检查 | 结果 |
|------|------|
| `git show --stat 4643c02` | 仅 `packages/db/test/privacy-authorization.proof.ts` **+5/−0**（fixture-only） |
| `git diff f0f52bd^..f0f52bd` vs `4643c02^..4643c02` | **逐字节相同** |
| `4643c02` ∈ ancestors(`6d6e11b`) | **YES** |
| 代码序 | `4643c02` → `3a60a82` → `285497a` → `da4f0be` → **`6d6e11b`**（prove）→ `b0db484`（收据） |

---

## 2. CMD \| SHA \| EXIT（本机）

| CMD | SHA | EXIT | 备注 |
|-----|-----|------|------|
| `pnpm privacy-authorization:prove` | `4643c02` | **0** | Step0 硬门；含租约未过期不可抢 / 过期可接管 |
| `pnpm uc052:internal-erasure:prove` | `6d6e11b` | **0** | 11/11 PASS · **零 skip** |
| `pnpm privacy-erasure:http:prove` | `6d6e11b` | **0** | 19 pass · 公开 DELETE 仍 503 |
| `pnpm privacy-authorization:prove` | `6d6e11b` | **0** | tip 回归 |
| `pnpm privacy-erasure-preview:prove` | `6d6e11b` | **0** | 抽检共享 runner 未伤及其他 prove |
| `pnpm --filter @meetwise/db exec tsc --noEmit` | `4643c02` | **2** | 6 条既有错误 |
| `pnpm --filter @meetwise/db exec tsc --noEmit` | `6d6e11b` | **2** | 6 既有 + **本刀新增 25**（皆在 proof） |

### `uc052:internal-erasure:prove` case 观测

| id | 结果 | 本机观测 |
|----|------|----------|
| NHP-050-FAULT-01 | PASS | req=`pending_external` · report failed→retry erased · event/graph=0 |
| NHP-050-FAULT-02 | PASS | replayed=true |
| NHP-050-FAULT-03 | PASS | late revive 拒 · event=0 |
| NHP-050-FAULT-04 | PASS | claimRejected · **req=`purging`** |
| NHP-050-FAULT-05 | PASS | event 仍 0 · req=`pending_external` |
| NHP-050-NEG-02 | PASS | forged JWS null · 无 snapshot claim 拒 |
| NHP-050-NEG-03 | PASS | cross-tenant claim 拒 · bEvents=2 |
| NHP-050-BOUND-01 | PASS | winners=1 · eventTargets=1 |
| NHP-050-NEG-01 | PASS | httpStatus=503 · app_role EXECUTE=false |
| HP-050-01 | PASS | locals erased · externals retention_pending · req=`pending_external` |
| C-CASECOUNT | PASS | REQUIRED 全在 |

---

## 3. C1–C6

### C1 无新 HTTP 路由 / 无 app_role 新 GRANT — **PASS**
- `git diff --name-only 4643c02 6d6e11b` 仅：`package.json`、`packages/db/package.json`、`packages/db/src/index.ts`、`packages/db/src/uc052-internal-erasure.ts`、`packages/db/test/uc052-internal-erasure.proof.ts`、`scripts/run-e2e-isolated.mjs`。**无 apps/**、**无 migrations/**。
- NEG-01：`has_function_privilege('app_role','privacy_begin_checkpoint_erasure(text,text)','EXECUTE')===false`（proof ~L411–417）；公开 `eraseInterviewData` → 503（`apps/api/src/modules/privacy/privacy.service.ts` ~L53–56）。
- 0096 L227：`REVOKE EXECUTE … FROM app_role`（既有；本刀未改迁移）。

### C2 JWS 验签在 consume/claim 前 — **PASS**
- `packages/db/src/uc052-internal-erasure.ts` **L195–205**：`verifyPrivacyAuthorizationSnapshot` → 失败抛错 → 其后才 `consumeAuthorizationSnapshotBound`；claim/purge 更晚。

### C3 admin 真 SQL 逐 sink read=0 — **PASS**（本地物理 sink）
- proof **L119–137**：admin `SELECT count(*)` → `interview_event` / `ai_graph_run` / report 六表聚合。
- HP-050-01 **L437–439** 断言 =0。
- 命名：`event` · `ai_graph_run` · `report`（物理）· `checkpoint_rows`（仅 fence）· `oss`/`redis`/`langfuse`（`retention_pending`，Ban 伪 count-as-erased）。

### C4 fence-revive + epoch-drift — **PASS**
- FAULT-03：purge 后写入必须 reject 且 event=0。
- FAULT-04 **L275–277**：claimRejected ∧ `status!=='completed'` ∧ `status!=='partial_failed'`；本机 **`req=purging`**。

### C5 NEG-03 跨租户在 DB/claim — **PASS**
- proof **L352–356**：`otherOwner` claim 必须 reject；B 面试 event 仍 2。
- 0091 **L344–361**：`snap.owner_user_id` / `request_owner` / `app.principal_user` 不一致 → `privacy_authorization_owner_mismatch`（DB 层）。

### C6 有界租约 — **PASS**（组合）
- 0091 **L396–400**：未过期 leased → RETURN；`pending|leased|failed` 可重申领（过期可接管）。
- BOUND-01：并发 claim → winners=1。
- Step0 + tip `privacy-authorization:prove` EXIT=0 覆盖过期接管。

### 规范目标集 / 0096 CASE — **PASS**
- begin：`event`+`ai_graph_run`+`report`+`checkpoint_rows`；attach：`oss`+`redis`+`langfuse`；digest=`canonicalTargetSetDigest` / SQL `string_agg ORDER BY` 全量无裁剪（src L28–33 · L64–97 · L168–185）。
- 0096 **L576–583**：`pending|leased`→`purging` → retention/external_pending→`pending_external` → failed→`partial_failed` → else `completed`。Happy 因外部仍 retention_pending → **`pending_external`**。

---

## 4. 四项披露裁定

### (1) FAULT-04：`purging` vs harness `pending_external` — **不阻断**
- 0096 **L578 先**判 pending/leased → `purging`；**L580** 才是 retention_pending → `pending_external`。
- FAULT-04 未 purge 本地，target 仍 pending → **`purging` 正确**；harness L209「stays pending_external」**文案错**（L161 已正确记录 CASE 序）。
- 证明未显式 `=== 'purging'`，但 evidence/`req=` 日志诚实。
- **须改 harness**；**不阻断本刀**。

### (2) tsc 新旧差分 — **阻断（审查默认）**
- `4643c02`：6 条既有（domain / 他 proof）——不阻断。
- `6d6e11b`：**+25** 全新，全在 `packages/db/test/uc052-internal-erasure.proof.ts`（`Pool`≠`PoolClient`；对已收窄字面量的 TS2367）。
- CI（`.github/workflows`）**未**跑 `@meetwise/db` 的 `tsc --noEmit` → 按「CI 已检代码」字面不自动 FAIL。
- **审查默认「本刀新错误阻断」** → **合钉前必须修类型**。

### (3) checkpoint_rows 仅 fence — **诚实 · 不阻断**
- 代码注释、proof `perSinkSql`、prove.md、evidence 均标 **fence-only / 本刀无物理 checkpoint purge**；未标物理 erased、未洗 covered。

### (4) `3a60a82` 改共享 runner — **不阻断**
- 仅注册 `uc052:internal-erasure:prove:raw`（源 digest 列表 + allowlist + 命令分派 + migrate 列表）；+18/−1。
- 抽检 `privacy-erasure-preview:prove` EXIT=0。未见改变其他 prove 行为。

---

## 5. 收据诚实性（`b0db484`）

| 项 | 结果 |
|----|------|
| `releaseEvidence=false` | ✓ |
| `haStatus=NOT_HA` · `claimProductionHA=false` | ✓ |
| 无「本 UC covered」 | ✓ prove.md Ban covered；`pins.coveredCount=8` 为矩阵既有 pin，非本刀洗白 |
| 外部 `retention_pending` | ✓ |
| FAULT-04 记 `purging` | ✓ 与本机一致 |
| 公开 DELETE 503 | ✓ |

---

## 6. VERDICT: **CONDITIONAL**

### 阻断项
1. 本刀新增 **25** 条 tsc 错误于 `packages/db/test/uc052-internal-erasure.proof.ts`。合钉前修复（admin 使用 `PoolClient` 或放宽类型；去掉无意义字面量比较），并复跑 `pnpm --filter @meetwise/db exec tsc --noEmit` 确认无新增。

### 非阻断备注
1. Harness L209 FAULT-04 应改为 **`purging`**（或「本地仍 pending 时为 purging」）；建议 proof 显式 `status==='purging'`。
2. BOUND-01 仅并发单赢家；过期接管由 authz prove 覆盖（Step0+tip 均 EXIT=0）。
3. `checkpoint_rows` fence-only 缺口已诚实标注。
4. Pins 全部守住：NOT_HA · releaseEvidence=false · DELETE=503 · externals retention_pending · 无新路由 · 无 app_role 重 GRANT。

---

*mw-privacy-int · POST-PROVE · 独立复跑 · 不采信 mw-core 口头声明*

---

## r2 · 复审（阻断项 B1 修复后）· 2026-09-23 20:50 PDT

| 字段 | 值 |
|------|----|
| 角色 | `mw-privacy-int` |
| 相对 | r1=`71c6305` **CONDITIONAL**（唯一阻断 B1：uc052 proof 新增 25 条 tsc） |
| 修复提交 | `9e55109`（harness 补丁 + src 类型放宽 + proof 收紧）· prove tip **`3c4847a`**（proof only） |
| mw-core 收据 | `6a4140d` |
| 工作树 | `/workspace/wt-pi-r2-prove`@`3c4847a` · `/workspace/wt-pi-r2-step0`@`4643c02`（detached） |

### CMD \| SHA \| EXIT（本机复跑）

| CMD | SHA | EXIT | 备注 |
|-----|-----|------|------|
| `pnpm uc052:internal-erasure:prove` | `3c4847a` | **0** | 11/11 PASS · **零 skip** · FAULT-04 `req=purging` |
| `pnpm privacy-authorization:prove` | `3c4847a` | **0** | tip 回归 |
| `pnpm privacy-erasure:http:prove` | `3c4847a` | **0** | 19 pass · **DELETE 仍 503** |
| `pnpm --filter @meetwise/db exec tsc --noEmit` | `4643c02` | **2** | 6 条既有 |
| `pnpm --filter @meetwise/db exec tsc --noEmit` | `3c4847a` | **2** | **同 6 条 · 无新增 · uc052 文件 0 错** |
| `tsc -p packages/db --noEmit` | `4643c02` / `3c4847a` | **2** / **2** | 两边错误集归一化后 **全等** |

### case 观测（`uc052:internal-erasure:prove` @`3c4847a`）

全部 PASS、无 skip：FAULT-01…05 · NEG-02/03/01 · BOUND-01 · HP-050-01 · C-CASECOUNT。  
FAULT-04 日志：`claimRejected=true req=purging localsPending=true ckpt=erased externalsRp=true`。

### tsc 差分

- Step0 与 tip：**各 6 条、集合相同**（domain×3 + privacy-erasure-preview.proof + qbank-handoff×2）。
- **uc052 src/proof：0 条错误**。
- **相对 Step0：0 条新增** → r1 阻断 B1 **已解除**。

### src 是否 type-only（`git diff 6d6e11b 3c4847a -- packages/db/src/`）

**是。** 仅：`import type { Client, DbPool }`、`type Sql = DbPool \| Client`、若干参数注解 `Client`→`Sql`/`DbPool`。无运行时分支/SQL/控制流变更。

### proof / harness 收紧（实读）

- FAULT-04：**显式** `status === 'purging'`，并断言 locals=`pending`、checkpoint=`erased`、externals=`retention_pending`。
- porcelain dirty worktree → EXIT 1。
- FAULT-02：同 requestId + 同 target id 集；FAULT-05：首单 ledger/receipts 稳定、无重复有效擦除。
- Harness：**append-only** 补丁（`9e55109` +13 行）声明 FAULT-04 权威终态为 `purging`（0096 CASE ① 优先于 retention→pending_external）；**未改写** §4 L209 原文，**未削弱**其他断言。

### Pins / 范围

| Pin | 结果 |
|-----|------|
| `releaseEvidence=false` | ✓（本机 JSON + `6a4140d` fixround evidence） |
| `haStatus=NOT_HA` · `claimProductionHA=false` | ✓ |
| 无「本 UC covered」宣称 | ✓（`coveredCount=8` 仍为矩阵既有 pin） |
| 外部 `retention_pending` | ✓ |
| 公开 DELETE=503 | ✓（NEG-01 + http prove） |
| 修复区间无新路由 / 无 GRANT / 无 migration | ✓（仅 harness 追加、db src 类型、db proof） |

### VERDICT r2: **PASS**

B1 已清除；prove 全绿；tsc 与 Step0 对齐且 uc052 零错；src 为类型-only；pins 守住。  
非阻断备注：harness L209 历史行仍保留旧文案，以 addendum 为权威——可接受。

*mw-privacy-int · POST-PROVE r2 · 独立复跑 · 不采信 mw-core 口头声明*
