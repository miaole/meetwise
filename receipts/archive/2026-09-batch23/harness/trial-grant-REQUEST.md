# REQUEST — **#228+#29 注册赠送体验额度刀**（审计 P0 · D1 已决：注册送一场面试 trial · 用完付费 · docs-only 起草）

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（docs-only 起草 · Ban coding · Ban prove 执行 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Line**: **trial-grant**（审计 P0 D1 已决兑付刀 · #29 trial kind 首个生产写入点 · 与 #110/#261/#271/#26 划界见 §2）
**Base tip**: `115c47f2`（`origin/feat/mysql-schema-skeleton` 2026-10-07 fetch 实测 · worktree `/Users/miaole/Desktop/golucky/meetwise-line-trial001` 分支 `line/trial-grant` · 本文全部 file:line 于本 worktree **亲读复核** · 行号漂±已登记）
**Author**: `mw-trial001-draft`（REQUEST 起草席 · 实现不自批）
**Date**: 2026-10-07
**依据**: ①审计定谳 #228（非测试代码唯一建桶点=支付回调）+ D1 决议（注册赠送一次体验额度·够完成一场面试·用完付费·幂等每用户一次·防刷 #110 联动）②#29 trial kind 保留（禁死代码删除·D3 未决前 #26 比例结算也不删）③锚点亲读：`packages/db/src/payment.ts:84-86`、`packages/db/migrations/0001_baseline.sql:92-106`、`apps/api/src/modules/auth/auth.service.ts`、`apps/api/src/modules/commerce/commerce.service.ts:12-13`

---

## §0 立靶（审计定谳 · 本席逐条亲验 @115c47f2）

- **#228 建桶点唯一性——grep 亲证**：`INSERT INTO entitlement_bucket` 全仓非测试命中仅 `packages/db/src/payment.ts:85`（支付回调入账·`kind` 写死 `'paid'`·`now()+interval '365 days'`·个人池）。`gift`/`trial` kind 字符串全仓非测试命中仅两处**枚举定义**（`0001_baseline.sql:96`、`packages/db/sql/02_commerce.sql:14`）——**gift/trial 零创建点·admin 零发放面**（grep 亲证无第三写入方）。
- **购买链路后端完整·web 封闭**：`createOrder`（payment.ts:8-44·幂等键 ON CONFLICT）→ `markOrderPaidAndCredit`（payment.ts:60-94·CAS created→paid + provider_txn partial UNIQUE exactly-once 入账）→ 退款对偶（payment.ts:105-166）。web 侧 `apps/web/app/billing/actions.ts:4-7`（亲读）：`createOrderAction` 硬编码 `return { ok: false, error: '预览环境未开放订单、支付或额度购买。' }`——**购买入口封闭是产品现状，非本刀改动对象**。
- **新用户第一次 begin 必 402——代码链亲读坐实**：新注册用户零桶 → `availableUnits`（`packages/db/src/commerce.ts:314-320`）SUM=0 → begin 处 `reserveEntitlement(c, owner, id, 'mock_interview', 1.0)`（`apps/api/src/modules/interview/interview.service.ts:304`·亲读）FIFO 候选桶空集 → `:80-83` 抛 `insufficient_entitlement` → `interview.service.ts:306` 映射 `HttpStatus.PAYMENT_REQUIRED`。同形 402 面：押题 `quiz.service.ts:58`、诊断 `diagnosis.service.ts:61`、OCR `resume.service.ts:101`——四条主路径全部先预留 1.0（本席亲读）⇒ **新用户全产品零可用，注册→体验转化链断裂**，此即 D1 立刀根因。
- **#29 trial kind 保留义**：枚举在库（0001:96）但零写入方=账面死值。D1 已决赠送走 trial ⇒ 本刀给 trial **第一个生产写入点**，是 #29 的兑付而非死代码复活；D3 未决前 paid 桶逻辑与 #26 比例结算维持原状（§5 Ban）。

