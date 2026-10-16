# B271 ENTERPRISE-PAY 片1 · EXEC prove 收据

**席位**: entpay-slice1-exec（#271 P0 最后断链 · S5-Slice-1 企业桶+充值）· **日期**: 2026-10-10
**授权**: pre-exec 双审收口（席1 PASS + 席2 FAIL → rev2 → rev3 会签 PASS 零缺口）+ 协调方明示 EXEC 授权 2026-10-10（本提交）
**蓝本**: `ai-docs/delivery/harness/b271-entpay-REQUEST.md` @`6385804a` **rev3**（§1.1 片1 S1-C1~C8 · §4.1 五判据 · 0156 归属裁定回注在卷）
**分支**: `line/enterprise-pay`（工作树 `meetwise-line-entpay`）· 落卷基点 `6385804a`（树净）
**范围**: 片1 全部 · **片2 零开工**（0-b 现不满足：B110 双审未收口 · 0157 零字节 · 跨主体扣费面零触）

## stash 落回回执

`git stash apply stash@{0}`（`b8b350d` · 13 tracked 文件 · +658/-30 · 基于 `68f680cd`）→ **exit 0 零冲突干净落回**，逐文件对照 S1-C1~C8 清单核验一致（C2 镜像/C3 参数化/C5 红冲过滤/C6 企业商品/C7 admin 双层/C8 actions.ts 均在卷且与 rev3 口径相符；C1 迁移与 C8 充值页属 untracked 未入 stash，由本席全新书写）。**⛔ quarantine 归档件（wave1/wave3 两份 0156 虚称头注档 + billing v1 页 + wave2 proof）零恢复零复制**；本席仅以 `/tmp/entpay-s1-preservation/` 底稿作参考誊改（头注虚称句去除改事实态、RLS 归属提交按 rev3 E1 改正 `9c92826e`、逐段对照 §1.1 亲核后落）。

## 0156 全新书写声明

`packages/db/migrations/0156_enterprise_bucket_billing.sql` 为 **B271 片1 EXEC 席 2026-10-10 全新书写**（非恢复非搬运）：头注授权句=事实态「授权=pre-exec 双审收口+协调方 EXEC 授权 2026-10-10（本提交）」；历史 wave1/wave3 隔离档「双审 PASS·EXEC 授权」虚称头注未复制。内容对照 rev3 §1.1 S1-C1 逐段亲核落位：kind CHECK 具名换装 `ck_bucket_kind` 增 `'enterprise'`（0149 DROP IF EXISTS+ADD 具名先例 + 脏值前置检测 fail-loud）；**企业桶 RLS 在位 fail-closed 断言不重建**（rev2-E1 改判 rev3 口径：`relrowsecurity/relforcerowsecurity/pg_policies p_owner` 任一缺失即 RAISE 停部署）；`channel` 列 + `offline_remit_record` 侧表（§1.0 裁决·表零授 app_role 比 admin_audit 更严）；`invoice_profile`/`invoice_request`（本人 RLS FORCE·order_id 唯一·仅-paid 触发器具名门 `enforce_invoice_request_paid_order`）；对公三受控函数 `gateway_admin_offline_remit_entry/confirm/fail` + 台账队列（照 gateway_admin_disable 0041:107-120 样板：`gateway_require_active_admin` + admin_audit 留痕·SECURITY DEFINER + SET search_path 逐字）；双人分离（entry==confirm 具名拒）/金额校验（不符拒且不入账）/bank_ref CAS（0020 uq 全局唯一）/audit 四元；REVOKE/GRANT 照 0041:139-161。expand-only · `SET LOCAL lock_timeout='2s'`（0101/0098/0104 先例）· 历史迁移 0001-0155 零字节。与镜像 `23_api_gateway.sql`/`11_commerce.sql`/`02_commerce.sql` 逐值同形（源=真源·迁移=部署车）。

## EXEC 级缺口修复（恢复码面亲核发现·三件·逐件登记）

