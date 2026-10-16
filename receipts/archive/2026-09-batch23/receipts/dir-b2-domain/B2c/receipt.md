# B2c 批收据 — DIR-1 B2 domain 目录拆解刀（第 3/19 批）

**Batch**: B2c（§5 表 B2c 行：resume/ · recruiting/ 两单件域）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-09）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md` @ `1f08942a`（rev3 · pre_exec_dual BOTH PASS · 协调方 EXEC 授权面内机械执行）
**Base tip**: `e2834082` · **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批 B2a @ `196c8984` · B2b @ `d41b7c41`）
**Commit**: 本批一 commit（见交付报告 hash）· releaseEvidence=false · NOT_HA

---

## 0. 开批三查 + 漂移处置（B2b 席预警 → 协调方细化裁定落地）

- **通用律 0 三查**：`git fetch origin` 后 `origin/line/dir-b2-domain` = `d41b7c41` = 开批 HEAD（对齐零分叉）；SOP 沿 B2a/B2b；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH/TOKSTREAM/隐私主线面零触，本批改动面见 §1）。
- **漂移预检（fresh 亲跑）**：`git diff e2834082 origin/feat/mysql-schema-skeleton -- packages/db/src` = **仅 `packages/db/src/recruiter.ts` +25/−2**（G7FIX-4 mark-then-recover 单触点 · @@-382 起，B2b 收据 §3 同面复现，无新增变化）。
- **协调方细化裁定执行**：B2b 收据 §3 移交警示（「主线漂移未消化前 B2c 不得直接 mv recruiter.ts」）由协调方细化裁定覆盖——**照常执行**：文件级移动不受内容漂移影响，本树 recruiter.ts（= base e2834082 版，`git show HEAD:` 亲证无 G7FIX-4 块）按蓝图整体迁移；漂移块留在 skeleton 线，合并时走 rename 内内容三方合并。
- **白名单面交集亲核（rg 停手红线核验）**：漂移新增 25 行内容级 rg `packages/db/src|import |from '|require(` = **0 命中**（唯一 grep 命中为 diff 头 `+++` 路径行非内容行）；漂移块 @@-382 起与 recruiter.ts 头部 import 区（:5–:9 · 本批 ① 类 3 行改写面）**零重叠**；与 ③ runner 串 / ④ 外部串（他文件）零交集 → **不停手，登记本节**。

## 1. 批内文件清单与 mv 证据（§5 B2c 行：resume.ts(220行) · recruiter.ts(475行)）

| # | 移动 | 证据（`git diff --cached -M`） |
|---|------|-------------------------------|
| 1 | `packages/db/src/resume.ts` → `packages/db/src/resume/resume.ts` | `R99` = R100 + **①类 1 行**（:7 `'./errors.ts'`→`'../errors.ts'`；`git show HEAD:` blob 对树逐字节 diff 仅此一行 · 引号外逐字节相同） |
| 2 | `packages/db/src/recruiter.ts` → `packages/db/src/recruiting/recruiter.ts` | `R99` = R100 + **①类 3 行**（:7 ids · :8 job-route-decision · :9 tenant 前缀改；blob 直比仅此三行 · 行尾注释字节原样） |

