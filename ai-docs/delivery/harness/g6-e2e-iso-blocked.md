# Harness — G6 e2e:isolated / LIVE family · Key-unset **blocked** honesty（≠ family green）

**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ migrated** · **G6 仍 OPEN（BUG-E2E-ISO 未关）**  
**平行**：`r5-retirement-sole-stack-status.md` **G6** · `uc-e2e-001-golden-path.eval.md` §1a live-blocked · `e2e-live-targets-whitelist.md` · `e2e-full-suite.inventory.md` · `e2e-case-inventory.md` F-ISO / F-ISO-UI / F-PERF  
**硬句**：**无 `MODEL_API_KEY` → 宽 `e2e:isolated` / LIVE HTTP·UI 记 blocked**；**禁止**假绿 / skip-as-pass；**本 prove EXIT=0 = 钉 blocked ≠ family 绿**；**有 Key 才允许硬跑**；**硬跑绿仍 ≠ sole-stack / ≠ G6 关**（夹具仍 pgvector-legacy 默认）。  
**纪律对齐**：与 UC-001 `uc001:live-blocked:prove` 同族 — Key unset → honesty pin；**不发明 Key**；**不读 `.env*`**。

关联：`pnpm g6-e2e-iso-blocked:prove` · `scripts/g6-e2e-iso-blocked.proof.mjs` · `scripts/run-e2e.mjs` / `run-e2e-ui.mjs` · `scripts/isolated/targets-live-e2e.mjs` · BUG-E2E-ISO · BUG-FAKE-R5

---

## 0. 本切片范围（硬边界）

| 做 | 不做（FORBIDDEN 本轮） |
|----|------------------------|
| 库存 LIVE / `e2e:isolated` 族 **谁需要 Key** | **硬跑** `pnpm e2e:isolated` / `e2e:ui:isolated`（无 Key） |
| Key unset → **blocked** 诚实钉 + runner fail-closed 源码钉 | 发明 / 注入假 Key；读 `.env*` 值 |
| 文档化 **有 Key 时硬跑 Path**（仍标 R5；≠ G6 关） | 宣称 G6 / BUG-E2E-ISO **已关** / family **covered** |
| harness + 静态/轻量 prove + status G6 叙事 | 翻默认 `E2E_ISOLATION_STACK`；退役 `E2E_PG_IMAGE`；勾 `releaseEvidence=true` |
| 双域送审（`mw-e2e-ha` + `mw-rag-route`） | 把 performance-only 绿写成 G6 关；把本 prove 绿写成 live covered |

---

## 1. Inventory — e2e:isolated / LIVE 目标 vs Key

### 1.1 LIVE 代码 Set（`LIVE_E2E_TARGETS` · 三元；勿缩 Set）

| Target | package.json 包装 | Runner | 需要 `MODEL_API_KEY`？ | 无 Key 裁定 |
|--------|-------------------|--------|----------------------|-------------|
| `e2e:prove` | `e2e:isolated` | `scripts/run-e2e.mjs` → `e2e/full.e2e.ts` | **是** | **blocked**；误跑 → `live_provider_key_missing`（非 0；≠ skip-as-pass） |
| `e2e:ui` | `e2e:ui:isolated` | `scripts/run-e2e-ui.mjs` → Playwright | **是** | **blocked**；同上 fail-closed |
| `performance:e2e` | `performance:e2e:isolated` | `scripts/run-performance-e2e.mjs` | **否**（API 并发门；不把模型时延计入） | 可跑；**≠** 关闭 G6；禁假服务旗 |

**ADR 主集**：LIVE primary ⊆ `{e2e:prove, performance:e2e}`；`e2e:ui` = secondary。  
**G6 关条件**（status）：宽 `e2e:isolated` / LIVE / performance **整套**在 sole 上复跑并过 inventory 复审 — **缺 Key 时 HTTP/UI LIVE 无法诚实硬跑 → G6 不得关**。

