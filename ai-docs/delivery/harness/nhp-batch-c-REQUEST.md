# NHP-BATCH-C REQUEST — 剩余队列 Phase2 #12 one-knife-one-row 批 C 起草卷·覆盖矩阵 §1.0 残余行（UC-E2E-016/029 `:121` / UC-E2E-015 `:120` / UC-E2E-001 分面 `:146`）缺列隔离收据处置（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`closed`**（§9-post post 双审双 PASS 会签席翻面 2026-10-26 · 原值 `executed:awaiting_post_prove_dual` 史录 provenance 见 §8/§9-EXEC/§9-post · alone≠dual）· **STOP=closed（三处钉：本 Status 行 + §8 + 卷尾·2026-10-26 §9-post 翻终态·`executed:awaiting_post_prove_dual` 史录不洗）** · 三 case 隔离 prove EXIT=0 已落（implementer pre-commit runs）+ post-prove 双审席1+席2 双 PASS 已落卷（§9-post·两红次定性核全过+断言名零改写+三门第三 fresh 独立复跑 53/53+30/30+10/10 首跑绿+caps docker inspect 亲证+安全面五项读码）· 本 commit 不预 claim 任何 covered 升格（EXIT0=case≠covered·coveredCount=8 零动）。

**席位**：NHP 批 C 起草席（诊断+起草双责·协调方派·认领 §1.0 残余行中三行·与批 A/B/各 UC 专属线互斥不重叠）。
**基线**：`origin/main` @ **`7e47688db`**（full `7e47688db8f8954d2ee1d9285ecb3dacad935718` · `git fetch origin` 本 turn 成功 · 分支 `line/nhp-c-draft` 零独有 commit · `git reset --hard origin/main` 亲证 HEAD 落 tip）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2362 ≤ cap 2370**（§2-1 亲算）· 工作树 `meetwise-nhp-c`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 行）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 / §1.0.1 残余行 / §1.0.2 分面 / §1.0.3 合计读法）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（用例 SSOT·:40-42/:86-87）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-016 `:163` / UC-029 `:183` / UC-015 `:140` / UC-001 `:48`）→ 涉事机制源 `apps/api/src/modules/quiz/quiz.service.ts` / `diagnosis/diagnosis.service.ts` / `resume/resume.service.ts` / `packages/domain/src/resume-extract.ts` / `apps/api/src/platform/rate-limit.service.ts` → 同族命名先例 `apps/api/test/uc-e2e-001-nhp-{neg,bound,adv,fault}.proof.ts`（注册形）与 `apps/api/test/uc-e2e-025-nhp-bound-isolated.proof.ts`（三层隔离壳先例）→ PERF 收据形先例 `apps/api/test/uc-e2e-018-perf-load.proof.ts` + `scripts/uc018-perf-load-capped-child.mjs`。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证·批 A/B 同源）；②`e2e-requirement-coverage-matrix.md` §0.5 强制列令 + §1.0.3 `:164`「后续 knife 改行时必须同步改本表 + `non-happy-path-perf-load-case-matrix.md`；缺列视为未完成 G2/G6」；③协调方派单（批 C 认领批 A/B 与各 UC 专属线外的残余行·行级互斥）；④结构范本=`harness/nhp-batch-b-REQUEST.md`（§0-§9 形制·在飞 `line/nhp-batch-b-draft` @`c77057d6f`）。

---

## 残余盘点（两卷全卷亲读·排除已认领后的现存未认领 gap/blind 行清单·本席 `:112-:140`+`:142-156`+case-matrix 全行逐行亲读）

**已认领排除面**：批 A=`:114/:118/:128` 三行（executed·收据落分支）；批 B=`:115-117`+§1.0.2 `:147-148`+case-matrix `:46-59/:83`（draft rev 在飞）；UC-011=`:117`+case-matrix `:58`；UC-019=`:124`（NHP-019-ADV-01 已行使 2026-10-26）；UC-004/017/025/028=各行 `:115/:122/:125/:127`（专属线·uc017/uc025/uc028 已并主线·uc004 在飞）；UC-001 四 NHP 列 `:112`（Line Y/AI/AB/AG 四钉已落）；UC-002 `:113`（Line R ADV 钉）；UC-014/026 `:119`（Line K 七类钉）；UC-018 `:123`（多面钉）；UC-016/029 FAULT 面（Line Y2 钉已落·列保持 gap）。

| 残余行（未认领） | §1.0.1/§1.0.2 行号 | 缺列/case 面 | 产品面侦察结论 |
|---|---|---|---|
| **UC-E2E-016/029** | `:121` | NEG=**gap** · ADV=**blind**（FAULT 钉已落列不动 · BOUND partial） | **有缝**：quiz/diagnosis begin/abandon 业务负路径族（400/404/409/402/幂等/CAS）全在树 → **本批 case 1** |
| **UC-E2E-015** | `:120` | ADV=**blind**（NEG/FAULT/BOUND partial） | **有缝**：resume 上传对抗缝（magic_mismatch fail-closed #109 / 限流 429 / 全局解析槽 503 / NUL 剥除）→ **本批 case 2** |
| **UC-E2E-001（分面）** | §1.0.2 `:146` + case-matrix `:40` | PERF_api=blind/`case-only`（NHP-001-PERF-api-01 已注册**零收据**·PERF_web `:41`/LOAD_w `:42` 留后刀） | **有缝**：uc018 PERF 收据形先例在树 + 主链 keyless HTTP 嘴在树 → **本批 case 3** |
| case-matrix `:86/:87` | NHP-015-FAULT-01 / NHP-015-LOAD-w-01 | 已注册**零执行收据**（锚 `—`） | 有缝（OCR DI 缝/限流缝）但同 UC-015 行多面 → 本批不取（§1.3 · 防多面同刀 wash）· 留后刀 |
| UC-E2E-027 | `:126` + case-matrix `:112` | gap/blocked | **码面不存在可测注入缝**（产品未接线 · 停止条件登记 §1.3） |
| UC-E2E-031/032 | `:129` + case-matrix `:96` | gap(e2e)/partial(eval) | 在飞认领：`line/uc31-draft` @`112ac8af0`——`:129` 认领亲证·case-matrix `:96` 邻域预占推断·EXEC 日复核 → 跳过 |
| UC-E2E-033 | `:130`+`:151`+case-matrix `:97-100` | §1.0.1 四列 partial 0 缺；分面 gap/blind；NHP-033-FAULT-01=A3 live worker 越权 job RLS | **本地不可测**（需 live worker/checkpointer 面 · W1≠闭环 矩阵自钉）+ 七类补集与既有 X 族旁证重叠 wash 风险 → §1.3 |
| UC-E2E-040–043 | `:131`+`:152`+case-matrix `:111` | gap×4 | **接线未证**（席位 CAS/批 partial_failed=静态 G-GAP · 先接线后 prove）→ blocked §1.3 |
| UC-050–052 / PRIVACY-HTTP | `:132/:134` | — | 隐私域 + Phase 3 DELETE=503 freeze → 出域 |
| NEG-AUTH/NEG-* | `:133` | FAULT=gap+ADV=blind | 家族聚合行非单 UC（one-knife-one-row 形不合 · 批 A §1.3 先例） |
| GAP-RAG-01…05 | `:135`+case-matrix `:119-127` | NHP-R4-PERF-01/R5-PERF-01/RAG-LOAD-01 blind | Phase 4 / mw-rag-route 域 → 他域 |
| UI-PAY / CLOUD-KILL / HA-RTO / TC-CLOUD | `:136-:139`+case-matrix §1.7 | out-of-scope/blocked | 云授权 blocked · Ban buy cloud → 出域 |
| PLATFORM-STATIC / MW-STACK-* | `:140` | n/a×4 | 非 UC 盲区行 |
| `verify:e2e-performance` 族 | `:153` | not_run | 历史门族（归 `testing/e2e-performance-evidence.md` 台账 · 非单行 case）· 本批 case 3 为 per-UC 实例 · Ban 借实例宣族复绿 |
| RAG-qbank 分面 / 云 THR / HA stub | `:154-:156` | blind/blocked/conn-only | Phase 4 / blocked / stub |

