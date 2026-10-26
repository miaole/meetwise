# UC-025 E2E 残面 REQUEST — BOUND 隔离收据 + 重押题入口产品口 + covered 评估器跑点（docs-only REQUEST · **`closed`**（2026-10-26 post 双审双 PASS 会签对账翻面·见 §9-post·起草时点 STOP=draft）· Ban coding · Ban prove · Ban push）

**Status**: **`closed`**（2026-10-26 post 双审双 PASS 会签席对账翻面·协调方 D1 追认 11 tracked+D2 基线遗留红另刀两裁已下·一行依据=§9-post 席1+席2 双 PASS 会签在卷+并线 PR 走 main·卷 closed ≠ 矩阵行/SSOT 翻面〔canHonestlyFlip=false report-only 在案·行翻面权归协调方 nail〕·原 `draft:awaiting_pre_exec_dual` 史录 provenance 见 §8/§9-EXEC 不回改·中间态 `executed:awaiting_post_prove_dual` 受阻路径未落仅存 tmp 标签〔零 SSOT 效力·P2-②〕·alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-26（起草席 · 协调方派单）
**Base / written at**: `main` **`47dd6be5`** / full `47dd6be56d5f3b59ccf5dc0c827b0bdc2e6952de`（fetch 后 origin/main tip 同指亲证 · AA/W/AK 各 nail 之后 · not a prove tip）
**分支 / 工作树**: `line/uc025-draft`（建前 `git branch --list "line/uc025*"` 零命中 · `git worktree add ../meetwise-uc025 -b line/uc025-draft main` 亲立 · HEAD=`47dd6be5` 亲证）· 仓根同级 `meetwise-uc025`
**Knife**: **UC-025 行残面收口**（三缺口一并：①BOUND 证据层升到隔离 PG/HTTP 面；②重押题入口产品口真缺如实修；③六列补齐后 covered 评估器跑点·诚实评估·Ban 翻行）
**Gap ids（本卷新具名三枚 · 不改任何既名）**: `GAP-UC025-BOUND-ISOLATED-01`（件① · NHP-025-BOUND-01 的证据层升级 · 不改名 W `GAP-UC025-BOUND-01`）· `GAP-UC025-REQUIZ-ENTRY-01`（件② · 场景 A1「显示重押题入口」web 产品口真缺）· `GAP-UC025-COVERED-REASSESS-01`（件③ · UC-025 六列 covered 评估器跑点缺）
**Case id**: `NHP-025-BOUND-01`（件① 同 case 证据层升级·不新开 NHP case 行）· 件②/件③ 为产品口与评估面（非 NHP case）
**Row**: `UC-E2E-025`（矩阵 `:125` 六列 + `:183` 场景行 + backlog 行 `:274`）· not UC-E2E-018/052/004/014-026/002/011
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（stubs PENDING · Ban self-approve · alone ≠ dual；privacy-int 理由：重押题入口与 quiz 锚点同属 owner-scoped 授权域邻接，BOUND 隔离面走 `x-user-id` dev 回退面与 owner 谓词）
**Authority**: meetwise — docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · Ban widen

**必读清单（EXEC 立项前逐件亲读）**：`AGENTS.md` → `ai-docs/delivery/harness/gap-uc025-fault-isolated.md`（同族直接先例·隔离面 REQUEST 形制与 F1–F5 注入表法）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（`:125` 六列原值 / `:274` backlog 行·只读）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（`:331-343` UC-E2E-025 场景语义）→ `ai-docs/delivery/harness/uc-e2e-018-covered-lift-reassess.md`（covered 评估跑点先例）→ 涉事源码 `apps/api/src/modules/interview/interview.service.ts`（三守卫合并块）/ `apps/web/lib/errors/action-error.ts` / `apps/web/app/interviews/actions.ts` / `scripts/lib/uc-covered-evaluator.mjs`。

