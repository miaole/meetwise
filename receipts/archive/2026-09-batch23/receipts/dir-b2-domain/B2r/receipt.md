# B2r 批收据 — DIR-1 B2 domain 目录拆解刀（第 18/19 批）

**Batch**: B2r（§5 表 B2r 行：qbank/ 前段 5 文件）· **EXEC**: DIR-B2 域 B2r 批 EXEC 席（pure-mv 机械执行）
**Date**: 2026-10-10（worktree 时钟）· **Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席 `git fetch origin` → `origin/line/dir-b2-domain` tip `a18a1dd3`（与 B2q 批时记录同值 · 远端零前进 · 本地领先 B2p `4950bd51` + B2q `098de4a1` 两笔未推 commit = ⛔push 纪律下预期形态）· 工作树干净 · **首版 commit `b25a33c0`**（mv+白名单首版；首版后 post 第一轮 tsc 三门 sha 偏离基线 → 根因=① 类漏改 1 行 → **① 补齐轮**折入本版（B2a–B2p 先例轮型 · B2q 收据点名「无 ① 补齐轮」即本型之存在反证）· 补齐后 post 第二轮全绿）→ **收据 docs-only amend 折入**（C-UNCOMMITTED 净树门时序 · 同 B2g–B2q 先例 · 终版 hash = 首版 + 本收据）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g `cc76a554` · B2h `5bd79258` · B2i `40dc4551` · B2j `4a8b47b5` · B2k `3003665e` · B2l `ce050e1e` · B2m `6027ff49` · B2n `dee8bc4e` · B2o `a18a1dd3` · B2p `4950bd51` · B2q `098de4a1`）
**Commit author**: `dirb2-b2r <exec@meetwise.local>`（协调方本批指令指定 · B2q 同形命名律）· releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：开席 fetch → 远端支线 tip `a18a1dd3` 零前进 · 工作树干净；SOP 沿 B2a–B2q 十八先例；W 线冻结序 + loop §3 冲突表零命中（本批 ④ 类触面 = worker r4-funnel 串改 + api test `.mjs` 串改 + conn-stack proof 串改 + db test proof STATIC_TARGET 串改，全部为 §3 ④ 类授权例外面 · apps src 仅 r4-funnel 两行命中例外）。
- **主线漂移（亲跑）**：`git fetch origin main` → tip `c4244470`（与 B2q 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体`。
- **环境在飞面**：node_modules 在树 · `.env` ABSENT 盘上亲证 · ambient env 零 MODEL 键（每次隔离跑 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 亲包）· `meetwise-postgres-dev`（healthy）Up（G3 隔离跑 PG 面用）· 批内两查 docker 面零 `meetwise-e2e-*` 瞬态/残留（`docker ps -a` 全列亲证仅 postgres-dev 一件 · runner 21 次隔离跑全数自清）。
- **lockfile 口径**：B2a–B2q 全批链 `pnpm-lock.yaml` 零改；本批 staged + worktree 双向 `git diff --quiet pnpm-lock.yaml` PASS；tsc 三包补齐后输出与批前逐字节相同 = 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2r 行：qbank-curation(101行) · qbank-embedding-compute-cache(549行) · qbank-generation-projection(174行) · qbank-generation-retrieval(262行) · qbank-ingest(459行)）

| # | 移动 | 证据（`git diff --cached -M --name-status` @首版 `b25a33c0`） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/qbank-curation.ts` → `packages/db/src/qbank/qbank-curation.ts` | `R100`（**零文件内改行** · 零相对 import 亲证 · 101 行字节级恒等亲证） |
| 2 | `packages/db/src/qbank-embedding-compute-cache.ts` → `packages/db/src/qbank/qbank-embedding-compute-cache.ts` | `R099` = R100 + **①类 1 行**（:33 `./principal.ts`→`../principal.ts` 锚向 · :34 `./qbank-ingest.ts` 同域判留 · 549 行零变） |
| 3 | `packages/db/src/qbank-generation-projection.ts` → `packages/db/src/qbank/qbank-generation-projection.ts` | `R099`（:18 锚向 · :19 `./qbank-ingest.ts` 同域判留 · 174 行零变 · **binary face**：numstat `-`） |
| 4 | `packages/db/src/qbank-generation-retrieval.ts` → `packages/db/src/qbank/qbank-generation-retrieval.ts` | `R100`（零相对 import 亲证 · 262 行字节级恒等亲证） |
| 5 | `packages/db/src/qbank-ingest.ts` → `packages/db/src/qbank/qbank-ingest.ts` | `R099`（:26 锚向 + :27 `./retrieval/retrieval-store.ts`→`../retrieval/retrieval-store.ts` 跨域二段（B2j 已移 retrieval/）· :31 `./qbank-curation.ts` 同域判留 · 459 行零变） |

