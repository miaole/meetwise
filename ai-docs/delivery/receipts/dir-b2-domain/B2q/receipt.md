# B2q 批收据 — DIR-1 B2 domain 目录拆解刀（第 17/19 批）

**Batch**: B2q（§5 表 B2q 行：memory/ 后段 5 文件）· **EXEC**: DIR-B2 域 B2q 批 EXEC 席（pure-mv 机械执行）
**Date**: 2026-10-10（worktree 时钟）· **Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席 `git fetch origin` → `origin/line/dir-b2-domain` tip `a18a1dd3`（= B2p 批后终版 · **零前进**）· 工作树干净 · **首版 commit `b31fe7e1`**（mv+白名单首版即全绿 · 无 ① 补齐轮 · commit 前 `git diff --cached --stat` 实物核对 9 files 24+/24-）→ **收据 docs-only amend 折入**（C-UNCOMMITTED 净树门时序 · 同 B2g–B2p 先例 · 终版 hash = 首版 + 本收据）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g `cc76a554` · B2h `5bd79258` · B2i `40dc4551` · B2j `4a8b47b5` · B2k `3003665e` · B2l `ce050e1e` · B2m `6027ff49` · B2n `dee8bc4e` · B2o `a18a1dd3` · B2p `4950bd51`）
**Commit author**: `dirb2-b2q <exec@meetwise.local>`（协调方本批指令指定 · B2p 同形命名律）· releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：开席 fetch → 本支线 tip `a18a1dd3` 零前进 · 工作树干净；SOP 沿 B2a–B2p 十七先例；W 线冻结序 + loop §3 冲突表零命中（本批零 apps src 触面——§5 B2q 行外部串列=无 · 实测吻合）。
- **主线漂移（亲跑）**：`git fetch origin main` → tip `c4244470`（与 B2p 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体`。
- **环境在飞面**：node_modules 在树 · `.env` ABSENT 盘上亲证 · ambient env 零 MODEL 键（每次调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 亲包）· `meetwise-postgres-dev`（healthy）Up（G3 隔离跑 PG 面用）· 批内两查 docker 面零 `meetwise-e2e-*` 瞬态/残留（`docker ps -a` 全列亲证仅 postgres-dev 一件 · runner 十次隔离跑全数自清）。
- **lockfile 口径**：B2a–B2p 全批链 `pnpm-lock.yaml` 零改；本批 staged + worktree 双向 `git diff --quiet pnpm-lock.yaml` PASS；tsc 三包批后输出与批前逐字节相同 = 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2q 行：memory-store(56行) · memory-summary(275行) · memory-summary-tree(185行) · memory-two-stage-recall(191行) · memory-vector-chunk-erasure(81行)）

| # | 移动 | 证据（`git diff --cached -M --name-status` @首版 `b31fe7e1`） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/memory-store.ts` → `packages/db/src/memory/memory-store.ts` | `R100`（**零文件内改行** · 唯一 import 为 `pg` 包引 · 零相对 import 亲证 · 56 行零变） |
| 2 | `packages/db/src/memory-summary.ts` → `packages/db/src/memory/memory-summary.ts` | `R099` = R100 + **①类 1 行**（:17 `./principal.ts`→`../principal.ts` 锚向 · 275 行零变） |
| 3 | `packages/db/src/memory-summary-tree.ts` → `packages/db/src/memory/memory-summary-tree.ts` | `R099`（:18 锚向 · 185 行零变） |
| 4 | `packages/db/src/memory-two-stage-recall.ts` → `packages/db/src/memory/memory-two-stage-recall.ts` | `R099`（:1 锚向 · 191 行零变） |
| 5 | `packages/db/src/memory-vector-chunk-erasure.ts` → `packages/db/src/memory/memory-vector-chunk-erasure.ts` | `R098`（:7 锚向 · 81 行零变） |

**盘点口径**：五文件名全仓 any-form sweep（rg/grep 双向）——消费件 = db src（index.ts 桶 10 行 ② + `privacy/vector-plane-erasure.ts:27` 跨域 import ①——§4 蓝本点名边 privacy↔memory · B2n 二段预期）+ runner ③ 类 9 串 + manifest ④ 类 1 元素；**包内 src 零其余消费件**（五件互引 = 0 亲证；`memory/` 已移五件对本批五名 import = 0 亲证）；db test 五 memory proof + dbhy1 proof 全桶引（`../src/memory-*` 直引 grep = 0 亲证）零 ① test 改；apps/api、apps/worker、qdrant-store、conn-stack 零命中亲证。**domain 包同名族非本批面**（`packages/domain/src/ctx04-compression-snapshot.ts:20/:21` · `domain/src/index.ts:273/:274/:377/:381/:408/:409` 的 `./memory-summary.ts` 等为 domain 包自身同名件相对引 · 非 db 移动件 · 零改亲证——B2p `uc-e2e-040-043:108` 同判先例）；`scripts/*.mjs` 对五名零命中（B2p 记 `mem00-int00-*` 裸 target 名文件不含本批五名）。

