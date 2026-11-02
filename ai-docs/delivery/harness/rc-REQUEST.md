# STATUS-RECON REQUEST（harness REQUEST 状态对账刀——274 卷全量普查·executed*/proofed* 135 卷逐份并线考证·四类归类·executed 历史台账债分批翻面计划·起草落卷即停·零字节翻面·行使留 EXEC 期）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-11-03 落卷·普查只读亲证·翻面行使权留 EXEC 期分批+协调方授权·est live=0·Ban self-approve·alone≠dual·⛔push ⛔EXEC ⛔改产品码·前值无=新卷·状态钉四处：本行+§8+§9+卷尾·同值）

**席位**：北星「STATUS-RECON」REQUEST 状态对账刀起草席（协调方派单·主会话四门复评实测移交·本席只起草不行使）。
**基线**：`origin/main` @ `e647fcffa`（fetch 后亲证 `git rev-parse origin/main`=`e647fcffaccb8c955b9538c85d12a643999ae1ee`=PR #191 ha1 并线点）·分支 `line/rc-draft`·工作树 `meetwise-rc`（仓根同级·`git worktree add /Users/miaole/Desktop/golucky/meetwise-rc -b line/rc-draft origin/main` 本席亲立·`-b` 成功即分支建前不存在的机证）。
**性质**：机械对账刀（零产品码·零迁移·零 proof 改动·唯本卷 1 tracked 新件）·每份 executed/proofed 状态 REQUEST 核其分支/PR 是否已并 origin/main→已并者拟批量翻面（行使留 EXEC）·未并/停摆/不可考者如实保留归类。
**pins（十一值照抄零翻）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false · alone≠dual · Ban self-approve · Dual PASS ≠ 开工。

## §0 现状锚（普查只读·全数亲证 @`e647fcffa`·每条给命令+读数·禁凭印象）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：建后实测主仓+13 树（mw-main-check/meetwise-ag18/ag20/audit/cap72/flip/ha1/led/loadw/nk1/pay/scoringeval/sse2/state/uc31/rc 本席）——**零第二 rc 树**。
- `git rev-parse --verify refs/heads/line/rc-draft`：建前 BRANCH_ABSENT 亲证——**零同名刀卷/分支**（`ls ai-docs/delivery/harness/ | grep -i '^rc-'` 于 `e647fcffa` 零命中）。
- 在飞交叠：本刀只触 `ai-docs/delivery/harness/rc-REQUEST.md` 一新件·**与全部在飞线（sse2 `5272ae7f0`/flip `ba38b7356`/nk1/pay/scoringeval/uc31/campaign-state 等）触面零交集**（各线 WORKTREE 均在·`git merge-base --is-ancestor` 亲证 sse2/flip 两 tip 均 NOT ancestor of origin/main=在飞未并如实采）。

### 0.1 普查方法（命令在案·可复跑）

1. 卷全集：`git ls-tree -r --name-only origin/main -- ai-docs/delivery/harness/ | grep REQUEST` → **274 份**（`wc -l` 亲证）。
2. 状态提取：对每份 `git show origin/main:<path>` 后按优先级取首个 canonical 状态 token（`executed/closed/draft/proofed/stopped/exec_landed/post_prove_dual_pass` 及其 `:子值` 形）——优先命中携带 Status/状态/STOP 字样的行·否则取全卷首个 token 行（深埋 §8 状态节卷如实按行号记）。提取脚本对 274 份全跑·计数见 §0.2。
3. 并线考证（executed*/proofed* 135 份逐份）：①取卷最新触卷 commit：`git log origin/main --full-history --no-merges -1 --format='%H' -- <path>`；②找承载 PR merge：沿 `git rev-list --first-parent --merges origin/main`（97 记）自新向旧逐个测 `git merge-base --is-ancestor <C_last> <M>^2` 且 **NOT** `--is-ancestor <C_last> <M>^1`（带入判据·防 rebase 后支线 tip 恒真假阳）→ 首中即承载 merge·PR 号取其 subject；③无承载 merge 者回查 C_last 本体 subject（squash 形携 `(#N)` 号）。
4. 代码级抽验（佐证「卷并=刀并」机械代理）：ag17→`git grep -c schema_invalid origin/main -- packages/ai-runtime/src/trace.ts`=1 且 schema_retry 旧值=0（改名真落）·worker-hang-guard→`git grep -c watchdog origin/main -- apps/worker/src/drain-loop.ts`=18（watchdog 真落）·boundary-rule-single→`git grep -c UNTRUSTED_DATA_BOUNDARY_RULE origin/main -- packages/ai-runtime/src/model-client.ts`=0（第二份文案已按刀清除）。

