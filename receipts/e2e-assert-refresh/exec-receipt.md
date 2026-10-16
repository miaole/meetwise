# E2E-ASSERT-REFRESH EXEC 收据（line/e2e-assert-refresh · meetwise-e2ar 工作树）

**席位**: e2e-assert-refresh EXEC（pre-exec 双审 BOTH PASS @c9ac1016 + 协调方派单 §8 开工授权）
**基线**: `feat/mysql-schema-skeleton` @ `24e1adf3` · 本刀开工 tip `c9ac1016`（主线 tip 已至 83a940c7+·触面 8 文件零漂移经席1 登记·EXEC 立项仅更 tip 标签·重 pin 亲证 :333-:344/:21/:167/run-e2e-ui.mjs :96/:197-202 锚位全命中）
**LIVE 协议（全程遵守）**: `MODEL_API_KEY` 仅经 `source ~/.meetwise-secrets/load-model-api-key.sh` 注入进程环境 + `E2E_SKIP_DOTENV=1` + 禁 .env 回灌（零 mv 形）+ 键值零打印零入卷；全部验收跑锁 isolated wrapper（`pnpm e2e:isolated`/`pnpm e2e:ui:isolated`）·零裸跑（R5）。

## 〇、协调方裁决 A 三行登记（2026-10-11·硬约束条件 2）

1. **「第 4 件系 EXEC 发现 0157 新红面·协调方授权扩入」**——S1 深跑首行使 :344 后 15 位时命中 0157/B271 片2 S2-C4 企业扣费路由（§二·发现4），协调方裁 A 授权 fixture 企业额度随演（真 commerce API 购 `ent_pack_50` + 真 HMAC webhook·镜像 `provisionPaidInterviewCredit` 形·零产品码·0157 语义零触）。
2. **红① 最小变体登记**——REQUEST §1-① 第二步机制前提漂移：`POST /interview` 为 per-user 开放面试复用（interview.service create 非终态 open 行 `reused:true`），**结构不可达实证 iv4===iv3**（attempt2 仪器跑 ndjson 亲证 `iv_01a12b2ff8787921b03fd2792c097a05` 两行同值·begin 返 `alreadyBegun:true` 202）。随演=iv4 位 honest 复用断言（202+accepted+alreadyBegun·不假称 402）+ **402 错误映射面行使位随演至同族押题 begin**（quiz.service.ts:59-62 同 `reserveEntitlement → insufficient_entitlement → PAYMENT_REQUIRED` 管道·新 quiz id=新幂等键·无 reuse/duplicate 短路·FIFO 无可凑桶→真不足）·原 :344 断言文案逐字保留于该位·两红线辨析注释全文在码（禁 abandon 还池·禁 duplicate/alreadyBegun 冒充不足面）。
3. **0157 新红面独立发现登记**——B271 片2 S2-C4 `POST /applications/:id/start` 改 start+begin 合一·企业额度预留（commerce.ts `reserveEntitlementForApplication` payer=job_application.recruiter_user_id·FIFO 招聘方企业桶·候选人分码 402 `application_enterprise_pay_unavailable`）。**:344 后 15 位（full.e2e.ts 原 :346-:432）系 0157 10-10 落主线后从未行使**，LIVE final 跑首行使即红（consent-capture 侧通道亲证 `app_start status=402 body=application_enterprise_pay_unavailable`）。**UI recruiting-bound fixture 同源影响**：候选「开始面试」UI 面同走该端点，spec 原仅给候选人个人口袋付费（0157 前语义）→ 同拦。修复后该面绿（final-4 ledger `seg2_start_assert_post` ✓）。**供台账/红面对账与后续刀位**：0157 对 e2e 套件影响面=HTTP 套件 :400 区 + UI recruiting-bound 开始面，均已随演收口。

## 一、逐件实施

