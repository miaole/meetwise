# REQUEST — **INT-TRANSCRIPT-01 生产 cutover 立卷合同（MOP03 六门先例）** · pre-exec · `mw-privacy-int`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-privacy-int`
**Knife**: `harness/gap-int-transcript-01-cutover-contract.md` · `gap-int-transcript-01-cutover-contract.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `313e04a7` / `313e04a7fc0ca91ef60fb229802dd374f85cc93d`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-gap-int-transcript-01-cutover-contract-mw-e2e-ha.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

## Pins（原值全抄 · retained 写死）

| Pin | 值 |
|-----|-----|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503**（冻结 · GAP-PRIV-02 `:58`） |
| backlog `:60` GAP-PRIV-04 | **OPEN**（本地行级证据 ≠ close · Qdrant 未登记为可证明擦除 sink） |
| backlog `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION | **OPEN**（stub≠cloud · `cloudVendorDeleted=false` · NB-3） |
| UC-052 | **partial**（≠ covered ≠ INT-TRANSCRIPT-01） |
| INT-TRANSCRIPT-01 | **blocked**（checklist `:173`「这**不**授权 `INT-TRANSCRIPT-01` 生产 cutover」· `:169`「00 不授权 01 生产写入」） |
| `INT-P0-RAW-QUEUE` | **open**（legacy `/turn` plaintext payload 不可洗） |
| 七类 TC | **planned/unmapped** |
| PG LISTEN / Redis | unchanged（**无关本刀** · MOP03 面保留口径） |
| coveredCount 扩面 | **无**（本刀零 matrix edit · covered 不动） |

## Scope（待审 · privacy 视角）

docs-only REQUEST：把 INT-TRANSCRIPT-01 生产 cutover 的授权口径立卷为六门准入合同（harness §2b）。待审要点：**立卷≠授权**（checklist `:173`/`:169` 硬钉 · Ban 预授权六门任一 · Ban cutover-ready claim）· 六门判据可执行性（① 0091 生产级 issuer key 管理与轮换 + JWS 验签落地 ② 外部 sink 逐个 real-delete 证据 = `:64` 关闭前提 · Ban stub/`external_confirmed`（NB-3）顶替（D2）③ INT 向量 sink 作用域键 + Qdrant 登记 + `0091` receipt 对齐 ④ 公开 DELETE 503→真删除开关合同（issuer/lease + 逐 sink receipt + 删后 read=0）+ 独立审 ⑤ 公平重放/幂等（同 key 同体回放 / 异体冲突 / 双 tab 一 winner · 真实组合根）⑥ BUG-REV-COND 四专家审不降级、名单留 AUTHORIZE（D3））· §2b-0 两道 checklist `:176` 不可拆 release gate + dual-write 切换图切断明文前提 · §2c 现状诚实清单逐条 checklist 原文（0129 preview 盘点面回执固定未完成 · `releaseEvidence=false` · `INT-P0-RAW-QUEUE` · 七类 TC planned/unmapped · UC-052 partial · 0091 无验签/worker 走 0077/HTTP 未接线）· EXIT 契约（attempts 全录 · Ban retry-to-green `:68` 先例 · 远程 Postgres · Ban `pnpm db:up`）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · Ban `pnpm db:up` · **Ban 预授权六门任一** · **Ban 宣称 cutover ready** · Ban 把立卷写成授权 · Ban INT-TRANSCRIPT-01 flip/blocked 摘除 · Ban 公开 DELETE 开放（503 冻结）· Ban 0129 preview 回执写成完成 · Ban rehearsal purge 称删除闭环 · Ban `:58`/`:60`/`:64` flip · Ban UC-052 covered flip · Ban coveredCount 变动 · Ban SSOT edit · Ban `INT-P0-RAW-QUEUE` 洗白 · Ban 七类 TC 映射/翻行 · Ban vendor 证据以 stub/`external_confirmed`/docs 自述顶替（D2）· Ban 四专家审降级/代指派（D3）· Ban PG LISTEN/Redis 改动 · Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push · Ban self-approve（alone ≠ dual）

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual review — `mw-privacy-int`（2026-10-07 · docs gate only · 单侧 · alone ≠ dual）

