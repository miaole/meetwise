# REQUEST — **GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-privacy-int`
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

---

# PRE-EXEC dual · GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot · mw-privacy-int（docs gate only · Ban prove · Ban product edit）

**Status**: pre-exec dual PASS（mw-privacy-int 侧 · alone ≠ dual · 不代签 mw-e2e-ha）
**被审 SHA**: `97d8889` / `97d8889bb2aa4fece1cdc1800a1685994d50e993`（docs-only · 4 个新增 md · +273/−0 · parent=`f3cf84c` 与 stub/harness 声明的基线 tip 一致）
**审查 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-a2-privacy-int`（branch `rv/a2-privacy-int` @ tip `f44d8da` · `git merge-base --is-ancestor 97d8889 HEAD` EXIT=0）
**Ban prove 合规**: 本审查未运行 `pnpm privacy-authorization:prove`（本刀仍预执行）；全部证据为 git / 文件只读取证。

## 检查表（file:line 证据）

1. **docs-only 确认**：`git show --stat 97d8889` 仅 4 个新增 md（slice / harness / 双 stub），+273/−0；未触碰 `apps/` / `packages/` / `package.json` / migrations / scripts；未触碰 SSOT（`e2e-requirement-coverage-matrix.md` / `gap-bug-backlog.md` / `execution-master-checklist.md` 在 97d8889 改动清单中 0 命中）；attempt-2 文件未预创建（`ai-docs/delivery/receipts/gap-priv-authz-prove-flake/` 现仅 attempt-1 两文件）。
2. **Ban 改 attempt-1 有 blob 锚、非空话**：stub L33、harness L50/L110、slice L38 均禁改 `oneshot-attempt-1.json` / `.log` 且给出 blob 锚；本审实测 `git rev-parse HEAD:ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.json` = `8cc9db56079a60fc6410472632dbf4899952c9c2`、`…oneshot-attempt-1.log` = `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77`，与锚**逐字一致**；harness L95 把"blob 与锚不一致"列为 post-run FAIL 判据。
3. **tee 从第一字节 + 可引用 `PROCESS_EXIT=<n>`**：harness L28-34 唯一 CMD 形态（`set -o pipefail` + `2>&1 | tee "$LOG"` + `printf '\nPROCESS_EXIT=%s\n' "$rc" | tee -a "$LOG"`），`pipefail` 下 `rc` 即 pnpm 真实退出码；L40 EXIT 契约一句话；L43-46 明确"同一 shell 进程退出后立即写入、不是事后手补"，红跑还须保留 pnpm 自身 `ELIFECYCLE` 行作第二标记；L94 把"`PROCESS_EXIT` 出现在旧 log / 事后手补"列为 FAIL。stub L27、slice L11 同口径；log 路径与 receipt 落点（harness L125-131）一致。
4. **一次跑 / 禁 retry-to-green / 禁第二次**：stub L31-32、harness L55（prove 恰好一次 · 无 attempt-3 · 第二次即违约）、L96-97（两个脚本头或 attempt-3 痕迹=FAIL）、L56（中途被杀/缺 `PROCESS_EXIT=` 行 → 如实记录"证据缺陷仍在"，不得擅自重跑，重跑需新 REQUEST）。
5. **EXIT≠0 也是诚实证据（不 wash）**：harness L40（n=0 是绿、n≠0 是红，两者都是诚实可收证据）、L86-89（红=有效诚实证据，不是本刀失败、更不是重跑理由）；attempt-2 JSON 模板含 `notClosed` / `notRootCaused` / `oneGreenIsNotAClose` / `retryToGreenBanned`（harness L60-77）。
6. **绿 ≠ 关 flake**：stub L27 与 Pin 表 L23（`canHonestlyFlip=false`）、harness L102-103（默认不关 · 除非真根因钉死且双审同意）、L84、slice L11；attempt-2 JSON 模板 `gapStatus:"OPEN"` / `cause:"unknown"` / `mitigation:"mitigated/cause-unknown"`；SSOT 现状 `gap-bug-backlog.md:68` = OPEN / mitigated-cause-unknown，本刀不改该行，口径一致。
7. **禁碰产品 / UC-052 / DELETE=503**：stub L34-35、harness L111-112（Ban `apps/worker/src/checkpoint-principal.ts` 与一切 apps/packages/package.json/migration/script 改动 · UC-052 stays partial · Do not write covered · Do not flip UC-018 · coveredCount=8 不变）；实测该文件存在且 97d8889 未触碰；`e2e-covered-path-backlog.md:38` UC-052 仍 partial、DELETE 保持 503。
8. **Pins 原值未改口**：stub L4+L13-23、harness L4+L135、slice L4+L44：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · canHonestlyFlip=false —— 四个新文件逐字一致，无省略/松动。
9. **JSON/log 同意规则 + receipt 落点 + attempt-2 JSON 最低字段可执行**：harness L40/L84/L89/L98（attempt-2 JSON `"exit"` 必须等于同一 log `PROCESS_EXIT=<n>`；不一致=FAIL）；L125-131 receipt 表（attempt-2 log/JSON 新文件对 + attempt-1 冻结行）；L60-77 JSON 最低字段含 `attempt:2`、`command`、`proveSha`（pre-commit HEAD full SHA）、`exit`、`processExitLine`、`teeFromStart:true`、`attempt1FilesUntouched:true` 及五条诚实字段，逐项可机检。
10. **FAIL `3811cf1` 教训对齐（实物复核）**：attempt-1 JSON 写 `"exit": 0` 而 log 72 行 0 处 `EXIT=` / `ELIFECYCLE` / `exit code`（实测 grep），成功横幅不是进程退出码——harness L15-21 对缺陷的描述与实物一致；命令链 harness L36 与 `package.json:268`（`privacy-authorization:prove` → `node scripts/run-e2e-isolated.mjs privacy-authorization:prove:raw`）一致；harness L55 的 `E2E_POSTGRES_READY attempt=k` 不算第二跑的豁免与真实 log 输出形态相符。
11. **授权链正确**：stub L41、harness L25/L123（双审 BOTH PASS **且**协调方 meetwise bot 显式授权后实现方才允许跑一次；本 commit 不运行 prove、不 self-authorize）；Ban self-approve / alone ≠ dual / 不代签 peer 三文件口径一致（stub L3/L37/L41、harness L10/L113/L116-123、slice L30/L42）。

## Fail-trigger audit

- 事后手改旧 log / forge `PROCESS_EXIT` 到 attempt-1：明文禁（stub L33、harness L94/L110）+ blob 锚可机检（本审已验相符）→ 本 commit 无触发。
- retry-to-green / 第二跑 / attempt-3：明文禁（stub L31-32、harness L55/L96-97），红绿都不许换结果 → 本 commit 无触发。
- 绿被写成关 flake / `canHonestlyFlip` 被翻 true：明文禁（harness L102-103），默认保持 OPEN → 本 commit 无触发。
- 产品代码 / UC-052 covered / DELETE≠503 / SSOT 被本 commit 改动：均未发生（docs-only 实测）→ 无触发。
- Pins 省略或松动：四个文件原值完整一致 → 无触发。
- JSON/log 不同意或 EXIT 不可引用：harness L91-98 已把 `3811cf1` 同类缺陷全部列为 post-run FAIL 判据 → 本 commit 无触发（post-run 适用）。

## Blockers

无（docs gate 维度无阻塞项）。

## Conditions（C-* · binding）

- **C-1【脚本头计数口径】**：post-run 判"两个 `privacy-authorization:prove` 脚本头"（harness L55/L96）必须按 pnpm 顶层脚本头行计数（形如行首 `> meetwise@<ver> privacy-authorization:prove <cwd>`），不得按裸子串计数：合法单跑 log 内子串会出现 2 次（attempt-1 log L2 头行 + L3 `run-e2e-isolated.mjs privacy-authorization:prove:raw` 参数行，实测）。
- **C-2【EXIT 引用口径】**：attempt-2 的可引用 EXIT 证据 = log 末（非空）行字面 `PROCESS_EXIT=<n>`；若 n≠0 还须保留 pnpm 自身 `ELIFECYCLE Command failed with exit code N.` 行；attempt-2 JSON `"exit"` 必须逐字等于同一 `<n>`，否则按 `3811cf1` 同类判 FAIL。
- **C-3【锚复核】**：post-run 双审须机检 attempt-1 blob 仍等于 `8cc9db56079a60fc6410472632dbf4899952c9c2` / `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77`，任何漂移=FAIL。
- **C-4【不关口】**：无论 EXIT 0 或非 0，`GAP-PRIV-AUTHZ-PROVE-FLAKE` 保持 OPEN / mitigated-cause-unknown、`canHonestlyFlip=false` 不翻；SSOT（matrix / backlog / checklist）只允许在 post-run docs supplement 更新（本 REQUEST 已验证未碰）。
- **C-5【授权前置】**：双审 BOTH PASS ≠ 授权——还需协调方（meetwise bot）显式授权；mw-e2e-ha 侧 PASS 由其自签，本审不代签、alone ≠ dual。
- **C-6【执行落点】**：prove 恰好一次且只在实现方 worktree `/Users/miaole/Desktop/golucky/meetwise-line-a2`（branch `line/a2-priv-authz-flake`，本审已确认存在并检出）按 harness L28-34 唯一 CMD 形态执行；中断/缺 `PROCESS_EXIT=` 行 → 如实记录"证据缺陷仍在"，重跑须新 REQUEST。

## 中文摘要（3 行）

1. `97d8889` 为 docs-only REQUEST（4 新增 md、+273/−0，未碰产品与 SSOT），把 FAIL `3811cf1` 的证据缺陷转成可执行的 attempt-2 授权：第一字节 tee、`pipefail` 捕获真实退出码、log 末行字面 `PROCESS_EXIT=<n>`、JSON 与 log 同一 `<n>`，attempt-1 以本审实测相符的 blob 锚冻结禁改。
2. 一次跑、禁 retry-to-green、红绿都算诚实证据且默认不关 flake（`canHonestlyFlip=false`、gap 保持 OPEN/mitigated-cause-unknown），UC-052 stays partial、`checkpoint-principal.ts` 与公开 DELETE=503 全部禁碰，九项 Pins 原值零松动。
3. mw-privacy-int 侧 PRE-EXEC dual PASS（C-1~C-6 为约束条件，C-1 要求脚本头按顶层头行计数而非裸子串）；alone ≠ dual，不代签 mw-e2e-ha，实际 prove 仍须协调方授权后按唯一 CMD 执行一次。

Verdict: PASS