**白名单随批改（B2q 实面 · §3 四类对账 · staged 面 = 5 rename + 4 modified = 9 条目 · numstat +24/−24 · 零第八方）**：

- **① 包内 import（5 行 = 移动件自引 4 改 + 消费件 1）**：四件各 1 行 `from './principal.ts'`→`from '../principal.ts'`（锚向 · memory-store 零相对 import = 零改）；消费件 `privacy/vector-plane-erasure.ts:27` `from '../memory-vector-chunk-erasure.ts'`→`from '../memory/memory-vector-chunk-erasure.ts'`（B2n 移入 privacy/ 时二段形态 → 本批终形态）；五件互引 0 行；无其他跨域边。
- **② 桶 re-export（10 行）**：`index.ts` :235/:236（store）/ :284/:287（two-stage）/ :475/:480（summary）/ :513/:517（summary-tree）/ :545/:549（vector-chunk-erasure）specifier 加 `memory/` 前缀；全部导出名零改；tenant 2 行与 `barrelTenantReexports===2` 断言面零触亲证。
- **③ runner receipt（9 串/8 行/8 hunks · 块内亲证 · 块外零改）**：:464（`memory:prove:raw`·store）+ :1106（`memory-governance:prove:raw`·store）+ :1156（`memory-two-stage-recall:prove:raw`·本名）+ :1199（`mem02-summary:prove:raw`·summary）+ :1213（`mem03-summary-tree:prove:raw`·summary-tree+summary 同行双串）+ :1228（`ctx04-compression-snapshot:prove:raw`·summary）+ :1277（`memory-vector-chunk-erasure:prove:raw`·本名）+ :1293（`vector-plane-erasure:prove:raw`·vector-chunk-erasure）→ 各加 `memory/` 前缀；`node --check` PASS；**§5 B2q 行靶列 1:1 吻合零差异**（store 2 靶 · summary 3 靶 · summary-tree 1 靶 · two-stage 1 靶 · vector-chunk-erasure 2 靶 = 9 靶点 = 9 串）——**无 B2p 型「蓝本行未点名 ③ 规则内实例」**（五名在本批 runner 数组内全部串均已由靶列覆盖）；改后旧形态残留 grep = 0 命中。
- **④ 仓内机械串（1 行 1 元素）**：`packages/db/test/tenant-wiring.manifest.ts:251` RESIDUAL_PATHS brace-glob 内具体名元素 `memory-vector-chunk-erasure`→`memory/memory-vector-chunk-erasure`；**`memory-*` 通配元判留**（沿 B2n `int-transcript*` 判例：不加域前缀不删除 · 改后匹配 0 平铺文件 = 形态陈旧化如实登记于本节 · B2p 收据点名「留待 B2q 批收口」即此判之收口；`tenant-wiring-e5.proof.ts:39` 仅断言 `RESIDUAL_PATHS.length > 0` 无 glob 文件系统展开亲证 → 零机械红 · 零 silent absence 风险）；:245 glob 与 WIRED_FILES file: 实值六处零涉亲证。
- **引号外零改亲证**：24 行对逐行剥引号串后逐字节比对 = **0 违例**（node 配对脚本 4 modified 面 20 对 + rename 面 4 对精确形状 grep `'./principal.ts'`→`'../principal.ts'`）；全文件行数零变（56/275/185/191/81 + 桶/runner/manifest/消费件仅行内替换）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：本批全部 9 编辑面文件 node 字节级 NUL 检查 clean（`buf.indexOf(0)` 亲跑 9/9；本批五名非 NUL 件——NUL 披露条目所指 qbank-generation-projection/qbank-provider-input 为 B2r 面）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

