# Harness — UC-E2E-017 孤儿预占对账 HTTP/SSE 注入面（isolated 收据刀 · 一行一 case 五面）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-017 covered** · **EXIT0 = case ≠ covered**  
**对照矩阵行**：`UC-E2E-017`（`e2e-requirement-coverage-matrix.md:122` 六列行**零触**·翻面权归协调方）  
**REQUEST 卷**：`ai-docs/delivery/harness/uc017-REQUEST.md`（§1-修法件①-⑤·§9-rev/rev2 全约束）  
**集成半姊妹卷**：`harness/uc-e2e-017-orphan-reservation.md`（**零字节改**·其 `:39` 非目标自证句保留=诚实链：本卷即其「尚未进 e2e:isolated」缺口的 HTTP/SSE 半收口）  
**MODEL_API_KEY**：**不需要**（boot() `:61-62` delete `MODEL_API_KEY`/`MODEL_BASE_URL` 承载·零模型外呼·est live=0）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 本卷性质 | isolated **非账收据刀**（case-only·一行一 case）·零产品码触面（`apps/api/src`/`packages/db/src`/`apps/worker/src` 全零字节）·零迁移·零新依赖 |
| 旗面 | 五 case 全 **case-only**；`EXIT0 = case ≠ covered`；矩阵 `:122` 行/`:148` 批B行/`:180`/`:265` 全只读；coveredCount=8 零翻 |
| fixture | run-e2e-isolated 一次性 pgvector 隔离库（green-risk / R5 注记·≠ sole-stack ≠ RAG migrated） |
| 租约注入形态 | fixture 租约过期注入 = commit 后故障点/进程崩溃的**诚实模拟形态预登**（REQUEST §1.3-(C)）；进程级 SIGKILL 注入未承诺（归另刀） |
| ADV | 零触（`:122` 行 ADV=blind 保持·归对抗族刀） |
| 假绿禁令 | 不得把本绿写成「e2e:isolated 全链路已含 017」或「UC-E2E-017 covered」 |

---

## 1. 测什么（五 case 一行一 case 可执行合同）

执行体：`apps/api/test/uc-e2e-017-orphan-http-sse.proof.ts`（`_neg-harness.boot()` 真 NestJS HTTP 栈+真嘴）

| Case ID | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 |
|---------|----|----|------------|--------------|--------|
| **NHP-017-HTTP-FAULT-01** | FAULT | api | HTTP begin 202→reserved 可观测→fixture 租约过期注入（sweeper 同款）→生产调度嘴 `reconcileOwner`（`commerce-reconcile.ts:34` 导出形·进程内直调）回收 | `staleReleased≥1`·`abandoned≥1`·consumption=released·interview=abandoned·`interview_unavailable` 终态事件≥1·额度全回补·HTTP GET 终态可读（200 abandoned） | **case-only** |
| **NHP-017-HTTP-COMP-01** | FAULT | api | HTTP 补偿嘴：begin 202+reserved→`POST :id/abandon`→200（`interview.service.ts:654/:658` abandonInterviewAndRelease 区） | `abandoned=true`·`released=released`·interview=abandoned·consumption=released·额度净零 | **case-only** |
| **NHP-017-SSE-FAULT-01** | FAULT | api | begin 202 后 SSE 建连（真 `GET :id/events` hijack 泵）→客户端中断注入（abort）→拆除本身 | 拆除零假释放零新 orphan（reserved 不变·恰 1 行·额度仍 -1·零假终态·interview 仍 created）；附 404 跨主体 events+429 槽满子臂（`interview.controller.ts:262`） | **case-only** |
| **NHP-017-HTTP-BOUND-01** | BOUND | api | 同 interview 重复 HTTP begin（网络重试形·replay 臂沿 `resume-reference-http.proof.ts:82-93` 先例） | 202 `alreadyBegun` 同 jobId·start job 计数不变·恰 1 行 consumption·额度净零增量（不双扣·`interview.service.ts:217`/`:231`） | **case-only** |
| **NHP-017-HTTP-NEG-01** | NEG | api | 错主体 abandon/events（HTTP 真嘴 RLS 零行 404·`:652`） | 404 `not_found_or_forbidden`·原预占仍 reserved·额度未被触碰·interview 未被误改 | **case-only** |

**明确不测 / BLOCKED（本 harness）**

| 非目标 | 原因 |
|--------|------|
| 进程级 SIGKILL / 跨进程 worker 编排 / 真 commit 后故障点 | REQUEST §1.3-(C) 否决·超本刀面（需真崩溃→另报另刀） |
| full.e2e / live 面 | 真业务 E2E 绑 live `MODEL_API_KEY`；`e2e/full.e2e.ts` 纳入归协调方另裁 |
| ADV 对抗面 | `:122` ADV=blind 保持 |
| 矩阵 `:122` 六列行翻面 | 翻面权归协调方 post 双审链（本卷只产收据与 case 登记） |

**承载注记（两件）**

