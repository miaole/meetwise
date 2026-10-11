# DIAG-HONESTY REQUEST（诊断诚实处置统一 · #213 新立项 · S 体量）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工）

**席位**：#213 DIAG-HONESTY EXEC 任务书起草席（北星 loop · #213 新立项 · S 体量 · 诊断诚实处置统一）。
**基线**：`feat/mysql-schema-skeleton` @ `899cab1a`（主线最新 tip·`git rev-parse --short HEAD` 实测）。分支 `line/diag-honesty`·工作树 `meetwise-diag`（`git worktree add ../meetwise-diag -b line/diag-honesty 899cab1a` 本起草席已立·树/分支建前实查不存在）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` **#213=:478**（P3·AI能力缺口·传简历·原文+证据列+修法列逐字誊录见 §0.1/§1）②相关项 #259（target-role 供给线=既有面·本刀只读不并）③形制沿 `h2-qbank-corpus-REQUEST.md`（meetwise-h2q 树 @`11191e9e`·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `899cab1a`·file:line 逐条 rg/sed 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 #213 原文（issues-master 更正版 :478·逐字）

> P3·AI能力缺口·传简历：「同一份诊断里"虚构"的处置强度不一致：改写编一个数字→整份失败退款；finding 不接地→静默剔除且前端不展示 rejectedCount；match 维度没有任何岗位侧事实可对照」（证据列 `apps/worker/src/interview-service.ts:240-251`；`packages/ai-graphs/src/resume-diagnosis.ts:60-76`；`packages/ai-runtime/src/prompts.ts:50`）｜修法列：「统一处置口径；展示"剔除 N 条"；无岗位时不出 match」｜相关项 #259。

**证据列漂移登记**（旧锚 vs `899cab1a` 实测）：`interview-service.ts:240-251` 现为 quiz 生成+withGenerationProgress 区（实测 `sed -n '240,251p'`）——改写硬闸实锚已漂至 `:262-287`（§0.4）；`resume-diagnosis.ts:60-76`（validate 节点）实测仍准；`prompts.ts:50` 实测为上一 service 块收尾 `},`——resume-diagnosis.generate 块现 `:51-63`。

### 0.2 rejectedCount 半改进面（后端已通·前端零展示）

| 面 | 实测 |
|---|---|
| 图状态 | `packages/ai-graphs/src/resume-diagnosis.ts:52` `rejected: Annotation<number>`（行尾注释「factuality 门过滤掉的 finding 数(可观测)」） |
| 过滤计数 | `resume-diagnosis.ts:60-76` validate 节点：`:64` `isClaim = CLAIM_KINDS.has(sec.kind)`·`:65-68` 无依据/不接地 finding 剔除·`:69`/`:74` `rejected +=` 累计（findings+rewrites 两臂） |
| 入报告 | `resume-diagnosis.ts:85` `const report: DiagnosisReport = { ...d, groundedCount, rejectedCount: s.rejected };`（类型接口本体 `:40`·`rejectedCount: number`「被歪曲门过滤的 finding 数」·pre-exec 席1 锚勘误） |
| API 透传 | `apps/api/src/modules/diagnosis/diagnosis.service.ts:97-100` `get()` 返回 `{ id, status, targetRole, report: row.report ?? null }`——report jsonb 整体透传，rejectedCount 已在其中·**零 API 缺口**（apps/api 面·web 层取数通路缺口见下「数据通路」行） |
| 前端展示 | **`rg rejectedCount apps/web` → 零命中**（exit=1 实测）——数据到页面断链；渲染面=`apps/web/components/DiagnosisPanel.tsx`（`:105` `view.sections.map(...SectionCard)`·`:109` `view.rewrites.length > 0 &&` 条件渲染先例·`:152-154` 空态分支） |
| 数据通路（pre-exec 双审席2 FAIL 根因·起草席落卷实测复核） | 渲染面数据全走 SSE：`DiagnosisPanel.tsx:75` `useDiagnosisStream(diagnosisId)`（import `:9`）→`useDiagnosisStream.ts:23` fetch `/api/diagnosis/[id]/events` →`diagnosis-state.ts:12-27` 事件族（progress/section_ready/rewrite_ready/diagnosis_ready/diagnosis_unavailable/error）**无 rejectedCount**→`diagnosis-lifecycle.ts:75` 注释「终态 diagnosis_ready 只带摘要计数」/:78 终态事件只带 overall/summary/sectionCount/rewriteCount（report jsonb 全量落库在 `:68-71` UPDATE）——SSE 面取不到 rejectedCount；web 代理层 `apps/web/app/api/diagnosis/[id]/` 下仅 `events/route.ts`（ls 实测·无 GET 详情代理路由）——web 侧现无取 rejectedCount 的既有通路·须 web 层补取数（§1-① 采路B） |

### 0.3 targetRole 供给线（已通·但 prompts 五维固定含 match）

| 环 | 实测 |
|---|---|
| web | `apps/web/app/diagnosis/actions.ts:9` `const targetRole = String(formData.get('targetRole') ?? '').trim();`·`:17` `if (targetRole) headers['target-role'] = targetRole;`（非空才发头·#259 同形制） |
| controller | `apps/api/src/modules/diagnosis/diagnosis.controller.ts:27-28` `begin(..., @Headers('target-role') targetRole?: string)` → `this.diagnoses.begin(req.principal, id, resumeId, targetRole)` |
| service | `diagnosis.service.ts:26-28` begin role 归一化（trim/`slice(0,100)`/空→undefined）·`:51`/`:54` `SET target_role=$3` 落库 |
| worker 取数 | `apps/worker/src/diagnosis-lifecycle.ts:20-28`（`:20` 注释「Read role from the parent row, never from a queued JSON payload」·`:22` `SELECT target_role FROM resume_diagnosis`·`:28` null→undefined）·`:51` `buildResumeDiagnosisGraph({ generate: diagnosisGenerator(pool, owner, facts, role, ...) })` |
| generator | `apps/worker/src/interview-service.ts:270` `diagnosisGenerator(..., role: string \| undefined, ...)`（第 4 形参）·`:288` `promptedModel(model, 'resume-diagnosis.generate', { facts: resumeFacts, role })` |
| prompt | `packages/ai-runtime/src/prompts.ts:59` buildData `const role = v.role ? \`目标岗位:${String(v.role)}\n\` : '';`（role 条件拼段）——**但** `:54` 五维固定：「从五个维度评估:structure(结构)、completeness(完整性)、highlight(亮点)、risk(风险/硬伤)、match(岗位匹配度)。」+ `:57` JSON 模板 kind 枚举五值固定 `"structure|completeness|highlight|risk|match"`——**无 role 仍要求 match 维度**（岗位侧事实为零·模型只能凭空对照） |
| 枚举/校验面 | `packages/ai-graphs/src/resume-diagnosis.ts:20` `DIAGNOSIS_SECTION_KINDS = ['structure','completeness','highlight','risk','match']`（五值）·`:24` `CLAIM_KINDS = new Set(['highlight','match'])`（match 属正面信用声明维度·空 refs 剔除）·`apps/worker/src/interview-service.ts:188` `kind: z.enum(DIAGNOSIS_SECTION_KINDS)`·`resume-diagnosis.ts:81` 校验语义=kind∈枚举（**非必须全维齐备**——sections 数组缺 match section 即合法） |

