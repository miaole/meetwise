# UC3F REQUEST — UC-E2E-003 FAULT 残脸收口起草卷（F1 薄臂已随 `NHP-003-NEG-01` 首行使 · 矩阵 §1.0.1 `:114` FAULT 格 blind 残 · case-matrix 003 区零 FAULT 行 · 总盘 P2 小刀 #4 · docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停 · pre-exec 双审两独立外席未行使 · alone≠dual · 本 commit 不预 claim 任何 covered 升格——EXIT0=case≠covered · coveredCount=8 零动 · 翻面权归协调方 · ⛔push）。

**席位**：UC-003 FAULT 残脸收口起草席（docs-only · 协调方总盘 P2 小刀 #4「UC-003 FAULT 残脸（F1 薄臂已随 NHP-003-NEG-01 首行使·列值仍 blind）」派单授权 · 认领 `e2e-requirement-coverage-matrix.md` §1.0.1 `:114` UC-E2E-003 行 **FAULT 格** + `non-happy-path-perf-load-case-matrix.md` §1.3 003 区 FAULT 缺行面 · 与 NEG-01/DOM-01/批 A ADV 三已落 case、各 UC 专属线行级互斥）。
**基线**：`origin/main` @ **`2818c2522`**（full `2818c2522a4d5003fb4f9a888c9fa67e7881adc9` · `git fetch origin` 本 turn EXIT=0 · #176 uc30-adv 并线点 · 分支 `line/uc3f-draft` · worktree `meetwise-uc3f` 亲立 · HEAD 落 tip 亲证）· `node scripts/ai-docs/check-docs.mjs` 本树起草前亲跑 **EXIT=0 · scanned 2441**——**恰等 cap 2441 零余量**（`public-text-policy.mjs:244` `MAX_FILES = 2_441` 亲证）· 本卷 REQUEST +1 受管必越 → **cap 恰等步进 2441→2442 随刀落码**（§2-1 承登·四联动点 `2_442`/`f-2442.md`/`:2443`/越限臂 `i<2_442`+`atCap 2_442`）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 `:47-84`/covered 禁填 `:80` / §1.0.1 `:114` / §1.0.2 `:174` / P1-6 `:274` / §1.0.3 `:166` 双表同步令 / `:148` 司法句行）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.3 003 区 `:108`/`:109` 两行·零 FAULT 行亲证）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-E2E-003 `:101`）→ **认领对面卷** `harness/uc003x-REQUEST.md`（Case 1 F1 薄臂定义 §1/§1.3 否决表/§9.1 F1 9 断言承登·closed 在树）→ **现状取证先例** `harness/killsw-REQUEST.md`（K3「off 进程 begin→202 现状字节对照（off=现状保真·BOUND）」§1.4/§9.1·现状取证承载 case 先例形）→ 涉事机制源 `apps/web/lib/resume/ocr-preview-ui.ts`（`:137` `mapResumeUploadAbort`/`:142` `isUploadTimeoutError`/`:8/:9` 超时常量）· `apps/web/app/resume/actions.ts`（`:133` abort→`mapResumeUploadAbort` 接线静态锚）→ **已行使证据** `apps/web/test/uc-e2e-003-nhp-neg.proof.ts`（`:269-284` F1 分节）· `ai-docs/delivery/receipts/nhp-003-neg-01/01-gate-uc003-nhp-neg.stdout.log`（`:147-156` F1 9 PASS）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①协调方派单令（总盘 P2 小刀 #4 · docs-only 起草授权 · 「越限沿常设预授权恰等步进预登」随令）；②`e2e-requirement-coverage-matrix.md` §1.0.1 `:114` UC-E2E-003 行 FAULT 格 **blind**（F1 薄臂已首行使注记在卷·列值 blind 残面 SSOT）；③`non-happy-path-perf-load-case-matrix.md` §1.3 003 区 `:108`（NEG-01）/`:109`（DOM-01）两行在卷·**零 FAULT 行**=双表同步缺位如实登记（补行裁决权归协调方·沿 uc003x 批 A 缺行同形）；④§1.0.3 `:166` 双表同步令（改行必同步双表 · 缺列视为未完成 G2/G6）；⑤结构范本=`harness/uc003x-REQUEST.md`（§0–§9 形制·closed 在树）+ 现状取证先例形=`harness/killsw-REQUEST.md`。

---

## 残余盘点（UC-003 FAULT 残脸 · 本席逐格亲读 @`2818c2522`）

