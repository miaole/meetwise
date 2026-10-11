# B2l 批收据 — DIR-1 B2 domain 目录拆解刀（第 12/19 批）

**Batch**: B2l（§5 表 B2l 行：interview/ 域 5 文件）· **EXEC**: mw-core（W6 DB 线）· **Date**: 2026-10-07（worktree 时钟 2026-10-10）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席 `git pull origin line/dir-b2-domain` → **Already up to date（双侧 tip `3003665e` = B2k 批后）· 工作树干净** · **首版 commit `974b6605`**（mv+白名单首版）→ **①补齐 amend `331d90e6`**（G2 首跑捕获 int-transcript:22 漏点当批折入——B2f 同型先例）→ **收据经再 amend 折入**（C-UNCOMMITTED 净树门时序强制，同 B2g/B2i/B2j/B2k 先例 · 终版 hash 见交付报告 = ①补齐版 + 本收据 docs-only）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g amend `cc76a554` · B2h `5bd79258` · B2i `40dc4551` · B2j `4a8b47b5` · B2k `3003665e`）
**Commit author**: `mw-dirb2-b2l` · releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：开席 pull → Already up to date（tip `3003665e`）· 工作树干净；SOP 沿 B2a–B2k 十二先例；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH 线碰 `apps/api/src/modules/interview/*`——B2 零触 apps src；本批改动面见 §1）。
- **主线漂移（亲跑）**：`git fetch origin main` → tip `c4244470`（与 B2j/B2k 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体`。
- **任务提示面支线亲核**：五支线 tip 与 B2k 批收据逐一同值零前进——`origin/line/unstub-erase` `03209663` · `origin/line/trial-grant` `3ef2403c` · `origin/line/b110-recruiter-gate` `ee02bf4d` · `origin/line/obs-ready` `3684bc00` · `origin/feat/mysql-schema-skeleton` `9a1fdc07`；drift 侧 B2 外新文件零新增（B2k 已登记的 resume-privacy.ts/scoring-wire.ts 仍在册，本批无第三件）。
- **漂移支线 vs 本批面行级交集（亲跑）**：unstub-erase/obs-ready/skeleton 三支线触 `apps/api/test/uc-e2e-001-nhp-adv.proof.ts`——其 hunks 全在 **:17/:46/:540** vs 本批 ④ 改点 **:74 → 零行级交集**；b110 触 runner hunks（**块内 :437 纯插入 ×10** · 块外 :1714/:2473）vs 本批 ③ 面 16 基点行（:100–:1584）**全未被漂移侧修改（纯前方插入平移）→ 零行级交集**；trial-grant 触 `packages/db/src/index.ts` hunk **:367** vs 本批 ② 面 :52–:134 → 零行级交集；trial-grant/b110 触 `apps/worker/src/{interview-consumer,adaptive-interview-service}.ts`（apps/worker/src = 本批零改面 · Ban 2 禁区零触）。**零交集 → 不停手照常执行。**
- **环境在飞面**：node_modules 在树 · `.env` ABSENT 盘上亲证 · ambient env 零 MODEL 键（每次调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 亲包）· `meetwise-postgres-dev`（54329）Up healthy（G3 隔离跑 PG 面用）；**瞬态容器披露**：db-money3 批前基线跑返回后 ~40s 观察到 `meetwise-e2e-59973` Up 6s 一次（非本席活跃进程 PID 面）→ 数秒后自行退出 · 复查树面 git status 仅本批 staged renames 零外来编辑 · 批后窗口零 `meetwise-e2e-*` 残留——判 runner 尾随清理面在案登记。
- **lockfile 口径**：`git log e2834082..HEAD -- pnpm-lock.yaml` = 0 commit；G0「lockfile 零改」= 本批零改（staged + worktree 双向 PASS 亲证）；tsc 批前三 sha 与批后（①补齐二跑）逐字节相同 = 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2l 行：interview-answer-dual-write(67行) · interview-event(43行) · interview-graph-lease(87行) · interview-jobs(265行) · interview-question(131行)）

| # | 移动 | 证据（`git diff --cached -M --name-status` @首版/amend 后同形） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/interview-answer-dual-write.ts` → `packages/db/src/interview/interview-answer-dual-write.ts` | `R098` = R100 + **①类 1 行**（:12 `import type { Client } from './principal.ts'`→`'../principal.ts'` 锚向；67 行零变 · 相似度 98%（短文件 1 行差）） |
| 2 | `packages/db/src/interview-event.ts` → `packages/db/src/interview/interview-event.ts` | `R098`（同上 · :12 · 43 行零变 · :13 同域 `./interview-answer-dual-write.ts` 不动亲证） |
| 3 | `packages/db/src/interview-graph-lease.ts` → `packages/db/src/interview/interview-graph-lease.ts` | `R098`（同上 · :8 `asPrincipal, type DbPool` 锚向 · 87 行零变） |
| 4 | `packages/db/src/interview-jobs.ts` → `packages/db/src/interview/interview-jobs.ts` | `R099`（:5 `./checkpoint/checkpoint-privacy.ts`→`../checkpoint/checkpoint-privacy.ts` 已移跨域前缀改写 · :8 同域不动 · 265 行零变） |
| 5 | `packages/db/src/interview-question.ts` → `packages/db/src/interview/interview-question.ts` | **`R100` 0/0 纯名移**（无任何相对 import——仅 node:crypto + pg · 131 行字节零变 · §1.1 inSRC 列 1=消费面非自引复核成立） |

