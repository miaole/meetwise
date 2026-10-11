# B2p 批收据 — DIR-1 B2 domain 目录拆解刀（第 16/19 批）

**Batch**: B2p（§5 表 B2p 行：memory/ 前段 5 文件）· **EXEC**: DIR-B2 域 B2p 批 EXEC 席（pure-mv 机械执行）
**Date**: 2026-10-10（worktree 时钟）· **Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席 `git fetch origin` → `origin/line/dir-b2-domain` tip `a18a1dd3`（= B2o 批后终版 · **零前进**）· 工作树干净 · **首版 commit `696f8b68`**（mv+白名单首版即全绿 · 无 ① 补齐轮）→ **收据经再 amend 折入**（C-UNCOMMITTED 净树门时序强制 · 同 B2g–B2o 先例 · 终版 hash 见交付报告 = 首版 + 本收据 docs-only）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g `cc76a554` · B2h `5bd79258` · B2i `40dc4551` · B2j `4a8b47b5` · B2k `3003665e` · B2l `ce050e1e` · B2m `6027ff49` · B2n `dee8bc4e` · B2o `a18a1dd3`）
**Commit author**: `dirb2-b2p <exec@meetwise.local>`（协调方本批指令指定 · 与 B2m/n/o 先例 `mw-dirb2-b2x` 命名异形 · 逐字节照指令执行并于此披露）· releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：开席 fetch → 本支线 tip `a18a1dd3` 零前进 · 工作树干净；SOP 沿 B2a–B2o 十六先例；W 线冻结序 + loop §3 冲突表零命中（本批 apps 触面仅 `apps/worker/src/r4-funnel-covered-count-batch2.ts:179` ④ 类串 · Ban 2 明文例外面；零逻辑触 apps src）。
- **主线漂移（亲跑）**：`git fetch origin main` → tip `c4244470`（与 B2o 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体`。
- **环境在飞面**：node_modules 在树 · `.env` ABSENT 盘上亲证 · ambient env 零 MODEL 键（每次调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 亲包）· `meetwise-postgres-dev`（healthy）Up（G3 隔离跑 PG 面用）· 批内两查 docker 面零 `meetwise-e2e-*` 瞬态/残留（`docker ps -a` 全列亲证仅 postgres-dev 一件）。
- **lockfile 口径**：B2a–B2o 全批链 `pnpm-lock.yaml` 零改；本批 staged + worktree 双向 `git diff --quiet pnpm-lock.yaml` PASS；tsc 三包批后输出与批前逐字节相同 = 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2p 行：memory-admission(123行) · memory-control-surface(348行) · memory-fact-adjudication(146行) · memory-governance(237行) · memory-index-generation(282行)）

| # | 移动 | 证据（`git diff --cached -M --name-status` @首版 `696f8b68`） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/memory-admission.ts` → `packages/db/src/memory/memory-admission.ts` | `R099` = R100 + **①类 1 行**（:1 `./principal.ts`→`../principal.ts` 锚向 · 域内零互引 · 123 行零变） |
| 2 | `packages/db/src/memory-control-surface.ts` → `packages/db/src/memory/memory-control-surface.ts` | `R099`（:1 锚向 · 348 行零变） |
| 3 | `packages/db/src/memory-fact-adjudication.ts` → `packages/db/src/memory/memory-fact-adjudication.ts` | `R099`（:1 锚向 · 146 行零变） |
| 4 | `packages/db/src/memory-governance.ts` → `packages/db/src/memory/memory-governance.ts` | `R099`（:1 锚向 · 237 行零变） |
| 5 | `packages/db/src/memory-index-generation.ts` → `packages/db/src/memory/memory-index-generation.ts` | `R099`（:1 锚向 · 282 行零变） |

