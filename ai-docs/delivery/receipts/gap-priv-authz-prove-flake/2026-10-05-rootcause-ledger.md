# Ledger — **GAP-PRIV-AUTHZ-PROVE-FLAKE · rootcause/repro ledger**（Line X · NAIL · **`post_prove_dual_pass`** · flake stays **OPEN** mitigated/cause-unknown）

**Status**: **`post_prove_dual_pass`**（Line X nail · docs ledger only · L1–L6 retained · POST dual BOTH PASS · **PASS ≠ fixed ≠ closed ≠ root-caused ≠ HA** · Ban claim fixed · Ban forge PROCESS_EXIT · Ban coding product · Ban principal.ts · Ban Meridian · Ban secrets · Ban force-push · Ban closing backlog `:68`）

> **REQUEST-era note（historical · retained）**: this file began as `executed:awaiting_post_prove_dual` at tip `b3e0f41`. Post dual mw-e2e-ha `424c7f0` + mw-privacy-int `2974d45` BOTH PASS. Lifecycle advanced to **`post_prove_dual_pass`** by Line X nail only. Gap stays **OPEN** mitigated/cause-unknown.
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05（CST / UTC+8）
**Gap id**: **`GAP-PRIV-AUTHZ-PROVE-FLAKE`**（backlog `gap-bug-backlog.md:68` stays **OPEN** · **mitigated/cause-unknown** · 本 ledger 不改该行）
**REQUEST**: `5773243` / `5773243cc3c64bf4e4d9242814a3b7ba8b778986`（harness `harness/gap-priv-authz-prove-flake-rootcause-ledger.md` · slice `gap-priv-authz-prove-flake-rootcause-ledger.slice.md`）
**PRE-EXEC dual BOTH PASS**: mw-privacy-int `8f28151` / `8f281511f81f7900b2610218029eb4d1971ed2eb` + mw-e2e-ha `9b8f748` / `9b8f748e2682019e27d5357bad728d2cb330b902`
**Authority**: 协调方（meetwise）授权 docs-only 执行 · Ban coding product · Ban `principal.ts` / `checkpoint-principal.ts` · Ban claim fixed · Ban forge `PROCESS_EXIT` · Ban prove rerun to close flake · Ban self-nail · Ban Meridian · Ban force-push · Ban secrets

## 执行声明（先读）

- **本 ledger 未跑任何 prove**（零 `pnpm privacy-authorization:prove` · 零 Docker / Postgres 启动 · 零 attempt-3）。下文所有 EXIT 均为**引用**既有树内证据，非新执行。
- **零产品改动**：`apps/` · `packages/` · `package.json` · migration · scripts · `.env*` 未碰；`apps/worker/src/checkpoint-principal.ts` 未碰。
- **零 SSOT 改动**：`e2e-requirement-coverage-matrix.md` / `gap-bug-backlog.md` / `execution-master-checklist.md` 未碰（SSOT 仅 nail 时改 · 本刀不 nail）。
- **零旧证据改动**：attempt-1 / attempt-2 json/log/receipt、`uc052-pool-role-leak` jsonl/logs 均只读（blob 锚见下，执行前后 `git hash-object` 一致）。
- 核验方法：worktree @ `origin/feat/mysql-schema-skeleton` `c048533`（`5773243` 为其祖先）上 `git hash-object` / `sha256sum` / `rg` / `git rev-parse --verify` / `git merge-base --is-ancestor`。

## L1–L6 Ledger（REQUEST 表逐行执行）

