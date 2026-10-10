# B2o 批收据 — DIR-1 B2 domain 目录拆解刀（第 15/19 批）

**Batch**: B2o（§5 表 B2o 行：privacy/ 后段 3 文件）· **EXEC**: 双任务席（mw-core 席制·B 线）
**Date**: 2026-10-10（worktree 时钟）· **Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席 `git fetch origin` → `origin/line/dir-b2-domain` tip `dee8bc4e`（= B2n 批后终版·**Already up to date**）· 工作树干净 · **首版 commit `03e75893`**（mv+白名单首版即全绿 · 无 ① 补齐轮）→ **收据经再 amend 折入**（C-UNCOMMITTED 净树门时序强制 · 同 B2g–B2n 先例 · 终版 hash 见交付报告 = 首版 + 本收据 docs-only）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g `cc76a554` · B2h `5bd79258` · B2i `40dc4551` · B2j `4a8b47b5` · B2k `3003665e` · B2l `ce050e1e` · B2m `6027ff49` · B2n `dee8bc4e`）
**Commit author**: `mw-dirb2-b2o` · releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：开席 fetch → 本支线 tip `dee8bc4e` 零前进 · 工作树干净；SOP 沿 B2a–B2n 十五先例；W 线冻结序 + loop §3 冲突表零命中（本批改动面见 §1；apps src 零触）。
- **主线漂移（亲跑）**：`git fetch origin main` → tip `c4244470`（与 B2n 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体`。
- **支线亲核**：`origin/line/unstub-erase` `03209663` · `origin/line/trial-grant` `3ef2403c` · `origin/line/b110-recruiter-gate` `ee02bf4d` · `origin/line/obs-ready` `3684bc00` 四支线 tip 同值零前进；**唯一前移 = `origin/feat/mysql-schema-skeleton` `a03b9371` → `7680cbd1`**（diff 实读 = 单 docs 提交 `product-campaign-LEDGER.md` PROCESS-E3 登记·非代码面）。
- **漂移支线 vs 本批面行级交集（亲跑）**：skeleton 前移 diff 文件面 = `ai-docs/delivery/harness/product-campaign-LEDGER.md` 一件；本批 3 移动名 + 9 编辑面文件在该 diff **零命中**——**零修改交集 → 不停手照常执行（B2m/B2n 同判例）**。
- **环境在飞面**：node_modules 在树 · `.env` ABSENT 盘上亲证 · ambient env 零 MODEL 键（每次调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 亲包）· `meetwise-postgres-dev`（54329）Up healthy（G3 隔离跑 PG 面用）· 批内两查 docker 面零 `meetwise-e2e-*` 瞬态/残留。
- **lockfile 口径**：B2a–B2n 全批链 `pnpm-lock.yaml` 零改；本批 staged + worktree 双向 `git diff --quiet pnpm-lock.yaml` PASS；tsc 三包批后 sha 与批前逐字节相同 = 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2o 行：uc052-checkpoint-physical(251行) · uc052-external-sink-async-purge(296行) · uc052-internal-erasure(275行)）

| # | 移动 | 证据（`git diff --cached -M --name-status` @首版 `03e75893`） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/uc052-checkpoint-physical.ts` → `packages/db/src/privacy/uc052-checkpoint-physical.ts` | `R098` = R100 + **①类 3 行**（:11 `./principal.ts`→`../principal.ts` 锚向 · :17 `./privacy/privacy-authorization.ts`→`./privacy-authorization.ts` **域内互引降级** · :22 `./checkpoint/checkpoint-privacy.ts`→`../checkpoint/…` 跨域锚向；:37 `./uc052-internal-erasure.ts` 同域零改；251 行零变） |
| 2 | `packages/db/src/uc052-external-sink-async-purge.ts` → `packages/db/src/privacy/uc052-external-sink-async-purge.ts` | `R099`（:17 锚向 + :18 域内互引降级 · 296 行零变） |
| 3 | `packages/db/src/uc052-internal-erasure.ts` → `packages/db/src/privacy/uc052-internal-erasure.ts` | `R098`（:9 锚向 + :15 `./transcript/int-transcript-projection.ts`→`../transcript/…` 跨域锚向 + :21 域内互引降级 · 275 行零变） |

