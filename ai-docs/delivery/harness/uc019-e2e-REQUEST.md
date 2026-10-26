# UC019-E2E REQUEST — 覆盖矩阵 §1.0.1 UC-E2E-019（报告重生成×退款并发·regenerateAttempt GAP）缺列隔离收据起草卷（剩余队列 Phase2 #12 one-knife-one-row 单行卷·docs-only REQUEST·起草落卷即停）

**Status**: **`closed`**（2026-10-26 post 双审双 PASS 会签席对账翻面·一行依据=§9-post 席1+席2 双 PASS 会签在卷+协调方 V6 fixture 追认落卷+并线 PR 走 main·卷 closed ≠ 矩阵行/SSOT 翻面〔coveredCount=8 零动·行翻面权归协调方〕·原 `executed:awaiting_post_prove_dual` 史录 provenance 见 §8/§9-EXEC 不回改·alone ≠ dual）· **STOP=closed（三处钉：本 Status 行 + §8 + 卷尾注）** · 运行门已行使（§9-EXEC·新 attempt 2026-10-26 · 主门双 fresh EXIT=0+§9-post 席2 第三 fresh 44 PASS）。

**席位**：UC-019 行起草席（NHP 批 A/批 B 未认领剩余行·协调方派·与批 A/批 B 行级互斥）。
**基线**：`origin/main` @ `ab282ba81`（full `ab282ba8134f51938a183691a240e21d02ce08c5` · `git fetch origin` 本 turn 亲证 tip 同指 · docs:check **2342≤2354** 本树亲跑 EXIT=0）· 分支 `line/uc019-draft`（建前 `git branch --list "line/uc019*"` 零命中 · 本席 `git worktree add ../meetwise-uc019 -b line/uc019-draft ab282ba81` 亲立 · HEAD 落 `ab282ba81` 亲证）· 工作树 `meetwise-uc019`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 行 `:28`）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 `:46` / §1.0.1 UC-019 行 `:124` / §1.0.2 `:148` / §1.0.3 双表同步令 `:164` / §1.2 UC-019 详情行 `:182` / §3 P1-5 `:271`）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.2 `:51-72` 用例 SSOT）→ `ai-docs/delivery/harness/uc-e2e-019-report-regenerate.md`（§1b 抬 covered 缺口表）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-E2E-019 `:312-330` 需求 SSOT）→ 涉事机制源 `apps/api/src/modules/interview/interview.controller.ts` / `interview.service.ts` / `interview-report.ts` / `packages/db/src/report/report.ts` → 既有 prove `packages/db/test/uc-e2e-019-report-regenerate.proof.ts` / `apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts` → 历史卷收据 `receipts/report-retry/2026-10-10-exec-prove.md`。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证）；②`e2e-requirement-coverage-matrix.md` §0.5「后续每一个 knife/eval/harness/本表新行或改行必须填写下列列」（`:47-49`·rev 行号锚校正）+ §1.0.3「后续 knife 改行时必须同步改本表 + `non-happy-path-perf-load-case-matrix.md`；缺列视为未完成 G2/G6」（`:164`）；③协调方派单（批 A 认领 `:114`/`:118`/`:128` · 批 B 认领 `:115-117` · **UC-019 `:124` 为两卷表内明钉「留后刀」的剩余行·本席认领**）；④结构范本=`harness/nhp-batch-b-REQUEST.md`（§0-§8 形制）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git rev-parse 实测 @`ab282ba81`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞登记

- `git worktree list` 建后 **20** 树实测（主仓+19 支线/临时树）——`line/uc019*` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep uc019-e2e` 建前零命中→落卷后唯一同名卷=本卷。
- **批 A/B 行级互斥亲证**：批 A `line/nhp-batch-a-draft` @`abeef0678`（rev 后 tip·其排序表明钉 `:124` UC-019「缺数 1·留后刀」）认领 `:114`/`:118`/`:128`；批 B `line/nhp-batch-b-draft` @`c77057d6f`（rev 落卷）认领 `:115-117`——本席认领 `:124`，**三卷行级互斥零重叠**。
- **在飞六线逐树亲证（起草 turn 亲证·rev 席 2026-10-26 本 turn 刷新）**：批 A @`abeef0678` / 批 B @`c77057d6f` / `line/uc011-draft` @`16b277bc0` / `line/uc004-draft` @**`9e17c3713`**（rev 更正·起草卷载 `1c5a02600` 已陈旧——其上 +1 收口落卷 commit `9e17c3713`：REQUEST .md+壳三处 root `package.json`/`scripts/run-e2e-isolated.mjs`/`apps/api/package.json`+新 proof `uc-e2e-004-career-path-http.proof.ts`·`git diff --stat ab282ba81...9e17c3713` 亲证 5 文件） / `line/uc025-draft` @`6da9821c8` / `line/uc028-draft` @**`8f86d50a5`**（rev 更正·起草卷载 `80373e913` 已陈旧——其上 +1 EXEC 落码 commit：壳三处+新 proof 共 4 码面文件+REQUEST .md·diffstat 亲证）——六线对**本卷触面零触**复核维持（uc019 双 proof / case-matrix / 矩阵 / harness `uc-e2e-019` 均零出现在任一线 diff·rev 席本 turn 亲证）；「各恰 1 新 REQUEST .md、零码面」自起草 turn 后已对 uc004/uc028 失效（EXEC 侧落码·如实登记）。
- **在飞交叠复核规则（EXEC 立项日必做·rev 扩面）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=一条隔离 prove 新文件+双表行内改（矩阵 `:124` 两 cell+case-matrix `:72` 后补一行）+harness 注记形一节+**注册行（争用面·见下条）**。届时交叠复核**扩到全部在飞树**（rev 席本 turn `git worktree list` 实测 **26** 树·起草 turn 20 树后新增：含 uc004/uc028 收口/落码、nhp-c、online-pay、uc017、ag 系等——逐树逐件 `git log -1 -- <文件>` 复核），任一分支顶对任一触面存在 `ab282ba81` 之后新增提交→触停止条件「现场漂移」停手上报。
- **注册面升格「争用面」（rev 新增·EXEC 前置裁决条款）**：EXEC 注册行写入面=root `package.json` + `scripts/run-e2e-isolated.mjs` + `apps/api/package.json`——已被 uc004 `9e17c3713` 与 uc028 `8f86d50a5` EXEC 侧落码亲触（diffstat 亲证），本卷 EXEC 注册 `pnpm uc019:nhp-adv:prove` 时=同面第三人写入→升格**争用面**。故 **EXEC 授权前须协调方对注册面写入顺序裁决**（谁先落·余者 rebase/重放注册行；本卷 Ban 就地 merge/rebase 他线·裁决前该三文件零写）。
- **`:148` 格权属预裁定（建议形·终裁权归协调方）**：§1.0.2 `:148` 系 UC-011/017/019 三 UC 同行同格——`line/uc011-draft` 件二自钉「`:148` PERF/LOAD 保持 blind 零宣称」并认领 011 侧措辞；本卷对 `:148` **零触**（019 侧 PERF_api/LOAD_worker 保持 blind·Ban n/a 偷关·Ban 借本卷收据宣 SLO/容量/HA）——EXEC 顺序 UC-011 先行（沿批 B rev 先例）·本卷随其后零字面相撞。

### 0.1 blob 锚表（`git rev-parse --short=8 HEAD:<path>` 亲算 @`ab282ba81`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `0cf6ae18`（519 行） | **§1.0.1 UC-019 行=`:124`（NEG partial·FAULT partial·BOUND partial（retry 幂等）·ADV blind·读法列=「regenerateAttempt GAP」）** · §1.0.2 `:148`（011/017/019 行 PERF_api blind/PERF_web n/a/LOAD_worker blind·「Ban wash 011/019」在卷）· §1.2 详情行=`:182` · §3 P1-5=`:271` · §0.5 强制列 `:47-49`/列值词汇 `:68`/`covered` 禁填 `:80`（rev 行号锚校正·起草卷误载 `:46`/`:66`/`:70`） · §1.0.3 双表同步令 `:164` |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `bbbe217d`（189 行） | §1.2 题=`:51` · 表头=`:52-53` · **019 现有 case=`:70`（NHP-019-FAULT-01 partial）/`:71`（NHP-019-BOUND-01 partial）/`:72`（NHP-019-NEG-01 partial）·`NHP-019-ADV-01` 行缺席（`:70-73` 区亲证零命中）=ADV blind 实证** · §1.3 起 `:74` |
| `ai-docs/delivery/harness/uc-e2e-019-report-regenerate.md` | `8e7991e5`（130 行） | §0 立场 `:21`（「直至 regenerateAttempt + A3 confirmed→released + quarantine regen 出口 + full.e2e/UI」）· §1b 抬 covered 缺口表 `:66-73`（#1 `GAP-UC019-REGEN-IDEM-KEY` `:68` · #3 `GAP-UC019-QUARANTINE-REGEN` `:70` · #5 `GAP-UC019-DEMAND-PATH` `:72`）· **陈旧句五处 `:33`/`:37`/`:48`/`:56`/`:70`「quarantined 不可 requeue/BLOCKED」系 #229 前旧语义（漂移事实·§0.2-3 登记）** |
| `packages/db/test/uc-e2e-019-report-regenerate.proof.ts` | `921703c1`（239 行） | **29 断言臂** · G3 `GAP_PIN: GAP-UC019-REFUND-FIRST-ORDER` `:205` + **`PIN_RETIRED: GAP-UC019-QUARANTINE-REGEN` `:206`**（#229 翻转在基线）· G4 段 `:209-220`（`ai_report` 无 regenerate* 列 `:219`）· `GAP_PIN: GAP-UC019-REGEN-IDEM-KEY` `:223` |
| `apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts` | `970e755b`（311 行） | **35 断言臂** · privacy stub pin `GAP-UC019-PRIVACY-STUB` `:70` · H1 `:157`（retry 幂等+额度不扣）· H2 `:195`（retry∥release 无非法组合）· H3 `:234`（quarantined→200 requeued `:262-268` #229 现势）· H4 `:273`（无 regenerate* 列 `:283`·`POST /reports/:id/regenerate`→404 `:289`·未鉴权→401 `:293`）· GAP_PIN 族 `:295-297` |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280 行） | **产品入口 `:185-189`**：`@Post(':id/report/retry')` `:186` → `retryReport(req.principal, id)` |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918 行） | `REPORT_RETRY_RL = { capacity: 3, refillPerSec: 3/3600 }` `:36` · `retryReport` `:776-780`（`denyPublicPreviewWrite` `:777` · RL 闸 `:778-779` 超限 **429 `report_retry_limited`** · 委托 `retryReportById` `:780`） |
| `apps/api/src/modules/interview/interview-report.ts` | `ae928db6`（98 行） | `retryReportById` `:35-44`：privacy guard `:37` 先行 → `SELECT id FROM ai_report WHERE interview_id=$1 AND status IN ('failed','quarantined')` `:38`（状态白名单唯一入口）→ `requeueFailedReport` `:40` → 空则 **404 `no_retriable_report`** `:42` |
| `packages/db/src/report/report.ts` | `c6ccd01c`（127 行） | `MAX_REPORT_ATTEMPTS=3` `:10` · **`requeueFailedReport` CAS `:66-71`**：`status IN ('failed','quarantined')` → `queued` + `attempts=0` + `next_attempt_at=NULL`（`#229` 后含 quarantined）· sweep 族 `:73` 起（超上限→quarantined 终态） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648 行） | UC-E2E-019 `:312-330`：幂等键 `(interviewId, regenerateAttempt)` `:316` · E-regen幂等「连点多次仅一次重生成」`:320` · 验收 A1/A2/A3 `:324`（rev 行号锚校正·起草卷误载 `:318`/`:323`） · TC-E2E-019-regen-idem/refund-race `:328-329` |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `87c812d9`（54 行） | Phase2 #12 `:28`（立项出处①） |
| `receipts/report-retry/2026-10-10-exec-prove.md` | `1a74b939`（103 行） | 历史卷（line/report-retry）D2 五件 EXEC 收据（关系登记 §0.2-4 承引） |

