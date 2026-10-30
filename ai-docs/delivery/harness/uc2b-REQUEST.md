# UC2B REQUEST — UC-002 HTTP lease mouth（SSE 槽租约口）BOUND 孪生面 + snapshot 专用口边界起草卷·覆盖矩阵 §1.0.1 `:113` BOUND 格（partial 残面·§1.1 `:173` 残面注记两分口）（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-26 起草落卷→同日 EXEC 立项落码行使（§0.0.3 r3 履行+§9-EXEC 落卷）→2026-10-30 post 双审同判 FAIL 后 P1/P2 修复落卷（§9-post-fix·双 fresh 重跑 34/34）·本卷不 claim 任何 covered 升格（EXIT0=case≠covered·coveredCount=8 零动·BOUND 格 partial 保持+case-only 措辞）· alone≠dual · Ban self-approve · post-prove dual 复审待审 · ⛔push）。

**席位**：UC2B 起草席（总盘 #16「NHP-017-HTTP-BOUND 孪生面/UC-002 HTTP lease mouth + snapshot 专用口（§1.1 残面）」·小-中 EXEC 刀·docs-only 起草·协调方派·与批 A/B/C 已并线卷、UC 专属线、在飞行行级互斥）。
**基线**：`origin/main` @ **`33fdd233c`**（full `33fdd233c4069942569b12b40a95fc05ff448de2` · `git fetch origin` 本 turn 成功 · 分支 `line/uc2b-draft` 零独有 commit · worktree `meetwise-uc2b`）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2445**（stdout「public text policy scanned 2445 managed worktree files」亲读·= cap 2445 恰等零余量 · §2-1 预算核·步进已随本落卷行使）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 `:47` 强制列 / §1.0.1 `:108-:110` 表头+`:113` / §1.0.3 `:166` 双表同步令 / §1.1 `:173` / P0-7 `:269`）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（`:43-:45` NHP-002 三行 / `:66` NHP-014-BOUND-01 BOUND 族先例行 / `:68-:77` NHP-017 十行）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-002 `:79-:99` · `:89` E-并发resume · `:93` A1–A3 · `:94` snapshot 契约 · `:98` TC-E2E-002-lease-race）→ `ai-docs/delivery/harness/uc-e2e-002-cross-device.eval.md`（§0 `:19-:20` 搜码结论/明确仍缺 · §1 `:29-:30` 资产分层 · §1b `:43-:44` #1/#2 缺口）→ 涉事机制源 `apps/api/src/modules/interview/interview.controller.ts` / `apps/api/src/platform/rate-limit.service.ts` → 既有收据（零触只读）`apps/api/test/sse-principal-slot.proof.ts`（HC-GAP-007 #98）· `apps/api/test/sse-cross-replica.proof.ts`（XREP XR-4 #173）· `apps/api/test/uc-e2e-017-orphan-http-sse.proof.ts`（五 case 429 子臂）· `apps/api/test/uc-e2e-002-cross-device-http.proof.ts`（H1–H3+G-GAP 五 pin）· `apps/api/test/uc-e2e-002-adv-led-crossuser.proof.ts`（V4/V5）· `packages/db/test/uc-e2e-002-cross-device-lease.proof.ts`（L1–L3）→ 先例形 `ai-docs/delivery/harness/xrep-REQUEST.md`（§XR-4 `:99-:101`）+ `ai-docs/delivery/execution-master-checklist.md` `:1660`（XREP closed 行）。

---

## 认领核对 · fresh 行号亲点 + 在飞零重叠核（本卷核心盘点）

**已认领排除面（本 turn 亲读）**：UC-001 四 case（`:112`·#149 closed）；UC-002 **ADV 面=Line R 已落**（`:113` ADV 列 case-only 注记在格·case-matrix `:45`）；UC-003 `:114`；UC-010 族 `:120`+case-matrix `:46-:49`；UC-011 `:117`；UC-014/026 `:119`+`:65-:67`；UC-017 全行 `:122`+case-matrix `:68-:77` 十行（五 case+FAULT/BOUND/LOAD/PERF/ADV 专属线已落）；UC-018 `:123`；UC-019 `:124`；UC-025 `:125`；UC-028 `:127`；UC-030 `:128`；UC-031/032 `:129`；UC-033 `:130`；UC-040–043 `:131`；PERF/LOAD 伞面 `:147`（显式 blind 保持·本刀零 PERF/LOAD 臂=Ban 偷关）；其余出域（X17 认领盘点沿袭）。

| 认领 cell（本刀） | 行号 | 现列值（亲读逐字） | 判定 |
|---|---|---|---|
| **矩阵 §1.0.1 UC-E2E-002 · BOUND 格** | **`:113`** 第 3 列 | **`**partial**（lease）`**（括注 lease=uc002:lease:prove db 层 L1–L3 独源·零 HTTP 槽口注记） | **本刀唯一认领格**：具名 case `NHP-002-HTTP-BOUND-01` 隔离 prove 真证据登记（partial 保持+case-only 收据注·EXEC 补注·非翻面） |
| case-matrix §1.2 | `:43`（NHP-002-BOUND-01 db 层在行） | **无 `NHP-002-HTTP-BOUND-01` 行**（`:43-:45` 三行=BOUND(db)/FAULT/ADV·grep 亲证零 HTTP-BOUND 行） | 本卷 EXEC 补 §1.2 新行（`:43` 邻区·沿 `:74` NHP-017-HTTP-BOUND-01 行形） |
| `:113` NEG/FAULT/ADV 三格+读法列+§1.1 `:173`+P0-7 `:269` | `:113`/`:173`/`:269` | partial/partial+case-only（跨副本杀 SSE）/blind+case-only·读法列「lease/双 session GET+LED = BOUND/FAULT partial」·§1.1「缺 **HTTP lease mouth** + snapshot 专用口 + full.e2e 双设备」·P0-7「HTTP **lease mouth** 仍缺」 | **零触**（§1.3/§2-5 逐项留痕——红停两面未闭合·`:173`/`:269` 措辞仍真·措辞更新权归协调方） |

**既有 429/槽口收据三源零重叠核（逐臂亲读 vs 本刀臂面）**：①`apps/api/test/sse-principal-slot.proof.ts`（HC-GAP-007·`pnpm sse-slot:prove`·#98 落码 `f0fedfb20`+UC184 `7c01096e7`）=同主体单 client 框架 5+1 429 具名码+三口共享桶+拒连零 catch-up+异主体隔离+释放再占（`:137-:188`）——**counting-stub DB 零 ledger 臂（`:38-:52` 亲证）·零双设备框架·未注册任何 UC 行**（仅矩阵 `:176` UC-010 行「unit/slot/stream-window/helpers 为层旁证」归属）；②XREP XR-4（`sse-cross-replica.proof.ts`·#173·checklist `:1660` closed）=**跨副本集群合计 5 条**（0189 共享 `gateway_slot_lease_acquire` PG 槽 lease 路径·`platform_slot_lease` 行物证·P-③ 前置三断言·措辞冻结「集群合计 5 条·Ban 每副本 5 条」）；③五 case SSE-FAULT-01 429 子臂（`uc-e2e-017-orphan-http-sse.proof.ts:311-:378`·case-matrix `:73` case-only）=**孤儿 reserved 态源**·UC-017 行注册。三源均**未在 UC-E2E-002 行 BOUND 格注册任何收据**——本刀臂与其 reason 级可分（§1 非替代申明逐条）。

**派单两面读法分口（如实入卷）**：派单语「UC-002 lease mouth HTTP 面（限流 acquireSlot SSE 挂点 `interview.controller:262` 区·HTTP 429 形）」=**SSE 槽租约口**（本刀认领臂面·产品嘴在树·可测）；eval §1b#1「HTTP lease mouth」原文=**HTTP thread lease CAS 产品口**（`GAP-UC002-HTTP-LEASE-MOUTH`·`uc-e2e-002-cross-device-http.proof.ts:226` G-GAP pin 在钉）——**该产品口不存在**（§0.2 红停①亲证）→ 红停标注不入臂。两读法不混写。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`33fdd233c`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **45 树**实测——`line/uc2b-draft` 恰 1 命中=本席；`grep -rn "uc2b"` 全树（.md/.json/.mjs/.ts）落卷前**零命中**；`uc002:nhp-bound`/`prove:uc002-nhp-bound`/`uc-e2e-002-nhp-bound` 全树 grep **零命中** → 落卷后唯一同名卷/命令/case=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only .md 1+policy 两 script 数值联动）；EXEC 期触面=隔离 prove 新文件+注册行（root `package.json:231-:238` 邻区 `uc002:*` 族双行/apps-api `package.json:36-:37` 邻区单行）+runner 注册位（`scripts/run-e2e-isolated.mjs` 三位·`uc002:http:prove:raw` 同族三位在树亲点·EXEC 届时重 pin·位4 pre-migrate 名单/位5 resource-caps 条件按届时 tip 亲证登记或如实申明不适用）+双表行内改（矩阵 `:113` BOUND 格邻区+case-matrix `:43` 邻区 §1.2 一新行）。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `33fdd233c` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.0.1 rev r1 修订登记（dual r1 双 PASS·P2 采纳清单索引·2026-10-26 修订席落卷）