**结论**：残余非空·可测三行=`:121`（2 缺）≥`:120`（1 缺）≥`:146`（分面 case-only 零收据）——恰为本批三 case。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`7e47688db`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **29 树**实测——`line/nhp-c-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep nhp-batch-c` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞五线逐树亲读**（`git log -1` + `git diff --name-only origin/main...<branch>`）：
  - `line/nhp-batch-a-draft` @`7983a988e`（executed 待 post-prove dual）——触面=REQUEST+三 proof+收据+**注册名 `uc012:nhp-fault`/`uc003:nhp-adv`/`uc030:nhp-fault`（tip `package.json` 零命中亲证=未并线）**；与本批三名（`uc016:nhp-neg`/`uc015:nhp-adv`/`uc001:nhp-perf-api`）前缀零碰撞亲证。
  - `line/nhp-batch-b-draft` @`c77057d6f`（draft rev）——触面=矩阵 `:115-117`/`:147-148`+case-matrix `:46-59/:83`；与本批触面（矩阵 `:120/:121/:146`+case-matrix `:40-42/:86-87` 邻区+`NHP-016-NEG-01`/`NHP-015-ADV-01` 新行）**行级互斥零重叠**。
  - `line/uc004-draft` @`336b5ee8b` · `line/uc011-draft` @`337efa8d0` · `line/uc31-draft` @`112ac8af0`——各认领 `:115`/`:117`/`:129` 面；与本批零重叠。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=三隔离 prove 新文件+注册行（root/apps/api package.json）+runner 注册位（`scripts/run-e2e-isolated.mjs`）+`ai-docs/architecture/ai/provider-egress-inventory.json` additive 环境引用登记（三新 proof×实际出现词名·class=test-isolation·沿 uc028 `10b920521`/uc004 `834c91cb3` 先例形·漏登即 CI `environment_reference_unregistered` 红）+双表行内改（矩阵 `:120/:121/:146` 邻区+case-matrix `:40/:86-88` 邻区+§1.3 两新行）。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `7e47688db` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `5ac58aa2`（519） | **§1.0.1 `:120`（UC-E2E-015 · ADV blind）·`:121`（UC-E2E-016/029 · NEG gap+ADV blind）**·§1.0.2 **`:146`（UC-001 三分面 blind/case-only 零收据）**·`:150`（UC-015 分面 · 本批不触留痕）·§0.5 `:47-84`（covered 禁填 `:80`）·§1.0.3 `:164` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `b8a6ee02`（195） | **`:40` NHP-001-PERF-api-01（case-only · 零收据）·`:41/:42` PERF-web/LOAD-w（留后刀）·`:86` NHP-015-FAULT-01（blind→case-only · 既有锚 `—`）·`:87` NHP-015-LOAD-w-01（同）**·§1.3 表 `:94-113` 亲证无 `NHP-016-NEG-01`/`NHP-015-ADV-01` 行（本批 EXEC 补二新行） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3` | UC-016 `:163`（TC-E2E-016-no-credit integration 额度不变 · 契约 POST /quiz、GET /diagnose/:id）· UC-029 `:183` · UC-015 `:140` · UC-001 `:48` |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `a7d8959a` | Phase 2 item 12（`:28`） |
| `scripts/ai-docs/public-text-policy.mjs` | `202f3425` | `:145` `MAX_FILES = 2_370`（cap 亲证 · §2-1 预算核） |

### 0.2 码面锚（产品缝 · 按 case 分列 · symbol 级位移按 symbol 重钉）

**Case 1 · `NHP-016-NEG-01`（UC-016/029 · `:121` · NEG 主面）**

| 锚 | blob（行数） | 钉位 |
|----|------------|------|
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2`（140） | `:30` 400 `missing_resume_id` · `:38` `pg_advisory_xact_lock` 串行化 · `:39` 404 `not_found_or_forbidden` fail-closed · `:41-42` `alreadyBegun` 幂等（零双扣零双入队）· `:45-49` 409 `resume_not_found_or_not_ready` · `:51-57` 409 `quiz_resume_reference_conflict`（CAS bind `status='created'`+NULL 守卫）· `:59-65` 402 `insufficient_entitlement` 映射（reserve 抛→catch 映射）· `:74-83` abandon CAS（`:79` `status IN ('created','generating')` · `:80` 409 `cannot_abandon` · `:81` releaseConsumption 退还）· `:125` 404 RLS get 越权不泄露 |
| `apps/api/src/modules/quiz/quiz.controller.ts` | `9b78100d`（72） | `:57` SSE 槽 429 `too_many_streams`（per-principal 上限 5）· `:60` events 404 |
| `apps/api/src/modules/diagnosis/diagnosis.service.ts` | `2c7c882e`（113） | `:27` 400 · `:35-36` 锁+404 · `:38-39` alreadyBegun · `:43-47` 409 · `:49-56` 409 `diagnosis_resume_reference_conflict` · `:58-64` 402 · `:72-82` abandon CAS · `:98` 404 |
| `apps/api/src/modules/diagnosis/diagnosis.controller.ts` | `f2d7ea90`（70） | `:55` 429 槽 · `:58` 404 |
| 旁证（零改动 · 互不替代） | `c81ea951` | `neg-input.proof.ts` `:94/:106/:284-285` quiz/diagnosis 传输层 413/畸形 JSON 臂（**业务规则 NEG 面零臂**=本刀新证据层） |

**Case 2 · `NHP-015-ADV-01`（UC-015 · `:120` · ADV 主面）**

| 锚 | blob（行数） | 钉位 |
|----|------------|------|
| `apps/api/src/modules/resume/resume.service.ts` | `952482e5`（327） | `:38-41` `uploadGate` 429 `too_many_requests`（capacity 15 · refill 0.1/s）· `:47-48` 400 empty/413 · `:50-52` 503 `server_busy`（`PARSE_MAX` 全局解析槽 · 产品缺省 6）· `:59-61` 415 `unsupported_file_format` · `:66-69` **422 `magic_mismatch`（#109 fail-closed）**· `:80/:81` 400 `extracted_too_short`/413 `extracted_too_long` · `:210-211` NUL `\u0000` 剥除（负测先例：直喂 pgp 500） |
| `packages/domain/src/resume-extract.ts` | `a03ccb85` | `:76-99` `assertMagicMatchesDeclaration`（pdf `:82` `%PDF-` / docx `:85` zip 头 / image `:88` / text 分支拒 zip 三签 `:91`+`%PDF-` `:92`+OLE2 `:93`+图片 `:94`——防伪称纯文本偷渡压缩体）· `:170` unsupported 源 · `:189` `image_needs_ocr` 路由缝 |
| `apps/api/src/platform/rate-limit.service.ts` | `fce544ff` | `:101` `allow(key,capacity,refillPerSec,now)` · `:158` `acquireSlot` · `:184` `releaseSlot` |
| 旁证（零改动 · 非本刀臂） | `0d0fc91e` | `uc-e2e-015-resume-ingest-failures.proof.ts` F1–F5 `:57-117`（加密/0字节/413/畸形/415）——**全 5 臂零 magic_mismatch 零 NUL 零 429 臂 = ADV blind 实证**（本刀臂与其 reason 级可分：`magic_mismatch`/`too_many_requests` ≠ `encrypted`/`parse_failed`/`unsupported_file_format`） |

**Case 3 · `NHP-001-PERF-api-01` 执行（UC-001 · §1.0.2 `:146` · PERF_api 分面）**

