# AUDIT-LOG REQUEST — 回调拒绝安全日志接线刀起草卷·具名 residual「审计后置未接线」收刀（GAP-UC014-AUDIT-EMIT · docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft`**（起草落卷即停 · **STOP=draft 三处钉：本 Status 行 + §8 + 卷尾** · 协调方行使定标侦察刀A 方案后派单起草 · alone≠dual · pre-exec 双审未派 · 本卷不预 claim 任何 EXEC 面/翻面/covered 升格 · coveredCount=8 零动）。

**席位**：meetwise 回调安全日志接线起草席（定标侦察刀A 方案行使·协调方授权·双硬约束条款全落卷）。
**基线**：`origin/main` @ **`351501976`**（full `35150197631c172b2f5f9c3d0367f815c2eeda84` · #168 recon-flip-draft 已并 · `git fetch origin` 本 turn 成功 · 分支 `line/audit-log-draft` 零独有 commit · 工作树 `meetwise-audit` 仓根同级 · `git status` 亲证零脏）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2430 = cap 2430 恰等零余量**（cap 步进见 §2-1）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md`（隐私面：不把支付信息/密钥写入日志）→ `ai-docs/delivery/gap-bug-backlog.md` **`:396`**（认领载体·Ban 原文）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md` **`:119`**（UC-E2E-014/026 ADV 格）+ **`:117`**（UC-011 行审计 residual·refund 孪生侧）+ `:441`（GAP-UC011-ADV-01 nail residual ①）→ `ai-docs/delivery/execution-master-checklist.md` **`:683`**（K 线 residual）+ **`:897`**（V 线 residual ①）→ 涉事机制源 `apps/api/src/modules/commerce/commerce.service.ts` + `commerce-webhook.controller.ts` + `payment-callback.controller.ts` → 观察点口径 `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts` + `apps/api/test/uc-e2e-011-refund-callback-adv.proof.ts`（AUDIT-OBSERVATION absent|observed 口径·**冻结零触**）→ 命名门 `apps/api/test/uc-e2e-001-nhp-adv.proof.ts`（V5 五树·:331）→ 先例 `packages/db/src/interview/interview-jobs.ts`（console.warn JSON 形）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①协调方派单（定标侦察刀A 方案行使·起草「回调安全日志接线任务书」）；②`gap-bug-backlog.md:396` 具名 residual「审计后置未接线」载明「升格权在协调方」——本卷=协调方行使该升格权的起草面；③矩阵 `:119` ADV 格具名 residual + `:117`/`:441` refund 侧 residual 同源；④checklist `:683`/`:897` 双线 residual 承接；⑤结构范本=`harness/nhp-batch-c-REQUEST.md`（§0-§9 形制）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`351501976`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **36 树**实测——`line/audit-log-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep audit-log` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- 本卷起草 turn 触面=恰 1 新 .md + cap 步进两 policy 脚本（§2-1 预授权·「cap/lint 以合并树实测为准恰等步进免再询」常设预授权族）·零产品码·与他线（批 A/B/C 已并、uc004/uc011/uc31/x33/x16/webhook 族、perfweb、screg、eslint-ignores、recon-flip）触面零重叠亲证——本刀 EXEC 期唯一码触面=`commerce.service.ts`（§1.2 范围条款·全仓唯一），EXEC 立项日对各在飞分支 `git log -1 -- apps/api/src/modules/commerce/commerce.service.ts` 逐树复核，任一在飞分支顶对该文件有 `351501976` 之后新增提交 → 触 §8「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/gap-bug-backlog.md` | `33ba0d86`（959） | **`:396` 具名 residual「审计后置未接线」全文**（全仓 0 emit 点 · receipt 逐类 `AUDIT-OBSERVATION: absent`×4 C1/C2/C3/C7 · 附旧号 `commerce.service.ts:56-70`+`commerce-webhook.controller.ts:11-16` · disclosed-not-blocking 非 EXIT 门槛 · **「Ban 宣称告警/GuardrailHit 已实现」**· 升格权在协调方）· `:552` residual ①②（CLOSED(wired) 随行不洗） |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `54cede58`（522） | **`:119` UC-E2E-014/026 ADV 格**（residual「审计后置未接线」·GuardrailHit 产品路径 0 emit 点 · absent×4 C1/C2/C3/C7 · C3 DISCLOSED）· **`:117` UC-011 行**（审计 residual absent · disclosed-not-blocking · 审计接线=另刀 · Ban 假称已接）· `:441` nail 注记 residual ①审计接线/②金额显式复核 · `:280` P1-12（UC-031/032 仍缺 GuardrailHit——产品面归其刀） |
| `ai-docs/delivery/execution-master-checklist.md` | `18db9763`（4501） | **`:683`**（K 线 residual·absent×4·C3 DISCLOSED·EXIT0≠covered）· **`:897`**（V 线 residual ①审计接线 另刀 / ②金额复核 新刀） |
| `apps/api/src/modules/commerce/commerce.service.ts` | `f55d414c`（292） | **四 emit 码点**（§0.2-1 逐点） |
| `apps/api/src/modules/commerce/commerce-webhook.controller.ts` | `2b976602`（25） | Path A 双口 `:12-17`（pay）·`:20-24`（refund）——零守卫薄口·验签/owner/CAS 全在 service 单管道 |
| `apps/api/src/modules/commerce/payment-callback.controller.ts` | `37b8af46`（35） | 主口 `POST /payment/refund-callback` `:27-33`（缺 orderId 400 `invalid_callback` 先于 HMAC·薄适配形校验·委托 refundWebhook 单管道） |
| `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts` | `419c15a7`（296）**冻结零触** | `:54-65` `auditObservationBasis()` 运行时扫描 `commerce.service.ts`+`commerce-webhook.controller.ts` 两文件·正则 `/GuardrailHit\|audit[_-]?log\|security[_-]?log/g`（`:62`）·`:67-74` `AUDIT_LINE`（absent\|observed 全局 scan 值·basis 旧号 `:56-70`/`:11-16` stale·disclosed-not-blocking 非 EXIT 门槛）·C 类语义 `:194`（C4 already）/`:212`（C5 409 conflict）/`:231`（C6 并发 CAS）/`:251`（C7 404） |
| `apps/api/test/uc-e2e-011-refund-callback-adv.proof.ts` | `c9ba96b6`（474）**冻结零触** | `:68-81` 同正则扫三文件（+`payment-callback.controller.ts`·正则 `:78`）·**`:68` `stripComments` 先剥注释再扫**（emit 必须真代码·注释计数不算）·`:85` AUDIT_LINE absent\|observed |
| `apps/api/test/uc-e2e-001-nhp-adv.proof.ts` | `43f936cf`（553）**冻结零触** | `:302-305` V5 五树 roots（`apps/api/src`/`packages/db/src`/`packages/domain/src`/`packages/ai-runtime/src`/`packages/ai-graphs/src`）· `:324` `/\bGuardrailHit\b/` 计数 · **`:331` `A('V5 GuardrailHit emit = absent …', hits === 0)` 硬断言** · `:546` `process.exit(exit)`（failures>0 → EXIT=1 硬门） |
| `packages/db/src/interview/interview-jobs.ts` | `7401cc04`（401） | **安全日志先例形**：`:346`/`:351`/`:393` `console.warn(JSON.stringify({ event, kind, job_ref, … }))`（结构化单行 JSON·stderr/stdout·零表零迁移） |
| `packages/db/sql/15_audit.sql` | `2ae259a9`（13） | `:4-11` `admin_audit` 形状（§0.2-3 证伪①） |
| `packages/db/sql/01_schema.sql` | `9ca439cb`（188） | `:40-49` `interview_event` 形状（§0.2-3 证伪③） |
| `packages/db/migrations/0093_memory_governance.sql` | `6db6678a`（1202） | `:178-190` `memory_audit_event` 形状 + `:197` REVOKE app_role + `:200` 仅 memory_runtime INSERT/SELECT（§0.2-3 证伪②） |
| `scripts/ai-docs/public-text-policy.mjs` | `f7896f3c`（530） | `:232` `MAX_FILES = 2_430`（cap 亲证 · §2-1 预算核） |

