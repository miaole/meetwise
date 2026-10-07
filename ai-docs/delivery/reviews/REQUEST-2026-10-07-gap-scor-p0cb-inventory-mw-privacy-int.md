# REQUEST — **Line SCOR · Phase 7 产品诚实首刀 · GAP-PROD-01 `:77`（SCOR）+ GAP-PROD-02 `:78`（P0-CB）盘点立卷** · pre-exec · `mw-privacy-int`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503（W3 freeze remains）
**Expert**: `mw-privacy-int`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-scor-p0cb-inventory.md` · slice `gap-scor-p0cb-inventory.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `313e04a7` / `313e04a7fc0ca91ef60fb229802dd374f85cc93d`（origin tip · fetch 后 ff · 开工时点最新；网络受限下 fetch 4 次失败但 origin-tracking 已在此 tip，预期 ≥`313e04a7` 达成）
**Date**: 2026-10-07
**Line**: **SCOR**（queue Phase 7 product：「SCOR then P0-CB」· 盘点立卷刀）
**选审理由（按域判）**: backlog `:77` GAP-PROD-01 归属域原文 **product / privacy**——SCOR-01/02 生产实现唯一 P0 前置 = INT-TRANSCRIPT-00/01（privacy fact root · canonical artifact + 0091 授权 + 0096 逐 sink receipt · checklist `:194`），ScoreCard 面 fence 绑定 `assert_interview_answer_fact_active`/`assert_interview_privacy_active`（mig `0100` 头注）与 **W3 DELETE=503 freeze**（W6 hard dependency）属 privacy 域裁决权；GAP-PROD-02 的 **P0-CB-02 同意/撤回面**（ShareGrant/expiry/在途 `terminated_consent`/全数据面清理）同属 privacy 域。mw-model-op 对 SCOR-03/04 的 MODEL-OP 面在本刀仅为 ADR-0020/checklist 原文转述、无裁决负担——**S-SCOR-3 实现切片届时换入 mw-model-op 第一顺位**（harness §2c 写死）。

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（W3 freeze remains · Ban open DELETE · Ban forge erasure closed） |
| GAP-PROD-01 `:77` | **OPEN**（本 commit 零 SSOT 编辑 · Ban close via docs alone） |
| GAP-PROD-02 `:78` | **OPEN**（同上） |
| INT-TRANSCRIPT-00/01 | **◐ / blocked**（SCOR-01/02 生产前置 · 本刀零触碰该前置面） |
| B 端数值 | 暂停保持（`assessment_unavailable`/score=NULL） |
| Order | **SCOR then P0-CB** 写死 · P0-CB-01→02→03 内序 |

## 请审什么（mw-privacy-int）

docs-only 盘点立卷（零实现）四面（详见 peer stub Scope 与 harness §2）：(a) SCOR 现状诚实清单 §2a——**privacy 焦点：SCOR 生产前置 INT-TRANSCRIPT-00 ◐ / 01 blocked 的判定（checklist `:167`/`:173`/`:176`/`:194`）· ScoreCard fence 复用 0091/0096 不重实现删除根（mig `0100` 头注 · `scoring-fact-root.ts`）· DELETE=503 freeze 继承写死**；(b) P0-CB 现状诚实清单 §2b——**privacy 焦点：P0-CB-02 同意边界零实现（ShareGrant 全仓 0 hit）· 撤回/在途终止与隐私线联动边界**；(c) 修复切片定义 §2c（S-SCOR-0 前置门 + S-CB-2 隐私联动的范围表述是否诚实、不越权认领隐私线队列）；(d) 顺序写死 §3 + D1-D5 裁决点（D3 SCOR 前置判定为 privacy 焦点生死点之一）。

## 裁决点（expert 裁量 · 摘）