| # | 复现项 | 树内证据（只读核验结果） | 结论（诚实） | 不得写成 |
|---|--------|--------------------------|--------------|----------|
| **L1** | attempt-1 JSON/log 不同意 | receipt `0da63bf` / `0da63bf7798f2c018624e2fcfab313891abc232b`（`docs(privacy): GAP-PRIV-AUTHZ-PROVE-FLAKE oneshot attempt 1 EXIT 0`）· `oneshot-attempt-1.json` blob `8cc9db56079a60fc6410472632dbf4899952c9c2` → `"exit": 0` · `oneshot-attempt-1.log` blob `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77`（72 行 · sha256 `9bc7764d…f88b`）· `rg 'PROCESS_EXIT\|EXIT=\|ELIFECYCLE\|exit code'` 命中 **0**（rc=1）· 末两行 = 成功横幅 L71 + `LOCAL_ISOLATED_PROOF_RECEIPT` · e2e-ha FAIL `3811cf1` / `3811cf1b47d3c3a939c2077b9c7386ab036069e6` | JSON 与 log **不同意**仍立；成功横幅 ≠ 进程退出码；缺陷**保留**，不补写 | 「已补 PROCESS_EXIT」 |
| **L2** | prove SHA 锚 | `oneshot-attempt-1.json` `"proveSha": "5b6e693e5e8b253da6c889a46aee331a8a6f5ccd"`；commit `5b6e693` 存在且为分支祖先（subject `review(e2e): UC018 flip-ban post-prove PASS @ad37bbb` = 跑时 HEAD，非 privacy 产品提交） | prove SHA（跑时 HEAD）`5b6e693` ≠ receipt commit `0da63bf` | 「prove SHA = receipt SHA」 |
| **L3** | FINAL honesty 停刀 | `f3cf84c` / `f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b`（`docs(delivery): FINAL HONEST CLOSE flake oneshot post_prove_dual_pass`）· 链 `2ec9d41` + dual `f2de066`（privacy）+ `3f6ea4a`（e2e）· backlog `:323` 段 | docs 停刀；gap stays OPEN；「close」= 诚实收口文书，**非**关 gap | 「gap closed」 |
| **L4** | teed attempt-2 三角一致 | `teed-oneshot-attempt-2.log` blob `9b1341444425c4172d8a9cd02e5d8415a94a4084`（74 行 · sha256 `136996dc…8987`，与 receipt 自报一致）末非空行 L74 字面 `PROCESS_EXIT=0`（全 log 唯一）· `teed-oneshot-attempt-2.json` blob `3919bf579addf264b2eff3625fef7397bf1d7123` `"exit": 0` + `"processExitLine": "PROCESS_EXIT=0"` · receipt `2026-10-03-teed-oneshot-attempt-2-receipt.md` blob `81795533b028c5c71aca49fd8bdb1299937c73f0` · 双 log 均 51 `PASS` 行 · 单 `> meetwise@` 顶层头 | EXIT 三角一致（log/JSON/receipt）；修复的是**证据缺陷**（3811cf1），**不是**根因 | 「root-caused / fixed」 |
| **L5** | 两类失败 class | 见下「失败 class 账」：cold `ECONNREFUSED` ×2 份 log · warm SQLSTATE `23505` ×1 份 log | 两类**并存**，未归一；cause unknown | 「单一根因已定位」 |
| **L6** | 未来 teed first-run / 根因修复刀 | REQUEST harness L14 / L54 · backlog `:298` / `:330` · checklist `:594` / `:626` | 须**独立新 REQUEST** + 预执行双审；本 ledger **不**授权任何再跑 | 「本 ledger 已授权再跑」 |

## 失败 class 账（L5 展开 · 逐字引用 · 只读）

| Class | 证据文件（blob） | 字面行 | 运行上下文 |
|-------|------------------|--------|------------|
| **cold** ECONNREFUSED | `receipts/uc052-pool-role-leak/logs/cold-5.log`（`d066fcd8e8a6805e903b706196c3ead5d7cd9feb`） | L18 `Error: connect ECONNREFUSED 127.0.0.1:33047` · L24 `code: 'ECONNREFUSED'` · L30 `ISOLATED_POSTGRES_OUTPUT_WITHHELD container=meetwise-e2e-1936193-1790226030285 state_bytes=29 logs_bytes=29` | jsonl cold n=5 · EXIT=1 · tip `71ec253` |
| **cold** ECONNREFUSED（历史首发） | `receipts/uc052-pool-role-leak/logs/historical-first-failure-ECONNREFUSED-69de818.log`（`db8ade3ba4fecc01a7cb7d019b8424174628d631`） | L16 `Error: connect ECONNREFUSED 127.0.0.1:33010` · L28 `ISOLATED_POSTGRES_OUTPUT_WITHHELD … state_bytes=226 logs_bytes=29` | backlog `:68`：e2e-ha @`69de818` first-run #1 EXIT=1 · #2 EXIT=0 |
| **warm** 23505 | `receipts/uc052-pool-role-leak/logs/warm-2.log`（`4ce66da1ac4dbaea808580fcaa94784ef689a095`） | L6 `duplicate key value violates unique constraint "interview_pkey"` · L13 `code: '23505'` · L14 `Key (id)=(00000000-0000-4000-8000-0000000000a1) already exists.` · L24 `constraint: 'interview_pkey'` | jsonl warm n=2 · EXIT=1 · tip `71ec253` · pgPort 33048（复用库） |

