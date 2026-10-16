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

---

# PRE-EXEC dual 审查段 · mw-model-op（model-op/prompt 版本焦点）· 2026-10-07 · append-only

**审席**: `mw-model-op` · worktree `/Users/miaole/Desktop/golucky/meetwise-rv-g7t-model-op` · branch `rv/g7t-model-op`（基于 `origin/feat/mysql-schema-skeleton`）· 审时 HEAD `8c92b344`。被审 REQUEST = **G7T REQUEST**（`5b6b1e97`，本机 `line/g7t-classify-quality` tip）。**本审零 prove run · 零 coding · 零产品码 edit · 零 SSOT edit · 零 live 调用 · 零 Key 加载 · 零 DB 连接**——证据全部来自本 worktree git 只读亲读 + blob `git hash-object` 亲算 + 在案收据/nail 引用。本 PASS 仅为 mw-model-op 半签（**alone ≠ dual** · 不代签并行 peer `mw-rag-route` · 不预claim 任何 post-commit EXIT）。

## 1. 检查表（全部本席码面/包面亲核 @tree `2297b72d`）

1. **包完整性 + docs-only 机检**：`git diff --name-status c4546f7b..5b6b1e97` = 恰 4 新增 `.md`（slice/harness/双 stub）+315/−0，零产品码、零 SSOT、零 sibling 归档、零 backlog 触碰。**祖先关系如实登记**：`5b6b1e97` 非严格 git-ancestor of origin tip `8c92b344`，但两者 **tree 全等（`2297b72d`）+ 父全等（`c4546f7b`）+ 文本全等**，仅 committer 重根（mw-core@04:17:21 → meetwise@04:18:11，+50s）——content 级祖先成立；沿 G7S POST 已裁 OB-MO-P4 同型 benign 先例登记 **OB-MO-G1 非阻断**。
2. **blob 亲算 ×8 全等 REQUEST §A 锚**：`prompts.ts`=`3eae75fc` · `job-route-classifier.ts`=`79ceded8` · `job-route-decision.ts`=`a621d8bd` · `job-route-classify.ts`=`3b1e7081` · `model-operation-registry.ts`=`63af556f` · `recruiting-bound.spec.ts`=`de4991e6` · `JobCreateForm.tsx`=`0be5344c` · `package.json`=`0afb3bd2`。零漂移。
3. **输出合同三层行号逐一对号**：zod `job-route-classify.ts:103-111`（max(4) **无 min** · leafTrackId 1-64 · bps int ✓）；validator `job-route-classifier.ts:115-160` 十齿（`:119-123`/`:124`/`:129-130`/`:131`/`:133`/`:136`/`:139`/`:140-141`/`:142`/`:143`/`:144`/`:149-152` 全对号）；prompt p.v1 `prompts.ts:23-35`（`:24` 显式 `version:'p.v1'`）；版本纪律注释 `prompts.ts:2-3`（「改 prompt = 升 version」）；registry `:99-104`（`job.route-classify.v1` · chat · text-small · maxDispatches=1 · fallbackAction=`route_unresolved`）。§1.3 四缺口 (a)-(d) 在 p.v1 原文逐一证实（零多叶示例 ✓ · 零显式成功⇒`reasonCodes=[]` 指令 ✓ · 零万分比提示 ✓ · 零 confidence 阈值 7000 ✓）。
4. **RC-1 技术自洽实读核验（`:149-152` conflict 逻辑）**：`:149` desc sort → `:150` `gap = top1 − (len>1 ? top2 : 10000)` → `:151` `marginBps !== gap → ['conflict']` → `:152` `<1000 → ['conflict']` → ok:false → `job-route-decision.ts` `validation_rejected` + `validated.reasons` 持久化 `reason_codes`（INSERT `:117-120`）。模型自报 `reasonCodes` 非空走 `known_not_sent`（`:231-236`）**先于** validator → G7S 读数 `validation_rejected` ⇒ 模型 reasonCodes 空 + JSON 形状合法 ⇒ harness §1.2 派生事实成立；RC-1（margin 恒等自洽失败→`conflict`→`validation_rejected`）机理与读数完全相容，排序自洽 ✓ **且被本席 F1 结构性加强（见第 2 条）**。
5. **F1（本席实读新发现 · 候选 A 充分性缺口）**：`:150` 单叶时 `gap = 10000 − 10000 = 0`（幻影次高=TOTAL_BPS）→ `:151` 要求 `marginBps===0` 与 `:152` 要求 `≥1000` **永久矛盾 → 单叶模型输出不可能过闸**。即 p.v1 唯一示例（单叶 10000 + `marginBps:10000`）**本身即必拒形状**——温度默认 + OOD 输入下模型仿示例即必落 `conflict`/`validation_rejected`。RC-1 首位排序被加强；同时 harness §1.2 表 #10 括注「（单叶=10000）」是 validator 合同**误述（erratum）**——代码不存在单叶生路。对候选 A 的直接约束见 **C-MO-G1**。对照自检：harness §2 减法演示 `[{7000},{3000}]→4000` 逐齿可过（sum=10000 ✓ ≥500×2 ✓ gap 逐位=4000 ✓ ≥1000 ✓）✓。
6. **F2（H19 temperature 纪律缺口 · model-op 首责）**：RAG05 Route L 先例 `semantic-route.ts:28` 明文 live 面=「**H19 temperature=0 + 固定 prompt 版本** + 决策持久化」；而 `model-client.ts:152-156` `SERVICE_TEMPERATURE` 仅 evaluate/planner/resume-diagnosis 三映射，**`job.route-classify.v1` 未列 → live 跑供应商默认温度**（`:413` 条件注入、`:538` trace 记 null）。REQUEST 携带 prompt 版本钉（p.v1→p.v2）但全程零提温度——候选 A「恰 `prompts.ts` 一文件」与 H19 先例存在**未裁决张力**。绑定 **C-MO-G2**。
7. **三 Ban + sticky 写死核验**：harness §5.2（阈值 7000/1000/500/恒等/枚举/sum 全零松动 · Ban 借「校准」放闸）· §5.3（夹具强造=masking）· §5.4（G7S 域内 blob `d06b4f49`/`80abbb80`/uc018/红③ `full.e2e.ts:203` 零触碰）✓；**sticky 不新增自动重试**：harness §5.5 + §2 默认不选 + 代码双重印证（`job-route-decision.ts:14` 头注释「sticky 终态，永不自动重试」+ `:180` `already_unresolved` noop）+ trio fresh-run 无存量负担 + 单 CMD 内部重试按自身契约 Ban 临时调高（§3.0(3)）✓。
8. **EXEC 诊断先行授权面与预算**：§3.0(1) `job_route_decision.reason_codes` SELECT-only（精确拒因已持久化 `:117-120` · 沿 sidecar 白名单 · Ban `ai_invocation_trace.output`）✓；§3.0(2) live 定向回放 N≤20 **单独报备**·内存回放校验器后即弃·Ban 原始输出落盘/入 receipt·`redactOutput` 产品语义零改（`invoke.ts:718` 面零触）✓；§3.1 预算 ≤200 含 N≤20·超限即停不洗 not_run·`actualSpendCny=null` ✓；Key 卫生 loader name-only·Ban `.env*`·Ban fingerprint ✓。判别推翻 RC 排序即停如实迭代（Ban 假修复）✓。
9. **Pins 十值对照 SSOT（`execution-master-checklist.md:1319-1324` 实读）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false`（`:1323`「保持」）· trio OPEN + 红① STILL OPEN（`:1321` 逐字印证）· `actualSpendCny=null`——REQUEST/harness/slice 三文一致，零翻转 ✓。
10. **输入面亲核**：`recruiting-bound.spec.ts:64` jobTitle=`浏览器绑定岗位-${suffix.slice(0,8)}` + `:81-82` 填充/competencies=`高并发, 幂等, 限流` ✓；`JobCreateForm.tsx:43-50` 仅 title+competencies 两字段、description 恒空 ✓；`RULE_SIGNALS`（`:71-80`）对该输入零命中（`高并发/幂等/限流/浏览器` 不在任何词表；frontend 表无『浏览器』）→ `classifyJobByRule` null → 模型路径必然，OOD 判读成立 ✓。wiring `package.json:278/:279/:282` 逐行 ✓。

## 2. Fail-trigger audit（逐条过 · 零触发）

弱化校验=无（REQUEST 全程 Ban 且候选 A 零 validator 触碰面）；夹具强造=无；G7S 域内修=无（docs-only 零产品码）；sticky 自动重试新增=无；Pin 翻转=无；pre-claim post-commit EXIT=无（harness §4 末条 + 三文 Non-claims）；invented spend=无；Key 物料越界=无；假绿/flake 记法=无（Ban 清单 §5.6）；self-approve=无（本段即他审）。**0 Fail-trigger。**

## 3. 请专家五问逐答

1. 三层合同判读**无漏**（三层全部行号/blob 本席亲核）；RC-1~RC-5 排序在 live 小模型行为面**成立且 RC-1 被 F1 加强**（示例必拒形状）；增补 `ai_model_invocation` latency/token 形状查询=**可选非必需**（OB-MO-G2：`reason_codes` 单列已足定谳；若加须 SELECT-only name-only 列、Ban payload、入 sidecar 白名单）。
2. 四项补强方向**正确但不完备**——必须加第五项：**消单叶死路**（v2 删除/更正「仅 1 个 leaf 时 marginBps=10000」、以多叶为唯一成功形态、可显式「≥2 leaf」指令——见 C-MO-G1）；「裸 JSON 无 fence」约束建议随 v2 顺手钉（zod fence 拒因已被读数排除非当前承重，零成本白赚）；temperature 须按 C-MO-G2 显式裁决。
3. N≤20 内存即弃设计**合 Key 与隐私卫生**（redactOutput 产品链零改 · 原始输出不落盘）；样本量**足够**——判别对象是 `reason_codes` 精确单码分布而非统计估计，N≤20 足以分辨 RC-1 vs RC-2/3/4 主导；温度未钉下方差被放大，故 C-MO-G2 先裁后跑。
4. **同意 sticky 面零改动**：代码 `:14` 明文「永不自动重试」+ `already_unresolved` noop + fresh-run 策略无存量负担；「sticky 重试=新产品语义另立卷」边界维持 ✓。
5. **同意 prove 方案**（诊断前置先行/trio ×1 各一次/预算 ≤200/七字段全记录/三来源交叉一致）**与 EXIT 双向契约**；红③→C-MO-P3 另刀切面干净（recruiting-bound 断言 `:96` 零触碰在 §5.4/§4 双处写死）✓。

## 4. Blockers

**0 Blocker。**

## 5. Conditions（绑定 · EXEC 授权前必须满足/随 EXEC 收据兑现）

- **C-MO-G1（单叶死路 · 承 F1）**：候选 A 落码的 p.v2 文本必须**消除单叶必拒死路**——不得保留 p.v1「仅 1 个 leaf 时 marginBps=10000」指令，须以多叶为唯一成功形态（建议显式「至少 2 个 leaf」指令 + 多叶 few-shot 为唯一成功示例）；EXEC 收据根因定谳段必须**更正 harness §1.2 #10 括注「（单叶=10000）」erratum**（实读：单叶 gap=0 → conflict 必拒）。**Ban 借此触碰 `validateModelRouteOutput`**（修复只走 prompt 侧；validator 零松动 Ban 不变）。
- **C-MO-G2（H19 temperature 裁决 · 承 F2）**：EXEC 期须显式二选一并如实登记——(a) 将候选 A 触碰面扩至 `model-client.ts` `SERVICE_TEMPERATURE`（`job.route-classify.v1` 钉 0，沿 RAG05 Route L 先例；扩面须 pre-exec dual 重新确认 + 协调方批准）；或 (b) 维持恰 `prompts.ts` 一文件落地，收据如实登记「classify live 温度=供应商默认未钉」为残余方差风险。**Ban 静默假设 temperature=0**（代码实证未钉）。
- **C-MO-G3（live 回放授权范围冻结）**：N≤20 定向回放 EXEC 执行前单独报备（预算内列支）·内存即弃·Ban 原始输出/Key 物料落盘入 receipt·Key 仅进程环境 loader name-only·Ban `.env*`——按 §3.0(2)/§3.1 原文范围执行，超范围须重新报备。
- **C-MO-G4（alone ≠ dual）**：本 PASS 仅为 mw-model-op 半签；EXEC 启动须 mw-rag-route 并行 PRE dual 亦 PASS + 协调方显式授权；候选 B/C 的 route 语义裁决（RULE_SIGNALS 张力/taxonomy 演进）归 peer 首责，本席不代裁不代签。

## 6. OB（非阻断）

OB-MO-G1：REQUEST twin-commit 重根（`5b6b1e97`≡`8c92b344` 同 tree 同父仅 committer 异）benign，沿 OB-MO-P4 先例。OB-MO-G2：增补 `ai_model_invocation` latency/token 形状佐证查询=可选，若采纳须 SELECT-only name-only 列 + Ban payload。

## 7. 边界声明

本审恰 0 prove run · 0 coding · 0 产品码 edit · 0 SSOT edit · 0 live 调用 · 0 Key 值读取 · 0 DB 连接；本 worktree 恰 1 commit（本段 append-only 追加）；禁 push；本 PASS ≠ EXEC 授权 ≠ red① 终局 ≠ trio 翻绿 ≠ `g7SuiteGreen=true` ≠ 任何 Pin 翻转 ≠ prompt v2 落码授权。

## 中文三行摘要

1. 包完整性/docs-only 机检过（恰 4 新增 .md +315/−0 · blob 亲算 ×8 全等 · 行号逐一对号）· Pins 十值零翻转 · 三 Ban + sticky 不重试双写死（代码 `:14` 实证）· 0 Blocker · 0 Fail-trigger。
2. 实读新发现 F1：validator `:149-152` 单叶死路使 p.v1 唯一示例必拒——RC-1 首位排序被结构性加强，但候选 A 四项补强不完备（C-MO-G1 绑定 v2 消死路 + 收据更正 harness #10 erratum）；F2：classify 未钉 H19 temperature=0（`SERVICE_TEMPERATURE` 无映射，RAG05 Route L 先例在案）——C-MO-G2 绑定 EXEC 显式二选一。
3. Verdict PASS 为 mw-model-op 半签（alone ≠ dual · 不代签 mw-rag-route）· EXEC 须 BOTH PASS + 协调方授权 + C-MO-G1~G4 兑现 · 本 PASS ≠ 任何 Pin 翻转 ≠ 修复授权 · 禁 push。

Verdict: PASS

---

# POST-PROVE dual 审查段（mw-model-op · model-op/prompt 版本焦点 · 2026-10-07 追加）

**被审 EXEC 链**：主线本地 `feat/mysql-schema-skeleton` `c670bf15`（feat · 恰 3 文件 +19/−9）+ `7979cd20`（docs 收据 · 恰 5 文件 +197/−0）；SUMMARY 自报 line worktree v2 twin `430d4c84`（父 `8c92b344`）。全距 `f3c7dd08..7979cd20` 恰 3+5=8 文件零越界（`git diff --name-status` 机检）。**审查 worktree**：`/Users/miaole/Desktop/golucky/meetwise-rv-g7tp-model-op`（branch `rv/g7tp-model-op` @`7979cd20` · tree `5766e421`）· 本席零产品 edit 零共享 SSOT edit。

## 0. 包完整性与机检（blob 亲算 · git rev-parse/cat-file 实测）

- 恰 3+5 文件：feat=「prompts.ts + sealed-job-route-classify-binding.ts + r2-p-worker-route-classify.proof.ts」；docs=「harness +6 + receipts 00/01/02/SUMMARY 恰 4 新增」。
- **零 validator 改动（C-MO-G1 机检面）**：`job-route-classifier.ts` blob `79ceded8` 链前=链后全等；`job-route-decision.ts` `a621d8bd`、`model-operation-registry.ts` `63af556f`、`model-client.ts` `6b12dfca`、`semantic-route.ts` `077aebab` 全等；Occupied 面 `recruiting-bound.spec.ts` `de4991e6`、`recruiter.ts` `d06b4f49`、`package.json` `0afb3bd2` 全等；SSOT `ai-docs/meta/index.md` `4c50373f` 链前=链后零 diff。
- Twin 核验：`430d4c84` vs `c670bf15` 三产品文件 blob 逐字节全等（`69ca4633`/`e291780d`/`7e03af1c`）；两 commit tree 不等（`ea10e1e0` vs `02b22e28`）但 delta 恰为 f3c7dd08 两个 PRE 审查文件=重根 benign（沿 OB-MO-P4 先例，OB-2 非阻断）。
- Key 物料零入树：8 文件扫 `sk-*`/`API_KEY=` 值/`Bearer` 命中仅为「`MODEL_API_KEY=set` name-only」登记行×3；诊断/sidecar 临时脚本 `.tmp/` gitignored 且 `git ls-files` 零追踪。
- Append-only 机检：本文件前 22131B md5 `b141950b` 追加后逐字节保全（PRE 段含其末行 Verdict 原文未动）。

## 1. C-MO-G1~G4 逐条裁决（本席四条件兑现定谳）

| 条件 | 裁决 | 证据 |
|---|---|---|
| **C-MO-G1** v2 消单叶死路 + erratum 落字 · Ban 触 validator | **兑现（PASS）** | 死路消除双证：①确定性证——收据 00 §1 单叶两形状探针（margin=10000 逐字 p.v1 示例形 / margin=0 派生形）均 `{"ok":false,"reasons":["conflict"]}`，与 validator `:150-152` 实读自洽（单叶 fallback=TOTAL_BPS→gap=0→`:151` 恒等矛盾→`:152` 阈值拒）；②教学面证——p.v2「仅 1 个 leaf 时 marginBps=10000」条款删除+单叶唯一示例删除+「绝不要把全部权重集中在单一 leaf」新增（diff 亲读）。validator 零改动（blob `79ceded8` 双端全等）。Erratum 落字双落点：harness 末尾 append-only ERRATUM 段（+6 行）+ 收据 00 Erratum 节，均如实承卷双审先发现（`8c9295a9` OB-RR-2 + 本席 `0efbcd3b` F1） |
| **C-MO-G2** temperature 显式二选一 · Ban 静默假设 0 | **兑现（PASS · 二选一取 prompts-only 支）** | 「供应商默认温度如实登记」非静默 0：收据 00/04 显式写明「`SERVICE_TEMPERATURE` 无 `job.route-classify.v1` 映射 → live 跑供应商默认温度，F2 维持，扩面钉 0 须重新双审，本刀不动」——登记的是未知/默认值本身而非假设 0，满足 Ban。映射面零触碰机检：`model-client.ts` blob `6b12dfca` 全等 + 映射表实读仅 3 服务无 classify 项。残余方差入卷：v2 预检 confidence/margin 精确贴锚（7000/1000/1500）的锚定行为如实登记为闸内合规残差 |
| **C-MO-G3** 回放 N≤20 · 内存即弃 · Key name-only | **兑现（PASS）** | 范围冻结：诊断 round-1×4+round-2×4+预检×3+CMD2×2 attempt=收据口径 4+4+3+6=**17 ≤ 20**；叶数形状全记录（收据 00 逐 ITER 表）符合「记录叶数形状」授权。内存即弃：原始模型输出/DB payload 零落盘（在卷仅形状汇总）；临时脚本 gitignored 零追踪；sidecar SELECT-only 白名单 Ban payload/`ai_invocation_trace.output` 如实执行。Key name-only 全程（五 `.env*` ABSENT）。OB-1：17 中 CMD2 项=6 的分解（classify ×2×2=4 + 面试面既有调用≈2）未逐值列表，严格 classify-only 口径=15——两口径均 ≤20，界不破，非阻断 |
| **C-MO-G4** alone≠dual 半签 · 不代签 mw-rag-route | **兑现（PASS）** | 授权链如实引用：收据 00/SUMMARY 均写「pre-exec dual BOTH PASS（mw-rag-route `8c9295a9` + mw-model-op `0efbcd3b`）→ 协调方 EXEC 授权」，两 twin commit 对象在卷可解析（`git cat-file -t` 双 PASS）。SUMMARY 明示「post-prove 双审由协调方另派（本席不自批）」——本段即 mw-model-op 半签；并行 mw-rag-route POST 审不在本席视野，本段不构成也不预断其裁决 |

## 2. v2 质量五要素逐项（prompt 版本域 · C-RR-2）

1. **删单叶条款**：「仅 1 个 leaf 时 marginBps=10000」删除 + 单叶示例删除 + 恒 ≥2 叶指令新增——PASS。
2. **2 叶减法 few-shot**：唯一 JSON 示例 `backend/general 7000 + backend/nodejs 3000 → marginBps 4000`，7000−3000=4000 精确减法演示；亲算过闸形状（sum=10000 ✓ 每 ≥500 ✓ ≤4 叶 ✓ margin=gap=4000≥1000 ✓ reasonCodes=[] ✓ confidence 8000≥7000 ✓）——PASS。
3. **reasonCodes 双向**：成功⇒恰 `[]`、拒分⇒`allocations=[]`+非空——双向指令与 validator `:144`（非空即 conflict）`:123`（空 allocations→invalid_schema）合取自洽——PASS。
4. **万分比**：「万分比（满分为 10000，不是百分比 100）」——直指 RC-2 bps 算术误读面——PASS。
5. **confidence ≥7000 锚**：锚值与 `JOB_ROUTE_CONFIDENCE_THRESHOLD_BPS=7000`（`:36`）精确同值，另附 margin 差 <1000 的「难以自信区分」条款（与 `:37` 阈值同源）——PASS。
- **Sealed 常量同步（C-RR-3）**：`SEALED_JOB_ROUTE_CLASSIFY_PROMPT_VERSION` `p.v1→p.v2`（`:28` · sealed 漂移消除）；**测试钉同步**：`r2-p-worker-route-classify.proof.ts` 断言 `version: 'p.v1'→'p\.v2'`（`:114` hunk 亲读）。全仓 `p\.v1` 残留 grep 仅剩 sealed 注记 1 处（迁移说明，非活引用）——PASS。

## 3. 诚实性裁决（CMD2 仍红 · attempt2 定性）

- **CMD2 仍红如实**：EXIT=1 原值 ×2 双收据全记录（12P/2F/10S ×2 · 红①签名 `:96:14` 30s 超时同形），SUMMARY 一句话定谳以「红①用例仍红」开头非埋没——如实。
- **attempt2 定性裁决（本席）**：Ban retry-to-green = 禁为翻绿重跑并只留绿档。attempt2 同码 `430d4c84` 零产品变更、目的=sidecar 判别（SELECT-only 白名单仪表）、结果 EXIT=1 红档与 attempt1 同列归档零择优、判别产出=根因位移定谳（classify 面 `validation_rejected×2→result_validated×2` 翻绿 · 残留=begin/异步 classify 时序面 · consumption=0/snapshot=0 · 竞差 0–2s）——**目的=判别成立，Ban 守住，attempt2 合规**。attempt1 sidecar 缺位如实自报 OB-2 且为 attempt2 唯一动因、禁以 attempt1 读数定谳——仪器诚实。
- **根因位移处置**：时序面残留超出本刀授权（prompt v2 校准+诊断先行）——EXEC 已 STOP 交协调方且本刀零触碰该面（`de4991e6`/`d06b4f49` blob 机检佐证），未越权、未为绿改断言（红③ `:203` 零触碰）、sticky 通路零改动——**维持 STOP 裁决，本席同样不授权任何时序面改动**。

## 4. Blockers / Conditions

**Blockers：0。**

**OB（非阻断）**：OB-1 live 计数 17 vs 严格 15 分解未逐值列表（两口径均 ≤N≤20 界不破）；OB-2 twin 重根（delta 恰=PRE 审查文件 · benign 沿 OB-MO-P4）；OB-3 attempt1 仪表缺口（EXEC 已自报并由 attempt2 补齐 · 两档全记录）。

**Conditions（转后继 · 均非本段放行条件）**：
- **C-MO-P1** 时序面残留：任何修复（独立夹具刀「等 route_decided 再 begin」或产品面消费时序变更）须新 REQUEST+双审+协调方授权；Ban 无授权改夹具、Ban 为绿弱化断言。
- **C-MO-P2** F2 温度面维持 OPEN：classify 钉 0（映射或参数面）须重新双审；锚定行为残差（贴字面下限 7000/1000/1500）列入后续质量刀观察面。
- **C-MO-P3** alone≠dual：本 PASS 仅 mw-model-op 半签，不代签 mw-rag-route；其并行 POST 审独立成立；dual 状态由协调方汇签。
- **C-MO-P4** Pins 零翻转本段复核成立：`g7SuiteGreen=false` retained、trio OPEN、红① STILL OPEN（构成已变：classify 面绿 · 时序面残留）、`actualSpendCny=null`——本 PASS 不翻转任何 Pin。

## 5. 中文摘要（3 行）

1. 包完整性恰 3+5 文件零越界，validator/decision/registry/model-client/SSOT/Occupied 面 blob 亲算全等零改动，Key 物料零入树，twin 重根 benign；我的 C-MO-G1~G4 四条件全部兑现：单叶死路消除（确定性探针+教学面双证+erratum 双落点）、温度取 prompts-only 支且供应商默认如实登记未假设 0、回放 17≤20 形状内存记录 Key name-only、授权链如实引用且半签不代签。
2. v2 五要素逐项在卷全 PASS（删单叶/7000−3000=4000 减法 few-shot/reasonCodes 双向/万分比/confidence 7000 锚与 `:36` 阈值同源），sealed 常量与测试钉同步升级无漂移，p.v1 活引用清零。
3. CMD2 仍红如实两档全记录，attempt2 同码仪表化判别合规、Ban retry-to-green 守住；残留红①=begin/异步 classify 时序面超授权维持 STOP 交协调方；0 Blocker 4 Conditions，`g7SuiteGreen=false` 零翻转，本 PASS=mw-model-op 半签。

Verdict: PASS
