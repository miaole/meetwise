# REQUEST — GAP-BACKFILL-EMITTER-UNAUTHENTICATED · pre-exec · mw-e2e-ha

**Status**: pre-exec **PASS**（有条件）· `draft:awaiting_pre_exec_dual` · 不代签 `mw-rag-route` · alone≠dual
**Expert**: `mw-e2e-ha`
**REQUEST**: `11f1016d5c02e7336dfc8abb94c1f3dd67a21841`（`11f1016`）
**Docs-only**: `git show --stat 11f1016` 仅 4 个 markdown。emitter / guard / prove **没有**落进这个「docs-only」提交。该 SHA 是 tip `5cd6cbc` 的祖先，且在 `origin/feat/mysql-schema-skeleton` 上。
**Knife**: `ai-docs/delivery/harness/gap-backfill-emitter-unauthenticated.md` · `ai-docs/delivery/gap-backfill-emitter-unauthenticated.slice.md`
**Date**: 2026-10-02（PT）
**本 PASS**: ≠ coding 授权（本开档明确不改代码；dual 之后的允许名单也只是 emitter/guard/prove）· ≠ covered · ≠ nail · ≠ next knife · alone≠dual

## Pins（保留）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（保持） |

## 缺口仍开着

`scripts/lib/uc018-receipt-backfill-guard.mjs:2–9` 自述 HMAC-free：只对日志文件做 SHA-256（`:21–23`、`:90`）。能同时改 JSON 和 log 的人可以造出一对匹配摘要。`scripts/uc018-receipt-backfill-emit.mjs:140` 披露同一句：`GAP-BACKFILL-EMITTER-UNAUTHENTICATED: HMAC-free JSON+log digest pair is forgeable.` harness `:11`、`:17` 承认今天的守卫没有 HMAC，日志 SHA-256 **不是**发射器认证，并且本 REQUEST 不改那段代码。

## 计划是否 fail-closed

| 要求 | 判定 | 依据 |
|------|------|------|
| HMAC 或对日志字节的签名/摘要绑定 | 符合 | harness `:21` HMAC 或签名，使 JSON+log 不能靠两边一起改而伪造。`:46` 改 log 必须失败。单靠现有 sha256 不算过（`:11`）。 |
| 密钥不进仓库 | 符合 | `:29` 密钥来自进程环境；禁止 git 里放密钥；禁止读 `.env*`；禁止把密钥打进日志。进程内 fixture key 只给 prove。`:37` 缺密钥 fail closed，禁止仓库默认密钥。 |
| 手写 JSON 或篡改日志必须失败 | 符合 | `:35` 有合法 log digest 但没有 HMAC/签名 → reject。`:36` 截断签名 → reject。`:38` 无密钥同时改 JSON 和 log → reject。`:46` 真发射能验过；改 JSON 失败；改 log 失败；两边一起改且无密钥失败。 |
| 不改产品面试行为 | 符合（事后允许名单） | 本开档零代码（slice `:12`；harness `:27`）。事后只许动 emitter、guard、prove 三个脚本（`:23–25`）。禁止 facts、evaluator、已落盘收据、矩阵（`:27`）。面试产品不在允许名单里。 |
| 缺 HMAC 不算 pass | 符合 | NEG 第一条就是「有 digest 无 HMAC → reject」（`:35`）。没有把「今天这样就算过」写成验收。 |

未发现 docs-only 提交里夹带代码，也没有把缺 HMAC 当成 pass。不触发 FAIL。

## 条件

1. 事后实现必须把 HMAC（或签名）盖在**日志字节**上，使改 log 或手写 JSON 都 fail closed。只保留今天的 SHA-256 配对 = 未关缺口。
2. 密钥不得入库、不得进 `.env*` 提交、不得打日志。
3. 不得改变面试产品行为，不得改 UC-018 覆盖判定，coveredCount 保持 **8**。
4. 本 PASS 不授权现在改那三个脚本。coding 仍要 dual 加单独授权。不代签 rag-route。

Verdict: PASS