## §1 范围（四项 · 幂等键设计已亲读桶表约束后钉死）

1. **注册事务内幂等创建 trial 桶（主体）**：
   - **幂等键设计（定谳）**：`entitlement_bucket`（0001:93-105 亲读）**无 idempotency_key 列、无 (owner,kind) 唯一约束**——两案对比：**(a) owner+kind 唯一（选定）**：新迁移建 partial unique index `uq_bucket_trial_one_per_owner ON entitlement_bucket(owner_user_id) WHERE kind='trial'`，写入 `INSERT ... ON CONFLICT (owner_user_id) WHERE kind='trial' DO NOTHING`（沿 payment.ts:21-26 ON CONFLICT 家族范式·**禁 SELECT-then-INSERT**，payment.ts:18-20 注释亲读自认其并发缺陷）；**拒选 (b) 幂等键列**：payment_order 的 key 列服务"多次下单每单幂等"语义（0018 迁移先例），trial 是结构性 once-per-user 赠送，加列冗余且留错用面。partial index 附带收益：未来 admin 发放/任何第二写入路径也被 DB 层挡死（不靠调用方自觉）。
   - **事务位形（推荐·双审可裁）**：扩 `gateway_auth_signup`（`packages/db/sql/23_api_gateway.sql:5-24`·SECURITY DEFINER 亲读）函数体：`user_account` INSERT 后同函数内 INSERT trial 桶（ON CONFLICT DO NOTHING）→ **signup+grant 同事务原子**（注册 23505 回滚则桶不存在；桶冲突 DO NOTHING 不拖垮注册）；唯一调用方 `auth.service.ts:29-32`（grep 亲证）零签名变更。definer 侧 RLS 机制已有在产先例：`gateway_payment_order_owner`（23:38-47）以 SECURITY DEFINER 读 FORCE RLS 表在产运行。备选（独立 gateway fn 同 `asGateway` 事务先后调）功能等价多一次 EXECUTE 授权面（0041:142 形制）——**由预执行双审裁 A/B**。
   - **桶参数**：`units_total=1.00`（0001:92 口径亲读「1 次面试=1.00」·与 interview.service.ts:304 reserve 1.0 恰好一场）；`kind='trial'`；`source_order_id=NULL`（无单）；`expires_at` 见第④项。recruiter 角色注册**同发**（D1 决议未限定角色·消费面 begin 只在 C 端 mock_interview·加角色门=额外逻辑零收益；B 端试用外溢登记 §7，归 #271 面）。
2. **防刷第一层（本刀内）**：trial 发放内嵌注册事务 ⇒ **天然继承既有 signup 限流**（`auth.service.ts:20` 亲读：`signup:${email}` 3 突发 + `signup:global` 60 全局）——零新增限流代码，prove 断言限流后无重复发放。IP/设备维度 #110 未落（auth.service.ts:19 注释亲读自认「真·防海量不同邮箱注册仍需 IP 维度/验证码——内存限流是已知 seam」）⇒ **Non-claims 登记联动 #110，本刀不做**（§7）。
3. **trial 用尽 begin 402 既有行为验证（零改动）**：`reserveEntitlement`（commerce.ts:59-65 亲读）候选桶谓词 `expires_at > now() AND (total-reserved-consumed) > 0`；trial 1.00 预留后余额 0，第二场 begin 凑不够 `:80-83` 抛 → `interview.service.ts:306` 402。**本刀不新增任何 402 代码**——prove 行使该既有链即可（§4）。
4. **过期策略（推荐+理由·双审可裁 90 天）**：**推荐 `now()+interval '365 days'`（同 paid·payment.ts:85 唯一先例）**。理由：①沿仓内唯一落桶先例，不新立魔法数；②FIFO（commerce.ts:64 `expires_at ASC`）下 365/90 只影响「注册后长期闲置」桶，不影响注册→首面试→付费转化主路径；③`availableUnits`（commerce.ts:318）与 reserve 谓词自动排除过期桶，长有效期无清理成本压力；④D1 决议只定「够完成一场面试」未定期限，365 天保守不缩营销承诺。90 天备选唯一收益=闲置桶卫生更紧，无功能差——**由双审定值**。

