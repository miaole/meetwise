# E2E-ASSERT-REFRESH — LIVE 复跑三红断言随演刀（红①红②处方 + 红③甄别设计 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·pre-exec 勘误席合并落卷（席1 七登记 R1-R7+席2 §2 三处方·2026-10-11）·status 维持·复审挂起·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**Status 链补全（nail 席 append-only 一次补登·2026-10-11）**：`draft:awaiting_pre_exec_dual`（上行原文照录零改）→ `executed:awaiting_post_prove_dual`（EXEC 落卷 @`91c04145` 3 码面+25 收据·红①红②断言随演+红③甄别三绿定谳·EXEC 未翻本 Status 行·照实补登）→ **nailed**（post-prove 双席 BOTH PASS @2026-10-11·裁 A 扩面授权链追认终局：红① 最小变体+第 4 件 fixture 随演+发现链 4-7 登记·merge 主线 nail·错峰等 merge(ptp-archive) @`2cec48e8` 落主线可见后动手·loop 协调方本次派单即 nail 授权）。上文原 Status 行文字照录不改。

**席位**：E2E 断言随演刀起草席（北星 loop · LIVE 复跑采证定谳后继刀）。
**基线**：`feat/mysql-schema-skeleton` @ `24e1adf3`（主线最新 tip·`git rev-parse HEAD` 实测=收据入库 commit）。分支 `line/e2e-assert-refresh`·工作树 `meetwise-e2ar`（`git worktree add /Users/miaole/Desktop/golucky/meetwise-e2ar -b line/e2e-assert-refresh` 本起草席已立·树/分支建前实查均不存在：`git worktree list` 七树无 e2ar·`git rev-parse --verify refs/heads/line/e2e-assert-refresh` BRANCH_ABSENT）。
**防重双对表（亲证）**：`rg -l "e2e-assert|断言随演|assert-refresh" ai-docs/delivery/ ai-docs/delivery/execution-master-checklist.md` → 唯一命中 `ai-docs/delivery/harness/regression-fix-REQUEST.md`（regfix 他刀卷内叙事性提及「断言随演」·:58/:188 两处·非本刀同名卷零冲突）+ checklist 零命中——本刀卷名 `e2e-assert-refresh-REQUEST.md` 全仓唯一。
**蓝本**：①采证事实源=`receipts/live-rerun-2026-10-11/`（38 件任务书口径·`ls | wc -l` 实测 **36 件**·00-summary 自记 37 件——**计数漂移如实登记**：以实物 36 为准，差额疑入库筛除/计数口径，不冒称）②形制沿 `ai-docs/delivery/harness/diag-honesty-REQUEST.md`（meetwise-diag 树 @`4ed10ab2`·Ban/pins 同源誊录见 §5）③相邻已收口先例=`ai-docs/delivery/harness/e2e-recruiter-gate-REQUEST.md`（C1-C3 已落主线·本刀消费其 admin 面不重做）。**pre-exec R7 勘误注记（协调方裁定·勘误席代落一行·收据本体零触）**：收据目录 36 实物为权威计数（`ls | wc -l`=36 勘误席亲证）·任务书 38/summary 37 为口径漂移如实登记不另追账。

## §0 现状锚（起草席亲读·base `24e1adf3`·file:line 逐条 sed/rg 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 三红现场（LIVE 复跑 2026-10-11 定谳·收据锚逐条）

