# Harness — UC-E2E-015 简历摄取失败族（eval-first · partial ladder）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-015 covered**  
**对照矩阵行**：`UC-E2E-015`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P0-6  
**对照需求**：`e2e-scenarios.md` UC-E2E-015（E1 加密 / E3 0字节·损坏 / E4 超大 / E5 非PDF·畸形 MIME）  
**对照已有成功面**：`full.e2e.ts` OCR 成功 + duplicate **409**（**相对**本失败族；成功面 ≠ 失败族 covered）  
**MODEL_API_KEY**：**不需要**（本 prove 不调 live 模型 / 不跑 OCR 成功路径）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | `full.e2e.ts` OCR 成功+409；`ocr:prove` / `neg:resume` 有部分畸形/415 → 矩阵可维持 **partial**；**不得**写 covered |
| 本切片 | 可执行 **F1–F5** HTTP 失败族：加密 / 0字节入口 / 超大 413 / 畸形 PDF / 非法 MIME；无 Key |
| 相对成功面 | OCR 成功+409 **旁证**摄取主路，**不**关闭失败族 |
| 假绿禁令 | 不得把本绿写成「e2e:isolated 已含 015 全失败族」或「UC-E2E-015 covered」 |
| 本绿≠全链路 E2E covered | **必须钉死**；无 Key 时 full HTTP e2e:isolated **blocked** |
| fixture | 经 `run-e2e-isolated` → **pgvector** → **green-risk / R5**（本绿≠sole-stack migrated） |

专家：`mw-e2e-ha`。禁止作者自签 covered。

---

## 1. 测什么（F1–F5 可执行合同）

| ID | 场景（UC 映射） | 期望 | 执行体 |
|----|-----------------|------|--------|
| **F1** | E1 加密 PDF | HTTP `POST /resume/file` → **422** `error=encrypted`；不落可用 profile；无 OCR/诊断入队 | `apps/api/test/uc-e2e-015-resume-ingest-failures.proof.ts` |
| **F2** | E3 0 字节入口 | `contentBase64` 空串 → 契约 **400**（入口即拒；相对服务 `empty_file` 纵深） | 同上 |
| **F3** | E4 超大 | 解码后 >8MB → **413** `error=file_too_large`；不落摄取 | 同上 |
| **F4** | E3/刁钻 畸形 PDF | 坏字节冒充 PDF → **422** `error=parse_failed`（可解释，非 5xx） | 同上 |
| **F5** | E5 非法 MIME / 非简历格式 | `.exe` / xlsx 等 → **415** `unsupported_file_format` | 同上 |
| **F-billing** | A3 无扣费 | 上述失败路径 `entitlement_consumption` 无新增 OCR/简历相关扣减 | 同上 |

**明确不测 / BLOCKED（本 harness · 仍需 e2e:isolated）**

| 非目标 | 原因 |
|--------|------|
| OCR 成功 + duplicate 409 全栈 | 已在 `full.e2e.ts`；**需 MODEL_API_KEY**；≠本失败族 |
| E2 扫描件 `no_text_layer` 专用 reason 枚举 + UI 重传文案 | 现多为 `extracted_too_short`；UI/契约枚举未齐 → **e2e:isolated** |
| Resume 状态机 `uploaded→failed(reason=…)` 五枚举落库 | 当前多为入口 HTTP 拒；状态机 reason 枚举全铺属后续 |
| 诊断/押题后续图不入队的端到端观测 | 本 prove 断言不落可用画像 + 无 OCR consumption；图队列全观测另包 |
| 云 / HA | Not HA · releaseEvidence=false |

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc015:ingest-failures:prove` | **0** | F1–F5 + F-billing HTTP 断言绿；**本绿 ≠ UC-E2E-015 covered**；fixture=pgvector → **green-risk / R5** |
| `pnpm uc015:ingest-failures:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc015-ingest-failures` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-015`；≠业务 covered |
| `pnpm e2e:isolated`（全量含 OCR 成功+409） | **blocked**（无 Key） | 不得硬跑；成功面另记 |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；需 Docker disposable PG（run-e2e-isolated）
pnpm uc015:ingest-failures:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-015-resume-ingest-failures.proof.ts`  
入口：`package.json` → `uc015:ingest-failures:prove` → `scripts/run-e2e-isolated.mjs uc015:ingest-failures:prove:raw`

**旁证（≠本 UC 失败族验收）**：`pnpm neg:resume`（畸形/415 子集）、`pnpm ocr:prove`、`full.e2e.ts` OCR+409。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「OCR 成功+409 绿了所以 015 covered」 | **假绿**。成功面 ≠ 失败族 |
| 「neg:resume 绿 = 015 covered」 | **假绿**。子集旁证；缺专用加密/0字节/413 合同直至本 harness |
| 「uc015:ingest-failures:prove 绿 = covered」 | **假绿**。最多 **partial**；缺 e2e:isolated 全 HTTP 家族 + reason 枚举/UI |
| 「无 Key 跳过 full e2e 仍算 covered」 | **假绿**。无 Key → **blocked**，不是绿 |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-015 | **partial**（HTTP F1–F5）；**≠ covered** | `harness/uc-e2e-015-resume-ingest-failures.md` |
| 评测说明 | `eval/uc-e2e-015-resume-ingest-failures.eval.md` | 引用矩阵行 ID |
| P0-6 | 失败族 prove 已挂；全链路 e2e:isolated 仍缺 / 无 Key blocked | 见矩阵 §3 |

## 5. 审查

- `mw-e2e-ha`：确认未把 partial 写成 covered；确认钉 **R5 green-risk**；确认失败族含加密/0字节/超大/畸形；相对 OCR 成功+409
- 全量 e2e:isolated 另包；本文件钉无 Key 可跑合同 + 命令
