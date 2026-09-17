# 审查归档 — G5 P16 ledger map→0091 · mw-privacy-int 主审

**日期**：2026-09-10
**结论**：**pass**（**限 P16 schema/mapping + fail-closed PREREQ**）
**releaseEvidence=false** · **Not HA** · **G5 仍开** · **≠ 0091 已写/对齐** · **公开 DELETE 仍 503** · **≠ 假 DELETE 202** · 实现方不自批

## 对照
- `harness/qdrant-g5-ledger-map.md`
- `packages/qdrant-store/src/ledger-receipt-map.ts`
- status P16；前驱 P15 `qdrant-g5-erasure-ledger.md`
- GAP-PRIV-04

## 本机复跑
| CMD | EXIT |
| --- | --- |
| `pnpm qdrant-store:g5-ledger-map:prove` | **0**（field map；`writable:false`；PREREQ×7；`alignedWith0091:false`；`publicDeleteStatus=503`；不发明 request_id/target_id；不在 sole allowlist） |
| `pnpm qdrant-store:g5-erasure:prove` | **0** |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** |
| `pnpm mysql-stack:qdrant-backed:prove` | **0**（仍钉 **STILL-GAP G5**） |

## 硬门核对
| 门 | 判定 |
| --- | --- |
| ≠0091 已写 | **成立** — `writeBlocked:true`；blocked request_id/target_id；0125 无 qdrant sink |
| G5 仍开 / P16≠关 G5 | **成立** |
| 公开 DELETE 仍 503 | **成立**（源码 + claims） |
| 假 DELETE 202 | **未见** |
| releaseEvidence=false / Not HA | **成立** |
| 假 covered / ledger 已对齐 | **未见** |

## 仍 block（关 G5 / 切流）
SINK_CHECK 加 qdrant · request/target 行 · authz 接线 · worker 记 receipt · DELETE 开放 · 0091 真写 · cutover

## 一句话
P16 mapping **pass**；**ledger 仍不可写**；**G5 仍开**；禁止假对齐/假 covered。