**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（2026-10-26·UC-E2E-025 行收口·量级 M-L·剩余队列 Phase2 #10·缺口=BOUND 隔离收据+重押题入口产品口+六列齐后 covered 评估）；②矩阵 `:274` backlog 行「**仍缺重押题入口 +（若要）隔离 PG/HTTP BOUND 收据**」原句（残面自证）；③W/AA/AK 三 nail 的 STILL_GAP 条款（BOUND「PG/HTTP-level BOUND → separate knife」/ ADV「Ban wash W BOUND」）；④结构范本=必读清单两卷。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`47dd6be5`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` **起草时点 7 树**（主仓+6 支线·时点快照记法非恒值·§9-rev R7）——**rev 时点 18 树实测**（主仓+17 支线·`line/*` 15 支+detached 临时 2）——两时点均无第二 uc025 同名树；`git branch --list "line/uc025*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep uc025-e2e` 建前零命中→落卷后唯一同名卷=本卷。
- 新名占用查：`bound-isolated`/`BOUND-ISOLATED`（apps/packages/scripts/ai-docs 全树）、`REQUIZ`/`requiz`、uc025 域 `covered-reassess` 三者**全零命中**亲证=新 gap id/CMD 无撞面。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀产品触面=web 三文件（`action-error.ts`/`interviews/page.tsx`/`web-logic.proof.ts`）+新增两 proof+两 package.json 注册行。**在飞支线列明（rev 时点 13+ 支线·§9-rev R7）**：`line/*` 15 支=uc004/uc011/uc028/nhp-batch-a（nhp-a）/nhp-batch-b（nhp-b）/ag14/ag18/ag20/ag32/job-autovacuum/event-ttl/cap-2354/cap-2272/bookkeeping-flip-3+本支——届时逐树必查（Ban 抽查）`git log -1 -- <文件>`，任一分支顶对触面存在主线 `47dd6be5` 之后的新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`47dd6be5`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `0cf6ae18`（519 行） | **`:125` UC-E2E-025 六列行**（NEG gap=case CLOSED(wired) frozen / FAULT gap=in-process+isolated 双收据 / **BOUND gap=in-process 单收据** / ADV blind·case-only / 行 stays gap·coveredCount=8）· **`:274` backlog 行「仍缺重押题入口 +（若要）隔离 PG/HTTP BOUND 收据」**（矩阵 `:13`/`:17` 为钉表行·非 backlog 锚）· 025 honest gap 挂行锚改挂 `e2e-covered-path-backlog.md` `05a76401`（55 行·@`47dd6be5` 亲算）：**`:13`**=gap 行「025（honest pin 已挂）」·**`:17`**=下一刀顺序 #1「UC-025 押题过期（honest gap prove 已挂）」（§9-rev R4） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648 行） | **`:331-343` UC-E2E-025**：触发=押题 succeeded 但面试 start 时已失效（过期/简历已更新/版本不匹配）· 守卫=版本 pin/新鲜度·失效拒绝 + **触发押题重生成或降级提示** · E-过期「拒绝 → **引导重押题**」· E-简历变更「重生成或显式确认」· **`:342` 验收 A1「失效产物开面试被拒，显示重押题入口」A2「简历更新后旧押题产物失配被拦」** |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918 行） | **`:131-178` 三守卫合并块**（单查 resume_quiz · 抛序 404→`stale_quiz`:158→`missing_quiz_expiry`:161/:165→**`resume_version_mismatch`:176** · 每刀先于 bind/reserve/enqueue · 无 quiz-id 整块跳过`:138` · pin NULL 旧工件不假拒`:166-168`） |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280 行） | `:22-30` begin 可选 `quiz-id` 头真收真透传（无 quiz-id=现状不变） |
| `apps/api/src/modules/quiz/quiz.controller.ts` | `9b78100d`（72 行） | `:18-31` `POST /quiz`（建壳）+ `POST /quiz/:id/begin`（扣额度入队）——重押题组合面 API 侧两块积木在位 |
| `apps/api/test/uc-e2e-025-nhp-bound.proof.ts` | `b8ff9235`（193 行） | **`:18-22` 头注自证「in-process run of the real InterviewService.begin against a recording fake DB client (no PostgreSQL, no network…) · This is NOT an HTTP/DB end-to-end run」**——BOUND 证据层现状=服务级单收据 |
| `apps/api/test/uc-e2e-025-nhp-fault-isolated.proof.ts` | `964b6b0b`（505 行） | 头注 1-24：隔离三层壳+真 Nest HTTP+真 PG timestamptz · F1–F5 注入表 · `boot` 自 `./_neg-harness`——件① 直接同族范本 |
| `apps/api/test/uc-e2e-025-nhp-adv.proof.ts` | `cf1e570b`（548 行） | AK nail ADV 面（ruler 冻结 · Ban 触） |
| `package.json`（root） | `5bdf3111`（692 行） | **`:190` `uc025:nhp-bound:prove` = `pnpm -C apps/api prove:uc025-nhp-bound` 直跑（**无 `run-e2e-isolated` 包装=in-process**）** · 对照 `:192-193` fault-isolated 与 `:196-197` adv 均 `node scripts/run-e2e-isolated.mjs …:raw` 隔离包装——隔离壳在位而 BOUND 未接=缺口机证 |
| `apps/api/package.json` | `b3614fd8`（120 行） | `:78-83` `prove:uc025-*` 六注册行（bound 无 isolated raw 对应行） |
| `scripts/run-e2e-isolated.mjs` | `f89fb27c`（3348 行） | 头注：每次自建 `meetwise-e2e-*` 容器即用即删·绝不触开发库 · 动态端口 · 迁移白名单——三层隔离壳承载 |
| `scripts/lib/uc-covered-evaluator.mjs` | `ec62c4c2`（340 行） | **`evaluate(input)` 接受 `input.requiredNhp` per-UC 映射（`:246`）** · 冻结真分支=全列 meetsCovered+§1.1+openGaps=[]+status covered（头注 Ban constant-false/constant-true）· 17 枚 refuse 枚举含 STATUS-NOT-COVERED/OPEN-GAP/CASE-ONLY |
| `scripts/uc-e2e-018-covered-lift-reassess.proof.mjs` | `5f67d2ac`（527 行） | 评估跑点先例：`evaluate(evalInput)`（`:255`）· 反同义（input 禁带 expected）· canHonestlyFlip=false 诚实非翻 |
| `apps/web/lib/errors/action-error.ts` | `e5703cb0`（106 行） | **`:58` `INTERVIEWS_BEGIN_FAILED_TEXT='启动面试失败（未预留额度）,请稍后重试;…'`** · **`:61-65` `INTERVIEW_BEGIN_DEFENSIVE_CODES` 含 `resume_version_mismatch`（`:64`）不含 `stale_quiz`/`missing_quiz_expiry`** · `:89-90` 防御码→同句兜底 · `:19-23` `ActionErrorMessage{text,href?,note?}`——**三码无重押题指引·无 `/quiz` 回链=产品口缺** |
| `apps/web/app/interviews/actions.ts` | `ab7459fc`（111 行） | **`:25-29` `beginErrorCode`：映射 miss（actionErrorMessage 返 null）→ 折叠 `begin_failed`**——`stale_quiz`/`missing_quiz_expiry` 现被折叠丢码 · `:47-58` quiz-id 头真发+409 带码回收壳 redirect |
| `apps/web/app/interviews/page.tsx` | `5cac2bd7`（226 行） | `:61-72` `?error=` 经 actionErrorMessage 渲染 · **`:68-70` href 链接文案硬编码「额度说明」**（新入口链需 hrefLabel 或等价位·零动 402 行字节） |
| `apps/web/app/quiz/page.tsx` + `quiz/actions.ts` | `906349a7`（134）/`8bd2ca2e`（30） | `/quiz` 列表页+建押题 Server Action（选简历→POST /quiz→begin）——重押题入口的目的页面**在位**，缺的是面试失败面的指引回链 |
| `apps/web/test/web-logic.proof.ts` | （未入表·改动集） | `:867-901` ERRMSG-MAP 纯函数断言族——件② 断言扩面基座 |
| `apps/api/src/modules/interview` 三守卫抛序 | （承上） | 件① 判据=AA/W 钉死口径冻结：409 `resume_version_mismatch` · 顺序 NEG→FAULT→BOUND · pin NULL 不假拒 · 无 quiz-id 跳过 · 先于 bind/reserve/enqueue |

### 0.2 派单简报核实登记（结论零变·如实精化）

