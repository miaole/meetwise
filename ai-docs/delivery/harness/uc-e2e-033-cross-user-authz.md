# Harness — UC-E2E-033 越权（C 跨用户 / B-C）（eval-first · partial ladder）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-033 covered**  
**对照矩阵行**：`UC-E2E-033`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-7  
**对照需求**：`e2e-scenarios.md` UC-E2E-033 · A1/A2/A3/A4 · TC-E2E-033-cross-user / TC-E2E-033-rls-prove  
**对照旁证（≠ covered）**：`full.e2e.ts` B 端 RLS；`pnpm neg:auth` / `neg:bend` / `neg:interview` / `neg:commerce`  
**MODEL_API_KEY**：**不需要**（本 prove 不调 live 模型）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | `full.e2e` B RLS + `neg:auth`/`neg:bend`/`neg:interview` → 矩阵已是 **partial**；**系统化七类未齐**；**不得**写 covered |
| 本切片 | 可执行 **X1–X8** + **W1**（worker principal honesty）+ **X9–X11**（更多 authz 类 / 并发 burst / 404 不泄露）HTTP/DB；+ **G-GAP** honesty pin |
| 旁证 cite | `neg:*` / `full.e2e` RLS = **旁证 ≠ covered**；不得冒充本 UC 已系统化七类齐 |
| 假绿禁令 | 不得把 neg 绿 / full.e2e B RLS 绿 / 本绿写成「UC-E2E-033 covered」或「七类已齐」或「A3 live worker 已闭环」 |
| 本绿≠全链路 E2E covered | **必须钉死**；A3 **live** worker/checkpointer 路径仍 GAP（W1≠闭环） |
| fixture | 经 `run-e2e-isolated` → **pgvector** → **green-risk / R5** |

专家：`mw-e2e-ha` + `mw-privacy-int`（越权/隔离生死线）。禁止作者自签 covered。

---

## 1. 测什么（X1–X8 + W1/X9–X11 + GAP 可执行合同）

| ID | 场景（UC 映射） | 期望 | 执行体 |
|----|-----------------|------|--------|
| **X1** | A1 C-cross 面试 | userB begin/turn/assessment/report/events/transcript/abandon → **404**（不泄露） | `apps/api/test/uc-e2e-033-cross-user-authz.proof.ts` |
| **X2** | C-cross 简历 | userB list 不见 A 简历；profile/reparse → **404** | 同上 |
| **X3** | C-cross 交易 | userB GET ORD_A → **404** `not_found` | 同上 |
| **X4** | C-cross 押题/诊断 | userB GET/begin QZ_/DG_ → **404** | 同上 |
| **X5** | A4 B-C + role-gate | recU 读 C 面试/简历 → **404**；candidate → `/recruiter/*` **403** `recruiter_required` | 同上 |
| **X6** | 角色门禁 admin | candidate/recruiter → `/admin/*` **403** `admin_required` | 同上 |
| **X7** | A2 无/错 principal | DB `app_role` 无 set_config / 错 uid → **0 行**；对照 owner=1 | 同上 |
| **X8** | 导出隔离 | `GET /privacy/export` userB 不含 A 的 interview/resume | 同上 |
| **W1** | A3 worker principal honesty（无 Key） | `interview_job` 无/错 principal → **0 行**；四 consumer + checkpoint-principal **source pin** `asPrincipal` / `withCheckpointAccess`；**≠ live worker e2e** | 同上（wave #6） |
| **X9** | 更多 authz 类 | event/report/entitlement/notification/career_path DB 0 行；HTTP notifications list 过滤 + career-path 404 | 同上（wave #6） |
| **X10** | 并发越权 burst | ≥16 并行 cross-user GET → 全 **404**；**≠** 七类高并发竞态齐 | 同上（wave #6） |
| **X11** | 404 体不泄露 | 越权 404 JSON 不含 owner/内容摘要；**≠** cache/trace 全路径 | 同上（wave #6） |
| **G-GAP** | 七类未齐 / A3 live worker | 打印 `GAP-UC033-*`（WORKER-LIVE / CACHE-TRACE / SEVEN-CLASS / FULL-E2E / NEG-CITE）；EXIT=0 仅=诚实钉 ≠ covered | 同上 |

**明确不测 / BLOCKED（本 harness · 抬 covered 见 §1b）**

| 非目标 | 原因 |
|--------|------|
| A3 **live** 后台 job / worker / checkpointer 消费路径 | 需 live worker 注入；`GAP-UC033-WORKER-LIVE`（W1≠闭环） |
| 缓存键 / trace / 批 job 全路径注入 | `GAP-UC033-CACHE-TRACE`（X11≠闭环） |
| 高并发越权竞态（七类·高并发全格） | X10 burst≠竞态合同；`GAP-UC033-SEVEN-CLASS` |
| `full.e2e` / `e2e:isolated` 独立 UC033 场景 | full.e2e B RLS=旁证；`GAP-UC033-FULL-E2E` |
| 云 / HA | Not HA · releaseEvidence=false |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> partial ≠ done。下列是北星「全链路零遗漏」要关的路径，**不是**本 prove 已绿项。**禁止**因 X1–X11 / W1 绿而升 covered。

