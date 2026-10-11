# Harness — 非快乐路径 + 分面 PERF/LOAD 矩阵（eval-first · 预执行）

**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **本绿不存在（本刀未执行）**  
**日期**：2026-09-16（PT）  
**对照矩阵**：`e2e-requirement-coverage-matrix.md` **§0.5 / §1.0**  
**对照用例全表**：`delivery/non-happy-path-perf-load-case-matrix.md`  
**对照 eval**：`delivery/eval/non-happy-path-perf-load-matrix.eval.md`  
**对照硬闸**：`north-star-hard-gates.md` G1–G6 · `impl-review-gate.md`  
**专家（执行前双审）**：`mw-e2e-ha` + `mw-rag-route`（RAG/路由行；model-op 可并列）  
**MODEL_API_KEY**：本 harness **不要求**本刀执行；未来 live 子集有 Key 才可跑，无 Key = **blocked**（勿硬跑）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 本刀目标 | **写**用例/矩阵列/harness/REQUEST；对齐 G2/G6 强制列（NEG·FAULT·BOUND·ADV·PERF·LOAD + 分面） |
| 本刀禁止 | 跑 prove / `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA probe **作为绿关** |
| 假绿禁令 | partial / GAP / blind / case-only / honesty-pin / not_run / conn-only **≠** covered |
| 叙事 | **叙事 ≠ 证据**；无 CMD+EXIT 不得当通过 |
| 自批 | 实现方 **禁止**自签 `reviews/` pass；仅预写 `REQUEST-*` |
| HA / 发布 | **≠HA**；`releaseEvidence=false` 直至证据齐 |

---

## 1. 测什么（列合同）

| 列 | 最低验收 | 本刀状态 |
|----|----------|----------|
| NEG | 每关键 UC 有负路径 case ID 或显式 blind/gap | **已登记**（见 case-matrix） |
| FAULT | 故障注入 case 或显式 blind/gap | **已登记** |
| BOUND | 边界 case 或显式 blind/gap | **已登记**（§1.0 扩列） |
| ADV | 对抗 case 或显式 blind/gap | **已登记** |
| PERF_api / PERF_web | 可复现命令+形状+收据路径或 blind/not_run | **case-only**；**未跑** |
| LOAD_worker | 可复现负载形状+收据或 blind | **case-only**；**未跑** |

快乐路径盲区主旗：`UC-E2E-001` · 全表 PERF/LOAD 分面 · RAG R2/R4/R5 · 云 blocked。

---

## 2. 命令与期望 EXIT（登记 · **本刀不执行**）

> 下表供双审后下一刀使用。本刀对所有「执行」行记 **`not_run:pre_dual_review`**。

### 2.1 静态 / 诚实钉（未来可跑；≠ 业务 covered）

| CMD | 期望 EXIT | 诚实读法 |
|-----|-----------|----------|
| （未来）静态 cite：矩阵 §0.5/§1.0 + case-matrix + 本 harness + eval 交叉引用 | 0 | 仅文档完备；**≠** 非快乐路径已执行 |
| `pnpm mysql-stack:r5-mark-red:prove` | 0 | 标红钉；≠ R5 关 |
| `pnpm uc001:live-blocked:prove` | 0 | blocked(无 Key) honesty；≠ live covered |

### 2.2 既有非快乐旁证（**禁止**本刀复跑作绿关；双审后由专家决定是否复跑）

| CMD | 期望 EXIT | 服务列 | ≠ covered 因为 |
|-----|-----------|--------|-----------------|
| `pnpm uc015:ingest-failures:prove` | 0 | NEG/BOUND | partial；R5；缺 OCR 宕 FAULT/LOAD |
| `pnpm uc017:orphan:prove` | 0 | FAULT/BOUND | 未进 isolated HTTP/SSE |
| `pnpm uc010:sse-resume:prove` | 0 | FAULT/NEG | 缺跨副本 PERF |
| `pnpm uc011:report-refund:http:prove` | 0 | NEG/FAULT/BOUND | refund-callback GAP |
| `pnpm uc018:abandon:http:prove` | 0 | NEG/BOUND | 缺 full.e2e/TTL |
| `pnpm uc019:report-regenerate:http:prove` | 0 | FAULT/BOUND | regenerateAttempt GAP |
| `pnpm uc033:cross-user-authz:prove` | 0 | NEG/ADV/BOUND | 七类未齐；X10≠SLO |
| `pnpm privacy-erasure:http:prove` | 0 | NEG honesty-pin | ≠ 删除闭环 |
| `pnpm r2-classify-job-route-prereq:prove` | 0 | RAG NEG | ≠ R2 关 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | 0 | RAG FAULT | ≠ R2/R4 closed |
| `pnpm mysql-stack:r4-domain-isolation:prove` | 0 | RAG ADV | NOT closed honesty |
| `pnpm g4-dispatch-recheck-prereq:prove` | 0 | RAG BOUND/FAULT honesty | ≠ full wire / ≠ R4 closed；FOLLOW await dual |

### 2.3 PERF / LOAD（登记；当前 **not_run** / **blocked**）

| CMD | 期望 | 本刀状态 | 禁令 |
|-----|------|----------|------|
| `pnpm verify:e2e-performance` | 分门收据；`releaseEvidence=false` | **not_run**（历史过期） | 不得把历史毫秒当当前容量 |
| `pnpm e2e:isolated` | 有 Key→业务 EXIT；无 Key→**blocked** | **blocked**/勿跑 | 终态秒数 ≠ PERF_api |
| `pnpm e2e:ui:isolated` | 同上 | **blocked**/勿跑 | ≠ PERF_web SLO |
| 云 `THR-CLOUD-*` | 授权后三联跑 | **blocked** | 无 TargetGrant 禁止硬跑 |
| `pnpm ha:fault-inject:stub` / nest-session | stub EXIT | **conn-only** | ≠ HA / ≠ LOAD covered |

### 2.4 本刀显式不跑

```bash
# 本刀禁止执行（预双审）：
# pnpm e2e:isolated
# pnpm verify:e2e-performance
# pnpm e2e:ui:isolated
# 任意云破坏性 TC / 生产 probe
# 用上述 EXIT=0 回写矩阵 covered
```

---

## 3. 假绿标红表

| 风险 | 错误读法 | 正确读法 |
|------|----------|----------|
| case-matrix 存在 | 「非快乐路径已覆盖」 | **case-only**；未执行 |
| §1.0 partial | 「该列已齐」 | 继承旧 prove；≠ covered |
| isolated EXIT=0 | 「001 + PERF 已证」 | happy-only 风险；PERF 仍 blind |
| 413 / X10 | 「LOAD 已证」 | 单点边界 ≠ 负载 |
| R2/R5 prove | 「路由/召回就绪」 | honesty / green-risk |
| HA stub | 「HA/负载叠加已证」 | Not HA |

---

## 4. 抬升条件（将来 · 非本刀）

1. `mw-e2e-ha` + `mw-rag-route`（或 model-op）**独立**审通过本 harness + case-matrix + §1.0。  
2. 按 case ID 实现/接线缺失 prove（仍 eval-first）。  
3. 执行得 CMD+EXIT+收据；回写 §1.0 诚实状态。  
4. **仍禁止**无双域审写 covered / `releaseEvidence=true` / HA。

---

## 5. REQUEST 指针

- `reviews/REQUEST-2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（矩阵文档闸 · 已 dual-pass）
- `reviews/REQUEST-2026-09-16-non-happy-perf-matrix-mw-rag-route.md`（矩阵文档闸 · 已 dual-pass）
- **第一批执行路径（NEG+PERF）**：**`post_prove_dual_pass`**（已跑 CMD + post-prove 双审 pass · 仍 ≠ covered）
  - `delivery/nhp-batch1-neg-perf.slice.md`
  - `harness/nhp-batch1-neg-perf.md` · `eval/nhp-batch1-neg-perf.eval.md`
  - pre-exec + post-prove REQUEST/reviews 见 Batch1 harness §5
