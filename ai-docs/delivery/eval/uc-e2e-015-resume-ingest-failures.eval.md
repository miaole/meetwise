# 评测证明 — UC-E2E-015 简历摄取失败族（partial ladder）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-015 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-015-resume-ingest-failures.md`  
**对照矩阵行**：`UC-E2E-015`  
**相对成功面**：`full.e2e.ts` OCR 成功 + duplicate **409**（成功面 ≠ 失败族 covered）  
**待审专家**：`mw-e2e-ha`

---

## 1. 用途

eval-first：交付 **可执行** F1–F5 HTTP 失败族断言（`apps/api` + `_neg-harness`），**无 `MODEL_API_KEY`**。  
失败族钉：**加密 / 0字节 / 超大 / 畸形**（+ 非法 MIME）。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered`。最多 **partial**。  
**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → **green-risk / R5**。  
无 Key 时 `e2e:isolated` 全量（含 OCR 成功+409）→ **blocked**。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc015:ingest-failures:prove` | **0** | **0**（2026-09-10 ~00:34 PT；F1–F5+F-billing 12 PASS；receipt `.tmp/isolated-proof-receipts/2026-09-10T07-34-09-915Z-…`；R5 banner 已印） | F1–F5 HTTP 绿 → 矩阵 **partial**；≠ covered；≠ e2e:isolated；**green-risk / R5** |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（同日实现方自跑） | harness+eval 引用矩阵行；≠业务 covered |
| `pnpm -C packages/domain prove:resume-extract` | **0** | **0**（23 断言；含 encrypted） | 域侧 encrypted 探测旁证；≠ HTTP covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；需 Docker isolated PG
pnpm uc015:ingest-failures:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-015-resume-ingest-failures.proof.ts`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| F1 | 加密 PDF → 422 `encrypted` | **否**（HTTP 入口 only） |
| F2 | 0 字节空 base64 → 400 入口拒 | 否 |
| F3 | >8MB → 413 `file_too_large` | 否 |
| F4 | 畸形 PDF → 422 `parse_failed` | 否 |
| F5 | 非法 MIME → 415 | 否 |
| F-billing | 无新增 consumption / resume | 否 |

**仍需 e2e:isolated（BLOCKED 无 Key）**：OCR 成功+409 全栈；扫描件 `no_text_layer` reason/UI；Resume `failed(reason=…)` 五枚举落库全铺。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-015 covered**
- [ ] 未把 OCR 成功+409 / `neg:resume` / `ocr:prove` 冒充失败族全关闭
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵最多 **partial**（非假 covered）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA` / **R5 green-risk**

## 5. 专家请回答

1. F1–F5 是否足以支撑矩阵 **partial**（仍明示 ≠ covered）？  
2. 扫描件 reason 枚举 + UI 重传是否列为下一刀（进 e2e:isolated 后才可讨论更高覆盖）？  
3. 结论写入 `reviews/`，含「仍 ≠ covered」明示。
