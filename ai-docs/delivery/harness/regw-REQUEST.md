# REGW REQUEST — 流式注册窗口退化态证明起草卷（`GAP-SSEPUSH-REG-WINDOW` · D5「先注册 waiter 再取数」机制现形 + 控制器 pre-fetch 边界窗口 · RW-0…RW-6 七臂刀形）（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-30 起草落卷即停 · rev r1 回炉修订（双席 FAIL 互盲同判·处方合并全采纳）· **rev r2 回炉修订（双席 FAIL 互盲同判 P0×1·协调方裁决采乙案「镜像泵+静态接线断言」）** · 三处钉：本行 + §8 + 卷尾 · 同值 · pre-exec 双审两独立外席待派 · Ban self-approve · alone≠dual · est live=0 · markers=0 · ⛔push ⛔动主仓）

**席位**：meetwise 流式注册窗口起草席（docs-only 起草 · 总盘 v4 未认领 keyless 仪器小刀 P2/P3 · 协调方授权 · ⛔push ⛔动主仓）；**rev r1 回炉席**（r1 双席 FAIL 互盲同判 · 裁决按两席处方合并去重全采纳 · 2026-10-30）；**rev r2 回炉席**（r2 双席 FAIL 互盲同判 P0×1 · 协调方刀型裁决采乙案 · 2026-10-30）。
**基线**：起草基 `origin/main` @ **`1ca3ce1daa31903efc834de911f78752a8168e78`**（short `1ca3ce1da`）；本 rev 基 = 本枝 `line/regw-draft` @ **`397076931`**（`docs(test): 更正流式注册窗口任务书承载形` · worktree `meetwise-regw`）。`git fetch origin` 本 rev turn 成功——**`origin/main` 已前移至 `99e4e3f38`（较起草基 +28 commit；受管面 additive 恰 +2 件：`ai-docs/delivery/harness/cwn-REQUEST.md` + `ai-docs/delivery/harness/uc3m-REQUEST.md`；机制源零漂：`sse-pump.ts`/`sse-notify.service.ts`/三控制器/取数面/事件原语与 migrations 十件 blob 与 §0.1 全恰等）**→ 结论不受疑、不触 §8 现场漂移；EXEC 立项日 rebase 后 cap 算式按 §2-1 重算。本 rev 落卷前本树 `node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2458**（亲跑）；本 rev 落卷后复跑同值（同件修订净增 0，§2-1/§7）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/execution-master-checklist.md`（**`:1660` STILL OPEN 行**含 `GAP-SSEPUSH-REG-WINDOW` 原文）→ 机制源 `apps/api/src/platform/sse-pump.ts`（`:23`-`:25` D5 区 · `:44`-`:68` `SsePumpOptions`（**无 `fetchInitial/loadInitial`**）· `:70`-`:71` 双钉值 · `:84`-`:85` `notify/registry` `??` 回退（keyless 破面）· `:169`-`:170` 注册/重放序 · `:173`-`:209` 循环 · **`:189`-`:191` dispose→重注册无 `await`（零窗关键环）** · `:199` 取数 · `:205` `more === null` break · `:208` `: ping` 无 id）· `apps/api/src/platform/sse-notify.service.ts`（`:185`-`:187` `health` · `:190`-`:195` `whenHealthy` · `:197`-`:209` `waitFor` · **`:309`-`:319` `onNotification`（无在册 Set 即 `return`=不排队）** · `:246`-`:262` `stop` · `:369`-`:373` 10s 探针 timer · `:489`-`:492` 单例惰性）· 三控制器 `interview.controller.ts`（`:264`/`:268`/`:276` deltaSource）/`quiz.controller.ts`（`:59`/`:61`-`:68` 选项块/`:69` 收口）/`diagnosis.controller.ts`（`:57`/`:59`-`:66` 选项块/`:67` 收口）· 取数面 `interview.service.ts`（`:910`-`:917`）/`quiz.service.ts`（`:131`-`:139`）/`diagnosis.service.ts`（`:104`-`:111`）· 事件原语 `packages/db/src/interview/interview-event.ts`（`:22` 同流事务锁 · `:30`-`:31` 同事务 `MAX+1`）· `packages/db/migrations/0001_baseline.sql`（`:38`-`:45` `interview_event` 表 + `uq_event_seq`）· 先例 `apps/worker/src/job-wakeup-listener.ts`（`:111`-`:115` LISTEN 先于 reconcile）→ 既有证明 `apps/api/test/sse-push-notify.proof.ts`（`:924` GAP 诚实 PIN · `:539`-`:579` P-2b 兜底 cadence/notify 主推 · `:47`-`:48` raw 需 isolated `DATABASE_URL`=隔离形）· `apps/api/test/ha-2-drain.proof.ts`（`:24`-`:50` fake sink · `:62`-`:70` `controlledFetch` · `:292`-`:293` `as never` + `new HealthController` 直构先例 · `:296` 首断言——**该直构形本 rev 起不采，仅留 fake sink 形制参照**）· `apps/api/test/sse-delta-arm.proof.ts`（`:44`-`:53` `fakePgClient` · **`:81`-`:93` `startPump` 直驱形** · `:112` 真 `SseNotifyService({connect: 闭包捕获})` · `:120` `Promise.race([whenHealthy(), sleep(3000)])` · `:137` `await notify.stop()`）· `apps/api/test/sse-listen-probe.proof.ts`（**LP-1 `:76`-`:101` 半开判负/等待者全醒；LP-4 `:179`-`:197` stop 后探针 timer 清零**；注册 `apps/api/package.json:105`）· `apps/api/test/last-event-id.proof.ts`（`:2` `No database.`）· `apps/api/test/uc-e2e-010-sse-resume.proof.ts`（`:260` 断线窗）→ 旁证卷 `ai-docs/delivery/harness/xrep-REQUEST.md`（`§XR-2 :93` 二择一预注册 · `§9-EXEC :198` 择形②记录）· 收据 `ai-docs/delivery/receipts/sse-xrep/04-neighbor-sse-push-notify.log`（`:132` 同 PIN）、`ai-docs/delivery/receipts/ssepush-notify/judgment-run-stdout-attempt1.log`（`:90` 同 PIN·第三收据）、`ai-docs/delivery/receipts/evidence-delivery/2026-10-10-sse-push-notify-final.log`（`:88` 同 PIN）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`ai-docs/delivery/execution-master-checklist.md:1660` **`GAP-SSEPUSH-REG-WINDOW`（控制器 initial 取数→pump waiter 注册 ~ms 级窗口 · 窗内事件由兜底收 ≤30s 非丢失 · 退化态 2s 收）**；②同卷 SSE-PUSH 段 Non-claims/STILL OPEN 五行登记（本行不关闭）；③证明面诚实 PIN 四处（`sse-push-notify.proof.ts:924` + 三收据 `ai-docs/delivery/receipts/evidence-delivery/2026-10-10-sse-push-notify-final.log:88`、`ai-docs/delivery/receipts/sse-xrep/04-neighbor-sse-push-notify.log:132`、`ai-docs/delivery/receipts/ssepush-notify/judgment-run-stdout-attempt1.log:90`）——均=登记非证明；④`xrep-REQUEST.md:93` 二择一预注册（①尾窗容忍/②发射窗倒置消除）+`:198` EXEC 记录**择形②**；⑤协调方派单令（keyless 仪器小刀·单列本 GAP 证明面）。

---

## 认领核对 · 登记处 fresh 亲点（本卷核心盘点 · 逐行对 `origin/main` @`99e4e3f38` 亲读·file:line 逐字）

| 登记处 | 对树行使证据（file:line 亲读逐字） | 判定 |
|---|---|---|
| `GAP-SSEPUSH-REG-WINDOW` 主登记 | `execution-master-checklist.md:1660` STILL OPEN 行原文：`GAP-SSEPUSH-REG-WINDOW`（控制器 initial 取数→pump waiter 注册 ~ms 级窗口 · 窗内事件由兜底收 ≤30s 非丢失 · 退化态 2s 收） | **开**（亲点维持） |
| 证明面诚实 PIN | `sse-push-notify.proof.ts:924` 逐字同句 PIN；`ai-docs/delivery/receipts/evidence-delivery/2026-10-10-sse-push-notify-final.log:88`、`ai-docs/delivery/receipts/sse-xrep/04-neighbor-sse-push-notify.log:132`、`ai-docs/delivery/receipts/ssepush-notify/judgment-run-stdout-attempt1.log:90` 三处同句 | 旁证一致（PIN=登记非证明） |
| XREP 旁证 | `xrep-REQUEST.md:93` 预注册两形：①尾窗容忍（窗内事件由 `HEALTHY_FALLBACK_MS=30s` 兜底收）②消除（待首帧/心跳后始发 INSERT）；`:198` EXEC 实录「**XR-2×2（reg-window 择形②消除=首帧先到后发射**+逐条 <500ms·实测读数 2.8-11.1ms 原样透出）」 | **旁证=绕行非证明**（测试发射序倒置使窗口不落入被测路径；产品侧窗口原样在树） |
| 其他登记面 | `grep -rn GAP-SSEPUSH-REG-WINDOW` 全树命中=checklist `:1660`+proof `:924`+收据**三处**（`ai-docs/delivery/receipts/evidence-delivery/...:88`/`ai-docs/delivery/receipts/sse-xrep/...:132`/`ai-docs/delivery/receipts/ssepush-notify/...:90`）+xrep 两处（`:38` 字面锚引/`:93` 二择一）；`current-runtime-truth.md` / `high-concurrency-review.md` / `case-matrix` 零命中 | 不在册（无第二登记处） |

