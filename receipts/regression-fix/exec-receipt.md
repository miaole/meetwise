# REG-FIX 交叉回归修复刀 · EXEC 收据（席 regfix-exec · 2026-10-11）

- 工作树 `/Users/miaole/Desktop/golucky/meetwise-regfix` · 分支 `line/regression-fix` · 任务书 rev2（`ai-docs/delivery/harness/regression-fix-REQUEST.md`·pre-exec 双席 PASS·协调方明示 EXEC 授权）
- 授权链：draft `518023a5` → rev2 `12fb5f80`（rebase 后新 hash）→ EXEC 席动刀
- rebase：`git rebase feat/mysql-schema-skeleton` → 主线 tip `20186718`（起草基线 44734d7f 已前移）·2/2 重放零冲突 · rebase 后 `518023a5`(draft)+`12fb5f80`(rev2)
- markers=0（改动集 diff grep 冲突标记计 0）· pins 十一值零翻转（唯一词面命中=`releaseEvidence=false` 值保持不变·4f 叙事行去「matrix stays gap」字样=mark-red→wired 过渡如实注记·矩阵行状态归矩阵刀职权）· est live=0（全部验收键离线本地：隔离容器/静态证明/进程内假客户端·零模型·零真实支付·零外网·零 secrets）· ⛔push（未 push）· ⛔动主线（未触）· ⛔触其他工作树（未触）

---

## 一、rebase 漂移表（起草基线 44734d7f → 实树 tip 20186718·逐锚实值核对）

漂移源三件：**H4 R2②**（focus 入题链·interview.service/controller）、**B271 片3 P4**（开票 select 下拉·RechargeForms）、**G3 文案断言**（public-copy.proof TC-PUBLIC-COPY-G3 插入）。全部为字符串/regex 锚定位法可免疫之行漂·按 §5.6 方法逐锚实值核对：

| 锚 | rev2 行引（@48edea81） | 实树实值 | 影响 |
|---|---|---|---|
| `beginInterviewCore` 起 | :80 | **:96**（H4 normalizeFocusHeader +16 行插入） | 无（indexOf 锚） |
| `export class InterviewService` 止 | :257 | **:279** | 无（indexOf 锚） |
| 组2/4a/4b 区域锚 | — | 同域切片成立·S1-S10 十锚全过（node 模拟亲证） | 无 |
| 4c 八锚（service） | :114/:124/:130/:145/:148/:182/:230/:245 | **:132/:142/:148/:163/:166/:200/:248/:267** | 无（4c 主案=形状锚·唯一命中 helper 区域 scoped·八锚零/多命中即红·本地快验全 true） |
| 4c 404 行首谓词 | :124 唯一命中 | 区域内 :114 单行 if+throw（`^\s*throw` 不命中）+ :142 独立 throw（唯一命中）·:61 :313 :406 :439 :579 全在区域外 | §5.1 收紧成立 |
| 4c preBound 窗 | 实参 `[sourceQuizId, quizScope.value]`/`[id]` | 窗长 4998·零 resumeId 绑定 ✓ | 无 |
| RechargeForms import | :11 | **:11 不漂**（片3 P4 diff 只及 InvoiceRequestForm） | 无 |
| public-copy E8 块 | :187-195 | **:205-213**（G3 插入 18 行）·`:42` billingAction read 不漂·守卫零字节改动成立 | 无 |
| 组3 链头 | rev2 亲证 `applied=159/159 last=0157` | **`applied=163/163 last=0160_level_policy_version`**（主线 h3 落 0160·before 探针亲证） | **硬钉 0157 备案若取即复刻红**·主案动态链头锚判定实证 ✓ |
| 4a/4b/4d 区域锚行引 | :61-62 / :58-59 / :253-254 | 实值同（proof 文件无漂） | 无 |
| 4e beginSignature/beginRegion 函数体 | :38-48 | 实值同 | 无 |
| 4f S1 体 | :39-58 | 实值同 | 无 |
| **EXEC 席新发现（rev2 未见）** | — | `apps/web/test/web-logic.proof.ts:1519-1520`（片3-4d）静态 `readSrc('app/billing/actions.ts')` 断言 409/403 面——组1 迁出必致失配·而 §2 旁证要求 `pnpm -C apps/web prove` 基线零伤 | 锚随迁（组1 允许修法类）·详情 §三.1 |

