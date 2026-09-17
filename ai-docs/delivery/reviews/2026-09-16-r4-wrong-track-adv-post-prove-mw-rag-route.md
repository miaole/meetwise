# Review — R4 **wrong_track=0 ADV** **post-prove**（第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限：独立复跑 `pnpm r4-wrong-track-adv:prove` EXIT=0 + A3 LIVE_PG_GAP honesty；**ADV 绿 ≠ covered ≠ R4 closed ≠ 题域已隔离 ≠ full live Worker+PG ADV 已关**）  
**releaseEvidence=false** · Not HA · 配对 `mw-e2e-ha` · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-r4-wrong-track-adv-mw-rag-route.md`（pass · 验收门）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 独立复跑？ | **已复跑** → **EXIT=0**（见下）。 |
| 2 | A1–A4 诚实成立？ | **是**。wired CALL_SITES=1；wrong_track assert；A3 unit+map；fail-closed；禁 P-FAKEPLAN / 无 unscoped 回退。 |
| 3 | LIVE_PG_GAP 诚实？ | **是**。OK 文显式 LIVE_PG_GAP honesty；≠ full live Worker+PG ADV 已关；rag04 非 sole 冒充。 |
| 4 | NHP-R4-ADV-01 仅 partial/honesty-pin，不得 covered？ | **同意**。 |
| 5 | EXIT=0 仍钉 ≠ R4 closed / ≠ 题域已隔离？ | **是**。 |
| 6 | docs 是否误写 covered / R4 已关？ | **否**。 |
| 7 | pre-exec dual + 本绿不得自动批 R4 关 / ADV covered？ | **不得**。 |

## CMD / EXIT（本域独立复跑）

| CMD | EXIT | 读法 |
|-----|------|------|
| **`pnpm r4-wrong-track-adv:prove`** | **0** | CALL_SITES=1；wrong_track assert；A3；LIVE_PG_GAP；**≠ covered**；**≠ R4 closed** |

OK banner（摘录）：`OK r4-wrong-track-adv prove (wired path CALL_SITES=1; wrong_track assert; A3 surfaces unit+map; fail-closed; LIVE_PG_GAP honesty; ≠ covered; ≠ R4 closed; releaseEvidence=false)`

Key **unset** · 未读 `.env*` · 未跑 HA / flip / DELETE

## 仍开

- R4 / 题域隔离 **NOT closed**（并列 P-R1 / P-R2 / P-META）  
- **LIVE_PG_GAP**（full live Worker+PG ADV）  
- NHP-R4-ADV-01 **partial**/honesty-pin；**零 covered**

## 非宣称

禁止：covered、R4 closed、题域已隔离、full live ADV 已关、HA、`releaseEvidence=true`、实现方自批、wire 绿单独关 ADV。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md`
- HEAD：`639134f`
