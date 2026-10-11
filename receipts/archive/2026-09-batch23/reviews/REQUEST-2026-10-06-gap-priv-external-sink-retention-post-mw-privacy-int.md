# POST-PROVE · Line AN-PRIV-EXT · GAP-PRIV-EXTERNAL-SINK-RETENTION · mw-privacy-int（privacy side）

主审：`mw-privacy-int`  
日期：2026-10-06（约 20:40 CST / UTC+8）  
PROVE tip（receipt commit）：`4b06058` / `4b06058be576e52903d213ace29c5c984e7cc7e2`（`origin/feat/mysql-schema-skeleton` 祖先；fetch 时 origin tip = `eae1e19` AN-MOP-Q45 nail，与本线无关）  
CODE_SHA：`9e2abd0` / `9e2abd04083eca464817e35687595c706cbcd2a9`  
REQUEST：`59e2189` / `59e21898fd29c8d64897e7414a228c379568e3e6` · 本方 PRE `fb6fca2` / `fb6fca2ada0b9afeec974f646242a4b9d7783026` · e2e PRE `512cc5d`（**不代签**）  
Implementer receipt：`receipts/gap-priv-external-sink-retention/2026-10-06-an-priv-ext-prove.md`  
未找到 privacy-int POST stub（`reviews/` 下仅 privacy-int PRE / e2e-ha PRE / e2e-ha stub），故新建本文件。  
**本审仅在临时 detached worktree 中跑了 2 条命令各 1 次（见 §5）。未改产品 / scripts。未碰旧收据 / stash / 共享 checkout。未读 `.env*`。未碰 Meridian。零 OSS/Redis/Langfuse/云调用。**  
**PASS ≠ nail ≠ 关闭 gap ≠ HA。** alone ≠ dual。

---

## 1 · Scope — **PASS**

`git diff --name-status 59e2189..9e2abd0` 中属于本线的 = CODE commit `9e2abd0` 自身（`git show --stat`）6 文件：

| Path | Change |
|------|--------|
| `packages/db/migrations/0137_privacy_external_sink_confirmation_guard.sql` | **A** · 68 行 |
| `packages/db/test/uc052-external-sink-retention.proof.ts` | **A** · 355 行 |
| `package.json` | +2（`uc052:external-sink-retention:prove` / `:raw`） |
| `packages/db/package.json` | +1（`prove:uc052-external-sink-retention`） |
| `scripts/run-e2e-isolated.mjs` | numstat **+14 / −2**（receipt-sources +10 行 `:890-899`；dispatch +2 行 `:1642-1643`；allowlist `:1433`、migrate list `:2202` 各 1 行就地追加 target）· 零逻辑改动 |
| `receipts/gap-priv-external-sink-retention/2026-10-06-an-priv-ext-prove.md` | **A** · §1 PRE-DECLARE |

REQUEST..CODE 其余文件全部是 sibling 线 docs（AN-PERF-TEAR / AN-RAG-R3 / AN-MOP-Q45）+ 本方 PRE `fb6fca2` 与 e2e PRE `512cc5d`。  
`9e2abd0..4b06058` = 本线 receipt/ledger/logs/prove-json/harness §7 addendum（docs+evidence only）+ 2 个 rag-route review（他线）。  
**零** `principal.ts` / `checkpoint-principal.ts` / `privacy.controller.ts` / `privacy.service.ts` / 0091 / 0096 / 其他 migration / matrix / backlog / checklist 改动。packages/db/sql 不是 migration 镜像（仅 `01..25_*.sql`，0091 亦无镜像）→ 无需 sql mirror。

**CODE_SHA 预声明顺序**：§1 PRE-DECLARE 在 CODE commit `9e2abd0` 内（committer 时间 2026-10-06 20:26:42 CST）；ledger 首跑 A1 start 20:26:55 CST，晚于 commit。`git diff 9e2abd0 4b06058 -- receipt` 显示 §1 正文零改动，仅 header Status 行改写 + 追加 CODE_SHA 行 + 追加 §2–§5。（commit 不能含自身 SHA；"推送先于运行"无法由 git 独立验证，以 commit 时间序为准 —— 非阻断。）