**起草席定谳（亲读结论·推翻即红停）**：本 GAP **不是机制缺陷，是窗口的证明缺口**，且**机制呈两区结构**（§0.2）——(i) **泵内尾循环零窗**：`:191` 下一轮 waiter 注册发生在 `:199` `fetchMore` 之前（D5 对偶行使），且 `:189`→`:191` 之间无 `await`（NOTIFY 宏任务不可插入），尾取数窗已被结构性消灭；(ii) **控制器 pre-fetch 边界窗真实存在**：三控制器均先 `await ...events(...)` 取 initial（`:264`/`:59`/`:57`）再调泵（`:268`/`:62`/`:60`），initial 快照之后、泵 `:169` 注册之前落库的事件，其 NOTIFY 命中零在册 waiter → 提示掉地（lossy hint），只能由兜底臂收。**故「机制已结构性闭合到可纯证伪」不成立**（边界窗在泵外）；刀型应为**双臂复合**：泵内用证伪臂钉死零窗，边界窗用承接臂证零丢失与有界时延（§1 二择一）。停止条件「机制已结构性闭合且无可证伪面」**未触发**。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`397076931`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git branch --list "line/regw*"` 恰本席一支 `line/regw-draft`；`git worktree list` 含 `meetwise-regw`（本席自树）；`ls ai-docs/delivery/harness/ | grep -i "regw\|reg-window"` 落卷前**零命中**→落卷后唯一同名卷=本卷。`grep -rn GAP-SSEPUSH-REG-WINDOW` 无第二认领卷。
- **在飞交叠复核（EXEC 立项日必做）**：本卷起草/回炉 turn 触面=**恰 1 新 .md**（产品零触）——与任何在飞刀零交涉。EXEC 期触面=1 新 proof+root/`apps/api` 两 `package.json` 注册行（各 1-2 行）+`ai-docs/delivery/receipts/regw/*.log`（真跑收据·`.log` ∉扫描面）；**不入 `scripts/run-e2e-isolated.mjs`**——纯单元缝 proof 先例 `prove:ha2-drain`（`apps/api/package.json:83`）与 `prove:s4b-delta-arm`（`:106`）均不入 runner，本刀沿同形（§2-4）。届时对两 `package.json` 注册区做 `git log -1 -- <file>` 在飞复核，任一分支顶在本基后有新增提交→触停止条件「现场漂移」停手上报。

### 0.0.1 rev r1 回炉记录（2026-10-30 · 双席 FAIL 互盲同判 · 裁决按两席处方合并去重全采纳）

- **回炉依据**：pre-exec 双审两独立外席 **BOTH FAIL**（互盲同判）；协调方裁决「两席处方合并去重后全采纳」。两席合计 21 项（席1：P1×1/P2×4/P3×2；席2：P1×4/P2×8/P3×2），落为本单 **8 主体条**，逐项落点见本卷各节；无一项驳回、无一项降格。**（本 r1 记录不自立可数细目编号——r2 起由 §0.0.2 的「裁决项→落点→状态」表承接逐项可查性。）**
- **承载形翻转（r1 核心）**：§1/§1.1 的 fake notify → **真 `SseNotifyService({connect: fakePgClient})`**（沿 `sse-delta-arm.proof.ts:44`/`:112` 先例）；healthy 臂**先 `await whenHealthy()` 再起泵**（初态 `health:{healthy:false,reason:'listen_down'}` 否则落 2000ms 兜底，RW-2 的 60ms 前提即崩）；每臂收尾 `await notify.stop()`（清 10s 探针 timer `sse-notify.service.ts:369`-`:373` 与退避 timer）；RW-4 用 `connect: () => new Promise<never>(() => {})` **确定性保持** `health=false`。
- **区2 由静态改动态（r1）**：新增 **RW-6** 控制器直构臂（quiz/diagnosis 真控制器 + fake service/rl）；**r2 已按协调方乙案改为镜像泵形**（见 §0.0.2/§1.1），直构形与「禁 interview 直构」处方**一并撤销**（本 proof 零控制器 import，见 §6）。
- **区2 存在性措辞修正**：删「无法由泵关闭」；窗起点改「initial 语句开始」（quiz/diagnosis own+rows 两查询 `quiz.service.ts:134`+`:136`，interview `guardInterviewPrivacy`+行取数 `interview.service.ts:913`-`:914`，diagnosis own+rows `diagnosis.service.ts:107`+`:109`）；泵侧「注册后立即补一次取数」（`:170` 后 `:173` 前）可廉价收窄至 ≈0，彻底消除可改控制器序——两者均越本刀授权，**本刀只证不修**。
- **机制源亲证（修订零冲突）**：`sse-pump.ts` `:189` `wait.dispose()`→`:191` 重注册**无任何 `await`**（同步段，NOTIFY 宏任务不可插入=区1 零窗关键环）；`sse-notify.service.ts:309`-`:319` `onNotification` 无在册 Set 即 `return`（**不排队**）；`SsePumpOptions`（`sse-pump.ts:44`-`:68`）**无 `fetchInitial/loadInitial`**（区2 判据的类型面）。三处与两席处方一致，**停止条件「修订与机制源冲突」未触发**。
- **门的自证**：r1 仅改本卷 1 件（受管件净增 0，仍 2458）；`docs:check` EXIT=0 · scanned 2458；PTP 12/12 EXIT=0；markers 改动集零命中（亲跑读数见 §2/§7）。

### 0.0.2 rev r2 回炉记录（2026-10-30 · 协调方刀型裁决=乙案「镜像泵+静态接线断言」）

- **回炉依据**：pre-exec 双席 rev r2 复审 **BOTH FAIL 互盲同判**（P0×1 集中于 RW-6「真控制器直构」之不可行/不可达与 PrincipalGuard 顶层副作用；其余 P1/P2 为断言自洽、时序假绿、行号与预算）。协调方裁决**采乙案**，并把两席处方合并去重为本表 10 主体条 + 15 细目。
- **刀型裁决（乙案·逐字）**：RW-6 改「**镜像泵**」——①**静态断言**控制器选项块与测试直驱块逐项同形（读 `quiz/diagnosis.controller.ts` 的 `pumpSseEvents` 调用块，断言六个键与 proof 直驱块一致）；②**动态臂直接 `pumpSseEvents`** 注入真 notify/registry/`fallbackMsHealthy=60`（沿 `sse-delta-arm.proof.ts:81`-`:93` 先例），**不再声称「真控制器直构」**；③**删除「控制器无法透传→不可达」的一切处方**（`fallbackMsHealthy=60`/`client.emit` 掉地措辞在镜像泵形下有效）。理由：甲案丢 60ms 判别力／丙案越本刀产品码零触。
- **落点表（裁决项 → 落点 → 状态）**：

| # | 修订项（含细目） | 落点 | 状态 |
|---|---|---|---|
| 1 | **[P0 乙案]** §1.1 RW-6 全节重写：镜像泵形 → 断言数重算（RW-6 8→静态 N=14+动态 M=4）→ §2-5 主门断言数、§9/卷尾计数同步 | §1.1 RW-6、§1.1 断言表、§2-5、§9、卷尾 | 落 |
| 2 | **[P1 席1]** §6 keyless：**不 import 任何控制器**（镜像泵形无需 import）→ 彻底消除 `PrincipalGuard` 模块顶层 `getSseNotify().whenHealthy()` 副作用；§6 明写「本 proof 零控制器 import·零 PrincipalGuard 触面」 | §6、§1、§1.3 | 落 |
| 3 | **[P1 席2]** RW-0-5 改**源 token 断言**：`SsePumpOptions` 接口块内 `!/fetchInitial\|loadInitial/`（swc 转译不类型检查·`Extract<…>` never 不可运行）+类型面只作 typecheck 旁证+§8 判据同步 | §1.1 RW-0-5、§2-5、§8 | 落 |
| 4 | **[P1 席2]** 断言数自洽：RW-2 ①拆 ①a/①b；补「臂→断言→期望值」表 | §1.1 RW-2、§1.1 断言表 | 落 |
| 5 | **[P1 席2]** RW-4 删 fire 前置：connect 永挂无 client 无监听 → 「无 NOTIFY 注入的退化 cadence 臂」 | §1.1 RW-4 | 落 |
| 6 | **[P1 席2]** `whenHealthy` 包超时：`Promise.race([whenHealthy(), sleep(3000)])`+断言 healthy（禁无界 await 挂死门·沿 `sse-delta-arm:120`）→ 统一为共享前置门 **PA-0**，所有 healthy 臂复用 | §1.1 PA-0、§1.1 纪律 | 落 |
| 7 | **[P1 席2]** connect 闭包捕获：`connect: async () => { client = fakePgClient(); return client; }`（沿 `sse-delta-arm:112`·简写丢句柄） | §1.1 各真 notify 臂、§1 | 落 |
| 8 | **[P1 席2]** §8 停止条件补类：「臂不可构造（注入缝缺失/单例回退不可控）→红停上报·Ban 降臂/改断言迁就」 | §8 | 落 |
| 9.① | cap 按 `99e4e3f38` 重算：rebase **2460**／EXEC **2461 恰等余 0**／`.txt` **2462 越限**→一律 Ban `.txt` 只落 `.log`；「+28/additive+2」 | §2-1、§6、§9、卷尾 | 落 |
| 9.② | 收据路径改 `ai-docs/delivery/receipts/...` 全路径（三处 + `:99`） | 认领表、§0.4、§2、§7 | 落 |
| 9.③ | §0.0.1 删可数「16 细目」断言，改由本表承接 | §0.0.1 | 落 |
| 9.④ | 原 RW-6-① `writeHeadAt > initialResolvedAt` 同毫秒假绿隐患随直构形删除；动态臂改**有序事件计数**（`eventSeq`：snapshot<insert<fire<writeHead） | §1.1 RW-6-M2 | 落 |
| 9.⑤ | §1.2/§3-2 补 `sse-listen-probe.proof.ts`（`apps/api/package.json:105`）+cite LP-1/LP-4 | §1.2、§3-2、§0.1 | 落 |
| 9.⑥ | §0.2-(f) 补承重前提（`interview-event.ts:22` 咨询锁+同事务 `MAX+1`+`0001_baseline.sql:38`-`:45` UNIQUE）+零丢失限定「泵未提前收尾」+「窗时长为解析上界非实测」 | §0.2-(f) | 落 |
| 9.⑦ | 变异自检预期红数改「RW-0-2+RW-1-①②③ 四红」+`git diff --exit-code` 零残留步骤 | §1.1 纪律 | 落 |
| 9.⑧ | 墙钟按乙案重算（RW-6 60ms 形 ≈3.4s） | §1.1 纪律、§2-5 | 落 |
| 9.⑨ | 行号收齐：`waitFor :197-:209`／quiz 选项块 `:61`-`:68`／`startPump :81`-`:93`／ha-2-drain `:292`-`:293`+`:296` | §0.1、§1.1、必读清单 | 落 |
| 9.⑩ | Ban 收窄：「notify/registry 双层强转」禁；sink/client 沿先例 `as unknown as` 允许 | §5、§6 | 落 |
| 9.⑪ | 负向 sleep 豁免句 + RW-2 `≥100ms` 与 `sleep(120)` race 对齐 | §1.1 RW-2-①b/纪律、§5 | 落 |
| 9.⑫ | connect 不带泛型过不了 typecheck 注 | §1.1 RW-4 | 落 |
| 9.⑬ | §0.1 补 `diagnosis.service.ts` 锚 | §0.1 | 落 |
| 9.⑭ | RW-0-1/0-2 已 code token 锚核 | §1.1 RW-0 | 落 |
| 9.⑮ | pins 出处注已在 | §5 | 维持 |

- **机制源亲证（修订零冲突）**：`origin/main @99e4e3f38` 较起草基 **+28 commit**、受管面 additive 恰 **+2**（`cwn-REQUEST.md`/`uc3m-REQUEST.md`）；十件机制源 blob 与 §0.1 **逐件恰等**（`sse-pump.ts` `b93121dc`、`sse-notify.service.ts` `a20b0720`、三控制器 `d10db4ae`/`9b78100d`/`f2d7ea90`、三取数面 `a8ae0d15`/`98edbeb2`/`2c7c882e`、`interview-event.ts` `880a1dcb`、`0001_baseline.sql` `d68f8dd0`）→ **停止条件「修订与机制源冲突」未触发**。
- **门的自证（本 rev 落卷后亲跑，§7）**：本 rev 仅改本卷 1 件（受管件净增 0，仍 **2458**）；`docs:check` EXIT=0 · scanned 2458；PTP 12/12 EXIT=0；markers 改动集零命中。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键锚 |
|---|---|---|
| `apps/api/src/platform/sse-pump.ts` | `b93121dc`（223） | **`:23`-`:25` D5 注释区**（先注册 waiter 再取数/notify lossy hint/漏醒兜底收）·`:44`-`:68` `SsePumpOptions`（**无 `fetchInitial/loadInitial`**）·`:70` `HEALTHY_FALLBACK_MS = 30_000` · `:71` `DEGRADED_POLL_MS = 2_000` · `:83` 函数入口 · **`:84`-`:85` `notify/registry` `??` 回退（keyless 破面）** · `:87`-`:88` hijack/writeHead · `:123`-`:125` registry 注册 · `:126` `lastSeq = o.initial.lastId` · `:131` `lastSeq = Math.max(...)` · `:135` deadline 10min · `:136` close 即醒 · **`:169` 首次 `waitFor`** · **`:170` catch-up emit（同步段）** · `:173` while · `:174`-`:176` health→waitMs · `:177`-`:185` race/计时器/唤醒钩 · **`:188`-`:190` clear/dispose/break（`dispose` 与 `:191` 之间无 `await`）** · **`:191` 下一轮 `waitFor`** · `:192`-`:196` delta-only 免取数 · `:197`-`:199` `fetchMore(lastSeq)` · `:205` `more === null` break · `:207`-`:208` emit/ping（`: ping` 无 id）· `:210`-`:213` dispose/unregister · `:222` 单点 end |
| `apps/api/src/platform/sse-notify.service.ts` | `a20b0720`（500） | `:185`-`:187` `health()` 同步读 · `:190`-`:195` `whenHealthy` · **`:197`-`:209` `waitFor`（router Set 在册→resolve+自摘除）** · `:212`-`:218` `waitingCount` · `:246`-`:262` `stop`（清探针/退避 timer）· **`:309`-`:319` `onNotification`（按流取 Set；无在册 waiter 即 return=提示掉地·不排队）** · `:360`-`:362` `wakeAllWaiters`（掉线全醒）· `:369`-`:373` 10s 探针 timer · `:489`-`:492` 单例惰性（`??= new`，**不建池**） |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280） | `:260` 领槽先于取数注 · `:262` acquireSlot/429 · **`:264` `const initial = await this.interviews.events(...)`** · `:268` `await pumpSseEvents({` · `:275`-`:276` `deltaSource`→`getSseNotify()`（**不直构/不 import 之因**）· `:278` finally releaseSlot |
| `apps/api/src/modules/quiz/quiz.controller.ts` | `9b78100d`（72） | **`:59` initial 取数** · `:61` `const isTerminal` · **`:62`-`:69` `pumpSseEvents({...})` 选项块（六键，收口 `:69`）** · 无 deltaSource（裁决⑤零触） |
| `apps/api/src/modules/diagnosis/diagnosis.controller.ts` | `f2d7ea90`（70） | **`:57` initial 取数** · `:59` `const isTerminal` · **`:60`-`:67` `pumpSseEvents({...})` 选项块（六键，收口 `:67`）** · 无 deltaSource |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918） | `:910`-`:917` `events()`；`:913` privacy guard · `:914` SQL **`WHERE stream_key=$1 AND seq>$2 ORDER BY seq`**（initial 与 tail 同谓词） |
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2`（140） | `:131`-`:139` `events()`；`:134` own 校验 +`:136` 行取数（**两查询**）；`:136` 同 `seq>$2` 谓词；`:135` 越权 0 行→null→404 |
| `apps/api/src/modules/diagnosis/diagnosis.service.ts` | `2c7c882e`（113） | **`:104`-`:111` `events()`**；`:107` own 校验（`resume_diagnosis`）+`:109` 行取数（**两查询**）；`:109` 同 `seq>$2` 谓词 |
| `packages/db/src/interview/interview-event.ts` | `880a1dcb`（43） | **`:22` `SELECT pg_advisory_xact_lock(hashtext($1))`（同 stream 事务锁串行）** · **`:30`-`:31` `INSERT … SELECT COALESCE(MAX(seq),0)+1 … RETURNING seq`（同事务原子分配）** · `:24`-`:27` `event_key` 幂等早返 |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（485） | **`:38`-`:45` `CREATE TABLE interview_event` + `CONSTRAINT uq_event_seq UNIQUE (stream_key, seq)`**（seq 单调不重之库级保证） |
| `apps/worker/src/job-wakeup-listener.ts` | `fc18131d`（157） | `:111` `LISTEN ${...}` · **`:112`-`:114` 注释「LISTEN first, then reconcile: a commit between an earlier scan and LISTEN cannot be missed」** · `:115` `onWake()`=D5 先例 |
| `apps/api/src/platform/principal.guard.ts` | `50b38bc5`（112） | **`:38` 模块顶层 `getSseNotify().whenHealthy()`（import 即副作用）**——本 proof 零控制器 import 的直接理由 |
| `ai-docs/delivery/execution-master-checklist.md` | `2884be76`（4503） | **`:1660` STILL OPEN 五行登记（本 GAP 原文）** · `:1661` XREP CLOSED 行 · `:1665` 收账注 |
| `ai-docs/delivery/harness/xrep-REQUEST.md` | `b218924b`（210） | **`:38` 本 GAP 字面命中**（checklist 锚引）· **`:93` XR-2 reg-window 二择一（同句字面）** · `:198` §9-EXEC 择形② |
| `apps/api/test/sse-push-notify.proof.ts` | `3056a929`（934） | `:924` GAP 诚实 PIN · `:539`-`:579` P-2b 单元臂（G1 cadence/G2 notify 主推）· `:47`-`:48` raw 需 isolated `DATABASE_URL`（隔离形） |
| `apps/api/test/ha-2-drain.proof.ts` | `1be2f6c7`（317） | `:24`-`:50` fake sink · `:62`-`:70` `controlledFetch` · `:292`-`:293` `fakeHealth as never` + `new HealthController` 直构先例 · `:296` 首断言——**直构形本 rev 不采，仅借 fake sink 形制** |
| `apps/api/test/sse-delta-arm.proof.ts` | `8a6ff458`（319） | `:44`-`:53` `fakePgClient`（LISTEN/pg_trigger 应答）· **`:81`-`:93` `startPump` 直驱形** · `:112` 真 `new SseNotifyService({ connect: async () => { client = fakePgClient(); return client; } })` · `:120` `Promise.race([notify.whenHealthy(), sleep(3000)])` · `:137` `await notify.stop()` |
| `apps/api/test/sse-listen-probe.proof.ts` | `2df7c53e`（201） | **LP-1 `:76`-`:101` 半开探针超时单击判负→`health=false`+等待者全醒+释放恰一次** · **LP-4 `:179`-`:197` `stop()` 后探针 timer 清零+计划内关停零降级日志** · 注册 `apps/api/package.json:105` |
| `apps/api/test/last-event-id.proof.ts` | `cdfc8567`（36） | **`:2` `Fail-closed SSE cursor parser. No database.`**（keyless 门形） |
| `apps/api/test/uc-e2e-010-sse-resume.proof.ts` | `680fbd66`（320） | `:260` 断线窗 append（客户端不在线）· `:310` `GAP-UC010-UI` PIN |
| `apps/api/package.json` | `388a95fa`（154） | `:83` `prove:ha2-drain` · `:101` `prove:last-event-id` · `:103` `prove:sse-push-notify`（隔离形）· `:105` `prove:sse-listen-probe` · `:106` `prove:s4b-delta-arm`（§2-5 keyless 四件 vs 隔离形一件） |
| `scripts/ai-docs/public-text-policy.mjs` | `05083d8a`（574） | `:39` `TEXT_EXTENSIONS`（含 `.txt`·**不含 `.log`**）· `:276` `const MAX_FILES = 2_461`（cap·**Ban 自升**；`origin/main` 同值 `:282`） |
| `ai-docs/delivery/receipts/ssepush-notify/judgment-run-stdout-attempt1.log` | —（log） | `:90` `GAP-SSEPUSH-REG-WINDOW` PIN 同句（**第三收据**·登记非证明） |

### 0.2 机制逐行现形（三控制器 → 泵 → notify → 取数 → 兜底）

**(a) D5 注释区（`sse-pump.ts:23`-`:25` 逐字）**：
`时序纪律(D5,worker listener :112 先例):每轮先注册 waiter 再取数,消灭注册窗竞态;notify 为 lossy hint,误醒空手 ping、漏醒由兜底收。Last-Event-ID 重放语义零改(initial catch-up 与 tail 取数均为 seq>lastSeq 同一形状)。`

**(b) D5 先例（`job-wakeup-listener.ts:111`-`:115`）**：先 `LISTEN`，再 `onWake()` reconcile——「更早的 scan 与 LISTEN 之间的提交不可能被漏」，与泵「先注册 waiter 再取数」同构；D5 是同一纪律在 SSE 泵的行使。

**(c) 泵入口/首次注册序（逐行）**：`:84` 取 notify（注入优先·`?? getSseNotify()` 回退）→ `:87` `reply.hijack()` → `:88` `writeHead(200, text/event-stream)` → `:123`-`:124` registry 注册（HA-2 排水旗）→ `:126` `lastSeq = o.initial.lastId` → `:136` close 即醒钩 → **`:169` `let wait = notify.waitFor(o.streamKey)`（先注册）** → **`:170` `emit(o.initial.rows)`（后重放 catch-up·同步段无 `await`）** → `:173` 进循环 → `:174`-`:176` 同步读 `health()` 定 `waitMs`（健康=30_000/退化=2_000）→ `:178`-`:180` race promise+兜底计时器（unref）→ `:181`-`:184` close/delta/notify 三唤醒钩（`notifyWoke` 逐轮重置）→ `:185` `await race` → `:188` 必清计时器 → **`:189` `wait.dispose()` → `:191` `wait = notify.waitFor(o.streamKey)`：两行之间**无任何 `await`、无宏任务边界**——NOTIFY 回调只能在 JS 栈让出后投递，故该段结构性零窗（区1 零窗的关键环）** → `:192`-`:196` delta-only 免取数 → **`:197`-`:199` `more = await o.fetchMore(lastSeq)`（后取数）** → `:205` `more === null` 即 break（调用方主动收尾）→ `:207` 有行即 emit / `:208` 空手 `: ping`（**无 id**）→ 回到 `:173`。**泵侧可插入点**：`「注册后立即补一次取数」= `:170` emit 之后、`:173` while 之前（同段无 `await`，故可把区2 收窄至 ≈0）；该改法越本刀授权。**

**(d) 窗口的精确边界（控制器侧，非泵内）**：**窗起点 = initial 语句开始（不是 SELECT 返回）**。三控制器同形——`interview.controller.ts:264` `const initial = await this.interviews.events(req.principal, id, lastEventId);` → `:268` `await pumpSseEvents({...})`；quiz `:59`→`:62`；diagnosis `:57`→`:60`。service 侧：interview 为 `guardInterviewPrivacy`+行取数（`interview.service.ts:913`-`:914`），quiz/diagnosis 为 own 校验+行取数**两查询**（`quiz.service.ts:134`+`:136`，`diagnosis.service.ts:107`+`:109`），另加 `asPrincipal` 包装。故窗口墙钟 = **initial 的全部 DB 往返（2 查询+包装）** + 返回后到 `:169` 前的微任务切换（泵体自 `:87` 同步执行至 `:185`，中间无 `await`；`:170` catch-up emit 亦同步）。量级 ms（与 checklist「~ms 级」一致），远非 30s。

**(e) 提示掉地的机制依据（`sse-notify.service.ts`）**：`:197`-`:209` `waitFor` 把 waiter 放进 `router` 的 per-streamKey `Set`；`:309`-`:319` `onNotification` 收到裸 stream_key 后 `const set = this.router.get(key); if (!set) return;`——**注册前无 Set/Set 空 ⇒ 提示静默丢弃**（lossy hint 的字节级含义）；NOTIFY 语义本身**不排队、不重放**（无队列缓冲，回调只在投递当刻对在册 Set 生效）。

**(f) 零丢失的机制依据（取数谓词 + 承重前提）**：`interview.service.ts:914` / `quiz.service.ts:136` / `diagnosis.service.ts:109` 均为 `seq > $2 ORDER BY seq`；`:126` `lastSeq = o.initial.lastId` 是**客户端游标**（`parseLastEventId` 读 `last-event-id` header），服务端游标由 catch-up/tail 的 `emit` 内 `:131` `lastSeq = Math.max(lastSeq, e.seq)` **单调推进**（initial 行重放即推进）。`:199` 每轮以 `lastSeq` 取数。
**承重前提（机制层·非本刀自建）**：`appendEvent` 以同 stream `pg_advisory_xact_lock(hashtext($1))` 串行（`packages/db/src/interview/interview-event.ts:22`）+ 同事务 `INSERT … SELECT COALESCE(MAX(seq),0)+1 … RETURNING seq` 原子分配（`:30`-`:31`）+ 表级 `CONSTRAINT uq_event_seq UNIQUE (stream_key, seq)`（`packages/db/migrations/0001_baseline.sql:38`-`:45`）→ 同流 seq 单调不重、提交序即 seq 序。故「initial 读到 max=m」之后提交的行 seq>m，下一轮 `seq > lastSeq` 必取回。
**零丢失限定**：该结论**以「泵未提前收尾」为前提**——close/drain/deadline/背压/fetch 抛错任一退出路径即停止交付（连接已断或调用方主动收尾，客户端凭 Last-Event-ID 重连续推，属既有语义，不属本窗丢失）。
**读数口径**：窗口墙钟为**解析上界**（initial 的 DB 往返 + 返回后微任务切换），**非实测值**；本卷不以窗时长作任何断言。兜底臂是唯一可能迟到的唤醒源，但**不是唯一可能送达的路径**（notify 若在 `:169` 后到达则立即取数，§0.2-g）。

**(g) 承接链两形**：
- **立即承接**：notify 在 `:169` **之后**（异步等待区间内）到达 → waiter resolve；即使 `:184` 的 `.then` 尚未挂上，已 resolve 的 promise 也会在挂上后立刻触发 → race 立即醒 → `:191` 重注册 → `:199` 取数 → `:207` emit。**不等兜底**。（`:170` catch-up emit 是**同步段**，期间不可能收到 NOTIFY 回调——窗口不存在「catch-up 期间承接」分支。）
- **兜底承接**：notify 在 `:169` 之前掉地 → 本轮 race 由 `:179` 计时器 settle → `:199` 取数 → emit。健康通道 `waitMs=30_000`（生产钉值，`:70`/`:175`），退化通道 `DEGRADED_POLL_MS=2_000`（`:71`/`:176`）。
- **终态不例外**：窗内终态事件同样经任一承接臂 emit，`:132` `done=true` 后帧边界退出，`:222` 单点 `end()`。

**(h) 两区结论（本卷刀型的依据）**：

| 区 | 位置 | 结构性状态 | 可证形式 | 本卷臂 |
|---|---|---|---|---|
| 区1 尾循环取数窗 | `:191` 重注册 vs `:199` 取数（且 `:189`→`:191` 无 `await`） | **零窗**（先注册后取数，D5 对偶；同步段消灭宏任务插入面） | **证伪式**：注入在途事件→必须命中已注册 waiter→即时送达；若序回归则退化为兜底时延（判决性） | RW-1（+RW-3 立即承接） |
| 区2 控制器 pre-fetch 边界窗 | initial 语句开始（`:264`/`:59`/`:57`）→ `:169` 注册 | **存在**（窗起点在控制器 pre-fetch，泵体同步故不含「取数后注册」间隙）。**泵侧『注册后立即补一次取数』（`:170` 后 `:173` 前）可廉价收窄至 ≈0；彻底消除=改控制器序（先注册后取数）——均越本刀授权，本刀只证不修** | **承接式**：窗内提交→提示掉地→兜底送达，零丢失/零重放/有界时延 | RW-2/RW-4/RW-5/RW-6 |

### 0.3 checklist `:1660` 原文（逐字·不洗）

`- [ ] **STILL OPEN（行登记 · 均不关闭）**：**GAP-SSEPUSH-PROD-30S**（生产兜底 30s 为源钉值 HEALTHY_FALLBACK_MS=30_000 · 行为证明=注入 250ms 加速 + HTTP 2.8s 静默窗旁证 · 30s 原值级生产读数未采——登记不关闭）· GAP-SSEPUSH-FULL-E2E（full e2e 三流 interview/quiz/diagnosis 终态段未跑）· GAP-SSEPUSH-QUIZ-DX-HTTP（quiz/diagnosis 共 pump 共表码面单源+类型检查 · HTTP 级逐实体流证明未单列）· **GAP-SSEPUSH-REG-WINDOW（控制器 initial 取数→pump waiter 注册 ~ms 级窗口 · 窗内事件由兜底收 ≤30s 非丢失 · 退化态 2s 收）** · g7SuiteGreen=false 维持.`

### 0.4 xrep 旁证引证（旁证≠证明·零重叠依据）

- `xrep-REQUEST.md:93`（XR-2）预注册**二择一**：①尾窗容忍——窗内事件由 `HEALTHY_FALLBACK_MS=30s` 兜底收（判定窗上限=30s+ε，窗内完到不判丢）；②消除——待首帧/心跳到达后才开始 INSERT（发射窗与注册窗序倒置）。
- `xrep-REQUEST.md:198`（§9-EXEC）实录：**「XR-2×2（reg-window 择形②消除=首帧先到后发射+逐条 <500ms·实测读数 2.8-11.1ms 原样透出）」**。
- 判定：xrep **择形②=测试侧绕行**——发射被推迟到首帧之后，窗口不落入被测路径，故 xrep 未产生「窗内事件」读数，**未证明本 GAP**；其收据 `ai-docs/delivery/receipts/sse-xrep/04-neighbor-sse-push-notify.log:132` 仍承 PIN。**本刀补的正是 xrep 明确绕开的那一面**（零替代、零互借）。

---

## §1 修法（恰 1 具名 proof=`sse-reg-window` · RW-0…RW-6 七臂 · keyless 单元缝 · 零产品码触 · 零 invent covered）

**修法形状**：新增 `apps/api/test/sse-reg-window.proof.ts`——纯单元缝，**零 DB 连接零模型外呼零 HTTP 起服**：**真 `SseNotifyService({ connect: async () => { client = fakePgClient(); return client; } })`**（沿 `sse-delta-arm.proof.ts:44`/`:112` 先例；healthy 臂**先 `await Promise.race([whenHealthy(), sleep(3000)])` 并断言 healthy**，每臂收尾 `await notify.stop()`；RW-4 用 `connect: () => new Promise<never>(() => {})` 保持 `health=false`）· fake sink（writes/writeTimes/**eventSeq 有序事件日志**/endCount，沿 `ha-2-drain.proof.ts:24`-`:50`）· 内存行存储（snapshot/fetch 两法复刻 `seq>lastId` 谓词）· `fetchMore` 契约钉 `(lastSeq: number) => Promise<{ rows: SseEventRow[] }>`（**恒返对象，空集返 `{ rows: [] }` 而非 `null`**；`null` 只表调用方主动收尾——`sse-pump.ts:205` `if (more === null) break`，proof 侧永不返 null）· `pumpSseEvents` 直驱（`registry: createSseRegistry()` 每臂独立，防单例串臂；`notify`/`registry` **逐臂显式注入**，§6 自证）。**零控制器 import**：quiz/diagnosis/interview 一律不 import，静态接线断言只 `readFileSync` 读源文本（§1.1 RW-6、§6）。注册面：root `package.json` 1 行（`sse-reg-window:prove`）+ `apps/api/package.json` 1 行（`prove:sse-reg-window`）；**不入 `scripts/run-e2e-isolated.mjs`**（纯单元 proof 先例 `prove:ha2-drain`/`prove:s4b-delta-arm` 均不入，§0.0/§2-4）。

