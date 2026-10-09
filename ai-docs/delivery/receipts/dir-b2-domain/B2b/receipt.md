# B2b 批收据 — DIR-1 B2 domain 目录拆解刀（第 2/19 批）

**Batch**: B2b（§5 表 B2b 行：report/ · notification/ 两单件域）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-09）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md` @ `1f08942a`（rev3 · pre_exec_dual BOTH PASS · 协调方 EXEC 授权面内机械执行）
**Base tip**: `e2834082` · **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批 B2a @ `196c8984`）
**Commit**: 本批一 commit（见交付报告 hash）· releaseEvidence=false · NOT_HA

---

## 1. 批内文件清单与 mv 证据（§5 B2b 行：report.ts(92行) · notification.ts(36行)）

| # | 移动 | 证据（`git diff --cached -M`） |
|---|------|-------------------------------|
| 1 | `packages/db/src/report.ts` → `packages/db/src/report/report.ts` | `R100` 纯 rename · numstat `0 0`（`git show HEAD:…` 逐字节 diff = 零差异） |
| 2 | `packages/db/src/notification.ts` → `packages/db/src/notification/notification.ts` | `R097` = R100 + **①类 1 行**（:11 `'./tenant/index.ts'`→`'../tenant/index.ts'`；HEAD 对树逐字节 diff 仅此一行 · 引号外逐字节相同） |

**白名单随批改（B2b 实面 · §3 四类对账）**：
- **① 包内 import（1 处）**：`notification.ts:11` `./tenant/index.ts` → `../tenant/index.ts`（移动件→tenant · M3 预登记 tenant ×3 消费件之一）；report.ts 本体仅 `import type … from 'pg'`（外部包零相对 import）。批内无消费件直引（report/notification inSRC=0 实测复核：全仓 `git grep` 相对直引 = 0；db test 六文件非桶直引面无 report/notification）。
- **② 桶 re-export（3 处）**：`packages/db/src/index.ts:102` `} from './report.ts'` → `'./report/report.ts'` · `:103` `export type { ReportStatus }` 同 · `:294` notification 桶行同形（numstat `3 3`；tenant 2 行与全部导出名零改）。
- **③ runner receipt（8 处 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改）**：`scripts/run-e2e-isolated.mjs` :135/:469/:753/:764/:784/:794/:1086（report ×7 靶：uc001:nhp-fault · report · uc011:report-refund · uc011:report-refund:http · uc019:report-regenerate · uc019:report-regenerate:http · db-acl）+ :998（notification ×1 靶：tenant-wiring-neg）——与 §5 B2b 行 receipt 靶清单 **8/8 吻合**（awk 靶映射亲证）；`node --check` PASS；改后 `grep -nE "packages/db/src/(report|notification)\.ts['\"]" runner` = **0 命中**。
- **④ 仓内机械串（4 处）**：`apps/api/test/uc-e2e-001-nhp-fault.proof.ts:90`（readFileSync resolve report · §5 行登记）· `packages/db/test/tenant-wiring.manifest.ts:147`（WIRED_FILES notification file: 实值）· `:227`（RESIDUAL_PATHS notification file: 实值）· `:245`（RESIDUAL_PATHS brace-glob **逐元素加域前缀**：`…,interview-question,report,payment,…` → `…,interview-question,report/report,payment,…`——同 glob 其余元素属后续批次随批改，本批零越序）；numstat `3 3`。:227 RESIDUAL `paths:` 描述文本（`report.ts 10` 等基数描述）与 :246 `paths` 字符串描述体非 file: 实值，判留零改（登记）。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：`pnpm install --frozen-lockfile` EXIT=0（lockfile 零改）· `pnpm db:up` 幂等（meetwise-postgres-dev Up healthy · B2a 已起）。

| 门 | 键 | 批前基线 | 批后 | 对表 |
|----|----|---------|------|------|
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 同（输出逐字节相同） |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 同（9 scenarios；diff 仅 `.tmp/e2e-platform-loop-<rand>/<ts>-<uuid>.json` 临时回执路径——outcome/exitCode/steps 全同） |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 同（输出逐字节相同） |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 同（输出逐字节相同） |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红**：输出**逐字节相同**（e2e_parity_inventory invalid · 6 errors · e2e/ 树 Ban 区零触） |
| G2 | tsc `packages/db` | EXIT=2 · sha256=f7c970b09cebcc3c7189e03ebbd8904271ea9f19b1495cdcd224d9c498deeb9b | 同 | 错误集逐字节 ≡ 基线（≡ B2a 批后记录 · 连续性双证） |
| G2 | tsc `apps/api` | EXIT=2 · sha256=196049ecca4c56b71766ff9df7c439526abc8a3941e57a5ae2bd2761d91b4242 | 同 | 同形 |
| G2 | tsc `apps/worker` | EXIT=2 · sha256=6dae8b2dbca59169c64d9376e1999ef9fdbe0a6cb2ec1070851ddca1bfb32830 | 同 | 同形 |
| G3 | `prove:uc019-report-regenerate`（直跑键 · proof :99 `assertIsolatedTestTarget` 需 runner 一次性容器 GUC `meetwise.e2e_run_token` ⇒ 唯一合法完成形态 = runner `uc019:report-regenerate:prove:raw`，命令映射即 `pnpm -C packages/db prove:uc019-report-regenerate`） | EXIT=0 | EXIT=0 | **绿保持绿**：diff 仅一次性容器名+端口（`meetwise-e2e-<pid>-<ts>` @随机端口）期望内临时面 |
| G3 | `prove:db-acl`（直跑键 · 同上经 runner `db-acl:prove:raw`） | **EXIT=1（base 红）** | **EXIT=1** | **同形红**：FAIL 6 / PASS 10 行序列**逐行相同**（`applied=151 skipped=0` vs 钉 ≤0143=144 前缀 · §3-1 count=54 vs 55 · 红原值登记不洗） |
| G3 | `tenant-enforcement:prove`（直跑键 · 裸直跑合法：零 assertIsolatedTestTarget · unit prove） | EXIT=0 | EXIT=0 | 同（输出逐字节相同） |
| G3 | `prove:tenant-wiring-e5`（直跑键 · 裸直跑合法：manifest 静态面） | EXIT=0 | EXIT=0 | 同形：diff 仅 manifest `file:` 实值回显行（`packages/db/src/notification.ts`→`…/notification/notification.ts`，全 PASS · `exact count=6` 在新路径复得——④ 类改写正确性机械证据） |
| G3 | receipt ENOENT 观察 | `LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/…T11-53-26-774Z-…json`（uc019）+ `…T11-53-37-280Z-…json`（db-acl） | `…T11-55-54-913Z-…json` + `…T11-56-12-271Z-…json` | **ENOENT=0 双向成立（4/4 产出正常）** |

**G3 附注（受杆 briefing 勘误登记）**：受杆令述「db-acl 红=applied 152 vs 钉 144」——本席批前批后两次亲跑实测均为 **applied=151**（与 B2a 收据一致；migration 集自 0001–0151 未变）。按 §0.1-3「以批前实测为准」登记 151，不受杆面数字漂洗。

**attempts 全账（Ban retry-to-green · 无重试刷绿）**：批前批后各一轮、逐键一次完成，无任何二次运行（uc019/db-acl runner 各 2 次 = 批前 1 + 批后 1 计入对表，非重试）。

## 3. Base 漂移预检（先行必做 · 亲跑最新）

`git fetch origin` 后 `git diff e2834082 origin/feat/mysql-schema-skeleton -- packages/db/src` 实测：**仅 `packages/db/src/recruiter.ts` +25/−2**（G7FIX-4 mark-then-recover 单触点 · G7FIX-4R 后无新增变化 · 与 B2a 批登记同面）。

- **交集裁定**：B2b 批内文件（report.ts · notification.ts）与白名单面（桶 3 行 · notification tenant import 1 行 · runner 8 串 · manifest 3 行 · api proof 1 行）与漂移**零交集** → 照常执行，本收据登记漂移面。
- **移交警示（沿 B2a）**：recruiter.ts 属 **B2c** 批范围——B2c 开席须重跑漂移预检并按「批内文件被漂移触碰→停手上报」红线处置（主线漂移未消化前 B2c 不得直接 mv recruiter.ts）。

## 4. 停止条件核查（同 B2a a–e）

| 条件 | 核查 | 结果 |
|------|------|------|
| a) 落位与 §2 映射冲突 | §2 report/ · notification/ 单件域各独占 · 各自 → `<域>/<名>.ts` | 未命中 |
| b) 门红非预登记 base 红族 | 全部红（parity · db-acl · tsc×3）均为批前实测 base 红原值且批后同形（parity 逐字节 · db-acl 行序同 · tsc sha 同） | 未命中 |
| c) 需触批外文件 | 改动面 = 2 mv + 4 文件白名单行（index.ts · runner · manifest · api proof :90 均为 §5 B2b 行/§3 白名单登记面）；staged 面亲证 6 文件无第八方 | 未命中 |
| d) 漂移预检红线 | 漂移仅 recruiter.ts（B2c 面），与本批零交集 | 未命中 |
| e) 环境 ANY 串改逻辑 | 全部改动 = mv + 引号串内路径前缀（逐 hunk 亲核） | 未命中 |

## 5. Ban 纪律登记

- **Ban 7**：`.env` ABSENT（盘上亲证）· MODEL_API_KEY/MODEL_BASE_URL 每次 prove/runner/tsc 调用均 `env -u` 剥离 · Key name-only 零打印零落盘 · est 0 live 模型调用。
- **Ban 2 锚区**：7 锚 + tenant/ 零触（index.ts 仅 :102/:103/:294 三 specifier 行 · tenant 2 行与 `barrelTenantReexports===2` 断言零改 · notification.ts 的 `../tenant/index.ts` 为移动件自身 import 前缀改，tenant 本体零触）· migrations/** 零触 · e2e/ 树零触 · G7 面零触。
- **Ban 3**：runner 仅 isolatedReceiptSources 块内 8 串改写；target 名/数组结构/命令 map/块外零改（:1763-1764 uc019 命令映射亲证未触）。
- **Ban 6**：零 shim/转发层。
- **Ban 10 S1 判留八处复述登记**（本批零新增判留；本批涉及面内 `db-acl.proof.ts:267/:490` 两处即登记行本身，残留命中=判留正确）：
  1. `packages/db/src/int-transcript.ts:7`（src 注释 · 不入终批 grep 路径集）
  2. `packages/db/test/db-acl.proof.ts:267` · 3. `:490`（report 面 · 本批判留亲证命中）
  4. `packages/db/test/qbank-source.proof.ts:2`
  5. `packages/domain/src/qbank-route-scope-cache.ts:16`
  6. `packages/domain/src/qbank-track-local-retrieval.ts:13`
  7. `packages/qdrant-store/src/product-vectorstore-bridge.ts:5/:9`
  8. `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts:19` 头注
  （另 §1.2 S1 行所列 `apps/api/test/uc-e2e-011-{adv-refund-callback:15,refund-callback-adv:24}.proof.ts` 头注对随 §3 终批 grep 豁免集原样有效）
- **binary-aware erratum 逐批登记**（蓝本非阻塞披露）：`qbank-generation-projection.ts` 与 `qbank-provider-input.ts` 含 NUL 字节（B2r 批文件）——本批残留/消费面抽查全部走 `git grep`（binary-aware），未用裸 rg。
- **消费面复盘（零涉登记）**：`packages/ai-graphs/src/index.ts:12-14` 的 `from './report.ts'` 为 ai-graphs 包内自有同名文件（不同包零涉）；ai-docs 历史文档内旧路径串不在 §3 终批 grep 路径集（docs 判留）；`manifest :227 paths:` 与 `:246` 描述文本判留（见 §1 ④）。
- **Pins 十一值照抄零翻转**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Stack=**PG-retained** · 公开 DELETE=**503**（stays） · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本批纯移动零模型调用零计费面）。

## 6. 环境与收尾观察

- runner 一次性容器批前批后各 2 只均被 finally `docker rm -f` 正常回收；`docker ps -a` 无本批新增残留（现存 46h 前他场旧容器 `meetwise-e2e-62497-cold2-stop-band-1-…` Exited(0) + 25h 前 exited 的 mysql/redis-local 三者均非本批产物，沿 B2a 不予处置）。
- receipt 靶观察面（§5 B2b 行 8 靶中 db-acl · uc019:report-regenerate 2 靶经本批 G3 直跑键复跑覆盖，sources 已解析新路径 `packages/db/src/report/report.ts` 且 receipt 产出正常 ENOENT=0；其余 6 靶批内必跑集合=∅（R5 口径），由 post 双审指令 + B2s 终批 117 靶 sweep 兜底）。
- G4：commit 后 `git status` 0 entries · push origin line/dir-b2-domain（交付报告承载）。

**B2b 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 · 红同形红 · receipt ENOENT=0 ×4）· 1 commit 1 收据 · 蓝本 §5 B2b 行状态由本收据承载推进（蓝本原文零改写）。**
