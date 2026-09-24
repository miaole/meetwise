# Harness — 公开隐私 DELETE=503 pin（GAP-PRIV-02 · BUG-PRIV-503 · PRIVACY-HTTP）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 产品删除闭环** · **pass ≠ 擦除已开放**  
**硬钉**：公开 `DELETE /privacy/interview-data/:id` **必须保持 503**，直至独立 prove + 专家审批准放开。  
**对照矩阵行**：`UC-E2E-050–052` · `PRIVACY-HTTP` · backlog `GAP-PRIV-02` · `BUG-PRIV-503`  
**对照文件**：`e2e-requirement-coverage-matrix.md` §1.1/§1.2 · `gap-bug-backlog.md` · `e2e-case-inventory.md` 家族 F-PRIV · `harness/e2e-full-suite.inventory.md`

---

## 0. 本切片验收立场（先读）

| 声明 | 裁定 |
|------|------|
| **删除是否已闭环？** | **否。** prove EXIT=0 **仅**钉「公开 DELETE 仍拒绝开放（503）」+ 预览非生产 SLO |
| **本绿 ≠ 产品删除闭环** | **必须钉死**。任何「删除已闭环 / erasure complete / controlPlaneClosed」叙事均为假绿（BUG-PRIV-503） |
| **预览路径** | `POST /privacy/erasure-preview` 可为 202 + `preview_incomplete` + `productionSloClaimed=false`；**不得**写成生产完成态 |
| **dormant 202 删除路径** | 证明文件内 503 早退后的 202 harness **不得跑**；issuer 本地基础 ≠ 公开破坏性 HTTP 已接线 |
| **夹具** | 经 `run-e2e-isolated` → 默认 `E2E_PG_IMAGE=pgvector` → **green-risk / R5**；≠ sole-stack 已迁 |
| **MODEL_API_KEY** | **不需要**（本 prove 不调 live 模型） |
| **产品扩面** | **不扩**；本 harness 只文档化已有 `privacy-erasure:http:prove` |

专家：`mw-privacy-int`（+ coordinator 派 `mw-e2e-ha` 对照矩阵）。禁止作者自签「删除已放行」。

---

## 1. 测什么（评测条目）

### 1.1 必测（现有 prove 已覆盖 · 本 harness 钉合同）

| ID | 测什么 | 期望 | 假绿风险（标红） |
|----|--------|------|------------------|
| **P1** | 候选人 Bearer + Idempotency-Key 对 `DELETE /privacy/interview-data/:id` | **HTTP 503** + `interview_erasure_authorization_not_available` | 勿把「有 DELETE 路由」写成已开放擦除 |
| **P2** | 同键重放 DELETE | 仍 **503**；**不建** `privacy_erasure_request` / target | 勿把幂等写成账本已建立 |
| **P3** | 隐私 JWS 冒充 Bearer | **401**；不建账本 | 勿把 JWS 形状写成 issuer HTTP 已接线 |
| **P4** | 合法 Bearer + `x-privacy-authorization` JWS | 仍 **503**（HTTP 未接线 issuer） | 勿把「头可传」写成授权放行 |
| **P5** | 旧 `DELETE /privacy/resume-data` | **503** + `resume_erasure_migration_in_progress` | 勿把 resume 入口写成已擦除 |
| **P6** | 预览 POST 202 | `editionLabel=预览版` · `productionSloClaimed=false` · `completeness=preview_incomplete` | **标红**：预览绿 ≠ 生产 SLO / ≠ 删除闭环 |
| **P7** | 预览之后再 DELETE | 仍 **503** | 勿把预览当生产开放开关 |
| **P8** | 跨 owner 预览 GET/POST | **404**；不泄露盘点 | 越权负路径；≠ 删除闭环 |
| **P9** | 静态/文档钉 | harness+eval 钉 `本绿≠产品删除闭环` / `DELETE=503` / 矩阵行 ID | 文档绿 ≠ 门关 |

### 1.2 明确不测 / 不得宣称

