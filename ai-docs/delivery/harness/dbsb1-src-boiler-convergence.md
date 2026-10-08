# Harness — **DBSB-1** · src 样板收敛刀（runAs / job-claim 泛型 / withSavepoint + r4 退役协同 · REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 turn docs-only · REQUEST 编写完成即停 · **未授权 EXEC** · zero coding / zero migration / zero prove）
**Date**: 2026-10-07
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · 本 REQUEST 只送审 · **Ban self-approve** · **Dual PASS ≠ 自动开工** · 须 meetwise 明示授权才进 EXEC）
**Slice**: `../dbsb1-src-boiler-convergence.slice.md`
**Authority**: GAP-DEBT 台账两债行合并一 REQUEST（`gap-bug-backlog.md` L876 `GAP-DEBT-DB-SRCBOILER` P0 + L879 `GAP-DEBT-BE-R4SCRIPTS` P0 的退役评估子面）· W2 三刀批次（B3 批次依赖协同 · 见 §5）· 本刀 = **src 层样板收敛** + **r4 退役评估（非物理迁出）**
**Parent tip**: `48dee7a2`（branch `line/db-src-boiler` · base `origin/feat/mysql-schema-skeleton` @ `48dee7a2` · fetch ff 已核）
**Honesty**: 本 REQUEST 全部清单为 mw-core 在 `48dee7a2` 上亲核（grep/逐文件逐行计数）· 非 AI 凭记忆 · 台账口径与 mw-core 亲核差异已在 §1.5 标注

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **本刀是什么** | 三个 TS-src 样板收敛 + 一份 r4 退役协同声明：① `runAs(pool, role, fn)` 泛型收敛 SET LOCAL ROLE 事务样板（**薄别名保留导出面 → 调用点零改动**）② job 队列 claim/done/failed/renew/sweep 五件套 TS 侧泛型工厂（**案B 不动表**）③ `withSavepoint` util 抽取 ④ r4-* 退役评估触发条件 + prove 别名保全（物理迁出**让位 DIR-1 B3**）· Prove `dbsb1-src-boiler.proof.ts` EXIT=0 + §6 族 prove 全复跑 |
| **本刀不是什么** | **不是** 多态 job 表/kind 列大迁移（案A 仅并陈 · 决策点 D4）· **不是** RLS/角色供给语义/GRANT 面变更 · **不是** 历史迁移（0001–0143 零触碰）· **不是** 擦除链行为变更 · **不是** r4 文件物理搬迁（B3 所有）· **不是** 本 turn 编码（REQUEST 写完即停） |
| **增益边界（诚实）** | 纯债务清偿：样板行数下降 + 新增角色/队列时**不再复制第 15 份/第 5 套**；**运行时行为零变化**（SQL 文本等价或语义等价 · prove 断言）· **无性能/可用性 claim** · worker 生产包瘦身归 B3（本刀只锁别名契约） |
| **现在** | `draft:awaiting_pre_exec_dual` · docs-only · 等双审 + meetwise 授权 |

---

## 1. 审计现状（亲核 @ `48dee7a2`）

### 1.1 runAs 样板（SET LOCAL ROLE 事务 wrapper 全清单）

`packages/db/src/principal.ts` 内 10 处 `SET LOCAL ROLE`（9 处 runAs 同构形态 + 1 处内嵌特判）：

