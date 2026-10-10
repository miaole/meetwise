# E2E 目录目标结构意见稿（非 UI 为主 · 可落地重构）

**releaseEvidence=false** · **Not HA** · **非 UI E2E 为主** · **本绿 ≠ 已迁** · **连通绿 ≠ E2E**  
**引用契约**：`ai-docs/testing/conventions/e2e-directory-contract.md`（helpers / 场景 / `scripts/run-e2e*`）  
**交叉**：`e2e-case-inventory.md` · `e2e-requirement-coverage-matrix.md` · `m5-pgvector-fixture-retirement-plan.md` · `harness/e2e-full-suite.inventory.md`  
**状态**：draft（架构审稿意见）· 实现方 ADR 未合入前以本文件为目录意图；合入后须走「对照实现方 ADR 复审」节  
**范围**：目录 / 入口 / 命名 / 边界沉淀；**不改业务实现代码**；不碰 Meridian；不读 `.env*`

---

## 0. 硬钉

| 钉 | 裁定 |
|----|------|
| 主评测路径 | **HTTP / SSE / API 非 UI E2E**（`e2e/*.e2e.ts` + `scripts/run-e2e*.mjs`）+ **prove 纪律**（域集成 / 负路径 / 静态门） |
| UI | `apps/web/e2e-ui/` + `scripts/run-e2e-ui.mjs` 为**次要**浏览器证据；不得写成唯一全链路 |
| 目录契约 | 继续遵守 contract：`e2e/` 根下**只允许**目录 `helpers/`；场景扁平 `*.e2e.ts`；禁止抄 `booking/` 式领域树 |
| 假绿 | **禁止** `mysql-stack` skeleton/ping/m2–m5 连通绿冒充 E2E / covered（`BUG-FAKE-CONN`） |
| R5 | isolated 默认 `E2E_PG_IMAGE=pgvector/pgvector:pg16` = **legacy fixture**（`BUG-FAKE-R5`）；本地绿 ≠ sole-stack / ≠ RAG 已迁 |
| 证据 | `releaseEvidence=false`；静态 platform 绿 ≠ live E2E；loop 绿仍 `pending_review` |

---

## 1. 现状探测摘要（只读）

| 面 | 实查 |
|----|------|
| `e2e/` | 扁平：`full.e2e.ts` · `performance.e2e.ts` · `ocr-fixture.ts` · `helpers/`（与 contract 锁定一致） |
| HTTP runners | `scripts/run-e2e.mjs` · `run-e2e-isolated.mjs`（~1529 行）· `run-performance-e2e.mjs` · `run-e2e-performance-suite.mjs` · `run-e2e-ui.mjs` |
| UI | `apps/web/e2e-ui/*.spec.ts`（golden / online-public / recruiting-bound / screenshots / stream-window / voice-duplex） |
| package.json | `e2e*` 脚本约 **17**；经 `run-e2e-isolated` 包装约 **96**；全库 `*:prove` 约 **275** |
| 静态平台 | `scripts/e2e-platform/*`（check / prove / layout:prove / loop）+ 旁路 `e2e-static-guards*` · `e2e-parity*` · `e2e-case-inventory:prove` · `e2e-helpers:prove` · `e2e-receipt:prove` |
| 连通反例 | `mysql-stack:{skeleton,ping,m2-tenant,m3-queue,m4-rag,m5-fixtures,r5-mark-red}:prove` 等 — **conn-only** |
| LIVE 目标集 | isolated 内 `LIVE_E2E_TARGETS = {e2e:prove, e2e:ui, performance:e2e}`；其余多为域 prove 借同一 PG 隔离壳 |

---

## 2. 混乱点清单（有序 · 按危害）

1. **`run-e2e-isolated.mjs` 名实不符（最大）**  
   文件名 / 包脚本暗示「E2E」，实际是「临时 PG cluster + 任意 pnpm target」通用隔离壳；约 96 个域 prove 与 3 个 live E2E 共用入口。读者易把 `memory:prove` / `rag03-route:prove` 当成业务 E2E covered。

