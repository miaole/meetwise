# REQUEST — **红① route/classify 输出质量校准刀**（根因候选 + 修复候选 + trio 复跑方案 · ≠ suite green）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · Disclosure-1 OPEN
**Expert**: `mw-model-op`（模型输出合同/registry/live 面首责 · 与 mw-rag-route 双域交界并审）
**Knife**: `harness/gap-route-classify-quality.md` · slice `gap-route-classify-quality.slice.md`
**上游**: 本席 G7S POST-PROVE PASS（C-MO-Q2 定谳复核维持：classify 调用成功但输出未过 `validateModelRouteOutput` `:115/:123/:129-139` blob `79ceded8` 不变 → sticky → `interview_ineligible_route` → 30s 超时 · 「begin 时序竞态」否定 · F-F 张力闭合）· coordinator nail `c4546f7b` **C-MO-P1**（红①另刀指名 + 三 Ban：Ban G7S 域内修/**Ban 弱化 `validateModelRouteOutput`**/Ban 夹具强造=masking）
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

## 请审什么（mw-model-op · 输出合同/prompt 版本纪律/live 面与预算/Key 卫生/sticky 语义）

Line G7T · **红① route/classify 输出质量校准刀**（本席 C-MO-Q2 定谳的承接 REQUEST）。定谳承卷不重裁：调用 succeeded ≠ 输出有效；`validation_rejected` ×2 sticky。本刀问题=**为什么输出过不了校验**。请审（model-op 首责面）：

### A. 输出合同全貌（本席码面亲读 @`c4546f7b` · blob 亲算）

| 层 | 锚 | 合同 |
|---|---|---|
| zod 入口 | `job-route-classify.ts:103-111`（blob `3b1e7081`） | 仅形状：leafTrackId 字符串 1-64 / bps 整数 / 数组界（max(4) **无 min**）；失败 → invoke error → `knownNotSent`（`:185-196`）→ `known_not_sent` 面 |
| 业务校验 | `job-route-classifier.ts:115-160`（blob `79ceded8`） | 10 齿（harness §1.2 表）：最严三齿 = sum 恰 10000（`:139`）/ confidence ≥7000（`:141`）/ **margin 逐位= top1−top2 且 ≥1000（`:149-152`）**；reasonCodes 非空=拒分（`:144`）走 `known_not_sent`（`job-route-decision.ts:232-236` blob `a621d8bd`） |
| prompt | `prompts.ts:23-35`（blob `3eae75fc` p.v1） | 已声明 sum/≥500/≤4叶/margin 恒等/0..10000/拒分指令；**缺口**：零多叶 few-shot、零「成功⇒reasonCodes=[]」双向指令、零万分比反直觉提示、confidence 阈值未出现 |
| registry | `model-operation-registry.ts:99-103`（blob `63af556f`） | `job.route-classify.v1` · text-small · maxDispatches=1 · fallbackAction=`route_unresolved` · live=qwen-plus（G7S key-presence 读数） |

**读数排除（G7S CMD2）**：`validation_rejected` 非 `known_not_sent` → zod 已过 + reasonCodes 空；`redactOutput:true`（`:171` · `invoke.ts:718`）→ 原始输出全链不留痕 → **精确拒因 = `job_route_decision.reason_codes`（`writeRouteUnresolved:117-118` 已持久化）EXEC 期一条 SELECT-only 查询即得**（G7S 未查）。

### B. 根因候选排序（REQUEST 假设 · EXEC §3.0 判别定谳）

RC-1 margin 恒等自洽失败（`conflict` · 最高难齿+零 few-shot）＞ RC-2 bps 算术 sum≠10000/单桶<500 ＞ RC-3 low_confidence（<7000）＞ RC-4 叶覆盖不足（`taxonomy_invalid`）＞ RC-5 半执行拒分（空 allocations+空 reasonCodes → `:123`；完整拒分已被读数排除）。红①输入 OOD 亲核：title=`浏览器绑定岗位-<hex>`/competencies=`高并发, 幂等, 限流`/description 恒空（表单无字段）→ 规则词典零命中 → 模型路径必然。

### C. 修复候选（双审+协调方裁决后方可 EXEC · 一次只落一个 · 单变量归因）

- **候选 A（实现方推荐）**：prompt 校准 v2（`p.v1→p.v2` · 注册表版本纪律 `prompts.ts:2-3`）——多叶 few-shot（含 margin 减法演示）/reasonCodes 双向指令/万分比提示/confidence 锚。恰 `prompts.ts` 一文件；零校验零 DDL 零 taxonomy 改动；`buildData` 与 zod 与 validator 全零触碰。
- **候选 B**：规则词典校准（`RULE_SIGNALS` 扩词 · 须升 `JOB_ROUTE_POLICY_VERSION`）——route 语义张力归 mw-rag-route 首责，本席只核：rule 直判 0 外发对 ledger/trace 面的影响为零。
- **候选 C**：叶枚举扩展——仅 RC-4 主导才立项；本席核点=registry admission/taxonomy version 演进的联动面。
- **Ban（C-MO-P1 随卷）**：**Ban 弱化 `validateModelRouteOutput`**（校验是 fail-closed 质量闸——借「校准」名义放闸即越线）；Ban 夹具强造 route metadata（=masking）；Ban G7S 域内修；sticky 自动重试=新产品语义另立卷（本席 G7S POST 已裁）。

