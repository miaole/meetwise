# TOKSTREAM 阶段1 EXEC — 生成进度事件落地 + TS-P1..P5 prove 收据

**Status**: **阶段1 EXEC 完成（EXIT=0 双证明）** · **≠ 阶段2（完整流式 stream:true）· ≠ 阶段3（报告帧）· ≠ 用户已见打字机 · ≠ 阶段2/3 立项**
**Date**: 2026-10-07
**Knife**: TOKSTREAM 阶段1 EXEC · 设计刀 REQUEST **`a31a7bbe`**（harness `ai-docs/delivery/harness/token-stream-design.md` · slice `ai-docs/delivery/token-stream-design.slice.md`）
**授权链**: 设计刀 REQUEST（docs-only）→ **pre-exec 双审 BOTH PASS**（`mw-model-op` + `mw-e2e-ha` · **裁定经协调方带外转达入本 EXEC 指令** · `reviews/REQUEST-2026-10-07-tokenstream-*.md` 两 stub 仍为空审原文，**未代填 Verdict**——Ban self-approve）→ 协调方阶段1 EXEC 授权（本刀）。
**Pins（十值原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**

---

## 1. 裁定 → 落地表（七项全落）

| 裁定（协调方转达） | 落地证据（file:anchor） |
|---|---|
| **D-1=案A**（interview_event 节流持久写 · **≤6 行/生成常量断言** + **vacuum 策略登记**） | `apps/worker/src/generation-progress.ts`：`GENERATION_PROGRESS_MAX_ROWS = 6` 常量 + 写侧硬门（`tracker.rows >= MAX` 即停）+ prove 断言「TS-P4 generation_progress ≤ 6 常量上界」「家族总行 ≤ MAX+2」；vacuum 策略登记见 §4 |
| **D-1b=T1 纯 2s 时间窗** + schema 预留 `tokensSoFar`（阶段1 恒 undefined/终态回填位） | `GENERATION_PROGRESS_MIN_INTERVAL_MS = 2000`（时间窗唯一承重 · 不为切段加帧：`run.stage()` 只改段名进下一帧心跳）；`tokensSoFar` 在 schema/白名单/前端归约三层预留（生产心跳帧恒不写 · 阶段1 唯一写点=阶段2 观察 seam `noteModelFirstToken` 的 fake 调用与终态 usage 回填位） |
| **断线=重放**（幂等覆盖写按 attemptKey + 终态到达清除） | 前端归约承重：`apps/web/lib/stream/generation-progress.ts` `applyGenerationProgress`（同 attemptKey 数值字段取 max · 旧帧重复不回退）+ `interview-state.ts`/`quiz-state.ts`（**任何非 generation_* 业务事件到达即清** `generationProgress=undefined`）——TS-P3 b2/b4 断言 |
| **R-B 思考隐私缺省**（零 reasoning 字节落盘） | 写侧载荷键白名单 `PROGRESS_PAYLOAD_ALLOWED_KEYS`（`reasoning`/内容/prompt 键不在表内=写入即 throw）+ TS-P5（键白名单/无 answer 键/内容标记哨兵三断言）+ 前端文案只有段名/时长/token 计数（`generationProgressLabel`） |
| **D-2=新 `generation_*` kind** + 补入 e2e `FORBIDDEN_SCORE_KINDS` | 三 kind：`generation_started`/`model_first_token`/`generation_progress`；双端注册 `apps/web/lib/stream/business-events.ts` + `quiz-state.ts`（zod 判别联合）；`e2e/helpers/sse.ts` `FORBIDDEN_SCORE_KINDS` 补入三 kind（进度帧禁分 e2e 机检） |
| **三触发面包装层 onProgress 回调**（invoke 关口零改动） | ① `interviewer.ask`：`adaptive-interview-service.ts` `retrieveAndGenerate` 内 `withGenerationProgress`（segments `[retrieve,generate,validate]` · attempt≠0 重放与 grounded 模板早退不产进度）② `resume-quiz.generate`：`quizGenerator(..., progressStream?)`（`quiz-lifecycle.ts` 接线 quizId）③ `report.narrative.v1`：`reportGenerator(..., progressStream?)`（`main.ts` reportWorkerDeps 接线 interviewId）。**`packages/` 零字节改动**（`git diff --stat` 机检：14 文件全在 apps/web·apps/worker·e2e/helpers·package.json·scripts，invoke/model-client/db 零触碰） |
| **前端 loading→真实进度渲染**（interview-state progress no-op 接活） | `interview-state.ts` 原 `case 'progress': break` no-op 旁新增三 kind 归约挂 `generationProgress` 视图字段；`view-model.ts` `answered`（题间/报告期等待）与 `quiz-state.ts` `generating` 文案接 `generationProgressLabel`（有进度=「AI 生成中 · 段名 · 已 N 秒 · M tokens」· 无进度=既有文案缺帧兜底） |

