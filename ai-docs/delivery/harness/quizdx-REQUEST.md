# QUIZDX REQUEST — quiz/diagnosis HTTP 级逐实体 SSE 流证明起草卷（`GAP-SSEPUSH-QUIZ-DX-HTTP` · 总盘 v4 唯一未认领 keyless 小刀 · P2 · QD1–QD4/DX1–DX4 八臂一 proof）（docs-only REQUEST 卷 · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草态 · 本卷 1 个新 .md · 零产品码零迁移零依赖 · pre-exec 双审 BOTH PASS + 协调方明示 EXEC 授权前不得落码 · alone≠dual · Ban self-approve · Ban 自翻 `GAP-SSEPUSH-QUIZ-DX-HTTP` 行 · ⛔push ⛔动主仓）。

**席位**：meetwise quiz/diagnosis SSE 起草席（docs-only 起草 · 协调方授权 · 新建 worktree `meetwise-quizdx` · 分支 `line/quizdx-draft`）。
**基线**：`origin/main` @ **`1ca3ce1d`**（full `1ca3ce1daa31903efc834de911f78752a8168e78` · 2026-10-30 16:46:36 +0800 · `git fetch origin` 本 turn 成功 · `git worktree add … origin/main` 新建 · 零独有 commit）· 起草前 `node scripts/ai-docs/check-docs.mjs` 亲跑 **EXIT=0 · scanned 2457**（cap `2_461` 余 4 · §2 cap 预算核）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/architecture/current-runtime-truth.md`（`:282` quiz:prove / `:283` diagnosis:prove 均只到「SSE 终态」层）→ `ai-docs/delivery/execution-master-checklist.md`（**`:1660` STILL OPEN 原文** · `:1659` SSE-PUSH Non-claims）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（`:116` UC-E2E-010 行 · `:176`  ledger · `:271` P1-1 · `:313` 证据表）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.1 `:47` NHP-010-FAULT-01 · `:50` NHP-010-ADV-02）→ `ai-docs/delivery/harness/uc-e2e-010-sse-resume.md`（五 case 先例 R1–R4 + R-mid · `:74`）→ `ai-docs/delivery/harness/xrep-REQUEST.md`（`§9-post` 跨副本已 CLOSED 界）→ `ai-docs/delivery/harness/sse-adv-REQUEST.md`（同主体双流隔离先例）→ 机制源 `apps/api/src/modules/quiz/quiz.controller.ts` / `diagnosis.controller.ts` / `interview.controller.ts` / `apps/api/src/platform/sse-pump.ts` / `sse-notify.service.ts` / `rate-limit.service.ts` / `last-event-id.ts` / `packages/db/src/interview/interview-event.ts` / `packages/db/sql/20_resume_quiz.sql` / `21_resume_diagnosis.sql` / `packages/db/migrations/0143_sse_push_notify.sql` / `0214_interview_event_statement_notify.sql` / `0062_interview_privacy_event_stream_scope.sql` → 证明先例 `apps/api/test/uc-e2e-010-sse-resume.proof.ts` · `uc-e2e-010-nhp-crossstream.proof.ts` · `sse-push-notify.proof.ts` · `uc-e2e-016-nhp-neg.proof.ts` · `uc-e2e-002-nhp-http-bound.proof.ts` · `validate.ts`（SSE 子集）· `e2e/helpers/sse.ts` → `scripts/run-e2e-isolated.mjs`（注册五位）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①`execution-master-checklist.md:1660` **`GAP-SSEPUSH-QUIZ-DX-HTTP`（quiz/diagnosis 共 pump 共表码面单源+类型检查 · HTTP 级逐实体流证明未单列）**；②协调方派单令（总盘 v4 明示唯一未认领 keyless 小刀 · P2）；③同族 STILL OPEN 行 `GAP-SSEPUSH-FULL-E2E`（三流终态段未跑）与 `GAP-SSEPUSH-REG-WINDOW`（initial→waiter 注册 ~ms 窗）本卷零认领；④`GAP-SSEPUSH-CROSS-REPLICA` 已由 xrep 关（本卷零重叠·§0.3）。

---

## 认领核对 · 登记处 fresh 亲点（逐行对 `origin/main` @`1ca3ce1d` 亲读 · file:line 逐字）

| 登记处 | 对树行使证据（亲读逐字） | 判定 |
|---|---|---|
| checklist `:1660` 主登记 | 「**`GAP-SSEPUSH-QUIZ-DX-HTTP`**（quiz/diagnosis 共 pump 共表码面单源+类型检查 · HTTP 级逐实体流证明未单列）」·同行 `STILL OPEN（行登记 · 均不关闭）` | **开**（亲点维持） |
| checklist `:1659` Non-claims 界 | 「…SSE-PUSH 系…≠ 跨副本 SSE 槽/播（HC-GAP-008 未证）…≠ full e2e 三流绿（未跑）…≠ covered」 | 旁证一致（本卷零认领跨副本/full e2e） |
| coverage matrix `:116` | UC-E2E-010 行为 `partial/partial/partial/blind(case-only)` 四格——四格全为 interview 流证据（NHP-010-ADV-01/ADV-02 case 注记在内），**无 quiz/diagnosis 逐实体流格** | **缺口在格**（本卷只补证据·格值零翻） |
| coverage matrix `:176/:271/:313` | `:176` UC-E2E-010 证据行（`uc010:sse-resume:prove` + R1–R4/R-mid）；`:271` P1-1；`:313` 证据表 `13 PASS`——**全部 interview 流** | 旁证一致 |
| coverage matrix 简报指位 `:306?` | 本 tip `:306` = 证据表「eval harness cite」行（`known RED`），**非 UC-010 锚**；UC-010 真实锚=` :116/:176/:271/:313`。如实登记简报指位漂移（不改锚·只更指位） | 指位勘误 |
| case matrix §1.1 `:47` | NHP-010-FAULT-01「断 SSE→LED / R-mid｜续传成功；无双扣｜partial｜uc010:sse-resume:prove」 | 旁证一致（interview 流） |
| case matrix §1.1 `:50` | NHP-010-ADV-02「同主体双流游标交换…｜零跨流帧交付…｜blind→case-only｜uc010:nhp-crossstream:prove」 | 旁证一致（interview 双流） |
| current-runtime-truth `:282/:283` | `quiz:prove` 22/22、`diagnosis:prove` 35/35 的措辞均只到「SSE 终态」层（终态事件/状态不倒退/RLS），**无 HTTP 级逐实体帧交付证明** | 旁证一致 |

**定性**：机制面已全在树（§0.2 逐处亲点）；所缺=**HTTP 级逐实体流证据形**（quiz 流/诊断流各自的 seq/事件形/续传/终态收口/跨流 key 域隔离）。本刀=证明缺口非机制缺口；若 EXEC 期证机制与 §0.2 不符 → 停止条件「机制不满足」如实升级（产品缺陷 EXIT1 诚实保留 + backlog 登记）。

---

## §0 现状锚（起草席亲读 · file:line + blob 逐条 `git rev-parse HEAD:<path>` 亲算 @`1ca3ce1d` · **EXEC 立项照本节对届时 tip 再重 pin**——漂移如实改锚 · 结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **18 树**实测——`line/quizdx-draft` 恰 1 命中=本席（`meetwise-quizdx`）；`ls ai-docs/delivery/harness | grep quizdx` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞交叠复核（EXEC 立项日必做）**：起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=隔离 proof 新文件 1 + root/`apps/api` 两 `package.json` 注册行 + `scripts/run-e2e-isolated.mjs` 注册位三 + tracked 收据。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核；任一分支顶对任一触面存在 `1ca3ce1d` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算 · 8 hex）

| 文件 | blob | 关键行锚（亲读） |
|---|---|---|
| `apps/api/src/modules/quiz/quiz.controller.ts` | `9b78100d` | `:6` `import { pumpSseEvents }`；`:12` `@Controller('quiz')`；**`:53-71` `@Get(':id/events')` events**（`:56` `slotKey=\`sse:${req.principal}\``；`:57` `acquireSlot(slotKey,5)` 败→429 `too_many_streams` 非 SSE；`:59` `quizzes.events(...)`；`:60` null→404 `not_found_or_forbidden`；**`:61` 终态集合 `quiz_ready｜quiz_unavailable｜error`**；`:62-69` pump；**`:65` `streamKey:id`**；`:67` `fetchMore(lastSeq)` 重调 events；`:70` finally `releaseSlot`） |
| `apps/api/src/modules/diagnosis/diagnosis.controller.ts` | `f2d7ea90` | `:6` 同 import；`:12` `@Controller('diagnosis')`；**`:51-69` `@Get(':id/events')`**（`:54` 同槽键；`:55` cap 5→429；`:57` `diagnoses.events`；`:58` null→404；**`:59` 终态集合 `diagnosis_ready｜diagnosis_unavailable｜error`**；`:60-67` pump；`:63` `streamKey:id`；`:65` `fetchMore`；`:68` finally release） |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae` | **`:257-279` 同形 events（五 case 先例宿主）**：`:261` 槽键；`:262` cap 5→429；`:264` initial；`:265` 404；**`:267` 终态集合 `report_ready｜report_unavailable｜assessment_unavailable｜interview_unavailable｜error`（五 kind·含 session_concluded 明确不在终态）**；`:268-277` pump；`:272` `streamKey:id`；`:273` `fetchMore`；**`:275-276` `deltaSource` 仅 interview 接线 `subscribeToken(id)`**（quiz/diagnosis 零触=裁决⑤） |
| `apps/api/src/platform/sse-pump.ts` | `b93121dc` | `:5-9` 三控制器零复制粘贴单源声明；`:70-71` `HEALTHY_FALLBACK_MS=30_000` / `DEGRADED_POLL_MS=2_000`；`:83` `pumpSseEvents`；`:87` hijack；`:88` `writeHead(200,text/event-stream)`；**:130 权威帧 `id: ${seq}` + `event: ${kind}` + `data: JSON`**；`:135` 10min deadline；`:169` 先注册 waiter 再 catch-up（D5）；`:173-209` hold 循环（`:174-176` 健康 30s / 退化 2s；`:191` 每轮重注册；`:205` null 收尾；`:207-208` tail emit / `: ping`）；`:213` unregister；`:222` `raw.end()` 单点 |
| `apps/api/src/platform/sse-notify.service.ts` | `a20b0720` | `:28` `SSE_NOTIFY_CHANNEL='interview_event_ch'`；`:197-209` `waitFor(streamKey)` per-key waiter 集；**`:309-319` `onNotification` 载荷=裸 stream_key → `router.get(key)` 同流全醒（回调内零 SQL）**；`:418-431` 降级结构化日志；**:433-483 `establish`（`:444` LISTEN 通道；`:461-469` establish 期恰一次 `pg_trigger` 实证 `interview_event_sse_notify` 在场；缺→`trigger_missing`）**；`:489-492` 进程单例 |
| `apps/api/src/platform/rate-limit.service.ts` | `fce544ff` | `:158-181` `acquireSlot(key,max)`（网关原子占·无 DbService 缝走进程内 Map）；`:184-199` `releaseSlot(key)` 对称减——三控制器共用 `sse:${principal}` cap=5 语义（本刀不重测·引旁证） |
| `apps/api/src/platform/last-event-id.ts` | `40b12d01` | `:7-18` `parseLastEventId` fail-closed（正则拒 Infinity/小数/科学计数·非法→HTTP 400 `invalid_last_event_id`） |
| `packages/db/migrations/0143_sse_push_notify.sql` | `4d4bf7c4` | `:4-6` 注释明示 **interview/quiz/diagnosis 共表共 channel，stream_key 即 SSE 流 id（案A 统一 channel·零实体分类）**；`:19-29` 逐行通知函数 + `:33-37` 逐行 AFTER INSERT 触发器（历史字节不改） |
| `packages/db/migrations/0214_interview_event_statement_notify.sql` | `d1f36f17` | **`:9-20` `sse_event_notify_after_insert()` 语句级 `pg_notify('interview_event_ch', stream_key)` FROM `SELECT DISTINCT stream_key FROM inserted`**；`:22-27` 同名触发器 `interview_event_sse_notify` 替换 0143 逐行形（健康检查按触发器名，两迁移同名声明） |
| `packages/db/migrations/0062_interview_privacy_event_stream_scope.sql` | `9e5dec05` | `:3-7` 注释明示 **interview_event 是 interview/quiz/diagnosis 三流共享运输**；`:11-51` `interview_event_stream_privacy_active(owner,stream)` 按聚合分流（先 interview 墓碑再 quiz 再 diagnosis）；`:59-62` `p_owner` 策略换为函数式 |
| `packages/db/sql/20_resume_quiz.sql` | `0ae44766` | `:6-18` `resume_quiz(id text PK, owner_user_id, status∈created/generating/ready/failed, questions, report, expires_at, version)`；`:42-53` owner RLS |
| `packages/db/sql/21_resume_diagnosis.sql` | `69f804d8` | `:7-18` `resume_diagnosis` 同形；`:42-53` owner RLS |
| `packages/db/src/interview/interview-event.ts` | `880a1dcb` | `:16-43` `appendEvent`（同 stream advisory 事务锁 + `MAX(seq)+1` 原子分配 + event_key 幂等） |
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2` | **`:130-139` `events()`：先 `parseLastEventId` → `asPrincipal` 内 `SELECT 1 FROM resume_quiz WHERE id=$1`（0 行→null=404）→ `SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq`**（复用 interview_event·stream_key=quizId） |
| `apps/api/src/modules/diagnosis/diagnosis.service.ts` | `2c7c882e` | **`:103-112` `events()` 同形**（先验 `resume_diagnosis` owner，再读 interview_event·stream_key=diagnosisId） |
| `apps/worker/src/quiz-lifecycle.ts` | `c4d568da` | `:43` `appendEvent(...,'progress',{stage:'generating'})`；`:73` 逐题 `question_ready`；`:74` 终态 `quiz_ready{count,report}` |
| `apps/worker/src/diagnosis-lifecycle.ts` | `af715482` | `:43` `progress`；`:76` 逐维 `section_ready{kind,title,score,findings}`；`:77` `rewrite_ready{before,after,refs}`；`:78` 终态 `diagnosis_ready{overall,summary,sectionCount,rewriteCount}` |
| `apps/worker/src/quiz-consumer.ts` | `3858b52a` | `:68` 失败终态 `quiz_unavailable{reason}`；`:95` `worker_died` 臂 |
| `apps/worker/src/diagnosis-consumer.ts` | `e588d72d` | `:66` 失败终态 `diagnosis_unavailable{reason}`；`:93` `worker_died` 臂 |
| `apps/web/lib/stream/quiz-state.ts` | `1aa2af90` | `:10-30` `QuizEvent` 判别联合（`progress` / `question_ready{question,refs}` / `quiz_ready{count,report}` / `quiz_unavailable{reason}` / `error` + TOKSTREAM 三 kind） |
| `apps/web/lib/stream/diagnosis-state.ts` | `5ed244fe` | `:12-26` `DiagnosisEvent` 判别联合（`progress` / `section_ready` / `rewrite_ready` / `diagnosis_ready{overall,summary,sectionCount,rewriteCount}` / `diagnosis_unavailable` / `error`） |
| `apps/api/test/_neg-harness.ts` | `9768b323` | `:50-90` `boot()`（`AUTH_DEV_HEADER=1` · 删 `MODEL_API_KEY`/`MODEL_BASE_URL` · `createApp` · 全量 sql/01-22 + 选迁移）；`:267-281` 种子（userA/userB + interview 族）；**`:72` 名单含 sql/20、21 但零 quiz/diagnosis 种子行 → 本 proof 自种** |
| `ai-docs/delivery/execution-master-checklist.md` | `2884be76` | `:1660` STILL OPEN 行（原文见 §认领核对）；`:1659` Non-claims |
| `ai-docs/delivery/harness/uc-e2e-010-sse-resume.md` | `200477a7` | `:31-37` R1–R4 + R-mid + R-authz + G-GAP 表；`:74` CMD |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `6706ad56` | `:116` UC-010 四格；`:176` 证据行；`:271` P1-1；`:313` 证据表 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `5dc8d97c` | §1.1 `:44/:47/:50`（010 三行） |
| `apps/api/test/uc-e2e-010-sse-resume.proof.ts` | `680fbd66` | `:185-227` R1–R4；`:232-272` R-mid live hold→LED；`:275-302` R-authz 404；`:305-316` G-GAP |
| `apps/api/test/uc-e2e-010-nhp-crossstream.proof.ts` | `0391ce5e` | `:141-300` B1–B4（同主体两 interview 流·0214 自装+6s 翻面先例） |
| `apps/api/test/sse-cross-replica.proof.ts` | `38f67e16` | `:527-536` 仅以 quiz 流作 XR-4 槽 hold/catch-up 载体（**非逐实体帧交付断言**） |
| `apps/api/test/sse-principal-slot.proof.ts` | `692c4d01` | `:141-185` quiz/diagnosis 路径仅作槽计数 5+1/429 载体 |
| `apps/api/test/uc-e2e-002-nhp-http-bound.proof.ts` | `440c71c6` | `:94-95` `QZ()/DG()` 路径常量（槽计数臂） |
| `apps/api/test/uc-e2e-016-nhp-neg.proof.ts` | `7f094eac` | `:366-372` N8 跨用户 quiz/diagnosis events → 404（拒绝面） |
| `apps/api/test/validate.ts` | `7494a56b` | `:849-861` quiz catch-up SQL 探针 + quiz/diagnosis 非法游标 400（仅 SQL 计数/游标面·零帧断言） |
| `e2e/full.e2e.ts` | `5aaa9097` | `:267-277` quiz/diagnosis 终态经 `pollTerminal` **GET 详情**（非 SSE events） |
| `scripts/run-e2e-isolated.mjs` | `dff85f04` | `:93` `isolatedReceiptSources`；`:2831-3011` 支持目标准入数组；`:3353` `isolatedCommand` 链；`:4308-4314` resource-caps；`:4338-4392` pre-migrate 名单 |
| root `package.json` | `748fc360` | `:221-222` crossstream 两行；`:253-258` `uc010:sse-resume` / `sse-push:notify` / `sse:xrep` 六行注册位 |
| `apps/api/package.json` | `388a95fa` | `:35` `prove:uc010-sse-resume`；`:73-74` crossstream 注册位 |
| `scripts/ai-docs/public-text-policy.mjs` | `05083d8a` | `:276` `MAX_FILES = 2_461`（cap 亲证） |

