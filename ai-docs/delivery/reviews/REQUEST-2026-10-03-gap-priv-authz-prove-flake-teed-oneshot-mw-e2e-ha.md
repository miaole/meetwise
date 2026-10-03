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

---

# PRE-EXEC dual · GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot · mw-e2e-ha（docs gate only · Ban prove · Ban product edit）

**Reviewer**: mw-e2e-ha（adversarial evidence-honesty · alone ≠ dual · 不代签 mw-privacy-int · PASS ≠ nail ≠ HA ≠ coding ≠ covered）
**被审 SHA**: `97d8889bb2aa4fece1cdc1800a1685994d50e993`（origin/feat/mysql-schema-skeleton · 审查时 tip `f44d8daf3a2eb385d423d0d0d4d8aa2c477cddf6` · `97d8889` 为其祖先）
**审查独立 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-a2-e2e-ha` · branch `rv/a2-e2e-ha`（本审查所有 git 写操作仅在此）
**只读手段**: `git fetch` / `git show` / `git diff-tree` / `git ls-tree` / `git rev-parse` / `git merge-base --is-ancestor` / `grep` / `ls`。**未跑** `pnpm privacy-authorization:prove`，未起 Postgres / Docker，未改产品 —— 本审查自身零 prove。

## 0. 被审对象核验（docs-only）

- `git merge-base --is-ancestor 97d8889 HEAD`（HEAD=`f44d8da`）→ 通过。
- `git diff-tree --no-commit-id --name-status -r 97d8889` → 仅 4 个新增 md（+273/-0）：`ai-docs/delivery/gap-priv-authz-prove-flake-teed-oneshot.slice.md`、`ai-docs/delivery/harness/gap-priv-authz-prove-flake-teed-oneshot.md`、`reviews/REQUEST-…-mw-e2e-ha.md`、`reviews/REQUEST-…-mw-privacy-int.md`。无 `apps/`、无 `packages/`、无 `package.json`、无 receipts、无 matrix/backlog/checklist（SSOT 三件在 diff 中零出现）。
- 本 commit 未运行 prove：被审树 receipts 目录仍只有 attempt-1 文件对；run worktree `/Users/miaole/Desktop/golucky/meetwise-line-a2`（branch `line/a2-priv-authz-flake` · HEAD `6673042` · tree `baf3c3cc9505aec5ecbb5ef1ab5c1a498e0556c5` 与 `97d8889` 的 tree 完全相同 · 工作区 clean）中也无 `teed-oneshot-attempt-2.*`。预执行状态干净。

## 1. FAIL `3811cf1` 机理复现 → 本 REQUEST 是否堵住

实测复现（对被审树执行）：

- `git show 97d8889:ai-docs/delivery/receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.log | wc -l` → **72** 行；
- 同文件 `grep -i -E "exit|elifecycle"` → **NO_MATCH**：无 `EXIT=`、无 exit code、无 `ELIFECYCLE` —— log 侧 EXIT 不可引用，成功横幅不是进程退出码；
- 同树 `oneshot-attempt-1.json` 第 5 行 `"exit": 0`（第 2 行 `"attempt": 1`、第 3 行 `"command": "pnpm privacy-authorization:prove"`）。

机理 = JSON EXIT 与 log EXIT 不能同意。堵住与否：本 REQUEST 的唯一 CMD（harness L28-34）= `set -o pipefail` + `pnpm privacy-authorization:prove 2>&1 | tee "$LOG"` + `rc=$?` + `printf '\nPROCESS_EXIT=%s\n' "$rc" | tee -a "$LOG"` —— log 末行由**真实退出码机器生成**，且 JSON `"exit"` 强制同值（harness L40/L66-67/L98）。**机理被正面堵住。**

## 2. 检查表（file:line 证据）

| # | 检查 | 结论 | 证据（file:line） |
|---|------|------|------|
| 1 | 一次跑钉死（Ban retry / Ban 第二跑 / 无 attempt-3） | ✓ | harness L55（log 内仅一个脚本头；隔离库就绪轮询不算第二跑；无 attempt-3；第二跑即违约）、L97；Ban1 L108、Ban2 L109；slice L36-37；stub L31-32；中途被杀 → 如实 docs、禁自跑（L56） |
| 2 | tee 从头覆盖 stdout+stderr | ✓ | harness L28-34 唯一 CMD：`2>&1 \| tee`（两流自第一字节进同一 tee）；JSON `teeFromStart:true`（L68）；红跑保留 `ELIFECYCLE` 二号标记（L46/L88） |
| 3 | `PROCESS_EXIT=<n>` 由真实退出码生成 | ✓ | `set -o pipefail` + `rc=$?` + `printf … \| tee -a`（L29-33）；格式契约 L44-45（非事后手补）；手补/手改 = FAIL 触发（L94） |
| 4 | JSON/log 强制同值 | ✓ | EXIT 契约 L40；JSON `"exit": <n>` + `"processExitLine": "PROCESS_EXIT=<n>"`（L66-67）；不一致 = FAIL 触发（L98） |
| 5 | EXIT≠0 也是可收诚实证据 | ✓ | L40（n≠0 是红，红也是诚实证据）、L89（红 = 有效诚实证据，非本刀失败、非重跑理由） |
| 6 | attempt-1 冻结 + blob 锚真实 | ✓ | 锚 JSON `8cc9db56079a60fc6410472632dbf4899952c9c2` / log `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77`（L50/L131）与 `git ls-tree 97d8889 -- ai-docs/delivery/receipts/gap-priv-authz-prove-flake/` 实测一致；Ban3 L110 |
| 7 | attempt-2 防改/防 forge | ✓（有条件） | 唯一文件名（L52-53）+ 单脚本头检测（L55/L96）+ attempt-3 禁（L97）+ JSON 字段 schema（L60-77，含 proveSha/attempt1FilesUntouched）；attempt-2 尚不存在故无法预钉 blob —— 防改锚定落点在 post-prove 双审（C-5） |
| 8 | 绿 ≠ 关 flake | ✓ | L84、L102-103（canHonestlyFlip=false、默认不关）；JSON `gapStatus:OPEN`/`cause:unknown`/`notClosed`/`notRootCaused`/`oneGreenIsNotAClose`/`retryToGreenBanned`（L70-76） |
| 9 | Ban 关 UC-052 covered | ✓ | harness L111（UC-052 stays partial · Do not write covered · Do not flip UC-018 · coveredCount=8）；slice L39 |
| 10 | Ban 碰 checkpoint-principal | ✓ | harness L112（零产品改动；Ban apps/ packages/ package.json/ migration/ script）；`97d8889` diff 无产品文件 |
| 11 | 公开 DELETE=503 保持 | ✓ | harness L4/L135 · slice L4/L44 · stub L4/L22 |
| 12 | Pins 原值 | ✓ | haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · canHonestlyFlip=false（harness L4/L135 · slice L4/L44 · stub L11-23） |
| 13 | 命令链真实存在 | ✓ | `package.json:268` `"privacy-authorization:prove": "node scripts/run-e2e-isolated.mjs privacy-authorization:prove:raw"` 与 harness L36 引用一致 |
| 14 | 双审前置 + 不代签 | ✓ | harness L10/L116-123（BOTH PASS → 协调方显式授权 → 才跑）；peer stub 仍 PENDING（mw-privacy-int stub L3）；本审只签 mw-e2e-ha |

## 3. Fail-trigger audit（harness L91-98 预置 NEG 判 FAIL 触发，逐条认账）

六条触发：① 有横幅无可引用 `PROCESS_EXIT=`；② `PROCESS_EXIT` 出现在旧 log 或事后手补/手改；③ attempt-1 blob 与锚不一致；④ log 内两个 `privacy-authorization:prove` 脚本头（retry-to-green）；⑤ attempt-3 文件或任何第二跑痕迹；⑥ JSON `"exit"` 与 log `PROCESS_EXIT=<n>` 不一致。均与本刀 FAIL `3811cf1` 的唯一阻塞（log EXIT 不可引用）同构且更严，**无遗漏类**：若手补 `PROCESS_EXIT=0` 盖在红跑上，会被同 log 内 `ELIFECYCLE Command failed with exit code N.`（N≠0）交叉戳穿；若整段伪造，post-prove 双审按 C-5 blob 锚定与首行/单脚本头检查拦截。audit 通过。

## 4. Blockers

无。唯一阻塞类（log EXIT 不可引用 → JSON/log 不能同意）已被本 REQUEST 的 pipefail + tee + `PROCESS_EXIT=<n>` 契约正面堵住；其余全部转为下列 Conditions 红线。

## 5. Conditions（C-*；违反任一 = post-prove 判 FAIL）

- **C-1 授权顺序**：仅当 `mw-privacy-int` 亲签 PASS（其 stub 由其本人签署）+ 本 PASS + 协调方（meetwise bot）显式授权后，实现方（mw-core）才可在 run worktree `/Users/miaole/Desktop/golucky/meetwise-line-a2`（branch `line/a2-priv-authz-flake`）按唯一 CMD 跑 prove **恰好一次**；禁其它入口、禁绕 tee 直跑、禁把 `:raw` 单独拉出来跑（harness L36）。alone ≠ dual：本 PASS 单独不构成跑的授权。
- **C-2 认可的 prove 命令与预期 EXIT 契约**（本审查唯一认可形态，逐字）：
  ```bash
  set -o pipefail
  LOG=ai-docs/delivery/receipts/gap-priv-authz-prove-flake/teed-oneshot-attempt-2.log
  pnpm privacy-authorization:prove 2>&1 | tee "$LOG"
  rc=$?
  printf '\nPROCESS_EXIT=%s\n' "$rc" | tee -a "$LOG"
  ```
  预期：log 末（非空）行 = 字面 `PROCESS_EXIT=<n>`，`<n>` 为 pnpm 进程真实退出码（`pipefail` 捕获，机器生成，非手补）；log 首（非空）行 = `privacy-authorization:prove` 脚本头（证 tee 从第一字节起、且全 log 仅此一个脚本头 = 恰好一次）；红跑须同时保留 `ELIFECYCLE Command failed with exit code N.` 且 N = PROCESS_EXIT；n=0 绿、n≠0 红，两者都是诚实可收证据。
- **C-3 JSON/log 同意**：`teed-oneshot-attempt-2.json` 的 `"exit"` 与 `"processExitLine"` 必须等于 log 实际 `PROCESS_EXIT=<n>`；字段不得少于 harness L60-77 schema（attempt=2 · command · proveSha=pre-commit HEAD full SHA · teeFromStart=true · attempt1FilesUntouched=true · gapStatus=OPEN · cause=unknown · oneGreenIsNotAClose=true 等）；不一致即 FAIL（harness L98）。
- **C-4 attempt-1 冻结**：post-prove 审查时 `oneshot-attempt-1.json`/`.log` blob 必须仍为 `8cc9db56079a60fc6410472632dbf4899952c9c2` / `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77`；任何变更即违约（forge）。
- **C-5 attempt-2 防改锚定**：attempt-2 文件在 pre-exec 时不存在、无法预钉 blob；因此 post-prove 双审必须当场以 `git ls-tree`/`git hash-object` 记录 attempt-2 log 与 JSON 的 blob SHA 并写入审记；锚定后两 blob 在分支上再发生任何变化 = 实现方事后改写证据，判 FAIL。
- **C-6 红也是证据**：EXIT≠0 = 有效诚实证据，不返工、不重跑、不启 attempt-3；中途被杀且 log 未落 `PROCESS_EXIT=` 行 → 如实 docs 补记「证据缺陷仍在」，重跑须新 REQUEST（harness L56）。
- **C-7 绿 ≠ 关**：`GAP-PRIV-AUTHZ-PROVE-FLAKE` 仍 **OPEN** / **mitigated-cause-unknown**；`canHonestlyFlip=false` —— 单次 teed 跑的 EXIT（0 或非 0）不构成把该行翻 closed/fixed/root-caused 的诚实依据，除非真根因被钉死且双审同意（默认不关）；SSOT 更新只发生在 post-run docs supplement（另行 commit），本 REQUEST 与本次授权均不碰 matrix/backlog/checklist。
- **C-8 产品与销钉红线**：零产品改动（含 `apps/worker/src/checkpoint-principal.ts`）；UC-052 stays **partial**、Do not write covered、Do not flip UC-018、coveredCount=**8**；公开 DELETE=**503** stays；全部 Pins 原值（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained）；本 PASS 不是 nail、不是 HA、不是 covered、不是 coding 授权。

## 6. 三行中文摘要

1. FAIL `3811cf1` 机理已实测复现（attempt-1 log 72 行无任何 `EXIT=`/`ELIFECYCLE`，JSON 独写 `"exit":0`，JSON/log 无法同意），本 REQUEST 用 `pipefail + 2>&1|tee + rc + printf PROCESS_EXIT` 的唯一 CMD 把 log 末行钉成真实退出码并强制 JSON 同值 —— 证据缺陷被正面堵住，一次跑 / Ban retry / 无 attempt-3 / 红也是证据全部有文可引。
2. attempt-1 双 blob 锚与树实测一致且冻结；attempt-2 因尚未存在无法预钉 blob，防改锚定落在 C-5（post-prove 双审当场记 blob SHA，锚后 blob 再变即 FAIL）；绿≠关、UC-052 partial、principal 零改动、DELETE=503、九项 Pins 原值全部保持，`97d8889` 本身 docs-only 且未跑 prove。
3. 无 Blockers，PASS 为条件通过：仅当 mw-privacy-int 亲签 PASS 且协调方显式授权后，才允许在 line-a2 worktree 按 C-2 唯一 CMD 跑恰好一次；本 PASS 不代签 mw-privacy-int、不关 gap、不是 coding/HA/covered 授权。

Verdict: PASS
