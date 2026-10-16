# 评测证明 — UC-E2E-003 i18n / locale 结构面（partial ladder）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-003 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md`  
**对照矩阵行**：`UC-E2E-003`  
**待审专家**：`mw-e2e-ha`（+ product sense via e2e）

---

## 1. 用途

eval-first：交付 **可执行** S1–S3 静态 locale 结构断言 + G-GAP-* honesty mark-red（`apps/web` inventory），无 `MODEL_API_KEY`、无 Playwright。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered`。最多 **partial**。  
**本绿 ≠ 全链路 E2E covered**，直至 `e2e:ui:isolated` 显式 locale=en DOM + 校验错误 en 文案。

既有资产（先找再造）：`apps/web/i18n/request.ts`、`messages/{en,zh}.json`、`locale-actions.ts`、`ocr-preview-ui.ts` `ERROR_MESSAGES`（zh-only → GAP）。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc003:i18n-locale:prove` | **0** | **0**（2026-09-10 ~01:36 PT；S1–S3 PASS；3× GAP pin；receipt `.tmp/isolated-proof-receipts/2026-09-10T08-36-59-687Z-…`；R5 banner 已印但静态体不读写 DB） | S1–S3 结构绿 + honesty GAP → 矩阵 **partial**；≠ covered；≠ e2e-ui DOM |
| `pnpm uc003:i18n-locale:prove:raw` / `pnpm -C apps/web prove:uc003-i18n-locale` | **0** | **0**（同日；S1–S3 PASS；GAP-UC003-ERROR-CODE-EN-MAP / HARDCODED-ZH-UI / DOM-E2E-UI） | 静态 inventory；无 DB |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（同日；含 UC-E2E-003 unit） | harness+eval 引用矩阵行；≠业务 covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY
pnpm uc003:i18n-locale:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| S1 | next-intl LOCALES + messages + locale cookie | **否**（管道存在 ≠ 全 UI en） |
| S2 | en/zh key parity | 否 |
| S3 | en.json CJK allowlist | 否 |
| G-GAP-1 | `GAP-UC003-ERROR-CODE-EN-MAP`（ERROR_MESSAGES zh-only） | 否（honesty） |
| G-GAP-2 | `GAP-UC003-HARDCODED-ZH-UI` | 否（honesty） |
| G-GAP-3 | `GAP-UC003-DOM-E2E-UI` | 否（Playwright secondary 缺席钉） |

**BLOCKED（仍 gap 于全链路）**：e2e-ui locale=en DOM 扫描、错误码 en map 产品接线、view-model 等硬编码 zh 迁入 i18n、模型语言跟随 locale（ai-eval）。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-003 covered**
- [ ] 未把 `public-copy` 冒充本 UC
- [ ] 未把 G-GAP-* 写成 A1/A2 已闭环
- [ ] 矩阵最多 **partial**（非假 covered）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] Playwright 标 **secondary** / 未接线

## 5. 专家请回答

1. S1–S3 + G-GAP pins 是否足以支撑矩阵 **partial**（仍明示 ≠ covered）？  
2. `GAP-UC003-ERROR-CODE-EN-MAP` / `HARDCODED-ZH-UI` 是否列为下一刀产品 P1？  
3. 结论写入 `reviews/`，含「仍 ≠ covered」明示。
