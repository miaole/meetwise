# B2f 批收据 — DIR-1 B2 domain 目录拆解刀（第 6/19 批）

**Batch**: B2f（§5 表 B2f 行：routing/ 域 3 文件 · 含 rev3 R2 补列面 `r4-funnel-covered-count-batch4.ts:114`）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-09）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md` @ `1f08942a`（rev3 · pre_exec_dual BOTH PASS · 协调方 EXEC 授权面内机械执行）
**Base tip**: 本批开席 `aba8ac2e`（B2e 批后 tip）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批 B2a @ `196c8984` · B2b @ `d41b7c41` · B2c @ `442b1af6` · B2d @ `bd426386` · B2e @ `aba8ac2e`）
**Commit**: 本批一 commit（author `mw-dirb2-b2f` · 见交付报告 hash）· releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：`git fetch origin line/dir-b2-domain` 后 HEAD 与 `origin/line/dir-b2-domain` **零分叉（0/0 · 双侧 tip `aba8ac2e`）· 开席工作树干净**；SOP 沿 B2a–B2e；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH/TOKSTREAM/隐私主线/r4 面零触，本批改动面见 §1）。
- **lockfile 口径澄清（协调方预警面）**：受杆令预警「主 lockfile 已变（主线 DEPS S1 升级 + LINT S0）」——本支线亲证：`git log e2834082..HEAD -- pnpm-lock.yaml` = **0 commit**（本支线自 base 起零触碰，主线演进未并入本线）；G0「lockfile 零改」按协调方勘定口径 = **本批零改**（staged + worktree 双向 `git diff --quiet` PASS）；tsc 批前基线 sha 与 B2a–B2e 五批连续基线**逐字节相同**（§2 G2 行）= 环境无位移机械反证。
- **漂移预检（fresh 亲跑）**：
  - own-line 触史：三 routing 文件自 base **零 commit 触史**（未移动过）；本批其余面（manifest · r2 面）触史 = **仅本线自身白名单 commit**（B2b `d41b7c41` manifest · B2c `442b1af6` manifest+r2 四文件 · B2e `aba8ac2e` manifest，`git log` 亲证）——零外来漂移。
  - 漂移支线 `origin/feat/mysql-schema-skeleton` @ `afefa60e`（B2b 起各批预警面复跑）：与本批面交集 = `packages/db/src/index.ts`（drift 侧 hunk `@@ -367,6 +367,21 @@` 增 15 行 export 面）与 `scripts/run-e2e-isolated.mjs`（drift 侧 hunks `:437`/`:448` 块内他靶 receipt 登记 + `:1714`/`:2473` 块外）——**与本批 ② 面（index.ts :394–:495 六 specifier 行）及 ③ 面（runner :999–:1631）零同行级交集**；drift 侧 `recruiter.ts`（尚平铺位）hunk `@@ -382,8 +382,31 @@` 与本批 ① 补改点 `:8` 零交集（drift 侧 import 仍 `'./job-route-decision.ts'` 平铺形式，合并期改写属他批面不入本批）。**零交集 → 不停手照常执行，本节登记。**

## 1. 批内文件清单与 mv 证据（§5 B2f 行：candidate-route(134行) · free-text-route-decision(264行) · job-route-decision(404行)）

| # | 移动 | 证据（`git diff --cached -M`） |
|---|------|-------------------------------|
| 1 | `packages/db/src/candidate-route.ts` → `packages/db/src/routing/candidate-route.ts` | `R096`（similarity 96%）= R100 + **①类 3 行**（:18 `'./ids.ts'`→`'../ids.ts'` 锚 · :24 `'./tenant/index.ts'`→`'../tenant/index.ts'` · :25 `'./resume/resume.ts'`→`'../resume/resume.ts'` B2c 已移域；**:26 `'./job-route-decision.ts'` 同域不变**；blob 直比仅此三行 · 引号外逐字节含行尾注释同) |
| 2 | `packages/db/src/free-text-route-decision.ts` → `packages/db/src/routing/free-text-route-decision.ts` | `R099` = R100 + **①类 2 行**（:31 ids 锚 · :33 principal 锚） |
| 3 | `packages/db/src/job-route-decision.ts` → `packages/db/src/routing/job-route-decision.ts` | `R099` = R100 + **①类 2 行**（:20 ids 锚 · :22 principal 锚） |

**白名单随批改（B2f 实面 · §3 四类对账 · staged 面 = 3 mv + 15 文件 = 18 条目 · 38 内容行对，零第八方）**：

- **① 包内 import（10 行 = 移动件自引 7 + 消费件 3）**：自引 7 见上表；消费件 3 = `qbank-miss.ts:35`、`qbank-track-local-retrieval.ts:38`（两者 `'./job-route-decision.ts'`→`'./routing/job-route-decision.ts'`，均 B2s 后段件·二段 churn 预期形）+ **`recruiting/recruiter.ts:8`**（`'../job-route-decision.ts'`→`'../routing/job-route-decision.ts'`——B2c 已移件指本批移动件的跨域二段边，**由 G2 批后首跑 sha 位移捕获、当批 ①类补齐**，登记见 §2 G2 行；蓝本 §4「先移方 `../x.ts`、后移方再改」正型非批外面）。`ids.ts`/`principal.ts`/`tenant/` 锚本体零触（仅指锚 specifier 改前缀）。
- **② 桶 re-export（6 行）**：`index.ts` :394/:398（job-route-decision 值+型两块）· :405/:406（candidate-route 对）· :491/:495（free-text 对）specifier 加 `routing/` 前缀；tenant 2 行与全部导出名零改（`barrelTenantReexports===2` 断言面零触亲证）。
- **③ runner receipt（11 串/10 行 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改）**：`'packages/db/src/job-route-decision.ts'`×7 + `'packages/db/src/candidate-route.ts'`×2 + `'packages/db/src/free-text-route-decision.ts'`×2 → 加 `routing/` 前缀（:1023 双串行）；`git diff -U0` 亲证 10 hunk 行号 :999/:1023/:1025/:1431/:1449/:1525/:1545/:1571/:1586/:1631 全在块内；**靶映射 9 靶与 §5 B2f 行逐靶吻合**（candidate-route → tenant-wiring-neg · db-id-v7；free-text → db-id-v7 · rag07-free-text-route；job-route-decision → db-id-v7 · rag03-route · rag04-track-local · rag05-qbank-miss · nhp-r4-adv-covered · r4-wrong-track-adv-live-pg · r4-wrong-track-prod-surface）；`node --check` PASS；改后 `grep -E "packages/db/src/(candidate-route|free-text-route-decision|job-route-decision)\.ts['\"]" runner` = **0 命中**。
- **④ 仓内机械串（12 行）＝ §5 B2f 行外部串列逐点 1:1**：
  - `tenant-wiring.manifest.ts` :170 + :239 WIRED `file:` 实值（两处均 candidate-route · replace_all 同串）→ `routing/` 前缀；**:245 RESIDUAL_PATHS brace-glob 保序逐元素**加前缀（`commerce/commerce,job-route-decision,free-text-route-decision,`→`commerce/commerce,routing/job-route-decision,routing/free-text-route-decision,`——candidate-route 为 WIRED 面不在 glob · :251 glob 零涉本批）；
  - `scripts/conn-stack/mysql-stack.m4-rag.skeleton.proof.mjs:21`（`join(root, 'packages/db/src/job-route-decision.ts')`→`routing/`；:45/:97/:99 裸名对与散文走 :21 变量零触）；
  - `apps/worker/src/r4-funnel-covered-count-batch1.ts:97`（`readPkg` job-route-decision）· **`batch4.ts:114`（`readRepo` free-text-route-decision · rev3 R2 补列点收口）**；
  - worker r2 六处（`r2-classify-job-route-prereq:32` · `r2-p-fake:36` · `r2-p-live:32` · `r2-p-loop:27` · `r2-p-start:26` · `r2-p-worker:31`——**六行号与蓝图逐点同号**，各文件恰一行 `routePath` join 串；r2-p-worker:32 gateway-dispatch 属 B2h 零触）。
- **引号外零改亲证**：18 条目 ×38 行对逐行 quote-stripped 逐字节比对 = **0 违例**（python 逐行对脚本亲跑 · 全文件行数零变）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：全程 `git grep`（不用裸 rg；NUL 字节两文件 `qbank-generation-projection.ts`/`qbank-provider-input.ts` 属 B2r 批本批零触）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：node_modules 在树 · `meetwise-postgres-dev` Up 5h+ healthy · `.env` ABSENT 盘上亲证 · 每次 prove/runner/tsc 调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL`。批前基线于净树 @ `aba8ac2e` fresh 亲跑。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R096/R099/R099 rename 检出 · blob 直比 Δ=3/2/2（全 ①类）· **38 行对 quote-stripped 逐字节相同 0 违例** · `node --check` PASS · runner 残留 grep=0 · 10 hunk 全在 :93–:1640 · 全仓旧路径串仅剩判留（§5）· lockfile 双向零改 | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 同形：挥发面（loop 目录名/时间戳/uuid/pid receipt 串）规范化后逐字节相同 |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：输出逐字节相同**（e2e_parity_inventory invalid · e2e/ 树零触） |
| G2 | tsc `packages/db` | EXIT=2 · sha256=`f7c970b0…deeb9b`（≡ B2a–B2e 五批连续基线） | 首跑 EXIT=2 sha **位移**（+1 行 `recruiter.ts(8,89) TS2307 Cannot find module '../job-route-decision.ts'`）→ **①类补改 recruiter.ts:8 后二跑 EXIT=2 · sha 逐字节回归基线** | **六批连续（B2a–B2f）**；首跑位移 = 白名单漏面的门检检出（非 base 红·非回归），当批补齐亲证于对表左栏 |
| G2 | tsc `apps/api` | EXIT=2 · sha256=`196049ec…1b4242`（五批连续） | 同 G2 首跑 +1 同行 → 补改后 sha 逐字节回归 | 六批连续 |
| G2 | tsc `apps/worker` | EXIT=2 · sha256=`6dae8b2d…b32830`（五批连续） | 同 G2 首跑 +1 同行 → 补改后 sha 逐字节回归 | 六批连续 |
| G3 | `prove:rag03-route`（直跑键 · 经唯一合法隔离入口 runner `rag03-route:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿**：规范化（容器名/端口/时间戳/uuid/pid）后 PASS 序列逐行相同（87 行序） |
| G3 | `prove:rag07-free-text-route`（直跑键 · runner `rag07-free-text-route:prove:raw`） | EXIT=0 | EXIT=0 | 绿保持绿：规范化同形（68 行序） |
| G3 | `prove:db-id-v7`（直跑键 · runner `db-id-v7:prove:raw`） | EXIT=0 | EXIT=0 | 绿保持绿：规范化同形（66 行序；本靶 sources 含本批全部三名 = ③ 改写面全覆盖靶） |
| G3 | `prove:tenant-wiring-e5`（直跑键 · 裸直跑合法：manifest 静态面 · B2b 同判） | EXIT=0 | EXIT=0 | 同形：raw diff 仅 manifest `file:` 实值回显 2 行（`packages/db/src/candidate-route.ts`→`…/routing/candidate-route.ts`，全 PASS · **`exact count=3` 在新路径复得——④ 类改写正确性机械证据**） |
| G3 | receipt ENOENT 观察 | runner 三靶 `LOCAL_ISOLATED_PROOF_RECEIPT` 各产出 1 只（pre `…T16-51-05…`/`…16-51-12…`/`…16-51-22…`） | 各产出 1 只（post `…T16-57-37…`/`…16-57-44…`/`…16-57-53…`） | **ENOENT=0 双向成立（6/6 产出正常 · release_evidence=false 标注一致）；post 3 只 sourceDigests 亲证解析新路径**：rag03→`packages/db/src/routing/job-route-decision.ts` · rag07→`…/routing/free-text-route-decision.ts` · db-id-v7→**三 routing 新路径全数**（stale old-path keys = NONE）——③ 类改写正确性机械证据 · E4 反面教训闭环 |

**attempts 全账（Ban retry-to-green）**：G3 四键批前批后各一轮、逐键一次完成（runner 3 靶 ×2 + 裸跑 1 键 ×2 = 8 次计入对表，非重试）；G2 批前 1 轮 + 批后首跑（sha 位移→捕获 ① 漏面）+ 补改后二跑 = 3 轮，**补改属白名单面收口非追绿重试**（红不存在——首跑新增行系本批移动的机械后果，B2e「中断漏面本席补齐」同型登记）。

## 3. Base 漂移处置结果

见 §0：漂移支线 @ `afefa60e` 与本批面零行级交集（index.ts :367-hunk / runner :437+:1714-hunks / recruiter :382-hunk 均错位）；own-line 零外来触史 → 未触发停手红线。

## 4. 停止条件核查（沿 B2a–B2e）

| 条件 | 核查 | 结果 |
|------|------|------|
| a) 落位与 §2 映射冲突 | §2 routing/：candidate-route · free-text-route-decision · job-route-decision 三件 → `routing/<名>.ts` 实落 | 未命中 |
| b) 门红非预登记 base 红族 | 红（parity · tsc×3 EXIT=2）均为批前实测原值且批后同形（parity/tsc 终态逐字节同基线）；G2 首跑 +1 行系本批移动机械后果当批收口非 base 红 | 未命中 |
| c) 需触批外文件 | 改动面 = 3 mv + 15 文件白名单行（recruiter.ts:8 属 §1.2 M3 ①类「消费件指移动件」面 + §4 跨域二段改写预告正型 · 非批外越界）；staged 面亲证 18 条目无第八方 | 未命中 |
| d) 漂移预检红线 | §0 零行级交集 | 未命中 |
| e) 环境 ANY 串改逻辑 | 全部改动 = mv + 引号串内路径前缀（38 行对 quote-stripped 逐字节亲证 + mv blob 直比 Δ=3/2/2 全 ①类） | 未命中 |

## 5. Ban 纪律登记

- **Ban 7**：`.env` ABSENT（盘上亲证）· MODEL_API_KEY/MODEL_BASE_URL 每次 prove/runner/tsc 调用均 `env -u` 剥离 · Key name-only 零打印零落盘 · **est 0 live 模型调用**。
- **Ban 2 锚区**：7 锚 + tenant/ 零触（index.ts 仅 6 specifier 行 · 移动件/消费件仅指锚 import 前缀改 · ids.ts/principal.ts/errors.ts/migrate*.ts/isolated-test-target.ts/tenant/ 本体零触）· **migrations/** 零触**（0104/0114 两处散文串判留见下）** · e2e/ 树零触 · G7 面零触（runner 数组内 db 串除外）。
- **Ban 3**：runner 仅 isolatedReceiptSources 块内 11 串/10 行改写（10 hunk 行号 :999–:1631 全在 :93–:1640 · `git diff -U0` 亲证）；target 名/数组结构/命令 map/块外零改。
- **Ban 6**：零 shim/转发层。
- **Ban 10 S1 判留八处复述登记**（本批零新增位置位移——routing 三件不在八处清单；本批**新增判留登记三组**）：
  1. `packages/db/src/int-transcript.ts:7`（已随 B2d 位移 `transcript/int-transcript.ts:7` · 承 B2d/B2e）
  2. `packages/db/test/db-acl.proof.ts:267` · 3. `:490`
  4. `packages/db/test/qbank-source.proof.ts:2`
  5. `packages/domain/src/qbank-route-scope-cache.ts:16`
  6. `packages/domain/src/qbank-track-local-retrieval.ts:13`
  7. `packages/qdrant-store/src/product-vectorstore-bridge.ts:5/:9`
  8. `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts:19` 头注 ·（八处清单外复述：`uc-e2e-011-{adv-refund-callback:15,refund-callback-adv:24}` 头注 · 承 B2e）
  - **新增判留一组（migrations 散文 · Ban 区零触）**：`packages/db/migrations/0104_job_route_decision.sql:34`（注释散文提 `packages/db/src/job-route-decision.ts`）· `packages/db/migrations/0114_free_text_route_scope.sql:26`（注释散文提 `packages/db/src/free-text-route-decision.ts`）——S1 同型散文非 import 非机械串，migrations 硬 Ban 区零触，由本收据承载登记（B2e 0018/0145 同判；B2s 终批收口时按 §3 豁免集口径对表）。
  - **新增判留二组（锚内注释 · 锚 Ban 区零触）**：`packages/db/src/ids.ts:27/:28/:31` 三行行尾注释提三件裸名（`// job_route_decision（job-route-decision.ts）` 等）——ids.ts 根锚硬 Ban 零触，注释散文非 import 非机械串。
  - **新增判留三组（UI spec 注释散文）**：`apps/web/e2e-ui/recruiting-bound.spec.ts:80` 注释提 `job-route-decision.ts:15` 裸名——非全路径串非机械面（终批 §3 grep 路径集以 `packages/db/src/` 全路径为靶，裸名不入），零触登记。
  - **裸名对零触说明**：r2 六 proof 与 m4-rag 内 `['job-route-decision.ts', routePath]` 形态 = basename→全路径变量对（文件名不变仅目录前缀变），routePath 变量已改，裸名对零触为正确处置（非漏改）。