### 0.2 普查读数（274 = 以下六桶 +1 终翻）

| 桶 | 计数 | 明细 |
|---|---|---|
| `closed` | 99 | 含 2026-10-15 协调方授权批量滞后卷对账翻面批（negresume-driver-fix/obs-logging/obs-ready 等先例）与 uc004-e2e 等 |
| executed 族 | 129 | `executed:awaiting_post_prove_dual` 123（含 stream-known-executed·其 §8 `:119` 实值）+ `executed:awaiting_post` 4（n19-stale-comment/nightly-recall-fix/readyz-privacy-wire/weakness-s30-fix）+ `executed:dual_pass_nail` 1（e2ea05-backfill）+ `executed:stopped_gate_red_escalated` 1（uc003-arm4-filter） |
| draft 族 | 39 | `draft:awaiting_pre_exec_dual` 31 + 裸 `draft` 7 + `draft:rev3` 1（resume-grounding·§8 STOP=`draft_rev2:pre_exec_dual_PASS`） |
| `proofed:dual_pass` | 4 | ha1 / led / nk1 / quizdx |
| `post_prove_dual_pass` | 1 | uc017（PR #138 已并） |
| 无状态行 | 1 | g7-enoent-fix（全卷零状态 token·亲证） |
| 有效终翻（普查表记 executed·卷内终翻注记权威 closed） | 1 | smoke-env-fix（`:3` 终翻注记「STOP 值终翻为 nail 落卷（closed）·本注记为权威·上文旧值史录保留」） |
| **合计** | **274** | `git ls-tree` 计数恰等 |

### 0.3 与四门复评口径差异（如实并陈·不裁归因）

四门复评席实测（closed 103 / executed 130 / draft 32 / proofed 3 / 无状态行 5 = 273）vs 本席机扫（§0.2 = 274）。executed **恰等 130**；其余差异如实登记不猜：总数 +1（ha1-REQUEST.md 于四门扫后由 PR #191 并入为最可能项·四门扫描时点不可考）；closed −3~−4（四门 103 vs 本席 99+1 终翻=100）；draft +7（本席计裸 draft 7 卷与 draft:rev3 为 draft 族）；proofed +2（ha1 #191 并入转 proofed+dual_pass·uc017 记 post_prove_dual_pass）；无状态 −4（本席唯一零 token 卷=g7-enoent-fix）。四门口径未附逐卷清单·本刀不代裁·EXEC/协调方可按 §0.1 命令复跑对账。

## §1 四类考证结论（executed*/proofed* 135 卷逐份全考·零凭印象）

**对账判据（机械代理声明）**：「刀已并线」= 卷最新触卷 commit（full-history 无剪枝）已属 origin/main 可达集·落定形态为 PR merge commit 或携号 squash commit。卷文本（含 §9-EXEC 落码记录与 blob 锚）既已在 main·其支线 EXEC 落码内容并线即为该 merge 所携带——代码级抽验三卷佐证（§0.1-4）。

### ① 已并→可翻 closed：**128 卷**（128 = 107 + 13 + 8·三类承载证据全列·翻面行使留 EXEC 期分批）