批前基线于净树（HEAD `a18a1dd3`）fresh 亲跑，先基线后动手，无 stash 环节。批后轮于首版 commit `b31fe7e1` 树执行（内容 ≡ 首版 commit 树；C-UNCOMMITTED 时序同先例）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R100×1 + R099×3 + R098×1 rename 检出 · 24 行对 quote-stripped 逐字节相同 **0 违例** · `node --check` PASS · 旧路径串残留 = 0（runner + 全仓 apps/packages/scripts/e2e/docker 双 grep 亲证）· lockfile 双向零改 · 9 文件 NUL clean | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过（**规范化同形**：diff 仅 loop 目录后缀/时戳挥发面 · B2f/B2l/B2m/B2n/B2o/B2p 同判） |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post 输出逐字节相同**（`cmp` 空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | EXIT=2 · **sha 同基线** | **逐字节相同** |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | EXIT=2 · **sha 同基线** | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | EXIT=2 · **sha 同基线** | **逐字节相同**（三包 sha 与 B2p 批记录基线 **同值** · 本批基线双重自洽） |
| G3 | `prove:memory-two-stage-recall`（经 runner `memory-two-stage-recall:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:dbhy1`（经 runner `dbhy1:prove:raw` · memory-store 面） | EXIT=0 | EXIT=0 | **绿保持绿**（pre/post 输出差异仅隔离 PG 瞬态容器名:端口 `meetwise-e2e-58469-…:51662`→`meetwise-e2e-64341-…:52426` 挥发面 · 余逐字节同 · layout 同判挥发判例） |
| G3 | `prove:memory-vector-chunk-erasure`（经 runner `memory-vector-chunk-erasure:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:mem02-summary`（红候选 · 经 runner `mem02-summary:prove:raw`） | **EXIT=0** | EXIT=0 | **绿保持绿（偏差披露 §6-1：蓝本红候选实测批前即绿）** |
| G3 | `prove:mem03-summary-tree`（红候选 · 经 runner `mem03-summary-tree:prove:raw`） | **EXIT=0** | EXIT=0 | **绿保持绿（偏差披露 §6-1 同上）** |
| G3 | receipt ENOENT 观察 | pre 四键各产出 1 只（`…T05-05…` 时段 4 只） | post 四键各产出 1 只（`…T05-08…` 时段 4 只） | **ENOENT=0 双向成立（8/8 产出 · outcome=passed · exitCode=0 · releaseEvidence=false 一致）；post 4 只亲证解析移动名引用全为 `packages/db/src/memory/memory-*.ts` 新形态 · 零 stale db 平铺旧形态**——③ 类改写正确性机械证据 · E4 反面教训闭环（`dbhy1:prove:raw` 无 isolatedReceiptSources 条目 = runner 数组本无其名 · base 固有行为非本批产物 · 以 EXIT+输出对照承载） |
| G4 | commit 后 `git status` | — | **0 entries**（首版后亲证）· docker 面仅环境件 `meetwise-postgres-dev Up healthy`（非本批产物）· 批内两查零 `meetwise-e2e-*` 容器瞬态/残留 | 干净 |

**attempts 全账（Ban retry-to-green）**：G3 五键 pre 5 + post 5 = 10 次（逐键单发）；G2 pre 3 + post 3 = 6 次（首版即 sha 同基线 · 无补齐轮）；G1 五门 pre 1 轮 + post 1 轮 = 10 次——**共 26 attempts** · 无 stash 伪红 attempt · 无 retry-to-green。

## 3. 靶对表（③ 类 9 串 → 7 唯一 runner 靶 · 与 §5 B2q 行 receipt 靶列对账）

| runner:line | target | 承载串（本批移动名） | R5 处置 |
|---|---|---|---|
| :464 | `memory:prove:raw`（apps/worker 面） | **memory-store** | 直跑键 `prove:dbhy1` 同面已跑（EXIT=0→0）· 本靶批内未单跑（R5 口径批内必跑集合=∅） |
| :1106 | `memory-governance:prove:raw` | **memory-store** | 直跑键 `prove:dbhy1` 同面已跑 · 本靶批内未单跑（同上 · B2p :1278 同判先例） |
| :1156 | `memory-two-stage-recall:prove:raw` | **memory-two-stage-recall** | 本批 G3 直跑键已跑（EXIT=0→0 · receipt 新路径亲证） |
| :1199 | `mem02-summary:prove:raw` | **memory-summary** | 本批 G3 直跑键已跑（同上 · 蓝本红候选实测绿 · §6-1） |
| :1213 | `mem03-summary-tree:prove:raw` | **memory-summary-tree** · **memory-summary** | 本批 G3 直跑键已跑（同上 · §6-1） |
| :1228 | `ctx04-compression-snapshot:prove:raw` | **memory-summary** | ③ 改讫；该靶为 B2i 直跑键非本批键 · 批内未跑（post 双审/B2s sweep 兜底） |
| :1277 | `memory-vector-chunk-erasure:prove:raw` | **memory-vector-chunk-erasure** | 本批 G3 直跑键已跑（EXIT=0→0 · receipt 新路径亲证） |
| :1293 | `vector-plane-erasure:prove:raw` | **memory-vector-chunk-erasure** | ③ 改讫；该靶为 B2n 直跑键非本批键 · 批内未跑（post 双审/B2s sweep 兜底） |