- **D3（privacy 焦点）**：INT-TRANSCRIPT-00 ◐ / 01 blocked → SCOR-01/02 生产前置不满足；树上的存储侧/隔离证明（`scor-01/02/03.proof.ts`）与 fence 复用声明不构成前置闭合、不得被读成隐私根已闭合。
- **D1（生死点）**：P0-CB-01 绑定基底 tip 已实存 vs backlog `:78` 原文——implementer 读法（行 OPEN 不变 · 盘点按 tip 实况 · 缺口重心=验收证据面）与收窄逃生门是否成立。
- **D2**：「SCOR then P0-CB」盘点序读法 + 实现序写死是否等价成立。**D4**：audit stale 双登记不改写 audit 文档是否成立。**D5**：本席按域选入替代默认 mw-model-op 是否成立。

本 stub 未跑 prove、未改产品码、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual review — `mw-privacy-int`（privacy/INT 前置焦点 · docs gate only）

**审席**：`mw-privacy-int` · 独立 worktree `rv/scor-privacy-int` @origin tip `9f399f55` · **alone ≠ dual · 不代签 peer `mw-e2e-ha`**（peer stub 仍 empty awaiting，dual 由两席各自独立签 · 协调方落链）。
**被审 REQUEST**：line `895f5ec8`（parent `313e04a7`）≡ origin 镜像 `6b61b734`（parent `786a1949`）——`git diff|git patch-id --stable` 双侧亲算全等 **`28d2806a575851758fc79172384cd4da99ff1487`** · 镜像祖先于 origin tip `9f399f55` 亲证（`merge-base --is-ancestor` OK · 本 worktree HEAD 即含被审内容）。
**docs-only 机检**：恰 4 个新 md（slice 49 / harness 166 / peer stub 49 / 本 stub 43）+307/−0 · `git diff --name-only | grep -v '\.md$'` 空 · 全部 `^ai-docs/` · **零产品码 · 零迁移 · 零 package.json · 零 SSOT（backlog/matrix/checklist/queue/audit 本刀零触碰）机检亲证** · 零 prove run · 零 coding · 未读 `.env*`。

### 检查表（逐项独立机检 @本 worktree）

