# REQUEST — G7-K1 · `r2-p-live` status lifecycle **post-prove** → mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16 ~19:50 PT  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2 closed** · **≠ verbal route-effective** · **≠ suite green**  
**配对**：`REQUEST-2026-09-16-g7-k1-r2-p-live-status-lifecycle-post-prove-mw-rag-route.md`（**不替代**本域）  
**硬闸**：pre-exec dual **pass** · meetwise authorize docs+prove  
**前序 pre-exec**：`2026-09-16-g7-k1-r2-p-live-status-lifecycle-mw-e2e-ha.md`（pass · 文档闸 only）  
**本刀**：status lifecycle pin 对齐 + prove；**不采信**实现方自报 EXIT；请专家 **独立复跑**并写入 `reviews/`

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/g7-k1-r2-p-live-status-lifecycle.md` | knife · `executed:awaiting_post_prove_dual` |
| `harness/r2-classify-job-route-status.md` | SSOT lifecycle pin |
| `apps/worker/test/r2-p-live-route-effective.proof.ts` | prove |
| `g7-honesty-knives.slice.md` | parent slice |

---

## Post-prove CMD+EXIT（实现方 · 2026-09-16 ~19:50 PT · 待专家复跑）

| CMD | EXIT（实现方） | 诚实读法 |
|-----|----------------|----------|
| **`pnpm r2-p-live-route-effective:prove`** | **0** | lifecycle pin（P-LIVE CLOSED pending dual-review → dual receipts → await authorize）· **≠** verbal 生效 · **R2 NOT closed** |

OK 行：`OK  r2-p-live-route-effective prove (P-LIVE CLOSED pending dual: … R2 NOT closed … ≠ verbal 生效; releaseEvidence=false; Not HA)`

**未跑（禁）**：live MODEL Key invent · claim 路由已生效 · close R2 · suite green · HA

---

## 请专家回答（Q1–Q6）

1. EXIT=0 是否仍读作 **lifecycle honesty pin**（而非「路由已生效」）？  
2. Status 是否诚实保留 **R2 NOT closed** · **≠ verbal 生效** · `releaseEvidence=false`？  
3. 是否禁止把本绿写成 R2 closed / suite green / HA / covered？  
4. Lifecycle 阶段名是否未塌成「已生效」？  
5. 独立复跑 EXIT 是否为 0？  
6. 禁 invent Key / flip default / self-approve？

请将结论写入 `reviews/2026-09-16-g7-k1-r2-p-live-status-lifecycle-post-prove-mw-e2e-ha.md`。**禁止**实现方代写 pass。

---

*REQUEST · mw-e2e-ha · G7-K1 post-prove · 2026-09-16 ~19:50 PT · releaseEvidence=false · ≠HA · ≠ R2 closed*
