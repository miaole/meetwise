# PROOF-MAINT-A REQUEST（proof 维护批 A · 主线长期红 proof 四类收口：搬家缺文档 / 随新迁移过期 / 竞态崩溃 / 跑完回写 tracked · 草稿含代码 · 起草落卷即停）

**Status**: **`post_prove_dual_pass`**（post-prove 双审两独立外席 BOTH PASS（.tmp/reviews/pmaint-post-1.md PASS·pmaint-post-2.md PASS·P1=0）·2026-11-06 起草席落卷·四类修法已随四个 commit 落码并亲跑在卷·pre-exec 双审两独立外席 PASS（pmaint-pre-2 + pre-1-redual 在卷）→ **2026-11-09 EXEC 期 rebase 到 #225 后主线并线**（cap 2524→2526 恰等步进·policy dual-keep）·EXEC 期门矩阵抽验亲跑六条全绿（conn-stack:r4-domain-isolation/r1-tech-role-fail-closed/eval-uc-e2e-001-002-cite/bill3-settlement(43 PASS)/r4-g-r4-5-product-close/r4-eg1-dual-claim-product-close）·待 post-prove 双审两独立外席 · Ban self-approve · alone ≠ dual · est live=0 · `actualSpendCny=null`）

**席位**：proof 维护批 A 起草席（协调方派单令：DOC-MISS-PTP 93 条 + TEST-EXPIRED 3 条 + HARNESS-BUG 1 条 + 回写 tracked 16 条）。
**基线**：`origin/main` @ **`db0dc8bfe`**（#214 sbg 已并；起草开工时 fetch 亲证 tip=`d549a497b`=#212，worktree `meetwise-pmaint`（`git worktree add ../meetwise-pmaint -b line/pmaint-draft origin/main`）立于该点；起草期再 fetch 见 #213/#214 前进，工作树尚无 commit，`git merge --ff-only origin/main` 快进并线、零冲突，此后四类 commit 均落在 `db0dc8bfe` 之上）。`pnpm install --frozen-lockfile` EXIT=0。
**来源**：主仓本地普查 `.tmp/proof-health-1106.md`（不入库·全量表 1150 行与分组说明）。

---

## §0 现状（逐条脚本 · 修复前读数 · 根因）

读数口径：`EXIT/FAIL 行数`（FAIL 行=以 `FAIL` 开头的输出行，含汇总行）；每条按 package.json 原命令在本 worktree 独立执行，需要数据库者经隔离壳（`scripts/run-e2e-isolated.mjs`，docker=colima 在线）。执行后对 `git status --porcelain --untracked-files=all` 取差：被改写的 tracked 件按执行前快照还原、新落的未跟踪件移出工作树留证（`.tmp/pmaint/`）。

### 0.1 DOC-MISS-PTP（93 条 · 修复前 93/93 红）

根因：PTP-archive EXEC（`e3502c0b6`·2026-10-11）把 `ai-docs/delivery/{harness,eval,reviews,receipts}/**` 与 `ai-docs/delivery/*.slice.md` 共 3025 件 `git mv` 到 `receipts/archive/2026-09-batch23/{harness,eval,reviews,receipts,slices}/**`（3024 件 R100 + 1 件 R090），这批 proof 仍读旧路径；隔离 runner 清单已随迁改 pin，proof 本体未改。