| # | 红面（码锚实测） | LIVE 实测 | 定性 |
|---|---|---|---|
| 红① | `e2e/full.e2e.ts:344` `A(r.status === 402 && b.error === 'insufficient_entitlement', '[异常] 额度不足 begin → 402 …（不再被 mask 成 500）', 'data_or_permission')`——夹具链 `:333`（`signupOrLogin('e2e3_…')` 新用户）→ `:335-339`（consent+上传简历）→ `:342-343`（建 interview iv3 → begin） | begin 实测 **`202 {"accepted":true,"jobId":…}`**（收据 00-summary §S1 新红 + machine-receipt-s1-attempt3.json outcome=failed/class=api/assertionCount=null·64 ✓ 后死于 ：344·`s1-exit-attempt3.txt` `S1_ATTEMPT3_EXIT=1 WALL=115s`） | **产品语义有意变更（0154）·断言未随演**。确定性红非 flake（diag 同点复现） |
| 红② | `apps/web/e2e-ui/recruiting-bound.spec.ts:21`（helper `signUp` `waitForURL(role==='recruiter' ? '**/recruiter/jobs' : '**/dashboard', 20s)`）·recruiter 调用于 `:167`（test 体 `:143`·candidate 调用 `:154` 绿） | `[chromium]/[mobile]` 双双 `TimeoutError: waitForURL('**/recruiter/jobs') 20s` @ spec `:21`←`:167`（收据 `s3-e2e-ui-isolated-attempt2.log:30/:44/:70-71/:105-106`） | **产品语义有意变更（0155）·断言未随演**。10-07 基线红面（面试早停终态）已前移至 B 端注册导航 |
| 红③ | `apps/web/e2e-ui/stream-window.spec.ts:60`（silent variant test 声明）→ `:61` 调 `registerAndGo` → helper 内 `:42` `waitForURL('**/dashboard', 20s)` | **仅 `[mobile]` 一红**（21.6s）；同 spec 兄弟五面全绿（`:9` chrom 800ms/mobile 2.7s·`:46` chrom 5.7s/mobile 7.0s·`:60` chrom 5.8s）+ 4.6s 前 golden-mobile signup 绿（收据 attempt2.log:33-35/:47-49） | **新红候选·疑冷启/时序面**。禁重跑洗绿·本刀只做甄别设计（§1-③）不改断言 |

### 0.2 根因迁移锚（两迁移 landing 亲证·语义=有意产品变更）

| 迁移 | landing | 语义（亲读） |
|---|---|---|
| `packages/db/migrations/0154_trial_bucket_grant.sql` | `91c686d9` 10-10 10:02:21 落主线（回填重编号 `c51c792d` 10-10 10:04·SQL 零改动）——pre-exec R3 勘误：原记 01:59 系收据时戳误植（git 实测 2026-10-10 10:02:21 +0800）·hash 承重锚无碍 | `:15-16` partial unique index `uq_bucket_trial_one_per_owner`（trial 结构性 once-per-user）+ `:36-40` `gateway_auth_signup` 同事务 INSERT trial 桶 `kind='trial'·units_total=1.00·now()+365d`（「1 次面试=1.00 口径，恰够一场」注释原文）——**任何新注册用户不再是无额度用户**。0155 `:53-57` 回填并集照搬（两态注册同适用·末位 CREATE OR REPLACE 必携） |
| `packages/db/migrations/0155_recruiter_approval_gate.sql` | `abf80ce6` 10-10 10:37:45 落主线——pre-exec R3 勘误：原记 01:55 系收据时戳误植（git 实测 +0800）·hash 承重锚无碍 | `:47-49` recruiter 注册落 `approval_status='pending'`（candidate 走默认 approved）+ `:62-70` `gateway_require_active_recruiter` 加审批维度（fail-closed 42501）+ `:88-108` admin approve/reject+admin_audit。感知双通道=signup 响应体 `approvalStatus`（即时·`apps/api/src/modules/auth/auth.service.ts:46-47` 实锚）+ B 端 API 403 分码（晚一跳） |