## §2 非范围（划界防双改/扩权）

- **#110 防刷全面化归 W4**：IP 维度限流、设备指纹、邮箱验证码、批量注册画像——本刀仅继承 signup 既有限流（§1.2），不新增任何限流机制。
- **余额 UI 归批 1 #261 面**：`GET /commerce/entitlement`（commerce.controller.ts:40-43·在产）已可查可用额度，本刀零 web 改动（billing/actions.ts:4-7 封闭保持）。
- **#271 企业付费归 W4**；**支付入口开放另决**（本刀 Ban 开 billing/actions.ts）。
- **#26 比例结算 D3 未决不动**：confirmConsumption ratio 面（commerce.ts:96-133）零触碰。
- **admin 发放/gift kind 面**：本刀只落 trial 一个写入点；gift 创建点不在本刀（无 D 决议）。
- **payment.ts paid 桶逻辑零触**（payment.ts:84-86 原样）。
- **零 G7 面 · 零 SSOT 编辑**（backlog/matrix/checklist/queue/issues-master 状态行归协调方）。

## §3 逐条改动清单（file:line 全亲读 @115c47f2）

| # | 面 | 锚点（亲读） | 改动 | 备注 |
|---|---|---|---|---|
| 1 | 迁移（新） | `packages/db/migrations/`（最新 0151·ls 亲证）→ 新 `0152_trial_bucket_grant.sql` | ①`CREATE UNIQUE INDEX uq_bucket_trial_one_per_owner ON entitlement_bucket(owner_user_id) WHERE kind='trial'`（可重跑形制：IF NOT EXISTS/DO $$ 判存，照 0018:3-15 先例）②`CREATE OR REPLACE FUNCTION gateway_auth_signup(...)` 加 trial 桶 INSERT（ON CONFLICT (owner_user_id) WHERE kind='trial' DO NOTHING）·REVOKE/GRANT 照 0041:139-142 原样重申 | migrate.ts 按 schema_migrations 顺序应用（migrate.ts:208-227 亲读）；checksum 铁律禁改旧迁移 |
| 2 | 网关源文件同步 | `packages/db/sql/23_api_gateway.sql:5-24` | gateway_auth_signup 函数体与 0152 迁移保持一致（0041→23 文件同步先例：23:17-22 即 0041:22-26 形） | 源文件=真源·迁移=部署车 |
| 3 | auth 服务 | `apps/api/src/modules/auth/auth.service.ts:28-36` | 选 A（推荐）**零代码改动**（signup 已走 gateway fn·桶在函数内落）；选 B（独立 fn）则此处 asGateway 事务内补一次调用 | 限流面 :20 零触 |
| 4 | db 导出面 | `packages/db/src/index.ts`（如选 B 需导出常量/类型；选 A 零改） | 按 A/B 裁定 | |
| 5 | prove | `apps/api/test/`（`neg-auth.proof.ts` HTTP harness `boot()/h.req()/mkAssert` 先例·`_neg-harness` 亲读） | 新 trial-grant prove（§4 断言表）+ 既有 `auth:prove`（根 package.json:282）/`neg:auth`（:97）回归跑 | 键形制沿仓惯例，最终由双审裁 |

## §4 Prove（隔离库 · 断言表 · est live=0）

