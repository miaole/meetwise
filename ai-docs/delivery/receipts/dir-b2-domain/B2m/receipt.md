# B2m 批收据 — DIR-1 B2 domain 目录拆解刀（第 13/19 批）

**Batch**: B2m（§5 表 B2m 行：scoring/ 域 3 文件）· **EXEC**: mw-core（W6 DB 线）· **Date**: 2026-10-10（worktree 时钟）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席 `git pull origin line/dir-b2-domain` → **Already up to date（双侧 tip `ce050e1e` = B2l 批后终版）· 工作树干净** · **首版 commit `37cdb726`**（mv+白名单首版即全绿 · 无 ① 补齐轮）→ **收据经再 amend 折入**（C-UNCOMMITTED 净树门时序强制，同 B2g/B2i/B2j/B2k/B2l 先例 · 终版 hash 见交付报告 = 首版 + 本收据 docs-only）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g amend `cc76a554` · B2h `5bd79258` · B2i `40dc4551` · B2j `4a8b47b5` · B2k `3003665e` · B2l `ce050e1e`）
**Commit author**: `mw-dirb2-b2m` · releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：开席 pull → Already up to date（tip `ce050e1e`）· 工作树干净；SOP 沿 B2a–B2l 十三先例；W 线冻结序 + loop §3 冲突表零命中（本批改动面见 §1；apps src 零触）。
- **主线漂移（亲跑）**：`git fetch origin main` → tip `c4244470`（与 B2l 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体`。
- **任务提示面支线亲核**：五支线 tip 与 B2l 批收据逐一同值零前进——`origin/line/unstub-erase` `03209663` · `origin/line/trial-grant` `3ef2403c` · `origin/line/b110-recruiter-gate` `ee02bf4d` · `origin/line/obs-ready` `3684bc00` · `origin/feat/mysql-schema-skeleton` `9a1fdc07`；drift 侧 db 平铺新文件仍仅两件在册（`resume-privacy.ts` unstub-erase/obs-ready/skeleton · `scoring-wire.ts` trial-grant/obs-ready/skeleton），**本批无第三件**。
- **漂移支线 vs 本批面行级交集（亲跑）**：本批 3 移动件名（db 平铺 scoring 三名）在五支线 diff **零文件级命中**（scoring 命中面 = `packages/domain/src/scoring-*` 同名族 + `scoring-wire.ts` 在册件，均非本批面）；trial-grant 触 `packages/db/src/index.ts` hunk `@@ -337,6 +367,21`（evidence-conflict 桶块后**纯插入** scoring-wire 导出 15 行——本批 ② 面 :347/:351/:357/:361/:365/:368 六 specifier 行在漂移侧全为**未改上下文行** → 零修改交集）；b110/其余四支线触 runner 的 hunks 对本批 ③ 面 9 串 7 行（:1368–:1584）**零修改命中**（b110 块内仍纯插入形态 · 同 B2l 判）；**新增披露**：trial-grant/obs-ready/skeleton 三支线 runner diff 各**插入含旧路径 scoring 串的新 receipt 行**（其 scoring-wire 靶数组内 `'packages/db/src/scoring-{fact-root,aggregation,evidence-conflict}.ts'` 字面）——纯插入非本批行修改，合并时该三行需 ③ 类同型再改（协调方 merge-time 工序登记，非本刀面）。**零修改交集 → 不停手照常执行。**
- **环境在飞面**：node_modules 在树 · `.env` ABSENT 盘上亲证 · ambient env 零 MODEL 键（每次调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 亲包）· `meetwise-postgres-dev`（54329）Up healthy（G3 隔离跑 PG 面用）· 批内两查（基线跑后 + 收尾）docker 面零 `meetwise-e2e-*` 瞬态/残留（B2l 瞬态 59973 形态本批未再现）。
- **lockfile 口径**：`git log e2834082..HEAD -- pnpm-lock.yaml` = 0 commit；G0「lockfile 零改」= 本批零改（staged + worktree 双向 PASS 亲证）；tsc 批前三 sha 与批后逐字节相同 = 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2m 行：scoring-aggregation(111行) · scoring-evidence-conflict(86行) · scoring-fact-root(207行)）

| # | 移动 | 证据（`git diff --cached -M --name-status` @首版/收据 amend 后同形） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/scoring-aggregation.ts` → `packages/db/src/scoring/scoring-aggregation.ts` | `R099` = R100 + **①类 1 行**（:14 `import type { Client } from './principal.ts'`→`'../principal.ts'` 锚向；111 行零变 · 相似度 99%） |
| 2 | `packages/db/src/scoring-evidence-conflict.ts` → `packages/db/src/scoring/scoring-evidence-conflict.ts` | `R098`（同上 · :19 · 86 行零变 · 相似度 98%（短文件 1 行差）） |
| 3 | `packages/db/src/scoring-fact-root.ts` → `packages/db/src/scoring/scoring-fact-root.ts` | `R099`（同上 · :20 `Client, DbPool` 锚向 · 207 行零变） |