组4 行引微瑕四条（§5.6）均按实值执行·零停止条件触发。

## 二、六组逐条落卷（file:line）

**组1 · E8 域归位**
1. `apps/web/app/recruiter/billing/actions.ts` **新建**（68 行·三企业 action `createOrderAction`/`saveInvoiceProfileAction`/`submitInvoiceRequestAction`+头注+imports 自 `apps/web/app/billing/actions.ts` **逐字随迁**·`cp` 保字节）
2. `apps/web/app/billing/actions.ts` 恢复封闭 stub（@ab420f61^ 原形逐字：`createOrderAction(productId)` 拒绝形+「预览环境未开放订单、支付或额度购买。」逐字）+2 行域归位注记（**注释零 `serverFetch(` 零 `/commerce/orders` 词元**·§5.4 EXEC 注意核查过）
3. `apps/web/app/recruiter/billing/RechargeForms.tsx:11` import → `@/app/recruiter/billing/actions`（全仓唯一运行时消费者亲证）
4. `apps/web/test/web-logic.proof.ts:1518-1520` 片3-4d `readSrc('app/billing/actions.ts')`×2 → `'app/recruiter/billing/actions.ts'`（EXEC 席新发现·锚随迁·断言体零改·仅路径+标签注记）
5. 守卫 `apps/web/test/public-copy.proof.mjs` **零字节改动**（:42 file-scoped read·E8 forbid/requireText 自然过）

**组2 · GODFN-1c 锚更新**：`apps/api/test/godfn-1c-begin-guard-merge.proof.ts:44-48`（原 :45-46）区域锚 → `svc.indexOf('export async function beginInterviewCore(')` 起 · `svc.indexOf('export class InterviewService', bStart)` 止 + 头注随演注记（S 层 begin region=beginInterviewCore 模块体）·**S1-S10 断言体零改**

**组3 · entpay:s1 动态链头锚（主案定值 §5.2）**：`apps/api/test/enterprise-pay-s1.proof.ts:47-58`（原 :47）`const appliedSet=new Set(first.applied)` + `chainHead=manifest[manifest.length-1]?.version ?? ''`（空 manifest `?? ''` fail-closed）+ 0156/0157 双在链 Set 面 + **可选硬化顺手采**：`chainFullOrder=manifest.every((m,i)=>m.version===first.applied[i])`（§5.2 非绑定全序逐位对比）·头注 :13 与 S1-0 断言名随注「0001→当前最大号（动态链头锚·现 0160）」