### 0.2 产品面侦察（两流现形 · 逐处亲点 · 结论=两流均有真 HTTP 级 SSE 端点 → 停止条件「无端点红停」**未命中**）

**A · quiz 流端点（`quiz.controller.ts:53-71`）**：`GET /quiz/:id/events`（`@Controller('quiz')` `:12` + `@Get(':id/events')` `:53`）。领槽先于取数：`slotKey=\`sse:${req.principal}\`` `:56`、`acquireSlot(slotKey,5)` `:57` 败→429 `too_many_streams`（JSON 非 SSE envelope）；取数 `quizzes.events(principal,id,lastEventId)` `:59`，null→404 `not_found_or_forbidden` `:60`；终态集合 `quiz_ready｜quiz_unavailable｜error` `:61`（原值参数化零合并）；泵参 `streamKey:id` `:65`、`fetchMore:(lastSeq)=>quizzes.events(principal,id,String(lastSeq))` `:67`；`finally releaseSlot` `:70`。流内容=interview_event 行，`stream_key=quizId`（service `:131-139`）。

**B · diagnosis 流端点（`diagnosis.controller.ts:51-69`）**：`GET /diagnosis/:id/events`（`:12` + `:51`）。同槽键 `:54`、cap 5→429 `:55`、`diagnoses.events` `:57`、null→404 `:58`、终态集合 `diagnosis_ready｜diagnosis_unavailable｜error` `:59`、`streamKey:id` `:63`、`fetchMore` `:65`、`finally release` `:68`。流内容=interview_event 行，`stream_key=diagnosisId`（service `:104-112`）。