- **binary-aware erratum 逐批登记**（蓝本非阻塞披露）：`qbank-generation-projection.ts` 与 `qbank-provider-input.ts` 含 NUL 字节（B2r 批文件）——本批残留/消费面抽查全部走 `git grep`（binary-aware），未用裸 rg。
- **消费面复盘（零涉登记）**：apps/api 零 classify（M4 ③ 面 grep 亲证零命中）；qdrant-store/domain/packages/db/test 对三件零路径串命中（`git grep` 亲证 · db test 无 `../src/<三名>` 直引 = M3 六文件清单外零涉吻合）；ai-docs 历史文档旧路径串不在 §3 终批 grep 路径集（docs 判留 · 含 rcpt1 correction-list 历史证据文件零触）；manifest `paths:`/`reason:` 描述散文零触（B2b/B2c/B2e 同判非机械面）。
- **Pins 十一值照抄零翻转**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Stack=**PG-retained** · 公开 DELETE=**503**（stays） · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本批纯移动零模型调用零计费面）。**Ban 关债叙事**：r4-funnel/r2/m4-rag 串改 ≠ 关闭任何 r4/R4/FUNNEL/G-R4-5 backlog 行。

## 6. 环境与收尾观察

- runner 一次性容器批前批后各 3 只均被 finally `docker rm -f` 正常回收；`docker ps -a` 无本批新增残留（现存旧容器 `meetwise-e2e-62497-cold2-stop-band-1-…` Exited(0) 沿 B2b/B2d/B2e 登记不予处置）。
- receipt 靶观察面（§5 B2f 行 candidate 2 靶 + free-text 2 靶 + job-route-decision 7 靶 = 11 靶中 4 靶 = rag03-route · rag07-free-text-route · db-id-v7（覆盖三名）· tenant-wiring-e5（裸跑）经本批复跑覆盖，sources 已解析新路径且 receipt 产出正常 ENOENT=0；其余靶（tenant-wiring-neg 红候选等）批内必跑集合=∅（R5 口径），由 post 双审指令 + B2s 终批 117 靶 sweep 兜底）。
- G4：commit 后 `git status` 0 entries · push origin line/dir-b2-domain（交付报告承载）。

**B2f 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 · 红同形红 · tsc sha 六批连续 · receipt ENOENT=0 ×6 · sourceDigests 三新路由路径亲证）· 1 commit 1 收据 · §5 B2f 行外部串 12 点 1:1 收口（含 rev3 R2 补列 batch4:114）· recruiter.ts:8 ①类二段边当批收口 · 蓝本 §5 B2f 行状态由本收据承载推进（蓝本原文零改写）。**
