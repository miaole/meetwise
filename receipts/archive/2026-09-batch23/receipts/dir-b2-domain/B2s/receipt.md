# B2s 批收据 — DIR-1 B2 domain 目录拆解刀（第 19/19 批 · 终批）

**Batch**: B2s（§5 表 B2s 行：qbank/ 后段 5 文件 + **终批收口**）· **EXEC**: DIR-B2 域 B2s 批 EXEC 席（pure-mv 机械执行）
**Date**: 2026-10-10（worktree 时钟）· **Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席树 HEAD `a9d1cbdc`（B2r 终版 · 工作树干净）· **首版 commit `6b84de79`**（mv+白名单四类首版 · 首版对象 `2ab28ca5` 曾以裸 commit 命令携环境身份创建，随即于收据折入前 `git -c user.name=dirb2-b2s -c user.email=exec@meetwise.local commit --amend --reset-author` 修正为协调方指令身份——内容面零变仅 author 元数据 · §6-3 披露）→ **收据 docs-only amend 折入**（C-UNCOMMITTED 净树门时序 · 同 B2g–B2q 先例 · 终版 hash = 首版 + 本收据）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 git 实测见 §7）· **Commit author**: `dirb2-b2s <exec@meetwise.local>`（协调方本批指令指定）· releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：SOP 沿 B2a–B2r 十八先例；W 线冻结序 + loop §3 冲突表零命中（本批 ④ 类触面 = worker r4-funnel src 串 + worker test join 串 + conn-stack proof join 串，全部为 §3 ④ 类授权例外面 · apps src 仅 r4-funnel 命中例外 · **开席 fetch 漏做，fetch 漂移核验上移至首版完成后补做**——`git fetch origin` 实测 origin/line/dir-b2-domain tip `a18a1dd3`（= B2o 终版 · 远端零前进 · 本地领先 B2p `4950bd51` + B2q `098de4a1` + B2r `a9d1cbdc` + B2s 四笔未推 commit = ⛔push 纪律下预期形态）；`git fetch origin main` → tip `c4244470`（与 B2r 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体`。时序偏差如实披露 §6-4，零前进结论不受影响）。
- **环境在飞面**：node_modules 在树 · `.env` ABSENT 盘上亲证 · ambient env 零 MODEL 键（`env | grep -c MODEL_API_KEY|MODEL_BASE_URL` = 0 · 每次隔离跑 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 亲包）· `meetwise-postgres-dev` Up 4h+（healthy · 54329）（runner 隔离跑 PG 面用）· 批内两查 `docker ps -a` 零 `meetwise-e2e-*` 瞬态/残留（全列亲证仅 postgres-dev 一件 · runner 8 次隔离跑全数自清）。
- **lockfile 口径**：B2a–B2r 全批链 `pnpm-lock.yaml` 零改；本批 staged + worktree 双向 `git diff --quiet pnpm-lock.yaml` PASS；tsc 三包 pre/post 输出逐字节相同 = 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2s 行：qbank-miss(385行) · qbank-provider-input(116行) · qbank-retrieval-cache(374行) · qbank-route-scope-cache(310行) · qbank-track-local-retrieval(271行)）

| # | 移动 | 证据（`git diff --cached -M --name-status` @首版） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/qbank-miss.ts` → `packages/db/src/qbank/qbank-miss.ts` | `R098`（①类 6 行 · 385 行零变） |
| 2 | `packages/db/src/qbank-provider-input.ts` → `packages/db/src/qbank/qbank-provider-input.ts` | `R098`（①类 1 行（:18）· 116 行零变 · **binary face：numstat `-`**） |
| 3 | `packages/db/src/qbank-retrieval-cache.ts` → `packages/db/src/qbank/qbank-retrieval-cache.ts` | `R099`（①类 2 行 · 374 行零变） |
| 4 | `packages/db/src/qbank-route-scope-cache.ts` → `packages/db/src/qbank/qbank-route-scope-cache.ts` | `R099`（①类 3 行 · 310 行零变） |
| 5 | `packages/db/src/qbank-track-local-retrieval.ts` → `packages/db/src/qbank/qbank-track-local-retrieval.ts` | `R097`（①类 5 行 · 271 行零变） |

