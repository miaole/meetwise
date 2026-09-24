# PRE-EXEC · GAP-UC052-POOL-ROLE-LEAK · mw-privacy-int

| 字段 | 值 |
|------|-----|
| 角色 | `mw-privacy-int` |
| 时刻 | 2026-09-23 21:41 PDT |
| 类型 | PRE-EXEC（编码前双人审） |
| REQUEST | `2a0cc3a`（docs only；父钉 `913f21d`） |
| 审查工作树 | `/workspace/wt-pi-pre-pool` @ `2a0cc3a`（detached；未改共享 worktree / stash） |
| Harness | `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md` |
| Slice | `ai-docs/delivery/uc-e2e-052-pool-role-leak.slice.md` |
| Pins | `haStatus=NOT_HA` · `releaseEvidence=false` · 公开 DELETE=503 · PG-retained · 外部=`retention_pending` · Ban covered · Ban 开 DELETE · Ban retry-to-green |

**原则**：只采信本角色亲跑 EXIT 与亲读源码；不采信口头声明。本收据 **更正** 既有 post-prove `118e28f` 披露 (c)，**不改写**旧收据。

---

## 0. 自我更正 · `118e28f`(c) 裁定有误

**旧裁定（`118e28f` §5）**：SET ROLE 泄漏「=测试侧池复用」；产线 `createCheckpointer` 自建专用 pool →「不升为产品阻断」；仅非阻断 `GAP-PRIV-SAVER-POOL-ROLE-ISOLATION`。

**事实（`69de818` 与 `2a0cc3a` 同源，文件未变）**：

1. `apps/worker/src/checkpoint-principal.ts` **L51–54**：`SET ROLE app_role` + `set_config(..., false)` ×3；`connect` 返回的 client **未包装 release**，无 `RESET ROLE` / 无清 GUC。
2. 产线调用链：`apps/worker/src/main.ts` **`createCheckpointer(undefined, true)`**（约 L436）→ `new PrincipalBoundCheckpointPool(pool).asPool()` 交给 `PostgresSaver`。`useRuntimeRole=true` **就是** worker 启动路径。
3. 该 pool 虽为 saver 专用，但 **同一物理连接跨 `withCheckpointAccess` 复用**：会话级 ROLE/GUC 在 release 后残留，下一借用人（另一 owner/thread/epoch）可见 → **产品隐私/RLS 风险**，不是「仅测试」问题。
4. `69de818` 只把 **proof** 的 admin 池与 saver 池拆开，**未改** `checkpoint-principal.ts`。

**更正结论**：`118e28f`(c) 将缺口降为测试侧/非阻断 **有误**。本刀将 `GAP-UC052-POOL-ROLE-LEAK`（合并 `GAP-PRIV-SAVER-POOL-ROLE-ISOLATION`）**升为产品风险**，必须产品修复 + 真产线路径 bleed prove。旧收据保持不动，以本段为准。

---

## 1. CMD \| EXIT（本机 @ `2a0cc3a` · **禁止刷绿重试**）

| # | CMD | EXIT | 备注 |
|---|-----|------|------|
| 1 | `pnpm privacy-authorization:prove`（新鲜隔离栈 **首跑**） | **0** | 本环境未复现 ECONNREFUSED；**不得**据此声称 flake 已灭。历史 e2e-ha @`69de818` attempt#1 EXIT=1 `ECONNREFUSED` 仍记入 (3)。 |
| 2 | `pnpm uc052:checkpoint-physical:prove` | **0** | 13/13 PASS；回归基线仍绿；**≠** 本 GAP 已关。 |

未对失败做第二次尝试（首跑已绿）。`scripts/run-e2e-isolated.mjs` 内 `migrateWithRecovery` 最多 2 次 migrate、`waitForPostgres` 最多 60s——属隔离器就绪逻辑；**证明用例本身**未见 retry-to-green 包装，但仍须在 flake RCA 中审查是否掩盖首跑失败。

---

## 2. 范围核对（REQUEST 三件）

| ID | 类 | 本审态度 |
|----|----|----------|
| GAP-UC052-POOL-ROLE-LEAK | PRODUCT | **必须修**（见 §0 更正） |
| NOTE-CKPT-UNSEALED-CLAIM-NEG | prove 诚实 | **必须加**显式 claim-before-seal NEG（0091 已拒，checkpoint prove 未证） |
| GAP-PRIV-AUTHZ-PROVE-FLAKE | e2e 诚实 | **必须 RCA**；Ban retry-to-green 当证据 |

Allowlist 合理：`checkpoint-principal.ts` + worker/db test + checkpoint proof 仅加 NEG + package.json 接线。Ban 新路由 / 新 GRANT / 开 DELETE。

---

## 3. 裁定 A–E

### A. SET LOCAL vs RESET（隐私授权模型）— **主修复必须是 release 清理**

- `PostgresSaver`（`@langchain/langgraph-checkpoint-postgres`）**混用**：
  - **读路径**：`this.pool.query(...)` → 经 façade `query()`→`connect()`→单条 SQL →`release()`，**自动提交、无 BEGIN**；
  - **写路径**：`pool.connect()` 后 **自管** `BEGIN`…`COMMIT`/`ROLLBACK`。
