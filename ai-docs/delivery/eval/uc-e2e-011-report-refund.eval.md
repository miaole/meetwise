# 评测证明 — UC-E2E-011 报告失败退款 + 计费边界（partial ladder）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-011 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-011-report-refund.md`  
**对照矩阵行**：`UC-E2E-011`  
**待审专家**：`mw-e2e-ha` + 计费/账本第二域（commerce / model-op）

---

## 1. 用途

eval-first：交付 **可执行** R1–R3 计费边界集成断言 + R4 honesty GAP（含 §1b 静态库存）+ **H1–H3 HTTP 额度断言**（`GET /commerce/entitlement`）+ H4 refund/wallet/balance-ui GAP + **H5 parallel §1b** refund-callback 抬 covered 前置（404/missing + PREREQ），无 `MODEL_API_KEY`。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered`。最多 **partial**。  
**本绿 ≠ 全链路 E2E covered**，直至 refund-callback 产品口 + balance-ui + `full.e2e` 额度回滚闭环（见 harness §1b）。**never covered** from H5 GAP EXIT=0.

D1 钉死：1 额度 = 一场面试；`reserved→confirmed` @ completed；**报告失败默认不退**；仅面试 failed → released。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc011:report-refund:prove` | **0** | **0**（2026-09-10 ~02:55 PT；R1–R4 + §1b static PREREQ 全 PASS；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-55-30-515Z-1152803-5c4e7e77-526b-452a-8fa0-06e9dc885e86.json`；R5） | R1–R3 集成绿 + R4 GAP/§1b PREREQ → 矩阵 **partial**；≠ covered |
| `pnpm uc011:report-refund:http:prove` | **0** | **0**（2026-09-10 ~02:55 PT；H1–H5 **51 PASS**；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-55-10-092Z-1151779-96da9610-b292-47d4-978d-1fe7c8436abb.json`；R5） | HTTP 额度口 + H4/H5 refund-callback 404/static GAP + §1b#1 PREREQ；**仍 ≠ covered**；never covered from H5 EXIT=0 |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（同日；含 H5 / §1b refund-callback PREREQ / entitlement / balance-ui pins；matrix **partial**） | harness+eval 引用矩阵行；≠业务 covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；需 Docker isolated PG
pnpm uc011:report-refund:prove ; echo EXIT=$?
pnpm uc011:report-refund:http:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：  
- `packages/db/test/uc-e2e-011-report-refund.proof.ts`  
- `apps/api/test/uc-e2e-011-report-refund-http.proof.ts`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| R1 | failInterviewAndRelease → failed + released + 额度净变 0 | **否**（集成 only） |
| R2 | complete+quarantine → confirmed 不变；额度不回补 | 否 |
| R3 | release on confirmed → already_confirmed | 否 |
| R4 | schema 无 consumption.refunded + GAP-UC011-REFUND-CALLBACK 打印 | 否（honesty；≠退款回调闭环） |
| H1 | HTTP GET entitlement：fail 后额度净变 0 | 否（HTTP 额度口；≠ fail HTTP mouth / full.e2e） |
| H2 | HTTP 额度 quarantine 后不退；retry→404 | 否 |
| H3 | 误 release + HTTP 额度不变 | 否 |
| H4 | refund-callback/wallet/refund-webhook → 404；balance-ui stub GAP | 否（honesty） |
| H5 | §1b static inventory + 404×3 + 抬 covered PREREQ-1…6（implementing） | 否（honesty；≠ refund-callback 已实现） |

**BLOCKED（仍 gap 于全链路 · harness §1b）**：支付退款回调幂等、balance-ui、fail HTTP mouth、regenerate（UC-019）、full.e2e 额度业务断言、wallet 契约落地、sole-stack/R5。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-011 covered**
- [ ] 未把 `report_unavailable` 隔离冒充退款断言
- [ ] 未把 `commerce:prove` / `report:prove` / `uc018:abandon:http` 冒充本 UC
- [ ] 未把 R4/H4 GAP pin 写成退款幂等已闭环
- [ ] 未把 `GET /commerce/entitlement` 写成 `GET /wallet` covered
- [ ] 矩阵最多 **partial**（非假 covered）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`

## 5. 专家请回答

1. R1–R3 + H1–H3 是否足以支撑矩阵 **partial**（仍明示 ≠ covered）？  
2. H4/H5 404 probes + R4 schema/static GAP 是否诚实（未把缺失口写成已实现）？  
3. H5 §1b#1 抬 covered 前置（PREREQ-1…6）是否够清晰（implementing refund-callback）？  
4. 结论写入 `reviews/`，含「仍 ≠ covered」明示。