**C · interview 流先例（`interview.controller.ts:257-279`）**：同一 `events` 形态与同一 pump；差异仅三处——终态集合五 kind `:267`、`deltaSource` 仅 interview 接线 `:275-276`、privacy guard 在 service（quiz/diagnosis service 无 privacy 函数调用，只有聚合 owner 存在性检查）。uc010 五 case（R1 全量 catch-up / R2 断线窗续写后 LED 续传 / R3 中位游标 / R4 已追上空 catch-up+ping / R-mid live hold→live-tail→abort→LED）为逐臂形先例；本卷只把同形落到 quiz/diagnosis 两个**实体流**上（非重复 interview）。

**D · 共享 pump 单源（`sse-pump.ts:83-223`）**：三控制器同一 `pumpSseEvents`（`:5-9` 声明三控制器零复制粘贴）。泵内单点：hijack/writeHead `:87-88`、权威帧 `id: seq`+`event: kind`+`data: JSON` `:130`、10min deadline `:135`、**每轮先注册 waiter 再取数（D5）`:169`**、健康 30s 兜底/退化 2s 轮询 `:174-176`、每轮重注册 `:191`、`more===null` 正常收尾 `:205`、空 tail 心跳 `:208`、registry 注销 `:213`、`raw.end()` 单点 `:222`。终态集合由控制器注入（`:54-55`），三处不同零合并——本刀不改产品字节。

