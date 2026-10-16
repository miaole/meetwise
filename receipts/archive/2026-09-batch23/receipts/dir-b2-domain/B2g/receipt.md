# B2g 批收据 — DIR-1 B2 domain 目录拆解刀（第 7/19 批）

**Batch**: B2g（§5 表 B2g 行：checkpoint/ 域 2 文件）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-09）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3 · pre_exec_dual BOTH PASS · 协调方 EXEC 授权面内机械执行）
**Base tip**: 本批开席 `40975a40`（B2f 批后 tip）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批 B2a @ `196c8984` · B2b @ `d41b7c41` · B2c @ `442b1af6` · B2d @ `bd426386` · B2e @ `aba8ac2e` · B2f @ `40975a40`）
**Commit**: 本批一 commit（author `mw-dirb2-b2g` · hash 见交付报告）· releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：`git pull origin line/dir-b2-domain` 后 **Already up to date（双侧 tip `40975a40`）· 开席工作树干净**；SOP 沿 B2a–B2f；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH/TOKSTREAM/隐私主线/r4 面零触，本批改动面见 §1）。
- **lockfile 口径（协调方预警面亲证）**：merge-base(HEAD, origin/main) = **origin/main tip `c4244470` 本体 → 0 个未拉主线提交**；`git log e2834082..HEAD -- pnpm-lock.yaml` = **0 commit**（本支线自 base 起零触碰）；`git show c4244470 --stat -- pnpm-lock.yaml packages/db/src` 双零——主线演进全在本线历史内，**"主线 lockfile 变化" 落在漂移支线合并面（`feat/mysql-schema-skeleton` tip 提交语 nail 三键绿），不在本线待拉面**；G0「lockfile 零改」= 本批零改（staged + worktree 双向 PASS）；tsc 批前基线 sha 与 B2a–B2f 六批连续基线逐字节相同（§2 G2 行）= 环境无位移机械反证。
- **漂移预检（fresh 亲跑）**：
  - own-line 触史：checkpoint-privacy.ts / checkpoint-thread.ts 自 base **零 commit 触史**（未移动过）；本批其余面（index.ts · manifest · proof · runner）触史 = **仅本线自身白名单 commit**（B2d `bd426386` transcript 面 · B2e `aba8ac2e` manifest · B2f `40975a40` runner/manifest，`git log` 亲证）——零外来漂移。
  - 漂移支线 `origin/feat/mysql-schema-skeleton` @ `3be96fc6`（B2b 起各批预警面复跑 · tip 自 B2f 时 `afefa60e` 前进至 `3be96fc6`）：与本批面交集文件 = `index.ts`（drift hunks :69/:92/:287/:306/:367/:391/:488 —— **与本批 ② 面 :35–:38 零同行级交集**）· `tenant-wiring.manifest.ts`（drift hunks :144/:154/:167/:224 —— **与本批 :251 零交集**）· `runner`（drift hunks :1311,13/:1366,7 与本批 :1321/:1369 **行级覆盖**，细账见下）· `transcript/int-transcript.ts`（drift 侧仍平铺位零移，其 import 仍 `'../checkpoint-privacy.ts'` 平铺形，合并期改写属他批面）。
  - **runner 行级交集细账（诚实登记）**：drift hunk `@@ -1311,13` 的 -/+ 对落在 :1314/:1320（`transcript/int-transcript.ts`→`int-transcript.ts` 反向前缀 · drift 树基线早于 B2d），本批 :1321 在该 hunk 内为 **context（drift 未触）**；drift hunk `@@ -1366,7` 的 -/+ 对**正落 :1369**——**同行异串交集**（drift 改行内 int-transcript 段 `transcript/int-transcript.ts`→`int-transcript.ts` · 本批改同行 checkpoint-privacy 段 `checkpoint-privacy.ts`→`checkpoint/checkpoint-privacy.ts`，两侧互不含对方的串）→ 合并期需一行文本调和（机械并集：`'packages/db/src/int-transcript.ts', 'packages/db/src/checkpoint/checkpoint-privacy.ts',`），**属协调方合并面非本批停手条件**（非 W 线冻结命中 · 本批门全绿 · 本批内容自洽）；drift 侧 `checkpoint-privacy.ts` 各行均未加前缀（其树早于本批，预期形）。