pre-exec 双审（席1/席2）r1 **双 PASS**·P2 合并去重八件+本小节=九项采纳，逐条落点（随立项日履行·STOP 三处 `draft:awaiting_pre_exec_dual` 原值维持）：
- **R1（=席1 F1 合并）**：§0.1 末行 grep 口径收紧=「会话在别处」产品码面（apps/+packages/）恰 2 命中=:7/:226·产品 src 零命中；非产品命中 3+ 列举（防后审以全树多命中攻锚）。
- **R2（rev r2 更正先例锚·P1 采纳）**：§1 B4 钉释放传播窗=poll-until 槽 4 带超时·先例锚改钉 `apps/api/test/sse-cross-replica.proof.ts:317-:322`（waitFor 形·stepMs=100 默认·deadline 超时=FAIL 计红·rev r2 亲点）+`:439` 调用值先例（`waitFor('xr1-lease-drained-U1', leaseCount===0, 15_000)` 即槽释放 poll-until 同形）·间隔/上限钉死=step 100ms/上限 15s（沿 XREP 形）·poll 超时=机制红→§8 机制不满足（「释放后设备 B 不可再占」已枚举）·**Ban 借环境抖动重跑冲绿**·原三锚（sse-slot :178/五 case :298/:368）降格=固定 sleep 窗先例（仅证传播窗存在·一次性形态本刀禁止）·Ban 立即断言再连（release 经 event-loop 数 tick·立即断言=偶发 429 flaky）。
- **R3（rev r2 更正词表引证·P2 采纳）**：§1 B6 态源达成改夹具直置 status='waiting_user'——interview.status 无 CHECK（sql/01:20）可写·waiting_user 系 ai_graph_run 词表（sql/01:39）借形 sentinel·非产品 interview 状态机词（interview.service.ts:37-:38 产品状态机=created→completed|failed|abandoned）·在树直写先例 scor-00-http-db.proof.ts:151（rev r2 亲点）·Ban 依赖 begin 推进状态（begin 后仍 created·五 case :303）+§5 豁免枚举补「状态种子写」一项。
- **R4**：§8+§2-3 增停令=EXEC 开工前对红停两面重跑 §0.2 二/三 grep 亲证；任一面预期外存在（含侦察遗漏·非他刀新落）→停·如实上报·Ban 静默复述短句/Ban 静默改臂。
- **R5**：载体甲 pin 补引 sse-principal-slot.proof.ts :27-:28（AUTH_DEV_HEADER='1'+NODE_ENV 守卫·缺它全臂 401）+B2 补「RL_SHARED_DEGRADED 前置形不承登=载体甲无 db 结构性不可达·Map 计数即模式证人」分口理由+B5 补 userA 槽位双侧不变断言。
- **席1 F2**：五 case 429 子臂跨度 :311-:375/:311-:377 双写法统一=:311-:378（实测 reject :364/收束 :378）+届时 blob 重 pin。
- **席1 F3（rev r2 收紧 pin）**：「boot 栈（sql/01-22 无 0189）」→「boot 夹具装载集（sql/01-23+手挑迁移清单 _neg-harness.ts:73-:92+后段镜像）不含 0189·全文件 grep 0189 零命中口径」。
- **第九件=本小节自登**（dual r1 双 PASS·P2 采纳清单索引）。

全部修订对机制源逐条亲证零冲突（rev r1 修订席·命中即停条款未触发）。

### 0.0.2 rev r2 修订登记（dual r2 席1 PASS+席2 FAIL P1×1·裁决=席2 修订清单全采纳·2026-10-26 回炉席落卷）

pre-exec 双审 r2 分歧：席1 判 PASS·席2 判 **FAIL（P1×1）**——P1=B4 释放传播窗先例锚钉在固定 sleep 形（sse-slot `:178`/五 case `:298`/`:368` 均裸 `sleep` 硬等·非谓词轮询·超时无 FAIL 计红面·「poll-until 带超时」名实不符）；另附 P2 词表引证失准+小瑕疵三件。**协调方裁决=席2 P1+P2+小瑕疵修订清单全采纳**，逐条落点（rev r2 修订席 2026-10-26 落卷·STOP 三处 `draft:awaiting_pre_exec_dual` 原值维持）：
- **P1（先例锚·两行=§0.0.1 R2+§1 B4）**：先例锚改钉 `apps/api/test/sse-cross-replica.proof.ts:317-:322`（waitFor 形·stepMs=100 默认·deadline 超时=FAIL 计红·本席亲点）+`:439` 调用值先例（`waitFor('xr1-lease-drained-U1', leaseCount===0, 15_000)` 即槽释放 poll-until 同形·本席亲点）·间隔/上限钉死=step 100ms/上限 15s（沿 XREP 形）·补卷令分口=poll 超时=机制红→§8 机制不满足（「释放后设备 B 不可再占」已枚举）·**Ban 借环境抖动重跑冲绿**·原三锚（sse-slot `:178`/五 case `:298`/`:368`）降格=固定 sleep 窗先例（仅证传播窗存在·一次性形态本刀禁止）。
- **P2（词表引证·两行=§0.0.1 R3+§1 B6）**：词表引证改「interview.status 无 CHECK（sql/01:20）可写·waiting_user 系 ai_graph_run 词表（sql/01:39）借形 sentinel·非产品 interview 状态机词（interview.service.ts:37-:38 产品状态机=created→completed|failed|abandoned）·在树直写先例 scor-00-http-db.proof.ts:151（本席亲点）」·「态源=UC-002 waiting_user/active」改「sentinel 中段值（如实申明·断言面值无关）」·GET :id 断言面补=TERMINAL_INTERVIEW（interview.service.ts:38）不含 waiting_user·get()（interview.service.ts:735-:766）零状态分支·interview-view.ts:12 status 直透（席2 清单引 `:20`·亲点更正见末条）→200+`status==='waiting_user'` 前后恒等可断。
- **小瑕疵三件**：§0.1 末行（红停①锚行）非产品列举去重补全（eval.md/e2e-scenarios/receipts 词面·本席全树 grep 亲点 14 命中如实列举）；F3 pin 收紧=「_neg-harness.ts:73-:92+后段镜像·全文件 grep 0189 零命中口径」（§0.0.1 F3 与 §0.2 同锚同步更）；§2-3「grep」改「亲点/grep」。
- **锚更正如实申明（非冲突·只更行号）**：席2 清单引 interview-view.ts `:20` status 直透·本席亲点实为 **`:12`**（`status: row.status,`·toInterviewView 直透结论不变·沿 §0 「结论不变则只更行号」惯例改锚）——零机制冲突·**命中即停条款未触发**。

### 0.0.3 rev r3 修订登记（dual r3 P2 四件·随 EXEC 立项日履行·2026-10-26 协调方派单授权落码）