**盘点口径**：五文件名全仓 any-form sweep（grep **binary-aware `-a`** 双向 · B2r 返工教训执行面落地）——消费件 = db src（index.ts 桶 10 行 ② · **src 内零其他 import 消费者亲证**——B2r 五件对本批五名的 7 行引用已于 B2r 批改讫为 `./qbank/qbank-*.ts` 同域形态）+ runner ③ 类 16 串/11 行 + ④ 类 11 行/8 文件；db test 五名直引 grep -a = **0**（47 文件桶引面零 ① test 改）；packages/domain 命中 = S1 在册注释 2 行（:16/:13 · 判留）；qdrant-store / e2e / docker 零命中亲证；migrations 命中 = 注释 4 行（硬 Ban 零触 · 新判留登记 §4）；**移动件互引 2 行同域判留亲证**（route-scope-cache:33 `./qbank-retrieval-cache.ts` · track-local:47 同形——移入 qbank/ 后 `./` 形态恰为终形态 · 零改=① 类规则内同域形态）。

**白名单随批改（B2s 实面 · §3 四类对账 · staged 面 = 5 rename + 9 modified = 14 条目 · numstat 数字面 +48/−48 + binary face 1 行对（provider-input :18 因 NUL 被 git 判 binary 不入数字和）= 实际 **49 行对** · 零第八方）**：

- **① 包内 import（17 行 = 五移动件自引）**：miss 6 行（:32 `./ids.ts`→`../ids.ts` 锚向 · :34 `./principal.ts`→`../principal.ts` 锚向 · :35 `./routing/job-route-decision.ts`→`../routing/…` 跨域（B2f 已移）· :36 `./qbank/qbank-generation-retrieval.ts`→`./qbank-generation-retrieval.ts` 同域二段 · :37 `./interview/interview-question.ts`→`../interview/…` 跨域（B2l 已移）· :38 `./interview/interview-event.ts`→`../interview/…` 跨域）；provider-input 1 行（:18 `./qbank/qbank-ingest.ts`→`./qbank-ingest.ts` 同域二段）；retrieval-cache 2 行（:11 锚向 · :12 同域二段）；route-scope-cache 3 行（:26/:28 锚向 · :32 同域二段）；track-local 5 行（:37 锚向 · :38 跨域 · :39/:43/:48 同域二段）。
- **② 桶 re-export（10 行）**：`index.ts` :167/:168（retrieval-cache）/ :335/:338（provider-input）/ :411/:414（track-local）/ :419/:422（miss）/ :462/:467（route-scope-cache）specifier 加 `qbank/` 前缀；全部导出名零改；tenant 2 行与 `barrelTenantReexports===2` 断言面零触亲证。
- **③ runner receipt（16 串/11 行/11 hunks · 块内亲证（:93–:1640）· 块外零改 · `node --check` PASS）**：逐名 = miss 2（:1024 · :1584）/ provider-input 1（:536）/ retrieval-cache 7（:521 · :588 · :1446 · :1522 · :1542 · :1568 · :1608）/ route-scope-cache 2（:1024 · :1607）/ track-local 4（:1446 · :1522 · :1542 · :1568）；runner 内 `packages/domain/src/qbank-*.ts` 串（:1452/:1527/:1547/:1573/:1589/:1611）= domain 包文件**零改亲证**（非 db 移动面）；改后旧形态残留 grep（含 `-a`）= 0 命中。
- **④ 仓内机械串（11 行/8 文件 · 蓝本 B2s 行外部串列 1:1 含 R3 修订）**：`scripts/conn-stack/mysql-stack.m4-rag.skeleton.proof.mjs:23` + `mysql-stack.r4-domain-isolation.proof.mjs:26`（join track-local · 各文件 :47/:58 经变量引用零改 · :204/:206 裸名消息串非机械零改）；`apps/worker/test/g4-dispatch-recheck-prereq.proof.ts:27` + `r4-wrong-track-adv.proof.ts:62`（join repoRoot track-local）；worker `r4-funnel-covered-count-batch1.ts:181`（readPkg track-local）· `batch2.ts:97`（track-local）/:175（retrieval-cache）· `batch3.ts:117`（miss · **B2r 收据披露归本批二段 · 本批改讫**）/:200（route-scope-cache）/:204（track-local）/:205（retrieval-cache）；batch3:116/:199 与 batch1:182 为 `packages/domain/src/…` 串零改亲证；`batch4.ts:115` = index 锚零改亲证（:114 free-text 已于 B2f 改讫亲证）。
- **引号外零改亲证**：48 数字行对逐行剥引号串后逐字节比对 = **0 违例**（node 配对脚本）+ binary 面 1 对（provider-input :18）sed 亲证；全文件行数零变（385/116/374/310/271 + 各改面仅行内替换）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：五文件 node 字节级 NUL 检查 = `qbank/qbank-provider-input.ts` NUL @4167→改后 @4161（:18 减 6 字节 `qbank/` · **账目吻合**）· 余四件 clean——与蓝本非阻塞披露（NUL 件 = projection+provider-input 二名 · projection 已于 B2r 移讫）吻合。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径）

