# REQUEST — 非快乐路径 + 分面 PERF/LOAD 矩阵（预执行）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ 全量 E2E 已齐** · **≠ 0 BUG 已证**  
**配对**：`REQUEST-2026-09-16-non-happy-perf-matrix-mw-rag-route.md`（双域对抗；冲突以阻塞项为准）

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` **§0.5 / §1.0** | 强制列 + 盲区旗 SSOT（本刀扩 BOUND+LOAD+分面） |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | 由 UC 派生的 case ID 全表 |
| `ai-docs/delivery/harness/non-happy-path-perf-load-matrix.md` | 预执行 harness；命令登记；**未跑** |
| `ai-docs/delivery/eval/non-happy-path-perf-load-matrix.eval.md` | 评测笔记；盲区摘要 |
| `ai-docs/delivery/north-star-hard-gates.md` G2/G3/G6 | 硬序 |
| `ai-docs/testing/e2e-performance-evidence.md` | PERF 证据边界 |

---

## 切片立场

本刀 **只**完成 eval-first 产物：非快乐路径 + 分面性能/负载 **用例与矩阵列** + harness + REQUEST。  
**未**执行 live E2E / `verify:e2e-performance` / 云 TC / HA prove 作绿关。  
**未**把任何行升 `covered`。实现方 **不得**自批本 REQUEST。

不得冒充：

- 完整 E2E 零遗漏已达成 / covered / HA / `releaseEvidence=true`
- PERF/LOAD 容量已证 / 线上 SLO
- partial / case-only / honesty-pin = 已关

---

## 请专家复核（文档审 · 本刀不要求复跑 prove）

1. §0.5 是否明确要求 **NEG · FAULT · BOUND · ADV · PERF · LOAD** 且分面 **PERF_api / PERF_web / LOAD_worker**？缺列是否读为 blind/gap/not_run？  
2. §1.0 是否诚实标出 UC-E2E-001 快乐路径盲区，且 PERF/LOAD **零 covered**？  
3. case-matrix 中 `case-only` 是否被明确钉为 **未执行**（≠ covered）？  
4. harness 是否禁止本刀用 prove EXIT=0 作绿关，并指向双审后才执行？  
5. 是否错误宣称 covered / HA / releaseEvidence=true / 全量 E2E 已齐？  
6. 与既有 uc015/017/010/011/033 等 partial 继承是否被误写成新绿？

（可选）若专家认为有必要抽查静态引用完备性，可自行决定命令；**实现方不预填 EXIT 作 pass**。

---

## 请专家回答（结论落 reviews/）

1. 本切片是否仅完成「需求→评测用例/矩阵」而 **未**越权执行绿关？  
2. 盲区旗（尤其 001、PERF 分面、云 blocked）是否足够防假阳性？  
3. 是否同意：**在双审通过前不得开始 prove/执行刀**？  
4. 阻塞项（若有）是什么？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass 结论。  
- 不宣称 covered / HA / `releaseEvidence=true` / sole cutover / 容量已证。  
- 不宣称矩阵「已覆盖」或全量 E2E 已跑完。  
- 下一刀 = **等待**本审 + rag-route 配对审通过后再谈 prove。

---

*REQUEST · mw-e2e-ha · 2026-09-16 PT · releaseEvidence=false · ≠HA*
