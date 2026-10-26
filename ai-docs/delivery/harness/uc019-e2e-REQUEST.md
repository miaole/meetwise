# UC019-E2E REQUEST — 覆盖矩阵 §1.0.1 UC-E2E-019（报告重生成×退款并发·regenerateAttempt GAP）缺列隔离收据起草卷（剩余队列 Phase2 #12 one-knife-one-row 单行卷·docs-only REQUEST·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`** · alone≠dual · **STOP=draft（三处钉：本 Status 行 + §8 + 卷尾注）** · 本 commit 不预 claim 任何 post-commit EXIT。

**席位**：UC-019 行起草席（NHP 批 A/批 B 未认领剩余行·协调方派·与批 A/批 B 行级互斥）。
**基线**：`origin/main` @ `ab282ba81`（full `ab282ba8134f51938a183691a240e21d02ce08c5` · `git fetch origin` 本 turn 亲证 tip 同指 · docs:check **2342≤2354** 本树亲跑 EXIT=0）· 分支 `line/uc019-draft`（建前 `git branch --list "line/uc019*"` 零命中 · 本席 `git worktree add ../meetwise-uc019 -b line/uc019-draft ab282ba81` 亲立 · HEAD 落 `ab282ba81` 亲证）· 工作树 `meetwise-uc019`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 行 `:28`）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 `:46` / §1.0.1 UC-019 行 `:124` / §1.0.2 `:148` / §1.0.3 双表同步令 `:164` / §1.2 UC-019 详情行 `:182` / §3 P1-5 `:271`）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.2 `:51-72` 用例 SSOT）→ `ai-docs/delivery/harness/uc-e2e-019-report-regenerate.md`（§1b 抬 covered 缺口表）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-E2E-019 `:312-330` 需求 SSOT）→ 涉事机制源 `apps/api/src/modules/interview/interview.controller.ts` / `interview.service.ts` / `interview-report.ts` / `packages/db/src/report/report.ts` → 既有 prove `packages/db/test/uc-e2e-019-report-regenerate.proof.ts` / `apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts` → 历史卷收据 `receipts/report-retry/2026-10-10-exec-prove.md`。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证）；②`e2e-requirement-coverage-matrix.md` §0.5「后续每一个 knife/eval/harness/本表新行或改行必须填写下列列」（`:46-48`）+ §1.0.3「后续 knife 改行时必须同步改本表 + `non-happy-path-perf-load-case-matrix.md`；缺列视为未完成 G2/G6」（`:164`）；③协调方派单（批 A 认领 `:114`/`:118`/`:128` · 批 B 认领 `:115-117` · **UC-019 `:124` 为两卷表内明钉「留后刀」的剩余行·本席认领**）；④结构范本=`harness/nhp-batch-b-REQUEST.md`（§0-§8 形制）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git rev-parse 实测 @`ab282ba81`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞登记

