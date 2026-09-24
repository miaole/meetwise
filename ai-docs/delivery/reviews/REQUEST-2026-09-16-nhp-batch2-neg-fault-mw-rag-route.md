# REQUEST — NHP Batch2 NEG/FAULT/BOUND（RAG/路由子集）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~05:21 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2/R4 closed** · **≠ 路由已生效** · **≠ planner leaf 已关** · **≠ sole cutover**  
**配对**：`REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md`（双域对抗）  
**model-op**：本批 **不**并列（无 MODEL-OP live classify / P-LIVE 子集；**不要**加 MODEL-OP live；若专家裁定必须并列，请写入阻塞项）  
**硬闸**：文档闸已生效 · 矩阵文档闸已 pass · Batch1 = **post_prove_dual_pass** · **≠** 本批 prove 已自动授权  
**本刀**：**停在 harness/REQUEST**；**未跑** prove · **REQUEST-ready** / **not_run:pre_dual_review**

---

## 对照（请审 · RAG 相关）

| 文件 | 角色 |
|------|------|
| `harness/nhp-batch2-neg-fault.md` §1 行 7 | NHP-R4-BOUND-01 |
| `eval/nhp-batch2-neg-fault.eval.md` | 延期 R4 ADV/NEG/FAULT/PERF · R5 · LOAD |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | RAG case SSOT · NHP-R4-BOUND-01 |
| `harness` G4 production-scoped-retrieve | 主叶 scoped honesty |
| `harness/r4-domain-isolation.md` / status / P-PLANNER | R4 overall NOT closed；planner ≠ 本批关 |
| `m4-rag-hard-gates.md` | R1–R5 域门 |
| Batch1 rag REQUEST/审 | Batch1 含 R2 NEG+FAULT（已过）；**本批不含** R2 两行 |
| 前序 | 矩阵 recheck pass；R4 REAL-WIRE / P-PLANNER 历史 ≠ 本批自动绿关 |

---

## 切片立场（RAG）

Batch2 **纳入**一条 RAG 相关 BOUND honesty（**NHP-R4-BOUND-01**），故 **仍配对** `mw-rag-route`。  
**排除** R4 ADV/NEG/FAULT/PERF、R5 PERF、RAG-LOAD、wrong_track ADV runnable。  
R4：**overall 仍 NOT closed**；本刀 **未**复跑 `g4-production-scoped-retrieve:prove` 作绿关。  
**model-op**：**不要求**（无 MODEL-OP live）；勿因本批配对 rag-route 而强制加 model-op，除非专家阻塞。

不得冒充：

- R4 已关 / planner leaf 已关 / 题域已隔离 / wrong_track=0  
- 主叶 scoped prove 绿 = full dispatch / R4 closed  
- qbank-pg-eval = 发布召回 SLO  
- R5 夹具退役 / sole-stack cutover  
- HA / `releaseEvidence=true`  
- 本批非 RAG 行（002/010/011/017/018/019）由本域单独盖章即可单方开跑（期望：**否**；仍须双域）  
- Batch1 R2 dual/post-prove = 本批 R4-BOUND 已授权

---

## Batch2 · RAG 子集

| Case ID | CMD（双审后才可谈跑） | EXIT=0 读法（若将来跑） |
|---------|----------------------|-------------------------|
| NHP-R4-BOUND-01 | `pnpm g4-production-scoped-retrieve:prove` | 主叶 scoped only honesty；≠ R4 closed / ≠ planner leaf / ≠ full dispatch |

**本批外（RAG）**：NHP-R4-NEG/FAULT/ADV/PERF · NHP-R5-PERF-01 · NHP-RAG-LOAD-01 · wrong_track ADV · MODEL-OP P-LIVE 等。  
**Batch1 RAG（对照 · 不重开）**：NHP-R2-NEG-01 · NHP-R2-FAULT-01（已 `post_prove_dual_pass`）。

---

## 请专家复核

1. 将 **仅** R4-BOUND honesty 纳入 Batch2、同时 **排除** R4 ADV/NEG/FAULT/PERF / R5 / LOAD / wrong_track ADV，是否可接受？  
2. EXIT=0 是否仍被文档钉为 **≠ R4 closed / ≠ planner leaf / ≠ 路由已生效**？  
3. 是否错误借用历史 G4 / P-PLANNER / Batch1 R2 dual-pass 自动批准本批绿关？（期望：**否**）  
4. 是否需要并列 `mw-model-op` 才放行本批 R4-BOUND 一行？（实现方默认：**否** · 无 MODEL-OP live；若需要请阻塞）  
5. 是否同意：`g4-production-scoped-retrieve:prove` **不得**在本双审前由实现方当绿关复跑并回写 covered / R4 closed？

---

## 请专家回答（结论落 reviews/）

1. RAG 子集（R4-BOUND-01）是否可随 Batch2 进入「谈执行」议程？  
2. 阻塞项（若有）——尤其假绿措辞 / 是否强制 model-op？  
3. 双审通过前是否继续 **禁 prove**？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 R2/R4/R5 关、planner leaf 关、covered、HA、releaseEvidence=true、sole cutover、路由已生效。  
- 不切 qbank/向量真相；不 flip default；不开 DELETE；不加 MODEL-OP live。  
- **await dual before prove**；本刀零 prove。

---

*REQUEST · mw-rag-route · NHP Batch2 NEG/FAULT/BOUND · 2026-09-16 ~05:21 PT · REQUEST-ready · releaseEvidence=false · ≠HA · 零 prove*
