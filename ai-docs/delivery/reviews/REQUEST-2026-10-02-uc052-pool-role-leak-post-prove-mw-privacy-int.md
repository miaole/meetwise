# UC-052 pool-role-leak post-prove

主审：`mw-privacy-int`  
日期：2026-10-02（约 21:05 PT）  
REQUEST 谱系：`2a0cc3a` · 预审 `c5decd9`（C1–C6）· 更正 `118e28f`(c) 仍有效（产品风险）  
本审 prove 树：`9b39a20` / `9b39a20d6b53d10ac95be880037a3e716126f715`  
机制提交：`71ec253`（`SET ROLE NONE` + 清 GUC + 失败销毁）  
类型-only 尖端：`9b39a20` 与 `ab96a02`（`git range-diff` 判定补丁相等 `=`）  
mw-core 收据：`522590d`（只读，不改）

**原则**：只采信本角色亲跑 EXIT 与亲读 file:line。未改旧收据。未刷绿重跑。

---

## 1. `9b39a20` 与 `ab96a02`

| 检查 | 结果 |
|------|------|
| `git range-diff 9b39a20^..9b39a20 ab96a02^..ab96a02` | **补丁相等**（同一主题：type-only `releaseAsync` 断言） |
| `git diff 9b39a20 ab96a02 -- apps/worker/src/checkpoint-principal.ts apps/worker/test/uc052-pool-role-leak.proof.ts` | **空**（刀文件逐字节相同） |
| 两树其余差异 | 仅 UC-018 回填收据，与本刀无关 |
| `origin/feat/mysql-schema-skeleton` 含 `9b39a20` | **否**（对象在本地，不是 origin 祖先） |
| origin 含 `ab96a02` | **是** |
| origin 含 `522590d` | **是** |
| 行为修复在 prove 范围内 | **是**：`71ec253` 是 `9b39a20` 与 `ab96a02` 的祖先。`9b39a20` 本身只改类型断言（`checkpoint-principal.ts` L146），**不是**把行为修说成类型补丁蒙混。 |

---

## 2. CMD \| EXIT（本机 @ `9b39a20`，各一次）

| CMD | EXIT | 观测 |
|-----|------|------|
| `pnpm uc052:pool-role-leak:prove` | **0** | gitSha=`9b39a20` · factory=`createCheckpointer(...,true)` · max=1 · NEG-01 同 pid 149 且 role/GUC 已清 · FAULT-ABORT 同 pid 已清 · FAULT-RESET-DESTROY 149→150 · HP-01 绑定 B |
| `pnpm uc052:checkpoint-physical:prove` | **0** | 三 NEG + HP-CKPT-SEALED-CLAIM 均 PASS · NEG-03 httpStatus=503 |
| `pnpm uc052:internal-erasure:prove` | **0** | 11/11 · 未回归 |
| `pnpm privacy-authorization:prove` | **0** | 本机单次；**不**当作 flake 已关闭 |
| `pnpm privacy-erasure:http:prove` | **0** | pass_count=19 fail_count=0 · 公开 DELETE 仍 503 |
| `pnpm eval-harness-matrix-cite:prove` | **0** | UC-E2E-050–052 行全 PASS（NEG/FAULT/BOUND/ADV 未回退） |

变异对照：未重跑。证明脚本拒绝脏工作树，且禁止另交产品提交。已核仓内 `522590d` 日志 `logs/mutation-control-913f21d.log`：EXIT=1；`NHP-POOL-NEG-01` / `FAULT-ABORT` / `FAULT-RESET-DESTROY` 失败；同 pid 残留 `currentUser=app_role` 与 3 个 GUC。该跑的 runner SHA 是 `f0800e4`（相对 `913f21d` 只加 no-op override 与 `underlyingPool` getter；`connect` 仍是 L51–55 会话 `SET ROLE`、release 无清理）。

---

## 3. C1–C6

### C1 release 清理 — **PASS**
`apps/worker/src/checkpoint-principal.ts`：
- L79 `SET ROLE NONE`（注释 L74–78 写明 RESET ROLE / DISCARD ALL 在 `-c role=app_role` 下不够，禁止二者单独作为清理）。
- L80–82 对 `app.principal_user` / `app.checkpoint_thread_id` / `app.checkpoint_epoch` 做 `set_config(..., '', false)`。
- L91–104 `runRelease`：先清理再 `originalRelease()`；清理抛错则 `originalRelease(resetErr|true)` 销毁，不归还池。
- L112–114 替换 `client.release`；L155–161 `query()` 的 `finally` 等待 `releaseAsync`（中止路径也会清理，除非调用方已传入 err 走销毁）。
- L140–144 仍用会话级 `SET ROLE` + `set_config(..., false)`，因 PostgresSaver 读路径是 autocommit `pool.query`。**不是**仅 SET LOCAL。

