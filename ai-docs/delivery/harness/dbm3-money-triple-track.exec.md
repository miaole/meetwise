# EXEC — **DBM3-1 · GAP-DEBT-DB-MONEY3 钱三轨 + 约束治理刀**（EXEC · **`exec_blocked_cross_knife_acl`** · STOP @协调方裁定）

**Status**: **`exec_blocked_cross_knife_acl`**（STOP · push 后回报 · awaiting coordinator ruling）
**Date**: 2026-10-08（Asia/Shanghai）
**Knife**: `harness/dbm3-money-triple-track.md`（rev2 @`13b1c120` ≡ f5766102 · base 重钉 `aa4ea25c`）· slice `dbm3-money-triple-track.slice.md`
**Authorization**: 协调方 EXEC 授权（双审 BOTH PASS · 裁定 D1=案B/D3/D4/D6 · 顺延 0149 · P0 负样本 N1 落法）
**Pins（全保留 · 零翻转）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null

---

## §1 落地面（与 harness §8 预告面一致 · 零越界）

| 文件 | 动作 | 内容 |
|------|------|------|
| `packages/db/migrations/0149_money_status_constraints.sql` | 新增 | 前置脏值检测 DO 块（四类计数具名 RAISE `dbm3_dirty_rows`）+ 正数 CHECK（amount_cents>0）+ 案B 护栏（units>0 且 ≤9999999999.99 且 =round(·,2)）+ settlement_ledger ≥0（D4）+ ai_graph_run 11 值枚举（D6）+ DROP CONSTRAINT uq_interview_event_key_constraint（D3 保 0021 partial）。全部幂等（DROP IF EXISTS + ADD）。**零号亲核**：0144–0148 协调方让位序预留（DBTF-1/DBHY-1/DBFK-1 分支均未见实占文件）→ 0149 落号 |
| `packages/db/sql/01_schema.sql` | 修改（L1） | interview_event 表级 `uq_event_key` 约束 → 0021 同形 partial index（drift:prove 方向约束） |
| `packages/db/test/db-money3.proof.ts` | 新增 | P0–P7（P0 负样本自证 = 基线态重构 + SAVEPOINT p0_neg 两跑全账） |
| `packages/db/test/migrate.proof.ts` | 修改（L2） | :307 断言契约更新（0027 约束存在 → 0149 后终态：约束=0 且 0021 partial 仍在） |
| `package.json` + `packages/db/package.json` | 修改 | `db-money3:prove` / `db-money3:prove:raw` / `prove:db-money3` |
| `scripts/run-e2e-isolated.mjs` | 修改 ×4 点 | target 源清单 / known-targets / dispatch / **migrate allowlist**（dbid1 attempt#0 红因防复发） |
| `ai-docs/architecture/backend/money-convention.md` | 新增 | 三轨映射表 + bigint 分单位/后缀约定 + 新表规范 + 存量豁免登记（id-convention 同级） |
| `ai-docs/delivery/harness/dbm3-money-triple-track.exec.md` | 新增 | 本收据 |

**摘除面（rev2 裁定）**：consumption_record 零 CHECK（DBHY-1 DROP 先行 · P1-9 负门断言防复活）。

## §2 Prove attempts 全账（Ban retry-to-green · 每次运行无论红绿全记录）

| # | at(UTC) | pid | EXIT | 红/绿 | 结果与因 |
|---|---------|-----|------|-------|---------|
| 0 | 2026-10-08T10:07:05Z | 64634 | 1 | 红（infra） | `isolated_postgres_database_not_ready:boot`——worktree node_modules 未装（WARN 在卷）→ `pnpm install --frozen-lockfile` 后复跑；prove 未启动（无 ATTEMPT 行） |
| 1 | 2026-10-08T10:07:31Z | 68744 | 1 | 红 | P0 造数炸 `interview_privacy_fenced`（P0001）——ai_graph_run 有 0059 BEFORE 围栏触发器，thread_id 须指向 privacy-active interview；修：预置 interview 行 + thread_id 引用之 |
| 2 | 2026-10-08T10:09:00Z | 70583 | 1 | 红 | 同围栏复炸——0058 谓词读 **GUC `app.principal_user`**（非 role · superuser 池无 GUC 也拦）；修：一切 ai_graph_run 写路径 tx 内 `set_config(..., is_local=true)`（P0/P2-6/P4 三处） |
| 3 | 2026-10-08T10:10:16Z | 72276 | 1 | **红（跨刀真雷 · 本收据 §3）** | **P0+P1+P2 全 25/25 PASS 后**，P3 真实写路径炸 `42501 permission denied for function uuidv7`——`markOrderPaidAndCredit`（payment.ts:83 bucket INSERT · asPrincipal/app_role）触发 DEFAULT `uuidv7()`，而 app_role 无 EXECUTE |
| — | 2026-10-08T10:1x | — | **0** | 绿（联动门） | `drift:prove` PASS×2（L1 fixture 对齐生效）· `migrate:prove` 全过（L2 + checksum 账本 + 0149 应用=145 文件零漂移） |

**P0–P2 全绿清单（run#3）**：P0-1..4（负样本 RAISE 具名四计数=1 · 回滚归零 · 干净重跑幂等）· P1-1..9（四 CHECK 具名 · 0027 删/0021 留 · 唯一结构恰 1 · consumption_record 负门 0 CHECK）· P2-1..7（-1/0/1.005/1e10/-5/'runing'/-1 全 23514）。P3–P7 因 §3 阻断未达（断言面已写就 · 阻断解除即可跑）。

