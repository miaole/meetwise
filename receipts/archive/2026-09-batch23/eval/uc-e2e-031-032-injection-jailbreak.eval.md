# 评测证明 — UC-E2E-031 / 032 注入越狱 / 诱导造假（honest gap(e2e)/partial(eval)）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-031/032 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-031-032-injection-jailbreak.md`  
**对照矩阵行**：`UC-E2E-031 / 032`  
**旁证（cite ≠ covered）**：`golden-tasks/` · `scoring:eval` · `golden-tasks:check|prove` · TC-AIIV-002-jailbreak · TC-RES-012-jailbreak-eval · TC-quiz-078-jailbreak · `safety-defense-in-depth.md` · `E2E_FAKE_MODEL` forbid  
**待审专家**：`mw-e2e-ha` + `mw-model-op` 或 `meetwise honesty`

---

## 1. 用途

eval-first：交付 **可执行** 静态库存 + honesty GAP（`apps/api` 文件扫描），**无 `MODEL_API_KEY`**，**无 e2e fake-model 假越狱通过**，**不假装安全闭环**。  
主钉：**S1–S6**（层分流 · e2e 禁假绿 · golden-tasks/ai-eval 旁证 · E2E_FAKE_MODEL 禁令 · 矩阵状态 · GuardrailHit 未接线）→ **G-GAP-***（E2E-STRUCTURE / AI-EVAL / FABRICATE-REJECT / FAKE-MODEL-BAN / GUARDRAIL）。  
对齐需求 TC：`TC-E2E-031-model-resist` · `TC-E2E-032-no-fabricate-model`（**ai-eval**）；结构 TC 仍 gap(e2e)。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered`。矩阵保持 **gap**(e2e) / **partial**(eval)。  
**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → **green-risk / R5**。  
不得把 graph-fake-model / scoring:eval exit0 / golden-tasks check 冒充本 UC covered。

抬到 covered 的路径见 harness **§1b**（**ai-eval suite + gates**，非 e2e fake-model）。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc031-032:injection-jailbreak:prove` | **0** | **0**（2026-09-10 ~02:17 PT；S1–S6+G-GAP 6 pins；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-17-27-026Z-…`；R5 banner 已印；GAP-UC031-E2E-STRUCTURE / AI-EVAL / UC032-FABRICATE-REJECT / AI-EVAL / FAKE-MODEL-BAN / GUARDRAIL） | S1–S6 + G-GAP 诚实钉 → 矩阵保持 **gap**(e2e)/**partial**(eval)；≠ covered；**green-risk / R5**；无 fake jailbreak pass |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（2026-09-10 ~02:17 PT；含 uc-e2e-031-032 unit + matrix gap(e2e)/partial(eval) 钉） | harness+eval 引用矩阵行；≠业务 covered |
| golden-tasks / scoring:eval | 旁证 | 旁证（既有路径） | 旁证 ≠ UC covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；静态 inventory（isolated 包装）；禁止 e2e fake-model 假越狱通过
pnpm uc031-032:injection-jailbreak:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-031-032-injection-jailbreak.proof.mjs`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| S1 | scenarios 层分流 → ai-eval | **否** |
| S2 | e2e 无 031/032 / 无 fake jailbreak pass | 否（反证禁假绿） |
| S3 | golden-tasks / scoring:eval / TC-* 旁证路径存在 | 否 |
| S4 | E2E_FAKE_MODEL fail-closed 守卫 | 否 |
| S5 | 矩阵 gap(e2e)/partial(eval) | 否 |
| S6 | GuardrailHit 无 runtime 表 | 否 |
| G-GAP-1 | GAP-UC031-E2E-STRUCTURE | 否 |
| G-GAP-2 | GAP-UC031-AI-EVAL | 否 |
| G-GAP-3 | GAP-UC032-FABRICATE-REJECT | 否 |
| G-GAP-4 | GAP-UC032-AI-EVAL | 否 |
| G-GAP-5 | GAP-UC031-032-FAKE-MODEL-BAN | 否 |
| G-GAP-6 | GAP-UC031-032-GUARDRAIL | 否 |

**仍 gap/partial（抬 covered）**：见 harness §1b — ai-eval golden+gates、结构 e2e、GuardrailHit、sole-stack。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-031/032 covered**
- [ ] 未用 e2e fake-model / E2E_FAKE_MODEL 冒充抗注入/不造假
- [ ] 未把 golden-tasks / scoring:eval / TC-quiz-078 graph-fake-model 冒充本 UC covered（旁证 ≠ covered）
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵保持 **gap**(e2e) / **partial**(eval)（honest；非假 covered）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] G-GAP EXIT=0 读作诚实钉，非安全质量闭环
- [ ] harness §1b「抬到 covered 还缺」主轨 = **ai-eval suite + gates**（非 e2e）

## 5. 专家请回答

1. S1–S6 + G-GAP 是否足以支撑矩阵保持 **gap**(e2e) / **partial**(eval)（仍明示 ≠ covered）？  
2. 下一刀应优先 **ai-eval jailbreak golden+阈值门（031-model-resist）**，还是先 **e2e 结构 escape/biz-reject**（质量仍不得进 e2e）？  
3. 结论写入 `reviews/`，含「仍 ≠ covered / 仍 gap(e2e)/partial(eval)」明示；`mw-e2e-ha` + `mw-model-op` / honesty。
