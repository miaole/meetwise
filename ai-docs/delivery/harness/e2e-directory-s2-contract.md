# Harness — E2E 目录重构 S2（contract 扩容 · mw-e2e-ha）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E** · **静态绿 ≠ live E2E**  
**切片**：**S2 only**（契约文档 + 最小可执行钉；**不**改 `LIVE_E2E_TARGETS` 行为；**无** mass-move / **无**建 `scripts/isolated/` 偷跑 S3）  
**对照源**：
- 权威契约：`ai-docs/testing/conventions/e2e-directory-contract.md`
- `scripts/e2e-platform/directory-contract.mjs`（FUTURE_* · doc pins）
- `../adr-e2e-directory-restructure.md` D1–D6 · §4 S2
- `../e2e-directory-target-structure.md` §4.1 · §6 S2
- `../e2e-live-targets-whitelist.md`（S1；本片引用）
- S1 审查：`../reviews/2026-09-10-e2e-directory-s1-live-whitelist-mw-e2e-ha.md`（已批准进 S2）

**硬禁**：禁止用 `mysql-stack:*:prove` EXIT=0 冒充本切片成功或完整 E2E；禁止把 UI 写成主评测；禁止本片 mass-move 测试。

---

## 评哪些需求（契约诚实性，非 live）

| ID | 验收 | 通过 | 假绿 / 失败 |
|----|------|------|-------------|
| R1 | 契约 MD 扩容落盘 | `testing/conventions/e2e-directory-contract.md` 含车道节 | 仅口头 / 旧三层表无车道 |
| R2 | **LIVE · prove-shell · conn-only** | 三车道表齐全；含 package/脚本语义 | 抹平后缀或只列 LIVE |
| R3 | **非 UI 为主**；UI secondary | 硬钉 HTTP/SSE primary；`apps/web/e2e-ui` / `e2e:ui` = 次要 | Playwright 写主评测 |
| R4 | LIVE 白名单引用 | cite `e2e-live-targets-whitelist.md` | 无引用 / 另写冲突白名单 |
| R5 | **禁 mysql-stack 为 LIVE** | 显式 BUG-FAKE-CONN；conn-only 永不 covered | mysql-stack 进 LIVE 行 |
| R6 | R5 / pgvector 假绿诚实 | BUG-FAKE-R5 或默认 pgvector ≠ 已迁 | 删 R5 / 声称 sole-stack 已迁 |
| R7 | 允许 `scripts/isolated/` · `scripts/conn-stack/` 叙述 | 演进允许目录节；**今日可不存在** | 声称已拆壳却无文件 / 或本片偷建并宣称 S3 done |
| R8 | 可执行合同兼容 | `pnpm e2e-platform:check` EXIT=0；`layout:prove` 种植仍能失败 | check 红未 intentional；或 layout skip-as-pass |
| R9 | **无** mass-move / **无** LIVE Set 行为改 | `LIVE_E2E_TARGETS` 仍三元；无批量 `e2e/` / proof 搬迁 | 已改 Set 或 S3 提前搬 |
| R10 | 本 harness + ADR S2 状态 | 本文件存在；ADR 标 S2 docs/contract done | 无审查入口 / ADR 未回填 |

---

## 专家步骤（mw-e2e-ha · 第二域 mw-rag-route 对抗 spot）

1. 确认 S1 审查已 **批准进入 S2**。  
2. 打开 `e2e-directory-contract.md`：勾 R1–R7（三车道 · 非 UI · 白名单 cite · 禁 mysql-stack LIVE · R5 诚实 · FUTURE dirs）。  
3. 打开 `directory-contract.mjs`：确认 `REQUIRED_CONTRACT_DOC_PINS` / `FUTURE_ISOLATED_*` / `FUTURE_CONN_STACK_DIR`；**未**把 FUTURE 文件列入必存在 `REQUIRED_RUNNERS`。  
4. 打开 ADR：§4 S2 状态已标；文首切片进度含 S2。  
5. 只读对照：`rg -n "LIVE_E2E_TARGETS" scripts/run-e2e-isolated.mjs` — Set 仍三元。  
6. `test ! -d scripts/isolated && test ! -d scripts/conn-stack`（本片未偷建）或若存在则仅空/试点且**不得**宣称 S3/S4 done。  
7. 跑下方 CMD；**禁止**把 mysql-stack / live e2e 记入成功。  
8. 落 `reviews/YYYY-MM-DD-e2e-directory-s2-contract-mw-e2e-ha.md` + rag spot：结论 `pass` | `align-with-nits` | `reject` + R1–R10 + CMD/EXIT。  
9. **通过后方可进 S3**（shim 改名 / 拆壳）；reject 则退回实现方改契约。

---

## 命令与期望 EXIT

### 必选只读

