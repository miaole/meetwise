# Review — G5 P16 ledger map（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-privacy-int 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（schema/mapping + fail-closed PREREQ 诚实；**mapping ≠ 0091 write**；**G5 仍开**）  
**releaseEvidence=false** · Not HA · **≠ privacy covered** · **≠ DELETE 200/202** · **P16 ≠ 关 G5**

## 对照

- `harness/qdrant-g5-ledger-map.md`
- `packages/qdrant-store/src/ledger-receipt-map.ts`
- status **P16** · **G5**
- 前驱 P15；主审：`2026-09-10-g5-p16-ledger-map-mw-privacy-int.md`

## 焦点核实

| 焦点 | 结果 |
|------|------|
| mapping ≠ 0091 write | **成立**。`writable:false` · `writeBlocked:true` · `alignedWith0091:false`；无 ledger INSERT；`privacy_record_deletion_receipt` 未调用 |
| PREREQ fail-closed 非空 | **成立**。7 项（含 SINK_CHECK_NO_QDRANT / PUBLIC_DELETE_STILL_503 / AUTHZ_ROOT_UNWIRED） |
| G5 仍开 / P16 ≠ 关 G5 | **成立**。status + prove NOTE；field map blocked/unmapped 主导 |
| 公开 DELETE 仍 503 | **成立**。claims `publicDeleteStatus=503` + privacy.service 源码钉 |
| 未入 sole / 未切向量 | **成立**。standalone；`annSearch` intact |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm qdrant-store:g5-ledger-map:prove` | **0** |
| `pnpm qdrant-store:g5-erasure:prove`（P15 回归） | **0** |

## 非宣称

禁止：G5 关闭、0091 ledger 可写/已对齐、privacy covered、DELETE 200/202、sink 已登记、假 covered、HA、`releaseEvidence=true`。
