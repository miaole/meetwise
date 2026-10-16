# REQUEST — **GAP-PRIV-AUTHZ-PROVE-FLAKE · honesty ledger refresh**（Line AH · post dual）· mw-privacy-int

**Status**: **POST PASS**（privacy half only · alone ≠ dual · 不代签 mw-e2e-ha · Ban self-nail）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-privacy-int`
**Knife**: `harness/gap-priv-authz-prove-flake-ledger-refresh.md` · slice `gap-priv-authz-prove-flake-ledger-refresh.slice.md`
**Refresh ledger**: `receipts/gap-priv-authz-prove-flake/2026-10-06-ledger-refresh.md`（下称 **RL**）
**Execution tip（reviewed）**: `0005096f773d8fd8f40d594e3912eaf99cbb3343`（`origin/line/ah-priv-authz-flake-ledger-refresh`）· on-branch 等价 `01e0853abeba956d1ecb18f0536dc285f6d9ee5b`（`origin/feat/mysql-schema-skeleton` · `git range-diff` `1: 0005096 = 1: 01e0853` · 5 文件 blob 全等）
**Reviewed at**: `origin/feat/mysql-schema-skeleton` `5b95dfdebebefc1e43874efeeabb202abf54ac9f`（`01e0853..5b95dfd` 仅 e2e post 半文件）
**REQUEST**: `b12e20d26ef852a9a4de136324f3c225ab7ef4ee` · **PRE** privacy `880f14408dda9a9cb03737b811b6005d94c3a2dc`（本人）+ e2e `f2154387df654b4600b74b4c8a52c1d35f5986b2`（不代签）
**Date**: 2026-10-06（CST / UTC+8）
**Method**: 临时 detached worktree · 只读 `git diff` / `git show` / `git hash-object` / `git rev-parse <rev>:<path>` / `git patch-id` / `git merge-base --is-ancestor` / `rg` / jsonl 计数。**零 prove · 零 Docker/PG · 零 CMD 证据 · 零 `.env*` · 零 Meridian · 零产品代码。**

---

## 1 · Docs-only / 范围 —— **PASS**

- `git diff --name-status 0005096~1 0005096`（= `01e0853~1 01e0853`）恰 5 文件，全在 `ai-docs/delivery/**`：slice（M）· harness（M）· RL（A）· post stubs ×2（A）。
- `git diff --name-only b12e20d 0005096 | grep -v '^ai-docs/delivery/'` → 空；15 文件中其余 10 为 AD/AE/AF/AG 兄弟 PRE 评审 + 本人 PRE `880f144`（已在 PRE 链上）。
- 零 `apps/` · `packages/` · `package.json` · migrations · `scripts/` · `principal.ts` · `checkpoint-principal.ts`。
- SSOT 三件（matrix / `gap-bug-backlog.md` / `execution-master-checklist.md`）未在 `b12e20d..5b95dfd` 触及；`gap-bug-backlog.md:68` 仍 **OPEN** · mitigated/cause-unknown。
- Harness 新增段（`harness/…ledger-refresh.md:72-79`）与 slice（`…slice.md:30-34`）仅状态翻 `executed:awaiting_post_dual` + 执行摘要；均写 gap stays OPEN · Ban close · Ban claim fixed。

## 2 · Cites 真实性（F1/F2/F3）—— **PASS**

**F1 9/9（RL:23-37）**：逐锚 `git hash-object`（工作树）= `rev-parse 5b95dfd:<path>` = `rev-parse b3e0f41:<path>` = `rev-parse 40bed97:<path>`，9/9 与 RL 表一致（`272f0314…` · `d066fcd8…` · `4ce66da1…` · `db8ade3b…` · `8cc9db56…` · `e8d0fbe4…` · `3919bf57…` · `9b134144…` · `81795533…`）。`git ls-tree -r 5b95dfd` 9 blob 全命中。Line X ledger `2026-10-05-rootcause-ledger.md` blob `ce3f6bc4…` 自 `40bed97` 零改动（`git log 40bed97..HEAD -- <path>` 空）。

**F2（RL:41-55）**：`git log b3e0f41..HEAD -- scripts/run-e2e-isolated.mjs packages/db/src` 恰 5 提交 `3d113c8 · bf1fdb2 · 6e96cf5 · 40a4f6c · 48c4a8a`（全 SHA 与 RL:47-51 一致）。逐个 `git show` 读 diff：
- `3d113c8` / `40a4f6c` / `48c4a8a`：仅新增 `package.json` 一对脚本 + wrapper `isolatedReceiptSources` 新键 + target 白名单 + `isolatedCommand` 新分支——分类「新 target only」属实。
- `bf1fdb2`：同上 + `packages/db/src/payment.ts` `markOrderRefunded` · `index.ts:284-285` 导出 `RefundResult`——属实。
- `6e96cf5`：新 target + `migrateWithRecovery` 门闸数组行末 append `'uc001:nhp-bound:prove:raw'`；该行（现 `scripts/run-e2e-isolated.mjs:2144`）本已含 `privacy-authorization:prove:raw`——RL:49「append-only · 行为路径不变」属实。
- 映射未变：`package.json:288-289`（`b3e0f41` 时 `:277-278`）命令串逐字相同；`isolatedCommand` 隐私分支 `scripts/run-e2e-isolated.mjs:1591-1592` → `pnpm -C packages/db prove:privacy-authorization`；`'privacy-authorization:prove:raw': [` receiptSources 块（`:881-…`）`b3e0f41` vs HEAD `diff` 为空；`git diff b3e0f41 HEAD -- packages/db/src/{privacy-authorization,principal,isolated-test-target}.ts packages/db/package.json apps/worker/src/checkpoint-principal.ts` 空。

**F3（RL:59-66）**：`git log b3e0f41..HEAD -- receipts/gap-priv-authz-prove-flake receipts/uc052-pool-role-leak` = `40bed97`（Line X nail）+ 本刀 `01e0853`（仅新增 RL）；jsonl 仍 29 行 · 无新 json/log → **新 attempt = 0** 属实。

## 3 · N1 —— **FIXED · PASS**

- RL:114 绿行 `prove_tip_authz` · `9b39a20d6b53d10ac95be880037a3e716126f715` · n=1 · EXIT=0 · 「绿行 · 非红 · ≠ close」；jsonl L29 原文 `kind=prove_tip_authz · exit=0 · note "Ban claim flake fixed; status remains mitigated/cause-unknown"`，log `logs/prove-tip-authz-9b39a20.log` 存在。
- 可达性核：`9b39a20` 对象存在，**非** `5b95dfd` 祖先，无 remote 分支包含；`git patch-id --stable` 与 `ab96a02`（`ab96a0299d8836a635077f8bf9b61a7891aa583f` · 分支祖先）同为 `84fc1ba3…` · subject 一致 → range-diff 等价。RL **未**声称 `9b39a20` 在 origin / 为祖先 ✔；green ≠ close（RL:114 · :120 · :144）✔。

## 4 · N2 —— **FIXED · PASS**

RL:78 照抄 Line AC 限定语「env-gap cleared **only for this host/session class**」并 cite `receipts/g7-env-gap-honest-fix/SUMMARY.md:50`（实读原文：「**env-gap cleared** for this host/session class under Ban live.」）+ `:80` PATH A `scripts/with-docker-session.sh`（实读一致）；「勿泛化」明示。RL:76 定性 docker.sock **permission denied**（非 ECONNREFUSED）· 不同失败 class，**未**借以声称本 flake 原因已修。F4(b) `44154aa` 为有效 commit · `receipts/2026-10-05-c-perf-teardown-branch-a-blocked-ledger.md:7` `ECONNREFUSED 127.0.0.1:64244` @ `assertIsolatedTestTarget` 属实 · 只读引用、零碰 AE。

## 5 · 红账 ×3 原样 —— **PASS**

- 实读：`logs/cold-5.log:18` `connect ECONNREFUSED 127.0.0.1:33047` · `:30` `state_bytes=29`；`historical-first-failure-ECONNREFUSED-69de818.log:16` `ECONNREFUSED 127.0.0.1:33010`；`warm-2.log:6/13/24` `interview_pkey` / `23505`——与 RL:74 · :109-111 一致。
- jsonl 计数（python 读 29 行）：cold@`71ec253` 4×0+1×1 · warm@`71ec253` 1×0+1×1 · cold_v2/warm_v2@`3d0c71e` 各 10×0 · prove_tip_authz@`9b39a20` 1×0 · meta 1 —— 与 RL:110-114 一致；RL:113 保留「warm_v2 新容器 ≠ 复用库 → 23505 未重覆盖」。
- RL:118 合计 EXIT=1 **3** 次 · 2 class 未归一；attempt-1「JSON 0 / log 无退出码 · 不同意」保留（RL:115；实读 json `exit=0`、log 无 exit 行）；attempt-2 `teed-oneshot-attempt-2.log:74` `PROCESS_EXIT=0` 三角一致 · ≠ close（RL:116）；`606677d` 为祖先、`6673042` 不可达（披露 RL:150）。零新 PROCESS_EXIT · Ban retry-to-green（RL:120 · :158）。

## 6 · Flake 状态措辞 —— **PASS**

`rg 'fixed|closed|root-caused|covered|cleared'` RL：仅出现于 Ban / Non-claims / ≠ 语境（RL:3 · :37 · :66 · :144）及 N2 限定语（:78）；状态处一律 **OPEN · mitigated/cause-unknown**（RL:1 · :6 · :138 · :144）。无「covered」主张；coveredCount=8 未动。

## 7 · Pins —— **PASS**

RL:124-138 表：NOT_HA · releaseEvidence=false · claimProductionHA=false · PG-retained · DELETE=503 · UC-052 partial · coveredCount=8 · canHonestlyFlip=false · `:68` OPEN；Ban buy cloud（RL:10 · F5 RL:96）。matrix 未改（UC-052 行 `e2e-requirement-coverage-matrix.md:132` 仍 partial；DELETE=503 pin `:190`）。

## 8 · 边界 —— **PASS**

RL:144 / :162：not closed · not rerun authorization · Ban self-nail · alone ≠ dual。F5 + N4（RL:84-99）close bar（deliberate red + cause-fix + N≥5 consecutive first-runs）仍 unmet · 本刀不授权 rerun。本 PASS ≠ nail ≠ close flake ≠ coding ≠ HA。

---

## PRE N1–N6 处置

| PRE | 处置 | 位置 |
|-----|------|------|
| N1 `9b39a20` 绿行 | **已修** | RL:114 |
| N2 AC 限定语 | **已修** | RL:78 |
| N3 F2 逐 diff 分类 | **已执行**（本审复核属实） | RL:45-55 |
| N4 future close-bar 语言 | **已并入** | RL:91-97 |
| N5 `6673042` 不可达 | 披露保留 | RL:150 |
| N6 父 ≠ base | 披露保留 | RL:151 |

## 非阻塞备注（不影响 Verdict）

1. **P1 · `bf1fdb2` 行漏列 migration**：该提交另含 `packages/db/migrations/0136_payment_order_refund_provider_txn.sql`（+30）与 `packages/db/sql/11_commerce.sql`（+4）。隐私 prove 经 `migrateWithRecovery`（`scripts/run-e2e-isolated.mjs:2144`）跑全量迁移，故隔离库 schema 面有增量；不触 `privacy-authorization:prove:raw` 映射 / receiptSources（RL:48 结论仍成立），且 RL 未据此称 fixed。下次 ledger 建议补一句「新增 commerce 迁移随 migrate 执行 · ≠ fix · ≠ 无影响证明」。
2. **P2 · RL:114 未复写 `9b39a20` 可达性**：Line X ledger `2026-10-05-rootcause-ledger.md:63` 已记「存在但非分支祖先」；本审实测 patch-id 等价 `ab96a02`。RL 未作相反声称，仅建议后续表内带注。
3. **P3 · RL:18 方法写「@ tip `9e2f001`」**：执行提交实际父为 `863a5e6`（line 分支）/ `2e4a825`（feat 等价 `01e0853`）；中间提交不触本刀对象，F1–F3 结论在 `5b95dfd` 复核不变。
4. **P4 · Pins 未显式列 `retention_pending` / coveredCount 构成（RAG-FUNNEL-02A..08）**：本刀不触 matrix，SSOT 未变，仅表达完整度建议。

## Non-claims

Not fixed · not closed · not root-caused · not a prove · not a rerun · not rerun authorization · not nail · not coding · not HA · not covered · **GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN mitigated/cause-unknown** · privacy half alone ≠ dual（mw-e2e-ha post 半 `5b95dfd` 由其自签，本审未代签）。

*Post review · mw-privacy-int · Line AH · 2026-10-06 · zero prove · STOP*

Verdict: PASS
