# REQUEST — 北星硬闸 **G7** Local Full-Suite Verification Gate（RAG/路由域 · 文档闸预激活）→ mw-rag-route

**状态**：**draft / await dual · 未生效**（REQUEST / 待审；实现方预写；**禁止自批 pass**；**≠ G7 已生效**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2/R4 closed** · **≠ 0 BUG 已证** · **≠ controlPlaneClosed** · **零 prove / 零 suite run**  
**硬闸**：G1–G6 **已生效**；**G7 = 草案**（镜像 H1：草案 → dual → authorize effective）  
**配对**：`REQUEST-2026-09-16-north-star-g7-local-full-suite-mw-e2e-ha.md`（双域对抗）

---

## 对照（请审 · RAG / 路由面）

| 文件 | 角色 |
|------|------|
| `north-star-hard-gates.md` **G7** | 正文草案；成功唯一标准 = 验证关 |
| `harness/local-full-suite-verification.md` | stub · `not_run` |
| `e2e-requirement-coverage-matrix.md` §1.0 / GAP-RAG-* | 盲区仍诚实；G7 指针 |
| `m4-rag-hard-gates.md` | R1–R5 域门；**≠** G7 替代 |
| `non-happy-path-perf-load-case-matrix.md` §1.5 NHP-R* | RAG case；零 covered |
| R4 REAL-WIRE-IMPL REQUEST / harness | **并行刀**；本 G7 文档闸不阻断 / 不回滚 |

---

## 切片立场

本刀为 **G7 文档闸预激活** 的 rag-route 对抗审。G7 要求：全部切片后站起完整本地环境，跑 **所有** 矩阵 cases + 业务 UCs（含 RAG NEG/FAULT/BOUND/ADV/PERF/LOAD 适用处），产出 CMD+EXIT/CI 收据套件后，才可谈 100% HA / 0 BUG / `releaseEvidence=true`。

**未**跑检索压测 / full suite / live E2E 作绿关。  
**未**宣称 R2/R4 关或 G7 已生效。  
**不得**把 R4 wire 刀绿或 dual 写成交付成功（成功叙事挂 G7）。

不得冒充：

- G7 已生效 / 全量套件已绿  
- R2/R4 closed / 题域已隔离 / wrong_track=0 / sole cutover  
- HA / `releaseEvidence=true` / 0 BUG / controlPlaneClosed  

---

## 请专家回答（文档审 · **零 prove**）

1. **G7 正文是否足够作 SSOT？**（含「验证关是成功唯一标准」；RAG 行亦须进全量套件，不得用单 prove 冒充）  
2. **是否同意：双域通过前 G7 不得改钉生效？**  
3. **是否同意：prove / dual / 刀绿 ≠ 成功，直至 G7？**（含 R4 wire / NHP RAG 刀）  
4. **是否同意：`releaseEvidence=false` 直至 G7 全量套件收据齐？**  
5. RAG PERF/LOAD / NHP-R* 是否仍不得因本刀升 covered？  
6. 本 G7 文档闸是否错误要求暂停 / 回滚 R4 REAL-WIRE-IMPL？（期望：**否** — 可并行，成功挂 G7）  
7. 是否错误宣称 R2/R4 已关或检索容量已证？（期望：**否**）  
8. 阻塞项（若有）是什么？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；**不是** G7 生效授权。  
- 不宣称 covered / HA / `releaseEvidence=true` / R2/R4 closed / 0 BUG / 全量套件已跑。  
- **await dual**；G7 生效须 dual pass + **separate authorize 改钉**。  
- **零 suite run** 本刀；不阻断并行 R4 wire。

---

*REQUEST · mw-rag-route · G7 draft · 2026-09-16 PT · releaseEvidence=false · ≠HA · G7 not yet effective*