**观察（≠ 根因 · ≠ 假设已证）**：cold 两例端口/容器不同（33047 vs 33010），`state_bytes` 不同（29 vs 226）；warm 例为固定 id `…0000000000a1` 在复用库上重复插入。v2 @`3d0c71e`（`fix(e2e): pre-prove Postgres re-attest + container Running check`）之后 cold_v2/warm_v2 未复现——这是 **mitigation 观察**，review `49ef158` §5 已注 warm_v2 实为新容器（非复用库路径），故 warm 23505 类在 v2 中**未被重新覆盖**。以上任何一条都**不**构成根因结论。

## Attempt EXIT 账（全部已记录尝试 · 引用 · 非新跑）

来源：`receipts/uc052-pool-role-leak/privacy-authorization-flake-ledger.jsonl`（blob `272f0314e0eff8a9192c658a6a72584ae70146f4` · 29 行 · 引入 `522590d`）+ `gap-priv-authz-prove-flake/` receipts + backlog `:68`。

| 批次 | tip | n | EXIT=0 | EXIT=1 | 备注 |
|------|-----|---|--------|--------|------|
| 历史 first-run | `69de818` | 2 | 1 | **1**（#1 ECONNREFUSED） | backlog `:68` · log 见上 |
| cold v1 | `71ec253` | 5 | 4 | **1**（#5 ECONNREFUSED） | jsonl L1–L5 |
| warm v1 | `71ec253` | 2 | 1 | **1**（#2 23505） | jsonl L6–L7 |
| cold_v2 | `3d0c71e` | 10 | 10 | 0 | jsonl L9–L18 · mitigation only |
| warm_v2 | `3d0c71e` | 10 | 10 | 0 | jsonl L19–L28 · 新容器（非复用库） |
| prove_tip_authz | `9b39a20` | 1 | 1 | 0 | jsonl L29 · note「Ban claim flake fixed」 |
| oneshot attempt-1 | `5b6e693` | 1 | JSON 0 / **log 无退出码** | — | **不同意**（L1）· FAIL `3811cf1` |
| teed attempt-2 | `6673042` | 1 | 1（`PROCESS_EXIT=0`） | 0 | 三角一致（L4） |

合计：已记录 EXIT=1 **3** 次（2 类 class）；任何后续绿（v2 20/20 · `9b39a20` · attempt-2）均**不**关行。Ban retry-to-green。

## 可达性披露（本 clone · 非阻塞 · 与 PRE dual 观察一致）

- **不可达（侧枝未上 remote）**：`0c0ab16`（attempt-2 subject）· `6673042`（attempt-2 proveSha / A'' REQUEST 侧枝 HEAD）· `31d3b31` / `376aa8e`（A'' pre-exec dual 原 commit）· `6798a06` / `e7af788`（A'' post-prove dual 原 commit）。
- **可达等价（分支祖先）**：`606677d`（attempt-2 receipts cherry-pick · 同 blobs）· `d01607b` / `9d73570`（pre-exec dual cherry-pick）· `c5ecc0e` / `4c6f09b`（post-prove dual cherry-pick）· `97d8889`（A'' REQUEST）。
- **存在但非分支祖先**：`9b39a20`（jsonl L29 `prove_tip_authz` tip · `fix(privacy): type-only pool-role-leak releaseAsync + prove snapB`）——如实登记，不改 jsonl。
- 证据面以树内 blob 为准（PRE e2e-ha C-7）；本 ledger 不要求、也不伪造不可达对象。

## Blob 锚（本 ledger 执行前后零漂移 · 锚后再变 = FAIL）