## 2 · Migration 0137 逐行 — **PASS**（含 NB-1/NB-2）

| 行 | 内容 | 判定 |
|----|------|------|
| `0137:1-26` | 注释：动机（0091 guard 只要求 target=erased 且无 external_pending/failed_cleanup；外部 target 今日为 retention_pending 且**无** external_* receipt → 直改 erased 或直写 external_confirmed 即可 completed）；Ban 列表（不调外部 API、不改 0091 函数体、不把 retention_pending 改 erased、DELETE 仍 503、`:64` OPEN） | 诚实 |
| `0137:28-30` | `CREATE OR REPLACE FUNCTION assert_privacy_erasure_request_completed_guard()` · `SECURITY DEFINER` · `SET search_path = pg_catalog, public, pg_temp` | search_path 已固定 ✓ |
| `0137:32-44` | 与 `0091:530-543` **逐字一致**（去注释后 `diff` 仅多出 0137 新子句）：INSERT/UPDATE 双生效、零 target 拒、非 erased target 拒、external_pending/failed_cleanup 拒，均 `55000` | 0091 守卫完整保留 ✓ |
| `0137:45-55` | **新子句**：对 `sink IN ('oss','redis','langfuse')` 的每个 target，若不存在 `receipt_kind='external_confirmed' AND resolved_at IS NOT NULL AND resolved_by IS NOT NULL` 的 receipt → `RAISE 'privacy_erasure_request_external_unconfirmed' ERRCODE '55000'` | 纯 fail-closed（只会多拒 completed）✓ |
| `0137:61-63` | `GRANT CREATE ON SCHEMA public TO privacy_guard_owner` → `ALTER FUNCTION … OWNER TO privacy_guard_owner` → `REVOKE CREATE …` | 与 `0091:549-551` 同；净零 GRANT 变化 ✓ |
| `0137:64` | `REVOKE ALL ON FUNCTION … FROM PUBLIC, app_role` | 不扩权 ✓ |
| `0137:65-68` | `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER … BEFORE INSERT OR UPDATE … FOR EACH ROW` | 同名同形重建，幂等 ✓ |

- 无 DROP 0091 约束/函数（`CREATE OR REPLACE` 同签名，超集）；无 DML、无数据破坏；已有 completed 行不受影响（守卫仅在 `OLD.status IS DISTINCT FROM 'completed'` 时触发）；forward-only、可重放。
- 其他 migration 是否曾重定义该函数：`rg` 仅 0091 / 0137（0107:37 只是注释）→ 0137 未覆盖任何后续增量。
- `resolved_at/resolved_by` 唯一写入点 = `privacy_resolve_deletion_receipt`（`0091:491-493`），全仓 migration 无其他写入。
- **谁能确认**：`privacy_resolve_deletion_receipt`（`0091:460-514`）`REVOKE … FROM PUBLIC, app_role`（`:513`）、`GRANT EXECUTE … TO privacy_worker_executor`（`:514`），owner `privacy_worker_owner`（NOLOGIN）。需要 `app.principal_user` = 请求 owner（`:476-483`，否则 42501）、该 target 上已有 `external_pending` receipt（`:486-490`，否则 40901）、`p_recorded_by` 非空（`:472-475`，否则 22023）；写 `resolved_at=now()`、`resolved_by`。**app_role 不能自确认** → 非阻断。
- **NB-1（confirm 是可审计的 attestation，不是 vendor 证据）**：resolve 不校验任何外部 vendor 回执（除 pending 时的 `receipt_hash` 与 `recorded_by` 文本外无证据字段）；持有 `privacy_worker_executor` 的 worker 可对任意自有 pending receipt 宣称确认。今日无 confirmer、无 product 代码对外部 target 写 external_pending，故不构成可达 count-as-erased；但**任何未来 flip `:64` 的线必须给 resolve 加 vendor 证据（receipt id/哈希来源）并独立审**。
- **NB-2**：`privacy_api_owner` / `privacy_worker_owner` 对 `privacy_deletion_receipt` 有表级 `INSERT, UPDATE`（`0091:114-115`，均 NOLOGIN、仅经 definer 函数可达）；0137 未加列级/trigger 约束把 `resolved_at` 写入钉死在 resolve 函数。当前无 definer 函数越权写，非阻断；建议后续加 receipt 单向 trigger。

