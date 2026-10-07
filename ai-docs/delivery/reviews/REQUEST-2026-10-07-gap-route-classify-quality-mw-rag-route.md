# REQUEST — **红① route/classify 输出质量校准刀**（根因候选 + 修复候选 + trio 复跑方案 · ≠ suite green）· pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · Disclosure-1 OPEN
**Expert**: `mw-rag-route`（route/taxonomy/policy 语义域首责 · 与 mw-model-op 双域交界并审）
**Knife**: `harness/gap-route-classify-quality.md` · slice `gap-route-classify-quality.slice.md`
**上游**: G7S trio 收据 `receipts/gap-begin-snapshot-supply-fix/`（C-MO-Q2 定谳 `validation_rejected` ×2）· G7S POST dual BOTH PASS · coordinator nail `c4546f7b` **C-MO-P1**（红①另刀指名 + 三 Ban：Ban G7S 域内修/Ban 弱化 `validateModelRouteOutput`/Ban 夹具强造=masking）
**Base tip**: `c4546f7b`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip = 预期 G7S nail · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7T**

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
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| Trio | **OPEN**（EXIT 1/1/1 retained · 红① STILL OPEN `execution-master-checklist.md:1321`） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态） |
| `actualSpendCny` | **null**（Ban invented spend） |

## 请审什么（mw-rag-route · taxonomy/policy 语义 / 规则词典边界 / route 决策状态机 / 消费链零回归）

Line G7T · **红① route/classify 输出质量校准刀**（C-MO-P1 指名承接）。已定谳层（承卷不重裁）：classify 调用成功但输出未过 `validateModelRouteOutput` → `validation_rejected` sticky → 无 binding → `interview_ineligible_route` 409 → 30s 超时。本刀问题=**为什么输出过不了校验**。请审（route 语义首责面）：

### A. 根因候选排序（REQUEST 假设 · EXEC 期 `reason_codes` 判别定谳）

| 排序 | 候选 | 拒因码 |
|---|---|---|
| RC-1 | margin 恒等自洽失败（`validateModelRouteOutput` `:149-152` 要求 marginBps **逐位等于** top1−top2 且 ≥1000 · prompt 零多叶示例） | `conflict` |
| RC-2 | bps 算术：sum≠10000（`:139`）或单桶 <500（`:136`） | `invalid_schema` / `calibration_failed` |
| RC-3 | low_confidence（`:141` <7000 · OOD 输入诚实自评） | `low_confidence` |
| RC-4 | 叶覆盖不足（模型发明 8 叶枚举外 leaf） | `taxonomy_invalid` |
| RC-5 | 半执行拒分（空 allocations+空 reasonCodes → `:123`） | `invalid_schema` |

读数约束（G7S CMD2）：`validation_rejected` 非 `known_not_sent` → **reasonCodes 为空、JSON 形状合法**（zod 失败/fence 漂移已排除）——完整拒分不在候选。红①输入亲核：`recruiting-bound.spec.ts:81-82` title=`浏览器绑定岗位-<hex>` / competencies=`高并发, 幂等, 限流` / **description 恒空**（`JobCreateForm.tsx` 无该输入字段）→ 规则词典零命中（歧义词刻意不映射 `:66-70`）→ 模型路径必然，典型 OOD。

### B. 修复候选（双审+协调方裁决后方可 EXEC · 一次只落一个 · 单变量归因）

- **候选 A（实现方推荐）**：prompt 校准 v2（`job.route-classify.v1` `p.v1→p.v2`）——多叶 few-shot（margin 减法演示）+「成功⇒reasonCodes=[]；拒分⇒allocations=[]且 reasonCodes 非空」双向指令 + 万分比反直觉提示 + confidence 校准锚。恰 `prompts.ts` 一文件 · 零校验零 DDL 零 taxonomy 改动。
- **候选 B**：规则词典校准——`RULE_SIGNALS['backend/general']` 扩『高并发/幂等/限流/分布式/微服务』类词（红①输入 rule 层直判 0 外发）。**须升 `JOB_ROUTE_POLICY_VERSION`**；**与 `:66-70` 刻意设计直接张力**（歧义词不映射正是防『全栈扩散所有语言桶』）——须逐词论证不重开扩散面（本域首责裁决点）。
- **候选 C**：叶枚举扩展 `TAXONOMY_V1_LEAVES`（如 `backend/distributed`）+ 0086 种子同构 migration + taxonomy version 演进 + 消费链（snapshot/planner/serving_scope）全链核对——**仅 EXEC 判别 RC-4 主导才立项**。
- **默认不选（Ban）**：弱化 `validateModelRouteOutput`（C-MO-P1 明文 · 阈值/恒等/枚举/sum 全零松动）；sticky 自动重试（新产品语义另立卷）；夹具强造 route metadata（=masking）。
- 排序先验 A ＞ B ＞ C；A+B 组合合法但须双审显式批准；判别推翻排序即停如实迭代。

