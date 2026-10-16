# Harness — G7 绿面差距盘点（g7SuiteGreen=false 现值 → 绿面差距 · 只读探针）

**Author**：`g7-probe`（G7 探针席 · 北星 loop）· **Date**：2026-10-10 · **Base**：`feat/mysql-schema-skeleton` @ **`df12a054`**（亲验 `git log -1`）
**性质**：只读审 + 零成本本地 prove 亲跑（离线零模型键）· **零 live** · **零真消耗** · `MODEL_API_KEY` shell unset · `.env` 存在但**内容未读未印**（纪律面）· **零码面改动**（本档为唯一新增）
**Pins 原值**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **`g7SuiteGreen=false`**（本探针零翻转）· `actualSpendCny=null`（本刀零外呼）· r1Closed=false
**硬钉**：本探针任何 EXIT 读数 **≠ covered ≠ suite green ≠ 修复**；红读数=**差距登记**，非裁决；修复归各刀线。⛔push · alone≠dual

---

## 1. G7 套件定义盘点（判定面）

### 1.1 g7SuiteGreen 翻转条件（SSOT）

| 判定面 | 位置 | 现值 |
|--------|------|------|
| `g7SuiteGreen=false` 保持**至**：**trio 三条全绿 + post-run dual BOTH PASS + 协调方 nail**（缺一不翻转；单条绿 ≠ trio 绿；trio 绿 ≠ suite green——G6 OPEN / R5-MARKED-RED / Disclosure-1 OPEN 独立核算） | `ai-docs/delivery/g7-trio-keyed-fresh-run.slice.md:11` | **false**（retained） |
| G7 硬闸：生效=门禁条款强制；**≠** 全套已跑通 / suite green；suite=`post_suite_dual_pass`（honesty only）；tip **45×EXIT0 + 3×Key-blocked ≠ suite green** | `ai-docs/delivery/north-star-hard-gates.md` §G7（:143-176）· `north-star-ha.md:72` | policy 已生效 · suite honesty-only |
| Suite inventory SSOT（48 行冻结表） | `harness/local-full-suite-verification.md` §4 | 2026-09-17 收据：**45×0 / 0×nonzero / 3×Key-blocked** |
| Trio 三键（Key-blocked 三条 · Key-set 时代 1/1/1） | `g7-key-live-x3.slice.md`（2026-09-16 Key set · EXIT **1/1/1**）· freetier 再证 `receipts/g7-key-x3-freetieronly-reprove/2026-09-23-…json`（trio 仍 **1/1/1**） | **全红（带 Key 时代）** |
| E2RG 解冻 | `79aeb04b`（e2e:isolated 解冻条件已满足·live 跑归协调方排程） | **解冻条件已满足 · 未排程** |

### 1.2 G7 全套 = 哪些键

- **Trio（绿面最终闸 · 需真 Key）**：`pnpm e2e:isolated` · `pnpm e2e:ui:isolated` · `pnpm verify:e2e-performance`。
- **48 行本地全量清单**（2026-09-17 收据 §4 · 离线为主）：neg/uc/R2/R4/privacy/scor/wakeup/HA 四族，见 §2 本探针亲跑对照。
- **verify:e2e-performance 内嵌链**（`scripts/run-e2e-performance-suite.mjs` steps，fail-fast）：web build → migrate → **e2e:isolated** → **e2e:ui:isolated** → web:prove → resume-extract → rag-chunking → performance:e2e:isolated → api:validate → **neg:all** → **turn-idempotency** → **stress** → window → memory → voice → adaptive-latency → **scoring-integrity** → scoring-golden → vectorstore → rag-generation（→ …）。

---

## 2. 离线零模型键实测 EXIT 全账（本探针亲跑 · 52 键 · 2026-10-10）

> 跑法：wrapper 键 `pnpm <key>`（经 `run-e2e-isolated` 隔离库）；`:raw` 直跑缺 DB 注入的红**不计红**（非产品红，标注 N/A-run-shape）。日志存 `/tmp/g7probe-*.log`（探针会话外不持久，读数已全录本档）。