## 1. 批内文件清单与 mv 证据（§5 B2g 行：checkpoint-privacy(123行) · checkpoint-thread(34行)）

| # | 移动 | 证据（`git diff --cached -M`） |
|---|------|-------------------------------|
| 1 | `packages/db/src/checkpoint-privacy.ts` → `packages/db/src/checkpoint/checkpoint-privacy.ts` | `R099`（similarity 99%）= R100 + **①类 1 行**（:1 `import type { Client } from './principal.ts'`→`'../principal.ts'` 锚；blob 直比仅此一行 · 引号外逐字节同） |
| 2 | `packages/db/src/checkpoint-thread.ts` → `packages/db/src/checkpoint/checkpoint-thread.ts` | `R097`（similarity 97%）= R100 + **①类 1 行**（:1 同上 principal 锚） |

**白名单随批改（B2g 实面 · §3 四类对账 · staged 面 = 2 mv + 7 文件 = 9 条目 · 18 内容行对，零第八方）**：

- **① 包内 import（5 行 = 移动件自引 2 + 消费件 3）**：自引 2 见上表；消费件 3 = `interview-jobs.ts:5`、`uc052-checkpoint-physical.ts:22`（两者 `'./checkpoint-privacy.ts'`→`'./checkpoint/checkpoint-privacy.ts'`，均后段批未移平铺件）+ `transcript/int-transcript.ts:21`（`'../checkpoint-privacy.ts'`→`'../checkpoint/checkpoint-privacy.ts'`——**B2d 已移件指本批移动件的跨域二段边，B2f 席教训「类 grep 须覆盖 `'../` 二段形式」亲核捕获形**）。`principal.ts` 锚本体零触（仅指锚 specifier 改前缀）。
- **② 桶 re-export（4 行）**：`index.ts` :35/:36（checkpoint-thread 值+型两块）· :37/:38（checkpoint-privacy 值+型两块）specifier 加 `checkpoint/` 前缀；tenant 2 行（:33/:34）与全部导出名零改（`barrelTenantReexports===2` 断言面零触亲证）。
- **③ runner receipt（7 串/7 行 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改）**：`'packages/db/src/checkpoint-privacy.ts'` ×7 → 加 `checkpoint/` 前缀（:339/:353/:373/:402/:972/:1321/:1369，`git diff -U0` 亲证 7 hunk 全在块内）；**靶映射 7 靶与 §5 B2g 行逐靶吻合**（见 §3 靶对表）；checkpoint-thread runner=0 ✓（蓝本 §1.1）；`node --check` PASS；改后 `grep -nE "packages/db/src/checkpoint-(privacy|thread)\.ts['\"]" runner` = **0 命中**。
- **④ 仓内机械串（2 行）＝ §5 B2g 行外部串列 + ④ 通用律逐点 1:1**：
  - `packages/db/test/uc052-checkpoint-physical.proof.ts:26`（`'../src/checkpoint-privacy.ts'`→`'../src/checkpoint/checkpoint-privacy.ts'`，§5 B2g 外部串改点本尊）；
  - `packages/db/test/tenant-wiring.manifest.ts:251` **RESIDUAL_PATHS brace-glob 保序逐元素**加前缀（`{checkpoint-privacy,checkpoint-thread,`→`{checkpoint/checkpoint-privacy,checkpoint/checkpoint-thread,`——同元素序不变 · 元素数 9 不变；WIRED_FILES :147/:157/:170/:227/:233/:239 零涉 checkpoint ✓；消费面 `tenant-wiring-e5.proof.ts` 仅 `RESIDUAL_PATHS.length>0` 断言，length 零变 ✓）。