r3 P2 随立项日履行四件（派单语·执行席 2026-10-26 落卷）：
- **R3-①（B4 落码注记）**：proof B4 臂头注落「计数观测载体=slotCount(rl,'sse:${principal}')（sse-slot :54-:56 形）·XREP waitFor 谓词签名 ()=>Promise<boolean> 同步谓词 async 包裹」——已随 `apps/api/test/uc-e2e-002-nhp-http-bound.proof.ts` 头注+waitFor 函数注落码（waitFor('b4-slot-4', async () => slotCount(m.rl, PKEY)===4, 15_000) 形）。
- **R3-②（proof 联动点行号更正）**：起草基线 @`33fdd233c` 时 §0.1 引 `:435/:442/:446/:448`——起草树实位 **`:436/:443/:447/:450`**（席1 P2 复核亲点）；本 EXEC 立项日对合并 tip（origin/main `0f41af1c4`=#182·merge 本支 `6b2eea5b8`）全量重 pin 后实位 **`:443/:450/:458/:461`**（§0.1 行已随届值更）。
- **R3-③（席1 P2-obs-1 :116 词面归一）**：非替代申明行 B6 对面词面归一「sentinel 中段态源（waiting_user 借形·如实申明）」（原「UC-002 waiting/active 态源」与 rev r2 P2 B6 臂内词面不齐）——已随 §1 非替代申明行更正。
- **R3-④（基线重 pin）**：起草基线 `33fdd233c` 已落后多轮并线（#175–#182）——EXEC 立项日 `git fetch` EXIT=0·届值如实采 origin/main `0f41af1c4`（#182 r5mr 合卷已落·cap 承 2448=CAP-SANCTION-2448·取大恒 2_453 本支起草链零再步进）·merge --no-ff 恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留+号随 merge-tree 重排·union 实测=main 届扫 2448+本支并入互斥受管目 1（harness/uc2b-REQUEST.md·两集合无交叠）=2449≤2_453 零越限·EXEC 期 +1 proof+1 收据 .txt=2451≤2_453 零再步进（docs:check scanned 2451 EXIT=0 亲跑）·矩阵 `:113`/cap 届值取大·零 union 越限故零步进行使。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex·**EXEC 立项日重 pin @merge `6b2eea5b8`=merge origin/main `0f41af1c4`**·漂移行如实更 blob/行号·零漂移行原值保持=结论不变）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280） | `:16` `@Controller('interview')` · `:28` begin · `:162/:169/:174` POST//GET 列表/`GET :id`（**现形读面=snapshot 顶替·红停②锚**） · `:254-:256` SSE 注记（hijack 胶水/notify 精确推送/catch-up hold）· **`:257` `@Get(':id/events')`** · **`:259-:260` per-principal 并发上限注记（安全审计 F5+UC184 领槽先于取数·429 拒连路径零取数副作用）** · **`:261` `slotKey = sse:${req.principal}`** · **`:262` `acquireSlot(slotKey, 5)` 拒→`reply.code(429).send({ error: 'too_many_streams', ... })`**（具名码+非 SSE envelope）· `:264-:265` 404 `not_found_or_forbidden` · `:268-:277` `pumpSseEvents`（Last-Event-ID/deltaSource）· **`:278` `finally { await this.rl.releaseSlot(slotKey); }`（全退出路径释放）** · **全文件路由清单 `:28-:257` 亲点零 `/snapshot` 路由零 thread-lease HTTP 口** |
| `apps/api/src/platform/rate-limit.service.ts` | `fce544ff`（200） | `:41` `slotLeaseMs = 12 * 60_000` · `:26` 测试缝注释（无 DbService → 纯进程内模式）· `:150-:151` `slots = new Map`（**纯进程内模式=sse-principal-slot proof 同**）· **`:158` `async acquireSlot(key, max)`**：共享模式 `:163-:172` `gateway_slot_lease_acquire`（0189 函数·过期接管）· **`:173-:175` catch → `markSharedDegraded('fail_open')` + `return true`（PG 不可达 fail-open=429 在 boot 栈不可达机制源）** · `:177-:181` 进程内 `n >= max return false` 拒/占 · **`:184` `async releaseSlot(key)`**（`:186-:196` 共享 `gateway_slot_lease_release`/进程内幂等降 0 删行） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648·X17 pin 恒等亲证） | UC-002 `:79`（跨设备恢复节）· `:85` 主流程（GET snapshot→SSE LED→thread lease CAS→续答）· `:86-:91` 异常流（**`:89` E-并发resume=thread lease CAS 恰一抢到·输者「会话在别处活跃」不双跑不双扣** · `:90` E-越权 404 不泄露 · `:91` E-重放去重）· `:92` 后置（lease 归胜者无额外扣费）· **`:93` A1–A3** · **`:94` 契约 `GET /interview/:id/snapshot`**（场景契约原文）· `:97-:99` TC-E2E-002-resume/**lease-race（integration 真实竞态落此层）**/replay |
| `ai-docs/delivery/harness/uc-e2e-002-cross-device.eval.md` | `407071d6`（132） | `:7` MODEL_API_KEY **不需要**（keyless 判定核锚）· `:19` 搜码结论（无 HTTP thread lease CAS 口/无专用 `GET …/snapshot`）· `:20` 明确仍缺四件 · `:29-:30` L1–L3/H1–H3 资产分层（H 行亲证「无 HTTP lease CAS；无 snapshot 专用口」）· **`:43` §1b#1=`GAP-UC002-HTTP-LEASE-MOUTH`** · **`:44` §1b#2=`GAP-UC002-SNAPSHOT-ROUTE`**（二择一：专用路由|ADR 钉「`GET /:id` 即 snapshot」）· `:68` 未齐 §1b#1 矩阵最多 partial |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `1a1844eb`（522·EXEC 重 pin：起草锚 `acdc797f`→并线 #175-#182 后 blob 漂·行锚全数亲点不变） | `:7` §0.5 强制列总则 · `:47` §0.5 节 · `:108-:110` §1.0.1 节头+列表头（NEG/FAULT/BOUND/ADV）· **`:113` UC-E2E-002 行（BOUND 格=`**partial**（lease） / case-only`（EXEC 收据注已落·partial 保持）· ADV 格 case-only 注记 Line R 已落零触）** · `:122` UC-E2E-017 行（BOUND 格=`partial`（sweeper）·ADV 格 case-only X17 已落）· `:147` PERF 行（显式 blind）· `:160/:166` §1.0.3/双表同步令 · `:173` §1.1 UC-002 行（「缺 **HTTP lease mouth** + snapshot 专用口」注记在·零触）· `:176` UC-010 行（`sse-slot:prove` 层旁证归属句）· `:182` §1.1 UC-017 · `:267` P0-5 · `:269` P0-7 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `64988114`（218·EXEC 重 pin：起草锚 `b9b108a4`→blob 漂·EXEC 补 `:46` NHP-002-HTTP-BOUND-01 一行） | **`:43` NHP-002-BOUND-01（002 BOUND api db 层·lease 竞态双 holder·partial·`uc002:lease:prove`）** · `:44-:45` FAULT/ADV · **`:46` NHP-002-HTTP-BOUND-01（EXEC §1.2 新行·case-only executed）** · `:67` NHP-014-BOUND-01（BOUND 族先例行·gap→case-only 22 断言形）· `:69-:78` NHP-017 十行（`:70` BOUND db sweeper 幂等 partial · `:74` SSE-FAULT-01 429 子臂 case-only · **`:75` HTTP-BOUND-01（本刀新行行形先例）** · `:78` ADV-01） |
| `apps/api/test/sse-principal-slot.proof.ts` | `692c4d01`（204） | `:2-:10` HC-GAP-007 头注（interview/quiz/diagnosis 共享 `sse:${principal}` cap=5·counting stub 非 isolated PG·`pnpm sse-slot:prove`）· `:38-:52` counting-stub DB（零 ledger 面）· `:91-:131` 自建最小模块形（compile 期 useValue）· `:137-:149` 占满 5（三面试+两押题）· `:150-:164` 第 6 条三口 429 `too_many_streams`+槽恒 5+拒连零 catch-up · `:166-:169` 异主体隔离 · `:177-:188` 释放→0→再占 |
| `apps/api/test/sse-cross-replica.proof.ts` | `38f67e16`（590） | XR-4 臂（**集群合计 5 条·第 6 条 429·释放可再占**·0189/0214 双自装·`platform_slot_lease` 行物证·P-③ 前置三断言·措辞冻结）· checklist `:1660` closed 行（#173·XR-0×6/XR-1×6/XR-2×2/XR-3×8/**XR-4×11**/XR-5×7=40 断言） |
| `apps/api/test/uc-e2e-002-cross-device-http.proof.ts` | `1631ba27`（238） | `:7` 头注 MISSING 句 · `:145-:150` H1 双 session GET 一致 · `:163-:185` H2 LED/H3 中位游标 · `:192-:220` H-authz 404 · **`:224-:233` G-GAP 五 honesty pin（`:226` `GAP-UC002-HTTP-LEASE-MOUTH`+`:227` `GAP-UC002-SNAPSHOT-ROUTE`（「本 prove 用 GET /:id 顶替」原文）在钉·EXIT0≠covered）** |
| `apps/api/test/uc-e2e-002-adv-led-crossuser.proof.ts` | `a26d145d`（420） | `:3` 两族六类（V1–V3 伪造 LED+V4–V6 跨用户 session）· `:256-:274` V4 跨用户 GET 404 no-leak（**零 429 臂亲证**） |
| `apps/api/test/uc-e2e-017-orphan-http-sse.proof.ts` | `0fb8f654`（438） | `:30-:33` 429 子臂承载注记（**boot 栈 migration 0189 未装载→acquireSlot fail-open→429 槽满在 booted 栈永不发生→自建最小模块同进程承载**·rev2 收紧形）· `:311-:378` 429 子臂（五占+满额计数=5+第 6 条 429 具名码 reject `:364`+被拒槽仍 5+断开释放 0+释放再占）· `:378` 收束=主场景原预占语义在 429 臂全程后不变（**rev r1 实测重锚 reject `:364`/收束 `:378`·EXEC 届时 blob 重 pin**） |
| `packages/db/test/uc-e2e-002-cross-device-lease.proof.ts` | `eea67481`（282） | L1–L3（db `withInterviewGraphFence` CAS 层·`uc002:lease:prove`·NHP-002-BOUND-01 独源） |
| `ai-docs/delivery/execution-master-checklist.md` | `2884be76`（4503·EXEC 重 pin：起草锚 `17674ca3`→并线后 blob/行漂 +1） | `:1661` XREP closed 行（XR-4 先例+「集群合计 5 条」措辞冻结+Non-claims·起草锚 `:1660`→并线 +1） |
| `ai-docs/delivery/harness/xrep-REQUEST.md` | `b218924b`（210） | `:99-:101` §XR-4 臂形（`interview.controller.ts:262` 同码·`acquireSlot` 网关原子占拒+前置合同 P-③） |
| `scripts/ai-docs/public-text-policy.mjs` | `9d39dd6d`（565·EXEC 重 pin：起草锚 `fbd3d65c`→并线+本支 dual-keep 后 blob/行漂） | `:267` **`MAX_FILES = 2_453`**（届值取大承登=本支起草步进 2453＞main #182 届值 2448·零再步进）· `:244-:266` CAP-SANCTION 注记栈（史录零洗·#175-#182+UC2B 注记 dual-keep 并留） |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `2cd7015b`（477·EXEC 重 pin：起草锚 `4bc18b4e`→并线+dual-keep 后 blob/行漂） | 四处越限臂联动点（**届值行号（R3-②）**：起草树实位 `:436/:443/:447/:450`（起草基线引 `:435/:442/:446/:448` 系席1 P2 复核失准已更）；**合并 tip 实位 `:443`（`i < 2_453`）·`:450`（`scannedFiles, 2_453`）·`:458`（`f-2453.md`）·`:461`（`FILE_LIMIT:2454`）**）· `:436` CAP-SANCTION-2453 注记（本刀注记·merge 后位）· CAP-SANCTION-2448 注记（r5mr·并留上邻） |
| `ai-docs/architecture/adr/`（目录亲点） | —（0015–0022 七件+README） | **零 snapshot ADR**（红停②锚·无「`GET /:id` 即 snapshot」正式钉） |
| 全树 grep 亲证 | — | **「会话在别处」产品码面（apps/+packages/）恰 2 命中=`uc-e2e-002-cross-device-http.proof.ts:7/:226` honesty pin 词面·产品 src 零命中**；非产品命中 14（rev r2 去重补全·本席全树 grep 亲点·防后审以全树多命中攻锚·红停①锚·**EXEC 立项日合并 tip 复证 14 恒等零漂**）=harness/uc-e2e-002-cross-device.eval.md:19/:43/:65+e2e-scenarios.md:89+receipts/archive/2026-09-batch23/eval/uc-e2e-002-cross-device.eval.md:23+同批 reviews/REQUEST-2026-09-10-uc-e2e-002-http-for-mw-e2e-ha.md:19+reviews/2026-09-10-uc-e2e-002-http-mw-e2e-ha.md:42/:63/:69+scripts/eval-uc-e2e-001-002-cite.proof.mjs:50 regex+本卷自引 4 处（去重：proof 词面已系产品面 2 命中不再重列） |

