# Adversarial spot — E2E S4 conn-stack（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**  
**releaseEvidence=false** · Not HA · 连通绿 ≠ E2E covered

## 对照

- `scripts/conn-stack/`（mysql-stack.* bodies）
- `scripts/isolated/targets-domain-prove.mjs`
- `scripts/e2e-platform/directory-contract.mjs`
- `harness/e2e-directory-s4-conn-stack.md`
- legacy forwarders：`scripts/mysql-stack.*.proof.mjs`

## 焦点核实

| 焦点 | 结果 |
|------|------|
| conn-stack / mysql-stack **NEVER LIVE / NEVER prove-shell** | **通过**。runtime：`connOnly=true`、`proveShell=false`、`live=false` |
| `isConnOnlyTarget` 覆盖 `conn-stack:` | **通过**（`mysql-stack:` \|\| `conn-stack:`） |
| 无 rag / UI 升 LIVE | **通过**。rag/vectorstore/memory 仍 prove-shell；LIVE Set 仍三元；UI secondary |
| 无 mass-move 业务 e2e | **通过**。`conn-stack/` 仅 mysql-stack.* proof bodies；无 `*.e2e.ts` |

## 旁证 CMD / EXIT

| CMD | EXIT |
|-----|------|
| lane sample assert（含 `conn-stack:`） | **0**（S4_LANE_OK） |
| `pnpm e2e-platform:check` | **0** |
| `pnpm e2e-platform:prove` | **0** |

## nit（不降级）

- `directory-contract.mjs` 静态正则仍以 `startsWith('mysql-stack:')` 为主钉；runtime 已含 `conn-stack:`。建议后续静态钉也显式要求源码出现 `conn-stack:`（防回退）。

## 非宣称

不以 mysql-stack / conn-stack 绿冒充业务 E2E covered / sole-stack cutover / R5 已关 / RAG 已迁。
