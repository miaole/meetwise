# N-19 陈旧注释修正刀（recruiter 付费语义+token-stream 设计文档现位引用·纯注释零行为·量级微·mini REQUEST · smoke-env-fix 同形快速链一体席 · 落卷即停）

**Status**: **`executed:awaiting_post`**（EXEC 落卷 2026-10-16 §9·四门全绿[门 2 经协调方 sanction 随刀 2232→2240 复绿·授权随令=待裁决项③已行使]·post 审归协调方派单·Ban self-approve·前值 **`draft:awaiting_exec`**=起草态史录·⛔push ⛔merge主线 ⛔force push·est live=0）

**席位**：meetwise 战役「N-19 陈旧注释修正刀」快速链一体席（审计 N 系 N-19 两半全成立亲证后派单·P3 量级微·诊断+起草+EXEC 一体授权）。
**基线**：`line/audit-status-notes` @ `1c55cc10a`（支线=origin tip `67cdf153` 等号亲证后建立·任务1 审计状态注记 13 条已随 `1c55cc10a` 落卷·本刀同支线续作）。fetch 后 `origin/feat/mysql-schema-skeleton` tip=`67cdf153` 同值亲证=派单下界 tip≥67cdf153 等号成立。
**蓝本**：①审计 N-19 两半发现（a=recruiter.service.ts:15 陈旧注释「候选人用自己额度池」vs 实际企业桶语义 b=generation-progress.ts:7 引不存在的 `harness/token-stream-design.md`）②#271 修法实况=扣额路由企业桶（0156/0157+interview.service.ts:246-262 `reserveEntitlementForApplication`·候选人桶零读写）③同型先例=tokenstream-progress.proof.ts:6 同引照改④卷形=smoke-env-fix-REQUEST（mini REQUEST §0-§9 形）。

## §0 现状锚（起草席亲读亲证 @`1c55cc10a`·blob `git hash-object` 亲算·改前值）

### 0.1 blob 锚表

| 路径 | blob 改前 @`1c55cc10a` | 锚点 |
|---|---|---|
| `apps/api/src/modules/recruiter/recruiter.service.ts` | `d89d5a49a48018cf…` | `:15` 注释「who-pays:候选人用自己额度池跑面试(他们的练习)…」——陈旧付费语义 |
| `apps/worker/src/generation-progress.ts` | `aabaf4a82f7e555a…` | `:7` 头注「铁律（沿设计刀 harness/token-stream-design.md §3.2/§7）」——引不存在的路径 |
| `apps/worker/test/tokenstream-progress.proof.ts` | `d866f8a9f46f386f…` | `:6` 头注「断言面（harness/token-stream-design.md §3.7 预注册…）」——同引照改面 |

### 0.2 两半成立亲证（@`1c55cc10a` 树）

- **半 a（付费语义陈旧）**：recruiter.service.ts:15 称「候选人用自己额度池跑面试」；实际扣额路由已随 #271 片2 翻企业桶——interview.service.ts:246-262（:246 注释自证「B271 片2 S2-C2…企业桶（0157 gateway_entitlement_reserve 面·payer=job_application.recruiter_user_id 单跳派生·候选人桶零读写）」，:254-256 `applicationId != null` 走 `reserveEntitlementForApplication` 否则 `reserveEntitlement`，:259 企业不足 409 `enterprise_insufficient_balance` 分码）。`packages/db/src/commerce/commerce.ts:117` 导出在树。**注≠码**：注释与码语义背离·零行为差。
- **半 b（死文档引用）**：全仓 `find -name "token-stream-design*"` 恰 1 命中=`receipts/archive/2026-09-batch23/slices/token-stream-design.slice.md`（现位·77 行 slice·载裁决/Scope/Prove plan/NAIL lifecycle 达意面）；`harness/token-stream-design.md` 不存在（ls 亲证 ENOENT）·归档批23 harness/ 目录亦无全卷。引该死路径的 `.ts` 全仓恰 2 文件=本刀两处（grep 亲证·web 侧 generation-progress 无此引）。

## §1 修法（三处·纯注释零行为·零产品语义·零迁移·零 workflow）