- `git worktree list` 建后 **20** 树实测（主仓+19 支线/临时树）——`line/uc019*` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep uc019-e2e` 建前零命中→落卷后唯一同名卷=本卷。
- **批 A/B 行级互斥亲证**：批 A `line/nhp-batch-a-draft` @`abeef0678`（rev 后 tip·其排序表明钉 `:124` UC-019「缺数 1·留后刀」）认领 `:114`/`:118`/`:128`；批 B `line/nhp-batch-b-draft` @`c77057d6f`（rev 落卷）认领 `:115-117`——本席认领 `:124`，**三卷行级互斥零重叠**。
- **在飞六线逐树亲证（本 turn）**：批 A @`abeef0678` / 批 B @`c77057d6f` / `line/uc011-draft` @`16b277bc0` / `line/uc004-draft` @`1c5a02600` / `line/uc025-draft` @`6da9821c8` / `line/uc028-draft` @`80373e913`——逐树 `git diff --name-only ab282ba81...<branch>` 实测**各恰 1 新 REQUEST .md、零码面、零触本卷触面**（uc019 双 proof / case-matrix / 矩阵 / harness 均零出现在任一线 diff）。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=一条隔离 prove 新文件+双表行内改（矩阵 `:124` 两 cell+case-matrix `:72` 后补一行）+harness 注记形一节+注册行。届时对各在飞分支执行 `git log -1 -- <文件>` 逐树逐件复核，任一分支顶对任一触面存在 `ab282ba81` 之后新增提交→触停止条件「现场漂移」停手上报。
- **`:148` 格权属预裁定（建议形·终裁权归协调方）**：§1.0.2 `:148` 系 UC-011/017/019 三 UC 同行同格——`line/uc011-draft` 件二自钉「`:148` PERF/LOAD 保持 blind 零宣称」并认领 011 侧措辞；本卷对 `:148` **零触**（019 侧 PERF_api/LOAD_worker 保持 blind·Ban n/a 偷关·Ban 借本卷收据宣 SLO/容量/HA）——EXEC 顺序 UC-011 先行（沿批 B rev 先例）·本卷随其后零字面相撞。

### 0.1 blob 锚表（`git rev-parse --short=8 HEAD:<path>` 亲算 @`ab282ba81`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `0cf6ae18`（519 行） | **§1.0.1 UC-019 行=`:124`（NEG partial·FAULT partial·BOUND partial（retry 幂等）·ADV blind·读法列=「regenerateAttempt GAP」）** · §1.0.2 `:148`（011/017/019 行 PERF_api blind/PERF_web n/a/LOAD_worker blind·「Ban wash 011/019」在卷）· §1.2 详情行=`:182` · §3 P1-5=`:271` · §0.5 强制列 `:46`/列值词汇 `:66`/`covered` 禁填 `:70` · §1.0.3 双表同步令 `:164` |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `bbbe217d`（189 行） | §1.2 题=`:51` · 表头=`:52-53` · **019 现有 case=`:70`（NHP-019-FAULT-01 partial）/`:71`（NHP-019-BOUND-01 partial）/`:72`（NHP-019-NEG-01 partial）·`NHP-019-ADV-01` 行缺席（`:70-73` 区亲证零命中）=ADV blind 实证** · §1.3 起 `:74` |
| `ai-docs/delivery/harness/uc-e2e-019-report-regenerate.md` | `8e7991e5`（130 行） | §0 立场 `:21`（「直至 regenerateAttempt + A3 confirmed→released + quarantine regen 出口 + full.e2e/UI」）· §1b 抬 covered 缺口表 `:66-73`（#1 `GAP-UC019-REGEN-IDEM-KEY` `:68` · #3 `GAP-UC019-QUARANTINE-REGEN` `:70` · #5 `GAP-UC019-DEMAND-PATH` `:72`）· **陈旧句五处 `:33`/`:37`/`:48`/`:56`/`:70`「quarantined 不可 requeue/BLOCKED」系 #229 前旧语义（漂移事实·§0.2-3 登记）** |
| `packages/db/test/uc-e2e-019-report-regenerate.proof.ts` | `921703c1`（239 行） | **29 断言臂** · G3 `GAP_PIN: GAP-UC019-REFUND-FIRST-ORDER` `:205` + **`PIN_RETIRED: GAP-UC019-QUARANTINE-REGEN` `:206`**（#229 翻转在基线）· G4 段 `:209-220`（`ai_report` 无 regenerate* 列 `:219`）· `GAP_PIN: GAP-UC019-REGEN-IDEM-KEY` `:223` |
| `apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts` | `970e755b`（311 行） | **35 断言臂** · privacy stub pin `GAP-UC019-PRIVACY-STUB` `:70` · H1 `:157`（retry 幂等+额度不扣）· H2 `:195`（retry∥release 无非法组合）· H3 `:234`（quarantined→200 requeued `:262-268` #229 现势）· H4 `:273`（无 regenerate* 列 `:283`·`POST /reports/:id/regenerate`→404 `:289`·未鉴权→401 `:293`）· GAP_PIN 族 `:295-297` |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280 行） | **产品入口 `:185-189`**：`@Post(':id/report/retry')` `:186` → `retryReport(req.principal, id)` |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918 行） | `REPORT_RETRY_RL = { capacity: 3, refillPerSec: 3/3600 }` `:36` · `retryReport` `:776-780`（`denyPublicPreviewWrite` `:777` · RL 闸 `:778-779` 超限 **429 `report_retry_limited`** · 委托 `retryReportById` `:780`） |
| `apps/api/src/modules/interview/interview-report.ts` | `ae928db6`（98 行） | `retryReportById` `:35-44`：privacy guard `:37` 先行 → `SELECT id FROM ai_report WHERE interview_id=$1 AND status IN ('failed','quarantined')` `:38`（状态白名单唯一入口）→ `requeueFailedReport` `:40` → 空则 **404 `no_retriable_report`** `:42` |
| `packages/db/src/report/report.ts` | `c6ccd01c`（127 行） | `MAX_REPORT_ATTEMPTS=3` `:10` · **`requeueFailedReport` CAS `:66-71`**：`status IN ('failed','quarantined')` → `queued` + `attempts=0` + `next_attempt_at=NULL`（`#229` 后含 quarantined）· sweep 族 `:73` 起（超上限→quarantined 终态） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648 行） | UC-E2E-019 `:312-330`：幂等键 `(interviewId, regenerateAttempt)` `:316` · E-regen幂等「连点多次仅一次重生成」`:318` · 验收 A1/A2/A3 `:323` · TC-E2E-019-regen-idem/refund-race `:328-329` |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `87c812d9`（54 行） | Phase2 #12 `:28`（立项出处①） |
| `receipts/report-retry/2026-10-10-exec-prove.md` | `1a74b939`（103 行） | 历史卷（line/report-retry）D2 五件 EXEC 收据（关系登记 §0.2-4 承引） |

