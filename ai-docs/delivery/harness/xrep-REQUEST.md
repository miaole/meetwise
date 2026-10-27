# XREP REQUEST — 跨副本 SSE 槽/播双 OS 进程证明起草卷（`HC-GAP-008`·`GAP-SSEPUSH-CROSS-REPLICA`·`GAP-UC010-CROSS-REPLICA` 三登记行共面·XR-0…XR-5 六臂刀形）（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-28 起草落卷·alone≠dual·Dual PASS ≠ 开工·本 commit 不预 claim 任何 post-commit EXIT·STOP 三处钉：本 Status 行 + §8 + 卷尾 同值）。

**席位**：meetwise 跨副本 SSE 起草席（docs-only 起草·定标侦察席刀形行使·协调方授权·⛔push ⛔动主仓）。
**基线**：`origin/main` @ **`7950f45bd`**（full `7950f45bde12f53848eb4c2225d4d1061d317f3e` · `git fetch origin` 本 turn 成功 · 分支 `line/xrep-draft` 零独有 commit · worktree `meetwise-xrep`）· `node scripts/ai-docs/check-docs.mjs` 本树起草前亲跑 **EXIT=0 · scanned 2428**（≤ cap 2428 恰等零余量·§2-1 预算核·起草落卷随刀步进承登）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/architecture/current-runtime-truth.md`（`:125` 每进程 5 条/跨副本槽仍开 · `:274` `sse-slot:prove` 不证明跨副本）→ `ai-docs/architecture/backend/high-concurrency-review.md`（`:108-:114` 证明面 · `:163-:164` GAP-006/007 · `:176` `HC-GAP-008` 行 · `:192` 007 关闭注记）→ `ai-docs/delivery/execution-master-checklist.md`（`:1658` Non-claims · **`:1659` STILL OPEN `GAP-SSEPUSH-CROSS-REPLICA`**）→ `ai-docs/delivery/harness/uc-e2e-010-sse-resume.md`（`:47` 非目标 · `:62` §1b 第 5 项 `GAP-UC010-CROSS-REPLICA`）→ `ai-docs/delivery/harness/ssepush-notify-REQUEST.md`（捕获窗/tap 自装先例卷）→ `ai-docs/delivery/harness/sse-adv-REQUEST.md`（`:146`/:201 P2 同进程跨流旁证界）→ `ai-docs/delivery/harness/ha-track.multi-instance.md`（HA 工具轨非替代界）→ 机制源 `apps/api/src/platform/rate-limit.service.ts` / `sse-notify.service.ts` / `sse-pump.ts` / `last-event-id.ts` / `packages/db/migrations/0189_api_harden_shared_state.sql` / `0214_interview_event_statement_notify.sql` → 证明先例 `apps/api/test/sse-push-notify.proof.ts`（0143/语句级自装形）· `sse-principal-slot.proof.ts`（无库单进程槽形）· `uc-e2e-025-nhp-bound-isolated.proof.ts`（三层隔离壳形）· `apps/worker/src/token-stream.ts`（token 通道发布面）→ `scripts/run-e2e-isolated.mjs`（注册位）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`execution-master-checklist.md:1659` **`GAP-SSEPUSH-CROSS-REPLICA`（单进程单 LISTEN · 跨副本未证）**；②`current-runtime-truth.md:125/:274` **`HC-GAP-008`**（跨副本槽仍开·`sse-slot:prove` 不证明）；③`high-concurrency-review.md:176` `HC-GAP-008` 行（槽与 2s 轮询均为单进程）；④`uc-e2e-010-sse-resume.md:62` §1b 第 5 项 **`GAP-UC010-CROSS-REPLICA`**（跨副本 SSE 槽合同·非仅进程内）；⑤收据 PIN 双处（`receipts/evidence-delivery/2026-10-10-sse-push-notify-final.log:85`·`receipts/ssepush-notify/judgment-run-stdout-attempt1.log:87`——「跨副本 SSE 槽/播 HC-GAP-008 未证(单进程单 LISTEN)」）；⑥协调方派单令（定标报告六臂刀形 XR-0…XR-5 + P1 三环境陷阱·本卷即其起草兑现）。

---

## 认领核对 · 登记处 fresh 亲点（本卷核心盘点 · 逐行对 `origin/main` @`7950f45bd` 亲读·file:line 逐字）

| 登记处 | 对树行使证据（file:line 亲读逐字） | 判定 |
|---|---|---|
| `HC-GAP-008` 主登记 | current-runtime-truth.md `:125`「跨副本槽仍是 `HC-GAP-008`」·`:274` `sse-slot:prove` 行「不证明……跨副本槽（`HC-GAP-008`）」·high-concurrency-review.md `:176` 行「槽与 2s 轮询均为单进程｜多 API 副本｜N 副本时可开到 `5N` 条连接（今日即如此）」 | **开**（亲点维持） |
| `GAP-SSEPUSH-CROSS-REPLICA` | execution-master-checklist.md `:1659`「`GAP-SSEPUSH-CROSS-REPLICA`（单进程单 LISTEN · 跨副本未证）」（STILL OPEN 行登记 · 均不关闭）·`:1658` Non-claims「≠ 跨副本 SSE 槽/播（HC-GAP-008 未证）」 | **开**（亲点维持） |
| `GAP-UC010-CROSS-REPLICA` | uc-e2e-010-sse-resume.md `:47` 非目标「跨副本 SSE 槽｜`HC-GAP-008`；`sse-slot:prove` 仅进程内」·`:62` §1b 第 5 项「跨副本 SSE 槽合同（`HC-GAP-008`；非仅进程内 `sse-slot:prove`）→ slot · `GAP-UC010-CROSS-REPLICA`」 | **开**（亲点维持） |
| 收据 PIN 旁证 | `receipts/evidence-delivery/2026-10-10-sse-push-notify-final.log:85`·`receipts/ssepush-notify/judgment-run-stdout-attempt1.log:87` 双处 `PIN GAP-SSEPUSH-CROSS-REPLICA: 跨副本 SSE 槽/播 HC-GAP-008 未证(单进程单 LISTEN)` | 旁证一致 |

**定性沿承（本刀=证明缺口非机制缺口·沿承亲证）**：机制面已集群精确在树——①**0189 共享 lease 已集群精确**：`0189_api_harden_shared_state.sql:40-:45` `platform_slot_lease` 表 + `:82-:105` `gateway_slot_lease_acquire`（单语句 INSERT…ON CONFLICT…WHERE n<max OR expired 原子占·过期接管）+ `:109-:121` release 对称减零减穿；`rate-limit.service.ts:9-:11/:158-:181` SSE 三控制器共享 `sse:${principal}` cap=5 槽落该表（生产 DI 有 DbService=共享模式·`:26` 进程内 Map 仅「无 DbService 测试缝」）——跨副本合计语义由单行原子 UPSERT 结构性保证。②**0214 广播内生**：`0214_interview_event_statement_notify.sql:9-:27` interview_event AFTER INSERT **按语句** `pg_notify('interview_event_ch', stream_key)`——任一副本落库即全库广播，每副本 `sse-notify.service.ts:6-:9/:271-:285` 恰一条专用 LISTEN（max:1 池）各自收播、各自泵 `seq>lastSeq` 取数（`sse-pump.ts:22-:30` D5 waiter 先于取数）——广播复制对副本数内生，零粘性零跨实例通道。**故三登记行所缺=「两个 OS 进程」证据形**：现证面全部单进程（`sse-slot:prove` 无库 HTTP hijack 计数 stub·`sse-push-notify`/`uc010` 单进程壳·`sse-adv` 同进程跨流）——本刀补两进程证明，非修机制。**Ban 借本卷宣机制变更**：机制若 EXEC 期被证与 §0.2 期望不符 → 停止条件「机制不满足」如实升级（产品缺陷=EXIT1 诚实保留+backlog 登记）。

**文档措辞漂移登记（如实·订正权归协调方·本卷零触该页）**：`high-concurrency-review.md:47/:176`「槽是进程内 Map」「今日 5N」措辞对 0189 后 `rate-limit.service.ts` 共享 lease 实现存在滞后候选——0189 EXEC（`f31d56d1`）在 `7950f45bd` 祖先亲证，生产共享模式下集群合计=5 非 5N。本卷 §1 XR-4 以「集群合计 5 条」口径行使；该页措辞订正归协调方 SSOT 面。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`7950f45bd`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **36 树**实测——`line/xrep-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep xrep` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md+两 policy 脚本数值联动）；EXEC 期触面=隔离 prove 新文件+注册行（root/`apps/api` package.json）+runner 注册位（`scripts/run-e2e-isolated.mjs` 四位：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单·位5 resource-caps 按 xu001 先例可选非 PERF 不适用承登）+收据 tracked 面。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `7950f45bd` 之后新增提交 → 触停止条件「现场漂移」停手上报。**注册区=高汇聚区**（近五次并线 #157–#165 均触 runner/policy 区）——union dual-keep/additive 沿 #162–#165 先例形，merge-tree 预演必做。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/execution-master-checklist.md` | `2bc96915`（4488） | **`:1659` STILL OPEN `GAP-SSEPUSH-CROSS-REPLICA`（单进程单 LISTEN·跨副本未证）+ 同行 `GAP-SSEPUSH-REG-WINDOW`（initial 取数→waiter 注册 ~ms 窗·窗内事件兜底收 ≤30s 非丢失·退化态 2s 收）**·`:1658` Non-claims |
| `ai-docs/architecture/current-runtime-truth.md` | `7b44790b`（297） | **`:125` 每进程每主体最多 5 条 SSE（进程内 Map）/跨副本槽仍是 `HC-GAP-008`**·`:274` `sse-slot:prove` 行不证明跨副本 |
| `ai-docs/architecture/backend/high-concurrency-review.md` | `a72b2011`（228） | `:108` 隔离/远程库禁 compose.dev·`:113-:114` 两证明面行·`:163-:164` GAP-006/007 行·**`:176` `HC-GAP-008` 行**·`:192` 007 关闭注记（跨副本仍开） |
| `ai-docs/delivery/harness/uc-e2e-010-sse-resume.md` | `06e29b3a`（122） | `:47` 非目标跨副本·**`:62` §1b 第 5 项 `GAP-UC010-CROSS-REPLICA`** |
| `packages/db/migrations/0189_api_harden_shared_state.sql` | `a291b62e`（163） | **`:40-:45` `platform_slot_lease` 表（slot_key PK/n/held_until_ms）·`:82-:105` `gateway_slot_lease_acquire`（原子占+过期接管）·`:109-:121` release 对称减**·`:135-:142` EXECUTE 仅授 `app_gateway_role`·`:40` 注释自钉「SSE 三控制器共享 sse:${principal} cap=5」 |
| `packages/db/migrations/0214_interview_event_statement_notify.sql` | `d1f36f17`（27） | **`:9-:20` `sse_event_notify_after_insert()` 按语句 `pg_notify('interview_event_ch', DISTINCT stream_key)`·`:22-:27` trigger `interview_event_sse_notify`**·`:4` 「原逐行迁移文件的字节不改」 |
| `apps/api/src/platform/rate-limit.service.ts` | `fce544ff`（200） | `:9-:11` 槽落 PG lease·`:26` 无 DbService=纯进程内测试缝·`:41` slotLeaseMs=12min·**:46-:51 `markSharedDegraded`→`RL_SHARED_DEGRADED reason=pg_error fallback=…`**·`:60-:66` 降级试探节流·`:158-:181` `acquireSlot`（`:166-:169` 网关调用·**:173-:175 PG 败即 fail-open 放行**）·`:184-:199` `releaseSlot` |
| `apps/api/src/platform/sse-notify.service.ts` | `a20b0720`（500） | `:6-:9` 恰一条专用 LISTEN·`:24-:26` 单例禁每 SSE 一条·`:28` `interview_event_ch`·`:31-:36` `interview_token_ch` 纯 NOTIFY 零表零触发器（worker 直发）·`:38-:43` 帧契约·**:86-:90 `onPrincipalEvict` 首订阅者即 `getSseNotify().whenHealthy()`（模块级懒起）**·`:107` 健康型·`:144-:146` 探针钉值·`:171` 初态 `{healthy:false,'listen_down'}`·**:190-:193 `whenHealthy()`**·`:223` `subscribeToken`·`:271-:285` `ensureStarted`（max:1 池）·`:418` `degrade()`·**:433-:478 `establish`（`:462-:467` pg_trigger 实证 0 行→`loseClient('trigger_missing')`）**·`:310-:321` 三通道分流·`:323-:345` token 帧校验+`tokenRouter` 分域 |
| `apps/api/src/platform/sse-pump.ts` | `b93121dc`（223） | `:12` `Promise.race([notifyWait, sleep(fallbackMs)])`·**:23 D5 每轮先注册 waiter 再取数**·`:61-:64` `deltaSource` 注入缝（interview 接线·quiz/diagnosis 零触）·**:70-:71 `HEALTHY_FALLBACK_MS=30_000`/`DEGRADED_POLL_MS=2_000`**·`:74` token 环 256·`:79` 背压 1MiB·`:135` deadline 10min |
| `apps/api/src/platform/last-event-id.ts` | `40b12d01`（18） | `:7-:18` `parseLastEventId` fail-closed（非法游标 400 `invalid_last_event_id`） |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280） | **`:257-:262` events（`:260-:261` 领槽先于取数·`:262` `acquireSlot('sse:'+principal,5)` 败→429 `too_many_streams` 非 SSE）·`:264` initial catch-up·`:278` finally `releaseSlot`** |
| `apps/api/test/sse-push-notify.proof.ts` | `3056a929`（934） | **`:84-:85` readFileSync 真 0143 迁移字节·`:240-:248` Phase B 装真 0143→健康翻转（自装后置先例形）**·`:360-:389` Phase F2 语句级迁移字节重放 |
| `apps/api/test/sse-principal-slot.proof.ts` | `692c4d01`（204） | 无库 HTTP hijack 5+1→429 单进程形（`HC-GAP-007`·跨副本不证明·非替代申明 §1） |
| `apps/worker/src/token-stream.ts` | `3f601319`（219） | `:148` `SELECT pg_notify($1,$2)` best-effort 直发（token 通道发布面·写败丢帧不补发） |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `0c6e778d`（212） | `:49` NHP-010-ADV-02（同进程跨流·case-only·非替代）·`:166` NHP-HA-FAILOVER-RTO-01（out-of-scope 界） |
| `scripts/ai-docs/public-text-policy.mjs` | `45a363ff`（526） | `:228` `MAX_FILES = 2_428`（cap 亲证·§2-1 预算核）·注记栈顶 `:227-:228` CAP-SANCTION-2428 |