1. **入账 provenance**（`payment.ts`）：credit INSERT 补 `source_order_id=$4`（列 0001:101 既有·此前恒 NULL；对公确认函数同列同义；C 端桶链零读该列·行为零变）。证明面按 `source_order_id` 定位入账桶所需。
2. **对公同流水第二单具名分码**（镜像+0156 同步）：confirm 的 NOT FOUND 分支增 `EXISTS(claimed.provider_txn=bank_ref AND id<>本单)` → 具名 `offline_remit_provider_txn_conflict`（§4.1-2「同一银行流水号确认第二单 → conflict」字面兑现；纯只增不弱·串行路径原落 `order_not_entrant` 同为 409 但无具名区分）。
3. **approved recruiter 门调用形**（`commerce.service.ts`，**产品码缺陷**）：恢复码面以 `SELECT gateway_require_active_recruiter()` 作服务端门——该函数已被 0155 **REVOKE 自 app_role**（镜像 `23_api_gateway.sql:418`·0155:412），app_role 会话内直调必 42501 insufficient_privilege（**attempt4 实测：一切企业下单恒 403，产线同炸**）。改按该门**同谓词**（role/status/approval_status 三键逐值同义）在调用方 RLS 自身行作用域校验（`p_user_account_self` FORCE RLS·candidate/pending/rejected 皆零行→403）；DB 侧 `gateway_active_candidate` 等 DEFINER 门纵深不受影响（双层不弱）。

## 前席发现② 收口（公开目录 × 企业商品兼容）

恢复码面 `listProducts` 返回全部 4 商品 → 与 `neg-commerce.proof.ts:389` / `api validate.ts:448` 公开目录「恰 2」契约冲突。收口：公开 `/commerce/products` 过滤 **consumer 域子集**（C 端所见与改前逐字节一致=零触）；企业商品走独立端点 `GET /commerce/enterprise-products`（approved recruiter 门·contracts 增 `EnterpriseProducts` schema + apiContract 路由）。S1-5c/5d/5e 断言背书。

## CMD | EXIT（原值全账·attempts 逐次如实）

| CMD | EXIT | 备注 |
|-----|------|------|
| `git stash apply stash@{0}` | **0** | 13 文件干净落回零冲突（回执见上节） |
| `pnpm -C packages/contracts typecheck` | **0** | 契约包 tsc 干净（含本刀新 schema/route） |
| `node scripts/run-e2e-isolated.mjs neg:commerce`（码面前态） | **0** | 84/84 全绿 |
| `node scripts/run-e2e-isolated.mjs entpay:s1:prove`（attempt 1·未留日志·同 attempt1 码态） | **1** | prove 测试码 `U` 具名导出引用错（`U` 为 boot() 返回属性非模块导出）——测试前提缺陷 |
| 同上（attempt 1·`logs/prove-attempt1-u-import-error.log`） | **1** | 同错留证（SyntaxError: does not provide an export named 'U'） |
| 同上（attempt 2·`logs/prove-attempt2-probe-db-2bp01.log`） | **1** | PROVE-ABORT 2BP01：独立探针库跑真迁移链后，boot() 的 01_schema `DROP ROLE app_role` 被默认库 58 对象依赖炸——**0001 角色治理是 cluster 级**，boot 先 probe 后的次序不可行 |
| 同上（attempt 3·`logs/prove-attempt3-boot-2bp01.log`） | **1** | 改 probe 先行后同型反向炸：01_schema DROP ROLE 被探针库 288 对象依赖炸——**独立探针库形与 boot() 结构互斥** |
| 同上（attempt 4·`logs/prove-attempt4-35of47.log`） | **1** | 改真迁移链直接落隔离容器默认库（runtime-role-http.proof:19 先例形）→ 35/47：**产品缺陷浮出**（recruiter 门 app_role 不可执行形·上节第 3 件）+ 测试码两处（S1-0 比较串多 `.sql` 后缀·S1-4j 门序期望未对齐） |
| 同上（attempt 5·`logs/prove-attempt5-45of47.log`） | **1** | recruiter 门修复（产品码）+ 诊断行 → 45/47：余两红均测试码（S1-0 后缀/S1-4j 门序） |
| 同上（attempt 6·`logs/prove-attempt6-48of48-GREEN.log`） | **0** | **48/48 全绿**（§4.1 五判据全过·逐条见下节） |
| `node scripts/run-e2e-isolated.mjs neg:commerce`（终态复跑·`logs/neg-commerce-final-green.log`） | **0** | 84/84 全绿（recruiter 门修复后终态） |
| `pnpm -C apps/web typecheck`（`logs/web-typecheck.log`） | **0** | web 全量 tsc 干净（含新充值页两文件） |
| `packages/db` ad-hoc `tsc --noEmit`（`logs/db-tsc-adhoc.log`） | 2（非口径） | 20 错 7 文件（`logs/db-tsc-error-groups.txt`）：rag03c/nhp-load/qbank-handoff/privacy-erasure 测试 + domain 三源文件——**与本刀触面零交集**（下方三门节）·apps/db 无 typecheck script，仓内口径不经过该直调（B110 同款如实登记） |
| `apps/api` ad-hoc `tsc --noEmit`（`logs/api-tsc-adhoc.log`） | 2（非口径） | 30 错 17 文件（`logs/api-tsc-error-groups.txt`）：uc-e2e/env-schema/validate 等测试 + ai-runtime/ai-graphs/domain 源——**与本刀触面零交集** |
| 全仓冲突标记 `grep -rln '^<<<<<<< \|^=======$\|^>>>>>>> '` | **1（零命中）** | markers=0 |

