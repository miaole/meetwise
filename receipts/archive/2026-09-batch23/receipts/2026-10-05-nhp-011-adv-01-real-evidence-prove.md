# Receipt — **NHP-011-ADV-01 · UC-011 ADV case-only → real evidence prove**（Line V · **EXIT=1 honest GAP** · NAIL **`post_prove_dual_pass`** · ≠ covered）

**Date**: 2026-10-05（Asia/Shanghai · UTC+8）
**Knife**: Line V · `harness/nhp-011-adv-01-real-evidence.md` · slice `nhp-011-adv-01-real-evidence.slice.md` · gap `GAP-UC011-ADV-01` · case `NHP-011-ADV-01` · row `UC-E2E-011` ADV 列
**授权链**: REQUEST `bb9af74b8398a2a8e4bba15f34699775529295c6` → PRE-EXEC dual BOTH PASS：**mw-model-op `587b9e0`** + **mw-e2e-ha `5716b47`** → 协调方 meetwise 授权 coding+prove（Line V ONLY · Ban self-nail）
**执行 worktree**: box `/workspace/meetwise-lineV` · base `origin/feat/mysql-schema-skeleton` @ tip at code commit time
**Code commit = prove 执行 SHA**: **`3d113c872455375d81d84de48b7d806eb42b2dd4`**（porcelain 0 行 · one-shot）
**Prove CMD**: `pnpm uc011:adv:prove`（root → `scripts/run-e2e-isolated.mjs uc011:adv:prove:raw` → `pnpm -C apps/api prove:uc011-adv-refund-callback` → `test/uc-e2e-011-adv-refund-callback.proof.ts`；容器 `meetwise-e2e-404524-1791215864642` @ `127.0.0.1:32786` · `_neg-harness` 自建 schema · **未**走 migrateWithRecovery）
**执行方式**: `sg docker -c "env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc011:adv:prove"`（显式剥离 MODEL_API_KEY/MODEL_BASE_URL · Ban live）
**实际 EXIT**: **shell EXIT=1** · `CMD=pnpm uc011:adv:prove EXIT=1` · `断言合计: 18 条, 失败 6 条`（INV 5/5 PASS · A1 3 FAIL + 4 PASS · A2 3 FAIL + 3 PASS）· one-shot · 2026-10-05 23:57:44 → 23:57:56 CST
**Machine receipt（.tmp，gitignored）**: `.tmp/isolated-proof-receipts/2026-10-05T15-57-56-213Z-404524-64475743-9145-4f12-b5e3-05ce91609449.json`（target=`uc011:adv:prove:raw` · outcome=**failed** · exitCode=**1** · releaseEvidence=false）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503（原值，零变动）