1. 简报「UC-025 行未闭」——**核实成立**：矩阵 `:125` 六列原值=NEG case-closed(wired) frozen / FAULT gap / BOUND gap / ADV blind·case-only / 行 gap / coveredCount=8；`:274` backlog 残面句逐字在卷。本刀非翻面候选，属实起草。
2. 简报「BOUND 隔离收据缺」——**核实成立且机证明确**：`package.json:190` bound 注册行无 `run-e2e-isolated` 包装（对照 `:192-193`/`:196-197`）+ proof 头注 `:18-22` 自证 in-process+fake DB + W nail STILL_GAP「PG/HTTP-level BOUND → separate knife」——三层件互证。
3. 简报「重押题入口产品口缺」——**核实成立但措辞精化**：API 侧组合积木在位（`POST /quiz`+`/quiz/:id/begin`+interview begin `quiz-id` 头）；web 侧三处实缺=①三码（`stale_quiz`/`missing_quiz_expiry`/`resume_version_mismatch`）错误映射零重押题指引（`action-error.ts:58/:61-65/:89-90`）；②前两码在 `beginErrorCode` 被折叠 `begin_failed` 丢码（`actions.ts:25-29`）；③面试失败面零 `/quiz` 回链（`page.tsx:68-70` 硬编码「额度说明」）。场景 A1「显示重押题入口」的**显示半**确为真产品缺口·如实列·零 invent。
4. 简报「六列齐后 covered 评估器跑点」——**核实成立**：评估器 `evaluate(input)` 支持 per-UC `requiredNhp`（`:246`）但全仓只有 UC-018 跑点（`uc-e2e-018-covered-lift-reassess.proof.mjs`）；UC-025 零跑点=六列证据面（含件①②落件后）无诚实评估收据。

## §1 红事实（机制链·全部亲证 @`47dd6be5`）

### 1.1 场景语义（押题重入面）

UC-E2E-025（`e2e-scenarios.md:331-343`）=押题产物失效/过期作为面试输入的跨图编排：失效 → 拒绝直接开面试 + **触发押题重生成或降级提示**；E-过期后置「拒绝 → 引导重押题」；验收 A1=拒+**显示重押题入口**、A2=简历更新后旧押题失配被拦。即本场景有两半：**拒绝半**（产品 API 守卫）与**重入半**（拒绝后的重押题指引面）。拒绝半 B''/AA/W/AK 四 nail 已真接线（`interview.service.ts:131-178` 三守卫）；重入半=本刀件②。

### 1.2 六列现状（矩阵 `:125` 原值·不动）

| 列 | 现状 | 证据面 |
|---|---|---|
| NEG | gap（case `NHP-025-NEG-01` **CLOSED(wired)** frozen） | B'' 接线 nail·`stale_quiz` 409 |
| FAULT | gap | AA in-process 收据 + W `GAP-UC025-FAULT-ISOLATED-01` 隔离收据（互补不互替） |
| **BOUND** | **gap** | **W in-process 收据单层**（fake DB·无 PG/HTTP）——隔离面收据缺=件① |
| ADV | blind / `case-only` | AK 隔离 prove 收据（Ban 升 covered） |
| 产品口 | reject 已真接线；**重押题入口缺** | 场景 A1 显示半=件② |
| 行 | **gap** · coveredCount=8 | 评估器跑点缺=件③ |

### 1.3 残面分解与 §1.3 否决

- **(a) BOUND 证据层停在 in-process（真残面①·件①）**：bound proof `:18-22` 自证 NOT HTTP/DB end-to-end；W nail STILL_GAP 明文「PG/HTTP-level BOUND → separate knife」。同族先例（AA→W fault-isolated）已证升级路径可行。**否决：Ban 以 in-process 收据冒充隔离面**（同 AA_WASH 纪律·互补不互替·Ban 洗 W）。
- **(b) 重押题入口产品口（真残面②·件②·真产品缺口如实列）**：§0.2-3 三处实缺。守卫拒绝发生时用户只见「请稍后重试」（对确定性 409 是错误指引——重试不可解·场景要求引导重押题），前两码且被折叠丢码。**否决一（invent covered）：Ban 把任何 case 级证据（EXIT0/收据/组合 API 存在）叙事或登记成 covered/翻任何列行**——coveredCount=8 不动·翻面权归协调方·评估器冻结真分支 Ban 改。**否决二（live key）：Ban 在任何 prove/收据链引入真模型外呼或真 Key**——隔离面走零 provider 外呼（先例改引 UC-016 三键：`env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL` + proof 内 `envModelApiKeyUnset` fail-closed 断言·`uc-e2e-016-nhp-fault.proof.ts:22/:147`；**注意** `run-e2e-isolated.mjs:2884-2899` 凭据剥离清单不含 `MODEL_API_KEY`（live 全链 E2E 显式依赖保留）→件① 新 proof 须进程内自删 `MODEL_API_KEY` 后再断言 unset·§9-rev R6）·Ban 造 `.env*`·Key 值不入树不入 receipt。
- **(c) covered 评估跑点缺（真残面③·件③）**：UC-025 六列证据无论多齐，当前无 `evaluate()` 诚实评估收据；「六列齐后 covered 评估」=先补齐（件①②）再跑点（件③）·**跑点产出是评估不是翻面**（canHonestlyFlip 预期=false·若为 true 亦只入收据待协调方裁）。

### 1.4 修法裁决：三件并一卷（M-L）

(a)(b)(c) 三残面同源（同场景两半+评估半）·拆三刀则 三次双审/并线成本 > 合卷；合卷面互不依赖可分步落。**裁决=合卷·四件**（§1-修法）·预期零迁移零新表。

## §1-修法（预期 web 三文件改+新 proof 两件+注册四行+收据·零迁移零 API 产品码改动）

