# Harness / 评测集 — R1 Worker「技术岗」fail-closed（GAP-RAG-01）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁 / ≠ cutover** · **pass ≠ R1 已关**  
**对照**：`ai-docs/delivery/m4-rag-hard-gates.md` §R1 · `ai-docs/delivery/gap-bug-backlog.md` GAP-RAG-01

---

## 0. 本切片验收立场（先读）

| 声明 | 裁定 |
|------|------|
| **R1 是否已关？** | **否。** 本 harness 只验收「静默硬编码收口 + flag-on fail-closed 合同」；**不得**把 prove EXIT=0 写成 R1 closed / 通用出题就绪 |
| **R2 生产接线？** | **未做、不宣称**（application binding / immutable snapshot 写路径仍缺口） |
| **R4 题域隔离？** | **NOT closed**；本评测集 **零** track-local / wrong_track 断言 |
| **默认生产行为** | `MEETWISE_TECH_ROLE_FAIL_CLOSED` **默认 off** → legacy「技术岗」回退仍在（防鲁莽切 qbank/出题） |
| **代码改动** | 允许保留 `adaptive-role-resolve.ts` 等实现；**实现存在 ≠ 门关闭** |

专家（`mw-rag-route`）先审 **本评测集是否够格当验收合同**；通过后再谈实现合入叙事。

---

## 1. 测什么（评测条目）

### 1.1 必测（本 prove 必须覆盖）

| ID | 测什么 | 期望 | 假绿风险（标红） |
|----|--------|------|------------------|
| **E1** | flag 默认 / `0` → fail-closed **关** | `isTechRoleFailClosedEnabled` = false | 勿把「默认关」写成「生产已 fail-closed」 |
| **E2** | flag `1`/`true`/`on` → fail-closed **开** | = true | 勿把 unit env 写成组合根已开旗 |
| **E3** | flag-off + 无 route/deps → legacy | 返回字面量 `技术岗` | **标红**：legacy 绿 ≠ 去硬编码完成 ≠ R1 关 |
| **E4** | flag-on + 无 route snapshot / job route metadata | throw `adaptive_role_route_missing` | 勿把「函数能 throw」写成「生产 job 已 quarantine 闭环」 |
| **E5** | flag-on + 仅 `roleFromDeps='技术岗'` | **仍** throw（禁止经 deps 静默猜桶） | 若将来允许 deps 旁路，本条必须改合同并重审 |
| **E6** | flag-on + `roleFromRouteSnapshot` / `roleFromJobRouteMetadata` 非空 | 返回该 role | **标红**：读到 leaf ≠ R2 写路径已接线；≠ R4 隔离 |
| **E7** | 静态：`main.ts` 无 `role: '技术岗'` 注入 | 正则不匹配 | 注释里出现「技术岗」字样不算失败 |
| **E8** | 静态：`interview-consumer.ts` 无 `?? '技术岗'` | 正则不匹配；调用 `resolveAdaptiveInterviewRole` | consumer 探测 snapshot **仅** flag-on；≠ R2 |
| **E9** | 静态：harness / prove 钉 `releaseEvidence=false`、不宣称 R2/R4 | 文档断言 | 文档绿 ≠ 门关 |

### 1.2 明确不测（防范围膨胀）

| 非目标 | 原因 |
|--------|------|
| `classifyJobRoute` / `snapshotInterviewRoute` 生产写路径 | **R2** |
| application 启动事务绑 `JobRouteDecision` | **R2** |
| 生产读面 `wrong_track=0` / track-local serving | **R4** |
| qbank / hybrid / pgvector / Qdrant 切流 | R3/R5；本切片不切 |
| 真实 PG 上 start job → fail → SSE quarantine E2E | 可选后续；**本 prove 无 DB**；缺则不得宣称 job 失败路径已证 |
| 开启 flag 的云/Compose 组合根 | `releaseEvidence=false`；未跑 |

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm r1-tech-role-fail-closed:prove` | **0** | E1–E9 合同绿：**评测集自身可跑通**；**≠ R1 已关**；**≠** 生产已开 fail-closed |
| `pnpm mysql-stack:m4-rag:prove` | **0** | M4 硬门文档骨架仍绿；确认 R1 指针与「不切 qbank/向量」仍在；**≠** RAG 已迁 |

可选（非本切片关闭条件）：人工开 `MEETWISE_TECH_ROLE_FAIL_CLOSED=1` 的隔离 worker 冒烟——**未纳入**本 harness EXIT 门；缺证据时禁止写入 reviews 为 pass-close。

---

## 3. 假绿标红清单（审查必勾）

| 若有人说… | 正确读法 |
|-----------|----------|
| 「prove 绿了所以 R1 关了」 | **假绿**。R1 关闭条件含：生产不再依赖 legacy 默认 **且** R2 接线后 flag-on 运行有组合根证据（见 m4 §R2） |
| 「main 没写技术岗了所以通用出题就绪」 | **假绿**。默认 flag-off 仍回退「技术岗」 |
| 「consumer 调了 getInterviewRouteSnapshot 所以 R2 已接线」 | **假绿**。仅 flag-on 只读探测；**无** application binding / snapshot 写入生产路径 |
| 「返回 backend/nodejs 所以题域隔离好了」 | **假绿 / R4**。本集零 isolation 断言 |
| 「m4-rag:prove 绿 = RAG 切流」 | **假绿**（BUG-FAKE-CONN）；骨架文档绿 only |

---

## 4. 代码与文档锚点（实现可保留，不扩）

| 路径 | 角色 |
|------|------|
| `apps/worker/src/adaptive-role-resolve.ts` | 解析 + flag + legacy / fail-closed |
| `apps/worker/src/interview-consumer.ts` | start 调用 resolver；flag-on 时只读 snapshot |
| `apps/worker/src/main.ts` | 不再注入 `role: '技术岗'` |
| `apps/worker/test/r1-tech-role-fail-closed.proof.ts` | 本评测集执行体 |
| `docker/env/worker.env.example` | `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 文档化 |
| `ai-docs/delivery/eval/r1-tech-role-fail-closed.eval.md` | 评测证明 / 给专家审的条目说明 |

---

## 5. 前置

- 仓库 checkout；`pnpm` 可用
- **不要求** MySQL / Qdrant / 真实 route snapshot 行

## 6. 审查

- 专家：`mw-rag-route` — **先审评测集**（本文件 + `eval/r1-tech-role-fail-closed.eval.md`）
- 结论须另文：`ai-docs/delivery/reviews/YYYY-MM-DD-r1-tech-role-fail-closed-mw-rag-route.md`
- 禁止只留聊天；禁止作者自签「R1 已关」