```bash
test -f ai-docs/testing/conventions/e2e-directory-contract.md && echo CONTRACT_MD_OK
test -f ai-docs/delivery/harness/e2e-directory-s2-contract.md && echo HARNESS_S2_OK
test -f ai-docs/delivery/adr-e2e-directory-restructure.md && echo ADR_OK
test -f ai-docs/delivery/e2e-live-targets-whitelist.md && echo WHITELIST_OK
rg -n "LIVE|prove-shell|conn-only|非 UI|secondary|e2e-live-targets-whitelist|BUG-FAKE-CONN|BUG-FAKE-R5|scripts/isolated|scripts/conn-stack" \
  ai-docs/testing/conventions/e2e-directory-contract.md
rg -n "FUTURE_ISOLATED|REQUIRED_CONTRACT_DOC_PINS|checkContractDocLanes" \
  scripts/e2e-platform/directory-contract.mjs
rg -n "S2|contract|done|directory-contract" \
  ai-docs/delivery/adr-e2e-directory-restructure.md | head -40
rg -n "LIVE_E2E_TARGETS" scripts/run-e2e-isolated.mjs
test ! -d scripts/isolated; echo "isolated_absent_exit=$?"
test ! -d scripts/conn-stack; echo "conn_stack_absent_exit=$?"
```

期望：契约+harness+ADR+白名单存在；MD 钉三车道 / 非 UI / 白名单 / 假绿 / FUTURE dirs；mjs 含 FUTURE + doc pins；代码 Set 仍三元；本片未建 isolated/conn-stack。

### 可选静态 prove（EXIT=0 ≠ 重构完成 ≠ live E2E ≠ 批准 S3）

```bash
# A — 契约 MD 车道钉（与 directory-contract REQUIRED_CONTRACT_DOC_PINS 同构意图）
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
const p = 'ai-docs/testing/conventions/e2e-directory-contract.md';
const t = readFileSync(p, 'utf8');
const checks = [
  [/非 UI|non-UI|HTTP\/SSE/, 'pins non-UI / HTTP-SSE primary'],
  [/次要|secondary|LIVE_OPTIONAL_UI/, 'UI marked secondary'],
  [/LIVE|主评测/, 'has LIVE lane language'],
  [/prove-shell|prove-via-isolated|借壳/, 'has prove-shell lane'],
  [/conn-only/, 'has conn-only lane'],
  [/e2e-live-targets-whitelist/, 'cites LIVE whitelist'],
  [/mysql-stack/, 'mentions mysql-stack'],
  [/BUG-FAKE-CONN/, 'cites BUG-FAKE-CONN'],
  [/BUG-FAKE-R5|pgvector|E2E_PG_IMAGE/, 'R5 / pgvector honesty'],
  [/scripts\/isolated/, 'allows future scripts/isolated'],
  [/scripts\/conn-stack/, 'allows future scripts/conn-stack'],
  [/releaseEvidence=false/, 'releaseEvidence=false'],
];
let failed = 0;
for (const [re, label] of checks) {
  if (!re.test(t)) { console.error('FAIL', label); failed++; }
  else console.log('OK', label);
}
process.exit(failed ? 1 : 0);
NODE

# B — 既有平台门（扩容后仍须绿；layout 种植仍能失败）
pnpm e2e-platform:check
pnpm e2e-platform:prove
pnpm e2e-platform:layout:prove
pnpm e2e-case-inventory:prove    # 禁连通冒充钉仍在
```

### 禁止计入本切片成功

```bash
pnpm mysql-stack:skeleton:prove   # … 任一 mysql-stack:*
pnpm e2e:isolated                 # live；非本片范围
pnpm e2e:ui:isolated
pnpm performance:e2e:isolated
```

---

## 成功标准（S2）

- [ ] `e2e-directory-contract.md` 扩容：三车道 · 非 UI primary · UI secondary · 白名单 cite · 禁 mysql-stack LIVE · R5 诚实 · FUTURE dirs  
- [ ] `directory-contract.mjs`：FUTURE_* + doc pins；`REQUIRED_RUNNERS` 仍锁今日路径；FUTURE 文件**非**必存在  
- [ ] 本 harness 落盘  
- [ ] `e2e-platform:check` / `prove` / `layout:prove` 兼容（check/prove EXIT=0；layout 种植能失败）  
- [ ] **无** `LIVE_E2E_TARGETS` 行为改；**无** mass-move；**未**偷建并宣称 S3/S4 done  
- [ ] ADR S2 状态 → docs/contract done  
- [ ] 可选静态 node 检查 EXIT=0  
- [ ] mw-e2e-ha (+ mw-rag-route spot) 审查归档后方可 S3  

**失败**：UI 主评测；mysql-stack 当 LIVE；无白名单 cite；删 R5 诚实；本片改 runner Set；mass-move；check 无故红；layout skip-as-pass；连通绿顶替审。

---

## EXIT 记录模板

| CMD | EXIT | 解读 |
|-----|------|------|
| `test -f …/e2e-directory-contract.md` | | 存在 |
| `test -f …/harness/e2e-directory-s2-contract.md` | | 存在 |
| node 契约车道静态检查（可选） | | 0=文档钉；≠ live；≠ 已迁 |
| `pnpm e2e-platform:check` | | 0=合同兼容；≠ live |
| `pnpm e2e-platform:prove` | | 0=5 守卫；≠ live |
| `pnpm e2e-platform:layout:prove` | | 0=种植能失败；≠ skip-as-pass |
| `pnpm e2e-case-inventory:prove`（可选） | | 0=静态；≠已迁 |
| `mysql-stack:*` / live e2e | **N/A** | 禁止计入 |
