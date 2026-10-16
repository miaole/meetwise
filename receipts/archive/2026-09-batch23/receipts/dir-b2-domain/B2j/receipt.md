# B2j 批收据 — DIR-1 B2 domain 目录拆解刀（第 10/19 批）

**Batch**: B2j（§5 表 B2j 行：retrieval/ 域 4 文件）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-10）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席 pull `40dc4551`（B2i 批后 tip · `git pull origin line/dir-b2-domain` → Already up to date）· **首版 commit `2cddde5c`**（收据经 amend 折入——C-UNCOMMITTED 净树门时序强制，同 B2g/B2i 先例 · 终版 hash 见交付报告 = 首版 + 本收据 docs-only）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g `cc15bbe9`·收据 amend `cc76a554` · B2h `5bd79258`·收据 amend `cc76a554` · B2i `40dc4551`）
**Commit author**: `mw-dirb2-b2j` · releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：开席 `git pull origin line/dir-b2-domain` → **Already up to date（双侧 tip `40dc4551` = B2i 批后）· 工作树干净**；SOP 沿 B2a–B2i 十先例；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH/TOKSTREAM/隐私主线/r4 面零触，本批改动面见 §1）。
- **主线漂移（亲跑）**：`git fetch origin main` → tip `c4244470`（与 B2i 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体 → 0 个未拉主线提交`；本地 `main` = `origin/main` = `c4244470`。任务提示面 obsenv/errmsg/lint/deps 亲核：**均不在 origin/main**（origin/main 自 B2i 未动）；该批工作实际落于**漂移支线** `origin/feat/mysql-schema-skeleton`（`c0c18012` → `f47670e6` 前进，含 unstub-erase 软删层 0152/0153 · lints0 workspace 薄壳 ×12 · lint S2 nail · errmsg-map · process errata——见下行行级核验）。`git log origin/main..e2834082` = 1235 commit（本线基点含大量未推主线本地链，B2 基点口径沿 REQUEST §0.1）。
- **漂移支线行级核验（vs 本批编辑行）**：`index.ts` drift hunk `@@ -94,6 +94,9`（:94–:99 区）vs 本批 ② 面 :149/:154/:162/:228/:232 → **零行级交集**；`runner` drift hunks `:380/:951/:1664/:1838/:1888/:2499/:2526` vs 本批 ③ 面 :623/:633/:673/:1470/:1485/:1501 → **零行级交集**；`g5-erasure.proof.ts` drift hunks `:6/:95/:166/:342` vs 本批 ④ 编辑行 :41 → 零交集；`g5-ledger-map.proof.ts` drift hunks `:91/:216/:327` vs :49 → 零交集；`tenant-wiring.manifest.ts` drift 侧仅改 **:253 `reason:` 行**（DELETE pin 措辞·其支线自基）vs 本批 ④ **:251 `file:` 行** → 零行级交集（同块邻行·**支线侧 glob 行 :251 尚为平铺旧形态**，将来合并期与本批 :251 改写文本邻接——合并冲突面如实在案，属协调方合并时点问题，非本批线上冲突）；conn-stack drift 侧触 `m2-tenant.skeleton.proof.mjs`/`mysql-stack.skeleton.proof.mjs` vs 本批 ④ 四连（m4-rag/m5-fixtures/qdrant-backed/r5-mark-red）→ **零文件级交集**；本批 4 个移动文件 + `qbank-ingest.ts` drift 侧 `--name-only` 交集 = **0**。
- **漂移侧新文件披露**：drift 侧 `packages/db/src/resume-privacy.ts` **不在 B2 73 文件清单**（支线 unstub-erase 新增）——若将来合并入线，§2 落位表须补裁定，本批零处置如实登记。drift 侧另触 `memory-store.ts`（B2q 面）· `vector-plane-erasure.ts`（B2n 面）· qdrant-store `src/{erasure,store,vectorstore-adapter,ledger-receipt-map}.ts`（本批 ④ 面为 test/ 八文件，src 侧非本批编辑面）。**零交集 → 不停手照常执行，本节登记。**
- **环境在飞面**：开席 docker daemon 未启（本席 `open -a Docker` 启动·非行为变更）→ 就绪后 `docker ps -a` **空**（B2i 时在飞的 `meetwise-e2e-40347-*` 已自清）；本批窗口内出现 `meetwise-e2e-26596-*`（他席/他线 runner 在飞·非本席启动·零处置·G4 复验时已自行结束删除）。`meetwise-postgres-dev` 本席 `pnpm db:up` 起（环境准备非行为变更），批中 Exited(0)（零影响：runner 靶全用自备一次性容器，裸跑红在 Qdrant /readyz 面即拒未涉 PG）。
- **lockfile 口径**：`git log e2834082..HEAD -- pnpm-lock.yaml` = 0 commit（本线自基点零触碰）；G0「lockfile 零改」= 本批零改（staged + worktree 双向 PASS）；tsc 批前三 sha 与 B2a–B2i 九批连续基线**逐字节相同**（§2 G2 行）= 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2j 行：rag-corpus-versioning(257行) · retrieval-backend(149行) · retrieval-legacy(45行) · retrieval-store(66行)）

| # | 移动 | 证据（`git diff --cached -M --name-status`） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/rag-corpus-versioning.ts` → `packages/db/src/retrieval/rag-corpus-versioning.ts` | `R100`（纯 rename · 内容零变 · 257 行零变） |
| 2 | `packages/db/src/retrieval-backend.ts` → `packages/db/src/retrieval/retrieval-backend.ts` | `R100`（同上 · 149 行零变） |
| 3 | `packages/db/src/retrieval-legacy.ts` → `packages/db/src/retrieval/retrieval-legacy.ts` | `R100`（同上 · 45 行零变） |
| 4 | `packages/db/src/retrieval-store.ts` → `packages/db/src/retrieval/retrieval-store.ts` | `R098` = R100 + **①类 1 行**（:11 `import { activeQbankGeneration } from './qbank-generation-retrieval.ts'`→`'../qbank-generation-retrieval.ts'` 锚向未移平铺件；`git diff --cached -M -U0` 唯一 hunk 亲证 · 66 行零变） |