**盘点口径**：五文件名全仓 any-form sweep（rg -l）——消费件 = db src（index.ts 桶 10 行 ②）+ runner ③ 类 15 串 + worker `r4-funnel-covered-count-batch2.ts:179` ④ 类 1 串；**包内 src 零消费件**（五件互引亲证 = 0 · 各自唯一相对 import 为 principal 锚；`memory-two-stage-recall.ts` 对五件 import = 0 亲证——B2p 行「two-stage-recall 互串」实为 runner 数组串面即 ③ 类，非 import）；db test 七 memory proof 全桶引（`../src/memory-*` 直引 grep = 0 亲证）零 ① test 改。apps/api、qdrant-store、conn-stack、tenant-wiring manifest 零命中；`apps/api/test/uc-e2e-040-043-batch-qbank-seat.proof.mjs:108` 的 `memory-control-surface` 串为 `packages/domain/src/` 面（domain 包同名件 · 非 db 移动件 · 零改亲证）；`scripts/mem00-int00-*` 两文件仅裸 target 名（`memory-governance:prove` 等 · 非路径串 · 零改）；migrations 0093/0107/0095/0099/0102/0105 为 SQL 名碰撞（零触 · migrations Ban 面）。

**白名单随批改（B2p 实面 · §3 四类对账 · staged 面 = 5 rename + 3 modified = 8 条目 · numstat +28/−28 · 零第八方）**：

- **① 包内 import（5 行 = 移动件自引 5 改 + 消费件 0）**：五件各 :1 `from './principal.ts'`→`from '../principal.ts'`（锚向）；五件互引 0 行（各件余下 import 全为 `@meetwise/contracts` 包引 · 零相对）；无已移跨域边。
- **② 桶 re-export（10 行）**：`index.ts` :244/:249/:252/:253（governance·admission）/ :260/:264（fact-adjudication）/ :273/:277（index-generation）/ :429/:435（control-surface）specifier 加 `memory/` 前缀；全部导出名零改；**B2q 同前缀名 specifier 零触亲证**（memory-store :235/:236 · memory-two-stage-recall :284/:287 · memory-summary :475/:480 · memory-summary-tree :513/:517 · memory-vector-chunk-erasure :545/:549）。
- **③ runner receipt（15 串/12 行/3 hunks · 块内亲证 · 块外零改）**：governance ×2（:1106 同名靶 + :1278 `memory-vector-chunk-erasure` 靶）+ admission ×5（:1121 同名靶 + :1132 fact-adjudication 靶 + :1143 index-generation 靶 + :1158 two-stage 靶 + :1174 control-surface 靶）+ fact-adjudication ×4（:1131 同名靶 + :1143 + :1157 + :1173 交叉靶）+ index-generation ×3（:1142 同名靶 + :1157 + :1173）+ control-surface ×1（:1172 同名靶）→ 各加 `memory/` 前缀；`node --check` PASS；**§5 B2p 行靶列明文的 two-stage-recall「下批文件串在本批数组亦出现」①处 + 同型未点名 ① 处 = `memory-vector-chunk-erasure:prove:raw` 数组含 `memory-governance.ts` 串（:1278）**——§3 ③ 规则为「每移动名」全块改写（B2n 12 靶同判），两处均随批改讫，后者于此显式披露为蓝本行未点名的 ③ 规则内实例；改后旧形态残留 grep = 0 命中。
- **④ 仓内机械串（1 行）**：`apps/worker/src/r4-funnel-covered-count-batch2.ts:179` `readRepo('packages/db/src/memory-index-generation.ts')`→`memory/memory-index-generation.ts`（readRepo 机械消费 · = §5 B2p 行外部串对账 ✓）；manifest ④ 面零涉亲证（RESIDUAL_PATHS :245/:251 两 glob 五名specific零命中 · :251 `memory-*` 通配元仍匹配 B2q 五根留件 = 零 silent absence · 通配元处置沿 B2n 先例 `int-transcript*` 判例留待 B2q 批收口 · tenant-wiring-e5 proof 仅断言 `RESIDUAL_PATHS.length > 0` 无 glob 文件系统展开亲证）。
- **引号外零改亲证**：28 行对逐行剥引号串后逐字节比对 = **0 违例**（node 配对脚本亲跑 · 移动件 5 对 + 桶 10 对 + runner 12 对 + worker 1 对）；全文件行数零变（123/348/146/237/282 + 桶/runner/worker 仅行内替换）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：本批全部 8 编辑面文件 node 字节级 NUL 检查 clean（`buf.indexOf(0)` 亲跑 8/8；本批五名非 NUL 件——披露条目所指 qbank-generation-projection/qbank-provider-input 为 B2r 面）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