2. **默认夹具仍绑 pgvector（BUG-FAKE-R5）**  
   `E2E_PG_IMAGE` 默认 `pgvector/pgvector:pg16`；已有 R5-MARKED-RED banner，但默认未切 MySQL+Qdrant+Redis。宽 E2E / 多数 isolated prove 本地绿 = green-risk，不得写 sole-stack 已迁。

3. **prove vs e2e 边界被脚本名抹平**  
   - `e2e:prove` = 启栈跑 `e2e/full.e2e.ts`（真 HTTP 主链路）  
   - `e2e:isolated` = isolated 包装同一 live  
   - 大量 `foo:prove` = 包内 `*.proof.ts`，仅「经过」isolated  
   「prove」一词同时覆盖：静态门、域集成、负路径、live E2E、连通 skeleton → 审计词义崩塌。

4. **入口重复 / 套件叠床架屋**  
   - 性能：`performance:e2e` · `performance:e2e:isolated` · `verify:e2e-performance`（suite）  
   - 静态：`e2e-platform:check|prove|layout:prove` vs `e2e-static-guards:check|prove` vs `e2e-parity:check|prove` vs `e2e-case-inventory:prove`  
   - 别名：`qbank:prove` → `rag-generation:prove:raw`；`vectorstore:prove:legacy` 同体  

5. **UI 与非 UI 同族并列，易被升格为主评测**  
   contract 已把 Playwright 放到 `apps/web/e2e-ui/`，但 `e2e:ui` / `e2e:ui:isolated` 与 `e2e:prove` 同级出现在 package.json 与 isolated LIVE 集；覆盖矩阵若把 UI 写成「真业务 E2E」并列主路径，会稀释「非 UI 为主」纪律。

6. **孤立包装默认叙事 =「重建 schema 的 E2E」**  
   文件头注释以 E2E 举例，却被 memory/RAG/privacy/scor 等证明复用；`isolated-env:prove` / `e2e-isolation:prove` 证明的是壳本身，不是业务旅程。

7. **平台静态门与 live 入口语义相邻**  
   `e2e-platform:*` 明确「不是 live E2E / 不是发布证据」，但命名前缀 `e2e-` 与 `e2e:isolated` 并列；新人易把 platform 绿当成链路绿。

8. **连通绿家族仍挂 `*:prove` 后缀**  
   `mysql-stack:skeleton:prove` 等已在 inventory 钉为 F-CONN / 永不 covered，但脚本后缀与业务 prove 相同，CI 列表扫一眼仍像评测通过。

9. **场景面相对干净，文档家族与脚本树未同构**  
   `e2e/` 本身符合 contract（混乱不在场景树）；混乱在 `scripts/` 扁平巨石 + package.json 海量别名。inventory 的 F-ISO / F-VEC / F-CONN 只存在于文档，脚本侧无对称分区。

10. **合同锁定「当前文件」与演进张力**  
    `directory-contract.mjs` 硬锁 runners / helpers 清单是好事（防漂），但目标结构若拆 isolated 通用壳，必须**先扩 contract 再迁文件**，否则 `e2e-platform:check` fail-closed 会挡迁移。

---

## 3. 目标结构摘要

### 3.1 目标目录树（意图）

