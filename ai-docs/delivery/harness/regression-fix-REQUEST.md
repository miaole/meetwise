# REG-FIX · 交叉回归修复刀任务书（起草席·门3 0 BUG 工作面）

- 起草席：regfix-draft · STOP=**draft:awaiting_pre_exec_dual**（pre-exec 双审会签前零 EXEC·零动码面）
- 基线：`feat/mysql-schema-skeleton @ 44734d7f`（主线最新 tip·git log -1 亲证）· 分支 `line/regression-fix` · 工作树 `/Users/miaole/Desktop/golucky/meetwise-regfix`
- 蓝本：`ai-docs/delivery/harness/mainline-regression-matrix.md`（@44734d7f · §2 新增红清单 8 组 20 键）
- 范围：8 组中**组5（DIR-B2×runner 收据清单·88ffef5c+2136ad86 已修·双向实证在案）与组6（UNSTUB×neg:auth/隐私域·设计内过渡·c9200502 自述「检查器断言零触碰·nail 期才翻」）出范围零触**；修剩余 **6 组 13 键**（组1×1 / 组2×1 / 组3×1 / 组4×6 / 组7×2 / 组8×2）
- 总纪律：每组修法=**断言/锚/fixture/harness 更新至新契约语义**（非行为回退·非 skip-as-pass·诚实门零弱化）；每组 EXIT 转绿验收命令具名（§2）
- 范围外（本刀零触）：真产品红 5 项（neg:input 3×500 / turn-idempotency 3 FAIL / resume-reference 5 FAIL / scoring-integrity TypeError / stress 0 评估）**归 0 BUG 门后刀**；§3/§4 预存红清单**全部零触**（r4 族 28 / db 族 6 / honesty 6 / porcelain 7 / 断言 11 / ENV-BARE 11 / neg:input 3）
- est live=0（全刀零模型外呼·零真实支付·零云调用）· pins 十一值零翻转（§3）· markers=0 · **⛔push** · alone≠dual

---

## §1 六组逐组修法（红证亲读 + 机制实证 + file:line 修法）

### 组1 · ENTPAY片1×public-copy E8（键：apps/web:prove:public-copy）

**红证（亲读）**：`apps/web/test/public-copy.proof.mjs:189` `forbid(billingAction, ['serverFetch(', '/commerce/orders'], 'billing action')` 命中 `apps/web/app/billing/actions.ts:3/17/41/57`（ab420f61 13:44 片1 企业充值接线·三 action 全走 `serverFetch('/commerce/...')`）。

**机制实证**：E8 制度语义=**C 端公开计费面封闭**（:188 forbid billing page `serverGet(/BuyButton/¥)` + :189 forbid action commerce 面 + :190 requireText 拒绝文案「未开放订单、支付或额度购买」+ :194 BuyButton 必须不存在）。片1 企业充值=**B 端 recruiter 域**能力（页面已在 `apps/web/app/recruiter/billing/`·action 全部 `revalidatePath('/recruiter/billing')`·`ent_` 前缀门）。B271 处方 S1-C8（REQUEST :76）钉的是「`billing/actions.ts:4-7` createOrderAction 写死拒绝」的**拒绝形**与「C 端 pricing/billing 面零触」——非强制企业接线驻留 C 端目录。片1 落卷时 E8 未复跑（其 prove 面=entpay-s1 48 断言）=刀间盲区。

**裁定（修法 b·改调用形/域归位）**：禁词清单豁免登记会在 fail-closed 诚实门上开洞（守卫文件编码产品域知识·零取）；按制度原文「公开面封闭、B 端域自治」（同仓惯例 `apps/web/app/recruiter/jobs/actions.ts` 先例·E9 已读该域 actions）：

1. `apps/web/app/billing/actions.ts`（现 69 行）三企业 action（createOrderAction:9-34 / saveInvoiceProfileAction:37-51 / submitInvoiceRequestAction:54-68）**整体迁出** → 新文件 `apps/web/app/recruiter/billing/actions.ts`（`'use server'` + revalidatePath import 随迁·函数体逐字节）；
2. `apps/web/app/billing/actions.ts` 恢复封闭 stub（@ab420f61^ 原形逐字·拒绝文案逐字保留）+ 一行注释注记企业 action 已归 recruiter 域；
3. `apps/web/app/recruiter/billing/RechargeForms.tsx:11` import 更新 `@/app/billing/actions` → `@/app/recruiter/billing/actions`（全仓唯一消费者·亲证）；
4. 守卫 `public-copy.proof.mjs:187-195` **零字节**。

