# B2n 批收据 — DIR-1 B2 domain 目录拆解刀（第 14/19 批）

**Batch**: B2n（§5 表 B2n 行：privacy/ 前段 3 文件）· **EXEC**: 双任务席（mw-core 席制·B 线）· **Date**: 2026-10-10（worktree 时钟）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席 `git pull origin line/dir-b2-domain` → **Already up to date（tip `6027ff49` = B2m 批后终版）· 工作树干净** · **首版 commit `08d15235`**（mv+白名单首版即全绿 · 无 ① 补齐轮）→ **收据经再 amend 折入**（C-UNCOMMITTED 净树门时序强制，同 B2g–B2m 先例 · 终版 hash 见交付报告 = 首版 + 本收据 docs-only）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g `cc76a554` · B2h `5bd79258` · B2i `40dc4551` · B2j `4a8b47b5` · B2k `3003665e` · B2l `ce050e1e` · B2m `6027ff49`）
**Commit author**: `mw-dirb2-b2n` · releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：开席 pull → Already up to date（tip `6027ff49`）· 工作树干净；SOP 沿 B2a–B2m 十四先例；W 线冻结序 + loop §3 冲突表零命中（本批改动面见 §1；apps src 零触）。
- **主线漂移（亲跑）**：`git fetch origin main` → tip `c4244470`（与 B2m 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体`。
- **任务提示面支线亲核**：五支线 tip 四同值零前进——`origin/line/unstub-erase` `03209663` · `origin/line/trial-grant` `3ef2403c` · `origin/line/b110-recruiter-gate` `ee02bf4d` · `origin/line/obs-ready` `3684bc00`；**唯一前移 = `origin/feat/mysql-schema-skeleton` `9a1fdc07` → `a03b9371`**（diff 实读 = score-writer S2 EXEC `50cb3238` + nail `2c3a7d80` + growth 回填 `a03b9371` 三 docs/code 提交落线）。
- **漂移支线 vs 本批面行级交集（亲跑）**：skeleton 前移 diff 触 `packages/db/src` 面**仅 `scoring-wire.ts`**（在册漂移件·非本批面）；`scripts/run-e2e-isolated.mjs` 在该 diff **零触碰**（name-only 亲证）；本批 3 移动名（db 平铺 privacy 三名）在该 diff **零文件级命中**——唯一字符串命中为两行 `packages/domain/src/privacy-erasure-preview.ts` tsc 误差清单行（**domain 同名族·docs 收据面·非本批 db 面**·S1 同判）；漂移侧 db 平铺新文件仍仅两件在册（`resume-privacy.ts` · `scoring-wire.ts`），**本批无第三件**。**零修改交集 → 不停手照常执行（B2m 同判例）**。
- **环境在飞面**：node_modules 在树 · `.env` ABSENT 盘上亲证 · ambient env 零 MODEL 键（每次调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 亲包）· `meetwise-postgres-dev`（54329）Up healthy（G3 隔离跑 PG 面用）· 批内两查 docker 面零 `meetwise-e2e-*` 瞬态/残留。
- **lockfile 口径**：`git log e2834082..HEAD -- pnpm-lock.yaml` = 0 commit；G0「lockfile 零改」= 本批零改（staged + worktree 双向 PASS 亲证）；tsc 批前三 sha 与批后逐字节相同 = 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2n 行：privacy-authorization(172行) · privacy-erasure-preview(90行) · vector-plane-erasure(126行)）

| # | 移动 | 证据（`git diff --cached -M --name-status` @首版/收据 amend 后同形） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/privacy-authorization.ts` → `packages/db/src/privacy/privacy-authorization.ts` | `R099` = R100 + **①类 1 行**（:1 `import type { Client } from './principal.ts'`→`'../principal.ts'` 锚向；172 行零变） |
| 2 | `packages/db/src/privacy-erasure-preview.ts` → `packages/db/src/privacy/privacy-erasure-preview.ts` | `R098`（同上 · :5 · 90 行零变 · 相似度 98%（短文件 1 行差）） |
| 3 | `packages/db/src/vector-plane-erasure.ts` → `packages/db/src/privacy/vector-plane-erasure.ts` | `R098`（:23 `./principal.ts`→`../principal.ts` 锚向 + :27 `./memory-vector-chunk-erasure.ts`→`'../memory-vector-chunk-erasure.ts'` 平铺未移件（memory 域 B2q 批面·跨域边 §4「privacy↔memory」二段第一形态）· :28 同域 `./privacy-authorization.ts` **零改**（域内互引）· 126 行零变） |