1. **429 子臂承载（REQUEST §9-rev 1-(b) rev2 收紧形）**：默认 boot 栈下 migration 0189 未装载 → `gateway_slot_lease_acquire` 缺失 → `RateLimitService.acquireSlot` 共享臂 fail-open `return true`（`rate-limit.service.ts:158-175` 亲证）→ 429 槽满在 booted 栈**永不发生**。子臂沿 `sse-principal-slot.proof.ts:91,112-131` 形**自建最小模块同进程承载**（compile 期 `useValue` 覆盖·`new RateLimitService()` 无 DbService=本地 Map 模式）；boot() 栈承载其余子臂——boot() 无 override 缝三锚亲证（`_neg-harness.ts:63`/`:29-37`/`:324-329`）。
2. **0058 stub 注记（rev2 P2-1）**：boot() 已内置 `interview_privacy_active` 最小镜像（`_neg-harness.ts:111-126`）+`assert_interview_privacy_active`（`:212-225`·0058 真函数体逐字），覆盖五 case 全隐私触点（FAULT-01 begin+reconcileOwner 围栏 SELECT（`commerce-reconcile.ts:50`）/COMP-01 begin+abandon/SSE-FAULT-01 begin+events/BOUND-01 begin×2/NEG-01 RLS 零行）——proof 级 018 形 stub 系沿承防御面**可免装**（本刀不装）；形状差备查：harness 镜像=SECURITY DEFINER·018 形 stub=invoker-rights。

**begin 链夹具前置（additive-only）**：boot() sql/ 挑选单不含 begin 链所需 0064 v64 面/0049 绑定语义/0142 route 供给表——proof 内沿 `trial-grant.proof.ts applyBeginChainPreamble`/`neg-interview:27-180` 播种形制 additive 补齐（幂等可重放·真相=迁移链·≠ 迁移 covered）；0058 块**不重放**（boot() 镜像已内置）。route decision/snapshot 预供给 → begin 走 `supplyCandidateProfileRoute` 幂等回读臂免解密直通 202（`candidate-route.ts:46-52`）。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc017:orphan-http-sse:prove` | **0** | 五 case 全 PASS（一行一 case·实数 N/0 如实记收据）；**EXIT0 = case ≠ covered**；fixture=pgvector → green-risk / R5 |
| `pnpm uc017:orphan-http-sse:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc017-orphan-http-sse` |
| `pnpm uc017:orphan:prove`（集成半邻面·零字节零弱化） | **0** | O1–O4 PASS 数恒等·旁证不回退 |

```bash
# 零 live key；需 Docker disposable PG（run-e2e-isolated 一次性容器·EXEC 期依赖预登=REQUEST §2 门 9）
pnpm uc017:orphan-http-sse:prove ; echo EXIT=$?
```

入口链：根 `package.json` `uc017:orphan-http-sse:prove` → `scripts/run-e2e-isolated.mjs uc017:orphan-http-sse:prove:raw`（目标白名单+`isolatedCommand`+`isolatedReceiptSources` 三触点已注册·沿 `uc018:abandon:http:prove:raw` 同构）→ `apps/api/package.json` `prove:uc017-orphan-http-sse`。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「orphan-http-sse:prove 绿 = UC-E2E-017 covered」 | **假绿**。EXIT0 = case ≠ covered；矩阵 `:122` 行翻面权归协调方 |
| 「boot() 栈绿 = e2e:isolated 全链路含 017」 | **假绿**。本刀=isolated 非账收据·full.e2e 纳入另裁 |
| 「429 子臂绿 = 网关槽面 covered」 | **假绿**。Map 模式承载（useValue）≠ 0189 共享臂；网关面归 api-harden 轨 |
| 「租约 fixture 注入绿 = 进程崩溃孤儿已闭环」 | **假绿**。fixture=诚实模拟形态预登；真 commit 后故障点/崩溃归另刀 |
| 「集成半 O1–O4 绿可由本刀替代」 | **假绿**。两半并存：集成半零字节保留（其非目标自证=立项证据链） |

---

## 4. 矩阵锚点

| ID | 状态 | 本 harness |
|----|------|------------|
| UC-E2E-017（`:122` 行） | **零触**（FAULT/NEG/BOUND partial 如实保持·翻面权归协调方） | `harness/uc-e2e-017-orphan-http-sse.md`（本卷） |
| case-matrix 017 区 | 净增 5 行（旗=case-only·零改旧行零升格） | `non-happy-path-perf-load-case-matrix.md` |
| 收据 | 仓根 `receipts/uc017-orphan-http-sse/00-exec.md`（非受管根·零 docs:check 增量） | 七字段 |

## 5. 审查

- post 双审链：确认五 case 全 case-only 未升格；确认矩阵 `:122` 零字节；确认本绿≠全链路 E2E covered 未被洗成 covered。
- 已知承载点（REQUEST §8 rev P1-1 补注）：429 子臂若漏承载必空转红——本刀已按 rev2 收紧形承载（最小模块同进程）。