| 锚 | blob（行数） | 钉位 |
|----|------------|------|
| `apps/api/test/uc-e2e-018-perf-load.proof.ts` + `scripts/uc018-perf-load-capped-child.mjs` | `34ac7f90`+`c63259c0` | PERF 收据形先例（Docker NanoCpus/Memory caps · p50/p95/p99/error_rate · implementer pre-commit runs **not evidence of record**）——本 case 沿形不触其文件 |
| `apps/api/test/uc-e2e-025-nhp-bound-isolated.proof.ts` | `07077d30` | 三层隔离壳先例（isolated 真 PG+真 HTTP） |
| `apps/api/test/uc-e2e-025-nhp-adv.proof.ts` | `cf1e570b` | `:323` `INSERT INTO entitlement_bucket` 桶种子**夹具豁免具名先例**（case 3 N>配额需种子 · 豁免逐项申明入收据） |
| 主链 keyless HTTP 嘴 | — | `POST /resume`（文本摄取 · resume.controller `404c4072:19-21`）· `POST /quiz`+`POST /quiz/:id/begin`（202）· `GET /quiz/:id` · `POST /diagnosis`+`POST /diagnosis/:id/begin`（202）——全嘴零模型零外呼（begin 仅入队不 drain · job 滞队零 worker）· EXEC 期按届时路由亲证重钉 |

### 0.3 认领三行登记（行号+用例名+缺列·亲读逐字）

| 行号 | 用例名 | 现列值（亲读） | 本刀补 |
|---|---|---|---|
| **`:121`** | **UC-E2E-016 / 029**（诊断/押题失败与 0 题边界） | NEG=**gap** · FAULT=**gap**（NHP-016-FAULT-01 钉已落·Line Y2·列措辞不动）· BOUND=**partial**（0 题）· ADV=**blind** | **NEG**（具名 case 1·gap→case-only 措辞·EXIT0=case≠covered）；ADV 留后刀（§1.3：与 uc010/uc002 ADV 旁证族重叠 wash 风险） |
| **`:120`** | **UC-E2E-015**（简历摄取失败族） | NEG/FAULT/BOUND=**partial** · ADV=**blind** | **ADV**（具名 case 2·blind→case-only 措辞）；分面 `:150` 与 case-matrix `:86/:87` 执行收据不动（§1.3） |
| **§1.0.2 `:146`** | **UC-E2E-001**（黄金路径 · 分面行） | PERF_api/PERF_web/LOAD_worker=**blind/`case-only`**×3（case-matrix `:40-42` 已注册零收据） | **PERF_api**（具名 case 3=`NHP-001-PERF-api-01` 执行收据·`:40` 措辞 case-only 保留+收据入账）；PERF_web/LOAD_w 留后刀 |

---

## §1 修法（三行各补缺列隔离收据 · 一行一 case · 零产品码触 · 零 invent covered · 零 live key）

**修法形状**（沿批 A/uc001·uc025 `nhp-*-prove` 族先例）：每行一个具名 NHP case = 新 proof 文件 + apps/api package.json 注册行 + root package.json 双行（`:prove`/`:prove:raw`）+ runner 注册位（`scripts/run-e2e-isolated.mjs`：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单——**四位全登记**，批 A §9-EXEC 第四位教训承登）+ egress 环境引用登记（`ai-docs/architecture/ai/provider-egress-inventory.json` additive·三新 proof×实际出现词名·class=test-isolation·沿 uc028 `10b920521`/uc004 `834c91cb3` 先例形·漏登即 CI `environment_reference_unregistered` 红）· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**；isolated 真 PG · 零 live 模型 · 零 MODEL_API_KEY · 零外呼（`env -u` 三键具名：`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL`）；收据 `.tmp/<case>-receipts/` + tracked `ai-docs/delivery/receipts/<case>/`（implementer pre-commit runs · **not evidence of record**）。行状态/列状态一字不动：EXIT0=case≠covered，升格仅经 coordinator nail 的 additive honesty；coveredCount=8 不变。

### Case 1 · `NHP-016-NEG-01`（UC-016/029 · `apps/api/test/uc-e2e-016-nhp-neg.proof.ts`）

- **需求源**：`e2e-scenarios.md:163`（UC-016 验收「额度不变」TC-E2E-016-no-credit integration · 契约 `POST /quiz`、`GET /diagnose/:id`）+ `:183`（UC-029 退化边界·本 case 不触其图面·仅 HTTP NEG 族）。
- **证据层**：isolated 真 PG + Nest createApp+listen(0)+fetch 真产品 HTTP（沿 uc025 三层壳 `07077d30` 先例）。
- **前置申明（种子/良构）**：consent 种子（consent_record·`uc-e2e-001-nhp-adv.proof.ts:264` 先例形·§5 豁免具名）+ owned∧ingested resume 前置到位（经产品路径 `POST /resume` 文本摄取·非裸 INSERT·零新增豁免）为 PC/N3/N4/N5 对照基面（bind 先于 reserve·N5 需自有 owned∧ingested resume）· N3 明钉以「他人 resume」变体行使（未摄取变体不在枚举）；臂引用 uuid 列面（`resume.id` uuid·`0061` 迁移起 `resume_quiz`/`resume_diagnosis.resume_id` 亦 uuid）必须良构 UUID 字面量——非 UUID 即 pg `22P02`（invalid_text_representation）→ 500 非产品 NEG 语义·臂自失效。
- **臂**：PC = 双口（quiz/diagnosis）happy create+begin 202（对照）；N1 = 缺 resume-id → 400 `missing_resume_id`（双口 `:30`/`:27`）；N2 = 不存在 id begin → 404 `not_found_or_forbidden`（advisory 锁后 fail-closed `:39`/`:36`）；N3 = 未摄取/他人 resume 绑定 → 409 `resume_not_found_or_not_ready`（`:49`/`:47`）；N4 = 同壳二次绑定 → 409 `*_resume_reference_conflict`（`:57`/`:56`·预绑壳行种子形状具名：`'created'` 壳 + `resume_id`/`privacy_epoch` 预绑非 NULL 正中 CAS `resume_id IS NULL AND privacy_epoch IS NULL` 守卫 0 行 + 零 job 行（幂等 `:41-42` 不短路）+ bind 目标 resume owned∧ingested（否则 `:49`/`:47` 前段 409 先发遮蔽冲突面）· 沿 `cf1e570b` seedQuiz 先例形）；N5 = 零桶用户 begin → 402 `insufficient_entitlement` + **额度净 0**（TC-E2E-016-no-credit 真行使 · `:59-65`/`:58-64`）；N6 = 重复 begin → 202 `alreadyBegun` 同 jobId + 恰 1 job 行 + 额度单扣（幂等 `:41-42`/`:38-39`）；N7 = ready 终态后 abandon → 409 `cannot_abandon`（CAS 不倒退已完成 `:79-80`/`:77-78`）+ begin→abandon（有预留）→ `released:"released"` 退还预留·净账 0（`:81` releaseConsumption 真退）+ 零预留子臂（`'created'` 壳未经 begin 直 abandon）→ `released:"error"`（releaseConsumption 无 consumption 行如实返回 error·净账 0·期望按真实返回钉死·Ban 断言迁就）；N8 = 跨用户 get/events → 404 不泄露（RLS 0 行 `:125`/`:98` + SSE `:60`）；N1–N8 全程额度净账审计（失败臂零扣零退错）。
- **非替代申明**：`neg-input`（传输层 413/畸形 JSON）· `full.e2e` quiz-402 面（Key blocked 层）· `uc001:nhp-neg`（interview 口 402 映射族）= 旁证互不替代 · Ban 互借关列。

### Case 2 · `NHP-015-ADV-01`（UC-015 · `apps/api/test/uc-e2e-015-nhp-adv.proof.ts`）