## 2. Prove 结果（fake seam · 零 live · Ban retry-to-green）

| CMD | EXIT | 断言面 |
|---|---|---|
| `pnpm tokenstream:prove`（经 `scripts/run-e2e-isolated.mjs` 隔离 PG · 迁移 142 applied） | **0** | **20 PASS / 0 FAIL**：TS-P0 ×3（三触发面生成语义不受伤）· TS-P1 ×6（started 恰 1 行〔event_key 幂等〕/ first_token 记录 + **SSE 同形读路径可见时延实测 88ms ≤ 2500ms 界**/ ask 面 segments/ report 面接线）· **TS-P2 ×3（节流正确性：行数 ∈ [2, min(6, ceil(7s/2s)+1)] · 相邻帧 elapsedMs 差 ≥ 2s−ε · event_key 序号互异）** · TS-P4 ×5（**generation_progress ≤ 6 常量上界** · 家族总行 ≤ 8 · invoke claim=cached 重放秒回不添行 · `noteModelFirstToken` 重放同 attemptKey 仍 1 行）· TS-P5 ×3（载荷键 ⊆ 白名单 · 无顶层 answer 键 · 载荷不含内容标记哨兵） |
| `pnpm -C apps/web prove` | **0** | **190 PASS / 0 FAIL**（含 **TS-P3 ×11**：三类 kind 白名单解析进契约 · 进度帧不改 phase/lastScore · 重放旧帧不回退计数（取 max）· 新 attemptKey 替换 · 业务事件清除进度态 · 进度帧全丢不死胡同不 degraded · answered+进度态文案含真实进度 · 无进度回既有文案 · quiz started 置 generating/文案/清除三连） |

隔离收据：`.tmp/isolated-proof-receipts/2026-10-08T08-14-45-754Z-74140-9620db25-0030-4c16-b490-6215691790e0.json`（`release_evidence=false`）。
静态面：worker/web `tsc --noEmit` 触碰文件零错（在册他文件既有错未新增未触碰）· `pnpm e2e-static-guards:check` passed（runners=6 helpers=20 flags=9）。`pnpm docs:check` **预存红**（`public_text_policy:PTP_FILE_LIMIT`：全仓扫描集 3906 文件 > 2048 限——stash 本刀改动后复跑同红，非本刀引入，未触碰该共享设施）。
**零 live 证据**：隔离 runner 剥离 `DASHSCOPE_API_KEY`/`MODEL_API_KEY` 等全键族（`run-e2e-isolated.mjs:2005-2014`）+ 模型面全部 `scriptedModelClient` fake（唯一延迟/首 token 观察由 prove 受控注入）· `actualSpendCny=null`。

**首红根因披露（修于证明夹具，非 retry-to-green）**：首轮 EXIT=1 三红——①TS-P1 时延 4560ms=测量法错误（时钟自写提交起算、轮询却在生成结束后才启动，结构性 ≥4500ms）；改为**与生成并发**的首见轮询器（粒度 100ms）后实测 88ms。②TS-P0/P1 ask 面=prove 夹具缺 `interview` 行：invoke `privacyInterviewId` 围栏 `interview_privacy_active()` 要求 interview 行属 principal（生产恒真：threadId=已落库 interviewId；沿 `adaptive-lifecycle.proof.ts:29` 夹具惯例补行）。两者均为 prove 夹具缺陷，产品码零改动。

## 3. 事件 schema 与幂等键（落地面）