**Reviewed**: origin tip `6b61b734` 上被审 REQUEST = `c173ee0f`（与派单 sha `397f3ec` 同 parent `313e04a7`、`git diff` 0 行 / tree 逐字节全等的 patch 全等双胞胎 · 已验为 tip 祖先 · 内容按 `c173ee0f` 审）。docs-only 已验：仅 4 个新增 .md（slice / harness / 双 stub）· 286 insertions / 0 deletions · 零产品码 / migrations / scripts / `package.json` / SSOT（backlog / matrix / checklist）触碰。
**Method**: 独立 worktree `rv/int01-privacy-int`（base `origin/feat/mysql-schema-skeleton` = `6b61b734`）· SSOT 原文只读逐行核（checklist `:154`/`:167`/`:169`/`:173`/`:175`/`:176`/`:67`/`:1181` · backlog `:58`/`:59`/`:60`/`:64`/`:68`/`:100` · queue `:31-32` · cutover 图 `:30` · MOP03 successor §2b 先例）· 零执行 / 零容器 / 零远程 / 零 `.env*`。

### 审查表

| # | 维度 | 结果 | 证据（只读核验） |
|---|------|------|------|
| R1 | docs-only + 零 SSOT | PASS | `git diff-tree`：仅 slice / harness / 双 stub 4 个新 .md；backlog/matrix/checklist 零改（nail 阶段才登记口径保持） |
| R2 | 立卷≠授权写死 | PASS | harness §1「不满足其中任何一门、不启动任何一门、不豁免任何一道既有 gate」+ §2b「本合同不预授权任何一门，也不因任何单门提前达标而宣布 cutover ready」+ §7 Ban + §8 Non-claims + stub/slice Ban「Ban 预授权六门任一 / Ban 宣称 cutover ready」；checklist `:173`「这**不**授权…」/`:169`「00 不授权 01 生产写入」原样只读引用零改写 |
| R3 | §2b-0 两道 release gate 不可拆保留 | PASS | 0a/0b 逐字镜像 checklist `:176`（00 验证授权/删除合同 + **同一部署迁移** target resolver/deletion ledger/逐 sink receipt/删后 read=0 + 真实 HTTP/SSE/RLS 组合根）·标注「非门、缺一即止」·0b 明写 rehearsal/预览账本/test-only ≠ 该证明·0c 按切换图切断 legacy `/turn` 明文 + `INT-P0-RAW-QUEUE` 关闭须按图另证、Ban 文字洗白 |
| R4 | 六门判据与 SSOT 原文对齐 | PASS | 门1 `:167`/`:169`（非 `AUTH_SECRET`/部署级轮换逐次证据/JWS 验签在真实组合根生效——`:173`「本身不做 JWS 验签」如实为现状锚）；门2 backlog `:64` 逐字核（「stays OPEN until real cloud vendor evidence」「Ban close via docs/stub」「`external_confirmed` ≠ vendor data deleted（NB-3）」「stub≠cloud · cloudVendorDeleted=false」全在案）；门3 `:60` acceptance 逐字（「删后 **recall=0** + **逐 sink receipt** **对齐 0091 ledger**」）；门4 `:58` acceptance 逐字（issuer/lease + 逐 sink receipt + 删后 read=0 · 独立 prove + 专家审批准前不得放开 · 503 冻结 · 单一开关 Ban 多入口绕行 · 0129 `preview_incomplete` 直至合同满足）；门5 `:176` 三项逐字 + `:175`「公开预览下 OCR 组合根仍关」预览级不得顶替；门6 `:100` 逐字（「切流前 ADR 隐私 prove 清单全绿 + 四专家审；禁止自批」） |
| R5 | 现状诚实清单 13 条逐字对齐 | PASS | H1-H13 逐条核验：preview 盘点面回执**固定未完成**（`:173`）· preview `/answers` 受控写非预览 404 不入 apiContract（`:175`）· 公开 DELETE=503（`:58`+`:154`+`:173`）· legacy `/turn` plaintext = `INT-P0-RAW-QUEUE` 不可洗（`:173`「必须如实保留…不可被文字误称为已停用」+ cutover 图 `:30`「TurnDto **明文 `answer`**…`INT-P0-RAW-QUEUE` 仍 open」）· 七类 TC planned/unmapped（`:173`/`:154`）· UC-052 deletion=partial ≠ covered（`:173`）· 0091 无验签/worker 走 0077/HTTP 未接线（`:173`）· `:64` OPEN stub≠cloud · `:60` ≠ close（`:1181` EXIT0 ≠ 链逐字）· 远程 Postgres Ban `pnpm db:up`（`:173`/`:175`）· checkpoint 恢复面有限（`:167`）· 0092/0096 rehearsal ≠ 公开 write route（`:169`）——无一条洗白 |
| R6 | DELETE=503 / UC-052 / PRIV4 no-target 衔接诚实 | PASS | 503 freeze 写死（H4+门4+Pins）· UC-052 stays partial ≠ covered ≠ 01（H7+Pins）· 门3 明确定位为 PRIV4 刀 INT sink='vector' no-target 的后续（作用域键成文 + Qdrant 登记对齐 `:60` acceptance）· `:60` stays OPEN |
| R7 | Pins 原值三处一致 | PASS | haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `:60`/`:64` OPEN · UC-052 partial · 01 blocked · `INT-P0-RAW-QUEUE` open · 七类 TC planned/unmapped · PG LISTEN/Redis unchanged——与 checklist `:173`「Pins retained: …」行及 backlog 原值逐一相符；harness §6 / slice / stub 三处零漂移 |
| R8 | EXIT 契约 | PASS | attempts 全录（PRIV4 #1 EXIT=1 / #2 EXIT=0 先例）· 诚实失败原样入账 · **Ban retry-to-green**（backlog `:68` mitigated/cause-unknown 先例核实）· 单次 attempt 窗口预声明、重跑须新 REQUEST + 双审 · 远程 Postgres 环境变量 · Ban `pnpm db:up` · EXIT0 ≠ 长清单（ready/六门任一/01 解禁/DELETE 开放/`:60`/`:64` closed/UC-052 covered/HA/releaseEvidence=true/suite green） |
| R9 | Ban 面完备 | PASS | Ban 列表覆盖 coding/prove/live/`db:up`/预授权六门/ready/立卷写成授权/01 flip/DELETE 开放/preview 完成化/rehearsal 闭环/`:58`·`:60`·`:64` flip/UC-052 flip/coveredCount/SSOT edit/`INT-P0-RAW-QUEUE` 洗白/TC 翻行/vendor 顶替（D2）/四专家降级（D3）/PG LISTEN·Redis/sibling AN/secrets/`.env*`/Meridian/buy cloud/force-push/push/self-approve |
| R10 | alone ≠ dual / peer 不代签 | PASS | `reviews/…-mw-e2e-ha.md` 保持 PENDING、末行 STOP · 本审未触碰 peer 文件 · 本文件仅为双审之一侧 |

