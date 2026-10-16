# Harness / 评测集 — R1 Worker「技术岗」fail-closed（GAP-RAG-01）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁 / ≠ cutover** · **本合同 prove EXIT=0 ≠ R4/FUNNEL/题域已关**  
**对照**：`ai-docs/delivery/m4-rag-hard-gates.md` §R1 · `ai-docs/delivery/gap-bug-backlog.md` GAP-RAG-01 · `harness/g-r4-3-r1-product-close.md`（产品关闸刀）

---

## 0. 本切片验收立场（先读）

| 声明 | 裁定 |
|------|------|
| **R1 产品关闸？** | **本刀合同 prove  alone ≠ lifecycle nail**。产品关闸在 `g-r4-3-r1-product-close`（standing authorize · default flip · dedicated prove · awaiting post-prove dual）。`r1ProductClosed` 仅该刀收据在 authorize 下诚实钉 |
| **R2 生产接线？** | **structural CLOSED** retained（prior）· **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL |
| **R4 题域隔离？** | **NOT closed**；本评测集 **零** track-local / wrong_track 断言 · **不宣称题域隔离已关** |
| **默认生产行为** | `MEETWISE_TECH_ROLE_FAIL_CLOSED` **产品默认 on**（G-R4-3 / R1 product-close flip）→ 缺 route 抛 `adaptive_role_route_missing`；精确 `0/false/off` = legacy「技术岗」opt-out |
| **代码改动** | `adaptive-role-resolve.ts` 默认 ON；`docker/env/worker.env.example=1` |

---

## 1. 测什么（评测条目）

### 1.1 必测（本 prove 必须覆盖）

| ID | 测什么 | 期望 | 假绿风险（标红） |
|----|--------|------|------------------|
| **E1** | flag 默认（empty）→ fail-closed **开**；精确 `0/false/off` → **关** | empty=`true`；explicit off=`false` | 勿把「合同绿」写成 R4 已关 |
| **E2** | flag `1`/`true`/`on` → fail-closed **开** | = true | 勿把 unit env 写成 R4 隔离 |
| **E3** | flag explicit-off + 无 route/deps → legacy | 返回字面量 `技术岗` | **标红**：legacy opt-out 绿 ≠ 默许静默猜桶 |
| **E4** | flag-on / product default + 无 route | throw `adaptive_role_route_missing` | 勿把「函数能 throw」写成 R4 已关 |
| **E5** | flag-on + 仅 `roleFromDeps='技术岗'` | **仍** throw | 若将来允许 deps 旁路，本条必须改合同并重审 |
| **E6** | flag-on + route snapshot / job metadata 非空 | 返回该 role | **标红**：读到 leaf ≠ R4 隔离 |
| **E7** | 静态：`main.ts` 无 `role: '技术岗'` 注入 | 正则不匹配 | 注释里出现「技术岗」字样不算失败 |
| **E8** | 静态：`interview-consumer.ts` 无 `?? '技术岗'` | 正则不匹配；调用 resolver | ≠ R4 |
| **E9** | 静态：harness / prove 钉 `releaseEvidence=false`、不宣称 R4 | 文档断言 | 文档绿 ≠ R4 关 |

### 1.2 明确不测（防范围膨胀）

| 非目标 | 原因 |
|--------|------|
| 生产读面 `wrong_track=0` / track-local serving | **R4** |
| qbank / hybrid / pgvector / Qdrant 切流 | R3/R5 |
| 宣称 R4/FUNNEL/题域/G-R4-5/EG closed | Ban wash |

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm r1-tech-role-fail-closed:prove` | **0** | E1–E9 合同绿：**评测集自身可跑通**；**≠ R4 已关**；产品关闸叙事见 `g-r4-3-r1-product-close` |
| `pnpm r4-pr1-product-close:prove` | **0** | 产品关闸专用（default flip + SSOT）· Ban self-nail `post_prove_dual_pass` |

---

## 3. 假绿标红清单（审查必勾）

| 若有人说… | 正确读法 |
|-----------|----------|
| 「本合同 prove 绿了所以 R4 关了」 | **假绿**。R4 / 题域 **STILL OPEN** |
| 「main 没写技术岗了所以题域隔离好了」 | **假绿 / R4** |
| 「产品默认 on 所以 HA / suite green」 | **假绿**。`releaseEvidence=false` · ≠HA |

---

## 4. 代码与文档锚点

| 路径 | 角色 |
|------|------|
| `apps/worker/src/adaptive-role-resolve.ts` | 解析 + **产品默认 ON** + legacy opt-out |
| `apps/worker/src/interview-consumer.ts` | start 调用 resolver；fail-closed 时只读 snapshot |
| `apps/worker/src/main.ts` | 不再注入 `role: '技术岗'` |
| `docker/env/worker.env.example` | `MEETWISE_TECH_ROLE_FAIL_CLOSED=1` |
| `harness/g-r4-3-r1-product-close.md` | 产品关闸刀 · `executed:awaiting_post_prove_dual` |

---

*R1 contract harness · 2026-09-23 · product default ON under G-R4-3/R1 product close · releaseEvidence=false · Not HA · ≠ R4/题域 closed*
