# Review — mw-e2e-ha — GAP-PRIV-AUTHZ-PROVE-FLAKE oneshot honest close

**Reviewer**: mw-e2e-ha（alone ≠ dual · 不代签 mw-privacy-int）
**Close tip**: `2ec9d4106fa2b06017784cceea3359e37726f6d3`（`2ec9d41`）
**Close message**: `docs(delivery): oneshot post-prove disagreement stays OPEN`
**Close parent**: `d7966bf850678683c9733df96abee3ccc3ff2310`
**Standing FAIL**: `3811cf1b47d3c3a939c2077b9c7386ab036069e6`（`reviews/REQUEST-2026-10-02-gap-priv-authz-prove-flake-oneshot-post-mw-e2e-ha.md`）
**Oneshot tree compared**: `0da63bf7798f2c018624e2fcfab313891abc232b`
**Read-only**: `git show` / `git diff` / `git ls-tree` / `git rev-parse` / `git grep` / `git merge-base --is-ancestor`。未跑 prove。未改 JSON、log、产品。未发明 EXIT。

本 PASS 只表示关账文字诚实。它不关闭 flake，不是编码授权，不是 nail，不是 HA。privacy PASS `7601503` 与其后的 `f2de066` 均 alone ≠ dual，本文件不代签。

---

## 1. oneshot JSON / log blob 未改，log 没有新的 EXIT — 通过

`git diff --name-status d7966bf850678683c9733df96abee3ccc3ff2310 2ec9d4106fa2b06017784cceea3359e37726f6d3` 只有五份文档，没有 receipt：

- `ai-docs/delivery/e2e-requirement-coverage-matrix.md`
- `ai-docs/delivery/execution-master-checklist.md`
- `ai-docs/delivery/gap-bug-backlog.md`
- `ai-docs/delivery/gap-priv-authz-prove-flake-honesty.slice.md`
- `ai-docs/delivery/harness/gap-priv-authz-prove-flake-honesty.md`

`0da63bf..2ec9d41` 对 `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/` 与 `apps/worker/src/checkpoint-principal.ts` 的 name-status 为空。

同一 blob，在 `0da63bf`、`3811cf1`、`d7966bf`、`2ec9d41`、以及审查时 origin 上的 `76d2bc3` 与 `f2de066` 均相同：

| 文件 | blob |
| --- | --- |
| `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.json` | `8cc9db56079a60fc6410472632dbf4899952c9c2` |
| `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.log` | `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77` |

log 仍无 `EXIT=`、无 `exit code`、无 `ELIFECYCLE`（`git grep` 在 `2ec9d41` 的该 log 上无匹配）。结尾仍是成功横幅与 `LOCAL_ISOLATED_PROOF_RECEIPT ... release_evidence=false`，不是进程 EXIT。本审查不发明 EXIT。log blob **未变**。

JSON 仍是 `"attempt": 1`、`"exit": 0`、`"proveSha": "5b6e693e5e8b253da6c889a46aee331a8a6f5ccd"`、`"gapStatus": "OPEN"`。与 log 仍不同意。关账没有把这次不同意洗成可引用的 EXIT。

## 2. 没有 attempt-2，没有第二份 prove receipt — 通过

`2ec9d41` 的 `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/` 仍只有 `oneshot-attempt-1.json` 与 `oneshot-attempt-1.log`。全树文件名无 `oneshot-attempt-2`、无 `attempt-2`。关账 diff 没有新增 receipt。树上没有第二跑。

## 3. 关账明文：oneshot 不是 post-prove PASS，FAIL `3811cf1` 仍在，gap 仍 OPEN — 通过

引用句（oneshot 不是 post-prove PASS）：

> The oneshot does not yet satisfy post-prove.

出处：`ai-docs/delivery/harness/gap-priv-authz-prove-flake-honesty.md:86`。同句亦在 `ai-docs/delivery/gap-priv-authz-prove-flake-honesty.slice.md:45`、`ai-docs/delivery/gap-bug-backlog.md:294`、`ai-docs/delivery/execution-master-checklist.md:590`、`ai-docs/delivery/e2e-requirement-coverage-matrix.md:366`。页脚 `harness/gap-priv-authz-prove-flake-honesty.md:100`：`oneshot does not satisfy post-prove`。

FAIL 仍在：`harness/gap-priv-authz-prove-flake-honesty.md:84` 写 `e2e-ha post-prove **FAIL** 3811cf1`。矩阵 `e2e-requirement-coverage-matrix.md:366` 同样点名该 FAIL 全文哈希。没有把 oneshot 写成 post-prove PASS。没有把 `GAP-PRIV-AUTHZ-PROVE-FLAKE` 写成 CLOSED / fixed / root-caused。

