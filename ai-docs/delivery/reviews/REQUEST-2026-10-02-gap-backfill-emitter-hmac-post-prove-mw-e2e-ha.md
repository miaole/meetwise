# UC-018 emitter HMAC post-prove · mw-e2e-ha

**Date**: 2026-10-02 21:29 PT
**Role**: mw-e2e-ha · alone ≠ dual · 不代签 mw-rag-route · 非 nail
**Code**: `a19b6cf` / `a19b6cf178bfe264fe2e2e7894b64a2021c07b00`（author meetwise-core · 在 `origin/feat/mysql-schema-skeleton` 上）
**Receipt**: `b118390` / `b118390aee90d4fc367c6be63994569e046f6b67`（同祖先）
**Pre-exec（未改）**: `b3bb4a0` / `b3bb4a0035c2ccb679eb789f21a059eda480e69b` · `ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-backfill-emitter-unauthenticated-mw-e2e-ha.md`
**HEAD at write**: `e09a39fd83f9c2e66da7f9c137b1821033571b3a`（fetch 后 origin tip；其后 rebase）

## 主张 vs 现场

回执命令名不是口头的 `pnpm receipt-backfill:prove`。回执 md/json 与 log 写的是：

| 来源 | CMD | EXIT |
|------|-----|------|
| 回执 `b118390` | `pnpm uc018:receipt-backfill:prove` | **0** |
| `package.json:498`（本刀未改该行，脚本已存在） | `node scripts/uc-e2e-018-receipt-backfill.proof.mjs` | — |

`needsPg=false`。证明脚本是 node 静态：只 import `node:fs` / `node:path` / `node:crypto` 与本地 `.mjs`。无 docker / postgres / testcontainers 启动，不需要数据库。gatherer 的 `execSync` 仅在函数内做 git，不是起容器。因此未 `pnpm install`。

干净 worktree `/workspace/mw-rv-hmac` @ `a19b6cf`，一次：

`CMD=pnpm uc018:receipt-backfill:prove EXIT=0`

与主张一致。未 retry-until-green。跑完已删除该 worktree。log 行与回执 log 的 HMAC/legacy 用例同向（genuine / missing tag / bad tag / truncated / mutated JSON / mutated log / JSON+log / missing key / 异钥 / 七份 legacy unsigned / no default key）。

## 刀（只读 `a19b6cf`）

`git show --stat`：仅三文件，+387/−26。

- `scripts/lib/uc018-receipt-backfill-guard.mjs`
- `scripts/uc-e2e-018-receipt-backfill.proof.mjs`
- `scripts/uc018-receipt-backfill-emit.mjs`

无 gatherer、无 SSOT、无 matrix、无历史回执改写、无 `.env*`。

**密钥从哪来**：`HMAC_KEY_ENV` = `MEETWISE_UC018_BACKFILL_HMAC_KEY`（`guard.mjs:26`）。`resolveHmacKey`（`guard.mjs:79-86`）只读 `opts.hmacKey` 或 `opts.env` / `process.env`。空串或非字符串 → `null`。无默认值。emitter/guard 不 import dotenv、不 `readFileSync` `.env`。

**缺 key**：`verifySignedReceipt`（`guard.mjs:125-126`）返回 `{ ok:false, signed:false, reason:'hmac-key-missing' }`。`attachEmitterHmac`（`guard.mjs:158-159`）不造 tag。emitter 入口 `emit.mjs:69-71` `process.exit(8)`；`finalizeReceipt` 再缺 key 同样 exit 8（`emit.mjs:197-201`）。子进程 `childEnv`（`emit.mjs:74-77`）删掉该 env，不把 key 传进被测 prove。

**缺 tag**：`verifySignedReceipt`（`guard.mjs:130-131`）`hmac-tag-missing`，`ok:false`。无 optional-pass。算法不是 `HMAC-SHA256` 或 tag 不是 64 位 hex → `hmac-tag-bad`（`guard.mjs:133-137`）。

**算法**：`HMAC_ALG`（`guard.mjs:27`）与 `createHmac('sha256', key)`（`guard.mjs:142-144`、`166-168`）。仅 SHA-256。预执行已知条件 GAP-HMAC「SHA-256 only」在这把刀上成立，不另开条件。

**旧未签名**：没有 `emitterHmac` 字段 → `classifyReceiptAuth`（`guard.mjs:105-106`）`signed:false, legacy:true, auth:'unsigned-historical'`。`finishAuth`（`guard.mjs:195-196`）对该路径 `ok:true, signed:false`。可读 ≠ 已认证。`signed:true` 只出现在 tag 校验通过之后（`guard.mjs:148`）。七份历史 JSON 在 `a19b6cf` 无 `emitterHmac`；证明断言 `signed !== true`（`proof.mjs:423-430`）。`isPreferableBackfillReceipt`（`guard.mjs:285-287`）仍只看 shape+exit===0，注释写明不是 HMAC 判决；这是既有形状，不是把 legacy 升成 authenticated。

## 密钥扫描

刀 diff 与三文件：无长 hex 字面量、无 HMAC key、无 `.env`、无 raw key。回执 log 不打印 key；证明用 `randomBytes` 进程内夹具（`proof.mjs:333-334`）并在 finally 恢复原 env（`proof.mjs:450-451`）。`secret-in-tree=no`。

## covered / EOR

`name-status` 无 matrix / gatherer / evaluator 改动。`evidenceOfRecord: true` 在 emitter 收据体里是本刀 diff 的上下文行，不是新翻成 covered nail。回执 json `coveredCount:8`、`coveredFlipped:false`、`nail:false`。slice 与 `PARALLEL-DISPATCH-2026-10-02.md` 仍 pin `coveredCount=8`。本回执不把 `GAP-BACKFILL-EMITTER-UNAUTHENTICATED` 写成 nail，也不改 UC-018 status。`covered flipped=no`。

## 抽查

- 预执行 `b3bb4a0` 文件未改。刀范围是 emitter/guard/prove，无面试行为面。
- 公开 DELETE=503、PG-retained、`gR45Closed`、`ms3EqualsR4Closed` 不在本刀 diff。
- 缺 key 的证明走 `hmacKey:''`（`proof.mjs` missing-key 段，约 398-402），空串不能成功。
- PASS ≠ covered ≠ nail ≠ HA。

## Pins

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · PG-retained · public DELETE=503

## alone ≠ dual

本文件只代表 mw-e2e-ha 的 post-prove。不构成 dual，不关闭 gap，不授权下一刀。

## 阻塞

无阻塞。抽查：三文件 diff、fail-closed 行号、legacy `signed:false`、coveredCount 仍为 8、密钥扫描、以及上面一次 EXIT 0。

## 条件

无。EXIT 已在 `@a19b6cf` 新鲜观察到，不写 `C-HMAC-RERUN`。
Verdict: PASS
