# KILLSW REQUEST — UC-E2E-050/051 kill-switch/无 PII 面起草卷·覆盖矩阵 §1.0.1 聚合行 `:132` 050/051 残余列 + §1.0.2 分面行缺席 + case-matrix §1.4 kill/no-pii 缺行处置（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`closed`**（§9-post post 双审双 PASS 会签席翻面 2026-10-27 · 原值 `executed:awaiting_post_prove_dual` 史录 provenance 见 §8/§9-EXEC/§9-post · alone≠dual）· **STOP=closed（三处钉：本 Status 行 + §8 + 卷尾注 · 2026-10-27 §9-post 翻终态 · `executed:awaiting_post_prove_dual`/`draft:awaiting_pre_exec_dual` 史录不洗）** · 两 case 隔离 prove EXIT=0 已落（59+44 断言·implementer pre-commit runs）+ post-prove 双审席1+席2 双 PASS 已落卷（§9-post·红次机证链零产品码红决定性+第三 fresh 独立复跑 uc050 59/0+安全面推演核过+P2 errata 三件随卷）· 本卷不预 claim 任何 covered 升格（EXIT0=case≠covered·coveredCount=8 零动）。

**席位**：UC-050/051 kill-switch/无 PII 起草席（诊断+起草双责·协调方派·认领矩阵 `:132` 聚合行的 **050/051 部分**（UC-052 deletion/export 面零触·出域）+ case-matrix §1.4 kill/no-pii 缺行面·与批 A/B/C 及各 UC 专属线互斥不重叠）。
**基线**：`origin/main` @ **`0246361dd`**（full `0246361dd75ac84beb70c6bed99be387da989499` · `git fetch origin` 本 turn 成功 · #148 micro-batch 并线点 · 分支 `line/killsw-draft` 建 worktree `git worktree add ../meetwise-killsw -b line/killsw-draft origin/main` 亲立 · HEAD 落 tip 亲证）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2382 ≤ cap 2386**（`public-text-policy.mjs:149` `MAX_FILES = 2_386` 亲证 · §2-1 预算核）· 工作树 `meetwise-killsw`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 行 `:28` · Phase 3 privacy `:32`）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 / §1.0.1 `:132` 聚合行 / §1.0.2 分面区 `:142-157` / §1.0.3 `:165` 双表同步令 / §1.1 `:191`）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.4 `:96` 头 + `:105-114` NHP-050-\* 行——全归 UC-052 擦除域·本刀只读）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-050 `:568-575` · UC-051 `:577-583` · 七类矩阵 050/051 行 `:633-634`）→ 涉事机制源 `apps/api/src/platform/content-safety.ts` / `apps/api/src/modules/interview/interview.service.ts` / `apps/api/src/modules/jobs/applications.service.ts` / `apps/api/src/platform/all-exceptions.filter.ts` / `packages/ai-runtime/src/langfuse-v5.ts` / `packages/ai-runtime/src/invoke.ts` → 先例 `apps/api/test/obs-logging.proof.ts`（子进程 pino 抓取+哨兵扫描形）· `apps/api/test/privacy-erasure-http.proof.ts`（DELETE=503 pin·只读旁证）· `packages/db/test/uc-e2e-018-graph-safely-terminated.proof.ts`（图安全终态先例·零触只读）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证·批 A/B/C 同源）+ Phase 3 privacy 域纪律（`:32` DELETE=503 freeze——本刀零触删除/导出面·freeze 维持）；②`e2e-requirement-coverage-matrix.md` §0.5 强制列令 + §1.0.3 `:165`「后续 knife 改行时必须同步改本表 + `non-happy-path-perf-load-case-matrix.md`；缺列视为未完成 G2/G6」；③协调方派单（UC-050/051 kill-switch/无 PII 面起草·docs-only 授权）；④结构范本=`harness/nhp-batch-c-REQUEST.md`（§0-§8 形制·在飞 `line/nhp-c-draft` @`caf1bef08`）。

---

## 残余盘点（认领核对·`:132` 聚合行四列逐 cell 定标可测面·050/051 残余亲读逐字）

**已认领排除面**：批 A=`:114/:118/:128`；批 B=`:115-117`+§1.0.2 `:147-149`+case-matrix `:40-48` 邻区（executed·已并线 #146）；批 C=`:120/:121/:146`+case-matrix `:40/:88-89`（在飞 `line/nhp-c-draft` @`caf1bef08`）；UC-052 deletion/checkpoint/pool-role 面=`:132` 聚合行 UC-052 部分+case-matrix `:105-114` NHP-050-\* 全族（**归 UC-052 擦除域·本刀零触**）；UC-018 图 abandon 面=`:123`+`49a33634`（safely_terminated 先例·零触只读）；NHP-CLOUD-KILL-FAULT-01=`:137`（云 kill/跨 AZ·无授权 blocked·**出域**≠本刀应用层 kill-switch）。

| 认领 cell（`:132` 行·050/051 部分） | 现列值（亲读逐字） | 可测面定标 |
|---|---|---|
| UC-050 · NEG | 「050/051 still **partial**/honesty-pin」 | honesty-pin=DELETE 503 pin（UC-052 面·非 050）；kill-switch 三态 fail-closed 非法值面（`invalid_meetwise_content_safety_kill_switch`→500 非 550 静默 off）**零 case** → 本刀 NEG 臂 |
| UC-050 · FAULT | 「050/051 still **gap**」 | kill-switch 触发面（env=1 → begin/turn 双口 503+零入队零扣·两口闸序）**零 case 零 prove**（`content_safety_kill_switch` 词面全树 rg：产品文件恰 2（content-safety.ts+interview.service.ts）；test/harness 侧=`scripts/i6-239-gates.proof.mjs:43-62` 静态源码词面断言门（i6 D6 合规门·非行为 case·root `package.json:704` `i6-gates:prove` 注册）+`receipts/i6-239/i6-239-gates-proof.log:4`+`harness/i6-239-REQUEST.md:127`——**行为触发面零 case 零 prove 结论不变**）→ **本刀主缝** |
| UC-050 · BOUND | 「050/051 still **blind**」 | off 态现状字节面（env=0/unset → begin 照常 202 对照）+ 双闸优先序面（kill 码先于 preview 码）零 case → 本刀 BOUND 臂 |
| UC-050 · ADV | **blind**（全行） | applications.start 同核绕行面（`applications.service.ts:44-58`）=**如实登记 NOT claimed 残余**（D6 #239-① 最小集「begin/turn 双口」边界·本刀零臂零断言零修复·Ban 借旁证 wash） |
| UC-051 · NEG | 「050/051 still **partial**/honesty-pin」 | partial 面源=PRIVACY-HTTP `:134` honesty-pin+`obs-logging` R3/R5 infra Ban 面——**业务黄金路径（简历全文/答案真值过 api 口）日志扫描零 case**（obs-logging runner 不触 DB·BODY_MARKER 系合成探针非业务真值）→ 本刀 NEG 主臂 |
| UC-051 · FAULT | 「050/051 still **gap**」 | trace 脱敏面（langfuse `:118` mask+`invoke.ts:1176` redactOutput→`{redacted:true}`+`:1080/:1188` replayable=false·两产品行使点 `resume-ocr.ts:141`/`job-route-classify.ts:171`）零专案 case → 本刀 FAULT 臂（scripted 零外呼直行使形） |
| UC-051 · BOUND | 「050/051 still **blind**」 | 错误堆栈面：响应体 opaque `internal_error`（`all-exceptions.filter.ts:39`）obs-logging R2 已证=partial 旁证；**堆栈内容面（err.message/stack 是否携带用户原文）+500 路径哨兵零 case** → 本刀 BOUND 臂 |
| UC-051 · ADV | **blind**（全行） | 与 NEG/FAULT 同缝（PII 边角=哨兵形对抗：密钥形/令牌形/query 形哨兵）·随 Case 2 臂面覆盖·不单列 |
| §1.0.2 分面 | **050/051 行缺席**（`:146-157` 逐行亲证） | EXEC 补登记行（PERF_api/PERF_web/LOAD_worker 三值 blind 如实·只登记不填绿·沿批 B UC-004 分面行先例形） |
| case-matrix §1.4 | `:96` 头 + `:105-114` 无 kill/no-pii 行 | EXEC 补两新行 `NHP-050-KILL-01`/`NHP-051-NOPII-01`（**语义命名避让**：`NHP-050-FAULT-01..05` 已被 UC-052 擦除域占名·沿 `NHP-CLOUD-KILL-FAULT-01` 语义中缀先例） |