1. **新注册拿 1 trial（主证）**：API 级 `POST /auth/signup`（HTTP harness·neg-auth.proof.ts 同形）→ 断言：①`GET /commerce/entitlement` 返回 `availableUnits=1`；②隔离库直查 `entitlement_bucket` 该 owner 恰 1 行、`kind='trial'`、`units_total=1.00`、`expires_at≈now()+365d`、`source_order_id IS NULL`。
2. **幂等断言（不重复发放）**：①同邮箱重复注册 → 409 `email_taken`（auth.service.ts:34·23505 映射）且桶仍 1 行；②隔离库直接重放同 owner 第二条 trial INSERT → 23505（partial index 拒·非应用层软约束）；③并发双注册同邮箱（harness 并发请求）→ 恰一桶（ON CONFLICT DO NOTHING 收敛）。
3. **trial 用尽 402（既有链行使）**：注册 → begin（mock_interview）成功（trial 1.00 被预留）→ 第二场 begin → **402 `insufficient_entitlement`**（interview.service.ts:306 既有映射·零新代码）。
4. **零回归**：`auth:prove` + `neg:auth` 全绿原值（signup/login/限流 429/409 语义不变·gateway_auth_signup 输入校验 23:17-20 不变）；`neg-commerce.proof.ts` 全绿（桶面既有约束不破）。期望 **EXIT=0** + 断言计数如实宣布 · 禁 retry-to-green。

## §5 Ban

Ban 开放支付入口（billing/actions.ts:4-7 封闭原样·支付开放另决）· Ban 动 paid 桶逻辑（payment.ts:84-86 原样·#26 比例结算 D3 未决不碰 commerce.ts:96-133）· Ban 死代码删除（§29 trial kind 枚举保留·本刀兑付非复活·gift 枚举同保留）· Ban 新增限流机制（#110 归 W4·本刀仅继承 signup 既有）· Ban 幂等键列方案（§1.1 定谳·partial index 唯一形制）· Ban SELECT-then-INSERT（payment.ts:18-20 自认缺陷）· Ban 改 0001_baseline/既有迁移（checksum 铁律·0001:2 亲读）· Ban secrets/`.env*` 入卷 · Ban self-approve/代签 peer（alone≠dual）· Ban retry-to-green/masking/假绿叙事 · Ban SSOT 编辑 · Ban push 冒充执行（docs-only 起草期）· Ban Meridian · Ban buy cloud。

## §6 Pins（十一值照抄 · 本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## §7 Non-claims

本刀 ≠ 防刷完备：**赠送 ≠ 反滥用**——同自然人换邮箱批量注册刷 trial 的攻击面本刀不设防（无邮箱验证/IP 维度/设备指纹·auth.service.ts:19 在产注释自认），批量注册风险**登记联动 #110**（W4 全面化），双审若判风险不可接受可裁「trial 发放挂 feature flag 灰度」。≠ 支付/付费转化完成（入口仍封闭·#271 归 W4）。≠ #261 余额 UI。≠ gift 发放面。≠ trial 过期后召回/提醒机制。prove 绿 ≠ 防刷已证（只证幂等一次与既有 402 链）。本刀发放 recruiter 账号试用外溢如实登记（B 端单场试用成本接受·归 #271 盘点）。

## §8 STOP

本 REQUEST 为 docs-only 起草，**不授权 coding/prove 执行/实跑/push 执行面**。下一步：预执行双审（`awaiting_pre_exec_dual`）——待裁项：①gateway 扩位形 A/B（§1.1 推荐扩展 gateway_auth_signup）②trial expires_at 365 天 vs 90 天（§1.4 推荐 365）③prove 键形制（新键 vs 扩 neg-commerce）④recruiter 同发确认（§1.1）。BOTH Verdict: PASS → meetwise 授权 EXEC → coding+prove 一次优先 → post-prove 双审 → meetwise 授权 nail。implementer 不自批 · **alone ≠ dual** · **STOP**。

---

*REQUEST stub · #228+#29 trial-grant · Line trial-grant · mw-trial001-draft · 2026-10-07 · PENDING awaiting pre-exec dual · alone ≠ dual · STOP*

## rev2 双审收口（2026-10-10 · 席1 PASS+席2 PASS·五处方转 EXEC 义务）

