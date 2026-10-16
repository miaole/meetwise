# 评测证明 — R1 / GAP-RAG-01 tech-role fail-closed

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **pass ≠ R1 已关** · **本绿 ≠ 已迁**  
**对照 harness**：`ai-docs/delivery/harness/r1-tech-role-fail-closed.md`  
**对照硬门**：`ai-docs/delivery/m4-rag-hard-gates.md` §R1  
**对照缺口**：`ai-docs/delivery/gap-bug-backlog.md` GAP-RAG-01  
**待审专家**：`mw-rag-route`（评测集优先；实现合入叙事次之）

---

## 1. 本文件用途

交付「**如何验收本切片**」的评测证明材料：条目、命令、期望 EXIT、假绿标红。  
**已有代码改动可保留**，但 **本文不宣称 R1 已关**。等独立 rag 审评测集后再扩实现/关闸叙事。

---

## 2. 评测集执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 EXIT（实现方） | 读法 |
|-----|-----------|---------------------|------|
| `pnpm r1-tech-role-fail-closed:prove` | **0** | 见最近一次本地跑（须复跑核对） | E1–E9 合同可执行；**≠ R1 closed** |
| `pnpm mysql-stack:m4-rag:prove` | **0** | 见最近一次本地跑 | M4 硬门文档骨架；**≠ RAG 切流** |

复跑：

```bash
cd /workspace/meetwise   # 或仓库根
pnpm r1-tech-role-fail-closed:prove ; echo EXIT=$?
pnpm mysql-stack:m4-rag:prove ; echo EXIT=$?
```

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 R1？ |
|------------|-------------------|-----------|
| E1–E2 | flag off/on | 否 |
| E3 | legacy `技术岗` when flag-off | **否**（刻意保留） |
| E4–E5 | flag-on missing / deps-only → `adaptive_role_route_missing` | 否（合同存在 ≠ 生产开旗） |
| E6 | flag-on route sources accepted | 否（≠ R2/R4） |
| E7–E8 | 静态去静默硬编码注入 | 否（默认仍 legacy） |
| E9 | harness 钉非宣称 | 否 |

执行体：`apps/worker/test/r1-tech-role-fail-closed.proof.ts`

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **R1 已关**
- [ ] 未把 flag 默认 off 写成生产已 fail-closed
- [ ] 未把 `getInterviewRouteSnapshot` 只读探测写成 **R2 已接线**
- [ ] 未把 leaf 字符串返回写成 **R4 题域隔离已关**
- [ ] 未把 `mysql-stack:m4-rag:prove` 绿写成 RAG/向量已迁
- [ ] 未切 / 未弱化 qbank 生产路径作为本切片「关闭证据」

---

## 5. 明确未覆盖（评测集缺口 · 诚实登记）

| 缺口 | 影响 |
|------|------|
| 无真实 PG start-job → throw → `failClaimedInterviewJob` quarantine E2E | 不得宣称生产 quarantine 闭环已证 |
| 无 Compose/云组合根 `MEETWISE_TECH_ROLE_FAIL_CLOSED=1` | `releaseEvidence` 保持 false |
| 无 R2 snapshot 写入后的正路径 E2E | R1 关闭条件仍依赖 R2 |

以上缺口 **不阻塞评测集审查**；阻塞的是把本绿宣称为门关闭。

---

## 6. 专家审请回答

1. 评测条目 E1–E9 是否足够验收「静默硬编码收口 + flag-on fail-closed 合同」？  
2. 假绿标红是否够用？缺哪条？  
3. 在 **不宣称 R1 已关** 前提下，是否允许保留现有实现并继续等 R2？  
4. 结论请写入 `ai-docs/delivery/reviews/`（pass / conditional / block），含 CMD/EXIT。

---

## 7. 非目标再钉

- 不宣称 R2 生产接线  
- **题域隔离 NOT closed（R4）**  
- 不切 qbank / 向量真相  
- Not HA · releaseEvidence=false
