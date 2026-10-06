# POST-PROVE · Line AR · GAP-PRIV-EXTERNAL-SINK async purge · mw-privacy-int（privacy side）

主审：`mw-privacy-int`  
日期：2026-10-07（约 00:22 CST / UTC+8）  
PROVE tip：`a49d712e` / `a49d712edb8a3d4de168d11057eb368b3dbe4fd1`  
docs tip（mig 0139→0140 披露）：`30228501` / `30228501b1ebf780886cf2095cd8e4f975137196`  
CODE_SHA：`111df857` / `111df857277e8be2b65ce2b9828fc207c428ef72`（lineage `3f0a5ae9`→`933dff70`→`700bdae8`→`111df857`；rebase 后 mig **0140**，AQ 占 `0139_qbank_*`）  
REQUEST：`e2eac8ca` / `e2eac8ca8468fb031860c1a0e9604022657c41f3`  
本方 PRE：`6093626e` / `6093626e77a242f85f8c77269d0f3d49b8d8bb07` · peer PRE：`e473eac2` / `e473eac2bbbe831bea91af2e58228c8d5a678e7c`（**仅引用 · 不代签 peer POST**）  
Implementer receipt：`receipts/ar-gap-priv-external-sink-async-purge/2026-10-06-ar-async-purge-prove.md`  
无 privacy-int POST stub → **新建本文件**。  
**本审在临时 detached worktree 于 CODE `111df857` 各跑 1 次具名 CMD（见 §5）。未改产品 / scripts。未碰旧收据 / stash / 共享 checkout。未读 `.env*`。未碰 Meridian。零 OSS/Redis/Langfuse/云调用。Ban nail · Ban close `:64` · Ban self-approve · Ban claimProductionHA · Ban covered flip · Ban wash ada604a · Ban count-as-erased · Ban open DELETE · Ban invent erased/completed · Ban forge PROCESS_EXIT / retry-to-green。**  
**PASS ≠ nail ≠ 关闭 `:64` ≠ HA。** alone ≠ dual。

下文 harness = `harness/ar-gap-priv-external-sink-async-purge.md`，slice = `ar-gap-priv-external-sink-async-purge.slice.md`，mig = `packages/db/migrations/0140_privacy_external_vendor_purge_evidence.sql`。

---

## 1 · Scope — **PASS**

CODE lineage（本线产品）：

| SHA | Role |
|-----|------|
| `3f0a5ae9` | code：0140（当时 0139）N1–N3 证据表 + resolve 门 + confirmer + proof + scripts |
| `933dff70` | fix：evidence 表 ACL OWNER+INSERT/UPDATE（definer writer） |
| `700bdae8` | fix：confirmer 去掉 raw request DML（definer-only） |
| `111df857` | fix：N2 gate **移到** pending 检查**之后**（先 40901 not-pending，再 55000 vendor_unproven） |

本线核心文件：`0140_privacy_external_vendor_purge_evidence.sql` · `uc052-external-sink-async-purge.ts` · `uc052-external-sink-async-purge.proof.ts` · retention/authz proof 共适 · `package.json` / `packages/db/package.json` scripts · `run-e2e-isolated.mjs` receipt-sources。  
rebase 披露（`30228501`）：mig **0139→0140**（AQ 占 0139）；A5 日志 gitSha=`b0177922`（pre-rebase CODE tip）· 产品路径与 `111df857` 等价（mig 经 `sed 0139→0140` 哈希一致）。  
**零** `privacy.controller.ts` / `privacy.service.ts` 打开 DELETE · **零** matrix/backlog `:64` 翻 CLOSED · **零** coveredCount 扩 · **零** Meridian / `.env*`。

## 2 · Migration 0140 · N1–N3 — **PASS**

### N1 · 证据类钉死（`0140:26-45` · `:82-147`）
- 表 `privacy_external_purge_evidence`：`sink IN (oss,redis,langfuse)` · `environment_class` **仅** `local_isolated_stub`（CHECK）· class↔sink CHECK：
  - oss → `oss_delete_list_empty_local_stub`
  - redis → `redis_del_exists_empty_local_stub`
  - langfuse → `langfuse_retention_delete_replica_local_stub`