**搬家前后内容一致性（改前亲证）**：本批改动涉及的旧→新映射共 136 件——proof/证据模块里的路径字面 122 件 + `uc018-receipt-backfill/` 历史回执 7 件及其 `logs/` 7 件——逐件核对 `e3502c0b6` 的 name-status 为 **R100**，且 `git diff e3502c0b6^:<旧路径> HEAD:<新路径>` 为空（**136/136 字节一致**）；`git log --follow <新路径>` 链连续（原刀提交 → `e3502c0b6` 搬家 → `112e6d26f`(#108) 并入同内容），搬家后无内容改动。

**改路径后仍红的判定**：仅改路径后 93 条中 34 条转绿，其余红因逐条判定均为**断言过期**——2026-09-23 起各后继授权刀（pre-exec + post-prove 双审通过、harness 已钉 `post_prove_dual_pass`）合法翻转了旧刀钉死的时序事实，旧钉自那时起即恒红（早于搬家）：

| 类 | 旧钉（原意） | 翻转刀（在案证据） | 持久写法 |
|---|---|---|---|
| E1 | live `r4-domain-isolation{,-status}.md` 仍写「题域隔离 NOT closed」（本刀不关题域） | EG3 题域 isolation product close `f2dfa3ed7`；归档 `g-r4-5-eg3-domain-isolation-product-close.md` Status=`post_prove_dual_pass`·post-prove dual BOTH PASS·`domainIsolationClosed=true` | 认原钉，或「文中改记 closed under authorize + `domainIsolationClosed=true`」且 EG3 刀归档 harness 在案 |
| E2 | P-R1 fail-closed 默认 OFF、env 例 `=0`、resolver 注释 Default (flag off)（本刀不翻默认） | G-R4-3/R1 product close `101fb51e0`；归档 `g-r4-3-r1-product-close.md` `defaultFlipped=true`·`post_prove_dual_pass` | 认原钉，或默认 ON 且该刀在案；「flag-off → legacy 技术岗」单测改为显式传 `0`（legacy 退出路径本身仍须可达） |
| E3 | 早批（Batch1/2/2b/3/3b）钉「本批范围外各行 still not_covered」与只含本批的计数 | Batch2–4b `eab4fb316`…`4a3c699f2`；归档 Batch4b harness `post_prove_dual_pass`·coveredCount 7→8 | 范围外各行改按各自活评估器校验（covered 当且仅当评估器肯定·Ban invent），计数按 8 个活评估器求和（同 Batch4 B4 口径）；Batch1 回读计数改为「矩阵中本刀 03/04 已覆盖行数」 |
| E4 | 归档 harness 状态须为 `post_prove_dual_pass` 且非 `post_prove_dual_pass` | 各刀自己的 post-prove 双审通过后 lifecycle nail（归档 harness Status=`post_prove_dual_pass` + post-prove dual (BOTH) PASS） | 认原钉（待双审），或「Status=post_prove_dual_pass 且记 post-prove 双审通过」（非自钉） |
| E5 | EG5/EG6 证据读 EG2 矩阵回执 `coveredCount === 0` | Batch1–4b 按设计复写同一回执（该回执 git 史 `eab4fb316`…`4a3c699f2`） | 认 0，或「计数=covered 行数 + `inventCovered=false` + 收官刀 Batch4b 在案」 |

判据集中在新件 `apps/worker/evidence/r4-superseded-pins.ts`（缺翻面刀在案记录即仍判红·不放宽为任意状态皆过）。**判为真缺口而保持红的断言：0 条。**另有 2 条未改（见表 #6、#7 与 §9）。

逐条读数（`终态`=四类 commit 后同命令亲跑）：

| # | 脚本 | 底层文件 | 修复前 EXIT/FAIL | 仅改路径后 | 终态 | 根因 → 修法 |
|---|---|---|---|---|---|---|
| 1 | `package.json::mysql-stack:r4-domain-isolation:prove` | `scripts/mysql-stack.r4-domain-isolation` | 1/8 | 0/0 | 0/0 | 路径（经 conn-stack 转发，本文件零改） |
| 2 | `package.json::r1-tech-role-fail-closed:prove` | `worker/test/r1-tech-role-fail-closed` | 1/1 | 0/0 | 0/0 | 路径 |
| 3 | `package.json::conn-stack:r4-domain-isolation:prove` | `scripts/conn-stack/mysql-stack.r4-domain-isolation` | 1/8 | 0/0 | 0/0 | 路径 |
| 4 | `package.json::eval-uc-e2e-001-002-cite:prove` | `scripts/eval-uc-e2e-001-002-cite` | 1/2 | 0/0 | 0/0 | 路径 |
| 5 | `package.json::uc001:live-blocked:prove` | `scripts/uc-e2e-001-live-blocked` | 1/1 | 0/0 | 0/0 | 路径 |
| 6 | `package.json::uc018:covered-criterion:prove` | `scripts/uc-e2e-018-covered-criterion` | 1/0（崩） | 未改 | 1/0（崩·同修复前） | **未改**：结构性依赖（作者角色绑定用 `git log -1` 不跟随改名、共享 gatherer 默认根与回执内嵌 logPath）→ §9 另立 |
| 7 | `package.json::db-trigfam:prove` | `db/test/db-trigfam-unify` | 1/10 | 未改 | 1/10（同修复前·未改未复跑） | **未改**：普查误归（实为 0144 一次性收据 proof：StageB 只应用 0144/P6 改动面对古基线，非缺文档）→ §9 另立 |
| 8 | `package.json::scor-00:sole-fixture:prove` | `scripts/g7-scor00-sole-fixture` | 3/1 | 3/1 | 0/0 | 路径+E4双审nail（终态需 sole 夹具栈在位·见 §2） |
| 9 | `package.json::g4-dispatch-recheck-prereq:prove` | `worker/test/g4-dispatch-recheck-prereq` | 1/9 | 1/3 | 0/0 | 路径+E1题域 |
| 10 | `package.json::g-r2-5-retrieve-fail-closed:prove` | `worker/test/g-r2-5-retrieve-fail-closed` | 1/7 | 1/2 | 0/0 | 路径+E1题域 |
| 11 | `package.json::r4-wrong-track-adv:prove` | `worker/test/r4-wrong-track-adv` | 1/5 | 1/3 | 0/0 | 路径+E1题域 |
| 12 | `package.json::r4-wrong-track-adv-live-pg:prove` | `worker/test/r4-wrong-track-adv-live-pg` | 1/4 | 1/2 | 0/0 | 路径+E1题域 |
| 13 | `package.json::nhp-r4-adv-covered:prove` | `worker/test/nhp-r4-adv-covered` | 1/25 | 1/12 | 0/0 | 路径+E1题域+E4双审nail |
| 14 | `package.json::r4-wrong-track-prod-surface:prove` | `worker/test/r4-wrong-track-prod-surface` | 1/25 | 1/11 | 0/0 | 路径+E1题域 |
| 15 | `package.json::r4-p-meta-p-r1:prove` | `worker/test/r4-p-meta-p-r1` | 1/5 | 1/2 | 0/0 | 路径+E1题域+E2默认翻ON |
| 16 | `package.json::r4-p-meta-serving:prove` | `worker/test/r4-p-meta-serving` | 1/16 | 1/4 | 0/0 | 路径+E1题域+E2默认翻ON |
| 17 | `package.json::r4-p-meta-serving-product:prove` | `worker/test/r4-p-meta-serving-product` | 1/38 | 1/9 | 0/0 | 路径+E1题域+E2默认翻ON |
| 18 | `package.json::r4-p-meta-ms1-product-wire:prove` | `worker/test/r4-p-meta-ms1-product-wire` | 1/58 | 1/14 | 0/0 | 路径+E1题域+E2默认翻ON |
| 19 | `package.json::r4-p-meta-ms2-facets-product:prove` | `worker/test/r4-p-meta-ms2-facets-product` | 1/81 | 1/19 | 0/0 | 路径+E1题域+E2默认翻ON |
| 20 | `package.json::r4-p-meta-ms3-deploy-product:prove` | `worker/test/r4-p-meta-ms3-deploy-product` | 1/108 | 1/24 | 0/0 | 路径+E1题域+E2默认翻ON |
| 21 | `package.json::r4-eg1-dual-claim:prove` | `worker/test/r4-eg1-dual-claim-evidence` | 1/3 | 0/0 | 0/0 | 路径+W写.tmp |
| 22 | `package.json::r4-eg1-dual-claim-product-close:prove` | `worker/test/r4-eg1-dual-claim-product-close` | 1/9 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 23 | `package.json::r4-eg2-funnel-covered:prove` | `worker/test/r4-eg2-funnel-covered-matrix` | 1/3 | 0/0 | 0/0 | 路径+W写.tmp+M只比对 |
| 24 | `package.json::r4-eg2-funnel-covered-product-close:prove` | `worker/test/r4-eg2-funnel-covered-product-close` | 1/10 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 25 | `package.json::r4-g-r4-5-product-close:prove` | `worker/test/r4-g-r4-5-product-close` | 1/17 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 26 | `package.json::r4-eg3-domain-isolation-product:prove` | `worker/test/r4-eg3-domain-isolation-product-evidence` | 1/7 | 0/0 | 0/0 | 路径+W写.tmp |
| 27 | `package.json::r4-eg3-domain-isolation-product-close:prove` | `worker/test/r4-eg3-domain-isolation-product-close` | 1/8 | 1/5 | 0/0 | 路径+E4双审nail+W写.tmp |
| 28 | `package.json::r4-funnel-product-close:prove` | `worker/test/r4-funnel-product-close` | 1/12 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 29 | `package.json::r4-funnel-covered-count-batch1:prove` | `worker/test/r4-funnel-covered-count-batch1` | 1/11 | 1/9 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 30 | `package.json::r4-funnel-covered-count-batch2:prove` | `worker/test/r4-funnel-covered-count-batch2` | 1/7 | 1/6 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 31 | `package.json::r4-funnel-covered-count-batch2b-02b-wire:prove` | `worker/test/r4-funnel-covered-count-batch2b-02b-wire` | 1/7 | 1/6 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 32 | `package.json::r4-funnel-covered-count-batch3:prove` | `worker/test/r4-funnel-covered-count-batch3` | 1/7 | 1/6 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 33 | `package.json::r4-funnel-covered-count-batch3b-05-06-wire:prove` | `worker/test/r4-funnel-covered-count-batch3b-05-06-wire` | 1/7 | 1/4 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 34 | `package.json::r4-funnel-covered-count-batch4:prove` | `worker/test/r4-funnel-covered-count-batch4` | 1/5 | 0/0 | 0/0 | 路径+W写.tmp+M只比对 |
| 35 | `package.json::r4-funnel-covered-count-batch4b-08-eval:prove` | `worker/test/r4-funnel-covered-count-batch4b-08-eval` | 1/6 | 0/0 | 0/0 | 路径+W写.tmp+M只比对 |
| 36 | `package.json::r4-eg4-wrong-track-product:prove` | `worker/test/r4-eg4-wrong-track-product-evidence` | 1/8 | 0/0 | 0/0 | 路径+W写.tmp |
| 37 | `package.json::r4-eg4-wrong-track-product-close:prove` | `worker/test/r4-eg4-wrong-track-product-close` | 1/10 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 38 | `package.json::r4-eg5-product-ssot:prove` | `worker/test/r4-eg5-product-ssot-evidence` | 1/11 | 1/4 | 0/0 | 路径+W写.tmp+E5 EG2 计数（证据模块） |
| 39 | `package.json::r4-eg5-product-ssot-product-close:prove` | `worker/test/r4-eg5-product-ssot-product-close` | 1/9 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 40 | `package.json::r4-eg6-ms3-ne-r4-product-close:prove` | `worker/test/r4-eg6-ms3-ne-r4-product-close` | 1/9 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 41 | `package.json::r4-eg6-ms3-ne-r4:prove` | `worker/test/r4-eg6-ms3-ne-r4-evidence` | 1/12 | 1/4 | 0/0 | 路径+W写.tmp+E5 EG2 计数（证据模块） |
| 42 | `package.json::r4-pr1b-combo-root:prove` | `worker/test/r4-pr1b-combo-root-flag-on-evidence` | 1/3 | 0/0 | 0/0 | 路径+W写.tmp |
| 43 | `package.json::r4-pr1c-no-legacy:prove` | `worker/test/r4-pr1c-default-on-no-legacy-evidence` | 1/2 | 0/0 | 0/0 | 路径+W写.tmp |
| 44 | `package.json::r4-pr1-product-close:prove` | `worker/test/r4-pr1-product-close` | 1/7 | 1/5 | 0/0 | 路径+E4双审nail+W写.tmp |
| 45 | `package.json::r4-p-r1-fail-closed:prove` | `worker/test/r4-p-r1-fail-closed` | 1/10 | 1/3 | 0/0 | 路径+E1题域+E2默认翻ON |
| 46 | `package.json::r2-classify-job-route-prereq:prove` | `worker/test/r2-classify-job-route-prereq` | 1/29 | 0/0 | 0/0 | 路径 |
| 47 | `package.json::r2-p-api-route-classify:prove` | `api/test/r2-p-api-route-classify` | 1/9 | 0/0 | 0/0 | 路径 |
| 48 | `package.json::r2-p-loop-route-classify:prove` | `worker/test/r2-p-loop-route-classify` | 1/13 | 0/0 | 0/0 | 路径 |
| 49 | `package.json::r2-p-start-route-classify:prove` | `worker/test/r2-p-start-route-classify` | 1/13 | 0/0 | 0/0 | 路径 |
| 50 | `package.json::r2-p-fake-route-classify:prove` | `worker/test/r2-p-fake-route-classify` | 1/14 | 0/0 | 0/0 | 路径 |
| 51 | `package.json::r2-p-live-route-effective:prove` | `worker/test/r2-p-live-route-effective` | 1/17 | 0/0 | 0/0 | 路径 |
| 52 | `package.json::uc018:receipt-backfill:prove` | `scripts/uc-e2e-018-receipt-backfill` | 1/0 | 1/0 | 0/0 | 路径+日志路径映射 |
| 53 | `apps/api::prove:r2-p-api-route-classify` | `api/test/r2-p-api-route-classify` | 1/9 | 0/0 | 0/0 | 路径 |
| 54 | `apps/worker::prove:r1-tech-role-fail-closed` | `worker/test/r1-tech-role-fail-closed` | 1/1 | 0/0 | 0/0 | 路径 |
| 55 | `apps/worker::prove:g4-dispatch-recheck-prereq` | `worker/test/g4-dispatch-recheck-prereq` | 1/9 | 1/3 | 0/0 | 路径+E1题域 |
| 56 | `apps/worker::prove:r4-wrong-track-adv` | `worker/test/r4-wrong-track-adv` | 1/5 | 1/3 | 0/0 | 路径+E1题域 |
| 57 | `apps/worker::prove:r4-p-meta-p-r1` | `worker/test/r4-p-meta-p-r1` | 1/5 | 1/2 | 0/0 | 路径+E1题域+E2默认翻ON |
| 58 | `apps/worker::prove:r4-p-meta-serving` | `worker/test/r4-p-meta-serving` | 1/16 | 1/4 | 0/0 | 路径+E1题域+E2默认翻ON |
| 59 | `apps/worker::prove:r4-p-meta-serving-product` | `worker/test/r4-p-meta-serving-product` | 1/38 | 1/9 | 0/0 | 路径+E1题域+E2默认翻ON |
| 60 | `apps/worker::prove:r4-p-meta-ms1-product-wire` | `worker/test/r4-p-meta-ms1-product-wire` | 1/58 | 1/14 | 0/0 | 路径+E1题域+E2默认翻ON |
| 61 | `apps/worker::prove:r4-p-meta-ms2-facets-product` | `worker/test/r4-p-meta-ms2-facets-product` | 1/81 | 1/19 | 0/0 | 路径+E1题域+E2默认翻ON |
| 62 | `apps/worker::prove:r4-p-meta-ms3-deploy-product` | `worker/test/r4-p-meta-ms3-deploy-product` | 1/108 | 1/24 | 0/0 | 路径+E1题域+E2默认翻ON |
| 63 | `apps/worker::prove:r4-eg1-dual-claim` | `worker/test/r4-eg1-dual-claim-evidence` | 1/3 | 0/0 | 0/0 | 路径+W写.tmp |
| 64 | `apps/worker::prove:r4-eg1-dual-claim-product-close` | `worker/test/r4-eg1-dual-claim-product-close` | 1/9 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 65 | `apps/worker::prove:r4-eg2-funnel-covered` | `worker/test/r4-eg2-funnel-covered-matrix` | 1/3 | 0/0 | 0/0 | 路径+W写.tmp+M只比对 |
| 66 | `apps/worker::prove:r4-eg2-funnel-covered-product-close` | `worker/test/r4-eg2-funnel-covered-product-close` | 1/10 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 67 | `apps/worker::prove:r4-g-r4-5-product-close` | `worker/test/r4-g-r4-5-product-close` | 1/17 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 68 | `apps/worker::prove:r4-eg3-domain-isolation-product` | `worker/test/r4-eg3-domain-isolation-product-evidence` | 1/7 | 0/0 | 0/0 | 路径+W写.tmp |
| 69 | `apps/worker::prove:r4-eg3-domain-isolation-product-close` | `worker/test/r4-eg3-domain-isolation-product-close` | 1/8 | 1/5 | 0/0 | 路径+E4双审nail+W写.tmp |
| 70 | `apps/worker::prove:r4-funnel-product-close` | `worker/test/r4-funnel-product-close` | 1/12 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 71 | `apps/worker::prove:r4-funnel-covered-count-batch1` | `worker/test/r4-funnel-covered-count-batch1` | 1/12 | 1/9 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 72 | `apps/worker::prove:r4-funnel-covered-count-batch2` | `worker/test/r4-funnel-covered-count-batch2` | 1/8 | 1/6 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 73 | `apps/worker::prove:r4-funnel-covered-count-batch2b-02b-wire` | `worker/test/r4-funnel-covered-count-batch2b-02b-wire` | 1/8 | 1/6 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 74 | `apps/worker::prove:r4-funnel-covered-count-batch3` | `worker/test/r4-funnel-covered-count-batch3` | 1/9 | 1/6 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 75 | `apps/worker::prove:r4-funnel-covered-count-batch3b-05-06-wire` | `worker/test/r4-funnel-covered-count-batch3b-05-06-wire` | 1/8 | 1/4 | 0/0 | 路径+E3后继Batch+W写.tmp+M只比对 |
| 76 | `apps/worker::prove:r4-funnel-covered-count-batch4` | `worker/test/r4-funnel-covered-count-batch4` | 1/6 | 0/0 | 0/0 | 路径+W写.tmp+M只比对 |
| 77 | `apps/worker::prove:r4-funnel-covered-count-batch4b-08-eval` | `worker/test/r4-funnel-covered-count-batch4b-08-eval` | 1/6 | 0/0 | 0/0 | 路径+W写.tmp+M只比对 |
| 78 | `apps/worker::prove:r4-eg4-wrong-track-product` | `worker/test/r4-eg4-wrong-track-product-evidence` | 1/8 | 0/0 | 0/0 | 路径+W写.tmp |
| 79 | `apps/worker::prove:r4-eg4-wrong-track-product-close` | `worker/test/r4-eg4-wrong-track-product-close` | 1/10 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 80 | `apps/worker::prove:r4-eg5-product-ssot` | `worker/test/r4-eg5-product-ssot-evidence` | 1/11 | 1/4 | 0/0 | 路径+W写.tmp+E5 EG2 计数（证据模块） |
| 81 | `apps/worker::prove:r4-eg5-product-ssot-product-close` | `worker/test/r4-eg5-product-ssot-product-close` | 1/9 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 82 | `apps/worker::prove:r4-eg6-ms3-ne-r4-product-close` | `worker/test/r4-eg6-ms3-ne-r4-product-close` | 1/9 | 1/2 | 0/0 | 路径+E4双审nail+W写.tmp |
| 83 | `apps/worker::prove:r4-eg6-ms3-ne-r4` | `worker/test/r4-eg6-ms3-ne-r4-evidence` | 1/12 | 1/4 | 0/0 | 路径+W写.tmp+E5 EG2 计数（证据模块） |
| 84 | `apps/worker::prove:r4-pr1b-combo-root` | `worker/test/r4-pr1b-combo-root-flag-on-evidence` | 1/3 | 0/0 | 0/0 | 路径+W写.tmp |
| 85 | `apps/worker::prove:r4-pr1c-no-legacy` | `worker/test/r4-pr1c-default-on-no-legacy-evidence` | 1/2 | 0/0 | 0/0 | 路径+W写.tmp |
| 86 | `apps/worker::prove:r4-pr1-product-close` | `worker/test/r4-pr1-product-close` | 1/7 | 1/5 | 0/0 | 路径+E4双审nail+W写.tmp |
| 87 | `apps/worker::prove:r4-p-r1-fail-closed` | `worker/test/r4-p-r1-fail-closed` | 1/10 | 1/3 | 0/0 | 路径+E1题域+E2默认翻ON |
| 88 | `apps/worker::prove:g-r2-5-retrieve-fail-closed` | `worker/test/g-r2-5-retrieve-fail-closed` | 1/7 | 1/2 | 0/0 | 路径+E1题域 |
| 89 | `apps/worker::prove:r2-classify-job-route-prereq` | `worker/test/r2-classify-job-route-prereq` | 1/29 | 0/0 | 0/0 | 路径 |
| 90 | `apps/worker::prove:r2-p-loop-route-classify` | `worker/test/r2-p-loop-route-classify` | 1/13 | 0/0 | 0/0 | 路径 |
| 91 | `apps/worker::prove:r2-p-start-route-classify` | `worker/test/r2-p-start-route-classify` | 1/13 | 0/0 | 0/0 | 路径 |
| 92 | `apps/worker::prove:r2-p-fake-route-classify` | `worker/test/r2-p-fake-route-classify` | 1/14 | 0/0 | 0/0 | 路径 |
| 93 | `apps/worker::prove:r2-p-live-route-effective` | `worker/test/r2-p-live-route-effective` | 1/17 | 0/0 | 0/0 | 路径 |

### 0.2 TEST-EXPIRED（3 条 · 修复前 3/3 红 · `quality:governance:prove` 按令不在本批）

| 脚本 | 位置 | 修复前 | 想保证什么 | 为何过期 | 判定 |
|---|---|---|---|---|---|
| `entpay:s2:prove`（隔离） | `apps/api/test/entpay-s2.proof.ts:83-84` | EXIT=1·1 FAIL「S2-0 真迁移链全量应用 0001→0157（末位=0157…）」 | 真迁移链在空库全量应用、且含片2 的 `0157_billing_payer_route`（S2-C1 落位） | 写于 0157 即链尾之时；现链尾 `0224`（目录 222 件），0158 一落即恒红 | 断言过期 |
| `ucal-windowing:prove:raw`（隔离） | `apps/worker/test/usage-calibration-windowing.proof.ts:172-177` | EXIT=1·1 FAIL「A 号位纪律：0176 零 claim」 | AG-COST2（usage_calibration）只占 0177、不占给别刀预留的号位 | 0176 已由 qsec 刀以 `0176_qbank_control_plane_authz_closeout` 合法落位（该迁移头注「本刀=0176」）；与同文件已有的 0175（AG-C）勘正同一形态 | 断言过期 |
| `bill3-settlement:prove`（隔离） | `apps/worker/test/bill3-settlement.proof.ts:222-223`、`:317-322` | EXIT=1·2 FAIL「185 版本在账」「0173 → GRANT EXECUTE TO PUBLIC 语义保留」 | ①全链 applied；②0173 的 CREATE OR REPLACE 不重置 ACL、运行时角色仍可执行该触发器函数 | ①写于 0185 即链尾之时；②0196（#150 触发器函数最小授权）显式 REVOKE PUBLIC → GRANT app_role，PUBLIC 项合法消失 | 两条均断言过期 |

### 0.3 HARNESS-BUG（1 条）

`trial:grant:prove`（隔离）· `apps/api/test/trial-grant.proof.ts` [2iii] 裸败者块：`const p4 = c4.query(...)` 先发出，随后 `await c3.query('COMMIT')`，处理器直到 `try { await p4 }` 才挂上。胜者提交后败者的 23505 若比 COMMIT 应答早一个事件循环轮到达，p4 即成「无处理器的拒绝」，Node 默认 `unhandled-rejections=throw` 直接崩进程（隔离 runner 只回 `ISOLATED_POSTGRES_OUTPUT_WITHHELD`）。断言本身（「裸 INSERT 第二 trial→23505」「裸败者撞 partial unique index→23505」）都对。

修复前读数：普查 1/1 红；本席单跑 1/1 绿；连跑 6 次 **3/6 崩**（每次 16 PASS 后抛未捕获 `duplicate key value violates unique constraint "uq_bucket_trial_one_per_owner"`，Key `(owner_user_id)=(tg-cc-plain-owner)` 即 p4 所插 owner）、3/6 绿 27/27。哨兵对照：在 COMMIT 后人为延迟 300ms（强制拒绝先到）——修前形 **崩（16 PASS）**、修后形 **EXIT=0（27 PASS）**。

### 0.4 回写 tracked（16 条 = 8 根脚本 + 8 worker 双胞胎）

对象：`r4-eg2-funnel-covered:prove` 与 `r4-funnel-covered-count-batch{1,2,2b-02b-wire,3,3b-05-06-wire,4,4b-08-eval}:prove`（底层 8 个 proof 文件）。
写法是**直接覆盖、不比对**：每个 proof 的 B5/M2 步按本批文案（标题/日期/批次段各不相同）现拼整份 md，`writeFileSync` 直写 tracked SSOT `ai-docs/delivery/rag-funnel-01-08-covered-matrix.md`，只断言「已写入」与生成文本里的几处行状态。SSOT 现为 Batch4b 版，跑任一旧批即把它回退成旧批文案——修复前 16/16 次运行均改写该件（本席读数 DIRTY=矩阵 16/16）。
同时这 8 个及另 16 个写回执的 proof（EG1–EG6 evidence/product-close、funnel/g-r4-5/pr1 product-close、pr1b/pr1c）把生成回执写到 `ai-docs/delivery/receipts/` 旧址：搬家后该处已非 tracked，每跑一条留 1–5 个未跟踪件；PTP 扫描含未跟踪件（`ls-files --others`），跑过即把 `check-docs` 顶出 `PTP_FILE_LIMIT`。

### 0.5 本批未改与范围外

- **未改 2 条**（列入 §9 另立）：#6 `uc018:covered-criterion:prove`、#7 `db-trigfam:prove`（理由见表与 §9.2）。
- **按令范围外**：`quality:governance:prove`（待用户决定）；普查其余组（ENV-DB-CONFIG / DESIGN-HONEST-GAP / PRODUCT-PROOF-DIVERGENCE / PRODUCT-REGRESSION? / DOC-CONTENT-DRIFT 等）零触。

---

## §1 修法

### 1.1 类1 DOC-MISS-PTP（commit `274737aba`）

1. **路径**：按 `git show --name-status e3502c0b6` 的改名映射，对 63 个文件（apps/worker proof 43 + 证据模块 15、api proof 1、scripts proof 4）里的旧路径字面逐个替换为新路径，共 209 处，只改代码行、注释零改。未抽通用路径解析器：字面替换逐处可审、零新增 import；运行期兜底解析会把「文档被真删」也悄悄放过。
2. **目录拼接路径**：`uc018-receipt-backfill` 历史回执目录改指归档；回执正文 `logPath` 仍记搬家前相对路径（回执原字节不改），验签前把 `ai-docs/delivery/receipts/` 前缀按同一映射解析到归档位置，日志摘要比对照旧。
3. **过期旧钉（E1–E5）**：见 §0.1 表；新增 `apps/worker/evidence/r4-superseded-pins.ts`（8 个判据函数），在 26 个 proof/证据文件中引用；每处就地注明翻转刀与提交号，断言标签保留原文并在括号里补「或××在案」。
4. scor-00：E4 一条（harness 状态钉）；其余红因是 sole 夹具栈未起（环境 PREREQ，非仓库问题）。
5. 两 policy：cap 2493→2494（新增受管件恰 1=判据模块），链注追加 `CAP-SANCTION-2494`，四联动点 `2_494/f-2494.md/:2495` 恰等改，既有注记与形状注零改写（形状注届值另起一行追加）。

### 1.2 类2 TEST-EXPIRED（commit `565e5da0a`）

- entpay-s2：链尾改由 `latestMigrationVersion(迁移目录)` 动态取（与 runner 同源），断言「applied 件数 = 目录件数 ∧ 末位 = 链尾 ∧ 含 `0157_billing_payer_route`」——比原「末位=0157」多钉了全量，新迁移不再使之过期。
- ucal-windowing：「0176 零 claim」改为「0175/0176 号位上若有记录只能是 `0175_interview_job_next_attempt_at` / `0176_qbank_control_plane_authz_closeout`，且无 usage_calibration/ag07 记录」；0177 恰一条的上一断言不动。
- bill3：①版本数改为 `loadMigrations(目录).length`；②改钉「该函数仍有显式 EXECUTE 授权项（PUBLIC=0144 :411 形或 app_role=0196 形）且 `has_function_privilege('app_role', …)` 为真」——0196 前后都成立；若 CREATE OR REPLACE 重置了 ACL，两条都会红。

### 1.3 类3 HARNESS-BUG（commit `3c7b69302`）

`p4` 发出后立即 `p4.catch(() => undefined)` 挂空处理器（+3 行，含两行注释）；下方 `try { await p4 } catch (e) { … errCode(e) === '23505' }` 原样取到同一拒绝做断言，断言含义零变化。ON CONFLICT 块的 p2 不会以 23505 拒绝，不动。

### 1.4 类4 回写 tracked（commit `acf1b5eac`）

- 24 个写回执的 proof：`receiptDir` 改为 `.tmp/proof-receipts`（gitignore），写入与回读（roundtrip）断言原样保留。
- 8 个矩阵 proof：生成的矩阵 md 改落 `.tmp/proof-receipts/rag-funnel-01-08-covered-matrix.<批>.md`，原有对生成文本的断言照旧；tracked SSOT **只比对不写**——新增 `ssotMatrixMatchesEmitted`（加在 EG2 矩阵证据模块内·零新文件）：live 矩阵每行须逐行在 SSOT 中、SSOT 表格行数相等、含同值 coveredCount 行，漂移即红。
- Batch4b：eval wire 的落盘根改传 `.tmp` 下目录（src 零改）；B2 评估器已读归档在案回执，新增「B1 新产出与归档回执逐字节一致」比对，保住 B1→B2 承接。

---

## §2 验收（本席亲跑读数）

| # | 门 | 读数 |
|---|---|---|
| 1 | 类1 93 条 | **91/93 绿**：static 89 条中 88 绿（含 scor-00：起 `docker/compose.mysql-local.yml` 夹具栈后 EXIT=0，跑完即 down、卷保留）+ 隔离 4 条中 3 绿；未改 2 条维持修复前读数 |
| 2 | 类2 3 条 | 3/3 绿：entpay-s2 28 例全绿、ucal-windowing 38 臂全过、bill3 全过 |
| 3 | 类3 | 连跑 6/6 绿（各 27 PASS，含 23505 断言 PASS）+ 终跑 1/1 绿；哨兵对照 修前崩 / 修后绿 |
| 4 | 类4 16 条 | 16/16 绿，SSOT 比对 PASS；修后每跑 DIRTY=0、未跟踪件=0（另 32 条写回执脚本同为 0）；变异哨兵：把 SSOT 第 07 行改成 not_covered → batch4 比对 FAIL（missing=1），复原后零差 |
| 5 | 跑完 git status | 89 static + 7 隔离 + scor-00 逐条执行后均干净 |
| 6 | typecheck | worker/api/根（e2e）EXIT=0·0 error（=基线） |
| 7 | lint | worker 999、api 1545、根 5410 warnings·0 error（=基线·各自 max-warnings 恰等）；改动文件逐个对比 HEAD 版 warning 增量 0 |
| 8 | `pnpm arch` | EXIT=0·8 条 no-orphans 警告全为既有 web/attack-corpus 文件，本批文件零命中 |
| 9 | `node scripts/e2e-static-guards.mjs` | EXIT=0·runners=6 helpers=21 flags=9 aiPaths=6 |
| 10 | `node scripts/provider-egress-inventory.mjs` | EXIT=0·adapters=5 operations=10 pairs=55 refs=401 |
| 11 | `node scripts/ai-docs/check-docs.mjs` | EXIT=0·scanned **2495 = cap 2495** 恰等（类1 commit 时 2494=2494） |
| 12 | `node scripts/ai-docs/public-text-policy.proof.mjs` | EXIT=0·**12/12** |
| 13 | markers | 改动集新增行：冲突标记 + 四类遗留标记词（运行时拼词扫描）**0** 命中 |

---

## §3 范围外（越界即 FAIL）

产品源码（`apps/*/src`、`packages/*/src`）与迁移零改；归档文档与 tracked SSOT 零改；未改的 2 条与普查其余组零触；不跑浏览器 UI runner；不碰 Key 值；不动其他工作树；不 push、不用 stash。

## §5 Ban + pins

Ban 把「断言过期」当真缺口放过、Ban 把真缺口改断言洗绿、Ban 放宽为任意状态皆过、Ban 自批。
**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本批零真实模型外呼）。

## §6 est live=0

零模型外呼、零真实支付；隔离库与夹具栈均为本地一次性容器。

## §7 markers=0

见 §2 第 13 行（词面不入卷，防自匹配）。

## §8 STOP + 停止条件

**`post_prove_dual_pass`**（起草席落卷即停 · Status 头 / §8 / §9 / 卷尾四处一致）。后续任一席遇下列情形即停、回协调方：

1. 任一改过的 proof 复跑红，或跑完 `git status` 不干净；
2. typecheck/lint 任一包高于 §2 基线，或 check-docs 不恰等、PTP 非 12/12、markers 非 0；
3. 双审认定 E1–E5 任一持久写法削弱原意——该条退回原断言保持红，转列真缺口，不另找绕法；
4. 需改产品源码、迁移、归档文档或 tracked SSOT 才能转绿；
5. 主线前进致两 policy 冲突——按常设预授权「cap 以合并树实测恰等步进」重算，链注追加、不改写既有注记，否则停；
6. 需动其他工作树、需 Key、需 push。

## §9 pre-exec dual 交接（状态：**`post_prove_dual_pass`**）

### 9.1 请双席重点核

1. §0.1 表 E1–E5 每条：翻转刀与归档 harness 是否确在案、持久写法是否等价于原意（判据只在 `r4-superseded-pins.ts` 与 `ssotMatrixMatchesEmitted` 两处）；
2. 类2 三条改写是否不弱于原断言（entpay 多钉全量、bill3 改钉运行时可执行）；
3. 类3 修法是否只改「何时挂处理器」、不改断言；
4. 类4：SSOT 只比对后，是否仍有 proof 写 tracked 件或旧址（建议跑完全族后看 `git status --porcelain --untracked-files=all`）。

### 9.2 未改 2 条（建议另立刀）

- `uc018:covered-criterion:prove`：除旧路径外还有三层结构依赖——C-NO-GIT-AUTHOR 用 `git log -1` 取评审件作者，搬家后最新提交人变成搬家/并入提交，不跟随改名；共享 `scripts/lib/uc-covered-real-gatherer.mjs` 默认根指旧址且被 covered-lift 族共用；backfill 叠加回执内嵌旧 `logPath`。只改路径修不绿，改共享件会波及本批外的 covered-lift 族。另：该 proof 要求工作树干净才跑。
- `db-trigfam:prove`：普查误归 DOC-MISS。10 条 FAIL 全是 0144 刀一次性收据的设计期过期（StageB 只应用 0144、挂接点 A≡B、P6 改动面对古基线比对、P5 基线同红差分豁免对象已转绿），白名单里的旧路径不是红因；需重构或退役。

### 9.3 commit 列表（`line/pmaint-draft`，基线 `db0dc8bfe`）

1. `274737aba` 类1 · 2. `565e5da0a` 类2 · 3. `3c7b69302` 类3 · 4. `acf1b5eac` 类4 · 5. 本卷 + cap 2494→2495。

落卷时再 fetch：`origin/main` 已前进至 `5bb0566d0`（#215 uc31 / #216 fastm 已并，cap 届值 2496）；与本支改动集只在两 policy 文件交叠（零 proof/证据文件交叠）。并线期按常设预授权「cap 以合并树实测恰等步进」重算：union = 2496 + 本支新增受管件 2 = 2498，链注追加、dual-keep 双留，既有注记零改写。

---

*PROOF-MAINT-A REQUEST · 2026-11-06 起草 · **`post_prove_dual_pass`** · ⛔push ⛔merge 主线 · alone ≠ dual · base `origin/main` @`db0dc8bfe` · worktree `meetwise-pmaint` · branch `line/pmaint-draft` · 新增受管件 2（判据模块 + 本卷）· est live=0 · `actualSpendCny=null`*