##### ①-甲 PR #110 merge `26ec18425` 承载 107 卷
- 5c-behavior-trio — line/5c-behavior-trio — PR #110 merged 26ec18425
- 5e-cleanup-sweep-2 — line/5e-cleanup-sweep-2 — PR #110 merged 26ec18425
- 5e-cleanup-sweep — line/5e-cleanup-sweep — PR #110 merged 26ec18425
- ag09-replay-first — line/ag-next-draft — PR #110 merged 26ec18425
- ag15-observability — line/ag15-observability — PR #110 merged 26ec18425
- ag16-resume-proof — line/ag16-resume-proof — PR #110 merged 26ec18425
- ag17 — line/ag-next-draft — PR #110 merged 26ec18425
- ag18-sampling-temperature — line/ag-next2-draft — PR #110 merged 26ec18425
- ag43-dual-half — line/ag43-dual-half — PR #110 merged 26ec18425
- api-harden-family — line/api-harden-family — PR #110 merged 26ec18425
- assert-strengthen — line/assert-strengthen — PR #110 merged 26ec18425
- boot-validate — line/boot-validate — PR #110 merged 26ec18425
- boundary-rule-single —  — PR #110 merged 26ec18425
- cap-sanction-2208 — line/cap-sanction-2208 — PR #110 merged 26ec18425
- cap-sanction-2216 — line/cap-sanction-2216 — PR #110 merged 26ec18425
- cap-sanction-2224 — line/cap-sanction-2224 — PR #110 merged 26ec18425
- cap-sanction-2232 — line/cap-sanction-2232 — PR #110 merged 26ec18425
- cap-sanction-2248 — line/cap-sanction-2248 — PR #110 merged 26ec18425
- cap-sanction-2256 — line/cap-sanction-2256 — PR #110 merged 26ec18425
- cap-sanction-2264 — line/cap-sanction-2264 — PR #110 merged 26ec18425
- cap-sanction-2272 — line/cap-sanction-2272 — PR #110 merged 26ec18425
- cap-sanction-2280 — line/cap-sanction-2280 — PR #110 merged 26ec18425
- checkin-key — line/checkin-key — PR #110 merged 26ec18425
- checkpoint-config-batch —  — PR #110 merged 26ec18425
- checkpoint-terminal-slim —  — PR #110 merged 26ec18425
- config-reject-local — line/config-reject-draft — PR #110 merged 26ec18425
- contact-header-line — line/contact-header-draft — PR #110 merged 26ec18425
- context-byte-truncation — line/context-byte-cap-draft — PR #110 merged 26ec18425
- csp-headers — line/csp-headers — PR #110 merged 26ec18425
- db-hotspot — line/db-hotspot — PR #110 merged 26ec18425
- dbacl2-ci-shallow-fix — line/dbacl2-ci-shallow-fix — PR #110 merged 26ec18425
- dbacl2-ci-wire — line/dbacl2-ci-wire — PR #110 merged 26ec18425
- dbhy1-reg-fix — line/dbhy1-reg-fix — PR #110 merged 26ec18425
- deploy-check-harden — line/deploy-check-harden — PR #110 merged 26ec18425
- drop-cascade-guard —  — PR #110 merged 26ec18425
- e2ea05-backfill — line/e2ea05-backfill — PR #110 merged 26ec18425
- fail-queued-job — line/fail-queued-job-draft — PR #110 merged 26ec18425
- failed-interview-score —  — PR #110 merged 26ec18425
- fenced-score-average — line/fenced-score-average-draft — PR #110 merged 26ec18425
- g7w-diag-needles — line/g7w-tail-seg-emit — PR #110 merged 26ec18425
- g7w-tail-contract-ruling — line/g7w-tail-diag — PR #110 merged 26ec18425
- g7w-tail-seg-emit — line/g7w-tail-diag — PR #110 merged 26ec18425
- gitleaks-archive-expand — line/gitleaks-archive-expand — PR #110 merged 26ec18425
- gitleaks-placeholder-remedy — line/gitleaks-placeholder-remedy — PR #110 merged 26ec18425
- graph-fence — line/graph-fence — PR #110 merged 26ec18425
- graph-invoke-depth —  — PR #110 merged 26ec18425
- graph-lease-existing-failed —  — PR #110 merged 26ec18425
- graph-lease-failed-interview —  — PR #110 merged 26ec18425
- graph-lease-terminal —  — PR #110 merged 26ec18425
- graph-release-marker —  — PR #110 merged 26ec18425
- growth-null-overall — line/growth-null-overall-draft — PR #110 merged 26ec18425
- hmac-consolidate — line/hmac-consolidate — PR #110 merged 26ec18425
- interview-event-statement-notify — line/notify-statement-draft — PR #110 merged 26ec18425
- interview-job-autovacuum — line/autovacuum-tuning-draft — PR #110 merged 26ec18425
- invocation-output-after-fence —  — PR #110 merged 26ec18425
- lint-cap-step-242 — line/lint-cap-step-242 — PR #110 merged 26ec18425
- lint-cap-step — line/lint-cap-step — PR #110 merged 26ec18425
- managed-file-ceiling-2288 — line/managed-file-ceiling-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2296 — line/managed-file-ceiling-2296-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2304 — line/managed-file-ceiling-2304-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2312 — line/managed-ceiling-2312-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2320 — line/managed-ceiling-2320-draft — PR #110 merged 26ec18425
- managed-file-ceiling-2328 — line/managed-file-ceiling-2328-draft — PR #110 merged 26ec18425
- n19-stale-comment — line/audit-status-notes — PR #110 merged 26ec18425
- nightly-recall-fix — line/nightly-recall-fix — PR #110 merged 26ec18425
- offline-order-status —  — PR #110 merged 26ec18425
- outbox-partial-index — line/outbox-partial-index-draft — PR #110 merged 26ec18425
- pgp-key-param — line/pgp-key-param-draft — PR #110 merged 26ec18425
- provision-lock-release — line/provision-lock-release-draft — PR #110 merged 26ec18425
- q2-validate-scene-fix — line/q2-validate-scene-fix — PR #110 merged 26ec18425
- qgen-critique-resilience — line/qgen-critique-resilience — PR #110 merged 26ec18425
- queue-closeout — line/worker-hang-guard — PR #110 merged 26ec18425
- queue-enqueue-bp — line/queue-enqueue-bp — PR #110 merged 26ec18425
- queue-shutdown-phases — line/queue-shutdown-phases — PR #110 merged 26ec18425
- rag-embed-missing-usage — line/rag-embed-usage-draft — PR #110 merged 26ec18425
- rag-query-cache —  — PR #110 merged 26ec18425
- raw-answer-lease —  — PR #110 merged 26ec18425
- ready-derivative-unavailable —  — PR #110 merged 26ec18425
- readyz-privacy-wire — line/readyz-privacy-wire — PR #110 merged 26ec18425
- recruiter-band-after-fence —  — PR #110 merged 26ec18425
- replay-side-effect —  — PR #110 merged 26ec18425
- repo-hygiene — line/repo-hygiene — PR #110 merged 26ec18425
- requeue-fixture-fix — line/requeue-fixture-fix — PR #110 merged 26ec18425
- reserve-renew-fix — line/reserve-renew-fix — PR #110 merged 26ec18425
- resume-id-case —  — PR #110 merged 26ec18425
- route-fast-model —  — PR #110 merged 26ec18425
- route-leaf-weight —  — PR #110 merged 26ec18425
- score-span-answer —  — PR #110 merged 26ec18425
- session-summary-deepen — line/gitleaks-archive-expand — PR #110 merged 26ec18425
- ssd-egress-manifest — line/ssd-egress-manifest — PR #110 merged 26ec18425
- sse-api-family — line/sse-api-family — PR #110 merged 26ec18425
- sse-api-sub — line/on — PR #110 merged 26ec18425
- sse-fetch-failure —  — PR #110 merged 26ec18425
- stream-known-executed —  — PR #110 merged 26ec18425
- submit-flow-competency-wire — line/submit-flow-competency-wire — PR #110 merged 26ec18425
- supply-chain — line/supply-chain — PR #110 merged 26ec18425
- sweep-failed-interview —  — PR #110 merged 26ec18425
- tenant-owner-trim —  — PR #110 merged 26ec18425
- terminal-interview-graph — line/terminal-interview-graph-draft — PR #110 merged 26ec18425
- threshold-calibration — line/threshold-calibration-draft — PR #110 merged 26ec18425
- trace-service-wire — line/trace-service-wire — PR #110 merged 26ec18425
- unstube-erase-diag — line/unstube-erase-diag — PR #110 merged 26ec18425
- upload-guards — line/upload-guards-draft — PR #110 merged 26ec18425
- voice-final-sentence —  — PR #110 merged 26ec18425
- weakness-s30-fix — line/weakness-s30-fix — PR #110 merged 26ec18425
- worker-hang-guard — line/worker-hang-guard — PR #110 merged 26ec18425
- worker-shutdown-seq — line/worker-shutdown-seq — PR #110 merged 26ec18425