### 2.1 绿（EXIT=0 · 30 键）

| 键 | 实测 | 备注 |
|----|------|------|
| `neg:commerce` | 0 | 84 条全绿 |
| `neg:resume` | 0 | 91 条全绿 |
| `neg:interview` | 0 | **97 条全绿**（历史值 97 逐位吻合） |
| `neg:bend` | 0 | **157 条全绿** |
| `interview:prove` | 0 | **54 PASS / 0 FAIL**（a03b9371 重复 import base 红已被 6799544f 热修清零；v64 链全通） |
| `entpay:s2:preverify` | 0 | 0-c 闸 12 格留痕·形状A 全六件 PASS |
| `entpay:s2:prove` | 0 | 28 条全绿 |
| `uc011:report-refund:prove` / `:http:prove` | 0 / 0 | R1-R4 · 52/52 |
| `uc019:report-regenerate:prove` / `:http:prove` | 0 / 0 | 28 · 35/35 |
| `report:prove`（bulkhead） | 0 | :76 翻转后全通过 |
| `consent-min:prove` | 0 | 19 条全绿 |
| `commerce:prove` / `commerce-reconcile:prove` | 0 / 0 | 全通过（fence-reflow 拆分后） |
| `tenant-wiring-neg:prove` | 0 | — |
| `uc018:abandon:prove` / `:http:prove` | 0 / 0 | 46 条全绿（entpay s2 B端 abandon 泄漏回归面**绿**） |
| `e2e-helpers:prove` | 0 | 28 scenarios（E2RG C2 面绿） |
| `uc002:lease:prove` / `uc002:http:prove` | 0 / 0 | — |
| `uc003` / `uc010` / `uc015` / `uc027` | 0 | — |
| `uc031-032` / `uc033` / `uc040-043` | 0 | — |
| `uc017:orphan:prove` | 0 | — |
| `privacy-erasure:http:prove` | 0 | DELETE=503 pin 仍在 |
| `scor-00:http:prove` / `scor-00-honesty:prove` | 0 / 0 | pgvector-legacy R5 green-risk 照旧 |
| `r2-classify-job-route-prereq:prove` | 0 | — |
| `mysql-stack:r4-domain-isolation:prove` | 0 | conn/static 面 |
| `ha-track:skeleton:prove` / `ha:probe:skeleton` / `ha-track:multi:prove` / `ha:probe:multi` | 0×4 | honesty-not-HA 照旧 |
| `worker-wakeup:prove` | 0 | — |
| `uc001:live-blocked:prove` | 0 | blocked honesty |
| `api:validate` / `migrate:prove` | 0 / 0 | perf 套件步骤 |
| `window:prove` / `resume-extract:prove` / `rag-chunking:prove` / `scoring-golden:prove` | 0 | perf 套件步骤 |
| `memory:prove` / `vectorstore:prove` / `rag-generation:prove` / `web:prove` | 0 | perf 套件步骤（后三者 R5-MARKED-RED 面照旧） |
| `voice:prove` / `adaptive-latency:prove`（经 runner `node scripts/run-e2e-isolated.mjs <t>`） | 0 / 0 | 直跑（`pnpm -C apps/worker`）缺 DB 注入=run-shape，非红 |

### 2.2 红（EXIT=1 · 22 键 · 六类根因）

**类① 产品面落地 vs 诚实/gap 钉漂移（proof 钉旧字面 · 产品合法演进）**