- 在 façade `connect()` 里发 `SET LOCAL` / `set_config(..., true)` 时，读路径 **尚无事务** → PG 下 SET LOCAL **无效（仅 warning）**；写路径随后 `BEGIN` 也 **不会**继承此前事务外的 SET LOCAL。
- 因此：**不能把 SET LOCAL 当主修复**（否则 SELECT 仍依赖会话态，或 SET LOCAL 根本未生效）。
- **推荐主机制**：保持会话级 `SET ROLE` + `set_config(..., false)`（以匹配 saver 的 autocommit `pool.query`），并 **包装 `client.release`**：在归还池前 `RESET ROLE;` + 将 3 个 GUC `set_config(..., '', false)`（或等价清空），失败路径 `try/finally` 必跑；可加 `DISCARD ALL` 作纵深（需评估对 prepared statement 的影响）。
- **SET LOCAL 仅可作**「若未来改为强制显式事务包装所有 saver SQL」的备选，**不得**作为本刀唯一方案。
- Harness「SET LOCAL **或** RESET」的 **或** 须在编码时按本裁定收窄（见 C1）。

### B. Bleed 测试规格 — **当前 harness 不足 → 编码条件**

必须同时满足：

1. **真产线工厂**：`createCheckpointer(..., true)` + `PrincipalBoundCheckpointPool` / `withCheckpointAccess`（`apps/worker/src/main.ts` + `checkpoint-principal.ts`），禁只测手搓测试池。
2. **真 PG**；`max=1`（或钉死同一物理连接）以强制复用。
3. 下一借用人断言：`current_user`、`session_user`、以及 3 个 GUC 的 `current_setting(..., true)`（缺失应为 null/空，不得残留上一 principal）。
4. **中途 abort/throw** 后再 checkout，仍无残留。
5. **致红突变**：恢复旧会话级、无 RESET 实现时测试必须变红。

Harness NHP-POOL-NEG-01 未写全 → **C2** 绑定。

### C. Flake 根因门槛 — **计划未达标**

合格 RCA = 可复现的确定性解释 + (i) 故意致红并留日志 (ii) 针对因的修复 (iii) **N≥5** 次新鲜容器 **首跑** EXIT=0、全尝试入账、**禁止** retry/sleep 洗绿/跳序/吞错。

Harness 仅记历史 ECONNREFUSED；本机首跑 EXIT=0 **不能**当关闭证据。隔离器 migrate 双尝试须纳入排查。→ **C3**（关闭本子项前必须满足）；未满足前 **不得**宣称 GAP-PRIV-AUTHZ-PROVE-FLAKE 关闭。

### D. Unsealed claim NEG — **方向对 · 须补正控**

0091 **L369–374** 对 `request_epoch`/`request_digest` IS NULL 已 `RAISE`（`privacy_authorization_epoch_mismatch` / `digest_mismatch`）。计划须在 checkpoint prove 断言 **DB 级**拒绝（特定 ERRCODE/消息或 0 行），并有 **seal 后 claim 成功** 正控。→ **C4**。

### E. 无新路由/GRANT · DELETE=503 · prove 名 — **PASS**

- Allowlist 无 apps 路由、无 migration GRANT；本机 NEG-03 / http 基线 DELETE=503。
- 计划名 `pnpm uc052:pool-role-leak:prove` 与现有 `uc052:checkpoint-physical:prove` 等 **不冲突**（package.json 尚无此名）。→ **C5**：落地名保持唯一；成功 ≠ 宣称 UC covered。

---

## 4. Blockers / Conditions

### Blockers
（无文档级硬阻断。SET LOCAL 歧义以 **C1** 收窄，不挡双人授权后编码；若实现只交 SET LOCAL、无 release 清理 → post-prove **FAIL**。）

### 编码条件（授权后必须遵守）

| ID | 条件 |
|----|------|
| **C1** | 主修复 = **release 路径** `RESET ROLE` + 清除 3 GUC（try/finally）；**禁止**仅 SET LOCAL / `set_config(..., true)` 作为唯一机制。收据须引用 PostgresSaver `pool.query` autocommit 约束。 |
| **C2** | Bleed prove 用 **真** `createCheckpointer(..., true)` 产线路径 + 真 PG + max=1/钉连；断言 `current_user`/`session_user`/3 GUC；含 abort 后再借；含旧码致红突变。 |
| **C3** | Authz flake：记录每次尝试；RCA 达 §3C；N≥5 首跑全绿无重试；禁 sleep/timeout/跳案洗绿。本机单次 EXIT=0 ≠ 关闭。 |
| **C4** | UNSEALED NEG：DB 级拒（0091 L369–374）+ 特定错误 + seal 后 claim 正控。 |
| **C5** | 无新 HTTP 路由 / 无 app_role 再 GRANT；公开 DELETE 保持 503；prove 名唯一（建议 `uc052:pool-role-leak:prove`）；checkpoint-physical 回归绿 ≠ 本 GAP 关闭。 |
| **C6** | Pins 不变：NOT_HA · releaseEvidence=false · PG-retained · externals retention_pending · Ban invent covered。 |

---

## 5. Checklist（相对 stub）

- [x] 产品泄漏 L51–54 属实 · 升产品风险 · 更正 `118e28f`(c)
- [x] 修复方向按 A 收窄（RESET-on-release 主）
- [x] Unsealed NEG 引用 0091 L369–374 + 正控条件
- [x] Flake：首跑已记；Ban retry-to-green；RCA 门槛 C3
- [x] NHP 非开心优先 · prove 名不撞车
- [x] 无洗 checkpoint-physical 单独绿

---

Verdict: PASS
