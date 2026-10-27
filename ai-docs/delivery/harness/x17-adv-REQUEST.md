# X17-ADV REQUEST — NHP-017-ADV-01 孤儿预占对账对抗边界起草卷·覆盖矩阵 §1.0.1 `:122` ADV 列（blind 残余·全行唯一残格·孤儿任务伪造/租约竞态对抗面）（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-27 起草落卷·docs-only·本卷不 claim 任何 covered 升格（EXIT0=case≠covered·coveredCount=8 零动·ADV blind 保持+case-only 措辞）· pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve·EXEC 落码/行使/翻面权归协调方随令·⛔动主仓 ⛔push ⛔force-push）。

**席位**：NHP-017-ADV-01 起草席（docs-only 起草·协调方派·总盘小刀 #4·与批 A/B/C 已并线卷、UC 专属线、在飞行行级互斥）。
**基线**：`origin/main` @ **`351501976`**（full `35150197631c172b2f5f9c3d0367f815c2eeda84` · `git fetch origin` 本 turn 成功 · 分支 `line/x17-adv-draft` 零独有 commit · worktree `meetwise-x17`）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2430**（= cap 2430 恰等零余量 · §2-1 预算核·步进已随本落卷行使）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 `:47` 强制列 / §1.0.1 `:122` / §1.0.3 `:166` 双表同步令 / §1.1 `:181-182` 分面 / P0-5 `:267`）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（`:67-:75` NHP-017 既有九行 / `:85` NHP-019-ADV-01 ADV 行先例）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-017 `:197-:216` · A1–A3 `:211` · TC-E2E-017-sweeper `:216`）→ 涉事机制源 `apps/api/src/modules/interview/interview.service.ts` / `interview/interview-report.ts` / `interview/interview.controller.ts` / `packages/db/src/commerce/commerce.ts` / `packages/db/src/report/report.ts` / `packages/db/src/interview/interview-jobs.ts` / `apps/worker/src/commerce-reconcile.ts` / `apps/worker/src/report-worker.ts` → 同 row 五 case 收据（零触只读）`apps/api/test/uc-e2e-017-orphan-http-sse.proof.ts`（NHP-017-HTTP-FAULT/HTTP-COMP/SSE-FAULT/HTTP-BOUND/HTTP-NEG · `:434` GAP-UC017-ADV 留痕行）+ harness `harness/uc-e2e-017-orphan-http-sse.md` → 分界旁证族（零触只读）`apps/api/test/neg-interview.proof.ts` / `uc-e2e-019-nhp-adv.proof.ts` / `uc-e2e-017-nhp-perf-api.proof.ts` / `uc-e2e-002-adv-led-crossuser.proof.ts` / `bill3-settlement.proof.ts`（worker test）→ ADV 壳先例 `apps/api/test/uc-e2e-016-nhp-adv.proof.ts` + `uc-e2e-015-nhp-adv.proof.ts`（三层隔离壳）。

---

## 认领核对 · fresh 行号亲点 + 在飞零重叠核（本卷核心盘点）

**已认领排除面（本 turn 亲读）**：批 A=`:114/:118/:128`；批 B=`:115-117`+§1.0.2 `:147-148`；批 C=UC-001/015/016/029 族（`:112/:120/:121`·#149 已 closed）；UC-002 `:113`（NHP-002-ADV-01 已落·case-matrix `:45`）；UC-011 `:117`；UC-014/026 `:119`；UC-017 **NEG/COMP/SSE-FAULT/BOUND 面=五 case 专属线**（`:122` 前三列 partial+case-matrix `:70-:74` 五 case 行·`uc017:orphan-http-sse` tip 在树亲证 `0fb8f654`·438 行五 case 壳）；UC-017 LOAD `:69`（Line Y nail）+PERF `:75`（三收据刀）；UC-018 `:123`；UC-019 `:124`（**含 ADV V1–V6 `:85` 已落**）；UC-025 `:125`；UC-028 `:127`；UC-031/032 `:129`（line/uc31-draft 在飞）；UC-033 `:130`（X33 #160 closed）；UC-040–043 `:131`/`:152` blocked；其余 `:132-:140`/`:153-:156` 出域（批 C 盘点沿袭）。

| 认领 cell（本刀） | 行号 | 现列值（亲读逐字） | 判定 |
|---|---|---|---|
| **矩阵 §1.0.1 UC-E2E-017 · ADV 列** | **`:122`** 第 4 列 | **`blind`**（裸值·零 case 注记——NEG/FAULT/BOUND 三 cell 各 partial·ADV cell 全行唯一 blind 残格） | **本刀唯一认领格**：具名 case `NHP-017-ADV-01` 隔离 prove 真证据登记（blind 保持+case-only 措辞·EXEC 补注） |
| case-matrix §1.2 | `:67-:75` 全块亲证 | **无 `NHP-017-ADV-01` 行**（`:67-:75` 九行=FAULT/BOUND/LOAD/HTTP-FAULT/HTTP-COMP/SSE-FAULT/HTTP-BOUND/HTTP-NEG/PERF-api·grep 亲证零 ADV 行） | 本卷 EXEC 补 §1.2 新行（`:75` 邻区·沿 `:85` NHP-019-ADV-01 行形） |
| `:122` NEG/FAULT/BOUND 三列+注记列+§1.1 `:182` 分面 | `:122`/`:182` | partial/partial/partial（sweeper）·注记列「HTTP/SSE 注入未进 isolated」（**其措辞更新权归协调方/UC-017 专属线后刀·本刀零触**）·分面 partial | **零触**（§1.3 逐项留痕） |