行为面：server action 模块路径变更·签名/返回形/RPC 合同零变·零行为差。**验收**：`pnpm -C apps/web prove:public-copy` EXIT=0 + `pnpm -C apps/web typecheck` 清洁。

### 组2 · ENTPAY片2×GODFN-1c 静态清单（键：apps/api:prove:begin-guard-merge）

**红证（亲读）**：S0-S10 全 FAIL（`FROM resume_quiz count=0`）；R1-R10 行为面全 PASS。

**机制实证**：5ff5f96d 片2 将 begin 事务体模块化抽取为 `beginInterviewCore`（`apps/api/src/modules/interview/interview.service.ts:72-80` 注释亲证「逐字搬移」）；静态层 `godfn-1c-begin-guard-merge.proof.ts:45-47` 仍以 `begin(principal`/`turn(principal` 切区域——现命中 :357 **薄委托方法**（3 行体·零守卫码）→ 区域内 resume_quiz 计数=0。行为面（合并单查/抛序/3→1 计数）由 R 层亲证未坏=**纯静态形状断言失配**。

**修法（静态锚更新至新形状·断言体零改）**：`godfn-1c-begin-guard-merge.proof.ts:45-47`：
- `bStart = svc.indexOf('begin(principal')` → `svc.indexOf('export async function beginInterviewCore(')`
- `bEnd = svc.indexOf('turn(principal', bStart)` → `svc.indexOf('export class InterviewService', bStart)`

新区域（:80-249）内 S1-S10 十锚全数亲证在位：resume_quiz 恰 1（:118）/合并列 regex（:113-118）/抛序 404:124→stale:130→missing(NULL):134→NaN:137→bound:148/查询先于三抛/bind:170·reserve:230·enqueue:245 全在 bound 后/三码共存/S10 `quizExpired = quiz.rows[0].expires_at != null`（:127）。R 层零触。头注 S 层描述随注（begin region=beginInterviewCore 模块体·B271 片2 后形状）。**验收**：`pnpm -C apps/api prove:begin-guard-merge` EXIT=0。

### 组3 · ENTPAY片2×entpay:s1 部署车判据（键：root:entpay:s1:prove）

**红证（亲读）**：S1-0「真迁移链 0001→0156 全量应用+重跑幂等（部署车）」FAIL；探针输出 `applied=159/159 last=0157_billing_payer_route rerun_skipped=159`——幂等本身绿·纯终值锚过期（片2 0157 落链后片1 判据终值 `=== '0156_enterprise_bucket_billing'` 失配·双轮确定性复现）。

**修法（主案·漂移免疫动态链头锚+双在链面）**：`apps/api/test/enterprise-pay-s1.proof.ts:47`：
```ts
const appliedSet = new Set(first.applied);
const chainHead = manifest[manifest.length - 1]?.version ?? '';  // loadMigrations 排序末位=当前最大号(migrate.ts:306 形)
const lastOk = last === chainHead
  && appliedSet.has('0156_enterprise_bucket_billing')   // 片1 判据本体:企业桶迁移在链
  && appliedSet.has('0157_billing_payer_route');        // 片2 扣费路由在链(今日新增面·防链截断)
```
断言名与头注 :13/:61 随注「0001→当前最大号（现 0157）」。备案（保守替代·留 pre-exec dual 裁定）：硬钉 `last === '0157_billing_payer_route'`——下一迁移落地即再漂，不推荐。**验收**：`pnpm entpay:s1:prove` EXIT=0。

### 组4 · begin 契约×uc025 族 6 键（quiz-id 转发/负门锚漂移·双因=片2 抽取+e0208e9f ROLE#259 targetRole 头）