### 0.2 码面锚（产品缝 · 逐点亲证 @`f55d414c`）

**0.2-1 · 四 emit 码点（webhook 拒绝出口·现行号亲读·backlog `:396` 旧号 `:56-70` 已漂·本卷重钉现号）**

| 拒绝类 | 码点（现行号） | 出口语义 |
|---|---|---|
| **C1 伪造签名** | `commerce.service.ts:35` | `!secret ‖ a.length!==e.length ‖ !timingSafeEqual` → 403 `bad_signature`（恒时序·fail-closed·verifyCommerceSig 单源 pay+refund 双面共用） |
| **C2 形/窗拒** | `commerce.service.ts:27`（缺 providerTxn/sig）· `:29-30`（ts 非有限数/超 ±300s 重放窗） | 400 `invalid_callback`（结构性拒·fail-closed） |
| **C3 金额复核** | **无码点**（结构性 absent） | 回调体白名单无金额通道+服务端权威定价=结构性保障；显式服务端金额复核比较路径**今天不存在**（DISCLOSED · backlog `:552`/矩阵 `:441` ② · **不进本刀面** §1.2） |
| **C7 owner/单不存在** | payWebhook `:132-135`（`requireOwnerUserId` catch → 404）· `:139`（`res==='not_found'` → 404）；refundWebhook 孪生 `:158-161` · `:165` | 404 `order_not_found`（签名再对也不入账·不区分存在性） |
| refund 入口 | `:151-152`（`refundWebhook` · `verifyCommerceSig(id, body, 'refunded')` 同单源） | 孪生面与 pay 面逐点同构（对偶标签 `paid`/`refunded` 入签不可互换） |