**五 case（`uc017:orphan-http-sse`）零重叠核（`0fb8f654` 438 行逐臂亲读 vs 本刀臂）**：HTTP-FAULT-01=begin→reserved→fixture 租约过期→`reconcileOwner` 回收（`:217-246`·回收**终态面**）· HTTP-COMP-01=begin→own abandon→200 released（`:248-271`·单次补偿嘴）· SSE-FAULT-01=abort 拆除零假释放+404 跨主体 events+429 槽满子臂（`:273-379`）· HTTP-BOUND-01=同 interview 重复 begin alreadyBegun 不双扣（`:381-403`·**同键同 units 重放形**）· HTTP-NEG-01=错主体 abandon/events 404+原预占不动（`:405-428`）——五 case 收据卷尾自钉 `:434`「**GAP-UC017-ADV: 对抗面零触（`:122` 行 ADV=blind 保持·归对抗族刀）**」。本刀臂与其**逐条 reason 级可分**（§1 臂面）：V1=**伪造预占同键不同 units**（BOUND 系同键同 units 短路·V1 正中 `idempotency_units_mismatch` 拒面）· V2/V3=**伪造/陈旧 start job 拒采纳**（五 case 零触 job 陈旧面）· V4=**abandon 先行→reconcile 零双释放**（FAULT-01 只 reconcile 不先 abandon·COMP-01 只 abandon 不后 reconcile·两嘴同臂串联竞态=五 case 空集）· V5=**reconcile 先行→abandon 幂等 noop**（反向序·同上空集）· V6=**回收壳 re-begin 复活拒**（FAULT-01 回收后止于 GET·零 re-begin 臂）。

