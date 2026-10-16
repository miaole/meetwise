# Harness — **GAP-RAG-02 fixture 刀**（rag03-route §⑦ 陈旧断言换夹具 · `:70` OPEN · REQUEST · **docs-only PENDING**）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 双 stub PENDING · Ban self-approve · alone ≠ dual · **Ban coding · Ban prove · Ban push**）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays local partial · capacityRepresentative=**false** · canHonestlyFlip=**false**
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`1c4588f9`** / full `1c4588f952b77e6173acfadf7f3351c311b0cff0`（G7 Path B honesty nail · AQ nail `531282c5` 在 ancestry）
**Queue**: Phase 4 RAG（`REMAINING-NORTH-STAR-QUEUE.md:34-35`「GAP-RAG-02 fixture」）
**Knife**: **GAP-RAG-02 fixture 刀** —— rag03-route `:prove` §⑦ 唯一红断言按 backlog `:70` 原文「现有 `rag03-route:prove` 须换夹具或标红（R5）」处理；**独立开刀 · Ban wash rag03-route EXIT1**（AQ `531282c5` 钉：EXIT1 是 GAP-RAG-02 的根因面，不洗入他刀）
**Gap id**: **`GAP-RAG-02`**（backlog `gap-bug-backlog.md:70` · P0 · **OPEN** · 本刀不翻行 · fixture residual 是其剩余面之一）
**Experts**: `mw-rag-route` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: docs REQUEST only · Ban coding · Ban prove · pre-exec dual PASS 后由协调方授权 coding

## 0. Why this knife（root cause · frozen evidence · cite Ban re-prove）

R-b 事实（filter-locus 收据已披露）：`rag03-route:prove` EXIT **1** = pre-existing **same single assertion** red @ base `70cba94` · @C-3 `264e1d7` · @CODE `ac03f30` · **delta 0**（`receipts/gap-rag-03-r3-filter-locus/2026-10-06-an-rag-r3-prove.md:43` · `attempt-ledger.txt` `red=[未决岗位,]`）→ tracked as GAP-RAG-02 `:70`。

根因（产品契约演进 vs 夹具未随，独立开刀的依据）：

| 锚 | 事实 |
|----|------|
| 产品契约 | `db0d513f` / `db0d513fa603b541986749b5a79f4569f3c3699d`（2026-09-17 · R2 P-START 真拒启 backfill）在 `packages/db/src/recruiter.ts` `startApplicationInterview` 落 **fail-closed** 门：无 `application_route_binding` → 返回 `{status:'interview_ineligible_route'}` · **不创建 interview · 不落 snapshot**（源注：「未决路径绝不返回 started」· `unresolved_route_start_count=0`） |
| 陈旧夹具 | `packages/db/test/job-route-decision.proof.ts:238` 仍断言**旧**优雅降级契约「未决岗位 start 不抛、返回 started，但 interview snapshot 行 = 0」→ fail-closed 下 `pendingIv === undefined` → 恒红 → EXIT1 |
| 归属 | 该红断言与 HNSW/`:71` 无关（收据明示 does not touch `qbank_generation_ann_search`/`hybridQbankSearch`）；AQ `531282c5` 明言 **Ban wash rag03-route EXIT1（=GAP-RAG-02）** → GAP-RAG-02 是 rag03-route EXIT1 的根因面，须独立开刀 |
| 产品契约权威 | P-START 真拒启已 dual-passed（backlog `:70`「P-START 真拒启（dual-passed）」· R2 structural CLOSED 组成）→ **Ban 改产品码迁就旧夹具**；修复方向 = 夹具对齐现行契约（换夹具）或诚实标红（R5 惯例） |

## 1. Residual statement（frozen · disclosed）

| Residual | Status | Note |
|----------|--------|------|
| R-b `rag03-route:prove` EXIT1 | **OPEN as GAP-RAG-02 `:70`** | 根因 = §⑦ `:238` 陈旧断言（`db0d513f` 契约演进未随夹具）· **Ban wash** |
| 历史 EXIT1 cites | **保留不改写** | `70cba94` / `264e1d7` / `ac03f30` delta 0 是 R-b 记账基线 |
| GAP-RAG-02 backlog 行 | **OPEN** | R2 structural CLOSED **≠** HA/suite/verbal/controlPlane/R4/FUNNEL closed · P-LIVE ≠ 路由已生效 |
| GAP-RAG-03 `:71` | **OPEN**（AQ `531282c5` 钉） | 本刀 **Ban 触 HNSW 语义** · Ban close · Ban wash |

## 2. Scope（触碰 file 清单 · future coding knife 按 CC-F1..F8 授权后执行）

### 2.1 Touch（唯一允许面）

