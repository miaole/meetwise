# 评测证明 — UC-E2E-019 报告重生成 + 与退款并发（partial ladder）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-019 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-019-report-regenerate.md`  
**对照矩阵行**：`UC-E2E-019`  
**待审专家**：`mw-e2e-ha` + `mw-model-op`

---

## 1. 用途

eval-first：交付 **可执行** G1–G2 regenerate×退款并发集成断言 + G3–G4 honesty GAP pin（`@meetwise/db`）+ **H1–H3 HTTP** `POST /interview/:id/report/retry` + H4 regenerateAttempt/demand-path GAP（`apps/api`），无 `MODEL_API_KEY`。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered`。最多 **partial**。  
**本绿 ≠ 全链路 E2E covered**，直至 regenerateAttempt + A3 confirmed→released + quarantine regen 出口 + `full.e2e`/UI。

D1 钉死：报告失败默认不退；regenerate 应免费；db 以 `requeueFailedReport` 代理；HTTP 产品口 = `report/retry`（≠ 需求名 `/reports/:id/regenerate`）。  
关联 UC-011 R2/H2：quarantined 不可 requeue / retry → 404 **BLOCKED**。

搜码（wave #5）：`POST /interview/:id/report/retry` **已存在** → 本波优先 HTTP prove；regenerateAttempt / A3 / quarantine 出口仍 honesty GAP（见 harness §1b）。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc019:report-regenerate:prove` | **0** | **0**（2026-09-10 ~02:44 PT；G1–G4 全 PASS；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-44-49-633Z-…`；R5 banner 已印） | G1–G2 集成绿 + G3/G4 GAP pin → 矩阵 **partial**；≠ covered；≠ regenerateAttempt 闭环 |
| `pnpm uc019:report-regenerate:http:prove` | **0** | **0**（2026-09-10 ~02:45 PT；H1–H4 全 PASS 34/34；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-45-58-217Z-…`；privacy stub + R5） | H1–H3 HTTP `report/retry` + H4 GAP → 仍 **partial**；≠ covered |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（同日实现方自跑；含 UC-E2E-019 unit + http prove / §1b pins） | harness+eval 引用矩阵行；≠业务 covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；需 Docker isolated PG
pnpm uc019:report-regenerate:prove ; echo EXIT=$?
pnpm uc019:report-regenerate:http:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：  
- `packages/db/test/uc-e2e-019-report-regenerate.proof.ts`  
- `apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| G1 | requeue 连点仅一次 failed→queued；不扣费 | **否**（集成 proxy only） |
| G2 | requeue∥release → 无 released∧regen 非法组合；confirmed 不变 | 否 |
| G3 | A3 退款先赢路径 GAP + quarantine 不可 requeue | 否（honesty / BLOCKED） |
| G4 | 无 regenerate* 列 + GAP-UC019-* 打印 | 否（honesty；≠产品闭环） |
| H1 | HTTP report/retry 连点仅一次；额度不扣 | 否（HTTP 产品口；≠ regenerateAttempt） |
| H2 | HTTP retry∥release → 无非法组合；额度不变 | 否 |
| H3 | A3 GAP + quarantine HTTP retry 404 | 否（honesty / BLOCKED） |
| H4 | regenerateAttempt / demand-path /reports/regenerate GAP | 否（honesty；≠产品闭环） |

**BLOCKED（仍 gap 于全链路 · harness §1b）**：regenerateAttempt 幂等键、A3 confirmed→released→regen 拒、quarantined regenerate 出口、full.e2e/UI、需求名 `/reports/:id/regenerate`（或 ADR）、sole-stack/R5。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-019 covered**
- [ ] 未把 `uc011` / `report:prove` 冒充本 UC
- [ ] 未把 G3/G4/H3/H4 GAP pin 写成 A3 / regenerateAttempt / demand-path 已闭环
- [ ] 未把 `POST report/retry` 写成 `POST /reports/:id/regenerate` covered
- [ ] 矩阵最多 **partial**（非假 covered）；抬 covered 见 harness §1b
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`

## 5. 专家请回答

1. G1–G2 + H1–H2 是否足以支撑矩阵 **partial**（仍明示 ≠ covered）？  
2. §1b 抬 covered 五项（regenerateAttempt / A3 / quarantine 出口 / full.e2e / demand-path ADR）是否列为下一刀 P1？  
3. 结论写入 `reviews/`，含「仍 ≠ covered」明示。