**报告链对抗（协调方派单侦察面）零残余判定（如实入卷·不入臂）**：「重试风暴/状态机对抗」在报告链**已被覆盖殆尽**——429 `report_retry_limited` 连点风暴=**NHP-019-ADV-01 V4**（`5e73d5e0` · case-matrix `:85` · 同 `POST /interview/:id/report/retry` 口同 RL 闸）；ready/running 伪造状态 retry 404 `no_retriable_report`=**NHP-019-ADV-01 V3**+neg-interview `:397-398`；quarantined 重排出口=**NHP-019-ADV-01 V5**；跨主体 retry=**uc019 V2**+neg-interview `:403`；回收态报告读 200 `interview_failed`=**NHP-017-PERF-api-01**（`uc-e2e-017-nhp-perf-api.proof.ts:292`·同 row 既有 case）；export 未就绪 404 `report_not_ready`=neg-interview `:408`。**本刀零报告链风暴/白名单臂=对上述六旁证的 wash 规避兑现**（§1.3 否决表逐条）。同判「**跨主体孤儿操作**残余=0」：begin/turn/abandon/report/retry 跨主体 404 全被 neg-interview `:294-296/:343-352/:377-403`（111 断言回归面）+五 case NEG-01+uc002-adv V4/V5（SSE 面）覆盖——本刀零跨主体臂。**本刀认领残余=孤儿任务对抗面（伪造预占/伪造 job/租约竞态/回收壳复活）恰 V1–V6 六臂**。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`351501976`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **37 树**实测——`line/x17-adv-draft` 恰 1 命中=本席；`grep -rn "uc017:nhp-adv|x17-adv|NHP-017-ADV"` 落卷前**零命中** → 落卷后唯一同名卷/命令/case=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only .md 1+policy 两 script 数值联动）；EXEC 期触面=隔离 prove 新文件+注册行（root `package.json:131-132` 邻区双行/apps-api `package.json:55` 邻区单行）+runner 注册位（`scripts/run-e2e-isolated.mjs` 三位·字面锚 `:1653`/`:2682`/`:3203-3207`——五 case `uc017:orphan-http-sse:prove:raw` 三位在树亲点·EXEC 届时重 pin·批 A/批 C 四位教训承登：位4 pre-migrate 名单/位5 resource-caps 条件按届时 tip 亲证登记或如实申明不适用）+egress additive 登记+双表行内改（矩阵 `:122` ADV cell 邻区+case-matrix `:75` 邻区 §1.2 一新行）。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `351501976` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `54cede58`（522） | **§1.0.1 `:122`（UC-E2E-017 · ADV cell=`blind` 裸值=本卷认领格 · 全行唯一 blind 残格）**·`:47` §0.5 强制列 · `:166` §1.0.3 双表同步令 · `:181-182` §1.1 分面（零触） · `:267` P0-5（零触） |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `0c6e778d`（212） | **`:67-:75` NHP-017 九行（五 case+FAULT/BOUND/LOAD/PERF）·亲证零 ADV 行**·`:85` NHP-019-ADV-01（ADV 行形先例）· §1.2 头 `:53` |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | UC-017 `:197`（预占后会话/SSE 创建失败→孤儿对账）· A1–A3 `:211`（released/额度恢复/同键重试单行/sweeper 无残留）· TC-E2E-017-sweeper `:216` |
| `scripts/ai-docs/public-text-policy.mjs` | 落卷后亲算 | **`:232`→步进后 MAX_FILES = 2_438**（cap 亲证 · §2-1 预算核）· `:231` 下邻 X17-ADV 步进注记两行（栈顶=MAX_FILES 上邻·栈史零洗） |
| `scripts/ai-docs/public-text-policy.proof.mjs` | 落卷后亲算 | 越限臂四处联动 `:421`（`i < 2_438`）· `:428`（atCap.scannedFiles 2_438）· `:431`（`f-2438.md`）· `:434`（`FILE_LIMIT:2439` deepEqual）+CAP-SANCTION-2438 注记（`:419` 上邻置顶）· 本树亲跑 **12/12 EXIT=0**（2438/2439 双值全行使） |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918） | **`:36` REPORT_RETRY_RL（capacity 3·refill 3/3600）**· begin 守卫链 `:102-295`：`:106-107` missing/invalid resume-id 400 · `:121-122` advisory 锁 · `:123-124` ghost id 404 `not_found_or_forbidden` · **`:128-129` 终态拒 409 `interview_not_active`（V6 正中面）** · **`:184-189` 绑定冲突 409** · **`:190-195` pre-v64 父（resume_id 在+epoch NULL）→ 409 `legacy_resume_reference_unavailable`（V3 正中面·no-guess 规则注释 `:190-193`）** · `:196-216` 绑定 CAS · `:217-231` v64 幂等 alreadyBegun（BOUND 五 case 面·零触） · **`:232-234` 任意陈旧 start job（非 v64 匹配形）→ 409 `legacy_resume_reference_unavailable`（V2 正中面）** · **`:262-267` `idempotency_units_mismatch`→409（V1 正中面）** · `:270-273` 402/409 不足分码 · `:283-293` 入队背压 429 `interview_queue_saturated` · abandon `:643-667`（`:650` advisory 锁·`:658-659` 委托+alreadyAbandoned 映射=V5 期望面）· retryReport `:775-780`（零触·uc019 面） |
| `apps/api/src/modules/interview/interview-report.ts` | `ae928db6`（98） | `:15-32` reportView（`:23-28` 无行→事件映射 `interview_failed`/404 `not_found`——旁证面·本刀零臂=PERF `:292` 已行使）· `:35-44` retryReportById（零触·uc019 V3 面）· `:47-56` export（零触·neg-interview `:408` 面） |
| `packages/db/src/commerce/commerce.ts` | `20b7613e`（691） | **`:47-:116` reserveEntitlement 幂等闸：`:60-:63` ON CONFLICT 占坑 · `:67-:72` 同键不同 units→具名错 `idempotency_units_mismatch`（V1 机制源）** · **`:500-:546` abandonInterviewAndRelease：`:504` 委托 settleOrReleaseForTerminal · `:506-:525` error/not_found→空壳 abandoned（`:512` UPDATE）/already_abandoned noop（`:522`）/`interview_abandon_conflict` · `:531-:540` CAS `status IN ('created','waiting_user')`→abandoned · `:541-:542` already_abandoned noop（V5 期望面：回收后 abandon→released:'noop'+alreadyAbandoned）** · `:584-:591` sweepExpiredReservations（`:591` 谓词 `status='reserved' AND lease_expires_at < now()`=V4 零双释放机制源：released 行不入 swept·`:611` settle-or-release 二段谓词同形）· `:666-669` reconcile 委托 |
| `packages/db/src/report/report.ts` | `c6ccd01c`（127） | `:7` 状态枚举 queued/running/ready/failed/quarantined · `:27-:41` claimReport CAS+SKIP LOCKED（零触·uc019 面）· `:44-:60` markReportReady/Failed CAS lease_owner（零触）· `:66-:71` requeueFailedReport（零触）· `:79-:93` sweepReports（零触） |
| `packages/db/src/interview/interview-jobs.ts` | `7401cc04`（401） | `:25` MAX_INTERVIEW_PER_OWNER_QUEUED=3 · `:70-:91` 入队背压闸（零触·neg-interview `:614-:652` 已行使） |
| `apps/worker/src/commerce-reconcile.ts` | `73772ac2`（142） | **`:34-:107` reconcileOwner：`:46-:52` swept 逐笔+围栏布尔 SELECT · `:57-:68` B 端分支 · `:69-:91` C 端回收分支（`:75` abandonInterviewAndRelease 委托 · `:80-:82` soft-set 兜底 · `:86-:88` cancel/failQueued · `:89` interview_unavailable 事件 idempotencyKey=`:id:reclaim`）** · `:40-:45` 尸体复用/幂等守卫注释（V6 动机源） |
| 旁证（零触只读） | 见 §1 各臂非替代申明 | 五 case `0fb8f654`（438·`:434` GAP-UC017-ADV）· neg-interview `afd63185`（674）· uc019-adv `5e73d5e0`（412）· uc017-perf `0cb14b52`（447·`:292` 回收态报告读）· uc002-adv `a26d145d` · bill3-settlement `4e53816a`（worker test·`:521-530` DB 层具名错）· resume-reference-http `493652bf`（`:132` 陈旧 job 合法种先例）· uc016-adv（`uc-e2e-016-nhp-adv.proof.ts` 壳先例 #163）· 五 case harness `harness/uc-e2e-017-orphan-http-sse.md`（ADV 零触立场表亲读） |