**盘点口径**：三文件名全仓 any-form sweep（`rg -l`）——消费件 = db src（checkpoint-physical:37 域内互引 1 行·index.ts 桶 2 行）+ db test 四 proof（internal-erasure:20 · async-purge:25/:33 · retention:27 · checkpoint-physical:23 各 1 行 import + checkpoint-physical :907 seal 披露串 ④ 类）+ runner ③ 类 6 串。apps/api、apps/worker、qdrant-store、conn-stack 零命中；`db-trigfam-unify.proof.ts:17` 为纯名 prose（非路径串·零改）；uc052-external-sink-retention **无独立 src 文件**（实现居 internal-erasure.ts·retention proof import 即 internal-erasure——§5 B2o 行 3 文件口径对账 ✓）。

**白名单随批改（B2o 实面 · §3 四类对账 · staged 面 = 3 rename + 6 modified = 9 条目 · numstat +22/−22 · 零第八方）**：

- **① 包内 import（12 行 = 移动件自引 8 行中 7 改 + 消费件 5）**：自引——checkpoint:11/:17/:22 · async-purge:17/:18 · internal:9/:15/:21（域内互引 3 行 `./privacy/privacy-authorization.ts`→`./privacy-authorization.ts` 为本批特有形态：B2n 已把 authorization 移入 privacy/·本批三件跟进后 B2n 的「跨域平铺向」升级为「域内互引」）；消费件——四 proof `../src/uc052-*.ts`→`../src/privacy/uc052-*.ts` 5 行（checkpoint proof :23 · async-purge proof :25/:33 · retention proof :27 · internal proof :20）。
- **② 桶 re-export（2 行）**：`index.ts` :556 `export * from './uc052-internal-erasure.ts'` / :557 `export * from './uc052-external-sink-async-purge.ts'` specifier 加 `privacy/` 前缀（checkpoint-physical 不在桶面亲证·其导出经 internal-erasure 再导出面）；全部导出名零改。
- **③ runner receipt（6 串/6 行/4 hunks · 全带 `const isolatedReceiptSources = {` 上下文头 · 块外零改亲证）**：`'packages/db/src/uc052-internal-erasure.ts'` ×4（:935/:948/:959/:971）+ `'…/uc052-external-sink-async-purge.ts'` ×1（:958）+ `'…/uc052-checkpoint-physical.ts'` ×1（:970）→ 各加 `privacy/` 前缀（节点脚本锚定替换 4+1+1 = 6）；`node --check` PASS；改后旧形态残留 grep = 0 命中（唯一命中为 privacy/ 内域内互引新形态·正确）。
- **④ 仓内机械串（1 行）**：`uc052-checkpoint-physical.proof.ts:907` disclosure2.seal `'packages/db/src/uc052-checkpoint-physical.ts sealCheckpointErasureAuthz'`→`privacy/…`（receipt 落盘串·路径真相保持）——**= §5 B2o 行外部串「imports ×3（① 类）+ :907 seal 披露串（④ 类）」对账 ✓**（:23 import 为该 proof 唯一移动名 import 行；×3 计为 import 块三行组 :21–:23 面）；manifest ④ 面零涉（tenant-wiring.manifest.ts 三名 grep 0 命中·:245 glob 零涉亲证）。
- **引号外零改亲证**：22 行对逐行剥引号串后逐字节比对 = **0 违例**（node 配对脚本亲跑）；全文件行数零变（251/296/275 + 消费件/桶/runner 仅行内替换）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：本批全部 9 编辑面文件 node 字节级 NUL 检查 clean（`buf.indexOf(0)` 亲跑 9/9）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

