# RE-PRE-EXEC r3 · NOTE-CKPT-UNSEALED-CLAIM-NEG（Line F · docs-only SSOT）

主审：`mw-privacy-int`  
日期：2026-10-02（约 21:28 PT）  
对齐提交：`542c064` / `542c0646d1635b0a3a28c5d821ad50bc6ea625a3`  
父提交：`210f4c0`  
`542c064` 是 origin 祖先（本收据落在其后的分支尖端，不要求改写 `a24382b`）  
上一轮 FAIL：`d2c842e` / `d2c842e6589687e34028c626d1ad9ba73dc8910c`（R4：旧 harness 仍把 NOTE 写成 open/unproven）  
本审不重跑证明，不授权编码。未改旧收据。

---

## 1. `542c064` diff

仅 2 个文档，2 insertions / 2 deletions。无产品代码、测试、migration、GRANT、路由、`package.json`、`checkpoint-principal.ts`：

- `ai-docs/delivery/harness/uc-e2e-052-checkpoint-physical.md`
- `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md`

`a24382b` 的 Line F harness/slice 未被本提交改动，尖端上仍是 cite+retire、禁止第二实现、禁止改 principal。

---

## 2. 逐项

### 1 docs-only — **PASS**
见上。

### 2 Open follow-ups 只留 flake — **PASS（开放集合）**
`uc-e2e-052-checkpoint-physical.md` L172 原文：

`Open follow-ups | GAP-PRIV-AUTHZ-PROVE-FLAKE only — OPEN, mitigated/cause-unknown (not fixed); GAP-UC052-POOL-ROLE-LEAK CLOSED …; NOTE-CKPT-UNSEALED-CLAIM-NEG CLOSED …`

NOTE 不再作为开放项；同一格里把它和 POOL 标成 CLOSED。唯一 OPEN 是 flake，且写明不是 fixed。

### 3 CLOSED 引用对准证明 — **FAIL**
NOTE 的 case 行号在尖端证明（blob 仍为 `2e3ca52e`）上是对的：

- L763 `NHP-CKPT-UNSEALED-NEG-EPOCH`
- L768 `NHP-CKPT-UNSEALED-NEG-DIGEST`
- L773 `NHP-CKPT-UNSEALED-NEG-BOTH`
- L778 标题 / L780 `HP-CKPT-SEALED-CLAIM` / L804 lease 断言
- L750 `sqlState === '42501'`
- 0091 L369–373 仍是 `42501`；`claimAuthorizationTarget` L124–128 只调 SQL 函数

POOL 的关闭句不诚实：`uc052:pool-role-leak:prove` EXIT=0 的 `gitSha=119d6c08…`。`119d6c0` 是钉文档（只改矩阵、checklist、backlog），不是那次证明。证明 SHA 仍是 `9b39a20`（与 `ab96a02` range-diff 相等），文中后半句写对了，前半句把钉 SHA 当成 prove gitSha。

### 4 pool 文档不再说负例 unproven — **FAIL**
L21 已改成 CLOSED，不再写 unproven。同文件 L35 仍写：`C-DIGEST-JWS asserts pre-seal NULL · no claim-before-seal NEG`。这仍是在说负例不存在。

### 5 禁止改 principal、禁止第二实现 — **FAIL**
Line F harness/slice 仍禁止改 `checkpoint-principal.ts`、禁止第二实现。  
pool harness §4 L69–L71 仍把 `apps/worker/src/checkpoint-principal.ts` 和 `uc052-checkpoint-physical.proof.ts`（UNSEALED NEG only）放进编码允许清单。L32 仍把泄漏现场写成当前的「无 RESET」。与 L20 的 CLOSED 矛盾，也没有撤掉第二轮改证明的授权。

### 6 DELETE=503 且 UC-052 仍 partial — **PASS**
pool L20 写 UC-052 remains partial。矩阵 UC-E2E-050–052 仍是 partial，并写 DELETE 503。checkpoint L169 / L173 同样保留 DELETE=503 与 partial。没有把 UC-052 标成已完成。

### 7 coveredCount=8 — **PASS（计数不是 UC-052）**
字段在 checkpoint harness L131、pool harness L86、Line F pins、矩阵多处，值都是 8。  
成员在 `harness/g-r4-5-funnel-covered-count-batch4b-08-eval.md`：`RAG-FUNNEL-02A`、`02B`、`03`、`04`、`05`、`06`、`07`、`08`，共 8。UC-052 不在这 8 项里，矩阵仍保持 partial。本对齐没有靠把 UC-052 标完成来凑 8。

### 8 pins — **PASS**
Line F harness 与矩阵有 `NOT_HA`、`releaseEvidence=false`、PG-retained、外部 `retention_pending`、公开 DELETE 503。checkpoint L173 有 NOT_HA、releaseEvidence=false、PG-retained、DELETE=503。

### 9 `a24382b` 文本未回退 — **PASS**
`542c064` 不改那两个文件。尖端 harness 仍写 implementation knife retired、四案已在、禁止第二次 prove。

### 10 SSOT 不互相矛盾 — **FAIL**
矩阵、backlog L67、checklist 与 Line F 把 NOTE/POOL 标成 CLOSED，flake 保持 OPEN、mitigated/cause-unknown。  
但 pool harness 内部：L20/L21 说 CLOSED，L35 说没有 claim-before-seal 负例，L32/L69 仍像待改的泄漏现场与允许改 principal。checkpoint L172 的开放集合虽只留 flake，POOL 的 gitSha 又与矩阵里的 prove `9b39a20` 不一致。

---

## 3. 总评

1、2、6、7、8、9 通过。3、4、5、10 失败。整体 FAIL。不授权编码。

Verdict: FAIL
