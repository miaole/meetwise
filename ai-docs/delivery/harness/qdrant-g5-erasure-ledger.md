# Harness — G5 Qdrant erasure ledger honesty（subject erase · countable receipt）

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **vector does NOT migrate to Qdrant** — continue **Postgres pgvector**.  
> Retained truth stack: **Postgres (+pgvector + PostgresSaver)**. Ban replace-pgvector / sole-Qdrant-vector cutover.  
> Prior status preserved below for history; **do not delete**. Further Qdrant-as-required-vector work on this artifact is **banned**.  
> MySQL relational cutover likewise superseded; **Redis wake** remains separately evaluable (not canceled).  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban implementing vector cutover from this pin · Dual PASS ≠ authorize coding.

**Prior status (historical)**: P15 Qdrant erasure sink honesty


**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ privacy covered**  
**硬句**：**recall=0 + countable receipt ≠ 0091 ledger**；**本绿 ≠ 已迁**；**禁止**把本 EXIT=0 写成公开 DELETE 200/202 / erasure complete / ledger 对齐。  
**平行**：`qdrant-erase-count-honesty.md`（count only）· `privacy-erasure-http-503-pin.md`（公开 DELETE 仍 503）· `r5-retirement-sole-stack-status.md` **G5** · GAP-PRIV-04
**下一刀**：`qdrant-g5-ledger-map.md`（**P16** schema/mapping + fail-closed PREREQ；mapping ≠ 0091 可写）

---

## 0. Inventory（既有 erase / privacy / qdrant-store 诚实钉）

| CMD / 产物 | 角色 | 与 G5 关系 |
|------------|------|-----------|
| `pnpm qdrant-store:skeleton:prove` | upsert→erase→recall=0 + receipt 形状 | 前置骨架；≠ ledger |
| `pnpm qdrant-store:erase-honesty:prove` | `deleted_count` ≠ `ids.length`；`batch_digest` | **count honesty mitigated**；≠ 0091 |
| `pnpm privacy-erasure:http:prove` | 公开 `DELETE /privacy/*` **503** 钉 | **产品 DELETE 仍 fail-closed**；≠ 开放删除 |
| `packages/qdrant-store/src/erasure.ts` | `erasePoints` + **`eraseSubjectPoints`** | 本切片实现面 |
| `privacy_deletion_receipt`（0091） | request_id/target_id/receipt_kind/receipt_hash/recorded_by | **仍 GAP** — 原型 receipt ≠ 对齐 |
| `pnpm qdrant-store:g5-ledger-map:prove` | **P16** schema/mapping + PREREQ | 下一刀；**≠** ledger 可写 / 关 G5 |
| `pnpm memory-vector-chunk-erasure:prove` | 关系库 `memory_vector_chunk` sink | 先例；Qdrant 路径未登记为 0091 sink |

---

## 1. 目标（诚实推进 G5 子切片 · P15）

证明：**某一 subject（`owner_user_id`）在 Qdrant 上的 memory 向量可被擦除**，并给出 **可计数 receipt**（`deleted_count` 经 pre/post retrieve），且 **post-erase ANN recall=0**；**跨 subject 不受影响**。

| 项 | 裁定 |
|----|------|
| CMD | `pnpm qdrant-store:g5-erasure:prove`（standalone；**不得**入 sole allowlist） |
| 实现 | `eraseSubjectPoints` / adapter `eraseSubjectMemoryVectors` |
| 产品 DELETE | **仍 503**（`interview_erasure_authorization_not_available` / resume migration）— **PREREQ 未解**；本绿 **不得**宣称 DELETE 成功 |
| 0091 ledger | **仍 GAP**（recall=0+receipt ≠ 0091） |

### PREREQ（诚实 · 禁假绿）

1. **Live Qdrant** `:6333` `/readyz` — 缺则 **EXIT=3**  
2. **产品公开 DELETE 路径未开放**（仍 503）→ **不得**伪造 200/202；ledger 接线 / 授权根 / 域 sink 进 0091 **仍 block 切流**  
3. pgvector 活路径（`retrieval-store` / `vectorstore:prove` / `E2E_PG_IMAGE`）**intact**

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm qdrant-store:g5-erasure:prove` | **0** | inventory 钉 + subject erase + deleted_count 诚实 + recall=0 + 跨 subject intact + **仍钉 G5≠0091** + DELETE 仍 503 源码钉 |
| （Qdrant down）同上 | **3** | PREREQ fail-closed |
| honesty 钉失败 | **1** | 文档/GAP/假闭环断言失败 |

```bash
docker compose -f docker/compose.mysql-local.yml up -d qdrant
# /readyz → 200
pnpm qdrant-store:g5-erasure:prove
```

---

## 3. Proven vs GAP（本切片）

| | 项 |
|--|-----|
| **Proven（本绿可达 · P15）** | Subject-scoped Qdrant erase：scroll by `owner_user_id`(+kind) → countable `deleted_count` + `subject_id` + `batch_digest`；post-erase memory ANN **recall=0**；他 subject intact；idempotent re-erase → `deleted_count=0`；公开 DELETE **源码仍 503**（不发明成功）；count-honesty 路径复用；`releaseEvidence=false` |
| **仍 GAP · G5** | **Qdrant erasure sink recall=0 + 逐 sink receipt 未对齐 0091 ledger**（`privacy_deletion_receipt` / request_id/target_id/receipt_kind/…）；授权根 / claim/lease；域 sink 登记进 `privacy_deletion_target.sink`；公开 DELETE 开放；切向量真相；**P16** mapping/PREREQ **≠** 关闭本 GAP |

**禁止宣称**：G5 关闭、privacy covered、DELETE 200/202、erasure complete、0091 ledger 对齐、cutover、HA、`releaseEvidence=true`。

---

## 4. 假闭环风险

| 风险 | 处置 |
|------|------|
| 本绿 = ledger 对齐 / 隐私 covered | **禁止** — status / prove 钉 **G5 仍 GAP（recall=0+receipt ≠ 0091）** |
| 假 DELETE 202 / 200 | **禁止** — 对照 `privacy.service` 503；HTTP prove 另轨 |
| `deleted_count` = 盲 ids.length | mitigated（复用 erase-honesty pre/post retrieve） |
| 只删 ids[0] / 丢 subject 集合 | mitigated（scroll 全量 + `batch_digest`） |
| 切 pgvector / 翻 isolation 默认 | **禁止** |

---

## 5. 审查

- **必须**：`mw-privacy-int`  
- **第二域**：`mw-rag-route` 或 `mw-e2e-ha`  
- 合入/切流权在协调/用户；**禁止自批** ledger 对齐 / DELETE 开放 / cutover  
- 结论落 `ai-docs/delivery/reviews/`
