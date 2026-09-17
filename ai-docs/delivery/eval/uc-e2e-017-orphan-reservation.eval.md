# 评测证明 — UC-E2E-017 孤儿预占对账（partial ladder）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-017 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-017-orphan-reservation.md`  
**对照矩阵行**：`UC-E2E-017`  
**待审专家**：`mw-e2e-ha`

---

## 1. 用途

eval-first：交付 **可执行** O1–O4 集成断言（`@meetwise/db` commerce API），无 `MODEL_API_KEY`。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered`。最多 **partial**。  
**本绿 ≠ 全链路 E2E covered**，直至 `e2e:isolated` 纳入 HTTP begin-fail 注入。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc017:orphan:prove` | **0** | **0**（2026-09-10 ~00:25 PT；O1–O4 全 PASS；receipt `.tmp/isolated-proof-receipts/2026-09-10T07-25-07-226Z-…`；R5 banner 已印） | O1–O4 集成绿 → 矩阵 **partial**；≠ covered；≠ e2e:isolated；fixture=pgvector → green-risk |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（同日实现方自跑） | harness+eval 引用矩阵行；≠业务 covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；需 Docker isolated PG
pnpm uc017:orphan:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`packages/db/test/uc-e2e-017-orphan-reservation.proof.ts`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| O1 | reserve → `reserved` + 额度扣减可观测 | **否**（集成 only） |
| O2-sync | begin-fail 补偿 `releaseConsumption` → `released` + 额度回补 | 否 |
| O2-sweeper | 租约过期 + `reconcile` → `released` | 否 |
| O3 | 同键 `duplicate`；恰 1 行；不双扣 | 否 |
| O4 | 错主体 RLS 0 行 / release not_found | 否 |

**BLOCKED（仍 gap 于全链路）**：HTTP begin-fail / SSE-after-commit 孤儿注入未进 `e2e:isolated`。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-017 covered**
- [ ] 未把 `commerce:prove` / `commerce-reconcile:prove` 冒充本 UC
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵最多 **partial**（非假 covered）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`

## 5. 专家请回答

1. O1–O4 集成合同是否足以支撑矩阵 **partial**（仍明示 ≠ covered）？  
2. HTTP begin-fail 注入是否列为下一刀 P0（进 e2e:isolated 后才可讨论更高覆盖）？  
3. 结论写入 `reviews/`，含「仍 ≠ covered」明示。