**§5 B2q 行靶列对账**：store（2）= memory-governance(:1106) · memory(:464) ✓；summary（3）= mem02-summary(:1199) · mem03-summary-tree(:1213) · ctx04-compression-snapshot(:1228) ✓；summary-tree（1）= mem03-summary-tree(:1213) ✓；two-stage（1）= memory-two-stage-recall(:1156) ✓；vector-chunk-erasure（2）= memory-vector-chunk-erasure(:1277) · vector-plane-erasure(:1293) ✓——9 靶点 = 9 串 1:1 零差异；唯一靶 7；本批直跑键承载其中 5 键（two-stage · dbhy1(store 面) · vector-chunk-erasure · mem02 · mem03）全数跑讫，余 3 靶（memory · memory-governance · ctx04 · vector-plane 中非直跑面）未跑（post 双审 + B2s 终批 sweep 兜底）。

## 4. S1 判留复述登记（Ban 10 · 本批新增登记）

- **S1 在册八处与本批五名零交集**（int-transcript.ts:7 · db-acl:267/490 · qbank-source:2 · domain qbank-route-scope-cache:16 / qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc052-checkpoint-physical.proof:7 · uc-e2e-014-026:19 逐处 sed 亲证五名零命中）。
- **本批新增判留（S1 同型 · 当批补登）**：
  1. `packages/db/src/memory/memory-control-surface.ts:7` 行内注释裸名提及「按 memory-two-stage-recall.ts 同款做法」——B2p 移入件注释面 · 非 import 非 ①②③④ 类（Ban 1 零触）· 引的是文件名非路径串 · 机械零消费 · 判留陈旧零改。
  2. `packages/db/test/tenant-wiring.manifest.ts:251` glob 通配元 `memory-*`（连同先期 `int-transcript*`）批后匹配 0 平铺文件——B2n 判例判留形态 · e5 proof 无 glob 展开亲证 · 如实登记（见 §1 ④）。
  3. ai-docs 历史档案面 3 文件引及本批五名旧路径串（`ai-docs/delivery/m4-rag-hard-gates.md` · `ai-docs/delivery/production-readiness-remediation-register.md` · `ai-docs/delivery/receipts/rcpt1-receipt-paths/correction-list.md`）——append-only 不改 · 全部在 B2s 终批 grep 路径集外（B2n/B2p 同判）。
- `packages/db/src/` 平铺面五名旧文件 = 0 残留（git mv 后 `ls packages/db/src/memory-*.ts` 零命中 · `memory/` 集齐 10 件 = B2p 5 + 本批 5 = 正确终形态 · memory 域 10/10 收口）。

## 5. 收口判定

**B2q 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 5 键含双红候选实测绿 · parity base 红同形逐字节 · tsc 三包 sha 批后≡批前且≡B2p 批记录值 · 24 行对白名单 payload 映射 0 违例 · 旧路径串残留 0 · receipt 8/8 产出 ENOENT=0 + post 移动名引用全新形态零 stale）· 1 commit 1 收据（首版 `b31fe7e1` → 收据 docs-only amend = 终版）· §5 B2q 行外部串列=无与本批实面吻合（④ 实面 = manifest :251 具体名 1 元素 · 蓝本「无」指 §5 表外部串列未列 file:line · manifest 属 §3 ④ 类恒常面）· 靶列 9 靶点 1:1 对账且直跑五键批内全数跑讫 · 漂移：main/支线零前进 · 批内零瞬态容器 · memory 域 10/10 收口（B2q 后 `memory/` 完整 · 平铺 memory-* = 0）· 蓝本 §5 B2q 行状态由本收据承载推进（蓝本原文零改写 · 同 B2a–B2p 十七批先例）。**

## 6. 偏差披露（显式 · 零静默）

1. **红候选实测绿**：蓝本 §5 B2q 行标 `prove:mem02-summary`（红候选）· `prove:mem03-summary-tree`（红候选）（依据 §4 `pgp_sym_encrypt` 权限族）；本批批前净树实测两键 **EXIT=0**，批后同绿——E5 口径「以批前逐靶实测为准」，pre 绿 → post 绿 = 绿保持绿，**非洗红**（零 retry · 零环境变更 · lockfile/tsc sha 三重反证）；红候选标注按实测作废入档。
2. **③ 串计数口径**：本批 runner 实改 9 串/8 行（`mem03-summary-tree:prove:raw` 单行双串）；§1 初盘点误记「8 串」已于本收据更正为 9——与 §5 B2q 行靶列 9 靶点 1:1 吻合，零遗漏零多改。
3. **dbhy1 receipt 面**：`dbhy1:prove:raw` 在 runner 支持表与命令 map（:1725）但无 isolatedReceiptSources 条目 = 不产 receipt 文件（base 固有 · 非本批产物）→ ENOENT 观察面 = 四键 8 只；dbhy1 绿以 EXIT=0 + pre/post 输出对照（差异仅瞬态容器名）承载。

---

*DIR-1 B2 · B2q/19 · 2026-10-10 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