## 3 · Honesty — **PASS**（含 NB-3）

- 无任何文件声称外部 sink 已 erased/purged；无真实 purge job；0137 不调用外部、不改 retention_pending 默认（`0096:207-213`、`0058:217-223`、`uc052-internal-erasure.ts:71-85` 未动）。
- receipt `:7` `:53` `:116-118`：canHonestlyFlip=false · `:64` OPEN · coveredCount=8 · DELETE=503 · "EXIT0 ≠ external sinks purged … Langfuse ≠ vendor wipe（N1）· retention_pending ≠ external_pending receipt（N2）"。proof JSON `gapStatus:"OPEN", canHonestlyFlip:false, externals:"retention_pending", countAsErased:false`（`proof.ts:332-346`）。
- `controlPlaneClosed`：本线 receipt/harness/proof/0137 中**零**出现。
- **NB-3（措辞）**：`0137:17-20` 与 receipt `:32/:43/:97` 把"经 resolve 的 external_confirmed"表述为外部 sink 计入 completed 的"唯一凭据"、并称"直写 ≠ external purge evidence"，易被读成"resolve 后 = purge 证据"。实际 resolve 后的 external_confirmed 只是 DB 内可审计 attestation（见 NB-1），**≠ vendor 数据已删除**。非阻断（当前 flip=false、gap OPEN），nail 时请在 SSOT 显式写明。

## 4 · Proof quality — **PASS**

`packages/db/test/uc052-external-sink-retention.proof.ts`：真实隔离 PG（`assertIsolatedTestTarget` `:171`）、dirty worktree 拒跑（`:172-176`）、REQUIRED_CASES `:31-42`。NEG 伪造在 admin txn 内 `UPDATE privacy_deletion_target SET status='erased'` 后**总是 ROLLBACK**（`:139-151`），completed 尝试走真实 SQL UPDATE 或 product settler `reassessRequestStatus`（`uc052-internal-erasure.ts:127-142`，CASE `ELSE 'completed'`）—— 命中 DB trigger，**无 app 侧 mock**。

| Case | file:line | 断言 |
|------|-----------|------|
| EXT-RP-01 | `:180-193` | locals erased · 三外部 target `retention_pending` · 外部无 external_pending/confirmed receipt · req=`pending_external` |
| EXT-NEG-01 | `:195-205` | 不伪造，直接 UPDATE completed → **55000** `incomplete_targets` · req 不变 |
| EXT-NEG-02 | `:207-218` | 伪造外部 erased、零确认 → UPDATE completed → **55000** · in-txn≠completed · 回滚后仍 retention_pending |
| EXT-NEG-02B | `:220-229` | 同伪造，经 `reassessRequestStatus` → **55000** · ≠completed |
| EXT-NEG-03 | `:231-245` | 伪造 erased + 未解析 external_pending → **55000** `external_unresolved` |
| EXT-NEG-04 | `:247,250-256,262-266` | `privacy_record_deletion_receipt(external_confirmed)` 直写（resolved_at NULL）+ 伪造 erased → **55000** |
| EXT-NEG-05 | `:269-287` | 今日形态 resolve ×3 → **40901** `receipt_not_pending` · receipts 0→0 · 仍 retention_pending |
| EXT-NEG-06 | `:248,257-261` | 对直写 external_confirmed 调 resolve → **40901** |
| EXT-POS-01 | `:289-308` | external_pending → resolve → external_confirmed（resolved_at/by 已写）· target 仍 retention_pending · req 仍 pending_external |
| EXT-DEL-01 | `:310-326` | `PrivacyService.eraseInterviewData` 抛 503 `interview_erasure_authorization_not_available` |
| C-CASECOUNT | `:328-330` | 10 个 required 全跑，否则 FAIL |