| # | 项 | 证据（本席亲算） | 判 |
|---|----|------------------|----|
| 1 | backlog `:77`/`:78`/`:103` 原文只读引用零改写 | harness §0 引文与本 worktree `gap-bug-backlog.md:77/:78/:103` 逐字一致 · 表头 `:55` 同位 | ✅ |
| 2 | queue `:43-44`「## Phase 7 product / SCOR then P0-CB」 | 实读两行逐字一致 | ✅ |
| 3 | checklist `:167`/`:173`（00 ◐：无 JWS 验签·无组合根回执·DELETE 503）·`:174`（0126 fence≠01）·`:176`（01 blocked）·`:194`（SCOR-01/02 生产实现明确依赖 INT-TRANSCRIPT-00/01 真实组合根）·`:198-209`（00/00H [x]·SCOR-01…08 全 [ ]） | 实读逐行命中 | ✅ |
| 4 | matrix `:201` SCOR-00 **partial** · `:234` GAP-PROD-02 **partial**「单链路有；三主体矩阵进 CI 仍缺」 | 实读命中 | ✅ |
| 5 | mig `0100` 头注：「不接任何生产写路径」+ 删除授权**复用冻结 0091 issuer + 0096 sink receipt** + fence 重验 `assert_interview_answer_fact_active`+`assert_interview_privacy_active` | `0100_scoring_fact_root.sql:7/:17-19` 实读 | ✅ |
| 6 | `asScoringWorkerPrincipal`（`scoring-fact-root.ts:25`）·`refuseMappedBSideScore`（domain `scoring-honesty.ts:126`）·`listScorableScoreCards`（`scoring-aggregation.ts:96`，读面仍含 `practice_eligible`/`b_review_eligible` 未收窄）·消费者 `interview.service.ts:728/:750`·`worker main.ts:160` | 逐一实读命中 | ✅ |
| 7 | `scor-01/02/03.proof.ts` 在树（隔离证明≠生产组合根）·`recruiting-bound.spec.ts`·`InterviewPanel.tsx`·web finalize route 在位 | `ls` 亲证 | ✅ |
| 8 | ADR-0020 status=**proposed**；W6 harness 内序 pin「P0-CB-01→02→03」+ DELETE=503 freeze +「SCOR depends on INT-TRANSCRIPT fact root」，且 W6 **未钉**两域间序（本刀增量 (iii) 如实） | W6 `:10/:21/:23/:60` 实读 | ✅ |
| 9 | D1 基底：mig `0028` 双 partial UNIQUE（`uq_interview_application_binding`/`uq_job_application_interview_binding`）+ CHECK 三件套 + FK；`recruiter.ts:354` `startApplicationInterview` `FOR UPDATE` 行锁 + `interview_ineligible_route` fail-closed（`:348/:396`）；`applications.service.ts:35` start→interviewId+redirectTo `:55-56`、`:66-70` finalize 注释「**不接受客户端 interviewId**。DB 会验证 application↔interview↔job↔resume↔owner」 | SQL+TS 逐锚实读 | ✅ |
| 10 | P0-CB-02 零实现：`git grep -i 'sharegrant\|share_grant'` **产品码 0 hit**（非 ai-docs 全域空）·consent 面仅 0093/0095/0105/0107 隐私治理 mig | 机检亲证（见 C-I-1 范围注记） | ✅ |
| 11 | 验收证据面零代码：`candidateevaluation|evaluation_snapshot` 非 ai-docs **0 hit** | 机检亲证 | ✅ |
| 12 | named proves 实位：`package.json:194`（recruiter:prove）·`:98`（neg:bend）·`:273`（openapi:prove）·`:396-398`（scor-00 三 prove）·本刀零执行零新增脚本 | 实读逐行命中 | ✅ |
| 13 | Pins 原值零漂移：NOT_HA / releaseEvidence=false / claimProductionHA=false / gR45Closed=true / coveredCount=8 / ms3EqualsR4Closed=false / PG-retained / DELETE=503 / `:77` OPEN / `:78` OPEN / `:103` 同列 / SCOR-00 partial / GAP-PROD-02 partial / B 端暂停保持 / INT-01 blocked | stub/harness/slice 三件交叉实读 | ✅ |
| 14 | 边界不借：backlog `:58-:64` 隐私行（GAP-PRIV-02/03/04 等）在本刀四件工件中零引用零借用；UC-052 仅按 checklist `:173` 原义 **partial ≠ covered**，未被借为删除已闭环 | grep 机检 0 hit | ✅ |
| 15 | stale audit 双登记不改写：audit 文档（`requirements/use-cases/product-readiness-c-b-audit.md`，其 `:59`「start 不创建 Interview」/`:84`「finalize 接受任意本人 interviewId」三条现状证据在 tip 已被 #9 实况 superseded）本刀零 diff | docs-only 机检 #0 亲证 | ✅ |

### D1 独立裁决（生死点 · P0-CB-01 现状属向）

**裁定：implementer 读法成立，逃生门不触发。** backlog `:78`「申请↔面试无不可替代绑定」写于 audit 时点（2026-08-02）；tip 实况绑定基底已实存（#9 逐锚亲证：双 partial UNIQUE + CHECK + FK + 行锁同事务看绑定→建 interview→回写 + route fail-closed + finalize 不收客户端 interviewId/DB 反查 + web finalize 消费者在位）。故：(i) backlog 行语义按原文 **OPEN 不变**，不收窄不改写；(ii) 盘点按 tip 实况分项登记，缺口重心=**验收证据面**成立（immutable CandidateEvaluationSnapshot 零代码 #11 亲证 · 验收表各项无 named prove 收据 #12 亲证 · 三主体矩阵未进 CI matrix `:234` 亲证）。**privacy 立场附加（写死保留）**：「不可替代绑定」完整语义含 immutable snapshot 面——S-CB-1 验收证据面闭合前 `:78` **不得 flip CLOSED**；若未来判定 DB 反查绑定仍不满足「不可替代」，收窄改写须显式入卷（Ban 静默换范围 · Ban 任何实现不因改写解禁）——逃生门原样写死保留，本审不拆除。

