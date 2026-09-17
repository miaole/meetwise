# Harness — UC-E2E-003 i18n / locale 结构面（eval-first · partial ladder）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-003 covered**  
**对照矩阵行**：`UC-E2E-003`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-6（本切片新增）  
**对照需求**：`e2e-scenarios.md` UC-E2E-003 · A1 DOM 无中文残留（UI 框架文案）· A2 错误码→locale 映射 · 模型产语言归 ai-eval（本 harness **不测**）  
**MODEL_API_KEY**：**不需要**（静态 inventory；不调 live 模型；不跑 Playwright）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵原 **gap**（无专用 e2e）；`next-intl` + `messages/{en,zh}.json` + `public-copy` 旁证存在 → 有结构面可钉 |
| 本切片 | 可执行 **S1–S3** 静态结构断言 + **G-GAP-*** honesty mark-red；**最多 partial**；**不得**写 covered |
| 执行层 | **NON-UI 优先**（apps/web static inventory）；Playwright DOM **降次 / 未接线**（secondary） |
| 假绿禁令 | 不得把本绿写成「e2e-ui en DOM 已扫」或「错误码 en 映射已闭环」或「UC-E2E-003 covered」 |
| 本绿≠全链路 E2E covered | **必须钉死**，直至 `e2e:ui:isolated` 显式 locale=en DOM + 校验错误 en 文案 |
| 另轨 | `pnpm -C apps/web prove:public-copy` **≠** 本 UC（营销禁语/文案合同旁证，勿冒充 locale 结构验收） |

专家：`mw-e2e-ha`（+ product sense via e2e）。禁止作者自签 covered。

---

## 1. 测什么（S1–S3 + G-GAP 可执行合同）

| ID | 场景 | 期望 | 执行体 |
|----|------|------|--------|
| **S1** | i18n 管道 | `LOCALES` 含 zh+en；`messages/{en,zh}.json` 存在；`locale` cookie action | `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs` |
| **S2** | 资源键对齐 | en/zh flatten key **parity**（无 orphan keys） | 同上 |
| **S3** | en 资源无意外中文 | `en.json` 值无 CJK，除 allowlist：`home.footBrand` / `common.zh` | 同上 |
| **G-GAP-1** | A2 错误码→en | `ocr-preview-ui.ts` `ERROR_MESSAGES` **zh-only** + `mapResumeUploadError` 无 locale 参 → 打印 `GAP-UC003-ERROR-CODE-EN-MAP` | 同上 |
| **G-GAP-2** | A1 硬编码 zh UI | hot lib（`view-model` / `ocr-preview-ui` / `interview-state`）CJK 字符串字面量库存 → `GAP-UC003-HARDCODED-ZH-UI` | 同上 |
| **G-GAP-3** | DOM e2e-ui | `apps/web/e2e-ui/*` 无 locale/en DOM 断言 → `GAP-UC003-DOM-E2E-UI`（Playwright **secondary**） | 同上 |

**明确不测 / BLOCKED（本 harness）**

| 非目标 | 原因 |
|--------|------|
| Playwright `locale=en` DOM 全文扫描 | secondary；未进 `e2e:ui:isolated`；本 prove 仅 GAP 钉缺席 |
| 模型产出语言跟随 locale | 归 **ai-eval**（e2e-scenarios D6）；fake-model 不得冒充 |
| 把 `ERROR_MESSAGES` 改成 en map / 迁入 messages | 产品实现另刀；本切片 **eval-first honesty**，不扩实现冒充闭环 |
| 全页面 hard-coded zh 清零 | G-GAP-2 仅 hot lib 库存钉；全仓清扫属后续 |

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc003:i18n-locale:prove` | **0** | S1–S3 结构绿 + G-GAP-* 诚实钉；**本绿 ≠ UC-E2E-003 covered**；经 isolated 包装（静态体不读写 DB；R5 banner 可能出现 ≠ 本 UC 向量假绿） |
| `pnpm uc003:i18n-locale:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/web prove:uc003-i18n-locale` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-003`；≠业务 covered |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；静态 inventory（isolated 包装仅为 CMD 形态对齐 siblings）
pnpm uc003:i18n-locale:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`  
入口：`package.json` → `uc003:i18n-locale:prove` → `scripts/run-e2e-isolated.mjs uc003:i18n-locale:prove:raw`

**旁证（≠本 UC 验收）**：`pnpm -C apps/web prove:public-copy`；`messages/*.json` 手工 diff。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「public-copy 绿了所以 003 covered」 | **假绿**。营销禁语旁证 ≠ locale 结构 / 错误码 en 映射 |
| 「en/zh key parity 绿 = DOM 无中文残留」 | **假绿**。S2/S3 仅资源文件；G-GAP-2 已钉 hard-coded zh UI |
| 「uc003:i18n-locale:prove 绿 = covered」 | **假绿**。最多 **partial**；G-GAP-* EXIT=0 是诚实钉 |
| 「GAP pin EXIT=0 = A2 已闭环」 | **假绿**。GAP 表示未闭环 |
| 「e2e-ui 随便绿 = 003」 | **假绿**。无专用 locale DOM 用例（G-GAP-3） |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-003 | **partial**（S1–S3 + G-GAP pin）；**≠ covered** | `harness/uc-e2e-003-i18n-locale.md` |
| 评测说明 | `eval/uc-e2e-003-i18n-locale.eval.md` | 引用矩阵行 ID |
| P1-6 | 静态 prove 已挂；DOM e2e-ui + 错误码 en map 产品闭环仍缺 | 见矩阵 §3 |

## 5. 审查

- `mw-e2e-ha`：确认未把 partial 写成 covered；确认 Playwright 标 secondary；确认 G-GAP-* 为诚实钉而非假闭环
- product sense via e2e：确认 A1/A2 结构面边界（模型语言归 ai-eval）；确认 `ERROR_MESSAGES` zh-only 列为下一刀产品债
