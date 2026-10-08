# EXEC — **DBM3-1 · GAP-DEBT-DB-MONEY3 钱三轨 + 约束治理刀**（EXEC + 复跑全绿 · **`exec_completed_rerun:awaiting_post_prove_dual`**）

**Status**: **`exec_completed_rerun:awaiting_post_prove_dual`**（复跑 run#5 **EXIT=0 · 38/38 全 PASS** · 阻断已由 **DBACL-1 nail（0150 · 1caf7f32 ≡ 本支 cherry-pick `83ebcead`）**解除 · STOP 上报 · Ban self-approve 维持 · post-prove 双审归协调方）
**Date**: 2026-10-08（Asia/Shanghai）
**Knife**: `harness/dbm3-money-triple-track.md`（rev2 ≡ `04dc131a` · base 重钉 `578cae57`）· slice `dbm3-money-triple-track.slice.md`
**Authorization**: 协调方 EXEC 授权（双审 BOTH PASS · 裁定 D1=案B/D3/D4/D6 · 顺延 0149 · P0 负样本 N1 落法）+ 复跑指令（DBACL-1 nail 后 resume）
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

**复跑增量面（resume 指令）**：cherry-pick `1caf7f32`（DBACL-1 0150 + db-acl prove + wiring · 本支 `83ebcead`）——`package.json`/`packages/db/package.json`/`scripts/run-e2e-isolated.mjs` 三处冲突**双留解**（db-money3 + db-acl wiring 并存 · 各 4 注册点齐全 · node --check + JSON 校验过）；`db-money3.proof.ts` 五处断言机械修正（run#4 红因 · §2 行 4：P3-2 Number 等值 · P3-4 改断 commerce_outbox settlement_proposed（同事务真相 · settlement_ledger=sweeper 下游 commerce.ts:373 亲核）· P5-1/P6-3 注释剥离 · P6-1 空白归一）。

## §2 Prove attempts 全账（Ban retry-to-green · 每次运行无论红绿全记录）

| # | at(UTC) | pid | EXIT | 红/绿 | 结果与因 |
|---|---------|-----|------|-------|---------|
| 0 | 2026-10-08T10:07:05Z | 64634 | 1 | 红（infra） | `isolated_postgres_database_not_ready:boot`——worktree node_modules 未装（WARN 在卷）→ `pnpm install --frozen-lockfile` 后复跑；prove 未启动（无 ATTEMPT 行） |
| 1 | 2026-10-08T10:07:31Z | 68744 | 1 | 红 | P0 造数炸 `interview_privacy_fenced`（P0001）——ai_graph_run 有 0059 BEFORE 围栏触发器，thread_id 须指向 privacy-active interview；修：预置 interview 行 + thread_id 引用之 |
| 2 | 2026-10-08T10:09:00Z | 70583 | 1 | 红 | 同围栏复炸——0058 谓词读 **GUC `app.principal_user`**（非 role · superuser 池无 GUC 也拦）；修：一切 ai_graph_run 写路径 tx 内 `set_config(..., is_local=true)`（P0/P2-6/P4 三处） |
| 3 | 2026-10-08T10:10:16Z | 72276 | 1 | **红（跨刀真雷 · §3）** | **P0+P1+P2 全 25/25 PASS 后**，P3 真实写路径炸 `42501 permission denied for function uuidv7`——`markOrderPaidAndCredit`（payment.ts:83 bucket INSERT · asPrincipal/app_role）触发 DEFAULT `uuidv7()`，而 app_role 无 EXECUTE |
| — | 2026-10-08T10:1x | — | **0** | 绿（联动门） | `drift:prove` PASS×2（L1 fixture 对齐生效）· `migrate:prove` 全过（L2 + checksum 账本 + 0149 应用=145 文件零漂移） |
| 4 | 2026-10-08T11:36:22Z | 45374 | 1 | 红（5 断言机械缺陷） | **DBACL-1 0150 cherry-pick 后复跑**：P3-1 转绿（0150 生效 · credited/already 幂等全链通）· 5 红全为 prove 断言机械缺陷非 schema 面——P3-2 numeric '10.00' 字符串等值（应 Number 比）· P3-4 settlement_ledger 是 sweeper 下游（同事务真相=commerce_outbox settlement_proposed · commerce.ts:130/:373 亲核）· P5-1 fixture 对齐注释字样自匹配（应剥注释再测）· P6-1 空白未归一（dbid1 同款红因）· P6-3 文件头纪律注释「ALTER COLUMN TYPE」字样误中（应测代码面）——五处全修（断言面收紧非放松：Number 等值/架构正确产物/注释剥离/空白归一） |
| 5 | 2026-10-08T11:38:13Z | 48385 | **0** | **绿** | **38/38 全 PASS · EXIT=0**（P0×4+P1×9+P2×7+P3×6+P4×4+P5×3+P6×4+P7×1=38 · 收据 `.tmp/isolated-proof-receipts/2026-10-08T11-38-14-232Z-48385-7b4e1ea2-…json` · release_evidence=false）；`migrations: applied=146`（0001–0143×2+0149+0150）零漂移；复证 `drift:prove` PASS×2 · `migrate:prove` 全过 |

**P0–P2 全绿清单（run#3）**：P0-1..4（负样本 RAISE 具名四计数=1 · 回滚归零 · 干净重跑幂等）· P1-1..9（四 CHECK 具名 · 0027 删/0021 留 · 唯一结构恰 1 · consumption_record 负门 0 CHECK）· P2-1..7（-1/0/1.005/1e10/-5/'runing'/-1 全 23514）。