**盘点口径（B2l 教训采纳）**：三件自引面 = 各恰 1 行 `./principal.ts` 锚向，零同域/跨域互引；消费面 any-form 全仓 sweep（`./x.ts` + `../src/x.ts` + B2l 新增第三形态 `../x.ts` 三式）——db src+test 面**零消费件命中**（§1.1 inSRC=0 亲证成立 · scor-01/02/03 + growth 四 proof 均 `@meetwise/db` 桶引零改）；`packages/domain/src/scoring-{aggregation,evidence-conflict,fact-root}.ts` 同名族为 domain 包内自引（不同路径域 · 零改 · §4 登记）。

**白名单随批改（B2m 实面 · §3 四类对账 · staged 面 = 3 rename + 2 modified = 5 条目 · 16 内容行对 · numstat +16/−16 · 零第八方）**：

- **① 包内 import（3 行 = 移动件自引 3 · 消费件 0）**：aggregation:14 / evidence-conflict:19 / fact-root:20 三处 `./principal.ts`→`../principal.ts` 锚向（三件唯一相对 import · 零消费者改写 = §1.1 inSRC=0 落地）。
- **② 桶 re-export（6 行）**：`index.ts` :347/:351（fact-root）· :357/:361（aggregation）· :365/:368（evidence-conflict）specifier 加 `scoring/` 前缀；tenant 2 行（:33/:34）零触亲证；全部导出名零改；:347–:368 区间注释行零 scoring 路径串（本批无 B2l :51 型注释命中）。
- **③ runner receipt（9 串/7 行/5 hunks · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改亲证）**：`'packages/db/src/scoring-aggregation.ts'` ×3（:1382/:1398/:1415）+ `'…/scoring-evidence-conflict.ts'` ×1（:1398）+ `'…/scoring-fact-root.ts'` ×5（:1368/:1382/:1399/:1416/:1584）→ 各加 `scoring/` 前缀（**节点脚本引号锚定替换 3+1+5 = 9 恰对账 §1.1 runner 列 3/1/5**）；`git diff -U0` 亲证恰 5 hunk（:1368/:1382/:1398×2/:1415×2/:1584）全带 `const isolatedReceiptSources = {` 上下文头；`node --check` PASS；改后 `grep -nE "packages/db/src/(scoring-aggregation|scoring-evidence-conflict|scoring-fact-root)\.ts['\"]" runner` = **0 命中**；同靶数组内 `packages/domain/src/scoring-*.ts` 10 串零改亲证（③ 类仅 db 面）。
- **④ 仓内机械串（0 处）**：`tenant-wiring.manifest.ts` grep "scoring" = 0 命中（RESIDUAL_PATHS brace-glob :245/:251 与 WIRED_FILES 六处 file: 实值零涉）；apps/worker r4-funnel、conn-stack、qdrant-store、e2e 面 any-form sweep 0 命中——**= §5 B2m 行外部串「无」亲证 ✓**。
- **引号外零改亲证**：16 行对逐行剥引号串后逐字节比对 + 引号 payload 差异白名单映射校验（① `./→../`锚 · ② `./<n>.ts`→`./scoring/<n>.ts` · ③ `packages/db/src/<n>.ts`→`…/scoring/<n>.ts`）= **0 违例**（node 有序配对脚本亲跑 · 全行 3560/3560 配对 · changed_pairs=16 violations=0）；全文件行数零变（111/86/207 + index 568 + runner 2583）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：本批全部 5 编辑面文件 node 字节级 NUL 检查 clean（`buf.indexOf(0)` 亲跑）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

