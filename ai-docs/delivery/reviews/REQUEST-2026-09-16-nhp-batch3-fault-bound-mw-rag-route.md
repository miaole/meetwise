# REQUEST — NHP Batch3 FAULT/BOUND（RAG/路由子集）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~19:15 PT · FAULT FLIPPED honesty 已对齐；见 RECHECK）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2/R4 closed** · **≠ 路由已生效** · **≠ planner leaf 已关** · **≠ wrong_track=0** · **≠ sole cutover**  
**配对**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-e2e-ha.md`（双域对抗）  
**model-op**：本批 **不**并列（无 MODEL-OP live classify / P-LIVE 子集；**不要**加 MODEL-OP live；若专家裁定必须并列，请写入阻塞项）  
**硬闸**：文档闸已生效 · 矩阵文档闸已 pass · Batch1+Batch2 = **post_prove_dual_pass** · **≠** 本批 prove 已自动授权  
**本刀**：**停在 harness/REQUEST**；**未跑** prove · **REQUEST-ready** / **not_run:pre_dual_review** · **未改 R4 wire**
**RECHECK**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md`（对齐 `2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md` **changes_requested** · FAULT FLIPPED）

---

## 对照（请审 · RAG 相关）

| 文件 | 角色 |
|------|------|
| `harness/nhp-batch3-fault-bound.md` §1 行 6–7 | NHP-R4-NEG-01 · NHP-R4-FAULT-01 |
| `eval/nhp-batch3-fault-bound.eval.md` | 延期 R4 ADV/PERF · R5 · LOAD · wire |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | RAG case SSOT · R4-NEG/FAULT |
| `harness` G-R2-5 / G4 dispatch-recheck-prereq | snapshot fail-closed · recheck seam honesty |
| `harness/r4-domain-isolation.md` / status / P-PLANNER | R4 overall NOT closed；planner ≠ 本批关 |
| `m4-rag-hard-gates.md` | R1–R5 域门 |
| Batch1 rag | R2 NEG+FAULT（已过）；**本批不含** R2 两行 ID |
| Batch2 rag | R4-BOUND（已过）；**本批不含** R4-BOUND-01 |
| 前序 | 矩阵 recheck pass；R4 REAL-WIRE / P-PLANNER 历史 ≠ 本批自动绿关；**禁改 wire** |

---

## 切片立场（RAG）

Batch3 **纳入**两条 RAG 相关 honesty（**NHP-R4-NEG-01** + **NHP-R4-FAULT-01**），故 **仍配对** `mw-rag-route`。  
**排除** R4 ADV covered / R4 BOUND（Batch2 已做）/ R4 PERF / R5 PERF / RAG-LOAD / wrong_track ADV runnable-as-covered。  
R4：**overall 仍 NOT closed**；本刀 **未**复跑任何 R4 prove 作绿关；**未**改 REAL-WIRE。  
**model-op**：**不要求**（无 MODEL-OP live）；勿因本批配对 rag-route 而强制加 model-op，除非专家阻塞。

不得冒充：

- R4 已关 / planner leaf 已关 / 题域已隔离 / wrong_track=0  
- `g-r2-5` 绿 = R4 closed / 路由已生效  
- `g4-dispatch-recheck-prereq` EXIT=0 = R4 closed / wrong_track=0 / ADV covered（**FLIPPED** CALL_SITES≥1 ≠ R4 closed；**≠**「无接线」陈旧叙事）  
- qbank-pg-eval = 发布召回 SLO  
- R5 夹具退役 / sole-stack cutover  
- HA / `releaseEvidence=true`  
- 本批非 RAG 行（015/011/017/019/033）由本域单独盖章即可单方开跑（期望：**否**；仍须双域）  
- Batch1 R2 / Batch2 R4-BOUND dual/post-prove = 本批 R4-NEG/FAULT 已授权  
- ADV domain-isolation prove = ADV covered

---

## Batch3 · RAG 子集

| Case ID | CMD（双审后才可谈跑） | EXIT=0 读法（若将来跑） |
|---------|----------------------|-------------------------|
| NHP-R4-NEG-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | 缺/非法 snapshot → degraded denial；禁 unscoped；≠ R4 closed / ≠ 路由已生效 |
| NHP-R4-FAULT-01 | `pnpm g4-dispatch-recheck-prereq:prove` | **FLIPPED（≥1 call site / wire present）** · recheck seam honesty only；**仍 ≠ R4 closed** · **≠ wrong_track=0** · **≠ ADV covered**；本刀不改 wire |

**本批外（RAG）**：NHP-R4-BOUND-01（Batch2 已过）· NHP-R4-ADV-01 / wrong_track（**deferred honesty · ≠ covered**）· NHP-R4-PERF-01 · NHP-R5-PERF-01 · NHP-RAG-LOAD-01 · MODEL-OP P-LIVE · R4 REAL-WIRE 改动。  
**Batch1 RAG（对照 · 不重开）**：NHP-R2-NEG-01 · NHP-R2-FAULT-01。

---

## 请专家复核

1. 将 **R4-NEG + R4-FAULT honesty** 纳入 Batch3、同时 **排除** R4 ADV covered / R4 PERF / R5 / LOAD / wire 改动，是否可接受？  
2. EXIT=0 是否仍被文档钉为 **≠ R4 closed / ≠ planner leaf / ≠ 路由已生效 / ≠ wrong_track=0**？  
3. 是否错误借用历史 G4 / G-R2-5 / P-PLANNER / Batch1 R2 / Batch2 R4-BOUND dual-pass 自动批准本批绿关？（期望：**否**）  
4. 是否需要并列 `mw-model-op` 才放行本批 R4 两行？（实现方默认：**否** · 无 MODEL-OP live；若需要请阻塞）  
5. 是否同意：上述两 CMD **不得**在本双审前由实现方当绿关复跑并回写 covered / R4 closed，且 **禁改 wire**？

---

## 请专家回答（结论落 reviews/）

1. RAG 子集（R4-NEG-01 + R4-FAULT-01）是否可随 Batch3 进入「谈执行」议程？  
2. 阻塞项（若有）——尤其假绿措辞 / 是否强制 model-op / 是否要求先停共享锚复用？  
3. 双审通过前是否继续 **禁 prove**？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 R2/R4/R5 关、planner leaf 关、covered、HA、releaseEvidence=true、sole cutover、路由已生效、wrong_track=0。  
- 不切 qbank/向量真相；不 flip default；不开 DELETE；不加 MODEL-OP live；**不改 R4 wire**。  
- **await dual before prove**；本刀零 prove。

---

*REQUEST · mw-rag-route · NHP Batch3 FAULT/BOUND · 2026-09-16 ~19:15 PT · REQUEST-ready · R4-FAULT FLIPPED honesty · releaseEvidence=false · ≠HA · 零 prove*