| 非目标 | 原因 |
|--------|------|
| 公开 DELETE → 202 fenced / 逐 sink receipt / 删后 read=0 | **GAP-PRIV-02 冻结**；dormant 路径禁止当证据 |
| INT-TRANSCRIPT-01 / 外部 OSS·Redis·Langfuse 擦除完成 | GAP-PRIV-03；本 prove 文件头已声明不宣称外站擦除 |
| Qdrant erasure sink recall=0 + ledger 对齐 | GAP-PRIV-04；见 `qdrant-erase-count-honesty.md`（仍 ≠ 0091） |
| MySQL 授权根替代 RLS / tenant cutover | GAP-PRIV-01 / BUG-PRIV-TENANT |
| sole-stack 夹具切流 | fixture=pgvector → green-risk（BUG-FAKE-R5 / BUG-E2E-ISO） |

---

## 2. 命令与期望 EXIT（FULL）

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm privacy-erasure:http:prove` | **0** | P1–P8 合同可执行：**公开 DELETE 仍 503**；预览非生产 SLO；**本绿 ≠ 产品删除闭环**；fixture=pgvector → green-risk |
| `pnpm privacy-erasure:http:prove:raw`（仅经 isolated 子进程；勿直指开发库） | **0** | 同上 raw 体：`pnpm -C apps/api prove:privacy-erasure-http` |
| `pnpm eval-harness-matrix-cite:prove`（可选静态） | **0** | harness+eval 引用矩阵行 ID；**≠** HTTP pin 已跑 |

复跑（仓库根）：

```bash
cd /workspace/meetwise   # 或仓库根
# 无需 MODEL_API_KEY；需 Docker 拉起 disposable PG（run-e2e-isolated）
pnpm privacy-erasure:http:prove ; echo EXIT=$?
```

执行体：`apps/api/test/privacy-erasure-http.proof.ts`  
入口：`package.json` → `privacy-erasure:http:prove` → `scripts/run-e2e-isolated.mjs privacy-erasure:http:prove:raw`

**早退纪律**（证明源码）：若首个公开 DELETE 已 503，dormant 202 删除 harness **return**，不得当「删除已开放」证据。

---

## 3. 假绿标红清单（审查必勾）

| 若有人说… | 正确读法 |
|-----------|----------|
| 「privacy-erasure:http:prove 绿了所以删除已闭环」 | **假绿（BUG-PRIV-503）**。EXIT=0 = **仍拒绝开放** |
| 「有 erasure-preview 202 所以生产擦除可用」 | **假绿**。`productionSloClaimed=false` / `preview_incomplete` |
| 「证明文件里有 202 fenced 断言所以已放行」 | **假绿**。503 早退后 dormant 路径不跑 |
| 「isolated 绿 = sole-stack / MySQL 隐私已迁」 | **假绿（BUG-FAKE-R5）**。夹具仍 pgvector |
| 「Qdrant erase-honesty 绿 = 隐私 sink 已齐」 | **假绿**。count 诚实 ≠ 0091 ledger / ≠ HTTP 放行 |

---

## 4. 矩阵 / backlog 锚点

| ID | 文件 | 本 harness 角色 |
|----|------|-----------------|
| UC-E2E-050–052 | `e2e-requirement-coverage-matrix.md` §1.1 | kill-switch / 无 PII / 删除导出 — **partial**；DELETE=503 pin |
| PRIVACY-HTTP | 同文件 §1.2 | 公开擦除 503 pin — **partial**；≠ 删除闭环 |
| GAP-PRIV-02 | `gap-bug-backlog.md` A | 保持 503；放开须 issuer/lease + 逐 sink receipt |
| BUG-PRIV-503 | 同文件 B | 「删除已闭环」叙事假绿守门 |
| F-PRIV | `e2e-case-inventory.md` | 家族登记；green-risk（夹具） |

评测证明：`ai-docs/delivery/eval/privacy-erasure-http-503-pin.eval.md`

---

## 5. 前置

- 仓库 checkout；`pnpm` + Docker（isolated disposable PG）
- **不要求** `MODEL_API_KEY`
- **禁止**把本 prove 指到开发库 / 云库

## 6. 审查

- 专家：`mw-privacy-int`；e2e 矩阵对照：`mw-e2e-ha`
- 结论另文：`ai-docs/delivery/reviews/YYYY-MM-DD-privacy-erasure-http-503-pin-mw-privacy-int.md`
- 禁止自批放开 DELETE；保持 `releaseEvidence=false`