##### ①-乙 PR #108 squash `112e6d26f` 承载 13 卷（subject 携 PR 号·无 merge commit）
- cache-observe-repin — line/cache-observe-repin — PR #108 squash-merged 112e6d26f
- cost-columns — line/cost-columns — PR #108 squash-merged 112e6d26f
- e2e-runner-stale-build-guard — line/e2e-runner-stale-build-guard — PR #108 squash-merged 112e6d26f
- g7k-reds-remap — line/g7k-reds-remap — PR #108 squash-merged 112e6d26f
- i18n-metadata-ssr — line/i18n-metadata-ssr — PR #108 squash-merged 112e6d26f
- iso-dotenv-isolation — line/iso-dotenv-isolation — PR #108 squash-merged 112e6d26f
- nul-escape-visibility — line/nul-escape-visibility — PR #108 squash-merged 112e6d26f
- perfload-env-fix — line/perfload-env-fix — PR #108 squash-merged 112e6d26f
- qbank-integrity-chain — line/qbank-integrity-chain — PR #108 squash-merged 112e6d26f
- qbank-pipeline-scope — line/qbank-pipeline-scope — PR #108 squash-merged 112e6d26f
- qbank-scope-fix — line/qbank-scope-fix — PR #108 squash-merged 112e6d26f
- runtime-kernel-wire — line/runtime-kernel-wire — PR #108 squash-merged 112e6d26f
- secret-checker-nul-guard — line/secret-checker-nul-guard — PR #108 squash-merged 112e6d26f