- **需求源**：`e2e-scenarios.md:140`（UC-015 失败族 · 本 case = 对抗注入/伪造声明面非 F1–F5 重铺）。
- **证据层**：isolated 真 PG + 真 HTTP（同三层壳）。
- **臂**：PC = 合法纯文本上传 200 `ingested`（对照 · 零扣费面）；A1 = 声明 `application/pdf` + zip/docx 字节体 → 422 `magic_mismatch`（fail-closed 先于解析 `resume.service:66-69` ← `resume-extract:82/:85`）；A2 = text 路径偷渡压缩体（zip 三签字节 + `.txt` 声明）→ 422 `magic_mismatch`（`:91` 防伪称纯文本偷渡）；A3 = text 路径偷渡 `%PDF-`/OLE2 头 → 422（`:92/:93`）；A4 = 含 `\u0000` 的 ≥20 字文本 → 200 且落库 blob 解密面零 NUL（`:210-211` 剥除 · 注入字节不 500）；A5 = 专用独立 principal 同 principal 连发 >15 次（突发桶耗尽）→ 第 16 次 429 `too_many_requests`（`:38-41` 反滥用缝真行使 · 拒面零消费零半写）；V1 = 专用独立 principal + `RESUME_PARSE_MAX=1` 进程窗 + 真 PDF 首请求或 N 并发上传 → 败者 ≥1 收 503 `server_busy`、首请求不受损（`:50-52` 全局解析槽 · **窗值披露 D2**：产品缺省 6 不改 · 仅测试进程 env）· **臂预算申明：A5/V1 及 PC/A1–A4 各用独立 principal·per-principal 突发桶预算互不挤占（防 A5 突发耗尽误伤他臂 429 串扰）**；N = 对抗拒面全程零 entitlement 消费净账（415/422/429/503 全零扣）。
- **非替代申明**：F1–F5（`0d0fc91e:57-117`）= 既有旁证零改动；本刀臂 reason 级可分（`magic_mismatch`/`too_many_requests`/`server_busy` 均非 F 族码）· Ban 借本刀收据宣 F 族加强。

### Case 3 · `NHP-001-PERF-api-01` 执行（UC-001 · `apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts`）

- **需求源**：case-matrix `:40`（已注册 case-only·零收据——本 case=执行收据补账 · 措辞 case-only 保留）+ 矩阵 `:146`（PERF_api 格）。
- **证据层**：isolated 真 PG + capped 子进程（沿 `uc018-perf-load-capped-child.mjs` `c63259c0` 形 · Docker NanoCpus=2e9 / Memory=4GiB caps 具名入收据）· wrapper 落位钉：子进程 wrapper 若落 tracked `scripts/` 须先回炉补登记·否则运行时 `.tmp` 生成（沿 uc018 收据 `.tmp` 先例）。
- **负载形状（登记）**：consent 前置=产品路径 `POST /privacy/consent`（privacy.controller:15-18·purpose='resume_processing'·**逐虚拟用户**·FORCE RLS per-principal `0001_baseline.sql:459-463`·测量窗外执行不计入分位）非裸 INSERT 非豁免面 · 主链 keyless HTTP 嘴序列（`POST /resume` 文本唯一后缀防 dedup 混叠 → `POST /quiz`+`begin` → `GET /quiz/:id` → `POST /diagnosis`+`begin`）· N=100 · concurrency=10 · 虚拟用户桶种子=夹具豁免具名（`cf1e570b:323` 先例形 · 逐项申明入收据 · Ban 裸 INSERT 绕产品路径·豁免以 §5 枚举完备形逐项具名·本 case 内=桶种子）；期望（结构面 · 沿 NHP-018-PERF-01 同口径）：p50≤250ms · p95≤750ms · p99≤1500ms · error_rate≤0.5% + 收据四件套（CMD+EXIT+负载参数冻结+`.tmp`/tracked 路径）。
- **读法钉**：隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA（D3）· 零模型零 drain（job 滞队）· `actualSpendCny=null` · **Ban 借本收据宣 `verify:e2e-performance` 族（`:153` not_run）复绿或 NHP-PERF-API-SUITE（case-matrix `:133`）闭合**——per-UC 实例喂伞不替代伞。

---

## §1.3 否决表（落选行诚实留痕 · 含停止条件登记 · 与盘点表互补）

| 落选项 | 否决/登记理由 |
|---|---|
| case-matrix `:86` NHP-015-FAULT-01 / `:87` NHP-015-LOAD-w-01 执行 | 已注册零收据·有缝（OCR DI `OCR_VISION_CLIENT` 缝/限流缝）但与 case 2 同 UC-015 行——**一行一 case 防多面同刀 wash** · 留后刀独立裁量。 |
| `:120` UC-015 PERF_web/LOAD_worker（`:150`+`:41/:42`） | web 面单机 Chromium ≠ 真机容量（批 A 同 veto）· LOAD 与 case 3 同族重载 → 留后刀。 |
| `:121` UC-016/029 ADV 列 | 与 uc010 LED-ADV（批 B 行 5）/uc002 跨 user session ADV（Line R）旁证族重叠度高 · quiz/diagnosis SSE 对抗臂 wash 风险 → 留后刀（NEG 本刀取·ADV 留痕）。 |
| **`:126` UC-027 + case-matrix `:112` NHP-027-NEG-01** | **停止条件登记：码面不存在可测注入缝**——产品无 ManualReview HTTP/表/模块（`apps/api/src/modules/` 全列亲证无此域·矩阵自钉「产品未接线/blocked」）→ 不可测·不硬造断言·先接线后 prove。 |
| `:129` UC-031/032 + case-matrix `:96` | 在飞认领 `line/uc31-draft` @`112ac8af0`——`:129` 认领亲证（uc31-REQUEST.md）· case-matrix `:96` 邻域预占推断·EXEC 日复核 · 且 fake-model 禁令/G7-Key 邻域（批 A 先例）→ 他线。 |
| `:130` UC-033 + `:151` + case-matrix `:97-100` | §1.0.1 四列 partial 0 缺；NHP-033-FAULT-01（A3 live worker 越权 job RLS）**本地不可测**（需 live worker/checkpointer · W1≠闭环 矩阵自钉）；分面 X10≠SLO 留后刀。 |
| `:131`/`:152`/case-matrix `:111` UC-040–043 | 席位 CAS/批 partial_failed 接线未证（静态 G-GAP）→ **先接线后 prove** · blocked（批 A 先例）。 |
| `:132`/`:134` UC-050–052/PRIVACY-HTTP | 隐私域（须换 privacy-int）+ Phase 3 DELETE=503 freeze → 出域。 |
| `:133` NEG-AUTH/NEG-* | 家族聚合行非单 UC · one-knife-one-row 无单一 case 收口形（批 A §1.3 先例）。 |
| `:135`+case-matrix §1.5 | Phase 4 / mw-rag-route 域（R4-PERF/R5-PERF/RAG-LOAD blind 留 RAG 线）。 |
| `:136-:139`+case-matrix §1.7 | out-of-scope / 云授权 blocked / Ban buy cloud。 |
| `:140` PLATFORM-STATIC / MW-STACK-* | n/a×4 非 UC 盲区行。 |
| `:153` `verify:e2e-performance` 族 | 历史门族归 `testing/e2e-performance-evidence.md` 台账 · 非单行 case；case 3=per-UC 实例 · Ban 借实例宣族闭合。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2362**（stdout「public text policy scanned 2362 managed worktree files」亲读）· cap=**2370**（`public-text-policy.mjs:145` `MAX_FILES=2_370` 亲证）· 本卷新文件 +1 → 预期 **2363 ≤ 2370 = 不越限 · 无需步进 · 无越限臂联动**（`public-text-policy.proof.mjs:349-354` 越限臂系 fixture 内注入路径计数 `PTP_FILE_LIMIT:2371`·不随树漂·零改）。协调方「越限沿先例步进（+8·二十先例形）+越限臂联动+承登」预授权条款**本次不触发**·如实承登：若 EXEC 期在飞并线使届时 scanned+1 > 2370 → 触「验收红不可修」停手上报（Ban 就地改 cap）。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词 grep 零命中（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自指·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 .md；EXEC 期 diff 面=本卷+双表行内改（矩阵 `:120/:121/:146` 邻区+case-matrix `:40/:86-88` 邻区+§1.3 两新行）+三 proof 新文件+注册行（root/apps/api package.json）+runner 注册位+egress-inventory additive 登记（三新 proof×实际出现词名·class=test-isolation）+收据 tracked 面 `ai-docs/delivery/receipts/<case>/`（沿批 A 触面形）——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin）**：三 case 隔离 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 邻面不回退（`neg:input`/`uc015:ingest-failures`/`neg:all` 按届时 SSOT 口径恒等）· case 3 收据含 Docker caps+分位数+error_rate 四件套（缺任一=门红）· 双表同步 diff 逐件登记（§1.0.3 `:164` 令）· 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · 矩阵 `:120/:121/:146` 与 case-matrix 对应行措辞仅允许 blind/gap→`case-only`（或 partial 保留）诚实登记 · coveredCount=8 零翻转 · Ban 借三收据互 wash（三 case 互不替代互不借用）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行+runner 注册位·沿 uc001/uc025 nhp 族 prove-only 先例）。
2. **批 A/B/UC 专属线触面零触**：矩阵 `:114/:118/:128`（批 A）· `:115-117`/`:147-148`+case-matrix `:46-59/:83`（批 B）· `:122/:124/:125/:127`（uc017/uc019/uc025/uc028）· uc004/uc011/uc31 在飞面——只读；`ai-docs/architecture/ai/provider-egress-inventory.json` 系共享 additive 环境引用登记面（本批 EXEC 按先例形 additive 登记·非他线专属）不在零触之列。
3. **其余 §1.0 行零触**：盘点表落选行全部只读（§1.3）。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支** · **零迁移零配置**（Ban 新迁移 Ban 触告警/CI 配置 · `RESUME_PARSE_MAX` 类 env 仅限 case 2 V1 测试进程窗·零配置文件改）。

