# REQUEST — R4 题域隔离诚实钉（GAP-RAG-04 · G4）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · Not HA · **≠ covered** · **≠ HA** · **pass ≠ R4 已关** · **本静态 prove ≠ 完整 E2E**

## 对照

- `ai-docs/delivery/harness/r4-domain-isolation.md`
- `ai-docs/delivery/harness/r4-domain-isolation-status.md`
- `ai-docs/delivery/eval/r4-domain-isolation.eval.md`
- `ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md`（rag04 假绿族边界）
- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md` G4
- `ai-docs/delivery/impl-review-gate.md`（禁止 mysql-stack 冒充完整 E2E）

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |

## 请专家回答

1. 本切片是否错误冒充完整 E2E / covered / HA？  
2. `rag04-track-local:prove` 库存读法（prove-shell + R5 假绿族 ≠ 生产隔离）是否够清楚？  
3. sole allowlist 不因本切片扩面 — 是否同意？  
4. 与 G4（r5 status）并列门表述是否一致（R4 NOT closed 挡切题库/向量）？

## 非宣称（实现方自认）

- 不宣称 E2E covered / HA / releaseEvidence=true  
- 不宣称 sole cutover / flip default  
- 不宣称 R4 已关  
- 本 REQUEST **不是** pass 结论；**不得**用本 prove 顶替整套 E2E 复审
