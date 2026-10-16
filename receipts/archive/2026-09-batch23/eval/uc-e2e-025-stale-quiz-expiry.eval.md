# 评测证明 — UC-E2E-025 押题产物过期作面试输入（honest gap / mark-red）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-025 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-025-stale-quiz-expiry.md`  
**对照矩阵行**：`UC-E2E-025`  
**旁证（cite ≠ covered）**：`quiz:prove` · `full.e2e.ts` quiz 终态 · resume-derivative-reference  
**待审专家**：`mw-e2e-ha` + `mw-rag-route`（quiz 域）

---

## 1. 用途

eval-first：交付 **可执行** 静态库存 + GAP mark-red（`apps/api` 文件扫描），**无 `MODEL_API_KEY`**。  
主钉：**S1–S4**（begin 无 quiz 输入 / schema 无 expires_at / 无 stale 错误码 / begin 不联 resume_quiz）→ **G-GAP-***（STALE-REJECT / VERSION-PIN / REGEN-ENTRY / ACCEPT-FRESH）。  
对齐需求 TC：`TC-E2E-025-stale-quiz` · `TC-E2E-025-version-mismatch`（本切片仅诚实钉缺席，**不**宣称 TC 已绿）。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered` 或假 `partial`-closed。矩阵保持 **gap**（honest）。  
**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → **green-risk / R5**。  
不得把 `quiz:prove` / full.e2e quiz 终态冒充本 UC covered。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc025:stale-quiz-expiry:prove` | **0** | **0**（2026-09-10 ~01:54 PT；S1–S4+G-GAP 4 pins；receipt `.tmp/isolated-proof-receipts/2026-09-10T08-54-29-810Z-…`；R5 banner 已印；GAP-UC025-STALE-REJECT / VERSION-PIN / REGEN-ENTRY / ACCEPT-FRESH） | S1–S4 + G-GAP 诚实钉 → 矩阵保持 **gap**；≠ covered；**green-risk / R5** |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（2026-09-10 ~01:54 PT；含 uc-e2e-025 unit + matrix gap 钉） | harness+eval 引用矩阵行；≠业务 covered |
| `pnpm quiz:prove` | **0** | 旁证（既有） | 旁证 ≠ UC covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；静态 inventory（isolated 包装）
pnpm uc025:stale-quiz-expiry:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-025-stale-quiz-expiry.proof.mjs`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| S1 | begin 无 quizId | **否** |
| S2 | resume_quiz 无 expires_at | 否 |
| S3 | 无 stale_quiz / quiz_expired / resume_version_mismatch 面试错误码 | 否 |
| S4 | begin 不查 resume_quiz | 否 |
| G-GAP-1 | GAP-UC025-STALE-REJECT（TC-E2E-025-stale-quiz 缺席） | 否（EXIT=0≠闭环） |
| G-GAP-2 | GAP-UC025-VERSION-PIN（TC-E2E-025-version-mismatch 缺席） | 否 |
| G-GAP-3 | GAP-UC025-REGEN-ENTRY | 否 |
| G-GAP-4 | GAP-UC025-ACCEPT-FRESH | 否 |

**BLOCKED（仍 gap 于产品）**：HTTP 过期拒绝；resumeVersion pin；重押题入口；新鲜产物 accept 路径。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-025 covered**
- [ ] 未把 `quiz:prove` / full.e2e quiz 冒充本 UC covered（旁证 ≠ covered）
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵保持 **gap**（honest；非假 covered / 非假 partial-closed）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] G-GAP EXIT=0 读作诚实钉，非 A1/A2 闭环

## 5. 专家请回答

1. S1–S4 + G-GAP 是否足以支撑矩阵保持 **gap**（honest mark-red；仍明示 ≠ covered）？  
2. 下一刀是否应为 begin 接 quiz 产物版本 pin + 过期拒绝 + 重押题入口（进 e2e:isolated HTTP 后才可讨论 partial）？  
3. 结论写入 `reviews/`，含「仍 ≠ covered / 仍 gap」明示；`mw-e2e-ha` + `mw-rag-route`。
