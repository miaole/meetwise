# POST-PROVE · Line AG · NHP-001-ADV-01 · UC-001 ADV blind→case · mw-e2e-ha

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Review date**: 2026-10-06 ~19:25 CST（Asia/Shanghai · UTC+8）
**Line**: **AG** · `NHP-001-ADV-01` · row `UC-E2E-001` ADV 列
**PROVE_TIP**: `7eb1c88`（`7eb1c88ee63aea2fb45a51bf708c0801fc03d22c`）· 作者 meetwise-core · 2026-10-06 14:40:35 +08:00 · ancestor of `origin/feat/mysql-schema-skeleton` ✔
**REQUEST**: `51af3b2`（`51af3b273bf51945808c7bb31843b53dfcce44fc`）
**PRE dual**: mw-e2e-ha re-PRE3 PASS `6a35c47` · mw-rag-route Re-PRE3 PASS `7706bf7`
**Peer**: mw-rag-route POST PASS `2bf22c5` — **独立核实，不代签 / 不共签**
**Receipts**: `ai-docs/delivery/receipts/2026-10-06-nhp-001-adv-01-prove.md` · `…-b5-env-capable.md`
**Independent re-run**: detached worktree `/workspace/meetwise-lineAG-prove` @ `7eb1c88` · `./scripts/with-docker-session.sh` + `env -u MODEL_API_KEY -u MODEL_BASE_URL` · Ban Meridian · Ban `.env*` read · Ban git config · Ban force-push · Ban product-code change · Ban nail · Ban invent covered · Ban wash Y/AB · Ban HA · Ban buy cloud · Ban retry-to-green

本 PASS = UC-001 ADV structural `/turn` 真证据独立复核半签。**≠** covered · **≠** nail · **≠** HA · alone ≠ dual · EXIT0 ≠ covered · env-blocked ≠ PASS。

---

## 1. Tip 范围（独立 `git show --stat 7eb1c88`）

| Claim | Verified |
|-------|----------|
| 8 files · prove-only | **hit** · `apps/api/test/uc-e2e-001-nhp-adv.proof.ts`(+552) · `apps/api/package.json`(+1) · root `package.json`(+2) · `scripts/run-e2e-isolated.mjs`(+17/−1 增量) · harness/slice · 2 receipts |
| Zero `apps/api/src` / packages product / worker / web | **hit** · `git diff --stat 51af3b2 7eb1c88 -- apps/api/src packages/db packages/domain apps/worker apps/web` = empty |
| neg/bound proof 零改动 | **hit** · `git diff --quiet 51af3b2 7eb1c88 -- apps/api/test/uc-e2e-001-nhp-{neg,bound}.proof.ts` |
| Ban wash Y/AB / 018/052/025 / FUNNEL / G-R4-5 / SSOT | **held** · tip 未触矩阵 covered 翻转；ADV 仍 blind/case-only |

## 2. CMD \| EXIT \| times（独立复跑 · Ban live）

Shell 环境 `MODEL_API_KEY` **present**（presence-only · 未打印值）· `MODEL_BASE_URL` absent；所有 prove 经 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 去除。L0 一律 PASS。无 live 模型 · 无云开销。