### 0.4 改写硬闸→整份失败→退款链（零翻面）

| 面 | 实测 |
|---|---|
| 分层注记 | `apps/worker/src/interview-service.ts:262-268` 头注：「**分层接地业务闸**：① schema 校验(枚举/区间)→ ② business validator…findings 的接地由图侧 validate 节点优雅过滤」——改写硬闸 vs finding 优雅剔除的**处置不对称已在码内注记为有意分层** |
| 注释原话 | `:266`「任一不过 → 整次诊断走失败路径(绝不交付一份教人编造经历的诊断)」 |
| 硬闸体 | `interview-service.ts:274-287` businessValidate：`:282` `rewrite_unanchored`（无锚）·`:283` `fabricated_experience`（refs 接地于简历 facts）·`:284` `fabricated_metric`（after 编造简历里没有的数字）——任一命中→`:290` throw→整份失败 |
| 失败退款 | `apps/worker/src/diagnosis-consumer.ts:55-59`：`:55` resume_diagnosis 置 `status='failed'`（不倒退已 ready）·`:57` `diagnosis_unavailable` 终态事件（北极星无静默死胡同）·`:58-59` `releaseConsumption` **失败退款**（预留 1.0 必释放·幂等 key=diagnosisId） |

**「统一处置口径」属产品决议**：行为分层是否改为统一=产品裁定权，起草席不行使（§1-③ 以决议文档化落）。