### D. prove 方案（摘要 · 全文 harness §3）

1. **诊断前置**（先诊断后修复）：`job_route_decision.reason_codes` SELECT-only 判别（sidecar 白名单 · Ban `ai_invocation_trace.output`）+ live 定向回放 N≤20（红①同形输入直打 classify · **内存**回放校验器观测拒因分布后即弃 · Ban 原始输出落盘/入 receipt · 单独报备）→ **判别推翻 RC 排序即停如实迭代（Ban 假修复）** → 修复落码（按裁决候选）。
2. **trio 复跑三 CMD 各恰好一次**（iso→ui→perf · wiring `package.json:278/:279/:282` @`0afb3bd2` · committed SHA 重钉 + frozen-lockfile + 独立 worktree · 单 CMD 内部重试按自身契约算一次 attempt Ban 临时调高）· 七字段逐 attempt 全记录（CMD 原文/EXIT/时间戳/实跑 code SHA/Key presence name-only/关键输出/预算）· 三来源交叉一致。
3. **预算 ≤200**（含诊断 N≤20 · 沿 G7K/G7R 授权口径 · 超限即停如实记中止不洗 not_run）· `actualSpendCny=null`。
4. **Key 卫生沿 C-K6/C-MO-5/6 全量**：Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` name-only）· Ban 写任何 `.env*`（ABSENT presence 逐 attempt 记录）· Ban Key 值/fingerprint 入 receipt/log/commit。
5. **读取面板**：`job_route_decision`(attempt_outcome×reason_codes)/`route_consumption_event`/`interview_route_snapshot`/ledger `job.route-classify.v1` 行——修复生效读数（`validation_rejected` ×2 → 0 · route_decided ≥2）。
6. 收据 `receipts/gap-route-classify-quality/`（诊断判别段 + 3 per-CMD + SUMMARY）。

### E. EXIT 契约（摘要）

红①清除（recruiting-bound 双 project PASS）→ CMD2 向全绿推进；红③ `full.e2e.ts:203` 断言面独立留 C-MO-P3 另刀（Ban 为绿改断言 · withhold blob `13dbfc43` 冻结）；`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链（缺一不可；trio 绿 ≠ suite green）；仍红 → EXIT=1 原值 + 逐 case 五分类 + RC 排序修正如实登记 → 迭代刀重走 REQUEST（Ban flake 记法/retry-to-green/只留绿 attempt/假绿）。fresh-run 策略使 sticky 存量无负担（每 run 随机后缀新建岗）；Ban 翻改存量 unresolved 行。

## 请专家回答

1. 输出合同三层（zod/业务校验/prompt）判读是否有漏？RC-1~RC-5 排序在 live 小模型行为面是否成立？是否需增补 EXEC 判别查询（如 `ai_model_invocation` latency/token 形状佐证）？
2. 候选 A prompt v2 的四项补强（few-shot/双向指令/万分比/confidence 锚）是否足以让真实 qwen-plus 输出过 10 齿闸？temperature=0 下 few-shot 对输出形状收敛的预期？是否需要输出前缀约束（如强制裸 JSON 无 fence）这类 prompt 侧手段？
3. live 定向回放 N≤20 的设计（内存即弃/不破 redactOutput 产品语义/单独报备）是否合 Key 与隐私卫生？样本量是否足以判别 RC-1 vs RC-2/3/4？
4. 是否同意 sticky 面零改动（不自动重试/不翻存量行/fresh-run 策略）与「sticky 重试=另立卷」的边界维持？
5. 是否同意 prove 方案（诊断前置先行/trio ×1 各一次/预算 ≤200/七字段全记录/三来源交叉一致）与 EXIT 双向契约？红③归属 C-MO-P3 另刀的切面是否干净？

## 非宣称

Not a pass · not run（本 REQUEST 零实跑零 live 零 DB 连接）· not fixed · not coding · not root-cause 定谳（RC 排序是假设 · EXEC 判别定谳）· not 修复候选裁决（A/B/C 非定案）· not prompt v2 已授权（EXEC 期按裁决版落码）· not trio green · not suite green · not R1 closed · not Disclosure-1 closed · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not coordinator authorize · 红③ C-MO-P3 不在本刀 · sticky 重试不在本刀 · `g7SuiteGreen=false` · trio OPEN · 红① STILL OPEN · `actualSpendCny=null` · alone ≠ dual

---
*REQUEST stub · G7T · mw-model-op · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 三 Ban 随卷（弱化校验/masking/G7S 域内）· 修复候选 A/B/C 未裁决 · STOP*