**E · 共享 notify 单源（`sse-notify.service.ts`）**：进程单例 `:489-492`；每进程恰一条专用 LISTEN（`max:1` 池）；`waitFor(streamKey)` per-key waiter `:197-209`；`onNotification` 收裸 stream_key 后 `router.get(key)` 同流全醒 `:309-319`；`establish` 于连接建立期恰一次 `pg_trigger` 实证 `interview_event_sse_notify` 在场 `:461-469`（缺→`trigger_missing` 降级 2s 轮询）。**迁移实况**：0143 逐行触发器（`:24-38`）已被 0214 语句级同名触发器替换（0214 `:22-27`；0143 字节不改·仅历史）；健康检查按触发器名，因此两版本同名声明；**0214 广播面覆盖全部 stream_key（interview/quiz/diagnosis 同表）**，quiz/diagnosis 流无需任何额外通道/分类。

**F · service 层共表（`quiz.service.ts:130-139` / `diagnosis.service.ts:103-112`）**：两 service 均「先 `parseLastEventId` fail-closed（`last-event-id.ts:7-18`）→ `asPrincipal` 内验聚合归属（0 行→null→404）→ 单一谓词 `stream_key=$1 AND seq>$2 ORDER BY seq` 读 `interview_event`」。**流隔离全托 `stream_key` 单谓词**（无第二判别面）；跨 owner 由聚合归属检查 + RLS 双落。

