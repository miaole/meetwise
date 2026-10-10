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

---

# POST-PROVE dual · GAP-PRIV-AUTHZ-PROVE-FLAKE teed oneshot · attempt-2 · mw-e2e-ha（adversarial evidence-honesty · docs gate only · Ban prove · Ban product edit）

**Reviewer**: mw-e2e-ha（alone ≠ dual · 不代签 mw-privacy-int · 本 PASS ≠ nail ≠ HA ≠ covered ≠ coding）
**被审 tip**: `0c0ab169ab6c7b2a5f2ef092766462ec562fa201`（branch `line/a2-priv-authz-flake` · parent = REQUEST `6673042f8bcdc29cf6f10f99d0aa6a3c95e5a53b`）
**审查独立 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-a2p-e2e-ha` · branch `rv/a2p-e2e-ha`（本审查所有 git 写操作仅在此）
**手段声明**: 全部机检由本审自行计算（`git diff`/`git ls-tree`/`git hash-object`/`git merge-base --is-ancestor`/`git fetch`（只读）/`grep`/`wc`/`shasum`/`docker ps -a`（只读））。**未执行** `pnpm privacy-authorization:prove`（exactly-once：本审不得成为 attempt-3）；未起容器；未改产品。
**Pre-exec 前置（C-1 核验）**: 本审亲签 pre-exec PASS = `376aa8e`（author `mw-e2e-ha`）；peer 亲签 pre-exec PASS = `31d3b31`（author `mw-privacy-int`，末行 `Verdict: PASS`）。两 commit 真实存在且均为各自 reviewer 署名；**但 post-fetch 实测两 commit 均不可从 `origin/main`（`c424447`）或任何 remote ref 可达**（仅存于本地 review 分支 `rv/a2-e2e-ha` / `rv/a2-privacy-int`）——任务包所述「origin main」未获证实，记为观察项（不构成 C-1 FAIL：C-1 要求的是 peer 亲签 + 本审亲签 + 协调方授权，协调方授权见 receipt Authority 行，属 git 外行为）。`0c0ab16` 同样不在任何 remote（与禁 push 一致）。

## 0. diff 清单（6673042 → 0c0ab16，实测）

`git diff --name-status`：**仅 3 个新增文件**（+172/-0），全部在 `ai-docs/delivery/receipts/gap-priv-authz-prove-flake/`：`teed-oneshot-attempt-2.log`、`teed-oneshot-attempt-2.json`、`2026-10-03-teed-oneshot-attempt-2-receipt.md`。无 `apps/`、无 `packages/`、无 `package.json`、无 migration、无 script、无 `.env*`、无 SSOT 三件（matrix/backlog/checklist 零出现）。branch 全程 `f3cf84c..0c0ab16` 仅此两 commit，均 docs-only。run worktree `/Users/miaole/Desktop/golucky/meetwise-line-a2` 实测 HEAD=`0c0ab16` 且 `git status` clean（无未入库残留产物）。

## 1. 机检表（全部本审实测，不信任摘要）

| # | 检查 | 实测 | 结论 |
|---|------|------|------|
| 1 | log 行数 | `wc -l` = **74** | ✓ 与声称一致 |
| 2 | 首（非空）行 = 脚本头 | 第 2 行 `> meetwise@0.1.0 privacy-authorization:prove /Users/miaole/Desktop/golucky/meetwise-line-a2`（第 1 行为 pnpm 前导空行） | ✓ tee 自第一字节 |
| 3 | 行首 `^> meetwise@` 顶层头行计数 | **1** | ✓ 恰好一次跑 |
| 4 | `privacy-authorization:prove` 裸子串计数 | 2（第 2 行脚本头 + 第 3 行 `> node scripts/run-e2e-isolated.mjs privacy-authorization:prove:raw`，同一次 pnpm 头部块） | ✓ 无第二跑 |
| 5 | 末（非空）行 | 第 74 行字面 **`PROCESS_EXIT=0`** | ✓ C-2 契约 |
| 6 | `PROCESS_EXIT` 全 log 唯一性 | **1 处**（仅第 74 行；attempt-1 旧 log 未被追加） | ✓ 非手补到旧 log |
| 7 | `ELIFECYCLE` 行计数 | **0**（与 EXIT=0 一致；绿跑无需） | ✓ C-2 |
| 8 | PASS / FAIL 计数 | **51 / 0** | ✓ 与声称一致 |
| 9 | 成功横幅 + runner 回执 | 第 71 行 `✓ PrivacyAuthorizationIssuer DB 证明通过（本地隔离证据）`；第 72 行 `LOCAL_ISOLATED_PROOF_RECEIPT file=…2026-10-03T12-07-46-555Z-41747-937ddf40-…json release_evidence=false` | ✓ release_evidence=false 如实 |
| 10 | 就绪轮询（不算第二跑，harness L55） | boot attempt=4 / post-migrate attempt=3 / pre-prove attempt=3（L6/L13/L14） | ✓ 与 receipt 一致 |
| 11 | JSON schema（harness L60-77）逐字段 | 恰好 14 字段全中且仅此 14 个：`attempt=2` · `command=pnpm privacy-authorization:prove` · `proveSha=6673042f8bcdc29cf6f10f99d0aa6a3c95e5a53b`（= pre-commit HEAD full SHA，实测 `git rev-parse 6673042` 一致）· `exit=0` · `processExitLine="PROCESS_EXIT=0"` · `teeFromStart=true` · `attempt1FilesUntouched=true` · `gapStatus="OPEN"` · `cause="unknown"` · `mitigation="mitigated/cause-unknown"` · `notClosed=true` · `notRootCaused=true` · `oneGreenIsNotAClose=true` · `retryToGreenBanned=true` | ✓ |
| 12 | **三角一致（C-3，`3811cf1` 修复验证点）** | log 第 74 行 `PROCESS_EXIT=0` = JSON `"exit": 0` = JSON `"processExitLine": "PROCESS_EXIT=0"` = receipt「EXIT = 0」 | ✓ JSON/log 同意成立 |
| 13 | log SHA256 | `136996dc582abf8ce469343a18f2de2729d56ee40d8f769dd633b967fee08987` | ✓ 与声称一致 |
| 14 | 无 attempt-3 | `git log --all -- '*attempt-3*'` 空；`git ls-tree -r 0c0ab16` 无 attempt-3 文件 | ✓ |
| 15 | 隔离实例 | 第 7 行 `E2E isolated PostgreSQL: meetwise-e2e-41747-1791029257903 on 127.0.0.1:51568`（动态端口）；`docker ps -a --filter name=meetwise-e2e-41747` **零残留** | ✓ 用后即删 |
| 16 | 历史 flake 标记 | log 中 `ECONNREFUSED`/`23505` 计数 = **0** | ✓ 本 run 未复现（见 §3 诚实性） |

## 2. blob 锚（C-4 / C-5，本审实测值 = 本审锚定值）

| 文件 | git blob SHA（本审 `git ls-tree 0c0ab16` 实测） | 与实现方声称 |
|------|------|------|
| `teed-oneshot-attempt-2.log` | **`9b1341444425c4172d8a9cd02e5d8415a94a4084`** | `9b13414…` ✓ |
| `teed-oneshot-attempt-2.json` | **`3919bf579addf264b2eff3625fef7397bf1d7123`** | `3919bf5…` ✓ |
| `2026-10-03-teed-oneshot-attempt-2-receipt.md` | `81795533b028c5c71aca49fd8bdb1299937c73f0` | （本审加锚） |
| `oneshot-attempt-1.json`（冻结） | `8cc9db56079a60fc6410472632dbf4899952c9c2` | 锚 ✓ |
| `oneshot-attempt-1.log`（冻结） | `e8d0fbe4bf5d0cb5d8819adda7b69c7a68b39c77` | 锚 ✓ |

- **C-4 attempt-1 冻结（三方实测零漂移）**：`git ls-tree 6673042` 与 `git ls-tree 0c0ab16` 两 commit 的 attempt-1 双 blob 逐字节同值；工作区文件 `git hash-object` 再算同值。attempt-1 未被改/追加/forge。✓
- **C-5 防改锚定（本审条件，自本段起生效）**：上表前两行即本审对 attempt-2 log/JSON 的**当场锚定 blob**。自本 commit 起，分支上这两个 blob 若再发生任何变化 = 实现方事后改写证据，直接判 FAIL。

## 3. 诚实性审视（adversarial）

1. **EXIT=0 一次过 ≠ 根因消失**：本 run 全程 8.65s、boot 轮询 4 次即就绪，log 零 `ECONNREFUSED`、零 `23505` —— 历史两类失败（cold#5 冷启、warm#2 唯一约束冲突）均未复现，但这只是**样本量 1 的未复现**，不构成根因钉死。实测 JSON/receipt/commit message 三处均如实保留 `OPEN / mitigated-cause-unknown`，receipt 明文「这不构成根因结论，cause 仍 unknown」，无任何「已修复/已关闭/root-caused」措辞，footer 明写 `canHonestlyFlip=false`。✓ 诚实边界守住了。
2. **绿不关 gap（C-7）**：SSOT 三件零 diff（§0）；`e2e-requirement-coverage-matrix.md` 与 `execution-master-checklist.md` 在被审树中仍为 `GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN`；JSON `notClosed/notRootCaused/oneGreenIsNotAClose/retryToGreenBanned` 全 true。✓
3. **exactly-once（C-6）**：单脚本头（机检 #3/#4）、无 attempt-3（机检 #14）、attempt-1 冻结（§2）、run worktree clean、`PROCESS_EXIT` 唯一。本审自身亦未重跑 prove。✓
4. **红线（C-8）**：`apps/worker/src/checkpoint-principal.ts` 在树中存在且分支零触碰；UC-052 stays partial；coveredCount=8；公开 DELETE=503 实测 `apps/api/src/modules/privacy/privacy.controller.ts:51-52`（`@Delete('interview-data/:id')` + `@HttpCode(HttpStatus.SERVICE_UNAVAILABLE)`）未变；九项 pins（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false）在被审树全部原值。✓
5. **观察项（非 FAIL）**：① pre-exec 双签与被审 tip 均不在任何 remote（见前言）——签名真实性已由 author 身份 + 内容核验，但「origin main」表述与实测不符，协调方同步远端时应留意；② receipt「Executed at 12:07:37.905Z → 12:07:46.555Z」与 log 回执时间戳 `12-07-46-555Z` 吻合，交叉一致。

## 4. Blockers

无。

## 5. Conditions（持续约束）

- **C-5 锚定生效**：attempt-2 log blob `9b1341444425c4172d8a9cd02e5d8415a94a4084`、JSON blob `3919bf579addf264b2eff3625fef7397bf1d7123`、receipt blob `81795533b028c5c71aca49fd8bdb1299937c73f0` 自本 commit 起冻结；任何再改写 = FAIL。
- **C-7 持续**：`GAP-PRIV-AUTHZ-PROVE-FLAKE` 保持 **OPEN / mitigated-cause-unknown**、`canHonestlyFlip=false`；翻转 closed/fixed/root-caused 须真根因钉死 + 双审同意，默认不关。
- **C-8 持续**：零产品改动、UC-052 partial、coveredCount=8、公开 DELETE=503、九项 pins 原值；本 PASS 不是 nail、不是 HA、不是 covered、不是 coding 授权。
- **exactly-once 持续**：无 attempt-3；本审未跑 prove，任何人不得以「再跑一次确认」为由重跑。

## 6. 三行中文摘要

1. attempt-2 产物机检全过：74 行 teed log 末（非空）行=字面 `PROCESS_EXIT=0`（全 log 唯一）、行首顶层脚本头计数=1、ELIFECYCLE=0、51 PASS/0 FAIL，JSON 恰好 14 字段含 proveSha=`6673042`（实测 pre-commit HEAD）——log 末行 / JSON exit / receipt 三角一致，`3811cf1` 的 JSON/log 不同意缺陷被实测修复。
2. 五个 blob 锚全为本审实测：attempt-2 log `9b134144…` / JSON `3919bf57…` 当场锚定并冻结（锚后再变即 FAIL），attempt-1 双 blob `8cc9db56…`/`e8d0fbe4…` 在 6673042、0c0ab16、工作区三方零漂移；diff 6673042→0c0ab16 仅 3 个 receipts 新文件，零产品/零 SSOT；容器 `meetwise-e2e-41747-…`@51568 零残留；无 attempt-3；gap 保持 OPEN/cause=unknown、canHonestlyFlip=false，receipt 无「已修复/已关闭」措辞。
3. 无 Blockers，C-1~C-8 逐条 PASS（C-1 附观察项：pre-exec 双签 `376aa8e`/`31d3b31` 与被审 tip 实测均不在任何 remote，与任务包「origin main」表述不符，签名本身真实）；绿一次过 ≠ 根因消失，ECONNREFUSED/23505 未复现不构成关闭依据；本 PASS 不代签 mw-privacy-int、不是 coding/HA/covered 授权。

Verdict: PASS
