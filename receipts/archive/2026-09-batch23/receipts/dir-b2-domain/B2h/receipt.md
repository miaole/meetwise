# B2h 批收据 — DIR-1 B2 domain 目录拆解刀（第 8/19 批）

**Batch**: B2h（§5 表 B2h 行：jobs/ 域 4 文件）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-09）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3 · pre_exec_dual BOTH PASS · 协调方 EXEC 授权面内机械执行）
**Base tip**: 本批开席 `6552fb04`（B2g 批后 tip）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批 B2a @ `196c8984` · B2b @ `d41b7c41` · B2c @ `442b1af6` · B2d @ `bd426386` · B2e @ `aba8ac2e` · B2f @ `40975a40` · B2g @ `6552fb04`）
**Commit**: 本批一 commit（author `mw-dirb2-b2h` · hash 见交付报告）· releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：`git pull origin line/dir-b2-domain` 后 **Already up to date（双侧 tip `6552fb04`）· 开席工作树干净**；SOP 沿 B2a–B2g；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH/TOKSTREAM/隐私主线/r4 面零触，本批改动面见 §1）。
- **lockfile 口径**：merge-base(HEAD, origin/main) = **origin/main tip `c4244470` 本体 → 0 个未拉主线提交**（B2g 同值）；`git log e2834082..HEAD -- pnpm-lock.yaml` = **0 commit**；G0「lockfile 零改」= 本批零改（staged + worktree 双向 PASS）；tsc 批前基线 sha 与 B2a–B2g 七批连续基线逐字节相同（§2 G2 行）= 环境无位移机械反证。
- **漂移预检（fresh 亲跑）**：
  - own-line 触史：diagnosis-jobs / quiz-jobs / gateway-dispatch / worker-job-wakeup 四文件自 base **零 out-of-line 触史**（`git log --all` 亲证：末次触手 = B1 `409843b3` 与更早祖先 `d63702bc`(dbsb1)/`6cd621cc`/`db0d513f` 等，全在本线历史内）；本批其余面（index.ts · manifest · runner · conn-stack · r2 proofs）触史 = **仅本线自身白名单 commit**（B2b–B2g 各批 ④/②/③ 面）——零外来漂移。
  - 漂移支线 `origin/feat/mysql-schema-skeleton` @ `3be96fc6`（tip 自 B2g 时未前进）：与本批面交集文件 = `index.ts`（drift 单 hunk `@@ -367,6 +367,21 @@` 新增 :367–:382 区域 —— **与本批 ② 面 :42/:43/:108/:140/:146 零行级交集**）· `runner`（drift hunks :437/:448/:1714/:2473 —— **与本批 ③ 面 :422/:474/:480/:490/:499 零行级交集**）；四移动文件本体、manifest、conn-stack、r2 proofs 零涉（`git diff --stat` 亲证交集仅此二文件）。

## 1. 批内文件清单与 mv 证据（§5 B2h 行：diagnosis-jobs(87行) · quiz-jobs(89行) · gateway-dispatch(63行) · worker-job-wakeup(35行)）

| # | 移动 | 证据（`git diff --cached -M`） |
|---|------|-------------------------------|
| 1 | `packages/db/src/diagnosis-jobs.ts` → `packages/db/src/jobs/diagnosis-jobs.ts` | `R100`（blob Δ=0 · 唯一相对引 `:6 './quiz-jobs.ts'` 同域不变） |
| 2 | `packages/db/src/quiz-jobs.ts` → `packages/db/src/jobs/quiz-jobs.ts` | `R100`（blob Δ=0 · 唯一 import `:5 'pg'` 外部包） |
| 3 | `packages/db/src/gateway-dispatch.ts` → `packages/db/src/jobs/gateway-dispatch.ts` | `R097`（similarity 97%）= R100 + **①类 1 行**（:5 `import { asGateway, type DbPool } from './principal.ts'`→`'../principal.ts'` 锚；blob 直比仅此一行 · 引号外逐字节同） |
| 4 | `packages/db/src/worker-job-wakeup.ts` → `packages/db/src/jobs/worker-job-wakeup.ts` | `R100`（blob Δ=0 · 唯一 import `:13 'pg'` 外部包） |

**白名单随批改（B2h 实面 · §3 四类对账 · staged 面 = 4 mv + 8 修改 = 12 条目 · 17 内容行对，零第八方）**：

