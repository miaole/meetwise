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