### 红① full.e2e.ts e2e3 区显式耗尽形 —— 落码·深跑全绿亲证
见 §〇-2。新增断言 5 条：trial 202 生效 / 桶 -1 / 复用 honest 202 / 押题 402（文案逐字） / 402 后零泄漏。final4 ledger `seg_expert_enter` 后推进至 `seg_bound_start_enter` = 本区全绿亲证。

### 红② recruiting-bound.spec 审核门三拍 + run-e2e-ui.mjs E2E_ADMIN_TOKEN 交接 —— 落码·UI 双 project 绿亲证
- helper 分臂：candidate 臂零改；recruiter 臂三拍=①pending 文案锚 `/招聘方注册已提交/`+`toHaveURL(/\/login$/)`+零 `mw_token` cookie（auth-actions.ts:29-31 早退语义钉）②真 admin API approve（GET approvals 按 email 取 id→POST decision→`{decided:true}`·`adminAuthHeaders()` 缺 token 即 throw fail-closed·Ban mock/Ban 静默跳过）③approve 后真 UI 登录恢复 `waitForURL('**/recruiter/jobs', 20s)` 行使（login 模式无 approvalStatus 分流）。原旅程全链零改。
- runner 交接（镜像 e2e-recruiter-gate C1·落点=R2' 定谳理由 run-e2e-ui.mjs）：seedAdmin 幂等直插+HMAC 铸 token（payload=base64url{uid,exp,pe}·pe=0·AUTH_SECRET 测试键单点 :17 与 api 子进程同键）+`E2E_ADMIN_TOKEN` 显式并入 playwright spawn env·seed/铸任一步失败 `admin_bootstrap_failed` fail-closed。
- **red②-face2（同根 0155/b110·abf80ce6 2026-10-10 落线·非新独立发现）**：邀请 status 文案已由「已邀请」演为「已受理；若对方是注册求职者将收到邀请」→ spec :255 锚随演 `/已邀请/`→`/已受理/`（app 面由既有 API 侧 `status='in_progress'` 契约断言承重）。聚焦诊断跑亲证 Received string 全文（ui-recruiting-focused-diag.log）。

### 红③ stream-window.spec.ts 甄别（零改 spec·`git diff` 空）—— 三绿定谳
- **证据物保全（先 pin 后甄别·主工作区只读零回写零搬移）**，attempt2 三件 sha256：
  ```
  c0b541b9f4ee9c062389c94c9c063ba9bba122856ba676ce6f3d273fedf5f608  trace.zip
  dd654fccc984f25e9685ac9dc9fc2236b69efb77268ca5483cbf13072f9186c9  error-context.md
  204ff19483e61bfaa9289df262a5c2b3331421c446c5a91e335feb9faa3168c8  test-failed-1.png
  ```
- **trace 读判**：页面滞留 **/login**（非跳他处/非 redirect 竞态），错误态=**`失败:too_many_attempts`**——signup 被 API 限流拒（auth.service.ts:29 signup 三桶并列·`signup:ip` capacity 10/refill 0.05s⁻¹·UI 套件尾部 signup 簇间距<20s 补充周期）。方向=环境时序面。
- **隔离重验 ×3 全绿 → 时序面定谳**：`E2E_UI_GREP='silent variant' E2E_UI_PROJECT=mobile`（既有 opt-in 钩零新开关）run1=EXIT 0（1 passed 10.0s）·run2=EXIT 0（7.2s）·run3=EXIT 0（7.1s）——每跑单 signup 远低于桶容即绿，坐实限流时序·非 stream-window 语义红。断言/基建处方归后续刀（如套件级 signup 供给面治理）。
- 甄别结论按裁决 A 条件 3 更新两重视角：recruiting-bound 红面前移=**0155 审核门（红② 已随演）+0157 企业扣费（第4件 已随演）两重均过**（UI final2 双 project 绿亲证）；stream-window silent mobile=signup:ip 限流时序面（三绿定谳）。

## 二、深跑随演发现链（第4-7发现·裁 A 同型原则「本刀宗旨即断言随演」·全部 e2e/spec 域零产品码）

