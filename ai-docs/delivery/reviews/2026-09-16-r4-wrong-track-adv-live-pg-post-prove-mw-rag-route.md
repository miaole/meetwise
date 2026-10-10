# Review — R4 **wrong_track=0 ADV · LIVE_PG** **post-prove**（第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限：独立复跑 isolated LIVE_PG prove EXIT=0 + raw 无 PG EXIT=1 fail-closed；**绿 ≠ R4 关 ≠ LIVE_PG_GAP dual-closed ≠ covered ≠ HA**）  
**releaseEvidence=false** · Not HA · 配对 `mw-e2e-ha` · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-r4-wrong-track-adv-live-pg-mw-rag-route.md`（pass · 验收门）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 独立复跑？ | **已复跑** isolated + raw 无 PG（见下）。 |
| 2 | L1–L4 诚实成立？ | **是**（真 PG · retrieveVia · A3 live 面 · fail-closed · 禁 P-FAKEPLAN）。 |
| 3 | LIVE_PG_GAP 仍开直至 dual？ | **是**。OK 文显式 open until dual；EXIT=0 ≠ gap dual-closed。 |
| 4 | unit ADV ≠ 本刀？ | **是**（raw 无 PG 文案 + L6 钉）。 |
| 5 | NHP-R4-ADV-01 仅 partial，不得 covered？ | **同意**。 |
| 6 | EXIT=0 仍钉 ≠ R4 closed / ≠ 题域已隔离 / ≠ HA？ | **是**。 |
| 7 | docs 是否误写 covered / R4 关 / gap dual-closed？ | **否**。 |

## CMD / EXIT（本域独立复跑 · ~19:41 PT）

| CMD | EXIT | 读法 |
|-----|------|------|
| **`pnpm r4-wrong-track-adv-live-pg:prove`**（isolated 真 PG） | **0** | LIVE_PG hit；retrieveVia；wrong_track=0 surfaces；fail-closed；**LIVE_PG_GAP open until dual**；≠ covered；≠ R4 closed |
| **`pnpm r4-wrong-track-adv-live-pg:prove:raw`**（无 PG） | **1** | fail-closed：**refuse fake-green**；skip≠pass；unit ADV ≠ 本刀 |

OK banner（摘录）：`OK  r4-wrong-track-adv-live-pg prove (LIVE_PG hit; retrieveVia; wrong_track=0 ADV surfaces; fail-closed; LIVE_PG_GAP open until dual; ≠ covered; ≠ R4 closed; releaseEvidence=false)`

夹具注：isolated 默认 **pgvector-legacy** → **R5 green-risk**（本绿≠已迁 / ≠ sole）；Key **unset** · 未读 `.env*`

## 仍开

- **LIVE_PG_GAP** 直至 post-prove dual 闭合  
- R4 / 题域隔离 **NOT closed**  
- NHP-R4-ADV-01 **partial**/honesty-pin；**零 covered**

## 非宣称

禁止：covered、R4 closed、题域已隔离、LIVE_PG_GAP dual-closed、HA、`releaseEvidence=true`、unit ADV = LIVE_PG、实现方自批、翻默认/开 DELETE。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md`
- HEAD：`639134f`