主口 `payment-callback.controller.ts:32` 薄适配形校验 400（缺 orderId·先于 HMAC）与 Path A controller 双口（`:12-17`/`:20-24`）零守卫直委托——emit 落 service 单管道即自然覆盖两口三面（pay 主链/refund Path A/refund 主口），controller 零触（§1.2）。

**0.2-2 · 安全日志先例形（stdout-only 证成）**：`interview-jobs.ts:346/:351/:393` = 全仓在产先例——`console.warn(JSON.stringify({ event: 'reaper_takeover'|'stale_payload_purge', kind: 'interview', job_ref, … }))` 结构化单行 JSON 走 stderr/stdout·零表零迁移零配置；本刀 emit helper 沿此形（§1.0）。

**0.2-3 · 「结构不适配」三底座证伪（Ban 借口建表加迁移·est S 零迁移零新表的证成）**：
1. `admin_audit`（`15_audit.sql:4-11`）：actor=**admin 用户 id**+action+target+detail——admin 域问责形状；webhook 拒绝面**无 admin actor 且无登录态**（PSP 服务端调）→ 形状错配。
2. `memory_audit_event`（`0093_memory_governance.sql:178-190`）：`owner_user_id NOT NULL`+`stream_key`+`seq`（MAX+1 advisory 有序流）；`:197` `REVOKE ALL … FROM app_role`、`:200` 仅 `memory_runtime` INSERT/SELECT——C7 恰是 **owner 解析失败**面（无 owner 可填）且 app_role 会话**物理零达**（权限面即错配）→ 双重不适配。
3. `interview_event`（`01_schema.sql:40-49`）：`owner_user_id NOT NULL`+`stream_key`+`UNIQUE(stream_key,seq)`——owner 域面试流 event sink；webhook 拒绝面无流语义且 owner 不保证存在（C7）→ 形状错配。