**白名单随批改（B2c 实面 · §3 四类对账 · staged 面 = 2 mv + 10 文件，零第八方）**：
- **① 包内 import（5 处）**：移动件自引改 4（resume→errors 锚 · recruiter→ids 锚 · →job-route-decision **未移平铺件**（B2f 批）· →tenant/）+ 消费件 1（`candidate-route.ts:25` `'./resume.ts'`→`'./resume/resume.ts'` · 平铺未移件指移动件规则）。批内无测试面直引（`git grep` packages/db/test 相对直引 resume/recruiter = 0 · M3 预登记六文件面无本批件复核成立）。
- **② 桶 re-export（4 处）**：`packages/db/src/index.ts:83/:84`（recruiter）· `:95/:96`（resume）specifier 加域前缀；tenant 2 行与全部导出名零改。
- **③ runner receipt（19 处 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改）**：resume ×9（:413/:422/:429/:451/:500/:507/:894/:919/:928）+ recruiter ×10（:388/:435/:999/:1022/:1431/:1449/:1525/:1545/:1571/:1586）；**awk 靶映射亲证 19/19 与 §5 B2c 行 receipt 靶清单吻合**（resume 面 9 靶：resume · interview · ocr · reaper · resume-derivative-reference · resume-erasure:foundation · resume-reference:http · uc027:manual-review-appeal · adaptive-consumer；recruiter 面 10 靶：recruiter · db-id-v7 · rag03-route · rag04-track-local · rag05-qbank-miss · scor-00:http · tenant-wiring-neg · nhp-r4-adv-covered · r4-wrong-track-adv-live-pg · r4-wrong-track-prod-surface）；`node --check` PASS；改后 `grep -nE "packages/db/src/(resume|recruiter)\.ts['\"]" runner` = **0 命中**；全仓旧路径串 `git grep`（binary-aware）= **0 行**。
- **④ 仓内机械串（9 处 · 7 文件）**：`apps/api/test/r2-p-api-route-classify.proof.ts:29`（join repoRoot recruiter · R9 勘误「worker 4 + api:29」面）· apps/worker/test r2 四文件（r2-classify-job-route-prereq:33 · r2-p-live-route-effective:31 · r2-p-loop-route-classify:26 · r2-p-start-route-classify:25）· `packages/db/test/tenant-wiring.manifest.ts:157`（WIRED_FILES recruiter file: 实值）· `:233`（RESIDUAL_PATHS recruiter file: 实值）· `:245`（RESIDUAL_PATHS brace-glob **逐元素加域前缀**：`{resume,…`→`{resume/resume,…`——同 glob 其余元素属后续批次零越序）；`apps/api/test/uc-e2e-027-manual-review-appeal.proof.mjs:127`（read resume · R4 勘误补登面）。:233 邻行 `paths:` 描述文本与 :246 计数描述体（`resume.ts 18` 等）非 file: 实值判留零改（登记 · B2b 同判）；r2 证明文件内 `['recruiter.ts', <path>]` 首元为显示标签非路径，判留零改（登记）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：`pnpm install --frozen-lockfile` 幂等（node_modules 在树 · lockfile 零改）· `pnpm db:up` 幂等（meetwise-postgres-dev Up healthy）。`.env` ABSENT 盘上亲证。

| 门 | 键 | 批前基线 | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | 双 R99 rename 检出 · 移动件 blob 直比 Δ=1/Δ=3 行（全 ① 类）· `node --check` PASS · 批内+全仓残留 grep=0 · `git diff --quiet pnpm-lock.yaml` | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 同形：diff 仅 `.tmp/e2e-platform-loop-<rand>/<ts>-<uuid>.json` 临时回执路径（outcome/exitCode/steps 全同 · 9 scenarios） |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红**：输出逐字节相同（e2e_parity_inventory invalid · 6 errors · e2e/ 树 Ban 区零触） |
| G2 | tsc `packages/db` | EXIT=2 · sha256=f7c970b09cebcc3c7189e03ebbd8904271ea9f19b1495cdcd224d9c498deeb9b | 同 sha | 错误集逐字节 ≡ 基线（≡ B2a/B2b 记录 · 三批连续性；基线错误集零 resume/recruiter 路径提及，sha 无位移面） |
| G2 | tsc `apps/api` | EXIT=2 · sha256=196049ecca4c56b71766ff9df7c439526abc8a3941e57a5ae2bd2761d91b4242 | 同 sha | 同形 |
| G2 | tsc `apps/worker` | EXIT=2 · sha256=6dae8b2dbca59169c64d9376e1999ef9fdbe0a6cb2ec1070851ddca1bfb32830 | 同 sha | 同形 |
| G3 | `resume`（直跑键 · proof 含 assertIsolatedTestTarget ⇒ 唯一合法完成形态 = runner `resume:prove:raw` → `pnpm -C packages/db resume`） | EXIT=0 | EXIT=0 | **绿保持绿**：规范化（容器名/端口/ts/pid）后逐字节相同 |
| G3 | `recruiter`（直跑键 · 同上经 runner `recruiter:prove:raw`） | **EXIT=1（base 红）** | **EXIT=1** | **同形红**：规范化后逐字节相同——P0001 `interview_event_raw_answer_fenced`（PL/pgSQL `enforce_interview_event_no_raw_answer()` · recruiter-depth.proof.ts:42 setup 段经 asPrincipal 触发 · migrations 层触发器面）· 红原值登记不洗（E5 · B1 教训「base 即有红」· B2b db-acl 同型先例处置） |
| G3 | `prove:db-id-v7`（直跑键 · 同上经 runner `db-id-v7:prove:raw`） | EXIT=0 | EXIT=0 | 绿保持绿：diff 仅 ATTEMPT/RESULT 行 pid+时间戳临时面（failures=0 双向） |
| G3 | `prove:tenant-wiring-e5`（直跑键 · 裸直跑合法：manifest 静态面零 assertIsolatedTestTarget） | EXIT=0 | EXIT=0 | 同形：diff 仅 manifest `file:` 实值回显行（`packages/db/src/recruiter.ts`→`…/recruiting/recruiter.ts` · 全 PASS · `exact count=9` 在新路径复得——④ 类改写正确性机械证据） |
| G3 | receipt ENOENT 观察 | runner 三靶 `LOCAL_ISOLATED_PROOF_RECEIPT` 各产出 1 只（pre `…T12-03-16…`/`…T12-03-28…`/`…T12-03-38…`） | 各产出 1 只（post `…T12-07-11…`/`…T12-07-18…`/`…T12-07-28…`） | **ENOENT=0 双向成立（6/6 产出正常 · release_evidence=false 标注一致）** |