| # | 面 | 产品变更（落线） | 随演 | 证据 |
|---|---|---|---|---|
| 第4件（裁 A） | :400 区 start 面 + UI 开始面 | 0157/B271 片2 S2-C4（entpay-slice2/3·10-10）start+begin 合一企业扣费 | 两 fixture 招聘方真 API 购 `ent_pack_50`（full.e2e 另增 `enterpriseAvailableUnits` 到账断言） | final2 ledger 推进至 seg_boundloop_terminal·侧通道 `app_start status=200 started` 亲证 |
| 第5发现 | :436 finalize 统一面 | report-retry D2（a62919dd·10-10）终态族扩出 `report_unavailable`（本套 3/3 跑一致·reason=max_attempts_exceeded）·finalize outcome 恒 `assessment_unavailable`（calibration hold 契约钉·无 'completed' 分支） | `scorelessBound` 族并一词 `report_unavailable`（期望恒臂不改） | final2 侧通道 `postm7_a3_finalize scorelessBound=false`→final3 `scorelessBound=true` 过 |
| 第6发现 | :447 scoreless 臂 retry | I2 W1 修法④（d4e51105·**2026-10-11 当日落线**·晚于 REQUEST 现状锚）held 不可重试（UI startable 收窄仅 failed+API 同源拒·裁定⑥） | 契约钉随演 `409 application_held_not_retryable` fail-closed（不开新 attempt·不暴露分） | final3 侧通道 `postm7_a5_retry retryStatus=409`·git log -S 落线亲证 |
| 第7发现 | UI :332 申请状态页 | 同 d4e51105 W3④免责卡新句「已面完 · 待校准表示这场面试已完成、还没有可比较的校准分…」 | `已完成` 改 exact 全词（仍禁裸「已完成」徽回退）+`综合评分/我的回答` 维持子串零容忍（隐私牙不弱化·count=1 恰为免责句单匹配） | UI 全套 clean 错误详情+error-context（test-results） |

红面行使清单（原 :344 后 15 位·final4 全行使）：order2 错签前置/403/404/apply2 幂等/finalize 409/400/start 原子会话/start 幂等 reused/begin 202/boundLoop 真旅程/finalize 统一面/cand assessment_unavailable/held 409——逐位结果见 final4 ledger+侧通道 ndjson。

## 三、S1 深跑台账（`pnpm e2e:isolated`·逐跑另账）

**attempt 纪律区分（裁决 A 条件 4）**：attempt1=处方原形红（前提不可达·如实记）→ attempt2=仪器化定位跑（TEMP-DIAG 侧通道沿 consent-capture 先例·跑后全摘·`grep -c dgx=0` 机检在案）→ final/final2/final3=**断言前提被诚实修复后的合法重验**（非重跑洗绿：每次跑间 diff=新随演面落地·红面逐次前移·非同面反复）→ final4=验收终跑绿。

| # | EXIT | 断言数 | 死点/定性 | 收据 |
|---|---|---|---|---|
| attempt1 | 1 | null | 处方 v1 前提不可达（iv4===iv3·alreadyBegun 202）·class=api 为 run-e2e.mjs `client_exited` 包装伪影（lastFailureLine 覆盖·与断言分类无关·LIVE attempt3 同伪影） | machine-receipt-s1-attempt1.json |
| attempt2 | 1 | null | 仪器化定谳=402 断言位（ndjson `alreadyBegun:true`） | machine-receipt-s1-attempt2-diag.json + expert-region-diag-attempt2.ndjson |
| final | 1 | null | 红① 区全绿（ledger 过 seg_expert_enter）·死点=:400 区 0157（发现4） | machine-receipt-s1-final.json |
| final2 | 1 | null | :400 过·boundLoop 过·死点=:436 终态族（发现5）·145.8s | machine-receipt-s1-final2-item4.json |
| final3 | 1 | null | :436 过·:442 过·死点=:447 held 409（发现6）·175.2s | machine-receipt-s1-final3.json |
| **final4** | **0** | **85** | **全卷绿·:344 后 15 位首行使完成·预期新红=零** | machine-receipt-s1-final4-GREEN.json |

