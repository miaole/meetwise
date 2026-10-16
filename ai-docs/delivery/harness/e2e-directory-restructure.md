# Harness — E2E 目录重构 S0（ADR 计划审 · mw-e2e-ha）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E**  
**切片**：**S0 only**（docs/harness；**不搬迁代码**；不改 `LIVE_E2E_TARGETS` 行为）  
**对照源**：`../adr-e2e-directory-restructure.md` · `../e2e-directory-target-structure.md`（意见稿 §7 复审清单）  
**硬禁**：禁止用 `mysql-stack:*:prove` EXIT=0 冒充本切片成功或完整 E2E。

---

## 评哪些需求（计划诚实性，非 live）

| ID | 验收 | 通过 | 假绿 / 失败 |
|----|------|------|-------------|
| R1 | ADR + 本 harness 落盘 | 路径存在 | 口头方案 |
| R2 | **非 UI 为主** | ADR §0/D1 cite HTTP/SSE primary；UI = `apps/web/e2e-ui` 次要 | Playwright 写主评测 |
| R3 | 目标树 = 意见稿 §3.1 | 扁平 `e2e/*.e2e.ts` + 仅 `helpers/`；`scripts/isolated/` + `conn-stack/` 为后续目标 | 另建 `e2e/http/` 或领域子树 |
| R4 | **diff 表** | ADR §3 与意见稿逐条 align / nit 公开 | 无 diff 表或不承认分歧 |
| R5 | 迁移序 = S0→S1→S2→S3→S4 | 与意见稿 §6 同序；兼容期/shim 写清 | 大爆炸搬迁或 silent rename |
| R6 | 混乱点覆盖 | 名实不符壳、pgvector 默认、后缀抹平、UI=LIVE 同级、conn `*:prove` | 漏最大项（壳名实不符） |
| R7 | 禁连通冒充 | 显式 BUG-FAKE-CONN / F-CONN / Never E2E | mysql-stack 当 E2E 证据 |
| R8 | 本片无 mass-move | diff 无批量 `e2e/` 或 `**/test/*.proof.ts` 或 runner 行为改 | 已搬代码 |
| R9 | gate 一行 | `impl-review-gate.md` 钉非 UI E2E primary | 未更新 |

---

## 专家步骤（mw-e2e-ha）

1. 打开意见稿 `e2e-directory-target-structure.md` §7.1 十条 + 本 harness。  
2. 打开 ADR，逐条勾 §7.1；核 ADR §3 **diff 表**（须无 reject；nit 可接受）。  
3. 确认目标树**保持扁平**（拒 `e2e/http/`）。  
4. 确认切片边界 = S0；S1 LIVE 白名单文档化标为下一片。  
5. `git diff --stat`：仅 delivery docs / gate；无 scripts/e2e 行为改。  
6. 可选跑下方静态 CMD；**禁止**把 mysql-stack / live e2e 记入成功。  
7. 落 `reviews/YYYY-MM-DD-e2e-directory-restructure-mw-e2e-ha.md`：结论 `align` | `align-with-nits` | `reject` + R1–R9 + CMD/EXIT。  
8. 回填意见稿 §7.3：ADR 路径、复审日期、diff 表链接（本 ADR §3）。

---

## 命令与期望 EXIT

### 必选只读

```bash
test -f ai-docs/delivery/adr-e2e-directory-restructure.md && echo ADR_OK
test -f ai-docs/delivery/harness/e2e-directory-restructure.md && echo HARNESS_OK
test -f ai-docs/delivery/e2e-directory-target-structure.md && echo OPINION_OK
rg -n "非 UI|non-UI|e2e:isolated|主评测" ai-docs/delivery/impl-review-gate.md
rg -n "diff 表|S0|S1|LIVE_E2E_TARGETS|conn-stack|run-isolated|BUG-FAKE-CONN|扁平" \
  ai-docs/delivery/adr-e2e-directory-restructure.md
```

期望：三文件存在；gate 含非 UI primary；ADR 含 diff 表 + S0–S4 + 壳改名 + conn-stack + 禁连通冒充 + 扁平 e2e。

### 可选静态 prove（EXIT=0 ≠ 重构完成 ≠ live E2E）

```bash
pnpm e2e-case-inventory:prove    # 禁连通冒充钉仍在
pnpm e2e-platform:check          # 现行合同未因 S0 破坏
```

### 禁止计入本切片成功

```bash
pnpm mysql-stack:skeleton:prove   # … 任一 mysql-stack:* 
pnpm e2e:isolated                 # live；非本片范围
pnpm e2e:ui:isolated
```

---

## 成功标准（S0）

- [ ] ADR · harness · 意见稿路径齐；ADR 含 **目录 + 迁移 + 兼容期 + diff 表**  
- [ ] 非 UI 为主；UI 次要；禁 mysql-stack 冒充  
- [ ] 目标树对齐意见稿（扁平 helpers+`*.e2e.ts`；isolated 拆壳；conn-only 区）  
- [ ] 切片序 S0→S1 LIVE 文档→S2 契约→S3 shim→S4 conn-only  
- [ ] **无**代码/测试 mass-move  
- [ ] 可选静态 prove EXIT=0  
- [ ] 审查归档 + 意见稿 §7.3 回填  

**失败**：无 diff 表；UI 主评测；本片改 runner；连通绿顶替审。

---

## EXIT 记录模板

| CMD | EXIT | 解读 |
|-----|------|------|
| `test -f …/adr-e2e-directory-restructure.md` | | 存在 |
| `test -f …/harness/e2e-directory-restructure.md` | | 存在 |
| `pnpm e2e-case-inventory:prove`（可选） | | 0=静态；≠已迁 |
| `pnpm e2e-platform:check`（可选） | | 0=合同未破；≠ live |
| `mysql-stack:*` / live e2e | **N/A** | 禁止计入 |