- **NC1（Non-claims 增）**：trial 入共享池四路径无差别可扣（mock_interview/resume_quiz/resume_diagnosis/ocr 同 reserve 1.0）；D1「够完成一场面试」=数量口径非路径锁定；钉路径=改已签共享池口径，归 D3/W4。
- **NC2（Non-claims 增）**：units_total=1.00 绑定当前已签量纲，D3 重定价时 trial 数量随动重裁（存量桶不回溯补差）；批量注册上限量化=60/min/实例全局·≤86,400 桶/天/实例·in-memory 重启清零·多实例倍增；flag 灰度留作 #110 前触发器。
- **NC3（Non-claims 增）**：signup+grant 不加审计行——溯源=user_account.created_at+kind='trial' 单写点+expires_at 反推；admin_audit 为 admin 域不扩。
- **P4（§4.2③ 归因修正）**：同邮箱并发双注册收敛由 user_account UNIQUE(email) 23505 达成（输家死于桶 INSERT 之前，不经 partial index）；prove 双层——(i) HTTP 并发同邮箱 Promise.all→恰一 2xx+恰一 409+桶恰 1 行（归因注明 UNIQUE）+(ii) 隔离库直插同 owner 第二条 trial→23505 证索引 DB 层兜底（必留）；(iii) 双 PoolClient 交错真并发可选（省略则 prove 叙事禁写「ON CONFLICT 并发已证」）。
- **EXEC 注意清单（席1 三条+席2 一条合并）**：①§4.3 夹具复用 neg-interview:218-264「推进 begin 至扣额面」播种形制；②0152 禁顶层 BEGIN/COMMIT（migrate.ts 硬抛）·普通 CREATE UNIQUE INDEX 于 runner 事务内·可重跑形制照 0018；③ON CONFLICT 谓词与 index 定义逐字一致·23505 断言用裸 INSERT；④0152 由与既有 gateway fn 同属主角色应用·prove 走真 HTTP signup 链。
- Status: `draft_rev2:pre_exec_dual_PASS`（双席 BOTH PASS·EXEC 授权·蓝本=本 rev2）。

## EXEC 执行收口（2026-10-10 · mw-trial001-exec · coding+prove 一次优先已履行）

- **交付**：`0152_trial_bucket_grant.sql`（partial unique index + gateway_auth_signup 同事务 trial 桶 + REVOKE/GRANT 0041 形重申）·sql/ 同步（23_api_gateway 函数体逐字一致 + 02_commerce 索引落真源·0018 先例形）·位形 A 零 TS 产品代码改动 · prove `apps/api/test/trial-grant.proof.ts`（键 `trial:grant:prove` 三处注册）·收据 `ai-docs/delivery/receipts/trial-grant/`。
- **Prove 逐键 EXIT**：`trial:grant:prove` 27/27 **EXIT=0**（[0] 真 runner 隔离容器空库全量 153/153 应用+重跑幂等+属主三方案硬门；[1] 主证 availableUnits=1+桶 1 行；[2i] HTTP 并发同邮箱恰一 200+恰一 409+桶 1 行；[2ii] 裸 INSERT 23505；[2iii] 双 PoolClient 交错 ON CONFLICT 收敛+裸败者 23505；[3] begin 202→402 夹具=neg-interview:218-264 形制；[4] 零回归不变量）· `neg:auth` 81 全绿 **0** · `neg:commerce` 84 全绿 **0** · `neg:interview` 97 全绿 **0** · `auth:prove` **0**。归因=P4：HTTP 并发收敛经 UNIQUE(email)；索引层并发由 (ii)+(iii) 独立已证。
- **EXEC 注意四条**：①②③④逐条履行证据见收据 §2（含 0152 属主角色不符即 prove 内硬抛即停核）。
- **est live=0**（无模型调用·零 secrets 入卷·日志已 grep 凭证）。
- Status: `exec:awaiting_post_prove_dual`（append-only·post-prove 双审前不视为收口·alone ≠ dual）。