**G · 生产者（事件形权威源）**：quiz 成功链 `progress`(`quiz-lifecycle:43`) → `question_ready`×N(`:73`) → `quiz_ready`(`:74`)；失败链 `quiz_unavailable{reason}`(`quiz-consumer:68/:95`)。diagnosis 成功链 `progress`(`diagnosis-lifecycle:43`) → `section_ready`×N(`:76`) → `rewrite_ready`×N(`:77`) → `diagnosis_ready`(`:78`)；失败链 `diagnosis_unavailable`(`diagnosis-consumer:66/:93`)。前端判别联合 `quiz-state.ts:10-31` / `diagnosis-state.ts:12-27` 与之一一对应（SSE `event` 字段=kind、`id`=seq）。

**H · 逐实体/跨流判定面**：两流 `streamKey=路由 :id`（quizId / diagnosisId）；聚合 id 域互异（`qz*` / 诊断实体 id）；interview 流 id 亦互异。**跨流隔离的判别面=`stream_key` 单谓词 + notify per-key router + pump per-streamKey waiter/registry**——与 uc010 crossstream 的「同聚合双 interview 流」不同面（本刀是**跨聚合 key 域**）。

### 0.3 零重叠核（本刀只补 quiz/diagnosis 两流·逐条划界）

| 既有证据 | 已证面 | 本刀零重叠处理 |
|---|---|---|
| `pnpm sse:xrep:prove`（`GAP-SSEPUSH-CROSS-REPLICA` **CLOSED** · xrep §9-post） | 两 OS 进程跨副本槽/播·interview 流交付+quiz 流仅作 XR-4 槽 hold 载体（`sse-cross-replica.proof.ts:527-536`） | **零重复**：本刀单进程、不证跨副本、不证槽总数；quiz 流在本刀证的是**逐实体帧交付/续传/终态**（xrep 未断言） |
| `pnpm uc010:sse-resume:prove` | interview 流 R1–R4 + R-mid + R-authz（`uc-e2e-010-sse-resume.proof.ts:185-302`） | **零重复**：本刀仅 quiz/diagnosis 两实体流，不重跑 interview 五 case |
| `pnpm uc010:nhp-crossstream:prove` | 同主体两 **interview** 流（S1/S2）游标交换/双持注入/账本零写副作用 | **零重复**：本刀跨 **quiz↔diagnosis↔interview 三聚合 key 域**，且断言帧交付而非对抗游标交换；不冒充 crossstream |
| `pnpm uc002:nhp-http-bound:prove` / `pnpm sse-slot:prove` | `sse:${principal}` cap=5、第 6 条 429、释放可再占（quiz/diagnosis 路径仅作槽计数载体） | **零重复**：本刀不证槽（只沿用既有槽语义；429 面引旁证不重测） |
| `uc-e2e-016-nhp-neg.proof.ts:366-372` | 跨用户 quiz/diagnosis events → 404（拒绝面） | **零重复**：本刀 404 只作每流隔离臂的**副断言**（同主体跨流正臂之外的对照），不单列 404 臂 |
| `api:validate` SSE 子集（`validate.ts:849-861`） | quiz catch-up SQL 命中计数 + quiz/diagnosis 非法游标 400 | **零重复**：本刀不验游标解析（引 `last-event-id:unit:prove` 旁证）、不以 SQL 计数冒充帧交付 |
| `full.e2e.ts:267-277` | quiz/diagnosis 终态经 `pollTerminal` **GET 详情**轮询 | **零重复**：本刀走 SSE events 真 HTTP 流（非 GET 轮询）；Ban 互洗 |
| `sse-push:notify:prove` / `sse-delta-arm.proof.ts` | pump 单元面（fake raw/notify）·token delta 臂 | **零重复**：本刀真 Nest HTTP + 隔离 PG + 真控制器；不注入 fake sink |

### 0.4 认领登记处行登记（行号+行名+现值·亲读逐字）

| 行号 | 行名 | 现值（亲读） | 本刀补 |
|---|---|---|---|
| checklist `:1660` | `GAP-SSEPUSH-QUIZ-DX-HTTP` | STILL OPEN（quiz/diagnosis 共 pump 共表码面单源+类型检查 · HTTP 级逐实体流证明未单列） | 收据供评估·**行翻面权归协调方**（本卷 Ban 自翻） |
| coverage matrix `:116` | UC-E2E-010 四格 | `partial/partial/partial/blind(case-only)`（全 interview 流） | 收据 additive 注记候选·**格值一字不动** |
| case matrix §1.1（010 组 `:47/:50` 之后） | — | 无 quiz/diagnosis HTTP 逐实体流行 | **EXEC 拟新增 `NHP-010-QZDX-01`**（列=FAULT·面=api·旗=case-only·锚=`pnpm quizdx:sse-http:prove`）·插入权/落位以协调方并线席为准 |
| current-runtime-truth `:282/:283` | quiz:prove / diagnosis:prove | 仅「SSE 终态」层措辞 | 零触（不加注·不翻） |

---

## §1 修法（恰 1 具名 proof=`quizdx:sse-http` · QD1–QD4/DX1–DX4 八臂一 proof · 零产品码零迁移零 Key · prove-only）

**修法形状**：新 proof `apps/api/test/quizdx-sse-http.proof.ts`——`boot()` 起真 Nest 栈（隔离 PG + 真 HTTP + `AUTH_DEV_HEADER`），自种 quiz/diagnosis 聚合行与 `interview_event` 账本行（**不经 worker 零模型**），用真 `fetch` 打 `GET /quiz/:id/events` 与 `GET /diagnosis/:id/events`，按 SSE 帧逐条断言。**八臂**：quiz 四臂 QD1–QD4，diagnosis 四臂 DX1–DX4。**零 `apps/*/src` / `packages/*/src` / migrations diff 意向**；隔离真 PG·零 `MODEL_API_KEY`·零外呼·零 worker drain（job 滞队不跑）。