### 0.2 码面锚（三环境陷阱钉位 + 六臂对码期望值 · 期望值逐条对码亲证 @`7950f45bd`）

**陷阱① · 两 OS 进程硬前提（定标 P1-1）**：进程级单例/模块级状态面四处在树——`getSseNotify()` 单例（`sse-notify.service.ts:24-:26`「禁每 SSE 一条 LISTEN」·每进程恰一条专用 LISTEN 连接）·`RateLimitService.slots` 进程内 Map（`:151`·仅无 DbService 缝用）·模块级 `principalEvictHandlers`/`principalEvictSeq`（`:69-:77`）·`sse-registry` 进程级注册表。**同进程双 `createApp` 实例禁用**：两 app 共享同一组模块级单例 → LISTEN 一条/路由表一份/evict 序一份 → **退化单副本语义**（跨副本命题失真·假绿）。**子进程轻量入口禁全量 harness boot**：`_neg-harness` boot=22 卷自 DROP 重置+选迁移装载+`assertIsolatedTestTarget`（`:55-:100` 亲读）——双子进程各自全量 boot 必互相 DROP 清库且重复预置。**schema 父进程一次性预置**：父进程（proof）装载一次 schema+自装件，双子进程以轻量入口（`createApp`+`listen(0)`+`whenHealthy()` 上报·零 schema 装载零断言面）连同一隔离库；**双 OS 进程硬断言=两子进程 PID 相异 + 双端口相异 + 双 LISTEN 连接各自在位**。

