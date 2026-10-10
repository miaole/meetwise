# REQUEST — UC-E2E-033 wave #6 spot · for `mw-privacy-int`

**日期**：2026-09-10（~02:49 PT）  
**请审**：`mw-privacy-int`（越权/隔离/export spot；**不**因 spot 升 covered）

## 请核

- X1–X8 越权 404 / A2 0 行 / B-C / export 隔离仍在
- W1 job-table RLS 0 行；X9 notification/career 隔离；X11 404 体不泄露 owner
- **禁止**把本绿写成隐私擦除/DELETE 闭环或放弃 RLS
- spot pass **不改变** mw-e2e-ha 门槛（仍 ≠ covered / 七类未齐 / WORKER-LIVE GAP）

复跑同 `pnpm uc033:cross-user-authz:prove`（实现方 EXIT=0）。  
结论写入 `reviews/2026-09-10-uc-e2e-033-wave6-mw-privacy-int-spot.md`。