### 0.2 六列现状 + regenerateAttempt 缺口形状 + 历史卷关系（本席亲读亲算）

1. **六列现状（§1.0.1 `:124` 逐字）**：`| UC-E2E-019 | **partial** | **partial** | **partial**（retry 幂等） | **blind** | regenerateAttempt GAP |`——NEG=partial（NHP-019-NEG-01 quarantine regen 404/可解释 GAP 钉·case-matrix `:72`）· FAULT=partial（NHP-019-FAULT-01 retry∥release `:70`）· BOUND=partial（NHP-019-BOUND-01 retry 幂等 `:71`）· **ADV=blind（case-matrix 零 case 行·零对抗注入臂=缺列实证）** · 读法列=「regenerateAttempt GAP」。§1.2 详情行 `:182` 载：仍缺 regenerateAttempt 幂等键、A3 confirmed→released 闭环、quarantined regenerate 出口（**此句已陈旧·见 §0.2-3**）、full.e2e/UI、demand-path ADR；**行状态 partial 零翻**（coveredCount=8 不变）。
2. **regenerateAttempt 缺口形状（GAP 现值·亲证）**：`GAP-UC019-REGEN-IDEM-KEY`（需求幂等键 `(interviewId, regenerateAttempt)` 未产品化——`ai_report` 无 regenerate* 列·现仅 status CAS 代理·db `:223`+http `:295` 双钉）；`GAP-UC019-HTTP-REGENERATE`（产品口=`POST /interview/:id/report/retry` 已钉·需求名 `POST /reports/:id/regenerate` 未落·运行时 404·未进 full.e2e/UI·http `:296`）；`GAP-UC019-REFUND-FIRST-ORDER`（无 confirmed→released 产品口·A3「退款先赢→regen 拒」不可在现 API 闭环·db `:205`+http `:269`）；harness §1b 另载 `GAP-UC019-FULL-E2E`/`GAP-UC019-DEMAND-PATH`（`:71-72`）。**本刀认领面=ADV 缺列隔离收据+上列 GAP 现势如实再钉；GAP 的产品实现=另刀（需迁移+API·越界即停 §8-③）。**
3. **陈旧措辞漂移两件（如实登记·Ban 静默 wash）**：①harness `8e7991e5` 五处（`:33` G3 行/`:37` H3 行/`:48` 搜码行/`:56` 不测行/`:70` §1b #3）仍写「quarantined 不可 requeue/BLOCKED/404」——系 `#229` 前旧语义；现势=db proof `PIN_RETIRED` `:206` + http H3 `:262-268`（quarantined→POST retry→**200 requeued:true**+attempts=0+零扣费）。②矩阵 `:182` 详情行「quarantined regenerate 出口」缺列句同因陈旧。两件均**未随 `f93984a9a` 同步**；本卷 EXEC 期随收据落 harness 注记形现势注记（append 零洗）·矩阵 `:182` 零触（翻面权归协调方）。**rev 补登记第三/四 locus（同因陈旧·同纪律）**：③矩阵 §3 P1-5 `:271`「仍缺 …/quarantine regen 出口/…」句——#229 后 quarantine 出口已解锁，句中该缺口项已陈旧（行状态归协调方·本卷零触）；④http proof `:234` 段头「`// ── H3 · A3 退款先赢路径 GAP + quarantined HTTP retry BLOCKED ──`」+`:236` 断言题头「quarantined POST report/retry → 404（出口 BLOCKED）」——段头措辞系 #229 前旧语义（`:262-263` 断言本体已翻转 200·仅题头文字未随）——既有 proof 零触零改写（§1.3-④），本卷 V5 对照臂现势复验即活对照。
4. **与 `line/report-retry`（历史卷）关系**：其 D2 五件 EXEC **本体已落主线** @`f93984a9a`（2026-10-10·含 ①sweep 零改六锚钉 ②`requeueFailedReport` CAS 扩 quarantined+重置预算+`REPORT_RETRY_RL` 3/时/份 429 ③零扣费静态门 ④`reportView` 回传 attempts+页面文案 ⑤quarantined 解锁·`git show --stat f93984a9a` 亲证 19 文件含 uc019 双 proof 翻转+web report 页+收据 `1a74b939`）；其分支 tip `a62919dd1` **未并线**（**stale lineage·非本卷认领面**——该 tip 系 #229 D2 五件主线落地前的平行线·与主线 `f93984a9a` 已分叉陈旧；EXEC 零 merge 零 rebase·不追平不清理·如实登记供协调方处置）。**互补不重叠**：该卷已闭 quarantine 出口面（G3/H3 退役）——本卷**不重复认领 G3/H3**，认领余下面=**ADV 缺列隔离收据（一行一 case）**+regenerateAttempt 幂等键/A3/demand-path/full.e2e 缺口如实钉。撞面预演：本卷 EXEC 新 prove=独立新文件，对 uc019 既有 db/http 双 proof **零触零增臂零改写**（只读引用+回归复跑）；web report 页（`apps/web/app/report/[id]/`·#229 触面）零触。
5. **旁证目录漂移一件（登记）**：矩阵 `:182` 所引 `eval/uc-e2e-019-report-regenerate.eval.md` 现存于归档 `receipts/archive/2026-09-batch23/eval/`（`ai-docs/delivery/eval/` 目录不存在·亲证）——本卷零触·如实登记不代改。

### 0.3 迁移号

