# B2e 批收据 — DIR-1 B2 domain 目录拆解刀（第 5/19 批）

**Batch**: B2e（§5 表 B2e 行：commerce/ 域 2 文件 + E6 残留面收口）· **EXEC**: mw-core · **Date**: 2026-10-07（worktree 时钟 2026-10-09）
**Blueprint**: `ai-docs/delivery/harness/dir-b2-domain.md` @ `1f08942a`（rev3 · pre_exec_dual BOTH PASS · 协调方 EXEC 授权面内机械执行）
**Base tip**: `e2834082` · **Worktree**: `meetwise-line-dirb2` · branch `line/dir-b2-domain`（前批 B2a @ `196c8984` · B2b @ `d41b7c41` · B2c @ `442b1af6` · B2d @ `bd426386`）
**Commit**: 本批一 commit（见交付报告 hash）· releaseEvidence=false · NOT_HA
**续作性质**：本批为**被配额中断批的续作**（前任席留 4 脏文件后中断 · 5/19）——处置=**续作非 reset**，判定依据见 §0.1。

---

## 0. 开批三查 + 漂移预检（fresh 亲跑）+ 脏面处置

### 0.1 中断脏面盘点与处置（收据 §0 承载）

`git status` 开席实测脏面 = **staged 2 mv + unstaged 3 文件**，与蓝图 §5 B2e 行逐项对表：

| # | 脏面 | 状态 | 白名单对表 | 处置 |
|---|------|------|-----------|------|
| 1 | `commerce.ts → commerce/commerce.ts`（staged rename） | 前任席落 | §2 落位表 commerce/ 行 ✓ | **保留续用** |
| 2 | `payment.ts → commerce/payment.ts`（staged rename + 内容 Δ1） | 前任席落 | §2 落位表 commerce/ 行 ✓ | **保留续用** |
| 3 | `payment.ts` Δ=1 行 `'./errors.ts'`→`'../errors.ts'` | 前任席落 | ①类 移动件自引锚改写 ✓（blob 直比亲证仅此一行） | **保留续用** |
| 4 | `index.ts` ×2 行 commerce 桶 specifier | 前任席落 | ②类 ✓ | **保留续用** |
| 5 | `db-money3.proof.ts` ×2 行 imports | 前任席落 | ①类 M3 本批切片 ✓（interview-event 行未动 = §5 B2e 行注记「→B2l 二段」吻合） | **保留续用** |

逐 hunk 亲核零批外面、零逻辑改 ⇒ **续作成立，未触发 reset**；余量（payment 桶对 · runner ③ · manifest ④ · api E6 面）由本席补齐（§1）。

### 0.2 通用律 0 三查 + 漂移预检（fresh 亲跑）

- **三查**：`git fetch origin` 后 HEAD 与 `origin/line/dir-b2-domain` **零分叉（0/0 · 双侧 tip `bd426386`）**；SOP 沿 B2a–B2d；W 线冻结序 + loop §3 冲突表零命中（SSE-PUSH/TOKSTREAM/隐私主线/r4 面零触，本批改动面见 §1）。
- **漂移预检（fresh 亲跑）**：B2b 起各批预警的 `origin/feat/mysql-schema-skeleton` 漂移面复跑——`git log e2834082..HEAD -- packages/db/src/recruiting/recruiter.ts packages/db/src/recruiter.ts` = **仅 `442b1af6`（B2c 本线自身 mv）一条**；`scripts/run-e2e-isolated.mjs` 自 base 以来的触史 = **仅 B2b/B2c/B2d 三批各自 ③ 类白名单 commit**（`git log` 亲证）——**已知 recruiter.ts 消化面无新增外来漂移，与本批面（commerce/payment 系）零交集** → 不停手，照常执行，本节登记。
- **漂移面扩判定**：B2d §3 移交关注「若 drift 扩至新文件即停手上报」——实测未扩，未触发。