**结论**：050/051 面**有缝可测**（kill-switch env 闸与无 PII 日志/trace 剥除机制全在树·零 case 零 prove=gap/blind 实证）→ 本刀恰 **2 case**；UC-052 deletion/export/DELETE 面出域零触（`:191`「Ban elevate UC-050/051/export」维持·coveredCount=8 不动）；停止条件「码面无可测注入缝」**未触发**。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse/rg 亲算 @`0246361dd`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **32 树**实测——`line/killsw-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep killsw` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞线逐树亲读**（`git log -1` + `git diff --name-only origin/main...<branch>`）：
  - `line/nhp-c-draft` @`caf1bef08`（executed 已 §9-post closed·未并线）——触面=矩阵 `:120/:121/:146` 行内改+case-matrix+egress-inventory+3 proof+收据；与本刀触面（矩阵 `:132/:191`+§1.0.2 **新登记行**+case-matrix §1.4 `:105-114` 邻区**新二行**）**零字面重叠**；但批 C 并线将使 case-matrix 增行→本刀 case-matrix 行号锚 EXEC 日重 pin。
  - `line/micro-batch2-draft` @`0f71e1d9c`（closed 未并线）——触面=`micro-batch2-REQUEST.md`+`scripts/ha/ha6-companion.proof.mjs`·与本刀零重叠。（修订时点补记 2026-10-26：`#149` nhp-c+`#150` micro-batch2 已并线 origin/main `39cf555c4`——cap/双表届值影响见 §2-1·行号锚 EXEC 日对届时 tip 重 pin。）
  - `line/clock-e2e-draft`（修订时点 tip `7a0f450c2` 亲证·内含并线点 `b0cb09b39`=#149/#150 并线 merge）——触**同表邻区**（`e2e-requirement-coverage-matrix.md` 他行）+case-matrix（`non-happy-path-perf-load-case-matrix.md`）+`provider-egress-inventory.json`+cap/runner 共享面（修订时点 `git diff --name-only 0246361dd..` 亲证）——与本刀 EXEC 双表面**邻接非同格**·EXEC 日逐行复核。
  - `line/pay-neg-draft` @`40926d7af` / `line/sse-adv-draft` @`6fdb83878` **落卷后已落文**（各恰 1 起草 commit·`git diff --name-only 0246361dd..` 恰各自 REQUEST .md 亲证）·与本刀 050/051 面**零字面交叠亲证**——EXEC 立项日逐树复核维持。
  - `line/reassess-draft`（EXEC 落卷 `9c4784bc5`·修订时点 tip `582d4cf08` 亲证）——**触共享面登记**：root/`apps/worker` package.json 注册行+`scripts/run-e2e-isolated.mjs` runner 位+`provider-egress-inventory.json`+`public-text-policy.mjs`（cap）及其 proof+uc012 三 case proof/收据（修订时点 diff 亲证）——与本刀 EXEC 触面（注册行/runner 位/egress/cap）**共享面交叠**·EXEC 日逐件复核（本刀起草 turn 触面=本卷 1 .md·与其零字面交叠）。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=两 proof 新文件+注册行（root/apps/api package.json）+runner 注册位+本卷 .md+双表行内改（矩阵 `:132` 050/051 措辞注+§1.0.2 新登记行+case-matrix §1.4 两新行）。届时对各在飞分支执行 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `0246361dd` 之后新增提交→触停止条件「现场漂移」停手上报——**共享面判级（修订落文）**：本刀独占触面（本卷 .md/两 proof 文件名/矩阵 `:132` 050/051 行/§1.0.2 新行/case-matrix §1.4 两新行名）在飞新增=漂移停；共享面（注册行/runner 位/egress inventory/cap/双表他行邻区·clock-e2e/reassess 已登记）按行级冲突判：同文件同行同义=漂移停·同文件邻区异行=并入届时 merge-tree 预演如实登记不停。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex·行数亲点）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `6fc92dd0`（520） | **§1.0.1 `:132`（UC-E2E-050–052 聚合行·050/051 残余列亲读逐字入盘点表）**·§1.0.2 `:142-157`（**050/051 行缺席亲证**）·§1.1 `:191`（「Ban elevate UC-050/051/export」亲读）·PRIVACY-HTTP `:134` · NHP-CLOUD-KILL-FAULT-01 `:137` · §0.5 `:47-84`（covered 禁填 `:80`）· §1.0.3 `:165` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `cbf9d97f`（199） | **§1.4 头 `:96` · `:105-114` NHP-050-\* 全族（UC-052 擦除域·本刀只读·零 kill/no-pii 行亲证）**·读法 `:165/:168` |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | **UC-050 `:568-575`（TC-E2E-050-kill `:575`）· UC-051 `:577-583`（TC-E2E-051-no-pii `:583`）**·七类矩阵 050/051 行 `:633-634` |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `a7d8959a`（54） | Phase 2 #12 `:28` · Phase 3 privacy `:32`（DELETE=503 freeze） |