| # | 函数 | 行 | role | GUC | 形态 | 生产调用点（src-only 亲核） |
|---|------|----|------|-----|------|---------------------------|
| 1 | `asPrincipal` | :945 | `app_role` | `app.principal_user` | 纯 runAs | **215** |
| 2 | `asPrivacyWorkerPrincipal` | :962 | `privacy_worker_executor` | 同上 | 纯 runAs | 3 |
| 3 | `asPrivacyWorkerExecutor` | :975 | `privacy_worker_executor` | — | 纯 runAs | 2 |
| 4 | `asQbankControlExecutor` | :1194 | `qbank_control_executor` | — | 纯 runAs | 31 |
| 5 | `asRagControlExecutor` | :1209 | `rag_control_executor` | — | 纯 runAs | **0**（仅 test 调用面） |
| 6 | `asOnlineJudgeScheduler` | :2040 | `online_judge_scheduler` | — | 纯 runAs | 1 |
| 7 | `asOnlineJudgeExecutor` | :2052 | `online_judge_executor` | — | 纯 runAs | 1 |
| 8 | `asGateway` | :2068 | `app_gateway_role` | — | 纯 runAs | 10 |
| 9 | `assertRagControlDefinerOwnership` | :1292（BEGIN :1300） | `rag_control_executor` | — | BEGIN+SET ROLE+catalog 断言+COMMIT（同构可委托） | 内部/迁移 CLI |
| 10 | `provisionQbankControlDefiner` | :287（BEGIN :295 · SET ROLE :464） | `qbank_control_definer` | — | **特判**：advisory lock + finally `RESET ROLE`+`REVOKE`（非 runAs 形态） | 迁移期 |

principal.ts 外的**漂移复制**（本债的直接证据）：

| # | 函数 | 位置 | 备注 |
|---|------|------|------|
| 11 | `asScoringWorkerPrincipal` | `packages/db/src/scoring-fact-root.ts:25`（SET ROLE :29） | 头注自述「与 principal.ts 的 asPrivacyWorkerPrincipal 同构；只在本模块导出，**不改 principal.ts**」= 样板复制的第 11 份 · 生产调用点 **0**（仅 scor-01/02/03/growth 四 proof） |

test 侧同形复制（登记 · 不在刀面）：`packages/db/test/mem02-summary.proof.ts:65` 与 `mem03-summary-tree.proof.ts:67`（memory_summarizer 专用 wrapper 各一份）。

**收敛目标形态**（EXEC 预告）：

```ts
export async function runAs<T>(pool: DbPool, role: string, fn: (c: Client) => Promise<T>,
  opts?: { principalUser?: string }): Promise<T>;
// 9 个具名 wrapper 保留导出名与签名，函数体收敛为 return runAs(pool, '<role>', fn, { principalUser });
```

- **调用点零改动**：215+31+10+3+2+1+1 处 import/调用一概不动（薄别名委托）；`asScoringWorkerPrincipal` 同步改为 `import { runAs } from './principal.ts'` 委托（principal.ts 头注「无业务 import」契约不破 · scoring-fact-root 反向依赖 principal 合法）。
- **行为等价证明**（§6-P1）：① 逐 wrapper **函数体 diff 对照**（收敛前后：BEGIN→SET LOCAL ROLE→GUC(如 variant)→fn→COMMIT / catch→ROLLBACK / finally release 语句序逐一相同 · EXEC commit 内 diff 留痕）② 隔离 PG 上对每个 role 断言 `current_user` 断言面 + GUC 只在 principal variant 出现 + fn 抛错→ROLLBACK→连接回收复用无泄漏。

### 1.2 job 队列四套 + TS 五件套复刻

| # | 表 | 迁移 | TS 模块 | 五件套 | 独有差异（亲核） |
|---|----|------|---------|--------|------------------|
| 1 | `interview_job` | 0001:253 | `interview-jobs.ts`（10 函数） | claim/done/failed/renew/sweep + requeue | advisory xact lock · `interview_privacy_active` 谓词 · 僵尸兄弟守卫（同 interview 任一 failed 不再领）· per-owner inflight 上限 · `ORDER BY seq, created_at` · done/failed 时 `payload-'answer'` 擦除 |
| 2 | `quiz_job` | 0007:17 | `quiz-jobs.ts`（7 函数） | 五件套 | `ORDER BY created_at` · 同 quiz running 排他 |
| 3 | `diagnosis_job` | 0008:18 | `diagnosis-jobs.ts`（7 函数） | 五件套 | `ORDER BY created_at` · 同 diagnosis running 排他 |
| 4 | `context_compression_dispatch` | 0117:39 | `context-compression-dispatch.ts`（8 函数） | **非五件套**（register/claim/dispatched/commit/unknown/discard/recover/replay 状态机） | 单行单赢家 CAS · unknown sticky · **登记不动**（形态不同 · 不属本刀复刻债） |

