# Harness — UC-E2E-031 / 032 注入越狱 / 诱导造假（eval-first · gap(e2e)/partial(eval)）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-031/032 covered**  
**对照矩阵行**：`UC-E2E-031 / 032`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-12  
**对照需求**：`e2e-scenarios.md` UC-E2E-031 · UC-E2E-032 · TC-E2E-031-escape / biz-reject / **model-resist(ai-eval)** · TC-E2E-032-fabricate-reject / **no-fabricate-model(ai-eval)**  
**对照规则**：`rules/ai/safety-defense-in-depth.md`（越狱/诱导造假桶；**不用 fake model 证安全**）  
**对照旁证（≠ covered）**：`ai-docs/testing/golden-tasks/` · `pnpm scoring:eval` · `pnpm golden-tasks:check|prove` · TC-AIIV-002-jailbreak · TC-RES-012-jailbreak-eval · TC-quiz-078-jailbreak（graph-fake-model 机制） · `scripts/e2e-fake-service-flags.mjs`（E2E_FAKE_MODEL forbid）  
**MODEL_API_KEY**：**不需要**（静态 honesty inventory；不调 live 模型；不跑 HTTP / e2e:isolated 全链；**无 e2e fake-model 假越狱通过**）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵 **gap**(e2e) / **partial**(eval)。质量断言归 **ai-eval**；e2e 禁假模型冒充 |
| 本切片 | 可执行 **S1–S6** 静态库存 + **G-GAP-*** honesty；矩阵保持 **gap**(e2e) / **partial**(eval)；**不得**写 covered |
| 执行层 | **NON-UI** 静态 inventory（apps/api test）；**不**造 e2e fake-model jailbreak pass |
| 假绿禁令 | 不得把 graph-fake-model / E2E_FAKE_MODEL / 本绿写成「模型抗注入/不造假已通」或「UC-031/032 covered」 |
| 本绿≠全链路 E2E covered | **必须钉死**；EXIT=0 = 诚实钉 ≠ 安全质量闭环 |
| fixture | 经 `run-e2e-isolated` → **pgvector** → **green-risk / R5**（静态体不读写业务表；banner 仍可能出现） |

专家：`mw-e2e-ha` + `mw-model-op` 或 `meetwise honesty`。禁止作者自签 covered。

---

## 1. 测什么（S1–S6 + G-GAP 可执行合同）

| ID | 场景（UC 映射） | 期望 | 执行体 |
|----|-----------------|------|--------|
| **S1** | 需求层分流 | scenarios 钉 031/032；model-resist / no-fabricate → **ai-eval**；明示禁 e2e fake-model 证抵抗 | `apps/api/test/uc-e2e-031-032-injection-jailbreak.proof.mjs` |
| **S2** | e2e 禁假绿 | `e2e/*` / `full.e2e` **无** UC/TC-031/032；无 fake-model jailbreak/造假 pass；无 model-resist 质量断言 | 同上 |
| **S3** | 旁证路径 | golden-tasks README+registry · scoring:eval · traceability TC-* · safety-defense-in-depth · quiz graph-fake-model TC **cite ≠ covered** | 同上 |
| **S4** | 假模型禁令 | `e2e-fake-service-flags` / `e2e-static-guards` / honesty-rules 含 `E2E_FAKE_MODEL` fail-closed | 同上 |
| **S5** | 矩阵状态 | 行保持 **gap**(e2e) / **partial**(eval)；不得 **covered** | 同上 |
| **S6** | GuardrailHit | status-machine 有对象；无 `guardrail_hit`/`guard_events` CREATE（审计面未接线） | 同上 |
| **G-GAP-1** | 031 结构 e2e | 打印 `GAP-UC031-E2E-STRUCTURE` | 同上 |
| **G-GAP-2** | 031 ai-eval | 打印 `GAP-UC031-AI-EVAL` | 同上 |
| **G-GAP-3** | 032 结构 reject | 打印 `GAP-UC032-FABRICATE-REJECT` | 同上 |
| **G-GAP-4** | 032 ai-eval | 打印 `GAP-UC032-AI-EVAL` | 同上 |
| **G-GAP-5** | fake-model ban | 打印 `GAP-UC031-032-FAKE-MODEL-BAN` | 同上 |
| **G-GAP-6** | GuardrailHit | 打印 `GAP-UC031-032-GUARDRAIL` | 同上 |

**产品若浮出假绿（fail-closed）**：若 e2e 用 fake-model / `E2E_FAKE_MODEL` 宣称 031/032 jailbreak/造假安全闭环，本 prove **拒 EXIT=0**。

**明确不测 / BLOCKED（本 harness）**

| 非目标 | 原因 |
|--------|------|
| 真模型抗注入率 / 不造假率 | 归 ai-eval；`GAP-UC031-AI-EVAL` / `GAP-UC032-AI-EVAL` |
| e2e DOM 转义 / biz-reject 全链 | 结构面仍 gap(e2e)；`GAP-UC031-E2E-STRUCTURE` / `GAP-UC032-FABRICATE-REJECT` |
| 用 E2E_FAKE_MODEL 绿安全 | **禁止**；`GAP-UC031-032-FAKE-MODEL-BAN` |
| 云 / HA / releaseEvidence | Not HA · releaseEvidence=false |