##### ①-丙 单线 PR 承载 8 卷
- ag34-lock-hold — line/ag34-lock-hold-draft — PR #115 merged fae1c0997
- asr-quality-metrics — line/asr-quality-draft — PR #118 merged 508450c14
- cap-sanction-2338 — line/cap-sanction-2338 — PR #113 merged 65a9c40f4
- cap-sanction-2354 — line/cap-2354 — PR #123 merged ab282ba81
- config-reject-guidance — line/config-reject-guidance-draft — PR #116 merged 5123019e5
- lease-attempts-cap — line/lease-attempts-cap-draft — PR #119 merged 4ec27f55e
- progress-write — line/progress-write — PR #139 merged 5e5c6658a
- regw — line/regw-draft — PR #187 merged 5c94266b1


### ② 在飞未并：**0 卷**

普查集（origin/main 树上 executed/proofed 135 卷）内零「在飞未并」——每卷均有 §①/③ 落定证据。在飞竞争如实列（非本普查对象·归 §3 cap 竞争登记）：`line/sse2-draft` @ `5272ae7f0`（meetwise-sse2 本地树·NOT ancestor of main 亲证·承 cap 2465=CAP-SANCTION-2465 注记在卷）·`line/flip-draft` @ `ba38b7356`（meetwise-flip 本地树·NOT ancestor 亲证·承 cap 2466=派单如实采）——两线 REQUEST 卷均不在 main 普查集内。

### ③ STOPPED/废弃：**1 卷（零字节保留·如实标注）**

- uc003-arm4-filter — `executed:stopped_gate_red_escalated`（2026-10-16 EXEC 落卷即停手上报·门 1 主门环境红分类退出=pre-flight `live_provider_key_missing`·§8 停止条件「验收红不可修」命中）— 落定证据 PR #108 squash `112e6d26f` — **不翻面**（停摆态如实保留·处置权归协调方）。