**盘点口径**：五文件名全仓 any-form sweep（rg/grep + **binary-aware `-a` 补扫**双向）——消费件 = db src（index.ts 桶 10 行 ② + `retrieval/retrieval-store.ts:11` 跨域 import ① + B2s 未移五平铺件 6 行 ① + `qbank-provider-input.ts:18` ①（**binary face · 见 §6-1**））+ runner ③ 类 40 串/30 行 + ④ 类 8 行/7 文件；**移动件互引 = 同域 3 行判留亲证**（compute-cache:34 · projection:19 · ingest:31 · 零改=① 类规则内同域形态）；`qbank-miss/qbank-provider-input/qbank-retrieval-cache/qbank-route-scope-cache/qbank-track-local-retrieval`（B2s 面）对本批五名 import 共 7 行中 6 行随批改（provider-input:18 见 §6-1 · miss:36 · retrieval-cache:12 · route-scope-cache:32 · track-local:39/:43/:48）——B2s 移入时此 6+1 行按 ① 类二段再改（`./qbank/x.ts`→`./x.ts`），纯文本 churn；db test 全部相关 proof 桶引（`../src/qbank-*.ts` 直引 grep -a = 0 亲证）零 ① test 改；packages/domain、qdrant-store、e2e、docker 零命中亲证。

**白名单随批改（B2r 实面 · §3 四类对账 · staged 面 = 5 rename + 15 modified = 20 条目 · numstat 数字面 +58/−58 + binary face 2 行对（projection :18 · provider-input :18 均因 NUL 被 git 判 binary 不入数字和）= 实际 60 行对 · 零第八方）**：

