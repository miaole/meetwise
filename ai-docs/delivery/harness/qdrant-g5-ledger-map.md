# Harness — G5 P16 Qdrant receipt → 0091 ledger schema/mapping（fail-closed PREREQ）

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **vector does NOT migrate to Qdrant** — continue **Postgres pgvector**.  
> Retained truth stack: **Postgres (+pgvector + PostgresSaver)**. Ban replace-pgvector / sole-Qdrant-vector cutover.  
> Prior status preserved below for history; **do not delete**. Further Qdrant-as-required-vector work on this artifact is **banned**.  
> MySQL relational cutover likewise superseded; **Redis wake** remains separately evaluable (not canceled).  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban implementing vector cutover from this pin · Dual PASS ≠ authorize coding.

**Prior status (historical)**: P16 Qdrant ledger map honesty


**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ privacy covered**  
**硬句**：**schema/mapping prove ≠ 0091 ledger 可写 / 对齐**；**P16 ≠ 关 G5**；**禁止**把本 EXIT=0 写成公开 DELETE 200/202 / erasure complete / ledger 对齐。  
**前驱**：`qdrant-g5-erasure-ledger.md`（**P15** subject erase + countable receipt + recall=0）  
**平行**：`privacy-erasure-http-503-pin.md`（公开 DELETE 仍 503）· `r5-retirement-sole-stack-status.md` **G5** · GAP-PRIV-04

---

## 0. Inventory

| CMD / 产物 | 角色 | 与 G5 关系 |
|------------|------|-----------|
| `pnpm qdrant-store:g5-erasure:prove` | **P15** subject erase + recall=0 + countable receipt | 前驱；**≠** 0091 |
| `packages/qdrant-store/src/ledger-receipt-map.ts` | P15→0091 field map + PREREQ list | **本切片** |
| `pnpm qdrant-store:g5-ledger-map:prove` | schema/mapping + fail-closed PREREQ | **本切片 CMD** |
| `privacy_deletion_receipt`（0091） | request_id/target_id/receipt_kind/receipt_hash/recorded_by | **仍不可写**（Qdrant 路径） |
| `0125` sink CHECK | `memory_vector_chunk` 等 | **无 qdrant sink**（PREREQ） |
| `privacy.service` | 公开 DELETE | **仍 503** |

---

## 1. 目标（诚实推进 G5 下一刀 · P16）

在 **P15 双过**（subject erase + countable receipt + recall=0）之后，推进 **原型 receipt → 0091 ledger 形状** 的 **schema/mapping 证明**：

1. 钉死 P15 `QdrantErasureReceipt` 字段与 0091 `privacy_deletion_receipt` / contracts `PrivacyDeletionReceipt` 的映射表（mapped / partial / unmapped / blocked）。  
2. 若产品账本对 Qdrant **仍不可写** → **fail-closed 输出 PREREQ 清单**（非空），**禁止**伪造 ledger INSERT / DELETE 成功。  
3. 可派生 `candidateReceiptHash`（partial `receipt_hash` 材料）——**≠** 调用 `privacy_record_deletion_receipt`。

| 项 | 裁定 |
|----|------|
| CMD | `pnpm qdrant-store:g5-ledger-map:prove`（standalone；**不得**入 sole allowlist） |
| 实现 | `ledger-receipt-map.ts`：`RECEIPT_FIELD_MAP` · `LEDGER_WRITE_PREREQS` · `assertQdrantLedgerNotWritable` · `mapPrototypeReceiptToward0091` |
| 产品 DELETE | **仍 503** — **不得**宣称 200/202 |
| 0091 ledger | **仍 GAP**（mapping ≠ write / 对齐） |
| 与 P15 | **≠** 替换；P15 仍走 `g5-erasure:prove` |

### PREREQ（诚实 · 禁假绿 · 产品账本不可写时必须列出）

1. **SINK_CHECK_NO_QDRANT** — `privacy_deletion_target.sink` 无 qdrant 值  
2. **PUBLIC_DELETE_STILL_503** — 公开删除未开放  
3. **NO_REQUEST_OR_TARGET** — 无 request/target FK 行可挂 receipt  
4. **AUTHZ_ROOT_UNWIRED** — 授权根未接 Qdrant erase  
5. **WORKER_NO_QDRANT_SINK** — worker 未把 Qdrant erase 记入 `privacy_record_deletion_receipt`  
6. **RECEIPT_SHAPE_MISMATCH** — 原型形状 ≠ 0091 / contracts  
7. **EXTERNAL_CONFIRM_MISSING** — 无 external_pending→confirmed 异步确认路径  

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm qdrant-store:g5-ledger-map:prove` | **0** | mapping 表完整 + PREREQ 非空 + writable:false + DELETE 仍 503 + **仍钉 G5≠0091** |
| honesty 钉失败 | **1** | 文档/GAP/假对齐断言失败 |

```bash
# 静态 schema/PREREQ 刀 — 不要求 live Qdrant
pnpm qdrant-store:g5-ledger-map:prove
```

---

## 3. Proven vs GAP（本切片）

| | 项 |
|--|-----|
| **Proven（本绿可达 · P16）** | P15→0091 **field map**；`candidateReceiptHash` partial；**fail-closed PREREQ 清单**（ledger not writable）；公开 DELETE **源码仍 503**；不发明 request_id/target_id；`releaseEvidence=false`；**standalone** |
| **仍 GAP · G5** | Qdrant **未**登记为 0091 sink；无逐 sink ledger write；授权根/claim/lease；公开 DELETE 开放；recall=0+receipt **对齐** 0091；切向量真相 |

**禁止宣称**：G5 关闭、privacy covered、DELETE 200/202、erasure complete、0091 ledger 对齐、ledger 可写、cutover、HA、`releaseEvidence=true`。

---

## 4. 假闭环风险

| 风险 | 处置 |
|------|------|
| mapping EXIT=0 = ledger 对齐 | **禁止** — 钉 **writeBlocked:true** + G5 仍 GAP |
| 伪造 request_id/target_id | **禁止** — map 结果不得发明 FK |
| 假 DELETE 200/202 | **禁止** — 对照 privacy.service 503 |
| 把 candidateReceiptHash 当已入账 | **禁止** — 明确 ≠ `privacy_record_deletion_receipt` |
| 入 sole allowlist / 切 pgvector | **禁止** |

---

## 5. 审查

- **必须**：`mw-privacy-int`  
- **第二域**：`mw-rag-route` 或 `mw-e2e-ha`  
- 合入/切流权在协调/用户；**禁止自批** ledger 对齐 / DELETE 开放 / G5 关闭  
- 结论落 `ai-docs/delivery/reviews/`