> **EXIT1 = 诚实保留 GAP（产品口缺失 = 执行面 UNREACHABLE）。** Ban wash 404=pass。EXIT0 仅当 A1+A2 非-404 真证据成立——今日三口皆 404，故不得 EXIT0。`UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · coveredCount=**8** · 本 receipt **不翻 SSOT**、不改矩阵/NHP/checklist。**Ban invent covered** · Ban 互借关 `GAP-UC011-REFUND-CALLBACK` · Ban self-nail。

## 1. 运行账目（全披露）

| # | 项 | 结果 | 说明 |
|---|----|------|------|
| 1 | infra preamble（deps 未装 · 同 CMD · pre-rebase SHA） | EXIT=1 `isolated_postgres_database_not_ready:boot` | **非 ADV 断言**；随后 `pnpm install --frozen-lockfile`，零代码改动。 |
| 2 | coding-era run（pre-rebase content · 口 404） | EXIT=1 · 18/6 | 编码自检；**不属 tip prove**；如实披露。 |
| 3 | **`pnpm uc011:adv:prove`（恰一次 · @ tip CODE_SHA `3d113c8` · rebase 后）** | **EXIT=1** | ADV 真断言：三口 404 → A1/A2 FAIL + 双 GAP。无 retry、无断言放宽、无洗绿。 |
| 4 | `node scripts/check-staged-secrets.mjs`（提交前） | passed | 零 `.env*` / 凭据 |
| 5 | 容器清理 | 无残留 `meetwise-e2e-*` | runner 自删 |

## 2. 触碰面（code commit `3d113c8` · **零产品改动**）

| 文件 | 变更 |
|------|------|
| `apps/api/test/uc-e2e-011-adv-refund-callback.proof.ts` | **新增**：A1/A2 ADV prove + INV 静态库存 + 404→EXIT1 契约 |
| `apps/api/package.json` | +1 `prove:uc011-adv-refund-callback` |
| `package.json` | +2 `uc011:adv:prove` / `:raw`（isolated 壳） |
| `scripts/run-e2e-isolated.mjs` | + receipt sources + allowlist + dispatch（`uc011:adv:prove:raw`）；**未**入 migrateWithRecovery（`_neg-harness` 自建 schema，同 uc014/uc011-http 先例） |

**零 diff**：`apps/api/src/**` · `packages/db/src/payment.ts` · migrations · SSOT（矩阵 / NHP / checklist / backlog）· Line Y/W/X 业务文件。共享触及：root `package.json` + `scripts/run-e2e-isolated.mjs` 脚本注册行（disclose；未改 Y/W/X 既有 target 行为）。

## 3. A1 / A2 合同 → 观察（口缺失主闸）

| id | 注入 | HTTP | 裁决 |
|----|------|------|------|
| **SURFACE** | POST `/payment/refund-callback` · `/commerce/webhook/refund/:id` · `/commerce/orders/:id/refund-callback` | **404** ×3 | `allUnreachable=true` |
| **A1** | 错签 / 垃圾短签 / webhook 等价错签 | **404** ×3 | **FAIL**（Ban wash 404=pass；非-404 可解释拒未取得） |
| **A1 副作用** | DB before/after | paid/created/bucket/consumption **不变** | PASS（零误改；仍 ≠ 验签真证据） |
| **A2** | 同幂等键顺序两次 | **404** / **404** | **FAIL**（首腿不可达；Ban 把双 404 记成 already/no-op） |
| **A2 副作用** | DB before/after | 无双退改写 | PASS（口缺失路径零误改；仍 ≠ 重放真证据） |
| **INV** | 静态：payment/webhook/controller/service | 无 refund* API | PASS ×5 |

### GAP 明细（prove 正文原样）

- **`GAP-UC011-ADV-01`**：A1/A2 执行面 UNREACHABLE；错签/重放无非-404 真证据；EXIT=1 诚实保留；ADV stays gap/case-only。
- **`GAP-UC011-REFUND-CALLBACK`**：`POST /payment/refund-callback` + `markOrderRefunded` / webhook refund 产品口未落（与 H4/H5 一致）。**Ban 本刀互借关闭**。

### C-1（model-op）披露

具名 HTTP status / error body（及 HMAC/幂等字段）**未预填**——产品口今日缺失，Ban 发明码。口落地属独立刀 `GAP-UC011-REFUND-CALLBACK`；落地后再钉 UC014 级具体性，方可授权可执行绿 prove。

## 4. Non-claims / Pins

Not covered · not ADV partial · not refund-callback 产品口 · not HA · not `releaseEvidence=true` · not nail · EXIT0 ≠ covered · H4/H5 404 ≠ ADV evidence · Ban self-nail · Ban live · Ban Meridian · Ban force-push · Ban secrets

Pins retained: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503

## 5. ASK（historical · retained）

请协调方开启 **post-prove dual**（`mw-e2e-ha` + `mw-model-op`）。本实现方 **Ban self-nail**。→ 已由协调方开启并 BOTH PASS；nail 经协调方授权（见 §6）。

## 6. Line V NAIL（`post_prove_dual_pass` · 2026-10-06 · additive）

- POST dual BOTH PASS: mw-e2e-ha `ca5c7ea` (`ca5c7eaa895528c9853f151c4790dc9905c027d0`) + mw-model-op `0421e5a` (`0421e5af984d33c95bed3c7467dbebba0692b2c8`)（alone≠dual · 均审红的诚实性 · **PASS ≠ covered ≠ HA**）.
- Lifecycle advanced to **`post_prove_dual_pass`** by Line V nail（cross-ref harness/slice/SSOT）· 本节**不改** §1–§4 任一运行事实。
- **Honesty of red**: PROVE `pnpm uc011:adv:prove` **EXIT 1**（断言 18 / 失败 6 · INV 5/5）· 三口 **404** · A1 错签 / A2 重放 **UNREACHABLE** · **Ban wash 404=pass**（404 ≠ 拒签证据 ≠ 重放幂等证据 ≠ ADV partial）· A1/A2 DB 副作用零误改 ≠ 验签/重放真证据.
- **STILL_OPEN**: **`GAP-UC011-ADV-01`** + **`GAP-UC011-REFUND-CALLBACK`** stay **OPEN** · 产品口（`POST /payment/refund-callback` · `/commerce/webhook/refund/:id` · `/commerce/orders/:id/refund-callback`）= **other knife** · UC-E2E-011 row stays **partial** · ADV column stays **gap** / `case-only` · EXIT0≠covered · coveredCount=**8** · C-1 具名 status/error（HMAC/幂等字段）**deferred until mouths land** · Ban 互借关闭.
- **CITE_EXIT**: **0**（`pnpm eval-harness-matrix-cite:prove` 静态引用核 · @ evidence tip `79825b2` EXIT 0 · @ parent `ca5c7ea` EXIT 0 · @ nail 内容 EXIT 0 · cite 只核 UC-E2E-011 stays **partial** · **不**要求 ADV green · cite 绿 ≠ prove 绿 · **PROVE_EXIT 仍 1** · Ban wash prove）.
- Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.

---

*Receipt · NHP-011-ADV-01 · Line V · EXIT=1 honest GAP · post dual ca5c7ea+0421e5a PASS · lifecycle post_prove_dual_pass · two GAPs OPEN · UC-011 partial · coveredCount=8 · STOP*