## §2a 复跑全绿清单（run#5 · DBACL-1 0150 解除阻断后）

P3-1..6（payment_order 全链 credited→already 幂等 · 发桶恰 1 · saga reserve1.5→confirm→reserve→release 全退 · settlement_proposed outbox 同事务在卷 · appendEvent 重复 eventKey 返既有 seq · 无 key 连写自增）· P4-1..4（uq_active_run 23505 · 终态释放槽位 · 双终态并存 · 正边界 1 分/0.5 次）· P5-1..3（L1 fixture 代码面无表级约束 + partial 在卷 · L2 migrate.proof 契约）· P6-1..4（语句白名单 1×DO+5×DROP+4×ADD 恰好 · 零禁词含 DO 体 · 零 ALTER TYPE · 四约束名逐名）· P7-1（对表勾销块 + NEXT-NODE C4）——**38/38 · EXIT=0**。

## §3 阻断根因（跨刀潜伏雷 · DBID-1 EXEC 遗留 · **已由 DBACL-1 清偿 · 2026-10-08 nail**）

**根因链（亲核 file:line）**：
1. `0073_rag_control_plane_identity_isolation.sql:1342`：`ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;`（库级默认权限收紧——此后由迁移角色新建的函数不再默认授 PUBLIC EXECUTE）。
2. `0143_db_id_v7_unify.sql:14`：`CREATE OR REPLACE FUNCTION public.uuidv7()` 在 0073 **之后**创建（2026-10-08 DBID-1 EXEC）→ 继承收紧后的默认 ACL → PUBLIC/app_role **无 EXECUTE**（0143 全文零 GRANT · 亲核）。
3. DBID-1 prove 结构性盲区：P5 INSERT 冒烟走 **superuser 池**（绕 ACL）· P8 API 冒烟只走 begin() 守卫（无 bucket INSERT）→ 双审/post-dual 均不可能捕获。
4. DBM3 P3 真实写路径首次以 **app_role** 触发 DEFAULT：`markOrderPaidAndCredit`（payment.ts:83 `INSERT INTO entitlement_bucket` · 生产路径 = apps/api commerce.service.ts:45 `asPrincipal`）→ **42501**。

**波及面（1 处实锤 + 同构推断 · 已实锤=本收据 run#3 红）**：0143 切换的 55 表中一切**依赖 DEFAULT uuidv7() 且以 app_role 执行的 INSERT**。生产实锤路径：**支付回调发桶（payCallback → markOrderPaidAndCredit → bucket INSERT）——0143 合入后每一次成功支付的入账都会 500**（回调事务回滚 · 订单卡 created）。同构高危（代码读面推断 · 未逐一实跑）：`reserveEntitlement`/`confirmConsumption` 的 `entitlement_consumption`/`commerce_outbox`/`settlement_ledger` INSERT（均不带显式 id · commerce.ts:50/:122 族）——即 commerce saga 全链。旧行 v4 不受影响（存量行无 DEFAULT 重算）；B2 显式 id 路径不受影响。
**旁证**：commerce 族 prove（uc017/uc018/uc011）自 0143 合入后未再跑过（pins g7SuiteGreen=false）——雷一直未被任何门踩到。

## §4 处置结局（原 STOP 升级 → 已裁定清偿）

协调方采纳**选项 B 变体**：DBACL-1 独立刀立项（本收据 §3 为其根因卷）→ migration `0150_uuidv7_grant_acl.sql` 恰 8 GRANT 闭集（catalog 机检推导：7 SD owner + app_role · GRANT-only）→ post-dual BOTH PASS · nail @`578cae57` 卷首。**本刀按复跑指令 cherry-pick `1caf7f32`（≡ 本支 `83ebcead` · 三处 wiring 冲突双留解 · 保持 0149→0150 让位序）**，P3–P7 随之全绿。原选项 A（本刀自加 GRANT）/C（回滚）未启用。

## §5 硬 Ban 自证（§5 全生效）

1. 历史迁移零改（0001–0143 checksum 零漂移 · migrate:prove「再部署全 skip」绿）。
2. 业务语义零变更（succeeded/completed 并存保留 · P4-3 断言已写 · 枚举只增）。
3. RLS/权限面零触碰（0149 文本零 GRANT/REVOKE/POLICY——P6-2 白名单禁之 · **正因如此 §3 修复须先修 Ban 面**）。
4. 零 secrets/真实数据（隔离库惰性注入 · 收据 release_evidence=false）。
5. 零洗存量（0149 先检测后约束 · 脏行 RAISE 上报不修）。
6. 共享 SSOT 零触碰（gap-bug-backlog.md 未动——§3 雷按流程以本收据 + STOP 报告升级，不擅自加行）。
7. 零 ALTER TYPE（D1 裁案B · P6-3 断言在卷）。

## §6 Non-claims（不变）

≠HA · ≠suite green · ≠SLO 量化 · ≠存量修复 · ≠业务语义变更 · ≠RLS/权限面（0150 归 DBACL-1 刀）· ≠coveredCount 变化 · releaseEvidence=false · actualSpendCny=null · local green ≠ stack truth · **run#5 绿 ≠ 自动 nail**（awaiting post-prove dual + meetwise 授权）。

---

*EXEC receipt · DBM3-1 · 2026-10-08 · exec_completed_rerun:awaiting_post_prove_dual（run#5 EXIT=0 · 38/38 · 阻断经 DBACL-1 0150 nail 解除 · cherry-pick 83ebcead 双留 wiring）· attempts 6 跑全账 · drift/migrate 两门复证绿 · pins 全保留 · Ban self-approve · Dual PASS ≠ nail*