## §4 依赖

**①上游已满足**：三行产品缝全在树（§0.2 blob 亲算）+ 三层隔离壳先例（`07077d30`）+ PERF 收据形先例（`34ac7f90`+`c63259c0`）+ 桶种子豁免先例（`cf1e570b:323`）。**②同文件并发**：起草 turn 恰 1 新 .md 零交涉面；EXEC 期触矩阵 `:120/:121/:146` 与 case-matrix `:40/:86-88` 邻区——§0.0 在飞交叠复核必做（批 B 邻区 `:46-59` 零重叠亲证）。**③下游**：三行收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含升格 partial/借旁证 wash/实例宣伞）；Ban live key（零 Key 面硬跑）；Ban 触批 A/B/UC 专属线触面与其余 §1.0 行；Ban 触产品码面/迁移/CI 告警配置/cap 值（越限停手上报）；Ban 改共享 SSOT；Ban 触既有 proof 文件（零触只读引用·含 F1–F5 与 uc018-perf-load）；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子/终态推进逐项具名入收据·枚举完备：case 1 桶种子（begin 类臂·含 N7 begin→abandon 有预留子臂·entitlement_bucket·`cf1e570b:323` 先例形）+ case 1/2 consent 种子（consent_record·`uc-e2e-001-nhp-adv.proof.ts:264` 先例形）+ case 3 桶种子 + 壳行种子含状态钉（created/ready/failed·沿 `cf1e570b` seedQuiz 先例）——枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（EXEC 期三 case 全离线隔离 PG·case 3 零 drain 零模型·§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）五类标记词 + conflict-marker grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径·不复抄卷内防自匹配——沿批 B §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `closed`（2026-10-26 §9-post post 双审双 PASS 会签翻终态·原值 `executed:awaiting_post_prove_dual` 史录留痕不洗）· alone≠dual · 开工三条款已兑现（①pre-exec 双审 BOTH PASS 落卷 ②协调方明示 EXEC 授权+序 A sanction 落码 ③§1 修法面/§5 Ban/pins/§1.3 否决面零改动·§0 已对开工 tip 全量重 pin）· post-prove 双审两独立外席已行使双 PASS 落卷（§9-post·EXIT0 ≠ 证据终态 · coveredCount=8 零动）。** 停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（三行列值被他刀改写 · magic_mismatch/NUL/限流缝消失 · uc31 线并线改写 `:129` 归属 · 批 A/B 卷并线与本批对同表冲突改行）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §1 推定形不符（如 `magic_mismatch` 被静默接受非 422 · begin 越权泄露他户行 · abandon CAS 倒退终态）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 3 case 面（需触产品码/批 A/B 行/covered 翻面/共享 SSOT/迁移/cap 值）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2370 / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9-EXEC（EXEC 落卷 · pre-exec dual BOTH PASS + 协调方序 A sanction 放行 · 2026-10-26 · 三行行使全绿 · 零产品码）

**授权面**：pre-exec 双审 BOTH PASS + 协调方 2026-10-26 序 A sanction（「批 B（#146）并线后 cap 2386→2394 +8 sanction 准·本批 6 受管文件 union 2388≤2394」·前席红停于 cap 预算的续行授权）。

**并线与重 pin（§0 协议兑现）**：轮询 origin/main 至 #146 并线亲证（`public-text-policy.mjs` `MAX_FILES=2_386` 亲读）→ merge `origin/main` `b894cad88` → **`29fd12114`**（merge-tree 预演零冲突·REQUEST 卷零交涉·零产品码面）。§0 重 pin（blob 亲算）：矩阵 `6fc92dd0`（520 行·`:120/:121/:146` 行号不变）· case-matrix `cbf9d97f`（199 行·批 B 并行增行致 §1.3 区 `:86/:87`→`:88/:89`·`:40` 不变·结论不变只更行号）· policy `e33818a6`（447 行·cap 行 `:147`→`:149`·前席微校正 `:264→:263` 相符承前席回报）· 三 case 码面锚（quiz/diagnosis/resume/rate-limit/resume-extract symbol 级）逐件亲读仍准。

**cap 步进 sanction 落码（序 A sanction·沿 uc025/NHP-A/NHP-B 先例形）**：
1. `scripts/ai-docs/public-text-policy.mjs`：`MAX_FILES` **`2_386→2_394`**（+8·二十三先例形）+ 注记两行（「2026-10-26 NHP 批 C 收官协调方序 A sanction·+8 …」「origin/main `b894cad88` 届扫 2381 余 5 + 本支净增 6 受管文件（REQUEST+3 proofs+3 receipts）union=2388≤2394·协调方 2026-10-26 序 A sanction·本批 6 受管文件」）。
2. `scripts/ai-docs/public-text-policy.proof.mjs`：**越限臂联动 `2_394/2395`**（CAP-SANCTION-2394 注记块 + fabricated 数 2_394 + atCap.scannedFiles 2_394 + `f-2394.md` + `PTP_FILE_LIMIT:2395`）·本树亲跑 **12/12 EXIT=0**。
3. 承登段（本节即）：sanction 预算算式 union=2388 系协调方届值；EXEC 终验实证 **`check-docs.mjs` scanned 2385 ≤ 2394**（ tracked 收据 3 件系 `.log` 非 TEXT_EXTENSIONS 不计受管扫描——较 sanction 预算 2388 再低 3·零越限·cap 值与 +8 步进按 sanction 原值落码不改）。

