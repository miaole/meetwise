# Harness — E2E 目录重构 S3（shim / 清晰入口 · mw-e2e-ha）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E** · **静态绿 ≠ live E2E** · **未声称 covered/HA**  
**切片**：**S3 only**（`scripts/isolated/` 薄入口 + LIVE/prove-shell 模块；**不** mass-move 测试；**不**缩小 `LIVE_E2E_TARGETS`；**不**建 `scripts/conn-stack/` = S4）  
**对照源**：
- `../adr-e2e-directory-restructure.md` D2/D6 · §4 S3
- `../e2e-directory-target-structure.md` §3.1 · §6 S3
- `testing/conventions/e2e-directory-contract.md`（S3 演进目录）
- `scripts/e2e-platform/directory-contract.mjs`（`REQUIRED_ISOLATED_FILES` / `checkIsolatedLayoutRequired`）
- S2 审查：`../reviews/2026-09-10-e2e-directory-s2-contract-mw-e2e-ha.md`（**已批准进 S3**）

**硬禁**：禁止用 `mysql-stack:*:prove` EXIT=0 冒充本切片成功或完整 E2E；禁止把 UI 写成主评测；禁止本片宣称 body 已全部迁完 / LIVE 已缩 / covered/HA。

---

## 评哪些需求（shim 诚实性，非 live）

| ID | 验收 | 通过 | 假绿 / 失败 |
|----|------|------|-------------|
| R1 | `scripts/isolated/` 落盘 | `run-isolated.mjs` · `targets-live-e2e.mjs` · `targets-domain-prove.mjs` 存在 | 仅口头 / 未建目录 |
| R2 | **清晰入口不破别名** | `pnpm e2e:isolated` / `REQUIRED_PACKAGE_SCRIPTS` 仍指向 `scripts/run-e2e-isolated.mjs`；新入口为薄 forward | 批量改 package.json 脚本名或断别名 |
| R3 | prove-shell 命名诚实 | `targets-domain-prove.mjs` 明示域 prove ≠ LIVE covered | 把 memory/rag prove 写成 LIVE |
| R4 | LIVE 白名单诚实 | `targets-live-e2e.mjs` 主集 ⊆ `{e2e:prove, performance:e2e}`；`e2e:ui` = secondary；**代码 Set 仍三元** | 擅自缩小 Set / 文档与代码冲突隐瞒 |
| R5 | **未缩小 LIVE** | `rg LIVE_E2E_TARGETS` 仍 `{e2e:prove, e2e:ui, performance:e2e}` | 无 dual approval 删 `e2e:ui` 或主集成员 |
| R6 | 无 mass-move 测试 | `e2e/*.e2e.ts` / 域 `*.proof.ts` 未批量搬迁；conn-stack **未**建 | 大爆炸搬迁或偷跑 S4 |
| R7 | platform / inventory 绿 | `e2e-platform:check|prove` EXIT=0；`e2e-case-inventory:prove` EXIT=0 | check 无故红；或用 live e2e 顶替 |
| R8 | 本 harness + rollback | 本文件含回滚步骤；旧入口保留 | 无 rollback / 已删 legacy |
| R9 | ADR S3 状态 | ADR 文首/§4/§10 标 S3 shim done（待独立审） | ADR 未回填 |
| R10 | 非 UI · 禁连通冒充 | 文档仍钉 HTTP/SSE primary；mysql-stack ∉ LIVE | UI 主评测 / BUG-FAKE-CONN |
| R11 | **mysql-stack NEVER prove-shell · NEVER LIVE** | `isProveShellTarget('mysql-stack:…')===false` · `isConnOnlyTarget` · `directory-contract` / `checkIsolatedLayoutRequired` 静态钉 | 把 conn-only 误标 prove-shell；或把 `isProveShellTarget` 绿写成 covered |


### 静态钉（S3 follow-up · mw-rag-route conditional 关闭条件）

- **`mysql-stack:*` = conn-only forever**：`isConnOnlyTarget`；**NEVER** prove-shell；**NEVER** LIVE。
- API：`isProveShellTarget(t) === !isLiveE2eTarget(t) && !isConnOnlyTarget(t)`（或等价）。
- 门禁：`scripts/e2e-platform/directory-contract.mjs` → `checkIsolatedLayoutRequired` 钉
  `e2e_directory_contract_prove_shell_must_exclude_conn_only` /
  `e2e_directory_contract_mysql_stack_must_never_be_live` /
  `e2e_directory_contract_conn_only_mysql_stack_pin_missing`。
- **调用方不得**把 `isProveShellTarget` 绿写成 conn-only covered / E2E covered。
- **未缩小** `LIVE_E2E_TARGETS`（仍三元）；缩 Set 需 dual approval（mw-e2e-ha + mw-rag-route）。

---

## 回滚（rollback）