- **NB-4**：NEG-02/02B/04 只钉 `55000`，未钉 message `external_unconfirmed`（A1 日志显示确为该 message，且 MUT 证明其来源是 0137）；建议后续加 message 正则。另缺"三外部全部 audited confirm + target erased → completed 被允许"的正向用例（证明守卫不过严）；R2 privacy-authorization F1 部分覆盖。非阻断。
- **MUT 证据**：`receipts/…/logs/MUT-1-scratch-minus-0137.log`：`:22` gitSha=`8a571cc1d7ab9dbca1f4851c70d101e0d85274dd`；`:25/:26/:29` FAIL EXT-NEG-02 / 02B / 04 `err=NO_ERROR inTxn=completed`；`:36` `✗ 3 assertion failures`；`:37` `ELIFECYCLE Command failed with exit code 1`；`:41` `END 2026-10-06 20:29:11 CST EXIT=1`。本地对象库可见 `8a571cc`（commit），`git diff 9e2abd0 8a571cc` = 仅删除 0137（−68）；`git branch -a --contains 8a571cc` 为空 → **从未推送**。非 vacuous ✓。（runner ENOENT 0137 为次生，已披露。）
- **Implementer 日志 PROCESS EXIT**：A1 `:38 EXIT=0`（gitSha 9e2abd0 `:22`）· http `:20 EXIT=0`（19/0）· internal-erasure `:39 EXIT=0` · privacy-authorization `:76 EXIT=0` · checkpoint-physical `:44 EXIT=0` · remaining-sinks `:56 EXIT=0` · MUT `:41 EXIT=1`。`attempt-ledger.tsv`：每 CMD 恰 1 行，时间连续不重叠，无 retry/丢弃。✓

## 5 · Fresh spot-check @ CODE `9e2abd0` — **PASS**

临时 detached worktree `/workspace/wt-privext-code`（`git worktree add --detach … 9e2abd04…`），porcelain 干净；`pnpm install --frozen-lockfile --offline` → `INSTALL_EXIT=0`。各跑 **1 次**，无 retry：

(a) `sg docker -c 'env -u MODEL_API_KEY pnpm uc052:external-sink-retention:prove'; echo EXIT=$?`
```
START 2026-10-06 20:34:36 CST SHA=9e2abd04083eca464817e35687595c706cbcd2a9
UC052_EXTERNAL_SINK_RETENTION_PROVE gitSha=9e2abd04083eca464817e35687595c706cbcd2a9 line=AN-PRIV-EXT live=false modelKey=not_loaded
PASS  EXT-RP-01 · req=pending_external localsErased=true externalsRp=true externalReceiptKinds=[] (N2: retention_pending target ≠ external_pending receipt)
PASS  EXT-NEG-01 · err=55000:privacy_erasure_request_incomplete_targets req=pending_external
PASS  EXT-NEG-02 · err=55000:privacy_erasure_request_external_unconfirmed inTxn=pending_external after=pending_external forgeRolledBack=true
PASS  EXT-NEG-02B · err=55000:privacy_erasure_request_external_unconfirmed inTxn=pending_external after=pending_external
PASS  EXT-NEG-03 · err=55000:privacy_erasure_request_external_unresolved inTxn=pending_external after=pending_external
PASS  EXT-NEG-06 · resolveErr=40901:privacy_authorization_receipt_not_pending
PASS  EXT-NEG-04 · directExternalConfirmed(resolved_at=NULL)=true err=55000:privacy_erasure_request_external_unconfirmed inTxn=pending_external after=pending_external
PASS  EXT-NEG-05 · errs=[40901,40901,40901] receipts=0->0 req=pending_external externalsRp=true
PASS  EXT-POS-01 · mid=pending_external resolvedKind=external_confirmed audited=true resolveReq=pending_external req=pending_external externalsStillRp=true (no confirmer flips target → ≠ completed)
PASS  EXT-DEL-01 · httpStatus=503 code=interview_erasure_authorization_not_available
PASS  C-CASECOUNT · all 10 present
✓ UC052 external sink retention prove PASS (≠ external purged · ≠ completed · ≠ covered · gap OPEN)
EXIT=0
END 2026-10-06 20:34:49 CST
```
runner 本地收据 `outcome=passed exitCode=0 releaseEvidence=false`。