| 文件 | git blob |
|------|----------|
| `gap-priv-authz-prove-flake/oneshot-attempt-1.json` | `8cc9db56079a60fc6410472632dbf4899952c9c2` |
| `gap-priv-authz-prove-flake/oneshot-attempt-1.log` | `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77` |
| `gap-priv-authz-prove-flake/teed-oneshot-attempt-2.json` | `3919bf579addf264b2eff3625fef7397bf1d7123` |
| `gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log` | `9b1341444425c4172d8a9cd02e5d8415a94a4084` |
| `gap-priv-authz-prove-flake/2026-10-03-teed-oneshot-attempt-2-receipt.md` | `81795533b028c5c71aca49fd8bdb1299937c73f0` |
| `uc052-pool-role-leak/privacy-authorization-flake-ledger.jsonl` | `272f0314e0eff8a9192c658a6a72584ae70146f4` |
| `uc052-pool-role-leak/logs/cold-5.log` | `d066fcd8e8a6805e903b706196c3ead5d7cd9feb` |
| `uc052-pool-role-leak/logs/warm-2.log` | `4ce66da1ac4dbaea808580fcaa94784ef689a095` |
| `uc052-pool-role-leak/logs/historical-first-failure-ECONNREFUSED-69de818.log` | `db8ade3ba4fecc01a7cb7d019b8424174628d631` |

## CITE_EXIT

本刀 **无 CMD · 无 prove · 无新 EXIT**。引用：attempt-1 JSON `exit 0` vs log 无退出码（不同意 · 保留）；attempt-2 `PROCESS_EXIT=0`（三角一致 · ≠ close）；历史 EXIT=1 ×3（cold ECONNREFUSED ×2 · warm 23505 ×1）保留。

## Non-claims

Not fixed · not closed · not root-caused · not a prove · not a rerun · not teed first-run authorization · not product rewrite · not closing backlog `:68` · not HA · alone ≠ dual · **GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN mitigated/cause-unknown** · canHonestlyFlip=false · UC-052 stays partial · **PASS ≠ fixed ≠ HA**

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503

## STOP（execution-era · retained）

本 ledger 执行方（mw-core）产物原为 awaiting post-prove dual；双审已由 mw-e2e-ha + mw-privacy-int 独立落证。实现方不自批、不代签、不关 gap、不翻 `:68`。

## Line X NAIL（`post_prove_dual_pass` · 2026-10-05 · additive）

- Lifecycle on this ledger/harness/slice: **`post_prove_dual_pass`**.
- Prove/evidence tip NAILED TO: `b3e0f4172e188f23dbcc34aac0bae82e571a10dc`（docs ledger execution · **No CMD · no new prove**）.
- POST dual BOTH PASS: mw-e2e-ha `424c7f06f7438a5a83688e5d14e9c25603e8c2e6` + mw-privacy-int `2974d45741d1009c26a36e24a43d051b1fb93a70`.
- REQUEST `5773243cc3c64bf4e4d9242814a3b7ba8b778986` · PRE dual privacy `8f281511f81f7900b2610218029eb4d1971ed2eb` + e2e `9b8f748e2682019e27d5357bad728d2cb330b902`.
- **L1–L6 retained** · blob 锚零漂移 · attempt-1 JSON≠log 仍立 · Ban forge PROCESS_EXIT · teed attempt-2 `PROCESS_EXIT=0` 三角一致 ≠ close.
- **CITE_EXIT**: **0**（引用 teed attempt-2 log 字面 `PROCESS_EXIT=0` · 非本 nail 新跑 · 非关 flake）。
- **STILL_OPEN**: **GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN mitigated/cause-unknown** · Not fixed · Not closed · Not root-caused · canHonestlyFlip=false · UC-052 stays **partial** · coveredCount=**8** · public DELETE=**503**.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.
- Zero product · Ban principal.ts · Ban Meridian · Ban secrets · Ban force-push · Ban closing backlog `:68` · Ban HA claim. Sibling Y/W nails stay as written.

*Ledger · GAP-PRIV-AUTHZ-PROVE-FLAKE rootcause/repro · Line X NAIL · 2026-10-05 · lifecycle post_prove_dual_pass · tip b3e0f41 · post dual 424c7f0+2974d45 PASS · CITE_EXIT 0 · L1–L6 retained · OPEN mitigated/cause-unknown · PASS≠fixed≠HA · releaseEvidence=false · STOP*
