# REQUEST — 非快乐路径 + 分面 PERF/LOAD 矩阵（RAG/路由域）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2/R4 closed** · **≠ sole cutover**  
**配对**：`REQUEST-2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（双域对抗）  
**可选并列**：`mw-model-op`（classify/MODEL-OP binding 面）

---

## 对照（请审 · RAG 相关行）

| 文件 | 角色 |
|------|------|
| `e2e-requirement-coverage-matrix.md` §1.0.1 GAP-RAG-* / §1.0.2 检索 PERF | 盲区旗 |
| `non-happy-path-perf-load-case-matrix.md` §1.5（NHP-R2-* / R4 / R5 / RAG-LOAD） | RAG case ID |
| `harness/non-happy-path-perf-load-matrix.md` §2.2 RAG 命令登记 | 未当本刀绿关 |
| `harness/r2-classify-job-route.md` / `r2-classify-job-route-status.md` | R2 overall NOT closed 诚实（wire 已齐；≠ 路由已生效） |
| `harness/r4-domain-isolation.md` / status | R4 NOT closed |
| `m4-rag-hard-gates.md` | R1–R5 域门 |
| `testing/e2e-performance-evidence.md` / rag eval 基线 | 检索 PERF ≠ 发布 SLO |

---

## 切片立场

本刀在总矩阵中为 RAG/路由行登记 **NEG/FAULT/ADV/PERF/LOAD** 盲区与 case-only ID（NHP-R2-NEG-01、NHP-R2-FAULT-01、NHP-R4-ADV-01、NHP-R5-PERF-01、NHP-RAG-LOAD-01）。  
R2 **生产闭环 wire 已齐**（P-MODEL…P-START、P-FAKE dual-passed；G-R2-5 retrieve-side）；**overall 仍 NOT closed**（≠ 路由已生效；P-LIVE dual 收据齐；仍 ≠ 路由已生效；harness gates）。**未**宣称 R2/R4 关；**未**跑检索压测作容量证据；**未**升 covered。

不得冒充：

- R2 已关 / 路由已生效 / 题域已隔离 / wrong_track=0 已证  
- qbank-pg-eval / adversarial-pg-eval = 发布召回 SLO  
- R5 夹具退役 / sole-stack cutover  
- HA / `releaseEvidence=true`

---

## 请专家复核

1. RAG 行是否仍诚实为 gap/partial/blocked/green-risk，且 PERF/LOAD 为 blind？  
2. case-matrix §1.5 是否错误把 G-R2-5 / r2-prereq EXIT 叙事为 R2 closed？  
3. NHP-R4-ADV-01 是否仍钉 NOT closed？  
4. NHP-RAG-LOAD-01 / NHP-R5-PERF-01 是否禁止用 pgvector 评测机械绿冒充容量/召回 SLO？  
5. 是否同意：RAG 相关 prove **不得**在本双审前由实现方当本刀绿关复跑并回写 covered？

---

## 请专家回答（结论落 reviews/）

1. RAG/路由域盲区与 case 登记是否可接受为 eval-first 预执行基线？  
2. 阻塞项（若有）——尤其是否有假绿措辞需改？  
3. 是否需要并列 `mw-model-op` 才能放行后续 prove？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 R2/R4/R5 关、covered、HA、releaseEvidence=true、sole cutover。  
- 不切 qbank/向量真相；不 flip default；不开 DELETE。  
- 下一刀 = **等待** e2e-ha + 本审（及必要时 model-op）通过后再 prove。

---

*REQUEST · mw-rag-route · 2026-09-16 PT · releaseEvidence=false · ≠HA*