### 0.2 码面锚（注入缝亲证 · 期望值逐条对码 @`351501976`）

**Case · `NHP-017-ADV-01` · V 族（孤儿任务对抗·单口 begin/abandon/reconcile）**

| 臂 | 注入缝（对码） | 期望值（逐条钉死） |
|---|---|---|
| V1 伪造预占·同键不同 units | begin 守卫链全过（无 start job）→ `reserveEntitlement` `:60-63` ON CONFLICT 占坑 0 行→`:67-72` 既有 `units_requested`(0.5 种)≠1.0→具名错→`interview.service.ts:265-267` catch 映射 409 | begin（own∧ingested 绑定壳+伪造 consumption 行 key=interview id·units_requested=0.5）→ **409 `idempotency_units_mismatch`**；零 start job 零入队；桶 `units_reserved` 零动（余额读数零变）；伪造行字节零动（units_requested 仍 0.5·事务回滚） |
| V2 伪造/陈旧 start job 拒采纳 | 壳+resume 绑定（epoch 1）+**触发器合法陈旧 job 种**（kind='start'·resume_id NULL·resume_privacy_epoch=1·reference_schema_version=64·`resume-reference-http.proof.ts:132` 先例形=该形过 022 触发器亲证）→ `:217-231` v64 匹配谓词 `j.resume_id=i.resume_id` 不命中（NULL≠rid）→ `:232-234` anyExistingStart 命中 | begin → **409 `legacy_resume_reference_unavailable`**（拒采纳·不静默换基·不复活）；零新 job 零扣额零绑定写；陈旧 job 行字节零动 |
| V3 pre-v64 父无快照拒 | 壳 INSERT 时绑 resume_id 但 **resume_privacy_epoch NULL**（pre-v64 形）→ `:190-195` `existingResumeEpoch===null` | begin → **409 `legacy_resume_reference_unavailable`**（no-guess 规则：不从现势 resume 行猜快照·防陈旧任务复活）；零新 job 零扣额 |
| V4 租约竞态·abandon 先行→reconcile 零双释放 | begin 202 reserved→fixture 租约过期 UPDATE（五 case FAULT-01 同款 `:232-235`）→**POST abandon 先行**（200 released·回补）→再 `reconcileOwner`：`commerce.ts:591` sweep 谓词 `status='reserved'` 不命中（行已 released）→`rec.swept`=空 | abandon → 200 `released:'released'`；reconcileOwner → **staleReleased=0·abandoned=0**（零双释放零双回补）；余额恒=种子原值（恰一次退款）；`interview_unavailable` 事件 **0 条**（无回收即无事件）；consumption 恰 1 行终态 released |
| V5 租约竞态·reconcile 先行→abandon 幂等 noop | begin 202 reserved→租约过期→**reconcileOwner 先行**（released+abandoned+恰 1 事件·五 case FAULT-01 同款）→POST abandon：`settleOrReleaseForTerminal` 对 released 行 error/not_found→空壳分支不命中（有消费行）→`:541-542` `already_abandoned`+`released:'noop'` | reconcileOwner → staleReleased≥1+事件恰 1 条；abandon → **200 `{abandoned:true, released:'noop', alreadyAbandoned:true}`**（`interview.service.ts:659` 映射）；余额恒=种子原值（reconcile 恰一次回补·abandon 零二次退款）；事件仍恰 1 条（零重放）；consumption 恰 1 行 released |
| V6 回收壳复活拒（V5 链上续） | V5 回收后同 id 再 begin：`:123-124` 行在（RLS own 可见）·`:128-129` TERMINAL_INTERVIEW 含 'abandoned' | re-begin → **409 `interview_not_active`（status:'abandoned'）**（`commerce-reconcile.ts:40-42` 尸体复用洞的 begin 侧封口）；零新 start job 零二次扣（余额零变）；interview 仍 abandoned |
| N 净账审计 | 全臂逐臂记账（沿五 case `bal()`/`consCount()` 形 `:197-214`） | V1/V2/V3 全零扣零误退（余额恒值）；V4/V5/V6 各恰 1 consumption 行、各恰一次 1.0 扣+恰一次 1.0 回补=**净零**；终审计：全臂合账净耗 **0.0**·consumption 行数恰 3（V4/V5/V6 各 1·V6 与 V5 同行）·`interview_unavailable` 事件恰 1 条（V5 回收发出·V4/V6 零新增） |