- **① 包内 import（1 行改 + 1 行判定不变）**：自引改 1 = gateway-dispatch :5（principal 锚，上表）；判定不变 1 = `jobs/diagnosis-jobs.ts:6` `'./quiz-jobs.ts'` —— **同批同域互引（quiz-jobs 同批入 jobs/），`./` 形落位后仍正确**（B2f 席教训「`'../` 二段形亲核」落实：双形态 `'\./` + `'\.\./` 全仓 grep 亲证四名**零消费件**——inSRC 账面 quiz-jobs=1 即 diagnosis-jobs 本互引 · 其余三名 inSRC=0 · `packages/db/test/` 非桶直引六文件集零涉 jobs ✓）。`principal.ts` 锚本体零触。
- **② 桶 re-export（5 行）**：`index.ts` :42/:43（gateway-dispatch 值+型两块）· :108（worker-job-wakeup）· :140（quiz-jobs 多行块尾）· :146（diagnosis-jobs 多行块尾）specifier 加 `jobs/` 前缀；tenant 2 行（:33/:34）与全部导出名零改（`barrelTenantReexports===2` 断言面零触亲证）。
- **③ runner receipt（7 串/5 行 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改）**：quiz-jobs ×4（:422/:474/:490/:499）· diagnosis-jobs ×3（:422/:480/:490）加 `jobs/` 前缀；`git diff -U0` hunk 头亲证 5 hunk 全在块内（context 行 `const isolatedReceiptSources = {`）；**靶映射 5 靶与 §5 B2h 行逐靶吻合**（见 §3 靶对表）；gateway-dispatch runner=0 ✓ · worker-job-wakeup runner=0 ✓（蓝本 §1.1）；`node --check` PASS；改后 `grep -nE "packages/db/src/(diagnosis-jobs|quiz-jobs|gateway-dispatch|worker-job-wakeup)\.ts['\"]" runner` = **0 命中**。
- **④ 仓内机械串（6 行）＝ §5 B2h 行外部串列 1:1 + ④ 通用律逐点**：
  - `scripts/conn-stack/mysql-stack.m3-queue.skeleton.proof.mjs:17`（`join(root, 'packages/db/src/worker-job-wakeup.ts')`→`jobs/worker-job-wakeup.ts`）；
  - `scripts/conn-stack/mysql-stack.redis-wakeup.proof.mjs:21`（同上形）；
  - `apps/api/test/r2-p-api-route-classify.proof.ts:24`（worker-job-wakeup 串）· `apps/worker/test/r2-classify-job-route-prereq.proof.ts:60`（worker-job-wakeup 串）· `apps/worker/test/r2-p-worker-route-classify.proof.ts:32`（gateway-dispatch 串）——**诚实注**：§5 B2h 行括注三 r2 文件「（gateway-dispatch）」，实串身份 :24/:60 为 worker-job-wakeup、:32 为 gateway-dispatch；三处均在行列 1:1，全数随批改写，行注偏差不涉改写面；
  - `packages/db/test/tenant-wiring.manifest.ts:245` **RESIDUAL_PATHS brace-glob 保序逐元素**加前缀 ×3（`quiz-jobs`/`diagnosis-jobs`/`gateway-dispatch`→`jobs/…`——12 元素数不变 · 元素序不变；worker-job-wakeup 不在此 12 元素集 ✓；WIRED_FILES :147/:157/:170/:227/:233/:239 零涉 jobs ✓；消费面 `tenant-wiring-e5.proof.ts` 仅 `RESIDUAL_PATHS.length>0` 断言，length 零变 ✓）。
