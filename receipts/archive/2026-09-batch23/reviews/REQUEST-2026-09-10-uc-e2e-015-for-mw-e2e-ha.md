# 审查请求 — UC-E2E-015 简历摄取失败族 · mw-e2e-ha

**日期**：2026-09-10（PT）  
****非专家结论** — 实现方审请包（禁止自审顶替）**：**partial OK · ≠ covered** — 请 `mw-e2e-ha` 独立确认  
**releaseEvidence=false** · Not HA · **禁止 covered / 全链路 E2E covered**

## Prove（实测）

| CMD | EXIT | 备注 |
|-----|------|------|
| `pnpm uc015:ingest-failures:prove` | **0** | F1–F5 + F-billing 共 12 PASS；R5-MARKED-RED pgvector；receipt `release_evidence=false` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | harness+eval 引用 UC-E2E-015；钉 partial / R5 / 加密·0字节·超大·畸形 / 相对 409 |
| `pnpm -C packages/domain prove:resume-extract` | **0** | 域侧 `/Encrypt` → `encrypted` 旁证 |
| `pnpm e2e:isolated`（OCR 成功+409） | **blocked** | 无 MODEL_API_KEY；未硬跑 |

## 硬钉（请专家勾）

- [ ] 失败族含 **加密 / 0字节 / 超大 / 畸形**（相对 OCR 成功+409）
- [ ] 矩阵保持 **partial**；未升 **covered**
- [ ] 钉 **R5 green-risk**；本绿 ≠ 全链路 E2E covered
- [ ] 仍需 e2e:isolated：扫描件 reason/UI、failed(reason) 枚举全铺、OCR+409（Key）

## 建议

- 维持 **partial**
- 升 **covered** 须 isolated 全 HTTP 失败族 + reason/UI 落地并复跑绿（且有 Key 的成功面不冒充失败族）

## 对照

`harness/uc-e2e-015-resume-ingest-failures.md` · `eval/uc-e2e-015-resume-ingest-failures.eval.md` · 矩阵行 `UC-E2E-015`
