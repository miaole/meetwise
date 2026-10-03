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

---

# RE-PRE-EXEC · NOTE-CKPT-UNSEALED-CLAIM-NEG rewrite（Line F · docs gate only）

主审：`mw-privacy-int`  
日期：2026-10-02（PT）  
被审 SHA：`a24382b` / `a24382b6ae10464e2b7abcc957bec43ef2868061`（docs(privacy): rewrite Line F unsealed-claim request）  
审查基线：worktree `rv/f-privacy-int` @ `3d7063f9335398b776a89327c5131382b8629c55`；`git merge-base --is-ancestor a24382b HEAD` EXIT=0。  
被审对象：重写后的 `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md` 与 `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md`。上一段（PRE-EXEC FAIL @`a1a06ab`）原样保留；本段为 append-only 追加，last-line-wins。alone≠dual，不代签 `mw-e2e-ha`。

## 检查表（file:line 证据）

1. **docs-only 复核**：`git show --stat a24382b` → 仅 2 个 markdown（harness 81 行改动、slice 42 行改动，+51/−72）。零产品代码、零迁移、零 GRANT、零路由、零 `package.json`、零 SSOT（矩阵/backlog/checklist）触碰。✔
2. **无静默漂移**：`git log a24382b..HEAD -- <两文档>` 为空、`git diff a24382b HEAD -- <两文档>` 为空——worktree 内读到的即 `a24382b` 原文。✔
3. **引证抽查（S5 核心）**——`packages/db/test/uc052-checkpoint-physical.proof.ts`：
   - `NHP-CKPT-UNSEALED-NEG-EPOCH` 引证 `:763–766` → 实际 id 在 `:763`、run 在 `:764`、断言在 `:765`。✔
   - `NHP-CKPT-UNSEALED-NEG-DIGEST` 引证 `:768–771` → 实际 `:768–770`。✔
   - `NHP-CKPT-UNSEALED-NEG-BOTH` 引证 `:773–776` → 实际 `:773–775`。✔
   - `HP-CKPT-SEALED-CLAIM` 引证 `:780–804` → 实际 id `:780`、claim lease `:802–803`、断言 `:804`。✔
   - 共享断言引证 `:750–758` → 实际 `sqlState === '42501'` + 期望拒绝文案在 `:750`、unchanged 三重在 `:751–755`、detail `:758`。✔
   - 「epoch is checked first」→ `packages/db/migrations/0091_privacy_authorization_issuer.sql:369–371`（epoch RAISE）先于 `:372–374`（digest RAISE）。✔
   全部引证真实、行号精确，无虚指。✔
4. **无残留授权语句**：grep 全文——"no prove run"（harness `:3`/`:22`）、"do not rerun or extend the proof"（`:20`）、"authorizes no second implementation and no second prove"（`:7`）、"does not self-approve or authorize coding"（`:34`）、slice `:7`/`:11` 同向。旧版的 "Prove the four cases" 类指令已不存在。✔
5. **Pins 8+2 逐项对表**（harness `:32`、slice `:28`）：`haStatus=NOT_HA` ✔ · `releaseEvidence=false` ✔ · `claimProductionHA=false` ✔ · `gR45Closed=true` ✔ · `coveredCount=8` ✔ · `ms3EqualsR4Closed=false` ✔ · PG-retained ✔ · external retention `retention_pending` ✔ · public DELETE `503` ✔。无省略、无松动、无改口。✔
6. **S6 关闭证据**：harness `:26` 明写 "This is a pin, not completion evidence"；slice `:22` 同。`retention_pending` 已入 pins 且未被宣称完成。✔
7. **边界**：禁改 `apps/worker/src/checkpoint-principal.ts`（harness `:27`、slice `:23`）✔；禁改 proof 文件（harness `:28`、slice `:24`）✔；禁改矩阵/backlog/checklist 且禁翻 covered（harness `:29`、slice `:25`）✔；DELETE=503 保持（harness `:30`、slice `:26`）✔。
8. **Evidence honesty**：状态保持 `draft:awaiting_re_pre_exec`（harness `:1`/`:3`/`:36`、slice `:1`/`:3`）；"四案已存在" 陈述经第 3 项实读验证为真；全文无任何把 UC-052/矩阵写成完成态的句子；无 nail 宣称（harness `:3`/`:22`/`:36`、slice `:6`）。✔
9. **stub 未动**：`a24382b` stat 不含两 stub；`REQUEST-2026-10-02-note-ckpt-unsealed-claim-neg-mw-privacy-int.md` 仍为 PENDING stub（`:3`）。✔
10. **Line B 依赖如实保留**：重写刀零授权 coding（任何条件下），强于旧版 "coding after Line B nail"；未把 `7cb7010`/`49ef158` 写成 nail 或开工许可。✔

## S1–S6 复裁

- **S1 docs-only — PASS**：同检查表第 1–2 项。
- **S2 四案写清 — PASS**：harness 表 `:15–18` 与 slice `:13–16` 四案分列，各带 case id + file:line。
- **S3 DB 层与 SQLSTATE — PASS**：`:20` 记录 `sqlState === '42501'`、期望拒绝文案、unchanged；epoch-first 经 0091 `:369–374` 实证。
- **S4 禁并行改 principal — PASS**：harness `:27` / slice `:23`，另加 proof 文件禁改（强于上轮）。
- **S5 重复刀 — PASS（上轮 FAIL 关闭）**：实现刀已退役（harness `:7`/`:22`、slice `:7`），只引证已存在 case id + file:line（经实读为真），不再授权新实现/重跑/第二刀。
- **S6 retention_pending — PASS（上轮 FAIL 关闭）**：入 pins（harness `:32`、slice `:28`）且明写非完成态（harness `:26`）。

## Blockers

无。

## Conditions（binding）

- **C-PRIV-F1**：本 PASS 仅放行 `a24382b` 的文档化本身；不授权任何 coding / prove / nail。后续任何 UC-052 checkpoint 实现刀须另立 REQUEST，且仍以 Line B nail 为前置——`7cb7010` / `49ef158` 的 post-prove PASS ≠ nail。
- **C-PRIV-F2**：Pins 冻结按 harness `:32` / slice `:28` 原值；`retention_pending` 在外部保留证据落地前不得写成完成态；`coveredCount` 保持 8，UC-052 ≠ covered。
- **C-PRIV-F3**：引证绑定当前证明形态（proof.ts `:750–758`、`:763–804`）；proof 文件在本 REQUEST 下禁改，未来若行号漂移须先重钉引证方可再引用。
- **C-PRIV-F4**：alone≠dual——本 PASS 只签 `mw-privacy-int`；dual 生效需 `mw-e2e-ha` 独立 RE-PRE-EXEC 收据，本文件不代签。

## 中文三行

1. `a24382b` 重写为纯文档化：退役实现刀，四案以真实 file:line 引证（proof.ts:763–804、750–758；0091:369–374 epoch 先判），全文无重跑/第二刀授权——上轮 S5 关闭。
2. `retention_pending` 已入 pins 且明写 "pin, not completion evidence"，8+2 项 pins 原值无改口，principal/proof/SSOT 禁改与公开 DELETE=503 保持，证据诚实——上轮 S6 及全边界关闭。
3. 无 Blocker；附 C-PRIV-F1–F4 binding 条件；本 PASS 仅 docs gate、不签 peer、不授权 coding——Line B 未 nail 前 Line F 无任何 coding。

Verdict: PASS