**红证（亲读 /tmp/regm 六键日志·完整 FAIL 清单）**：nhp-adv 9 FAIL（:196/:206/:212/:227/:230/:264/:304/:312 行锚+preBound 窗）/ nhp-bound S1-S5 / nhp-fault S1-S6 / nhp-fault-isolated 2 PIN / nhp-neg GAP-UC025-NEG-01 / stale-quiz-expiry S1。行为 R 层桩已是合并形状（nhp-fault:139/nhp-bound:129 亲证）=语义未坏·断言随演滞后。

**双因实证**：(a) 片2 抽取后 `begin(principal` 锚（各 proof 现命中 :357 薄委托体）区域失守；(b) ROLE#259 后 controller 转发形 `.begin(req.principal, id, resumeId, req.reqId, quizId, targetRole)`（interview.controller.ts:28 亲证）——`\.begin\([^)]*quizId\s*\)` 要求 quizId 末位·失配；另 `begin\s*\([^)]*\)` 括号截断 quirk（止于首 `)`·ctrl 侧仅得 `begin(@Param('id')`）致 nhp-neg `acceptsQuiz` 假阴性。

逐键修法（断言更新至新契约·零行为回退）：

| # | 键 | file:line | 修法 |
|---|---|---|---|
| 4a | uc025:nhp-fault | uc-e2e-025-nhp-fault.proof.ts:58-59 区域锚→`export async function beginInterviewCore(`起·`export class InterviewService`止；:68 S1 正则→`\.begin\([^)]*\bquizId\b[^)]*\)`（quizId 在 begin 实参表内即持·第 5 参/共 6 参随 #259 注记） | S2-S6 断言体零改（FAULT 抛:134/137·合并读:113-118 先行·bind:170/reserve:230/enqueue:245 后置·无吞 catch·三码共存·新区域全亲证）；:99-102 negBlockIntact **NOTE-only** 冻结清单 regex 随演至合并查形（不进 EXIT·防假 NOTE） |
| 4b | uc025:nhp-bound | uc-e2e-025-nhp-bound.proof.ts:59-60 同锚；:65 S1 同正则更新 | S2-S6 零改（bound 抛:148·pin 读 regex 合并 SQL:113-121 命中且先行·S6 读 0061/sql20 文件零涉）；:92-94 NOTE 同 4a 随演 |
| 4c | uc025:nhp-adv | uc-e2e-025-nhp-adv.proof.ts:285-292 八行锚+:293-296 preBound 窗 | **主案=形状锚**：`at(N)` 行位机制改唯一命中定位 helper（8 锚语义目标不变：merged SELECT/404/stale/toLowerCase/mismatch/bind-owner `r.owner_user_id=$2`/reserve/enqueue·各 regex 原样）——本日已二漂（文件内自证「预存红根因①重钉」），第三次重钉仍必漂；**备案=重钉现 tip 行号** :114/:124/:130/:145/:148/:182/:230/:245（已亲证·留 dual 裁定）。preBound 窗 bStart→beginInterviewCore 锚（A3-b 语义保留：守卫窗内零 resumeId 绑定·实参 `[sourceQuizId, quizScope.value]`/`[id]` 亲证） |
| 4d | uc025:nhp-fault-isolated | uc-e2e-025-nhp-fault-isolated.proof.ts:253-254 同区域锚 | 两 PIN 断言体零改（NEG:130<FAULT:134<BOUND:148 序✓·FAULT 抛 regex✓） |
| 4e | uc025:nhp-neg | uc-e2e-025-nhp-neg.proof.mjs:51-54 beginRegion 锚同上（4500 定窗废除改 end 锚切片）；:45-49 beginSignature 抽取改 sibling 同形（ctrl=`indexOf('begin(@Param')`起·`'\n  }'`止；svc=`indexOf('begin(principal')`起同止） | STALE_THROW_RE/realReject 零改（core 内 stale_quiz 抛点:130✓）→ acceptsQuiz✓&&realReject✓→PASS 路 EXIT=0（ROW_STILL_GAP 注记照旧=诚实设计） |
| 4f | uc025:stale-quiz-expiry | uc-e2e-025-stale-quiz-expiry.proof.mjs:39-52 S1 翻转至已接线契约（controller begin 收可选 `@Headers('quiz-id') quizId?`+转发·service begin 可选 sourceQuizId·断言名随改 begin-quiz-input-wired）；:70-94 S3/S4 锚改 beginInterviewCore 后**语义翻转**（begin 核心现抛 stale_quiz（NEG 先行）·现单查 owner-scoped resume_quiz——match 替代 doesNotMatch）；:95-130 G 按**本文件自带 PRODUCT_SURFACE 设计**（:101-105「surface 出现→refuse gap EXIT=0; wire ... prove instead of mark-red」）走 wired 分支：断言 realReject（stale 拒绝已接线·活证指 uc025:nhp-neg:prove）·四条 GAP 虚称行退役·头注 supersession 注记（mark-red→wired 过渡·harness 文档 uc-e2e-025-stale-quiz-expiry.md 同步注记） | 若只翻 S1 留 GAP 虚称行=不诚实输出·禁取；整键退役（改 key 计数账）超出本刀权限·禁取 |