**等价类申明（为什么无需真库）**：边界窗的泵侧输入只有 `initial {lastId, rows}` 与 `fetchMore`。真库版「initial 语句开始后、`:169` 前提交」在泵看来等价于「调用前固定 initial、随后行可见」；NOTIFY 掉地等价于「注册前 `fire()` 命中 0 waiter 且不排队（`:309`-`:319` 无队列缓冲）」。故 RW-2/RW-6 的注入是**该窗口的精确等价类**，不引入时序抖动，也不依赖隔离 PG（§1.3 否决真库臂）。

### 1.0 刀型二择一（建议=乙·双臂复合 · 理由）

| 选项 | 形状 | 判决 |
|---|---|---|
| 甲 · 单臂「承接只证」 | 仅 RW-2/RW-4/RW-5：窗内事件被兜底/立即送达、零丢失 | **否决**——**只证结果不证前提、不锁 D5 序**：「不丢」是结果，既不能确立「窗口存在」，也不能确立「泵内先注册后取数」；等于用结果掩盖前提，且不具证伪力。 |
| **乙 · 双臂「证伪 + 承接」（建议）** | RW-0/RW-1/RW-3 证伪区1（泵内零窗、即时承接）；RW-2/RW-4/RW-5/RW-6 承接区2（边界窗 lossless 有界） | **建议**——同时钉死两件事：①D5 在泵内真的行使（先注册后取数，序回归即红）；②残留窗在控制器边界、且该窗行为与 checklist 措辞逐字一致（≤30s 健康/2s 退化、非丢失）。这正是「证伪式证明」在区1 的正当用法，同时不给区2 伪造「零窗」结论。 |
| 丙 · 纯证伪「断言窗不存在」 | 只断言全局无窗 | **Ban**——控制器边界窗在树，断言全局无窗即与 `:264`→`:268` 源码及 checklist 原文矛盾=伪造绿。 |