### 0.2 码面锚（产品面侦察逐点 · 期望值逐条对码 @`33fdd233c`）

**（一）UC-002 lease mouth HTTP 面（派单认领臂面·产品嘴在树可测）**：SSE 槽租约嘴=`GET /interview/:id/events`（`interview.controller.ts:257-:279`）——`:261` 槽键 `sse:${req.principal}`（**per-principal 键=跨设备天然共享桶**·设备框架即 UC-002 场景义）；`:262` `acquireSlot(slotKey, 5)` 满 5 拒→**HTTP 429 `too_many_streams` 具名码**（JSON envelope 非 `text/event-stream`·沿 XREP XR-4 先例形「`:262` 同码·`acquireSlot` 网关原子占拒」）；`:259-:260` UC184 领槽先于取数=429 拒连路径零取数副作用；`:264` 404 `not_found_or_forbidden`（authz 面·归 uc002-adv V4/V5 非本刀臂）；`:278` `finally releaseSlot`（断开/终态/超时全退出路径释放）。承载两形亲证：**进程内 Map 形**（`rate-limit.service.ts:150-:181`·无 DbService 测试缝 `:26`·sse-principal-slot/五 case 429 子臂同形）与 **PG 共享 lease 形**（`:163-:172` 0189 `gateway_slot_lease_acquire`·**`:173-:175` PG 不可达 fail-open `return true`→boot 夹具装载集（sql/01-23+手挑迁移清单 _neg-harness.ts:73-:92+后段镜像·全文件 grep 0189 零命中·rev r2 同步 F3 pin）不含 0189·429 不可达**·五 case `:30-:33` 承载注记亲证·XREP 父进程 0189 自装例外）——**本刀臂面沿进程内 Map 形承载**（可达性已三源亲证·PG 共享面=XREP 专属·Ban 越界）。

**（二）snapshot 专用口现形（红停②·不可测）**：`interview.controller.ts:28-:257` 全路由亲点（begin/turn/answers/transcribe/speak×2/feedback/abandon/POST/GET 列表/**GET `:id` `:174`**/report×3/transcript/assessment×2/learning-plan×3/career-path×2/answer/events）**零 `/snapshot` 路由**；`GET :id` 即现形读面（eval `:30`「本 prove 用 GET /:id 顶替」+`uc-e2e-002-cross-device-http.proof.ts:227` G-GAP pin 原文）；**ADR 目录 0015–0022 零 snapshot 件**（二择一闭合路「专用路由|ADR 钉」两路均未落）；scenarios `:94` 契约原文「关联：契约 `GET /interview/:id/snapshot`、SSE」未承接——**零他刀落·零重叠登记·本刀零臂（红停标注）**。

**（三）HTTP thread lease CAS 口（红停①·不可测·eval §1b#1 读法）**：`withInterviewGraphFence` 仅 db 层（`packages/db/src/index.ts:157` 导出·`uc002:lease:prove` L1–L3 已证=NHP-002-BOUND-01 `:43` partial 独源）；**HTTP 口不存在**（interview.controller 全路由亲点零 resume-lease 口·「会话在别处活跃」产品码零命中§0.1 末行）——scenarios `:89` E-并发resume 期望「输者收到会话在别处活跃」在 HTTP 层**无嘴可打**·Ban 本刀造产品码（prove-only）·归协调方裁决（造口|ADR 钉 db fence 承接）·**零他刀落·零重叠登记（红停标注）**。

**（四）矩阵 UC-002/UC-017 BOUND 格 fresh 行号**：UC-002=`:113` 第 3 列 `**partial**（lease）`（源=uc002:lease:prove db 层独源）；UC-017=`:122` 第 3 列 `**partial**（sweeper）`（源=uc017:orphan:prove db 层）；case-matrix 侧=`:43`/`:69`。两格现值均系 **db 层独源**——HTTP 口层 BOUND 收据两行均零注册（UC-017 侧 429/HTTP-BOUND 面=case-matrix `:73`/`:74` case-only 已落·矩阵 `:122` BOUND 格注记措辞更新权归 UC-017 专属线/协调方·本刀零触 UC-017 面）。

**（五）既有 BOUND 收据覆盖面（何刀落的·in-process/DB 层·本卷盘点）**：NHP-001-BOUND-01（`uc001:nhp-bound:prove` 17/17·Line AB·`:38` case-only）；NHP-002-BOUND-01（db fence L1–L3·partial·`:43`）；NHP-014-BOUND-01（`uc014:nhp-bound:prove` 22 断言·2026-10-27 EXEC·`:66` gap→case-only）；NHP-017-BOUND-01（db sweeper 幂等·partial·`:69`）；NHP-017-HTTP-BOUND-01（HTTP 重复 begin alreadyBegun·五 case·`:74` case-only）；NHP-030-BOUND-01（48 断言 #152·`:51` case-only）；**in-process HTTP 槽口面**=HC-GAP-007 `sse-slot:prove`（#98·非 UC 行注册）+XREP XR-4（#173·集群面 closed）——**UC-002 行 BOUND 格 HTTP 口层收据=零**（派单语「HTTP 口层孪生面未证」对本格成立·对裸 429 形不成立·两面分口如实承登）。

### 0.3 认领 cell 登记（行号+用例名+现值·亲读逐字）

| 行号 | 用例名 | 现列值（亲读） | 本刀补 |
|---|---|---|---|
| **矩阵 `:113` BOUND 格** | **UC-E2E-002 BOUND（HTTP 槽口层）** | **`**partial**（lease）`**（db 层独源括注） | 具名 case `NHP-002-HTTP-BOUND-01`（partial 保持+case-only 收据注+EXIT0=case≠covered） |
| case-matrix §1.2 | —（无行） | 无 `NHP-002-HTTP-BOUND-01` 行 | EXEC 补一新行（`:43` 邻区·沿 `:74` NHP-017-HTTP-BOUND-01 行形） |
| 矩阵 `:113` NEG/FAULT/ADV+读法列/§1.1 `:173`/P0-7 `:269`/`:147` PERF 行 | 既有四 prove+伞面 | partial/partial+case-only/blind+case-only·「缺 HTTP lease mouth + snapshot 专用口」·「HTTP lease mouth 仍缺」 | **零触**（红停两面未闭合措辞仍真·更新权归协调方） |

---

## §1 修法（恰 1 具名 case=`NHP-002-HTTP-BOUND-01` · 一 proof 单口六臂（B1–B6 两载体）· 沿 sse-principal-slot/五 case 429 子臂/XR-4 先例形 · 零产品码触 · 零 invent covered · 零 live key · **红停双标注两臂不入（§0.2 二/三）**）

**修法形状**：新 proof `apps/api/test/uc-e2e-002-nhp-bound.proof.ts`（**EXEC 落码名=派单显化 `uc-e2e-002-nhp-http-bound.proof.ts`·命令族 root `uc002:nhp-http-bound:prove(:raw)`/apps-api `prove:uc002-nhp-http-bound`·tracked 收据 `receipts/nhp-002-http-bound/`·计划名与落码名全树+45 worktree grep 双零碰撞复证·语义同格**；**零碰撞亲证**：全树 grep 零命中）+ root package.json 双行（`uc002:nhp-bound:prove`/`:prove:raw`·`package.json:231-:238` `uc002:*` 族邻区）+ apps-api package.json 单行（`prove:uc002-nhp-bound`·`:36-:37` 邻区）+ runner 注册位（`scripts/run-e2e-isolated.mjs` 三位·EXEC 届时重 pin·位4/位5 按届时 tip 亲证登记或如实申明不适用）· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**；零 MODEL_API_KEY（eval `:7` keyless 判定核亲证·lease/HTTP/槽租约面全无 Key）· 零模型外呼零 drain；既有六收据（sse-slot/sse-cross-replica/五 case/uc002:http/uc002:adv/uc002:lease）**零触只读**；收据 `.tmp/uc002-nhp-http-bound-receipts/`（post-fix 增量 `.tmp/uc002-nhp-http-bound-postfix/`）+ tracked `ai-docs/delivery/receipts/nhp-002-http-bound/`（`.log` 非 TEXT_EXTENSIONS 不计受管扫描）。行/列状态一字不动：EXIT0=case≠covered，coveredCount=8 不变。

### Case · `NHP-002-HTTP-BOUND-01`（UC-002 HTTP 槽租约口 BOUND 孪生面 · B1–B5 载体甲 + B6 载体乙）