**验收**：`pnpm uc025:nhp-adv:prove` / `uc025:nhp-bound:prove` / `uc025:nhp-fault:prove` / `uc025:nhp-fault-isolated:prove` / `uc025:nhp-neg:prove` / `uc025:stale-quiz-expiry:prove` 全 EXIT=0。

### 组7 · 0152 窗×recruiter/runtime-role 围栏 fixture（键：root:recruiter:prove / root:runtime-role:prove）

**红证（亲读两键日志）**：recruiter `error: interview_event_raw_answer_fenced`（recruiter-depth.proof.ts:42 setup 种子步）；runtime-role `error: interview_privacy_fenced`（runtime-role.proof.ts:34 种子步）。

**机制实证（抛点名非 0152·g7-green-gap.md:83 同判）**：
- recruiter：0126 `enforce_interview_event_no_raw_answer`（0126:173-186·payload 存在 `answer` 键即 RAISE）撞 fixture 历史练习事件 **raw answer payload**（:44 `{ answer: '历史 C 端私密作答', score: 99 }`）——围栏族落地后 fixture 未随演（G7 报告原判「db-trigfam/fence 族落地后未随演」）。
- runtime-role：0058 `interview_job_privacy_active_write_guard`（0058:91-97·BEFORE INSERT 调 `assert_interview_privacy_active`）要求 `app.principal_user` 解析+owner 谓词——:34 经 **admin 裸连接**（无 principal）插 interview_job → `interview_privacy_active` NULL-principal→false（0058:36/0076:95 双亲证）→ RAISE。**预存红属性如实登记**：B110 收据（b110-recruiter-gate-prove.md:19/:50）base `f0a8a8ee` 对照同点同红在案=非今日窗新回归·归本刀 fixture 随演一并收口。

**修法（fixture 合规化·产品码零触·围栏零弱化）**：
1. `recruiter-depth.proof.ts:41-46`：历史事件 payload 改围栏合规形（同 proof completeBound :53 已用形）`{ questionId: \`proof-${historicIv}\`, stateVersion: 1, answerId: randomUUID(), answerHash: 'd'.repeat(64), competency: '并发', score: 99 }`——raw 答文摘除·score 99 语义保留·下游断言零引用 raw 文本（亲证 :97/:179 同形在用）。
2. `runtime-role.proof.ts:34`：interview_job 种子改 `asPrincipal(admin, 'role-user-a', (c) => c.query(...))` 包裹（'runtime-a' owner='role-user-a' 同体·0058 门全谓词通过）；:33 interview 种子保持 admin（interview 表无 INSERT 隐私触发器·全 migrations 亲证）；后续 runtime 池断言面零改（gateway_dispatch/RLS 可见性断言语义不变——种子属 fixture 非断言）。

**验收**：`pnpm recruiter:prove` EXIT=0 · `pnpm runtime-role:prove` EXIT=0。

### 组8 · E2RG×e2e-platform 守卫 + G6 行为门（键：root:e2e-platform:prove / root:g6-e2e-iso-blocked:prove）

**红证（亲读两键日志）**：e2e-platform `secret-redaction: e2e/full.e2e.ts:63:log_leaks_secret` + `:158:log_leaks_secret`；g6 两 FAIL `behavior: run-e2e.mjs/run-e2e-ui.mjs Key unset expected non-zero live_provider_key_missing; status=null out=E2E: 启 api + worker…`。

