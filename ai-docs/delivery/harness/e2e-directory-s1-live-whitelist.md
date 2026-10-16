# Harness — E2E 目录重构 S1（LIVE 白名单文档 · mw-e2e-ha）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E** · **静态绿 ≠ live E2E**  
**切片**：**S1 only**（docs；**不改** `LIVE_E2E_TARGETS` 行为；**不**改 `run-e2e-isolated.mjs`；**无** mass-move）  
**对照源**：
- `../e2e-live-targets-whitelist.md`（本片主交付）
- `../adr-e2e-directory-restructure.md` D5 · §4 S1
- `../e2e-directory-target-structure.md` §3.2 · §6 S1 · §7
- S0 审查：`../reviews/2026-09-10-e2e-directory-restructure-s0-mw-e2e-ha.md`（已批准进 S1）

**硬禁**：禁止用 `mysql-stack:*:prove` EXIT=0 冒充本切片成功或完整 E2E；禁止把 UI 写成主评测。

---

## 评哪些需求（文档诚实性，非 live）

| ID | 验收 | 通过 | 假绿 / 失败 |
|----|------|------|-------------|
| R1 | 白名单文档落盘 | `delivery/e2e-live-targets-whitelist.md` 存在 | 口头/散落注释 only |
| R2 | **非 UI 为主** | 白名单钉 HTTP/SSE primary = `{e2e:prove, performance:e2e}`（+ isolated 包装）；UI = secondary | Playwright / `e2e:ui` 写主评测 |
| R3 | LIVE 列表非空 | 至少列出 `e2e:prove` 与 `performance:e2e` 为 LIVE primary | 空表 / 只写 UI |
| R4 | **禁 mysql-stack 为 LIVE** | conn-only 节显式列出全部 `mysql-stack:*`；永不 LIVE / 永不 covered | mysql-stack 进 LIVE 表 |
| R5 | 三车道齐全 | LIVE · prove-via-isolated-shell · conn-only；含 package.json 脚本名 | 只列 LIVE 或抹平后缀 |
| R6 | 引用 ADR + 意见稿 | cite D5 / 意见稿 §6 S1 | 无引用 |
| R7 | 代码 vs 文档差诚实 | 承认今日 Set 仍含 `e2e:ui`；S1 **不改行为** | 声称已移出 Set / 已拆壳 |
| R8 | 本片无 runner 行为改 / 无 mass-move | `LIVE_E2E_TARGETS` 仍三元；无 `scripts/isolated/` 偷建 | 已改 Set 或搬文件 |
| R9 | ADR S1 状态已更新 | ADR 标明 S1 docs in-progress/done | ADR 仍写「仅 S0 / S1 待钉」无回填 |
| R10 | 本 harness 落盘 | 本文件存在 | 无审查入口 |

---

## 专家步骤（mw-e2e-ha）

1. 确认 S0 审查已 **批准进入 S1**。  
2. 打开 `e2e-live-targets-whitelist.md`：勾 R1–R7（非 UI primary · LIVE 非空 · 禁 mysql-stack LIVE · 三车道 · cite）。  
3. 打开 ADR：确认 D5 与白名单一致；§4 S1 状态已标 docs done/in-progress。  
4. 只读对照代码：`rg -n "LIVE_E2E_TARGETS" scripts/run-e2e-isolated.mjs` — Set 仍为三元（**未改行为**）。  
5. `git diff --stat`（或路径自检）：仅 delivery docs / harness；**无** scripts/e2e 行为改。  
6. 可选跑下方静态 CMD；**禁止**把 mysql-stack / live e2e 记入成功。  
7. 落 `reviews/YYYY-MM-DD-e2e-directory-restructure-s1-mw-e2e-ha.md`：结论 `pass` | `align-with-nits` | `reject` + R1–R10 + CMD/EXIT。  
8. **通过后方可进 S2**（contract 扩容）；reject 则退回实现方改文档。

---

## 命令与期望 EXIT

### 必选只读

```bash
test -f ai-docs/delivery/e2e-live-targets-whitelist.md && echo WHITELIST_OK
test -f ai-docs/delivery/harness/e2e-directory-s1-live-whitelist.md && echo HARNESS_S1_OK
test -f ai-docs/delivery/adr-e2e-directory-restructure.md && echo ADR_OK
rg -n "非 UI|non-UI|HTTP/SSE|e2e:prove|performance:e2e|secondary|mysql-stack|conn-only|BUG-FAKE-CONN" \
  ai-docs/delivery/e2e-live-targets-whitelist.md
rg -n "S1|LIVE_E2E_TARGETS|done|in-progress|文档" \
  ai-docs/delivery/adr-e2e-directory-restructure.md | head -40
rg -n "LIVE_E2E_TARGETS" scripts/run-e2e-isolated.mjs
```