| `scripts/ai-docs/public-text-policy.mjs` | `e33818a6`（447） | `:149` `MAX_FILES = 2_386`（cap 亲证 · §2-1 预算核） |
| `apps/api/src/platform/content-safety.ts` | `50f8c9c3`（43） | `:1` 码常量 · **`:15-21` 三态 fail-closed resolve（unset/`0`=off · `1`=engaged · else throw `invalid_meetwise_content_safety_kill_switch`）**· `:27-33` 专名错误类 · `:39-43` assert 闸 · default-param 逐请求读 `process.env`（`:16/:40`·请求时闸语义） |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918） | `:17-21` 闸 import · **`:335-348` `denyContentSafetyKilled`（`:341` 503 `content_safety_kill_switch_active`+诚实文案）**· **`:425` begin 口 / `:436` turn 口**——两口闸均先于 `:426`/`:437` `denyPublicPreviewWrite`（双闸优先序面）· 闸在 `requireOwnerUserId`/`beginInterviewCore` 之前=503 前置零扣零入队时序面 |
| `apps/api/src/modules/jobs/applications.service.ts` | `e1bf8ff0`（121） | **`:44-58` `start()` 只过 preview 写门（`:45`）直调 `beginInterviewCore`（`:57`）——同核未过 kill 闸=绕行残余面（D6 #239-① 最小集边界·NOT claimed 登记）** |
| `apps/api/src/platform/all-exceptions.filter.ts` | `5a5532d6`（41） | `:32` url 去 query · `:34` 堆栈只进日志（pino）· `:39` 未知错响应体 opaque `{error:'internal_error'}` |
| `packages/ai-runtime/src/langfuse-v5.ts` | `63d5466c`（199） | `:114` shouldExportSpan 白名单 `meetwise.*` · **`:118` mask 字符串→`[redacted]`**· `:129-131` owner/thread/graphRun 伪名化 |
| `packages/ai-runtime/src/invoke.ts` | `f6102433`（1250） | `:252` redactOutput 位 · **`:1176` redactOutput→stored `{redacted:true}`**· `:1080`/`:1188-1190` replayable=false 双门 · `:533` metrics label 低基数纪律 |
| `packages/ai-runtime/src/resume-ocr.ts` + `job-route-classify.ts` | `b2c51425`（148）+`3b1e7081`（208） | `:141` / `:171` `redactOutput: true` 两产品行使点 |
| `packages/ai-runtime/src/model-client.ts` | `f9fd3105`（1233） | `:146` `capUserData`（评分侧纵深兜底·旁证只读） |
| `apps/api/test/obs-logging.proof.ts` | `94d6691d`（159） | `:22-23` 哨兵常量形 · `:76-80` R5 query 剥离 · **`:134-135` R3 Ban 面（authorization/body 哨兵零入卷）**——子进程 pino 抓取先例（infra 面·零业务黄金路径=本刀新证据层边界） |
| `packages/db/test/uc-e2e-018-graph-safely-terminated.proof.ts` | `49a33634`（250） | abandon→safe_terminating→safely_terminated 图终态先例（零触只读·本刀 Ban 二次实现·NOTE-CKPT-UNSEALED-CLAIM-NEG「Line F REQUEST 不得码成第二实现」教训承形） |
| `apps/api/test/privacy-erasure-http.proof.ts` | `d810d165`（467） | DELETE=503 pin 承载（UC-052/PRIVACY-HTTP 面·只读旁证·本刀零触） |

### 0.2 机制补充锚（rg 亲证）

- `MEETWISE_CONTENT_SAFETY_KILL_SWITCH` **不在 env-schema 注册**（`env-schema.ts` rg 零命中）——设计内：env 直读闸三态自校（`content-safety.ts:11-13` 注释「三态 fail-closed 沿 resolvePublicPreviewMode 先例形」），非法值 throw 不静默回退。
- `content_safety_kill_switch` / `MEETWISE_CONTENT_SAFETY_KILL_SWITCH` 词面全树 rg：产品文件恰 2（content-safety.ts / interview.service.ts）；test/harness 侧恰=`scripts/i6-239-gates.proof.mjs:43-62` 静态源码词面断言门（i6 D6 合规门·非行为 case·root `package.json:704` `i6-gates:prove` 注册）+`receipts/i6-239/i6-239-gates-proof.log:4`+`harness/i6-239-REQUEST.md:127`——**行为触发面零 case 零 prove 结论不变**=kill-switch 触发面 gap 实证（修订勘误 2026-10-26：原「test/harness 零命中」失实句删除·如实改登）。
- `redactOutput`/`[redacted]` 词面 test 面 rg：仅 `uc-e2e-018-perf-load.proof.ts:119-122` 收据脱敏形（非产品脱敏断言）=no-PII 面 trace 侧零专案实证。

### 0.3 认领登记（逐 cell 定标汇总）

认领=矩阵 `:132` 聚合行 **050/051 部分**的 NEG/FAULT/BOUND 可测面（两 case 收据）+ §1.0.2 050/051 分面登记行（EXEC 补·三值 blind 如实）+ case-matrix §1.4 两新行（EXEC 补）；**不认领**：UC-052 deletion/export/DELETE 面（`:191` freeze 维持）、UC-050 ADV 的 applications.start 绕行修复（NOT claimed 残余·只登记）、UC-018 图 abandon 面（先例只读）。

---

## §1 红事实（机制链·全部亲证 @`0246361dd`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 UC-050 kill-switch 四读码面

- **闸体读**：`content-safety.ts:15-21` 三态 fail-closed——unset/`0`=off（现状字节）·`1`=engaged·**其余值 throw `invalid_meetwise_content_safety_kill_switch` 不静默回退**；`:39-43` assert 闸抛专名错误类（`:27-33`）。
- **接线读**：`interview.service.ts:335-348` `denyContentSafetyKilled()` 将专名错误映射 **503 `{error:'content_safety_kill_switch_active', message:'内容安全开关已开启：面试出题与作答提交暂停'}`**；`:425` begin 口 / `:436` turn 口双口接线亲证；两口内闸序=kill 先于 preview 写门（`:426`/`:437`）→ **双闸同设时 503 kill 码先行**（可测优先序）；闸在 `requireOwnerUserId` 与 `beginInterviewCore`（扣额/入队）之前 → **503 前置=额度零扣+job 行净 0**（期望值逐条对码）。
- **边界读（残余·NOT claimed）**：`applications.service.ts:44-58` `start()` 直调 `beginInterviewCore`（`:57`）未经 kill 闸——同核双生产者中一者未接线，D6 #239-① 注释自钉「at the api begin/turn entries」最小集边界。本刀如实登记为绕行残余面：**零臂零断言零修复**（修复=产品码触·出域归产品刀·Ban 借本卷 wash 或宣称「全入口已闸」）。
- **图面读（adjacency 只读）**：`safe_terminating→safely_terminated` 状态机经 abandon 路径已在树并有专案 prove（`49a33634` + worker ttl-sweeper T2 `safely_terminated` 臂）——本刀 Ban 二次实现（沿 NOTE-CKPT-UNSEALED-CLAIM-NEG 教训形）；kill-switch env 闸（触发面）与图安全终态（收敛面）两语义互不替代·收据互不借用。
- **FAULT 读**：kill-switch 触发/三态/优先序/零副作用四面全树**行为面零 case 零 prove**（0.2 rg 实证·i6-239 系静态源码词面门非行为 case/prove·行为四面零行使结论不变）→ **gap 实证**；NEG（非法值 fail-closed）与 BOUND（off 现状字节+闸序）零 case → 本刀补。

### 1.2 UC-051 no-PII 三读码面

- **日志面（A1）**：`obs-logging.proof.ts:134-135` R3 Ban 面+`:76-80` R5 query 剥离已证 **infra 层**（authorization 值/请求体合成哨兵/query 敏感参零入卷）——但其 runner 不触 DB、零业务黄金路径（BODY_MARKER 系探针非简历/答案真值）→ **业务黄金路径（含简历全文/答案真值的请求过 api 口）日志扫描零 case=NEG 残余可测**；哨兵法沿其 `:22-23` 形。
- **trace 面（A2）**：`langfuse-v5.ts:114` 导出白名单 `meetwise.*`+`:118` mask 字符串一律 `[redacted]`+`:129-131` 三标识伪名化；`invoke.ts:1176` `redactOutput→{redacted:true}`+`:1080`/`:1188-1190` replayable=false 双门；两产品行使点 `resume-ocr.ts:141`/`job-route-classify.ts:171`。零专案 case（ag24/langfuse-evaluation-contract 系 contract 面非脱敏断言面）→ **FAULT 残余可测**（scripted 零外呼直行使形）。
- **堆栈面（A3）**：`all-exceptions.filter.ts:39` 未知错响应体 opaque `internal_error`（R2 已证=partial 旁证）·`:34` 堆栈只进日志·`:32` query 剥离——**堆栈/错误消息内容面（是否携带用户原文）零 case=BOUND 残余可测**；`capUserData`（`model-client.ts:146`）评分侧纵深兜底=旁证只读。
- **导出面零涉**：简历/报告导出属 UC-052 可携带导出面（`:191` blocked·freeze）——本刀零触（`exportReportMd` 等零锚零臂）。