三底座均需迁移+新列或权限面改动（est S→M+·且 C7 面结构性不可填）→ **stdout-only 为唯一 S 级形**。

### 0.3 认领核对（载体三件 fresh 亲点 + 处置条款）

| 载体 | 亲点结果 | 本刀处置 |
|---|---|---|
| 矩阵 `:119` ADV 格 | residual「审计后置未接线」+absent×4 C1/C2/C3/C7+C3 DISCLOSED 在卷 | C1/C2/C7=本刀 emit 面；C3 不进刀面（下行）；行状态零翻转（翻面权归协调方） |
| backlog `:396` | 具名 residual 全文+Ban 原文「**Ban 宣称告警/GuardrailHit 已实现**」+升格权在协调方 | 认领载体=本 GAP-UC014-AUDIT-EMIT；Ban 原文逐字承接 §1.2；旧号 `:56-70`/`:11-16` 漂移如实登记·收据重钉现号（§1.0-d） |
| checklist `:683`/`:897` | K 线/V 线 residual 双在卷（①审计接线=另刀——本卷即该「另刀」的起草面） | refund 孪生侧（`:117`/`:441` ①）同刀覆盖：emit 在 refundWebhook 单管道·主口+Path A 两嘴自然覆盖 |

**处置三条款（定标裁定全落）**：
- **C3 不进刀面**：无码点（0.2-1）——不存在可挂 emit 的出口；金额复核 DISCLOSED 口径零改·**Ban 改口「已实现金额复核」**（backlog `:552` 承接）。fresh 重跑时 `AUDIT_LINE` 全局 scan 值翻 `observed` 系「emit 点存在性」判读·**非**「金额复核存在性」判读——两轴分离·Ban 借 observed 洗 C3 金额缺口。
- **C4-C6 不加 emit**：幂等正常类（C4 同单同 txn 重放 `already` `:194` / C5 跨单 `409 order_conflict` `:212` / C6 并发 CAS 恰一 `:231`）——非拒绝类·照常返回；absent×4 口径（C1/C2/C3/C7）不扩。
- **GuardrailHit 产品面 blocked 归 UC-031/032 联动条款**：矩阵 `:280`/case-matrix `:96` 亲证 UC-031/032 面仍缺 GuardrailHit——其产品实现归 UC-031/032 真刀·**本刀 Ban 触**；届时翻转 uc001 V5 断言的授权预登记见 §1.1-预登记。

---

## §1 修法（交付面=EXEC 期一行一码触 · 起草 turn 零产品码）

### 1.0 刀形定标