**组4 · uc025 六键**
- 4a `uc-e2e-025-nhp-fault.proof.ts`：:61-64 区域锚→beginInterviewCore/InterviewService + :68 S1 正则 → `/\.begin\([^)]*\bquizId\b[^)]*\)/`（#259 targetRole 第 6 参注记）+ :99-102 negBlockIntact 冻结清单 regex 随演合并查形 `/SELECT q\.status, q\.expires_at[\s\S]{0,240}FROM\s+resume_quiz\s+q/`（NOTE-only 不进 EXIT·防假 NOTE）·S2-S6 断言体零改
- 4b `uc-e2e-025-nhp-bound.proof.ts`：:58-63 同锚 + :65 S1 同正则 + :90-92 negBlockIntact 同随演 · S2-S6 零改
- 4c `uc-e2e-025-nhp-adv.proof.ts:277-306`（原 :277-298）**形状锚主案**：at(N) 行位机制废除 → `uniqueHit` 唯一命中定位 helper（regionLines=beginInterviewCore→InterviewService 行切片·恰一命中方过）·八锚语义目标不变·404 锚=行首谓词 `/^\s*throw new HttpException\(\{ error: 'not_found_or_forbidden' \}/`（§5.1 收紧·区域唯一命中 :142）+ preBound 窗 bStart→beginInterviewCore 锚（A3-b 语义保留）
- 4d `uc-e2e-025-nhp-fault-isolated.proof.ts:251-255` 区域锚同 4a/4b 形 · 两 PIN 断言体零改
- 4e `uc-e2e-025-nhp-neg.proof.mjs:38-56`（原 :38-48）括号截断 quirk 修：`beginSignature(src,label,anchor)` 锚起+`'\n  }'` 体止（ctrl=`begin(@Param`·svc=`begin(principal`）·`beginRegion` 4500 定窗废除→beginInterviewCore→InterviewService 端锚切片 · STALE_THROW_RE/realReject 零改（ROW_STILL_GAP 注记照旧=诚实设计）
- 4f `uc-e2e-025-stale-quiz-expiry.proof.mjs` **翻转 wired**（按自带 PRODUCT_SURFACE 设计）：头注 supersession 注记·S1→`begin-quiz-input-wired`（controller `@Headers('quiz-id') quizId?`+转发·service begin/beginInterviewCore 可选 sourceQuizId）·S3→`stale-reject-wired-in-begin-core`（锚改端锚切片·match 替代 doesNotMatch·NEG 先行序断言）·S4→`begin-queries-resume-quiz-owner-scoped`（恰一条 3→1+owner 谓词）·G→`wired-realReject-gap-retired`（realReject 断言·四条 GAP 虚称行退役）·尾账 honesty 分支 wired 化 · `ai-docs/delivery/harness/uc-e2e-025-stale-quiz-expiry.md` 追加 §6 supersession 注记（append-only）

**组7 · fixture 合规化（含深层围栏随演·详见 §四）**
1. `packages/db/test/recruiter-depth.proof.ts:47-64` 历史练习事件 payload → hash 形 `{questionId,stateVersion:1,answerId:randomUUID(),answerHash:'d'.repeat(64),competency:'并发',score:99}`（raw 答文摘除·0126 围栏合规·同 completeBound 在用形·score 99 语义保留）
2. `packages/db/test/runtime-role.proof.ts:33-45` interview_job 种子 `asPrincipal(admin,'role-user-a',…)` 包裹过 0058 门 + **v64 形种子链**（0064 深层）：user_account 前移 → resume(ingested·epoch=1·uuid 字面) → interview 'runtime-a' 绑 resume 引用 → start job 携 resume_id+epoch（reference_schema_version 默认 64）·runtime-b/后续 gateway_dispatch/RLS 断言面零改
3. 同文件 setup :35-51 **路由决策种子链**（R2 P-START 深层）：jobA 的 `job_semantic_revision`(rev1·hex64 digest/hmac·route_decided)+`job_route_decision`('route_decided'/'result_validated'/'v1'/单叶 backend/nodejs 10000bps/conf 10000/margin 1000/零 reason_codes/decision_hash hex64·0104 CHECK 全合规形)·以 owner 身份 `asPrincipal(recA)` 过 FORCE RLS（job-route-decision.proof `tryRawDecided` 先例形）·jobB 无 application 零需
4. 同文件 ⑦ 段断言随演至 0082 校准 hold + I2 W1 held 门现行契约（§四.3）

**组8 · 脱敏+dotenv 钩**
1. 8a `e2e/full.e2e.ts:63` `text MODEL_API_KEY ≠ vision` → `text model key ≠ vision`；`:158` `text MODEL_API_KEY ≠ voice` → `text model key ≠ voice`（叙事逐字保留·守卫零触·豁免登记方案不取）
2. 8b `scripts/run-e2e.mjs:16-27` 与 `scripts/run-e2e-ui.mjs:23-34` dotenv 回灌块加 `if (process.env.E2E_SKIP_DOTENV !== '1')` 包裹（默认零变）+ `scripts/g6-e2e-iso-blocked.proof.mjs:243-246` spawn env 注入 `E2E_SKIP_DOTENV:'1'`（与 delete MODEL_API_KEY 并用）·SECRET-RUNNER_WITHHOLD 三标记零涉
3. §5.5 现态注记：仓根 `.env` 本席复核不存在——before 基线 g6 即 EXIT=0（宿主无 .env 形态下门自然达）·钩使门在任何宿主形态（.env 复活亦不静默绕门）确定化