```text
e2e/                              # 仅 HTTP/SSE 非 UI 客户端（contract 锁定）
  helpers/                        # 可复用原语 + e2e-helpers.proof.ts
  *.e2e.ts                        # 场景（full / performance / 未来 UC 场景）
  *-fixture.ts                    # 夹具（ocr 等）

apps/web/e2e-ui/                  # 次要：Playwright（勿升格主评测）

scripts/
  run-e2e.mjs                     # 非隔离：已有 DB 上跑 HTTP 主链路 → e2e/full.e2e.ts
  run-e2e-performance*.mjs        # 性能场景 runner（仍 spawn e2e/performance.e2e.ts）
  run-e2e-ui.mjs                  # 次要 UI runner（保留，文档降级）
  isolated/                       # 【目标】通用隔离壳（改名后，不再叫 run-e2e-isolated）
    run-isolated.mjs              # 起临时 DB cluster → spawn 任意 target
    targets-live-e2e.mjs          # 仅登记 LIVE：e2e:prove / performance:e2e（+可选 ui）
    targets-domain-prove.mjs      # 域 prove 白名单（非 E2E covered）
  e2e-platform/                   # 静态目录契约 / 信任守卫 / review-loop（≠ live）
  conn-stack/                     # 【目标】mysql-stack.* 连通/静态（显式 conn-only 区）
    mysql-stack.*.proof.mjs

ai-docs/
  testing/conventions/e2e-directory-contract.md   # 权威契约（迁移时同步）
  delivery/e2e-directory-target-structure.md      # 本意见稿
  delivery/e2e-case-inventory.md                  # 家族 × 假绿（继续）
  delivery/<impl-ADR>.md                          # meetwise-core 实现方 ADR（待）
```

### 3.2 命名纪律（目标）

| 前缀 / 后缀 | 含义 | 可否当业务 covered |
|-------------|------|-------------------|
| `e2e:*` / `e2e/*.e2e.ts` | HTTP/SSE **live** 场景 | 仅当断言落 UC 且夹具诚实；sole-stack 未迁 → 最多 partial/green-risk |
| `e2e:ui*` | Playwright 次要 | 否（主评测） |
| `e2e-platform:*` | 目录/信任**静态**门 | 永不 live covered |
| `*:prove`（域包内） | 集成/合同/负路径 prove | partial 旁证；≠ 全链路 E2E |
| `isolated:*` / `run-isolated` | **夹具壳** | 永不单独 covered |
| `mysql-stack:*` / `conn-stack:*` | 连通/文档 | **永不** covered |

### 3.3 包脚本目标面（收敛，非一次删光）

- **保留主路径**：`e2e:prove` · `e2e:isolated`（过渡期可仍指向旧文件，文档标明「壳」）· `performance:e2e`  
- **降级标注**：`e2e:ui` / `e2e:ui:isolated` → README/contract「次要」  
- **中期**：`e2e:isolated` → `isolated run --live e2e:prove`；域 prove 改为 `isolated run --prove <id>`，脚本名去掉虚假 `e2e-` 前缀  
- **连通**：`mysql-stack:*:prove` 改显示名或移入 `conn-stack:` 命名空间（或文档+CI job 标签 `conn-only`）

---

## 4. 迁移原则

1. **先契约后搬文件**：扩 `directory-contract.mjs` / `e2e-directory-contract.md` 的 REQUIRED_* 与允许目录，再 `git mv`；禁止先搬后修导致 platform 红却「跳过」。  
2. **场景树不动优先**：`e2e/*.e2e.ts` / `helpers/` 已合规；重构重心在 `scripts/run-e2e-isolated.mjs` 拆壳 + package.json 别名治理。  
3. **壳与旅程分离**：隔离壳不得内嵌简历/答词/业务叙事（contract 已禁）；live 只 `spawn` 场景路径。  
4. **假绿显式化**：凡默认吃 `E2E_PG_IMAGE` 的入口，保留 R5-MARKED-RED；inventory §1 家族行同步；禁止删 banner 冒充已迁。  
5. **静态门 fail-closed 保留**：`e2e-platform:check|prove|layout:prove` 继续 always-on；loop 不进 always-on（防递归）。  
6. **一次一切片**：每切片可审（改名 / 拆 LIVE 白名单 / 迁 mysql-stack 文档区）；不做大爆炸删 96 wrappers。  
7. **非 UI 切片优先于 UI 矩阵**：GAP-PROD-02 浏览器矩阵不得插入为「先做主评测」。