五件套共性（1/2/3 套逐行对照同构）：`UPDATE ... SET status='running', lease_owner, lease_expires_at=now()+interval, attempts+1, version+1 WHERE id=(SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1)` · done/failed 同守卫（`status='running' AND lease_owner=$me`）+ `lease_owner=NULL` + `version+1` · renew 仅推 `lease_expires_at` · sweep 两条原子 UPDATE（`attempts>=max`→failed / `<max`→queued）。差异全部可参数化：表名、镜像排他列（interview_id/quiz_id/diagnosis_id）、排序列、额外谓词 SQL 片段、lease 秒、max attempts 默认、done/failed payload 擦除开关。

### 1.3 SAVEPOINT 幂等模板 3 处（4 实例点）

| # | 文件:行 | savepoint 名 | 语义 |
|---|---------|--------------|------|
| 1 | `packages/db/src/resume.ts:107-121`（persistResumeProfile） | `resume_profile_insert` | 23505→回滚保存点吞掉（幂等重试竞态）· 非 23505→回滚后 rethrow |
| 2 | `packages/db/src/payment.ts:62-79`（markOrderPaidAndCredit） | `payment_provider_txn_claim` | 23505→回滚+释放→返 `conflict` · 非 23505→rethrow |
| 3 | `packages/db/src/payment.ts:106-158`（markOrderRefunded） | `payment_refund_txn_claim` | 23505 同上 + **业务条件回滚**（红冲不足→主动 ROLLBACK TO+RELEASE→返 `conflict`） |
| 4 | `packages/db/src/int-transcript.ts:133-151` | `answer_submission_insert` | 头注自述「persistResumeProfile **同源**」= 复制的直接证据 · 语义同 #1 |

共性核：命名 SAVEPOINT → try{工作} → catch 23505 判定 → ROLLBACK TO + RELEASE → rethrow-or-确定码。#3 多一条「业务半途回滚」路径 → util 需支持调用方主动触发回滚（sentinel throw 或返回信号 · EXEC 定稿）。

### 1.4 r4-* 自证脚本现状（GAP-DEBT-BE-R4SCRIPTS 面）

- `apps/worker/src/r4-*.ts`：**31 文件 / 7163 行**（亲核 `wc -l` 精确吻合刀述）；worker src 合计 84 文件 15641 行 → **占 45.8%**。
- `apps/worker/test/r4-*.proof.ts`：35 文件 / 8079 行（test 侧对应 proof · 不在 7163 计数内 · 登记）。
- **性质亲核**：全部是「grep 自己源码 → 出 evidence JSON」的 prove 发射器（如 `r4-funnel-product-close.ts` 头注自述 dedicated prove emitter）；worker 运行时（main.ts 及全部非 r4 src）**零 import**（grep 亲证）→ 生产包纯死重。
- prove 别名面：`apps/worker/package.json` 35 条 `prove:r4-*` 别名（:84-:119）+ 根 package.json 聚合（`r4-real-wire-impl:prove` 等）+ `scripts/run-e2e-isolated.mjs` target 注册 → **任何搬迁若断别名 = 历史收据/sourceDigests/CI target 全断** → 本刀的 r4 面只做「别名保全契约 + 退役评估」，物理迁出让位 B3（§5）。

### 1.5 口径差（诚实标注）

- 台账 L876 记「14 份 SET LOCAL ROLE 样板」；mw-core 亲核 src 侧 = **11 份**（principal.ts 10 + scoring-fact-root 1）。差 3 疑为台账把 mem02/mem03 两份 test 复制 + 内嵌特判重复计数；**收敛对象事实一致**，按 11 份执行、台账行 EXEC 时勘误。
- 台账 L879 记「30 文件 7163 行(58% worker src)」；亲核 = **31 文件 / 7163 行 / 45.8%**（行数精确吻合 · 文件数差 1 · 百分比口径差）。EXEC 时台账行勘误。