**机制实证**：
- 8a：secret-redaction.mjs:19-20 SENSITIVE 含 `MODEL_API_KEY`·LOG_LEAK 逐行扫 console.*——full.e2e.ts:63（OCR skip 日志）/：158（voice skip 日志）文本含 `text MODEL_API_KEY ≠ vision/voice` 字样（a4e3de58 09-18 引入·守卫 7da29707 09-04 起 SENSITIVE 即含该词——刀间非今日码动·首账现形）。两行只打印**变量名**不打印值·非真泄漏·但守卫设计=逐行 fail-closed 命中即红。
- 8b：g6 门（g6-e2e-iso-blocked.proof.mjs:242-267）spawn run-e2e.mjs 并 `delete env.MODEL_API_KEY`——但 run-e2e.mjs:17-22 会从**仓根 .env 回灌**未设变量（`if (m && !env[m[1]])`·本机 .env 实存亲证）→ 快速失败门（run-e2e.mjs:44）被绕过→起栈撞 20s spawnSync 超时→`status=null`。G7 报告 §5-4 已预登记「本机有 .env 形态下 Key-unset 叙事不可复现≠诚实破损·需显式登记」——此即收口件。

**修法**：
1. **8a=日志脱敏（守卫零触）**：full.e2e.ts:63 `text MODEL_API_KEY ≠ vision` → `text model key ≠ vision`；:158 `text MODEL_API_KEY ≠ voice` → `text model key ≠ voice`。诚实语义逐字保留（DASHSCOPE_VISION_API_KEY / DASHSCOPE_TTS/ASR_API_KEY 注入口仍点名·「文本键不冒充视觉/语音键」Ban 叙事不变·仅去 SENSITIVE 词面命中）。**守卫豁免登记方案不取**（fail-closed 门零弱化·任务书二择一按此裁定）。
2. **8b=runner 测试钩+门注入**：`scripts/run-e2e.mjs:17` 与 `scripts/run-e2e-ui.mjs:24` dotenv 装载器加显式钩 `if (process.env.E2E_SKIP_DOTENV !== '1') {`（包裹仓根 .env 回灌块·默认行为零变）；g6 proof :243-244 spawn env 增 `E2E_SKIP_DOTENV: '1'`（与 delete MODEL_API_KEY 并用）→ 两 runner 在任何宿主形态下 :44 快速失败必达（`live_provider_key_missing` 非零退出）→ 行为门语义**完整行使**（非 skip-as-pass）。SECRET-RUNNER_WITHHOLD 三标记（E2E_PROCESS_OUTPUT_WITHHELD 等）零涉。

**验收**：`pnpm e2e-platform:prove` EXIT=0 · `pnpm g6-e2e-iso-blocked:prove` EXIT=0。

---

## §2 全刀 EXIT 转绿验收命令（具名·EXEC 席逐键亲跑留痕）

```
pnpm -C apps/web prove:public-copy                 # 组1
pnpm -C apps/web typecheck                         # 组1 旁证(import 更名面)
pnpm -C apps/api prove:begin-guard-merge           # 组2
pnpm entpay:s1:prove                               # 组3
pnpm uc025:nhp-adv:prove                           # 组4a
pnpm uc025:nhp-bound:prove                         # 组4b
pnpm uc025:nhp-fault:prove                         # 组4c 同面对照
pnpm uc025:nhp-fault-isolated:prove                # 组4d
pnpm uc025:nhp-neg:prove                           # 组4e
pnpm uc025:stale-quiz-expiry:prove                 # 组4f
pnpm recruiter:prove                               # 组7
pnpm runtime-role:prove                            # 组7
pnpm e2e-platform:prove                            # 组8
pnpm g6-e2e-iso-blocked:prove                      # 组8
```

旁证零伤（对照基线原值）：`pnpm neg:interview`（97）· `pnpm interview:prove`（54）· `pnpm -C apps/web prove`（104 PASS 行）· `pnpm -C apps/api prove:uc001-nhp-fault`（同族对照·现红属清单外归 0 BUG 门后·不要求翻绿仅要求无新 FAIL 面）。

