# DBACL-1 — uuidv7() EXECUTE ACL 修复刀（0150）

**状态**：`draft:awaiting_pre_exec_dual` · **立项依据**：三刀独立同指同雷（DBTF-1 model-op 席 F1 静态链 + DBFK-1 EXEC P7 base-identical red ×4 + DBM3-1 EXEC P3 42501 实炸）· 协调方裁决 B 变体（独立刀 0150，不并入 0149、不回滚 0143）· **base = 主线 `67b4b573`**（migrations 尾=双 0143；0144-0149 归 DBHY/DBFK/DBM3 让位序，本刀落 **0150**，文件名序即执行序保证 0150 在 0144-0149 后生效）。

## 1. 雷的根因链（三刀互证 · 亲核行号）
- `migrations/0073_*.sql:1342`：`ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`（迁移 owner 作用域）。
- `migrations/0143_db_id_v7_unify.sql:14`：`CREATE FUNCTION public.uuidv7()` 创建于上述 REVOKE 之后，**全文件零 GRANT** ⇒ `pg_proc.proacl` 无 PUBLIC/app_role/privacy DEFINER owner 条目，仅 owner 可 EXECUTE。
- 55 表 `DEFAULT uuidv7()`（0143:75 等）⇒ 任何以 app_role/DEFINER owner 身份的 INSERT 全部 `42501 permission denied for function uuidv7`。

## 2. 受影响生产路径（实证清单）
1. **commerce 发桶**（最重·DBM3-1 P3 实炸）：`apps/api/src/commerce.service.ts:45` asPrincipal(app_role) 发桶 INSERT → **0143 合入后每次成功支付 500**。
2. **report enqueue**：`apps/worker/src/report.ts:15`（DBFK-1 升级报告点名）。
3. **0096 隐私擦除链**：begin/issue/purge 收据面（SD owner=privacy_api_owner DEFINER 调 uuidv7）。
4. **question_rubric 写**（DBFK-1 点名）。
5. **同构高危同查**：entitlement_consumption / commerce_outbox / settlement_ledger 等 55 表中 DEFAULT uuidv7() 且写者为受限角色的全部写点（P2 全量枚举入收据）。

## 3. 修法（单文件 `0150_uuidv7_grant_acl.sql` · 仅 GRANT 语句）
- `GRANT EXECUTE ON FUNCTION public.uuidv7() TO app_role;`
- `GRANT EXECUTE ON FUNCTION public.uuidv7() TO <privacy DEFINER owners 全集>;` —— 名单 **EXEC 期 catalog 亲证**（从 0096/0140/0141 SECURITY DEFINER 函数的 proowner 及既有 GRANT 先例推导，禁发明角色；收据落名单+推导行号）。
- 幂等（GRANT 天然幂等）· 无函数体改动 · uuidv7 逻辑零字节变化。

## 4. prove（`packages/db/prove/db-acl.proof.ts` + script wiring）
- **P0 复现负门**：修复前 asPrincipal(app_role) INSERT 带 DEFAULT uuidv7 → 恰 `42501`（雷在卷证明）。
- **P1 proacl 实证**：修复后 `pg_proc.proacl`（uuidv7）含 app_role + 名单全集逐角色。
- **P2 app_role 真实写路径**：发桶型 INSERT 成功（模拟 DBM3-1 P3 场景）+ 55 表 DEFAULT uuidv7() 写点全量枚举入收据（表→写角色→是否受限矩阵）。
- **P3 隐私擦除链三面**：begin/issue/purge 路径绿（0096 面）。
- **P4 report enqueue 面**：绿。
- **P5 过度授权负门**：未授权角色（新建无关系角色）仍恰 42501；GRANT 面恰最小（无 GRANT ALL、无多余函数、无发明角色——静态扫描 0150 全文白名单）。
- **P6 历史迁移零 diff**：0001-0149 零字节改（含 0073/0143 原样）；0150 恰一文件。
- **P7 migrate:prove 全绿 + drift:prove 零漂移 + applied 数与文件数一致**。

## 5. Ban（硬约束）
- 禁改 0073/0143 及任何历史迁移字节 · 禁 GRANT ALL · 禁发明角色（名单 catalog 亲证）· 禁触 uuidv7 函数体 · 禁顺手改其他 ACL（最小面）· pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）· 实现不自批 · alone≠dual。

## 6. 受益复跑（本刀收账后解锁 · 非本刀面）
- DBFK-1：worktree cherry-pick 0150 → P7 四项回归复跑拿绿收据 → post-dual 全链。
- DBM3-1：同法复跑 P3-P7 → post-dual 全链。
- 本刀 prove est：0 live 模型调用 · 0 Key · 全本地 docker PG · actualSpendCny=null。

## 7. 验收
- `pnpm --filter @meetwise/db prove:db-acl` EXIT=0 · P0-P7 全 PASS · attempts 全账（红→绿逐修·非 retry-to-green）· 收据 `ai-docs/delivery/receipts/dbacl-uuidv7-grant/`。