**白名单随批改（B2j 实面 · §3 四类对账 · staged 面 = 4 mv + 17 modified = 21 条目 · 29 内容行对 · numstat +29/−29 · 零第八方）**：

- **① 包内 import（4 行 = 移动件自引 1 · 消费件 3）**：自引 1 见上表 R098 行（retrieval-store :11；:12/:14 `./retrieval-legacy.ts` 同域零改 ✓ 蓝图 retrieval-legacy barrel=0/inSRC=1 消费者即 retrieval-store 本体）。消费件 3：`qbank-ingest.ts:27` `'./retrieval-store.ts'`→`'./retrieval/retrieval-store.ts'`（跨域消费者·B2r 批二段 churn 预记）；`test/retrieval-backend-qdrant.proof.ts:32` `'../src/retrieval-backend.ts'`→`'../src/retrieval/retrieval-backend.ts'`（恰 §5 B2j 行「:32 import」）。**注释面**：retrieval-backend.ts:23 JSDoc `@see ./retrieval-store.ts` 与 retrieval-store.ts:4 `see ./retrieval-backend.ts`——同批同域互指，移动后仍真，零改（非 S1 判留）；proof :132/:133 断言消息串 `retrieval-store.ts` 为散文非路径零改。
- **② 桶 re-export（5 行）**：`index.ts` :149（retrieval-store 单行块）· :154/:162（retrieval-backend 多行块 ×2）· :228/:232（rag-corpus-versioning 多行块 ×2）specifier 加 `retrieval/` 前缀；tenant 2 行（:33/:34）零触亲证（`barrelTenantReexports===2` 断言面零触）；retrieval-legacy 桶 0 行 ✓（蓝图 §1.1 barrel 列=0）· 全部导出名零改。
- **③ runner receipt（6 串/6 行 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改）**：db 侧 `'packages/db/src/rag-corpus-versioning.ts'` ×3（:623/:633/:673）+ `'…/retrieval-store.ts'` ×3（:1470/:1485/:1501）+ `'…/retrieval-legacy.ts'` ×2（:1470/:1485）→ 各加 `retrieval/` 前缀；`git diff -U0` 亲证恰 6 hunk 全在块内、hunk 头均 `@@ … @@ const isolatedReceiptSources = {`；retrieval-backend 无 runner 串 ✓（蓝图 runner=0）；**靶映射 6 靶与 §5 B2j 行 receipt 靶列逐靶吻合**（§3 靶对表）；`node --check` PASS；改后 `grep -nE "packages/db/src/(rag-corpus-versioning|retrieval-backend|retrieval-legacy|retrieval-store)\.ts['\"]" runner` = **0 命中**。
- **④ 仓内机械串（13 处/13 文件）＝ §5 B2j 行外部串列 1:1**：
  - **conn-stack 四连**（全 `join(root, 'packages/db/src/retrieval-store.ts')`）：`mysql-stack.m4-rag.skeleton.proof.mjs:24` · `mysql-stack.m5-fixtures.skeleton.proof.mjs:23` · `mysql-stack.qdrant-backed.prove.mjs:33` · `mysql-stack.r5-mark-red.proof.mjs:30` → 各加 `retrieval/` 前缀。
  - **qdrant-store 八文件**（全 `join(repoRoot, 'packages/db/src/retrieval-store.ts')`）：`memory-qdrant.proof.ts:49` · `qdrant-store.erase-honesty.proof.ts:29` · `qdrant-store.g5-erasure.proof.ts:41` · `qdrant-store.g5-ledger-map.proof.ts:49` · `qdrant-store.skeleton.proof.ts:24` · `qdrant-vectorstore-adapter.proof.ts:37` · `rag-qdrant.proof.ts:48` · `vectorstore-qdrant.proof.ts:41` → 各加前缀；改后 qdrant-store 树旧形态仅剩 S1 判留（见 §4）。
  - **db test 机械串**：`retrieval-backend-qdrant.proof.ts:41/:42`（`join(pkgRoot, 'src/retrieval-store.ts'/'src/retrieval-backend.ts')`）→ 加 `retrieval/` 前缀（恰 §5 B2j 行「:41/:42 join src/…」）。
  - **tenant-wiring manifest**：`tenant-wiring.manifest.ts:251` RESIDUAL_PATHS brace-glob 元素 `retrieval-*`→`retrieval/retrieval-*`（恰中本批 3 名 retrieval-backend/legacy/store · register 诚实律 B1 同判）；rag-corpus-versioning 名为 `rag-` 前缀**不被任何元素匹配（改前改后集合零漂移）· 零新增元素**；WIRED_FILES 六处 `file:` 实值（:147/:157/:170/:227/:233/:239）grep 亲证零涉本批 4 名（实值为 B2b/B2c/B2f 已迁移件）。