批前基线于净树（HEAD `dee8bc4e`）fresh 亲跑，先基线后动手，无 stash 环节。批后轮于首版 commit `03e75893` 树执行（内容 ≡ 首版 commit 树；C-UNCOMMITTED 时序同先例）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R099×1 + R098×2 rename 检出 · 22 行对 quote-stripped 逐字节相同 **0 违例** · `node --check` PASS · runner 4 hunk 全带上下文头（块外零改）· 旧路径串残留 = 0（:7 头注 S1 判留面见 §4）· lockfile 双向零改 · 9 文件 NUL clean | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过（**规范化同形**：diff 仅 loop 目录后缀/时戳/uuid/PID 挥发面 · B2f/B2l/B2m/B2n 同判） |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post 输出逐字节相同**（`cmp` 空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | EXIT=2 · **sha 同基线** | **逐字节相同** |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | EXIT=2 · **sha 同基线** | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | EXIT=2 · **sha 同基线** | **逐字节相同**（三包行数 24/37/44 与 B2n 批记录基线行数同形 · sha 不同值 = node_modules 代次差异非代码面·本批基线自洽闭环） |
| G3 | `prove:uc052-internal-erasure`（直跑键 · 经唯一合法隔离入口 runner `uc052:internal-erasure:prove:raw`） | EXIT=0（✓ UC052 internal erasure prove PASS · 11 case 全 pass） | EXIT=0（同 PASS） | **绿保持绿** |
| G3 | `prove:uc052-external-sink-retention`（经 runner `uc052:external-sink-retention:prove:raw`） | EXIT=0（✓ retention prove PASS · gap OPEN） | EXIT=0 | **绿保持绿** |
| G3 | `prove:uc052-external-sink-async-purge`（经 runner `uc052:external-sink-async-purge:prove:raw`） | EXIT=0（✓ async-purge prove PASS · stub path evidenced） | EXIT=0 | **绿保持绿** |
| G3 | `prove:uc052-checkpoint-physical`（经 runner `uc052:checkpoint-physical:prove:raw` · 927 行重 proof） | EXIT=0（✓ checkpoint physical prove PASS） | EXIT=0 | **绿保持绿** |
| G3 | receipt ENOENT 观察 | pre 四靶各产出 1 只（`…T04-07/04-08…` 时段 4 只） | post 四靶各产出 1 只（`…T04-10/04-11…` 时段 4 只） | **ENOENT=0 双向成立（8/8 产出 · outcome=passed · exitCode=0 · releaseEvidence=false 标注一致）；post 4 只 sourceDigests 亲证解析新路径 `packages/db/src/privacy/uc052-*.ts`（internal 靶 1 串 · retention 靶 1 串（internal-erasure 承载）· async-purge 靶 2 串 · checkpoint 靶 2 串）· 零 stale db 平铺旧形态**——③ 类改写正确性机械证据 · E4 反面教训闭环 |
| G4 | commit 后 `git status` | — | **0 entries**（首版后亲证）· docker 面仅环境件 `meetwise-postgres-dev Up healthy`（非本批产物）· 批内两查零 `meetwise-e2e-*` 容器瞬态/残留 | 干净 |

**attempts 全账（Ban retry-to-green）**：G3 直跑键 pre 4 + post 4 = 8 次（逐键单发）；G2 pre 3 + post 3 = 6 次（首版即 sha 同基线 · 无补齐轮）；G1 五门 pre 1 轮 + post 1 轮 = 10 次——**共 24 attempts** · 无 stash 伪红 attempt · 无 retry-to-green。

## 3. 靶对表（③ 类 6 串 → 4 唯一 runner 靶 · 与 §5 B2o 行 receipt 靶列对账）