**机制未完全闭合的判断依据**：若 initial 取数已移入泵（即 `pumpSseEvents` 内部自行 `fetchInitial`），则区2 消失、刀型可退化为纯证伪；本树三控制器均为**泵外取数**（§0.2-d）、且 `SsePumpOptions` 源内无 `fetchInitial/loadInitial`（RW-0-5 源 token），故不成立。EXEC 期若发现该结构已变（在飞刀把取数移入泵），触 §8「机制不满足/结构已闭合」→ 红停上报，改 docs 钉刀，**不得**为凑臂虚构窗口。

### 1.1 七臂设计（逐臂注入点/断言/判决性）

**RW-0 · 结构静态臂（5 断言·把 §0.2 的「现形」变成机器可判·代码 token 锚优先）**
1. **RW-0-1** 首次注册先于 catch-up：源内 `notify.waitFor(o.streamKey)` **恰两处**，首处（`:169`）index < `emit(o.initial.rows)` index。（code token 锚核：两处逐字 `notify.waitFor(o.streamKey)`，非行号硬绑。）
2. **RW-0-2** 下一轮注册先于取数：第二处（`:191`）index < `await o.fetchMore(lastSeq)` index（两处位次即 D5 序的机器判据，不依赖行号；code token 锚核）。
3. **RW-0-3** 边界窗在控制器（语义正则·**per-controller 作用域**）：`const\s+\w+\s*=\s*await\s+this\.\w+\.events\(` 在 interview/quiz/diagnosis 三文件**各恰 1 命中**，且同文件 `pumpSseEvents({` 的选项块内含 `initial`（三查聚合为一断言）。
4. **RW-0-4** 双钉值在场：源内含 `const HEALTHY_FALLBACK_MS = 30_000` 与 `const DEGRADED_POLL_MS = 2_000`。
5. **RW-0-5** 类型面（区2 判据）＝**源 token 断言**：读取 `sse-pump.ts`，截取 `export interface SsePumpOptions {` 至首个行首 `}` 的接口块，断言 `!/\bfetchInitial\b|\bloadInitial\b/.test(block)`。**注**：`Extract<keyof SsePumpOptions, 'fetchInitial'|'loadInitial'>` 求值为 `never` 仅为**类型检查旁证**（`pnpm -C apps/api typecheck`，§2-5），**不作 proof 断言**——swc 转译只剥类型不做类型检查，该表达式不可在 proof 内运行。

