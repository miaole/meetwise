# B2k 批收据 — DIR-1 B2 domain 目录拆解刀（第 11/19 批）

**Batch**: B2k（§5 表 B2k 行：model-op/ 域 5 文件）· **EXEC**: mw-core（W6 DB 线）· **Date**: 2026-10-07（worktree 时钟 2026-10-10）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md`（rev3）
**Base tip**: 本批开席 `git pull origin line/dir-b2-domain` → **Already up to date（双侧 tip `4a8b47b5` = B2j 批后）· 工作树干净** · **首版 commit `69f2f56b`**（收据经 amend 折入——C-UNCOMMITTED 净树门时序强制，同 B2g/B2i/B2j 先例 · 终版 hash 见交付报告 = 首版 + 本收据 docs-only）· **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批链 B2a `196c8984` · B2b `d41b7c41` · B2c `442b1af6` · B2d `bd426386` · B2e `aba8ac2e` · B2f `40975a40` · B2g `cc15bbe9`/amend `cc76a554` · B2h `5bd79258` · B2i `40dc4551` · B2j `4a8b47b5`）
**Commit author**: `mw-dirb2-b2k` · releaseEvidence=false · NOT_HA · est 0 live

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）

- **三查**：开席 pull → Already up to date（tip `4a8b47b5`）· 工作树干净；SOP 沿 B2a–B2j 十一先例；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH/TOKSTREAM/隐私主线/r4 面零触，本批改动面见 §1）。
- **主线漂移（亲跑）**：`git fetch origin main` → tip `c4244470`（与 B2j 批时同值 · **零前进**）；`merge-base(HEAD, origin/main) = c4244470 本体`。
- **任务提示面支线亲核（unstube/trial/b110/obsready + skeleton 前进）**：`origin/line/unstub-erase` tip `03209663`（unstub-erase EXEC 收据+nail 补卷链）· `origin/line/trial-grant` tip `3ef2403c`（#228 EXEC + 0152→0154 重编号）· `origin/line/b110-recruiter-gate` tip `ee02bf4d`（#110 EXEC）· `origin/line/obs-ready` tip `3684bc00`（#92 readiness 深化 · 含 migrate.ts 根锚尾部追加 `latestMigrationVersion`）· `origin/feat/mysql-schema-skeleton` `f47670e6`→`9a1fdc07`（b110/trial 回填+LEDGER+task-sop rev3）；另见多条新线（fence-reflow/growth-gen/role-input/lint-s0-request/extrev-*/errmsg-map/resume-grounding/obs-envschema——非任务提示面不展开）。
- **漂移支线 vs 本批面交集（亲跑）**：五支线 `git diff --name-only <merge-base>..tip -- packages/db/src scripts/run-e2e-isolated.mjs` 触集 = index.ts · memory-store（B2q 面）· recruiter（B2c 已迁）· **resume-privacy.ts（A·B2 外）· scoring-wire.ts（A·B2 外·本批新发现登记）** · vector-plane-erasure（B2n 面）· migrate.ts（根锚）· runner——与本批 **5 移动文件文件级交集 = 0**；行级：index.ts drift hunks（+97 区 · obs-ready :297→:300 notification 行 · +369 区）vs 本批 ② 面 :187–:219 → **零行级交集**；runner drift hunks（块内新增 :383+/:440+/:452+/:461–467/:473–479/:481–485/:966–978 · 块外 :1643+/:1716+/:1816+/:2476+）vs 本批 ③ 面 :153–:1039 **基点行全未被漂移侧修改（纯前方插入平移）→ 零行级交集**；obs-ready :297 触 B2b 已迁 notification 桶行（支线侧平铺旧形态 · 合并期邻接如实在案 · 非本批线上冲突）。
- **漂移侧新文件披露**：`resume-privacy.ts`（已知·unstub-erase 软删层）+ **`scoring-wire.ts`（本批新发现·trial-grant/obs-ready/skeleton 三支线 A）**——均不在 B2 73 文件清单（§2 落位表无此二名）；若将来合并入线，§2 须补裁定，本批零处置如实登记。**零交集 → 不停手照常执行。**
- **环境在飞面**：node_modules 在树 · `.env` ABSENT 盘上亲证 · ambient env 零 MODEL 键（每次调用 `env -u MODEL_API_KEY -u MODEL_BASE_URL` 亲包）· `meetwise-postgres-dev`（54329）开席 Exited(0) → 本席 `pnpm db:up` 重起（环境准备非行为变更 · G3 裸跑形态 PG 组件注入用 · §2）· 本批窗口内零 `meetwise-e2e-*` 在飞容器（15 receipt 靶批内 0 跑 · G3 裸跑无容器面）。
- **lockfile 口径**：`git log e2834082..HEAD -- pnpm-lock.yaml` = 0 commit；G0「lockfile 零改」= 本批零改（staged + worktree 双向 PASS 亲证）；tsc 批前三 sha 与批后逐字节相同（§2 G2 行）= 环境无位移机械反证。

## 1. 批内文件清单与 mv 证据（§5 B2k 行：ai-cost-governance(98行) · model-invocation(183行) · model-operation-admission(108行) · online-judge-control(114行) · usage-calibration(137行)）

| # | 移动 | 证据（`git diff --cached -M --name-status`） |
|---|------|----------------------------------------------|
| 1 | `packages/db/src/ai-cost-governance.ts` → `packages/db/src/model-op/ai-cost-governance.ts` | `R099` = R100 + **①类 1 行**（:5 `import type { Client } from './principal.ts'`→`'../principal.ts'` 锚向；`-U0` 唯一 hunk 亲证 · 98 行零变） |
| 2 | `packages/db/src/model-invocation.ts` → `packages/db/src/model-op/model-invocation.ts` | `R099`（同上 · :9 · 183 行零变） |
| 3 | `packages/db/src/model-operation-admission.ts` → `packages/db/src/model-op/model-operation-admission.ts` | `R098`（同上 · :16 · 108 行零变 · 短文件 1 行差 → 相似度 98%） |
| 4 | `packages/db/src/online-judge-control.ts` → `packages/db/src/model-op/online-judge-control.ts` | `R099`（同上 · :7 · 114 行零变） |
| 5 | `packages/db/src/usage-calibration.ts` → `packages/db/src/model-op/usage-calibration.ts` | `R099`（同上 · :15 · 137 行零变） |

**白名单随批改（B2k 实面 · §3 四类对账 · staged 面 = 5 rename + 3 modified = 8 条目 · 31 内容行对 · numstat +31/−31 · 零第八方）**：

- **① 包内 import（5 行 = 移动件自引 5 · 消费件 0）**：五文件各唯一 1 行 `./principal.ts` 锚向 import → `../principal.ts`（§1.1 inSRC 列全 0 ✓ 亲证：src+test 内零非桶消费者 · `ai-cost-governance.proof.ts` 桶引 `../src/index.ts` 零改）。
- **② 桶 re-export（10 行）**：`index.ts` :187/:188（ai-cost-governance ×2）· :191/:192（model-invocation ×2）· :197/:201（usage-calibration 多行块尾 ×2）· :204/:208（model-operation-admission ×2）· :214/:219（online-judge-control ×2）specifier 加 `model-op/` 前缀；tenant 2 行（:33/:34）零触亲证；全部导出名零改。
- **③ runner receipt（21 串/15 行 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改亲证）**：`'packages/db/src/ai-cost-governance.ts'` ×10（:153/:201/:217/:228/:246/:261/:279/:297/:319/:1039）+ `'…/model-invocation.ts'` ×8（:153/:195/:217/:228/:278/:320/:340/:514）+ `'…/model-operation-admission.ts'` ×2（:297/:319）+ `'…/usage-calibration.ts'` ×1（:278）→ 各加 `model-op/` 前缀；`git diff -U0` 亲证恰 13 hunk 全带 `const isolatedReceiptSources = {` 上下文头；online-judge-control 0 串 ✓（蓝图 runner=0）；`node --check` PASS；改后 `grep -nE "packages/db/src/(ai-cost-governance|model-invocation|model-operation-admission|online-judge-control|usage-calibration)\.ts['\"]" runner` = **0 命中**。
- **④ 仓内机械串（1 处）**：`tenant-wiring.manifest.ts:245` RESIDUAL_PATHS brace-glob 元素 `usage-calibration`→`model-op/usage-calibration`（register 诚实律 B1 同判 · 改前后 glob 匹配文件集零漂移仅路径前缀诚实化）；其余 4 名不入 :245/:251 任何 glob 元素、不入 WIRED_FILES 六处 `file:` 实值（:147/:157/:170/:227/:233/:239 亲证零涉）——**恰 §5 B2k 行「外部串改点=无」** ✓（蓝图 §1.1 ext 列 1/1/1/1 的实面为 worker/ai-runtime 同名族文件 `apps/worker/src/{model-invocation-reconcile,usage-calibration-reconcile}.ts` · `packages/ai-runtime/src/usage-calibration-reconciler.ts` 与 conn-stack m3-queue 散文/证明键串——**非 `packages/db/src/<name>.ts` 路径形态 · 零改登记**）。
- **引号外零改亲证**：31 行对逐行剥引号串后逐字节比对 + 引号 payload 差异白名单映射校验（① `./principal.ts`→`../principal.ts` · ② `./<n>.ts`→`./model-op/<n>.ts` · ③ `packages/db/src/<n>.ts`→`…/model-op/<n>.ts` · ④ glob 元素前缀）= **0 违例**（node 逐 hunk 配对脚本亲跑 `/tmp/b2k-quotecheck2.mjs` · pairs=31 violations=0）；全文件行数零变（98/183/108/114/137 + index 568 + runner 2583 + manifest 256）；`git diff --quiet pnpm-lock.yaml` staged+worktree 双 PASS。
- **binary-aware**：本批全部 8 编辑面文件 node 字节级 NUL 检查 clean（`grep -P '\x00'` 对 UTF-8 多字节假信号以 node `buf.indexOf(0)` 排除；B2r 批两 NUL 件 `qbank-generation-projection.ts`/`qbank-provider-input.ts` 本批零触）；残留 grep 全程默认无碍。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

批前基线于净树（HEAD `4a8b47b5`）fresh 亲跑，先基线后动手，无 stash 环节。批后轮于首版 commit `69f2f56b` 净树执行（C-UNCOMMITTED 时序同先例：post 轮均在首版树上跑，其树内容≡终树除本收据）。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R099×4+R098×1 rename 检出 · 31 行对 quote-stripped 逐字节相同 **0 违例**（白名单 payload 映射 31/31）· `node --check` PASS · runner 残留 grep=0 · 13 hunk 全在 :93–:1640 · **全仓旧路径串残留 = 0 行**（5 名全形态全路径 grep · 亲证零命中）· lockfile 双向零改 · NUL clean | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 过 |
| G1 | `e2e-static-guards:check` | EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6） | EXIT=0 | 过 |
| G1 | `e2e-static-guards:prove` | EXIT=0（selected=30/30） | EXIT=0 | 过 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：pre/post 输出逐字节相同**（logs `diff` 为空亲证 · e2e/ 树零触） |
| G2 | `tsc -p packages/db` | EXIT=2 · sha `cb491ccd236afcc3`（24 行） | EXIT=2 · sha 同左 | **逐字节相同**（cmp 亲证） |
| G2 | `tsc -p apps/api` | EXIT=2 · sha `6244df5d4e0f3853`（37 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G2 | `tsc -p apps/worker` | EXIT=2 · sha `8690abf68c9dd4d9`（44 行） | EXIT=2 · sha 同左 | **逐字节相同** |
| G3 | `prove:ai-cost`（本批唯一直跑键 · **结构性不可达 runner 化**：runner 靶白名单闭集无 ai-cost 靶 · CI/loop 面零引用〔唯 root `rag-cost:prove` 同为裸 pnpm 转发〕· proof 自带 `assertIsolatedTestTarget` destructive 守卫拒绝一切非隔离裸跑 → 裸跑唯一诚实形态 = fail-closed 红） | **形态A（无 env 裸跑）：EXIT=1** `database_config_invalid:database_target_missing`（principal :749 opt-in 设计）；**形态B（PG 组件 env 注入 dev postgres 54329 裸跑·合法环境面）：EXIT=1** `destructive_proof_requires_e2e_isolated`（isolated-test-target.ts:70 fail-closed 拒 · 预期守卫行为） | **形态B 同令复跑：EXIT=1** `destructive_proof_requires_e2e_isolated` | **同形红：pre/post 日志逐字节相同**（`diff` 空亲证 · 含堆栈）——红原值登记不洗 · **非 base 逻辑红 = 执行入口结构性缺席**（Ban 3 禁本刀补 runner 靶 · 交 post 双审与协调方裁定：B2s sweep 面或后续刀补靶） |
| G4 | commit 后 `git status` | — | **0 entries**（首版后亲证）· docker 面仅环境件 `meetwise-postgres-dev Up healthy`（本席 db:up 起·非本批产物）· 本批零 runner 一次性容器（15 receipt 靶 0 跑）→ 零容器残留 | 干净 |

**G3 结构性发现登记（本批最重要披露）**：`prove:ai-cost` = db 包直跑 script（`tsx test/ai-cost-governance.proof.ts` · 真 PG destructive 面：createPool+runMigrations+app_role 面）在当前仓内**没有 isolated runner 入口**（白名单 :1643–:1720 亲跑枚举无 ai-cost/rag-cost 靶），而 destructive 守卫（`E2E_ISOLATED=1`+`E2E_TEST_CONTAINER`+`E2E_TEST_TARGET_TOKEN`+server-side nonce）使裸跑结构性 fail-closed——**本刀 Ban 3（runner 仅限 ③ 类串改）禁补靶**，故本批 G3 直跑键以同形红收口；③ 类改写运行时证据由 G0 逐行核验 + 残留 grep=0 + `node --check` 承载，15 receipt 靶（含 model-op00/model-op02/model-cost 等 10 个含本批串的 runner 化真 PG proof 靶）留 post 双审指令 + B2s 终批 117 靶 sweep 兜底（R5 口径）。
**attempts 全账（Ban retry-to-green）**：G3 直跑键 pre 两形态各 1 次（形态A database_target_missing · 形态B destructive guard 拒——两形态均为**单发探索非重试**·形态B 为对表基线）+ post 形态B 1 次 = 3 次；G2 pre/post 各 1 轮（3 包 ×2 = 6 次）；G1 五门 ×2 = 10 次——**共 19 attempts 全部单发零重跑 · 无 stash 伪红 attempt**。

## 3. 靶对表（③ 类 21 串 → 15 runner 靶 · 与 §5 B2k 行 receipt 靶列对账）

| runner:line | target | 承载串（本批移动名） | R5 处置 |
|---|---|---|---|
| :153（×2） | `uc028:nhp-fault:prove:raw` | ai-cost-governance + model-invocation | 批内 0 跑（post 双审/B2s sweep） |
| :195 | `runtime:claim-join:prove:raw` | model-invocation | 同上 |
| :201 | `model-cost:prove:raw` | ai-cost-governance | 同上 |
| :217（×2） | `model-invocation-reconcile:prove:raw` | model-invocation + ai-cost-governance | 同上 |
| :228（×2） | `model-op00:prove:raw` | model-invocation + ai-cost-governance | 同上 |
| :246 | `failover-price-policy:prove:raw` | ai-cost-governance | 同上 |
| :261 | `estimate-threading-invoke:prove:raw` | ai-cost-governance | 同上 |
| :278（×2） | `model-op00-usage-reconciler:prove:raw` | model-invocation + **usage-calibration** | 同上 |
| :279 | `model-op00-usage-reconciler:prove:raw` | ai-cost-governance（同靶第二行） | 同上 |
| :297（×2） | `model-op02:prove:raw` | **model-operation-admission** + ai-cost-governance | 同上 |
| :319（×2） | `model-slot-bypass:prove:raw` | model-operation-admission + ai-cost-governance | 同上 |
| :320 | `model-slot-bypass:prove:raw` | model-invocation（同靶第二行） | 同上 |
| :340 | `privacy-erasure:prove:raw` | model-invocation | 同上 |
| :514 | `adaptive-degrade:prove:raw` | model-invocation | 同上 |
| :1039 | `db-trigfam:prove:raw` | ai-cost-governance | 同上 |

**§5 B2k 行靶列对账差异登记（登记性·非阻断）**：蓝图 ai-cost（10）列与实跑 1:1（db-trigfam/model-cost/model-op00/model-op02/model-op00-usage-reconciler/model-invocation-reconcile/failover-price-policy/model-slot-bypass/estimate-threading-invoke/uc028:nhp-fault）；**model-invocation（8）列第 2 项蓝图写 `model-op02`——实跑 model-op02 靶（:297）不含 model-invocation 串（其两串 = model-operation-admission 面·蓝图 admission（2）列已正确覆盖 model-op02）；model-invocation 面第 8 靶实为 `uc028:nhp-fault`（:153 同行双串分属两列·蓝图 ai-cost 列已列该靶）**——两列恰好互换一个靶名，串总数 10+8+2+1 = 21 与实跑 21 ✓ 吻合，以实跑为准；admission（2）✓（model-op02 · model-slot-bypass）；usage-calibration（1）✓（model-op00-usage-reconciler）；online-judge-control 无靶 ✓（0 串亲证）。
R5 口径：receipt 靶批内必跑集合=∅；本批实跑 = 直跑键 1 键（prove:ai-cost · §2 结构性同形红登记）；15 靶未跑（post 双审 + B2s 终批 sweep 兜底）。

## 4. S1 判留复述登记（Ban 10 · 本批零新增）

- S1 八处清单（db-acl:267/490 · qbank-source:2 · uc052-checkpoint-physical.proof.ts:7 · qbank-route-scope-cache:16 · qbank-track-local-retrieval:13 · product-vectorstore-bridge:5/9 · uc-e2e-011×2 · uc-e2e-014-026:19）**零涉本批 5 名**（亲证）。
- **本批 ai-docs 面判留登记（终批 grep 路径集外·S1 同型）**：`ai-docs/requirements/use-cases/model-invocation-reliability.md:35` 需求 SSOT 散文串 `packages/db/src/model-invocation.ts`（Ban 4 SSOT 字节零动）+ 历史收据档案 JSON/md 含 5 名旧路径 sourceDigests 键（`2026-10-06-an-mop-q45-*` · `mop03-cutover-review` 等——sha256 钉历史字节·B2a–B2j 同判：档案非机械消费面）——判留零改。
- **同名族零涉登记**：`apps/worker/src/{model-invocation-reconcile,usage-calibration-reconcile}.ts` · `apps/worker/test/model-invocation-reconcile.proof.ts`（`../src/` 指 worker src）· `packages/ai-runtime/src/usage-calibration-reconciler.ts` · conn-stack m3-queue 散文/证明键（`model-invocation-reconcile:prove` 为证明键非路径）——与 db 平铺 5 名同名族不同路径域，零改。
- `packages/domain/src/` 整包零涉本批 5 名（grep 亲证 0 命中）。

## 5. 收口判定

**B2k 收口判定：G0/G1/G2/G4 全对表通过 + G3 直跑键同形红收口（绿保持绿 4 门 · parity base 红同形逐字节 · tsc 三包 sha pre/post 逐字节相同 · 31 行对白名单 payload 映射 0 违例 · 全仓 5 名旧路径残留 = 0 行）· **prove:ai-cost 无 runner 靶 + destructive 守卫结构性拒裸跑 = 本批最重要结构性发现**（同形红登记不洗 · Ban 3 禁本刀补靶 · 交 post 双审/协调方）· 1 commit 1 收据（收据经 amend 折入本批唯一 commit · post 轮均在折入前首版树执行）· §5 B2k 行外部串=无 ✓ 亲证（唯一 ④ 改点 = manifest :245 brace-glob 元素·register 诚实律）· §5 靶列 model-op02/uc028:nhp-fault 互换差异登记（以实跑 21 串为准）· 漂移五支线与本批全编辑面零行级交集 · drift 侧 B2 外新文件 2 个登记（resume-privacy.ts 已知 + scoring-wire.ts 新发现）· S1 零新增 + ai-docs 需求 SSOT/历史档案判留登记 · 蓝本 §5 B2k 行状态由本收据承载推进（蓝本原文零改写）。**

---

*DIR-1 B2 · B2k/19 · 2026-10-07 · releaseEvidence=false · NOT_HA · actualSpendCny=null（零模型调用 · est 0 live） · .env ABSENT*
