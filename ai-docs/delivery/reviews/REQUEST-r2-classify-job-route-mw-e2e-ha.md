# REQUEST — R2 `classifyJobRoute` honesty PREREQ（fail-closed · 未接线）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **pass ≠ R2 已关** · **≠ 路由已生效** · **≠ covered** · **≠ 题域已隔离** · **≠ sole cutover**

## 对照

- `harness/r2-classify-job-route.md` / `r2-classify-job-route-status.md`
- `eval/r2-classify-job-route.eval.md`
- `apps/worker/test/r2-classify-job-route-prereq.proof.ts`
- G4 前序：`reviews/2026-09-10-g4-dispatch-recheck-prereq-mw-e2e-ha.md`（P-R2 仍开）
- GAP-RAG-02 · r5 sole-stack **G4** 并列门

## 切片立场

实现方 **未**接线生产 classify（产品阻塞：MODEL-OP binding + 分类 Worker 缺失）。本刀只登记 **honesty PREREQ + fail-closed**（可执行否定钉），**不得**冒充：

- 完整 E2E / covered / HA / `releaseEvidence=true`
- R2 关闭 · 路由已生效 · R4 / 题域已隔离
- 生产 `classifyJobRoute` 路径已齐

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-classify-job-route-prereq:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** |

## 请专家回答

1. 本切片是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R2 已关？  
2. EXIT=0 是否被文档明确标红为 **≠ R2 关 / ≠ 路由已生效 / ≠ 题域已隔离**？  
3. sole allowlist 是否因本切片扩面？（期望：**否**）  
4. 与 G4 并列门是否仍一致钉 R2 PREREQ 开 + R4 NOT closed？

## 非宣称

- 不宣称 covered / HA / releaseEvidence=true / sole cutover / flip default / open DELETE  
- 不宣称生产 classify 已接线 / 路由已生效  
- 本 REQUEST **不是** pass 结论；实现方禁止自批