---

## 2. runAs 收敛方案（§1.1 → 1 个泛型）

1. `packages/db/src/principal.ts` 新增 `runAs<T>(pool, role, fn, opts?)`（role 经 `RUNTIME_ROLE_NAME` 既有白名单校验 fail-closed · `opts.principalUser` 存在则 `set_config('app.principal_user', $1, true)`）。
2. 表 §1.1 #1–#8 具名 wrapper 函数体收敛为单行委托（**导出名/签名/JSDoc 全保留**）；#9 `assertRagControlDefinerOwnership` 外层事务壳委托 runAs（catalog 断言体原样为 fn）；#11 `asScoringWorkerPrincipal` 改 import 委托。
3. **不动**：#10 `provisionQbankControlDefiner`（finally RESET ROLE+REVOKE 的供给事务语义 ≠ runAs · Ban 面 §7-2）；mem02/mem03 test 复制（test 面 · 登记）。
4. 等价证明 = 每份调用点零改动（tsc 零错即类型面证明）+ wrapper 体 diff 对照入 EXEC 卷 + P1 行为断言 + §6 族 prove 复跑。

---

## 3. job 队列两案并陈（决策点 D4 · 交双审裁）

| | 案A：多态 job 表 + kind 列 | 案B：TS 侧泛型 claim 工厂（**倾向 · 低险先行**） |
|---|---|---|
| 形态 | 3 表合一（`job` + `kind` 列 + per-kind partial index/谓词）+ 数据迁移 + 双写/切换期 | 新 `packages/db/src/job-queue.ts` 工厂：`createJobQueueLifecycle({ table, siblingColumn, orderBy, extraClaimPredicates, leaseSeconds, maxAttempts, scrubPayloadOnTerminal })` → 返回 `{ claimNext, markDone, markFailed, renewLease, sweep }` |
| 表/迁移 | 大迁移（RLS 重挂 · FK · 幂等键 · partial unique 全重验 · 存量行搬迁） | **零表变更 · 零迁移**（§1.2 差异全参数化 · SQL 文本逐队列等价） |
| 调用面 | worker 消费者全改 | 三个 `*-jobs.ts` 模块导出名/签名保留 → 内部委托工厂（消费者零改动） |
| 风险 | 擦除链/隐私谓词/inflight 上限回归面大 · 与 W2 批次撞期 | 工厂 SQL 组装错误 → 由 P3 **文本快照等价断言**（工厂输出 vs 收敛前字面量逐字符相等）+ 队列族 prove 复跑兜住 |
| 收益 | 表数-2 · 单队列真相 | 样板复刻止增（第 5 套队列=1 个配置对象）· 案A 随时可在其上再做（不锁死） |

**mw-core 建议**：B 先行；A 登记后续刀再评（若双审裁 A，本刀 REQUEST 须重写 §3/§6 —— Ban 面 §7-3 历史迁移对 A 同样生效，A 须新迁移非改旧）。

## 4. withSavepoint 抽 util（§1.3 → 1 个 util）

1. `packages/db/src/principal.ts` 新增 `withSavepoint<T>(c, name, fn)`（落点决策点 D5；建议 principal.ts —— 它是仓库既定的「无业务依赖事务原语」家，savepoint 属同层）。
2. 语义（对齐 4 实例点最大公约）：`SAVEPOINT name` → `try { fn } catch(非23505){ ROLLBACK TO; RELEASE; throw }`；23505 → `ROLLBACK TO; RELEASE` 后按 opts 决定吞或抛；另暴露主动回滚信号（sentinel）覆盖 #3 业务半途回滚。
3. 接线点：resume.ts:107 · payment.ts:62/:106 · int-transcript.ts:136（4 实例 · 3 文件）；返回码（`conflict`/幂等吞）与错误路径**逐点原样**。
4. 等价证明：P4 断言（23505 吞/非 23505 rethrow/RELEASE 次序/主动回滚路径）+ payment 幂等重放（already/conflict）+ resume/int-transcript 幂等插入回归。