期望：白名单+harness+ADR 存在；白名单钉非 UI primary + LIVE 非空 + 禁 mysql-stack LIVE；代码 Set 仍含三元（证明未偷改行为）。

### 可选静态 prove（EXIT=0 ≠ 重构完成 ≠ live E2E）

下列检查**只读文档内容**（可用 node 一行或 shell）；全部 EXIT=0 仅说明白名单文档钉未漂。

```bash
# A — 白名单钉非 UI primary + LIVE 列表非空 + 禁 mysql-stack 为 LIVE
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
const p = 'ai-docs/delivery/e2e-live-targets-whitelist.md';
const t = readFileSync(p, 'utf8');
const checks = [
  [/非 UI|non-UI|HTTP\/SSE/, 'pins non-UI / HTTP-SSE primary'],
  [/\be2e:prove\b/, 'lists e2e:prove'],
  [/\bperformance:e2e\b/, 'lists performance:e2e'],
  [/LIVE primary|主评测/, 'has LIVE primary language'],
  [/secondary|LIVE_OPTIONAL_UI/, 'UI marked secondary'],
  [/mysql-stack/, 'mentions mysql-stack'],
  [/conn-only|永不 LIVE|Never LIVE|禁止.*mysql-stack.*LIVE|mysql-stack.*永不/, 'forbids mysql-stack as LIVE'],
  [/BUG-FAKE-CONN/, 'cites BUG-FAKE-CONN'],
  [/adr-e2e-directory-restructure|D5/, 'cites ADR'],
  [/e2e-directory-target-structure/, 'cites opinion'],
];
let failed = 0;
for (const [re, label] of checks) {
  if (!re.test(t)) { console.error('FAIL', label); failed++; }
  else console.log('OK', label);
}
// LIVE list non-empty: both primary scripts appear in a LIVE section context
if (!/\be2e:prove\b/.test(t) || !/\bperformance:e2e\b/.test(t)) {
  console.error('FAIL LIVE list empty or incomplete');
  failed++;
} else console.log('OK LIVE list non-empty');
// Forbid classifying mysql-stack under LIVE primary table as a member
if (/### 1\.A[\s\S]*?mysql-stack[\s\S]*?### 1\.B/.test(t) &&
    /### 1\.A[\s\S]*?\|\s*`mysql-stack/.test(t)) {
  console.error('FAIL mysql-stack appears as LIVE primary row');
  failed++;
} else console.log('OK mysql-stack not in LIVE primary rows');
process.exit(failed ? 1 : 0);
NODE

# B — 既有静态门（旁证；≠ 本片独有）
pnpm e2e-case-inventory:prove    # 禁连通冒充钉仍在
pnpm e2e-platform:check          # 现行合同未因 S1 docs 破坏
```

### 禁止计入本切片成功

```bash
pnpm mysql-stack:skeleton:prove   # … 任一 mysql-stack:*
pnpm e2e:isolated                 # live；非本片范围
pnpm e2e:ui:isolated
pnpm performance:e2e:isolated
```

---

## 成功标准（S1）

- [ ] `e2e-live-targets-whitelist.md` + 本 harness 齐  
- [ ] 非 UI primary；LIVE 列表非空（至少 `e2e:prove` + `performance:e2e`）  
- [ ] UI secondary；**mysql-stack 永不 LIVE**  
- [ ] prove-via-isolated-shell 与 conn-only 分节；含 package.json 名  
- [ ] cite ADR D5 + 意见稿；代码 vs 文档差诚实（Set 仍含 ui）  
- [ ] **无** `LIVE_E2E_TARGETS` 行为改；**无** mass-move / 无建 isolated/conn-stack 目录  
- [ ] ADR S1 状态 → docs done（或 in-progress→done）  
- [ ] 可选静态 node 检查 EXIT=0；可选 inventory/platform EXIT=0  
- [ ] mw-e2e-ha 审查归档后方可 S2  

**失败**：UI 主评测；mysql-stack 进 LIVE；空 LIVE 表；本片改 runner；连通绿顶替审；声称已拆壳/已迁。

---

## EXIT 记录模板

| CMD | EXIT | 解读 |
|-----|------|------|
| `test -f …/e2e-live-targets-whitelist.md` | | 存在 |
| `test -f …/harness/e2e-directory-s1-live-whitelist.md` | | 存在 |
| node 白名单静态检查（可选） | | 0=文档钉；≠ live；≠ 已迁 |
| `pnpm e2e-case-inventory:prove`（可选） | | 0=静态；≠已迁 |
| `pnpm e2e-platform:check`（可选） | | 0=合同未破；≠ live |
| `mysql-stack:*` / live e2e | **N/A** | 禁止计入 |
