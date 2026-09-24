# REQUEST — G7 Local Full-Suite **post-run** → mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-17（~02:07 PDT · post-suite）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ suite green** · **≠ R2/R4 closed** · **≠ wrong_track=0** · **≠ ADV covered**  
**G7 policy ≠ this run green** · **EXIT=0 ≠ R2/R4 closed ≠ 路由已生效**  
**配对**：`REQUEST-2026-09-17-g7-full-suite-post-run-mw-e2e-ha.md`  
**权威**：meetwise 【授权执行·G7 全套】W8 part 2 · inventory §4

---

## 对照

- Receipt：**`ai-docs/delivery/receipts/2026-09-17-g7-full-suite-run.md`**
- Prior inventory：`receipts/2026-09-16-g7-full-suite-run.md`
- Harness：`harness/local-full-suite-verification.md` · R2/R4 harness 叶 · `r4-wrong-track-adv*`  
- Logs：`.tmp/g7-suite-logs-2026-09-17/`（含 `r2_*` · `r4_*` · `mysql_r4_domain` · `g_r2_5_*`）
- Docs tip at suite start：`5508e5b`

---

## 切片立场（RAG / route 面）

本跑含 R2 classify/live、G-R2-5 retrieve fail-closed、G4 dispatch recheck、R4 real-wire / planner unit / wrong_track ADV、mysql-stack r4-domain-isolation、scor-00、worker-wakeup*。  
**R2/R4 proves EXIT=0 = honesty/wire/unit only** — **≠ R2 overall closed** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ ADV covered** · **≠ 笼统宣称路由已生效**。  
`r4-wrong-track-adv:prove` EXIT=0 仍 **DEFERRED ADV honesty**（wire≠ADV）。  
`r2-p-live-route-effective:prove` **EXIT=0**（今次；prior 为 1）— **仍不得**读成「路由已生效」。  
`mysql-stack:r4-domain-isolation:prove` **EXIT=0**（今次；prior 为 1）— **仍不得**读成题域已隔离 / ADV covered。  
Sole-stack MySQL+Qdrant+Redis healthy；UC isolated 默认 pgvector → **R5 green-risk**。  
本 REQUEST **不是** pass · **≠** `post_suite_dual_pass`。

---

## R2/R4 相关 EXIT（摘）

| CMD | EXIT | 读法 |
|-----|------|------|
| `r2-classify-job-route-prereq:prove` | 0 | ≠ R2 closed |
| `r2-p-*-route-classify:prove`（worker/api/loop/start/fake） | 0 | wire honesty ≠ closed |
| `r2-p-live-route-effective:prove` | **0** | ≠ 路由已生效（EXIT flip ≠ claim） |
| `g-r2-5-retrieve-fail-closed:prove` | 0 | ≠ R4 closed |
| `g4-dispatch-recheck-prereq:prove` | 0 | FLIPPED seam ≠ R4 closed ≠ ADV |
| `g4-production-scoped-retrieve:prove` | 0 | scoped honesty ≠ R4 closed |
| `r4-real-wire-impl:prove` | 0 | wire ≠ R4 closed |
| `r4-p-planner-unit:prove` | 0 | unit ≠ planner leaf 关 |
| `r4-wrong-track-adv:prove` | 0 | ADV deferred · ≠ covered |
| `mysql-stack:r4-domain-isolation:prove` | **0** | ≠ ADV / ≠ 题域已隔离（EXIT flip ≠ claim） |

全表见 receipt（**45×0 / 0×nonzero / 3×Key-blocked** · **≠ suite green**）。

---

## 请专家回答

1. 是否有任何文案把 R2/R4 prove 绿或本 suite 跑写成 **R2/R4 closed / 路由已生效 / wrong_track=0 / ADV covered / 题域已隔离**？  
2. prior EXIT=1 今次 EXIT=0（`r2-p-live` · `mysql-stack:r4-domain-isolation`）是否被误冲销为 covered / closed？（期望：**否**）  
3. `r4-wrong-track-adv:prove` EXIT=0 是否仍 **≠ ADV covered**？  
4. sole-stack healthy + qdrant 是否被误写成 RAG 已迁 / R5 关？（期望：**否**；pgvector UC = R5 risk）  
5. 配对 `mw-e2e-ha` 冲突时是否取更严？本域 pass 是否 **仍 ≠ suite green / ≠ releaseEvidence / ≠ post_suite_dual_pass**？  
6. 独立 dual 完成前是否仍禁止宣称 0 BUG / 生产 HA？

---

## 非宣称

- 不宣称 R2/R4 closed / 路由已生效 / wrong_track=0 / ADV covered / sole cutover / suite green / HA / `releaseEvidence=true` / `post_suite_dual_pass`  
- 不自批 pass · await independent dual

---

*REQUEST · mw-rag-route · G7 full-suite post-run · 2026-09-17 ~02:07 PDT · executed:awaiting_post_suite_dual · releaseEvidence=false · ≠HA · ≠R2/R4 closed · suite green NOT claimed*