### 0.2 六列现状 + regenerateAttempt 缺口形状 + 历史卷关系（本席亲读亲算）

1. **六列现状（§1.0.1 `:124` 逐字）**：`| UC-E2E-019 | **partial** | **partial** | **partial**（retry 幂等） | **blind** | regenerateAttempt GAP |`——NEG=partial（NHP-019-NEG-01 quarantine regen 404/可解释 GAP 钉·case-matrix `:72`）· FAULT=partial（NHP-019-FAULT-01 retry∥release `:70`）· BOUND=partial（NHP-019-BOUND-01 retry 幂等 `:71`）· **ADV=blind（case-matrix 零 case 行·零对抗注入臂=缺列实证）** · 读法列=「regenerateAttempt GAP」。§1.2 详情行 `:182` 载：仍缺 regenerateAttempt 幂等键、A3 confirmed→released 闭环、quarantined regenerate 出口（**此句已陈旧·见 §0.2-3**）、full.e2e/UI、demand-path ADR；**行状态 partial 零翻**（coveredCount=8 不变）。
2. **regenerateAttempt 缺口形状（GAP 现值·亲证）**：`GAP-UC019-REGEN-IDEM-KEY`（需求幂等键 `(interviewId, regenerateAttempt)` 未产品化——`ai_report` 无 regenerate* 列·现仅 status CAS 代理·db `:223`+http `:295` 双钉）；`GAP-UC019-HTTP-REGENERATE`（产品口=`POST /interview/:id/report/retry` 已钉·需求名 `POST /reports/:id/regenerate` 未落·运行时 404·未进 full.e2e/UI·http `:296`）；`GAP-UC019-REFUND-FIRST-ORDER`（无 confirmed→released 产品口·A3「退款先赢→regen 拒」不可在现 API 闭环·db `:205`+http `:269`）；harness §1b 另载 `GAP-UC019-FULL-E2E`/`GAP-UC019-DEMAND-PATH`（`:71-72`）。**本刀认领面=ADV 缺列隔离收据+上列 GAP 现势如实再钉；GAP 的产品实现=另刀（需迁移+API·越界即停 §8-③）。**
3. **陈旧措辞漂移两件（如实登记·Ban 静默 wash）**：①harness `8e7991e5` 五处（`:33` G3 行/`:37` H3 行/`:48` 搜码行/`:56` 不测行/`:70` §1b #3）仍写「quarantined 不可 requeue/BLOCKED/404」——系 `#229` 前旧语义；现势=db proof `PIN_RETIRED` `:206` + http H3 `:262-268`（quarantined→POST retry→**200 requeued:true**+attempts=0+零扣费）。②矩阵 `:182` 详情行「quarantined regenerate 出口」缺列句同因陈旧。两件均**未随 `f93984a9a` 同步**；本卷 EXEC 期随收据落 harness 注记形现势注记（append 零洗）·矩阵 `:182` 零触（翻面权归协调方）。
4. **与 `line/report-retry`（历史卷）关系**：其 D2 五件 EXEC **本体已落主线** @`f93984a9a`（2026-10-10·含 ①sweep 零改六锚钉 ②`requeueFailedReport` CAS 扩 quarantined+重置预算+`REPORT_RETRY_RL` 3/时/份 429 ③零扣费静态门 ④`reportView` 回传 attempts+页面文案 ⑤quarantined 解锁·`git show --stat f93984a9a` 亲证 19 文件含 uc019 双 proof 翻转+web report 页+收据 `1a74b939`）；其分支 tip `a62919dd1` **未并线**（rev2 docs 差量·非码面·EXEC 不认领不 merge）。**互补不重叠**：该卷已闭 quarantine 出口面（G3/H3 退役）——本卷**不重复认领 G3/H3**，认领余下面=**ADV 缺列隔离收据（一行一 case）**+regenerateAttempt 幂等键/A3/demand-path/full.e2e 缺口如实钉。撞面预演：本卷 EXEC 新 prove=独立新文件，对 uc019 既有 db/http 双 proof **零触零增臂零改写**（只读引用+回归复跑）；web report 页（`apps/web/app/report/[id]/`·#229 触面）零触。
5. **旁证目录漂移一件（登记）**：矩阵 `:182` 所引 `eval/uc-e2e-019-report-regenerate.eval.md` 现存于归档 `receipts/archive/2026-09-batch23/eval/`（`ai-docs/delivery/eval/` 目录不存在·亲证）——本卷零触·如实登记不代改。