零迁移零 DDL（本刀=隔离收据刀·Ban 产品实现；regenerateAttempt 幂等键若立项实现=新迁移另刀·协调方裁）。

## §1 红事实（四读码面·全部亲证 @`ab282ba81`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 产品面三读（入口/状态机/计费）

- **入口读**：`POST /interview/:id/report/retry`（controller `:185-189`）→ `retryReport`（service `:776-780`）：`denyPublicPreviewWrite` → RL 令牌桶 `report_retry:<id>` 3/时/份，超限 **429 `report_retry_limited`** → `retryReportById`（interview-report.ts `:35-44`）：privacy guard 先行 → 状态白名单 SELECT（`failed`|`quarantined`）→ `requeueFailedReport`；白名单外/无报告=**404 `no_retriable_report`**。需求名 `POST /reports/:id/regenerate` 运行时 404（H4 `:289` 实证）。
- **状态机读**：`ai_report.status ∈ {queued, running, ready, failed, quarantined}`（真枚举 `ReportStatus` report.ts `:7` 亲证——起草卷误载 `processing`·rev 席本 turn 更正）；自动预算 `MAX_REPORT_ATTEMPTS=3`（`:10`），sweep 超上限→quarantined 终态；手动出口 `requeueFailedReport` CAS `:66-71`：`failed`|`quarantined` → `queued`+`attempts=0`+`next_attempt_at=NULL`（#229 后含 quarantined）。**无 regenerateAttempt 列**——「第几次手动重生成」产品面不可区分。
- **计费语义读**：D1=报告失败不退·regenerate 免费——retry 链零 `reserve`/`confirm`/`release` 触（G3/H3 断言额度不变+consumption 仍 confirmed 在卷）；RL=付费调用的成本 DoS 闸（service `:775` 注记「重排给全新自动预算=付费调用」）。需求语义「不重复扣费」今天由 RL+状态 CAS 承载，**非幂等键**——如实钉（Ban 写成「幂等已实现」）。

### 1.2 既有 prove 面读 + ADV 缺列实证（四读之四）

- 既有双 prove 在树且 #229 后现势：db 29 臂（`921703c1`）+ http 35 臂（`970e755b`·privacy stub pin `:70` 如实披露≠0058 fence covered）。H1/H2/H3/H4 已行使 retry 幂等（连点 404）/并发非法组合/quarantined 出口/未鉴权 401 等面。
- **ADV 缺列实证**：case-matrix §1.2 `:70-72` 恰三行（FAULT/BOUND/NEG）·`NHP-019-ADV-01` 行缺席；§1.0.1 `:124` ADV=**blind**；既有 64 臂零对抗注入组合臂（伪造状态遍历/跨 owner retry/连点风暴 RL 行使/quarantined 出口对抗序）→ **blind 成立·缺列隔离收据=本刀主面**。
- 旁证关系：`uc011:report-refund:prove` 族/`report:prove`/`commerce:prove` ≠ 本 UC 验收（harness `:19` 既有裁定承引）；本卷新 case 与既有 uc019 双 proof **互不替代**（沿 uc001 nhp-adv「互不替代」先例·H4 `:293` 401 臂等同族臂=旁证只读引用）。

### 1.3 否决（六件·EXEC 期同纹·命中即停）

1. **产品实现 regenerateAttempt 幂等键案**（迁移+API+全链路就近落）——本刀=缺列隔离收据·产品实现需 DDL 迁移越 §3-6 边界·归另刀协调方裁·否决。
2. **借 ADV 收据翻 covered/partial 案**（invent covered）——EXIT0=case≠covered·`coveredCount=8` 零翻转·covered 翻面权归协调方（§0.5 `:80` covered 禁填承引·rev 行号锚校正）·否决。
3. **`/reports/:id/regenerate` 需求名路径 alias 就近实现案**——demand-path=harness §1b #5 载明的产品/ADR 裁决面非 prove 面·否决。
4. **复用/增臂/改写既有 uc019 db+http proof 案**——两 proof=#229 回归面零触（沿批 B rev「零触只读引用」收紧先例）·本卷全部 prove 为独立新文件·否决。
5. **live key/真实模型跑通 regenerate 案**——Ban live key·regenerate 免费语义本链零模型外呼（1.1 计费读）·est live=0·否决。
6. **RL 阈值调参凑收据案**——S12 频控阈值追认归 report-retry 卷开放面（用户追认·常量可调）·本刀零触·否决。

### 1.4 修法：一行一 case·`NHP-019-ADV-01` 缺列隔离收据（docs+test-only·零产品码触·零 invent covered·零 live key）

- **恰一新 prove 文件**：`apps/api/test/uc-e2e-019-nhp-adv.proof.ts`（命名沿 `uc-e2e-001-nhp-adv.proof.ts`/`uc-e2e-025-nhp-adv` 族）· CMD `pnpm uc019:nhp-adv:prove`（root package.json+`run-e2e-isolated` 注册·隔离真 PG·零模型外呼）· gap id **`GAP-UC019-ADV-01`** 登记（EXEC 期 grep 复核零既有钉）。对抗臂表（行为面以届时码面为准·与既有臂互不替代）：

| # | 臂 | 注入 | 期望（现行为如实钉） | 锚 |
|---|----|------|---------------------|-----|
| V1 | 未鉴权 | 无 principal 头 POST report/retry | 401（鉴权守卫链） | H4 `:293` 同族旁证 |
| V2 | 跨 owner | 他人 principal 对目标 interview retry | **404 `not_found_or_forbidden`**（真 RLS 形如实·rev2 行使：守卫首条存在性探针 `guardInterviewPrivacyTx` `interview.service.ts :65-67` 受 FORCE RLS `p_owner` owner=principal 谓词过滤（sql/01_schema.sql `:135-146` 引导链·迁移链 0048 `:135-138` 同谓词 TO privacy_api_owner）跨 owner 0 行→404 先行抛出·P0001→410 GONE 映射分支 `:68-73` 真库不可达——rev1「stub 形实测 410」系隔离门未行使期静态推定从未实跑（§9-rev2 双录）；missing/cross-owner 不可区分合同 `:407-412` docstring；守卫拒先于状态 SELECT `:38`）；stub 形保留如实双录（owner-match stub 仍承 owner 侧 GET 臂·http proof `:70` `GAP-UC019-PRIVACY-STUB` PIN·≠0058 fence covered）·零重排零额度不变四断言维持 | interview-report.ts `:37` |
| V3 | 伪造状态 | `ready`/`running` 报告上 POST retry（真枚举注入栏·rev 更正） | **404 `no_retriable_report`**（状态白名单外一律拒=状态机外拒绝面） | `:38` 白名单 |
| V4 | 连点重放风暴 | 同一 failed report 连发 ≥5 POST | **真序列**：首 POST **200 `requeued:true`**（`failed` 在白名单→CAS 离场入 `queued`）→ 紧随重复 POST=**404 `no_retriable_report`**（状态 CAS 白名单 `failed\|quarantined`→`queued` 已离场·RL 令牌仍逐发消耗——RL 闸 `:778` 先于 `retryReportById` 委托 `:780`）→ 累计第 4 发起=**429 `report_retry_limited`**（capacity 3·refill 3/h·测试窗内回填可忽略）；全程 `ai_report` 恰单行·零重复入队·额度不变——与 §1.2「连点 404」自述对齐（http H1 首 200/二三次 404 `:169-183` 同构在卷）——**「连点仅一次重生成」现由 RL+状态 CAS 承载非幂等键（`GAP-UC019-REGEN-IDEM-KEY` 现势证据·429≠幂等键）** | service `:36`/`:778-779` |
| V5 | quarantined 出口对抗复验（**对照臂·H3 同构回归**·rev 标注——非新对抗注入面·对既有 http H3 臂同构复验零替代） | poison→quarantined→POST retry | **200 `requeued:true`+`attempts=0`+额度不变+consumption confirmed**（#229 后现势·对 harness `:33`/`:37`/`:48`/`:56`/`:70` 陈旧句=现势对照证据非 wash） | db `:206`/http `:262-268` |
| V6 | 键缺席诚实钉 | information_schema 双查 + **半臂（rev 增）：伪造 `regenerateAttempt` 字段双发**（body/query 注入 `regenerateAttempt` 两值各发一次 POST retry） | `ai_report` 无 regenerate* 列（与 G4 `:219`/H4 `:283` 同族互证）+ 伪造字段**行为与无字段同**（controller `:186-189`/service `:776-780` 零读取该字段·两发行为仍循 V4 同序列）+ **键零物化**（注入后 information_schema 复查仍无 regenerate* 列·零新列零新表）+ `GAP_PIN` 族再钉（REGEN-IDEM-KEY/HTTP-REGENERATE/REFUND-FIRST-ORDER）·**EXIT0=case≠covered** | db `:205`/`:223` |

