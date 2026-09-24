# REQUEST — **UC-E2E-050–052 privacy erasure · GAP-PRIV-ERASURE-CLOSURE** · pre-exec · mw-privacy-int

**Status**: **FAIL（pre-exec · 3 blockers · docs 方向可取 · 修完即可复审）**  
**Line**: **B**  
**Expert**: `mw-privacy-int`（独立 · 不代签 peer · alone ≠ dual）  
**Pair**: `REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-e2e-ha.md`（peer 已 PASS；本域结论独立，不因 peer PASS 放行）  
**Knife**: `harness/uc-e2e-050-052-privacy-erasure.md` · slice `uc-e2e-050-052-privacy-erasure.slice.md`  
**Reviewed tip**: REQUEST `cd5a4de`（working HEAD at run: `dc3e17a`，仅新增 Line A / peer receipt，Line B 文档未变）  
**Date**: 2026-09-23 (~20:20 PT)

## Pins（retained · not flipped）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · PG-retained · public DELETE **503** · Line A 未引用。  
FAIL ≠ 否定方向；任何结论 ≠ coding 授权 ≠ UC covered ≠ DELETE 开放。

## 复跑证据（本机 · 隔离 PG · local_untrusted）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm privacy-erasure:http:prove` | **0** | `pass_count=19 fail_count=0`；公开 DELETE 仍 503（pin 仍在 ≠ 删除闭环） |
| `pnpm privacy-authorization:prove` | **1** | `privacy_authorization_target_drift`（`privacy_authorization_claim_target` line 74 RAISE）于 `privacy-authorization.proof.ts` lease-takeover 段（约 L460–466：digest/JWS 按 `T()`=3 sinks 签，live target 只插 1 行 `checkpoint_rows`） |

## 逐项结论

### 1. 授权根 / 公开 DELETE
- 方向正确：以 0091 issuer（ES256 · `iss=meetwise-privacy-authz-v1`）+ snapshot/lease 为破坏性根，明确 `app.principal_user` 非根；公开 DELETE 保持 503（复跑 EXIT=0 佐证）。
- **但授权根的基线 prove 在本分支是红的**（见 B1）。harness §1.4 把 `privacy-authorization:prove` 列为 "real isolated proves" 而未标红 → 首刀建在未证实的根上。

### 2. 在范围 PG sink 清单
- interview-track 六类（`checkpoint_rows` / `interview_job_payload` / `event` / `report` / `ai_graph_run` / `interview_answer_artifact`）与 0092/0096 sink CHECK 枚举一致，有 resolver；OSS/Redis/Langfuse/backups/`user_memory`/`trace.output`/INT `vector` 均列为 gap，未见标成 done。✔
- **隐患**：0096 `privacy_begin_checkpoint_erasure` 在同一 request 内同时种 `oss`/`redis`/`langfuse` target；0091 completion guard 要求全部 target `erased` 才能 `completed`。harness 未钉死"只擦在范围 sink ⇒ request 终态必须停在 `pending_external`"（见 B2）。

### 3. per-sink 回执 / canonical ledger
- 计划写 `privacy_deletion_target` + `privacy_deletion_receipt`，方向对；但 `receipt_kind=local_erased` + `deleted_count` 是**自报**，不等于 DB 级删除。须由 prove 独立 SELECT 各 sink 数据表 read=0（C3）。
- canonical：`target_set_digest` 覆盖 (sink, resource_hmac) 全集（含外部 sink）。首刀**不得**通过裁剪 target 集/digest 来"缩范围"——范围收窄只能在 purge 层（外部 target 留 `retention_pending`）（并入 B2）。

### 4. NHP
- FAULT-01 / FAULT-02 / NEG-02 / NEG-03 / BOUND-01 / NEG-01 + happy 最后：骨架够。缺：**fence/复活**（0058/0059 写 guard：purge 后 worker 回写必须被拒，read 仍 0）与 **epoch/digest 漂移**（C4）；NEG-03 用 HTTP 401/403/404 表述不适配内部路径（C5）。

### 5. 真 PG
- 文档明确 PG(+pgvector+PostgresSaver) only、禁 MemorySaver/MySQL/Qdrant。✔ 旁注见 N1。

## Blockers（修完才可复审 PASS）

- **B1 授权根基线红**：本分支 `pnpm privacy-authorization:prove` EXIT=1（target_drift，与 main@c424447 修复前同一 lease fixture 问题；PR #104 的 fixture 修复不在此分支）。须把该 fixture 修复带到 Line B 基线并附 EXIT=0 回执；harness §1.4/§1.6 在此之前标 **red**，不得写成 real green。
- **B2 request 终态与 target 集未钉**：harness 须写明 ① 首刀 happy 的 request 终态 = `pending_external`（**禁 `completed`**），② `oss`/`redis`/`langfuse` target 只能 `retention_pending`，禁写 `local_erased`/`external_confirmed`，③ `target_set_digest`/JWS 覆盖完整 canonical 集，禁为缩范围裁剪 target。HP-050-01 与 FAULT-01 的期望须据此改写，并断言 request status。
- **B3 prove 命名撞车（假绿通道）**：计划 `pnpm privacy:erasure:prove` 与既有 `pnpm privacy-erasure:prove`（worker checkpoint）仅一个 `:`/`-` 之差，易把旧绿当新绿引用。须改名为可区分的名字（如 `privacy-erasure:internal-authorized:prove`），并在 harness 注明两者不可互引。

## Conditions（编码期必须满足 · 非本次阻塞）

- **C1** 不新增任何 HTTP 路由（含 internal/admin）；调用口为 worker/专用 DB 角色；**不得**把 `privacy_begin_checkpoint_erasure` 重新 GRANT 给 `app_role`（0075 REVOKE 保持）。
- **C2** consume 前应用层必须 JWS 验签（0091 issue fn 自身不验签）；NEG-02 子例：伪签、过期、已 consume 重放、digest 漂移、仅 GUC 无 snapshot。
- **C3** DB 级 read=0：prove 以 admin 连接逐 sink 数据表 SELECT count=0，不以 `deleted_count`/receipt 行代证；非目标 subject 数据计数不变。
- **C4** 增 NHP：fence 复活（purge 后回写被 0058/0059 guard 拒）；privacy_epoch 中途变更。
- **C5** NEG-03 改为 DB/claim 层表述：A 的 snapshot 无法 claim B 的 target，B 各 sink 计数不变。
- **C6** BOUND-01 引用 0091 lease 语义（未过期不可抢、过期可接管、旧 token 不可写 receipt）。

## Non-blocking notes

- **N1** `scripts/run-e2e-isolated.mjs` 横幅仍写 "sole stack = MySQL+Qdrant+Redis"，与 `adr-postgres-retained.md` 矛盾；Line B 回执不得引用该句作为栈真相，建议另行修横幅（不在本刀）。
- **N2** MEM/CTX account-track 不在首刀；harness 已隐含，建议显式写"首刀仅 interview_data purpose"。

## 结论

**FAIL（pre-exec）**。方向（内部 issuer 授权、公开 DELETE 保持 503、PG only、gap 清单诚实）可取；B1–B3 修完后复审可转 PASS。本回执 ≠ coding 授权 ≠ UC-E2E-052 covered ≠ DELETE 开放 ≠ 0091 ledger 闭环。