### 其余裁决点（本席独立裁量）

- **D2（顺序语义）**：读法 B（盘点序）对本刀成立 + 读法 A（实现序）写死进切片启动门（§2c「S-SCOR-0…4 包先于 S-CB-1…3 包启动 · 无一豁免」）——两读法产物等价、歧义零实现风险。W6 只钉 01→02→03 内序未钉两域间序（#8 亲证），本刀增量如实。**成立**。
- **D3（privacy 生死点 · SCOR 生产前置）**：INT-TRANSCRIPT-00 **◐** / 01 **blocked**（checklist `:167`/`:173`/`:174`/`:176` 亲证）→ SCOR-01/02 生产前置**不满足**（`:194` 原文）；树上 mig `0100/0103/0109` 存储侧与 `scor-01/02/03.proof.ts` 隔离证明**不构成**前置闭合（`0100` 头注自认「不接任何生产写路径」#5 亲证）。S-SCOR-0 定义为**全局硬前置**（「未闭合前 S-SCOR-1+ 一律不得启动」· 归 INT/privacy 线 · 本线零触碰）——**无借盘点提前宣称 SCOR 可启动**；Ban 列表「Ban 触碰前置面（INT-TRANSCRIPT-00/01 · 0091/0092/0096 形状 · MODEL-OP 面）」+「Ban 隔离证明冒充生产组合根」双写死。**衔接如实，成立**。
- **D4（stale audit 双登记）**：audit 文档本刀零触碰（机检 #15），audit↔tip 双口径只在 §2b 登记，audit 自身更正属未来 docs 刀/协调方。**程序正当，成立**。
- **D5（选审）**：backlog `:77` 归属域原文「product / **privacy**」+ SCOR 前置 INT 面 + P0-CB-02 同意/撤回面属 privacy 域——第二席 mw-privacy-int 按域判替代默认 mw-model-op **成立**；S-SCOR-3 届时 dual 第一顺位换入 mw-model-op、S-CB-2 换入 mw-privacy-int 第一顺位写死**足够**。

### 审席意见（privacy/INT 域）

本立卷对 privacy 域的三处衔接全部如实：**(1) S-SCOR-0 前置门**——SCOR 实现包启动受 INT 线制约以「全局硬前置」写死，INT-TRANSCRIPT-00/01 现状按 checklist 原义 ◐/blocked 转述，无提前宣称闭合、无把 0126 双写围栏或预览面读成 01；**(2) P0-CB-02 同意边界**——ShareGrant 零实现、purpose-bound/expiry/撤回/在途 `terminated_consent`/全数据面清理观测无接线均如实登记为「原文缺口逐字成立」，S-CB-2 与隐私线联动（撤回与 worker resume 竞态）且 mw-privacy-int 第一顺位写死，未越权认领隐私线队列；**(3) 冻结面**——W3 DELETE=503 freeze remains、PG-retained、B 端 `assessment_unavailable`/score=NULL 暂停保持、`refuseMappedBSideScore` 恒失败全部继承写死，「SCOR 可比/B 端排序不得借隐私本地绿解锁」在 slice Hard pins + harness §3 双处钉死。盘点诚实性整体成立：SCOR-00 止血≠评分建成、存储侧在树≠生产接线、单链路 spec≠三主体矩阵、绑定基底≠P0-CB-01 关闭、立卷≠product-complete 的非等价链在 §2/§7/§8 三层重复钉死。

### Fail-trigger audit（若下述任一成立本审即 FAIL——本席逐项查无）