- **① 包内 import（11 行 = 移动件自引 4 改 + 消费件 7）**：移动件 `compute-cache:33` · `projection:18` · `ingest:26` 各 1 行 `from './principal.ts'`→`from '../principal.ts'`（锚向 · curation/gen-retrieval 零相对 import = 零改）+ `ingest:27` `from './retrieval/retrieval-store.ts'`→`from '../retrieval/retrieval-store.ts'`（跨域二段）；消费件 `retrieval-store.ts:11` `from '../qbank-generation-retrieval.ts'`→`from '../qbank/qbank-generation-retrieval.ts'` + B2s 平铺件 6 行（`miss:36` · `retrieval-cache:12` · `route-scope-cache:32` · `track-local:39/:43/:48`）`from './qbank-X.ts'`→`from './qbank/qbank-X.ts'` + `provider-input:18`（补齐轮 · §6-1）。五件互引 3 行同域判留零改；无其他跨域边。
- **② 桶 re-export（10 行）**：`index.ts` :163/:164（generation-retrieval）/ :175/:176（curation）/ :180/:184（ingest）/ :325/:328（generation-projection）/ :378/:385（embedding-compute-cache）specifier 加 `qbank/` 前缀；全部导出名零改；tenant 2 行与 `barrelTenantReexports===2` 断言面零触亲证。
- **③ runner receipt（40 串/30 行/30 hunks · 块内亲证（:93–:1640）· 块外零改（块外 grep -a = 0 亲证））**：逐名 = curation 5（:569 · :892 · :1471 · :1486 · :1502）/ embed-cache 1（:587）/ projection 5（:536 · :1447 · :1523 · :1543 · :1569）/ generation-retrieval 13（:520 · :542 · :604 · :681 · :1447 · :1470 · :1485 · :1501 · :1523 · :1543 · :1569 · :1585 · :1608）/ ingest 16（:519 · :540 · :569 · :589 · :603 · :654 · :680 · :1448 · :1471 · :1486 · :1502 · :1524 · :1544 · :1570 · :1585 · :1608）；`node --check` PASS；**§5 B2r 行靶列 1:1 吻合零差异**（curation 5 靶 · embed-cache 1 靶 · projection 5 靶 · generation-retrieval 13 靶 · ingest 16 靶 = 40 靶点 = 40 串，含 R8 修订后 `qbank-handoff-closure` 入 ingest 组）；改后旧形态残留 grep（含 `-a`）= 0 命中。涉及唯一 runner 靶 17 个（rag-generation · qbank-integrity-upgrade · qbank-handoff-closure · embed-cache · qbank-retrieval-eval · migrate-cli · qbank-pipeline · uc027:manual-review-appeal · rag04-track-local · rag03-filter-locus · rag03-hnsw-completeness · rag03c-exactk-observe · r4-wrong-track-adv-live-pg · nhp-r4-adv-covered · r4-wrong-track-prod-surface · rag05-qbank-miss · rag06-route-scope-cache）；`rag05-qbank-miss`(:1585)/`rag06-route-scope-cache`(:1608) 数组内同行的 `qbank-retrieval-cache.ts` 串属 B2s 面（蓝本 R3 口径）本批零改亲证。
- **④ 仓内机械串（8 行/7 文件 · 蓝本 B2r 行外部串列 1:1）**：`packages/db/test/rag03-filter-locus.proof.ts:54` + `rag03-hnsw-completeness.proof.ts:50`（STATIC_TARGET 双串 · 均 `qbank-generation-retrieval.ts`→`qbank/qbank-…`）；`scripts/conn-stack/mysql-stack.m4-rag.skeleton.proof.mjs:22`（`join(root, 'packages/db/src/qbank-generation-retrieval.ts')`）；api `.mjs` ×2：`uc-e2e-027-manual-review-appeal.proof.mjs:109`（read curation）· `uc-e2e-040-043-batch-qbank-seat.proof.mjs:99`（resolve ingest）；worker `r4-funnel-covered-count-batch2.ts:96`（projection · readRepo）+ `:174`（compute-cache）· `batch3.ts:202`（compute-cache）；**`batch3:117` 零改**（内容 = `qbank-miss.ts` · 蓝本 B2r 行自注「=miss·B2s 二段」· B2s 批改 · 亲证）。
- **引号外零改亲证**：60 行对逐行剥引号串后逐字节比对 = **0 违例**（node 配对脚本：modified 面 55 对 + rename 内嵌面 5 对（compute-cache 1 · projection 1 · ingest 2 · provider-input 1））；全文件行数零变（101/549/174/262/459 + 各改面仅行内替换）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：本批 20 编辑面文件 node 字节级 NUL 检查 = `qbank/qbank-generation-projection.ts`（原生 @5641→改后 @5642，:18 加 1 字节账目吻合）+ `qbank-provider-input.ts`（原生 @4161→改后 @4167，:18 加 6 字节 `qbank/` 账目吻合）两件 NUL 保持，余 18 件 clean——与蓝本非阻塞披露（NUL 件恰为此二名）1:1 吻合。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径）

批前基线：G1/G2 于净树（HEAD `098de4a1`）动手前 fresh 亲跑；**G3 批前基线因执行序偏差（先动手后补测）经 `git stash push --staged` → 净树跑七键 → `git stash pop --index` 恢复，暂存态 sha 双向亲证恒等（`git diff --cached | shasum` `ec11b23500443b49` · `git status --short | shasum` `bd45d1a921c65b7d`）后在字节恒等 base 树上取得**（§6-2 披露）。批后轮于首版 commit `b25a33c0` 树执行（post 第一轮 = 补齐前树，作废入账；**post 第二轮 = 补齐后终树为准**）。

