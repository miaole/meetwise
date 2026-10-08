# DBACL-1 — uuidv7() EXECUTE ACL 修复刀（0150）

**状态**：`draft_rev2:awaiting_pre_exec_dual_recheck`（rev1 双席 FAIL 同指 §3 推导源不闭合——处方已落实：catalog 机检 8-GRANT 闭集+P2 双向断言+P5 客观基线+路径笔误） · **立项依据**：三刀独立同指同雷（DBTF-1 model-op 席 F1 静态链 + DBFK-1 EXEC P7 base-identical red ×4 + DBM3-1 EXEC P3 42501 实炸）· 协调方裁决 B 变体（独立刀 0150，不并入 0149、不回滚 0143）· **base = 主线 `67b4b573`**（migrations 尾=双 0143；0144-0149 归 DBHY/DBFK/DBM3 让位序，本刀落 **0150**，文件名序即执行序保证 0150 在 0144-0149 后生效）。

## 1. 雷的根因链（三刀互证 · 亲核行号）
- `migrations/0073_*.sql:1342`：`ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`（迁移 owner 作用域）。
- `migrations/0143_db_id_v7_unify.sql:14`：`CREATE FUNCTION public.uuidv7()` 创建于上述 REVOKE 之后，**全文件零 GRANT** ⇒ `pg_proc.proacl` 无 PUBLIC/app_role/privacy DEFINER owner 条目，仅 owner 可 EXECUTE。
- 55 表 `DEFAULT uuidv7()`（0143:75 等）⇒ 任何以 app_role/DEFINER owner 身份的 INSERT 全部 `42501 permission denied for function uuidv7`。

## 2. 受影响生产路径（实证清单）
1. **commerce 发桶**（最重·DBM3-1 P3 实炸）：`apps/api/src/modules/commerce/commerce.service.ts:45` asPrincipal(app_role) 发桶 INSERT → **0143 合入后每次成功支付 500**。
2. **report enqueue**：`packages/db/src/report.ts:15`（DBFK-1 升级报告点名·席2 亲证路径）。
3. **0096 隐私擦除链**：begin/issue/purge 收据面（SD owner=privacy_api_owner DEFINER 调 uuidv7）。
4. **question_rubric 写**（DBFK-1 点名）。
5. **同构高危（rev2 亲证行号）**：`packages/db/src/commerce.ts:49`（entitlement_consumption）/:130（commerce_outbox）/:373（settlement_ledger）——全部 asPrincipal 上下文省略 id；55 表中 DEFAULT uuidv7() 且写者为受限角色的全部写点（P2 全量枚举入收据）。

## 3. 修法（单文件 `0150_uuidv7_grant_acl.sql` · 仅 GRANT 语句）【rev2 · 双席 FAIL 处方落实】
- **推导源（EXEC 期 catalog 机检·客观非自指）**：全迁移函数体含 omit-id INSERT INTO〈55 张 uuidv7-default 表〉的 SECURITY DEFINER 函数 → distinct proowner 全集 ∪ TS 侧 SET LOCAL ROLE 受限直接写者（仅 app_role·亲证 principal.ts:949；qbank/rag 写自家 schema 非 55 表·gateway 无表权限·privacy worker 经 SD）。**预期闭集=恰 8 条 GRANT**：`app_role` · `privacy_api_owner`（0048/0058/0091/0092/0093/0096/0111/0112/0118/0125/0129）· `privacy_worker_owner`（0091/0140）· `memory_runtime`（0093/0099/0102/0105/0107/0108/0115/0117）· `memory_summarizer`（0112/0116）· `memory_admission_issuer`（0095）· `scoring_definer_owner`（0100/0103/0109·含 question_rubric 发布链）· `online_judge_owner`（0050）。catalog 推导结果与该预期集**双向核**：多一角色须逐行举证（收据落推导行号）· 少一角色即 FAIL。
- **明确剔除**：`privacy_guard_owner`（0140:327 纯 SELECT guard 触发器·零 uuidv7 写·授之违最小授权）；`uuidv7_from_parts` 不授权（0143:41 唯一调用方=owner 默认池 proof·无受限角色调用）。
- 幂等（GRANT 天然幂等）· 无函数体改动 · uuidv7 逻辑零字节变化。

## 4. prove（`packages/db/prove/db-acl.proof.ts` + script wiring）
- **P0 复现负门**：修复前 asPrincipal(app_role) INSERT 带 DEFAULT uuidv7 → 恰 `42501`（雷在卷证明）。
- **P1 proacl 实证**：修复后 `pg_proc.proacl`（uuidv7）含 app_role + 名单全集逐角色。
- **P2 逐角色双向断言（rev2）**：每缺员家族至少一面「修复前恰 42501 → 修复后绿」双向收据——app_role 发桶（DBM3-1 P3 场景）·privacy begin/issue（0096 面）·memory consent/fact/summary 至少一面·scoring rubric 发布链一面·OJ 注册一面·report enqueue 面——+ 55 表 DEFAULT uuidv7() 写点全量枚举矩阵（表→写角色→是否受限→授权后状态）。
- **P3 隐私擦除链三面**：begin/issue/purge 路径绿（0096 面）。
- **P4 report enqueue 面**：绿。
- **P5 过度授权负门（rev2·客观基线）**：新建无关系角色仍恰 42501 + `has_function_privilege('public','public.uuidv7()','EXECUTE')=false` 显式断言（PUBLIC 泄漏门）+ GRANT 面恰最小（无 GRANT ALL、无多余函数、白名单基线=§3 catalog 推导集而非刀自定义）。
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