**报告链/跨主体零残余旁证锚（零臂·如实登记）**：报告链六面=uc019-adv V2/V3/V4/V5+neg-interview `:397-403`+uc017-perf `:292`+neg-interview `:408`（§认领核对判定）；跨主体面=neg-interview `:294-296/:377-403`+五 case NEG-01 `:420-423`+uc002-adv V4/V5；队列饱和 429=neg-interview `:614-652`（begin/turn 双臂）。

### 0.3 认领 cell 登记（行号+用例名+现值·亲读逐字）

| 行号 | 用例名 | 现列值（亲读） | 本刀补 |
|---|---|---|---|
| **矩阵 `:122` ADV cell** | **UC-E2E-017 ADV** | **`blind`**（裸值·零注记·全行唯一残格） | 具名 case `NHP-017-ADV-01`（blind 保持+case-only 措辞+收据注·EXIT0=case≠covered） |
| case-matrix §1.2 | —（无行） | 无 `NHP-017-ADV-01` 行 | EXEC 补一新行（`:75` 邻区·沿 `:85` NHP-019-ADV-01 形） |
| 矩阵 `:122` NEG/FAULT/BOUND+注记列+`:182` 分面 | 五 case+orphan/PERF 族 | partial×3+「HTTP/SSE 注入未进 isolated」+partial | **零触**（注记列措辞更新权归协调方/专属线后刀） |

---

## §1 修法（恰 1 具名 case=`NHP-017-ADV-01` · 一 proof 单口七臂 · 沿 uc016-nhp-adv/uc017-orphan-http-sse 先例形 · 零产品码触 · 零 invent covered · 零 live key）

**修法形状**：新 proof `apps/api/test/uc-e2e-017-nhp-adv.proof.ts`（隔离真 PG+boot() 真 HTTP 三层壳·沿 `uc-e2e-017-orphan-http-sse.proof.ts` 同 harness 形——`h.post`/`h.req`/`seedBeginFixture`/`applyBeginChainPreamble` 形制 additive 重放·每 proof 自包含夹具补齐 0064/0049/0142 承登）+ apps-api package.json 注册行 `prove:uc017-nhp-adv` + root package.json 双行（`uc017:nhp-adv:prove`/`:prove:raw`·**零碰撞亲证**：`uc017:orphan-http-sse`/`uc017:orphan`/`uc017:nhp-load`/`uc017:nhp-perf-api`/`uc015:nhp-adv`/`uc016:nhp-adv` 在树·`uc017:nhp-adv` 全树 grep 零命中）+ runner 注册位（`scripts/run-e2e-isolated.mjs`：SOURCE_PATHS `:1653` 邻区/allowlist `:2682` 邻区/isolatedCommand `:3203-3207` 邻区·五 case 同款三位在树亲点·EXEC 届时重 pin·位4 pre-migrate 名单/位5 resource-caps 条件按届时 tip 亲证登记或如实申明不适用）+ egress 环境引用登记（`ai-docs/architecture/ai/provider-egress-inventory.json` additive·新 proof×实际出现词名·class=test-isolation·沿五 case 先例形·漏登即 CI `environment_reference_unregistered` 红）· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**；isolated 真 PG · 零 MODEL_API_KEY（boot() `:61-62` 自删+boot 前后断言·五 case 同形）· 零模型外呼零 drain；**五 case 收据 `uc-e2e-017-orphan-http-sse.proof.ts` 零触**；收据 `.tmp/uc017-nhp-adv-receipts/` + tracked `ai-docs/delivery/receipts/uc017-nhp-adv/`（implementer pre-commit runs · `.log` 非 TEXT_EXTENSIONS 不计受管扫描）。行/列状态一字不动：EXIT0=case≠covered，coveredCount=8 不变。

### Case · `NHP-017-ADV-01`（UC-017 ADV 残余 · 孤儿任务对抗 V1–V6+N 族）