自批实现/self-write PASS（本 stub 被审态仍 PENDING awaiting，零自写）· 借盘点宣称 SCOR 可启动或 INT 前置闭合 · ShareGrant/UC-052/`:58-:64` 边界被借 · DELETE=503 冻结被触碰或开 DELETE 叙事 · SSOT（backlog/matrix/checklist/queue/audit/W6 链/MOP 链/AN 系列）被改写 · 隔离证明冒充生产组合根 · B 端暂停/校准叙事被松动 · 顺序写死被放宽 · pins 原值漂移 · prove 被执行或 named 即授权 · coding/迁移/package.json 变更 · secrets/.env 读取——**机检全部 0 成立**。

### Blockers

**0。**

### Conditions（C-I-* · 不阻断 dual，落 nail/未来 REQUEST 执行）

- **C-I-1（grep 范围注记）**：harness §2b#2「`git grep -i 'sharegrant\|share_grant'` = 空」应读为**产品码（非 ai-docs）0 hit**——全仓字面 grep 命中 8 个 ai-docs 文件（audit/需求文档及本刀工件自身语境）。实质判断（零代码实现）经本席独立机检成立，nail 期如补登记须按此范围表述。
- **C-I-2（cite-only 引锚漂移 · 非阻断）**：(a) harness §4 表引 `harness/north-star-hard-gates.md`——实位 `ai-docs/delivery/north-star-hard-gates.md`（无 harness/ 子目录）；(b) §2a#5「消费面 `assessment_unavailable` 15 文件」——本席机检非 ai-docs **34** 文件（apps/web 内 9）。两处均为 cite-only 语境、实质结论不变，落 nail/docs 侧更正（归协调方，同 OB 先例）。
- **C-I-3（D1 逃生门写死保留）**：`:78` 在 S-CB-1 验收证据面闭合前不得 flip；收窄改写（若触发）须显式入卷，Ban 静默换范围。
- **C-I-4（前置门不弱化）**：S-SCOR-0 全局硬前置写死不得被本立卷或任何后续工件弱化；INT-TRANSCRIPT-01 stays **blocked**；立卷≠授权，SCOR-01…08 / S-SCOR-*/S-CB-* 零借道启动。
- **C-I-5（alone≠dual）**：本 PASS 仅为 mw-privacy-int 一票，不代签、不预支 peer mw-e2e-ha；PRE BOTH PASS + 协调方 AUTHORIZE 前零执行。
- **C-I-6（append-only）**：本审为 append-only 追加，被审 stub 前 43 行 byte-intact；commit 落本席独立 worktree，**Ban push**。
- **C-I-7（named ≠ 授权）**：§5 named proves 零执行零新增脚本；EXIT 契约预声明（attempts 全记录 · 诚实失败路径 · Ban retry-to-green · EXIT0≠已建≠已闭≠covered）对未来切片持续生效。

### 中文三行摘要

1. 被审 SCOR 盘点立卷 REQUEST（line `895f5ec`≡origin 镜像 `6b61b734`，patch-id `28d2806a` 双侧亲算全等、祖先亲证、docs-only 恰 4 md +307/−0 零产品码零 SSOT 机检亲证）：privacy 焦点三面（S-SCOR-0 前置门 / P0-CB-02 同意边界 / 冻结面继承）全部如实，30 项检查表逐项独立机检吻合，0 Blocker。
2. D1 裁定绑定基底 tip 实存成立（0028 双 partial UNIQUE + 行锁同事务 + finalize DB 反查逐锚亲证），逃生门不触发、`:78` 按原文 OPEN、缺口重心=验收证据面，且「不可替代」含 snapshot 面、闭合前不得 flip 的 privacy 附加写死保留；D2/D3/D4/D5 全成立。
3. Pins 原值零漂移（NOT_HA/false/false/true/8/false/PG-retained/503/:77 OPEN/:78 OPEN），UC-052 partial 与 backlog `:58-:64` 零借用，DELETE=503 freeze remains；C-I-1~7（grep 范围注记 + 两处 cite-only 引锚漂移归 nail 更正 + 前置门不弱化 + alone≠dual 不代签 peer mw-e2e-ha）；0 prove run · 0 coding · 0 SSOT · 禁 push。

**Verdict: PASS**