## 三、14 键 EXIT 前后对照（300s/键帽·全键亲跑留痕·日志 receipts/regression-fix/{before,after}/）

| # | 键 | before | after | 组 |
|---|---|---|---|---|
| 1 | `pnpm -C apps/web prove:public-copy` | **1**（E8 :207 命中三 action） | **0** | 组1 |
| 2 | `pnpm -C apps/web typecheck` | 0 | 0 | 组1 旁证 |
| 3 | `pnpm -C apps/api prove:begin-guard-merge` | **1**（S0-S10 全 FAIL·FROM resume_quiz count=0） | **0**（30 PASS） | 组2 |
| 4 | `pnpm entpay:s1:prove` | **1**（S1-0 FAIL·applied=163/163 last=0160） | **0** | 组3 |
| 5 | `pnpm uc025:nhp-adv:prove` | **1**（八 PIN 全 FAIL·行锚漂） | **0** | 组4c |
| 6 | `pnpm uc025:nhp-bound:prove` | **1**（S1-S5 FAIL） | **0** | 组4b |
| 7 | `pnpm uc025:nhp-fault:prove` | **1**（S1-S5 FAIL） | **0**（15 PASS） | 组4a |
| 8 | `pnpm uc025:nhp-fault-isolated:prove` | **1**（2 PIN FAIL） | **0** | 组4d |
| 9 | `pnpm uc025:nhp-neg:prove` | **1**（GAP-UC025-NEG-01·acceptsQuiz=false） | **0**（acceptsQuiz=true realReject=true·PASS 路） | 组4e |
| 10 | `pnpm uc025:stale-quiz-expiry:prove` | **1**（S1 FAIL·mark-red） | **0**（S1-S4+G 五 PASS·wired 过渡） | 组4f |
| 11 | `pnpm recruiter:prove` | **1**（interview_event_raw_answer_fenced） | **0**（39 PASS/0 FAIL） | 组7 |
| 12 | `pnpm runtime-role:prove` | **1**（interview_privacy_fenced） | **0** | 组7 |
| 13 | `pnpm e2e-platform:prove` | **1**（secret-redaction :63/:158 log_leaks_secret） | **0**（5 guards） | 组8a |
| 14 | `pnpm g6-e2e-iso-blocked:prove` | 0（宿主现态无 .env·§5.5） | **0**（钩后 determinized·两 behavior PASS） | 组8b |

**旁证 4 面（对照基线原值·零伤）**：
- `pnpm neg:interview`：**97 PASS / 0 FAIL**（前后同·基线 97 ✓）
- `pnpm interview:prove`：**57 PASS / 0 FAIL**（前后同·基线 57=主线 H4 后现值 ✓）
- `pnpm -C apps/web prove`：**353 PASS / 0 FAIL**（前后同·含片3-4d 随迁锚 PASS ✓）
- `pnpm -C apps/api prove:uc001-nhp-fault`：before/after **EXIT=1 同为 infra 红**（`database_config_invalid:database_target_missing`·清单外归 0 BUG 门后）·FAIL 集指纹 **md5 efb637b8248f889fc2bc6e1ee8c34909 前后逐字节同** = 零新 FAIL 面 ✓

**红项对账（禁 skip-as-pass）**：14 键全绿非 skip——组3 S1-0 断言本体保留（动态锚改形非跳过）·组4f G 分支按自带设计翻转走 realReject 断言（活证指 nhp 四键）·组7 深层围栏全数正面满足（种子合规非绕门·围栏零弱化）·g6 行为门两 runner 实跑非零退出+`live_provider_key_missing` 断言行使。