- `privacy_record_vendor_purge_evidence`：`verified_absent IS NOT TRUE` → `22023`；class mismatch → `22023`；GRANT 仅 `privacy_worker_executor` · REVOKE `app_role`。
- **stub ≠ cloud** · Ban buy cloud · Ban invent class。

### N2 · resolve 证据门（`0140:210-276` · vs `0091:460-514`）
- `CREATE OR REPLACE privacy_resolve_deletion_receipt`：保留 0091 主体 + **外部 sink** 要求 `verified_absent` 证据行，否则 `55000` `privacy_authorization_resolve_vendor_unproven`。
- `111df857` 重排：**先** pending 检查（`40901` `receipt_not_pending`）**再** vendor gate —— 对齐 AN-PRIV-EXT EXT-NEG-05/06 期望；AP-NEG-01 仍覆盖 pending+无证据。
- Ban wash 0137 attestation into wipe（NB-3）。

### N3 · 流（confirmer `uc052-external-sink-async-purge.ts:191-258` + `0140:149-204`）
- 顺序：**purge → evidence → external_pending → erase-with-evidence → resolve**。
- `privacy_apply_external_sink_erased_with_vendor_evidence`：无证据 → `55000` `privacy_external_erase_vendor_unproven`（Ban count-as-erased）。
- completed guard（`0140:278-333`）：0137 子句 + **vendor_unproven** 子句 `privacy_erasure_request_external_vendor_unproven`。

### Fail-closed / ACL
- RLS + OWNER `privacy_worker_owner` · guard SELECT · `app_role` 无 EXECUTE/表权。
- 部分失败 / timeout → `failed_cleanup` · ≠ completed（AP-NEG-04/05）。

## 3 · Honesty — **PASS**

| Gate | 核实 |
|------|------|
| `:64` OPEN · canHonestlyFlip=false | backlog `:64` 仍 **OPEN** · proof JSON `gapStatus:"OPEN", canHonestlyFlip:false` · harness/slice/checklist 未翻 CLOSED |
| cloudVendorDeleted=false · stub≠cloud | confirmer 硬编码 `cloudVendorDeleted: false` · AP-HONEST-01 / AP-PATH-01 |
| NB-3 | AP-NEG-02：attested confirm 无 vendor evidence → completed 拒；cite ada604a ≠ wash |
| Ban count-as-erased | erase 函数证据门 · NEG-03 |
| Ban open DELETE | controller `:51-52` + service `:56` 仍 503；AP-DEL-01 |
| Ban covered flip | coveredCount=8 · UC-052 **partial**（matrix `:132`） |
| NOT_HA · releaseEvidence=false · claimProductionHA=false | proof JSON + pins |
| Ban wash ada604a | harness/receipt/proof 明示 honesty ≠ wipe |

## 4 · Proof quality — **PASS**

`packages/db/test/uc052-external-sink-async-purge.proof.ts` REQUIRED 10 cases：AP-N1-CLASS · AP-PATH-01 · AP-NEG-01..05 · AP-N3-WIRE · AP-DEL-01 · AP-HONEST-01 · C-CASECOUNT。  
isolation `assertIsolatedTestTarget` · dirty worktree 拒跑。retention EXT-POS-01 共适：seed stub evidence 后方可 resolve（`:290-296`）· target 仍 `retention_pending` · ≠ completed。

**MUT（implementer）**：`MUT-1-minus-0139.log` @`7d7f1235` EXIT=1 —— receipt-sources ENOENT（缺 0139/现 0140）+ boot not ready；**链/启动负载**（非 AN 式 NEG 断言级 MUT）。披露：非 vacuous（无 mig 则 runner 不能绿），但弱于断言级；Ban loop · 本审未重跑 MUT（Ban retry-to-green 压力下以日志+静态 receipt-sources `:910` 钉 0140 为准）。