- **引号外零改亲证**：12 条目 ×17 行对逐行 quote-stripped 逐字节比对 = **0 违例**（node hunk -/+ 队列配对脚本亲跑）· 全文件行数零变；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：全程 `grep -a`（NUL 字节两文件 `qbank-generation-projection.ts`/`qbank-provider-input.ts` 属 B2r 批本批零触）。
- **批内自纠 attempts 全账（B2f/B2g 席教训 · 三笔，均门前机械自纠非追绿）**：
  1. ① gateway-dispatch:5 首笔 perl 锚定式 `'./principal.ts'$` 未吃行尾 `;` → 行未改（即时 sed 验出）→ 二笔 `';'` 尾式改正；
  2. ④ manifest :245 首笔 `,gateway-dispatch\}` 式误判该元素为尾元素（实为中位，后随 `,usage-calibration`）→ quiz/diagnosis 两元素已中、gateway-dispatch 漏 → 二笔 `,gateway-dispatch,` 式补讫（sed 验出）；
  3. G3 post 轮日志文件名相撞（`uc017*`/`uc018*` 各共用一名，后跑覆盖前跑——EXIT 当时逐键 echo=0 不失）→ orphan-post/abandon-post 两个日志体丢失 → 定向补采轮（同命令零改动 · EXIT=0 ×2 · attempts 全账见 §2 G3 行）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：node_modules 在树 · `meetwise-postgres-dev` Up 6h+ healthy (54329) · `.env` ABSENT 盘上亲证 · 每次 prove/runner/tsc 调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL`（env 亲证零模型键）。批前基线于净树 @ `6552fb04` fresh 亲跑（本批四直跑键无净树守卫拒绝事件：pre 于 commit 前净树 · post 于 commit `5bd79258` 后净树，B2g 时序先例沿用零倒置零 refusal）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R100×3/R097 rename 检出 · blob 直比 Δ=0/0/0/1（全 ①类）· **17 行对 quote-stripped 逐字节相同 0 违例** · `node --check` PASS · runner 残留 grep=0 · 5 hunk 全在 :93–:1640 · 全仓旧路径串 0（`'./`+`'../`+`packages/db/src/` 三形态兜底 grep · e2e//docker/ 零命中；唯一余留 = 同域互引 `jobs/diagnosis-jobs.ts:6 './quiz-jobs.ts'` 预期不变式）· lockfile 双向零改 | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：输出逐字节相同**（pre/post 全输出 `diff` 为空 · floors/testCount 同值 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | EXIT=2 · sha 同左 | **逐字节相同**（diff -q 空）= 八批连续 B2a–B2h |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G3 | `prove:uc017-orphan`（直跑键 · 经唯一合法隔离入口 runner `uc017:orphan:prove:raw`） | EXIT=0 @ `6552fb04`（receipt `…17-29-00…` · 18 assert 行） | EXIT=0 @ `5bd79258`（receipt `…17-34-10…` + 补采轮 EXIT=0） | **绿保持绿：规范化（容器名/端口/时间戳/receipt 文件名）后 assert 体逐行相同（18 行）** · 该 proof 族 stdout 不盖 gitSha 章（与 B2g uc052 异 · 诚实注）；`LOCAL_ISOLATED_PROOF_RECEIPT` 产出 ENOENT=0 |
| G3 | `prove:uc017-nhp-load`（同上） | EXIT=0（receipt `…17-29-15…` · 46 assert 行） | EXIT=0（receipt `…17-34-18…`） | **同上：46 行规范化逐行相同** |
| G3 | `prove:uc018-abandon`（同上） | EXIT=0（receipt `…17-29-32…` · outcome=passed） | EXIT=0 ×2（receipt `…17-34-32…` + 补采轮 EXIT=0） | **receipt 级对表：pre/post 均 passed/EXIT=0**；**体级比对缺口诚实登记**——pre 轮日志体遭 §1 自纠 3 之文件名相撞覆盖不可恢复，补采轮仅得 post 体；体级 pre/post 比对可由 post 双审复跑补立（proof 文件本体零改 + tsc sha 三连逐字节同 + 同族 graph 体级全同旁证） |
| G3 | `prove:uc018-graph`（同上） | EXIT=0（receipt `…17-29-40…` · 18 assert 行） | EXIT=0（receipt `…17-34-39…`） | **同上：18 行规范化逐行相同** |
| G4 | commit 后 `git status` | — | 0 entries（amend 折收据后复验） · 本批自身 runner 容器零残留（`meetwise-e2e-{24947,25421,25723,25988,28808}-*` 全部随成败自删 · `docker ps -a` 亲证） | 干净（外来残留披露见 §4） |

**G3 时序披露**：本批四 proof 无 C-UNCOMMITTED 拒跑事件（B2g 形时序此批零发生）；post 轮按先例于 commit 后净树执行。**post receipt sourceDigests 旁证**：四 post receipt `outcome=passed exit=0 sources=5 stale-old-paths=0 jobs/-prefixed=0`——uc017/uc018 靶块 source 集不含本批移动名（runner 块直读 :704–:722 零移动串旁证一致），③ 类改写正确性由残留 grep=0 + 17 行对逐字节 + node --check + tsc sha 三连承载；5 个 receipt 靶（diagnosis/quiz/reaper/resume-derivative-reference/uc016:nhp-fault）按 R5 口径批内必跑集合=∅ 未跑，由 post 双审指令 + B2s 终批 117 靶 sweep 兜底。

## 3. 靶对表（③ 类 7 串 → 5 runner 靶 · 与 §5 B2h 行 receipt 靶列 1:1）

| runner:line | target | 串 | §5 B2h 靶列归属 | 批后实测 |
|---|---|---|---|---|
| :422 | `resume-derivative-reference:prove:raw` | quiz-jobs + diagnosis-jobs | diagnosis ✓ + quiz ✓ | ③ 改写（残留 grep=0） |
| :474 | `quiz:prove:raw` | quiz-jobs | quiz ✓ | ③ 改写 |
| :480 | `diagnosis:prove:raw` | diagnosis-jobs | diagnosis ✓ | ③ 改写 |
| :490 | `uc016:nhp-fault:prove:raw` | quiz-jobs + diagnosis-jobs | diagnosis ✓ + quiz ✓ | ③ 改写 |
| :499 | `reaper:prove:raw` | quiz-jobs | quiz ✓ | ③ 改写 |

R5 口径：receipt 靶批内必跑集合=∅；本批实跑 = 直跑键 4 靶（必跑 · EXIT 全 0）· 5 receipt 靶未跑（post 双审指令 + B2s 终批 117 靶 sweep 兜底）· gateway-dispatch / worker-job-wakeup 无靶 ✓。

## 4. S1 判留复述登记（Ban 10 · 新增一笔）

- S1 八处判留清单**零涉本批移动名**（`db-acl:267/490 · qbank-source:2 · uc052-checkpoint-physical.proof.ts:7 · qbank-route-scope-cache:16 · qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc-e2e-014-026:19`）——原样延续，本节复述登记。
- **新增判留登记一**：`packages/db/test/tenant-wiring.manifest.ts:246` `paths:` 描述性字段保留域前 bare 名（`resume.ts 18 · interview-jobs.ts 20 · commerce.ts 23 · payment.ts 10 · report.ts 10 · quiz-jobs/diagnosis-jobs 各 9 等`）——非路径非机械消费面（零 readFileSync/join 触手 · 人类可读注记），B2b/B2c/B2e 已移件在此同形保留（先例一致性）· 零改。
- **新增判留登记二（历史证据面）**：`ai-docs/delivery/receipts/` 下历史收据 4 文件 5 处含旧路径 `packages/db/src/{diagnosis-jobs,gateway-dispatch,quiz-jobs,worker-job-wakeup×2}.ts`（`2026-09-17-model-op-real-reconciler-wiring-prove.md` · `2026-10-06-an-mop-q45-gap-mop-03-dual-reconciler-q45-honesty-prove.md` · `mop03-cutover-review/00-summary.md` · `rcpt1-receipt-paths/correction-list.md`）——历史证据面判留零改（B2a–B2g 同判：档案收据非机械消费面）。
- **外来残留披露（G4 面 · 非本批产物）**：`meetwise-e2e-62497-cold2-stop-band-1-1791381408317` Exited(0)·约两日前（早于本批开席 · 非本批任何一跑所产）· 不越权清理原样保留，交协调方裁定。

## 5. 收口判定

**B2h 收口判定：G0/G1/G2/G3/G4 全对表通过（绿保持绿 · 红同形红 · tsc sha 八批连续 · receipt ENOENT=0 · 残留 grep=0）· 1 commit 1 收据（收据经 amend 折入本批唯一 commit · amend 树差仅本收据文件 · 顺修 commit 文内一处 mojibake 字符不改任何实质内容）· §5 B2h 行外部串 5 点 + ④ 通用律 manifest :245 1 点 1:1 收口 · B2f/B2g 席教训（双形态 grep + attempts 全账）落实：同域互引判定 1 笔 + 批内自纠 3 笔全账 §1 · 蓝本 §5 B2h 行状态由本收据承载推进（蓝本原文零改写）。累计 18/65 文件入域（B2a–B2h · 1+2+2+2+2+3+2+4），余 47 归 B2i–B2s。**

---

*DIR-1 B2 · B2h/19 · 2026-10-07 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用） · est 0 live · .env ABSENT*