**PA-0 · 共享前置门（1 断言·所有 healthy 臂起泵前必做；每臂独立 notify 实例各执行一次，全卷只计 1 条）**：`const h = await Promise.race([notify.whenHealthy(), sleep(3000)])`，断言 `h` 为 `{healthy:true}` 且 `notify.health().healthy === true`（**有界等待，禁无界 `await whenHealthy()` 挂死门**；沿 `sse-delta-arm.proof.ts:120` 同形）。RW-1/RW-2/RW-3/RW-5/RW-6 的 `fallbackMsHealthy` 判据（60ms/1000ms）均以本门成立为前提；RW-4 不执行（connect 永挂，`health` 恒 false）。

**RW-1 · 证伪臂·泵内尾窗零窗（3 断言·真 notify·前置 PA-0）**
- 前置：PA-0；`fallbackMsHealthy=1000`。
- 注入点：`fetchMore` **第一次在途时**（`until(() => fetch.inFlight === 1)`；此时 `:191` 已注册 waiter#2、`:199` 尚未返回）落库 seq=1 并 `fire()`；**随即** `resolveNext({ rows: [] })`（钉死 fetch#1 resolve 时机，不给计时器插队）。
- 断言：**RW-1-①** `fire()` 前后 `waitingCount()` 由 **1 → 0**（提示命中在册 waiter 并自摘除，不掉地；`onNotification` 同步 resolve，可当拍读）；**RW-1-②** fetch#1 在飞时 `waitingCount()===1`（注册先于取数；waiter#1 已于 `:189` 摘除）；**RW-1-③** 事件送达 **<300ms**（判决性：若序回归为「先取数后注册」，提示掉地，只能等 1000ms 兜底 → 红）。
- 读数 PIN：`zero_window_delivery_ms`。

**RW-2 · 承接臂·健康通道窗内事件由兜底收（5 断言·真 notify·前置 PA-0）**
- 前置：PA-0（60ms 判据以 healthy 为前提）；真 `SseNotifyService({ connect: async () => { client = fakePgClient(); return client; } })`（**闭包捕获句柄**，简写 `connect: () => fakePgClient()` 丢 `client` 句柄 → 无法 `emit`）；探针 key 与主臂 key 相异。
- **RW-2-①a**（NOTIFY 不排队·主臂机制断言）：主臂 `fire()` 时 `waitingCount()===0`，且 fire 后仍 0（无在册 waiter=提示掉地；服务内无 drop 计数器可读，掉地由 ①b + 本断言共同确立）。
- **RW-2-①b**（负向探针·定界反证）：**无 waiter 时** `client.emit('notification', { channel: SSE_NOTIFY_CHANNEL, payload: probeKey })` → **随后** `const w = notify.waitFor(probeKey)` → `Promise.race([w.promise, sleep(120)])` 判**未 resolve**（**≥100ms 不 resolve**；证明 NOTIFY 不携带队列，掉地即永久掉地）；探毕 `w.dispose()`。**`sleep(120)` 为负向探针的定界上界（120−100=20ms 容差），属 §1.1 纪律的 Ban 豁免。**
- 注入点：内存快照 `{lastId:0, rows:[1,2]}` → 快照后落库 seq=3 → `fire()`（注册前，0 waiter）→ 启动泵（`fallbackMsHealthy=60`）。
- **RW-2-②** seq=3 送达 **elapsed ≥40ms 且 ≤1000ms**（**下沿=判别边**：60ms 兜底 vs 即时承接；**上沿=非判别容差边**，防 CI 抖动，不作 cadence 判据）。
- **RW-2-③** 写出帧 `id: (\d+)` 子序列恰 `[1,2,3]`（`:208` `: ping` 无 id，可夹在中间但不入子序列；catch-up 不重放、窗行不丢、零间隙零重复）。
- **RW-2-④** close 后泵返回且 `waitingCount()===0`（无 waiter 泄漏；close 路径按 `:222` 守卫不 end，end 恰一次由 RW-5 承担）。

**RW-3 · 立即承接臂·注册后提示即时取数（2 断言·真 notify·前置 PA-0）**
- 注入点：PA-0 后 `const p = pumpSseEvents(...)` 返回（泵体已**同步**执行到 `:185`，`:169` waiter 已在册）后**同 tick 立即** `fire()`（行 3 已在库）；`fallbackMsHealthy=1000`。
- 断言：**RW-3-1** 送达 **<300ms**（判 `fallbackMsHealthy=1000`，证明「立即取数承接」而非兜底）；**RW-3-2** 恰一次写出 `id:3`。
- 该臂与 RW-2 合起来覆盖「提示在注册前/后」两分支，即 `:23`-`:25` 注释的完整语义；与 `sse-push-notify` P-2b 的增量见 §1.2。

**RW-4 · 退化臂·2s 轮询收窗内事件（2 断言·真 notify·connect 永挂·无 fire·不执行 PA-0）**
- 形制：`new SseNotifyService({ connect: () => new Promise<never>(() => {}) })`（`establish` 永挂 → `health()` 恒 `{healthy:false, reason:'listen_down'}`，**确定性保持**退化，不依赖 fake health 读数）。**本臂无 client、无监听、无 NOTIFY 注入**——「fire 前置」删除：永挂 connect 下 `client.emit` 不可得，本臂只证**退化 cadence 路径**，不证「掉地」。
- **泛型注**：裸 `new Promise(() => {})` 推为 `Promise<unknown>`，不满足 `connect?: () => Promise<Client>` 的 typecheck；必须写 `new Promise<never>(() => {})`（`never` 可赋任意 `Client` 且永挂）。
- 注入点：快照后落库 seq=1（不 fire）；泵 `fallbackMsHealthy=60`（应被忽略，因 `health=false` 走 `DEGRADED_POLL_MS`）。
- 断言：**RW-4-1** `notify.health().healthy===false`，且送达落 **≥1900ms 且 ≤5000ms**（首 tick=2_000，证明走 `DEGRADED_POLL_MS` 而非 60ms 注入值；**上沿非 cadence 判据**——本仓 proof 零 fake timers（`useFakeTimers` 全树零命中·亲证），真时钟下上沿只作容差）；**RW-4-2** close 后 `waitingCount()===0`。**本臂不调 `whenHealthy()`**（永假且无界，禁）。
- 读数 PIN：`degraded_delivery_ms`。