**白名单随批改（B2l 实面 · §3 四类对账 · staged 面 = 5 rename + 7 modified = 12 条目 · 34 内容行对 · numstat +34/−34 · 零第八方）**：

- **① 包内 import（8 行 = 移动件自引 4 + 消费件 4）**：自引——dual-write:12/event:12/graph-lease:8 三处 `./principal.ts`→`../principal.ts` 锚向 + jobs:5 `./checkpoint/…`→`../checkpoint/…` 跨域（event:13/jobs:8 同域 `./interview-answer-dual-write.ts` 不动亲证）；消费件——`qbank-miss.ts:37/:38` `./interview-{question,event}.ts`→`./interview/interview-…`（**B2s 二段件** · 蓝图「qbank↔interview（miss→question/event）」跨域边落地）+ `db-money3.proof.ts:31` `../src/interview-event.ts`→`../src/interview/interview-event.ts`（**= §5 B2e 行注记「interview-event→B2l 二段」收口 ✓**）+ `transcript/int-transcript.ts:22` `../interview-answer-dual-write.ts`→`../interview/interview-answer-dual-write.ts`（**G2 批后首跑捕获的盘点漏点当批补齐**——§1.1 面盘点 `./x.ts`/`../src/x.ts` 两形态外的第三形态「已移件 `../x.ts` 跨域二段边」· B2f recruiter.ts:8 同型先例 · 蓝图 §4「transcript↔checkpoint/interview」已知跨域边 · 补齐后 G2 三包 sha 逐字节回归基线）。
- **② 桶 re-export（8 行）**：`index.ts` :52（event）· :115/:116（jobs）· :124（dual-write）· :126/:127（graph-lease）· :133/:134（question）specifier 加 `interview/` 前缀；tenant 2 行（:33/:34）零触亲证；全部导出名零改；**:51 注释行含旧路径串 `packages/db/src/interview-event.ts`——非 ② specifier（Ban 1 白名单外）→ S1 型判留当批补登（§4）**。
- **③ runner receipt（17 串/16 行/14 hunks · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改亲证）**：`'packages/db/src/interview-answer-dual-write.ts'` ×1（:1336）+ `'…/interview-event.ts'` ×4（:100/:1079/:1338/:1584）+ `'…/interview-graph-lease.ts'` ×1（:798）+ `'…/interview-jobs.ts'` ×8（:339/:429/:443/:451/:458/:499/:928/:1337）+ `'…/interview-question.ts'` ×3（:126/:137/:1584 双串行）→ 各加 `interview/` 前缀（**节点脚本引号锚定替换 1+4+1+8+3 = 17 恰对账**）；`git diff -U0` 亲证恰 14 hunk 全带 `const isolatedReceiptSources = {` 上下文头；`node --check` PASS；改后 `grep -nE "packages/db/src/(interview-answer-dual-write|interview-event|interview-graph-lease|interview-jobs|interview-question)\.ts['\"]" runner` = **0 命中**。
- **④ 仓内机械串（2 处）**：`apps/api/test/uc-e2e-001-nhp-adv.proof.ts:74` readFileSync 实值 `'packages/db/src/interview-question.ts'`→`'packages/db/src/interview/interview-question.ts'`（恰 §5 B2l 行外部串唯一改点 ✓ · :97 `'interview-question.ts:persistInterviewQuestion'` 为 ANCHOR 诊断 label 非路径解析 → 判留登记）；`tenant-wiring.manifest.ts:245` RESIDUAL_PATHS brace-glob 元素 `interview-jobs,interview-question`→`interview/interview-jobs,interview/interview-question`（保序逐元素前缀 · register 诚实律 B1 同判 · 改前后 glob 匹配文件集零漂移仅路径前缀诚实化；:246 散文 `interview-jobs.ts 20` 判留——B2e/B2f/B2h/B2k 四批同段散文均未触同判）；两文件不入 :245/:251 任何其他 glob 元素、不入 WIRED_FILES 六处 `file:` 实值（:147/:157/:170/:227/:233/:239 亲证零涉）。
- **引号外零改亲证**：34 行对逐行剥引号串后逐字节比对 + 引号 payload 差异白名单映射校验（① 三种前缀形态 `./→../`锚/`./→./interview/`/`../src→../src/interview/`/`../→../interview/` · ② `./<n>.ts`→`./interview/<n>.ts` · ③ `packages/db/src/<n>.ts`→`…/interview/<n>.ts` · ④ glob 元素前缀）= **0 违例**（node 有序配对脚本亲跑 `/tmp/b2l-quotecheck2.mjs` · 全行 5327/5327 配对 · changed_pairs=34 violations=0）；全文件行数零变（67/43/87/265/131 + index 568 + runner 2583 + manifest 256 + qbank-miss/int-transcript/db-money3.proof/uc-e2e-001-nhp-adv 各零行变）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：本批全部 12 编辑面文件 node 字节级 NUL 检查 clean（`buf.indexOf(0)` 亲跑；B2r 批两 NUL 件 `qbank-generation-projection.ts`/`qbank-provider-input.ts` 本批零触）；残留 grep 全程默认无碍。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