- **双表同步令**（§1.0.3 `:164` 强制·EXEC 期同 turn）：case-matrix §1.2 `:72` 后补一行 `NHP-019-ADV-01 | 019 | ADV | api | regenerate/retry 对抗注入（未鉴权/跨 owner/伪造状态/连点重放 RL/quarantined 出口） | 401/404/429 拒面+零扣费不变·无重复入队 | **blind**→**case-only** | uc019:nhp-adv:prove`；矩阵 §1.0.1 `:124` ADV cell 措辞 `blind`→`blind`/`case-only`（诚实 case registration only）+读法列 append 案例已落注记——**行状态零翻仍 partial·coveredCount=8 不变**；§1.0.2 `:148` 零触（§0.0 格权属预裁定）。
- **harness 注记形一节**（EXEC 期）：`uc-e2e-019-report-regenerate.md` 卷尾 append「#229 后现势注记」（五处陈旧句逐条指向 `PIN_RETIRED` `:206`+H3 `:262-268`）·append 零洗零改既有行（沿 uc011-draft 对 `:58` 过时句处置先例）。
- **断言强度纪律**：新臂 Ban 恒真/弱断言（沿 e2e-assert-refresh 治理口径）·断言面=行为拒/省结构断言+静态锚+GAP 再钉；EXIT 语义=非 0 即 FAIL·attempts 台账逐次留痕含红次。

## §2 门矩阵（起草门 4 门本 commit 适用+EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned **≤cap 2354**（`public-text-policy.mjs:139` MAX_FILES=2_354·起草基线 2342 本树亲跑·本卷 +1 落卷后=2343·rev turn 本席亲跑 **2343≤2354 EXIT=0**——rev 零新增文件·余 11·>2354 红停上报·cap 上抬权归协调方）。
2. **markers 五类零命中**：本刀改动集新增行五类标记词+冲突标记对 grep 零命中（词族沿 `scripts/i6-239-gates.proof.mjs:154-163` 门口径·词面运行时组装·不复抄卷内防自指·命令与回执入 EXEC 收据）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 .md（多任何 tracked 路径即停）；EXEC 期 diff 面=本卷+新 prove 文件+注册行（root package.json+run-e2e-isolated）+双表行内改+harness 注记节+状态行翻面·届时逐件登记。
4. **est live=0**：零实跑零模型外呼零 Key 加载（§6）。
5. **EXEC 预基面（届时重 pin）**：`NHP-019-ADV-01` 新 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）·既有 uc019 db 29 臂+http 35 臂回归复跑 EXIT=0 恒等（零触只读）·邻面（`report-bulkhead`/`report-retry` 族按届时 SSOT 口径）恒等·typecheck/lint 按届时五值恰等口径·双表同步+harness 注记 diff 逐件登记·任一门红→§8 停止条件。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行·沿 uc001/uc025 nhp 族 prove-only 先例）；**#229 落地面零触**（uc019 双 proof/web report 页/report-retry 五件·§0.2-4）。
2. **批 A 三行（`:114`/`:118`/`:128`）+批 B 三行（`:115-117`）+其余 §1.0 行零触**：只读。
3. **矩阵 §1.2 详情行 `:182` / §3 P1-5 `:271` / §1.0.2 `:148` 零触**：翻面权归协调方；`:148` 格权属预裁定见 §0.0。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog / e2e-covered-path-backlog 只读引用——翻面权归协调方。
5. **零迁移零配置**：Ban 新迁移 Ban 触告警/CI 配置（越界即停）；RL 阈值/S12 开放面零触（§1.3-⑥）。
6. **归档与历史件零触**：`receipts/`（含 report-retry 收据与 2026-09-batch23 归档 eval）零改写（沿「不 rewrite 历史收据」纪律）。

## §4 依赖

**①上游已满足**：uc019 既有双 prove+harness 全在树且 #229 后现势（§0.1 锚 12 件）+隔离 prove 命名族先例（uc001 `nhp-neg`/`nhp-bound`/`nhp-adv`·uc025 同族）+`run-e2e-isolated` 三层壳+`#229` quarantined 出口/RL 已在基线。**②同文件并发面**：起草 turn 恰 1 新 .md 零交涉；EXEC 期触矩阵 `:124`（批 A/B/uc011-draft 均零触该行亲证）+case-matrix `:72` 后（`§1.2` 019 区无人认领）+harness append 节——§0.0 在飞交叠复核必做。**③下游**：本卷收据供 UC-019 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评·canHonestlyFlip 判定非本刀面）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（任一门红即停·attempts 台账留痕·禁红后重跑冲销·禁改断言凑绿）；Ban invent covered（§1.3-②·含升格 partial/借旁证 wash/借 V5 现势证据写「quarantined 面已闭环」）；Ban live key（§1.3-⑤·含伪造 Key 面/硬跑 blocked 面）；Ban 触产品码/#229 落地面/既有 proof 增臂改写（§3-1）；Ban 触批 A/B 行与其余 §1.0 行（§3-2）；Ban 触 `:182`/`:271`/`:148`（§3-3）；Ban 改共享 SSOT（§3-4）；Ban 迁移/告警/CI/RL 调参（§3-5/§1.3-⑥）；Ban rewrite 历史收据与归档（§3-6）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 `.env*`/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 就地归因门矩阵外新红（现新红→如实登记升级·Ban 借机修）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（EXEC 期隔离 prove 走 `run-e2e-isolated` 真 PG·零模型外呼·§2-5 承·`actualSpendCny=null` 同源）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词+冲突标记对 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径·不复抄卷内防自匹配——沿 nhp-batch-b/reconcile-retry 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual ·（2026-10-26 翻面：rev2 窄域复审 PASS+协调方授权复行使在案·运行门已行使·主门双 fresh EXIT=0·§9-EXEC 新 attempt 在卷——历史态 `draft:awaiting_pre_exec_dual` 留痕于 §9-EXEC/§9-rev/§9-rev2 各节钉·留痕不洗）· Dual PASS ≠ 收口（post-prove 双审权归两外席）。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**（双审席必含 §0.0 在飞交叠复核+`:148` 格权属预裁定确认）；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.4 修法面与 §5 Ban/pins 与 §1.3 六否决**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（六列被他刀改写·`requeueFailedReport` CAS 形变·RL 闸被撤·`:124` 行被他刀触·在飞线对触面新增提交）→停·重 pin 回炉。
- **机制不满足**：新臂收据与 §1 红事实推定形不符（如跨 owner retry 竟 200·`ready` 报告 retry 竟入队·quarantined retry 竟回退 404·风暴无 429 且无界入队）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1.4 恰一 case 面（需触产品码/迁移/`:182` 翻行/RL 调参/demand-path 实现）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check>2354/邻套件新红/typecheck/lint 超）→停·stash 对照亲证基线·如实登记（Ban 借机修）。**〔post 行使翻面（2026-10-26·§9-post）：post 双审席1+席2 双 PASS 会签+协调方 V6 fixture 追认落卷·STOP 翻终态 `closed`（三处=Status 行/§8/卷尾注·本条史录 append 保史不回改——史录值 `executed:awaiting_post_prove_dual`·更早 `draft:awaiting_pre_exec_dual` 留痕各节钉）〕**

## §9-rev 修订席收敛回路（双审席 FAIL→rev 纯文面落点·2026-10-26）

**审席输入**：双审席 1 FAIL（P1×3+P2 面）+ 双审席 2 FAIL（P1×2+P2×7）→ 协调方收敛为修订清单四件（P1 三+P2 批量）→ 本 rev 席单刀纯文面落卷·**修法面（§1.4 臂表形制）/§5 Ban/pins/§1.3 六否决零翻**·STOP 维持 `draft:awaiting_pre_exec_dual`。逐条落点（全部本席亲证后落）：