**落地面（commit 内 tracked 清单·§2-3 逐件登记）**：
1. **Row 1** `apps/api/test/uc-e2e-016-nhp-neg.proof.ts`（UC-016/029 NEG · 隔离真 PG+真 HTTP 三层壳）：PC 双口 202 对照+N1 400+N2 404+N3 409 他人 resume 变体+N4 409 预绑壳 CAS+N5 402 零桶净 0（TC-E2E-016-no-credit 真行使）+N6 幂等 alreadyBegun 同 jobId 恰 1 job 行+N7 abandon 三子臂（ready 409/released/零预留 `released:"error"` 如实钉）+N8 跨用户 get+events 404 不泄露+全程额度净账审计。consent+resume 走产品路径（consent 种子豁免未行使·如实申明）；夹具豁免具名=①桶种子+④壳行种子（'created' 预绑/'ready' 终态）。**53/53 PASS · EXIT=0**。
2. **Row 2** `apps/api/test/uc-e2e-015-nhp-adv.proof.ts`（UC-015 ADV · 同三层壳）：PC 合法文本 200+A1 声明 pdf+zip 体 422 `magic_mismatch`+A2/A3 text 偷渡（zip ARC 签/%PDF-/OLE2）422+A4 NUL 剥除 200 零透传（pgp 解密面亲证）+A5 突发桶 15 耗尽第 16 次 429+V1 `RESUME_PARSE_MAX=1` 测试进程窗 N=3 并发真 PDF 败者 2×503 胜者 200 不受损+N 全程零扣。夹具面=0189 真迁移链重放（共享槽 lease·harness 未载·真相=迁移链）+0121 重放（pgp ACL·真相=迁移链）。**30/30 PASS · EXIT=0（首跑绿）**。
3. **Row 3** `apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts`（UC-001 PERF_api 执行收据 · uc018 先例形）：N=100 c=10 runs=3 all-pass——p50 89.5–103.2ms / p95 99.9–127.4ms / p99 104.7–130.3ms / max 108.8–135.5ms / error_rate 0（阈值 250/750/1500/0.5% · nearest-rank · warmup 10 excluded）· caps Docker `--cpus=2 --memory=4g` 双容器 HostConfig 亲证（NanoCpus=2e9/Memory=4GiB）· consent 产品路径逐虚拟用户（测量窗外）· 桶种子豁免具名（逐虚拟用户 3.0）· 零模型零 drain（job 滞队恰 330×2·ai_model_invocation=0）· 收据四件套（CMD+EXIT+负载参数冻结+`.tmp/uc001-perf-api-receipts/` 路径）。wrapper 落位钉=runner 内联源运行时落 `.tmp`（零 tracked scripts wrapper）。**10/10 PASS · EXIT=0**。
4. **注册面**：runner **五位全登记**（①SOURCE_PATHS 三条目 ②allowlist 三行 ③isolatedCommand 三臂——case 3 臂=capped child 内联源常量 `UC001_PERF_API_CAPS_CHILD` ④pre-migrate 名单三行——批 A 第四位教训承登 ⑤resource-caps 条件补 `uc001:nhp-perf-api`——EXEC 中发现之第五注册位·见红次归因）+ root `package.json` 六行（三 case `prove`/`prove:raw` 双行）+ `apps/api/package.json` 三行（零碰撞亲证·`node --check`+双 JSON parse EXIT=0）。
5. **egress 预置登记**：`ai-docs/architecture/ai/provider-egress-inventory.json` additive 六目（MODEL_API_KEY/MODEL_BASE_URL × 三新 proof · class=test-isolation · 10b920521 先例形）·三 proof 实际词面=恰此二名（DASHSCOPE 族零提及）· **inventory 亲跑 EXIT=0（environment_references 358→364）**。
6. **双表行内改**：矩阵 `:120`（ADV blind→case-only 收据注）·`:121`（NEG gap→case-only 收据注）·`:146`（PERF_api 执行收据注·措辞 case-only 保留）+ case-matrix `:40`（PERF-api 收据锚）+ §1.3 两新行（`NHP-015-ADV-01`/`NHP-016-NEG-01`）· 行/列状态零翻转（blind/gap→case-only 措辞 · coveredCount=8 不变）。
7. **收据**：tracked `ai-docs/delivery/receipts/nhp-{016-neg,015-adv,001-perf-api}-01/01-gate-*.stdout.log`（三绿次 gate stdout 全文）· `.tmp/` 全次留痕（含红次 `01-`/红次 stdout·attempts 台账见下）· implementer pre-commit runs · **not evidence of record**。

**门矩阵亲跑（EXIT 原值如实录·stdout 留痕 .tmp/ + tracked receipts/）**：`docker info` **EXIT=0**（server 29.5.2·亲证留痕）→ `pnpm uc016:nhp-neg:prove` **EXIT=0**（53/53·attempts **1,0**）→ `pnpm uc015:nhp-adv:prove` **EXIT=0**（30/30·attempts **1,0** 首跑绿）→ `pnpm uc001:nhp-perf-api:prove` **EXIT=0**（10/10·attempts **1,0**）→ 邻面不回退：`uc015:ingest-failures` **EXIT=0**（12 全绿）· `neg:input` **EXIT=0**（135 全绿）→ `public-text-policy.proof.mjs` **EXIT=0**（12/12·越限臂 2_394/2395 联动）→ `check-docs.mjs` **EXIT=0**（scanned 2385≤2394）→ `provider-egress-inventory(.proof).mjs` **EXIT=0**（364 refs）→ `tsc -p apps/api --noEmit` 零红 → markers 五类词面改动集机检 **0 命中**（词面运行时组装口径 `i6-239-gates.proof.mjs:159-163`）→ est live=0（零模型零外呼零 Key·`MODEL_API_KEY`/`MODEL_BASE_URL` 进程内自删+boot 后复证）。

**红次台账（attempts 台账含红次如实 · 全归因 EXEC 夹具/注册面 · 零产品码触 · 零断言迁就 · Ban retry-to-green 边界守住）**：
- uc016 **R1（EXIT=1）**：harness 面缺迁移 `0121_resume_pgcrypto_runtime_acl.sql` 的 `pgp_sym_encrypt` EXECUTE ACL（harness `sql/01` 重建 app_role 抹 GRANT·`_neg-harness` 未载该迁移）→ 产品路径 `POST /resume` 全链 42501→SEED FAIL 连锁。**修复=三 proof 内 boot 后 0121 真迁移链重放（REVOKE+GRANT 幂等·真相=迁移链·零产品码触）**·SOURCE_PATHS 随补 0121 三条目。R1 时零断言面被行使（SEED 段即红）·R2 复跑绿。
- uc001 **R1（EXIT=1）**：①runner resource-caps 条件（第五注册位）仅认 `uc018:perf-load` → 隔离 PG 容器零 caps（NanoCpus=0）→ caps enforced=false 臂红；②`node:20-bookworm` 镜像 pull 失败（净 env 无 `docker-credential-desktop`·credential helper PATH 环境缺口）。**修复=⑤注册位补本批 target + 镜像 shell 侧预拉（`DOCKER_HOST` colima socket+净 DOCKER_CONFIG 匿名拉·DOCKER_HOST/镜像不改产品任何文件）**·R2 复跑绿。
- 全批红次合计 **2**（uc016 1 + uc001 1）·两次 stdout 均留痕 `.tmp/`（批 A P2-a 处方兑现）。

**Non-claims**：EXIT0 ≠ covered ≠ suite green ≠ 行/列升格（升格仅经 coordinator nail additive honesty）· `:120/:121/:146` 与 case-matrix 对应行措辞仅 blind/gap→case-only · coveredCount=8 零翻转 · 三 case 互不替代互不借用（NEG≠ADV≠PERF_api）· 双 fresh=post dual 待派（本节收据系 implementer pre-commit runs · not evidence of record）· D2 窗值披露：`RESUME_PARSE_MAX=1` 仅测试进程窗（产品缺省 6 不改·零配置文件改）· 隔离库负载 ≠ 生产容量 ≠ 线上 SLO ≠ HA（D3）· Ban 借 case 3 收据宣 `verify:e2e-performance` 族复绿或 NHP-PERF-API-SUITE 闭合（实例≠伞）· pins 十一值零翻（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）· est live=0 · markers=0 · alone ≠ dual · **⛔push ⛔force-push**。



## §9-post（post 双审双 PASS 会签席落卷 · 2026-10-26 · **STOP 三处钉翻终态 `closed`** · 沿 nhp-batch-b-REQUEST §9-post 先例形在树亲证）

**post 输入**：§9-EXEC 三 case 门矩阵全绿在卷（三处钉 `executed:awaiting_post_prove_dual`·待 post-prove 双审）→ post 双审席1+席2 分头行使（alone≠dual·协调方派单令所列两席范围）→ 双 PASS 会签 → 三处钉（Status 头+§8+卷尾）翻终态 `closed`；历史节内 token（§9-EXEC 红次台账/各节原值）保留留痕不洗。卷 closed ≠ covered ≠ 矩阵列升格：coveredCount=8 零动 · releaseEvidence=false · Not HA · 翻面权归协调方 nail。stdout 留痕目录 `.tmp/nhp-016-neg-receipts/`+`.tmp/nhp-015-adv-receipts/`+`.tmp/uc001-perf-api-receipts/`（EXEC 红绿次全痕）+`.tmp/isolated-proof-receipts/`（本节席2 三 fresh 收据·gitignored 本地证据）。