**est live=0 兑现**：全部 prove 为离线本地 API + 一次性 `meetwise-e2e-*` 本地临时 PG 容器（起停即弃）；**零生产 DSN / 零生产 Key / 零凭据值落盘**（PAY_SECRET=测试值·隔离门注入·无外网外呼）；零模型调用（harness 内 `delete process.env.MODEL_API_KEY`）。

## §4.1 五判据 → 断言表（attempt 6 · 48/48）

| 判据 | 断言 | 结果 |
|---|---|---|
| 1 线上幂等 | S1-1a~i：企业线上单 200/候选人 403/credited 入账（kind=enterprise·owner=下单招聘方·units=50·source_order_id·≈365 天）/重放 already/桶仍恰一/同 provider_txn 另单 409 conflict 零二次入账 | **9/9 PASS** |
| 2 对公防重+门 | S1-2a~p：offline 单停 created/台账队列可见+candidate 403/非 admin HTTP 403+函数直调 gateway_admin_required 双层/录入 true/确认前零入账仍 created/**录入人==确认人 409 segregation**/金额不符 409 拒且不入账/**第二 admin 确认 200+订单 paid+企业桶恰一**/**同流水第二单 409 provider_txn_conflict**/置败 failed/**audit 四元（操作人/订单/流水号/金额）+entry/fail 留痕** | **16/16 PASS** |
| 3 红冲过滤 | S1-3a~c：企业单退款 refunded/**只减 enterprise 桶（-200）·C 端 paid 桶前后相等**/重放 already | **3/3 PASS** |
| 4 开票门+RLS | S1-4a~k：资料 saved/本人读回/**他招聘方零行/候选人直查 0 行（FORCE）**/candidate 403 门/created 负例 409/refunded 负例 409/paid 正例 200/重复 409/**candidate 403 门+他招聘方 409 RLS 隐单（双门·无存在性信号）**/列表恰一 | **11/11 PASS** |
| 5 零弱化回归 | S1-5a~f：C 端 paid 入账 credited+kind=paid（默认参数零退化）/**公开目录恰 2（C 端域子集·neg-commerce:389 契约零弱化）**/企业端点恰 2/候选人 403/**C 端红冲 -10 全桶 FIFO 零弱化** | **6/6 PASS** |
| 部署车 | S1-0：真 runMigrations 全量 **158/158 应用·末位=0156_enterprise_bucket_billing·重跑 0 applied/158 skipped 幂等** | **1/1 PASS** |
| 台账端点（S1-C7） | S1-2b/2c：admin 队列可见 offline 单 · candidate 403 | 含于判据 2 |

## S1-C1~C8 逐条落位表（numstat 实测·全 diff +699/-31 · 15 tracked M + 5 untracked 新增）

| # | 落位 | 证据 |
|---|---|---|
| C1 | `packages/db/migrations/0156_enterprise_bucket_billing.sql` 新增（+247） | 全新书写声明见上；编号=ls 亲证最小未占（0155 止）·协调方 0156 裁定在卷（REQUEST rev3 Post-dual 处方⑥回注） |
| C2 | `sql/02_commerce.sql`（+3/-2）· `sql/11_commerce.sql`（+84/-1）· `sql/23_api_gateway.sql`（+150） | 镜像现态同步（承重墙兑现：neg-harness `_neg-harness.ts:65-70` 直载本镜像链 → neg:commerce/prove 全绿=prove DB 实有 0156 面） |
| C3 | `packages/db/src/payment.ts`（+25/-6） | `CreditBucketKind` 参数化（缺省 'paid' 与旧字面量逐值一致·createOrder/CAS 零改）+ source_order_id provenance（EXEC 修复件 1） |
| C4 | 0156 内对公三函数+queue（+镜像同形） | entry/confirm/fail/queue 四函数·照 0041:107-120 样板·REVOKE/GRANT 照 0041:139-161 |
| C5 | `payment.ts` markOrderRefunded | 桶类型过滤 `($2::text IS NULL OR kind=$2)`——C 端不传参=谓词恒真=既有语义逐字节一致（S1-3b/S1-5f 双向背书） |
| C6 | `commerce.service.ts`（+114/-12） | 企业商品 2 SKU（ent_pack_50/ent_pack_200·approved recruiter 门）+ bucketForOrder 域派生 + 开票三端点服务面 + 发现②公开目录过滤 |
| C7 | `admin.controller.ts`（+25/-1）· `admin.service.ts`（+61/-1）· `apps/web/app/admin/page.tsx`（+79） | offline-remits 四端点（AdminGuard+函数内 require_active_admin 双层）+ 具名 409 分码映射 + admin 台账卡片（队列+留痕可见） |
| C8 | `apps/web/app/billing/actions.ts`（+65/-4）· `apps/web/app/recruiter/billing/`（page.tsx+RechargeForms.tsx 全新书写） | 企业充值页（企业商品+线上下单/对公收款账户+备注订单号指引+开票资料维护+开票申请入口）·C 端 pricing/billing 预览封闭语义零变（非 ent_ 商品仍拒绝原文案逐字保留） |

其余：`packages/db/src/index.ts`（+1/-1 导出 CreditBucketKind）· `packages/contracts/src/index.ts`（+48/-1 本刀 DTO/schema/route）· `package.json`+`apps/api/package.json`（runner 注册三处形：root 脚本 + apps/api 脚本 + run-e2e-isolated.mjs allowlist+dispatch · 沿 trial:grant:prove 先例）· `scripts/run-e2e-isolated.mjs`（+5/-1）。`apps/web/tsconfig.tsbuildinfo` 构建产物已还原零入账（B110 先例）。

## 片2 预验证脚本（只写不跑声明）

`apps/api/test/entpay-s2-preverify.proof.ts`（全新书写·wave2 隔离档零恢复）覆盖 §1.2.0-c 五件事（①-④ + rev2-E2 第⑤件 sweeper owner/RLS 探针·PV-0~PV-5c）。**本片1 EXEC 只写不跑**（其执行归片2 前置闸开启时；0-b 现不满足——B110 双审未收口）。runner 键 `entpay:s2:preverify` 已按三处形注册就位。迁移探针形已按片1 attempt2/3 教训预修正（真迁移链直接落隔离容器默认库·runtime-role-http 先例形）。

## TS 三门

| 门 | 结果 |
|---|---|
| `packages/contracts` typecheck | **EXIT 0 清洁** |
| `packages/db` / `apps/api` ad-hoc tsc 误差清单 | 预存态（B110 同款登记：无 typecheck script·非仓内口径）。误差**全组位于本刀零触碰文件**：触面文件集（`git status --porcelain` 20 项）× 误差文件集（db 7 + api 17）**交集=∅**；误差文本对本刀新符号（enterprise/entpay/CreditBucketKind/invoice/offline_remit/channel）**零真实命中**（唯一 grep 命中为仓名 `meetwise-line-entpay` 路径子串误报）→ 与 pristine 逐组全同（触面零贡献+未触文件定义性不变） |
| `apps/web` typecheck | **EXIT 0 清洁** |

## 停止条件核查（五条）

1. **stash apply 冲突**：未触发（exit 0 零冲突）。
2. **码面与 rev3 清单矛盾**：三处 EXEC 级缺口（上节三件）已按 rev3 口径当席修复并逐件登记——非「清单矛盾」级（清单要求的功能语义全数在卷，缺口为调用形/溯系列/具名分码补齐）；RLS 在位断言（E1 改判）与码面一致核验通过。
3. **prove 新增红**：终态全绿（prove 48/48·neg:commerce 84/84·attempt 全账如实·每次红均有具名缺陷修复，Ban retry-to-green 无违反——无一次「同码态复跑」，修复记录逐 attempt 在卷）。
4. **需触片2 面**：未触发（0157 零字节·跨主体扣费面零触·preverify 只写未跑）。
5. **est live>0**：未触发（est live=0·零生产 DSN/Key·隔离库=本地临时容器零生产 DSN）。

## pins 十一值（REQUEST §6 照抄·零翻转）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · 公开 DELETE=**503**（interview-data 行按 UNSTUB-ERASE supersession 现值照抄·原值行零改） · g7SuiteGreen=**false** · r1Closed=**false** · 脚注 actualSpendCny=**null**（本刀零模型外呼·零消耗）

## Non-claims（REQUEST §7 同口径）

本片 ≠ 真实支付上线 ≠ B 端上线 ≠ 金钱路径合规声明；线上支付=HMAC 模拟渠道同形复用；对公=人工确认台账（**非自动到账**·双人分离为流程约束≠组织级权限系统）；开票=资料采集+申请+回填轨道（片3 才有财务回填端点·**非税务合规声明**）；企业桶=招聘方个人主体持有（0155 审批主体·**非法人实体核验**）；红冲过滤≠退款产品化（#229 另刀）；存量已被扣候选人不退不溯；片1 prove PASS ≠ 生产验证；「approved recruiter 门」应用层同谓词校验 ≠ 替代 DB 侧 DEFINER 纵深（双层在卷）；对公 confirm 幂等重放通道（同单同流水已 paid）为**防御性分支**（同事务原子性下单据/台账本应同生灭·未被主证断言单独行使）。

## sha256（关键工件）

```
a30c3bf76ef8e1504b20058974e46204a0e8586ab787e7d1657511ffe3cb7d34  packages/db/migrations/0156_enterprise_bucket_billing.sql
0e58074863ab89dfea759063d1ab145e8b94c0b676c898d9c425f7a31a80309b  packages/db/sql/23_api_gateway.sql
9e891857e33c5931ac79676da8e32b0cfe581fc42dff9230e9ae7f11cb3721bc  packages/db/sql/11_commerce.sql
969f9ba9a59689d0cd371146dfaf669fa3df2939263e1b9612047b1a7d3f11f7  packages/db/sql/02_commerce.sql
9c410fe1d4431280de267151d2eb6d1ffe30452f88322db39902ef92a157b036  packages/db/src/payment.ts
f1f125cac1825a09eeda2995c5508a12a86028db158fb171629d56aa2d46cd29  apps/api/src/modules/commerce/commerce.service.ts
6ce2404781c46d6efb7da7fba82aa8f3cf38ce9ea221e2463bdcce92b2f01691  packages/contracts/src/index.ts
b1176cd27376b540cd3a00f4142b899d546f8b28234ad48d0771c5e07c5fc382  apps/api/test/enterprise-pay-s1.proof.ts
e18ef1ff5b1528e797381de33b3c76f88f1c834e8f832770f4421d6e60f21996  apps/api/test/entpay-s2-preverify.proof.ts
cd8139c4a85cad911577594db368ef2bb233585ee910b112019c1a0f0163d6c1  apps/web/app/recruiter/billing/page.tsx
56301d06b76a74d20a658f14e3f206a89d62bad21b32d968dacc39074bf8e6e9  apps/web/app/recruiter/billing/RechargeForms.tsx
```
（logs/*.log 十二份逐一入 git；commit hash 于 REQUEST 状态行 append 登记。）

---
*EXEC 收据 · entpay-slice1-exec · attempts 全账如实（prove 六跑：2×测试码导入错 → 2×探针库 2BP01（次序/结构互斥·改形）→ 35/47（产品缺陷浮出+测试码）→ 45/47（产品码修复落定）→ **48/48 EXIT 0**）；无一次同码态复跑。Ban self-approve——本收据待 post-prove 双审复核（状态行 `executed_slice1:awaiting_post_prove_dual`）。*