## 1. 批内文件清单与 mv 证据（§5 B2e 行：commerce.ts(388行) · payment.ts(166行)）

| # | 移动 | 证据（`git diff --cached -M`） |
|---|------|-------------------------------|
| 1 | `packages/db/src/commerce.ts` → `packages/db/src/commerce/commerce.ts` | **`R100` = 纯移动零内容行**（blob 直比 `git cat-file` 亲证逐字节相同；RLS 内嵌 SQL 面——§4 `current_setting(`/`pgp_sym_encrypt` 七文件之一——本体字节不动亲证成立） |
| 2 | `packages/db/src/payment.ts` → `packages/db/src/commerce/payment.ts` | `R099` = R100 + **①类 1 行**（:5 `errCode` 锚 import `./errors.ts`→`../errors.ts`；blob 直比仅此一行 · 引号外逐字节相同） |

**白名单随批改（B2e 实面 · §3 四类对账 · staged 面 = 2 mv + 12 文件 · 43 引号内行对 + mv Δ1 = 44 内容行，零第八方）**：

- **① 包内 import（3 处）**：移动件自引 1（payment.ts:5 errors 锚 · 前任席）+ 消费件 db test 2（`db-money3.proof.ts:29` `'../src/payment.ts'`→`'../src/commerce/payment.ts'` · `:30` `'../src/commerce.ts'`→`'../src/commerce/commerce.ts'`——前任席落；`:31` interview-event 行**未动** = §5 B2e 行「interview-event→B2l 二段」原样保留）。commerce.ts inSRC=0 复核成立（全仓无指 commerce.ts 的包内 import 面）。
- **② 桶 re-export（4 处）**：`index.ts` commerce 对 2 行（前任席落）+ **payment 对 2 行（:290/:291，本席补齐**——前任席中断漏面 · M1 payment barrel=2 实面）specifier 加域前缀；tenant 2 行与全部导出名零改（`barrelTenantReexports===2` 断言面零触）。
- **③ runner receipt（26 处串/25 行 · 全在 isolatedReceiptSources :93–:1640 块内 · 块外零改）**：`'packages/db/src/commerce.ts'`→`'packages/db/src/commerce/commerce.ts'` ×22 行 + `'packages/db/src/payment.ts'`→`'packages/db/src/commerce/payment.ts'` ×4 行（:764 双串行）；`git diff -U0` 亲证 25 hunk 行号 108–1079 全在块内；**awk 靶映射与 §5 B2e 行吻合**（commerce 组靶含 db-money3/ocr/reaper/recruiter/uc001 四相/uc011/uc016/uc017/uc018/uc019/uc025 面 · payment 组靶 db-money3/uc011 三靶）；`node --check` PASS；改后 `grep -nE "packages/db/src/(commerce|payment)\.ts['\"]" runner` = **0 命中**。
- **④ 仓内机械串（11 行 + brace-glob 1 行）＝ E6 残留面收口 + manifest**：
  - `packages/db/test/uc-e2e-011-report-refund.proof.ts:200` `readRepo('packages/db/src/payment.ts')`→`'…/commerce/payment.ts'`（§5 B2e 行 E6 首点）；
  - **api 五文件七点**：`uc-e2e-001-nhp-{adv:75 · bound:72 · fault:92}`（readFileSync commerce）· `uc-e2e-011-adv-refund-callback{ :80 readRepo · :296 依据串}` · `uc-e2e-011-refund-callback-adv{ :182 fileURLToPath · :191 INV 断言串 · :461 依据串}` · `uc-e2e-011-report-refund-http:286`（readRepo）· `uc-e2e-014-026-webhook-adv:284`（依据串）——与 §5 B2e 行 E6 列逐点 1:1；
  - `tenant-wiring.manifest.ts:245` RESIDUAL_PATHS brace-glob 逐元素加域前缀：`report/report,payment,commerce,`→`report/report,commerce/payment,commerce/commerce,`（保序逐元素 · B2b/B2c 同判）；`file:` 实值六处零涉本批（:139/:221 为 `apps/api/src/modules/commerce/*` 服务层路径非 db 件，零改）。