批前基线：G1/G2/G3 于净树（HEAD `a9d1cbdc`）动手前 fresh 亲跑（无 stash 环节 · B2q 形态）；批后轮于首版内容树执行（= 提交前 staged 树 · 与首版 commit 内容逐字节同 · `git status` 0 entries 交叉亲证 · §6-6）。

| 门 | 键 | 批前基线 | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R097/R098×2/R099×2 rename 检出 · 49 行对 quote-stripped 逐字节相同 **0 违例** · `node --check` PASS · 旧路径串残留 = 0（runner + 全仓 grep -a 亲证 · 唯一命中 = S1 在册 domain 2 行 + migrations 新判留 4 行 · §4）· lockfile 双向零改 · NUL 面 = 披露 1 件账目吻合余 clean | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过（**规范化同形**：diff 仅 loop 目录后缀/时戳/PID/UUID 挥发面 · B2f–B2q 八批同判） |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 过（**逐字节相同**） |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post2 输出逐字节相同**（`cmp` 空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `f7c970b09cebcc3c`（24 行） | EXIT=2 · **sha 同基线** | **逐字节相同**（三包 sha 与 B2p/B2q/B2r 批记录基线 **同值** · 四重自洽 · sha 口径勘误见 §6-1） |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `196049ecca4c56b7`（37 行） | EXIT=2 · **sha 同基线** | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `6dae8b2dbca59169`（44 行） | EXIT=2 · **sha 同基线** | **逐字节相同** |
| G3 | `prove:qbank-cache`（**无 runner 靶** · 两结构形态 · §6-2） | bare EXIT=1 `database_config_invalid:database_target_missing` · dev-PG env EXIT=1 `destructive_proof_isolated_target_attestation_missing` | 同左两形态 EXIT=1 同错 | **同形红（结构拒跑）**：dev-env 形态 pre/post **逐字节相同**（B2k `prove:ai-cost` 判例 · Ban 3 禁补靶 · 交 post 双审/协调方 · attest 前抛出零 schema 副作用） |
| G3 | `prove:rag05-qbank-miss`（经 runner `rag05-qbank-miss:prove:raw`） | EXIT=0（PASS=62 FAIL=0） | EXIT=0（PASS=62 FAIL=0） | **绿保持绿**：规范化后仅容器名/端口/pid/receipt 文件名挥发恒等面 |
| G3 | `prove:rag06-route-scope-cache`（经 runner `rag06-route-scope-cache:prove:raw`） | EXIT=0（PASS=44 FAIL=0） | EXIT=0（PASS=44 FAIL=0） | **绿保持绿**（同上） |
| G3 | `prove:rag04-track-local`（经 runner `rag04-track-local:prove:raw`） | EXIT=0（PASS=33 FAIL=0） | EXIT=0（PASS=33 FAIL=0） | **绿保持绿**（同上） |
| G3 | `prove:db-id-v7`（经 runner `db-id-v7:prove:raw`） | EXIT=0（PASS=36 FAIL=0） | EXIT=0（PASS=36 FAIL=0） | **绿保持绿**（同上） |
| G3 | receipt ENOENT 观察 | pre runner 四键各产出 1 只（4/4 · releaseEvidence=false） | post 四键各产出 1 只（4/4 同形） | **ENOENT=0 双向成立（8/8 产出）；post receipt 解析移动名引用全为 `packages/db/src/qbank/qbank-*.ts` 新形态 · 零 stale db 平铺旧形态**——③ 类改写正确性机械证据 |
| G4 | commit 后 `git status` | — | **0 entries**（首版后亲证）· docker 面仅环境件 `meetwise-postgres-dev Up healthy`（非本批产物）· 批内两查零 `meetwise-e2e-*` 容器瞬态/残留 | 干净 |

