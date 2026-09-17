# 评测笔记 — NHP Batch1 · 第一批 NEG+PERF（scoped · eval-first）

**日期**：2026-09-16（~05:00 PT · post-prove 回执）  
**run-status**：**`post_prove_dual_pass`**（两个 post-prove 专家审查均 pass；原 `executed:awaiting_post_prove_dual` / `not_run:pre_dual_review` 已清）  
**releaseEvidence=false** · **≠HA** · **case-only / partial / honesty-pin / blocked ≠ covered**  
**对照 harness**：`ai-docs/delivery/harness/nhp-batch1-neg-perf.md`  
**对照全表**：`ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`  
**对照父矩阵闸**：`reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（双域文档闸 **pass**；**≠** prove 笼统授权）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）  
**post-prove 双审回执**：

- `ai-docs/delivery/reviews/2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md` — **pass**（仅本批 honesty/NEG 子集）
- `ai-docs/delivery/reviews/2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md` — **pass**（仅本批 honesty 收据）
- 双审 pass **仍 ≠ covered**；EXIT=0 **≠** covered，且不代表 R2/R4/HA/SLO/LOAD 已关或 `releaseEvidence=true`

**专家范围**：`mw-e2e-ha` + `mw-rag-route`（**无** model-op）

---

## 1. 用途

在矩阵双域文档闸已齐、硬闸文档闸已生效、pre-exec dual pass、meetwise-core 授权本批 CMD 的前提下，记录 **第一批执行切片** 的新鲜 EXIT 与诚实读法，并记录 **post-prove** 双独立审结果。

本笔记 **禁止**因 EXIT=0 而把任何行升 `covered`，或把 Key-unset / DELETE=503 / R2 合同钉写成 R2/R4/HA/SLO 已关。

---

## 2. Batch1 case ID 列表

| Case ID | 列 | 旗 | 备注 |
|---------|----|----|------|
| NHP-001-NEG-01 | NEG | case-only | `neg:auth` 旁证；主链仍未齐 |
| NHP-001-PERF-api-01 | PERF_api | case-only / blind | Key-unset `uc001:live-blocked:prove`；≠ SLO |
| NHP-015-NEG-01 | NEG | partial | `uc015:ingest-failures:prove` |
| NHP-050-NEG-01 | NEG | partial / honesty-pin | `privacy-erasure:http:prove`；DELETE=503 |
| NHP-033-NEG-01 | NEG | partial | `uc033:cross-user-authz:prove` |
| NHP-R2-NEG-01 | NEG | partial | `r2-classify-job-route-prereq:prove`；≠ R2 关 |
| NHP-R2-FAULT-01 | FAULT | partial | `g-r2-5-retrieve-fail-closed:prove`；≠ R2/R4 关 |

---

## 3. 执行记录（本环境 · ~05:00 PT）

| CMD / 动作 | 期望 | 实测 EXIT | 读法 |
|------------|------|-----------|------|
| `pnpm neg:auth` | 0 | **0** | case-only auth 旁证 ≠ UC-001 covered |
| `pnpm uc001:live-blocked:prove` | 0 | **0** | Key-unset blocked honesty ≠ PERF SLO |
| `pnpm uc015:ingest-failures:prove` | 0 | **0** | partial ≠ OCR FAULT/LOAD |
| `pnpm privacy-erasure:http:prove` | 0 | **0** | DELETE=503 pin ≠ erasure complete |
| `pnpm uc033:cross-user-authz:prove` | 0 | **0** | partial ≠ ADV齐/PERF |
| `pnpm r2-classify-job-route-prereq:prove` | 0 | **0** | ≠ R2 closed / ≠ 路由已生效 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | 0 | **0** | ≠ R2/R4 closed |
| `e2e:isolated` / `verify:e2e-performance` / LOAD / 云 / HA | — | **未跑**（禁） | deferred / blocked |
| 实现方自签 post-prove pass | — | **未做**（禁） | 专家独立写 reviews/ |

**环境注记**：首轮无 Docker → 部分 isolated 目标 `bounded_command_spawn_failed`；装启 docker 后重跑得上表。**≠** HA / sole-stack。

---

## 4. 延期（deferred · 明确不在 Batch1）

| 延期项 | 原因 |
|--------|------|
| 全部 `NHP-*-LOAD-*` / `NHP-LOAD-WORKER-SUITE` | 禁容量绿；无积压收据 |
| `NHP-PERF-API-SUITE` 全量 / `verify:e2e-performance` | 本批仅 001 Key-unset honesty |
| `NHP-001-PERF-web-01` / PERF_web | UI/真机预算未冻结 |
| `NHP-PERF-CLOUD` / 云 kill / HA failover | blocked / out-of-scope |
| `NHP-001-FAULT-01` / 015-FAULT / 050-FAULT | FAULT 注入面另批 |
| `NHP-015-BOUND-01`（本批未点名） | 可由 uc015 同 prove 服务，但 Batch1 ID 表未纳入以免扩面 |
| `NHP-R4-*` / `NHP-R5-PERF-01` / `NHP-RAG-LOAD-01` | R4 NOT closed（且本批不接线）；R5 green-risk；LOAD blind |
| MODEL-OP live classify（P-LIVE 等） | 非本批；故无 mw-model-op REQUEST |

---

## 5. 审查勾选（供专家 · 非实现方自勾 pass）

- [ ] 未宣称 covered / HA / `releaseEvidence=true` / LOAD 绿 / 路由已生效 / R2·R4 关  
- [ ] 7 IDs 均有新鲜 CMD + EXIT 诚实读法；blind/gap 未沉默  
- [ ] PERF 仅 honesty/blocked pin，未冒充 P95 SLO  
- [x] EXIT=0 未抬 covered；post-prove 双审已回写且仅限 honesty 收据  
- [ ] RAG 两行未把 R2/R4 叙事为已关  
- [x] 结论由专家写入 `reviews/`（非本文件自签）；双审 pass 仍不抬 covered

---

*Eval note · NHP Batch1 · 2026-09-16 ~05:00 PT · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ covered*
