# REQUEST — G7-K2 · R4 sole-cutover doc pin **post-prove** → mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16 ~19:50 PT  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ sole cutover done** · **≠ suite green**  
**配对**：`REQUEST-2026-09-16-g7-k2-r4-sole-cutover-doc-pin-post-prove-mw-rag-route.md`  
**硬闸**：pre-exec dual **pass** · meetwise authorize docs+prove  
**前序**：`2026-09-16-g7-k2-r4-sole-cutover-doc-pin-mw-e2e-ha.md`（pass）

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/g7-k2-r4-sole-cutover-doc-pin.md` | knife · executed |
| `harness/r4-domain-isolation-status.md` | **≠ sole cutover** pin landed |
| `pnpm mysql-stack:r4-domain-isolation:prove` | prove |

---

## Post-prove CMD+EXIT（实现方 · 2026-09-16 ~19:50 PT · 待专家复跑）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm mysql-stack:r4-domain-isolation:prove`** | **0** | status pins **≠ sole cutover** · ≠ R4 closed · ≠ 题域已隔离 · ≠ wrong_track=0 covered |

**未跑 / 未动**：MAIN sole∩scor-00 · flip default · ADV wire · suite green claim

---

## 请专家回答（Q1–Q6）

1. EXIT=0 是否仍 = **doc pin honesty**（非 题域已隔离）？  
2. Status 是否显式 **≠ sole cutover**，且未宣称 sole cutover done / R4 closed？  
3. wrong_track / ADV / LIVE_PG 是否仍开（本刀未关）？  
4. scor-00/R5 是否仍 **out of knife**？  
5. 独立复跑 EXIT？  
6. 禁 flip default / self-approve / suite green？

请写入 `reviews/2026-09-16-g7-k2-r4-sole-cutover-doc-pin-post-prove-mw-e2e-ha.md`。**禁止**实现方代写 pass。

---

*REQUEST · mw-e2e-ha · G7-K2 post-prove · 2026-09-16 ~19:50 PT · releaseEvidence=false · ≠HA · ≠ R4 closed*