## §3 pins（十一值照抄 B271 REQUEST §6·零翻转）

`haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开删除面=interview DELETE 503（interview-data 面仍关闭）·简历/账户轨=202 软删受理·purgePending=true 恒真 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（本刀零模型外呼·零消耗）`

## §4 EXEC 前置与边界重申

1. 本任务书为**起草卷**：STOP=`draft:awaiting_pre_exec_dual`——pre-exec 双审会签 PASS + 协调方明示 EXEC 授权前，任何席不得动码面（本刀起草=仅本档新增·`git status` 实证唯一变更）。
2. 六组外零触：组5（已修）/组6（设计内过渡）/真产品红 5 项（归 0 BUG 门后刀）/预存红全账（§ 头列）——EXEC 席 diff 越界即停。
3. 组1 为唯一产品文件移位（模块归域·零行为）；组4f/组7/组8 为测试断言与 fixture/测试钩面；零产品逻辑改写·零守卫弱化·零 skip-as-pass。
4. est live=0：全部验收键离线本地（隔离容器/静态证明/假客户端）·零模型·零真实支付·零外网。
5. ⛔push · author=regfix-draft · alone≠dual。

---

*REG-FIX 交叉回归修复刀任务书 · 2026-10-10 · 起草席 regfix-draft · base `feat/mysql-schema-skeleton @ 44734d7f` · 分支 `line/regression-fix` · 工作树 `meetwise-regfix` · 蓝本=mainline-regression-matrix.md §2 新增红 8 组（修 6 组 13 键）· 六组修法全部 file:line 固化·红证与机制亲读落卷（/tmp/regm 六键日志+守卫/迁移/proof 源面亲证）· markers=0 · est live=0 · pins 十一值零翻转 · STOP=draft:awaiting_pre_exec_dual · ⛔push · alone≠dual*

---

## §5 rev2 双审合并落卷（席 regfix-rev2 · 2026-10-10 · append-only·上文零字节改动）

> 双审收口：**席1 PASS＋席2 PASS**（席2 附组3 dual 意见；席1 一处必落处方＋两脚注）。本节七项均为追加面·§1-§4 原判文字零删改；与本卷正文行引/口径冲突处**以本节 rev2 为准**·EXEC 行使按本节。落卷席已对下列全部 file:line 于实树 @48edea81 逐条亲证。

### §5.1 席1 必落处方 · 组4c 404 锚行首谓词收紧（随卷必落）

- 4c 主案（形状锚·唯一命中定位 helper）区域**限 scoped**＝`beginInterviewCore`（interview.service.ts:80 起）→ `export class InterviewService`（:257 止）切片·与组2/4a/4b 同域（全文件 indexOf 面废除）。
- 404 锚 regex 改**行首谓词** `/^\s*throw new HttpException\(\{ error: 'not_found_or_forbidden' \}/`——**区域双同形行实证（落卷席亲读）**：:96 行首 `if (cur.rowCount === 0) throw new HttpException({ error: 'not_found_or_forbidden' }, HttpStatus.NOT_FOUND);`（单行 if+throw·与 :124 同含 regex 原样子串）·:124 行首独立 `throw new HttpException({ error: 'not_found_or_forbidden' }, ...)`·:106 为注释提及（非码面）。regex 原样子串区域内**恰双命中（:96/:124）且 indexOf 首中 :96**＝「regex 原样+唯一命中」假设不成立·静默错钉 :96 弱锚；行首谓词**唯一命中 :124**（if 行非 throw 起始·注释行不匹配）。
- 余七 regex 原样**区域唯一已验**（落卷席逐条亲证）：merged SELECT :114／stale_quiz 引号形 :130／toLowerCase 比较形 :145／resume_version_mismatch 引号形 :148（:104/:107 注释无引号形不命中）／bind-owner `r.owner_user_id=$2` :182／reserveEntitlement 实参形 :230（:229 `reserveEntitlementForApplication(` 异名不命中）／enqueueInterviewJob 带括号 :245（:108 注释闭括号形不命中）。

### §5.2 组3 裁定落卷（主案定值）