---

## 5. r4 退役评估 + DIR-1 B3 协同声明（W2 批次 · B3 依赖协同）

**分工边界（硬声明）**：

| 面 | 归属 |
|----|------|
| r4-* 物理迁出（`apps/worker/src/r4-*.ts` → test/ 或 `r4-evidence/` 文件夹化 · 生产包/构建排除 · test proof 随迁路径改写） | **DIR-1 B3**（批次内并行刀） |
| r4 **退役评估触发条件**（哪些 r4 prove 已被后续已闭证据取代可退役 · 哪些承载 standing authorize/SSOT pin 必须永续 · 触发条件成文）+ **prove 别名保全契约**（35 条 `prove:r4-*` 别名与根聚合/isolated target 注册在任何搬迁后必须继续解析到实文件 · 别名名不得改名）+ 台账 L879 行勘误 | **本刀 DBSB-1**（EXEC 亦 docs+断言 only · **零 r4 文件位移**） |

**冲突面让位规则**（B3 与本刀同批次的操作序）：

1. 冲突面枚举：`apps/worker/src/r4-*.ts`（31）· `apps/worker/test/r4-*.proof.ts`（35）· `apps/worker/package.json` prove 别名段 · 根 package.json 聚合段 · `scripts/run-e2e-isolated.mjs` target 注册。
2. **本刀在 r4 面永远不碰文件路径与 import**——退役评估产物 = 独立评估文档 + prove P6 静态别名解析断言 + 台账勘误；B3 拥抱全部 `git mv`。
3. **任意先后序皆安全**：本刀先落（零 r4 位移 → B3 无阻）；B3 先落（本刀 P6 按新路径断言「别名→实文件」解析，不按旧路径硬编码）。
4. package.json prove 别名段若双方都要动：**本刀让位**（本刀只读断言 · 不写该段）；B3 搬迁后必须保持别名名不变（B3 的验收项 · 本刀评估文档中反向钉住）。
5. 时序冲突无法归并时以 B3 为准，本刀 r4 面（评估文档 + P6）顺延到 B3 落地后执行——**绝不双向同时写**。

---

## 6. Prove（新 `packages/db/test/dbsb1-src-boiler.proof.ts` + `dbsb1:prove` · EXIT=0 · 族复跑全账）

对隔离 PostgreSQL（`assertIsolatedTestTarget` + 增量迁移到 tip）：

| 块 | 断言 |
|----|------|
| P1 runAs 语义 | 每 role wrapper（9 具名 + scoring 委托）：fn 内 `current_user`=期望 role · GUC 仅 principal variant 可见（`app.principal_user` IS NULL for 非法 variant）· fn 抛错→事务 ROLLBACK（副作用不落）· 连接回收（pool 总量不降）· `runAs` 直接调用面 role 白名单 fail-closed（非法 role throw） |
| P2 导出面冻结 | 9 具名 wrapper + 3 个 `*-jobs.ts` 模块 + persistResumeProfile/markOrderPaidAndCredit/markOrderRefunded 的导出名与签名逐一对表（编译期契约 + prove 期 typeof 对拍）→ 调用面零漂移 |
| P3 job 工厂等价 | 工厂产出的 3 队列 × 5 操作 SQL 文本 vs 收敛前字面量快照**逐字符相等**（快照入 prove）；行为面：enqueue→claim（FIFO/租约重领/attempts 上限）→done/failed（守卫 lease_owner）→renew→sweep（requeue/failed 两分支）全绿 · 镜像排他 + interview 独有守卫（僵尸/inflight/payload 擦除）逐条断言 |
| P4 withSavepoint | 23505 吞（resume/int-transcript 幂等重插不炸外层事务 · 外层后续语句可继续）· 非 23505 rethrow 后连接仍可用 · payment paid/refund 幂等重放（already/conflict）· 红冲不足主动回滚路径返 conflict |
| P5 静态门 | principal.ts `SET LOCAL ROLE` 字面 site 数 = 1（runAs 泛型内）· 具名 wrapper 体 = 单行委托（AST 级或行数断言）· 三 `*-jobs.ts` 无内联 claim SQL 字面量 · r4 面零位移（若 B3 未落：31 文件路径原样；若已落：别名解析断言按新路径过） |
| P6 r4 别名保全 | `apps/worker/package.json` 全部 `prove:r4-*` 别名 → 目标文件存在（test -f 语义）· 根聚合别名同 · 退役评估文档存在且触发表齐（可退役集 + 永续集逐条列名） |