**attempts 全账（Ban retry-to-green）**：G3 pre 6（runner 4 + qbank-cache 结构形态 2）+ post 6（同形）= 12；G2 pre 3（canonical 仓根形态 ×3 包）+ pre 诊断性形态复跑 2（db 包 in-cwd 形态 + 确定性二连跑——sha 口径定位用 · 非红修）+ post 3 = 8；G1 五门 pre 5 + post 5 = 10——**共 30 attempts**。全批零真红修复轮（首版即无补齐轮 · B2q 同型）；qbank-cache 结构红 = base 结构形态登记非 retry 对象；无 stash 伪红 attempt。

## 3. 靶对表（③ 类 16 串 → 9 唯一 runner 靶 · 与 §5 B2s 行 receipt 靶列对账）

| 组（串数） | 承载靶（runner `*:prove:raw`） | R5 处置 |
|---|---|---|
| miss（2） | rag05-qbank-miss(:1584) · db-id-v7(:1024) | 直跑键已跑（2/2） |
| provider-input（1） | rag-generation(:536) | 批内未跑（post 双审兜底 · sweep 口径 §6-5） |
| retrieval-cache（7） | rag06-route-scope-cache(:1608) · rag04-track-local(:1446) · rag-generation(:521) · embed-cache(:588) · nhp-r4-adv-covered(:1542) · r4-wrong-track-adv-live-pg(:1522) · r4-wrong-track-prod-surface(:1568) | 直跑键承载 rag06 · rag04（2 靶）；rag-generation/embed-cache/nhp-r4-adv-covered/r4-wrong-track-adv-live-pg/r4-wrong-track-prod-surface 批内未跑（兜底同上） |
| route-scope-cache（2） | rag06-route-scope-cache(:1607) · db-id-v7(:1024) | 直跑键已跑（2/2） |
| track-local（4） | rag04-track-local(:1446) · nhp-r4-adv-covered(:1542) · r4-wrong-track-adv-live-pg(:1522) · r4-wrong-track-prod-surface(:1568) | 直跑键承载 rag04（1 靶）；余 3 靶批内未跑（兜底同上） |

**§5 B2s 行靶列对账**：miss（2）✓ · provider-input（1）✓ · retrieval-cache（7）✓ · route-scope-cache（2）✓ · track-local（4）✓——**16 靶点 = 16 串 1:1 零差异**；唯一靶 9；本批四直跑键承载其中 7 靶点（rag05 · rag06 · rag04 · db-id-v7）批内全数跑讫（含全部红候选零标注面），余 5 靶未跑（R5 口径批内必跑集合=∅ · post 双审兜底；117 靶 sweep 口径 §6-5）。

## 4. S1 判留复述登记（Ban 10 · 本批新增登记）

