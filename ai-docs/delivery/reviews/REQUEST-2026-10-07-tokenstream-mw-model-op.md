# REQUEST — **TOKSTREAM · 模型输出 token 流式透传设计刀** · pre-exec dual · `mw-model-op`

**Verdict**: _（空审 stub · 待 `mw-model-op` 独立填写 · alone≠dual · Ban 自批）_
**Expert**: `mw-model-op`（domain: model-op / invoke 关口与计费纪律 · 流式升级对 durable claim·settle·usage 语义的冲击面 · 本刀 docs-only REQUEST 契约面）
**Date**: _待填_
**Tip / HEAD（verified）**: _待填（预期 = 本 REQUEST 卷 commit · base `0fe96fca007d1de740eb699eede94c28febfcaa2`）_
**Knife**: `harness/token-stream-design.md` + `token-stream-design.slice.md`
**Status this open**: **`REQUEST-ready / not_run:pre_dual`** · docs gate only · **zero coding · 零产品码触碰（本卷）**

---

## 0. HEAD / scope gate（docs-only 四文件机检：apps/packages/scripts 零字节）

_待审_

## 1. 现状锚复核（invoke 全调用面非流式单发 · `interview-service.ts:283-284` report 调用面 · `invoke.ts:635` 单发 `plan.execute` · `model-client.ts:400-419` 一次性 JSON POST——设计前提是否与源码事实一致）

_待审_

## 2. 阶段1 触发面与写入通道复核（P0/P1/P2 优先级 · 包装层回调不侵 invoke 关口 · 案A 节流持久写 ≤6 行/生成 vs 案B 进程内+ring buffer〔SSE-PUSH 依赖〕——「低险」定级是否成立）

_待审_

## 3. 阶段2 invoke 升级面复核（观察缝不旁路 durable claim/派发边界/计费/双校验链 · usage 末帧缺失沿 `provider_usage_invalid` 收口不为流式发明新计费路径 · flag 门沿 voice-stream fail-closed 形制 · 供应商 live 核实=前置门零预claim）

_待审_

## 4. 两案裁决复核（D-1 写入通道 · D-1b 节流 T1/T2〔阶段1 非流式下 T2 计数不可得=空壳的定级〕· 计费/账本维度是否被任一案隐式扩大）

_待审_

## 5. 隐私与预算面复核（进度载荷红线：无内容/思考/prompt 字段 · Ban reasoning 原文落持久表 · 零 live 零 Key · `actualSpendCny=null` Ban invented spend）

_待审_

## 6. Pins / Bans 复核（硬 Ban 十条 · 阶段2/3 另刀授权边界 · SSE-PUSH 刀域只声明接口契约零实现）

_待审_

## 7. Verdict 与理由

_待审_

---

*REQUEST stub · TOKSTREAM token 流式透传设计刀 · PENDING awaiting mw-model-op + mw-e2e-ha pre-exec dual · alone ≠ dual · STOP*
