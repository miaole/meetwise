# 评测笔记 — UC-E2E-002 跨设备 / lease（eval-first · NON-UI · wave #3 HTTP）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **partial ≠ covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-002-cross-device.eval.md`  
**对照矩阵**：`ai-docs/delivery/e2e-requirement-coverage-matrix.md` 行 **UC-E2E-002**  
**待审专家**：`mw-e2e-ha`（dual-review ready）

---

## 1. 用途

交叉链接矩阵与 harness：主验收 **NON-UI** lease CAS（`pnpm uc002:lease:prove` · L1–L3）+ HTTP 双 session GET/`Last-Event-ID`（`pnpm uc002:http:prove` · H1–H3）；Playwright / stream-window **降次**；**uc010 SSE prove = 旁证 ≠ 002 covered**；HTTP lease mouth 仍缺 → 矩阵 **partial**，**禁止** covered。

---

## 2. 搜码结论（wave #3）

| 路径 | 裁定 |
|------|------|
| `GET /interview/:id` | **有** — 双 session 状态 resume 顶替（无专用 `/snapshot`） |
| `GET /interview/:id/events` + `Last-Event-ID` | **有** — H2/H3 LED 续传 |
| HTTP thread lease CAS /「会话在别处活跃」 | **无** — honesty `GAP-UC002-HTTP-LEASE-MOUTH`；lease 仍 db L1–L3 |
| `pnpm uc010:sse-resume:prove` | **旁证** 单 session LED ≠ 002 跨设备 covered |

---

## 3. 执行记录

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc002:lease:prove` | **0** | （本切片复跑） | L1–L3；**≠ covered**；R5 fixture |
| `pnpm uc002:http:prove` | **0** | （本切片） | H1–H3 + H-authz；**≠ covered**；无 HTTP lease mouth |
| `pnpm uc010:sse-resume:prove` | **0** | 旁证可选 | **≠ UC-E2E-002 covered** |
| Playwright 双 context | — | **降次 / 未接线** | 非主路径 |
| `pnpm eval-uc-e2e-001-002-cite:prove` | **0** | （本切片） | 仅文档钉；≠ covered |

```bash
cd /workspace/meetwise
pnpm uc002:lease:prove ; echo EXIT=$?
pnpm uc002:http:prove ; echo EXIT=$?
pnpm eval-uc-e2e-001-002-cite:prove ; echo EXIT=$?
```

---

## 4. 矩阵交叉引用

| 矩阵位置 | 要点 |
|----------|------|
| §1.1 UC-E2E-002 | **partial**（lease CAS + HTTP dual GET/LED）；HTTP lease mouth / Playwright / full.e2e 仍缺；≠covered |
| §3 P0-7 | **NON-UI 优先** `uc002:lease:prove` + `uc002:http:prove`；Playwright 降次；uc010=旁证≠002 covered |
| UC-E2E-010 | 断线重连 partial **旁证**，**不替代** 002 |
| harness §1b | 抬 covered 清单：HTTP lease mouth · snapshot · full.e2e · UI · sole-stack |

---

## 5. advanced vs remaining

| Advanced（本波） | Remaining（阻塞 covered） |
|------------------|---------------------------|
| L1–L3 db lease CAS | HTTP lease CAS 产品口 |
| H1 双 HTTP GET 状态一致 | 专用 snapshot 路由或 ADR |
| H2/H3 双 session Last-Event-ID | full.e2e 双设备场景 |
| H-authz 404 | Playwright 双 context；sole-stack 去 R5 |

---

## 6. 审查勾选

- [ ] NON-UI 优先；未把 UI / uc010 写成 002 covered  
- [ ] 矩阵为 **partial**（非 covered）  
- [ ] §1b 抬 covered 已钉  
- [ ] releaseEvidence=false