gap：`harness/gap-priv-authz-prove-flake-honesty.md:92` 写 `` `GAP-PRIV-AUTHZ-PROVE-FLAKE` stays **OPEN**, mitigated/cause-unknown. Not fixed. Not closed. Not root-caused. `` 矩阵 `:366` 末句：`GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN and no prove was run.` 既有行未被改写（关账自称 existing row is not changed；diff 是追加段）。

## 4. 另一次 REQUEST 才允许再跑第一次；本提交不授权；未改 principal — 通过

`harness/gap-priv-authz-prove-flake-honesty.md:94`：

> This knife is **STOP**. A later, separate REQUEST would be required before anyone is authorized to run a first prove whose log is teed with `PROCESS_EXIT` from the start. This commit does not run that prove and does not authorize coding. Do not run `pnpm privacy-authorization:prove`. Do not touch uc025, uc004, uc018, `apps/worker/src/checkpoint-principal.ts`, or any proof.

同义句在 slice `:53`、backlog `:298`、checklist `:594`、矩阵 `:366`。这是对未来 REQUEST 的要求，不是本提交自己的授权。

`apps/worker/src/checkpoint-principal.ts` blob 在 close 父与 `2ec9d41` 同为 `fc354f0b41a9a1b09e5efa2c45b43e3190ae2654`。principal touched：**no**。

## 5. coveredCount=8，无 HA — 通过

关账销钉（`harness/gap-priv-authz-prove-flake-honesty.md:96`，slice `:55`，backlog `:299`，checklist `:595`，矩阵 `:366`）：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。

coveredCount 仍是 **8**。没有 HA。UC-052 行仍 **partial**。UC-018 未被本 diff 写成 covered。

## 6. 抽查

- 关账没有重跑的树证据：receipt 目录无新文件，JSON/log blob 与 FAIL 时相同，提交说明写 STOP / no prove was run。本审查自己也没有重跑。
- 旧增补页脚仍留着 `*Slice oneshot · attempt=1 · EXIT=0 *`（slice 关账前的那一行）与 harness 旧节 `*Oneshot · attempt=1 · EXIT=0 *`。关账写明「上面那一节保持增补原文，本节只记录不同意」（`harness/gap-priv-authz-prove-flake-honesty.md:98`）。这不是把 oneshot 改写成 post-prove PASS，也不是往 log 里补 EXIT。不构成阻塞。
- 审查落笔时 `origin/feat/mysql-schema-skeleton` 在 `f2de066d57b41e8f66842b5bbd0408a9fe61e9c1`（`review(privacy): Line A' flake honest-close PASS (mw-privacy-int)`），`2ec9d41` 是其祖先。其后 `76d2bc3` 只追加 UC-025 FINAL NAIL，并写明 A' oneshot-disagreement 保持原样、不要改 flake 行。`f2de066` 只新增 privacy 审查文件。两处都没有改 oneshot blob，没有 attempt-2，没有改 principal。不采信、不代签该 privacy PASS。
- 记录的 prove SHA 仍是 JSON 里的 `5b6e693e5e8b253da6c889a46aee331a8a6f5ccd`。关账没有改它。

## 7. 条件

1. 本 PASS 只承认关账没有作弊。`3811cf1` 仍然成立：JSON `"exit": 0` 与没有可引用 EXIT 的 log 仍不同意。
2. `GAP-PRIV-AUTHZ-PROVE-FLAKE` 仍 OPEN · mitigated/cause-unknown。不是 fixed，不是 closed，不是 root-caused。
3. 本 PASS ≠ 编码授权 ≠ nail ≠ HA ≠ covered。不得据此改 `apps/worker/src/checkpoint-principal.ts`，不得把本文件当成第一次 teed prove 的授权。再跑第一次之前必须另有 REQUEST。
4. 销钉保持：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。
5. alone ≠ dual。不代签 mw-privacy-int（含 `7601503` 与 `f2de066`）。

## 8. 阻塞

无阻塞

## 9. 记账

| 项 | 值 |
| --- | --- |
| close | `2ec9d4106fa2b06017784cceea3359e37726f6d3` |
| parent | `d7966bf850678683c9733df96abee3ccc3ff2310` |
| standing FAIL | `3811cf1b47d3c3a939c2077b9c7386ab036069e6` |
| JSON blob | `8cc9db56079a60fc6410472632dbf4899952c9c2`（未变） |
| log blob | `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77`（未变；无 EXIT 行） |
| attempt-2 | 无 |
| oneshot called post-prove PASS | 否（does not yet satisfy post-prove） |
| gap | OPEN · mitigated/cause-unknown |
| future REQUEST | 要求另一次，本提交不授权 |
| principal touched | no |
| coveredCount | 8 |
| HA | 无 |
| blockers | 无阻塞 |

Verdict: PASS