1. **件a recruiter.service.ts:15**：注释更新为企业桶语义（沿 #271 修法实况）——「B 端岗位面试(application_id 非空)扣**企业桶**——reserveEntitlementForApplication（0157 payer=job_application.recruiter_user_id 单跳派生·候选人桶零读写·扣额路由实锚 interview.service.ts）；C 端本人练习才走候选人自己额度池。招聘方/AI 图均不直接动 entitlement（邀请只建申请壳）」·1 行→3 行·纯注释。
2. **件b generation-progress.ts:7**：死引改现位——`harness/token-stream-design.md`→`receipts/archive/2026-09-batch23/slices/token-stream-design.slice.md`（§3.2/§7 节号保留·现位同卷达意）·纯注释。
3. **件b' tokenstream-progress.proof.ts:6**：同型同引照改（同现位路径·§3.7 保留）·纯注释。

## §2 门矩阵（EXEC 全过为绿·逐条亲跑 EXIT 入 §9）

1. **markers 门**：本刀改动集（本 REQUEST+三 .ts）五类标记词（词面沿 `scripts/i6-239-gates.proof.mjs` 运行时组装·不入卷防自指）+行首冲突标记对**零命中**。
2. **docs:check**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（本卷 +1 新件 REQUEST·managed files 2232→2233 ≤ cap 2240·帽经协调方 sanction 随刀 2232→2240 步进[+8 沿 2208/2216/2224/2232 四先例形·sanction 注记两行随 policy 卷·越限臂六处 2240/2241 联动行使]·复绿不涉本刀内容面）。
3. **受影响 proof 抽一**：`pnpm tokenstream:prove` **EXIT=0**（触面二件同属 tokenstream 家族·抽此一·纯注释零行为预期恒等绿）。
4. **diff 面**：全刀恰 **4 tracked 路径**=本 REQUEST+recruiter.service.ts+generation-progress.ts+tokenstream-progress.proof.ts·零其他。

## §3 范围外（越界即停）

- web 侧 `apps/web/lib/stream/generation-progress.ts`（无死引·grep 亲证零命中·零触）。
- 全卷 harness/ 收录 token-stream-design 全文重建（档案处置权归协调方·本刀只改引现位）。
- recruiter.service.ts 其余注释/码面（:14 企业纵深句语义准确·零触）。

## §4 依赖

无新增依赖。门3 复用既有 `pnpm tokenstream:prove` 注册行（root package.json:539·isolated-runner 面）。

## §5 Ban 列表 + pins

- Ban 码面非注释字节变动（三 .ts 改后 diff 恰=注释行·`-`/`+` 行首字符全 `*`/空格亲证入 §9）。
- Ban 删任务号以外的任何清理（顺手修≠本刀）·Ban 碰 #218/#271 等批表条目状态（任务1 注记令仍全效）。
- pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · actualSpendCny=null · 批表零翻 · 权威合计 191/271（70.5%）维持零翻。

## §6 est live=0（起草 turn）+ EXEC 门预申明

零模型外呼零 key 消费（纯注释+静态门+隔离 fake-seam proof）·EXEC 四门全过为绿·任一红且口径内修不了即停。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+三 .ts）五类标记词+行首冲突标记**零命中**——EXEC 落卷时对终改动集亲跑复证入 §9。

## §8 STOP（开工条款 + 待裁决项）

**STOP · `executed:awaiting_post`**（EXEC 已落卷=§9·post 审归协调方派单·Ban self-approve·前值 `draft:awaiting_exec`=史录）。开工三条款：①本席自审 PASS（§0 锚 blob/行锚亲证齐全·两半成立亲证在卷·修法与派单修向逐条对表）录 §9；②快速链一体授权=派单 brief 明示「工序：mini REQUEST→修法两处→门→§9+STOP awaiting_post+commit」一体（本卷 Status 行）；③EXEC 落位与 §1-修法三处契约+§5 Ban/pins 零偏离（diff 面=4 tracked 恰等 §2-4 pin）。停止条件：**现场漂移**（§0.1 任一锚 blob 漂移）→停重 pin；**门红不可修**（§2 任一门红且根因不在本刀交付面）→停如实登记；**越界需要**（§3 面诉求）→停另裁。