**陷阱② · 0214 自装后置（定标 P1-2）**：harness 装载面=sql/01–22+选迁移（0037/0038/0039/0046/0178/0172/0173/0167/0168/0169·`_neg-harness.ts:79-:100` 亲点）——**0214 不在其列**（0143 亦不在·`sse-push-notify.proof.ts:84-:85/:240-:248` 同境自装先例）。故 proof 须于**父进程 schema 预置后、子进程首 LISTEN establish 前后闭环内**自装 **0214 真迁移文件字节**（readFileSync+query·非转录·沿 0143 先例形）。缺自装的后果链=`establish :462-:467` pg_trigger 实证 0 行→`trigger_missing` 降级（`:418` 同因去重不重发）→泵回落 `DEGRADED_POLL_MS=2s` 轮询（`sse-pump.ts:71`）——**交付臂仍可假绿（2s 轮询把广播语义完全旁路）**。故 **XR-0 健康门=双子进程各自 `whenHealthy()` 落 `{healthy:true}` 硬断言**，把「降级轮询假绿面」封死在前：健康门不过即停判（环境红·非臂红）。

**陷阱③ · 0189 共享路径前置断言（定标 P1-3·fail-open 假绿防）**：`rate-limit.service.ts:173-:175` PG 往返败即 **fail-open 放行**（资源保护非安全边界）+`:46-:51` `RL_SHARED_DEGRADED` 结构化线。XR-4 槽臂前置双断言：①改动集日志捕获窗内 **`RL_SHARED_DEGRADED` 零命中**（捕获窗沿 ssepush tap 先例形·boot 前安装）——fail-open 若介入，第 6 条被放行→XR-4 红为环境红非机制红，前置断言把环境形与机制形分口；②5 条占满后**`platform_slot_lease` 行在**（`slot_key='sse:'+principal`·`n=5`·`held_until_ms>now`·属主连接只读断言·表形=0189 `:40-:45`）——共享路径真实在环的直接物证。**措辞钉：集群合计 5 条（3 interview+2 quiz 跨双副本合计），非「每副本 5 条」**——后者=进程内旧语义；若机制回归进程内计数，双副本各自容纳→第 6 条被放行→XR-4 红=机制回归面停判升级（非断言迁就）。

