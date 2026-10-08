# Slice — **TOKSTREAM · 模型输出 token 流式透传设计刀**（进度事件 → 完整流式 → 报告同构 · REQUEST docs-only · 阶段1 先行独立刀 · 阶段2/3 另刀授权）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 零 coding · 零 prove · 零 live · Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins（十值照抄）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`0fe96fca`** / full `0fe96fca007d1de740eb699eede94c28febfcaa2`（开工 fetch 后实测恰等预期 ≥`0fe96fca` · 无 drift）
**Authority**: meetwise — 设计刀授权链：用户直裁（token/思考过程应事实展现前端 · 反对题间无进展 loading）→ 审计确认（invoke 非流式 · 前端只收离散成品事件）→ 协调方立刀（docs-only）→ 本 REQUEST（§3 loop 第③步）。双审 PASS ≠ EXEC 授权 ≠ 阶段2/3 立项。
**Line**: **TOKSTREAM**（worktree `meetwise-line-tokenstream` · branch `line/model-token-stream`）

## One-line

用户直裁「大模型吐的 token 和思考过程是不是事实展现前端？让用户一直 loading 不好」——审计确认现状：**invoke 全调用面非流式单发**（`interview-service.ts:200/:231/:263/:283-284` · `adaptive-interview-service.ts:48/:143-154` · `model-client.ts:400-419` 一次性 JSON POST）· 前端只收离散成品事件（`question_ready` 等 · `interview-state.ts:128` 对 progress 直接 no-op）· **题间零进展反馈**（spinner 独扛 35s 级等待）；本设计刀交**三阶段落地案**：阶段1 生成进度事件（`generation_started`〔含预估段〕/`model_first_token`/`generation_progress`〔节流〕· **写入通道两案交双审**：案A 节流持久写 `interview_event` 零传输改动 vs 案B 进程内通知+内存 ring buffer〔SSE-PUSH 刀依赖〕· 节流两案 T1 时间窗 vs T2 token 计数）→ 阶段2 完整流式（invoke 观察缝 `stream:true` · **供应商支持面核实=dashscope compatible-mode SSE 属前置门零预claim** · 前端逐 token 渲染 UX 两案 · 思考过程 R-A 折叠区展示 vs R-B 仅进度 **Ban reasoning 原文落持久表**）→ 阶段3 `report.narrative.v1` 同构；每阶段触发面/事件 schema/断线语义（Last-Event-ID 对进度帧案A 重放幂等覆盖 vs 案B 跳过）/backpressure 三层写死；与 SSE-PUSH 刀（wakeup `:74`/`:95`）**只声明接口契约零实现**。

## 裁决点（交双审）

| # | 裁决点 | 两案 | 实现方倾向（非绑定） |
|---|--------|------|---------------------|
| D-1 | 进度事件写入通道 | 案A 节流持久写 `interview_event`（≤6 行/生成 · 零传输改动 · Last-Event-ID 天然重放）vs 案B 不入持久表（进程内通知+内存 ring buffer · 零表增长 · **依赖 SSE-PUSH 刀域通道** → 阶段1 顺位后置） | 阶段1 案A · 案B 登记 SSE-PUSH 后演进 |
| D-1b | 节流策略 | T1 时间窗 2s（帧数上界确定）vs T2 每 N token（阶段1 非流式下计数不可得=空壳） | 阶段1 T1 · schema 预留 tokensSoFar |
| D-2 | 事件命名面 | 新 kind `generation_*` 三类 vs 复用宽松 `progress` kind 加严格子 payload | 双审裁（新 kind 需前端 `business-events.ts` 白名单双端同刀注册） |
| R-A/B | 思考过程展示 | R-A 折叠区流式展示 reasoning 原文（仅 SSE 传输态 · **Ban 落盘**）vs R-B 仅进度计数不传输原文 | 缺省 R-B（隐私缺省）· R-A 待产品显式裁示 |
| UX-A/B | 阶段2 渲染形态 | 打字机逐字 vs 按段即显 | UX-A + 终态权威覆盖（归产品裁示） |

## Evidence（cite only · 行号 @`0fe96fca` · Ban re-prove）