- **席1 PASS（两红次 stdout 亲读定性+断言名零改写核+三 case 断言实质核+consent 窗外零污染核·本席届树亲证）**：
  1. **两红次 stdout 亲读定性（红账 `.tmp/…/01-gate-*.stdout.log` 亲读·对现行码态核验）**：uc016 R1 EXIT=1——红因=harness 面 `0121_resume_pgcrypto_runtime_acl.sql` 的 `pgp_sym_encrypt` EXECUTE ACL 湮灭（红账 `42501 permission denied for function pgp_sym_encrypt` 亲读·`POST /resume` 产品路径 42501→`SEED_FAIL uploadResume … status=500` 连锁→`ATTEMPT_END EXIT=1 (crash)`）；**修复=三 proof boot 后 0121 真迁移链重放（REVOKE+GRANT 幂等·真相=迁移链）**+SOURCE_PATHS 随补——红判决=SEED_FAIL 门红设计内·非产品机制红；uc001 R1 EXIT=1——红因=runner resource-caps 条件（**第五注册位**）仅认 `uc018:perf-load`（红账 `UC001_CAPS pg container=… NanoCpus=0 Memory=0 ok=false` 亲读=隔离 PG 容器零 caps→caps enforced 臂红）+`node:20-bookworm` 镜像 pull 失败（credential helper PATH 环境缺口）；**修复=⑤注册位补本批 target+镜像 shell 侧预拉（DOCKER_HOST colima socket+净 DOCKER_CONFIG 匿名拉·零产品文件触）**。两红次均归因 EXEC 夹具/注册面·零产品码触·零断言迁就。
  2. **断言名零改写**：R1/R2 两 stdout `PASS|FAIL` 行名面亲读对照——现于两轮的断言名恒等（差异仅每轮随机 principal 后缀）·R2 新现行=R1 crash 前未达段（N4–N8）·R1→R2 码 diff 面仅夹具/注册位（0121 重放块+resource-caps 注册）·53+30+10 具名断言零改名零删并·Ban retry-to-green（红即停·改夹具不改断言）未犯。
  3. **三 case 断言实质全过（绿 stdout 对 §1 修法面逐条核）**：uc016 53/53（PC 双口 202+N1 400 `missing_resume_id`+N2 404 `not_found_or_forbidden`+N3 409 他人 resume+N4 409 CAS 预绑壳+N5 402 净 0（TC-E2E-016-no-credit 真行使）+N6 幂等 alreadyBegun 同 jobId 恰 1 job 行+N7 三子臂（ready 409 `cannot_abandon`/begin→abandon `released:"released"` 真退还/零预留 `released:"error"` 如实钉）+N8 跨用户 get+events 404 不泄露+全程净账审计）·uc015 30/30 首跑绿（PC 200 `ingested`+A1/A2/A3 422 `magic_mismatch` 三签名族+A4 NUL 剥除落库零透传+A5 第 16 次 429+V1 败者 2×503 胜者 200 不受损+拒面全程零扣）·uc001 10/10（N=100 c=10 runs=3·p50 89.5–103.2/p95 99.9–127.4/p99 104.7–130.3ms/error_rate 0·阈值 250/750/1500/0.5%）——断言形与 §1 红事实+§9-EXEC 承登逐条对上·三 proof 头 HONESTY 钉「EXIT0=case≠covered·coveredCount=8 不动」全在。
  4. **consent 330 次窗外零污染**：case 3 consent=产品路径 `POST /privacy/consent` 逐虚拟用户（`N+WARMUP=110`/轮×3 轮=**330 次**·proof `:143-148`/`:200` 亲读）全部在测量窗外 prep 段行使·不计入分位·零测量面污染（绿 stdout 分位值与 consent req-log 时间面分离亲读·consent 失败即 throw 不进负载）。
  5. **P3×2 登记**：（P3-1）§9-EXEC 红次台账「R1 时零断言面被行使（SEED 段即红）」**措辞精度注**——红账亲读：R1 并非零断言行使·零依赖面（ISO 2+consent 3+桶种子+N1 400 族 3+N2 404 族 3 等）已真实行使且 PASS·FAIL 7 行=SEED 湮灭级联（[SEED]resumes+[PC]×3+[N3]×2·前置 resume 缺位所致·非产品语义判决）·crash 于 N3 后致 N4–N8 未达——准确读法=「NEG 深层面（CAS/402/幂等/abandon/RLS）未获有效行使·SEED 前置面湮灭」·红判决不变（SEED_FAIL=门红设计内）·史录不洗仅此注记；（P3-2）R1 红账 HTTP 面表象留痕——42501 在 HTTP 层显形 `status=500 body={"error":"internal_error"}`（unhandled db 错误兜底）系夹具 ACL 湮灭环境所致·非产品错误映射语义证据·R2 真迁移重放后不复现·留痕非阻塞。
- **席2 PASS（三门第三 fresh 独立复跑+caps docker inspect 亲证+安全面五项读码·本席独立行使）**：
  1. **三门第三 fresh 独立复跑首跑绿**：`uc016:nhp-neg:prove:raw` **EXIT=0 53/53**（receipt `2026-10-26T21-31-16-852Z-34298-…` outcome=passed）· `uc015:nhp-adv:prove:raw` **EXIT=0 30/30**（receipt `2026-10-26T21-31-32-238Z-34671-…` outcome=passed）· `uc001:nhp-perf-api:prove:raw` **EXIT=0 10/10**（receipt `2026-10-26T21-31-55-811Z-35168-…` outcome=passed）——三门 fresh 链：EXEC 红次（uc016 R1/uc001 R1·红账 `.tmp` 留痕）→EXEC 复跑绿（tracked `ai-docs/delivery/receipts/nhp-*/01-gate-*.stdout.log`）→本席第三 fresh 绿·红账不冲销零错位。
  2. **caps docker inspect NanoCpus/Memory 亲证**：`docker inspect --format '{{json .HostConfig}}'` 双容器亲跑——隔离 PG 容器与 capped api 子容器 `NanoCpus=2000000000/Memory=4294967296` 同值 ok=true（`perf-receipt.json` caps.pg/caps.api+`_caps-evidence.json` 亲读同值）=2cpu/4GiB 亲证·非自报。
  3. **安全面五项读码（源码亲读·对断言面）**：①quiz/diagnosis begin 越权 fail-closed——advisory 锁后 404 `not_found_or_forbidden` 不泄露存在性（`quiz.service.ts:39`/`diagnosis.service.ts:36` 亲读·proof N2/N8 分证）；②CAS 绑定守卫防双绑竞态——`resume_id IS NULL AND privacy_epoch IS NULL` 0 行守卫（proof N4 预绑壳正中面·409 `*_resume_reference_conflict`）；③额度面不漏不越——402 `insufficient_entitlement` 映射 reserve 抛 catch（proof N5 净 0）+abandon CAS 不倒退终态+releaseConsumption 真退还（proof N7 三子臂·净账审计全程）；④对抗上传 fail-closed——`assertMagicMatchesDeclaration` 先于解析 422 `magic_mismatch`（#109·proof A1–A3 三签名族）+NUL 剥除落库零透传（proof A4 pgp 解密面亲证·注入字节不 500）+415/422/429/503 拒面零扣（proof N 臂净账）；⑤滥用/耗尽双缝——per-principal 突发桶 429（`rate-limit.service.ts:101` allow·proof A5 第 16 次）+全局解析槽 503（PARSE_MAX 全局槽·proof V1 败者 503 首请求不受损）。
  4. **egress/est live 复核**：三 proof 词面 `MODEL_API_KEY`/`MODEL_BASE_URL` 六目=egress inventory additive 登记恒等（inventory 364 refs EXIT=0 承 §9-EXEC）·零 DASHSCOPE 族词面·零 Key 加载 est live=0（`actualSpendCny=null` 同源）。
  5. **P3×4 登记**：（P3-1）perf receipt `gitSha:"unknown"` **溯源注**——receipt 系 proof 进程于 capped `node:20-bookworm` 容器内写成（runner `UC001_PERF_API_CAPS_CHILD` 内联源·`-v ROOT:ROOT` 挂载·容器无 git 二进制→`gitSha()` catch 落 `'unknown'`·`uc-e2e-001-nhp-perf-api.proof.ts:73-78` 亲读）——码态溯源由外链证成：runner 收据+gate stdout `CMD=` 行+attempt 时间戳+worktree HEAD `aa3f68d92`·非不可溯源；（P3-2）产品 `released:"error"` **语义疣候选 backlog 一行登记**——零预留 abandon（`'created'` 壳未经 begin）返回 200 `{abandoned:true, released:"error"}`（`quiz.service.ts` abandon `releaseConsumption` 无 consumption 行如实返回 error·源码亲读）——成功形 200 携 `error` 记号语义疣·候选词条「quiz/diagnosis abandon 零预留分支 released:'error' 记号与 200 成功形并存」·**翻面权归协调方**（本卷 Ban 触 gap-bug-backlog·仅此登记候选·proof 期望按真实返回钉死合规非断言迁就）；（P3-3）本席三门第三 fresh 收据对码态=并线前 tip `aa3f68d92`——origin/main merge 后码态变更由并线终验五门（docs:check/turbo typecheck/turbo lint/markers/ancestor）+CI 复跑仲裁（merge 预演同文件 additive→dual-keep·零产品码面）·沿批 B 席2 同形·留痕非阻塞；（P3-4）docker Engine 版本留痕——会签时点亲跑 `docker info` server **29.5.2**=§9-EXEC EXEC 时点亲证值恒等·零引擎漂移（批 B 席2 P2-1 漂移形本次未现·如实留痕）。
