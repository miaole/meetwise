# Review — mw-e2e-ha — GAP-PRIV-AUTHZ-PROVE-FLAKE oneshot post-prove

**Reviewer**: mw-e2e-ha（alone ≠ dual · 不代签 mw-privacy-int）
**Subject tip**: `0da63bf7798f2c018624e2fcfab313891abc232b`
**Subject message**: `docs(privacy): GAP-PRIV-AUTHZ-PROVE-FLAKE oneshot attempt 1 EXIT 0`
**Parent / recorded prove SHA**: `5b6e693e5e8b253da6c889a46aee331a8a6f5ccd`
**Read-only**: `git show` / `git diff-tree` / `git ls-tree` / `git rev-parse` / `git merge-base --is-ancestor`。未跑 `pnpm privacy-authorization:prove`。未起 Postgres。未起 Docker。未改产品。

PASS ≠ nail ≠ HA ≠ coding ≠ covered。一次第一跑的 EXIT 0 是条件，不是关闭。

---

## 1. 恰好一次？JSON EXIT 与 log EXIT 必须同时可引用且一致 — 不通过

树 `0da63bf` 的 `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/` 只有两份文件，没有 `oneshot-attempt-2.json`，没有 `oneshot-attempt-2.log`：

- JSON：`ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.json`
- log：`ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.log`

`git diff --name-only 5b6e693e5e8b253da6c889a46aee331a8a6f5ccd 0da63bf7798f2c018624e2fcfab313891abc232b` 只这四份文档：slice、harness、上述 JSON、上述 log。没有第二跑文件。

JSON 可引用的 EXIT（原文）：

```json
"exit": 0
```

同文件 `"attempt": 1`，`"command": "pnpm privacy-authorization:prove"`。

log（72 行）**不能引用 EXIT**。`git show` 全文检索无 `EXIT=`、无 `exit code`、无 `ELIFECYCLE`。结尾两行是：

```
✓ PrivacyAuthorizationIssuer DB 证明通过（本地隔离证据）
LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/isolated-proof-receipts/2026-10-03T05-26-57-517Z-1569581-1bf730ae-702a-481b-a046-0ae8b4d00d7d.json release_evidence=false
```

成功横幅不是进程退出码。同库红日志 `logs/cold-5.log` 用 `ELIFECYCLE Command failed with exit code 1.` 留下可引用的 exit code；这份绿日志没有对应的 `exit code 0`。因此 JSON 的 `"exit": 0` 与 log **不能同意**：log 侧没有可引用的 EXIT。

这不是「用第二跑把红换成绿」。log 里只有一次 `privacy-authorization:prove` 脚本头。`E2E_POSTGRES_READY label=boot consecutive=3 attempt=4`（以及 post-migrate / pre-prove 的 `attempt=3`）是隔离库就绪轮询，不是第二次 `pnpm privacy-authorization:prove`。尝试次数按 prove 计为 **1 个文件对**，但 EXIT 仍不可从 log 引用，条件 1 不成立。

## 2. 命令 — 这一项本身成立，不能补上 EXIT

JSON 原文：`"command": "pnpm privacy-authorization:prove"`。

log 脚本头：

```
> meetwise@0.1.0 privacy-authorization:prove /workspace/meetwise-a-oneshot
> node scripts/run-e2e-isolated.mjs privacy-authorization:prove:raw
```

命令名与 JSON 一致。这不把缺失的 log EXIT 变成可引用。

## 3. 记录的 prove SHA — 提交存在，log 未写 SHA，不是本 FAIL 的理由

JSON / slice / harness 都写 prove SHA `5b6e693e5e8b253da6c889a46aee331a8a6f5ccd`。该对象是 commit，且是 `0da63bf` 的父提交。它是：

`review(e2e): UC018 flip-ban post-prove PASS @ad37bbb (mw-e2e-ha)`

作者 `mw-e2e-ha <mw-e2e-ha@meetwise.local>`，时间 `2026-10-02 22:24:21 -0700`。harness 写的是 “pre-commit HEAD, before this supplement”，与父子关系相符。log **没有**写入任何 git SHA，因此没有「log 里的另一个 SHA」可构成冲突。不因 SHA 判 FAIL。也不把「父提交恰好是本审以前的 UC-018 审查」当成 prove SHA 为假。

## 4. Gap 文案 — 未关（这一项本身不是失败）