**夹具合同（EXEC 落码顺序钉死）**：
- `boot()` 后：`userA` 持 QZ/DX 夹具、`userB` 零权限；**直插** `resume_quiz(id,owner_user_id,status)` 与 `resume_diagnosis(id,owner_user_id,status)`（owner=`userA`·status=`generating`/`ready` 语义无关，只作归属存在行）；`interview_event` 逐行 `(owner_user_id,stream_key,seq,kind,payload)` 种入（每臂独立 stream_key，臂间零共用；`DELETE … WHERE stream_key IN (...)` 先清后种保证可重复）。
- **0214 自装**：`readFileSync` 真迁移字节执行（沿 crossstream B3 先例·`uc-e2e-010-nhp-crossstream.proof.ts` 同形）；`pg_trigger` 实证 `interview_event_sse_notify` 在场；随后 **`sleep(6000)`** 等单例 `establish` 退避翻面（LISTEN+trigger 双条件健康）——仅 QD3/DX3 活体臂与 QD4/DX4 跨流臂需要；QD1/QD2/DX1/DX2 不依赖 notify（catch-up/LED 全走 `seq>lastSeq` 取数）。
- **hold 助手**：本地实现 `holdStream({kind,id,led,holdMs})`——`fetch` + `AbortController`，逐 chunk 累积 buffer，`parseFrames` 拆 `id/event/data`，`sawPing` 旁证；abort=断线（预期）。**断言面**：`status===200`、`content-type` 含 `text/event-stream`、帧 id 序列、逐帧 kind、**逐帧 `data` 与种子 `JSON.stringify` 逐字节相等**、终态后 reader 自然 `done`（非 abort）。
- **帧契约常量**（与产品同形·零新契约）：`id: <seq>\nevent: <kind>\ndata: <JSON>\n\n`（`sse-pump.ts:130`）；无 `id` 帧不存在于本刀两流（`token_delta` 仅 interview delta 臂·`sse-pump.ts:165` 注释）。

### QD1 · quiz 全量 catch-up 逐实体帧（R1 同形）
种 `QZ_CATCH`：`1 progress{stage:'generating'}` → `2 question_ready{question:'Q1',refs:['r1']}` → `3 question_ready{question:'Q2',refs:['r2']}` → `4 quiz_ready{count:2,report:{score:80,grounded:2,summary:'s'}}`。`GET /quiz/QZ_CATCH/events` 无 LED → **200 + text/event-stream**；帧 id 恰 `[1,2,3,4]`；kind/`data` 逐帧字节相等；**终态后流自然收尾（reader done·非 abort）**；零 `token_delta`。

### QD2 · quiz 断线窗续写 + Last-Event-ID 续传 + 终态收口（R2/R3 同形）
种 `QZ_LED`：`1 progress` `2 question_ready` `3 question_ready`。`GET LED=1`（hold 300ms 后 abort）→ 仅 `[2,3]`（无 1）；断线窗内 INSERT `4 question_ready` `5 question_ready`；`GET LED=3` → 仅 `[4,5]`（无 ≤3 重放）；再 INSERT `6 quiz_ready`；`GET LED=5` → 仅 `[6]` + **自然收尾**。副断言：`userB GET /quiz/QZ_LED/events → 404`。

### QD3 · quiz live hold → live-tail → 终态（R-mid 同形）
种 `QZ_LIVE`：`1 progress` `2 question_ready`（非终态）。hold `LED=2`（holdMs≈3600）；`sleep(700)` 后 **单语句 INSERT** `3 question_ready`（0214 语句级触发器恰一 notify(QZ_LIVE)）→ **live 帧 `3` 到达**；再 INSERT `4 quiz_ready` → **live 帧 `4` + 自然收尾**。断言：id 恰 `[3,4]`、无重放/无重复、`pg_trigger` 物证在证、全窗零 `token_delta`。（退化容差：若 30s 健康未翻面，2s 兜底轮询仍须在 hold 窗内交付——落码如实打印 `health` 读数，禁把超时改断言。）

### QD4 · quiz 跨流 key 域隔离 + 跨 owner 拒绝（key 域正臂）
三流双持：`QZ_ISO`（LED=max·非终态）、`DX_ISO`（LED=max·非终态）、`IV_ISO`（LED=max·非终态）；`sleep(700)` 后分语句 INSERT `QZ_ISO` 新行与 `DX_ISO` 新行（各单语句单 key），并配 **`QZ_ISO` 本流帧非空窗对照**（线活非空窗）。断言：QZ 线帧集=本流自身注入且**零 DX/IV 域字节**（kind 前缀/`marker`/流标签值域互斥）；DX 线对称；IV 线零 QZ/DX 域字节。`userB` 对 `QZ_ISO`/`DX_ISO` 各 → 404。可选副断言：对本流 key 发 `pg_notify('interview_token_ch',…)` 后 **QZ/DX 线 `token_delta` 零出现**（两控制器零 `deltaSource` 接线·`sse-pump.ts:62-67`/`interview.controller.ts:275-276`）——与 crossstream B3（interview 双流互偷）正交，只证「无订阅」不冒充其面。

### DX1 · diagnosis 全量 catch-up 逐实体帧（R1 同形）
种 `DX_CATCH`：`1 progress` → `2 section_ready{kind:'structure',title:'结构',score:70,findings:[…]}` → `3 section_ready{…}` → `4 rewrite_ready{before:'b',after:'a',refs:['r']}` → `5 diagnosis_ready{overall:78,summary:'s',sectionCount:2,rewriteCount:1}`。`GET /diagnosis/DX_CATCH/events` → 帧 id 恰 `[1..5]`；kind/`data` 逐帧字节相等；终态后自然收尾；零 `token_delta`。

### DX2 · diagnosis 断线窗续写 + LED 续传 + 终态收口
种 `DX_LED`：`1 progress` `2 section_ready`；`GET LED=1`（abort）→ `[2]`；INSERT `3 section_ready` `4 rewrite_ready`；`GET LED=2` → `[3,4]`；INSERT `5 diagnosis_ready`；`GET LED=4` → `[5]` + 自然收尾。副断言：`userB → 404`。