批前基线于净树（HEAD `a18a1dd3`）fresh 亲跑，先基线后动手，无 stash 环节。批后轮于首版 commit `696f8b68` 树执行（内容 ≡ 首版 commit 树；C-UNCOMMITTED 时序同先例）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R099×5 rename 检出 · 28 行对 quote-stripped 逐字节相同 **0 违例** · `node --check` PASS · 旧路径串残留 = 0（runner + 全仓 apps/packages/scripts/e2e 双 grep 亲证）· lockfile 双向零改 · 8 文件 NUL clean | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过（**规范化同形**：diff 仅 loop 目录后缀 `FFIHdn→m1wrP4`/时戳挥发面 · B2f/B2l/B2m/B2n/B2o 同判） |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post 输出逐字节相同**（`cmp` 空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | EXIT=2 · **sha 同基线** | **逐字节相同** |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | EXIT=2 · **sha 同基线** | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | EXIT=2 · **sha 同基线** | **逐字节相同**（三包 sha 与 B2o 批记录基线 **同值** · 本批基线双重自洽） |
| G3 | `prove:memory-admission`（经 runner `memory-admission:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:memory-fact-adjudication`（经 runner `memory-fact-adjudication:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:memory-index-generation`（经 runner `memory-index-generation:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:memory-control-surface`（经 runner `memory-control-surface:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:memory-governance`（经 runner `memory-governance:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | `prove:memory-two-stage-recall`（交叉键 · B2q 同名直跑键经 runner `memory-two-stage-recall:prove:raw` · 协调方指令批内加跑） | EXIT=0 | EXIT=0 | **绿保持绿** |
| G3 | receipt ENOENT 观察 | pre 六键各产出 1 只（`…T04-53…` 时段 6 只） | post 六键各产出 1 只（`…T04-56/04-57…` 时段 6 只） | **ENOENT=0 双向成立（12/12 产出 · outcome=passed · exitCode=0 · releaseEvidence=false 标注一致）；post 6 只亲证解析 14 处移动名引用全为 `packages/db/src/memory/memory-*.ts` 新形态 · 零 stale db 平铺旧形态**（two-stage receipt 内 `memory-two-stage-recall.ts` 根留引用为 B2q 非本批面）——③ 类改写正确性机械证据 · E4 反面教训闭环 |
| G4 | commit 后 `git status` | — | **0 entries**（首版后亲证）· docker 面仅环境件 `meetwise-postgres-dev Up healthy`（非本批产物）· 批内两查零 `meetwise-e2e-*` 容器瞬态/残留 | 干净 |

**attempts 全账（Ban retry-to-green）**：G3 六键 pre 6 + post 6 = 12 次（逐键单发）；G2 pre 3 + post 3 = 6 次（首版即 sha 同基线 · 无补齐轮）；G1 五门 pre 1 轮 + post 1 轮 = 10 次——**共 28 attempts** · 无 stash 伪红 attempt · 无 retry-to-green。

## 3. 靶对表（③ 类 15 串 → 7 唯一 runner 靶 · 与 §5 B2p 行 receipt 靶列对账）

| runner:line | target | 承载串（本批移动名） | R5 处置 |
|---|---|---|---|
| :1106 | `memory-governance:prove:raw` | **memory-governance** | 本批 G3 直跑键已跑（EXIT=0→0 · receipt 新路径亲证） |
| :1121 | `memory-admission:prove:raw` | **memory-admission** | 本批 G3 直跑键已跑（同上） |
| :1131/:1132 | `memory-fact-adjudication:prove:raw` | **memory-fact-adjudication** · memory-admission | 本批 G3 直跑键已跑（同上） |
| :1142/:1143 | `memory-index-generation:prove:raw` | **memory-index-generation** · memory-fact-adjudication · memory-admission | 本批 G3 直跑键已跑（同上） |
| :1156–:1158 | `memory-two-stage-recall:prove:raw` | memory-index-generation · memory-fact-adjudication · memory-admission（本件自身串 B2q 零改） | 交叉键已跑（协调方指令 · EXIT=0→0） |
| :1172–:1174 | `memory-control-surface:prove:raw` | **memory-control-surface** · memory-index-generation · memory-fact-adjudication · memory-admission | 本批 G3 直跑键已跑（同上） |
| :1278 | `memory-vector-chunk-erasure:prove:raw` | memory-governance（蓝本行未点名 · §3 ③ 每移动名规则内实例 · 显式披露） | ③ 改讫；该靶为 B2q 直跑键非本批键 · 批内未跑（R5 口径批内必跑集合=∅） |

**§5 B2p 行靶列对账**：各自同名靶 5 = admission/fact-adjudication/index-generation/control-surface/governance ✓ 全数批内跑讫；交叉 two-stage-recall ✓ 批内跑讫（协调方指令）；control-surface「admission/fact-adjudication/index-generation 串」✓ = :1173/:1174；index-generation 交叉 ✓ = :1143；two-stage「下批文件串在本批数组亦出现」✓ = :1157/:1158。§3 ③ 规则全集 15 串改讫零遗漏（含未点名 :1278 一处·已披露）。

## 4. S1 判留复述登记（Ban 10 · 本批新增登记）

- **S1 在册八处零涉本批五名**（int-transcript.ts:7 · db-acl:267/490 · qbank-source:2 · domain qbank-route-scope-cache:16 / qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc052-checkpoint-physical.proof:7 · uc-e2e-014-026:19 亲证五名零命中）。
- **本批新增判留（S1 同型 · 全部 ai-docs 历史档案面 = B2s 终批 grep 路径集外 · 当批补登）**：`ai-docs/delivery/receipts/rcpt1-receipt-paths/correction-list.md`（历史更正清单 5 行引及本批五名旧路径串 · append-only 不改）+ `ai-docs/delivery/receipts/dir-b2-domain/B2n/receipt.md`（历史收据引及 memory-governance runner 串旧形态·append-only 不改）+ 其余 ai-docs 文档面（architecture/requirements/register/checklist 等）裸名 prose 引用零 db 路径串亲证 · 不涉。其余全仓旧形态旧路径串 grep = 0（§1 ③ + 全仓 sweep）。
- `packages/db/src/` 平铺面五名旧文件 = 0 残留（git mv 后 `ls packages/db/src/memory-*.ts` 仅余 B2q 五件 = 正确形态）。

## 5. 收口判定

**B2p 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 6 键 + parity base 红同形逐字节 · tsc 三包 sha 批后≡批前且≡B2o 记录值 · 28 行对白名单 payload 映射 0 违例 · 旧路径串残留 0 · receipt 12/12 产出 ENOENT=0 + post 14 处移动名引用全新形态零 stale）· 1 commit 1 收据（首版 `696f8b68` → 收据再 amend = 终版）· §5 B2p 行外部串 r4-funnel-batch2:179 ④ 类改讫 ✓ · 靶列 7 靶（5 直跑 + 2 交叉）1:1 对账且直跑+协调方交叉键批内全数跑讫 · 漂移：main/支线零前进 · 批内零瞬态容器 · 蓝本 §5 B2p 行状态由本收据承载推进（蓝本原文零改写 · 同 B2a–B2o 十六批先例——协调方批令「行尾标注」与在册先例形式不符，沿先例收据承载制执行并于此披露）。**

---

*DIR-1 B2 · B2p/19 · 2026-10-10 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