slice 增补与 harness 增补都写：`GAP-PRIV-AUTHZ-PROVE-FLAKE` stays **OPEN**，mitigated/cause-unknown。原文包括 Not fixed、Not closed、Not root-caused、One green is not a close。JSON：`"gapStatus": "OPEN"`，`"cause": "unknown"`，`"mitigation": "mitigated/cause-unknown"`，`"notClosed": true`，`"notRootCaused": true`，`"oneGreenIsNotAClose": true`。

没有因为 EXIT 0 把行写成 fixed / closed / root-caused。`0da63bf..origin` 的 backlog diff 没有碰到 `GAP-PRIV-AUTHZ-PROVE-FLAKE` 行。slice blob `72f133c46316df113559a0392e718ba743071c08` 与 harness blob `ad4180ea88c6e109187937a3ccdca39768650b94` 在审查时的 origin 上未变。

## 5. principal / UC-052 产品 — 未改

`0da63bf` 的 diff 没有 `apps/worker/src/checkpoint-principal.ts`，没有 `apps/worker/`，没有 `.ts`，没有 `package.json`。该文件 blob 在 `5b6e693`、`0da63bf`、以及审查时 origin 上同为 `fc354f0b41a9a1b09e5efa2c45b43e3190ae2654`。principal touched：**no**。

## 6. 销钉 — 未翻

slice / harness 销钉仍是：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。

coveredCount 仍是 **8**。没有 HA 声称。log 自身写 `release_evidence=false`，开头仍有 Not HA / local green ≠ HA。UC-052 仍 **partial**。UC-018 未在本 diff 里写成 covered。

## 7. 抽查（非本 FAIL 的阻塞）

- 审查时 `origin/feat/mysql-schema-skeleton` 已前移到 `0652a082c25228d85d8e4f21da4934ba41b14f50`。`0da63bf` 仍是其祖先。其后 `7601503`、`e0842d0`、`0652a08` 未改 oneshot JSON/log/slice/harness。JSON blob `8cc9db56079a60fc6410472632dbf4899952c9c2`、log blob `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77` 在 origin 上与 `0da63bf` 相同。
- 不采信、不代签 `7601503` 的 mw-privacy-int PASS。alone ≠ dual。
- 本 FAIL 不是「刷绿闭环」，也不是「gap 被写成关闭」，也不是 principal 被改。唯一阻塞是 log EXIT 不可引用，因而与 JSON `"exit": 0` 不能同意。

## 8. 条件

1. 即便把 JSON 的 `"exit": 0` 当成真，单次第一跑 EXIT 0 也不得把 `GAP-PRIV-AUTHZ-PROVE-FLAKE` 写成 closed / fixed / root-caused。本 FAIL 不改变这条。
2. 历史账本 `prove_tip_authz` exit 0 与 v2 20/20 仍不是本 oneshot 的关闭依据。
3. 本 FAIL ≠ coding 授权。不得据此改 `apps/worker/src/checkpoint-principal.ts`，不得再跑一次 prove 去补 EXIT（retry-to-green 仍禁止），不得把本文件当成 covered 或 HA。
4. 销钉保持：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。
5. alone ≠ dual。本文件不是 mw-privacy-int 的签名。PASS ≠ nail ≠ HA ≠ coding ≠ covered。

## 9. 阻塞

1. log `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.log` 没有可引用的 EXIT。JSON `"exit": 0` 无法与 log 的 EXIT 同意。EXIT 不能从 log 引用，故 FAIL。

## 10. 记账

| 项 | 值 |
| --- | --- |
| tip | `0da63bf7798f2c018624e2fcfab313891abc232b` |
| prove SHA recorded | `5b6e693e5e8b253da6c889a46aee331a8a6f5ccd`（存在；UC-018 flip-ban post-prove PASS；`0da63bf` 的父提交；log 未写 SHA） |
| JSON | `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.json` |
| log | `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.log` |
| JSON EXIT | `"exit": 0` |
| log EXIT | 不可引用（无 exit code / ELIFECYCLE / EXIT=） |
| command | `pnpm privacy-authorization:prove` |
| attempt count | 1 个 attempt-1 文件对；无 attempt-2；不是用第二跑替换红 |
| flake | 仍 OPEN · mitigated/cause-unknown · 未 fixed · 未 closed · 未 root-caused |
| principal touched | no |
| coveredCount | 8 |
| HA | 无（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false） |
| blockers | log EXIT 不可引用，与 JSON 不能同意 |

Verdict: FAIL