### 0.3 迁移号

零迁移零 DDL（本刀=隔离收据刀·Ban 产品实现；regenerateAttempt 幂等键若立项实现=新迁移另刀·协调方裁）。

## §1 红事实（四读码面·全部亲证 @`ab282ba81`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 产品面三读（入口/状态机/计费）

- **入口读**：`POST /interview/:id/report/retry`（controller `:185-189`）→ `retryReport`（service `:776-780`）：`denyPublicPreviewWrite` → RL 令牌桶 `report_retry:<id>` 3/时/份，超限 **429 `report_retry_limited`** → `retryReportById`（interview-report.ts `:35-44`）：privacy guard 先行 → 状态白名单 SELECT（`failed`|`quarantined`）→ `requeueFailedReport`；白名单外/无报告=**404 `no_retriable_report`**。需求名 `POST /reports/:id/regenerate` 运行时 404（H4 `:289` 实证）。
- **状态机读**：`ai_report.status ∈ {queued, processing, ready, failed, quarantined}`；自动预算 `MAX_REPORT_ATTEMPTS=3`（`:10`），sweep 超上限→quarantined 终态；手动出口 `requeueFailedReport` CAS `:66-71`：`failed`|`quarantined` → `queued`+`attempts=0`+`next_attempt_at=NULL`（#229 后含 quarantined）。**无 regenerateAttempt 列**——「第几次手动重生成」产品面不可区分。
- **计费语义读**：D1=报告失败不退·regenerate 免费——retry 链零 `reserve`/`confirm`/`release` 触（G3/H3 断言额度不变+consumption 仍 confirmed 在卷）；RL=付费调用的成本 DoS 闸（service `:775` 注记「重排给全新自动预算=付费调用」）。需求语义「不重复扣费」今天由 RL+状态 CAS 承载，**非幂等键**——如实钉（Ban 写成「幂等已实现」）。

### 1.2 既有 prove 面读 + ADV 缺列实证（四读之四）

