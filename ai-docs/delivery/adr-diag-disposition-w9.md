# ADR — 诊断处置口径（W9 三态分层 · #213 修法③文档化落）

**Status**: **`proposed:awaiting_coordinator_signoff`**（EXEC 落档 2026-10-11 · **决议签认=协调方**——产品决议非起草席/EXEC 行使 · 签认后由协调方补登 `harness/product-campaign-LEDGER.md`（:58 批2「其他」行含 #213 / :69 口径三态标注刀 W9 行）· 本体共享 SSOT 只读，本刀零触）
**来源**: issues-master 更正版 #213（:478）修法列「统一处置口径；展示"剔除 N 条"；无岗位时不出 match」第三分句之文档化落 · 载体卷 `harness/diag-honesty-REQUEST.md` §1-③
**行为零改声明**: 本决议为**纯文档**——`apps/worker/src/interview-service.ts` 硬闸（:262-268 分层注记 / :274-287 businessValidate）与 `apps/worker/src/diagnosis-consumer.ts` 退款链（:55-59）语义字节零动；「统一处置口径」以文档化落，**不以改码落**。

## Decision（登记现状 = 有意分层）

诊断管线对「虚构/无依据内容」的处置为**三态口径**，现状即如此运行，本决议把既有码内注记（`interview-service.ts:262-268`「分层接地业务闸」头注）**升格为显式产品决议**：

| 态 | 触发 | 处置 | 实锚 |
|---|---|---|---|
| ① 改写虚构 → fail-fast 整份失败 | business validator 三码：`rewrite_unanchored`（改写无锚）/ `fabricated_experience`（refs 不接地于简历 facts）/ `fabricated_metric`（after 编造简历里没有的数字） | 任一命中 → throw → 整次诊断走失败路径（**绝不交付一份教人编造经历的诊断**）→ `status='failed'` + `diagnosis_unavailable` 终态事件（无静默死胡同）+ `releaseConsumption` **失败退款**（预留 1.0 必释放·幂等 key=diagnosisId） | `interview-service.ts:274-287`（`:282-284` 三码·`:290` throw）+ `diagnosis-consumer.ts:55-59` |
| ② finding 不接地 → 优雅剔除 + 计数 | 图侧 factuality 歪曲门：逐条 finding 过接地；正面信用声明维度（highlight/match）空 refs 一并剔除 | 静默剔除该条（不整份失败），剔除数累计入 `rejectedCount` 随 report jsonb 落库，前端「已剔除 N 条无依据结论」如实可见（#213 修法①·>0 必可见·0/缺省零渲染） | `packages/ai-graphs/src/resume-diagnosis.ts:60-76`（`:69`/`:74` 累计·`:85` 入报告）+ `DiagnosisPanel.tsx` |
| ③ 接地通过 → 正常交付 | 全部硬闸与歪曲门通过 | 正常交付报告 + 结算额度 | `diagnosis.proof.ts:131`（groundedCount=6/rejectedCount=2 既有断言） |

**不对称是设计而非疏漏**，理由如实登记：
- **改写量化造假属确定性可检出**——after 中的数字/经历可对照简历 facts 机械判定，检出即定谳，且改写是系统主动产出的「建议」，容错为零（交付即教人编造经历）→ 取最严的 fail-fast + 退款。
- **finding 接地是概率性纵深过滤**——finding 量大、逐条误杀代价高，确定性门只拦「refs 不接地 / 正面声明无引证」这类可机械判定的子集；「refs 接地但正文语义虚构」属 LLM-judge/ai-eval 层职责（`resume-diagnosis.ts:13-14` 残留缺口诚实声明，非 theater）→ 取剔除+可观测计数，不整份否决。

**统一与否 = 产品裁定权**：三态是否归一为单一处置，属产品决策，**现行为 = 有意分层，维持不动**。任何后续「已统一处置」的宣称，在本决议获协调方签认并真实改码之前均为伪造宣称（Ban 同源：`harness/diag-honesty-REQUEST.md` §5「Ban 伪造『处置口径已统一』宣称」）。

## Scope（本决议覆盖面与相邻联动）

- 覆盖：改写（rewrites）虚构硬闸、finding 接地歪曲门、退款链——三者的**处置口径登记**，不含任何行为参数（阈值/错误码/退款语义零改）。
- 相关联动（同卷 #213 修法②，口径的供给面延伸）：无 role（未提供目标岗位）时 prompt 组装剔除 match 维度（`packages/ai-runtime/src/prompts.ts` 条件组装）——**不伪造岗位侧对照事实**；枚举本体（`DIAGNOSIS_SECTION_KINDS` 五值 / `z.enum`）不动，无 role 响应缺 match section 即合法。
- **残留显式登记（pre-exec 席1 · 归 ai-eval 面）**：无 role 剔 match 属 prompt 供给面约束、非 validator 强制——不听话模型仍可产 match kind 过图侧 kind∈枚举校验（`resume-diagnosis.ts:81`）落地；同理「refs 接地但语义虚构」非确定性可拦。两者均归 ai-eval / LLM-judge 层，不在本确定性闸内过度声明已解决。

## Consequences

- 三态现状获得显式命名与实锚，审计/验收可引用本卷而非逐处读码注记。
- #213 修法①②的交付面（rejectedCount 可见、无 role 零 match）与三态口径互洽：②的剔除计数是态②的可观测出口。
- 统一处置的任何未来动议 = 新产品决议 + 新刀（改码 + 本卷 supersede），不经本卷自动生效。
- LEDGER 补登（:58/:69 映射）待协调方签认时执行；本刀对 LEDGER 零写入。

## Non-claims

- 不宣称处置口径已统一（现状 = 有意分层，且维持）。
- 不宣称 match 维度在无 role 时被 validator 保证不出（供给面约束而已，残留已登记）。
- 不宣称本卷构成任何行为变更、退款语义变更或硬闸阈值变更。
- 不替协调方行使产品裁定权：本卷 Status 为待签认，签认前不作为已生效决议引用。