1. **P1 V4 期望序列改写（双席收敛）**：落 §1.4 臂表 V4 期望格——「前 3 内 200/后续 429」删·改**真序列**：首 POST 200 `requeued:true` → 紧随重复=404 `no_retriable_report`（状态 CAS 白名单 `failed|quarantined`→`queued` 离场·RL 令牌仍逐发消耗——RL 闸 `:778` 先于 `retryReportById` 委托 `:780` 亲证）→ 累计第 4 发起=429 `report_retry_limited`（capacity 3·refill 3/h）·全程恰单行·零重复入队·额度不变——与 §1.2「连点 404」自述及 http H1 首 200/二三次 404（`:169-183`）对齐。
2. **P1 V2 期望改写**：落 §1.4 臂表 V2 期望格——「404 拒」→「4xx 守卫拒·stub 形下实测 **410 GONE `interview_privacy_fenced`**」（亲证：stub `interview_privacy_active` owner≠principal→false→`assert_interview_privacy_active` raise→`guardInterviewPrivacyTx` `interview.service.ts :64-73` 转 GONE；interview 行存在故非 404 分支；`:64-73` 先于状态 SELECT `:38`）·owner-match stub 形如实披露保留（`:70` PIN）。
3. **P1 在飞登记刷新+注册面串行**：落 §0.0——①六线行 uc004 tip 更正 `1c5a02600`→**`9e17c3713`**（其上 +1 收口落卷 commit：壳三处+新 proof·diffstat 亲证 5 文件）·uc028 tip 更正 `80373e913`→**`8f86d50a5`**（EXEC 落码 4 码面文件+REQUEST·diffstat 亲证）·「各恰 1 新 REQUEST .md、零码面」起草态声明对 uc004/uc028 失效如实登记；②root `package.json`+`scripts/run-e2e-isolated.mjs`+`apps/api/package.json` 升格**争用面**（uc004/uc028 EXEC 侧已亲触）·新增条款「**EXEC 授权前须协调方注册写入顺序裁决**（本卷 Ban 就地 merge/rebase·裁决前三文件零写）」；③交叠复核扩**全部在飞树**（本 turn `git worktree list` 实测 **26** 树）逐 `git log -1 -- <文件>`。
4. **P2 批量（七件）**：①§1.1 状态机读 `{queued, processing, …}`→真枚举 `{queued, running, ready, failed, quarantined}`（`ReportStatus` report.ts `:7` 亲证）·V3 注入栏 `processing`→`running` 同源更正；②V6 增半臂「伪造 `regenerateAttempt` 字段双发→行为与无字段同·键零物化」（选 V6 不选 V4：键缺席诚实钉同格·与 information_schema 双查共锚）；③§0.2-3 补第三/四漂移 locus（矩阵 `:271`「quarantine regen 出口」句 + http proof `:234` 段头/`:236` 题头 BLOCKED 旧措辞——断言本体 `:262-263` 已翻转·proof 零触）；④§0.2-4 「rev2 docs 差量」→「**stale lineage·未并线·EXEC 零 merge 零 rebase**」；⑤行号锚五处校正：矩阵 §0.5 强制列 `:46-48`/`:46`→**`:47-49`**（§0 立项出处②+§0.1 blob 行两落点）·列值词汇 `:66`→**`:68`**·covered 禁填 `:70`→**`:80`**（§0.1 blob 行+§1.3-② 承引两落点）·E-regen幂等 `:318`→**`:320`**·验收 A1/A2/A3 `:323`→**`:324`**（§0.1 scenarios blob 行·全数 sed 亲证）；⑥V5 场景格标「**对照臂（H3 同构回归）**」（非新对抗注入面·零替代既有 H3）；⑦§2-1 docs:check 现势更新（rev turn 亲跑 2343≤2354 EXIT=0）。

**rev 门复跑**：markers 五类零命中（本 rev 改动集 grep 亲跑·§7 同口径）+ docs:check 2343≤2354 EXIT=0 亲跑。**STOP 终态不变**：`draft:awaiting_pre_exec_dual`（三处钉维持）·rev 落卷≠双审 PASS·双审重审权归两外席·开工三条款照 §8。

## §9-EXEC（EXEC 落码落卷 · EXEC 席 2026-10-26 · 协调方授权 EXEC 在案·隔离门红停承登 · 纯 additive 落卷 · 零 SSOT 翻面）

协调方授权随令：pre-exec 双审双 PASS + **争用面串行条款先行授权在案**（§0.0 注册面写入顺序裁决=本卷 EXEC 先行落·余者并线时 replay）。**本机 docker 缺失如实预登（EXEC 期容器依赖·沿 UC-004/UC-028 红停先例）**——本节为落码防丢 + 静态门承登 + 红停如实承登；§1.4 修法面/§5 Ban/pins/§1.3 六否决零翻。

### 9E.0 EXEC 立项重 pin（双审席 2 F1 清单五件·全数本席亲证落卷）

1. **§0.1 三 blob 重锚**（届时 tip=origin/main `38f6e7d78`·`git rev-parse --short=8 origin/main:<path>` 亲算）：
   - matrix `0cf6ae18`→**`788423b1`**（519 行不变）——行号锚逐处亲证零漂：§1.0.1 UC-019 行 `:124`（六列 cell 逐字复核：`| UC-E2E-019 | **partial** | **partial** | **partial**（retry 幂等） | **blind** | regenerateAttempt GAP |` 未动）· §1.0.2 `:148` · §1.2 详情行 `:182` · §3 P1-5 `:271` · §0.5 强制列 `:47-49`/列值词汇 `:68`/covered 禁填 `:80` · §1.0.3 `:164`；blob 漂移唯一成因=主线勘误 `58593dcc5` 对 `:182` 行内 append（见本节 3）
   - harness `8e7991e5`→**`fd080ee2`**（130 行不变）——§0 立场 `:21` · §1b 表 `:66-73`（#1 `:68`/`#3` `:70`/`#5` `:72`）零漂；blob 漂移成因=勘误五处 append（`:7`/`:33`/`:48`/`:56`/`:102`）
   - case-matrix `bbbe217d`→**`e6c669ba`**（189 行不变）——§1.2 题 `:51` ✓ · **表头 `:52-53`→`:53-54`（+1 行号校正：起草卷载 `:52-53` 实测 `:52` 为空行·表头+分隔行实落 `:53-54`·逐行 awk 亲证）** · 019 case `:70`/`:71`/`:72` ✓ · §1.3 起 `:74` ✓；blob 漂移成因=勘误 `:72` 行内 append
2. **§0.2-3① 陈旧句现势改登**：五陈旧句（`:33`/`:37`/`:48`/`:56`/`:70`）中 **`:37`（H3 行）/`:70`（§1b #3 行）两处仍陈旧**（勘误未触·本卷零触零洗·V5 对照臂现势复验即活对照）；**余三处（`:33` G3 行/`:48` 搜码行/`:56` 不测行）+头部关联（`:7`）+旁证行（`:99` 区·勘误 commit 自载 `:102`）已由主线勘误 `58593dcc5` append 注记（留痕不洗）**。
3. **§0.2-3② 矩阵 `:182` 详情行**：**已被主线勘误 `58593dcc5` 同形 append（行旗 partial/≠covered/coveredCount=8 零动）·翻面权已行使**（协调方侧）——本卷对 `:182` 零触零改写。
4. **§1.4 harness-append 落点改钉**：EXEC 期**不再**对 harness 五处/卷尾行使第二次注记（**Ban 二次注记五处**）——落点改为**引用既有勘误行**（`58593dcc5` 已逐处 append·勘误行即现势注记面·留痕不洗）；原 §1.4「harness 注记形一节」行使面就此闭合·本卷全部改动对 harness 文件零触。
5. **§0.0 刷新**：`git worktree list` 本 turn 实测 **30** 树（rev 26 后新增 flip4/rag02/ttl/qfix 等线·交叠复核见 9E.3）· uc028 tip `8f86d50a5`→**`ab03b610e`**（其上 +1「正则兼容换行」修正·触面=其 REQUEST+其 proof·注册面零新增触）· uc004 tip `9e17c3713` 维持；**origin/main 重 pin 基线 `38f6e7d78`**（`git fetch` 本 turn 亲证 tip 同指；`ab282ba81..origin/main` 恰 **13** commit·其中触三 doc 者恰勘误 `58593dcc5` 一件；机制源六 blob——controller `d10db4ae`/service `a8ae0d15`/interview-report `ae928db6`/report.ts `c6ccd01c`/uc019 双 proof `921703c1`+`970e755b`——对 base/本卷 HEAD/main 三点亲证零漂，「结论不变只更行号」成立面）。

### 9E.1 落码面（WIP 落卷核验·本席 git status/diff 亲证）