## nail 落卷（2026-10-10 · mw-coordinator 回填席 · 协调方授权重编号）

- **回填链**：cherry-pick `3ef2403c` → 主线 `91c686d9`（author 原样保留 mw-trial001-exec；唯一冲突=本 REQUEST 文件 DU → dual-keep 全文保留；`run-e2e-isolated.mjs`/根+api `package.json` 三面自动并集·亲验 `trial:grant:prove` 三处注册齐）+ 重编号 `c51c792d`（mw-coordinator）。
- **Erratum #1（0152→0154 重编号）**：主线 0152/0153 已被 unstube-erase 两迁移占用（`0152_resume_soft_delete_fence`+`0153_account_deletion_column`·另有前史 `0152_consent_revoke_grant` 同号并存）——coord_notes 撞号预警兑现。`git mv` 迁移文件（SQL 面零改动·仅头注释编号+两行 provenance）·`sql/02_commerce.sql` 镜像编号注释同步（`23_api_gateway.sql` 无编号注释·亲证零需改）·proof 编号联动（manifest 断言字符串×2+文件路径+注释/断言标签）·收据日志内 0152/153 字样为 trial 线历史证据 append-only 不改。
- **Erratum #2（断言语义 末位→包含）**：终段复跑亲历 b110 席并发回填 `0155_recruiter_approval_gate` 入列使「末位=0154」断言红（applied=157/157 链仍全量绿·非本刀缺陷）——主线为活树·末位不稳定，断言改 `.includes('0154_trial_bucket_grant')`：全链 applied=total+本刀在列+重跑 skipped=total 仍证部署车全量与幂等·证明力不减。
- **主线树复跑记录**：`trial:grant:prove` @主线 `a2b161df`（回填+重编号后在树·一次性隔离容器 pgvector-legacy）——`runner_first_pass applied=156 total=156 last=0154_trial_bucket_grant` + virgin-ledger 全量应用 + 重跑幂等 + 属主三方案 OK · **27/27 全绿 EXIT=0**；另有重编号后首跑 @`c51c792d` 同形 27/27 EXIT=0（156/156 last=0154）。
- **双席 BOTH PASS（post-prove dual @协调方卷宗）**：**席1 `e0084ffb`**——0152（今 0154·SQL 面零改动）逐字合规 + [2iii] 真交错双证（双 PoolClient：ON CONFLICT 败者 rowCount=0 收敛 + 裸败者 23505）+ 修夹具裁定（neg-interview:218-264「推进 begin 至扣额面」形制）；**席2 `8d64b41b`**——P4 三层逐字（(i) HTTP 并发归因 UNIQUE(email) 23505+(ii) 裸 INSERT 23505+(iii) 交错真并发）+ 位形 A 原子性双向 fail-closed（signup 23505 回滚则桶不存在·桶冲突 DO NOTHING 不拖垮注册）+ FIFO 到期亲读。
- **五处方履行核**：NC1 共享池语义（四路径无差别可扣·数量口径非路径锁定）· NC2 量化滥用上限（60/min/实例全局·≤86,400 桶/天/实例·批量注册联动 #110）· NC3 审计豁免理由（溯源=created_at+kind 单写点+expires_at 反推）· P4 归因修正（prove 双层必留+(iii) 可选项已履行）· EXEC 注意四条合并（收据 §2 逐条证据）——rev2/EXEC 收口/收据三方对齐。
- **席2 两备注落卷**：① trial 过期桶未直接测——FIFO 到期过滤=谓词亲读+同抛点行使（402 insufficient_entitlement 同路径·非新建过期夹具）；② entitlement_bucket 无 FK 至 user_account——本刀 signup 同事务写入面无孤儿可能·未来 admin 发放面（无 signup 事务的直插路径）须自带属主校验·登记关注。
- Status: `nail:closed`（回填+重编号+nail 落卷·markers=0·est live=0·alone ≠ dual 已满足·#110 联动在卷）。
