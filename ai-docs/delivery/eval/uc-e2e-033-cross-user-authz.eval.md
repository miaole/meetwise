# 评测证明 — UC-E2E-033 越权（C 跨用户 / B-C）（partial ladder）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-033 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-033-cross-user-authz.md`（含 §1b 抬 covered）  
**对照矩阵行**：`UC-E2E-033`  
**旁证（cite ≠ covered）**：`neg:auth` · `neg:bend` · `neg:interview` · `neg:commerce` · `full.e2e.ts` B RLS  
**待审专家**：`mw-e2e-ha` + `mw-privacy-int`（dual-review ready）

---

## 1. 用途

eval-first：交付 **可执行** 跨用户 / 角色门禁 / B-C 隔离断言（`apps/api` + `_neg-harness`），**无 `MODEL_API_KEY`**。  
主钉：**X1–X8** + **W1**（worker principal honesty）+ **X9–X11** → **G-GAP**（七类未齐 / A3 live worker）。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered`。最多 **partial**（系统化七类未齐）。  
**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → **green-risk / R5**。  
不得把 `neg:*` / `full.e2e` RLS 绿冒充本 UC covered。  
W1/X10/X11 **≠** live worker / 七类齐 / cache-trace 全路径闭环。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc033:cross-user-authz:prove` | **0** | **0**（2026-09-10 ~02:49 PT；X1–X8+W1+X9–X11+G-GAP **51 PASS**；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-49-43-978Z-…`；R5 banner；含 GAP-UC033-WORKER-LIVE / CACHE-TRACE / SEVEN-CLASS / FULL-E2E / NEG-CITE） | 矩阵保持 **partial**；≠ covered；七类未齐；**green-risk / R5**；W1≠WORKER-LIVE闭环 |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（2026-09-10 ~02:49 PT；含 uc-e2e-033 unit + §1b/W1/X9–X11 pins + matrix partial 钉） | harness+eval 引用矩阵行；≠业务 covered |
| `pnpm neg:interview` / `neg:bend` / `neg:auth` | **0** | 旁证（既有） | 旁证 ≠ UC covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；需 Docker isolated PG
pnpm uc033:cross-user-authz:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-033-cross-user-authz.proof.ts`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| X1 | C-cross 面试 begin/turn/assessment/report/events/transcript/abandon 404 | **否** |
| X2 | C-cross 简历 list/profile 404 | 否 |
| X3 | C-cross 订单 404 | 否 |
| X4 | C-cross quiz/diagnosis 404 | 否 |
| X5 | B-C 404 + recruiter_required 403 | 否 |
| X6 | admin_required 403 | 否 |
| X7 | A2 无/错 principal → 0 行 | 否（≠ A3 live worker） |
| X8 | export 仅己 | 否（≠擦除闭环） |
| W1 | interview_job RLS 0 行 + consumer/checkpoint source asPrincipal pin | 否（≠ WORKER-LIVE） |
| X9 | event/report/entitlement/notification/career DB+HTTP | 否（≠七类齐） |
| X10 | concurrent burst all-404 | 否（≠高并发竞态） |
| X11 | 404 body 不泄露 | 否（≠ cache-trace 全路径） |
| G-GAP | GAP-UC033-* 诚实钉（WORKER-LIVE / …） | 否（EXIT=0≠闭环） |

**BLOCKED（仍 gap 于全链路 / 七类 · 见 harness §1b）**：A3 live worker/checkpointer；cache/trace 全路径；高并发越权竞态；full.e2e 独立 UC033 场景。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-033 covered**
- [ ] 未把 `neg:*` / `full.e2e` B RLS 冒充本 UC covered（旁证 ≠ covered）
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵最多 **partial**（非假 covered；系统化七类未齐）；§1b 非空
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] W1 ≠ A3 live worker 闭环；X10 ≠ 七类齐；X11 ≠ cache-trace 全路径
- [ ] G-GAP EXIT=0 读作诚实钉，非七类齐 / A3 闭环

## 5. 专家请回答

1. X1–X11 + W1 合同是否足以支撑矩阵保持 **partial**（仍明示 ≠ covered / 七类未齐 / §1b）？  
2. A3 live worker + 七类高并发竞态 + cache-trace 全路径是否列为下一刀（进 e2e:isolated 后才可讨论更高覆盖）？  
3. 结论写入 `reviews/`，含「仍 ≠ covered」明示；`mw-e2e-ha` + `mw-privacy-int`（dual-review）。