- **取主案**：动态链头锚（`manifest[manifest.length - 1]?.version ?? ''`）＋0156/0157 双在链 Set 面——§1 组3 代码块原样生效（enterprise-pay-s1.proof.ts:47 改形·亲证 :47 现行即 `const lastOk = last === '0156_enterprise_bucket_billing';`）。
- **备案硬钉 0157 不取**：0158 落地即再漂＝复刻红成因（本红即片2 0157 落链后片1 终值硬钉 `=== '0156_...'` 失配·硬钉 0157 属同构复发·禁取）。
- 可选非绑定硬化：`first.applied` 与 `manifest.map(m => m.version)` **全序逐位对比**——严格强于末位对比（链中截断亦可捕捉）·EXEC 可顺手采·非必修。
- 依据亲证：`loadMigrations` `readdirSync(dir).filter(...).sort()`（packages/db/src/migrate.ts:307）＋`canonicalMigrations` version `localeCompare` 全序校验（migrate.ts:192-195）＝manifest 末位即当前最大号；空 manifest 经 `?? ''` **fail-closed**（链头空串→`last === ''` 恒假→探针必红·防线在断言面）。

### §5.3 组4c 备案行号实证落卷（存照）

- 备案八行**全命中**（落卷席 interview.service.ts 逐行亲证）：**:114** merged SELECT（`SELECT q.status, q.expires_at,`）／**:124** 404 throw／**:130** stale_quiz throw／**:145** toLowerCase 比较／**:148** resume_version_mismatch CONFLICT throw／**:182** `AND r.owner_user_id=$2`／**:230** reserveEntitlement／**:245** enqueueInterviewJob。
- proof 文件 **:282-284 自证已二漂**（「预存红根因①：行锚随 priv01-C owner 改名与 begin 三守卫合并漂移：重钉至合并后现行行号」亲读）——第三次重钉仍必漂；**形状锚是防第四次漂移唯一诚实解**·备案行号仅作 EXEC 对照存照非修法。

### §5.4 组1 脚注落卷

- 守卫 **file-scoped 实证**：public-copy.proof.mjs:**42** `const billingAction = read('apps/web/app/billing/actions.ts');` 精确单文件读取——E8 forbid/requireText 判据面只及该一文件·迁出后守卫 **:187-195 零字节改动**（同路径 stub 恢复后 :189 forbid 自然过·:190 拒绝文案逐字保留自然过）。
- 企业充值路由链**可达亲证**：`recruiter/billing/page.tsx:10`（`import { EnterpriseRechargeForms, ... } from './RechargeForms'`）→ **:35**（`<EnterpriseRechargeForms ... />`）→ `RechargeForms.tsx:11`（`import { createOrderAction, saveInvoiceProfileAction, submitInvoiceRequestAction } from '@/app/billing/actions'`·全仓唯一消费者 grep 亲证）→ 迁出后 import 改 `@/app/recruiter/billing/actions` 三 action 链路完整；C 端 `billing/page.tsx` **静态封闭零 action import**（仅 Link/Card 组件亲证）。
- **EXEC 注意**：恢复 stub 所加注释**不得含 `serverFetch(` 或 `/commerce/orders` 词元**（:189 forbid 扫 read 全文·注释行亦命中即红）。

### §5.5 组8 脚注落卷

- 仓根 **.env 现不存在**（落卷席 `ls -la .env` 亲证 No such file·矩阵探针时点存·任务书 §1 组8「本机 .env 实存亲证」表述陈旧）——**钩使门在任何宿主形态确定化**（.env 复活亦不静默绕门＝强化 8b 必要性·修法主案零动摇）；EXEC 留痕按现态如实注记。

### §5.6 组4 行引微瑕尾账（四条·席2）

- 4a：uc-e2e-025-nhp-fault.proof.ts 区域锚实读 **:61-62**（表内 :58-59）——:61 `svc.indexOf('begin(principal')`·:62 `svc.indexOf('turn(principal', bStart)` 亲证；
- 4b：uc-e2e-025-nhp-bound.proof.ts 区域锚实读 **:58-59**（表内 :59-60）——同形两行亲证；
- 4e：uc-e2e-025-nhp-neg.proof.mjs beginSignature/beginRegion **函数体实读 :38-48**（表内 :51-54/:45-49）——:38 `function beginSignature` 起·:48 `}` 止亲证；
- 4f：uc-e2e-025-stale-quiz-expiry.proof.mjs **S1 体实读 :39-58**（表内 :39-52）——:39 `'S1-begin-no-quiz-input'` 起·:58 `},` 闭合亲证。
- 四条均**行引微瑕·锚均字符串/regex 定位修法不受影响**·EXEC 按 rev2 行引执行。