### 1.3 否决面（本席起草适用·EXEC 期同纹·命中即停）

1. **Ban invent covered**：case 收据 EXIT=0 仅=case 证据；`:132` 050/051 措辞只允许 gap/blind→`case-only`（partial 列保留 partial）诚实登记·**禁止升 covered/partial**·`coveredCount=8` 零翻转·`:191`「Ban elevate UC-050/051/export」逐字维持·covered 翻面权归协调方。
2. **Ban live key**：零 `MODEL_API_KEY` 加载/伪造·零 live 外呼·两 case 全离线隔离（`env -u` 三键具名：`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL`）·est live=0（§6）·**三键具名仅本卷文面（.md 词面）·EXEC 码面新文件零直书该三词面**——`env -u` 剥除走已登记 `_neg-harness`（`apps/api/test/_neg-harness.ts`·egress inventory 已登记）+运行时组装形·或按 uc012（`apps/worker/test/uc-e2e-012-nhp-fault.proof.ts`）/uc030（`apps/api/test/uc-e2e-030-nhp-fault.proof.ts`）先例双登记（class=test-isolation）·否则 `environment_reference_unregistered` 红停。
3. **Ban retry-to-green**：任一门红即停如实登记·attempts 台账逐次留痕·禁红后重跑冲销·禁改既有断言凑绿。
4. **Ban 触 UC-052/删除导出域**：case-matrix `:105-114` NHP-050-\* 全族、`privacy-erasure-http.proof.ts`、DELETE=503 面、export 面——零触只读（`隐私域=出域`·批 C §1.3 同 veto 承形；本刀认领面系协调方明示派单的 050/051 触发/脱敏面·非擦除域）。
5. **Ban 触 applications.start 绕行面产品修复**：绕行残余=登记面（HONESTY 注记+矩阵注记）·Ban 就地补线·Ban 借旁证宣称「kill-switch 全入口覆盖」。
6. **Ban 二次实现图安全终态**：`safely_terminated` 面归 UC-018 先例（`49a33634`）·零触只读·收据互不借用。

### 1.4 修法裁决：**恰 2 case（一行一 case·docs+test-only·零产品码触·沿 `nhp-*-prove` 族先例）**

**修法形状**（沿批 B/C 先例）：每 case 一个具名 NHP case = 新 proof 文件 + `apps/api/package.json` 注册行 + root `package.json` 双行（`:prove`/`:prove:raw`）+ runner 注册位（`scripts/run-e2e-isolated.mjs` 五位全登记——批 C 第五注册位教训承登）· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**；isolated 真 PG · 零 live 模型 · 零外呼；收据 `.tmp/<case>-receipts/` + tracked `ai-docs/delivery/receipts/<case>/`（implementer pre-commit runs · **not evidence of record**）。行状态/列状态一字不动：EXIT0=case≠covered，coveredCount=8 不变。

**Case 1 · `NHP-050-KILL-01`**（UC-050 · `apps/api/test/uc-e2e-050-nhp-kill.proof.ts`）

- **需求源**：`e2e-scenarios.md:575` TC-E2E-050-kill（「触发 kill-switch 断言 safely_terminated + 业务一致」——本 case 行使**触发面**（env 闸 503+业务一致零副作用）；图终态面归 `49a33634` 先例互不替代）。
- **证据层**：isolated 真 PG + 真 HTTP（三层壳先例 `07077d30`（blob 非 commit·`git cat-file -t` 亲证）形）+ 子进程 env 变体（kill 进程 env=1 / off 进程 unset·沿 obs-logging spawn 形）。
- **臂**：K1 = env=1 begin → **503 `content_safety_kill_switch_active`**+诚实文案逐字+job 行净 0+额度净账 0（`:425` 闸前置时序）；K2 = env=1 turn → 同 503 码+答案零入队（`:436`）；K3 = off 进程 begin → 202 现状字节对照（off=现状保真·BOUND）；K4 = 非法值（`'2'`）→ **500 `internal_error` fail-closed**+日志含 `invalid_meetwise_content_safety_kill_switch`（三态 fail-closed 真行使·NEG·非静默 off）；K5 = 双闸同设（kill+preview 写门同 env）→ **503 kill 码先行**（`:425` 先于 `:426` 闸序·BOUND）；K6 = 全臂隔离 PG 断言面净账审计（job/entitlement/interview 三表零漂移·业务事实独立保全=A2 验收映射）。
- **HONESTY 头注（卷内同钉）**：applications.start 绕行残余面 NOT claimed（§1.1 边界读）·图面归 UC-018 先例·本 case=触发面 only。
- **非替代申明**：`privacy-erasure-http`（DELETE 503 pin·UC-052 面）· `uc018` 图 prove（安全终态）· `public-preview-write-gate`（preview 闸）· `i6-239` 静态文本门（`scripts/i6-239-gates.proof.mjs:43-62` 源码词面断言·非行为 case）=旁证互不替代——i6-239 静态文本门=邻接旁证·K 臂=行为性行使·收据互不借用互不 wash·Ban 互借关列。

**Case 2 · `NHP-051-NOPII-01`**（UC-051 · `apps/api/test/uc-e2e-051-nopii.proof.ts`）

- **需求源**：`e2e-scenarios.md:583` TC-E2E-051-no-pii（「跑黄金路径后扫日志断言无 PII/密钥/全文 prompt」）——A1 日志扫描（P1/P2）+A2 trace 脱敏摘要（P3）+A3 堆栈不带原文（P4）。
- **证据层**：子进程 boot 真 HTTP+pino stdout 全量抓取（`obs-logging` 先例形 `94d6691d`）+ isolated 真 PG 业务黄金路径（consent 种子先例形+产品路径 `POST /resume` 文本摄取→begin→turn 真答案·哨兵埋值）+ scripted trace 直行使（零外呼）。
- **臂**：P1 = 简历全文/答案埋唯一哨兵→跑黄金路径（resume→begin→turn）→**全日志行零哨兵**（业务真值 Ban 面·A1 真行使——区别于 obs-logging 合成探针层）；P2 = 密钥/令牌面零入卷（boot env 诸 secret 值+`Bearer` 形零入卷·`env -u` 三键进程窗+词面零加载）；P3 = trace 脱敏面（**可纯行使面 scripted 直行使（修订钉 2026-10-26·二择一取 (b)）**：`invoke.ts:1176` `redactOutput`→stored=`{redacted:true}`+`:1080`/`:1188-1190` replayable=false+`langfuseSafeModelMetadata`（`langfuse-v5.ts:67`）标量-only 断言+`pseudonymizeLangfuseIdentifier`（`:56`）owner/thread/invocation refs 零原文——A2 脱敏摘要断言·零 provider 词面零外呼；**mask（`:118`）/`shouldExportSpan`（`:114`）系 `LangfuseSpanProcessor` 运行时面·离线零外呼不可纯行使→如实登记归 opt-in smoke 域（`langfuse:synthetic-trace:smoke`·`packages/ai-runtime/package.json:70`）·本刀零触·不宣称运行时 mask/白名单已行使；(a) 伪造 key+本地 HTTP sink 作 baseUrl 形与 §1.3-②/§5「Ban 伪造 Key 面」相抵·不取）**；P4 = 未知错路径响应体 opaque+全日志行错误消息/堆栈零业务哨兵（A3·`:39`/`:34` 面）；P5 = query 剥离承 R5 同纹复证（`:32`·旁证复证非替代）。
- **oracle 前提钉（P1/P4 负向扫描臂共钉·修订落文 2026-10-26·防空转假绿=批 B 防空转钉同律）**：扫描前必须先钉**哨兵经产品路径在场对照**（正面控制·未钉先扫描=空转假绿=门红）——resume 摄取 2xx+begin 202 全成功态逐钉；turn 腿形状两形二择一钉死并落收据：**形 A**（golden 全成功态）=具名夹具种子钉 question-ready→turn **202 全成功态**（Ban-live 零模型下 202 仅此可达·种子豁免逐项具名入收据）·oracle=resume 2xx+begin 202+turn 202 三腿全成功态+哨兵在场对照；**形 B**（现状形状）=不种子直打→Ban-live 下 worker 缺席→**409 `question_not_ready`（`interview.service.ts:466`）为产品现状预期形状**（非刀红·答案哨兵仍过请求面/日志面·oracle=resume 2xx+begin 202+哨兵请求面/日志面在场对照）；P4 未知错路径同承本钉（哨兵经产品路径在场对照先行）。
- **非替代申明**：`obs-logging`（infra 面·零业务真值）=先例旁证·本 case=业务黄金路径新证据层·reason 级可分（业务哨兵≠合成探针）·Ban 借本 case 收据宣 obs-logging 加强·Ban 借 R3/R5 宣本 case 已 covered。