| 键 | EXIT | 失败面 | 根因锚点 |
|----|------|--------|----------|
| `uc004:career-path:prove` | 1 | 3 FAIL：graph 必须只 derive / 禁 career-path graph 文件 / gap 拒绝 EXIT=0 | career-path graph（`career-path.ts`）+ GrowthTimeline 写面已落（growth 线）；proof 仍钉「无 graph」 |
| `uc025:stale-quiz-expiry:prove` | 1 | S1 begin 签名钉 | `interview.controller.ts:27` begin 现带 `quiz-id`+`target-role` 头（role-input S1 `e0208e9f`）；proof 钉「resume-id only」 |
| `uc028:trace-fail-open:prove` | 1 | S2 persistTrace 已耦合进 settle 区 · gap 拒绝 EXIT=0 | trace 落账产品面已 wire（trace/billing 线）；mark-red 钉过期 |
| `neg:auth` | 1 | **3/81**：deactivate 后 DB status / 原令牌失效 401 / 再登录 401 三断言 | `profile.controller.ts:43-47` deactivate 现要求 `password` body（UNSTUB-ERASE rev2 受理制）→ 裸 POST 得 400，fixture 未随演 |
| `neg:input` | 1 | **3/135**（真 500）：`GET /interview?status='…` · `POST /interview/:id/questions/0/feedback`（XSS comment）· `POST …/learning-plan/complete`（XSS topic） | 三端点 5xx——nocrash 面真红（嫌疑：status 查询枚举校验抛 500 / feedback·learning 写路径对特殊串 500；归 interview 模块线） |
| `turn-idempotency:prove` | 1 | 3 FAIL：并发重发受理 / 队列仅 1 answer job / ledger 首答 identity | answer job 去重面与现实现漂移 |
| `scoring-integrity:prove` | 1 | `TypeError: Cannot convert undefined or null to object`（同题 clarify 评分耦合断言处） | 图/评分耦合面驱动即崩 |
| `stress:prove` | 1 | **0 次评估 / 会话 0k 字**（图未驱动） | 真图驱动链断（与 scoring-integrity 同嫌疑区） |
| `recruiter:prove` | 1 | fixture setup 被 RAISE `interview_event_raw_answer_fenced` | `recruiter-depth.proof.ts:42` 直插 raw answer payload，撞 `enforce_interview_event_no_raw_answer()`（db-trigfam/fence 族落地后未随演） |

**类② receipt-gate ENOENT（DIR-B2 域移动后 runner watch 清单 10 条旧扁平路径失效）**

机械 1:1 搬移映射已全数定位：`int-transcript-projection→transcript/` · `memory-governance→memory/` · `privacy-authorization→privacy/` · `recruiter→recruiting/` · `commerce→commerce/` · `job-route-decision→routing/` · `interview-jobs→interview/` · `candidate-route→routing/` · `report→report/` · `resume→resume/`（均在 `packages/db/src/` 下）。

| 键 | EXIT | 断言面 | ENOENT 指向 |
|----|------|--------|-------------|
| `report-retry:prove` | 1 | 25 PASS 后 `✗ missing packages/db/src/report.ts` | `run-e2e-isolated.mjs:851` |
| `report-retry:http:prove` | 1 | **38/38 全绿**仍 EXIT=1（receipt 门杀） | 同上（commerce.ts） |
| `g7fix4:finalize:prove` | 1 | 断言全通过仍 EXIT=1 | `:456-458`（recruiter/commerce/job-route-decision） |
| `role-input:prove` | 1 | 断言全通过仍 EXIT=1 | interview-jobs/candidate-route |
| `unstube-erase:prove` | 1 | receipt 门杀 | int-transcript-projection 等 |

**类③ 迁移链头钉漂移**

| 键 | EXIT | 失败面 | 根因 |
|----|------|--------|------|
| `entpay:s1:prove` | 1 | 1/48：S1-0 真迁移链 | `enterprise-pay-s1.proof.ts:47` 钉 `last==='0156_enterprise_bucket_billing'`；片2 EXEC `5ff5f96d` 已落 `0157_billing_payer_route`（applied=159/159·幂等重跑 0/159 本身**绿**，仅链头钉陈旧） |

**类④ 文档钉漂移（R4 状态 SSOT 演进后 honesty proof 仍锚旧字面）**

`harness/r4-domain-isolation-status.md` 现文含 `domainIsolationClosed=true under authorize`（EG3 产品面授权关闭），字面 `题域隔离 NOT closed` 命中 **0**；下列 5 proof 仍 `/题域隔离 NOT closed/.test(statusDoc)`：