**盘点口径**：消费面 any-form 全仓 sweep（`./x.ts` + `../src/x.ts` + `../x.ts` 三式）——db src 消费件 = **uc052 三件平铺**（external-sink-async-purge:18 · internal-erasure:21 · checkpoint-physical:17 各恰 1 行 `./privacy-authorization.ts`，三件本体 B2o 批面·本批改其 import 行属 ① 类消费件改写）+ db test 消费件 = **uc052×4 proof**（internal-erasure:26 · external-sink-async-purge:27 · external-sink-retention:29 · checkpoint-physical:29 各恰 1 行 `../src/privacy-authorization.ts` = §5 B2n 行「M3 六文件面」原文对账：src 3 + test 4 = 7 消费行）；preview/vector-plane **零 db 包内消费件**（仅桶+runner）；`packages/domain/src/privacy-{authorization,erasure-preview}.ts` 同名族为 domain 包内自引（不同路径域 · 零改 · §4 登记）。

**白名单随批改（B2n 实面 · §3 四类对账 · staged 面 = 3 rename + 10 modified = 13 条目 · numstat +32/−32 · 零第八方）**：

- **① 包内 import（11 行 = 移动件自引 4 + 消费件 7）**：自引——authorization:1 / preview:5 两处 `./principal.ts`→`../principal.ts` 锚向 + vector:23 锚向 + vector:27 跨域平铺向（上表）；消费件——db src uc052 三件 `./privacy-authorization.ts`→`./privacy/privacy-authorization.ts` + db test uc052×4 proof `../src/privacy-authorization.ts`→`../src/privacy/privacy-authorization.ts`。
- **② 桶 re-export（6 行）**：`index.ts` :40/:41（privacy-authorization 值+型）· :554/:555（privacy-erasure-preview）· :565/:568（vector-plane-erasure）specifier 加 `privacy/` 前缀；tenant 2 行零触亲证；全部导出名零改。
- **③ runner receipt（14 串/14 行/13 hunks · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改亲证）**：`'packages/db/src/privacy-authorization.ts'` ×12（:937/:949/:960/:974/:1006/:1107/:1200/:1257/:1278/:1294/:1321/:1347）+ `'…/privacy-erasure-preview.ts'` ×1（:365）+ `'…/vector-plane-erasure.ts'` ×1（:1293）→ 各加 `privacy/` 前缀（**节点脚本块内锚定替换 12+1+1 = 14 恰对账 §5 B2n 行 12+1+1 靶列**）；`git diff -U0` 亲证恰 13 hunks 全带 `const isolatedReceiptSources = {` 上下文头；`node --check` PASS；改后残留 grep（三名旧形态·引号锚定）= **0 命中**；同数组内 `packages/domain/src/privacy-*.ts` 串零改亲证（③ 类仅 db 面）。
- **④ 仓内机械串（manifest :251 一行内两元素）**：`tenant-wiring.manifest.ts` :251 RESIDUAL_PATHS brace-glob `privacy-authorization`→`privacy/privacy-authorization` · `vector-plane-erasure`→`privacy/vector-plane-erasure`（:245 glob 零涉三名亲证；glob 内 `memory-vector-chunk-erasure` 仍平铺 = B2q 批面零预改；WIRED_FILES file: 实值零涉）——**= §5 B2n 行外部串「uc052×4 proof import（① 类）+ int-transcript.ts:7 判留」之外 ④ 实面 = manifest 两元素 亲证 ✓**。
- **引号外零改亲证**：32 行对逐行剥引号串后逐字节比对 = **0 违例**（node 配对脚本亲跑：rename 4 对双路径 pathspec 口径 + 非 rename 28 对；manifest 行组合双 payload 变换等值亲证）；全文件行数零变（172/90/126 + 消费件/桶/runner 仅行内替换）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：本批全部 13 编辑面文件 node 字节级 NUL 检查 clean（`buf.indexOf(0)` 亲跑）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