| File | 允许触碰 |
|------|----------|
| `packages/db/test/job-route-decision.proof.ts` **§⑦（`:230-241` 区段）换夹具** | `:238` 旧断言「未决岗位 start …返回 started…（优雅降级）」替换为**现行 fail-closed 契约**断言：start 返回 `{status:'interview_ineligible_route'}`（无 interviewId）· 未创建 interview 行 · `interview_route_snapshot` 行 = 0 · `job_application` 不进 `in_progress`；`:240-241` 探测面随 §⑦ **最小联动**（无 interview id 时以 application/interview 行数显式探测；Ban 捏造 interviewId）；`:234`（binding 行 = 0）与其余 §⑦ 语义保留；文件头 honesty note **additive** 一行（P-FAKE / ≠ R2 closed / ≠ 路由已生效 既有口径不动） |

### 2.2 Ban touch

| 面 | 禁止 |
|----|------|
| `packages/db/src/**`（含 `recruiter.ts`） | 产品契约已 dual-passed · **Ban 改产品语义迁就旧夹具** |
| `packages/db/migrations/**`（含 `0138`/`0139` HNSW 面） | **Ban 借刀碰 HNSW/:71 面**（AQ 已钉） |
| `packages/db/test/rag03-filter-locus.proof.ts` · `rag03-hnsw-completeness.proof.ts` | `:71` 面 · 一字不动 |
| `job-route-decision.proof.ts` §①-⑥/⑧-⑪ 全部既有断言（含 `:234`） | R-b delta-0 证据基线 + R2 structural 证据 · **byte-intact** |
| `scripts/run-e2e-isolated.mjs` · root `package.json` CMD 注册 | CMD 名不改 |
| AO COND / MOP / A-seed / CIMG / AP ISO-banner / AR | 不开不触 |
| backlog `:70`/`:71`/checklist/matrix/queue | 本 REQUEST 期不触；**SSOT 仅 nail 期 additive**（§5） |

## 3. Prove 方案（future coding knife · 本 REQUEST 零执行）

| CMD | 期望 EXIT | 说明 |
|-----|-----------|------|
| `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-route:prove` | **0**（换夹具后） | Primary · isolated 真隔离 PG + 全迁移链 · image `pgvector/pgvector:pg16` 口径不变 · 新断言名须明写 fail-closed 语义，**Ban 复用旧文案** |
| `pnpm rag03-filter-locus:prove` | 0 | 邻接复核 · 既有断言不动 · Ban wash 边界 |
| `pnpm rag03-hnsw-completeness:prove` | 0 | 邻接复核 · **Ban 触其断言** · 仅确认未被他线波及 |

**诚实失败路径**（EXIT 契约）：

- 修后 `rag03-route:prove` 仍 EXIT1 或出现**新红名** → **EXIT1 保留** · 红名/容器/image/digest/起止时间全录 `attempt-ledger.txt`（沿用 `receipts/gap-rag-03-r3-filter-locus/attempt-ledger.txt` 格式）· attempts 全记录 · **Ban retry-to-green**（Ban 改断言凑绿 · Ban 删/跳过失败段 · Ban 弱化其余断言）。
- 换夹具做不出（pre-exec 双审否决或 prove 无法诚实绿）→ 退回 backlog 原文「标红」路径（`harness/r5-pgvector-fixture-mark-red.md` marked-red 家族惯例：marked-red ≠ deleted · 文件头 NOTE + backlog 披露 · EXIT1 保持披露）。

**EXIT0 ≠**：换夹具后 EXIT0 仅证 §⑦ 夹具与现行 R2 P-START fail-closed 契约一致；**≠ GAP-RAG-02 整行 CLOSED**（R2 仍 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL · P-LIVE ≠ 路由已生效 / verbal 生效）· **≠ GAP-RAG-03 `:71` close** · **≠ covered flip（coveredCount=8）** · **≠ HA** · **EXIT0 ≠ covered ≠ 翻行**。

## 4. Closing criteria checklist（future coding+prove knife · Ban claim now）

| # | Closing criterion | Required evidence class | Ban |
|---|-------------------|-------------------------|-----|
| **CC-F1** | §⑦ 换夹具仅触 `:238`（+`:240-241` 最小联动 + 文件头 additive note）· 其余断言 **byte-intact**（diff 面审计） | CODE diff + receipt | Ban 改其他断言 · Ban 复用旧语义文案 |
| **CC-F2** | 新断言锚**现行契约**：`interview_ineligible_route` · 不建 interview · snapshot 0 行 · application 不进 `in_progress` | proof source + EXIT0 receipt | Ban 断言旧「started + 0 snapshot」语义 |
| **CC-F3** | 产品码零触碰：`git diff <base>..<CODE> -- packages/db/src packages/db/migrations scripts apps` = **空** | CODE diff 审计 | Ban 改 `recruiter.ts`/迁移/runner |
| **CC-F4** | Primary CMD EXIT 0 + 邻接两 CMD EXIT 0 · 若有红名 ledger 全录 | receipt + `attempt-ledger.txt` | Ban retry-to-green · Ban 只报绿不录红 |
| **CC-F5** | R-b 记账诚实更新（**nail 期 additive**）：EXIT0 @ 新 CODE · 历史 EXIT1 cites `70cba94`/`264e1d7`/`ac03f30` 不改写 | SSOT additive diff | Ban 改写历史 cites · Ban wash |
| **CC-F6** | **零 live**：fake seam（`mkSeam` 注入）· `env -u MODEL_API_KEY -u MODEL_BASE_URL` · embedding/模型桩只走 fixture | receipt env/命令记录 | Ban 真实模型/embedding 调用 · Ban live |
| **CC-F7** | **PG-retained 口径不变**：真隔离 PG + 全迁移链 · `pgvector/pgvector:pg16` 口径 | receipt image/env | Ban MySQL FULLTEXT · Ban Qdrant vector truth |
| **CC-F8** | **Pins unchanged** unless separately authorized | NOT_HA · releaseEvidence=false · claimProductionHA=false · PG-retained · DELETE=503 | Ban claim HA / claimProductionHA / SLO / covered |