- **件①（BOUND 隔离收据·新增 2 文件+2 注册行）**：新 `apps/api/test/uc-e2e-025-nhp-bound-isolated.proof.ts`——**逐形镜像** fault-isolated `964b6b0b`：`boot`（`./_neg-harness`）三层隔离壳+真 Nest HTTP+真 PG；判据=AA/W 钉死口径**冻结**（409 `{error:'resume_version_mismatch'}` · 抛序 NEG→FAULT→BOUND · pin NULL 不假拒 · 无 quiz-id 跳过 · 先于 bind/reserve/enqueue）。注入表（镜像 F1–F5 形）：B1 简历失配（pin.resume_id≠begin resume-id）→409+零副作用快照（interview 未建/额度未扣/队列未入）；B2 世代失配（pin.privacy_epoch≠resume 现世代·resume_id 相同）→同 409；B3 pin NULL 旧工件正控→不假拒（越过 BOUND 到下一守卫/sentinel）；B4 过去时新鲜锚序控→`stale_quiz`（NEG 冻结序·仅观察非断言对象）；B5 无 quiz-id→BOUND 块整跳过行为不变。注册：root `package.json` 增 `uc025:nhp-bound-isolated:prove` = `node scripts/run-e2e-isolated.mjs uc025:nhp-bound-isolated:prove:raw` + `:raw` 行（`:192-193` 逐形）；`apps/api/package.json` 增 `prove:uc025-nhp-bound-isolated`。attempts 全台账·Ban retry-to-green。
- **件②（重押题入口产品口·恰 2 码面改+断言扩面）**：
  - `apps/web/lib/errors/action-error.ts`：新增 UC-025 三码映射行 `stale_quiz`/`missing_quiz_expiry`/`resume_version_mismatch` → `{ text: <重押题指引文案·说明押题产物过期/失配·不重复「请稍后重试」>, href: '/quiz', hrefLabel: '重新押题' }`；`ActionErrorMessage` 增可选 `hrefLabel?: string`；`resume_version_mismatch` 自 `INTERVIEW_BEGIN_DEFENSIVE_CODES`（`:64`）移除（入新行）·402 行与其余全部字节零改。
  - `apps/web/app/interviews/page.tsx`：`:68-70` 链接文案改 `{actionError.hrefLabel ?? '额度说明'}`（缺省=现字节恒等·402 行零漂）。
  - `apps/web/app/interviews/actions.ts` `beginErrorCode` 零改（映射命中后三码自动透传不折叠·`:25-29` 现逻辑即达）——如实验证即可。
  - 断言扩面：`web-logic.proof.ts` ERRMSG-MAP 族增三码映射断言（text/href/hrefLabel·+非 interviews 页域仍 null）+402 行 `hrefLabel` 缺省恒等断言；`interviews-actions.proof.ts` 增 begin 409 带 `stale_quiz` → redirect `error=stale_quiz`（码不折叠）断言。**既有断言相撞声明（§9-rev R1·如实登记）**：`apps/web/test/web-logic.proof.ts:903-908`「防御码透传」既有断言面语义重锚——`resume_version_mismatch` 移出 `:904` 四码数组、并入新三码映射断言（机理：该码自 `INTERVIEW_BEGIN_DEFENSIVE_CODES` 移除后 `:904` 对它的 begin_failed 原文断言必然红·重锚=断言随产品语义迁移·四码数组余三码与全族其余断言零弱化）。API 产品码（`interview.service.ts`/controller）**零改动**。
- **件③（covered 评估器跑点·新增 1 文件+1 注册行）**：新 `scripts/uc-e2e-025-covered-reassess.proof.mjs`——沿 `5f67d2ac` 形：`import { evaluate } from './lib/uc-covered-evaluator.mjs'`（**评估器零字节改**）·`requiredNhp` 传 UC-025 映射（NEG/FAULT/BOUND/ADV 四 case id·§0.1 锚）·六列状态由**运行时读矩阵 `:125` 行**组装（Ban fixture expected·Ban 写死结论）·断言 `canHonestlyFlip === false` **由评估器算出**（非恒真断言）+refuse 含 STATUS-NOT-COVERED 与 OPEN-GAP（如届时真值不同→如实收据·Ban 凑断言）。**矩阵行解析注（§9-rev R8）**：`:125` 行运行时解析逐列按 cell（`|` 定界）切分后取各 cell **行首状态 token** 判类·Ban 对整行做跨列子串检索（防 `coveredCount=8` 之「covered」/`CLOSED(wired)`/`case-only` 等词面被误类到错误列）。注册 root `uc025:covered-reassess:prove`。**跑点=评估不是翻面**：true/false 均只入收据·SSOT 行零触。
- **件④（收据）**：`receipts/uc025-e2e-residual/00-exec.md`（receipts/=tracked 目录·现 3312 文件在账；docs:check 零增量真因=`scripts/ai-docs/public-text-policy.mjs:36` `MANAGED_ROOTS` 十根不含 `receipts/`——非「非受管根」·§9-rev R3）七字段：门矩阵全表 EXIT 原值+改前改后 PASS 名单 diff+diff numstat+重 pin 全表+偏离清单+pins 零翻声明+改前名单摘录。**执行序定死：件③ prove 先行**（沿 `5f67d2ac` 形经 `scripts/lib/uc-covered-real-gatherer.mjs:448-461` `assertCleanPorcelain` 硬拒脏树）→**件④ 收据其后写**（收据落盘与提交均在件③ EXIT0 之后）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十一门·**数字口径以实跑实测为准·任一门红且根因不在本刀交付面=红停上报**）

1. **BOUND 隔离面翻绿**：`pnpm uc025:nhp-bound-isolated:prove` EXIT=0（B1–B5+ISO 隔离壳证据+零副作用快照全过）；改前基线 run 恰一次（bound 现行 `pnpm uc025:nhp-bound:prove` EXIT=0 名单留档）·attempts 全记录。
2. **UC-025 六证回归**：`uc025:stale-quiz-expiry:prove` / `uc025:nhp-neg:prove` / `uc025:nhp-bound:prove` / `uc025:nhp-fault:prove` / `uc025:nhp-fault-isolated:prove` / `uc025:nhp-adv:prove` 全 EXIT=0（六脚本零字节改·Ban 迁就）。
3. **web 行为面**：`pnpm -C apps/web prove`（web-logic）EXIT=0 既有断言零弱化（语义重锚允许且必登·§9-rev R1）+件② 新断言全过；`pnpm -C apps/web prove:interviews-actions` EXIT=0（三码透传断言在列）。
4. **covered 评估跑点**：`pnpm uc025:covered-reassess:prove` EXIT=0（canHonestlyFlip=false 由 evaluate() 算出·评估器 diff 零字节）。
5. **migrate:prove**：`pnpm migrate:prove` EXIT=0 链头不变（本刀预期**零迁移**·若 EXEC 期发现需迁移→触「越界需要」停上报）。
6. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径）。
7. **lint 五值**：`pnpm turbo lint` 0 errors·web/root/api/worker/ai-runtime 五值对届时主线口径恰等（任一超即停承登·Ban 顺手消偿）。
8. **docs:check（红停条款）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 ≤ cap **2346**（基线 2341 本树亲跑·本卷 +1=2342·EXEC 件①+③ 两 proof +2=2344 预期·余量 2·>2346 红停上报·cap 上抬权归协调方）。
9. **markers 五类零命中**：本刀改动集新增行五类标记词与冲突标记 grep 零命中（词面不复抄卷内防自指·命令与回执入收据）。
10. **diff 面机检**：`git diff --numstat <base>` 恰 **10 tracked 路径**（收据提交口径·写死·§9-rev R2）=件① proof.ts+件② `action-error.ts`/`page.tsx`/`web-logic.proof.ts`/`interviews-actions.proof.ts`+件③ reassess .mjs+两 package.json+本卷 .md+件④ 收据 .md（receipts/=tracked 目录·收据随 EXEC 提交入 diff）——第 **11** 个 tracked 路径即停（越界需要类·边界随十路径口径同步防自触）。
11. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·est live=0（prove 全离线隔离 PG·零模型外呼）。

## §3 范围外（边界清单·越界即 FAIL）