- **需求源**：`e2e-scenarios.md:79`（UC-002 跨设备恢复）+ `:89` E-并发resume（恰一抢到/输者可解释拒/不双扣——本 case 取其 **SSE 槽租约边界映射面**：per-principal 槽桶即跨设备共享租约·输者=429 具名码可解释拒·B6 不双扣）+ `:93` A2（双设备并发仅一个可推进）+ 矩阵 §0.5 `:47` BOUND 强制列。**非 thread-lease CAS 面**（该面红停①·§0.2 三）。
- **证据层**：载体甲=自建最小模块同进程承载（`sse-principal-slot.proof.ts:91-:131` 先例形·**pin 补引 `:27-:28`（AUTH_DEV_HEADER='1'+NODE_ENV 守卫·缺它全臂 401）**（rev r1）·compile 期 useValue 覆盖·RateLimitService 无 DbService=进程内 Map 形 `rate-limit.service.ts:26/:150-:181`·429 可达性三源亲证）；载体乙=isolated 真 PG+boot 栈（五 case 同形 `0fb8f654`）+429 风暴打自建最小模块（五 case `:311-:378` rev2 收紧形同构·**boot 栈 burst 形 429 不可达=fail-open `:173-:175`+降级期 1s 探测节流 `:61-:66` 机制源如实申明·非产品路径零申明混淆**；post-fix P1 起风暴模块带 byPrincipal 计数，6×429 期间增量=0 为可证伪零 DB 触碰臂；boot 栈侧补 6 并发 /events 全 200 fail-open 臂；真 PG 读数仅作 storm 后态稳定性·**非因果**）；设备框架=同 principal 双 client（x-user-id 同值双连接·键 `sse:${principal}` per-principal 亲证 `:261`）。
- **臂**（六臂）：
  - **B1 跨设备共享桶占满**：设备 A 占 3 条+设备 B 占 2 条（面试/押题双口交叉·同主体）→ 全 200 `text/event-stream`·进程内槽计数=5（`sse:{$p}` 键跨 client 共享亲证=UC-002 双设备一桶场景义）。
  - **B2 第 6 条 429 具名码**：设备 B 第 6 条（任一口）→ **429 `too_many_streams`**（JSON 非 SSE envelope·`interview.controller.ts:262` 同码断言形沿 XR-4/sse-slot `:158-:163`）+槽计数恒 5（被拒不占槽·**分口理由（rev r1）：RL_SHARED_DEGRADED 前置形不承登=载体甲无 db 结构性不可达·Map 计数即模式证人**）。
  - **B3 拒连零取数**：catch-up 计数零增（UC184 领槽先于取数 `:259-:262` 同码·sse-slot `:164` 臂形）+被拒连接不入 2s 轮询环（`sse-principal-slot.proof.ts:170-:183` 臂形·EXEC 届时按载体甲计数 stub 重 pin）。
  - **B4 释放跨设备交接**：设备 A abort 一条→`finally releaseSlot`（`:278` 全退出路径）→**poll-until 槽 4 带超时·先例锚=`apps/api/test/sse-cross-replica.proof.ts:317-:322`（waitFor 形·stepMs=100 默认·deadline 超时=FAIL 计红）+`:439` 调用值先例（`waitFor('xr1-lease-drained-U1', leaseCount===0, 15_000)` 即槽释放 poll-until 同形）·间隔/上限钉死=step 100ms/上限 15s（沿 XREP 形·rev r2 更正锚）**→设备 B 再连 200（槽 5·XR-4「释放可再占」单进程同构臂·**交接方向跨设备=UC-002 场景义**）·**poll 超时=机制红→§8 机制不满足（「释放后设备 B 不可再占」已枚举）·Ban 借环境抖动重跑冲绿**·**Ban 立即断言再连（release 经 event-loop 数 tick·立即断言=偶发 429 flaky）**（原引 sse-slot `:178`/五 case `:298`/`:368` 降格=固定 sleep 窗先例·仅证传播窗存在·一次性形态本刀禁止）。
  - **B5 异主体隔离**：第三主体独立桶不受满桶影响→200+自有槽计数独立+**userA 槽位双侧不变断言（rev r1）**（sse-slot `:166-:169` 同臂·`sse:${principal}` 键隔离面·越权 404 面归 uc002-adv V4/V5 非本刀臂）。
  - **B6 UC-002 态源零额度副作用**：载体乙 isolated 真 PG+UC-002 场景种子（owned∧ingested 绑定壳+**夹具直置 status='waiting_user'（sentinel 借形：interview.status 无 CHECK（sql/01:20）可写·waiting_user 系 ai_graph_run 词表（sql/01:39）借形 sentinel·非产品 interview 状态机词（interview.service.ts:37-:38 产品状态机=created→completed|failed|abandoned）·在树直写先例 scor-00-http-db.proof.ts:151）·Ban 依赖 begin 推进状态（begin 后仍 created·五 case :303）**（rev r1·rev r2 更正词表引证）+额度种子·`seedBeginFixture` 形制 additive 重放）→ 6×429 风暴（同构最小模块·带 byPrincipal 计数）→ 断言分三层：**①可证伪零副作用臂**「6×429 期间 `db6.calls(STORM)` 增量=0（计数基线=holder 取数·拒连零 DB 触碰·UC184 领槽先于取数）」——此为 post 双审 P1 修复的核心（原「真 PG 夹逼」对风暴零灵敏度=不可 falsify，根因=不同池+不同主体：STORM≠OWNB6 且风暴打进程内最小模块）；**②boot 栈 fail-open 臂**「6 并发 /events 全 200 text/event-stream（fail-open 语义证伪式验证·burst 形 429 不可达 `rate-limit.service.ts:173-:175`+`:61-:66` 1s 探测节流）」；**③真 PG storm 后态稳定性（非因果）**「原会话 `GET :id` → 200+`status==='waiting_user'` 恒等+零假终态（无 interview_unavailable）」——只登记态源未被扰动，**不得读作风暴零假扣/零双扣/同主体夹逼的因果证据**（`:89`「输者不双扣」映射仅在①的拒连零副作用面成立）。**态源=sentinel 中段值（如实申明·断言面值无关）≠五 case 孤儿 reserved·同码不同态源如实申明沿 X16 S4 形**·**GET :id 断言面（rev r2）：TERMINAL_INTERVIEW（interview.service.ts:38）不含 waiting_user·get()（interview.service.ts:735-:766）零状态分支·interview-view.ts:12 status 直透**。
- **非替代申明（reason 级可分·Ban 互借关列）**：sse-principal-slot `692c4d01`（**单 client 框架+stub DB 零 ledger 臂+零 UC-002 行注册**（`:176` 层旁证归属）≠ B1–B5 双设备框架+UC-002 行注册+B6 真 PG ledger 臂=彼空集）· XREP XR-4 `38f67e16`（**跨副本集群合计面·0189 共享 PG lease 路径·措辞冻结「集群合计 5 条」**≠ 本刀单进程进程内 Map 面·两措辞互斥 Ban 互窜）· 五 case SSE-FAULT-01 429 子臂 `0fb8f654:311-:378`（**孤儿 reserved 态源·UC-017 行**≠ B6 sentinel 中段态源（waiting_user 借形·如实申明）·UC-002 行）· uc002:lease `eea67481`（**db thread-graph fence CAS 面**（`withInterviewGraphFence`）≠ SSE 槽租约口（`acquireSlot`）——两 lease 原语 reason 级可分·NHP-002-BOUND-01 `:43` 收据零触）· uc002:http `1631ba27`（H1–H3 GET/LED 面·**零 429 臂亲证**·G-GAP 五 pin 零触）· uc002:adv `a26d145d`（跨用户 404 no-leak 面·零 429 臂）· report_retry_limited 429（uc019-adv V4·**REPORT_RETRY_RL token bucket≠slot lease 不同口不同桶**·wash 规避）· uc010 族（旁证≠002 covered 钉死不变）。

**红停双标注（不可测两面·如实登记不入臂·裁决权归协调方）**：
- **红停① HTTP thread lease CAS 产品口**（eval §1b#1 `GAP-UC002-HTTP-LEASE-MOUTH`·`uc-e2e-002-cross-device-http.proof.ts:226` G-GAP pin 在钉）：产品路由不存在（§0.2 三亲证）·HTTP 口层**不可测（无嘴可打）**·scenarios `:89` 期望产品面现仅 db fence 承接（L1–L3 已证）·本刀 Ban 造产品码·**零他刀落零重叠登记**——归协调方二择一（造口|ADR 钉 db fence 承接）·**Ban 借本刀收据宣「HTTP lease mouth 已闭合」**（§1.1 `:173`/P0-7 `:269` 措辞仍真零触）。
- **红停② snapshot 专用口**（eval §1b#2 `GAP-UC002-SNAPSHOT-ROUTE`·`uc-e2e-002-cross-device-http.proof.ts:227` G-GAP pin「本 prove 用 GET /:id 顶替」在钉）：零 `/snapshot` 路由+零 ADR（§0.2 二亲证）·**不可测**·**零他刀落零重叠登记**——归协调方二择一（新路由|ADR 钉「`GET /:id` 即 snapshot」+题面/历史字段齐核）·本刀零臂零触。

---

## §1.3 否决表（落选项诚实留痕 · 含零残余判定登记 · 与认领核对互补）