---

## 5. 非目标（明确拒绝）

- 把 Playwright / `e2e:ui*` 升格为**主**评测或发布唯一证据  
- 在 `e2e/` 下建 `interview/` · `commerce/` · `booking/` 等领域目录树  
- 用 `mysql-stack` skeleton/ping/m* 绿充 UC-E2E covered 或 sole-stack cutover  
- 删除 R5 marked-red 脚本并声称「已迁」（marked-red ≠ deleted；pass ≠ cutover）  
- 把 `e2e-platform:loop` 塞进 regression always-on  
- 本意见稿勾 `releaseEvidence=true` / HA / controlPlaneClosed  
- 改业务实现、读 `.env*`、碰 Meridian  

---

## 6. 建议下一实现切片（给 meetwise-core）

| 序 | 切片 | 验收（仍 releaseEvidence=false） |
|----|------|----------------------------------|
| S0 | **实现方 ADR**：目录目标 + 迁移序 + 与本意见稿 diff 表 | ADR 落 `ai-docs/delivery/`；文首钉非 UI 为主 / R5 / 禁连通冒充；触发下方「复审」节 |
| S1 | **拆 LIVE 白名单文档化**：在 isolated 头注释 + inventory 明示「仅 3 个 LIVE_E2E_TARGETS 是 live E2E」 | 文档+静态 cite prove；不改行为 |
| S2 | **contract 扩容草案**：允许 `scripts/isolated/` 或保留单文件但改职责描述 | **实现方 done**（2026-09-10）：契约 MD + `directory-contract.mjs` FUTURE/doc pins；待 mw-e2e-ha 对照 `harness/e2e-directory-s2-contract.md`；`layout:prove` 种植仍能失败 |
| S3 | **改名过渡**：`run-e2e-isolated.mjs` → `scripts/isolated/run-isolated.mjs` + 薄兼容 shim | package.json 别名不破；platform check 更新锁定路径 |
| S4 | **conn-only 命名空间**：mysql-stack 脚本加 `conn-only` 标签或 `conn-stack:` 前缀（CI 过滤） | inventory F-CONN 与脚本同构；冒充检测 prove 仍绿 |
| S5 | **性能入口收敛**：`verify:e2e-performance` 与 `performance:e2e` 关系写清（suite vs 单场景） | 文档+可选 deprecate 其一 |
| S6 | **R5 夹具轨道**（跟 M5 计划，非本目录切片独吞）：sole-stack 夹具或持续 mark-red | 另轨；本目录意见不自批 cutover |

**优先推荐 meetwise-core 立刻做：S0 ADR + S1 白名单钉死**（零行为风险，解锁后续改名）。

---

## 7. 对照实现方 ADR 复审（预留）

> meetwise-core 交付 ADR / 目标树 + 迁移方案后，**审稿方（本意见稿维护者或独立审查）**须对照本节复审；**实现方不自审通过**。

### 7.1 复审清单（合入 ADR 后逐条勾）

| # | 检查项 | 本意见稿锚点 | ADR 应有 | 结果（待填） |
|---|--------|--------------|----------|--------------|
| 1 | 文首是否钉 `releaseEvidence=false` · Not HA · 非 UI 为主 · 引用 `e2e-directory-contract.md` | §0 | 同钉 | ✅ pass |
| 2 | 是否拒绝 mysql-stack / skeleton / ping 冒充 E2E | §0 · §5 | 显式 BUG-FAKE-CONN | ✅ pass |
| 3 | 目标树是否保持 `e2e/` 扁平 + 仅 `helpers/` 子目录 | §3.1 · contract | 无领域子树 | ✅ pass |
| 4 | 是否将「隔离壳」与「live E2E」命名拆开 | §2.1 · §3.2 · S3 | 改名或等价纪律 | ✅ pass |
| 5 | LIVE 目标集是否 ⊆ HTTP/SSE（UI 至多可选次要） | §3 · S1 | 白名单 | ✅ pass |
| 6 | R5 / pgvector 默认是否仍标 red 且 ≠ 已迁 | §0 · §2.2 | 跟 M5，不自批 cutover | ✅ pass |
| 7 | 迁移是否「先契约后搬文件」 | §4.1 | 序与 platform 门 | ✅ pass |
| 8 | 是否把 UI 写成主评测或发布唯一证据 | §5 | 必须否 | ✅ pass |
| 9 | 与 `e2e-case-inventory` 家族表是否同构或声明差异 | §1 · 交叉 | diff 表 | ✅ pass |
| 10 | 下一切片是否可独立审、可回滚 | §6 | 切片边界 | ✅ pass |