- **引号外零改亲证**：9 条目 ×18 行对逐行 quote-stripped 逐字节比对 = **0 违例**（node 逐 hunk -/+ 队列配对脚本亲跑 · G0 期间捕获并修正本席一处 ① 形误写：interview-jobs/uc052-checkpoint-physical 初写为 `'../checkpoint-privacy.ts'` 后改正 `'./checkpoint/checkpoint-privacy.ts'`——平铺消费件应 `./<域>/` 形，属白名单面当批收口非追绿重试）· 全文件行数零变；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：全程 `grep -a`（NUL 字节两文件 `qbank-generation-projection.ts`/`qbank-provider-input.ts` 属 B2r 批本批零触，且 -a 全文亲证两文件零 checkpoint 引用）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：node_modules 在树 · `meetwise-postgres-dev` Up 6h+ healthy (54329) · `.env` ABSENT 盘上亲证 · 每次 prove/runner/tsc 调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL`（env 亲证零模型键）。批前基线于净树 @ `40975a40` fresh 亲跑（G3 pre 经 stash 取净树）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R099/R097 rename 检出 · blob 直比 Δ=1/1（全 ①类）· **18 行对 quote-stripped 逐字节相同 0 违例** · `node --check` PASS · runner 残留 grep=0 · 7 hunk 全在 :93–:1640 · 全仓旧路径串 0（`'./`+`'../`+`src/` 三形态兜底 grep · e2e//docker/ 零命中）· lockfile 双向零改 | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：输出逐字节相同**（stash 净树基线亲跑 diff 为空 · floors/testCount 37/350 同值 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | EXIT=2 · sha 同左 | **逐字节相同**（diff -q 空）= 七批连续 B2a–B2g |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G3 | `prove:uc052-checkpoint-physical`（直跑键 · 经唯一合法隔离入口 runner `uc052:checkpoint-physical:prove:raw` · §5 本批必跑 927 行重 proof） | EXIT=0 @ `40975a40`（17/17 case 全 pass · 35 行规范化序） | EXIT=0 @ `cc15bbe9`（17/17 全 pass） | **绿保持绿：规范化（容器名/端口/时间戳/receipt 文件名）后逐行相同，唯一差异 = proof 自盖 `"gitSha"` 章（`40975a40…`→`cc15bbe9…` · 设计内：proof 输出钉其运行所在 commit）**；`LOCAL_ISOLATED_PROOF_RECEIPT` 产出 ENOENT=0（§2 G3 行细账） |
| G4 | commit 后 `git status` | — | 0 entries（amend 折收据后复验） · runner 容器零残留（`meetwise-e2e-3886-*` 随失败/成功自动删除 · `docker ps -a` 亲证 0） | 干净 |

**G3 时序披露（C-UNCOMMITTED 门 · 非重试非洗红）**：本 proof 自带净树守卫（`git status --porcelain` 非空即 `C-UNCOMMITTED refuse` EXIT=1）→ 批后轮**必须在 commit 后树上执行**，与蓝本 §6.1「G3→G4」默认序强制倒置。attempts 全账：① G3 pre（stash 净树）EXIT=0（receipt `…17-15-43…855Z…json`）；② 批后首试 EXIT=1 = **C-UNCOMMITTED 自守卫拒跑**（树脏系批中协议态 · **非 proof 红 · 非基建故障**，其 receipt `…17-15-56…523Z…json` 记 refusal · 无 17-case 输出）；③ commit `cc15bbe9` 后净树批后轮 EXIT=0（receipt `…17-19-09…457Z…json`）。「红不存在」——② 为时序伪红，登记不洗。**post receipt sourceDigests 亲证 ③ 类改写正确性**：`packages/db/src/checkpoint/checkpoint-privacy.ts` 新路径在列 · **stale 旧路径 = NONE**（checkpoint-thread 不在此靶 sources = runner=0 旁证 ✓；`uc052-checkpoint-physical.ts` 仍旧位 = B2o 面未动 ✓）。

## 3. 靶对表（③ 类 7 串 → runner 靶 · 与 §5 B2g 行 receipt 靶列 1:1）

| runner:line | target | §5 B2g 靶列 | 批后实测 |
|---|---|---|---|
| :339 | `privacy-erasure:prove:raw` | privacy-erasure:prove ✓ | ③ 改写（sourceDigests 亲证新路径） |
| :353 | `privacy-erasure:pause-upgrade:prove:raw` | privacy-erasure:pause-upgrade ✓ | ③ 改写 |
| :373 | `privacy-erasure:http:prove:raw` | privacy-erasure:http ✓ | ③ 改写 |
| :402 | `checkpoint-role:prove:raw` | checkpoint-role ✓ | ③ 改写 |
| :972 | `uc052:checkpoint-physical:prove:raw` | uc052:checkpoint-physical ✓ | **本批必跑直跑键 · pre/post EXIT=0→0** |
| :1321 | `int-transcript-answer-fact-root:prove:raw` | int-transcript-answer-fact-root ✓ | ③ 改写 |
| :1369 | `scor-01:prove:raw` | scor-01 ✓ | ③ 改写（此行 = 漂移支线同行异串交集点，§0 登记） |

R5 口径：receipt 靶批内必跑集合=∅；本批实跑 = 直跑键 1 靶（必跑）· 其余 6 靶未跑（post 双审指令 + B2s 终批 117 靶 sweep 兜底）· checkpoint-thread 无靶 ✓。

## 4. S1 判留复述登记（Ban 10 · 本批零新增）

- S1 八处判留清单**零涉本批移动名**（`db-acl:267/490 · qbank-source:2 · uc052-checkpoint-physical.proof.ts:7 · qbank-route-scope-cache:16 · qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc-e2e-014-026:19`）——其中 `uc052-checkpoint-physical.proof.ts:7` 头注串指 `packages/db/src/uc052-checkpoint-physical.ts`（**B2o 批面 · 本批未动该文件 · 判留原样延续**，本节复述登记）。
- **新增判留登记**：`ai-docs/delivery/receipts/` 下历史收据 JSON 4 处含旧路径 `packages/db/src/checkpoint-privacy.ts` sourceDigests 键（uc052-pool-role-leak · gap-priv-external-sink-retention ×2 · uc052-checkpoint-physical evidence）——历史证据面（sha256 钉当时字节）判留零改（B2a–B2f 同判：档案收据非机械消费面）。
- G3 pre 输出 `disclosure2.seal` 散文串 `packages/db/src/uc052-checkpoint-physical.ts sealCheckpointErasureAuthz` —— 该文件本批未动（B2o 面），散文串持续为真，零处置。

## 5. 收口判定

**B2g 收口判定：G0/G1/G2/G3/G4 全对表通过（绿保持绿 · 红同形红 · tsc sha 七批连续 · receipt ENOENT=0 · sourceDigests 新路径亲证 stale=NONE）· 1 commit 1 收据（收据经 amend 折入本批唯一 commit——C-UNCOMMITTED 净树门时序强制，amend 树差仅本收据文件，proof `gitSha=cc15bbe9` 即折入前树 · 树内容≡最终树除本收据）· §5 B2g 行外部串 2 点 1:1 收口 · B2f 席教训（`'../` 二段形亲核）落实：transcript/int-transcript.ts:21 跨域二段边当批收口 · 蓝本 §5 B2g 行状态由本收据承载推进（蓝本原文零改写）。**

---

*DIR-1 B2 · B2g/19 · 2026-10-07 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用） · est 0 live · .env ABSENT*
