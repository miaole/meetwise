# 评测证明 — UC-E2E-010 SSE 断线重连 / Last-Event-ID 续传（partial ladder）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-010 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-010-sse-resume.md`  
**对照矩阵行**：`UC-E2E-010`  
**层旁证（cite）**：`e2e/helpers/sse.ts` · `last-event-id:unit:prove` · `sse-slot:prove` · `stream-window.spec.ts`  
**待审专家**：`mw-e2e-ha`（+ privacy · R-authz）

---

## 1. 用途

eval-first：交付 **可执行** HTTP 断线→`Last-Event-ID` 续传断言（`apps/api` + `_neg-harness`），**无 `MODEL_API_KEY`**。  
主钉：**R1 全量 catch-up 后 abort → R2 账本续写后仅 seq>N → R3/R4 游标边界 → R-mid mid-interview live-tail→LED → R-authz → G-GAP**。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered`。最多 **partial**。  
**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → **green-risk / R5**。  
不得把 unit/slot/helpers/stream-window 绿冒充本 UC covered。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc010:sse-resume:prove` | **0** | **0**（2026-09-10 ~02:39 PT；wave #4 R1–R4+**R-mid**+R-authz+G-GAP **13 PASS**；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-39-59-633Z-1106168-060d415d-5ae5-4f31-b2d0-cb384f607741.json`；R5 banner 已印；含 PRIVACY-STUB + 0058/CROSS-REPLICA pins） | R1–R4+R-mid HTTP 续传绿 → 矩阵保持 **partial**；≠ covered；R-mid≠full.e2e；**green-risk / R5** |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（同日实现方自跑） | harness+eval 引用矩阵行；≠业务 covered |
| `pnpm last-event-id:unit:prove` | **0** | 层旁证（既有） | parser ≠ 断线业务 |
| `pnpm sse-slot:prove` | **0** | 层旁证（既有） | 槽位 ≠ 断线业务 |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；需 Docker isolated PG
pnpm uc010:sse-resume:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-010-sse-resume.proof.ts`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| R1 | 全量重放 [1,2,3] 后 abort | **否** |
| R2 | 断线后续写 + Last-Event-ID=3 → [4,5] | **否**（HTTP 集成 only） |
| R3 | Last-Event-ID=2 → [3,4,5] | 否 |
| R4 | Last-Event-ID=5 → [] | 否 |
| R-mid | hold live-tail [6,7] → abort → LED=7 → [8,9] | **否**（HTTP only；≠ full.e2e / A3） |
| R-authz | userB → 404 | 否（≠隐私擦除） |
| G-GAP | GAP-UC010-* 诚实钉（含 0058 / CROSS-REPLICA） | 否（EXIT=0≠闭环） |

**BLOCKED（仍 gap 于全链路 · 见 harness §1b）**：`full.e2e` mid-interview 断线；A3 kill+无双扣；Playwright UI 重连；0058 去 stub；跨副本槽。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-010 covered**
- [ ] 未把 `last-event-id:unit` / `sse-slot` / `stream-window` / `helpers/sse` 冒充本 UC
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵最多 **partial**（非假 covered）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] G-GAP EXIT=0 读作诚实钉，非 A3 闭环
- [ ] R-mid 未冒充 full.e2e mid-interview；§1b 抬 covered 仍非空

## 5. 专家请回答

1. R1–R4 + **R-mid** HTTP 合同是否足以支撑矩阵保持 **partial**（仍明示 ≠ covered）？  
2. full.e2e mid-interview 断线 + A3 无双扣是否仍为下一刀（§1b；进 e2e:isolated 后才可讨论更高覆盖）？  
3. 结论写入 `reviews/`，含「仍 ≠ covered」明示；R-mid ≠ full.e2e。
