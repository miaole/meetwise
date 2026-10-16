# E2E-RECRUITER-GATE — EXEC 收据（C1-C3 落码 · 零模型两档）

- **执行席**: e2rg-exec（author `exec@meetwise.local`）· 2026-10-10
- **分支**: `line/e2e-recruiter-gate` · 工作树 `/Users/miaole/Desktop/golucky/meetwise-e2rg`
- **授权**: pre-exec 双审实质双席 PASS + rev2 锚点窄域 9/9 复审 → 协调方明示 EXEC 授权
- **生产码面**: 零字节（0155 / recruiter.guard / auth signup 面 / admin 契约零触·diff 四文件全在 e2e/runner 测试基建面）

## 1. rebase 回执

- `git rebase feat/mysql-schema-skeleton`：**2/2 干净重放，零冲突**（c1d7f054 → b308b1a5 + 59e93ee1，新基 `9000f02e`）。
- 预检 `git diff --name-only 1ae677b8 9000f02e`：主线三刀（role-input / sse-resilience / consent-min）**未触碰本刀四目标文件**（run-e2e.mjs / e2e/full.e2e.ts / e2e/helpers/auth.ts / e2e-helpers.proof.ts 零漂）；run-e2e-isolated.mjs 主线 19 行改动域与本刀零交叠（本刀不触 wrapper）。
- 重放后全锚点亲读复核：run-e2e.mjs :14/:142/:145-147、auth.ts 70 行/:15、http.ts :12-18、domain signToken :31-35、_neg-harness :161-164、full.e2e.ts :274-297 区、admin.controller/service/contracts:367/admin.guard:16 —— **零漂移，停止条件①未触发**。

## 2. C1-C3 落位（file:line 落码后实值）

| 件 | 码面 | 落位 |
|---|---|---|
| C1 | `scripts/run-e2e.mjs` | `:7` `import { createHmac } from 'node:crypto'` · `:144-168` seedAdmin 块（`:148` 起：pg 直连 `createRequire(new URL('../packages/db/package.json',import.meta.url))('pg')` 沿 full.e2e.ts:241-243 先例·连接参数 PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE 沿 wrapper :2384 探针形（wrapper :2573 注入 PGPORT）· `:155` INSERT `'e2e-admin','e2e-admin@x.com','scrypt$e2e$bootstrap',true,'candidate'` ON CONFLICT (id) DO NOTHING 沿 _neg-harness.ts:161-164 形·status/pwd_epoch/role 取列默认）· `:158-161` 铸 token 逐字同 domain signToken:31-35 形（base64url{uid,exp,pe} + HMAC-SHA256·pe=0·secret=env.AUTH_SECRET 即 :14 测试键·TTL 3600s）· `:165` 失败 fail-closed `throw tagE2EFailure('db','admin_bootstrap_failed')`（沿 :139-142 形·main().catch cleanup+exit 1）· `:172` `E2E_ADMIN_TOKEN: adminToken` 并入 e2e spawn extraEnv（唯一被改写的既有行=两 import 扩展+本 extraEnv 合并，三处均处方内） |
| C2 | `e2e/helpers/auth.ts` | `:78-83` `adminHeaders()`：缺/空 `E2E_ADMIN_TOKEN` → `throw new Error('e2e_admin_bootstrap_missing')`（fail-closed·Ban 假绿）；有值 → `jsonHeaders(token)`（:12-18 形）。既有 signupOrLogin/uidFromToken 零触 |
| C2 证 | `e2e/helpers/e2e-helpers.proof.ts` | `:16` import 扩展（唯一被改行）· `:255-263` test「缺/空 E2E_ADMIN_TOKEN 即 throw」（env 保存/恢复·缺+空串两分支）· `:268-277` test「有令牌走 jsonHeaders Bearer 形」（content-type + `Bearer ${token}` + uidFromToken 闭环）。既有 26 test 零删改 |
| C3 | `e2e/full.e2e.ts` | `:12` import 扩展（唯一被改行）· recruiter1 区 `:276-283`（pending 发岗 → `A(403 && error==='recruiter_pending_review')` 分码 `:280` · `POST /admin/recruiter-approvals/{uidFromToken(recruiter.token)}/decision` approve → `A(200 && decided===true)` `:281-283`）· recruiter2 区 `:302-304`（approve → `A(200 && decided===true)`·RLS 断言前过门）。**reject 支线未加·第二遍分码断言未加** |

**既有断言保留清单**（零删改·逐条 grep 亲证各恰 1 次）：原 :276-278 发岗 200 断言链（现 :284-286）· :287-288 candidate 门禁 403（现 :295-296）· :292-297 recruiter2 RLS 断言（现 :305-309，approve 前置后自然绿）。

## 3. 验收 EXIT 表（§4 两档·零模型档）

| 门 | 命令 | attempts | EXIT | 备注 |
|---|---|---|---|---|
| 静态门 | `pnpm typecheck`（tsc -p tsconfig.e2e.json） | 1 | **0** | 首跑因 worktree 缺 node_modules 报 `tsc: command not found`（环境态·非码面红）→ `pnpm install` 后一次过 |
| 单元门 | `pnpm e2e-helpers:prove` | 1 | **0** | **28 scenarios**（存量 26 + 新增 2 全 PASS）· `PASS e2e-helpers proof: 28 scenarios; releaseEvidence=false` |
| 语法门 | `node --check`（run-e2e.mjs + runner import 链 failure-class.mjs / e2e-fake-service-flags.mjs） | 1 | **0** | 三文件全过 |
| 隔离端到端门 §4-3 | `pnpm e2e:isolated` | — | **未跑** | **MODEL_API_KEY 真消耗·排程归协调方（§2-3/§4-4b 冻结条款）·本刀交付码面，live 授权跑冻结不解** |

**Ban retry-to-green 兑现**：两门均一次 EXIT=0，attempts 全账如上。

## 4. 门清单核查（§4-5）

- **冲突标记门**：全仓 markers=0（staged+工作树 grep 零命中）。
- **生产码面零字节**：`git diff --stat` = 4 files, 81+/3-；3 处删除行逐行亲证 = full.e2e.ts:12 import 扩展 + proof.ts:16 import 扩展 + run-e2e.mjs:172 extraEnv 合并（全为处方内改写·零断言/零业务行）。
- **est live=0**：零 live 授权跑·零 secrets 入库（E2E_ADMIN_TOKEN 仅进程 env 运行时态·测试键铸发·本收据零 token 值落盘）。
- **markers=0 · pins 十一值零翻转**（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=202 软删受理 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）。
- **本刀零模型消耗**：typecheck/prove 均 TS/Node 本地执行，无模型外呼。

## 5. 停止条件核查

1. **锚点形状不符（±3 行外）**：未触发（重放后锚点全数原位·见 §1）。
2. **prove 新增红**：未触发（28/28 全绿·新增两 test 双 PASS）。
3. **rebase 冲突不可解**：未触发（2/2 干净重放）。

## 6. Non-claims

e2e 码面落位 ≠ e2e 绿（§4-3 未跑）≠ 审批制产品验收；runner 播 admin = 测试基建身份 ≠ 权限面变更；`executed:awaiting_post_prove_dual` = 待隔离端到端门收口（协调方排程）+ post-prove 双审 · alone≠dual。