- **双 PASS 会签**：席1+席2 独立行使零合谋（alone≠dual·Ban self-approve）·两席结论双 PASS·会签席按协调方派单令落卷翻面。
- **P3 errata 随卷（三注记汇总·零文面回改）**：「零断言面被行使」措辞精度注（席1 P3-1）+perf gitSha unknown 溯源注（席2 P3-1）+产品 `released:"error"` 语义疣候选 backlog 一行登记（席2 P3-2）——三注记均 append 留痕·§9-EXEC 史录不洗。
- **STOP 终态=`closed`（三处翻面=Status 头+§8+卷尾）**——翻面依据=三 case 门矩阵全绿在卷（§9-EXEC）+ 两红次定性核全过（席1-1）+ 断言名零改写（席1-2）+ 三 case 断言实质全过（席1-3）+ consent 窗外零污染（席1-4）+ 三门第三 fresh 独立复跑首跑绿（席2-1）+ caps docker inspect 亲证（席2-2）+ 安全面五项读码（席2-3）+ 双 PASS 会签；史录 token `executed:awaiting_post_prove_dual` 保留为 provenance 不回改；后续=并线 PR 走 main（fetch origin/main→merge-tree 预演→merge --no-ff→`pnpm install --frozen-lockfile`→终验五门→push→PR）·矩阵行/coveredCount/backlog 翻面权仍归协调方（本节 append 纯文面零码动）。
- **lint 双帽 sanction 行使（收官席 · 2026-10-26 · 协调方裁「双帽恰等步进 +10 准·沿 ded20bae6 两 sanction 先例形」随令落码 · STOP `closed` 终态零翻·本条 append 纯文面留痕）**：①**落码**：`apps/api/package.json` lint `--max-warnings` **1437→1447**（+10）+ root `package.json` **5274→5284**（+10）——恰等步进零多放；②**承登来源**：批 C 三新 proof no-explicit-any/naming——uc001 ×8+uc016 ×2·修码将破双 PASS 会签收据链故帽步进（uc015 ×0·worker 977 零涉不步进）；③**复跑绿**：turbo lint **12/12 EXIT=0**（worker 恰 977·api 恰 **1447**·root 恰 **5284** 各帽恰等 0 errors）· turbo typecheck **8/8 EXIT=0** · docs:check **EXIT=0**（scanned 2386≤2394）· markers **0 命中**（改动集五类标记词+行首冲突标记 grep 亲跑·沿 `i6-239-gates.proof.mjs:154-163` 门口径）；④**本地环境注记（先在红非本刀所引·亲证留痕）**：首跑 turbo lint root 臂 1 error=`1:23 Parsing error: Unexpected character '·'`——全部落 gitignored 本地收据 `.tmp/uc001-perf-api-receipts/_caps-child.source.mjs`（§9-EXEC uc001 capped child 内联源留痕·`.gitignore:15`·`git ls-files .tmp/`=0 零 tracked）——**stash 亲证届 tip `3eadf639e` 同红同源=先在红**·与双帽落码零因果（diff 恰两数值字面量）；移出该件复跑 **12/12 EXIT=0**（root 0 errors 恰 5284）后原位归还字节恒等（sha256 前后同值 `a339d0c42833cb2ea9cc81087c8ea527c2118dc2de3c6f1f1052acb0959634aa`）·本地红绿次留痕零损·CI fresh checkout 零此件零影响；⑤后续=commit（`chore(test): 放宽告警配额登记`）→push→PR 走 main→`gh pr merge --merge --auto`。

## §9 状态

**`closed`**（2026-10-26 §9-post post 双审双 PASS 会签翻终态 · §9-EXEC 三行行使全绿 EXIT=0 + 席1/席2 双 PASS 会签落卷 · 原值 `executed:awaiting_post_prove_dual` 史录不洗）· 卷 closed ≠ covered ≠ 矩阵列升格（coveredCount=8 零翻转 · EXIT0=case≠covered）· 状态终翻面权归协调方 · alone≠dual · Ban self-approve · 并线 PR 走 main（终验五门后 push）。

---

*NHP-BATCH-C REQUEST · 2026-10-26 起草 · 2026-10-26 EXEC 落卷 · **STOP=`closed`**（2026-10-26 §9-post post 双审双 PASS 会签翻终态·原值 `executed:awaiting_post_prove_dual` 史录留痕不洗·三处钉：Status 行+§8+本行）· 剩余队列 Phase2 #12 one-knife-one-row 批 C · 覆盖矩阵残余行 UC-E2E-016/029 `:121`（NEG）· UC-E2E-015 `:120`（ADV）· UC-E2E-001 分面 `:146`+case-matrix `:40`（PERF_api 执行）· 修法=恰 3 具名 case（`NHP-016-NEG-01`/`NHP-015-ADV-01`/`NHP-001-PERF-api-01` 执行）· 一行一 case · docs+test-only 零产品码触 · §1.3 否决含停止条件登记（UC-027 码面不存在可测注入缝 · UC-033 FAULT live-worker 本地不可测 · UC-040–043 接线未证）· cap 预算=序 A sanction 步进 **2386→2394 落码**（+8 二十三先例形·越限臂 2_394/2395 联动·EXEC 终验实证 scanned 2385≤2394·§9-EXEC 承登）· 双表同步令沿 §1.0.3 `:164` · merge base=`origin/main` `b894cad88`（#146 批 B 并线后）· EXEC merge `29fd12114` · 分支 `line/nhp-c-draft` · 工作树 `meetwise-nhp-c` · 与批 A/批 B（已并线）/UC 专属线行级互斥 · 三 case EXIT=0（53/30/10 断言·attempts 1,0×3 · 邻面 neg:input 135 + uc015:ingest-failures 12 全绿不回退）· §9-post 双审双 PASS 会签 2026-10-26 落卷（席1 两红次 stdout 亲读定性+断言名零改写+三 case 实质核+consent 330 次窗外零污染+P3×2 · 席2 三门第三 fresh 53/53+30/30+10/10 首跑绿+caps docker inspect 亲证+安全面五项读码+P3×4 · errata 三注记随卷：措辞精度注+gitSha 溯源注+released:"error" 语义疣候选 backlog）· est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0≠covered · releaseEvidence=false · ≠HA · ⛔push*