- **(a) emit helper**：`commerce.service.ts` 恰一个（~10-15 行）·结构化单行 JSON 走 stderr/stdout（`console.warn(JSON.stringify(…))` · 沿 `interview-jobs.ts:346/:351/:393` 先例形 0.2-2）·字段形 `{ event: 'security_log', kind: 'commerce_webhook'|'commerce_refund_webhook', class: 'C1'|'C2'|'C7', order_id, reason: 'bad_signature'|'invalid_callback'|'order_not_found', outcome: 'rejected' }`——**命名受 §1.1 硬约束**（`security_log` 小写字面量恰被 uc014 `:62`/uc011 `:68` 运行时正则扫中）。隐私面：Ban 写 sig/secret 值、Ban 写 owner 之外 PII、Ban 写金额/units（AGENTS.md「不把支付信息/模型密钥写入日志」；verifyCommerceSig 为 pre-auth 纯函数·C1/C2 臂仅 id+kind+reason 可载）。helper 不抛不阻断：emit 失败不得改变拒绝语义（Ban 把安全日志做成新故障点）。
- **(b) 拒绝出口逐点调用**：C1 `:35` · C2 `:27`/`:30` · C7 pay `:133-135`/`:139` + refund 孪生 `:159-161`/`:165`——**七 emit 位**（行锚 `:35`/`:27`/`:30`/`:133-135`/`:139`/`:159-161`/`:165`·C2 同类两号并计口径则六·本卷按行锚计七）；verifyCommerceSig 内三路（C1/C2）pay+refund 双面自然共用。C3/C4-C6 零调用（§0.3 处置条款）。
- **(c) est**：**S 级 · 零迁移零新表零配置零依赖**（stdout-only·三底座证伪 0.2-3 承）·改面仅 `commerce.service.ts` 一文件（§1.2）。
- **(d) proof 形**：①**冻结 proof 零触**——`uc014:webhook-adv`/`uc011:refund-callback(-adv)` fresh 重跑，其内置运行时扫描（0.2 表）自动翻 `AUDIT-OBSERVATION: absent→observed`·断言面恒等（47 臂/41 臂零改写）·observed 披露入 EXEC 收据；②**可选新臂**=additive 新 proof 断言 stderr/stdout 出现 `security_log` 行（单行 JSON parse+字段断言）·不触任何冻结 proof；③**收据 basis file:line 重钉现号**（`:27`/`:30`/`:35`/`:133-135`/`:139`/`:159-161`/`:165`+controller 现号 `:12-24`/`:27-32`）——冻结 proof 文内旧 basis 串（`:56-70`/`:11-16` stale）**零改**·旧行收据**不动**·Ban 回写历史收据/历史 JSON。
- **(e) 行状态零翻转**：EXIT0≠covered · 矩阵 `:119`/`:117` ADV/partial 列措辞零动（翻面仅经协调方 nail）· coveredCount=8 不变 · backlog `:396` residual 的「接线」事实登记权归协调方。

### 1.1 双硬约束条款①（命名条款——定标最重要发现）

1. **emit 载小写 `security_log` 字面量**：三重扫描面全兼容——uc014 `:62` 正则 `security[_-]?log` 恰扫中（`observed` 翻转）·uc011 `:68` 同（且 `stripComments` 先剥注释·emit 必须真代码非注释）·V5（`:324` 仅 `\bGuardrailHit\b`）零命中不受扰。
2. **五树禁 `GuardrailHit` 驼峰 token**：`uc-e2e-001-nhp-adv.proof.ts:302-305` 五树（apps/api/src · packages/db/src · packages/domain/src · packages/ai-runtime/src · packages/ai-graphs/src）`:324` `/\bGuardrailHit\b/` 计数 · `:331` `A('V5 GuardrailHit emit = absent …', hits === 0)` 硬断言 · `:546` `process.exit(exit)`——**任一产品树出现 `GuardrailHit` token → hits>0 → V5 FAIL → `uc001:nhp-adv:prove` EXIT=1**（五树含本刀唯一码触面 `commerce.service.ts`）。故本刀命名空间仅 `security_log`·Ban 双命名并存·Ban 注释里写 `GuardrailHit`（uc011 stripComments 后注释不算·但 uc001 V5 扫原文含注释——**注释里写也算命中**·全树零容）。
3. **预登记（UC-031/031/032 真刀联动）**：UC-031/032 真刀届时若落 `GuardrailHit` 产品路径（矩阵 `:280`/case-matrix `:96` 既列），uc001 V5 `:331` 断言必翻转红（EXIT=1）——该翻转属**断言改写面=协调方授权域**，届时须协调方明示授权令（改 V5 为 observed 口径或移除）后方可并线；**本卷预登记此授权申请路径·本刀不预支**。Ban 无授权静默翻转 V5（= wash 审计披露面）。

### 1.2 双硬约束条款②（范围条款）