1. **API 产品码零触**：`interview.service.ts` 三守卫块/`interview.controller.ts`/`quiz.controller.ts` 只读（B''/AA/W/AK 四 nail ruler 冻结）——拒绝半已闭·本刀只修 web 显示半与证据/评估面。
2. **既有六 proof 零字节改**（§2-2 六脚本）·评估器 `uc-covered-evaluator.mjs` 零字节改·`_neg-harness`/`run-e2e-isolated` 零改。
3. **SSOT 零触碰**：矩阵（`:125`/`:183`/`:274`）/non-happy-path-perf-load-case-matrix/gap-bug-backlog/execution-master-checklist/e2e-covered-path-backlog 本 REQUEST 一行不改——三枚新 gap id 登记与任何行翻面权归协调方 nail。
4. **covered/翻面 Ban**：件③ 跑点产出（含若为 true）只入收据·Ban 借跑点写 covered·Ban 翻任何列/行·coveredCount=8 不动。
5. **零迁移零新表零批表件**；UI 自动化（e2e:ui）非本刀（web 行为面以离线证明承载·`prove:interviews-actions` mock fetch 形先例）。
6. 不碰 UC-E2E-018/052/004/014-026/002/011 任何行/文件。

## §4 依赖

**①上游已满足**：隔离三层壳（`run-e2e-isolated`+`_neg-harness` 在链·fault-isolated/adv 两先例）+评估器（COVERED-CRITERION nail 在链）+`/quiz` 目的页面在位=三件承载面全在树。**②无同文件并发**：web 三文件+两注册行——§0.0 在飞交叠复核 EXEC 立项日必做。**③零迁移**（§2-5）。**④下游**：三枚新 gap id 的 SSOT 登记、BOUND 列/产品口列/行的任何措辞变更、covered 翻面（若届时可 honestly flip）全归协调方 nail。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（改前/改后 run 恰各一次·红不重跑冲销·EXIT1=诚实保留如实收据）；**Ban invent covered**（§1.3 否决一·case 级证据 Ban 洗成 covered/Ban 翻行/Ban 写 coveredCount 以外任何计数翻转）；**Ban live key**（§1.3 否决二·零模型外呼·Ban 造 `.env*`/Key 值入树入据）；Ban 触 API 产品码/六 proof/评估器/隔离壳四冻结面（§3-1/§3-2）；Ban 触共享 SSOT（§3-3）；Ban 第二迁移/顺手扩面（§3-5·越界停上报）；Ban 改既有断言迁就（为绿改断言 Ban）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因门矩阵外新红。

**pins（十值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false（件③ 评估输入·非结论预设）· actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（EXEC 期 prove 全离线隔离 PG·零模型外呼·§2-11 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）五类标记词（词族沿 i6-239 门口径·词面不复抄卷内防自指）与冲突标记 grep 零命中（起草席亲跑·回执随 EXEC 收据留痕）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项不得改 §1.4 裁决与 §5 Ban/pins 与 §1-修法件①-④ 施工面规格（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：**〔post 行使翻面（2026-10-26·§9-post）**：EXEC 受阻上报后协调方 D1 追认+D2 另刀两裁已下·post 双审席1+席2 双 PASS 会签·STOP 翻终态 **`closed`**（三处=卷首/Status/页脚·本条史录 append 保史不回改）**〕**

- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（三守卫抛序/错误码锚变 · bound/fault-isolated proof 重构 · `run-e2e-isolated` 包装形变 · `evaluate()` requiredNhp 接口消亡 · web 错误映射行重构 · §0.0 在飞分支触本刀面有新增提交）→停·重 pin 回炉。
- **机制不满足**：件① B1–B5 任一臂在真 PG/HTTP 上不成立（如 pin 世代比较在真 timestamptz/int 列上口径漂移）或件② 三码映射在 Server Action 链上折叠行为不符 §0.1 锚推定 →根因诊断被证伪→停·如实升级回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法恰件①-④ 面（需触 API 产品码/评估器本体/第二迁移/SSOT/既有六 proof）→停·另刀或协调方裁决。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻套件新红/lint 超/docs:check>2346/migrate 红）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

est live=0 · markers=0 · pins 十值零翻 · ⛔push

## §9-rev（rev 修订席落卷 · 2026-10-26 · 纯文面修订 · 修法四件施工面规格零改）

**rev 输入**：pre-exec 双审席1 FAIL 单（P1×3+P2×6）→rev 回路。本节为逐条落点登记，涉文各处已随 R1–R8 就地校正（修订=笔误与误述校正·非施工面变更·§8 条款③不触）。