- 新 prove：`apps/api/test/uc-e2e-019-nhp-adv.proof.ts`——**V1-V6 对抗臂落码形**：V1 未鉴权 401+零副作用 · V2 跨 owner **410 GONE `interview_privacy_fenced`**（stub 形·`guardInterviewPrivacyTx :64-73` 先于状态 SELECT 亲证）· V3 伪造状态 `ready`/`running` 双臂 404 `no_retriable_report`+零副作用 · V4 五连发**真序列 200/404/404/429/429**（`report_retry_limited`·RL 令牌逐发消耗·恰单行·零重复入队·额度不变·429≠幂等键钉）· V5 quarantined **对照臂** 200 `requeued:true`+`attempts=0`+额度不变+confirmed（H3 同构·PIN_RETIRED）· V6 information_schema **双查**（零 regenerate* 列/表）+**伪造 `regenerateAttempt` 字段双发半臂**（body 一发+query 一发·行为与无字段同 200→404·键零物化）+GAP_PIN 族再钉。`mkAssert('uc019:nhp-adv')`+`_neg-harness` boot·per-arm 独立 fixture（RL 桶 `report_retry:<id>` 按报告分键臂间零共桶·遗留 queued 逐臂 parked 出 claim FIFO）·零 invent covered·零 live key（harness `delete MODEL_API_KEY` 承接·零模型外呼）·头注+卷尾 honesty 钉「EXIT0=case≠covered」。
- 注册三触点：根 `package.json` 两行（`uc019:nhp-adv:prove`/`uc019:nhp-adv:prove:raw`）+ `apps/api/package.json` 一行（`prove:uc019-nhp-adv`）+ `scripts/run-e2e-isolated.mjs` **三处 additive**（①收据来源清单 `uc019:nhp-adv:prove:raw` 条目·邻 uc019:http 族·含 controller/service/interview-report/rate-limit.service 四机制面；②允许表 `'uc019:nhp-adv:prove:raw'` 邻位 append 于 `'uc019:report-regenerate:http:prove:raw'` 后；③分派 ternary → `['pnpm', ['-C', 'apps/api', 'prove:uc019-nhp-adv']]`）——registerForm 链路闭合（根→壳允许表✓分派✓→apps/api→proof 文件）+`node --check scripts/run-e2e-isolated.mjs` 语法过，本席亲证。
- **未行使面如实登记**：§1.4 双表同步令（矩阵 `:124` ADV cell `blind→case-only` 措辞+读法列 append·case-matrix `:72` 后补 `NHP-019-ADV-01` 行）**本 commit 未行使**——case-only 翻措辞与运行门真实绿 EXIT 绑定·红停期零宣称（沿 uc004 EXEC 红停先例：其 EXEC commit 同样零触矩阵/case-matrix）；待容器恢复行使门 1 得真实 EXIT=0 后随收据同 turn 行使。

### 9E.2 静态门（EXIT 原值·本席届树复跑亲测·attempts 台账含红次如实）

- **typecheck**：`pnpm turbo typecheck --force` → **8 successful, 8 total（0 cached）·EXIT=0**（attempts：首跑 EXIT=2 红一次——本 proof V5 release 断言括位 TS1005 本席改码·复跑绿；红次留痕不冲销）
- **lint**：`pnpm turbo lint --force` → **12 successful, 12 total·EXIT=0·0 errors**；根 **5242/5242** 恰等、api **1423/1423** 恰等（attempts：首跑 EXIT=1 红一次——本 proof 新增 5 warning 致 api 1428>1423：`A_`/`B_`/`parked_by`/`column_name`/`table_name` 五处 naming-convention·本席改码 `HDR_A`/`HDR_B`/`parkedBy`/SQL alias camelCase 后复跑恰等·**帽值零动**）·domain 115/ai-graphs 47/contracts 265/web 601/ai-runtime 628/db 1042/worker 959/qdrant-store 27 各恰其帽
- **docs:check**：`node scripts/ai-docs/check-docs.mjs` → **EXIT=0·扫描 2344 ≤ cap 2354**（rev 2343+本卷新 proof 1·余 10·`MAX_FILES=2_354` 零触）
- **markers**：改动集五类标记词+冲突标记对 grep **零命中·EXIT=0**（词面运行时组装·沿 `scripts/i6-239-gates.proof.mjs :154-163` 门口径·改动集=本节 REQUEST 行+新 proof+注册三文件）
- **diff 面机检（§2-3 EXEC 口径）**：恰 5 tracked 路径=本卷 .md（§9-EXEC append）+新 prove+注册三文件；矩阵/case-matrix/harness/既有双 proof/产品源 **零触**

### 9E.3 在飞交叠复核（30 树逐线 post-base unique 触面扫描·本席亲跑）

- **注册面（争用面）**：uc004 `9e17c3713`（3 unique commit·恰其 EXEC 一件触注册面）+ uc028 `ab03b610e`（4 unique·恰 `8f86d50a5` 一件触）——两线各带**自家** EXEC 注册行·未并线；本卷三处 additive 与两线行位错行（各邻自家条目）·**串行条款先行授权在案**·并线顺序=协调方裁决（先落者定·余者 replay 注册行·Ban 就地 merge/rebase 他线）
- ag18 `4c2ea4c9f`/cap72 `52846f9d8`/state `fb74ae6a4` 三线含非主线 `package.json` 触史（`7f0b33520` lint 帽步进等·2026-10-18 日期早于本卷 base 2026-10-26·feat 并线平行 commit·非本卷 base 后新漂移）——**登记不阻断**
- 本卷触面（矩阵 `:124`/case-matrix 019 区/harness `uc-e2e-019`/uc019 双 proof/`uc-e2e-019-nhp-adv.proof.ts` 全仓零既有）逐线 `git log` 扫描零命中·批 A/B 行级互斥维持；主线 13 commit 对触面恰勘误一件（9E.0-5）

### 9E.4 隔离门红停承登（不宣称收口）

- **本机 docker 缺失亲证**：`command -v docker` EXIT=1（command not found）·`podman` 同缺·`/Applications/Docker.app` 不存在——隔离壳容器 runtime 无法 boot
- **门 1（`pnpm uc019:nhp-adv:prove` V1-V6）实测**：壳层 `BoundedCommandError: bounded_command_spawn_failed` → **EXIT=1**——红停于容器 spawn·非用例红（V1-V6 断言面未得行使）；既有 uc019 db 29 臂+http 35 臂回归复跑同经隔离壳**未行使**（零触零改写面维持）
- 待容器环境恢复后由协调方行使门 1+回归门·凭真实 EXIT 值另行落卷·**Ban 以静态四门绿顶替运行门绿**

### 9E.5 STOP 处置（沿 UC-004/UC-028 红停先例）

隔离门未行使、运行绿未得——**§8 状态维持 `draft:awaiting_pre_exec_dual` 不翻**（三处钉维持）：零 covered 宣称·矩阵/checklist/backlog/双表零触·`coveredCount=8` 零动·pins 十一值零翻·releaseEvidence=false · Not HA · est live=0 · actualSpendCny=null；本 commit=落码防丢+注册三触点+静态门承登+隔离门红停承登。

draft:awaiting_pre_exec_dual（§9-EXEC 卷尾钉 · 与卷首行/§8/§9-rev 同值 · STOP 维持 · 红停承登 · 隔离门未行使不宣称收口）

## §9-rev2 修订席收敛回路第二轮（EXEC 席根因两件→rev2 落卷 · 2026-10-26）

**审席输入**：EXEC 席隔离门行使（容器环境恢复后实跑 `pnpm uc019:nhp-adv:prove`）回报两根因→协调方派 rev2（**修法面变更=回炉重审项**）→ 本 rev2 席落卷·§5 Ban/pins/§1.3 六否决零翻·零新增文件（改动集=本节+§1.4 V2 期望格+新 proof V2/V3 臂）。逐条落点（全部本席亲证后落）：

1. **根因一 V2 期望 410→404（证伪落点·§1.4 臂表 V2 期望格行使）**：EXEC 实跑证伪 rev1「stub 形下实测 410 GONE」——该措辞系隔离门红停期（§9E.4 未行使）静态推定·从未实跑。真库守卫链**首条存在性探针** `SELECT 1 FROM interview WHERE id=$1`（`guardInterviewPrivacyTx` interview.service.ts `:65-67`）受 FORCE RLS 谓词过滤：sql 引导链 `01_schema.sql :135-146` 对 interview ENABLE+FORCE RLS + `p_owner USING (owner_user_id=current_setting('app.principal_user', true))`（本 prove 走 harness boot 全量 sql/01-23·逐行亲证；迁移链同谓词=0048 `:135-138` `FOR SELECT TO privacy_api_owner`）——跨 owner（userB 探 userA 行）0 行→**404 `not_found_or_forbidden` 先行抛出**（missing/cross-owner 不可区分合同 `:407-412` docstring 亲证）→P0001→410 GONE 映射分支（`:68-73`）真库不可达。**落点三件**：①§1.4 V2 期望格 410→**404 `not_found_or_forbidden`**（真 RLS 形如实）；②新 proof V2 臂两断言改 `r.status===404`/`body.error==='not_found_or_forbidden'`+rev2 双录 console 注记（rev1 410 形降为双录如实登记·stub 形保留：owner-match stub 仍承 owner 侧 GET 臂·`GAP-UC019-PRIVACY-STUB` PIN 不撤）；③**零重排零额度不变四断言维持原位零删**（目标报告仍 failed·consumption confirmed·HTTP 额度不变·owner GET 200）。
2. **根因二 V3 fixture 接线修正（CAS 收口面恰值）**：rev1 fixture 先插 `status='completed'` 的 interview 再调 `completeInterviewAndConfirm`→产品防重入闸**正确**抛 `interview_terminal_conflict:completed`（commerce.ts `:394-395`）→进程 EXIT 1——红停于 fixture 接线·非用例断言红（产品 CAS 行为本身正确·如实登记非产品缺陷）。**落点**：fixture 改插 CAS 收口面恰值 **`'created'`**（`completeInterviewAndConfirm` 同条带谓词 UPDATE 仅自 `status IN ('created')` CAS 成功·commerce.ts `:378-381` 亲证）→complete 正常走→consumption confirmed→伪造 `ready`/`running` 报告臂 404 `no_retriable_report` 断言如实行使·**V3 期望格零变**。**派单示例值偏差如实登记**：派单载「如 status='in_progress'」——`'in_progress'` 同样非 CAS 白名单值、仍落同一闸（`interview_terminal_conflict:in_progress`）·故落 `'created'`（与 setupFailedReport/V4/V6 同形）·修法方向（改插非终态→complete 正常走→断言 succeeded 路径）逐字行使·仅恰值按码面校正。
3. **门复跑（届树亲跑）**：markers 五类标记词+冲突标记对改动集 grep 零命中 EXIT=0（词面运行时组装·§2-2/§7 同口径）+ `node scripts/ai-docs/check-docs.mjs` EXIT=0 扫描数≤cap 2354（EXEC 2344 基线·rev2 零新增文件·余数不变）。
4. **STOP 终态不变**：`draft:awaiting_pre_exec_dual`（三处钉维持）——rev2 落卷≠双审 PASS·**rev2 后重派双审第三轮·窄域=两根因落点复验**（§1.4 V2 期望格 404 真形+V3 fixture `'created'` 接线·与新 proof V2/V3 臂逐件对读·四断言维持复核）·双审重审权归两外席·开工三条款照 §8·运行门仍待容器环境行使（§9E.4 红停承登继续有效·Ban 以静态门绿顶替运行门绿）。

