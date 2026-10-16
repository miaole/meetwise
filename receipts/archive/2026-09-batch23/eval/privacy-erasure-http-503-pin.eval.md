# 评测证明 — 公开隐私 DELETE=503 pin（GAP-PRIV-02 · BUG-PRIV-503）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 产品删除闭环** · **pass ≠ 擦除已开放**  
**对照 harness**：`ai-docs/delivery/harness/privacy-erasure-http-503-pin.md`  
**对照矩阵行**：`UC-E2E-050–052` · `PRIVACY-HTTP` · `GAP-PRIV-02` · `BUG-PRIV-503`  
**对照缺口**：`ai-docs/delivery/gap-bug-backlog.md` GAP-PRIV-02 / BUG-PRIV-503  
**待审专家**：`mw-privacy-int`（矩阵对照另派 `mw-e2e-ha`）

---

## 1. 本文件用途

交付「**如何验收公开删除冻结 pin**」的评测证明：条目、**FULL 命令**、期望 EXIT、假绿标红。  
**不扩产品功能**；**不宣称**删除闭环 / INT-TRANSCRIPT 控制面已关 / `controlPlaneClosed`。

---

## 2. 评测集执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 EXIT（实现方） | 读法 |
|-----|-----------|---------------------|------|
| `pnpm privacy-erasure:http:prove` | **0** | **0**（2026-09-10 ~00:17 PT；`pass_count=19`；receipt `.tmp/isolated-proof-receipts/2026-09-10T07-17-54-718Z-…`；R5 banner 已印） | **DELETE 仍 503**；预览非 SLO；**≠ 产品删除闭环**；fixture=pgvector → green-risk |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（同日实现方自跑） | harness+eval 引用矩阵行；**≠** HTTP pin |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY 即可；需 Docker isolated PG
pnpm privacy-erasure:http:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/privacy-erasure-http.proof.ts`  
源码纪律：公开 DELETE 已 503 时 **early return**，dormant 202 删除路径不得当放行证据。

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭删除闭环？ |
|------------|-------------------|----------------|
| P1–P2 | DELETE + 重放 → **503**；无 request/target | **否**（刻意冻结） |
| P3–P4 | JWS 冒充 / 头携带 → 401/503 | 否（≠ issuer HTTP 接线） |
| P5 | resume DELETE → 503 | 否 |
| P6–P7 | preview 202 + 其后 DELETE 仍 503 | 否（预览 ≠ 生产） |
| P8 | 跨 owner 404 | 否（负路径 only） |
| P9 | 文档钉矩阵行 + 本绿≠闭环 | 否 |

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **产品删除闭环 / erasure complete**
- [ ] 未把 `productionSloClaimed=false` 预览写成生产 SLO
- [ ] 未把 dormant 202 断言写成公开 DELETE 已放行
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / MySQL 隐私已迁
- [ ] 未勾 `controlPlaneClosed=true` / `releaseEvidence=true`
- [ ] 矩阵行保持 **partial**（非假 covered）

---

## 5. 明确未覆盖（诚实登记）

| 缺口 | 影响 |
|------|------|
| 无 issuer/lease + 逐 sink receipt + 删后 read=0 的放行证明 | GAP-PRIV-02 保持冻结 |
| 无 INT-TRANSCRIPT-01 组合根 | GAP-PRIV-03 |
| 无 Qdrant-as-erasure-sink ledger 对齐 | GAP-PRIV-04 |
| 夹具仍 pgvector | BUG-E2E-ISO / BUG-FAKE-R5 green-risk |

以上 **不阻塞本 pin 评测集审查**；阻塞的是把本绿宣称为删除已开放。

---

## 6. 专家审请回答

1. P1–P9 是否足够验收「公开 DELETE=503 冻结 + 预览非 SLO」？  
2. 「本绿≠产品删除闭环」标红是否够用？  
3. 在不放开 DELETE 前提下，是否允许保留现有 prove 作为活门？  
4. 结论写入 `ai-docs/delivery/reviews/`（pass / conditional / block），含 CMD/EXIT。

---

## 7. 非目标再钉

- 不宣称删除闭环 · 不接线公开破坏性 DELETE  
- Not HA · releaseEvidence=false  
- 不扩产品功能
