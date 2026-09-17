# Harness eval — UC-E2E-002 跨设备 / lease（eval-first · NON-UI 优先 · partial）

**releaseEvidence=false** · **Not HA** · **partial ≠ covered** · **lease/HTTP prove ≠ covered**  
**对照矩阵行**：`UC-E2E-002`  
**对照需求**：`requirements/use-cases/e2e-scenarios.md` · UC-E2E-002  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P0-7  
**MODEL_API_KEY**：**不需要**（lease CAS + HTTP dual-session 均无 Key）  
**待审专家**：`mw-e2e-ha`（+ 第二域对抗 · dual-review ready）

---

## 0. 立场（NON-UI 优先）

| 声明 | 裁定 |
|------|------|
| 矩阵覆盖状态 | **partial**（`uc002:lease:prove` + `uc002:http:prove` 真跑绿）；**不得**写 **covered** |
| 主验收本切片 | **非 UI**：① db lease CAS（L1–L3）；② HTTP 双 session GET + `Last-Event-ID` 续传（H1–H3 / H-authz） |
| Playwright | **降次**；stream-window / 双 `browser.newContext` **不是**本切片主路径 |
| 搜码结论（wave #3） | **有** `GET /interview/:id` + `GET /interview/:id/events`(+`Last-Event-ID`)；**无** HTTP thread lease CAS /「会话在别处活跃」口；**无** 专用 `GET …/snapshot` |
| 明确仍缺（≠covered 门槛） | **HTTP lease mouth**；专用 snapshot 路由；Playwright 双 context；full.e2e 双设备 |
| 假绿禁令 | 不得把 lease/HTTP prove 绿 / stream-window 绿 / **uc010 SSE prove** 写成 本 UC 为 **covered** |

---

## 1. 当前资产（诚实分层）

| 资产 | 层 | 做什么 | 为什么 ≠ covered |
|------|----|--------|------------------|
| `packages/db/test/uc-e2e-002-cross-device-lease.proof.ts` | **主** integration | L1 并发双 leaseOwner 恰一胜；L2 释放后顺序接管；L3 错主体 0 行/抢不到 | 无 HTTP 双 session；无 HTTP lease mouth |
| `apps/api/test/uc-e2e-002-cross-device-http.proof.ts` | **主** HTTP | H1 双 session GET 状态一致；H2 A断→B `Last-Event-ID` 续；H3 中位游标；H-authz 404 | 无 HTTP lease CAS；无 snapshot 专用口；≠ full.e2e |
| `pnpm uc010:sse-resume:prove` | **旁证** | 单 session SSE R1–R4 LED | **旁证 ≠ UC-E2E-002 covered**（钉死） |
| `e2e/helpers/sse.ts` / `interview.ts` | 工具 | `last-event-id` / seq 推进 | helper ≠ 验收场景 |
| `apps/web/e2e-ui/stream-window.spec.ts` | UI 降次 | 单页 10k 重放窗口压力 | **非**双设备；Playwright 非本 UC 主路径 |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> partial ≠ done。下列是北星「全链路零遗漏」要关的路径，**不是**本 prove 已绿项。**禁止**因 L1–L3 / H1–H3 绿而升 covered。

| # | 抬到 **covered** 仍缺 | 对应验收 / 缺口 |
|---|------------------------|-----------------|
| 1 | HTTP **thread lease CAS** 产品口：双 session 并发 resume → 恰一胜 + 输者「会话在别处活跃」（或等价）；现仅有 db `withInterviewGraphFence` | A2 / TC-E2E-002-lease-race HTTP 面 · `GAP-UC002-HTTP-LEASE-MOUTH` |
| 2 | 专用 `GET /interview/:id/snapshot`（场景契约）或正式 ADR 钉「`GET /:id` 即 snapshot」+ 题面/历史字段齐 | A1 · `GAP-UC002-SNAPSHOT-ROUTE` |
| 3 | `full.e2e.ts` / `e2e:isolated` **显式**双设备 TC（鉴权→作答→换 session resume + LED + lease） | A1/A2 · `GAP-UC002-FULL-E2E` |
| 4 | Playwright 双 `browser.newContext`（次层；不可单独升 covered） | UI · `GAP-UC002-PLAYWRIGHT-DUAL` |
| 5 | sole-stack 夹具替换默认 pgvector isolated，去掉 **R5 green-risk** | 矩阵 §0 / R5 |
| — | ~~HTTP 双 session GET + Last-Event-ID 续传 prove~~ **CLOSED（本波 partial 阶）** | was X1/X4 HTTP 面 · **已挂** `uc002:http:prove`（仍 ≠ covered） |

**本切片已关 §1b 上表「HTTP 双 session GET+LED」阶**；仍明确不做：#1 HTTP lease mouth 实现；#2 snapshot 产品路由；#3/#4/#5；把 **uc010** / lease / HTTP 绿写成 covered；把矩阵升 covered。

---

## 2. 可执行验收合同