- **S1 在册八处与本批五名交集 = 2 处在册豁免行**：`packages/domain/src/qbank-route-scope-cache.ts:16` + `qbank-track-local-retrieval.ts:13` 头注（引 db 平铺旧路径 · §3 终批 grep 豁免集在册 · 判留陈旧零改 · 本收据复述登记）。余六处（int-transcript.ts:7 已随 B2d 移入 transcript/ · db-acl:267/490 · qbank-source.proof.ts:2 · uc052-checkpoint-physical.proof:7 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc-e2e-014-026:19）与本批五名零交集亲证。
- **本批新增判留（S1 同型 · 当批补登）**：
  1. **migrations 注释 4 行/3 文件**：`packages/db/migrations/0106_qbank_track_local_serving_scope.sql:300`（qbank-track-local-retrieval.ts）· `0113_qbank_route_scope_cache.sql:9/:25`（qbank-route-scope-cache.ts）· `0110_llm_qbank_miss_generation.sql:24`（qbank-miss.ts）——migrations = §7 硬 Ban 零触面；不在 §3 终批 grep 路径集（该集不含 migrations · 蓝本原文）；注释型非机械 · 判留陈旧零改。
  2. **db src 注释 4 行/3 文件**：`ids.ts:29/:30`（裸名注释 · **锚文件 Ban 零触**）· `qbank/qbank-embedding-compute-cache.ts:4`（裸名指 retrieval-cache · 移后二者同域同目录 · **形态仍准确** · 登记为零陈旧化）· `interview/interview-event.ts:8/:9`（循环依赖历史论证裸名 · 判留）。
  3. **manifest `qbank-*` 通配元（终批收口指令项）**：`packages/db/test/tenant-wiring.manifest.ts` RESIDUAL_PATHS :251 brace-glob 内 `qbank-*`：本批后匹配 **0 平铺件**（qbank 域 10 件全入 `qbank/`）——**按 B2q `memory-*` 判例登记为匹配 0 的陈旧化形态，零改写**（B2r 收据预告「B2s 批后同判例登记」· 就此销案）；:245 glob 元素与 WIRED_FILES file: 实值六处与本批五名零涉亲证（manifest 本批零改）。
  4. **ai-docs 历史档案面**：前批收据链记录中 B2g/B2h hash 与 git 实测偏离（§7-4）· 蓝本 §1.1/Erratum NUL 披露行等——append-only 不改 · 全部在 B2s 终批 grep 路径集外。
- `packages/db/src/` 平铺面五名旧文件 = 0 残留；**qbank 域 10/10 本批收口**（B2r 前段 5 + 本批后段 5）；`ls packages/db/src/*.ts` = 仅 7 锚（index · principal · migrate · migrate-cli · isolated-test-target · errors · ids）。

## 5. 收口判定

**B2s 收口判定：G0/G1/G2/G3 全对表通过（四 runner 键绿保持绿 PASS/FAIL 双向恒等 · parity base 红同形逐字节 · tsc 三包 sha 批后≡批前且≡B2p/q/r 批记录值四重自洽 · qbank-cache 结构红同形逐字节（B2k 判例）· 49 行对白名单 payload 映射 0 违例 · 旧路径串残留 0（S1 在册 2 行 + 新判留 migrations 4 行外）· receipt 8/8 产出 ENOENT=0 + post 移动名引用全新形态零 stale）· 1 commit 1 收据（首版 `6b84de79` → 收据 docs-only amend = 终版）· §5 B2s 行外部串列与本批 ④ 实面 11 行/8 文件 1:1 吻合（含 batch3:117 二段改讫 · batch4:115 锚零改亲证）· 靶列 16 靶点 1:1 对账且四直跑键批内全数跑讫 · 漂移：main/远端支线零前进 · 批内零瞬态容器。终批三收口：① §3 蓝本全仓残留 grep（逐字命令）= **0 行** ✓；② runner db 面 117 靶全量 sweep **未在本批指令范围内执行**（本批指令 G3 = 蓝本 B2s 行全部 prove 键 · 收口 = 登记三项 · §6-5 诚实披露交协调方裁定）；③ `git log --oneline e2834082..HEAD` = 23 commits（4 蓝本 docs + **19 批一批一 commit** · §7 全链清单）✓。memory/qbank 域收口双确认：平铺 memory-* / qbank-* = **0** · `memory/` `qbank/` 域目录各 10/10 完整 ✓。DIR-B2 65/65 mv 全数收口（19/19 批 · 根终留 7 锚 + tenant/ 原地）· 蓝本 §5 B2s 行状态由本收据承载推进（蓝本原文零改写 · 同 B2a–B2r 十八批先例）。**