- **引号外零改亲证**：12 文件 ×43 行对逐行 quote-stripped 逐字节比对 = **0 违例**（python 逐行对脚本亲跑 · 全文件行数零变）；`git diff --quiet pnpm-lock.yaml` PASS。

## 2. 门禁 EXIT 原值（批前实测基线 → 批后对表 · E5 口径 · 零 retry-to-green）

环境准备（非行为变更）：`pnpm install --frozen-lockfile`（node_modules 在树 · lockfile 零改）· `meetwise-postgres-dev` Up healthy（5h+）。`.env` ABSENT 盘上亲证。批前基线于 stash 脏面后的净树 @ `bd426386` fresh 亲跑。

| 门 | 键 | 批前基线（净树亲测） | 批后 | 对表 |
|----|----|---------|------|------|
| G0 | `git diff --cached -M` | — | R100+R099 rename 检出 · blob 直比 Δ=0/Δ=1（全 ①类）· 43 行对 quote-stripped 逐字节相同 · `node --check` PASS · runner 残留 grep=0 · 全仓旧路径串仅剩 S1 登记三处 + migrations Ban 区两处 · 25 hunk 全在 :93–:1640 · lockfile 零改 | 全过 |
| G1 | `e2e-platform:check` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-platform:layout:prove` | EXIT=0 | EXIT=0 | 同形 |
| G1 | `e2e-static-guards:check` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-static-guards:prove` | EXIT=0 | EXIT=0 | 输出逐字节相同 |
| G1 | `e2e-parity:check` | **EXIT=1（base 红）** | **EXIT=1** | **同形红：输出逐字节相同**（e2e_parity_inventory invalid · e2e/ 树零触） |
| G2 | tsc `packages/db` | EXIT=2 · sha256=`f7c970b09cebcc3c7189e03ebbd8904271ea9f19b1495cdcd224d9c498deeb9b` | 同 sha | 错误集逐字节 ≡ 基线（≡ B2a/B2b/B2c/B2d 记录 · **五批连续**；基线错误集零 commerce/payment 路径提及亲证 grep=0，sha 无位移面） |
| G2 | tsc `apps/api` | EXIT=2 · sha256=`196049ecca4c56b71766ff9df7c439526abc8a3941e57a5ae2bd2761d91b4242` | 同 sha | 同形（五批连续） |
| G2 | tsc `apps/worker` | EXIT=2 · sha256=`6dae8b2dbca59169c64d9376e1999ef9fdbe0a6cb2ec1070851ddca1bfb32830` | 同 sha | 同形（五批连续） |
| G3 | `commerce`（直跑键 · 经唯一合法隔离入口 runner `commerce:prove:raw`） | EXIT=0 | EXIT=0 | **绿保持绿**：规范化（容器名/端口/时间戳 uuid）后 PASS 序列逐行相同（50 行序） |
| G3 | `prove:db-money3`（直跑键 · 经 runner `db-money3:prove:raw`） | **EXIT=1（批前实测 base 红 · 原值登记）** | **EXIT=1** | **同形红**：规范化 PASS/FAIL 序列逐行相同（38 行序）——FAIL 面 = P3-2/P3-4（22003 落点链/兜底闭环）· P5-1（fixture uq_event_key drift）· P6-1/P6-3（语句白名单/零 ALTER TYPE）＝sql fixture/约束族，与 commerce/payment 路径面零关；§5 B2e 行未预标红候选，按 §0.1-3「以批前实测为准」登记红原值不洗 |
| G3 | `prove:uc011-report-refund`（直跑键 · 经 runner `uc011:report-refund:prove:raw`） | EXIT=0 | EXIT=0 | 绿保持绿：规范化同形（34 行序；本 proof 含 :200 readRepo ④ 改点 ⇒ 该键同批亲验改点正确性） |
| G3 | `prove:uc019-report-regenerate`（直跑键 · 经 runner `uc019:report-regenerate:prove:raw`） | EXIT=0 | EXIT=0 | 绿保持绿：规范化同形（26 行序） |
| G3 | receipt ENOENT 观察 | runner 四靶 `LOCAL_ISOLATED_PROOF_RECEIPT` 各产出 1 只（pre `…T16-32-25…`/`…16-32-32…`/`…16-32-38…`/`…16-32-44…`） | 各产出 1 只（post `…T16-37-59…`/`…16-38-06…`/`…16-38-12…`/`…16-38-19…`） | **ENOENT=0 双向成立（8/8 产出正常 · release_evidence=false 标注一致）；post 4 只 sourceDigests 键亲证解析新路径 `packages/db/src/commerce/commerce.ts`（4/4）· `packages/db/src/commerce/payment.ts`（db-money3/uc011 靶）——③ 类改写正确性机械证据 · E4 反面教训闭环** |

