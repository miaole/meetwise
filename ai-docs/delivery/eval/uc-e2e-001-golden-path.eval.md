# 评测笔记 — UC-E2E-001 黄金路径（eval-first）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **≠HA** / **Not HA** · **partial/blocked ≠ covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-001-golden-path.eval.md`  
**对照矩阵**：`ai-docs/delivery/e2e-requirement-coverage-matrix.md` 行 **UC-E2E-001** + **§1.0 盲区** NEG=blind · FAULT=partial · ADV=blind · PERF=blind（黄金路径 = 快乐路径盲区；happy-only 绿=假绿）  
**硬闸**：`north-star-hard-gates.md` G1–G6；后续 knife 必须带 NEG+PERF 列  
**待审专家**：`mw-e2e-ha`

---

## 1. 用途

交叉链接矩阵与 harness：钉 FULL 命令（`pnpm e2e:isolated` / `pnpm e2e:ui:isolated`）、前置 `MODEL_API_KEY`、fixture=pgvector → **green-risk / R5**、无 Key = **blocked**、有 Key 时期望 EXIT=0 仍 **本绿≠sole-stack migrated**。  
**禁止**因本笔记存在而把矩阵改成 `covered`。

---

## 2. 执行记录（本环境）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm e2e:isolated` | 有 Key→0；无 Key→**blocked**（勿跑） | **未跑**（`MODEL_API_KEY=unset`） | 矩阵 **blocked**(无 Key) |
| `pnpm e2e:ui:isolated` | 同上 | **未跑** | 同上 |
| `pnpm eval-uc-e2e-001-002-cite:prove` | **0** | 见静态 prove | harness 存在 + 诚实钉；≠业务 covered |
| `pnpm uc001:live-blocked:prove` | **0** | 本切片 | **blocked**(无 Key) honesty + fail-closed 源码钉；**≠** green live；**≠** covered |

复跑静态：

```bash
cd /workspace/meetwise
pnpm eval-uc-e2e-001-002-cite:prove ; echo EXIT=$?
pnpm uc001:live-blocked:prove ; echo EXIT=$?
# 勿跑：pnpm e2e:isolated（无 Key → blocked；不发明假绿）
```

---

## 3. 矩阵交叉引用

| 矩阵位置 | 要点 |
|----------|------|
| §1.1 UC-E2E-001 | partial / blocked(无 Key)；fixture=pgvector → green-risk |
| §2 BUG-FAKE-R5 / BUG-E2E-ISO | 宽 isolated 假绿家族 |
| §3 P0-3 | 有 Key 时再跑真链路 |
| §4 探测 | MODEL_API_KEY unset → e2e:isolated blocked；`uc001:live-blocked:prove` EXIT=0 钉诚实 blocked |
| harness §1a/§1b | blocked(无 Key)；抬 covered = Key 到位后 `pnpm e2e:isolated` / `full.e2e` |

---

## 4. 审查勾选

- [ ] 未宣称 covered / sole-stack migrated / releaseEvidence=true  
- [ ] 无 Key 诚实 blocked；未发明假绿  
- [ ] 结论可由 `mw-e2e-ha` 写入 `reviews/`