## §3 阻断根因（跨刀潜伏雷 · DBID-1 EXEC 遗留 · 非 DBM3 面）

**根因链（亲核 file:line）**：
1. `0073_rag_control_plane_identity_isolation.sql:1342`：`ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;`（库级默认权限收紧——此后由迁移角色新建的函数不再默认授 PUBLIC EXECUTE）。
2. `0143_db_id_v7_unify.sql:14`：`CREATE OR REPLACE FUNCTION public.uuidv7()` 在 0073 **之后**创建（2026-10-08 DBID-1 EXEC）→ 继承收紧后的默认 ACL → PUBLIC/app_role **无 EXECUTE**（0143 全文零 GRANT · 亲核）。
3. DBID-1 prove 结构性盲区：P5 INSERT 冒烟走 **superuser 池**（绕 ACL）· P8 API 冒烟只走 begin() 守卫（无 bucket INSERT）→ 双审/post-dual 均不可能捕获。
4. DBM3 P3 真实写路径首次以 **app_role** 触发 DEFAULT：`markOrderPaidAndCredit`（payment.ts:83 `INSERT INTO entitlement_bucket` · 生产路径 = apps/api commerce.service.ts:45 `asPrincipal`）→ **42501**。

**波及面（1 处实锤 + 同构推断 · 已实锤=本收据 run#3 红）**：0143 切换的 55 表中一切**依赖 DEFAULT uuidv7() 且以 app_role 执行的 INSERT**。生产实锤路径：**支付回调发桶（payCallback → markOrderPaidAndCredit → bucket INSERT）——0143 合入后每一次成功支付的入账都会 500**（回调事务回滚 · 订单卡 created）。同构高危（代码读面推断 · 未逐一实跑）：`reserveEntitlement`/`confirmConsumption` 的 `entitlement_consumption`/`commerce_outbox`/`settlement_ledger` INSERT（均不带显式 id · commerce.ts:50/:122 族）——即 commerce saga 全链。旧行 v4 不受影响（存量行无 DEFAULT 重算）；B2 显式 id 路径不受影响。
**旁证**：commerce 族 prove（uc017/uc018/uc011）自 0143 合入后未再跑过（pins g7SuiteGreen=false）——雷一直未被任何门踩到。

## §4 处置选项（STOP 待协调方裁定 · mw-core 不越权自裁）

| 选项 | 内容 | 代价/风险 |
|------|------|-----------|
| **A（mw-core 建议）** | 授权 0149 增补一行 `GRANT EXECUTE ON FUNCTION public.uuidv7() TO app_role;`：一刀修复 · DBM3 P3 立即可跑全绿（GRANT 属最小权限——app_role 是唯一业务运行角色 · 与 0121 pgcrypto 先例同式） | **须双审修正面**：harness §5 Ban「RLS/权限面」与 P6-2 静态门（禁 GRANT）按此增补修订——属 REQUEST face 变更，不可 mw-core 单方改 |
| B | 归 DBID-1 修复轮（post-dual 惯例：谁的 EXEC 遗留谁修）出 0150 补 GRANT；DBM3 rebase 后重跑 P3 | 两刀两次部署窗口；修复轮须补 app_role DEFAULT 路径冒烟防复发（本收据 §3 即其根因卷） |
| C | 生产回滚 0143（撤 55 表 DEFAULT 切换） | 最重 · 违 DBID-1 append-only 终态声明 · 不建议 |

**mw-core 不做**：不经授权擅加 GRANT（违本刀 Ban 面 + dual 已批面）；不用 superuser 池伪造 P3「绿」（真实生产路径=app_role · 假绿违 prove 诚实纪律）。

## §5 硬 Ban 自证（§5 全生效）

1. 历史迁移零改（0001–0143 checksum 零漂移 · migrate:prove「再部署全 skip」绿）。
2. 业务语义零变更（succeeded/completed 并存保留 · P4-3 断言已写 · 枚举只增）。
3. RLS/权限面零触碰（0149 文本零 GRANT/REVOKE/POLICY——P6-2 白名单禁之 · **正因如此 §3 修复须先修 Ban 面**）。
4. 零 secrets/真实数据（隔离库惰性注入 · 收据 release_evidence=false）。
5. 零洗存量（0149 先检测后约束 · 脏行 RAISE 上报不修）。
6. 共享 SSOT 零触碰（gap-bug-backlog.md 未动——§3 雷按流程以本收据 + STOP 报告升级，不擅自加行）。
7. 零 ALTER TYPE（D1 裁案B · P6-3 断言在卷）。

## §6 Non-claims（不变）

≠HA · ≠suite green · ≠SLO 量化 · ≠存量修复 · ≠业务语义变更 · ≠RLS/权限面（含 §3 修复——待授权）· ≠coveredCount 变化 · releaseEvidence=false · actualSpendCny=null · local green ≠ stack truth · **P0–P2 绿 ≠ 本刀完成**（P3–P7 阻断待裁）。

---

*EXEC receipt · DBM3-1 · 2026-10-08 · exec_blocked_cross_knife_acl（STOP @协调方裁定）· P0–P2 25/25 绿 + drift/migrate 两门绿 · P3 阻断于 DBID-1 uuidv7 ACL 潜伏雷（0073:1342 × 0143:14 × app_role 生产回调路径实锤 42501）· attempts 4 跑全账 · pins 全保留 · Ban self-approve*