**attempts 全账（Ban retry-to-green）**：批前批后各一轮、逐键一次完成（runner 4 靶 ×2 = 8 次计入对表，非重试）；db-money3 基红同形不追绿，零重跑。

## 3. Base 漂移处置结果

见 §0.2：漂移预检 fresh 亲跑 = recruiter.ts 消化面仅 B2c 本线自身 mv、runner 触史仅 B2b–B2d 白名单 commit，**零外来漂移零交集** → 未触发停手红线。中断脏面处置见 §0.1（续作 · 零 reset）。

## 4. 停止条件核查（沿 B2a–B2d a–e）

| 条件 | 核查 | 结果 |
|------|------|------|
| a) 落位与 §2 映射冲突 | §2 commerce/：commerce · payment 两件 → `commerce/<名>.ts` 实落 | 未命中 |
| b) 门红非预登记 base 红族 | 红（parity · tsc×3 · db-money3）均为批前实测原值且批后同形（parity/tsc 逐字节同 · db-money3 规范化序列逐行同） | 未命中 |
| c) 需触批外文件 | 改动面 = 2 mv + 12 文件白名单行（index.ts/runner/manifest/api 七 proof/db 两 proof 均为 §5 B2e 行 + §1.2 M3/M4 登记面）；staged 面亲证 14 条目无第八方 | 未命中 |
| d) 漂移预检红线 | §0.2 零外来漂移（recruiter.ts 消化面=B2c 自身） | 未命中 |
| e) 环境 ANY 串改逻辑 | 全部改动 = mv + 引号串内路径前缀（43 行对 quote-stripped 逐字节亲证 + mv blob 直比 Δ=0/Δ=1） | 未命中 |

## 5. Ban 纪律登记

