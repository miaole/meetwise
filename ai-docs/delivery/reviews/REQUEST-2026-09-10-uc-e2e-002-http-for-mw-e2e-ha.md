# 审查请求 — UC-E2E-002 跨设备 HTTP 双 session / LED（wave #3）· mw-e2e-ha

**日期**：2026-09-10（PT）  
****非专家结论** — 实现方审请包（禁止自审顶替）**：**partial OK · ≠ covered** — 请 `mw-e2e-ha` + 第二域（建议 privacy/int 或 model-op spot）独立确认  
**releaseEvidence=false** · Not HA · **禁止 covered** · matrix stay **partial**

## Prove（实测）

| CMD | EXIT | 备注 |
|-----|------|------|
| `pnpm uc002:http:prove` | **0** | H1–H3 + H-authz + G-GAP；R5-MARKED-RED pgvector；receipt `release_evidence=false` |
| `pnpm uc002:lease:prove` | **0** | L1–L3 db lease CAS；≠ HTTP lease mouth |
| `pnpm eval-uc-e2e-001-002-cite:prove` | **0** | harness/eval/矩阵钉 partial + §1b 抬 covered + uc010 旁证≠002 |
| `pnpm uc010:sse-resume:prove` | 旁证 | **SSE LED 旁证 ≠ UC-E2E-002 covered** |

## 搜码结论（请核对）

- **有**：`GET /interview/:id`；`GET /interview/:id/events` + `Last-Event-ID`
- **无**：HTTP thread lease CAS /「会话在别处活跃」；专用 `GET …/snapshot`

## 硬钉（请专家勾）

- [ ] 矩阵保持 **partial**；未升 **covered**
- [ ] `uc002:http:prove` 绿 = 双 session GET + LED 阶，**非** covered
- [ ] `uc010:sse-resume:prove` 标为**旁证** ≠ 002 covered
- [ ] HTTP lease mouth / snapshot / full.e2e / Playwright 双 context 仍在 §1b
- [ ] 钉 **R5 green-risk**；releaseEvidence=false · Not HA

## 建议

- 维持矩阵 **UC-E2E-002 = partial**
- 升 **covered** 前须接线 HTTP lease mouth（+ §1b 其余）并复跑绿；勿因 HTTP/lease/cite EXIT=0 回写 covered

## 对照

`harness/uc-e2e-002-cross-device.eval.md` §1b · `eval/uc-e2e-002-cross-device.eval.md` · 矩阵 §1.1 UC-E2E-002 · §3 P0-7