| 落选项 | 否决/登记理由 |
|---|---|
| **裸 429 形重证臂**（单 client 5+1 具名码） | sse-principal-slot `:137-:164` 已行使同缝同形（HC-GAP-007 #98）→ 同缝再臂=**wash** · 本刀 B2 仅随 B1 双设备框架行使·零独立裸形臂。 |
| **跨副本/集群槽臂**（双 OS 进程·0189 共享 lease） | XREP XR-4 已行使且 closed（checklist `:1660`·#173·措辞冻结「集群合计 5 条」）→ wash · 本刀零跨进程臂（Ban 越界+措辞互斥）。 |
| **boot 栈本体 429 臂** | 五 case `:30-:33` 亲证 fail-open `rate-limit.service.ts:173-:175` 致 429 在 booted 栈不可达 → 该形**机制不可达**（非红停系承载已解=自建最小模块先例形·如实申明非产品路径）。 |
| **跨主体 404/SSE authz 臂** | uc002-adv V4/V5+五 case NEG-01+H-authz 三层已行使 → wash · 零残余。 |
| **thread lease CAS HTTP 臂** | 产品口不存在=**不可测**（§0.2 三·红停①）· 零臂对准留痕。 |
| **snapshot 口臂** | 产品路由+ADR 双零=**不可测**（§0.2 二·红停②）· 零臂对准留痕。 |
| **PERF/LOAD 槽口臂** | 矩阵 `:147` PERF 行显式 blind 保持（NHP-002-ADV-01 nail 不构成 PERF 证据同判）· 本刀零 PERF/LOAD 臂（Ban 偷关）。 |
| **扩写既有 uc002:http proof 加 429 臂** | 既有六收据零触令（§3-2）· 沿 X17「新 proof 不改旧 proof」先例形 · 新文件+新注册。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算·越限沿常设预授权恰等步进预登·本刀已触发随落卷行使）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2445**（stdout「public text policy scanned 2445 managed worktree files」亲读）· cap=**2445**（`public-text-policy.mjs:253` `MAX_FILES = 2_445` 亲证）——**2445=cap 恰等零余量**·本卷新文件 +1 → **2446 > 2445 必越** → 沿总盘派单常设预授权「越限沿先例步进承登」**+8=2445→2453**（+8 起草刀先例形·X16 2410→2418/XREP 2428→2436/X17 2430→2438 同形·本刀净增受管 2 件（REQUEST+EXEC proof）届终 2447≤2453·余 6 系在飞共享余量沿 cap 2152 先例形）：①`public-text-policy.mjs` `MAX_FILES 2_445→2_453`+UC2B 步进注记两行置顶插 MAX_FILES 上邻（栈史零洗）；②`public-text-policy.proof.mjs` 越限臂四处联动（`:435` `i<2_453`·`:442` atCap 2_453·`:446` `f-2453.md`·`:448` `FILE_LIMIT:2454`）+CAP-SANCTION-2453 注记置顶插链区（`:433` 上邻）；③**语义申明：计数预算联动零门语义变更·越限臂 fabricated 数随 cap 联动同步·proof 强度不减**·本树 `public-text-policy.proof.mjs` 亲跑 **12/12 EXIT=0**（2453/2454 双值全行使）·起草树终态 **2446 ≤ 2453**；EXEC 期 +1 proof=2447 ≤ 2453（若 EXEC 期在飞并线致 tree 实测 >2453 → 触「验收红不可修」停手上报·Ban 就地再改 cap；在飞先并线则届值按合并树实测重算如实承登）。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·四词面+行首冲突标记严格形·逐词面组装式亲读该锚·不复抄卷内防自指）grep 零命中（起草席亲跑·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 3 tracked 路径**=本卷 .md+`public-text-policy.mjs`+`public-text-policy.proof.mjs`；EXEC 期 diff 面=本卷+新 proof+注册行（root `package.json:231-:238` 邻区双行/apps-api `package.json:36-:37` 邻区单行）+runner 注册位三位（EXEC 届时重 pin·§1 承登）+双表行内改（矩阵 `:113` BOUND 格邻区+case-matrix `:43` 邻区 §1.2 一新行）+tracked 收据 `ai-docs/delivery/receipts/nhp-002-http-bound/`（`.log`/`.txt` 按届时 TEXT_EXTENSIONS 亲证口径）——届时逐件登记·多任何未登记 tracked 路径即停。**EXEC 收据须复述红停①②短句（两不可测面登记防随 EXEC 蒸发·沿 X17 GAP 复述条款形）·rev r1 增停令：EXEC 开工前对红停两面重跑 §0.2 二/三 亲点/grep 亲证；任一面预期外存在（含侦察遗漏·非他刀新落）→停·如实上报·Ban 静默复述短句/Ban 静默改臂**。
4. **EXEC 预基面（届时重 pin）**：`pnpm uc002:nhp-http-bound:prove` EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· **机锁子门（post 双审 P2-8·抑制静默删断言）**：tracked 收据 stdout `grep -c '^PASS'` 对表 **asserts=34**，且逐臂计数 **B1=6/B2=3/B3=2/B4=3/B5=4/B6=16**（`grep -c '^PASS  B1'` 等同表·任一臂计数漂移=门红）· 邻面不回退（`uc002:http:prove` H1–H3+H-authz 断言恒等+`uc002:lease:prove` L1–L3 恒等+`sse-slot:prove` 恒等·按届时 SSOT 口径）· 双表同步 diff 逐件登记（§1.0.3 `:166` 令）· **lint 帽承登预置**：EXEC 期新 proof 如添 warning → 沿批 C/X16/X17 §9-post 双帽恰等步进先例形·协调方 sanction 面·非本起草刀落码 · 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:113` BOUND 格与 case-matrix §1.2 新行措辞仅允许「partial 保持+case-only 收据注」诚实登记 · coveredCount=8 零翻转 · `:173`/`:269`/`:147` 零触 · Ban 借本收据宣 UC-002 covered/BOUND 格升格/「HTTP lease mouth 已闭合」/「snapshot 口已闭合」（红停两面未闭合）· Ban 借收据 wash sse-slot/XR-4/五 case/uc002 三 prove（本刀臂与其 reason 级可分·互不借用）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行+runner 注册位·沿 uc015/uc016/X17 prove-only 先例形）。
2. **既有收据零触**：`sse-principal-slot.proof.ts`/`sse-cross-replica.proof.ts`/`uc-e2e-017-orphan-http-sse.proof.ts`/`uc-e2e-002-cross-device-http.proof.ts`/`uc-e2e-002-adv-led-crossuser.proof.ts`/`packages/db/test/uc-e2e-002-cross-device-lease.proof.ts` + `harness/uc-e2e-002-cross-device.eval.md` 域——只读。
3. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
4. **红停两面零越界**：Ban 造 `/snapshot` 路由/thread-lease HTTP 口/ADR（§1 红停①②裁决权归协调方）· Ban 触 0189 共享 lease 面（XREP 专属）· Ban 「每副本 5 条」措辞（XR-4 冻结）。
5. **covered/queue 翻面零预支** · **零迁移零配置零 Key**（B6 场景种子系隔离夹具沿豁免具名·非迁移）。

## §4 依赖

**①上游已满足**：产品嘴在树（`interview.controller.ts:257-:279`+`rate-limit.service.ts:150-:198` 对码亲证）+ 载体甲先例形（`sse-principal-slot.proof.ts:91-:131`）+ 载体乙先例形（五 case boot 栈+`seedBeginFixture`/429 最小模块 `0fb8f654`）+ 断言形先例（XR-4 `xrep-REQUEST.md:99-:101`+sse-slot `:137-:188`）+ BOUND 行形先例（case-matrix `:74` NHP-017-HTTP-BOUND-01+`:66` NHP-014-BOUND-01 gap→case-only 证据行形）+ runner 注册同族三位（`uc002:http:prove:raw` 在树亲点）。**②同文件并发**：起草 turn 恰 1 新 .md+policy 两 script 数值联动零交涉面（在飞线对同两 script 的注记栈/cap 行交涉按 §0.0 dual-keep 先例处置）；EXEC 期触矩阵 `:113` 邻区与 case-matrix `:43` 邻区——§0.0 在飞交叠复核必做。**③下游**：UC-002 BOUND 格 case-only 收据供 §1.1/§1b 抬 covered 评估族引用（评估权归后继刀·本刀 Ban 代评）；红停两面裁决包归协调方（造口|ADR 二择一·各需独立 REQUEST 全链）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含升格 partial/借旁证 wash/实例宣伞）；Ban live key（零 Key 面硬跑·est live=0）；Ban 触产品码面/迁移/CI 告警配置（cap 值外数值联动按 §2-1 预授权形·越值红停上报）；Ban 触 sse-slot/sse-cross-replica/五 case/uc002:http/uc002:adv/uc002:lease 六既有 proof 与 eval harness、UC-017 专属线、UC-010 族、共享 SSOT；Ban 造 `/snapshot` 路由/thread-lease HTTP 口/ADR（红停①②归协调方）；Ban 「集群合计 5 条」与「进程内 5 条」措辞互窜（XR-4 冻结·本刀臂面=进程内 Map 形如实标注）；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·枚举：①B6 场景种子（绑定壳+begin 链+**状态种子写（夹具直置 status='waiting_user'·rev r1）**+额度种子·`seedBeginFixture` 形制）——枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；**Ban 借本刀收据宣「HTTP lease mouth/snapshot 专用口已闭合」**（红停两面措辞 `:173`/`:269` 仍真）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（docs-only+policy 数值联动·门=本地 node 脚本）。EXEC 期：est live=**0**（载体甲进程内最小模块零 PG 往返；载体乙隔离真 PG 本地容器·零 MODEL_API_KEY 零 drain 零 live worker·B6 begin 系本地隔离库产品路径·keyless 判定核=eval `:7`「MODEL_API_KEY 不需要（lease CAS + HTTP dual-session 均无 Key）」+本刀 B1–B6 全臂无模型触点亲证）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+policy 两 script 数值联动·起草 turn）五类标记词 + conflict-marker grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径·不复抄卷内防自匹配——沿 X17 §7 同形制）。

## §8 STOP · **`executed:awaiting_post_prove_dual`**（2026-10-26 EXEC 落卷翻面·起草停令条款史录保持·停止条件对 post-prove dual 审继续有效）

**开工三条款**（EXEC 前置·缺一即停）：①pre-exec 双审 BOTH PASS 落卷（两独立外席·alone≠dual）；②协调方明示 EXEC 授权（含 §2-1 cap 步进 +8=2445→2453 追认）；③§1 修法面/§5 Ban/pins/§1.3 否决面零改动（§0 对开工 tip 全量重 pin）。停止条件：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（`:113` BOUND 格列值被他刀改写 · 槽口嘴 `:257-:279`/`acquireSlot` 码面漂移 · 六既有收据被改写 · 红停两面被他刀落（造口/ADR 落地）· 在飞并线改写 case-matrix `:43` 邻区或 policy 注记栈致本卷 §2-1 分界面失准）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §0.2/§1 对码期望不符（跨设备共享桶不成立/第 6 条非 429 具名码/拒连付取数/释放后设备 B 不可再占/异主体被扰/**B6 可证伪臂红=6×429 期间 storm 主体 DB 增量≠0**/boot 栈 6 并发非全 200（fail-open 失效·burst 形 429 可达）/storm 后态稳定性观测异常）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 1 case B1–B6 臂面（需触产品码/红停两面落臂/跨副本 0189 面/六既有 proof/covered 翻面/共享 SSOT/迁移/cap 再步）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2453 / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。
- **红停两面预期外存在（rev r1 增停令）**：EXEC 开工前对红停两面（§0.2 二/三）重跑 grep 亲证；任一面预期外存在（含侦察遗漏·非他刀新落）→ 停·如实上报·**Ban 静默复述短句/Ban 静默改臂**。

## §9 状态

### §9-EXEC 落卷（2026-10-26 EXEC 立项日·dual r3 放行+协调方授权落码+行使·执行席亲跑）

**立项前置**：①pre-exec dual r1/r2 已落卷（r2 裁决=席2 清单全采纳）+r3 P2 四件随立项日履行（§0.0.3）；②协调方明示 EXEC 授权（派单「pre dual r3 双 PASS 放行·协调方授权落码+行使·colima 可用」）；③开工前红停两面复证（rev r1 增停令）——红停①「会话在别处」apps/+packages/ 恰 2 命中=既有 honesty pin `:7/:226`·产品 src 零命中；红停②interview.controller 全路由零 `/snapshot`（`:25` 系 begin header 注记词面非路由）+ADR 目录 0015–0022 七件零 snapshot ADR 零「GET /:id 即 snapshot」钉——两面预期外存在零·停令未触发。

**并线（§0.0.3 R3-④）**：`git fetch` EXIT=0·届值如实采 origin/main `0f41af1c4`（#182 r5mr 合卷已落·#181 isob/#180 uc3f/#177-#179 在前）·merge-base=33fdd233c 亲证·merge --no-ff 恰 2 处冲突=两 policy 脚本注记/cap 区·dual-keep 双留+号随 merge-tree 重排（main CAP-SANCTION-2446 三线/2447/2448 注记并留+本支 CAP-SANCTION-2453 双行+新增 UC2B EXEC 取大承登注记·MAX_FILES 取大恒 2_453 零再步进）·merge commit `6b2eea5b8`·pnpm install --frozen-lockfile EXIT=0 4.2s 零漂·在飞交叠复核=全 45 worktree 逐树扫 `33fdd233c..tip --not origin/main` 触面提交**零命中**·落码名 `uc-e2e-002-nhp-http-bound` 全树+45 树 grep 零碰撞。

**落码（§1 rev r2 终形六臂·两载体）**：`apps/api/test/uc-e2e-002-nhp-http-bound.proof.ts`——载体甲=sse-principal-slot 先例形最小模块（`:27-:28` AUTH_DEV_HEADER+NODE_ENV 守卫先设→自建 Module（interview+quiz+diagnosis 三口·post-fix P2-2 补 diagnosis 口）→listen(0,'127.0.0.1')→fetch→useValue `new RateLimitService()` Map 形）；载体乙=_neg-harness boot 栈真 PG（B6 场景种子=seedBeginFixture 形制 additive 重放+夹具直置 status='waiting_user' sentinel 借形+额度种子→begin 202 真产品嘴→6×429 风暴打同构最小模块（byPrincipal 计数）→storm 后态稳定性（非因果）+boot 栈 6 并发 fail-open 臂）。**34 断言 B1–B6 全绿**（B1×6 跨设备共享桶占满·面试/押题/诊断三口/B2×3 第 6 条 429 具名码+JSON 非 SSE envelope+槽恒 5/B3×2 拒连零取数零轮询（判据与 poll 节律解耦）/B4×3 waitFor('b4-slot-4',async () => slotCount(rl,'sse:${principal}')===4,15_000) poll-until（R3-① 落码注记在卷）+设备 B 再连 200/B5×4 异主体隔离+userA 双侧不变/B6×16 begin 202+sentinel 前置态观测+6×429 风暴+计数臂增量 0+boot 6 并发全 200+GET :id 恒等+零假终态）。

**attempts 台账（如实·post 双审 P2-7 补正）**：run1（09:11:21→09:11:43）红 **5 FAIL**（pre-block 3=`B6.begin HTTP begin → 202`/`B6.begin consumption 恰 1 行 reserved`/`B6.begin 额度 5→4`；clamp 2=`B6.clamp 额度桶恒值 4.0`/`B6.clamp consumption 零新增`——夹具缺 route decision/snapshot 预供给行致 begin 409 连带·五 case seedBeginFixture 同形补齐后转绿·**零断言谓词变·非 retry-to-green**；**红次 stdout 未留档·仅机器回执 outcome=failed/exitCode=1** 在 `.tmp/isolated-proof-receipts/2026-10-28T09-11-43-172Z-51316-…json`）→run2（09:13:31→09:13:50）绿→run3（09:14:11→**09:14:28 绿跑·post 双审补记**；与 run2 同 proof digest `8ec953a6`）→lint 三 warning 归零修整（import 序/object 字面量键改成员赋值/未用参 `_` 前缀·零断言面·proof digest 改 `eca9ebed`）→run4（fresh1 09:18:18）绿→run5（fresh2 09:18:43）绿。终态：`pnpm uc002:nhp-http-bound:prove` **EXIT=0 双 fresh**（fresh1+fresh2 各 34/34·stdout 留痕 receipts 01/02）。

**注册（EXEC 届时重 pin 承登）**：root `package.json:239-:240` 双行（`uc002:nhp-http-bound:prove`/`:prove:raw`·`uc002:adv` 族邻区后）·apps-api `package.json:38` 单行（`prove:uc002-nhp-http-bound`·`prove:uc002-adv` 邻区后）·runner `scripts/run-e2e-isolated.mjs` 三位=源清单位 `:1885`（`uc002:adv` 块后+位4 pre-migrate 迁移名单**不适用**申明在注：载体甲零 PG/载体乙 boot() sql/01-23+proof 内 0064/0049/0142 additive 夹具）+目标清单位 `:2799` 族行内插+分派位 `:3439`（uc002:adv 分支后）·位5 resource-caps 条件 `:4258` **不适用**（非 PERF/LOAD 臂·条件亲点未触）。

**门矩阵亲跑（§2·EXIT 原值）**：①docs:check **EXIT=0·scanned 2451**（≤cap 2_453 零余量 2·零步进行使·R3-④ union 算式在卷）；②markers 五类+conflict 改动集 grep **EXIT=0 零命中**+est live=0（零 Key 零模型外呼·boot() delete MODEL_API_KEY 承载）；③diff 面机检=本卷 REQUEST+新 proof+root/apps-api package.json+runner+矩阵 `:113`+case-matrix `:46` 新行+tracked 收据（1 .txt+9 .log·post 双审 P2-7 更正）——逐件已登记·零未登记路径；④邻面不回退：`uc002:http:prove` **EXIT=0**（13/13）+`uc002:lease:prove` **EXIT=0**+`sse-slot:prove` **EXIT=0**（stdout 留痕 receipts 03-05）+turbo typecheck @meetwise/api **EXIT=0**+新 proof eslint **EXIT=0 零 warning**（lint 帽零新增）；⑤行/列冻结=EXIT0=case≠covered·coveredCount=8 零翻转·`:113` BOUND 格 partial 保持+case-only 收据注·`:173`/`:269`/`:147` 零触·case-matrix §1.2 `:46` 一新行（§1.0.3 双表同步令）；egress：`provider-egress:prove` **EXIT=0**（词面零触·零 additive 登记）。docker info 亲证 EXIT=0（server 29.5.2·receipts 00）。

**红停双标注复述（防随 EXEC 蒸发·沿 X17 GAP 复述条款形）**：红停①=HTTP thread lease CAS 产品口不存在不可测（eval §1b#1 `GAP-UC002-HTTP-LEASE-MOUTH` 在钉·本刀 Ban 造口零臂）；红停②=snapshot 专用口路由+ADR 双零不可测（eval §1b#2 `GAP-UC002-SNAPSHOT-ROUTE` 在钉·本刀零臂零触）。两面措辞 `:173`（§1.1「缺 HTTP lease mouth + snapshot 专用口」）/`:269`（P0-7）**零触仍真**·裁决权归协调方·**Ban 借本刀收据宣两面闭合/UC-002 covered/BOUND 格升格**。

**落码名申明**：派单显化名 `uc-e2e-002-nhp-http-bound.proof.ts`/命令族 `uc002:nhp-http-bound:prove(:raw)`/`prove:uc002-nhp-http-bound`/收据 `receipts/nhp-002-http-bound/`（§1 修法形状行已注·§0.0 计划名零命中保持·语义同格零碰撞）。

**est live=0**（EXEC 期）：载体甲进程内最小模块零 PG 往返·载体乙隔离真 PG 本地容器（colima/docker 亲证）·零 MODEL_API_KEY 零 drain 零 live worker·B6 begin 系本地隔离库产品路径 keyless（eval `:7` 判定核）·B1–B6 全臂无模型触点。

**`executed:awaiting_post_prove_dual`**（2026-10-26 EXEC 落卷·本卷 EXEC 完成 ≠ covered ≠ 矩阵列升格（coveredCount=8 零翻转 · EXIT0=case≠covered · `:113` BOUND 格 partial 保持+case-only）· post-prove dual 两独立外席待审·状态翻面权归协调方 · ⛔push）。

### §9-post-fix 落卷（2026-10-30·post 双审席1+席2 互盲同判 FAIL·协调方裁决修复形·修复席亲跑）

**裁决与形态**：两席同根交叉印证 **P1=B6「真 PG 态源夹逼」因果链三重断开**——①不同池（storm 模块注入 `db6` 纯桩 query 恒返 `{rowCount:1,rows:[]}` 永不触 PG）②不同主体（`STORM=uc002s-<ts>` vs `OWNB6=uc002b6-<ts>`）③故 :418/:419 对 storm 零灵敏度=不可 falsify。采纳席2 方案 a（2-3 行代价）：db6 换 `createCountingDb()`（同形带 `byPrincipal` 计数·复用既有 helper）→ **新增可证伪臂**「6×429 期间 `db6.calls(STORM)` 增量=0」（拒连零 DB 触碰）；clamp 四臂改名「storm 后态稳定性（非因果）」并删「真 PG 夹逼·零假扣/零双扣/同主体」因果措辞（commit message/矩阵 `:46`/case-matrix/本卷）。席1 备选（storm 主体改 OWNB6+db6 接 asPrincipal(h.pool)）**不采**——429 在 Map 层拒仍不触 PG，夹逼仍非因果。

**并线**：`git fetch` EXIT=0·届值 origin/main **`44f624253`**（#177 uc50 二轮合卷已落·cap 届值承 2452）·`merge --no-ff` merge commit **`a566902e3`**·恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留（main CAP-SANCTION-2450 uc33p/2450 UC-050/2452 注记并留+本支 CAP-SANCTION-2453 UC2B 链）·合并树实测 **scanned 2455**（=main 2452+本支互斥受管目 3：`harness/uc2b-REQUEST.md`+proof+`receipts/nhp-002-http-bound/00-docker-info.txt`）>2453→**CAP-SANCTION-2455 恰等步进 2453→2455**（四联动点 2_455/f-2455.md/:2456·PTP 12/12 亲跑）。

**P1 修复落点**：`apps/api/test/uc-e2e-002-nhp-http-bound.proof.ts`——`B6` 段 `db6` 由纯桩改 `createCountingDb()`（:142 helper 复用）·新增臂 `B6.storm 6×429 期间 storm 主体 DB 触碰增量=0`（基线=`db6.calls(STORM)`·本 run 观测 10=5 holder 初始 catch-up+5 立即补偿取数·风暴后仍 10）·原四 clamp 臂→`B6.steady` 两臂（GET :id 恒等+零假终态）并显式标注**非因果**·删两臂（额度桶恒值/consumption 零新增）。矩阵 `:46`/覆盖矩阵 `:113`/本卷 §1 B6 同步改如实命名。

**P2 逐条落点**：
1. **B3 判据解耦**：`diff===5` → `m.catchUp.get(DEV)===5`（与 poll 节律无关），diff 降为 `B3 观测（日志非判据）` 日志（本 run 增量=5）。
2. **第三口 diagnosis**：载体甲 Module 补 `DiagnosisController`+`DiagnosisService`（`diagnosis.controller.ts:54-55` 逐字同形 `sse:${principal}`+acquireSlot(5)），B1 第 2 条改诊断口（三口交叉·断言总数不变 34）。
3. **夹具 GUC**：proof :253 改 `SELECT set_config('app.principal_user', $1, true)`（事务级·沿 `packages/db/src/principal.ts asPrincipal` 同形·消插值）。
4. **fail-open 臂**：boot 栈补「6 并发 /events 全 200 text/event-stream」（`rate-limit.service.ts:160` db+节流分支+`:173-:175` catch fail-open+`:61-:66` 降级期 1s 探测节流·**burst 形不可达**措辞替换「结构不可达」）·替换空转 clamp 2 条。
5. **runner 源清单补件**：`:1918` 块补 `interview-view.ts`+`packages/db/src/index.ts`+`diagnosis.controller.ts`+`migrations/0142_candidate_profile_route.sql`（裁决四件）+`diagnosis.service.ts`（补 diagnosis 口连带导入·同族增登）。
6. **标签**：B2 「三次拒绝」→「第 6 条被拒」+补 `content-type application/json` 判据。
7. **台账**：§9-EXEC attempts 补 run1 5 FAIL 逐名+「红次仅机器回执·stdout 未留档」+09:14:28 绿跑补记；收据计数改 1 .txt+9 .log；红停锚 `:182/:278`→`:173/:269`；§2-3 目录名改 `nhp-002-http-bound`。
8. **机锁子门**：§2-4 增 asserts=34+逐臂 6/3/2/3/4/16（tracked 收据 stdout grep 对表）。
9. **tracked 收据补件**：`10-redstop-restatement.log` 逐字复述红停两面（thread-lease CAS 产品口不存在不可测/snapshot 专用口路由+ADR 双零不可测）。

**attempts 台账（post-fix·红/绿/修全记·如实）**：postfix-run1 **红 1/34**=`B6.storm 6×429 期间 storm 主体 DB 触碰增量=0`（新臂首跑；根因=断言谓词把基线写死 `===5`，而 count 实测 **10**=5 holder 初始 catch-up+5 立即补偿取数——**机制面零发现·非产品缺陷**）→修正谓词为 `baseline>=5 && after===baseline` 并加 `B6.storm 观测（日志非判据）` 留值（非放宽：基线活证据保留，增量仍须严格 0）→postfix-run2 绿 34/34→fresh1 绿 34/34→fresh2 绿 34/34→（注释补正后）fresh1/fresh2 再跑双绿（收据 11/12·proof digest `4cf486f0` 与 commit 一致）。

**重跑门矩阵（post-fix·EXIT 原值）**：`pnpm uc002:nhp-http-bound:prove` **EXIT=0 双 fresh**（fresh1 34/34+fresh2 34/34·逐臂 6/3/2/3/4/16 两跑恒等·stdout receipts 11/12）·docs:check **EXIT=0·scanned 2455**（=cap 2_455 恰等·receipts 13）·PTP **12/12 EXIT=0**（receipts 14）·markers 五类+conflict 改动集 **0 命中**·provider-egress **EXIT=0**（receipts 15）·邻面 `uc002:http:prove` **13/13 EXIT=0**+`uc002:lease:prove` **EXIT=0**+`sse-slot:prove` **EXIT=0**（receipts 16-18）·`pnpm -C apps/api typecheck` **EXIT=0**·新 proof eslint **EXIT=0 零 warning**·diff 面=本卷+proof+runner+双表+policy 两脚本（CAP-SANCTION-2455 四联动点）+收据 10-18（.log 不计受管）。

**STOP 终态**：维持 **`executed:awaiting_post_prove_dual`**（post-fix 完成≠post 复审 PASS≠covered·coveredCount=8 零翻转·`:113` BOUND 格 partial 保持+case-only·红停①②两面零臂零触·⛔push·待 post 复审）。

---

*UC2B REQUEST · 2026-10-26 起草落卷 · 认领=UC-002 BOUND 格（`:113`）HTTP 槽租约口层残余（`NHP-002-HTTP-BOUND-01` B1–B6 六臂两载体·与 sse-slot HC-GAP-007/XR-4 集群面/五 case 429 子臂/uc002 三 prove reason 级可分·§1 非替代申明）· **红停双标注如实入卷**：HTTP thread lease CAS 产品口（eval §1b#1·产品口不存在不可测）+snapshot 专用口（eval §1b#2·路由+ADR 双零不可测）——两面**零他刀落零重叠登记**·裁决权归协调方·Ban 借本卷宣两面闭合（`:173`/`:269` 措辞仍真零触）· 矩阵 fresh 行号=`:113`/`:122`/`:173`/`:182`/`:267`/`:269`+case-matrix `:43`/`:66`/`:68-:77` @`33fdd233c` 亲点 · 槽口嘴锚=`interview.controller.ts:261-:262`（`sse:${principal}` 键+429 `too_many_streams` 具名码）+`:278` finally 释放+`rate-limit.service.ts:158-:198`（进程内 Map 形/fail-open `:173-:175` 机制源）· cap 步进 **2445→2453**（docs:check scanned 2445=cap 恰等+REQUEST 1 件必越·起草刀 +8 先例形·PTP 12/12 EXIT=0 亲跑·起草树终态 2446≤2453·EXEC +1 预登 2447≤2453）· keyless=eval `:7` 亲证 · est live=0 · markers=0 · pins 十一值零翻 · releaseEvidence=false · ≠HA · ⛔push*