- **Ban 7**：`.env` ABSENT（盘上亲证）· MODEL_API_KEY/MODEL_BASE_URL 每次 prove/runner/tsc 调用均 `env -u` 剥离 · Key name-only 零打印零落盘 · est 0 live 模型调用。
- **Ban 2 锚区**：7 锚 + tenant/ 零触（index.ts 仅 :72/:76/:290/:291 四 specifier 行 · payment.ts:5 为移动件自身 import 前缀改，errors.ts 锚本体零触）· **migrations/** 零触**（0018/0145 两处散文串判留见下）** · e2e/ 树零触 · G7 面零触（runner 数组内 db 串除外）。
- **Ban 3**：runner 仅 isolatedReceiptSources 块内 26 串/25 行改写（25 hunk 行号 108–1079 全在 :93–:1640 · `git diff -U0` 亲证）；target 名/数组结构/命令 map（:1734 commerce 命令映射亲证未触）/块外零改。
- **Ban 6**：零 shim/转发层。
- **Ban 10 S1 判留八处复述登记**（本批零新增位置位移——commerce/payment 不在八处清单；本批**新增判留登记两处**）：
  1. `packages/db/src/int-transcript.ts:7`（已随 B2d 位移 `transcript/int-transcript.ts:7` · 承 B2d）
  2. `packages/db/test/db-acl.proof.ts:267` · 3. `:490`
  4. `packages/db/test/qbank-source.proof.ts:2`
  5. `packages/domain/src/qbank-route-scope-cache.ts:16`
  6. `packages/domain/src/qbank-track-local-retrieval.ts:13`
  7. `packages/qdrant-store/src/product-vectorstore-bridge.ts:5/:9`
  8. `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts:19` 头注（本批 :284 机械点已改 · :19 头注判留原样）
  - **新增判留两处（migrations 散文 · Ban 区零触判留）**：`packages/db/migrations/0018_payment_order_idempotency.sql:4`（注释散文提 `packages/db/src/payment.ts`）· `packages/db/migrations/0145_dead_table_jsonb_deprecate.sql:23`（注释散文提 `packages/db/src/commerce.ts:48`）——S1 同型散文非 import 非机械串，migrations 硬 Ban 区零触，由本收据承载登记，不入终批 grep 豁免集以外处置（B2s 收口时按 §3 豁免集口径对表）。
  - **api 头注判留两处（八处清单内 · 本批复述）**：`uc-e2e-011-adv-refund-callback.proof.ts:15` · `uc-e2e-011-refund-callback-adv.proof.ts:24` 头注旧路径串判留（改则须批 REQUEST 单列 · 本批零触）。
- **binary-aware erratum 逐批登记**（蓝本非阻塞披露）：`qbank-generation-projection.ts` 与 `qbank-provider-input.ts` 含 NUL 字节（B2r 批文件）——本批残留/消费面抽查全部走 `git grep`（binary-aware），未用裸 rg。
- **消费面复盘（零涉登记）**：`commerce-saga.proof.ts` 经桶引（`../src/index.ts` · M3 零改类亲证）；qdrant-store/conn-stack/apps worker/domain 对 commerce/payment 零机械串命中（`git grep` 亲证 · §1.1 ext 列为裸主题名/靶名消费非路径串）；ai-docs 历史文档旧路径串不在 §3 终批 grep 路径集（docs 判留）；manifest :223/:246 `reason:`/`paths:` 描述散文串零触判留（B2b/B2c 同判非机械面）。
- **Pins 十一值照抄零翻转**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Stack=**PG-retained** · 公开 DELETE=**503**（stays） · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本批纯移动零模型调用零计费面）。

## 6. 环境与收尾观察

- runner 一次性容器批前批后各 4 只均被 finally `docker rm -f` 正常回收；`docker ps -a` 无本批新增残留（现存旧容器 `meetwise-e2e-62497-cold2-stop-band-1-…` Exited(0) 沿 B2b/B2d 登记不予处置 · mysql/redis local Exited(255) 他场不涉）。
- receipt 靶观察面（§5 B2e 行 commerce 23 靶 + payment 4 靶中 4 靶 = commerce · db-money3 · uc011:report-refund · uc019:report-regenerate 经本批 runner 复跑覆盖，sources 已解析新路径且 receipt 产出正常 ENOENT=0；其余靶批内必跑集合=∅（R5 口径），由 post 双审指令 + B2s 终批 117 靶 sweep 兜底）。
- G4：commit 后 `git status` 0 entries · push origin line/dir-b2-domain（交付报告承载）。

**B2e 收口判定：G0/G1/G2/G3 全对表通过（绿保持绿 · 红同形红 · receipt ENOENT=0 ×8 · sourceDigests 新路径亲证）· 1 commit 1 收据 · 中断脏面续作零 reset · E6 残留面七点 1:1 收口 · 蓝本 §5 B2e 行状态由本收据承载推进（蓝本原文零改写）。**