(b) `sg docker -c 'env -u MODEL_API_KEY pnpm privacy-erasure:http:prove'; echo EXIT=$?`
```
START 2026-10-06 20:34:58 CST SHA=9e2abd04083eca464817e35687595c706cbcd2a9
migrations: applied=137 skipped=0 …
ISOLATED_PROOF_SUMMARY target=privacy-erasure:http:prove:raw exit=0 pass_count=19 fail_count=0 failure_class=none
EXIT=0
END 2026-10-06 20:35:41 CST
```
runner 收据 `schemaMigrationManifest count=137 latest=0137_privacy_external_sink_confirmation_guard.sql` · `releaseEvidence=false`。

## 6 · DELETE=503 — **PASS**

源码 @CODE：`apps/api/src/modules/privacy/privacy.controller.ts:50-53`（`@Delete('interview-data/:id')` + `@HttpCode(HttpStatus.SERVICE_UNAVAILABLE)`）；`apps/api/src/modules/privacy/privacy.service.ts:53-56`（`:56` `throw new HttpException({ error: 'interview_erasure_authorization_not_available' }, 503)`）。REQUEST..tip 零改动。HTTP 断言 `apps/api/test/privacy-erasure-http.proof.ts:72-81`（DELETE 503 + replay 503）、`:91-101`（JWS 不能打开 DELETE）；§5(b) 19/0 EXIT=0。proof EXT-DEL-01 亦 503。

## 7 · Gap / pins — **PASS**

`gap-bug-backlog.md:64` GAP-PRIV-EXTERNAL-SINK-RETENTION 行 REQUEST..`4b06058` 零改动（`eae1e19` 仅改 GAP-MOP-03 行与 MOP 段落）；无 covered/fixed/closed。coveredCount=8 · UC-052 **partial**（matrix `:132`）· NOT_HA · releaseEvidence=false · PG-retained · `GAP-PRIV-AUTHZ-PROVE-FLAKE`（backlog `:68`）**OPEN** mitigated/cause-unknown（R2 本轮 EXIT0 不改变该状态）。

## 8 · PERF-TEAR 行号偏移 — **非阻断 OPEN**

`run-e2e-isolated.mjs` numstat 为 **+14/−2**，但**净位移**是分段的：旧 `≥890` 行 **+10**，旧 `≥1631` 行 **+12**（`:1433`、`:2202` 为就地改行，不增行）。PERF-TEAR harness `:49` 引用的 `run-e2e-isolated.mjs:1714`（`const container = …`）@CODE 实际在 **`:1726`**（+12），`:2239-2241` → `:2251-2253`（+12）—— "off by 14" 的披露应为 **+12**，交 PERF-TEAR rewrite 修正。本线 privacy cites（controller/service/0091/0096/0058/uc052-internal-erasure.ts）均不在该文件，**未破坏任何 privacy cite**。

## 9 · 边界

PASS ≠ nail ≠ 关闭 `:64` ≠ 外部 purge ≠ HA。alone ≠ dual。**不代签 mw-e2e-ha**（e2e PRE `512cc5d` 仅引用）。Nail 须 POST BOTH + 协调方 AUTHORIZE。

## Blockers

无。

## Non-blocking

NB-1 resolve 无 vendor 证据（attestation ≠ proof，未来 flip 前必须补）· NB-2 receipt 表 resolved_* 列无 trigger 钉死 · NB-3 "唯一凭据/purge evidence" 措辞需在 nail 时澄清 · NB-4 NEG-02/02B/04 未钉 message、缺 all-confirmed 正向用例 · §1 "push 先于 run" 仅能以 commit 时间序佐证 · PERF-TEAR 偏移应为 +12 非 +14。

**本审查跑了 2 条 prove 各一次（EXIT=0 / EXIT=0），不授权 nail，不关闭 `GAP-PRIV-EXTERNAL-SINK-RETENTION`，不是 HA，不代签 mw-e2e-ha。**

Verdict: PASS