| ID | 场景 | 期望（可测） | 落点 / 优先级 |
|----|------|--------------|---------------|
| **L1** | 同 owner 双 leaseOwner **并发**抢 `withInterviewGraphFence` | 恰一个 `acquired=true`；输者 `false`（A2 / TC-E2E-002-lease-race） | **`pnpm uc002:lease:prove`** · **P0 NON-UI** |
| **L2** | 释放后第二 device 顺序取得 fence | `acquired=true` 且 version CAS 递增 | 同上 |
| **L3** | 非属主读/抢同 threadId | RLS **0 行**；抢 fence 未取得（A3） | 同上 |
| **H1** | 双 HTTP session 顺序 `GET /interview/:id` | 同 id/status/progress 投影一致（A1 状态面） | **`pnpm uc002:http:prove`** · **P0 HTTP** |
| **H2** | device-A SSE abort → 账本续写 → device-B `Last-Event-ID=N` | 仅 seq>N；不重不漏（X1 SSE + X4） | 同上 |
| **H3** | device-B 中位游标 | `Last-Event-ID=2` → seq=[3,4,5] | 同上 |
| **H-authz** | 他主体 GET/SSE | **404**（A3） | 同上 |
| **X1-lease-HTTP** | HTTP 双 client **并发** resume 抢 lease | 「会话在别处活跃」等产品口 | **仍缺** → 阻塞 covered |
| **UI** | Playwright 双 `browser.newContext` | 同 X1 的 UI 面 | **降次**；不替代 L*/H* |

**未齐 HTTP lease mouth（§1b#1）之前**：矩阵最多 **partial**；**禁止** covered。

---

## 3. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc002:lease:prove` | **0** | L1–L3 lease CAS 绿；**本绿 ≠ covered**；fixture=pgvector → green-risk / R5 |
| `pnpm uc002:http:prove` | **0** | H1–H3 + H-authz；**本绿 ≠ covered**；无 HTTP lease mouth；R5 |
| `pnpm uc002:lease:prove:raw` / `uc002:http:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C packages/db prove:uc002-lease` / `pnpm -C apps/api prove:uc002-http` |
| `pnpm uc010:sse-resume:prove` | **0** | **旁证** SSE LED；**≠ UC-E2E-002 covered** |
| `pnpm eval-uc-e2e-001-002-cite:prove` | **0** | 静态：harness/eval/矩阵钉 partial 诚实；≠业务 covered |
| Playwright 双 context | — | **降次 / 未接线**；非本切片门禁 |
| 无 Key 时误跑宽 `e2e:isolated` | **blocked** | 本 UC 主路径**不依赖**；勿假跑 |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；需 Docker disposable PG（run-e2e-isolated）
pnpm uc002:lease:prove ; echo "CMD=pnpm uc002:lease:prove EXIT=$?"
pnpm uc002:http:prove ; echo "CMD=pnpm uc002:http:prove EXIT=$?"
pnpm eval-uc-e2e-001-002-cite:prove ; echo "CMD=pnpm eval-uc-e2e-001-002-cite:prove EXIT=$?"
# 旁证（≠002 covered）:
# pnpm uc010:sse-resume:prove ; echo EXIT=$?
```

执行体：  
- db：`packages/db/test/uc-e2e-002-cross-device-lease.proof.ts`  
- HTTP：`apps/api/test/uc-e2e-002-cross-device-http.proof.ts`  

入口：`package.json` → `uc002:lease:prove` / `uc002:http:prove` → `scripts/run-e2e-isolated.mjs …:raw`

**旁证（≠本 UC covered）**：`pnpm uc010:sse-resume:prove`；`pnpm last-event-id:unit:prove`；`e2e/helpers/sse.ts`；`stream-window.spec.ts`。

---

## 4. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「stream-window 绿了所以跨设备已覆盖」 | **假绿**。单页重放窗口 ≠ 双设备；UI 降次 |
| 「sse.ts 有 last-event-id 所以 002 关闭」 | **假绿**。helper ≠ 验收场景 |
| 「uc010:sse-resume:prove 绿 = 002 covered」 | **假绿**。uc010 = **旁证**；单 session ≠ 跨设备 002 |
| 「uc002:lease:prove / uc002:http:prove 绿 = covered」 | **假绿**。最多 **partial**；缺 HTTP lease mouth + snapshot/full.e2e/UI |
| 「写了本 eval 所以 gap 关闭为 covered」 | **假绿**。partial ≠ covered |
| 「e2e:isolated 全绿含 002」 | **假绿** unless §1b#1+#3 显式断言存在且矩阵已改 |

---

## 5. 矩阵锚点

| ID | 状态（本切片后） | 本 harness |
|----|------------------|------------|
| UC-E2E-002 | **partial**（L1–L3 + H1–H3 HTTP dual GET/LED）；**≠ covered** | `harness/uc-e2e-002-cross-device.eval.md` |
| 评测笔记 | `eval/uc-e2e-002-cross-device.eval.md` | 交叉引用矩阵 |
| P0-7 | **NON-UI 优先** `uc002:lease:prove` + HTTP `uc002:http:prove`；Playwright 降次；HTTP lease mouth 仍缺 | 见矩阵 §3 |

## 6. 审查勾选（mw-e2e-ha · dual-review ready）

- [ ] 主路径为 NON-UI lease / HTTP；Playwright 未作 primary
- [ ] 未把 stream-window / sse helpers / lease / HTTP / **uc010** 写成 本 UC 为 **covered**
- [ ] 矩阵行为 **partial**（或诚实 gap）；**非** covered
- [ ] `pnpm uc002:lease:prove` + `pnpm uc002:http:prove` 已接线并记 CMD/EXIT
- [ ] §1b 抬 covered 清单含 HTTP lease mouth；本波仅关 GET+LED 阶
- [ ] releaseEvidence=false · Not HA
