# Review — NHP-R4-ADV-01 **covered path** **post-prove**（第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~19:54 PT）  
**结论**：**pass**（限：独立复跑 isolated covered prove EXIT=0 + raw 无 PG EXIT=1 fail-closed；docs 仍 partial / awaiting dual；**本域 pass ≠ 自动升 matrix covered** · **仍 ≠ R4 关 ≠ 题域已隔离 ≠ HA**）  
**releaseEvidence=false** · Not HA · 配对 `mw-e2e-ha` · HEAD `639134f`  
**硬钉**：≠R4关 · ≠题域已隔离 · ≠covered until **本刀 post-prove dual** · sole allowlist未扩 · releaseEvidence=false · ≠HA

覆盖 REQUEST：`REQUEST-2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-nhp-r4-adv-covered-path-mw-rag-route.md`（pass · 验收门）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 独立复跑？ | **已复跑** isolated + raw 无 PG（见下）。 |
| 2 | C1–C4 诚实成立？ | **是**（真 PG · LIVE_PG+unit composition · fail-closed · C4 partial pin）。 |
| 3 | LIVE_PG ADV `post_prove_dual_pass` 仍 ≠ 本 covered path done？ | **是**（OK 文 + harness 硬钉）。 |
| 4 | unit ADV / LIVE_PG honesty ≠ 本刀 covered？ | **是**（旁证 spawn；≠ covered alone）。 |
| 5 | NHP-R4-ADV-01 仍仅 partial，不得 covered 直至本 post-prove dual？ | **同意**。本域 pass **≠** 自动升 covered；须 **dual**（e2e-ha + rag-route）齐后才可 claimable。 |
| 6 | EXIT=0 仍钉 ≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ production wrong_track=0 closed？ | **是**。 |
| 7 | docs 是否误写 covered / R4 已关？ | **否**（matrix 仍 partial；harness/eval/slice/status=`executed:awaiting_post_prove_dual`）。 |
| 8 | C3（G-R2-5 / ban P-FAKEPLAN / ban unscoped）保留？ | **是**（LIVE_PG L4 + unit 旁证均 PASS）。 |

## CMD / EXIT（本域独立复跑 · ~19:54 PT）

| CMD | EXIT | 读法 |
|-----|------|------|
| **`pnpm nhp-r4-adv-covered:prove`**（isolated 真 PG） | **0** | C1–C4 composition；LIVE_PG+unit；matrix **仍 partial**；**≠ covered until post-prove dual**；≠ R4 closed |
| **`pnpm nhp-r4-adv-covered:prove:raw`**（无 PG） | **1** | fail-closed：**refuse fake-green**；skip≠pass；COVERED_PATH_GAP |

OK banner（摘录）：`OK  nhp-r4-adv-covered prove (C1–C4 composition; LIVE_PG+unit; matrix still partial; ≠ covered until post-prove dual; ≠ R4 closed; releaseEvidence=false)`

FAIL banner（raw）：`COVERED_PATH_GAP: real Postgres required … skip ≠ pass — refusing fake-green`

收据：`.tmp/isolated-proof-receipts/2026-09-17T02-54-47-632Z-1086805-f9e36b43-ff7b-444d-af1a-67816126c4f4.json` · `release_evidence=false`  
夹具注：isolated 默认 **pgvector-legacy** → **R5 green-risk**（本绿≠已迁 / ≠ sole）；Key **unset** · 未读 `.env*`

## Sole allowlist

- `SOLE_WIRING_ALLOWLIST` **恰 5**：`sole-stack:wiring|ping|qdrant-backed|vectorstore-adapter|vectorstore-qdrant:prove`
- **`nhp-r4-adv-covered:prove:raw` 不在 allowlist**（走 legacy isolated PG；prove 内 C4 断言未扩）
- **sole allowlist 未扩**

## Docs 诚实性抽查

| 文件 | 观察 |
|------|------|
| `harness/nhp-r4-adv-covered-path.md` | `executed:awaiting_post_prove_dual` · ≠ covered · R4 open |
| `eval/nhp-r4-adv-covered-path.eval.md` | 同上；假绿清单禁升 covered |
| `nhp-r4-adv-covered-path.slice.md` | matrix **仍 partial** until dual |
| `r4-domain-isolation-status.md` §12 | R4 **仍 NOT closed**；题域隔离 NOT closed |
| matrix `NHP-R4-ADV-01` | **partial**/honesty-pin；**≠ covered** |

**未发现** premature covered / R4 closed / 题域已隔离 / HA 宣称。

## 仍开

- **post-prove dual**：本域 pass 已写；配对 `mw-e2e-ha` **仍 awaiting** → matrix **不得**升 covered 直至 dual 齐  
- NHP-R4-ADV-01 **仍 partial**/honesty-pin（即使本域 pass）  
- R4 / 题域隔离 **NOT closed**  
- LIVE_PG ADV prior dual = honesty only · **≠** 本 covered path done（已钉）

## 非宣称

禁止：把本域 pass 写成 matrix **covered** 已达成、R4 closed、题域已隔离、HA、`releaseEvidence=true`、production wrong_track=0 closed、sole cutover、flip default、open DELETE、实现方自批、sole allowlist 已扩。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md`
- HEAD：`639134f`
- 配对：`mw-e2e-ha` post-prove **仍 awaiting**（dual 未齐 → covered 仍不可 claim）