### DX3 · diagnosis live hold → live-tail → 终态
种 `DX_LIVE`：`1 progress` `2 section_ready`；hold `LED=2`；INSERT `3 section_ready` → live 帧 `3`；INSERT `4 diagnosis_ready` → live 帧 `4` + 自然收尾；id 恰 `[3,4]`；`pg_trigger` 物证；零 `token_delta`。

### DX4 · diagnosis 跨流 key 域隔离 + 跨 owner 拒绝（对称正臂）
镜像 QD4（DX 线为主体）：DX 线帧集=本流自身注入且零 QZ/IV 域字节；QZ/IV 线对称零 DX 域字节；`userB` 对 `DX_ISO`/`QZ_ISO` → 404；可选 token 无订阅副断言对称。

**注册面（EXEC 期·五处 + 两 N/A 承登）**：①新 proof 文件；②root `package.json` 两行（`quizdx:sse-http:prove` → `node scripts/run-e2e-isolated.mjs quizdx:sse-http:prove:raw`；`:raw` → `pnpm -C apps/api prove:quizdx-sse-http`）；③`apps/api/package.json` 一行（`prove:quizdx-sse-http`）；④runner `isolatedReceiptSources`（`:93` 区：proof + `_neg-harness.ts` + 两 controller/two service + `sse-pump.ts` + `sse-notify.service.ts` + `rate-limit.service.ts` + `last-event-id.ts` + `packages/db/src/interview/interview-event.ts` + `packages/db/sql/01_schema.sql`/`20_resume_quiz.sql`/`21_resume_diagnosis.sql` + `packages/db/migrations/0214_interview_event_statement_notify.sql`）；⑤runner 支持目标准入数组（`:2831-3011` 区）与 `isolatedCommand` 链（`:3353` 区）；⑥tracked 收据 `ai-docs/delivery/receipts/quizdx-sse-http/`（`.log` 面·`∉TEXT_EXTENSIONS`）。**N/A 承登**：pre-migrate 名单（`:4338-4392`）**不入**——boot() virgin 世界（uc010 家族 / xrep 先例同形：pre-migrate 先行装迁移链会撞 0058 definer 面；本 proof 零 0058 依赖，但世界选择沿 uc010 家族）；resource-caps（`:4308-4314`）**不适用**（非 PERF/LOAD）。**断言预算**：八臂 ≥40 条（QD1 5 / QD2 7 / QD3 6 / QD4 8 / DX1 5 / DX2 7 / DX3 6 / DX4 8；EXEC 实跑原值入收据）。

### §1.3 否决表（落选项诚实留痕）

- **否决①：复用 uc010 proof 参数化到 quiz/diagnosis**——终态集合不同（三 kind vs 五 kind）、interview service 有 privacy guard 而 quiz/diagnosis 无、delta 臂仅 interview；参数化会把「逐实体」揉成「一个泛化流」，违反 `GAP-SSEPUSH-QUIZ-DX-HTTP` 的「单列」要求。
- **否决②：直驱 `pumpSseEvents` 单元面**——`sse-push-notify.proof.ts`/`sse-delta-arm.proof.ts` 已证 pump 单元面；缺口是 **HTTP 级**（真控制器+真槽+真路由+真 SSE 头），单元面不能冒充。
- **否决③：把 quiz/diagnosis 并入 crossstream proof**——crossstream 是「同主体两 interview 流对抗游标交换」，格旗/case 行/世界均为独立；并入会破坏一 case 一收据并模糊交叉面，且触发其既有断言面改动（Ban）。

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门本 commit 适用 + EXEC 预基面届时重 pin）

1. **起草门（本 commit 已亲跑·EXIT 原值见 §9 收据表）**：`node scripts/ai-docs/check-docs.mjs` → **0**（scanned 2458 · cap 2_461 余 3）；`pnpm public-text-policy:prove` → **0**（12/12）；markers 五类标记词 + 行首冲突标记改动集 grep → **0 命中**（词面运行时组装·不改写卷内防自指）。
2. **EXEC 主门**：`pnpm quizdx:sse-http:prove` **EXIT=0**（八臂 ≥40 断言；隔离 PG 真 HTTP；attempts 台账如实·零 retry-to-green）。**EXIT0 = case 证据 ≠ covered ≠ 翻行**。
3. **EXEC 静态门**：`pnpm -C apps/api typecheck` 0；新 proof eslint 0 warning（lint 帽零新增）；`pnpm quizdx:sse-http:prove:raw` 经 runner 三层壳（isolated → raw → package）EXIT=0。
4. **邻面不回退（引旁证·不重测槽/游标）**：`pnpm uc010:sse-resume:prove`、`pnpm sse-push:notify:prove`、`pnpm sse:xrep:prove`、`pnpm sse-slot:prove` 各 EXIT=0（若 EXEC 期环境允许；如实登记未跑即未跑）。
5. **cap 预算核**：起草基线 **2457** + 本卷 **+1 = 2458**；EXEC **+1 proof = 2459** ≤ `MAX_FILES=2_461`（余 **2**）；收据 `.log` 非受管扩展名不计；**零 cap 步进**、零四联动点改。若 EXEC 期实测越限 → 停止条件「验收红不可修」停手上报（Ban 就地改 cap）。
6. **门面纪律**：`docs:check` > cap、PTP 红、markers 命中、lint 超帽、邻套件新红且根因不在本刀 → 停（§8）。

---

## §3 范围外（越界即 FAIL）