### 1.2 相关但非 LIVE primary（易混淆）

| 入口 | Key？ | 与 G6 关系 |
|------|-------|------------|
| `verify:e2e-performance` | 编排含 `performance:e2e:isolated`（无 Key）+ 其他步 | suite ≠ 单场景 LIVE；≠ G6 关 |
| `scoring:eval:raw` | 要 Key；缺则 SKIP EXIT=0 | **非** LIVE Set；SKIP≠假绿 live；≠ G6 |
| 域 `*:prove` 借壳 isolated | 多数无 Key | **≠** live E2E covered；≠ G6 |
| `uc001:live-blocked:prove` | 无 Key 诚实钉 | **同族纪律**；钉 UC-001；本 harness 钉 **整族 G6** |

### 1.3 夹具诚实（与 Key 正交）

| 钉 | 裁定 |
|----|------|
| 默认 isolation | 仍 `pgvector-legacy`（G1 flip NOT open） |
| 默认 `E2E_PG_IMAGE` | 仍 `pgvector/pgvector:pg16`（G3 默认值仍 OPEN） |
| 即使有 Key 且 `e2e:isolated` EXIT=0 | 仍 **green-risk / R5**；**≠** sole-stack；**≠** G6 关（G6 要 sole 整套复跑） |

---

## 2. blocked(无 Key) — 诚实钉（本切片可执行）

| 声明 | 裁定 |
|------|------|
| 本环境 `MODEL_API_KEY` | **unset**（仅 `process.env` 名探测；**不读** `.env*`；不打印值；不发明 Key） |
| LIVE HTTP / UI | **blocked**(无 Key) — **禁止**硬跑 `pnpm e2e:isolated` / `e2e:ui:isolated` 冒充绿 |
| 若误跑 runner | **fail-closed**：`tagE2EFailure('provider','live_provider_key_missing')` → 非 0 |
| performance | 无 Key 可机械跑；**不得**单独写成「G6 / BUG-E2E-ISO 已关」 |
| 本 prove | `pnpm g6-e2e-iso-blocked:prove` → **EXIT=0** = 库存+源码+文档诚实钉「family blocked」；**≠** family 绿；**≠** G6 关 |
| status G6 | **仍 OPEN**；本切片只关「无 Key 假绿面」叙事，**不**关 BUG-E2E-ISO |
| releaseEvidence | **false** · **Not HA** |

假绿禁令：「无 Key 跳过=pass」「g6 prove 绿=e2e:isolated 绿」「performance 绿=G6 关」「UC-001 live-blocked 绿=全族 covered」。

---

## 3. Path when Key present（硬跑北星 · 非本 prove 已绿）

> Key 到位后才允许硬跑；收据必须分家族记 EXIT。**仍须**标 fixture=pgvector → R5；sole 复跑另轨才谈关 G6。

```bash
# 前置探测（不打印值）
if [ -n "${MODEL_API_KEY:-}" ]; then echo 'MODEL_API_KEY=set'; else echo 'MODEL_API_KEY=unset → BLOCKED'; fi

# —— 无 Key：禁止硬跑；记 blocked；只跑本诚实钉 ——
pnpm g6-e2e-iso-blocked:prove ; echo "CMD=pnpm g6-e2e-iso-blocked:prove EXIT=$?"

# —— 有 live MODEL_API_KEY + Docker 时（硬跑；逐家族记 EXIT）——
pnpm e2e:isolated ; echo "CMD=pnpm e2e:isolated EXIT=$?"
pnpm e2e:ui:isolated ; echo "CMD=pnpm e2e:ui:isolated EXIT=$?"
pnpm performance:e2e:isolated ; echo "CMD=pnpm performance:e2e:isolated EXIT=$?"
# 可选套件：pnpm verify:e2e-performance

# G6 关闭另需：sole-stack 上整套复跑 + mw-e2e-ha 对照 inventory（本切片不宣称）
```

