# 评测证明 — UC-E2E-018 用户主动放弃面试（partial ladder）

**日期**：2026-09-10（PT；waiting_user CAS 补刀 ~02:27）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-018 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-018-user-abandon.md`  
**对照矩阵行**：`UC-E2E-018`  
**待审专家**：`mw-e2e-ha`（+ 额度账本关键切片时第二域）· **禁止作者自签 covered**

---

## 1. 用途

eval-first：交付 **可执行** A1–A3 集成断言（`@meetwise/db` `abandonInterviewAndRelease`）+ **真 HTTP** `POST /interview/:id/abandon`（产品口已存在）。无 `MODEL_API_KEY`。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered`。最多 **partial**。  
**本绿 ≠ 全链路 E2E covered**。`GAP-UC018-FULL-E2E`+#2 `GAP-UC018-GRAPH`+#3 `GAP-UC018-TTL`+#5 `GAP-UC018-UI`+#6 `GAP-UC018-SOLE`（PG-retained）已关；**#6 alone ≠ covered** → 矩阵仍 **partial** · **≠ covered**。covered-lift assessed（`pnpm uc018:covered-lift:prove` · **canHonestlyFlip=false** · refuse：matrix §1.0 ADV still **blind** · Ban假关 · Ban wash SOLE alone into covered）。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc018:abandon:prove` | **0** | **0**（2026-09-23 ~16:15 PDT re-prove；A1–A3+A-waiting-user PASS；R5） | 集成绿 → 矩阵 **partial**；≠ covered；§1b#4 关 |
| `pnpm uc018:abandon:http:prove` | **0** | **0**（2026-09-23 ~16:43 PDT re-prove；46 PASS；FULL-E2E+GRAPH CLOSED；R5） | HTTP 口绿；FULL-E2E+GRAPH 已关；仍 ≠ covered；#3/#5/#6 仍缺 |
| `pnpm uc018:abandon:full-e2e:prove` | **0** | **0**（2026-09-23 ~16:17 PDT；assertions=14；R5；receipt `.tmp/e2e-receipts/2026-09-23T23-17-24-726Z-1101171-dbf25328-ec65-49b5-891f-730eb92e0827.json`） | full.e2e abandon TC；关 `GAP-UC018-FULL-E2E` only；仍 ≠ covered；R5 |
| `pnpm uc018:graph:prove` | **0** | **0**（2026-09-23 ~16:43 PDT；G1–G5 PASS；R5；receipt `.tmp/isolated-proof-receipts/2026-09-23T23-43-32-710Z-1148868-d7a3c9f0-51bc-4f76-8095-2bc8af21daf4.json`） | AiGraphRun safely_terminated + 业务事实保全；关 `GAP-UC018-GRAPH` only；仍 ≠ covered；R5 |
| `pnpm uc018:ui:prove` | **0** | in-interview 「放弃」→ abandoned+released；关 `GAP-UC018-UI` only；**UI alone ≠ covered**；矩阵仍 **partial**；R5 |
| `pnpm uc018:ttl:prove` | **0** | **0**（2026-09-23 ~17:07 PDT；T1–T4 PASS；R5；receipt `.tmp/isolated-proof-receipts/2026-09-24T00-07-25-065Z-1193730-984d0ca8-bd96-4717-81fd-83a8f137f9e9.json`） | 租约过期孤儿 → abandoned+released；关 `GAP-UC018-TTL` only；仍 ≠ covered；R5；Ban wash commerce-reconcile |
| `pnpm uc018:sole:prove` | **0** | 静态诚实：abandon 家族 cite PG-retained sole；关 `GAP-UC018-SOLE` only；**#6 alone ≠ covered**；矩阵仍 **partial**；Ban wash MySQL/Qdrant sole-wiring |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（2026-09-23 ~16:17 PDT；UC-E2E-018 partial not covered；§1b pins） | harness+eval 引用矩阵行；≠业务 covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；需 Docker isolated PG
pnpm uc018:abandon:prove ; echo EXIT=$?
pnpm uc018:abandon:http:prove ; echo EXIT=$?
pnpm uc018:abandon:full-e2e:prove ; echo EXIT=$?
pnpm uc018:graph:prove ; echo EXIT=$?
pnpm uc018:ttl:prove ; echo EXIT=$?
pnpm uc018:ui:prove ; echo EXIT=$?
pnpm uc018:sole:prove ; echo EXIT=$?
pnpm uc018:covered-lift:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：  
- `packages/db/test/uc-e2e-018-user-abandon.proof.ts`  
- `apps/api/test/uc-e2e-018-user-abandon-http.proof.ts`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| A1 | active+reserved → abandoned + released + 额度净变 0 | **否**（集成 only） |
| A1-shell | created 空壳 → abandoned + noop | 否 |
| A-created-reserved | created+reserved → abandoned + released | 否 |
| A-waiting-user | waiting_user+reserved → abandoned + released；∉ in-progress | **否**（集成；关 §1b#4 CAS 口，≠全 covered） |
| A2 | 二次 already_abandoned；complete → settlement_failed；不可复活 | 否 |
| A3 | abandoned ∉ in-progress 集合 | 否 |
| H1 | HTTP POST abandon active+reserved → 200 + released + 额度净变 0 | **否**（聚焦 HTTP ≠ full.e2e） |
| H1-shell | HTTP created 空壳 → noop | 否 |
| H2 | HTTP 二次 alreadyAbandoned；begin → 409 | 否 |
| H3 | list/create 口径 | 否 |
| H-waiting-user | HTTP waiting_user+reserved → 200 + released；begin→409 | **否**（聚焦 HTTP；关 §1b#4） |
| H-authz | 404/401/409 守卫 | 否 |