| # | 抬到 **covered** 仍缺 | 对应验收 / 缺口 |
|---|------------------------|-----------------|
| 1 | A3 **live** worker/checkpointer 消费路径带 principal 可执行断言（drain job → asPrincipal 读写属主资源；无 Key 假绿禁） | A3 · `GAP-UC033-WORKER-LIVE` |
| 2 | 缓存键 / trace / 批 job **全路径** principal 注入合同（非仅 404 体不泄露） | `GAP-UC033-CACHE-TRACE` |
| 3 | 系统化七类齐备（含高并发越权**竞态** / 复杂跨聚合 / 逃逸通道专用格）— X10 burst ≠ 七类齐 | `GAP-UC033-SEVEN-CLASS` |
| 4 | `full.e2e.ts` / `e2e:isolated` **独立** UC033 场景（非仅 B RLS 旁证） | `GAP-UC033-FULL-E2E` |
| 5 | sole-stack 夹具替换默认 pgvector isolated，去掉 **R5 green-risk** | 矩阵 §0 / R5 |
| — | ~~W1 worker-principal honesty：job-table RLS 0 行 + consumer/checkpoint source asPrincipal pin~~ **CLOSED（本波 partial 阶 · W1）** | was A3 可证子集 · **已挂**（仍 ≠ live worker / ≠ covered） |
| — | ~~X9 更多 authz 类（event/report/entitlement/notification/career）~~ **CLOSED（本波）** | 仍 ≠ 七类齐 |
| — | ~~X10 concurrent cross-user GET burst all-404~~ **CLOSED（本波 partial 阶）** | ≠ 高并发竞态 / ≠ 七类齐 |
| — | ~~X11 404 body 不泄露 owner/内容~~ **CLOSED（本波 partial 阶）** | ≠ cache/trace 全路径 |

**本切片已关 §1b 上表 W1/X9/X10/X11 阶**；仍明确不做：#1 live worker；#2 cache-trace 全路径；#3 七类齐；#4 full.e2e 独立场景；#5 sole-stack；把 X*/W1 / neg:*/full.e2e 绿写成 covered；把矩阵升 covered。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc033:cross-user-authz:prove` | **0** | X1–X8 + W1 + X9–X11 + G-GAP；**本绿 ≠ UC-E2E-033 covered**；fixture=pgvector → **green-risk / R5**；七类未齐 |
| `pnpm uc033:cross-user-authz:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc033-cross-user-authz` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-033`；≠业务 covered |
| `pnpm neg:interview` / `neg:bend` / `neg:auth` / `neg:commerce` | **0** | **旁证**；≠本 UC covered |
| `pnpm e2e:isolated`（含 full.e2e B RLS） | **blocked**（无 Key）或旁证绿 | 旁证 ≠ covered |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；需 Docker disposable PG（run-e2e-isolated）
pnpm uc033:cross-user-authz:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-033-cross-user-authz.proof.ts`  
入口：`package.json` → `uc033:cross-user-authz:prove` → `scripts/run-e2e-isolated.mjs uc033:cross-user-authz:prove:raw`

**旁证（≠本 UC 系统化七类验收）**：`pnpm neg:auth`；`pnpm neg:bend`；`pnpm neg:interview`；`pnpm neg:commerce`；`e2e/full.e2e.ts` B 端 RLS。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「neg:interview / neg:bend 绿了所以 033 covered」 | **假绿**。旁证子集 ≠ 系统化七类齐 / ≠本 UC covered |
| 「full.e2e B RLS 绿 = 033 covered」 | **假绿**。B 端岗位隔离旁证 ≠ C-cross+B-C+A2+A3 全矩阵 |
| 「uc033:cross-user-authz:prove 绿 = covered」 | **假绿**。最多 **partial**；七类未齐；A3 live worker GAP |
| 「W1 绿 = A3 worker principal 闭环 / covered」 | **假绿**。W1=DB job RLS + source pin；≠ live worker drain；见 `GAP-UC033-WORKER-LIVE` |
| 「X10 burst 绿 = 七类高并发已齐」 | **假绿**。并行 GET 404 ≠ 竞态合同 |
| 「X11 绿 = cache/trace 全路径已钉」 | **假绿**。404 体不泄露 ≠ 缓存键/trace 注入 |
| 「G-GAP EXIT=0 = 七类已齐 / A3 已闭环」 | **假绿**。G-GAP 是诚实钉 |
| 「tenant-enforcement:prove 绿 = UC-033 covered」 | **假绿**。应用层 tenant ≠ RLS / ≠本 UC |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-033 | **partial**（X1–X8 + W1/X9–X11）；**≠ covered**；系统化七类未齐 | `harness/uc-e2e-033-cross-user-authz.md` |
| 评测说明 | `eval/uc-e2e-033-cross-user-authz.eval.md` | 引用矩阵行 ID |
| P1-7 | cross-user prove 已挂（含 W1 honesty）；live worker A3 / 七类高并发竞态 / cache-trace 全路径 / full.e2e 独立场景仍缺（§1b） | 见矩阵 §3 |

## 5. 审查勾选（mw-e2e-ha + mw-privacy-int · dual-review ready）

- [ ] 未把 prove 绿写成 **UC-E2E-033 covered**
- [ ] 未把 `neg:*` / `full.e2e` B RLS 冒充本 UC covered（旁证 ≠ covered）
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵最多 **partial**（非假 covered；系统化七类未齐）；§1b 抬 covered 清单非空
- [ ] W1 读作 job RLS + source pin 诚实子集，**≠** live worker / checkpointer e2e 闭环
- [ ] X10/X11 读作 burst / 不泄露子集，**≠** 七类齐 / cache-trace 全路径
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA` / R5
- [ ] G-GAP EXIT=0 读作诚实钉，非七类齐 / A3 live 闭环
- [ ] `mw-privacy-int`：越权 404 / 无 principal 0 行 / B-C / export 隔离钉仍在；不把本绿写成隐私擦除闭环