**Non-closing facts（explicit）**：EXIT0 ≠ gap close ≠ covered ≠ HA ≠ R2 整行 closed；历史 EXIT1 收据（filter-locus / AQ HNSW CC-H5）**不被本刀改写**；alone ≠ dual · PASS ≠ 关 gap ≠ HA。

## 5. SSOT touch policy（本 knife）

| File | Allowed touch | Ban |
|------|---------------|-----|
| `gap-bug-backlog.md:70` | **仅 nail 期 additive**：换夹具收据 cite + R-b 记账更新（CC-F5） | 本 REQUEST 期不改 · Ban CLOSED · Ban 翻行 |
| `gap-bug-backlog.md:71` | **不触** | Ban close · Ban wash GAP-RAG-02 语义改写 |
| `execution-master-checklist.md:1056` | 仅 nail 期 additive R-b 更新 | Ban 改写既有 EXIT 表 |
| `e2e-requirement-coverage-matrix.md` | 不触（coveredCount=**8** 不变） | Ban covered flip · Ban invent covered |
| `REMAINING-NORTH-STAR-QUEUE.md` | 仅 nail 期 additive（Phase 4 进度） | Ban wash |
| AO COND / MOP / A-seed / CIMG / AP ISO-banner | **Do not touch** | Ban |

## 6. Verification contract（this REQUEST · zero prove）

1. Docs-only：本 REQUEST 4 文件（harness + slice + 双 stub）additive under `ai-docs/delivery/` · 无 product/scripts/packages/apps touch。
2. Dual PRE stubs `draft:awaiting_pre_exec_dual` · Verdict PENDING · Ban self-approve · alone ≠ dual。
3. No `pnpm` prove · no docker · no matrix run（零执行）。
4. pre-exec dual PASS 后由协调方授权 coding；coding+prove 后须收据 + POST dual + coordinator AUTHORIZE（nail 期才碰 SSOT，CC-F5）。

## 7. Ban list

- Ban coding · Ban prove · Ban push · Ban product/scripts/packages/apps
- **Ban wash rag03-route EXIT1（=GAP-RAG-02）** · Ban retry-to-green · Ban 改断言凑绿 / 删断言 / 跳过失败段
- **Ban 借刀碰 HNSW/:71 面**（`0138`/`0139` 迁移 · rag03-filter-locus / rag03-hnsw-completeness 断言）· Ban close `:71`
- Ban 改 `recruiter.ts` 产品契约迁就旧夹具 · Ban 改 §①-⑥/⑧-⑪ 既有断言（R-b delta-0 基线）
- Ban MySQL FULLTEXT · Ban Qdrant vector truth · Ban live / 真模型 / 真 embedding 外发（embedding/模型桩只走 fixture）
- Ban covered flip · Ban invent covered · Ban claim HA / claimProductionHA · Ban 翻行（EXIT0 ≠ covered ≠ 翻行）
- Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban G7 wash · Ban AN-CIMG-EA · HOLD AN-CIMG-EA
- Ban self-approve（alone ≠ dual）· Ban self-nail · Ban open MOP / A-seed / CIMG / AP ISO-banner · Ban 触 AO COND line files
- **SSOT 仅 nail 期 additive**（backlog/checklist/matrix/queue 本 REQUEST 期零触碰）

## 8. Non-claims

Not a pass · not run · not fixed · not closed · not covered · not HA · not SLO/LOAD · not capacity · not `releaseEvidence=true` · not nail · GAP-RAG-02 `:70` **OPEN**（fixture residual 只是其一 · R2 仍 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL）· GAP-RAG-03 `:71` **OPEN** · alone ≠ dual · 换夹具绿 ≠ 路由已生效 ≠ verbal 生效（P-LIVE ≠ · proof 头既有口径不变）

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false · backlog `:70` GAP-RAG-02 **OPEN** · backlog `:71` GAP-RAG-03 **OPEN** · R-b EXIT1 disclosed NOT green · STOP

*Harness · GAP-RAG-02 fixture fix · 2026-10-07 · draft:awaiting_pre_exec_dual · `:70`/`:71` OPEN · docs-only REQUEST · Ban coding · Ban prove · Ban wash EXIT1 · Ban touch HNSW/:71 · STOP*
