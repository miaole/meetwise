# EXEC 收据 — **#228+#29 注册赠送体验额度刀**（Line trial-grant · 蓝图 trial-grant-REQUEST.md @4f8e5942 rev2）

**Seat**: `mw-trial001-exec`（mw-core·W1 主路径线 EXEC 席）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-trial001` · branch `line/trial-grant` · 蓝图亲读于 `4f8e5942`（rev2·`git pull` 后 Already up to date）
**Date**: 2026-10-10（本地；隔离容器跑窗 UTC 时间戳在卷）
**Status**: `exec:awaiting_post_prove_dual`（REQUEST 状态行 append-only 已履行）
**est live**: **0**（prove 全程无模型调用：harness `delete MODEL_API_KEY/MODEL_BASE_URL`；begin 只入队不消费；token/哈希均为本地测试 fixture）

---

## 1. 交付面（范围严格=§1 · 逐项）

| § | 面 | 文件 | 内容 |
|---|---|---|---|
| ① | 迁移（新） | `packages/db/migrations/0152_trial_bucket_grant.sql` | ①`CREATE UNIQUE INDEX IF NOT EXISTS uq_bucket_trial_one_per_owner ON entitlement_bucket (owner_user_id) WHERE kind = 'trial'`；②`CREATE OR REPLACE FUNCTION gateway_auth_signup(...)` 加 trial 桶 INSERT（同函数体内=同事务）；③REVOKE/GRANT 照 0041:139-142 原样重申 |
| ① | sql/ 源同步 | `packages/db/sql/23_api_gateway.sql` | gateway_auth_signup 函数体与 0152 逐字一致（diff 亲证 ex-comments identical，`grep -c` 谓词三处一致） |
| ① | sql/ 源同步 | `packages/db/sql/02_commerce.sql` | partial unique index 落桶表真源（**0018 先例形**：0018 的列+UNIQUE 同步进 sql/11_commerce.sql；`源文件=真源·迁移=部署车` §3.2 备注）——同时是 harness `_neg-harness.ts:65` sql/ 全量装载路径拿到索引的唯一途径，否则 ON CONFLICT 无 arbiter 可匹配、signup 全线 500、零回归不可能 |
| ② | gateway 扩展（位形 A） | （函数在上述两 SQL 文件内） | `INSERT INTO public.entitlement_bucket(owner_user_id, kind, units_total, expires_at) VALUES (p_id, 'trial', 1.00, now() + interval '365 days') ON CONFLICT (owner_user_id) WHERE kind = 'trial' DO NOTHING`——桶参数常量 kind='trial'·units=1.00·expires 365d 同 paid 唯一先例（payment.ts:85）·source_order_id 缺省 NULL |
| ③ | prove | `apps/api/test/trial-grant.proof.ts`（新） | §4 断言表 27 条（详 §3） |
| ③ | prove 键注册 | `apps/api/package.json` / 根 `package.json` / `scripts/run-e2e-isolated.mjs` | 键 `trial:grant:prove`（apps/api 本地脚本 + 根隔离入口 + allowlist + isolatedCommand 分派；apps/api 无 `pg` 直接依赖，runner 段改用仓内授权原语 `createPool`） |
| — | TypeScript 产品代码 | **零改动** | 位形 A：auth.service.ts:29-32 唯一调用方签名不变（§3 行3「选 A 零代码改动」）；payment.ts:84-86、commerce.ts:96-133、billing/actions.ts:4-7、rate-limit 面全部零触 |

## 2. EXEC 注意四条逐条履行证据（rev2 清单）

**① §4.3 夹具复用 neg-interview:218-264「推进 begin 至扣额面」播种形制**
`trial-grant.proof.ts` 内 `applyBeginChainPreamble()` 逐字镜像 neg-interview.proof.ts:27-180 的 additive-only 预置补丁（0058 栅栏函数/0064 v64 面/0049 绑定语义/0142 route 表+RLS policy），`seedBeginFixture()` 复刻「resume ingested + created 面试 INSERT 时绑定 + route decision/snapshot 预供给（事务内 `SET app.principal_user`）」三步形制；begin#1 202（扣额面已过·trial 1.00 预留）→ begin#2 402。保真负证：prove 内断言 harness 播种用户（userA/userB/pwUser，不经 gateway fn）**零 trial 桶** PASS——夹具形制未被本刀污染。日志：`logs/trial-grant-prove.log`。
（差异登记：夹具第二份简历 content_sha 必须异值——同 owner 同 sha 撞 `uq_resume_content_active` 部分唯一索引被 `ON CONFLICT DO NOTHING` 静默吞行，neg-interview 因双 owner 未踩；本 prove 用 SHA64B='c'*64 解决，非形制改动。）

**② 0152 禁顶层 BEGIN/COMMIT · 普通 CREATE UNIQUE INDEX 于 runner 事务内 · 可重跑形制照 0018**
- 文件无顶层 BEGIN/COMMIT/ROLLBACK/END（`migrate.ts:29-87 containsTopLevelTransactionControl` 对真 manifest 硬抛面被行使：prove [0] 段以 `loadMigrations(dir)+runMigrations()` 真 runner 在隔离容器一次性空库**全量应用 0001→0152 共 153 个迁移**，`applied=153/153 last=0152_trial_bucket_grant`——若 0152 含顶层事务控制，canonicalMigrations 在首个迁移前即抛 `migration_transaction_control_forbidden`）。
- 重跑幂等：二次 `runMigrations` → `applied=0 skipped=153`（ledger+checksum 幂等）；且 0152 裸 SQL 文本在已成形库上双 apply 不抛（IF NOT EXISTS + CREATE OR REPLACE + REVOKE/GRANT 重申，0018 可重跑形制）。日志两行 `trial-grant[0] runner_*` 见 prove log 头部。

**③ ON CONFLICT 谓词与 index 定义逐字一致 · 23505 断言用裸 INSERT**
- 逐字：index `... ON entitlement_bucket (owner_user_id) WHERE kind = 'trial'` ↔ arbiter `ON CONFLICT (owner_user_id) WHERE kind = 'trial'`——两处文本逐字相同（迁移、sql/02、sql/23 三文件 `grep -c "WHERE kind = 'trial'"` 全数在卷）。
- 裸 INSERT 23505：`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'trial',...)`（无 ON CONFLICT 子句）对已有 trial owner → `errCode===23505` PASS，且桶仍恰 1 行。DB 层兜底实证，非应用层软约束。

**④ 0152 由与既有 gateway fn 同属主角色应用 · prove 走真 HTTP signup 链**
- 属主三方案（空库 runner 形 + harness 库形各一次）：`pg_proc.proowner（gateway_auth_signup）== pg_class.relowner（entitlement_bucket）== current_user`，两侧均 PASS；**不符即硬抛 `trial_grant_owner_role_mismatch`（prove 内即停，不出绿）**——停止条件核在库。
- 真 HTTP 链：boot() 起真 NestJS/Fastify（pino req/res 日志在卷）+ fetch 打 `POST /auth/signup`、`GET /commerce/entitlement`、`POST /interview/:id/begin`；无任何 SQL 旁路替代主证（DB 直查仅作桶行归因/readback）。

## 3. Prove 逐键 EXIT（隔离门 run-e2e-isolated · 每键独立一次性容器）

| 键 | 断言数 | EXIT | 内容 |
|---|---|---|---|
| `trial:grant:prove` | 27 | **0**（`✓ trial:grant:prove: 27 条…全绿`） | [0] 真 runner 153/153+重跑幂等+属主三方案+裸双 apply；[1] 主证 availableUnits=1+桶 1 行（kind/units/expires±365d/source_order_id NULL）；[2i] HTTP 并发同邮箱 Promise.all 恰一 200+恰一 409 email_taken+赢家桶恰 1 行；[2ii] 裸 INSERT 23505；[2iii] 双 PoolClient 交错（ON CONFLICT 败者 rowCount=0 收敛·裸败者 23505）；[3] begin#1 202→begin#2 402 insufficient_entitlement+桶面 total/reserved=1.00；[4] 顺序 409 桶不增+gateway 输入校验不变（role 400/弱密码 400）+播种用户零 trial 桶 |
| `neg:auth` | 81 | **0** | `✓ neg:auth: 81 条负路径用例全绿` |
| `neg:commerce` | 84 | **0** | `✓ neg:commerce: 84 条负路径用例全绿` |
| `neg:interview` | 97 | **0** | `✓ neg:interview: 97 条负路径用例全绿`（夹具源 prove 同跑·超额保险） |
| `auth:prove` | domain 核心 | **0** | `✓ 认证核心 全部通过`（packages/domain，无 DB 面） |

归因声明（rev2 P4 逐字履行）：HTTP 并发同邮箱的收敛归因 **user_account UNIQUE(email) 23505**（输家死于桶 INSERT 之前，不经 partial index）——prove 注释与收据同此口径；partial index 的并发兜底由 (ii) 裸 INSERT + (iii) 双 PoolClient 交错独立证明，故「ON CONFLICT 并发已证」措辞**有 (iii) 支撑**（可选项已履行，非省略）。

## 4. 停止条件核查（蓝图 §5 + EXEC 注意④·逐条 PASS）

1. **0152 属主角色**：与既有 gateway fn 同属主（prove [0] 硬门）——PASS，未触发即停。
2. **既有迁移禁改（checksum 铁律）**：`git status` 仅新增 0152+两 sql/ 源+prove+键注册，0001-0151 零字节触碰——PASS。
3. **支付入口封闭（billing/actions.ts:4-7）/ paid 桶逻辑（payment.ts:84-86）/ #26 比例结算（commerce.ts:96-133）**：零触碰——PASS。
4. **禁 SELECT-then-INSERT / 禁幂等键列方案**：函数体唯一写入形=ON CONFLICT DO NOTHING（payment.ts:18-20 缺陷面未复刻）；无新列——PASS。
5. **Ban 新增限流/Ban 死代码删除/Ban secrets 入卷/Ban SSOT 编辑/Ban retry-to-green**：零限流代码；trial/gift 枚举零删（本刀=trial 首个生产写入点=兑付）；收据日志 grep 无凭证串（`NO SECRETS IN LOGS`）；REQUEST 状态行 append-only；断言失败即修真因（uq_resume_content_active 同 owner 唯一→异 sha）非重跑刷绿——PASS。

## 5. Pins（十一值照抄 §6 · 本刀不改口）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事；隔离壳 E2E_PG_IMAGE=pgvector-legacy 亦为 test infra 叙事非栈真相）· 公开 `DELETE /privacy/interview-data/:id=503` · `g7SuiteGreen=false` · `actualSpendCny=null` · `r1Closed=false`

## 6. Non-claims 重申（rev2 NC1-NC3 承接）

trial 入共享池四路径无差别可扣（数量口径非路径锁定）；批量注册上限=既有 signup 限流 60/min/实例全局（≤86,400 桶/天/实例·in-memory 重启清零·多实例倍增）·防刷全面化归 #110/W4；signup+grant 无审计行（溯源=created_at+单写点+expires_at 反推）；本绿 ≠ 防刷已证、≠ HA、≠ releaseEvidence、≠ 支付入口开放。

---

*收据 · #228+#29 trial-grant · mw-trial001-exec · awaiting_post_prove_dual · alone ≠ dual · post-prove 双审前不视为收口*