- **引号外零改亲证**：21 条目 29 行对逐行剥引号串（含内容）后逐字节比对 = **0 违例**（node 逐 hunk -/+ 队列配对脚本亲跑 · `/tmp/b2j-quotecheck.mjs` · strip-sanity 自证；4 rename 新路径在脚本 -M 配对外的 3 个 R100 由 name-status 相似度 100% 直证 · R098 唯一 hunk 单验）；全文件行数零变（257/149/45/66 + index 568 + runner 2583）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：本批 4 名相关面无 NUL 字节文件（B2r 批两 NUL 件 `qbank-generation-projection.ts`/`qbank-provider-input.ts` 本批零触）；残留 grep 全程默认 + 兜底无碍。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：node_modules 在树 · docker daemon 本席启动 · `meetwise-postgres-dev` 起后 Exited(0)（零影响·见 §0）· `.env` ABSENT 盘上亲证 · 每次 prove/runner/tsc 调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL`（env 亲证零模型键）。批前基线于净树（HEAD `40dc4551`）fresh 亲跑，先基线后动手，无 stash 环节。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R100×3+R098×1 rename 检出 · R098 blob 直比 Δ=1（①类）· **29 行对 quote-stripped 逐字节相同 0 违例** · `node --check` PASS · runner 残留 grep=0 · 6 hunk 全在 :93–:1640 · 全仓旧路径串仅剩 S1 判留（§4）· lockfile 双向零改 | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post 输出逐字节相同**（logs `diff` 为空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | EXIT=2 · sha 同左 | **逐字节相同** = 十批连续 B2a–B2j |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G3 | `prove:rag-corpus-version`（直跑键 · 经唯一合法隔离入口 runner `rag-corpus-version:prove:raw`，其命令链 root package.json :476 `pnpm -C packages/db prove:rag-corpus-version`） | EXIT=0（41 行规范化逐行同） | EXIT=0 | **绿保持绿** · receipt 新 `retrieval/` 键 ×1 · ENOENT=0 |
| G3 | `prove:rag-control-role`（runner `rag-control-role:prove:raw` · 命令 map :1853） | EXIT=0（31 行规范化逐行同） | EXIT=0 | 绿保持绿 · receipt 新键 ×1 |
| G3 | `prove:rag-control-upgrade`（runner 同名 · :1855） | EXIT=0（16 行） | EXIT=0 | 绿保持绿 · receipt 新键 ×1 |
| G3 | `prove:rag-control-dispatch`（runner 同名 · root :482 回退链） | EXIT=0（22 行） | EXIT=0 | 绿保持绿 · 本靶无本批串（sourceDigests 新键 0 ✓ 与 ③ 面一致） |
| G3 | `prove:rag03-filter-locus`（runner 同名 · :1963） | EXIT=0 | EXIT=0 | 绿保持绿：规范化后仅 per-run 随机值异（principal nonce/qgen uuid ×3/计划耗时），**PASS/FAIL 签名 12 断言 sort 后逐行相同 FAIL=0** · receipt 新键 ×2（store+legacy） |
| G3 | `prove:rag03-hnsw-completeness`（:1965） | EXIT=0 | EXIT=0 | 绿保持绿：规范化后仅 HNSW 索引随机哈希后缀异（`qgc_hnsw_visible_<hash>` per-run 建索引），签名 16 断言逐行同 FAIL=0 · receipt 新键 ×2 |
| G3 | `prove:rag03c-exactk-observe`（:1967） | EXIT=0 | EXIT=0 | 绿保持绿：同形（索引随机哈希），签名 7 断言逐行同 FAIL=0 · receipt 新键 ×1 |
| G3 | `prove:vectorstore`（runner `vectorstore:prove:raw` · root :243 回退链 · marked-red legacy 自证面） | EXIT=0（23 行规范化逐行同） | EXIT=0 | 绿保持绿 · 该靶无 isolatedReceiptSources 条目（结构性无 receipt·非 ENOENT） |
| G3 | `prove:retrieval-backend-qdrant`（直跑键 · **无 runner 靶**·裸跑唯一形态——静态面 proof 无 runner 隔离 attest 要求，B2b `tenant-wiring-e5` 裸跑同判） | **EXIT=3（base 红 · 蓝本 §4 E5 预告红候选：Qdrant /readyz 未起 → refuse silent fake-green）** | **EXIT=3** | **同形红：PASS/FAIL/EXIT 签名 sort 后逐行相同**（`CMD=pnpm retrieval-store:qdrant:prove EXIT=3` 双侧一致 · 红原值登记不洗） |
| G4 | commit 后 `git status` | — | 0 entries（amend 折收据后复验）· 本批 16 只 runner 一次性容器（8 pre + 8 post）随成功 finally 自拆零残留（`docker ps -a` 亲证仅存 `meetwise-postgres-dev Exited(0)` 环境件·非本批产物） | 干净 |

**G3 时序披露（C-UNCOMMITTED 门 · 非重试非洗红）**：批后轮必须在 commit 后净树执行（proof 自带净树守卫）→ 本批序 = 基线（净树 pre）→ 改动 → commit（首版 `2cddde5c`）→ 净树 post 轮 → 收据 amend（终版 hash 见交付报告 = 首版 + 本收据 docs-only；post 九轮均在首版树上跑，其树内容≡终树除本收据）。**attempts 全账：G3 9 键 × pre/post 各一轮逐键一次完成（8 runner 靶 + 1 裸跑 ×2 = 18 次）+ G2 pre/post 各 1 轮（3 包 ×2 = 6 次）+ G1 五门 ×2 = 10 次 · 全部单发零重跑（34 attempts 零 retry-to-green）· 无 stash 伪红 attempt。**
**post receipt sourceDigests 亲证 ③ 类改写正确性**（7 只 post receipt 全查，pre 7 只同形）：`rag-corpus-version:prove:raw` 新 `retrieval/rag-corpus-versioning.ts` ×1 · `rag-control-role` ×1 · `rag-control-upgrade` ×1 · `rag03-filter-locus` 新 `retrieval/retrieval-store.ts`+`retrieval/retrieval-legacy.ts` ×2 · `rag03-hnsw-completeness` ×2 · `rag03c-exactk-observe` 新 `retrieval/retrieval-store.ts` ×1 · `rag-control-dispatch` 新键 0（本靶无本批串·结构一致）——**恰为本批 8 串的靶内分布，与 §5 B2j 行 receipt 靶列 1:1**；**stale 旧路径 = NONE**（七 receipt 全查）；`packages/domain/src/*` 键原样零触。receipt 文件名：pre `2026-10-10T02-27-{04,09,13,18,29,36,43}-…` · post `2026-10-10T02-35-{15,22,27,32,46,54}`+`02-36-03-…`。

## 3. 靶对表（③ 类 8 串 → runner 靶 · 与 §5 B2j 行 receipt 靶列 1:1）

| runner:line | target | §5 B2j 靶列归属 | 批后实测 |
|---|---|---|---|
| :623 | `rag-control-role:prove:raw` | rag-corpus-versioning 面 ✓ | ③ 改写 · **本批必跑直跑键 · pre/post EXIT=0→0**（sourceDigests 新键 ×1） |
| :633 | `rag-control-upgrade:prove:raw` | rag-corpus-versioning 面 ✓ | ③ 改写 · **必跑 · pre/post 0→0**（新键 ×1） |
| :673 | `rag-corpus-version:prove:raw` | rag-corpus-versioning 面 ✓ | ③ 改写 · **必跑 · pre/post 0→0**（新键 ×1） |
| :1470（×2 串） | `rag03-filter-locus:prove:raw` | retrieval-store + retrieval-legacy 面 ✓ | ③ 改写 · **必跑 · pre/post 0→0**（新键 ×2） |
| :1485（×2 串） | `rag03-hnsw-completeness:prove:raw` | retrieval-store + retrieval-legacy 面 ✓ | ③ 改写 · **必跑 · pre/post 0→0**（新键 ×2） |
| :1501 | `rag03c-exactk-observe:prove:raw` | retrieval-store 面 ✓ | ③ 改写 · **必跑 · pre/post 0→0**（新键 ×1） |

R5 口径：receipt 靶批内必跑集合=∅；本批实跑 = 直跑键 9 键（§5 直跑键列 9 键 1:1 全跑：8 runner 靶 + 1 裸跑 retrieval-backend-qdrant）· §5 receipt 靶列其余未列外靶未跑（post 双审指令 + B2s 终批 sweep 兜底）。retrieval-backend receipt 靶 = 无 ✓（蓝图 runner=0，③ 面 0 串亲证）。

## 4. S1 判留复述登记（Ban 10 · 本批零新增）

- **S1 第八处清单之 #6 本批复述**：`packages/qdrant-store/src/product-vectorstore-bridge.ts:5/:9` 头注 `packages/db/src/retrieval-backend.ts` / `packages/db/src/retrieval-store.ts` 路径散文串——判留陈旧零改（全仓旧路径残留 grep 唯二命中·亲证）；改则须批 REQUEST 单列，本批不改。
- S1 其余七处（`db-acl:267/490 · qbank-source:2 · uc052-checkpoint-physical.proof.ts:7 · qbank-route-scope-cache:16 · qbank-track-local-retrieval:13 · uc-e2e-011×2 · uc-e2e-014-026:19`）零涉本批移动名。
- 移动件内注释互指（retrieval-backend:23 ↔ retrieval-store:4 `./retrieval-*.ts`）**非判留**：同批同域移动后仍真，零改零登记负担（如实体证）。
- **历史收据档案**：`ai-docs/delivery/receipts/` 下历史收据 JSON（gap-rag-02/gap-rag-03-r3-filter-locus 等）含 `packages/db/src/retrieval-store.ts`/`retrieval-legacy.ts` 旧路径 sourceDigests 键——历史证据面（sha256 钉当时字节）判留零改（B2a–B2i 同判：档案收据非机械消费面）。
- `packages/domain/src/` 整包零涉本批 4 名（grep 亲证 0 命中）。

## 5. 收口判定

**B2j 收口判定：G0/G1/G2/G3/G4 全对表通过（绿保持绿 8 靶 · 红同形红 1 裸键 · tsc sha 十批连续 · receipt ENOENT=0 · sourceDigests 新 `retrieval/` 键逐靶齐恰 8 串分布 + stale=NONE）· 1 commit 1 收据（收据经 amend 折入本批唯一 commit——C-UNCOMMITTED 净树门时序强制 · post 九轮均在折入前首版树执行）· §5 B2j 行外部串列 13 处/13 文件 1:1 收口（conn-stack 四连 + qdrant-store 八文件 + proof :41/:42 + manifest :251 brace-glob 元素前缀）· 漂移支线 f47670e6 与本批全编辑行零行级交集（manifest :253 reason 行 vs 本批 :251 file 行同块邻行如实在案）· drift 侧新文件 resume-privacy.ts 不在 B2 清单已登记 · S1 #6 复述登记 + 历史档案判留沿判 · 蓝本 §5 B2j 行状态由本收据承载推进（蓝本原文零改写）。**

---

*DIR-1 B2 · B2j/19 · 2026-10-07 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
