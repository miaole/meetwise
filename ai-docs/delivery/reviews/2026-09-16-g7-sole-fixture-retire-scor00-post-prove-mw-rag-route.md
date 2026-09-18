# Review — G7 MAIN · sole夹具退役 ⋂ scor-00 **post-prove**（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（**独立复跑** ~23:13–23:14 PDT · 用户「重新发起」）  
**结论**：**pass**（限：本域独立复跑 REQUEST 表内全部 6 CMD **EXIT=0** + RAG/R5 banner 诚实对齐 T2/T3/T5；**≠ R5 retired** · **≠ sole cutover complete** · **≠ 题域已隔离** · **≠ R4 closed** · **≠ suite green** · **≠ HA**）  
**硬钉**：**≠R5 retired** · **≠sole cutover complete** · **≠题域已隔离** · **≠R4关** · **pgvector/legacy EXIT=0 ≠ sole capacity** · **allowlist未扩** · **releaseEvidence=false** · **≠HA**  
**配对**：mw-e2e-ha · HEAD `639134f` · knife `executed:awaiting_post_prove_dual`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-g7-sole-fixture-retire-scor00-mw-rag-route.md`（pass）  
对照：`harness/g7-sole-fixture-retire-scor00.md` · `harness/r5-retirement-sole-stack-status.md` · `harness/g1-default-switch-prep.md` · `g7-honesty-knives.slice.md` · 正交 K2（R4 sole-**cutover doc pin** ≠ 本夹具退役轨）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | sole-fixture prove + legacy R5 banner 是否满足 T2/T3/T5 诚实（未宣称 R5 retired / sole cutover）？ | **是**。`scor-00:sole-fixture:prove` OK 钉 T1–T5 + `≠ R5 retired ≠ Nest-on-MySQL`；legacy `scor-00:http:prove` 出 `[R5-MARKED-RED]` + `[G7-SCOR00-PG-FIXTURE]`（≠ sole capacity · ≠ sole cutover · ≠ R5 retired · ≠ G7 scor nonzero closed）。 |
| 2 | allowlist **未**静默扩纳 scor；Nest-on-MySQL PREREQ 仍开？ | **确认**。独立解析 `SOLE_WIRING_ALLOWLIST` **COUNT=5**（wiring/ping/qdrant-backed/adapter/vectorstore-qdrant）；**scor 不在**；sole-fixture PASS 同钉；NOTE：Nest scor HTTP 仍 PG Client = **PREREQ open**。 |
| 3 | default isolation **仍** legacy；本刀 **未** flip？ | **确认**。`isolationStack = raw \|\| LEGACY_STACK`；`LEGACY_STACK=pgvector-legacy`；G1 prep EXIT=0 钉 flip NOT open · prep ≠ flip。 |
| 4 | **≠ R4 closed / ≠ 题域已隔离**（K2 正交）？ | **确认**。sole-fixture PASS `R4 still open`；本刀 ≠ K2 cutover 文案轨；**未**宣称题域已隔离 / R4 关。 |
| 5 | 实现方未自批；本 REQUEST ≠ pass？ | **遵守**。本审为独立 post-prove 复跑；实现方 harness 仍 `awaiting_post_prove_dual`；禁自批；本域结论 ≠ 实现方自批。 |

## CMD / EXIT（本域独立复跑 · 2026-09-16 ~23:13:49–23:14:36 PDT）

| CMD | EXIT | 读法 / banner |
|-----|------|----------------|
| `pnpm scor-00:sole-fixture:prove` | **0** | OK：`T1–T5 honesty pins + sole reachability; ≠ R5 retired ≠ suite green ≠ Nest-on-MySQL ≠ HA` · allowlist 恰 5 · scor 外 · G1 flip NOT open · R4 still open · Nest MySQL PREREQ GAP |
| `pnpm scor-00:http:prove` | **0** | `[R5-MARKED-RED]` + `[G7-SCOR00-PG-FIXTURE]` · pgvector-legacy opt-in · **legacy EXIT=0 ≠ sole capacity ≠ R5 retired ≠ G7 close alone** · `release_evidence=false` |
| `pnpm scor-00-honesty:prove` | **0** | domain honesty 21 scenarios · `releaseEvidence=false` · **≠ product / ≠ G7 close alone** |
| `pnpm g1-default-switch:prep:prove` | **0** | prep ≠ flip · default still `pgvector-legacy` · **allowlist 恰 5**（P13 OFF） · flip NOT open |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | marked-red ≠ deleted / ≠ retired · `本绿≠已迁` · releaseEvidence=false · Not HA |
| `pnpm e2e-isolation:sole-wiring:prove` | **0** | `[R5-SOLE-WIRING]` allowlisted sample · shared compose ≠ disposable · **≠ default sole** · scor still off allowlist |

**Allowlist size check（独立解析 `scripts/run-e2e-isolated.mjs`）**：COUNT=**5** · items=`sole-stack:wiring:prove`,`sole-stack:ping:prove`,`sole-stack:qdrant-backed:prove`,`sole-stack:vectorstore-adapter:prove`,`sole-stack:vectorstore-qdrant:prove` · scor_on_list=**false** · **未静默扩**。

Key **unset** · 未读 `.env*` · 未 invent Key · 未跑 HA / flip / suite · 未改生产码（本审仅覆写本 review md） · **未触 Meridian**

**复跑说明**：用户要求「重新发起」；前序 ~19:58 PT 卷可能 stale/undelivered。本域于 **23:13:49–23:14:36 PDT** 全新独立复跑 6 CMD（日志：`.tmp/g7-scor00-post-prove-rag-rerun-20260916-231349-mw-rag/`），**未**复用他域/他次日志作证据。

## 仍开

- **R5 未 retired**（marked-red / green-risk 保留至 sole product）  
- **G1 flip NOT open** · 默认仍 `pgvector-legacy`  
- Nest scor-00 on **MySQL sole** = **PREREQ GAP**（HTTP body 仍 PG Client）  
- Sole allowlist **恰 5**（scor 外）· **未**扩  
- **R2/R4 still open** · **≠ 题域已隔离** · **≠ sole cutover complete** · **≠ suite green** · **≠ HA**

## 非宣称

禁止：R5 retired、sole cutover complete、题域已隔离、R4 closed、suite green、G7 scor 已关（仅凭 legacy/honesty EXIT=0）、prep=flip、静默扩 allowlist、legacy EXIT=0=sole capacity、HA、`releaseEvidence=true`、实现方自批、本 dual 关闸完成（配对 mw-e2e-ha 另卷）。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-rag-route.md`
- 对照：`harness/g7-sole-fixture-retire-scor00.md` · pre-exec `2026-09-16-g7-sole-fixture-retire-scor00-mw-rag-route.md`
- 本域日志：`.tmp/g7-scor00-post-prove-rag-rerun-20260916-231349-mw-rag/`
- HEAD：`639134f`
- 复跑窗：2026-09-16 **23:13:49–23:14:36 PDT**
- 本审：独立复跑 6×EXIT=0 · allowlist COUNT=5 · releaseEvidence=false · ≠HA · ≠R5 retired · ≠sole cutover complete · ≠题域已隔离 · ≠R4关 · ≠suite绿
