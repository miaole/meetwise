# mw-e2e-ha · RE-PRE-EXEC r4 · UC-052 unsealed NEG @`2a66c22`

**Role**: mw-e2e-ha（adversarial E2E evidence-honesty · docs gate only）
**Date**: 2026-10-02 (PT)
**Reviewed tip**: `2a66c22` / `2a66c2283cb95b9154bc028d7c9ae650adc44a89` — `docs(privacy): align UC052 closure cites`
**Parent**: `310917a1339124796d9b6a4b21ff709356260105`（非 `542c064`；相对 `542c064` 仅这两份 harness 有实质清理 diff）
**Prior FAIL（untouched）**: `b52cd32` · `ai-docs/delivery/reviews/REQUEST-2026-10-02-uc052-unsealed-claim-neg-repre-542c064-mw-e2e-ha.md`
**Scope**: Line F RE-PRE-EXEC round 4 · docs-only · no prove · no Postgres · no product edit · 不代签 mw-privacy-int · alone ≠ dual
**Origin at review**: `2a66c22` 是 `origin/feat/mysql-schema-skeleton` 祖先（尖端当时更前）。

## 1. `2a66c22` 自身 — docs-only：**是**

`git show --stat 2a66c22`：2 files, 5 insertions, 7 deletions。只改：

- `ai-docs/delivery/harness/uc-e2e-052-checkpoint-physical.md`
- `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md`

无产品、无 `apps/worker/src/checkpoint-principal.ts`、无 proof 断言变更、无 migration。`git show --name-only` 无 `.ts`。principal 不在 diff → spot-check 通过。

## 2. 三阻塞处置（相对 FAIL `b52cd32`）

### 阻塞 1 · prove SHA 张冠李戴 — **cleared**

- checkpoint L172 / pool L20 新文：`pnpm uc052:pool-role-leak:prove` EXIT=0 at prove/code SHA **`ab96a02`** (`ab96a0299d8836a635077f8bf9b61a7891aa583f`); nail **`119d6c0`** is the docs-only nail; **`9b39a20`** is range-diff-equal to **`ab96a02`** but is not on origin
- 不再把 `119d6c0` 写成 prove `gitSha=`。`ab96a02` 在 origin 祖先；`9b39a20` 仍不可达。诚实选项满足。

### 阻塞 2 · pool 泄漏行号 / NEG 自相矛盾 — **still open**

- L35「no claim-before-seal NEG」已删 → NEG-不存在谎言 cleared。
- L21 NOTE CLOSED 仍正确引用 proof L750 / L763 / L768 / L773 / L778–L804。
- **但** pool L32 仍写 Leak site = `apps/worker/src/checkpoint-principal.ts` **L51–54**。当前树 L51–54 是 `__setCheckpointPrincipalCleanupOverrideForTest` 的 E2E_ISOLATED 门禁尾部（测试 override），不是泄漏点；产品清理在 **L79–L103**（`SET ROLE NONE` + 三 GUC clear + destroy-on-reset，`71ec253`）。Notes 虽改成「Mitigated product path: SET ROLE NONE…」，行号仍 stale。协调栏：「Stale line numbers … is FAIL」。

### 阻塞 3 · §4 principal / 第二实现 allowlist — **cleared**

- pool §4（L67–L71）已撤掉 `apps/worker/src/checkpoint-principal.ts` 与 `packages/db/test/uc052-checkpoint-physical.proof.ts`（UNSEALED NEG only）。
- 余下仅 `apps/worker/test/*` / `packages/db/test/*`、`package.json` / `scripts/run-e2e-isolated.mjs`。
- REQUEST ban 仍明确：`note-ckpt-unsealed-claim-neg.md` L27 `Keep apps/worker/src/checkpoint-principal.ts unchanged.`；slice L23 `Do not edit apps/worker/src/checkpoint-principal.ts.`；L7 no second implementation。

## 3. 其他确认

| Check | Result |
|---|---|
| Open follow-ups 唯一 OPEN | checkpoint L172：仅 **`GAP-PRIV-AUTHZ-PROVE-FLAKE`** — **OPEN**, mitigated/cause-unknown (not fixed)。pool L22 同标 OPEN。未用散文假装 flake 已修。 |
| coveredCount | **8**（checkpoint L173 · pool L9/L20/L84） |
| UC-052 | **partial** · **≠ covered** |
| HA | haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** |
| gR45Closed | **true** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503** |
| retention_pending | REQUEST harness L26 / slice L22 仍 pin |
| bare rejects() | 未把裸 rejects 当 pass；仍引用 sqlState 42501 L750 |

Spot-check 残留（非本轮三阻塞主名，但记下）：pool L46 `NHP-UNSEALED-NEG-01` 仍以待证期望形式留在 §2 NHP 表；与 L21 CLOSED 并存，但本 FAIL 主因是 L32 stale 行号。

## Conditions

1. docs-only tip · principal 未进 diff。
2. 阻塞 1、3 已清；阻塞 2 因 L32 仍点 L51–54（测试 override）而未清。
3. flake 仍 OPEN · 未无新 prove 而关闭。
4. alone ≠ dual · 本 FAIL ≠ covered ≠ nail ≠ HA ≠ 编码授权 · 不代签 mw-privacy-int。
5. PASS/FAIL 均非 coding authorization。

## 不是什么

- 不签 mw-privacy-int
- 不把本收据当 UC-052 covered / nail / HA
- 不授权改 `checkpoint-principal.ts` 或再写一套 unsealed NEG
- 不编辑旧收据 `…-542c064-mw-e2e-ha.md` / `…-repre-mw-e2e-ha.md`

## Blockers

1. pool harness L32 仍把 Leak site 标成 `checkpoint-principal.ts` **L51–54**；当前代码该处是测试 override，产品清理在 L79–L103。行号未对齐当前树 → 阻塞 2 仍开。

其余：「无」已清项不再列为阻塞。条件见上。

Verdict: FAIL