### 0.3 认领登记处行登记（行号+行名+现值·亲读逐字）

| 行号 | 行名 | 现值（亲读） | 本刀补 |
|---|---|---|---|
| checklist `:1659` | `GAP-SSEPUSH-CROSS-REPLICA` | STILL OPEN（单进程单 LISTEN · 跨副本未证·行登记均不关闭） | 两进程证明收据·**行翻面权归协调方**（本卷 Ban 自翻） |
| current-runtime-truth `:125/:274` | `HC-GAP-008` | 跨副本槽仍开·`sse-slot:prove` 不证明 | 收据 additive 注记候选·翻面权归协调方 |
| uc010 harness `:62` | `GAP-UC010-CROSS-REPLICA` | §1b 第 5 项缺 | 收据供评估· Ban 自升 covered |

---

## §1 修法（恰 1 具名 proof=`sse-cross-replica` · XR-0…XR-5 六臂一 proof · 三陷阱前置合同 · 零产品码触 · 零 invent covered · 零 live key）

**修法形状**：新 proof `apps/api/test/sse-cross-replica.proof.ts`——**父进程**=隔离 harness（真 PG 预置一次+0214 自装+双子进程 spawn+双端口 HTTP 驱动）；**子进程**=轻量入口（内联源常量运行时落 `.tmp`·沿 uc001 capped-child 内联源先例形：`createApp`+`listen(0)`+端口/健康经 stdout/IPC 上报·零 `_neg-harness` boot 零 schema 装载）×2（replica-A/replica-B·同隔离库）。+ `apps/api/package.json` 注册单行 + root `package.json` 双行（`sse:xrep:prove`/`sse:xrep:prove:raw`）+ runner 注册位四位全登记（SOURCE_PATHS 含 rate-limit/sse-notify/sse-pump/last-event-id/interview.controller 触面源集·位5 resource-caps 按 xu001 先例可选非 PERF 不适用承登）+ egress 环境引用登记（**预声明避词面臂**：proof 零环境变量词面→inventory additive 零条目·沿 X33 `e15956698` 形·EXEC 期实际词面亲证）。**prove-only · `apps/*/src`/`packages/*/src`/migrations 零 diff 意向**；isolated 真 PG·零 MODEL_API_KEY·零外呼·零 worker drain（job 滞队）。收据 `.tmp/sse-xrep-receipts/` + tracked `ai-docs/delivery/receipts/sse-xrep/`（implementer pre-commit runs · not evidence of record）。行/列状态一字不动：EXIT0=case≠covered，coveredCount=8 不变；三 GAP 行翻面权归协调方。

