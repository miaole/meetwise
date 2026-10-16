# PRE-EXEC · Line AN-PRIV-EXT · GAP-PRIV-EXTERNAL-SINK-RETENTION · mw-privacy-int

主审：`mw-privacy-int`  
日期：2026-10-06（约 20:13 CST / UTC+8）  
审查 tip（REQUEST）：`59e2189` / `59e21898fd29c8d64897e7414a228c379568e3e6`  
父提交：`57f92ff` / `57f92ffaa37ecfd628e6e43251a18231d5690f4b`（AK nail tip · harness L6）  
Wave / feat tip：`d269761` / `d26976171ddfa0678b4a42a003fe48a706e9d20e`（`origin/feat/mysql-schema-skeleton` tip · AN wave 后继 docs REQUEST）  
Feat 等价：REQUEST **同 SHA** 已是 feat 祖先（`git merge-base --is-ancestor 59e2189 origin/feat/mysql-schema-skeleton`）；`git range-diff 57f92ff..59e2189 57f92ff..origin/feat/mysql-schema-skeleton` → `59e2189 = 59e2189`（无 patch-id 漂移）；REQUEST patch-id `a521c1b6539f9fd140cd6cfc5a7d82d16a6e8103`。  
Peer stub：`reviews/REQUEST-2026-10-06-gap-priv-external-sink-retention-mw-e2e-ha.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）  
**本审未跑任何 prove。未起 Postgres / Docker。未改产品 / scripts。未碰旧收据。未读 `.env*`。未碰 Meridian。未对 OSS/Redis/Langfuse 做任何外部调用。**  
**PASS ≠ 授权编码 ≠ 关闭 gap ≠ HA。** alone ≠ dual。

下文 harness = `harness/gap-priv-external-sink-retention.md`，slice = `gap-priv-external-sink-retention.slice.md`，本文件 = privacy-int stub→收据。

---

## Diff（docs-only）

`git show --name-only 59e2189` 恰 **4** 文件，全在 `ai-docs/delivery/`：

| Path | Role |
|------|------|
| `gap-priv-external-sink-retention.slice.md` | slice |
| `harness/gap-priv-external-sink-retention.md` | harness |
| `reviews/REQUEST-2026-10-06-gap-priv-external-sink-retention-mw-privacy-int.md` | 本 stub→收据 |
| `reviews/REQUEST-2026-10-06-gap-priv-external-sink-retention-mw-e2e-ha.md` | peer stub |

无 `apps/` · 无 `packages/` · 无 `package.json` · 无 migration / `.sql` · 无 tests · 无 `scripts/` · 无 `principal.ts` / `checkpoint-principal.ts` · 无 `.env*` · 本 commit **零** matrix/backlog/checklist 触碰（harness L51 · Ban SSOT edit）。  
`git diff --name-only 59e2189..d269761` = 仅 AN-PERF-TEAR / AN-RAG-R3 / AN-MOP-Q45 三组 docs（slice+harness+dual stubs）——**零** product/src。

---

## 逐项 checklist

### 1 · Docs-only（REQUEST vs parent · REQUEST..tip）— **PASS**
见 Diff。parent..REQUEST 仅 4 个 `ai-docs/delivery/` 新增。REQUEST..tip 仅 sibling AN docs。零 apps/packages src · tests · migrations · sql · package.json · scripts · `principal.ts` / `checkpoint-principal.ts`。

### 2 · Ground truth：外部 sink 今日行为 vs REQUEST 声称 — **PASS**

| Sink | 当前代码行为（file:line） | REQUEST 声称 | Match? |
|------|---------------------------|--------------|--------|
| **OSS** | begin/attach 仅落 `privacy_deletion_target` status=`retention_pending`（`0096_int_transcript_remaining_sinks.sql:207-213` · `0058_interview_privacy_queue_fence.sql:217-223` · `uc052-internal-erasure.ts:71-85` / `EXTERNAL_SINKS` `:31`）；**无** OSS/MinIO deleteObject / 物理 purge job；本地 purge 集合不含 oss（`LOCAL_PURGE_SINKS` `:32`）；inventory `privacy-deletion-sink-inventory.md:87` / `:125`「无异步确认执行器」· 简历/录音原文 `retention_pending` | harness L10/L16/L20–21 · §2 L29：异步确认落地前 **不得** 计为 erased；request happy=`pending_external` · Ban count-as-erased | **YES** |
| **Redis** | 同上三路径落 `retention_pending`；`rag-redis-cache.ts` / wakeup Redis **无** privacy erasure 挂钩删除；inventory `:87` / `:124` 热缓存 `retention_pending` · 无外部确认不得 completed | 同左 · Ban invent completed | **YES** |
| **Langfuse** | 同上落 `retention_pending`；`langfuse-v5.ts:5-6` / `:111-112` 声明不把 prompt/回答/简历原文交给观测 SDK（伪名化 metadata），但 inventory `:126` 仍登记「观测与模型副本」为外部未闭合面；**无** Langfuse API retention/purge 执行器 / 无 verified sink receipt | harness 钉外部异步 purge 诚实轨 · Ban count-as-erased；本 REQUEST **未**伪称 Langfuse 已擦或已 verified | **YES**（诚实：外部/异步/未验证） |

补充：
- **无** async purge job 对三外部 sink：worker `privacy-erasure-worker.ts` 仅 checkpoint purge（`:8` / `:23`）；UC-052 `runAuthorizedInterviewErasure` 只对 `event`/`ai_graph_run`/`report` 写 `local_erased` receipt（`:210-234`），**不** purge/不 receipt 外部。
- **状态**：target=`retention_pending` → request CASE → `pending_external`（`uc052-internal-erasure.ts:132-133` · `0096:579-580`）。
- **0091 出口（未接线真实外部）**：`privacy_resolve_deletion_receipt` 仅当已有 `external_pending` receipt 时可推 `external_confirmed`（`0091:454-501`）；completed guard `0091:516-545` — every target `erased` **且** 无 `external_pending`/`failed_cleanup`。有 `retention_pending` 时 **不能** honest-`completed`（harness L21 与源码一致）。
- REQUEST **未**写「已 erased/purged」作外部当前态；拟轨 = 异步确认 / receipt 形状 / fail-closed（harness §2 · Ban invent completed）。

### 3 · `retention_pending` · 禁伪 erased · Ban controlPlaneClosed — **PASS**
- Matrix `e2e-requirement-coverage-matrix.md:132` / `:190`：externals **`retention_pending`** · UC-052 **partial** · DELETE **503** · coveredCount **8**。
- REQUEST/harness/slice/stubs：`rg controlPlaneClosed|control plane closed` → **零命中**（未宣称；强于「仅 Ban 区」）。
- 「erased / completed / purged」在 REQUEST 中仅出现于 **Ban / Non-claims / 对齐 guard 叙述**（harness L20–21 · L35–36 · L63），**非**外部当前状态断言。

### 4 · Public DELETE=503 pin — **PASS**
- `apps/api/src/modules/privacy/privacy.controller.ts:51-52`：`@Delete('interview-data/:id')` + `@HttpCode(HttpStatus.SERVICE_UNAVAILABLE)`。
- `privacy.service.ts:53-56`：`eraseInterviewData` → `HttpException(..., SERVICE_UNAVAILABLE)`（503）· 注释 inventory 外部 sink 未齐。
- REQUEST：harness L4/L23/L29/L36/L67 · stub pins · Ban open DELETE — **不**计划放开公开 DELETE。

### 5 · PG-retained · 不与外部 sink 混为一谈 — **PASS**
- Pins：PG-retained（harness L4 · stub L22）。
- Line B 内部刀（本地 sink + authorization root + transcript ledger）只读引用（harness L12/L16）；本刀目标面 = **外部** oss/redis/langfuse 异步确认轨；Ban wash internals 为外部闭环（harness L37/L56）。
- PG 侧 `local_erased` / checkpoint physical / pool-role 等 **未**被本 REQUEST 改写为「外部已擦」。

### 6 · 计划执行范围 · 闸门 BOTH PRE + AUTHORIZE — **PASS**
- **本 REQUEST**：L0 docs only · 零编码（harness L3/L9 · slice L3）。
- **拟（未授权）**：书面异步确认合同 / receipt 形状 / fail-closed；拟 prove CMD（harness §2–§3）；未来若编码须列 sink receipts + 诚实 status · Ban invent completed / Ban count-as-erased（harness L30/L35/L55–56）。
- **闸门**：Ban coding until PRE dual **BOTH** PASS + coordinator AUTHORIZE（harness L55 · stub L35/L37）。
- **Langfuse**：REQUEST 诚实钉外部 `retention_pending` / 无确认执行器；与 inventory「观测副本」+ 源码「无 purge job」一致 — purge = 外部/异步/未验证，**不得**伪 completed。

### 7 · Gap stays OPEN — **PASS**
- backlog `gap-bug-backlog.md:64`：`GAP-PRIV-EXTERNAL-SINK-RETENTION` 仍 OPEN（「外部 sink 异步确认/真实 purge 另刀」）。
- harness L11/L49/L67：stays OPEN · canHonestlyFlip=false 直至异步 purge prove + dual + 协调方授权。
- 无 covered / fixed / closed 作本 gap 状态。

### 8 · Pins — **PASS**

| Pin | 出处 | 值 |
|-----|------|----|
| haStatus | harness L4/L67 · stub L16 | **NOT_HA** |
| releaseEvidence | 同上 · stub L17 | **false** |
| claimProductionHA | stub L18 | **false** |
| gR45Closed | harness L4 | **true** |
| coveredCount | harness L4 · stub L20 | **8**（= RAG-FUNNEL-02A..08 only；本刀未扩） |
| ms3EqualsR4Closed | harness L4 · stub L21 | **false** |
| Stack | stub L22 | **PG-retained** |
| public DELETE | controller `:51-52` · service `:56` · harness | **503** |
| external | matrix `:132`/`:190` · REQUEST | **retention_pending** |
| UC-052 | matrix `:132`/`:190` | **partial** · ≠ covered |
| GAP-PRIV-AUTHZ-PROVE-FLAKE | backlog `:68` · matrix `:132` | **OPEN** mitigated/cause-unknown（本刀未关） |
| backlog `:64` | gap-bug-backlog.md:64 | **OPEN** |

### 9 · PASS ≠ coding ≠ close gap ≠ HA；alone ≠ dual — **PASS**
harness Non-claims L63 · stub Ban L35–37。本收据：**不代签** peer `mw-e2e-ha`。未跑 prove。不授权编码。不关闭 gap。不是 HA。

---

## 非阻塞备注（不影响 Verdict）

1. **N1 · Langfuse 内容面**：`langfuse-v5.ts` 现做 I/O collapse + 伪名化，降低「transcript 明文进观测」风险；inventory 仍诚实登记外部 sink。未来 purge 刀须区分「SDK 已拒原文」vs「供应商侧历史副本 / API retention」——仍须 verified receipt，不得 invent erased。
2. **N2 · `external_pending` vs `retention_pending`**：今日 UC-052/0096 落的是 target status `retention_pending`（驱动 request `pending_external`），**未必**已写 `receipt_kind=external_pending`。0091 resolve 入口要求已有 `external_pending` receipt。未来确认器设计须钉清：谁写 `external_pending`、谁在外部 API 成功后 resolve→`external_confirmed`。
3. **N3 · Sibling AN tip**：`d269761` 上另有 PERF/RAG/MOP REQUEST；与本刀零交叉；本审仅钉 AN-PRIV-EXT。
4. **N4 · Peer**：`mw-e2e-ha` stub 仍 PENDING；alone ≠ dual。

---

## Pins（本审保留）

| Pin | 值 |
|-----|-----|
| REQUEST | `59e21898fd29c8d64897e7414a228c379568e3e6` |
| parent | `57f92ffaa37ecfd628e6e43251a18231d5690f4b` |
| tip / feat tip | `d26976171ddfa0678b4a42a003fe48a706e9d20e` |
| feat 等价（REQUEST） | `59e21898fd29c8d64897e7414a228c379568e3e6`（同 SHA · feat 祖先） |
| haStatus | NOT_HA |
| releaseEvidence | false |
| public DELETE | 503 |
| Stack | PG-retained |
| external | retention_pending |
| UC-052 | partial · ≠ covered |
| coveredCount | 8（RAG-FUNNEL-02A…08 only） |
| Gap GAP-PRIV-EXTERNAL-SINK-RETENTION | **OPEN** · backlog `:64` · **not closed** |
| GAP-PRIV-AUTHZ-PROVE-FLAKE | **OPEN** mitigated/cause-unknown |
| prove this review | **not run** |
| peer mw-e2e-ha | 不代签 · alone ≠ dual |

---

## 总评

P1–P9 全部成立。`59e2189` 为 docs-only Line AN-PRIV-EXT REQUEST（4 文件新增）；源码证实 oss/redis/langfuse **无**真实 purge job、仅 `retention_pending`→request `pending_external`、无 verified sink receipt 可称 erased；REQUEST 与该真相对齐并 Ban count-as-erased / Ban open DELETE / Ban invent completed；DELETE=503 源码钉在 controller `:51-52` + service `:56`；PG 内部擦除与外部 sink 未混谈；gap `:64` 仍 OPEN；pins 全保留；拟编码/prove 须 BOTH PRE + AUTHORIZE；不代签 e2e-ha。  
**本审查未跑 prove，不授权任何编码或执行，不关闭 `GAP-PRIV-EXTERNAL-SINK-RETENTION`，不是 HA，不代签 mw-e2e-ha。PASS ≠ 授权编码 ≠ 关闭 gap ≠ HA。执行须 BOTH PRE PASS + 协调方 AUTHORIZE。**

Verdict: PASS
