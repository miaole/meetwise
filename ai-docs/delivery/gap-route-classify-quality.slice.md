# Slice — G7 · **红① route/classify 输出质量校准刀**（Line G7T · docs REQUEST · `draft:awaiting_pre_exec_dual`）

**配套**: harness `harness/gap-route-classify-quality.md`（SSOT 细节/根因锚/候选全文以 harness 为准）· 双审 stub `reviews/REQUEST-2026-10-07-gap-route-classify-quality-mw-rag-route.md` + `reviews/REQUEST-2026-10-07-gap-route-classify-quality-mw-model-op.md`
**上游**: G7S trio 收据 `receipts/gap-begin-snapshot-supply-fix/`（C-MO-Q2 定谳：`validation_rejected` ×2 · classify succeeded ×2 · `route_consumption_event`=0 · `interview_route_snapshot`=0）→ G7S POST dual BOTH PASS → coordinator nail `c4546f7b` **C-MO-P1 指名本刀**（Ban G7S 域内修/Ban 弱化 validator/Ban 夹具强造）
**Base**: `origin/feat/mysql-schema-skeleton` `c4546f7b`（fetch 后实测 tip = 预期 G7S nail · 无 turn 内前进）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7t` · branch `line/g7t-classify-quality`
**本 turn 边界**: docs-only 一次 commit · Ban coding · Ban prove 执行 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban SSOT/backlog 状态翻转 · Ban 碰 sibling 归档/已占用行 · **Ban 弱化 `validateModelRouteOutput`** · Ban 夹具强造 route metadata（=masking） · Ban G7S 域内修 · Ban 洗断言 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT

## 范围（REQUEST 要点五条）

1. **诊断前置（只读在案 · 精确拒因留 EXEC 判别）**：定谳承卷（G7S C-MO-Q2）——classify **调用**成功（HTTP 200 ×2 · qwen-plus）但**输出**未过 `validateModelRouteOutput`（`job-route-classifier.ts:115-160` @blob `79ceded8`）→ sticky `route_unresolved`（`:180`）→ 无 binding → `recruiter.ts:410`（blob `d06b4f49`）`interview_ineligible_route` 409 fail-closed → 30s 超时。**本刀新码面事实**：(a) 读数=`validation_rejected` 非 `known_not_sent` → 模型 reasonCodes 为空、JSON 形状合法，死在业务校验（zod 失败/fence 漂移已被读数排除）；(b) prompt（`prompts.ts:23-35` @blob `3eae75fc` p.v1）零多叶 few-shot、零「成功时 reasonCodes=[]」双向指令、零万分比反直觉提示、零 confidence 校准锚；(c) 校验最严齿=marginBps **逐位等于** top1−top2 且 ≥1000（`:149-152`）+ sum 恰 10000（`:139`）；(d) 红①输入（`recruiting-bound.spec.ts:81-82` · title=`浏览器绑定岗位-<hex>`/competencies=`高并发, 幂等, 限流`/description 恒空——表单 `JobCreateForm.tsx` 无该字段）对规则词典零命中 → 模型路径必然（典型 OOD）；(e) `redactOutput:true` → 原始输出全链不留痕，但 `job_route_decision.reason_codes` 已持久化精确拒因而 G7S 未查询 = EXEC 诊断第一查询。
2. **根因候选排序（假设 · EXEC §3.0 DB 拒因判别 + live 定向回放 N≤20 后定谳）**：RC-1 margin 恒等自洽失败（`conflict`）＞ RC-2 sum≠10000/bps<500 算术（`invalid_schema`/`calibration_failed`）＞ RC-3 low_confidence（<7000）＞ RC-4 叶覆盖不足（`taxonomy_invalid`）＞ RC-5 半执行拒分（空 allocations+空 reasonCodes → `invalid_schema:123`）。「校验过严」不入修复候选（Ban 弱化）。
3. **修复候选（≥2 · 双审+协调方裁决后方可 EXEC · 一次只落一个候选单变量归因）**：**候选 A（推荐）**=prompt 校准 v2（`p.v1→p.v2`：多叶 few-shot 带 margin 减法演示 + reasonCodes 双向指令 + 万分比提示 + confidence 锚 · 恰 `prompts.ts` 一文件 · 零校验零 DDL 零 taxonomy 改动）；**候选 B**=规则词典校准（`RULE_SIGNALS` 扩通用后端词 · 须升 `JOB_ROUTE_POLICY_VERSION` · 与 `:66-70` 刻意歧义不映射设计直接张力须逐词论证）；**候选 C**=叶枚举扩展（仅 RC-4 主导才立项 · domain+migration+消费链最大触碰面）。**三 Ban 随卷**：弱化校验/masking/G7S 域内修；sticky 不新增自动重试（另立卷）；trio 复跑 fresh DB 无存量负担。
4. **prove 方案**：EXEC 诊断前置（`reason_codes` SELECT-only 判别 + live 定向回放内存即弃 Ban 落盘）→ 修复落码 → trio 三 CMD（`pnpm e2e:isolated`/`e2e:ui:isolated`/`verify:e2e-performance`，wiring `package.json:278/:279/:282` @`0afb3bd2`）**各恰好一次**（iso→ui→perf）· **预算 ≤200**（含诊断 N≤20 单独报备）· Key 只经进程环境（loader name-only）· Ban `.env*` · 七字段逐 attempt 全记录 · 三来源交叉一致；读取面板扩查 `job_route_decision`(attempt_outcome×reason_codes)/`route_consumption_event`/`interview_route_snapshot`/ledger；判别推翻 RC 排序即停如实迭代（Ban 假修复）；收据落 `receipts/gap-route-classify-quality/`。
5. **EXIT 契约（双向）**：红①清除 → CMD2 向全绿推进；**红③ `full.e2e.ts:203` 独立留 C-MO-P3 另刀（Ban 为绿改断言）**；`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链（缺一不可）；仍红 → EXIT=1 原值 + 逐 case 五分类 + RC 排序修正如实登记 → 迭代刀重走 REQUEST（Ban flake 记法/retry-to-green/只留绿 attempt）。recruiting-bound 断言零触碰。

## Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not root-cause 定谳（RC-1~RC-5 是假设排序非裁决 · EXEC 判别定谳）· not 修复候选裁决（A/B/C 均为候选非定案）· not trio green · not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator authorize · 红③ C-MO-P3 不在本刀 · sticky 重试不在本刀 · `g7SuiteGreen=false` · trio OPEN（EXIT 1/1/1）· 红① STILL OPEN（master checklist `:1321`）· `actualSpendCny=null` · alone ≠ dual

## Pins（原值 + retained）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false`（retained · 至三绿+post-dual+协调方 nail）· `r1Closed=false`（retained）· Disclosure-1 OPEN（retained）· trio OPEN（1/1/1 真实业务红）· GAP-G7K-API-REDS P1 OPEN（`0c6c3287` 登记 · 不翻）· `actualSpendCny=null` · STOP

---
*Slice · G7T 红① route/classify 输出质量校准刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 定谳承卷=classify 输出未过校验 → validation_rejected sticky → 409 fail-closed → 30s 超时 · RC-1 margin 自洽为首候选（EXEC `reason_codes` 判别定谳）· 候选 A prompt v2 推荐/B 规则词典/C 叶扩展 交双审 · 三 Ban（弱化校验/夹具强造/G7S 域内）随卷 · trio ×1 各一次 · 预算 ≤200 · Ban 假绿/retry-to-green · STOP*
