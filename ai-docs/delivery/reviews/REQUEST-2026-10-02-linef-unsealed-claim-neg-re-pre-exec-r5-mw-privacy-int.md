# RE-PRE-EXEC r5 · NOTE-CKPT-UNSEALED-CLAIM-NEG（Line F · docs-only）

主审：`mw-privacy-int`  
日期：2026-10-02（约 21:44 PT）  
对齐提交：`ff43d63` / `ff43d630d83100f0089b7d0a96f1e72a58beeda9`  
父提交：`018d692` / `018d69225ff928b3a1a3956d48587c220342e9ec`  
`ff43d63` 是本收据所推分支尖端的祖先。REQUEST 仍是 `a24382b`，本审不要求改它。  
上一轮 FAIL（权威、未改）：`08cbd63` / `08cbd635c198f359d033ced25ebafaa6d2bd44b8`（针对 tip `2a66c22`）。  
另读 `cc326ac`（`mw-e2e-ha` r4，不是本身份的收据）只为核对它是否点出额外文档缺陷；未因其措辞差异单独判 FAIL。本 tip 上已有 `mw-e2e-ha` r5 PASS `45b0ea7`，alone ≠ dual，不代签。  
本审不重跑证明，不授权编码。未改旧收据（含 `08cbd63`）。

---

## 父 diff

`ff43d63` 相对父提交：`1 file changed, 3 insertions(+), 3 deletions(-)`。仅：

- `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md`

无产品代码、测试、migration、GRANT、路由、`package.json`、`checkpoint-principal.ts`。

---

## 逐项（A–F）

### A docs-only — **PASS**
见上。相对父提交无产品/测试/migration/GRANT/路由/`package.json`/`checkpoint-principal.ts`。

### B NOTE CLOSED 引用 prove/code `ab96a02` — **PASS**
`uc-e2e-052-pool-role-leak.md` L21 现为：

> **CLOSED**: prove/code evidence at **`ab96a02`** (`ab96a0299d8836a635077f8bf9b61a7891aa583f`) in `packages/db/test/uc052-checkpoint-physical.proof.ts` cases **NHP-CKPT-UNSEALED-NEG-EPOCH** L763, **NHP-CKPT-UNSEALED-NEG-DIGEST** L768, **NHP-CKPT-UNSEALED-NEG-BOTH** L773, and sealed **HP-CKPT-SEALED-CLAIM** header L778 / case L780 through assertion L804; SQLSTATE **42501** check L750; DB guard `packages/db/migrations/0091_privacy_authorization_issuer.sql` L369–373. Nail **`119d6c0`** is the docs-only nail. **`9b39a20`** is range-diff-equal to **`ab96a02`** but is not on origin. EXIT=0 stays attached to **`ab96a02`**, never to the nail.

不再写 `CLOSED by nail 119d6c0`。关闭 SHA 是 prove/code **`ab96a02`**；`119d6c0` 仅 docs-only nail。  
POOL 行 L20 同钉：`EXIT=0 at prove/code SHA ab96a02`；`119d6c0` 是 docs-only nail。

### C 机制引用 L79 / L80–82 / L101–103 — **PASS**
pool L32 现为：

> Leak site | `apps/worker/src/checkpoint-principal.ts` cleanup path **L79** `SET ROLE NONE`, **L80–82** the three principal GUC clears, **L101–103** destroy-on-reset | Mitigated product path: pool release uses `SET ROLE NONE`, clears the three principal GUCs, and destroys the connection if reset throws

对照 `ab96a02` 源码 `apps/worker/src/checkpoint-principal.ts`：

| 引用 | 实际源码 |
|------|----------|
| L79 | `await client.query('SET ROLE NONE');` |
| L80–82 | `for (const key of GUC_KEYS) { await client.query('SELECT set_config($1, $2, false)', [key, '']); }`（清 `app.principal_user` / `app.checkpoint_thread_id` / `app.checkpoint_epoch`） |
| L101–103 | `catch (resetErr) { … originalRelease(resetErr instanceof Error ? resetErr : true); }`（reset 抛错则销毁连接） |

L51–54 在同树是 `__setCheckpointPrincipalCleanupOverrideForTest` 的 `E2E_ISOLATED` 测试 override 门禁，不是清理路径。本轮引用不再指向 L51–54。

### D 无 `packages/db/test/*` allowlist；principal / 第二实现禁令仍在 — **PASS**
pool §4 L69 现为：

> `apps/worker/test/*`（new pool-leak prove · not `packages/db/test/*`, not the unsealed-NEG proof, and not a second implementation of that proof）