**RW-5 · 终态窗内事件臂（2 断言·真 notify·前置 PA-0）**
- 注入点：PA-0 后，快照后落 seq=1、`kind=report_ready`（终态）；注册前 `fire()` 掉地；`isTerminal` 认该 kind；`fallbackMsHealthy=60`。
- 断言：**RW-5-1** 兜底送达终态帧（不漏终态、不空转到 deadline）；**RW-5-2** `end()` 恰一次、无写后半截（沿 `ha-2-drain` 的 writesAfterEnd=0 形）。

**RW-6 · 边界窗镜像泵臂（静态接线断言 14 + 动态臂 4 = 18 断言·零控制器 import）**

**形制（乙案·不再声称真控制器直构）**：静态块只 `readFileSync` 读 `quiz.controller.ts`/`diagnosis.controller.ts`/`sse-pump.ts` 源文本，**不 import 任何控制器**；动态块直接 `pumpSseEvents` 直驱（沿 `sse-delta-arm.proof.ts:81`-`:93` 形），注入真 notify/独立 registry/`fallbackMsHealthy=60`。**同形传递逻辑**：静态断言锁定「两控制器 `pumpSseEvents` 选项块 ≡ proof 直驱块（六键逐项同形）」，动态臂在该同形块上跑 → 窗内事件行为结论传递到两控制器接线面；**不声称控制器被真实构造/执行**。镜像泵形下 `fallbackMsHealthy=60` 与 `client.emit` 掉地均为**有效注入**，不存在「控制器无法透传→不可达」问题（该处方全删）。

**静态接线断言（每控制器 7；quiz `:61`-`:68` + 收口 `:69`，diagnosis `:59`-`:66` + 收口 `:67`）**：
- **RW-6-S1** 选项块键集**恰六** `{reply, reqRaw, streamKey, initial, fetchMore, isTerminal}`（无第七键，尤其**无 `deltaSource`**）。
- **RW-6-S2..S7** 六键逐项同形：`reply`、`reqRaw`、`streamKey`、`initial`、`fetchMore`、`isTerminal` 各自**键名在场且值形类别一致**（`reply` 标识符；`reqRaw:` 单表达式（成员取用）；`streamKey:` 单表达式（标识符/字面量）；`initial` 简写属性；`fetchMore:` 单参箭头 `(lastSeq) =>`；`isTerminal` 标识符）——**同形=键名+值形类别，不比对表达式体**（控制器为 `this.quizzes.events(...)`，proof 为内存存储 `store.fetch(...)`；体等价由 RW-6 动态臂的等价类承担，§1）。
- 每控制器 7 条，两控制器共 **14** 条（`N=14`）。

**动态镜像泵臂（4 断言；`M=4`；起泵前 PA-0）**：
- 注入序（逐字）：PA-0 成立 → 内存快照 `{lastId:0, rows:[seq1]}` 记 `snapshotSeq` → 落库 seq=3 记 `insertSeq` → `client.emit('notification', { channel: SSE_NOTIFY_CHANNEL, payload: key })` 记 `fireSeq`（此时 0 waiter）→ `pumpSseEvents({...同形六键, fallbackMsHealthy:60, notify, registry})` 起泵（`:88` writeHead 记 `writeHeadSeq`）→ 后续 `fetchMore` 按 `seq > lastId` 返回存储行。
- **RW-6-M1** 有序事件计数（**不看墙钟严格 >**）：`snapshotSeq < insertSeq < fireSeq < writeHeadSeq` 且 `waitingCountAtFire===0`（注入窗口先于注册；同毫秒也不会假绿，因判的是单调计数器而非时间戳）。
- **RW-6-M2** 窗行零丢失：`seq=3` 经 60ms 兜底送达，`elapsed ∈ [40, 1000]ms`。
- **RW-6-M3** 写出 `id` 子序列恰 `[1,3]`（快照不重放、窗行不丢、零重复）。
- **RW-6-M4** close 后泵返回、`notify.waitingCount()===0`、`registry.count()===0`、`endCount===0`（close 守卫原值，end 恰一次归 RW-5）。
- **动态臂无控制器参与**：`initial` 由内存快照给出、`fetchMore` 由存储给出；这正是控制器 `:59`→`:62` / `:57`→`:60` 的泵侧等价类（§1 等价类申明）。

**「臂 → 断言 → 期望值」总表（38 断言 = 静态 19 + 动态 19）**：

| 臂 | 断言（编号） | 期望值 |
|---|---|---|
| RW-0（静态 5） | 0-1 / 0-2 / 0-3 / 0-4 / 0-5 | 首注册 index<catch-up；二注册 index<fetchMore；三控制器各 1 命中且选项块含 initial；双钉值 `30_000`/`2_000` 在场；`SsePumpOptions` 块无 `fetchInitial/loadInitial` |
| PA-0（动态 1·共享） | PA-0 | 3000ms 有界 race 内 `healthy=true`（RW-1/2/3/5/6 的前置；RW-4 不执行） |
| RW-1（动态 3） | ① / ② / ③ | `waitingCount` 1→0；fetch#1 在飞时 `waitingCount===1`；送达 <300ms |
| RW-2（动态 5） | ①a / ①b / ② / ③ / ④ | fire 时及 fire 后 `waitingCount===0`；探针 120ms 内不 resolve（≥100ms）；送达 ∈[40,1000]ms；id 子序列 `[1,2,3]`；close 后 `waitingCount===0` |
| RW-3（动态 2） | 3-1 / 3-2 | 送达 <300ms；`id:3` 恰一次 |
| RW-4（动态 2） | 4-1 / 4-2 | `healthy===false` 且送达 ∈[1900,5000]ms；close 后 `waitingCount===0` |
| RW-5（动态 2） | 5-1 / 5-2 | 终态帧经兜底送达；`end()` 恰一次、writesAfterEnd=0 |
| RW-6（静态 14+动态 4） | S1 / S2-S7（×2 控制器）/ M1-M4 | 键集恰六且无 deltaSource；六键逐项同形；`snapshotSeq<insertSeq<fireSeq<writeHeadSeq` 且 fire 时 waiting 0；送达 ∈[40,1000]ms；id 子序列 `[1,3]`；收尾 waiting/registry/endCount 全零 |

**确定性纪律（全臂）**：等待一律 `until(cond, timeout)` 轮询（沿 `sse-delta-arm.proof.ts` 形），**Ban 裸 sleep 硬等**；**豁免**：负向探针以 `Promise.race([promise, sleep(N)])` 断言「N 内不 resolve」的**定界反证**（此处 sleep 是上界而非等待路径；RW-2-①b 的 `sleep(120)` 对 `≥100ms` 判据），以及 `whenHealthy` 的 3000ms 有界 race（同属上界保护）。时间断言只用于**判决性判别**（RW-1-③/RW-3-1 的 <300ms vs 1000ms；RW-2-② 下沿 40ms；RW-4-1 下沿 1900ms），**上沿一律容差边（非判据）**；所有读数以 `PIN` 行原样透出（不取整不修饰）。**臂收尾纪律**：每臂 `await notify.stop()`（清 `sse-notify.service.ts:369`-`:373` 10s 探针 timer 与退避 timer），`createSseRegistry()` 每臂独立。**预计 38 断言 · 预计墙钟 ≈3.4s**（RW-1 0.3s + RW-2 0.12s+探针 0.12s + RW-3 0.3s + RW-4 2.0s + RW-5 0.06s + RW-6 0.12s + 组装/收尾；**Ban 为压时改时间钉值**——钉值是判据不是预算）。**断言灵敏度自检（必做）**：临时把 `:191` 与 `:199` 换位（注册移到取数后）→ 须见 **RW-0-2 + RW-1-①②③ 四红**（PA-0 与序无关，应保持绿；若随序同红，如实一并登记）→ **还原**并 `git diff --exit-code -- apps/api/src/platform/sse-pump.ts` 亲证**零残留**，再复跑全绿；变异读数与原样 diff 入收据。

### 1.2 非替代申明（零重叠核·reason 级可分）

| 既有面 | 它证什么 | 为什么不可替代本刀 |
|---|---|---|
| `sse-push-notify.proof.ts` P-2b（`:539`-`:579`） | 无事件时兜底 cadence=注入值；notify 到达即醒（<1000ms） | 不注入「initial 快照→注册」窗内事件；不断言提示掉地；不区分两区结构；不锁 D5 序 |
| 同 proof `:924` | 本 GAP 的**诚实 PIN**（打印登记，非断言） | PIN≠证明；本刀把该 PIN 转为可执行断言 |
| xrep XR-2（`:93`/`:198`） | 跨副本延迟；**择形②把发射推迟到首帧后** | 绕行窗口，零窗内读数；本刀正面注入窗内事件 |
| `uc-e2e-010-sse-resume.proof.ts:260` | 客户端断线期间的 append → Last-Event-ID 重连重放 | 客户端不在线的**断线窗**；本刀=客户端在线但服务端 waiter 未注册的**注册窗**，两个不同窗 |
| `sse-delta-arm.proof.ts` | delta 帧唤醒/免取数/ring 丢旧 | 不涉 initial 边界窗；本刀零 deltaSource |
| `sse-listen-probe.proof.ts`（LP-1 `:76`-`:101`、LP-4 `:179`-`:197`；注册 `apps/api/package.json:105`） | **LISTEN 活性探针**：半开连接超时单击判负→`health=false`+在册等待者全醒；`stop()` 后探针 timer 清零 | 通道健康探针面，无 initial 快照、无注册窗注入、无 `seq>lastSeq` 取数断言；本刀仅借其「注入 `probeIntervalMs/probeTimeoutMs` 小值 + stop 收尾」形制 |
| `ha-2-drain.proof.ts` | 停机排水/end 恰一次/受控取数 | 排水语义；本刀仅借其 fake sink 形制（只读引用，零改动）。**直构控制器形本 rev 不采**（乙案） |
| `uc-e2e-017-orphan-http-sse.proof.ts` | 429 孤儿槽 | 槽口面；与本窗零交集 |
| `last-event-id.proof.ts` | 游标解析 fail-closed | 纯解析面，无泵无窗；本刀只作 keyless 邻面门 |