- **需求源**：`e2e-scenarios.md:197`（UC-017 预占后会话/SSE 创建失败→孤儿对账）+ A1–A3 `:211`（对账后 released/额度恢复原值/**同键重试不产生第二条 reserved**/sweeper 后无残留——本 case 取其对抗注入边界族：伪造预占同键异 units/陈旧 job/租约竞态双嘴/回收壳复活·不触其图面）+ 矩阵 §0.5 `:47` ADV 强制列。
- **证据层**：isolated 真 PG + boot() 真 HTTP；前置 consent+owned∧ingested resume+route 预供给（`seedBeginFixture` 形制 `0fb8f654:102-127`·每臂独立 interview/report/job 空间）；uuid 列面良构纪律（resume-id 非 UUID→400 `invalid_resume_id` `:107` 有类型守卫·良构 UUID 字面量沿袭）；桶种子豁免①具名（V4/V5/V6 begin 臂·`seedOwnerBucket` 形 `0fb8f654:92-97`）+预占伪造种子具名（V1 consumption 行·非产品路径·枚举入收据）。
- **臂**：V1 = 伪造预占（同键异 units 0.5 种）→ begin → 409 `idempotency_units_mismatch`+零 job 零扣+伪造行零动（§0.2 期望表）；V2 = 触发器合法陈旧 start job 种（resume_id NULL+epoch 1+v64）→ begin → 409 `legacy_resume_reference_unavailable`+零采纳零复活；V3 = pre-v64 父壳（resume_id 在+epoch NULL）→ begin → 409 `legacy_resume_reference_unavailable`；V4 = begin→租约过期→abandon 先行→reconcileOwner → 零双释放零双回补零新事件（staleReleased=0/abandoned=0）；V5 = begin→租约过期→reconcileOwner 先行→abandon → 200 `alreadyAbandoned:true`+`released:'noop'`+单次回补+事件恰 1；V6 = V5 链上 re-begin → 409 `interview_not_active`(status=abandoned)+零二次扣；N = 全程净账审计（V1–V3 零扣·V4–V6 各恰一次扣+一次回补·合账净耗 0.0·事件恰 1 条）。
- **非替代申明**：五 case `0fb8f654`（BOUND 同键同 units 短路 ≠ V1 异 units 拒面；FAULT-01 单 reconcile ≠ V4/V5 双嘴串联竞态；COMP-01 单 abandon ≠ V4/V5；FAULT-01 回收后止于 GET ≠ V6 re-begin）· neg-interview `afd63185`（`:294-296` 跨主体 begin/`:550-555` **种子终态** re-begin 409 ≠ V6 **产品回收链态源**——同码不同态源如实申明沿 X16 S4 形；`:581-582` 种子放弃后二次 abandon noop ≠ V5 回收链态源；`:614-652` 队列饱和面零触）· uc019-adv `5e73d5e0`（V3/V4/V5 报告链风暴/白名单/隔离面·本刀零报告链臂）· uc017-perf（`:292` 回收态报告读面·本刀零臂）· bill3-settlement（`:521-530` **DB 层具名错直调面** ≠ V1 begin HTTP 口 409 映射+零副作用持久 pin）· uc002-adv（SSE LED/跨用户 session 面·本刀零 SSE 臂）= 旁证互不替代 · Ban 互借关列。

---

## §1.3 否决表（落选项诚实留痕 · 含零残余判定登记 · 与认领核对互补）