### 0.5 依赖面（零重叠实测）

H2 现卷（`h2-qbank-corpus-REQUEST.md`·meetwise-h2q 树）触面=qbank-seed/qbank-ingest/adaptive-interview-service/interview-consumer/routing(job-route-decision·candidate-route)/crag/main/qbank-track-local-*——本刀触面=resume-diagnosis.ts/prompts.ts 诊断段/web diagnosis 页/interview-service 诊断段/diagnosis-consumer（回归只读）**零文件交集**→可即时独立立项。另：`diagnosis-lifecycle.ts:46-48` #209（空 facts 前置拦截）为相邻件·不进本刀。

## §1 修法（三件·#213 修法列「统一处置口径；展示"剔除 N 条"；无岗位时不出 match」逐条固化·file:line 实锚·EXEC 立项重 pin）

### ① 前端「已剔除 N 条无依据结论」展示（修法列·展示"剔除 N 条"）

- **数据通路定死（pre-exec 双审席2 FAIL 根因·协调方裁定采路B·原直读表述撤回——实测证伪见 §0.2「数据通路」行）**：SSE 事件族无 rejectedCount·终态只带摘要计数·web 代理层仅 events 路由（§0.2 实测）——既有形态下 web 取不到 rejectedCount。修法=web 层补取数通路：**新增 `apps/web/app/api/diagnosis/[id]/route.ts` GET 代理路由**（镜像同目录 `events/route.ts` 形制·透传既有 GET `/diagnosis/:id`（`diagnosis.service.ts:97-100` report jsonb 整体返回）·**零后端 API 改**）+ `DiagnosisPanel.tsx` panel ready 后经代理路由取数喂视图（SSE 流式渲染面照旧·取数仅补 rejectedCount 展示面）。
- 落点=`apps/web/components/DiagnosisPanel.tsx` + 新增 `apps/web/app/api/diagnosis/[id]/route.ts`：沿 `:109` `view.rewrites.length > 0 &&` 条件渲染先例，`rejectedCount > 0` 时于 sections 渲染区（`:105` 附近）出可见条「已剔除 N 条无依据结论」（N=`report.rejectedCount`·具体文案/位置=EXEC 裁决·须含"剔除"字样可断言）。
- `rejectedCount=0` 或字段缺省 → **零渲染**（不新增常态噪声）；计数语义零改（图侧 validate 节点 `:60-76` 零触·前端只读）。
- 如实纪律：N=图侧 factuality 门过滤实测计数·**禁夸大禁淡化禁改写数值**。

### ② match 维度 role 条件化（修法列·无岗位时不出 match）

- `prompts.ts:54` 五维句改**条件组装**：有 role → 五维照旧（`:54`/`:57` 逐字保持·零语义漂）；无 role（undefined/空）→ 维度枚举剔除 match（四维）+ `:57` JSON 模板 kind 枚举联动（去 match 选项）。
- **schema kind 联动**：`DIAGNOSIS_SECTION_KINDS`（`resume-diagnosis.ts:20`）与 `z.enum`（`interview-service.ts:188`）**枚举本体不动**（五值全量保留·有 role 照旧）——无 role 时模型不产 match section 即合法（§0.3 校验语义实测：kind∈枚举·非全维齐备）；validate 节点（`:60-76`）与 `CLAIM_KINDS`（`:24`）对 match 缺席自然无害（Set 查找零命中）。
- 语义边界：无 role 诊断响应**零 match section**·**不伪造岗位侧对照事实**（修法列原意）；有 role 面 match 生成质量/评测=ai-eval 面·本刀不碰（§3）。
- **残留显式登记（pre-exec 席1）**：无 role 剔 match 属 prompt 供给面约束、非 validator 强制——不听话模型仍可产 match kind 过 `resume-diagnosis.ts:81`（kind∈枚举即合法）落地；该残留归 ai-eval 面（§3-5）·决议文档或 EXEC 收据显式登记。