## 6. 偏差披露（显式 · 零静默）

1. **tsc sha 算法口径定位（本批开席唯一门禁面波折 · 非批产物）**：批前 G2 首扫以 `shasum`（默认 SHA-1）取 hash 得 `cb491ccd…/6244df5d…/8690abf6…`，与 B2p/q/r 记录值不符 → 触发停止条件边缘排查：行数（24/37/44）吻合 · 五名零涉 · 旧路径零涉 · 环境确定性二连跑同值 · lockfile/TS 6.0.3 恒定 → 定位根因 = **前批记录口径为 `shasum -a 256`**：本批 pre 输出以 SHA-256 复算 = `f7c970b0…/196049ec…/6dae8b2d…` 与基线**逐字节同值**（post 同）。零环境位移 · 零红洗（两口径对同一份输出 · 文件在 `/tmp/b2s/` 留档）；登记为批执行知识：后续 sha 记录一律注明算法。
2. **`prove:qbank-cache` 无 runner 靶 + destructive 守卫结构性拒裸跑**：蓝本 B2s 行直跑键五键中四键有同名 runner 靶（命令映射 `pnpm -C packages/db prove:<同名>` · runner :1961–:1978 亲证）；`prove:qbank-cache` 全 runner 零引用（`test/qbank-retrieval-cache.proof.ts` 不在任何 isolatedReceiptSources · `qbank-cache` 字串 runner 零命中）· 该 proof 经 `assertIsolatedTestTarget` 要求 runner 一次性容器 GUC nonce（`meetwise.e2e_run_token`）→ 裸跑/裸 env 直跑结构性无法满足。两形态 pre/post 同形登记（§2 G3 行 · **B2k `prove:ai-cost` 同型先例**：无 runner 靶 + 守卫拒裸跑 = 结构性发现同形红登记不洗 · Ban 3 禁本刀补靶 · 交 post 双审/协调方）；attest 于任何 query 前抛出 · catch 仅 no-op `DROP DATABASE IF EXISTS <随机名>` = 零 schema 副作用亲证。
3. **首版 author 修正轮**：首版 commit 初建（`2ab28ca5`）误用环境身份（裸 `git commit` 未带指令 `-c` 身份）→ 于收据折入前、任何 post 复跑前立即 `git -c user.name=dirb2-b2s -c user.email=exec@meetwise.local commit --amend --reset-author` 修正 → 首版终对象 `6b84de79`；内容树零变（仅 author/committer 元数据）· 门禁有效性不受影响（post 轮内容 = 首版内容逐字节）。
4. **开席 fetch 时序**：开席三查之 fetch 漏做（直接以本地净树 + HEAD a9d1cbdc 开工）· fetch 漂移核验于首版完成后补做——远端支线/main 双零前进结论实测成立（§0）· 如实披露。
5. **终批 sweep 口径（§6.3-2）**：蓝本 B2s 行与 §6.3 载「runner db 面 117 靶全量 sweep（或协调方裁定抽样 ≥ 未跑余量半数并披露未跑清单）」；**协调方本批指令的执行序为「G3 蓝本 B2s 行全部 prove 键 + 终批收口三项（manifest 判例登记 · 域双确认 · 收据 §7）」，未含 sweep**——本批按指令范围执行并于此诚实登记：sweep 未执行 · 交 post 双审/协调方按 §6.3 裁定（全量或抽样）。本批已跑覆盖 = 直跑键 4 靶 + 蓝本各批直跑键累计面（各批收据在档）；未跑清单以 runner 117 靶全集减去各批已跑为准（协调方裁定面）。
6. **post 轮执行树**：G1/G2/G3 post 轮于首版提交前的 staged 树执行（内容与首版 commit 逐字节同 · 提交后 `git status` 0 entries 交叉亲证）——非「commit 后树」形态，B2r 同型（post 于首版 commit 树）的等价变体，如实披露。
7. **历史收据链记录勘误登记（非本批产物 · append-only）**：git 实测 B2g=`6552fb04` · B2h=`cc76a554`（终版）；B2i–B2r 收据前批链记录作「B2g `cc76a554` · B2h `5bd79258`」（B2i 作 B2g `cc15bbe9`）——实为 B2h 终版/首版错置入 B2g 槽位（`5bd79258`=B2h 首版 · `cc15bbe9`=B2g 首版 · 二对象均在档亲证）。历史收据零改；本收据 §7 以 git log 为权威链。