**族 prove 复跑清单（全绿才算 · attempts 全账 · Ban retry-to-green）**：

- principal/角色族（packages/db）：`prove:privacy-authorization` · `tenant-enforcement:prove` · `prove:uc052-internal-erasure` / `prove:uc052-checkpoint-physical` / `prove:uc052-external-sink-async-purge` / `prove:uc052-external-sink-retention` · `prove:runtime-role` · `prove:principal-config` · `prove:qbank-control-role` · `prove:rag-control-role`
- principal 族（worker）：`prove:uc052-pool-role-leak` · `prove:checkpoint-privacy-erasure`
- job 队列族（worker）：`prove:reaper` · `prove:quiz` · `prove:diagnosis` · `prove:interview`（interview.proof.ts）· `prove:quiz-dual-claim-pg` · `prove:interview-dispatch-pg`
- SAVEPOINT 族：`prove:resume`（resume.int.ts · worker）· `prove:int-transcript-answer-fact-root` · `prove:int-transcript-remaining-sinks` · `commerce:prove`（packages/db `commerce` → `commerce-saga.proof.ts` · payment 面）

---

## 7. 硬 Ban（EXEC 期同样有效）

1. **Ban RLS 策略 / FORCE RLS / 所有权 / GRANT 面变更**（收敛只在 TS 事务壳层）。
2. **Ban 角色供给语义**：`provision*` 六函数（Runtime/QbankControl/RagControl/PrivacyWorker/OnlineJudgeScheduler/OnlineJudgeExecutor）+ `provisionQbankControlDefiner` + 四个 `assert*Identity/Ownership` 的判定逻辑**逐字节不动**（§2 唯一例外 = assertRagControlDefinerOwnership 事务壳委托 · 断言体原样）。
3. **Ban 历史迁移**：migrations 0001–0143 零触碰（案A 若后续立项须新迁移 · 本刀零 SQL 文件变更）。
4. **Ban 擦除链行为变更**：uc052 族/checkpoint/erasure 路径只做 prove 复跑证等价 · 语义/错误码/收据形态零变化。
5. **Ban r4 文件物理位移**（§5 让位 B3）· Ban 改 `prove:r4-*` 别名名。
6. **Ban secrets / 真实数据入树** · **Ban 改共享 SSOT**（north-star/hard-gates/e2e 矩阵/pins）。
7. **Ban 行为语义漂移**：所有收敛点 SQL 文本等价（或语义等价 + prove 断言）· 错误码/ROLLBACK 次序/连接回收次序原样 · done/failed 的 `payload-'answer'` 擦除语义原样。
8. **Ban 本 turn 编码**（REQUEST 写完即停回报 · EXEC 须双审 PASS + meetwise 明示授权）。

---

## 8. 决策点（请双审裁定）