批前基线于净树（HEAD `ce050e1e`）fresh 亲跑，先基线后动手，无 stash 环节。批后轮于首版 commit `37cdb726` 净树执行（C-UNCOMMITTED 时序同先例：post 轮均在折入前树上跑，其树内容≡终树除本收据）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R099×2 + R098×1 rename 检出 · 16 行对 quote-stripped 逐字节相同 **0 违例**（白名单 payload 映射 16/16 · 有序配对 3560/3560）· `node --check` PASS · runner 残留 grep=0 · 5 hunk 全在 :93–:1640 全带上下文头 · 全仓旧路径串残留 = 全部 ai-docs 面判留登记（§4）· lockfile 双向零改 · 5 文件 NUL clean · tenant 2 行零触 | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过（**规范化同形**：diff 仅 receipt 路径时间戳/PID/uuid/loop 目录后缀挥发面 · B2f/B2l 同判） |
| G1 | `e2e-static-guards:check` | EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6） | EXIT=0 | 过（逐字节相同） |
| G1 | `e2e-static-guards:prove` | EXIT=0（selected=30/30） | EXIT=0 | 过（逐字节相同） |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post 输出逐字节相同**（`diff` 空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `cb491ccd236afcc3`（24 行） | EXIT=2 · **sha 同基线** | **逐字节相同**（cmp 亲证 · 首版即过 · 无补齐轮） |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `6244df5d4e0f3853`（37 行） | 同上 → **sha 同基线** | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `8690abf68c9dd4d9`（44 行） | 同上 → **sha 同基线** | **逐字节相同** |
| G3 | `prove:scor-01`（直跑键 · 经唯一合法隔离入口 runner `scor-01:prove:raw`） | EXIT=0（PASS=64 FAIL=0） | EXIT=0（PASS=64 FAIL=0） | **绿保持绿**：PASS/FAIL 计数同值 |
| G3 | `prove:scor-02`（经 runner `scor-02:prove:raw`） | EXIT=0（PASS=59 FAIL=0） | EXIT=0（PASS=59 FAIL=0） | **绿保持绿** |
| G3 | `prove:scor-03`（经 runner `scor03-evidence-conflict:prove:raw`） | EXIT=0（PASS=64 FAIL=0） | EXIT=0（PASS=64 FAIL=0） | **绿保持绿** |
| G3 | receipt ENOENT 观察 | pre 三靶各产出 1 只（`…T03-32-32…`/`…03-32-38…`/`…03-32-44…`） | post 三靶各产出 1 只（`…T03-35-13…`/`…03-35-21…`/`…03-35-27…`） | **ENOENT=0 双向成立（6/6 产出正常 · outcome=passed exitCode=0 · release_evidence=false 标注一致）；post 3 只 sourceDigests 亲证解析新路径**——`scoring/scoring-fact-root.ts`（scor-01）· `scoring/{scoring-aggregation,scoring-fact-root}.ts`（scor-02）· `scoring/{scoring-evidence-conflict,scoring-aggregation,scoring-fact-root}.ts`（scor03）· **零 stale 旧路径**（旧平铺形态 regex 复核 = 0）——③ 类改写正确性机械证据 · E4 反面教训闭环 |
| G4 | commit 后 `git status` | — | **0 entries**（首版后亲证）· docker 面仅环境件 `meetwise-postgres-dev Up healthy`（非本批产物）· 批内两查零 `meetwise-e2e-*` 容器瞬态/残留 | 干净 |

**attempts 全账（Ban retry-to-green）**：G3 直跑键 pre 3 + post 3 = 6 次（逐键单发）；G2 pre 3 + post 3 = 6 次（首版即 sha 同基线 · 无补齐轮）；G1 五门 ×2 = 10 次——**共 22 attempts** · 无 stash 伪红 attempt · 无 retry-to-green。

## 3. 靶对表（③ 类 9 串 → 5 唯一 runner 靶 · 与 §5 B2m 行 receipt 靶列对账）

