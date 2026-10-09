# B2i 批收据 — DIR-1 B2 domain 目录拆解刀（第 9/19 批）

**Batch**: B2i（§5 表 B2i 行：context/ 域 4 文件）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-10）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3 · R10 已落实：receipt 靶 ctx04/ctx05/ctx06 用 runner 全名 · package.json scripts + runner 实名核双过）
**Base tip**: 本批开席 pull 双侧 tip `5bd79258`（B2h 批后）· **基线/commit 实际 HEAD `cc76a554`**（开席与基线执行之间，B2h 席在同一 worktree 串行折收据 amend @ 2026-10-10 01:40:55——与 `5bd79258` 树差仅 `B2h/receipt.md` docs-only +92 行，tsc/G1/prove 机械面零影响 · reflog 亲证）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g `cc15bbe9` · B2h `5bd79258`→收据 amend `cc76a554`）
**Commit**: 本批一 commit（author `mw-dirb2-b2i` · **hash 见交付报告** · 收据经 amend 折入——C-UNCOMMITTED 净树门时序强制，同 B2g 先例）· releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：`git pull origin line/dir-b2-domain` 后 **Already up to date（双侧 tip `5bd79258` = B2h 批后 tip）· 开席工作树干净**；SOP 沿 B2a–B2h；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH/TOKSTREAM/隐私主线/r4 面零触，本批改动面见 §1）。
- **lockfile 口径**：merge-base(HEAD, origin/main) = **origin/main tip `c4244470` 本体 → 0 个未拉主线提交**；`git log e2834082..HEAD -- pnpm-lock.yaml` = **0 commit**（本线自基点起零触碰；`c4244470..HEAD` 计 4 个 lockfile commit 全在 B2a 之前本线自身历史 `db0d513f`/`775710f4`/`3e42d16c`/`0a3c8a8a`，亲证非 B2 批面）；G0「lockfile 零改」= 本批零改（staged + worktree 双向 PASS）；tsc 批前基线三 sha 与 B2a–B2h 八批连续基线逐字节相同（§2 G2 行）= 环境无位移机械反证。
- **漂移预检（fresh 亲跑）**：
  - own-line 触史：ctx03-event-source / context-compression-{dispatch,erasure,snapshot}.ts 自 base **零 commit 触史**（唯一 commit = 初始 `d9394e91`，未移动过）；本批其余面（index.ts · runner）触史 = 仅本线自身白名单 commit（B2h `5bd79258` index.ts+runner 亲证）——零外来漂移。
  - 漂移支线 `origin/feat/mysql-schema-skeleton` @ `c0c18012`（B2g 时 `3be96fc6` → 前进）：与本批面交集文件 = `index.ts`（drift hunk `@@ -367,6 +367,21 @@`，即 :367–:382 区域——**与本批 ② 面 :444–:539 零行级交集**）· `runner`（drift hunks `@@ -437/-448/-1709/-1996/-2473`——**与本批 ③ 面 :1189–:1257 零行级交集**，drift 侧 isolatedReceiptSources 触点全在本批靶区间之外）；`tenant-wiring.manifest.ts` drift **零触**（空 diff）；本批 4 个移动文件 drift 侧 `--name-only` 交集 = **0**。
  - 环境在飞面（诚实登记）：开席时 `meetwise-e2e-40347-*` 容器 Up 56s **非本席启动**（他席/他线在飞，本批零处置；G4 复验时已自行结束删除）。

## 1. 批内文件清单与 mv 证据（§5 B2i 行：ctx03-event-source(304行) · context-compression-dispatch(193行) · -erasure(92行) · -snapshot(170行)）