1. **C3 不进刀面**：保持 absent 披露（无码点 0.2-1）·金额复核 DISCLOSED 口径零改·Ban 改口（§0.3）。
2. **C4-C6 不加 emit**：幂等正常类（§0.3）·absent×4 口径不扩不缩。
3. **改面仅 `commerce.service.ts`**：controller 三件（commerce-webhook/payment-callback）零触·主口薄适配 400 形校验（`payment-callback.controller.ts:32`）**不加 emit**（pre-HMAC 形校验非安全拒绝面·disclosed-not-blocking·留后刀裁量如实登记）；`packages/db` 零触（先例文件只读）；冻结 proof 四件零触（§1.0-d）。
4. **Ban 宣称 GuardrailHit 已实现**：backlog `:396` Ban 原文逐字承接——本刀落的是 `security_log` 观察点（absent→observed），**非** GuardrailHit 产品路径；Ban 假称告警/GuardrailHit 已实现·Ban 借本刀洗 UC-031/032 的 GuardrailHit 缺口（矩阵 `:280`）·Ban 改口「已实现金额复核」（backlog `:552`）。

### 1.3 否决表（落选形诚实留痕）

| 落选项 | 否决理由 |
|---|---|
| 落库形（admin_audit/memory_audit_event/interview_event 任一+迁移） | 三底座形状/权限双重错配（0.2-3）·C7 面 owner 结构性缺位·est S→M+·零迁移承诺破 |
| `GuardrailHit` 命名 emit | uc001 V5 `:331` 硬 EXIT 门（§1.1-2）·且其产品面归 UC-031/032（矩阵 `:280`）非本刀 |
| C3 金额显式复核（顺手实现） | 属新刀（backlog `:552`/矩阵 `:441` ②·「显式复核=新刀」原文）·本刀 Ban 越界顺手修 |
| 主口/Path A controller 层加 emit | 改面仅 commerce.service.ts（§1.2-3·service 单管道两口共用·controller 零触） |
| C4-C6 幂等面 emit | 幂等正常类非拒绝面（§0.3）·照常返回零扰 |
| 冻结 proof 改造（改 AUDIT_LINE basis 现号） | 冻结零触（§1.0-d）·旧号 stale 属 disclosed·重钉只在 EXEC 收据层 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即 §8「验收红不可修」触发面**）

1. **docs:check + cap 预算核（亲算）**：起草前本树亲跑 `node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2430 = cap 2430 恰等零余量**（`public-text-policy.mjs:232` `MAX_FILES=2_430` 亲证）→ 本卷 +1 受管件=2431 **必越** → **CAP-SANCTION-2438 步进 2430→2438**（+8 · 协调方派单预授权「越限沿先例步进承登」随令行使 · 沿 CAP-SANCTION-2417（X33-ADV 起草刀 +8·policy.mjs:112）同形 · 2208→…→2430 快速链承前 · 先手步进·计数预算非内容策略）·落码后亲跑 **scanned 2431 ≤ 2438 EXIT=0** + `public-text-policy.proof.mjs` 四联动点（`2_438`/`f-2438.md`/`:2439`）亲跑 **12/12 EXIT=0** · EXEC 期 +1 可选 proof 终态 ≤2432+收据 `.log` 非扫描扩展名不计——越限臂 fabricated 数随 cap 联动同步（语义不变强度不减）。
2. **markers 五类零命中**：本刀改动集（本卷 1 .md+两 policy 脚本）五类标记词（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:154-163`·不复抄卷内防自指）+行首冲突标记 grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕）。
3. **diff 面机检**：起草 commit `git diff --numstat origin/main` **恰 3 tracked 路径**=`ai-docs/delivery/harness/audit-log-REQUEST.md`+`scripts/ai-docs/public-text-policy.mjs`+`scripts/ai-docs/public-text-policy.proof.mjs`·逐件本节登记·多任何未登记 tracked 路径即停；**产品面（`apps/`/`packages/`）零 diff**（起草 turn）。
4. **行/列冻结**：本卷零触矩阵/backlog/checklist 文面（只读引用）·coveredCount=8 零翻转·EXIT0≠covered·升格权归协调方。