## 7. DIR-B2 19/19 收官

**战役对账**：`git log --oneline e2834082..HEAD` = **23 commits** = 蓝本 docs 4（7ddc6213 起草 · 5c7a70d1 rev2 · f6110e9f rev3 · 1f08942a rev3 status bump EXEC 授权）+ **批次 commit 19（一批一 commit 对表 ✓）**。

**批次 commit 链（git log 实测 · 拓扑序 · 65/65 mv 对账 ✓）**：

| 批 | commit | 移动（域/件数） |
|----|--------|----------------|
| B2a | `196c8984` | audit/ 1 |
| B2b | `d41b7c41` | report/ 1 · notification/ 1 |
| B2c | `442b1af6` | resume/ 1 · recruiting/ 1 |
| B2d | `bd426386` | transcript/ 2 |
| B2e | `aba8ac2e` | commerce/ 2（E6 收口） |
| B2f | `40975a40` | routing/ 3 |
| B2g | `6552fb04` | checkpoint/ 2 |
| B2h | `cc76a554` | jobs/ 4（E4b 收口） |
| B2i | `40dc4551` | context/ 4 |
| B2j | `4a8b47b5` | retrieval/ 4 |
| B2k | `3003665e` | model-op/ 5 |
| B2l | `ce050e1e` | interview/ 5 |
| B2m | `6027ff49` | scoring/ 3 |
| B2n | `dee8bc4e` | privacy/ 前段 3 |
| B2o | `a18a1dd3` | privacy/ 后段 3 |
| B2p | `4950bd51` | memory/ 前段 5 |
| B2q | `098de4a1` | memory/ 后段 5（memory 域 10/10 收口） |
| B2r | `a9d1cbdc` | qbank/ 前段 5 |
| **B2s** | `6b84de79`（+本收据 docs-only amend = 终版） | **qbank/ 后段 5（qbank 域 10/10 收口 · 全战役收官）** |

合计 1+2+2+2+2+3+2+4+4+4+5+5+3+3+3+5+5+5+5 = **65 mv ✓** + 根锚 7（index · principal · migrate · migrate-cli · isolated-test-target · errors · ids）+ tenant/ 原地 = 73 ✓。

**终态亲证（本批盘面）**：`ls packages/db/src/*.ts` = 仅 7 锚 · 18 域目录 + tenant/ 就位 · 全仓旧路径串残留 = 0（§3 蓝本 grep 逐字 · S1 在册豁免集精确 8 处）· memory/qbank 域平铺残留双确认 = 0 · runner ③ 面零 stale · manifest `qbank-*`/`memory-*`/`int-transcript*` 通配元按判例登记 match-0。

**战役级 pins（十一值照抄 · 本刀全程未动）**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Stack=PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `actualSpendCny=null`（19 批 docs-only/纯移动 · 零模型调用零计费面 · est 0 live）。

**遗留移交（post 双审/协调方）**：① §6.3-2 117 靶 sweep 裁定与执行（§6-5）；② `prove:qbank-cache` 无隔离靶结构事项（§6-2 · B2k `prove:ai-cost` 同族）；③ S1 判留新增 12 行（§4 · 注释型非机械）；④ 各批未跑 receipt 靶抽样余量（各批收据在档 · R5 口径）。

---

*DIR-1 B2 · B2s/19 · 终批 · 2026-10-10 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