已无 `packages/db/test/*` 作为允许项；通配被显式排除。无 `checkpoint-principal.ts` 进入 allowlist。  
Line F harness `note-ckpt-unsealed-claim-neg.md` L27：`Keep apps/worker/src/checkpoint-principal.ts unchanged.`；L7 禁止第二实现。  
slice `note-ckpt-unsealed-claim-neg.slice.md` L23：`Do not edit apps/worker/src/checkpoint-principal.ts.`；L7 不得授权第二实现。  
在两个 harness 中搜索：`packages/db/test` 仅作为既有证明路径引用或“not …”排除；无 allowlist 覆盖 unsealed 证明或 `checkpoint-principal.ts`。禁令=好；allowlist=FAIL — 本 tip 无后者。

### E flake 仍是唯一 OPEN — **PASS**
pool L22：`GAP-PRIV-AUTHZ-PROVE-FLAKE` **OPEN**, **mitigated/cause-unknown** (not fixed)。  
checkpoint-physical L172：`GAP-PRIV-AUTHZ-PROVE-FLAKE only` — **OPEN**, **mitigated/cause-unknown** (not fixed)。  
backlog / checklist 同标 OPEN mitigated/cause-unknown，未写成 fixed。唯一 OPEN follow-up 仍是该 flake。

### F 无回退 · SSOT 不矛盾 — **PASS**
已修项未回退：

- pool L20 / checkpoint L172：prove EXIT=0 挂在 **`ab96a02`**（full `ab96a0299d8836a635077f8bf9b61a7891aa583f`）；`119d6c0` 仅 docs nail；`9b39a20` range-diff-equal 且不在 origin（已 `merge-base --is-ancestor` 核实）。
- pool L35 仅 `C-DIGEST-JWS asserts pre-seal NULL`。无 `unproven` / `no claim-before-seal NEG`。
- 命名 allowlist `checkpoint-principal.ts` 与 `UNSEALED NEG only` 证明行已移除（本 tip 前已清，未回退）。
- 机制句：pool release 使用 `SET ROLE NONE`、清三个 principal GUC、reset 抛错则销毁连接。
- Flake：`GAP-PRIV-AUTHZ-PROVE-FLAKE only — OPEN, mitigated/cause-unknown (not fixed)`。

证明引用对准 blob `2e3ca52ec3a57d796747821d044f49d45306ad43`（`ab96a02:packages/db/test/uc052-checkpoint-physical.proof.ts`）：EPOCH L763、DIGEST L768、BOTH L773、sealed L778/L780–L804、L750 `sqlState === '42501'`。Migration 0091 L369–373 抛 `42501`。`claimAuthorizationTarget`（`packages/db/src/privacy-authorization.ts` L124–128）只调用 `privacy_authorization_claim_target` SQL。  
coveredCount=**8**（RAG-FUNNEL-02A/02B/03/04/05/06/07/08）。UC-052 不在其内，仍 **partial** · **≠ covered**。隐私缺口未标 covered。  
Pins：NOT_HA · releaseEvidence=false · public DELETE=503 · PG-retained · retention_pending。  
NOTE / POOL / prove SHA / flake：pool、checkpoint-physical、Line F harness/slice、矩阵/backlog/checklist 不互相矛盾（NOTE CLOSED 于既有 cite / prove `ab96a02`；POOL CLOSED 于 `ab96a02`；flake 唯一 OPEN）。  
附录：历史 `uc-e2e-052-pool-role-leak.slice.md` 一行仍写 L51–54（r0 草稿 one-line）；权威 Leak site 已在 pool harness L32 纠正。不把该陈旧 slice 一句升为本轮阻塞（与 r4 对 SSOT 的范围一致；本 tip 宣称修复的是 harness 三处）。

---

## Pins

| Pin | 值 |
|-----|-----|
| tip | `ff43d63` |
| haStatus | NOT_HA |
| releaseEvidence | false |
| public DELETE | 503 |
| Stack | PG-retained |
| retention | retention_pending |
| UC-052 | partial · ≠ covered |
| coveredCount | 8 |
| Flake | GAP-PRIV-AUTHZ-PROVE-FLAKE only — OPEN, mitigated/cause-unknown (not fixed) |

---

## 总评

A–F 全部成立。相对 `08cbd63` 的三处 FAIL（NOTE 关闭 SHA、机制行号、`packages/db/test/*` allowlist）在 `ff43d63` 已纠正且无回退。  
**本审查不授权任何编码。** docs-only RE-PRE-EXEC；不重跑 prove。

Verdict: PASS
