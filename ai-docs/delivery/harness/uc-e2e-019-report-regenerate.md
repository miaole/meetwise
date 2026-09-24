# Harness — UC-E2E-019 报告重生成 + 与退款并发（eval-first · partial ladder）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-019 covered**  
**对照矩阵行**：`UC-E2E-019`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-5（本切片新增）  
**对照需求**：`e2e-scenarios.md` UC-E2E-019 · A1/A2/A3 · E-regen幂等 / E-既退又扣 / E-顺序守卫  
**关联**：UC-E2E-011 R2/H2 — quarantined 不可 `requeueFailedReport` / `POST …/report/retry` → 404 **BLOCKED**  
**MODEL_API_KEY**：**不需要**（db 集成 + HTTP report/retry 均不调 live 模型）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵 **partial**（`uc019:report-regenerate:prove` + `uc019:report-regenerate:http:prove` 真跑绿）；**不得**写 covered |
| 本切片 | 可执行 **G1–G2** 集成 + **G3–G4** honesty + **H1–H3** HTTP report/retry + **H4** regenerateAttempt/demand-path GAP |
| D1 口径 | 报告失败默认**不退**；regenerate 应免费；db 以 `requeueFailedReport` 代理；HTTP 产品口 = `POST /interview/:id/report/retry` |
| 另轨 | `uc011:report-refund:prove` / `uc011:…:http` / `report:prove` / `commerce:prove` **≠** 本 UC 专用 regenerate×退款并发验收（可旁证，勿冒充） |
| 假绿禁令 | 不得把本绿写成「regenerateAttempt 已落」或「UC-E2E-019 covered」或「`/reports/:id/regenerate` 已闭环」 |
| 本绿≠全链路 E2E covered | **必须钉死**，直至 regenerateAttempt + A3 confirmed→released + quarantine regen 出口 + `full.e2e`/UI |

专家：`mw-e2e-ha` + `mw-model-op`。禁止作者自签 covered。

---

## 1. 测什么（G1–G4 + HTTP H* 可执行合同）

| ID | 场景 | 期望 | 执行体 |
|----|------|------|--------|
| **G1** | failed 报告上连点 `requeueFailedReport` | 首次 true→queued；二次/三次 false；额度不扣；consumption 仍 confirmed | `packages/db/test/uc-e2e-019-report-regenerate.proof.ts` |
| **G2** | `requeueFailedReport` ∥ `releaseConsumption`（confirmed） | release→`already_confirmed`；consumption 仍 confirmed；无 `released∧(queued\|running)` 非法组合；额度不退 | 同上 |
| **G3** | A3 退款先赢 + quarantine regen | confirmed 上 release 无法到 released（A3 产品路径 **GAP**）；quarantined 不可 requeue（UC-011 R2 BLOCKED） | 同上 |
| **G4** | honesty GAP | `ai_report` 无 regenerate* 列；打印 `GAP-UC019-*`；EXIT=0 仅=诚实钉 ≠ covered | 同上 |
| **H1** | failed + **HTTP** `POST …/report/retry` | 首次 200 `requeued:true`→queued；二/三次 404 `no_retriable_report`；HTTP 额度不扣；confirmed | `apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts` |
| **H2** | HTTP retry ∥ `releaseConsumption` | release→`already_confirmed`；无 `released∧regen`；HTTP 额度不变 | 同上 |
| **H3** | A3 GAP + quarantine HTTP retry | confirmed 无法先退；quarantined → POST retry **404** `no_retriable_report` | 同上 |
| **H4** | honesty probe | 无 regenerate* 列；`POST /reports/:id/regenerate`→404；report/retry 未鉴权→401；GAP pins | 同上 |

**搜码结论（wave #5）**

| 路径 | 结论 |
|------|------|
| `POST /interview/:id/report/retry` | **已存在** — `InterviewController.retryReport` → `requeueFailedReport`；本波 HTTP prove 打真口 |
| `POST /reports/:id/regenerate` | **需求名路径缺失** — 运行时 404；H4 honesty（≠ report/retry 冒充 covered） |
| `(interviewId, regenerateAttempt)` 幂等键 | **缺失** — `ai_report` 无 regenerate* 列；仅 status=failed CAS |
| confirmed→released 产品口 | **缺失** — `releaseConsumption` 对 confirmed→`already_confirmed`；A3 不可闭环 |
| quarantined 免费 regenerate 出口 | **BLOCKED** — retry SELECT 含 quarantined，但 `requeueFailedReport` 仅 failed→queued → HTTP 404 |

### 明确不测 / BLOCKED（本 harness · 抬 covered 见 §1b）

| 非目标 | 原因 |
|--------|------|
| 幂等键 `(interviewId, regenerateAttempt)` 产品口 | schema/API 未落；H4/G4 GAP |
| A3 退款先到→released→regen 拒闭环 | 无 confirmed→released 产品口；H3/G3 GAP |
| quarantined 免费 regenerate 出口 | UC-011 R2/H2 + 本 H3 已钉 404 BLOCKED |
| `full.e2e` / Playwright UI regenerate | 未进本 prove；§1b |
| 支付退款回调 / balance-ui | UC-011 R4/H4 另轨 |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> partial ≠ done。下列是北星「全链路零遗漏」要关的路径，**不是**本 prove 已绿项。**禁止**因 G*/H* 绿而升 covered。