| runner:line | target | 承载串（本批移动名） | R5 处置 |
|---|---|---|---|
| :935 | `uc052:internal-erasure:prove:raw` | **uc052-internal-erasure** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 新路径亲证） |
| :948 | `uc052:external-sink-retention:prove:raw` | **uc052-internal-erasure** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 新路径亲证） |
| :958 | `uc052:external-sink-async-purge:prove:raw` | **uc052-external-sink-async-purge** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 新路径亲证） |
| :959 | 同上（双串行） | uc052-internal-erasure | 同 :958 已跑（同靶） |
| :970 | `uc052:checkpoint-physical:prove:raw` | **uc052-checkpoint-physical** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 新路径亲证） |
| :971 | 同上（双串行） | uc052-internal-erasure | 同 :970 已跑（同靶） |

**§5 B2o 行靶列对账（1:1 吻合 · 零差异）**：checkpoint-physical（1）= uc052:checkpoint-physical ✓；async-purge（1）= uc052:external-sink-async-purge ✓；internal-erasure（4）= uc052:internal-erasure · uc052:external-sink-retention · uc052:external-sink-async-purge · uc052:checkpoint-physical ✓——串总数 6 与实改 6 ✓（唯一靶 4）。R5 口径：receipt 靶批内必跑集合=∅；本批实跑 = 直跑键 4 键（经 :935/:948/:958/:970 四靶）= §5 靶列并集全部 4 靶**全数批内跑讫**（B2o 批 receipt 靶列恰为直跑键族·无批外余靶·post 双审/B2s sweep 兜底口径照旧）。

## 4. S1 判留复述登记（Ban 10 · 本批新增登记）

- **S1 在册判留（本批面）**：`packages/db/test/uc052-checkpoint-physical.proof.ts:7` 头注 Disclosure 2 prose 串 `packages/db/src/uc052-checkpoint-physical.ts`（**S1 第八处清单在册 · 蓝图 §5 S1 行明文「B2o 批收据复述登记」·判留延续零改**·:7 非本批改行；同文件 :907 ④ 类机械串已随批改讫——头注 prose 与机械串的处置分叉 = 蓝图原文口径）。
- **S1 其余七处零涉本批 3 名**（db-acl:267/490 · qbank-source:2 · qbank-route-scope-cache:16 · qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc-e2e-014-026:19 亲证）。
- **蓝本明文判留延续**：`packages/db/src/transcript/int-transcript.ts:7` 头注「全部复用 packages/db/src/privacy-authorization.ts（0091 冻结）」——src 注释面判留陈旧零改（B2n 已登记·本批复述）。
- **本批新增判留（S1 同型 · 全部 ai-docs/历史档案面 = B2s 终批 grep 路径集外 · 当批补登）**：`ai-docs/delivery/receipts/dir-b2-domain/B2{d,n}/receipt.md`（历史收据引及 uc052 三名旧路径串·append-only 不改）+ 本收据自身复述串。其余全仓旧形态旧路径串 grep = 0（§1 ③）。
- `packages/db/src/` 平铺面三名旧文件 = 0 残留（git mv 后 `ls packages/db/src/uc052-*` 空亲证）；`./uc052-internal-erasure.ts` 在 privacy/ 内域内互引 = 新正确形态非残留。

## 5. 收口判定

**B2o 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 4 门 + parity base 红同形逐字节 · tsc 三包 sha 批后≡批前首版即过无补齐轮 · 22 行对白名单 payload 映射 0 违例 · 旧路径串残留 0（:7 头注+蓝本 int-transcript.ts:7 判留在册）· receipt 8/8 产出 ENOENT=0 + sourceDigests 新路径零 stale）· 1 commit 1 收据（首版 `03e75893` → 收据再 amend = 终版）· §5 B2o 行外部串 = checkpoint proof import ① 类改讫 + :907 seal ④ 类改讫 + :7 头注 S1 判留复述 ✓ 亲证 · §5 靶列 4 靶 1:1 零差异且批内全数跑讫 · 漂移：main/四支线零前进 + skeleton 前移 `a03b9371→7680cbd1` 单 docs 提交与本批全编辑面零交集 → 照常执行 · 批内零瞬态容器 · 蓝本 §5 B2o 行状态由本收据承载推进（蓝本原文零改写）。**

---

*DIR-1 B2 · B2o/19 · 2026-10-10 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