批前基线于净树（HEAD `3003665e`）fresh 亲跑，先基线后动手，无 stash 环节。批后轮于 ①补齐版 commit `331d90e6` 净树执行（C-UNCOMMITTED 时序同先例：post 轮均在折入前树上跑，其树内容≡终树除本收据）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R100×1（question 0/0 纯名移）+ R099×1（jobs）+ R098×3 rename 检出 · 34 行对 quote-stripped 逐字节相同 **0 违例**（白名单 payload 映射 34/34 · 有序配对 5327/5327）· `node --check` PASS · runner 残留 grep=0 · 14 hunk 全在 :93–:1640 全带上下文头 · **全仓旧路径串残留 = 2 行均为判留登记**（index.ts:51 S1 型 + ai-docs 档案 JSON · §4）· lockfile 双向零改 · 12 文件 NUL clean · tenant 2 行零触 | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过（**规范化同形**：diff 仅 receipt 路径时间戳/PID/uuid/loop 目录后缀挥发面 · B2f 同判） |
| G1 | `e2e-static-guards:check` | EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6） | EXIT=0 | 过（逐字节相同） |
| G1 | `e2e-static-guards:prove` | EXIT=0（selected=30/30） | EXIT=0 | 过（逐字节相同） |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post 输出逐字节相同**（`diff` 空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | 首跑 EXIT=2 **+1 行** `transcript/int-transcript.ts(22,93) TS2307` → ①补齐后二跑 EXIT=2 · **sha 同基线** | **补齐后逐字节相同**（cmp 亲证） |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | 同上形态 → **sha 同基线** | **补齐后逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | 同上形态 → **sha 同基线** | **补齐后逐字节相同** |
| G3 | `prove:uc002-lease`（直跑键 · 经唯一合法隔离入口 runner `uc002:lease:prove:raw`） | EXIT=0（PASS=11） | EXIT=0（PASS=11） | **绿保持绿**：规范化 PASS 序列逐行相同（13 行序） |
| G3 | `prove:int-answer-dual-write-fence`（直跑键 · 经 runner `int-answer-dual-write-fence:prove:raw`） | EXIT=0（PASS=35） | EXIT=0（PASS=35） | **绿保持绿**：规范化序列逐行相同（36 行序） |
| G3 | `prove:db-money3`（interview-event 面·二段 · 经 runner `db-money3:prove:raw`） | **EXIT=1（批前实测 base 红 · 原值登记）** | **EXIT=1** | **同形红**：规范化 PASS/FAIL 序列逐行相同（38 行序）——FAIL 面 = P3-2/P3-4（22003 落点链/兜底闭环）· P5-1（fixture uq_event_key drift）· P6-1/P6-3（语句白名单/零 ALTER TYPE）＝**B2e 批已登记同族 base 红**（sql fixture/约束族，与 interview 路径面零关）· §0.1-3 红原值不洗 |
| G3 | receipt ENOENT 观察 | pre 三靶各产出 1 只（`…T03-12-04…`/`…03-12-17…`/`…03-12-28…`） | post 三靶各产出 1 只（`…T03-20-49…`/`…03-20-56…`/`…03-21-02…`） | **ENOENT=0 双向成立（6/6 产出正常 · release_evidence=false 标注一致）；post 3 只 sourceDigests 亲证解析新路径**——`interview/interview-graph-lease.ts`（uc002:lease）· `interview/{interview-answer-dual-write,interview-event,interview-jobs}.ts`（fence）· `interview/interview-event.ts`（db-money3）· **零 stale 旧路径**——③ 类改写正确性机械证据 · E4 反面教训闭环 |
| G4 | commit 后 `git status` | — | **0 entries**（①补齐版后亲证）· docker 面仅环境件 `meetwise-postgres-dev Up healthy`（非本批产物）· 本批 G3 三靶跑毕零 `meetwise-e2e-*` 容器残留（§0 瞬态 59973 披露在案） | 干净 |

