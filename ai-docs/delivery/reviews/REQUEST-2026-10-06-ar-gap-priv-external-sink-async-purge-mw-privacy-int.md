# PRE-EXEC · Line AR · GAP-PRIV-EXTERNAL-SINK-RETENTION async purge real knife · mw-privacy-int

主审：`mw-privacy-int`  
日期：2026-10-06（约 23:56 CST / UTC+8）  
审查 tip（REQUEST）：`e2eac8ca` / `e2eac8ca8468fb031860c1a0e9604022657c41f3`  
父提交：`68914be2` / `68914be222a49b3ba61506fac07c0812fffb7a99`（AO-COND35 POST tip · Ban touch AO COND body）  
Feat tip（本审落点基线）：`2bca8045` / `2bca8045030748df1d4ff8bb382f92cd597f177a`（`origin/feat/mysql-schema-skeleton` · REQUEST 为其祖先）  
Prior nail AN-PRIV-EXT：`ada604a` / `ada604a239cdfd5c57da30ea6938b885f4acb8ae`（`post_prove_dual_pass` · gap `:64` OPEN · NB-3 · DELETE=503）  
Peer stub：`reviews/REQUEST-2026-10-06-ar-gap-priv-external-sink-async-purge-mw-e2e-ha.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）  
**本审未跑任何 prove。未起 Postgres / Docker。未改产品 / migrations / scripts。未碰旧收据。未读 `.env*`。未碰 Meridian。未对 OSS/Redis/Langfuse 做任何外部/云调用。**  
**PASS ≠ 授权编码 ≠ 关闭 `:64` ≠ HA。** alone ≠ dual。

下文 harness = `harness/ar-gap-priv-external-sink-async-purge.md`，slice = `ar-gap-priv-external-sink-async-purge.slice.md`，本文件 = privacy-int stub→收据。

---

## Diff（docs-only）

`git diff --name-only 68914be2..e2eac8ca` 恰 **7** 文件，全在 `ai-docs/delivery/`：

| Path | Role |
|------|------|
| `ar-gap-priv-external-sink-async-purge.slice.md` | slice（new） |
| `harness/ar-gap-priv-external-sink-async-purge.md` | harness（new · AR- 独立路径） |
| `reviews/REQUEST-2026-10-06-ar-gap-priv-external-sink-async-purge-mw-privacy-int.md` | 本 stub→收据 |
| `reviews/REQUEST-2026-10-06-ar-gap-priv-external-sink-async-purge-mw-e2e-ha.md` | peer stub |
| `gap-bug-backlog.md` | additive SSOT pointer · `:64` 仍 OPEN |
| `execution-master-checklist.md` | additive Line AR 段 · Ban flip CLOSED |
| `e2e-requirement-coverage-matrix.md` | additive Line AR 段 · Ban covered flip |

无 `apps/` · 无 `packages/` · 无 `package.json` · 无 migration / `.sql` · 无 tests · 无 `scripts/` · 无 `principal.ts` / `checkpoint-principal.ts` · 无 `.env*`。  
`rg` product paths against tip..parent → **零命中**。

---

## 逐项 checklist

### 1 · Docs-only（REQUEST vs parent）— **PASS**
见 Diff。parent `68914be2`..REQUEST `e2eac8ca` 仅 7 个 `ai-docs/delivery/` 文件（4 新产品/stub + 3 additive SSOT）。零 apps/packages src · migrations · package.json · scripts · `principal.ts` / `checkpoint-principal.ts`。

### 2 · Cites real：prior nail · gap `:64` · 0137 / resolve — **PASS**

| Cite | 核实 |
|------|------|
| Nail `ada604a` | 存在 · message/harness 钉 `post_prove_dual_pass` · gap `:64` OPEN · canHonestlyFlip=false · DELETE=503 · Ban count-as-erased · **NB-3** `external_confirmed` ≠ vendor data deleted · alone≠dual · PASS≠关 gap≠HA · PROVE `4b06058` · CODE `9e2abd0` · POST `2b33e7c`+`24ba2a4` — 与 REQUEST 声称一致 |
| backlog `:64` | `gap-bug-backlog.md:64` 仍 **OPEN** · 拟切片列仍写 **OPEN** · AR 仅 additive `draft:awaiting_pre_exec_dual` · **Ban close via docs alone** |
| 0137 fail-closed | `packages/db/migrations/0137_privacy_external_sink_confirmation_guard.sql:45-54`：oss/redis/langfuse 缺 resolve-audited `external_confirmed`（`resolved_at`+`resolved_by` NOT NULL）→ `55000` `privacy_erasure_request_external_unconfirmed`；`:64` REVOKE FROM `app_role` |
| resolve 路径 | `0091_privacy_authorization_issuer.sql:460-514`：`privacy_resolve_deletion_receipt` 仅 pending→confirmed + 写 resolved_* · **GRANT** 仅 `privacy_worker_executor` · **REVOKE** `app_role`（`:513-514`）· **不**校验 vendor API 证据（NB-1 仍真 · 见 §4） |
| completed guard 0091 | `0091:516-545`：completed iff every target `erased` AND 无 `external_pending`/`failed_cleanup`（harness L33 引用匹配） |
| DELETE=503 | `privacy.controller.ts:51-52` `@Delete` + `@HttpCode(SERVICE_UNAVAILABLE)`；`privacy.service.ts:56` throw 503 |
| 今日外部态 | 仍仅 `retention_pending`：`0096:207-213` · `0058:217-223` · `packages/db/src/uc052-internal-erasure.ts:71-85`（`EXTERNAL_SINKS` `:31` · 无真实 purge job） |

### 3 · Honesty gates 在场且未洗 — **PASS**

| Gate | 出处 |
|------|------|
| Ban count-as-erased | harness L3/L46/L69 · slice L3/L34 · stub Ban · backlog `:64` |
| Ban invent erased/completed | harness L48/L69 · slice L34 · Non-claims L78 |
| NB-3 `external_confirmed` ≠ vendor deleted | harness L10/L16/L34/L70 · slice L11 · stub pins L27 · checklist/matrix additive |
| Ban close `:64` via docs alone | harness L3/L47/L61 · slice L3 · backlog 目标列 · matrix/checklist |
| Ban covered flip | harness L48/L71 · Ban UC-050/051/052 covered |
| Ban open DELETE（public stays 503） | harness L3/L46 · slice L34 · pins |
| Ban wash honesty→vendor wipe | harness L16/L47/L70 · slice L34 |

### 4 · Planned real-knife scope（per sink · vendor evidence）— **PASS**（硬条件成立；细节见 NB）

**合同（拟 · 未授权 · harness §2 L38–42）**：
- Real async confirm path：vendor confirm / purge executor 合同 · receipt 形状 · fail-closed（超时/拒绝/部分失败 → **不**升 `completed`）· 对齐 0091 completed guard。
- Vendor purge evidence：真实路径证据类 · **非** count-as-erased · **非** invent erase · **非** open DELETE。
- completed **仅当** every target erased **且** vendor evidence 满足专家钉的证据类。
- NB-3 仍成立直至 vendor evidence + dual + 协调方授权（harness L55）。

**Per-sink 今日真相 → 本刀含义**：

| Sink | 今日（无 purge job） | 本刀拟义（docs） | 证据门槛 |
|------|---------------------|------------------|----------|
| **OSS** | `retention_pending` only（0096:207-213 · uc052:71-85） | 须经可验证 vendor/API purge 证据后，才可走 confirm/resolve 并趋向 completed | **必须**有 verifiable OSS/API 证据；禁伪造 receipt；fail-closed |
| **Redis** | 同上 | 同上（热缓存/副本 purge） | 同上 |
| **Langfuse** | 同上 | 同上（观测/retention API） | 同上；SDK 伪名化 ≠ vendor 已删 |

**范围声明**：REQUEST 将 oss·redis·langfuse **三 sink 同列**为刀面（harness L10）；**未**声明「仅 OSS first / Redis+Langfuse 另挂」——因此若 AUTHORIZE 后缩 scope，须显式改写且 `:64` 仍 OPEN。  
**关键否决点**：计划 **不**允许无 vendor 证据即 resolve/confirm 通向 completed（harness L42/L55 · Ban wash 0137 attestation into vendor wipe）。今日 `privacy_resolve_deletion_receipt`（0091:460-514）**仍无** vendor 证据门（仅 DB attestation）——本刀编码时 **MUST** 在 confirm/resolve 前增益可验证 vendor/API 证据，否则不得向 completed 推进。本 PRE **不**放行「空确认」。

### 5 · Coding gated：BOTH PRE + AUTHORIZE — **PASS**
harness L3/L68 · slice L3/L34 · stub Ban：Ban coding until PRE dual **BOTH** PASS + coordinator AUTHORIZE。Dual PASS ≠ coding ≠ prove。本审 **不**授权产品/migration/worker 编码。

### 6 · Pins — **PASS**

| Pin | 值 | 出处 |
|-----|-----|------|
| haStatus | **NOT_HA** | harness L4/L82 · stub |
| releaseEvidence | **false** | 同上 |
| claimProductionHA | **false** | stub / pins |
| gR45Closed | **true** | harness L4 |
| coveredCount | **8**（= RAG-FUNNEL-02A..08 only；本刀未扩） | harness L4 · slice L4 |
| ms3EqualsR4Closed | **false** | harness L4 |
| Stack | **PG-retained** | pins |
| public DELETE | **503** | controller `:51-52` · service `:56` |
| UC-052 | **partial** · ≠ covered | harness L62 · backlog |
| backlog `:64` | **OPEN** | `gap-bug-backlog.md:64` |
| retention_pending | 外部仍此态直至真实 purge | 0096/0058/uc052 |
| GAP-PRIV-AUTHZ-PROVE-FLAKE | **OPEN** mitigated/cause-unknown（`:68`）· 本刀未关 | nail `ada604a` 保留 · AR 未洗关 |
| NB-3 | held | harness / slice / stub |

### 7 · PASS ≠ coding ≠ close `:64` ≠ HA；alone ≠ dual — **PASS**
Non-claims harness L76–78 · stub Ban。本收据：**不代签** peer `mw-e2e-ha`。未跑 prove。不授权编码。不关闭 gap。不是 HA。

---

## 非阻塞备注（不影响 Verdict）

1. **N1 · Per-sink 证据类须在 AUTHORIZE/编码前钉死**：本 REQUEST 书面要求 vendor evidence，但尚未逐 sink 写死证据类（例：OSS deleteObject/List 空证 · Redis DEL/EXISTS 空证 · Langfuse retention/delete API + 副本证明）。编码前须由 PRE dual/协调方钉 CMD 与 evidence class；缺则不得 resolve→completed。
2. **N2 · resolve 缺口（NB-1 延续）**：`0091:460-514` resolve **不**读 vendor 证据；0137 只要求 resolve-audited attestation。本刀若动 resolve/executor，**必须**增益证据门，禁把 attestation 洗成 purge proof（NB-3）。
3. **N3 · `retention_pending` vs `external_pending`**：今日落 target `retention_pending`（0096:213 · uc052:81），未必已有 `receipt_kind=external_pending`。0091 resolve 入口要求已有 `external_pending`（0091:486-489）。确认器设计须钉：谁写 pending receipt、谁在 vendor 成功后 resolve。
4. **N4 · 三 sink 同列**：若实作先做 OSS-only，必须显式改 scope 且 `:64` 保持 OPEN（Redis/Langfuse 仍 pending）——当前 docs **未**做该缩 scope。
5. **N5 · Peer**：`mw-e2e-ha` stub 仍 PENDING；alone ≠ dual。本审不代签。
6. **N6 · Sibling tips**：feat tip `2bca8045` 上另有 AO-COND35 / AQ docs；与本刀零 product 交叉；Ban touch AO COND body · Ban conflict AQ。

---

## Pins（本审保留）

| Pin | 值 |
|-----|-----|
| REQUEST / tip | `e2eac8ca8468fb031860c1a0e9604022657c41f3` |
| parent | `68914be222a49b3ba61506fac07c0812fffb7a99` |
| feat tip（receipt base） | `2bca8045030748df1d4ff8bb382f92cd597f177a` |
| prior nail AN-PRIV-EXT | `ada604a239cdfd5c57da30ea6938b885f4acb8ae` |
| CODE / PROVE / POST（cite only） | `9e2abd0` / `4b06058` / privacy `2b33e7c` + e2e `24ba2a4` |
| haStatus | NOT_HA |
| releaseEvidence | false |
| public DELETE | 503 |
| Stack | PG-retained |
| external | retention_pending（直至真实 purge 证据） |
| UC-052 | partial · ≠ covered |
| coveredCount | 8（RAG-FUNNEL-02A…08 only） |
| Gap GAP-PRIV-EXTERNAL-SINK-RETENTION | **OPEN** · backlog `:64` · **not closed** |
| GAP-PRIV-AUTHZ-PROVE-FLAKE | **OPEN** mitigated/cause-unknown |
| NB-3 | external_confirmed ≠ vendor deleted |
| prove this review | **not run** |
| peer mw-e2e-ha | 不代签 · alone ≠ dual |

---

## 总评

P1–P7 全部成立。`e2eac8ca` 为 docs-only Line AR REQUEST（7 个 `ai-docs/delivery/` 文件）；正确钉 async purge real knife 为 AN-PRIV-EXT honesty nail `ada604a` 的后继，且 **≠** wash honesty into vendor wipe、**≠** close `:64` via docs alone；honesty gates（Ban count-as-erased / invent erased / NB-3 / Ban close via docs / Ban covered flip / Ban open DELETE）齐全；计划要求可验证 vendor 证据后方可趋向 completed，且 fail-closed；0137/0091/DELETE=503 源码 cite 匹配；pins 全保留；编码须 BOTH PRE + AUTHORIZE；不代签 e2e-ha。  
**本审查未跑 prove，不授权任何编码或执行，不关闭 `GAP-PRIV-EXTERNAL-SINK-RETENTION`（`:64`），不是 HA，不代签 mw-e2e-ha。PASS ≠ 授权编码 ≠ 关闭 `:64` ≠ HA。执行须 BOTH PRE PASS + 协调方 AUTHORIZE。**

Verdict: PASS