- **R1（P1-1 断言相撞声明）**：件②「断言扩面」增列既有断言相撞声明：`apps/web/test/web-logic.proof.ts:903-908`「防御码透传」既有断言面语义重锚（`resume_version_mismatch` 移出 `:904` 四码数组、并入新三码映射断言）·非弱化·如实登记；§2-3「既有断言零弱化」补括注「语义重锚允许且必登」。相撞机理：件② 将该码自 `INTERVIEW_BEGIN_DEFENSIVE_CODES`（`action-error.ts:64`）移除后，`:904` 数组对它的 begin_failed 原文断言必然红——不重锚则件② 不可落；重锚=断言随产品语义迁移·四码数组余三码与 ERRMSG-MAP 全族其余断言零弱化·强度只迁不降。
- **R2（P1-2 diff 计数写死）**：§2-10「恰 8 tracked 路径」为计数笔误（原枚举自和已为 9）。现写死 **10 tracked（收据提交口径）**：件① proof.ts(1)+件② 四文件(4)+件③ .mjs(1)+两 package.json(2)+本卷 .md(1)+件④ 收据 .md(1)=10——receipts/ 为 tracked 目录·收据随 EXEC 提交入 diff；「多任何 tracked 路径即停」边界随改「第 11 个 tracked 路径即停」防自触。
- **R3（P1-3 receipts 误述删除+执行序定死）**：件④ 删「仓根 receipts/=非受管根·零 docs:check 增量」误述——receipts/=**tracked 目录**（`git ls-files receipts/`=3312 文件在账）；docs:check 零增量真因=`scripts/ai-docs/public-text-policy.mjs:36` `MANAGED_ROOTS` 十根（ai-docs/apps/packages/scripts/docker/e2e/.github/.claude/ops/docs）不含 `receipts/`。执行序定死：**件③ prove 先行**（沿 `5f67d2ac` 形经 `scripts/lib/uc-covered-real-gatherer.mjs:448-461` `assertCleanPorcelain` 硬拒脏树·收据文件在盘即 DIRTY_TREE 红）→**件④ 收据其后写**（落盘与提交均在件③ EXIT0 之后）。
- **R4（P2-1 `:13`/`:17` 锚改挂）**：§0.1 原把「backlog 卷 025 honest gap 已挂行」挂在矩阵卷 `:13`/`:17`——矩阵该两行实为钉表行（releaseEvidence/HA）·锚改挂 `e2e-covered-path-backlog.md`（blob `05a76401`·55 行·@`47dd6be5` 亲算）：`:13`=gap 行「025（honest pin 已挂）」·`:17`=下一刀顺序 #1「UC-025 押题过期（honest gap prove 已挂）」。
- **R5（P2-2 行漂三处随手校正·三文件 blob 均未变=纯起草笔误非基线漂移·@`47dd6be5` 亲证）**：①bound proof 头注自证 `:16-19`→**`:18-22`**（「Evidence layers…R — in-process run…NOT an HTTP/DB end-to-end run」实文）·§0.1/§0.2-2/§1.3(a) 三处随改；②`ActionErrorMessage` `:13-15`→**`:19-23`**（interface 实文）·§0.1 随改；③evaluator `requiredNhp` `:230-231`→**`:246`**（`const requiredMap = input.requiredNhp || UC018_REQUIRED_NHP` 实文）·§0.1/§0.2-4 两处随改。
- **R6（P2-3 live-key 先例改引）**：§1.3(b) 否决二原引「`MODEL_API_KEY`/`MODEL_BASE_URL` 进程环境删除先例」不准——改引 **UC-016 三键先例**：`env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL`（`apps/worker/test/uc-e2e-016-nhp-fault.proof.ts:22` 头注+`:147` `envModelApiKeyUnset` fail-closed 断言·双保险）；并新注明：`scripts/run-e2e-isolated.mjs:2884-2899` 凭据剥离清单**不含 `MODEL_API_KEY`**（剥离注释自证其为 live 全链 E2E 显式允许的外呼依赖）→件① 新 proof **须进程内自删** `MODEL_API_KEY` 后再断言 unset（沿 UC-016 形）。
- **R7（P2-4+P2-5 计数与树数时点化）**：§2-2「五证」→**六证**（枚举本就六脚本：stale-quiz-expiry/nhp-neg/nhp-bound/nhp-fault/nhp-fault-isolated/nhp-adv）；§0.0 树数改**时点记法**：起草时点 7 树=快照非恒值·rev 时点 18 树实测（主仓+17 支线）·「无第二 uc025 同名树」两时点结论不变；在飞交叠复核列明现网 `line/*` 15 支（uc004/uc011/uc028/nhp-a/nhp-b/ag14/ag18/ag20/ag32/av/ttl/cap-2354/cap-2272/flip3b+本支）**逐树必查·Ban 抽查**。
- **R8（P2-6 件③ 矩阵行解析注）**：件③ 补注：矩阵 `:125` 行运行时解析逐列按 cell（`|` 定界）切分后取各 cell **行首状态 token** 判类·Ban 对整行做跨列子串检索——防 `coveredCount=8` 之「covered」、`CLOSED(wired)`、`case-only` 等跨列词面被误类为列状态。

**rev 时点自检（rev 席亲跑 @`76246aab2` 工作树·落卷前）**：①markers 五类探针（冲突标记+遗留标词族+假绿绕过/测试门弱化/secrets 样值·词面运行时组装不入卷防自指·沿 i6-239 门形）对本卷本次净增行 **0 命中**；②`node scripts/ai-docs/check-docs.mjs` EXIT=0·**2342 ≤ cap 2346**（rev=本卷 .md 一文件纯文本改·零新增受管文件·余量 4）；③diff 面=本卷 .md 纯文面·零码面·零迁移·SSOT 零触；④est live=0（本 rev turn 零实跑零模型外呼零 Key 加载）；⑤**STOP 终态=`draft:awaiting_pre_exec_dual` 维持不翻**——rev 落卷非开工许可·仍待 pre-exec 双审两外席 BOTH PASS 落卷+协调方对 committed SHA 明示授权（§8 三条款与四类停止条件全数继续有效·双审复审以本 §9-rev 为基·R1–R8 即席1 FAIL 单逐条回答）。

## §9-EXEC（EXEC 席落卷 · 2026-10-26 · 四件落码 @`4513dc8d4` · **受阻上报 · STOP 未翻**）

**EXEC 输入**：rev 后双审双 PASS 汇流+协调方明示授权 EXEC（committed SHA `6da9821c8` 重钉·本席按 brief 派单）。§8 三条款②③履行：立项未改 §1.4 裁决与 §5 Ban/pins 与 §1-修法件①-④ 施工面规格·§0 全量重 pin（15 项 blob/行锚全恰等·见收据 ⑤）。**EXEC 终态=受阻上报（uc028 `8f86d50a5` 同形先例）**：四件全部落码+门矩阵 10×EXIT0+1×EXIT1（基线遗留·stash 亲证非本刀根因）·**STOP 维持 `draft:awaiting_pre_exec_dual` 史录值不翻 `executed:awaiting_post_prove_dual`**——翻面语义=验收门全绿待 post dual，门② 红在案故不翻（派单 brief「任一门红…命中即停上报」停止路径·非成功路径）。

