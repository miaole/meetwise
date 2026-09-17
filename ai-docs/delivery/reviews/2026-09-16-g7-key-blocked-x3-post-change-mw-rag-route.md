# Review — G7-A · Key-blocked×3 **post-change**（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~19:51 PT）  
**结论**：**pass**（限：Key **unset** + 3× **blocked** 诚实保留；docs pin only · **未** invent Key · **未**硬跑 live 冒充绿；**≠ family/suite green** · **≠ sole cutover** · **≠ R5 retired** · **G6 OPEN**）  
**硬钉**：**≠R2/R4关** · **≠题域已隔离** · **≠suite绿** · **sole-cutover钉≠已退役** · **G6 OPEN** · **releaseEvidence=false** · **≠HA**  
**配对**：mw-e2e-ha · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-key-blocked-x3-post-change-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-g7-key-blocked-x3-mw-rag-route.md`（pass）  
**本刀**：docs pin only · **no live** · **no invent Key**

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 3× blocked honesty 是否保留（≠ family/suite green）？ | **是**。harness `g7-key-blocked-x3-honesty.md` + G6 cross-pin 钉三 CMD **blocked**（no Key）。本域探针：`E2E_ISOLATED=1` + Key unset → `live_provider_key_missing`（`run-e2e`/`run-e2e-ui` EXIT=1）。**禁止** narrate 为 family/suite green。 |
| 2 | 日后若有 Key+live authorize，默认 pgvector 是否仍 **R5 green-risk ≠ sole cutover**？ | **是**。默认 `E2E_ISOLATION_STACK=pgvector-legacy` **未翻**；sole allowlist **恰 5** 未扩。有 Key 硬跑仍 **R5 green-risk ≠ sole cutover / ≠ R5 retired**。 |
| 3 | 本刀是否正确 **未**授 live / **未** invent Key？ | **是**。未读 `.env*` · 未 invent `MODEL_API_KEY` · 未硬跑 `e2e:isolated` / UI / `verify:e2e-performance` 全量冒充绿。 |
| 4 | G6 still OPEN / K3 cite 正交？ | **是**。G6 / BUG-E2E-ISO **still OPEN**；cite 归 K3；本刀只管 3× blocked 诚实。 |
| 5 | 禁 self-approve / flip default？ | **遵守**。Allowlist/defaults **NOT flipped**；禁自批。 |

## CMD / EXIT（本域核验 · Key unset）

| CMD / 探针 | Status / EXIT | 读法 |
|------------|---------------|------|
| `MODEL_API_KEY` | **UNSET** | 未 invent · 未读 `.env*` |
| `E2E_ISOLATED=1 node scripts/run-e2e.mjs` | **EXIT=1** · `live_provider_key_missing` | HTTP family **blocked** · ≠ green |
| `E2E_ISOLATED=1 node scripts/run-e2e-ui.mjs` | **EXIT=1** · `live_provider_key_missing` | UI family **blocked** · ≠ covered |
| `pnpm e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` | **blocked**（Key unset）· **not hard-run** | docs pin 诚实；perf suite 含 e2e:isolated 步骤 → 无 Key 不得称绿 |
| Sole allowlist | **恰 5** · 未翻 | ≠ sole cutover · ≠ R5 retired |
| Default stack | `pgvector-legacy` 未翻 | **R5 green-risk** 仍在 |

交叉：`pnpm g6-e2e-iso-blocked:prove`（K3 同窗复跑）EXIT=0 钉 Key-unset blocked honesty · ≠ G6 closed。

## 仍开

- Key unset → 三 CMD **blocked**  
- **G6 / BUG-E2E-ISO still OPEN**  
- 默认 legacy → **R5 green-risk** · **sole-cutover钉≠已退役**  
- **R2/R4 NOT closed** · **≠ 题域已隔离** · **≠ suite green**

## 非宣称

禁止：family green、suite green、G6 closed、R5 retired、sole cutover done、R2/R4 closed、题域已隔离、SLO/LOAD/HA、`releaseEvidence=true`、invent Key、flip default、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-key-blocked-x3-post-change-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-key-blocked-x3-post-change-mw-rag-route.md`
- HEAD：`639134f`
- 本审：Key unset + blocked honesty 独立核验 · 零 invent Key · 零 suite 假绿 · releaseEvidence=false · ≠HA · ≠R2/R4关 · ≠题域已隔离 · ≠suite绿 · G6 OPEN · sole-cutover钉≠已退役