rev2:awaiting_pre_exec_dual（§9-rev2 卷尾钉 · 与 Status 行/§8/§9-EXEC/§9-rev 同值 · STOP 维持 · 修法面 V2 期望格行使=回炉重审项 · 双审第三轮窄域=两根因落点复验）

## §9-EXEC·新 attempt（隔离行使落卷 · EXEC 复行使席 2026-10-26 · rev2 窄域复审 PASS+协调方授权复行使在案 · 门矩阵全绿 · 纯行使+fixture 预算修正 · 零 SSOT 翻面）

本节=§9E.4 红停承登的解除行使：容器环境恢复（colima running 亲证）+rev2 窄域双审 PASS+协调方授权复行使——隔离运行门全量行使·stdout 全量留痕 `.tmp/`（gitignored·九件日志：uc019-nhp-adv-run1/2/3·uc019-db-regression·uc019-http-regression·uc019-inverted-gate·uc025-nhp-fault-sample·neg-auth-sample·gate-neg-all+gate-typecheck/gate-lint/gate-docs-check）。

### 9F.0 并线前奏（工序 1）

- `git fetch origin main`→`ab282ba8..cb9c8efc5` **52 commits**（uc025 残面/event-ttl/ag36/mop01/queue 等）；merge-tree 预演**单冲突** `scripts/run-e2e-isolated.mjs` 注册行=runner 同文件 additive 双侧（本卷 `uc019:nhp-adv:prove:raw` × 主线 `uc025:nhp-bound-isolated:prove:raw`·token-diff 亲证各恰一独有项）→**dual-keep 双保留** union 落卷：三注册位零丢（收据来源清单/允许表/分派 ternary 各双侧俱在·`node --check` 语法过）·merge commit **`349affec7`**。
- cap 零步进：现 main cap=**2362**（主线 `558690214` uc025 并线 sanction 已步进·本卷 union 计数 2357≤2362 余 5·零越限臂零步进需求）。
- `pnpm install --frozen-lockfile` **EXIT=0**（583ms·零 lockfile 漂移）。

### 9F.1 V2/V3 两根因行使结果（rev2 落点届树兑现·run1 36 断言+run2/3 44 断言亲测）

- **根因一 V2（期望 410→404 真 RLS 形）兑现**：`PASS V2 他人 principal POST retry → 404 not_found_or_forbidden（真 RLS 形…FORCE RLS p_owner 过滤守卫首条存在性探针…404 先行抛出）`+`PASS V2 body.error=not_found_or_forbidden`+零重排零额度不变三断言+owner GET 200 全 PASS——rev2 证伪落点（404 先行·P0001→410 映射真库不可达）实跑证实。
- **根因二 V3（fixture 'created' CAS 恰值）兑现**：`PASS V3 ready 报告 POST retry → 404 no_retriable_report`+`PASS V3 running …`双臂各三断言全 PASS——'created' 接线 complete 正常走（零 `interview_terminal_conflict`）·伪造状态臂如实行使·V3 期望格零变。

### 9F.2 主门 attempt 台账（Ban retry-to-green 未犯·红次留痕不冲销·§8「根因不在本刀交付面→停」反测=在面可修）

- **attempt1 EXIT=1**：36 PASS/0 FAIL——V1-V5 全兑现后红于 **V6 `setupFailedReport`→`reserveEntitlement` 抛 `insufficient_entitlement(available:0,requested:1)`**。红因=**本刀交付面 fixture 预算**：`_neg-harness.ts :279` 授 userA 恰 5 paid units·V1-V6 计划需 6 次 reserve（V2×1+V3 ready/running×2+V4×1+V5×1+V6×1·逐臂亲算）——第 6 发（V6）落空。非用例断言红·非产品缺陷（`reserveEntitlement` FIFO 记账 `units_total−units_reserved−units_consumed` 行为与 commerce.ts `:82-:109` 码面一致）——**rev2 V3 fixture 接线红同类**（红停于 fixture 接线）·9E.2 红次先例形。
- **修正（零断言改写·V1-V6 期望格零变·§5 Ban/pins/§1.3 六否决零触·待协调方追认）**：proof boot 后 test-side 桶顶装 `UPDATE entitlement_bucket SET units_total=units_total+5 WHERE owner_user_id='userA' AND kind='paid'`+卷头 fixture 纪律注记——各臂内 before/after「额度不变」断言形零变·FIFO 记账面零触·零产品码触。
- **attempt2 EXIT=0**（44 PASS 全绿·实现方 fresh）+ **attempt3 EXIT=0**（44 PASS·独立复验 fresh）——§2-5 **双 fresh 达成**（V6 半臂伪造字段双发 200→404+键零物化双查+GAP_PIN 族三钉+honesty 钉全兑现）。

### 9F.3 门矩阵 EXIT 原值（全量 .tmp/ 留痕·届树 @merge 349affec7 后）

| 门 | CMD | EXIT 原值 | 详 |
|---|-----|-----------|----|
| docker 亲证 | `docker info` / `colima status` | **0** | client 29.9.2/server 29.5.2·2 容器 running·virtiofs |
| 主门 | `pnpm uc019:nhp-adv:prove` | attempt1=**1**·attempt2=**0**·attempt3=**0** | 44 PASS 双 fresh·receipt JSON×3 在 `.tmp/isolated-proof-receipts/` |
| 回归 db | `pnpm uc019:report-regenerate:prove` | **0** | 既有 29 臂·零 FAIL·BLOCKED honesty 钉在卷 |
| 回归 http | `pnpm uc019:report-regenerate:http:prove` | **0** | 35 臂 35 PASS 全绿 |
| 倒置门 | `node scripts/run-e2e-isolated.mjs uc019:unregistered-probe:prove:raw` | **1** | `unsupported_e2e_target` 壳拒·容器零 spawn（拒于 target 解析层） |
| 邻面 nhp-fault | `pnpm uc025:nhp-fault-isolated:prove` | **0** | 22 PASS |
| 邻面 neg 抽验 | `pnpm neg:auth` | **0** | 90 用例全绿 |
| typecheck | `pnpm turbo typecheck --force` | **0** | 8 successful, 8 total（零红次） |
| lint | `pnpm turbo lint --force` | **0** | 12 successful, 12 total·0 errors·**十值恰等**：根 5242/api 1423/db 1042/worker 959/ai-runtime 628/web 601/contracts 265/domain 115/ai-graphs 47/qdrant-store 27（fixture 顶装零新增 warning） |
| docs:check | `node scripts/ai-docs/check-docs.mjs` | **0** | **2357≤2362**（现 main cap·余 5·零步进）——REQUEST §2-1 旧 pin 2354 系起草基线·现 cap 随 uc025 并线 sanction 步进 2362（主线 `558690214`）·**漂移如实登记不红停（协调方预授权口径）** |
| markers | 五类标记词+冲突标记对改动集 grep | **0 命中** | 词面运行时组装·`i6-239-gates.proof.mjs :154-163` 门口径·改动集四件（REQUEST+proof+矩阵+case-matrix） |
| neg:all 自证 | `pnpm neg:all` | **0** | **693 用例全绿**：auth 90+commerce 90+resume 91+interview 108+bend 179+input 135——**实测=题面·sanction 臂未触发** |

