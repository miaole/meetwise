# TOKSTREAM-S4B 《MODEL_TEXT_STREAM 双 flag 翻转策略》

EXEC 施工席落卷 · 2026-10-14 · 依据：tokstream-s4b-REQUEST.md rev3 §2 R8（§I「全链 flag OFF 缺省=上线旗标另裁」承接）+ 裁决项① 推荐行使。
本件为策略文档：**本刀零翻 flag**（缺省 OFF 维持），实际翻转=上线旗标另刀另裁。实施位锚 @ `packages/ai-runtime/src/model-client.ts`（行号 @ `line/tokstream-s4b` 施工树）。

## 1. flag 面与缺省

| flag | 语义 | 缺省 |
|---|---|---|
| `MODEL_TEXT_STREAM_ENABLED` | 流式通道总开关（请求面 `stream:true`+`stream_options.include_usage`） | 未设=OFF |
| `MODEL_TEXT_STREAM_PREVIEW` | 预览锁（与 ENABLED 构成双开门槛） | 未设=OFF |

- 双开门槛（请求面）＝ `:348-350`（`ENABLED=1 ∧ PREVIEW=1`）；判定单源 `isModelTextStreamPreviewEnabled` fail-closed 缺省 OFF（`:353-355`）。
- 误配语义：单开 ENABLED（PREVIEW 缺席）→ 构造期显式抛 `model_text_stream_unconfigured`（`:338` 码 / `:361-364`），禁静默降级。
- 锁面：`NODE_ENV=production` / `MODEL_COST_ENFORCEMENT=enforce` / `MEETWISE_PUBLIC_PREVIEW` 三锁任一在场 → refuse-closed 恒非流式（`:341-345`）——**锁面下永不启用**。

## 2. 翻转序列（未来执行时）

1. 先 `MODEL_TEXT_STREAM_PREVIEW=1`（单独置位不启用任何通道，仅解除误配门槛）；
2. 再 `MODEL_TEXT_STREAM_ENABLED=1`（双开成立，请求面进入流式）。
   逆序（先 ENABLED 后 PREVIEW）会在中间态命中 `model_text_stream_unconfigured` 显式拒绝——即误配即抛的既设防线，不是回退态。

## 3. 回滚

任一 flag 摘除（或未传播到实例）→ `completeStream` 本体自回退恒走非流式（`:907-909` flag 门 fail-closed·`client.complete(req,1,signal)` 原路径零回归）；路由臂条件单源 `shouldRouteModelTextStream()`（本刀新增）同读该 flag → 摘除即整链回非流式。零数据面损失：token_delta 为传输态不落表（§C-5），权威终态照常 `question_ready` 落 `interview_event`。

## 4. g7 freetier 恒不路由（R8(a) 防线）

路由条件单源 `shouldRouteModelTextStream()`＝ 双 flag 双开 **∧** `!g7RuntimeInjection().freetierReproveEnabled()`——g7 freetier 恒走非流式既有全路径（stream 通道零 g7 预约/终结面；双保险：completeStream 本体自回退仍独立受 flag 门约束）。**未来 ON 须另刀 g7 车道审批**（§D-2 原文承接；本刀仅声明，零触 g7 面）。静态断言随 `prove:invoke-model-delta`（路由条件单源恰 2 调用位+g7 行为臂）与 `prove:model-client-stream`（completeStream 区域零 g7 面七连断言）登记。

## 5. NOTIFY 载荷预算（R8(b)·EXEC 定谳=按 JSON.stringify 后载荷实算+超限切分）

NOTIFY envelope 上限 8000 字节；worker 侧预算钉 `TOKEN_NOTIFY_MAX_PAYLOAD_BYTES=7500`（`apps/worker/src/token-stream.ts`），按 **序列化后** 实测字节计（4KB text 最坏转义膨胀可破 envelope）；超限按码点安全切分降档出多帧（seq 连续递增），绝不静默截断内容。验收臂：`prove:token-stream` R2-c（`"`×4000 最坏转义卷全帧 ≤7500+零丢字符）。

## 6. 翻转前置（已随本刀落码）

`completeStream` usage 组装已对齐非流式 complete 的 AG-14 口径（字段缺失按 policy 上限/估算补齐+`usageSource='usage_missing'` 打标，`?? 0` 形废除；整体缺失保持 undefined 归并既有无效账面臂）——翻转前置修复项（REQUEST F3/R1b-④）已兑现，验收臂 `prove:model-client-stream` R1b④ 双臂。

## 7. 计件与责任

- 本刀交付面：worker 观察缝（`onModelDelta`）→ `interview_token_ch` → api delta 臂 → web `token_delta` 渲染全链在**缺省 OFF** 下零触；全链 flag OFF=既有非流式行为逐字节原值（回归门原值在案）。
- 实际翻转（PREVIEW/ENABLED 置位）＝上线旗标，归协调方另裁另刀；翻转前后须复跑 `prove:model-client-stream` + `prove:invoke-model-delta` + `s4b-delta-arm:prove` 三门并留收据。