**§2-1 门终值（final4）**：EXIT=0 ✓ · `E2E_FINAL_SUMMARY assertions=85` ≥64 ✓（非 capability 门控位全行使+本刀新增断言）· reviewLedger capability **恰 2**（`image_ocr_unavailable`+`voice_unavailable`）✓ · 无新增 skip 类记录 ✓ · `report_unavailable` ×3 = 报告 worker max_attempts 预期故障面（worker 类 review 记录·非 skip 非缺陷红·照 LIVE 收据口径如实披露）。

## 四、S3 UI 台账（`pnpm e2e:ui:isolated`·终值 EXIT=0·18 passed / 10 skipped / 0 failed · 4.5m）

| 跑 | 结果 | 说明 |
|---|---|---|
| 甄别 run1/2/3 | EXIT 0 ×3（10.0s/7.2s/7.1s） | §一·红③ 三绿定谳 |
| UI attempt1（工具中断） | 作废 | 10min 工具上限截断风险预防性 stop·孤儿进程树清理（kill+pkill+3 容器 rm·全 meetwise-e2e-* 本席命名域·docker ps 归零亲证）·**基础设施处置非洗绿**·该跑日志受同路径 fd 交错污染不作为证据 |
| UI 聚焦诊断 | EXIT 1 | recruiting-bound 单跑定位=red②-face2 文案面（§一）·干净错误全文在 ui-recruiting-focused-diag.log |
| UI 全套 clean | EXIT 1 · 16P/2F | recruiting-bound 双 project 死于 :332——发现7（免责卡句子串误伤）→ exact 随演 |
| UI 全套 final | EXIT 1 · 17P/1F | **recruiting-bound 双绿 ✓**；唯一红=progress variant chromium（20.1s·徽标 plannedTurns 缺失单面）→ 聚焦探针 `E2E_UI_GREP='progress variant'` 双 project EXIT 0 **2 passed 17.6s 未复现**=合成源载序瞬态（同日 LIVE attempt2 双绿/污染跑绿/聚焦探针绿·三绿一瞬红·两向如实入账） |
| **UI 全套 final2** | **EXIT 0 · 18P/10S/0F（4.5m）** | **验收终跑：§2-2 全门达成**——recruiting-bound chromium+mobile 双绿（三拍+企业额度+全旅程·1.4m/43.1s）+ stream-window 三用例六面全绿（:9 1.3s/1.6s·:46 6.0s/6.2s·:60 6.4s/6.4s）+ golden ×2 + screenshots ×4 + uc018 ×2 全绿 |

**§2-2 门终值（final2）**：EXIT=0 ✓ · recruiting-bound chromium+mobile 双绿（含审核门三拍+approve 后旅程全链）✓ · stream-window 三用例六面全绿 ✓ · skipped ×10=voice-duplex ×3 ×2 project + online-public ×2 ×2 project（capability 门控 test.skip·预期内·**skip≠pass**）。

**瞬态面登记（如实·供后续刀）**：三次全套跑出现三枚互不相同的一次性时序红（progress chromium 徽标降级 1 次→聚焦 2/2 绿；golden chromium 冷启 heading 1 次=10-07 基线 gap-red1-timing-face 已登记同族冷启面；均先前/后续绿）——e2e-ui 套件单机负载下时序稳定性=已知家族面（冷启/合成源载序），非本刀语义红，处方归后续刀（runner 预热/断言容窗口均超本刀 §1-③ Ban 不动）。

## 五、est live 台账终账（申报 ≤25 G7Y 双计口径·实耗逐跑另账·低于申报如实）