**RW-3 增量注**：P-2b 已证「notify 到达即醒（<1000ms）」的**稳态** cadence/主推，但未涉 initial 边界、不锁「注册先于取数」序；RW-3 在同一 initial 边界语境下 fire，增量=**时序锁定**（提示在 `:169` 之后由已注册 waiter 即时承接、不依赖兜底），与 P-2b 读数零重叠。

### 1.3 否决表（落选项诚实留痕）

| 落选项 | 否决/登记理由 |
|---|---|
| 真隔离 PG + 真 LISTEN 注入窗内事件 | 窗口由 DB 往返决定，无法确定性把提交卡在「快照后、注册前」；需隔离库+PG，违背 keyless 小刀预算；泵侧等价类已精确（§1 等价类申明）。 |
| 控制器直构臂（`new QuizController(...)`，r1 形） | **乙案否决**：`QuizController`/`DiagnosisController` 模块 import 链经 `@UseGuards(PrincipalGuard)` 触 `principal.guard.ts:38` 模块顶层 `getSseNotify().whenHealthy()`（进程单例副作用，击穿 keyless）；且控制器选项块不含 `notify`/`registry`/`fallbackMsHealthy` 透传缝，「真控制器直构 + 注入 60ms」不可达。镜像泵形（静态同形 + 动态直驱）零 import、零副作用。 |
| HTTP/UI 级时序臂 | 需起 app+客户端，抖动大、判决力弱；窗在毫秒级不可控。 |
| 裸 sleep 硬等制造窗口 | Ban（沿 xrep `:93` 第三形禁令）；且 sleep 不保证落在窗内。负向探针的定界 race 除外（§1.1）。 |
| 纯证伪「窗不存在」 | 与三控制器泵外取数结构及 checklist 措辞矛盾（§1.0-丙）。 |
| 产品码修法（把 initial 取数移入泵以关窗） | 越界：本刀 docs/proof-only。**窗起点在控制器 pre-fetch**（`:264`/`:59`/`:57`→`:169`）；彻底消除=改控制器序（先注册后取数）；泵侧「注册后立即补一次取数」（`:170` 后 `:173` 前）可把区2 廉价收窄至 ≈0——**均越本刀授权，本刀只证不修**。 |
| 泵侧「注册后立即补一次取数」（产品码小改） | 收窄有效但仍是产品时序改动（每连接多一次取数、空取数也走 SQL）；越本刀授权，只登记不改。 |
| 改既有 proof/仪器 | Ban；只读引用其 harness 形制。 |
| 借 xrep 收据宣本 GAP 已证 | 旁证≠证明；xrep 明确绕行（§0.4）。 |
| 翻 checklist `:1660` 行 | 翻面权归协调方；本刀只产收据供评估（§2-5）。 |

---

## §2 验收门矩阵（起草门 4 门本 commit 适用 + EXEC 届树届时重 pin）

1. **docs:check（亲跑·EXIT 原值）**：`node scripts/ai-docs/check-docs.mjs` —— 本 rev 落卷前/后本树均 **EXIT=0 · scanned 2458**（亲跑）。cap=**2_461**（`scripts/ai-docs/public-text-policy.mjs:276` 亲证；`origin/main @99e4e3f38` 同值 `:282`）。本 rev 同件修订**净增 0**（仍 2458）。**cap 终值算式（按 `99e4e3f38` 重算）**：`origin/main` 较起草基 **+28 commit**、受管面 **additive +2**（`harness/cwn-REQUEST.md` + `harness/uc3m-REQUEST.md`）→ **rebase 后 2460**；EXEC **+1 proof → 2461 = cap 恰等（余 0）**；**收据落 `.txt` → 2462 越限**（∈`TEXT_EXTENSIONS`·policy `:39` 亲证）→ **一律 Ban `.txt` 收据，只落 `.log`**（∉扫描面不计）。**零步进**（不需 cap sanction）；EXEC 期若并线致 >2_461 → 触 §8「验收红不可修」停手上报，**Ban 自升**。
2. **PTP 公开文字政策（亲跑）**：`node scripts/ai-docs/public-text-policy.proof.mjs` **EXIT=0 12/12**（本 rev 落卷后亲跑，§7）。
3. **markers 五类 + 行首冲突标记（亲跑·改动集）**：词面运行时组装口径（`scripts/i6-239-gates.proof.mjs:159`-`:163`·卷内不复抄防自指）；起草/本 rev commit 改动集=本卷 1 件 → grep **零命中**；EXEC 期改动集=proof+两 `package.json` → 同检零命中。
4. **diff 面机检**：起草/本 rev commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 `.md`；EXEC 期=本卷+`apps/api/test/sse-reg-window.proof.ts`+root `package.json`+`apps/api/package.json`+`ai-docs/delivery/receipts/regw/*.log`（真跑收据·`.log` ∉`TEXT_EXTENSIONS` 不计扫描面）——**runner 零触**；多任何未登记 tracked 路径即停。
5. **EXEC 主门（届时）**：`pnpm -C apps/api prove:sse-reg-window` **EXIT=0**（**38 断言**全 PASS·PIN 读数入 `ai-docs/delivery/receipts/regw/*.log`）；**邻面 keyless 四件**（与本刀同形门）：`pnpm -C apps/api prove:ha2-drain` EXIT=0（`apps/api/package.json:83`）· `prove:s4b-delta-arm` EXIT=0（`:106`）· `prove:last-event-id` EXIT=0（`:101`；proof 首行 `No database.` 亲证 keyless 形）· `prove:sse-listen-probe` EXIT=0（`:105`；LP-1/LP-4 同形注入缝）。**`prove:sse-push-notify` = 隔离形·需 isolated `DATABASE_URL`（proof 头 `:47`-`:48` 亲证）·非本刀 keyless 门**——不列为本刀门、不计红；若协调方另授隔离环境可加跑（属另门，不改本刀判定）。`pnpm -C apps/api typecheck` EXIT=0（含 RW-0-5 类型面旁证：`Extract<keyof SsePumpOptions,'fetchInitial'\|'loadInitial'>` 求值 `never`）；新 proof eslint **零 warning**（lint 帽零新增——若触帽沿协调方 sanction 面，非起草刀自裁）。
6. **行/列冻结**：EXIT0=case≠covered · coveredCount=8 零翻转 · `:1660` 行**零改**（翻面权归协调方）· Ban 借本收据宣 GAP closed/窗已消除/生产 30s 已证（RW 读数=注入加速值，非生产原值级读数；后者归 `GAP-SSEPUSH-PROD-30S`）。**收据禁宣**：不得写「唯一残留窗」「区2 已动态证明/全局无窗」——本刀只证「窗内事件零丢失 + 有界承接 + D5 序在位」，**不证窗已消除**。

## §3 范围外（越界即 FAIL）

1. **产品码零触**：`apps/*/src`、`packages/*/src`、migrations 零 diff；关窗修法不在本刀。
2. **既有 proof 家族零触**：`sse-push-notify`/`ha-2-drain`/`sse-delta-arm`/`sse-listen-probe`/`uc-e2e-010`/`sse-principal-slot`/`sse-cross-replica`/`last-event-id` 只读引用。
3. **SSOT/登记文件零改**：checklist `:1660`（及同段五行）、`xrep-REQUEST.md`、case-matrix、current-runtime-truth、high-concurrency-review、台账卷零改；收据 additive 供协调方评估。
4. **runner/CI 零触**：`scripts/run-e2e-isolated.mjs` 零改（§2-4）。
5. **HA/SLO/发布叙事零涉**：Ban 借读数宣 HA、延迟 SLO、releaseEvidence、生产容量；Ban 借 `GAP-SSEPUSH-PROD-30S` 面互借。
6. **零 Key 零配置**：不读 `.env*`、不写 secrets、零模型外呼。

## §4 依赖

**①上游已满足**：机制源全在树（§0.1 blob 亲算）；三控制器同形；notify 服务与泵注入缝（`notify?`/`registry?`/`fallbackMsHealthy?`）齐备（`sse-pump.ts:56`-`:61`）；真 service + fake LISTEN client 形制先例在树（`sse-delta-arm:112`）。**②同文件并发**：起草/本 rev 仅 1 新 `.md`（同件修订），零交涉；EXEC 期仅两 `package.json` 注册区（高汇聚区）——§0.0 在飞复核必做，union additive 双留，`merge-tree` 预演。**③下游**：本刀收据供协调方评估 `:1660` 行；行翻面不在本刀。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 动主仓；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·环境红/臂红分口·Ban 改断言迁就）；Ban invent covered（含借 PIN 升格/翻 `:1660` 行）；Ban live key（零 Key 硬跑）；Ban 触产品码/迁移/runner/既有 proof/SSOT；Ban 裸 sleep 硬等（**豁免：负向探针 `Promise.race([promise, sleep(N)])` 的定界反证与 `whenHealthy` 3000ms 有界 race——sleep 仅作上界非等待路径；§1.1**）；Ban 纯证伪「全局无窗」（§1.0-丙）；Ban 把注入加速值（60ms/2s）宣为生产 30s 原值级读数；Ban 借 xrep 择形② 宣本窗已消除；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 `.env*`/写 Key 值入树入据；Ban 顺带升级依赖；Ban 借读数宣 HA/SLO/发布叙事/生产容量；**Ban 对 notify/registry 做 `as unknown as` 双层强转（伪造注入件/掩盖形状漂移）——notify/registry 类型缝一律 `as never` 单层；`sink`/`reply`/`client` 沿 `sse-delta-arm.proof.ts:52`/`:83` 先例允许 `as unknown as` 单次**；**Ban 收据落 `.txt`（cap 2462 越限；只落 `.log`）**；**Ban 收据宣「唯一残留窗/动态已证全局无窗」**；**Ban 为压时改时间钉值（钉值=判据非预算·§1.1）**。

**pins（十一值·零翻转·出处注：同值照抄 `ai-docs/delivery/harness/5e-cleanup-sweep-2-REQUEST.md:102` 常设 pins 列表（同段 `:98` Ban 翻 pins；`:151` 十一值逐字同句），非本卷自建 SSOT）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
**本卷附加钉**：Not HA · keyless（零 DB 连接/零模型/零网络/零控制器 import）· 本窗=**容忍不消除**（产品侧原样，零产品码触）· 30s=源钉值静态断言而非生产原值级读数 · `:1660` 行零改 · 窗口机制=两区结构（区1 零窗/区2 边界窗）措辞冻结 · 窗时长=解析上界非实测。

