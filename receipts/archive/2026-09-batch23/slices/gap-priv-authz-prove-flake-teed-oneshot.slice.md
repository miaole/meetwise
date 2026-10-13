# Slice — **GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot**（Line A'' · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · **canHonestlyFlip=false**
**Date**: 2026-10-03
**Base**: `origin/feat/mysql-schema-skeleton` · `f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b`（A' FINAL HONEST CLOSE）
**Authority**: meetwise — L0 docs only · Ban coding · Ban self-approve · Ban secrets / `.env*`

## One-line

Line A''：修 A' 遗留的证据缺陷（FAIL `3811cf1`：attempt-1 JSON `"exit": 0` 与 log 无可引用 EXIT 不能同意）。授权**一次**「从第一字节 tee、log 末行自带 `PROCESS_EXIT=<n>`」的 `pnpm privacy-authorization:prove` 第一跑（attempt=2 新文件）。绿 ≠ 关 flake；`GAP-PRIV-AUTHZ-PROVE-FLAKE` 仍 **OPEN** / mitigated-cause-unknown，除非真根因钉死且双审同意（默认不关）。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-priv-authz-prove-flake-teed-oneshot.md` |
| Dual `mw-privacy-int` | `reviews/REQUEST-2026-10-03-gap-priv-authz-prove-flake-teed-oneshot-mw-privacy-int.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-03-gap-priv-authz-prove-flake-teed-oneshot-mw-e2e-ha.md` |

## Chain（A' → A''）

- A' honesty slice + harness + FINAL `f3cf84c`：oneshot attempt=1 EXIT=0（JSON），log 无 `EXIT=`/exit code/`ELIFECYCLE`，JSON 与 log **不能同意**。
- FAIL `3811cf1` / `3811cf1b47d3c3a939c2077b9c7386ab036069e6`：唯一阻塞是 log EXIT 不可引用。attempt-1 文件冻结（blob 锚 JSON `8cc9db5…` · log `e8d0fbe…`）。
- 本刀（A''）：新 REQUEST 授权 teed 第一跑 attempt=2。attempt=1 不改、不 forge、不重跑。

## 流程（§3 loop 第③步 → 第④步）

1. 本 commit：docs-only REQUEST（harness + slice + 两个 pre-exec stub，PENDING）。
2. 预执行双审：`mw-privacy-int` + `mw-e2e-ha` **BOTH PASS**（alone ≠ dual · Ban self-approve · 不代签 peer）。
3. 协调方（meetwise bot）显式授权 → 实现方才允许按 harness 唯一 CMD 跑 prove **恰好一次**（attempt=2 新文件：`teed-oneshot-attempt-2.log` / `teed-oneshot-attempt-2.json`）。
4. 跑完后诚实 SSOT（另行 docs commit）：记录真实 EXIT；绿 ≠ 关；gap 仍 OPEN / mitigated-cause-unknown；post-prove 双审另起。

## Ban（逐条）

1. Ban retry-to-green。
2. Ban 重跑第二次（无 attempt-3）。
3. Ban forge `PROCESS_EXIT` 到旧 attempt-1（禁改 `oneshot-attempt-1.json` / `oneshot-attempt-1.log`）。
4. Ban 关 UC-052 covered（UC-052 stays partial · Do not write covered · Do not flip UC-018）。
5. Ban 改 `apps/worker/src/checkpoint-principal.ts`（零产品改动）。

Ban coding · Ban push · Ban self-approve · 本 commit 不运行 prove。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false.

*Slice · GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot · draft:awaiting_pre_exec_dual · OPEN mitigated/cause-unknown · STOP*