**EXEC 预基面（届时重 pin·起草 turn 不适用）**：
5. **fresh 重跑三 prove**：`pnpm uc014:webhook-adv:prove` **EXIT=0**（47 臂断言面恒等零改写 + `AUDIT-OBSERVATION: observed`×4 C1/C2/C3/C7 披露入收据·attempts 台账含红次如实）+ `pnpm uc011:refund-callback:prove` **EXIT=0**（41/41 旁证回归·Path A 口）+ `pnpm uc011:refund-callback-adv:prove` **EXIT=0**（68/68·refund 侧 observed 披露收据唯一产出运行）——**accepted-risk（随 EXEC 收据披露）**：emit 面 pre-auth 可达——log-flood ~200B/行·洪泛 10^3/s≈0.2MB/s 量级可接受；Linux stderr pipe 同步写为既有 tradeoff·沿 `rate-limit.service.ts:49` 先例。Ban retry-to-green·Ban 断言迁就。
6. **typecheck/lint 届值**：turbo typecheck 零红 · lint 帽届值亲证 `apps/api` **1520** / `apps/worker` **999** / root **5383**（三 package.json `:7-8` 亲读）——超帽沿先例步进预授权承登（「cap/lint 以合并树实测为准恰等步进免再询」族）。
7. **可选新臂（若行使）**：additive 新 proof（stderr/stdout `security_log` 行断言）+ 注册行/runner/egress inventory 按先例形四位+additive 登记·漏登即停。
8. **五树 `GuardrailHit` 零命中 EXEC 门（硬约束①-2 在刀 enforcement）**：`rg '\bGuardrailHit\b' apps/api/src packages/db/src packages/domain/src packages/ai-runtime/src packages/ai-graphs/src` **零命中亲跑留痕**（与 uc001 V5 `:324` 同语义·零成本确定性）或纳入 `uc001:nhp-adv:prove`（EXIT=0 收据随证）——补齐 ①-2 在刀 enforcement·消除越刀潜伏红；EXEC 期任一命中=V5 FAIL（§1.1-2·EXIT=1）→ 停（§8）。

## §3 范围外（越界即 FAIL）

1. **产品码面零触（起草 turn）**；EXEC 期码触面**仅** `commerce.service.ts`（§1.2-3）·controller/db/冻结 proof 零触。
2. **共享 SSOT 零改**：矩阵/backlog/checklist/case-matrix/REMAINING-NORTH-STAR-QUEUE 只读引用——absent→observed 登记与行状态措辞翻面权归协调方。
3. **UC-031/032 GuardrailHit 面零触**（矩阵 `:280`·其刀+V5 授权预登记 §1.1-3）·C3 金额复核面零触（新刀·backlog `:552`）。
4. **covered/queue 翻面零预支** · **零迁移零新表零配置**（0.2-3 承）·Ban 触告警/CI 配置/cap 值（本卷 cap 步进除外·预授权随令）。

## §4 依赖