| 方式 | 步骤 |
|------|------|
| **推荐** | `git revert`（或还原本切片涉及路径）；确认 `scripts/run-e2e-isolated.mjs` 仍可被 `pnpm e2e:isolated` 调用 |
| **最小** | 删除 `scripts/isolated/`；将 `directory-contract.mjs` 的 `checkIsolatedLayoutRequired` / REQUIRED_ISOLATED 钉回 S2「FUTURE optional」；还原契约 MD / ADR S3 回填 |
| **勿做** | 为「回滚」去改 LIVE Set 或 mass-delete 域 prove 包装 |

旧入口点 **必须保留**直至零引用 + platform 门与 R5/static 扫描钉同步更新（另片）。

---

## 专家步骤（mw-e2e-ha · 第二域 mw-rag-route spot）

1. 确认 S2 审查已 **批准进入 S3**。  
2. 打开本 harness + ADR §10：勾 R1–R10。  
3. `ls scripts/isolated/`：三文件齐；`test -f scripts/run-e2e-isolated.mjs`。  
4. `rg -n "LIVE_E2E_TARGETS" scripts/run-e2e-isolated.mjs` — Set **仍三元**（未缩）。  
5. `rg -n "e2e:isolated" package.json` — 仍 `node scripts/run-e2e-isolated.mjs`。  
6. `test ! -d scripts/conn-stack`（未偷跑 S4）。  
7. 跑下方 CMD；记录 EXIT；**禁止**把 mysql-stack / live e2e 记入成功。  
8. 落 `reviews/YYYY-MM-DD-e2e-directory-s3-shim-mw-e2e-ha.md` + rag spot：`pass` | `align-with-nits` | `reject`。  
9. **通过后方可进 S4**（conn-stack）；reject 则按 rollback 退回。

---

## 命令与期望 EXIT

### 必选只读

```bash
test -f scripts/isolated/run-isolated.mjs && echo ISOLATED_ENTRY_OK
test -f scripts/isolated/targets-live-e2e.mjs && echo TARGETS_LIVE_OK
test -f scripts/isolated/targets-domain-prove.mjs && echo TARGETS_PROVE_OK
test -f scripts/run-e2e-isolated.mjs && echo LEGACY_IMPL_OK
test -f ai-docs/delivery/harness/e2e-directory-s3-shim.md && echo HARNESS_S3_OK
rg -n "LIVE_E2E_TARGETS" scripts/run-e2e-isolated.mjs
rg -n "e2e:isolated|REQUIRED_ISOLATED|checkIsolatedLayoutRequired" package.json scripts/e2e-platform/directory-contract.mjs | head -40
test ! -d scripts/conn-stack; echo "conn_stack_absent_exit=$?"
```

期望：三 isolated 文件 + legacy impl + harness 存在；Set 仍三元；别名未破；conn-stack 缺席。

### 必选静态 prove（EXIT=0 ≠ 重构完成 ≠ live E2E ≠ covered）

```bash
pnpm e2e-platform:check
pnpm e2e-platform:prove
pnpm e2e-case-inventory:prove
```

### 禁止计入本切片成功

```bash
pnpm mysql-stack:skeleton:prove   # … 任一 mysql-stack:*
pnpm e2e:isolated                 # live；非本片范围
pnpm e2e:ui:isolated
pnpm performance:e2e:isolated
```

---

## 成功标准（S3）

- [ ] `scripts/isolated/{run-isolated,targets-live-e2e,targets-domain-prove}.mjs` 落盘  
- [ ] package.json / `e2e:isolated` 别名不破；legacy `run-e2e-isolated.mjs` 保留  
- [ ] `LIVE_E2E_TARGETS` **未缩**（仍三元）  
- [ ] **无** mass-move 测试；**无** `scripts/conn-stack/`  
- [ ] `e2e-platform:check|prove` EXIT=0；`e2e-case-inventory:prove` EXIT=0  
- [ ] 本 harness + rollback 节；ADR S3 回填  
- [ ] R11：mysql-stack ∉ prove-shell ∩ ∉ LIVE（API + directory-contract 静态钉）  
- [ ] mw-e2e-ha (+ mw-rag-route spot) 审查归档后方可 S4  

**失败**：断别名；缩小 LIVE 无 dual approval；UI 主评测；mass-move；偷跑 S4；用连通/live 绿顶替审；声称 covered/HA。

---

## EXIT 记录模板

| CMD | EXIT | 解读 |
|-----|------|------|
| `test -f scripts/isolated/run-isolated.mjs` | | 清晰入口存在 |
| `test -f scripts/run-e2e-isolated.mjs` | | legacy 保留 |
| `pnpm e2e-platform:check` | | 0=合同+isolated 钉；≠ live |
| `pnpm e2e-platform:prove` | | 0=守卫；≠ live |
| `pnpm e2e-case-inventory:prove` | | 0=静态；≠已迁 |
| `mysql-stack:*` / live e2e | **N/A** | 禁止计入 |
| `isProveShellTarget('mysql-stack:…')` | | 必须 **false**（conn-only） |
| directory-contract mysql-stack pins | | 含于 platform:check |