draft_rev2:pre_exec_dual（双席 PASS·4c-404 行首谓词收紧随卷·组3 主案定值·脚注落卷·待复审确认后协调方行使 EXEC 授权）

---

executed:awaiting_post_prove_dual（EXEC 席 regfix-exec · 2026-10-11 · rebase 主线 tip 20186718 零冲突 2/2（draft 518023a5 + rev2 12fb5f80）· 六组全落卷：组1 E8 域归位（stub@ab420f61^ 原形·注释零禁词）+组2 GODFN-1c beginInterviewCore 区域锚（:96→:279 H4 漂后实值）+组3 动态链头锚主案定值（链头已漂 0160 实证·applied=163/163·硬钉 0157 备案即再红判定成立）+组4 六键（4c 形状锚唯一命中 helper+404 行首谓词区域唯一 :142·4f 翻转 wired·GAP 四行退役·harness 文档 §6 append）+组7 fixture 合规化（首层 0126/0058 过·深层围栏随演四层收口=web-logic 片3-4d 锚随迁+R2 P-START 路由决策种子链 0104 合规形+0064 v64 resume epoch 种子链+0082 校准 hold/I2 W1 held 门断言随演——组纪律「断言更新至新契约语义·诚实门零弱化」·新断言严于旧（held 拒复活+replay 零二次迁移+评分防伪双探针正面行使）·B110 预存红属性下该段 initial 起未在现链行使·详 receipts/regression-fix/exec-receipt.md §四）+组8 脱敏（:63/:158 model key 词面摘除·叙事逐字保留）+E2E_SKIP_DOTENV 钩（默认零变·g6 注入·.env 现不存在如实注记 §5.5）· **14 键全 EXIT=0**（300s/键帽前后对照落卷）· 旁证 4 面基线零伤（neg 97/0·interview 57/0·web 353/0·uc001 EXIT=1 指纹 efb637b8 前后逐字节同=零新 FAIL 面）· 停止条件三查未触发（零产品码 diff·锚全重定位·修法全∈断言/锚/fixture/脱敏/钩∪组1 域归位）· markers=0 · pins 十一值零翻转 · est live=0 · 真产品红 5 项零触 · 预存红全账零触 · 组5/组6 零触 · ⛔push · author=regfix-exec · alone≠dual · prove EXIT=0 ≠ DONE（claimDone=false·待 post-prove 双审+nail））

---

## nail 落卷（2026-10-11 · post-prove 双席 BOTH PASS·E4 三勾选 ✓）

**双审结果**：席1（修法语义面）+席2（验收/回归面）互盲复核 BOTH PASS。组1 守卫 file-scoped 域归位（企业充值路由链可达亲证+stub 注释零禁词）·组2 GODFN-1c 锚更新（S1-S10 断言体零改·全 diff 仅 2 锚行+2 注释行）·组3 动态链头锚主案定值（0158 落地即再漂=复刻红成因·备案不取）·组4 六键（4c 形状锚 uniqueHit+404 行首谓词区域唯一命中 :142·4f wired 翻转 GAP 退役）·组7 fixture 合规化（hash 形+asPrincipal 包裹·深层围栏四层收口）·组8 脱敏+dotenv 钩（默认零变·行为门完整行使）。14 键双席独立复跑全绿原值·uc001 指纹 efb637b8 前后逐字节同（预存 infra 红零新 FAIL 面）·零产品码 diff（组1 域归位除外·任务书明示允许）·真产品红 5 项/预存红全账/组5/组6 零触。merge 落主线 @94343ef4。

**Status**: `nail:closed`（post-prove 双席 BOTH PASS·E4 三勾选 ✓·merge 落主线 @94343ef4·交叉回归 6 组 13 键正式修复·门3 0 BUG 推进·markers=0·est live=0）。
