# Harness — **GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot**（Line A'' · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · gap stays OPEN）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban self-approve · Ban coding · 本 commit 不运行 prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · **canHonestlyFlip=false**
**Date**: 2026-10-03
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`f3cf84c`** / full `f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b`（A' FINAL HONEST CLOSE · docs tip · not a prove tip）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-a2` · branch `line/a2-priv-authz-flake`（一切 git 写操作只在此 worktree）
**Knife**: **GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot**
**Gap id**: **`GAP-PRIV-AUTHZ-PROVE-FLAKE`**（backlog row stays **OPEN** · status **mitigated/cause-unknown**）
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST open only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit（本 commit） · Ban product edits

## Why a new REQUEST（A' 收口后的残余缺陷）

A' FINAL `f3cf84c` 已诚实收口文档，但 FAIL `3811cf1` / `3811cf1b47d3c3a939c2077b9c7386ab036069e6` 仍然成立：

- attempt-1 JSON `receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.json` 写 `"exit": 0`；
- attempt-1 log `receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.log`（72 行）**没有** `EXIT=`、没有 exit code、没有 `ELIFECYCLE` —— 成功横幅不是进程退出码；
- JSON EXIT 与 log EXIT **不能同意**，oneshot 不满足 post-prove。这就是本刀要修的证据缺陷。

Flake 根因仍未钉死（ECONNREFUSED `127.0.0.1:33047` 冷启失败 + SQLSTATE 23505 `interview_pkey` warm 冲突，两类失败都保留；v2 20/20 绿不是根因）。本刀**不**修根因、**不**改产品；只授权一次「从第一字节就 tee、log 自带 `PROCESS_EXIT=<n>`」的第一跑，把 EXIT 证据补成可引用。

## Ask（授权范围 · 仅此一次）

预执行双审 BOTH PASS（mw-privacy-int + mw-e2e-ha 各自 PASS，alone ≠ dual）**且**协调方（meetwise bot）显式授权后，实现方（mw-core）才被允许跑 **恰好一次**：

```bash
# 唯一授权形态 · 在 worktree /Users/miaole/Desktop/golucky/meetwise-line-a2 下执行
set -o pipefail
LOG=ai-docs/delivery/receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log
pnpm privacy-authorization:prove 2>&1 | tee "$LOG"
rc=$?
printf '\nPROCESS_EXIT=%s\n' "$rc" | tee -a "$LOG"
```

命令链（package.json L268）：`pnpm privacy-authorization:prove` → `node scripts/run-e2e-isolated.mjs privacy-authorization:prove:raw`。**禁止**改用其它入口、禁止绕过 tee 直跑、禁止把 `:raw` 单独拉出来跑。

## EXIT 契约（一句话）

**恰好一次跑；log 从第一字节起由同一条 shell 的 `tee` 捕获，末行必须是由 `pipefail` 捕获真实进程退出码生成的字面行 `PROCESS_EXIT=<n>`，attempt-2 JSON 的 `"exit"` 必须等于同一 `<n>`；n=0 是绿、n≠0 是红，两者都是诚实可收的证据，一律不重跑、不返工、不关 gap。**

`PROCESS_EXIT` 格式约定：

- 行格式严格为 `PROCESS_EXIT=<n>`（`<n>` 为十进制整数，pnpm 进程的真实退出码，经 `set -o pipefail` 捕获）；
- 该行必须是 run 的同一 shell 在进程退出后立即写进 teed log（`tee -a` 追加到本次 run 自己的新 log），**不是**事后手补；
- 除此行外，红跑还应保留 pnpm 自身的 `ELIFECYCLE Command failed with exit code N.` 行作为第二可引用标记。

## attempts 规则

- attempt=1（`oneshot-attempt-1.json` / `oneshot-attempt-1.log`）是**冻结历史**：blob 锚 JSON `8cc9db56079a60fc6410472632dbf4899952c9c2`、log `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77`。禁止修改、禁止追加、禁止 forge。
- 本刀只授权 **attempt=2 新文件对**：
  - log：`ai-docs/delivery/receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log`
  - JSON：`ai-docs/delivery/receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.json`
- 新 log 由本次 run 的 tee 全新创建；**禁止**把 attempt-2 输出写进 attempt-1 log 或任何旧 log。
- 全刀 prove 恰好一次（log 内只允许出现一个 `privacy-authorization:prove` 脚本头；隔离库就绪轮询如 `E2E_POSTGRES_READY attempt=k` 不算第二跑）。无 attempt-3；第二次跑即违约。
- 若 run 中途被杀、log 未落 `PROCESS_EXIT=` 行：如实补一篇 docs 记录「证据缺陷仍在」，不得擅自重跑；重跑需新 REQUEST。

## attempt-2 JSON 最低字段（与 attempt-1 同构 + teed 新增）