| # | 抬到 **covered** 仍缺 | 对应验收 / 缺口 |
|---|------------------------|-----------------|
| 1 | **regenerateAttempt 幂等键**：`(interviewId, regenerateAttempt)` 落库 + API + 连点仅一次产品证明（非仅 status=failed CAS） | E-regen幂等 / A1 · `GAP-UC019-REGEN-IDEM-KEY` |
| 2 | **A3 退款先赢闭环**：confirmed→released 产品口（或正式 ADR 降级）+ released 上 regenerate/retry 一致拒绝可解释 | E-顺序守卫 / A3 · `GAP-UC019-REFUND-FIRST-ORDER` |
| 3 | **quarantined regenerate 出口**（可恢复或产品口径 ADR：quarantine 终态不可 regen） | 关联 UC-011 · `GAP-UC019-QUARANTINE-REGEN` |
| 4 | **full.e2e / UI**：`e2e:isolated` 显式 HTTP regenerate + 额度并发进 `full.e2e.ts` 或 Playwright | `GAP-UC019-FULL-E2E` |
| 5 | 需求名 `POST /reports/:id/regenerate` 落地 **或** 正式 ADR 降级为 `POST /interview/:id/report/retry`（本 prove 已钉 retry ≠ demand-path covered） | `GAP-UC019-DEMAND-PATH` |
| 6 | sole-stack 夹具（MySQL+Qdrant+Redis）替换默认 pgvector isolated，去掉 **R5 green-risk** 后才可讨论发布级 covered | 矩阵 §0 / R5 |

**本切片明确不做**：上表实现；把旁证 prove 绿写成 covered；把矩阵升 covered。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc019:report-regenerate:prove` | **0** | G1–G2 集成绿 + G3–G4 honesty pin；**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → green-risk / R5 |
| `pnpm uc019:report-regenerate:http:prove` | **0** | H1–H3 HTTP report/retry + H4 regenerateAttempt/demand-path GAP；**仍 ≠ covered**；privacy stub pin；R5 |
| `pnpm uc019:report-regenerate:prove:raw` / `…:http:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C packages/db prove:uc019-report-regenerate` / `pnpm -C apps/api prove:uc019-report-regenerate-http` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-019`；≠业务 covered |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；需 Docker disposable PG（run-e2e-isolated）
pnpm uc019:report-regenerate:prove ; echo EXIT=$?
pnpm uc019:report-regenerate:http:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：  
- db：`packages/db/test/uc-e2e-019-report-regenerate.proof.ts`  
- HTTP：`apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts`  

入口：`package.json` → `uc019:report-regenerate:prove` / `uc019:report-regenerate:http:prove` → `scripts/run-e2e-isolated.mjs …:raw`

**旁证（≠本 UC 验收）**：`pnpm uc011:report-refund:prove`（R2 quarantine BLOCKED）；`pnpm uc011:report-refund:http:prove`（H2 retry 404）；`pnpm report:prove`（bulkhead requeue）；`pnpm commerce:prove`。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「uc011 R2/H2 绿了所以 019 covered」 | **假绿**。仅钉 quarantine 不可 requeue；≠ regenerate×退款并发 |
| 「report:prove requeue 绿 = 019 covered」 | **假绿**。另轨舱壁 ≠ UC-E2E-019 G*/H* |
| 「uc019:report-regenerate:prove 绿 = covered」 | **假绿**。最多 **partial**；缺 regenerateAttempt / A3 / quarantine 出口 / full.e2e |
| 「uc019:…:http:prove 绿 = covered / regenerateAttempt 已闭环」 | **假绿**。HTTP report/retry 口 + H4 GAP ≠ regenerateAttempt 产品；仍缺 §1b |
| 「G3/H3/H4 EXIT=0 = A3 / demand-path 已闭环」 | **假绿**。是 GAP 诚实钉 |
| 「POST report/retry = POST /reports/:id/regenerate covered」 | **假绿**。产品口已钉 ≠ 需求名路径落地 |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-019 | **partial**（G1–G4 + H1–H4）；**≠ covered** | `harness/uc-e2e-019-report-regenerate.md` |
| 评测说明 | `eval/uc-e2e-019-report-regenerate.eval.md` | 引用矩阵行 ID |
| P1-5 | 集成+HTTP report/retry prove 已挂；regenerateAttempt / A3 / quarantine 出口 / full.e2e 仍缺 | 见矩阵 §3 · harness §1b |

## 5. 审查

- `mw-e2e-ha`：确认未把 partial 写成 covered；确认 `本绿≠全链路 E2E covered`；确认 H4 未把 report/retry 写成 demand-path / regenerateAttempt 已实现
- `mw-model-op`：确认 D1（报告失败不退 / regenerate 免费）与 G2/H2 非法组合钉未被写反；确认 G3/H3/H4 为诚实 GAP 而非假闭环