- **第二批执行路径（NEG/FAULT/BOUND · `post_prove_dual_pass` · honesty only）**：
  - `delivery/nhp-batch2-neg-fault.slice.md`
  - `harness/nhp-batch2-neg-fault.md` · `eval/nhp-batch2-neg-fault.eval.md`
  - `reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md`
  - `reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md`（R4-BOUND 在批 · 仍配对；**无** model-op）
  - `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md` · **pass（honesty/partial only）**
  - `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md` · **pass（honesty only）**
  - 状态：`post_prove_dual_pass` · **仅 honesty/partial** · ≠ covered / R2 / R4 / HA
- **第三批执行路径（FAULT/BOUND + R4 NEG/FAULT honesty · `post_prove_dual_pass` · honesty only）**：
  - `delivery/nhp-batch3-fault-bound.slice.md`
  - `harness/nhp-batch3-fault-bound.md` · `eval/nhp-batch3-fault-bound.eval.md`
  - `reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md`
  - `reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md`（R4-NEG+FAULT 在批 · 仍配对；**无** model-op；**不改 wire**）
  - `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md` · **pass（honesty/partial only）**
  - `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md` · **pass（honesty only）**
  - 状态：`post_prove_dual_pass` · **仅 honesty/partial** · 7× EXIT=0 · ≠ covered / R2 / R4 / HA

---

*Harness · non-happy + perf/load · 2026-09-16 ~19:20 PT · releaseEvidence=false · ≠HA · Batch1+Batch2+Batch3=post_prove_dual_pass（honesty only）*
