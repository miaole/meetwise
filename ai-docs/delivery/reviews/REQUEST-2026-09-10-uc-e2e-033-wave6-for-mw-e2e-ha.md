# REQUEST — UC-E2E-033 wave #6（W1/X9–X11）· for `mw-e2e-ha`

**日期**：2026-09-10（~02:49 PT）  
**实现方**：wave #6 partial ladder（018→011→002→010→019→**033**）  
**请审**：`mw-e2e-ha`（对抗独立审；**禁止**作者自签 covered）  
**并行 spot**：`mw-privacy-int`（见同日 REQUEST）

## 范围

- harness `harness/uc-e2e-033-cross-user-authz.md`（**新增 §1b**；W1/X9–X11）
- eval `eval/uc-e2e-033-cross-user-authz.eval.md`
- prove `apps/api/test/uc-e2e-033-cross-user-authz.proof.ts`
- 矩阵 `UC-E2E-033` / P1-7 保持 **partial**

## 请独立复跑

```bash
cd /workspace/meetwise
pnpm uc033:cross-user-authz:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

实现方实测：**EXIT=0** / **EXIT=0**（51 PASS；R5；≠covered）

## 硬钉（必须勾）

- [ ] **≠ covered**；矩阵 **partial**；§1b 非空
- [ ] W1 ≠ A3 live worker 闭环（`GAP-UC033-WORKER-LIVE`）
- [ ] X10 ≠ 七类高并发齐；X11 ≠ cache-trace 全路径
- [ ] releaseEvidence=false · Not HA · R5 · 本绿≠全链路 E2E covered
- [ ] neg:*/full.e2e RLS = 旁证 ≠ covered

结论请写入 `reviews/2026-09-10-uc-e2e-033-wave6-mw-e2e-ha.md`，含「仍 ≠ covered」。