- 既有双 prove 在树且 #229 后现势：db 29 臂（`921703c1`）+ http 35 臂（`970e755b`·privacy stub pin `:70` 如实披露≠0058 fence covered）。H1/H2/H3/H4 已行使 retry 幂等（连点 404）/并发非法组合/quarantined 出口/未鉴权 401 等面。
- **ADV 缺列实证**：case-matrix §1.2 `:70-72` 恰三行（FAULT/BOUND/NEG）·`NHP-019-ADV-01` 行缺席；§1.0.1 `:124` ADV=**blind**；既有 64 臂零对抗注入组合臂（伪造状态遍历/跨 owner retry/连点风暴 RL 行使/quarantined 出口对抗序）→ **blind 成立·缺列隔离收据=本刀主面**。
- 旁证关系：`uc011:report-refund:prove` 族/`report:prove`/`commerce:prove` ≠ 本 UC 验收（harness `:19` 既有裁定承引）；本卷新 case 与既有 uc019 双 proof **互不替代**（沿 uc001 nhp-adv「互不替代」先例·H4 `:293` 401 臂等同族臂=旁证只读引用）。

### 1.3 否决（六件·EXEC 期同纹·命中即停）

1. **产品实现 regenerateAttempt 幂等键案**（迁移+API+全链路就近落）——本刀=缺列隔离收据·产品实现需 DDL 迁移越 §3-6 边界·归另刀协调方裁·否决。
2. **借 ADV 收据翻 covered/partial 案**（invent covered）——EXIT0=case≠covered·`coveredCount=8` 零翻转·covered 翻面权归协调方（§0.5 `:70` covered 禁填承引）·否决。
3. **`/reports/:id/regenerate` 需求名路径 alias 就近实现案**——demand-path=harness §1b #5 载明的产品/ADR 裁决面非 prove 面·否决。
4. **复用/增臂/改写既有 uc019 db+http proof 案**——两 proof=#229 回归面零触（沿批 B rev「零触只读引用」收紧先例）·本卷全部 prove 为独立新文件·否决。
5. **live key/真实模型跑通 regenerate 案**——Ban live key·regenerate 免费语义本链零模型外呼（1.1 计费读）·est live=0·否决。
6. **RL 阈值调参凑收据案**——S12 频控阈值追认归 report-retry 卷开放面（用户追认·常量可调）·本刀零触·否决。

### 1.4 修法：一行一 case·`NHP-019-ADV-01` 缺列隔离收据（docs+test-only·零产品码触·零 invent covered·零 live key）

- **恰一新 prove 文件**：`apps/api/test/uc-e2e-019-nhp-adv.proof.ts`（命名沿 `uc-e2e-001-nhp-adv.proof.ts`/`uc-e2e-025-nhp-adv` 族）· CMD `pnpm uc019:nhp-adv:prove`（root package.json+`run-e2e-isolated` 注册·隔离真 PG·零模型外呼）· gap id **`GAP-UC019-ADV-01`** 登记（EXEC 期 grep 复核零既有钉）。对抗臂表（行为面以届时码面为准·与既有臂互不替代）：

| # | 臂 | 注入 | 期望（现行为如实钉） | 锚 |
|---|----|------|---------------------|-----|
| V1 | 未鉴权 | 无 principal 头 POST report/retry | 401（鉴权守卫链） | H4 `:293` 同族旁证 |
| V2 | 跨 owner | 他人 principal 对目标 interview retry | 404 拒（privacy guard `:37` 先于状态 SELECT）·stub 形如实披露沿 H 现形 | interview-report.ts `:37` |
| V3 | 伪造状态 | `ready`/`processing` 报告上 POST retry | **404 `no_retriable_report`**（状态白名单外一律拒=状态机外拒绝面） | `:38` 白名单 |
| V4 | 连点重放风暴 | 同一 failed report 连发 ≥5 POST | 前 3 内 200/后续 **429 `report_retry_limited`**；全程 `ai_report` 恰单行·无重复 queued 副作用·额度不变——**「连点仅一次重生成」现由 RL+状态 CAS 承载非幂等键（`GAP-UC019-REGEN-IDEM-KEY` 现势证据·429≠幂等键）** | service `:36`/`:778-779` |
| V5 | quarantined 出口对抗复验 | poison→quarantined→POST retry | **200 `requeued:true`+`attempts=0`+额度不变+consumption confirmed**（#229 后现势·对 harness `:33`/`:37`/`:48`/`:56`/`:70` 陈旧句=现势对照证据非 wash） | db `:206`/http `:262-268` |
| V6 | 键缺席诚实钉 | information_schema 双查 | `ai_report` 无 regenerate* 列（与 G4 `:219`/H4 `:283` 同族互证）+ `GAP_PIN` 族再钉（REGEN-IDEM-KEY/HTTP-REGENERATE/REFUND-FIRST-ORDER）·**EXIT0=case≠covered** | db `:205`/`:223` |