- `generation_started { jobKind: 'next_question'|'quiz'|'report', operationId, attemptKey, segments[], startedAt }` → event_key `generation:{attemptKey}:started`
- `model_first_token { attemptKey, firstTokenMs, tokensSoFar? }` → event_key `generation:{attemptKey}:first-token`（阶段2 观察 seam；阶段1 生产非流式无人调用）
- `generation_progress { attemptKey, stage, elapsedMs }` → event_key `generation:{attemptKey}:progress:{ordinal}`（ordinal=进程内节流序号，跨进程重放同 ordinal → `uq_interview_event_key` ON CONFLICT 不添行）
- 写失败 best-effort：结构化日志 `generation_progress_write_failed`（稳定标量无堆栈无 PII），绝不打断业务生成路径；settle 后 `finally` 只等在途那一笔（不晚于业务终态事件提交，防「终态后又冒进度」）。

## 4. Vacuum 策略登记（D-1 EXEC 面 · 登记·未实现）

- **写侧有界已机器钉死**：≤6 progress 行 + started/first_token 各 ≤1（event_key 幂等）= **家族 ≤8 行/attempt**；单面试流上界 ≈ 8 × absoluteMaxTurns（缺省 120）≈ ≤1k 行 + quiz/report 各 ≤8——有界非零。
- **保留补丁（登记 · 须另刀授权〔涉 DB 面 + ops 面，W2 DB 债波序列内〕· 未写一行）**：
  1. `ALTER TABLE interview_event ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();`（现表无时间列 · id bigserial 单调可作过渡代理）
  2. 部分索引：`CREATE INDEX ix_interview_event_progress_vacuum ON interview_event(created_at) WHERE kind IN ('generation_started','model_first_token','generation_progress');`
  3. 每日批量：`DELETE FROM interview_event WHERE ctid IN (SELECT ctid FROM interview_event WHERE kind IN (...) AND created_at < now()-interval '7 days' LIMIT 10000);`
- **边界红线**：只删 generation_* 三 kind，**永不删业务 kind**（question_ready/quiz_ready/report_ready/answer_evaluated/*_unavailable/error=唯一权威终态与重放面）；进度行被删后 Last-Event-ID 重放只是少帧——前端幂等覆盖+业务事件清除已由 TS-P3 证明缺帧不死胡同，语义安全。
- **归属与演进**：触发面归 ops cron/reaper 扩展（另刀）；**SSE-PUSH 落地后进度行迁出持久表（案B 演进）时本 vacuum 需求随之消失**——登记为过渡补丁，非永久设施。

## 5. Ban 合规（十条全生效自查）

1. 产品码改动=**EXEC 授权面内**（apps/worker·apps/web·e2e helper·scripts 接线）· `packages/`（invoke/model-client/db）**零字节** ✓ 2. 零 reasoning 字节落盘（键白名单+TS-P5）✓ 3. worker wakeup/SSE 轮询/controller 零触碰 ✓ 4. 零 secrets·零 live（键族剥离+scripted fake）✓ 5. 共享 SSOT（backlog/checklist/matrix/queue）零触碰·coveredCount=8 未动 ✓ 6. 不预claim（EXIT0≠阶段2≠用户已见打字机）·首红根因披露非 retry-to-green ✓ 7. 不代填双审 stub（裁定=协调方转达）·不 self-nail ✓ 8. 未绕过 invoke 关口（包装层在 invoke 之外）✓ 9. 进度帧非权威（不改 phase/不 degraded/缺帧兜底——TS-P3 机检）✓ 10. 阶段2/3 零开工（stream:true/增量帧/报告帧零触碰）✓

## Non-claims

Not 流式（invoke 仍非流式单发）· not 用户已见打字机（仅进度事件）· not tokensSoFar 生产计数（阶段1 恒 undefined · 计数源=阶段2 stream 观察）· not vacuum 已实现（登记 §4）· not SSE-PUSH touched · not reasoning 展示裁示（R-B 缺省）· not covered flip（coveredCount=8）· not `releaseEvidence=true` · not HA · not nail · not 阶段2/3 授权 · `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual（EXEC 后 post-prove 双审另卷）