### ③ 统一处置口径=升格为显式产品决议文档（修法列·统一处置口径·不发行行为变更）

- 把 `interview-service.ts:262-268` 分层注记升格为**显式产品决议文档**（W9 三态口径）：①改写虚构（unanchored/fabricated_experience/fabricated_metric）→ fail-fast 整份失败+退款（`:274-287`+`diagnosis-consumer.ts:55-59`）②finding 不接地 → 图侧优雅剔除+rejectedCount 计数（`:60-76`）③接地通过 → 正常交付。文档须如实记录不对称理由（改写量化造假=确定性可检出故 fail-fast·finding 接地=概率性故纵深过滤）并标注「统一与否=产品裁定权·现行为=有意分层」。
- **行为零改**：`interview-service.ts:274-287` 硬闸与 `diagnosis-consumer.ts:55-59` 退款链语义字节不动（§3-1）——「统一处置口径」以文档化落·不以改码落。
- 决议文档落点=EXEC 裁决（建议 `ai-docs/` 下决议文档·与本刀 EXEC 改动同卷交付）；**决议签认=协调方**（产品决议非起草席/EXEC 行使）。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin）

1. **rejectedCount 展示断言**：rejectedCount>0 时页面可见 N——`web:prove`（根 `package.json:233` `pnpm -C apps/web prove`）新增断言·形制沿既有 `apps/web/test/web-logic.proof.ts:875-882` `A('…', /正则/.test(readSrc(…)))` 静态源断言先例（对 DiagnosisPanel 源断言 rejectedCount 条件渲染与"剔除"文案）；**数据通路锚**（pre-exec 席2）：新增代理路由存在断言（`apps/web/app/api/diagnosis/[id]/route.ts` GET·镜像 events 形制）+panel ready 后取数接线静态源断言；rejectedCount=0/缺省零渲染负断言同拍。
2. **无 role 零 match**：role=undefined → prompt 组装产物（system 维度句+JSON 模板 kind 枚举）零 match（prove 用 mock model/静态断言·不实调 LLM）；诊断响应 sections 零 match section 断言。
3. **有 role 照旧**：role 给定 → 五维句/JSON 模板与 `899cab1a` 基线逐字同（diff 零语义漂）；match section 正常产出口径不回归。
4. **fabricated_metric 硬闸链零翻**：`interview-service.ts:284` 硬闸→`:290` throw→`diagnosis-consumer.ts:55-59` 终态失败+`diagnosis_unavailable`+`releaseConsumption` 退款——既有 prove/回归断言 EXIT 原值（§0.4 全链只读·零 diff 即零翻）。
5. **rejectedCount 计数回归**：resume-diagnosis 图 validate 节点剔除计数既有 prove 不回归（`:60-76` 零 diff）。
6. **回归面随改随核**：`web:prove`（根 `package.json:233`·既有 `apps/web/test/web-logic.proof.ts:560-592` 诊断 SSE 断言随跑）/`interview:prove`/`diagnosis:prove`（根 `package.json:248`·跑 `apps/worker/test/diagnosis.proof.ts`·最相关面：`:131` rejectedCount=2 既有断言/:160-167 fabricated_metric 硬闸链/:146-158 experience 失败退款链）EXIT 原值·base 同红登记不洗（E5 流程·批前实测基线入收据）。**重跑集勘误（pre-exec 席1）**：ai-graphs 面移出诊断重跑集、改列 worker `diagnosis:prove`——`packages/ai-graphs/test/` 实测无诊断图证明（仅 adaptive-interview/career-path/decide-signals/resume-quiz 四 proof·诊断图证明实锚 `apps/worker/test/diagnosis.proof.ts`）。
7. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **改写硬闸链行为不改**：`interview-service.ts:262-268`/`:274-287` 与 `diagnosis-consumer.ts:55-59` 语义字节零动——「统一处置口径」=决议文档化（§1-③）非改码；硬闸阈值/错误码/退款语义零改。
2. **#209/#259 相邻件不并**：#259 target-role 供给线为既有面（§0.3）零改；#209 空 facts 前置拦截（`diagnosis-lifecycle.ts:46-48`）零触。
3. **H2 卷六项不触**：qbank 语料/导入/难度/检索/rubric/近重复/candidate-route 全部零触（§0.5 零文件重叠）。
4. **#200/#201 仍挂账**：押题题作 planner 输入/planner 上限不进本刀。
5. **match 质量面不碰**：有 role 时 match 生成质量/岗位侧事实供给/评测=ai-eval 面·本刀只做 role 条件化机械面。
6. **rejectedCount 计数语义零改**：图侧 validate 节点（`resume-diagnosis.ts:60-76`）与 API 透传（`diagnosis.service.ts:97-100`）零 diff——前端只读展示。
7. **est live=0**：零模型外呼（§6）·零生产操作·零 secrets·零新库表零迁移。

