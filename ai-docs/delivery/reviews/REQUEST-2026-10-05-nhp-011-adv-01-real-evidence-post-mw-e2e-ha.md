# Review — mw-e2e-ha — NHP-011-ADV-01 · UC-011 ADV refund-callback real-evidence POST-PROVE（Line V · honesty of red）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · **不代签** `mw-model-op`）
**Review date**: 2026-10-05（Asia/Shanghai · UTC+8）
**Knife**: Line V · `harness/nhp-011-adv-01-real-evidence.md` · case `NHP-011-ADV-01` · gap `GAP-UC011-ADV-01` · row `UC-E2E-011` ADV 列
**REQUEST**: `bb9af74`（`bb9af74b8398a2a8e4bba15f34699775529295c6`）
**PRE dual**: mw-model-op `587b9e0`（`587b9e03eeb37f643fd1e203d8befa41272d968f`）PASS + mw-e2e-ha `5716b47`（`5716b477f6589d36c2474ad52942a59d6e191f88`）PASS（两文末行均 `Verdict: PASS` · ancestry verified）
**CODE**: `3d113c8`（`3d113c872455375d81d84de48b7d806eb42b2dd4`）· 4 files · **零产品业务口**
**Claim PROVE tip**: `79825b2`（`79825b206d068aea0ef200ae8f5c4f92e85642d6`）· receipt `ai-docs/delivery/receipts/2026-10-05-nhp-011-adv-01-real-evidence-prove.md`
**本审 tip（detach origin）**: `79825b2`（= origin/feat/mysql-schema-skeleton at fetch time · porcelain 0 行）
**本审未读**: `.env*` · 未 print secrets · 未 git config · 未 force-push · 未改产品代码 · 未代签 peer

> **本审对象 = 红的诚实性（EXIT=1 为预期好结果）。** 三口 404 = 执行面 UNREACHABLE ≠ 拒签证据 ≠ 重放幂等证据。Ban wash 404=pass/partial/covered。PASS ≠ nail ≠ covered ≠ HA。alone ≠ dual。

---

## 1. Tip / ancestry — 通过

| SHA | Role | Full | Ancestor of HEAD `79825b2`? |
|-----|------|------|-----------------------------|
| `bb9af74` | REQUEST | `bb9af74b8398a2a8e4bba15f34699775529295c6` | YES |
| `587b9e0` | PRE mw-model-op | `587b9e03eeb37f643fd1e203d8befa41272d968f` | YES |
| `5716b47` | PRE mw-e2e-ha | `5716b477f6589d36c2474ad52942a59d6e191f88` | YES |
| `3d113c8` | CODE | `3d113c872455375d81d84de48b7d806eb42b2dd4` | YES |
| `79825b2` | PROVE receipt | `79825b206d068aea0ef200ae8f5c4f92e85642d6` | = HEAD |

`git fetch origin` + `git checkout --detach origin/feat/mysql-schema-skeleton`；独立 `merge-base --is-ancestor`。`3d113c8..79825b2` diff = 仅 receipt 一文件。

## 2. CODE 面 · 零产品业务口 — 通过

`git diff 3d113c8~1 3d113c8 --name-only`：

| 文件 | 性质 |
|------|------|
| `apps/api/test/uc-e2e-011-adv-refund-callback.proof.ts` | 新增 prove（test） |
| `apps/api/package.json` | +1 script `prove:uc011-adv-refund-callback` |
| `package.json` | +2 script `uc011:adv:prove` / `:raw` |
| `scripts/run-e2e-isolated.mjs` | +receipt sources / allowlist / dispatch（test infra） |

- **零** `apps/api/src/**` / `packages/db/src/**` / migrations diff。
- `rg "refund-callback|refund_callback|webhook/refund" apps/api/src` → **0 命中**：产品内无新 refund-callback 路由（Ban invent product mouth 成立）。

## 3. Harness 诚实性（静态读 `uc-e2e-011-adv-refund-callback.proof.ts` @ tip）— 通过

- `isUnreachable(404|405)`；A1 闸 `isExplainableRejectNotGap` 明确排除 404 → 404 **不能** 记 A1 拒签 PASS。
- A2 首腿须非-404 2xx；次腿须非-404；另设显式断言「双次 404 不得记成重放幂等 PASS」。
- `failures>0` → 打印 `GAP-UC011-ADV-01` + `GAP-UC011-REFUND-CALLBACK` 明细 → `process.exit(1)`；EXIT0 分支文案明示 `EXIT 0 ≠ 翻行 ≠ covered`。
- 无 retry 循环、无 flake 标签；崩溃路径亦 EXIT 1 并标「非 flake」（本次未走崩溃路径，见 §4 走到断言合计）。
- C-1：具名 status/error 码明示 deferred（产品口缺失，Ban 发明码）——与 model-op PRE 条件一致。

## 4. 独立复跑（恰一次 · Ban retry-to-green）— EXIT=1 诚实红