| 跑 | 真模型外呼 | WALL |
|---|---|---|
| S1 attempt1 | 主旅程 1 + trial iv3 出题 | 98.1s（durationMs=98051） |
| S1 attempt2 | 同上 | ~85s |
| S1 final | 同上 | 169.9s |
| S1 final2/final3/final4 | 主旅程 1 + trial 出题 + 绑定旅程 1（企业额度生效新增） | 145.8s / 175.2s / ~2.9m |
| 甄别 ×3 + progress 探针 | 零真模型（STRESS 源 guard-only 合成 SSE） | 10.0/7.2/7.1/17.6s |
| UI 聚焦诊断 | recruiting-bound 旅程 1 场 | ~2m |
| UI 全套 clean/final/final2 | recruiting-bound 旅程 ×2 project/跑 | 4.6m/4.7m/4.5m |

真模型面试旅程合计 ≈ 6 场量级（S1 主 ×5+S1 绑定 ×4+UI 绑定 ×6 折算）·**远低于 25 上限**·fixture 企业包购买系 DB 层非模型外呼（est 不变·协调方确认）·零生产操作·secrets=loader 进程 env 运行时态·键值零打印零入卷。工具上限处置：全套 UI 超 Bash 600s 上限 → nohup 完全脱离跑（三跑·首跑因孤儿并发污染作废已披露）。

## 六、收尾门自检（终值）

- [x] 触面机检：git diff 恰 3 文件（`e2e/full.e2e.ts` + `apps/web/e2e-ui/recruiting-bound.spec.ts` + `scripts/run-e2e-ui.mjs`）·`git diff --quiet -- apps/web/e2e-ui/stream-window.spec.ts` 空（甄别零改 spec）✓
- [x] 零产品码：`git diff --quiet -- apps/api apps/worker packages` ✓（0154/0155/0157 语义零字节零触）
- [x] 仪器全摘：`grep -c dgx e2e/full.e2e.ts`=0 ✓
- [x] 冲突标记门（§2-5）：全仓 ts/mjs/md `grep '^<<<<<<< \|^=======$\|^>>>>>>> '`（排 node_modules/.next）=0 ✓
- [x] markers=0：改动集 TODO/FIXME/XXX/HACK 直接 grep 零输出 ✓
- [x] pins 十一值零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（本刀零触任何 SSOT/台账行·git status 仅 3 改+untracked 收据目录）
- [x] 披露行：**非绿项=capability 跳过 ×N**——S1=OCR ×1 + 语音 ×1（capability ledger 恰 2·⊘ skipped·**skip≠pass**）+ report_unavailable ×3（worker 类预期故障记录·非 skip）；S3=voice-duplex ×3 ×2 project + online-public ×2 ×2 project = test.skip ×10（capability 门控预期内·**skip≠pass**）
- [x] est 申报 ≤25 实耗远低（§五逐跑另账）
- [x] commit 不 push（message 首行 e2e-assert-refresh EXEC）

## 七、残余披露（如实·供双审/协调方）

1. UI 套件时序稳定性家族面（§四瞬态登记）——三次全套跑三枚互异一次性瞬态·全部两向记账·非本刀范围。
2. 红① EXEC 最小变体（§〇-2）与发现4-7/red②-face2（§二）——均属「断言随演」授权域内落码（发现4 经明示裁 A·发现5-7/red②-face2 沿同型原则延伸·全部 e2e/spec 域零产品码），请双审/协调方追认。
3. `report_unavailable` 常态化（报告 worker max_attempts_exceeded 3/3 跑一致·LIVE attempt3 已现 ×4）——环境或产品待归因面·零断言改动·登记供后续刀。
4. 工作树遗留 `apps/web/test-results/`（本刀 UI 跑失败附件·attempt 遗迹）+ `.tmp/` 侧通道文件——均 untracked 工具产物·零源码。
5. 甄别聚焦跑与 UI 全套跑复用既有 opt-in 钩（E2E_UI_GREP/E2E_UI_PROJECT·run-e2e-ui.mjs :197-198 亲证）·零新开关。