**G3 附注一（recruiter base 红归因登记）**：`recruiter:prove:raw` 批前即红（本批未触任何行为面时的原值）——失败点为 migrations 0143 族触发器 `enforce_interview_event_no_raw_answer()` 的 RAISE（P0001），与 B2c 触面（路径文本 + migrations 零触 + src SQL 本体字节不动）零关联；批后同形红成立 ⇒ 零回归。披露观察（不作因果断言）：漂移分支的 G7FIX-4 块位于 recruiter.ts `startApplicationInterview`（interview 绑定恢复面），与本红同域不同点（红在 setup 段 interview_event 原文答案围栏），skeleton 线合并后该键基线或随消化重测——移交 post 双审与终批 sweep 关注。
**G3 附注二（隔离容器 migration 面）**：本批三 runner 靶一次性容器 migrate 输出 `applied=152 skipped=0`（migrations 集实测 152 文件 · 尾号 0151 · 0143 前缀双文件）——与 B2a/B2b db-acl 靶记录 applied=151 为**不同靶面各自的批前实测原值**（db-acl 151 勘误沿用不受影响；本批不跑 db-acl 键），逐键对表以内一致为准（本批三靶 pre/post 均 152 同形）。
**attempts 全账（Ban retry-to-green · 无重试刷绿）**：批前批后各一轮、逐键一次完成；recruiter 红键零重复运行（同形红即收，无洗红尝试）。

## 3. Base 漂移处置结果（本批主面）

见 §0：漂移仅 recruiter.ts +25/−2（skeleton 线 G7FIX-4），**文件级移动照常执行**（R99 · 本树 base 版内容整体迁移 · blob 直比 Δ=3 行全为 ① 类前缀）；漂移新增行 rg 白名单面交集 = 0 → 未触停手红线；漂移面与处置依据登记于本收据 §0（协调方细化裁定：B2b §3「不得直接 mv」预警由本裁定覆盖）。后续批（B2d+）开席仍须 fresh 重跑漂移预检（若 drift 扩至新文件即批内文件被漂移触碰 → 停手上报）。

## 4. 停止条件核查（沿 B2a/B2b a–e）

