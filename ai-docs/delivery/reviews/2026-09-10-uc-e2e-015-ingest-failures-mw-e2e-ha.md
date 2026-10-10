# 审查归档 — UC-E2E-015 简历摄取失败族 · mw-e2e-ha

**日期**：2026-09-10（PT）  
**审稿人**：`mw-e2e-ha`（独立审；覆盖实现方预写/REQUEST，非自审）  
**结论**：**pass**  
**是否允许 partial**：**是**（矩阵维持 **partial**；**禁止**升 covered）  
**releaseEvidence=false** · Not HA · **≠ UC-E2E-015 covered** · **本绿 ≠ 全链路 E2E covered** · **R5 green-risk**

## Prove（本审复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm uc015:ingest-failures:prove` | **0** | F1–F5 + F-billing **12 PASS**；R5-MARKED-RED（pgvector fixture）；receipt `.tmp/isolated-proof-receipts/2026-09-10T07-35-45-325Z-…`；`release_evidence=false` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | harness+eval 引用 `UC-E2E-015`；钉 partial / ≠covered / R5 / 加密·0字节·超大·畸形 / 相对 OCR+409；矩阵行保持 **partial** |
| `pnpm e2e:isolated`（OCR 成功+409 全量） | **未跑 / blocked** | `MODEL_API_KEY` **unset**（仅 env 名探测，未读 `.env*`）；无假跑 |

### F1–F5 核对（实测 PASS）

| ID | 断言 | 结果 |
|----|------|------|
| F1 | 加密 PDF → 422 `encrypted` | PASS |
| F2 | 0 字节空 base64 → 400 入口拒 | PASS |
| F3 | >8MB → 413 `file_too_large` | PASS |
| F4 | 畸形 PDF → 422 `parse_failed` | PASS |
| F5 | `.exe`/xlsx → 415 `unsupported_file_format` | PASS |
| F-billing | 无新增 consumption / resume 行 | PASS |

## 硬钉（勾选）

- [x] **≠ covered**（prove 绿 ≠ UC-E2E-015 covered；cite 亦钉）
- [x] **R5 green-risk**（isolated → pgvector；banner 已印）
- [x] **releaseEvidence=false** · Not HA
- [x] 失败族含 **加密 / 0字节 / 超大 / 畸形**（+ 非法 MIME）；相对 OCR 成功+409，成功面 ≠ 失败族
- [x] 无 Key → `e2e:isolated` **blocked**，未 skip-as-pass

## 假绿排查

| 风险说法 | 裁定 |
|---------|------|
| prove 绿 = covered | **否** — 最多 partial |
| OCR 成功+409 / `neg:resume` 冒充失败族全关 | **否** — 成功面/子集旁证 |
| 无 Key 仍算全链路 E2E 绿 | **否** — blocked |
| isolated 绿 = sole-stack / HA | **否** — R5 mark-red |

**partial 是否诚实**：**是**。HTTP F1–F5 可执行合同已绿，足以支撑矩阵 **partial**；缺口仍明示，未假升 covered。

## 缺口（仍 ≠ covered）

- 扫描件 `no_text_layer` reason 枚举 + UI 重传文案
- Resume 状态机 `failed(reason=…)` 五枚举落库全铺
- 诊断/押题后续图不入队的端到端观测
- 有 Key 时 `e2e:isolated` 全量（含 OCR 成功+409）；成功面仍不关闭失败族

## 结论与建议

- **pass**；允许并维持矩阵 **partial**
- 升 **covered** 须：isolated 全 HTTP 失败族 + reason/UI 落地并复跑绿；且不得用成功面冒充失败族
- 对照：`harness/uc-e2e-015-resume-ingest-failures.md` · `eval/uc-e2e-015-resume-ingest-failures.eval.md` · 矩阵 `UC-E2E-015` / P0-6