- **CMD**: `sg docker -c "env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc011:adv:prove"`（docker 需 `sg docker`；显式剥离 MODEL_* · Ban live）
- **Measured**: `CMD=pnpm uc011:adv:prove EXIT=1` · shell `SHELL_EXIT=1`
- **When**: 2026-10-05 23:59:27 → 23:59:46 CST（durationMs 18610）
- **Isolated PG**: `meetwise-e2e-409095-1791215967758` @ `127.0.0.1:32788`；结束后无残留 `meetwise-e2e-*` 容器；worktree porcelain 0 行
- **Machine receipt (.tmp, gitignored)**: `.tmp/isolated-proof-receipts/2026-10-05T15-59-46-371Z-409095-7769b3c7-5227-4bc8-8202-b0f59d0695e9.json` → target=`uc011:adv:prove:raw` · outcome=`failed` · exitCode=`1` · releaseEvidence=`false`
- **Env**: 未阻塞；EXIT=1 来自断言（非 infra / 非 harness 崩溃）。

### 4.1 三口 404（实测原样）

| Mouth | HTTP | body |
|-------|------|------|
| `POST /payment/refund-callback` | **404** | `Cannot POST /payment/refund-callback` |
| `POST /commerce/webhook/refund/ADV011_PAID` | **404** | `Cannot POST /commerce/webhook/refund/ADV011_PAID` |
| `POST /commerce/orders/ADV011_PAID/refund-callback` | **404** | `Cannot POST /commerce/orders/ADV011_PAID/refund-callback` |

`SURFACE: anyReachable=false allUnreachable=true`

### 4.2 A1 / A2 / INV

| Leg | 实测 | 结果 |
|-----|------|------|
| INV ×5（静态：payment/webhook/controller/service 无 refund*） | — | **5/5 PASS** |
| A1 错签 primary / 垃圾短签 primary / webhook 等价错签 | 404 / 404 / 404 | **3 FAIL**（`GAP-ITEM leg=A1 reason=UNREACHABLE`） |
| A1 DB 零误改 ×4 | 不变 | 4 PASS（≠ 验签真证据） |
| A2 first / second 同体重放 | 404 / 404 | **3 FAIL**（含 Ban-wash 断言；`GAP-ITEM leg=A2 reason=UNREACHABLE`） |
| A2 DB 无双退 ×3 | 不变 | 3 PASS（≠ 重放真证据） |
| **合计** | `断言合计: 18 条, 失败 6 条` | INV ALL PASS · A1 3 FAILED · A2 3 FAILED |

### 4.3 GAP print（实测）

- `GAP-UC011-REFUND-CALLBACK: 三口皆 404/405 — 执行面 UNREACHABLE（H4/H5 一致）`
- `GAP-UC011-ADV-01: A1/A2 无法取得非-404 验签/重放证据（Ban wash 404=pass）`
- 尾部 `GAP-UC011-ADV-01 — 诚实保留 gap（EXIT 1 …）` + 6 条 `GAP-ITEM` + `GAP-UC011-REFUND-CALLBACK — POST /payment/refund-callback + markOrderRefunded / webhook refund 产品口未落`
- `C-1 DISCLOSED` ×2（A1/A2 具名码 deferred）

### 4.4 与 receipt 对账

receipt `79825b2` 宣称 EXIT=1 · 18/6 · INV 5/5 · 三口 404 · A1/A2 UNREACHABLE · 双 GAP · C-1 deferred —— **本审复跑逐项一致**。

## 5. Ban wash / EXIT0≠covered / alone≠dual

- **Ban wash**：404 未被记为 A1 拒、未被记为 A2 already/no-op、未升 ADV partial/covered。✔
- **EXIT0 ≠ covered**：本次 EXIT=1；即便未来 EXIT0 亦 ≠ covered（harness + receipt 均明示）。`UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · coveredCount=**8**。✔
- **Ban invent covered**：本审不翻矩阵/NHP/checklist/backlog，零 SSOT diff。✔
- **alone ≠ dual**：本文仅 mw-e2e-ha 半签；**不代签** mw-model-op；dual 需 peer 独立 post。✔
- **PASS ≠ nail**：本 PASS = 「红的诚实性」通过，≠ ADV 证据成立 ≠ GAP 关闭 ≠ nail。✔

## 6. Pins（未翻）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · coveredCount=8（prove 输出 PINS 行与 machine receipt `releaseEvidence=false` 一致）

## 7. Blockers

无（针对「红的诚实性」裁决）。

## 8. Conditions

1. `GAP-UC011-ADV-01` 与 `GAP-UC011-REFUND-CALLBACK` **均保持 open**；本刀 Ban 互借关闭。
2. 产品口（refund-callback + markOrderRefunded / webhook refund）须独立刀落地并过各自 dual；落地后先钉 C-1 具名 status/error（UC014 级具体性），再重跑本 prove 求非-404 真证据。
3. 任何后续 EXIT0 亦须 post-prove dual + 协调方 nail 才能讨论 ADV gap→partial；EXIT0 ≠ covered。
4. 本 PASS 须与 mw-model-op 独立 post-prove 合并才构成 dual；alone ≠ dual。

## 中文三行摘要

1. 独立复跑 `pnpm uc011:adv:prove` 恰一次：EXIT=1，三口 refund-callback 全 404，A1/A2 UNREACHABLE，断言 18 失败 6，INV 5/5，双 GAP 如实打印。
2. CODE `3d113c8` 仅 prove + 脚本注册，零产品业务口；404 未被洗成 pass/partial/covered，C-1 具名码明示 deferred。
3. 红的诚实性 PASS ≠ nail ≠ covered ≠ HA；UC-011 stays partial · coveredCount=8；alone≠dual，不代签 mw-model-op。

Verdict: PASS
