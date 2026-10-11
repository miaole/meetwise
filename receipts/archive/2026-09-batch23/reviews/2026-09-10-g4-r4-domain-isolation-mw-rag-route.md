# Review — G4 R4 题域隔离诚实钉（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（诚实钉 / PREREQ 登记够格；**R4 仍未关**；**≠ 题域已隔离**）  
**releaseEvidence=false** · Not HA · **EXIT=0 = honesty pins only** · **≠ 翻默认** · **≠ sole cutover**

对照 REQUEST：`reviews/REQUEST-r4-domain-isolation-mw-rag-route.md`

## 对照

- `harness/r4-domain-isolation.md` · `harness/r4-domain-isolation-status.md`
- `eval/r4-domain-isolation.eval.md`
- `scripts/conn-stack/mysql-stack.r4-domain-isolation.proof.mjs`（+ S4 forwarder）
- `m4-rag-hard-gates.md` §R4 · GAP-RAG-04 · sole-status **G4**

## REQUEST 四问

| # | 问题 | 本域裁定 |
|---|------|----------|
| 1 | E1–E10 / PREREQ 是否够验收「诚实钉」而不误关 R4？ | **是**。钉否定句 + PREREQ（R1/R2/MetadataReviewReceipt/Worker wire）+ 库存假绿标红；**无** wrong_track=0 生产断言 |
| 2 | 假绿标红是否覆盖 rag04→R4关、snapshot→R2关、role→题域、m4绿→切流、01A→R4关？ | **是**（harness §1/§2/假绿表；m4/R1 prove 协同） |
| 3 | `main.ts` 无-scope / 无 `dispatchTrackLocalRetrieval` 作 GAP 钉是否准确？ | **是**。`localRetrieve`→`cachedQbankSearch` **无 scope:**；**无** `dispatchTrackLocalRetrieval` 调用 |
| 4 | PREREQ 未齐前是否同意 **保持 NOT closed**？ | **同意**。R4 / 题域隔离 **NOT closed**；禁止切题库/向量真相 |

## 焦点核实

| 焦点 | 结果 |
|------|------|
| EXIT=0 ≠ 题域已隔离 | **成立**。prove/status/eval/m4 否定句齐全 |
| R4 **仍未关** | **成立**。G-R4-1…6；sole-status G4；GAP-RAG-04 |
| 生产接线 GAP | **成立**。Worker 无 track 硬过滤；`apps/` 无 `classifyJobRoute(` |
| 合同 seam 未删 | **成立**。`dispatchTrackLocalRetrieval` 仍在；rag04 标 prove-shell≠生产 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |
| `pnpm r1-tech-role-fail-closed:prove` | **0** |

## 非宣称

禁止：R4 关闭、「题域已隔离」、生产 track 硬过滤已接线、wrong_track=0 已证、以 rag04/m4/r1 绿关闸、翻 isolation 默认、切 qbank/向量、HA、`releaseEvidence=true`。