| # | 移动 | 证据（`git diff --cached -M`） |
|---|------|-------------------------------|
| 1 | `packages/db/src/ctx03-event-source.ts` → `packages/db/src/context/ctx03-event-source.ts` | `R099`（similarity 99%）= R100 + **①类 1 行**（:17 `import type { Client } from './principal.ts'`→`'../principal.ts'` 锚；blob 直比仅此一行 · 行数 304 零变） |
| 2 | `packages/db/src/context-compression-dispatch.ts` → `packages/db/src/context/context-compression-dispatch.ts` | `R099` 同上（① :18 锚 · 193 行零变） |
| 3 | `packages/db/src/context-compression-erasure.ts` → `packages/db/src/context/context-compression-erasure.ts` | `R099` 同上（① :16 锚 · 92 行零变） |
| 4 | `packages/db/src/context-compression-snapshot.ts` → `packages/db/src/context/context-compression-snapshot.ts` | `R099` 同上（① :17 锚 · 170 行零变） |

**白名单随批改（B2i 实面 · §3 四类对账 · staged 面 = 4 mv + 2 文件 = 6 条目 · 22 内容行对，零第八方）**：

- **① 包内 import（4 行 = 移动件自引 4 · 消费件 0）**：自引 4 见上表（各文件唯一 `./principal.ts` 锚；余 import 为 `node:crypto`/`@meetwise/domain` 零涉）。消费件 **0**：db src+test 双形态 `'./`+`'../`+'src/' 亲核零命中（本批 4 名的 `.ts` 引用全仓仅 index.ts ② 面 + runner ③ 面）；**`packages/domain/src/` 另有同名 `ctx03-event-source.ts` 及其 5 处包内 import——他包零触**（B2 面=packages/db）。
- **② 桶 re-export（8 行）**：`index.ts` :444/:451（ctx03 值+型两块）· :502/:506（snapshot）· :525/:529（dispatch）· :535/:539（erasure）specifier 加 `context/` 前缀；tenant 2 行零触（diff 内 tenant 命中=0 亲证）· 全部导出名零改（`barrelTenantReexports===2` 断言面零触）。
- **③ runner receipt（12 串/10 行 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改）**：db 侧 `'packages/db/src/ctx03-event-source.ts'` ×6 + `'…/context-compression-snapshot.ts'` ×3 + `'…/context-compression-dispatch.ts'` ×2 + `'…/context-compression-erasure.ts'` ×1 → 各加 `context/` 前缀（:1189/:1200/:1214/:1227/:1228/:1241/:1242×2/:1255/:1256×2/:1257，`git diff -U0` 亲证 10 行全在块内 · **domain 侧同名字符串 ×6 零触**）；**靶映射 6 靶与 §5 B2i 行 receipt 靶列逐靶吻合**（§3 靶对表）；R10 全名核：`packages/db/package.json` :50/:75/:76/:77 四键 + runner 靶名 `ctx03-event-source`/`ctx04-compression-snapshot`/`ctx05-concurrency-recovery`/`ctx06-deletion-closure` 全名实名双过 ✓；`node --check` PASS；改后 `grep -nE "packages/db/src/(ctx03-event-source|context-compression-(dispatch|erasure|snapshot))\.ts['\"]" runner` = **0 命中**。
  - 本席过程披露：初写 ③ 面漏 :1257（ctx06 靶内 dispatch 串），残留 grep 门前捕获（1 命中）→ 当批补改收口——属白名单面当批收口非追绿重试（B2g 同判先例）。
