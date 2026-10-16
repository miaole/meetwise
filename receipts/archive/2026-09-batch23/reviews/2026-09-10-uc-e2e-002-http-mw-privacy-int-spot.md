# 审查归档 — UC-E2E-002 HTTP 双 session / 授权 · mw-privacy-int spot

**日期**：2026-09-10
**结论**：**pass**（**限授权 / 双 session spot**）
**releaseEvidence=false** · **仍 partial ≠ covered** · **≠ 0058 fence** · 实现方不自审

## 对照
- `harness/uc-e2e-002-cross-device.eval.md` / `eval/uc-e2e-002-cross-device.eval.md`
- `apps/api/test/uc-e2e-002-cross-device-http.proof.ts`
- 矩阵行 `UC-E2E-002`（须保持 **partial**）

## 本机复跑
| CMD | EXIT |
| --- | --- |
| `pnpm uc002:http:prove` | **0**（13 PASS：H1 双 session 同主一致；H2/H3 LED；**H-authz userB GET/SSE→404**；印 HTTP-LEASE/FULL-E2E/PRIVACY-STUB GAP；R5） |

## 授权 spot
| 检查 | 判定 |
| --- | --- |
| 跨用户 404 | **成立**（GET + SSE） |
| 双 session 假绿 | **否** — 双 client **同 principal**（跨设备态）；≠ 跨用户共享；≠ HTTP lease「别处活跃」口（GAP 已钉） |
| 冒充 0058 / covered | **否** — PRIVACY-STUB + G-GAP；uc010/lease=旁证≠002 covered |

## 仍 block
- UC-E2E-002 **covered** / HTTP lease mouth / snapshot / Playwright 双 context / full.e2e
- 产品删除闭环 / `releaseEvidence=true`

## 一句话
跨用户 404 + 同主双 session spot **pass**；**仍 partial≠covered**。