| 键 | EXIT | FAIL 数 |
|----|------|---------|
| `g-r2-5-retrieve-fail-closed:prove` | 1 | 1 |
| `g4-dispatch-recheck-prereq:prove` | 1 | 2 |
| `r4-real-wire-impl:prove` | 1 | 2 |
| `r4-p-planner-unit:prove` | 1 | 1 |
| `r4-wrong-track-adv:prove` | 1 | 2 |

**类⑤ env-shape / prereq（非码红 · 排程前置件）**

| 键 | EXIT | 事实 |
|----|------|------|
| `worker-wakeup-redis:prove` | 1 | `redis-cli` ENOENT + 容器 `meetwise-redis-mysql-local` 不在（sole-stack compose 未起）；跑前须 `docker compose -f docker/compose.mysql-local.yml up -d` |
| `g6-e2e-iso-blocked:prove` | 1 | 行为探针假设**无 `.env`**：本机 `.env` 存在（内容未读），`run-e2e.mjs:20-26` 会从 `.env` 灌 `MODEL_API_KEY` → Key 闸放行 → 探针 20s 超时 status=null。**「Key-unset blocked」诚实叙事在本机形态下已不可复现**（类⑥ 语义漂移：Key 常在） |

**账**：52 亲跑 = **30 绿 / 22 红**（红中 5 键断言面本身全绿、纯 receipt-gate 杀；3 键 env/prereq 类；真产品/钉红 14 键）。

---

## 3. live 依赖键清单 + 量级估算（供排程）

| 键 | Key 消耗点 | 场景规模 | 模型调用估算 |
|----|-----------|----------|--------------|
| `pnpm e2e:isolated`（`run-e2e.mjs` → `e2e/full.e2e.ts`） | 全链真模型：planner/turn 评分/report/assessment/career | **70 A() 断言 · 7 场面试 begin**；每场 ≈ planner 1 + 每轮评分 ~3-6 + report 1 + assessment/career 1-3 | **~40-70 calls**（freetier-only 受限实measured **25 calls** · qwen3.8-flash · in 13,579 / out 8,833 tok · ¥5 账本闸） |
| `pnpm e2e:ui:isolated`（`run-e2e-ui.mjs` → playwright chromium） | 浏览器流真面试 | chromium-1228 **已在位**（旧「chromium missing」prereq 已解）；UI 面试流 + 报告页 | ~20-50 calls（量级同上低配） |
| `pnpm verify:e2e-performance`（~20 步 fail-fast） | 内嵌上两键 + burst/stress/window/voice/adaptive-latency 等 | 三键合一 + 压力面 | **~150-400 calls**（全量 unrestricted 估算；含 UI 重复计） |

**排程含义**：① verify 套件 fail-fast 且**内嵌 4 个离线红步骤**（neg:all→neg:auth/neg:input · turn-idempotency · stress · scoring-integrity）——**不先修离线红，live 跑 verify 必在 `API negative paths` 步（第 10 步）前功尽弃**，白烧前 9 步的 live 消耗；② freetier-only 模式（`G7_FREETIER_REPROVE=1` + ¥5 账本 + embed/rerank/asr/tts 硬禁）是低成本先行档，已有 2026-09-23 先例收据范式；③ 本机 `.env` 带 Key（存在性实证·内容未读）→ **「Key unset blocked」时代已结束，任何 live 命令本机即可真消耗**，探针席全程未触 trio。

---

## 4. 解冻后绿面推演（E2RG 已落 + P0 四链全通后 · live 跑一次还会暴露什么）

**背景**：`79aeb04b` 判「e2e:isolated 解冻条件已满足」；`df12a054` 宣 P0 四链全通。但主线今日落卷的 11 刀（entpay 片1/片2·E2RG·fence-reflow·consent-min·role-input·sse-resilience·report-retry·DIR-B2 域移动·B110 审核制·score-s2 重复 import 热修·trial-grant）的**交叉回归面在本探针离线层已现形 22 红**（§2.2）——live 层只会更宽：