- 不跑/不声称 `full.e2e`、`e2e:isolated` 三流终态段（`GAP-SSEPUSH-FULL-E2E` 保持 OPEN）。
- 不证 `GAP-SSEPUSH-REG-WINDOW`（initial 取数→waiter 注册 ~ms 窗·兜底收 ≤30s 非丢失）。
- 不证跨副本（xrep 已 CLOSED·本刀单进程）。
- 不证槽容量/释放（`sse-slot:prove`/uc002 既有面）。
- 不证 30s 生产兜底原值（`GAP-SSEPUSH-PROD-30S` 保持 OPEN）；活体臂只证 hold 窗内交付，不把读数冒充 30s 生产证据。
- 不证 privacy fence 0062 真迁移面（harness 未载 0062·本刀走 boot 世界，跨 owner 404 只由聚合归属 + harness owner RLS 承担；Ban 借本收据宣 0062/隐私围栏 covered）。
- 不改产品码/迁移/共享 SSOT/coveredCount；不翻 checklist `:1660` 行、不翻 coverage matrix 格、不翻 case 行旗（EXEC 只加 additive case 行候选，落位/翻面权归协调方）。
- 不证模型输出质量/worker 编排（本刀零 worker 零模型）。

---

## §4 依赖

- 隔离 PG：`scripts/run-e2e-isolated.mjs`（Docker disposable PG）+ `_neg-harness.ts` boot 世界（sql/01-22 + 选迁移；**零 0214/0062 装载** → proof 自装 0214）。
- 真 HTTP：`createApp()`（`apps/api/src/main.ts`）+ `AUTH_DEV_HEADER=1`（harness `:51-57`）。
- 零外部依赖、零新 npm 包、零 Key、零 secret。

---

## §5 Ban 列表 + pins

- **Ban**：碰 `apps/*/src`/`packages/*/src`/migrations（产品字节）；改既有 proof/仪器；改 `sse-pump.ts`/`sse-notify.service.ts`/控制器；新增迁移/通道/表；翻 covered/格值/行旗；自翻 `GAP-SSEPUSH-QUIZ-DX-HTTP`；把 EXIT0 写 covered/full e2e/HA/容量/SLO；retry-to-green；断言迁就；自审 self-approve；push/force-push/动主仓；live 模型；secrets/.env；借本收据与 xrep/crossstream/uc010/uc002 互洗。
- **Pins（十值照抄·零翻转）**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained` · 公开 `DELETE=503` · `g7SuiteGreen=false` · `actualSpendCny=null`. Do not write covered.

---

## §6 est live=0（起草 turn · EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗。EXEC 期：隔离 PG + 同机真 HTTP + boot() 删 `MODEL_API_KEY`/`MODEL_BASE_URL`（`_neg-harness.ts:61-62`）+ 零 worker/drain + 零外呼 → est live=**0**。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md · 起草 turn）**五类标记词 + 行首冲突标记 grep 零命中**（起草席亲跑·词面按 `scripts/i6-239-gates.proof.mjs:154-163` 运行时组装口径·不复抄卷内防自匹配·回执随 EXEC 收据留痕）。EXEC 期改动集=proof+双 package.json+runner（可执行面）·同口径复跑。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual`**（三处钉=文首 Status/本节/卷尾同值）· alone≠dual · Dual PASS ≠ 开工（PASS 只过审；开工须协调方明示授权）。**开工三条款**：①pre-exec 双审两外席 BOTH PASS 落卷；②协调方明示 EXEC 授权；③EXEC 立项未改 §1 修法面/§5 Ban/pins/§1.3 否决 · 立项时照 §0 协议对届时 tip 全量重 pin。

- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（两控制器 events 形态变 · pump 帧形/终态注入变 · notify 通道或 0214 触发器更名 · 两 service events 谓词变 · runner 注册区被在飞刀改写）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §0.2/§1 期望不符（如 quiz 流出现 diagnosis 域帧=真泄漏 · 终态后流不自然收尾 · LED 重放 ≤N · 跨 owner 200）→ 根因诊断被证伪 → **产品真红** → 停·EXIT1 诚实保留 + backlog 登记如实升级协调方（Ban 就地改诊断/凑绿）。
- **越界需要**：修法诉求超出 §1 恰 1 proof 八臂面（需触产品码/迁移/0062 世界/既有 proof 家族/covered 翻面/共享 SSOT/cap 步进）→ 停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check>2_461 / PTP 红 / markers 命中 / 邻套件新红 / typecheck / lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。
- **红停特条（派单前置）**：若两流中任一**无 HTTP 级 SSE 端点** → 如实红停上报，**不得**降级为单元面/GET 轮询冒充。**本起草 turn 已亲点：两流均有真端点（§0.2-A/B）→ 特条未命中。**

## §9 状态

**`draft:awaiting_pre_exec_dual`** · 2026-10-30 起草落卷（基线 `origin/main` @`1ca3ce1d` · 分支 `line/quizdx-draft` · worktree `meetwise-quizdx` · 零独有 commit）· 本卷只新增 1 个 .md · 零产品码零迁移零依赖 · 零 push 零主仓。

**起草门亲跑收据（EXIT 原值 · 本 turn）**：

| 门 | 命令 | EXIT | 读数 |
|---|---|---|---|
| docs:check | `node scripts/ai-docs/check-docs.mjs` | **0** | `80 required files verified; public text policy scanned 2458 managed worktree files`（起草前 2457·本卷 +1） |
| PTP | `pnpm public-text-policy:prove` | **0** | `static_preflight_valid: selected=12/12; releaseEvidence=false` |
| markers | 五类标记词+行首冲突标记改动集 grep（词面运行时组装） | **0** | changeSet=本卷 1 件 · 零命中 |

**待办（EXEC 立项前）**：pre-exec 双审（两外席 BOTH PASS）→ 协调方 EXEC 授权 → 届时 tip 全量重 pin → 落 proof 八臂 + 五处注册 + 收据 → 主门 EXIT 原值入 §9-EXEC（占位：本节后续追加 · 本卷不改写）。