### 7.2 复审产出

- 结论：`align` / `align-with-nits` / `reject`  
- 若 `reject`：列出与本意见稿或 contract 的冲突路径，退回 meetwise-core  
- 复审本身 `releaseEvidence=false`；不构成发布证据  

### 7.3 复审回填（S0 · mw-e2e-ha · 2026-09-10）

- 实现方 ADR 路径：`ai-docs/delivery/adr-e2e-directory-restructure.md`  
- 审查 harness：`ai-docs/delivery/harness/e2e-directory-restructure.md`  
- 差异表链接：ADR §3「与意见稿 diff 表」  
- 复审日期 / 审查人：2026-09-10 · **mw-e2e-ha**（独立；实现方不自审）  
- 结论：**`align-with-nits`**（父代理词汇 **pass**；nit = 故意仅 S0、不捆绑 S1，符合一次一切片）  
- **批准进入 S1**（LIVE 白名单文档；不改行为）  
- 审查归档：`ai-docs/delivery/reviews/2026-09-10-e2e-directory-restructure-s0-mw-e2e-ha.md`  
- releaseEvidence=false · Not HA · 本绿≠已迁 · 静态绿≠批准搬迁

---

## 8. 只读 / 探测命令 + EXIT（审稿复现）

```bash
# 契约与现状（静态，非 live E2E）
test -f ai-docs/testing/conventions/e2e-directory-contract.md
ls e2e/ e2e/helpers/ scripts/run-e2e*.mjs scripts/run-performance-e2e.mjs
ls apps/web/e2e-ui/
ls scripts/e2e-platform/ scripts/mysql-stack*.proof.mjs

# 脚本族群计数（不启栈）
node -e "const s=require('./package.json').scripts; \
  const w=Object.keys(s).filter(k=>String(s[k]).includes('run-e2e-isolated')); \
  const p=Object.keys(s).filter(k=>k.includes(':prove')); \
  console.log({e2e:Object.keys(s).filter(k=>k.startsWith('e2e')).length, isolatedWrappers:w.length, prove:p.length});"

# 目录契约门（fail-closed；绿≠live E2E）
pnpm e2e-platform:check
pnpm e2e-platform:prove
pnpm e2e-case-inventory:prove

# 可选：确认 isolated 默认镜像钉（只读 rg，不启容器）
rg -n "E2E_PG_IMAGE|LIVE_E2E_TARGETS|pgvector" scripts/run-e2e-isolated.mjs | head
```

**EXIT 解读**：上述静态命令 EXIT=0 只说明布局/文档钉未漂；**不是** `e2e:isolated` 业务绿，**不是** sole-stack 已迁，**不是**发布证据。

---

## 9. 维护

1. meetwise-core ADR 合入后填写 §7。  
2. 实际 `git mv` 前同步 contract + `directory-contract.mjs` REQUIRED_RUNNERS。  
3. 新增默认吃 pgvector 的入口 → 同步 `e2e-case-inventory.md` 并挂 BUG-FAKE-R5。  
4. 本文件升级为 active 前保持 draft；不得删减「非 UI 为主」「禁连通冒充」硬句。