| 落选项 | 否决/登记理由 |
|---|---|
| **报告链重试风暴臂**（429 `report_retry_limited` 连点） | uc019-adv V4 已行使同缝（`5e73d5e0` 同口同 RL 闸 `interview.service.ts:36/:778` · case-matrix `:85`）→ 同缝再臂=**wash** · 零残余判定入卷（§认领核对）。 |
| **报告链状态白名单臂**（ready/running retry 404 `no_retriable_report`） | uc019-adv V3+neg-interview `:397-398` 已行使（白名单 `('failed','quarantined')` `interview-report.ts:38`）→ wash · 零残余。 |
| **报告链 quarantined 重排/export/回收态读臂** | uc019-adv V5+neg-interview `:408`+uc017-perf `:292` 已行使 → wash · 零残余（回收态报告读 200 `interview_failed` 同 row PERF case 已收）。 |
| **跨主体孤儿操作臂**（begin/abandon/report 跨主体 404） | neg-interview `:294-296/:377-403`（回归面）+五 case NEG-01（reserved 行现场）+uc002-adv V4/V5（SSE 面）三层已行使 → 同 RLS 0 行 404 机制多行使=**wash** · 零残余。 |
| **队列饱和 429 臂**（per-owner queued ≥3） | neg-interview `:614-652` begin/turn 双臂已行使（`interview-jobs.ts:70-91` 闸）→ wash · 零残余。 |
| **SSE 槽满/LED 畸形/abort 拆除臂** | 五 case SSE-FAULT-01（`0fb8f654:273-379`）+uc002-adv+uc010 族已行使 → wash · 本刀零 SSE 臂。 |
| **种子终态 re-begin 臂**（INSERT abandoned 壳→begin 409） | neg-interview `:550-555` 已行使（种子态源）→ 本刀仅取 **V6 产品回收链态源**（reconcileOwner 真回收后 re-begin·同码不同态源如实申明）。 |
| **跨进程 SIGKILL/进程级崩溃注入** | 五 case 卷尾 `GAP-UC017-HTTP-SSE-PROCESS-CRASH`（`0fb8f654:432`）预登归另刀 · 本刀 fixture 租约注入同形不越界。 |
| **V1 伪造行走产品路径制造**（先 begin 再改 units） | UPDATE consumption 行无产品口（预留行客户端不可变）· 伪造状态注入须夹具种子=豁免具名（沿五 case 租约过期 UPDATE 同形先例 `0fb8f654:232-235`）· 如实申明非产品路径。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算·越限沿先例步进承登预授权条款本刀已触发）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2430**（stdout「public text policy scanned 2430 managed worktree files」亲读）· cap=**2430**（`public-text-policy.mjs:232` `MAX_FILES = 2_430` 亲证）——**2430=cap 恰等零余量**·本卷新文件 +1 → **2431 > 2430 必越** → 沿总盘派单常设预授权「越限沿先例步进承登」**+8=2430→2438**（+8 三十三先例形·X16 2410→2418 同形·本刀净增受管 2 件（REQUEST+EXEC proof）届终 2432≤2438·余 6 系在飞共享余量沿 cap 2152 先例形）：①`public-text-policy.mjs` `MAX_FILES 2_430→2_438`+X17-ADV 步进注记两行置顶插 MAX_FILES 上邻（栈史零洗）；②`public-text-policy.proof.mjs` 越限臂四处联动（`i<2_438`·atCap 2_438·`f-2438.md`·`FILE_LIMIT:2439`）+CAP-SANCTION-2438 注记置顶插链区；③**语义申明：计数预算联动零门语义变更·越限臂 fabricated 数随 cap 联动同步·proof 强度不减**·本树 `public-text-policy.proof.mjs` 亲跑 **12/12 EXIT=0**（2438/2439 双值全行使）·起草树终态 **2431 ≤ 2438**；EXEC 期 +1 proof=2432 ≤ 2438（若 EXEC 期在飞并线致 tree 实测 >2438 → 触「验收红不可修」停手上报·Ban 就地再改 cap；在飞先并线则届值按合并树实测重算如实承登）。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自指）+行首冲突标记严格形 grep 零命中（起草席亲跑·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 3 tracked 路径**=本卷 .md+`public-text-policy.mjs`+`public-text-policy.proof.mjs`；EXEC 期 diff 面=本卷+新 proof+注册行（root `:131-132` 邻区双行/apps-api `:55` 邻区单行）+runner 注册位三位（字面锚 `:1653`/`:2682`/`:3203-3207`·§1 承登）+egress additive 登记+双表行内改（矩阵 `:122` ADV cell 邻区+case-matrix `:75` 邻区 §1.2 一新行）+tracked 收据 `ai-docs/delivery/receipts/uc017-nhp-adv/`（`.log` 非扫描扩展名不计·沿五 case/批 C 形）——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin）**：`pnpm uc017:nhp-adv:prove` EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 邻面不回退（`uc017:orphan-http-sse:prove` 五 case 断言恒等+`neg:interview` 按届时 SSOT 口径）· 双表同步 diff 逐件登记（§1.0.3 `:166` 令）· **lint 帽承登预置**：EXEC 期新 proof 如添 no-explicit-any/naming warning → 沿批 C/X16 §9-post 双帽恰等步进先例形·协调方 sanction 面·非本起草刀落码 · 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:122` ADV cell 与 case-matrix §1.2 新行措辞仅允许「blind 保持+case-only 收据注」诚实登记 · coveredCount=8 零翻转 · Ban 借本收据宣 UC-017 covered/ADV 列升格 · Ban 借收据 wash 五 case/neg-interview/uc019/uc017-PERF（本刀臂与其 reason 级可分·互不借用）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行+runner 注册位·沿 uc015/uc016/五 case prove-only 先例）。
2. **同 row 五 case+PERF 收据零触**：`uc-e2e-017-orphan-http-sse.proof.ts`+`uc-e2e-017-nhp-perf-api.proof.ts`+`harness/uc-e2e-017-orphan-http-sse.md` 域——只读；UC-017 集成半（`packages/db/test/uc-e2e-017-orphan-reservation.proof.ts`）、UC-019 报告链族、neg-interview 回归面、批 A/B/C 已并线卷、各 UC 专属线触面只读。
3. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
4. **covered/queue 翻面零预支** · **零迁移零配置零 Key**（桶种子/预占伪造种子/租约过期注入系隔离夹具种子沿豁免具名·非迁移）。

## §4 依赖

**①上游已满足**：六臂注入缝全在树（§0.2 对码亲证）+ 五 case 三层壳先例（`0fb8f654` 同 harness 同 preamble 形制）+ ADV 行形先例（case-matrix `:85` NHP-019-ADV-01）+ 壳先例（`uc-e2e-016-nhp-adv.proof.ts` #163）+ 陈旧 job 触发器合法种先例（`resume-reference-http.proof.ts:132` 形）。**②同文件并发**：起草 turn 恰 1 新 .md+policy 两 script 数值联动零交涉面（在飞线对同两 script 的注记栈/cap 行交涉按 §0.0 dual-keep 先例处置）；EXEC 期触矩阵 `:122` 邻区与 case-matrix `:75` 邻区——§0.0 在飞交叠复核必做。**③下游**：ADV 残余收据供 UC-017 列升格评估族引用（评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含升格 blind/借旁证 wash/实例宣伞）；Ban live key（零 Key 面硬跑·est live=0）；Ban 触产品码面/迁移/CI 告警配置（cap 值外数值联动按 §2-1 预授权形·越值红停上报）；Ban 触五 case/PERF 既有 proof、UC-019 报告链族、neg-interview 回归面、共享 SSOT；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·枚举完备：①桶种子（V4/V5/V6 begin 臂·entitlement_bucket·`0fb8f654:92-97` 先例形）+②壳行种子含状态钉（V1/V2 绑定壳/V3 pre-v64 壳·`seedBeginFixture` 形制）+③**伪造预占种子**（V1 consumption 行 key=interview id·units_requested=0.5·非产品路径如实申明·沿五 case 租约过期 UPDATE 注入同形）+④**陈旧 job 种子**（V2 start job 行 resume_id NULL+epoch 1+v64·触发器合法形·`resume-reference-http.proof.ts:132` 先例）+⑤租约过期 UPDATE（V4/V5·`0fb8f654:232-235` 同款）——枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（EXEC 期隔离 PG·零 MODEL_API_KEY 零 drain 零 live worker·V4/V5/V6 begin 系本地隔离库产品路径·`reconcileOwner` 进程内直调=五 case FAULT-01 同款调度嘴形态·§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+policy 两 script 数值联动·起草 turn）五类标记词 + conflict-marker grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径·不复抄卷内防自匹配——沿批 C/X16 §7 同形制）。

## §8 STOP · **`draft:awaiting_pre_exec_dual`**（2026-10-27 起草落卷·三处钉：本节 + Status 头 + 卷尾注同值 · 后继=pre-exec 双审两独立外席 → 协调方明示 EXEC 授权 → EXEC 落码落卷 · 停止条件四类对各在飞 step 适用·命中即停手上报·Ban 就地处置）

**开工三条款**（EXEC 前置·缺一即停）：①pre-exec 双审 BOTH PASS 落卷（两独立外席·alone≠dual）；②协调方明示 EXEC 授权（含 §2-1 cap 步进 +8=2430→2438 追认）；③§1 修法面/§5 Ban/pins/§1.3 否决面零改动（§0 对开工 tip 全量重 pin）。停止条件：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（`:122` ADV 列值被他刀改写 · 五 case 收据被改写 · units-mismatch/陈旧 job/租约竞态/回收壳缝码面漂移 · 在飞并线改写 case-matrix `:75` 邻区或 policy 注记栈致本卷 §2-1 分界面失准）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §0.2 对码期望不符（异 units begin 非 409 · 陈旧 job 被静默采纳 · reconcile 双释放 · 回收后 abandon 非 noop · 回收壳 re-begin 非 409）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 1 case V1–V6+N 臂面（需触产品码/五 case 收据/报告链臂/跨主体臂/covered 翻面/共享 SSOT/迁移/cap 再步）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2438 / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-10-27 起草落卷·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve）· 卷 draft ≠ covered ≠ 矩阵列升格（coveredCount=8 零翻转 · EXIT0=case≠covered · ADV blind 保持+case-only）· 状态翻面权归协调方 · ⛔push ⛔force-push。

---

*X17-ADV REQUEST · 2026-10-27 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行）· NHP-017-ADV-01 孤儿预占对账对抗边界（矩阵 `:122` ADV cell=blind 全行唯一残格→blind/case-only·EXIT0=case≠covered·coveredCount=8 零动）· 认领=ADV cell 残余（孤儿任务对抗 V1–V6+N 七臂·与五 case NEG/COMP/SSE-FAULT/BOUND reason 级可分·`:434` GAP-UC017-ADV 留痕行兑现）· **报告链风暴/白名单+跨主体两域如实判定零残余不入卷**（uc019-adv V2–V5/neg-interview `:294-403,:550-555,:614-652`/uc017-perf `:292`/五 case NEG-01 wash 规避）· cap 步进 **2430→2438**（docs:check scanned 2430=cap 恰等+REQUEST 1 件必越·X16 +8 先例形·PTP 12/12 EXIT=0·起草树终态 2431≤2438）· 注入缝锚=units-mismatch `commerce.ts:67-72`+`interview.service.ts:265-267` · 陈旧 job `:232-234` · pre-v64 `:190-195` · sweep 谓词 `commerce.ts:591` · abandon noop `commerce.ts:541-542`+`interview.service.ts:659` · 终态拒 `:128-129` · 回收嘴 `commerce-reconcile.ts:69-91` · est live=0 · markers=0 · pins 十一值零翻 · releaseEvidence=false · ≠HA · ⛔push*

**`draft:awaiting_pre_exec_dual`**（卷尾注 · 2026-10-27 · 与 Status/§8 同值 · 后继=pre-exec 双审两独立外席 → 协调方 EXEC 授权 → EXEC 落码落卷（并线席随令 fetch origin/main·cap/lint 届值取大·union 越限沿常设预授权恰等步进）/post 双审 → 翻面权归协调方（门红或冲突不可解即停上报））