| Item | 锚 |
|------|----|
| invoke 调用面（非流式） | `apps/worker/src/interview-service.ts:200-204`（quiz）· `:231-248`（diagnosis）· `:132-135`→`:261-278`（evaluate）· **`:283-284`（report.narrative.v1）**；`adaptive-interview-service.ts:48`（planner）· `:143-154`（interviewer.ask） |
| invoke 单发契约 | `packages/ai-runtime/src/invoke.ts:403`（invoke）· `:635`（一次性 `plan.execute`）· `:707`（doubleValidate）· `:238-239`（35s/30s 超时缺省） |
| 传输非 stream | `packages/ai-runtime/src/model-client.ts:392`（chatUrl）· `:400-419`（dispatchOnce 一次性 JSON POST · `:412` json_object） |
| 供应商端点 | `packages/ai-runtime/src/dashscope-native-config.ts:125`（compatible-mode/v1）——stream 行为**未核实**（阶段2 前置门） |
| 流式纪律先例 | `packages/ai-runtime/src/voice-stream.ts`（fail-closed 缺省 + 双预览 flag + fake seam prove） |
| 事件写入/读取 | `packages/db/src/interview-event.ts:17`（appendEvent）· worker 写面 `quiz-lifecycle.ts:37/:62-63` · `adaptive-lifecycle.ts:158/:295` · `report-worker.ts:46/:55` |
| SSE 面 | `apps/api/src/modules/interview/interview.controller.ts:250-286`（**:259** writeHead · `:276-283` 2s 轮询 tail · 槽位≤5 · 10min 帽）；读面 `interview.service.ts:946-950` |
| 前端消费 | `apps/web/lib/stream/interview-stream.ts:29/:49/:65`（Last-Event-ID 续推+水位去重）· `business-events.ts:20-57`（白名单 · 未知 kind 静默丢弃）· `interview-state.ts:128`（progress no-op）· `quiz-state.ts:45`（progress→generating） |
| SSE-PUSH 刀域（Ban 面） | backlog `gap-bug-backlog.md:74`（GAP-MOP-01 wakeup LISTEN/NOTIFY）· `:101`（BUG-NOTIFY-REC）· `harness/redis-streams-wakeup.prototype.md` · `harness/gap-mop-01-wakeup-notify-rec.md` |

## Products

| Role | Path |
|------|------|
| Harness | `ai-docs/delivery/harness/token-stream-design.md` |
| Slice | `ai-docs/delivery/token-stream-design.slice.md`（本文件） |
| Dual stub `mw-model-op` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-tokenstream-mw-model-op.md`（PENDING · 不代填 Verdict） |
| Dual stub `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-tokenstream-mw-e2e-ha.md`（PENDING · 不代填 Verdict） |

**REQUEST 立卷 commit = 上述恰 4 文件 docs-only**（零产品码 / migration / script · 零 SSOT 编辑 · backlog/checklist/matrix/queue 不在 diff）。

## Scope（设计面 · 全文见 harness）

- **阶段1（先行独立刀）**：生成进度事件——触发面 P0 = interviewer.ask / resume-quiz.generate / report.narrative（P1 evaluate 可选 · P2 后台面默认不接）；schema 三类（载荷红线：只含计数/时刻/段名/幂等键 · Ban 内容与思考原文）；写入通道两案（D-1）+ 节流两案（D-1b）；断线语义（案A 重放幂等覆盖+终态清除 / 案B 跳过不死等）；backpressure（节流上限 / 幂等覆盖写 / 既有 1MB 帽）；Prove 拟案 TS-P1..P5（fake seam · 零 live）。
- **阶段2（另刀）**：invoke 观察缝 stream:true（前置门=供应商 live 核实 · flag 门沿 voice-stream 形制 fail-closed）· 增量帧经阶段1 通道（**增量内容帧不落持久表**）· UX 两案 · reasoning 两案（R-A Ban 落盘）· 终态权威覆盖 + coalesce backpressure 三层。
- **阶段3（另刀）**：report.narrative 同构（queue 段覆盖 enqueue→claim 等待 · 倾向报告只到进度不到帧）。
- **接口契约（declare 不实现）**：SSE-PUSH 通道 at-most-once/允许丢/非权威 · 业务终态永不走该通道 · 载荷无原文。

## Prove plan（阶段1 落地后 · 本 REQUEST 零 prove）

具名断言面（预注册 · EXEC 定稿）：TS-P1 首 token 事件延迟 · TS-P2 节流正确性（长生成帧数 ≤ ceil(elapsed/2s)+1）· TS-P3 前端渲染断言（进度驱动 + 终态清除 + 丢帧不死胡同）· TS-P4 膨胀上界（案A）· TS-P5 载荷红线（schema+采样双保险）。全部隔离 fake 流式 seam（沿 voice-stream fake 先例）· 零模型外呼 · `actualSpendCny=null` · Ban retry-to-green。EXIT0 ≠ 阶段2 落地 ≠ 用户已见打字机。

## Ban

1. Ban 碰产品码（设计刀 · apps/packages/scripts 零字节）
2. Ban 思考原文落持久表（隐私缺省 · 解禁须产品裁示+双审+隐私 prove）
3. Ban 碰 worker wakeup / SSE 轮询重构线（SSE-PUSH 刀域 · 只声明接口契约）
4. Ban secrets / Ban live 调用（本刀零 live · 供应商核实属阶段2 前置门）
5. Ban 改共享 SSOT / Ban covered flip（coveredCount=8）
6. Ban 预claim（EXIT/落地效果/供应商行为）/ Ban retry-to-green / Ban fake green
7. Ban self-approve / alone ≠ dual / Ban self-nail / Ban force-push / Ban push 主线
8. Ban 绕过 invoke 关口（durable claim/计费/双校验链不可旁路）
9. Ban 进度/增量帧承载权威语义（终态永远=既有业务事件 · 缺帧不 degraded 不死胡同）
10. Ban 阶段2/3 就地开工（均须另刀授权）
