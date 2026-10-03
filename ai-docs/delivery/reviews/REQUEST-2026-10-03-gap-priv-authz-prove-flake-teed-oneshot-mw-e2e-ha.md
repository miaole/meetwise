# REQUEST — **GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-priv-authz-prove-flake-teed-oneshot.md` · slice `gap-priv-authz-prove-flake-teed-oneshot.slice.md`
**基线 tip**: `f3cf84c`（A' FINAL HONEST CLOSE · full `f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b` · not a prove tip）
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-a2` · `line/a2-priv-authz-flake`
**Date**: 2026-10-03

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `canHonestlyFlip` | **false**（本刀钉死 · 绿 ≠ 关 flake） |

## 范围 / 背景

Line A''：修 A' 遗留证据缺陷。FAIL `3811cf1`：attempt-1 JSON `"exit": 0` 与 log（无可引用 `EXIT=` / exit code / `ELIFECYCLE`）不能同意 → oneshot 不满足 post-prove。本 REQUEST 授权（预执行双审 BOTH PASS + 协调方授权后）**恰好一次** teed 跑：`pnpm privacy-authorization:prove` 从第一字节 tee 到新 log `receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log`，末行必须是由 `pipefail` 捕获真实进程退出码的字面行 `PROCESS_EXIT=<n>`；attempt=2 JSON `"exit"` 必须等于同一 `<n>`。attempt=1 文件冻结不改。gap `GAP-PRIV-AUTHZ-PROVE-FLAKE` 仍 **OPEN** / mitigated-cause-unknown；绿 ≠ 关；真根因未钉死前默认不关（`canHonestlyFlip=false`）。

## 禁碰 / Ban（逐条）

1. **Ban retry-to-green**（红/绿都不许再跑换结果；历史 v2 20/20、attempt-1 EXIT 0 都不是关闭依据）。
2. **Ban 重跑第二次**（prove 恰好一次 · 无 attempt-3 · 只允许 harness 列出的唯一 CMD 形态）。
3. **Ban forge `PROCESS_EXIT` 到旧 attempt-1**（禁改 `oneshot-attempt-1.json` / `oneshot-attempt-1.log` · blob 锚 `8cc9db56079a60fc6410472632dbf4899952c9c2` / `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77`）。
4. **Ban 关 UC-052 covered**（UC-052 stays **partial** · Do not write covered · Do not flip UC-018 · coveredCount=8 不变）。
5. **Ban 改 `apps/worker/src/checkpoint-principal.ts`**（零产品代码改动 · Ban `apps/` / `packages/` / `package.json` / migrations / scripts 改动）。

Ban coding · Ban push · Ban force-push · Ban self-approve · Ban secrets / `.env*`。本 stub 不是 nail、不是 HA、不是 covered、不是 coding 授权。

## 流程

本 stub 为 pre-exec 审查入口：`mw-privacy-int` PASS + `mw-e2e-ha` PASS（**BOTH**，alone ≠ dual）→ 协调方（meetwise bot）授权 → 实现方按 harness 唯一 CMD 跑 prove 一次（attempt=2 新文件）→ post-run docs supplement 诚实 SSOT + post-prove 双审另起。本 commit 本身不运行 prove。

---

*Stub · awaiting expert pre-exec dual · STOP*
