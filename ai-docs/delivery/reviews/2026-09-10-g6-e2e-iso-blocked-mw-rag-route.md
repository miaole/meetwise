# Review — G6 Key-blocked honesty（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-e2e-ha 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（限 Key-unset family **blocked** 诚实钉）  
**releaseEvidence=false** · Not HA · **G6 / BUG-E2E-ISO 仍 OPEN** · **blocked ≠ covered** · **≠ family green**

## 对照

- `harness/g6-e2e-iso-blocked.md`
- `harness/r5-retirement-sole-stack-status.md` **P18 / G6**
- `scripts/g6-e2e-iso-blocked.proof.mjs` · `run-e2e.mjs` / `run-e2e-ui.mjs`
- 主审：`2026-09-10-g6-e2e-iso-blocked-mw-e2e-ha.md`
- 同族：`uc001:live-blocked:prove`

## 焦点核实

| 焦点 | 结果 |
|------|------|
| blocked ≠ covered | **成立**。EXIT=0 = 钉 blocked；NOTE 明示 ≠ live E2E · ≠ family green · ≠ G6 关 |
| G6 仍开 | **成立**。status G6 / BUG-E2E-ISO 仍 OPEN；P18 ≠ 关 GAP |
| 无 Key fail-closed | **成立**。`live_provider_key_missing`；spawn 非 0；不读 `.env*`；不发明 Key；未硬跑 `e2e:isolated` |
| performance ≠ G6 关 | **成立**。无 Key 可跑 API burst；不得写成 G6 关 |
| RAG 面 | 本切片 **不**背书 sole 复跑；G2 仍开；≠ rag/vectorstore covered |

## CMD / EXIT（本域独立复跑）

| CMD | EXIT |
|-----|------|
| `pnpm g6-e2e-iso-blocked:prove`（Key unset） | **0** |
| `pnpm uc001:live-blocked:prove` | **0** |
| `pnpm mysql-stack:r5-mark-red:prove` | **0**（交叉；≠ G6 关） |
| `pnpm e2e:isolated`（无 Key） | **未跑 / blocked**（硬禁假绿） |

## 非宣称

禁止：G6 关闭、BUG-E2E-ISO 关闭、family covered、`e2e:isolated` 绿、performance=G6 关、翻默认、fixtures retired、HA、`releaseEvidence=true`。