## 5 · Fresh spot-check @ CODE `111df857` — **PASS**

临时 worktree `/workspace/wt-ar-post-priv-code`（detached `111df857`），`pnpm install --frozen-lockfile --offline` INSTALL_EXIT=0，porcelain 干净。各 **1 次** · 无 retry · `sg docker` · `env -u MODEL_API_KEY`：

| CMD | EXIT | 要点 |
|-----|------|------|
| `pnpm uc052:external-sink-async-purge:prove` | **0** | gitSha=`111df857…` · 10/10 PASS · cloudDeleted=false · gap64Open=true · DELETE 503 |
| `pnpm privacy-erasure:http:prove` | **0** | 19/0 · DELETE=503 |
| `pnpm uc052:external-sink-retention:prove` | **0** | gitSha=`111df857…` · EXT-NEG-05/06=40901 · EXT-POS-01 stub evidence |
| `pnpm privacy-authorization:prove` | **0** | F1 resolve→completed 路径共适 |
| `pnpm uc052:internal-erasure:prove` | **0** | gitSha=`111df857…` · externals retention_pending · NEG-01 503 |

Implementer A5 @`b0177922`（pre-rebase）同结果族；本审独立复验钉 **post-rebase CODE**。

## 6 · DELETE=503 — **PASS**

源码 @CODE：`privacy.controller.ts:51-52` `@Delete` + `@HttpCode(SERVICE_UNAVAILABLE)`；`privacy.service.ts:56` throw 503 `interview_erasure_authorization_not_available`。REQUEST..CODE 零改 controller/service。HTTP 19/0 + AP-DEL-01 + EXT-DEL-01。

## 7 · Pins — **PASS**

| Pin | 值 |
|-----|-----|
| haStatus | NOT_HA |
| releaseEvidence | false |
| claimProductionHA | false |
| coveredCount | **8**（RAG-FUNNEL-02A..08 only） |
| Stack | PG-retained |
| public DELETE | **503** |
| UC-052 | **partial** · ≠ covered |
| backlog `:64` | **OPEN** · canHonestlyFlip=false |
| cloudVendorDeleted | **false** |
| stub | local_isolated_stub ≠ cloud |
| NB-3 | held |
| HOLD AN-CIMG-EA | held · Ban buy cloud |
| GAP-PRIV-AUTHZ-PROVE-FLAKE | 仍 OPEN mitigated（本刀未关） |
| peer mw-e2e-ha | PRE `e473eac2` **cited only** · **不代签** peer POST · alone ≠ dual |

## 8 · 边界

PASS ≠ nail ≠ 关闭 `:64` ≠ cloud vendor wipe ≠ HA。alone ≠ dual。**不代签 mw-e2e-ha POST**。Nail 须 POST BOTH + 协调方 AUTHORIZE。

## Blockers

无。

## Non-blocking

1. **NB-MUT**：implementer MUT EXIT=1 为 chain/boot（ENOENT receipt-sources + boot），非断言级「去 0140 后门失败」；后续若要强 MUT，可另刀在完整 migrate 后删函数体断言。  
2. **NB-receipt-footer**：implementer receipt 末行曾拼接 `111df857`+`b0177922` 后缀（笔误）；以 header `CODE_SHA: 111df857277e8be2…` 与本审 spot-check 为准。  
3. **NB-stub-scope**：本刀仅 `local_isolated_stub`；真实云 vendor API 证据仍须另刀 · `:64` 保持 OPEN。  
4. **NB-3 延续**：DB stub completed ≠ 生产 OSS/Redis/Langfuse 已删；Ban wash。  
5. Peer POST：不代签 · 不等待。

**本审查独立复验 5 条 prove 各一次（全 EXIT=0 @`111df857`），不授权 nail，不关闭 `GAP-PRIV-EXTERNAL-SINK-RETENTION`（`:64`），不是 HA，不代签 mw-e2e-ha。PASS ≠ nail ≠ close `:64` ≠ HA。alone ≠ dual。**

Verdict: PASS