| 面 | 矩阵锚（亲读行号） | 现值（亲读逐字） | 本刀处置 |
|---|---|---|---|
| **FAULT** | §1.0.1 `:114` 第 3 列 | **`blind`**（「**F1 abort/timeout 薄臂已随 NHP-003-NEG-01 首行使**（isUploadTimeoutError 三形分类+mapResumeUploadAbort en exact 钉+CJK-free+zh 对照+超时常量关系·web-logic TC-RES-081 zh 缺省臂旁证互不替代）· **FAULT 列值不动仍 blind·薄缝首行使非列翻面·coveredCount=8 不变**」） | **认领 → Case 1 `NHP-003-FAULT-01` case 收据化**（把已行使 F1 薄臂登记为 FAULT 面 case 证据·沿 UC-050 现状取证先例形·格值 blind 保持+`case-only` 措辞化·列值零翻） |
| NEG | §1.0.1 `:114` 第 2 列 | gap→`case-only`（NHP-003-NEG-01 收据已落注记在卷） | **零触**（NEG 列措辞/收据引用零动·防互洗 §1.4） |
| BOUND | §1.0.1 `:114` 第 4 列 | **partial**（key parity） | 零触（Ban 借本刀收据 wash） |
| ADV | §1.0.1 `:114` 第 5 列 | blind/`case-only`（批 A `NHP-003-ADV-01` #144 nail） | 零触（Ban 互借） |
| 读法列 | §1.0.1 `:114` 末列 | 「静态管道；无故障/对抗」 | 零触（措辞翻面权归协调方） |
| §1.0.2 `:174` + P1-6 `:274` | partial/additive 注记（NEG+DOM 两收据已挂） | 零触（本刀零 DOM 面申明·D2 同族恒持） |
| case-matrix §1.3 003 区 | `:108` NHP-003-NEG-01 · `:109` NHP-003-DOM-01 | 两行在卷·**零 FAULT 行**（`NHP-003` grep 亲证仅两命中） | 本刀 EXEC 补 `:109` 邻区新行 `NHP-003-FAULT-01`（additive 零触既有行） |

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`2818c2522`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **43 树**实测——`uc3f` 恰 **1** 命中=本席；`ai-docs/delivery/harness/` 落卷前**零 `uc3f-REQUEST.md`** → 落卷后唯一同名卷=本卷。
- UC-003 历史四线 `uc003-i18n`/`uc003-followup`/`uc003-arm4-filter`/`uc003x` 全部收官在 main（#161 uc003x 并线点在史）· **在飞零 UC-003 线**（四在飞支对基线 diff 亲证）。
- **在飞交叠逐树亲读**（`git diff --name-only 2818c2522..<branch>` 对本刀共享面亲证）：`line/uc15f-draft` @`5e01b8517`（NHP-015-FAULT-01 收口卷）触矩阵 hunks `:117-123`/`:177`+case-matrix 015 行区+`public-text-policy.mjs`（cap 共享面）；`line/uc33p-draft` @`937773839`（UC-033 PERF）触矩阵 hunk `:149`+case-matrix 新 PERF 行+policy；`line/uc50-draft` @`5c861d3f3`（NHP-050-START-BYPASS-01 收官并线）触矩阵 hunks `:129`/`:151`+case-matrix+policy——**三线对本刀认领格（矩阵 `:114` FAULT 格+case-matrix 003 区 `:108/:109` 邻区）均为同文件邻区异行零同格冲突**；`line/isob-draft` @`2818c2522`=零 diff。共享面（两矩阵邻区/cap 步进）按 §0.0 判级：同文件邻区异行=并入届时 merge-tree 预演如实登记不停·cap 届值届时重算（常设预授权「cap/lint 以合并树实测为准恰等步进免再询」）。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md+cap 步进对 2 件·随刀落码）；EXEC 期触面=双表行内改两件（矩阵 `:114` FAULT 格 additive 注记+case-matrix §1.3 `:109` 邻区新行）+本卷 §9-EXEC 落卷。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树复核，任一分支顶对任一触面存在 `2818c2522` 之后新增提交且行级相撞 → 触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex·行数亲点）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `fe9c2621`（522） | **§1.0.1 `:114`（UC-E2E-003 · NEG gap→case-only + FAULT blind（F1 首行使注记）+BOUND partial + ADV blind/case-only）** · `:148`（UC-E2E-011/017/019 司法句行：「Ban wash 011/019 · Ban 借 LOAD 收据宣 PERF SLO/生产容量/HA · Ban 与三 UC 各自 LOAD/ADV 收据互洗」——**两形状互不替代司法先例形**）· §1.0.2 `:174` · P1-6 `:274` · §0.5 `:47-84`（covered 禁填 `:80`）· §1.0.3 `:166` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `d9d6c4b6`（217） | **§1.3 003 区 `:108` NHP-003-NEG-01 · `:109` NHP-003-DOM-01 · 零 FAULT 行亲证** · 「两形状互不替代」先例措辞链 `:63/:76/:88/:99/:106`（LOAD≠PERF/ADV/收据互不替代五先例形） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3`（648） | UC-E2E-003 `:101`（A1 DOM 无中文残留 · A2 后端校验错误 en 文案呈现 · TC-E2E-003-ui-en）——机制源零漂亲证（对 uc003x 卷 §0.1 blob 恰等） |
| `apps/web/lib/resume/ocr-preview-ui.ts` | `2aa3bdb3`（144） | **F1 行使对象（机制零漂亲证·对 uc003x blob 恰等）**：`:19` zh map 20 键 · `:45` en map 20 键 · `:8/:9` 超时常量 8s/35s · `:123` `readResumeUploadErrorCode` · `:129` `mapResumeUploadError` · **`:137` `mapResumeUploadAbort`（en/zh 二值·`upload_timeout` 载体）** · **`:142` `isUploadTimeoutError`（AbortError/TimeoutError name 形分类）** · web 独有 4 码含 `upload_timeout`/`upload_failed` |
| `apps/web/app/resume/actions.ts` | `99878fe0`（171） | `:133` abort 败臂→`mapResumeUploadAbort` 接线静态锚（行为行使归运行层·本刀 NOT claimed §1.5） |
| `apps/web/test/uc-e2e-003-nhp-neg.proof.ts` | `a5dd5980`（306） | **F1 分节 `:269-284`**：`:269` 分节注（「FAULT 列不因 F1 翻动」）· `:270` section 头 · `:272-273` 合成故障形（AbortError/TimeoutError）· `:274/:275` 两正判 · `:276/:277` 负判两形（非超时 Error/非 Error 形）· `:279` en `upload_timeout` 透传+ok=false · `:280` en 文案 exact 钉（`EN_UPLOAD_TIMEOUT` `:133` 逐字）· `:281` CJK-free · `:283` zh 对照 exact+CJK 在场（`ZH_UPLOAD_TIMEOUT` `:145`）· `:284` 常量关系（8_000/35_000·35s>8s）——**恰 9 断言** · 头注 `:25-27`（F1 薄臂定义）/`:35`/`:302` PIN（「FAULT=blind 不因 F1 翻动」·史录零改承登 §1.5） |
| `ai-docs/delivery/receipts/nhp-003-neg-01/01-gate-uc003-nhp-neg.stdout.log` | `6fbacc29`（170） | **F1 收据亲点 `:147`（section 头）·`:148-156`（9 PASS 逐行）** · 卷尾 `:166`（EXIT0≠covered PIN）/`:167`（N1b backlog PIN）/`:168`（旁证互不替代 PIN）/`:169`（pins）/`:170`（LOCAL_ISOLATED_PROOF_RECEIPT · release_evidence=false）——**本刀 FAULT case 收据化恒等引用此卷·零复写零改写** |
| `apps/web/test/web-logic.proof.ts` | `4a844308`（2171） | TC-RES-081-timeout `:765-775` zh 缺省单臂（旁证·零触·互不替代） |
| `package.json`（root） | `3af8fba7`（770） | `uc003:nhp-neg:prove`/`:raw` 双行在树（uc003x 刀注册·本刀零新注册位） |
| `scripts/ai-docs/public-text-policy.mjs` | `1f62d039`（542） | `:244` `MAX_FILES = 2_441`（cap 亲证 · §2-1 预算核）→ **本刀 2_442 随刀落码** |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `4fa0db8f`（458） | 越限臂四联动点 `:429`（`i < 2_441`）/`:436`（`atCap.scannedFiles, 2_441`）/`:439`（`f-2441.md`）/`:442`（`FILE_LIMIT:2442`）+注释 `:437-438`+链区注记 `:427`——**本刀 2_442/f-2442.md/:2443 随刀联动** |

### 0.2 认领格登记（行号+现值·亲读逐字）

| 锚 | 现值（亲读） | 本刀补 | 零重叠核 |
|---|---|---|---|
| §1.0.1 `:114` FAULT 格 | **`blind`**（F1 首行使注记在卷·列值不动） | Case 1 收据化→**blind 保持+`case-only` 措辞化 additive 注记**（列值零翻·翻面权归协调方） | NEG 格=契约符合性域（`:114` 第 2 列注记在卷）·批 A ADV=对抗健壮性域——F1=故障注入分类域三域 reason 级可分（§1.4） |
| case-matrix §1.3 003 区 | `:108`/`:109` 两行·零 FAULT 行 | `:109` 邻区 additive 新行 `NHP-003-FAULT-01` | 邻区两行零触（additive 零改写）·批 A ADV 缺行域零涉（uc003x 已承登只登记不代补·本刀同纪律） |

---

## §1 刀型裁决（起草席核实·派单令三项裁决点逐项落判）

### 1.1 F1 薄臂现形（哪条命令·哪个断言面·机证三件）

- **命令**：`pnpm uc003:nhp-neg:prove`（runner gate 形）≡ `pnpm -C apps/web prove:uc003-nhp-neg`（raw 形）——uc003x 刀注册双行在树（root `package.json`·`3af8fba7`）。
- **断言面**：`apps/web/test/uc-e2e-003-nhp-neg.proof.ts`（`a5dd5980`·306 行）**F1 分节 `:269-284` 恰 9 断言**——①AbortError→true ②TimeoutError→true ③非超时 `Error('network')`→false（负判）④非 Error 形→false（负判）⑤`mapResumeUploadAbort('en')` `error='upload_timeout'` 透传+`ok=false` ⑥en 文案 exact 钉（`EN_UPLOAD_TIMEOUT` 逐字·proof `:133`）⑦en CJK-free ⑧zh 对照 exact+CJK 在场 ⑨超时常量关系（`RESUME_TEXT_UPLOAD_TIMEOUT_MS=8_000`/`RESUME_OCR_PREVIEW_TIMEOUT_MS=35_000`·35s>8s）。行使对象=产品纯函数 `isUploadTimeoutError`（`ocr-preview-ui.ts:142`）/`mapResumeUploadAbort`（`:137`）——**合成故障形注入→产品函数真分类真映射·离线零 PG 零外呼零 key**（`env -u` 三键具名于 NEG-01 卷·机制源零漂亲证 `2aa3bdb3` 恰等 uc003x 卷 blob）。
- **收据机证**：tracked `ai-docs/delivery/receipts/nhp-003-neg-01/01-gate-uc003-nhp-neg.stdout.log`（`6fbacc29`）**`:147` section 头·`:148-156` 9 PASS 逐行亲点**·卷内全量 EXIT=0 · 129 断言（断言域拆账：前置锚 9+N1 6+N1a 32+N1b 8+N2 33+N3 19+N4 8=**NEG 契约域 115**+**F1 9**+**D1-PF 5**=129·uc003x §9.1/§9P.1 复算在卷）· attempts=3 台账在卷（uc003x §9.1 承登·零断言谓词变）· **F1 臂随该卷首行使=机证成立**。

### 1.2 承载判定：**F1 薄臂足以承载 FAULT 格 case 收据（承载成立）·补臂清单=零必补**

- **判定①（面域恰等）**：UC-003 FAULT 可测缝在 uc003x 卷 §1.3 已裁定收窄——i18n 静态管道故障注入=**零可测缝 NOT claimed**（messages 系构建期 bundle·`request.ts:10-11` locale allowlist 堵 import 注入·零运行时资源 fetch/加载失败缝·不硬造）→ UC-003 FAULT 可申明面**全域恰=client abort/timeout 薄缝**，而 F1 薄臂行使面（四形分类+en/zh 映射+常量关系）恰铺满该薄缝的可测面——**薄臂行使面 vs FAULT 格可测期望差距=零**（承载面域恰等·非以薄充全）。
- **判定②（真行使非旁证）**：F1=合成故障形注入后产品纯函数**真执行**（分类谓词+映射分支真走·含负判防恒真）·非静态词面断言非 grep 门（i6-239 静态源码词面门先例=邻接旁证形·killsw §1.1 同判例）——满足「行为性行使」case 证据门槛。
- **判定③（现状取证先例形）**：沿 `killsw-REQUEST.md` K3「off 进程 begin→202 **现状字节对照**（off=现状保真·BOUND）」先例形——把**已存在的现状**（此处=已行使绿的在卷臂+收据）取证登记为 case 证据·零新实现零重行使。本刀极性=派单令原文「把已行使薄臂登记为 FAULT 面 case 证据」·收据化引用恒等（§1.3）。
- **判定④（矩阵先例形）**：UC-E2E-002 FAULT 格 `partial`/`case-only`（「跨副本杀 SSE」单薄面形·`:113`）· NHP-014-FAULT-01（格值保持+case 注记·`:119`）· UC-030 FAULT gap→case-only 措辞形（`:128`）——**薄面 case 登记+列值保持**为矩阵在树先例形·非孤例。
- **差距面如实披露（非必补·恒持登记）**：对全型 FAULT 期望（如 NHP-001-FAULT-01 服务端 throw 注入+净账 61 断言形）F1 无服务端注入/无净账面——但 UC-003 主链=**离线纯函数+静态对账面**（读法列原文「静态管道；无故障/对抗」·零 PG 零 worker 零净账域）→ 该期望对 UC-003 **无机制域可注入=不适用**（非未做·非偷懒）；真正残余三面=**NOT claimed 恒持**如实登记（§1.5 否决表）·**本刀 EXEC 补臂清单=零**。

### 1.3 修法（Case 1 纯双表登记 · docs-only · 零产品码零 proof 触零新收据）

**Case 1 · `NHP-003-FAULT-01`**（UC-003 · FAULT 面 · 收据化登记面）：

- **场景（简）**：client abort/timeout 故障注入分类薄面（合成 AbortError/TimeoutError/非超时 Error/非 Error 四形 → `isUploadTimeoutError` 分类 + `mapResumeUploadAbort` en/zh 映射 + 超时常量关系）。
- **期望（结构）**：超时两形 true/负判两形 false · en `upload_timeout` 透传+en 文案 exact+CJK-free · zh 对照 exact+CJK 在场 · 35s>8s。
- **证据**：**恒等引用已落收据卷** `ai-docs/delivery/receipts/nhp-003-neg-01/`（`:147-156` F1 9 PASS）+ proof `:269-284`——**零新收据零复写零改写史录·零新 proof 零增臂**（极性=登记已行使现状·非重行使）。
- **EXEC 落点恰两处**：①coverage 矩阵 §1.0.1 `:114` **FAULT 格 additive 注记**——现值 `blind`（F1 首行使注记）后接「`/ case-only` 措辞」（**列值不动仍 blind**·「NHP-003-FAULT-01 case 收据已落（F1 9 断言域·随 NEG-01 卷首行使·EXIT=0 · 收据同卷 `receipts/nhp-003-neg-01/` 恒等引用·EXIT0=case≠covered·coveredCount=8 不变）」）·NEG/BOUND/ADV/读法列零动；②case-matrix §1.3 `:109` 邻区 additive 新行 `NHP-003-FAULT-01`（派生 UC=003 · 列=FAULT · 面=web 纯函数 · 当前旗=**blind→case-only** · 锚点=`pnpm uc003:nhp-neg:prove` EXIT=0 F1 9 断言+收据卷·「两形状互不替代」条款入锚点列）。
- **proof PIN 史录承登**：`uc-e2e-003-nhp-neg.proof.ts:302` PIN「FAULT=blind 不因 F1 翻动」系 NEG-01 时点史录**零改零洗**——其语义（列值不翻面）在本刀措辞下恒真（blind 保持+case-only 措辞=矩阵在树惯例措辞化非翻面·沿 UC-E2E-017 ADV `:122`/UC-030 FAULT `:128` 同形）·承登入 EXEC 落卷注记。

### 1.4 防互洗条款（与 NEG-01 收据零重叠·两形状互不替代沿 `:148` 司法句）

- **三域拆账（同卷分节·reason 级可分）**：NEG-01 case 证据域=契约符合性 115 断言（前置锚 9+N1 6+N1a 32+N1b 8+N2 33+N3 19+N4 8·源→map 键域对账+真信封+状态耦合）·**FAULT case 证据域=F1 9 断言**（故障注入分类域）·D1-PF 5 断言=DOM-01 支撑域（两 claim 均不取）——三域同 proof 分节行使·互不借用。
- **司法句锚**：`e2e-requirement-coverage-matrix.md:148`「**Ban wash** 011/019 · **Ban 借 LOAD 收据宣 PERF SLO/生产容量/HA** · **Ban 与三 UC 各自 LOAD/ADV 收据互洗**」+ case-matrix「**两形状互不替代**」先例措辞链（`:63/:76/:88/:99/:106` 五行）——本刀同纹钉死：**Ban 借 NEG-01 收据（契约域）宣 FAULT 列升格或全域故障覆盖**；**Ban 借 `NHP-003-FAULT-01`（F1 域）宣 NEG 契约域加强或 DOM 面行使**；NEG 格 case-only 措辞+收据引用零动（防双向互洗）。
- **N1b 缺口恒持隔离**：`encrypted`/`magic_mismatch` 两码映射缺位=NEG 域产品契约缺口（backlog 移交协调方·`receipts` `:167` PIN 在卷）——F1 域零涉两缺位码（`upload_timeout` 系 web 独有码·非 API 产出域·`ocr-preview-ui.ts` web 独有 4 码亲证）·**零重叠亲证**·Ban 借 FAULT case 关闭或重开该缺口。
- **web-logic TC-RES-081（zh 缺省单臂 `:765-775`）=旁证恒持**：en 面+F1 全域=本 case 证据·zh 缺省臂旁证零触互不替代（`:114` FAULT 格现注记原文承形）。

### 1.5 否决表（落选/NOT claimed 如实留痕）

| 落选项 | 否决/登记理由 |
|---|---|
| **FAULT 列翻面（blind→partial/covered）** | **Ban**：EXIT0=case≠covered·列值 blind 保持+case-only 措辞化·coveredCount=8 零翻转·翻面权归协调方 |
| **重行使/新收据（重跑 prove 落新收据卷）** | 极性=登记已行使现状（UC-050 现状取证先例形）·已行使绿收据在卷恒等引用·重铺=零增量证据+互洗面 → 本刀不取 |
| **proof 增臂/增断言（如 abort DOM 臂、actions 接线臂）** | 补臂清单=零必补（§1.2 判定①）·零 proof 触=本刀界 · 三残余面 NOT claimed 恒持：**①管道故障注入面**（零可测缝·uc003x §1.3 承裁恒持）**②abort/timeout DOM 渲染行使面**（spec 零 abort 臂·DOM-01 D2 同族 NOT claimed 恒持）**③`actions.ts:133` abort 接线 API-response 行使面**（接线静态锚在树·行为行使归 UI/运行层·NOT claimed） |
| **proof `:302` PIN 行改写** | 史录零改零洗（§1.3 承登·语义恒真） |
| **管道故障面硬造臂** | 零可测缝不硬造（uc003x §1.3 同判·构建期 bundle 无运行时缝可注入） |
| NEG/BOUND/ADV 格+读法列 | 零触（§残余盘点·防互洗 §1.4） |
| case-matrix 批 A ADV 缺行代补 | 只登记不代补（uc003x 同纪律·裁决权归协调方） |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准**）

1. **docs:check（红停条款）+ cap 预算核（亲算·承登）**：起草前本树亲跑 **EXIT=0 · scanned 2441 = cap 2441 恰等零余量**（`public-text-policy.mjs:244` 亲证）→ 本卷 +1 受管必越 → **cap 恰等步进 2441→2442 随刀落码**（`MAX_FILES=2_442`+CAP-SANCTION-2442 注记·**webhook-neg/uc003x「main 恰 cap 零余量+本卷 REQUEST +1·起草 commit 即触」同形**·协调方派单常设预授权「越限沿先例步进承登」随令）；越限臂四联动点同步 `public-text-policy.proof.mjs`（`i < 2_442`+`atCap 2_442`+`f-2442.md`+`PTP_FILE_LIMIT:2443`+注释数字+链区注记）——本树亲跑 PTP **EXIT=0 12/12**；落卷后 docs:check 预期 **scanned 2442 ≤ 2442 恰等**（commit 前 gate 复跑如实录值）。**EXEC 面=零新受管文件**（双表行内注记+本卷 §9-EXEC·零新 proof 零新收据）→ EXEC terminal=2442 零新增；届时在飞三线（uc15f/uc33p/uc50 各含 cap 步进）并线 union → 沿常设预授权「cap/lint 以合并树实测为准恰等步进免再询」届时重算承登。
2. **markers 五类零命中 + est live=0**：本刀改动集（REQUEST+cap 步进对 2 tracked 路径）五类标记词+行首冲突标记 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自指·回执入 §7）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat origin/main` **恰 3 tracked 路径**=本卷 REQUEST（新件）+ `scripts/ai-docs/public-text-policy.mjs`（cap 行+注记）+ `scripts/ai-docs/public-text-policy.proof.mjs`（四联动点+注记）——多任何未登记 tracked 路径即停；EXEC 期 diff 面=矩阵 `:114` FAULT 格行内注记+case-matrix `:109` 邻区新行+本卷 §9-EXEC 三处钉——届时逐件登记·**产品源 `apps/*/src`/`packages/*/src` 与 proof/spec/收据卷零 diff 亲证**。
4. **EXEC 预基面（届时重 pin）**：EXEC=纯文面登记零跑；邻面不回退核=`uc003:nhp-neg:prove`/`uc003:i18n-locale:prove`/`uc003:nhp-adv:prove` 按届时 SSOT 口径恒等绿（本刀零码触·若红=现场漂移触 §8 停）· 双表同步 diff 逐件登记（§1.0.3 `:166` 令）· `:114` 注记与 case-matrix 新行互为镜像（同收据引用同旗值·缺任一=门红）。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:114` **FAULT 格 blind 保持+case-only 措辞化**（NEG/BOUND/ADV/读法列零触）· case-matrix 仅 003 区 additive 新行 · coveredCount=8 零翻转 · `:148` 司法句+case-matrix 五先例行零触 · pins 十一值零翻。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（本刀 EXEC 亦零 proof/spec/注册行/runner 触——纯双表文面）。
2. **既有证据面零触**：`uc-e2e-003-nhp-neg.proof.ts`/`receipts/nhp-003-neg-01/`/`receipts/nhp-003-dom-01/`/`uc-e2e-003-i18n-locale.proof.mjs`/`uc003-i18n-locale.spec.ts`/`web-logic.proof.ts` 全只读恒等（史录 PIN 零洗）。
3. **其余 §1.0 行零触**（§1.5 落选行全只读）· **共享 SSOT 零改**（REMAINING-NORTH-STAR-QUEUE / execution-master-checklist / gap-bug-backlog 只读——N1b 缺口 backlog 移交维持不动）· **covered/queue 翻面零预支** · 零迁移零配置零 `.env*`。

## §4 依赖

**①上游已满足**：F1 臂已行使 EXIT=0 收据在卷（`6fbacc29`·2026-10-27 EXEC·#161 uc003x 并线主线）· 双表锚在树（§0.1 blob 亲算）· 机制源零漂（`2aa3bdb3`/`99878fe0`/`9976f9c3` 对 uc003x 卷 blob 恰等）。**②同文件并发**：起草 turn 恰 1 新 .md+cap 步进对 2 件；EXEC 期触两矩阵邻区（在飞 uc15f/uc33p/uc50 三线登记·§0.0 邻区异行）——在飞交叠复核必做。**③下游**：`NHP-003-FAULT-01` 收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）；UC-003 残面全景（BOUND partial/ADV case-only）归协调方总盘后续裁量。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（EXEC 期邻面复跑红即停·attempts 台账·零断言改写）；Ban invent covered（含升格 partial/借旁证 wash/实例宣伞·EXIT0=case≠covered）；Ban live key/外呼（本刀全链零 Key 面零外呼·`env -u` 三键域恒持）；Ban 触 NEG/BOUND/ADV 格与读法列与 `:174`/`:274`（防互洗 §1.4·含 Ban 借 FAULT case 宣 NEG 域加强）；Ban 触产品码/proof/spec/注册行/runner/收据卷（§3-1/§3-2·零触恒等）；Ban 改共享 SSOT；Ban 重行使重铺（§1.5·收据化=恒等引用非复制非改写）；Ban 改 proof PIN 史录（§1.3 承登）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 `.env*`/写 Key 值入树入据；Ban 顺带升级依赖包；Ban cap 再步进（本刀恰等步进已随令落码·届时 union 越限沿常设预授权另算·Ban 就地超步）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（docs-only+cap 步进对·policy proof 系 fixture 内合成路径计数零树写）。EXEC 期：**纯双表文面登记零跑**（极性=登记已行使现状·零重行使零新收据）；邻面不回退核若行使=离线纯函数面零 PG 零外呼零 Key（NEG-01 卷同壳）·est live=0 恒持。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md + cap 步进对 2 件·起草 turn）五类标记词 + 行首冲突标记 grep **零命中**（起草席 commit 前亲跑·词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自匹配——沿 uc003x/killsw §7 同形制·回执见 commit 前 gate 复跑）。

## §8 STOP · **`draft:awaiting_pre_exec_dual`**（起草落卷即停 · alone≠dual · pre-exec 双审两独立外席未行使 · 后续=pre-exec 双审 → 协调方 EXEC 授权 → EXEC 落卷（双表登记+三处钉）→ post-prove 双审 → 翻面权归协调方）

停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（`:114` FAULT 格被他刀改写 · F1 收据卷/proof 分节被改写 · `:148` 司法句行漂移 · case-matrix 003 区被占行）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 立项期对 §1.2 承载判定复核翻案（如 F1 域断言数/分节锚对届时收据不复·恒等引用断裂）→ 停·如实升级（Ban 就地改判定凑通）。
- **越界需要**：修法诉求超出 §1.3 恰 1 case 纯双表登记面（需触产品码/proof 增臂/新收据/NEG 格触/covered 翻面/cap 再步进）→ 停·另刀或协调方裁决。**派单令停止条件承登：本刀若须产品码改动或触外呼即红停上报**（起草裁决=两条件均未触发·零产品码零外呼·如实承登）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2442 / PTP 红 / 邻面新红）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（起草落卷即停 · pre-exec 双审未行使 · alone≠dual）· 卷 draft ≠ covered ≠ 矩阵列升格（coveredCount=8 零动 · EXIT0=case≠covered）· est live=0 · markers=0（commit 前 gate 复跑回执）· ⛔push。

---

*UC3F REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（起草落卷即停·三处钉：Status 行+§8+本行·alone≠dual·⛔push）· UC-E2E-003 FAULT 残脸收口（总盘 P2 小刀 #4）· 认领=§1.0.1 `:114` FAULT 格 blind（F1 薄臂已随 `NHP-003-NEG-01` 首行使·列值 blind 残）+ case-matrix §1.3 003 区零 FAULT 行 · **F1 薄臂现形**=`pnpm uc003:nhp-neg:prove` EXIT=0 · 129 断言域内 F1 恰 9（proof `a5dd5980` `:269-284`·收据 `6fbacc29` `:147-156` 9 PASS·合成故障四形→`isUploadTimeoutError`/`mapResumeUploadAbort` 产品纯函数真行使·零 PG 零外呼零 key）· **刀型裁决=承载成立·补臂清单零必补**（可申明 FAULT 面全域恰=abort/timeout 薄缝·薄臂行使面与可测期望差距=零·三残余面 NOT claimed 恒持：管道故障注入面零可测缝/DOM 渲染行使面/actions `:133` 接线行使面）· **极性=把已行使薄臂登记为 FAULT 面 case 证据**（沿 UC-050 现状取证先例形·`killsw-REQUEST.md` K3 现状字节形·恒等引用已落收据卷零新收据零重行使）· 修法=恰 1 case `NHP-003-FAULT-01` 纯双表登记（矩阵 `:114` FAULT 格 blind 保持+case-only 措辞化 additive·case-matrix `:109` 邻区新行·列值零翻·翻面权归协调方）· **防互洗=三域拆账**（NEG 契约域 115≠FAULT F1 域 9≠D1-PF DOM 支撑域 5·两形状互不替代沿 `:148` 司法句+case-matrix `:63/:76/:88/:99/:106` 五先例链·Ban 借 NEG-01 收据宣 FAULT 升格·Ban 借 FAULT case 宣 NEG 加强·N1b 缺口 backlog 恒持零涉）· keyless=成立（全链零 Key 面零外呼·`env -u` 三键域）· cap 预算=届值 2441 恰等零余量+本卷 1 件必越 → **恰等步进 2441→2442 随刀落码**（四联动点 2_442/f-2442.md/:2443+越限臂·常设预授权随令·webhook-neg/uc003x 起草即触先例形·PTP 12/12 本树亲跑）· egress=EXEC 零新词面零新 proof→inventory 零新增零登记臂形（届值 environmentReferences=395 `9a2a421c` 亲点·届时如实采）· 双表同步令沿 §1.0.3 `:166` · 基线=`origin/main` `2818c2522`（#176 并线点）· 分支 `line/uc3f-draft` · 工作树 `meetwise-uc3f` · 在飞三线（uc15f/uc33p/uc50）邻区异行登记 · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0≠covered · releaseEvidence=false · ≠HA · ⛔push*
