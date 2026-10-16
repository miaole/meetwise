# REQUEST — NHP Batch1 NEG+PERF（RAG/路由子集）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~04:50 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2/R4 closed** · **≠ 路由已生效** · **≠ sole cutover**  
**配对**：`REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md`（双域对抗）  
**model-op**：本批 **不**并列（无 MODEL-OP live classify / P-LIVE 子集；若专家裁定必须并列，请写入阻塞项）  
**硬闸**：文档闸已生效 · 矩阵文档闸已 pass · **≠** 本批 prove 已自动授权  
**本刀**：**停在 harness/REQUEST**；**未跑** prove

---

## 对照（请审 · RAG 相关）

| 文件 | 角色 |
|------|------|
| `harness/nhp-batch1-neg-perf.md` §1 行 6–7 | NHP-R2-NEG-01 / NHP-R2-FAULT-01 |
| `eval/nhp-batch1-neg-perf.eval.md` | 延期 R4/R5/LOAD |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | RAG case SSOT |
| `harness/r2-classify-job-route.md` / status | R2 overall NOT closed（wire 已齐；≠ 路由已生效） |
| `harness` G-R2-5 / g-r2-5 prove | retrieve fail-closed |
| `m4-rag-hard-gates.md` | R1–R5 域门 |
| 前序 | 矩阵 recheck pass；G-R2-5 / R2 P-* 历史 dual ≠ 本批自动绿关 |

---

## 切片立场（RAG）

Batch1 **纳入**两条 RAG 相关 partial 合同钉（NEG + FAULT），**排除** R4 ADV/BOUND/PERF、R5 PERF、RAG-LOAD。  
R2：**wire 已齐**；**overall 仍 NOT closed**（≠ 路由已生效）。  
本刀 **未**复跑 `r2-classify-job-route-prereq:prove` / `g-r2-5-retrieve-fail-closed:prove` 作绿关。

不得冒充：

- R2 已关 / 路由已生效 / 题域已隔离 / wrong_track=0  
- qbank-pg-eval = 发布召回 SLO  
- R5 夹具退役 / sole-stack cutover  
- HA / `releaseEvidence=true`  
- 本批非 RAG 行（001/015/050/033）由本域单独盖章即可单方开跑（期望：**否**；仍须双域）

---

## Batch1 · RAG 子集

| Case ID | CMD（双审后） | EXIT=0 读法 |
|---------|---------------|-------------|
| NHP-R2-NEG-01 | `pnpm r2-classify-job-route-prereq:prove` | ineligible / fail-closed 合同；≠ R2 closed |
| NHP-R2-FAULT-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | 缺 snapshot degraded denial；≠ R2/R4 closed |

**本批外（RAG）**：NHP-R4-* · NHP-R5-PERF-01 · NHP-RAG-LOAD-01 · MODEL-OP P-LIVE 等。

---

## 请专家复核

1. 将 R2 NEG+FAULT 纳入 Batch1、同时 **排除** R4/R5/LOAD，是否可接受？  
2. EXIT=0 是否仍被文档钉为 **≠ 路由已生效 / ≠ R2 closed**？  
3. 是否错误借用历史 P-LIVE / G-R2-5 dual-pass 自动批准本批绿关？（期望：**否**）  
4. 是否需要并列 `mw-model-op` 才放行本批 RAG 两行？（实现方默认：**否**；若需要请阻塞）  
5. 是否同意：RAG 两 prove **不得**在本双审前由实现方当绿关复跑并回写 covered？

---

## 请专家回答（结论落 reviews/）

1. RAG 子集是否可随 Batch1 进入「谈执行」议程？  
2. 阻塞项（若有）——尤其假绿措辞 / 是否强制 model-op？  
3. 双审通过前是否继续 **禁 prove**？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 R2/R4/R5 关、covered、HA、releaseEvidence=true、sole cutover、路由已生效。  
- 不切 qbank/向量真相；不 flip default；不开 DELETE。  
- **await dual before prove**。

---

*REQUEST · mw-rag-route · NHP Batch1 NEG+PERF · 2026-09-16 ~04:50 PT · releaseEvidence=false · ≠HA*