### D1–D3 裁决（mw-privacy-int 单侧裁决）

- **D1（六门不加不减）→ ACCEPT**：六门判据均可执行且与派单、checklist/backlog 原文对齐；不并入 GAP-PRIV-01 tenant≠RLS、不并入 SCOR-01/02 评分面；若任一侧双审判须增删门，须显式改写本合同并另走双审——支持该口径。
- **D2（vendor 证据形态留白）→ ACCEPT（自洽）**：证据**形态**（vendor 控制台回执 / console-cited actual / 工单级确认）留给未来 cutover REQUEST 自定义 + 双审，而**顶替禁令写死**（Ban local_isolated_stub、Ban `external_confirmed` NB-3、Ban docs 自述）且 `:64` flip 保留给协调方 nail 阶段、本合同 Ban 自行 flip——「形态可留白、顶替禁入」与 NB-3 / `:64` honesty 底线不冲突，属合法留白而非豁免。
- **D3（四专家名单留 AUTHORIZE）→ ACCEPT**：backlog `:100` 原文确未列名单；「不降级（≥ mw-privacy-int + mw-e2e-ha 再加两席）+ 名单由协调方 AUTHORIZE 时指派 + Ban 代指派 + Ban 把四专家审降为双审即切」是忠实保守读法；harness 门 6 现状锚明写「当前未见四专家审记录在案（本刀双审只是 REQUEST 级 docs gate，**不是**门 6）」——诚实。