**前置合同（三陷阱·EXEC 落码顺序钉死·任一失守即环境红停判非臂红）**：
- **P-① 进程合同**：双子进程 spawn 后先断言 PID 相异/端口相异；子进程轻量入口源内禁 import `_neg-harness`（码审断言：入口源零 `boot(`/`01_schema` 词面）；schema 由父进程一次性预置。
- **P-② 自装合同**：父进程于 schema 预置后 `readFileSync` **0214 真迁移字节**执行（幂等 CREATE OR REPLACE+DROP/CREATE TRIGGER）；随后（或子进程 boot 内首 establish 退避重连后）**XR-0 健康门**收口。
- **P-③ 共享路径合同**：日志 tap 于父进程 boot 前安装（捕获窗=全 run·沿 ssepush `3056a929:84-:85/:240-:248` 先例形位移教训——tap 必须先于任何可发线面）；XR-4 前 `RL_SHARED_DEGRADED` 零命中+lease 行断言在环。

### XR-0 · 健康门（gating·先于一切交付臂）

双子进程各自 `whenHealthy()` 落 `{healthy:true}`（子进程入口 await 后上报·父进程断言双真）+ 每进程 LISTEN 恰一条（`sse-notify.service.ts:24-:26/:271-:285` 双进程即两条独立专用 LISTEN·零交叉）+ 全窗 `SSE_NOTIFY_DEGRADED` 零命中+ pg_trigger 实证 trigger 在场（自装物证）。健康门不过=陷阱②失守→环境红停判（Ban 判产品缺陷·Ban 就地降级断言）。

### XR-1 · 跨副本交付（K 条逐事务 INSERT→双副本全收·序完整·gap=0）

K≥3 条 `interview_event` **逐事务 INSERT**（每条独立事务提交→0214 按语句触发器逐次广播·夹具种子豁免具名——interview_event INSERT 种子沿 sse-push-notify/uc010 先例形·**0195 防篡改触发器只拦 UPDATE/DELETE·INSERT 面零涉如实钉·proof 全程零 DELETE 面不触 0219 清扫臂**）。断言：replica-A 连接与 replica-B 连接**各自**收全 K 帧（广播复制双收）·`id:` 序列=INSERT 序（序完整）·seq 集合恰等零缺零重（gap=0）·终态事件（若有）双侧同见。落库经属主连接夹具（0214 触发器 SECURITY INVOKER 以插入者身份广播·载荷=裸 stream_key 零行数据）。

### XR-2 · 跨副本延迟（<500ms 判定·读数如实透出·reg-window 二择一钉）

非插入副本侧逐条实测 INSERT commit→SSE 帧落客户端延迟，判定 **<500ms**（notify 主推路径行使·功能门非 SLO）；**读数如实透出**（逐条 ms 值原样入收据·不取整不修饰·红次一并留痕）。**reg-window 处理二择一**（EXEC 落码任择其一·卷面预注册两形等价·Ban 第三形裸 sleep 硬等）：①**尾窗容忍**——控制器 initial 取数→泵 waiter 注册 ~ms 级窗（checklist `:1659` `GAP-SSEPUSH-REG-WINDOW` 亲点）内发射的事件由 `HEALTHY_FALLBACK_MS=30s` 兜底收（`sse-pump.ts:70`·判定窗上限=30s+ε·窗内完到不判丢·超窗才红）；②**消除**——待 waiter 就绪信号（首帧/心跳到达）后才开始 INSERT（D5「先注册 waiter 再取数」`:23` 对偶运用·发射窗与注册窗序倒置）。实测读数与择形一并承登收据。

### XR-3 · 跨实例续传（Last-Event-ID 重连仅 seq>N）

连接落于 replica-A 收至 seq=N → 客户端断开（连接关闭→`:278` finally `releaseSlot` 槽对称减）→ 携 `Last-Event-ID: N` 重连落于 **replica-B**（异进程）→ catch-up 恰 **seq>N**：首帧 `id`=N+1（或次可用 seq）·≤N 零重放·零间隙（续传集合=库中 (N,∞) 现存行·与 A 侧已收集合无缝衔接）。跨实例语义=账本真相（`interview_event` seq 权威）+`parseLastEventId`（`last-event-id.ts:7-:18`）合法游标面；非法游标 400 已由 `last-event-id:unit:prove`+`api:validate` 覆盖——本刀 cite 不重证（harness `:49` 同法）。token delta 帧无 id 不入续传面（at-most-once 如实披露·XR-5）。

### XR-4 · 跨副本槽（集群合计 5 条·第 6 条 429·释放可再占）

单主体 5 条分布式跨双副本（3 interview+2 quiz·分布形如 A=2I+1Q/B=1I+1Q·**合计=5**·逐条跨进程落位即进程间共享行使）→ 第 6 条（任一口任一副本）→ **HTTP 429 `too_many_streams` 非 SSE**（`interview.controller.ts:262` 同码·`acquireSlot` 网关原子占拒）+ 前置合同 P-③ 双断言在环（`RL_SHARED_DEGRADED` 零命中+`platform_slot_lease` 行 `n=5` 在）→ 释放一条（客户端断开→`gateway_slot_lease_release` 对称减）→ 第 6' 条连接成功（可再占）+ lease 行 `n` 回落断言。异主体隔离子臂：第二主体并行连接不受第一主体占满影响（`sse-principal-slot.proof.ts` 同臂跨进程重行使·非替代·彼=无库单进程 stub 形）。**措辞冻结：「集群合计 5 条」——EXEC 收据、断言名、后续叙事一律本口径·Ban「每副本 5 条」措辞（=进程内旧语义·机制回归即 XR-4 红停判升级）。**