| ID | 议题 | mw-core 建议 |
|----|------|--------------|
| D1 | runAs 收敛形态：泛型+薄别名（调用点零改动）vs 全量替换 263 调用点 | **薄别名**（风险面最小 · P2 冻结断言） |
| D2 | `assertRagControlDefinerOwnership` 事务壳并入委托（断言体不动） | **并入**（同构 · 断言体逐字节保留） |
| D3 | `provisionQbankControlDefiner` 内嵌 SET LOCAL ROLE 不收敛（特判 · RESET ROLE+REVOKE 供给语义） | **不收敛**（Ban §7-2） |
| D4 | job 队列：案B（TS 工厂不动表）先行 vs 案A（多态表大迁移）同刀 | **B 先行 · A 后续刀再评** |
| D5 | `withSavepoint` 落点：principal.ts vs 新文件 | **principal.ts**（事务原语既定家 · 无业务依赖契约延续） |
| D6 | r4 协同时序：本刀 docs-only r4 面 + B3 物理迁 · 冲突让位规则 §5 | **确认 §5 五条** |

---

## 9. Acceptance（EXEC 后验收）

| ID | Criterion |
|----|-----------|
| A1 | `runAs` 泛型落地 · 9 具名 wrapper 单行委托 + scoring-fact-root 委托 · 导出名/签名零变化（tsc 零新错）· wrapper 体 diff 对照入卷 |
| A2 | `job-queue.ts` 工厂 + 三队列五件套委托 · P3 SQL 文本快照逐字符等价 + 行为断言全绿 |
| A3 | `withSavepoint` util + 4 实例点接线 · P4 全绿 |
| A4 | `dbsb1-src-boiler.proof.ts` EXIT=0（P1–P6 · attempts 全账） |
| A5 | §6 族 prove 复跑清单 22 项全绿 |
| A6 | r4 退役评估文档（可退役集/永续集/触发条件）+ 台账 L876/L879 勘误 · r4 零文件位移 · 别名解析断言绿 |
| A7 | pins 全保留（§首行 · 无一翻转） |

---

## 10. 流程与产物

**流程**：REQUEST（本档）→ 预执行双审（`mw-model-op` + `mw-e2e-ha`）→ **meetwise 授权** → EXEC → post-prove 双审 → **meetwise 授权 nail**。

**EXEC 文件面（预告 · 本 turn 不动）**：

| 文件 | 动作 |
|------|------|
| `packages/db/src/principal.ts` | 修改（+runAs +withSavepoint · 9 wrapper 委托化 · assertRagControlDefinerOwnership 壳委托） |
| `packages/db/src/scoring-fact-root.ts` | 修改（asScoringWorkerPrincipal 委托 principal.runAs） |
| `packages/db/src/job-queue.ts` | 新增（createJobQueueLifecycle 工厂） |
| `packages/db/src/interview-jobs.ts` / `quiz-jobs.ts` / `diagnosis-jobs.ts` | 修改（五件套委托工厂 · 导出面不变） |
| `packages/db/src/resume.ts` / `payment.ts` / `int-transcript.ts` | 修改（4 实例点接 withSavepoint） |
| `packages/db/test/dbsb1-src-boiler.proof.ts` + `package.json`×2 | 新增 prove + `dbsb1:prove` 别名 |
| `ai-docs/delivery/r4-evidence-retirement-assessment.md` | 新增（退役评估 · §5 本刀所有） |
| `ai-docs/delivery/gap-bug-backlog.md` | 修改（L876/L879 勘误 · 行状态更新） |
| `ai-docs/delivery/harness/dbsb1-src-boiler-convergence.exec.md` | 新增（EXEC 收据） |

---

## Non-claims

Not HA · not suite green · not 性能/可用性 claim · not 多态 job 表迁移（案A 未立项）· not RLS/角色供给/历史迁移/擦除链/secrets 变更 · not r4 物理迁出（B3 所有 · 本刀零 r4 位移）· not worker 生产包瘦身完成声明（瘦身实效归 B3 验收）· not coding authorized（Dual PASS ≠ 开工）· 不覆盖任何 e2e 门（coveredCount=8 不变）· `releaseEvidence=false` · `actualSpendCny=null`。

---

*Harness · DBSB-1 src 样板收敛刀 REQUEST · 2026-10-07 · draft:awaiting_pre_exec_dual · parent `48dee7a2` · docs-only · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*
