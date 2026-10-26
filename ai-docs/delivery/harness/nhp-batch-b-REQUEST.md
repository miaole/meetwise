# NHP-BATCH-B REQUEST — 剩余队列 Phase2 #12 one-knife-one-row 批 B 起草卷·覆盖矩阵 §1.0 盲区行第 4-6 行（UC-E2E-004 / 010 / 011）缺列隔离收据处置（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`** · alone≠dual · **STOP=draft（三处钉：本 Status 行 + §8 + 卷尾）** · 本 commit 不预 claim 任何 post-commit EXIT。

**席位**：NHP 批 B 起草席（诊断+起草双责·协调方派·认领 §1.0 盲区行第 4-6 行·与批 A 互斥不重叠）。
**基线**：`main` @ `47dd6be56`（fetch 后 origin/main tip 同指亲证·docs:check **2341≤2346** 本树亲跑 EXIT=0）· 分支 `line/nhp-batch-b-draft`（建前 `git branch --list "line/nhp-batch-b*"` 零命中·本席 `git worktree add ../meetwise-nhp-b -b line/nhp-batch-b-draft origin/main` 亲立·HEAD 落 `47dd6be56` 亲证）· 工作树 `meetwise-nhp-b`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 行）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 / §1.0 三行 / §1.0.2 分面 / §1.0.3 合计读法）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（用例 SSOT·:46-47/:55-59/:83）→ `ai-docs/delivery/harness/uc-e2e-004-career-path.md` / `harness/uc-e2e-010-sse-resume.md` / `harness/uc-e2e-011-report-refund.md` / `harness/gap-uc011-adv-main-mouth-wiring.md` → 涉事机制源 `apps/api/src/modules/interview/interview.service.ts` / `apps/api/src/platform/last-event-id.ts` / `e2e/helpers/sse.ts` / `apps/api/src/modules/commerce/payment-callback.controller.ts` / `commerce-webhook.controller.ts` / `commerce.service.ts` → 同族命名先例 `apps/api/test/uc-e2e-001-*.proof.*`（nhp-neg/nhp-bound/nhp-adv 注册形）与 `apps/api/test/uc-e2e-025-*.proof.*`。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证）；②`e2e-requirement-coverage-matrix.md` §0.5「后续每一个 knife/eval/harness/本表新行或改行必须填写下列列」+ §1.0.3「后续 knife 改行时必须同步改本表 + `non-happy-path-perf-load-case-matrix.md`；缺列视为未完成 G2/G6」（`:164`）；③协调方派单（批 A 认领 §1.0.1 行 1-3·批 B 认领行 4-6·行级互斥）；④结构范本=`harness/reconcile-retry-REQUEST.md`（§0-§8 形制）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`47dd6be56`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **13** 树实测（主仓+12 支线树）——`line/nhp-batch-b*` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep nhp-batch-b` 建前零命中→落卷后唯一同名卷=本卷。
- **批 A 互斥亲证**：`meetwise-nhp-a` 树/`line/nhp-batch-a-draft` 分支在飞·认领 §1.0.1 行 1-3（UC-E2E-001/002/003·矩阵 `:112-114`）·本席认领行 4-6（`:115-117`）——**行级互斥零重叠**；两卷同触矩阵文件时 EXEC 期按 §0.0 在飞交叠复核规则逐树复核。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=三行隔离 prove 新文件+双表行内改（矩阵 `:115-117`/`:147-148` 邻行 + case-matrix `:83` 邻区）。届时对各在飞分支执行 `git log -1 -- <文件>` 逐树逐件复核，任一分支顶对任一触面存在 `47dd6be56` 之后新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`47dd6be56`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `0cf6ae18`（519 行） | **§1.0.1 行 4=`:115`（UC-E2E-004）·行 5=`:116`（UC-E2E-010）·行 6=`:117`（UC-E2E-011）·批 A 三行=`:112-114`**·§1.0.2 `:147`（002/010 分面行）·`:148`（011/017/019 分面行）·**004 无分面行（`:144-156` 亲证缺席）**·§0.5 `:47-84` 强制列+列值词汇（`covered` 禁填 `:80`）·§1.0.3 `:164` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `bbbe217d`（189 行） | **010 现有 case=`:46`（NHP-010-FAULT-01 partial）·`:47`（NHP-010-NEG-01 partial）·BOUND/ADV case 行缺席**·**011 现有 case=`:55-57`（NEG/FAULT/BOUND partial）·`:58`（NHP-011-ADV-01 gap→case-only）·`:59`（NHP-011-LOAD-w-01 blind→case-only·执行收据缺席）**·**004 现有 case 仅=`:83`（NHP-004-FAULT-01 gap·静态 G-GAP）·NEG/BOUND/ADV case 行缺席** |
| `ai-docs/delivery/harness/uc-e2e-004-career-path.md` | `428e23db`（125 行） | §1b 抬 covered 缺口清单（E2E-MAIN/GRAPH/GROWTH/FAIL-A3/UNCERTAINTY）·NEG/BOUND/ADV 面无专节=缺列旁证 |
| `ai-docs/delivery/harness/uc-e2e-010-sse-resume.md` | `06e29b3a`（122 行） | §1b（R1-R4+R-mid+R-authz+G-GAP）·跨副本/对抗面未登记=ADV 缺列旁证 |
| `ai-docs/delivery/harness/uc-e2e-011-report-refund.md` | `338dfdb5`（132 行） | §1b（R1/H1-R4/H5·refund-callback 抬 covered 前置） |
| `ai-docs/delivery/harness/gap-uc011-adv-main-mouth-wiring.md` | `59d3f27b`（132 行） | ADV 七类注入表 A1–A7+新鲜 INV+Z mouth 回归硬门槛（Line V 卷·CLOSED wired 依据面） |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918 行） | **`:49-54` fail seam（`MEETWISE_CAREER_PATH_FAIL_THREAD_ID` production-off）·`:821-846` AiGraphRun(career-path) 单节点图执行+`selectCareerPathDerive`（Line T 接线面）·`:890` onTransitionError 日志**——行 4 FAULT/NEG/BOUND 隔离 prove 的注入缝与行为面 |
| `apps/api/test/uc-e2e-004-career-path.proof.mjs` | `40db2a8b`（219 行） | **`:48` GRAPH_WIRE_RE·`:76` 「must not wire AiGraphRun(career-path)」静态绊线（Line T 后预期 EXIT=1·设计内）·`:158-196` G-GAP 臂族（E2E-MAIN/GRAPH/GROWTH-A1A2/FAIL-A3/UNCERTAINTY）**——行 4 静态诚实钉·NEG/BOUND/ADV 臂零存在 |
| `apps/api/test/uc-e2e-004-career-path-fault.proof.ts` | `c7eeee09`（437 行） | FI-1/FI-3 隔离 prove 承载（Line P/T 收据面）·隔离壳/注册形=行 4 新子刀范本 |
| `apps/api/test/uc-e2e-010-sse-resume.proof.ts` | `680fbd66`（320 行） | **`:185` R1·`:196` R2（LED 续传）·`:212` R3（中位游标）·`:218` R4（空 catch-up）·`:232` R-mid·`:275-302` R-authz（越权订阅→404）**——NEG/FAULT/BOUND partial 的证据面；**全 320 行零 replay/tamper/forged 对抗臂=ADV blind 实证** |
| `apps/api/src/platform/last-event-id.ts` | `40b12d01`（18 行） | LED 解析缝（行 5 ADV「伪造/重放 Last-Event-ID」注入靶） |
| `e2e/helpers/sse.ts` | `f41719a2`（110 行） | SSE 助手（断线/续传臂形·行 5 ADV 注入臂复用基面） |
| `apps/api/test/uc-e2e-011-refund-callback-adv.proof.ts` | `c9ba96b6`（474 行） | **ADV 七类 A1–A7+INV+X+ZREG 类目（`:56-57`）·`:173` EXIT 契约「EXIT0 ≠ covered ≠ 翻行」·`:191-201` 单管道/Ban 复制守卫/Ban 金额通道静态臂**——行 6 ADV gap→case-only 的既有收据（Line V·CLOSED wired） |
| `apps/api/test/uc-e2e-011-refund-callback-mouth.proof.ts` | `b3301f62`（243 行） | Z mouth 回归 41/41（Line Z Path A 收据面） |
| `apps/api/src/modules/commerce/payment-callback.controller.ts` | `37b8af46`（35 行） | **`:20` `@Controller('payment')`+`:24` `@Post('refund-callback')`（Line V 主口真路由·薄适配白名单）** |
| `apps/api/src/modules/commerce/commerce-webhook.controller.ts` | `2b976602`（25 行） | **`:8` `@Controller('commerce/webhook')`+`:20` `@Post('refund/:id')`（Path A 等价口·Line Z）** |
| `apps/api/src/modules/commerce/commerce.service.ts` | `f55d414c`（292 行） | `refundWebhook` 单管道（全链路 400/403/404/CAS/409/200 只此一份）——行 6 LOAD/PERF 隔离 prove 的行使靶 |

### 0.2 认领三行登记（行号+用例名+缺列·§1.0.1/§1.0.2 亲读逐字）

| 行号 | §1.0.1 用例名 | 现列值（亲读） | 缺列（本刀补收据靶） |
|---|---|---|---|
| **4**（`:115`） | **UC-E2E-004**（career-path 全链路） | NEG=**gap** · FAULT=**gap**（FI-1 修复+FI-3 接线收据已落而列不动）· BOUND=**gap** · ADV=**blind** | NEG/BOUND/ADV 三列零隔离 case（case-matrix 仅 `:83` NHP-004-FAULT-01=gap）；**§1.0.2 分面行整行缺席**（PERF_api/PERF_web/LOAD_worker 未注册·违 §0.5「不得单列 n/a 偷关」精神） |
| **5**（`:116`） | **UC-E2E-010**（SSE 断线重连） | NEG=**partial**（R-authz）· FAULT=**partial**（断 SSE/R-mid）· BOUND=**partial**（LED）· ADV=**blind** | ADV 零隔离 case（case-matrix 无 NHP-010-ADV 行·proof 320 行零对抗臂实证）；§1.0.2 `:147` 行三分面全 blind（本刀不wash·只补 ADV case 证据） |
| **6**（`:117`） | **UC-E2E-011**（报告失败退款+计费边界） | NEG=**partial** · FAULT=**partial** · BOUND=**partial**（幂等误 release）· ADV=**gap**/`case-only`（GAP-UC011-ADV-01 CLOSED wired·Line V） | §1.0.2 `:148` 行 PERF_api=**blind** · LOAD_worker=**blind**（NHP-011-LOAD-w-01 `:59` 登记 case-only 而执行收据缺席·PERF 零 case 行）；ADV 列措辞保留（Ban 借新收据翻 gap/case-only 措辞） |

## §1 红事实（机制链·全部亲证 @`47dd6be56`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 行 4（UC-E2E-004）四读码面

- **NEG 读**：career-path POST/GET 面零负路径隔离 prove——`uc-e2e-004-career-path.proof.mjs` 219 行仅 S1–S5+G-GAP 静态臂（`:158-196`），无 402/401/409 `insufficient_evidence` 越权/无证据族隔离 case（对照 `interview-assessment.ts:33-34` GET→409 `insufficient_evidence` 产品行为已存在而零 case 行使）→ **gap 实证**。
- **FAULT 读**：NHP-004-FAULT-01 已登记（case-matrix `:83`）且隔离收据已落（Line P 池错误观测 `56fc1ea`·Line T 图接线 `0a3c8a8`+fail seam `:49-54` production-off）——但矩阵列措辞仍 **gap**（EXIT0≠A3 closed·`GAP-UC004-FAIL-A3` stays gap）→ 缺列=**A3 失败降级终局收据**（非重新实现·沿既有 `uc-e2e-004-career-path-fault.proof.ts` 隔离壳只增臂）。
- **BOUND 读**：零 BOUND case 行——重复 begin/重复幂等/0 卡片边界族无隔离 prove（对照 UC-001 BOUND 先例 17 臂形）→ **gap 实证**。
- **ADV 读**：零 ADV 词面零 case 行 → **blind 实证**；且 §1.0.2 无 004 分面行（`:144-156` 亲证）→ 分面 PERF_api/PERF_web/LOAD_worker 未注册（补登记行·值保持 blind 如实）。

### 1.2 行 5（UC-E2E-010）四读码面

- **NEG 读**：R-authz 臂在树（`:275-302` 他人 principal 订阅→404）→ partial 成立。
- **FAULT 读**：R1–R4+R-mid 断线/续传臂在树（`:185-250`）→ partial 成立。
- **BOUND 读**：LED 三游标边界臂在树（`:196-227` Last-Event-ID=3/2/5）→ partial 成立。
- **ADV 读**：全 320 行零 replay/tamper/forged/cross-user 注入臂（rg 亲证命中仅 2 处注释性词）——伪造/重放 `Last-Event-ID`（注入靶 `last-event-id.ts:1-18`）、越权订阅复用、跨 user 事件注入拒收均零 case → **blind 实证**；§1.0.2 `:147` 三分面 blind 保持（本刀 Ban n/a 偷关 Ban wash）。

### 1.3 否决面（三否决·本席起草适用·EXEC 期同纹·命中即停）

1. **Ban invent covered**：隔离 prove EXIT=0 仅=case 证据；三行措辞只允许 blind/gap→`case-only`（或 partial 列保留 partial）诚实登记·**禁止升 covered/partial**·`coveredCount=8` 零翻转·covered 翻面权归协调方（§0.5 列值词汇 `:68-84`「本切片不填 covered」沿承）。
2. **Ban live key**：零 `MODEL_API_KEY` 加载/伪造·零 live 外呼·无 Key 面（`e2e:isolated`/`full.e2e`）=blocked 如实登记永不硬跑·est live=0（§6）。
3. **Ban retry-to-green**：任一门红即停如实登记·attempts 台账逐次留痕·禁红后重跑冲销·禁改既有断言凑绿（「为绿改断言」Ban 沿承）。

### 1.4 修法裁决：**三行各补缺列隔离收据（一刀一行·docs+test-only·零产品码触）**

- **行 4 三子刀**（可分批·命名沿 uc001/uc025 `nhp-*-prove` 族）：`NHP-004-NEG-01`（越权/无证据 409 `insufficient_evidence` 族隔离 prove）+ `NHP-004-BOUND-01`（重复 begin/幂等/0 卡片边界隔离 prove）+ `NHP-004-ADV-01`（伪造 body/重放/越权 POST·fail seam production-off 沿 Line T 缝形）；case-matrix 补三 case 行（gap→case-only 措辞）；§1.0.2 补 004 分面登记行（三值 blind 如实·只登记不填绿）。
- **行 5 一子刀**：`NHP-010-ADV-01`（SSE 订阅对抗：伪造/重放 Last-Event-ID·越权订阅复用·跨 user 注入拒收）· case-matrix 补 case 行（blind→case-only）· §1.0.1 ADV 列措辞随收据改 `case-only`·§1.0.2 `:147` blind 保持。
- **行 6 一子刀**：`NHP-011-LOAD-w-01` 执行收据（并发失败退款风暴·`refundWebhook` 单管道并发行使·沿 NHP-017-LOAD-w-01 Line Y settled-cohort 路由先例）+ `NHP-011-PERF-api-01`（refund-callback 错签/负路径并发延迟·命令+负载形状+期望+收据路径四件套按 §0.5 口径）· §1.0.2 `:148` PERF_api/LOAD_worker blind→case-only 措辞·EXIT 台账随收据。
- **双表同步令**：每子刀改行必须同 turn 改矩阵三行+case-matrix 对应行（§1.0.3 `:164` 强制）·缺列视为未完成 G2/G6；ADV 收据 **Ban wash** UC-011 已 CLOSED 的 `GAP-UC011-ADV-01` 措辞。

## §2 验收断言（pre-exec 双审核对单基面·起草门 4 门本 commit 适用+EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned **≤cap 2346**（`public-text-policy.mjs:137` MAX_FILES=2_346·基线 2341 本树亲跑·本卷 +1 预期 2342·>2346 红停上报·cap 上抬权归协调方）。
2. **markers 五类零命中**：本刀改动集新增行五类标记词 grep 零命中（词族沿 `i6-239-gates.proof.mjs:159-163` 门口径·词面运行时组装·不复抄卷内防自指·命令与回执入 EXEC 收据）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 .md（多任何 tracked 路径即停）；EXEC 期 diff 面=本卷+双表行内改+新 proof 文件+pnpm 注册行（按需·届时逐件登记）。
4. **est live=0**：零实跑零模型外呼零 Key 加载（§6）。
5. **EXEC 预基面（届时重 pin）**：各子刀隔离 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）·邻面不回退（`neg:all`/`interview:prove:raw` 等按届时 SSOT 口径恒等）·typecheck/lint 按届时五值恰等口径·双表同步 diff 面逐件登记·任一门红→§8 停止条件。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行按需·沿 uc001/uc025 nhp 族 prove-only 先例）。
2. **批 A 三行零触**：矩阵 `:112-114`（UC-E2E-001/002/003）及其 case 归批 A 席·本刀 Ban 触。
3. **其余 §1.0 行零触**：行 7 起（`:118-140`）及 §1.0.2 非认领行只读。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支**：本刀收据不构成 covered 抬升·Ban 预写翻面措辞。
6. **零迁移零配置**：Ban 新迁移 Ban 触告警/CI 配置（越界即停）。

## §4 依赖

**①上游已满足**：三行既有 prove/harness 面全在树（§0.1 blob 锚表 17 件）+ 隔离 prove 命名族先例（uc001 `nhp-neg`/`nhp-bound`/`nhp-adv`·uc025 同族）+ `run-e2e-isolated` 三层壳。**②无同文件并发**：起草 turn 恰 1 新 .md 零交涉面；EXEC 期触矩阵 `:115-117`/`:147-148` 与 case-matrix `:46-59`/`:83` 邻区——§0.0 在飞交叠复核必做（批 A 同文件行级互斥）。**③下游**：三行收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§1.3-③）；Ban invent covered（§1.3-①·含升格 partial/借旁证 wash）；Ban live key（§1.3-②·含伪造 Key 面/硬跑 blocked 面）；Ban 触批 A 三行与其余 §1.0 行（§3-2/§3-3）；Ban 触产品码面/迁移/CI 告警配置（§3-1/§3-6）；Ban 改共享 SSOT（§3-4）；Ban 改既有 proof 断言（只增臂）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 就地归因门矩阵外新红（若现新红→如实登记升级·Ban 借机修）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（EXEC 期各子刀全离线隔离 PG·零模型外呼·§2-5 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面运行时组装口径·不复抄卷内防自匹配——沿 negbend/reconcile-retry 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.4 修法面与 §5 Ban/pins 与 §1.3 三否决**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（三行列值被他刀改写·`refund-callback` 主口/Path A 口语义变·fail seam `:49-54` 消失·批 A 卷与本卷对同表产生冲突改行）→停·重 pin 回炉。
- **机制不满足**：子刀隔离 prove 落卷后既有邻面臂翻红或新臂收据与 §1 红事实推定形不符（如 409 行为面不存在·LED 伪造被静默接受）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1.4 恰 5 子刀面（需触产品码/批 A 行/covered 翻面/共享 SSOT/迁移/告警配置）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check>2346/邻套件新红/typecheck/lint 超）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9-rev rev 修订注记（pre-exec 双审席1 FAIL·P1×3 撞行面+P2 两件+P3 三件合并清单→rev 回路 · 与 UC-004 双审席2 撞行裁定收敛 · rev 席落卷 2026-10-26 · **append 注记形 · 上文 §0-§8 一字不洗** · EXEC 期与上文冲突处以本节为准读）

**rev 缘由**：pre-exec 双审席1 FAIL 合并清单（P1×3 撞行面：①行 4 `NHP-004-NEG-01` 撞 `uc004-draft` 臂 6/7 NEG 面·②行 4 fault prove「只增臂」面撞 uc004 回归面·③行 6 `:148` PERF/LOAD 格撞 `uc011-draft`）+P2 两件+P3 三件·本席逐位届树亲证（证据随条·在飞三线 `line/uc004-draft`/`line/uc011-draft`/`line/nhp-batch-a-draft` 逐树 `git log -1` 亲读）后按 rev 回路落卷（只改本卷·纯文面零码动·码面/SSOT/他卷/既有 proof 零触·落卷形=append 不洗·EXEC 期以下列修正句为准读）。**七落点全部届树成立落修正·零跳过**。**STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值零翻**（Status 头/§8/卷尾注）·**rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve**。

### §9-rev.1 修订①（P1-①②·行 4 收缩——删 NHP-004-NEG-01 整子刀·NEG/FAULT 让位·fault prove 零触只读）

- **届树亲证**：`git log -1 line/uc004-draft`=`4bf00bed0`（base 同 `47dd6be56`·`git diff --name-only origin/main...HEAD` 恰 1 新文件 `ai-docs/delivery/harness/uc004-e2e-REQUEST.md` +110 亲证）。其 §1.1 断言臂亲读：**臂 6 越权（他人 principal GET career-path→404）+臂 7 409 族（无评估线程→409 `assessment_required`·overall 不可信→409 `insufficient_evidence`）=NEG 面整族**；**臂 10-15=FAULT 失败降级臂整族**（500 信封/`ai_graph_run` failed 行/version≥2/GET 404/额度账本净 0/in-fault 重试/server alive·七项口径沿 fault prove `:44-46`）；其 §1.3 明钉「不改既有 prove：`uc-e2e-004-career-path.proof.mjs` 与 `uc-e2e-004-career-path-fault.proof.ts` 原句口径零改（只回归复跑）」且 Ban 触矩阵 SSOT——两 proof 归 **uc004 回归面**·矩阵列值其线零改写。
- **修正句一（§1.4 行 4 收缩）**：行 4「三子刀」删 `NHP-004-NEG-01` 整子刀→**行 4 收缩为 `NHP-004-BOUND-01`+`NHP-004-ADV-01`+§1.0.2 补 004 分面登记行** 三件；「case-matrix 补三 case 行」→「**补二 case 行**（BOUND+ADV·gap→case-only 措辞同口径）」；分面登记行（三值 blind 如实·只登记不填绿）不变。
- **修正句二（NEG/FAULT 让位注记）**：行 4 NEG/FAULT 两列隔离收据诉求**让位 `line/uc004-draft` @`4bf00bed0`**（臂 6/7=NEG 面·臂 10-15=FAULT 面·上亲证）——本卷对两列**零 case 零 prove 零矩阵改写**（列值 gap 如实保持·翻面权归协调方）；§1.1 行 4 NEG 读/FAULT 读两段的「本刀补收据」指向随之作废改读（§1.1 缺列诊断本体如实保留）。
- **修正句三（fault prove 引用形收紧·§0.1+§1.1）**：`apps/api/test/uc-e2e-004-career-path-fault.proof.ts`（§0.1 锚 `c7eeee09`）由「隔离壳/注册形=行 4 新子刀范本」「沿既有…隔离壳只增臂」改**零触只读引用（归 uc004 回归面·其「只回归复跑」原钉不变）**——本卷行 4 全部 prove 为独立新文件（沿 uc001/uc025 `nhp-*-prove` 族命名）·**零增臂零改写零复用其壳内断言**。
- **修正句四（§5 Ban 收紧）**：§5「Ban 改既有 proof 断言（只增臂）」→「**Ban 触任何既有 proof 文件（零触只读引用·含 Ban 只增臂/Ban 复用既有壳内断言——本卷全部 prove 为新文件）**」。
- **修正句五（子刀计数）**：全文「恰 5 子刀」→「**恰 4 子刀（行4 两刀+行5 一刀+行6 一刀）**」（§8 停止条件-3「恰 5 子刀面」与卷尾注两处落点·EXEC 期按本句读）。

### §9-rev.2 修订②（P1-③·第二撞行登记——§0.0 在飞补登 uc011/uc004 两线+行 6 `:148` PERF/LOAD 格权属预裁定落文+树数更新）

- **届树亲证**：`git worktree list` rev 时点 **18 树**实测（起草时 13 树→增树含 `meetwise-uc004`/`meetwise-uc011` 两 UC 线·逐树亲读）；`git log -1 line/uc011-draft`=`a23385730`（`git diff --name-only origin/main...HEAD` 恰 1 新文件 `ai-docs/delivery/harness/uc011-e2e-REQUEST.md` 亲证）；其件二亲读=「matrix §1.0.1 `:117` ADV 列+快乐读法列按真收据改注记」+「§1.0.2 `:148` PERF/LOAD **保持 blind 零宣称**（Ban n/a 偷关）」+「NHP 矩阵 `:58` 停用『产品口缺失』过时句改现势措辞」→与本卷行 6 触面（`:148` 两格+`:59` 收据+新 PERF 行）相邻交叠待裁。
- **修正句一（§0.0 在飞登记补两线）**：§0.0 在飞登记补 **`line/uc011-draft`（@`a23385730`·认领 UC-E2E-011 ADV 面隔离收据+矩阵六列补齐）与 `line/uc004-draft`（@`4bf00bed0`·认领 UC-004 e2e HTTP 主路径+NEG/FAULT 臂·见 §9-rev.1）**——EXEC 期照 §0.0 交叠复核规则对两线 `git log -1 -- <触面文件>` 逐树逐件复核·任一线顶对任一触面存在 `47dd6be56` 之后新增提交→触「现场漂移」停手上报。
- **修正句二（行 6 `:148` PERF/LOAD 格权属预裁定落文·建议形·终裁权归协调方）**：**本卷独占** §1.0.2 `:148` 行 UC-E2E-011 的 PERF_api/LOAD_worker 两格改写权+case-matrix `:59` NHP-011-LOAD-w-01 执行收据+case-matrix **新 `NHP-011-PERF-api-01` 行**；**UC-E2E-011 ADV 列（`:117`）措辞与 case-matrix `:58` 过时句修正归 `line/uc011-draft`**（其件二自钉「`:148` 保持 blind 零宣称」→两线 `:148` 无字面相撞·本裁定收口防将来越格）；**互 Ban 越格**（本卷 Ban 触 `:117` ADV 列措辞与 `:58` 备注句·uc011-draft 沿其卷自钉不触 PERF/LOAD 格）；**EXEC 顺序 UC-011 先行**（同文件邻区改行避并行·本卷行 6 子刀随其后）。
- **修正句三（树数）**：§0.0「建后 13 树实测」→「**rev 时点（2026-10-26）18 树实测**」·`line/nhp-batch-b*` 恰 1 命中维持。

### §9-rev.3 修订③（P2-①·行 6 blind→case-only 新措辞防洗句沿 uc017 先例）

- **届树亲证**：矩阵 `:148` UC-E2E-011/017/019 行 uc017（Line Y nail）注记原句亲读=「**Ban 借 LOAD 收据宣 PERF SLO/生产容量/HA**」——先例在树逐字。
- **修正句**：§1.4 行 6「PERF_api/LOAD_worker blind→case-only 措辞」补防洗句（沿 uc017 先例同纹）：「**Ban 借本刀收据宣 PERF SLO/生产容量/HA**」（case-only=具名 case 诚实登记·EXIT0=case≠covered·隔离库负载≠生产容量·local≠prod≠HA）。

### §9-rev.4 修订④（P2-②·§8 停止条件「机制不满足」举例精化——防机制面误停）

- **届树亲证**：`apps/api/src/platform/last-event-id.ts:10-16` 亲读=**malformed** LED（不合 `^(0|[1-9]\d{0,15})$`/非安全整数）→`HttpException 400 invalid_last_event_id` **fail-closed 实证在树**；`apps/api/test/uc-e2e-010-sse-resume.proof.ts:218-227` R4 亲读=**well-formed** 已追上游标→**SSE 200+空 catch-up+hold ping**（重放游标语义：已追上非错误空）。
- **修正句**：§8「机制不满足」例「LED 伪造被静默接受」精化两分——EXEC 期判停前置：①**malformed LED 未得 400 `invalid_last_event_id`**=机制真红可停；②**well-formed 伪造游标得空 catch-up=重放游标语义内预期行为（R4 先例）·非机制红·Ban 据此误停**（防把设计内语义误判「静默接受」而触停）。

### §9-rev.5 修订⑤（P3-①·§1.2 rg 计数如实）

- **届树亲证**：`apps/api/test/uc-e2e-010-sse-resume.proof.ts` rg 实测=中文「重放/越权」词面 **6 行**全在既有 R 族臂标签（`:191`/`:192` R1·`:208` R2·`:258`/`:271` R-mid·`:302` R-authz）·英文 `tamper`/`forged`/`replay` **0 命中**。
- **修正句**：§1.2 ADV 读「（rg 亲证命中仅 2 处注释性词）」→「（rg 亲证：中文重放/越权词面在既有 R 臂标签 6 行·tamper/forged 英文词 0 命中）」——**对抗注入臂零存在·ADV blind 结论不变**（纯计数勘误）。

### §9-rev.6 修订⑥（P3-②·§1.4 ADV-01 越权 POST 臂与 uc004 臂 6 同族旁证注记）

- **修正句**：§1.4 行 4 `NHP-004-ADV-01` 越权 POST 臂**Ban 借 uc004-draft 臂 6（越权 GET→404）wash 本卷任何列值**——两臂同族（越权拒绝面）·只作**同族旁证只读引用**·列值零联动零翻转（沿 §1.3-① Ban 借旁证 wash 同律）。

### §9-rev.7 修订⑦（P3-③·批 A 互斥行号更新）

- **届树亲证**：`git log -1 line/nhp-batch-a-draft`=`fbfdcc0c8`（`git diff --name-only origin/main...HEAD` 恰 1 新文件 `ai-docs/delivery/harness/nhp-batch-a-REQUEST.md` 亲证）；其认领三行亲读=**`:118`（UC-E2E-012/024·NHP-012-FAULT-01）+`:114`（UC-E2E-003·NHP-003-ADV-01）+`:128`（UC-E2E-030·NHP-030-FAULT-01）**·且其行表明钉「`:115` UC-004 他项认领跳过」——非本卷 §0.0 所记「行 1-3（`:112-114`）」。
- **修正句一（§0.0+§0.1）**：「批 A 认领 §1.0.1 行 1-3（UC-E2E-001/002/003·矩阵 `:112-114`）」→「批 A 认领 §1.0.1 **`:114`/`:118`/`:128` 三行（UC-E2E-003·UC-E2E-012/024·UC-E2E-030）**」（§0.1 锚表「批 A 三行=`:112-114`」随之同读）——**行级互斥零重叠结论维持**（本卷 `:115-117` 与批 A 三行两两不交·批 A 明钉跳过 `:115`）·两卷同触矩阵文件的交叠复核规则维持·立项出处③协调方派单原文照录为史录不洗。
- **修正句二（§3-2）**：「批 A 三行零触：矩阵 `:112-114`（UC-E2E-001/002/003）及其 case 归批 A 席」→「矩阵 **`:114`/`:118`/`:128`** 及其 case 归批 A 席」。

**rev 自检回执**：`git diff --numstat` 恰 1 tracked=本卷 .md（§0-§8 一字不洗·纯 §9-rev 节 append+卷尾注行内 append）；`node scripts/ai-docs/check-docs.mjs` EXIT=0（rev 时点亲跑·本卷系既有文件 append 零新增受管·scanned 2342≤cap 2346）；markers 五类零命中（词面运行时组装口径·本席亲跑 0 命中·回执随 EXEC 收据留痕）；码面/SSOT/他卷/既有 proof 零触（rev turn 全只读+本卷 1 .md append）；est live=0（`actualSpendCny=null` 同源）·markers=0·pins 十一值零翻转·**STOP=`draft:awaiting_pre_exec_dual` 三处同值零翻**（Status 头/§8/卷尾注）·rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve。

---

*NHP-BATCH-B REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（本卷唯一 STOP 终态·三处钉：Status 行+§8+本行）· 剩余队列 Phase2 #12 one-knife-one-row 批 B · 覆盖矩阵 §1.0.1 行 4-6（UC-E2E-004 `:115` / UC-E2E-010 `:116` / UC-E2E-011 `:117`）· 缺列=行 4 NEG/BOUND/ADV+分面行缺席·行 5 ADV·行 6 PERF_api/LOAD_worker 执行收据 · 修法=三行各补缺列隔离收据（恰 5 子刀·一刀一行·docs+test-only·零产品码触）· §1.3 三否决（Ban invent covered / Ban live key / Ban retry-to-green）· 双表同步令沿 §1.0.3 `:164` · base=origin/main `47dd6be56` · 分支 `line/nhp-batch-b-draft` · 工作树 `meetwise-nhp-b` · 与批 A（行 1-3）行级互斥零重叠 · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · ⛔push · rev 修订注记 §9-rev 2026-10-26 落卷（pre-exec 双审席1 FAIL 合并清单 P1×3 撞行面+P2 两件+P3 三件回卷·与 UC-004 双审席2 撞行裁定收敛·七落点全成立落修正·零跳过·§0-§8 零字洗·「恰 5 子刀」改读「恰 4 子刀（行4 两刀+行5 一刀+行6 一刀）」·NHP-004-NEG-01 删·行 4 NEG/FAULT 让位 `line/uc004-draft` @`4bf00bed0`·fault prove 零触只读·批 A 互斥行号改读 `:114`/`:118`/`:128`·在飞补登 `line/uc011-draft` @`a23385730`+`:148` 格权属预裁定·STOP 三处同值零翻·第二轮 pre-exec 双审待重派·窄域=§9-rev 落点复验）*
