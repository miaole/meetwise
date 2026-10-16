# PRE-EXEC · NOTE-CKPT-UNSEALED-CLAIM-NEG（Line F · docs-only）

主审：`mw-privacy-int`  
日期：2026-10-02（约 21:08 PT）  
REQUEST：`a1a06ab` / `a1a06ab04bdf5b765b0c62ef0825c9ba3e8f13e0`  
祖先：是 `origin/feat/mysql-schema-skeleton` 的祖先（本审时尖端 `49ef158`）  
Line B 隐私钉：`7cb7010` / `7cb70103d83e0b0c226b2b09867b67f20a81877f`（已在 origin）  
本审不授权任何产品代码。未改旧收据。

---

## 1. `a1a06ab` 相对父提交

仅 4 个文档，+147 行，无产品代码、无 migration、无 GRANT、无路由、无 `package.json`、无 `checkpoint-principal.ts`：

- `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md`
- `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-note-ckpt-unsealed-claim-neg-mw-privacy-int.md`（空 stub）
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-note-ckpt-unsealed-claim-neg-mw-e2e-ha.md`（空 stub）

文档计划的四案（harness Goal 表）：

| 案 | 预期 |
|----|------|
| NULL epoch | `privacy_authorization_epoch_mismatch` · ERRCODE `42501` · 行不变 |
| NULL digest | `privacy_authorization_digest_mismatch` · ERRCODE `42501` · 无写入 |
| both NULL | 同一 `42501` / epoch 消息（先判 epoch） |
| sealed 正控 | claim 返回 lease，不是拒绝 |

---

## 2. origin 上四案是否已在

**已在** `origin/feat/mysql-schema-skeleton` 的 `packages/db/test/uc052-checkpoint-physical.proof.ts`（Line B 刀，非本 REQUEST 新写）：

| 案 | 行 | 拒绝 |
|----|----|------|
| `NHP-CKPT-UNSEALED-NEG-EPOCH` | L46 登记 · L705–706 置空 epoch · L763 断言 | SQLSTATE `42501` + `privacy_authorization_epoch_mismatch` |
| `NHP-CKPT-UNSEALED-NEG-DIGEST` | L47 · L708 置空 digest · L768 | `42501` + `privacy_authorization_digest_mismatch` |
| `NHP-CKPT-UNSEALED-NEG-BOTH` | L48 · L697–701 begin 后不 seal · L773 | `42501` + epoch 消息 |
| `HP-CKPT-SEALED-CLAIM` | L49 · L778–780 | seal 后 claim 要有 lease |

SQL：`packages/db/migrations/0091_privacy_authorization_issuer.sql` L369–370（epoch NULL → `42501`）、L372–373（digest NULL → `42501`）。  
应用路径：`packages/db/src/privacy-authorization.ts` L124–128 只 `SELECT privacy_authorization_claim_target(...)`，无应用层 NULL 预判。  
Line B post-prove `7cb7010` 已在 `9b39a20` 亲跑这四案为绿。本 pre-exec 不重跑长证明。

---

## 3. S1–S6

### S1 docs-only — **PASS**
`a1a06ab^..a1a06ab` 只有上述 4 个 markdown。

### S2 四案写清 — **PASS**
harness Goal 表分列 NULL epoch、NULL digest、both NULL、sealed 正控，未并成一句含糊要求。

### S3 DB 层与具体 SQLSTATE — **PASS**
文档要求 `42501` 与两条 RAISE 名，并写「App-layer catch without SQLSTATE ≠ pass」。与 0091 L369–374 一致，不是「某个错误」。

### S4 禁止并行改 principal — **PASS**
harness Sequencing 禁止改 `apps/worker/src/checkpoint-principal.ts`。Line B 等待条件已满足（`7cb7010` 已在 origin；尖端另有 e2e-ha post-prove `49ef158`）。文档默认仍是 DB prove、不改该文件。Prove plan 的「除非后续 dual 证明不做不到」不是本项指令去改它。

### S5 诚实 / 禁止第二刀 — **FAIL**
四案已在 origin 的 checkpoint-physical 证明里，且 Line B 已钉。文档只写「A prove sketch may already exist」，不引用上述 case id 与 file:line，也不把 NOTE 退役。Prove plan 第 2 步在 Line B 钉之后仍要「Prove the four cases against 0091」，等于再授权一轮实现。这是过时的补测刀，会做出重复实现。

### S6 pins — **FAIL**
文档有 NOT_HA、releaseEvidence=false、PG-retained、公开 DELETE=503，并禁止把矩阵翻成完成态。全文（harness / slice / 两 stub）**没有**外部目标 `retention_pending`。按本审 pin 清单，缺这一条即失败。文档没有把本缺口宣称为已完成状态。

---

## 4. 总评

S1–S4 通过。S5 因四案已存在仍授权补测刀而失败。S6 因未写 `retention_pending` 而失败。整体 FAIL。本收据不授权编码。

Verdict: FAIL