### C2 bleed prove — **PASS**
`apps/worker/test/uc052-pool-role-leak.proof.ts`：
- L100–102 `PGPOOL_MAX=1` + `createCheckpointer(connection, true)`；L51–56 读 `pg_backend_pid` / `current_user` / `session_user` / 三 GUC `current_setting(..., true)`。
- L133–166 NEG-01：同 pid 复用且 `gucsClear`+`roleReset`（`current_user===session_user`）。本机 pid 149→149，GUC 全 null。
- L168–195 FAULT-ABORT：事务中抛错后下一借仍同 pid 且干净。本机 PASS。
- L197–227 FAULT-RESET-DESTROY：清理 override 抛错后下一 pid 必须不同。本机 149→150。
- 旧码致红：见 §2 仓内变异日志，非桩池。`createPool` 的 `max` 读 `PGPOOL_MAX`（`packages/db/src/principal.ts` L843）。

### C3 flake 台账 — **PASS**（诚实：未关闭）
`522590d` `2026-10-02-uc052-pool-role-leak-prove.md` L6：「mitigated / cause-unknown … (Ban "fixed")」。  
`privacy-authorization-flake-ledger.jsonl`：cold n=5 `exit=1` tip `71ec253`，日志 `cold-5.log` 为 `ECONNREFUSED 127.0.0.1:33047`；warm n=2 `exit=1`（`interview_pkey`）。v2 @`3d0c71e` 10+10 exit=0，并写明 Ban claim fixed。  
**未**把缺口标成 fixed/closed/root-caused。本机 authz EXIT=0 **不**计入关闭。预审「N≥5 首跑即关闭」门槛 **未满足**，故本项只通过「诚实未关闭」，不是宣布根因已修。

### C4 unsealed NEG — **PASS**
三负例 + 一正控，均在 `packages/db/test/uc052-checkpoint-physical.proof.ts` `runUnsealedClaimNeg`（约 L668–775）与 `HP-CKPT-SEALED-CLAIM`（约 L778–816）：
- EPOCH：把 `privacy_epoch` 置 NULL 后 claim → 本机 `42501` + `privacy_authorization_epoch_mismatch`。
- DIGEST：digest 置 NULL → `42501` + `privacy_authorization_digest_mismatch`。
- BOTH：begin 后不 seal，两列保持 NULL → `42501` + epoch mismatch。
- 正控：seal 后 claim 得到 lease。本机 `lease=true`。
拒绝来自 SQL `privacy_authorization_claim_target`（0091 L369–374 `RAISE … ERRCODE 42501`）。`claimAuthorizationTarget`（`packages/db/src/privacy-authorization.ts` L124–128）只调用该函数，无应用层 NULL 预判。

### C5 无新路由 / 无新 GRANT · DELETE=503 · 脚本名 — **PASS**
- `git diff --name-only 913f21d 9b39a20` 无新增 migration / SQL GRANT / HTTP 路由。
- 公开删除：`apps/api/src/modules/privacy/privacy.service.ts` L56 抛 `HttpStatus.SERVICE_UNAVAILABLE`（503）；http prove EXIT=0（19 pass）；checkpoint NEG-03 `httpStatus=503`。
- `package.json` 仅 `uc052:pool-role-leak:prove` 与其 `:raw` 配对，不与其他刀脚本重名。

### C6 pins — **PASS**
证明 JSON（pool prove 与 checkpoint prove）写明 `haStatus=NOT_HA`、`releaseEvidence=false`。checkpoint HP 外部目标仍为 `retention_pending`（proof 约 L854），请求态 `pending_external`。栈为隔离 PG。公开 DELETE=503（§C5）。本收据 **不**把本缺口宣称为已关闭的产品状态。

---

## 4. tsc 错误身份

| 集 | 结果 |
|----|------|
| `@meetwise/db` @ `9b39a20` | **6** 条，与 `4643c02` **逐条相同**（diff 空）：`adaptive-interview.ts:113` TS2345、`interview-control-signals.ts:103` TS18047、`privacy-erasure-preview.proof.ts:161` TS2532、`privacy-erasure-preview.ts:159` TS2345、`qbank-handoff-closure.proof.ts:223` 与 `:228` TS2345。无新身份。 |
| `@meetwise/worker` @ `9b39a20` | **39** |
| worker @ 类型补丁父 `00d53ed` | **44**。消失 5 条，皆为本刀类型噪声：`checkpoint-principal.ts:146` TS2339 `releaseAsync`，以及 prove `snapB` 的 4 条 TS2339 `never`。**无新增身份**。 |

---

## 5. 总评

C1–C6 均满足。行为修复在 `71ec253`，类型补丁不替代它。flake 保持 cause-unknown。origin 上的等价补丁是 `ab96a02`，不是 `9b39a20` 这个对象。

Verdict: PASS
