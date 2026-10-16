# Harness — E2E 目录重构 S4（conn-stack · mw-e2e-ha）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E / ≠ covered/HA** · **静态绿 ≠ live E2E** · **未声称 covered/HA**  
**切片**：**S4 only**（`scripts/conn-stack/` 显式 conn-only 区；legacy `scripts/mysql-stack.*` 薄 forwarders；**不** mass-move `e2e/*.e2e.ts` / 业务 `*.proof.ts`；**不**缩小 `LIVE_E2E_TARGETS`）  
**对照源**：
- `../adr-e2e-directory-restructure.md` D1/D2/D4 · §4 S4 · §11
- `../e2e-directory-target-structure.md` §3.1 · §6 S4
- `testing/conventions/e2e-directory-contract.md`（S4 演进目录）
- `scripts/e2e-platform/directory-contract.mjs`（`REQUIRED_CONN_STACK_*` / `checkConnStackLayoutRequired`）
- S3 CLEARED：`../reviews/2026-09-10-e2e-s3-shim-CLEARED.md`（已批准进 S4）

**硬禁**：禁止用 `mysql-stack:*:prove` / `conn-stack:*:prove` EXIT=0 冒充本切片「业务 E2E covered」或 sole-stack cutover；禁止把 UI 写成主评测；禁止本片宣称 LIVE 已缩 / covered/HA。

---

## 评哪些需求（conn-stack 诚实性，非 live）

| ID | 验收 | 通过 | 假绿 / 失败 |
|----|------|------|-------------|
| R1 | `scripts/conn-stack/` 落盘 | 目录存在；`mysql-stack.*.proof.mjs` bodies 在区内 | 仅口头 / 未建目录 |
| R2 | **别名不破** | `pnpm mysql-stack:*:prove` 仍可用（legacy forwarder 或直指）；可选 `conn-stack:*` | 批量断 `mysql-stack:*` 别名 |
| R3 | 薄 forwarders | `scripts/mysql-stack.*.proof.mjs` 委托 `conn-stack/`（小文件） | 双份全量 body / 断链 |
| R4 | **conn-only forever** | `isConnOnlyTarget('mysql-stack:…')===true`；`isProveShellTarget(…)==false`；同理 `conn-stack:` | 把 conn 标成 prove-shell / LIVE |
| R5 | **NEVER LIVE** | `LIVE_E2E_TARGETS` 仍三元且 **无** `mysql-stack:` / `conn-stack:` | 缩 Set 或把 conn 塞进 LIVE |
| R6 | 无 mass-move 测试 | `e2e/*.e2e.ts` / 域业务 `*.proof.ts` 未批量搬迁 | 大爆炸搬迁场景 |
| R7 | platform / inventory 绿 | `e2e-platform:check|prove` EXIT=0；`e2e-case-inventory:prove` EXIT=0 | check 无故红；或用 live e2e 顶替 |
| R8 | 本 harness + rollback | 本文件含回滚；legacy forwarders 保留 | 无 rollback / 已删别名入口 |
| R9 | ADR S4 状态 | ADR 文首/§4/§11：**S4 landed · dual-review CLEARED · ≠ covered/HA**（`reviews/2026-09-10-e2e-directory-s4-CLEARED.md`；**不自批** covered/HA） | ADR 未回填 / 自批 covered/HA |
| R10 | 非 UI · 禁连通冒充 | 文档仍钉 HTTP/SSE primary；F-CONN **永不** covered | UI 主评测 / BUG-FAKE-CONN |
| R11 | directory-contract 钉 | `checkConnStackLayoutRequired` + 既有 mysql-stack NEVER LIVE / NEVER prove-shell 钉 | 缺 REQUIRED_CONN_STACK / 松钉 |

### 静态钉（延续 S3 · S4 加强）

- **`mysql-stack:*` / `conn-stack:*` = conn-only forever**：`isConnOnlyTarget`；**NEVER** prove-shell；**NEVER** LIVE。
- API：`isProveShellTarget(t) === !isLiveE2eTarget(t) && !isConnOnlyTarget(t)`。
- 门禁：`directory-contract.mjs` → `checkConnStackLayoutRequired` + `checkIsolatedLayoutRequired` 既有
  `e2e_directory_contract_prove_shell_must_exclude_conn_only` /
  `e2e_directory_contract_mysql_stack_must_never_be_live` /
  `e2e_directory_contract_conn_only_mysql_stack_pin_missing` /
  `e2e_directory_contract_conn_only_conn_stack_pin_missing`（源码须含字面 `startsWith('conn-stack:')`）。
- **调用方不得**把 `isProveShellTarget` 绿或 `mysql-stack:*:prove` / `conn-stack:*:prove` EXIT=0 写成 E2E covered/HA（**连通绿 ≠ covered/HA**）。
- **未缩小** `LIVE_E2E_TARGETS`（仍三元）。

---

## 回滚（rollback）

| 方式 | 步骤 |
|------|------|
| **推荐** | `git revert`（或还原本切片涉及路径）；确认 `pnpm mysql-stack:skeleton:prove` 仍可调用 |
| **最小** | 将 `scripts/conn-stack/*.proof.mjs` bodies 迁回 `scripts/mysql-stack.*.proof.mjs`；删除 `scripts/conn-stack/`；还原 `directory-contract.mjs` REQUIRED_CONN_* / `checkConnStackLayoutRequired`；还原契约 MD / ADR §11；去掉可选 `conn-stack:*` 别名 |
| **勿做** | 为「回滚」去改 LIVE Set、mass-delete 域 prove、或宣称「回滚=已迁 sole-stack」 |