| runner:line | target | 承载串（本批移动名） | R5 处置 |
|---|---|---|---|
| :1368 | `scor-01:prove:raw` | **scoring-fact-root** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 新路径亲证） |
| :1382 | `scor-02:prove:raw` | **scoring-aggregation + scoring-fact-root**（双串行） | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 两新路径亲证） |
| :1398/:1399 | `scor03-evidence-conflict:prove:raw` | **scoring-evidence-conflict + scoring-aggregation + scoring-fact-root**（三串跨两行） | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 三新路径亲证） |
| :1415/:1416 | `growth:prove:raw` | scoring-aggregation + scoring-fact-root | 批内 0 跑（post 双审/B2s sweep） |
| :1584 | `rag05-qbank-miss:prove:raw` | scoring-fact-root | 批内 0 跑（post 双审/B2s sweep） |

**§5 B2m 行靶列对账（1:1 吻合 · 零差异）**：aggregation（3）= growth/scor-02/scor03 ✓ · conflict（1）= scor03 ✓ · fact-root（5）= scor-01/scor-02/scor03/growth/rag05-qbank-miss ✓——串总数 3+1+5 = 9 与实跑 9 ✓（唯一靶 5）。R5 口径：receipt 靶批内必跑集合=∅（直跑键三键即承载其中三靶）；本批实跑 = 直跑键 3 键；其余 2 靶（growth · rag05-qbank-miss）未跑（post 双审 + B2s 终批 sweep 兜底）。

## 4. S1 判留复述登记（Ban 10 · 本批新增 ai-docs 面登记）

- S1 既有八处清单（db-acl:267/490 · qbank-source:2 · uc052-checkpoint-physical.proof.ts:7 · qbank-route-scope-cache:16 · qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc-e2e-014-026:19）**零涉本批 3 名**（亲证）。
- **本批新增判留（S1 同型 · 全部 ai-docs 面 = B2s 终批 grep 路径集外 · 当批补登）**：`ai-docs/architecture/backend/public-preview-write-inventory.json:375`（历史治理审计档案 · B2l governance-audit-index.json 同判）· `ai-docs/delivery/receipts/rcpt1-receipt-paths/correction-list.md:31/:48/:67`（E4 期历史收据档案表）· `ai-docs/delivery/harness/gap-scor-p0cb-inventory.md:63/:64/:65/:84`（历史 gap 盘点散文）· `ai-docs/delivery/harness/cmop03-weak-input-calib.md:12`（历史散文）——均非机械消费面，判留陈旧零改。
- **同名族零涉登记**：`packages/domain/src/scoring-{aggregation,evidence-conflict,fact-root}.ts`（domain 包自引 `./scoring-*.ts` 三式 + domain 桶 :196–:259）· `packages/domain/src/{scoring-honesty:10,scoring-operation-routing:45}.ts` import + `input-routing.ts:12/:17/:19` 注释（S1 型）——与 db 平铺 3 名同名族不同路径域，零改；runner 数组内 `packages/domain/src/scoring-*.ts` 10 串 ③ 类零改亲证。
- `packages/domain/src/` 整包零涉本批 3 名 **db 路径形态**（grep 亲证 0 命中）；apps/worker r4-funnel、conn-stack、qdrant-store、e2e 面零命中（§1 ④）。

## 5. 收口判定

**B2m 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 4 门 + parity base 红同形逐字节 · tsc 三包 sha 批后≡批前首版即过无补齐轮 · 16 行对白名单 payload 映射 0 违例 · 全仓 3 名旧路径残留全部 ai-docs 判留登记 · receipt 6/6 产出 ENOENT=0 + sourceDigests 新路径零 stale）· 1 commit 1 收据（首版 `37cdb726` → 收据再 amend = 终版）· §5 B2m 行外部串=无 + manifest glob 零涉 = ④ 实面 0 处 ✓ 亲证 · §5 靶列 9 串 1:1 零差异 · 漂移五支线 + main 零前进与本批全编辑面零修改交集（trial-grant index.ts 插入面 = 本批 specifier 行为漂移侧上下文行；三支线 runner 新增含旧 scoring 串行 = merge-time ③ 类再改披露登记）· S1 新增 ai-docs 面判留登记 · 批内零瞬态容器 · 蓝本 §5 B2m 行状态由本收据承载推进（蓝本原文零改写）。**

---

*DIR-1 B2 · B2m/19 · 2026-10-10 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
