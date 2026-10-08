# REQUEST — **TOKSTREAM · 模型输出 token 流式透传设计刀** · pre-exec dual · `mw-e2e-ha`

**Verdict**: _（空审 stub · 待 `mw-e2e-ha` 独立填写 · alone≠dual · Ban 自批）_
**Expert**: `mw-e2e-ha`（domain: e2e / SSE 通道与断线语义 · 前端流消费与渲染断言 · 轮询/槽位/背压面 · 本刀 docs-only REQUEST 契约面）
**Date**: _待填_
**Tip / HEAD（verified）**: _待填（预期 = 本 REQUEST 卷 commit · base `0fe96fca007d1de740eb699eede94c28febfcaa2`）_
**Knife**: `harness/token-stream-design.md` + `token-stream-design.slice.md`
**Status this open**: **`REQUEST-ready / not_run:pre_dual`** · docs gate only · **zero coding · 零产品码触碰（本卷）**

---

## 0. HEAD / scope gate（docs-only 四文件机检：apps/packages/scripts 零字节）

_待审_

## 1. 现状锚复核（SSE 面 `interview.controller.ts:250-286`〔:259 writeHead · :276-283 2s 轮询 · 槽位≤5 · 10min 帽〕· 前端 `interview-stream.ts` Last-Event-ID 续推+水位去重 · `business-events.ts` 白名单未知 kind 静默丢弃 · `interview-state.ts:128` progress no-op——题间零进展反馈的审计前提是否成立）

_待审_

## 2. 断线语义复核（案A 进度行重放=幂等覆盖写+终态清除 vs 案B 进度帧跳过不死等 · 进度帧缺失/乱序/重复不触发 reconnecting/degraded · 35s+ε 进度静默兜底回 phase spinner——死胡同防线是否闭合）

_待审_

## 3. 两案裁决复核（D-1 案A 零传输改动当天可交付 vs 案B SSE-PUSH 刀依赖顺位后置 · D-2 新 kind 双端同刀注册 vs 复用宽松 progress——前端零感知风险是否写死）

_待审_

## 4. backpressure 与 prove 面复核（写侧节流上限/幂等 · SSE 写频 ≤ 既有 2s 轮询周期 · 前端幂等覆盖写不破 applyEvents 每 chunk 一快照 · TS-P1..P5 断言〔fake seam 零 live〕可判定性——尤其 TS-P3 丢帧不死胡同）

_待审_

## 5. 阶段2 渲染面复核（UX-A 打字机 vs UX-B 即显〔产品裁示〕· 增量帧非权威终态覆盖 · coalesce 慢消费合并不无界排队 · 用户断开≠中止生成）

_待审_

## 6. Pins / Bans 复核（硬 Ban 十条 · SSE-PUSH 刀域零触碰只声明契约 · 阶段2/3 另刀授权边界）

_待审_

## 7. Verdict 与理由

_待审_

---

*REQUEST stub · TOKSTREAM token 流式透传设计刀 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · STOP*