Legacy forwarder 路径在有 cite / package alias 期间应保留。

---

## 专家步骤（mw-e2e-ha · 第二域 mw-rag-route spot）

1. 确认 S3 审查已 **CLEARED / 批准进入 S4**。  
2. 打开本 harness + ADR §11：勾 R1–R11。  
3. `ls scripts/conn-stack/`：bodies 齐；`test -f scripts/mysql-stack.skeleton.proof.mjs`（forwarder）。  
4. `rg -n "LIVE_E2E_TARGETS" scripts/run-e2e-isolated.mjs` — Set **仍三元**（未缩）。  
5. `rg -n "mysql-stack:skeleton:prove" package.json` — 别名未破。  
6. 跑下方 CMD；记录 EXIT；**禁止**把 mysql-stack / conn-stack EXIT=0 记成业务 covered。  
7. 落 `reviews/YYYY-MM-DD-e2e-directory-s4-conn-stack-mw-e2e-ha.md` + rag spot：`pass` | `align-with-nits` | `reject`。  
8. 双域 CLEARED 后记 **S4 landed · dual-review CLEARED · ≠ covered/HA**（见 `reviews/2026-09-10-e2e-directory-s4-CLEARED.md`）；进 S5 仍一次一切片；reject 则按 rollback 退回。

---

## 命令与期望 EXIT

### 必选只读

```bash
test -d scripts/conn-stack && echo CONN_STACK_DIR_OK
test -f scripts/conn-stack/mysql-stack.skeleton.proof.mjs && echo CONN_BODY_OK
test -f scripts/mysql-stack.skeleton.proof.mjs && echo LEGACY_FORWARDER_OK
test -f ai-docs/delivery/harness/e2e-directory-s4-conn-stack.md && echo HARNESS_S4_OK
rg -n "LIVE_E2E_TARGETS" scripts/run-e2e-isolated.mjs
rg -n "checkConnStackLayoutRequired|REQUIRED_CONN_STACK" scripts/e2e-platform/directory-contract.mjs | head -20
node --input-type=module -e "
  import { isConnOnlyTarget, isProveShellTarget } from './scripts/isolated/targets-domain-prove.mjs';
  const samples = ['mysql-stack:ping:prove','mysql-stack:skeleton:prove','mysql-stack:r5-mark-red:prove','conn-stack:skeleton:prove'];
  for (const t of samples) {
    console.log(t, 'connOnly=' + isConnOnlyTarget(t), 'proveShell=' + isProveShellTarget(t));
  }
"
```

期望：conn-stack 目录 + bodies + legacy forwarders + harness 存在；Set 仍三元；对上述 samples：`connOnly=true` · `proveShell=false`。

### 必选静态 prove（EXIT=0 ≠ 重构完成 ≠ live E2E ≠ covered）

```bash
pnpm e2e-platform:check
pnpm e2e-platform:prove
pnpm e2e-case-inventory:prove
```

### 代表连通（静态优先；有环境才跑；**永不**计入 covered）

```bash
pnpm mysql-stack:skeleton:prove    # 期望 EXIT=0（静态）；≠ E2E covered
# 可选：pnpm conn-stack:skeleton:prove
# 可选：pnpm mysql-stack:ping:prove   # 需 Docker/compose 时；不可用则记 skip + 原因
```

### 禁止计入本切片成功 / covered

```bash
pnpm e2e:isolated                 # live；非本片范围
pnpm e2e:ui:isolated
pnpm performance:e2e:isolated
# 任意把 mysql-stack/conn-stack 绿写成 UC-E2E covered / sole-stack cutover
```

---

## 成功标准（S4）

- [ ] `scripts/conn-stack/mysql-stack.*.proof.mjs` bodies 落盘  
- [ ] legacy `scripts/mysql-stack.*.proof.mjs` 薄 forwarders；`mysql-stack:*:prove` 别名不破  
- [ ] `LIVE_E2E_TARGETS` **未缩**（仍三元）；mysql-stack/conn-stack ∉ LIVE  
- [ ] `isProveShellTarget('mysql-stack:…')===false` · `isConnOnlyTarget===true`  
- [ ] **无** mass-move 场景 / 业务 prove  
- [ ] `e2e-platform:check|prove` EXIT=0；`e2e-case-inventory:prove` EXIT=0  
- [x] 本 harness + rollback；ADR §11 回填（**S4 landed · dual-review CLEARED · ≠ covered/HA**）  
- [x] mw-e2e-ha (+ mw-rag-route spot) 已归档 CLEARED（`reviews/2026-09-10-e2e-directory-s4-CLEARED.md`）；**≠ covered/HA**  

**失败**：断别名；缩小 LIVE；UI 主评测；mass-move；用连通/live 绿顶替审；声称 covered/HA。

---

## EXIT 记录模板

| CMD | EXIT | 解读 |
|-----|------|------|
| `test -d scripts/conn-stack` | | 显式区存在 |
| `test -f scripts/mysql-stack.skeleton.proof.mjs` | | legacy forwarder |
| `pnpm e2e-platform:check` | | 0=合同+conn-stack 钉；≠ live |
| `pnpm e2e-platform:prove` | | 0=守卫；≠ live |
| `pnpm e2e-case-inventory:prove` | | 0=静态；≠已迁 |
| STATIC_B1 `isProveShellTarget('mysql-stack:ping|skeleton|r5-mark-red')` | | 必须 **false**；`connOnly=true` |
| `pnpm mysql-stack:skeleton:prove` | | 0=连通/静态；**≠ covered** |
| live e2e | **N/A** | 禁止计入 |