**①上游已满足**：四 emit 码点全在树（0.2-1 blob 亲算）+ 先例形在产（0.2-2）+ 观察点扫描面在产（uc014/uc011 冻结 proof）+ cap 预授权随令。**②同文件并发**：EXEC 期 `commerce.service.ts` 为在飞高风险交涉面（uc011/uc014 族多线历史触点）——EXEC 立项日 §0.0 逐树复核必做。**③下游**：observed 披露收据供 UC-014/026 与 UC-011 行 residual 收口评估引用（评估权归协调方·本刀 Ban 代评）；UC-031/032 真刀届时按 §1.1-3 预登记走授权。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit·⛔动主仓）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含借 observed 披露 wash 行状态/C3 金额缺口/UC-031/032 GuardrailHit 缺口）；Ban 宣称告警/GuardrailHit 已实现（backlog `:396` Ban 原文承接）；Ban 改口「已实现金额复核」（backlog `:552`）；Ban 五树 `GuardrailHit` token（§1.1-2·注释亦禁）；Ban 静默翻转 uc001 V5 断言（§1.1-3 预登记·授权权归协调方）；Ban 触冻结 proof/历史收据/共享 SSOT（§3）；Ban 触 C3/C4-C6/controller/迁移/新表（§1.2/§3）；Ban 写 sig/secret/PII/金额入日志（AGENTS.md 隐私面）；Ban emit 阻断化（helper 不抛不改变拒绝语义）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（EXEC 期三 prove 全离线隔离 PG·emit 为 stderr/stdout 本地写·§2-5 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+两 policy 脚本·起草 turn）五类标记词+冲突标记 grep **零命中**（起草席亲跑·词面运行时组装口径·不复抄卷内防自匹配——沿批 C §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft`（起草落卷即停·三处钉：本节+Status 头+卷尾）· 开工三条款未启动（①pre-exec 双审未派 ②协调方 EXEC 授权未下 ③EXEC 面未开）· 本卷起草 turn 恰 3 tracked 路径（§2-3）· alone≠dual。** 停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：EXEC 立项日 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（四 emit 码点行号/语义被他刀改写 · 观察点扫描正则变动 · `commerce.service.ts` 在飞交涉 · cap 届值再漂）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期 fresh 重跑与 §1.0-d 推定形不符（如 emit 后 `AUDIT-OBSERVATION` 仍 absent=扫描面失灵 · observed 翻转扰断言面）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：EXEC 诉求超出 §1 恰 `commerce.service.ts` 一文件面（需触 controller/db/冻结 proof/C3/UC-031/032/V5 断言翻转）→ 停·另刀或协调方裁决（V5 翻转按 §1.1-3 预登记路径走授权）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 超 2438 / typecheck/lint 超帽 / 邻套件新红）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft`**（起草落卷即停 · pre-exec 双审未派 · EXEC 未开）· 状态翻面权归协调方 · alone≠dual · Ban self-approve · EXEC 走本卷 §1/§2 面另令立项。

---

*AUDIT-LOG REQUEST · 2026-10-26 起草 · **STOP=`draft`**（三处钉：Status 行+§8+本行·起草落卷即停）· 具名 residual「审计后置未接线」收刀起草（GAP-UC014-AUDIT-EMIT · 载体 backlog `:396`+矩阵 `:119`/`:117`/`:441`+checklist `:683`/`:897` 亲点）· 四 emit 码点 commerce.service.ts `:35`（C1）/`:27`/`:30`（C2）/`:133-135`/`:139`+孪生 `:159-161`/`:165`（C7）现行号重钉（backlog 旧号 `:56-70` 漂移如实登记·旧行收据不动）· 双硬约束=①命名（emit 载小写 `security_log` 字面量恰被 uc014 `:62`/uc011 `:68` 扫中翻 observed·五树禁 `GuardrailHit`（uc001 V5 `:331` A() 硬 EXIT 门 `:546`·注释亦禁）·UC-031/032 真刀届时翻转 V5 需协调方授权预登记）②范围（C3 不进刀面保持 absent 披露·C4-C6 不加 emit 幂等正常类·改面仅 commerce.service.ts·Ban 宣称 GuardrailHit 已实现原文承接）· 刀形=一 emit helper ~10-15 行结构化单行 JSON stderr/stdout（interview-jobs `:346/:351/:393` 先例形）+七 emit 位（行锚 `:35`/`:27`/`:30`/`:133-135`/`:139`/`:159-161`/`:165`·C2 同类两号并计则六）·est S 零迁移零新表（三底座 admin_audit/memory_audit_event/interview_event 形状/权限双重错配证伪）· proof 形=冻结 proof 零触 fresh 重跑三 prove 取 observed 披露+可选 additive 新臂+收据 basis 现号重钉 · cap=CAP-SANCTION-2438 步进 2430→2438（+8·「越限沿先例步进承登」预授权随令·起草前 scanned 2430=cap 恰等零余量实证）· est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0≠covered · releaseEvidence=false · ≠HA · ⛔push ⛔动主仓*