| # | CMD | start→end (+08:00) | EXIT | SUMMARY |
|---|-----|--------------------|------|---------|
| R1 ADV | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-adv:prove` | 19:23:25→19:23:38 | **0** | `asserts=63 failed=0` |
| R2 NEG（B5） | 同 wrapper · `pnpm uc001:nhp-neg:prove` | 19:23:42→19:23:54 | **0** | `asserts=26 failed=0` |
| R3 BOUND（B5） | 同 wrapper · `pnpm uc001:nhp-bound:prove` | 19:23:54→19:24:07 | **0** | `asserts=17 failed=0` |
| M1 mutation | 临时剥 `TurnDto` `.strict()`（运行时解析路径）后同 R1 | 19:24:43→19:24:56 | **1** | `asserts=63 failed=3` |
| R4 restore | `git checkout --` 还原后同 R1 | 19:25:02→19:25:15 | **0** | `asserts=63 failed=0` |

prove 自身首行（R1；R2/R3/R4 同型）：`with-docker-session: docker.sock permission gap in session; re-exec via sg docker …` → `E2E_POSTGRES_READY label=boot consecutive=3 attempt=4` → isolated PG on loopback → `PASS  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)` → `CMD=… EXIT=0`。**本次无环境失败 · env-blocked ≠ PASS 不适用。**

**M1 细节**：worktree `node_modules` 经 symlink 解析到 `/workspace/meetwise-lineAG/packages/contracts`（非本地 tree 的 contracts）。对**运行时解析路径**临时改 `:63` `}).strict();` → `});`；跑完立即 `git checkout --` 还原，SHA256 前后一致（`2259b6ab…`）。实测：V1 → **HTTP 409** `{error:'stale_question'}`（非 400）· 失败 3 条 = V1 400 / unrecognized_keys / V4 V1-replay 400 · EXIT=1 ≠ 0。**变异未入库。** 静态 ANCHOR 仍读本地 tree 的 `:63`（与 peer N-1 同类：静态锚在变异下可误判通过；运行时 V1 已变红兜底）。

## 3. 证据层 / V1–V5（对照 R1 stdout）

- **证据层**：真 HTTP（in-process Nest）+ 隔离真 PG（run-e2e-isolated · RLS）· 无 worker / 无模型。✅
- **靶**：只调 `/interview/:id/turn` · Ban `/answer`。✅
- **正控**：独立 seed `issued` · `/turn` → **202** + 恰 +1 answer job · consumption 仍 reserved · interview `created`。✅
- **V1**：多余键 → **400** `invalid` / `unrecognized_keys` · job delta 0 · LEDGER-SNAP 字节相同。✅
- **V2**：独立 seed + injection text → **202** · payload 字节相同 · 不跳 completed · 无额外扣费。✅
- **V3**：`POST /resume` → **200**（钉死）· 无 entitlement/interview 副作用 · JD/quiz ingress = absent。✅
- **V4**：离线 seed `completeInterviewAndConfirm`（已披露）· V1-replay 400 · V2-family 409 `interview_not_active`。✅
- **V5**：GuardrailHit = absent（AUDIT-OBSERVATION）。✅
- **零模型**：`ai_model_invocation` / `ai_invocation_trace` 0→0。✅

## 4. 条件 / pins / Ban

| Check | Ruling |
|-------|--------|
| B5 EXIT0（neg 26/26 + bound 17/17） | **held** · 独立 R2/R3 |
| ADV EXIT0（63/63） | **held** · R1 + R4 |
| mutation 未入库 · EXIT≠0 | **held** · M1 EXIT1 · SHA 还原 |
| EXIT0 ≠ covered · ADV stays blind/case-only | **held** · matrix/prove/receipt 明示 · coveredCount=**8** |
| Ban wash Y/AB | **held** · 仅回归复跑 · proof 零改 |
| Ban self-nail · Ban invent covered · Ban HA | **held** |
| alone ≠ dual · 不代签 `2bf22c5` | **held** · peer 独立核实一致，但本审不共签 |
| env-blocked ≠ PASS | **held** · 本次零 env-block |

### Pins（原值 · 不翻）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503**

## Blockers

**无。**

## Non-claims

PASS ≠ nail ≠ covered ≠ HA · EXIT0 ≠ covered · alone ≠ dual · 不代签 peer · Ban wash Y/AB · Ban self-nail · Ban invent covered · Ban live · Ban buy cloud · mutation 未入库 · env-blocked ≠ PASS · ADV stays blind/case-only

## 中文摘要

独立在 box 复跑 tip `7eb1c88`：ADV 63/63 EXIT0、NEG 26/26 EXIT0、BOUND 17/17 EXIT0；临时剥 TurnDto `.strict()` 后 ADV EXIT1（V1→409 `stale_question`，failed=3），还原后 EXIT0，变异未入库。产品零改动，Y/AB 仅回归、未借绿。ADV 仍 blind/case-only，EXIT0≠covered，coveredCount=8，pins 不动。peer rag POST `2bf22c5` 独立核实一致但不代签。本 PASS≠nail≠covered≠HA；alone≠dual。

Verdict: PASS