- **双表同步令**（§1.0.3 `:164` 强制·EXEC 期同 turn）：case-matrix §1.2 `:72` 后补一行 `NHP-019-ADV-01 | 019 | ADV | api | regenerate/retry 对抗注入（未鉴权/跨 owner/伪造状态/连点重放 RL/quarantined 出口） | 401/404/429 拒面+零扣费不变·无重复入队 | **blind**→**case-only** | uc019:nhp-adv:prove`；矩阵 §1.0.1 `:124` ADV cell 措辞 `blind`→`blind`/`case-only`（诚实 case registration only）+读法列 append 案例已落注记——**行状态零翻仍 partial·coveredCount=8 不变**；§1.0.2 `:148` 零触（§0.0 格权属预裁定）。
- **harness 注记形一节**（EXEC 期）：`uc-e2e-019-report-regenerate.md` 卷尾 append「#229 后现势注记」（五处陈旧句逐条指向 `PIN_RETIRED` `:206`+H3 `:262-268`）·append 零洗零改既有行（沿 uc011-draft 对 `:58` 过时句处置先例）。
- **断言强度纪律**：新臂 Ban 恒真/弱断言（沿 e2e-assert-refresh 治理口径）·断言面=行为拒/省结构断言+静态锚+GAP 再钉；EXIT 语义=非 0 即 FAIL·attempts 台账逐次留痕含红次。

## §2 门矩阵（起草门 4 门本 commit 适用+EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned **≤cap 2354**（`public-text-policy.mjs:139` MAX_FILES=2_354·起草基线 2342 本树亲跑·本卷 +1 预期 2343·余 11·>2354 红停上报·cap 上抬权归协调方）。
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

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**（双审席必含 §0.0 在飞交叠复核+`:148` 格权属预裁定确认）；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.4 修法面与 §5 Ban/pins 与 §1.3 六否决**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（六列被他刀改写·`requeueFailedReport` CAS 形变·RL 闸被撤·`:124` 行被他刀触·在飞线对触面新增提交）→停·重 pin 回炉。
- **机制不满足**：新臂收据与 §1 红事实推定形不符（如跨 owner retry 竟 200·`ready` 报告 retry 竟入队·quarantined retry 竟回退 404·风暴无 429 且无界入队）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1.4 恰一 case 面（需触产品码/迁移/`:182` 翻行/RL 调参/demand-path 实现）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check>2354/邻套件新红/typecheck/lint 超）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*UC019-E2E REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（本卷唯一 STOP 终态·三处钉：Status 行+§8+本行）· 剩余队列 Phase2 #12 one-knife-one-row 单行卷 · 覆盖矩阵 §1.0.1 UC-E2E-019 `:124`（NHP 批 A/B 未认领剩余行·两卷表内明钉留后）· 缺列=ADV blind（case-matrix `NHP-019-ADV-01` 行缺席实证）· 修法=一行一 case 缺列隔离收据（恰一独立新 prove `NHP-019-ADV-01` V1-V6·零产品码触·零 invent covered·零 live key）· regenerateAttempt 幂等键/A3/demand-path/full.e2e 缺口如实再钉（产品实现=另刀）· 历史卷 line/report-retry D2 五件已落主线 @`f93984a9a`（quarantine 出口面已闭·互补不重叠·分支 tip 未并线）· §1.3 六否决 · 双表同步令沿 §1.0.3 `:164` · base=origin/main `ab282ba81` · 分支 `line/uc019-draft` · 工作树 `meetwise-uc019` · 与批 A（`:114`/`:118`/`:128`）批 B（`:115-117`）行级互斥零重叠 · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · ⛔push*
