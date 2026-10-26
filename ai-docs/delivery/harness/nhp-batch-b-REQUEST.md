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

---

*NHP-BATCH-B REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（本卷唯一 STOP 终态·三处钉：Status 行+§8+本行）· 剩余队列 Phase2 #12 one-knife-one-row 批 B · 覆盖矩阵 §1.0.1 行 4-6（UC-E2E-004 `:115` / UC-E2E-010 `:116` / UC-E2E-011 `:117`）· 缺列=行 4 NEG/BOUND/ADV+分面行缺席·行 5 ADV·行 6 PERF_api/LOAD_worker 执行收据 · 修法=三行各补缺列隔离收据（恰 5 子刀·一刀一行·docs+test-only·零产品码触）· §1.3 三否决（Ban invent covered / Ban live key / Ban retry-to-green）· 双表同步令沿 §1.0.3 `:164` · base=origin/main `47dd6be56` · 分支 `line/nhp-batch-b-draft` · 工作树 `meetwise-nhp-b` · 与批 A（行 1-3）行级互斥零重叠 · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · ⛔push*