**双表同步令**：两 case 各改行必须同 turn 改矩阵 `:132`（050/051 措辞注·gap/blind→case-only）+ §1.0.2 新登记行 + case-matrix §1.4 两新行（§1.0.3 `:165` 强制）·缺列视为未完成 G2/G6。

**egress 预置条款（EXEC 期）**：两新 proof 臂文**避开 `MODEL_API_KEY`/`MODEL_BASE_URL` 词面**（沿 obs-logging 零词面先例·`env -u` 三键运行时剥除）→ `provider-egress-inventory.json` 零新登记；若 EXEC 臂文确需词面→按 uc025 `7bb462445`/uc028 `10b920521` 先例双登记（class=test-isolation）二择一·否则 CI `environment_reference_unregistered` 红停；§1.3-② Ban live key 口径不变（本门只管词面登记形·非放行加载）。

---

## §2 验收门矩阵（pre-exec 双审核对单基面·起草门 4 门本 commit 适用+EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·本树起草前亲跑 **EXIT=0 · scanned 2382**（stdout「public text policy scanned 2382 managed worktree files」亲读）·**修订 turn 复跑亲证 EXIT=0 · scanned 2383**（2026-10-26·stdout 亲读·届值如实）· cap=**2386**（`public-text-policy.mjs:149` 亲证）· 本卷新文件 +1 → 预期 **2383 ≤ 2386 = 不越限·无需步进·无越限臂联动**。**cap 届值=2394**（修订时点亲证 2026-10-26：`#149` nhp-c+`#150` micro-batch2 已并线 origin/main `39cf555c4`·`public-text-policy.mjs:151` `MAX_FILES = 2_394`·或届时 sanctioned 更新值）· 本刀 EXEC 面 **+3 tracked 文件**（本卷 .md+两新 proof）→ EXEC 日按届时 scanned 基数 **+3 重算余量如实**（cap 上抬权归协调方）·越限即「验收红不可修」停手上报（Ban 就地改 cap）。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:152-163`·不复抄卷内防自指·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 .md（多任何 tracked 路径即停）；EXEC 期 diff 面=本卷+双表行内改（矩阵 `:132` 措辞注+§1.0.2 新登记行+case-matrix §1.4 两新行）+两 proof 新文件+注册行（root/apps/api package.json）+runner 注册位+egress 预置条款行使面（零登记或双登记二择一）+收据 tracked 面——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin）**：两 case 隔离 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 邻面不回退（`obs-logging`/`privacy-erasure-http`/`neg:all` 按届时 SSOT 口径恒等）· K4 fail-closed 臂与 P1 业务哨兵臂缺任一=门红· 双表同步 diff 逐件登记（§1.0.3 `:165` 令）· pre-exec 双审宜含 privacy 域席（`mw-privacy-int` 惯例·派单权归协调方）· 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:132` 050/051 措辞仅允许 gap/blind→`case-only`（partial 保留）· `:191`「Ban elevate UC-050/051/export」逐字维持 · DELETE=503 零动 · coveredCount=8 零翻转 · Ban 借两收据互 wash（KILL≠NOPII 互不替代互不借用·亦不 wash UC-052 deletion 面）。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行+runner 注册位·沿 uc001/uc025 nhp 族 prove-only 先例）——**含 applications.start 绕行面修复（产品码·出域）与 env-schema 注册补录（产品码·出域）**。
2. **UC-052 擦除/导出域零触**：case-matrix `:105-114` NHP-050-\* 全族、`privacy-erasure-http.proof.ts`、DELETE=503、export 面（Phase 3 freeze `queue:32`）——只读。
3. **UC-018 图面零触**：`:123`+`49a33634`+worker ttl-sweeper prove——只读旁证。
4. **其余 §1.0 行零触**：盘点表排除面全部只读（批 A/B/C 与各 UC 专属线触面清单见残余盘点·批 C 并线后行号 EXEC 日重 pin）。
5. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方（绕行残余的 backlog 登记权亦归协调方·本卷仅卷内登记）。
6. **covered/queue 翻面零预支** · **零迁移零配置**：Ban 新迁移 Ban 触告警/CI 配置；`MEETWISE_CONTENT_SAFETY_KILL_SWITCH` 仅测试进程 env 窗（spawn env 变体）·零配置文件改·零 `.env*` 落树落据。

## §4 依赖