- **件①（GAP-UC025-BOUND-ISOLATED-01）**：新 `apps/api/test/uc-e2e-025-nhp-bound-isolated.proof.ts`（529 行·镜像 fault-isolated `964b6b0b` 形：`boot` 三层隔离壳+真 Nest HTTP+真 PG·B1 简历失配 409+零副作用快照/B2 世代失配 409+B2b pin 简历已失（W R3 冻结）409/B3 pin NULL 正控越 BOUND 至 bind/reserve/enqueue 202/B4 过去时序控（stale_quiz 仅观察·断言面=NEG 先于 BOUND）/B5 无 quiz-id 整块跳过 202+ISO+PIN 静态三锚）·门① **EXIT=0 27/27·attempts 1,0**（D3 REWORK=lint 零警告化·行为零改）。**live-key 隔离（R6）**：进程内自删 `MODEL_API_KEY`/`MODEL_BASE_URL` 后 pre-boot+post-boot 双断言 unset（ISO 臂在列·壳剥离清单不含 MODEL_API_KEY 的披露进 proof 头注）。注册三处：root 两行（`:193` 后逐形）+api 一行+**壳三条 additive（偏离 D1·见下）**。
- **件②（GAP-UC025-REQUIZ-ENTRY-01）**：`action-error.ts` 三码映射行（`stale_quiz`/`missing_quiz_expiry`→过期重押题指引·`resume_version_mismatch`→旧版本重生成指引·均 `href:'/quiz'`+`hrefLabel:'重新押题'`·不含「请稍后重试」）+`ActionErrorMessage.hrefLabel?` 字段+防御集移出该码（R1 语义重锚）；`page.tsx` `{hrefLabel ?? '额度说明'}` 缺省恒等；`actions.ts` `beginErrorCode` 零改如实验证（映射命中自动透传不折叠）。断言扩面：web-logic 423→427（重锚+三码映射/页域 null/hrefLabel 恒等/page 静态恒等）·interviews-actions 17→20（①b `begin 409 stale_quiz → redirect error=stale_quiz` 码不折叠臂）·门③ 双 EXIT=0 既有断言零弱化（重锚已登）。
- **件③（GAP-UC025-COVERED-REASSESS-01）**：新 `scripts/uc-e2e-025-covered-reassess.proof.mjs`（沿 `5f67d2ac` 形·评估器零字节·`requiredNhp` 传 UC-025 四 case id·矩阵 `:125` 运行时逐 cell 切分取**行首状态 token** 判类（R8·Ban 跨列子串）·`openGaps` 由 `:274` backlog 残面句运行时组装（Ban fixture））·门④ **EXIT=0**：canHonestlyFlip=false 由 evaluate() 算出·refuse 含 STATUS-NOT-COVERED+OPEN-GAP·report-only·coveredCount=8 机证保留·**评估非翻面**。
- **件④**：`receipts/uc025-e2e-residual/00-exec.md` 七字段全落（门矩阵 EXIT 原值全表/改前改后 PASS 名单 diff/diff numstat/重 pin 全表/偏离清单/pins 零翻声明/改前基线摘录）·R3 定序履行：件③ EXIT0（@commit#1 净树）→件④ 收据后写。
- **门矩阵（EXIT 原值）**：①隔离 **0**（27/27）②六证 neg/bound/fault/stale-quiz-expiry/fault-isolated **0** + **adv 1（基线遗留红）** ③web 双 **0** ④reassess **0** ⑤migrate **0** ⑥typecheck **0**（8/8）⑦lint **0**（12/12·web 601=帽贴线·api 1423=帽·0 errors）⑧docs:check **0**（2344≤2346·届值恰等 §2-8 预期）⑨markers **0**（五类探针）⑩diff **11 tracked（偏离 D1）** ⑪install frozen **0**+.env ABSENT。
- **偏离 D1（待追认）**：壳 allowlist 闭合数组机证 `unsupported_e2e_target` EXIT=1→两 package.json 注册行必不能独立达门①·壳三条 additive 注册（镜像 fault-isolated 同形+同周 uc004/uc028/ttl 三先例=package.json 行+壳三条目同 commit 形）→ §3-2 字面触+§2-10 恰 10→恰 11（第 11 路径=壳文件·既有 target 行为零改 `+16 −1`）·上询未获答按先例 best-judgment 落·**待协调方追认或回炉**。
- **偏离 D2（待裁）**：门② `uc025:nhp-adv:prove` EXIT=1=**基线遗留红**（静态 pin `anchor toLowerCase compare` 恰一命中 vs `ebba26bef` 2026-10-20 起 `beginInterviewCore` 区双命中·stash 亲证净树 @`6da9821c8` 同红 45/1·GAP_DETAIL 逐字同·AK 钉表行 :404 EXIT0 锚其当时 tip `4a804a8` 非本 tip）·本刀对 pin 输入面（service+ADV proof）零字节·Ban 借机修（双冻结面）→**待协调方裁另刀修 pin 或窄豁免**。
- **自检回执（EXEC 席亲跑）**：markers 五类探针净增行 0/0/0/0/0（词面运行时组装不入卷防自指）·typecheck 8/8+turbo lint 12/12 全 0 errors·docs:check 2344≤2346 余量 2·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT·est live=0（prove 全离线隔离 PG·零模型外呼·零 Key 加载·attempts 全台账 1,0+基线 stash 双跑在收据）·SSOT/评估器/六 proof/API 产品码/`_neg-harness` 零字节（numstat 机证）·coveredCount=8 不动。
- **STOP 终态=`draft:awaiting_pre_exec_dual` 维持不翻（史录值）**——受阻上报非开工/收口许可；post-prove dual 待协调方两裁（D1 追认+D2 裁决）后派单；Ban self-approve · alone≠dual · ⛔push ⛔merge 主线 ⛔force push。

## §9-post（post 双审双 PASS 会签席落卷 · 2026-10-26 · 协调方 D1 追认+D2 裁决已下 · **STOP 三处翻面 `closed`**）

**post 输入**：EXEC 受阻上报（§9-EXEC·STOP 史录值 `draft:awaiting_pre_exec_dual` 维持在卷）→ 协调方两裁已下：**D1 追认**（11 tracked 口径合规——壳 `run-e2e-isolated.mjs` 三条 additive 注册沿同周 uc004 `9e17c3713`/uc028 `8f86d50a5`/ttl `8a79c0b46` 三先例同形·既有 target 行为零改）；**D2 裁决**（门② `uc025:nhp-adv:prove` EXIT=1=基线遗留红·非本刀交付面·**另刀登记修复**（ADV 静态 pin「恰一命中→按符号锚随演」）·本刀窄豁免·Ban 借机修奉行）。中间态 `executed:awaiting_post_prove_dual` 因受阻路径未落（史录 provenance 不回改）·本席 post 双审双 PASS 会签后**对账直翻终态 `closed`**（沿 ag20 `#133` 对账翻面先例·卷 closed ≠ 矩阵行/SSOT 翻面——行翻面权归协调方 nail·canHonestlyFlip=false report-only 在案）。

