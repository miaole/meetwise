# REQUEST — G7-K1 · `r2-p-live` status lifecycle **post-prove** → mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16 ~19:50 PT  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2 closed** · **≠ verbal route-effective** · **≠ suite green**  
**配对**：`REQUEST-2026-09-16-g7-k1-r2-p-live-status-lifecycle-post-prove-mw-e2e-ha.md`  
**硬闸**：pre-exec dual **pass** · meetwise authorize docs+prove  
**前序 pre-exec**：`2026-09-16-g7-k1-r2-p-live-status-lifecycle-mw-rag-route.md`（pass）

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/g7-k1-r2-p-live-status-lifecycle.md` | knife |
| `harness/r2-classify-job-route-status.md` | SSOT |
| `pnpm r2-p-live-route-effective:prove` | prove EXIT=0（实现方） |

---

## Post-prove CMD+EXIT（实现方 · 2026-09-16 ~19:50 PT · 待专家复跑）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r2-p-live-route-effective:prove` | **0** | lifecycle pin aligned · **≠** 路由已生效 · **R2 NOT closed** · GAP-RAG-02 still open |

---

## 请专家回答（Q1–Q5）

1. Status lifecycle 是否与 prove pin **共同**诚实（含 await authorize），且未虚假宣称 CLOSED/已生效？  
2. R2 overall / GAP-RAG-02 / m4 §R2 是否仍开？  
3. EXIT=0 ≠ claim R2 / ≠ verbal route-effective？  
4. 独立复跑 EXIT？  
5. 禁 silent prove weaken / self-approve？

请写入 `reviews/2026-09-16-g7-k1-r2-p-live-status-lifecycle-post-prove-mw-rag-route.md`。**禁止**实现方代写 pass。

---

*REQUEST · mw-rag-route · G7-K1 post-prove · 2026-09-16 ~19:50 PT · releaseEvidence=false · ≠ R2 closed*