## 四、组7 深层围栏账（EXEC 席实证·rev2 未见的层叠面）

任务书处方（两 fixture 首层）落卷后，两键仍红——首层围栏（0126 raw answer / 0058 privacy）之下还有未行使过的深层围栏（矩阵探针时点 proof 在首层即死·下层从未达）。逐层溯源（migration 亲读）与处置：

1. **web-logic 片3-4d 锚**（组1 面）：`web-logic.proof.ts:1519-1520` 静态读旧路径——锚随迁（§二.1.4）。
2. **recruiter 三层**：0126 raw-answer 围栏（处方已过）→ **R2 P-START 真拒启**（`startApplicationInterview` 要求 job_route_decision route_decided·无决策全 20 路 `interview_ineligible_route`→boundId undefined→0059 locator 22023）→ 种子链补 0104 合规 route_decided（§二.7.3）→ 过。
3. **recruiter ⑦ 段契约随演**（断言类·零产品码）：现契约=**0082 校准 hold**（`finalize_bound_job_application_on_interview_completion` REPLACE 0051 形——application 绑定面试 completed 即无条件 `assessment_unavailable`+score NULL）+ **I2 W1 held 门**（assessment_unavailable+绑定面试 completed → `application_held_not_retryable`）+ markApplicationNoEligibleScore 幂等 replay。⑦ 原断言写于 0051-era 流（完成→in_progress→手动 mark→重试开 attempt=2）·与现契约结构性失配（该段自 initial commit 起从未在现链下行使——B110 收据已证 recruiter 红预存）。按组纪律「断言更新至新契约语义·非 skip-as-pass·诚实门零弱化」改写：完成自动收口 hold 断言（不伪造 0 分·不标 completed·意图保留）·mark=replayed 零二次迁移·20 路重试全拒 held+completed 旧会话不复活不新增 attempt（**新断言严于旧**：由「可重试」改「拒复活」）；评分防伪探针同意图换形（0082 下 completed+score 在场不可达→探针改「恢复 completed+score 必拒 + hold 行 score 改写必拒」·`job_application_score_calibration_required`/`score_immutable_until_calibrated` 双门正面行使）。前轮 once :201 读到 in_progress 的异象如实注记：本轮起 :201 断言钉死 0082 契约值，异象若复现即诚实红（无静默面）。
4. **runtime-role 双层**：0058 privacy（处方已过）→ **0064 v64 形**（start job 必须 resume_id+resume_privacy_epoch 与 interview 绑定一致·`interview_job_start_resume_epoch_required`）→ v64 种子链补齐（§二.7.2）→ 过。

## 五、停止条件核查（三查·未触发）

1. **锚点重定位失败**：无——全部锚点（含 H4/片3/G3/0160 漂移后实值与 §5.6 微瑕行引）重定位成功并逐锚亲证。
2. **某键转绿需改产品码**：无——组7 深层围栏全部 fixture/断言面收口（种子合规+断言随演），产品码 `git diff` 零触（唯一产品文件移位=组1 actions.ts 域归位·任务书 §4.3 明示唯一允许）。
3. **修法越类**：无——全部改动∈{断言,锚,fixture,脱敏,钩}∪组1 域归位∪4f harness 文档注记；真产品红 5 项零触·预存红全账零触（uc001 指纹同）·组5/组6 零触。

## 六、总账

- 改动集：18 文件改 + 1 新建（`apps/web/app/recruiter/billing/actions.ts`）+ 收据目录 + REQUEST 状态行 append（append-only）
- 14 键全 EXIT=0 · 旁证 4 面基线零伤 · markers=0 · pins 十一值零翻转 · est live=0 · 零 secrets
- STOP→`executed:awaiting_post_prove_dual`（REQUEST 状态行 append-only）
- ⛔push · commit author=`regfix-exec <exec@meetwise.local>` · alone≠dual · prove EXIT=0 ≠ DONE
