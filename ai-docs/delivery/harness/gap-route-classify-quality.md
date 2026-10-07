# Harness — G7T · **红① route/classify 输出质量校准刀**（Line G7T · docs REQUEST · `draft:awaiting_pre_exec_dual` · G7S nail C-MO-P1 指名的另刀 · ≠ 修复 ≠ trio 翻绿）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding · Ban prove 执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿/Ban retry-to-green · Ban 为绿改产品（修复方案仅登记 · EXEC 期 coding 须 pre-exec dual BOTH PASS + 协调方授权）· **Ban 弱化 `validateModelRouteOutput`**（fail-closed 质量闸零松动）· Ban 夹具强造 route metadata（=masking）· Ban G7S 域内修 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **G7T**（G7S nail `c4546f7b` C-MO-P1 指名：「红① recruiting-bound=route/classify 输出质量另刀（Ban G7S 域内修/Ban 弱化 validator/Ban 夹具强造）」——本 REQUEST 即该另刀；G7S POST dual BOTH PASS + C-MO-Q2 定谳是本刀唯一上游）
**授权链**: G7S EXEC（trio 收据 `gap-begin-snapshot-supply-fix/`）→ G7S POST-PROVE dual PASS（mw-e2e-ha + mw-model-op · C-MO-Q2 定谳维持）→ coordinator G7S nail `c4546f7b`（C-MO-P1~3 转后继刀）→ **本 REQUEST（docs-only）→ pre-exec dual BOTH PASS（mw-rag-route + mw-model-op）→ 协调方授权 coding/EXEC**。双审 PASS ≠ 本 stub 自批 ≠ EXEC 授权。
**输入事实（只读在案引用）**：G7S CMD2 C-MO-Q2 三查询——`job_route_decision` = **`route_unresolved` / `attempt_outcome=validation_rejected` ×2**（fresh DB · classify 调用成功：ledger `job.route-classify.v1` succeeded ×2 · HTTP 200）；`route_consumption_event` 0 行；`interview_route_snapshot` 0 行。Key presence：`profile=dashscope-cn-beijing model=qwen-plus`。「begin 时序竞态」假说已被数据否定；F-F「classify succeeded ×2 vs 仍红」张力闭合（succeeded=调用非输出有效）。
**Base**: `origin/feat/mysql-schema-skeleton` **`c4546f7b`**（full `c4546f7b` fetch 后实测 tip = 预期 G7S nail · 无 turn 内 origin 前进）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7t` · branch `line/g7t-classify-quality`
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained（本刀零翻转）**: **`g7SuiteGreen=false`** · trio **OPEN**（EXIT 1/1/1）· 红① **STILL OPEN**（master checklist `:1321`）· 红③ `full.e2e.ts:203` 断言面 **另刀 C-MO-P3**（本刀零触碰）· `r1Closed=false` · Disclosure-1 **OPEN** · GAP-G7K-API-REDS **P1 OPEN**（不翻 backlog 状态）· **`actualSpendCny=null`**

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban prove 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零产品码改动**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`c4546f7b`；关键码面 blob `git hash-object` 亲算在卷 §1）；**(b)** G7S trio 收据 + POST 双审 + nail（同树在案）引用；**(c)** G7K/G7R committed 收据链引用。不发明任何未在案明细；**根因候选排序是码面+输入分布分析得出的假设排序（非定谳）——精确拒因判别留 EXEC 期诊断步骤（§3.0），REQUEST 阶段无 DB 读数权**。码面行号 EXEC 期按当 tip 重核回填。

## 1. 根因诊断（G7S C-MO-Q2 定谳承卷 + 本席码面亲读 @`c4546f7b` · REQUEST 阶段只读）

### 1.1 已定谳层（G7S POST dual · 本刀承卷不再重裁）

红① recruiting-bound ×2（`recruiting-bound.spec.ts:56` · 30s `waitForURL` 超时签名）根因链：**classify 调用成功（HTTP 200 ×2）但输出未过 `validateModelRouteOutput` → `validation_rejected` sticky 终态（`:180` `already_unresolved` 永不自动重试）→ 无 route_decided revision → `bindApplicationRoute` 不落 binding → `recruiter.ts:410` `interview_ineligible_route` 409 fail-closed（如设计）→ start server action throw → 错误边界 → 超时**。本刀问题只剩一个：**为什么 classify 输出过不了校验**。

### 1.2 校验合同全貌（`packages/domain/src/job-route-classifier.ts` · blob `79ceded8` · `validateModelRouteOutput` `:115-160`）

| # | 约束 | 行 | 拒因码 | 小模型违反难度 |
|---|---|---|---|---|
| 1 | `allocations` 为数组且 ≥1 | `:119-123` | `invalid_schema` | 低（但「空数组+空 reasonCodes 半执行拒分」恰落此） |
| 2 | ≤4 个不同 leaf；同叶重复 = 歧义 | `:124` `:131` | `too_broad` | 低 |
| 3 | `leafTrackId` 过 `LEAF_RE` 正则 **且** ∈ 8 叶枚举 | `:129-130` | `invalid_schema` / `taxonomy_invalid` | 中（枚举外发明叶即拒） |
| 4 | `allocationBps` 正整数且每项 ≥500 | `:133` `:136` | `invalid_schema` / `calibration_failed` | 中 |
| 5 | **bps 总和恰 = 10000** | `:139` | `invalid_schema` | **高**（百分比习惯 30/30/40 直接违反） |
| 6 | `confidenceBps` ∈ 0..10000 整数且 **≥7000** | `:140-141` | `invalid_schema` / `low_confidence` | 中（输入歧义时诚实自评 <0.7 即拒） |
| 7 | `marginBps` ∈ 0..10000 整数 | `:142` | `invalid_schema` | 低 |
| 8 | `reasonCodes` 全字符串 | `:143` | `invalid_schema` | 低 |
| 9 | **reasonCodes 非空 = 模型主动拒分 = conflict** | `:144` | `conflict` | 设计如此（拒分走 `known_not_sent` 面 `:232-236`，非 validation_rejected） |
| 10 | **`marginBps` 必须逐位等于 top1−top2 差（单叶=10000）且 ≥1000** | `:149-152` | `conflict` | **极高**（要求模型做精确减法自洽；唯一示例是单叶） |

**派生事实（对根因排序承重）**：G7S 读数是 `validation_rejected` 而非 `known_not_sent` → **模型的 reasonCodes 是空的**（否则 `:232-236` 先落 `known_not_sent`）→ 「完整执行拒分指令」被读数排除；zod 解析失败走 invoke error → `knownNotSent`（`job-route-classify.ts:185-196`）也非 `validation_rejected` → **「JSON 包 fence/形状漂移」同样被读数排除**。即：模型返回了**形状合法、reasonCodes 为空**的 JSON，死在业务校验（上表 #3/#4/#5/#6/#10 或 #1 的半执行变体）。

### 1.3 prompt 合同（`packages/ai-runtime/src/prompts.ts:23-35` · blob `3eae75fc` · `job.route-classify.v1` p.v1）

prompt 已声明：总和恰 10000 / 每项 ≥500 / 最多 4 叶 / margin=最高−次高（单叶=10000）/ 0..10000 整数 / 无法自信分类 → 空 allocations + 非空 reasonCodes / 唯一 JSON 示例（**单叶 10000**）。**缺口（REQUEST 阶段码面判读）**：(a) **零多叶 few-shot 示例**——#10 的减法自洽约束无任何演示；(b) **零「分类成功时 reasonCodes 必须为 `[]`」的显式双向指令**（只说了拒分侧）；(c) **零「bps 是万分比不是百分比」的显式反直觉提示**；(d) confidence 阈值 7000 未在 prompt 出现（模型无从对齐校准线）。prompt 版本纪律在卷：改 prompt = 升 version（`prompts.ts:2-3` 注册表注释），本刀若走 prompt 校准即 `p.v2`。

### 1.4 模型路径触发必然性（红①输入分布 · 本席亲核）

红①建岗输入（`apps/web/e2e-ui/recruiting-bound.spec.ts:81-82` · blob `de4991e6`）：title=`浏览器绑定岗位-<8hex>`，competencies=`高并发, 幂等, 限流`；**JobCreateForm 无 description 输入**（`apps/web/app/recruiter/jobs/JobCreateForm.tsx:45/:49` · blob `0be5344c` 仅 title+competencies 两字段）→ description 恒空。对照规则词典 `RULE_SIGNALS`（`job-route-classifier.ts:71-80`）：「浏览器/绑定/高并发/幂等/限流」**零命中任何叶信号**（歧义词刻意不映射防扩散——`:66-70` 设计注释）。→ `classifyJobByRule` 返回 null → **模型路径必然**（`job-route-decision.ts:196-219`）。该输入对 8 叶的语义距离：最贴近 `backend/general`（通用后端与系统设计，0086 种子 `:390`）但无直接词面证据——**典型 OOD（分布外）输入**。

### 1.5 观测面缺口与既有留痕（诊断前置的边界如实）

`redactOutput: true`（`job-route-classify.ts:171` · `invoke.ts:718`）→ `ai_invocation_trace` 只存 `{redacted:true}`，**原始模型输出全链不留痕**；G7S CMD2 收据亦未查询 `job_route_decision.reason_codes`——而 `writeRouteUnresolved`（`job-route-decision.ts:117-118`）**已把校验器精确拒因码持久化在该列**。→ **精确拒因（判别 RC-1~RC-5）= EXEC 期一条 SELECT-only 查询 + live 定向回放即可得**，本 REQUEST 只能给假设排序。附注：G7S CMD2 ledger `failed(schema_validation_failed) ×1`（null-service）非红①承重（红①死于 begin 之前、零 interview chat op——G7S C-MO-Q2 定谳原文），登记 OB 非阻断。

### 1.6 根因候选排序（假设 · EXEC §3.0 判别后定谳）

| 排序 | 候选 | 机理 | 与读数相容性 |
|---|---|---|---|
| **RC-1** | **margin 恒等自洽失败（`conflict`）** | #10 极高难度：多桶近似均分 → margin=0 <1000；或减法错值 ≠ top1−top2。OOD 输入天然诱导多桶均分 | 完全相容（reasonCodes 空、形状合法） |
| **RC-2** | **sum≠10000 / bps<500（`invalid_schema`/`calibration_failed`）** | 百分比习惯（30+30+40=100）或小权重桶 <500 | 完全相容 |
| **RC-3** | **low_confidence（`low_confidence`）** | OOD 输入诚实自评 <0.7 | 相容 |
| **RC-4** | **叶覆盖不足（`taxonomy_invalid`）** | 模型发明 `backend/distributed` 类枚举外叶 | 相容但次序靠后（qwen-plus 对「枚举内选择」类指令依从性通常好于算术自洽） |
| **RC-5** | **半执行拒分：空 allocations + 空 reasonCodes（`invalid_schema` `:123`）** | prompt 拒分指令只执行一半 | 相容（完整拒分已排除，半执行恰落 #1） |

**「校验过严」作为候选的地位**：校验器是 C-MO-P1 明文 Ban 弱化的 fail-closed 质量闸，**不进入修复候选**；但 #10 的逐位恒等（`:151`）是全合同最难约束，若 EXEC 判别 RC-1 主导，**松动它的任何方案都越 Ban 线**，合法出路只剩 prompt/规则侧让真实输出能过闸（或 policy 版本演进的显式立项——那是产品语义变更，须双审+协调方裁决，本刀不预claim）。

## 2. 修复方案候选（≥2 · 列利弊交双审 · 双审 + 协调方裁决后方可 EXEC）

**三 Ban 铁律（全候选通用，C-MO-P1 随卷）**：Ban 弱化 `validateModelRouteOutput`（校验是 fail-closed 质量闸——阈值/恒等/枚举零松动）；Ban 夹具强造 route metadata（=masking，捏造产品不可能状态）；Ban G7S 域内修（`recruiter.ts` 供给链/`adaptive-role-resolve.ts` 门/uc018 断言零触碰）。sticky `route_unresolved` **不新增自动重试**（G7S POST 已裁：须新产品语义另立卷）；trio 复跑用 fresh DB（每 run 随机后缀建新岗）无 sticky 存量负担。

### 候选 A（本刀推荐候选）：prompt 校准 v2（`job.route-classify.v1` p.v1 → p.v2）

按 §1.3 四缺口改 system prompt：多叶 few-shot（含 margin 减法演示：`[{7000},{3000}] → marginBps=4000`）；「分类成功 ⇒ reasonCodes 恒 `[]`；拒分 ⇒ allocations=`[]` 且 reasonCodes 非空」双向指令；「bps 是万分比、总和恰 10000，不是百分比」反直觉提示；confidence 校准锚（无把握时如实报低并走拒分，不猜）。版本升 `p.v2`（注册表纪律），`buildData` 不动。
- **利**：合法路线中最小触碰面（恰 `prompts.ts` 一文件）；零校验改动零 DDL 零 taxonomy 变更；修复方向与 RC-1/RC-2/RC-5 全相容；「让真实输出过闸」正中 C-MO-P1 措辞。
- **弊**：对 live 小模型输出形状的约束力是概率性的——不保证一次清红；须 EXEC live 复跑验证；若判别 RC-4 主导则无效。

### 候选 B：规则词典校准（`RULE_SIGNALS` 扩信号 → rule 层 0 外发直判）

`backend/general` 扩『高并发/幂等/限流/分布式/微服务』等通用后端词（红①输入即唯一命中 rule_decided，模型路径不再触达）。**须升 `JOB_ROUTE_POLICY_VERSION`**（`:14` 注释：改校准常量 = 改路由语义必须升 policy 版本）。
- **利**：确定性、0 外发、预算友好；对红①输入是结构性绕开模型质量面。
- **弊**：与 `:66-70` 刻意设计**直接张力**——「通用/歧义词刻意不映射」正是防『全栈扩散到所有语言桶』的决策；扩词=推翻该裁决，须逐词论证不重开扩散面；且只救词典命中的输入，RC-1~RC-3 对其他 OOD 输入依然存在（红①清了、面没修全）。

### 候选 C：叶枚举扩展（若 EXEC 判别 RC-4 `taxonomy_invalid` 主导才立项）

扩 `TAXONOMY_V1_LEAVES`（如 `backend/distributed`）+ 0086 种子同构新 migration + taxonomy version 演进 + 消费侧（snapshot/planner/serving_scope）全链核对。
- **利**：真覆盖缺口的结构修复（产品语义演进）。
- **弊**：触碰面最大（domain+migration+消费链）；0086 已固化的 taxonomy v1 是评审过的冻结语义；**仅当 §3.0 判别证实覆盖不足才值**——若 RC-1 主导则纯属过度工程。

### 排序与组合

EXEC §3.0 判别前**不锁定**；先验排序 A ＞ B ＞ C（A 面向全候选根因、B 面向红①输入、C 面向单一候选根因）。A+B 组合合法（prompt 升版与 policy 升版互独立）但 EXEC 一次只落一个候选（单变量归因；组合须双审显式批准）。**默认不选**：校验放宽（Ban）、sticky 自动重试（另立卷）、夹具造数（Ban/masking）。

## 3. prove 方案（修复 EXEC 后 trio 复跑 · pre-exec dual BOTH PASS + 协调方授权后执行）

### 3.0 EXEC 诊断前置（先诊断后修复 · 只读+定向 live 判别）

1. **DB 拒因判别（SELECT-only）**：复跑前先在 fresh run 的 DB 查 `job_route_decision.reason_codes`（红①现场留痕）——精确拒因码直接判别 RC-1~RC-5；查询面板沿 G7S sidecar 先例（SELECT-only 白名单 · Ban `ai_invocation_trace.output`/payload），**不新增任何 Ban 面**。
2. **live 定向回放（预算内 · 不入产品码）**：以红①同形输入（`浏览器绑定岗位-<hex>` + `高并发, 幂等, 限流` + 空 description）直打 classify N 次（N ≤ 20 · 单独报备），原始输出在 prove 侧内存回放 `validateModelRouteOutput` 观测拒因分布后即弃（**Ban 原始输出含 Key 物料落盘/入 receipt**；redactOutput 语义不破——产品链路零改）。判别结论写进 EXEC 收据 §根因定谳段，**若判别推翻 RC 排序 → 停下回改 §2 候选选择，如实登记迭代**（Ban 判别为 RC-4 却仍落候选 A 的假修复）。
3. 修复落码后 **trio 复跑三 CMD 各恰好一次**（iso→ui→perf）：`pnpm e2e:isolated`（wiring `package.json:278` @`0afb3bd2`）/ `pnpm e2e:ui:isolated`（`:279`）/ `pnpm verify:e2e-performance`（`:282`）；EXEC 按 tip 重核 wiring；committed SHA 重钉 + frozen-lockfile + 独立 worktree；单 CMD 内部重试按自身契约算一次 attempt（Ban 临时调高）；**七字段逐 attempt 全记录**（CMD 原文/EXIT/时间戳/实跑 code SHA/Key presence name-only/关键输出/预算）。

### 3.1 预算与 Key 卫生

- **预算 ≤200 次 live 调用**（沿 G7K/G7R/G7S 口径 · 含 §3.0 诊断回放 N≤20 + trio 全展开）；超限即停如实记中止（不洗 not_run）；**`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
- Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader name-only）· **Ban 写任何 `.env*`** · `.env*` ABSENT presence 逐 attempt 记录 · Ban Key 值/fingerprint 入 receipt/log/commit。