**attempts 全账（Ban retry-to-green）**：G3 直跑键 pre 3 + post 3 = 6 次（逐键单发）；G2 pre 3 + post 首跑 3（捕获漏点·红→红非洗绿）+ ①补齐后二跑 3 = 9 次；G1 五门 ×2 = 10 次——**共 25 attempts**（G2 中轮为 B2f 同型「首跑捕获当批①类补齐」非重试）· 无 stash 伪红 attempt。

## 3. 靶对表（③ 类 17 串 → 14 唯一 runner 靶 · 与 §5 B2l 行 receipt 靶列对账）

| runner:line | target | 承载串（本批移动名） | R5 处置 |
|---|---|---|---|
| :100 | `tokenstream:prove:raw` | interview-event | 批内 0 跑（**含 live 面判读**：runner 白名单 `targets-domain-prove` 面 · TOKSTREAM 线 receipt 数组 db 串属 ③ 类授权面非 live 模型调用——本批仅串改未跑 · post 双审/B2s sweep 时按 E5 基红律处置） |
| :126 | `uc001:nhp-adv:prove:raw` | interview-question | 批内 0 跑（post 双审/B2s sweep） |
| :137 | `uc001:nhp-fault:prove:raw` | interview-question | 同上 |
| :339 | `privacy-erasure:prove:raw` | interview-jobs | 同上 |
| :429 | `resume-reference:http:prove:raw` | interview-jobs | 同上 |
| :443 | `reqid:prove:raw` | interview-jobs | 同上 |
| :451 | `interview:prove:raw` | interview-jobs | 同上 |
| :458 | `stress:prove:raw` | interview-jobs | 同上 |
| :499 | `reaper:prove:raw` | interview-jobs | 同上 |
| :798 | `uc002:lease:prove:raw` | **interview-graph-lease** | **本批 G3 直跑键已跑**（EXIT=0→0 同形 · receipt 新路径亲证） |
| :928 | `adaptive-consumer:prove:raw` | interview-jobs | 批内 0 跑（**红候选**：§4 E5 预期族 NORMAL_ANSWER_DRAIN——B2c/B2e 批同标注未跑） |
| :1079 | `db-money3:prove:raw` | **interview-event** | **本批 G3 直跑键已跑**（EXIT=1→1 基红同形 · B2e 同族） |
| :1336/:1337/:1338 | `int-answer-dual-write-fence:prove:raw` | **dual-write ×1 + jobs ×1 + event ×1（三串行）** | **本批 G3 直跑键已跑**（EXIT=0→0 · receipt 三新路径亲证） |
| :1584 | `rag05-qbank-miss:prove:raw` | interview-event + interview-question（双串行） | 批内 0 跑（post 双审/B2s sweep） |