diff 面机检：本 commit 恰 4 tracked 路径=本卷 .md（§9-EXEC·新 attempt append+STOP 翻面）+新 proof（fixture 预算修正）+矩阵 `:124` 行内改+case-matrix 后补行——注册三文件/既有双 proof/harness/产品源/`:148`/`:182`/`:271` **零触**。

### 9F.4 §1.4 双表同步令行使（9E.1-3 预登待行使面·主门真实绿同 turn 兑现）

- 矩阵 §1.0.1 `:124`：ADV cell `**blind**`→`**blind** / `case-only``（UC-025 行同形措辞·诚实 case registration only）+读法列 append「ADV 案例已落注记」——**行旗三 partial 零翻·coveredCount=8 零翻·covered 翻面权归协调方（§0.5 covered 禁填）**。
- case-matrix §1.2 `:72` 后补 `NHP-019-ADV-01` 行（§1.4 逐字·行旗 `case-only`（blind→）·EXIT0≠covered 钉）。
- §1.0.2 `:148` 零触（§0.0 格权属预裁定）·harness 文件零触（9E.0-4 引用制维持）·`:182`/`:271`/共享 SSOT 零触。

### 9F.5 STOP 处置

- 开工三条款：①rev2 窄域双审 PASS 在案②协调方授权复行使随令③§1.4 修法面/§5 Ban/pins/§1.3 六否决零改（运行行使修正系 fixture 预算·rev2 V3 接线修正同类·**待协调方追认**）——**三处钉翻面 `executed:awaiting_post_prove_dual`**。
- pins 十一值零翻·coveredCount=8 不变·releaseEvidence=false·Not HA·est live=0（隔离真 PG·零模型外呼零 Key）·actualSpendCny=null·零 covered 宣称·⛔push·post-prove 双审权归两外席（alone≠dual）。

executed:awaiting_post_prove_dual（§9-EXEC·新 attempt 卷尾钉 · 与 Status 行/§8/卷尾注同值 · 运行门已行使 · 主门双 fresh EXIT=0 · awaiting post-prove dual 双审）

## §9-post（post 双审双 PASS 会签席落卷 · 2026-10-26 · 协调方 V6 fixture 追认落卷 · **STOP 三处翻面 `closed`**）

**post 输入**：§9-EXEC·新 attempt 运行门全量行使在卷（STOP 史录值 `executed:awaiting_post_prove_dual` 三处钉维持）→ 协调方追认落卷：**V6 fixture 预算顶装追认（2026-10-26）**——test-side 桶顶装 +5 追认在案·零断言改写（V1-V6 期望格零变·各臂内 before/after 额度不变断言形零变·FIFO 记账面零触·零产品码触）·红次留痕不冲销（attempt1 EXIT=1 台账 §9F.2 在卷）。本席 post 双审双 PASS 会签后 STOP 对账翻终态 **`closed`**（沿 uc025 残面卷/ag20 对账翻面先例·卷 closed ≠ 矩阵行/SSOT 翻面——coveredCount=8 零动·行翻面权归协调方）。

- **席1 PASS（独立亲证）**：①**V2 四断言在卷核**：proof `:232`/`:234`/`:236` 三位点四断言全数在位零删零改写（目标报告仍 failed / consumption confirmed / HTTP 额度不变 / owner GET 200——`:234` 一位点双条件·与 §9-rev2-1③ 四断言清单逐条对上）·`GAP-UC019-PRIVACY-STUB` owner-match stub 披露保留；②**V3 接线核**：`'created'` CAS 收口面恰值插位 `:153`（setupFailedReport）/`:251`（V3 臂）/`:321`（V5）·completeInterviewAndConfirm 正常走零 `interview_terminal_conflict`·伪造 `ready`/`running` 双臂 404 `no_retriable_report` 断言在位（`:264-269`）·期望格零变；③**V6 桶顶装追认核**：`git show 594010991` 对 proof 恰 13+/1-——桶顶装 UPDATE+fixture 纪律注记+头注一行·**断言行零触零改写**（diff 零 A() 位点）；④**44 断言复算**：静态 A() 位点 41 + V3 循环 ×2（ready/running）=44 runtime·与 run2/run3 日志各 44 PASS 恰等·honesty 钉在卷（`:410`）；⑤**markers+docs:check 复跑**：五类标记词+冲突标记对本刀改动集四件（REQUEST+proof+矩阵+case-matrix）grep 零命中 EXIT=0·`node scripts/ai-docs/check-docs.mjs` EXIT=0（扫描 2357≤届值 cap）。
- **席2 PASS（独立复跑）**：①**主门第三 fresh**：`pnpm uc019:nhp-adv:prove` 独立复跑 **44 PASS/0 FAIL/EXIT=0**（`.tmp/uc019-nhp-adv-post-dual.log`·receipt `2026-10-26T17-06-48…` outcome=passed·release_evidence=false）——attempt2/attempt3 后第三独立 fresh·§2-5 双 fresh 纪律超满足；②**sha256 全 MATCH**：attempt2/attempt3 双 receipt `sourceDigests` 十文件逐一 sha256 对届树 **10/10 MATCH**·两 receipt 间 digests 逐位恒等·本席第三 fresh receipt digests 与之恒等（runner/bounded-command/proof/_neg-harness/controller/service/interview-report/rate-limit/commerce/report 十件）；③**倒置门独立**：`node scripts/run-e2e-isolated.mjs uc019:unregistered-probe:prove:raw` **EXIT=1** `unsupported_e2e_target`（拒于 target 解析层·容器零 spawn·与 §9F.3 台账恒等）；④**RL-before-authz P2-a 登记面亲证**：`retryReport` RL 闸 `interview.service.ts :778-779`（键=`report_retry:<id>` 按报告分键·非按 principal）先于 `:780` `retryReportById` 委托·privacy guard（interview-report.ts `:37`）在 RL 之后——跨 owner 调用方终局 404 仍逐发消耗目标报告 RL 令牌（V2 臂 404 实跑即令牌消耗面·V4 第 2/3 发 404 同纹）——**P2 产品 backlog 登记**（gap-bug-backlog.md 一行尾注随本席落卷·无数据暴露/无资金影响）。
- **STOP 终态=**`closed`**（三处翻面=Status 行/§8/卷尾注·史录 token 保留为 provenance 不回改）**——翻面依据=门矩阵全绿在卷（§9F.3）+主门三 fresh（attempt2/3+席2）+sha256 全 MATCH+倒置门独立+协调方 V6 fixture 追认落卷+post 双审双 PASS 会签；后续=并线 PR 走 main（fetch origin/main 届值→merge-tree 预演→merge --no-ff→终验→PR）·矩阵行/coveredCount/backlog 翻面权仍归协调方（本节 append 纯文面零码动）。

closed（§9-post 卷尾钉 · 与 Status 行/§8/卷尾注同值 · post 双审双 PASS 会签 · 协调方 V6 fixture 追认落卷 · 主门三 fresh+sha256 全 MATCH+倒置门独立 · 并线 PR 走 main）

---

*UC019-E2E REQUEST · 2026-10-26 起草 · **STOP=`closed`**（三处钉：Status 行+§8+本行·2026-10-26 post 双审双 PASS 会签对账翻面——§9-post 席1+席2 双 PASS+协调方 V6 fixture 追认落卷·历史态 `executed:awaiting_post_prove_dual`/`draft:awaiting_pre_exec_dual` 留痕于各节钉·见 §9-post）· 剩余队列 Phase2 #12 one-knife-one-row 单行卷 · 覆盖矩阵 §1.0.1 UC-E2E-019 `:124`（NHP 批 A/B 未认领剩余行·两卷表内明钉留后）· 缺列=ADV blind（case-matrix `NHP-019-ADV-01` 行缺席实证→已后补 case-only 行）· 修法=一行一 case 缺列隔离收据（恰一独立新 prove `NHP-019-ADV-01` V1-V6·零产品码触·零 invent covered·零 live key）· regenerateAttempt 幂等键/A3/demand-path/full.e2e 缺口如实再钉（产品实现=另刀）· 历史卷 line/report-retry D2 五件已落主线 @`f93984a9a`（quarantine 出口面已闭·互补不重叠·分支 tip 未并线）· §1.3 六否决 · 双表同步令沿 §1.0.3 `:164`（已行使·§9F.4）· base=origin/main `ab282ba81`（并线 origin/main @`cb9c8efc5` merge=`349affec7`）· 分支 `line/uc019-draft` · 工作树 `meetwise-uc019` · 与批 A（`:114`/`:118`/`:128`）批 B（`:115-117`）行级互斥零重叠 · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · ⛔push*