- **④ 仓内机械串（0 行）＝ §5 B2i 行外部串列「无」1:1**：`tenant-wiring.manifest.ts` 两 RESIDUAL_PATHS brace-glob（12 元素集 + 9 元素集）**均不含本批 4 名**（`memory-*`/`qbank-*`/`retrieval-*`/`int-transcript*` 通配不匹配 ctx03-event-source/context-compression-*，逐元素亲核）；conn-stack/qdrant-store/apps/e2e/docker/根 tsconfig 三形态 grep = 0。register 诚实律（brace-glob silent absence）零触发面。
- **引号外零改亲证**：6 条目 ×22 行对逐行剥引号串（含内容）后逐字节比对 = **0 违例**（node 逐 hunk -/+ 队列配对脚本亲跑 · `/tmp/b2i-quotecheck.mjs` · strip-sanity 双样本自证）；全文件行数零变（304/193/92/170 + index/runner 行数不变）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：全程 `grep` 默认 + 关键残留面 `grep -a` 复核（本批 4 名相关面无 NUL 字节文件；B2r 批两 NUL 件 `qbank-generation-projection.ts`/`qbank-provider-input.ts` 本批零触且 -a 亲证零本批名引用）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：node_modules 在树 · `meetwise-postgres-dev` Up 6h+ healthy (54329) · `.env` ABSENT 盘上亲证 · 每次 prove/runner/tsc 调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL`（env 亲证零模型键）。批前基线于净树 fresh 亲跑（HEAD 实为 `cc76a554` = `5bd79258` + B2h docs 收据 · 本批先基线后动手，无 stash 环节）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R099×4 rename 检出 · blob 直比 Δ=1/1/1/1（全 ①类）· **22 行对 outside-quote 逐字节相同 0 违例** · `node --check` PASS · runner 残留 grep=0 · 10 行全在 :93–:1640 · 全仓旧路径串 0（`'./`+`'../`+`src/` 三形态兜底 grep · e2e//docker/ 零命中）· lockfile 双向零改 | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post 输出逐字节相同**（logs `diff` 为空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | EXIT=2 · sha 同左 | **逐字节相同** = 九批连续 B2a–B2i |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G3 | `prove:ctx03-event-source`（直跑键 · 经唯一合法隔离入口 runner `ctx03-event-source:prove:raw`） | EXIT=0 @ `5bd79258`（63 PASS · 0 FAIL） | EXIT=0 @ `9c6b7857`（63 PASS · 0 FAIL） | **绿保持绿：规范化（容器名/端口/时间戳/receipt 文件名）后逐行相同（74 行 md5 同）**；receipt ENOENT=0 |
| G3 | `prove:ctx04-compression-snapshot` | EXIT=0（40 PASS · 0 FAIL） | EXIT=0（40 PASS · 0 FAIL） | 绿保持绿（52 行规范化逐行同） |
| G3 | `prove:ctx05-concurrency-recovery` | EXIT=0（79 PASS · 0 FAIL） | EXIT=0（79 PASS · 0 FAIL） | 绿保持绿（88 行规范化逐行同） |
| G3 | `prove:ctx06-deletion-closure` | EXIT=0（27 PASS · 0 FAIL） | EXIT=0（27 PASS · 0 FAIL） | 绿保持绿（38 行规范化逐行同） |
| G4 | commit 后 `git status` | — | 0 entries（amend 折收据后复验） · 本批 8 轮 runner 容器（4 pre + 4 post）零残留（随成功自动删除 · `docker ps -a` 亲证仅存 2 日前他线 `meetwise-e2e-62497-cold2-stop-band-1` exited(0) 残壳——非本批产物 · 登记不处置） | 干净 |

**G3 时序披露（C-UNCOMMITTED 门 · 非重试非洗红）**：批后轮必须在 commit 后净树执行（proof 自带净树守卫）→ 本批序 = 基线（净树 pre）→ 改动 → commit（首版 `9c6b7857`）→ 净树 post 轮 → 收据 amend（终版 hash 见交付报告 = 首版 + 本收据 docs-only；post 四轮均在首版树上跑，其树内容≡终树除本收据）。**无 stash 伪红 attempt**（本席先跑全基线再动手，与 B2g ② 步时序伪红不同账 · attempts 全账：pre ×4 EXIT=0 + post ×4 EXIT=0，共 8 attempts 零红）。**post receipt sourceDigests 亲证 ③ 类改写正确性**：四 receipt 新 `context/` 键逐靶齐（ctx03 靶 ×1 · ctx04 靶 ×2 · ctx05 靶 ×3 · ctx06 靶 ×4 = 恰为本批 12 串的靶内分布）· **stale 旧路径 = NONE**（四 receipt 全查）· `packages/domain/src/*` 键原样零触。

## 3. 靶对表（③ 类 12 串 → runner 靶 · 与 §5 B2i 行 receipt 靶列 1:1 · R10 全名）

| runner:line | target（R10 全名） | §5 B2i 靶列归属 | 批后实测 |
|---|---|---|---|
| :1189 | `ctx03-event-source:prove:raw` | ctx03 面 ✓ | ③ 改写 · **本批必跑直跑键 · pre/post EXIT=0→0**（sourceDigests 新键 ×1） |
| :1200 | `mem02-summary:prove:raw` | ctx03 面 · 红候选 ✓ | ③ 改写（未跑 · post 双审/B2s sweep 兜底） |
| :1214 | `mem03-summary-tree:prove:raw` | ctx03 面 · 红候选 ✓ | ③ 改写（未跑 · 同上） |
| :1227 | `ctx04-compression-snapshot:prove:raw` | snapshot 面 ✓ | ③ 改写 · **本批必跑直跑键 · pre/post EXIT=0→0**（新键 ×2） |
| :1228 | `ctx04-compression-snapshot:prove:raw` | ctx03 面 ✓ | （与 :1227 同靶同行对）③ 改写 |
| :1241 | `ctx05-concurrency-recovery:prove:raw` | dispatch 面 ✓ | ③ 改写 · **本批必跑直跑键 · pre/post EXIT=0→0**（新键 ×3） |
| :1242（×2 串） | `ctx05-concurrency-recovery:prove:raw` | ctx03 + snapshot 面 ✓ | （同靶）③ 改写 |
| :1255 | `ctx06-deletion-closure:prove:raw` | erasure 面 ✓ | ③ 改写 · **本批必跑直跑键 · pre/post EXIT=0→0**（新键 ×4） |
| :1256（×2 串） | `ctx06-deletion-closure:prove:raw` | ctx03 + snapshot 面 ✓ | （同靶）③ 改写 |
| :1257 | `ctx06-deletion-closure:prove:raw` | dispatch 面 ✓ | （同靶 · 本席漏改点已当批收口）③ 改写 |

R5 口径：receipt 靶批内必跑集合=∅；本批实跑 = 直跑键 4 靶（必跑 · 恰为 §5 直跑键列 4 键）；mem02-summary/mem03-summary-tree（红候选）未跑（post 双审指令 + B2s 终批 sweep 兜底）。

## 4. S1 判留复述登记（Ban 10 · 本批零新增）

- S1 八处判留清单**零涉本批移动名**（`db-acl:267/490 · qbank-source:2 · uc052-checkpoint-physical.proof.ts:7 · qbank-route-scope-cache:16 · qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc-e2e-014-026:19`）——本批 4 名不在任何豁免行，零新增判留。
- **历史收据档案**：`ai-docs/delivery/receipts/` 下历史收据 JSON 若含 `packages/db/src/ctx03-event-source.ts` 等旧路径 sourceDigests 键——历史证据面（sha256 钉当时字节）判留零改（B2a–B2g 同判：档案收据非机械消费面）。
- `packages/domain/src/` 整包（含同名 ctx03-event-source.ts 与其包内 import ×5 · barrel ×2）——他包零触，其相对路径语义不因本批改变，散文持续为真。

## 5. 收口判定

**B2i 收口判定：G0/G1/G2/G3/G4 全对表通过（绿保持绿 · 红同形红 · tsc sha 九批连续 · receipt ENOENT=0 · sourceDigests 新 `context/` 键逐靶齐 + stale=NONE）· 1 commit 1 收据（收据经 amend 折入本批唯一 commit——C-UNCOMMITTED 净树门时序强制，amend 树差仅本收据文件 · pre/post proof 全在折入前树执行）· §5 B2i 行外部串「无」零改 1:1 收口 · R10 全名（ctx04-compression-snapshot/ctx05-concurrency-recovery/ctx06-deletion-closure）package.json+runner 双实名核落实 · ③ 面漏改 :1257 由残留 grep 门前捕获当批收口（B2g 引号外自纠同判先例）· 席间串行交接如实披露（B2h 席收据 amend `cc76a554` 落于本批基线窗口，docs-only 零机械影响）· 蓝本 §5 B2i 行状态由本收据承载推进（蓝本原文零改写）。**

---

*DIR-1 B2 · B2i/19 · 2026-10-07 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