| 门 | 键 | 批前基线 | 批后（补齐后树 post2） | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R100×2 + R099×3 rename 检出 · 60 行对 quote-stripped 逐字节相同 **0 违例** · `node --check` PASS · 旧路径串残留 = 0（runner + 全仓 apps/packages/scripts/e2e 双 grep -a 亲证 · 唯一在册 S1 豁免 qbank-source.proof.ts:2）· lockfile 双向零改 · 20 文件 NUL 面 = 蓝本披露 2 件保持余 clean | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过（**规范化同形**：diff 仅 loop 目录后缀/时戳/PID/UUID 挥发面 · B2f–B2q 七批同判） |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post2 输出逐字节相同**（`cmp` 空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | EXIT=2 · **sha 同基线** | **逐字节相同**（post 第一轮 sha `ec1576d1ca92cece` 偏离 → ① 补齐轮后回归 · §6-1） |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | EXIT=2 · **sha 同基线** | **逐字节相同**（post 第一轮 `a9384e07bc171589` → 补齐后回归 · 同上） |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | EXIT=2 · **sha 同基线** | **逐字节相同**（post 第一轮 `8dda5ff779c0d425` → 补齐后回归 · 同上；三包 sha 与 B2p/B2q 批记录基线 **同值** · 三重自洽） |
| G3 | `prove:qbank-control-role`（经 runner `qbank-control-role:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:qbank-handoff-closure`（经 runner `qbank-handoff-closure:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:embed-compute-cache`（经 runner `embed-cache:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:rag03-filter-locus`（经 runner `rag03-filter-locus:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:rag03-hnsw-completeness`（经 runner `rag03-hnsw-completeness:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:rag03c-exactk-observe`（经 runner `rag03c-exactk-observe:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:rag04-track-local`（经 runner `rag04-track-local:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | receipt ENOENT 观察 | pre 七键各产出 1 只（7/7 · outcome=passed · exitCode=0 · releaseEvidence=false） | post2 七键各产出 1 只（7/7 同形） | **ENOENT=0 双向成立（14/14 产出）；post2 receipt 解析移动名引用全为 `packages/db/src/qbank/qbank-*.ts` 新形态 · 零 stale db 平铺旧形态**（`qbank-control-role` receipt 内五名引用 = 0 系其 isolatedReceiptSources 条目本无五名（:552–:565 亲证）· 数组固有非本批产物）——③ 类改写正确性机械证据 · E4 反面教训闭环 |
| G4 | commit 后 `git status` | — | **0 entries**（首版后亲证）· docker 面仅环境件 `meetwise-postgres-dev Up healthy`（非本批产物）· 批内两查零 `meetwise-e2e-*` 容器瞬态/残留 | 干净 |

**attempts 全账（Ban retry-to-green）**：G3 七键 pre 7 + post1（补齐前树 · 作废入账）7 + post2 7 = 21 次；G2 pre 3 + post1 3 + post2 3 = 9 次；G1 五门 pre 5 + post1 5 + post2 5 = 15 次——**共 45 attempts**。post1 轮 tsc 三 sha 偏离为**真红**（① 类漏改所致 · 原值上表在册），处置 = 补齐白名单改行后复跑（修完再验 · 非 retry-to-green 同型回滚掩盖）；无 stash 伪红 attempt（stash 往返仅用于取得 G3 批前基线 · §6-2）。

## 3. 靶对表（③ 类 40 串 → 17 唯一 runner 靶 · 与 §5 B2r 行 receipt 靶列对账）

| 组（串数） | 承载靶（runner `*:prove:raw`） | R5 处置 |
|---|---|---|
| curation（5） | qbank-handoff-closure(:569) · rag03-filter-locus(:1471) · rag03-hnsw-completeness(:1486) · rag03c-exactk-observe(:1502) · uc027:manual-review-appeal(:892) | 直跑键已跑 = qbank-handoff-closure · rag03-filter-locus · rag03-hnsw-completeness · rag03c-exactk-observe（4/5）；uc027 靶批内未跑（post 双审/B2s sweep 兜底） |
| embed-cache（1） | embed-cache(:587) | 直跑键 `prove:embed-compute-cache` 已跑（1/1） |
| projection（5） | rag-generation(:536) · rag04-track-local(:1447) · nhp-r4-adv-covered(:1543) · r4-wrong-track-adv-live-pg(:1523) · r4-wrong-track-prod-surface(:1569) | 直跑键已跑 = rag04-track-local（1/5）；余 4 靶批内未跑（post 双审/B2s sweep 兜底） |
| generation-retrieval（13） | 上五 + qbank-integrity-upgrade(:542) · qbank-pipeline(:681) · qbank-retrieval-eval(:604) · rag03-filter-locus(:1470) · rag03-hnsw-completeness(:1485) · rag03c-exactk-observe(:1501) · rag05-qbank-miss(:1585) · rag06-route-scope-cache(:1608) | 直跑键承载 rag04 · rag03×3（4 靶）；qbank-integrity-upgrade/qbank-pipeline/qbank-retrieval-eval 为 B2k 直跑键面 · rag05/rag06 为 B2s 直跑键面 · 批内未跑（兜底同上） |
| ingest（16） | 上十三去重 + qbank-handoff-closure(:540/:569) · embed-cache(:589) · migrate-cli(:654) | 直跑键承载 qbank-handoff-closure · embed-cache（2 靶）；migrate-cli 靶为根锚批面 · 批内未跑（兜底同上） |

**§5 B2r 行靶列对账**：curation（5）✓ · embed-cache（1）✓ · projection（5）✓ · generation-retrieval（13 = 上五 + 8）✓ · ingest（16 = 上十三去重 + 3，含 R8 修订 `qbank-handoff-closure`）✓——40 靶点 = 40 串 1:1 零差异；唯一靶 17；本批七直跑键承载其中 9 靶点（qbank-control-role 靶不含五名 = 其 receipt 条目零五名）批内全数跑讫，余 8 靶未跑（R5 口径批内必跑集合=∅ · post 双审 + B2s 终批 sweep 兜底）。

## 4. S1 判留复述登记（Ban 10 · 本批新增登记）

- **S1 在册八处与本批五名交集 = 1 处在册豁免行**：`packages/db/test/qbank-source.proof.ts:2` 头注「对齐 packages/db/src/qbank-curation.ts 的门 SQL」——蓝本 §3 终批 grep 豁免集在册八处之一（非 import 非机械 · 引的是旧平铺路径串 · 判留陈旧零改 · 本收据复述登记）。余七处（int-transcript.ts:7 已随 B2d 移入 transcript/ 域 · db-acl:267/490 · domain qbank-route-scope-cache:16 / qbank-track-local-retrieval:13（B2s 名 · 零交集亲证）· product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc052-checkpoint-physical.proof:7 · uc-e2e-014-026:19）逐处 sed 亲证五名零命中。
- **本批新增判留（S1 同型 · 当批补登）**：
  1. `packages/db/src/qbank/qbank-embedding-compute-cache.ts:34` · `qbank/qbank-generation-projection.ts:19` · `qbank/qbank-ingest.ts:31` 三行同域互引 specifier `./qbank-{ingest,curation}.ts` 在 qbank/ 域内**形态恰为终形态**（同域 `./` 形态 · 非判留 · 对账销案用）；真正新增判留 = **无 import 面判留**。
  2. `packages/db/test/tenant-wiring.manifest.ts` RESIDUAL_PATHS :251 brace-glob 内通配元 `qbank-*`：本批后仍匹配 5 件 B2s 平铺件（qbank-miss · qbank-provider-input · qbank-retrieval-cache · qbank-route-scope-cache · qbank-track-local-retrieval）——**零陈旧化引入**（B2q `memory-*` 判例为匹配 0 的陈旧化形态 · 本批不同 · B2s 批后同判例登记）；WIRED_FILES file: 实值六处与 :245 glob 零涉亲证（五名零命中）。
  3. ai-docs 历史档案面（蓝本 §1.1/Erratum NUL 披露行 · 前批收据档）引及本批五名旧路径串——append-only 不改 · 全部在 B2s 终批 grep 路径集外（B2n/B2p/B2q 同判）。
- `packages/db/src/` 平铺面五名旧文件 = 0 残留（git mv 后 `ls packages/db/src/qbank-*.ts` 仅余 B2s 五件 · `qbank/` 本批 5 件 = 前段 · 域 10/10 待 B2s 收口）。

## 5. 收口判定

**B2r 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿七键 · parity base 红同形逐字节 · tsc 三包 sha 批后≡批前且≡B2p/B2q 批记录值三重自洽 · 60 行对白名单 payload 映射 0 违例 · 旧路径串残留 0（S1 在册豁免 1 处外）· receipt 14/14 产出 ENOENT=0 + post 移动名引用全新形态零 stale）· 1 commit 1 收据（首版 `b25a33c0` 含 ① 补齐轮 → 收据 docs-only amend = 终版）· §5 B2r 行外部串列与本批 ④ 实面 8 行/7 文件 1:1 吻合（batch3:117 按蓝本自注归 B2s 二段）· 靶列 40 靶点 1:1 对账且七直跑键批内全数跑讫 · 漂移：main/远端支线零前进 · 批内零瞬态容器 · qbank 域前段 5/10 收口（余 5 件 = B2s 面 · 平铺 qbank-* 5 件在树与蓝本 B2s 行吻合）· 蓝本 §5 B2r 行状态由本收据承载推进（蓝本原文零改写 · 同 B2a–B2q 十八批先例）。**

## 6. 偏差披露（显式 · 零静默）

1. **① 补齐轮（本批唯一执行面偏差）**：首版迁移盘点时 db src 消费面 sweep 用普通 grep——`qbank-provider-input.ts` 为蓝本 NUL 披露第二件，grep 按 binary 处理致 `:18` `import type { QbankQuestionChunkRole } from './qbank-ingest.ts'` 一行 ① 类消费件改写被静默漏扫（同因亦致 projection 头两行 import 首扫漏报，动手前已 binary-aware 复扫纠正）。首版 commit 后 post 第一轮 G2 三包 tsc sha 偏离基线（`ec1576d1ca92cece`/`a9384e07bc171589`/`8dda5ff779c0d425`），diff 逐字节定位唯一新增错行 = provider-input.ts(18,45) TS2307；处置 = 按白名单 ① 类补 1 行（`./qbank-ingest.ts`→`./qbank/qbank-ingest.ts` · byte-level · NUL 保持 @4161→@4167 账目吻合）→ 折入首版（终版即含补齐 · 补齐轮独立 commit 未产生）→ post 第二轮三 sha 回归基线同值。全仓 binary-aware `-a` 三扫（db src / db test / 全仓 import() 形态 + ④ 串面）复验 = 零第二处。post1 轮全部 attempt 作废入账（§2 attempts 全账）。根因（binary sweep 盲区）与处置（B2q 收据点名先例轮型「① 补齐轮」）均显式在档。
2. **G3 批前基线取径偏差（执行序）**：G1/G2 基线于动手前净树亲跑；G3 七键基线因先动手后补测，经 `git stash push --staged` → 净树（HEAD `098de4a1` 字节恒等）跑七键 → `git stash pop --index` 恢复，暂存态/状态面 sha 双向亲证恒等（`ec11b23500443b49`/`bd45d1a921c65b7d`）——非「无 stash 环节」B2q 形态，如实披露；stash 未用于任何伪红/绿操纵（Ban 面 · 仅为基线取径）。
3. **红候选面**：蓝本 §5 B2r 行零红候选标注（§4 base 红族 qbank 族仅 `qbank-source`（app_role 缺 · 非本批直跑键））——本批七键批前批后全绿，无 E5 洗红面。
4. **numstat binary face**：projection 与 provider-input 两改行因 NUL 被 git 判 binary（numstat `-`），数字面 +58/−58 + binary 2 行对 = 实际 60 行对；git `--stat` 同因显示 20 files/58+/58−，机械账目以本节为准。
5. **③ 串计数口径**：40 串/30 行（10 行为双串行：:569 · :1447 · :1471 · :1486 · :1502 · :1523 · :1543 · :1569 · :1585 · :1608，余 20 行单串——逐行清单见 §1 ③）；§1 盘点口径 40/30 与 §5 靶列 40 靶点 1:1，零遗漏零多改。

---

*DIR-1 B2 · B2r/19 · 2026-10-10 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