## §6 keyless 判定 + cap 预算核 + 零重叠核 + est live=0

- **keyless 判定=真**：proof 仅 import `sse-pump.ts`（及其静态依赖 `sse-notify.service.ts` 的**模块加载**）与 `sse-registry.ts`；notify=**真 `SseNotifyService({ connect: async () => { client = fakePgClient(); return client; } })`**（沿 `sse-delta-arm:112`），sink/存储全 fake；零 `@meetwise/db` 连接、零 PG、零 HTTP 起服、零模型外呼、零环境变量/Key。
- **零控制器 import·零 PrincipalGuard 触面（本 rev P1）**：**不 import `quiz.controller.ts`/`diagnosis.controller.ts`/`interview.controller.ts`**——镜像泵形下无需 import；RW-6 静态接线断言只 `readFileSync` 读源文本。故 `quiz.controller.ts:4` 的 `PrincipalGuard` import 链不被加载，`principal.guard.ts:38` 模块顶层 `getSseNotify().whenHealthy()` **零触面**（该语句 import 即起进程单例 LISTEN 尝试，是 r1 直构形的 keyless 破面）。`interview.controller.ts:275`-`:276` 的 `getSseNotify()` 亦零触。
- **每臂注入自证（必做·防 `??` 回退破 keyless）**：`sse-pump.ts:84` `o.notify ?? getSseNotify()` / `:85` `o.registry ?? getSseRegistry()`——漏注即静默起进程单例/真 LISTEN 池（首个 `waitFor` 即 `ensureStarted`→建池）。故每臂：①显式传 `notify`/`registry`；②臂首断言 `notify !== getSseNotify() && registry !== getSseRegistry()`（`getSseNotify()` 惰性建实例**不建池**——`sse-notify.service.ts:489`-`:492` `singleton ??= new SseNotifyService()` 无 `ensureStarted`，断言安全）；③源级 token 锚 `o.notify ??` / `o.registry ??` 在树（回退面本身即 keyless 风险的现形）。
- **类型缝纪律**：**禁对 notify/registry 做 `as unknown as` 双层强转**（含伪造型替换真件）；notify/registry 一律 `as never` 单层（沿 `ha-2-drain.proof.ts:292` `fakeHealth as never` 形）。`sink.reply` 与 `client` 沿先例 `as unknown as FastifyReply`/`as unknown as Client` 单次（`sse-delta-arm.proof.ts:52`/`:83`），**不属伪造 notify/registry**。
- **cap 预算核（按 `99e4e3f38`）**：2458（本树当前 scanned）→ rebase 后 **2460**（origin/main +28 commit、additive +2）→ EXEC **2461 = 2_461 恰等（余 0）**；**`.txt` 收据 → 2462 越限 → Ban `.txt`，只落 `.log`**。**零步进**。
- **零重叠核**：xrep（择形②绕行·`:198`）/uc010（断线窗·`:260`）/sse-push-notify（cadence+主推·`:539`-`:579`）/sse-delta-arm（delta 臂）/sse-listen-probe（LP-1/LP-4 探针活性）/ha-2-drain（排水）/last-event-id（解析）逐条 reason 级可分（§1.2），零替代零互借。
- **est live=0**：起草/回炉 turn 与 EXEC 期均零外呼零 Key 零生产操作零消耗（EXEC 仅本地 node 直跑）。

## §7 markers=0（卫生声明）

本刀改动集（起草/本 rev turn=本卷 1 `.md`；EXEC 期=proof+两 `package.json`+`ai-docs/delivery/receipts/regw/*.log`）五类标记词 + 行首冲突标记 grep **零命中**（起草席与本 rev 席亲跑；词面运行时组装口径，`scripts/i6-239-gates.proof.mjs:159`-`:163` 同形，卷内不复抄防自匹配）。本 rev 亲跑读数：`docs:check` EXIT=0 · scanned 2458；PTP **12/12** EXIT=0；改动集 markers 零命中。

## §8 STOP（开工三条款 + 停止条件五类）

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：本节 + Status 行 + 卷尾 · 同值）。** 开工三条款（未履行不得 EXEC）：①pre-exec 双审两独立外席 BOTH PASS 落卷（rev r1 双席已 FAIL、rev r2 双席已 FAIL，均按处方回炉，须**新**双席复审）；②协调方明示 EXEC 授权；③§0 全量对届时 tip 重 pin——机制源/三控制器/取数谓词/双钉值任一漂移且结论受疑即回炉。
- **现场漂移**：`origin/main` 届 tip **内容漂移**（机制源/三控制器/取数谓词/双钉值/事件原语 blob 与 §0.1 不再恰等）或 `merge-tree` 预演**非 additive 冲突**、或二 `package.json` 注册区被在飞刀改写 → 停·重 pin。**陈旧支线按陈旧度排除**（merge-base 远落后且不触本刀面者不计在飞；本 rev 已实测 `origin/main` +28 commit 中仅 `cwn-REQUEST.md`/`uc3m-REQUEST.md` 两件计入受管面、机制源十件零漂）。
- **机制不满足 / 结构已闭合**：**区2 判据 = RW-0-3 红 且 RW-0-5（源 token `SsePumpOptions` 块无 `fetchInitial/loadInitial`）红**——两者同红方判「initial 已移入泵、区2 消失」→ **红停上报**，改 docs 纯证伪钉刀（**须协调方重裁刀型**）。仅 RW-0-3 红而 RW-0-5 绿=**仪器红**（正则/行锚漂移），按臂红分诊改措辞复跑，不动性质。`:191`/`:199` 序回归（区1 被证伪）=产品机制回归，EXIT1 诚实保留+backlog 登记，**Ban retry-to-green/断言迁就**。
- **臂不可构造**：EXEC 期发现镜像泵形不可落地——注入缝缺失（`notify?`/`registry?`/`fallbackMsHealthy?` 任一被删）、进程单例回退不可控（`??` 面被改）、或静态选项块键集已变（六键不再同形）→ **红停上报**；**Ban 降臂（删断言凑绿）或改断言迁就（改期望值/放宽阈值）**，须协调方重裁刀型。
- **臂红分诊**：先分**仪器红**（fake 组装/注入序/数量锚/时间容差）与**机制红**（源序/机制语义）——dump fake 调用序列（`waitingCount`/`writeTimes`/`inFlight`/`frames`/`eventSeq`）+ 重读源锚（`:169`/`:189`-`:191`/`:199`/`:309`-`:319`）定位；**仪器红只许改措辞/注入序，不许改断言性质**（性质=判决方向与阈值来源）；机制红即红停上报。
- **越界需要**：修法诉求超出「1 proof + 2 注册行 + `.log` 收据」（需产品码关窗/真库/runner/改既有 proof）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2_461 / PTP 红 / 邻面 proof 红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记·Ban 借机修。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-10-30 起草落卷即停 · 前无状态 · pre-exec 双审两独立外席待派 · Ban self-approve · alone≠dual · ⛔push ⛔动主仓 · est live=0 · markers=0 · cap 零步进 · 收据/EXEC 记录待后续席追加，本节 append-only 不改既有字）。
- **rev r1（2026-10-30）**：pre-exec 双席 **FAIL（互盲同判）**→ 裁决按两席处方合并去重**全采纳**：承载形翻真 `SseNotifyService`、区2 加 RW-6 动态臂、区2 判据改「RW-0-3 红 + 类型面红」、cap 终值算式更新、断言 17→27；STOP 三处同值**维持** `draft:awaiting_pre_exec_dual`（prev 值不变，待**新**双席复审）。
- **rev r2（2026-10-30）**：pre-exec 双席 rev r2 **FAIL（互盲同判 P0×1）**→ 协调方裁决**采乙案**：RW-6 改**镜像泵**（静态接线断言 14 + 动态直驱臂 4，**不再声称真控制器直构**；删「控制器无法透传→不可达」一切处方）；**零控制器 import** 消除 `PrincipalGuard:38` 顶层副作用；RW-0-5 改源 token 断言；RW-2 ①拆 ①a/①b；RW-4 删 fire 前置；`whenHealthy` 一律 3000ms 有界 race + 断言 healthy（统一 PA-0 共享前置门）；connect 闭包捕获句柄；断言 27→**38**（静态 19+动态 19）；cap 按 `99e4e3f38` 重算 rebase 2460/EXEC 2461 恰等、`.txt` 2462 越限一律 Ban；§8 补「臂不可构造」停止类。STOP 三处同值**维持** `draft:awaiting_pre_exec_dual`（prev 值不变，待**新**双席复审）。

---

*REGW REQUEST · 2026-10-30 起草落卷 · rev r1 回炉（双席 FAIL 处方合并全采纳）· rev r2 回炉（协调方乙案：镜像泵+静态接线断言）· **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行·同值）· 认领=`GAP-SSEPUSH-REG-WINDOW`（checklist `:1660`·fresh 亲点维持**开**）· 定性=**证明缺口非机制缺陷**（区1 泵内零窗：`:189`→`:191` 无 `await`、`:191` 先注册后 `:199` 取数；区2 控制器 pre-fetch 边界窗：initial 语句开始（`:264`/`:59`/`:57`）→`:169` 注册，提示在注册前掉地（`:309`-`:319` 无在册即 return·不排队），`seq>lastSeq` 谓词+同流事务锁/`MAX+1`/`uq_event_seq` 保证下一轮兜底取回）· 刀型=**乙·双臂复合**（RW-0/RW-1/RW-3 证伪区1 零窗与即时承接；RW-2/RW-4/RW-5/RW-6 承接区2 零丢失/零重放/有界时延；纯证伪否决）· 修法=恰 1 proof `apps/api/test/sse-reg-window.proof.ts` **七臂 38 断言（静态 19+动态 19）** keyless 单元缝（真 notify + fake LISTEN client·零控制器 import·zero DB/model/HTTP）· 注册=root+api 两行，runner 零触· 零产品码零迁移零 Key · cap **零步进**（2458→ rebase 2460 → EXEC 2461=2_461 恰等余 0；`.log` 收据不计、`.txt` 收据 2462 越限一律 Ban）· pins 十一值零翻 · est live=0 · markers=0 · releaseEvidence=false · Not HA · Ban SLO/HA/发布叙事 · Ban 借 xrep 择形② 宣窗已消除 · ⛔push ⛔动主仓 · 起草态 STOP*