- `e2e/full.e2e.ts` 首次真跑 E2RG C3 新链（recruiter1 pending→403 `recruiter_pending_review`→admin approve→200）+ `seedAdmin` fail-closed bootstrap（`:148-168`）——**该链从未在 live 下行使**；
- begin 现带 `quiz-id`+`target-role` 头 + candidate-route 供给（G7S fail-closed：裸 fixture 曾 409 `candidate_route_undecided`，`receipts/report-retry/2026-10-10-exec-prove.md` §5-2 已在离线层复现过）；
- entpay 0157 扣费路由进 B 端 begin→结算链 + fence-reflow 对账拆分 + SSE 韧性长退避——全在 full.e2e 主链上。

**点名最可能红的 3 个键**（按概率降序）：

1. **`pnpm e2e:isolated`** —— 主链横穿全部 11 刀产品面；E2RG 活契约（审批分码/admin approve）+ candidate-route fail-closed 供给 + 0157 扣费路由三新面均系**首次 live 行使**；离线层已见同区 500/409 现形（neg:input 3×500、G7S 409 前科）。
2. **`pnpm verify:e2e-performance`** —— 结构性必红：fail-fast 链内嵌 **4 个离线红步骤**（§3-①）；即便 live 面全绿也过不了 `API negative paths` 步。
3. **`pnpm e2e:ui:isolated`** —— 浏览器驱动跨同一产品面 + 报告页 retry 新文案/`attempts` 字段（report-retry D2-④）+ SSE 韧性行为变更（退避/草稿 sessionStorage/停转不重连）+ recruiter pending-403 新分支；UI driver 断言对流程形变最脆（g7fix1-5 五连修史）。

---

## 5. 建议排程序（live 前置 · 全为零成本离线修复面）

1. **先修 receipt-gate ENOENT 五键**（类②·纯机械）：`run-e2e-isolated.mjs` 10 条 watch 路径改域目录（映射见 §2.2 类②）→ `report-retry:prove/:http` · `g7fix4:finalize:prove` · `role-input:prove` · `unstube-erase:prove` 五键预期即刻翻绿（其中三键断言面已实测全绿）。
2. **再修链头/签名/文档钉漂移**（类①③④）：entpay:s1 `:47` 钉改 0157（或参数化 last）；uc025 begin 签名钉随演；neg:auth deactivate 面补 password body；uc004/uc028 gap 钉转产品面证明（归各原刀线裁定，**非探针席越权**）；R4 族 5 proof 的 status 锚改锚现 SSOT 措辞（或钉 `domainIsolationClosed` 授权行）。
3. **真产品红独立开刀**：neg:input 3×500（interview 模块）、turn-idempotency 3 断言、scoring-integrity TypeError / stress 0-评估（图驱动链）、recruiter fixture 撞围栏。
4. **prereq 件**：起 `docker compose -f docker/compose.mysql-local.yml`（worker-wakeup-redis 需 redis 容器）；g6-e2e-iso-blocked 行为探针在「本机有 `.env`」形态下需重裁定（Key-unset 叙事不可复现≠诚实破损，需显式登记）。
5. **然后才排 live**：先 freetier-only 档三键（¥5 账本范式 · 实测 25 calls 级）→ 再全量 trio。est live 全量 ≈ 150-400 calls / freetier 档 ≈ 25-50 calls。

---

## 6. Non-claims

- 本档 = **差距盘点**，非修复、非裁决、非 suite green 宣称；任何绿读数 ≠ covered ≠ G7 收据。
- 22 红均**如实登记原值**，未 retry-to-green、未改任何断言、未动码面。
- `g7SuiteGreen=false` · trio 1/1/1（Key 时代）· G6 OPEN · R5-MARKED-RED · Disclosure-1 OPEN 全部 retained。
- 本探针零 live / 零真消耗 / 零 `.env` 内容接触 / `actualSpendCny=null` · est live=0。
- 实现方禁止自批；翻转 `g7SuiteGreen` 仍须 trio 三绿 + post-run dual BOTH PASS + 协调方 nail。

---

*Harness · G7 green-gap probe · 2026-10-10 · base df12a054 · 52 offline keys亲跑 30绿/22红 · trio Key-blocked→Key 时代 1/1/1 retained · g7SuiteGreen=false · releaseEvidence=false · est live=0 · ⛔push · alone≠dual*
