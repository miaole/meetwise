# 审查请求 — G5 P16 Qdrant→0091 receipt schema/mapping · mw-privacy-int（必须）+ mw-rag-route

**日期**：2026-09-10（PT）  
**实现方不自批** · **releaseEvidence=false** · **Not HA** · **G5 仍 GAP** · **≠ privacy covered** · **≠ 0091 可写/对齐** · **公开 DELETE 仍 503**

## 范围
- 下一刀（P15 双过后）：`packages/qdrant-store/src/ledger-receipt-map.ts`
- Harness：`harness/qdrant-g5-ledger-map.md`（对照 `qdrant-g5-erasure-ledger.md` P15）
- Status：`r5-retirement-sole-stack-status.md` **P16** / **G5** 仍开
- CMD：`pnpm qdrant-store:g5-ledger-map:prove`

## 请审方核对
1. mapping 表诚实（mapped/partial/unmapped/blocked）；**不**发明 request_id/target_id  
2. 产品账本对 Qdrant **不可写** → 非空 **PREREQ** 清单（sink/DELETE 503/authz/worker/shape）  
3. EXIT=0 **≠** ledger 对齐 / G5 关闭 / DELETE 200/202  
4. 与 P15 分离：`g5-erasure:prove` 仍是 subject erase；本刀静态 schema/PREREQ  
5. 第二域：`mw-rag-route`（或 `mw-e2e-ha`）对照 harness

## 建议复跑
```bash
pnpm qdrant-store:g5-ledger-map:prove
pnpm qdrant-store:g5-erasure:prove   # P15 仍绿（需 Qdrant）
pnpm mysql-stack:r5-mark-red:prove
pnpm mysql-stack:qdrant-backed:prove # 需 Qdrant；仍钉 G5
```

## 禁止结论
- 禁止：G5 关闭、0091 对齐、privacy covered、DELETE 开放、cutover、HA、`releaseEvidence=true`