### Fail-trigger audit（逐项查 · 全部未触发）

预授权任何一门 ✗ · cutover-ready 叙事 ✗ · 立卷写成授权 ✗ · 01 blocked 摘除 ✗ · SSOT edit ✗ · preview 回执完成化 ✗ · rehearsal purge 称闭环 ✗ · `INT-P0-RAW-QUEUE` 洗白 ✗ · 七类 TC 翻行 ✗ · `:58`/`:60`/`:64` flip ✗ · UC-052 covered flip ✗ · coveredCount 变动 ✗ · DELETE 503 开放 ✗ · vendor stub/NB-3 顶替入判据 ✗ · 四专家审降级/代指派 ✗ · 非 docs 文件触碰 ✗ · secrets/`.env*` ✗ · peer 代签 ✗ · push ✗

### Blockers

无。

### Conditions

- **C-1（事实修正 · 不阻 Verdict）**：harness §4 表与 slice 将 `pnpm mem00-int00:prove-path`（#103）标为「已存在」——在被审 base `6b61b734` 上该脚本不在任何 package.json；backlog `:24`/`:45` 记 #103 为 **INFLIGHT** PR（`chore/mem00-int00-prove-path`），未合入 `feat/mysql-schema-skeleton`。本刀零执行、仅 named-not-run 故不阻 Verdict；nail 阶段须把该格改注为「属 #103 INFLIGHT、合入后方可称已存在」，未来任何引用前须在承载分支复核。
- **C-2（引用纪律）**：本 PASS 仅为 REQUEST 级 docs gate 双审之一侧；不得被引用为六门任一达标、cutover ready、01 解禁或 DELETE 开放；六门裁决一律发生在未来独立 cutover REQUEST（每门独立审、独立证据、任一门不过即整体不可授权）+ 协调方 AUTHORIZE。
- **C-3（sha 记账）**：origin tip 上被审 REQUEST 实际为 `c173ee0f`（派单 sha `397f3ec` 的 patch 全等双胞胎 · 同 parent `313e04a7` · tree 全等）；后续 nail/dual 记账请钉实际祖先 sha。

### 中文三行摘要

1. 立卷≠授权已写死：六门 + §2b-0 两道不可拆 release gate + 0c 切断明文全部逐字对齐 checklist `:176`/`:173`/`:169` 与 backlog `:58`/`:60`/`:64` 原文，Ban 预授权/Ban cutover-ready 贯穿 harness、slice、stub 三处，INT-TRANSCRIPT-01 保持 blocked。
2. 现状诚实清单 13 条与 SSOT 逐字相符：preview 回执固定未完成、legacy `/turn` plaintext（`INT-P0-RAW-QUEUE` 不可洗）、UC-052 partial、`releaseEvidence=false`、0091 无验签/worker 走 0077/HTTP 未接线均如实保留；Pins 原值三处零漂移。
3. D1/D2/D3 均 ACCEPT（D2 形态留白与 NB-3 顶替禁令自洽）；唯一修正项 C-1（#103 prove 脚本在本 base 未合入，「已存在」表注不准）不阻 Verdict；单侧 PASS，mw-e2e-ha 侧不代签，alone ≠ dual，执行仍须 PRE BOTH PASS + 协调方 AUTHORIZE。

Verdict: PASS