批前基线于净树（HEAD `6027ff49`）fresh 亲跑，先基线后动手，无 stash 环节。批后轮于首版 commit `08d15235` 树执行（内容 ≡ 首版 commit 树；C-UNCOMMITTED 时序同先例）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R099×1 + R098×2 rename 检出 · 32 行对 quote-stripped 逐字节相同 **0 违例**（白名单 payload 映射 32/32 · 含 manifest 组合变换）· `node --check` PASS · runner 残留 grep=0 · 13 hunk 全在 :93–:1640 全带上下文头 · 全仓旧路径串残留 = 全部 ai-docs 面+int-transcript.ts:7 判留登记（§4）· lockfile 双向零改 · 13 文件 NUL clean · tenant 2 行零触 | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同** sha `4d0d94f6`） |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过（**规范化同形**：diff 仅 receipt 路径时间戳/PID/uuid/loop 目录后缀挥发面 · B2f/B2l/B2m 同判） |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过（逐字节相同 sha `237444d4`） |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过（逐字节相同 sha `5dd70dc3`） |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post 输出逐字节相同**（`diff` 空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `cb491ccd236afcc3`（24 行） | EXIT=2 · **sha 同基线** | **逐字节相同**（cmp 亲证 · 与 B2m 批 sha 亦同值 = 环境无位移） |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `6244df5d4e0f3853`（37 行） | 同上 → **sha 同基线** | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `8690abf68c9dd4d9`（44 行） | 同上 → **sha 同基线** | **逐字节相同** |
| G3 | `prove:privacy-authorization`（直跑键 · 经唯一合法隔离入口 runner `privacy-authorization:prove:raw`） | EXIT=0（PASS=51 FAIL=0） | EXIT=0（PASS=51 FAIL=0） | **绿保持绿**：计数同值 |
| G3 | `prove:privacy-erasure-preview`（经 runner `privacy-erasure-preview:prove:raw`） | EXIT=0（PASS=18 FAIL=0） | EXIT=0（PASS=18 FAIL=0） | **绿保持绿** |
| G3 | `prove:vector-plane-erasure`（经 runner `vector-plane-erasure:prove:raw`） | EXIT=0（PASS=33 FAIL=0） | EXIT=0（PASS=33 FAIL=0） | **绿保持绿** |
| G3 | `prove:memory-vector-chunk-erasure`（经 runner `memory-vector-chunk-erasure:prove:raw`） | EXIT=0（PASS=19 FAIL=0） | EXIT=0（PASS=19 FAIL=0） | **绿保持绿**（跨域消费件回归：vector-plane 的 memory 依赖面） |
| G3 | receipt ENOENT 观察 | pre 四靶各产出 1 只（`…T03-49-1x…` 时段 4 只） | post 四靶各产出 1 只（`…T03-5x…` 时段 4 只） | **ENOENT=0 双向成立（8/8 产出正常 · outcome=passed exitCode=0 · release_evidence=false 标注一致）；post 4 只 sourceDigests 亲证解析新路径**——`privacy/privacy-authorization.ts`（auth/vector/memory-chunk 三靶）· `privacy/privacy-erasure-preview.ts`（preview 靶）· `privacy/vector-plane-erasure.ts`（vector 靶）· **零 stale db 平铺旧形态**（receipt 内 `packages/domain/src/privacy-*` 同名族串 = domain 面 ③ 类零改如常在卷）——③ 类改写正确性机械证据 · E4 反面教训闭环 |
| G4 | commit 后 `git status` | — | **0 entries**（首版后亲证）· docker 面仅环境件 `meetwise-postgres-dev Up healthy`（非本批产物）· 批内两查零 `meetwise-e2e-*` 容器瞬态/残留 | 干净 |

**attempts 全账（Ban retry-to-green）**：G3 直跑键 pre 4 + post 4 = 8 次（逐键单发）；G2 pre 3 + post 3 = 6 次（首版即 sha 同基线 · 无补齐轮）；G1 五门 pre 2 轮（首轮快查+落卷捕获轮·输出同形）+ post 1 轮 = 15 次——**共 29 attempts** · 无 stash 伪红 attempt · 无 retry-to-green。

## 3. 靶对表（③ 类 14 串 → 13 唯一 runner 靶 · 与 §5 B2n 行 receipt 靶列对账）

| runner:line | target | 承载串（本批移动名） | R5 处置 |
|---|---|---|---|
| :1006 | `privacy-authorization:prove:raw` | **privacy-authorization** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 新路径亲证） |
| :365 | `privacy-erasure-preview:prove:raw` | **privacy-erasure-preview** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 新路径亲证） |
| :1293 | `vector-plane-erasure:prove:raw` | **vector-plane-erasure** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 新路径亲证） |
| :1278 | `memory-vector-chunk-erasure:prove:raw` | **privacy-authorization** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 新路径亲证） |
| :937 | `uc052:internal-erasure:prove:raw` | privacy-authorization | 批内 0 跑（post 双审/B2s sweep） |
| :949 | `uc052:external-sink-retention:prove:raw` | privacy-authorization | 批内 0 跑（post 双审/B2s sweep） |
| :960 | `uc052:external-sink-async-purge:prove:raw` | privacy-authorization | 批内 0 跑（post 双审/B2s sweep） |
| :974 | `uc052:checkpoint-physical:prove:raw` | privacy-authorization | 批内 0 跑（post 双审/B2s sweep） |
| :1107 | `memory-governance:prove:raw` | privacy-authorization | 批内 0 跑（post 双审/B2s sweep） |
| :1200 | `mem02-summary:prove:raw` | privacy-authorization | 批内 0 跑（**红候选**·post 双审/B2s sweep 按红同形口径） |
| :1257 | `ctx06-deletion-closure:prove:raw` | privacy-authorization | 批内 0 跑（post 双审/B2s sweep） |
| :1294 | `vector-plane-erasure:prove:raw` | privacy-authorization（与 :1293 同靶双串行） | 同 :1293 已跑（同靶） |
| :1321 | `int-transcript-answer-fact-root:prove:raw` | privacy-authorization | 批内 0 跑（post 双审/B2s sweep） |
| :1347 | `int-transcript-remaining-sinks:prove:raw` | privacy-authorization | 批内 0 跑（post 双审/B2s sweep） |

