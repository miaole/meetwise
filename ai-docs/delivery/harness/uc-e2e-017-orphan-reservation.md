# Harness — UC-E2E-017 孤儿预占对账（eval-first · partial ladder）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-017 covered**  
**对照矩阵行**：`UC-E2E-017`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P0-5  
**对照需求**：`e2e-scenarios.md` UC-E2E-017 · `cend-mock-interview.md` UC-INT-14  
**MODEL_API_KEY**：**不需要**（本 prove 不调 live 模型；纯 `@meetwise/db` commerce API）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵可升 **partial**（仅当 `uc017:orphan:prove` 真跑绿）；**不得**写 covered |
| 本切片 | 可执行 **O1–O4** 集成断言：`begin-fail 补偿` + sweeper + 同键幂等 + 跨主体 RLS |
| 另轨 | `commerce:prove` / `commerce-reconcile:prove` / `neg:commerce` **≠** 本 UC 专用验收（可旁证，勿冒充） |
| 假绿禁令 | 不得把本绿写成「e2e:isolated 已含 017」或「全链路孤儿预占已闭环」 |
| 本绿≠全链路 E2E covered | **必须钉死**，直至 `e2e:isolated` 显式纳入 HTTP begin-fail 注入场景 |

专家：`mw-e2e-ha`。禁止作者自签 covered。

---

## 1. 测什么（O1–O4 可执行合同）

| ID | 场景 | 期望 | 执行体 |
|----|------|------|--------|
| **O1** | begin 侧预留成功（注入前） | `entitlement_consumption.status=reserved`；可用额度 CAS 扣减可观测 | `packages/db/test/uc-e2e-017-orphan-reservation.proof.ts` |
| **O2-sync** | begin-fail 同步补偿（reserve 后失败 → `releaseConsumption`） | `reserved→released`；额度净变 0 | 同上 |
| **O2-sweeper** | 无同步补偿的孤儿（租约过期）→ `reconcile` | `staleReleased≥1`；`released`；额度回补 | 同上（对齐 UC-INT-14 / TC-E2E-017-sweeper） |
| **O3** | 同 `idempotency_key` 重试 | `duplicate`；恰 1 行；不双扣 | 同上 |
| **O4** | 错主体 | RLS 0 行；`release`→`not_found`；原预占仍 reserved | 同上（与 UC-E2E-033 交叉但不替代） |

**明确不测 / BLOCKED（本 harness）**

| 非目标 | 原因 |
|--------|------|
| HTTP `POST …/begin` 故障注入 + SSE 建连失败 E2E | 当前 begin 内 `reserve+enqueue` 同事务；真孤儿需 commit 后故障点 / 进程崩溃；**尚未**进 `e2e:isolated` |
| 完整黄金路径 UC-E2E-001 | 另轨 |
| 退款业务 UC-E2E-011 | 另轨 |
| 云对账 / HA | Not HA · releaseEvidence=false |

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc017:orphan:prove` | **0** | O1–O4 集成断言绿；**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → green-risk / R5 |
| `pnpm uc017:orphan:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C packages/db prove:uc017-orphan` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-017`；≠业务 covered |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；需 Docker disposable PG（run-e2e-isolated）
pnpm uc017:orphan:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`packages/db/test/uc-e2e-017-orphan-reservation.proof.ts`  
入口：`package.json` → `uc017:orphan:prove` → `scripts/run-e2e-isolated.mjs uc017:orphan:prove:raw`

**旁证（≠本 UC 验收）**：`pnpm commerce:prove` / `pnpm commerce-reconcile:prove` 含 TTL 孤儿回收，但矩阵仍须以本 harness 命令为准。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「commerce:prove 绿了所以 017 covered」 | **假绿**。另轨 ≠ UC-E2E-017 |
| 「uc017:orphan:prove 绿 = covered」 | **假绿**。最多 **partial**；缺 HTTP/SSE 注入与 e2e:isolated 纳入 |
| 「写了 harness 所以 gap 关闭为 covered」 | **假绿**。partial ≠ covered |
| 「e2e:isolated 全绿含 017」 | **假绿** unless 显式 HTTP O1–O4 场景存在且矩阵已改 |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-017 | **partial**（集成 O1–O4）；**≠ covered** | `harness/uc-e2e-017-orphan-reservation.md` |
| 评测说明 | `eval/uc-e2e-017-orphan-reservation.eval.md` | 引用矩阵行 ID |
| P0-5 | 集成 prove 已挂；全链路 E2E 仍缺 | 见矩阵 §3 |

## 5. 审查

- `mw-e2e-ha`：确认未把 partial 写成 covered；确认 `本绿≠全链路 E2E covered`
- 产品 HTTP 故障注入另包；本文件钉集成合同 + 命令