### XR-5 · token 扇出广播复制禁互偷

interview 流 delta 臂连接（`sse-pump.ts:61-:64` `deltaSource`·S4b）落于 replica-B + 第二流（异 streamKey 异主体）连接落于 replica-A → 夹具级 `pg_notify('interview_token_ch', <帧>)` 直注（通道纯 NOTIFY 零表零触发器 `sse-notify.service.ts:31-:36`·发布面同字面 `token-stream.ts:148`·沿 sse-adv `:201` P2-3 夹具级直注先例形）→ 断言：replica-B 流**收** delta 帧（**广播复制**：pg_notify 全库广播·每副本 LISTEN 各收·持流进程 `tokenRouter` 分域分发 `:323-:345`）·replica-A 第二流对第一流键**零帧**（**禁互偷**·streamKey 分域）·第二流自身键直注时 A 侧收（对称行使）·帧契约校验（坏帧即丢不外溢）。**与 SSE-ADV `NHP-010-ADV-02`（case-matrix `:49`·同进程跨流注入·case-only）reason 级可分：彼=同进程跨流·本=跨副本广播复制+跨进程互偷禁·互不替代 Ban 互借。** at-most-once 有损语义如实（§C-3 不补发不重传·无 id 帧·Last-Event-ID 不续传 token 帧）。

- **非替代申明**：`sse-principal-slot.proof.ts`（无库 hijack 单进程·007 面）·`sse-push-notify.proof.ts`（单进程捕获窗/延迟 36ms 面）·`uc010:sse-resume`（单进程 LED 重放）·`sse-adv`（同进程跨流）=旁证零改动互不替代；`ha-track.multi-instance`（compose 双实例 /livez 工具轨·Not HA）=进程机械旁证非 SSE 合同证明。本刀绿≠三 GAP 行关闭≠HA≠容量 SLO。

---

## §1.3 否决表（落选项诚实留痕 · 含停止条件登记 · 与认领核对互补）