**§5 B2n 行靶列对账（1:1 吻合 · 零差异）**：privacy-authorization（12）= privacy-authorization · uc052:internal-erasure · uc052:external-sink-retention · uc052:external-sink-async-purge · uc052:checkpoint-physical · int-transcript-answer-fact-root · int-transcript-remaining-sinks · mem02-summary（红候选）· memory-governance · memory-vector-chunk-erasure · vector-plane-erasure · ctx06-deletion-closure ✓——串总数 12+1+1 = 14 与实改 14 ✓（唯一靶 13）。R5 口径：receipt 靶批内必跑集合=∅（直跑键四键即承载其中四靶）；本批实跑 = 直跑键 4 键；其余 9 靶（uc052×4 · memory-governance · mem02-summary · ctx06-deletion-closure · int-transcript×2）未跑（post 双审 + B2s 终批 sweep 兜底）。

## 4. S1 判留复述登记（Ban 10 · 本批新增登记）

- S1 既有八处清单（db-acl:267/490 · qbank-source:2 · uc052-checkpoint-physical.proof.ts:7 · qbank-route-scope-cache:16 · qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc-e2e-014-026:19）——其中 `uc052-checkpoint-physical.proof.ts:7` 头注串为历史 provenance 注释（**判留延续**·:7 非本批改行）；其余七处零涉本批 3 名（亲证）。
- **蓝本明文判留（§5 B2n 行）**：`packages/db/src/transcript/int-transcript.ts:7` 头注「全部复用 packages/db/src/privacy-authorization.ts（0091 冻结）」——src 注释面·判留陈旧零改（本批收据复述登记）。
- **本批新增判留（S1 同型 · 全部 ai-docs 面 = B2s 终批 grep 路径集外 · 当批补登）**：`ai-docs/delivery/m2-tenant-authorization-model.md` · `ai-docs/delivery/execution-master-checklist.md` · `ai-docs/delivery/receipts/dir-b2-domain/B2d/receipt.md`（B2d 批历史收据·int-transcript 面引及本名）· `ai-docs/delivery/receipts/uc050-052-privacy-erasure/*.json`（2 只历史 evidence）· `ai-docs/delivery/receipts/uc052-pool-role-leak/prove/*.json`（8 只历史 prove receipt）——均历史档案/收据面，非机械消费面，判留陈旧零改。
- **同名族零涉登记**：`packages/domain/src/privacy-{authorization,erasure-preview}.ts` 本体 + `packages/domain/src/index.ts:78/:82/:452/:457` 桶引 + domain 桶 `privacy-authorization`/`privacy-erasure-preview` 导出名——domain 包自引形态，与 db 平铺 3 名同名不同路径域，零改；runner 数组内 `packages/domain/src/privacy-*.ts` 串 ③ 类零改亲证。
- apps/worker、conn-stack、qdrant-store、e2e 面三名 any-form sweep 0 命中（§1 ④）；`packages/db/src/` 平铺面三名旧形态 import 0 残留（any-form 三式终扫亲证）。

## 5. 收口判定

**B2n 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 4 门 + parity base 红同形逐字节 · tsc 三包 sha 批后≡批前首版即过无补齐轮 · 32 行对白名单 payload 映射 0 违例 · 全仓 3 名旧路径残留全部 ai-docs 面+蓝文明文判留登记 · receipt 8/8 产出 ENOENT=0 + sourceDigests 新路径零 stale）· 1 commit 1 收据（首版 `08d15235` → 收据再 amend = 终版）· §5 B2n 行外部串 = uc052×4 proof ① 类改讫 + manifest :251 两元素 ④ 类改讫 + int-transcript.ts:7 判留 ✓ 亲证 · §5 靶列 14 串 1:1 零差异（唯一靶 13 · 本批跑 4 · 余 9 归 post 双审+B2s sweep）· 漂移：main/四支线零前进 + skeleton 前移 `9a1fdc07→a03b9371` 与本批全编辑面零修改交集（唯一命中 = domain 同名族 tsc 误差清单 docs 行·S1 同判·runner 零触）→ 照常执行 · S1 新增 ai-docs 面判留登记 · 批内零瞬态容器 · 蓝本 §5 B2n 行状态由本收据承载推进（蓝本原文零改写）。**

---

*DIR-1 B2 · B2n/19 · 2026-10-10 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