### C. prove 方案（摘要 · 全文 harness §3）

EXEC 诊断前置（先诊断后修复）：(1) `job_route_decision.reason_codes` SELECT-only 判别（G7S 未查询的既有留痕 · 沿 sidecar 白名单先例 Ban `ai_invocation_trace.output`）；(2) live 定向回放 N≤20（红①同形输入直打 classify · 内存回放校验器观测拒因分布后即弃 · **Ban 原始输出落盘/入 receipt** · 单独报备）→ 修复落码 → trio 三 CMD **各恰好一次**（iso→ui→perf · wiring `package.json:278/:279/:282` @`0afb3bd2`）· 预算 ≤200 · Key 进程环境 name-only · Ban `.env*` · 七字段逐 attempt 全记录 · 收据 `receipts/gap-route-classify-quality/`。

### D. EXIT 契约（摘要）

红①清除 → CMD2 向全绿推进；红③ `full.e2e.ts:203` 独立留 C-MO-P3 另刀（Ban 为绿改断言）；`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链；仍红 → EXIT=1 原值 + RC 排序修正如实登记 → 迭代刀重走 REQUEST。

## 请专家回答

1. RC-1~RC-5 排序在 route 语义域是否成立？`RULE_SIGNALS`/`TAXONOMY_V1_LEAVES`（`job-route-classifier.ts:19-28/:71-80` @blob `79ceded8`）判读是否有遗漏候选（含 EXEC 期应增补的判别查询）？
2. 候选 B 与 `:66-70` 刻意歧义设计的张力如何裁——逐词放行标准是否可立（哪些词永不入词典）？`JOB_ROUTE_POLICY_VERSION` 升版义务是否足够？
3. 候选 A 的 prompt v2 方向（few-shot/双向指令/万分比提示/confidence 锚）在不动校验语义的前提下是否足以让真实 qwen-plus 输出过闸？是否有 prompt 侧更优形状？
4. 消费链零回归核对点：rule 层扩词（候选 B）对 `writeRouteDecided`（10000/10000/10000 单叶）/snapshot/planner 消费是否零影响；taxonomy 扩展（候选 C）对 0086 冻结语义与 RLS/CHECK 门的面请列全。
5. 是否同意 prove 方案（诊断前置先行、判别定谳后才落码、trio ×1 各一次、预算 ≤200、三来源交叉一致）与 EXIT 双向契约？

## 非宣称

Not a pass · not run（本 REQUEST 零实跑零 live 零 DB 连接）· not fixed · not coding · not root-cause 定谳（RC 排序是假设 · EXEC 判别定谳）· not 修复候选裁决（A/B/C 非定案）· not trio green · not suite green · not R1 closed · not Disclosure-1 closed · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not coordinator authorize · 红③ C-MO-P3 不在本刀 · sticky 重试不在本刀 · `g7SuiteGreen=false` · trio OPEN · 红① STILL OPEN · `actualSpendCny=null` · alone ≠ dual

---
*REQUEST stub · G7T · mw-rag-route · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 三 Ban 随卷（弱化校验/masking/G7S 域内）· 修复候选 A/B/C 未裁决 · STOP*

---

# PRE-EXEC dual 审查 — G7T REQUEST（mw-rag-route · route/taxonomy/policy 语义域 · 2026-10-07）

**Status**: PRE-EXEC dual reviewed · **PASS（附 0 Blocker · 6 Conditions C-RR-1~6 对 EXEC 拘束）** · alone ≠ dual（本 PASS 仅为 mw-rag-route 半签 · 不代签 mw-model-op · 双审生效须 peer 段另有其签 + 协调方裁决）
**被审对象**: REQUEST commit `8c92b344`（origin/feat/mysql-schema-skeleton tip · docs-only 恰 4 .md +315/−0）· harness `gap-route-classify-quality.md` · slice `gap-route-classify-quality.slice.md` · 本 stub REQUEST 段（原文 7944B md5 `078f4207` append-only 保全）
**审查工作区**: `/Users/miaole/Desktop/golucky/meetwise-rv-g7t-rag-route` · branch `rv/g7t-rag-route` @`8c92b344` · 本审零 coding 零 prove 零 live 零 DB 连接零 Key 加载零产品文件改动零共享 SSOT 触碰 · 禁 push
**授权链核验**: `8c92b344` 父 = `c4546f7b`（G7S nail · C-MO-P1 指名本刀）✓ · 本地孪生 `5b6b1e97`（branch `line/g7t-classify-quality`）与 origin tip **同树 `2297b72d`** 同父仅元数据异 → OB-RR-1 benign（G7S `77989c49`≡`dc48caf4` 同形先例）

## 0. 机械核验（command + EXIT + 可复现 · 全过）

- **docs-only**: `git show --name-status 8c92b344` 恰 4 个 .md（slice/harness/双 stub）全 A、0 产品文件、+315/−0 ✓。
- **blob 机检 10/10 全等**（`git hash-object` @8c92b344 工作树实测）: `job-route-classifier.ts`=`79ceded8` · `prompts.ts`=`3eae75fc` · `recruiting-bound.spec.ts`=`de4991e6` · `JobCreateForm.tsx`=`0be5344c` · `package.json`=`0afb3bd2` · `job-route-decision.ts`=`a621d8bd` · `job-route-classify.ts`=`3b1e7081` · `recruiter.ts`=`d06b4f49` · `adaptive-role-resolve.ts`=`80abbb80` · `run-e2e-isolated.mjs`=`13dbfc43` ✓。
- **行号/码面抽查全中**: validator 十齿行锚（`:119-123/:124/:129-130/:131/:133/:136/:139/:140-141/:142-143/:144/:149-152`）✓ · sticky `:180` already_unresolved ✓ · reason_codes 持久化 `writeRouteUnresolved :117-118` ✓ · known_not_sent 前置 `:232-236` ✓ · validation_rejected `:238-244` ✓ · rule 单叶写入 `:207-208`（10000/10000/10000·不过 validator）✓ · `recruiter.ts:410` `interview_ineligible_route` ✓ · spec `:81-82` 输入（title=`浏览器绑定岗位-<hex>`/competencies=`高并发, 幂等, 限流`）+ `:96` waitForURL 30s ✓ · `JobCreateForm.tsx` 仅 title+competencies 两输入（description 恒空）✓ · wiring `package.json:278/:279/:282` ✓ · 0086 种子 `:390` `backend/general`=『通用后端与系统设计』✓ · G7S CMD2 收据 C-MO-Q2（`route_unresolved`/`validation_rejected` ×2 · 授权三查询**未查 reason_codes 列** · sidecar SELECT-only 白名单先例）✓ · execution-master-checklist G7S 段 `:1321` STILL OPEN + C-MO-P1/P3 ✓。
- **Pins 逐值核对**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · trio OPEN（EXIT 1/1/1）· GAP-G7K-API-REDS P1 OPEN · `actualSpendCny=null` —— stub/slice/harness 三处原值零翻转 ✓。
- **读数约束复核成立**: `validation_rejected`（非 `known_not_sent`）⇒ 模型 reasonCodes 为空（`:232-236` 在 validator 之前拦截非空 reasonCodes）⇒ zod 已过（`JobRouteModelOutputSchema` `job-route-classify.ts:103-111` · max(4) 无 min·空数组可过 zod）⇒ 死于业务校验。zod 失败/fence 漂移/完整拒分排除逻辑与读数自洽 ✓。

## 1. RC 排序裁决（route 语义本域 · 全部成立且 RC-1 被本席读码加强）

**RC-1 成立，且 harness §1.2 #10 括注「（单叶=10000）」系对 validator 语义的误读，本席更正在案（append-only · harness 原文不动 · OB-RR-2）**：

- **构造性证明（blob `79ceded8` 实读 `:149-152`）**：单叶时 `gap = sorted[0].allocationBps − JOB_ROUTE_TOTAL_BPS`（`:150` 三元 fallback 在 `sorted.length == 1` 时取 **10000 而非 0**）= 10000−10000 = **0** → `:151` 强制 `marginBps == 0` → `:152` `marginBps < 1000` → `conflict`。**模型路径单叶输出结构性不可过闸**：margin≠0 死 `:151`，margin=0 死 `:152`，无解。
- **而 prompt（blob `3eae75fc` `:23-35`）恰恰只教这个被保证拒绝的形状**：`:28` 明文「仅 1 个 leaf 时 marginBps=10000」+ `:30` 唯一 JSON 示例即单叶 `{backend/nodejs,10000}/8000/10000/[]`。红① OOD 输入最可能的模型行为 = 照抄示例形状（语义上正确的 `backend/general` 单叶 10000）→ **必然 `conflict`** → 与 G7S `validation_rejected` ×2 读数完全相容且比「减法算错」更强的解释。
- **三方不自洽佐证（缺陷非设计意图）**：0104 DB backstop CHECK 只复检 margin≥1000/confidence≥7000/sum=10000/每桶≥500/1..4 叶，**不含 margin 恒等**——rule 路径单叶 10000/10000/10000（`job-route-decision.ts:207-208`）合法落库（coveredCount=8 即此形状）。validator `:150` fallback 与 prompt 合同、DB backstop、rule 路径三方均不自洽——模型路径单叶是孤儿语义。
- **RC-1 分型（EXEC 判别要求）**：RC-1a 结构性单叶拒绝（示例形状·本席判为最可能）／RC-1b 多叶减法错值或 gap<1000。`reason_codes` 只会回 `['conflict']` 不分型（`conflict` 在 validation_rejected 面仅可能源于 `:151/:152`）→ **live 回放必须记录被拒输出的叶数形状**（C-RR-1）。
- **RC-2/3/5 核验通过**：`:139` sum≠10000→`invalid_schema`、`:136` <500→`calibration_failed` ✓；`:141` <7000→`low_confidence` ✓；`:123` 空 allocations+空 reasonCodes→`invalid_schema`（zod 无 min 使半执行拒分可达）✓。
- **RC-4 本席语义裁决再降权**：红①输入的自然叶 `backend/general`（0086 `:390`·语义即「通用后端与系统设计」）**存在且覆盖**该输入——这不是叶覆盖缺口，是输出校准问题；qwen-plus 类模型对显式枚举依从通常好于算术自洽。RC-4 位居第四成立，候选 C 门槛维持（C-RR-6）。

## 2. 修复候选裁决

- **候选 A（prompt v2）：方向批准 + 两项必要更正**。
  - **内容要件（C-RR-2）**：harness §1.3 四要素**必要不充分**——不删 `:28` 单叶条款与 `:30` 单叶示例，p.v2 教出的形状仍被 `:150-152` 保证拒绝。p.v2 五要素全齐方可落码：(i) 删除「仅 1 个 leaf 时 marginBps=10000」及单叶示例；(ii) 指令恒 ≥2 叶（各 ≥500/和恰 10000/`marginBps=top1−top2` 且 ≥1000）+ 多叶减法 few-shot（`[{7000},{3000}]→marginBps=4000` 形）；(iii) 双向 reasonCodes（成功⇒`[]`；拒分⇒空 allocations+非空）；(iv) 万分比反直觉提示；(v) confidence 锚（<7000 如实拒分不猜）。**全程零 validator 零 zod 零 DDL 零 taxonomy 改动——三 Ban 不越**。
  - **触碰面更正（C-RR-3）**：「恰 `prompts.ts` 一文件」不实。provenance 一致性下 p.v2 至少三文件：`packages/ai-runtime/src/prompts.ts`（文本+version）+ `packages/domain/src/sealed-job-route-classify-binding.ts:28`（`SEALED_JOB_ROUTE_CLASSIFY_PROMPT_VERSION` `'p.v1'→'p.v2'`——binding 解析对该字段只做 regex 不与 registry 交叉校验（`operation-binding.ts:141-175` 实读），不同步则 binding candidate 声明 p.v1 而 registry 供 v2 文本 = sealed 身份漂移）+ `apps/worker/test/r2-p-worker-route-classify.proof.ts:114`（p.v1 测试钉同步）。三文件均不在 G7S 域内 Ban 清单。
- **候选 B（规则词典校准）——`:66-70` 张力本域裁决（stub 问 2）**：该设计的目标是**跨桶角色扩散**（「全栈」扩散所有语言桶）；`classifyJobByRule`（`:96-100`）只在**唯一叶命中**才判，0 或 ≥2 命中返回 null。扩伞桶 `backend/general`（现仅『后端开发』一词）结构上无法复现扩散失败模式 → **B 不被 `:66-70` 设计当然禁止，但张力真实**：拟扩词『高并发/幂等/限流』是跨切质量属性而非角色词，CJK 子串匹配下「前端高并发优化」类岗位有误路由精度风险。**放行标准五条（C-RR-4）**：(1) 只入伞桶 `backend/general`，永不入语言桶；(2) 角色指示词优先（微服务/分布式强于高并发/幂等/限流——后者若入册须显式登记精度取舍）；(3) `JOB_ROUTE_POLICY_VERSION` 升版必尽但不充分；(4) covered 8 种子 + rule 单叶写入形状零回归；(5) B 只救词典命中输入——C-RR-1 未修前每次词典 miss = 必然红①同型，**B 只可补不可替**。
- **候选 C（叶枚举扩展）**：RC-4 已降权（红①自然叶已存在），维持「仅 EXEC 判别 `taxonomy_invalid` 主导才立项」。若立项，触碰面请单（stub 问 4）：`TAXONOMY_V1_LEAVES`（domain `:19-28`）+ taxonomy version 演进（0104 CHECK `^v[1-9][0-9]{0,15}$` 容 v2）+ 0086 同构 seed（`qbank_taxonomy_scope` released leaf——`qbank_chunk_serving_scope` trigger `:226-228` 依赖 released 叶）+ snapshot/planner 消费核对（`planInterviewTurn` 对叶数 1..n 中性）；0104 **无需改**（allocations 仅 jsonb array 形 CHECK、无叶枚举 CHECK——叶校验全在 domain 层）。
- 三 Ban（弱化校验/夹具强造/G7S 域内修）+ sticky 不新增自动重试 + 一次一候选单变量归因 + A+B 组合须双审显式批准：**全部同意**，写死核验通过。

## 3. EXEC 授权面裁决（stub 问 5）

- **`job_route_decision.reason_codes` SELECT-only 判别：授权（C-RR-5）**。该列是既有留痕（`writeRouteUnresolved :117-118` 持久化 `validated.reasons`），G7S CMD2 授权三查询未及此列；沿 sidecar SELECT-only 白名单先例扩一列属面板扩查、非 Ban 面扩围；`ai_invocation_trace.output`（redacted payload）Ban 维持。
- live 定向回放 N≤20（内存回放 `validateModelRouteOutput` 即弃 · Ban 原始输出落盘/入 receipt · redactOutput 产品语义零触碰 · 单独报备）：同意；样本须含叶数形状记录（C-RR-1）。
- trio 三 CMD 各恰好一次（iso→ui→perf · wiring `:278/:279/:282` @`0afb3bd2` 实测）· 预算 ≤200（含诊断 N≤20 · G7K/G7R/G7S 口径）· Key 进程环境 name-only · Ban `.env*` · 七字段逐 attempt · fresh-run sticky 策略（Ban 翻存量 unresolved 行）· EXIT 双向契约 · 红③ `full.e2e.ts:203` 留 C-MO-P3 另刀（Ban 为绿改断言）：**全部同意**。
- **判别推翻 RC 排序即停如实迭代（Ban 假修复）**：同意——含本席 C-RR-1 分型读数在内，任何与判别冲突的落码即越线。

## 4. 请专家回答·逐题答复（stub §请专家回答）

1. RC 排序成立；RC-1 加强并拆 RC-1a/1b（C-RR-1）；无遗漏候选；增补判别=live 回放叶数形状记录 + reason_codes SELECT（已授权 C-RR-5）。
2. B 张力裁决见 §2/C-RR-4：设计张力真实但不当然禁止；逐词放行标准可立（伞桶-only/角色词优先/永不入语言桶）；policy 升版必尽不充分。
3. A 四要素不充分（单叶结构性矛盾未解，C-RR-2）；prompt 侧更优形状=恒 ≥2 叶+减法演示+删单叶条款；provenance 要求 ≥3 文件（C-RR-3）。
4. 消费链零回归：B 走既有 `writeRouteDecided` 单叶形状（0104 backstop 接受、binding/snapshot/planner 对形状 1..4 叶中性）零回归；C 触碰面已列全（§2）。
5. prove 方案与 EXIT 双向契约同意；诊断前置先行、判别定谳后才落码。

## 5. Fail-trigger audit

Pins 篡改：无 ✓ · Ban 违反：无（REQUEST docs-only · 三 Ban 原文随卷）✓ · masking/夹具强造：无 ✓ · G7S 域内修：无 ✓ · validator 弱化：无（本审全部路径零校验改动）✓ · 洗绿/retry-to-green/假绿：无（零实跑）✓ · alone≠dual：本 PASS 仅 mw-rag-route 半签 ✓ · 证据失实：两处更正登记（OB-RR-2 harness「单叶=10000」误读→C-RR-1；harness「恰 prompts.ts 一文件」触碰面低估→C-RR-3）——均属**低估缺陷方向**、不构成授权颠覆性失实，登记更正后不触发 FAIL。

## 6. Blockers

**无（0 Blocker）。**

## 7. Conditions（对 EXEC 拘束 · 随本 PASS 交付协调方）

- **C-RR-1**【RC-1 更正与分型】validator `:150` 单叶 fallback=`JOB_ROUTE_TOTAL_BPS` → 单叶 gap=0 → 模型路径单叶结构性不可过闸；harness §1.2 #10「（单叶=10000）」误读更正在案。EXEC §3.0 live 回放必须记录被拒输出叶数形状（单叶 vs 多叶）判别 RC-1a/RC-1b；`reason_codes=['conflict']` 判 RC-1 大类成立后按分型落 p.v2。
- **C-RR-2**【p.v2 内容要件】五要素全齐方可落码（删单叶条款与示例／恒 ≥2 叶+减法 few-shot／双向 reasonCodes／万分比提示／confidence 锚）；原四要素案不构成完整修复。
- **C-RR-3**【p.v2 触碰面更正】provenance 一致性至少三文件：`prompts.ts` + `sealed-job-route-classify-binding.ts:28` + `r2-p-worker-route-classify.proof.ts:114`；EXEC 计划按此重刻触碰面后 coding。
- **C-RR-4**【候选 B 放行标准】伞桶-only（永不入语言桶）/角色词优先·质量属性词入册须登记精度取舍/policy 升版/covered-8 零回归/只可补不可替。
- **C-RR-5**【诊断查询授权】`job_route_decision.reason_codes` SELECT-only + §3.2 读取面板授权（sidecar 先例）；`ai_invocation_trace.output` Ban 维持；live 原始输出内存即弃不入证。
- **C-RR-6**【候选 C 门槛维持】红①自然叶已存在（0086 `:390`），仅 `taxonomy_invalid` 主导方立项；立项触碰面按 §2 列单核对。

## 8. OB（非阻断）

- OB-RR-1：REQUEST 孪生 commit `5b6b1e97`（本地 `line/g7t-classify-quality`）≡ origin tip `8c92b344` 同树 `2297b72d` 同父 `c4546f7b` 仅元数据异——G7S 同形先例，benign。
- OB-RR-2：harness §1.2 #10 括注「（单叶=10000）」为对 validator `:150` 的误读（实际单叶 gap=0→结构性拒绝），C-RR-1 更正在案；harness 原文 append-only 未动。
- OB-RR-3：`JobCreateForm.tsx` competencies placeholder 即『高并发, 分布式锁, 限流, 系统设计』——产品自己的示例输入零命中 RULE_SIGNALS → 模型路径是产品常见路径，C-RR-1 修复面关乎面而不止红①样本。
- OB-RR-4：mw-model-op stub 所引 zod `:103-111`（max(4) 无 min）、blob `3b1e7081`/`a621d8bd` 与本席机检一致；registry/live 面归 peer 审，本席不代裁。

## 9. 中文三行摘要

1. 机械核验全过：REQUEST `8c92b344` docs-only 恰 4 .md（树 `2297b72d`≡孪生 `5b6b1e97`）· 授权链父 `c4546f7b` 成立 · blob 10/10 全等 · Pins 原值零翻转。
2. 本席读码加强 RC-1：validator `:150` 单叶 fallback 致模型路径单叶结构性不可过闸而 prompt `:28/:30` 恰教该形状——红①机理由此定形（RC-1a 结构单叶＞RC-1b 算术），更正 harness「单叶=10000」误读；候选 A 批准但 p.v2 须删单叶条款+恒多叶指令，触碰面实为 ≥3 文件（sealed 版本常量+测试钉）。
3. 候选 B 裁决：不被 `:66-70` 当然禁止（唯一叶命中结构上无扩散面）但须逐词放行+伞桶-only+policy 升版，且只可补不可替；0 Blocker · 6 Conditions C-RR-1~6 · 本 PASS 仅为 mw-rag-route 半签（alone≠dual · 不代签 mw-model-op）· Ban prove/coding/产品 edit/共享 SSOT edit 全守 · 禁 push。

Verdict: PASS