### ④ 无法考证：**0 卷**

135 份全部考证到 PR/commit 级证据（① 128 + ③ 1 + 附记-甲 5 + 附记-乙 1·账目自洽）。

### 附记-甲 proofed 档 5 卷（已并·档位高于 executed·**翻面权归协调方·本刀零触零字节**）

- ha1 — `proofed:dual_pass` — PR #191 merged e647fcffa（本基线 tip 本体）
- led — `proofed:dual_pass` — PR #190 merged 4751aab28
- nk1 — `proofed:dual_pass` — PR #189 merged da1dae1de
- quizdx — `proofed:dual_pass` — PR #188 merged 2e808c9e3
- uc017 — `post_prove_dual_pass` — PR #138 merged ea0fa0a0a

### 附记-乙 smoke-env-fix（有效终翻 closed·移出翻面清单）

普查首 token 读数 `executed:awaiting_post`·但卷 `:3` 终翻注记权威载「STOP 值终翻为 nail 落卷（closed）·本注记为权威·上文旧值史录保留」→ 有效态=closed（落定证据 PR #110 merged `26ec18425`）·不入 ① 清单·如实登记防 EXEC 双翻。

## §2 修法（EXEC 期分批行使·本席起草期零字节翻面）

**翻面先例形**（沿 obs-logging / obs-ready / negresume-driver-fix 2026-10-15 协调方授权批量滞后卷 Status 对账翻面批·及 ag37/ag-cost5/ha-6 状态行翻面先例）：每卷凡承载活值状态 token 的行（Status 头行 / §8 STOP·状态节行 / 卷尾注行——各卷形态 3~4 行·EXEC 逐卷 rg 状态 token 出现行核实后翻·**不钉死行数**）由 `executed:<子值>` 翻 **`closed`**·行尾 additive 注记·前值括注史录零洗史·格式：

> **`closed`**（20XX-XX-XX 协调方授权批量滞后卷 Status 对账翻面·沿 obs-logging/obs-ready/negresume-driver-fix 先例·对账判据=卷最新触卷 commit 已并 origin/main·<证据>·前值 `executed:<原值>` 史录保留）

其中 `<证据>` 按承载类：`PR #110 merged 26ec18425` / `PR #108 squash-merged 112e6d26f` / `PR #N merged <sha 短 9 位>`（①-丙逐卷见 §1 ①-丙清单）。零内容改动·零触产品码·零触 policy 脚本·零迁移。

**分批计划（每批 ≤40 卷·批间独立可验）**：

| 批 | 范围 | 卷数 | 独立可验 |
|---|---|---|---|
| B1 | ①-甲 #110 组第 1–36 卷（§1 清单序） | 36 | 本批独立 commit + 三门 + `git diff --stat` 卷数=36·触面仅 harness 36 卷 |
| B2 | ①-甲 #110 组第 37–72 卷 | 36 | 同上 |
| B3 | ①-甲 #110 组第 73–107 卷 | 35 | 同上 |
| B4 | ①-乙 #108 组 13 卷 + ①-丙单线 8 卷 | 21 | 同上 |

每批四步：①逐卷翻面（§2 先例形）；②`git diff --stat` 校验恰本批卷集·每卷 3~4 行级改动；③三门复跑（docs:check 记 scanned / PTP 12/12 / markers=0——markers 口径同 `scripts/i6-239-gates.proof.mjs` §2-7：四词面+行首冲突标记零命中·词面运行时组装防自指·卷内不复抄字面）；④批 commit（单行净描述）。128 卷翻面零新件——cap 零再步进（§3 预登 2473 已含本卷 REQUEST +1）。

**翻面行使前置（硬门）**：EXEC 期须 pre-exec 双审 BOTH PASS + 协调方明示授权·Ban self-approve·alone≠dual·⛔push（push/收官权归协调方）。③类卷与附记-甲/乙卷本刀**零触**。

## §3 cap 预登（CAP-SANCTION-2473·随届值如实采·禁按预登值行使）