**待裁决项**：
- ①slice 现位引保留 §3.2/§7、§3.7 历史节号（全卷不在树·节号指向归档前全文·slice 承达意）——后继如归档全卷回迁 harness/，引用随迁归后继刀裁量。
- ②N-19 销案/翻面权归协调方（本刀不宣称关闭·仅修法落卷）。
- ③**cap sanction**：~~本卷新受管件 +1 触顶（PTP_FILE_LIMIT:2233>2232·帽零余量）——sanction 归协调方~~ **已裁决行使（2026-10-17 协调方授权随令）**：sanction 随刀 2232→2240 步进（+8 沿四先例形·sanction 注记两行随 policy 卷·越限臂六处 2240/2241 联动·deepEqual 行亲跟 2241）·docs:check 复绿 EXIT=0 在 §9 门2。

## §9 EXEC 记录（快速链一体席落卷 2026-10-16·STOP→`executed:awaiting_post`）

- **件a 落位**：recruiter.service.ts:15 注释 1 行→3 行（企业桶语义·0157 payer 派生·候选人桶零读写·C 端本人池保留句）·纯注释。
- **件b/b' 落位**：generation-progress.ts:7+tokenstream-progress.proof.ts:6 死引 `harness/token-stream-design.md`→现位 `receipts/archive/2026-09-batch23/slices/token-stream-design.slice.md`（节号保留）·纯注释。
- **开工三条款**：自审 PASS（§0 锚 @`1c55cc10a` 全数在位零漂移·`git status` 改动集=本刀 4 文件零漂移）+一体授权（Status 行）+契约零偏离——兑现。
- **四门亲跑实测**：

| # | 门 | 实测 | EXIT | 结论 |
|---|---|---|---|---|
| 1 | markers 五类词+冲突标记（改动集 4 文件·before=after 对 `1c55cc10a`） | 三 .ts 改前改后全 0·本 REQUEST 全 0·零新增 | 0 | 绿 |
| 2 | docs:check 届树 | **复绿**：`ai-docs check passed: 80 required files verified`·2233 managed files ≤ cap **2240**（cap sanction 随刀 2232→2240·协调方授权随令·+8 沿四先例形·sanction 注记两行随 policy 卷+越限臂六处 2240/2241 联动行使·`public-text-policy:prove` 越限臂 EXIT=0 亲跑） | 0 | 绿 |
| 3 | `pnpm tokenstream:prove`（受影响 proof 抽一） | 见 §9 门3 行实录（隔离容器 fake seam·纯注释零行为） | 0 | 绿 |
| 4 | diff 面 | 恰 4 tracked=本 REQUEST(+新)+recruiter.service.ts(1→3 行注释)+generation-progress.ts(1 行注释)+tokenstream-progress.proof.ts(1 行注释) | 0 | 绿 |

- **结论**：四门全绿（门 2 经 sanction 随刀复绿：2232→2240 步进·协调方授权随令·越限臂六处 2240/2241 联动·deepEqual 行亲跟 2241·自审 grep 清零证在案）·STOP=`executed:awaiting_post`（post 审归协调方派单·Ban self-approve）·commit 规范=`docs(worker): N-19 陈旧注释修正（recruiter 付费语义+token-stream 设计文档现位引用）`+sanction 续作 `ci(docs): 文档帽 2232→2240 步进（N-19 REQUEST 触顶 sanction 随刀·协调方授权随令）`·并线归协调方 nail 波。

---

*n19-stale-comment REQUEST · 2026-10-16 起草+EXEC · **STOP=`executed:awaiting_post`（EXEC 落卷=§9·post 审归协调方派单·前值 `draft:awaiting_exec`=史录）** · base=`line/audit-status-notes` @`1c55cc10a`（支线=origin tip `67cdf153` 等号亲证后建立）· 缺陷=recruiter.service.ts:15 who-pays 注释停留在候选人池旧语义（实际企业桶·#271 片2 已翻）+generation-progress.ts:7/tokenstream-progress.proof.ts:6 引不存在的 harness/token-stream-design.md（现位=receipts/archive/2026-09-batch23/slices/token-stream-design.slice.md）· 修法三处纯注释零行为 · 零迁移零 workflow · est live=0 · markers=0 · ⛔push · STOP*