## §4 依赖

**零**。零文件重叠 H2 现卷（§0.5 实测）→ 可即期 EXEC 立项；零新库表零迁移零 secrets；web 展示=web 层新增 GET 代理路由取数+panel 渲染（零后端 API 改·§1-① 采路B）·prompt 条件化为组装面改写·决议文档为 docs——三者皆无前置刀。

## §5 Ban 列表 + pins（沿 h2 卷同源·逐字誊）

**Ban 列表**（h2 卷 §6 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀零迁移）；Ban 触其他工作树；Ban 伪造已问/已验来源（零机制现状不假称既有）；**本刀增补**：Ban 静默丢弃 rejectedCount（>0 必可见）；Ban 前端夸大/淡化剔除计数（如实·可数·禁改写数值）；Ban 无 role 伪造 match 对照（修法列原意「无岗位时不出 match」）；Ban 有 role 面语义漂（五维句/JSON 模板逐字保持）；Ban 改写硬闸与退款链行为变更（§3-1·口径=文档化非改码）；Ban 伪造「处置口径已统一」宣称（行为分层保持·决议文档如实登记·签认=协调方）；Ban 改图侧计数语义（§3-6）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

## §6 est live=0

本刀零模型外呼：①web 展示=web 层代理路由取数+panel 渲染（零后端 API 改·静态 prove）②prompt 条件组装=组装面改写（prove 用 mock model/静态断言·不实调 LLM）③决议文档=docs。prove 全 mock/静态·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/diag-honesty-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 h2 卷 §5 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**登记（pre-exec 席1）**：#213↔W9 LEDGER 显式映射——`ai-docs/delivery/harness/product-campaign-LEDGER.md` `:58`（批2「其他」行含 #213）/:69（口径三态标注刀 W9 行）——决议文档签认时补登 LEDGER（本体共享 SSOT 只读·§5 Ban·本刀零触）。

---

*DIAG-HONESTY REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`899cab1a` · 分支 `line/diag-honesty` · 工作树 `meetwise-diag` · 蓝本=更正版 issues-master #213（:478 原文/修法列逐字）+ 形制 h2-qbank-corpus-REQUEST（meetwise-h2q 树·Ban/pins 同源誊录）· 三件=①rejectedCount 前端展示（web 层 GET 代理路由取数·零后端 API 改）②match 维度 role 条件化（prompts :54/:57 条件组装·枚举本体不动）③处置口径决议文档化（W9 三态·行为零改）· 改写硬闸链零翻 · H2 六项零触 · #209/#259/#200/#201 不并 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
