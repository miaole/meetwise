# Review — 北星硬闸 SSOT G1–G6（第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限：G1–G6 作为交付 SSOT + 与矩阵盲区列联动诚实；**≠** 全量 E2E 已齐 · **≠** HA · **≠** 0 BUG 已证 · **≠ covered**）  
**releaseEvidence=false** · Not HA · **实现方自批无效** · **本审未跑 prove / live E2E**

对照：`ai-docs/delivery/north-star-hard-gates.md` · `e2e-requirement-coverage-matrix.md` §0.5/§1.0 · `non-happy-path-perf-load-case-matrix.md` · `harness/non-happy-path-perf-load-matrix.md`

## G1–G6 裁定

| 闸 | 裁定 | 假阳风险 |
|----|------|----------|
| **G1** 可核验 CMD+EXIT/CI/收据 | **持有**。叙事≠证据；blocked/not_run 封闭 | 无 EXIT 当完成 = 违规（文已禁） |
| **G2** 非快乐路径进完整 E2E | **持有**。NEG/FAULT/ADV/BOUND；仅快乐绿=假绿 | 矩阵有行未跑仍遗漏（文已钉） |
| **G3** 需求→矩阵/eval→才 prove | **持有**。禁先写绿再回填 | 与 §2 强制列列表略不同步（见 nit） |
| **G4** 执行前独立专家审 | **持有**。实现方禁自批；≥2 域；自签=`blocked:author_only` | 本审即 G4 对抗例 |
| **G5** 禁假绿/假阳性 | **持有**。partial/gap/conn-only/honesty-pin/green-risk/blind ≠ covered | 与矩阵 §假绿清单、R5 一致 |
| **G6** 性能+负载可复现 | **持有**。本地绿≠产能；PERF/LOAD blind/not_run 禁填 covered | 终态秒数/413/X10 冒充 LOAD 已在矩阵标红 |

## 与矩阵盲区联动

| 落点 | 是否联动 | 读法 |
|------|----------|------|
| 矩阵 §0.5 / §1.0 | **是** | G2+G6 强制列 SSOT；分面 PERF_api/PERF_web/LOAD_worker |
| case-matrix + non-happy harness | **是** | case-only ≠ 执行；本刀禁 prove 绿关 |
| §1.0.3 零全绿 / 零 PERF covered | **诚实** | 符合 G5/G6 |
| 北星目标表（100% HA / 全量 E2E / 0 BUG） | **诚实** | 均为目标/未齐；禁勾 true |

## Nit（非阻塞 · 建议改）

`north-star-hard-gates.md` **G3** 步骤 2 仍写 harness 须带「NEG+FAULT+ADV+PERF」；同文 **§2** 已强制 **BOUND + LOAD**（及分面）。建议 G3 改为与 §2 六列一致，避免读者假阳以为 BOUND/LOAD 可在 eval-first 省略。

## 非宣称

禁止：covered、HA、releaseEvidence=true、全量 E2E 零遗漏已达成、0 BUG 已证、实现方自批 pass、把本文降级为 guide。

## 收据

- 专家：`mw-rag-route`
- 结论：`ai-docs/delivery/reviews/2026-09-16-north-star-hard-gates-mw-rag-route.md`
- HEAD：`639134f`
