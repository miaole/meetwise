# REQUEST — G4 dispatch/recheck honesty PREREQ（fail-closed · 未接线）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ covered** · **≠ sole cutover**

## 对照

- `harness/r4-domain-isolation.md` / `r4-domain-isolation-status.md`
- `eval/r4-domain-isolation.eval.md`
- `e2e-case-inventory.md`（PRD-TEST-016 / R4 行）
- `apps/worker/test/g4-dispatch-recheck-prereq.proof.ts`
- 前序：`reviews/2026-09-10-g4-production-scoped-retrieve-mw-e2e-ha.md`（partial pass；下一刀=full dispatch — **本刀诚实推迟**）
- GAP-RAG-04 · r5 sole-stack **G4**

## 切片立场

实现方 **未**接线生产 dispatch/recheck（产品阻塞）。本刀只登记 **honesty PREREQ + fail-closed**（可执行否定钉），**不得**冒充：

- 完整 E2E / covered / HA / `releaseEvidence=true`
- R4 / G4 关闭 · 题域已隔离 · wrong_track=0
- full `dispatchTrackLocalRetrieval` 生产路径已齐

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** |

## 请专家回答

1. 本切片是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关？  
2. EXIT=0 是否被文档明确标红为 **≠ 题域已隔离 / ≠ dispatch 已齐 / ≠ wrong_track=0**？  
3. sole allowlist 是否因本切片扩面？（期望：**否**）  
4. 与 G4 并列门（挡切题库/向量）是否仍一致钉 R4 NOT closed？

## 非宣称

- 不宣称 covered / HA / releaseEvidence=true / sole cutover / flip default  
- 不宣称生产 dispatch/recheck 已接线  
- 本 REQUEST **不是** pass 结论；实现方禁止自批