**红① 机制链（扣减面亲读）**：`apps/api/src/modules/interview/interview.service.ts:249-251` C 端 begin → `reserveEntitlement(c, owner, id, 'mock_interview', 1.0)`（幂等键=interviewId·新面试=新键）；`packages/db/src/commerce/commerce.ts:44-93` FIFO 跨桶·全有全无·不足抛 `insufficient_entitlement`（`:89`）→ service `:250-252` 映射 402。0154 后 e2e3 新用户恰有 trial 1.00 → 首场 begin 预留成功 202（LIVE 实测同形）→ **原 ：344 前提（无额度）结构性失效**。
**红② 机制链（路由面亲读）**：`apps/web/app/auth-actions.ts:26-31` signup 模式读 `body.approvalStatus==='pending'` → **早退反馈**（`:30` 文案「招聘方注册已提交：账户进入管理员审核队列，审核通过后即可登录使用招聘方功能。」·回表单错误态）——`:32-39` 设 cookie/redirect 全跳过=**零 `mw_token` cookie·零跳转**，故 spec `:21` 等 `**/recruiter/jobs` 20s 必超时。login 模式无此字段（approve 后登录直落 `:39` 按角色 redirect）。

### 0.3 半径盘点（红① 盲区与既有关联面·全实测）

- **402 断言全卷唯一**：`rg -n "402\|insufficient" e2e/full.e2e.ts` 仅 `:344` 一处——红① 修复无第二面。
- **额度既有断言全相对差值形·trial 不击穿**：`:56`（`availableUnits >= 1`·绝对下界形）/:77（OCR 前 −1）/:82（重传不变）/:92-:118（UC018 begin −1/abandon 净 0）——主用户多得 trial 桶 1.00 零影响（pre-exec R1 登记：0154 使 `:56` 证据力弱化——无支付亦真·到账证据降级面留后刀·本刀不触；原记 `:55` 锚勘正 `:56`）。
- **`:344` 后 15 个 A( 位未行使（套内 70 位）**：`:347-:432`（payment 错签/RLS/finalize 防伪造/岗位绑定状态机等）无额度前提依赖（逐位 sed 亲读）——但**LIVE 复跑从未行使它们（0154/0155 后）**，本刀修复后深跑即首次行使面·结果如实入收据（新红照 E5 流程登记不洗）。
- **S1 recruiter 审批步已随演（他刀已收口·本刀零重做）**：`e2e-recruiter-gate-REQUEST.md` C1-C3 已落主线——`scripts/run-e2e.mjs:176` `E2E_ADMIN_TOKEN` 播入 + `e2e/helpers/auth.ts:78-82` `adminHeaders()` fail-closed（缺 env throw `e2e_admin_bootstrap_missing`）+ full.e2e.ts step8 两处审批三步活契约——LIVE S1 64 ✓ 已实证该区绿。
- **S3 路径 admin 面缺口（红② 处方依赖·亲证）**：`E2E_ADMIN_TOKEN` 现只达 S1 路径——`scripts/run-e2e-ui.mjs` 无 seedAdmin 无该 env（`:96` `spawnProc` env=`{...env,…extraEnv}`·`:199-202` playwright spawn 显式仅 `PLAYWRIGHT_BASE_URL`/`E2E_API_BASE`）·`run-e2e-isolated.mjs` 对 `e2e:ui` target 亦零播入（rg 亲证）。
- **S2' 性能门首跑基线绿**（34 ✓/4 预算·attempt5）——本刀零触。
- **LIVE 协议条款（照 00-summary 仪器链）**：worker-boot 崩定谳=.env 残留物非产品红；绿基线同形=Key 只经 loader `~/.meetwise-secrets/load-model-api-key.sh` source 注入进程环境 + `E2E_SKIP_DOTENV=1` 钩（S1/S3 已落码）+ 禁 .env 回灌（S2 attempt5 以临时 mv 实现同形·跑后复原 mtime 亲证）——**本刀复验 LIVE 面照此协议**（§4）。

## §1 修法（三件·全落 e2e/spec/runner 测试基建面·产品码零字节·file:line 实锚·EXEC 立项重 pin）

### ① 红① 夹具改造+断言随演：显式耗尽两步形（`e2e/full.e2e.ts` e2e3 区 `:333-344`）

- **处方定谳（盘点结论）**：「屏蔽 trial 赠与的测试路径」**弃选**——rg 亲证 apps/api/apps/worker 零 trial 开关/测试钩（命中仅两迁移文件），造钩=产品码改=§3 禁区；纯「202 断言随演」**亦弃选**——402 错误映射面（「不再被 mask 成 500」·原断言存在意义）将全卷无行使位=断言力净损。**采显式耗尽两步形**：前提由幻影改诚实 earned·双向语义都行使。
- **第一步（trial 语义正面行使）**：既有 iv3 begin 断言随演 `202`（accepted+jobId 形状·=trial 赠与生效·恰够一场）+ 额度相对差值断言（entitlement before/after：`afterBegin === before − 1`·沿 UC018 区 `:107-:109` 同形制）=trial 桶扣减证据。
- **第二步（原断言前提诚实化）**：新建 interview（`POST /interview {}` → 新 id=新幂等键）→ begin 同 resume-id → **断言 `402 && error==='insufficient_entitlement'` 逐字保留**（trial 1.00 已耗尽·FIFO 无可凑桶 → commerce.ts:89 → interview.service.ts:250-252 映射面原样行使）。
- **设计红线（EXEC 必守）**：两步之间**禁 abandon/释放第一场**——abandon 释放预留会把 trial 单位还池（UC018 `:118` 实证 released 净 0）·402 前提自毁；禁共用 iv3 重放（同幂等键→duplicate 不再预留·测不出不足；pre-exec R6 辨析：`interview.service.ts:255-258` 将 duplicate 亦映射 402——iv3 重放将**假通过 `:344`**·EXEC 落码时断言文案或注释须保留此辨析·Ban 假 402 冒充错误映射面行使）。
- **命名随演**：区注释/断言文案「无额度用户」改如实表述（如「trial 耗尽后用户」）——Ban 名不副实；`:344` 原文案「额度不足 begin → 402」语义仍真（耗尽后）·保留。

### ② 红② 断言随演：审核门中间态 + approve 后登录路径（`apps/web/e2e-ui/recruiting-bound.spec.ts` helper `:15-22` + `:167` 区）

- **helper 分臂**：candidate 臂零改（`:154` dashboard·LIVE 双 project 绿）；recruiter 臂改审核门三拍：
  1. **新中间态断言**：注册提交后断言审核中反馈文案可见（`auth-actions.ts:30` 文案·至少锚「招聘方注册已提交」稳定前缀）+ 断言未发生跳转（仍滞 /login·无 `mw_token` cookie——`:29-31` 早退零 cookie 实锚）；
  2. **admin approve 环境准备**：照本 spec `provisionPaidInterviewCredit`（`:30-41`·「唯一非 UI 的环境准备」先例）经真 admin API——`GET {API}/admin/recruiter-approvals` 按 email 取目标 id（`admin.controller.ts:39-41`）→ `POST {API}/admin/recruiter-approvals/:id/decision` body `{decision:'approve'}`（`:44-48`+contracts Zod `{decision: enum('approve','reject')}`·200 `{decided:true}`）——Ban mock 决策响应；0155 admin_audit 留痕为 DB 侧副产品零断言负担。
  3. **approve 后真 UI 登录**：`goto /login` → 填 recruiter 凭据 → 点登录钮（i18n 渲染 zh「登录」/en「Log in」·`messages/zh.json:109` 实锚）→ **`waitForURL('**/recruiter/jobs', 20s)` 原断言恢复行使**（login 模式无 approvalStatus 分流·`auth-actions.ts:39` 按角色 redirect）→ 原 `:169-253` 建岗/邀请/旅程/RLS 断言全链零改。
- **admin token 交接面（测试基建·非产品码）**：S3 路径现无 `E2E_ADMIN_TOKEN`（§0.3 亲证）——**须补 UI 路径 admin 身份播入+env 交接**：镜像 e2e-recruiter-gate C1 形制（seedAdmin 幂等直插+HMAC 铸 token+spawn env 并入），落点=`scripts/run-e2e-ui.mjs`（AUTH_SECRET 测试键与 playwright spawn 单点在握）或 isolated wrapper `e2e:ui` target——**落点=EXEC 裁决**·双审可挑战·挑战须附等价 fail-closed 论证（pre-exec R4 登记·R2'：落点宜循 e2e-recruiter-gate C1 定谳理由=`run-e2e-ui.mjs`·建议性登记不改 EXEC 裁决权）；**缺 token 即 throw**（照 `adminHeaders` `:78-82` fail-closed 先例）·Ban 静默跳过审批步·Ban mock。

### ③ 红③ 甄别设计（本刀零改断言·`apps/web/e2e-ui/stream-window.spec.ts` 只读）

- **证据物保全（pre-exec R2 登记·EXEC 立项第一步）**：attempt2 红③ 三证据物 `trace.zip`/`error-context.md`/`test-failed-1.png` 现存**主工作区 untracked 面**（`apps/web/test-results/` 下 stream-window silent variant mobile 失败目录·现存无 hash pin·有被后续跑覆盖/清理的灭失风险）——EXEC 第一步须对三物 `shasum -a 256`+判读结论落本刀自家收据（先 pin 后甄别·防证据失效）；只读跨界边界由协调方明示（**协调方现授权该只读取证**·主工作区该目录只读·零回写零搬移）。
- **零成本先行（无跑甄别）**：attempt2 已留 `:60` mobile 失败 trace.zip/error-context.md（`playwright.config.ts:19` `retries: 0` 无洗绿面·`:24-25` `trace: 'retain-on-failure'`+screenshot only-on-failure·附件在工作区 `apps/web/test-results/` 待裁·00-summary:52）——读失败时页面终态快照判：滞留 /login（signup server action 未完成/回错误态）vs 跳他处（redirect 竞态）→ 定时序 vs 语义方向。
- **隔离重验（opt-in 既有钩·零新开关）**：`E2E_UI_GREP='silent variant'` + `E2E_UI_PROJECT=mobile`（`run-e2e-ui.mjs:197-198` 亲证 opt-in 聚焦钩·不能扩默认套件）隔离连跑 **×3**——三红 → **真红面定谳**（登记另刀·断言/基建处方归后续刀）；三绿 → **时序面定谳**（连三跑 receipts 如实记账·不改本 spec 任何字节）。
- **Ban**：本刀禁改 `:42` 窗口/禁加 retry/禁 test.skip/禁以甄别重跑冒充套件绿证（甄别=诊断·套件验收仍以 §2 标准全跑为准）。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin）

1. **S1 深跑过 ：344 位**：`pnpm e2e:isolated` EXIT=0·全卷 70 位中**非 capability 门控 64 位**全行使（70−OCR 4−语音 2·门控位照 ledger ⊘ 披露 skip≠pass）·仪器牙=`assertionCount` **≥ 显式下界（EXEC 立项按 attempt3 基线 64 定）**+reviewLedger capability 类**恰 2 记录**（`image_ocr_unavailable`+`voice_unavailable`）·**无新增 skip 类记录**·`:344` 位新两步断言绿——:344 后 15 位首行使结果逐位如实入收据（新红照 E5 登记不洗·不构成本刀 FAIL 隐瞒面）。
2. **S3 两 spec 绿**：`pnpm e2e:ui:isolated` EXIT=0——recruiting-bound chromium+mobile 双绿（含审核门三拍+approve 后旅程全链）+ stream-window **三用例六面**（`stream-window.spec.ts` `:9`/`:46`/`:60` × chromium+mobile）全绿。
3. **断言力 ≥3（禁 skip-as-pass）**：红① 区新增/随演断言 ≥3（202 trial 生效 + trial 耗尽 −1 + 402 错误映射）；红② 新中间态断言 ≥2（审核文案可见+零跳转/零 cookie·approve 后 `waitForURL /recruiter/jobs` 恢复行使）；全刀**零新增 test.skip·零断言删除**（原 ：344 402 断言逐字保留·仅前提诚实化）。
4. **红③ 甄别产物二值如实**：三跑甄别收据（含 attempt2 既有 trace 读判结论）入卷——复现/不复现两向都登记·零改 spec 字节（`git diff apps/web/e2e-ui/stream-window.spec.ts` 空）。
5. **markers=0（§7）+ est live>0 如实申报（§6）双声明入收据**；冲突标记门（`grep '^<<<<<<< \|^=======$\|^>>>>>>> '` 全仓 staged+工作树=0）；EXEC 收据须载 00-summary `:57` 同形「非绿项=capability 跳过 ×N」披露行（pre-exec 席2 处方3·与 §2-1 reviewLedger 恰 2 记录仪器牙闭环）。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零改**：apps/api / apps/worker / packages 全域零 diff——红①②修法全落 e2e/helpers/spec/runner 面；**0154/0155 语义零动**（迁移文件+`packages/db/sql/23_api_gateway.sql` 镜像+网关函数体零字节——trial 赠与与审核制为已决产品语义·本刀只随演）。
2. **OCR/语音 capability 跳过面不动**：DASHSCOPE_VISION/TTS/ASR unset → `⊘ skipped` + capability ledger 照记（live-rerun 非绿项清单口径照旧·非缺陷红）。
3. **DASHSCOPE Key 缺面不动**：不造 key 不伪造 provider 面（e2e 假服务开关禁令照旧）。
4. **红③ 断言本刀零改**（§1-③·甄别结果驱动后续刀）。
5. **S2 性能门零触**（首跑基线绿·34 断言）；e2e-recruiter-gate 已收口面（run-e2e.mjs C1/adminHeaders/full.e2e.ts 审批步）零重做零回退。
6. **SSOT 只读**：execution-master-checklist / product-campaign-LEDGER / issues-master 行与统计零改（引用只读）。
7. **零迁移零新库表**；零 secrets 入库（`E2E_ADMIN_TOKEN`/`MODEL_API_KEY` 仅进程 env 运行时态）。

## §4 依赖

- **立项/EXEC 码面依赖：零硬闸**——红①② 触面文件（full.e2e.ts / recruiting-bound.spec.ts / run-e2e-ui.mjs）现主线在握·可即期 EXEC 立项。
- **复验 LIVE 面协议（照 live-rerun-2026-10-11 收据条款·照写）**：跑 `e2e:isolated`/`e2e:ui:isolated` 真供应商面须 **`MODEL_API_KEY` 只经 loader（`~/.meetwise-secrets/load-model-api-key.sh`）source 注入进程环境** + **`E2E_SKIP_DOTENV=1`**（已落码钩·防仓根 .env 残留物回灌：worker `model_cost_invalid_model_backup_billing_model`/privacy ECONNREFUSED 两道闸 00-summary 仪器链 :16 定谳=.env 残留物非产品红）+ **禁 .env 回灌**（禁临时 mv 复活形——S2 attempt5 `.env` 暂离形为该席授权特例·本刀不沿用；S1/S3 SKIP_DOTENV 钩形为准）+ 键值零打印零入卷。
- **pre-exec R5 登记（R3'）**：裸跑禁令——本刀验收与 LIVE 复验一律锁 isolated wrapper 口径（`e2e:isolated`/`e2e:ui:isolated`）·禁裸跑直呼 playwright/裸 `pnpm e2e` 冒充验收（绕 loader/`E2E_SKIP_DOTENV` 协议即同形违规）。
- **S3 attempt1 先例**：Playwright 浏览器二进制缺失=infra 崩 → `pnpm exec playwright install chromium`（纯环境装件零码动）可按「容器/网络崩重跑例外」行使·两次输出全档留证。
- 无前置刀·无跨工作树依赖（e2e-recruiter-gate 面已并主线·本刀只消费）。

## §5 Ban 列表 + pins（沿 diag-honesty 卷同源·逐字誊）

**Ban 列表**（diag 卷 §5 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green（红③ 甄别三跑=诊断设计·结果如实两向记账·禁充当套件绿证）；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 迁移越权（本刀零迁移）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 产品码改动（§3-1·api/worker/packages 零 diff）；Ban 0154/0155 语义变更（trial 赠与与审核制为已决产品语义·只随演不回改）；Ban skip-as-pass（零新增 test.skip·零断言删除·断言力只增不弱）；Ban 402 错误映射面失行使（原 :344 断言逐字保留·只许前提诚实化）；Ban 红① 两步间 abandon/释放第一场（§1-① 设计红线·还池自毁前提）；Ban 红① 共用 iv3 幂等键重放（duplicate≠不足）；Ban 审批步 mock/静默跳过（approve 走真 admin API·缺 E2E_ADMIN_TOKEN 即 throw）；Ban .env 回灌与键值打印/secrets 入卷；Ban 红③ 本刀改 spec 字节（含窗口放宽/retry/skip）；Ban 夸大淡化甄别结论（复现/时序两向如实）；Ban 以本刀 EXIT=0 宣称 LIVE 全绿（:344 后 15 位首行使新红面照 E5 如实登记）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（账面无实值记录照抄不翻·本刀 est live>0 见 §6——外呼消耗照 EXEC 收据另账如实记账·不冒充零消耗）

## §6 est live（>0 如实申报·照 G7Y 口径 ≤25 申报）

本刀复验须跑 LIVE 面：① `e2e:isolated` 深跑 ×1（S1 全旅程真模型·量级对照 live-rerun attempt3 WALL=115s 同形）② `e2e:ui:isolated` ×1（含 recruiting-bound 6 题真模型旅程 ×2 project + 红③ 甄别聚焦跑 ×3——聚焦跑 `E2E_UI_GREP` 单用例 silent variant 零真模型外呼【STRESS 源 guard-only 合成 SSE·`__e2e_stream_silent__` 非模型面】·外呼主体=e2e:isolated + e2e:ui 标准跑）。**est live ≤25（照 G7Y 口径上限申报）**·实耗超限或低于申报均照 EXEC 收据逐跑如实另账（不冒充·不预估入账）；零生产操作；secrets 面=loader 注入进程 env 运行时态（§4）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/e2e-assert-refresh-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 diag/h2/h3 卷同形制）。pre-exec 勘误席落卷后复检同门（改动集口径 grep EXIT=1 亲证·2026-10-11）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**登记建议（pre-exec 双审可核）**：本刀立项关联 LIVE 复跑采证卷 `receipts/live-rerun-2026-10-11/`（主线 `24e1adf3` 已入库）；红③ 甄别结论无论何向均建议回登 checklist 新红面台账行（本刀 SSOT 只读零触·登记归协调方/后续刀）。

## §9 nail 席登记（post-prove 双席 BOTH PASS·双席登记项随落·disposition/收据勘误节·2026-10-11）

**双席判决照登（互盲独立·2026-10-11）**：席1=实现核对+裁决授权链 **PASS**；席2=验收回归 **PASS**。loop 协调方本次派单即 nail 授权。

**席2 收据勘误四项（一行一项·收据实物零触·引名/计数/算术/锚位勘误·nail 席逐项实物复核后照登）**：
- **R-A 收据表文件名错位（final3/final2）**：EXEC 收据 §四「UI 全套 final2（验收终跑 18P/0F 绿）」引名错位——实物亲证 `s3-e2e-ui-isolated-final3.log` 方为终跑绿（18 passed·4.5m·EXIT 0），`s3-e2e-ui-isolated-final2.log` 实为 17P/1F 前跑（EXIT 1）——绿终跑实物在档·终值判定不变·引名勘误 final2→final3。
- **R-B 瞬态计数两枚非三枚**：EXEC 收据 §四/§七「三枚互不相同一次性时序红」计数漂——逐项枚举实为 **两枚**（progress chromium 徽标降级 ×1+golden chromium 冷启 ×1）·两枚口径为准·家族面定性不变。
- **R-C est 台账时长算术漂**：EXEC 收据 §五「S1 final4 ≈2.9m」勘误——机读终值 `machine-receipt-s1-final4-GREEN.json` durationMs=**119005ms≈2.0m**（nail 席实物亲证）·est 合计口径随此下修·低于申报结论不变。
- **R-D opt-in 钩锚 :226-227**：EXEC 收据 §七-5 引 `run-e2e-ui.mjs :197-198` 系基线锚——随本刀 runner 增行漂移·并后主线实测 `E2E_UI_GREP/E2E_UI_PROJECT` 在 **:226-227**（nail 席 grep 亲证）·钩本体零改。

**席1 登记项照登**：实现核对 PASS——EXEC 落码逐件对 §1 三件处方+裁 A 扩面（红① 最小变体/第 4 件 fixture/发现链 4-7）逐一在码核销·裁决授权链完整（pre-exec 双审→协调方派单→裁 A 三行→post-prove 双席互盲）·零新增勘误项。

**错峰登记**：本 nail 开工前探测并发 PTP nail 席（3025 件大迁移）——`merge(ptp-archive)` @`2cec48e8` 23:11:46 落主线（lock 释放+commit 可见双条件满足）后动手·PTP 触面与本刀 29 文件零重叠（merge-base 重算亲证）·预期零冲突实测达成（ort auto-merge·冲突 0）。**并发事故登记（PTP 席已自愈·如实）**：本席 merge 落卷后收尾窗口·PTP 席 amend 误落本席 HEAD（`77770356` 已弃·其卷 §9 内容改独立 commit `2ac0dae2`/`2f6662ef` 落卷·本席 merge `2b1f01a5` 原样在卷）；该恢复动作一度将本节首录未卷编辑回卷清失·本席复核后原样复录随 nail commit 落卷。nail 落卷沿独立 commit 先例（HEAD 已被推进·Ban amend/rebase 他席 commit）。

**nail 复验终值（并后主线态·LIVE 协议 loader+E2E_SKIP_DOTENV=1·est 另账）**：S1 `pnpm e2e:isolated` EXIT=0·assertions=**91**（≥64 门✓·EXEC final4=85 同套件并后 +6·无断言丢失）·capability ledger **恰 2**（image_ocr_unavailable+voice_unavailable）·skip 类记录 0·WALL 436s（`nail-e2e-isolated.log`）。UI `pnpm e2e:ui:isolated`：attempt1 **作废留档**（本席调度失误与 S1 并行负载互扰·5F 全为 mobile auth 20s timeout 同点·零语义断言红·沿 EXEC UI attempt1 孤儿污染作废先例·`nail-e2e-ui-isolated-attempt1-concurrent-void.log`）→ attempt2 顺序独跑 **EXIT=0·18P/0F/10S**（capability 门控预期内）·recruiting-bound 双 project 绿+stream-window 三用例六面全绿·WALL 203s（`nail-e2e-ui-isolated-attempt2.log`）·一次优先禁洗绿两跑全档留证。markers 门：code 域五类词 grep EXIT=1 亲证·全 diff 仅收据自指行 1 处如实登记；冲突标记 grep EXIT=1。

---

*E2E-ASSERT-REFRESH REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`24e1adf3` · 分支 `line/e2e-assert-refresh` · 工作树 `meetwise-e2ar` · 蓝本=receipts/live-rerun-2026-10-11（S1 红=0154_trial_bucket_grant 击穿 ：344·S3 前移=0155_recruiter_approval_gate·新红 stream-window:60 mobile 时序候选）+ 形制 diag-honesty-REQUEST（Ban/pins 同源誊录）· 三件=①红① 显式耗尽两步形（202 trial 生效+−1+402 逐字保留·禁 abandon 还池）②红② 审核门三拍（pending 中间态+真 admin API approve+approve 后登录恢复 waitForURL·UI 路径补 E2E_ADMIN_TOKEN 交接镜像 C1）③红③ 甄别设计（trace 读判+E2E_UI_GREP/PROJECT 隔离 ×3·零改 spec）· 产品码零改 · 0154/0155 语义零动 · est live ≤25（G7Y 口径·如实另账）· pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual · pre-exec 勘误落卷（席1 R1-R7 七登记+席2 §2 三处方·复审挂起·2026-10-11）*