| # | 抬向「可讨论关 G6」仍缺 | 说明 |
|---|------------------------|------|
| 1 | live `MODEL_API_KEY` 到位 | 本环境 unset → blocked |
| 2 | HTTP/UI/perf 家族硬跑收据 | 无 Key 不得伪造 |
| 3 | sole-stack isolation 上复跑（非默认 pgvector-legacy） | G1–G3 / BUG-E2E-ISO |
| 4 | mw-e2e-ha 对照 inventory 复审 | status G6 关闭条件 |

---

## 4. Prove gates

| Gate CMD | 期望 | 含义 |
|----------|------|------|
| `pnpm g6-e2e-iso-blocked:prove` | **0** | inventory + Key unset blocked + runner fail-closed 源码钉 + status G6 仍 OPEN |
| `pnpm uc001:live-blocked:prove` | **0** | 交叉：同族 UC-001 纪律仍绿 |
| `pnpm e2e:isolated` / `e2e:ui:isolated`（无 Key） | **勿跑**；若直跑 `run-e2e.mjs` → 非 0 | 禁止假绿 |
| status 人工读 | n/a | G6：**Key-unset blocked honesty landed** · **BUG-E2E-ISO 仍 OPEN** · releaseEvidence=false |

---

## 5. FORBIDDEN claims（显式）

**禁止**因本 harness / prove EXIT=0 宣称或暗示：

1. **G6 已关闭** / **BUG-E2E-ISO 已关** / 宽 isolated 家族 **covered**  
2. `e2e:isolated` / LIVE HTTP·UI **已绿**（无 Key 收据）  
3. performance-only 绿 = G6 关  
4. 翻默认 isolation / 退役默认 `E2E_PG_IMAGE` / fixtures retired  
5. cutover / migrated / HA / `releaseEvidence=true`  
6. 缩 `LIVE_E2E_TARGETS` Set（须 dual approval）  
7. 本切片读取或泄漏 `.env*` / 发明 Key  

**允许宣称**：G6 **Key-unset blocked honesty pin**；LIVE HTTP/UI **无 Key = blocked**；有 Key 后硬跑 Path 已文档化；**G6 / BUG-E2E-ISO 仍 OPEN**。

---

## 6. Dual-review packet（`mw-e2e-ha` + `mw-rag-route`）

送审对照（实现方 **不自批**）：

1. 本 harness §0–§5 范围与 FORBIDDEN  
2. Inventory §1：三 LIVE target Key 需求表 + performance 无 Key ≠ G6 关  
3. `run-e2e.mjs` / `run-e2e-ui.mjs`：`live_provider_key_missing` fail-closed  
4. `pnpm g6-e2e-iso-blocked:prove` 独立复跑 EXIT=0（Key unset）  
5. status G6：honesty pin landed · **仍 OPEN**（不得写成 G6 关）  
6. 对抗：prove 绿 ≠ family 绿；≠ UC-001 covered 外推全族  

结论落 `ai-docs/delivery/reviews/`（审稿人写）。

---

## G7-A cross-pin（Key-blocked×3 · 2026-09-16 ~19:48 PT）

| CMD | Honesty |
|-----|---------|
| `pnpm e2e:isolated` | **blocked**（no Key）· ≠ family green · **no invent Key** · **no hard-run this knife** |
| `pnpm e2e:ui:isolated` | **blocked**（no Key）· ≠ UI covered |
| `pnpm verify:e2e-performance` | **blocked**（no Key）· ≠ SLO/LOAD/HA |
| G6 | **still OPEN** · BUG-E2E-ISO open · cite knife K3 separate |
| Pointer | `harness/g7-key-blocked-x3-honesty.md` · `releaseEvidence=false` · **Not HA** |

*G6 · G7-A cross-pin · Key unset → 3× blocked retained · ≠ family green · ≠ G6 closed*
