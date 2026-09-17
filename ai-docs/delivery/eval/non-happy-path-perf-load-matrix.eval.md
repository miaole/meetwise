# 评测笔记 — 非快乐路径 + 分面 PERF/LOAD 矩阵（eval-first）

**日期**：2026-09-16（PT）  
**releaseEvidence=false** · **≠HA** · **case-only / partial / blind / GAP ≠ covered**  
**对照 harness**：`ai-docs/delivery/harness/non-happy-path-perf-load-matrix.md`  
**对照用例全表**：`ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`  
**对照矩阵**：`ai-docs/delivery/e2e-requirement-coverage-matrix.md` **§0.5 / §1.0**  
**待审专家**：`mw-e2e-ha` + `mw-rag-route`（RAG 行；model-op 可并列）

---

## 1. 用途

从 UC / requirements 派生非快乐路径与分面性能/负载评测用例，写入矩阵强制列（NEG·FAULT·BOUND·ADV·PERF·LOAD + PERF_api / PERF_web / LOAD_worker），并标出当前 **happy-only 盲区**。  
**禁止**因本笔记存在而把任何矩阵行改为 `covered`，或把本刀未跑的命令写成已通过。

---

## 2. 执行记录（本环境 · 本刀）

| CMD / 动作 | 期望 | 实测 | 读法 |
|------------|------|------|------|
| 写 case-matrix / harness / §0.5·§1.0 扩列 | 文档落地 | **已做** | 叙事完备 ≠ 证据 |
| 写 REQUEST 双审包 | 预写待审 | **已做** | ≠ pass |
| `pnpm e2e:isolated` / `verify:e2e-performance` / 云 TC / HA prove | — | **未跑**（禁绿关） | `not_run:pre_dual_review` |
| 既有 uc015/017/010/… prove 复跑 | — | **未跑**（本刀） | 不借旧绿关新列 |

复跑纪律（**仅双审通过后**）：

```bash
cd /workspace/meetwise
# 由专家决定子集；实现方不自批
# 勿在本刀：pnpm e2e:isolated / verify:e2e-performance
```

---

## 3. 已标记盲区（摘要）

| 区域 | 旗 | 说明 |
|------|-----|------|
| UC-E2E-001 NEG/BOUND/ADV | blind → case-only | 黄金路径主叙事快乐盲区 |
| 几乎所有 PERF_api / PERF_web / LOAD_worker | blind / not_run / case-only | 无当前分面收据；本地绿 ≠ 生产容量 |
| UC-E2E-004/025/027/028 等 | gap | 产品/图未接线 |
| UC-E2E-031/032 ADV e2e | gap(e2e) | 禁 fake-model 冒充 |
| GAP-RAG-02/04 | partial/gap | R2 **wire 已齐**（P-MODEL…P-START/P-FAKE dual-passed；G-R2-5）；**overall NOT closed**（≠ 路由已生效；P-LIVE dual 收据齐；仍 ≠ 路由已生效）；R4 NOT closed；NHP-R4-NEG/FAULT/BOUND/ADV/PERF 已登记；FOLLOW dispatch-recheck **await dual**（禁 prove 绿关） |
| TC-CLOUD / THR | blocked | 无授权 |
| HA×LOAD | conn-only/stub | ≠HA |
| UI 支付拒绝 / 云 kill·跨 AZ / 多副本 failover·RTO | gap/out-of-scope | 显式具名（B2）；禁沉默未列 |

完整表见 case-matrix §1–§2 与矩阵 §1.0.1–§1.0.2。

---

## 4. 矩阵交叉引用

| 位置 | 要点 |
|------|------|
| §0.5 | 六列 + 分面定义；`case-only` 词汇 |
| §1.0.1 | NEG/FAULT/BOUND/ADV 盲区 |
| §1.0.2 | PERF_api / PERF_web / LOAD_worker |
| §1.0.3 | 合计：零全绿；零 PERF covered |
| §2 假绿清单 | BUG-FAKE-R5 / E2E-ISO / QBANK-EVAL 等仍生效 |
| `testing/e2e-performance-evidence.md` | PERF 门 not_run / 过期回执边界 |

---

## 5. 审查勾选（供专家 · 非实现方自勾 pass）

- [ ] 未宣称 covered / sole-stack migrated / releaseEvidence=true / HA  
- [ ] BOUND + LOAD + 分面列已进入 §0.5/§1.0，且缺列读为 blind/gap/not_run  
- [ ] case-only 明确 ≠ 已执行  
- [ ] 本刀无 prove 绿关；REQUEST 仅为待审  
- [ ] RAG 行未把 R2/R4/R5 叙事为已关  
- [ ] 结论由专家写入 `reviews/`（非本文件自签）

---

*Eval note · 2026-09-16 PT · releaseEvidence=false · ≠HA · 未执行*