- **席1 PASS（独立亲证）**：①**27 断言独立抽验**：`pnpm uc025:nhp-bound-isolated:prove` 复跑 **EXIT=0·total=27 fail=0**（B1–B5+ISO+PIN 全 HIT·隔离容器即用即删·`LOCAL_ISOLATED_PROOF_RECEIPT release_evidence=false`）；②**机制层三守卫块读码**：`interview.service.ts` `:140-178` 抛序亲读=404 `not_found_or_forbidden:151-152`→NEG `stale_quiz:157-158`→FAULT `missing_quiz_expiry:161-162/:164-165`（NULL/NaN fail-closed 双臂）→BOUND `resume_version_mismatch:173-176`（pin NULL `:170` 不假拒）·无 quiz-id `:140` 整块跳过·先于 bind/reserve/enqueue（`:131-139` 注释+块位机证）——件① 判据五臂与机制逐条对上；③**D1 allowlist 旧行+1 token 恒等机证**：allowlist 行 token 级 diff 旧 **55**→新 **56** token·`diff` 恰 `44a45 > uc025:nhp-bound-isolated:prove:raw` 一行（零删零改·旧行逐 token 恒等）+壳全 diff 恰 3 additive 块（isolatedReceiptSources 条目/allowlist 行内插位/isolatedCommand 分支·既有 target 行为零改）；④**D2 regex 恰 2 命中实算**：`/toLowerCase\(\)\s*!==\s*resumeId\.toLowerCase\(\)/` 于 `interview.service.ts` 全文件恰 **2** 命中（`:173` pinnedResumeId BOUND 守卫+`:188` existingResumeId `interview_resume_binding_conflict` 守卫·两处均在 `beginInterviewCore`（`:102` 起·次函数锚 `:414` 前）区内）→`uniqueHit` 返 null→红·归因链成立。
- **席2 PASS（独立亲证）**：①**web lint 601/600 双边界**：`eslint .`（apps/web）亲数 **warnings=601·errors=0**——恰等帽 601 贴线（`--max-warnings 601`·602 即红）且 >600（真实贴帽非低于·双边界读法两半均证）；②**web-logic 427/interviews-actions 20 静态亲数**：`web-logic.proof.ts` 静态 `A(` 位点 **427**（base `6da9821c8` 423·+4 恰等件② 断言名单）·`interviews-actions.proof.ts` 静态位点 **19**（base 16·+3 恰等①b 臂）+runtime 复跑 EXIT=0；③**pins 十值逐值对树**：checklist `:173` 钉行（haStatus=NOT_HA/claimProductionHA=false/gR45Closed=true/ms3EqualsR4Closed=false/PG-retained/public DELETE=503/coveredCount 8）+矩阵 `:125` `coveredCount=8`+件③ 复跑 live 评估 **canHonestlyFlip=false**（refuse 含 STATUS-NOT-COVERED+OPEN-GAP）+isolated 收据 `release_evidence=false`+est live=0→actualSpendCny=null——**十值零翻**；④**R3 定序 commit#2 恰 2 docs 机证**：`e45eade53` 恰 2 文件（本卷 .md+收据 .md·全 docs 面）且序在 code commit `4513dc8d4`（件③ EXIT0 先行→收据后写）之后；⑤**D2 ebba26bef 祖先机证反证为真**：`git merge-base --is-ancestor ebba26bef 6da9821c8` **EXIT=0**（对 `47dd6be5` 亦 0）——`ebba26bef`（2026-10-20 `fix(api): 重复开始按同一简历标识认`）确为 base 祖先→「潜伏红先于本刀」反证为真。
- **双 PASS 会签**：席1+席2 两独立审查全数 HIT 零新偏离·两席均 PASS·协调方会签（会签=对两席独立亲证 PASS 的确认·非代签·alone≠dual 纪律全程奉行）。
- **P2 登记（不阻塞·随卷存证）**：①**interviews-actions 计数口径注**：断言计数口径=**静态位点（16→19·runtime 19 含末横幅）**——EXEC 收据「17→20」系 runtime+末横幅记法·静态位点口径 16→19（+3 恰等①b 臂·两口径差=末横幅 1 行·零断言增减分歧·收据侧随 P2 勘误注对齐）；②**件③ tmp status 标签零 SSOT 效力注**：`scripts/uc-e2e-025-covered-reassess.proof.mjs:228` 向 gitignored `.tmp/uc025-covered-reassess-canHonestlyFlip.json`（`.gitignore:15`·树净机证 `git check-ignore` EXIT=0）写 `"status": "executed:awaiting_post_prove_dual"`——该标签=运行时 tmp 工件零 tracked 效力·状态 SSOT 惟一=本卷 Status 行（本席已翻 `closed`）与 checklist；tmp 标签不构成任何翻面/状态声明·Ban 据其主张任何状态。
- **STOP 终态=**`closed`**（三处翻面=卷首标题/Status 行/页脚·§8 保史括注·§9-rev/§9-EXEC 史录 token 保留为 provenance 不回改）**——翻面依据=四件落码在树+门矩阵 10×EXIT0（门② 红经 D2 裁定基线遗留另刀）+D1 追认+post 双审双 PASS 会签；后续=并线 PR 走 main（fetch origin/main 亲证届值→merge-tree 预演→merge --no-ff→CI 全 success→PR merge）·SSOT 行/矩阵/backlog 翻面权仍归协调方 nail（canHonestlyFlip=false 不变·本节 append 纯文面零码动）。

---

*UC-025 E2E 残面 REQUEST · 2026-10-26 起草 · **`closed`**（2026-10-26 post 双审双 PASS 会签对账翻面·协调方 D1 追认+D2 另刀两裁已下·沿 ag20 `#133` 先例·中间态 executed:awaiting_post_prove_dual 受阻未落） · base `main` @`47dd6be5` · 分支 `line/uc025-draft` · 工作树 `meetwise-uc025` · 修法四件=BOUND 隔离收据（`GAP-UC025-BOUND-ISOLATED-01` · mirror fault-isolated · B1–B5）+重押题入口产品口（`GAP-UC025-REQUIZ-ENTRY-01` · web 三码映射+/quiz 回链/hrefLabel·API 零触）+covered 评估器跑点（`GAP-UC025-COVERED-REASSESS-01` · evaluate() per-UC requiredNhp·评估非翻面）+收据 · 场景 A1「显示重押题入口」显示半=真产品缺口如实列 · 否决=invent covered / live key · 门矩阵十一门 · STOP 史录=draft:awaiting_pre_exec_dual（起草时点·现 `closed` 见 §9-post）· Ban coding · Ban prove · Ban push · STOP · **§9-EXEC 2026-10-26 append：受阻上报·四件落码 @`4513dc8d4`·门 10×EXIT0+adv 基线遗留红·STOP 未翻（史录值维持）·见 §9-EXEC 与 `receipts/uc025-e2e-residual/00-exec.md`** · **§9-post 2026-10-26 append：D1 追认 11 tracked+D2 基线遗留红另刀两裁已下·post 席1+席2 双 PASS 会签（27 断言复跑/三守卫读码/D1 token 恒等/D2 恰 2 命中+ebba26bef 祖先反证·lint 601 贴线/427+19 静态亲数/pins 十值对树/R3 定序恰 2 docs）·P2 两登记（interviews-actions 口径注+件③ tmp 标签零 SSOT）·STOP 三处翻面 `closed`·见 §9-post***
