# 审查归档 — UC-E2E-002 非 UI lease（HTTP/API/db CAS）· mw-e2e-ha

**日期**：2026-09-10（PT）  
**审查角色**：独立审（实现方不自审）  
**结论**：**pass**  
**是否允许矩阵 partial**：**允许**（域 CAS L1–L3 可支撑）· **禁止 covered**  
**releaseEvidence=false** · **Not HA** · fixture=pgvector → **R5 green-risk**

## Prove（本审复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm uc002:lease:prove` | **0** | L1 并发恰一胜；L2 释放后顺序接管 + version CAS 递增；L3 RLS 0 行/抢不到；收据 `release_evidence=false`；`[R5-MARKED-RED]` pgvector |
| `pnpm eval-uc-e2e-001-002-cite:prove` | **0** | harness/eval/矩阵钉 **partial**、NON-UI、≠covered、releaseEvidence=false、Not HA；`matrix: UC-E2E-002 remains partial` |

## 硬钉核对

| 声称 | 裁定 |
|------|------|
| lease CAS 集成 ≠ covered | **成立**（prove 自钉 `BLOCKED_FOR_COVERED`；矩阵≠covered） |
| HTTP dual-session / Last-Event-ID / Playwright 双 context 仍缺 | **成立**（未见专用 HTTP/002 e2e；stream-window=单页 10k 窗口≠双设备） |
| R5 green-risk | **成立**（isolated 输出 `[R5-MARKED-RED]`） |
| releaseEvidence=false · 非 HA | **成立** |
| 矩阵行 **partial** | **诚实**（域 CAS 可支撑 partial；升 covered 须 X1+X4） |

## 假绿排查

- 未把 `uc002:lease:prove` 绿写成 covered  
- 未把 `stream-window.spec.ts` / sse helpers 写成跨设备 covered  
- cite 绿 ≠ 业务 covered（脚本 NOTE 已钉）  
- Playwright 未作 primary（用户硬要求 NON-UI 为主）— **合规**

## 缺口（保持 ≠covered）

- **X1** HTTP/API 双 session 顺序 resume  
- **X4** `Last-Event-ID` 专用 replay prove  
- Playwright 双 `browser.newContext`（降次，非本切片门禁）

## 建议

- 维持矩阵 **UC-E2E-002 = partial**  
- 升 **covered** 前须接线 X1（+X4）并复跑绿；勿因 lease/cite EXIT=0 回写 covered

## 对照

`harness/uc-e2e-002-cross-device.eval.md` · `eval/uc-e2e-002-cross-device.eval.md` · 矩阵 §1.1 UC-E2E-002 · §3 P0-7