```json
{
  "attempt": 2,
  "command": "pnpm privacy-authorization:prove",
  "proveSha": "<pre-commit HEAD full SHA>",
  "exit": <n>,
  "processExitLine": "PROCESS_EXIT=<n>",
  "teeFromStart": true,
  "attempt1FilesUntouched": true,
  "gapStatus": "OPEN",
  "cause": "unknown",
  "mitigation": "mitigated/cause-unknown",
  "notClosed": true,
  "notRootCaused": true,
  "oneGreenIsNotAClose": true,
  "retryToGreenBanned": true
}
```

## NEG / 正控预期

正控（绿，EXIT=0）：

- log 含成功横幅（如 `✓ PrivacyAuthorizationIssuer DB 证明通过（本地隔离证据）`、`release_evidence=false`）**且末行是字面 `PROCESS_EXIT=0`**；
- JSON `"exit": 0` 与 log 行一致 → EXIT 证据成立；**绿 ≠ 关 flake**，gap 仍 OPEN / mitigated-cause-unknown。

NEG（红，EXIT≠0）：

- log 含 `ELIFECYCLE Command failed with exit code N.` **且末行是字面 `PROCESS_EXIT=N`**；
- JSON `"exit": N` 与 log 行一致 → 这是 flake 的**有效诚实证据**，不是本刀失败，更不是重跑理由。

NEG（证据缺陷，判 FAIL —— 与 `3811cf1` 同类）：

- log 有成功横幅但没有可引用的 `PROCESS_EXIT=` 行；
- `PROCESS_EXIT` 行出现在旧 log、或由事后手补/手改产生；
- attempt-1 文件 blob 与锚不一致（被改）；
- log 内出现两个 `privacy-authorization:prove` 脚本头（retry-to-green）；
- 出现 attempt-3 文件或任何第二跑痕迹；
- JSON `"exit"` 与 log `PROCESS_EXIT=<n>` 不一致。

## 跑完后诚实 SSOT（post-run docs supplement，另行 commit）

- 绿 ≠ 关 flake。`GAP-PRIV-AUTHZ-PROVE-FLAKE` 仍 **OPEN** / **mitigated-cause-unknown**，除非真根因被钉死**且**双审同意（默认不关）。
- `canHonestlyFlip=false`：单次 teed 跑的 EXIT（无论 0 或非 0）不构成把该行翻成 closed/fixed/root-caused 的诚实依据。
- SSOT（matrix / backlog / checklist）的更新发生在 post-run 的 docs supplement；本 REQUEST commit 不碰这三个文件。

## Ban（逐条）

1. **Ban retry-to-green**：红/绿都不许用第二次跑换结果； Ban 把历史 v2 20/20 或 attempt-1 EXIT 0 当关闭依据。
2. **Ban 重跑第二次**：本刀 prove 恰好一次；无 attempt-3；授权仅覆盖上列唯一 CMD 形态。
3. **Ban forge `PROCESS_EXIT` 到旧 attempt-1**：禁止修改 / 追加 / 重写 `oneshot-attempt-1.json`、`oneshot-attempt-1.log`（blob 锚见上）。
4. **Ban 关 UC-052 covered**：UC-052 stays **partial**；Do not write covered；Do not flip UC-018；coveredCount=**8** 不变。
5. **Ban 改 `apps/worker/src/checkpoint-principal.ts`**：本刀零产品代码改动；同时 Ban 任何 `apps/`、`packages/`、`package.json`、migration、script 改动。
6. Ban coding · Ban push · Ban force-push · Ban self-approve · Ban 代签 peer · alone ≠ dual。
7. Ban secrets / `.env*` 入库；隔离库输出如被 `ISOLATED_POSTGRES_OUTPUT_WITHHELD` 拒绝，如实记录，Ban 绕过。

## Review stubs（pre-exec dual · 本 commit 后立即待审）

| Expert | Path | Status |
|--------|------|--------|
| `mw-privacy-int` | `reviews/REQUEST-2026-10-03-gap-priv-authz-prove-flake-teed-oneshot-mw-privacy-int.md` | **PENDING** |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-03-gap-priv-authz-prove-flake-teed-oneshot-mw-e2e-ha.md` | **PENDING** |

预执行双审 BOTH PASS → 协调方（meetwise bot）授权 → 才允许按上文唯一 CMD 跑一次 prove（attempt=2 新文件）。

## Receipt 落点

| 文件 | 路径 | 说明 |
|------|------|------|
| attempt-2 log | `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log` | tee 全量 stdout/stderr + 末行 `PROCESS_EXIT=<n>` |
| attempt-2 JSON | `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.json` | 字段见上节 |
| attempt-1（冻结） | `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.json` / `.log` | 不改 · blob 锚 `8cc9db5…` / `e8d0fbe…` |

## Pins

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · Stack=**PG-retained** · public DELETE=**503**（stays） · **canHonestlyFlip=false** · gap stays **OPEN** · STOP

*Harness · GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot · draft:awaiting_pre_exec_dual · OPEN mitigated/cause-unknown · 本 commit 不运行 prove · STOP*