### 3.2 读取面板扩查（沿 C-MO-Q2 口径）

`job_route_decision`（attempt_outcome × reason_codes 分布）/ `route_consumption_event` / `interview_route_snapshot` / ledger `job.route-classify.v1` 行——红①定谳复读 + 修复生效读数（validation_rejected ×2 → 0、route_decided ≥2）。

### 3.3 收据落点

`receipts/gap-route-classify-quality/`（诊断判别段 + 3 per-CMD + SUMMARY）。

## 4. EXIT 契约（双向）

- **红①清除**（recruiting-bound 双 project PASS）→ CMD2 向全绿推进；**红③ `full.e2e.ts:203` 独立留 C-MO-P3 另刀**（本刀不裁断言面、Ban 为绿改断言）；iso/perf 面读数如实（红② 供给面 G7S 已修 · 若 iso 面仍红须逐 case 五分类归因，Ban 黏连归咎）。
- **`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链**（缺一不可；trio 绿 ≠ suite green——G6 OPEN / R5-MARKED-RED / Disclosure-1 OPEN / GAP P1 独立核算）。
- **仍红** → EXIT=1 原值 + 逐 case 五分类明细 + 根因假设修正如实登记（含 RC 排序修正）→ 迭代刀重走 REQUEST；**Ban flake 记法 · Ban retry-to-green · Ban 只留绿 attempt · Ban 假绿**。recruiting-bound 既有断言（`:96` waitForURL 等）零触碰。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT。

## 5. Ban 清单（本 turn 与 EXEC 默认 plan 全量）

1. **Ban coding**（本 turn docs-only；EXEC 期 coding 须 pre-exec dual BOTH PASS + 协调方授权，触碰面按 §2 裁决版）。
2. **Ban 弱化 `validateModelRouteOutput`**：阈值（7000/1000/500）/ margin 逐位恒等（`:149-152`）/ 8 叶枚举 / sum=10000 全部零松动；Ban 借「校准」名义放闸；任何 validator 语义变更 = 产品语义演进须显式立项升 policy version + 双审+协调方裁决（本刀不立项）。
3. **Ban masking**：夹具强造 route metadata / 伪造 decision/binding/snapshot 行 / 测试侧绕 classify 直插 route_decided。
4. **Ban G7S 域内修**：`recruiter.ts`（blob `d06b4f49`）/`adaptive-role-resolve.ts`（blob `80abbb80`）/uc018 及已占用行断言零触碰；红③ `full.e2e.ts:203` 断言面零触碰（C-MO-P3 另刀）。
5. **Ban sticky 面私改**：不新增自动重试/不翻存量 unresolved 行（fresh-run 策略）；sticky 重试 = 新产品语义另立卷。
6. **Ban 洗绿**：retry-to-green / flake 记法 / 只留绿 attempt / 假绿 / 改 withhold 机制（`run-e2e-isolated.mjs` blob `13dbfc43` 冻结）。
7. **Ban covered/SSOT 行翻转**（nail 阶段才改）；GAP-G7K-API-REDS backlog 状态不翻；sibling 归档（G7K/G7R/G7S 等）零改写。
8. **Ban Key 物料越界 / Ban push / Ban self-approve / alone ≠ dual**。

## 6. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not root-cause 定谳（§1.6 是假设排序，精确拒因留 EXEC §3.0 判别）· not 修复候选裁决（A/B/C 均为候选非定案）· not trio green · not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator authorize · 红③ C-MO-P3 不在本刀 · `g7SuiteGreen=false` · trio OPEN（EXIT 1/1/1）· 红① STILL OPEN（master checklist `:1321`）· `actualSpendCny=null` · alone ≠ dual

---
*Harness · G7T 红① route/classify 输出质量校准刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 定谳承卷=classify 调用成功但输出未过 validateModelRouteOutput → validation_rejected sticky → interview_ineligible_route 409 → 30s 超时 · RC 排序 RC-1 margin 自洽 ＞ RC-2 bps 算术 ＞ RC-3 low_confidence ＞ RC-4 叶覆盖 ＞ RC-5 半执行拒分（EXEC 判别定谳）· 候选 A prompt v2 推荐/B 规则词典/C 叶扩展 交双审 · 三 Ban（弱化校验/夹具强造/G7S 域内）随卷 · trio ×1 各一次 · 预算 ≤200 · STOP*

---

## ERRATUM（G7T EXEC 期追加 · 2026-10-07 · append-only 原文未动 · C-MO-G1）

§1.2 表 #10 括注「（单叶=10000）」为**误读**（抄自 p.v1 prompt 自述条款，未对 `:150` 代码）：validator 单叶 fallback=`JOB_ROUTE_TOTAL_BPS` → gap=10000−10000=**0** → `:151` 恒等要求 margin=0 与 `:152` 阈值 ≥1000 永久矛盾 → **单叶输出结构性必拒（RC-1a 单叶死路）**；p.v1 `:28/:30` 的「仅 1 个 leaf 时 marginBps=10000」条款与唯一单叶示例恰教必拒形状。更正以 `receipts/gap-route-classify-quality/00-diagnosis.md` Erratum 节为准（双审 `8c9295a9` OB-RR-2 / `0efbcd3b` F1 先发现，本席承卷）。v2（`430d4c84`）删单叶条款 + 恒 ≥2 叶减法 few-shot 消此死路；**validator 零改动**（C-MO-G1 Ban 触 validator 全程守住：`job-route-classifier.ts` blob `79ceded8` 不变）。