| 条件 | 核查 | 结果 |
|------|------|------|
| a) 落位与 §2 映射冲突 | §2 resume/ · recruiting/ 单件域各独占 · 各自 → `<域>/<名>.ts` | 未命中 |
| b) 门红非预登记 base 红族 | 全部红（parity · recruiter 直跑键 · tsc×3）均为**批前实测原值**且批后同形（parity 逐字节 · recruiter 规范化逐字节 · tsc sha 三批连续） | 未命中 |
| c) 需触批外文件 | 改动面 = 2 mv + 10 文件白名单行（index.ts · candidate-route.ts · runner · manifest · r2×5 + uc027 .mjs 均为 §5 B2c 行/§3 白名单登记面）；staged 面亲证 12 条目无第八方 | 未命中 |
| d) 漂移预检红线 | 漂移仅 recruiter.ts +25/−2，协调方细化裁定「照常执行」；新增行 rg 白名单面交集=0（§0 亲核） | 未命中 |
| e) 环境 ANY 串改逻辑 | 全部改动 = mv + 引号串内路径前缀（逐 hunk 亲核 · 移动件 blob 直比 Δ=1/3 行） | 未命中 |

## 5. Ban 纪律登记

- **Ban 7**：`.env` ABSENT（盘上亲证）· MODEL_API_KEY/MODEL_BASE_URL 每次 prove/runner/tsc 调用均 `env -u` 剥离 · Key name-only 零打印零落盘 · est 0 live 模型调用。
- **Ban 2 锚区**：7 锚 + tenant/ 零触（index.ts 仅 :83/:84/:95/:96 四 specifier 行 · tenant 2 行与 `barrelTenantReexports===2` 断言零改 · recruiter.ts 的 `../tenant/index.ts` 为移动件自身 import 前缀改，tenant 本体零触）· migrations/** 零触 · e2e/ 树零触 · G7 面零触（runner 数组内 db 串除外）。
- **Ban 3**：runner 仅 isolatedReceiptSources 块内 19 串改写；target 名/数组结构/命令 map/块外零改（:1809-1810 resume 命令映射亲证未触）。
- **Ban 6**：零 shim/转发层。
- **Ban 10 S1 判留八处复述登记**（本批零新增判留）：
  1. `packages/db/src/int-transcript.ts:7`（src 注释 · 不入终批 grep 路径集）
  2. `packages/db/test/db-acl.proof.ts:267` · 3. `:490`
  4. `packages/db/test/qbank-source.proof.ts:2`
  5. `packages/domain/src/qbank-route-scope-cache.ts:16`
  6. `packages/domain/src/qbank-track-local-retrieval.ts:13`
  7. `packages/qdrant-store/src/product-vectorstore-bridge.ts:5/:9`
  8. `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts:19` 头注
  （本批判留新增登记两小面：manifest :233 邻行/:246 计数描述文本 + r2 proofs `['recruiter.ts',…]` 标签首元——均非路径实值，见 §1 ④）
- **binary-aware erratum 逐批登记**（蓝本非阻塞披露）：`qbank-generation-projection.ts` 与 `qbank-provider-input.ts` 含 NUL 字节（B2r 批文件）——本批残留/消费面抽查全部走 `git grep`（binary-aware），未用裸 rg。
- **消费面复盘（零涉登记）**：apps 56 文件经 `@meetwise/db` 桶 import（M5 锚面零改）；r2 系证明的标签元组判留见 §1 ④；ai-docs 历史文档旧路径串不在 §3 终批 grep 路径集（docs 判留）。
- **Pins 十一值照抄零翻转**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Stack=**PG-retained** · 公开 DELETE=**503**（stays） · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本批纯移动零模型调用零计费面）。

## 6. 环境与收尾观察

- runner 一次性容器批前批后各 3 只均被 finally `docker rm -f` 正常回收；本批无新增容器残留。
- receipt 靶观察面（§5 B2c 行 19 靶中 resume · recruiter · db-id-v7 3 靶经本批 G3 直跑键复跑覆盖，sources 已解析新路径（runner 数组串 ③ 类）且 receipt 产出正常 ENOENT=0；其余 16 靶批内必跑集合=∅（R5 口径），由 post 双审指令 + B2s 终批 117 靶 sweep 兜底）。
- G4：commit 后 `git status` 0 entries · push origin line/dir-b2-domain（交付报告承载）。

**B2c 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 · 红同形红 · receipt ENOENT=0 ×6）· 1 commit 1 收据 · 漂移处置依协调方细化裁定落地登记 · 蓝本 §5 B2c 行状态由本收据承载推进（蓝本原文零改写）。**