**§5 B2l 行靶列对账（1:1 吻合 · 零差异）**：dual-write（1）= fence ✓ · event（4）= db-money3/fence/rag05-qbank-miss/tokenstream ✓ · lease（1）= uc002:lease ✓ · jobs（8）= interview/reaper/reqid/stress/adaptive-consumer（红候选）/privacy-erasure/resume-reference:http/fence ✓ · question（3）= rag05-qbank-miss/uc001:nhp-adv/uc001:nhp-fault ✓——串总数 1+4+1+8+3 = 17 与实跑 17 ✓（唯一靶 14 · fence 与 rag05-qbank-miss 各跨两列同 B2k 对账口径）。R5 口径：receipt 靶批内必跑集合=∅（直跑键三键即承载其中三靶）；本批实跑 = 直跑键 3 键；其余 11 靶未跑（post 双审 + B2s 终批 sweep 兜底）。

## 4. S1 判留复述登记（Ban 10 · 本批新增 1 处）

- S1 既有八处清单（db-acl:267/490 · qbank-source:2 · uc052-checkpoint-physical.proof.ts:7 · qbank-route-scope-cache:16 · qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc-e2e-014-026:19）**零涉本批 5 名**（亲证）。
- **本批新增判留（S1 同型 · 当批补登）**：`packages/db/src/index.ts:51` 注释 `/** 原语③ appendEvent：独立成 packages/db/src/interview-event.ts… */`——桶内注释含旧路径串，非 ② specifier 属 Ban 1 白名单外 → 判留陈旧零改（终批 B2s 全仓 grep 路径集不含 packages/db/src · 不阻塞收口；如需改则后续刀单列）。
- **本批 ai-docs 面判留登记（终批 grep 路径集外·S1 同型）**：`ai-docs/testing/governance-audit-index.json:38819` `"packages/db/src/interview-jobs.ts"`（历史治理审计档案 sha 钉历史字节 · B2a–B2k 同判：档案非机械消费面）——判留零改。
- **label 型判留**：`apps/api/test/uc-e2e-001-nhp-adv.proof.ts:97` `'interview-question.ts:persistInterviewQuestion'`（ANCHOR 诊断 label 键 · 非路径解析 · lineOf 断言输入为 :74 新路径读入内容 · 行为零变）——判留零改。
- **同名族零涉登记**：`packages/domain/src/{adaptive-interview,interview-control-signals}.ts` · `packages/ai-runtime/src/interview-voice-seams.ts` · `packages/ai-graphs/src/adaptive-interview/graph.ts`（tsc 基红面同名族·G2 sha 对表承载）· `apps/api/src/modules/interview/*`（Ban 2 禁区·SSE-PUSH 线面）· `apps/worker/src/{interview-consumer,interview-service,adaptive-interview-service}.ts`——与 db 平铺 5 名同名族不同路径域，零改。
- `packages/domain/src/` 整包零涉本批 5 名路径形态（grep 亲证 0 命中）。

## 5. 收口判定

**B2l 收口判定：G0/G1/G3 全对表通过 + G2 ①补齐后二跑逐字节回归（绿保持绿 5 门 · parity base 红同形逐字节 · tsc 三包 sha 批后≡批前 · 34 行对白名单 payload 映射 0 违例 · 全仓 5 名旧路径残留 = 2 行均判留登记 · receipt 6/6 产出 ENOENT=0 + sourceDigests 新路径零 stale）· G2 首跑捕获 int-transcript:22 第三形态（`../x.ts` 已移件跨域二段边）当批补齐 = 本批最重要过程披露（B2f recruiter.ts:8 同型 · 下批起盘点形态加第三式全仓 any-form sweep 兜底）· db-money3 基红 = B2e 同族原值不洗 · 1 commit 1 收据（首版 `974b6605` → ①补齐 amend `331d90e6` → 收据再 amend = 终版）· §5 B2l 行外部串 1 改点 + manifest :245 brace-glob = ④ 实面 2 处 ✓ 亲证 · §5 靶列 17 串 1:1 零差异 · 漂移五支线与本批全编辑面零行级交集（b110 :437 纯插入平移 · 三支线 :17/:46/:540 vs :74 零交）· S1 新增 1 处（index.ts:51）+ ai-docs 档案/label 判留登记 · 瞬态容器 59973 披露在案 · 蓝本 §5 B2l 行状态由本收据承载推进（蓝本原文零改写）。**

---

*DIR-1 B2 · B2l/19 · 2026-10-07 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