- main `e647fcffa` 届扫 **2472 = cap 2_472 恰等**（CAP-SANCTION-2472 ha1 收官并线承登·`scripts/ai-docs/public-text-policy.mjs:289` `MAX_FILES = 2_472` 亲证）。
- 本卷 REQUEST +1 ⇒ **预登 2473（CAP-SANCTION-2473）**。起草树四联动点保持 `2_472/f-2472.md/:2473` 原形零改（沿 nk1 §10 CAP-SANCTION-2464 预登先例形：本行仅注记预登数值零改·PTP 12/12 本树亲跑）——docs:check 本树越限红（`PTP_FILE_LIMIT:2473>2472`）即预登证据·如实记录于 §4·非阻塞红。
- **行使条件**：并线期沿协调方常设预授权「并线期 union 越限恰等步进」对**届时届值如实采**重算（fetch 后亲跑届值 detached docs:check）·恰等零多放·**禁按预登值行使**。
- **多在飞竞争如实列**（三方按合并序逐个恰等步进）：本卷承 2472+1=2473 · sse2 承 2465 将 rebase 步 2473（`line/sse2-draft` @`5272ae7f0` 本地树未推未并·承值出处=CAP-SANCTION-2465 注记在卷）· flip 承 2466 将步 2473（`line/flip-draft` @`ba38b7356` 本地树未推未并·承值出处=派单如实采）——三方并线序以实际 merge 为准·每方并线时对届值如实采重算·越限臂 fabricated 数随 cap 联动同步。

## §4 三门预申明（本树起草期亲跑·读数见交付报告）

1. `node scripts/ai-docs/check-docs.mjs`（docs 记 scanned）——预期 `scanned 2473`+`PTP_FILE_LIMIT:2473` 越限红 EXIT=1（预登形态·§3·如实记录不作绿宣称）。
2. `node scripts/ai-docs/public-text-policy.proof.mjs`（PTP）——预期 **12/12 EXIT=0**（proof 未触·cap 形保持）。
3. markers 门——本卷改动集（唯 rc-REQUEST.md 一件）五类标记词+行首冲突标记 **0 命中**（口径同 `scripts/i6-239-gates.proof.mjs` §2-7·词面运行时组装防自指）。

## §5 对账义务与边界

- 本卷对账只读·翻面行使权留 EXEC 期·逐批授权制（§2）。
- 「旧代码忽略仍正确」：本刀零 wire 契约/Redis 结构变更（纯文档状态行）·无消费者兼容义务。
- 后续刀登记：①smoke-env-fix 类「卷内终翻注记」卷建议普查脚本按注记优先读法处理（防首 token 误读）；②③类停摆卷（uc003-arm4-filter）处置（补跑/销案）归协调方；③四门/本席口径差（§0.3）如需终裁建议出对账总表卷。
- 分批翻面期若遇届 tip 前进（sse2/flip/他线并线）：对届 rebase·已翻批次不重翻·未翻批次按届重算 cap（§3）·冲突沿两 policy 注记 dual-keep 先例形。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** REQUEST 写完即停零翻面零码动；EXEC 须双审 BOTH PASS + 协调方明示授权后按 §2 分批行使；Ban self-approve；Ban retry-to-green；⛔push。

## §9 预登与行使分离声明

本卷 §1 为普查结论（只读亲证）·§2 为行使计划（未行使）·EXEC 期逐批落录于此节（append-only·不改既有字）。起草期门读数如实记于交付报告：docs 记 scanned（越限红=预登证据）/ PTP 12/12 / markers 0。

---

*STATUS-RECON REQUEST · 2026-11-03 起草落卷 · `draft:awaiting_pre_exec_dual` · base `origin/main` @ `e647fcffa` · 分支 `line/rc-draft` · 工作树 `meetwise-rc` · 协调方派单（四门复评实测移交）· pins 十一值照抄零翻（§头）· STOP 三处同值（Status 头+§8+本卷尾）· est live=0 · markers=0 · ⛔push ⛔EXEC ⛔改产品码 · alone≠dual · Ban self-approve · Dual PASS ≠ 开工*
