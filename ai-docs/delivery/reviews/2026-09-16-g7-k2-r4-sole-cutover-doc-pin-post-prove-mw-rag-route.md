# Review — G7-K2 · R4 sole-cutover doc pin **post-prove**（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~19:51 PT）  
**结论**：**pass**（限：独立复跑 `pnpm mysql-stack:r4-domain-isolation:prove` **EXIT=0** + status 显式 **≠ sole cutover** 与 harness evidence 对齐；**≠ sole cutover done** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ suite green**）  
**硬钉**：**≠R2/R4关** · **≠题域已隔离** · **≠suite绿** · **sole-cutover钉≠已退役** · **G6 OPEN** · **releaseEvidence=false** · **≠HA**  
**配对**：mw-e2e-ha · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-k2-r4-sole-cutover-doc-pin-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-g7-k2-r4-sole-cutover-doc-pin-mw-rag-route.md`（pass）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | Status 显式 **≠ sole cutover** 是否与 prove 诚实对齐？ | **是**。prove PASS：`status: pins ≠ sole cutover` + `harness evidence: pins ≠ sole cutover`。doc pin = 诚实否定，**≠** cutover 完成宣称。 |
| 2 | Pin ≠ sole cutover done ≠ R4 closed ≠ 题域已隔离？ | **同意**。硬句与 status 尾注均钉：pin ≠ sole cutover **done** · ≠ R4 closed · ≠ 题域已隔离。 |
| 3 | ADV / LIVE_PG_GAP / wrong_track=0 covered 是否仍开？ | **仍开**。prove OK 文：`≠ wrong_track=0`；ADV partial ≠ covered；LIVE_PG_GAP 仍 honesty-only。本刀未关 ADV/LIVE_PG。 |
| 4 | 独立复跑 EXIT？ | **已复跑** → **EXIT=0**（见下）。 |
| 5 | 禁 silent script weaken / self-approve？ | **遵守**。本审不改 prove/生产码；禁自批。 |

## CMD / EXIT（本域独立复跑）

| CMD | EXIT | 读法 |
|-----|------|------|
| **`pnpm mysql-stack:r4-domain-isolation:prove`** | **0** | **≠ sole cutover** status pin 已对齐 · harness evidence 齐 · **≠ R4 closed** · **≠ 题域已隔离** |

OK banner（摘录）：`OK  r4-domain-isolation prove (honesty pins only; partial P-WIRE ok; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false; Not HA)`

Key **unset** · 未读 `.env*` · 未跑 HA / flip / suite

## 仍开

- **R4 / 题域隔离 NOT closed**  
- wrong_track=0 **≠ covered**；ADV partial；**LIVE_PG_GAP**  
- **sole-cutover 钉 ≠ 已退役 / ≠ done**  
- **R2 NOT closed**（正交）· **G6 OPEN** · **≠ suite green**

## 非宣称

禁止：R4 closed、题域已隔离、sole cutover done、R5 retired、wrong_track=0 covered、ADV covered、suite green、G6 closed、HA、`releaseEvidence=true`、实现方自批、silent script weaken。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-k2-r4-sole-cutover-doc-pin-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-k2-r4-sole-cutover-doc-pin-post-prove-mw-rag-route.md`
- HEAD：`639134f`
- 本审：独立复跑 EXIT=0 · releaseEvidence=false · ≠HA · ≠R2/R4关 · ≠题域已隔离 · ≠suite绿 · sole-cutover钉≠已退役 · G6 OPEN