| 落选项 | 否决/登记理由 |
|---|---|
| 同进程双 `createApp` 实例形 | 陷阱①直接否决——模块级单例（LISTEN/router/evict 序/registry）退化单副本语义·假绿·**禁**。 |
| 子进程全量 harness boot 形 | 陷阱①否决——22 卷自 DROP 互清+重复预置·schema 父进程一次性预置替代。 |
| 无库 stub 形（仿 `sse-slot:prove`） | 槽语义需真网关函数+真 lease 行（0189 SECURITY DEFINER/asGateway 链）·无库 stub 恰是 `HC-GAP-008` 未证之因·**禁**。 |
| `docker/compose.ha-dual*` 双容器形 | HA 工具轨（`ha-track.multi-instance`）=C1/C2 进程机械·授权/env/镜像三重门槛+与本刀隔离 runner 不同面；两 OS 进程命题由同机双子进程即证·**不取**（Ban 借 HA 轨宣本刀·Ban 借本刀宣 HA）。 |
| 云/生产拓扑多副本 | out-of-scope（case-matrix `:166` NHP-HA-FAILOVER-RTO-01 域·Ban buy cloud）→ 出域。 |
| full.e2e 三流终态段（`GAP-SSEPUSH-FULL-E2E`） | 他行独立登记（checklist `:1659`）·需 Key+worker 长链路 → 出本刀零触。 |
| `GAP-SSEPUSH-PROD-30S`/`GAP-SSEPUSH-QUIZ-DX-HTTP` | 同行独立登记·本刀不代偿（XR-2 的 30s 兜底引用≠30s 原值级生产读数）。 |
| SSE-ADV 跨流臂重铺 | `NHP-010-ADV-02` case-only 在卷（`:49`）·同进程面已行使·本刀 XR-5 跨进程面 reason 级可分·**零重铺 Ban 互借**。 |
| worker live drain/checkpointer 面 | `GAP-UC033-WORKER-LIVE` 同域·本地不可测·本刀零触（XR-1 夹具直 INSERT 绕 worker·豁免具名）。 |
| 0143 逐行触发器自装 | 0214 已按语句改写 trigger 同名（`DROP TRIGGER IF EXISTS`+CREATE·`d1f36f17:22-:27`）——自装 0214 字节=生产现行语义；0143 先例形沿形不沿字节。 |
| 三 GAP 行就地翻面 | 翻面权归协调方（本卷 Ban 触三登记文件·收据 additive 供评估）·Ban 自翻。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算·越限沿先例步进承登预授权条款本刀触发）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2428**（stdout 亲读）· cap=**2428**（`public-text-policy.mjs:228` `MAX_FILES = 2_428` 亲证）——**2428=cap 恰等零余量**·本卷新文件 +1 → **2429 > 2428 必越** → 沿协调方常设预授权「越限沿先例步进承登」**+8=2428→2436**（+8 三十一先例形·2208 起快速链·其间 2392/2397/2402/2405/2406/2409/2428 等恰等变体如实登记·快速链·授权随令）：①`public-text-policy.mjs:228` `2_428→2_436`+注记两行置顶（CAP-SANCTION-2436·沿 X33/X16-ADV 起草注记形·栈历史零洗）；②`public-text-policy.proof.mjs` 越限臂六处联动（`i < 2_436`·`atCap.scannedFiles=2_436`·`f-2436.md`·`PTP_FILE_LIMIT:2437`·注记链区 CAP-SANCTION-2436 置顶）·本树 `public-text-policy.proof.mjs` 亲跑 **12/12 EXIT=0**（2_436/2437 双值全行使）；③**语义申明：计数预算联动零门语义变更·越限臂 fabricated 数随 cap 联动同步·proof 强度不减**·起草树终态 **2429 ≤ 2436**；EXEC 期 +1 proof=2430 ≤ 2436（若 EXEC 期在飞并线致 tree 实测 >2436 → 触「验收红不可修」停手上报·Ban 就地再改 cap）。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自指）+行首冲突标记严格形 grep 零命中（起草席亲跑·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 3 tracked 路径**=本卷 .md+`public-text-policy.mjs`+`public-text-policy.proof.mjs`；EXEC 期 diff 面=本卷+新 proof+注册行（root/`apps/api` package.json）+runner 注册位（`scripts/run-e2e-isolated.mjs` 四位·位5 承登）+三登记文件 additive 注记候选（checklist/current-runtime-truth/uc010-harness·仅当协调方授权注记时·翻面权不在本刀）+tracked 收据 `ai-docs/delivery/receipts/sse-xrep/`（`.log` 非 TEXT_EXTENSIONS 不计受管扫描·沿批 C 形）——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin）**：`pnpm sse:xrep:prove` EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实·环境红/臂红分口承登）· 六臂断言齐（XR-0 gating 在首·P-①②③ 前置合同断言在环·XR-4 前置双断言在环）· 邻面不回退（`sse-push:notify:prove` 35/35·`sse-slot:prove`·`api-harden:prove` 31·`uc010:sse-resume:prove` 按届时 SSOT 口径恒等）· **lint 帽承登预置**：EXEC 期新 proof 如添 warning → 沿批 C §9-post 双帽恰等步进先例形·协调方 sanction 面·非本起草刀落码 · turbo typecheck EXIT=0 · 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · coveredCount=8 零翻转 · **三 GAP 行（`HC-GAP-008`/`GAP-SSEPUSH-CROSS-REPLICA`/`GAP-UC010-CROSS-REPLICA`）翻面权归协调方**· Ban 借本收据宣跨副本已证关闭/机制已变更/集群容量 5N/延迟 SLO 达标（XR-2 读数=开发机功能门读数·如实透出而已）· Ban 借收据 wash 单进程旁证族。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行+runner 注册位·沿 uc015/uc016/批 C/X33 prove-only 先例）。**零迁移**（0189/0214 既有零改·链 217 头 0219 零动·Ban 抢号）。
2. **既有 proof 家族零触**：`sse-push-notify`/`sse-principal-slot`/`sse-delta-arm`/`sse-listen-probe`/`uc010:sse-resume`/`sse-adv` 等零触只读引用；`run-e2e-isolated.mjs` 仅 additive 注册位。
3. **三登记文件+SSOT 零改**：checklist/current-runtime-truth/high-concurrency-review/uc010-harness/case-matrix/REMAINING-NORTH-STAR-QUEUE/product-campaign-LEDGER 只读引用——翻面权归协调方（EXEC 期 additive 注记仅经协调方授权·§2-3）。
4. **HA/云/发布叙事零涉**：`ha-track.*`/compose.ha-dual/云授权域零触（§1.3）· Ban 借本刀宣 HA 阶 C/D/`releaseEvidence=true`/生产容量。
5. **covered/queue 翻面零预支** · **零配置零 Key**（隔离 runner baseEnv 显式形·子进程 env 透传面沿 ssepush rev3 R4 注记口径如实核记·零 `.env*` 落盘）。

## §4 依赖