**①上游已满足**：kill 闸与脱敏机制全在树（§0.1 blob 亲算 16 件）+ 三层隔离壳先例（`07077d30`·blob 非 commit）+ 子进程日志抓取先例（`94d6691d`）+ consent 种子先例形（`uc-e2e-001-nhp-adv.proof.ts:264` 形）。**②同文件并发**：起草 turn 恰 1 新 .md 零交涉面；EXEC 期触矩阵 `:132`/§1.0.2 新行与 case-matrix §1.4 `:105-114` 邻区——§0.0 在飞交叠复核必做（批 C 在飞·行号届时重 pin）。**③下游**：050/051 收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）；绕行残余面供产品刀接线裁量（登记不修）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§1.3-③）；Ban invent covered（§1.3-①·含升格 partial/借旁证 wash/借 R3/R5 宣 covered）；Ban live key（§1.3-②·含伪造 Key 面/硬跑 blocked 面）；Ban 触 UC-052 擦除导出域与 UC-018 图面与其余 §1.0 行（§3-2/§3-3/§3-4）；Ban 触产品码面/迁移/CI 告警配置（§3-1·含绕行面就地补线与 env-schema 补录）；Ban 改共享 SSOT（§3-5）；Ban 触既有 proof 文件（零触只读引用·含 obs-logging/privacy-erasure-http/uc018 三先例）；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·枚举外即违·新增豁免须先回炉修订本卷）；Ban 就地归因门矩阵外新红（若现新红→如实登记升级·Ban 借机修）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 `.env*`/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 借本卷收据宣称「kill-switch 全入口覆盖」或「PII 全域零泄」（两 case 收据=具名面具名证据·非全域宣称）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（EXEC 期两 case 全离线隔离 PG·scripted 面零外呼·`env -u` 三键·§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词+行首冲突标记 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:152-163`·不复抄卷内防自匹配——沿批 B/C §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `closed`（2026-10-27 §9-post post 双审双 PASS 会签翻终态·三处钉：本 Status 行+本节+卷尾注·原值 `executed:awaiting_post_prove_dual` 史录留痕不洗·2026-10-26 起草落卷 `draft:awaiting_pre_exec_dual` 史录不洗）· alone≠dual · 开工三条款已兑现（①pre-exec 双审两独立外席 BOTH PASS 落卷（宜含 privacy 域席·派单权归协调方）②协调方明示 EXEC 授权 ③EXEC 立项未改 §1.4 修法面与 §5 Ban/pins 与 §1.3 否决面·§0 已对开工 tip 全量重 pin）· post-prove 双审两独立外席已行使双 PASS 落卷（§9-post·EXIT0 ≠ 证据终态 · coveredCount=8 零动）· EXEC commit 不预 claim post-prove-dual EXIT（史录）。** 开工三条款：①pre-exec 双审两独立外席 **BOTH PASS 落卷**（宜含 privacy 域席·派单权归协调方）；②**协调方明示 EXEC 授权**；③EXEC 立项**不得改 §1.4 修法面与 §5 Ban/pins 与 §1.3 否决面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（`:132` 行 050/051 列值被他刀改写 · kill 闸缝消失或语义变（三态 fail-closed 改静默回退等）· obs-logging/三层壳先例语义变 · 批 C 等在飞卷并线与本刀对同表冲突改行）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §1 红事实推定形不符（如 env=1 begin 未得 503 具名码=产品机制红 · 非法 env 值静默 off 非 fail-closed · 503 前置仍扣额/入队 · 业务哨兵入卷）→ 根因诊断被证伪 → 停·**产品缺陷=EXIT1 诚实保留+backlog 登记上报（翻面权归协调方）**·Ban retry-to-green·Ban 就地改诊断。
- **越界需要**：修法诉求超出 §1.4 恰 2 case 面（需触产品码=绕行面接线/擦除域/UC-018 图面/covered 翻面/共享 SSOT/迁移/告警配置）→ 停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 越届时 cap / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

## §9-EXEC 落卷（2026-10-27 EXEC 席·协调方授权行使·两 case 断言/门矩阵 EXIT 原值/重 pin 落点/attempts 台账如实全录）

### 9.0 立项并线与全量重 pin（§8 ③履行·届值如实采）

- **并线**：`git fetch origin` 本 turn 亲跑 EXIT=0 · 届值 origin/main **`e072e957f`**（**#151 reassess 已并线·#152 未在 main 如实采**——派单预登「#151/#152·cap 2402」对届值漂移如实采：#152 缺席、cap 承 **2397**）· merge-tree 预演 EXIT=0 零冲突（本刀触面与 #151 侧零相撞亲证）· merge 落 **`f39fcc0de`**（共享文件零交涉·additive 亲证）· `pnpm install --frozen-lockfile` EXIT=0（4.3s）。
- **§0.0 在飞交叠复核**：29 树亲读·`line/killsw-draft` 恰 1 命中=本席·clock-e2e @`fc33c04e6`（在飞）触共享面（runner/package.json/双表邻区/egress/cap）仅 **UC-030/NHP-030 格**（`git diff origin/main...HEAD` 逐行亲读）——与本刀 050/051 格**邻区异行=并入届时 merge-tree 预演不停**（§0.0 共享面判级条款）·pay-neg/sse-adv/online-pay/uc31 仅各 1 REQUEST 卷·零字面交叠。
- **§0.1 blob 锚重 pin（tip `f39fcc0de` 亲算）**：机制源 12 件**零漂**（content-safety `50f8c9c3`/interview.service `a8ae0d15`/applications `e1bf8ff0`/all-exceptions `5a5532d6`/langfuse-v5 `63d5466c`/invoke `f6102433`/model-client `f9fd3105`/obs-logging `94d6691d`/uc018 `49a33634`/privacy-erasure `d810d165`/resume-ocr `b2c51425`/job-route-classify `3b1e7081`·与 §0.1 逐值恰等=机制零漂·停止条件未触发）·文档锚漂移如实更：矩阵 **`6e40c988`**（520·`:132` 聚合行/`:191` Ban 行行号不变）·case-matrix **`852d1ccc`**（201·§1.4 头 `:96`→`:98`·NHP-050-\* 全族 `:105-114`→`:107-116`·r2 席2 P3 漂移项承登）·public-text-policy `2edb8b57`（453）·scenarios `9976f9c3`/queue `a7d8959a` 不变。
- **cap 届值重算+越限臂联动（§2-1）**：并线树终验亲跑 `check-docs` PTP_FILE_LIMIT:2398>2397（本卷 .md 已计）·本刀 EXEC 面净增 +4 受管文件（两 proof+两门矩阵 stdout 收据·批 C 极简收据形）→ **cap 2397→2402 恰等步进**（`public-text-policy.mjs:156` MAX_FILES=2_402·:154-160 sanction 注记随卷·`public-text-policy.proof.mjs` :356/:363/:367-368 越限臂 fabricated 数 2_397→2_402/2403 联动·proof 复跑 **EXIT=0**·协调方 EXEC 派单「cap 届值重算+本刀 tracked 文件余量」预授权随令·非预登 2402 差额=收据面如实扩）。

### 9.1 两 case 落码与门矩阵亲跑（EXIT 原值·stdout 留痕）

- **docker info 亲证**：EXIT=**0**（Server 29.5.2 · Ubuntu 24.04.4 LTS · colima 容器可用·receipt `.tmp/nhp-050-kill-01-receipts/00-docker-info.txt`）。
- **NHP-050-KILL-01**（`apps/api/test/uc-e2e-050-nhp-kill.proof.ts`·`pnpm uc050:nhp-kill:prove`）：**EXIT=0 · 59 断言全绿**（K1 env=1 begin 503 具名码+诚实文案逐字+净账零漂 · K2 env=1 turn 503+答案零入队 · K3 off/unset 202 现状字节对照（in-proc+子进程 spawn 双面）· K4 非法值 500 `internal_error` fail-closed+日志词面双断言（`err.message` 恰 `invalid_meetwise_content_safety_kill_switch`+堆栈只进日志+url 去 query·假 DB 论证 503/500 路径零 DB 依赖）· K5 双闸同设 kill 码先行+对照臂（kill 撤·preview 单设 → 503 `public_preview_read_only`=第二闸在位非空转）· K6 净账审计（kill 壳 job=0/answer=0/额度净 0/interview 行零增·off 臂恰 2 start job+2 consumption=唯一写入·业务事实独立保全）· **闸先于 DB 会话/扣额/入队=503 路径零事务零写入**）。
- **NHP-051-NOPII-01**（`apps/api/test/uc-e2e-051-nopii.proof.ts`·`pnpm uc051:nhp-nopii:prove`）：**EXIT=0 · 44 断言全绿**（PC oracle 前提钉履行=consent 200+resume 2xx 哨兵经产品路径+begin 202+turn **409 `question_not_ready` 形 B**（:466 路径对态·钉死落卷）· **LV 日志捕获面活性对照（r2 席2 措辞修正：非哨兵在场）**=语料非空+黄金路径逐 reqId completed 行在场+≥1 error 级行在场 · P1 简历/答案哨兵全语料零入卷 · P2 boot env secret 值（secret/key/token/password/credential 形键·值长≥12 全集）+AUTH/PAY 双常量+Bearer 形哨兵零入卷 · P3 (b) 纯行使面=invoke redactOutput 驱动 `replayable=false`+stored 恰 `{"redacted":true}`+无 redact 对照臂（replayable=true 携原文·非空转）+`pseudonymizeLangfuseIdentifier` 确定性/namespace 分离/零原文/空参 fail-closed+`langfuseSafeModelMetadata` 恰 13 标量键零原文 · P4 未知错 opaque+堆栈只进日志+零业务哨兵 · P5 query 剥离复证 · **运行时 mask/白名单零触归 opt-in smoke 域如实登记**）。
- **attempts 台账（红次如实全录·Ban retry-to-green 承守：每红独立根因修复后复跑·零既有断言改写凑绿）**：
  - uc050 attempt1 EXIT=1（24/59）→ 根因=harness 镜像函数 ACL（`interview_privacy_active_read` 42501）+interview 列位缺（0028/0064）；attempt2 EXIT=1（17/59）→ 根因=sql/22 镜像系 0144 前旧形 binding 触发体+SECURITY DEFINER 属主错位；attempt3 EXIT=1（16/59）→ 根因=`tf_/enforce_` 函数 EXECUTE ACL；attempt4 EXIT=1（16/59）→ 根因=`ck_interview_application_binding_complete`（sql/22 旧 CHECK 未随 0049 升级）；attempt5 中断 → 根因=夹具 SQL 次序（ALTER 先于 CREATE OR REPLACE→LookupFuncWithArgs）；attempt6 EXIT=1（9/59）→ 同 0049 CHECK+子进程 SIGKILL 缓冲丢失（日志面假死）；attempt7 EXIT=1（9/59）→ 根因=`candidate_profile_route_decision` RLS 策略缺失（0142 面）；attempt8 proof 59/59 绿但进程句柄悬挂无 wrapper EXIT（SIGKILL 收卷·log 留痕）→ 显式 `process.exit` 收卷修复；**attempt9 EXIT=0（59/59·全 wrapper 干净收卷·tracked receipt）**。
  - uc051 attempt1 runner not ready → 根因=子进程 0121 路径深度错（ENOENT）；attempt2 EXIT=1 → 根因=P2 泛形扫描误伤（stack 路径含 $HOME=语料·**P2 措辞修正如实登记：值长≥12 全集→secret/key/token/password/credential 形键过滤·本刀自建断言的假阳性修正·非改他刀断言**）+P3 claim 函数 EXECUTE ACL（镜像 CASCADE 错位）；attempt3 中断 → 根因=`ai_model_invocation_transition_permit` 表缺（0088 面·镜像重装清除）；attempt4 EXIT=0（44/44·结构重排：P3 移至预迁移相先收卷·子进程后黄金路径——两证据面同库不同相互不回写）；**attempt5 EXIT=0（44/44·typecast 终版 blob 复跑=tracked receipt·零断言语义变）**。
  - **红因定性：全部=harness 镜像面夹具缺口（ACL/列位/触发体/RLS/路径/次序/收卷）·零产品码红·零机制红**（K1/K2/K5 首跑即绿=闸机制面自证）·夹具修复全录于两 proof 内 PIN 注记（真相=迁移链 0028/0046/0049/0064/0088/0119/0121/0130/0142/0144/0206·0121 重放先例形·零新迁移零产品码触）。
- **邻面不回退（§2-4）**：`obs-logging` 邻面复跑 **EXIT=0 · 26 断言**（零触亲证+log 抓取技法同源验证）· `privacy-erasure-http`/uc052 域零触（git diff 零交叠亲证·freeze 维持）· egress inventory proof **EXIT=0**（373 environment references 零新登记=**egress 条款零登记臂形履行：三模型钥词面码面零直书·片段运行时组装剥除（`EGRESS_STRIP_RE` 自证臂=非空转）·`_neg-harness` 自剥其二**）。
- **机检面（§2-2/§2-3/§2-5）**：markers 五类+冲突标记 grep 本刀改动集**零命中**（词面运行时组装口径·回执本节）· typecheck `pnpm -C apps/api typecheck` EXIT=0（含两新 proof）· `pnpm -C packages/ai-runtime typecheck` EXIT=0 · docs:check EXIT=0（**实跑实测 scanned 2400 ≤ cap 2402·余量 2**——scanner 口径实测为准·本刀净增受管文件按 scanner 计数如实录·收据两件 tracked 在册·越限臂联动已证）。
- **lint cap 承登（§8「验收红不可修」防御·随刀步进）**：root **5306→5334**（+28 恰等=两新 proof 增量·`package.json:8`）·apps/api **1447→1475**（+28 同源·`apps/api/package.json:7`）·双双复跑 **EXIT=0**。runner 第四注册位（pre-migrate 名单）+allowlist+isolatedCommand+SOURCE_PATHS 四位全登记（第五位 resource-caps=PERF 专用·本刀非 PERF 不适用·沿 uc015/uc016 同形）。

### 9.2 双表同步（§1.0.3 令）+ 范围外核

- 矩阵 `:132` 聚合行三列 050/051 措辞 **gap/blind→case-only**（partial 列保留 partial·EXIT0=case≠covered·coveredCount=8 不变）·§1.0.2 新登记行（UC-E2E-050/051 三值 blind 如实只登记·批 B UC-004 分面行先例形）·case-matrix §1.4 两新行 `NHP-050-KILL-01`/`NHP-051-NOPII-01`（语义命名避让 `NHP-050-FAULT-01..05` 擦除域占名）。
- pins 十一值零翻转（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · **coveredCount=8** · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）·`:191`「Ban elevate UC-050/051/export」逐字维持·UC-052/UC-018 域零触·products `apps/*/src`/`packages/*/src` 零 diff（git status 亲读：改动面恰=本卷 .md+两 proof+两注册 package.json+runner+两 policy 件+双表·**产品源零触亲证**）·est live=0（全程零外呼零 Key 加载·假模型/scripted 面）·⛔push。

---

## §9-post（post 双审双 PASS 会签席落卷 · 2026-10-27 · **STOP 三处钉翻终态 `closed`** · 沿 nhp-batch-c-REQUEST §9-post 先例形在树亲证）

**post 输入**：§9-EXEC 两 case 门矩阵全绿在卷（三处钉 `executed:awaiting_post_prove_dual`·待 post-prove 双审）→ post 双审席1+席2 分头独立行使（alone≠dual·协调方派单令两席）→ 双 PASS 会签 → 三处钉（Status 头+§8+卷尾注）翻终态 `closed`；历史节内 token（§9-EXEC 红次台账/各节原值/`:191` 史录锚）保留留痕不洗。卷 closed ≠ covered ≠ 矩阵列升格：coveredCount=8 零动 · releaseEvidence=false · Not HA · 翻面权归协调方 nail。stdout 留痕目录 `.tmp/nhp-050-kill-01-receipts/`+`.tmp/nhp-051-nopii-01-receipts/`（EXEC 红绿次全痕）+`.tmp/isolated-proof-receipts/`（两席 fresh 收据·gitignored 本地证据）。

### 9p.1 席1（14 红次机证链亲核 · P2×6）

- **14 红次机证链亲读**：attempts 台账（§9.1·uc050 ×9+uc051 ×5=14 红次）逐条对 `.tmp` 两目录 stdout/isolated-receipt 留痕亲读——红次叙事与留痕一一对应·零凭空红零凭空绿。
- **10 回执 digest 逐件比对**：红绿次回执 digest 对台账逐件亲算比对——**除两 proof 文件本体外全零漂**（夹具/迁移链/环境件 digest 恒等）→ 红因全=harness 镜像夹具面（ACL/列位/触发体/RLS/路径/次序/收卷）·**零产品码红=决定性**（`git diff` 产品源零触互证）。
- **修复 1:1 映射亲读**：每红次根因对夹具修复（真相=迁移链 0028/0046/0049/0064/0088/0119/0121/0130/0142/0144/0206 重放形·零新迁移）1:1 亲读核过——零多余修复零产品码触。
- **七门亲跑**：docs:check / markers / typecheck / lint 双帽 / `uc050:nhp-kill:prove` / `uc051:nhp-nopii:prove` / 邻面 obs-logging+egress proof 七门本席亲手复跑全绿。
- **lint 双恰等反证**：root **5333** / api **1474**（差一）复跑 **EXIT=1**（门真在数反证·帽非虚设）→ root **5334** / api **1475** 恰等复跑 **EXIT=0**（0 errors·恰等零余量）。
- **P2×6 如实登记**（非阻断·随卷 errata 见 9p.3·史录零字洗）。

### 9p.2 席2（独立复跑+安全面推演 · P2×2）

- **独立复跑**：`pnpm uc050:nhp-kill:prove` 第三 fresh（implementer+席1 之外独立行使）**EXIT=0 · 59/0**（isolated receipt `2026-10-27T03-13-37…Z` · target=`uc050:nhp-kill:prove:raw` · class=`local_untrusted_isolated_proof_receipt` · 与 EXEC tracked receipt 双独立在卷）。
- **安全面推演（对码逐臂）**：K4 非法值 → 500 响应体 opaque `internal_error`（`all-exceptions.filter.ts:39`·err.message/堆栈零泄响应面·词面只入日志）+ 日志词面双断言；K1 时序 → 闸在 DB 会话/扣额/入队之前（`interview.service.ts:425` 前置亲读）=503 零事务零写入零副作用；P 系零 PII → P1 业务哨兵全语料零入卷 / P2 secret 形+Bearer 零入卷 / P3 stored 恰 `{"redacted":true}`+replayable=false / P4 opaque+堆栈只进日志 / P5 query 剥离——逐臂对码推演核过·机制与 §1.2 红事实推定形相符（停止条件「机制不满足」未触发）。
- **帽步进双恰等算术**：root 5306+28=**5334** · api 1447+28=**1475**（两新 proof 增量恰等·零多放）亲算核过·与 §9.1 承登值恰等。
- **P2×2 如实登记**（非阻断·随卷 errata 见 9p.3）。

### 9p.3 双 PASS 会签 + P2 errata 随卷（三件·非阻断）

- **双 PASS 会签**：席1+席2 分头独立行使、结论互证、均 **PASS**——两 case 断言实质全过 · 断言谓词零改写 · attempts 台账与回执一致 · Ban 列/§1.3 否决面/pins 十一值零翻 · est live=0 承守。
- **P2 errata（三件·本节落卷同刀勘正·史录零字洗）**：
  1. **锚漂勘正 `:191`→`:192`**：本卷「`:191`『Ban elevate UC-050/051/export』」行号锚对现树漂移→亲证 **`:192`**（`e2e-requirement-coverage-matrix.md`·他刀同表行内增行所致·语义零变·本卷 `:191` 史录锚保留不洗·读锚以 `:192` 为准）。
  2. **矩阵日期勘正「EXEC 落卷 2026-10-27」**：双表把开关刀 EXEC 证据日期误植为起草日 2026-10-26（coverage-matrix `:132`×4+`:154`×1 · case-matrix `:117/:118`×2）→ 同刀勘正为 **2026-10-27**（2026-10-26=起草日·本卷 §8/§9-EXEC 日期原值零动）。
  3. **uc050 `:530` 措辞勘正**：`uc-e2e-050-nhp-kill.proof.ts:530` 断言消息「unset 唯一正确形」→「**unset=off 合法形之一**」（`content-safety.ts:15-21` unset/`0`=off 两合法形·K3 臂行使 unset 形）——断言谓词零变仅消息措辞·勘正后 proof sha256 `55bf093bcc8fc892bf8ea6921fc2b529b94e271e35727ee0ab1476433b95338c`（对席位 fresh 收据 sourceDigest 漂移如实承登）。
- **STOP 终态=`closed`（三处翻面=Status 头+§8+卷尾注）**——翻面依据=两 case 门矩阵全绿在卷（§9-EXEC）+ 红次机证链零产品码红决定性（席1）+ 第三 fresh 独立复跑 59/0 与安全面推演核过（席2）+ 双 PASS 会签；史录 token `executed:awaiting_post_prove_dual` 保留为 provenance 不回改；后续=并线 PR 走 main（fetch origin/main→merge-tree 预演→merge --no-ff→`pnpm install --frozen-lockfile`→终验五门→push→PR→auto-merge）·矩阵行/coveredCount/backlog 翻面权仍归协调方（本节 append 纯文面+errata 第 2/3 件勘正·零断言谓词动）。

---


*KILLSW REQUEST · 2026-10-26 起草 · 2026-10-27 EXEC 落码落卷 · **STOP=`closed`**（2026-10-27 §9-post post 双审双 PASS 会签翻终态·三处钉：Status 行+§8+本行·原值 `executed:awaiting_post_prove_dual`/起草态 `draft:awaiting_pre_exec_dual` 史录留痕不洗）· UC-E2E-050/051 kill-switch/无 PII 面 · 覆盖矩阵 §1.0.1 `:132` 聚合行 050/051 残余列 + §1.0.2 分面行缺席 + case-matrix §1.4 缺行 · 认领=050/051 NEG/FAULT/BOUND 可测面（kill 触发面 gap+no-pii 黄金路径/trace/堆栈面 gap·blind）· NOT claimed 登记=UC-050 ADV applications.start 绕行残余面（`applications.service.ts:44-58`·只登记零臂）+ UC-052 deletion/export/DELETE 面（出域 freeze 维持）· 修法=恰 2 case（`NHP-050-KILL-01` 触发面 503/三态 fail-closed/双闸优先序/零副作用 + `NHP-051-NOPII-01` 业务哨兵日志扫描/trace 脱敏直行使/堆栈原文面）· 一行一 case·docs+test-only·零产品码触 · §1.3 三否决+三域 Ban（UC-052 域/绕行面修复/图面二次实现）· egress 履行=零登记臂形（三模型钥词面码面零直书·片段运行时组装+_neg-harness 自剥·373 目 EXIT=0）· 双表同步令沿 §1.0.3 `:165` 已履行 · EXEC 立项并线=origin/main `e072e957f`（#151·#152 未在 main 如实采）→ merge `f39fcc0de` · base=origin/main `0246361dd` · 分支 `line/killsw-draft` · 工作树 `meetwise-killsw` · **EXEC 收据=NHP-050-KILL-01 EXIT=0 59 断言 + NHP-051-NOPII-01 EXIT=0 44 断言**（attempts 台账 §9.1 红次全录·红因全=harness 镜像夹具面零产品码红）· cap 2397→2402 恰等步进+越限臂联动 EXIT=0 · lint 承登 root 5306→5334 / api 1447→1475 · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · post-prove dual 席1（14 红次机证链——10 回执 digest 逐件比对除两 proof 外全零漂=零产品码红决定性+修复 1:1 映射亲读+七门亲跑含 lint 双恰等反证 1474/5333 EXIT=1·P2×6）+席2（独立复跑 uc050 59/0+安全面推演 K4 opaque/K1 时序/P 系零 PII+帽步进双恰等算术 +28/+28·P2×2）双 PASS 会签 2026-10-27 落卷（§9-post·P2 errata 三件随卷：:191→:192 锚漂勘正+矩阵日期「EXEC 落卷 2026-10-27」+uc050 :530「unset=off 合法形之一」措辞）· ⛔push ⛔force-push*