---

## 1b. 抬到 covered 还缺（**ai-eval suite + gates** · 非 e2e fake-model）

> gap(e2e)/partial(eval)/honesty-pin **≠ done**。下列是北星「安全质量零遗漏」要关的路径；**主轨 = ai-eval**，e2e 只许结构面，**禁止**假模型冒充。

| # | 抬到 **covered** 仍缺 | 轨 |
|---|----------------------|----|
| 1 | 固定版本 jailbreak / injection golden 集（规模·分层·阈值·owner）挂入 release-gate；真模型跑 `TC-E2E-031-model-resist` | **ai-eval** |
| 2 | 诱导造假 / factuality golden 集；真模型跑 `TC-E2E-032-no-fabricate-model`；over-refusal 反例 | **ai-eval** |
| 3 | 与既有旁证对齐但不冒充：`TC-AIIV-002-jailbreak` · `TC-RES-012-jailbreak-eval` · safety 桶 release-gate 谓词（`safety-defense-in-depth`） | **ai-eval** |
| 4 | `scoring:eval` / 对抗套件可判定指标（拦截率下限、绕过率上限、最小样本量）；`golden-tasks` 登记安全类条目（最高 partial，禁止 fake mapped） | **ai-eval gates** |
| 5 | e2e **仅**结构：注入文本 DOM 转义（`TC-E2E-031-escape`）；越界分数 / 捏造 fixture 业务校验拒绝（`031-biz-reject` / `032-fabricate-reject`）——**不得**把分数「没被拉满」写成模型抗注入 | **e2e structure only** |
| 6 | `GuardrailHit(injection/jailbreak/fabrication)` append-only 表+API+审计绑定 principal | product + integration |
| 7 | 禁止路径：任何 `E2E_FAKE_MODEL` / graph-fake-model 绿条宣称 UC-031/032 **covered** | honesty |
| 8 | sole-stack 夹具替换默认 pgvector isolated，去掉 **R5 green-risk** 后才可讨论发布级 covered | 矩阵 §0 / R5 |

**本切片明确不做**：实现 ai-eval 全套；扩 e2e fake-model 假越狱通过；把矩阵升 covered；把 quiz graph-fake-model / mem07 / research-policy 旁证写成本行 covered。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc031-032:injection-jailbreak:prove` | **0** | S1–S6 + G-GAP-* 诚实钉；**本绿 ≠ UC-E2E-031/032 covered**；矩阵保持 **gap**(e2e) / **partial**(eval)；fixture banner → **green-risk / R5** |
| `pnpm uc031-032:injection-jailbreak:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc031-032-injection-jailbreak` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-031`/`032`；≠业务 covered |
| `pnpm golden-tasks:check` / `scoring:eval` | 旁证 | **≠** 本 UC covered；scoring:eval 需 Key 且 inconclusive |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；静态 inventory（isolated 包装对齐 siblings CMD 形态）
pnpm uc031-032:injection-jailbreak:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-031-032-injection-jailbreak.proof.mjs`  
入口：`package.json` → `uc031-032:injection-jailbreak:prove` → `scripts/run-e2e-isolated.mjs uc031-032:injection-jailbreak:prove:raw`

**旁证（≠本 UC 验收）**：`ai-docs/testing/golden-tasks/`；`pnpm scoring:eval`；`pnpm golden-tasks:check|prove`；traceability `TC-AIIV-002-jailbreak` / `TC-RES-012-jailbreak-eval` / `TC-quiz-078-jailbreak`；`ai-docs/rules/ai/safety-defense-in-depth.md`；`scripts/e2e-fake-service-flags.mjs`。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「e2e + E2E_FAKE_MODEL 绿了所以抗注入 covered」 | **假绿**。fake-model 无论是否注入都返回 fixture |
| 「TC-quiz-078 graph-fake-model = UC-031 covered」 | **假绿**。机制路由拒绝 ≠ 生产模型抵抗率 |
| 「scoring:eval / golden-tasks check 绿 = 031/032 covered」 | **假绿**。旁证 / 登记门 ≠ 本行安全质量闭环 |
| 「uc031-032:…:prove 绿 = covered」 | **假绿**。EXIT=0 = **honesty pin**；矩阵保持 **gap**(e2e)/**partial**(eval) |
| 「mem07 / research-policy deny = 模型不越狱」 | **假绿**。域围栏 ≠ model-resist ai-eval |
| 「G-GAP EXIT=0 = 抗注入已闭环」 | **假绿**。GAP 表示质量归 ai-eval、e2e 结构仍缺 |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-031 / 032 | **gap**(e2e) / **partial**(eval)（honest；S1–S6 + G-GAP pin）；**≠ covered** | `harness/uc-e2e-031-032-injection-jailbreak.md` |
| 评测说明 | `eval/uc-e2e-031-032-injection-jailbreak.eval.md` | 引用矩阵行 ID |
| P1-12 | 静态 honesty 已挂；抬 covered 见 §1b（**ai-eval suite + gates**） | 见矩阵 §3 |