**仍 gap 于 covered（见 harness §1b + covered-lift）**：covered-lift assessed · **canHonestlyFlip=false** · refuse：matrix §1.0 ADV still **blind** · Ban假关。UI（#5）+ sole PG-retained（#6 · `GAP-UC018-SOLE` CLOSED）已关 · **UI alone ≠ covered** · **#6 alone ≠ covered** · Ban wash SOLE alone into covered。

**已关**：§1b#4 `waiting_user` CAS；**§1b#1 `GAP-UC018-FULL-E2E`**；**§1b#2 `GAP-UC018-GRAPH`**；**§1b#3 `GAP-UC018-TTL`**；**§1b#5 `GAP-UC018-UI`**（`pnpm uc018:ui:prove`）；**§1b#6 `GAP-UC018-SOLE`**（`pnpm uc018:sole:prove` · PG-retained · Ban MySQL/Qdrant sole-wiring）。矩阵仍 **partial** · **UI alone ≠ covered** · **#6 alone ≠ covered** · **≠ UC-E2E-018 covered** · covered-lift **canHonestlyFlip=false**（ADV **blind**）· Ban假关。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-018 covered**
- [ ] 未把 `commerce:prove` / `commerce-reconcile:prove` / `neg:interview` 冒充本 UC
- [ ] 未把 `uc018:abandon:http:prove` / `uc018:abandon:full-e2e:prove` / `uc018:graph:prove` / `uc018:ttl:prove` / `uc018:ui:prove` / `uc018:sole:prove` / `uc018:covered-lift:prove` / `commerce-reconcile:prove` 绿写成 UC-E2E-018 covered（FULL-E2E+GRAPH+TTL+UI+SOLE 已关仍 partial · UI alone ≠ covered · #6 alone ≠ covered · canHonestlyFlip=false · ADV blind）
- [ ] 未把 MySQL/Qdrant `e2e-isolation:sole-*:prove` / `mysql-stack:*` 绿写成 `GAP-UC018-SOLE` / UC covered
- [ ] 未把 isolated/pgvector 绿写成 MySQL/Qdrant sole cutover / HA（PG-retained = production-aligned sole per `adr-postgres-retained.md`）
- [ ] 矩阵最多 **partial**（非假 covered）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] 钉 harness §1b 抬 covered 仍缺清单

## 5. 专家请回答

1. A1–A3 + H1–H3 是否足以**维持**矩阵 **partial**（仍明示 ≠ covered）？  
2. §1b #1–#6 已关 + covered-lift assessed：**canHonestlyFlip=false**（refuse：matrix §1.0 ADV **blind**）→ 矩阵仍 **partial** · Ban假关 · Ban wash SOLE alone into covered  
3. 结论写入 `reviews/`，含「仍 ≠ covered」明示；**禁止**作者自签升 covered。