**①上游已满足**：0189/0214 在迁移链（链 217 头 0219 本 turn 亲证）· 机制源四件在树（§0.1 blob 亲算）· 自装先例（`3056a929:84-:85/:240-:248`）· 无库单进程槽先例（`692c4d01`）· 三层隔离壳先例（`07077d30`）· capped-child 内联源先例（uc001 批 C 形）· token 夹具直注先例（sse-adv `:201` P2-3）。**②同文件并发**：起草 turn 恰 1 新 .md+两 policy 数值联动零交涉面；EXEC 期触 runner 注册区/双 package.json 注册区=高汇聚区——§0.0 在飞交叠复核必做（union dual-keep/additive #162–#165 先例形·merge-tree 预演必做）。**③下游**：三 GAP 行翻面评估与「集群合计 5 条」口径订正（high-concurrency-review `:47/:176` 漂移候选）归协调方；单进程旁证族零洗。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 动主仓；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·环境红/臂红分口·Ban 改断言迁就）；Ban invent covered（含升格 partial/借旁证 wash/自翻三 GAP 行）；Ban live key（零 Key 面硬跑·est live=0）；Ban 触产品码面/迁移链/CI 告警配置（cap 值外数值联动按 §2-1 预授权形·越值红停上报）；Ban 同进程双 app 实例形（陷阱①·§1.3）；Ban 子进程全量 harness boot 形（陷阱①）；Ban 缺健康门跑交付臂（陷阱②·XR-0 gating 在首·降级 2s 轮询面封死）；Ban 缺 P-③ 前置断言跑槽臂（陷阱③·`RL_SHARED_DEGRADED` 零命中+lease 行在双断言）；Ban「每副本 5 条」措辞（集群合计 5 条口径冻结）；Ban 触既有 proof 家族/三登记文件/共享 SSOT（additive 注记仅经协调方授权）；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·枚举完备：**interview_event INSERT 种子**（XR-1 逐事务·0195 只拦 UPDATE/DELETE INSERT 面合法如实钉）+**`pg_notify('interview_token_ch',…)` 夹具直注**（XR-5·通道零表零触发器·worker `:148` 同字面）+**user_account/status 翻面类种子零需要**（本刀零 evict 臂·0189 件④不在本刀行使面如实登记）——枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 裸 sleep 硬等（XR-2 reg-window 二择一钉）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 借读数宣 SLO/HA/发布叙事/生产容量（XR-2=开发机功能门）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
**本卷附加钉（零翻转）**：**Not HA**（两 OS 进程同机证明≠生产多副本≠HA≠failover）· **开发机回归预算口径**（单机隔离 PG 容器+双子进程·`<500ms`=开发机功能门非生产延迟 SLO·run 墙钟与逐条 ms 读数如实透出·子进程连接 10min deadline 口径 `sse-pump.ts:135`·**Ban SLO/HA/发布叙事**）· 集群合计 5 条措辞冻结 · 捕获窗 tap 先于 boot（ssepush 教训沿承）。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（EXEC 期隔离 PG+同机双子进程·零 MODEL_API_KEY 零 worker drain 零外呼·§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+policy 两 script 数值联动·起草 turn）五类标记词 + conflict-marker grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径·不复抄卷内防自匹配——沿批 C §7/X33 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：本节 + Status 行 + 卷尾·同值·alone≠dual·Dual PASS ≠ 开工·PASS 只过审·开工须协调方明示授权·本 commit 不预 claim 任何 post-commit EXIT）。** 开工三条款：①pre-exec 双审两独立外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（含 §2-1 cap 步进 2428→2436 承登追认）；③EXEC 立项**不得改 §1 修法面（六臂/前置合同三陷阱）/§5 Ban/pins/§1.3 否决面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号）。停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（三 GAP 行被他刀翻面/改写 · 0189 网关函数/0214 触发器/rate-limit 共享模式/sse-notify 健康门/sse-pump 三钉值任一漂移 · runner 注册区被在飞刀改写）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §0.2/§1 对码期望不符（**共享路径健康而第 6 条未 429=集群合计语义回归** · 双副本交付缺收/gap>0 · Last-Event-ID 跨实例重放≤N · token 帧跨流互偷 · 健康门 healthy=false 且非环境因）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green Ban 断言迁就**）。
- **越界需要**：修法诉求超出 §1 恰 1 proof 六臂面（需触产品码/迁移/既有 proof 家族/三 GAP 行翻面/共享 SSOT/HA 轨/cap 再步）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2436 / 邻套件新红 / typecheck/lint 超 / 隔离基建红按 ssepush (d) 形允许重启重试并全台账）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-10-28 起草落卷·前值无·本 commit 即起草态·翻面序=`executed:awaiting_post_prove_dual`→`closed` 沿 X33/批 C 先例·翻面权归协调方会签链）· 卷起草 ≠ covered ≠ 三 GAP 行翻面（coveredCount=8 零翻转 · EXIT0=case≠covered）· 状态翻面权归协调方 · alone≠dual · Ban self-approve · ⛔force-push。

---

*XREP REQUEST · 2026-10-28 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行·alone≠dual·Dual PASS ≠ 开工）· 认领=`HC-GAP-008`（current-runtime-truth `:125/:274`·high-concurrency-review `:176`）+`GAP-SSEPUSH-CROSS-REPLICA`（checklist `:1659`）+`GAP-UC010-CROSS-REPLICA`（uc010-harness `:62`）三登记行共面·fresh 亲点维持**开** · **定性沿承=证明缺口非机制缺口**（0189 共享 lease 已集群精确 `gateway_slot_lease_acquire` 单语句原子占·0214 广播内生按语句 pg_notify 每副本 LISTEN 各收——缺=两 OS 进程证据形·现证面全单进程）· 三环境陷阱钉入 §1 前置合同（P-①两 OS 进程硬前提：同进程双 app 禁用/子进程轻量入口禁全量 boot/schema 父进程一次性预置·P-②0214 自装后置+XR-0 健康门 healthy===true 双副本·P-③0189 共享路径前置断言 `RL_SHARED_DEGRADED` 零命中+lease 行在+「集群合计 5 条」措辞冻结）· 修法=恰 1 具名 proof `sse-cross-replica` 六臂（XR-0 健康门 gating·XR-1 K 条逐事务 INSERT 双副本全收 gap=0·XR-2 <500ms 判定读数如实+reg-window 二择一·XR-3 Last-Event-ID 跨实例重连仅 seq>N·XR-4 集群合计 5 条第 6 条 429 释放可再占·XR-5 token 广播复制禁互偷）· 零产品码零迁移零 Key· prove-only · docs cap=起草步进 **2428→2436 CAP-SANCTION-2436**（+8 三十一先例形·越限臂 2_436/2437 联动·PTP proof 12/12·起草树 2429≤2436）· 基线=`origin/main` `7950f45bd` · 分支 `line/xrep-draft` · 工作树 `meetwise-xrep` · 三 GAP 行翻面权归协调方 · pins 十一值零翻 · est live=0 · markers=0 · releaseEvidence=false · Not HA · Ban SLO/HA/发布叙事 · ⛔push ⛔动主仓 · STOP*
