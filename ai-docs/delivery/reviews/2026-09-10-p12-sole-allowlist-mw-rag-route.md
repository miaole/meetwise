# Review — P12 入 sole allowlist（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（仅 `sole-stack:vectorstore-qdrant:prove` opt-in 入表；**未**放 rag/memory/默认 vectorstore；**G2 仍开**）  
**releaseEvidence=false** · Not HA · **≠ covered / ≠ 默认已切**

## 对照

- `scripts/run-e2e-isolated.mjs` · `SOLE_WIRING_ALLOWLIST`
- `package.json` · `e2e-isolation:sole-vectorstore-qdrant:prove`
- status **P8**（含 P12）· **P12** · **G2**
- 平行：`harness/qdrant-vectorstore-prove.md`

## Allowlist（核实）

`sole-stack:{wiring,ping,qdrant-backed,vectorstore-adapter,vectorstore-qdrant}:prove`  

注释钉：**NEVER include rag*/memory*/vectorstore:prove (default) until G2**。  
P12 项 = opt-in prove path（`prove:vectorstore-qdrant`），**≠** 默认 `vectorstore:prove`。

## 焦点核实

| 焦点 | 结果 |
|------|------|
| P12 opt-in only 入 allowlist | **成立**。仅 `sole-stack:vectorstore-qdrant:prove`；映射 `pnpm -C packages/qdrant-store prove:vectorstore-qdrant` |
| 未放 rag/memory/默认 vectorstore | **成立**。`*:prove:raw` deny EXIT=3；Set 无这些名 |
| 本绿 ≠ covered / G2 关 | **成立**。banner + gate receipt；PREREQ #3；status G2 开 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `E2E_ISOLATION_STACK=mysql-qdrant-redis … sole-stack:vectorstore-qdrant:prove` | **0** |
| sole `vectorstore:prove:raw` | **3** |
| sole `memory:prove:raw` | **3** |
| sole `rag03-route:prove:raw` | **3** |

## 非宣称

禁止：G2 关闭、默认 `vectorstore:prove`/rag/memory covered 或已迁 sole、翻 isolation 默认、夹具退役、HA、`releaseEvidence=true`。


---

## 补注 · 第二审复核对齐（B5/B6 修后 · 同日 PT）

**结论**：**pass（升格对齐）** — 对照 mw-e2e-ha 曾记 **B5**（live=7 含 P13）/ **B6**（sole-qdrant-backed EXIT=1）；本域复跑后：

| 条件 | 结果 |
|------|------|
| B5「恰 5」 | **已清**。`SOLE_WIRING_ALLOWLIST` **COUNT=5**；无 `rag-qdrant`/`memory-qdrant`；无 `e2e-isolation:sole-rag|memory` 脚本；status P8 字面 **恰 5** + **P13 NOT on allowlist** |
| B6 全量 allowlist 绿 | **已清**。五条 sole 均 **EXIT=0**（含 `sole-stack:qdrant-backed:prove`） |
| 默认仍 fail-closed | **仍成立**。sole `vectorstore:prove:raw` / `rag03-route:prove:raw` → **3** |

### 复跑 EXIT

| CMD | EXIT |
|-----|------|
| sole wiring / ping / qdrant-backed / vectorstore-adapter / vectorstore-qdrant | **0** ×5 |
| sole `vectorstore:prove:raw` / `rag03-route:prove:raw` | **3** / **3** |

**仍非宣称**：G2 关、默认已切、covered、fixtures retired、P13 入 sole、HA、`releaseEvidence=true`。
